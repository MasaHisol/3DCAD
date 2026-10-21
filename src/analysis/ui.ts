import { reportHtml } from "./reportHtml";
import type { PlasticResult } from "./nonlinear";
import type { DynamicResult } from "./dynamic";
import { chart } from "../assembly/motionUi";
import * as THREE from "three";
import type { App } from "../app";
import type { Command } from "../commands/command";
import { formatNumber } from "../core/expr";
import { evalWith } from "../core/params";
import { download, h, iconEl, toast } from "../ui/dom";
import { PropertyPanel } from "../ui/panel";
import type { Pick, ToolHandler } from "../viewer/viewport";
import type { BodyMesh } from "../kernel/protocol";
import { trisToStl } from "../io/meshin";
import type { TopoResult } from "./topo";
import { THERMAL_MATERIALS, type BucklingResult, type ModalResult, type ThermalBoundary, type ThermalResult } from "./advanced";
import { FEA_MATERIALS, sampleDisp, sampleNodal, type FeaBoundary, type FeaMesh, type FeaResult, type GridLike } from "./fea";
import type { AnalysisKind, FeaRequest } from "./worker";
import { spawnKxHelpers } from "./par";

type Dir = "push" | "pull" | "+X" | "-X" | "+Y" | "-Y" | "+Z" | "-Z";
const DIRS: { value: Dir; label: string }[] = [
  { value: "push", label: "面に垂直 (押す)" },
  { value: "pull", label: "面に垂直 (引く)" },
  { value: "+X", label: "+X" },
  { value: "-X", label: "-X" },
  { value: "+Y", label: "+Y" },
  { value: "-Y", label: "-Y" },
  { value: "+Z", label: "+Z" },
  { value: "-Z", label: "-Z" },
];
const AXES: Dir[] = ["+X", "-X", "+Y", "-Y", "+Z", "-Z"];
const axisVec = (d: Dir): [number, number, number] => {
  const v: [number, number, number] = [0, 0, 0];
  v[{ X: 0, Y: 1, Z: 2 }[d[1] as "X"]] = d[0] === "-" ? -1 : 1;
  return v;
};

const QUALITY = [
  { value: "5000", label: "粗い (約 5 千要素・高速)" },
  { value: "20000", label: "標準 (約 2 万要素)" },
  { value: "60000", label: "細かい (約 6 万要素)" },
  { value: "150000", label: "非常に細かい (約 15 万要素)" },
];

const KINDS: { value: AnalysisKind; label: string }[] = [
  { value: "static", label: "静解析 (応力・変位)" },
  { value: "modal", label: "固有値解析 (固有振動数)" },
  { value: "buckling", label: "座屈解析" },
  { value: "thermal", label: "熱伝導解析 (定常)" },
  { value: "thermalStress", label: "熱応力解析" },
  { value: "topology", label: "トポロジー最適化 (軽量化形状)" },
  { value: "plastic", label: "弾塑性解析 (材料非線形)" },
  { value: "dynamic", label: "動的応答解析 (周波数応答・過渡応答)" },
];

type SetKey = "fixed" | "load" | "temp" | "flux" | "conv";
const SET_LABEL: Record<SetKey, string> = { fixed: "固定拘束", load: "荷重面", temp: "温度固定面", flux: "入熱面", conv: "対流面" };
const SET_ICON: Record<SetKey, string> = { fixed: "fix", load: "pushpull", temp: "stress", flux: "extrude", conv: "shell" };
/** Overlay colour of each boundary set in the viewport (also shown on its picker). */
const SET_COLOR: Record<SetKey, string> = { fixed: "#2bb3a3", load: "#e5484d", temp: "#f59e0b", flux: "#d946ef", conv: "#3b82f6" };
const KIND_SETS: Record<AnalysisKind, SetKey[]> = {
  static: ["fixed", "load"],
  modal: ["fixed"],
  buckling: ["fixed", "load"],
  thermal: ["temp", "flux", "conv"],
  thermalStress: ["fixed", "load", "temp", "flux", "conv"],
  topology: ["fixed", "load"],
  plastic: ["fixed", "load"],
  dynamic: ["fixed", "load"],
};

const eqText = (e: number) => (e < 1e-5 ? "< 0.001%" : `${(e * 100).toPrecision(2)}%`);

type Show = "vm" | "s1" | "s3" | "disp" | "sf" | "temp";
type AnyResult = TopoResult | FeaResult | ModalResult | BucklingResult | ThermalResult | (FeaResult & { thermal: ThermalResult });

/** Blue → cyan → green → yellow → red (Inventor style result legend). */
export function colormap(t: number): [number, number, number] {
  const x = Math.max(0, Math.min(1, t)) * 4;
  const stops: [number, number, number][] = [
    [0.1, 0.25, 0.9],
    [0.1, 0.8, 0.95],
    [0.2, 0.85, 0.3],
    [0.98, 0.85, 0.15],
    [0.9, 0.15, 0.1],
  ];
  const i = Math.min(3, Math.floor(x)), f = x - i;
  const a = stops[i], b = stops[i + 1];
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
}

/**
 * Structural / thermal analysis (Inventor 応力解析 + Nastran): static stress,
 * natural frequencies, buckling, steady heat conduction and thermal stress.
 */
export class StressCommand implements Command {
  readonly id = "stress";
  handler: ToolHandler;
  private panel!: PropertyPanel;
  private kind: AnalysisKind = "static";
  private sets: Record<SetKey, Pick[]> = { fixed: [], load: [], temp: [], flux: [], conv: [] };
  private active: SetKey = "fixed";
  private pickers = new Map<SetKey, ReturnType<PropertyPanel["picker"]>>();
  private loadKind: "force" | "pressure" = "force";
  private force = "1000";
  private pressure = "1";
  private dir: Dir = "push";
  private gravity = false;
  private gdir: Dir = "-Y";
  private tempT = "100";
  private fluxQ = "10";
  private convH = "10";
  private convAmb = "20";
  private tref = "20";
  private volFrac = "40";
  /** Zoomed (sub-model) result around the stress peak. */
  private sub: { r: FeaResult; lo: number[]; hi: number[] } | null = null;
  private topoIters = 40;
  private nModes = 6;
  private dynKind: "harmonic" | "transient" = "harmonic";
  private damping = "2";
  private pulse: "step" | "halfsine" | "sine" = "step";
  private target = 20000;
  private result: AnyResult | null = null;
  /** An analysis has produced a result (read by the learning guide). */
  get hasResult(): boolean {
    return !!this.result;
  }
  private resultKind: AnalysisKind = "static";
  private convergence: { dVm: number; dDisp: number; elems: number } | null = null;
  private show: Show = "vm";
  private deform = 0;
  private modeIndex = 0;
  private animate = true;
  private anim = 0;
  private worker: Worker | null = null;
  private out!: HTMLElement;
  private legend: HTMLElement;
  private runBtn!: HTMLButtonElement;
  private convBtn: HTMLButtonElement | null = null;
  private lastTime = 0;

  /** Analysed bodies (part bodies, or assembly bodies in assembly coordinates) and their materials. */
  private B: BodyMesh[];
  private mats: { name: string; density: number }[];
  /** Component names of the analysed bodies (assemblies). */
  private names: string[] = [];
  /** Assemblies: parts bonded at their interfaces, or in contact (may separate). */
  private contactMode: "bonded" | "contact" = "bonded";

