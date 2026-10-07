import { evaluateParams, nextParamName } from "./params";
import { Store } from "./store";
import type { Feature, FeatureType, Parameter, ParamUnit, PartDocument, PlaneDef } from "./types";

export const ORIGIN_PLANES: Record<"YZ" | "XZ" | "XY", PlaneDef> = {
  YZ: { origin: [0, 0, 0], xDir: [0, 0, -1], normal: [1, 0, 0] },
  XZ: { origin: [0, 0, 0], xDir: [1, 0, 0], normal: [0, 1, 0] },
  XY: { origin: [0, 0, 0], xDir: [1, 0, 0], normal: [0, 0, 1] },
};

export const FEATURE_LABELS: Record<FeatureType, string> = {
  sketch: "スケッチ",
  extrude: "押し出し",
  revolve: "回転",
  loft: "ロフト",
  sweep: "スイープ",
  pushpull: "プレス/プル",
  thread: "ねじ",
  sheetFace: "面",
  flange: "フランジ",
  fillet: "フィレット",
  chamfer: "面取り",
  shell: "シェル",
  hole: "穴",
  rectPattern: "矩形状パターン",
  circPattern: "円形状パターン",
  mirror: "ミラー",
  box: "直方体",
  cylinder: "円柱",
  sphere: "球",
  torus: "トーラス",
  workplane: "作業平面",
  import: "インポート",
  move: "ボディを移動",
};

export const MATERIALS = [
  { name: "汎用", density: 1.0, color: "#c9ced6" },
  { name: "鋼", density: 7.85, color: "#b9bec5" },
  { name: "ステンレス鋼", density: 8.0, color: "#d0d4d8" },
  { name: "アルミニウム 6061", density: 2.7, color: "#d6dae0" },
  { name: "黄銅", density: 8.47, color: "#d8b45a" },
  { name: "銅", density: 8.96, color: "#c8794a" },
  { name: "チタン", density: 4.51, color: "#a7a9ad" },
  { name: "ABS 樹脂", density: 1.05, color: "#e8e4da" },
  { name: "ナイロン 6/6", density: 1.14, color: "#efeee6" },
  { name: "ポリカーボネート", density: 1.2, color: "#a9c8e8" },
  { name: "ゴム", density: 1.1, color: "#3a3a3c" },
  { name: "木材 (パイン)", density: 0.5, color: "#d9b77e" },
];

export function newDocument(name = "パーツ1"): PartDocument {
  return {
    format: "3dcad-part",
    version: 1,
    name,
    units: "mm",
    params: [],
    features: [],
    endOfPart: 0,
    material: { ...MATERIALS[0] },
    iprops: { パーツ番号: name, 説明: "", 設計者: "", 作成日: new Date().toISOString().slice(0, 10) },
  };
}

/** Sketches a feature consumes (profile, path, loft sections). */
export function featureSketchRefs(f: Feature): string[] {
  const out: string[] = [];
  const fx = f as unknown as { sketch?: string; path?: string; sketches?: string[] };
  if (fx.sketch) out.push(fx.sketch);
  if (fx.path) out.push(fx.path);
  if (Array.isArray(fx.sketches)) out.push(...fx.sketches);
  return out;
}

let idCounter = 0;
export function uid(prefix = "f"): string {
  idCounter++;
  return `${prefix}${Date.now().toString(36)}${idCounter.toString(36)}${Math.floor(Math.random() * 1296).toString(36)}`;
}

/** The part document store (undo/redo + part-specific helpers). */
export class DocumentStore extends Store<PartDocument> {
  constructor(doc?: PartDocument) {
    super(doc ?? newDocument());
  }

  load(doc: PartDocument) {
    if (doc.format !== "3dcad-part") throw new Error("サポートされていないファイル形式です");
    this.reset(doc, "load");
  }

  // ------------------------------------------------------------- helpers ---

  feature<T extends Feature = Feature>(id: string): T | undefined {
    return this.doc.features.find((f) => f.id === id) as T | undefined;
  }

  nextFeatureName(type: FeatureType): string {
    const base = FEATURE_LABELS[type];
    const used = new Set(this.doc.features.map((f) => f.name));
    let i = 1;
    while (used.has(`${base}${i}`)) i++;
    return `${base}${i}`;
  }

  /** Creates a model parameter (d0, d1, ...) and returns its name. */
  addParam(doc: PartDocument, expr: string, unit: ParamUnit, owner: string, comment?: string): string {
    const name = nextParamName(doc.params);
    doc.params.push({ name, expr, unit, kind: "model", owner, comment });
    return name;
  }

  param(name: string): Parameter | undefined {
    return this.doc.params.find((p) => p.name === name);
  }

  paramValues(): Map<string, number> {
    return evaluateParams(this.doc.params);
  }

  /** Features that reference the given feature (consumers). */
  dependents(id: string): Feature[] {
    return this.doc.features.filter((f) => {
      if (f.id === id) return false;
      const fx = f as unknown as Record<string, unknown>;
      if (featureSketchRefs(f).includes(id)) return true;
      if (Array.isArray(fx.features) && (fx.features as string[]).includes(id)) return true;
      return false;
    });
  }

  /** Removes features (and their owned parameters). */
  removeFeatures(doc: PartDocument, ids: string[]) {
    const set = new Set(ids);
    const idx = doc.features.map((f, i) => (set.has(f.id) ? i : -1)).filter((i) => i >= 0);
    doc.features = doc.features.filter((f) => !set.has(f.id));
    doc.endOfPart -= idx.filter((i) => i < doc.endOfPart).length;
    doc.endOfPart = Math.max(0, Math.min(doc.endOfPart, doc.features.length));
    doc.params = doc.params.filter((p) => !(p.owner && set.has(p.owner)));
    for (const f of doc.features) {
      const fx = f as unknown as Record<string, unknown>;
      if (Array.isArray(fx.features)) fx.features = (fx.features as string[]).filter((x) => !set.has(x));
      if (Array.isArray(fx.sketches)) fx.sketches = (fx.sketches as string[]).filter((x) => !set.has(x));
    }
  }

  /** Inserts a feature at the end-of-part marker (Inventor behaviour). */
  insertFeature(doc: PartDocument, f: Feature) {
    doc.features.splice(doc.endOfPart, 0, f);
    doc.endOfPart++;
  }
}
