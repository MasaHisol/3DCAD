// Geometric constraint solver for 2D sketches.
//
// Unknowns are the coordinates of free points and the radii of circles.
// Every constraint / driving dimension contributes residuals r_i(x) = 0.
// We use damped Gauss-Newton steps in minimum-norm form
//     dx = -J^T (J J^T + lambda I)^-1 r
// which moves under-constrained geometry as little as possible, exactly the
// behaviour users expect when dragging or editing a dimension.

import type { SkArc, SkCircle, SkConstraint, SkDimension, SkEntity, SkLine, SkPoint } from "../core/types";

export interface SolveInput {
  entities: SkEntity[];
  constraints: SkConstraint[];
  dimensions: SkDimension[];
  /** Resolved values for driving dimensions (mm or degrees), by dimension id. */
  dimValues: Map<string, number>;
  /** Points held in place for this solve (e.g. the one being dragged). */
  hold?: Set<string>;
}

export interface SolveResult {
  ok: boolean;
  residual: number;
  /** Remaining degrees of freedom (0 = fully constrained). */
  dof: number;
  iterations: number;
}

type Getter = () => number;

interface VarRef {
  get: Getter;
  set: (v: number) => void;
}

interface Sys {
  vars: VarRef[];
  residuals: (() => number)[];
}

const EPS = 1e-9;

