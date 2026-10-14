// Topology optimisation (Inventor 「形状ジェネレータ」/ Fusion "Generative"
// light): minimum compliance for a target volume fraction with the SIMP
// method on the voxel model.
//
//   E(x) = E · (xmin + (1 - xmin) x^p),  p = 3
//   sensitivity filter (Sigmund 1999), optimality-criteria update.
//
// Elements next to supports and loaded faces are kept solid (non-design
// space). The density field is turned into a smooth closed surface with
// surface nets for display / STL export.

import { assembleLoads, buildGrid, buildOperator, CORNERS, type FeaBoundary, type FeaMaterial, type FeaMesh, type FeaOptions } from "./fea";

export interface TopoOptions {
  /** Target fraction of the original volume (0.05 – 0.95). */
  volFrac: number;
  iterations?: number;
  penal?: number;
  /** Filter radius in elements. */
  filterR?: number;
}

export interface TopoResult {
  h: number;
  origin: [number, number, number];
  dims: [number, number, number];
  used: Uint8Array;
  /** Element densities on the full grid (nx·ny·nz), 0 outside the part. */
  density: Float32Array;
  /** Nodal densities (for smooth display / iso-surface). */
  nodal: Float32Array;
  /** Compliance history (N·mm). */
  history: number[];
  volumeFraction: number;
  /** Optimised compliance / compliance of the full design. */
  stiffnessRatio: number;
  elements: number;
  iterations: number;
  converged: boolean;
  /** Iso-surface of the optimised shape (world mm). */
  surface: { positions: Float32Array; indices: Uint32Array };
}

