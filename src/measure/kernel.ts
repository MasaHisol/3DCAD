// Exact measurements on the B-rep (runs in the geometry worker / tests):
// hole recognition (diameter, depth, counterbore, countersink, thread),
// wall thickness by exact ray / solid intersection, minimum distance with
// closest points (BRepExtrema_DistShapeShape), clearance lists and
// face / edge / body properties.

import * as R from "replicad";
import type { Vec3 } from "../core/types";
import type { PickRef, ThreadInfo } from "../kernel/protocol";
import { edgeInfo, faceInfo } from "../kernel/geometry";
import { preciseProps } from "../kernel/exchange";
import type { ClearancePair, DistanceResult, HoleInfo, MeasureOp, MeasureTarget, PropsResult, ThicknessResult } from "./types";

type Shape = R.AnyShape;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const oc = () => R.getOC() as any;

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
const tuple = (v: R.Vector | number[]): Vec3 => (Array.isArray(v) ? [v[0], v[1], v[2]] : (v.toTuple() as Vec3));
const DEG = 180 / Math.PI;

export interface MeasureCtx {
  /** Solid bodies followed by surface bodies (same order as the viewer's pick bodies). */
  bodies: Shape[];
  threads: ThreadInfo[];
  /** Assembly: placed shapes with their placement index. */
  placed?: { shape: Shape; index: number }[];
}

/** Distance between two shapes (BRepExtrema_DistShapeShape). */
export function shapeDistance(a: Shape, b: Shape): number {
  return R.measureDistanceBetween(a as never, b as never);
}

function topo(ctx: MeasureCtx, p: PickRef): Shape {
  const b = ctx.bodies[p.body];
  if (!b) throw new Error("ボディが見つかりません");
  if (p.kind === "face") return b.faces[p.index] as Shape;
  if (p.kind === "edge") return b.edges[p.index] as Shape;
  if (p.point) return R.makeVertex(p.point) as unknown as Shape;
  throw new Error("不正な参照");
}

function target(ctx: MeasureCtx, t: MeasureTarget): Shape {
  if (t.kind === "body") {
    const b = ctx.bodies[t.body];
    if (!b) throw new Error("ボディが見つかりません");
    return b;
  }
  if (t.kind === "comp") {
    const list = (ctx.placed ?? []).filter((x) => x.index === t.comp).map((x) => x.shape);
    if (!list.length) throw new Error("コンポーネントが見つかりません");
    return list.length === 1 ? list[0] : (R.makeCompound(list as never) as unknown as Shape);
  }
  return topo(ctx, t);
}

// ---------------------------------------------------------------- holes ---

function onAxis(o: Vec3, d: Vec3, p: Vec3, q: Vec3, tol: number): boolean {
  if (Math.abs(Math.abs(dot(d, q)) - 1) > 1e-6) return false;
  const off = sub(p, o);
  return len(sub(off, mul(d, dot(off, d)))) < tol;
}

/** Axial span [t0, t1] of a face along the axis and its min / max radius. */
function axialSpan(face: R.Face, o: Vec3, d: Vec3): { t0: number; t1: number; rmin: number; rmax: number; r0: number; r1: number } {
  let t0 = Infinity, t1 = -Infinity, rmin = Infinity, rmax = 0, r0 = 0, r1 = 0;
  for (const e of face.edges)
    for (const u of [0, 0.25, 0.5, 0.75, 1]) {
      const p = tuple(e.pointAt(u));
      const t = dot(sub(p, o), d);
      const r = len(sub(sub(p, o), mul(d, t)));
      if (t < t0) (t0 = t), (r0 = r);
      if (t > t1) (t1 = t), (r1 = r);
      rmin = Math.min(rmin, r);
      rmax = Math.max(rmax, r);
    }
  return { t0, t1, rmin, rmax, r0, r1 };
}

/** Surface normal of a face of revolution points towards its axis (hole wall, not a boss). */
function inward(face: R.Face, o: Vec3, d: Vec3): boolean {
  const p = tuple(face.pointOnSurface(0.5, 0.5));
  const n = tuple(face.normalAt(p as never));
  const rad = sub(sub(p, o), mul(d, dot(sub(p, o), d)));
  return dot(n, rad) < 0;
}