  constructor(private app: App) {
    if (app.env === "assembly") {
      const wb = app.asm.worldBodies();
      this.B = wb.map((b) => b.mesh);
      this.mats = wb.map((b) => b.material);
      this.names = wb.map((b) => b.name);
    } else {
      this.B = app.bodies;
      this.mats = app.bodies.map(() => app.store.doc.material);
    }
    app.vp.pickKinds = new Set(["face"]);
    app.vp.pickFilter = null;
    this.legend = h("div", { class: "fea-legend" });
    app.vp.el.appendChild(this.legend);
    this.handler = {
      cursor: "pointer",
      onPointerMove: (e, vp) => vp.setHover(vp.pick(e)),
      onPointerDown: (e, vp) => {
        if (e.button !== 0) return;
        const pk = vp.pick(e);
        if (!pk || pk.kind !== "face") return;
        const list = this.sets[this.active];
        const k = list.findIndex((x) => x.body === pk.body && x.index === pk.index);
        if (k >= 0) {
          list.splice(k, 1);
          this.app.status(`${SET_LABEL[this.active]}から面を外しました`);
        } else {
          // a face belongs to one boundary set only: say so when it moves
          for (const key of Object.keys(this.sets) as SetKey[]) {
            const j = this.sets[key].findIndex((x) => x.body === pk.body && x.index === pk.index);
            if (j < 0) continue;
            this.sets[key].splice(j, 1);
            toast(`この面は${SET_LABEL[key]}から${SET_LABEL[this.active]}へ移りました (1 つの面は 1 つの条件にだけ使えます)`, "info", 4000);
          }
          list.push(pk);
          this.app.status(`${SET_LABEL[this.active]}: ${list.length} 面 — 続けてクリックで追加、もう一度クリックで解除`);
        }
        this.boundaryChanged();
        this.sync();
      },
    };
    this.buildPanel();
  }

  // ------------------------------------------------------------- panel ---

  private buildPanel() {
    this.panel?.close();
    this.pickers.clear();
    this.convBtn = null;
    const app = this.app;
    this.panel = new PropertyPanel(app.panelHost, "構造・熱解析", "stress", { onOk: () => app.finishCommand(this, true), onCancel: () => app.finishCommand(this, false) }, () => app.values());
    const p = this.panel;
    const row = (el: HTMLElement) => (el.closest(".field") as HTMLElement) ?? el;
    const ks = p.section("解析");
    const kindSel = p.select(ks, "種類", KINDS, this.kind, (v) => {
      this.kind = v as AnalysisKind;
      this.result = null;
      this.stopAnim();
      this.app.vp.setResult(null);
      this.app.vp.setPreviewMesh(null);
      this.legend.classList.remove("show");
      if (!KIND_SETS[this.kind].includes(this.active)) this.active = KIND_SETS[this.kind][0];
      this.buildPanel();
    });
    kindSel.dataset.k = "kind";
    const mat = this.material(), tm = this.thermalMat();
    const thermalKind = this.kind === "thermal" || this.kind === "thermalStress";
    p.note(
      ks,
      `${this.app.env === "assembly" ? `アセンブリ (部品ごとの材料、基準 ${this.matName()})` : this.matName()}: E ${formatNumber(mat.E, 0)} MPa / ν ${mat.nu} / 降伏 ${formatNumber(mat.yield, 0)} MPa / 密度 ${this.refDensity()} g/cm³` +
        (thermalKind ? ` / 熱伝導率 ${tm.k} W/(m·K) / 線膨張係数 ${formatNumber(tm.alpha * 1e6, 1)}×10⁻⁶/K` : ""),
    );
    if (this.app.env === "assembly" && this.kind === "static") {
      const cs = p.select(
        ks,
        "部品間の接触",
        [
          { value: "bonded", label: "接着 (現在)" },
          { value: "contact", label: "接触 (離れる・すべりなし)" },
        ],
        this.contactMode,
        (v) => (this.contactMode = v as "bonded" | "contact"),
      );
      cs.dataset.k = "contact";
      cs.title = "接触: 引張になる部品間の面を離して再計算します (押し付け合う面は一体、すべりはなし)";
    }
    const bc = p.section("境界条件");
    for (const key of KIND_SETS[this.kind]) {
      const pk = p.picker(bc, SET_LABEL[key], SET_ICON[key], () => this.setActive(key), () => ((this.sets[key] = []), this.boundaryChanged(), this.sync()));
      this.pickers.set(key, pk);
      bc.lastElementChild?.querySelector(".picker")?.prepend(h("span", { class: "pick-swatch", style: `background:${SET_COLOR[key]}`, title: "モデル上の表示色" }));
      if (key === "load") {
        const kindLoad = p.select(
          bc,
          "荷重の種類",
          [
            { value: "force", label: "力 (面全体の合計)" },
            { value: "pressure", label: "圧力 (面に垂直)" },
          ],
          this.loadKind,
          (v) => ((this.loadKind = v as "force"), upd()),
        );
        kindLoad.dataset.k = "loadKind";
        const forceF = p.expr(bc, "力", this.force, "N", (e) => (this.force = e));
        const presF = p.expr(bc, "圧力", this.pressure, "MPa", (e) => (this.pressure = e));
        const dirSel = p.select(bc, "方向", DIRS, this.dir, (v) => (this.dir = v as Dir));
        p.checkbox(bc, "自重を考慮 (9.81 m/s²)", this.gravity, (v) => ((this.gravity = v), upd()));
        const gSel = p.select(bc, "重力の向き", AXES.map((a) => ({ value: a, label: a })), this.gdir, (v) => (this.gdir = v as Dir));
        const upd = () => {
          forceF.el.style.display = row(dirSel).style.display = this.loadKind === "force" ? "" : "none";
          presF.el.style.display = this.loadKind === "pressure" ? "" : "none";
          row(gSel).style.display = this.gravity ? "" : "none";
        };
        upd();
      }
      if (key === "temp") p.expr(bc, "温度", this.tempT, "°C", (e) => (this.tempT = e));
      if (key === "flux") p.expr(bc, "入熱量 (合計)", this.fluxQ, "W", (e) => (this.fluxQ = e));
      if (key === "conv") {
        p.expr(bc, "熱伝達率", this.convH, "W/m²K", (e) => (this.convH = e));
        p.expr(bc, "周囲温度", this.convAmb, "°C", (e) => (this.convAmb = e));
      }
    }
    bc.appendChild(
      h(
        "div",
        { class: "drive-btns" },
        h("button", { class: "btn", title: "最も低い位置にある下向きの平面 (見えない底面) を選択中の条件に追加します", onClick: () => this.quickPick(-1) }, "底面を追加"),
        h("button", { class: "btn", title: "最も高い位置にある上向きの平面を選択中の条件に追加します", onClick: () => this.quickPick(1) }, "上面を追加"),
      ),
    );
    p.note(bc, "条件のボタンを押してから面をクリックします (色は上の四角と同じ)。裏側の面はモデルを回転させるか、「底面を追加」を使います。");
    if (this.kind === "thermalStress") p.expr(bc, "基準温度 (応力ゼロ)", this.tref, "°C", (e) => (this.tref = e));
    if (this.kind === "topology") {
      p.expr(bc, "残す体積の割合", this.volFrac, "%", (e) => (this.volFrac = e));
      const ti = p.select(bc, "反復回数", ["20", "40", "60"].map((v) => ({ value: v, label: `${v} 回` })), String(this.topoIters), (v) => (this.topoIters = Number(v)));
      ti.dataset.k = "topoIters";
      p.note(bc, "固定面と荷重面の近くは必ず残し、指定した体積で最も剛性の高い (変形しにくい) 形状を探します。結果はメッシュとして STL 書き出し・モデルへの追加ができます。");
    }
    if (this.kind === "plastic")
      p.note(bc, "完全弾塑性 (降伏後は応力一定) の材料で、荷重を 50% → 100% と段階的に加えます (割線剛性法)。荷重を支えきれない場合は「塑性崩壊」と表示し、支えられた荷重の割合を示します。");
    if (this.kind === "dynamic") {
      const dk = p.select(bc, "解析", [{ value: "harmonic", label: "周波数応答 (正弦波荷重)" }, { value: "transient", label: "過渡応答 (時刻歴)" }], this.dynKind, (v) => (this.dynKind = v as "harmonic" | "transient"));
      dk.dataset.k = "dynKind";
      p.select(bc, "荷重の時間変化 (過渡)", [{ value: "step", label: "ステップ (急に加わる)" }, { value: "halfsine", label: "半正弦パルス (衝撃)" }, { value: "sine", label: "正弦波 (1 次固有振動数)" }], this.pulse, (v) => (this.pulse = v as "step" | "halfsine" | "sine"));
      p.expr(bc, "減衰比", this.damping, "%", (e) => (this.damping = e));
      p.note(bc, "固有モードの重ね合わせ (高次モードは静的補正) で、荷重点付近の最大変位点の応答を計算します。応力のピークは静解析の応力 × 応答倍率の目安です。");
    }
    if (this.kind === "modal") {
      const ms = p.select(bc, "モード数", ["3", "6", "10"].map((v) => ({ value: v, label: `${v} 次まで` })), String(this.nModes), (v) => (this.nModes = Number(v)));
      ms.dataset.k = "modes";
    }
    const mesh = p.section("メッシュ");
    const q = p.select(mesh, "要素数", QUALITY, String(this.target), (v) => (this.target = Number(v)));
    q.dataset.k = "mesh";
    p.note(mesh, "H11 六面体要素・境界の部分体積補正・マルチグリッド法。");
    this.runBtn = h("button", { class: "btn primary", onClick: () => void this.run() }, iconEl("play"), "解析を実行") as HTMLButtonElement;
    const btns = h("div", { class: "drive-btns" }, this.runBtn);
    if (this.kind === "static" || this.kind === "thermalStress") {
      this.convBtn = h("button", { class: "btn", title: "要素数を 2.5 倍にして再解析し、結果の変化からメッシュの十分さを判定します", onClick: () => void this.convergenceCheck() }, "収束確認") as HTMLButtonElement;
      btns.append(this.convBtn);
    }
    mesh.appendChild(btns);
    const rs = p.section("結果");
    this.out = h("div", { class: "measure-out" }, "境界条件の面を選び、「解析を実行」をクリックしてください。");
    rs.appendChild(this.out);
    if (this.kind === "static" || this.kind === "thermalStress") {
      const opts = [
        { value: "vm", label: "ミーゼス応力" },
        { value: "s1", label: "最大主応力 (引張)" },
        { value: "s3", label: "最小主応力 (圧縮)" },
        { value: "disp", label: "変位" },
        { value: "sf", label: "安全率" },
      ];
      if (this.kind === "thermalStress") opts.push({ value: "temp", label: "温度" });
      if (!opts.some((o) => o.value === this.show)) this.show = "vm";
      const showSel = p.select(rs, "表示", opts, this.show, (v) => ((this.show = v as Show), this.display()));
      showSel.dataset.k = "show";
      const defSel = p.select(
        rs,
        "変形表示",
        [
          { value: "0", label: "なし" },
          { value: "auto", label: "自動倍率" },
          { value: "1", label: "実寸 (1 倍)" },
        ],
        this.deform < 0 ? "auto" : String(this.deform),
        (v) => ((this.deform = v === "auto" ? -1 : Number(v)), this.display()),
      );
      defSel.dataset.k = "deform";
    }
    if (this.kind === "modal" || this.kind === "buckling") p.checkbox(rs, "モード形状をアニメーション", this.animate, (v) => ((this.animate = v), this.display()));
    rs.appendChild(h("button", { class: "btn", onClick: () => void this.report(true) }, iconEl("export"), "PDF レポート"));
    rs.appendChild(h("button", { class: "btn", onClick: () => void this.report(false) }, iconEl("export"), "Markdown"));
    this.setActive(KIND_SETS[this.kind].includes(this.active) ? this.active : KIND_SETS[this.kind][0]);
    if (this.result) {
      this.summary();
      this.display();
    }
  }

