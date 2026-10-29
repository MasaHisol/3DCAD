// BOM panel of the assembly (部品表): tree / flat (quantity) views, search,
// CSV export, and selection synced both ways with the 3D view and the
// component tree.
import type { App } from "../app";
import { formatNumber } from "../core/expr";
import { bomCsv, buildBom, filterBom, flattenRows, rowSelection, totalMass, type BomMode, type BomRow } from "../assembly/bom";
import type { MassProps } from "../kernel/protocol";
import { download, h, iconEl } from "./dom";

/** Non-modal panel floating over the viewport (stays open while working in 3D). */
export function floatPanel(app: App, id: string, title: string, icon: string, body: HTMLElement, opts: { width?: number; right?: number; top?: number; onClose?: () => void } = {}): { el: HTMLElement; close: () => void } {
  document.getElementById(id)?.dispatchEvent(new Event("panel-close"));
  const close = () => {
    el.remove();
    opts.onClose?.();
  };
  const head = h("div", { class: "fp-head" }, iconEl(icon), h("span", { class: "fp-title" }, title), h("button", { class: "fp-close", title: "閉じる", "aria-label": "閉じる" }, "×"));
  const el = h("div", { class: "float-panel", id, role: "dialog", "aria-label": title, style: `width:${opts.width ?? 420}px;right:${opts.right ?? 12}px;top:${opts.top ?? 12}px` }, head, body);
  head.querySelector(".fp-close")!.addEventListener("click", close);
  el.addEventListener("panel-close", close);
  // drag by the header
  head.addEventListener("pointerdown", (e) => {
    if ((e.target as HTMLElement).closest("button")) return;
    const r = el.getBoundingClientRect(), pr = el.parentElement!.getBoundingClientRect();
    const dx = e.clientX - r.left, dy = e.clientY - r.top;
    const move = (ev: PointerEvent) => {
      el.style.left = `${Math.max(0, ev.clientX - pr.left - dx)}px`;
      el.style.top = `${Math.max(0, ev.clientY - pr.top - dy)}px`;
      el.style.right = "auto";
    };
    const up = () => (window.removeEventListener("pointermove", move), window.removeEventListener("pointerup", up));
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  });
  app.vp.el.appendChild(el);
  return { el, close };
}

export class BomPanel {
  mode: BomMode = "flat";
  query = "";
  private masses = new Map<string, number>();
  private panel: { el: HTMLElement; close: () => void } | null = null;
  private table!: HTMLTableSectionElement;
  private foot!: HTMLElement;
  private collapsed = new Set<string>();
  private rows: BomRow[] = [];
  private lastClicked: string | null = null;
  private readonly onSel = () => this.syncSelection();
  private readonly onChange = () => this.refresh();

  constructor(readonly app: App) {}

  get isOpen() {
    return !!this.panel;
  }

  open() {
    if (this.panel) return this.refresh();
    const env = this.app.asm;
    const search = h("input", { type: "search", class: "bom-search", placeholder: "検索 (名前・パーツ番号・材質)", "aria-label": "部品表を検索" }) as HTMLInputElement;
    search.value = this.query;
    search.addEventListener("input", () => ((this.query = search.value), this.render()));
    const modeBtn = (m: BomMode, label: string) => {
      const b = h("button", { class: `bom-mode${this.mode === m ? " active" : ""}`, "data-mode": m }, label);
      b.addEventListener("click", () => {
        this.mode = m;
        body.querySelectorAll(".bom-mode").forEach((x) => x.classList.toggle("active", (x as HTMLElement).dataset.mode === m));
        this.refresh();
      });
      return b;
    };
    const csv = h("button", { class: "bom-csv" }, "CSV");
    csv.addEventListener("click", () => download(`${env.doc.name}_部品表.csv`, bomCsv(filterBom(this.rows, this.query)), "text/csv"));
    const iso = h("button", { class: "bom-iso", title: "選択した行だけを表示" }, "分離");
    iso.addEventListener("click", () => env.viewing.isolate([...env.selected]));
    const all = h("button", { class: "bom-all", title: "すべて表示" }, "全表示");
    all.addEventListener("click", () => env.viewing.showAll());
    this.table = h("tbody");
    this.foot = h("div", { class: "muted bom-foot" });
    const body = h(
      "div",
      { class: "bom-body" },
      h("div", { class: "bom-tools" }, modeBtn("flat", "数量"), modeBtn("tree", "構成"), search, iso, all, csv),
      h(
        "div",
        { class: "ptable-wrap bom-wrap" },
        h("table", { class: "ptable bom-table" }, h("thead", {}, h("tr", {}, h("th", {}, "No."), h("th", {}, "名前"), h("th", {}, "パーツ番号"), h("th", {}, "材質"), h("th", {}, "数量"), h("th", {}, "質量"))), this.table),
      ),
      this.foot,
    );
    this.panel = floatPanel(this.app, "bom-panel", `部品表 — ${env.doc.name}`, "iprops", body, {
      width: 560,
      onClose: () => {
        this.panel = null;
        env.selectionListeners.delete(this.onSel);
        env.viewing.listeners.delete(this.onChange);
      },
    });
    env.selectionListeners.add(this.onSel);
    env.viewing.listeners.add(this.onChange);
    this.refresh();
    void this.loadMasses();
  }

