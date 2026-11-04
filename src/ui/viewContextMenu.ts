// 閲覧時の右クリック操作 (段階 2): display operations on part bodies and assembly
// components, shared by the 3D right-click menu, the model tree, the keyboard
// (H / Shift+H / I / Alt+click), box selection and the hidden-items panel.
//
// The items are part bodies ("b<i>") in the part environment — grouped by the
// STEP product structure when the bodies came from an assembly STEP — and
// components in the assembly environment. Every hide / isolate / transparency /
// colour change goes through one view undo stack (core/viewUndo.ts), so Ctrl+Z
// undoes it in both modes and the viewer mode never marks the file modified.
import * as THREE from "three";
import type { App } from "../app";
import { GHOST_OPACITY } from "../assembly/viewing";
import { formatNumber } from "../core/expr";
import * as VS from "../core/viewState";
import { buildTree, filterTree, nodeItems, type TreeNode } from "../core/viewTree";
import { ViewUndo } from "../core/viewUndo";
import { SECTION_AXES } from "../viewer/section";
import type { Vec3 } from "../core/types";
import { floatPanel } from "./bomPanel";
import { closeMenus, contextMenu, h, iconEl, toast, type MenuItem } from "./dom";

// ------------------------------------------------------------ menu spec ---

export type ViewAction = "hide" | "show" | "isolate" | "ghostOthers" | "ghostThis" | "opaque" | "color" | "zoom" | "props" | "measure" | "section" | "sameParts" | "clearSel" | "showAll" | "hiddenList";

/** What the menu is opened on. */
export interface MenuContext {
  viewer: boolean;
  kind: "part" | "assembly";
  /** Number of items the menu acts on (the selection or the item under the cursor). */
  count: number;
  allHidden: boolean;
  allTransparent: boolean;
  /** Something is hidden / see-through anywhere (「すべて表示」). */
  anyHidden: boolean;
  anyTransparent: boolean;
  /** A model point under the cursor (「断面をここで切る」). */
  hasPoint: boolean;
}

export interface MenuSpec {
  action: ViewAction;
  label: string;
  icon: string;
  shortcut?: string;
  disabled?: boolean;
}

/** The view menu's items for a context (pure: the menu availability tests use it). */
export function viewMenuSpec(c: MenuContext): MenuSpec[] {
  const none = c.count === 0;
  // H stays 「穴」 in the part environment of the editing mode
  const hKey = c.viewer || c.kind === "assembly" ? "H" : undefined;
  const out: MenuSpec[] = [
    !none && c.allHidden ? { action: "show", label: "表示", icon: "eye" } : { action: "hide", label: "非表示", icon: "eyeOff", shortcut: hKey, disabled: none },
    { action: "isolate", label: "この部品だけ表示 (分離)", icon: "eye", shortcut: "I", disabled: none },
    { action: "ghostOthers", label: "他を半透明に", icon: "shaded", disabled: none },
    !none && c.allTransparent ? { action: "opaque", label: "半透明を解除", icon: "shaded" } : { action: "ghostThis", label: "この部品を半透明に", icon: "shaded", disabled: none },
    { action: "color", label: "色を変える…", icon: "material", disabled: none },
    { action: "zoom", label: "ここにズーム", icon: "zoomFit", disabled: none },
    { action: "props", label: "プロパティ", icon: "iprops", disabled: c.count !== 1 },
    { action: "measure", label: "測定を開始", icon: "measure", shortcut: "M" },
    { action: "section", label: "断面をここで切る", icon: "section", disabled: !c.hasPoint },
  ];
  if (c.kind === "assembly") out.push({ action: "sameParts", label: "同じ部品をすべて選択", icon: "select", disabled: none });
  out.push({ action: "clearSel", label: "選択を解除", icon: "close", shortcut: "Esc", disabled: none });
  if (c.anyHidden || c.anyTransparent) out.push({ action: "showAll", label: "すべて表示", icon: "eye", shortcut: "Shift+H" });
  if (c.anyHidden) out.push({ action: "hiddenList", label: "非表示の一覧…", icon: "eyeOff" });
  return out;
}

/** Axis whose direction is closest to `n` ("X" / "Y" / "Z") and whether it points the negative way. */
export function nearestAxis(n: Vec3): { axis: "X" | "Y" | "Z"; negative: boolean; exact: boolean } {
  const a = n.map(Math.abs);
  const i = a[0] >= a[1] && a[0] >= a[2] ? 0 : a[1] >= a[2] ? 1 : 2;
  const len = Math.hypot(...n) || 1;
  return { axis: SECTION_AXES[i] as "X" | "Y" | "Z", negative: n[i] < 0, exact: a[i] / len > 0.9999 };
}

