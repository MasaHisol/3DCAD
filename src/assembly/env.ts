import * as THREE from "three";
import type { App } from "../app";
import { MATERIALS, newDocument, uid } from "../core/document";
import { formatNumber } from "../core/expr";
import { evalWith, evaluateParams } from "../core/params";
import { prepareDocument, resolveDocument } from "../core/resolve";
import { Store } from "../core/store";
import type { PartDocument, Vec3 } from "../core/types";
import type { BodyMesh, EdgeInfo, FaceInfo, MassProps, Placement, RFeature } from "../kernel/protocol";
import { confirmDialog, contextMenu, download, h, iconEl, markingMenu, modal, pickFile, toast, type MenuItem } from "../ui/dom";
import { PropertyPanel } from "../ui/panel";
import { openDrawing } from "../ui/dialogs";
import type { RibbonTab } from "../ui/ribbon";
import type { Pick, ToolHandler } from "../viewer/viewport";
import { constraintError, solveAssembly, type SolverConstraint } from "./solver";
import { IDENTITY, newAssembly, type AsmComponent, type AsmConstraint, type AsmConstraintType, type AssemblyDocument, type GeoRef } from "./types";

const PALETTE = ["#c9ced6", "#9fb7d6", "#d8c39a", "#a9c9a4", "#d3a6a6", "#b8a9d6", "#9fd0cf", "#d6b38f"];

const TYPE_LABELS: Record<AsmConstraintType, string> = {
  mate: "メイト",
  flush: "フラッシュ",
  insert: "挿入",
  axis: "軸合わせ",
  angle: "角度",
};

interface PartCache {
  hash: string;
  bodies: BodyMesh[];
  error?: string;
}

const key = (partId: string) => `asm:${partId}`;
const m4 = (a: number[]) => new THREE.Matrix4().fromArray(a);

/** Assembly environment: components, constraints and their solving / display. */
export class AssemblyEnv {
  readonly store = new Store<AssemblyDocument>(newAssembly());
  parts = new Map<string, PartCache>();
  /** Display body index -> component / local body index. */
  bodyMap: { comp: string; local: number }[] = [];
  selected = new Set<string>();
  command: { id: string; cancel(): void; ok(): void; onEscape?(): boolean } | null = null;
  solveError = 0;
  private updating: Promise<void> | null = null;
  private pendingUpdate = false;
  /** Part currently opened for editing (in-place). */
  editingPart: string | null = null;

  constructor(private app: App) {
    this.store.on((r) => this.onChange(r));
  }

  get doc() {
    return this.store.doc;
  }

  // ------------------------------------------------------------- update ---

  private onChange(reason: string) {
    if (this.app.env !== "assembly" || reason === "solve") return;
    void this.update();
    this.app.refreshUI();
  }

  /** Rebuild changed parts, re-resolve references, solve and redraw. */
  async update() {
    if (this.updating) {
      this.pendingUpdate = true;
      return this.updating;
    }
    this.updating = (async () => {
      try {
        await this.rebuildParts();
        this.resolveRefs();
        this.solve();
        this.render();
      } finally {
        this.updating = null;
      }
      if (this.pendingUpdate) {
        this.pendingUpdate = false;
        await this.update();
      }
    })();
    return this.updating;
  }

  private partFeatures(partId: string): RFeature[] {
    const p = this.doc.parts.find((x) => x.id === partId)!;
    if (p.kind === "step") return [{ id: "import", type: "import", format: "step", data: p.step ?? "" }];
    const doc = p.doc!;
    const values = evaluateParams(doc.params);
    prepareDocument(doc, values);
    return resolveDocument(doc, values).features;
  }

  private async rebuildParts() {
    const live = new Set(this.doc.parts.map((p) => p.id));
    for (const id of [...this.parts.keys()])
      if (!live.has(id)) {
        this.parts.delete(id);
        void this.app.kernel.dropEngine(key(id));
      }
    for (const p of this.doc.parts) {
      const hash = p.kind === "step" ? `step:${p.step?.length}:${p.fileName}` : JSON.stringify([p.doc?.features, p.doc?.params, p.doc?.endOfPart]);
      const cached = this.parts.get(p.id);
      if (cached && cached.hash === hash) continue;
      try {
        const res = await this.app.kernel.rebuildKey(key(p.id), this.partFeatures(p.id));
        const errs = Object.values(res.errors);
        this.parts.set(p.id, { hash, bodies: res.bodies, error: errs[0] });
      } catch (e) {
        this.parts.set(p.id, { hash, bodies: [], error: (e as Error).message });
      }
    }
  }

  /** Follow picked geometry after a part was edited (nearest matching face / edge). */
  private resolveRefs() {
    let changed = false;
    const next = structuredClone(this.doc.constraints);
    for (const c of next)
      for (const g of [c.a, c.b]) {
        const comp = this.doc.components.find((x) => x.id === g.comp);
        const cache = comp && this.parts.get(comp.partId);
        if (!cache) continue;
        const r = this.geoFromRef(g, cache.bodies);
        if (r && (dist(r.point, g.point) > 1e-9 || dist(r.dir, g.dir) > 1e-9)) {
          g.point = r.point;
          g.dir = r.dir;
          changed = true;
        }
      }
    if (changed) this.store.patch((d) => (d.constraints = next), "solve");
  }

