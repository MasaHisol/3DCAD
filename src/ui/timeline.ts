import type { App } from "../app";
import { featureSketchRefs } from "../core/document";
import { FEATURE_ICONS } from "./browser";
import { h, iconEl } from "./dom";

/**
 * Fusion 360-style history timeline along the bottom of the viewport:
 * one chip per feature in order, a draggable end-of-part marker for
 * rollback, click = select, double-click = edit, right-click = menu.
 */
export class Timeline {
  readonly el: HTMLElement;
  private track: HTMLElement;
  collapsed = false;

  constructor(parent: HTMLElement, private app: App) {
    this.track = h("div", { class: "tl-track" });
    const toggle = h("button", { class: "icon-btn small tl-toggle", title: "タイムラインの表示/非表示", onClick: () => ((this.collapsed = !this.collapsed), this.render()) }, iconEl("timeline"));
    const start = h("button", { class: "icon-btn small", title: "先頭へロールバック", onClick: () => app.moveEndOfPart(0) }, iconEl("chevronRight", "flip-x"));
    const end = h("button", { class: "icon-btn small", title: "最後まで再生", onClick: () => app.moveEndOfPart(app.store.doc.features.length) }, iconEl("chevronRight"));
    this.el = h("div", { class: "timeline" }, toggle, start, this.track, end);
    parent.appendChild(this.el);
  }

  render() {
    const app = this.app;
    const show = app.env === "part";
    this.el.style.display = show ? "" : "none";
    this.el.classList.toggle("collapsed", this.collapsed);
    if (!show || this.collapsed) return;
    const doc = app.store.doc;
    // consumed sketches are folded into their feature, like the browser
    const consumed = new Set(doc.features.flatMap(featureSketchRefs));
    this.track.innerHTML = "";
    const marker = () => {
      const m = h("div", { class: "tl-eop", draggable: "true", title: "パーツの終わり — ドラッグでロールバック" });
      m.addEventListener("dragstart", (e) => e.dataTransfer?.setData("text/plain", "eop"));
      return m;
    };
    doc.features.forEach((f, i) => {
      if (i === doc.endOfPart) this.track.appendChild(marker());
      if (f.type === "sketch" && consumed.has(f.id)) return;
      const err = app.featureErrors[f.id];
      const chip = h(
        "button",
        {
          class: ["tl-chip", i >= doc.endOfPart ? "rolled" : "", err ? "error" : "", f.suppressed ? "suppressed" : "", app.browserSelection.has(f.id) ? "selected" : ""].join(" "),
          title: `${f.name}${err ? `\nエラー: ${err}` : ""}`,
          onClick: (e: MouseEvent) => app.browserSelect(f.id, e.shiftKey || e.ctrlKey),
          onDblClick: () => app.editFeature(f.id),
        },
        iconEl(FEATURE_ICONS[f.type] ?? "dot"),
      );
      chip.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        app.featureContextMenu(f.id, e.clientX, e.clientY);
      });
      // drop the end marker after this feature
      chip.addEventListener("dragover", (e) => (e.preventDefault(), chip.classList.add("drop")));
      chip.addEventListener("dragleave", () => chip.classList.remove("drop"));
      chip.addEventListener("drop", (e) => {
        e.preventDefault();
        app.moveEndOfPart(i + 1);
      });
      this.track.appendChild(chip);
    });
    if (doc.endOfPart >= doc.features.length) this.track.appendChild(marker());
    this.track.scrollLeft = this.track.scrollWidth;
  }
}
