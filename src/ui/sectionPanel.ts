// Section view panel (断面の強化): three simultaneous planes X / Y / Z (each
// on/off, offset slider, flip, sweep animation), filled and hatched caps, and
// DXF output of the exact section outlines computed by the kernel.
import * as THREE from "three";
import type { App } from "../app";
import { formatNumber } from "../core/expr";
import { download, h, iconEl, toast } from "./dom";
import { encodeDxf } from "../io/formats";
import { sectionsToDxf } from "../io/sectionDxf";
import { SECTION_AXES, SectionSweep, axisIndex, defaultSection, planeDefOf, type SectionAxis, type SectionState } from "../viewer/section";
import type { SectionResult } from "../kernel/section";

export class SectionPanel {
  readonly el: HTMLElement;
  state: SectionState;
  private range: THREE.Box3;
  private sweep: SectionSweep;
  private sweepAxis: SectionAxis | null = null;
  private rows = new Map<SectionAxis, { on: HTMLInputElement; slider: HTMLInputElement; val: HTMLElement; play: HTMLButtonElement }>();

  constructor(private app: App) {
    const box = app.vp.modelBounds();
    this.range = box.isEmpty() ? new THREE.Box3(new THREE.Vector3(-50, -50, -50), new THREE.Vector3(50, 50, 50)) : box.clone();
    // a little margin so the plane can leave the part completely
    this.range.expandByScalar(this.range.getSize(new THREE.Vector3()).length() * 0.01);
    this.state = defaultSection(this.range);
    this.sweep = new SectionSweep((v) => {
      if (!this.sweepAxis) return;
      this.plane(this.sweepAxis).value = v;
      this.apply();
    });

    const rows = SECTION_AXES.map((axis) => this.row(axis));
    const caps = h("input", { type: "checkbox", checked: "", "aria-label": "断面の塗りつぶし" }) as HTMLInputElement;
    caps.checked = this.state.caps;
    caps.addEventListener("change", () => ((this.state.caps = caps.checked), this.apply()));
    const hatch = h("input", { type: "checkbox", "aria-label": "ハッチング" }) as HTMLInputElement;
    hatch.checked = this.state.hatch;
    hatch.addEventListener("change", () => ((this.state.hatch = hatch.checked), this.apply()));
    this.el = h(
      "div",
      { class: "section-panel section-panel3", "data-testid": "section-panel" },
      h("div", { class: "sec-head" }, iconEl("section"), h("strong", {}, "断面図"), h("span", { class: "sec-gap" }), h("button", { class: "icon-btn", title: "断面図を終了", onClick: () => app.toggleSectionView() }, iconEl("close"))),
      ...rows,
      h(
        "div",
        { class: "sec-opts" },
        h("label", {}, caps, " 塗りつぶし"),
        h("label", {}, hatch, " ハッチング"),
        h("button", { class: "btn sec-dxf", title: "有効な断面の正確な輪郭を DXF に出力", onClick: () => void this.exportDxf() }, "DXF 出力"),
      ),
    );
    app.vp.sectionPatternOf = (bi) => (app.env === "assembly" ? app.asm.compOfBody(bi)?.partId : bi);
    this.apply();
  }

  private plane(axis: SectionAxis) {
    return this.state.planes.find((p) => p.axis === axis)!;
  }