  close() {
    this.panel?.close();
  }

  /** Unit masses from the kernel (B-rep built on demand). */
  private async loadMasses() {
    const env = this.app.asm;
    for (const p of env.doc.parts) {
      if (this.masses.has(p.id) || !env.doc.components.some((c) => c.partId === p.id)) continue;
      try {
        await env.ensureBrep([p.id], true);
        const mp: MassProps = await this.app.kernel.massPropsKey(`asm:${p.id}`);
        const dens = p.doc?.material?.density ?? 0;
        if (mp.volume > 0 && dens) this.masses.set(p.id, (mp.volume / 1000) * dens);
      } catch {
        /* no solid */
      }
      if (!this.panel) return;
    }
    this.refresh();
  }

  refresh() {
    if (!this.panel) return;
    this.rows = buildBom(this.app.asm.doc, this.mode, (id) => this.masses.get(id));
    this.render();
  }

  private render() {
    const env = this.app.asm;
    const shown = filterBom(this.rows, this.query);
    const hidden = env.viewing.hiddenIds();
    this.table.innerHTML = "";
    const add = (r: BomRow) => {
      const exp = r.children ? h("span", { class: "bom-exp" }, this.collapsed.has(r.key) ? "▸" : "▾") : null;
      exp?.addEventListener("click", (e) => {
        e.stopPropagation();
        if (this.collapsed.has(r.key)) this.collapsed.delete(r.key);
        else this.collapsed.add(r.key);
        this.render();
      });
      const allHidden = r.compIds.length > 0 && r.compIds.every((id) => hidden.has(id));
      const eye = h("button", { class: "bom-eye", title: allHidden ? "表示" : "非表示", "aria-label": allHidden ? "表示" : "非表示" }, iconEl(allHidden ? "eyeOff" : "eye"));
      eye.addEventListener("click", (e) => {
        e.stopPropagation();
        if (allHidden) env.viewing.show(r.compIds);
        else env.viewing.hide(r.compIds);
      });
      const tr = h(
        "tr",
        { class: `bom-row${allHidden ? " hidden-row" : ""}${r.fastener ? " fastener" : ""}`, "data-key": r.key, "data-comps": r.compIds.join(" ") },
        h("td", { class: "num" }, r.no),
        h("td", { style: `padding-left:${6 + r.depth * 14}px` }, exp, r.name),
        h("td", {}, r.partNo),
        h("td", {}, r.material),
        h("td", { class: "num" }, String(r.qty)),
        h("td", { class: "num" }, r.mass !== undefined ? `${formatNumber(r.mass, 2)} g` : "—", eye),
      );
      tr.addEventListener("click", (e) => this.clickRow(r, e));
      tr.addEventListener("dblclick", () => {
        env.select(r.compIds);
        this.app.vp.fitAll();
      });
      this.table.appendChild(tr);
      if (r.children && !this.collapsed.has(r.key)) r.children.forEach(add);
    };
    shown.forEach(add);
    const n = flattenRows(shown).filter((r) => !r.children).reduce((s, r) => s + r.qty, 0);
    this.foot.textContent = `${this.mode === "flat" ? `部品 ${shown.length} 種` : `行 ${flattenRows(shown).length}`} / コンポーネント ${n} / 総質量 ${formatNumber(totalMass(shown), 2)} g`;
    this.syncSelection();
  }

  private clickRow(r: BomRow, e: MouseEvent) {
    const env = this.app.asm;
    let ids = r.compIds;
    if (e.shiftKey && this.lastClicked) {
      const flat = flattenRows(filterBom(this.rows, this.query));
      const i = flat.findIndex((x) => x.key === this.lastClicked), j = flat.findIndex((x) => x.key === r.key);
      if (i >= 0 && j >= 0) ids = flat.slice(Math.min(i, j), Math.max(i, j) + 1).flatMap((x) => x.compIds);
    }
    if (e.ctrlKey || e.metaKey) {
      const s = new Set(env.selected);
      const all = r.compIds.every((id) => s.has(id));
      r.compIds.forEach((id) => (all ? s.delete(id) : s.add(id)));
      ids = [...s];
    }
    this.lastClicked = r.key;
    env.select(ids);
  }

  /** Marks rows of the selected components (3D / tree selection → BOM). */
  syncSelection() {
    if (!this.panel) return;
    const sel = this.app.asm.selected;
    let first: HTMLElement | null = null;
    this.table.querySelectorAll<HTMLElement>("tr.bom-row").forEach((tr) => {
      const ids = (tr.dataset.comps ?? "").split(" ").filter(Boolean);
      const st = rowSelection({ compIds: ids } as BomRow, sel);
      tr.classList.toggle("selected", st === "all");
      tr.classList.toggle("partial", st === "some");
      if (st !== "none" && !first) first = tr;
    });
    (first as HTMLElement | null)?.scrollIntoView?.({ block: "nearest" });
  }
}
