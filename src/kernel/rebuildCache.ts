// Incremental rebuild cache (stage 1.5 engine #3) — kernel-independent part.
//
// The model state after feature i is cached under a key that hashes feature i
// together with the key of feature i-1, so a key identifies the whole prefix
// of the feature list (features + their resolved inputs: sketch loops,
// parameter values, references, suppression, order and the rollback bar all
// end up in the resolved features). A rebuild resumes from the longest prefix
// whose states are all cached and evaluates only the rest. Older versions of
// the model (before an edit, undo / redo, suppress / unsuppress, reorder) stay
// cached until evicted (LRU), bounded by entry count and by an estimated
// memory budget (bytes of the kernel shapes kept alive); kernel shapes of an
// evicted entry are freed (`free`) as soon as no cached entry uses them.

/** 64-bit (two 32-bit lanes) string hash, hex. Seeded so keys chain. */
export function hash64(s: string, seed = ""): string {
  let h1 = 0xdeadbeef ^ hashSeed(seed, 1), h2 = 0x41c6ce57 ^ hashSeed(seed, 2);
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 2654435761);
    h2 = Math.imul(h2 ^ c, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0).toString(16).padStart(8, "0") + (h1 >>> 0).toString(16).padStart(8, "0");
}

function hashSeed(seed: string, lane: number): number {
  let h = lane * 0x9e3779b1;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 0x85ebca6b) ^ (h >>> 13);
  return h | 0;
}

/**
 * Prefix keys of a feature list: key[i] covers features 0..i. Two
 * independent hashes plus the running length make accidental collisions
 * negligible.
 */
export function prefixKeys(features: readonly unknown[]): string[] {
  const keys: string[] = [];
  let prev = "";
  let len = 0;
  for (const f of features) {
    const j = JSON.stringify(f);
    len += j.length;
    prev = hash64(j, prev) + hash64(j, "b" + prev).slice(0, 8) + len.toString(36);
    keys.push(prev);
  }
  return keys;
}

export interface CacheStats {
  entries: number;
  pinned: number;
  hits: number;
  misses: number;
  evicted: number;
  /** Kernel shapes freed by eviction. */
  freed: number;
  liveShapes: number;
  /** Estimated bytes of the live shapes (when a size estimator is given). */
  liveBytes: number;
  /** Byte budget in force (Infinity = none). */
  maxBytes: number;
}

const MB = 1024 * 1024;

/**
 * Memory budget of the rebuild cache, from the memory available to the page /
 * worker: a tenth of the device memory (navigator.deviceMemory, Chromium;
 * 4 GB assumed otherwise), bounded by the JS heap limit and by what the
 * kernel's 32-bit WebAssembly heap can hold, clamped to 64 MB … 768 MB.
 */
export function defaultCacheBudget(env: { deviceMemoryGB?: number; heapLimit?: number } = {}): number {
  const g = globalThis as unknown as { navigator?: { deviceMemory?: number }; performance?: { memory?: { jsHeapSizeLimit?: number } } };
  const dev = env.deviceMemoryGB ?? g.navigator?.deviceMemory;
  const heap = env.heapLimit ?? g.performance?.memory?.jsHeapSizeLimit;
  let avail = (dev && dev > 0 ? dev : 4) * 1024 * MB;
  if (heap && heap > 0) avail = Math.min(avail, heap * 2);
  avail = Math.min(avail, 2048 * MB);
  return Math.round(Math.min(768 * MB, Math.max(64 * MB, avail * 0.1)));
}

/**
 * LRU of feature states. `shapesOf` lists the kernel objects an entry keeps
 * alive; they are reference counted across entries and `free`d when the last
 * entry using them is evicted. Entries of the current model are pinned.
 */
export class StateCache<E, S extends object = object> {
  private map = new Map<string, E>();
  private refs = new Map<S, number>();
  private pinned = new Set<string>();
  /** Per key: rebuild generation it was last used in, and its feature index. */
  private meta = new Map<string, { gen: number; idx: number }>();
  private gen = 0;
  stats: CacheStats = { entries: 0, pinned: 0, hits: 0, misses: 0, evicted: 0, freed: 0, liveShapes: 0, liveBytes: 0, maxBytes: Infinity };

