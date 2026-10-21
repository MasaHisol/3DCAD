// Pure route geometry: attachment transforms, polyline filleting, sampling and clearance checks.
import type { Vec3 } from "../core/types";
import type { PathSeg } from "../kernel/protocol";
import { ROUTE_KIND_LABEL, ruleMinRadius, type AsmRoute, type RoutePoint } from "./types";

const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a: Vec3, s: number): Vec3 => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const len = (a: Vec3) => Math.hypot(a[0], a[1], a[2]);
const unit = (a: Vec3): Vec3 => {
  const l = len(a);
  return l > 1e-12 ? mul(a, 1 / l) : [0, 0, 0];
};
export const dist3 = (a: Vec3, b: Vec3) => len(sub(a, b));

// ------------------------------------------------------------ attachment ---

/** Column-major rigid 4x4: local -> assembly. */
export function toWorld(m: number[], p: Vec3, w = 1): Vec3 {
  return [0, 1, 2].map((i) => m[i] * p[0] + m[4 + i] * p[1] + m[8 + i] * p[2] + m[12 + i] * w) as Vec3;
}
/** Inverse of a rigid column-major transform applied to a point (w=1) or direction (w=0). */
export function toLocal(m: number[], p: Vec3, w = 1): Vec3 {
  const d: Vec3 = w ? [p[0] - m[12], p[1] - m[13], p[2] - m[14]] : p;
  return [0, 1, 2].map((i) => m[4 * i] * d[0] + m[4 * i + 1] * d[1] + m[4 * i + 2] * d[2]) as Vec3;
}

export type CompLookup = (id: string) => { matrix: number[] } | undefined;

/** World position (and exit direction) of a route point. Points on missing components use their stored coordinates. */
export function pointWorld(p: RoutePoint, comp: CompLookup): { p: Vec3; dir?: Vec3 } {
  const c = p.comp ? comp(p.comp) : undefined;
  if (!c) return { p: p.local, dir: p.dir };
  return { p: toWorld(c.matrix, p.local), dir: p.dir ? unit(toWorld(c.matrix, p.dir, 0)) : undefined };
}

/** Polyline vertices of a route in assembly coordinates, with straight connector leads at the ends. */
export function routePolyline(route: AsmRoute, comp: CompLookup): Vec3[] {
  const pts = route.points.map((p) => ({ ...pointWorld(p, comp), lead: p.lead ?? 0 }));
  const out: Vec3[] = [];
  pts.forEach((q, i) => {
    const lead = q.dir && q.lead > 0 ? mul(q.dir, q.lead) : null;
    if (lead && i === pts.length - 1 && i > 0) out.push(add(q.p, lead));
    out.push(q.p);
    if (lead && i === 0 && pts.length > 1) out.push(add(q.p, lead));
  });
  // drop coincident vertices
  return out.filter((p, i) => i === 0 || dist3(p, out[i - 1]) > 1e-6);
}

// ------------------------------------------------------------- filleting ---

export interface RouteSeg {
  t: "line" | "arc";
  a: Vec3;
  b: Vec3;
  /** Arc: mid point, centre, radius and bend angle (rad). */
  m?: Vec3;
  c?: Vec3;
  r?: number;
  angle?: number;
  length: number;
}

export interface FilletResult {
  segs: RouteSeg[];
  length: number;
  /** Number of bends (corners with a deflection). */
  bends: number;
  /** Bend radius actually used at each corner (reduced where a segment is too short). */
  radii: number[];
  /** Deflection angle at each bend (deg). */
  angles: number[];
  /** Indices of polyline segments too short for the bends at their ends. */
  short: number[];
  /** Corners that reverse direction (180°) — no arc possible. */
  reversals: number[];
}

/**
 * Replaces the corners of a polyline with circular arcs of radius `R` tangent to both segments.
 * Where two bends do not fit on a segment, the tangent lengths are shared out and the radius reduced
 * (the segment is reported in `short`).
 */