  /** Reference material: the part's, or the first assembly body's. */
  private material() {
    return FEA_MATERIALS[this.matName()] ?? FEA_MATERIALS["汎用"];
  }
  private matName() {
    return this.mats[0]?.name ?? this.app.store.doc.material.name;
  }
  private refDensity() {
    return this.mats[0]?.density ?? this.app.store.doc.material.density;
  }
  private thermalMat() {
    return THERMAL_MATERIALS[this.matName()] ?? THERMAL_MATERIALS["汎用"];
  }

  private setActive(k: SetKey) {
    this.active = k;
    for (const [key, pk] of this.pickers) pk.setActive(key === k);
    this.app.status(`${SET_LABEL[k]}にする面をクリック (もう一度クリックで解除)`);
    this.sync();
  }

  private sync() {
    for (const [key, pk] of this.pickers) {
      const n = this.sets[key].length;
      pk.setCount(n, n ? `${n} 面` : "面を選択");
    }
    // the active set shows as the selection; the others stay visible in their own colours
    this.app.vp.setTagged(KIND_SETS[this.kind].map((k) => ({ picks: this.sets[k], color: SET_COLOR[k], opacity: k === this.active ? 0.75 : 0.5 })));
    this.app.vp.setSelection([]);
  }

  /** Add the lowest downward (-1) or highest upward (+1) planar face (Y up) to the active set. */
  private quickPick(dir: 1 | -1) {
    let best: Pick | null = null, bestY = 0;
    this.B.forEach((b, bi) =>
      b.faces.forEach((f, i) => {
        if (f.type !== "PLANE" || f.normal[1] * dir < 0.99) return;
        if (best && f.center[1] * dir <= bestY * dir) return;
        best = { kind: "face", body: bi, index: i, point: f.center };
        bestY = f.center[1];
      }),
    );
    if (!best) return toast(dir < 0 ? "下向きの平面が見つかりません" : "上向きの平面が見つかりません", "warn");
    const pk: Pick = best;
    for (const key of Object.keys(this.sets) as SetKey[]) this.sets[key] = this.sets[key].filter((x) => !(x.body === pk.body && x.index === pk.index));
    // also take the coplanar faces at the same height (e.g. a base split by feet or slots)
    this.B.forEach((b, bi) =>
      b.faces.forEach((f, i) => {
        if (f.type === "PLANE" && f.normal[1] * dir > 0.99 && Math.abs(f.center[1] - bestY) < 1e-6 && !(bi === pk.body && i === pk.index)) {
          for (const key of Object.keys(this.sets) as SetKey[]) this.sets[key] = this.sets[key].filter((x) => !(x.body === bi && x.index === i));
          this.sets[this.active].push({ kind: "face", body: bi, index: i, point: f.center });
        }
      }),
    );
    this.sets[this.active].push(pk);
    this.app.status(`${SET_LABEL[this.active]}に${dir < 0 ? "底面" : "上面"}を追加しました (${this.sets[this.active].length} 面)`);
    this.boundaryChanged();
    this.sync();
  }

