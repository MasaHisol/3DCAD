// Data exchange on the kernel side: shape healing, STEP with names / colours /
// assembly structure (XCAF writer + text metadata reader), and IGES (built
// from / converted to plain NURBS data, see src/io/iges.ts).
/* eslint-disable @typescript-eslint/no-explicit-any */

import * as R from "replicad";
import { chainLoops, curveRange, evalCurve, evalSurface, expandKnots, interpolate, knotMults, reverseCurve, revolveSurface, surfaceRange, type NurbsCurve, type NurbsSurface, type P3 } from "../io/nurbs";
import type { IgesBody, IgesFace, IgesModel } from "../io/iges";
import { invRigid, matchSolids, readStepMeta, stepLeaves, type Mat4 } from "../io/stepmeta";

type Shape = R.Shape3D;
const oc = () => R.getOC() as any;
const progress = () => new (oc().Message_ProgressRange)();

/** Metadata attached to a body (STEP / IGES names and colours). */
export interface BodyMeta {
  name?: string;
  color?: string;
  /** Assembly path of the instance it came from. */
  path?: string[];
}

/** Names / colours of bodies that came from a file (kept while the body object lives). */
export const bodyMeta = new WeakMap<object, BodyMeta>();

// ------------------------------------------------------------- healing ---

export interface HealReport {
  /** Faces dropped because their area was below the tiny-face limit. */
  tinyFaces: number;
  /** Free (unshared) edges before and after sewing. */
  freeEdgesBefore: number;
  freeEdgesAfter: number;
  /** Shells closed into solids (with orientation fixed). */
  solidsMade: number;
  /** Open shells left as surface bodies. */
  openShells: number;
  /** Edges shorter than the tolerance removed by the wire fixes. */
  smallEdges: number;
  validBefore: boolean;
  validAfter: boolean;
  tolerance: number;
}

function iter(shape: any, kind: "face" | "shell" | "solid" | "edge" | "vertex"): any[] {
  return [...R.iterTopo(shape, kind)];
}

function isValid(shape: any): boolean {
  try {
    return new (oc().BRepCheck_Analyzer)(shape, true, false).IsValid();
  } catch {
    return false;
  }
}

function faceArea(f: any): number {
  try {
    return Math.abs(R.measureArea(R.cast(f) as never));
  } catch {
    return 0;
  }
}

function freeEdgeCount(shape: any): number {
  // an edge used once is free (open boundary); a seam is used twice by its face; degenerated edges don't count
  const O = oc();
  const count = new Map<number, number>();
  for (const f of iter(shape, "face"))
    for (const e of explore(f, "TopAbs_EDGE")) {
      if (O.BRep_Tool.Degenerated(O.TopoDS.Edge(e))) continue;
      const h = (R.cast(e) as any).hashCode as number;
      count.set(h, (count.get(h) ?? 0) + 1);
    }
  let n = 0;
  for (const [, c] of count) if (c === 1) n++;
  return n;
}

function shortEdgeCount(shape: any, tol: number): number {
  let n = 0;
  for (const e of iter(shape, "edge")) {
    try {
      if (oc().BRep_Tool.Degenerated(oc().TopoDS.Edge(e))) continue;
      if (R.measureLength(R.cast(e) as never) < tol) n++;
    } catch {
      /* ignore */
    }
  }
  return n;
}

/**
 * Repairs imported geometry: drops tiny faces, sews gaps up to `tolerance`,
 * fixes wires (small edges, gaps, missing pcurves) and face / shell
 * orientation, and closes shells into solids. Returns solids and open shells.
 */
export function healShape(input: any, tolerance = 0.01): { shapes: Shape[]; report: HealReport } {
  const O = oc();
  const raw = (input as { wrapped?: unknown }).wrapped ?? input;
  const validBefore = isValid(raw);
  const faces = iter(raw, "face");
  const minArea = tolerance * tolerance;
  let tinyFaces = 0;
  const sew = new O.BRepBuilderAPI_Sewing(tolerance, true, true, true, false);
  const kept: any[] = [];
  for (const f of faces) {
    if (faceArea(f) < minArea) {
      tinyFaces++;
      continue;
    }
    // per-face fixes first: wire order, small edges, gaps, pcurves, orientation of wires
    let face = O.TopoDS.Face(f);
    try {
      const ff = new O.ShapeFix_Face(face);
      ff.SetPrecision(tolerance * 0.1);
      ff.SetMaxTolerance(tolerance);
      ff.Perform(progress());
      face = ff.Face();
    } catch {
      /* keep the face as is */
    }
    kept.push(face);
    sew.Add(face);
  }
  const loose = O.TopoDS_Compound ? (() => {
    const b = new O.TopoDS_Builder();
    const c = new O.TopoDS_Compound();
    b.MakeCompound(c);
    for (const f of kept) b.Add(c, f);
    return c;
  })() : raw;
  const freeEdgesBefore = freeEdgeCount(loose);
  const smallBefore = shortEdgeCount(loose, tolerance * 0.1);
  sew.Perform(progress());
  const sewed = sew.SewedShape();
  const freeEdgesAfter = sew.NbFreeEdges();
  const shapes: Shape[] = [];
  let solidsMade = 0, openShells = 0;
  const shells = iter(sewed, "shell");
  // faces outside any shell (a single closed face such as a sphere comes back alone) get their own shell
  const inShell = new Set(shells.flatMap((sh) => iter(sh, "face").map((f) => (R.cast(f) as any).hashCode)));
  for (const f of iter(sewed, "face")) {
    if (inShell.has((R.cast(f) as any).hashCode)) continue;
    const b = new O.TopoDS_Builder();
    const sh = new O.TopoDS_Shell();
    b.MakeShell(sh);
    b.Add(sh, f);
    shells.push(sh);
  }
  for (const sh of shells) {
    const shell = O.TopoDS.Shell(sh);
    const closed = O.BRep_Tool.IsClosed(shell) || freeEdgeCount(shell) === 0;
    if (!closed) {
      shapes.push(R.cast(shell) as Shape);
      openShells++;
      continue;
    }
    try {
      const fs = new O.ShapeFix_Solid();
      fs.SetPrecision(tolerance * 0.1);
      fs.SetMaxTolerance(tolerance);
      const solid = fs.SolidFromShell(shell);
      const fix = new O.ShapeFix_Solid(solid);
      fix.SetPrecision(tolerance * 0.1);
      fix.SetMaxTolerance(tolerance);
      fix.Perform(progress());
      let out = fix.Solid();
      try {
        const up = new O.ShapeUpgrade_UnifySameDomain(out, true, true, false);
        up.SetLinearTolerance(tolerance * 0.1);
        up.Build();
        out = up.Shape();
      } catch {
        /* keep */
      }
      for (const s of iter(out, "solid")) {
        let solid = R.cast(s) as Shape;
        // inside-out solids (negative volume) get flipped
        try {
          if (R.measureVolume(solid as never) < 0) solid = R.cast(O.TopoDS.Solid(s).Reversed()) as Shape;
        } catch {
          /* ignore */
        }
        shapes.push(solid);
        solidsMade++;
      }
    } catch {
      shapes.push(R.cast(shell) as Shape);
      openShells++;
    }
  }
  const all = shapes.map((s) => (s as unknown as { wrapped: unknown }).wrapped);
  const smallAfter = all.reduce<number>((n, s) => n + shortEdgeCount(s, tolerance * 0.1), 0);
  return {
    shapes,
    report: {
      tinyFaces,
      freeEdgesBefore,
      freeEdgesAfter,
      solidsMade,
      openShells,
      smallEdges: Math.max(0, smallBefore - smallAfter),
      validBefore,
      validAfter: all.length > 0 && all.every(isValid),
      tolerance,
    },
  };
}