  private geoFromRef(g: GeoRef, bodies: BodyMesh[]): { point: Vec3; dir: Vec3 } | null {
    let best: { score: number; point: Vec3; dir: Vec3 } | null = null;
    for (const b of bodies) {
      if (g.face) {
        for (const f of b.faces) {
          const score = dist(f.center, g.face.center) + (1 - dot(f.normal, g.face.normal)) * 50;
          if (!best || score < best.score) {
            const geo = faceGeo(f, g.geom);
            if (geo) best = { score, ...geo };
          }
        }
      } else if (g.edge) {
        for (const e of b.edges) {
          const score = dist(e.mid, g.edge.mid);
          if (!best || score < best.score) {
            const geo = edgeGeo(e, g.geom, b);
            if (geo) best = { score, ...geo };
          }
        }
      }
    }
    if (!best || best.score > 25) return null;
    // keep the user's chosen direction sense
    if (dot(best.dir, g.dir) < 0) best.dir = best.dir.map((x) => -x) as Vec3;
    return best;
  }

  solverConstraints(doc = this.doc): SolverConstraint[] {
    const values = evaluateParams(doc.params);
    return doc.constraints
      .filter((c) => !c.suppressed)
      .map((c) => {
        let value = 0;
        try {
          value = evalWith(values, c.offset);
        } catch {
          /* invalid -> 0 */
        }
        return { type: c.type, a: c.a, b: c.b, value, flip: c.flip };
      });
  }

  /** Solve all constraints and store the resulting placements (no undo step). */
  solve() {
    const doc = this.doc;
    const mats = new Map(doc.components.map((c) => [c.id, m4(c.matrix)]));
    const fixed = new Set(doc.components.filter((c) => c.grounded).map((c) => c.id));
    const rep = solveAssembly(mats, fixed, this.solverConstraints());
    this.solveError = rep.ok ? 0 : rep.error;
    let changed = false;
    const next = doc.components.map((c) => {
      const arr = mats.get(c.id)!.toArray();
      if (arr.some((v, i) => Math.abs(v - c.matrix[i]) > 1e-9)) changed = true;
      return { ...c, matrix: arr };
    });
    if (changed) this.store.patch((d) => (d.components = next), "solve");
    return rep;
  }

  render() {
    const vp = this.app.vp;
    const bodies: BodyMesh[] = [];
    const colors: (string | undefined)[] = [];
    const mats: THREE.Matrix4[] = [];
    this.bodyMap = [];
    this.doc.components.forEach((c) => {
      if (c.visible === false) return;
      const cache = this.parts.get(c.partId);
      if (!cache) return;
      const color = this.partColor(c.partId);
      cache.bodies.forEach((b, i) => {
        bodies.push(b);
        colors.push(color);
        mats.push(m4(c.matrix));
        this.bodyMap.push({ comp: c.id, local: i });
      });
    });
    vp.setBodies(bodies, undefined, colors, mats);
    this.highlightSelection();
    this.app.browser.render();
  }

  partColor(partId: string): string {
    const p = this.doc.parts.find((x) => x.id === partId);
    const mat = p?.doc?.material;
    if (mat && mat.name !== MATERIALS[0].name) return mat.color;
    const i = this.doc.parts.findIndex((x) => x.id === partId);
    return PALETTE[i % PALETTE.length];
  }

  highlightSelection() {
    const set = new Set<number>();
    this.bodyMap.forEach((m, i) => this.selected.has(m.comp) && set.add(i));
    this.app.vp.setBodyHighlight(set);
  }

  compOfBody(bi: number): AsmComponent | undefined {
    const m = this.bodyMap[bi];
    return m ? this.doc.components.find((c) => c.id === m.comp) : undefined;
  }

  placements(): Placement[] {
    return this.doc.components.filter((c) => c.visible !== false).map((c) => ({ key: key(c.partId), matrix: c.matrix, name: c.name }));
  }

  // ------------------------------------------------------------ picking ---

  /** Converts a viewport pick into part-local constraint geometry. */
  geoFromPick(p: Pick, type: AsmConstraintType): GeoRef | null {
    const map = this.bodyMap[p.body];
    if (!map) return null;
    const comp = this.doc.components.find((c) => c.id === map.comp)!;
    const body = this.parts.get(comp.partId)?.bodies[map.local];
    if (!body) return null;
    const want = type === "mate" || type === "flush" ? "plane" : type === "angle" ? "plane" : "axis";
    if (p.kind === "face") {
      const f = body.faces[p.index];
      const g = faceGeo(f, want);
      if (!g) return null;
      return { comp: comp.id, geom: want, ...g, face: { center: f.center, normal: f.normal, type: f.type }, label: `${comp.name} 面` };
    }
    if (p.kind === "edge") {
      const e = body.edges[p.index];
      const g = edgeGeo(e, want, body);
      if (!g) return null;
      return { comp: comp.id, geom: want, ...g, edge: { mid: e.mid, a: e.a, b: e.b, type: e.type }, label: `${comp.name} エッジ` };
    }
    return null;
  }

