// Measure commands (stage 2): general measure (distance with closest points,
// angle, radius / arc, length, area, perimeter, volume / mass), hole, pitch
// circle, wall thickness map, clearance list and the measurement annotation
// panel. Ids: measure, measure-hole, measure-pcd, measure-thickness,
// measure-clearance, measure-notes (usable from the viewer-only mode).

import type { App } from "../app";
import type { Vec3 } from "../core/types";
import { uid } from "../core/document";
import { download, h, iconEl, promptDialog, toast } from "../ui/dom";
import { PropertyPanel } from "../ui/panel";
import { samePick, type Pick, type ToolHandler } from "../viewer/viewport";
import type { Command } from "../commands/command";
import type { CommandInfo } from "../commands/features";
import type { MeasureLayer, TempItem } from "../viewer/annotations";
import { circlePoints } from "../viewer/annotations";
import { fitPitchCircle, type PcdResult } from "./pcd";
import { captureRef, NOTE_LABELS } from "./notes";
import { formatMeasure, formatValue, noteText, notesCsv, saveFormat, type MeasureDim } from "./format";
import type { ClearancePair, HoleInfo, MeasureNote, MeasureNoteKind, MeasureTarget, PropsResult, ThicknessResult } from "./types";
import type { PmiRef } from "../mbd/pmi";
import type { Placement } from "../kernel/protocol";

export const MEASURE_COMMAND_INFO: Record<string, CommandInfo> = {
  measure: { id: "measure", label: "測定", icon: "measure" },
  "measure-hole": { id: "measure-hole", label: "穴の測定", icon: "hole" },
  "measure-pcd": { id: "measure-pcd", label: "ピッチ円", icon: "circPattern" },
  "measure-thickness": { id: "measure-thickness", label: "肉厚の分布", icon: "shell" },
  "measure-clearance": { id: "measure-clearance", label: "クリアランス", icon: "intersect" },
  "measure-notes": { id: "measure-notes", label: "測定注記", icon: "iprops" },
};

const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a: Vec3, s: number): Vec3 => [a[0] * s, a[1] * s, a[2] * s];

/** The measure layer (created by the app). */
function layer(app: App): MeasureLayer {
  return app.measure;
}

function fmt(app: App, v: number, dim: MeasureDim = "length") {
  return formatMeasure(v, dim, layer(app).fmt);
}
const pt = (app: App, p: Vec3) => p.map((x) => formatValue(x, "length", layer(app).fmt)).join(", ");

function table(rows: [string, string, (() => void)?][]): HTMLElement {
  return h(
    "table",
    { class: "kv measure-kv" },
    ...rows.map(([k, v, save]) => h("tr", {}, h("th", {}, k), h("td", {}, v), h("td", {}, save ? h("button", { class: "icon-btn small", title: "注記として保存", onClick: () => save() }, iconEl("save")) : ""))),
  );
}

/** Units / precision controls shared by every measure panel. */
function formatControls(app: App, panel: PropertyPanel, parent: HTMLElement, redraw: () => void) {
  const L = layer(app);
  panel.select(parent, "単位", [{ value: "mm", label: "mm" }, { value: "inch", label: "inch" }], L.fmt.unit, (v) => {
    L.setFormat({ ...L.fmt, unit: v as "mm" | "inch" });
    saveFormat(L.fmt);
    redraw();
  }).dataset.measure = "unit";
  panel.select(parent, "精度 (小数桁)", [0, 1, 2, 3, 4, 5, 6].map((n) => ({ value: String(n), label: String(n) })), String(L.fmt.precision), (v) => {
    L.setFormat({ ...L.fmt, precision: Number(v) });
    saveFormat(L.fmt);
    redraw();
  }).dataset.measure = "precision";
}

/** Add a note to the document of the current environment. */
export async function saveNote(app: App, n: Omit<MeasureNote, "id" | "name"> & { name?: string }, ask = true): Promise<MeasureNote | null> {
  const def = n.name ?? `${NOTE_LABELS[n.kind]} ${layer(app).notes().length + 1}`;
  const name = ask ? await promptDialog("測定注記として保存", "名前", def) : def;
  if (name === null) return null;
  const note: MeasureNote = { ...n, id: uid("mn"), name: name || def, created: new Date().toISOString() };
  const fn = (d: { measureNotes?: MeasureNote[] }) => (d.measureNotes ??= []).push(structuredClone(note));
  if (app.env === "assembly") app.asm.store.mutate("測定注記を追加", fn);
  else app.store.mutate("測定注記を追加", fn);
  layer(app).refresh();
  toast(`測定注記「${note.name}」を保存しました`, "ok");
  return note;
}