/** Heals only when needed: invalid shapes, or faces / shells that are not solids. */
export function healIfNeeded(shape: Shape, tolerance: number): { shapes: Shape[]; report?: HealReport } {
  const raw = (shape as unknown as { wrapped: unknown }).wrapped;
  const solids = iter(raw, "solid");
  const facesInSolids = solids.reduce((n, s) => n + iter(s, "face").length, 0);
  const allFaces = iter(raw, "face").length;
  if (solids.length && facesInSolids === allFaces && solids.every(isValid)) return { shapes: solids.map((s) => R.cast(s) as Shape) };
  if (!allFaces) return { shapes: [shape] };
  // keep valid solids, heal the rest (loose faces / shells / broken solids)
  const good = solids.filter(isValid);
  const bad = [...solids.filter((s) => !isValid(s))];
  const b = new (oc().TopoDS_Builder)();
  const c = new (oc().TopoDS_Compound)();
  b.MakeCompound(c);
  for (const s of bad) b.Add(c, s);
  const inSolids = new Set(solids.flatMap((s) => iter(s, "face").map((f) => (R.cast(f) as any).hashCode)));
  for (const f of iter(raw, "face")) if (!inSolids.has((R.cast(f) as any).hashCode)) b.Add(c, f);
  const healed = healShape(c, tolerance);
  return { shapes: [...good.map((s) => R.cast(s) as Shape), ...healed.shapes], report: healed.report };
}

export function healSummary(r: HealReport): string {
  const parts: string[] = [];
  if (r.tinyFaces) parts.push(`微小面 ${r.tinyFaces} 個を削除`);
  if (r.freeEdgesBefore !== r.freeEdgesAfter) parts.push(`隙間を縫合 (開いたエッジ ${r.freeEdgesBefore} → ${r.freeEdgesAfter})`);
  if (r.smallEdges) parts.push(`微小エッジ ${r.smallEdges} 本を除去`);
  if (r.solidsMade) parts.push(`ソリッド ${r.solidsMade} 個を作成 (向きを修正)`);
  if (r.openShells) parts.push(`閉じていないシェル ${r.openShells} 個はサーフェスとして読み込み`);
  return parts.length ? `形状を自動修復しました: ${parts.join("、")}` : "";
}

// ------------------------------------------------------------- STEP ---

function vertexBox(shape: any): [number[], number[]] {
  const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  for (const v of iter(shape, "vertex")) {
    const p = oc().BRep_Tool.Pnt(oc().TopoDS.Vertex(v));
    const q = [p.X(), p.Y(), p.Z()];
    for (let k = 0; k < 3; k++) (lo[k] = Math.min(lo[k], q[k])), (hi[k] = Math.max(hi[k], q[k]));
  }
  return [lo, hi];
}

export interface StepImport {
  shapes: Shape[];
  meta: BodyMeta[];
  /** Number of distinct products / instances found in the file. */
  products: number;
  instances: number;
  heal?: HealReport;
}

/** STEP text -> solids with names, colours and assembly paths. */
export async function importStepWithMeta(text: string, heal = true): Promise<StepImport> {
  const shape = (await R.importSTEP(new Blob([text]))) as Shape;
  let shapes: Shape[];
  let report: HealReport | undefined;
  if (heal) {
    const h = healIfNeeded(shape, 0.01);
    shapes = h.shapes;
    report = h.report;
  } else shapes = shape.solids?.length ? (shape.solids as Shape[]) : [shape];
  let meta: BodyMeta[] = shapes.map(() => ({}));
  let products = 0, instances = 0;
  try {
    const sm = readStepMeta(text);
    const leaves = stepLeaves(sm);
    products = new Set(leaves.map((l) => l.pd)).size;
    instances = leaves.length;
    const raw = shapes.map((s) => (s as unknown as { wrapped: unknown }).wrapped);
    const match = matchSolids(leaves, raw.map((s) => ({ bbox: vertexBox(s), faces: iter(s, "face").length })));
    meta = match.map((li) => {
      if (li < 0) return {};
      const l = leaves[li];
      const name = l.solid.name && l.solid.name !== "" && !/^(NONE|SOLID|Open CASCADE STEP translator.*)$/i.test(l.solid.name) ? l.solid.name : l.path[l.path.length - 1] ?? l.product;
      return { name: name || undefined, color: l.solid.color, path: l.path };
    });
  } catch {
    /* metadata is optional */
  }
  return { shapes, meta, products, instances, heal: report };
}

