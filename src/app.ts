import * as THREE from "three";
import { DocumentStore, FEATURE_LABELS, MATERIALS, ORIGIN_PLANES, featureSketchRefs, newDocument, uid } from "./core/document";
import { formatNumber } from "./core/expr";
import { evalWith, evaluateParams } from "./core/params";
import { planeToWorld, resolveDocument, worldToPlane, type Resolved, type SketchState } from "./core/resolve";
import type { EdgeRef, FaceRef, Feature, PartDocument, PlaneDef, SketchFeature, Vec3, WorkPlaneFeature } from "./core/types";
import { KernelClient } from "./kernel/client";
import type { BodyMesh, RebuildResult } from "./kernel/protocol";
import type { Command } from "./commands/command";
import { buildCommands, type CommandRegistry } from "./commands/features";
import { ModelBrowser } from "./ui/browser";
import { closeMenus, confirmDialog, contextMenu, download, h, iconEl, markingMenu, pickFile, toast, type MenuItem } from "./ui/dom";
import { icon } from "./ui/icons";
import { Ribbon } from "./ui/ribbon";
import { buildRibbonTabs } from "./ui/ribbonTabs";
import { SketchEditor, type SketchTool } from "./viewer/sketchEditor";
import { SketchRenderer } from "./viewer/sketchRender";
import { ViewCube } from "./viewer/viewcube";
import { samePick, Viewport, type Pick, type ToolHandler, type VisualStyle } from "./viewer/viewport";
import { openDrawing, openIProperties, openParameters, openShortcuts } from "./ui/dialogs";
import { sampleDocument } from "./samples";

const AUTOSAVE_KEY = "3dcad.autosave.v1";

export interface SketchOverlay {
  sketchId: string;
  selected: Set<number>;
  hover: number | null;
}

export class App {
  readonly store = new DocumentStore();
  readonly kernel = new KernelClient();
  vp!: Viewport;
  cube!: ViewCube;
  ribbon!: Ribbon;
  browser!: ModelBrowser;
  panelHost!: HTMLElement;
  commands!: CommandRegistry;

  mode: "model" | "sketch" = "model";
  sketchEditor: SketchEditor | null = null;
  command: Command | null = null;
  lastCommand: string | null = null;

  resolved: Resolved | null = null;
  bodies: BodyMesh[] = [];
  /** Bodies used for picking: the state before the edited feature while a command needs it. */
  pickBodies: BodyMesh[] = [];
  featureErrors: Record<string, string> = {};
  browserSelection = new Set<string>();
  originVis = new Set<string>();
  private kernelReady = false;
  private regenTimer = 0;
  private regenSeq = 0;
  private sketchRenderers: SketchRenderer[] = [];
  private statusEl!: HTMLElement;
  private statusSel!: HTMLElement;
  private statusCoord!: HTMLElement;
  private statusRegen!: HTMLElement;
  private statusDof!: HTMLElement;
  private titleEl!: HTMLElement;
  private busyEl!: HTMLElement;
  private sectionPanel: HTMLElement | null = null;
  sliceGraphics = false;
  showPlanePicker = false;

  // ------------------------------------------------------------- startup ---

  mount(root: HTMLElement) {
    root.innerHTML = "";
    const qat = h(
      "div",
      { class: "qat" },
      h("span", { class: "app-logo", html: icon("part") }),
      this.qatBtn("new", "新規 (Ctrl+N)", () => this.newDocument()),
      this.qatBtn("open", "開く (Ctrl+O)", () => this.openFile()),
      this.qatBtn("save", "保存 (Ctrl+S)", () => this.save()),
      h("span", { class: "qat-sep" }),
      this.qatBtn("undo", "元に戻す (Ctrl+Z)", () => this.undo(), "qat-undo"),
      this.qatBtn("redo", "やり直し (Ctrl+Y)", () => this.redo(), "qat-redo"),
      h("span", { class: "qat-sep" }),
      this.materialSelect(),
    );
    this.titleEl = h("div", { class: "doc-title" });
    const titlebar = h(
      "header",
      { class: "titlebar" },
      qat,
      this.titleEl,
      h(
        "div",
        { class: "tb-right" },
        h("button", { class: "icon-btn", title: "キーボード ショートカット", onClick: () => openShortcuts() }, iconEl("keyboard")),
        h("button", { class: "icon-btn", title: "テーマ切り替え", onClick: () => this.toggleTheme() }, iconEl("theme")),
        h("button", { class: "icon-btn", title: "ヘルプ", onClick: () => openShortcuts() }, iconEl("help")),
      ),
    );
    const ribbonHost = h("div", { class: "ribbon-host" });
    const main = h("main", { class: "main" });
    const vpEl = h("section", { class: "viewport", "aria-label": "3D ビュー" });
    this.panelHost = h("div", { class: "panel-host" });
    this.busyEl = h("div", { class: "busy" }, h("span", { class: "spinner" }), "再計算中…");
    vpEl.append(this.panelHost, this.busyEl);
    this.statusEl = h("span", { class: "st-prompt" }, "準備完了");
    this.statusSel = h("span", { class: "st-sel" });
    this.statusDof = h("span", { class: "st-dof" });
    this.statusCoord = h("span", { class: "st-coord" });
    this.statusRegen = h("span", { class: "st-regen" });
    const status = h("footer", { class: "statusbar" }, this.statusEl, h("span", { class: "spacer" }), this.statusDof, this.statusSel, this.statusCoord, h("span", { class: "st-unit" }, "mm"), this.statusRegen);
    root.append(titlebar, ribbonHost, main, status);

    this.browser = new ModelBrowser(main, {
      doc: () => this.store.doc,
      errors: () => this.featureErrors,
      bodyCount: () => this.bodies.length,
      activeSketch: () => this.sketchEditor?.sketchId ?? null,
      selected: () => this.browserSelection,
      originVisible: (k) => this.originVis.has(k),
      select: (id, add) => this.browserSelect(id, add),
      edit: (id) => this.editFeature(id),
      contextMenu: (id, x, y) => this.featureContextMenu(id, x, y),
      rename: (id, name) => this.store.mutate("名前変更", (d) => (d.features.find((f) => f.id === id)!.name = name)),
      moveEndOfPart: (i) => this.moveEndOfPart(i),
      toggleOrigin: (k) => {
        if (this.originVis.has(k)) this.originVis.delete(k);
        else this.originVis.add(k);
        this.updateRefs();
        this.browser.render();
      },
      toggleSketchVisible: (id) =>
        this.store.mutate("表示切替", (d) => {
          const s = d.features.find((f) => f.id === id) as SketchFeature;
          s.visible = s.visible === false;
        }),
      hover: () => {},
    });
    this.browser.el.appendChild(this.resizer());
    main.appendChild(vpEl);

    this.vp = new Viewport(vpEl);
    this.cube = new ViewCube(this.vp, vpEl, () => this.homeView());
    this.vp.onViewChange = () => {
      this.cube.render();
      if (this.sketchEditor) this.sketchEditor.redraw();
    };
    this.vp.onCursorWorld = (p) => (this.statusCoord.textContent = p ? `X ${formatNumber(p[0], 2)}  Y ${formatNumber(p[1], 2)}  Z ${formatNumber(p[2], 2)}` : "");
    this.vp.onHoverChange = (p) => this.describeHover(p);
    this.buildNavBar(vpEl);

    this.commands = buildCommands(this);
    this.ribbon = new Ribbon(ribbonHost, buildRibbonTabs(this), (a) => this.fileMenu(a));

    this.store.on((reason) => this.onDocChanged(reason));
    this.setModelTool();
    this.installKeys();
    window.addEventListener("beforeunload", (e) => {
      if (this.store.dirty) e.preventDefault();
    });
    vpEl.addEventListener("dragover", (e) => e.preventDefault());
    vpEl.addEventListener("drop", (e) => {
      e.preventDefault();
      const f = e.dataTransfer?.files?.[0];
      if (f) this.openOrImport(f);
    });

    this.restoreAutosave();
    this.refreshUI();
    this.kernel
      .init()
      .then(() => {
        this.kernelReady = true;
        this.status("準備完了 — 「2D スケッチを作成」(S) から始めましょう");
        this.regenNow();
      })
      .catch((e) => toast(`ジオメトリ カーネルの初期化に失敗しました: ${e.message}`, "error", 10000));
  }