// --------------------------------------------------------------- targets ---

export interface ViewItem {
  id: string;
  name: string;
  /** Viewport body indices. */
  bodies: number[];
  /** Product-structure path (tree grouping). */
  path?: string[];
}

interface Target {
  kind: "part" | "assembly";
  items(): ViewItem[];
  state(): VS.ViewSt;
  apply(s: VS.ViewSt): void;
  selection(): string[];
  select(ids: string[]): void;
  itemOfBody(bi: number): string | undefined;
  docDepth(): number;
}

type UndoState = { kind: "part" | "assembly"; s: VS.ViewSt };

export class ViewController {
  /** Part bodies' display state ("b<i>" ids). */
  partState: VS.ViewSt = VS.emptyView();
  /** Bodies selected as a whole (tree / box selection) in the part environment. */
  partSel = new Set<number>();
  readonly undo: ViewUndo<UndoState>;
  readonly listeners = new Set<() => void>();
  /** Bodies hidden for the moment by Alt+click. */
  altHidden: number[] = [];
  /** Tree groups collapsed by the user. */
  private collapsed = new Set<string>();
  private partColored = false;
  private lastKind: "part" | "assembly" | null = null;
  /** Point / face normal under the cursor when the menu opened. */
  private menuPoint: { point: Vec3; normal?: Vec3 } | null = null;
  private menuIds: string[] = [];
  private menuXY = { x: 0, y: 0 };
  private readonly part: Target;
  private readonly asm: Target;

  constructor(readonly app: App) {
    this.undo = new ViewUndo<UndoState>((e) => {
      const t = this.target();
      if (t && t.kind === e.kind) t.apply(e.s);
      this.changed();
    });
    this.part = this.partTarget();
    this.asm = this.asmTarget();
    app.store.on((r) => {
      if (r !== "load") return;
      this.partState = VS.emptyView();
      this.partSel.clear();
      this.altHidden = [];
      if (this.lastKind === "part") this.undo.clear();
    });
    app.asm.store.on((r) => {
      if (r === "load" && this.lastKind === "assembly") this.undo.clear();
    });
    app.asm.viewing.viewOp = (label, next) => app.env === "assembly" && this.op(label, next);
  }

  /** Items of the current environment (null while sketching / in a drawing). */
  target(): Target | null {
    const app = this.app;
    const t = app.env === "assembly" ? this.asm : app.env === "part" && app.mode === "model" ? this.part : null;
    if (t && t.kind !== this.lastKind) {
      if (this.lastKind) this.undo.clear();
      this.lastKind = t.kind;
    }
    return t;
  }

  private changed() {
    for (const l of this.listeners) l();
    this.app.browser?.render();
    this.app.ribbon?.refresh();
  }

  // ----------------------------------------------------------- part bodies ---

  private shownBodies() {
    const a = this.app;
    return a.surfaces.length ? [...a.bodies, ...a.surfaces] : a.bodies;
  }

  private partTarget(): Target {
    return {
      kind: "part",
      items: () => this.shownBodies().map((b, i) => ({ id: `b${i}`, name: b.name || `ソリッド${i + 1}`, bodies: [i], path: b.path })),
      state: () => VS.cloneView(this.partState),
      apply: (s) => {
        this.partState = VS.cloneView(s);
        this.applyPart();
      },
      selection: () => {
        const set = new Set(this.partSel);
        for (const p of this.app.vp.selection) if (p.body >= 0) set.add(p.body);
        return [...set].sort((a, b) => a - b).map((i) => `b${i}`);
      },
      select: (ids) => {
        this.partSel = new Set(ids.map((id) => Number(id.slice(1))));
        this.app.vp.setSelection([]);
        this.app.vp.setBodyHighlight(new Set(this.partSel));
        this.app.browserSelection.clear();
        if (ids.length) this.app.status(`${ids.length} 個のボディを選択`);
        this.changed();
      },
      itemOfBody: (bi) => (bi >= 0 && bi < this.shownBodies().length ? `b${bi}` : undefined),
      docDepth: () => this.app.store.depth,
    };
  }

