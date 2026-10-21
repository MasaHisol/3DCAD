// Geometric multigrid preconditioner for the voxel FE system.
//
// Every coarse level halves the grid: a coarse element's stiffness is the
// Galerkin product Σ Qᵀ K_child Q over its (up to) eight children, where Q is
// the trilinear interpolation from the coarse cube to a child cube — so the
// coarse operators are exactly Pᵀ A P of the fine one and the V-cycle is a
// symmetric positive definite preconditioner for CG. Damped Jacobi smoothing,
// dense Cholesky on the coarsest level.

const CORNERS = [
  [0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0],
  [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1],
];

export interface MgFine {
  dims: [number, number, number];
  /** Element grid positions (i, j, k) × ne. */
  elems: ArrayLike<number>;
  /** Element stiffness shared by all fine elements, scaled by phi. */
  KE: Float64Array;
  phi: ArrayLike<number>;
  /** Fixed node flags on the fine node grid. */
  fixed: Uint8Array;
  used: Uint8Array;
}

interface Level {
  dims: [number, number, number];
  ne: number;
  elems: Int32Array;
  conn: Int32Array;
  /** Per element 24x24 (coarse levels) — fine level uses KE·phi. */
  mats: Float32Array | null;
  nNodes: number;
  free: Uint8Array;
  invDiag: Float64Array;
}

/** Q for a child cube at offset (a,b,c) ∈ {0,1}³ inside its parent: child dofs × parent dofs. */
function childQ(a: number, b: number, c: number): Float64Array {
  const Q = new Float64Array(576);
  for (let n = 0; n < 8; n++) {
    const x = (a + CORNERS[n][0]) / 2, y = (b + CORNERS[n][1]) / 2, z = (c + CORNERS[n][2]) / 2;
    for (let p = 0; p < 8; p++) {
      const [px, py, pz] = CORNERS[p];
      const w = (px ? x : 1 - x) * (py ? y : 1 - y) * (pz ? z : 1 - z);
      if (!w) continue;
      for (let d = 0; d < 3; d++) Q[(n * 3 + d) * 24 + p * 3 + d] = w;
    }
  }
  return Q;
}

/** out += s · Qᵀ K Q (all 24x24, row-major). */
function addQtKQ(out: Float64Array, Q: Float64Array, K: ArrayLike<number>, s: number, tmp: Float64Array) {
  // tmp = K Q
  tmp.fill(0);
  for (let i = 0; i < 24; i++)
    for (let k = 0; k < 24; k++) {
      const v = K[i * 24 + k];
      if (!v) continue;
      for (let j = 0; j < 24; j++) tmp[i * 24 + j] += v * Q[k * 24 + j];
    }
  for (let k = 0; k < 24; k++)
    for (let i = 0; i < 24; i++) {
      const q = Q[k * 24 + i] * s;
      if (!q) continue;
      for (let j = 0; j < 24; j++) out[i * 24 + j] += q * tmp[k * 24 + j];
    }
}

export class Multigrid {
  private levels: Level[] = [];
  private fine: MgFine;
  private chol: { n: number; L: Float64Array; map: Int32Array } | null = null;
  private omega = 0.6;
  private sweeps = 1;
  readonly depth: number;

