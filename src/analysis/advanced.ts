// Advanced analyses on the voxel model (Inventor Nastran style):
//  - modal analysis: natural frequencies / mode shapes (LOBPCG with the
//    multigrid preconditioner, lumped mass), effective mass participation
//  - linear buckling: load factor and mode (inverse iteration on K, Kσ)
//  - steady-state heat conduction with fixed temperatures, heat flux and
//    convection; the temperature field feeds thermal stress (solveFea)

import { buildGrid, buildOperator, CORNERS, GAUSS, solveFea, type FeaBoundary, type FeaMaterial, type FeaMesh, type FeaOptions, type FeaResult } from "./fea";

// ------------------------------------------------------- dense helpers ---

/** Eigen-decomposition of a symmetric matrix (cyclic Jacobi). Returns ascending values and column vectors. */
export function symEig(A: number[][]): { values: number[]; vectors: number[][] } {
  const n = A.length;
  const a = A.map((r) => [...r]);
  const v: number[][] = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
  for (let sweep = 0; sweep < 100; sweep++) {
    let off = 0;
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) off += a[i][j] ** 2;
    if (off < 1e-30) break;
    for (let p = 0; p < n; p++)
      for (let q = p + 1; q < n; q++) {
        if (Math.abs(a[p][q]) < 1e-300) continue;
        const theta = (a[q][q] - a[p][p]) / (2 * a[p][q]);
        const t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
        const c = 1 / Math.sqrt(t * t + 1), s = t * c;
        for (let k = 0; k < n; k++) {
          const akp = a[k][p], akq = a[k][q];
          a[k][p] = c * akp - s * akq;
          a[k][q] = s * akp + c * akq;
        }
        for (let k = 0; k < n; k++) {
          const apk = a[p][k], aqk = a[q][k];
          a[p][k] = c * apk - s * aqk;
          a[q][k] = s * apk + c * aqk;
        }
        for (let k = 0; k < n; k++) {
          const vkp = v[k][p], vkq = v[k][q];
          v[k][p] = c * vkp - s * vkq;
          v[k][q] = s * vkp + c * vkq;
        }
      }
  }
  const order = [...Array(n).keys()].sort((i, j) => a[i][i] - a[j][j]);
  return { values: order.map((i) => a[i][i]), vectors: order.map((i) => v.map((row) => row[i])) };
}

const dot = (a: Float64Array, b: Float64Array) => {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
};
const dotM = (a: Float64Array, m: Float64Array, b: Float64Array) => {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * m[i] * b[i];
  return s;
};

// ---------------------------------------------------------- modal ---

export interface ModalResult {
  h: number;
  origin: [number, number, number];
  dims: [number, number, number];
  used: Uint8Array;
  /** Natural frequencies (Hz), ascending. */
  freqs: number[];
  /** Mode shapes: nodal vectors normalised to a maximum displacement of 1. */
  modes: Float32Array[];
  /** Effective mass participation ratios per mode in X, Y, Z. */
  participation: [number, number, number][];
  totalMass: number;
  elements: number;
  iterations: number;
  converged: boolean;
}

/**
 * Lowest natural frequencies of the constrained part: K φ = ω² M φ with a
 * lumped mass matrix, solved by block LOBPCG preconditioned with the
 * multigrid V-cycle of the stiffness.
 */
