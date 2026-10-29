// Assembly viewing controller (段階 2 アセンブリの閲覧): visibility / isolate /
// transparency, colour modes, saved views (表示状態) and the interference
// check runner. The UI lives in src/ui/bomPanel.ts and src/ui/asmViewUi.ts.
import * as THREE from "three";
import type { Vec3 } from "../core/types";
import type { InterferenceExHit } from "../kernel/interferenceK";
import { poolSize } from "../kernel/pool";
import type { Placement } from "../kernel/protocol";
import type { VisualStyle } from "../viewer/viewport";
import { isFastener } from "./bom";
import { assignColors, type ColorAssignment, type ColorMode } from "./colorBy";
import type { AssemblyEnv } from "./env";
import { candidatePairs, exactCheck, finishResults, pairKey, toggleIgnore, type CompBox, type InterferenceOptions, type InterferenceResult } from "./interference";
import { HOME_VIEW_ID, captureView, deleteView, nextViewName, renameView, upsertView, viewState, type DisplayState, type SavedSection, type SavedView } from "./views";

/** Opacity of components drawn transparent. */
export const GHOST_OPACITY = 0.18;
/** Candidate pairs from which the check is split over the worker pool. */
export const POOL_PAIR_THRESHOLD = 48;

type SectionHooks = { sectionPlanes?(): THREE.Plane[]; setSectionPlanes?(p: THREE.Plane[]): void };

export class AsmViewing {
  /** Components drawn see-through. */
  transparent = new Set<string>();
  colorMode: ColorMode = "default";
  colorSeed = 1;
  private assignment: ColorAssignment | null = null;
  /** Called when visibility / colours / views change (panels refresh). */
  readonly listeners = new Set<() => void>();
  /** Last interference results (for the dialog and tests). */
  lastInterference: InterferenceResult[] = [];
  lastInterferenceStats = { candidates: 0, pairs: 0, pooled: false, ms: 0 };

  constructor(readonly env: AssemblyEnv) {}

  private get app() {
    return this.env.app;
  }

  /** A new document was loaded: back to the plain display. */
  reset() {
    this.transparent.clear();
    this.colorMode = "default";
    this.assignment = null;
    this.lastInterference = [];
    this.app.vp.setOverlayMeshes([]);
    this.notify();
  }

  notify() {
    for (const l of this.listeners) l();
  }

  // --------------------------------------------------------------- colour ---

  /** Display colour of a component (colour mode), or undefined for the normal colour. */
  colorOf(compId: string): string | undefined {
    return this.assignment?.colors.get(compId);
  }

  legend(): ColorAssignment["legend"] {
    return this.assignment && this.colorMode !== "default" ? this.assignment.legend : [];
  }

  /** Recomputes the colour assignment (call before render). */
  refreshColors() {
    this.assignment = this.colorMode === "default" ? null : assignColors(this.env.doc, this.colorMode, (p) => this.env.partColor(p), this.colorSeed);
  }

  setColorMode(m: ColorMode, reshuffle = false) {
    if (reshuffle) this.colorSeed++;
    this.colorMode = m;
    this.refreshColors();
    this.env.render();
    this.notify();
  }

  // ---------------------------------------------------------- visibility ---

  /** Applies per-body opacity after the bodies were (re)built. */
  applyDisplay() {
    const op = this.env.bodyMap.map((m) => (this.transparent.has(m.comp) ? GHOST_OPACITY : undefined));
    this.app.vp.setBodyOpacity(op);
  }

  private setHidden(hidden: Set<string>, label: string) {
    const cur = this.env.doc.components;
    if (cur.every((c) => (c.visible === false) === hidden.has(c.id))) return;
    this.env.store.mutate(label, (d) => d.components.forEach((c) => (c.visible = !hidden.has(c.id))));
  }

  hiddenIds(): Set<string> {
    return new Set(this.env.doc.components.filter((c) => c.visible === false).map((c) => c.id));
  }

  hide(ids: string[]) {
    const h = this.hiddenIds();
    ids.forEach((id) => h.add(id));
    this.setHidden(h, "非表示");
    this.notify();
  }

  show(ids: string[]) {
    const h = this.hiddenIds();
    ids.forEach((id) => h.delete(id));
    this.setHidden(h, "表示");
    this.notify();
  }

  /** Only the given components stay visible ("選択のみ表示" / 分離). */
  isolate(ids: string[]) {
    if (!ids.length) return;
    const keep = new Set(ids);
    this.transparent.clear();
    this.setHidden(new Set(this.env.doc.components.filter((c) => !keep.has(c.id)).map((c) => c.id)), "分離");
    this.applyDisplay();
    this.notify();
  }

  /** Everything visible and opaque. */
  showAll() {
    this.transparent.clear();
    this.setHidden(new Set(), "すべて表示");
    this.applyDisplay();
    this.notify();
  }