  private qatBtn(ic: string, title: string, fn: () => void, id?: string) {
    return h("button", { class: "icon-btn qat-btn", title, onClick: fn, id }, iconEl(ic));
  }

  private materialSelect(): HTMLElement {
    const sel = h("select", { class: "qat-select", title: "マテリアル", "aria-label": "マテリアル" });
    for (const m of MATERIALS) sel.appendChild(h("option", { value: m.name }, m.name));
    sel.addEventListener("change", () => {
      const m = MATERIALS.find((x) => x.name === sel.value)!;
      this.store.mutate("マテリアル", (d) => (d.material = { ...m }));
    });
    this.materialSel = sel;
    return h("label", { class: "qat-field" }, iconEl("material"), sel);
  }
  private materialSel!: HTMLSelectElement;

  private resizer(): HTMLElement {
    const r = h("div", { class: "br-resizer", title: "ドラッグで幅を変更" });
    r.addEventListener("pointerdown", (e) => {
      r.setPointerCapture(e.pointerId);
      const start = e.clientX, w0 = this.browser.el.offsetWidth;
      const mv = (ev: PointerEvent) => (this.browser.el.style.width = `${Math.max(180, Math.min(520, w0 + ev.clientX - start))}px`);
      const up = () => {
        r.removeEventListener("pointermove", mv);
        r.removeEventListener("pointerup", up);
      };
      r.addEventListener("pointermove", mv);
      r.addEventListener("pointerup", up);
    });
    return r;
  }

  private buildNavBar(vpEl: HTMLElement) {
    const nb = h("div", { class: "navbar", role: "toolbar", "aria-label": "ナビゲーション" });
    const btn = (ic: string, title: string, fn: () => void, mode?: "pan" | "zoom" | "orbit") => {
      const b = h("button", { class: "icon-btn nav-btn", title, onClick: fn }, iconEl(ic));
      if (mode) b.dataset.mode = mode;
      nb.appendChild(b);
      return b;
    };
    const setMode = (m: "pan" | "zoom" | "orbit") => {
      this.vp.navMode = this.vp.navMode === m ? "none" : m;
      nb.querySelectorAll<HTMLElement>("[data-mode]").forEach((b) => b.classList.toggle("on", b.dataset.mode === this.vp.navMode));
      this.status(this.vp.navMode === "none" ? "" : "ドラッグで操作 — Esc で終了");
    };
    this.navSetMode = setMode;
    btn("pan", "画面移動 (F2 / 中ボタン ドラッグ)", () => setMode("pan"), "pan");
    btn("zoom", "ズーム (F3 / ホイール)", () => setMode("zoom"), "zoom");
    btn("orbit", "オービット (F4 / Shift+中ボタン / Alt+ドラッグ)", () => setMode("orbit"), "orbit");
    btn("zoomFit", "全体表示 (Home)", () => this.vp.fitAll());
    btn("lookAt", "注視 (PageUp)", () => this.lookAtSelection());
    vpEl.appendChild(nb);
  }
  navSetMode: (m: "pan" | "zoom" | "orbit") => void = () => {};

  // -------------------------------------------------------------- status ---

  status(msg: string) {
    this.statusEl.textContent = msg;
  }

  values(): Map<string, number> {
    return evaluateParams(this.store.doc.params);
  }

  sketchState(id: string): SketchState | undefined {
    return this.resolved?.sketches.get(id);
  }

  hasBodies(): boolean {
    return this.bodies.length > 0;
  }

  private describeHover(p: Pick | null) {
    if (!p) {
      this.statusSel.textContent = this.selectionText();
      return;
    }
    const b = this.pickBodies[p.body];
    if (p.kind === "face" && b) {
      const f = b.faces[p.index];
      const t: Record<string, string> = { PLANE: "平面", CYLINDRE: "円筒面", CYLINDER: "円筒面", CONE: "円錐面", SPHERE: "球面", TORUS: "トーラス面", BSPLINE: "自由曲面" };
      this.statusSel.textContent = `面: ${t[f.type] ?? f.type}`;
    } else if (p.kind === "edge" && b) {
      const e = b.edges[p.index];
      this.statusSel.textContent = `エッジ: ${e.type === "LINE" ? "直線" : e.type === "CIRCLE" ? "円弧" : e.type}  長さ ${formatNumber(e.length, 3)} mm`;
    } else if (p.key) this.statusSel.textContent = p.key;
  }

  private selectionText(): string {
    const s = this.vp?.selection ?? [];
    if (!s.length) return "";
    const f = s.filter((x) => x.kind === "face").length, e = s.filter((x) => x.kind === "edge").length;
    return [f ? `面 ${f}` : "", e ? `エッジ ${e}` : ""].filter(Boolean).join(", ") + " 選択";
  }

  // -------------------------------------------------------------- regen ---