function buildSystem(inp: SolveInput): Sys {
  const ents = new Map(inp.entities.map((e) => [e.id, e]));
  const pt = (id: string) => ents.get(id) as SkPoint;
  const vars: VarRef[] = [];
  const fixedPts = new Set<string>();
  for (const c of inp.constraints) if (c.type === "fix") fixedPts.add(c.refs[0]);

  for (const e of inp.entities) {
    if (e.type === "point") {
      if (e.fixed || e.ref || fixedPts.has(e.id) || inp.hold?.has(e.id)) continue;
      vars.push({ get: () => e.x, set: (v) => (e.x = v) });
      vars.push({ get: () => e.y, set: (v) => (e.y = v) });
    } else if (e.type === "circle" && !e.ref) {
      vars.push({ get: () => e.r, set: (v) => (e.r = Math.max(v, 1e-6)) });
    }
  }

  const R: (() => number)[] = [];
  const lineOf = (id: string) => {
    const l = ents.get(id) as SkLine;
    return { a: pt(l.p1), b: pt(l.p2) };
  };
  const radiusOf = (e: SkEntity): Getter => {
    if (e.type === "circle") return () => e.r;
    const a = e as SkArc;
    return () => Math.hypot(pt(a.p1).x - pt(a.c).x, pt(a.p1).y - pt(a.c).y);
  };
  const centerOf = (e: SkEntity) => pt((e as SkCircle | SkArc).c);
  const dir = (id: string) => {
    const { a, b } = lineOf(id);
    return () => [b.x - a.x, b.y - a.y] as const;
  };

  // implicit arc constraint: both end points at the same radius
  for (const e of inp.entities) {
    if (e.type === "arc") {
      const c = pt(e.c), p1 = pt(e.p1), p2 = pt(e.p2);
      R.push(() => Math.hypot(p1.x - c.x, p1.y - c.y) - Math.hypot(p2.x - c.x, p2.y - c.y));
    }
  }

  for (const c of inp.constraints) {
    const [r0, r1, r2] = c.refs;
    const e0 = ents.get(r0), e1 = ents.get(r1);
    if (!e0 || (c.refs.length > 1 && !e1)) continue;
    switch (c.type) {
      case "coincident": {
        const p = pt(r0), q = pt(r1);
        R.push(() => p.x - q.x, () => p.y - q.y);
        break;
      }
      case "pointOnCurve": {
        const p = pt(r0);
        if (e1!.type === "line") {
          const { a, b } = lineOf(r1);
          R.push(() => {
            const dx = b.x - a.x, dy = b.y - a.y;
            const L = Math.hypot(dx, dy) || EPS;
            return ((p.x - a.x) * dy - (p.y - a.y) * dx) / L;
          });
        } else {
          const cc = centerOf(e1!), rr = radiusOf(e1!);
          R.push(() => Math.hypot(p.x - cc.x, p.y - cc.y) - rr());
        }
        break;
      }
      case "horizontal":
      case "vertical": {
        let a: SkPoint, b: SkPoint;
        if (e0.type === "line") ({ a, b } = lineOf(r0));
        else (a = pt(r0)), (b = pt(r1));
        R.push(c.type === "horizontal" ? () => a.y - b.y : () => a.x - b.x);
        break;
      }
      case "parallel":
      case "perpendicular":
      case "collinear": {
        const d1 = dir(r0), d2 = dir(r1);
        if (c.type === "perpendicular") {
          R.push(() => {
            const [ax, ay] = d1(), [bx, by] = d2();
            return (ax * bx + ay * by) / (Math.hypot(ax, ay) || EPS);
          });
        } else {
          R.push(() => {
            const [ax, ay] = d1(), [bx, by] = d2();
            return (ax * by - ay * bx) / (Math.hypot(ax, ay) || EPS);
          });
        }
        if (c.type === "collinear") {
          const { a, b } = lineOf(r0);
          const q = lineOf(r1).a;
          R.push(() => {
            const dx = b.x - a.x, dy = b.y - a.y;
            return ((q.x - a.x) * dy - (q.y - a.y) * dx) / (Math.hypot(dx, dy) || EPS);
          });
        }
        break;
      }
      case "equal": {
        if (e0.type === "line" && e1!.type === "line") {
          const d1 = dir(r0), d2 = dir(r1);
          R.push(() => Math.hypot(...d1()) - Math.hypot(...d2()));
        } else if (e0.type !== "line" && e1!.type !== "line") {
          const a = radiusOf(e0), b = radiusOf(e1!);
          R.push(() => a() - b());
        }
        break;
      }
      case "tangent": {
        // line-circle or circle-circle
        let line: string | undefined, circ: SkEntity | undefined, circ2: SkEntity | undefined;
        if (e0.type === "line") (line = r0), (circ = e1);
        else if (e1!.type === "line") (line = r1), (circ = e0);
        else (circ = e0), (circ2 = e1);
        if (line && circ) {
          const { a, b } = lineOf(line);
          const cc = centerOf(circ), rr = radiusOf(circ);
          R.push(() => {
            const dx = b.x - a.x, dy = b.y - a.y;
            const d = Math.abs((cc.x - a.x) * dy - (cc.y - a.y) * dx) / (Math.hypot(dx, dy) || EPS);
            return d - rr();
          });
        } else if (circ && circ2) {
          const c1 = centerOf(circ), c2 = centerOf(circ2), ra = radiusOf(circ), rb = radiusOf(circ2);
          const d0 = Math.hypot(c1.x - c2.x, c1.y - c2.y);
          const internal = Math.abs(d0 - Math.abs(ra() - rb())) < Math.abs(d0 - (ra() + rb()));
          R.push(() => {
            const d = Math.hypot(c1.x - c2.x, c1.y - c2.y);
            return internal ? d - Math.abs(ra() - rb()) : d - (ra() + rb());
          });
        }
        break;
      }
      case "concentric": {
        const a = centerOf(e0), b = centerOf(e1!);
        R.push(() => a.x - b.x, () => a.y - b.y);
        break;
      }
      case "midpoint": {
        const p = pt(r0);
        const { a, b } = lineOf(r1);
        R.push(() => p.x - (a.x + b.x) / 2, () => p.y - (a.y + b.y) / 2);
        break;
      }
      case "symmetric": {
        const p = pt(r0), q = pt(r1);
        const { a, b } = lineOf(r2);
        R.push(
          () => {
            const dx = b.x - a.x, dy = b.y - a.y;
            const mx = (p.x + q.x) / 2, my = (p.y + q.y) / 2;
            return ((mx - a.x) * dy - (my - a.y) * dx) / (Math.hypot(dx, dy) || EPS);
          },
          () => {
            const dx = b.x - a.x, dy = b.y - a.y;
            return ((q.x - p.x) * dx + (q.y - p.y) * dy) / (Math.hypot(dx, dy) || EPS);
          },
        );
        break;
      }
      case "fix":
        break;
    }
  }

  for (const d of inp.dimensions) {
    if (d.driven) continue;
    const v = inp.dimValues.get(d.id);
    if (v === undefined) continue;
    const f = dimensionResidual(d, ents, v);
    if (f) R.push(f);
  }

  return { vars, residuals: R };
}