  /** The given components opaque, every other one see-through. */
  transparentOthers(ids: string[]) {
    const keep = new Set(ids);
    this.transparent = new Set(this.env.doc.components.filter((c) => !keep.has(c.id)).map((c) => c.id));
    this.applyDisplay();
    this.notify();
  }

  setTransparent(ids: string[], on: boolean) {
    ids.forEach((id) => (on ? this.transparent.add(id) : this.transparent.delete(id)));
    this.applyDisplay();
    this.notify();
  }

  clearTransparency() {
    this.transparent.clear();
    this.applyDisplay();
    this.notify();
  }

  /** Components of a type: standard fasteners, imported STEP parts, or all instances of the selected parts. */
  idsOfType(type: "fasteners" | "step" | "sameParts"): string[] {
    const doc = this.env.doc;
    const parts = new Map(doc.parts.map((p) => [p.id, p]));
    const selParts = new Set(doc.components.filter((c) => this.env.selected.has(c.id)).map((c) => c.partId));
    return doc.components
      .filter((c) => {
        const p = parts.get(c.partId);
        if (type === "fasteners") return isFastener(p);
        if (type === "step") return p?.kind === "step";
        return selParts.has(c.partId);
      })
      .map((c) => c.id);
  }

  hideByType(type: "fasteners" | "step" | "sameParts") {
    const ids = this.idsOfType(type);
    if (ids.length) this.hide(ids);
    return ids.length;
  }

  // ---------------------------------------------------------------- views ---

  private sectionPlanes(): SavedSection[] {
    const vp = this.app.vp as typeof this.app.vp & SectionHooks;
    const planes = vp.sectionPlanes?.() ?? (vp.clipPlane ? [vp.clipPlane] : []);
    return planes.map((p) => ({ normal: [p.normal.x, p.normal.y, p.normal.z] as Vec3, constant: p.constant }));
  }

  private applySections(s: SavedSection[]) {
    const vp = this.app.vp as typeof this.app.vp & SectionHooks;
    const planes = s.map((p) => new THREE.Plane(new THREE.Vector3(...p.normal), p.constant));
    if (vp.setSectionPlanes) vp.setSectionPlanes(planes);
    else vp.setSection(planes[0] ?? null);
  }

  /** Current display state. */
  displayState(): DisplayState {
    const vp = this.app.vp;
    const v = vp.anim ? vp.anim.to : vp.view;
    return {
      camera: { target: [v.target.x, v.target.y, v.target.z], quat: [v.quat.x, v.quat.y, v.quat.z, v.quat.w], height: v.height, perspective: vp.perspective },
      hidden: this.hiddenIds(),
      transparent: new Set(this.transparent),
      explode: this.env.explode,
      sections: this.sectionPlanes(),
      style: vp.style,
      colorMode: this.colorMode,
    };
  }

  /** Applies a display state; the camera moves smoothly unless `animate` is false. */
  applyState(s: DisplayState, animate = true, label = "表示状態") {
    const vp = this.app.vp;
    this.transparent = new Set(s.transparent);
    this.colorMode = s.colorMode;
    this.refreshColors();
    this.env.explode = s.explode;
    this.setHidden(s.hidden, label);
    if (vp.style !== s.style) this.app.setStyle(s.style as VisualStyle);
    this.applySections(s.sections);
    if (vp.perspective !== s.camera.perspective) vp.setPerspective(s.camera.perspective);
    const to = { target: new THREE.Vector3(...s.camera.target), quat: new THREE.Quaternion(...s.camera.quat).normalize(), height: s.camera.height };
    if (animate) vp.animateTo(to, 450);
    else {
      vp.anim = null;
      vp.view = to;
      vp.updateCamera();
    }
    this.env.render();
    this.notify();
  }

  views(): SavedView[] {
    return this.env.doc.views ?? [];
  }

  /** Saves the current display state as a new view (or over `id`). */
  saveView(name?: string, id?: string): SavedView {
    const doc = this.env.doc;
    const existing = id ? doc.views?.find((v) => v.id === id) : undefined;
    const v = captureView(id ?? `v${Date.now().toString(36)}${Math.floor(Math.random() * 1e4)}`, name ?? existing?.name ?? nextViewName(doc), this.displayState(), doc.components.map((c) => c.id));
    this.env.store.mutate(existing ? "ビューを更新" : "ビューを保存", (d) => upsertView(d, v));
    this.notify();
    return v;
  }

  renameView(id: string, name: string) {
    this.env.store.mutate("ビューの名前変更", (d) => renameView(d, id, name));
    this.notify();
  }

  deleteView(id: string) {
    this.env.store.mutate("ビューを削除", (d) => deleteView(d, id));
    this.notify();
  }

  recallView(id: string, animate = true): boolean {
    if (id === HOME_VIEW_ID && !this.views().some((v) => v.id === HOME_VIEW_ID)) {
      this.recallHome();
      return true;
    }
    const v = this.views().find((x) => x.id === id);
    if (!v) return false;
    this.applyState(viewState(v, this.env.doc.components.map((c) => c.id)), animate, `ビュー「${v.name}」`);
    return true;
  }

