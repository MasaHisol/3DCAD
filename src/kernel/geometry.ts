// B-rep modelling on top of OpenCascade (via replicad). Runs inside the
// geometry worker; kept free of worker plumbing so it can be unit tested.

import * as R from "replicad";
import type { EdgeRef, FaceRef, PlaneDef, Vec2, Vec3 } from "../core/types";
import type { LoopSeg } from "../sketch/profiles";
import { THREADS } from "../core/threads";
import { frameJoints } from "../library/steel";
import type {
  BodyMesh,
  EdgeInfo,
  FaceInfo,
  MassProps,
  MeasureResult,
  PickRef,
  PlaneFaceRef,
  ProjectionView,
  RebuildResult,
  RFeature,
  RRegion,
  SecLoop,
  Seg2,
  ThreadInfo,
  ThreadSpec,
  Transform,
  ViewGeometry,
  ViewSpec,
} from "./protocol";
import { evalSurface, isSurfaceRFeature } from "./surface";
import { bodyMeta, exportIgesNative, exportStepXcaf, healSummary, igesToShapes, importIgesNative, importStepWithMeta, preciseProps, shapesToIges } from "./exchange";
import { readIges, writeIges } from "../io/iges";
import { RefBrokenError, edgeFaces, resolveNamed, type BrokenRef, type RefCandidate } from "../core/naming";
import { installFastTopology } from "./topo";
import { StateCache, defaultCacheBudget, prefixKeys, resumeIndex, type CacheStats } from "./rebuildCache";
import { MESH_CACHE_VERSION, PROGRESSIVE_FACES, tessParams, type TessParams, type TessQuality } from "./tessellation";
import { verifyAgainstFull } from "./verifyRebuild";
import { copyNames, nameFromSources, nameGenericTool, nameHoleTool, nameProfileTool, namesOf, setNames, type NameSource, type NamingHints } from "./naming";

type Shape = R.Shape3D;

installFastTopology();

interface State {
  bodies: Shape[];
  tools: Map<string, { shape: Shape; op: string }>;
  /** Cosmetic threads created so far. */
  threads?: ThreadInfo[];
  /** Surface bodies (open shells) by the id of the feature that made them. */
  surfaces?: Map<string, Shape>;
}

interface CacheEntry {
  key: string;
  state: State;
  error?: string;
  refs?: { edges?: EdgeRef[]; faces?: FaceRef[] };
  /** Sketch placed on a model face: the re-resolved face and plane (keyed by sketch id). */
  sketchRefs?: { id: string; faces: FaceRef[]; plane: PlaneDef };
  /** References that could not be resolved (with candidates). */
  broken?: BrokenRef[];
  /** Information for the user (e.g. what the import repair did). */
  notice?: string;
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

function solidsOf(s: Shape): Shape[] {
  const list = (s as unknown as { solids?: Shape[] }).solids;
  return list?.length ? list : [s];
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

export function edgeInfo(e: R.Edge): EdgeInfo {
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
    const names = namesOf(b)?.edges;
    const list = b.edges;
    return list.map((e, i) => {
      const info = edgeInfo(e);
      return { e, info, n: normInBox(info.mid, box), name: names?.[i] };
    });
  });
  const taken = new Set<string>();
  const broken: BrokenRef[] = [];
  refs.forEach((ref, slot) => {
    const refDir = ref.a && ref.b ? normalize(sub(ref.b, ref.a)) : null;
    const cands: RefCandidate[] = [];
    infos.forEach((list, bi) =>
      list.forEach(({ info, n, name }, index) => {
        let score = matchScore(info.mid, n, ref.mid, ref.n, diag);
        if (ref.type && ref.type !== info.type) score += diag * 0.3;
        if (refDir && info.type === "LINE") {
          const d = normalize(sub(info.b, info.a));
          score += (1 - Math.abs(dot(d, refDir))) * diag * 0.5;
        }
        cands.push({ body: bi, index, name, score });
      }),
    );
    const res = resolveNamed("edge", ref.name, cands, diag * 0.2 + 1e-3, taken);
    if ("broken" in res) {
      broken.push({ ...res.broken, slot });
      updated.push(ref);
      return;
    }
    const { body: bi, index } = res.ok;
    const b = infos[bi][index];
    taken.add(`${bi}:${index}`);
    if (!perBody.has(bi)) perBody.set(bi, []);
    perBody.get(bi)!.push(b.e);
    updated.push({ mid: b.info.mid, a: b.info.a, b: b.info.b, n: b.n, type: b.info.type, ...(b.name ? { name: b.name } : {}) });
  });
  if (broken.length) throw new RefBrokenError(broken);
  return { perBody, updated };
}

export function faceInfo(f: R.Face): FaceInfo {
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
    const names = namesOf(b)?.faces;
    return b.faces.map((f, i) => {
      const info = faceInfo(f);
      return { f, info, n: normInBox(info.center, box), name: names?.[i] };
    });
  });
  const broken: BrokenRef[] = [];
  refs.forEach((ref, slot) => {
    const cands: RefCandidate[] = [];
    infos.forEach((list, bi) =>
      list.forEach(({ info, n, name }, index) => {
        // a full cylinder's "normal at centre" is ill-defined: match those by position only
        const nTerm = ref.type === "CYLINDRE" && info.type === "CYLINDRE" ? 0 : (1 - dot(info.normal, ref.normal)) * diag;
        let score = matchScore(info.center, n, ref.center, ref.n, diag) + nTerm;
        if (ref.type && ref.type !== info.type) score += diag * 0.3;
        cands.push({ body: bi, index, name, score });
      }),
    );
    const res = resolveNamed("face", ref.name, cands, diag * 0.25 + 1e-3);
    if ("broken" in res) {
      broken.push({ ...res.broken, slot });
      updated.push(ref);
      return;
    }
    const { body: bi, index } = res.ok;
    const b = infos[bi][index];
    if (!perBody.has(bi)) perBody.set(bi, []);
    perBody.get(bi)!.push(b.f);
    updated.push({ center: b.info.center, normal: b.info.normal, n: b.n, type: b.info.type, ...(b.name ? { name: b.name } : {}) });
  });
  if (broken.length) throw new RefBrokenError(broken);
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

// ----------------------------------------------------- topology naming ---

/** Extra naming sources / hints produced by the feature being evaluated. */
let stepSources: NameSource[] = [];
let stepHints: NamingHints = {};