export function solveModal(mesh: FeaMesh, fixedTris: number[][], mat: FeaMaterial, density: number, opt: FeaOptions, nModes = 6, progress?: (it: number, res: number) => void): ModalResult {
  const G = buildGrid(mesh, opt);
  const fixed = new Uint8Array(G.nNodes);
  let nf = 0;
  for (const f of fixedTris) for (const n of G.near(f)) if (!fixed[n]) (fixed[n] = 1), nf++;
  if (!nf) throw new Error("固定拘束の面に節点がありません");
  const op = buildOperator(G, mat, opt, fixed);
  const { N3, free } = op;
  // lumped mass (t): ρ [g/cm³] = ρ·1e-9 t/mm³
  const M = new Float64Array(N3);
  const cell = G.h ** 3 * density * 1e-9;
  let totalMass = 0;
  for (let e = 0; e < G.ne; e++) {
    const m = (cell * G.phi[e]) / 8;
    totalMass += m * 8;
    for (let n = 0; n < 8; n++) for (let k = 0; k < 3; k++) M[G.conn[e * 8 + n] * 3 + k] += m;
  }
  for (let i = 0; i < N3; i++) if (!free[i]) M[i] = 0;
  const k = Math.max(1, nModes);
  // deterministic start vectors
  let seed = 12345;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff) - 0.5;
  let X: Float64Array[] = Array.from({ length: k }, () => {
    const x = new Float64Array(N3);
    for (let i = 0; i < N3; i++) if (free[i]) x[i] = rnd();
    return x;
  });
  let P: Float64Array[] = [];
  const Kv = (x: Float64Array) => {
    const y = new Float64Array(N3);
    op.Kx(x, y);
    return y;
  };
  /** M-orthonormalise (modified Gram-Schmidt, twice), dropping dependent vectors. */
  const orth = (vs: Float64Array[]) => {
    const out: Float64Array[] = [];
    for (const v0 of vs) {
      const v = Float64Array.from(v0);
      const n0 = Math.sqrt(dotM(v, M, v));
      if (!(n0 > 0)) continue;
      for (let pass = 0; pass < 2; pass++)
        for (const b of out) {
          const c = dotM(b, M, v);
          for (let i = 0; i < N3; i++) v[i] -= c * b[i];
        }
      const n = Math.sqrt(dotM(v, M, v));
      if (n > 1e-8 * n0) {
        for (let i = 0; i < N3; i++) v[i] /= n;
        out.push(v);
      }
    }
    return out;
  };
  X = orth(X);
  let lambda: number[] = [];
  let it = 0, maxRes = 1;
  const tol = 1e-6;
  for (; it < 400; it++) {
    const KX = X.map(Kv);
    // Rayleigh-Ritz on X alone gives the current estimates
    lambda = X.map((x, i) => dot(x, KX[i]));
    const R = X.map((x, i) => {
      const r = new Float64Array(N3);
      for (let j = 0; j < N3; j++) r[j] = free[j] ? KX[i][j] - lambda[i] * M[j] * x[j] : 0;
      return r;
    });
    maxRes = Math.max(...R.map((r, i) => Math.sqrt(dot(r, r)) / Math.max(Math.sqrt(dot(KX[i], KX[i])), 1e-300)));
    if (progress && it % 2 === 0) progress(it, maxRes);
    if (maxRes < tol) break;
    const W = R.map((r) => {
      const z = new Float64Array(N3);
      op.prec(r, z);
      return z;
    });
    const S = orth([...X, ...W, ...P]);
    const KS = S.map(Kv);
    const m = S.length;
    const A = Array.from({ length: m }, (_, i) => Array.from({ length: m }, (_, j) => dot(S[i], KS[j])));
    for (let i = 0; i < m; i++) for (let j = i + 1; j < m; j++) A[i][j] = A[j][i] = (A[i][j] + A[j][i]) / 2;
    const { vectors } = symEig(A);
    const nx = Math.min(k, m);
    const newX: Float64Array[] = [], newP: Float64Array[] = [];
    for (let c = 0; c < nx; c++) {
      const x = new Float64Array(N3), p = new Float64Array(N3);
      for (let j = 0; j < m; j++) {
        const w = vectors[c][j];
        if (!w) continue;
        const s = S[j];
        for (let i = 0; i < N3; i++) x[i] += w * s[i];
        if (j >= X.length) for (let i = 0; i < N3; i++) p[i] += w * s[i];
      }
      newX.push(x);
      newP.push(p);
    }
    X = orth(newX);
    P = newP;
  }
  const order = lambda.map((l, i) => [l, i]).sort((a, b) => a[0] - b[0]);
  const freqs = order.map(([l]) => Math.sqrt(Math.max(l, 0)) / (2 * Math.PI));
  const modes = order.map(([, i]) => {
    const x = X[i];
    let mx = 0;
    for (let n = 0; n < G.nNodes; n++) mx = Math.max(mx, Math.hypot(x[n * 3], x[n * 3 + 1], x[n * 3 + 2]));
    return Float32Array.from(x, (v) => v / (mx || 1));
  });
  // effective mass: (φᵀ M r)² / (φᵀ M φ) for unit rigid translation r
  const participation = order.map(([, i]): [number, number, number] => {
    const x = X[i];
    const mm = dotM(x, M, x);
    return [0, 1, 2].map((d) => {
      let g = 0;
      for (let n = 0; n < G.nNodes; n++) g += x[n * 3 + d] * M[n * 3 + d];
      return (g * g) / mm / totalMass;
    }) as [number, number, number];
  });
  return { h: G.h, origin: G.origin, dims: G.dims, used: G.used, freqs, modes, participation, totalMass, elements: G.ne, iterations: it, converged: maxRes < tol };
}

