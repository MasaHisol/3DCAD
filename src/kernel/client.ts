// Promise-based RPC to the geometry worker. Rebuild requests are coalesced:
// while one is running only the latest pending request is kept.
//
// The worker is supervised: if it dies (uncaught error, WebAssembly abort) or a main
// rebuild exceeds the watchdog, it is terminated and restarted, pending calls are
// rejected with KernelCrashError and `onRestart` lets the app rebuild its last good state.
import type { ViewGeometry, ViewSpec, Interference, MassProps, MeasureResult, PickRef, Placement, ProjectionView, RebuildResult, RFeature, WorkerRequest, WorkerResponse } from "./protocol";

/** The geometry worker died or hung; it has been restarted and holds no models. */
export class KernelCrashError extends Error {
  readonly crashed = true;
}

/** Watchdog for the main part rebuild only (other calls, e.g. big exports, may legitimately run long). */
export const REBUILD_TIMEOUT_MS = 180_000;

export class KernelClient {
  private worker!: Worker;
  /** Called after the worker was restarted (and initialised) following a crash. */
  onRestart: ((reason: string) => void) | null = null;
  restarts = 0;
  rebuildTimeoutMs = REBUILD_TIMEOUT_MS;
  private seq = 0;
  private pending = new Map<number, { resolve: (v: unknown) => void; reject: (e: Error) => void }>();
  private rebuildRunning = false;
  private rebuildQueued: { features: RFeature[]; capture?: string; waiters: { resolve: (v: RebuildResult) => void; reject: (e: Error) => void }[] } | null = null;

  constructor() {
    this.spawn();
  }