export function filletPolyline(pts: Vec3[], R: number): FilletResult {
  const n = pts.length;
  const res: FilletResult = { segs: [], length: 0, bends: 0, radii: [], angles: [], short: [], reversals: [] };
  if (n < 2) return res;
  const segLen = pts.slice(1).map((p, i) => dist3(p, pts[i]));
  // corner i (1..n-2): deflection and wanted tangent length
  const theta: number[] = new Array(n).fill(0);
  const want: number[] = new Array(n).fill(0);
  for (let i = 1; i < n - 1; i++) {
    const u = unit(sub(pts[i], pts[i - 1])), v = unit(sub(pts[i + 1], pts[i]));
    const th = Math.acos(Math.max(-1, Math.min(1, dot(u, v))));
    theta[i] = th;
    if (th < 1e-6) continue;
    if (Math.PI - th < 1e-4) {
      res.reversals.push(i);
      theta[i] = 0;
      continue;
    }
    want[i] = R * Math.tan(th / 2);
  }
  // fit tangents on each segment
  const t = want.slice();
  for (let s = 0; s < n - 1; s++) {
    const need = want[s] + want[s + 1];
    if (need > segLen[s] + 1e-9) {
      res.short.push(s);
      const k = segLen[s] / need;
      t[s] = Math.min(t[s], want[s] * k);
      t[s + 1] = Math.min(t[s + 1], want[s + 1] * k);
    }
  }
  let cur = pts[0];
  for (let i = 1; i < n; i++) {
    if (i === n - 1) {
      pushLine(res, cur, pts[i]);
      break;
    }
    if (theta[i] === 0) {
      // collinear: keep going; reversal: sharp corner
      if (res.reversals.includes(i)) {
        pushLine(res, cur, pts[i]);
        cur = pts[i];
      }
      continue;
    }
    const u = unit(sub(pts[i], pts[i - 1])), v = unit(sub(pts[i + 1], pts[i]));
    const th = theta[i], ti = t[i];
    const r = ti / Math.tan(th / 2);
    const A = sub(pts[i], mul(u, ti)), B = add(pts[i], mul(v, ti));
    pushLine(res, cur, A);
    const bis = unit(sub(v, u));
    const C = add(pts[i], mul(bis, r / Math.cos(th / 2)));
    const M = add(C, mul(unit(sub(pts[i], C)), r));
    const L = r * th;
    if (L > 1e-9) res.segs.push({ t: "arc", a: A, b: B, m: M, c: C, r, angle: th, length: L });
    res.length += L;
    res.bends++;
    res.radii.push(r);
    res.angles.push((th * 180) / Math.PI);
    cur = B;
  }
  return res;
}

function pushLine(res: FilletResult, a: Vec3, b: Vec3) {
  const L = dist3(a, b);
  if (L > 1e-6) res.segs.push({ t: "line", a, b, length: L });
  res.length += L;
}

/** Kernel sweep path of a filleted route. */
export function toPathSegs(segs: RouteSeg[]): PathSeg[] {
  return segs.map((s) => (s.t === "line" ? { t: "line", a: s.a, b: s.b } : { t: "arc", a: s.a, m: s.m!, b: s.b }));
}

/** Point and tangent at arc length `s` along a segment. */
function segAt(seg: RouteSeg, s: number): { p: Vec3; d: Vec3 } {
  if (seg.t === "line") {
    const d = unit(sub(seg.b, seg.a));
    return { p: add(seg.a, mul(d, s)), d };
  }
  const c = seg.c!, r = seg.r!;
  const e1 = unit(sub(seg.a, c));
  // in-plane perpendicular towards b
  const toB = sub(seg.b, c);
  const e2 = unit(sub(toB, mul(e1, dot(toB, e1))));
  const a = s / r;
  const p = add(c, add(mul(e1, r * Math.cos(a)), mul(e2, r * Math.sin(a))));
  const d = unit(add(mul(e1, -Math.sin(a)), mul(e2, Math.cos(a))));
  return { p, d };
}

/** Samples along the path every `step` mm (at least the segment ends). */
export function samplePath(segs: RouteSeg[], step: number): { p: Vec3; d: Vec3; s: number }[] {
  const out: { p: Vec3; d: Vec3; s: number }[] = [];
  let base = 0;
  for (const seg of segs) {
    const n = Math.max(1, Math.ceil(seg.length / Math.max(step, 1e-3)));
    for (let k = out.length ? 1 : 0; k <= n; k++) out.push({ ...segAt(seg, (seg.length * k) / n), s: base + (seg.length * k) / n });
    base += seg.length;
  }
  return out;
}