/** Assembly helpers: visible components (= placement order) and the placements. */
function asmPlacements(app: App): { ps: Placement[]; comps: { id: string; name: string; matrix: number[] }[] } {
  return { ps: app.asm.placements(), comps: app.asm.doc.components.filter((c) => c.visible !== false) };
}
function compIndexOf(app: App, p: Pick): number {
  const c = app.asm.compOfBody(p.body);
  return c ? asmPlacements(app).comps.findIndex((x) => x.id === c.id) : -1;
}
function invPoint(m: number[], p: Vec3): Vec3 {
  // rigid transform inverse: R^T (p - t)
  const d: Vec3 = [p[0] - m[12], p[1] - m[13], p[2] - m[14]];
  return [0, 1, 2].map((k) => m[k * 4] * d[0] + m[k * 4 + 1] * d[1] + m[k * 4 + 2] * d[2]) as Vec3;
}

function partRef(app: App, p: Pick): PmiRef | null {
  return p.kind === "face" || p.kind === "edge" ? captureRef(app.pickBodies, { body: p.body, kind: p.kind, index: p.index }) : null;
}

abstract class MeasureBase implements Command {
  abstract readonly id: string;
  handler!: ToolHandler;
  protected panel: PropertyPanel;
  protected out: HTMLElement;
  constructor(protected app: App, title: string, icon: string, hint: string) {
    this.panel = new PropertyPanel(app.panelHost, title, icon, { onOk: () => app.finishCommand(this, true), onCancel: () => app.finishCommand(this, false) }, () => app.values());
    this.panel.el?.setAttribute?.("data-measure-panel", title);
    const s = this.panel.section("結果");
    this.out = h("div", { class: "measure-out" }, hint);
    s.appendChild(this.out);
    this.options(this.panel.section("表示", true));
  }
  protected options(sec: HTMLElement) {
    formatControls(this.app, this.panel, sec, () => this.render());
  }
  protected abstract render(): void;
  protected show(rows: [string, string, (() => void)?][], extra?: HTMLElement) {
    this.out.innerHTML = "";
    this.out.appendChild(table(rows));
    if (extra) this.out.appendChild(extra);
  }
  ok() {
    this.close();
  }
  cancel() {
    this.close();
  }
  protected close() {
    layer(this.app).setTemp([]);
    this.panel.close();
  }
}

// ---------------------------------------------------------------- measure ---

