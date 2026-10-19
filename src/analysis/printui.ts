import type { App } from "../app";
import type { Command } from "../commands/command";
import { formatNumber } from "../core/expr";
import { evalWith } from "../core/params";
import { h } from "../ui/dom";
import { PropertyPanel } from "../ui/panel";
import { printCheck } from "./printcheck";

/** 3D プリント チェック: overhangs, thin walls, open edges, material / time estimate. */
export class PrintCheckCommand implements Command {
  readonly id = "printcheck";
  private panel: PropertyPanel;
  private out: HTMLElement;
  private st = { up: "2", overhang: "45", minWall: "0.8", density: "1.24", rate: "12" };
  constructor(private app: App) {
    this.panel = new PropertyPanel(app.panelHost, "3D プリント チェック", "printcheck", { onOk: () => app.finishCommand(this, true), onCancel: () => app.finishCommand(this, false) }, () => app.values());
    const p = this.panel;
    const s = p.section("条件");
    p.select(s, "造形方向 (上)", [{ value: "2", label: "+Z" }, { value: "1", label: "+Y" }, { value: "0", label: "+X" }], this.st.up, (v) => ((this.st.up = v), void this.run()));
    p.expr(s, "オーバーハング限界 (垂直から)", this.st.overhang, "deg", (e) => (this.st.overhang = e));
    p.expr(s, "最小肉厚", this.st.minWall, "mm", (e) => (this.st.minWall = e));
    p.expr(s, "材料密度", this.st.density, "g/cm³", (e) => (this.st.density = e));
    p.expr(s, "造形速度", this.st.rate, "mm³/s", (e) => (this.st.rate = e));
    s.appendChild(h("button", { class: "btn", "data-k": "pc-run", onClick: () => void this.run() }, "チェック"));
    const r = p.section("結果");
    this.out = h("div", { class: "measure-out" });
    r.appendChild(this.out);
    p.note(r, "赤: サポートが必要なオーバーハング / 橙: 最小肉厚未満。造形時間は体積と造形速度からの目安です (充填率 100%)。");
    void this.run();
  }
  private async run() {
    const num = (s: string) => {
      try {
        return evalWith(this.app.values(), s);
      } catch {
        return NaN;
      }
    };
    const opt = { up: num(this.st.up) as 0 | 1 | 2, overhang: num(this.st.overhang), minWall: num(this.st.minWall) };
    if (![opt.overhang, opt.minWall, num(this.st.density), num(this.st.rate)].every((x) => x > 0) || opt.overhang >= 90) return this.panel.setError("値は正の数 (オーバーハング限界は 90° 未満) にしてください");
    this.panel.setError(null);
    const bodies = this.app.bodies;
    if (!bodies.length) return void (this.out.textContent = "ボディがありません");
    const r = printCheck(bodies, opt);
    this.app.vp.setResult(r.colors.map((colors) => ({ colors })));
    const mp = await this.app.kernel.massProps();
    const vol = mp.volume;
    const mass = (vol / 1000) * num(this.st.density);
    const sec = vol / Math.max(num(this.st.rate), 1e-6);
    const ok = r.overhangArea < 1e-6 && r.thinArea < 1e-6 && !r.openEdges && !r.nonManifoldEdges;
    const rows: [string, string][] = [
      ["判定", ok ? "✓ 造形可能" : "⚠ 要確認"],
      ["オーバーハング", `${formatNumber(r.overhangArea, 1)} mm² (${formatNumber((100 * r.overhangArea) / r.totalArea, 1)} %)`],
      ["薄肉部", r.thinArea ? `${formatNumber(r.thinArea, 1)} mm² (最小 ${formatNumber(r.thinnest ?? 0, 2)} mm)` : "なし"],
      ["開いたエッジ", `${r.openEdges} / 非多様体 ${r.nonManifoldEdges}`],
      ["造形高さ", `${formatNumber(r.height, 1)} mm`],
      ["設置面", `${formatNumber(r.footprint[0], 1)} × ${formatNumber(r.footprint[1], 1)} mm`],
      ["体積 / 質量", `${formatNumber(vol / 1000, 2)} cm³ / ${formatNumber(mass, 1)} g`],
      ["造形時間 (目安)", `${Math.floor(sec / 3600)} 時間 ${Math.round((sec % 3600) / 60)} 分`],
    ];
    this.out.innerHTML = "";
    this.out.appendChild(h("table", { class: "kv", "data-k": "pc-result" }, ...rows.map(([k, v]) => h("tr", {}, h("th", {}, k), h("td", {}, v)))));
  }
  private close() {
    this.app.vp.setResult(null);
    this.panel.close();
  }
  ok() {
    this.close();
  }
  cancel() {
    this.close();
  }
}
