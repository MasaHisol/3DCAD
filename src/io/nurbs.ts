// Plain-data NURBS curves and surfaces shared by the IGES reader / writer and
// the kernel bridge (no OpenCascade dependency, so it runs in tests and the UI).

export type P3 = [number, number, number];

/** Rational B-spline curve. `knots` is the full (clamped) knot vector: poles + degree + 1 values. */
export interface NurbsCurve {
  degree: number;
  knots: number[];
  poles: P3[];
  /** Omitted when polynomial (all 1). */
  weights?: number[];
}

/** Rational B-spline surface; poles[i][j] with i along U, j along V. */
export interface NurbsSurface {
  degreeU: number;
  degreeV: number;
  knotsU: number[];
  knotsV: number[];
  poles: P3[][];
  weights?: number[][];
}

const add = (a: P3, b: P3): P3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: P3, b: P3): P3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a: P3, s: number): P3 => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a: P3, b: P3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: P3, b: P3): P3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a: P3): P3 => mul(a, 1 / (Math.hypot(a[0], a[1], a[2]) || 1));

/** Knot span index (The NURBS Book A2.1). */
function span(n: number, p: number, u: number, U: number[]): number {
  if (u >= U[n + 1]) return n;
  if (u <= U[p]) return p;
  let lo = p, hi = n + 1, mid = (lo + hi) >> 1;
  while (u < U[mid] || u >= U[mid + 1]) {
    if (u < U[mid]) hi = mid;
    else lo = mid;
    mid = (lo + hi) >> 1;
  }
  return mid;
}

/** Non-zero basis functions (A2.2). */
function basis(i: number, u: number, p: number, U: number[]): number[] {
  const N = [1], left = [0], right = [0];
  for (let j = 1; j <= p; j++) {
    left[j] = u - U[i + 1 - j];
    right[j] = U[i + j] - u;
    let saved = 0;
    for (let r = 0; r < j; r++) {
      const d = right[r + 1] + left[j - r];
      const tmp = d ? N[r] / d : 0;
      N[r] = saved + right[r + 1] * tmp;
      saved = left[j - r] * tmp;
    }
    N[j] = saved;
  }
  return N;
}

export function curveRange(c: NurbsCurve): [number, number] {
  return [c.knots[c.degree], c.knots[c.knots.length - c.degree - 1]];
}

export function evalCurve(c: NurbsCurve, u: number): P3 {
  const n = c.poles.length - 1, p = c.degree;
  const s = span(n, p, u, c.knots);
  const N = basis(s, u, p, c.knots);
  let x = 0, y = 0, z = 0, w = 0;
  for (let k = 0; k <= p; k++) {
    const i = s - p + k;
    const wi = (c.weights?.[i] ?? 1) * N[k];
    x += c.poles[i][0] * wi;
    y += c.poles[i][1] * wi;
    z += c.poles[i][2] * wi;
    w += wi;
  }
  return [x / w, y / w, z / w];
}

export function evalSurface(s: NurbsSurface, u: number, v: number): P3 {
  const nu = s.poles.length - 1, nv = s.poles[0].length - 1;
  const su = span(nu, s.degreeU, u, s.knotsU), sv = span(nv, s.degreeV, v, s.knotsV);
  const Nu = basis(su, u, s.degreeU, s.knotsU), Nv = basis(sv, v, s.degreeV, s.knotsV);
  let x = 0, y = 0, z = 0, w = 0;
  for (let a = 0; a <= s.degreeU; a++)
    for (let b = 0; b <= s.degreeV; b++) {
      const i = su - s.degreeU + a, j = sv - s.degreeV + b;
      const wi = (s.weights?.[i][j] ?? 1) * Nu[a] * Nv[b];
      const P = s.poles[i][j];
      x += P[0] * wi;
      y += P[1] * wi;
      z += P[2] * wi;
      w += wi;
    }
  return [x / w, y / w, z / w];
}