/** General measurement of one or two picks (faces, edges, points of reference data, bodies / components). */
export class MeasureCommand extends MeasureBase {
  readonly id = "measure";
  private picks: Pick[] = [];
  private bodyMode = false;
  private result: PropsResult | null = null;
  private err = "";
  constructor(app: App) {
    super(app, "測定", "measure", "面またはエッジを選択してください (2 つ選ぶと最小距離・角度)");
    app.vp.pickKinds = new Set(["face", "edge", "ref"]);
    const s = this.panel.section("対象");
    this.panel.checkbox(s, "ボディ / コンポーネント全体を測定 (体積・質量・最小距離)", false, (v) => {
      this.bodyMode = v;
      void this.compute();
    });
    s.appendChild(h("button", { class: "btn", onClick: () => this.reset() }, iconEl("trash"), "クリア"));
    this.handler = {
      cursor: "crosshair",
      onPointerMove: (e, vp) => vp.setHover(vp.pick(e)),
      onPointerDown: (e, vp) => {
        if (e.button !== 0) return;
        const p = vp.pick(e);
        if (!p) return;
        if (this.picks.length >= 2 || this.picks.some((x) => samePick(x, p))) this.picks = [];
        this.picks.push(p);
        vp.setSelection([...this.picks]);
        void this.compute();
      },
    };
    app.status("測定する面・エッジをクリック");
  }
  private reset() {
    this.picks = [];
    this.result = null;
    this.app.vp.setSelection([]);
    layer(this.app).setTemp([]);
    this.out.textContent = "面またはエッジを選択してください";
  }
  /** Programmatic picks (tests / e2e). */
  async pickRefs(picks: Pick[], bodyMode = false) {
    this.picks = picks;
    this.bodyMode = bodyMode;
    await this.compute();
    return this.result;
  }
  private targets(): { list: MeasureTarget[]; placements?: Placement[] } {
    if (this.app.env === "assembly") {
      const { ps } = asmPlacements(this.app);
      return { list: this.picks.map((p) => ({ kind: "comp" as const, comp: compIndexOf(this.app, p) })), placements: ps };
    }
    return {
      list: this.picks.map((p) => (this.bodyMode ? { kind: "body" as const, body: p.body } : { body: p.body, kind: p.kind as "face", index: p.index, point: p.point })),
    };
  }
  private async compute() {
    const [a, b] = this.picks;
    if (!a) return;
    if (a.kind === "ref" || b?.kind === "ref") {
      this.result = null;
      this.render();
      return;
    }
    try {
      this.err = "";
      if (this.app.env === "assembly") await this.app.asm.ensureBrep();
      const { list, placements } = this.targets();
      const density = this.app.env === "part" ? this.app.store.doc.material.density / 1000 : undefined;
      this.result = await this.app.kernel.measureX<PropsResult>({ op: "props", refs: list, density, placements });
    } catch (e) {
      this.result = null;
      this.err = (e as Error).message;
    }
    this.render();
  }
  protected render() {
    const [a, b] = this.picks;
    if (!a) return;
    if (a.kind === "ref" || b?.kind === "ref") {
      // picked points of reference data: coordinates and straight distance
      const rows: [string, string][] = [["点 1", pt(this.app, a.point)]];
      if (b) {
        const d: Vec3 = [b.point[0] - a.point[0], b.point[1] - a.point[1], b.point[2] - a.point[2]];
        rows.push(["点 2", pt(this.app, b.point)], ["距離", fmt(this.app, Math.hypot(...d))], ["ΔX, ΔY, ΔZ", pt(this.app, d)]);
        layer(this.app).setTemp([{ segs: [a.point, b.point], points: [a.point, b.point] }]);
      }
      return this.show(rows);
    }
    if (!this.result) return void (this.out.textContent = this.err || "計算中…");
    const r = this.result;
    const rows: [string, string, (() => void)?][] = [];
    const asm = this.app.env === "assembly";
    const refs = asm || this.bodyMode ? [] : this.picks.map((p) => partRef(this.app, p));
    const save = (kind: MeasureNoteKind, value: number, points: Vec3[], extra: Partial<MeasureNote> = {}) => () =>
      void saveNote(this.app, { kind, value, points, refs: refs.filter((x): x is PmiRef => !!x), ...extra });
    const bodiesOf = () => (this.bodyMode && !asm ? { bodies: this.picks.map((p) => p.body) } : {});
    r.items.forEach((it, i) => {
      const pre = r.items.length > 1 ? `${i + 1}: ` : "";
      const single = r.items.length === 1;
      if (it.type) rows.push([`${pre}種類`, it.type]);
      if (it.length !== undefined) rows.push([`${pre}長さ`, fmt(this.app, it.length), single && !asm ? save("length", it.length, [it.point!]) : undefined]);
      if (it.radius !== undefined) {
        rows.push([`${pre}半径`, fmt(this.app, it.radius), single && !asm ? save("radius", it.radius, [it.point!]) : undefined], [`${pre}直径`, fmt(this.app, it.radius * 2)]);
        if (it.arc !== undefined) rows.push([`${pre}円弧の角度`, fmt(this.app, it.arc, "angle")]);
      }
      if (it.area !== undefined) rows.push([`${pre}面積`, fmt(this.app, it.area, "area"), single && !asm && it.kind === "face" ? save("area", it.area, [it.point!]) : undefined]);
      if (it.perimeter !== undefined) rows.push([`${pre}周長`, fmt(this.app, it.perimeter)]);
      if (it.volume !== undefined) rows.push([`${pre}体積`, fmt(this.app, it.volume, "volume"), single && !asm ? save("volume", it.volume, [it.centroid!], bodiesOf()) : undefined]);
      if (it.mass !== undefined) rows.push([`${pre}質量`, fmt(this.app, it.mass, "mass")]);
      if (it.centroid && it.kind !== "edge") rows.push([`${pre}重心`, pt(this.app, it.centroid)]);
      if (it.normal && it.type === "PLANE") rows.push([`${pre}法線`, it.normal.map((v) => v.toFixed(3)).join(", ")]);
    });
    const temp: TempItem[] = [];
    if (r.distance) {
      const d = r.distance;
      const pts = d.pa && d.pb ? [d.pa, d.pb] : [];
      let saveD: (() => void) | undefined;
      if (asm && pts.length) {
        const { comps } = asmPlacements(this.app);
        const ci = this.picks.map((p) => compIndexOf(this.app, p));
        saveD = () =>
          void saveNote(this.app, {
            kind: "distance", value: d.distance, refs: [], comps: ci.map((k) => comps[k].id), pointComps: [0, 1],
            points: [invPoint(comps[ci[0]].matrix, pts[0]), invPoint(comps[ci[1]].matrix, pts[1])],
          });
      } else saveD = save("distance", d.distance, pts, bodiesOf());
      rows.push(["最小距離", d.overlap ? `0 (接触・干渉)` : fmt(this.app, d.distance), saveD]);
      if (d.pa && d.pb) {
        rows.push(["最近点 1", pt(this.app, d.pa)], ["最近点 2", pt(this.app, d.pb)], ["ΔX, ΔY, ΔZ", pt(this.app, [d.pb[0] - d.pa[0], d.pb[1] - d.pa[1], d.pb[2] - d.pa[2]])]);
        temp.push({ segs: [d.pa, d.pb], points: [d.pa, d.pb], label: { at: mul(add(d.pa, d.pb), 0.5), text: fmt(this.app, d.distance) } });
      }
    }
    if (r.angle !== undefined) rows.push(["角度", fmt(this.app, r.angle, "angle"), !asm && !this.bodyMode ? save("angle", r.angle, [r.items[0].point ?? [0, 0, 0]]) : undefined]);
    layer(this.app).setTemp(temp);
    this.show(rows);
  }
}