  private onDocChanged(reason: string) {
    if (reason === "refs") return;
    this.scheduleAutosave();
    if (this.mode === "sketch" && this.sketchEditor) {
      if (!this.store.feature(this.sketchEditor.sketchId)) {
        // sketch removed by undo
        this.exitSketch(false);
      } else {
        this.sketchEditor.refresh();
        this.refreshUI();
        return;
      }
    }
    if (reason === "load" || reason === "undo" || reason === "redo") this.syncMaterial();
    this.scheduleRegen();
    this.refreshUI();
  }

  scheduleRegen(delay = 20) {
    clearTimeout(this.regenTimer);
    this.regenTimer = window.setTimeout(() => this.regenNow(), delay);
  }

  async regenNow() {
    const doc = this.store.doc;
    const values = evaluateParams(doc.params);
    // work planes resolve on the UI side; sketches on them follow
    for (const f of doc.features)
      if (f.type === "workplane") {
        let off = 0;
        try {
          off = evalWith(values, f.offset);
        } catch {
          /* keep 0 */
        }
        f.plane = { ...f.base, origin: f.base.origin.map((o, i) => o + f.base.normal[i] * off) as Vec3 };
      }
    for (const f of doc.features)
      if (f.type === "sketch" && f.planeRef) {
        const wp = doc.features.find((x) => x.id === f.planeRef) as WorkPlaneFeature | undefined;
        if (wp?.plane) f.plane = wp.plane;
      }
    const resolved = resolveDocument(doc, values);
    this.resolved = resolved;
    if (!this.kernelReady) {
      this.renderSketches();
      return;
    }
    const seq = ++this.regenSeq;
    const busyTimer = setTimeout(() => this.busyEl.classList.add("show"), 250);
    let res: RebuildResult;
    try {
      res = await this.kernel.rebuild(resolved.features, this.command?.captureBefore?.());
    } catch (e) {
      clearTimeout(busyTimer);
      this.busyEl.classList.remove("show");
      toast(`再計算エラー: ${(e as Error).message}`, "error");
      return;
    }
    clearTimeout(busyTimer);
    this.busyEl.classList.remove("show");
    if (seq !== this.regenSeq) return; // a newer regen superseded this one
    this.featureErrors = { ...resolved.errors, ...res.errors };
    this.bodies = res.bodies;
    this.pickBodies = res.before ?? res.bodies;
    this.vp.setBodies(res.bodies, res.before);
    this.vp.setMaterialColor(doc.material.color);
    this.statusRegen.textContent = `${Math.round(res.timeMs)} ms`;
    // keep topology references tracking the edited geometry
    const upd = res.updatedRefs;
    if (Object.keys(upd).length) {
      let changed = false;
      for (const [id, r] of Object.entries(upd)) {
        const f = this.store.feature(id) as (Feature & { edges?: EdgeRef[]; faces?: FaceRef[] }) | undefined;
        if (!f) continue;
        if (r.edges && JSON.stringify(f.edges) !== JSON.stringify(r.edges)) (f.edges = r.edges), (changed = true);
        if (r.faces && JSON.stringify(f.faces) !== JSON.stringify(r.faces)) (f.faces = r.faces), (changed = true);
      }
      if (changed) this.store.emit("refs");
    }
    const pb = this.pickBodies;
    this.vp.setSelection(this.vp.selection.filter((p) => p.body < 0 || (pb[p.body] && (p.kind === "face" ? p.index < pb[p.body].faces.length : p.index < pb[p.body].edges.length))));
    this.renderSketches();
    this.updateRefs();
    this.command?.onRegen?.();
    this.refreshUI();
    if (this.firstFit && res.bodies.length) {
      this.firstFit = false;
      this.vp.fitAll(false);
    }
  }
  private firstFit = true;

  /** Draw inactive sketches in model mode (optionally with profile-picking overlays). */
  renderSketches(overlay?: SketchOverlay | SketchOverlay[]) {
    for (const r of this.sketchRenderers) {
      r.clear();
      this.vp.sketchLayer.remove(r.group);
    }
    this.sketchRenderers = [];
    const overlays = overlay ? (Array.isArray(overlay) ? overlay : [overlay]) : [];
    const doc = this.store.doc;
    const consumed = new Set(doc.features.flatMap(featureSketchRefs));
    doc.features.forEach((f, i) => {
      if (f.type !== "sketch") return;
      if (this.sketchEditor?.sketchId === f.id) return;
      const ov = overlays.find((o) => o.sketchId === f.id);
      const visible = !!ov || (i < doc.endOfPart && (consumed.has(f.id) ? f.visible === true : f.visible !== false));
      if (!visible) return;
      const r = new SketchRenderer(this.vp.sketchLayer);
      const st = this.sketchState(f.id);
      r.render(
        f,
        {
          active: false,
          fullyConstrained: false,
          selected: new Set(),
          hover: null,
          showConstraints: false,
          pixel: this.vp.pixelSize,
          dimText: () => "",
        },
        ov && st ? { list: st.regions, selected: ov.selected, hover: ov.hover } : undefined,
      );
      this.sketchRenderers.push(r);
    });
    this.vp.invalidate();
  }

  /** Origin planes / axes and work planes shown in the viewport. */
  updateRefs() {
    const box = this.vp.modelBounds();
    const size = box.isEmpty() ? 60 : Math.max(40, box.getSize(new THREE.Vector3()).length() * 0.6);
    const list: Parameters<Viewport["setRefs"]>[0] = [];
    const show = (k: string) => this.originVis.has(k) || this.showPlanePicker;
    const planeLabels: Record<string, string> = { YZ: "YZ 平面", XZ: "XZ 平面", XY: "XY 平面" };
    for (const k of ["YZ", "XZ", "XY"] as const)
      if (show(k)) list.push({ key: k, kind: "plane", plane: ORIGIN_PLANES[k], label: planeLabels[k], size });
    const axes: Record<string, Vec3> = { X: [1, 0, 0], Y: [0, 1, 0], Z: [0, 0, 1] };
    for (const k of ["X", "Y", "Z"]) if (this.originVis.has(k)) list.push({ key: k, kind: "axis", dir: axes[k], label: `${k} 軸`, size });
    if (this.originVis.has("O")) list.push({ key: "O", kind: "point", label: "中心点", size });
    this.store.doc.features.forEach((f, i) => {
      if (f.type === "workplane" && f.plane && i < this.store.doc.endOfPart && (f.visible !== false || this.showPlanePicker))
        list.push({ key: f.id, kind: "plane", plane: f.plane, label: f.name, size: size * 0.8 });
    });
    if (list.length) list[0].size = size;
    this.vp.setRefs(list);
  }

