// B-rep modelling on top of OpenCascade (via replicad). Runs inside the
// geometry worker; kept free of worker plumbing so it can be unit tested.

import * as R from "replicad";
import type { EdgeRef, FaceRef, PlaneDef, Vec2, Vec3 } from "../core/types";
import type { LoopSeg } from "../sketch/profiles";
import { THREADS } from "../core/threads";
import type {
  BodyMesh,
  EdgeInfo,
  FaceInfo,
  MassProps,
  MeasureResult,
  PickRef,
  ProjectionView,
  RebuildResult,
  RFeature,
  RRegion,
  Seg2,
  ThreadInfo,
  ThreadSpec,
  Transform,
  ViewGeometry,
  ViewSpec,
} from "./protocol";

type Shape = R.Shape3D;

interface State {
  bodies: Shape[];
  tools: Map<string, { shape: Shape; op: string }>;
  /** Cosmetic threads created so far. */
  threads?: ThreadInfo[];
}

interface CacheEntry {
  key: string;
  state: State;
  error?: string;
  refs?: { edges?: EdgeRef[]; faces?: FaceRef[] };
}

const tuple = (v: R.Vector | number[]): Vec3 => (Array.isArray(v) ? [v[0], v[1], v[2]] : (v.toTuple() as Vec3));
const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dist = (a: Vec3, b: Vec3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const scale = (a: Vec3, s: number): Vec3 => [a[0] * s, a[1] * s, a[2] * s];
const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const normalize = (a: Vec3): Vec3 => {
  const l = Math.hypot(...a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};

export function toPlane(p: PlaneDef): R.Plane {
  return new R.Plane(p.origin, p.xDir, p.normal);
}

export function planePoint(p: PlaneDef, uv: Vec2): Vec3 {
  const y = cross(p.normal, p.xDir);
  return add(add(p.origin, scale(p.xDir, uv[0])), scale(y, uv[1]));
}

function loopDrawing(segs: LoopSeg[]): R.Drawing {
  if (segs.length === 1 && segs[0].t === "circle") {
    const s = segs[0];
    return R.drawCircle(s.r).translate(s.c[0], s.c[1]);
  }
  const first = segs[0] as Exclude<LoopSeg, { t: "circle" }>;
  let pen = R.draw(first.a);
  segs.forEach((s, i) => {
    if (s.t === "circle") return;
    const end = i === segs.length - 1 ? first.a : s.b;
    pen = s.t === "line" ? (pen.lineTo(end) as typeof pen) : (pen.threePointsArcTo(end, s.m) as typeof pen);
  });
  return pen.close();
}

function regionDrawing(r: RRegion): R.Drawing {
  let d = loopDrawing(r.outer);
  for (const h of r.holes) d = d.cut(loopDrawing(h));
  return d;
}

function fuseAll(shapes: Shape[]): Shape {
  let s = shapes[0];
  for (let i = 1; i < shapes.length; i++) s = s.fuse(shapes[i]);
  return s;
}

function bboxOverlap(a: Shape, b: Shape): boolean {
  const [a0, a1] = a.boundingBox.bounds as [Vec3, Vec3];
  const [b0, b1] = b.boundingBox.bounds as [Vec3, Vec3];
  const e = 1e-6;
  return a0[0] <= b1[0] + e && b0[0] <= a1[0] + e && a0[1] <= b1[1] + e && b0[1] <= a1[1] + e && a0[2] <= b1[2] + e && b0[2] <= a1[2] + e;
}

function isEmpty(s: Shape | null | undefined): boolean {
  if (!s || s.isNull) return true;
  try {
    return s.faces.length === 0;
  } catch {
    return true;
  }
}

function applyOp(bodies: Shape[], tool: Shape, op: string): Shape[] {
  if (op === "new" || (bodies.length === 0 && op === "join")) return [...bodies, tool];
  if (bodies.length === 0) throw new Error(op === "cut" ? "切り取る対象のボディがありません" : "交差する対象のボディがありません");
  if (op === "join") {
    const hit = bodies.filter((b) => bboxOverlap(b, tool));
    if (!hit.length) return [...bodies, tool];
    const rest = bodies.filter((b) => !hit.includes(b));
    return [fuseAll([...hit, tool]), ...rest];
  }
  const out: Shape[] = [];
  for (const b of bodies) {
    if (!bboxOverlap(b, tool)) {
      if (op === "cut") out.push(b);
      continue;
    }
    const r = op === "cut" ? b.cut(tool) : b.intersect(tool);
    if (!isEmpty(r)) out.push(r);
  }
  return out;
}

function modelDiag(bodies: Shape[]): number {
  let lo: Vec3 = [Infinity, Infinity, Infinity], hi: Vec3 = [-Infinity, -Infinity, -Infinity];
  for (const b of bodies) {
    const [a, c] = b.boundingBox.bounds as [Vec3, Vec3];
    lo = [Math.min(lo[0], a[0]), Math.min(lo[1], a[1]), Math.min(lo[2], a[2])];
    hi = [Math.max(hi[0], c[0]), Math.max(hi[1], c[1]), Math.max(hi[2], c[2])];
  }
  return bodies.length ? dist(lo, hi) : 100;
}

function rotateVec(v: Vec3, axis: Vec3, deg: number): Vec3 {
  const k = normalize(axis), a = (deg * Math.PI) / 180, c = Math.cos(a), sn = Math.sin(a);
  const kv = cross(k, v), kd = dot(k, v);
  return [0, 1, 2].map((i) => v[i] * c + kv[i] * sn + k[i] * kd * (1 - c)) as Vec3;
}

/** Apply a Transform to a point (or a direction when `dir`). */
function transformPoint(p: Vec3, t: Transform, dir = false): Vec3 {
  let q = p;
  if (t.mirror) {
    const n = normalize(t.mirror.normal);
    const d = dir ? dot(q, n) : dot(sub(q, t.mirror.origin), n);
    q = sub(q, scale(n, 2 * d));
  }
  if (t.rotate && t.rotate.angle) {
    const o = dir ? ([0, 0, 0] as Vec3) : t.rotate.origin;
    q = add(rotateVec(sub(q, o), t.rotate.axis, t.rotate.angle), o);
  }
  if (t.translate && !dir) q = add(q, t.translate);
  return q;
}

function transformThread(th: ThreadInfo, t: Transform): ThreadInfo {
  return { ...th, origin: transformPoint(th.origin, t), dir: normalize(transformPoint(th.dir, t, true)) };
}

function transformShape(s: Shape, t: Transform): Shape {
  let out = s.clone();
  if (t.mirror) out = out.mirror(t.mirror.normal, t.mirror.origin);
  if (t.rotate && t.rotate.angle) out = out.rotate(t.rotate.angle, t.rotate.origin, t.rotate.axis);
  if (t.translate) out = out.translate(t.translate);
  return out;
}

// ------------------------------------------------------------ references ---

type OcAx = { Location(): OcXYZ; Direction(): OcXYZ };
type OcXYZ = { X(): number; Y(): number; Z(): number };
const xyz = (p: OcXYZ): Vec3 => [p.X(), p.Y(), p.Z()];

function edgeInfo(e: R.Edge): EdgeInfo {
  const a = tuple(e.startPoint), b = tuple(e.endPoint);
  let mid: Vec3;
  try {
    mid = tuple(e.pointAt(0.5));
  } catch {
    mid = scale(add(a, b), 0.5);
  }
  const info: EdgeInfo = { mid, a, b, type: String(e.geomType), length: e.length };
  if (info.type === "CIRCLE") {
    try {
      const ad = (e as unknown as { _geomAdaptor(): { Circle(): { Axis(): OcAx; Radius(): number } } })._geomAdaptor();
      const ci = ad.Circle();
      const ax = ci.Axis();
      info.axis = { origin: xyz(ax.Location()), dir: normalize(xyz(ax.Direction())), radius: ci.Radius() };
    } catch {
      /* no axis */
    }
  }
  return info;
}

type Box = [Vec3, Vec3];
function bodyBox(b: Shape): Box {
  return b.boundingBox.bounds as Box;
}
export function normInBox(p: Vec3, [lo, hi]: Box): Vec3 {
  const f = (i: number) => (hi[i] - lo[i] > 1e-9 ? (p[i] - lo[i]) / (hi[i] - lo[i]) : 0.5);
  return [f(0), f(1), f(2)];
}

/**
 * Score how well a candidate matches a stored reference. Absolute position
 * works for small edits, bounding-box-normalised position for edits that
 * stretch the part; the better of both is used.
 */
function matchScore(pos: Vec3, n: Vec3, refPos: Vec3, refN: Vec3 | undefined, diag: number): number {
  const abs = dist(pos, refPos);
  const rel = refN ? dist(n, refN) * diag : Infinity;
  return Math.min(abs, rel);
}

function resolveEdges(bodies: Shape[], refs: EdgeRef[], diag: number): { perBody: Map<number, R.Edge[]>; updated: EdgeRef[] } {
  const perBody = new Map<number, R.Edge[]>();
  const updated: EdgeRef[] = [];
  const infos = bodies.map((b) => {
    const box = bodyBox(b);
    return b.edges.map((e) => {
      const info = edgeInfo(e);
      return { e, info, n: normInBox(info.mid, box), box };
    });
  });
  const taken = new Set<R.Edge>();
  for (const ref of refs) {
    let best: { bi: number; e: R.Edge; info: EdgeInfo; n: Vec3; score: number } | null = null;
    const refDir = ref.a && ref.b ? normalize(sub(ref.b, ref.a)) : null;
    infos.forEach((list, bi) =>
      list.forEach(({ e, info, n }) => {
        if (taken.has(e)) return;
        let score = matchScore(info.mid, n, ref.mid, ref.n, diag);
        if (ref.type && ref.type !== info.type) score += diag * 0.3;
        if (refDir && info.type === "LINE") {
          const d = normalize(sub(info.b, info.a));
          score += (1 - Math.abs(dot(d, refDir))) * diag * 0.5;
        }
        if (!best || score < best.score) best = { bi, e, info, n, score };
      }),
    );
    if (!best || (best as { score: number }).score > diag * 0.2 + 1e-3) throw new Error("参照エッジが見つかりません (形状が大きく変化しました)");
    const b = best as { bi: number; e: R.Edge; info: EdgeInfo; n: Vec3 };
    taken.add(b.e);
    if (!perBody.has(b.bi)) perBody.set(b.bi, []);
    perBody.get(b.bi)!.push(b.e);
    updated.push({ mid: b.info.mid, a: b.info.a, b: b.info.b, n: b.n, type: b.info.type });
  }
  return { perBody, updated };
}

function faceInfo(f: R.Face): FaceInfo {
  const center = tuple(f.center);
  let normal: Vec3 = [0, 0, 1];
  try {
    normal = normalize(tuple(f.normalAt(f.center)));
  } catch {
    /* degenerate */
  }
  const type = String(f.geomType);
  const info: FaceInfo = { center, normal, type };
  if (type === "CYLINDRE" || type === "CONE") {
    try {
      const ad = (f as unknown as { _geomAdaptor(): { Cylinder(): { Axis(): OcAx; Radius(): number }; Cone(): { Axis(): OcAx; RefRadius(): number } } })._geomAdaptor();
      if (type === "CYLINDRE") {
        const cy = ad.Cylinder();
        const ax = cy.Axis();
        info.axis = { origin: xyz(ax.Location()), dir: normalize(xyz(ax.Direction())), radius: cy.Radius() };
      } else {
        const co = ad.Cone();
        const ax = co.Axis();
        info.axis = { origin: xyz(ax.Location()), dir: normalize(xyz(ax.Direction())), radius: co.RefRadius() };
      }
    } catch {
      /* no axis */
    }
  }
  if (type === "PLANE") {
    // pick an x axis aligned with the most fitting world axis
    const axes: Vec3[] = [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ];
    let best = axes[0], bd = 2;
    for (const a of axes) {
      const d = Math.abs(dot(a, normal));
      if (d < bd) (bd = d), (best = a);
    }
    const xDir = normalize(sub(best, scale(normal, dot(best, normal))));
    info.plane = { origin: center, xDir, normal };
  }
  return info;
}

function resolveFaces(bodies: Shape[], refs: FaceRef[], diag: number): { perBody: Map<number, R.Face[]>; updated: FaceRef[] } {
  const perBody = new Map<number, R.Face[]>();
  const updated: FaceRef[] = [];
  const infos = bodies.map((b) => {
    const box = bodyBox(b);
    return b.faces.map((f) => {
      const info = faceInfo(f);
      return { f, info, n: normInBox(info.center, box) };
    });
  });
  for (const ref of refs) {
    let best: { bi: number; f: R.Face; info: FaceInfo; n: Vec3; score: number } | null = null;
    infos.forEach((list, bi) =>
      list.forEach(({ f, info, n }) => {
        // a full cylinder's "normal at centre" is ill-defined: match those by position only
        const nTerm = ref.type === "CYLINDRE" && info.type === "CYLINDRE" ? 0 : (1 - dot(info.normal, ref.normal)) * diag;
        let score = matchScore(info.center, n, ref.center, ref.n, diag) + nTerm;
        if (ref.type && ref.type !== info.type) score += diag * 0.3;
        if (!best || score < best.score) best = { bi, f, info, n, score };
      }),
    );
    if (!best || (best as { score: number }).score > diag * 0.25 + 1e-3) throw new Error("参照面が見つかりません");
    const b = best as { bi: number; f: R.Face; info: FaceInfo; n: Vec3 };
    if (!perBody.has(b.bi)) perBody.set(b.bi, []);
    perBody.get(b.bi)!.push(b.f);
    updated.push({ center: b.info.center, normal: b.info.normal, n: b.n, type: b.info.type });
  }
  return { perBody, updated };
}

// -------------------------------------------------------------- features ---

function profileSolid(plane: PlaneDef, regions: RRegion[], make: (sk: R.Sketch) => Shape): Shape {
  if (!regions.length) throw new Error("プロファイルが選択されていません");
  const solids = regions.map((r) => make(regionDrawing(r).sketchOnPlane(toPlane(plane)) as R.Sketch));
  return fuseAll(solids);
}

function buildHole(f: Extract<RFeature, { type: "hole" }>, diag: number): Shape {
  const n: Vec3 = f.flip ? f.plane.normal : scale(f.plane.normal, -1);
  const depth = f.through ? diag * 2 + 10 : f.depth;
  const tools: Shape[] = [];
  for (const uv of f.points) {
    const p = planePoint(f.plane, uv);
    // start a bit above the face so coplanar booleans are robust
    const start = add(p, scale(n, -1e-3));
    let t: Shape = R.makeCylinder(f.diameter / 2, depth + 1e-3, start, n);
    if (f.holeType === "counterbore" && f.cbDiameter > f.diameter) {
      t = t.fuse(R.makeCylinder(f.cbDiameter / 2, f.cbDepth + 1e-3, start, n));
    } else if (f.holeType === "countersink" && f.csDiameter > f.diameter) {
      const h = (f.csDiameter - f.diameter) / 2 / Math.tan(((f.csAngle / 2) * Math.PI) / 180);
      const cone = R.makeCylinder(f.csDiameter / 2, 1e-3, start, n);
      const sk = R.drawCircle(f.csDiameter / 2).sketchOnPlane(new R.Plane(start, perp(n), n)) as R.Sketch;
      const coneSolid = sk.extrude(h, { extrusionProfile: { profile: "linear", endFactor: f.diameter / f.csDiameter } });
      t = t.fuse(coneSolid).fuse(cone);
    }
    tools.push(t);
  }
  if (!tools.length) throw new Error("穴の中心点がありません");
  return fuseAll(tools);
}

function perp(n: Vec3): Vec3 {
  const a: Vec3 = Math.abs(n[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
  return normalize(cross(cross(n, a), n));
}

function buildPrimitive(f: Extract<RFeature, { type: "primitive" }>): Shape {
  const pl = toPlane(f.plane);
  const o = planePoint(f.plane, f.center);
  const n = f.plane.normal;
  switch (f.shape) {
    case "box": {
      const sk = R.drawRectangle(f.a, f.b).translate(f.center[0], f.center[1]).sketchOnPlane(pl) as R.Sketch;
      return sk.extrude(f.c);
    }
    case "cylinder":
      return R.makeCylinder(f.a / 2, f.c, o, n);
    case "sphere":
      return R.makeSphere(f.a / 2).translate(o);
    case "torus": {
      // revolve a circle around the plane normal
      const y = cross(n, f.plane.xDir);
      const sk = R.drawCircle(f.b / 2)
        .translate(f.a / 2, 0)
        .sketchOnPlane(new R.Plane(o, f.plane.xDir, scale(y, -1))) as R.Sketch;
      return sk.revolve(n, { origin: o });
    }
  }
}

async function evalFeature(f: RFeature, st: State, entry: CacheEntry): Promise<State> {
  const out = await evalShape(f, st, entry);
  let threads = out.threads ?? st.threads ?? [];
  if (f.type === "hole" && f.thread) threads = [...threads, ...holeThreads(f, f.thread, out.bodies)];
  if (f.type === "pattern") {
    const src = new Set(f.sources);
    const base = threads.filter((t) => src.has(t.feature));
    threads = [...threads, ...f.transforms.flatMap((tr) => base.map((t) => transformThread(t, tr)))];
  }
  if (f.type === "move") threads = threads.map((t) => transformThread(t, f.transform));
  return { ...out, threads };
}

/** Thread size for a cylinder of diameter `dia` (external: major ≈ dia, internal: minor ≈ dia). */
function autoThread(spec: ThreadSpec, dia: number, internal: boolean): { name: string; d: number; pitch: number } {
  if (spec.name && spec.d > 0) return spec;
  const list = THREADS.filter((t) => t.family === "M");
  let best = list[0], bd = Infinity;
  for (const t of list) {
    const ref = internal ? t.d - t.pitch : t.d;
    const e = Math.abs(ref - dia);
    if (e < bd) (bd = e), (best = t);
  }
  return best;
}

/** Span of a cylindrical face along its axis, measured from `origin`. */
function cylSpan(face: R.Face, origin: Vec3, dir: Vec3): [number, number] {
  let t0 = Infinity, t1 = -Infinity;
  for (const e of face.edges)
    for (const u of [0, 0.25, 0.5, 0.75, 1]) {
      const t = dot(sub(tuple(e.pointAt(u)), origin), dir);
      t0 = Math.min(t0, t);
      t1 = Math.max(t1, t);
    }
  return [t0, t1];
}

function holeThreads(f: Extract<RFeature, { type: "hole" }>, spec: ThreadSpec, bodies: Shape[]): ThreadInfo[] {
  const n: Vec3 = f.flip ? f.plane.normal : scale(f.plane.normal, -1);
  const r = f.diameter / 2;
  const out: ThreadInfo[] = [];
  for (const uv of f.points) {
    const p = planePoint(f.plane, uv);
    // the drilled wall: cylinder faces of radius r on this axis
    let t0 = Infinity, t1 = -Infinity;
    for (const b of bodies)
      for (const face of b.faces) {
        if (String(face.geomType) !== "CYLINDRE") continue;
        const ax = faceInfo(face).axis;
        if (!ax || Math.abs(ax.radius - r) > 1e-4 || Math.abs(Math.abs(dot(ax.dir, n)) - 1) > 1e-6) continue;
        const off = sub(ax.origin, p);
        const rad = sub(off, scale(n, dot(off, n)));
        if (Math.hypot(rad[0], rad[1], rad[2]) > 1e-4) continue;
        const [a, z] = cylSpan(face, p, n);
        t0 = Math.min(t0, a);
        t1 = Math.max(t1, z);
      }
    if (!Number.isFinite(t0)) continue;
    const span = t1 - t0;
    const th = autoThread(spec, f.diameter, true);
    out.push({
      feature: f.id,
      origin: add(p, scale(n, t0)),
      dir: n,
      major: th.d,
      minor: f.diameter,
      pitch: th.pitch,
      length: spec.full ? span : Math.min(spec.length, span),
      internal: true,
      through: spec.full && f.through,
      name: th.name,
    });
  }
  return out;
}

async function evalShape(f: RFeature, st: State, entry: CacheEntry): Promise<State> {
  const bodies = st.bodies;
  const tools = new Map(st.tools);
  const diag = modelDiag(bodies);
  switch (f.type) {
    case "extrude": {
      const n = f.plane.normal;
      let from = f.from, to = f.to;
      if (f.through) {
        const big = diag * 2 + 10;
        // reach through the whole model from the sketch plane
        if (from === to) (from = 0), (to = big);
        else (from = -big), (to = big);
      }
      if (f.flip) [from, to] = [-to, -from];
      const start = { ...f.plane, origin: add(f.plane.origin, scale(n, from)) };
      const tool = profileSolid(start, f.regions, (sk) => sk.extrude(to - from));
      tools.set(f.id, { shape: tool, op: f.op });
      return { bodies: applyOp(bodies, tool, f.op), tools };
    }
    case "revolve": {
      const o = planePoint(f.plane, f.axisOrigin);
      const y = cross(f.plane.normal, f.plane.xDir);
      const axis = add(scale(f.plane.xDir, f.axisDir[0]), scale(y, f.axisDir[1]));
      const tool = profileSolid(f.plane, f.regions, (sk) => sk.revolve(axis, { origin: o, angle: f.angle }));
      tools.set(f.id, { shape: tool, op: f.op });
      return { bodies: applyOp(bodies, tool, f.op), tools };
    }
    case "loft": {
      if (f.sections.length < 2) throw new Error("ロフトには 2 つ以上の断面が必要です");
      const sks = f.sections.map((sec) => loopDrawing(sec.outer).sketchOnPlane(toPlane(sec.plane)) as R.Sketch);
      const tool = sks[0].loftWith(sks.slice(1), { ruled: f.ruled });
      tools.set(f.id, { shape: tool, op: f.op });
      return { bodies: applyOp(bodies, tool, f.op), tools };
    }
    case "sweep": {
      if (!f.path.length) throw new Error("パスがありません");
      const spine = R.assembleWire(
        f.path.map((s) => (s.t === "line" ? R.makeLine(s.a, s.b) : R.makeThreePointArc(s.a, s.m, s.b))) as R.Edge[],
      );
      const sweepLoop = (segs: LoopSeg[]) => {
        const sk = loopDrawing(segs).sketchOnPlane(toPlane(f.plane)) as R.Sketch;
        return R.genericSweep(sk.wire, spine, { frenet: true, transitionMode: "right" }, false);
      };
      if (!f.regions.length) throw new Error("プロファイルが選択されていません");
      const parts = f.regions.map((r) => {
        let solid = sweepLoop(r.outer);
        for (const h of r.holes) solid = solid.cut(sweepLoop(h));
        return solid;
      });
      const tool = fuseAll(parts);
      tools.set(f.id, { shape: tool, op: f.op });
      return { bodies: applyOp(bodies, tool, f.op), tools };
    }
    case "pushpull": {
      const { perBody, updated } = resolveFaces(bodies, [f.face], diag);
      entry.refs = { faces: updated };
      const [[bi, faces]] = [...perBody.entries()];
      const face = faces[0];
      if (String(face.geomType) !== "PLANE") throw new Error("プレス/プルは平面にのみ使用できます");
      if (Math.abs(f.distance) < 1e-9) return { bodies, tools };
      const n = normalize(tuple(face.normalAt(face.center)));
      const tool = R.basicFaceExtrusion(face, new R.Vector(scale(n, f.distance))) as unknown as Shape;
      const out = bodies.slice();
      out[bi] = f.distance > 0 ? bodies[bi].fuse(tool) : bodies[bi].cut(tool);
      if (isEmpty(out[bi])) throw new Error("ボディが消失しました");
      return { bodies: out, tools };
    }
    case "fillet":
    case "chamfer": {
      const { perBody, updated } = resolveEdges(bodies, f.edges, diag);
      entry.refs = { edges: updated };
      const out = bodies.map((b, i) => {
        const edges = perBody.get(i);
        if (!edges) return b;
        const r = f.type === "fillet" ? f.radius : f.distance;
        if (!(r > 0)) throw new Error("値は正の数である必要があります");
        return f.type === "fillet" ? b.fillet(r, (e) => e.inList(edges)) : b.chamfer(r, (e) => e.inList(edges));
      });
      return { bodies: out, tools };
    }
    case "shell": {
      const { perBody, updated } = resolveFaces(bodies, f.faces, diag);
      entry.refs = { faces: updated };
      if (!bodies.length) throw new Error("ボディがありません");
      const out = bodies.map((b, i) => {
        const faces = perBody.get(i) ?? [];
        if (!faces.length && f.faces.length) return b;
        // replicad: positive thickness hollows inward, negative grows outward
        const t = Math.abs(f.thickness) * (f.outside ? -1 : 1);
        return b.shell(t, (fc) => fc.inList(faces));
      });
      return { bodies: out, tools };
    }
    case "hole": {
      const tool = buildHole(f, diag);
      tools.set(f.id, { shape: tool, op: "cut" });
      return { bodies: applyOp(bodies, tool, "cut"), tools };
    }
    case "pattern": {
      let out = bodies;
      for (const src of f.sources) {
        const t = tools.get(src);
        if (!t) throw new Error("パターン化できないフィーチャが含まれています (押し出し/回転/穴/プリミティブのみ)");
        for (const tr of f.transforms) out = applyOp(out, transformShape(t.shape, tr), t.op === "new" ? "join" : t.op);
      }
      return { bodies: out, tools };
    }
    case "primitive": {
      const tool = buildPrimitive(f);
      tools.set(f.id, { shape: tool, op: f.op });
      return { bodies: applyOp(bodies, tool, f.op), tools };
    }
    case "import": {
      let shape: Shape;
      if (f.format === "step") {
        shape = (await R.importSTEP(new Blob([f.data]))) as Shape;
      } else {
        shape = importStl(Uint8Array.from(atob(f.data), (c) => c.charCodeAt(0)));
      }
      const solids = shape.solids?.length ? (shape.solids as Shape[]) : [shape];
      return { bodies: [...bodies, ...solids], tools };
    }
    case "move": {
      return { bodies: bodies.map((b) => transformShape(b, f.transform)), tools };
    }
    case "flange": {
      const T = f.thickness, Rr = f.radius, th = (f.angle * Math.PI) / 180;
      const C: P2 = [0, T + Rr];
      const at = (r: number, a: number): P2 => [C[0] + r * Math.sin(a), C[1] - r * Math.cos(a)];
      const fwd = (p: P2, l: number): P2 => [p[0] + l * Math.cos(th), p[1] + l * Math.sin(th)];
      const parts: Shape[] = [];
      for (const sp of f.specs) {
        const P2i = at(Rr, th), P5 = at(Rr + T, th);
        let pen = R.draw([0, 0]).lineTo([0, T]);
        if (Rr > 1e-6) pen = pen.threePointsArcTo(P2i, at(Rr, th / 2));
        if (f.leg > 1e-6) pen = pen.lineTo(fwd(P2i, f.leg)).lineTo(fwd(P5, f.leg));
        pen = pen.lineTo(P5);
        const profile = pen.threePointsArcTo([0, 0], at(Rr + T, th / 2)).close();
        const normal = cross(sp.out, sp.up);
        const reversed = dot(normal, sp.along) < 0;
        const origin = reversed ? add(sp.origin, scale(sp.along, sp.width)) : sp.origin;
        const sk = profile.sketchOnPlane(new R.Plane(origin, sp.out, normal)) as R.Sketch;
        parts.push(sk.extrude(sp.width));
      }
      const tool = fuseAll(parts);
      tools.set(f.id, { shape: tool, op: "join" });
      return { bodies: applyOp(bodies, tool, "join"), tools };
    }
    case "thread": {
      const { perBody, updated } = resolveFaces(bodies, [f.face], diag);
      entry.refs = { faces: updated };
      const face = [...perBody.values()][0]?.[0];
      const info = face && faceInfo(face);
      if (!info?.axis || info.type !== "CYLINDRE") throw new Error("円筒面を選択してください");
      const ax = info.axis;
      // material side: a hole's wall normal points towards the axis
      const q = tuple(face.edges[0].pointAt(0.5));
      const qv = sub(q, ax.origin);
      const radial = sub(qv, scale(ax.dir, dot(qv, ax.dir)));
      const internal = dot(tuple(face.normalAt(q)), radial) < 0;
      let dir = ax.dir;
      let [t0, t1] = cylSpan(face, ax.origin, dir);
      if (f.flip) {
        dir = scale(dir, -1);
        [t0, t1] = [-t1, -t0];
      }
      const span = t1 - t0 - f.offset;
      if (span <= 1e-6) throw new Error("オフセットが面の長さを超えています");
      const th = autoThread(f.thread, ax.radius * 2, internal);
      const thread: ThreadInfo = {
        feature: f.id,
        origin: add(ax.origin, scale(dir, t0 + f.offset)),
        dir,
        major: internal ? th.d : ax.radius * 2,
        minor: internal ? ax.radius * 2 : ax.radius * 2 - 1.22687 * th.pitch,
        pitch: th.pitch,
        length: f.thread.full ? span : Math.min(f.thread.length, span),
        internal,
        name: th.name,
      };
      return { bodies, tools, threads: [...(st.threads ?? []), thread] };
    }
  }
}

// ------------------------------------------------------------ the engine ---

export class GeometryEngine {
  private cache: CacheEntry[] = [];
  bodies: Shape[] = [];
  threads: ThreadInfo[] = [];

  async rebuild(features: RFeature[], captureBefore?: string): Promise<RebuildResult> {
    const t0 = performance.now();
    let state: State = { bodies: [], tools: new Map(), threads: [] };
    const errors: Record<string, string> = {};
    const updatedRefs: RebuildResult["updatedRefs"] = {};
    const next: CacheEntry[] = [];
    let prefix = "";
    let valid = true;
    let before: Shape[] | null = null;
    for (let i = 0; i < features.length; i++) {
      const f = features[i];
      if (f.id === captureBefore) before = state.bodies;
      prefix += JSON.stringify(f).length + ":" + JSON.stringify(f);
      const key = prefix;
      const cached = this.cache[i];
      let entry: CacheEntry;
      if (valid && cached && cached.key === key) {
        entry = cached;
      } else {
        valid = false;
        entry = { key, state };
        try {
          entry.state = await evalFeature(f, state, entry);
        } catch (e) {
          entry.state = state;
          entry.error = errorMessage(e);
        }
      }
      next.push(entry);
      state = entry.state;
      if (entry.error) errors[f.id] = entry.error;
      if (entry.refs) updatedRefs[f.id] = entry.refs;
    }
    this.cache = next;
    this.bodies = state.bodies;
    this.threads = state.threads ?? [];
    const diag = modelDiag(this.bodies);
    const bodies = this.bodies.map((b, i) => meshBody(b, `ソリッド${i + 1}`, diag));
    const beforeMeshes = before ? before.map((b, i) => meshBody(b, `ソリッド${i + 1}`, diag)) : undefined;
    return { bodies, before: beforeMeshes, errors, updatedRefs, timeMs: performance.now() - t0, threads: this.threads };
  }

  exportFile(format: "step" | "stl", name: string): Blob {
    if (!this.bodies.length) throw new Error("エクスポートするボディがありません");
    if (format === "step") {
      return R.exportSTEP(
        this.bodies.map((shape, i) => ({ shape, name: this.bodies.length > 1 ? `${name}_${i + 1}` : name })),
        { unit: "MM" } as never,
      );
    }
    const shape = this.bodies.length === 1 ? this.bodies[0] : (R.makeCompound(this.bodies) as unknown as Shape);
    const diag = modelDiag(this.bodies);
    return shape.blobSTL({ tolerance: Math.max(0.005, diag * 2e-4), angularTolerance: 0.1, binary: true });
  }

  massProps(): MassProps {
    let volume = 0, area = 0;
    let com: Vec3 = [0, 0, 0];
    let lo: Vec3 = [0, 0, 0], hi: Vec3 = [0, 0, 0];
    this.bodies.forEach((b, i) => {
      const vp = R.measureShapeVolumeProperties(b);
      const v = vp.volume;
      const c = tuple(vp.centerOfMass as unknown as number[]);
      com = add(com, scale(c, v));
      volume += v;
      area += R.measureArea(b as never);
      const [a, z] = b.boundingBox.bounds as [Vec3, Vec3];
      if (i === 0) (lo = a), (hi = z);
      else {
        lo = [Math.min(lo[0], a[0]), Math.min(lo[1], a[1]), Math.min(lo[2], a[2])];
        hi = [Math.max(hi[0], z[0]), Math.max(hi[1], z[1]), Math.max(hi[2], z[2])];
      }
    });
    return { volume, area, centerOfMass: volume ? scale(com, 1 / volume) : [0, 0, 0], bbox: [lo, hi], bodies: this.bodies.length };
  }

  private topo(p: PickRef): R.AnyShape {
    const b = this.bodies[p.body];
    if (!b) throw new Error("ボディが見つかりません");
    if (p.kind === "face") return b.faces[p.index];
    if (p.kind === "edge") return b.edges[p.index];
    if (p.point) return R.makeVertex(p.point) as unknown as R.AnyShape;
    throw new Error("不正な参照");
  }

  measure(a: PickRef, b?: PickRef): MeasureResult {
    const sa = this.topo(a);
    const res: MeasureResult = {};
    if (!b) {
      if (a.kind === "face") res.area = R.measureArea(sa as never);
      if (a.kind === "edge") {
        const e = sa as R.Edge;
        res.length = R.measureLength(e as never);
        if (String(e.geomType) === "CIRCLE") {
          const m = tuple(e.pointAt(0.5)), s = tuple(e.startPoint), t = tuple(e.pointAt(0.25));
          res.radius = circumradius(s, t, m);
        }
      }
      return res;
    }
    const sb = this.topo(b);
    res.distance = R.measureDistanceBetween(sa as never, sb as never);
    if (a.kind === "face" && b.kind === "face") {
      const na = faceInfo(sa as R.Face).normal, nb = faceInfo(sb as R.Face).normal;
      res.angle = (Math.acos(Math.max(-1, Math.min(1, dot(na, nb)))) * 180) / Math.PI;
    }
    if (a.kind === "edge" && b.kind === "edge") {
      const ia = edgeInfo(sa as R.Edge), ib = edgeInfo(sb as R.Edge);
      if (ia.type === "LINE" && ib.type === "LINE") {
        const da = normalize(sub(ia.b, ia.a)), db = normalize(sub(ib.b, ib.a));
        res.angle = (Math.acos(Math.min(1, Math.abs(dot(da, db)))) * 180) / Math.PI;
      }
    }
    return res;
  }

  projection(views: { name: string; dir: Vec3; xAxis: Vec3 }[], shapes: Shape[] = this.bodies): ProjectionView[] {
    if (!shapes.length) return [];
    const shape = shapes.length === 1 ? shapes[0] : (R.makeCompound(shapes) as unknown as Shape);
    return views.map((v) => {
      const cam = new R.ProjectionCamera([0, 0, 0], v.dir, v.xAxis);
      const proj = R.drawProjection(shape as never, cam);
      const paths = (d: R.Drawing) => {
        try {
          const p = d.toSVGPaths() as unknown;
          return (Array.isArray(p) ? (p as unknown[]).flat(3) : []) as string[];
        } catch {
          return [];
        }
      };
      let bounds: [number, number, number, number] = [0, 0, 0, 0];
      try {
        const bb = proj.visible.boundingBox.bounds;
        // SVG paths are y-flipped
        bounds = [bb[0][0], -bb[1][1], bb[1][0], -bb[0][1]];
      } catch {
        /* empty view */
      }
      return { name: v.name, visible: paths(proj.visible), hidden: paths(proj.hidden), bounds };
    });
  }

}

/**
 * STL -> solid: read the triangles, sew them into shells, make a solid and
 * merge coplanar facets. (replicad's importSTL assumes a single shell.)
 */
export function importStl(bytes: Uint8Array): Shape {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const oc = R.getOC() as any;
  const name = `/stl_${Math.random().toString(36).slice(2)}.stl`;
  oc.FS.writeFile(name, bytes);
  try {
    const reader = new oc.StlAPI_Reader();
    const raw = new oc.TopoDS_Shape();
    if (!reader.Read(raw, name)) throw new Error("STL を読み込めませんでした");
    const sew = new oc.BRepBuilderAPI_Sewing(1e-6, true, true, true, false);
    sew.Add(raw);
    sew.Perform(new oc.Message_ProgressRange());
    const sewed = sew.SewedShape();
    const ms = new oc.BRepBuilderAPI_MakeSolid();
    let shells = 0;
    for (const sh of R.iterTopo(sewed, "shell")) {
      ms.Add(oc.TopoDS.Shell(sh));
      shells++;
    }
    if (!shells) throw new Error("STL から閉じたシェルを作成できませんでした");
    let solid = ms.Solid();
    try {
      const up = new oc.ShapeUpgrade_UnifySameDomain(solid, true, true, false);
      up.Build();
      solid = up.Shape();
    } catch {
      /* keep facets */
    }
    return R.cast(solid) as Shape;
  } finally {
    try {
      oc.FS.unlink(name);
    } catch {
      /* already gone */
    }
  }
}

// ---------------------------------------------------------- drawing views ---

type P2 = [number, number];

function circumcircle(a: P2, b: P2, c: P2): { c: P2; r: number } | null {
  const d = 2 * (a[0] * (b[1] - c[1]) + b[0] * (c[1] - a[1]) + c[0] * (a[1] - b[1]));
  if (Math.abs(d) < 1e-12) return null;
  const a2 = a[0] ** 2 + a[1] ** 2, b2 = b[0] ** 2 + b[1] ** 2, c2 = c[0] ** 2 + c[1] ** 2;
  const cx = (a2 * (b[1] - c[1]) + b2 * (c[1] - a[1]) + c2 * (a[1] - b[1])) / d;
  const cy = (a2 * (c[0] - b[0]) + b2 * (a[0] - c[0]) + c2 * (b[0] - a[0])) / d;
  return { c: [cx, cy], r: Math.hypot(a[0] - cx, a[1] - cy) };
}

/** Curve2D list of a projected Drawing -> simple segments. */
function drawingSegments(d: R.Drawing, tag: number): Seg2[] {
  const curves: R.Curve2D[] = [];
  const walk = (s: unknown) => {
    if (!s) return;
    const o = s as { curves?: R.Curve2D[]; blueprints?: unknown[] };
    if (o.curves) curves.push(...o.curves);
    if (o.blueprints) o.blueprints.forEach(walk);
  };
  walk((d as unknown as { innerShape: unknown }).innerShape);
  const out: Seg2[] = [];
  for (const c of curves) {
    const t = String(c.geomType);
    const p0 = c.firstPoint as P2, p1 = c.lastPoint as P2;
    const t0 = c.firstParameter, t1 = c.lastParameter;
    if (t === "LINE") {
      if (Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) > 1e-9) out.push({ t: "line", a: [p0[0], p0[1]], b: [p1[0], p1[1]], tag });
    } else if (t === "CIRCLE") {
      const pm = c.value(t0 + (t1 - t0) * 0.5) as P2, pq = c.value(t0 + (t1 - t0) * 0.25) as P2;
      const full = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) < 1e-7;
      const cc = circumcircle(p0, full ? pq : pm, full ? pm : p1);
      if (!cc) continue;
      if (full) out.push({ t: "circle", c: cc.c, r: cc.r, tag });
      else {
        const ang = (p: P2) => Math.atan2(p[1] - cc.c[1], p[0] - cc.c[0]);
        const norm = (x: number) => ((x % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        let a0 = ang(p0), a1 = ang(p1);
        // store counter-clockwise from a0 to a1, passing through the mid point
        if (norm(ang(pm) - a0) > norm(a1 - a0)) [a0, a1] = [a1, a0];
        out.push({ t: "arc", c: cc.c, r: cc.r, a0, a1, tag });
      }
    } else {
      const pts: P2[] = [];
      for (let i = 0; i <= 24; i++) {
        const v = c.value(t0 + ((t1 - t0) * i) / 24) as P2;
        pts.push([v[0], v[1]]);
      }
      out.push({ t: "poly", pts, tag });
    }
  }
  return out;
}

function segBounds(segs: Seg2[], b: [number, number, number, number]) {
  const add = (x: number, y: number) => {
    b[0] = Math.min(b[0], x);
    b[1] = Math.min(b[1], y);
    b[2] = Math.max(b[2], x);
    b[3] = Math.max(b[3], y);
  };
  for (const s of segs) {
    if (s.t === "line") add(...s.a), add(...s.b);
    else if (s.t === "poly") s.pts.forEach((p) => add(...p));
    else add(s.c[0] - s.r, s.c[1] - s.r), add(s.c[0] + s.r, s.c[1] + s.r);
  }
}

/** Projects shapes for a drawing view (optionally sectioned) into tagged 2D segments. */
export function drawView(items: { shape: Shape; tag: number }[], v: ViewSpec, threads: ThreadInfo[] = []): ViewGeometry {
  const dir = normalize(v.dir), xAxis = normalize(v.xAxis);
  const yAxis = cross(dir, xAxis);
  const to2 = (p: Vec3): P2 => [dot(p, xAxis), dot(p, yAxis)];
  let shapes = items;
  const hatch: P2[][][] = [];
  if (v.section) {
    const n = normalize(v.section.normal);
    const plane = new R.Plane(v.section.origin, perp(n), n);
    shapes = [];
    for (const it of items) {
      const cut = it.shape.cutPlane(plane, 0, "negative");
      if (!cut || isEmpty(cut as Shape)) continue;
      shapes.push({ shape: cut as Shape, tag: it.tag });
      for (const f of (cut as Shape).faces) {
        if (String(f.geomType) !== "PLANE") continue;
        const fn = normalize(tuple(f.normalAt(f.center)));
        if (dot(fn, n) < 0.999 || Math.abs(dot(sub(tuple(f.center), v.section.origin), n)) > 1e-5) continue;
        const ring = (w: R.Wire): P2[] => {
          const pts: P2[] = [];
          for (const e of w.edges) {
            const k = String(e.geomType) === "LINE" ? 1 : 32;
            const rev = e.orientation === "backward";
            for (let i = 0; i < k; i++) pts.push(to2(tuple(e.pointAt(rev ? 1 - i / k : i / k))));
          }
          return pts;
        };
        try {
          // outerWire()/innerWires() consume the face: work on clones
          const inner = f.clone().innerWires();
          hatch.push([ring(f.clone().outerWire()), ...inner.map(ring)]);
        } catch {
          /* skip odd faces */
        }
      }
    }
  }
  const visible: Seg2[] = [], hidden: Seg2[] = [];
  const cam = new R.ProjectionCamera([0, 0, 0], dir, xAxis);
  if (shapes.length) {
    const all = shapes.length === 1 ? shapes[0].shape : (R.makeCompound(shapes.map((s) => s.shape.clone())) as unknown as Shape);
    const proj = R.drawProjection(all as never, cam);
    visible.push(...drawingSegments(proj.visible, shapes.length === 1 ? shapes[0].tag : -1));
    if (v.hidden !== false) hidden.push(...drawingSegments(proj.hidden, -1));
    // assemblies: identify which placement each visible edge belongs to (balloons, parts lists)
    if (shapes.length > 1) {
      const key = (s: Seg2) => {
        const p = s.t === "line" ? [(s.a[0] + s.b[0]) / 2, (s.a[1] + s.b[1]) / 2] : s.t === "poly" ? s.pts[12] : s.c;
        return `${p[0].toFixed(3)},${p[1].toFixed(3)}`;
      };
      const owner = new Map<string, number>();
      for (const s of shapes) {
        const own = R.drawProjection(s.shape as never, cam);
        for (const seg of drawingSegments(own.visible, s.tag)) owner.set(key(seg), s.tag);
      }
      for (const seg of visible) seg.tag = owner.get(key(seg)) ?? -1;
    }
  }
  // threads, JIS B 0002 simplified representation
  const thin: Seg2[] = [];
  const thr: ViewGeometry["threads"] = [];
  for (const t of threads) {
    const along = dot(t.dir, dir);
    let cut = false;
    if (v.section) {
      const n = normalize(v.section.normal);
      const off = dot(sub(t.origin, v.section.origin), n);
      const offEnd = dot(sub(add(t.origin, scale(t.dir, t.length)), v.section.origin), n);
      if (Math.min(off, offEnd) > t.major / 2) continue; // removed by the cut
      cut = Math.abs(along) < 1e-6 && Math.abs(off) < t.minor / 2;
    }
    const c = to2(t.origin);
    if (Math.abs(Math.abs(along) - 1) < 1e-6) {
      // end view: 3/4 thin circle (root), open in the upper-right quadrant
      const r = (t.internal ? t.major : t.minor) / 2;
      thin.push({ t: "arc", c, r, a0: Math.PI / 2 + 0.25, a1: Math.PI * 2 + 0.1, tag: -1 });
      thr.push({ c, r: (t.internal ? t.minor : t.major) / 2, name: t.name, depth: t.internal && !t.through ? t.length : null, internal: t.internal });
    } else if (Math.abs(along) < 1e-6) {
      // side view: root lines along the length, thick limit line at the end
      const e = to2(add(t.origin, scale(t.dir, t.length)));
      const ax: P2 = [e[0] - c[0], e[1] - c[1]];
      const L = Math.hypot(ax[0], ax[1]) || 1;
      const nrm: P2 = [-ax[1] / L, ax[0] / L];
      const off = (r: number, p: P2, k: number): P2 => [p[0] + nrm[0] * r * k, p[1] + nrm[1] * r * k];
      const rootR = (t.internal ? t.major : t.minor) / 2;
      const crestR = (t.internal ? t.minor : t.major) / 2;
      const shown = !t.internal || cut;
      for (const k of [1, -1]) (shown ? thin : hidden).push({ t: "line", a: off(rootR, c, k), b: off(rootR, e, k), tag: -1 });
      if (shown) visible.push({ t: "line", a: off(Math.max(rootR, crestR), e, 1), b: off(Math.max(rootR, crestR), e, -1), tag: -1 });
    }
  }
  const bounds: [number, number, number, number] = [Infinity, Infinity, -Infinity, -Infinity];
  segBounds(visible, bounds);
  if (!Number.isFinite(bounds[0])) bounds.splice(0, 4, 0, 0, 0, 0);
  return { visible, hidden, hatch, thin, threads: thr, bounds };
}

/** Applies a column-major rigid 4x4 matrix to a shape (rotation + translation). */
export function placeShape(s: Shape, m: number[]): Shape {
  // rotation matrix -> axis / angle
  const r00 = m[0], r10 = m[1], r20 = m[2], r01 = m[4], r11 = m[5], r21 = m[6], r02 = m[8], r12 = m[9], r22 = m[10];
  const tr = r00 + r11 + r22;
  const angle = Math.acos(Math.max(-1, Math.min(1, (tr - 1) / 2)));
  let out = s.clone();
  if (angle > 1e-9) {
    let axis: Vec3;
    if (Math.PI - angle > 1e-6) axis = normalize([r21 - r12, r02 - r20, r10 - r01]);
    else {
      // 180 degrees: axis from the diagonal
      const xx = Math.sqrt(Math.max(0, (r00 + 1) / 2)), yy = Math.sqrt(Math.max(0, (r11 + 1) / 2)), zz = Math.sqrt(Math.max(0, (r22 + 1) / 2));
      axis = normalize([xx, r01 >= 0 ? yy : -yy, r02 >= 0 ? zz : -zz]);
      if (xx < 1e-6) axis = normalize([0, yy, r12 >= 0 ? zz : -zz]);
    }
    out = out.rotate((angle * 180) / Math.PI, [0, 0, 0], axis);
  }
  if (m[12] || m[13] || m[14]) out = out.translate([m[12], m[13], m[14]]);
  return out;
}

export function exportPlaced(shapes: { shape: Shape; name: string }[], format: "step" | "stl"): Blob {
  if (!shapes.length) throw new Error("エクスポートするボディがありません");
  if (format === "step") return R.exportSTEP(shapes.map((x) => ({ shape: x.shape, name: x.name })), { unit: "MM" } as never);
  const comp = R.makeCompound(shapes.map((x) => x.shape)) as unknown as Shape;
  const diag = modelDiag(shapes.map((x) => x.shape));
  return comp.blobSTL({ tolerance: Math.max(0.005, diag * 2e-4), angularTolerance: 0.1, binary: true });
}

export function interferences(shapes: Shape[]): { a: number; b: number; volume: number }[] {
  const out: { a: number; b: number; volume: number }[] = [];
  for (let i = 0; i < shapes.length; i++)
    for (let j = i + 1; j < shapes.length; j++) {
      if (!bboxOverlap(shapes[i], shapes[j])) continue;
      try {
        const x = shapes[i].intersect(shapes[j]);
        const v = isEmpty(x) ? 0 : R.measureVolume(x as never);
        if (v > 1e-6) out.push({ a: i, b: j, volume: v });
      } catch {
        /* ignore failed booleans */
      }
    }
  return out;
}

function circumradius(a: Vec3, b: Vec3, c: Vec3): number {
  const A = dist(b, c), B = dist(a, c), C = dist(a, b);
  const s = (A + B + C) / 2;
  const area = Math.sqrt(Math.max(0, s * (s - A) * (s - B) * (s - C)));
  return area > 1e-12 ? (A * B * C) / (4 * area) : 0;
}

function errorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "number") return "ジオメトリ演算に失敗しました (OpenCascade 例外)";
  return String(e);
}

export function meshBody(b: Shape, name: string, diag: number): BodyMesh {
  const tol = Math.max(0.002, diag * 3e-4);
  const m = b.mesh({ tolerance: tol, angularTolerance: 0.25 });
  const faces = b.faces;
  const faceIndex = new Map<number, number>();
  faces.forEach((f, i) => faceIndex.set(f.hashCode, i));
  const faceRanges = new Int32Array(faces.length * 2);
  for (const g of m.faceGroups) {
    const i = faceIndex.get(g.faceId);
    if (i === undefined) continue;
    faceRanges[i * 2] = g.start;
    faceRanges[i * 2 + 1] = g.count;
  }
  const em = b.meshEdges({ tolerance: tol, angularTolerance: 0.25 });
  const edges = b.edges;
  const edgeIndex = new Map<number, number>();
  edges.forEach((e, i) => edgeIndex.set(e.hashCode, i));
  const edgeRanges = new Int32Array(edges.length * 2);
  for (const g of em.edgeGroups) {
    const i = edgeIndex.get(g.edgeId);
    if (i === undefined) continue;
    edgeRanges[i * 2] = g.start;
    edgeRanges[i * 2 + 1] = g.count;
  }
  return {
    name,
    bbox: bodyBox(b),
    positions: new Float32Array(m.vertices),
    normals: new Float32Array(m.normals),
    indices: new Uint32Array(m.triangles),
    faceRanges,
    faces: faces.map(faceInfo),
    edgePositions: new Float32Array(em.lines),
    edgeRanges,
    edges: edges.map(edgeInfo),
  };
}
