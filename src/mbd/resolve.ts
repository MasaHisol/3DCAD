// Re-attaches PMI references to the rebuilt bodies (same scoring as the kernel
// uses for feature references: absolute or bounding-box-normalised position,
// normal and topology type) and derives the annotation geometry: anchor points,
// measured values and automatic label offsets. Pure math on BodyMesh data.

import type { EdgeRef, FaceRef, Vec3 } from "../core/types";
import type { AxisInfo, BodyMesh } from "../kernel/protocol";
import type { PmiAnno, PmiRef } from "./pmi";
import { resolveNamed, type RefCandidate } from "../core/naming";

const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a: Vec3, s: number): Vec3 => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const len = (a: Vec3) => Math.hypot(a[0], a[1], a[2]);
const dist = (a: Vec3, b: Vec3) => len(sub(a, b));
const unit = (a: Vec3): Vec3 => {
  const l = len(a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const vec = { sub, add, mul, dot, len, dist, unit, cross };

function normInBox(p: Vec3, [lo, hi]: [Vec3, Vec3]): Vec3 {
  const f = (i: number) => (hi[i] - lo[i] > 1e-9 ? (p[i] - lo[i]) / (hi[i] - lo[i]) : 0.5);
  return [f(0), f(1), f(2)];
}

/** Bounding box of all bodies. */
export function bodiesBox(bodies: BodyMesh[]): [Vec3, Vec3] | null {
  if (!bodies.length) return null;
  const lo: Vec3 = [Infinity, Infinity, Infinity], hi: Vec3 = [-Infinity, -Infinity, -Infinity];
  for (const b of bodies)
    for (let i = 0; i < 3; i++) {
      lo[i] = Math.min(lo[i], b.bbox[0][i]);
      hi[i] = Math.max(hi[i], b.bbox[1][i]);
    }
  return [lo, hi];
}

export interface ResolvedRef {
  kind: "face" | "edge";
  body: number;
  index: number;
  type: string;
  /** Face centre / edge mid point. */
  point: Vec3;
  normal?: Vec3;
  a?: Vec3;
  b?: Vec3;
  axis?: AxisInfo;
  /** Reference re-captured from the current geometry (stored back to keep tracking). */
  updated: PmiRef;
}

export function resolveRef(bodies: BodyMesh[], r: PmiRef, diag: number): ResolvedRef | null {
  const match = (pos: Vec3, n: Vec3, refPos: Vec3, refN: Vec3 | undefined) => Math.min(dist(pos, refPos), refN ? dist(n, refN) * diag : Infinity);
  const cands: RefCandidate[] = [];
  bodies.forEach((b, bi) => {
    if (r.kind === "face") {
      const ref = r.ref as FaceRef;
      b.faces.forEach((f, fi) => {
        const n = normInBox(f.center, b.bbox);
        const nTerm = ref.type === "CYLINDRE" && f.type === "CYLINDRE" ? 0 : (1 - dot(f.normal, ref.normal)) * diag;
        let score = match(f.center, n, ref.center, ref.n) + nTerm;
        if (ref.type && ref.type !== f.type) score += diag * 0.3;
        cands.push({ body: bi, index: fi, name: b.faceNames?.[fi], score });
      });
    } else {
      const ref = r.ref as EdgeRef;
      const refDir = ref.a && ref.b ? unit(sub(ref.b, ref.a)) : null;
      b.edges.forEach((e, ei) => {
        const n = normInBox(e.mid, b.bbox);
        let score = match(e.mid, n, ref.mid, ref.n);
        if (refDir && e.type === "LINE") score += (1 - Math.abs(dot(refDir, unit(sub(e.b, e.a))))) * diag * 0.5;
        if (ref.type && ref.type !== e.type) score += diag * 0.3;
        cands.push({ body: bi, index: ei, name: b.edgeNames?.[ei], score });
      });
    }
  });
  const res = resolveNamed(r.kind, r.ref.name, cands, diag * 0.25 + 1e-3);
  if ("broken" in res) return null;
  const { body: bi, index } = res.ok;
  const b = bodies[bi];
  const name = res.ok.name ? { name: res.ok.name } : {};
  if (r.kind === "face") {
    const f = b.faces[index];
    const n = normInBox(f.center, b.bbox);
    return { kind: "face", body: bi, index, type: f.type, point: f.center, normal: f.normal, axis: f.axis, updated: { kind: "face", ref: { center: f.center, normal: f.normal, n, type: f.type, ...name } } };
  }
  const e = b.edges[index];
  const n = normInBox(e.mid, b.bbox);
  return { kind: "edge", body: bi, index, type: e.type, point: e.mid, a: e.a, b: e.b, axis: e.axis, updated: { kind: "edge", ref: { mid: e.mid, a: e.a, b: e.b, n, type: e.type, ...name } } };
}

/** Geometry of an annotation in world space. */
export interface PmiGeom {
  refs: ResolvedRef[];
  /** Point the leader / dimension starts from. */
  anchor: Vec3;
  /** Linear dimension: the two measured points and the measuring direction. */
  p1?: Vec3;
  p2?: Vec3;
  dir?: Vec3;
  /** Measured value (distance or diameter). */
  value?: number;
  /** Label position (anchor + offset). */
  label: Vec3;
  /** Offset used (stored or automatic). */
  offset: Vec3;
}

/** Linear measurement between two resolved refs: points, direction and distance. */
export function measureLinear(a: ResolvedRef, b: ResolvedRef): { p1: Vec3; p2: Vec3; dir: Vec3; value: number } {
  const planar = (r: ResolvedRef) => r.kind === "face" && r.type === "PLANE" && r.normal;
  const line = (r: ResolvedRef) => r.kind === "edge" && r.type === "LINE" && r.a && r.b;
  const pt = (r: ResolvedRef) => (r.axis && (r.type === "CYLINDRE" || r.type === "CIRCLE") ? r.axis.origin : r.point);
  // plane - anything: distance along the plane normal (parallel faces, face to edge / point)
  for (const [x, y, flip] of [[a, b, false], [b, a, true]] as const) {
    if (planar(x)) {
      const n = unit(x.normal!);
      const q = pt(y);
      const d = dot(sub(q, x.point), n);
      // measure from the second ref's point back onto the plane so the dimension sits over both
      const foot = sub(q, mul(n, d));
      return flip ? { p1: q, p2: foot, dir: n, value: Math.abs(d) } : { p1: foot, p2: q, dir: n, value: Math.abs(d) };
    }
  }
  // two (parallel) straight edges: perpendicular distance
  if (line(a) && line(b)) {
    const u = unit(sub(a.b!, a.a!));
    const w = sub(b.point, a.point);
    const perp = sub(w, mul(u, dot(w, u)));
    const p1 = a.point, p2 = add(a.point, perp);
    return { p1, p2, dir: unit(perp), value: len(perp) };
  }
  const p1 = pt(a), p2 = pt(b);
  return { p1, p2, dir: unit(sub(p2, p1)), value: dist(p1, p2) };
}

/** Radius of a cylindrical face / circular edge, or null. */
export function radiusOf(r: ResolvedRef): number | null {
  if (r.axis && r.axis.radius > 0 && (r.type === "CYLINDRE" || r.type === "CIRCLE")) return r.axis.radius;
  return null;
}

/** Min / max of a face's mesh vertices along an axis. */
function faceExtent(b: BodyMesh | undefined, fi: number, origin: Vec3, dir: Vec3): [number, number] | null {
  if (!b || !b.faceRanges || b.faceRanges.length < fi * 2 + 2) return null;
  const s = b.faceRanges[fi * 2], n = b.faceRanges[fi * 2 + 1];
  let lo = Infinity, hi = -Infinity;
  for (let k = 0; k < n; k++) {
    const v = b.indices[s + k] * 3;
    const t = (b.positions[v] - origin[0]) * dir[0] + (b.positions[v + 1] - origin[1]) * dir[1] + (b.positions[v + 2] - origin[2]) * dir[2];
    lo = Math.min(lo, t);
    hi = Math.max(hi, t);
  }
  return Number.isFinite(lo) ? [lo, hi] : null;
}

/** Any unit vector perpendicular to v, preferring one pointing away from `away`. */
function perpendicular(v: Vec3, prefer: Vec3): Vec3 {
  let p = sub(prefer, mul(v, dot(prefer, v)));
  if (len(p) < 1e-6) p = cross(v, Math.abs(v[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0]);
  return unit(p);
}

/** Resolve all references and compute the drawing geometry of one annotation (null if a reference is lost). */
export function pmiGeometry(a: PmiAnno, bodies: BodyMesh[]): PmiGeom | null {
  const box = bodiesBox(bodies);
  if (!box) return null;
  const diag = Math.max(1, dist(box[0], box[1]));
  const centre = mul(add(box[0], box[1]), 0.5);
  const refs: ResolvedRef[] = [];
  for (const r of a.refs) {
    const res = resolveRef(bodies, r, diag);
    if (!res) return null;
    refs.push(res);
  }
  const auto = diag * 0.18;
  if (a.type === "dim") {
    if (refs.length < 2) return null;
    const m = measureLinear(refs[0], refs[1]);
    const mid = mul(add(m.p1, m.p2), 0.5);
    const off = a.offset ?? mul(perpendicular(m.dir, sub(mid, centre)), auto);
    return { refs, anchor: mid, ...m, label: add(mid, off), offset: off };
  }
  const r0 = refs[0];
  let anchor = r0.point;
  let value: number | undefined;
  let outward: Vec3;
  if (a.type === "diameter") {
    const rad = radiusOf(r0);
    if (rad === null) return null;
    value = rad * 2;
    const ax = r0.axis!;
    // anchor on the surface, on the side facing away from the part centre
    const radial = perpendicular(unit(ax.dir), sub(r0.point, centre));
    // anchor at the end of the cylinder lying farther from the part centre (visible rim), not inside it
    const axd = unit(ax.dir);
    let along = dot(sub(r0.point, ax.origin), axd);
    const ext = r0.kind === "face" ? faceExtent(bodies[r0.body], r0.index, ax.origin, axd) : null;
    if (ext) along = Math.abs(ext[1] - dot(sub(centre, ax.origin), axd)) >= Math.abs(ext[0] - dot(sub(centre, ax.origin), axd)) ? ext[1] : ext[0];
    anchor = add(add(ax.origin, mul(unit(ax.dir), r0.kind === "face" ? along : 0)), mul(radial, rad));
    outward = radial;
  } else if (r0.kind === "face" && r0.normal && r0.type === "PLANE") outward = unit(r0.normal);
  else outward = len(sub(anchor, centre)) > 1e-6 ? unit(sub(anchor, centre)) : [0, 0, 1];
  // a little sideways too, so stacked labels on parallel faces do not overlap the model edge
  const off = a.offset ?? add(mul(outward, auto), mul(perpendicular(outward, [0.3, 1, 0.2]), auto * 0.35));
  return { refs, anchor, value, label: add(anchor, off), offset: off };
}