/** Current measured value of a dimension (mm or degrees). */
export function measureDimension(d: SkDimension, entities: SkEntity[] | Map<string, SkEntity>): number {
  const ents = entities instanceof Map ? entities : new Map(entities.map((e) => [e.id, e]));
  const f = dimensionResidual(d, ents, 0);
  return f ? f() : NaN;
}

function dimensionResidual(d: SkDimension, ents: Map<string, SkEntity>, v: number): (() => number) | null {
  const pt = (id: string) => ents.get(id) as SkPoint;
  const e0 = ents.get(d.refs[0]);
  const e1 = d.refs[1] ? ents.get(d.refs[1]) : undefined;
  if (!e0) return null;
  const radiusOf = (e: SkEntity): Getter => {
    if (e.type === "circle") return () => e.r;
    const a = e as SkArc;
    return () => Math.hypot(pt(a.p1).x - pt(a.c).x, pt(a.p1).y - pt(a.c).y);
  };
  const endpoints = (e: SkEntity): [SkPoint, SkPoint] | null => {
    if (e.type === "line") return [pt(e.p1), pt(e.p2)];
    return null;
  };
  switch (d.type) {
    case "length": {
      const ep = endpoints(e0);
      if (!ep) return null;
      const [a, b] = ep;
      return () => Math.hypot(b.x - a.x, b.y - a.y) - v;
    }
    case "radius":
    case "diameter": {
      if (e0.type !== "circle" && e0.type !== "arc") return null;
      const r = radiusOf(e0);
      const k = d.type === "diameter" ? 2 : 1;
      return () => k * r() - v;
    }
    case "distance":
    case "hdistance":
    case "vdistance": {
      if (!e1) {
        const ep = endpoints(e0);
        if (!ep) return null;
        return pointPoint(d.type, ep[0], ep[1], v);
      }
      if (e0.type === "point" && e1.type === "point") return pointPoint(d.type, e0, e1, v);
      // point – line distance (or parallel line – line)
      let p: SkPoint | undefined, l: SkLine | undefined;
      if (e0.type === "point" && e1.type === "line") (p = e0), (l = e1);
      else if (e1.type === "point" && e0.type === "line") (p = e1), (l = e0);
      else if (e0.type === "line" && e1.type === "line") (p = pt(e1.p1)), (l = e0);
      else if ((e0.type === "circle" || e0.type === "arc") && e1.type === "point") return pointPoint(d.type, pt(e0.c), e1, v);
      else if ((e1.type === "circle" || e1.type === "arc") && e0.type === "point") return pointPoint(d.type, e0, pt(e1.c), v);
      else if ((e0.type === "circle" || e0.type === "arc") && (e1.type === "circle" || e1.type === "arc"))
        return pointPoint(d.type, pt(e0.c), pt(e1.c), v);
      if (!p || !l) return null;
      const a = pt(l.p1), b = pt(l.p2);
      const pp = p;
      return () => {
        const dx = b.x - a.x, dy = b.y - a.y;
        return Math.abs((pp.x - a.x) * dy - (pp.y - a.y) * dx) / (Math.hypot(dx, dy) || EPS) - v;
      };
    }
    case "angle": {
      if (!e1 || e0.type !== "line" || e1.type !== "line") return null;
      const a1 = pt(e0.p1), b1 = pt(e0.p2), a2 = pt(e1.p1), b2 = pt(e1.p2);
      return () => {
        const ux = b1.x - a1.x, uy = b1.y - a1.y, wx = b2.x - a2.x, wy = b2.y - a2.y;
        const ang = (Math.atan2(Math.abs(ux * wy - uy * wx), ux * wx + uy * wy) * 180) / Math.PI;
        // scale degrees roughly into length units so it balances with mm residuals
        return ((ang - v) * Math.PI) / 180 * Math.max(10, Math.hypot(ux, uy));
      };
    }
  }
  return null;
}

function pointPoint(type: SkDimension["type"], a: SkPoint, b: SkPoint, v: number): () => number {
  if (type === "hdistance") {
    const s = Math.sign(b.x - a.x) || 1;
    return () => s * (b.x - a.x) - v;
  }
  if (type === "vdistance") {
    const s = Math.sign(b.y - a.y) || 1;
    return () => s * (b.y - a.y) - v;
  }
  return () => Math.hypot(b.x - a.x, b.y - a.y) - v;
}

// ------------------------------------------------------------ numerics ---