// ---------------------------------------------------------------- checks ---

export interface RouteReport {
  length: number;
  bends: number;
  minRadius: number;
  ruleMin: number;
  warnings: string[];
  fillet: FilletResult;
  polyline: Vec3[];
}

/** Geometry + bend-rule checks of a route (no component interference). */
export function analyzeRoute(route: AsmRoute, comp: CompLookup): RouteReport {
  const polyline = routePolyline(route, comp);
  const fillet = filletPolyline(polyline, route.bendRadius);
  const ruleMin = ruleMinRadius(route.kind, route.od, route.moving);
  const minRadius = fillet.radii.length ? Math.min(...fillet.radii) : Infinity;
  const warnings: string[] = [];
  if (polyline.length < 2) warnings.push("点を 2 つ以上指定してください");
  for (const s of fillet.short) warnings.push(`区間 ${s + 1} が短すぎて曲げ R${fmt(route.bendRadius)} が収まりません (R を縮小して作成)`);
  for (const i of fillet.reversals) warnings.push(`点 ${i + 1} で経路が折り返しています (曲げを作れません)`);
  if (route.bendRadius < ruleMin - 1e-9) warnings.push(`曲げ半径 R${fmt(route.bendRadius)} は ${ROUTE_KIND_LABEL[route.kind]} の最小曲げ半径の目安 R${fmt(ruleMin)} 未満です`);
  else if (minRadius < ruleMin - 1e-6) warnings.push(`最小曲げ半径 R${fmt(minRadius)} が目安 R${fmt(ruleMin)} を下回ります`);
  if (route.kind !== "cable" && route.wall * 2 >= route.od) warnings.push("肉厚が外径に対して大きすぎます");
  return { length: fillet.length, bends: fillet.bends, minRadius, ruleMin, warnings, fillet, polyline };
}

export const cutLength = (length: number, marginPct: number) => length * (1 + marginPct / 100);

/** Distance from p to triangle abc. */
export function pointTriDist(p: Vec3, a: Vec3, b: Vec3, c: Vec3): number {
  // Ericson, Real-Time Collision Detection 5.1.5
  const ab = sub(b, a), ac = sub(c, a), ap = sub(p, a);
  const d1 = dot(ab, ap), d2 = dot(ac, ap);
  if (d1 <= 0 && d2 <= 0) return len(ap);
  const bp = sub(p, b), d3 = dot(ab, bp), d4 = dot(ac, bp);
  if (d3 >= 0 && d4 <= d3) return len(bp);
  const vc = d1 * d4 - d3 * d2;
  if (vc <= 0 && d1 >= 0 && d3 <= 0) return dist3(p, add(a, mul(ab, d1 / (d1 - d3))));
  const cp = sub(p, c), d5 = dot(ab, cp), d6 = dot(ac, cp);
  if (d6 >= 0 && d5 <= d6) return len(cp);
  const vb = d5 * d2 - d1 * d6;
  if (vb <= 0 && d2 >= 0 && d6 <= 0) return dist3(p, add(a, mul(ac, d2 / (d2 - d6))));
  const va = d3 * d6 - d5 * d4;
  if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0) return dist3(p, add(b, mul(sub(c, b), (d4 - d3) / (d4 - d3 + (d5 - d6)))));
  const den = 1 / (va + vb + vc);
  return dist3(p, add(a, add(mul(ab, vb * den), mul(ac, vc * den))));
}

/** A component's triangles in assembly coordinates. */
export interface CompMesh {
  comp: string;
  name: string;
  positions: Float32Array | number[];
  indices: Uint32Array | number[];
  bbox: [Vec3, Vec3];
}

export interface ClearanceHit {
  comp: string;
  name: string;
  /** Smallest surface distance minus the route radius (negative = interference). */
  gap: number;
  at: Vec3;
  s: number;
}

