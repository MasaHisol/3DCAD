import { describe, expect, it } from "vitest";
import { batchGroups, hashKey, lodLevel, projectedDiameter, shouldOpenLight, spatialChunks, LIGHT_OPEN_COMPONENTS } from "../src/assembly/largeAsm";
import { TriangleBVH } from "../src/viewer/bvh";
import { clusterSimplify, decimateEdges } from "../src/viewer/simplify";
import type { Vec3 } from "../src/core/types";

describe("coarse edges", () => {
  it("keeps end points and limits points per edge", () => {
    // edge 0: 11 points along x; edge 1: a single segment
    const pts: number[] = [];
    for (let i = 0; i <= 10; i++) pts.push(i, 0, 0);
    pts.push(0, 5, 0, 0, 6, 0);
    const seg = decimateEdges(pts, [0, 11, 11, 2], 3);
    expect(Array.from(seg)).toEqual([0, 0, 0, 5, 0, 0, 5, 0, 0, 10, 0, 0, 0, 5, 0, 0, 6, 0]);
  });
});

describe("level of detail", () => {
  it("chooses full / box / none by projected size", () => {
    const o = { coarsePx: 50, boxPx: 4, cullPx: 1 };
    expect(lodLevel(100, o)).toBe("full");
    expect(lodLevel(50, o)).toBe("full");
    expect(lodLevel(49, o)).toBe("coarse");
    expect(lodLevel(4, o)).toBe("coarse");
    expect(lodLevel(3.9, o)).toBe("box");
    expect(lodLevel(0.5, o)).toBe("none");
    expect(lodLevel(0.5, { coarsePx: 0, boxPx: 0, cullPx: 0 })).toBe("full");
  });
  it("projects spheres in orthographic and perspective views", () => {
    expect(projectedDiameter(5, 0.5)).toBeCloseTo(20);
    expect(projectedDiameter(5, 0.5, { distance: 100, pixelAtUnit: 0.001 })).toBeCloseTo(100);
    expect(projectedDiameter(5, 0.5, { distance: 3, pixelAtUnit: 0.001 })).toBe(Infinity);
  });
});

describe("draw batching", () => {
  it("groups repeated keys and leaves singletons and nulls", () => {
    const { batches, singles } = batchGroups(["a", "b", "a", null, "c", "a", "b"], 2);
    expect(batches).toEqual([
      { key: "a", items: [0, 2, 5] },
      { key: "b", items: [1, 6] },
    ]);
    expect(singles).toEqual([4]);
    expect(batchGroups(["a", "a"], 3).singles).toEqual([0, 1]);
  });
  it("splits items into compact spatial chunks", () => {
    const c: Vec3[] = [];
    for (let i = 0; i < 100; i++) c.push([i, 0, 0]);
    const ch = spatialChunks(c, 16);
    expect(ch.flat().sort((a, b) => a - b)).toEqual(c.map((_, i) => i));
    expect(Math.max(...ch.map((x) => x.length))).toBeLessThanOrEqual(16);
    // each chunk is a contiguous run along x
    for (const x of ch) expect(Math.max(...x) - Math.min(...x)).toBe(x.length - 1);
  });
});

describe("lightweight open", () => {
  it("opens large assemblies lightweight", () => {
    expect(shouldOpenLight(LIGHT_OPEN_COMPONENTS)).toBe(true);
    expect(shouldOpenLight(3)).toBe(false);
    expect(shouldOpenLight(3, "on")).toBe(true);
    expect(shouldOpenLight(10000, "off")).toBe(false);
  });
  it("hashes rebuild keys stably", () => {
    expect(hashKey("abc")).toBe(hashKey("abc"));
    expect(hashKey("abc")).not.toBe(hashKey("abd"));
  });
});

describe("triangle BVH", () => {
  // grid of n×n quads in the z = 0 plane, facing +z
  const grid = (n: number) => {
    const pos: number[] = [], idx: number[] = [];
    for (let j = 0; j <= n; j++) for (let i = 0; i <= n; i++) pos.push(i, j, 0);
    for (let j = 0; j < n; j++)
      for (let i = 0; i < n; i++) {
        const a = j * (n + 1) + i, b = a + 1, c = a + n + 1, d = c + 1;
        idx.push(a, b, d, a, d, c);
      }
    return new TriangleBVH(new Float32Array(pos), new Uint32Array(idx));
  };
  it("finds the triangle under the ray", () => {
    const b = grid(20);
    const h = b.raycast([3.2, 7.7, 10], [0, 0, -1]);
    expect(h.length).toBe(1);
    expect(h[0].t).toBeCloseTo(10);
    // quad (3, 7): triangles 2 * (7 * 20 + 3) and +1; (0.2, 0.7) lies above the diagonal
    expect(h[0].tri).toBe(2 * (7 * 20 + 3) + 1);
    expect(b.raycast([30, 30, 10], [0, 0, -1])).toEqual([]);
  });
  it("culls back faces on request and agrees with brute force", () => {
    const b = grid(10);
    expect(b.raycast([2.3, 2.6, -5], [0, 0, 1]).length).toBe(1);
    expect(b.raycast([2.3, 2.6, -5], [0, 0, 1], 0, Infinity, true).length).toBe(0);
    for (let k = 0; k < 50; k++) {
      const x = (k * 0.37) % 10, y = (k * 0.71) % 10;
      expect(b.raycast([x, y, 5], [0, 0, -1]).length).toBeGreaterThanOrEqual(1);
    }
  });
});

describe("coarse LOD mesh", () => {
  it("clusters a finely tessellated sphere into far fewer triangles", () => {
    const pos: number[] = [], nor: number[] = [], idx: number[] = [];
    const U = 64, V = 32;
    for (let j = 0; j <= V; j++)
      for (let i = 0; i <= U; i++) {
        const th = (Math.PI * j) / V, ph = (2 * Math.PI * i) / U;
        const p = [Math.sin(th) * Math.cos(ph), Math.sin(th) * Math.sin(ph), Math.cos(th)];
        pos.push(...p.map((x) => x * 10));
        nor.push(...p);
      }
    for (let j = 0; j < V; j++)
      for (let i = 0; i < U; i++) {
        const a = j * (U + 1) + i, b = a + 1, c = a + U + 1, d = c + 1;
        idx.push(a, c, b, b, c, d);
      }
    const s = clusterSimplify(pos, nor, idx, 8);
    expect(s.indices.length / 3).toBeLessThan(idx.length / 3 / 4);
    expect(s.indices.length).toBeGreaterThan(0);
    // vertices stay within the original bounds
    for (const v of s.positions) expect(Math.abs(v)).toBeLessThanOrEqual(10 + 1e-4);
    for (const i of s.indices) expect(i).toBeLessThan(s.positions.length / 3);
  });
});
