// Multi-core K·x for the voxel FE operator.
//
// The analysis worker owns a pool of helper threads that share the element
// connectivity, the element scale factors (phi) and the vectors through
// SharedArrayBuffers. A product splits the elements into ranges: every
// helper accumulates its range into its own output slice, the caller
// computes the last range itself, waits on an Atomics counter and sums the
// slices. Everything stays synchronous for the solver (CG / multigrid).
// Without cross-origin isolation (or in tests) no pool exists and the
// solver keeps its single-threaded loop.

export interface KxJob {
  id: number;
  ne: number;
  n3: number;
  conn: Int32Array;
  phi: Float64Array;
  KE: Float64Array;
  x: Float64Array;
  /** One output slice of n3 per helper. */
  y: Float64Array;
}

interface Helper {
  port: MessagePort;
}

let pool: KxPool | null = null;
/** The pool used by buildOperator (null = single-threaded). */
export const kxPool = () => pool;

/** Elements below this run single-threaded (message overhead would dominate). */
export const PAR_MIN_ELEMENTS = 3000;

export class KxPool {
  private helpers: Helper[] = [];
  private ctrl = new Int32Array(new SharedArrayBuffer(8));
  private seq = 0;
  private current: KxJob | null = null;
  private broken = false;
  /** Resolves when every helper answered; await it before a (synchronous) solve. */
  readonly ready: Promise<void>;

  constructor(ports: MessagePort[]) {
    const waits: Promise<void>[] = [];
    for (const port of ports) {
      waits.push(
        new Promise<void>((res) => {
          port.onmessage = (e) => e.data === "ready" && res();
        }),
      );
      port.postMessage({ type: "ctrl", ctrl: this.ctrl });
      this.helpers.push({ port });
    }
    // give up on the pool (single-threaded) if the helpers do not come up
    this.ready = Promise.race([Promise.all(waits).then(() => undefined), new Promise<void>((res) => setTimeout(() => ((this.broken = true), res()), 10000))]);
  }

  get threads() {
    return this.helpers.length;
  }

  /** Shared copies of an operator's data; send them to the helpers once. */
  job(conn: ArrayLike<number>, phi: ArrayLike<number>, KE: Float64Array, ne: number, n3: number): KxJob | null {
    if (this.broken) return null;
    const sab = <T extends Int32Array | Float64Array>(C: { new (b: SharedArrayBuffer): T; BYTES_PER_ELEMENT: number }, n: number) => new C(new SharedArrayBuffer(n * C.BYTES_PER_ELEMENT));
    const job: KxJob = {
      id: ++this.seq,
      ne,
      n3,
      conn: sab(Int32Array, ne * 8),
      phi: sab(Float64Array, ne),
      KE: sab(Float64Array, 576),
      x: sab(Float64Array, n3),
      y: sab(Float64Array, n3 * this.helpers.length),
    };
    job.conn.set(Array.prototype.slice.call(conn, 0, ne * 8) as number[]);
    for (let e = 0; e < ne; e++) job.phi[e] = phi[e];
    job.KE.set(KE.subarray(0, 576));
    return job;
  }

  /** y = K x over all elements (no masking). */
  kx(job: KxJob, x: Float64Array, y: Float64Array) {
    const T = this.helpers.length, { ne, n3 } = job;
    if (this.current !== job) {
      // only the latest operator is kept by the helpers
      for (const h of this.helpers) h.port.postMessage({ type: "job", job });
      this.current = job;
    }
    job.x.set(x);
    Atomics.store(this.ctrl, 0, 0);
    const chunk = Math.ceil(ne / (T + 1));
    for (let t = 0; t < T; t++) this.helpers[t].port.postMessage({ type: "run", id: job.id, slot: t, e0: t * chunk, e1: Math.min(ne, (t + 1) * chunk) });
    y.fill(0);
    kxRange(job.conn, job.phi, job.KE, x, y, 0, T * chunk, ne);
    // wait for the helpers (bounded, so a lost helper cannot hang the analysis)
    const t0 = Date.now();
    for (;;) {
      const done = Atomics.load(this.ctrl, 0);
      if (done >= T) break;
      Atomics.wait(this.ctrl, 0, done, 200);
      if (Date.now() - t0 > 20000) {
        this.broken = true;
        throw new Error("並列計算の補助スレッドが応答しません (もう一度実行すると 1 スレッドで計算します)");
      }
    }
    for (let t = 0; t < T; t++) {
      const off = t * n3;
      for (let i = 0; i < n3; i++) y[i] += job.y[off + i];
    }
  }
}

/** Accumulate K·x for elements [e0, e1) into y at offset `yoff`. */
export function kxRange(conn: Int32Array, phi: Float64Array, KE: Float64Array, x: Float64Array, y: Float64Array, yoff: number, e0: number, e1: number) {
  const ue = new Float64Array(24);
  for (let e = e0; e < e1; e++) {
    const c = e * 8, s = phi[e];
    if (!s) continue;
    for (let n = 0; n < 8; n++) {
      const g = conn[c + n] * 3;
      ue[n * 3] = x[g];
      ue[n * 3 + 1] = x[g + 1];
      ue[n * 3 + 2] = x[g + 2];
    }
    for (let a = 0; a < 24; a++) {
      let sum = 0;
      const row = a * 24;
      for (let b = 0; b < 24; b++) sum += KE[row + b] * ue[b];
      y[yoff + conn[c + ((a / 3) | 0)] * 3 + (a % 3)] += sum * s;
    }
  }
}

/** Create the pool in the analysis worker from the ports the page handed over. */
export function initKxPool(ports: MessagePort[] | undefined) {
  if (pool || !ports?.length || typeof SharedArrayBuffer === "undefined") return pool;
  pool = new KxPool(ports);
  return pool;
}

/**
 * Page side: start the helper threads (from the page, not from the analysis
 * worker: a nested worker is loaded and messaged through its parent thread,
 * which is blocked while the solver waits) and connect each to the analysis
 * worker with a MessageChannel. Returns null without cross-origin isolation.
 */
export function spawnKxHelpers(): { ports: MessagePort[]; stop: () => void } | null {
  if (!globalThis.crossOriginIsolated || typeof SharedArrayBuffer === "undefined") return null;
  const threads = Math.min(7, (navigator.hardwareConcurrency ?? 2) - 1);
  if (threads < 1) return null;
  const workers: Worker[] = [], ports: MessagePort[] = [];
  for (let i = 0; i < threads; i++) {
    const w = new Worker(new URL("./kxHelper.ts", import.meta.url), { type: "module" });
    const ch = new MessageChannel();
    w.postMessage({ type: "port", port: ch.port2 }, [ch.port2]);
    workers.push(w);
    ports.push(ch.port1);
  }
  return { ports, stop: () => workers.forEach((w) => w.terminate()) };
}