/** Face whose boundary is a straight-line generator revolved about the axis (cone / cylinder in any representation). */
function conical(face: R.Face, o: Vec3, d: Vec3, tol: number): boolean {
  const pts: [number, number][] = [];
  for (const e of face.edges)
    for (const u of [0, 0.2, 0.4, 0.6, 0.8, 1]) {
      const p = tuple(e.pointAt(u));
      const t = dot(sub(p, o), d);
      pts.push([t, len(sub(sub(p, o), mul(d, t)))]);
    }
  if (pts.length < 3) return false;
  const lo = pts.reduce((a, b) => (b[0] < a[0] ? b : a)), hi = pts.reduce((a, b) => (b[0] > a[0] ? b : a));
  if (hi[0] - lo[0] < 1e-9) return false;
  const k = (hi[1] - lo[1]) / (hi[0] - lo[0]);
  return pts.every(([t, r]) => Math.abs(lo[1] + k * (t - lo[0]) - r) < tol);
}

/** True when the point lies in the material of the solid. */
function inside(solid: Shape, p: Vec3, h: number): boolean {
  const pieces = segmentInside(solid, sub(p, [h, h * 0.37, h * 0.21]), add(p, [h, h * 0.37, h * 0.21]));
  return pieces.some(([a, b]) => a <= 0.5 && b >= 0.5);
}

