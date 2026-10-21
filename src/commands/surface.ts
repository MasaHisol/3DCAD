// Surface modelling commands (サーフェス タブ): extrude / revolve / loft
// surfaces, boundary patch, trim, stitch, offset, plus the zebra and
// curvature displays.

import type { App } from "../app";
import { ORIGIN_PLANES, uid } from "../core/document";
import { isSurfaceFeature, sketchWires, surfaceBase } from "../core/surfaceResolve";
import type {
  BoolOp,
  EdgeRef,
  Feature,
  SketchFeature,
  SkLine,
  SurfExtrudeFeature,
  SurfLoftFeature,
  SurfOffsetFeature,
  SurfPatchFeature,
  SurfRevolveFeature,
  SurfStitchFeature,
  SurfTrimFeature,
  SurfTrimTool,
  Vec3,
  WorkAxisFeature,
  WorkPlaneFeature,
} from "../core/types";
import { h, toast } from "../ui/dom";
import type { PropertyPanel } from "../ui/panel";
import type { Pick } from "../viewer/viewport";
import { curvatureColors } from "../viewer/surfaceAnalysis";
import { FeatureCommand, type Command } from "./command";

const OPS = [
  { value: "new", icon: "newSolid", title: "新しいソリッド" },
  { value: "join", icon: "join", title: "接合" },
  { value: "cut", icon: "cut", title: "切り取り" },
  { value: "intersect", icon: "intersect", title: "交差" },
];

