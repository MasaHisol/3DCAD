// Engine #3: dependency graph, state cache, worker pool and incremental == full rebuild.
import { beforeAll, describe, expect, it } from "vitest";
import opencascade from "replicad-opencascadejs";
import { setOC } from "replicad";
import { affectedFeatures, affectedSet, buildDepGraph, changedNodes, fNode, firstAffectedBodyIndex, pNode } from "../src/core/depgraph";
import { newDocument } from "../src/core/document";
import type { Feature, PartDocument } from "../src/core/types";
import { StateCache, prefixKeys, resumeIndex } from "../src/kernel/rebuildCache";
import { KernelPool, poolSize, type PoolWorker } from "../src/kernel/pool";
import { KernelCrashError } from "../src/kernel/client";
import { GeometryEngine } from "../src/kernel/geometry";
import { compareSignatures, signature } from "../src/kernel/verifyRebuild";
import type { RebuildResult, RFeature } from "../src/kernel/protocol";
import { edit, longModel, nudge } from "./helpers/longModel";

// ------------------------------------------------------------ dep graph ---

function doc(): PartDocument {
  const d = newDocument("t");
  d.params = [
    { name: "w", expr: "40", unit: "mm", kind: "user" },
    { name: "h", expr: "w / 2", unit: "mm", kind: "user" },
    { name: "depth", expr: "10", unit: "mm", kind: "user" },
    { name: "r", expr: "2", unit: "mm", kind: "user" },
    { name: "unused", expr: "5", unit: "mm", kind: "user" },
  ];
  const f = (x: Record<string, unknown>) => x as unknown as Feature;
  d.features = [
    f({ id: "s1", name: "s1", type: "sketch", plane: {}, entities: [], constraints: [], dimensions: [{ param: "w" }, { param: "h" }] }),
    f({ id: "e1", name: "e1", type: "extrude", sketch: "s1", distance: "depth" }),
    f({ id: "wp", name: "wp", type: "workplane", offset: "5" }),
    f({ id: "s2", name: "s2", type: "sketch", planeRef: "wp", entities: [], constraints: [], dimensions: [] }),
    f({ id: "e2", name: "e2", type: "extrude", sketch: "s2", distance: "3" }),
    f({ id: "f1", name: "f1", type: "fillet", edges: [{ mid: [0, 0, 0], name: "E[e1:end | e1:side:L1]" }], radius: "r" }),
    f({ id: "s3", name: "s3", type: "sketch", faceRef: { center: [0, 0, 0], normal: [0, 0, 1], name: "e2:end" }, entities: [], constraints: [], dimensions: [] }),
    f({ id: "e3", name: "e3", type: "extrude", sketch: "s3", distance: "1" }),
  ];
  d.endOfPart = d.features.length;
  return d;
}

const mod = (d: PartDocument, fn: (d: PartDocument) => void) => {
  const c = structuredClone(d);
  fn(c);
  return c;
};

describe("dependency graph", () => {
  it("links parameters, sketches, work planes, named references and the body chain", () => {
    const g = buildDepGraph(doc());
    const has = (a: string, b: string) => g.out.get(a)?.has(b) ?? false;
    expect(has(pNode("w"), pNode("h"))).toBe(true);
    expect(has(pNode("w"), fNode("s1"))).toBe(true);
    expect(has(pNode("depth"), fNode("e1"))).toBe(true);
    expect(has(fNode("s1"), fNode("e1"))).toBe(true);
    expect(has(fNode("wp"), fNode("s2"))).toBe(true);
    expect(has(fNode("e1"), fNode("f1"))).toBe(true); // named edge reference
    expect(has(fNode("e2"), fNode("s3"))).toBe(true); // sketch on a model face
    expect(has(fNode("e1"), fNode("e2"))).toBe(true); // body chain
    expect(g.out.get(pNode("unused"))).toBeUndefined();
  });

  it("affected set of a parameter change", () => {
    const d = doc();
    const next = mod(d, (x) => (x.params.find((p) => p.name === "r")!.expr = "3"));
    expect(affectedFeatures(d, next)).toEqual(["f1", "s3", "e3"]);
    const w = mod(d, (x) => (x.params[0].expr = "50"));
    const set = affectedSet(buildDepGraph(w), changedNodes(d, w));
    expect(set.has(pNode("h"))).toBe(true);
    expect(affectedFeatures(d, w)).toEqual(["s1", "e1", "e2", "f1", "s3", "e3"]);
    expect(affectedFeatures(d, mod(d, (x) => (x.params[4].expr = "6")))).toEqual([]);
  });

  it("edit downstream / upstream, suppress, reorder, delete, rollback", () => {
    const d = doc();
    const last = mod(d, (x) => ((x.features[7] as unknown as { distance: string }).distance = "2"));
    expect(affectedFeatures(d, last)).toEqual(["e3"]);
    const wp = mod(d, (x) => ((x.features[2] as unknown as { offset: string }).offset = "6"));
    expect(affectedFeatures(d, wp)).toEqual(["wp", "s2", "e2", "f1", "s3", "e3"]);
    const sup = mod(d, (x) => (x.features[4].suppressed = true));
    expect(affectedFeatures(d, sup)).toEqual(["e2", "f1", "s3", "e3"]);
    expect(affectedFeatures(sup, d)).toEqual(["e2", "f1", "s3", "e3"]); // unsuppress / undo
    const re = mod(d, (x) => ([x.features[4], x.features[5]] = [x.features[5], x.features[4]]));
    expect(affectedFeatures(d, re)).toEqual(["f1", "e2", "s3", "e3"]);
    const del = mod(d, (x) => x.features.splice(5, 1));
    expect(affectedFeatures(d, del)).toEqual(["s3", "e3"]);
    const roll = mod(d, (x) => (x.endOfPart = 5));
    expect(affectedFeatures(d, roll)).toEqual(["f1", "s3", "e3"]);
    expect(affectedFeatures(d, structuredClone(d))).toEqual([]);
  });

  it("first affected body feature = where the kernel resumes", () => {
    const d = doc();
    const next = mod(d, (x) => (x.params.find((p) => p.name === "r")!.expr = "3"));
    // body features: e1, e2, f1, e3
    expect(firstAffectedBodyIndex(next, affectedFeatures(d, next))).toBe(2);
    expect(firstAffectedBodyIndex(d, [])).toBe(4);
  });
});