// ------------------------------------------------------------------- hole ---

export class HoleMeasureCommand extends MeasureBase {
  readonly id = "measure-hole";
  info: HoleInfo | null = null;
  private pick: Pick | null = null;
  constructor(app: App) {
    super(app, "穴の測定", "hole", "穴 (または軸) の円筒面をクリックしてください");
    app.vp.pickKinds = new Set(["face"]);
    this.handler = {
      cursor: "crosshair",
      onPointerMove: (e, vp) => vp.setHover(vp.pick(e)),
      onPointerDown: (e, vp) => {
        if (e.button !== 0) return;
        const p = vp.pick(e);
        if (p) void this.measure(p);
      },
    };
    app.status("穴の円筒面をクリック");
  }
  async measure(p: Pick): Promise<HoleInfo | null> {
    if (this.app.env !== "part") return void toast("穴の測定はパーツで使用できます", "info"), null;
    this.pick = p;
    this.app.vp.setSelection([p]);
    try {
      this.info = await this.app.kernel.measureX<HoleInfo>({ op: "hole", ref: { body: p.body, kind: "face", index: p.index } });
      this.app.vp.setSelection(this.info.faces.map((i) => ({ kind: "face" as const, body: p.body, index: i, point: p.point })));
    } catch (e) {
      this.info = null;
      this.out.textContent = (e as Error).message;
      layer(this.app).setTemp([]);
      return null;
    }
    this.render();
    return this.info;
  }
  protected render() {
    const x = this.info;
    if (!x) return;
    const f = (v: number) => fmt(this.app, v);
    const rows: [string, string, (() => void)?][] = [
      ["種類", x.kind === "hole" ? (x.counterbore ? "座ぐり穴" : x.countersink ? "皿穴" : x.thread ? "ねじ穴" : "穴") : "軸 / ボス"],
      ["直径", `Ø${f(x.diameter)}`, () => void this.save()],
      [x.kind === "hole" ? "深さ" : "長さ", x.through ? `貫通 (${f(x.depth)})` : f(x.depth)],
    ];
    if (x.counterbore) rows.push(["座ぐり", `Ø${f(x.counterbore.diameter)} 深さ ${f(x.counterbore.depth)}`]);
    if (x.countersink) rows.push(["皿", `Ø${f(x.countersink.diameter)} × ${fmt(this.app, x.countersink.angle, "angle")}`]);
    if (x.drillPoint) rows.push(["先端角", fmt(this.app, x.drillPoint.angle, "angle")]);
    rows.push(["ねじ", x.thread ? `${x.thread.designation} (有効径 Ø${f(x.thread.minor)}, 長さ ${f(x.thread.length)})` : "なし"]);
    rows.push(["中心", pt(this.app, x.center)], ["軸方向", x.axis.map((v) => v.toFixed(4)).join(", ")]);
    const end = add(x.center, mul(x.axis, x.depth));
    layer(this.app).setTemp([{ segs: [x.center, end], points: [x.center], label: { at: x.center, text: `Ø${f(x.diameter)}` } }]);
    this.show(rows);
  }
  async save(ask = true) {
    const x = this.info, p = this.pick;
    if (!x || !p) return null;
    const ref = partRef(this.app, p);
    if (!ref) return null;
    const extra: Record<string, number> = { depth: x.depth };
    if (x.counterbore) Object.assign(extra, { cbDiameter: x.counterbore.diameter, cbDepth: x.counterbore.depth });
    if (x.countersink) Object.assign(extra, { csDiameter: x.countersink.diameter, csAngle: x.countersink.angle });
    return saveNote(this.app, { kind: "hole", value: x.diameter, refs: [ref], points: [x.center, add(x.center, mul(x.axis, x.depth))], extra }, ask);
  }
}

// -------------------------------------------------------------------- PCD ---