// -------------------------------------------------------- buckling ---

export interface BucklingResult {
  /** Critical load factor: buckling occurs at factor × applied load. */
  factor: number;
  mode: Float32Array;
  static: FeaResult;
  h: number;
  origin: [number, number, number];
  dims: [number, number, number];
  used: Uint8Array;
  iterations: number;
  converged: boolean;
}

/** Shape-function gradients (per unit cube, divide by h) at the Gauss points. */
const DN = GAUSS.map(([x, y, z]) =>
  CORNERS.map(([cx, cy, cz]) => {
    const fx = cx ? x : 1 - x, fy = cy ? y : 1 - y, fz = cz ? z : 1 - z;
    const sx = cx ? 1 : -1, sy = cy ? 1 : -1, sz = cz ? 1 : -1;
    return [sx * fy * fz, fx * sy * fz, fx * fy * sz];
  }),
);

/**
 * Linear (eigenvalue) buckling: (K + λ Kσ) φ = 0 for the stresses of the
 * static load case. The smallest positive λ is the safety factor against
 * buckling (Inventor Nastran "座屈").
 */
export function solveBuckling(mesh: FeaMesh, bc: FeaBoundary, mat: FeaMaterial, opt: FeaOptions, progress?: (it: number, res: number) => void): BucklingResult {
  const st = solveFea(mesh, bc, mat, { ...opt, keepGauss: true });
  const G = buildGrid(mesh, opt);
  const fixed = new Uint8Array(G.nNodes);
  for (const f of bc.fixed) for (const n of G.near(f)) fixed[n] = 1;
  const op = buildOperator(G, mat, opt, fixed);
  const { N3, free } = op;
  const gs = st.gaussStress!;
  const h = G.h, w = (h * h * h) / 8;
  /** y = Kσ x */
  const Kg = (x: Float64Array, y: Float64Array) => {
    y.fill(0);
    const grad = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (let e = 0; e < G.ne; e++) {
      const c = e * 8, ph = G.phi[e] * w;
      for (let g = 0; g < 8; g++) {
        const s = gs.subarray((e * 8 + g) * 6, (e * 8 + g) * 6 + 6);
        const dn = DN[g];
        grad.fill(0);
        for (let n = 0; n < 8; n++) {
          const node = G.conn[c + n] * 3;
          const d = dn[n];
          for (let comp = 0; comp < 3; comp++) {
            const u = x[node + comp];
            grad[comp * 3] += (d[0] * u) / h;
            grad[comp * 3 + 1] += (d[1] * u) / h;
            grad[comp * 3 + 2] += (d[2] * u) / h;
          }
        }
        // t_c = σ · ∇u_c   (σ = [[sxx,txy,tzx],[txy,syy,tyz],[tzx,tyz,szz]])
        for (let comp = 0; comp < 3; comp++) {
          const gx = grad[comp * 3], gy = grad[comp * 3 + 1], gz = grad[comp * 3 + 2];
          const tx = s[0] * gx + s[3] * gy + s[5] * gz;
          const ty = s[3] * gx + s[1] * gy + s[4] * gz;
          const tz = s[5] * gx + s[4] * gy + s[2] * gz;
          for (let n = 0; n < 8; n++) {
            const d = dn[n];
            y[G.conn[c + n] * 3 + comp] += (ph * (d[0] * tx + d[1] * ty + d[2] * tz)) / h;
          }
        }
      }
    }
    for (let i = 0; i < N3; i++) if (!free[i]) y[i] = 0;
  };
  // inverse iteration: K x_{k+1} = -Kσ x_k ; λ = xᵀK x / xᵀ(-Kσ) x
  let seed = 777;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff) - 0.5;
  let x = new Float64Array(N3);
  // start from the static deflection plus noise (excites the buckling shape)
  for (let i = 0; i < N3; i++) if (free[i]) x[i] = rnd();
  const kx = new Float64Array(N3), gx = new Float64Array(N3);
  let lambda = 0, prev = Infinity, it = 0, conv = false;
  for (; it < 200; it++) {
    Kg(x, gx);
    for (let i = 0; i < N3; i++) gx[i] = -gx[i];
    const sol = op.solve(gx, undefined, 1e-9);
    x = sol.u;
    op.Kx(x, kx);
    Kg(x, gx);
    const den = -dot(x, gx);
    lambda = dot(x, kx) / den;
    let mx = 0;
    for (let i = 0; i < N3; i++) mx = Math.max(mx, Math.abs(x[i]));
    for (let i = 0; i < N3; i++) x[i] /= mx || 1;
    const change = Math.abs(lambda - prev) / Math.abs(lambda);
    if (progress) progress(it, change);
    if (change < 1e-7) {
      conv = true;
      break;
    }
    prev = lambda;
  }
  let mx = 0;
  for (let n = 0; n < G.nNodes; n++) mx = Math.max(mx, Math.hypot(x[n * 3], x[n * 3 + 1], x[n * 3 + 2]));
  return { factor: lambda, mode: Float32Array.from(x, (v) => v / (mx || 1)), static: { ...st, gaussStress: undefined }, h: G.h, origin: G.origin, dims: G.dims, used: G.used, iterations: it, converged: conv };
}