  pickAllowed(p: Pick, type: AsmConstraintType): boolean {
    const map = this.bodyMap[p.body];
    if (!map) return false;
    const comp = this.doc.components.find((c) => c.id === map.comp)!;
    const body = this.parts.get(comp.partId)?.bodies[map.local];
    if (!body) return false;
    if (p.kind === "face") {
      const t = body.faces[p.index]?.type;
      if (type === "mate" || type === "flush" || type === "angle") return t === "PLANE";
      if (type === "axis") return !!body.faces[p.index]?.axis;
      return false;
    }
    const e = body.edges[p.index];
    if (!e) return false;
    if (type === "insert") return e.type === "CIRCLE" && !!e.axis;
    if (type === "axis") return (e.type === "CIRCLE" && !!e.axis) || e.type === "LINE";
    if (type === "mate" || type === "flush") return e.type === "CIRCLE" && !!e.axis;
    if (type === "angle") return e.type === "LINE";
    return false;
  }

  // ------------------------------------------------------- default tool ---

  readonly tool: ToolHandler = {
    onPointerMove: (e, vp) => {
      if (this.drag) return this.dragMove(e);
      vp.setHover(vp.pick(e));
    },
    onPointerDown: (e, vp) => {
      if (e.button !== 0) return;
      const p = vp.pick(e);
      const comp = p ? this.compOfBody(p.body) : undefined;
      if (!comp) {
        if (!e.shiftKey && !e.ctrlKey) this.select([]);
        return;
      }
      if (e.shiftKey || e.ctrlKey) {
        const s = new Set(this.selected);
        if (s.has(comp.id)) s.delete(comp.id);
        else s.add(comp.id);
        this.select([...s]);
      } else if (!this.selected.has(comp.id)) this.select([comp.id]);
      this.beginDrag(e, comp, p!, this.dragMode);
    },
    onPointerUp: () => this.endDrag(),
    onDblClick: (e, vp) => {
      const p = vp.pick(e);
      const comp = p ? this.compOfBody(p.body) : undefined;
      if (comp) this.app.editAssemblyPart(comp.partId);
    },
    onContextMenu: (e) => {
      this.markingMenu(e.clientX, e.clientY);
      return true;
    },
  };

  dragMode: "move" | "rotate" = "move";
  private drag: { comp: AsmComponent; start: THREE.Vector3; plane: THREE.Plane; base: THREE.Matrix4; snap: string; moved: boolean; x: number; y: number; center: THREE.Vector3; mode: "move" | "rotate" } | null = null;

  private beginDrag(e: PointerEvent, comp: AsmComponent, p: Pick, mode: "move" | "rotate") {
    const vp = this.app.vp;
    const start = new THREE.Vector3(...p.point);
    const n = new THREE.Vector3(0, 0, 1).applyQuaternion(vp.view.quat);
    const box = new THREE.Box3();
    this.bodyMap.forEach((m, i) => m.comp === comp.id && box.expandByObject(vp.bodies[i].mesh));
    this.drag = {
      comp,
      start,
      plane: new THREE.Plane().setFromNormalAndCoplanarPoint(n, start),
      base: m4(comp.matrix),
      snap: this.store.snapshot(),
      moved: false,
      x: e.clientX,
      y: e.clientY,
      center: box.getCenter(new THREE.Vector3()),
      mode,
    };
  }

  private dragMove(e: PointerEvent) {
    const d = this.drag!;
    if (!d.moved && Math.hypot(e.clientX - d.x, e.clientY - d.y) < 4) return;
    if (d.comp.grounded) {
      if (!d.moved) toast("接地されたコンポーネントは移動できません (右クリック → 接地を解除)", "info");
      d.moved = true;
      return;
    }
    d.moved = true;
    const vp = this.app.vp;
    let m: THREE.Matrix4;
    if (d.mode === "move") {
      const hit = vp.ray(e).intersectPlane(d.plane, new THREE.Vector3());
      if (!hit) return;
      const delta = hit.sub(d.start);
      m = new THREE.Matrix4().makeTranslation(delta.x, delta.y, delta.z).multiply(d.base);
    } else {
      const up = new THREE.Vector3(0, 1, 0).applyQuaternion(vp.view.quat);
      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(vp.view.quat);
      const q = new THREE.Quaternion()
        .setFromAxisAngle(up, (e.clientX - d.x) * 0.01)
        .multiply(new THREE.Quaternion().setFromAxisAngle(right, (e.clientY - d.y) * 0.01));
      const c = d.center;
      m = new THREE.Matrix4()
        .makeTranslation(c.x, c.y, c.z)
        .multiply(new THREE.Matrix4().makeRotationFromQuaternion(q))
        .multiply(new THREE.Matrix4().makeTranslation(-c.x, -c.y, -c.z))
        .multiply(d.base);
    }
    this.bodyMap.forEach((bm, i) => bm.comp === d.comp.id && vp.setBodyMatrix(i, m));
    d.comp.matrix = m.toArray();
  }

  private endDrag() {
    const d = this.drag;
    this.drag = null;
    if (!d || !d.moved || d.comp.grounded) return;
    const arr = d.comp.matrix;
    this.store.restore(d.snap, "solve");
    this.store.mutate(d.mode === "move" ? "自由移動" : "自由回転", (doc) => (doc.components.find((c) => c.id === d.comp.id)!.matrix = arr));
  }

