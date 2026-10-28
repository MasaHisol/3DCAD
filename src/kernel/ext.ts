// Extended OpenCascade kernel (段階 1.5 #1).
//
// The main kernel (replicad-opencascadejs) is a trimmed build: it has no IGES
// translator, no XCAF STEP reader and no ShapeFix_Shape / ShapeFix_Shell. The
// full opencascade.js build (OCCT 7.6.2, ~50 MB wasm) has them, so it is loaded
// on demand, only when an operation needs it, as a second Emscripten module in
// the geometry worker. The two kernels have separate heaps: shapes cross as
// OCCT text BRep ("CASCADE Topology V3", read and written by both builds).
//
// Everything here takes and returns plain data (strings / numbers), so the
// module could move to its own worker without API changes. When the loader is
// not configured or fails (e.g. the asset is missing), `extKernel()` resolves
// to null and callers use the TypeScript fallbacks of stage 1.
/* eslint-disable @typescript-eslint/no-explicit-any */

export type Mat4 = number[];

/** A node of an XCAF assembly tree (STEP / IGES document). */
export interface XNode {
  /** Instance name (component label), else the product name. */
  name: string;
  /** Product (referred shape) name. */
  product: string;
  color?: string;
  /** Placement relative to the parent node (column-major 4x4). */
  matrix: Mat4;
  children: XNode[];
  /** Leaf: index into `XDoc.shapes` (the product shape in its own coordinates). */
  shape?: number;
}

export interface XDoc {
  roots: XNode[];
  /** Product shapes as BRep text, shared by all instances of a product. */
  shapes: string[];
}

export interface ExtHealResult {
  /** Closed solids and left-over open shells as BRep text. */
  solids: string[];
  shells: string[];
  tinyFaces: number;
  freeEdgesAfter: number;
}

type Loader = () => Promise<any>;

let loader: Loader | null = null;
let pending: Promise<ExtKernel | null> | null = null;
let loaded: ExtKernel | null = null;
let lastError = "";

/** Configures how the full build is loaded (null disables the extended kernel). */
export function setExtLoader(fn: Loader | null) {
  loader = fn;
  pending = null;
  loaded = null;
  lastError = "";
}

/** The extended kernel, loading it on first use; null when unavailable. */
export function extKernel(): Promise<ExtKernel | null> {
  if (!loader) return Promise.resolve(null);
  pending ??= loader()
    .then((oc) => (loaded = new ExtKernel(oc)))
    .catch((e) => {
      lastError = e instanceof Error ? e.message : String(e);
      console.warn("extended OpenCascade kernel unavailable:", lastError);
      return null;
    });
  return pending;
}

/** Already loaded extended kernel (no loading). */
export function extKernelIfLoaded(): ExtKernel | null {
  return loaded;
}

export function extKernelError(): string {
  return lastError;
}

const IDENTITY: Mat4 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

/** Quantity_Color is linear RGB; files and the UI use sRGB hex. */
function srgbHex(r: number, g: number, b: number): string {
  const enc = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
  return `#${[r, g, b].map((c) => Math.round(Math.min(1, Math.max(0, enc(c))) * 255).toString(16).padStart(2, "0")).join("")}`;
}

function linear(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const v = h.length === 3 ? h.split("").map((c) => parseInt(c + c, 16)) : [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return [lin(v[0] / 255), lin(v[1] / 255), lin(v[2] / 255)];
}

/** Embind returns the UTF-8 bytes of a C string as Latin-1 code units. */
function utf8(s: string): string {
  if (!/[\u0080-ÿ]/.test(s)) return s;
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(Uint8Array.from(s, (c) => c.charCodeAt(0)));
  } catch {
    return s;
  }
}

export class ExtKernel {
  private seq = 0;
  constructor(readonly oc: any) {
    oc.Interface_Static.SetCVal("xstep.cascade.unit", "MM");
  }

  private file(ext: string) {
    return `/ext_${++this.seq}_${Math.random().toString(36).slice(2)}.${ext}`;
  }
  private progress() {
    return new this.oc.Message_ProgressRange_1();
  }

  // ------------------------------------------------------------ BRep ---

  readBrep(text: string): any {
    const O = this.oc;
    const f = this.file("brep");
    O.FS.writeFile(f, text);
    try {
      const sh = new O.TopoDS_Shape();
      if (!O.BRepTools.Read_2(sh, f, new O.BRep_Builder(), this.progress())) throw new Error("BRep を読み込めませんでした");
      return sh;
    } finally {
      O.FS.unlink(f);
    }
  }

