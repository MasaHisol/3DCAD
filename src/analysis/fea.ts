// Linear static stress analysis (Inventor "応力解析" equivalent, simplified).
//
// The solid is voxelised into equal 8-node hexahedral elements, so every
// element shares one stiffness matrix and the system can be solved
// matrix-free with a Jacobi preconditioned conjugate gradient. Units: mm, N,
// MPa (N/mm²). Accuracy is that of a stair-stepped mesh — fine for stress
// hot-spots, deflection and safety factors at the design stage.

export interface FeaMaterial {
  /** Young's modulus, MPa. */
  E: number;
  nu: number;
  /** Yield strength, MPa. */
  yield: number;
}

export const FEA_MATERIALS: Record<string, FeaMaterial> = {
  汎用: { E: 210000, nu: 0.3, yield: 250 },
  鋼: { E: 210000, nu: 0.3, yield: 245 },
  ステンレス鋼: { E: 193000, nu: 0.3, yield: 205 },
  "アルミニウム 6061": { E: 68900, nu: 0.33, yield: 275 },
  黄銅: { E: 100000, nu: 0.34, yield: 125 },
  銅: { E: 117000, nu: 0.34, yield: 70 },
  チタン: { E: 110000, nu: 0.34, yield: 880 },
  "ABS 樹脂": { E: 2200, nu: 0.35, yield: 40 },
  "ナイロン 6/6": { E: 2800, nu: 0.39, yield: 70 },
  ポリカーボネート: { E: 2400, nu: 0.37, yield: 62 },
  ゴム: { E: 5, nu: 0.48, yield: 15 },
  "木材 (パイン)": { E: 9000, nu: 0.3, yield: 40 },
};

/** Triangle soup of the solid (world mm). */
export interface FeaMesh {
  positions: Float32Array | number[];
  indices: Uint32Array | number[];
}

export interface FeaBoundary {
  /** Triangles (indices into the mesh) of faces that are fixed. */
  fixed: number[][];
  /** Loads: triangles of a face and the total force vector (N) on it. */
  loads: { tris: number[]; force: [number, number, number] }[];
}

export interface FeaOptions {
  /** Elements along the longest side. */
  resolution: number;
  maxIter?: number;
  tol?: number;
}

export interface FeaResult {
  h: number;
  origin: [number, number, number];
  dims: [number, number, number];
  /** Active element flags (nx*ny*nz). */
  active: Uint8Array;
  /** Von Mises stress per element (MPa), 0 for inactive. */
  vm: Float32Array;
  /** Nodal displacement (mm), 3 per grid node ((nx+1)(ny+1)(nz+1)). */
  disp: Float32Array;
  /** Grid nodes belonging to the solid. */
  used: Uint8Array;
  maxVm: number;
  maxDisp: number;
  elements: number;
  iterations: number;
  converged: boolean;
  fixedNodes: number;
  loadedNodes: number;
}

// ------------------------------------------------------- voxelisation ---

/** Inside flags for the element centres (ray parity along +x). */
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

// ---------------------------------------------------------- element ---

const CORNERS = [
  [0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0],
  [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1],
];

function dMatrix(m: FeaMaterial): number[][] {
  const { E, nu } = m;
  const c = E / ((1 + nu) * (1 - 2 * nu));
  const D = Array.from({ length: 6 }, () => new Array(6).fill(0));
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++) D[i][j] = c * (i === j ? 1 - nu : nu);
  for (let i = 3; i < 6; i++) D[i][i] = c * (1 - 2 * nu) / 2;
  return D;
}

/** Strain-displacement matrix (6x24) at local point (x,y,z) ∈ [0,1]³ of a cube of side h. */
function bMatrix(x: number, y: number, z: number, h: number): number[][] {
  const B = Array.from({ length: 6 }, () => new Array(24).fill(0));
  for (let n = 0; n < 8; n++) {
    const [cx, cy, cz] = CORNERS[n];
    const fx = cx ? x : 1 - x, fy = cy ? y : 1 - y, fz = cz ? z : 1 - z;
    const sx = cx ? 1 : -1, sy = cy ? 1 : -1, sz = cz ? 1 : -1;
    const dx = (sx * fy * fz) / h, dy = (fx * sy * fz) / h, dz = (fx * fy * sz) / h;
    const c = n * 3;
    B[0][c] = dx;
    B[1][c + 1] = dy;
    B[2][c + 2] = dz;
    B[3][c] = dy;
    B[3][c + 1] = dx;
    B[4][c + 1] = dz;
    B[4][c + 2] = dy;
    B[5][c] = dz;
    B[5][c + 2] = dx;
  }
  return B;
}

