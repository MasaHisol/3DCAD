import type { App } from "../app";
import { MATERIALS, uid } from "../core/document";
import { formatNumber } from "../core/expr";
import type { Store } from "../core/store";
import type { Vec2 } from "../core/types";
import type { ViewGeometry } from "../kernel/protocol";
import { svgToDxf } from "../io/formats";
import { confirmDialog, contextMenu, download, h, iconEl, modal, promptDialog, toast, type MenuItem } from "../ui/dom";
import type { RibbonTab } from "../ui/ribbon";
import { dimValue, linearPoints, projectedFrame, resnap, sectionFrame, snapAt, toSheet, toView, viewBox, viewSpec, type Snap } from "./geom";
import { renderSheet, type BomRow } from "./render";
import {
  ORIENTS,
  PAPER,
  SCALES,
  scaleText,
  sheetSize,
  type Anno,
  type DimAnno,
  type DimKind,
  type DrawingDoc,
  type DView,
  type GRef,
  type PaperSize,
  type Sheet,
  type StdOrient,
  type Tolerance,
} from "./types";

type Tool =
  | "select"
  | "base"
  | "projected"
  | "section"
  | "detail"
  | "dim"
  | "hole"
  | "note"
  | "leader"
  | "surface"
  | "gdt"
  | "datum"
  | "balloon"
  | "centerline";

const PROMPTS: Record<Tool, string> = {
  select: "ビュー・注記をクリックで選択、ドラッグで移動。ダブルクリックで編集",
  base: "基準ビューを配置する位置をクリック",
  projected: "親ビューをクリックし、投影ビューを配置する位置 (上下左右・斜め) をクリック",
  section: "親ビュー上で切断線の始点と終点をクリックし、断面図の位置をクリック",
  detail: "親ビュー上で詳細の中心と半径をクリックし、詳細図の位置をクリック",
  dim: "寸法を記入するエッジ・円・点を選択 (2 点 / 2 線分で距離・角度)、続けて位置をクリック",
  hole: "穴 (円) をクリックし、注記の位置をクリック — 同径の穴数を自動で数えます",
  note: "テキストを配置する位置をクリック",
  leader: "引出線の矢印の位置 (エッジ) をクリックし、テキストの位置をクリック",
  surface: "表面性状記号を付けるエッジ上の点をクリック",
  gdt: "幾何公差の引出し先 (エッジ) をクリックし、枠の位置をクリック",
  datum: "データムを付けるエッジをクリックし、記号の位置をクリック",
  balloon: "部品のエッジをクリックし、風船の位置をクリック",
  centerline: "中心線を引く 2 本の線分 (または 2 つの円) をクリック",
};

const GDT_SYMBOLS: [string, string][] = [
  ["⏤", "真直度"],
  ["⏥", "平面度"],
  ["○", "真円度"],
  ["⌭", "円筒度"],
  ["⌒", "線の輪郭度"],
  ["⌓", "面の輪郭度"],
  ["∥", "平行度"],
  ["⟂", "直角度"],
  ["∠", "傾斜度"],
  ["⌖", "位置度"],
  ["◎", "同軸度・同心度"],
  ["⌯", "対称度"],
  ["↗", "円周振れ"],
  ["⌰", "全振れ"],
];

/** 2D drawing environment (sheets, views, dimensions, annotations). */
export class DrawingEnv {
  /** Which model the drawing documents. */
  source: "part" | "assembly" = "part";
  activeSheet = 0;
  tool: Tool = "select";
  selected = new Set<string>();
  geom = new Map<string, ViewGeometry>();
  private geomKey = new Map<string, string>();
  private modelVersion = "";
  private canvas!: HTMLElement;
  private stage!: HTMLElement;
  private zoom = 1;
  private pan: Vec2 = [0, 0];
  private picks: { view?: string; refs: GRef[]; pts: Vec2[] } = { refs: [], pts: [] };
  private preview: string | null = null;
  private drag: { id: string; kind: "view" | "anno"; start: Vec2; orig: unknown; snap: string; moved: boolean } | null = null;
  private panDrag: { x: number; y: number } | null = null;
  private baseOrient: StdOrient = "front";
  private placements: string[] = [];
  private updating: Promise<void> | null = null;
  private dirtyGeom = false;

  constructor(private app: App) {}

  // ------------------------------------------------------------- access ---

  get store(): Store<{ drawing?: DrawingDoc; name: string; iprops: Record<string, string> }> {
    return (this.source === "assembly" ? this.app.asm.store : this.app.store) as never;
  }
  get doc(): DrawingDoc {
    return this.store.doc.drawing!;
  }
  get sheet(): Sheet {
    return this.doc.sheets[Math.min(this.activeSheet, this.doc.sheets.length - 1)];
  }

  private mutate(label: string, fn: (d: DrawingDoc) => void) {
    this.store.mutate(label, (doc) => fn(doc.drawing!));
  }

  private patch(fn: (d: DrawingDoc) => void) {
    this.store.patch((doc) => fn(doc.drawing!), "drawing-silent");
  }

  // -------------------------------------------------------------- enter ---

  /** Open (or create) the drawing of the current part / assembly. */
  async open() {
    const app = this.app;
    this.source = app.env === "assembly" ? "assembly" : "part";
    if (this.source === "part" && !app.bodies.length) {
      toast("図面を作成するソリッドがありません", "warn");
      return;
    }
    if (this.source === "assembly" && !app.asm.doc.components.length) {
      toast("図面を作成するコンポーネントがありません", "warn");
      return;
    }
    if (app.sketchEditor) app.exitSketch(true);
    if (app.command) app.finishCommand(app.command, false);
    const created = !this.store.doc.drawing;
    if (created) this.store.mutate("図面を作成", (d) => (d.drawing = this.newDrawing()), true);
    app.enterDrawingEnv(this);
    this.mountCanvas();
    this.activeSheet = Math.min(this.activeSheet, this.doc.sheets.length - 1);
    await this.refresh(true);
    if (created) {
      this.autoLayout();
      await this.refresh(true);
      this.fit();
      toast("図面を作成しました — 寸法 (D) や断面図・注記を追加できます", "ok");
    } else this.fit();
  }

  private newDrawing(): DrawingDoc {
    const src = this.store.doc;
    const iprops = src.iprops ?? {};
    const material = this.source === "part" ? this.app.store.doc.material.name : "—";
    const sheet = this.newSheet("A3");
    const base: DView = { id: uid("v"), kind: "base", ...ORIENTS.front, label: ORIENTS.front.label, scale: 1, x: 120, y: 160, hidden: true, centerMarks: true };
    const mk = (side: "top" | "right" | "iso"): DView => ({
      id: uid("v"),
      label: side === "iso" ? "等角図" : "",
      kind: "projected",
      parent: base.id,
      ...projectedFrame(base, side, 1, 1),
      scale: 1,
      x: 0,
      y: 0,
      hidden: side !== "iso",
      centerMarks: side !== "iso",
    });
    sheet.views.push(base, mk("top"), mk("right"), mk("iso"));
    if (this.source === "assembly") sheet.partsList = { x: 0, y: 0 };
    return {
      sheets: [sheet],
      nextLetter: 0,
      title: {
        title: src.name,
        number: iprops["パーツ番号"] ?? "",
        material,
        designer: iprops["設計者"] ?? "",
        checker: "",
        approver: "",
        date: iprops["作成日"] ?? new Date().toISOString().slice(0, 10),
        company: iprops["会社"] ?? "",
        revision: "A",
        generalTol: "JIS B 0405-m",
      },
    };
  }

  private newSheet(size: PaperSize): Sheet {
    return { id: uid("sh"), name: `シート${(this.store.doc.drawing?.sheets.length ?? 0) + 1}`, size, landscape: true, views: [], annos: [] };
  }

