// 3D-print (additive manufacturing) checks on the display meshes:
// overhangs that need support, thin walls, open / non-manifold edges.

export interface PrintCheckOptions {
  /** Build direction axis (0 = X, 1 = Y, 2 = Z), positive. */
  up: 0 | 1 | 2;
  /** Overhang limit from horizontal-down (deg); faces steeper than this are fine (typ. 45°). */
  overhang: number;
  /** Minimum printable wall thickness (mm). */
  minWall: number;
}

export interface PrintCheckResult {
  /** Per body: per-vertex RGB colours (overhang red, thin orange, OK grey). */
  colors: Float32Array[];
  overhangArea: number;
  thinArea: number;
  /** Thinnest wall found below 3× minWall (mm), or null. */
  thinnest: number | null;
  openEdges: number;
  nonManifoldEdges: number;
  totalArea: number;
  height: number;
  footprint: [number, number];
}

type Mesh = { positions: Float32Array; indices: Uint32Array };

/** Ray (o, d) – triangle intersection distance (Möller–Trumbore), or -1. */
function rayTri(o: number[], d: number[], P: Float32Array, a: number, b: number, c: number): number {
  const e1x = P[b] - P[a], e1y = P[b + 1] - P[a + 1], e1z = P[b + 2] - P[a + 2];
  const e2x = P[c] - P[a], e2y = P[c + 1] - P[a + 1], e2z = P[c + 2] - P[a + 2];
  const px = d[1] * e2z - d[2] * e2y, py = d[2] * e2x - d[0] * e2z, pz = d[0] * e2y - d[1] * e2x;
  const det = e1x * px + e1y * py + e1z * pz;
  if (Math.abs(det) < 1e-12) return -1;
  const inv = 1 / det;
  const tx = o[0] - P[a], ty = o[1] - P[a + 1], tz = o[2] - P[a + 2];
  const u = (tx * px + ty * py + tz * pz) * inv;
  if (u < -1e-9 || u > 1 + 1e-9) return -1;
  const qx = ty * e1z - tz * e1y, qy = tz * e1x - tx * e1z, qz = tx * e1y - ty * e1x;
  const v = (d[0] * qx + d[1] * qy + d[2] * qz) * inv;
  if (v < -1e-9 || u + v > 1 + 1e-9) return -1;
  return (e2x * qx + e2y * qy + e2z * qz) * inv;
}