export function surfaceRange(s: NurbsSurface): [number, number, number, number] {
  return [s.knotsU[s.degreeU], s.knotsU[s.knotsU.length - s.degreeU - 1], s.knotsV[s.degreeV], s.knotsV[s.knotsV.length - s.degreeV - 1]];
}

export const curveStart = (c: NurbsCurve) => evalCurve(c, curveRange(c)[0]);
export const curveEnd = (c: NurbsCurve) => evalCurve(c, curveRange(c)[1]);

export function lineCurve(a: P3, b: P3): NurbsCurve {
  return { degree: 1, knots: [0, 0, 1, 1], poles: [a, b] };
}

export function polylineCurve(pts: P3[]): NurbsCurve {
  const knots = [0];
  let t = 0;
  knots.push(0);
  for (let i = 1; i < pts.length; i++) {
    t += Math.hypot(...sub(pts[i], pts[i - 1])) || 1e-9;
    knots.push(t);
  }
  knots.push(t);
  return { degree: 1, knots, poles: pts };
}

/**
 * Exact rational quadratic arc in the plane (center, x, y) from angle a0 to a1
 * (radians, a1 > a0), split into segments of at most 90°. Parameter = angle.
 */
export function arcCurve(center: P3, xDir: P3, yDir: P3, radius: number, a0: number, a1: number): NurbsCurve {
  const { poles, weights, knots } = arcPoles(a0, a1);
  return {
    degree: 2,
    knots,
    poles: poles.map(([cx, cy]) => add(center, add(mul(xDir, cx * radius), mul(yDir, cy * radius)))),
    weights,
  };
}

/** Unit-circle arc poles (2D), weights and knots (parameter = angle). */
function arcPoles(a0: number, a1: number): { poles: [number, number][]; weights: number[]; knots: number[] } {
  const sweep = a1 - a0;
  const n = Math.max(1, Math.ceil(sweep / (Math.PI / 2) - 1e-9));
  const d = sweep / n;
  const wm = Math.cos(d / 2);
  const poles: [number, number][] = [[Math.cos(a0), Math.sin(a0)]];
  const weights = [1];
  const knots = [a0, a0, a0];
  for (let k = 0; k < n; k++) {
    const s = a0 + k * d, e = s + d, m = s + d / 2;
    poles.push([Math.cos(m) / wm, Math.sin(m) / wm], [Math.cos(e), Math.sin(e)]);
    weights.push(wm, 1);
    if (k < n - 1) knots.push(e, e);
  }
  knots.push(a1, a1, a1);
  return { poles, weights, knots };
}

/**
 * Surface of revolution of a profile curve about an axis, from angle a0 to a1.
 * U runs around the axis (angle), V along the profile. Exact for rational profiles.
 */
export function revolveSurface(profile: NurbsCurve, origin: P3, axis: P3, a0: number, a1: number): NurbsSurface {
  const z = norm(axis);
  const arc = arcPoles(a0, a1);
  const poles: P3[][] = arc.poles.map(() => []);
  const weights: number[][] = arc.poles.map(() => []);
  profile.poles.forEach((P, j) => {
    const rel = sub(P, origin);
    const h = dot(rel, z);
    const radial = sub(rel, mul(z, h));
    const r = Math.hypot(...radial);
    const x = r > 1e-12 ? mul(radial, 1 / r) : anyPerp(z);
    const y = cross(z, x);
    const base = add(origin, mul(z, h));
    arc.poles.forEach(([cx, cy], i) => {
      // the arc starts at angle 0 of the profile's own radial direction
      poles[i][j] = add(base, add(mul(x, cx * r), mul(y, cy * r)));
      weights[i][j] = arc.weights[i] * (profile.weights?.[j] ?? 1);
    });
  });
  return { degreeU: 2, degreeV: profile.degree, knotsU: arc.knots, knotsV: profile.knots.slice(), poles, weights };
}