  /** Scale and arrange the views of the active sheet (third-angle layout). */
  autoLayout() {
    const sheet = this.sheet;
    const base = sheet.views.find((v) => v.kind === "base");
    if (!base) return;
    const gb = this.geom.get(base.id);
    if (!gb) return;
    const size = (v: DView | undefined) => {
      const g = v && this.geom.get(v.id);
      return g ? [g.bounds[2] - g.bounds[0], g.bounds[3] - g.bounds[1]] : [0, 0];
    };
    const top = sheet.views.find((v) => v.parent === base.id && v.kind === "projected" && Math.abs(v.dir[1] - 1) < 1e-6);
    const right = sheet.views.find((v) => v.parent === base.id && v.kind === "projected" && Math.abs(v.dir[0] - 1) < 1e-6);
    const iso = sheet.views.find((v) => v.kind === "projected" && v.label === "等角図");
    const [fw, fh] = size(base), [, th] = size(top), [rw] = size(right), [iw, ih] = size(iso);
    const [W, H] = sheetSize(sheet);
    const availW = W - 60, availH = H - 20 - 50 - 30;
    const scale = SCALES.find((s) => (fw + rw + iw * 0.7) * s + 70 <= availW && (fh + th) * s + 45 <= availH) ?? SCALES[SCALES.length - 1];
    const gap = 25;
    const left = 30, topY = 25;
    const place = (v: DView | undefined, x: number, y: number) => {
      if (!v) return;
      const g = this.geom.get(v.id)!;
      // (x, y) = top-left of the view's box on the sheet
      v.scale = scale;
      v.x = x - g.bounds[0] * scale;
      v.y = y + g.bounds[3] * scale;
    };
    this.patch((d) => {
      const sh = d.sheets[this.activeSheet];
      const find = (v?: DView) => v && sh.views.find((x) => x.id === v.id);
      place(find(top), left, topY);
      place(find(base), left, topY + th * scale + gap);
      place(find(right), left + fw * scale + gap, topY + th * scale + gap);
      if (iso) {
        const isoV = find(iso)!;
        const s2 = Math.min(scale, (W - 20 - (left + (fw + rw) * scale + gap * 2)) / Math.max(iw, 1), (availH * 0.6) / Math.max(ih, 1));
        const g = this.geom.get(iso.id)!;
        isoV.scale = SCALES.find((s) => s <= s2) ?? s2;
        isoV.x = left + (fw + rw) * scale + gap * 2 - g.bounds[0] * isoV.scale;
        isoV.y = topY + g.bounds[3] * isoV.scale;
      }
      // projected views keep the parent's alignment
      for (const v of sh.views) this.align(sh, v);
      if (sh.partsList) {
        const rows = this.bom().length + 1;
        sh.partsList = { x: W - 10 - 140, y: H - 10 - 40 - rows * 7 - 4 };
      }
      // automatic overall dimensions on the base view
      const bv = find(base)!;
      if (!sh.annos.some((a) => a.type === "dim") && this.source === "part") {
        const [x0, y0, x1, y1] = gb.bounds;
        sh.annos.push(
          { id: uid("a"), type: "dim", view: bv.id, kind: "horizontal", refs: [{ kind: "point", p: [x0, y0] }, { kind: "point", p: [x1, y0] }], pos: [(x0 + x1) / 2, y0 - 12 / scale] },
          { id: uid("a"), type: "dim", view: bv.id, kind: "vertical", refs: [{ kind: "point", p: [x1, y0] }, { kind: "point", p: [x1, y1] }], pos: [x1 + 12 / scale, (y0 + y1) / 2] },
        );
      }
    });
  }

  /** Projected views stay aligned with their parent (horizontally or vertically). */
  private align(sheet: Sheet, v: DView) {
    if (v.kind !== "projected" || !v.parent || v.label === "等角図") return;
    const p = sheet.views.find((x) => x.id === v.parent);
    if (!p) return;
    const sameX = Math.abs(v.xAxis[0] - p.xAxis[0]) + Math.abs(v.xAxis[1] - p.xAxis[1]) + Math.abs(v.xAxis[2] - p.xAxis[2]) < 1e-6;
    v.scale = p.scale;
    if (sameX) v.x = p.x; // above / below
    else v.y = p.y; // left / right
  }

  // -------------------------------------------------------------- canvas ---