export class PcdCommand extends MeasureBase {
  readonly id = "measure-pcd";
  picks: Pick[] = [];
  holes: HoleInfo[] = [];
  fit: PcdResult | null = null;
  constructor(app: App) {
    super(app, "ピッチ円", "circPattern", "3 つ以上の穴 / 円筒面を順にクリックしてください (もう一度クリックで解除)");
    app.vp.pickKinds = new Set(["face"]);
    const s = this.panel.section("対象");
    s.appendChild(h("button", { class: "btn", onClick: () => this.setPicks([]) }, iconEl("trash"), "クリア"));
    this.handler = {
      cursor: "crosshair",
      onPointerMove: (e, vp) => vp.setHover(vp.pick(e)),
      onPointerDown: (e, vp) => {
        if (e.button !== 0) return;
        const p = vp.pick(e);
        if (!p) return;
        const i = this.picks.findIndex((x) => samePick(x, p));
        void this.setPicks(i >= 0 ? this.picks.filter((_, k) => k !== i) : [...this.picks, p]);
      },
    };
    app.status("ピッチ円上の穴をクリック");
  }
  async setPicks(picks: Pick[]): Promise<PcdResult | null> {
    this.picks = picks;
    this.app.vp.setSelection([...picks]);
    this.fit = null;
    this.holes = [];
    if (picks.length) {
      try {
        this.holes = await this.app.kernel.measureX<HoleInfo[]>({ op: "holes", refs: picks.map((p) => ({ body: p.body, kind: "face" as const, index: p.index })) });
        if (this.holes.length >= 3) this.fit = fitPitchCircle(this.holes.map((x) => x.center), this.holes[0].axis);
      } catch (e) {
        this.out.textContent = (e as Error).message;
        return null;
      }
    }
    this.render();
    return this.fit;
  }
  protected render() {
    const f = this.fit;
    if (!f) {
      this.out.textContent = `${this.holes.length} 個選択 — 3 つ以上の穴を選んでください`;
      layer(this.app).setTemp(this.holes.map((x) => ({ points: [x.center] })));
      return;
    }
    const rows: [string, string, (() => void)?][] = [
      ["穴の数", String(this.holes.length)],
      ["ピッチ円直径 (PCD)", `Ø${fmt(this.app, f.diameter)}`, () => void this.save()],
      ["中心", pt(this.app, f.center)],
      ["穴径", [...new Set(this.holes.map((x) => fmt(this.app, x.diameter)))].join(" / ")],
      ["角度間隔", f.spacing.map((s) => fmt(this.app, s, "angle")).join(", ")],
      ["等配からの角度ずれ (最大)", fmt(this.app, f.angularDeviation, "angle")],
      ["半径方向のずれ (最大)", fmt(this.app, f.radialDeviation)],
      ["位置ずれ (最大)", fmt(this.app, f.positionDeviation)],
    ];
    layer(this.app).setTemp([
      { loop: circlePoints(f.center, f.normal, f.diameter / 2), points: [f.center, ...this.holes.map((x) => x.center)], label: { at: this.holes[0].center, text: `PCD Ø${fmt(this.app, f.diameter)}` } },
      ...this.holes.map((x) => ({ segs: [f.center, x.center] })),
    ]);
    this.show(rows);
  }
  async save(ask = true) {
    const f = this.fit;
    if (!f) return null;
    const refs = this.picks.map((p) => partRef(this.app, p)).filter((x): x is PmiRef => !!x);
    return saveNote(this.app, { kind: "pcd", value: f.diameter, refs, points: [f.center, ...this.holes.map((x) => x.center)], extra: { holes: this.holes.length, angularDeviation: f.angularDeviation, radialDeviation: f.radialDeviation } }, ask);
  }
}

// -------------------------------------------------------------- thickness ---

