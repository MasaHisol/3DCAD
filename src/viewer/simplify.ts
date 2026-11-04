// Coarse display mesh for distant instances (LOD): vertex clustering on a
// uniform grid — vertices in one cell merge, collapsed triangles disappear.
// Pure arrays (no THREE) so it is unit-testable.

export interface SimpleMesh {
  positions: Float32Array;
  normals: Float32Array;
  indices: Uint32Array;
}

/**
 * Simplifies an indexed triangle mesh by clustering vertices into a grid of
 * `cells` cells along the longest bounding-box side. Vertices whose normals
 * differ strongly stay separate (keeps sharp CAD edges reasonably crisp).
 */
export function clusterSimplify(positions: ArrayLike<number>, normals: ArrayLike<number>, indices: ArrayLike<number>, cells = 12): SimpleMesh {
  const n = Math.floor(positions.length / 3);
  const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < n; i++)
    for (let k = 0; k < 3; k++) {
      const v = positions[i * 3 + k];
      if (v < lo[k]) lo[k] = v;
      if (v > hi[k]) hi[k] = v;
    }
  const size = Math.max(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2], 1e-9) / Math.max(1, cells);
  // normal bucket: dominant axis and sign (6 directions)
  const bucket = (i: number) => {
    const x = normals[i * 3], y = normals[i * 3 + 1], z = normals[i * 3 + 2];
    const ax = Math.abs(x), ay = Math.abs(y), az = Math.abs(z);
    return ax >= ay && ax >= az ? (x >= 0 ? 0 : 1) : ay >= az ? (y >= 0 ? 2 : 3) : z >= 0 ? 4 : 5;
  };
  const cellOf = new Map<string, number>();
  const remap = new Uint32Array(n);
  const sum: number[] = [], nsum: number[] = [], cnt: number[] = [];
  for (let i = 0; i < n; i++) {
    const key = `${Math.floor((positions[i * 3] - lo[0]) / size)},${Math.floor((positions[i * 3 + 1] - lo[1]) / size)},${Math.floor((positions[i * 3 + 2] - lo[2]) / size)},${bucket(i)}`;
    let c = cellOf.get(key);
    if (c === undefined) {
      c = cnt.length;
      cellOf.set(key, c);
      sum.push(0, 0, 0);
      nsum.push(0, 0, 0);
      cnt.push(0);
    }
    remap[i] = c;
    cnt[c]++;
    for (let k = 0; k < 3; k++) {
      sum[c * 3 + k] += positions[i * 3 + k];
      nsum[c * 3 + k] += normals[i * 3 + k];
    }
  }
  const m = cnt.length;
  const pos = new Float32Array(m * 3), nor = new Float32Array(m * 3);
  for (let c = 0; c < m; c++) {
    const l = Math.hypot(nsum[c * 3], nsum[c * 3 + 1], nsum[c * 3 + 2]) || 1;
    for (let k = 0; k < 3; k++) {
      pos[c * 3 + k] = sum[c * 3 + k] / cnt[c];
      nor[c * 3 + k] = nsum[c * 3 + k] / l;
    }
  }
  const out: number[] = [];
  const seen = new Set<string>();
  for (let t = 0; t + 2 < indices.length; t += 3) {
    const a = remap[indices[t]], b = remap[indices[t + 1]], c = remap[indices[t + 2]];
    if (a === b || b === c || a === c) continue;
    const key = a < b && a < c ? `${a},${b},${c}` : b < c ? `${b},${c},${a}` : `${c},${a},${b}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(a, b, c);
  }
  return { positions: pos, normals: nor, indices: Uint32Array.from(out) };
}

/**
 * Edge polylines (`ranges` = pairs of start vertex / vertex count into
 * `points`) reduced to at most `maxPts` points each, as line-segment pairs.
 * Used for the edges of distant instances.
 */
export function decimateEdges(points: ArrayLike<number>, ranges: ArrayLike<number>, maxPts = 6): Float32Array {
  const out: number[] = [];
  for (let e = 0; e + 1 < ranges.length; e += 2) {
    const s = ranges[e], n = ranges[e + 1];
    if (n < 2) continue;
    const m = Math.max(2, Math.min(n, maxPts));
    let prev = s;
    for (let k = 1; k < m; k++) {
      const cur = s + Math.round((k * (n - 1)) / (m - 1));
      out.push(points[prev * 3], points[prev * 3 + 1], points[prev * 3 + 2], points[cur * 3], points[cur * 3 + 1], points[cur * 3 + 2]);
      prev = cur;
    }
  }
  return Float32Array.from(out);
}