// ---------------------------------------------------------- state cache ---

describe("state cache", () => {
  it("prefix keys change from the first edited feature on", () => {
    const a = prefixKeys([{ a: 1 }, { b: 2 }, { c: 3 }]);
    const b = prefixKeys([{ a: 1 }, { b: 9 }, { c: 3 }]);
    expect(a[0]).toBe(b[0]);
    expect(a[1]).not.toBe(b[1]);
    expect(a[2]).not.toBe(b[2]);
    expect(resumeIndex(b, (k) => a.includes(k))).toBe(1);
  });

  it("reference counts shapes, pins the current model, evicts old versions from their tail", () => {
    const freed: string[] = [];
    type E = { shapes: { n: string }[] };
    const S = (n: string) => ({ n });
    const c = new StateCache<E, { n: string }>((e) => e.shapes, (s) => freed.push(s.n), 2);
    const s0 = S("base"), s1 = S("v1"), s2 = S("v2");
    c.set("k0", { shapes: [s0] }, 0);
    c.set("k1", { shapes: [s0, s1] }, 1);
    c.pin(["k0", "k1"]);
    c.set("k1b", { shapes: [s0, s2] }, 1);
    c.pin(["k0", "k1b"]);
    c.trim(0);
    expect(c.has("k1")).toBe(false);
    expect(freed).toEqual(["v1"]); // base still used by pinned entries
    expect(c.has("k0") && c.has("k1b")).toBe(true);
    c.clear();
    expect(freed.sort()).toEqual(["base", "v1", "v2"]);
  });

  it("keeps the prefix of an older version when trimming", () => {
    const c = new StateCache<number, object>(() => [], () => {}, 2);
    ["a0", "a1", "a2"].forEach((k, i) => c.set(k, i, i));
    c.pin(["a0", "a1", "a2"]);
    ["b0", "b1", "b2"].forEach((k, i) => c.set(k, i, i));
    c.pin(["b0", "b1", "b2"]);
    c.trim(2);
    expect([c.has("a0"), c.has("a1"), c.has("a2")]).toEqual([true, true, false]);
  });
});

// ----------------------------------------------------------- worker pool ---

const fakeResult = (id: string): RebuildResult => ({ bodies: [{ name: id } as never], errors: {}, updatedRefs: {}, timeMs: 0, threads: [] });