/** 24x24 element stiffness (2x2x2 Gauss). */
export function elementStiffness(m: FeaMaterial, h: number): Float64Array {
  const D = dMatrix(m);
  const K = new Float64Array(576);
  const g = [0.5 - 0.5 / Math.sqrt(3), 0.5 + 0.5 / Math.sqrt(3)];
  const w = (h * h * h) / 8;
  for (const x of g)
    for (const y of g)
      for (const z of g) {
        const B = bMatrix(x, y, z, h);
        // DB (6x24)
        const DB = D.map((row) => {
          const r = new Array(24).fill(0);
          for (let k = 0; k < 6; k++) if (row[k]) for (let j = 0; j < 24; j++) r[j] += row[k] * B[k][j];
          return r;
        });
        for (let i = 0; i < 24; i++)
          for (let j = 0; j < 24; j++) {
            let s = 0;
            for (let k = 0; k < 6; k++) s += B[k][i] * DB[k][j];
            K[i * 24 + j] += s * w;
          }
      }
  return K;
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
  const P = mesh.positions;
  const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < P.length; i += 3)
    for (let k = 0; k < 3; k++) {
      lo[k] = Math.min(lo[k], P[i + k]);
      hi[k] = Math.max(hi[k], P[i + k]);
    }
  const size = [hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]];
  const h = Math.max(...size) / Math.max(4, opt.resolution);
  const dims: [number, number, number] = [0, 1, 2].map((k) => Math.max(1, Math.round(size[k] / h))) as [number, number, number];
  // centre the grid on the part
  const origin: [number, number, number] = [0, 1, 2].map((k) => lo[k] + size[k] / 2 - (dims[k] * h) / 2) as [number, number, number];
  const [nx, ny, nz] = dims;
  const active = voxelize(mesh, origin, h, dims);
  const NX = nx + 1, NY = ny + 1, NZ = nz + 1;
  const nodeId = (i: number, j: number, k: number) => (k * NY + j) * NX + i;
  const nNodes = NX * NY * NZ;
  const used = new Uint8Array(nNodes);
  const elems: number[] = [];
  for (let k = 0; k < nz; k++)
    for (let j = 0; j < ny; j++)
      for (let i = 0; i < nx; i++) {
        if (!active[(k * ny + j) * nx + i]) continue;
        elems.push(i, j, k);
        for (const [a, b, c] of CORNERS) used[nodeId(i + a, j + b, k + c)] = 1;
      }
  const ne = elems.length / 3;
  if (!ne) throw new Error("解析メッシュを作成できません (ソリッドが薄すぎるか解像度が粗すぎます)");
  // element -> 8 node ids
  const conn = new Int32Array(ne * 8);
  for (let e = 0; e < ne; e++) for (let n = 0; n < 8; n++) conn[e * 8 + n] = nodeId(elems[e * 3] + CORNERS[n][0], elems[e * 3 + 1] + CORNERS[n][1], elems[e * 3 + 2] + CORNERS[n][2]);

  // boundary nodes: used nodes close to the selected faces
  const nodePos = (n: number) => {
    const i = n % NX, j = Math.floor(n / NX) % NY, k = Math.floor(n / (NX * NY));
    return [origin[0] + i * h, origin[1] + j * h, origin[2] + k * h];
  };
  const I = mesh.indices;
  const tri = (t: number) => [0, 1, 2].map((q) => [P[I[t * 3 + q] * 3], P[I[t * 3 + q] * 3 + 1], P[I[t * 3 + q] * 3 + 2]]);
  const near = (tris: number[]): number[] => {
    const T = tris.map(tri);
    const blo = [Infinity, Infinity, Infinity], bhi = [-Infinity, -Infinity, -Infinity];
    for (const t of T) for (const p of t) for (let k = 0; k < 3; k++) (blo[k] = Math.min(blo[k], p[k])), (bhi[k] = Math.max(bhi[k], p[k]));
    const r = h * 0.75, r2 = r * r;
    const out: number[] = [];
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
              out.push(n);
              break;
            }
        }
    return out;
  };
  const fixed = new Uint8Array(nNodes);
  let fixedNodes = 0;
  for (const f of bc.fixed) for (const n of near(f)) if (!fixed[n]) (fixed[n] = 1), fixedNodes++;
  if (!fixedNodes) throw new Error("固定拘束の面に節点がありません (解像度を上げてください)");
  const F = new Float64Array(nNodes * 3);
  let loadedNodes = 0;
  for (const l of bc.loads) {
    const ns = near(l.tris).filter((n) => !fixed[n]);
    if (!ns.length) continue;
    loadedNodes += ns.length;
    for (const n of ns) for (let k = 0; k < 3; k++) F[n * 3 + k] += l.force[k] / ns.length;
  }
  if (!loadedNodes) throw new Error("荷重の面に節点がありません");

  const KE = elementStiffness(mat, h);
  const N3 = nNodes * 3;
  const free = new Uint8Array(N3);
  for (let n = 0; n < nNodes; n++) if (used[n] && !fixed[n]) free[n * 3] = free[n * 3 + 1] = free[n * 3 + 2] = 1;
  const diag = new Float64Array(N3);
  for (let e = 0; e < ne; e++) for (let a = 0; a < 24; a++) diag[conn[e * 8 + (a / 3) | 0] * 3 + (a % 3)] += KE[a * 25];
  const Kx = (x: Float64Array, y: Float64Array) => {
    y.fill(0);
    const ue = new Float64Array(24);
    for (let e = 0; e < ne; e++) {
      const c = e * 8;
      for (let n = 0; n < 8; n++) {
        const g = conn[c + n] * 3;
        ue[n * 3] = x[g];
        ue[n * 3 + 1] = x[g + 1];
        ue[n * 3 + 2] = x[g + 2];
      }
      for (let a = 0; a < 24; a++) {
        let s = 0;
        const row = a * 24;
        for (let b = 0; b < 24; b++) s += KE[row + b] * ue[b];
        y[conn[c + ((a / 3) | 0)] * 3 + (a % 3)] += s;
      }
    }
    for (let i = 0; i < N3; i++) if (!free[i]) y[i] = 0;
  };
  // preconditioned conjugate gradient
  const u = new Float64Array(N3), r = new Float64Array(N3), z = new Float64Array(N3), p = new Float64Array(N3), q = new Float64Array(N3);
  for (let i = 0; i < N3; i++) r[i] = free[i] ? F[i] : 0;
  const bnorm = Math.sqrt(r.reduce((s, v) => s + v * v, 0)) || 1;
  for (let i = 0; i < N3; i++) z[i] = free[i] && diag[i] ? r[i] / diag[i] : 0;
  p.set(z);
  let rz = r.reduce((s, v, i) => s + v * z[i], 0);
  const maxIter = opt.maxIter ?? 5000, tol = opt.tol ?? 1e-6;
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
    let rz2 = 0;
    for (let i = 0; i < N3; i++) {
      z[i] = free[i] && diag[i] ? r[i] / diag[i] : 0;
      rz2 += r[i] * z[i];
    }
    const beta = rz2 / rz;
    rz = rz2;
    for (let i = 0; i < N3; i++) p[i] = z[i] + beta * p[i];
  }

  // element stresses at the centre
  const D = dMatrix(mat);
  const Bc = bMatrix(0.5, 0.5, 0.5, h);
  const vm = new Float32Array(nx * ny * nz);
  let maxVm = 0;
  const ue = new Float64Array(24);
  for (let e = 0; e < ne; e++) {
    for (let n = 0; n < 8; n++) for (let k = 0; k < 3; k++) ue[n * 3 + k] = u[conn[e * 8 + n] * 3 + k];
    const eps = Bc.map((row) => row.reduce((s, v, j) => s + v * ue[j], 0));
    const s = D.map((row) => row.reduce((acc, v, j) => acc + v * eps[j], 0));
    const v = Math.sqrt(0.5 * ((s[0] - s[1]) ** 2 + (s[1] - s[2]) ** 2 + (s[2] - s[0]) ** 2) + 3 * (s[3] ** 2 + s[4] ** 2 + s[5] ** 2));
    const idx = (elems[e * 3 + 2] * ny + elems[e * 3 + 1]) * nx + elems[e * 3];
    vm[idx] = v;
    if (v > maxVm) maxVm = v;
  }
  const disp = new Float32Array(N3);
  let maxDisp = 0;
  for (let n = 0; n < nNodes; n++) {
    disp[n * 3] = u[n * 3];
    disp[n * 3 + 1] = u[n * 3 + 1];
    disp[n * 3 + 2] = u[n * 3 + 2];
    maxDisp = Math.max(maxDisp, Math.hypot(u[n * 3], u[n * 3 + 1], u[n * 3 + 2]));
  }
  return { h, origin, dims, active, vm, disp, used, maxVm, maxDisp, elements: ne, iterations: it, converged: res < tol, fixedNodes, loadedNodes };
}