  constructor(fine: MgFine, maxCoarseDofs = 400) {
    this.fine = fine;
    const [nx, ny, nz] = fine.dims;
    const ne = fine.elems.length / 3;
    const L0 = this.makeLevel(fine.dims, Int32Array.from(fine.elems), null, fine.fixed, fine.used);
    // fine diagonal from KE·phi
    const diag = new Float64Array(L0.nNodes * 3);
    for (let e = 0; e < ne; e++) for (let a = 0; a < 24; a++) diag[L0.conn[e * 8 + ((a / 3) | 0)] * 3 + (a % 3)] += fine.KE[a * 25] * fine.phi[e];
    for (let i = 0; i < diag.length; i++) L0.invDiag[i] = L0.free[i] && diag[i] > 0 ? 1 / diag[i] : 0;
    this.levels.push(L0);
    void nx;
    void ny;
    void nz;
    const Qs = [0, 1, 2, 3, 4, 5, 6, 7].map((o) => childQ(o & 1, (o >> 1) & 1, (o >> 2) & 1));
    // precomputed Qᵀ KE Q for fine children
    const tmp = new Float64Array(576);
    const M0 = Qs.map((Q) => {
      const m = new Float64Array(576);
      addQtKQ(m, Q, fine.KE, 1, tmp);
      return m;
    });
    let fixedNodes = fine.fixed;
    while (true) {
      const F = this.levels[this.levels.length - 1];
      const freeDofs = F.free.reduce((s, v) => s + v, 0);
      if (freeDofs <= maxCoarseDofs || Math.max(...F.dims) <= 2 || this.levels.length >= 8) break;
      const cd: [number, number, number] = [Math.ceil(F.dims[0] / 2), Math.ceil(F.dims[1] / 2), Math.ceil(F.dims[2] / 2)];
      const cidx = new Int32Array(cd[0] * cd[1] * cd[2]).fill(-1);
      const celems: number[] = [];
      for (let e = 0; e < F.ne; e++) {
        const i = F.elems[e * 3] >> 1, j = F.elems[e * 3 + 1] >> 1, k = F.elems[e * 3 + 2] >> 1;
        const id = (k * cd[1] + j) * cd[0] + i;
        if (cidx[id] < 0) {
          cidx[id] = celems.length / 3;
          celems.push(i, j, k);
        }
      }
      const cne = celems.length / 3;
      const mats = new Float32Array(cne * 576);
      const acc = new Float64Array(576);
      // accumulate children per parent
      const kids: number[][] = Array.from({ length: cne }, () => []);
      for (let e = 0; e < F.ne; e++) {
        const i = F.elems[e * 3], j = F.elems[e * 3 + 1], k = F.elems[e * 3 + 2];
        kids[cidx[((k >> 1) * cd[1] + (j >> 1)) * cd[0] + (i >> 1)]].push(e);
      }
      for (let p = 0; p < cne; p++) {
        acc.fill(0);
        for (const e of kids[p]) {
          const o = (F.elems[e * 3] & 1) + 2 * (F.elems[e * 3 + 1] & 1) + 4 * (F.elems[e * 3 + 2] & 1);
          if (!F.mats) {
            const m = M0[o], s = fine.phi[e];
            for (let q = 0; q < 576; q++) acc[q] += s * m[q];
          } else addQtKQ(acc, Qs[o], F.mats.subarray(e * 576, e * 576 + 576), 1, tmp);
        }
        mats.set(acc, p * 576);
      }
      // coarse fixed nodes: every coarse node interpolating to a fixed fine node
      const FX = F.dims[0] + 1, FY = F.dims[1] + 1, FZ = F.dims[2] + 1;
      const CX = cd[0] + 1, CY = cd[1] + 1, CZ = cd[2] + 1;
      const cfixed = new Uint8Array(CX * CY * CZ);
      for (let k = 0; k < FZ; k++)
        for (let j = 0; j < FY; j++)
          for (let i = 0; i < FX; i++) {
            if (!fixedNodes[(k * FY + j) * FX + i]) continue;
            for (const ci of i & 1 ? [i >> 1, (i >> 1) + 1] : [i >> 1])
              for (const cj of j & 1 ? [j >> 1, (j >> 1) + 1] : [j >> 1])
                for (const ck of k & 1 ? [k >> 1, (k >> 1) + 1] : [k >> 1]) if (ci < CX && cj < CY && ck < CZ) cfixed[(ck * CY + cj) * CX + ci] = 1;
          }
      const cused = new Uint8Array(CX * CY * CZ);
      for (let e = 0; e < cne; e++) for (const [a, b, c] of CORNERS) cused[((celems[e * 3 + 2] + c) * CY + celems[e * 3 + 1] + b) * CX + celems[e * 3] + a] = 1;
      const L = this.makeLevel(cd, Int32Array.from(celems), mats, cfixed, cused);
      const d = new Float64Array(L.nNodes * 3);
      for (let e = 0; e < cne; e++) for (let a = 0; a < 24; a++) d[L.conn[e * 8 + ((a / 3) | 0)] * 3 + (a % 3)] += mats[e * 576 + a * 25];
      for (let i = 0; i < d.length; i++) L.invDiag[i] = L.free[i] && d[i] > 0 ? 1 / d[i] : 0;
      this.levels.push(L);
      fixedNodes = cfixed;
    }
    this.depth = this.levels.length;
    this.factorCoarsest();
  }

  private makeLevel(dims: [number, number, number], elems: Int32Array, mats: Float32Array | null, fixed: Uint8Array, used: Uint8Array): Level {
    const ne = elems.length / 3;
    const NX = dims[0] + 1, NY = dims[1] + 1, NZ = dims[2] + 1;
    const conn = new Int32Array(ne * 8);
    for (let e = 0; e < ne; e++) for (let n = 0; n < 8; n++) conn[e * 8 + n] = ((elems[e * 3 + 2] + CORNERS[n][2]) * NY + elems[e * 3 + 1] + CORNERS[n][1]) * NX + elems[e * 3] + CORNERS[n][0];
    const nNodes = NX * NY * NZ;
    const free = new Uint8Array(nNodes * 3);
    for (let n = 0; n < nNodes; n++) if (used[n] && !fixed[n]) free[n * 3] = free[n * 3 + 1] = free[n * 3 + 2] = 1;
    return { dims, ne, elems, conn, mats, nNodes, free, invDiag: new Float64Array(nNodes * 3) };
  }