function evalR(sys: Sys): number[] {
  return sys.residuals.map((f) => f());
}

function jacobian(sys: Sys, r0: number[]): number[][] {
  const m = r0.length, n = sys.vars.length;
  const J: number[][] = Array.from({ length: m }, () => new Array(n).fill(0));
  for (let j = 0; j < n; j++) {
    const v = sys.vars[j];
    const x = v.get();
    const h = 1e-7 * Math.max(1, Math.abs(x));
    v.set(x + h);
    const r1 = evalR(sys);
    v.set(x);
    for (let i = 0; i < m; i++) J[i][j] = (r1[i] - r0[i]) / h;
  }
  return J;
}

/** Solves A y = b in place (A symmetric positive definite-ish), Gaussian elimination. */
function solveLinear(A: number[][], b: number[]): number[] | null {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let c = 0; c < n; c++) {
    let piv = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[piv][c])) piv = r;
    if (Math.abs(M[piv][c]) < 1e-14) return null;
    [M[c], M[piv]] = [M[piv], M[c]];
    for (let r = c + 1; r < n; r++) {
      const f = M[r][c] / M[c][c];
      if (f === 0) continue;
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
    }
  }
  const y = new Array(n).fill(0);
  for (let r = n - 1; r >= 0; r--) {
    let s = M[r][n];
    for (let k = r + 1; k < n; k++) s -= M[r][k] * y[k];
    y[r] = s / M[r][r];
  }
  return y;
}

function rank(J: number[][], n: number): number {
  const M = J.map((r) => [...r]);
  let rk = 0;
  const m = M.length;
  for (let c = 0; c < n && rk < m; c++) {
    let piv = rk;
    for (let r = rk + 1; r < m; r++) if (Math.abs(M[r][c]) > Math.abs(M[piv][c])) piv = r;
    if (Math.abs(M[piv][c]) < 1e-7) continue;
    [M[rk], M[piv]] = [M[piv], M[rk]];
    for (let r = rk + 1; r < m; r++) {
      const f = M[r][c] / M[rk][c];
      if (f === 0) continue;
      for (let k = c; k < n; k++) M[r][k] -= f * M[rk][k];
    }
    rk++;
  }
  return rk;
}

const norm2 = (r: number[]) => r.reduce((s, x) => s + x * x, 0);

export function solve(inp: SolveInput, maxIter = 60): SolveResult {
  const sys = buildSystem(inp);
  const n = sys.vars.length;
  let r = evalR(sys);
  let err = norm2(r);
  let it = 0;
  let lambda = 1e-10;
  if (n > 0 && r.length > 0) {
    for (; it < maxIter && err > 1e-18; it++) {
      const J = jacobian(sys, r);
      const m = r.length;
      // A = J J^T + lambda I
      const A: number[][] = Array.from({ length: m }, () => new Array(m).fill(0));
      for (let i = 0; i < m; i++)
        for (let k = i; k < m; k++) {
          let s = 0;
          const Ji = J[i], Jk = J[k];
          for (let j = 0; j < n; j++) s += Ji[j] * Jk[j];
          A[i][k] = A[k][i] = s;
        }
      let improved = false;
      for (let tries = 0; tries < 12; tries++) {
        const Ad = A.map((row, i) => row.map((v, k) => (i === k ? v + lambda * (1 + v) : v)));
        const y = solveLinear(Ad, r);
        if (!y) {
          lambda = Math.max(lambda * 100, 1e-8);
          continue;
        }
        const x0 = sys.vars.map((v) => v.get());
        for (let j = 0; j < n; j++) {
          let s = 0;
          for (let i = 0; i < m; i++) s += J[i][j] * y[i];
          sys.vars[j].set(x0[j] - s);
        }
        const r2 = evalR(sys);
        const e2 = norm2(r2);
        if (e2 < err || e2 < 1e-18) {
          r = r2;
          err = e2;
          lambda = Math.max(lambda / 10, 1e-12);
          improved = true;
          break;
        }
        sys.vars.forEach((v, j) => v.set(x0[j]));
        lambda = Math.max(lambda * 10, 1e-8);
      }
      if (!improved) break;
    }
  }
  let dof = n;
  if (n > 0 && r.length > 0) dof = n - rank(jacobian(sys, r), n);
  return { ok: err < 1e-10, residual: Math.sqrt(err), dof, iterations: it };
}