// ------------------------------------------------------- sampling ---

/** Von Mises at a surface point: average of the active elements around it. */
export function sampleVm(r: FeaResult, p: ArrayLike<number>): number {
  const [nx, ny, nz] = r.dims;
  const fi = (p[0] - r.origin[0]) / r.h - 0.5, fj = (p[1] - r.origin[1]) / r.h - 0.5, fk = (p[2] - r.origin[2]) / r.h - 0.5;
  const i0 = Math.floor(fi), j0 = Math.floor(fj), k0 = Math.floor(fk);
  let s = 0, n = 0;
  for (let dk = 0; dk <= 1; dk++)
    for (let dj = 0; dj <= 1; dj++)
      for (let di = 0; di <= 1; di++) {
        const i = i0 + di, j = j0 + dj, k = k0 + dk;
        if (i < 0 || j < 0 || k < 0 || i >= nx || j >= ny || k >= nz) continue;
        const idx = (k * ny + j) * nx + i;
        if (!r.active[idx]) continue;
        s += r.vm[idx];
        n++;
      }
  return n ? s / n : 0;
}

/** Displacement at a point: trilinear in the grid cell (nodes outside the solid count as 0 weight). */
export function sampleDisp(r: FeaResult, p: ArrayLike<number>): [number, number, number] {
  const [nx, ny, nz] = r.dims;
  const NX = nx + 1, NY = ny + 1;
  const fx = Math.min(nx, Math.max(0, (p[0] - r.origin[0]) / r.h));
  const fy = Math.min(ny, Math.max(0, (p[1] - r.origin[1]) / r.h));
  const fz = Math.min(nz, Math.max(0, (p[2] - r.origin[2]) / r.h));
  const i0 = Math.min(nx - 1, Math.floor(fx)), j0 = Math.min(ny - 1, Math.floor(fy)), k0 = Math.min(nz - 1, Math.floor(fz));
  const tx = fx - i0, ty = fy - j0, tz = fz - k0;
  const out: [number, number, number] = [0, 0, 0];
  let wsum = 0;
  for (let dk = 0; dk <= 1; dk++)
    for (let dj = 0; dj <= 1; dj++)
      for (let di = 0; di <= 1; di++) {
        const n = ((k0 + dk) * NY + (j0 + dj)) * NX + (i0 + di);
        const d = r.disp;
        if (!r.used[n]) continue;
        const w = (di ? tx : 1 - tx) * (dj ? ty : 1 - ty) * (dk ? tz : 1 - tz);
        out[0] += w * d[n * 3];
        out[1] += w * d[n * 3 + 1];
        out[2] += w * d[n * 3 + 2];
        wsum += w;
      }
  if (wsum > 1e-9) for (let k = 0; k < 3; k++) out[k] /= wsum;
  return out;
}
