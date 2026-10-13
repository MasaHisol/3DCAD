// Linear static stress analysis (Inventor "応力解析" equivalent).
//
// The solid is voxelised into equal hexahedral elements on a regular grid,
// so every element shares one stiffness matrix and the system is solved
// matrix-free with a Jacobi preconditioned conjugate gradient. Units: mm, N,
// MPa (N/mm²).
//
// Accuracy measures (v2):
//  - H11 elements: trilinear hexahedra enriched with Wilson-Taylor
//    incompatible (bubble) modes, condensed statically. Removes the shear
//    locking of plain 8-node bricks, so bending is accurate with only 2-3
//    elements through a wall.
//  - Partial-volume elements: boundary cells are sampled 3x3x3 and their
//    stiffness / mass scaled by the solid fraction, which removes most of the
//    stiffness error of a stair-stepped boundary.
//  - Stress recovery: stresses at the 2x2x2 Gauss points are extrapolated to
//    the element corners and averaged at the nodes (surface stresses, where
//    the peaks are, instead of element-centre values).
//  - Area weighted loads, pressure and self weight; reaction forces are
//    reported as an equilibrium check.

export interface FeaMaterial {
  /** Young's modulus, MPa. */
  E: number;
  nu: number;
  /** Yield strength, MPa. */
  yield: number;
  /** Ultimate tensile strength, MPa. */
  uts?: number;
}

export const FEA_MATERIALS: Record<string, FeaMaterial> = {
  汎用: { E: 210000, nu: 0.3, yield: 250, uts: 400 },
  鋼: { E: 210000, nu: 0.3, yield: 245, uts: 400 },
  ステンレス鋼: { E: 193000, nu: 0.3, yield: 205, uts: 520 },
  "アルミニウム 6061": { E: 68900, nu: 0.33, yield: 275, uts: 310 },
  黄銅: { E: 100000, nu: 0.34, yield: 125, uts: 340 },
  銅: { E: 117000, nu: 0.34, yield: 70, uts: 220 },
  チタン: { E: 110000, nu: 0.34, yield: 880, uts: 950 },
  "ABS 樹脂": { E: 2200, nu: 0.35, yield: 40, uts: 44 },
  "ナイロン 6/6": { E: 2800, nu: 0.39, yield: 70, uts: 80 },
  ポリカーボネート: { E: 2400, nu: 0.37, yield: 62, uts: 70 },
  ゴム: { E: 5, nu: 0.48, yield: 15, uts: 20 },
  "木材 (パイン)": { E: 9000, nu: 0.3, yield: 40, uts: 45 },
};

/** Triangle soup of the solid (world mm). */
export interface FeaMesh {
  positions: Float32Array | number[];
  indices: Uint32Array | number[];
}

export interface FeaLoad {
  /** Triangles (indices into the mesh) of the loaded faces. */
  tris: number[];
  /** Total force (N) on the face, distributed by area. */
  force?: [number, number, number];
  /** Pressure (MPa) acting against the face normals. */
  pressure?: number;
}

export interface FeaBoundary {
  /** Triangles of faces that are fixed (all displacements zero). */
  fixed: number[][];
  loads: FeaLoad[];
  /** Self weight: density (g/cm³) and gravity direction (unit, × 9.81 m/s²). */
  gravity?: { density: number; dir: [number, number, number] };
}

export interface FeaOptions {
  /** Elements along the longest side (ignored when targetElements is given). */
  resolution?: number;
  /** Approximate number of solid elements: the element size follows the part volume, so thin members still get several elements across. */
  targetElements?: number;
  /** "mg" (default): multigrid preconditioned CG, "jacobi": diagonal preconditioner. */
  solver?: "mg" | "jacobi";
  /** "h11" (default, incompatible modes) or "h8" (plain trilinear). */
  element?: "h11" | "h8";
  /** Scale boundary cells by their solid fraction (default true). */
  partialVolume?: boolean;
  /**
   * Stress recovery. "auto" (default): Gauss values extrapolated to the corners and averaged at the
   * nodes, except that stair-stepped boundary elements only use their mean and only where no regular
   * element reaches the node (suppresses the artificial notches of the voxel boundary).
   * "extrapolate": extrapolate everywhere. "mean": element means only (smoothest, lowest peaks).
   */
  recovery?: "auto" | "extrapolate" | "mean";
  maxIter?: number;
  tol?: number;
}

export interface FeaResult {
  h: number;
  origin: [number, number, number];
  dims: [number, number, number];
  /** Solid fraction per element (0 = outside). */
  frac: Float32Array;
  /** Nodal displacement (mm), 3 per grid node ((nx+1)(ny+1)(nz+1)). */
  disp: Float32Array;
  /** Nodal stress tensor (MPa): sxx, syy, szz, txy, tyz, tzx. */
  stress: Float32Array;
  /** Nodal von Mises / max / min principal stress (MPa). */
  vm: Float32Array;
  s1: Float32Array;
  s3: Float32Array;
  /** Grid nodes belonging to the solid. */
  used: Uint8Array;
  maxVm: number;
  maxS1: number;
  minS3: number;
  maxDisp: number;
  /** Sum of the applied loads and of the support reactions (N). */
  applied: [number, number, number];
  reaction: [number, number, number];
  /** |applied + reaction| / |applied| (equilibrium check). */
  equilibriumError: number;
  elements: number;
  iterations: number;
  converged: boolean;
  fixedNodes: number;
  loadedNodes: number;
  /** Solid volume of the mesh (mm³). */
  volume: number;
}

