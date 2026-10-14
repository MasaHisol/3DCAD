import { describe, expect, it } from "vitest";
import { arrangeDims, findChamfers, holeTable, stackRows } from "../src/drawing/annolayout";
import type { DimAnno } from "../src/drawing/types";
import type { ViewGeometry } from "../src/kernel/protocol";

const L = (a: [number, number], b: [number, number]) => ({ t: "line" as const, a, b, tag: 0 });
const C = (c: [number, number], r: number) => ({ t: "circle" as const, c, r, tag: 0 });
// 100×60 plate with 2 chamfers C5 at the top corners and 3 holes (2×φ10, 1×φ6)
const geo = {
  bounds: [0, 0, 100, 60],
  visible: [
    L([0, 0], [100, 0]), L([100, 0], [100, 55]), L([100, 55], [95, 60]), L([95, 60], [5, 60]), L([5, 60], [0, 55]), L([0, 55], [0, 0]),
    C([20, 20], 5), C([80, 20], 5), C([50, 40], 3),
  ],
  hidden: [],
} as unknown as ViewGeometry;

describe("drawing annotation layout", () => {
  it("stacks overlapping intervals, short ones first", () => {
    expect(stackRows([{ lo: 0, hi: 100 }, { lo: 0, hi: 20 }, { lo: 30, hi: 50 }])).toEqual([1, 0, 0]);
  });
  it("arranges baseline dims into separate rows", () => {
    const mk = (id: string, x: number): DimAnno => ({ id, type: "dim", view: "v", kind: "horizontal", refs: [{ kind: "point", p: [0, 0] }, { kind: "point", p: [x, 0] }], pos: [x / 2, -10] });
    const m = arrangeDims([mk("a", 100), mk("b", 20), mk("c", 80)], [0, 0, 100, 60], 1);
    const ys = ["a", "b", "c"].map((k) => m.get(k)![1]);
    expect(new Set(ys).size).toBe(3);
    expect(ys[1]).toBeGreaterThan(ys[2]);
    expect(ys[2]).toBeGreaterThan(ys[0]);
  });
  it("hole table tags by size", () => {
    const rows = holeTable(geo, [0, 0]);
    expect(rows.map((r) => r.tag)).toEqual(["A1", "A2", "B1"]);
    expect(rows[1]).toMatchObject({ x: 80, y: 20, d: 10 });
  });
  it("finds chamfers", () => {
    const ch = findChamfers(geo);
    expect(ch).toHaveLength(1);
    expect(ch[0].c).toBeCloseTo(5, 6);
    expect(ch[0].n).toBe(2);
    expect(ch[0].dir[1]).toBeGreaterThan(0);
  });
});

import { breakBands, toSheet, toView } from "../src/drawing/geom";
import type { DView } from "../src/drawing/types";

describe("broken view mapping", () => {
  const v = { id: "v", label: "", kind: "base", dir: [0, 0, 1], xAxis: [1, 0, 0], scale: 1, x: 0, y: 0, hidden: false, centerMarks: false, breaks: [{ axis: "x", a: 100, b: 900 }] } as DView;
  it("shortens and round-trips", () => {
    expect(toSheet(v, [50, 0])[0]).toBe(50);
    expect(toSheet(v, [1000, 0])[0]).toBeCloseTo(1000 - 800 + 6, 9);
    expect(toView(v, toSheet(v, [950, 3]))[0]).toBeCloseTo(950, 9);
    expect(toView(v, toSheet(v, [950, 3]))[1]).toBeCloseTo(3, 9);
    const [b] = breakBands(v);
    expect([b.s0, b.s1]).toEqual([100, 106]);
  });
});