  /** Default home view: everything visible, assembled, isometric fit (unless a home view was saved). */
  recallHome() {
    const saved = this.views().find((v) => v.id === HOME_VIEW_ID);
    if (saved) return void this.recallView(HOME_VIEW_ID);
    this.transparent.clear();
    this.colorMode = "default";
    this.refreshColors();
    this.env.explode = 0;
    this.setHidden(new Set(), "ホーム ビュー");
    this.applySections([]);
    this.env.render();
    this.app.homeView();
    this.notify();
  }

  setHomeFromCurrent() {
    return this.saveView("ホーム", HOME_VIEW_ID);
  }

  // --------------------------------------------------------- interference ---

  /** World bounding boxes of visible components. */
  compBoxes(ids?: Set<string>): CompBox[] {
    const out: CompBox[] = [];
    for (const c of this.env.doc.components) {
      if (c.visible === false || (ids && !ids.has(c.id))) continue;
      const box = new THREE.Box3();
      const m = new THREE.Matrix4().fromArray(c.matrix);
      for (const b of this.env.parts.get(c.partId)?.bodies ?? []) box.union(new THREE.Box3(new THREE.Vector3(...b.bbox[0]), new THREE.Vector3(...b.bbox[1])).applyMatrix4(m));
      if (box.isEmpty()) continue;
      out.push({ id: c.id, min: [box.min.x, box.min.y, box.min.z], max: [box.max.x, box.max.y, box.max.z] });
    }
    return out;
  }

  ignoreList(): string[] {
    return this.env.doc.interferenceIgnore ?? [];
  }

  toggleIgnore(a: string, b: string) {
    const k = pairKey(a, b);
    this.env.store.mutate("干渉の除外", (d) => (d.interferenceIgnore = toggleIgnore(d.interferenceIgnore, k)));
    this.lastInterference = this.lastInterference.map((r) => (pairKey(r.a, r.b) === k ? { ...r, ignored: !r.ignored } : r));
    this.notify();
  }

  /** Runs the check: bounding-box broad phase, then exact booleans (worker pool when many pairs). */
  async runInterference(opts: InterferenceOptions): Promise<InterferenceResult[]> {
    const t0 = performance.now();
    const env = this.env;
    const doc = env.doc;
    const parts = new Map(doc.parts.map((p) => [p.id, p]));
    const comps = doc.components.filter((c) => c.visible !== false && (opts.includeFasteners || !isFastener(parts.get(c.partId))));
    const ids = new Set(comps.map((c) => c.id));
    const pairs = candidatePairs(this.compBoxes(ids), opts.touches ? opts.touchTol : 0, opts.subset);
    const placementOf = new Map<string, Placement>();
    const ps = env.placements();
    doc.components.filter((c) => c.visible !== false).forEach((c, i) => ids.has(c.id) && placementOf.set(c.id, ps[i]));
    const touchTol = opts.touches ? opts.touchTol : 0;
    let pooled = false;
    let hits: Omit<InterferenceResult, "ignored">[] = [];
    if (pairs.length) {
      const pool = pairs.length >= POOL_PAIR_THRESHOLD && poolSize() >= 2 ? env.kernelPool() : null;
      if (pool) {
        pooled = true;
        const built = new WeakMap<object, Set<string>>();
        const partOfKey = new Map(comps.map((c) => [placementOf.get(c.id)!.key, c.partId]));
        hits = await exactCheck(pairs, placementOf, pool.size, (jobs) =>
          pool.runTasks(
            jobs.map((job) => async (w) => {
              let have = built.get(w);
              if (!have) built.set(w, (have = new Set()));
              for (const p of job.placements)
                if (!have.has(p.key)) {
                  await w.rebuildKey(p.key, env.partFeatures(partOfKey.get(p.key)!));
                  have.add(p.key);
                }
              return w.interferenceEx ? w.interferenceEx(job.placements, job.opts) : ([] as InterferenceExHit[]);
            }),
          ),
        { touchTol, mesh: true });
      } else {
        await env.ensureBrep([...new Set(comps.map((c) => c.partId))]);
        hits = await exactCheck(pairs, placementOf, 1, (jobs) => Promise.all(jobs.map((j) => this.app.kernel.interferenceEx(j.placements, j.opts))), { touchTol, mesh: true });
      }
    }
    this.lastInterference = finishResults(hits, this.ignoreList(), opts);
    this.lastInterferenceStats = { candidates: pairs.length, pairs: (ids.size * (ids.size - 1)) / 2, pooled, ms: performance.now() - t0 };
    this.notify();
    return this.lastInterference;
  }

  /** Draws the overlapping volumes (red) of the given results; empty clears. */
  showInterference(results: InterferenceResult[]) {
    this.app.vp.setOverlayMeshes(results.filter((r) => r.mesh && !r.ignored).map((r) => ({ ...r.mesh!, color: "#ff2a2a", opacity: 0.8 })));
  }
}