import { Multigrid } from "./mg";

// ------------------------------------------------------- voxelisation ---

export function voxelize(mesh: FeaMesh, origin: number[], h: number, dims: number[]): Uint8Array {
  const [nx, ny, nz] = dims;
  const inside = new Uint8Array(nx * ny * nz);
  const P = mesh.positions, I = mesh.indices;
  const rows: number[][] = Array.from({ length: ny * nz }, () => []);
  const jit = h * 1.37e-5; // avoid rays through edges / vertices
  for (let t = 0; t < I.length; t += 3) {
    const a = I[t] * 3, b = I[t + 1] * 3, c = I[t + 2] * 3;
    const ay = P[a + 1], az = P[a + 2], by = P[b + 1], bz = P[b + 2], cy = P[c + 1], cz = P[c + 2];
    const j0 = Math.max(0, Math.ceil((Math.min(ay, by, cy) - origin[1]) / h - 0.5));
    const j1 = Math.min(ny - 1, Math.floor((Math.max(ay, by, cy) - origin[1]) / h - 0.5));
    const k0 = Math.max(0, Math.ceil((Math.min(az, bz, cz) - origin[2]) / h - 0.5));
    const k1 = Math.min(nz - 1, Math.floor((Math.max(az, bz, cz) - origin[2]) / h - 0.5));
    const det = (by - ay) * (cz - az) - (cy - ay) * (bz - az);
    if (Math.abs(det) < 1e-14) continue;
    for (let k = k0; k <= k1; k++)
      for (let j = j0; j <= j1; j++) {
        const y = origin[1] + (j + 0.5) * h + jit, z = origin[2] + (k + 0.5) * h + jit * 0.61;
        const u = ((y - ay) * (cz - az) - (cy - ay) * (z - az)) / det;
        const v = ((by - ay) * (z - az) - (y - ay) * (bz - az)) / det;
        if (u < 0 || v < 0 || u + v > 1) continue;
        rows[k * ny + j].push(P[a] + u * (P[b] - P[a]) + v * (P[c] - P[a]));
      }
  }
  for (let k = 0; k < nz; k++)
    for (let j = 0; j < ny; j++) {
      const xs = rows[k * ny + j].sort((p, q) => p - q);
      for (let m = 0; m + 1 < xs.length; m += 2) {
        const i0 = Math.max(0, Math.ceil((xs[m] - origin[0]) / h - 0.5));
        const i1 = Math.min(nx - 1, Math.floor((xs[m + 1] - origin[0]) / h - 0.5));
        for (let i = i0; i <= i1; i++) inside[(k * ny + j) * nx + i] = 1;
      }
    }
  return inside;
}


/** Solid fraction of each cell: voxelise at `sub`× resolution and count. */
export function cellFractions(mesh: FeaMesh, origin: number[], h: number, dims: number[], sub: number): Float32Array {
  const [nx, ny, nz] = dims;
  const fine = voxelize(mesh, origin, h / sub, [nx * sub, ny * sub, nz * sub]);
  const frac = new Float32Array(nx * ny * nz);
  const FX = nx * sub, FY = ny * sub;
  const s3 = sub * sub * sub;
  for (let k = 0; k < nz * sub; k++)
    for (let j = 0; j < ny * sub; j++)
      for (let i = 0; i < nx * sub; i++)
        if (fine[(k * FY + j) * FX + i]) frac[(((k / sub) | 0) * ny + ((j / sub) | 0)) * nx + ((i / sub) | 0)] += 1 / s3;
  return frac;
}

// ---------------------------------------------------------- element ---

const CORNERS = [
  [0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0],
  [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1],
];
const G = 1 / Math.sqrt(3);
/** Gauss points (local [0,1]³), ordered like CORNERS. */
const GAUSS = CORNERS.map((c) => c.map((s) => 0.5 + (s ? 0.5 : -0.5) * G));

export function dMatrix(m: FeaMaterial): number[][] {
  const { E, nu } = m;
  const c = E / ((1 + nu) * (1 - 2 * nu));
  const D = Array.from({ length: 6 }, () => new Array(6).fill(0));
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) D[i][j] = c * (i === j ? 1 - nu : nu);
  for (let i = 3; i < 6; i++) D[i][i] = (c * (1 - 2 * nu)) / 2;
  return D;
}