  writeBrep(shape: any): string {
    const O = this.oc;
    const f = this.file("brep");
    if (!O.BRepTools.Write_3(shape, f, this.progress())) throw new Error("BRep を書き出せませんでした");
    try {
      return O.FS.readFile(f, { encoding: "utf8" });
    } finally {
      O.FS.unlink(f);
    }
  }

  private explore(shape: any, kind: string): any[] {
    const O = this.oc;
    const out: any[] = [];
    const ex = new O.TopExp_Explorer_2(shape, O.TopAbs_ShapeEnum[kind], O.TopAbs_ShapeEnum.TopAbs_SHAPE);
    for (; ex.More(); ex.Next()) out.push(ex.Current());
    ex.delete();
    return out;
  }

  // ------------------------------------------------------------ XCAF ---

  private newDoc(): any {
    const O = this.oc;
    const doc = new O.Handle_TDocStd_Document_2(new O.TDocStd_Document(new O.TCollection_ExtendedString_1()));
    O.XCAFApp_Application.GetApplication().get().InitDocument(new O.Handle_CDM_Document_2(doc.get()));
    return doc;
  }

  private labelName(l: any): string {
    const O = this.oc;
    const h = new O.Handle_TDF_Attribute_1();
    if (!l.FindAttribute_1(O.TDataStd_Name.GetID(), h) || h.IsNull()) return "";
    const attr = h.get();
    if (typeof attr.Get !== "function") return "";
    return utf8(new O.TCollection_AsciiString_13(attr.Get(), 0).ToCString());
  }

  private labelColor(ct: any, l: any): string | undefined {
    const O = this.oc;
    const c = new O.Quantity_Color_1();
    for (const t of [O.XCAFDoc_ColorType.XCAFDoc_ColorSurf, O.XCAFDoc_ColorType.XCAFDoc_ColorGen])
      if (ct.GetColor_4(l, t, c)) return srgbHex(c.Red(), c.Green(), c.Blue());
    return undefined;
  }