  select(ids: string[]) {
    this.selected = new Set(ids);
    this.highlightSelection();
    this.app.browser.render();
    this.app.ribbon.refresh();
  }

  private markingMenu(x: number, y: number) {
    markingMenu(
        x,
        y,
        [
          { label: "配置", icon: "import", action: () => this.placeMenu(x, y) },
          { label: "拘束", icon: "mate", action: () => this.startConstraint() },
          { label: "自由移動", icon: "pan", action: () => this.setDragMode("move") },
          { label: "部品表", icon: "iprops", action: () => this.openBom() },
          { label: "ホーム ビュー", icon: "home", action: () => this.app.homeView() },
          { label: "自由回転", icon: "orbit", action: () => this.setDragMode("rotate") },
          { label: "干渉解析", icon: "intersect", action: () => this.checkInterference() },
          { label: "全体表示", icon: "zoomFit", action: () => this.app.vp.fitAll() },
        ],
        this.selectionMenu(),
    );
  }

  setDragMode(m: "move" | "rotate") {
    this.dragMode = m;
    this.app.status(m === "move" ? "コンポーネントをドラッグして移動します (拘束は次の更新で再適用)" : "コンポーネントをドラッグして回転します");
    this.app.ribbon.refresh();
  }

  // ------------------------------------------------------------ browser ---

  renderBrowser(list: HTMLElement) {
    const doc = this.doc;
    list.innerHTML = "";
    const row = (id: string, ic: string, label: string, depth: number, cls = "", trailing: HTMLElement | null = null, title?: string) => {
      const el = h(
        "div",
        { class: `br-row ${cls}`, style: `--depth:${depth}`, "data-id": id, title },
        h("span", { class: "br-exp-sp" }),
        iconEl(ic),
        h("span", { class: "br-label" }, label),
        trailing,
      );
      list.appendChild(el);
      return el;
    };
    row("__asm", "assembly", doc.name, 0, "root");
    const rel = row("__rel", "folder", `拘束 (${doc.constraints.length})`, 1);
    void rel;
    const values = evaluateParams(doc.params);
    const mats = new Map(doc.components.map((c) => [c.id, m4(c.matrix)]));
    for (const c of doc.constraints) {
      const ma = mats.get(c.a.comp), mb = mats.get(c.b.comp);
      let bad = false;
      if (ma && mb && !c.suppressed) {
        let value = 0;
        try {
          value = evalWith(values, c.offset);
        } catch {
          bad = true;
        }
        bad = bad || constraintResidual(ma, mb, { type: c.type, a: c.a, b: c.b, value, flip: c.flip }) > 1e-3;
      }
      const el = row(
        c.id,
        `c-${c.type}`,
        `${c.name} (${formatNumber(Number(c.offset) || 0, 2) === "0" && !/[a-zA-Z]/.test(c.offset) ? "" : c.offset})`.replace(" ()", ""),
        2,
        [this.selected.has(c.id) ? "selected" : "", c.suppressed ? "suppressed" : "", bad ? "error" : ""].join(" "),
        bad ? h("span", { class: "br-badge err", title: "拘束を満たせません" }, iconEl("error")) : null,
      );
      this.rowEvents(el, c.id, "constraint");
    }
    for (const c of doc.components) {
      const part = doc.parts.find((p) => p.id === c.partId);
      const err = this.parts.get(c.partId)?.error;
      const vis = c.visible !== false;
      const trailing = h(
        "span",
        { class: "br-trail" },
        c.grounded ? h("span", { class: "br-pin", title: "接地" }, iconEl("fix")) : "",
        h(
          "button",
          {
            class: "br-vis icon-btn small",
            title: vis ? "非表示にする" : "表示する",
            onClick: (e: MouseEvent) => {
              e.stopPropagation();
              this.store.mutate("表示切替", (d) => (d.components.find((x) => x.id === c.id)!.visible = !vis));
            },
          },
          iconEl(vis ? "eye" : "eyeOff"),
        ),
      );
      const el = row(
        c.id,
        part?.kind === "step" ? "import" : "part",
        c.name,
        1,
        [this.selected.has(c.id) ? "selected" : "", vis ? "" : "dimmed", err ? "error" : ""].join(" "),
        trailing,
        err,
      );
      this.rowEvents(el, c.id, "component");
    }
  }

