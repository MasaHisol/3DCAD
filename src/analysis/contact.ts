// Contact between assembly parts for the voxel FE solver (no-slip or frictionless).
//
// Every element knows its part (FeaGrid.body). Grid nodes on faces between
// elements of different parts ("interface nodes") get one copy per part.
// Copies of two parts are tied (bonded, the shared grid node) while the
// interface there is in compression, and split (separate degrees of freedom,
// the parts may open) where it would be in tension. An active-set loop
// starts from the bonded solution, releases node pairs whose normal traction
// is tensile, re-ties released pairs that would penetrate, and re-solves
// (warm-started) until the set no longer changes.
//
// The extended system keeps the bonded multigrid as preconditioner: the
// residual of split copies is summed onto the grid node, the V-cycle runs on
// the bonded grid and its correction is copied back, plus a Jacobi term on
// the split degrees of freedom (which makes the preconditioner definite on
// the relative motion of the copies).
//
// Frictionless mode keeps a copy per part at every interface node from the
// start (the connectivity never changes); a closed pair is a penalty spring
// k·n·nᵀ between its copies (k = CONTACT_PENALTY × the grid node's stiffness
// diagonal), the tangential directions stay free. A part whose closed-contact
// normals towards held parts do not span all three directions could slide
// rigidly (singular K): it gets a weak tangential spring and a warning.
//
// Speed: intermediate passes solve to PASS_TOL only (the active set needs the
// sign of the traction, not 8 digits); once the set is settled one warm-started
// solve to opt.tol finishes. The multigrid hierarchy of the bonded grid is
// built once (buildOperator) and reused by every pass.

import type { FeaGrid, FeaOperator, FeaOptions } from "./fea";
import { kxPool, PAR_MIN_ELEMENTS } from "./par";

export interface ContactStats {
  /** "contact": closed pairs tied in all directions (no slip); "frictionless": normal only (may slide). */
  mode: "contact" | "frictionless";
  /**
   * Frictionless: parts that the contact normals alone do not hold (they could slide rigidly);
   * they got a weak tangential spring (CONTACT_STAB × the penalty) to keep the system solvable.
   */
  stabilized: string[];
  /** Element faces between different parts. */
  faces: number;
  /** Interface faces that stay closed (transmit compression) / that opened. */
  closed: number;
  released: number;
  /** Interface node pairs closed / released. */
  nodesClosed: number;
  nodesReleased: number;
  /** Active-set iterations (solves). */
  iterations: number;
  /** The contact state stopped changing within the iteration limit. */
  converged: boolean;
  /** Grid nodes on released interfaces (for display). */
  releasedMask: Uint8Array;
}

export const CONTACT_MAX_ITER = 20;

interface Pair {
  /** Local body indices (into INode.bodies), b1 < b2 by part index. */
  l1: number;
  l2: number;
  /** Unit normal from part b1 to part b2. */
  n: [number, number, number];
  tied: boolean;
  /** Closed again after penetrating: stays closed. */
  locked?: boolean;
}

interface INode {
  node: number;
  bodies: number[];
  pairs: Pair[];
  /** Degree-of-freedom node id of each body's copy (current state). */
  ids: Int32Array;
}

