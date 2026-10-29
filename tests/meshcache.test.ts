import { describe, expect, it } from "vitest";
import { DisplayMeshCache, LruIndex, bodiesBytes, type KvStore } from "../src/core/meshCache";
import { StateCache, defaultCacheBudget } from "../src/kernel/rebuildCache";
import { MESH_CACHE_VERSION } from "../src/kernel/tessellation";
import type { BodyMesh } from "../src/kernel/protocol";

class MemStore implements KvStore {
  m = new Map<string, unknown>();
  async get<T>(k: string) {
    return this.m.get(k) as T | undefined;
  }
  async set(k: string, v: unknown) {
    this.m.set(k, v);
  }
  async del(k: string) {
    this.m.delete(k);
  }
  async keys(prefix: string) {
    return [...this.m.keys()].filter((k) => k.startsWith(prefix));
  }
}

const body = (tris: number, version = MESH_CACHE_VERSION): BodyMesh => ({
  name: "b",
  bbox: [
    [0, 0, 0],
    [1, 1, 1],
  ],
  positions: new Float32Array(tris * 9),
  normals: new Float32Array(tris * 9),
  indices: new Uint32Array(tris * 3),
  faceRanges: new Int32Array(2),
  faces: [],
  edgePositions: new Float32Array(0),
  edgeRanges: new Int32Array(0),
  edges: [],
  tess: { quality: "normal", tolerance: 0.1, linear: 0.045, angular: 0.5, version },
});

describe("display mesh cache (versioned, byte-capped LRU)", () => {
  it("LRU index evicts least recently used entries beyond the byte cap", () => {
    const l = new LruIndex(100);
    expect(l.add("a", 40)).toEqual([]);
    expect(l.add("b", 40)).toEqual([]);
    l.touch("a"); // b is now the oldest
    expect(l.add("c", 40)).toEqual(["b"]);
    expect([...l.entries.keys()].sort()).toEqual(["a", "c"]);
    expect(l.total).toBe(80);
    // an entry bigger than the cap evicts all the others but stays
    expect(l.add("d", 150).sort()).toEqual(["a", "c"]);
  });

  it("stores, evicts by bytes and keeps the index across sessions", async () => {
    const st = new MemStore();
    const per = bodiesBytes([body(1000)]);
    const c = new DisplayMeshCache(st, per * 2.5);
    await c.put("p1", [body(1000)]);
    await c.put("p2", [body(1000)]);
    expect(await c.get("p1")).toBeTruthy(); // p1 used: p2 becomes the oldest
    await c.put("p3", [body(1000)]);
    expect(await c.get("p2")).toBeUndefined();
    expect(await c.get("p1")).toBeTruthy();
    expect(await c.get("p3")).toBeTruthy();
    expect(st.m.has(c.key("p2"))).toBe(false);
    // a new session reads the persisted index
    const c2 = new DisplayMeshCache(st, per * 2.5);
    expect(await c2.get("p3")).toBeTruthy();
    expect(c2.lru.total).toBeLessThanOrEqual(per * 2.5);
  });

  it("invalidates meshes of another tessellation / kernel version", async () => {
    const st = new MemStore();
    const old = new DisplayMeshCache(st, 1e9, "rocc0.t1");
    await old.put("p1", [body(10, "rocc0.t1")]);
    // stage-1 unversioned key
    st.m.set("asm-mesh:abc", [body(10, "x")]);
    const cur = new DisplayMeshCache(st, 1e9);
    expect(await cur.get("p1")).toBeUndefined();
    // old version data deleted on init
    expect([...st.m.keys()].filter((k) => k.startsWith("asm-mesh:"))).toEqual([]);
    await cur.put("p1", [body(10)]);
    expect((await cur.get("p1"))![0].tess!.version).toBe(MESH_CACHE_VERSION);
  });
});

describe("rebuild cache byte cap", () => {
  type E = { shapes: { id: number; bytes: number }[] };
  it("evicts unpinned states (LRU) until the live shapes fit the byte budget", () => {
    const freed: number[] = [];
    const c = new StateCache<E, { id: number; bytes: number }>((e) => e.shapes, (s) => freed.push(s.id), 1000, (s) => s.bytes, 1000);
    const shared = { id: 0, bytes: 100 };
    // 6 versions of a model, 300 bytes each plus a shared 100-byte shape
    for (let v = 0; v < 6; v++) {
      c.set(`k${v}`, { shapes: [shared, { id: v + 1, bytes: 300 }] }, 0);
      c.pin([`k${v}`]);
    }
    c.trim();
    // pinned k5 + as many older versions as fit: 100 + 300 (k5) + 2 × 300 = 1000
    expect(c.stats.liveBytes).toBeLessThanOrEqual(1000);
    expect(c.has("k5")).toBe(true);
    expect(c.has("k4")).toBe(true);
    expect(c.has("k3")).toBe(true);
    expect(c.has("k0")).toBe(false);
    expect(freed.sort()).toEqual([1, 2, 3]);
    expect(freed).not.toContain(0); // still used by the kept states
    // the pinned (current) model is kept even when it alone exceeds the budget
    c.set("big", { shapes: [{ id: 99, bytes: 5000 }] }, 0);
    c.pin(["big"]);
    c.trim();
    expect(c.has("big")).toBe(true);
    expect(c.size).toBe(1);
  });

  it("derives the default budget from the available memory", () => {
    const MB = 1024 * 1024;
    expect(defaultCacheBudget({ deviceMemoryGB: 8 })).toBe(Math.round(0.1 * 2048 * MB)); // wasm heap bound (2 GB)
    expect(defaultCacheBudget({ deviceMemoryGB: 1 })).toBe(Math.round(0.1 * 1024 * MB));
    expect(defaultCacheBudget({ deviceMemoryGB: 0.25 })).toBe(64 * MB);
    expect(defaultCacheBudget({ deviceMemoryGB: 8, heapLimit: 512 * MB })).toBe(Math.round(0.1 * 1024 * MB));
  });
});
