import * as THREE from "three";
import type { App } from "../app";
import { openLibrary } from "../library/dialog";
import { MATERIALS, newDocument, uid } from "../core/document";
import { formatNumber } from "../core/expr";
import { evalWith, evaluateParams } from "../core/params";
import { prepareDocument, resolveDocument } from "../core/resolve";
import { Store } from "../core/store";
import type { PartDocument, Vec3 } from "../core/types";
import type { BodyMesh, MassProps, Placement, RFeature } from "../kernel/protocol";
import { confirmDialog, contextMenu, download, h, iconEl, markingMenu, modal, pickFile, toast, type MenuItem } from "../ui/dom";
import { PropertyPanel } from "../ui/panel";
import type { RibbonTab } from "../ui/ribbon";
import type { Pick, ToolHandler } from "../viewer/viewport";
import { lazyCommand, loadLazyCommand } from "../commands/features";
import { analyzeDof, explodeOffsets, type DofReport } from "./motion";
import { startDrive, startExplode } from "./motionUi";
import { patternMatrices, type AsmPattern } from "./pattern";
import { LIGHT_OPEN_COMPONENTS, boxMatrix, hashKey, isolateVisibility, matchesFilter, rebuildOrder, useProxy } from "./largeAsm";
import { idbGet, idbSet } from "../core/idb";
import { KernelClient } from "../kernel/client";
import { KernelPool, poolSize } from "../kernel/pool";
import { constraintError, solveAssembly, type SolverConstraint } from "./solver";
import { RouteManager } from "../routing/ui";
import { edgeGeo, faceGeo, geoFromRef, meshEdgeRef, meshFaceRef } from "./toporef";
import { IDENTITY, newAssembly, type AsmComponent, type AsmConstraint, type AsmConstraintType, type AssemblyDocument, type GeoRef } from "./types";

const PALETTE = ["#c9ced6", "#9fb7d6", "#d8c39a", "#a9c9a4", "#d3a6a6", "#b8a9d6", "#9fd0cf", "#d6b38f"];

const TYPE_LABELS: Record<AsmConstraintType, string> = {
  mate: "メイト",
  flush: "フラッシュ",
  insert: "挿入",
  axis: "軸合わせ",
  angle: "角度",
  rigid: "剛性 (固定)",
  ball: "ボール (点一致)",
};

interface PartCache {
  hash: string;
  bodies: BodyMesh[];
  error?: string;
  /** False when the display mesh came from the cache (lightweight open): the kernel has no B-rep yet. */
  brep?: boolean;
}

