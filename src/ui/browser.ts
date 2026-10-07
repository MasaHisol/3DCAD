import { FEATURE_LABELS, featureSketchRefs } from "../core/document";
import type { Feature, PartDocument } from "../core/types";
import { h, iconEl } from "./dom";

export const FEATURE_ICONS: Record<string, string> = {
  sketch: "sketch",
  extrude: "extrude",
  revolve: "revolve",
  loft: "loft",
  sweep: "sweep",
  pushpull: "pushpull",
  fillet: "fillet",
  chamfer: "chamfer",
  shell: "shell",
  hole: "hole",
  thread: "thread",
  rectPattern: "rectPattern",
  circPattern: "circPattern",
  mirror: "mirror",
  box: "box",
  cylinder: "cylinder",
  sphere: "sphere",
  torus: "torus",
  workplane: "workplane",
  import: "import",
  move: "move",
};

export interface BrowserHost {
  /** Alternative tree (assembly environment). Return true when rendered. */
  customRender?(list: HTMLElement): boolean;
  doc(): PartDocument;
  errors(): Record<string, string>;
  bodyCount(): number;
  activeSketch(): string | null;
  selected(): Set<string>;
  originVisible(key: string): boolean;
  select(id: string, additive: boolean): void;
  edit(id: string): void;
  contextMenu(id: string, x: number, y: number): void;
  rename(id: string, name: string): void;
  moveEndOfPart(index: number): void;
  toggleOrigin(key: string): void;
  toggleSketchVisible(id: string): void;
  hover(id: string | null): void;
}

/** Inventor-like model browser tree. */
export class ModelBrowser {
  readonly el: HTMLElement;
  private list: HTMLElement;
  private filter = "";
  private expanded = new Set<string>(["__solids"]);
  private renaming: string | null = null;

  constructor(parent: HTMLElement, private host: BrowserHost) {
    const search = h("input", { class: "br-search", placeholder: "ブラウザを検索", "aria-label": "ブラウザを検索" });
    search.addEventListener("input", () => {
      this.filter = search.value.trim().toLowerCase();
      this.render();
    });
    this.list = h("div", { class: "br-tree", role: "tree" });
    this.el = h(
      "aside",
      { class: "browser" },
      h("div", { class: "br-head" }, h("span", { class: "br-title" }, "モデル"), h("span", { class: "spacer" }), iconEl("search", "dim")),
      h("div", { class: "br-searchbox" }, search),
      this.list,
    );
    parent.appendChild(this.el);
  }

  startRename(id: string) {
    this.renaming = id;
    this.render();
  }