export class ThicknessCommand extends MeasureBase {
  readonly id = "measure-thickness";
  res: ThicknessResult | null = null;
  threshold = 1;
  samples = 800;
  probe: { pick: Pick; value: number; normal: Vec3 } | null = null;
  private busy = false;
  constructor(app: App) {
    super(app, "肉厚の分布", "shell", "ボディの面をクリックすると肉厚を計算します。計算後のクリックは点の肉厚 (プローブ)");
    app.vp.pickKinds = new Set(["face"]);
    const s = this.panel.section("設定");
    this.panel.expr(s, "薄肉のしきい値", String(this.threshold), "mm", (v) => {
      const n = Number(v);
      if (Number.isFinite(n) && n >= 0) {
        this.threshold = n;
        if (this.res) layer(app).showThickness(this.res, this.threshold);
        this.render();
      }
    });
    this.panel.select(s, "サンプル数", ["300", "800", "2000"].map((v) => ({ value: v, label: v })), String(this.samples), (v) => (this.samples = Number(v)));
    s.appendChild(h("button", { class: "btn", onClick: () => this.clearMap() }, iconEl("trash"), "表示を解除"));
    this.handler = {
      cursor: "crosshair",
      onPointerMove: (e, vp) => vp.setHover(vp.pick(e)),
      onPointerDown: (e, vp) => {
        if (e.button !== 0) return;
        const p = vp.pick(e);
        if (!p || this.busy) return;
        if (!this.res || this.res.body !== p.body) void this.compute(p.body);
        else void this.probeAt(p);
      },
    };
    app.status("肉厚を調べるボディをクリック");
  }
  private clearMap() {
    this.res = null;
    this.probe = null;
    layer(this.app).showThickness(null);
    layer(this.app).setTemp([]);
    this.out.textContent = "ボディの面をクリックしてください";
  }
  async compute(body: number): Promise<ThicknessResult | null> {
    if (this.app.env !== "part") return void toast("肉厚の分布はパーツで使用できます", "info"), null;
    this.busy = true;
    this.out.textContent = "肉厚を計算中…";
    try {
      this.res = await this.app.kernel.measureX<ThicknessResult>({ op: "thickness", body, samples: this.samples });
      this.probe = null;
      layer(this.app).showThickness(this.res, this.threshold);
    } catch (e) {
      this.out.textContent = (e as Error).message;
      return null;
    } finally {
      this.busy = false;
    }
    this.render();
    return this.res;
  }
  async probeAt(p: Pick): Promise<number | null> {
    const r = this.res;
    if (!r) return null;
    const f = this.app.pickBodies[p.body]?.faces[p.index];
    let normal: Vec3 = f?.normal ?? [0, 0, 1];
    if (f?.type !== "PLANE") {
      // curved face: normal of the nearest sample
      let bi = 0, bd = Infinity;
      r.points.forEach((q, i) => {
        const d = (q[0] - p.point[0]) ** 2 + (q[1] - p.point[1]) ** 2 + (q[2] - p.point[2]) ** 2;
        if (d < bd) (bd = d), (bi = i);
      });
      normal = r.normals[bi];
    }
    try {
      const value = await this.app.kernel.measureX<number>({ op: "thicknessAt", body: p.body, point: p.point, normal });
      this.probe = { pick: p, value, normal };
    } catch (e) {
      toast((e as Error).message, "error");
      return null;
    }
    this.render();
    return this.probe.value;
  }
  protected render() {
    const r = this.res;
    if (!r) return;
    const valid = r.values.filter((v) => Number.isFinite(v));
    const thin = valid.filter((v) => v < this.threshold).length;
    const rows: [string, string, (() => void)?][] = [
      ["最小肉厚", fmt(this.app, r.min)],
      ["最大肉厚", fmt(this.app, r.max)],
      ["平均", fmt(this.app, valid.reduce((a, b) => a + b, 0) / Math.max(1, valid.length))],
      ["サンプル", `${valid.length} 点 (${Math.round(r.timeMs)} ms)`],
      ["薄肉 (しきい値未満)", thin ? `${thin} 点 ⚠` : "なし"],
    ];
    if (r.minAt) rows.push(["最小の位置", pt(this.app, r.minAt)]);
    const temp: TempItem[] = [];
    if (r.minAt) temp.push({ points: [r.minAt], label: { at: r.minAt, text: `最小 ${fmt(this.app, r.min)}` } });
    if (this.probe) {
      const q = this.probe;
      rows.push(["プローブ", Number.isFinite(q.value) ? fmt(this.app, q.value) : "反対側の壁なし", Number.isFinite(q.value) ? () => void this.save() : undefined]);
      if (Number.isFinite(q.value)) temp.push({ segs: [q.pick.point, add(q.pick.point, mul(q.normal, -q.value))], points: [q.pick.point], label: { at: q.pick.point, text: `t = ${fmt(this.app, q.value)}` } });
    }
    if (thin) toast(`しきい値 ${fmt(this.app, this.threshold)} 未満の薄肉部があります (${thin} 点)`, "warn");
    layer(this.app).setTemp(temp);
    this.show(rows);
  }
  async save(ask = true) {
    const q = this.probe;
    if (!q) return null;
    const ref = partRef(this.app, q.pick);
    if (!ref) return null;
    return saveNote(this.app, { kind: "thickness", value: q.value, refs: [ref], points: [q.pick.point] }, ask);
  }
  protected close() {
    layer(this.app).showThickness(null);
    super.close();
  }
}

// -------------------------------------------------------------- clearance ---