  /** Boundary conditions changed: an earlier result no longer applies, and its colours would hide the picks. */
  private boundaryChanged() {
    if (!this.result) return;
    this.result = null;
    this.stopAnim();
    this.app.vp.setResult(null);
    this.app.vp.setPreviewMesh(null);
    this.legend.classList.remove("show");
    this.out.textContent = "境界条件が変わりました。「解析を実行」で再計算してください。";
  }

  // -------------------------------------------------------------- mesh ---

  /** All bodies as one triangle soup with outward winding; face picks -> triangle ids. */
  private buildMesh(): { mesh: FeaMesh; tris: (p: Pick) => number[] } {
    const bodies = this.B;
    let nv = 0, nt = 0;
    for (const b of bodies) (nv += b.positions.length / 3), (nt += b.indices.length / 3);
    const positions = new Float32Array(nv * 3), indices = new Uint32Array(nt * 3);
    const tOff: number[] = [];
    let v = 0, t = 0;
    for (const b of bodies) {
      tOff.push(t);
      positions.set(b.positions, v * 3);
      const P = b.positions, N = b.normals;
      for (let i = 0; i < b.indices.length; i += 3) {
        let a = b.indices[i], c = b.indices[i + 1], d = b.indices[i + 2];
        // orient by the (outward) shading normals so pressure acts the right way
        const ux = P[c * 3] - P[a * 3], uy = P[c * 3 + 1] - P[a * 3 + 1], uz = P[c * 3 + 2] - P[a * 3 + 2];
        const vx = P[d * 3] - P[a * 3], vy = P[d * 3 + 1] - P[a * 3 + 1], vz = P[d * 3 + 2] - P[a * 3 + 2];
        const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
        const sx = N[a * 3] + N[c * 3] + N[d * 3], sy = N[a * 3 + 1] + N[c * 3 + 1] + N[d * 3 + 1], sz = N[a * 3 + 2] + N[c * 3 + 2] + N[d * 3 + 2];
        if (nx * sx + ny * sy + nz * sz < 0) [c, d] = [d, c];
        indices[t * 3 + i] = a + v;
        indices[t * 3 + i + 1] = c + v;
        indices[t * 3 + i + 2] = d + v;
      }
      v += b.positions.length / 3;
      t += b.indices.length / 3;
    }
    const tris = (p: Pick) => {
      const b = bodies[p.body];
      const s = b.faceRanges[p.index * 2], n = b.faceRanges[p.index * 2 + 1];
      const out: number[] = [];
      for (let k = 0; k < n; k += 3) out.push(tOff[p.body] + (s + k) / 3);
      return out;
    };
    // assemblies: one closed group per body, with its own modulus / density
    const multi = new Set(this.mats.map((m) => m.name)).size > 1 || this.app.env === "assembly";
    const ref = this.material();
    const parts = multi
      ? this.B.map((b, i) => ({
          start: tOff[i],
          count: b.indices.length / 3,
          stiff: (FEA_MATERIALS[this.mats[i].name] ?? FEA_MATERIALS["汎用"]).E / ref.E,
          density: this.mats[i].density,
          name: this.names[i],
        }))
      : undefined;
    return { mesh: { positions, indices, parts }, tris };
  }

  private faceArea(p: Pick): number {
    const b = this.B[p.body];
    const s = b.faceRanges[p.index * 2], n = b.faceRanges[p.index * 2 + 1];
    let a = 0;
    const P = b.positions, I = b.indices;
    for (let k = s; k < s + n; k += 3) {
      const i = I[k] * 3, j = I[k + 1] * 3, l = I[k + 2] * 3;
      const ux = P[j] - P[i], uy = P[j + 1] - P[i + 1], uz = P[j + 2] - P[i + 2];
      const vx = P[l] - P[i], vy = P[l + 1] - P[i + 1], vz = P[l + 2] - P[i + 2];
      a += Math.hypot(uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx) / 2;
    }
    return a;
  }

  /** Structural boundary conditions; throws with a user message on invalid input. */
  private structural(tris: (p: Pick) => number[], requireLoad: boolean): FeaBoundary {
    const S = this.sets;
    if (!S.fixed.length) throw new Error("固定拘束の面を選択してください");
    if (requireLoad && !S.load.length && !this.gravity) throw new Error("荷重をかける面を選択するか、自重を有効にしてください");
    const v = this.app.values();
    const bc: FeaBoundary = { fixed: S.fixed.map(tris), loads: [] };
    if (S.load.length) {
      if (this.loadKind === "pressure") {
        const pr = evalWith(v, this.pressure);
        bc.loads = S.load.map((p) => ({ tris: tris(p), pressure: pr }));
      } else {
        const F = evalWith(v, this.force);
        const areas = S.load.map((p) => this.faceArea(p));
        const total = areas.reduce((a, b) => a + b, 0) || 1;
        bc.loads = S.load.map((p, i) => {
          const f = this.B[p.body].faces[p.index];
          const share = (F * areas[i]) / total;
          const d = this.dir;
          const vec: [number, number, number] =
            d === "push" || d === "pull" ? (f.normal.map((x) => x * share * (d === "push" ? -1 : 1)) as [number, number, number]) : (axisVec(d).map((x) => x * share) as [number, number, number]);
          return { tris: tris(p), force: vec };
        });
      }
    }
    if (this.gravity) bc.gravity = { density: this.refDensity(), dir: axisVec(this.gdir) };
    return bc;
  }

  private thermalBc(tris: (p: Pick) => number[]): ThermalBoundary {
    const S = this.sets;
    const v = this.app.values();
    if (!S.temp.length && !S.conv.length) throw new Error("温度固定面または対流面を選択してください (熱の逃げ場が必要です)");
    return {
      temperature: S.temp.length ? [{ tris: S.temp.flatMap(tris), T: evalWith(v, this.tempT) }] : [],
      flux: S.flux.length ? [{ tris: S.flux.flatMap(tris), Q: evalWith(v, this.fluxQ) }] : [],
      convection: S.conv.length ? [{ tris: S.conv.flatMap(tris), hc: evalWith(v, this.convH), Tamb: evalWith(v, this.convAmb) }] : [],
    };
  }

  private request(target: number): FeaRequest {
    const { mesh, tris } = this.buildMesh();
    const k = this.kind;
    const req: FeaRequest = { kind: k, mesh, bc: { fixed: [], loads: [] }, mat: this.material(), opt: { targetElements: target } };
    if (k === "static") {
      req.bc = this.structural(tris, true);
      if (this.app.env === "assembly" && this.contactMode === "contact") req.opt.contact = "contact";
    }
    if (k === "buckling") {
      req.bc = this.structural(tris, true);
      req.opt.targetElements = Math.min(target, 60000);
    }
    if (k === "topology") {
      req.bc = this.structural(tris, true);
      req.opt.targetElements = Math.min(target, 12000);
      req.topo = { volFrac: evalWith(this.app.values(), this.volFrac) / 100, iterations: this.topoIters };
    }
    if (k === "plastic") {
      req.bc = this.structural(tris, true);
      req.opt.targetElements = Math.min(target, 30000);
    }
    if (k === "dynamic") {
      req.bc = this.structural(tris, true);
      req.opt.targetElements = Math.min(target, 40000);
      req.density = this.refDensity();
      req.dynamic = { kind: this.dynKind, damping: evalWith(this.app.values(), this.damping) / 100, pulse: this.pulse, nModes: 8 };
    }
    if (k === "modal") {
      if (!this.sets.fixed.length) throw new Error("固定拘束の面を選択してください");
      req.bc = { fixed: this.sets.fixed.map(tris), loads: [] };
      req.density = this.refDensity();
      req.modes = this.nModes;
    }
    if (k === "thermal" || k === "thermalStress") {
      req.thermal = { bc: this.thermalBc(tris), mat: this.thermalMat(), Tref: evalWith(this.app.values(), this.tref) };
      if (k === "thermalStress") req.bc = this.structural(tris, false);
    }
    return req;
  }

