import type { App } from "../app";
import type { Command } from "../commands/command";
import { formatNumber } from "../core/expr";
import { evalWith } from "../core/params";
import { holeCenterPoints, planeToWorld } from "../core/resolve";
import type { SketchFeature, SkPoint, Vec2, Vec3 } from "../core/types";
import { findRegions } from "../sketch/profiles";
import { download, h, toast } from "../ui/dom";
import { PropertyPanel } from "../ui/panel";
import { generateToolpath, toGcode, type CamOp, type CamResult, type CamTool } from "./toolpath";

/** 2.5D CAM: pocket / contour / drill from a sketch, toolpath preview, G-code. */
export class CamCommand implements Command {
  readonly id = "cam";
  private panel: PropertyPanel;
  private out: HTMLElement;
  private res: CamResult | null = null;
  private st = { sketch: "", kind: "pocket" as CamOp["kind"], d: "6", stepover: "40", stepdown: "2", depth: "5", feed: "600", plunge: "150", rpm: "8000", safe: "5", allowance: "0", peck: "0", outside: true };
  constructor(private app: App) {
    const sketches = app.store.doc.features.filter((f): f is SketchFeature => f.type === "sketch");
    const sel = [...app.browserSelection].find((id) => sketches.some((s) => s.id === id));
    this.st.sketch = sel ?? sketches.at(-1)?.id ?? "";
    this.panel = new PropertyPanel(app.panelHost, "CAM (2.5 軸)", "cam", { onOk: () => app.finishCommand(this, true), onCancel: () => app.finishCommand(this, false) }, () => app.values());
    const p = this.panel;
    const s = p.section("加工");
    p.select(s, "スケッチ", sketches.map((k) => ({ value: k.id, label: k.name })), this.st.sketch, (v) => ((this.st.sketch = v), this.run()));
    p.select(s, "加工方法", [{ value: "pocket", label: "ポケット" }, { value: "contour", label: "輪郭" }, { value: "drill", label: "穴あけ" }], this.st.kind, (v) => ((this.st.kind = v as CamOp["kind"]), this.run()));
    p.checkbox(s, "輪郭: 外側を加工", this.st.outside, (v) => ((this.st.outside = v), this.run()));
    const f = (sec: HTMLElement, label: string, k: keyof typeof this.st, unit: string) => p.expr(sec, label, String(this.st[k]), unit, (e) => (((this.st as Record<string, unknown>)[k] = e), this.run()));
    f(s, "深さ", "depth", "mm");
    f(s, "仕上げ代", "allowance", "mm");
    f(s, "ペック量 (穴あけ)", "peck", "mm");
    const t = p.section("工具・条件");
    f(t, "工具径", "d", "mm");
    f(t, "ステップオーバー", "stepover", "%");
    f(t, "切込み深さ", "stepdown", "mm");
    f(t, "送り速度", "feed", "mm/min");
    f(t, "突込み速度", "plunge", "mm/min");
    f(t, "回転数", "rpm", "min⁻¹");
    f(t, "安全高さ", "safe", "mm");
    const r = p.section("結果");
    this.out = h("div", { class: "measure-out" });
    r.append(this.out, h("button", { class: "btn", "data-k": "cam-gcode", onClick: () => this.exportGcode() }, "G コード書き出し (.nc)"));
    p.note(r, "座標系はスケッチ平面 (原点 = スケッチ原点、Z = 法線方向、0 = スケッチ面) です。青: 切削送り、赤破線: 早送り。干渉チェック (固定具・残り形状) は行いません。");
    app.vp.setSelection([]);
    this.run();
  }
  /** Field value: number, expression or parameter name (NaN when invalid). */
  private num(e: string): number {
    try {
      return evalWith(this.app.values(), e);
    } catch {
      return NaN;
    }
  }
  /** Invalidate the previous toolpath so a stale path can never be exported. */
  private fail(msg: string) {
    this.res = null;
    this.app.vp.setToolpath(null);
    this.out.textContent = msg;
  }
  private tool(): CamTool {
    const n = (e: string) => this.num(e);
    return { d: n(this.st.d), stepover: n(this.st.stepover) / 100, stepdown: n(this.st.stepdown), feed: n(this.st.feed), plunge: n(this.st.plunge), rpm: n(this.st.rpm) };
  }
  private run() {
    const sk = this.app.store.doc.features.find((x) => x.id === this.st.sketch) as SketchFeature | undefined;
    if (!sk) return this.fail("スケッチを選択してください");
    const tool = this.tool();
    const vals = [tool.d, tool.stepover, tool.stepdown, tool.feed, tool.plunge, this.num(this.st.depth), this.num(this.st.safe)];
    const extra = [this.num(this.st.allowance), this.num(this.st.peck)];
    if (!vals.every((x) => x > 0) || !extra.every((x) => x >= 0)) {
      this.panel.setError("値は正の数 (仕上げ代・ペック量は 0 以上) にしてください");
      return this.fail("条件を見直してください");
    }
    this.panel.setError(null);
    const regions = findRegions(sk.entities).filter((g) => !g.island).map((g) => ({ outer: g.outerPoly, holes: g.holePolys }));
    const pts: Vec2[] = holeCenterPoints(sk).map((q) => [q.x, q.y]);
    const pmap = new Map(sk.entities.filter((e): e is SkPoint => e.type === "point").map((q) => [q.id, q]));
    for (const e of sk.entities) if (e.type === "circle" && !e.construction) { const c = pmap.get(e.c); if (c) pts.push([c.x, c.y]); }
    const op: CamOp = { kind: this.st.kind, regions, points: pts, depth: this.num(this.st.depth), outside: this.st.outside, allowance: extra[0], peck: extra[1] };
    if ((op.kind === "pocket" || op.kind === "contour") && !regions.length) return this.fail("閉じたプロファイルがありません");
    if (op.kind === "drill" && !pts.length) return this.fail("穴あけ位置 (スケッチの点・円) がありません");
    const res = generateToolpath(op, tool, this.num(this.st.safe));
    this.res = res;
    // preview in world coordinates
    const W = (p: [number, number, number]): Vec3 => {
      const b = planeToWorld(sk.plane, [p[0], p[1]]);
      return [b[0] + sk.plane.normal[0] * p[2], b[1] + sk.plane.normal[1] * p[2], b[2] + sk.plane.normal[2] * p[2]];
    };
    const cut: number[] = [], rapid: number[] = [];
    for (let i = 1; i < res.moves.length; i++) (res.moves[i].rapid ? rapid : cut).push(...W(res.moves[i - 1].p), ...W(res.moves[i].p));
    this.app.vp.setToolpath(Float32Array.from(cut), Float32Array.from(rapid));
    const min = Math.floor(res.time / 60), sec = Math.round(res.time % 60);
    const rows: [string, string][] = [
      ["切削長さ", `${formatNumber(res.cutLength, 0)} mm`],
      ["早送り長さ", `${formatNumber(res.rapidLength, 0)} mm`],
      ["加工時間 (目安)", `${min} 分 ${sec} 秒`],
      ["移動数", String(res.moves.length)],
    ];
    this.out.innerHTML = "";
    this.out.appendChild(h("table", { class: "kv", "data-k": "cam-result" }, ...rows.map(([k, v]) => h("tr", {}, h("th", {}, k), h("td", {}, v)))));
    for (const w of res.warnings) this.out.appendChild(h("div", { class: "warn" }, `⚠ ${w}`));
  }
  private exportGcode() {
    if (!this.res?.moves.length) return void toast("工具経路がありません", "warn");
    const label = { pocket: "ポケット", contour: "輪郭", drill: "穴あけ" }[this.st.kind];
    const g = toGcode(this.app.store.doc.name, [{ label, res: this.res, tool: this.tool(), toolNo: 1 }], this.num(this.st.safe));
    download(`${this.app.store.doc.name}_${label}.nc`, g, "text/plain");
  }
  private close() {
    this.app.vp.setToolpath(null);
    this.panel.close();
  }
  ok() {
    this.close();
  }
  cancel() {
    this.close();
  }
}