/** Plane of a sketch placed on a model face, following that face. */
function followFace(pf: PlaneFaceRef, st: State, entry: CacheEntry, old: PlaneDef): PlaneDef {
  const diag = modelDiag(st.bodies);
  const { updated } = resolveFaces(st.bodies, [pf.face], diag);
  const fr = updated[0];
  if (fr.type !== "PLANE") throw new Error("スケッチを配置した面が平面ではなくなりました");
  let n = normalize(fr.normal);
  if (dot(n, old.normal) < 0) n = scale(n, -1);
  const origin = add(old.origin, scale(n, dot(sub(fr.center, old.origin), n)));
  let x = sub(old.xDir, scale(n, dot(old.xDir, n)));
  if (Math.hypot(...x) < 1e-9) x = perp(n);
  const plane: PlaneDef = { origin, xDir: normalize(x), normal: n };
  entry.sketchRefs = { id: pf.sketch, faces: updated, plane };
  return plane;
}

function nameStep(f: RFeature, st: State, out: State) {
  const fresh = out.bodies.filter((b) => !namesOf(b));
  if (!fresh.length) return;
  const diag = modelDiag(out.bodies);
  const tool = out.tools.get(f.id)?.shape;
  const newTool = tool && tool !== st.tools.get(f.id)?.shape ? tool : undefined;
  if (newTool && !namesOf(newTool)) setNames(newTool, nameGenericTool(f.id, newTool));
  const sources: NameSource[] = [];
  for (const b of st.bodies) {
    const n = namesOf(b);
    if (n) sources.push({ shape: b, names: n, priority: 0 });
  }
  if (newTool) sources.push({ shape: newTool, names: namesOf(newTool)!, priority: 1 });
  sources.push(...stepSources);
  for (const b of fresh) setNames(b, nameFromSources(b, sources, f.id, diag, stepHints));
}

async function evalFeature(f: RFeature, st: State, entry: CacheEntry): Promise<State> {
  const pf = (f as { planeFace?: PlaneFaceRef }).planeFace;
  if (pf && "plane" in f && f.plane) f = { ...f, plane: followFace(pf, st, entry, f.plane as PlaneDef) } as RFeature;
  stepSources = [];
  stepHints = {};
  const out = await evalFeatureRaw(f, st, entry);
  try {
    nameStep(f, st, out);
  } catch {
    /* naming is best effort: references fall back to geometry */
  }
  return out;
}

