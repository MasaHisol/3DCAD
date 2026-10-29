// Persistent display-mesh cache (#5 キャッシュ管理): the lightweight open of
// large assemblies (stage 1) keeps each part's display meshes in IndexedDB.
// Keys are versioned with the tessellation / kernel version, so meshes made by
// an older mesher are never shown, and stale versions are deleted. The cache
// is capped in bytes: least recently used parts are evicted beyond the cap.
import { idbDelete, idbGet, idbKeys, idbSet } from "./idb";
import { MESH_CACHE_VERSION } from "../kernel/tessellation";
import type { BodyMesh } from "../kernel/protocol";

export interface KvStore {
  get<T>(key: string): Promise<T | undefined>;
  set(key: string, value: unknown): Promise<void>;
  del(key: string): Promise<void>;
  keys(prefix: string): Promise<string[]>;
}

export const idbStore: KvStore = { get: idbGet, set: idbSet, del: idbDelete, keys: idbKeys };

/** Bytes of a part's display meshes (buffers plus a per face / edge allowance). */
export function bodiesBytes(bodies: BodyMesh[]): number {
  let n = 0;
  for (const m of bodies) n += m.positions.byteLength + m.normals.byteLength + m.indices.byteLength + m.faceRanges.byteLength + m.edgePositions.byteLength + m.edgeRanges.byteLength + 120 * (m.faces.length + m.edges.length) + 256;
  return n;
}

/** Byte-capped LRU bookkeeping (no storage). */
export class LruIndex {
  readonly entries = new Map<string, { bytes: number; at: number }>();
  private clock = 0;
  constructor(public maxBytes: number) {}

  get total(): number {
    let n = 0;
    for (const e of this.entries.values()) n += e.bytes;
    return n;
  }

  touch(key: string) {
    const e = this.entries.get(key);
    if (e) e.at = ++this.clock;
  }

  /** Adds / replaces an entry; returns the keys evicted to stay within the cap (never the new one). */
  add(key: string, bytes: number): string[] {
    this.entries.set(key, { bytes, at: ++this.clock });
    return this.evict(key);
  }

  delete(key: string) {
    this.entries.delete(key);
  }

  evict(keep?: string): string[] {
    const out: string[] = [];
    let total = this.total;
    if (total <= this.maxBytes) return out;
    const order = [...this.entries.entries()].filter(([k]) => k !== keep).sort((a, b) => a[1].at - b[1].at);
    for (const [k, e] of order) {
      if (total <= this.maxBytes) break;
      this.entries.delete(k);
      total -= e.bytes;
      out.push(k);
    }
    return out;
  }

  toJSON() {
    return { clock: this.clock, entries: [...this.entries.entries()] };
  }

  load(j: { clock: number; entries: [string, { bytes: number; at: number }][] } | undefined) {
    if (!j) return;
    this.clock = j.clock;
    for (const [k, v] of j.entries) this.entries.set(k, v);
  }
}

const PREFIX = "asm-mesh:";
const INDEX = "asm-mesh-index";

/** Display meshes per part hash, versioned and LRU-capped. */
export class DisplayMeshCache {
  readonly lru: LruIndex;
  private ready: Promise<void> | null = null;

  constructor(
    private store: KvStore = idbStore,
    maxBytes = 256 * 1024 * 1024,
    readonly version = MESH_CACHE_VERSION,
  ) {
    this.lru = new LruIndex(maxBytes);
  }

  key(hash: string) {
    return `${PREFIX}${this.version}:${hash}`;
  }

  /** Loads the index and deletes meshes of other versions (stage-1 unversioned keys too). */
  init(): Promise<void> {
    return (this.ready ??= (async () => {
      const j = await this.store.get<{ version: string; clock: number; entries: [string, { bytes: number; at: number }][] }>(INDEX).catch(() => undefined);
      if (j && j.version === this.version) this.lru.load(j);
      const keys = await this.store.keys(PREFIX).catch(() => [] as string[]);
      const mine = `${PREFIX}${this.version}:`;
      for (const k of keys) if (!k.startsWith(mine)) await this.store.del(k).catch(() => {});
      // entries whose data disappeared, and data without an entry
      const present = new Set(keys.filter((k) => k.startsWith(mine)));
      for (const k of [...this.lru.entries.keys()]) if (!present.has(k)) this.lru.delete(k);
      for (const k of present) if (!this.lru.entries.has(k)) await this.store.del(k).catch(() => {});
    })());
  }

  async get(hash: string): Promise<BodyMesh[] | undefined> {
    await this.init();
    const k = this.key(hash);
    if (!this.lru.entries.has(k)) return undefined;
    const v = await this.store.get<BodyMesh[]>(k);
    if (!v) {
      this.lru.delete(k);
      return undefined;
    }
    // a mesh of another tessellation version is never shown
    if (v.some((b) => b.tess && b.tess.version !== this.version)) return undefined;
    this.lru.touch(k);
    this.saveIndexSoon();
    return v;
  }

  async put(hash: string, bodies: BodyMesh[]): Promise<void> {
    await this.init();
    const k = this.key(hash);
    const bytes = bodiesBytes(bodies);
    if (bytes > this.lru.maxBytes) return;
    await this.store.set(k, bodies);
    for (const old of this.lru.add(k, bytes)) await this.store.del(old).catch(() => {});
    await this.saveIndex();
  }

  private saveTimer: ReturnType<typeof setTimeout> | null = null;
  private saveIndexSoon() {
    if (this.saveTimer) return;
    this.saveTimer = setTimeout(() => {
      this.saveTimer = null;
      void this.saveIndex().catch(() => {});
    }, 500);
  }

  async saveIndex() {
    await this.store.set(INDEX, { version: this.version, ...this.lru.toJSON() });
  }
}

/** Shared instance used by the assembly lightweight open. */
export const displayMeshCache = new DisplayMeshCache();