export function solveTopology(mesh: FeaMesh, bc: FeaBoundary, mat: FeaMaterial, opt: FeaOptions, topt: TopoOptions, progress?: (it: number, change: number) => void): TopoResult {
  const G = buildGrid(mesh, opt);
  const { nx, ny, nz, ne, conn, elems } = G;
  const phi0 = Float64Array.from(G.phi as ArrayLike<number>);
  const { fixed, F } = assembleLoads(G, bc, mat, opt);
  const p = topt.penal ?? 3, xmin = 1e-3;
  const vf = Math.min(0.95, Math.max(0.05, topt.volFrac));
  const maxIt = topt.iterations ?? 40;
  // passive (always solid): elements touching supports or loaded nodes
  const passive = new Uint8Array(ne);
  for (let e = 0; e < ne; e++)
    for (let n = 0; n < 8; n++) {
      const node = conn[e * 8 + n];
      if (fixed[node] || F[node * 3] || F[node * 3 + 1] || F[node * 3 + 2]) passive[e] = 1;
    }
  const x = new Float64Array(ne).fill(vf);
  for (let e = 0; e < ne; e++) if (passive[e]) x[e] = 1;
  // filter neighbourhoods on the grid
  const R = topt.filterR ?? 1.5;
  const rr = Math.ceil(R);
  const index = new Int32Array(nx * ny * nz).fill(-1);
  for (let e = 0; e < ne; e++) index[(elems[e * 3 + 2] * ny + elems[e * 3 + 1]) * nx + elems[e * 3]] = e;
  const nbr: { e: number; w: number }[][] = [];
  for (let e = 0; e < ne; e++) {
    const i = elems[e * 3], j = elems[e * 3 + 1], k = elems[e * 3 + 2];
    const list: { e: number; w: number }[] = [];
    for (let dk = -rr; dk <= rr; dk++)
      for (let dj = -rr; dj <= rr; dj++)
        for (let di = -rr; di <= rr; di++) {
          const a = i + di, b = j + dj, c = k + dk;
          if (a < 0 || b < 0 || c < 0 || a >= nx || b >= ny || c >= nz) continue;
          const f = index[(c * ny + b) * nx + a];
          if (f < 0) continue;
          const w = R - Math.hypot(di, dj, dk);
          if (w > 0) list.push({ e: f, w });
        }
    nbr.push(list);
  }
  const totalV = phi0.reduce((s, v) => s + v, 0);
  const history: number[] = [];
  let KE: Float64Array | null = null;
  let c0 = 0, it = 0, change = 1;
  const ue = new Float64Array(24);
  const solveWith = (xx: Float64Array) => {
    const phi = Float64Array.from(phi0, (v, e) => v * (xmin + (1 - xmin) * xx[e] ** p));
    const op = buildOperator({ ...G, phi: phi as unknown as number[] }, mat, opt, fixed);
    KE = op.KE;
    return op.solve(F, undefined, 1e-6).u;
  };
  // reference: the full (all solid) design
  {
    const u = solveWith(new Float64Array(ne).fill(1));
    for (let i = 0; i < F.length; i++) c0 += F[i] * u[i];
  }
  const dc = new Float64Array(ne), dcf = new Float64Array(ne);
  for (; it < maxIt; it++) {
    const u = solveWith(x);
    let c = 0;
    for (let i = 0; i < F.length; i++) c += F[i] * u[i];
    history.push(c);
    // element strain energy -> sensitivities
    for (let e = 0; e < ne; e++) {
      for (let n = 0; n < 8; n++) for (let k = 0; k < 3; k++) ue[n * 3 + k] = u[conn[e * 8 + n] * 3 + k];
      let se = 0;
      for (let a = 0; a < 24; a++) {
        let s = 0;
        for (let b = 0; b < 24; b++) s += KE![a * 24 + b] * ue[b];
        se += ue[a] * s;
      }
      dc[e] = -p * (1 - xmin) * x[e] ** (p - 1) * se * phi0[e];
    }
    // sensitivity filter
    for (let e = 0; e < ne; e++) {
      let s = 0, ws = 0;
      for (const { e: f, w } of nbr[e]) {
        s += w * x[f] * dc[f];
        ws += w;
      }
      dcf[e] = s / (Math.max(x[e], 1e-3) * ws);
    }
    // optimality criteria with bisection on the volume multiplier
    let l1 = 0, l2 = 1e12;
    const move = 0.2;
    const xn = new Float64Array(ne);
    while ((l2 - l1) / (l1 + l2) > 1e-4) {
      const lm = (l1 + l2) / 2;
      let vol = 0;
      for (let e = 0; e < ne; e++) {
        if (passive[e]) xn[e] = 1;
        else {
          const b = Math.sqrt(Math.max(0, -dcf[e]) / (lm * phi0[e] || 1e-30));
          xn[e] = Math.max(0.001, Math.max(x[e] - move, Math.min(1, Math.min(x[e] + move, x[e] * b))));
        }
        vol += xn[e] * phi0[e];
      }
      if (vol > vf * totalV) l1 = lm;
      else l2 = lm;
    }
    change = 0;
    for (let e = 0; e < ne; e++) change = Math.max(change, Math.abs(xn[e] - x[e]));
    x.set(xn);
    if (progress) progress(it, change);
    if (change < 0.01 && it > 5) {
      it++;
      break;
    }
  }
  // outputs on the full grid
  const density = new Float32Array(nx * ny * nz);
  for (let e = 0; e < ne; e++) density[(elems[e * 3 + 2] * ny + elems[e * 3 + 1]) * nx + elems[e * 3]] = x[e];
  const NX = nx + 1, NY = ny + 1, NZ = nz + 1;
  const nodal = new Float32Array(NX * NY * NZ), cnt = new Float32Array(NX * NY * NZ);
  for (let e = 0; e < ne; e++)
    for (let n = 0; n < 8; n++) {
      const node = conn[e * 8 + n];
      nodal[node] += x[e];
      cnt[node] += 1;
    }
  // nodes on the part boundary are averaged with the (empty) outside so the surface closes
  for (let i = 0; i < nodal.length; i++) if (cnt[i]) nodal[i] /= 8;
  let vol = 0;
  for (let e = 0; e < ne; e++) vol += x[e] * phi0[e];
  const cFinal = history[history.length - 1] ?? c0;
  return {
    h: G.h,
    origin: G.origin,
    dims: G.dims,
    used: G.used,
    density,
    nodal,
    history,
    volumeFraction: vol / totalV,
    stiffnessRatio: c0 / cFinal,
    elements: ne,
    iterations: it,
    converged: change < 0.01,
    surface: surfaceNets(nodal, [NX, NY, NZ], G.origin, G.h, 0.5),
  };
}