  /** y = A x on a level (non-free rows zero). */
  apply(l: number, x: Float64Array, y: Float64Array) {
    const L = this.levels[l];
    y.fill(0);
    const ue = new Float64Array(24);
    for (let e = 0; e < L.ne; e++) {
      const c = e * 8;
      for (let n = 0; n < 8; n++) {
        const g = L.conn[c + n] * 3;
        ue[n * 3] = x[g];
        ue[n * 3 + 1] = x[g + 1];
        ue[n * 3 + 2] = x[g + 2];
      }
      if (L.mats) {
        const off = e * 576;
        for (let a = 0; a < 24; a++) {
          let s = 0;
          for (let b = 0; b < 24; b++) s += L.mats[off + a * 24 + b] * ue[b];
          y[L.conn[c + ((a / 3) | 0)] * 3 + (a % 3)] += s;
        }
      } else {
        const K = this.fine.KE, ph = this.fine.phi[e];
        for (let a = 0; a < 24; a++) {
          let s = 0;
          for (let b = 0; b < 24; b++) s += K[a * 24 + b] * ue[b];
          y[L.conn[c + ((a / 3) | 0)] * 3 + (a % 3)] += s * ph;
        }
      }
    }
    for (let i = 0; i < y.length; i++) if (!L.free[i]) y[i] = 0;
  }

  /** Coarse-to-fine trilinear interpolation (fine non-free dofs stay zero). */
  private prolong(l: number, xc: Float64Array, xf: Float64Array) {
    const F = this.levels[l], C = this.levels[l + 1];
    const FX = F.dims[0] + 1, FY = F.dims[1] + 1, FZ = F.dims[2] + 1;
    const CX = C.dims[0] + 1, CY = C.dims[1] + 1;
    xf.fill(0);
    for (let k = 0; k < FZ; k++)
      for (let j = 0; j < FY; j++)
        for (let i = 0; i < FX; i++) {
          const n = (k * FY + j) * FX + i;
          if (!F.free[n * 3]) continue;
          // coarse neighbours: one per axis on even indices, two (halfway) on odd ones
          const i0 = i >> 1, j0 = j >> 1, k0 = k >> 1;
          const ni = (i & 1) + 1, nj = (j & 1) + 1, nk = (k & 1) + 1;
          const w = 1 / (ni * nj * nk);
          for (let dk = 0; dk < nk; dk++)
            for (let dj = 0; dj < nj; dj++)
              for (let di = 0; di < ni; di++) {
                const m = ((k0 + dk) * CY + j0 + dj) * CX + i0 + di;
                xf[n * 3] += w * xc[m * 3];
                xf[n * 3 + 1] += w * xc[m * 3 + 1];
                xf[n * 3 + 2] += w * xc[m * 3 + 2];
              }
        }
  }

  /** Fine-to-coarse (transpose of prolong); coarse non-free dofs zeroed. */
  private restrict(l: number, rf: Float64Array, rc: Float64Array) {
    const F = this.levels[l], C = this.levels[l + 1];
    const FX = F.dims[0] + 1, FY = F.dims[1] + 1, FZ = F.dims[2] + 1;
    const CX = C.dims[0] + 1, CY = C.dims[1] + 1;
    rc.fill(0);
    for (let k = 0; k < FZ; k++)
      for (let j = 0; j < FY; j++)
        for (let i = 0; i < FX; i++) {
          const n = (k * FY + j) * FX + i;
          if (!F.free[n * 3]) continue;
          // coarse neighbours: one per axis on even indices, two (halfway) on odd ones
          const i0 = i >> 1, j0 = j >> 1, k0 = k >> 1;
          const ni = (i & 1) + 1, nj = (j & 1) + 1, nk = (k & 1) + 1;
          const w = 1 / (ni * nj * nk);
          for (let dk = 0; dk < nk; dk++)
            for (let dj = 0; dj < nj; dj++)
              for (let di = 0; di < ni; di++) {
                const m = ((k0 + dk) * CY + j0 + dj) * CX + i0 + di;
                rc[m * 3] += w * rf[n * 3];
                rc[m * 3 + 1] += w * rf[n * 3 + 1];
                rc[m * 3 + 2] += w * rf[n * 3 + 2];
              }
        }
    for (let i = 0; i < rc.length; i++) if (!C.free[i]) rc[i] = 0;
  }

