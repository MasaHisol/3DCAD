// Motion study helpers (Inventor ダイナミック シミュレーション light, kinematic
// only): finite-difference velocity / acceleration of a tracked point and the
// minimum clearance between triangle meshes.

export type P3 = [number, number, number];

export interface MotionSample {
  t: number;
  p: P3;
}

export interface Kinematics {
  t: number[];
  /** Displacement from the first sample (mm). */
  disp: number[];
  /** Speed (mm/s). */
  vel: number[];
  /** Acceleration magnitude (mm/s²). */
  acc: number[];
}

/** Central differences (one-sided at the ends) on a possibly uneven time grid. */
export function kinematics(s: MotionSample[]): Kinematics {
  const n = s.length;
  const t = s.map((x) => x.t);
  const disp = s.map((x) => Math.hypot(x.p[0] - s[0].p[0], x.p[1] - s[0].p[1], x.p[2] - s[0].p[2]));
  const d = (a: number, b: number): P3 => {
    const dt = s[b].t - s[a].t || 1e-12;
    return [0, 1, 2].map((k) => (s[b].p[k] - s[a].p[k]) / dt) as P3;
  };
  const v: P3[] = s.map((_, i) => (n < 2 ? [0, 0, 0] : i === 0 ? d(0, 1) : i === n - 1 ? d(n - 2, n - 1) : d(i - 1, i + 1)));
  const a: P3[] = s.map((_, i) => {
    if (n < 3) return [0, 0, 0];
    const lo = i === 0 ? 0 : i === n - 1 ? n - 2 : i - 1;
    const hi = i === 0 ? 1 : i === n - 1 ? n - 1 : i + 1;
    const dt = s[hi].t - s[lo].t || 1e-12;
    return [0, 1, 2].map((k) => (v[hi][k] - v[lo][k]) / dt) as P3;
  });
  return { t, disp, vel: v.map((x) => Math.hypot(...x)), acc: a.map((x) => Math.hypot(...x)) };
}

export interface TriSet {
  pos: Float32Array;
  idx: Uint32Array;
  min: P3;
  max: P3;
}

export function triSet(pos: Float32Array, idx: Uint32Array): TriSet {
  const min: P3 = [Infinity, Infinity, Infinity], max: P3 = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < pos.length; i += 3)
    for (let k = 0; k < 3; k++) {
      min[k] = Math.min(min[k], pos[i + k]);
      max[k] = Math.max(max[k], pos[i + k]);
    }
  return { pos, idx, min, max };
}

/** Squared distance point → triangle (Ericson, Real-Time Collision Detection 5.1.5). */
function pointTri(px: number, py: number, pz: number, P: Float32Array, i0: number, i1: number, i2: number): number {
  const ax = P[i0], ay = P[i0 + 1], az = P[i0 + 2];
  const abx = P[i1] - ax, aby = P[i1 + 1] - ay, abz = P[i1 + 2] - az;
  const acx = P[i2] - ax, acy = P[i2 + 1] - ay, acz = P[i2 + 2] - az;
  const apx = px - ax, apy = py - ay, apz = pz - az;
  const d1 = abx * apx + aby * apy + abz * apz, d2 = acx * apx + acy * apy + acz * apz;
  let qx: number, qy: number, qz: number;
  const set = (u: number, w: number) => {
    qx = ax + u * abx + w * acx;
    qy = ay + u * aby + w * acy;
    qz = az + u * abz + w * acz;
  };
  if (d1 <= 0 && d2 <= 0) set(0, 0);
  else {
    const bpx = px - P[i1], bpy = py - P[i1 + 1], bpz = pz - P[i1 + 2];
    const d3 = abx * bpx + aby * bpy + abz * bpz, d4 = acx * bpx + acy * bpy + acz * bpz;
    const cpx = px - P[i2], cpy = py - P[i2 + 1], cpz = pz - P[i2 + 2];
    const d5 = abx * cpx + aby * cpy + abz * cpz, d6 = acx * cpx + acy * cpy + acz * cpz;
    const vc = d1 * d4 - d3 * d2, vb = d5 * d2 - d1 * d6, va = d3 * d6 - d5 * d4;
    if (d3 >= 0 && d4 <= d3) set(1, 0);
    else if (d6 >= 0 && d5 <= d6) set(0, 1);
    else if (vc <= 0 && d1 >= 0 && d3 <= 0) set(d1 / (d1 - d3), 0);
    else if (vb <= 0 && d2 >= 0 && d6 <= 0) set(0, d2 / (d2 - d6));
    else if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0) {
      const w = (d4 - d3) / (d4 - d3 + (d5 - d6));
      set(1 - w, w);
    } else {
      const den = 1 / (va + vb + vc);
      set(vb * den, vc * den);
    }
  }
  return (px - qx!) ** 2 + (py - qy!) ** 2 + (pz - qz!) ** 2;
}

function oneWay(A: TriSet, B: TriSet, best: number, maxPts: number): number {
  const nv = A.pos.length / 3;
  const stride = Math.max(1, Math.floor(nv / maxPts));
  for (let v = 0; v < nv; v += stride) {
    const px = A.pos[v * 3], py = A.pos[v * 3 + 1], pz = A.pos[v * 3 + 2];
    // box distance prune
    const bx = Math.max(B.min[0] - px, 0, px - B.max[0]), by = Math.max(B.min[1] - py, 0, py - B.max[1]), bz = Math.max(B.min[2] - pz, 0, pz - B.max[2]);
    if (bx * bx + by * by + bz * bz >= best) continue;
    for (let t = 0; t < B.idx.length; t += 3) {
      const d = pointTri(px, py, pz, B.pos, B.idx[t] * 3, B.idx[t + 1] * 3, B.idx[t + 2] * 3);
      if (d < best) best = d;
    }
  }
  return best;
}

/**
 * Minimum distance between two triangle meshes (vertex ↔ triangle both ways,
 * vertices sub-sampled to `maxPts`). 0 when the boxes overlap and a vertex
 * touches; penetration is not detected here (use the interference check).
 */
export function minDistance(A: TriSet, B: TriSet, maxPts = 1500): number {
  let gap = 0;
  for (let k = 0; k < 3; k++) gap += Math.max(0, A.min[k] - B.max[k], B.min[k] - A.max[k]) ** 2;
  let best = Infinity;
  best = oneWay(A, B, best, maxPts);
  best = oneWay(B, A, best, maxPts);
  return Math.sqrt(Math.max(best, gap));
}