const dist3 = (a: Vec3, b: Vec3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

/** Sketches before the feature that have curves usable for surfaces (open or closed). */
function curveSketches(app: App, beforeId?: string): SketchFeature[] {
  const doc = app.store.doc;
  const limit = beforeId ? doc.features.findIndex((f) => f.id === beforeId) : doc.endOfPart;
  return doc.features.filter((f, i): f is SketchFeature => f.type === "sketch" && i < (limit < 0 ? doc.endOfPart : limit) && sketchWires(f).length > 0);
}

/** Surface-producing features before `beforeId` (candidates for trim / stitch / offset / thicken). */
export function surfaceSources(app: App, beforeId?: string): Feature[] {
  const doc = app.store.doc;
  const limit = beforeId ? doc.features.findIndex((f) => f.id === beforeId) : doc.endOfPart;
  return doc.features.filter((f, i) => i < (limit < 0 ? doc.endOfPart : limit) && !f.suppressed && isSurfaceFeature(f));
}

/** Surface key of the surface body under a pick, if any: a feature id, or "<pattern id>#<n>" for a pattern / mirror copy. */
export function pickedSurface(app: App, p: Pick | null): string | null {
  if (!p || p.body < 0) return null;
  const id = app.pickBodies[p.body]?.surface;
  return id && app.store.feature(surfaceBase(id)) ? id : null;
}

/** Display name of a surface key ("ミラー1 #2" for pattern / mirror copies). */
export function surfaceLabel(app: App, key: string): string {
  const base = surfaceBase(key);
  const name = app.store.feature(base)?.name ?? base;
  return key === base ? name : `${name} ${key.slice(base.length)}`;
}

/**
 * Surfaces available before `beforeId`: surface features plus the surface
 * copies made by patterns / mirrors (taken from the pick model, which holds the
 * state before the edited feature).
 */
export function surfaceChoices(app: App, beforeId?: string): { id: string; name: string }[] {
  const out = surfaceSources(app, beforeId).map((s) => ({ id: s.id, name: s.name }));
  const doc = app.store.doc;
  const limit = beforeId ? doc.features.findIndex((f) => f.id === beforeId) : doc.endOfPart;
  const before = new Set(doc.features.slice(0, limit < 0 ? doc.endOfPart : limit).map((f) => f.id));
  for (const b of app.pickBodies) {
    const k = b.surface;
    if (k && k !== surfaceBase(k) && before.has(surfaceBase(k)) && !out.some((o) => o.id === k)) out.push({ id: k, name: surfaceLabel(app, k) });
  }
  return out;
}

/** Highlight whole surface bodies (by surface key) on the pick model. */
export function surfacePicks(app: App, ids: string[]): Pick[] {
  const out: Pick[] = [];
  app.pickBodies.forEach((b, bi) => {
    if (b.surface && ids.includes(b.surface)) b.faces.forEach((f, fi) => out.push({ kind: "face", body: bi, index: fi, point: f.center }));
  });
  return out;
}

function defaultSketch(app: App, list: SketchFeature[]): string {
  const sel = [...app.browserSelection].find((id) => list.some((s) => s.id === id));
  return sel ?? list[list.length - 1]?.id ?? "";
}

// ------------------------------------------------------------ extrude ---

class SurfExtrudeCommand extends FeatureCommand<SurfExtrudeFeature> {
  readonly id = "surfExtrude";
  constructor(app: App, existing: SurfExtrudeFeature | null) {
    const sks = curveSketches(app, existing?.id);
    super(app, existing, () => {
      const id = uid("se");
      return { id, type: "surfExtrude", name: app.store.nextFeatureName("surfExtrude"), sketch: defaultSketch(app, sks), extent: "distance", distance: app.store.addParam(app.store.doc, "10", "mm", id), flip: false };
    });
    const f = this.feature;
    this.openPanel(this.editing ? `押し出しサーフェス: ${f.name}` : "押し出しサーフェス", "surfExtrude", true);
    const p = this.panel;
    const sec = p.section("プロファイル");
    sketchSelect(p, sec, sks, f.sketch, (v) => this.update((x) => (x.sketch = v)));
    p.note(sec, "開いた曲線・閉じた輪郭のどちらも使えます (閉じた輪郭はふたのない筒状のサーフェスになります)。");
    const ext = p.section("範囲");
    p.select(ext, "範囲", [{ value: "distance", label: "距離" }, { value: "symmetric", label: "対称" }], f.extent, (v) => this.update((x) => (x.extent = v as SurfExtrudeFeature["extent"])));
    p.expr(ext, "距離", this.expr(f.distance), "mm", (e) => this.setParam(this.feature.distance, e), f.distance);
    p.checkbox(ext, "方向を反転", f.flip, (v) => this.update((x) => (x.flip = v)));
    app.status("押し出すスケッチを選択 (ブラウザでも選択できます)");
  }
  onBrowserSelect(id: string): boolean {
    if (this.app.store.feature(id)?.type === "sketch") this.update((x) => (x.sketch = id));
    return true;
  }
}

function sketchSelect(p: PropertyPanel, sec: HTMLElement, sks: SketchFeature[], value: string, onChange: (v: string) => void) {
  const opts = sks.map((s) => ({ value: s.id, label: s.name }));
  if (!opts.length) opts.push({ value: "", label: "(曲線のあるスケッチがありません)" });
  return p.select(sec, "スケッチ", opts, value, onChange);
}

// ------------------------------------------------------------ revolve ---

class SurfRevolveCommand extends FeatureCommand<SurfRevolveFeature> {
  readonly id = "surfRevolve";
  private axisSel!: HTMLSelectElement;
  constructor(app: App, existing: SurfRevolveFeature | null) {
    const sks = curveSketches(app, existing?.id);
    super(app, existing, () => {
      const id = uid("sr");
      return { id, type: "surfRevolve", name: app.store.nextFeatureName("surfRevolve"), sketch: defaultSketch(app, sks), axis: "Y", extent: "full", angle: app.store.addParam(app.store.doc, "180", "deg", id), flip: false };
    });
    const f = this.feature;
    this.openPanel(this.editing ? `回転サーフェス: ${f.name}` : "回転サーフェス", "surfRevolve", true);
    const p = this.panel;
    const sec = p.section("プロファイル");
    sketchSelect(p, sec, sks, f.sketch, (v) => {
      this.update((x) => (x.sketch = v));
      this.fillAxes();
    });
    const axRow = h("div");
    sec.appendChild(axRow);
    this.axisSel = p.select(axRow, "回転軸", [], f.axis, (v) => this.update((x) => (x.axis = v)));
    this.fillAxes();
    p.note(sec, "軸に選んだスケッチ線分はプロファイルから除かれます。");
    const ext = p.section("範囲");
    p.checkbox(ext, "全周 (360°)", f.extent === "full", (v) => this.update((x) => (x.extent = v ? "full" : "angle")));
    p.expr(ext, "角度", this.expr(f.angle), "deg", (e) => this.setParam(this.feature.angle, e), f.angle);
    p.checkbox(ext, "方向を反転", f.flip, (v) => this.update((x) => (x.flip = v)));
    app.status("回転するスケッチと軸を選択");
  }
  private fillAxes() {
    const sk = this.app.store.feature<SketchFeature>(this.feature.sketch);
    const opts = [
      { value: "X", label: "スケッチの X 軸" },
      { value: "Y", label: "スケッチの Y 軸" },
      ...(sk?.entities.filter((e): e is SkLine => e.type === "line") ?? []).map((l, i) => ({ value: l.id, label: `線分 ${i + 1}${l.construction ? " (補助線)" : ""}` })),
      ...this.app.store.doc.features.filter((x): x is WorkAxisFeature => x.type === "workaxis").map((w) => ({ value: `wa:${w.id}`, label: w.name })),
    ];
    this.axisSel.innerHTML = "";
    for (const o of opts) this.axisSel.appendChild(h("option", { value: o.value, selected: o.value === this.feature.axis }, o.label));
    if (!opts.some((o) => o.value === this.feature.axis)) this.update((x) => (x.axis = "Y"));
  }
}

// --------------------------------------------------------------- loft ---

class SurfLoftCommand extends FeatureCommand<SurfLoftFeature> {
  readonly id = "surfLoft";
  private list!: HTMLElement;
  private pick!: ReturnType<PropertyPanel["picker"]>;
  constructor(app: App, existing: SurfLoftFeature | null) {
    const sks = curveSketches(app, existing?.id);
    super(app, existing, () => ({
      id: uid("sl"),
      type: "surfLoft",
      name: app.store.nextFeatureName("surfLoft"),
      sketches: [...app.browserSelection].filter((id) => sks.some((s) => s.id === id)),
      ruled: false,
    }));
    this.openPanel(this.editing ? `ロフトサーフェス: ${this.feature.name}` : "ロフトサーフェス", "surfLoft", true);
    const p = this.panel;
    const sec = p.section("断面");
    this.pick = p.picker(sec, "断面", "sketch", () => {}, () => (this.update((x) => (x.sketches = [])), this.refresh()));
    this.pick.setActive(true);
    p.select(sec, "断面を追加", [{ value: "", label: "スケッチを選択…" }, ...sks.map((s) => ({ value: s.id, label: s.name }))], "", (v) => v && this.toggle(v));
    this.list = h("ol", { class: "pp-list" });
    sec.appendChild(this.list);
    p.note(sec, "断面のスケッチを順に追加します (ブラウザのクリックでも追加 / 削除)。各スケッチの最初の閉じた輪郭 (なければ最初の曲線) を通るサーフェスを作ります。");
    const opt = p.section("オプション");
    p.checkbox(opt, "ルールド (直線で接続)", this.feature.ruled, (v) => this.update((x) => (x.ruled = v)));
    this.refresh();
    app.status("断面にするスケッチを順に追加");
  }
  onBrowserSelect(id: string): boolean {
    if (this.app.store.feature(id)?.type === "sketch") this.toggle(id);
    return true;
  }
  private toggle(id: string) {
    this.update((x) => {
      const k = x.sketches.indexOf(id);
      if (k >= 0) x.sketches.splice(k, 1);
      else x.sketches.push(id);
    });
    this.refresh();
  }
  private refresh() {
    const names = this.feature.sketches.map((id) => this.app.store.feature(id)?.name ?? "?");
    this.pick.setCount(names.length, names.length ? `${names.length} 断面` : "選択してください");
    this.list.innerHTML = "";
    names.forEach((n) => this.list.appendChild(h("li", {}, n)));
  }
}

// -------------------------------------------------------------- patch ---

class SurfPatchCommand extends FeatureCommand<SurfPatchFeature> {
  readonly id = "surfPatch";
  private pick!: ReturnType<PropertyPanel["picker"]>;
  constructor(app: App, existing: SurfPatchFeature | null) {
    const sks = curveSketches(app, existing?.id);
    super(app, existing, () => ({ id: uid("sp"), type: "surfPatch", name: app.store.nextFeatureName("surfPatch"), edges: [] }));
    const f = this.feature;
    this.openPanel(this.editing ? `境界パッチ: ${f.name}` : "境界パッチ", "surfPatch", true);
    const p = this.panel;
    const sec = p.section("境界");
    p.select(sec, "境界の種類", [{ value: "", label: "モデルのエッジ (閉じたループ)" }, ...sks.map((s) => ({ value: s.id, label: `スケッチ: ${s.name}` }))], f.sketch ?? "", (v) =>
      this.update((x) => {
        if (v) x.sketch = v;
        else delete x.sketch;
      }),
    );
    this.pick = p.picker(sec, "エッジ", "fillet", () => {}, () => (this.update((x) => (x.edges = [])), this.sync()));
    this.pick.setActive(true);
    p.note(sec, "ソリッドやサーフェスのエッジを、閉じたループになるようにクリックします。平らなループは平面、そうでないループは滑らかな曲面 (N 辺フィリング) で埋めます。");
    app.vp.pickKinds = new Set(["edge"]);
    app.vp.pickFilter = null;
    this.handler = {
      cursor: "pointer",
      onPointerMove: (e, vp) => vp.setHover(vp.pick(e)),
      onPointerDown: (e, vp) => {
        if (e.button !== 0) return;
        const pk = vp.pick(e);
        const r = pk && app.edgeRef(pk);
        if (!r) return;
        this.update((x) => {
          const k = x.edges.findIndex((q) => dist3(q.mid, r.mid) < 1e-6);
          if (k >= 0) x.edges.splice(k, 1);
          else x.edges.push(r);
        });
        this.sync();
      },
    };
    this.sync();
    app.status("境界のエッジをクリック (またはスケッチを選択)");
  }
  private sync() {
    const refs = this.feature.edges;
    const sel: Pick[] = [];
    this.app.pickBodies.forEach((b, bi) =>
      b.edges.forEach((e, ei) => {
        if (refs.some((r: EdgeRef) => dist3(r.mid, e.mid) < 1e-4)) sel.push({ kind: "edge", body: bi, index: ei, point: e.mid });
      }),
    );
    this.app.vp.setSelection(sel);
    this.pick.setCount(refs.length, refs.length ? `${refs.length} エッジ` : "エッジを選択");
  }
  captureBefore() {
    return this.featureId;
  }
  onRegen() {
    super.onRegen();
    this.sync();
  }
}

// --------------------------------------------- shared: one surface input ---

abstract class OneSurfaceCommand<F extends SurfTrimFeature | SurfOffsetFeature> extends FeatureCommand<F> {
  protected surfSel!: HTMLSelectElement;
  protected setupSurfacePick(sec: HTMLElement, label: string) {
    const opts = surfaceChoices(this.app, this.featureId).map((s) => ({ value: s.id, label: s.name }));
    if (this.feature.surface && !opts.some((o) => o.value === this.feature.surface)) opts.push({ value: this.feature.surface, label: surfaceLabel(this.app, this.feature.surface) });
    this.surfSel = this.panel.select(sec, label, [{ value: "", label: "サーフェスをクリック…" }, ...opts], this.feature.surface, (v) => this.setSurface(v));
    this.app.vp.pickKinds = new Set(["face"]);
    this.app.vp.pickFilter = (pk) => !!this.app.pickBodies[pk.body]?.surface;
    this.handler = {
      cursor: "pointer",
      onPointerMove: (e, vp) => vp.setHover(vp.pick(e)),
      onPointerDown: (e, vp) => {
        if (e.button !== 0) return;
        const id = pickedSurface(this.app, vp.pick(e));
        if (id && id !== this.featureId) this.onSurfacePicked(id);
      },
    };
  }
  protected onSurfacePicked(id: string) {
    this.setSurface(id);
  }
  protected setSurface(id: string) {
    this.update((x) => (x.surface = id));
    this.surfSel.value = id;
    this.sync();
  }
  protected sync() {
    this.app.vp.setSelection(surfacePicks(this.app, [this.feature.surface]));
  }
  captureBefore() {
    return this.featureId;
  }
  onRegen() {
    super.onRegen();
    this.sync();
  }
}

// --------------------------------------------------------------- trim ---

const toolKey = (t: SurfTrimTool) => (t.kind === "origin" ? `origin:${t.key}` : t.kind === "workplane" ? `wp:${t.id}` : t.kind === "sketch" ? `sk:${t.sketch}` : `sf:${t.id}`);

class SurfTrimCommand extends OneSurfaceCommand<SurfTrimFeature> {
  readonly id = "surfTrim";
  private toolSel!: HTMLSelectElement;
  private pickTool = false;
  constructor(app: App, existing: SurfTrimFeature | null) {
    super(app, existing, () => ({ id: uid("st"), type: "surfTrim", name: app.store.nextFeatureName("surfTrim"), surface: surfaceSources(app).slice(-1)[0]?.id ?? "", tool: { kind: "origin", key: "YZ" }, flip: false }));
    const f = this.feature;
    this.openPanel(this.editing ? `トリム: ${f.name}` : "サーフェスをトリム", "surfTrim", true);
    const p = this.panel;
    const sec = p.section("サーフェス");
    this.setupSurfacePick(sec, "トリムするサーフェス");
    const tool = p.section("トリム ツール");
    const opts = [
      { value: "origin:YZ", label: "YZ 平面" },
      { value: "origin:XZ", label: "XZ 平面" },
      { value: "origin:XY", label: "XY 平面" },
      ...app.store.doc.features.filter((x): x is WorkPlaneFeature => x.type === "workplane").map((w) => ({ value: `wp:${w.id}`, label: w.name })),
      ...curveSketches(app, this.featureId).filter((s) => (app.sketchState(s.id)?.regions.length ?? 0) > 0).map((s) => ({ value: `sk:${s.id}`, label: `スケッチ: ${s.name} (輪郭を投影)` })),
      ...surfaceChoices(app, this.featureId).map((s) => ({ value: `sf:${s.id}`, label: `サーフェス: ${s.name}` })),
    ];
    this.toolSel = p.select(tool, "ツール", opts, toolKey(f.tool), (v) => this.setTool(v));
    p.checkbox(tool, "反対側を残す", f.flip, (v) => this.update((x) => (x.flip = v)));
    p.checkbox(tool, "クリックでツールのサーフェスを選ぶ", false, (v) => (this.pickTool = v));
    p.note(tool, "平面 / サーフェス: 法線の正の側を残します。スケッチ: 輪郭をスケッチ平面の法線方向に投影し、内側を残します。");
    this.sync();
    app.status("トリムするサーフェスをクリックし、ツール (平面・スケッチ・サーフェス) を選択");
  }
  protected onSurfacePicked(id: string) {
    if (this.pickTool && id !== this.feature.surface) {
      this.setTool(`sf:${id}`);
      this.toolSel.value = `sf:${id}`;
    } else this.setSurface(id);
  }
  private setTool(v: string) {
    const [k, rest] = [v.slice(0, v.indexOf(":")), v.slice(v.indexOf(":") + 1)];
    const t: SurfTrimTool =
      k === "origin" ? { kind: "origin", key: rest as keyof typeof ORIGIN_PLANES } : k === "wp" ? { kind: "workplane", id: rest } : k === "sk" ? { kind: "sketch", sketch: rest } : { kind: "surface", id: rest };
    this.update((x) => (x.tool = t));
    this.sync();
  }
  protected sync() {
    const t = this.feature.tool;
    this.app.vp.setSelection(surfacePicks(this.app, [this.feature.surface, ...(t.kind === "surface" ? [t.id] : [])]));
  }
}

// ------------------------------------------------------------- offset ---

class SurfOffsetCommand extends OneSurfaceCommand<SurfOffsetFeature> {
  readonly id = "surfOffset";
  constructor(app: App, existing: SurfOffsetFeature | null) {
    super(app, existing, () => {
      const id = uid("so");
      return { id, type: "surfOffset", name: app.store.nextFeatureName("surfOffset"), surface: surfaceSources(app).slice(-1)[0]?.id ?? "", distance: app.store.addParam(app.store.doc, "5", "mm", id), flip: false };
    });
    const f = this.feature;
    this.openPanel(this.editing ? `オフセットサーフェス: ${f.name}` : "オフセットサーフェス", "surfOffset", true);
    const p = this.panel;
    const sec = p.section("サーフェス");
    this.setupSurfacePick(sec, "サーフェス");
    p.expr(sec, "距離", this.expr(f.distance), "mm", (e) => this.setParam(this.feature.distance, e), f.distance);
    p.checkbox(sec, "反対側にオフセット", f.flip, (v) => this.update((x) => (x.flip = v)));
    this.sync();
    app.status("オフセットするサーフェスをクリック");
  }
}

// ------------------------------------------------------------- stitch ---

class SurfStitchCommand extends FeatureCommand<SurfStitchFeature> {
  readonly id = "surfStitch";
  private pick!: ReturnType<PropertyPanel["picker"]>;
  private boxes = new Map<string, HTMLInputElement>();
  constructor(app: App, existing: SurfStitchFeature | null) {
    super(app, existing, () => {
      const id = uid("ss");
      // default: every surface still shown
      const shown = new Set(app.surfaces.map((s) => s.surface));
      return {
        id,
        type: "surfStitch",
        name: app.store.nextFeatureName("surfStitch"),
        surfaces: surfaceChoices(app).filter((s) => shown.has(s.id)).map((s) => s.id),
        tolerance: app.store.addParam(app.store.doc, "0.01", "mm", id),
        solid: true,
        op: app.hasBodies() ? "join" : "new",
      };
    });
    const f = this.feature;
    this.openPanel(this.editing ? `ステッチ: ${f.name}` : "ステッチ (縫合)", "surfStitch", true);
    const p = this.panel;
    const sec = p.section("サーフェス");
    this.pick = p.picker(sec, "サーフェス", "surfPatch", () => {}, () => (this.update((x) => (x.surfaces = [])), this.sync()));
    this.pick.setActive(true);
    const choices = surfaceChoices(app, this.featureId);
    for (const id of f.surfaces) if (!choices.some((c) => c.id === id)) choices.push({ id, name: surfaceLabel(app, id) });
    for (const s of choices) this.boxes.set(s.id, p.checkbox(sec, s.name, f.surfaces.includes(s.id), () => this.toggle(s.id)));
    const opt = p.section("オプション");
    p.expr(opt, "許容差", this.expr(f.tolerance), "mm", (e) => this.setParam(this.feature.tolerance, e), f.tolerance);
    p.checkbox(opt, "閉じていればソリッドを作成", f.solid, (v) => this.update((x) => (x.solid = v)));
    p.toggles(opt, "ブール演算", OPS, f.op, (v) => this.update((x) => (x.op = v as BoolOp)));
    p.note(opt, "隙間が許容差以下のエッジをつなぎます。すき間なく閉じるとソリッドになり、閉じない場合は 1 つのサーフェスとして残ります。パターン / ミラーで作ったサーフェスのコピー (#番号) も選べます。");
    app.vp.pickKinds = new Set(["face"]);
    app.vp.pickFilter = (pk) => !!app.pickBodies[pk.body]?.surface;
    this.handler = {
      cursor: "pointer",
      onPointerMove: (e, vp) => vp.setHover(vp.pick(e)),
      onPointerDown: (e, vp) => {
        if (e.button !== 0) return;
        const id = pickedSurface(app, vp.pick(e));
        if (id && id !== this.featureId) this.toggle(id);
      },
    };
    this.sync();
    app.status("縫合するサーフェスをクリック");
  }
  private toggle(id: string) {
    this.update((x) => {
      const k = x.surfaces.indexOf(id);
      if (k >= 0) x.surfaces.splice(k, 1);
      else x.surfaces.push(id);
    });
    this.sync();
  }
  private sync() {
    const ids = this.feature.surfaces;
    for (const [id, cb] of this.boxes) cb.checked = ids.includes(id);
    this.pick.setCount(ids.length, ids.length ? `${ids.length} サーフェス` : "選択してください");
    this.app.vp.setSelection(surfacePicks(this.app, ids));
  }
  captureBefore() {
    return this.featureId;
  }
  onRegen() {
    super.onRegen();
    this.sync();
  }
}

// ----------------------------------------------------------- analysis ---

/** Zebra stripes on / off. */
export function toggleZebra(app: App) {
  const on = !app.vp.zebra;
  if (on && curvatureOn) toggleCurvature(app);
  app.vp.setZebra(on);
  app.status(on ? "ゼブラ表示: 縞が面の境界でつながっていれば G1 (接線連続)、滑らかに曲がっていれば G2 (曲率連続) です" : "");
}

let curvatureOn = false;
/** Curvature colour map (blue = flat … red = tight curvature) on / off. */
export function toggleCurvature(app: App) {
  curvatureOn = !curvatureOn;
  if (!curvatureOn) return void app.vp.setResult(null);
  if (app.vp.zebra) app.vp.setZebra(false);
  refreshCurvature(app);
}

/** Recolour after a rebuild while the curvature display is on. */
export function refreshCurvature(app: App) {
  if (!curvatureOn) return;
  const shown = [...app.bodies, ...app.surfaces];
  const { per, max } = curvatureColors(shown);
  app.vp.setResult(per);
  app.status(max > 0 ? `曲率表示: 青 = 平ら → 赤 = 曲率 ${max.toFixed(3)} 1/mm (半径 ${(1 / max).toFixed(2)} mm) 以上` : "曲率表示: すべて平面です");
}
export const curvatureActive = () => curvatureOn;

// ----------------------------------------------------------- registry ---

export const SURFACE_COMMAND_INFO: Record<string, { id: string; label: string; icon: string }> = {
  surfExtrude: { id: "surfExtrude", label: "押し出しサーフェス", icon: "surfExtrude" },
  surfRevolve: { id: "surfRevolve", label: "回転サーフェス", icon: "surfRevolve" },
  surfLoft: { id: "surfLoft", label: "ロフトサーフェス", icon: "surfLoft" },
  surfPatch: { id: "surfPatch", label: "境界パッチ", icon: "surfPatch" },
  surfTrim: { id: "surfTrim", label: "トリム", icon: "surfTrim" },
  surfStitch: { id: "surfStitch", label: "ステッチ", icon: "surfStitch" },
  surfOffset: { id: "surfOffset", label: "オフセットサーフェス", icon: "surfOffset" },
};

/** Builds a surface command, or null when `id` is not one. Shows a hint when inputs are missing. */
export function makeSurfaceCommand(app: App, id: string, f: Feature | null): Command | null {
  const needSketch = id === "surfExtrude" || id === "surfRevolve" || id === "surfLoft";
  if (!f && needSketch && !curveSketches(app).length) {
    toast("曲線のあるスケッチがありません。先に 2D スケッチを作成してください", "warn");
    return null;
  }
  const needSurface = id === "surfTrim" || id === "surfOffset" || id === "surfStitch";
  if (!f && needSurface && !surfaceSources(app).length) {
    toast("サーフェスがありません。先に押し出しサーフェスなどを作成してください", "warn");
    return null;
  }
  switch (id) {
    case "surfExtrude":
      return new SurfExtrudeCommand(app, f as SurfExtrudeFeature | null);
    case "surfRevolve":
      return new SurfRevolveCommand(app, f as SurfRevolveFeature | null);
    case "surfLoft":
      return new SurfLoftCommand(app, f as SurfLoftFeature | null);
    case "surfPatch":
      return new SurfPatchCommand(app, f as SurfPatchFeature | null);
    case "surfTrim":
      return new SurfTrimCommand(app, f as SurfTrimFeature | null);
    case "surfOffset":
      return new SurfOffsetCommand(app, f as SurfOffsetFeature | null);
    case "surfStitch":
      return new SurfStitchCommand(app, f as SurfStitchFeature | null);
  }
  return null;
}