  private trsfMatrix(t: any): Mat4 {
    const m = IDENTITY.slice();
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) m[c * 4 + r] = t.Value(r + 1, c + 1);
    return m;
  }

  /** Walks the free shapes of an XCAF document into a tree with shared product shapes. */
  private docTree(doc: any): XDoc {
    const O = this.oc;
    const main = doc.get().Main();
    const st = O.XCAFDoc_DocumentTool.ShapeTool(main).get();
    const ct = O.XCAFDoc_DocumentTool.ColorTool(main).get();
    const shapes: string[] = [];
    const shapeOf = new Map<number, number>();
    const productColor = (ref: any): string | undefined => {
      const own = this.labelColor(ct, ref);
      if (own) return own;
      // colour on the product's solids (sub-shape labels) or on the shape itself
      const subs = new O.TDF_LabelSequence_1();
      if (O.XCAFDoc_ShapeTool.GetSubShapes(ref, subs))
        for (let i = 1; i <= subs.Length(); i++) {
          const c = this.labelColor(ct, subs.Value(i));
          if (c) return c;
        }
      const c = new O.Quantity_Color_1();
      const sh = O.XCAFDoc_ShapeTool.GetShape_2(ref);
      for (const t of [O.XCAFDoc_ColorType.XCAFDoc_ColorSurf, O.XCAFDoc_ColorType.XCAFDoc_ColorGen])
        if (ct.GetColor_7(sh, t, c)) return srgbHex(c.Red(), c.Green(), c.Blue());
      return undefined;
    };
    const walk = (l: any, depth: number): XNode => {
      let ref = l;
      const isRef = O.XCAFDoc_ShapeTool.IsReference(l);
      if (isRef) {
        ref = new O.TDF_Label();
        O.XCAFDoc_ShapeTool.GetReferredShape(l, ref);
      }
      const product = this.labelName(ref);
      const node: XNode = {
        name: (isRef ? this.labelName(l) : "") || product,
        product,
        color: (isRef ? this.labelColor(ct, l) : undefined) ?? productColor(ref),
        matrix: isRef ? this.trsfMatrix(O.XCAFDoc_ShapeTool.GetLocation(l).Transformation()) : IDENTITY.slice(),
        children: [],
      };
      if (O.XCAFDoc_ShapeTool.IsAssembly(ref) && depth < 64) {
        const seq = new O.TDF_LabelSequence_1();
        O.XCAFDoc_ShapeTool.GetComponents(ref, seq, false);
        for (let i = 1; i <= seq.Length(); i++) node.children.push(walk(seq.Value(i), depth + 1));
      } else {
        const tag = ref.Tag();
        let si = shapeOf.get(tag);
        if (si === undefined) {
          si = shapes.length;
          shapes.push(this.writeBrep(O.XCAFDoc_ShapeTool.GetShape_2(ref)));
          shapeOf.set(tag, si);
        }
        node.shape = si;
      }
      return node;
    };
    const free = new O.TDF_LabelSequence_1();
    st.GetFreeShapes(free);
    const roots: XNode[] = [];
    for (let i = 1; i <= free.Length(); i++) roots.push(walk(free.Value(i), 0));
    return { roots, shapes };
  }

  /** STEP through STEPCAFControl_Reader: names, colours and the full assembly tree. */
  readStepXcaf(text: string): XDoc {
    const O = this.oc;
    const f = this.file("step");
    O.FS.writeFile(f, text);
    try {
      const doc = this.newDoc();
      const r = new O.STEPCAFControl_Reader_1();
      r.SetColorMode(true);
      r.SetNameMode(true);
      r.SetLayerMode(true);
      if (r.ReadFile(f) !== O.IFSelect_ReturnStatus.IFSelect_RetDone) throw new Error("STEP ファイルを読み込めませんでした");
      if (!r.Transfer_1(doc, this.progress())) throw new Error("STEP の形状を変換できませんでした");
      return this.docTree(doc);
    } finally {
      O.FS.unlink(f);
    }
  }

  /** IGES through IGESCAFControl_Reader (names, colours, unit conversion to mm). */
  readIges(text: string): XDoc {
    const O = this.oc;
    const f = this.file("igs");
    O.FS.writeFile(f, text);
    try {
      const doc = this.newDoc();
      const r = new O.IGESCAFControl_Reader_1();
      r.SetColorMode(true);
      r.SetNameMode(true);
      r.SetLayerMode(true);
      if (r.ReadFile(f) !== O.IFSelect_ReturnStatus.IFSelect_RetDone) throw new Error("IGES ファイルを読み込めませんでした");
      if (!r.Transfer(doc, this.progress())) throw new Error("IGES の形状を変換できませんでした");
      return this.docTree(doc);
    } finally {
      O.FS.unlink(f);
    }
  }

  /**
   * IGES 5.3 through IGESCAFControl_Writer. `brep` writes solids as MSBO
   * (type 186, BRep mode); otherwise trimmed surfaces (type 144, the most
   * widely readable form).
   */
  writeIges(bodies: { brep: string; name: string; color?: string }[], opts: { brep?: boolean; author?: string } = {}): string {
    const O = this.oc;
    O.Interface_Static.SetCVal("write.iges.unit", "MM");
    O.Interface_Static.SetIVal("write.iges.brep.mode", opts.brep ? 1 : 0);
    O.Interface_Static.SetCVal("write.iges.header.author", opts.author ?? "3DCAD Studio");
    O.Interface_Static.SetCVal("write.iges.header.company", "");
    const doc = this.newDoc();
    const main = doc.get().Main();
    O.XCAFDoc_ShapeTool.SetAutoNaming(false);
    const st = O.XCAFDoc_DocumentTool.ShapeTool(main).get();
    const ct = O.XCAFDoc_DocumentTool.ColorTool(main).get();
    for (const b of bodies) {
      const l = st.AddShape(this.readBrep(b.brep), false, false);
      O.TDataStd_Name.Set_1(l, new O.TCollection_ExtendedString_2(b.name, true));
      if (b.color) {
        const [r, g, bl] = linear(b.color);
        ct.SetColor_2(l, new O.Quantity_Color_3(r, g, bl, O.Quantity_TypeOfColor.Quantity_TOC_RGB), O.XCAFDoc_ColorType.XCAFDoc_ColorSurf);
      }
    }
    const w = new O.IGESCAFControl_Writer_1();
    w.SetColorMode(true);
    w.SetNameMode(true);
    w.SetLayerMode(true);
    if (!w.Transfer_1(doc, this.progress())) throw new Error("IGES の書き出しに失敗しました");
    w.ComputeModel();
    const f = this.file("igs");
    if (!w.Write_2(f, false)) throw new Error("IGES の書き出しに失敗しました");
    try {
      return O.FS.readFile(f, { encoding: "utf8" });
    } finally {
      O.FS.unlink(f);
    }
  }

  // --------------------------------------------------------- healing ---

  private area(shape: any): number {
    const p = new this.oc.GProp_GProps_1();
    this.oc.BRepGProp.SurfaceProperties_1(shape, p, false, false);
    return p.Mass();
  }
  private volume(shape: any): number {
    const p = new this.oc.GProp_GProps_1();
    this.oc.BRepGProp.VolumeProperties_1(shape, p, false, false, false);
    return p.Mass();
  }

  /**
   * Standard OCCT repair: drop tiny faces, sew, ShapeFix_Shape (wires, faces,
   * shells: orientation, small edges, gaps, pcurves, tolerances), close shells
   * into solids (ShapeFix_Solid), fix inside-out solids and merge same-domain
   * faces.
   */
  heal(brep: string, tolerance = 0.01): ExtHealResult {
    const O = this.oc;
    const input = this.readBrep(brep);
    const minArea = tolerance * tolerance;
    let tinyFaces = 0;
    const sew = new O.BRepBuilderAPI_Sewing(tolerance, true, true, true, false);
    sew.SetMaxTolerance(tolerance * 10);
    for (const f of this.explore(input, "TopAbs_FACE")) {
      if (this.area(f) < minArea) {
        tinyFaces++;
        continue;
      }
      sew.Add(f);
    }
    sew.Perform(this.progress());
    const freeEdgesAfter = sew.NbFreeEdges();
    const fixShape = (s: any) => {
      const fx = new O.ShapeFix_Shape_2(s);
      fx.SetPrecision(tolerance * 0.1);
      fx.SetMaxTolerance(tolerance);
      fx.Perform(this.progress());
      return fx.Shape();
    };
    const fixed = fixShape(sew.SewedShape());
    const solids: string[] = [], shells: string[] = [];
    const shellList = this.explore(fixed, "TopAbs_SHELL");
    // a single face that is not part of a shell (e.g. a closed sphere face)
    if (!shellList.length)
      for (const f of this.explore(fixed, "TopAbs_FACE")) {
        const b = new O.BRep_Builder();
        const sh = new O.TopoDS_Shell();
        b.MakeShell(sh);
        b.Add(sh, f);
        shellList.push(sh);
      }
    for (const s of shellList) {
      const shell = O.TopoDS.Shell_1(s);
      if (!O.BRep_Tool.IsClosed_1(shell)) {
        shells.push(this.writeBrep(shell));
        continue;
      }
      try {
        const fs = new O.ShapeFix_Solid_1();
        fs.SetPrecision(tolerance * 0.1);
        fs.SetMaxTolerance(tolerance);
        let out = fixShape(fs.SolidFromShell(shell));
        try {
          const up = new O.ShapeUpgrade_UnifySameDomain_2(out, true, true, false);
          up.SetLinearTolerance(tolerance * 0.1);
          up.Build();
          out = up.Shape();
        } catch {
          /* keep */
        }
        for (const so of this.explore(out, "TopAbs_SOLID")) solids.push(this.writeBrep(this.volume(so) < 0 ? so.Reversed() : so));
      } catch {
        shells.push(this.writeBrep(shell));
      }
    }
    return { solids, shells, tinyFaces, freeEdgesAfter };
  }

  /**
   * Face on a surface bounded by a wire: the MakeFace(Geom_Surface, wire)
   * overload the main kernel cannot reach. The surface is taken from `faceBrep`
   * (any face on it); the wire needs 3D curves only, pcurves are added.
   */
  trimmedFace(faceBrep: string, wireBrep: string, holes: string[] = []): string {
    const O = this.oc;
    const surf = O.BRep_Tool.Surface_2(O.TopoDS.Face_1(this.readBrep(faceBrep)));
    const outer = O.TopoDS.Wire_1(this.explore(this.readBrep(wireBrep), "TopAbs_WIRE")[0]);
    const mf = new O.BRepBuilderAPI_MakeFace_21(surf, outer, true);
    if (!mf.IsDone()) throw new Error("トリム面を作成できませんでした");
    for (const h of holes) mf.Add(O.TopoDS.Wire_1(this.explore(this.readBrep(h), "TopAbs_WIRE")[0]));
    const fix = new O.ShapeFix_Face_2(mf.Face());
    fix.Perform();
    return this.writeBrep(fix.Face());
  }
}

/** Product placement of every leaf: composed matrices and instance paths. */
export function xdocLeaves(doc: XDoc): { node: XNode; matrix: Mat4; path: string[] }[] {
  const out: { node: XNode; matrix: Mat4; path: string[] }[] = [];
  const mul = (a: Mat4, b: Mat4): Mat4 => {
    const r = new Array(16).fill(0);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) for (let k = 0; k < 4; k++) r[j * 4 + i] += a[k * 4 + i] * b[j * 4 + k];
    return r;
  };
  const rec = (n: XNode, m: Mat4, path: string[]) => {
    const mm = mul(m, n.matrix);
    const p = [...path, n.name];
    if (n.shape !== undefined) out.push({ node: n, matrix: mm, path: p });
    for (const c of n.children) rec(c, mm, p);
  };
  for (const r of doc.roots) rec(r, IDENTITY, []);
  return out;
}