/** One part per distinct product with instances placed by their matrices (assembly import). */
export async function importStepAssembly(text: string): Promise<{ parts: { name: string; color?: string; step: string }[]; comps: { part: number; name: string; matrix: Mat4 }[] }> {
  const shape = (await R.importSTEP(new Blob([text]))) as Shape;
  const solids = healIfNeeded(shape, 0.01).shapes;
  const sm = readStepMeta(text);
  const leaves = stepLeaves(sm);
  const match = matchSolids(leaves, solids.map((s) => ({ bbox: vertexBox((s as any).wrapped), faces: s.faces.length })));
  // group leaves by product + instance placement
  const instKey = (li: number) => `${leaves[li].pd}|${leaves[li].path.join("/")}`;
  const byInst = new Map<string, { li: number; solids: Shape[] }>();
  const unmatched: Shape[] = [];
  match.forEach((li, si) => {
    if (li < 0) return void unmatched.push(solids[si]);
    const k = instKey(li);
    if (!byInst.has(k)) byInst.set(k, { li, solids: [] });
    byInst.get(k)!.solids.push(solids[si]);
  });
  const parts: { name: string; color?: string; step: string }[] = [];
  const partOfPd = new Map<number, number>();
  const comps: { part: number; name: string; matrix: Mat4 }[] = [];
  const toLocal = (s: Shape, m: Mat4) => transformByMatrix(s, invRigid(m));
  for (const { li, solids: ss } of byInst.values()) {
    const l = leaves[li];
    let pi = partOfPd.get(l.pd);
    if (pi === undefined) {
      const local = ss.map((s) => toLocal(s, l.matrix));
      const color = l.solid.color;
      const blob = exportStepXcaf([{ name: l.product || "part", color, shapes: local }], null, l.product || "part");
      pi = parts.length;
      parts.push({ name: l.product || `部品${pi + 1}`, color, step: await blob.text() });
      partOfPd.set(l.pd, pi);
    }
    comps.push({ part: pi, name: l.path[l.path.length - 1] || parts[pi].name, matrix: l.matrix });
  }
  if (unmatched.length) {
    const blob = exportStepXcaf([{ name: "その他", shapes: unmatched }], null, "その他");
    parts.push({ name: "その他", step: await blob.text() });
    comps.push({ part: parts.length - 1, name: "その他", matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] });
  }
  return { parts, comps };
}

function trsfOf(m: Mat4): any {
  const t = new (oc().gp_Trsf)();
  t.SetValues(m[0], m[4], m[8], m[12], m[1], m[5], m[9], m[13], m[2], m[6], m[10], m[14]);
  return t;
}

export function transformByMatrix(s: Shape, m: Mat4): Shape {
  const tr = new (oc().BRepBuilderAPI_Transform)((s as any).wrapped, trsfOf(m), true, false);
  return R.cast(tr.Shape()) as Shape;
}