  render() {
    if (this.host.customRender?.(this.list)) return;
    const doc = this.host.doc();
    const errors = this.host.errors();
    const sel = this.host.selected();
    const active = this.host.activeSketch();
    this.list.innerHTML = "";

    const row = (o: {
      id: string;
      icon: string;
      label: string;
      depth?: number;
      cls?: string;
      onClick?: (e: MouseEvent) => void;
      onDbl?: () => void;
      onCtx?: (e: MouseEvent) => void;
      expander?: boolean;
      expanded?: boolean;
      onToggle?: () => void;
      trailing?: HTMLElement | null;
      title?: string;
      draggable?: boolean;
    }) => {
      const lab =
        this.renaming === o.id
          ? (() => {
              const inp = h("input", { class: "br-rename", value: o.label });
              const done = (commit: boolean) => {
                if (this.renaming !== o.id) return;
                this.renaming = null;
                if (commit && inp.value.trim()) this.host.rename(o.id, inp.value.trim());
                else this.render();
              };
              inp.addEventListener("keydown", (e) => {
                e.stopPropagation();
                if (e.key === "Enter") done(true);
                if (e.key === "Escape") done(false);
              });
              inp.addEventListener("blur", () => done(true));
              setTimeout(() => (inp.focus(), inp.select()), 0);
              return inp;
            })()
          : h("span", { class: "br-label" }, o.label);
      const el = h(
        "div",
        {
          class: "br-row " + (o.cls ?? ""),
          role: "treeitem",
          tabindex: "-1",
          style: `--depth:${o.depth ?? 0}`,
          title: o.title,
          "data-id": o.id,
        },
        o.expander
          ? h("button", { class: "br-exp" + (o.expanded ? " open" : ""), onClick: (e: MouseEvent) => (e.stopPropagation(), o.onToggle?.()) }, iconEl("chevronRight"))
          : h("span", { class: "br-exp-sp" }),
        iconEl(o.icon),
        lab,
        o.trailing ?? null,
      );
      if (o.onClick) el.addEventListener("click", o.onClick);
      if (o.onDbl) el.addEventListener("dblclick", o.onDbl);
      el.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        o.onCtx?.(e);
      });
      el.addEventListener("mouseenter", () => this.host.hover(o.id));
      el.addEventListener("mouseleave", () => this.host.hover(null));
      this.list.appendChild(el);
      return el;
    };

    row({ id: "__part", icon: "part", label: doc.name, cls: "root" });
    // origin
    const originOpen = this.expanded.has("__origin");
    row({
      id: "__origin",
      icon: "folder",
      label: "原点",
      depth: 1,
      expander: true,
      expanded: originOpen,
      onToggle: () => this.toggle("__origin"),
      onClick: () => this.toggle("__origin"),
    });
    if (originOpen) {
      const items: [string, string, string][] = [
        ["YZ", "plane", "YZ 平面"],
        ["XZ", "plane", "XZ 平面"],
        ["XY", "plane", "XY 平面"],
        ["X", "axis", "X 軸"],
        ["Y", "axis", "Y 軸"],
        ["Z", "axis", "Z 軸"],
        ["O", "originPt", "中心点"],
      ];
      for (const [k, ic, label] of items) {
        const vis = this.host.originVisible(k);
        row({
          id: `__o_${k}`,
          icon: ic,
          label,
          depth: 2,
          cls: vis ? "" : "dimmed",
          onClick: (e) => this.host.select(`__o_${k}`, e.shiftKey || e.ctrlKey),
          onCtx: (e) => this.host.contextMenu(`__o_${k}`, e.clientX, e.clientY),
          trailing: this.visBtn(vis, () => this.host.toggleOrigin(k)),
        });
      }
    }
    // solid bodies
    const nb = this.host.bodyCount();
    const solidsOpen = this.expanded.has("__solids");
    row({
      id: "__solids",
      icon: "folder",
      label: `ソリッド本体(${nb})`,
      depth: 1,
      expander: nb > 0,
      expanded: solidsOpen,
      onToggle: () => this.toggle("__solids"),
    });
    if (solidsOpen) for (let i = 0; i < nb; i++) row({ id: `__body${i}`, icon: "solid", label: `ソリッド${i + 1}`, depth: 2 });

    // features (consumed sketches are nested under their consumer, like Inventor)
    const consumer = new Map<string, string>();
    for (const f of doc.features) for (const s of featureSketchRefs(f)) if (!consumer.has(s)) consumer.set(s, f.id);
    const match = (f: Feature) => !this.filter || f.name.toLowerCase().includes(this.filter) || FEATURE_LABELS[f.type].includes(this.filter);
    const featureRow = (f: Feature, i: number, depth: number) => {
      const err = errors[f.id];
      const rolled = i >= doc.endOfPart;
      const cls = [
        sel.has(f.id) ? "selected" : "",
        err ? "error" : "",
        f.suppressed ? "suppressed" : "",
        rolled ? "rolled" : "",
        active === f.id ? "editing" : "",
      ].join(" ");
      const kids = doc.features.filter((x) => x.type === "sketch" && consumer.get(x.id) === f.id);
      const open = this.expanded.has(f.id);
      let trailing: HTMLElement | null = null;
      if (err) trailing = h("span", { class: "br-badge err", title: err }, iconEl("error"));
      else if (f.type === "sketch" && !consumer.has(f.id)) trailing = this.visBtn(f.visible !== false, () => this.host.toggleSketchVisible(f.id));
      row({
        id: f.id,
        icon: FEATURE_ICONS[f.type] ?? "dot",
        label: f.name,
        depth,
        cls,
        title: err ? `エラー: ${err}` : undefined,
        expander: kids.length > 0,
        expanded: open,
        onToggle: () => this.toggle(f.id),
        onClick: (e) => this.host.select(f.id, e.shiftKey || e.ctrlKey),
        onDbl: () => this.host.edit(f.id),
        onCtx: (e) => this.host.contextMenu(f.id, e.clientX, e.clientY),
        trailing,
      });
      if (open) for (const k of kids) featureRow(k, doc.features.indexOf(k), depth + 1);
    };
    doc.features.forEach((f, i) => {
      if (i === doc.endOfPart) this.eopRow(i);
      if (f.type === "sketch" && consumer.has(f.id) && !this.filter) return;
      if (!match(f)) return;
      featureRow(f, i, 1);
    });
    if (doc.endOfPart >= doc.features.length) this.eopRow(doc.features.length);
    this.attachDnD();
  }

  private eopRow(index: number) {
    const el = h(
      "div",
      { class: "br-row eop", style: "--depth:1", draggable: "true", title: "パーツの終わり — ドラッグしてロールバック", "data-eop": String(index) },
      h("span", { class: "br-exp-sp" }),
      iconEl("endOfPart"),
      h("span", { class: "br-label" }, "パーツの終わり"),
    );
    el.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      this.host.contextMenu("__eop", e.clientX, e.clientY);
    });
    this.list.appendChild(el);
  }

  private attachDnD() {
    const eop = this.list.querySelector(".eop") as HTMLElement | null;
    if (!eop) return;
    eop.addEventListener("dragstart", (e) => {
      e.dataTransfer?.setData("text/plain", "eop");
      eop.classList.add("dragging");
    });
    eop.addEventListener("dragend", () => eop.classList.remove("dragging"));
    const doc = this.host.doc();
    this.list.querySelectorAll<HTMLElement>(".br-row[data-id]").forEach((r) => {
      const id = r.dataset.id!;
      const idx = doc.features.findIndex((f) => f.id === id);
      const isTop = id === "__solids" || id === "__origin" || id.startsWith("__o_") || id.startsWith("__body");
      if (idx < 0 && !isTop) return;
      r.addEventListener("dragover", (e) => {
        e.preventDefault();
        r.classList.add("drop-target");
      });
      r.addEventListener("dragleave", () => r.classList.remove("drop-target"));
      r.addEventListener("drop", (e) => {
        e.preventDefault();
        r.classList.remove("drop-target");
        this.host.moveEndOfPart(idx < 0 ? 0 : idx + 1);
      });
    });
  }

  private visBtn(vis: boolean, onClick: () => void): HTMLElement {
    return h(
      "button",
      {
        class: "br-vis icon-btn small",
        title: vis ? "非表示にする" : "表示する",
        onClick: (e: MouseEvent) => {
          e.stopPropagation();
          onClick();
        },
      },
      iconEl(vis ? "eye" : "eyeOff"),
    );
  }

  private toggle(id: string) {
    if (this.expanded.has(id)) this.expanded.delete(id);
    else this.expanded.add(id);
    this.render();
  }
}