export function printCheck(meshes: Mesh[], opt: PrintCheckOptions): PrintCheckResult {
  const up = opt.up;
  const cosLim = Math.sin((opt.overhang * Math.PI) / 180); // normal·(-up) above this → overhang
  const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  for (const m of meshes)
    for (let i = 0; i < m.positions.length; i += 3)
      for (let k = 0; k < 3; k++) {
        lo[k] = Math.min(lo[k], m.positions[i + k]);
        hi[k] = Math.max(hi[k], m.positions[i + k]);
      }
  const span = Math.max(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2], 1e-6);
  const plateTol = span * 1e-4;
  // triangle soup over all bodies + uniform grid for the wall-thickness rays
  const tris: { m: number; a: number; b: number; c: number }[] = [];
  meshes.forEach((m, mi) => {
    for (let t = 0; t < m.indices.length; t += 3) tris.push({ m: mi, a: m.indices[t] * 3, b: m.indices[t + 1] * 3, c: m.indices[t + 2] * 3 });
  });
  const reach = opt.minWall * 3;
  const cell = Math.max(reach, span / 64);
  const key = (x: number, y: number, z: number) => `${Math.floor((x - lo[0]) / cell)},${Math.floor((y - lo[1]) / cell)},${Math.floor((z - lo[2]) / cell)}`;
  const grid = new Map<string, number[]>();
  tris.forEach((t, ti) => {
    const P = meshes[t.m].positions;
    const mn = [0, 1, 2].map((k) => Math.min(P[t.a + k], P[t.b + k], P[t.c + k]));
    const mx = [0, 1, 2].map((k) => Math.max(P[t.a + k], P[t.b + k], P[t.c + k]));
    const i0 = mn.map((v, k) => Math.floor((v - lo[k]) / cell)), i1 = mx.map((v, k) => Math.floor((v - lo[k]) / cell));
    for (let i = i0[0]; i <= i1[0]; i++)
      for (let j = i0[1]; j <= i1[1]; j++)
        for (let k = i0[2]; k <= i1[2]; k++) {
          const s = `${i},${j},${k}`;
          let l = grid.get(s);
          if (!l) grid.set(s, (l = []));
          l.push(ti);
        }
  });
  const colors = meshes.map((m) => new Float32Array(m.positions.length).fill(0.72));
  let overhangArea = 0, thinArea = 0, totalArea = 0;
  let thinnest: number | null = null;
  const mark = (mi: number, t: { a: number; b: number; c: number }, rgb: number[], prio: number, prioArr: Uint8Array[]) => {
    for (const v of [t.a, t.b, t.c]) {
      if (prioArr[mi][v / 3] >= prio) continue;
      prioArr[mi][v / 3] = prio;
      colors[mi].set(rgb, v);
    }
  };
  const prio = meshes.map((m) => new Uint8Array(m.positions.length / 3));
  tris.forEach((t, ti) => {
    const P = meshes[t.m].positions;
    const ux = P[t.b] - P[t.a], uy = P[t.b + 1] - P[t.a + 1], uz = P[t.b + 2] - P[t.a + 2];
    const vx = P[t.c] - P[t.a], vy = P[t.c + 1] - P[t.a + 1], vz = P[t.c + 2] - P[t.a + 2];
    const n = [uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx];
    const l2 = Math.hypot(n[0], n[1], n[2]);
    if (l2 < 1e-14) return;
    const area = l2 / 2;
    totalArea += area;
    for (let k = 0; k < 3; k++) n[k] /= l2;
    // overhang: facing down more than the limit, not lying on the build plate
    const down = -n[up];
    const onPlate = Math.max(P[t.a + up], P[t.b + up], P[t.c + up]) - lo[up] < plateTol;
    if (down > cosLim && !onPlate) {
      overhangArea += area;
      mark(t.m, t, [0.9, 0.2, 0.2], 3, prio);
    }
    // wall thickness: ray from the centroid into the material
    const o = [0, 1, 2].map((k) => (P[t.a + k] + P[t.b + k] + P[t.c + k]) / 3 - n[k] * 1e-6 * span);
    const d = [-n[0], -n[1], -n[2]];
    const cand = new Set<number>();
    for (let s = 0; s <= reach + cell; s += cell / 2) {
      const l = grid.get(key(o[0] + d[0] * Math.min(s, reach), o[1] + d[1] * Math.min(s, reach), o[2] + d[2] * Math.min(s, reach)));
      if (l) for (const x of l) cand.add(x);
    }
    let best = Infinity;
    for (const ci of cand) {
      if (ci === ti) continue;
      const q = tris[ci];
      const h = rayTri(o, d, meshes[q.m].positions, q.a, q.b, q.c);
      if (h > 1e-6 * span && h < best) best = h;
    }
    if (best < reach) thinnest = thinnest === null ? best : Math.min(thinnest, best);
    if (best < opt.minWall) {
      thinArea += area;
      mark(t.m, t, [0.95, 0.6, 0.1], 2, prio);
    }
  });
  // open / non-manifold edges (vertices welded by position)
  let openEdges = 0, nonManifoldEdges = 0;
  meshes.forEach((m) => {
    const id = new Map<string, number>();
    const vid = (v: number) => {
      const k = `${m.positions[v * 3].toFixed(4)},${m.positions[v * 3 + 1].toFixed(4)},${m.positions[v * 3 + 2].toFixed(4)}`;
      let i = id.get(k);
      if (i === undefined) id.set(k, (i = id.size));
      return i;
    };
    const w = Array.from(m.indices, vid);
    const edges = new Map<string, number>();
    for (let t = 0; t < w.length; t += 3)
      for (let e = 0; e < 3; e++) {
        const a = w[t + e], b = w[t + ((e + 1) % 3)];
        if (a === b) continue;
        const k = a < b ? `${a}_${b}` : `${b}_${a}`;
        edges.set(k, (edges.get(k) ?? 0) + 1);
      }
    for (const c of edges.values()) {
      if (c === 1) openEdges++;
      else if (c > 2) nonManifoldEdges++;
    }
  });
  const others = [0, 1, 2].filter((k) => k !== up);
  return {
    colors,
    overhangArea,
    thinArea,
    thinnest,
    openEdges,
    nonManifoldEdges,
    totalArea,
    height: hi[up] - lo[up],
    footprint: [hi[others[0]] - lo[others[0]], hi[others[1]] - lo[others[1]]],
  };
}
