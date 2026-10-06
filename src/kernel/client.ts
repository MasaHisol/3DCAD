// Promise-based RPC to the geometry worker. Rebuild requests are coalesced:
// while one is running only the latest pending request is kept.
import type { Interference, MassProps, MeasureResult, PickRef, Placement, ProjectionView, RebuildResult, RFeature, WorkerRequest, WorkerResponse } from "./protocol";

export class KernelClient {
  private worker: Worker;
  private seq = 0;
  private pending = new Map<number, { resolve: (v: unknown) => void; reject: (e: Error) => void }>();
  private rebuildRunning = false;
  private rebuildQueued: { features: RFeature[]; capture?: string; waiters: { resolve: (v: RebuildResult) => void; reject: (e: Error) => void }[] } | null = null;

  constructor() {
    this.worker = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });
    this.worker.onmessage = (ev: MessageEvent<WorkerResponse>) => {
      const p = this.pending.get(ev.data.id);
      if (!p) return;
      this.pending.delete(ev.data.id);
      if (ev.data.ok) p.resolve(ev.data.result);
      else p.reject(new Error(ev.data.error));
    };
    this.worker.onerror = (ev) => console.error("geometry worker error", ev);
  }

  private call<T>(req: WorkerRequest): Promise<T> {
    const id = ++this.seq;
    return new Promise<T>((resolve, reject) => {
      this.pending.set(id, { resolve: resolve as (v: unknown) => void, reject });
      this.worker.postMessage({ id, req });
    });
  }

  init(): Promise<boolean> {
    return this.call({ kind: "init" });
  }

  /** Rebuild of an assembly part in its own engine (not coalesced). */
  rebuildKey(key: string, features: RFeature[]): Promise<RebuildResult> {
    return this.call({ kind: "rebuild", features, key });
  }
  dropEngine(key: string): Promise<boolean> {
    return this.call({ kind: "dropEngine", key });
  }
  exportAssembly(format: "step" | "stl", placements: Placement[]): Promise<ArrayBuffer> {
    return this.call({ kind: "exportAssembly", format, placements });
  }
  interference(placements: Placement[]): Promise<Interference[]> {
    return this.call({ kind: "interference", placements });
  }
  massPropsKey(key: string): Promise<MassProps> {
    return this.call({ kind: "massProps", key });
  }
  projectionPlaced(views: { name: string; dir: [number, number, number]; xAxis: [number, number, number] }[], placements: Placement[]): Promise<ProjectionView[]> {
    return this.call({ kind: "projection", views, placements });
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
      const r = await this.call<RebuildResult>({ kind: "rebuild", features, captureBefore });
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

  exportFile(format: "step" | "stl", name: string): Promise<ArrayBuffer> {
    return this.call({ kind: "export", format, name });
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