  private rowEvents(el: HTMLElement, id: string, kind: "component" | "constraint") {
    el.addEventListener("click", (e) => {
      if (e.shiftKey || e.ctrlKey) {
        const s = new Set(this.selected);
        if (s.has(id)) s.delete(id);
        else s.add(id);
        this.select([...s]);
      } else this.select([id]);
    });
    el.addEventListener("dblclick", () => {
      if (kind === "constraint") this.startConstraint(this.doc.constraints.find((c) => c.id === id));
      else this.app.editAssemblyPart(this.doc.components.find((c) => c.id === id)!.partId);
    });
    el.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      if (!this.selected.has(id)) this.select([id]);
      contextMenu(e.clientX, e.clientY, this.selectionMenu());
    });
  }

  private selectionMenu(): MenuItem[] {
    const comps = this.doc.components.filter((c) => this.selected.has(c.id));
    const cons = this.doc.constraints.filter((c) => this.selected.has(c.id));
    const items: MenuItem[] = [];
    if (comps.length === 1) {
      const c = comps[0];
      items.push(
        { label: "パーツを開いて編集", icon: "edit", action: () => this.app.editAssemblyPart(c.partId) },
        { label: c.grounded ? "接地を解除" : "接地", icon: "fix", action: () => this.store.mutate("接地", (d) => (d.components.find((x) => x.id === c.id)!.grounded = !c.grounded)) },
        { label: "同じパーツをもう 1 つ配置", icon: "plus", action: () => this.placeInstance(c.partId) },
      );
    }
    if (cons.length === 1) {
      const c = cons[0];
      items.push(
        { label: "拘束を編集", icon: "edit", action: () => this.startConstraint(c) },
        { label: c.suppressed ? "抑制を解除" : "抑制", action: () => this.store.mutate("抑制", (d) => (d.constraints.find((x) => x.id === c.id)!.suppressed = !c.suppressed)) },
      );
    }
    if (comps.length || cons.length) items.push({ separator: true, label: "" }, { label: "削除", icon: "trash", shortcut: "Delete", danger: true, action: () => this.deleteSelection() });
    return items;
  }

  async deleteSelection() {
    const ids = new Set(this.selected);
    if (!ids.size) return;
    const comps = this.doc.components.filter((c) => ids.has(c.id));
    if (comps.length && !(await confirmDialog("削除", `${comps.length} 個のコンポーネントと関連する拘束を削除します。`, "削除"))) return;
    this.store.mutate("削除", (d) => {
      d.components = d.components.filter((c) => !ids.has(c.id));
      d.constraints = d.constraints.filter((c) => !ids.has(c.id) && !ids.has(c.a.comp) && !ids.has(c.b.comp));
      const used = new Set(d.components.map((c) => c.partId));
      d.parts = d.parts.filter((p) => used.has(p.id));
      if (d.components.length && !d.components.some((c) => c.grounded)) d.components[0].grounded = true;
    });
    this.select([]);
  }

  // -------------------------------------------------------------- place ---

  placeMenu(x: number, y: number) {
    const items: MenuItem[] = [
      { label: "ファイルから配置… (.3dcp / STEP)", icon: "open", action: () => this.placeFromFile() },
      { label: "現在のパーツ ファイルを配置", icon: "part", disabled: !this.app.store.doc.features.length, action: () => this.placeDocument(structuredClone(this.app.store.doc)) },
      { label: "新しいパーツを作成して配置", icon: "new", action: () => this.createPart() },
    ];
    if (this.doc.parts.length) {
      items.push({ separator: true, label: "" });
      for (const p of this.doc.parts) items.push({ label: `${p.name} をもう 1 つ配置`, icon: p.kind === "step" ? "import" : "part", action: () => this.placeInstance(p.id) });
    }
    contextMenu(x, y, items);
  }

  async placeFromFile() {
    const f = await pickFile(".3dcp,.json,.step,.stp");
    if (!f) return;
    const ext = f.name.split(".").pop()!.toLowerCase();
    try {
      if (ext === "step" || ext === "stp") {
        const id = uid("pt");
        const name = f.name.replace(/\.[^.]+$/, "");
        const step = await f.text();
        this.store.mutate("配置", (d) => d.parts.push({ id, name, kind: "step", step, fileName: f.name }));
        await this.placeInstance(id);
      } else {
        const doc = JSON.parse(await f.text()) as PartDocument;
        if (doc.format !== "3dcad-part") throw new Error("パーツ ファイル (.3dcp) ではありません");
        this.placeDocument(doc);
      }
    } catch (e) {
      toast(`配置できませんでした: ${(e as Error).message}`, "error");
    }
  }

  placeDocument(doc: PartDocument) {
    const id = uid("pt");
    this.store.mutate("配置", (d) => d.parts.push({ id, name: doc.name, kind: "part", doc }));
    void this.placeInstance(id);
  }

  createPart() {
    const n = this.doc.parts.length + 1;
    const doc = newDocument(`パーツ${n}`);
    const id = uid("pt");
    this.store.mutate("パーツを作成", (d) => d.parts.push({ id, name: doc.name, kind: "part", doc }));
    void this.placeInstance(id).then(() => this.app.editAssemblyPart(id));
  }

  /** Adds a component of an existing part next to the current assembly. */
  async placeInstance(partId: string) {
    await this.rebuildParts();
    const part = this.doc.parts.find((p) => p.id === partId)!;
    const box = this.app.vp.modelBounds();
    const pb = new THREE.Box3();
    for (const b of this.parts.get(partId)?.bodies ?? []) pb.union(new THREE.Box3(new THREE.Vector3(...b.bbox[0]), new THREE.Vector3(...b.bbox[1])));
    const first = this.doc.components.length === 0;
    let m = IDENTITY.slice();
    if (!first && !box.isEmpty() && !pb.isEmpty()) {
      const gap = Math.max(10, pb.getSize(new THREE.Vector3()).length() * 0.2);
      m = new THREE.Matrix4().makeTranslation(box.max.x - pb.min.x + gap, 0, 0).toArray();
    }
    const n = this.doc.components.filter((c) => c.partId === partId).length + 1;
    const id = uid("cm");
    this.store.mutate("配置", (d) => d.components.push({ id, name: `${part.name}:${n}`, partId, matrix: m, grounded: first }));
    this.select([id]);
    if (first) setTimeout(() => this.app.vp.fitAll(), 50);
    toast(first ? `${part.name} を配置しました (最初のコンポーネントは接地されます)` : `${part.name} を配置しました — 「拘束」で位置を決めます`, "ok");
  }

  // --------------------------------------------------------- constraint ---

  startConstraint(existing?: AsmConstraint, type: AsmConstraintType = "mate") {
    this.app.cancelAsmCommand();
    if (this.doc.components.length < 2) {
      toast("拘束には 2 つ以上のコンポーネントが必要です", "warn");
      return;
    }
    const cmd = new ConstraintCommand(this, this.app, existing ?? null, existing?.type ?? type);
    this.command = cmd;
    this.app.ribbon.refresh();
  }

  // ---------------------------------------------------------------- BOM ---

  async openBom() {
    const doc = this.doc;
    const rows: HTMLElement[] = [];
    let totalMass = 0;
    let i = 0;
    for (const p of doc.parts) {
      const qty = doc.components.filter((c) => c.partId === p.id).length;
      if (!qty) continue;
      let mp: MassProps | null = null;
      try {
        mp = await this.app.kernel.massPropsKey(key(p.id));
      } catch {
        /* no solid */
      }
      const mat = p.doc?.material ?? MATERIALS[0];
      const mass = mp ? (mp.volume / 1000) * mat.density : 0;
      totalMass += mass * qty;
      rows.push(
        h(
          "tr",
          {},
          h("td", { class: "num" }, String(++i)),
          h("td", {}, p.doc?.iprops["パーツ番号"] || p.name),
          h("td", { class: "num" }, String(qty)),
          h("td", {}, p.kind === "step" ? "(STEP)" : mat.name),
          h("td", { class: "num" }, mass ? `${formatNumber(mass, 2)} g` : "—"),
          h("td", {}, p.doc?.iprops["説明"] ?? ""),
        ),
      );
    }
    const table = h(
      "table",
      { class: "ptable" },
      h("thead", {}, h("tr", {}, h("th", {}, "項目"), h("th", {}, "パーツ番号"), h("th", {}, "数量"), h("th", {}, "材質"), h("th", {}, "単体質量"), h("th", {}, "説明"))),
      h("tbody", {}, ...rows),
    );
    const csv = () => {
      const lines = [["項目", "パーツ番号", "数量", "材質", "単体質量(g)", "説明"].join(",")];
      table.querySelectorAll("tbody tr").forEach((tr) => lines.push([...tr.children].map((td) => `"${(td.textContent ?? "").replace(/ g$/, "")}"`).join(",")));
      download(`${doc.name}_部品表.csv`, "﻿" + lines.join("\n"), "text/csv");
    };
    modal({
      title: `部品表 — ${doc.name}`,
      icon: "iprops",
      width: 760,
      body: h("div", {}, h("div", { class: "ptable-wrap" }, table), h("p", { class: "muted" }, `コンポーネント数 ${doc.components.length} / 総質量 ${formatNumber(totalMass, 2)} g`)),
      buttons: [{ label: "CSV を書き出し", onClick: () => (csv(), false) }, { label: "閉じる", primary: true }],
    });
  }

  async checkInterference() {
    if (this.doc.components.length < 2) {
      toast("2 つ以上のコンポーネントが必要です", "info");
      return;
    }
    this.app.status("干渉を計算中…");
    try {
      const ps = this.placements();
      const comps = this.doc.components.filter((c) => c.visible !== false);
      const hits = await this.app.kernel.interference(ps);
      this.app.status("準備完了");
      if (!hits.length) {
        toast("干渉は検出されませんでした", "ok");
        return;
      }
      this.select([...new Set(hits.flatMap((x) => [comps[x.a].id, comps[x.b].id]))]);
      modal({
        title: "干渉解析",
        icon: "intersect",
        width: 520,
        body: h(
          "table",
          { class: "kv" },
          ...hits.map((x) => h("tr", {}, h("th", {}, `${comps[x.a].name} ⟷ ${comps[x.b].name}`), h("td", {}, `${formatNumber(x.volume, 3)} mm³`))),
        ),
      });
    } catch (e) {
      toast((e as Error).message, "error");
    }
  }

  async exportStep() {
    if (!this.doc.components.length) {
      toast("エクスポートするコンポーネントがありません", "warn");
      return;
    }
    try {
      const buf = await this.app.kernel.exportAssembly("step", this.placements());
      download(`${this.doc.name}.stp`, buf, "application/step");
      toast(`${this.doc.name}.stp をエクスポートしました — Inventor で開けます`, "ok");
    } catch (e) {
      toast((e as Error).message, "error");
    }
  }

  // -------------------------------------------------------------- ribbon ---

  ribbonTab(): RibbonTab {
    const app = this.app;
    const isAsm = () => app.env === "assembly";
    return {
      id: "assemble",
      label: "組立",
      visible: isAsm,
      panels: [
        {
          title: "コンポーネント",
          items: [
            {
              id: "asm-place",
              label: "配置",
              icon: "import",
              shortcut: "P",
              tip: "パーツ (.3dcp) や STEP ファイルをアセンブリに配置します。",
              action: () => {
                const b = document.querySelector('[data-cmd="asm-place"]')!.getBoundingClientRect();
                this.placeMenu(b.left, b.bottom + 2);
              },
            },
            { id: "asm-create", label: "作成", icon: "new", tip: "新しいパーツを作成し、アセンブリ内で編集します。", action: () => this.createPart() },
          ],
        },
        {
          title: "位置",
          items: [
            {
              stack: [
                { id: "asm-move", label: "自由移動", icon: "pan", size: "small", shortcut: "V", action: () => this.setDragMode("move"), active: () => this.dragMode === "move" },
                { id: "asm-rotate", label: "自由回転", icon: "orbit", size: "small", shortcut: "G", action: () => this.setDragMode("rotate"), active: () => this.dragMode === "rotate" },
              ],
            },
          ],
        },
        {
          title: "関係",
          items: [
            { id: "asm-constrain", label: "拘束", icon: "mate", shortcut: "C", tip: "メイト・フラッシュ・挿入・軸・角度でコンポーネントの位置を決めます。", action: () => this.startConstraint(), active: () => this.command?.id === "constraint" },
            {
              stack: [
                { id: "asm-mate", label: "メイト", icon: "c-mate", size: "small", action: () => this.startConstraint(undefined, "mate") },
                { id: "asm-insert", label: "挿入", icon: "c-insert", size: "small", action: () => this.startConstraint(undefined, "insert") },
                { id: "asm-axis", label: "軸合わせ", icon: "c-axis", size: "small", action: () => this.startConstraint(undefined, "axis") },
              ],
            },
          ],
        },
        {
          title: "検査",
          items: [
            { id: "asm-interf", label: "干渉解析", icon: "intersect", tip: "コンポーネント同士の干渉 (重なり) 体積を計算します。", action: () => this.checkInterference() },
            { id: "asm-bom", label: "部品表", icon: "iprops", tip: "部品表 (BOM) を表示し CSV に書き出します。", action: () => this.openBom() },
          ],
        },
        {
          title: "書き出し",
          items: [
            { id: "asm-step", label: "STEP 書き出し", icon: "export", tip: "アセンブリを STEP で書き出します (Inventor で開けます)。", action: () => this.exportStep() },
            { id: "asm-drawing", label: "図面ビュー", icon: "drawing", tip: "アセンブリの 2D 図面ビューを作成します。", action: () => openDrawing(this.app) },
          ],
        },
      ],
    };
  }
}