  /** Re-applies the part bodies' display state (after every rebuild / remesh). */
  applyPart() {
    const vp = this.app.vp;
    const shown = this.shownBodies();
    const s = this.partState;
    const hidden = new Set(s.hidden), ghost = new Set(s.transparent), alt = new Set(this.altHidden);
    for (let i = 0; i < vp.bodies.length; i++) {
      const on = !hidden.has(`b${i}`) && !alt.has(i);
      if (vp.isBodyOn(i) !== on) vp.setBodyVisible(i, on);
    }
    vp.setBodyOpacities(vp.bodies.map((_, i) => (ghost.has(`b${i}`) ? GHOST_OPACITY : undefined)));
    const colored = Object.keys(s.colors).length > 0;
    if (colored || this.partColored) {
      const base = shown.map((b) => b.color);
      vp.setBodyColors(shown.map((b, i) => s.colors[`b${i}`] ?? base[i]));
      this.partColored = colored;
    }
    if (this.partSel.size) vp.setBodyHighlight(new Set([...this.partSel].filter((i) => i < vp.bodies.length)));
  }

  /** Called after the part's bodies were replaced (regen / remesh). */
  afterPartBodies() {
    const n = this.shownBodies().length;
    this.partSel = new Set([...this.partSel].filter((i) => i < n));
    this.altHidden = [];
    this.partColored = true;
    this.applyPart();
  }

  /** The model tool changed the face / edge selection: whole-body selection follows it. */
  syncFromPicks() {
    if (this.partSel.size) {
      this.partSel.clear();
      this.app.vp.setBodyHighlight(new Set());
    }
    for (const l of this.listeners) l();
  }

  // ------------------------------------------------------------- assembly ---

  private asmTarget(): Target {
    const env = this.app.asm;
    return {
      kind: "assembly",
      items: () => {
        const by = new Map<string, number[]>();
        env.bodyMap.forEach((m, i) => (by.get(m.comp) ?? by.set(m.comp, []).get(m.comp)!).push(i));
        return env.doc.components.map((c) => ({ id: c.id, name: c.name, bodies: by.get(c.id) ?? [], path: c.path }));
      },
      state: () => ({
        hidden: env.doc.components.filter((c) => c.visible === false).map((c) => c.id),
        transparent: [...env.viewing.transparent],
        colors: Object.fromEntries(env.viewing.overrides),
      }),
      apply: (s) => {
        const hid = new Set(s.hidden);
        // display state only: no document history entry (the view undo stack records it)
        for (const c of env.doc.components) {
          const v = !hid.has(c.id);
          if ((c.visible !== false) !== v) c.visible = v;
        }
        if (!this.app.viewer.active) env.store.dirty = true;
        env.viewing.transparent = new Set(s.transparent);
        env.viewing.overrides = new Map(Object.entries(s.colors));
        env.render();
        env.viewing.notify();
      },
      selection: () => [...env.selected],
      select: (ids) => env.select(ids),
      itemOfBody: (bi) => env.bodyMap[bi]?.comp,
      docDepth: () => env.store.depth,
    };
  }

  // ------------------------------------------------------------ operations ---

  /** Applies a display change as one view undo step. Returns false outside the 3D model / assembly. */
  op(label: string, next: (s: VS.ViewSt, all: string[]) => VS.ViewSt): boolean {
    const t = this.target();
    if (!t) return false;
    const before = t.state();
    const after = next(before, t.items().map((i) => i.id));
    if (VS.sameView(before, after)) return true;
    this.restoreAlt(false);
    t.apply(after);
    this.undo.push(label, { kind: t.kind, s: before }, { kind: t.kind, s: after }, t.docDepth());
    this.changed();
    return true;
  }

  /** Ctrl+Z: undoes a view step when it is newer than the last document edit (viewer mode: view steps only). */
  undoStep(): boolean {
    const t = this.target();
    if (!t) return false;
    const viewer = this.app.viewer.active;
    if (this.undo.wantsUndo(t.docDepth(), viewer)) {
      const l = this.undo.undo();
      if (l) this.app.status(`元に戻す: ${l}`);
      return true;
    }
    return viewer;
  }

  redoStep(): boolean {
    const t = this.target();
    if (!t) return false;
    const viewer = this.app.viewer.active;
    if (this.undo.wantsRedo(t.docDepth(), viewer)) {
      const l = this.undo.redo();
      if (l) this.app.status(`やり直し: ${l}`);
      return true;
    }
    return viewer;
  }

  selection(): string[] {
    return this.target()?.selection() ?? [];
  }

  items(): ViewItem[] {
    return this.target()?.items() ?? [];
  }

  state(): VS.ViewSt {
    return this.target()?.state() ?? VS.emptyView();
  }

  hide(ids = this.selection()) {
    if (!ids.length) return void toast("非表示にする部品を選択してください", "warn");
    this.op("非表示", (s) => VS.hideItems(s, ids));
    const t = this.target();
    if (t) t.select(t.selection().filter((x) => !ids.includes(x)));
  }