/** Recognise the hole (or boss / shaft) a cylindrical face belongs to. */
export function holeInfo(ctx: MeasureCtx, ref: PickRef): HoleInfo {
  const body = ctx.bodies[ref.body];
  if (!body || ref.kind !== "face") throw new Error("穴の円筒面を選択してください");
  const faces = body.faces;
  const face = faces[ref.index];
  const fi = faceInfo(face);
  if (fi.type !== "CYLINDRE" || !fi.axis) throw new Error("円筒面ではありません");
  const o = fi.axis.origin;
  let d = fi.axis.dir;
  const isHole = inward(face, o, d);
  const tol = 1e-4 * Math.max(1, fi.axis.radius);
  // coaxial cylinders / cones of the same body
  const stack: { index: number; type: string; r: number; span: ReturnType<typeof axialSpan>; hole: boolean }[] = [];
  faces.forEach((f, i) => {
    const t = String(f.geomType);
    if (t === "PLANE") return;
    const inf = i === ref.index ? fi : faceInfo(f);
    if (t === "CYLINDRE" || t === "CONE") {
      if (!inf.axis || !onAxis(o, d, inf.axis.origin, inf.axis.dir, tol)) return;
    } else if (!conical(f, o, d, tol * 10)) return; // e.g. a countersink made as a B-spline loft
    const sp = axialSpan(f, o, d);
    if (t !== "CYLINDRE" && sp.t1 - sp.t0 < 1e-9) return;
    stack.push({ index: i, type: t === "CYLINDRE" ? t : "CONE", r: t === "CYLINDRE" ? inf.axis!.radius : (sp.rmin + sp.rmax) / 2, span: sp, hole: i === ref.index ? isHole : inward(f, o, d) });
  });
  const main = stack.find((s) => s.index === ref.index)!;
  if (!isHole) {
    return { kind: "boss", center: add(o, mul(d, main.span.t0)), axis: d, diameter: 2 * main.r, depth: main.span.t1 - main.span.t0, through: false, faces: [ref.index], body: ref.body };
  }
  // connected hole faces: grow from the picked face along the axis
  const holeFaces = stack.filter((s) => s.hole).sort((a, b) => a.span.t0 - b.span.t0);
  const eps = 1e-5 * Math.max(1, main.r);
  const group = [main];
  let lo = main.span.t0, hi = main.span.t1;
  for (let grew = true; grew; ) {
    grew = false;
    for (const s of holeFaces)
      if (!group.includes(s) && s.span.t1 >= lo - eps && s.span.t0 <= hi + eps) {
        group.push(s);
        lo = Math.min(lo, s.span.t0);
        hi = Math.max(hi, s.span.t1);
        grew = true;
      }
  }
  // which ends open to the air: probe on the axis just beyond each end
  const probe = Math.max(1e-3, main.r * 1e-2);
  const openLo = !inside(body, add(o, mul(d, lo - 2 * probe)), probe);
  const openHi = !inside(body, add(o, mul(d, hi + 2 * probe)), probe);
  const through = openLo && openHi;
  // orient the axis from the entry into the material
  let entry = lo;
  if (!openLo && openHi) {
    d = mul(d, -1);
    entry = -hi;
    for (const s of group) {
      const { t0, t1, r0, r1 } = s.span;
      s.span = { ...s.span, t0: -t1, t1: -t0, r0: r1, r1: r0 };
    }
  }
  const T = (s: (typeof group)[number]) => [s.span.t0 - entry, s.span.t1 - entry] as const;
  const cyls = group.filter((s) => s.type === "CYLINDRE");
  const drill = cyls.reduce((a, b) => (b.r < a.r ? b : a), cyls[0] ?? main);
  const info: HoleInfo = {
    kind: "hole",
    center: add(o, mul(d, entry)),
    axis: d,
    diameter: 2 * drill.r,
    depth: through ? hi - lo : Math.max(...cyls.filter((s) => Math.abs(s.r - drill.r) < eps).map((s) => T(s)[1])),
    through,
    faces: group.map((s) => s.index),
    body: ref.body,
  };
  // counterbore: a wider cylinder starting at the entry
  const cb = cyls.filter((s) => s.r > drill.r + eps && T(s)[0] < eps * 10).sort((a, b) => b.r - a.r)[0];
  if (cb) info.counterbore = { diameter: 2 * cb.r, depth: T(cb)[1] };
  for (const s of group.filter((x) => x.type === "CONE")) {
    const [a, z] = T(s);
    const half = Math.atan2(Math.abs(s.span.r1 - s.span.r0), Math.max(1e-12, z - a)) * DEG;
    if (s.span.r0 > s.span.r1 + eps && a < (cb ? T(cb)[1] : 0) + eps * 10) info.countersink = { diameter: 2 * s.span.rmax, angle: 2 * half };
    else if (!through && s.span.r1 < s.span.r0) info.drillPoint = { angle: 2 * half };
  }
  // cosmetic thread on this axis
  const th = ctx.threads.find((t) => onAxis(o, d, t.origin, t.dir, Math.max(tol, 1e-3)) && Math.abs(t.minor - info.diameter) < Math.max(0.05, t.pitch * 0.6));
  if (th) info.thread = { major: th.major, minor: th.minor, pitch: th.pitch, length: th.length, designation: `M${+th.major.toFixed(2)}×${+th.pitch.toFixed(3)}` };
  return info;
}

// ------------------------------------------------------- wall thickness ---

/** Pieces of the straight segment p -> q inside the solid, as parameters along the segment (0..1). */
function segmentInside(solid: Shape, p: Vec3, q: Vec3): [number, number][] {
  const O = oc();
  const edge = R.makeLine(p, q);
  const L = dist(p, q);
  const dir = mul(sub(q, p), 1 / L);
  const out: [number, number][] = [];
  const com = new O.BRepAlgoAPI_Common((solid as unknown as { wrapped: unknown }).wrapped, (edge as unknown as { wrapped: unknown }).wrapped, new O.Message_ProgressRange());
  try {
    const res = R.cast(com.Shape()) as unknown as { edges?: R.Edge[] };
    for (const e of res.edges ?? []) {
      const a = dot(sub(tuple(e.startPoint), p), dir) / L, b = dot(sub(tuple(e.endPoint), p), dir) / L;
      out.push(a < b ? [a, b] : [b, a]);
    }
  } finally {
    com.delete();
    edge.delete();
  }
  return out.sort((x, y) => x[0] - y[0]);
}