// ------------------------------------------------------- constraint cmd ---

class ConstraintCommand {
  readonly id = "constraint";
  private panel: PropertyPanel;
  private snap: string;
  private cid: string;
  private step: 0 | 1 | 2 = 0;
  private pickA: ReturnType<PropertyPanel["picker"]>;
  private pickB: ReturnType<PropertyPanel["picker"]>;
  private offsetField: ReturnType<PropertyPanel["expr"]>;
  private a: GeoRef | null = null;
  private b: GeoRef | null = null;

  constructor(
    private env: AssemblyEnv,
    private app: App,
    private existing: AsmConstraint | null,
    private type: AsmConstraintType,
  ) {
    this.snap = env.store.snapshot();
    this.cid = existing?.id ?? uid("ac");
    if (existing) {
      this.a = existing.a;
      this.b = existing.b;
      this.step = 2;
    }
    const p = new PropertyPanel(
      app.panelHost,
      existing ? `拘束を編集: ${existing.name}` : "拘束を指定",
      "mate",
      { onOk: () => this.finish(true), onCancel: () => this.finish(false), onApply: existing ? undefined : () => this.finish(true, true) },
      () => evaluateParams(env.doc.params),
    );
    this.panel = p;
    const t = p.section("タイプ");
    p.toggles(
      t,
      "拘束",
      (Object.keys(TYPE_LABELS) as AsmConstraintType[]).map((k) => ({ value: k, icon: `c-${k}`, title: TYPE_LABELS[k] })),
      type,
      (v) => {
        this.type = v as AsmConstraintType;
        this.a = this.b = null;
        this.step = 0;
        this.offsetField.el.querySelector(".field-label")!.firstChild!.textContent = this.type === "angle" ? "角度" : "オフセット";
        this.preview();
        this.refresh();
      },
    );
    const sel = p.section("選択");
    this.pickA = p.picker(sel, "選択 1", "select", () => ((this.step = 0), this.refresh()), () => ((this.a = null), (this.step = 0), this.refresh()));
    this.pickB = p.picker(sel, "選択 2", "select", () => ((this.step = 1), this.refresh()), () => ((this.b = null), (this.step = this.a ? 1 : 0), this.refresh()));
    const opt = p.section("オプション");
    this.offsetField = p.expr(opt, type === "angle" ? "角度" : "オフセット", existing?.offset ?? (type === "angle" ? "90" : "0"), type === "angle" ? "deg" : "mm", () => this.preview());
    p.checkbox(opt, "反転 (挿入: 整列 / 軸: 逆向き)", existing?.flip ?? false, (v) => {
      this.flip = v;
      this.preview();
    });
    this.flip = existing?.flip ?? false;
    app.vp.pickKinds = new Set(["face", "edge"]);
    app.vp.pickFilter = (pk) => this.app.asm.pickAllowed(pk, this.type) && (this.step !== 1 || !this.a || this.env.bodyMap[pk.body]?.comp !== this.a.comp);
    app.vp.tool = {
      cursor: "crosshair",
      onPointerMove: (e, vp) => vp.setHover(vp.pick(e)),
      onPointerDown: (e, vp) => {
        if (e.button !== 0) return;
        const pk = vp.pick(e);
        if (!pk) return;
        const g = this.env.geoFromPick(pk, this.type);
        if (!g) return;
        if (this.step === 0 || !this.a) {
          this.a = g;
          this.step = 1;
        } else {
          this.b = g;
          this.step = 2;
        }
        this.refresh();
        this.preview();
      },
      onContextMenu: () => {
        this.finish(true);
        return true;
      },
    };
    this.refresh();
  }