/** Strain columns for a displacement component `c` with gradient (dx, dy, dz). */
function fillB(B: number[][], col: number, c: number, dx: number, dy: number, dz: number) {
  if (c === 0) (B[0][col] = dx), (B[3][col] = dy), (B[5][col] = dz);
  else if (c === 1) (B[1][col] = dy), (B[3][col] = dx), (B[4][col] = dz);
  else (B[2][col] = dz), (B[4][col] = dy), (B[5][col] = dx);
}

/** Compatible (24 columns) + incompatible (9 columns) strain matrix at local (x,y,z). */
function bMatrix(x: number, y: number, z: number, h: number, bubbles: boolean): number[][] {
  const B = Array.from({ length: 6 }, () => new Array(bubbles ? 33 : 24).fill(0));
  for (let n = 0; n < 8; n++) {
    const [cx, cy, cz] = CORNERS[n];
    const fx = cx ? x : 1 - x, fy = cy ? y : 1 - y, fz = cz ? z : 1 - z;
    const sx = cx ? 1 : -1, sy = cy ? 1 : -1, sz = cz ? 1 : -1;
    for (let c = 0; c < 3; c++) fillB(B, n * 3 + c, c, (sx * fy * fz) / h, (fx * sy * fz) / h, (fx * fy * sz) / h);
  }
  if (bubbles) {
    // P_k = 1 - ξ_k², ξ = 2x - 1: dP_k/dx_k = -2ξ_k · 2/h (constant Jacobian: passes the patch test)
    const xi = [2 * x - 1, 2 * y - 1, 2 * z - 1];
    for (let k = 0; k < 3; k++) {
      const g = (-4 * xi[k]) / h;
      for (let c = 0; c < 3; c++) fillB(B, 24 + k * 3 + c, c, k === 0 ? g : 0, k === 1 ? g : 0, k === 2 ? g : 0);
    }
  }
  return B;
}

function invert(a: number[][]): number[][] {
  const n = a.length;
  const m = a.map((r, i) => [...r, ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(m[r][c]) > Math.abs(m[p][c])) p = r;
    [m[c], m[p]] = [m[p], m[c]];
    const d = m[c][c];
    for (let j = 0; j < 2 * n; j++) m[c][j] /= d;
    for (let r = 0; r < n; r++)
      if (r !== c && m[r][c]) {
        const f = m[r][c];
        for (let j = 0; j < 2 * n; j++) m[r][j] -= f * m[c][j];
      }
  }
  return m.map((r) => r.slice(n));
}

export interface ElementData {
  /** Condensed 24x24 stiffness. */
  K: Float64Array;
  /** Incompatible-mode recovery α = T·ue (9x24), or null for H8. */
  T: number[][] | null;
  /** Strain matrices at the Gauss points. */
  Bg: number[][][];
}

/** Element stiffness (2x2x2 Gauss), with static condensation of the bubble modes. */
export function elementData(m: FeaMaterial, h: number, kind: "h11" | "h8" = "h11"): ElementData {
  const bub = kind === "h11";
  const N = bub ? 33 : 24;
  const D = dMatrix(m);
  const Kf = Array.from({ length: N }, () => new Array(N).fill(0));
  const w = (h * h * h) / 8;
  const Bg = GAUSS.map(([x, y, z]) => bMatrix(x, y, z, h, bub));
  for (const B of Bg) {
    const DB = D.map((row) => {
      const r = new Array(N).fill(0);
      for (let k = 0; k < 6; k++) if (row[k]) for (let j = 0; j < N; j++) r[j] += row[k] * B[k][j];
      return r;
    });
    for (let i = 0; i < N; i++)
      for (let j = 0; j < N; j++) {
        let s = 0;
        for (let k = 0; k < 6; k++) s += B[k][i] * DB[k][j];
        Kf[i][j] += s * w;
      }
  }
  const K = new Float64Array(576);
  if (!bub) {
    for (let i = 0; i < 24; i++) for (let j = 0; j < 24; j++) K[i * 24 + j] = Kf[i][j];
    return { K, T: null, Bg };
  }
  const Kaa = Kf.slice(24).map((r) => r.slice(24));
  const Kau = Kf.slice(24).map((r) => r.slice(0, 24));
  const inv = invert(Kaa);
  // T = -Kaa⁻¹ Kau ; K = Kuu + Kua T
  const T = inv.map((row) => Array.from({ length: 24 }, (_, j) => -row.reduce((s, v, k) => s + v * Kau[k][j], 0)));
  for (let i = 0; i < 24; i++)
    for (let j = 0; j < 24; j++) {
      let s = Kf[i][j];
      for (let k = 0; k < 9; k++) s += Kf[i][24 + k] * T[k][j];
      K[i * 24 + j] = s;
    }
  // symmetrise round-off
  for (let i = 0; i < 24; i++)
    for (let j = i + 1; j < 24; j++) {
      const v = (K[i * 24 + j] + K[j * 24 + i]) / 2;
      K[i * 24 + j] = K[j * 24 + i] = v;
    }
  return { K, T, Bg };
}

/** Plain 24x24 stiffness (kept for callers of v1). */
export function elementStiffness(m: FeaMaterial, h: number): Float64Array {
  return elementData(m, h, "h8").K;
}