/** Interface faces and nodes of an assembly grid. */
export function findInterfaces(G: FeaGrid) {
  const { nx, ny, nz, elems, ne, conn } = G;
  const body = G.body!;
  const cellElem = new Int32Array(nx * ny * nz).fill(-1);
  for (let e = 0; e < ne; e++) cellElem[(elems[e * 3 + 2] * ny + elems[e * 3 + 1]) * nx + elems[e * 3]] = e;
  // corners of the +x / +y / +z face of an element (CORNERS order of fea.ts)
  const FACE = [
    [1, 2, 5, 6],
    [2, 3, 6, 7],
    [4, 5, 6, 7],
  ];
  const faces: { a: number; b: number; axis: number; nodes: number[] }[] = [];
  for (let e = 0; e < ne; e++) {
    const i = elems[e * 3], j = elems[e * 3 + 1], k = elems[e * 3 + 2];
    for (let d = 0; d < 3; d++) {
      const ii = i + (d === 0 ? 1 : 0), jj = j + (d === 1 ? 1 : 0), kk = k + (d === 2 ? 1 : 0);
      if (ii >= nx || jj >= ny || kk >= nz) continue;
      const e2 = cellElem[(kk * ny + jj) * nx + ii];
      if (e2 < 0 || body[e2] === body[e] || body[e] < 0 || body[e2] < 0) continue;
      faces.push({ a: e, b: e2, axis: d, nodes: FACE[d].map((c) => conn[e * 8 + c]) });
    }
  }
  const byNode = new Map<number, INode>();
  const get = (n: number) => {
    let x = byNode.get(n);
    if (!x) byNode.set(n, (x = { node: n, bodies: [], pairs: [], ids: new Int32Array(0) }));
    return x;
  };
  const local = (x: INode, b: number) => {
    let l = x.bodies.indexOf(b);
    if (l < 0) (l = x.bodies.length), x.bodies.push(b);
    return l;
  };
  for (const f of faces) {
    let b1 = body[f.a], b2 = body[f.b], s = 1;
    if (b1 > b2) ([b1, b2] = [b2, b1]), (s = -1);
    for (const n of f.nodes) {
      const x = get(n);
      const l1 = local(x, b1), l2 = local(x, b2);
      let p = x.pairs.find((q) => q.l1 === l1 && q.l2 === l2);
      if (!p) x.pairs.push((p = { l1, l2, n: [0, 0, 0], tied: true }));
      p.n[f.axis] += s;
    }
  }
  // every part touching an interface node gets a copy (also parts meeting it only along an edge)
  const touching: number[] = [];
  for (let e = 0; e < ne; e++)
    for (let c = 0; c < 8; c++) {
      const x = byNode.get(conn[e * 8 + c]);
      if (x) {
        local(x, body[e]);
        touching.push(e);
      }
    }
  for (const x of byNode.values()) {
    for (const p of x.pairs) {
      const l = Math.hypot(...p.n) || 1;
      p.n = [p.n[0] / l, p.n[1] / l, p.n[2] / l];
    }
    x.ids = new Int32Array(x.bodies.length).fill(x.node);
  }
  return { faces, inodes: [...byNode.values()], byNode, touching: [...new Set(touching)] };
}

export class ContactError extends Error {}

/** Preconditioned CG on an arbitrary operator (same scheme as buildOperator's solve). */
function pcg(
  N3: number, free: Uint8Array, Kx: (x: Float64Array, y: Float64Array) => void, prec: (r: Float64Array, z: Float64Array) => void,
  F: Float64Array, x0: Float64Array | null, tol: number, maxIter: number, progress?: (it: number, res: number) => void,
) {
  const u = new Float64Array(N3), r = new Float64Array(N3), z = new Float64Array(N3), p = new Float64Array(N3), q = new Float64Array(N3);
  let bn = 0;
  for (let i = 0; i < N3; i++) if (free[i]) bn += F[i] * F[i];
  const bnorm = Math.sqrt(bn) || 1;
  if (x0) {
    for (let i = 0; i < N3; i++) u[i] = free[i] ? x0[i] : 0;
    Kx(u, q);
    for (let i = 0; i < N3; i++) r[i] = free[i] ? F[i] - q[i] : 0;
  } else for (let i = 0; i < N3; i++) r[i] = free[i] ? F[i] : 0;
  let res = Math.sqrt(r.reduce((s, v) => s + v * v, 0)) / bnorm;
  let it = 0;
  if (res >= tol) {
    prec(r, z);
    p.set(z);
    let rz = 0;
    for (let i = 0; i < N3; i++) rz += r[i] * z[i];
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
  }
  return { u, it, res, converged: res < tol };
}

/** Normal penalty stiffness of a frictionless pair, relative to the grid node's stiffness diagonal. */
export const CONTACT_PENALTY = 100;
/** Tangential stabilisation of parts that frictionless contact alone cannot hold, relative to the penalty. */
export const CONTACT_STAB = 1e-6;
/** Relative residual of the intermediate active-set solves (the last solve uses opt.tol). */
const PASS_TOL = 1e-3;

