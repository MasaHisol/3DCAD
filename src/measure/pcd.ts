// Pitch circle (PCD) fit of hole / cylinder centres: least-squares circle in the
// plane normal to the (common) axis, angular positions, spacing and deviations.
// Pure math, no kernel.

import type { Vec3 } from "../core/types";

const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a: Vec3, s: number): Vec3 => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = (a: Vec3): Vec3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};

export interface PcdResult {
  center: Vec3;
  normal: Vec3;
  diameter: number;
  /** Angular position of each input point (deg, 0..360, counter-clockwise about `normal`, from the first point). */
  angles: number[];
  /** Angle from each point (sorted by angle) to the next one (deg). */
  spacing: number[];
  /** Largest radial deviation of a point from the fitted circle (mm). */
  radialDeviation: number;
  /** Largest deviation of the spacing from an even 360/n division (deg). */
  angularDeviation: number;
  /** Largest positional deviation from the ideal even pattern (mm). */
  positionDeviation: number;
}

/** Normal of the best-fit plane through the points (smallest eigenvector of the covariance). */
function fitNormal(pts: Vec3[], c: Vec3): Vec3 {
  const m = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  for (const p of pts) {
    const d = sub(p, c);
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) m[i * 3 + j] += d[i] * d[j];
  }
  // smallest eigenvector = largest of (tr*I - M) by power iteration
  const tr = m[0] + m[4] + m[8] + 1e-12;
  const a = m.map((v, k) => (k % 4 === 0 ? tr - v : -v));
  let v: Vec3 = [0.31, 0.47, 0.83];
  for (let it = 0; it < 200; it++) v = unit([a[0] * v[0] + a[1] * v[1] + a[2] * v[2], a[3] * v[0] + a[4] * v[1] + a[5] * v[2], a[6] * v[0] + a[7] * v[1] + a[8] * v[2]]);
  return v;
}

/**
 * Fit a pitch circle through hole centres. `normal` (e.g. the common hole axis)
 * fixes the plane; otherwise the best-fit plane is used (needs >= 3 points).
 */
export function fitPitchCircle(points: Vec3[], normal?: Vec3): PcdResult {
  if (points.length < 3) throw new Error("ピッチ円には 3 つ以上の穴が必要です");
  const n0 = points.length;
  const g = mul(points.reduce(add, [0, 0, 0] as Vec3), 1 / n0);
  const n = normal ? unit(normal) : fitNormal(points, g);
  const ref = Math.abs(n[0]) < 0.9 ? ([1, 0, 0] as Vec3) : ([0, 1, 0] as Vec3);
  const ex = unit(sub(ref, mul(n, dot(ref, n))));
  const ey = cross(n, ex);
  const uv = points.map((p) => {
    const d = sub(p, g);
    return [dot(d, ex), dot(d, ey)] as [number, number];
  });
  // algebraic (Kasa) fit: x² + y² + D x + E y + F = 0
  let sxx = 0, sxy = 0, syy = 0, sx = 0, sy = 0, sxz = 0, syz = 0, sz = 0;
  for (const [x, y] of uv) {
    const z = x * x + y * y;
    sxx += x * x; sxy += x * y; syy += y * y; sx += x; sy += y; sxz += x * z; syz += y * z; sz += z;
  }
  const A = [
    [sxx, sxy, sx],
    [sxy, syy, sy],
    [sx, sy, n0],
  ];
  const B = [-sxz, -syz, -sz];
  const sol = solve3(A, B);
  let cx = -sol[0] / 2, cy = -sol[1] / 2;
  let r = Math.sqrt(Math.max(0, cx * cx + cy * cy - sol[2]));
  // geometric refinement (Gauss-Newton on the radial residuals)
  for (let it = 0; it < 30; it++) {
    const J: number[][] = [], res: number[] = [];
    for (const [x, y] of uv) {
      const dx = x - cx, dy = y - cy, d = Math.hypot(dx, dy) || 1e-12;
      J.push([-dx / d, -dy / d, -1]);
      res.push(d - r);
    }
    const JtJ = [0, 1, 2].map((i) => [0, 1, 2].map((j) => J.reduce((s, row) => s + row[i] * row[j], 0)));
    const Jtr = [0, 1, 2].map((i) => -J.reduce((s, row, k) => s + row[i] * res[k], 0));
    const dlt = solve3(JtJ, Jtr);
    cx += dlt[0]; cy += dlt[1]; r += dlt[2];
    if (Math.hypot(dlt[0], dlt[1], dlt[2]) < 1e-12) break;
  }
  const center = add(g, add(mul(ex, cx), mul(ey, cy)));
  const ang = uv.map(([x, y]) => Math.atan2(y - cy, x - cx));
  const a0 = ang[0];
  const angles = ang.map((a) => {
    let d = ((a - a0) * 180) / Math.PI;
    while (d < 0) d += 360;
    while (d >= 360) d -= 360;
    return d;
  });
  const sorted = [...angles].sort((a, b) => a - b);
  const spacing = sorted.map((a, i) => (i + 1 < sorted.length ? sorted[i + 1] - a : 360 - a + sorted[0]));
  const even = 360 / n0;
  const angularDeviation = Math.max(...spacing.map((s) => Math.abs(s - even)));
  const radialDeviation = Math.max(...uv.map(([x, y]) => Math.abs(Math.hypot(x - cx, y - cy) - r)));
  // best rotation of the even pattern (mean angular offset) -> positional deviation
  const offs = sorted.map((a, i) => a - i * even);
  const mo = offs.reduce((s, v) => s + v, 0) / offs.length;
  const positionDeviation = Math.max(
    ...sorted.map((a, i) => {
      const ideal = ((mo + i * even) * Math.PI) / 180;
      const actual = (a * Math.PI) / 180;
      return 2 * r * Math.abs(Math.sin((actual - ideal) / 2));
    }),
    radialDeviation,
  );
  return { center, normal: n, diameter: 2 * r, angles, spacing, radialDeviation, angularDeviation, positionDeviation };
}

function solve3(A: number[][], b: number[]): number[] {
  const m = A.map((row, i) => [...row, b[i]]);
  for (let c = 0; c < 3; c++) {
    let p = c;
    for (let r = c + 1; r < 3; r++) if (Math.abs(m[r][c]) > Math.abs(m[p][c])) p = r;
    [m[c], m[p]] = [m[p], m[c]];
    const d = m[c][c];
    if (Math.abs(d) < 1e-300) return [0, 0, 0];
    for (let r = 0; r < 3; r++) {
      if (r === c) continue;
      const f = m[r][c] / d;
      for (let k = c; k < 4; k++) m[r][k] -= f * m[c][k];
    }
  }
  return [m[0][3] / m[0][0], m[1][3] / m[1][1], m[2][3] / m[2][2]];
}