export class ClearanceCommand extends MeasureBase {
  readonly id = "measure-clearance";
  threshold = 5;
  list: ClearancePair[] = [];
  private names: string[] = [];
  private sel = -1;
  constructor(app: App) {
    super(app, "クリアランス", "intersect", "しきい値を指定して「計算」を押してください");
    const s = this.panel.section("設定");
    this.panel.expr(s, "しきい値 (この距離未満を一覧)", String(this.threshold), "mm", (v) => {
      const n = Number(v);
      if (Number.isFinite(n) && n >= 0) this.threshold = n;
    });
    s.appendChild(h("button", { class: "btn primary", "data-measure": "clearance-run", onClick: () => void this.run() }, iconEl("measure"), "計算"));
    this.handler = { cursor: "default" };
    app.status(app.env === "assembly" ? "コンポーネント間のクリアランスを計算します" : "ボディ間のクリアランスを計算します");
  }
  async run(): Promise<ClearancePair[]> {
    this.out.textContent = "計算中…";
    try {
      if (this.app.env === "assembly") {
        await this.app.asm.ensureBrep();
        const { ps, comps } = asmPlacements(this.app);
        this.names = comps.map((c) => c.name);
        this.list = await this.app.kernel.measureX<ClearancePair[]>({ op: "clearance", threshold: this.threshold, placements: ps });
      } else {
        this.names = this.app.pickBodies.map((b, i) => b.name || `ボディ ${i + 1}`);
        this.list = await this.app.kernel.measureX<ClearancePair[]>({ op: "clearance", threshold: this.threshold });
      }
    } catch (e) {
      this.out.textContent = (e as Error).message;
      return [];
    }
    this.sel = this.list.length ? 0 : -1;
    this.render();
    return this.list;
  }
  protected render() {
    if (!this.list.length) {
      this.out.textContent = `${fmt(this.app, this.threshold)} 未満の組はありません`;
      layer(this.app).setTemp([]);
      return;
    }
    const t = h("table", { class: "kv measure-list" }, h("tr", {}, h("th", {}, "組"), h("th", {}, "距離"), h("th", {}, "")));
    this.list.forEach((x, i) => {
      const tr = h(
        "tr",
        { class: i === this.sel ? "sel" : "", onClick: () => ((this.sel = i), this.render()) },
        h("td", {}, `${this.names[x.a] ?? x.a} ⟷ ${this.names[x.b] ?? x.b}`),
        h("td", {}, x.overlap ? "接触 / 干渉" : fmt(this.app, x.distance)),
        h("td", {}, h("button", { class: "icon-btn small", title: "注記として保存", onClick: (e: Event) => (e.stopPropagation(), void this.save(i)) }, iconEl("save"))),
      );
      t.appendChild(tr);
    });
    this.out.innerHTML = "";
    this.out.append(h("p", { class: "pp-note" }, `${this.list.length} 組が ${fmt(this.app, this.threshold)} 未満`), t);
    const x = this.list[this.sel];
    layer(this.app).setTemp(x?.pa && x.pb ? [{ segs: [x.pa, x.pb], points: [x.pa, x.pb], label: { at: mul(add(x.pa, x.pb), 0.5), text: fmt(this.app, x.distance) } }] : []);
    if (this.app.env === "part" && x) this.app.vp.setBodyHighlight(new Set([x.a, x.b]));
  }
  async save(i: number, ask = true) {
    const x = this.list[i];
    if (!x?.pa || !x.pb) return null;
    const name = `${this.names[x.a]} ⟷ ${this.names[x.b]}`;
    if (this.app.env === "assembly") {
      const { comps } = asmPlacements(this.app);
      return saveNote(this.app, { kind: "clearance", name, value: x.distance, refs: [], comps: [comps[x.a].id, comps[x.b].id], pointComps: [0, 1], points: [invPoint(comps[x.a].matrix, x.pa), invPoint(comps[x.b].matrix, x.pb)] }, ask);
    }
    return saveNote(this.app, { kind: "clearance", name, value: x.distance, refs: [], bodies: [x.a, x.b], points: [x.pa, x.pb] }, ask);
  }
  protected close() {
    if (this.app.env === "part") this.app.vp.setBodyHighlight(new Set());
    super.close();
  }
}

// ------------------------------------------------------------ notes panel ---