  show(ids: string[]) {
    this.op("表示", (s) => VS.showItems(s, ids));
  }

  toggle(ids: string[]) {
    this.op("表示切替", (s) => VS.toggleItems(s, ids));
  }

  isolate(ids = this.selection()) {
    if (!ids.length) return void toast("分離する部品を選択してください", "warn");
    this.op("分離", (s, all) => VS.isolateItems(s, all, ids));
  }

  showAll() {
    this.restoreAlt(false);
    this.op("すべて表示", (s) => VS.showAllItems(s));
  }

  ghostOthers(ids = this.selection()) {
    this.op("他を半透明に", (s, all) => VS.transparentOthers(s, all, ids));
  }

  setTransparent(ids: string[], on: boolean) {
    this.op(on ? "半透明" : "不透明", (s) => VS.setTransparentItems(s, ids, on));
  }

  setColor(ids: string[], color: string | null) {
    this.op(color ? "色を変える" : "色を戻す", (s) => VS.colorItems(s, ids, color));
  }

  /** Every component of the same part as the given ones (assembly). */
  sameParts(ids: string[]): string[] {
    const env = this.app.asm;
    const parts = new Set(env.doc.components.filter((c) => ids.includes(c.id)).map((c) => c.partId));
    return env.doc.components.filter((c) => parts.has(c.partId)).map((c) => c.id);
  }

  /** World box of the items' bodies. */
  boxOf(ids: string[]): THREE.Box3 {
    const vp = this.app.vp;
    const box = new THREE.Box3();
    const set = new Set(ids);
    for (const it of this.items()) if (set.has(it.id)) for (const b of it.bodies) if (vp.bodies[b]) box.expandByObject(vp.bodies[b].mesh);
    return box;
  }

  zoomTo(ids: string[]) {
    const box = this.boxOf(ids);
    if (box.isEmpty()) return;
    const vp = this.app.vp;
    const size = box.getSize(new THREE.Vector3()).length();
    vp.animateTo({ target: box.getCenter(new THREE.Vector3()), quat: vp.view.quat.clone(), height: Math.max(size * 1.25, 1) });
  }

  /** Section plane through `point`: the face normal's axis when it is axis-aligned, else the nearest axis. */
  sectionAt(point: Vec3, normal?: Vec3) {
    const app = this.app;
    const n = normal ?? (new THREE.Vector3(0, 0, 1).applyQuaternion(app.vp.view.quat).toArray() as Vec3);
    const ax = nearestAxis(n);
    if (!app.sectionView) app.toggleSectionView();
    const i = { X: 0, Y: 1, Z: 2 }[ax.axis];
    app.sectionView?.cutAt(ax.axis, point[i], !ax.negative);
    app.status(`断面: ${ax.axis} = ${formatNumber(point[i], 2)} mm${ax.exact ? "" : " (面に最も近い軸)"}`);
  }

  // --------------------------------------------------------------- Alt+click ---

  /** Alt+click: hides the front-most item for the moment and selects the one behind. */
  altPick(e: { clientX: number; clientY: number; ctrlKey?: boolean; shiftKey?: boolean }): boolean {
    const t = this.target();
    if (!t) return false;
    const vp = this.app.vp;
    const kinds = new Set(["face"] as const);
    const p = vp.pick(e, kinds);
    const front = p && p.body >= 0 ? t.itemOfBody(p.body) : undefined;
    if (!front) return false;
    const bodies = t.items().find((i) => i.id === front)?.bodies ?? [p!.body];
    for (const b of bodies) vp.setBodyVisible(b, false);
    this.altHidden.push(...bodies);
    const q = vp.pick(e, kinds);
    const behind = q && q.body >= 0 ? t.itemOfBody(q.body) : undefined;
    if (behind) t.select(e.ctrlKey || e.shiftKey ? [...new Set([...t.selection(), behind])] : [behind]);
    else toast("奥に部品がありません", "info", 1500);
    this.app.status("Alt+クリック: 手前の部品を一時的に隠しています (Esc または普通のクリックで戻ります)");
    for (const l of this.listeners) l();
    return true;
  }

  /** Shows the bodies Alt+click hid. */
  restoreAlt(notify = true) {
    if (!this.altHidden.length) return;
    const bodies = this.altHidden;
    this.altHidden = [];
    const t = this.target();
    if (t?.kind === "part") this.applyPart();
    else for (const b of bodies) if (b < this.app.vp.bodies.length) this.app.vp.setBodyVisible(b, true);
    if (notify) {
      this.app.status("準備完了");
      for (const l of this.listeners) l();
    }
  }

