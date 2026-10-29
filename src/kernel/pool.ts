// Pool of geometry workers for independent parts (stage 1.5 engine #3).
//
// Opening an assembly (or rebuilding several changed parts) builds each
// distinct part in one of N extra kernel workers in parallel; the display
// meshes come back and the main kernel builds a part's B-rep only when an
// operation needs it (AssemblyEnv.ensureBrep, as for the lightweight open).
// Single-part editing keeps using the main worker.
//
// Every pool worker is a KernelClient, so it keeps the crash / watchdog /
// restart behaviour: a job whose worker died is retried once on the
// restarted worker, then reported as failed (the caller falls back to the
// main kernel). Workers are created lazily and stopped after being idle.

import type { RebuildResult, RFeature } from "./protocol";

export interface PoolWorker {
  init(): Promise<boolean>;
  rebuildKey(key: string, features: RFeature[], timeoutMs?: number): Promise<RebuildResult>;
  dropEngine(key: string): Promise<boolean>;
  /** Assembly interference on parts this worker has built (optional: KernelClient). */
  interferenceEx?(placements: import("./protocol").Placement[], opts: import("./interferenceK").InterferenceExOptions): Promise<import("./interferenceK").InterferenceExHit[]>;
  dispose(): void;
}

/**
 * Number of pool workers: one per spare core (the main worker and UI keep
 * theirs), capped, and limited by memory (~350 MB per OpenCascade instance).
 * 0 = no pool (single / dual core or little memory).
 */
export function poolSize(cores = globalThis.navigator?.hardwareConcurrency ?? 1, memoryGB = (globalThis.navigator as { deviceMemory?: number } | undefined)?.deviceMemory, cap = 4): number {
  let n = Math.min(cap, Math.max(0, cores - 2));
  if (memoryGB !== undefined) n = Math.min(n, Math.floor(memoryGB / 2));
  return n >= 2 ? n : 0;
}

export interface PoolJob {
  id: string;
  features: RFeature[];
}

export interface PoolResult {
  id: string;
  result?: RebuildResult;
  error?: string;
}

/** Per-job watchdog in pool workers. */
export const POOL_JOB_TIMEOUT_MS = 180_000;

export class KernelPool {
  private workers: { w: PoolWorker; ready: Promise<boolean> }[] = [];
  private idleTimer: ReturnType<typeof setTimeout> | null = null;
  /** Jobs completed / retried (diagnostics, tests). */
  stats = { jobs: 0, retries: 0, failed: 0 };

  constructor(
    private factory: () => PoolWorker,
    readonly size: number,
    private idleMs = 30_000,
  ) {}

  private worker(i: number) {
    while (this.workers.length <= i) {
      const w = this.factory();
      this.workers.push({ w, ready: w.init() });
    }
    return this.workers[i];
  }

  /**
   * Build every job, at most `size` at a time; `onResult` is called as each
   * finishes (in completion order). Resolves with all results in job order.
   */
  async run(jobs: PoolJob[], onResult?: (r: PoolResult) => void): Promise<PoolResult[]> {
    if (this.idleTimer) clearTimeout(this.idleTimer);
    const results: PoolResult[] = new Array(jobs.length);
    let next = 0;
    const lane = async (i: number) => {
      for (;;) {
        const j = next++;
        if (j >= jobs.length) return;
        const job = jobs[j];
        const r = await this.runOne(i, job);
        results[j] = r;
        onResult?.(r);
      }
    };
    const n = Math.max(1, Math.min(this.size, jobs.length));
    await Promise.all(Array.from({ length: n }, (_, i) => lane(i)));
    this.scheduleIdle();
    return results;
  }

  /**
   * Generic tasks on the pool workers (at most `size` at a time); each task gets
   * a ready worker and its lane number. Used e.g. by the assembly interference check.
   */
  async runTasks<T>(tasks: ((w: PoolWorker, lane: number) => Promise<T>)[]): Promise<T[]> {
    if (this.idleTimer) clearTimeout(this.idleTimer);
    const results: T[] = new Array(tasks.length);
    let next = 0;
    const lane = async (i: number) => {
      for (;;) {
        const j = next++;
        if (j >= tasks.length) return;
        const { w, ready } = this.worker(i);
        await ready;
        results[j] = await tasks[j](w, i);
      }
    };
    const n = Math.max(1, Math.min(this.size, tasks.length));
    try {
      await Promise.all(Array.from({ length: n }, (_, i) => lane(i)));
    } finally {
      this.scheduleIdle();
    }
    return results;
  }

  private async runOne(i: number, job: PoolJob): Promise<PoolResult> {
    const key = `pool:${job.id}`;
    for (let attempt = 0; attempt < 2; attempt++) {
      const { w, ready } = this.worker(i);
      try {
        await ready;
        const result = await w.rebuildKey(key, job.features, POOL_JOB_TIMEOUT_MS);
        // the pool only produces display meshes: free the kernel state right away
        void w.dropEngine(key).catch(() => {});
        this.stats.jobs++;
        return { id: job.id, result };
      } catch (e) {
        const crashed = (e as { crashed?: boolean }).crashed;
        if (!crashed || attempt === 1) {
          this.stats.failed++;
          return { id: job.id, error: (e as Error).message };
        }
        // the KernelClient restarted its worker: wait for it and retry once
        this.stats.retries++;
        this.workers[i].ready = w.init();
      }
    }
    return { id: job.id, error: "unreachable" };
  }

  private scheduleIdle() {
    if (this.idleMs <= 0) return;
    this.idleTimer = setTimeout(() => this.shutdown(), this.idleMs);
  }

  /** Stop every worker (they are recreated on the next run). */
  shutdown() {
    if (this.idleTimer) clearTimeout(this.idleTimer);
    this.idleTimer = null;
    for (const { w } of this.workers) w.dispose();
    this.workers = [];
  }
}