/** Wall thickness at a surface point: distance along -normal to the opposite wall (NaN = none within maxDepth). */
export function thicknessAt(solid: Shape, point: Vec3, normal: Vec3, maxDepth: number): number {
  const n = unit(normal);
  const start = add(point, mul(n, maxDepth * 1e-4));
  const end = sub(point, mul(n, maxDepth));
  const L = dist(start, end);
  const off = maxDepth * 1e-4;
  for (const [a, b] of segmentInside(solid, start, end)) if (a * L <= off * 3 + 1e-6) return b * L - off > maxDepth * 1e-7 ? b * L - off : NaN;
  return NaN;
}

/** Thickness map: rays from up to `samples` points of the body's triangulation (uniform over faces). */
export function thicknessMap(ctx: MeasureCtx, bodyIndex: number, samples = 600, maxDepth?: number): ThicknessResult {
  const t0 = performance.now();
  const body = ctx.bodies[bodyIndex];
  if (!body) throw new Error("ボディが見つかりません");
  const [lo, hi] = (body as R.Shape3D).boundingBox.bounds as [Vec3, Vec3];
  const diag = dist(lo, hi);
  const depth = maxDepth ?? diag;
  const faces = body.faces;
  // sample points: face centres plus vertices of a coarse triangulation, spread evenly
  const pts: Vec3[] = [], nrm: Vec3[] = [];
  const m = (body as R.Shape3D).mesh({ tolerance: Math.max(0.01, diag * 2e-3), angularTolerance: 0.35 });
  for (const f of faces) {
    const inf = faceInfo(f);
    pts.push(inf.center);
    nrm.push(inf.normal);
  }
  // triangle centroids lie strictly inside their face (vertices on face boundaries would graze the neighbour face)
  const nt = m.triangles.length / 3;
  const V = (k: number): Vec3 => [m.vertices[k * 3], m.vertices[k * 3 + 1], m.vertices[k * 3 + 2]];
  const N = (k: number): Vec3 => [m.normals[k * 3], m.normals[k * 3 + 1], m.normals[k * 3 + 2]];
  const stride = Math.max(1, Math.ceil(nt / Math.max(1, samples - faces.length)));
  for (let t = 0; t < nt; t += stride) {
    const [a, b, c] = [m.triangles[t * 3], m.triangles[t * 3 + 1], m.triangles[t * 3 + 2]];
    pts.push(mul(add(add(V(a), V(b)), V(c)), 1 / 3));
    nrm.push(unit(add(add(N(a), N(b)), N(c))));
  }
  const values = pts.map((p, i) => {
    try {
      return thicknessAt(body, p, nrm[i], depth);
    } catch {
      return NaN;
    }
  });
  let min = Infinity, max = -Infinity, minAt: Vec3 | undefined;
  values.forEach((v, i) => {
    if (!Number.isFinite(v)) return;
    if (v < min) (min = v), (minAt = pts[i]);
    if (v > max) max = v;
  });
  return { body: bodyIndex, points: pts, normals: nrm, values, min, max, minAt, timeMs: performance.now() - t0 };
}

// ------------------------------------------------------------- distance ---

/** Faces of a solid as a shell-like compound (points inside a solid would have distance 0). */
function skin(s: Shape): Shape {
  const t = String((s as unknown as { constructor: { name: string } }).constructor.name);
  if (t === "Solid" || t === "Compound" || t === "CompSolid") {
    const fs = (s as R.Shape3D).faces;
    if (fs.length) return R.makeCompound(fs as never) as unknown as Shape;
  }
  return s;
}

function vertexDist(p: Vec3, s: Shape): number {
  const v = R.makeVertex(p);
  try {
    return shapeDistance(v as unknown as Shape, s);
  } finally {
    v.delete();
  }
}