/**
 * Surface nets: one vertex per cell crossing the iso level (mean of the
 * edge crossings), one quad per grid edge with a sign change. The field is
 * treated as 0 outside the grid, so the surface is closed.
 */
export function surfaceNets(field: Float32Array, dims: [number, number, number], origin: [number, number, number], h: number, iso: number): { positions: Float32Array; indices: Uint32Array } {
  const [NX, NY, NZ] = dims;
  const val = (i: number, j: number, k: number) => (i < 0 || j < 0 || k < 0 || i >= NX || j >= NY || k >= NZ ? 0 : field[(k * NY + j) * NX + i]);
  // cells span samples (i..i+1); include one padding cell on every side
  const CX = NX + 1, CY = NY + 1, CZ = NZ + 1;
  const cellIndex = (i: number, j: number, k: number) => ((k + 1) * CY + (j + 1)) * CX + (i + 1);
  const vid = new Int32Array(CX * CY * CZ).fill(-1);
  const pos: number[] = [];
  const EDGES: [number, number][] = [
    [0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7],
  ];
  for (let k = -1; k < NZ; k++)
    for (let j = -1; j < NY; j++)
      for (let i = -1; i < NX; i++) {
        const v = CORNERS.map(([a, b, c]) => val(i + a, j + b, k + c));
        let inside = 0;
        for (const s of v) if (s > iso) inside++;
        if (inside === 0 || inside === 8) continue;
        let sx = 0, sy = 0, sz = 0, n = 0;
        for (const [a, b] of EDGES) {
          const va = v[a], vb = v[b];
          if (va > iso === vb > iso) continue;
          const t = (iso - va) / (vb - va);
          const pa = CORNERS[a], pb = CORNERS[b];
          sx += pa[0] + t * (pb[0] - pa[0]);
          sy += pa[1] + t * (pb[1] - pa[1]);
          sz += pa[2] + t * (pb[2] - pa[2]);
          n++;
        }
        vid[cellIndex(i, j, k)] = pos.length / 3;
        pos.push(origin[0] + (i + sx / n) * h, origin[1] + (j + sy / n) * h, origin[2] + (k + sz / n) * h);
      }
  const idx: number[] = [];
  const quad = (a: number, b: number, c: number, d: number, flip: boolean) => {
    if (a < 0 || b < 0 || c < 0 || d < 0) return;
    if (flip) idx.push(a, c, b, a, d, c);
    else idx.push(a, b, c, a, c, d);
  };
  for (let k = -1; k < NZ; k++)
    for (let j = -1; j < NY; j++)
      for (let i = -1; i < NX; i++) {
        const s0 = val(i, j, k) > iso;
        // an edge from sample (i,j,k) along +x is shared by the 4 cells (i, j-1..j, k-1..k)
        if (j >= 0 && k >= 0 && s0 !== val(i + 1, j, k) > iso)
          quad(vid[cellIndex(i, j - 1, k - 1)], vid[cellIndex(i, j, k - 1)], vid[cellIndex(i, j, k)], vid[cellIndex(i, j - 1, k)], !s0);
        if (i >= 0 && k >= 0 && s0 !== val(i, j + 1, k) > iso)
          quad(vid[cellIndex(i - 1, j, k - 1)], vid[cellIndex(i - 1, j, k)], vid[cellIndex(i, j, k)], vid[cellIndex(i, j, k - 1)], !s0);
        if (i >= 0 && j >= 0 && s0 !== val(i, j, k + 1) > iso)
          quad(vid[cellIndex(i - 1, j - 1, k)], vid[cellIndex(i, j - 1, k)], vid[cellIndex(i, j, k)], vid[cellIndex(i - 1, j, k)], !s0);
      }
  return { positions: Float32Array.from(pos), indices: Uint32Array.from(idx) };
}