  private flip = false;

  private refresh() {
    this.pickA.setCount(this.a ? 1 : 0, this.a?.label ?? "選択してください");
    this.pickB.setCount(this.b ? 1 : 0, this.b?.label ?? "選択してください");
    this.pickA.setActive(this.step === 0);
    this.pickB.setActive(this.step === 1);
    const hints: Record<AsmConstraintType, string> = {
      mate: "向かい合わせる平面 (または円形エッジ) を 2 つ選択",
      flush: "同じ向きに揃える平面を 2 つ選択",
      insert: "穴とピンなどの円形エッジを 2 つ選択",
      axis: "円筒面・円形エッジ・直線エッジの軸を 2 つ選択",
      angle: "角度を指定する平面 (または直線エッジ) を 2 つ選択",
    };
    this.app.status(hints[this.type]);
  }

  /** Writes the constraint into the document (no undo step) and solves. */
  private preview() {
    const env = this.env;
    env.store.restore(this.snap, "solve");
    if (this.a && this.b) {
      const name = this.existing?.name ?? `${TYPE_LABELS[this.type]}:${env.doc.constraints.filter((c) => c.type === this.type).length + 1}`;
      const c: AsmConstraint = { id: this.cid, name, type: this.type, a: this.a, b: this.b, offset: this.offsetField.value() || "0", flip: this.flip };
      env.store.patch((d) => {
        const i = d.constraints.findIndex((x) => x.id === this.cid);
        if (i >= 0) d.constraints[i] = c;
        else d.constraints.push(c);
      }, "solve");
      const rep = env.solve();
      this.panel.setError(rep.ok ? null : "拘束を満たせません (他の拘束と矛盾している可能性があります)");
    }
    env.render();
  }