  private row(axis: SectionAxis): HTMLElement {
    const p = this.plane(axis);
    const i = axisIndex(axis);
    const lo = this.range.min.getComponent(i), hi = this.range.max.getComponent(i);
    const on = h("input", { type: "checkbox", "aria-label": `${axis} 断面`, "data-axis": axis }) as HTMLInputElement;
    on.checked = p.enabled;
    const slider = h("input", { type: "range", min: "0", max: "1000", "aria-label": `${axis} 断面位置` }) as HTMLInputElement;
    slider.value = String(Math.round(((p.value - lo) / Math.max(1e-9, hi - lo)) * 1000));
    const val = h("span", { class: "sec-val" });
    on.addEventListener("change", () => ((p.enabled = on.checked), this.apply()));
    slider.addEventListener("input", () => {
      if (this.sweepAxis === axis) this.stopSweep();
      p.value = lo + ((hi - lo) * Number(slider.value)) / 1000;
      p.enabled = on.checked = true;
      this.apply();
    });
    const play = h("button", { class: "icon-btn", title: `${axis} 断面を移動 (アニメーション)` }, "▶") as HTMLButtonElement;
    play.addEventListener("click", () => {
      if (this.sweepAxis === axis) return this.stopSweep();
      this.stopSweep();
      p.enabled = on.checked = true;
      this.sweepAxis = axis;
      play.textContent = "■";
      this.sweep.start(lo, hi, 4000, p.value);
    });
    const flip = h("button", { class: "icon-btn", title: "反転" }, iconEl("flip"));
    flip.addEventListener("click", () => ((p.flip = !p.flip), this.apply()));
    this.rows.set(axis, { on, slider, val, play });
    return h("div", { class: "sec-row" }, h("label", { class: "sec-axis" }, on, ` ${axis}`), slider, val, flip, play);
  }

  private stopSweep() {
    this.sweep.stop();
    if (this.sweepAxis) this.rows.get(this.sweepAxis)!.play.textContent = "▶";
    this.sweepAxis = null;
  }

  /** Applies the state to the viewport and the labels. */
  apply() {
    for (const p of this.state.planes) {
      const r = this.rows.get(p.axis);
      if (!r) continue;
      const i = axisIndex(p.axis);
      const lo = this.range.min.getComponent(i), hi = this.range.max.getComponent(i);
      r.val.textContent = `${p.axis} = ${formatNumber(p.value, 2)} mm`;
      if (this.sweepAxis === p.axis) r.slider.value = String(Math.round(((p.value - lo) / Math.max(1e-9, hi - lo)) * 1000));
    }
    this.app.vp.setSectionState(this.state);
  }

  /** Exact section curves (kernel) of every enabled plane, written to one DXF. */
  async exportDxf(): Promise<string | null> {
    const planes = this.state.planes.filter((p) => p.enabled);
    if (!planes.length) {
      toast("有効な断面がありません", "warn");
      return null;
    }
    const app = this.app;
    let results: SectionResult[];
    let patternOf: ((s: number) => number | string | undefined) | undefined;
    try {
      app.status("断面形状を計算中…");
      if (app.env === "assembly") {
        await app.asm.ensureBrep();
        const comps = app.asm.doc.components.filter((c) => c.visible !== false);
        results = await app.kernel.section(planes.map((p) => planeDefOf(p.axis, p.value)), app.asm.placements());
        patternOf = (s) => comps[s]?.partId;
      } else results = await app.kernel.section(planes.map((p) => planeDefOf(p.axis, p.value)));
    } catch (e) {
      toast(`断面の計算に失敗しました: ${(e as Error).message}`, "error");
      return null;
    } finally {
      app.status("準備完了");
    }
    const dxf = sectionsToDxf(results, { labels: planes.map((p) => `${p.axis} = ${formatNumber(p.value, 2)}`), patternOf });
    const name = app.env === "assembly" ? app.asm.doc.name : app.store.doc.name;
    this.lastExport = { dxf, results };
    download(`${name}_断面.dxf`, encodeDxf(dxf) as BlobPart, "application/dxf");
    const n = results.reduce((k, r) => k + r.entities.length, 0);
    toast(`断面形状を DXF に出力しました (${planes.length} 断面, ${n} 要素)`, "info");
    return dxf;
  }

  /** Last DXF export (automation / tests). */
  lastExport: { dxf: string; results: SectionResult[] } | null = null;

  dispose() {
    this.stopSweep();
    this.app.vp.sectionPatternOf = null;
    this.app.vp.setSections([], { caps: false });
    this.el.remove();
  }
}