describe("worker pool", () => {
  it("sizes from cores and memory", () => {
    expect(poolSize(1)).toBe(0);
    expect(poolSize(4, 8)).toBe(2);
    expect(poolSize(16, 16)).toBe(4);
    expect(poolSize(16, 4)).toBe(2);
    expect(poolSize(16, 2)).toBe(0);
  });

  it("builds jobs in parallel, merges results in job order and retries a crashed job once", async () => {
    let active = 0, peak = 0, spawned = 0, disposed = 0;
    let crashOnce = true;
    const factory = (): PoolWorker => {
      spawned++;
      return {
        init: async () => true,
        dropEngine: async () => true,
        dispose: () => void disposed++,
        rebuildKey: async (key) => {
          active++;
          peak = Math.max(peak, active);
          await new Promise((r) => setTimeout(r, 5));
          active--;
          if (key === "pool:p3" && crashOnce) {
            crashOnce = false;
            throw new KernelCrashError("crash");
          }
          if (key === "pool:bad") throw new Error("feature failed");
          return fakeResult(key);
        },
      };
    };
    const pool = new KernelPool(factory, 3, 0);
    const seen: string[] = [];
    const ids = ["p1", "p2", "p3", "p4", "p5", "bad"];
    const res = await pool.run(ids.map((id) => ({ id, features: [] as RFeature[] })), (r) => seen.push(r.id));
    expect(res.map((r) => r.id)).toEqual(ids);
    expect(res.filter((r) => r.result).map((r) => r.result!.bodies[0].name)).toEqual(["pool:p1", "pool:p2", "pool:p3", "pool:p4", "pool:p5"]);
    expect(res[5].error).toBe("feature failed");
    expect(seen.sort()).toEqual([...ids].sort());
    expect(peak).toBe(3);
    expect(spawned).toBe(3);
    expect(pool.stats.retries).toBe(1);
    pool.shutdown();
    expect(disposed).toBe(3);
  });
});

// ------------------------------------------------- incremental == full ---

beforeAll(async () => {
  const OC = await (opencascade as unknown as () => Promise<unknown>)();
  setOC(OC as never);
}, 60000);

async function full(fs: RFeature[]) {
  const e = new GeometryEngine();
  const r = await e.rebuild(fs);
  const s = signature(e, r);
  e.dispose();
  return s;
}

describe("incremental rebuild", () => {
  it("resumes after the last unaffected feature and matches a full rebuild", async () => {
    const base = longModel(16);
    const eng = new GeometryEngine();
    let r = await eng.rebuild(base);
    expect(r.errors).toEqual({});
    expect(r.stats!.recomputed).toBe(base.length);
    const check = async (fs: RFeature[], first: number) => {
      r = await eng.rebuild(fs);
      expect(r.stats!.first).toBe(first);
      expect(compareSignatures(signature(eng, r), await full(fs))).toEqual([]);
    };
    // edit downstream (last), upstream (middle), first
    await check(edit(base, "last", (f) => nudge(f)), base.length - 1);
    await check(edit(base, base[5].id, (f) => nudge(f)), 5);
    await check(edit(base, "base", (f) => f.type === "extrude" && (f.to = 22)), 0);
    // undo back to the original: everything cached
    await check(base, base.length);
    // suppress (feature removed from the resolved list) / unsuppress
    await check(base.filter((f) => f.id !== base[8].id), 8);
    await check(base, base.length);
    // reorder two independent features
    const re = base.slice();
    [re[6], re[7]] = [re[7], re[6]];
    await check(re, 6);
    // rollback bar: a prefix is fully cached
    await check(base.slice(0, 10), 10);
    eng.dispose();
  }, 300000);

  it("equals a full rebuild on a randomized edit sequence (verify mode)", async () => {
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const base = longModel(14);
    const eng = new GeometryEngine();
    GeometryEngine.verify = true;
    const history: RFeature[][] = [base];
    let cur = base;
    try {
      await eng.rebuild(cur);
      for (let step = 0; step < 10; step++) {
        const op = rnd();
        if (op < 0.5) {
          const f = cur[1 + Math.floor(rnd() * (cur.length - 1))];
          cur = edit(cur, f.id, (x) => nudge(x, 1 + Math.floor(rnd() * 3)));
        } else if (op < 0.7) {
          const i = 1 + Math.floor(rnd() * (cur.length - 2));
          if (cur[i].type !== "pattern" && cur[i + 1].type !== "pattern") cur = cur.filter((_, k) => k !== i);
        } else cur = history[Math.floor(rnd() * history.length)]; // undo / redo
        history.push(cur);
        const r = await eng.rebuild(cur); // verify mode throws on any difference
        expect(Object.keys(r.errors)).toEqual([]);
      }
    } finally {
      GeometryEngine.verify = false;
      eng.dispose();
    }
  }, 600000);

  it("bounds the cache and frees evicted shapes", async () => {
    const prev = GeometryEngine.maxExtraStates;
    GeometryEngine.maxExtraStates = 4;
    const base = longModel(10);
    const eng = new GeometryEngine();
    try {
      for (let k = 0; k < 6; k++) await eng.rebuild(edit(base, base[2].id, (f) => nudge(f, k)));
      const st = eng.lastStats!.cache;
      expect(st.entries).toBeLessThanOrEqual(base.length + 4);
      expect(st.freed).toBeGreaterThan(0);
      const r = await eng.rebuild(edit(base, base[2].id, (f) => nudge(f, 5)));
      expect(r.stats!.recomputed).toBe(0);
    } finally {
      GeometryEngine.maxExtraStates = prev;
      eng.dispose();
    }
  }, 300000);
});