  private finish(ok: boolean, restart = false) {
    const env = this.env;
    if (ok && (!this.a || !this.b)) {
      if (!this.a && !this.b && !this.existing) ok = false;
      else {
        this.panel.setError("2 つのジオメトリを選択してください");
        return;
      }
    }
    this.panel.close();
    env.command = null;
    this.app.vp.pickFilter = null;
    this.app.vp.tool = env.tool;
    if (ok) {
      const cur = env.store.snapshot();
      env.store.restore(this.snap, "solve");
      env.store.pushHistory(this.snap);
      env.store.restore(cur, "commit");
    } else {
      env.store.restore(this.snap, "cancel");
    }
    this.app.status("準備完了");
    this.app.ribbon.refresh();
    if (restart) env.startConstraint(undefined, this.type);
  }

  ok() {
    this.finish(true);
  }
  cancel() {
    this.finish(false);
  }
}

// ---------------------------------------------------------------- utils ---

function dist(a: Vec3, b: Vec3) {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}
function dot(a: Vec3, b: Vec3) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
function norm(a: Vec3): Vec3 {
  const l = Math.hypot(...a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
}

function faceGeo(f: FaceInfo, want: "plane" | "axis"): { point: Vec3; dir: Vec3 } | null {
  if (want === "plane") return f.type === "PLANE" ? { point: f.center, dir: f.normal } : null;
  return f.axis ? { point: f.axis.origin, dir: f.axis.dir } : null;
}

/** Circular edges use the normal of the planar face they bound (outward). */
function edgeGeo(e: EdgeInfo, want: "plane" | "axis", body: BodyMesh): { point: Vec3; dir: Vec3 } | null {
  if (e.type === "LINE") return want === "axis" ? { point: e.a, dir: norm([e.b[0] - e.a[0], e.b[1] - e.a[1], e.b[2] - e.a[2]]) } : null;
  if (!e.axis) return null;
  let dir = e.axis.dir;
  let best = Infinity;
  for (const f of body.faces) {
    if (f.type !== "PLANE") continue;
    if (Math.abs(Math.abs(dot(f.normal, dir)) - 1) > 1e-6) continue;
    const off = Math.abs(dot([e.axis.origin[0] - f.center[0], e.axis.origin[1] - f.center[1], e.axis.origin[2] - f.center[2]], f.normal));
    if (off > 1e-4) continue;
    const d = dist(f.center, e.axis.origin);
    if (d < best) {
      best = d;
      dir = f.normal;
    }
  }
  return { point: e.axis.origin, dir };
}

const constraintResidual = constraintError;