  private mountCanvas() {
    const vp = this.app.vp.el;
    if (!this.canvas) {
      this.stage = h("div", { class: "dw-stage" });
      this.canvas = h("div", { class: "dw-canvas", tabindex: "0" }, this.stage);
      this.canvas.addEventListener("wheel", (e) => this.onWheel(e), { passive: false });
      this.canvas.addEventListener("pointerdown", (e) => this.onDown(e));
      this.canvas.addEventListener("pointermove", (e) => this.onMove(e));
      this.canvas.addEventListener("pointerup", (e) => this.onUp(e));
      this.canvas.addEventListener("dblclick", (e) => this.onDbl(e));
      this.canvas.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        this.contextMenu(e);
      });
    }
    vp.appendChild(this.canvas);
    this.canvas.style.display = "";
  }

  hide() {
    if (this.canvas) this.canvas.style.display = "none";
    this.setTool("select");
  }

  fit() {
    const [w, h] = sheetSize(this.sheet);
    const r = this.canvas.getBoundingClientRect();
    this.zoom = Math.min((r.width - 40) / w, (r.height - 70) / h);
    this.pan = [(r.width - w * this.zoom) / 2, (r.height - 50 - h * this.zoom) / 2];
    this.applyTransform();
  }

  private applyTransform() {
    this.stage.style.transform = `translate(${this.pan[0]}px, ${this.pan[1]}px) scale(${this.zoom})`;
  }

  /** Client pixels -> sheet millimetres. */
  private sheetPt(e: { clientX: number; clientY: number }): Vec2 {
    const svg = this.stage.querySelector("svg") as SVGSVGElement | null;
    if (!svg) return [0, 0];
    const m = svg.getScreenCTM()!.inverse();
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m);
    return [p.x, p.y];
  }

  private onWheel(e: WheelEvent) {
    e.preventDefault();
    const r = this.canvas.getBoundingClientRect();
    const k = Math.exp(-e.deltaY * 0.0012 * (this.app.vp.invertWheel ? -1 : 1));
    const nz = Math.max(0.2, Math.min(30, this.zoom * k));
    const cx = e.clientX - r.left, cy = e.clientY - r.top;
    this.pan = [cx - ((cx - this.pan[0]) * nz) / this.zoom, cy - ((cy - this.pan[1]) * nz) / this.zoom];
    this.zoom = nz;
    this.applyTransform();
  }

  // ------------------------------------------------------------- geometry ---

  private modelHash(): string {
    if (this.source === "assembly") {
      const d = this.app.asm.doc;
      return JSON.stringify([d.components.map((c) => [c.matrix, c.visible, c.partId]), d.parts.map((p) => [p.id, this.app.asm.parts.get(p.id)?.hash])]);
    }
    const d = this.app.store.doc;
    return JSON.stringify([d.features, d.params, d.endOfPart]);
  }

  /** Recompute view geometry where needed, re-attach dimensions, redraw. */
  async refresh(force = false) {
    if (!this.store.doc.drawing) return;
    if (this.updating) {
      this.dirtyGeom = true;
      return this.updating;
    }
    this.updating = (async () => {
      try {
        const mh = this.modelHash();
        if (mh !== this.modelVersion || force) {
          // make sure the kernel holds the current model
          if (this.source === "part") await this.app.regenModelForDrawing();
          else await this.app.asm.update();
          this.modelVersion = this.modelHash();
        }
        await this.computeViews(this.sheet);
        this.resnapAll();
        this.render();
      } finally {
        this.updating = null;
      }
      if (this.dirtyGeom) {
        this.dirtyGeom = false;
        await this.refresh();
      }
    })();
    return this.updating;
  }

  private async computeViews(sheet: Sheet) {
    const placements = this.source === "assembly" ? this.app.asm.placements() : undefined;
    if (this.source === "assembly") this.placements = this.app.asm.doc.components.filter((c) => c.visible !== false).map((c) => c.id);
    const views = sheet.views;
    const todo: DView[] = [];
    for (const v of views) {
      const parent = views.find((p) => p.id === v.parent);
      const spec = viewSpec(v, parent);
      const key = JSON.stringify([this.modelVersion, spec]);
      if (this.geomKey.get(v.id) !== key || !this.geom.has(v.id)) todo.push(v);
    }
    if (!todo.length) return;
    try {
      const res = await this.app.kernel.drawViews(
        todo.map((v) => viewSpec(v, views.find((p) => p.id === v.parent))),
        placements,
      );
      todo.forEach((v, i) => {
        // detail views reuse their parent's projection (clipped)
        this.geom.set(v.id, res[i]);
        this.geomKey.set(v.id, JSON.stringify([this.modelVersion, viewSpec(v, views.find((p) => p.id === v.parent))]));
      });
    } catch (e) {
      toast(`ビューを計算できませんでした: ${(e as Error).message}`, "error");
    }
  }

  /** Keep dimensions attached to the regenerated geometry. */
  private resnapAll() {
    const changes: { id: string; refs: GRef[] }[] = [];
    for (const a of this.sheet.annos) {
      if (a.type !== "dim") continue;
      const g = this.geom.get(a.view);
      if (!g) continue;
      const v = this.sheet.views.find((x) => x.id === a.view);
      const tol = 25 / (v?.scale ?? 1);
      const refs = a.refs.map((r) => resnap(g, r, tol) ?? r);
      if (JSON.stringify(refs) !== JSON.stringify(a.refs)) changes.push({ id: a.id, refs });
    }
    if (changes.length)
      this.patch((d) => {
        const sh = d.sheets[this.activeSheet];
        for (const c of changes) {
          const a = sh.annos.find((x) => x.id === c.id) as DimAnno | undefined;
          if (a) a.refs = c.refs;
        }
      });
  }

  bom(): BomRow[] {
    if (this.source !== "assembly") return [];
    const asm = this.app.asm.doc;
    return asm.parts
      .map((p, i) => ({
        item: i + 1,
        name: p.doc?.iprops["パーツ番号"] || p.name,
        qty: asm.components.filter((c) => c.partId === p.id).length,
        material: p.kind === "step" ? "—" : (p.doc?.material ?? MATERIALS[0]).name,
        note: p.doc?.iprops["説明"] ?? "",
      }))
      .filter((r) => r.qty > 0);
  }

  private itemOfTag = (tag: number): number | undefined => {
    const compId = this.placements[tag];
    const comp = this.app.asm.doc.components.find((c) => c.id === compId);
    if (!comp) return undefined;
    return this.app.asm.doc.parts.findIndex((p) => p.id === comp.partId) + 1 || undefined;
  };

  svgFor(sheetIndex: number): string {
    const sheet = this.doc.sheets[sheetIndex];
    return renderSheet({ doc: this.doc, sheet, geom: this.geom, bom: this.bom(), itemOfTag: this.itemOfTag, sheetIndex });
  }

  render() {
    if (!this.store.doc.drawing) return;
    if (!this.stage) return;
    const ctx = { doc: this.doc, sheet: this.sheet, geom: this.geom, bom: this.bom(), itemOfTag: this.itemOfTag, selected: this.selected, sheetIndex: this.activeSheet };
    let svg = renderSheet(ctx);
    if (this.preview) svg = svg.replace("</svg>", `<g class="dw-preview">${this.preview}</g></svg>`);
    // on screen 1 sheet mm = 1 CSS px before zoom (fit / pan math relies on it)
    const [sw, sh] = sheetSize(this.sheet);
    this.stage.innerHTML = svg.replace(`width="${sw}mm" height="${sh}mm"`, `width="${sw}" height="${sh}"`);
    this.app.browser.render();
    this.app.ribbon.refresh();
  }

  // --------------------------------------------------------------- tools ---

  setTool(t: Tool) {
    this.tool = t;
    this.picks = { refs: [], pts: [] };
    this.preview = null;
    if (this.canvas) this.canvas.dataset.tool = t;
    this.app.status(PROMPTS[t]);
    this.render();
  }

  private viewAt(p: Vec2): DView | undefined {
    // smallest box containing the point wins (detail views sit on top)
    let best: DView | undefined, area = Infinity;
    for (const v of this.sheet.views) {
      const b = viewBox(v, this.geom.get(v.id));
      const m = 4;
      if (p[0] < b[0] - m || p[0] > b[2] + m || p[1] < b[1] - m || p[1] > b[3] + m) continue;
      const a = (b[2] - b[0]) * (b[3] - b[1]);
      if (a < area) (area = a), (best = v);
    }
    return best;
  }

  private snap(e: PointerEvent | MouseEvent, view?: DView, kinds?: GRef["kind"][]): { view: DView; snap: Snap } | null {
    const p = this.sheetPt(e);
    const v = view ?? this.viewAt(p);
    if (!v) return null;
    const g = this.geom.get(v.id);
    if (!g) return null;
    const tolMm = 8 / this.zoom; // ~8 px
    const s = snapAt(g, toView(v, p), tolMm / v.scale, kinds);
    return s ? { view: v, snap: s } : null;
  }

  private annoAt(e: { target: EventTarget | null }): string | null {
    const el = (e.target as Element | null)?.closest?.("[data-id]") as HTMLElement | null;
    return el?.dataset.id ?? null;
  }

  private onDown(e: PointerEvent) {
    this.canvas.focus();
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      this.panDrag = { x: e.clientX, y: e.clientY };
      this.canvas.setPointerCapture(e.pointerId);
      return;
    }
    if (e.button !== 0) return;
    const p = this.sheetPt(e);
    if (this.tool === "select") {
      const id = this.annoAt(e);
      if (!id) {
        this.selected.clear();
        this.render();
        return;
      }
      if (e.shiftKey || e.ctrlKey) this.selected.has(id) ? this.selected.delete(id) : this.selected.add(id);
      else this.selected = new Set([id]);
      const view = this.sheet.views.find((v) => v.id === id);
      const anno = this.sheet.annos.find((a) => a.id === id);
      this.drag = {
        id,
        kind: view ? "view" : "anno",
        start: p,
        orig: structuredClone(view ?? anno ?? this.sheet.partsList),
        snap: this.store.snapshot(),
        moved: false,
      };
      this.canvas.setPointerCapture(e.pointerId);
      this.render();
      return;
    }
    void this.toolClick(e, p);
  }

  private onMove(e: PointerEvent) {
    if (this.panDrag) {
      this.pan = [this.pan[0] + e.clientX - this.panDrag.x, this.pan[1] + e.clientY - this.panDrag.y];
      this.panDrag = { x: e.clientX, y: e.clientY };
      this.applyTransform();
      return;
    }
    const p = this.sheetPt(e);
    if (this.drag) {
      const d = this.drag;
      const dx = p[0] - d.start[0], dy = p[1] - d.start[1];
      if (!d.moved && Math.hypot(dx, dy) * this.zoom < 3) return;
      d.moved = true;
      this.store.restore(d.snap, "drawing-silent");
      this.patch((doc) => {
        const sh = doc.sheets[this.activeSheet];
        if (d.kind === "view") {
          const v = sh.views.find((x) => x.id === d.id)!;
          const o = d.orig as DView;
          v.x = o.x + dx;
          v.y = o.y + dy;
          this.align(sh, v);
          // children follow their parent
          for (const c of sh.views) if (c.parent === v.id) this.align(sh, c);
        } else if (d.id === "__partslist") {
          const o = d.orig as { x: number; y: number };
          sh.partsList = { x: o.x + dx, y: o.y + dy };
        } else moveAnno(sh, d.id, d.orig as Anno, dx, dy);
      });
      this.render();
      return;
    }
    this.updatePreview(e, p);
  }

  private onUp(e: PointerEvent) {
    if (this.panDrag) {
      this.panDrag = null;
      return;
    }
    const d = this.drag;
    this.drag = null;
    if (d?.moved) {
      const cur = this.store.snapshot();
      this.store.restore(d.snap, "drawing-silent");
      this.store.pushHistory(d.snap);
      this.store.restore(cur, "drawing");
    }
    void e;
  }

  private onDbl(e: MouseEvent) {
    const id = this.annoAt(e);
    if (!id) return;
    const a = this.sheet.annos.find((x) => x.id === id);
    if (a) return void this.editAnno(a);
    const v = this.sheet.views.find((x) => x.id === id);
    if (v) this.editView(v);
  }

  private contextMenu(e: MouseEvent) {
    const id = this.annoAt(e);
    if (this.tool !== "select") return this.setTool("select");
    if (!id) {
      contextMenu(e.clientX, e.clientY, [
        { label: "全体表示", icon: "zoomFit", action: () => this.fit() },
        { label: "基準ビュー", icon: "drawing", action: () => this.setTool("base") },
        { label: "寸法", icon: "dimension", action: () => this.setTool("dim") },
        { label: "モデルに戻る", icon: "part", action: () => this.app.leaveDrawingEnv() },
      ]);
      return;
    }
    if (!this.selected.has(id)) {
      this.selected = new Set([id]);
      this.render();
    }
    const items: MenuItem[] = [];
    const v = this.sheet.views.find((x) => x.id === id);
    const a = this.sheet.annos.find((x) => x.id === id);
    if (v) items.push({ label: "ビューを編集", icon: "edit", action: () => this.editView(v) });
    if (a) items.push({ label: "編集", icon: "edit", action: () => this.editAnno(a) });
    items.push({ label: "削除", icon: "trash", danger: true, shortcut: "Delete", action: () => void this.deleteSelection() });
    contextMenu(e.clientX, e.clientY, items);
  }

  // ------------------------------------------------------ tool behaviour ---

  private updatePreview(e: PointerEvent, p: Vec2) {
    let pv: string | null = null;
    const t = this.tool;
    const mark = (q: Vec2, color = "#f97316") => `<circle cx="${q[0]}" cy="${q[1]}" r="${1.4}" fill="${color}" stroke="none"/>`;
    if (["dim", "hole", "leader", "surface", "gdt", "datum", "balloon", "centerline", "section", "detail"].includes(t)) {
      const view = this.picks.view ? this.sheet.views.find((v) => v.id === this.picks.view) : undefined;
      const s = this.snap(e, view);
      if (s) {
        const v = s.view;
        const r = s.snap.ref;
        if (r.kind === "line") {
          const a = toSheet(v, r.p), b = toSheet(v, r.p2!);
          pv = `<path d="M${a[0]} ${a[1]}L${b[0]} ${b[1]}" stroke="#f97316" stroke-width="0.8" fill="none"/>`;
        } else if (r.kind === "circle") {
          const c = toSheet(v, r.p);
          pv = `<circle cx="${c[0]}" cy="${c[1]}" r="${(r.r ?? 0) * v.scale}" stroke="#f97316" stroke-width="0.8" fill="none"/>`;
        } else pv = mark(toSheet(v, r.p));
      }
      if (t === "section" && this.picks.pts.length === 1 && view) {
        const a = toSheet(view, this.picks.pts[0]);
        pv = (pv ?? "") + `<path d="M${a[0]} ${a[1]}L${p[0]} ${p[1]}" stroke="#1f6feb" stroke-width="0.4" stroke-dasharray="6 1.5 1 1.5" fill="none"/>`;
      }
      if (t === "detail" && this.picks.pts.length === 1 && view) {
        const c = toSheet(view, this.picks.pts[0]);
        pv = (pv ?? "") + `<circle cx="${c[0]}" cy="${c[1]}" r="${Math.hypot(p[0] - c[0], p[1] - c[1])}" stroke="#1f6feb" stroke-width="0.4" fill="none"/>`;
      }
      if (this.picks.refs.length && view) {
        for (const r of this.picks.refs) {
          if (r.kind === "line") {
            const a = toSheet(view, r.p), b = toSheet(view, r.p2!);
            pv = (pv ?? "") + `<path d="M${a[0]} ${a[1]}L${b[0]} ${b[1]}" stroke="#1f6feb" stroke-width="0.8" fill="none"/>`;
          } else if (r.kind === "circle") {
            const c = toSheet(view, r.p);
            pv = (pv ?? "") + `<circle cx="${c[0]}" cy="${c[1]}" r="${(r.r ?? 0) * view.scale}" stroke="#1f6feb" stroke-width="0.8" fill="none"/>`;
          } else pv = (pv ?? "") + mark(toSheet(view, r.p), "#1f6feb");
        }
      }
    }
    if ((t === "base" || t === "projected" || (t === "section" && this.picks.pts.length === 2) || (t === "detail" && this.picks.pts.length === 2)) && (t !== "projected" || this.picks.view)) {
      pv = (pv ?? "") + `<rect x="${p[0] - 15}" y="${p[1] - 10}" width="30" height="20" stroke="#1f6feb" stroke-width="0.4" stroke-dasharray="2 1" fill="rgba(31,111,235,.06)"/>`;
    }
    if (pv !== this.preview) {
      this.preview = pv;
      const old = this.stage.querySelector(".dw-preview");
      old?.remove();
      if (pv) this.stage.querySelector("svg")?.insertAdjacentHTML("beforeend", `<g class="dw-preview">${pv}</g>`);
    }
  }

  private async toolClick(e: PointerEvent, p: Vec2) {
    const t = this.tool;
    const view = this.picks.view ? this.sheet.views.find((v) => v.id === this.picks.view) : undefined;
    switch (t) {
      case "base": {
        const o = ORIENTS[this.baseOrient];
        const v: DView = { id: uid("v"), label: o.label, kind: "base", dir: o.dir, xAxis: o.xAxis, scale: this.sheet.views[0]?.scale ?? 1, x: p[0], y: p[1], hidden: this.baseOrient !== "iso", centerMarks: true };
        this.mutate("基準ビュー", (d) => d.sheets[this.activeSheet].views.push(v));
        await this.refresh();
        this.centerView(v.id, p);
        this.setTool("select");
        return;
      }
      case "projected": {
        if (!view) {
          const pv = this.viewAt(p);
          if (!pv) return;
          this.picks.view = pv.id;
          this.app.status("投影ビューを配置する位置をクリック (右クリックで終了)");
          return;
        }
        const b = viewBox(view, this.geom.get(view.id));
        const cx = (b[0] + b[2]) / 2, cy = (b[1] + b[3]) / 2;
        const dx = p[0] - cx, dy = p[1] - cy;
        const diag = Math.abs(dx) > (b[2] - b[0]) / 2 && Math.abs(dy) > (b[3] - b[1]) / 2;
        const side = diag ? "iso" : Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "bottom" : "top";
        // sheet y is down: "below" the parent = bottom view in third angle
        const frame = projectedFrame(view, side, dx > 0 ? 1 : -1, dy < 0 ? 1 : -1);
        const nv: DView = { id: uid("v"), label: side === "iso" ? "等角図" : "", kind: "projected", parent: view.id, ...frame, scale: view.scale, x: p[0], y: p[1], hidden: side !== "iso", centerMarks: side !== "iso" };
        this.mutate("投影ビュー", (d) => {
          const sh = d.sheets[this.activeSheet];
          sh.views.push(nv);
          this.align(sh, nv);
        });
        await this.refresh();
        if (side === "iso") this.centerView(nv.id, p);
        else this.centerOnAxis(nv.id, p, side === "left" || side === "right" ? "x" : "y");
        return;
      }
      case "section":
      case "detail": {
        if (this.picks.pts.length < 2) {
          const pv = view ?? this.viewAt(p);
          if (!pv) return;
          this.picks.view = pv.id;
          const s = this.snap(e, pv);
          let q = s ? s.snap.ref.p : toView(pv, p);
          if (t === "section" && this.picks.pts.length === 1) {
            // snap the cutting line horizontal / vertical when close
            const a = this.picks.pts[0];
            if (Math.abs(q[1] - a[1]) < Math.abs(q[0] - a[0]) * 0.08) q = [q[0], a[1]];
            else if (Math.abs(q[0] - a[0]) < Math.abs(q[1] - a[1]) * 0.08) q = [a[0], q[1]];
            if (s && s.snap.ref.kind === "circle") q = s.snap.ref.p;
          }
          if (t === "detail" && this.picks.pts.length === 1) q = toView(pv, p);
          this.picks.pts.push(q);
          this.app.status(this.picks.pts.length === 1 ? (t === "section" ? "切断線の終点をクリック" : "詳細の半径をクリック") : `${t === "section" ? "断面図" : "詳細図"}を配置する位置をクリック`);
          return;
        }
        const parent = view!;
        const letter = String.fromCharCode(65 + (this.doc.nextLetter % 26));
        let nv: DView;
        if (t === "section") {
          const [a, b] = this.picks.pts;
          // view towards the side where the section is placed
          const bb = viewBox(parent, this.geom.get(parent.id));
          const mid = toSheet(parent, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]);
          const ls = [toSheet(parent, a), toSheet(parent, b)];
          const nrm: Vec2 = [-(ls[1][1] - ls[0][1]), ls[1][0] - ls[0][0]];
          const side = (p[0] - mid[0]) * nrm[0] + (p[1] - mid[1]) * nrm[1];
          const flip = side < 0;
          const frame = sectionFrame(parent, a, b, flip);
          nv = { id: uid("v"), label: `${letter}-${letter}`, kind: "section", parent: parent.id, ...frame, scale: parent.scale, x: p[0], y: p[1], hidden: false, centerMarks: true, section: { a, b, flip } };
          void bb;
        } else {
          const [c, rp] = this.picks.pts;
          const r = Math.hypot(rp[0] - c[0], rp[1] - c[1]);
          nv = { id: uid("v"), label: letter, kind: "detail", parent: parent.id, dir: parent.dir, xAxis: parent.xAxis, scale: Math.min(10, parent.scale * 2), x: p[0], y: p[1], hidden: parent.hidden, centerMarks: parent.centerMarks, detail: { c, r } };
        }
        this.mutate(t === "section" ? "断面図" : "詳細図", (d) => {
          d.sheets[this.activeSheet].views.push(nv);
          d.nextLetter++;
        });
        await this.refresh();
        if (t === "section") this.centerView(nv.id, p);
        this.setTool("select");
        return;
      }
      case "dim":
        return this.dimClick(e, p);
      case "hole": {
        if (!this.picks.refs.length) {
          const s = this.snap(e, undefined, ["circle"]);
          if (!s) return;
          this.picks = { view: s.view.id, refs: [s.snap.ref], pts: [] };
          this.app.status("注記の位置をクリック");
          return;
        }
        this.addDim(view!, "hole", this.picks.refs, toView(view!, p));
        this.picks = { refs: [], pts: [] };
        return;
      }
      case "note": {
        const text = await promptDialog("テキスト", "注記 (改行は \\n)", "");
        if (text) this.mutate("注記", (d) => d.sheets[this.activeSheet].annos.push({ id: uid("a"), type: "note", x: p[0], y: p[1], text: text.replace(/\\n/g, "\n") }));
        return;
      }
      case "leader":
      case "gdt":
      case "surface":
      case "datum":
      case "balloon": {
        if (!this.picks.refs.length) {
          const s = this.snap(e);
          const v = s?.view ?? this.viewAt(p);
          if (!v) return;
          // attach to the nearest point on the picked geometry
          const target: Vec2 = s ? nearestOn(s.snap.ref, toView(v, p)) : toView(v, p);
          if (t === "surface") {
            const ra = await promptDialog("表面性状", "パラメータと値 (例: Ra 3.2)", "Ra 3.2");
            if (ra) this.mutate("表面性状", (d) => d.sheets[this.activeSheet].annos.push({ id: uid("a"), type: "surface", view: v.id, p: target, ra, removal: "required" }));
            return;
          }
          if (t === "balloon") {
            if (this.source !== "assembly") {
              toast("風船はアセンブリ図面で使用します", "info");
              return;
            }
            const tag = this.tagAt(v, toView(v, p));
            if (tag < 0) {
              toast("部品のエッジをクリックしてください", "info");
              return;
            }
            this.picks = { view: v.id, refs: [{ kind: "point", p: target }], pts: [[tag, 0]] };
          } else this.picks = { view: v.id, refs: [{ kind: "point", p: target }], pts: [] };
          this.app.status("位置をクリック");
          return;
        }
        const v = view!;
        const target = this.picks.refs[0].p;
        if (t === "leader") {
          const text = await promptDialog("引出線注記", "テキスト", "");
          if (text) this.mutate("引出線注記", (d) => d.sheets[this.activeSheet].annos.push({ id: uid("a"), type: "note", x: p[0], y: p[1], text, leader: { view: v.id, p: target } }));
        } else if (t === "gdt") {
          const res = await gdtDialog();
          if (res) this.mutate("幾何公差", (d) => d.sheets[this.activeSheet].annos.push({ id: uid("a"), type: "gdt", x: p[0], y: p[1], ...res, leader: { view: v.id, p: target } }));
        } else if (t === "datum") {
          const used = new Set(this.sheet.annos.filter((a) => a.type === "datum").map((a) => (a as { letter: string }).letter));
          let L = "A";
          for (let i = 0; i < 26 && used.has(L); i++) L = String.fromCharCode(65 + i + 1);
          this.mutate("データム", (d) => d.sheets[this.activeSheet].annos.push({ id: uid("a"), type: "datum", view: v.id, p: target, pos: toView(v, p), letter: L }));
        } else if (t === "balloon") {
          const tag = this.picks.pts[0][0];
          this.mutate("風船", (d) => d.sheets[this.activeSheet].annos.push({ id: uid("a"), type: "balloon", view: v.id, p: target, pos: toView(v, p), tag }));
        }
        this.picks = { refs: [], pts: [] };
        this.app.status(PROMPTS[t]);
        return;
      }
      case "centerline": {
        const s = this.snap(e, view, ["line", "circle"]);
        if (!s) return;
        this.picks.view = s.view.id;
        this.picks.refs.push(s.snap.ref);
        if (this.picks.refs.length < 2) return;
        const [r1, r2] = this.picks.refs;
        let a: Vec2, b: Vec2;
        if (r1.kind === "circle" && r2.kind === "circle") (a = r1.p), (b = r2.p);
        else if (r1.kind === "line" && r2.kind === "line") {
          // mid line of two (parallel) lines
          const flip = Math.hypot(r1.p[0] - r2.p[0], r1.p[1] - r2.p[1]) > Math.hypot(r1.p[0] - r2.p2![0], r1.p[1] - r2.p2![1]);
          const q1 = flip ? r2.p2! : r2.p, q2 = flip ? r2.p : r2.p2!;
          a = [(r1.p[0] + q1[0]) / 2, (r1.p[1] + q1[1]) / 2];
          b = [(r1.p2![0] + q2[0]) / 2, (r1.p2![1] + q2[1]) / 2];
        } else {
          this.picks = { refs: [], pts: [] };
          return;
        }
        const vid = s.view.id;
        this.mutate("中心線", (d) => d.sheets[this.activeSheet].annos.push({ id: uid("a"), type: "centerline", view: vid, a, b }));
        this.picks = { refs: [], pts: [] };
        return;
      }
      case "select":
        return;
    }
  }

  private tagAt(v: DView, p: Vec2): number {
    const g = this.geom.get(v.id);
    if (!g) return -1;
    let best = -1, bd = 10 / this.zoom / v.scale;
    for (const s of g.visible) {
      if (s.tag < 0) continue;
      const d = s.t === "line" ? segD(p, s.a, s.b) : s.t === "poly" ? Math.min(...s.pts.slice(1).map((q, i) => segD(p, s.pts[i], q))) : Math.abs(Math.hypot(p[0] - s.c[0], p[1] - s.c[1]) - s.r);
      if (d < bd) (bd = d), (best = s.tag);
    }
    return best;
  }

  /** Smart dimension: picks decide the type, the final click places it. */
  private dimClick(e: PointerEvent, p: Vec2) {
    const view = this.picks.view ? this.sheet.views.find((v) => v.id === this.picks.view) : undefined;
    const s = this.snap(e, view);
    const refs = this.picks.refs;
    // place when we already have enough and the click is not on new geometry
    const ready = refs.length === 2 || (refs.length === 1 && (refs[0].kind === "line" || refs[0].kind === "circle"));
    if (ready && (!s || refs.length === 2 || refs[0].kind === "circle")) {
      const v = view!;
      const q = toView(v, p);
      let kind: DimKind;
      if (refs[0].kind === "circle" && refs.length === 1) kind = isFullCircle(this.geom.get(v.id)!, refs[0]) ? "diameter" : "radius";
      else if (refs.length === 2 && refs[0].kind === "line" && refs[1].kind === "line" && !parallel(refs[0], refs[1])) kind = "angle";
      else kind = autoLinear(refs, q);
      this.addDim(v, kind, refs, q);
      this.picks = { refs: [], pts: [] };
      this.app.status(PROMPTS.dim);
      return;
    }
    if (!s) return;
    if (this.picks.view && s.view.id !== this.picks.view) return;
    this.picks.view = s.view.id;
    this.picks.refs.push(s.snap.ref);
    this.app.status(this.picks.refs.length === 1 && s.snap.ref.kind === "point" ? "2 点目 (点または線分) をクリック" : "寸法の位置をクリック (または 2 つ目を選択)");
  }

  private addDim(v: DView, kind: DimKind, refs: GRef[], pos: Vec2) {
    const a: DimAnno = { id: uid("a"), type: "dim", view: v.id, kind, refs: structuredClone(refs), pos };
    this.mutate("寸法", (d) => d.sheets[this.activeSheet].annos.push(a));
  }

  /** Put the view's geometric centre at sheet point p. */
  private centerView(id: string, p: Vec2) {
    const v = this.sheet.views.find((x) => x.id === id);
    const g = v && this.geom.get(id);
    if (!v || !g || v.detail) return;
    const cx = (g.bounds[0] + g.bounds[2]) / 2, cy = (g.bounds[1] + g.bounds[3]) / 2;
    this.patch((d) => {
      const vv = d.sheets[this.activeSheet].views.find((x) => x.id === id)!;
      vv.x = p[0] - cx * vv.scale;
      vv.y = p[1] + cy * vv.scale;
    });
    this.render();
  }

  private centerOnAxis(id: string, p: Vec2, axis: "x" | "y") {
    const v = this.sheet.views.find((x) => x.id === id);
    const g = v && this.geom.get(id);
    if (!v || !g) return;
    this.patch((d) => {
      const vv = d.sheets[this.activeSheet].views.find((x) => x.id === id)!;
      if (axis === "x") vv.x = p[0] - ((g.bounds[0] + g.bounds[2]) / 2) * vv.scale;
      else vv.y = p[1] + ((g.bounds[1] + g.bounds[3]) / 2) * vv.scale;
    });
    this.render();
  }

  // -------------------------------------------------------------- editing ---

  async deleteSelection() {
    const ids = new Set(this.selected);
    if (!ids.size) return;
    const views = this.sheet.views.filter((v) => ids.has(v.id));
    // deleting a view deletes its dependants and annotations
    const all = new Set(views.map((v) => v.id));
    let grew = true;
    while (grew) {
      grew = false;
      for (const v of this.sheet.views) if (v.parent && all.has(v.parent) && !all.has(v.id)) (all.add(v.id), (grew = true));
    }
    if (all.size > views.length && !(await confirmDialog("ビューの削除", "依存するビュー (投影・断面・詳細) も削除されます。", "削除"))) return;
    this.mutate("削除", (d) => {
      const sh = d.sheets[this.activeSheet];
      sh.views = sh.views.filter((v) => !all.has(v.id));
      sh.annos = sh.annos.filter((a) => !ids.has(a.id) && !("view" in a && all.has(a.view)) && !(a.type === "note" && a.leader && all.has(a.leader.view)));
      if (ids.has("__partslist")) sh.partsList = null;
    });
    this.selected.clear();
    await this.refresh();
  }

  private editView(v: DView) {
    const scale = h("select", { class: "field-input" });
    for (const s of SCALES) scale.appendChild(h("option", { value: String(s), selected: Math.abs(s - v.scale) < 1e-9 }, scaleText(s)));
    const label = h("input", { class: "field-input", value: v.label });
    const hidden = h("input", { type: "checkbox", checked: v.hidden });
    const cm = h("input", { type: "checkbox", checked: v.centerMarks });
    const body = h(
      "div",
      { class: "settings" },
      h("label", { class: "field" }, h("span", { class: "field-label" }, "ラベル"), h("span", { class: "field-ctl" }, label)),
      h("label", { class: "field" }, h("span", { class: "field-label" }, "尺度"), h("span", { class: "field-ctl" }, scale)),
      h("label", { class: "field check" }, hidden, h("span", {}, "隠れ線を表示")),
      h("label", { class: "field check" }, cm, h("span", {}, "中心マークを表示")),
      v.kind === "section" ? h("p", { class: "muted" }, "断面の向きを反転するには、ビューを削除して反対側に配置し直してください。") : null,
    );
    modal({
      title: "ビューを編集",
      icon: "drawing",
      width: 440,
      body,
      buttons: [
        {
          label: "OK",
          primary: true,
          onClick: () => {
            this.mutate("ビューを編集", (d) => {
              const sh = d.sheets[this.activeSheet];
              const vv = sh.views.find((x) => x.id === v.id)!;
              const ns = Number(scale.value);
              // keep the view centred when the scale changes
              const g = this.geom.get(v.id);
              if (g && !vv.detail && Math.abs(ns - vv.scale) > 1e-12) {
                const cx = (g.bounds[0] + g.bounds[2]) / 2, cy = (g.bounds[1] + g.bounds[3]) / 2;
                const sc = toSheet(vv, [cx, cy]);
                vv.scale = ns;
                vv.x = sc[0] - cx * ns;
                vv.y = sc[1] + cy * ns;
              } else vv.scale = ns;
              vv.label = label.value;
              vv.hidden = hidden.checked;
              vv.centerMarks = cm.checked;
              for (const c of sh.views) if (c.parent === vv.id) this.align(sh, c);
            });
            void this.refresh();
          },
        },
        { label: "キャンセル" },
      ],
    });
  }

  private editAnno(a: Anno) {
    if (a.type === "dim") return this.editDim(a);
    if (a.type === "note") {
      void promptDialog("注記を編集", "テキスト (改行は \\n)", a.text.replace(/\n/g, "\\n")).then((t) => t !== null && this.mutate("注記を編集", (d) => ((d.sheets[this.activeSheet].annos.find((x) => x.id === a.id) as typeof a).text = t.replace(/\\n/g, "\n"))));
      return;
    }
    if (a.type === "surface") {
      void promptDialog("表面性状", "パラメータと値", a.ra).then((t) => t && this.mutate("表面性状", (d) => ((d.sheets[this.activeSheet].annos.find((x) => x.id === a.id) as typeof a).ra = t)));
      return;
    }
    if (a.type === "gdt") {
      void gdtDialog(a).then((r) => r && this.mutate("幾何公差", (d) => Object.assign(d.sheets[this.activeSheet].annos.find((x) => x.id === a.id)!, r)));
      return;
    }
    if (a.type === "datum") {
      void promptDialog("データム", "記号", a.letter).then((t) => t && this.mutate("データム", (d) => ((d.sheets[this.activeSheet].annos.find((x) => x.id === a.id) as typeof a).letter = t.toUpperCase())));
    }
  }

  private editDim(a: DimAnno) {
    const tol = a.tol ?? { kind: "none" };
    const kind = h("select", { class: "field-input" });
    const kinds: [Tolerance["kind"], string][] = [
      ["none", "なし"],
      ["sym", "対称 (±)"],
      ["dev", "上下の許容差"],
      ["fit", "はめあい (H7, g6 ...)"],
      ["basic", "理論的に正確な寸法 (枠)"],
      ["ref", "参考寸法 ( )"],
    ];
    for (const [k, l] of kinds) kind.appendChild(h("option", { value: k, selected: k === tol.kind }, l));
    const v1 = h("input", { class: "field-input", value: tol.kind === "sym" ? tol.value : tol.kind === "dev" ? tol.upper : tol.kind === "fit" ? tol.fit : "" });
    const v2 = h("input", { class: "field-input", value: tol.kind === "dev" ? tol.lower : "" });
    const prefix = h("input", { class: "field-input", value: a.prefix ?? "" });
    const suffix = h("input", { class: "field-input", value: a.suffix ?? "" });
    const text = h("input", { class: "field-input", value: a.text ?? "", placeholder: "空欄 = 実測値 (モデルに連動)" });
    const fits = h("datalist", { id: "fits" }, ...["H7", "H8", "H9", "h6", "h7", "g6", "f7", "js6", "k6", "m6", "n6", "p6", "H7/g6", "H7/h6", "H7/p6"].map((x) => h("option", { value: x })));
    const lab1 = h("span", { class: "field-label" }), lab2 = h("span", { class: "field-label" }, "下の許容差");
    const row2 = h("label", { class: "field" }, lab2, h("span", { class: "field-ctl" }, v2));
    const row1 = h("label", { class: "field" }, lab1, h("span", { class: "field-ctl" }, v1));
    const upd = () => {
      const k = kind.value;
      row1.style.display = ["sym", "dev", "fit"].includes(k) ? "" : "none";
      row2.style.display = k === "dev" ? "" : "none";
      lab1.textContent = k === "sym" ? "公差 (±)" : k === "fit" ? "はめあい記号" : "上の許容差";
      v1.setAttribute("list", k === "fit" ? "fits" : "");
    };
    kind.addEventListener("change", upd);
    upd();
    const body = h(
      "div",
      { class: "settings" },
      fits,
      h("p", { class: "muted" }, `測定値: ${formatNumber(dimMeasured(a), 3)}${a.kind === "angle" ? "°" : " mm"}`),
      h("label", { class: "field" }, h("span", { class: "field-label" }, "公差の種類"), h("span", { class: "field-ctl" }, kind)),
      row1,
      row2,
      h("label", { class: "field" }, h("span", { class: "field-label" }, "前置き"), h("span", { class: "field-ctl" }, prefix)),
      h("label", { class: "field" }, h("span", { class: "field-label" }, "後置き"), h("span", { class: "field-ctl" }, suffix)),
      h("label", { class: "field" }, h("span", { class: "field-label" }, "値の上書き"), h("span", { class: "field-ctl" }, text)),
      h("p", { class: "muted" }, "例: 前置き「2×」、後置き「キリ 深さ 10」、はめあい「H7」"),
    );
    modal({
      title: "寸法を編集",
      icon: "dimension",
      width: 460,
      body,
      buttons: [
        {
          label: "OK",
          primary: true,
          onClick: () => {
            const k = kind.value as Tolerance["kind"];
            const t: Tolerance =
              k === "sym" ? { kind: "sym", value: v1.value } : k === "dev" ? { kind: "dev", upper: v1.value, lower: v2.value } : k === "fit" ? { kind: "fit", fit: v1.value } : ({ kind: k } as Tolerance);
            this.mutate("寸法を編集", (d) => {
              const x = d.sheets[this.activeSheet].annos.find((y) => y.id === a.id) as DimAnno;
              x.tol = t;
              x.prefix = prefix.value || undefined;
              x.suffix = suffix.value || undefined;
              x.text = text.value || undefined;
            });
          },
        },
        { label: "キャンセル" },
      ],
    });
  }

  // --------------------------------------------------------------- sheets ---

  async addSheet() {
    const size = this.sheet.size;
    this.mutate("シートを追加", (d) => d.sheets.push({ ...this.newSheet(size), name: `シート${d.sheets.length + 1}` }));
    this.activeSheet = this.doc.sheets.length - 1;
    await this.refresh();
    this.fit();
    this.setTool("base");
  }

  async switchSheet(i: number) {
    this.activeSheet = i;
    this.selected.clear();
    await this.refresh();
    this.fit();
  }

  sheetSettings() {
    const size = h("select", { class: "field-input" });
    for (const s of Object.keys(PAPER)) size.appendChild(h("option", { value: s, selected: s === this.sheet.size }, `${s} (${PAPER[s as PaperSize].join(" × ")} mm)`));
    const orient = h("select", { class: "field-input" }, h("option", { value: "l", selected: this.sheet.landscape }, "横"), h("option", { value: "p", selected: !this.sheet.landscape }, "縦"));
    const name = h("input", { class: "field-input", value: this.sheet.name });
    const t = this.doc.title;
    const fields: [keyof typeof t, string][] = [
      ["title", "名称"],
      ["number", "図番"],
      ["material", "材質"],
      ["designer", "設計"],
      ["checker", "検図"],
      ["approver", "承認"],
      ["date", "日付"],
      ["revision", "版"],
      ["company", "会社"],
      ["generalTol", "普通公差"],
    ];
    const inputs = fields.map(([k]) => h("input", { class: "field-input", value: t[k] }));
    const body = h(
      "div",
      { class: "settings" },
      h("h3", {}, "シート"),
      h("label", { class: "field" }, h("span", { class: "field-label" }, "名前"), h("span", { class: "field-ctl" }, name)),
      h("label", { class: "field" }, h("span", { class: "field-label" }, "用紙サイズ"), h("span", { class: "field-ctl" }, size)),
      h("label", { class: "field" }, h("span", { class: "field-label" }, "向き"), h("span", { class: "field-ctl" }, orient)),
      h("h3", {}, "表題欄"),
      ...fields.map(([, l], i) => h("label", { class: "field" }, h("span", { class: "field-label" }, l), h("span", { class: "field-ctl" }, inputs[i]))),
    );
    modal({
      title: "シートと表題欄",
      icon: "drawing",
      width: 500,
      body,
      buttons: [
        {
          label: "OK",
          primary: true,
          onClick: () => {
            this.mutate("シート設定", (d) => {
              const sh = d.sheets[this.activeSheet];
              sh.size = size.value as PaperSize;
              sh.landscape = orient.value === "l";
              sh.name = name.value || sh.name;
              fields.forEach(([k], i) => (d.title[k] = inputs[i].value));
            });
            this.render();
            this.fit();
          },
        },
        { label: "キャンセル" },
      ],
    });
  }

  togglePartsList() {
    if (this.source !== "assembly") {
      toast("部品表はアセンブリ図面で使用します", "info");
      return;
    }
    const [W, H] = sheetSize(this.sheet);
    this.mutate("部品表", (d) => {
      const sh = d.sheets[this.activeSheet];
      sh.partsList = sh.partsList ? null : { x: W - 10 - 140, y: H - 10 - 40 - (this.bom().length + 1) * 7 - 4 };
    });
  }

  // --------------------------------------------------------------- export ---

  async exportPdf() {
    // render every sheet (geometry for other sheets first)
    for (const s of this.doc.sheets) await this.computeViews(s);
    const pages = this.doc.sheets.map((_, i) => this.svgFor(i));
    const [w, h] = sheetSize(this.doc.sheets[0]);
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(this.doc.title.title)}</title><style>@page{size:${w}mm ${h}mm;margin:0}html,body{margin:0}.pg{width:${w}mm;height:${h}mm;page-break-after:always;overflow:hidden}.pg:last-child{page-break-after:auto}svg{width:${w}mm;height:${h}mm;display:block}</style></head><body>${pages.map((p) => `<div class="pg">${p}</div>`).join("")}</body></html>`;
    const desktop = (window as unknown as { desktop?: { printPdf?: (html: string, w: number, h: number, name: string) => Promise<boolean> } }).desktop;
    if (desktop?.printPdf) {
      const ok = await desktop.printPdf(html, w, h, `${this.doc.title.title || "drawing"}.pdf`);
      if (ok) toast("PDF を保存しました", "ok");
      return;
    }
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 300);
  }

  exportDxf() {
    const holder = h("div", { style: "position:fixed;left:-99999px;top:0" });
    holder.innerHTML = this.svgFor(this.activeSheet);
    document.body.appendChild(holder);
    const svg = holder.querySelector("svg") as SVGSVGElement;
    const [, hh] = sheetSize(this.sheet);
    download(`${this.doc.title.title || "drawing"}_${this.sheet.name}.dxf`, svgToDxf(svg, hh), "application/dxf");
    holder.remove();
    toast("DXF を書き出しました (AutoCAD / Jw_cad で開けます)", "ok");
  }

  exportSvg() {
    download(`${this.doc.title.title || "drawing"}_${this.sheet.name}.svg`, this.svgFor(this.activeSheet), "image/svg+xml");
  }

  // ------------------------------------------------------------- browser ---

  renderBrowser(list: HTMLElement) {
    if (!this.store.doc.drawing) return;
    list.innerHTML = "";
    const row = (id: string, ic: string, label: string, depth: number, cls = "", onClick?: () => void, onDbl?: () => void) => {
      const el = h("div", { class: `br-row ${cls}`, style: `--depth:${depth}`, "data-id": id }, h("span", { class: "br-exp-sp" }), iconEl(ic), h("span", { class: "br-label" }, label));
      if (onClick) el.addEventListener("click", onClick);
      if (onDbl) el.addEventListener("dblclick", onDbl);
      list.appendChild(el);
    };
    row("__dw", "drawing", `${this.doc.title.title || this.store.doc.name} (図面)`, 0, "root");
    this.doc.sheets.forEach((s, i) => {
      row(s.id, "folder", `${s.name} — ${s.size}${s.landscape ? "" : " 縦"}`, 1, i === this.activeSheet ? "selected" : "", () => void this.switchSheet(i), () => this.sheetSettings());
      if (i !== this.activeSheet) return;
      for (const v of s.views) {
        const name = v.kind === "section" ? `断面 ${v.label}` : v.kind === "detail" ? `詳細 ${v.label}` : v.label || (v.kind === "projected" ? "投影ビュー" : "ビュー");
        row(v.id, v.kind === "section" ? "section" : v.kind === "detail" ? "search" : "drawing", `${name} (${scaleText(v.scale)})`, 2, this.selected.has(v.id) ? "selected" : "", () => ((this.selected = new Set([v.id])), this.render()), () => this.editView(v));
      }
      const n = s.annos.filter((a) => a.type === "dim").length;
      if (n) row("__dims", "dimension", `寸法 (${n})`, 2);
      const m = s.annos.length - n;
      if (m) row("__annos", "edit", `注記 (${m})`, 2);
    });
  }

  // -------------------------------------------------------------- ribbon ---

  ribbonTab(): RibbonTab {
    const t = (id: Tool, label: string, icon: string, tip: string, size: "large" | "small" = "large", shortcut?: string) => ({
      id: `dw-${id}`,
      label,
      icon,
      tip,
      size,
      shortcut,
      action: () => this.setTool(id),
      active: () => this.tool === id,
    });
    return {
      id: "drawing",
      label: "図面",
      visible: () => this.app.env === "drawing",
      panels: [
        {
          title: "ビューを作成",
          items: [
            {
              id: "dw-base",
              label: "基準",
              icon: "drawing",
              tip: "モデルの基準ビュー (正面・平面・右側面・等角 など) を配置します。",
              action: () => {
                const b = document.querySelector('[data-cmd="dw-base"]')!.getBoundingClientRect();
                contextMenu(
                  b.left,
                  b.bottom + 2,
                  (Object.keys(ORIENTS) as StdOrient[]).map((o) => ({
                    label: ORIENTS[o].label,
                    checked: o === this.baseOrient,
                    action: () => {
                      this.baseOrient = o;
                      this.setTool("base");
                    },
                  })),
                );
              },
              active: () => this.tool === "base",
            },
            t("projected", "投影", "lookAt", "親ビューから投影ビュー (第三角法) / 等角図を作成します。"),
            t("section", "断面", "section", "切断線を引いて断面図 (A-A) を作成します。切断面にはハッチングが入ります。"),
            t("detail", "詳細", "search", "円で囲んだ部分を拡大した詳細図を作成します。"),
          ],
        },
        {
          title: "寸法",
          items: [
            t("dim", "寸法", "dimension", "長さ・距離・直径・半径・角度を記入します。ダブルクリックで公差・はめあいを設定。", "large", "D"),
            { stack: [t("hole", "穴注記", "hole", "穴の数と径 (4×φ6.6 など) を記入します。", "small"), t("centerline", "中心線", "workaxis", "2 線分の中間 / 2 円の中心を結ぶ中心線を引きます。", "small")] },
          ],
        },
        {
          title: "注記",
          items: [
            { stack: [t("note", "テキスト", "edit", "テキスト注記を配置します。", "small"), t("leader", "引出線注記", "edit", "引出線付きの注記を配置します。", "small"), t("surface", "表面性状", "pushpull", "表面性状記号 (Ra) を記入します。", "small")] },
            { stack: [t("gdt", "幾何公差", "iprops", "幾何公差の枠 (平面度・位置度 など) を記入します。", "small"), t("datum", "データム", "fix", "データム記号を記入します。", "small"), t("balloon", "風船", "circPattern", "部品の品番を示す風船を記入します (アセンブリ)。", "small")] },
            { id: "dw-parts", label: "部品表", icon: "rectPattern", tip: "部品表 (品番・品名・数量・材質) の表示を切り替えます。", action: () => this.togglePartsList() },
          ],
        },
        {
          title: "シート",
          items: [
            { id: "dw-sheet", label: "シート設定", icon: "settings", tip: "用紙サイズ・向き・表題欄を設定します。", action: () => this.sheetSettings() },
            { stack: [{ id: "dw-addsheet", label: "シートを追加", icon: "plus", size: "small", action: () => void this.addSheet() }, { id: "dw-fit", label: "全体表示", icon: "zoomFit", size: "small", action: () => this.fit() }, { id: "dw-auto", label: "自動配置", icon: "rectPattern", size: "small", tip: "基準・投影ビューを用紙に合わせて再配置します。", action: () => (this.autoLayout(), void this.refresh()) }] },
          ],
        },
        {
          title: "書き出し",
          items: [
            { id: "dw-pdf", label: "PDF", icon: "export", tip: "全シートをベクター PDF に出力します。", action: () => void this.exportPdf() },
            { stack: [{ id: "dw-dxf", label: "DXF", icon: "export", size: "small", action: () => this.exportDxf() }, { id: "dw-svg", label: "SVG", icon: "export", size: "small", action: () => this.exportSvg() }] },
          ],
        },
        {
          title: "終了",
          items: [{ id: "dw-close", label: "モデルに戻る", icon: "part", tip: "図面を閉じてモデリングに戻ります (図面はモデルと一緒に保存されます)。", action: () => this.app.leaveDrawingEnv() }],
        },
      ],
    };
  }

  /** Keyboard in the drawing environment. Returns true if handled. */
  key(e: KeyboardEvent): boolean {
    const k = e.key.toLowerCase();
    if (e.key === "Escape") {
      if (this.tool !== "select") this.setTool("select");
      else if (this.selected.size) (this.selected.clear(), this.render());
      return true;
    }
    if (e.key === "Delete" || e.key === "Backspace") return void this.deleteSelection(), true;
    if (e.ctrlKey || e.metaKey || e.altKey) return false;
    if (k === "d") return this.setTool("dim"), true;
    if (e.key === "Home") return this.fit(), true;
    return false;
  }
}

// --------------------------------------------------------------- helpers ---

function esc(s: string) {
  return s.replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" })[c]!);
}

function segD(p: Vec2, a: Vec2, b: Vec2) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const l2 = dx * dx + dy * dy || 1;
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2));
  return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
}

function nearestOn(r: GRef, p: Vec2): Vec2 {
  if (r.kind === "point") return r.p;
  if (r.kind === "circle") {
    const d = Math.hypot(p[0] - r.p[0], p[1] - r.p[1]) || 1;
    return [r.p[0] + ((p[0] - r.p[0]) / d) * (r.r ?? 0), r.p[1] + ((p[1] - r.p[1]) / d) * (r.r ?? 0)];
  }
  const a = r.p, b = r.p2!;
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy || 1)));
  return [a[0] + t * dx, a[1] + t * dy];
}

function parallel(a: GRef, b: GRef): boolean {
  const u = [a.p2![0] - a.p[0], a.p2![1] - a.p[1]], w = [b.p2![0] - b.p[0], b.p2![1] - b.p[1]];
  return Math.abs(u[0] * w[1] - u[1] * w[0]) / ((Math.hypot(u[0], u[1]) * Math.hypot(w[0], w[1])) || 1) < 0.01;
}

function isFullCircle(g: ViewGeometry, r: GRef): boolean {
  return g.visible.some((s) => s.t === "circle" && Math.hypot(s.c[0] - r.p[0], s.c[1] - r.p[1]) < 1e-6 && Math.abs(s.r - (r.r ?? 0)) < 1e-6);
}

/** Horizontal / vertical / aligned from where the label is placed (like Inventor). */
function autoLinear(refs: GRef[], pos: Vec2): DimKind {
  const d: DimAnno = { id: "", type: "dim", view: "", kind: "linear", refs, pos };
  const pts = linearPoints(d);
  if (!pts) return "linear";
  const [a, b] = pts;
  const inX = pos[0] > Math.min(a[0], b[0]) && pos[0] < Math.max(a[0], b[0]);
  const inY = pos[1] > Math.min(a[1], b[1]) && pos[1] < Math.max(a[1], b[1]);
  if (Math.abs(a[1] - b[1]) < 1e-6) return "horizontal";
  if (Math.abs(a[0] - b[0]) < 1e-6) return "vertical";
  if (inX && !inY) return "horizontal";
  if (inY && !inX) return "vertical";
  return "linear";
}

function dimMeasured(a: DimAnno): number {
  // lazy import cycle avoidance
  return dimValue(a);
}

function moveAnno(sh: Sheet, id: string, o: Anno, dx: number, dy: number) {
  const a = sh.annos.find((x) => x.id === id);
  if (!a) return;
  const v = "view" in a ? sh.views.find((x) => x.id === a.view) : undefined;
  const dv: Vec2 = v ? [dx / v.scale, -dy / v.scale] : [0, 0];
  switch (a.type) {
    case "dim":
    case "datum":
    case "balloon":
      a.pos = [(o as DimAnno).pos[0] + dv[0], (o as DimAnno).pos[1] + dv[1]];
      break;
    case "note":
    case "gdt":
      a.x = (o as { x: number }).x + dx;
      a.y = (o as { y: number }).y + dy;
      break;
    case "surface":
      a.p = [(o as typeof a).p[0] + dv[0], (o as typeof a).p[1] + dv[1]];
      break;
    case "centerline":
      break;
  }
}

function gdtDialog(init?: { symbol: string; value: string; datums: string }): Promise<{ symbol: string; value: string; datums: string } | null> {
  return new Promise((resolve) => {
    let result: { symbol: string; value: string; datums: string } | null = null;
    const sym = h("select", { class: "field-input" });
    for (const [s, l] of GDT_SYMBOLS) sym.appendChild(h("option", { value: s, selected: s === (init?.symbol ?? "⌖") }, `${s}  ${l}`));
    const val = h("input", { class: "field-input", value: init?.value ?? "φ0.05" });
    const dat = h("input", { class: "field-input", value: init?.datums ?? "A", placeholder: "A B C" });
    modal({
      title: "幾何公差",
      icon: "iprops",
      width: 420,
      body: h(
        "div",
        { class: "settings" },
        h("label", { class: "field" }, h("span", { class: "field-label" }, "特性"), h("span", { class: "field-ctl" }, sym)),
        h("label", { class: "field" }, h("span", { class: "field-label" }, "公差値"), h("span", { class: "field-ctl" }, val)),
        h("label", { class: "field" }, h("span", { class: "field-label" }, "データム"), h("span", { class: "field-ctl" }, dat)),
      ),
      buttons: [{ label: "OK", primary: true, onClick: () => void (result = { symbol: sym.value, value: val.value, datums: dat.value }) }, { label: "キャンセル" }],
      onClose: () => resolve(result),
    });
  });
}