async function evalFeatureRaw(f: RFeature, st: State, entry: CacheEntry): Promise<State> {
  if (isSurfaceRFeature(f)) {
    const res = evalSurface(f, {
      bodies: st.bodies,
      surfaces: st.surfaces ?? new Map(),
      diag: modelDiag([...st.bodies, ...(st.surfaces?.values() ?? [])]),
      applyOp,
      resolveEdges,
      regionTool: (plane, regions, from, to) => profileSolid({ ...plane, origin: add(plane.origin, scale(plane.normal, from)) }, regions, (sk) => sk.extrude(to - from)),
    });
    if (res.refs) entry.refs = res.refs;
    const tools = new Map(st.tools);
    if (res.tool) tools.set(f.id, res.tool);
    return { bodies: res.bodies, tools, threads: st.threads, surfaces: res.surfaces };
  }
  const out = await evalShape(f, st, entry);
  let threads = out.threads ?? st.threads ?? [];
  if (f.type === "hole" && f.thread) threads = [...threads, ...holeThreads(f, f.thread, out.bodies)];
  if (f.type === "pattern") {
    const src = new Set(f.sources);
    const base = threads.filter((t) => src.has(t.feature));
    threads = [...threads, ...f.transforms.flatMap((tr) => base.map((t) => transformThread(t, tr)))];
  }
  if (f.type === "move") threads = threads.map((t) => transformThread(t, f.transform));
  return { ...out, threads, surfaces: out.surfaces ?? st.surfaces };
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

let fontReady: Promise<unknown> | null = null;
/** Japanese-capable outline font (IPA P Gothic) for embossed text. */
function ensureFont() {
  fontReady ??= (async () => {
    const url = new URL("../assets/fonts/ipagp.ttf", import.meta.url);
    let buf: ArrayBuffer;
    try {
      buf = await (await fetch(url)).arrayBuffer();
    } catch {
      // node (tests): read the file directly
      const fsName = "node:fs", urlName = "node:url";
      const fs = await import(/* @vite-ignore */ fsName);
      const { fileURLToPath } = await import(/* @vite-ignore */ urlName);
      const b: Uint8Array = fs.readFileSync(fileURLToPath(url));
      buf = b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer;
    }
    return R.loadFont(buf, "ipa");
  })();
  return fontReady;
}

async function evalShape(f: Exclude<RFeature, { type: `surf${string}` }>, st: State, entry: CacheEntry): Promise<State> {
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
      setNames(tool, nameProfileTool(f.id, tool, start, f.regions, "extrude", diag));
      tools.set(f.id, { shape: tool, op: f.op });
      return { bodies: applyOp(bodies, tool, f.op), tools };
    }
    case "revolve": {
      const o = planePoint(f.plane, f.axisOrigin);
      const y = cross(f.plane.normal, f.plane.xDir);
      const axis = add(scale(f.plane.xDir, f.axisDir[0]), scale(y, f.axisDir[1]));
      const tool = profileSolid(f.plane, f.regions, (sk) => sk.revolve(axis, { origin: o, angle: f.angle }));
      setNames(tool, nameProfileTool(f.id, tool, f.plane, f.regions, "revolve", diag));
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
      setNames(tool, nameProfileTool(f.id, tool, f.plane, f.regions, "sweep", diag));
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
      stepHints = { blends: updated.filter((u) => u.name).map((u) => ({ edge: u.name!, faces: edgeFaces(u.name!) })) };
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
      stepHints = { offset: Math.abs(f.thickness) };
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
      setNames(tool, nameHoleTool(f.id, tool, f.plane, f.points, f.diameter));
      tools.set(f.id, { shape: tool, op: "cut" });
      return { bodies: applyOp(bodies, tool, "cut"), tools };
    }
    case "pattern": {
      let out = bodies;
      const surfIn = st.surfaces ?? new Map<string, Shape>();
      let surfaces: Map<string, Shape> | undefined;
      let n = 0;
      for (const src of f.sources) {
        const t = tools.get(src);
        if (t) {
          const tn = namesOf(t.shape);
          f.transforms.forEach((tr, k) => {
            const copy = transformShape(t.shape, tr);
            if (tn) stepSources.push({ shape: copy, names: copyNames(tn, `${f.id}.${k + 1}`), priority: 2 });
            out = applyOp(out, copy, t.op === "new" ? "join" : t.op);
          });
          continue;
        }
        // surface bodies: each copy becomes a new surface keyed "<pattern id>#<n>"
        // a pattern / mirror feature stands for all the surface copies it made
        const keys = surfIn.has(src) ? [src] : [...surfIn.keys()].filter((k) => k.startsWith(`${src}#`));
        if (!keys.length) throw new Error("パターン化できないフィーチャが含まれています (押し出し/回転/穴/プリミティブ/サーフェスのみ。サーフェスはトリム・ステッチなどで使用済みの可能性があります)");
        surfaces ??= new Map(surfIn);
        for (const k of keys) for (const tr of f.transforms) surfaces.set(`${f.id}#${++n}`, transformShape(surfIn.get(k)!, tr));
      }
      return { bodies: out, tools, surfaces };
    }
    case "primitive": {
      const tool = buildPrimitive(f);
      tools.set(f.id, { shape: tool, op: f.op });
      return { bodies: applyOp(bodies, tool, f.op), tools };
    }
    case "import": {
      // solids join the bodies; open shells left after repair become surface bodies
      const heal = f.heal !== false;
      const notes: string[] = [];
      let shapes: Shape[];
      let nativeIges: Awaited<ReturnType<typeof importIgesNative>> = null;
      if (f.format === "step") {
        const r = await importStepWithMeta(f.data, heal);
        shapes = r.shapes;
        r.shapes.forEach((s, i) => bodyMeta.set(s, r.meta[i]));
        if (r.products > 1) notes.push(`部品 ${r.products} 種類・${r.instances} 個 (名前と色を読み込み)`);
        if (r.heal) notes.push(healSummary(r.heal));
      } else if (f.format === "iges") {
        // the NURBS path rebuilds planes / cylinders / spheres as analytic surfaces (measurable);
        // anything it cannot read completely goes to IGESCAFControl_Reader in the extended kernel
        let model: ReturnType<typeof readIges> | null = null;
        let r: ReturnType<typeof igesToShapes> | null = null;
        try {
          model = readIges(f.data);
          r = igesToShapes(model, 0.01);
        } catch {
          r = null;
        }
        const complete = !!r && !!model && r.shapes.length > 0 && !r.failedFaces && !Object.keys(model.skipped).length;
        if (!complete && (nativeIges = await importIgesNative(f.data, heal))?.shapes.length) {
          shapes = nativeIges.shapes;
          nativeIges.shapes.forEach((s, i) => bodyMeta.set(s, nativeIges!.meta[i]));
          notes.push("IGES をカーネルの変換器で読み込みました");
          if (nativeIges.heal) notes.push(healSummary(nativeIges.heal));
        } else {
          if (!r || !model) throw new Error("IGES を読み込めませんでした");
          shapes = r.shapes;
          r.shapes.forEach((s, i) => bodyMeta.set(s, r!.meta[i]));
          if (r.failedFaces) notes.push(`作成できなかった面 ${r.failedFaces} 個`);
          const skipped = Object.entries(model.skipped).map(([t, n]) => `${t}×${n}`);
          if (skipped.length) notes.push(`未対応の要素を読み飛ばし (${skipped.join(", ")})`);
        }
        if (!shapes.length) throw new Error("IGES から形状を作成できませんでした");
      } else {
        // meshes: sewn into a solid by the STL importer (face-by-face repair would be too slow for big meshes)
        const shape = importStl(Uint8Array.from(atob(f.data), (c) => c.charCodeAt(0)));
        shapes = shape.solids?.length ? (shape.solids as Shape[]) : [shape];
      }
      const isSolid = (s: Shape) => (s as unknown as { wrapped: { ShapeType(): string } }).wrapped.ShapeType() === "TopAbs_SOLID" || !!(s as Shape).solids?.length;
      const solids = shapes.filter(isSolid);
      const open = shapes.filter((s) => !isSolid(s));
      if (notes.filter(Boolean).length) entry.notice = notes.filter(Boolean).join("。");
      if (!open.length) return { bodies: [...bodies, ...solids], tools };
      const surfaces = new Map(st.surfaces ?? []);
      open.forEach((s, i) => surfaces.set(`${f.id}#${i + 1}`, s));
      return { bodies: [...bodies, ...solids], tools, surfaces };
    }
    case "move": {
      const moved =
        f.solids === false
          ? bodies
          : bodies.map((b) => {
              const m = transformShape(b, f.transform);
              const n = namesOf(b);
              if (n) setNames(m, n);
              return m;
            });
      if (!f.surfaces?.length) return { bodies: moved, tools };
      // surfaces keep their key so later surface features still find them
      const surfaces = new Map(st.surfaces ?? []);
      for (const id of f.surfaces) {
        const sf = surfaces.get(id);
        if (!sf) throw new Error("移動するサーフェスが見つかりません (先のフィーチャで使用済みの可能性があります)");
        surfaces.set(id, transformShape(sf, f.transform));
      }
      return { bodies: moved, tools, surfaces };
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
    case "draft": {
      const all = resolveFaces(bodies, [...f.faces, f.neutral], diag);
      entry.refs = { faces: all.updated.slice(0, f.faces.length) };
      const nInfo = all.updated[f.faces.length];
      if (nInfo.type !== "PLANE") throw new Error("中立面には平面を選択してください");
      const dir = f.flip ? scale(nInfo.normal, -1) : nInfo.normal;
      const plane = new R.Plane(nInfo.center, perp(dir), dir);
      const { perBody } = resolveFaces(bodies, f.faces, diag);
      const out = bodies.map((b, i) => {
        const faces = perBody.get(i);
        if (!faces?.length) return b;
        return b.draft(f.angle, (fd) => fd.inList(faces), plane) as Shape;
      });
      return { bodies: out, tools };
    }
    case "split": {
      let o: Vec3, n: Vec3;
      if (f.face) {
        const { updated } = resolveFaces(bodies, [f.face], diag);
        entry.refs = { faces: updated };
        if (updated[0].type !== "PLANE") throw new Error("分割には平面を選択してください");
        (o = updated[0].center), (n = updated[0].normal);
      } else (o = f.plane!.origin), (n = normalize(f.plane!.normal));
      const big = diag * 4 + 100;
      // half space on the negative side of the plane
      const neg = R.drawRectangle(big * 2, big * 2)
        .sketchOnPlane(new R.Plane(o, perp(n), n))
        .extrude(-big) as Shape;
      const out: Shape[] = [];
      for (const b of bodies) {
        if (f.keep !== "negative") {
          const pos = b.cut(neg);
          if (!isEmpty(pos)) out.push(...solidsOf(pos));
        }
        if (f.keep !== "positive") {
          const ng = b.intersect(neg);
          if (!isEmpty(ng)) out.push(...solidsOf(ng));
        }
      }
      if (!out.length) throw new Error("分割後にボディが残りません");
      return { bodies: out, tools };
    }
    case "frame": {
      const joints = frameJoints(f.members);
      const loopDraw = (l: SecLoop): R.Drawing => {
        if ("r" in l) return R.drawCircle(l.r);
        let d = R.draw(l.pts[0]) as R.DrawingPen;
        for (const p of l.pts.slice(1)) d = d.lineTo(p);
        return d.close();
      };
      let section = loopDraw(f.outer);
      for (const h of f.holes) section = section.cut(loopDraw(h));
      const span = "r" in f.outer ? f.outer.r * 2 : Math.max(...f.outer.pts.map((p) => Math.hypot(p[0], p[1]))) * 2;
      const ext = span * 3;
      const rot = (f.rotate * Math.PI) / 180;
      const out = bodies.slice();
      f.members.forEach((m, i) => {
        const L = dist(m.a, m.b);
        if (L < 1e-6) return;
        const w = normalize(sub(m.b, m.a));
        let up = m.up;
        if (Math.abs(dot(up, w)) > 0.99) up = Math.abs(w[2]) < 0.9 ? [0, 0, 1] : [0, 1, 0];
        const y0 = normalize(sub(up, scale(w, dot(up, w))));
        const x0 = cross(y0, w);
        const x = add(scale(x0, Math.cos(rot)), scale(y0, Math.sin(rot)));
        const js = f.miter ? joints[i] : [];
        const e0 = js.some((j) => j.end === 0) ? ext : 0, e1 = js.some((j) => j.end === 1) ? ext : 0;
        let solid = section.clone().sketchOnPlane(new R.Plane(sub(m.a, scale(w, e0)), x, w)).extrude(L + e0 + e1) as Shape;
        for (const j of js) {
          const P = j.end ? m.b : m.a;
          const o = f.members[j.other];
          const d1 = normalize(sub(j.end ? m.a : m.b, P)), d2 = normalize(sub(j.otherEnd ? o.a : o.b, P));
          let n = sub(d1, d2);
          if (Math.hypot(...n) < 1e-9) continue;
          n = normalize(n);
          // remove the half-space behind the bisector plane
          const big = (L + ext) * 4;
          const px = Math.abs(n[2]) < 0.9 ? normalize(cross(n, [0, 0, 1])) : normalize(cross(n, [1, 0, 0]));
          const cutter = R.drawRectangle(big, big).sketchOnPlane(new R.Plane(P, px, scale(n, -1))).extrude(big) as Shape;
          solid = solid.cut(cutter);
        }
        out.push(solid);
      });
      if (out.length === bodies.length) throw new Error("フレーム部材を作成できませんでした");
      return { bodies: out, tools };
    }
    case "emboss": {
      if (!f.text.trim()) throw new Error("文字を入力してください");
      if (!(f.size > 0) || !(f.depth > 0)) throw new Error("文字の高さと深さは正の値にしてください");
      await ensureFont();
      const n = normalize(f.plane.normal);
      const yv = cross(n, f.plane.xDir);
      const a = (f.angle * Math.PI) / 180;
      const xr = add(scale(f.plane.xDir, Math.cos(a)), scale(yv, Math.sin(a)));
      // engrave: start inside the material; emboss: start on the face
      const origin = add(planePoint(f.plane, f.pos), scale(n, f.op === "cut" ? -f.depth : 0));
      const drawing = R.drawText(f.text, { startX: 0, startY: 0, fontSize: f.size, fontFamily: "ipa" });
      const tool = drawing.sketchOnPlane(new R.Plane(origin, xr, n)).extrude(f.depth) as Shape;
      tools.set(f.id, { shape: tool, op: f.op });
      return { bodies: applyOp(bodies, tool, f.op), tools };
    }
    case "coil": {
      if (!(f.pitch > 0) || !(f.turns > 0)) throw new Error("ピッチと回転数は正の値にしてください");
      if (!f.regions.length) throw new Error("プロファイルが選択されていません");
      const O = planePoint(f.plane, f.axisOrigin);
      const yv = cross(f.plane.normal, f.plane.xDir);
      const d = normalize(add(scale(f.plane.xDir, f.axisDir[0]), scale(yv, f.axisDir[1])));
      // helix through the profile centre, around the axis
      const outer = f.regions[0].outer;
      const pts2 = outer.flatMap((s) => (s.t === "circle" ? [s.c] : [s.a]));
      const c2: Vec2 = [pts2.reduce((s, p) => s + p[0], 0) / pts2.length, pts2.reduce((s, p) => s + p[1], 0) / pts2.length];
      const C = planePoint(f.plane, c2);
      const rel = sub(C, O);
      const along0 = dot(rel, d);
      const rv = sub(rel, scale(d, along0));
      const r = Math.hypot(...rv);
      if (r < 1e-6) throw new Error("プロファイルが軸上にあります (軸から離して配置してください)");
      const u = scale(rv, 1 / r), w = scale(cross(d, u), f.leftHand ? -1 : 1);
      const n = Math.max(24, Math.ceil(f.turns * 48));
      const total = 2 * Math.PI * f.turns;
      const helixPts: Vec3[] = [];
      for (let i = 0; i <= n; i++) {
        const t = (total * i) / n;
        helixPts.push(add(add(O, scale(d, along0 + (f.pitch * t) / (2 * Math.PI))), add(scale(u, r * Math.cos(t)), scale(w, r * Math.sin(t)))));
      }
      const spine = R.assembleWire([R.makeBSplineApproximation(helixPts, { tolerance: 1e-4, degMax: 5, smoothing: null } as never)]);
      const sweepLoop = (segs: LoopSeg[]) => {
        const sk = loopDrawing(segs).sketchOnPlane(toPlane(f.plane)) as R.Sketch;
        return R.genericSweep(sk.wire, spine, { frenet: true, transitionMode: "right" }, false);
      };
      const parts = f.regions.map((reg) => {
        let solid = sweepLoop(reg.outer);
        for (const hl of reg.holes) solid = solid.cut(sweepLoop(hl));
        return solid;
      });
      const tool = fuseAll(parts);
      tools.set(f.id, { shape: tool, op: f.op });
      return { bodies: applyOp(bodies, tool, f.op), tools };
    }
    case "weld": {
      const { perBody, updated } = resolveEdges(bodies, f.edges, diag);
      entry.refs = { edges: updated };
      const a = f.size;
      const beads: Shape[] = [];
      const inside = (p: Vec3) => {
        const v = R.makeVertex(p);
        return bodies.some((b) => R.measureDistanceBetween(b as never, v as never) < 1e-6);
      };
      for (const [bi, edges] of perBody) {
        const body = bodies[bi];
        for (const e of edges) {
          if (String(e.geomType) !== "LINE") throw new Error("溶接は直線エッジにのみ使用できます");
          const A = tuple(e.startPoint), B = tuple(e.endPoint);
          const L = dist(A, B);
          const w = normalize(sub(B, A));
          const mid = scale(add(A, B), 0.5);
          const mv = R.makeVertex(mid);
          const faces = body.faces.filter((fc) => R.measureDistanceBetween(fc as never, mv as never) < 1e-6).slice(0, 2);
          if (faces.length < 2) throw new Error("エッジに隣接する面が見つかりません");
          const [n1, n2] = faces.map((fc) => normalize(tuple(fc.normalAt(mid))));
          // a leg lies in a face plane (normal p), perpendicular to the edge, on the side of `hint`
          const along = (p: Vec3, hint: Vec3): Vec3 => {
            const d = normalize(cross(w, p));
            return dot(d, hint) >= 0 ? d : scale(d, -1);
          };
          // convex edge against another body: one leg along that body's surface (the contact plane of face j),
          // the other up face i; any corner angle, not only 90°
          const eps = Math.min(a * 0.05, 0.05);
          let legs: [Vec3, Vec3] | null = null;
          for (const [ni, nj] of [[n1, n2], [n2, n1]] as [Vec3, Vec3][]) {
            const onContact = along(nj, ni);
            if (inside(add(add(mid, scale(nj, eps)), scale(onContact, a / 2)))) {
              legs = [onContact, along(ni, scale(nj, -1))];
              break;
            }
          }
          // concave corner of one body: the bead fills the corner, legs along both faces
          if (!legs) legs = [along(n1, n2), along(n2, n1)];
          const pl = new R.Plane(A, legs[0], w);
          const yv = cross(w, legs[0]);
          const q: Vec2 = [dot(legs[1], legs[0]) * a, dot(legs[1], yv) * a];
          if (Math.abs(q[1]) < 1e-6) throw new Error("この角には溶接できません (面が平行です)");
          const tri = R.draw([0, 0]).lineTo([a, 0]).lineTo(q).close();
          beads.push(tri.sketchOnPlane(pl).extrude(L) as Shape);
        }
      }
      if (!beads.length) throw new Error("溶接するエッジを選択してください");
      const tool = fuseAll(beads);
      tools.set(f.id, { shape: tool, op: "new" });
      return { bodies: [...bodies, tool], tools };
    }
    case "rib": {
      if (!bodies.length) throw new Error("リブを付けるボディがありません");
      const n = normalize(f.plane.normal);
      const y = cross(n, f.plane.xDir);
      const w = (uv: Vec2): Vec3 => add(f.plane.origin, add(scale(f.plane.xDir, uv[0]), scale(y, uv[1])));
      const body = fuseAll(bodies.map((b) => b.clone()));
      const box = body.boundingBox.bounds as [Vec3, Vec3];
      const ctr = scale(add(box[0], box[1]), 0.5);
      const reach = diag * 2 + 10;
      const ribs: Shape[] = [];
      for (const [a2, b2] of f.segs) {
        const A = w(a2), B = w(b2);
        const along = normalize(sub(B, A));
        const mid = scale(add(A, B), 0.5);
        const len = dist(A, B);
        const pl = new R.Plane(add(A, scale(n, -f.thickness / 2)), along, n);
        const inPlane = normalize(cross(n, along));
        /** Part of the strip on one side of the line that is enclosed by material, or null. */
        const fill = (sign: number): Shape | null => {
          const prism = R.drawRectangle(len, reach)
            .translate(len / 2, (sign * reach) / 2)
            .sketchOnPlane(pl)
            .extrude(f.thickness) as Shape;
          const pieces = solidsOf(prism.cut(body));
          const probe = R.makeVertex(add(mid, scale(inPlane, sign * 1e-3)));
          let best: Shape | null = null, bd = Infinity;
          for (const p of pieces) {
            const d = R.measureDistanceBetween(p as never, probe as never);
            if (d < bd) (bd = d), (best = p);
          }
          if (!best || bd > 1e-2) return null;
          // reaching the end of the strip means no material was met
          const bb = best.boundingBox.bounds as [Vec3, Vec3];
          if (dist(bb[0], bb[1]) > reach * 0.9) return null;
          return best;
        };
        // default: the side facing the part's centre first; flip prefers the other side
        let first = dot(inPlane, sub(ctr, mid)) >= 0 ? 1 : -1;
        if (f.flip) first = -first;
        const piece = fill(first) ?? (f.flip ? null : fill(-first));
        if (!piece) throw new Error("リブがボディに当たりません (線の位置か方向を確認してください)");
        ribs.push(piece);
      }
      const tool = fuseAll(ribs);
      tools.set(f.id, { shape: tool, op: "join" });
      return { bodies: applyOp(bodies, tool, "join"), tools };
    }
    case "thicken": {
      const { perBody, updated } = resolveFaces(bodies, f.faces, diag);
      entry.refs = { faces: updated };
      const parts: Shape[] = [];
      for (const faces of perBody.values())
        for (const face of faces) {
          if (String(face.geomType) !== "PLANE") throw new Error("厚み付けは平面にのみ使用できます");
          const nn = normalize(tuple(face.normalAt(face.center)));
          parts.push(R.basicFaceExtrusion(face, new R.Vector(scale(nn, f.flip ? -f.distance : f.distance))) as unknown as Shape);
        }
      const tool = fuseAll(parts);
      tools.set(f.id, { shape: tool, op: f.op });
      return { bodies: applyOp(bodies, tool, f.op), tools };
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

/** Kernel objects a cached state keeps alive (bodies, feature tools, surfaces). */
function stateShapes(e: CacheEntry): Shape[] {
  const st = e.state;
  const out: Shape[] = [...st.bodies];
  for (const t of st.tools.values()) out.push(t.shape);
  if (st.surfaces) out.push(...st.surfaces.values());
  return out;
}

/** Display meshes by shape, model size and quality (a cached state shown again needs no tessellation). */
const MESHES = new WeakMap<Shape, Map<string, BodyMesh>>();

function cloneMesh(m: BodyMesh): BodyMesh {
  return {
    ...m,
    positions: m.positions.slice(),
    normals: m.normals.slice(),
    indices: m.indices.slice(),
    faceRanges: m.faceRanges.slice(),
    edgePositions: m.edgePositions.slice(),
    edgeRanges: m.edgeRanges.slice(),
  };
}

/** meshBody with a per-shape cache; the result is a fresh copy (its buffers get transferred). */
function meshCached(b: Shape, name: string, diag: number, quality: TessQuality = "normal"): BodyMesh {
  let c = MESHES.get(b);
  const key = `${diag}|${quality}|${MESH_CACHE_VERSION}`;
  const hit = c?.get(key);
  if (hit) return { ...cloneMesh(hit), name };
  const m = meshBody(b, name, diag, quality);
  if (!c) MESHES.set(b, (c = new Map()));
  // meshes of another model size are stale
  for (const k of c.keys()) if (!k.startsWith(diag + "|")) c.delete(k);
  c.set(key, cloneMesh(m));
  return m;
}

/** Approximate bytes of the cached display meshes of a shape. */
function meshBytes(b: Shape): number {
  let n = 0;
  for (const m of MESHES.get(b)?.values() ?? []) n += m.positions.byteLength + m.normals.byteLength + m.indices.byteLength + m.edgePositions.byteLength + m.faceRanges.byteLength + m.edgeRanges.byteLength + 200 * (m.faces.length + m.edges.length);
  return n;
}

const SHAPE_BYTES = new WeakMap<Shape, number>();

/**
 * Estimated memory of a kernel shape: B-rep topology and geometry (faces with
 * their surfaces and p-curves, edges with curves, vertices) plus its cached
 * display meshes. Counted once per shape (topology counting is cached).
 */
export function shapeBytes(b: Shape): number {
  let t = SHAPE_BYTES.get(b);
  if (t === undefined) {
    let f = 0, e = 0;
    try {
      f = b.faces.length;
      e = b.edges.length;
    } catch {
      /* deleted or empty shape */
    }
    t = 2048 + f * 3072 + e * 1024 + Math.round(e * 0.7) * 160;
    SHAPE_BYTES.set(b, t);
  }
  return t + meshBytes(b);
}

/** Statistics of the last rebuild (see RebuildResult.stats). */
export interface RebuildStats {
  features: number;
  /** Features taken from the cache / evaluated. */
  reused: number;
  recomputed: number;
  /** Index of the first evaluated feature (= features when nothing was). */
  first: number;
  cache: CacheStats;
}

export class GeometryEngine {
  /** Debug / verify mode: every incremental rebuild is compared with a full one (throws on mismatch). */
  static verify = false;
  /** Unpinned cached states kept per engine (older versions of the model: undo, redo, suppress …). */
  static maxExtraStates = 160;

  /** Memory budget of the incremental cache (bytes, estimated); derived from the available memory. */
  static maxCacheBytes = defaultCacheBudget();

  private cache = new StateCache<CacheEntry, Shape>(
    stateShapes,
    (s) => {
      MESHES.delete(s);
      s.delete();
    },
    GeometryEngine.maxExtraStates,
    shapeBytes,
    GeometryEngine.maxCacheBytes,
  );
  bodies: Shape[] = [];
  threads: ThreadInfo[] = [];
  /** Surface bodies (open shells) after the last rebuild, in display order. */
  surfaces: { id: string; shape: Shape }[] = [];
  lastStats: RebuildStats | null = null;

  /** Free every cached kernel shape (engine dropped). */
  dispose() {
    this.cache.clear();
    this.bodies = [];
    this.surfaces = [];
  }

  /** Clear the incremental cache: the next rebuild evaluates every feature. */
  resetCache() {
    this.cache.pin([]);
    this.cache.trim(0);
  }

  /** Display meshes of the current bodies and surface bodies at a quality level. */
  private meshes(diag: number, quality: TessQuality) {
    const bodies = this.bodies.map((b, i) => ({ ...meshCached(b, bodyMeta.get(b)?.name ?? `ソリッド${i + 1}`, diag, quality), color: bodyMeta.get(b)?.color }));
    const surfaces = this.surfaces.map((s, i) => ({ ...meshCached(s.shape, bodyMeta.get(s.shape)?.name ?? `サーフェス${i + 1}`, diag, quality), surface: s.id, color: bodyMeta.get(s.shape)?.color }));
    return { bodies, surfaces };
  }

  /**
   * Display meshes of the current model at another level (progressive
   * refinement after a coarse first display, or view-dependent refinement).
   * Face / edge indices are the same as the rebuild's.
   */
  remesh(quality: TessQuality): { bodies: BodyMesh[]; surfaces: BodyMesh[] } {
    const diag = modelDiag([...this.bodies, ...this.surfaces.map((s) => s.shape)]);
    const r = this.meshes(diag, quality);
    this.cache.trim(GeometryEngine.maxExtraStates);
    return r;
  }

  async rebuild(features: RFeature[], captureBefore?: string, opts: { quality?: TessQuality; progressive?: boolean } = {}): Promise<RebuildResult> {
    const t0 = performance.now();
    const keys = prefixKeys(features);
    const start = resumeIndex(keys, (k) => this.cache.has(k));
    let state: State = { bodies: [], tools: new Map(), threads: [] };
    const errors: Record<string, string> = {};
    const notices: Record<string, string> = {};
    const updatedRefs: RebuildResult["updatedRefs"] = {};
    const brokenRefs: Record<string, BrokenRef[]> = {};
    let before: Shape[] | null = null;
    let beforeSurf: [string, Shape][] = [];
    for (let i = 0; i < features.length; i++) {
      const f = features[i];
      if (f.id === captureBefore) (before = state.bodies), (beforeSurf = [...(state.surfaces?.entries() ?? [])]);
      const key = keys[i];
      let entry: CacheEntry | undefined = i < start ? this.cache.get(key, i) : undefined;
      if (!entry) {
        entry = { key, state };
        try {
          entry.state = await evalFeature(f, state, entry);
        } catch (e) {
          if (e instanceof RefBrokenError) entry.broken = e.broken;
          // surface stitching that could not close keeps its sewn surface
          const partial = (e as { partial?: { bodies: Shape[]; surfaces: Map<string, Shape> } })?.partial;
          entry.state = partial ? { ...state, bodies: partial.bodies, surfaces: partial.surfaces } : state;
          entry.error = errorMessage(e);
        }
        this.cache.set(key, entry, i);
      }
      state = entry.state;
      if (entry.error) errors[f.id] = entry.error;
      if (entry.notice) notices[f.id] = entry.notice;
      if (entry.refs) updatedRefs[f.id] = entry.refs;
      if (entry.sketchRefs) updatedRefs[entry.sketchRefs.id] = { faces: entry.sketchRefs.faces, plane: entry.sketchRefs.plane };
      if (entry.broken) brokenRefs[f.id] = entry.broken;
    }
    this.cache.pin(keys);
    this.bodies = state.bodies;
    this.threads = state.threads ?? [];
    this.surfaces = [...(state.surfaces ?? new Map()).entries()].map(([id, shape]) => ({ id, shape }));
    // `before` shapes belong to pinned states; trimming never frees them
    const diag = modelDiag([...this.bodies, ...this.surfaces.map((s) => s.shape)]);
    // progressive display: large models are shown coarse first, refined by remesh()
    const fresh = [...this.bodies, ...this.surfaces.map((s) => s.shape)].filter((b) => !MESHES.get(b)?.has(`${diag}|${opts.quality ?? "normal"}|${MESH_CACHE_VERSION}`));
    let quality: TessQuality = opts.quality ?? "normal";
    if (!opts.quality && opts.progressive && fresh.length) {
      let faces = 0;
      for (const b of fresh) faces += b.faces.length;
      if (faces >= PROGRESSIVE_FACES) quality = "coarse";
    }
    const stats: RebuildStats = { features: features.length, reused: start, recomputed: features.length - start, first: start, cache: { ...this.cache.stats } };
    this.lastStats = stats;
    const { bodies, surfaces } = this.meshes(diag, quality);
    // meshes count towards the memory budget: trim after meshing
    this.cache.trim(GeometryEngine.maxExtraStates);
    stats.cache = { ...this.cache.stats };
    // picking while editing: solids, then surfaces (same order as the display)
    const beforeMeshes = before
      ? [...before.map((b, i) => meshCached(b, `ソリッド${i + 1}`, diag)), ...beforeSurf.map(([id, b], i) => ({ ...meshCached(b, `サーフェス${i + 1}`, diag), surface: id }))]
      : undefined;
    const res: RebuildResult = { bodies, surfaces, before: beforeMeshes, errors, notices, updatedRefs, brokenRefs, timeMs: performance.now() - t0, threads: this.threads, stats, ...(quality !== (opts.quality ?? "normal") ? { refine: true } : {}) };
    if (GeometryEngine.verify && start > 0) await verifyAgainstFull(this, features, res);
    return res;
  }

  /** Bodies and surface bodies (open shells) with names and colours from the import or the part. */
  private exportItems(name: string, color?: string) {
    return [
      ...this.bodies.map((shape, i) => ({ shape, name: bodyMeta.get(shape)?.name ?? (this.bodies.length > 1 ? `${name}_${i + 1}` : name), color: bodyMeta.get(shape)?.color ?? color })),
      ...this.surfaces.map((s, i) => ({ shape: s.shape, name: bodyMeta.get(s.shape)?.name ?? `${name}_surface${i + 1}`, color: bodyMeta.get(s.shape)?.color ?? color })),
    ];
  }

  /** exportFile preferring the extended kernel (IGES through IGESCAFControl_Writer). */
  async exportFileAsync(format: "step" | "stl" | "brep" | "iges", name: string, color?: string): Promise<Blob> {
    if (format === "iges" && (this.bodies.length || this.surfaces.length)) {
      const text = await exportIgesNative(this.exportItems(name, color));
      if (text) return new Blob([text], { type: "model/iges" });
    }
    return this.exportFile(format, name, color);
  }

  exportFile(format: "step" | "stl" | "brep" | "iges", name: string, color?: string): Blob {
    if (!this.bodies.length && !((format === "step" || format === "iges") && this.surfaces.length))
      throw new Error(this.surfaces.length ? "サーフェスには体積がないため STL / BREP に書き出せません。ステッチまたは厚み付けでソリッドにしてください (STEP ならサーフェスも書き出せます)" : "エクスポートするボディがありません");
    if (format === "brep") {
      // OpenCascade native B-rep (FreeCAD, Salome, CAD Exchanger, OCCT tools)
      const oc = R.getOC() as unknown as { BRepTools: { Write(s: unknown, f: string, p: unknown): boolean }; Message_ProgressRange: new () => unknown; FS: { readFile(f: string): Uint8Array; unlink(f: string): void } };
      const shape = this.bodies.length === 1 ? this.bodies[0] : (R.makeCompound(this.bodies) as unknown as Shape);
      const file = `/tmp/export_${Date.now()}.brep`;
      if (!oc.BRepTools.Write((shape as unknown as { wrapped: unknown }).wrapped, file, new oc.Message_ProgressRange())) throw new Error("BREP の書き出しに失敗しました");
      const data = oc.FS.readFile(file);
      oc.FS.unlink(file);
      return new Blob([data as BlobPart], { type: "application/octet-stream" });
    }
    if (format === "step" || format === "iges") {
      const items = this.exportItems(name, color);
      if (format === "iges") return new Blob([writeIges(shapesToIges(items), `${name}.igs`)], { type: "model/iges" });
      return exportStepXcaf(items.map((x) => ({ name: x.name, color: x.color, shapes: [x.shape] })), null, name);
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
      // adaptive Gauss-Kronrod integration: exact on rational B-spline faces (the default rule is off by up to 0.2 %)
      const vp = preciseProps(b);
      const v = vp.volume;
      com = add(com, scale(vp.centerOfMass, v));
      volume += v;
      area += vp.area;
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
    const b = [...this.bodies, ...this.surfaces.map((s) => s.shape)][p.body];
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

/**
 * Adaptive polyline of a free-form 2D curve (ellipse, B-spline): split until the
 * chord deviates less than `tol` mm from the curve (drawings stay smooth when zoomed).
 */
export function sampleCurve(at: (t: number) => P2, t0: number, t1: number, tol = 0.01, maxPts = 600): P2[] {
  const out: P2[] = [];
  const pt = (t: number): P2 => {
    const v = at(t);
    return [v[0], v[1]];
  };
  const dev = (a: P2, b: P2, m: P2) => {
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy);
    return l < 1e-12 ? Math.hypot(m[0] - a[0], m[1] - a[1]) : Math.abs((m[0] - a[0]) * dy - (m[1] - a[1]) * dx) / l;
  };
  const rec = (ta: number, a: P2, tb: number, b: P2, depth: number) => {
    const tm = (ta + tb) / 2, m = pt(tm);
    // also probe the quarter points so an S-shaped span is not taken for straight
    const q1 = pt((ta + tm) / 2), q3 = pt((tm + tb) / 2);
    if (depth < 12 && out.length < maxPts && Math.max(dev(a, b, m), dev(a, b, q1), dev(a, b, q3)) > tol) {
      rec(ta, a, tm, m, depth + 1);
      rec(tm, m, tb, b, depth + 1);
    } else out.push(b);
  };
  // start from 8 spans so closed curves (first = last point) are handled
  const n = 8;
  let ta = t0, a = pt(t0);
  out.push(a);
  for (let i = 1; i <= n; i++) {
    const tb = t0 + ((t1 - t0) * i) / n, b = pt(tb);
    rec(ta, a, tb, b, 0);
    ta = tb;
    a = b;
  }
  return out;
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
      out.push({ t: "poly", pts: sampleCurve((t) => c.value(t) as P2, t0, t1), tag });
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
    // stepped section: remove the material in front of each plane segment
    const steps = v.section.steps?.length && v.section.along ? [...v.section.steps].sort((a, b) => a.at - b.at) : null;
    const offsets = [0, ...(steps ?? []).map((s) => s.offset)];
    let stepTool: Shape | null = null;
    if (steps) {
      const along = normalize(v.section.along!);
      const big = 1e5;
      const bounds = [-big, ...steps.map((s) => s.at), big];
      const boxes: Shape[] = [];
      for (let k = 0; k < offsets.length; k++) {
        const lo = bounds[k], hi = bounds[k + 1];
        if (hi - lo < 1e-9) continue;
        const o = add(add(v.section.origin, scale(along, (lo + hi) / 2)), scale(n, offsets[k]));
        boxes.push(R.drawRectangle(hi - lo, 2 * big).sketchOnPlane(new R.Plane(o, along, n)).extrude(big) as Shape);
      }
      stepTool = fuseAll(boxes);
    }
    for (const it of items) {
      const cut = stepTool ? it.shape.cut(stepTool) : it.shape.cutPlane(plane, 0, "negative");
      if (!cut || isEmpty(cut as Shape)) continue;
      shapes.push({ shape: cut as Shape, tag: it.tag });
      for (const f of (cut as Shape).faces) {
        if (String(f.geomType) !== "PLANE") continue;
        const fn = normalize(tuple(f.normalAt(f.center)));
        const dn = dot(sub(tuple(f.center), v.section.origin), n);
        if (dot(fn, n) < 0.999 || !offsets.some((o) => Math.abs(dn - o) < 1e-5)) continue;
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
  if (v.breakout && v.breakout.pts.length >= 3 && v.breakout.depth > 0 && !v.section) {
    // front of the model along the viewing direction, then a prism to the given depth
    let front = -Infinity;
    for (const it of items) {
      const bb = it.shape.boundingBox.bounds as [Vec3, Vec3];
      for (let k = 0; k < 8; k++) front = Math.max(front, dot([bb[k & 1][0], bb[(k >> 1) & 1][1], bb[(k >> 2) & 1][2]], dir));
    }
    const cutAt = front - v.breakout.depth;
    const base = v.breakout.pts.map((p) => add(sub(p, scale(dir, dot(p, dir))), scale(dir, cutAt)));
    const pl = new R.Plane(base[0], xAxis, dir);
    const loc = base.map((p): [number, number] => [dot(sub(p, base[0]), xAxis), dot(sub(p, base[0]), yAxis)]);
    let pen = R.draw(loc[0]) as R.DrawingPen;
    for (const q of loc.slice(1)) pen = pen.lineTo(q);
    const tool = pen.close().sketchOnPlane(pl).extrude(v.breakout.depth + 1e3) as Shape;
    shapes = [];
    for (const it of items) {
      const cut = it.shape.cut(tool);
      if (isEmpty(cut)) continue;
      shapes.push({ shape: cut, tag: it.tag });
      for (const f of cut.faces) {
        if (String(f.geomType) !== "PLANE") continue;
        const fn = normalize(tuple(f.normalAt(f.center)));
        if (dot(fn, dir) < 0.999 || Math.abs(dot(tuple(f.center), dir) - cutAt) > 1e-5) continue;
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
          const inner = f.clone().innerWires();
          hatch.push([ring(f.clone().outerWire()), ...inner.map(ring)]);
        } catch {
          /* skip */
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
        const p = s.t === "line" ? [(s.a[0] + s.b[0]) / 2, (s.a[1] + s.b[1]) / 2] : s.t === "poly" ? s.pts[s.pts.length >> 1] : s.c;
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

export function exportPlaced(shapes: { shape: Shape; name: string; color?: string }[], format: "step" | "stl" | "iges"): Blob {
  if (!shapes.length) throw new Error("エクスポートするボディがありません");
  if (format === "step") return R.exportSTEP(shapes.map((x) => ({ shape: x.shape, name: x.name })), { unit: "MM" } as never);
  if (format === "iges") return new Blob([writeIges(shapesToIges(shapes))], { type: "model/iges" });
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

/** Bounding-box diagonal of one shape. */
function shapeDiag(b: Shape): number {
  try {
    const [a, c] = b.boundingBox.bounds as [Vec3, Vec3];
    return dist(a, c);
  } catch {
    return 100;
  }
}

/** Removes a shape's stored triangulation so it can be meshed again at another (coarser) level. */
function cleanTriangulation(b: Shape) {
  try {
    const O = R.getOC() as any;
    O.BRepTools.Clean(b.wrapped, true);
  } catch {
    /* binding without Clean(S, force) */
  }
}

/**
 * Display mesh of a body. `diag` is the model size; the deflections follow
 * the tessellation policy (tessellation.ts) at `quality`, or explicit `params`.
 */
export function meshBody(b: Shape, name: string, diag: number, quality: TessQuality = "normal", params?: TessParams): BodyMesh {
  const p = params ?? tessParams(diag, shapeDiag(b), quality);
  const tol = p.linear;
  // a stored finer triangulation would be reused as is: drop it first
  cleanTriangulation(b);
  const m = b.mesh({ tolerance: tol, angularTolerance: p.angular });
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
  const em = b.meshEdges({ tolerance: tol, angularTolerance: p.angular });
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
    tess: { quality: p.quality, tolerance: p.tolerance, linear: p.linear, angular: p.angular, version: MESH_CACHE_VERSION },
    ...(namesOf(b) ? { faceNames: namesOf(b)!.faces, edgeNames: namesOf(b)!.edges } : {}),
  };
}