  // --------------------------------------------------------- refs & planes ---

  edgeRef(p: Pick): EdgeRef | null {
    const b = this.pickBodies[p.body];
    const e = b?.edges[p.index];
    if (!e) return null;
    return { mid: e.mid, a: e.a, b: e.b, n: normInBox(e.mid, b.bbox), type: e.type };
  }

  faceRef(p: Pick): FaceRef | null {
    const b = this.pickBodies[p.body];
    const f = b?.faces[p.index];
    if (!f) return null;
    return { center: f.center, normal: f.normal, n: normInBox(f.center, b.bbox), type: f.type };
  }

  /** Plane definition for a picked plane / planar face. */
  planeOf(p: Pick): { plane: PlaneDef; label: string; ref?: string } | null {
    if (p.kind === "plane" && p.key) {
      if (p.key in ORIGIN_PLANES) return { plane: ORIGIN_PLANES[p.key as "XY"], label: `${p.key} 平面` };
      const wp = this.store.feature<WorkPlaneFeature>(p.key);
      if (wp?.plane) return { plane: wp.plane, label: wp.name, ref: wp.id };
    }
    if (p.kind === "face") {
      const f = this.pickBodies[p.body]?.faces[p.index];
      if (f?.plane) return { plane: f.plane, label: "面" };
    }
    return null;
  }

  modelEdgeInfo(body: number, index: number) {
    const b = this.pickBodies[body];
    const e = b?.edges[index];
    if (!e) return null;
    const s = b.edgeRanges[index * 2], n = b.edgeRanges[index * 2 + 1];
    const points: Vec3[] = [];
    for (let k = 0; k < n; k++) points.push([b.edgePositions[(s + k) * 3], b.edgePositions[(s + k) * 3 + 1], b.edgePositions[(s + k) * 3 + 2]]);
    return { type: e.type, a: e.a, b: e.b, mid: e.mid, points };
  }

  // ------------------------------------------------------- model tooling ---

  /** Default selection tool in the 3D model environment. */
  setModelTool() {
    this.vp.pickKinds = new Set(["face", "edge"]);
    this.vp.pickFilter = null;
    this.vp.tool = this.modelTool;
    this.vp.renderer.domElement.style.cursor = "default";
  }

  readonly modelTool: ToolHandler = {
    onPointerMove: (e, vp) => vp.setHover(vp.pick(e)),
    onPointerDown: (e, vp) => {
      if (e.button !== 0) return;
      const p = vp.pick(e);
      if (!p) {
        if (!e.shiftKey && !e.ctrlKey) vp.setSelection([]);
      } else if (e.shiftKey || e.ctrlKey) {
        const has = vp.selection.some((s) => samePick(s, p));
        vp.setSelection(has ? vp.selection.filter((s) => !samePick(s, p)) : [...vp.selection, p]);
      } else vp.setSelection([p]);
      this.browserSelection.clear();
      this.browser.render();
      this.statusSel.textContent = this.selectionText();
      this.ribbon.refresh();
    },
    onDblClick: (e, vp) => {
      const p = vp.pick(e, new Set(["face"]));
      if (p) {
        const pl = this.planeOf(p);
        if (pl) this.vp.lookAtPlane(pl.plane);
      }
    },
    onContextMenu: (e) => {
      this.modelMarkingMenu(e.clientX, e.clientY);
      return true;
    },
  };

  private modelMarkingMenu(x: number, y: number) {
    const c = this.commands;
    const last = this.lastCommand ? c.get(this.lastCommand) : null;
    markingMenu(
      x,
      y,
      [
        { label: "2D スケッチ", icon: "sketch", action: () => c.run("sketch") },
        { label: "押し出し", icon: "extrude", action: () => c.run("extrude") },
        { label: "穴", icon: "hole", action: () => c.run("hole") },
        { label: "フィレット", icon: "fillet", action: () => c.run("fillet") },
        last ? { label: `繰り返し: ${last.label}`, icon: last.icon, action: () => c.run(last.id) } : { label: "測定", icon: "measure", action: () => c.run("measure") },
        { label: "面取り", icon: "chamfer", action: () => c.run("chamfer") },
        { label: "回転", icon: "revolve", action: () => c.run("revolve") },
        { label: "ホーム ビュー", icon: "home", action: () => this.homeView() },
      ],
      [
        { label: "全体表示", icon: "zoomFit", shortcut: "Home", action: () => this.vp.fitAll() },
        { label: "注視", icon: "lookAt", shortcut: "PageUp", disabled: !this.vp.selection.length, action: () => this.lookAtSelection() },
        { separator: true, label: "" },
        { label: "シェル", icon: "shell", action: () => c.run("shell") },
        { label: "作業平面", icon: "workplane", action: () => c.run("workplane") },
        { label: "測定", icon: "measure", shortcut: "M", action: () => c.run("measure") },
        { label: "iProperties", icon: "iprops", action: () => openIProperties(this) },
        { label: "パラメータ", icon: "params", action: () => openParameters(this) },
      ],
    );
  }

  lookAtSelection() {
    if (this.mode === "sketch" && this.sketchEditor) {
      this.vp.lookAtPlane(this.sketchEditor.sk.plane);
      return;
    }
    const p = this.vp.selection[0];
    if (!p) {
      toast("注視する面または平面を選択してください", "info");
      return;
    }
    const pl = this.planeOf(p);
    if (pl) this.vp.lookAtPlane(pl.plane);
    else if (p.kind === "face") {
      const f = this.pickBodies[p.body].faces[p.index];
      const q = Viewport.quatFor(f.normal);
      this.vp.animateTo({ target: new THREE.Vector3(...f.center), quat: q, height: this.vp.view.height });
    }
  }

  homeView() {
    this.vp.setStandardView([1, 1, 1]);
  }

  // ---------------------------------------------------------- commands ---

  startCommand(cmd: Command) {
    if (this.command) this.finishCommand(this.command, false);
    this.command = cmd;
    if (cmd.handler) this.vp.tool = cmd.handler;
    this.refreshUI();
  }

  finishCommand(cmd: Command, ok: boolean, restart = false) {
    if (this.command !== cmd) return;
    try {
      if (ok) cmd.ok();
      else cmd.cancel();
    } catch (e) {
      toast((e as Error).message, "error");
      return;
    }
    this.command = null;
    this.vp.setSelection([]);
    this.vp.setHover(null);
    this.showPlanePicker = false;
    this.updateRefs();
    if (this.mode === "model") this.setModelTool();
    this.renderSketches();
    this.status("準備完了");
    this.refreshUI();
    if (restart) this.commands.run(cmd.id);
  }

