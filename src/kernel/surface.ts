// Surface modelling (サーフェス モデリング) on top of OpenCascade.
// Surface features build open shells ("surface bodies") that live next to
// the solids in the rebuild state, keyed by the id of the feature that made
// them. Later surface features (trim, stitch, offset, thicken) consume them.

import * as R from "replicad";
import type { BoolOp, EdgeRef, PlaneDef, Vec3 } from "../core/types";
import type { RRegion } from "./protocol";

type Shape = R.Shape3D;

/** A 3D curve of a surface profile / boundary (world coordinates). */
export type SCurve = { t: "line"; a: Vec3; b: Vec3 } | { t: "arc"; a: Vec3; m: Vec3; b: Vec3 } | { t: "circle"; c: Vec3; n: Vec3; r: number };
/** A connected chain of curves (open or closed). */
export type SWire = SCurve[];

export type SurfTrimRTool = { kind: "plane"; plane: PlaneDef } | { kind: "profile"; plane: PlaneDef; regions: RRegion[] } | { kind: "surface"; id: string };

/** Kernel input of the surface features (fully resolved). */
export type SurfaceRFeature =
  | { id: string; type: "surfExtrude"; wires: SWire[]; dir: Vec3; from: number; to: number }
  | { id: string; type: "surfRevolve"; wires: SWire[]; origin: Vec3; axis: Vec3; angle: number }
  | { id: string; type: "surfLoft"; sections: SWire[]; ruled: boolean }
  | { id: string; type: "surfPatch"; wire?: SWire; edges?: EdgeRef[] }
  | { id: string; type: "surfTrim"; surface: string; tool: SurfTrimRTool; flip: boolean }
  | { id: string; type: "surfStitch"; surfaces: string[]; tolerance: number; solid: boolean; op: BoolOp }
  | { id: string; type: "surfOffset"; surface: string; distance: number }
  | { id: string; type: "surfThicken"; surface: string; distance: number; op: BoolOp };

export const SURFACE_RTYPES = new Set(["surfExtrude", "surfRevolve", "surfLoft", "surfPatch", "surfTrim", "surfStitch", "surfOffset", "surfThicken"]);

export function isSurfaceRFeature(f: { type: string }): f is SurfaceRFeature {
  return SURFACE_RTYPES.has(f.type);
}

/** Helpers the geometry engine lends (avoids an import cycle). */
export interface SurfaceCtx {
  bodies: Shape[];
  surfaces: Map<string, Shape>;
  diag: number;
  applyOp(bodies: Shape[], tool: Shape, op: string): Shape[];
  resolveEdges(shapes: Shape[], refs: EdgeRef[], diag: number): { perBody: Map<number, R.Edge[]>; updated: EdgeRef[] };
  regionTool(plane: PlaneDef, regions: RRegion[], from: number, to: number): Shape;
}