/** IndexedDB key of a part's cached display meshes. */
const meshKey = (hash: string) => `asm-mesh:${hashKey(hash)}`;

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
  /** Remaining degrees of freedom after the last solve. */
  dof: DofReport | null = null;
  /** Exploded view factor (0 = assembled) and trail lines. */
  explode = 0;
  trails = true;
  /** Motion study trace path (assembly mm), drawn as a polyline. */
  motionTrace: Vec3[] | null = null;
  private updating: Promise<void> | null = null;
  private pendingUpdate = false;
  /** Part currently opened for editing (in-place). */
  editingPart: string | null = null;
  /** 軽量表示: components not being edited are drawn as bounding boxes, small parts lose their edges when zoomed out. */
  light = false;
  /** パターンの簡略表示: pattern instances drawn as bounding boxes. */
  simplifyPatterns = false;
  /**
   * 軽量表示で開く: parts are shown from cached display meshes and their
   * kernel B-rep is built only when needed (ensureBrep: measure, interference,
   * export, drawings) — set when a large assembly is opened.
   */
  lightOpen = false;
  /** Build independent parts in a pool of kernel workers (engine #3); off = one by one in the main worker. */
  parallel = true;
  private pool: KernelPool | null = null;
  /** Main-kernel B-rep builds in flight (ensureBrep), per part. */
  private brepJobs = new Map<string, Promise<void>>();
  /** Duration of the last part rebuild pass (ms) and how many parts the pool built. */
  lastBuild = { ms: 0, parts: 0, pooled: 0 };
  /** Part rebuild progress while loading (null when idle). */
  loading: { done: number; total: number } | null = null;
  private progressEl: HTMLElement | null = null;
  private lastProgressRender = 0;

  /** Wire / pipe routes (配線・配管). */
  readonly routes: RouteManager = new RouteManager(this);

  constructor(readonly app: App) {
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
    const hashOf = (p: (typeof this.doc.parts)[number]) => (p.kind === "step" ? `step:${p.step?.length}:${p.fileName}` : JSON.stringify([p.doc?.features, p.doc?.params, p.doc?.endOfPart]));
    const todo = rebuildOrder(
      this.doc.parts.map((p) => p.id),
      this.doc.components,
    ).filter((id) => {
      const p = this.doc.parts.find((x) => x.id === id)!;
      return this.parts.get(id)?.hash !== hashOf(p);
    });
    // several parts to build (opening a file): show placeholders and fill in as the kernel finishes
    const progressive = todo.length > 1;
    if (progressive) {
      this.loading = { done: 0, total: todo.length };
      this.showProgress();
      this.render();
    }
    const large = this.doc.components.length >= LIGHT_OPEN_COMPONENTS;
    // lightweight open: fetch every cached display mesh up front (no kernel work)
    const cached = new Map<string, BodyMesh[]>();
    if (this.lightOpen)
      await Promise.all(
        todo.map(async (id) => {
          const p = this.doc.parts.find((x) => x.id === id);
          const c = p && (await idbGet<BodyMesh[]>(meshKey(hashOf(p))).catch(() => undefined));
          if (c?.length) cached.set(id, c);
        }),
      );
    const t0 = performance.now();
    // several distinct parts: build them in parallel in the worker pool (display meshes);
    // the main kernel builds a part's B-rep when an operation needs it (ensureBrep)
    const pooled = new Set<string>();
    const poolIds = todo.filter((id) => !cached.has(id));
    const n = this.parallel && poolIds.length >= 2 ? poolSize() : 0;
    if (n > 0) {
      this.pool ??= new KernelPool(() => new KernelClient(), n);
      const jobs = poolIds.map((id) => ({ id, features: this.partFeatures(id) }));
      const hashes = new Map(poolIds.map((id) => [id, hashOf(this.doc.parts.find((x) => x.id === id)!)]));
      await this.pool.run(jobs, (r) => {
        if (!r.result) return; // failed in the pool: built in the main worker below
        const errs = Object.values(r.result.errors);
        const hash = hashes.get(r.id)!;
        this.parts.set(r.id, { hash, bodies: r.result.bodies, error: errs[0], brep: false });
        if (large && !errs.length && r.result.bodies.length) void idbSet(meshKey(hash), r.result.bodies).catch(() => {});
        pooled.add(r.id);
        if (this.loading) {
          this.loading.done++;
          this.showProgress();
          const now = performance.now();
          if (now - this.lastProgressRender > 150 && this.loading.done < this.loading.total) {
            this.lastProgressRender = now;
            this.render();
          }
        }
      });
    }
    try {
      for (const id of todo) {
        if (pooled.has(id)) continue;
        const p = this.doc.parts.find((x) => x.id === id);
        if (!p) continue;
        const hash = hashOf(p);
        const c = cached.get(id);
        if (c) {
          this.parts.set(p.id, { hash, bodies: c, brep: false });
          if (this.loading) this.loading.done++;
          continue;
        }
        try {
          const res = await this.app.kernel.rebuildKey(key(p.id), this.partFeatures(p.id));
          const errs = Object.values(res.errors);
          this.parts.set(p.id, { hash, bodies: res.bodies, error: errs[0], brep: true });
          if (large && !errs.length && res.bodies.length) void idbSet(meshKey(hash), res.bodies).catch(() => {});
        } catch (e) {
          this.parts.set(p.id, { hash, bodies: [], error: (e as Error).message });
        }
        if (this.loading) {
          this.loading.done++;
          this.showProgress();
          // redraw at most every 150 ms (each redraw rebuilds the scene graph)
          const now = performance.now();
          if (now - this.lastProgressRender > 150 && this.loading.done < this.loading.total) {
            this.lastProgressRender = now;
            this.render();
          }
        }
      }
    } finally {
      if (todo.length) this.lastBuild = { ms: performance.now() - t0, parts: todo.length, pooled: pooled.size };
      if (progressive) {
        this.loading = null;
        this.showProgress();
      }
    }
    // normal open: load the B-rep of pool-built parts in the background
    if (pooled.size && !this.lightOpen) void this.ensureBrep([...pooled], true).catch(() => {});
  }

  /**
   * Builds the kernel B-rep of parts opened from cached display meshes
   * (lightweight open). Call before any kernel operation on placements.
   */
  async ensureBrep(partIds?: string[], quiet = false) {
    const want = new Set(partIds ?? this.doc.components.filter((c) => c.visible !== false).map((c) => c.partId));
    const todo = [...this.parts].filter(([id, c]) => want.has(id) && c.brep === false);
    if (!todo.length) return;
    let i = 0;
    for (const [id, c] of todo) {
      if (!quiet) this.app.status(`詳細形状を読み込み中… ${++i} / ${todo.length}`);
      // one build per part even when several callers ask at once (background load + an operation)
      let job = this.brepJobs.get(id);
      if (!job) {
        job = (async () => {
          try {
            // the display keeps the cached mesh (same tessellation); only the kernel state is new
            await this.app.kernel.rebuildKey(key(id), this.partFeatures(id));
            c.brep = true;
          } catch (e) {
            c.error = (e as Error).message;
          }
        })().finally(() => this.brepJobs.delete(id));
        this.brepJobs.set(id, job);
      }
      await job;
    }
    if (!quiet) this.app.status("準備完了");
  }

  /** Parts shown from cached display meshes (B-rep not loaded yet). */
  lightParts(): string[] {
    return [...this.parts].filter(([, c]) => c.brep === false).map(([id]) => id);
  }

  /** Progress indicator over the viewport while parts rebuild. */
  private showProgress() {
    const l = this.loading;
    if (!l) {
      this.progressEl?.remove();
      this.progressEl = null;
      return;
    }
    if (!this.progressEl) {
      this.progressEl = h(
        "div",
        { class: "asm-progress", role: "progressbar", style: "position:absolute;left:50%;top:12px;transform:translateX(-50%);z-index:5;background:var(--panel-bg,#fff);color:inherit;border:1px solid rgba(127,127,127,.35);border-radius:6px;padding:6px 12px;font-size:12px;box-shadow:0 2px 8px rgba(0,0,0,.15);min-width:220px;pointer-events:none" },
        h("div", { class: "asm-progress-text" }),
        h("div", { style: "height:4px;background:rgba(127,127,127,.25);border-radius:2px;margin-top:4px;overflow:hidden" }, h("div", { class: "asm-progress-bar", style: "height:100%;width:0;background:#1f8fff;transition:width .15s" })),
      );
      this.app.vp.el.appendChild(this.progressEl);
    }
    this.progressEl.setAttribute("aria-valuenow", String(l.done));
    this.progressEl.setAttribute("aria-valuemax", String(l.total));
    this.progressEl.querySelector(".asm-progress-text")!.textContent = `パーツを読み込み中… ${l.done} / ${l.total}`;
    (this.progressEl.querySelector(".asm-progress-bar") as HTMLElement).style.width = `${(100 * l.done) / Math.max(1, l.total)}%`;
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
        const r = geoFromRef(g, cache.bodies);
        if (r && (dist(r.point, g.point) > 1e-9 || dist(r.dir, g.dir) > 1e-9)) {
          g.point = r.point;
          g.dir = r.dir;
          changed = true;
        }
        // migrate references saved before topology names existed
        const topo = g.face ?? g.edge;
        if (r?.name && topo && topo.name !== r.name) {
          topo.name = r.name;
          changed = true;
        }
      }
    if (changed) this.store.patch((d) => (d.constraints = next), "solve");
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
        return { type: c.type, a: c.a, b: c.b, value, flip: c.flip, rel: c.rel };
      });
  }

  /** Solve all constraints and store the resulting placements (no undo step). */
  solve() {
    const doc = this.doc;
    const mats = new Map(doc.components.map((c) => [c.id, m4(c.matrix)]));
    const fixed = new Set(doc.components.filter((c) => c.grounded || c.patternOf).map((c) => c.id));
    // pattern instances follow their source; constraints to an instance see its current position
    const follow = () => {
      for (const pt of doc.patterns ?? []) {
        const src = mats.get(pt.source);
        if (!src) continue;
        const ms = patternMatrices(pt, src.toArray());
        for (const c of doc.components) if (c.patternOf?.pattern === pt.id && ms[c.patternOf.index]) mats.set(c.id, m4(ms[c.patternOf.index]));
      }
    };
    follow();
    let rep = solveAssembly(mats, fixed, this.solverConstraints());
    if (doc.patterns?.length) {
      // the source may have moved: re-place the instances and settle the components attached to them
      for (let k = 0; k < 5; k++) {
        follow();
        rep = solveAssembly(mats, fixed, this.solverConstraints());
        if (rep.iterations <= 1) break;
      }
      follow();
    }
    this.solveError = rep.ok ? 0 : rep.error;
    let changed = false;
    const next = doc.components.map((c) => {
      const arr = mats.get(c.id)!.toArray();
      if (arr.some((v, i) => Math.abs(v - c.matrix[i]) > 1e-9)) changed = true;
      return { ...c, matrix: arr };
    });
    if (changed) this.store.patch((d) => (d.components = next), "solve");
    try {
      this.dof = analyzeDof(this.doc.components.map((c) => ({ ...c, grounded: c.grounded || !!c.patternOf })), this.solverConstraints());
    } catch {
      this.dof = null;
    }
    return rep;
  }

  /** Status bar text for the assembly DOF (Inventor: 自由度). */
  dofText(): { text: string; cls: string } {
    if (this.solveError) return { text: "⚠ 拘束を満たせません", cls: "bad" };
    if (!this.dof) return { text: "", cls: "" };
    const free = this.doc.components.filter((c) => (this.dof!.perComp.get(c.id)?.dof ?? 0) > 0).length;
    return this.dof.total === 0 ? { text: "✓ 全コンポーネント完全拘束", cls: "ok" } : { text: `自由度 ${this.dof.total} (未拘束 ${free} 個)`, cls: "" };
  }

  /** World bounding box centre / size of a component (for exploded views). */
  compBox(c: AsmComponent): { center: Vec3; size: number } {
    const box = new THREE.Box3();
    const m = m4(c.matrix);
    for (const b of this.parts.get(c.partId)?.bodies ?? []) box.union(new THREE.Box3(new THREE.Vector3(...b.bbox[0]), new THREE.Vector3(...b.bbox[1])).applyMatrix4(m));
    if (box.isEmpty()) return { center: [c.matrix[12], c.matrix[13], c.matrix[14]], size: 1 };
    const ctr = box.getCenter(new THREE.Vector3());
    return { center: [ctr.x, ctr.y, ctr.z], size: box.getSize(new THREE.Vector3()).length() };
  }

  /** Visible bodies in assembly coordinates (same order as the viewport bodies), with their materials. */
  worldBodies(): { mesh: BodyMesh; material: { name: string; density: number }; name: string }[] {
    const out: { mesh: BodyMesh; material: { name: string; density: number }; name: string }[] = [];
    for (const c of this.doc.components) {
      if (c.visible === false) continue;
      const cache = this.parts.get(c.partId);
      if (!cache) continue;
      const part = this.doc.parts.find((p) => p.id === c.partId);
      const material = part?.doc?.material ?? MATERIALS[1];
      const m = m4(c.matrix);
      const nm = new THREE.Matrix3().getNormalMatrix(m);
      const v = new THREE.Vector3();
      for (const b of cache.bodies) {
        const positions = new Float32Array(b.positions.length), normals = new Float32Array(b.normals.length);
        for (let i = 0; i < b.positions.length; i += 3) {
          v.set(b.positions[i], b.positions[i + 1], b.positions[i + 2]).applyMatrix4(m);
          positions.set([v.x, v.y, v.z], i);
          v.set(b.normals[i], b.normals[i + 1], b.normals[i + 2]).applyMatrix3(nm).normalize();
          normals.set([v.x, v.y, v.z], i);
        }
        const faces = b.faces.map((f) => {
          const c3 = new THREE.Vector3(...f.center).applyMatrix4(m), n3 = new THREE.Vector3(...f.normal).applyMatrix3(nm).normalize();
          return { ...f, center: [c3.x, c3.y, c3.z] as Vec3, normal: [n3.x, n3.y, n3.z] as Vec3 };
        });
        out.push({ mesh: { ...b, positions, normals, faces }, material: { name: material.name, density: material.density }, name: c.name });
      }
    }
    return out;
  }

  /** Display offsets of the exploded view. */
  explodeMap(): Map<string, Vec3> {
    if (!this.explode) return new Map();
    const comps = this.doc.components.map((c) => ({ id: c.id, matrix: c.matrix, grounded: c.grounded, ...this.compBox(c) }));
    return explodeOffsets(comps, this.solverConstraints(), this.explode);
  }

  render() {
    const vp = this.app.vp;
    const bodies: BodyMesh[] = [];
    const colors: (string | undefined)[] = [];
    const mats: THREE.Matrix4[] = [];
    this.bodyMap = [];
    const ex = this.explodeMap();
    const trails: [Vec3, Vec3][] = [];
    const placeholders: { matrix: number[]; color?: string }[] = [];
    this.doc.components.forEach((c) => {
      if (c.visible === false) return;
      const cache = this.parts.get(c.partId);
      if (!cache) {
        // not built yet: a placeholder box at the component origin
        placeholders.push({ matrix: m4(c.matrix).multiply(m4(boxMatrix([-10, -10, -10], [10, 10, 10]))).toArray(), color: "#b8c0cc" });
        return;
      }
      const color = this.partColor(c.partId);
      const off = ex.get(c.id);
      const m = m4(c.matrix);
      if (off && Math.hypot(...off) > 1e-9) {
        m.premultiply(new THREE.Matrix4().makeTranslation(off[0], off[1], off[2]));
        const ctr = this.compBox(c).center;
        if (this.trails) trails.push([ctr, [ctr[0] + off[0], ctr[1] + off[1], ctr[2] + off[2]]]);
      }
      cache.bodies.forEach((b, i) => {
        bodies.push(b);
        colors.push(color);
        mats.push(m.clone());
        this.bodyMap.push({ comp: c.id, local: i });
      });
    });
    vp.setBodies(bodies, undefined, colors, mats);
    this.placeholders = placeholders;
    this.applyLight();
    if (this.motionTrace) for (let i = 1; i < this.motionTrace.length; i++) trails.push([this.motionTrace[i - 1], this.motionTrace[i]]);
    vp.setTrails(trails);
    this.routes.render();
    this.highlightSelection();
    this.app.refreshUI();
  }

  private placeholders: { matrix: number[]; color?: string }[] = [];

  /** Lightweight display / simplified patterns: box proxies for components not being edited. */
  applyLight() {
    const vp = this.app.vp;
    const opts = { light: this.light, simplifyPatterns: this.simplifyPatterns };
    const comps = new Map(this.doc.components.map((c) => [c.id, c]));
    const proxied = new Set<number>();
    const boxes = [...this.placeholders];
    this.bodyMap.forEach((bm, i) => {
      const c = comps.get(bm.comp);
      if (!c || !useProxy(opts, c, this.selected)) return;
      proxied.add(i);
      const b = this.parts.get(c.partId)?.bodies[bm.local];
      const v = vp.bodies[i];
      if (!b || !v) return;
      const m = (v.matrix ?? new THREE.Matrix4()).clone().multiply(m4(boxMatrix(b.bbox[0], b.bbox[1])));
      boxes.push({ matrix: m.toArray(), color: this.partColor(c.partId) });
    });
    vp.setBodyProxied(proxied);
    vp.setProxyBoxes(boxes);
    vp.edgeCullPx = this.light ? 12 : 0;
    vp.invalidate();
  }

  setLight(on: boolean) {
    this.light = on;
    this.applyLight();
    this.app.ribbon.refresh();
    this.app.status(on ? "軽量表示: 選択していないコンポーネントを境界ボックスで表示します (選択すると詳細表示)" : "準備完了");
  }

  setSimplifyPatterns(on: boolean) {
    this.simplifyPatterns = on;
    this.applyLight();
    this.app.ribbon.refresh();
  }

  /** Hide / show the given components (one undo step). */
  setVisible(ids: string[], on: boolean) {
    const set = new Set(ids);
    if (!set.size) return;
    this.store.mutate(on ? "表示" : "非表示", (d) => d.components.forEach((c) => set.has(c.id) && (c.visible = on)));
  }

  /** Isolate: only the selected components stay visible. */
  isolateSelection() {
    const sel = new Set(this.doc.components.filter((c) => this.selected.has(c.id)).map((c) => c.id));
    if (!sel.size) return void toast("分離するコンポーネントを選択してください", "warn");
    const vis = isolateVisibility(this.doc.components.map((c) => c.id), sel);
    this.store.mutate("分離", (d) => d.components.forEach((c) => (c.visible = vis.get(c.id)!)));
  }

  showAll() {
    this.store.mutate("すべて表示", (d) => d.components.forEach((c) => (c.visible = true)));
  }

  partColor(partId: string): string {
    const p = this.doc.parts.find((x) => x.id === partId);
    if (p?.color) return p.color;
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
    return this.doc.components
      .filter((c) => c.visible !== false)
      .map((c) => ({ key: key(c.partId), matrix: c.matrix, name: c.name, part: this.doc.parts.find((p) => p.id === c.partId)?.name, color: this.partColor(c.partId) }));
  }

  // ------------------------------------------------------------ picking ---

  /** Converts a viewport pick into part-local constraint geometry. */
  geoFromPick(p: Pick, type: AsmConstraintType): GeoRef | null {
    const map = this.bodyMap[p.body];
    if (!map) return null;
    const comp = this.doc.components.find((c) => c.id === map.comp)!;
    const body = this.parts.get(comp.partId)?.bodies[map.local];
    if (!body) return null;
    if (type === "rigid" || type === "ball") {
      // a point on the component: circle centre, sphere / cylinder axis point, or face centre
      if (p.kind === "edge") {
        const e = body.edges[p.index];
        const pt = e.axis ? e.axis.origin : e.mid;
        return { comp: comp.id, geom: "axis", point: pt, dir: e.axis?.dir ?? [0, 0, 1], edge: meshEdgeRef(body, p.index), label: `${comp.name} ${e.axis ? "円の中心" : "エッジ"}` };
      }
      const f = body.faces[p.index];
      const pt = f.type === "SPHERE" && f.axis ? f.axis.origin : f.center;
      return { comp: comp.id, geom: "plane", point: pt, dir: f.normal, face: meshFaceRef(body, p.index), label: `${comp.name} ${f.type === "SPHERE" ? "球の中心" : "面"}` };
    }
    const want = type === "mate" || type === "flush" ? "plane" : type === "angle" ? "plane" : "axis";
    if (p.kind === "face") {
      const f = body.faces[p.index];
      const g = faceGeo(f, want);
      if (!g) return null;
      return { comp: comp.id, geom: want, ...g, face: meshFaceRef(body, p.index), label: `${comp.name} 面` };
    }
    if (p.kind === "edge") {
      const e = body.edges[p.index];
      const g = edgeGeo(e, want, body);
      if (!g) return null;
      return { comp: comp.id, geom: want, ...g, edge: meshEdgeRef(body, p.index), label: `${comp.name} エッジ` };
    }
    return null;
  }

  pickAllowed(p: Pick, type: AsmConstraintType): boolean {
    const map = this.bodyMap[p.body];
    if (!map) return false;
    const comp = this.doc.components.find((c) => c.id === map.comp)!;
    const body = this.parts.get(comp.partId)?.bodies[map.local];
    if (!body) return false;
    if (type === "rigid") return true;
    if (type === "ball") return p.kind === "face" || (body.edges[p.index]?.type === "CIRCLE" && !!body.edges[p.index]?.axis);
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
    if (this.light || this.simplifyPatterns) this.applyLight();
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
    const q = this.app.browser.query;
    let shown = 0;
    for (const c of doc.components) {
      const part = doc.parts.find((p) => p.id === c.partId);
      if (!matchesFilter(q, c.name, part?.name, part?.doc?.iprops?.["パーツ番号"])) continue;
      if (++shown > 2000) {
        if (shown === 2001) row("__more", "dot", `… 他 ${doc.components.length - 2000} 個 (検索で絞り込み)`, 1, "dimmed");
        continue;
      }
      const err = this.parts.get(c.partId)?.error;
      const vis = c.visible !== false;
      const df = this.dof?.perComp.get(c.id);
      const trailing = h(
        "span",
        { class: "br-trail" },
        c.grounded ? h("span", { class: "br-pin", title: "接地" }, iconEl("fix")) : "",
        df && df.dof > 0 ? h("span", { class: "br-dof", title: `残りの自由度: 並進 ${df.trans} / 回転 ${df.rot}` }, `${df.dof}`) : "",
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
    this.routes.renderBrowser(list);
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
        { label: "拘束を駆動…", icon: "play", action: () => startDrive(this, c.id) },
        { label: c.suppressed ? "抑制を解除" : "抑制", action: () => this.store.mutate("抑制", (d) => (d.constraints.find((x) => x.id === c.id)!.suppressed = !c.suppressed)) },
      );
    }
    if (comps.length) {
      const anyHidden = comps.some((c) => c.visible === false);
      items.push(
        { separator: true, label: "" },
        anyHidden ? { label: "表示", icon: "eye", action: () => this.setVisible(comps.map((c) => c.id), true) } : { label: "非表示", icon: "eyeOff", action: () => this.setVisible(comps.map((c) => c.id), false) },
        { label: "分離 (他を非表示)", icon: "eye", action: () => this.isolateSelection() },
      );
    }
    if (this.doc.components.some((c) => c.visible === false)) items.push({ label: "すべて表示", icon: "eye", action: () => this.showAll() });
    if (comps.length || cons.length) items.push({ separator: true, label: "" }, { label: "削除", icon: "trash", shortcut: "Delete", danger: true, action: () => this.deleteSelection() });
    return items;
  }

  async deleteSelection() {
    const ids = new Set(this.selected);
    if (!ids.size) return;
    const comps = this.doc.components.filter((c) => ids.has(c.id));
    if (comps.length && !(await confirmDialog("削除", `${comps.length} 個のコンポーネントと関連する拘束を削除します。`, "削除"))) return;
    this.store.mutate("削除", (d) => {
      // deleting a pattern source removes the pattern and its instances
      for (const pt of d.patterns ?? []) if (ids.has(pt.source)) for (const c of d.components) if (c.patternOf?.pattern === pt.id) ids.add(c.id);
      d.patterns = (d.patterns ?? []).filter((pt) => !ids.has(pt.source));
      d.components = d.components.filter((c) => !ids.has(c.id));
      d.constraints = d.constraints.filter((c) => !ids.has(c.id) && !ids.has(c.a.comp) && !ids.has(c.b.comp));
      const used = new Set(d.components.map((c) => c.partId));
      d.parts = d.parts.filter((p) => used.has(p.id));
      if (d.components.length && !d.components.some((c) => c.grounded)) d.components[0].grounded = true;
    });
    this.select([]);
  }

  /** Component pattern (rectangular / circular) of the selected component. */
  patternDialog(existing?: AsmPattern) {
    const src = existing ? this.doc.components.find((c) => c.id === existing.source) : this.doc.components.find((c) => this.selected.has(c.id) && !c.patternOf);
    if (!src) return void toast("パターン化するコンポーネントを選択してください", "warn");
    const AX: Record<string, Vec3> = { X: [1, 0, 0], Y: [0, 1, 0], Z: [0, 0, 1] };
    const axName = (v?: Vec3) => (v ? (Object.keys(AX).find((k) => AX[k].every((x, i) => Math.abs(x - v[i]) < 1e-9)) ?? "X") : "X");
    const p: AsmPattern = existing ? JSON.parse(JSON.stringify(existing)) : { id: uid("pt"), name: `パターン${(this.doc.patterns?.length ?? 0) + 1}`, source: src.id, kind: "rect", dir1: [1, 0, 0], count1: 3, spacing1: 30, dir2: [0, 1, 0], count2: 1, spacing2: 30, axisPoint: [0, 0, 0], axisDir: [0, 0, 1], count: 6, angle: 360 };
    const sel = (opts: [string, string][], v: string, on: (v: string) => void) => {
      const s = h("select", { class: "field-input" }, ...opts.map(([k, l]) => h("option", { value: k, selected: k === v }, l)));
      s.addEventListener("change", () => on(s.value));
      return s;
    };
    const num = (v: number, on: (v: number) => void) => {
      const i = h("input", { class: "field-input", value: String(v) });
      i.addEventListener("change", () => on(Number(i.value)));
      return i;
    };
    const row = (label: string, el: HTMLElement) => h("label", { class: "field" }, h("span", {}, label), el);
    const axes: [string, string][] = [["X", "X 軸方向"], ["Y", "Y 軸方向"], ["Z", "Z 軸方向"]];
    const rect = h("div", {}, row("方向 1", sel(axes, axName(p.dir1), (v) => (p.dir1 = AX[v]))), row("個数 1", num(p.count1, (v) => (p.count1 = v))), row("間隔 1 (mm)", num(p.spacing1, (v) => (p.spacing1 = v))), row("方向 2", sel(axes, axName(p.dir2), (v) => (p.dir2 = AX[v]))), row("個数 2", num(p.count2 ?? 1, (v) => (p.count2 = v))), row("間隔 2 (mm)", num(p.spacing2 ?? 0, (v) => (p.spacing2 = v))));
    const ctr = this.compBox(src).center;
    const circ = h(
      "div",
      {},
      row("回転軸", sel(axes, axName(p.axisDir), (v) => (p.axisDir = AX[v]))),
      row("軸の通過点 X, Y, Z", (() => {
        const i = h("input", { class: "field-input", value: (p.axisPoint ?? [0, 0, 0]).map((x) => formatNumber(x, 3)).join(", ") });
        i.addEventListener("change", () => (p.axisPoint = i.value.split(/[,\s]+/).map(Number).slice(0, 3) as Vec3));
        return i;
      })()),
      row("個数", num(p.count ?? 6, (v) => (p.count = v))),
      row("角度 (360 = 全周)", num(p.angle ?? 360, (v) => (p.angle = v))),
      h("p", { class: "muted" }, `元のコンポーネントの中心: ${ctr.map((x) => formatNumber(x, 1)).join(", ")}`),
    );
    const show = () => {
      rect.style.display = p.kind === "rect" ? "" : "none";
      circ.style.display = p.kind === "circ" ? "" : "none";
    };
    const body = h("div", { class: "form-grid" }, row("種類", sel([["rect", "矩形状"], ["circ", "円形状"]], p.kind, (v) => ((p.kind = v as "rect" | "circ"), show()))), rect, circ, h("p", { class: "muted" }, `元: ${src.name}。コピーは元のコンポーネントに追従します (元を動かす・拘束すると全体が移動)。`));
    show();
    modal({
      title: existing ? `パターンを編集: ${p.name}` : "コンポーネント パターン",
      icon: "rectPattern",
      body,
      buttons: [
        { label: "キャンセル" },
        {
          label: "OK",
          primary: true,
          onClick: () => {
            const ms = patternMatrices(p, src.matrix);
            if (!ms.length) return void toast("個数を 2 以上にしてください", "warn");
            if (ms.length > 500) return void toast("コピーが多すぎます (500 個まで)", "warn");
            this.store.mutate(existing ? "パターンを編集" : "コンポーネント パターン", (d) => {
              d.patterns = [...(d.patterns ?? []).filter((x) => x.id !== p.id), p];
              // keep instance ids by index (constraints / drawings referring to them survive an edit)
              const old = new Map(d.components.filter((c) => c.patternOf?.pattern === p.id).map((c) => [c.patternOf!.index, c]));
              const removed = new Set([...old.values()].filter((c) => c.patternOf!.index >= ms.length).map((c) => c.id));
              d.components = d.components.filter((c) => c.patternOf?.pattern !== p.id);
              ms.forEach((m, i) => {
                const prev = old.get(i);
                d.components.push({ id: prev?.id ?? uid("c"), name: prev?.name ?? `${src.name}:${i + 2}`, partId: src.partId, matrix: m, grounded: false, visible: prev?.visible, patternOf: { pattern: p.id, index: i } });
              });
              d.constraints = d.constraints.filter((c) => !removed.has(c.a.comp) && !removed.has(c.b.comp));
            });
            this.solve();
            this.render();
            toast(`${ms.length} 個のコピーを配置しました`, "ok");
          },
        },
      ],
    });
  }

  // -------------------------------------------------------------- place ---

  placeMenu(x: number, y: number) {
    const items: MenuItem[] = [
      { label: "ファイルから配置… (.3dcp / STEP)", icon: "open", action: () => this.placeFromFile() },
      { label: "現在のパーツ ファイルを配置", icon: "part", disabled: !this.app.store.doc.features.length, action: () => this.placeDocument(structuredClone(this.app.store.doc)) },
      { label: "新しいパーツを作成して配置", icon: "new", action: () => this.createPart() },
      { label: "標準部品から配置… (ボルト・ナット・座金・ピン・軸受)", icon: "library", action: () => openLibrary(this.app) },
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
        await this.importStep(f.name, await f.text());
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

  /**
   * STEP into the assembly: a file with an assembly structure becomes one part
   * per product (name and colour kept) and its instances at their placements;
   * a single part is placed like before.
   */
  async importStep(fileName: string, text: string) {
    const base = fileName.replace(/\.[^.]+$/, "");
    let res: Awaited<ReturnType<App["kernel"]["stepAssembly"]>> | null = null;
    try {
      res = await this.app.kernel.stepAssembly(text);
    } catch {
      res = null;
    }
    if (!res || res.comps.length <= 1) {
      const id = uid("pt");
      this.store.mutate("配置", (d) => d.parts.push({ id, name: res?.parts[0]?.name || base, kind: "step", step: text, fileName, color: res?.parts[0]?.color }));
      await this.placeInstance(id);
      return;
    }
    const r = res;
    const ids = r.parts.map(() => uid("pt"));
    const first = this.doc.components.length === 0;
    this.store.mutate("STEP アセンブリを配置", (d) => {
      r.parts.forEach((p, i) => d.parts.push({ id: ids[i], name: p.name, kind: "step", step: p.step, fileName, color: p.color }));
      // instances inside sub-assemblies keep their path in the name (the assembly itself is flat)
      const nameOf = (c: (typeof r.comps)[number]) => (c.path && c.path.length > 2 ? c.path.slice(1).join(" / ") : c.name);
      r.comps.forEach((c, i) => d.components.push({ id: uid("cm"), name: nameOf(c), partId: ids[c.part], matrix: c.matrix, grounded: first && i === 0 }));
    });
    setTimeout(() => this.app.vp.fitAll(), 50);
    toast(`${fileName}: 部品 ${r.parts.length} 種類・コンポーネント ${r.comps.length} 個を配置しました (名前・色・位置を読み込み)`, "ok");
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
    if (this.explode) {
      // constraints are picked on the assembled positions
      this.explode = 0;
      this.render();
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
        await this.ensureBrep([p.id]);
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
    rows.push(...this.routes.bomRows(i));
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
      await this.ensureBrep();
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
      const withRoutes = this.routes.hasRoutes() && (await this.routes.ensureBuilt()) > 0;
      await this.ensureBrep();
      const buf = await this.app.kernel.exportAssembly("step", this.placements(), withRoutes, this.doc.name);
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
            { id: "asm-pattern", label: "パターン", icon: "rectPattern", tip: "選択したコンポーネントを矩形状 / 円形状に並べます (元に追従)。", action: () => this.patternDialog() },
            { id: "asm-library", label: "標準部品", icon: "library", tip: "ボルト・ナット・座金・ピン・軸受を規格寸法で配置します (コンテンツ センター)。", action: () => openLibrary(this.app) },
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
          title: "モーション",
          items: [
            {
              id: "asm-drive",
              label: "拘束を駆動",
              icon: "play",
              tip: "角度 / オフセット拘束の値を連続的に変化させて機構の動きを確認します (干渉で停止できます)。",
              action: () => startDrive(this, [...this.selected].find((id) => this.doc.constraints.some((c) => c.id === id))),
              active: () => this.command?.id === "drive",
            },
            {
              id: "asm-analysis",
              label: "構造解析",
              icon: "stress",
              tip: "アセンブリを部品同士接着として応力・固有値・座屈解析します (部品ごとの材料を反映)。",
              action: () => {
                this.app.cancelAsmCommand();
                if (this.explode) (this.explode = 0), this.render();
                const ready = lazyCommand("stress", this.app);
                if (ready) this.app.startCommand(ready);
                else void loadLazyCommand("stress").then(() => this.app.startCommand(lazyCommand("stress", this.app)!));
              },
            },
            { id: "asm-explode", label: "分解", icon: "explode", tip: "コンポーネントを拘束の軸方向に分解して表示します (プレゼンテーション)。", action: () => startExplode(this), active: () => this.command?.id === "explode" || this.explode > 0 },
          ],
        },
        {
          title: "表示",
          items: [
            { id: "asm-light", label: "軽量表示", icon: "box", tip: "選択していない (編集中でない) コンポーネントを境界ボックスで表示し、縮小時は小さい部品のエッジを省略します (大規模アセンブリ)。", action: () => this.setLight(!this.light), active: () => this.light },
            {
              stack: [
                { id: "asm-simplify", label: "パターンの簡略表示", icon: "rectPattern", size: "small", tip: "パターン インスタンス (サブアセンブリ相当) を境界ボックスで表示します。", action: () => this.setSimplifyPatterns(!this.simplifyPatterns), active: () => this.simplifyPatterns },
                { id: "asm-isolate", label: "分離", icon: "eye", size: "small", tip: "選択したコンポーネント以外を非表示にします。", action: () => this.isolateSelection() },
                { id: "asm-showall", label: "すべて表示", icon: "eyeOff", size: "small", tip: "非表示のコンポーネントをすべて表示します。", action: () => this.showAll() },
              ],
            },
          ],
        },
        {
          title: "検査",
          items: [
            { id: "asm-interf", label: "干渉解析", icon: "intersect", tip: "コンポーネント同士の干渉 (重なり) 体積を計算します。", action: () => this.checkInterference() },
            { id: "asm-route", label: "配線・配管", icon: "sweep", tip: "電線・ケーブル / ホース / パイプの経路を部品の面・円の中心・コネクタ点で定義し、曲げ R 付きのチューブを作成します (長さ・曲げ・干渉チェック、切断リスト)。", action: () => this.routes.open(), active: () => this.command?.id === "routes" || this.command?.id === "route" },
            { id: "asm-bom", label: "部品表", icon: "iprops", tip: "部品表 (BOM) を表示し CSV に書き出します。", action: () => this.openBom() },
          ],
        },
        {
          title: "書き出し",
          items: [
            { id: "asm-step", label: "STEP 書き出し", icon: "export", tip: "アセンブリを STEP で書き出します (Inventor で開けます)。", action: () => this.exportStep() },
            { id: "asm-drawing", label: "図面ビュー", icon: "drawing", tip: "アセンブリの 2D 図面ビューを作成します。", action: () => this.app.openDrawingEnv() },
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
      rigid: "一体に固定する 2 つのコンポーネントの任意の面を選択 (現在の相対位置で固定)",
      ball: "一致させる点 (円形エッジの中心・球面の中心・面の中心) を 2 つ選択",
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
      if (this.type === "rigid") {
        // keep the relative placement the components have now
        const ma = env.doc.components.find((x) => x.id === this.a!.comp)!, mb = env.doc.components.find((x) => x.id === this.b!.comp)!;
        c.rel = new THREE.Matrix4().fromArray(ma.matrix).invert().multiply(new THREE.Matrix4().fromArray(mb.matrix)).toArray();
      }
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

const constraintResidual = constraintError;