/** Linear extrusion of a curve by a vector (V in [0, 1]). */
export function extrudeSurface(c: NurbsCurve, dir: P3): NurbsSurface {
  return {
    degreeU: c.degree,
    degreeV: 1,
    knotsU: c.knots.slice(),
    knotsV: [0, 0, 1, 1],
    poles: c.poles.map((p) => [p, add(p, dir)]),
    weights: c.weights ? c.weights.map((w) => [w, w]) : undefined,
  };
}

/** Bilinear patch (exact for a planar parallelogram). */
export function bilinearSurface(p00: P3, p10: P3, p01: P3, p11: P3): NurbsSurface {
  return { degreeU: 1, degreeV: 1, knotsU: [0, 0, 1, 1], knotsV: [0, 0, 1, 1], poles: [[p00, p01], [p10, p11]] };
}

function anyPerp(z: P3): P3 {
  const a: P3 = Math.abs(z[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
  return norm(cross(z, a));
}

/** Affine transform (row-major 3x4: [r11 r12 r13 t1 r21 ... t3]). */
export type Affine = number[];
export const IDENTITY_AFFINE: Affine = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0];

export function applyAffine(m: Affine, p: P3): P3 {
  return [m[0] * p[0] + m[1] * p[1] + m[2] * p[2] + m[3], m[4] * p[0] + m[5] * p[1] + m[6] * p[2] + m[7], m[8] * p[0] + m[9] * p[1] + m[10] * p[2] + m[11]];
}

/** a ∘ b (apply b first). */
export function composeAffine(a: Affine, b: Affine): Affine {
  const r: Affine = new Array(12).fill(0);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) r[i * 4 + j] = a[i * 4] * b[j] + a[i * 4 + 1] * b[4 + j] + a[i * 4 + 2] * b[8 + j];
    r[i * 4 + 3] = a[i * 4] * b[3] + a[i * 4 + 1] * b[7] + a[i * 4 + 2] * b[11] + a[i * 4 + 3];
  }
  return r;
}

export function transformCurve(c: NurbsCurve, m: Affine, scale = 1): NurbsCurve {
  return { ...c, poles: c.poles.map((p) => mul(applyAffine(m, p), scale)) };
}
export function transformSurface(s: NurbsSurface, m: Affine, scale = 1): NurbsSurface {
  return { ...s, poles: s.poles.map((row) => row.map((p) => mul(applyAffine(m, p), scale))) };
}

/** Knot vector -> distinct knots + multiplicities (OpenCascade form). */
export function knotMults(knots: number[], tol = 1e-12): { k: number[]; m: number[] } {
  const k: number[] = [], m: number[] = [];
  for (const t of knots) {
    if (k.length && Math.abs(t - k[k.length - 1]) <= tol * Math.max(1, Math.abs(t))) m[m.length - 1]++;
    else k.push(t), m.push(1);
  }
  return { k, m };
}

/** Distinct knots + multiplicities -> full knot vector. */
export function expandKnots(k: number[], m: number[]): number[] {
  const out: number[] = [];
  k.forEach((t, i) => {
    for (let j = 0; j < m[i]; j++) out.push(t);
  });
  return out;
}

/** Reversed curve (same shape, opposite direction). */
export function reverseCurve(c: NurbsCurve): NurbsCurve {
  const [a, b] = [c.knots[0], c.knots[c.knots.length - 1]];
  return { degree: c.degree, knots: c.knots.map((t) => a + b - t).reverse(), poles: c.poles.slice().reverse(), weights: c.weights?.slice().reverse() };
}

/**
 * Orders loose boundary curves into connected loops (reversing curves where
 * needed). Curves that cannot be chained start a new loop.
 */