/**
 * Active-set contact solve. Returns the solution on the extended node set
 * (grid nodes, then the split copies), its connectivity and operator.
 *
 * mode "contact" (no slip): closed pairs share one degree-of-freedom node.
 * mode "frictionless": every part has its own copy at every interface node
 * (fixed connectivity); a closed pair is a stiff penalty spring along the
 * pair normal only, so the copies may slide tangentially.
 */
export function solveContact(
  G: FeaGrid, op: FeaOperator, F: Float64Array, fixed: Uint8Array, opt: FeaOptions,
  partNames: (string | undefined)[], progress?: (it: number, res: number) => void,
  mode: "contact" | "frictionless" = "contact",
) {
  const { nNodes, ne, conn, phi, used } = G;
  const body = G.body!;
  const KE = op.KE;
  const tol = opt.tol ?? 1e-8, maxIter = opt.maxIter ?? 8000;
  const passTol = Math.max(tol, PASS_TOL);
  const { faces, inodes, byNode, touching } = findInterfaces(G);
  const N3g = nNodes * 3;
  const fric = mode === "frictionless";
  const partName = (b: number) => `「${partNames[b] ?? `部品 ${b + 1}`}」`;

  /** Current extended system. */
  let NN = nNodes, connX = conn, free = op.free, diagX = op.diag;
  let Fx = F;
  let fixedX = fixed;
  const ue = new Float64Array(24);
  const kxSerial = (cn: Int32Array, x: Float64Array, y: Float64Array) => {
    y.fill(0);
    for (let e = 0; e < ne; e++) {
      const c = e * 8, s = phi[e];
      for (let n = 0; n < 8; n++) {
        const g = cn[c + n] * 3;
        ue[n * 3] = x[g];
        ue[n * 3 + 1] = x[g + 1];
        ue[n * 3 + 2] = x[g + 2];
      }
      for (let a = 0; a < 24; a++) {
        let sum = 0;
        const row = a * 24;
        for (let b = 0; b < 24; b++) sum += KE[row + b] * ue[b];
        y[cn[c + ((a / 3) | 0)] * 3 + (a % 3)] += sum * s;
      }
    }
  };
  let KxRaw: (x: Float64Array, y: Float64Array) => void = (x, y) => op.Kx(x, y, false);
  /** Split copies: extra node id -> grid node. */
  let extraOf = new Int32Array(0);
  /** Diagonal of the element part (frictionless: the penalty part is added per pass). */
  let diagEl = op.diag;
  /** Connectivity the current KxRaw / job were built for (frictionless: built once). */
  let builtFor: Int32Array | null = null;

  // ---- frictionless penalty springs: per closed pair, copy ids, normal, stiffnesses
  let penA = new Int32Array(0), penB = new Int32Array(0), penN = new Float64Array(0), penK = new Float64Array(0), penS = new Float64Array(0);
  /** Parts given the tangential stabilisation (frictionless contact alone does not hold them). */
  const stabilized = new Set<number>();
  /** Pair state of the last solve (frictionless: the ids do not tell). */
  const solvedTied = new Map<Pair, boolean>();
  const kpOf = (x: INode) => CONTACT_PENALTY * (op.diag[x.node * 3] + op.diag[x.node * 3 + 1] + op.diag[x.node * 3 + 2]) / 3;

  const rebuild = () => {
    // assign ids: per interface node, the parts connected through tied pairs share one id
    // (frictionless: every part keeps its own copy)
    let extra = 0;
    for (const x of inodes) {
      const m = x.bodies.length;
      const parent = Array.from({ length: m }, (_, i) => i);
      const find = (a: number): number => (parent[a] === a ? a : (parent[a] = find(parent[a])));
      if (!fric) for (const p of x.pairs) if (p.tied) parent[find(p.l2)] = find(p.l1);
      const rootId = new Map<number, number>();
      for (let l = 0; l < m; l++) {
        const r = find(l);
        let id = rootId.get(r);
        if (id === undefined) rootId.set(r, (id = rootId.size === 0 ? x.node : nNodes + extra++));
        x.ids[l] = id;
      }
    }
    NN = nNodes + extra;
    if (!extra) {
      connX = conn;
      free = op.free;
      diagX = diagEl = op.diag;
      Fx = F;
      fixedX = fixed;
      extraOf = new Int32Array(0);
      KxRaw = (x, y) => op.Kx(x, y, false);
      builtFor = null;
      return;
    }
    if (!(fric && builtFor)) {
      extraOf = new Int32Array(extra);
      for (const x of inodes) for (const id of x.ids) if (id >= nNodes) extraOf[id - nNodes] = x.node;
      connX = Int32Array.from(conn);
      for (const e of touching)
        for (let c = 0; c < 8; c++) {
          const x = byNode.get(conn[e * 8 + c]);
          if (x) connX[e * 8 + c] = x.ids[x.bodies.indexOf(body[e])];
        }
      fixedX = new Uint8Array(NN);
      fixedX.set(fixed);
      for (let i = 0; i < extra; i++) fixedX[nNodes + i] = fixed[extraOf[i]];
      free = new Uint8Array(NN * 3);
      for (let n = 0; n < NN; n++) if ((n >= nNodes || used[n]) && !fixedX[n]) free[n * 3] = free[n * 3 + 1] = free[n * 3 + 2] = 1;
      diagEl = new Float64Array(NN * 3);
      for (let e = 0; e < ne; e++) for (let a = 0; a < 24; a++) diagEl[connX[e * 8 + ((a / 3) | 0)] * 3 + (a % 3)] += KE[a * 25] * phi[e];
      Fx = new Float64Array(NN * 3);
      Fx.set(F);
      // the multi-core job holds the connectivity: build it only when that changes
      const pool = kxPool();
      const job = pool && ne >= PAR_MIN_ELEMENTS ? pool.job(connX, phi, KE, ne, NN * 3) : null;
      const cn = connX;
      KxRaw = job ? (x, y) => pool!.kx(job, x, y) : (x, y) => kxSerial(cn, x, y);
      builtFor = connX;
    }
    diagX = diagEl;
    if (fric) buildPenalty();
  };

  /** Frictionless: penalty springs of the closed pairs, stabilisation of parts held only in some directions. */
  const buildPenalty = () => {
    const tied: { x: INode; p: Pair }[] = [];
    for (const x of inodes) for (const p of x.pairs) if (p.tied) tied.push({ x, p });
    solvedTied.clear();
    for (const x of inodes) for (const p of x.pairs) solvedTied.set(p, p.tied);
    // parts held: by their own supports, or by closed contact whose normals span all three directions
    // to parts that are held; the rest gets a weak tangential spring (warned in the result)
    const nb = Math.max(0, ...body) + 1;
    const held = new Uint8Array(nb), touches = new Uint8Array(nb);
    for (let e = 0; e < ne; e++) {
      if (body[e] < 0) continue;
      for (let c = 0; c < 8; c++) if (fixed[conn[e * 8 + c]]) held[body[e]] = 1;
    }
    stabilized.clear();
    for (;;) {
      let grown = false;
      const M = Array.from({ length: nb }, () => new Float64Array(9));
      for (const { x, p } of tied) {
        const b1 = x.bodies[p.l1], b2 = x.bodies[p.l2];
        for (const [b, o] of [[b1, b2], [b2, b1]]) {
          if (held[b] || !held[o]) continue;
          touches[b] = 1;
          for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) M[b][i * 3 + j] += p.n[i] * p.n[j];
        }
      }
      for (let b = 0; b < nb; b++) {
        if (held[b] || !touches[b]) continue;
        const m = M[b], t = m[0] + m[4] + m[8];
        const det = m[0] * (m[4] * m[8] - m[5] * m[7]) - m[1] * (m[3] * m[8] - m[5] * m[6]) + m[2] * (m[3] * m[7] - m[4] * m[6]);
        if (t > 0 && det > 1e-3 * (t / 3) ** 3) (held[b] = 1), (grown = true);
      }
      if (grown) continue;
      // nothing more held by contact alone: stabilise the parts in contact with held ones
      for (let b = 0; b < nb; b++) if (!held[b] && touches[b]) (held[b] = 1), stabilized.add(b), (grown = true);
      if (!grown) break;
    }
    const n = tied.length;
    penA = new Int32Array(n);
    penB = new Int32Array(n);
    penN = new Float64Array(n * 3);
    penK = new Float64Array(n);
    penS = new Float64Array(n);
    diagX = Float64Array.from(diagEl);
    tied.forEach(({ x, p }, i) => {
      penA[i] = x.ids[p.l1];
      penB[i] = x.ids[p.l2];
      penN.set(p.n, i * 3);
      const kp = kpOf(x);
      penK[i] = kp;
      penS[i] = stabilized.has(x.bodies[p.l1]) || stabilized.has(x.bodies[p.l2]) ? kp * CONTACT_STAB : 0;
      for (let k = 0; k < 3; k++) {
        const d = kp * p.n[k] * p.n[k] + penS[i] * (1 - p.n[k] * p.n[k]);
        diagX[penA[i] * 3 + k] += d;
        diagX[penB[i] * 3 + k] += d;
      }
    });
  };

  /** y += penalty springs · x (frictionless). */
  const penaltyKx = (x: Float64Array, y: Float64Array) => {
    for (let i = 0; i < penK.length; i++) {
      const a = penA[i] * 3, b = penB[i] * 3, n0 = penN[i * 3], n1 = penN[i * 3 + 1], n2 = penN[i * 3 + 2];
      const d0 = x[b] - x[a], d1 = x[b + 1] - x[a + 1], d2 = x[b + 2] - x[a + 2];
      const g = d0 * n0 + d1 * n1 + d2 * n2, k = penK[i], s = penS[i];
      // normal spring k·g·n, tangential stabilisation s·(d - g·n)
      const f0 = k * g * n0 + s * (d0 - g * n0), f1 = k * g * n1 + s * (d1 - g * n1), f2 = k * g * n2 + s * (d2 - g * n2);
      y[b] += f0;
      y[b + 1] += f1;
      y[b + 2] += f2;
      y[a] -= f0;
      y[a + 1] -= f1;
      y[a + 2] -= f2;
    }
  };
  const KxFull = (x: Float64Array, y: Float64Array) => {
    KxRaw(x, y);
    if (fric) penaltyKx(x, y);
  };

  /** Loaded parts that no support holds once the released interfaces open. */
  const checkHeld = () => {
    if (NN === nNodes) return; // bonded system: assembleLoads already checked
    const parent = new Int32Array(NN).map((_, i) => i);
    const find = (a: number): number => {
      while (parent[a] !== a) a = parent[a] = parent[parent[a]];
      return a;
    };
    const join = (a: number, b: number) => {
      const r = find(a), q = find(b);
      if (q !== r) parent[q] = r;
    };
    for (let e = 0; e < ne; e++) for (let k = 1; k < 8; k++) join(connX[e * 8], connX[e * 8 + k]);
    for (let i = 0; i < penK.length; i++) join(penA[i], penB[i]);
    const held = new Set<number>();
    for (let n = 0; n < NN; n++) if (fixedX[n]) held.add(find(n));
    const loose = new Set<number>();
    for (let n = 0; n < nNodes; n++) if ((F[n * 3] || F[n * 3 + 1] || F[n * 3 + 2]) && !held.has(find(n))) loose.add(find(n));
    if (!loose.size) return;
    const parts = new Set<number>();
    for (let e = 0; e < ne; e++) if (loose.has(find(connX[e * 8]))) parts.add(body[e]);
    const names = [...parts].map(partName).join("・");
    throw new ContactError(
      `接触解析: 荷重で接触面が離れ、${names} が固定拘束から外れます (引張の荷重は接触では伝わりません)。` +
        `この部品にも固定拘束を追加するか、部品間の接触を「接着」にして解析してください`,
    );
  };

  // preconditioner work vectors (reused: it runs once per CG iteration)
  const rg = new Float64Array(N3g), zg = new Float64Array(N3g);
  /** Bonded V-cycle on the summed copies, plus Jacobi on the split copies (additive). */
  const precBond = (r: Float64Array, z: Float64Array) => {
    rg.set(r.subarray(0, N3g));
    for (let i = 0; i < extraOf.length; i++) for (let k = 0; k < 3; k++) rg[extraOf[i] * 3 + k] += r[(nNodes + i) * 3 + k];
    op.prec(rg, zg);
    z.fill(0);
    z.set(zg);
    for (let i = 0; i < extraOf.length; i++) {
      const g = extraOf[i] * 3, x = (nNodes + i) * 3;
      for (let k = 0; k < 3; k++) {
        z[x + k] = zg[g + k];
        if (free[x + k] && diagX[x + k]) z[x + k] += r[x + k] / diagX[x + k];
        if (free[g + k] && diagX[g + k]) z[g + k] += r[g + k] / diagX[g + k];
      }
    }
    for (let i = 0; i < NN * 3; i++) if (!free[i]) z[i] = 0;
  };
  const prec = (r: Float64Array, z: Float64Array) => (NN === nNodes ? op.prec(r, z) : precBond(r, z));

  let u: Float64Array | null = null, prevConn: Int32Array | null = null;
  let totalIt = 0, res = 0, solveConverged = true, iterations = 0, converged = false;
  let Fscale = 0;
  for (let i = 0; i < F.length; i++) Fscale = Math.max(Fscale, Math.abs(F[i]));
  /** The contact state was found with loose solves: confirm it with a tight one. */
  let final = false, limitHit = false;
  if (fric) {
    // start from the bonded solution (the closed pairs barely move apart in the normal direction)
    const b = op.solve(F, progress, passTol);
    u = b.u;
    prevConn = conn;
    totalIt += b.it;
  }
  for (let pass = 0; pass < CONTACT_MAX_ITER + 1; pass++) {
    rebuild();
    checkHeld();

    let x0: Float64Array | null = null;
    if (u && prevConn) {
      if (prevConn === connX) x0 = u;
      else {
        x0 = new Float64Array(NN * 3);
        for (let i = 0; i < ne * 8; i++) for (let k = 0; k < 3; k++) x0[connX[i] * 3 + k] = u[prevConn[i] * 3 + k];
      }
    }
    const tolP = final ? tol : passTol;
    const sol = !u && NN === nNodes ? op.solve(F, progress, tolP) : pcg(NN * 3, free, (x, y) => {
      KxFull(x, y);
      for (let i = 0; i < NN * 3; i++) if (!free[i]) y[i] = 0;
    }, prec, Fx, x0, tolP, maxIter, progress);
    u = sol.u;
    prevConn = connX;
    totalIt += sol.it;
    res = sol.res;
    solveConverged = sol.converged;
    iterations = pass + 1;
    if (limitHit) break;

    let maxU = 0;
    for (let i = 0; i < u.length; i++) maxU = Math.max(maxU, Math.abs(u[i]));
    const ftol = Fscale * 1e-3, gtol = maxU * 1e-4;
    let changes = 0;
    // release the tensile pairs first; only once nothing opens any more are penetrating
    // pairs closed again, and those stay closed (no release/close cycling at the front)
    if (fric) {
      // normal spring force, positive = pressed together
      for (const x of inodes)
        for (const p of x.pairs) {
          if (!p.tied || p.locked) continue;
          let g = 0;
          for (let k = 0; k < 3; k++) g += (u[x.ids[p.l2] * 3 + k] - u[x.ids[p.l1] * 3 + k]) * p.n[k];
          if (-kpOf(x) * g < -ftol) (p.tied = false), changes++;
        }
    } else {
      // ---- interface forces per part copy: f[b] = Σ_e∈b K_e u_e at the node
      const force = new Map<INode, Float64Array>();
      for (const x of inodes) force.set(x, new Float64Array(x.bodies.length * 3));
      for (const e of touching) {
        const c = e * 8;
        for (let n = 0; n < 8; n++) for (let k = 0; k < 3; k++) ue[n * 3 + k] = u[connX[c + n] * 3 + k];
        for (let n = 0; n < 8; n++) {
          const x = byNode.get(conn[c + n]);
          if (!x) continue;
          const f = force.get(x)!, l = x.bodies.indexOf(body[e]);
          for (let k = 0; k < 3; k++) {
            const a = n * 3 + k;
            let s = 0;
            for (let b = 0; b < 24; b++) s += KE[a * 24 + b] * ue[b];
            f[l * 3 + k] += s * phi[e];
          }
        }
      }
      for (const x of inodes) {
        const f = force.get(x)!;
        for (const p of x.pairs) {
          if (!p.tied || p.locked) continue;
          // traction on part 2 from part 1 (n points 1 -> 2): positive = pressed together
          let pn = 0;
          for (let k = 0; k < 3; k++) pn += ((f[p.l2 * 3 + k] - f[p.l1 * 3 + k]) / 2) * p.n[k];
          if (pn < -ftol) (p.tied = false), changes++;
        }
      }
    }
    if (!changes)
      for (const x of inodes)
        for (const p of x.pairs) {
          if (p.tied) continue;
          let g = 0;
          for (let k = 0; k < 3; k++) g += (u[x.ids[p.l2] * 3 + k] - u[x.ids[p.l1] * 3 + k]) * p.n[k];
          if (g < -gtol) (p.tied = true), (p.locked = true), changes++;
        }
    // a change found by the tight solve: back to loose passes
    if (changes) final = false;
    if (!changes) {
      if (tolP <= tol) {
        converged = true;
        break;
      }
      // the state is settled: one more solve to the requested tolerance (same system, warm start)
      final = true;
    }
    if (pass === CONTACT_MAX_ITER - 1 && !final) {
      // iteration limit: no more updates, but still finish the current state tightly
      for (const x of inodes) for (const p of x.pairs) if (!fric) p.tied = x.ids[p.l1] === x.ids[p.l2];
      if (fric) for (const [p, t] of solvedTied) p.tied = t;
      final = limitHit = true;
    }
  }
  // x.ids / solvedTied describe the solved system

  // ---- statistics (of the solved state)
  const releasedMask = new Uint8Array(nNodes);
  let nodesClosed = 0, nodesReleased = 0;
  const pairOpen = (x: INode, p: Pair) => (fric ? !(solvedTied.get(p) ?? true) : x.ids[p.l1] !== x.ids[p.l2]);
  for (const x of inodes)
    for (const p of x.pairs)
      if (pairOpen(x, p)) {
        nodesReleased++;
        releasedMask[x.node] = 1;
      } else nodesClosed++;
  let closed = 0, released = 0;
  for (const f of faces) {
    let open = 0;
    const b1 = Math.min(body[f.a], body[f.b]), b2 = Math.max(body[f.a], body[f.b]);
    for (const n of f.nodes) {
      const x = byNode.get(n)!;
      const l1 = x.bodies.indexOf(b1), l2 = x.bodies.indexOf(b2);
      const p = x.pairs.find((q) => q.l1 === l1 && q.l2 === l2);
      if (p ? pairOpen(x, p) : x.ids[l1] !== x.ids[l2]) open++;
    }
    if (open >= 3) released++;
    else closed++;
  }
  const stats: ContactStats = {
    mode, faces: faces.length, closed, released, nodesClosed, nodesReleased, iterations, converged, releasedMask,
    stabilized: [...stabilized].map((b) => partNames[b] ?? `部品 ${b + 1}`),
  };
  // snapshot of the solved operator (penalty arrays are replaced on rebuild)
  const KxR = KxRaw, pA = penA, pB = penB, pN = penN, pK = penK, pS = penS;
  const KxOut = (x: Float64Array, y: Float64Array) => {
    KxR(x, y);
    if (!fric) return;
    [penA, penB, penN, penK, penS] = [pA, pB, pN, pK, pS];
    penaltyKx(x, y);
  };
  return { u: u!, it: totalIt, res, solveConverged, conn: connX, NN, fixedX, Fx, Kx: KxOut, stats };
}