  browserSelect(id: string, additive: boolean) {
    if (this.command?.onBrowserSelect?.(id)) return;
    if (additive) {
      if (this.browserSelection.has(id)) this.browserSelection.delete(id);
      else this.browserSelection.add(id);
    } else this.browserSelection = new Set([id]);
    this.browser.render();
    this.ribbon.refresh();
  }

  editFeature(id: string) {
    const f = this.store.feature(id);
    if (!f) return;
    if (f.type === "sketch") this.enterSketch(id);
    else this.commands.edit(f);
  }

  // -------------------------------------------------------------- sketch ---

  createSketch(plane: PlaneDef, label: string, planeRef?: string) {
    const id = uid("sk");
    const origin = worldToPlane(plane, [0, 0, 0]);
    const sk: SketchFeature = {
      id,
      type: "sketch",
      name: this.store.nextFeatureName("sketch"),
      plane,
      planeLabel: label,
      planeRef,
      entities: [{ id: "origin", type: "point", x: origin[0], y: origin[1], fixed: true, ref: true }],
      constraints: [],
      dimensions: [],
    };
    this.store.mutate("2D スケッチを作成", (d) => this.store.insertFeature(d, sk));
    this.enterSketch(id);
  }

  enterSketch(id: string) {
    if (this.command) this.finishCommand(this.command, false);
    if (this.sketchEditor) this.exitSketch(true);
    const sk = this.store.feature<SketchFeature>(id);
    if (!sk) return;
    this.mode = "sketch";
    this.vp.setSelection([]);
    this.vp.setHover(null);
    this.sketchEditor = new SketchEditor(this.store, id, this.vp, {
      status: (m) => this.status(m),
      toast: (m, k) => toast(m, k),
      dofChanged: (dof, ok) => {
        this.statusDof.textContent = !ok ? "⚠ 拘束を解けません" : dof === 0 ? "✓ 完全拘束" : `${dof} 個の寸法/拘束が必要`;
        this.statusDof.className = "st-dof " + (!ok ? "bad" : dof === 0 ? "ok" : "");
      },
      toolChanged: () => this.ribbon.refresh(),
      selectionChanged: () => this.ribbon.refresh(),
      modelEdge: (p) => this.modelEdgeInfo(p.body, p.index),
    });
    this.vp.tool = this.sketchTool;
    this.sketchEditor.setTool("select");
    this.sketchEditor.refresh();
    this.renderSketches();
    this.applySlice();
    this.vp.lookAtPlane(sk.plane);
    this.ribbon.setActive("sketch");
    this.refreshUI();
  }

  readonly sketchTool: ToolHandler = {
    cursor: "crosshair",
    onPointerDown: (e, vp) => this.sketchEditor?.onPointerDown(e) ?? void vp,
    onPointerMove: (e) => this.sketchEditor?.onPointerMove(e),
    onPointerUp: (e) => this.sketchEditor?.onPointerUp(e),
    onDblClick: (e) => this.sketchEditor?.onDblClick(e),
    onContextMenu: (e) => {
      this.sketchMarkingMenu(e.clientX, e.clientY);
      return true;
    },
  };

  sketchTool_(t: SketchTool) {
    this.sketchEditor?.setTool(t);
    this.ribbon.refresh();
  }

  private sketchMarkingMenu(x: number, y: number) {
    const t = (tool: SketchTool) => () => this.sketchTool_(tool);
    markingMenu(
      x,
      y,
      [
        { label: "線分", icon: "line", action: t("line") },
        { label: "円", icon: "circle", action: t("circle") },
        { label: "長方形", icon: "rect", action: t("rect") },
        { label: "寸法", icon: "dimension", action: t("dimension") },
        { label: "スケッチを終了", icon: "finish", action: () => this.exitSketch(true) },
        { label: "トリム", icon: "trim", action: t("trim") },
        { label: "円弧", icon: "arc", action: t("arc") },
        { label: "一致拘束", icon: "coincident", action: t("coincident") },
      ],
      [
        { label: "注視", icon: "lookAt", shortcut: "PageUp", action: () => this.lookAtSelection() },
        { label: "スライス表示", icon: "section", shortcut: "F7", checked: this.sliceGraphics, action: () => this.toggleSlice() },
        { separator: true, label: "" },
        { label: "コンストラクション", icon: "construction", action: () => this.sketchEditor?.toggleConstruction() },
        { label: "削除", icon: "delete", shortcut: "Delete", disabled: !this.sketchEditor?.selected.size, action: () => this.sketchEditor?.deleteSelection() },
        { label: "拘束を表示/非表示", icon: "eye", shortcut: "F8", action: () => this.toggleConstraintGlyphs() },
      ],
    );
  }

  toggleConstraintGlyphs() {
    if (!this.sketchEditor) return;
    this.sketchEditor.showConstraints = !this.sketchEditor.showConstraints;
    this.sketchEditor.redraw();
  }

  exitSketch(keep = true) {
    const ed = this.sketchEditor;
    if (!ed) return;
    ed.dispose();
    this.sketchEditor = null;
    this.mode = "model";
    this.statusDof.textContent = "";
    this.applySlice();
    this.setModelTool();
    this.ribbon.setActive("model");
    this.status("準備完了");
    void keep;
    this.scheduleRegen(0);
    this.refreshUI();
  }

  toggleSlice() {
    this.sliceGraphics = !this.sliceGraphics;
    this.applySlice();
  }

  private applySlice() {
    if (this.mode === "sketch" && this.sliceGraphics && this.sketchEditor) {
      const p = this.sketchEditor.sk.plane;
      const n = new THREE.Vector3(...p.normal);
      this.vp.setSection(new THREE.Plane(n.clone().negate(), n.dot(new THREE.Vector3(...p.origin)) + 1e-3));
    } else if (!this.sectionPanel) this.vp.setSection(null);
  }

  // ------------------------------------------------------------ section ---