  constructor(
    private shapesOf: (e: E) => Iterable<S>,
    private free: (s: S) => void,
    /** Unpinned entries kept besides the current model. */
    public maxExtra = 64,
    /** Estimated bytes a shape keeps alive (re-evaluated on every trim: meshes grow). */
    private sizeOf?: (s: S) => number,
    /** Byte budget of all live shapes; unpinned entries are evicted (LRU) beyond it. */
    public maxBytes = Infinity,
  ) {}

  /** Estimated bytes of all shapes kept alive by the cache. */
  liveBytes(): number {
    if (!this.sizeOf) return 0;
    let n = 0;
    for (const s of this.refs.keys()) n += this.sizeOf(s);
    return n;
  }

  get size() {
    return this.map.size;
  }

  has(key: string) {
    return this.map.has(key);
  }

  /** Entry for `key` (marked most recently used). */
  get(key: string, idx = 0): E | undefined {
    const e = this.map.get(key);
    if (e === undefined) {
      this.stats.misses++;
      return undefined;
    }
    this.stats.hits++;
    this.meta.set(key, { gen: this.gen, idx });
    return e;
  }

  set(key: string, e: E, idx = 0) {
    this.meta.set(key, { gen: this.gen, idx });
    const old = this.map.get(key);
    if (old === e) return;
    if (old !== undefined) this.release(old);
    this.map.set(key, e);
    for (const s of new Set(this.shapesOf(e))) this.refs.set(s, (this.refs.get(s) ?? 0) + 1);
  }

  /** The entries of the current model: never evicted. */
  pin(keys: Iterable<string>) {
    this.pinned = new Set(keys);
    for (const k of this.pinned) {
      const m = this.meta.get(k);
      if (m) m.gen = this.gen;
    }
    this.gen++;
  }

  /**
   * Evict unpinned entries beyond the bound: least recently used model
   * versions first and, within one version, its last features first (an
   * older version keeps its longest reusable prefix).
   */
  trim(maxExtra = this.maxExtra, maxBytes = this.maxBytes) {
    const extra = [...this.map.keys()].filter((k) => !this.pinned.has(k));
    const m = (k: string) => this.meta.get(k) ?? { gen: -1, idx: 0 };
    extra.sort((a, b) => m(a).gen - m(b).gen || m(b).idx - m(a).idx);
    let i = 0;
    const evict = () => {
      const k = extra[i++];
      const e = this.map.get(k)!;
      this.map.delete(k);
      this.meta.delete(k);
      this.release(e);
      this.stats.evicted++;
    };
    while (extra.length - i > maxExtra) evict();
    if (this.sizeOf && maxBytes < Infinity) {
      // byte budget: per shape sizes once, then subtract what each eviction frees
      const size = new Map<S, number>();
      let bytes = 0;
      for (const s of this.refs.keys()) {
        const b = this.sizeOf(s);
        size.set(s, b);
        bytes += b;
      }
      while (bytes > maxBytes && i < extra.length) {
        const before = new Set(this.refs.keys());
        evict();
        for (const s of before) if (!this.refs.has(s)) bytes -= size.get(s) ?? 0;
      }
      this.stats.liveBytes = bytes;
    }
    this.stats.maxBytes = maxBytes;
    this.updateStats();
  }

  /** Drop everything (engine disposed): frees every shape. */
  clear() {
    for (const e of this.map.values()) this.release(e);
    this.map.clear();
    this.meta.clear();
    this.pinned.clear();
    this.updateStats();
  }

  /** Whether `s` is still kept by some cached entry. */
  holds(s: S): boolean {
    return (this.refs.get(s) ?? 0) > 0;
  }

  private release(e: E) {
    for (const s of new Set(this.shapesOf(e))) {
      const n = (this.refs.get(s) ?? 0) - 1;
      if (n > 0) this.refs.set(s, n);
      else {
        this.refs.delete(s);
        this.stats.freed++;
        try {
          this.free(s);
        } catch {
          /* already gone */
        }
      }
    }
  }

  private updateStats() {
    this.stats.entries = this.map.size;
    this.stats.pinned = this.pinned.size;
    this.stats.liveShapes = this.refs.size;
  }
}

/**
 * Index of the first feature whose prefix key is not cached: features before
 * it are reused, it and everything after are evaluated.
 */
export function resumeIndex(keys: readonly string[], has: (k: string) => boolean): number {
  let i = 0;
  while (i < keys.length && has(keys[i])) i++;
  return i;
}