export function chainLoops(curves: NurbsCurve[], tol: number): NurbsCurve[][] {
  const left = curves.slice();
  const loops: NurbsCurve[][] = [];
  const d = (a: P3, b: P3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  while (left.length) {
    const loop = [left.shift()!];
    for (;;) {
      const end = curveEnd(loop[loop.length - 1]);
      if (d(end, curveStart(loop[0])) <= tol && loop.length > 1) break;
      // closest connecting curve; going straight back along the previous curve (the
      // second copy of a seam edge) only when nothing else connects
      const last = loop[loop.length - 1];
      const mid = (c: NurbsCurve) => {
        const [t0, t1] = curveRange(c);
        return evalCurve(c, (t0 + t1) / 2);
      };
      const lastMid = mid(last);
      let best = -1, rev = false, bs = Infinity;
      left.forEach((c, i) => {
        const ds = d(curveStart(c), end), de = d(curveEnd(c), end);
        const back = d(mid(c), lastMid) <= tol ? 1 : 0;
        if (ds <= tol && back * 10 + ds / tol < bs) (best = i), (rev = false), (bs = back * 10 + ds / tol);
        // reversing only when clearly better (closed curves connect at both ends)
        if (de <= tol && back * 10 + de / tol + 1e-3 < bs) (best = i), (rev = true), (bs = back * 10 + de / tol + 1e-3);
      });
      if (best < 0) break;
      const c = left.splice(best, 1)[0];
      loop.push(rev ? reverseCurve(c) : c);
    }
    loops.push(loop);
  }
  return loops;
}

/**
 * Global B-spline interpolation through points (any dimension), chord-length
 * parameters and averaged knots (The NURBS Book A9.1). Degree is lowered for
 * few points.
 */
export function interpolate(points: number[][], degree = 3): { degree: number; knots: number[]; poles: number[][] } {
  const n = points.length - 1;
  const p = Math.max(1, Math.min(degree, n));
  const d = points.slice(1).map((q, i) => Math.hypot(...q.map((v, k) => v - points[i][k])));
  const total = d.reduce((a, b) => a + b, 0) || 1;
  const t = [0];
  for (const x of d) t.push(t[t.length - 1] + x / total);
  t[n] = 1;
  const U: number[] = new Array(p + 1).fill(0);
  for (let j = 1; j <= n - p; j++) {
    let s = 0;
    for (let i = j; i < j + p; i++) s += t[i];
    U.push(s / p);
  }
  U.push(...new Array(p + 1).fill(1));
  // collocation matrix
  const A = points.map(() => new Array(n + 1).fill(0));
  for (let k = 0; k <= n; k++) {
    const s = span(n, p, t[k], U);
    const N = basis(s, t[k], p, U);
    for (let j = 0; j <= p; j++) A[k][s - p + j] = N[j];
  }
  const dim = points[0].length;
  const B = points.map((q) => q.slice());
  // Gaussian elimination with partial pivoting
  for (let c = 0; c <= n; c++) {
    let piv = c;
    for (let r = c + 1; r <= n; r++) if (Math.abs(A[r][c]) > Math.abs(A[piv][c])) piv = r;
    [A[c], A[piv]] = [A[piv], A[c]];
    [B[c], B[piv]] = [B[piv], B[c]];
    const a = A[c][c] || 1e-300;
    for (let r = c + 1; r <= n; r++) {
      const f = A[r][c] / a;
      if (!f) continue;
      for (let k = c; k <= n; k++) A[r][k] -= f * A[c][k];
      for (let k = 0; k < dim; k++) B[r][k] -= f * B[c][k];
    }
  }
  const P: number[][] = points.map(() => new Array(dim).fill(0));
  for (let r = n; r >= 0; r--) {
    for (let k = 0; k < dim; k++) {
      let s = B[r][k];
      for (let c = r + 1; c <= n; c++) s -= A[r][c] * P[c][k];
      P[r][k] = s / A[r][r];
    }
  }
  return { degree: p, knots: U, poles: P };
}