/** Corner extrapolation weights: value at corner c = Σ_g E[c][g] · value at Gauss point g. */
const EXTRAP = CORNERS.map((c) =>
  CORNERS.map((g) => c.reduce((p, s, i) => p * (1 + (s ? 1 : -1) * (g[i] ? 1 : -1) * Math.sqrt(3)) / 2, 1)),
);

/** Principal stresses of a symmetric tensor (sxx, syy, szz, txy, tyz, tzx), descending. */
export function principal(s: ArrayLike<number>): [number, number, number] {
  const [a, b, c, d, e, f] = [s[0], s[1], s[2], s[3], s[4], s[5]];
  const p1 = d * d + e * e + f * f;
  const q = (a + b + c) / 3;
  if (p1 < 1e-30) return [a, b, c].sort((x, y) => y - x) as [number, number, number];
  const p2 = (a - q) ** 2 + (b - q) ** 2 + (c - q) ** 2 + 2 * p1;
  const p = Math.sqrt(p2 / 6);
  const B = [(a - q) / p, d / p, f / p, d / p, (b - q) / p, e / p, f / p, e / p, (c - q) / p];
  const det = B[0] * (B[4] * B[8] - B[5] * B[7]) - B[1] * (B[3] * B[8] - B[5] * B[6]) + B[2] * (B[3] * B[7] - B[4] * B[6]);
  const r = Math.max(-1, Math.min(1, det / 2));
  const phi = Math.acos(r) / 3;
  const e1 = q + 2 * p * Math.cos(phi);
  const e3 = q + 2 * p * Math.cos(phi + (2 * Math.PI) / 3);
  return [e1, 3 * q - e1 - e3, e3];
}

export function vonMises(s: ArrayLike<number>): number {
  return Math.sqrt(0.5 * ((s[0] - s[1]) ** 2 + (s[1] - s[2]) ** 2 + (s[2] - s[0]) ** 2) + 3 * (s[3] ** 2 + s[4] ** 2 + s[5] ** 2));
}

// ------------------------------------------------------------ solve ---

function pointTriDist2(p: number[], a: number[], b: number[], c: number[]): number {
  // closest point on triangle (Ericson, Real-Time Collision Detection)
  const sub = (u: number[], v: number[]) => [u[0] - v[0], u[1] - v[1], u[2] - v[2]];
  const dot = (u: number[], v: number[]) => u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
  const ab = sub(b, a), ac = sub(c, a), ap = sub(p, a);
  const d1 = dot(ab, ap), d2 = dot(ac, ap);
  let q: number[];
  if (d1 <= 0 && d2 <= 0) q = a;
  else {
    const bp = sub(p, b), d3 = dot(ab, bp), d4 = dot(ac, bp);
    if (d3 >= 0 && d4 <= d3) q = b;
    else {
      const vc = d1 * d4 - d3 * d2;
      if (vc <= 0 && d1 >= 0 && d3 <= 0) {
        const v = d1 / (d1 - d3);
        q = [a[0] + v * ab[0], a[1] + v * ab[1], a[2] + v * ab[2]];
      } else {
        const cp = sub(p, c), d5 = dot(ab, cp), d6 = dot(ac, cp);
        if (d6 >= 0 && d5 <= d6) q = c;
        else {
          const vb = d5 * d2 - d1 * d6;
          if (vb <= 0 && d2 >= 0 && d6 <= 0) {
            const w = d2 / (d2 - d6);
            q = [a[0] + w * ac[0], a[1] + w * ac[1], a[2] + w * ac[2]];
          } else {
            const va = d3 * d6 - d5 * d4;
            if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0) {
              const w = (d4 - d3) / (d4 - d3 + (d5 - d6));
              q = [b[0] + w * (c[0] - b[0]), b[1] + w * (c[1] - b[1]), b[2] + w * (c[2] - b[2])];
            } else {
              const den = 1 / (va + vb + vc);
              const v = vb * den, w = vc * den;
              q = [a[0] + ab[0] * v + ac[0] * w, a[1] + ab[1] * v + ac[1] * w, a[2] + ab[2] * v + ac[2] * w];
            }
          }
        }
      }
    }
  }
  const d = sub(p, q);
  return dot(d, d);
}