export interface SurfaceOut {
  bodies: Shape[];
  surfaces: Map<string, Shape>;
  /** Solid tool for patterns (thicken / stitched solid). */
  tool?: { shape: Shape; op: string };
  refs?: { edges?: EdgeRef[] };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const oc = () => R.getOC() as any;
const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const scale = (a: Vec3, s: number): Vec3 => [a[0] * s, a[1] * s, a[2] * s];
const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const normalize = (a: Vec3): Vec3 => {
  const l = Math.hypot(...a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
const perp = (n: Vec3): Vec3 => normalize(cross(cross(n, Math.abs(n[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0]), n));

function edgeOf(c: SCurve): R.Edge {
  if (c.t === "line") return R.makeLine(c.a, c.b);
  if (c.t === "arc") return R.makeThreePointArc(c.a, c.m, c.b);
  return R.makeCircle(c.r, c.c, c.n);
}

export function wireOf(w: SWire): R.Wire {
  if (!w.length) throw new Error("曲線がありません");
  return R.assembleWire(w.map(edgeOf));
}

function cast(s: unknown): Shape {
  return R.cast(s as never) as unknown as Shape;
}

function compound(shapes: Shape[]): Shape {
  if (!shapes.length) throw new Error("サーフェスを作成できませんでした");
  return shapes.length === 1 ? shapes[0] : (R.makeCompound(shapes) as unknown as Shape);
}

function isEmpty(s: Shape | null | undefined): boolean {
  if (!s || s.isNull) return true;
  try {
    return s.faces.length === 0;
  } catch {
    return true;
  }
}

/** Sample points along a chain (for planarity checks). */
function samplePoints(edges: R.Edge[]): Vec3[] {
  const pts: Vec3[] = [];
  for (const e of edges) for (const u of [0, 0.25, 0.5, 0.75]) pts.push(e.pointAt(u).toTuple() as Vec3);
  return pts;
}

/** Plane through the points (Newell normal) when they are coplanar, else null. */
function fitPlane(pts: Vec3[], tol: number): { o: Vec3; n: Vec3 } | null {
  let n: Vec3 = [0, 0, 0];
  const c = scale(pts.reduce((s, p) => add(s, p), [0, 0, 0] as Vec3), 1 / pts.length);
  for (let i = 0; i < pts.length; i++) {
    const a = sub(pts[i], c), b = sub(pts[(i + 1) % pts.length], c);
    n = add(n, cross(a, b));
  }
  if (Math.hypot(...n) < 1e-12) return null;
  n = normalize(n);
  return pts.every((p) => Math.abs(dot(sub(p, c), n)) < tol) ? { o: c, n } : null;
}

/** Fills a closed boundary: an exact planar face when the loop is flat, otherwise an N-sided filling (BRepOffsetAPI_MakeFilling). */
export function fillBoundary(edges: R.Edge[], diag: number): Shape {
  if (!edges.length) throw new Error("境界のエッジがありません");
  const flat = fitPlane(samplePoints(edges), Math.max(1e-6, diag * 1e-7));
  if (flat) {
    try {
      const w = R.assembleWire(edges.map((e) => e.clone()));
      const mf = new (oc().BRepBuilderAPI_MakeFace)(w.wrapped, true);
      if (mf.IsDone()) {
        const fixer = new (oc().ShapeFix_Face)(mf.Face());
        fixer.FixOrientation();
        return cast(fixer.Face());
      }
    } catch {
      /* fall back to filling */
    }
  }
  const O = oc();
  const fill = new O.BRepOffsetAPI_MakeFilling(3, 15, 2, false, 1e-5, 1e-4, 0.01, 0.1, 8, 9);
  for (const e of edges) fill.Add(e.wrapped, O.GeomAbs_Shape.GeomAbs_C0, true);
  fill.Build(new O.Message_ProgressRange());
  if (!fill.IsDone()) throw new Error("境界を埋めるパッチを作成できませんでした (閉じたループを選択してください)");
  const s = cast(fill.Shape());
  if (isEmpty(s)) throw new Error("パッチを作成できませんでした");
  return s;
}

function sewShapes(shapes: Shape[], tol: number): { shape: unknown; free: number } {
  const O = oc();
  const sew = new O.BRepBuilderAPI_Sewing(tol, true, true, true, false);
  for (const s of shapes) sew.Add(s.wrapped);
  sew.Perform(new O.Message_ProgressRange());
  return { shape: sew.SewedShape(), free: sew.NbFreeEdges() };
}

function takeSurface(surfaces: Map<string, Shape>, id: string, what = "サーフェス"): Shape {
  const s = surfaces.get(id);
  if (!s) throw new Error(`${what}が見つかりません (先のフィーチャで使用済みか、エラーです)`);
  return s;
}

/** Side of `p` relative to a (possibly curved) tool surface: +1 along its normal, -1 against. */
function sideOf(tool: Shape, p: Vec3): number {
  const O = oc();
  const v = R.makeVertex(p);
  let best: { d: number; q: Vec3; face: R.Face } | null = null;
  for (const face of tool.faces) {
    const ds = new O.BRepExtrema_DistShapeShape(v.wrapped, face.wrapped);
    if (!ds.IsDone() || ds.NbSolution() < 1) continue;
    const d = ds.Value();
    if (!best || d < best.d) {
      const q = ds.PointOnShape2(1);
      best = { d, q: [q.X(), q.Y(), q.Z()], face };
    }
  }
  if (!best) return 0;
  const n = best.face.normalAt(best.q).toTuple() as Vec3;
  return Math.sign(dot(sub(p, best.q), n));
}

function faceCenter(f: R.Face): Vec3 {
  return f.center.toTuple() as Vec3;
}

export function evalSurface(f: SurfaceRFeature, ctx: SurfaceCtx): SurfaceOut {
  const surfaces = new Map(ctx.surfaces);
  const bodies = ctx.bodies;
  const O = oc();
  switch (f.type) {
    case "surfExtrude": {
      if (!f.wires.length) throw new Error("スケッチに曲線がありません");
      const d = normalize(f.dir);
      const len = f.to - f.from;
      if (!(Math.abs(len) > 1e-9)) throw new Error("距離は 0 より大きくしてください");
      const parts = f.wires.map((w) => {
        let wire = wireOf(w);
        if (Math.abs(f.from) > 1e-12) wire = wire.translate(scale(d, f.from)) as R.Wire;
        const v = scale(d, len);
        const mk = new O.BRepPrimAPI_MakePrism(wire.wrapped, new O.gp_Vec(v[0], v[1], v[2]), true, true);
        return cast(mk.Shape());
      });
      surfaces.set(f.id, compound(parts));
      return { bodies, surfaces };
    }
    case "surfRevolve": {
      if (!f.wires.length) throw new Error("スケッチに曲線がありません");
      if (!(Math.abs(f.angle) > 1e-9)) throw new Error("角度は 0 以外にしてください");
      const a = normalize(f.axis);
      const parts = f.wires.map((w) => {
        const ax = new O.gp_Ax1(new O.gp_Pnt(f.origin[0], f.origin[1], f.origin[2]), new O.gp_Dir(a[0], a[1], a[2]));
        const mk = new O.BRepPrimAPI_MakeRevol(wireOf(w).wrapped, ax, (f.angle * Math.PI) / 180, true);
        return cast(mk.Shape());
      });
      surfaces.set(f.id, compound(parts));
      return { bodies, surfaces };
    }
    case "surfLoft": {
      if (f.sections.length < 2) throw new Error("ロフトには 2 つ以上の断面が必要です");
      const wires = f.sections.map(wireOf);
      surfaces.set(f.id, R.loft(wires, { ruled: f.ruled }, true) as Shape);
      return { bodies, surfaces };
    }
    case "surfPatch": {
      let edges: R.Edge[];
      let refs: { edges?: EdgeRef[] } | undefined;
      if (f.wire) edges = f.wire.map(edgeOf);
      else {
        if (!f.edges?.length) throw new Error("境界のエッジを選択してください");
        const all = [...bodies, ...surfaces.values()];
        const { perBody, updated } = ctx.resolveEdges(all, f.edges, ctx.diag);
        refs = { edges: updated };
        edges = [...perBody.values()].flat();
      }
      surfaces.set(f.id, fillBoundary(edges, ctx.diag));
      return { bodies, surfaces, refs };
    }
    case "surfTrim": {
      const target = takeSurface(surfaces, f.surface, "トリムするサーフェス");
      const big = ctx.diag * 4 + 100;
      let out: Shape;
      if (f.tool.kind === "plane") {
        const n = normalize(f.tool.plane.normal), o = f.tool.plane.origin;
        const neg = R.drawRectangle(big * 2, big * 2).sketchOnPlane(new R.Plane(o, perp(n), n)).extrude(-big) as Shape;
        out = f.flip ? target.intersect(neg) : target.cut(neg);
      } else if (f.tool.kind === "profile") {
        const prism = ctx.regionTool(f.tool.plane, f.tool.regions, -big, big);
        out = f.flip ? target.cut(prism) : target.intersect(prism);
      } else {
        if (f.tool.id === f.surface) throw new Error("トリム ツールに同じサーフェスは使えません");
        const tool = takeSurface(surfaces, f.tool.id, "ツールのサーフェス");
        const sp = new O.BRepAlgoAPI_Splitter();
        const args = new O.NCollection_List_TopoDS_Shape();
        args.Append(target.wrapped);
        const tools = new O.NCollection_List_TopoDS_Shape();
        tools.Append(tool.wrapped);
        sp.SetArguments(args);
        sp.SetTools(tools);
        sp.Build(new O.Message_ProgressRange());
        if (sp.HasErrors?.()) throw new Error("サーフェスで分割できませんでした");
        const pieces = cast(sp.Shape()).faces;
        const want = f.flip ? -1 : 1;
        const kept = pieces.filter((pf) => sideOf(tool, faceCenter(pf)) === want);
        if (kept.length === pieces.length) throw new Error("ツールのサーフェスがトリム対象と交差していません");
        out = kept.length ? (kept.length === 1 ? (kept[0] as unknown as Shape) : cast(sewShapes(kept as unknown as Shape[], 1e-6).shape)) : (null as unknown as Shape);
      }
      if (isEmpty(out)) throw new Error("トリム後にサーフェスが残りません (残す側を反転してください)");
      surfaces.delete(f.surface);
      surfaces.set(f.id, out);
      return { bodies, surfaces };
    }
    case "surfStitch": {
      if (!f.surfaces.length) throw new Error("縫合するサーフェスを選択してください");
      const list = f.surfaces.map((id) => takeSurface(surfaces, id));
      const { shape, free } = sewShapes(list, f.tolerance > 0 ? f.tolerance : 1e-3);
      for (const id of f.surfaces) surfaces.delete(id);
      const sewn = cast(shape);
      if (f.solid && free === 0) {
        const shells = [...R.iterTopo(sewn.wrapped as never, "shell")].map((sh) => cast(O.TopoDS.Shell(sh)));
        if (shells.length) {
          const solids = shells.map((sh) => R.makeSolid([sh as never]) as unknown as Shape);
          let solid = compound(solids);
          const v = R.measureVolume(solid as never);
          if (v < 0) solid = cast(solid.wrapped.Reversed());
          if (!(Math.abs(v) > 1e-9)) throw new Error("縫合したシェルからソリッドを作成できませんでした");
          return { bodies: ctx.applyOp(bodies, solid, f.op), surfaces, tool: { shape: solid, op: f.op } };
        }
      }
      if (f.solid && free > 0) {
        // keep the sewn surface and report why no solid was made
        surfaces.set(f.id, sewn);
        throw Object.assign(new Error(`サーフェスが閉じていません (開いたエッジ ${free} 本)。ソリッドにはなりませんでした`), { partial: { bodies, surfaces } });
      }
      surfaces.set(f.id, sewn);
      return { bodies, surfaces };
    }
    case "surfOffset": {
      const src = takeSurface(surfaces, f.surface);
      if (!(Math.abs(f.distance) > 1e-9)) throw new Error("距離は 0 以外にしてください");
      const mk = new O.BRepOffsetAPI_MakeOffsetShape();
      mk.PerformBySimple(src.wrapped, f.distance);
      if (!mk.IsDone()) throw new Error("オフセットできませんでした (距離が曲率半径より大きい可能性があります)");
      const out = cast(mk.Shape());
      if (isEmpty(out)) throw new Error("オフセットできませんでした");
      surfaces.set(f.id, out);
      return { bodies, surfaces };
    }
    case "surfThicken": {
      const src = takeSurface(surfaces, f.surface, "厚み付けするサーフェス");
      if (!(Math.abs(f.distance) > 1e-9)) throw new Error("厚さは 0 以外にしてください");
      const mk = new O.BRepOffsetAPI_MakeThickSolid();
      mk.MakeThickSolidBySimple(src.wrapped, f.distance);
      if (!mk.IsDone()) throw new Error("厚み付けできませんでした");
      let solid = cast(mk.Shape());
      if (isEmpty(solid)) throw new Error("厚み付けできませんでした");
      if (!solid.solids?.length) solid = R.makeSolid([solid as never]) as unknown as Shape;
      // the simple algorithm can return an inside-out solid (negative volume)
      if (R.measureVolume(solid as never) < 0) solid = cast(solid.wrapped.Reversed());
      surfaces.delete(f.surface);
      return { bodies: ctx.applyOp(bodies, solid, f.op), surfaces, tool: { shape: solid, op: f.op } };
    }
  }
}