  private factorCoarsest() {
    const L = this.levels[this.levels.length - 1];
    const map = new Int32Array(L.nNodes * 3).fill(-1);
    let n = 0;
    for (let i = 0; i < map.length; i++) if (L.free[i]) map[i] = n++;
    if (n > 4000) return; // too large for a dense factor: fall back to smoothing only
    const A = new Float64Array(n * n);
    for (let e = 0; e < L.ne; e++)
      for (let a = 0; a < 24; a++) {
        const ra = map[L.conn[e * 8 + ((a / 3) | 0)] * 3 + (a % 3)];
        if (ra < 0) continue;
        for (let b = 0; b < 24; b++) {
          const cb = map[L.conn[e * 8 + ((b / 3) | 0)] * 3 + (b % 3)];
          if (cb < 0) continue;
          A[ra * n + cb] += L.mats ? L.mats[e * 576 + a * 24 + b] : this.fine.KE[a * 24 + b] * this.fine.phi[e];
        }
      }
    // Cholesky (lower), with a tiny shift for robustness
    let maxd = 0;
    for (let i = 0; i < n; i++) maxd = Math.max(maxd, A[i * n + i]);
    for (let j = 0; j < n; j++) {
      const rj = j * n;
      let d = A[rj + j];
      for (let k = 0; k < j; k++) d -= A[rj + k] * A[rj + k];
      d = Math.sqrt(Math.max(d, maxd * 1e-12));
      A[rj + j] = d;
      for (let i = j + 1; i < n; i++) {
        const ri = i * n;
        let s = A[ri + j];
        for (let k = 0; k < j; k++) s -= A[ri + k] * A[rj + k];
        A[ri + j] = s / d;
      }
    }
    this.chol = { n, L: A, map };
  }

  private solveCoarsest(b: Float64Array, x: Float64Array) {
    const c = this.chol!;
    const { n, L, map } = c;
    const y = new Float64Array(n);
    for (let i = 0; i < map.length; i++) if (map[i] >= 0) y[map[i]] = b[i];
    for (let i = 0; i < n; i++) {
      let s = y[i];
      for (let k = 0; k < i; k++) s -= L[i * n + k] * y[k];
      y[i] = s / L[i * n + i];
    }
    for (let i = n - 1; i >= 0; i--) {
      let s = y[i];
      for (let k = i + 1; k < n; k++) s -= L[k * n + i] * y[k];
      y[i] = s / L[i * n + i];
    }
    x.fill(0);
    for (let i = 0; i < map.length; i++) if (map[i] >= 0) x[i] = y[map[i]];
  }

  private smooth(l: number, b: Float64Array, x: Float64Array, tmp: Float64Array) {
    const L = this.levels[l];
    for (let s = 0; s < this.sweeps; s++) {
      this.apply(l, x, tmp);
      for (let i = 0; i < x.length; i++) x[i] += this.omega * L.invDiag[i] * (b[i] - tmp[i]);
    }
  }

  private vcycle(l: number, b: Float64Array, x: Float64Array) {
    const L = this.levels[l];
    if (l === this.levels.length - 1) {
      if (this.chol) return this.solveCoarsest(b, x);
      x.fill(0);
      const t = new Float64Array(x.length);
      for (let s = 0; s < 20; s++) {
        this.apply(l, x, t);
        for (let i = 0; i < x.length; i++) x[i] += this.omega * L.invDiag[i] * (b[i] - t[i]);
      }
      return;
    }
    const w = this.work(l);
    const tmp = w.tmp, r = w.r, rc = w.rc!, xc = w.xc!;
    x.fill(0);
    this.smooth(l, b, x, tmp);
    this.apply(l, x, tmp);
    for (let i = 0; i < r.length; i++) r[i] = b[i] - tmp[i];
    this.restrict(l, r, rc);
    this.vcycle(l + 1, rc, xc);
    this.prolong(l, xc, tmp);
    for (let i = 0; i < x.length; i++) x[i] += tmp[i];
    this.smooth(l, b, x, tmp);
  }

  private ws: { tmp: Float64Array; r: Float64Array; rc?: Float64Array; xc?: Float64Array }[] = [];
  /** Reused work vectors of a level (the V-cycle runs hundreds of times per solve). */
  private work(l: number) {
    if (!this.ws[l]) {
      const n = this.levels[l].nNodes * 3, C = this.levels[l + 1];
      this.ws[l] = { tmp: new Float64Array(n), r: new Float64Array(n), rc: C && new Float64Array(C.nNodes * 3), xc: C && new Float64Array(C.nNodes * 3) };
    }
    return this.ws[l];
  }

  /** z = M⁻¹ r (one V-cycle). */
  precondition(r: Float64Array, z: Float64Array) {
    this.vcycle(0, r, z);
  }
}