export function solveFea(mesh: FeaMesh, bc: FeaBoundary, mat: FeaMaterial, opt: FeaOptions, progress?: (it: number, res: number) => void): FeaResult {
  const P = mesh.positions, I = mesh.indices;
  const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < P.length; i += 3)
    for (let k = 0; k < 3; k++) {
      lo[k] = Math.min(lo[k], P[i + k]);
      hi[k] = Math.max(hi[k], P[i + k]);
    }
  const size = [hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]];
  let h: number;
  if (opt.targetElements) {
    // signed volume of the closed triangle mesh (divergence theorem)
    let vol = 0;
    for (let t = 0; t < I.length; t += 3) {
      const a = I[t] * 3, b = I[t + 1] * 3, c = I[t + 2] * 3;
      vol += (P[a] * (P[b + 1] * P[c + 2] - P[b + 2] * P[c + 1]) - P[a + 1] * (P[b] * P[c + 2] - P[b + 2] * P[c]) + P[a + 2] * (P[b] * P[c + 1] - P[b + 1] * P[c])) / 6;
    }
    vol = Math.abs(vol) || size[0] * size[1] * size[2];
    h = Math.cbrt(vol / opt.targetElements);
    // keep the grid within reason for very slender parts
    h = Math.max(h, Math.max(...size) / 400);
  } else h = Math.max(...size) / Math.max(4, opt.resolution ?? 40);
  const dims: [number, number, number] = [0, 1, 2].map((k) => Math.max(1, Math.round(size[k] / h))) as [number, number, number];
  // centre the grid on the part
  const origin: [number, number, number] = [0, 1, 2].map((k) => lo[k] + size[k] / 2 - (dims[k] * h) / 2) as [number, number, number];
  const [nx, ny, nz] = dims;
  const partial = opt.partialVolume !== false;
  const frac = partial ? cellFractions(mesh, origin, h, dims, 4) : Float32Array.from(voxelize(mesh, origin, h, dims));
  const MIN_FRAC = 0.15;
  const NX = nx + 1, NY = ny + 1, NZ = nz + 1;
  const nodeId = (i: number, j: number, k: number) => (k * NY + j) * NX + i;
  const nNodes = NX * NY * NZ;
  const used = new Uint8Array(nNodes);
  const elems: number[] = [];
  const phi: number[] = [];
  for (let k = 0; k < nz; k++)
    for (let j = 0; j < ny; j++)
      for (let i = 0; i < nx; i++) {
        const f = frac[(k * ny + j) * nx + i];
        if (f < MIN_FRAC) {
          frac[(k * ny + j) * nx + i] = 0;
          continue;
        }
        elems.push(i, j, k);
        phi.push(partial ? Math.min(1, f) : 1);
        for (const [a, b, c] of CORNERS) used[nodeId(i + a, j + b, k + c)] = 1;
      }
  const ne = elems.length / 3;
  if (!ne) throw new Error("解析メッシュを作成できません (ソリッドが薄すぎるか解像度が粗すぎます)");
  const conn = new Int32Array(ne * 8);
  for (let e = 0; e < ne; e++) for (let n = 0; n < 8; n++) conn[e * 8 + n] = nodeId(elems[e * 3] + CORNERS[n][0], elems[e * 3 + 1] + CORNERS[n][1], elems[e * 3 + 2] + CORNERS[n][2]);
  const volume = phi.reduce((s, f) => s + f, 0) * h * h * h;

  // ---- boundary nodes: solid nodes close to the selected faces
  const nodePos = (n: number) => {
    const i = n % NX, j = Math.floor(n / NX) % NY, k = Math.floor(n / (NX * NY));
    return [origin[0] + i * h, origin[1] + j * h, origin[2] + k * h];
  };
  const tri = (t: number) => [0, 1, 2].map((q) => [P[I[t * 3 + q] * 3], P[I[t * 3 + q] * 3 + 1], P[I[t * 3 + q] * 3 + 2]]);
  const near = (tris: number[]): Set<number> => {
    const T = tris.map(tri);
    const blo = [Infinity, Infinity, Infinity], bhi = [-Infinity, -Infinity, -Infinity];
    for (const t of T) for (const p of t) for (let k = 0; k < 3; k++) (blo[k] = Math.min(blo[k], p[k])), (bhi[k] = Math.max(bhi[k], p[k]));
    const r = h * 0.75, r2 = r * r;
    const out = new Set<number>();
    const i0 = Math.max(0, Math.floor((blo[0] - r - origin[0]) / h)), i1 = Math.min(nx, Math.ceil((bhi[0] + r - origin[0]) / h));
    const j0 = Math.max(0, Math.floor((blo[1] - r - origin[1]) / h)), j1 = Math.min(ny, Math.ceil((bhi[1] + r - origin[1]) / h));
    const k0 = Math.max(0, Math.floor((blo[2] - r - origin[2]) / h)), k1 = Math.min(nz, Math.ceil((bhi[2] + r - origin[2]) / h));
    for (let k = k0; k <= k1; k++)
      for (let j = j0; j <= j1; j++)
        for (let i = i0; i <= i1; i++) {
          const n = nodeId(i, j, k);
          if (!used[n]) continue;
          const p = nodePos(n);
          for (const t of T)
            if (pointTriDist2(p, t[0], t[1], t[2]) <= r2) {
              out.add(n);
              break;
            }
        }
    return out;
  };
  const fixed = new Uint8Array(nNodes);
  let fixedNodes = 0;
  for (const f of bc.fixed) for (const n of near(f)) if (!fixed[n]) (fixed[n] = 1), fixedNodes++;
  if (!fixedNodes) throw new Error("固定拘束の面に節点がありません (解像度を上げてください)");

  // ---- loads: integrate the traction over each triangle and lump it on the nearest face nodes
  const F = new Float64Array(nNodes * 3);
  let loadedNodes = 0;
  for (const l of bc.loads) {
    const N = near(l.tris);
    for (const n of fixed.keys()) if (fixed[n]) N.delete(n);
    if (!N.size) continue;
    loadedNodes += N.size;
    const T = l.tris.map(tri);
    const area = (t: number[][]) => {
      const u = [t[1][0] - t[0][0], t[1][1] - t[0][1], t[1][2] - t[0][2]], v = [t[2][0] - t[0][0], t[2][1] - t[0][1], t[2][2] - t[0][2]];
      const c = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
      const a = Math.hypot(c[0], c[1], c[2]);
      return { a: a / 2, n: a > 0 ? c.map((x) => x / a) : [0, 0, 0] };
    };
    const geo = T.map(area);
    const total = geo.reduce((s, g) => s + g.a, 0) || 1;
    const Nl = [...N];
    const nearestIn = (p: number[]) => {
      // closest face node among the 4x4x4 grid nodes around p, else brute force
      const ci = Math.round((p[0] - origin[0]) / h), cj = Math.round((p[1] - origin[1]) / h), ck = Math.round((p[2] - origin[2]) / h);
      let best = -1, bd = Infinity;
      for (let dk = -1; dk <= 1; dk++)
        for (let dj = -1; dj <= 1; dj++)
          for (let di = -1; di <= 1; di++) {
            const i = ci + di, j = cj + dj, k = ck + dk;
            if (i < 0 || j < 0 || k < 0 || i > nx || j > ny || k > nz) continue;
            const n = nodeId(i, j, k);
            if (!N.has(n)) continue;
            const q = nodePos(n);
            const d = (q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2 + (q[2] - p[2]) ** 2;
            if (d < bd) (bd = d), (best = n);
          }
      if (best < 0)
        for (const n of Nl) {
          const q = nodePos(n);
          const d = (q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2 + (q[2] - p[2]) ** 2;
          if (d < bd) (bd = d), (best = n);
        }
      return best;
    };
    T.forEach((t, ti) => {
      const { a, n } = geo[ti];
      if (a <= 0) return;
      const tr = l.pressure !== undefined ? n.map((x) => -x * l.pressure! * a) : (l.force ?? [0, 0, 0]).map((x) => (x * a) / total);
      // barycentric sample grid fine enough for the voxel size
      const edge = Math.max(...[0, 1, 2].map((q) => Math.hypot(t[(q + 1) % 3][0] - t[q][0], t[(q + 1) % 3][1] - t[q][1], t[(q + 1) % 3][2] - t[q][2])));
      const m = Math.min(40, Math.max(1, Math.ceil((edge / h) * 2)));
      const pts: number[][] = [];
      for (let i = 0; i < m; i++)
        for (let j = 0; j < m - i; j++) {
          // centroids of the sub-triangles (upright ones; equal area for a uniform split)
          const u = (i + 1 / 3) / m, v = (j + 1 / 3) / m;
          pts.push([0, 1, 2].map((q) => t[0][q] + u * (t[1][q] - t[0][q]) + v * (t[2][q] - t[0][q])));
          if (i + j < m - 1) {
            const u2 = (i + 2 / 3) / m, v2 = (j + 2 / 3) / m;
            pts.push([0, 1, 2].map((q) => t[0][q] + u2 * (t[1][q] - t[0][q]) + v2 * (t[2][q] - t[0][q])));
          }
        }
      for (const p of pts) {
        const nd = nearestIn(p);
        for (let k = 0; k < 3; k++) F[nd * 3 + k] += tr[k] / pts.length;
      }
    });
  }
  if (bc.gravity) {
    const g = bc.gravity;
    const w = h * h * h * g.density * 9.81e-6; // N per full cell
    for (let e = 0; e < ne; e++) for (let n = 0; n < 8; n++) for (let k = 0; k < 3; k++) F[conn[e * 8 + n] * 3 + k] += (w * phi[e] * g.dir[k]) / 8;
  }
  if (!loadedNodes && !bc.gravity) throw new Error("荷重の面に節点がありません");
  const applied: [number, number, number] = [0, 0, 0];
  for (let n = 0; n < nNodes; n++) for (let k = 0; k < 3; k++) applied[k] += F[n * 3 + k];

  // ---- solve K u = F (matrix-free PCG)
  const el = elementData(mat, h, opt.element ?? "h11");
  const KE = el.K;
  const N3 = nNodes * 3;
  const free = new Uint8Array(N3);
  for (let n = 0; n < nNodes; n++) if (used[n] && !fixed[n]) free[n * 3] = free[n * 3 + 1] = free[n * 3 + 2] = 1;
  const diag = new Float64Array(N3);
  for (let e = 0; e < ne; e++) for (let a = 0; a < 24; a++) diag[conn[e * 8 + ((a / 3) | 0)] * 3 + (a % 3)] += KE[a * 25] * phi[e];
  const ue = new Float64Array(24);
  const Kx = (x: Float64Array, y: Float64Array, mask = true) => {
    y.fill(0);
    for (let e = 0; e < ne; e++) {
      const c = e * 8, s = phi[e];
      for (let n = 0; n < 8; n++) {
        const g = conn[c + n] * 3;
        ue[n * 3] = x[g];
        ue[n * 3 + 1] = x[g + 1];
        ue[n * 3 + 2] = x[g + 2];
      }
      for (let a = 0; a < 24; a++) {
        let sum = 0;
        const row = a * 24;
        for (let b = 0; b < 24; b++) sum += KE[row + b] * ue[b];
        y[conn[c + ((a / 3) | 0)] * 3 + (a % 3)] += sum * s;
      }
    }
    if (mask) for (let i = 0; i < N3; i++) if (!free[i]) y[i] = 0;
  };
  const mg = opt.solver === "jacobi" ? null : new Multigrid({ dims, elems, KE, phi, fixed, used });
  const prec = (r: Float64Array, z: Float64Array) => {
    if (mg) mg.precondition(r, z);
    else for (let i = 0; i < N3; i++) z[i] = free[i] && diag[i] ? r[i] / diag[i] : 0;
  };
  const u = new Float64Array(N3), r = new Float64Array(N3), z = new Float64Array(N3), p = new Float64Array(N3), q = new Float64Array(N3);
  for (let i = 0; i < N3; i++) r[i] = free[i] ? F[i] : 0;
  const bnorm = Math.sqrt(r.reduce((s, v) => s + v * v, 0)) || 1;
  prec(r, z);
  p.set(z);
  let rz = r.reduce((s, v, i) => s + v * z[i], 0);
  const maxIter = opt.maxIter ?? 8000, tol = opt.tol ?? 1e-8;
  let it = 0, res = 1;
  for (; it < maxIter; it++) {
    Kx(p, q);
    let pq = 0;
    for (let i = 0; i < N3; i++) pq += p[i] * q[i];
    if (!(pq > 0)) break;
    const alpha = rz / pq;
    let rr = 0;
    for (let i = 0; i < N3; i++) {
      u[i] += alpha * p[i];
      r[i] -= alpha * q[i];
      rr += r[i] * r[i];
    }
    res = Math.sqrt(rr) / bnorm;
    if (progress && it % 50 === 0) progress(it, res);
    if (res < tol) break;
    prec(r, z);
    let rz2 = 0;
    for (let i = 0; i < N3; i++) rz2 += r[i] * z[i];
    const beta = rz2 / rz;
    rz = rz2;
    for (let i = 0; i < N3; i++) p[i] = z[i] + beta * p[i];
  }

  // ---- reactions at the supports (equilibrium check)
  Kx(u, q, false);
  const reaction: [number, number, number] = [0, 0, 0];
  for (let n = 0; n < nNodes; n++) if (fixed[n]) for (let k = 0; k < 3; k++) reaction[k] += q[n * 3 + k] - F[n * 3 + k];
  const an = Math.hypot(...applied);
  const equilibriumError = an > 0 ? Math.hypot(applied[0] + reaction[0], applied[1] + reaction[1], applied[2] + reaction[2]) / an : 0;

  // ---- stresses: Gauss points -> corners -> nodal average (weighted by solid fraction)
  // element on a stair-stepped (not grid aligned) boundary: partial, or with an exposed edge/corner neighbour
  const isActive = (i: number, j: number, k: number) => i >= 0 && j >= 0 && k >= 0 && i < nx && j < ny && k < nz && frac[(k * ny + j) * nx + i] > 0;
  const exposed = (e: number) => {
    if (phi[e] < 0.999) return true;
    const i = elems[e * 3], j = elems[e * 3 + 1], k = elems[e * 3 + 2];
    // a flat, grid-aligned surface leaves its face neighbours missing only in one direction per axis;
    // a step has a missing diagonal neighbour while both face neighbours exist
    for (let a = -1; a <= 1; a += 2)
      for (let b = -1; b <= 1; b += 2) {
        if (isActive(i + a, j, k) && isActive(i, j + b, k) && !isActive(i + a, j + b, k)) return true;
        if (isActive(i, j + a, k) && isActive(i, j, k + b) && !isActive(i, j + a, k + b)) return true;
        if (isActive(i + a, j, k) && isActive(i, j, k + b) && !isActive(i + a, j, k + b)) return true;
      }
    return false;
  };
  const D = dMatrix(mat);
  const acc = new Float64Array(nNodes * 6), wsum = new Float64Array(nNodes);
  // auto: contributions of stair-step elements, used only where no regular element touches the node
  const accX = new Float64Array(nNodes * 6), wsumX = new Float64Array(nNodes);
  const full = new Float64Array(33);
  const sg: number[][] = Array.from({ length: 8 }, () => new Array(6).fill(0));
  for (let e = 0; e < ne; e++) {
    for (let n = 0; n < 8; n++) for (let k = 0; k < 3; k++) full[n * 3 + k] = u[conn[e * 8 + n] * 3 + k];
    if (el.T) for (let a = 0; a < 9; a++) full[24 + a] = el.T[a].reduce((s, v, j) => s + v * full[j], 0);
    const nc = el.T ? 33 : 24;
    for (let g = 0; g < 8; g++) {
      const B = el.Bg[g];
      const eps = [0, 0, 0, 0, 0, 0];
      for (let k = 0; k < 6; k++) {
        let s = 0;
        for (let j = 0; j < nc; j++) s += B[k][j] * full[j];
        eps[k] = s;
      }
      for (let k = 0; k < 6; k++) sg[g][k] = D[k].reduce((s, v, j) => s + v * eps[j], 0);
    }
    const w = phi[e];
    const mode = opt.recovery ?? "auto";
    const exp = mode === "auto" && exposed(e);
    const useMean = mode === "mean" || exp;
    for (let c = 0; c < 8; c++) {
      const node = conn[e * 8 + c];
      for (let k = 0; k < 6; k++) {
        let s = 0;
        if (useMean) for (let g = 0; g < 8; g++) s += sg[g][k] / 8;
        else for (let g = 0; g < 8; g++) s += EXTRAP[c][g] * sg[g][k];
        if (exp) accX[node * 6 + k] += s * w;
        else acc[node * 6 + k] += s * w;
      }
      if (exp) wsumX[node] += w;
      else wsum[node] += w;
    }
  }
  const stress = new Float32Array(nNodes * 6), vm = new Float32Array(nNodes), s1 = new Float32Array(nNodes), s3 = new Float32Array(nNodes);
  const disp = new Float32Array(N3);
  let maxVm = 0, maxS1 = -Infinity, minS3 = Infinity, maxDisp = 0;
  for (let n = 0; n < nNodes; n++)
    if (!wsum[n] && wsumX[n]) {
      for (let k = 0; k < 6; k++) acc[n * 6 + k] = accX[n * 6 + k];
      wsum[n] = wsumX[n];
    }
  for (let n = 0; n < nNodes; n++) {
    disp[n * 3] = u[n * 3];
    disp[n * 3 + 1] = u[n * 3 + 1];
    disp[n * 3 + 2] = u[n * 3 + 2];
    if (!wsum[n]) continue;
    const t = [0, 1, 2, 3, 4, 5].map((k) => acc[n * 6 + k] / wsum[n]);
    stress.set(t, n * 6);
    const v = vonMises(t);
    const pr = principal(t);
    vm[n] = v;
    s1[n] = pr[0];
    s3[n] = pr[2];
    maxVm = Math.max(maxVm, v);
    maxS1 = Math.max(maxS1, pr[0]);
    minS3 = Math.min(minS3, pr[2]);
    maxDisp = Math.max(maxDisp, Math.hypot(u[n * 3], u[n * 3 + 1], u[n * 3 + 2]));
  }
  return {
    h, origin, dims, frac, disp, stress, vm, s1, s3, used,
    maxVm, maxS1, minS3, maxDisp, applied, reaction, equilibriumError,
    elements: ne, iterations: it, converged: res < tol, fixedNodes, loadedNodes, volume,
  };
}

// ------------------------------------------------------- sampling ---

/** Trilinear interpolation of a nodal field (only nodes of the solid count). */
export function sampleNodal(r: FeaResult, field: Float32Array, comps: number, p: ArrayLike<number>): number[] {
  const [nx, ny, nz] = r.dims;
  const NX = nx + 1, NY = ny + 1;
  const fx = Math.min(nx, Math.max(0, (p[0] - r.origin[0]) / r.h));
  const fy = Math.min(ny, Math.max(0, (p[1] - r.origin[1]) / r.h));
  const fz = Math.min(nz, Math.max(0, (p[2] - r.origin[2]) / r.h));
  const i0 = Math.min(nx - 1, Math.floor(fx)), j0 = Math.min(ny - 1, Math.floor(fy)), k0 = Math.min(nz - 1, Math.floor(fz));
  const tx = fx - i0, ty = fy - j0, tz = fz - k0;
  const out = new Array(comps).fill(0);
  let wsum = 0;
  for (let dk = 0; dk <= 1; dk++)
    for (let dj = 0; dj <= 1; dj++)
      for (let di = 0; di <= 1; di++) {
        const n = ((k0 + dk) * NY + (j0 + dj)) * NX + (i0 + di);
        if (!r.used[n]) continue;
        const w = (di ? tx : 1 - tx) * (dj ? ty : 1 - ty) * (dk ? tz : 1 - tz) + 1e-9;
        for (let c = 0; c < comps; c++) out[c] += w * field[n * comps + c];
        wsum += w;
      }
  if (wsum > 0) for (let c = 0; c < comps; c++) out[c] /= wsum;
  return out;
}

export function sampleVm(r: FeaResult, p: ArrayLike<number>): number {
  return sampleNodal(r, r.vm, 1, p)[0];
}

export function sampleDisp(r: FeaResult, p: ArrayLike<number>): [number, number, number] {
  return sampleNodal(r, r.disp, 3, p) as [number, number, number];
}