  // --------------------------------------------------------------- keyboard ---

  /** H / Shift+H / I (and Esc for Alt+click). Returns true when the key was used. */
  key(e: KeyboardEvent): boolean {
    if (e.key === "Escape") {
      if (this.altHidden.length) this.restoreAlt();
      if (this.partSel.size && !this.app.command) this.part.select([]);
      return false;
    }
    if (e.ctrlKey || e.metaKey || e.altKey) return false;
    const t = this.target();
    if (!t || this.app.command || this.app.asm.command) return false;
    const k = e.key.toLowerCase();
    if (k === "h" && e.shiftKey) return this.showAll(), true;
    // plain H is 「穴」 in the part environment of the editing mode
    if (k === "h" && (this.app.viewer.active || t.kind === "assembly")) return this.hide(), true;
    if (k === "i" && !e.shiftKey) return this.isolate(), true;
    return false;
  }

  // ------------------------------------------------------------- box select ---

  /** Rubber-band selection started on the empty background: items inside the box get selected. */
  beginBox(e: PointerEvent) {
    const t = this.target();
    if (!t || e.button !== 0) return;
    const vp = this.app.vp;
    const host = vp.el;
    const r0 = host.getBoundingClientRect();
    const x0 = e.clientX, y0 = e.clientY;
    let band: HTMLElement | null = null;
    const move = (ev: PointerEvent) => {
      if (!band && Math.hypot(ev.clientX - x0, ev.clientY - y0) < 5) return;
      if (!band) host.appendChild((band = h("div", { class: "vw-band" })));
      const l = Math.min(x0, ev.clientX), tp = Math.min(y0, ev.clientY);
      band.style.cssText = `left:${l - r0.left}px;top:${tp - r0.top}px;width:${Math.abs(ev.clientX - x0)}px;height:${Math.abs(ev.clientY - y0)}px`;
    };
    const up = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", move, true);
      window.removeEventListener("pointerup", up, true);
      if (!band) return;
      band.remove();
      const ids = this.itemsInRect(Math.min(x0, ev.clientX), Math.min(y0, ev.clientY), Math.max(x0, ev.clientX), Math.max(y0, ev.clientY));
      const add = e.ctrlKey || e.shiftKey;
      t.select(add ? [...new Set([...t.selection(), ...ids])] : ids);
      this.app.status(ids.length ? `範囲選択: ${ids.length} 個` : "範囲内に部品がありません");
    };
    window.addEventListener("pointermove", move, true);
    window.addEventListener("pointerup", up, true);
  }

  /** Visible items whose screen bounds lie completely inside the rectangle (page coordinates). */
  itemsInRect(x0: number, y0: number, x1: number, y1: number): string[] {
    const vp = this.app.vp;
    const hidden = new Set(this.state().hidden);
    const out: string[] = [];
    for (const it of this.items()) {
      if (hidden.has(it.id) || !it.bodies.length) continue;
      const box = new THREE.Box3();
      for (const b of it.bodies) if (vp.bodies[b] && vp.isBodyOn(b)) box.expandByObject(vp.bodies[b].mesh);
      if (box.isEmpty()) continue;
      let inside = true;
      for (let k = 0; k < 8 && inside; k++) {
        const p = vp.worldToScreen([k & 1 ? box.max.x : box.min.x, k & 2 ? box.max.y : box.min.y, k & 4 ? box.max.z : box.min.z]);
        inside = p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1;
      }
      if (inside) out.push(it.id);
    }
    return out;
  }

  // ------------------------------------------------------------------- menus ---

  /** Prepares the menu for a right-click in 3D: the item under the cursor (or the selection). */
  prepare(e: MouseEvent): string[] {
    const t = this.target();
    this.menuXY = { x: e.clientX, y: e.clientY };
    this.menuPoint = null;
    this.menuIds = [];
    if (!t) return [];
    const vp = this.app.vp;
    const p = vp.pick(e, new Set(["face", "edge"]));
    const id = p && p.body >= 0 ? t.itemOfBody(p.body) : undefined;
    if (p && p.body >= 0) {
      let normal: Vec3 | undefined;
      if (p.kind === "face") {
        const v = vp.pickViews[p.body] ?? vp.bodies[p.body];
        const f = v?.data.faces[p.index];
        if (f) {
          const n = new THREE.Vector3(...f.normal);
          if (v.matrix) n.transformDirection(v.matrix);
          normal = n.toArray() as Vec3;
          if (f.type !== "PLANE") normal = undefined; // curved face: nearest axis of the view
        }
      }
      this.menuPoint = { point: p.point, normal };
    }
    const sel = t.selection();
    this.menuIds = id && !sel.includes(id) ? [id] : sel;
    // the viewer selects what was right-clicked (feedback); the editing mode keeps its face selection
    if (id && !sel.includes(id) && (this.app.viewer.active || t.kind === "assembly")) t.select([id]);
    return this.menuIds;
  }

  /** Prepares the menu for tree rows (no 3D point). */
  prepareIds(ids: string[], x: number, y: number) {
    this.menuIds = ids;
    this.menuPoint = null;
    this.menuXY = { x, y };
  }

  context(): MenuContext {
    const t = this.target();
    const s = this.state();
    const hid = new Set(s.hidden), tr = new Set(s.transparent);
    const ids = this.menuIds;
    return {
      viewer: this.app.viewer.active,
      kind: t?.kind ?? "part",
      count: ids.length,
      allHidden: ids.length > 0 && ids.every((x) => hid.has(x)),
      allTransparent: ids.length > 0 && ids.every((x) => tr.has(x)),
      anyHidden: hid.size > 0,
      anyTransparent: tr.size > 0,
      hasPoint: !!this.menuPoint,
    };
  }

  /** The view menu's items (for the prepared ids). */
  menuItems(): MenuItem[] {
    const ids = [...this.menuIds];
    const pt = this.menuPoint;
    const xy = { ...this.menuXY };
    const run: Record<ViewAction, () => void> = {
      hide: () => this.hide(ids),
      show: () => this.show(ids),
      isolate: () => this.isolate(ids),
      ghostOthers: () => this.ghostOthers(ids),
      ghostThis: () => this.setTransparent(ids, true),
      opaque: () => this.setTransparent(ids, false),
      color: () => this.colorPicker(ids, xy.x, xy.y),
      zoom: () => this.zoomTo(ids),
      props: () => void this.openProps(ids[0]),
      measure: () => this.app.commands.run("measure"),
      section: () => pt && this.sectionAt(pt.point, pt.normal),
      sameParts: () => this.target()?.select(this.sameParts(ids)),
      clearSel: () => this.target()?.select([]),
      showAll: () => this.showAll(),
      hiddenList: () => void import("./hiddenPanel").then((m) => m.openHiddenPanel(this.app)),
    };
    return viewMenuSpec(this.context()).map((s) => ({ label: s.label, icon: s.icon, shortcut: s.shortcut, disabled: s.disabled, action: run[s.action] }));
  }

  /** Editing items followed by a 「表示」 section (editing mode), or only the view items (viewer mode). */
  withView(base: MenuItem[]): MenuItem[] {
    if (this.app.viewer.active || !this.target()) return this.target() ? this.menuItems() : base;
    return [...base, ...(base.length ? [{ separator: true, label: "" }] : []), { label: "表示", disabled: true, icon: "eye" }, ...this.menuItems()];
  }

  /** Right-click in 3D in the viewer mode: the view menu replaces the editing menu. */
  open3D(e: MouseEvent) {
    this.prepare(e);
    contextMenu(e.clientX, e.clientY, this.menuItems());
  }

  /** Right-click on tree rows. */
  openFor(ids: string[], x: number, y: number, base: MenuItem[] = []) {
    this.prepareIds(ids, x, y);
    contextMenu(x, y, this.withView(base));
  }

  /** Palette popup of 「色を変える」. */
  colorPicker(ids: string[], x: number, y: number) {
    closeMenus();
    document.querySelector(".vw-palette")?.remove();
    const pop = h("div", { class: "vw-palette ctx-menu", role: "menu", style: `left:${x}px;top:${y}px` });
    const close = () => (pop.remove(), window.removeEventListener("pointerdown", off, true));
    const off = (e: PointerEvent) => !pop.contains(e.target as Node) && close();
    const grid = h("div", { class: "vw-swatches" });
    for (const c of VS.VIEW_PALETTE) {
      const b = h("button", { class: "vw-swatch", style: `background:${c}`, title: c, "data-color": c, "aria-label": c });
      b.addEventListener("click", () => (close(), this.setColor(ids, c)));
      grid.appendChild(b);
    }
    const custom = h("input", { type: "color", class: "vw-custom", title: "その他の色", "aria-label": "その他の色" }) as HTMLInputElement;
    custom.addEventListener("change", () => (close(), this.setColor(ids, custom.value)));
    const reset = h("button", { class: "ctx-item vw-reset" }, h("span", { class: "ico" }), h("span", { class: "ctx-label" }, "元の色に戻す"));
    reset.addEventListener("click", () => (close(), this.setColor(ids, null)));
    pop.append(h("div", { class: "vw-pal-title" }, "色を変える"), grid, h("label", { class: "vw-custom-row" }, custom, " その他の色…"), reset);
    document.body.appendChild(pop);
    setTimeout(() => window.addEventListener("pointerdown", off, true), 0);
  }

  /** Name, material, mass and outer dimensions of an item. */
  async openProps(id: string) {
    const app = this.app;
    const t = this.target();
    const it = this.items().find((i) => i.id === id);
    if (!t || !it) return;
    const box = this.boxOf([id]);
    const size = box.isEmpty() ? null : box.getSize(new THREE.Vector3());
    const rows: [string, string][] = [["名前", it.name]];
    let material = "—", mass = "計算中…";
    const body = h("div", { class: "vw-props" });
    const render = () => {
      body.innerHTML = "";
      const tbl = h("table", { class: "ptable" });
      for (const [k, v] of [...rows, ["材質", material], ["質量", mass], ["外形寸法 (X × Y × Z)", size ? `${formatNumber(size.x, 2)} × ${formatNumber(size.y, 2)} × ${formatNumber(size.z, 2)} mm` : "—"]] as [string, string][])
        tbl.appendChild(h("tr", {}, h("th", {}, k), h("td", { "data-prop": k }, v)));
      body.appendChild(tbl);
    };
    if (t.kind === "assembly") {
      const c = app.asm.doc.components.find((x) => x.id === id)!;
      const p = app.asm.doc.parts.find((x) => x.id === c.partId);
      rows.push(["部品", p?.name ?? "—"]);
      material = p?.doc?.material?.name ?? (p?.kind === "step" ? "(STEP: 指定なし)" : "—");
      render();
      floatPanel(app, "vw-props-panel", `プロパティ — ${it.name}`, "iprops", body, { width: 340 });
      try {
        await app.asm.ensureBrep([c.partId], true);
        const mp = await app.kernel.massPropsKey(`asm:${c.partId}`);
        const dens = p?.doc?.material?.density;
        mass = dens ? `${formatNumber((mp.volume / 1000) * dens, 2)} g (体積 ${formatNumber(mp.volume, 1)} mm³)` : `— (体積 ${formatNumber(mp.volume, 1)} mm³)`;
      } catch {
        mass = "—";
      }
    } else {
      const mat = app.store.doc.material;
      material = mat?.name ?? "—";
      render();
      floatPanel(app, "vw-props-panel", `プロパティ — ${it.name}`, "iprops", body, { width: 340 });
      try {
        const mp = await app.kernel.massProps();
        const g = (mp.volume / 1000) * (mat?.density ?? 0);
        mass = mp.bodies > 1 ? `パーツ全体 ${formatNumber(g, 2)} g (${mp.bodies} ボディ)` : `${formatNumber(g, 2)} g (体積 ${formatNumber(mp.volume, 1)} mm³)`;
      } catch {
        mass = "—";
      }
    }
    render();
  }

  // -------------------------------------------------------------------- tree ---

  /** Folder row of a tree group with a bulk eye toggle. Returns whether it is expanded. */
  groupRow(list: HTMLElement, key: string, label: string, ids: string[], depth: number, hidden: Set<string>): boolean {
    const open = !this.collapsed.has(key);
    const allHidden = ids.length > 0 && ids.every((x) => hidden.has(x));
    const t = this.target();
    const sel = new Set(t?.selection() ?? []);
    const exp = h("button", { class: "br-exp" + (open ? " open" : "") }, iconEl("chevronRight"));
    exp.addEventListener("click", (e) => {
      e.stopPropagation();
      if (open) this.collapsed.add(key);
      else this.collapsed.delete(key);
      this.app.browser.render();
    });
    const eye = this.eyeBtn(!allHidden, () => this.op(allHidden ? "表示" : "非表示", (s) => (allHidden ? VS.showItems(s, ids) : VS.hideItems(s, ids))));
    const el = h(
      "div",
      { class: `br-row vw-group${allHidden ? " dimmed" : ""}${ids.length && ids.every((x) => sel.has(x)) ? " selected" : ""}`, style: `--depth:${depth}`, "data-group": key, title: `${label} (${ids.length})` },
      exp,
      iconEl("assembly"),
      h("span", { class: "br-label" }, `${label}`),
      h("span", { class: "br-trail" }, eye),
    );
    el.addEventListener("click", (e) => this.rowClick(ids, e));
    el.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      this.target()?.select(ids);
      this.openFor(ids, e.clientX, e.clientY);
    });
    list.appendChild(el);
    return open;
  }

  eyeBtn(vis: boolean, fn: () => void): HTMLElement {
    return h("button", { class: "br-vis icon-btn small vw-eye", title: vis ? "非表示にする" : "表示する", "aria-label": vis ? "非表示にする" : "表示する", onClick: (e: MouseEvent) => (e.stopPropagation(), fn()) }, iconEl(vis ? "eye" : "eyeOff"));
  }

  /** Click on a tree row: select (Ctrl / Shift toggles). */
  rowClick(ids: string[], e: MouseEvent) {
    const t = this.target();
    if (!t) return;
    if (e.ctrlKey || e.shiftKey || e.metaKey) {
      const s = new Set(t.selection());
      const all = ids.every((x) => s.has(x));
      ids.forEach((x) => (all ? s.delete(x) : s.add(x)));
      t.select([...s]);
    } else t.select(ids);
  }

  /** Part environment: the bodies, grouped by the STEP product structure, with eye icons and a filter. */
  renderPartBodies(list: HTMLElement, filter: string) {
    const items = this.part.items();
    if (!items.length) return;
    const s = this.partState;
    const hidden = new Set(s.hidden);
    const sel = new Set(this.part.selection());
    const all = items.map((i) => i.id);
    const solids = this.app.bodies.length;
    const headOpen = this.groupRow(list, "__solids", `ソリッド本体(${solids})${this.app.surfaces.length ? ` / サーフェス(${this.app.surfaces.length})` : ""}`, all, 1, hidden);
    if (!headOpen) return;
    const q = filter.trim().toLowerCase();
    const match = (it: ViewItem) => !q || it.name.toLowerCase().includes(q);
    const { roots, loose } = buildTree(items.map((it) => ({ item: it, path: it.path })));
    const itemRow = (it: ViewItem, depth: number, label = it.name) => {
      const vis = !hidden.has(it.id);
      const i = Number(it.id.slice(1));
      const el = h(
        "div",
        {
          class: `br-row vw-item${vis ? "" : " dimmed"}${sel.has(it.id) ? " selected" : ""}${s.transparent.includes(it.id) ? " ghost" : ""}`,
          style: `--depth:${depth}`,
          "data-id": i < solids ? `__body${i}` : `__surf${i - solids}`,
          "data-item": it.id,
        },
        h("span", { class: "br-exp-sp" }),
        iconEl(i < solids ? "solid" : "surfPatch"),
        h("span", { class: "br-label" }, label),
        h("span", { class: "br-trail" }, s.colors[it.id] ? h("span", { class: "vw-chip", style: `background:${s.colors[it.id]}` }) : "", this.eyeBtn(vis, () => this.toggle([it.id]))),
      );
      el.addEventListener("click", (e) => this.rowClick([it.id], e));
      el.addEventListener("dblclick", () => this.zoomTo([it.id]));
      el.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        if (!sel.has(it.id)) this.part.select([it.id]);
        this.openFor(this.part.selection(), e.clientX, e.clientY);
      });
      list.appendChild(el);
    };
    const node = (n: TreeNode<ViewItem>, depth: number) => {
      // an instance holding a single body is shown as that body (named after the instance)
      if (!n.children.length && n.items.length === 1) return itemRow(n.items[0], depth, n.name === n.items[0].name ? n.name : `${n.name}`);
      if (this.groupRow(list, n.key, n.name, nodeItems(n).map((x) => x.id), depth, hidden)) {
        n.children.forEach((c) => node(c, depth + 1));
        n.items.forEach((it) => itemRow(it, depth + 1));
      }
    };
    filterTree(roots, match, q).forEach((n) => node(n, 2));
    loose.filter(match).forEach((it) => itemRow(it, 2));
  }

  /** Assembly tree: components grouped by sub-assembly (STEP structure). Calls `row` for each component. */
  renderAsmTree<C extends { id: string; path?: string[] }>(list: HTMLElement, comps: C[], row: (c: C, depth: number) => void) {
    const hidden = new Set(this.asm.state().hidden);
    const { roots, loose } = buildTree(comps.map((c) => ({ item: c, path: c.path })));
    const node = (n: TreeNode<C>, depth: number) => {
      if (this.groupRow(list, `asm:${n.key}`, n.name, nodeItems(n).map((c) => c.id), depth, hidden)) {
        n.children.forEach((c) => node(c, depth + 1));
        n.items.forEach((c) => row(c, depth + 1));
      }
    };
    roots.forEach((n) => node(n, 1));
    loose.forEach((c) => row(c, 1));
  }
}