  private spawn() {
    const w = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });
    this.worker = w;
    w.onmessage = (ev: MessageEvent<WorkerResponse>) => {
      const p = this.pending.get(ev.data.id);
      if (!p) return;
      this.pending.delete(ev.data.id);
      if (ev.data.ok) p.resolve(ev.data.result);
      else p.reject(new Error(ev.data.error));
    };
    // an uncaught error leaves OpenCascade in an unknown state: treat it as a crash
    w.onerror = (ev) => {
      console.error("geometry worker error", ev);
      ev.preventDefault?.();
      if (this.worker === w) this.restart(`ワーカーの異常終了${ev.message ? ` (${ev.message})` : ""}`);
    };
    w.onmessageerror = () => this.worker === w && this.restart("ワーカーとの通信エラー");
  }

  private initialised = false;

  /** Terminate the worker, fail everything in flight and start a fresh one. */
  restart(reason: string) {
    this.restarts++;
    this.worker.terminate();
    const err = new KernelCrashError(`ジオメトリ カーネルが停止したため再起動しました: ${reason}`);
    const pend = [...this.pending.values()];
    this.pending.clear();
    this.spawn();
    pend.forEach((p) => p.reject(err));
    if (!this.initialised) return;
    this.call<boolean>({ kind: "init" })
      .then(() => this.onRestart?.(reason))
      .catch((e) => console.error("geometry worker restart failed", e));
  }

  /** Test hook: behave as if the worker crashed. */
  simulateCrash() {
    this.restart("テスト用の強制終了");
  }

  private call<T>(req: WorkerRequest, timeoutMs = 0): Promise<T> {
    const id = ++this.seq;
    return new Promise<T>((resolve, reject) => {
      let timer = 0;
      const done = () => timer && clearTimeout(timer);
      this.pending.set(id, { resolve: (v) => (done(), resolve(v as T)), reject: (e) => (done(), reject(e)) });
      if (timeoutMs > 0)
        timer = setTimeout(() => {
          if (this.pending.has(id)) this.restart(`${Math.round(timeoutMs / 1000)} 秒以内に応答がありません`);
        }, timeoutMs) as unknown as number;
      this.worker.postMessage({ id, req });
    });
  }

  async init(): Promise<boolean> {
    const r = await this.call<boolean>({ kind: "init" });
    this.initialised = true;
    return r;
  }

  /** Rebuild of an assembly part in its own engine (not coalesced). */
  rebuildKey(key: string, features: RFeature[], timeoutMs = 0): Promise<RebuildResult> {
    return this.call({ kind: "rebuild", features, key }, timeoutMs);
  }
  /** Stop the worker for good (worker pool shrinking); pending calls fail. */
  dispose() {
    this.onRestart = null;
    this.worker.terminate();
    const err = new KernelCrashError("ジオメトリ カーネルを終了しました");
    const pend = [...this.pending.values()];
    this.pending.clear();
    pend.forEach((p) => p.reject(err));
  }
  dropEngine(key: string): Promise<boolean> {
    return this.call({ kind: "dropEngine", key });
  }
  exportAssembly(format: "step" | "stl" | "iges", placements: Placement[], withRoutes = false, name?: string): Promise<ArrayBuffer> {
    return this.call({ kind: "exportAssembly", format, placements, withRoutes, name });
  }
  /** STEP assembly -> one STEP part per product and the placed instances. */
  stepAssembly(text: string): Promise<import("./exchange").StepAssembly> {
    return this.call({ kind: "stepAssembly", text });
  }
  /** Exact hidden-line removal of the part (or placed assembly) for each view. */
  hlr(views: import("./hlr").HlrView[], placements?: Placement[]): Promise<import("./hlr").HlrResult[]> {
    return this.call({ kind: "hlr", views, placements });
  }
  /** Extended kernel state; `load` loads it now (otherwise it loads on first use). */
  extKernel(load = false): Promise<import("./protocol").ExtKernelInfo> {
    return this.call({ kind: "extKernel", load });
  }
  buildRoutes(routes: import("./route").RouteSolidSpec[]): Promise<import("./route").RouteSolidResult[]> {
    return this.call({ kind: "routeBuild", routes });
  }
  routeInterference(placements: Placement[]): Promise<{ route: string; comp: number; volume: number }[]> {
    return this.call({ kind: "routeInterference", placements });
  }
  interference(placements: Placement[]): Promise<Interference[]> {
    return this.call({ kind: "interference", placements });
  }
  /** Exact planar sections (kernel BRepAlgoAPI_Section) of the part or the placed components. */
  section(planes: import("../core/types").PlaneDef[], placements?: Placement[]): Promise<import("./section").SectionResult[]> {
    return this.call({ kind: "section", planes, placements });
  }
  drawViews(views: ViewSpec[], placements?: Placement[]): Promise<ViewGeometry[]> {
    return this.call({ kind: "drawViews", views, placements });
  }
  massPropsKey(key: string): Promise<MassProps> {
    return this.call({ kind: "massProps", key });
  }
  projectionPlaced(views: { name: string; dir: [number, number, number]; xAxis: [number, number, number] }[], placements: Placement[]): Promise<ProjectionView[]> {
    return this.call({ kind: "projection", views, placements });
  }

  /** Progressive display: large models come back coarse first (`refine` set; then call remesh). */
  progressive = true;

  /** Display meshes of the current model at another tessellation level. */
  remesh(quality: "coarse" | "normal" | "fine"): Promise<{ bodies: import("./protocol").BodyMesh[]; surfaces: import("./protocol").BodyMesh[] }> {
    return this.call({ kind: "remesh", quality });
  }

  rebuild(features: RFeature[], captureBefore?: string): Promise<RebuildResult> {
    return new Promise((resolve, reject) => {
      if (this.rebuildRunning) {
        if (!this.rebuildQueued) this.rebuildQueued = { features, waiters: [] };
        this.rebuildQueued.features = features;
        this.rebuildQueued.capture = captureBefore;
        this.rebuildQueued.waiters.push({ resolve, reject });
        return;
      }
      this.runRebuild(features, captureBefore, [{ resolve, reject }]);
    });
  }

  private async runRebuild(features: RFeature[], captureBefore: string | undefined, waiters: { resolve: (v: RebuildResult) => void; reject: (e: Error) => void }[]) {
    this.rebuildRunning = true;
    try {
      const r = await this.call<RebuildResult>({ kind: "rebuild", features, captureBefore, progressive: this.progressive }, this.rebuildTimeoutMs);
      waiters.forEach((w) => w.resolve(r));
    } catch (e) {
      waiters.forEach((w) => w.reject(e as Error));
    } finally {
      this.rebuildRunning = false;
      const q = this.rebuildQueued;
      this.rebuildQueued = null;
      if (q) this.runRebuild(q.features, q.capture, q.waiters);
    }
  }

  exportFile(format: "step" | "stl" | "brep" | "iges", name: string, color?: string): Promise<ArrayBuffer> {
    return this.call({ kind: "export", format, name, color });
  }
  massProps(): Promise<MassProps> {
    return this.call({ kind: "massProps" });
  }
  measure(a: PickRef, b?: PickRef): Promise<MeasureResult> {
    return this.call({ kind: "measure", a, b });
  }
  projection(views: { name: string; dir: [number, number, number]; xAxis: [number, number, number] }[]): Promise<ProjectionView[]> {
    return this.call({ kind: "projection", views });
  }
}