  toggleSectionView() {
    if (this.sectionPanel) {
      this.sectionPanel.remove();
      this.sectionPanel = null;
      this.vp.setSection(null);
      this.ribbon.refresh();
      return;
    }
    let axis: "X" | "Y" | "Z" = "Z";
    let flip = false;
    const box = this.vp.modelBounds();
    const range = box.isEmpty() ? new THREE.Box3(new THREE.Vector3(-50, -50, -50), new THREE.Vector3(50, 50, 50)) : box;
    const slider = h("input", { type: "range", min: "0", max: "1000", value: "500", "aria-label": "断面位置" });
    const valEl = h("span", { class: "sec-val" });
    const apply = () => {
      const i = { X: 0, Y: 1, Z: 2 }[axis];
      const lo = range.min.getComponent(i), hi = range.max.getComponent(i);
      const v = lo + ((hi - lo) * Number(slider.value)) / 1000;
      const n = new THREE.Vector3().setComponent(i, flip ? 1 : -1);
      this.vp.setSection(new THREE.Plane(n, flip ? -v : v));
      valEl.textContent = `${axis} = ${formatNumber(v, 2)} mm`;
    };
    const axisSel = h("div", { class: "toggle-group" });
    for (const a of ["X", "Y", "Z"] as const) {
      const b = h(
        "button",
        {
          class: "tg txt" + (a === axis ? " on" : ""),
          onClick: () => {
            axis = a;
            axisSel.querySelectorAll(".tg").forEach((x) => x.classList.toggle("on", x === b));
            apply();
          },
        },
        `${a}`,
      );
      axisSel.appendChild(b);
    }
    slider.addEventListener("input", apply);
    this.sectionPanel = h(
      "div",
      { class: "section-panel" },
      iconEl("section"),
      h("strong", {}, "断面図"),
      axisSel,
      slider,
      valEl,
      h("button", { class: "icon-btn", title: "反転", onClick: () => ((flip = !flip), apply()) }, iconEl("flip")),
      h("button", { class: "icon-btn", title: "断面図を終了", onClick: () => this.toggleSectionView() }, iconEl("close")),
    );
    this.vp.el.appendChild(this.sectionPanel);
    apply();
    this.ribbon.refresh();
  }

  get sectionActive() {
    return !!this.sectionPanel;
  }

  setStyle(s: VisualStyle) {
    this.vp.setStyle(s);
    this.ribbon.refresh();
  }

  // ------------------------------------------------------------- editing ---

  undo() {
    if (this.command) this.finishCommand(this.command, false);
    this.store.undo();
  }

  redo() {
    if (this.command) this.finishCommand(this.command, false);
    this.store.redo();
  }

  async deleteFeatures(ids: string[]) {
    ids = ids.filter((id) => this.store.feature(id));
    if (!ids.length) return;
    // include dependents (Inventor asks; we confirm once)
    const all = new Set(ids);
    let grew = true;
    while (grew) {
      grew = false;
      for (const f of this.store.doc.features)
        if (!all.has(f.id) && [...all].some((x) => this.store.dependents(x).some((d) => d.id === f.id))) {
          all.add(f.id);
          grew = true;
        }
    }
    // consumed sketches of deleted features
    for (const id of [...all]) {
      for (const s of featureSketchRefs(this.store.feature(id)!))
        if (!this.store.doc.features.some((f) => !all.has(f.id) && featureSketchRefs(f).includes(s))) all.add(s);
    }
    const names = [...all].map((id) => this.store.feature(id)!.name);
    if (all.size > ids.length) {
      const ok = await confirmDialog("フィーチャの削除", `次のフィーチャを削除します (依存フィーチャを含む):\n${names.join("、")}`, "削除");
      if (!ok) return;
    }
    this.store.mutate("削除", (d) => this.store.removeFeatures(d, [...all]));
    this.browserSelection.clear();
    toast(`${names.length} 個のフィーチャを削除しました`, "ok", 2000);
  }

  moveEndOfPart(i: number) {
    this.store.mutate("パーツの終わりを移動", (d) => (d.endOfPart = Math.max(0, Math.min(d.features.length, i))));
  }

  private featureContextMenu(id: string, x: number, y: number) {
    if (id === "__eop") {
      contextMenu(x, y, [{ label: "パーツの終わりを最後に移動", icon: "endOfPart", action: () => this.moveEndOfPart(this.store.doc.features.length) }]);
      return;
    }
    if (id.startsWith("__o_")) {
      const k = id.slice(4);
      contextMenu(x, y, [
        { label: "表示", checked: this.originVis.has(k), action: () => (this.originVis.has(k) ? this.originVis.delete(k) : this.originVis.add(k), this.updateRefs(), this.browser.render()) },
        ...(k.length === 2 ? [{ label: "新しいスケッチ", icon: "sketch", action: () => this.createSketch(ORIGIN_PLANES[k as "XY"], `${k} 平面`) } as MenuItem] : []),
      ]);
      return;
    }
    const f = this.store.feature(id);
    if (!f) return;
    if (!this.browserSelection.has(id)) {
      this.browserSelection = new Set([id]);
      this.browser.render();
    }
    const idx = this.store.doc.features.indexOf(f);
    const items: MenuItem[] = [];
    if (f.type === "sketch") items.push({ label: "スケッチを編集", icon: "edit", action: () => this.enterSketch(id) });
    else items.push({ label: "フィーチャを編集", icon: "edit", action: () => this.editFeature(id) });
    for (const sk of featureSketchRefs(f)) {
      const name = this.store.feature(sk)?.name ?? "";
      items.push({ label: `スケッチを編集 (${name})`, icon: "sketch", action: () => this.enterSketch(sk) });
    }
    if (f.type === "sketch" || f.type === "workplane")
      items.push({
        label: f.visible === false ? "表示" : "非表示",
        icon: f.visible === false ? "eye" : "eyeOff",
        action: () => this.store.mutate("表示切替", (d) => ((d.features.find((x) => x.id === id) as SketchFeature).visible = f.visible === false)),
      });
    if (f.type === "sketch" && (f as SketchFeature).plane)
      items.push({ label: "スケッチ平面を注視", icon: "lookAt", action: () => this.vp.lookAtPlane((f as SketchFeature).plane) });
    items.push(
      { separator: true, label: "" },
      { label: "名前を変更", icon: "edit", shortcut: "F2", action: () => this.browser.startRename(id) },
      {
        label: f.suppressed ? "フィーチャの抑制を解除" : "フィーチャを抑制",
        action: () => this.store.mutate("抑制", (d) => (d.features.find((x) => x.id === id)!.suppressed = !f.suppressed)),
      },
      { label: "パーツの終わりをここに移動", icon: "endOfPart", action: () => this.moveEndOfPart(idx + 1) },
      { separator: true, label: "" },
      { label: "削除", icon: "trash", shortcut: "Delete", danger: true, action: () => this.deleteFeatures([...this.browserSelection]) },
    );
    contextMenu(x, y, items);
  }

  // ---------------------------------------------------------------- files ---