/** Closest point of `s` to `p` from the gradient of the distance function. */
function closestPoint(p: Vec3, s: Shape, scale: number): Vec3 {
  const f = vertexDist(p, s);
  if (f < 1e-9) return p;
  const h = Math.max(1e-6, Math.min(f * 1e-3, scale * 1e-5));
  const g: Vec3 = [0, 1, 2].map((k) => {
    const a = [...p] as Vec3, b = [...p] as Vec3;
    a[k] += h;
    b[k] -= h;
    return (vertexDist(a, s) - vertexDist(b, s)) / (2 * h);
  }) as Vec3;
  return sub(p, mul(unit(g), f));
}

function centre(s: Shape): Vec3 {
  const [lo, hi] = (s as R.Shape3D).boundingBox.bounds as [Vec3, Vec3];
  return mul(add(lo, hi), 0.5);
}

function subShapes(s: Shape): Shape[] {
  const x = s as R.Shape3D;
  const faces = (x.faces ?? []) as Shape[];
  if (faces.length) return faces;
  const edges = (x.edges ?? []) as Shape[];
  return edges.length ? edges : [s];
}

/** Minimum distance between two shapes with the closest points. */
export function distanceWithPoints(a: Shape, b: Shape): DistanceResult {
  const d = shapeDistance(a, b);
  const sa = skin(a), sb = skin(b);
  // touching or overlapping solids
  if (d < 1e-7) return { distance: 0, overlap: true };
  // narrow down to the sub-shapes realising the minimum
  const near = (s: Shape, other: Shape) => subShapes(s).filter((x) => shapeDistance(x, other) <= d + 1e-6 * Math.max(1, d));
  const na = near(sa, sb), nb = near(sb, sa);
  const A = na.length === 1 ? na[0] : sa, B = nb.length === 1 ? nb[0] : sb;
  const scale = Math.max(d, dist(centre(a), centre(b)), 1);
  let p = centre(A), q = closestPoint(p, B, scale);
  for (let it = 0; it < 40; it++) {
    const p2 = closestPoint(q, A, scale);
    const q2 = closestPoint(p2, B, scale);
    const moved = dist(p2, p) + dist(q2, q);
    p = p2;
    q = q2;
    if (moved < 1e-9 * scale || Math.abs(dist(p, q) - d) < 1e-9 * scale) break;
  }
  return { distance: d, pa: p, pb: q, overlap: false };
}

function bboxGap(a: Shape, b: Shape): number {
  const [al, ah] = (a as R.Shape3D).boundingBox.bounds as [Vec3, Vec3];
  const [bl, bh] = (b as R.Shape3D).boundingBox.bounds as [Vec3, Vec3];
  let s = 0;
  for (let k = 0; k < 3; k++) {
    const g = Math.max(0, bl[k] - ah[k], al[k] - bh[k]);
    s += g * g;
  }
  return Math.sqrt(s);
}

/** All pairs of shapes closer than `threshold` (clearance check); `index` maps shapes to their owner. */
export function clearance(shapes: { shape: Shape; index: number }[], threshold: number): ClearancePair[] {
  // one compound per owner (component / body)
  const owners = new Map<number, Shape[]>();
  for (const s of shapes) owners.set(s.index, [...(owners.get(s.index) ?? []), s.shape]);
  const list = [...owners.entries()].map(([index, ss]) => ({ index, shape: ss.length === 1 ? ss[0] : (R.makeCompound(ss as never) as unknown as Shape) }));
  const out: ClearancePair[] = [];
  for (let i = 0; i < list.length; i++)
    for (let j = i + 1; j < list.length; j++) {
      if (bboxGap(list[i].shape, list[j].shape) > threshold) continue;
      const d = shapeDistance(list[i].shape, list[j].shape);
      if (d > threshold) continue;
      out.push({ a: list[i].index, b: list[j].index, ...distanceWithPoints(list[i].shape, list[j].shape) });
    }
  return out.sort((x, y) => x.distance - y.distance);
}

// ---------------------------------------------------------------- props ---