function hexColor(hex: string | undefined): any {
  const h = (hex ?? "#c9ced6").replace("#", "");
  const v = h.length === 3 ? h.split("").map((c) => parseInt(c + c, 16)) : [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  // Quantity_Color is linear RGB; the STEP writer stores sRGB, so convert to keep the hex value exact
  const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return new (oc().Quantity_ColorRGBA)(lin(v[0] / 255), lin(v[1] / 255), lin(v[2] / 255), 1);
}

const ext = (s: string) => new (oc().TCollection_ExtendedString)(s, true);

/**
 * STEP AP214 through XCAF: every part becomes a product with its name and
 * surface colour; with `comps` the parts are placed as instances of a root
 * assembly (one product per part, shared by its instances).
 */
export function exportStepXcaf(parts: { name: string; color?: string; shapes: Shape[] }[], comps: { part: number; name: string; matrix: Mat4 }[] | null, rootName: string): Blob {
  const O = oc();
  const doc = new O.TDocStd_Document(ext("XmlOcaf"));
  O.XCAFDoc_ShapeTool.SetAutoNaming(false);
  const main = doc.Main();
  const tool = O.XCAFDoc_DocumentTool.ShapeTool(main);
  const ctool = O.XCAFDoc_DocumentTool.ColorTool(main);
  const surf = O.XCAFDoc_ColorType.XCAFDoc_ColorSurf;
  const shapeOf = (ss: Shape[]) => (ss.length === 1 ? (ss[0] as any).wrapped : (R.makeCompound(ss as never) as any).wrapped);
  if (!comps) {
    for (const p of parts) {
      if (!p.shapes.length) continue;
      const l = tool.AddShape(shapeOf(p.shapes), false, false);
      O.TDataStd_Name.Set(l, ext(p.name));
      ctool.SetColor(l, hexColor(p.color), surf);
    }
  } else {
    const asm = tool.NewShape();
    O.TDataStd_Name.Set(asm, ext(rootName));
    const labels = parts.map((p) => {
      if (!p.shapes.length) return null;
      const l = tool.AddShape(shapeOf(p.shapes), false, false);
      O.TDataStd_Name.Set(l, ext(p.name));
      ctool.SetColor(l, hexColor(p.color), surf);
      return l;
    });
    for (const c of comps) {
      const l = labels[c.part];
      if (!l) continue;
      const cl = tool.AddComponent(asm, l, new O.TopLoc_Location(trsfOf(c.matrix)));
      O.TDataStd_Name.Set(cl, ext(c.name));
    }
    tool.UpdateAssemblies();
  }
  O.Interface_Static.SetCVal("xstep.cascade.unit", "MM");
  O.Interface_Static.SetCVal("write.step.unit", "MM");
  const session = new O.XSControl_WorkSession();
  const writer = new O.STEPCAFControl_Writer(session, false);
  writer.SetColorMode(true);
  writer.SetNameMode(true);
  writer.SetLayerMode(true);
  O.Interface_Static.SetIVal("write.surfacecurve.mode", 1);
  O.Interface_Static.SetIVal("write.precision.mode", 0);
  O.Interface_Static.SetIVal("write.step.assembly", 1);
  O.Interface_Static.SetIVal("write.step.schema", 5);
  O.Interface_Static.SetCVal("write.step.product.name", rootName);
  const file = `/xcaf_${Math.random().toString(36).slice(2)}.step`;
  if (!writer.Perform(doc, file, progress())) throw new Error("STEP の書き出しに失敗しました");
  const data = O.FS.readFile(file);
  O.FS.unlink(file);
  return new Blob([data], { type: "application/STEP" });
}

// ------------------------------------------------------------- IGES ---

/** Volume by adaptive integration (accurate on rational B-spline faces). */
export function preciseVolume(shape: Shape): number {
  const O = oc();
  const props = new O.GProp_GProps();
  O.BRepGProp.VolumePropertiesGK((shape as any).wrapped, props, 1e-7, false, true, false, false, false);
  return props.Mass();
}

function readBSplineCurve(bs: any): NurbsCurve {
  const n = bs.NbPoles(), nk = bs.NbKnots();
  const poles: P3[] = [], weights: number[] = [];
  for (let i = 1; i <= n; i++) {
    const p = bs.Pole(i);
    poles.push([p.X(), p.Y(), p.Z()]);
    weights.push(bs.Weight(i));
  }
  const k: number[] = [], m: number[] = [];
  for (let i = 1; i <= nk; i++) (k.push(bs.Knot(i)), m.push(bs.Multiplicity(i)));
  return { degree: bs.Degree(), knots: expandKnots(k, m), poles, weights: bs.IsRational() ? weights : undefined };
}

function readBSplineSurface(bs: any): NurbsSurface {
  const nu = bs.NbUPoles(), nv = bs.NbVPoles();
  const poles: P3[][] = [], weights: number[][] = [];
  for (let i = 1; i <= nu; i++) {
    poles.push([]);
    weights.push([]);
    for (let j = 1; j <= nv; j++) {
      const p = bs.Pole(i, j);
      poles[i - 1].push([p.X(), p.Y(), p.Z()]);
      weights[i - 1].push(bs.Weight(i, j));
    }
  }
  const ku: number[] = [], mu: number[] = [], kv: number[] = [], mv: number[] = [];
  for (let i = 1; i <= bs.NbUKnots(); i++) (ku.push(bs.UKnot(i)), mu.push(bs.UMultiplicity(i)));
  for (let i = 1; i <= bs.NbVKnots(); i++) (kv.push(bs.VKnot(i)), mv.push(bs.VMultiplicity(i)));
  const rational = bs.IsURational() || bs.IsVRational();
  return { degreeU: bs.UDegree(), degreeV: bs.VDegree(), knotsU: expandKnots(ku, mu), knotsV: expandKnots(kv, mv), poles, weights: rational ? weights : undefined };
}

const P = (p: any): P3 => [p.X(), p.Y(), p.Z()];

/** Face surface as an exact NURBS over the face's UV bounds (approximated for exotic surfaces). */
function faceSurface(face: any): NurbsSurface {
  const O = oc();
  const ad = new O.BRepAdaptor_Surface(face, true);
  const uv = O.BRepTools.UVBounds(face);
  const [u0, u1, v0, v1] = [uv.UMin, uv.UMax, uv.VMin, uv.VMax];
  const type = ad.GetType();
  if (type === "GeomAbs_Plane") {
    const at = (u: number, v: number) => P(ad.EvalD0(u, v));
    return { degreeU: 1, degreeV: 1, knotsU: [u0, u0, u1, u1], knotsV: [v0, v0, v1, v1], poles: [[at(u0, v0), at(u0, v1)], [at(u1, v0), at(u1, v1)]] };
  }
  if (type === "GeomAbs_Cylinder") {
    const c = ad.Cylinder();
    const pos = c.Position();
    const o = P(pos.Location()), x = P(pos.XDirection()), z = P(pos.Direction());
    const r = c.Radius();
    const a: P3 = [o[0] + x[0] * r + z[0] * v0, o[1] + x[1] * r + z[1] * v0, o[2] + x[2] * r + z[2] * v0];
    const b: P3 = [o[0] + x[0] * r + z[0] * v1, o[1] + x[1] * r + z[1] * v1, o[2] + x[2] * r + z[2] * v1];
    const s = revolveSurface({ degree: 1, knots: [v0, v0, v1, v1], poles: [a, b] }, o, cylinderAxisSign(pos, z), u0, u1);
    return s;
  }
  if (type === "GeomAbs_Cone") {
    const gs = O.BRep_Tool.Surface(face);
    if (gs && typeof gs.SemiAngle === "function") {
      const pos = gs.Position();
      const o = P(pos.Location()), x = P(pos.XDirection()), z = P(pos.Direction());
      const R0 = gs.RefRadius(), sa = gs.SemiAngle();
      const pt = (v: number): P3 => {
        const r = R0 + v * Math.sin(sa), h = v * Math.cos(sa);
        return [o[0] + x[0] * r + z[0] * h, o[1] + x[1] * r + z[1] * h, o[2] + x[2] * r + z[2] * h];
      };
      return revolveSurface({ degree: 1, knots: [v0, v0, v1, v1], poles: [pt(v0), pt(v1)] }, o, cylinderAxisSign(pos, z), u0, u1);
    }
  }
  if (type === "GeomAbs_BSplineSurface" || type === "GeomAbs_Sphere" || type === "GeomAbs_Torus" || type === "GeomAbs_BezierSurface") {
    try {
      const bs = O.GeomConvert.SurfaceToBSplineSurface(O.BRep_Tool.Surface(face));
      bs.Segment(u0, u1, v0, v1, 1e-9, 1e-9);
      return readBSplineSurface(bs);
    } catch {
      /* fall through to the approximation */
    }
  }
  // approximation on a grid over the face bounds
  const n = 24;
  const grid = new O.NCollection_Array2_gp_Pnt(1, n + 1, 1, n + 1);
  for (let i = 0; i <= n; i++)
    for (let j = 0; j <= n; j++) grid.SetValue(i + 1, j + 1, ad.EvalD0(u0 + ((u1 - u0) * i) / n, v0 + ((v1 - v0) * j) / n));
  const fit = new O.GeomAPI_PointsToBSplineSurface(grid, 3, 8, O.GeomAbs_Shape.GeomAbs_C2, 1e-4);
  return readBSplineSurface(fit.Surface());
}

/** gp_Ax3 may be left-handed (indirect): then the angle runs the other way round the axis. */
function cylinderAxisSign(pos: any, z: P3): P3 {
  const direct = typeof pos.Direct === "function" ? pos.Direct() : true;
  return direct ? z : [-z[0], -z[1], -z[2]];
}

function edgeCurve(edge: any): NurbsCurve | null {
  const O = oc();
  if (O.BRep_Tool.Degenerated(edge)) return null;
  const r = O.BRep_Tool.Curve(edge, 0, 0);
  if (!r.returnValue) return null;
  const tc = new O.Geom_TrimmedCurve(r.returnValue, r.First, r.Last, true, true);
  const c = readBSplineCurve(O.GeomConvert.CurveToBSplineCurve(tc));
  // follow the edge orientation inside its wire
  return edge.Orientation() === O.TopAbs_Orientation.TopAbs_REVERSED ? reverseCurve(c) : c;
}

/** Sub-shapes in order, keeping repeats (a seam edge appears twice in its wire). */
function explore(shape: any, kind: "TopAbs_EDGE" | "TopAbs_WIRE" | "TopAbs_FACE"): any[] {
  const O = oc();
  const out: any[] = [];
  for (const ex = new O.TopExp_Explorer(shape, O.TopAbs_ShapeEnum[kind], O.TopAbs_ShapeEnum.TopAbs_SHAPE); ex.More(); ex.Next()) out.push(ex.Current());
  return out;
}

/** Solids / shells -> IGES bodies of trimmed NURBS faces. */
export function shapesToIges(bodies: { shape: Shape; name: string; color?: string }[]): IgesBody[] {
  const O = oc();
  return bodies.map((b) => {
    const faces: IgesFace[] = [];
    for (const f of explore((b.shape as any).wrapped, "TopAbs_FACE")) {
      const face = O.TopoDS.Face(f);
      const outerW = O.BRepTools.OuterWire(face);
      const loops: { outer: boolean; curves: NurbsCurve[] }[] = [];
      for (const w of explore(face, "TopAbs_WIRE")) {
        const curves = explore(w, "TopAbs_EDGE")
          .map((e) => edgeCurve(O.TopoDS.Edge(e)))
          .filter((c): c is NurbsCurve => !!c);
        if (curves.length) loops.push({ outer: w.IsSame(outerW), curves });
      }
      const outer = loops.find((l) => l.outer)?.curves ?? null;
      faces.push({ surface: faceSurface(face), outer, inner: loops.filter((l) => !l.outer).map((l) => l.curves) });
    }
    const c = b.color?.replace("#", "");
    const color: [number, number, number] | undefined = c && c.length === 6 ? ([0, 2, 4].map((i) => parseInt(c.slice(i, i + 2), 16) / 255) as [number, number, number]) : undefined;
    return { name: b.name, color, faces };
  });
}

function arr1(a: number[], T: string): any {
  const x = new (oc()[T])(1, a.length);
  a.forEach((t, i) => x.SetValue(i + 1, t));
  return x;
}

function makeSurface(s: NurbsSurface): any {
  const O = oc();
  const nu = s.poles.length, nv = s.poles[0].length;
  const poles = new O.NCollection_Array2_gp_Pnt(1, nu, 1, nv);
  const w = new O.NCollection_Array2_double(1, nu, 1, nv);
  for (let i = 0; i < nu; i++)
    for (let j = 0; j < nv; j++) {
      poles.SetValue(i + 1, j + 1, new O.gp_Pnt(...s.poles[i][j]));
      w.SetValue(i + 1, j + 1, s.weights?.[i][j] ?? 1);
    }
  const ku = knotMults(s.knotsU), kv = knotMults(s.knotsV);
  return new O.Geom_BSplineSurface(poles, w, arr1(ku.k, "NCollection_Array1_double"), arr1(kv.k, "NCollection_Array1_double"), arr1(ku.m, "NCollection_Array1_int"), arr1(kv.m, "NCollection_Array1_int"), s.degreeU, s.degreeV, false, false);
}

const dist3 = (a: P3, b: P3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

/** Chained loop with zero-length segments removed. */
function loopOf(curves: NurbsCurve[], tol: number): NurbsCurve[] {
  const loops = chainLoops(curves, tol * 10);
  const loop = loops.sort((a, b) => b.length - a.length)[0] ?? [];
  return loop.filter((c) => !(c.poles.every((p) => dist3(p, c.poles[0]) < tol * 1e-3)));
}

/**
 * Wire on a surface: each boundary curve is projected to the surface (UV
 * points, unwrapped across the seam of closed surfaces) and fitted as a
 * pcurve; the 3D edges are rebuilt from the pcurves.
 */
/** Parameter range of a face surface, its closed directions and its poles (collapsed edges). */
interface UVInfo {
  u0: number;
  u1: number;
  v0: number;
  v1: number;
  closedU: boolean;
  closedV: boolean;
  /** V values where U is arbitrary (e.g. the poles of a sphere), and the other way round. */
  vPoles: number[];
  uPoles: number[];
}

function nurbsUV(s: NurbsSurface): UVInfo {
  const [u0, u1, v0, v1] = surfaceRange(s);
  const size = Math.max(...s.poles.flat().map((p) => Math.hypot(...p)), 1);
  const eq = (a: P3, b: P3) => dist3(a, b) < 1e-7 * size;
  const last = s.poles.length - 1, lastV = s.poles[0].length - 1;
  return {
    u0, u1, v0, v1,
    closedU: s.poles[0].every((p, j) => eq(p, s.poles[last][j])),
    closedV: s.poles.every((row) => eq(row[0], row[lastV])),
    vPoles: [...(s.poles.every((row) => eq(row[0], s.poles[0][0])) ? [v0] : []), ...(s.poles.every((row) => eq(row[lastV], s.poles[0][lastV])) ? [v1] : [])],
    uPoles: [...(s.poles[0].every((p) => eq(p, s.poles[0][0])) ? [u0] : []), ...(s.poles[last].every((p) => eq(p, s.poles[last][0])) ? [u1] : [])],
  };
}

function wireOnSurface(loop: NurbsCurve[], surf: any, info: UVInfo): { wire: any; ccw: boolean } | null {
  const O = oc();
  if (!loop.length) return null;
  const { u0, u1, v0, v1, closedU, closedV, vPoles, uPoles } = info;
  // sample every curve, project the samples
  const samples = loop.map((c) => {
    const [t0, t1] = curveRange(c);
    const n = c.degree === 1 && c.poles.length === 2 ? 4 : Math.min(48, Math.max(12, c.poles.length * 4));
    const pts: [number, number][] = [];
    for (let k = 0; k <= n; k++) {
      const p = evalCurve(c, t0 + ((t1 - t0) * k) / n);
      const pr = new O.GeomAPI_ProjectPointOnSurf(new O.gp_Pnt(p[0], p[1], p[2]), surf);
      if (!pr.NbPoints()) return null;
      const uv = pr.LowerDistanceParameters(0, 0);
      pts.push([uv.U, uv.V]);
    }
    return pts;
  });
  if (samples.some((x) => !x)) return null;
  const flat = (samples as [number, number][][]).flat();
  const curvesUV = samples as [number, number][][];
  // seam unwrapping: a sample on the seam of a closed surface takes the side of its
  // nearest free neighbour on the same curve; curves lying on the seam follow the previous curve
  const fix = (idx: 0 | 1, lo: number, hi: number) => {
    const span = hi - lo, eps = span * 1e-6;
    const onSeam = (x: number) => Math.abs(x - lo) < eps || Math.abs(x - hi) < eps;
    const side = (ref: number) => (Math.abs(ref - lo) < Math.abs(ref - hi) ? lo : hi);
    const start = curvesUV.findIndex((c) => c.some((p) => !onSeam(p[idx])));
    if (start < 0) {
      // every curve lies on the seam (a sphere's loop): alternate the sides
      curvesUV.forEach((c, k) => c.forEach((p) => (p[idx] = k % 2 ? hi : lo)));
      return;
    }
    let prevEnd: number | null = null;
    for (let k = 0; k < curvesUV.length; k++) {
      const c = curvesUV[(start + k) % curvesUV.length];
      const free = c.map((p) => !onSeam(p[idx]));
      if (!free.some(Boolean)) {
        const v = side(prevEnd ?? lo);
        for (const p of c) p[idx] = v;
      } else
        c.forEach((p, i) => {
          if (free[i]) return;
          let j = 1;
          while (!(free[i - j] ?? false) && !(free[i + j] ?? false)) j++;
          const ref = free[i - j] ? c[i - j][idx] : c[i + j][idx];
          p[idx] = side(ref);
        });
      prevEnd = c[c.length - 1][idx];
    }
  };
  // at a pole (a surface edge collapsed to a point) the other parameter is arbitrary:
  // take it from the neighbouring samples of the same curve
  const poleFix = (idx: 0 | 1, other: 0 | 1, at: number[]) => {
    const epsO = (other ? v1 - v0 : u1 - u0) * 1e-6;
    for (const c of curvesUV) {
      const pole = c.map((p) => at.some((a) => Math.abs(p[other] - a) < epsO));
      if (pole.every(Boolean)) continue;
      c.forEach((p, i) => {
        if (!pole[i]) return;
        let j = 1;
        while (!(pole[i - j] === false) && !(pole[i + j] === false)) j++;
        p[idx] = pole[i - j] === false ? c[i - j][idx] : c[i + j][idx];
      });
    }
  };
  if (vPoles.length) poleFix(0, 1, vPoles);
  if (uPoles.length) poleFix(1, 0, uPoles);
  if (closedU) fix(0, u0, u1);
  if (closedV) fix(1, v0, v1);
  // edges are built on the surface and joined into a wire without checks;
  // ShapeFix_Wire then merges the end vertices (FixConnected) and closes small gaps
  const bb = new O.TopoDS_Builder();
  const wire = new O.TopoDS_Wire();
  bb.MakeWire(wire);
  let n = 0;
  (samples as [number, number][][]).forEach((pts) => {
    const ip = interpolate(pts, 3);
    const poles2 = new O.NCollection_Array1_gp_Pnt2d(1, ip.poles.length);
    ip.poles.forEach((q, k) => poles2.SetValue(k + 1, new O.gp_Pnt2d(q[0], q[1])));
    const km = knotMults(ip.knots);
    const c2d = new O.Geom2d_BSplineCurve(poles2, arr1(km.k, "NCollection_Array1_double"), arr1(km.m, "NCollection_Array1_int"), ip.degree, false);
    const e = new O.BRepBuilderAPI_MakeEdge(c2d, surf);
    if (!e.IsDone()) return;
    const edge = e.Edge();
    O.BRepLib.BuildCurve3d(edge, 1e-6, O.GeomAbs_Shape.GeomAbs_C1, 14, 32);
    bb.Add(wire, edge);
    n++;
  });
  if (!n) return null;
  // signed UV area: counter-clockwise loops bound material on their left
  let area = 0;
  for (let k = 0; k < flat.length; k++) {
    const a = flat[k], b = flat[(k + 1) % flat.length];
    area += a[0] * b[1] - b[0] * a[1];
  }
  return { wire, ccw: area > 0 };
}

/** Bilinear patch covering a planar loop (IGES planes come without a NURBS surface). */
function planeFor(loop: NurbsCurve[]): NurbsSurface | null {
  const pts = loop.flatMap((c) => {
    const [t0, t1] = curveRange(c);
    return [0, 0.25, 0.5, 0.75].map((k) => evalCurve(c, t0 + (t1 - t0) * k));
  });
  // Newell normal
  const n: P3 = [0, 0, 0];
  pts.forEach((p, i) => {
    const q = pts[(i + 1) % pts.length];
    n[0] += (p[1] - q[1]) * (p[2] + q[2]);
    n[1] += (p[2] - q[2]) * (p[0] + q[0]);
    n[2] += (p[0] - q[0]) * (p[1] + q[1]);
  });
  const l = Math.hypot(...n);
  if (l < 1e-12) return null;
  const z: P3 = [n[0] / l, n[1] / l, n[2] / l];
  const t: P3 = Math.abs(z[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
  const xr: P3 = [t[1] * z[2] - t[2] * z[1], t[2] * z[0] - t[0] * z[2], t[0] * z[1] - t[1] * z[0]];
  const xl = Math.hypot(...xr);
  const x: P3 = [xr[0] / xl, xr[1] / xl, xr[2] / xl];
  const y: P3 = [z[1] * x[2] - z[2] * x[1], z[2] * x[0] - z[0] * x[2], z[0] * x[1] - z[1] * x[0]];
  const o = pts[0];
  let [a0, a1, b0, b1] = [Infinity, -Infinity, Infinity, -Infinity];
  for (const p of pts) {
    const d: P3 = [p[0] - o[0], p[1] - o[1], p[2] - o[2]];
    const u = d[0] * x[0] + d[1] * x[1] + d[2] * x[2], v = d[0] * y[0] + d[1] * y[1] + d[2] * y[2];
    (a0 = Math.min(a0, u)), (a1 = Math.max(a1, u)), (b0 = Math.min(b0, v)), (b1 = Math.max(b1, v));
  }
  const m = Math.max(a1 - a0, b1 - b0) * 0.05 + 1e-3;
  (a0 -= m), (a1 += m), (b0 -= m), (b1 += m);
  const at = (u: number, v: number): P3 => [o[0] + x[0] * u + y[0] * v, o[1] + x[1] * u + y[1] * v, o[2] + x[2] * u + y[2] * v];
  return { degreeU: 1, degreeV: 1, knotsU: [a0, a0, a1, a1], knotsV: [b0, b0, b1, b1], poles: [[at(a0, b0), at(a0, b1)], [at(a1, b0), at(a1, b1)]] };
}

// ---- analytic surfaces: planes, cylinders and spheres written as NURBS are rebuilt exactly

type Analytic =
  | { kind: "plane"; origin: P3; normal: P3; xdir: P3 }
  | { kind: "cylinder"; origin: P3; axis: P3; xdir: P3; radius: number }
  | { kind: "sphere"; origin: P3; axis: P3; xdir: P3; radius: number };

const sub3 = (a: P3, b: P3): P3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot3 = (a: P3, b: P3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross3 = (a: P3, b: P3): P3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit3 = (a: P3): P3 => {
  const l = Math.hypot(...a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};

/** Circle centre through three points (3D). */
function circleCenter(a: P3, b: P3, c: P3): P3 | null {
  const ab = sub3(b, a), ac = sub3(c, a);
  const n = cross3(ab, ac);
  const nn = dot3(n, n);
  if (nn < 1e-24) return null;
  const t1 = cross3(n, ab), t2 = cross3(ac, n);
  const k1 = dot3(ac, ac) / (2 * nn), k2 = dot3(ab, ab) / (2 * nn);
  return [a[0] + t1[0] * k1 + t2[0] * k2, a[1] + t1[1] * k1 + t2[1] * k2, a[2] + t1[2] * k1 + t2[2] * k2];
}

function recognize(s: NurbsSurface): Analytic | null {
  const [u0, u1, v0, v1] = surfaceRange(s);
  const N = 6;
  const grid: P3[][] = [];
  for (let i = 0; i <= N; i++) {
    grid.push([]);
    for (let j = 0; j <= N; j++) grid[i].push(evalSurface(s, u0 + ((u1 - u0) * i) / N, v0 + ((v1 - v0) * j) / N));
  }
  const pts = grid.flat();
  const lo = [0, 1, 2].map((k) => Math.min(...pts.map((p) => p[k]))), hi = [0, 1, 2].map((k) => Math.max(...pts.map((p) => p[k])));
  const size = Math.hypot(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]);
  if (size < 1e-9) return null;
  const tol = size * 1e-7 + 1e-9;
  // plane: every pole in one plane
  const poles = s.poles.flat();
  const o = poles[0];
  let normal: P3 | null = null;
  for (let i = 1; i < poles.length && !normal; i++)
    for (let j = i + 1; j < poles.length && !normal; j++) {
      const n = cross3(sub3(poles[i], o), sub3(poles[j], o));
      if (Math.hypot(...n) > size * size * 1e-6) normal = unit3(n);
    }
  if (normal && poles.every((p) => Math.abs(dot3(sub3(p, o), normal!)) < tol)) {
    const xdir = unit3(sub3(grid[N][0], grid[0][0]));
    return { kind: "plane", origin: grid[0][0], normal, xdir: Math.hypot(...xdir) > 0.5 ? xdir : unit3(cross3(normal, [0, 0, 1])) };
  }
  // cylinder: straight, parallel V lines at a constant distance from an axis
  const d = unit3(sub3(grid[0][N], grid[0][0]));
  const straight = grid.every((row) => {
    const dir = sub3(row[N], row[0]);
    const len = Math.hypot(...dir);
    if (len < tol) return false;
    const du = unit3(dir);
    if (Math.abs(dot3(du, d) - 1) > 1e-9) return false;
    return row.every((p) => Math.hypot(...cross3(sub3(p, row[0]), du)) < tol);
  });
  if (straight) {
    // three distinct points of the first V-iso line (a full circle ends where it starts)
    const c = circleCenter(grid[0][0], grid[2][0], grid[4][0]);
    if (c) {
      const axisPt = c;
      const dist = (p: P3) => Math.hypot(...cross3(sub3(p, axisPt), d));
      const r = dist(grid[0][0]);
      if (r > tol && pts.every((p) => Math.abs(dist(p) - r) < tol * 10)) {
        const radial = sub3(grid[0][0], axisPt);
        const xdir = unit3(sub3(radial, [d[0] * dot3(radial, d), d[1] * dot3(radial, d), d[2] * dot3(radial, d)]));
        // the angle must grow with U
        const t = sub3(grid[1][0], grid[0][0]);
        const axis: P3 = dot3(t, cross3(d, xdir)) >= 0 ? d : [-d[0], -d[1], -d[2]];
        // origin on the axis level with the start of the V lines
        const h = dot3(sub3(grid[0][0], axisPt), axis);
        return { kind: "cylinder", origin: [axisPt[0] + axis[0] * h, axisPt[1] + axis[1] * h, axisPt[2] + axis[2] * h], axis, xdir, radius: r };
      }
    }
  }
  // sphere: both V ends collapse to poles, every point at one distance from the middle of the poles
  const southPole = grid[0][0], northPole = grid[0][N];
  if (grid.every((row) => Math.hypot(...sub3(row[0], southPole)) < tol && Math.hypot(...sub3(row[N], northPole)) < tol)) {
    const c: P3 = [(southPole[0] + northPole[0]) / 2, (southPole[1] + northPole[1]) / 2, (southPole[2] + northPole[2]) / 2];
    const r = Math.hypot(...sub3(northPole, c));
    if (r > tol && pts.every((p) => Math.abs(Math.hypot(...sub3(p, c)) - r) < tol * 10)) {
      const z = unit3(sub3(northPole, southPole));
      const m = sub3(grid[0][N >> 1], c);
      const xdir = unit3(sub3(m, [z[0] * dot3(m, z), z[1] * dot3(m, z), z[2] * dot3(m, z)]));
      const t = sub3(grid[1][N >> 1], grid[0][N >> 1]);
      const axis: P3 = dot3(t, cross3(z, xdir)) >= 0 ? z : [-z[0], -z[1], -z[2]];
      return { kind: "sphere", origin: c, axis, xdir, radius: r };
    }
  }
  return null;
}

/** OpenCascade surface (and its parameter range) for an analytic match. */
function analyticSurface(a: Analytic): { surf: any; range: [number, number, number, number] | null } | null {
  const O = oc();
  try {
    const ax = (R as any).makeAx3(a.origin, a.kind === "plane" ? a.normal : a.axis, a.xdir);
    if (a.kind === "plane") {
      const face = new O.BRepBuilderAPI_MakeFace(new O.gp_Pln(ax)).Face();
      return { surf: O.BRep_Tool.Surface(face), range: null };
    }
    if (a.kind === "cylinder") return { surf: new O.Geom_CylindricalSurface(ax, a.radius), range: [0, 2 * Math.PI, -Infinity, Infinity] };
    return { surf: new O.Geom_SphericalSurface(ax, a.radius), range: [0, 2 * Math.PI, -Math.PI / 2, Math.PI / 2] };
  } catch {
    return null;
  }
}

const transpose = (s: NurbsSurface): NurbsSurface => ({
  degreeU: s.degreeV,
  degreeV: s.degreeU,
  knotsU: s.knotsV,
  knotsV: s.knotsU,
  poles: s.poles[0].map((_, j) => s.poles.map((row) => row[j])),
  weights: s.weights ? s.weights[0].map((_, j) => s.weights!.map((row) => row[j])) : undefined,
});

function buildFace(f: IgesFace, tol: number): any | null {
  const O = oc();
  const outer = f.outer ? loopOf(f.outer, tol) : null;
  let s = f.surface;
  if (f.planar) {
    const pl = outer && planeFor(outer);
    if (!pl) return null;
    s = pl;
  }
  if (!outer) {
    const mf = new O.BRepBuilderAPI_MakeFace(makeSurface(s), 1e-7);
    return mf.IsDone() ? mf.Face() : null;
  }
  // planes, cylinders and spheres become exact analytic surfaces again (measurable radii, clean planes)
  const an = recognize(s) ?? recognize(transpose(s));
  const as = an ? analyticSurface(an) : null;
  let surf: any, info: UVInfo;
  if (an && as) {
    surf = as.surf;
    const inf = 1e100;
    info =
      an.kind === "plane"
        ? { u0: -inf, u1: inf, v0: -inf, v1: inf, closedU: false, closedV: false, vPoles: [], uPoles: [] }
        : an.kind === "cylinder"
          ? { u0: 0, u1: 2 * Math.PI, v0: -inf, v1: inf, closedU: true, closedV: false, vPoles: [], uPoles: [] }
          : { u0: 0, u1: 2 * Math.PI, v0: -Math.PI / 2, v1: Math.PI / 2, closedU: true, closedV: false, vPoles: [-Math.PI / 2, Math.PI / 2], uPoles: [] };
  } else {
    surf = makeSurface(s);
    info = nurbsUV(s);
  }
  const ow = wireOnSurface(outer, surf, info);
  if (!ow) return null;
  // the wires are added to an empty face on the surface (the pcurves refer to it)
  // through the topology builder: the MakeFace(surface, wire) overload is not reachable from JS
  const nat = new O.BRepBuilderAPI_MakeFace(surf, -1, 1, -1, 1, 1e-7);
  if (!nat.IsDone()) return null;
  const face = O.TopoDS.Face(nat.Face().EmptyCopied());
  const bb = new O.TopoDS_Builder();
  bb.Add(face, ow.ccw ? ow.wire : ow.wire.Reversed());
  for (const inner of f.inner) {
    const iw = wireOnSurface(loopOf(inner, tol), surf, info);
    if (iw) bb.Add(face, iw.ccw ? iw.wire.Reversed() : iw.wire);
  }
  // wire orientation (outer / holes), connected vertices, degenerated edges at poles, tolerances
  const fix = new O.ShapeFix_Face(face);
  fix.Perform(progress());
  return fix.Face();
}

/** IGES model -> healed solids (or open shells) with names and colours. */
export function igesToShapes(model: IgesModel, tolerance = 0.01): { shapes: Shape[]; meta: BodyMeta[]; failedFaces: number; heal: HealReport[] } {
  const O = oc();
  const shapes: Shape[] = [], meta: BodyMeta[] = [], heal: HealReport[] = [];
  let failedFaces = 0;
  for (const b of model.bodies) {
    const builder = new O.TopoDS_Builder();
    const comp = new O.TopoDS_Compound();
    builder.MakeCompound(comp);
    let n = 0;
    for (const f of b.faces) {
      let face: any = null;
      try {
        face = buildFace(f, tolerance);
      } catch (e) {
        face = null;
      }
      if (!face) {
        failedFaces++;
        continue;
      }
      builder.Add(comp, face);
      n++;
    }
    if (!n) continue;
    const h = healShape(comp, tolerance);
    heal.push(h.report);
    const color = b.color ? `#${b.color.map((v) => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, "0")).join("")}` : undefined;
    h.shapes.forEach((s, i) => {
      shapes.push(s);
      meta.push({ name: h.shapes.length > 1 ? `${b.name}_${i + 1}` : b.name, color });
    });
  }
  return { shapes, meta, failedFaces, heal };
}