  fileMenu(anchor: HTMLElement) {
    const r = anchor.getBoundingClientRect();
    contextMenu(r.left, r.bottom + 2, [
      { label: "新規", icon: "new", shortcut: "Ctrl+N", action: () => this.newDocument() },
      { label: "開く…", icon: "open", shortcut: "Ctrl+O", action: () => this.openFile() },
      { label: "サンプルを開く", icon: "part", action: () => this.loadSample() },
      { separator: true, label: "" },
      { label: "保存", icon: "save", shortcut: "Ctrl+S", action: () => this.save() },
      { label: "名前を付けて保存…", icon: "saveAs", shortcut: "Ctrl+Shift+S", action: () => this.save(true) },
      { separator: true, label: "" },
      { label: "インポート (STEP / STL)…", icon: "import", action: () => this.importFile() },
      { label: "エクスポート: STEP (AP214)", icon: "export", action: () => this.exportFile("step") },
      { label: "エクスポート: STL", icon: "export", action: () => this.exportFile("stl") },
      { label: "エクスポート: 画像 (PNG)", icon: "screenshot", action: () => this.screenshot() },
      { separator: true, label: "" },
      { label: "図面を作成…", icon: "drawing", action: () => openDrawing(this) },
      { label: "iProperties…", icon: "iprops", action: () => openIProperties(this) },
    ]);
  }

  async newDocument() {
    if (this.store.dirty && this.store.doc.features.length && !(await confirmDialog("新規パーツ", "現在のパーツの変更は保存されていません。破棄して新規作成しますか?", "破棄して新規作成"))) return;
    this.resetForLoad();
    this.store.load(newDocument());
    this.firstFit = true;
    this.vp.setStandardView([1, 1, 1], false);
  }

  private resetForLoad() {
    if (this.command) this.finishCommand(this.command, false);
    if (this.sketchEditor) this.exitSketch(false);
    this.browserSelection.clear();
    this.vp.setSelection([]);
  }

  loadSample() {
    this.resetForLoad();
    this.store.load(sampleDocument());
    this.store.dirty = false;
    this.firstFit = true;
    this.vp.setStandardView([1, 1, 1], false);
    toast("サンプル パーツを開きました。ブラウザのフィーチャをダブルクリックすると編集できます", "ok");
  }

  async openFile() {
    const f = await pickFile(".3dcp,.json,.step,.stp,.stl");
    if (f) this.openOrImport(f);
  }

  async importFile() {
    const f = await pickFile(".step,.stp,.stl");
    if (f) this.openOrImport(f);
  }

  private async openOrImport(f: File) {
    const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
    try {
      if (ext === "3dcp" || ext === "json") {
        const doc = JSON.parse(await f.text()) as PartDocument;
        this.resetForLoad();
        this.store.load(doc);
        this.store.fileHandleName = f.name;
        this.firstFit = true;
        this.vp.setStandardView([1, 1, 1], false);
        toast(`${f.name} を開きました`, "ok");
      } else if (ext === "step" || ext === "stp" || ext === "stl") {
        let data: string;
        if (ext === "stl") {
          const bytes = new Uint8Array(await f.arrayBuffer());
          let bin = "";
          for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
          data = btoa(bin);
        } else data = await f.text();
        this.store.mutate("インポート", (d) =>
          this.store.insertFeature(d, {
            id: uid("im"),
            type: "import",
            name: f.name.replace(/\.[^.]+$/, ""),
            format: ext === "stl" ? "stl" : "step",
            fileName: f.name,
            data,
          }),
        );
        if (!this.store.doc.features.some((x) => x.type !== "import")) this.firstFit = true;
        toast(`${f.name} をインポートしました (ベース フィーチャ)`, "ok");
      } else if (ext === "ipt" || ext === "iam" || ext === "idw") {
        toast("Inventor ネイティブ形式 (.ipt/.iam) は非公開形式のため直接開けません。Inventor から STEP (*.stp) で書き出してインポートしてください", "warn", 9000);
      } else toast("サポートされていないファイル形式です", "error");
    } catch (e) {
      toast(`ファイルを開けませんでした: ${(e as Error).message}`, "error");
    }
  }

  save(as = false) {
    let name = this.store.fileHandleName ?? `${this.store.doc.name}.3dcp`;
    if (as) {
      const n = window.prompt("ファイル名", name.replace(/\.3dcp$/, ""));
      if (!n) return;
      name = n.endsWith(".3dcp") ? n : `${n}.3dcp`;
      this.store.patch((d) => (d.name = name.replace(/\.3dcp$/, "")), "rename");
    }
    download(name, JSON.stringify(this.store.doc, null, 1), "application/json");
    this.store.fileHandleName = name;
    this.store.dirty = false;
    this.refreshUI();
    toast(`${name} を保存しました`, "ok", 2000);
  }

  async exportFile(format: "step" | "stl") {
    if (!this.bodies.length) {
      toast("エクスポートするソリッドがありません", "warn");
      return;
    }
    try {
      const buf = await this.kernel.exportFile(format, this.store.doc.name);
      const name = `${this.store.doc.name}.${format === "step" ? "stp" : "stl"}`;
      download(name, buf, format === "step" ? "application/step" : "model/stl");
      toast(`${name} をエクスポートしました${format === "step" ? " — Inventor で開けます" : ""}`, "ok");
    } catch (e) {
      toast(`エクスポートに失敗しました: ${(e as Error).message}`, "error");
    }
  }

  screenshot() {
    const url = this.vp.screenshot();
    const a = h("a", { href: url, download: `${this.store.doc.name}.png` });
    a.click();
  }