  private solve(req: FeaRequest, status: (s: string) => void): Promise<AnyResult> {
    this.worker?.terminate();
    const w = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });
    this.worker = w;
    // multi-core solver threads (only with cross-origin isolation)
    const helpers = spawnKxHelpers();
    if (helpers) req.ports = helpers.ports;
    return new Promise<AnyResult>((resolve, reject) => {
      w.onmessage = (e) => {
        const d = e.data as { progress?: { it: number; res: number }; result?: AnyResult; error?: string };
        if (d.progress) status(`計算中… 反復 ${d.progress.it} (残差 ${d.progress.res.toExponential(1)})`);
        else if (d.result) resolve(d.result);
        else reject(new Error(d.error));
      };
      w.onerror = (e) => reject(new Error(e.message));
      w.postMessage(req, req.ports ?? []);
    }).finally(() => {
      w.terminate();
      helpers?.stop();
      if (this.worker === w) this.worker = null;
    });
  }

  private setBusy(b: boolean) {
    this.runBtn.disabled = b;
    if (this.convBtn) this.convBtn.disabled = b;
  }

  private async run() {
    this.setBusy(true);
    this.out.textContent = "メッシュ作成・計算中…";
    const t0 = performance.now();
    try {
      const req = this.request(this.target);
      this.result = await this.solve(req, (s) => (this.out.textContent = s));
      this.resultKind = this.kind;
      this.convergence = null;
      this.sub = null;
      this.modeIndex = 0;
      this.lastTime = (performance.now() - t0) / 1000;
      this.summary();
      this.display();
    } catch (e) {
      this.out.textContent = `解析できませんでした: ${(e as Error).message}`;
    } finally {
      this.setBusy(false);
    }
  }

  /** Solve again with 2.5× the elements and compare the key results. */
  /** Sub-model around the von Mises peak (away from support edges), ~10× finer. */
  private async zoom() {
    const r = this.result as FeaResult | null;
    if (!r || this.resultKind !== "static") return;
    const [nx, ny, nz] = r.dims;
    const NX = nx + 1, NY = ny + 1, NZ = nz + 1;
    // supports' neighbourhood (2 cells) is singular by nature: skip it
    const near = new Uint8Array(r.vm.length);
    if (r.fixedMask)
      for (let n = 0; n < r.fixedMask.length; n++) {
        if (!r.fixedMask[n]) continue;
        const i = n % NX, j = Math.floor(n / NX) % NY, k = Math.floor(n / (NX * NY));
        for (let dk = -2; dk <= 2; dk++)
          for (let dj = -2; dj <= 2; dj++)
            for (let di = -2; di <= 2; di++) {
              const a = i + di, b = j + dj, c = k + dk;
              if (a >= 0 && b >= 0 && c >= 0 && a < NX && b < NY && c < NZ) near[(c * NY + b) * NX + a] = 1;
            }
      }
    let best = -1, bv = -1;
    for (let n = 0; n < r.vm.length; n++) if (r.used[n] && !near[n] && r.vm[n] > bv) (bv = r.vm[n]), (best = n);
    if (best < 0) return void toast("詳細解析する箇所が見つかりません", "warn");
    const c = [best % NX, Math.floor(best / NX) % NY, Math.floor(best / (NX * NY))].map((v, k) => r.origin[k] + v * r.h);
    const half = r.h * 4;
    const lo = c.map((v) => v - half) as [number, number, number], hi = c.map((v) => v + half) as [number, number, number];
    this.setBusy(true);
    const keep = this.out.innerHTML;
    this.out.textContent = "最大応力部を詳細解析中…";
    try {
      const req = this.request(this.target);
      req.opt = { targetElements: Math.max(this.target, 20000), region: { lo, hi } };
      req.bc = { ...req.bc, submodel: { h: r.h, origin: r.origin, dims: r.dims, used: r.used, disp: r.disp } };
      const z = (await this.solve(req, (s) => (this.out.textContent = `詳細解析: ${s}`))) as FeaResult;
      this.sub = { r: z, lo, hi };
      this.summary();
      this.display();
    } catch (e) {
      this.out.innerHTML = keep;
      toast(`詳細解析に失敗しました: ${(e as Error).message}`, "error");
    } finally {
      this.setBusy(false);
    }
  }

  private async convergenceCheck() {
    if (!this.result) await this.run();
    const base = this.result as FeaResult | null;
    if (!base) return;
    this.setBusy(true);
    const keep = this.out.innerHTML;
    this.out.textContent = "細かいメッシュで再解析中…";
    try {
      const fine = (await this.solve(this.request(Math.round(this.target * 2.5)), (s) => (this.out.textContent = `収束確認: ${s}`))) as FeaResult;
      this.convergence = {
        dVm: Math.abs(fine.maxVm - base.maxVm) / Math.max(fine.maxVm, 1e-12),
        dDisp: Math.abs(fine.maxDisp - base.maxDisp) / Math.max(fine.maxDisp, 1e-12),
        elems: fine.elements,
      };
      this.result = fine;
      this.sub = null;
      this.summary();
      this.display();
    } catch (e) {
      this.out.innerHTML = keep;
      toast(`収束確認に失敗しました: ${(e as Error).message}`, "error");
    } finally {
      this.setBusy(false);
    }
  }

  // ----------------------------------------------------------- results ---

  /** Fatigue limit for fully reversed loading (endurance ~0.5 UTS for metals, ~0.3 for plastics). */
  private enduranceLimit(): number {
    const m = this.material();
    const metal = m.E > 30000;
    return (m.uts ?? m.yield * 1.4) * (metal ? 0.5 : 0.3);
  }

  private summary() {
    const r = this.result!;
    const mat = this.material();
    this.out.innerHTML = "";
    const row = (k: string, v: string, cls = "", title = "") => this.out.appendChild(h("div", { class: "mo-row " + cls, title }, h("span", {}, k), h("b", {}, v)));
    const time = this.lastTime ? ` / ${formatNumber(this.lastTime, 1)} 秒` : "";
    if (this.resultKind === "topology") {
      const t = r as TopoResult;
      row("体積", `${(t.volumeFraction * 100).toFixed(1)} % (元形状比)`);
      row("剛性", `元形状の ${(t.stiffnessRatio * 100).toFixed(1)} %`, "", "同じ荷重での変形のしにくさ (コンプライアンスの逆数) の比");
      row("材料あたりの剛性", `${(t.stiffnessRatio / t.volumeFraction).toFixed(2)} 倍`, t.stiffnessRatio / t.volumeFraction > 0.6 ? "ok" : "", "体積を減らした割に剛性がどれだけ残ったか");
      row("計算", `${t.elements.toLocaleString()} 要素 / ${t.iterations} 反復${time}${t.converged ? "" : " (反復上限)"}`);
      const btns = h(
        "div",
        { class: "drive-btns" },
        h("button", { class: "btn", onClick: () => download(`${this.app.env === "assembly" ? this.app.asm.doc.name : this.app.store.doc.name}_最適化.stl`, trisToStl(t.surface.positions, t.surface.indices) as BlobPart, "model/stl") }, iconEl("export"), "STL 書き出し"),
        h("button", { class: "btn", onClick: () => this.addTopoBody(t) }, iconEl("import"), "モデルに追加"),
      );
      this.out.appendChild(btns);
      return;
    }
    if (this.resultKind === "modal") {
      const m = r as ModalResult;
      m.freqs.forEach((f, i) => {
        const p = m.participation[i];
        const el = h(
          "div",
          { class: "mo-row mode-row" + (i === this.modeIndex ? " on" : ""), title: "クリックでこのモードを表示" },
          h("span", {}, `${i + 1} 次`),
          h("b", {}, `${formatNumber(f, 1)} Hz`),
          h("small", { class: "muted" }, `有効質量 X ${(p[0] * 100).toFixed(0)}% Y ${(p[1] * 100).toFixed(0)}% Z ${(p[2] * 100).toFixed(0)}%`),
        );
        el.addEventListener("click", () => ((this.modeIndex = i), this.summary(), this.display()));
        this.out.appendChild(el);
      });
      row("質量", `${formatNumber(m.totalMass * 1e6, 1)} g`);
      row("計算", `${m.elements.toLocaleString()} 要素 / ${m.iterations} 反復${time}${m.converged ? "" : " (未収束)"}`, m.converged ? "" : "warn");
      return;
    }
    if (this.resultKind === "buckling") {
      const b = r as BucklingResult;
      const f = b.factor;
      row("座屈荷重係数", f > 0 ? formatNumber(f, 3) : "座屈しません (引張側)", f > 0 && f < 1 ? "bad" : f > 0 && f < 3 ? "warn" : "ok", "現在の荷重の何倍で座屈するか");
      if (f > 0 && this.loadKind === "force") row("座屈荷重", `${formatNumber(f * evalWith(this.app.values(), this.force), 1)} N`);
      row("静解析: 最大ミーゼス応力", `${formatNumber(b.static.maxVm, 2)} MPa (安全率 ${formatNumber(mat.yield / Math.max(b.static.maxVm, 1e-12), 2)})`);
      row("計算", `${b.static.elements.toLocaleString()} 要素 / ${b.iterations} 反復${time}${b.converged ? "" : " (未収束)"}`, b.converged ? "" : "warn");
      if (f > 0 && f < 1) toast("座屈します (荷重係数 < 1)", "warn");
      return;
    }
    if (this.resultKind === "thermal") {
      const t = r as ThermalResult;
      row("最高温度", `${formatNumber(t.maxT, 2)} °C`);
      row("最低温度", `${formatNumber(t.minT, 2)} °C`);
      row("放熱量", `${formatNumber(t.heatOut, 3)} W${t.heatIn ? ` (入熱 ${formatNumber(t.heatIn, 3)} W)` : ""}`, "", "温度固定面と対流面から逃げる熱量 (入熱と釣り合うはず)");
      row("計算", `${t.elements.toLocaleString()} 要素 / ${t.iterations} 反復${time}${t.converged ? "" : " (未収束)"}`, t.converged ? "" : "warn");
      return;
    }
    const s = r as FeaResult & { thermal?: ThermalResult; plastic?: Omit<PlasticResult, "result">; dynamic?: Omit<DynamicResult, "staticResult"> };
    if (s.plastic) {
      const p = s.plastic;
      row("判定", p.collapsed ? `塑性崩壊 (荷重の ${Math.round(p.loadFactor * 100)} % まで支持)` : p.notConverged ? `収束せず (荷重の ${Math.round(p.loadFactor * 100)} % まで計算、メッシュや荷重を見直してください)` : p.plasticFraction > 0 ? "局所的に降伏 (荷重は支持)" : "弾性範囲内", p.collapsed ? "bad" : p.notConverged || p.plasticFraction > 0 ? "warn" : "ok");
      row("降伏した体積", `${formatNumber(p.plasticFraction * 100, 2)} %`);
      row("相当塑性ひずみ (最大, 目安)", `${formatNumber(p.maxPlasticStrain * 100, 3)} %`);
      row("最大変位 / 線形解析", `${formatNumber(s.maxDisp, 4)} / ${formatNumber(p.linearDisp * p.loadFactor, 4)} mm`, "", "同じ荷重レベルでの線形解析との比較");
      this.out.appendChild(chart("荷重割合 – 最大変位 mm", p.curve.map((c) => c.load), p.curve.map((c) => c.disp)));
    }
    if (s.dynamic) {
      const d = s.dynamic;
      const harmonic = d.kind === "harmonic";
      row(harmonic ? "応答のピーク周波数" : "ピーク時刻", harmonic ? `${formatNumber(d.peakAt, 1)} Hz` : `${formatNumber(d.peakAt * 1000, 2)} ms`);
      row("応答倍率 (動的 / 静的)", `${formatNumber(d.amplification, 2)} 倍`, d.amplification > 5 ? "bad" : d.amplification > 2 ? "warn" : "ok");
      row("最大ミーゼス応力 (動的, 目安)", `${formatNumber(d.peakVm, 2)} MPa (安全率 ${formatNumber(mat.yield / Math.max(d.peakVm, 1e-12), 2)})`, d.peakVm > mat.yield ? "bad" : "");
      row("固有振動数", d.freqs.slice(0, 4).map((f) => `${formatNumber(f, 1)}`).join(" / ") + " Hz");
      this.out.appendChild(chart(harmonic ? "振幅 mm – 周波数 Hz" : "変位 mm – 時間 s", d.x, d.y.map(Math.abs)));
      this.out.appendChild(h("div", { class: "muted" }, "以下は静的な荷重 (振幅 1 倍) の結果です。"));
    }
    const sf = s.maxVm > 0 ? mat.yield / s.maxVm : Infinity;
    if (s.thermal) row("温度範囲", `${formatNumber(s.thermal.minT, 1)} 〜 ${formatNumber(s.thermal.maxT, 1)} °C`);
    row("最大ミーゼス応力", `${formatNumber(s.maxVm, 2)} MPa`);
    row("最大主応力 / 最小主応力", `${formatNumber(s.maxS1, 2)} / ${formatNumber(s.minS3, 2)} MPa`);
    row("最大変位", `${formatNumber(s.maxDisp, 4)} mm`);
    row("最小安全率 (降伏)", Number.isFinite(sf) ? formatNumber(sf, 2) : "∞", sf < 1 ? "bad" : sf < 2 ? "warn" : "ok");
    const fsf = s.maxVm > 0 ? this.enduranceLimit() / s.maxVm : Infinity;
    row("疲労安全率 (両振り)", Number.isFinite(fsf) ? formatNumber(fsf, 2) : "∞", fsf < 1 ? "bad" : fsf < 1.5 ? "warn" : "ok", `疲労限度 ${formatNumber(this.enduranceLimit(), 0)} MPa (引張強さからの推定) に対する完全両振りの安全率`);
    const rf = Math.hypot(...s.reaction);
    if (!s.thermal) row("支点反力", `${formatNumber(rf, 2)} N (つり合い誤差 ${eqText(s.equilibriumError)})`, s.equilibriumError < 1e-3 ? "ok" : "warn", "反力の合計が荷重の合計と釣り合っているかの検算です");
    if (s.contact) {
      const c = s.contact;
      row(
        "部品間の接触",
        c.faces ? `接触 ${c.closed.toLocaleString()} 面 / 離れた ${c.released.toLocaleString()} 面 (${c.iterations} 回)` : "接する面がありません",
        c.converged ? "" : "warn",
        c.converged ? "引張になる部品間の面を離して再計算した結果です" : "接触状態が反復上限までに確定しませんでした (結果は目安)",
      );
    }
    row("要素", `${s.elements.toLocaleString()} 個 (要素サイズ ${formatNumber(s.h, 2)} mm)`);
    row("計算", `${s.iterations} 反復${time}${s.converged ? "" : " (未収束)"}`, s.converged ? "" : "warn");
    if (this.convergence) {
      const c = this.convergence;
      const ok = c.dVm < 0.05 && c.dDisp < 0.02;
      row("メッシュ収束", `応力 ${(c.dVm * 100).toFixed(1)}% / 変位 ${(c.dDisp * 100).toFixed(1)}% の変化`, ok ? "ok" : "warn", ok ? "十分に収束しています" : "変化が大きいため、さらに細かいメッシュを推奨します");
    }
    if (this.sub) {
      const z = this.sub.r;
      row("詳細解析: 最大ミーゼス応力", `${formatNumber(z.maxVm, 2)} MPa (要素 ${formatNumber(z.h, 2)} mm)`, "", "最大応力部の周囲を細かいメッシュで再解析した値 (サブモデル法)");
      row("詳細解析: 最大主応力", `${formatNumber(z.maxS1, 2)} MPa / 安全率 ${formatNumber(mat.yield / Math.max(z.maxVm, 1e-12), 2)}`);
    }
    if (this.resultKind === "static" && !s.thermal)
      this.out.appendChild(
        h("div", { class: "drive-btns" }, h("button", { class: "btn", title: "最大応力部の周囲だけを約 10 倍細かいメッシュで再解析します (固定面の縁の特異点は除外)", onClick: () => void this.zoom() }, iconEl("search"), "最大応力部を詳細解析")),
      );
    if (sf < 1) toast("降伏応力を超えています (安全率 < 1)", "warn");
  }

  private stopAnim() {
    cancelAnimationFrame(this.anim);
    this.anim = 0;
  }

  private setLegend(title: string, lo: number, hi: number, digits: number, extra = "", invertLabel = false) {
    const stops = [1, 0.75, 0.5, 0.25, 0].map((t) => {
      const c = colormap(t).map((x) => Math.round(x * 255)).join(",");
      const v = invertLabel ? hi - (hi - lo) * t : lo + (hi - lo) * t;
      return h("div", { class: "fl-row" }, h("span", { class: "fl-sw", style: `background:rgb(${c})` }), h("span", {}, formatNumber(v, digits)));
    });
    this.legend.innerHTML = "";
    this.legend.append(h("div", { class: "fl-title" }, title), ...stops, extra ? h("div", { class: "muted" }, extra) : "");
    this.legend.classList.add("show");
  }

  private display() {
    this.stopAnim();
    const r = this.result;
    if (!r) return;
    const bodies = this.B;
    const size = this.app.vp.modelBounds().getSize(new THREE.Vector3()).length();
    const kind = this.resultKind;
    if (kind !== "topology") this.app.vp.setPreviewMesh(null);
    if (kind === "topology") {
      this.app.vp.setResult(null);
      this.app.vp.setPreviewMesh((r as TopoResult).surface);
      this.legend.classList.remove("show");
      return;
    }
    if (kind === "modal" || kind === "buckling") {
      const grid = r as GridLike;
      const mode = kind === "modal" ? (r as ModalResult).modes[this.modeIndex] : (r as BucklingResult).mode;
      const amp = size * 0.08;
      const per = bodies.map((b) => {
        const n = b.positions.length / 3;
        const vec = new Float32Array(n * 3), colors = new Float32Array(n * 3);
        for (let i = 0; i < n; i++) {
          const d = sampleNodal(grid, mode, 3, b.positions.subarray(i * 3, i * 3 + 3));
          vec.set(d, i * 3);
          colors.set(colormap(Math.hypot(d[0], d[1], d[2])), i * 3);
        }
        return { vec, colors, base: b.positions };
      });
      const frame = (s: number) =>
        this.app.vp.setResult(
          per.map((p) => {
            const pos = new Float32Array(p.base);
            for (let i = 0; i < pos.length; i++) pos[i] += p.vec[i] * amp * s;
            return { colors: p.colors, positions: pos };
          }),
        );
      const title = kind === "modal" ? `${this.modeIndex + 1} 次モード ${formatNumber((r as ModalResult).freqs[this.modeIndex], 1)} Hz` : `座屈モード (係数 ${formatNumber((r as BucklingResult).factor, 3)})`;
      this.setLegend(`${title} — 相対変位`, 0, 1, 2);
      if (this.animate) {
        const t0 = performance.now();
        let last = 0;
        const loop = (t: number) => {
          if (t - last > 33) {
            last = t;
            frame(Math.sin(((t - t0) / 1000) * Math.PI * 1.2));
          }
          this.anim = requestAnimationFrame(loop);
        };
        this.anim = requestAnimationFrame(loop);
      } else frame(1);
      return;
    }
    if (kind === "thermal" || (kind === "thermalStress" && this.show === "temp")) {
      const t = kind === "thermal" ? (r as ThermalResult) : (r as FeaResult & { thermal: ThermalResult }).thermal;
      const span = t.maxT - t.minT || 1;
      const per = bodies.map((b) => {
        const n = b.positions.length / 3;
        const colors = new Float32Array(n * 3);
        for (let i = 0; i < n; i++) colors.set(colormap((sampleNodal(t, t.T, 1, b.positions.subarray(i * 3, i * 3 + 3))[0] - t.minT) / span), i * 3);
        return { colors };
      });
      this.app.vp.setResult(per);
      this.setLegend("温度 [°C]", t.minT, t.maxT, 1);
      return;
    }
    const s = r as FeaResult;
    const mat = this.material();
    const scale = this.deform < 0 ? (s.maxDisp > 0 ? (size * 0.08) / s.maxDisp : 0) : this.deform;
    const show = this.show;
    let lo = 0, hi = 1;
    if (show === "vm") hi = s.maxVm;
    else if (show === "disp") hi = s.maxDisp;
    else if (show === "s1" || show === "s3") {
      const m = Math.max(Math.abs(s.maxS1), Math.abs(s.minS3), 1e-12);
      lo = -m;
      hi = m;
    } else hi = 15;
    const field = show === "s1" ? s.s1 : show === "s3" ? s.s3 : s.vm;
    const z = this.sub;
    const zfield = z ? (show === "s1" ? z.r.s1 : show === "s3" ? z.r.s3 : z.r.vm) : null;
    /** Inside the zoom box the refined result is shown. */
    const src = (p: ArrayLike<number>): [FeaResult, Float32Array] =>
      z && [0, 1, 2].every((k) => p[k] >= z.lo[k] && p[k] <= z.hi[k]) ? [z.r, zfield!] : [s, field];
    const per = bodies.map((b) => {
      const n = b.positions.length / 3;
      const colors = new Float32Array(n * 3);
      const pos = scale ? new Float32Array(b.positions) : undefined;
      for (let i = 0; i < n; i++) {
        const p = b.positions.subarray(i * 3, i * 3 + 3);
        let val: number;
        const [rs, fs] = src(p);
        if (show === "disp") val = Math.hypot(...sampleDisp(rs, p));
        else if (show === "sf") {
          const v = sampleNodal(rs, rs.vm, 1, p)[0];
          val = Math.min(15, v > 0 ? mat.yield / v : 15);
        } else val = sampleNodal(rs, fs, 1, p)[0];
        const t = show === "sf" ? 1 - val / 15 : (val - lo) / (hi - lo || 1);
        colors.set(colormap(t), i * 3);
        if (pos) {
          const d = sampleDisp(s, p);
          pos[i * 3] += d[0] * scale;
          pos[i * 3 + 1] += d[1] * scale;
          pos[i * 3 + 2] += d[2] * scale;
        }
      }
      return { colors, positions: pos };
    });
    this.app.vp.setResult(per);
    const title = { vm: "ミーゼス応力 [MPa]", s1: "最大主応力 [MPa]", s3: "最小主応力 [MPa]", disp: "変位 [mm]", sf: "安全率", temp: "温度" }[show];
    if (show === "sf") this.setLegend(title, 0, 15, 1, scale ? `変形倍率 ×${formatNumber(scale, 1)}` : "", true);
    else this.setLegend(title, lo, hi, show === "disp" ? 4 : 2, scale ? `変形倍率 ×${formatNumber(scale, 1)}` : "");
  }

  private async report(pdf: boolean) {
    const r = this.result;
    if (!r) return void toast("先に解析を実行してください", "warn");
    const doc = { name: this.app.env === "assembly" ? this.app.asm.doc.name : this.app.store.doc.name, material: { name: this.app.env === "assembly" ? `部品ごと (基準 ${this.matName()})` : this.matName(), density: this.refDensity() } };
    const mat = this.material();
    const kindLabel = KINDS.find((k) => k.value === this.resultKind)!.label;
    const lines = [`# ${kindLabel} レポート — ${doc.name}`, ``, `## 条件`, ``, `| 項目 | 値 |`, `|---|---|`, `| 材料 | ${doc.material.name} (E=${mat.E} MPa, ν=${mat.nu}, 降伏 ${mat.yield} MPa, 密度 ${doc.material.density} g/cm³) |`];
    for (const k of KIND_SETS[this.resultKind]) if (this.sets[k].length) lines.push(`| ${SET_LABEL[k]} | ${this.sets[k].length} 面 |`);
    if (KIND_SETS[this.resultKind].includes("load") && this.sets.load.length) lines.push(`| 荷重 | ${this.loadKind === "pressure" ? `圧力 ${this.pressure} MPa` : `${this.force} N (${DIRS.find((d) => d.value === this.dir)!.label})`} |`);
    if (this.resultKind === "thermal" || this.resultKind === "thermalStress") {
      const tm = this.thermalMat();
      lines.push(`| 熱物性 | 熱伝導率 ${tm.k} W/(m·K), 線膨張 ${tm.alpha} 1/K |`);
      if (this.sets.temp.length) lines.push(`| 固定温度 | ${this.tempT} °C |`);
      if (this.sets.flux.length) lines.push(`| 入熱 | ${this.fluxQ} W |`);
      if (this.sets.conv.length) lines.push(`| 対流 | ${this.convH} W/(m²·K), 周囲 ${this.convAmb} °C |`);
    }
    lines.push(``, `## 結果`, ``, `| 項目 | 値 |`, `|---|---|`);
    if (this.resultKind === "modal") {
      const m = r as ModalResult;
      m.freqs.forEach((f, i) => lines.push(`| ${i + 1} 次固有振動数 | ${formatNumber(f, 2)} Hz (有効質量 X ${(m.participation[i][0] * 100).toFixed(1)}%, Y ${(m.participation[i][1] * 100).toFixed(1)}%, Z ${(m.participation[i][2] * 100).toFixed(1)}%) |`));
    } else if (this.resultKind === "buckling") {
      const b = r as BucklingResult;
      lines.push(`| 座屈荷重係数 | ${formatNumber(b.factor, 4)} |`, `| 静解析の最大ミーゼス応力 | ${formatNumber(b.static.maxVm, 3)} MPa |`);
    } else if (this.resultKind === "thermal") {
      const t = r as ThermalResult;
      lines.push(`| 最高 / 最低温度 | ${formatNumber(t.maxT, 2)} / ${formatNumber(t.minT, 2)} °C |`, `| 放熱量 | ${formatNumber(t.heatOut, 4)} W |`);
    } else {
      const s = r as FeaResult;
      lines.push(
        `| 最大ミーゼス応力 | ${formatNumber(s.maxVm, 3)} MPa |`,
        `| 最大主応力 / 最小主応力 | ${formatNumber(s.maxS1, 3)} / ${formatNumber(s.minS3, 3)} MPa |`,
        `| 最大変位 | ${formatNumber(s.maxDisp, 5)} mm |`,
        `| 最小安全率 (降伏) | ${s.maxVm > 0 ? formatNumber(mat.yield / s.maxVm, 3) : "∞"} |`,
        `| 疲労安全率 (両振り) | ${s.maxVm > 0 ? formatNumber(this.enduranceLimit() / s.maxVm, 3) : "∞"} |`,
        `| 反力合計 | (${s.reaction.map((x) => formatNumber(x, 3)).join(", ")}) N |`,
        `| 要素 | ${s.elements} 個 (サイズ ${formatNumber(s.h, 3)} mm) |`,
      );
      if (this.convergence) lines.push(`| メッシュ収束 | 応力 ${(this.convergence.dVm * 100).toFixed(1)} % / 変位 ${(this.convergence.dDisp * 100).toFixed(1)} % |`);
    }
    lines.push(
      ``,
      `解析手法: ボクセル六面体 H11 要素 (非適合モード)、境界の部分体積補正、マルチグリッド前処理付き共役勾配法 / LOBPCG (固有値) / 逆反復 (座屈)。理論解に対し、たわみ ±2%・応力集中 ±5%・固有振動数 ±3%・座屈荷重 ±5% を自動テストで確認済み。`,
    );
    const file = `${doc.name}_${kindLabel.replace(/ .*/, "")}`;
    if (!pdf) return download(`${file}.md`, lines.join("\n"), "text/markdown");
    const legend = this.legend.textContent?.replace(/\s+/g, " ").trim();
    const html = reportHtml(file, lines.join("\n"), this.app.vp.capture(2), legend);
    const desktop = (window as unknown as { desktop?: { printPdf?: (html: string, w: number, h: number, name: string) => Promise<boolean> } }).desktop;
    if (desktop?.printPdf) {
      if (await desktop.printPdf(html, 210, 297, `${file}.pdf`)) toast("PDF レポートを保存しました", "ok");
      return;
    }
    const win = window.open("", "_blank");
    if (!win) return void download(`${file}.html`, html, "text/html");
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 400);
  }

  /** The optimised shape as a mesh body (import feature), for reference or further modelling. */
  private addTopoBody(t: TopoResult) {
    const stl = trisToStl(t.surface.positions, t.surface.indices);
    let bin = "";
    for (let i = 0; i < stl.length; i += 0x8000) bin += String.fromCharCode(...stl.subarray(i, i + 0x8000));
    const store = this.app.store;
    store.mutate("最適化形状を追加", (d) =>
      store.insertFeature(d, { id: `im${Date.now().toString(36)}`, type: "import", name: "最適化形状", format: "stl", fileName: "topology.stl", data: btoa(bin) }),
    );
    toast("最適化形状をボディとして追加しました (元のボディは「パーツの終わり」や抑制で非表示にできます)", "ok", 6000);
  }

  private close() {
    this.stopAnim();
    this.worker?.terminate();
    this.app.vp.setResult(null);
    this.app.vp.setPreviewMesh(null);
    this.app.vp.setTagged([]);
    this.legend.remove();
    this.panel.close();
  }

  ok() {
    this.close();
  }
  cancel() {
    this.close();
  }
}