function itemProps(ctx: MeasureCtx, t: MeasureTarget, density?: number): PropsResult["items"][number] {
  const s = target(ctx, t);
  if (t.kind === "body" || t.kind === "comp") {
    const p = preciseProps(s as R.Shape3D);
    return { kind: t.kind, volume: p.volume, area: p.area, centroid: p.centerOfMass, ...(density ? { mass: p.volume * density } : {}) };
  }
  if (t.kind === "face") {
    const f = s as R.Face;
    const inf = faceInfo(f);
    const area = preciseProps(f as unknown as R.Shape3D).area;
    const perimeter = f.edges.reduce((a, e) => a + R.measureLength(e as never), 0);
    const it: PropsResult["items"][number] = { kind: "face", type: inf.type, area, perimeter, point: inf.center, normal: inf.normal };
    if (inf.axis) it.radius = inf.axis.radius;
    if (inf.type === "SPHERE") {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        it.radius = ((f as any)._geomAdaptor().Sphere() as { Radius(): number }).Radius();
      } catch {
        /* ignore */
      }
    }
    return it;
  }
  if (t.kind === "edge") {
    const e = s as R.Edge;
    const inf = edgeInfo(e);
    const length = R.measureLength(e as never);
    const it: PropsResult["items"][number] = { kind: "edge", type: inf.type, length, point: inf.mid };
    if (inf.axis) {
      it.radius = inf.axis.radius;
      it.arc = (length / inf.axis.radius) * DEG;
      it.centroid = inf.axis.origin;
    }
    return it;
  }
  return { kind: "vertex", point: t.point };
}

function direction(ctx: MeasureCtx, t: MeasureTarget): { dir: Vec3; plane: boolean } | null {
  if (t.kind !== "face" && t.kind !== "edge") return null;
  const s = topo(ctx, t);
  if (t.kind === "face") {
    const inf = faceInfo(s as R.Face);
    if (inf.type === "PLANE") return { dir: inf.normal, plane: true };
    if (inf.axis) return { dir: inf.axis.dir, plane: false };
    return null;
  }
  const inf = edgeInfo(s as R.Edge);
  if (inf.type === "LINE") return { dir: unit(sub(inf.b, inf.a)), plane: false };
  if (inf.axis) return { dir: inf.axis.dir, plane: true };
  return null;
}

export function props(ctx: MeasureCtx, refs: MeasureTarget[], density?: number): PropsResult {
  const res: PropsResult = { items: refs.map((r) => itemProps(ctx, r, density)) };
  if (refs.length === 2) {
    const a = direction(ctx, refs[0]), b = direction(ctx, refs[1]);
    if (a && b) {
      const c = Math.min(1, Math.abs(dot(a.dir, b.dir)));
      let ang = Math.acos(c) * DEG;
      // plane-line: angle between the line and the plane
      if (a.plane !== b.plane) ang = 90 - ang;
      // two planes: dihedral angle using the oriented normals
      if (a.plane && b.plane && refs[0].kind === "face" && refs[1].kind === "face") ang = Math.acos(Math.max(-1, Math.min(1, dot(a.dir, b.dir)))) * DEG;
      res.angle = ang;
    }
    res.distance = distanceWithPoints(target(ctx, refs[0]), target(ctx, refs[1]));
  }
  return res;
}

// ------------------------------------------------------------- dispatch ---

export function runMeasure(ctx: MeasureCtx, op: MeasureOp): unknown {
  switch (op.op) {
    case "hole":
      return holeInfo(ctx, op.ref);
    case "holes":
      return op.refs.map((r) => holeInfo(ctx, r));
    case "thickness":
      return thicknessMap(ctx, op.body, op.samples, op.maxDepth);
    case "thicknessAt": {
      const b = ctx.bodies[op.body];
      if (!b) throw new Error("ボディが見つかりません");
      const [lo, hi] = (b as R.Shape3D).boundingBox.bounds as [Vec3, Vec3];
      return thicknessAt(b, op.point, op.normal, op.maxDepth ?? dist(lo, hi));
    }
    case "distance":
      return distanceWithPoints(target(ctx, op.a), target(ctx, op.b));
    case "clearance":
      return clearance(ctx.placed ?? ctx.bodies.map((shape, index) => ({ shape, index })), op.threshold);
    case "props":
      return props(ctx, op.refs, op.density);
  }
}