  private autosaveTimer = 0;
  private scheduleAutosave() {
    clearTimeout(this.autosaveTimer);
    this.autosaveTimer = window.setTimeout(() => {
      try {
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(this.store.doc));
      } catch {
        /* quota / private mode */
      }
    }, 800);
  }

  private restoreAutosave() {
    try {
      const s = localStorage.getItem(AUTOSAVE_KEY);
      if (!s) {
        this.showWelcome();
        return;
      }
      const doc = JSON.parse(s) as PartDocument;
      if (doc.format !== "3dcad-part" || !doc.features.length) {
        this.showWelcome();
        return;
      }
      this.store.load(doc);
      toast("前回の作業内容を復元しました", "info", 2500);
    } catch {
      this.showWelcome();
    }
  }

  private showWelcome() {
    const close = () => w.remove();
    const card = (ic: string, title: string, desc: string, fn: () => void) =>
      h("button", { class: "wc-card", onClick: () => (close(), fn()) }, iconEl(ic), h("strong", {}, title), h("span", {}, desc));
    const w = h(
      "div",
      { class: "welcome" },
      h(
        "div",
        { class: "wc-inner" },
        h("div", { class: "wc-logo", html: icon("part") }),
        h("h1", {}, "3DCAD Studio"),
        h("p", { class: "wc-sub" }, "パラメトリック 3D CAD — スケッチ、フィーチャ、パラメータで設計。STEP で Inventor とデータ交換できます。"),
        h(
          "div",
          { class: "wc-cards" },
          card("new", "新規パーツ", "空のパーツから開始", () => this.commands.run("sketch")),
          card("part", "サンプルを開く", "フィーチャ ツリー付きの部品", () => this.loadSample()),
          card("open", "開く / インポート", ".3dcp, STEP, STL", () => this.openFile()),
          card("keyboard", "操作ガイド", "マウス操作とショートカット", () => openShortcuts()),
        ),
        h("p", { class: "wc-hint" }, "ヒント: 右クリックでマーキング メニュー、中ボタン ドラッグで画面移動、Shift+中ボタンでオービット"),
      ),
    );
    w.addEventListener("pointerdown", (e) => {
      if (e.target === w) close();
    });
    document.body.appendChild(w);
  }

  // ---------------------------------------------------------- keyboard ---

  private installKeys() {
    window.addEventListener("keydown", (e) => {
      const t = e.target as HTMLElement;
      if (t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement || t instanceof HTMLSelectElement) return;
      if (document.querySelector(".modal-back")) return;
      const k = e.key;
      const ctrl = e.ctrlKey || e.metaKey;
      const kl = k.toLowerCase();
      // Ctrl+Shift combinations first (Inventor defaults)
      if (ctrl && e.shiftKey) {
        const shiftCmds: Record<string, string> = { k: "chamfer", m: "mirror", r: "rectPattern", o: "circPattern" };
        if (shiftCmds[kl]) return void (e.preventDefault(), this.commands.run(shiftCmds[kl]));
        if (kl === "z") return void (e.preventDefault(), this.redo());
        if (kl === "s") return void (e.preventDefault(), this.save(true));
      }
      if (ctrl && kl === "z") return void (e.preventDefault(), this.undo());
      if (ctrl && kl === "y") return void (e.preventDefault(), this.redo());
      if (ctrl && kl === "s") return void (e.preventDefault(), this.save());
      if (ctrl && kl === "o") return void (e.preventDefault(), this.openFile());
      if (ctrl && kl === "n") return void (e.preventDefault(), this.newDocument());
      if (ctrl && k === "Enter" && this.mode === "sketch") return void this.exitSketch(true);
      if (k === "F6") return void (e.preventDefault(), this.homeView());
      if (k === "Home") return void (e.preventDefault(), this.vp.fitAll());
      if (k === "PageUp") return void (e.preventDefault(), this.lookAtSelection());
      if (k === "F7") return void (e.preventDefault(), this.toggleSlice());
      if (k === "F8" || k === "F9") return void (e.preventDefault(), this.toggleConstraintGlyphs());
      if (k === "F2" && this.browserSelection.size === 1 && this.mode === "model") return void (e.preventDefault(), this.browser.startRename([...this.browserSelection][0]));
      if (["F2", "F3", "F4"].includes(k)) return void e.preventDefault();
      if (k === "Escape") {
        closeMenus();
        if (this.vp.navMode !== "none") return void this.navSetMode(this.vp.navMode as "pan");
        if (this.command) {
          if (this.command.onEscape?.()) return;
          return void this.finishCommand(this.command, false);
        }
        if (this.sketchEditor) return void this.sketchEditor.escape();
        this.vp.setSelection([]);
        this.browserSelection.clear();
        this.browser.render();
        return;
      }
      if (k === "Delete" || k === "Backspace") {
        if (this.sketchEditor) return void this.sketchEditor.deleteSelection();
        if (this.browserSelection.size) return void this.deleteFeatures([...this.browserSelection]);
        return;
      }
      if (ctrl || e.altKey) return;
      if (this.sketchEditor) {
        if (this.sketchEditor.captureKey(e)) return;
        const map: Record<string, SketchTool> = { l: "line", c: "circle", a: "arc", r: "rect", d: "dimension", p: "point", x: "trim", g: "polygon" };
        const tool = map[k.toLowerCase()];
        if (tool && !(document.activeElement as HTMLElement)?.closest?.(".sk-hud")) return void this.sketchTool_(tool);
        if (k.toLowerCase() === "s" && !e.shiftKey) return void this.exitSketch(true);
        return;
      }
      const map: Record<string, string> = { s: "sketch", e: "extrude", r: "revolve", h: "hole", f: "fillet", m: "measure" };
      const cmd = map[k.toLowerCase()];
      if (cmd && !this.command) this.commands.run(cmd);
      if (k === "Enter" && this.command) {
        e.preventDefault();
        this.finishCommand(this.command, true);
      }
    });
  }

  // ------------------------------------------------------------------ UI ---

  refreshUI() {
    const d = this.store.doc;
    this.titleEl.textContent = `${d.name}${this.store.dirty ? " *" : ""}${this.mode === "sketch" && this.sketchEditor ? ` — ${this.sketchEditor.sk?.name ?? ""} を編集中` : ""}`;
    document.title = `${d.name} — 3DCAD Studio`;
    (document.getElementById("qat-undo") as HTMLButtonElement | null)?.toggleAttribute("disabled", !this.store.canUndo());
    (document.getElementById("qat-redo") as HTMLButtonElement | null)?.toggleAttribute("disabled", !this.store.canRedo());
    this.browser.render();
    this.ribbon.refresh();
  }

  private syncMaterial() {
    if (this.materialSel) this.materialSel.value = this.store.doc.material.name;
  }

  private toggleTheme() {
    const root = document.documentElement;
    const dark = root.dataset.theme !== "dark";
    root.dataset.theme = dark ? "dark" : "light";
    try {
      localStorage.setItem("3dcad.theme", root.dataset.theme);
    } catch {
      /* ignore */
    }
  }

  /** Screen position of a point in the active sketch (used by automation / tests). */
  sketchToScreen(u: number, v: number): { x: number; y: number } | null {
    const sk = this.sketchEditor?.sk;
    if (!sk) return null;
    return this.vp.toScreen(new THREE.Vector3(...planeToWorld(sk.plane, [u, v])));
  }

  /** Screen position of a world point. */
  worldToScreen(x: number, y: number, z: number): { x: number; y: number } {
    return this.vp.toScreen(new THREE.Vector3(x, y, z));
  }

  featureLabel(f: Feature): string {
    return FEATURE_LABELS[f.type];
  }
}

function normInBox(p: Vec3, [lo, hi]: [Vec3, Vec3]): Vec3 {
  const f = (i: number) => (hi[i] - lo[i] > 1e-9 ? (p[i] - lo[i]) / (hi[i] - lo[i]) : 0.5);
  return [f(0), f(1), f(2)];
}