/** Inside test by ray parity along +X (closed meshes). */
function inside(p: Vec3, m: CompMesh): boolean {
  let hits = 0;
  const P = m.positions, I = m.indices;
  for (let t = 0; t < I.length; t += 3) {
    const a = I[t] * 3, b = I[t + 1] * 3, c = I[t + 2] * 3;
    // project onto YZ, ray towards +X
    const ay = P[a + 1] - p[1], az = P[a + 2] - p[2], by = P[b + 1] - p[1], bz = P[b + 2] - p[2], cy = P[c + 1] - p[1], cz = P[c + 2] - p[2];
    const s1 = ay * bz - az * by, s2 = by * cz - bz * cy, s3 = cy * az - cz * ay;
    if (!((s1 > 0 && s2 > 0 && s3 > 0) || (s1 < 0 && s2 < 0 && s3 < 0))) continue;
    const w = s1 + s2 + s3;
    const x = (s2 * P[a] + s3 * P[b] + s1 * P[c]) / w;
    if (x > p[0]) hits++;
  }
  return hits % 2 === 1;
}

/**
 * Sampled distance check of the route centre line against component meshes. Reports, per component,
 * the worst gap (surface distance − radius); points within `endSkip` mm of either end are ignored
 * (the route is attached there).
 */
export function clearanceCheck(segs: RouteSeg[], radius: number, clearance: number, meshes: CompMesh[], endSkip: number): ClearanceHit[] {
  const total = segs.reduce((a, s) => a + s.length, 0);
  const samples = samplePath(segs, Math.max(0.5, Math.min(radius, total / 400))).filter((q) => q.s > endSkip && q.s < total - endSkip);
  const reach = radius + clearance;
  const out: ClearanceHit[] = [];
  for (const m of meshes) {
    const [lo, hi] = m.bbox;
    let best: ClearanceHit | null = null;
    for (const q of samples) {
      const p = q.p;
      if (p[0] < lo[0] - reach || p[1] < lo[1] - reach || p[2] < lo[2] - reach || p[0] > hi[0] + reach || p[1] > hi[1] + reach || p[2] > hi[2] + reach) continue;
      let d = Infinity;
      const P = m.positions, I = m.indices;
      for (let t = 0; t < I.length; t += 3) {
        const a = I[t] * 3, b = I[t + 1] * 3, c = I[t + 2] * 3;
        const dd = pointTriDist(p, [P[a], P[a + 1], P[a + 2]], [P[b], P[b + 1], P[b + 2]], [P[c], P[c + 1], P[c + 2]]);
        if (dd < d) d = dd;
      }
      let gap = d - radius;
      if (d < reach && inside(p, m)) gap = -d - radius;
      if (gap < reach - radius && (!best || gap < best.gap)) best = { comp: m.comp, name: m.name, gap, at: p, s: q.s };
    }
    if (best) out.push(best);
  }
  return out.sort((a, b) => a.gap - b.gap);
}

// ---------------------------------------------------------------- output ---

export function sizeText(r: AsmRoute): string {
  return r.kind === "cable" ? `φ${fmt(r.od)}` : `φ${fmt(r.od)}×t${fmt(r.wall)}`;
}

export interface CutRow {
  name: string;
  kind: string;
  size: string;
  length: number;
  margin: number;
  cut: number;
  bends: number;
  bendRadius: number;
}

export function cutRows(routes: AsmRoute[], comp: CompLookup): CutRow[] {
  return routes.map((r) => {
    const a = analyzeRoute(r, comp);
    return { name: r.name, kind: ROUTE_KIND_LABEL[r.kind], size: sizeText(r), length: a.length, margin: r.margin, cut: cutLength(a.length, r.margin), bends: a.bends, bendRadius: r.bendRadius };
  });
}

export function cutListCsv(rows: CutRow[]): string {
  const q = (s: string | number) => `"${String(s).replace(/"/g, '""')}"`;
  const lines = [["No", "名称", "種類", "サイズ", "経路長(mm)", "余長(%)", "切断長(mm)", "曲げ数", "曲げR(mm)"].map(q).join(",")];
  rows.forEach((r, i) => lines.push([i + 1, r.name, r.kind, r.size, r.length.toFixed(1), r.margin, Math.ceil(r.cut), r.bends, r.bendRadius.toFixed(1)].map(q).join(",")));
  return lines.join("\n");
}

function fmt(v: number) {
  return Number.isFinite(v) ? String(Math.round(v * 10) / 10) : "—";
}