/** Panel listing the measurement annotations: show / hide, rename, delete, repair, CSV. */
export class NotesPanelCommand extends MeasureBase {
  readonly id = "measure-notes";
  private repairing: { id: string; picks: Pick[] } | null = null;
  constructor(app: App) {
    super(app, "測定注記", "iprops", "");
    app.vp.pickKinds = new Set(["face", "edge"]);
    const L = layer(app);
    L.onChange = () => this.render();
    this.handler = {
      cursor: "default",
      onPointerMove: (e, vp) => this.repairing && vp.setHover(vp.pick(e)),
      onPointerDown: (e, vp) => {
        if (e.button !== 0 || !this.repairing) return;
        const p = vp.pick(e);
        if (p) void this.repairPick(p);
      },
    };
    this.render();
  }
  private store() {
    return this.app.env === "assembly" ? this.app.asm.store : this.app.store;
  }
  private mutate(label: string, fn: (notes: MeasureNote[]) => void) {
    (this.store() as { mutate(l: string, f: (d: { measureNotes?: MeasureNote[] }) => void): void }).mutate(label, (d) => fn((d.measureNotes ??= [])));
    layer(this.app).refresh();
    this.render();
  }
  protected render() {
    const L = layer(this.app);
    const notes = L.notes();
    this.out.innerHTML = "";
    if (!notes.length) {
      this.out.appendChild(h("p", { class: "pp-note" }, "保存された測定注記はありません。測定パネルの保存ボタンで追加できます。"));
    } else {
      const t = h("table", { class: "kv measure-list measure-notes" });
      for (const n of notes) {
        const vis = h("input", { type: "checkbox", checked: !n.hidden, title: "表示 / 非表示" });
        vis.addEventListener("change", () => this.mutate("測定注記の表示", (ns) => ns.forEach((x) => x.id === n.id && (x.hidden = !vis.checked || undefined))));
        t.appendChild(
          h(
            "tr",
            { class: `${n.broken ? "lost" : ""}${L.highlight === n.id ? " sel" : ""}`, "data-note": n.id, onClick: () => ((L.highlight = L.highlight === n.id ? null : n.id), L.refresh(), this.render()) },
            h("td", {}, vis),
            h("td", { class: "mn-name", title: "ダブルクリックで名前を変更", onDblclick: () => void this.rename(n) }, n.name),
            h("td", {}, n.broken ? "⚠ 参照切れ" : noteText(n, L.fmt)),
            h(
              "td",
              { class: "mn-btns" },
              n.broken && n.refs.length ? h("button", { class: "icon-btn small", "data-measure": "repair", title: "参照を修復 (面・エッジを選び直す)", onClick: (e: Event) => (e.stopPropagation(), this.startRepair(n)) }, iconEl("warning")) : "",
              h("button", { class: "icon-btn small", title: "名前を変更", onClick: (e: Event) => (e.stopPropagation(), void this.rename(n)) }, iconEl("edit")),
              h("button", { class: "icon-btn small", title: "削除", onClick: (e: Event) => (e.stopPropagation(), this.mutate("測定注記の削除", (ns) => ns.splice(ns.findIndex((x) => x.id === n.id), 1))) }, iconEl("trash")),
            ),
          ),
        );
      }
      this.out.appendChild(t);
    }
    if (this.repairing) this.out.appendChild(h("p", { class: "pp-note warn" }, `修復: 新しい参照を ${this.repairing.picks.length + 1} / ${notes.find((x) => x.id === this.repairing!.id)?.refs.length ?? 0} 個目をクリックしてください`));
    this.out.appendChild(
      h(
        "div",
        { class: "btn-row" },
        h("button", { class: "btn", onClick: () => ((L.visible = !L.visible), L.refresh(), this.render()) }, iconEl(L.visible ? "eyeOff" : "eye"), L.visible ? "すべて隠す" : "すべて表示"),
        h("button", { class: "btn", onClick: () => void L.reresolve() }, iconEl("measure"), "再計算"),
        h("button", { class: "btn", "data-measure": "csv", onClick: () => this.exportCsv() }, iconEl("export"), "CSV"),
      ),
    );
  }
  exportCsv() {
    const name = this.app.env === "assembly" ? this.app.asm.doc.name : this.app.store.doc.name;
    download(`${name}_測定.csv`, "﻿" + notesCsv(layer(this.app).notes(), layer(this.app).fmt), "text/csv");
  }
  private async rename(n: MeasureNote) {
    const v = await promptDialog("測定注記の名前", "名前", n.name);
    if (v === null || !v.trim()) return;
    this.mutate("測定注記の名前変更", (ns) => ns.forEach((x) => x.id === n.id && (x.name = v.trim())));
  }
  private startRepair(n: MeasureNote) {
    this.repairing = { id: n.id, picks: [] };
    this.app.status(`「${n.name}」の参照を選び直してください (${n.refs.length} 個)`);
    this.render();
  }
  private async repairPick(p: Pick) {
    const r = this.repairing!;
    const note = layer(this.app).notes().find((x) => x.id === r.id);
    if (!note) return void (this.repairing = null);
    r.picks.push(p);
    this.app.vp.setSelection([...r.picks]);
    if (r.picks.length < note.refs.length) return this.render();
    const refs = r.picks.map((x) => partRef(this.app, x));
    this.repairing = null;
    if (refs.some((x) => !x)) return void toast("面またはエッジを選択してください", "warn");
    this.mutate("測定注記の修復", (ns) => {
      const t = ns.find((x) => x.id === r.id);
      if (t) (t.refs = refs as PmiRef[]), delete t.broken;
    });
    this.app.vp.setSelection([]);
    await layer(this.app).reresolve();
    toast("測定注記の参照を修復しました", "ok");
  }
  protected close() {
    layer(this.app).onChange = null;
    super.close();
  }
}

export function makeMeasureCommand(app: App, id: string): Command | null {
  switch (id) {
    case "measure":
      return new MeasureCommand(app);
    case "measure-hole":
      return new HoleMeasureCommand(app);
    case "measure-pcd":
      return new PcdCommand(app);
    case "measure-thickness":
      return new ThicknessCommand(app);
    case "measure-clearance":
      return new ClearanceCommand(app);
    case "measure-notes":
      return new NotesPanelCommand(app);
  }
  return null;
}