// --------------------------------------------------------- thermal ---

export interface ThermalMaterial {
  /** Thermal conductivity, W/(m·K). */
  k: number;
  /** Linear expansion, 1/K. */
  alpha: number;
}

export const THERMAL_MATERIALS: Record<string, ThermalMaterial> = {
  汎用: { k: 50, alpha: 12e-6 },
  鋼: { k: 50, alpha: 12e-6 },
  ステンレス鋼: { k: 16, alpha: 17e-6 },
  "アルミニウム 6061": { k: 167, alpha: 23.6e-6 },
  黄銅: { k: 109, alpha: 20e-6 },
  銅: { k: 390, alpha: 17e-6 },
  チタン: { k: 7, alpha: 8.6e-6 },
  "ABS 樹脂": { k: 0.17, alpha: 90e-6 },
  "ナイロン 6/6": { k: 0.25, alpha: 80e-6 },
  ポリカーボネート: { k: 0.2, alpha: 65e-6 },
  ゴム: { k: 0.15, alpha: 200e-6 },
  "木材 (パイン)": { k: 0.12, alpha: 5e-6 },
};

export interface ThermalBoundary {
  /** Faces held at a temperature (°C). */
  temperature: { tris: number[]; T: number }[];
  /** Heat input (W) spread over the faces. */
  flux: { tris: number[]; Q: number }[];
  /** Convection: film coefficient (W/(m²·K)) and ambient temperature (°C). */
  convection: { tris: number[]; hc: number; Tamb: number }[];
}

export interface ThermalResult {
  h: number;
  origin: [number, number, number];
  dims: [number, number, number];
  used: Uint8Array;
  /** Nodal temperature (°C). */
  T: Float32Array;
  minT: number;
  maxT: number;
  /** Heat balance: input (flux) vs. output through fixed-temperature and convection faces (W). */
  heatIn: number;
  heatOut: number;
  elements: number;
  iterations: number;
  converged: boolean;
}

/**
 * Steady-state conduction (trilinear bricks, Jacobi PCG). Units: mm, W, °C;
 * k given in W/(m·K) is converted to W/(mm·K), film coefficients from
 * W/(m²·K) to W/(mm²·K).
 */
export function solveThermal(mesh: FeaMesh, bc: ThermalBoundary, kmat: ThermalMaterial, opt: FeaOptions, progress?: (it: number, res: number) => void): ThermalResult {
  const G = buildGrid(mesh, opt);
  const { nNodes, conn, phi, ne, h } = G;
  const k = kmat.k * 1e-3;
  // element conductivity matrix (8x8): k ∫ ∇Ni·∇Nj dV
  const KT = new Float64Array(64);
  for (let g = 0; g < 8; g++) {
    const dn = DN[g];
    for (let i = 0; i < 8; i++)
      for (let j = 0; j < 8; j++) KT[i * 8 + j] += ((dn[i][0] * dn[j][0] + dn[i][1] * dn[j][1] + dn[i][2] * dn[j][2]) / (h * h)) * ((h * h * h) / 8) * k;
  }
  const fixedT = new Float64Array(nNodes).fill(NaN);
  for (const t of bc.temperature) for (const n of G.near(t.tris)) fixedT[n] = t.T;
  // boundary area lumped to nodes (barycentric samples -> nearest face node)
  const lump = (tris: number[]): Map<number, number> => {
    const N = G.near(tris);
    const out = new Map<number, number>();
    if (!N.size) return out;
    const Nl = [...N];
    for (const ti of tris) {
      const t = G.tri(ti);
      const u = [t[1][0] - t[0][0], t[1][1] - t[0][1], t[1][2] - t[0][2]], v = [t[2][0] - t[0][0], t[2][1] - t[0][1], t[2][2] - t[0][2]];
      const a = Math.hypot(u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]) / 2;
      if (!(a > 0)) continue;
      const edge = Math.max(Math.hypot(...u), Math.hypot(...v));
      const m = Math.min(30, Math.max(1, Math.ceil((edge / h) * 2)));
      const pts: number[][] = [];
      for (let i = 0; i < m; i++)
        for (let j = 0; j < m - i; j++) {
          const s = (i + 1 / 3) / m, r = (j + 1 / 3) / m;
          pts.push([0, 1, 2].map((q) => t[0][q] + s * u[q] + r * v[q]));
          if (i + j < m - 1) {
            const s2 = (i + 2 / 3) / m, r2 = (j + 2 / 3) / m;
            pts.push([0, 1, 2].map((q) => t[0][q] + s2 * u[q] + r2 * v[q]));
          }
        }
      for (const p of pts) {
        let best = -1, bd = Infinity;
        for (const n of Nl) {
          const q = G.nodePos(n);
          const d = (q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2 + (q[2] - p[2]) ** 2;
          if (d < bd) (bd = d), (best = n);
        }
        out.set(best, (out.get(best) ?? 0) + a / pts.length);
      }
    }
    return out;
  };
  const Q = new Float64Array(nNodes);
  const Qconv = new Float64Array(nNodes);
  const Hdiag = new Float64Array(nNodes);
  let heatIn = 0;
  for (const f of bc.flux) {
    const L = lump(f.tris);
    const A = [...L.values()].reduce((s, v) => s + v, 0) || 1;
    for (const [n, a] of L) Q[n] += (f.Q * a) / A;
    heatIn += f.Q;
  }
  for (const c of bc.convection)
    for (const [n, a] of lump(c.tris)) {
      const hc = c.hc * 1e-6;
      Hdiag[n] += hc * a;
      Q[n] += hc * a * c.Tamb;
      Qconv[n] += hc * a * c.Tamb;
    }
  const hasFixed = fixedT.some((v) => !Number.isNaN(v));
  if (!hasFixed && !bc.convection.length) throw new Error("温度固定の面または対流の面を指定してください (熱の逃げ場がありません)");
  const free = new Uint8Array(nNodes);
  for (let n = 0; n < nNodes; n++) free[n] = G.used[n] && Number.isNaN(fixedT[n]) ? 1 : 0;
  const Tf = new Float64Array(nNodes);
  for (let n = 0; n < nNodes; n++) if (!Number.isNaN(fixedT[n])) Tf[n] = fixedT[n];
  /** y = (K + H) x on all nodes (unmasked). */
  const Ax = (x: Float64Array, y: Float64Array) => {
    y.fill(0);
    const xe = new Float64Array(8);
    for (let e = 0; e < ne; e++) {
      for (let n = 0; n < 8; n++) xe[n] = x[conn[e * 8 + n]];
      for (let a = 0; a < 8; a++) {
        let s = 0;
        for (let b = 0; b < 8; b++) s += KT[a * 8 + b] * xe[b];
        y[conn[e * 8 + a]] += s * phi[e];
      }
    }
    for (let n = 0; n < nNodes; n++) y[n] += Hdiag[n] * x[n];
  };
  // right-hand side: Q - A T_fixed
  const b = new Float64Array(nNodes), t1 = new Float64Array(nNodes);
  Ax(Tf, t1);
  for (let n = 0; n < nNodes; n++) b[n] = free[n] ? Q[n] - t1[n] : 0;
  const diag = new Float64Array(nNodes);
  for (let e = 0; e < ne; e++) for (let a = 0; a < 8; a++) diag[conn[e * 8 + a]] += KT[a * 9] * phi[e];
  for (let n = 0; n < nNodes; n++) diag[n] += Hdiag[n];
  const x = new Float64Array(nNodes), r = Float64Array.from(b), z = new Float64Array(nNodes), p = new Float64Array(nNodes), q = new Float64Array(nNodes);
  const prec = () => {
    for (let n = 0; n < nNodes; n++) z[n] = free[n] && diag[n] ? r[n] / diag[n] : 0;
  };
  const A = (v: Float64Array, out: Float64Array) => {
    Ax(v, out);
    for (let n = 0; n < nNodes; n++) if (!free[n]) out[n] = 0;
  };
  prec();
  p.set(z);
  let rz = dot(r, z);
  const bn = Math.sqrt(dot(b, b)) || 1;
  let it = 0, res = 1;
  const tol = opt.tol ?? 1e-9;
  for (; it < (opt.maxIter ?? 20000); it++) {
    A(p, q);
    const pq = dot(p, q);
    if (!(pq > 0)) break;
    const al = rz / pq;
    for (let n = 0; n < nNodes; n++) {
      x[n] += al * p[n];
      r[n] -= al * q[n];
    }
    res = Math.sqrt(dot(r, r)) / bn;
    if (progress && it % 100 === 0) progress(it, res);
    if (res < tol) break;
    prec();
    const rz2 = dot(r, z);
    for (let n = 0; n < nNodes; n++) p[n] = z[n] + (rz2 / rz) * p[n];
    rz = rz2;
  }
  const T = new Float32Array(nNodes);
  let minT = Infinity, maxT = -Infinity;
  for (let n = 0; n < nNodes; n++) {
    if (!G.used[n]) continue;
    const v = free[n] ? x[n] : Tf[n];
    T[n] = v;
    minT = Math.min(minT, v);
    maxT = Math.max(maxT, v);
  }
  // heat out: reactions at fixed-temperature nodes + convection losses hA(T - Tamb)
  const full = Float64Array.from(T);
  Ax(full, t1);
  let heatOut = 0;
  for (let n = 0; n < nNodes; n++) {
    if (!G.used[n]) continue;
    if (!free[n]) heatOut += Q[n] - t1[n];
    else if (Hdiag[n]) heatOut += Hdiag[n] * T[n] - Qconv[n];
  }
  return { h, origin: G.origin, dims: G.dims, used: G.used, T, minT, maxT, heatIn, heatOut, elements: ne, iterations: it, converged: res < tol };
}
