import { describe, expect, it } from "vitest";
import { generateToolpath, toGcode, type CamOp, type CamTool } from "../src/cam/toolpath";

const tool: CamTool = { d: 6, stepover: 0.4, stepdown: 2, feed: 600, plunge: 150, rpm: 8000 };
const rect = (x0: number, y0: number, x1: number, y1: number): [number, number][] => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
const base: CamOp = { kind: "pocket", regions: [{ outer: rect(0, 0, 40, 20), holes: [] }], points: [], depth: 5, outside: true, allowance: 0, peck: 0 };
const cutBox = (m: { rapid: boolean; p: number[] }[]) => {
  const c = m.filter((x) => !x.rapid).map((x) => x.p);
  return [0, 1, 2].map((k) => [Math.min(...c.map((p) => p[k])), Math.max(...c.map((p) => p[k]))]);
};

describe("2.5D CAM", () => {
  it("pocket stays one tool radius inside the walls, 3 depth passes", () => {
    const r = generateToolpath(base, tool, 5);
    const [bx, by, bz] = cutBox(r.moves);
    expect(bx[0]).toBeCloseTo(3, 2);
    expect(bx[1]).toBeCloseTo(37, 2);
    expect(by[0]).toBeCloseTo(3, 2);
    expect(by[1]).toBeCloseTo(17, 2);
    expect(bz[0]).toBeCloseTo(-5, 6);
    expect(new Set(r.moves.filter((m) => !m.rapid).map((m) => m.p[2].toFixed(3))).size).toBe(3);
    expect(r.warnings).toEqual([]);
  });
  it("pocket avoids an island", () => {
    const r = generateToolpath({ ...base, regions: [{ outer: rect(0, 0, 60, 40), holes: [rect(25, 15, 35, 25)] }] }, tool, 5);
    // distance from every cutting point to the island rectangle ≥ tool radius
    const dist = (x: number, y: number) => Math.hypot(Math.max(25 - x, 0, x - 35), Math.max(15 - y, 0, y - 25));
    const minD = Math.min(...r.moves.filter((m) => !m.rapid).map((m) => dist(m.p[0], m.p[1])));
    expect(minD).toBeGreaterThan(3 - 0.01);
  });
  it("outside contour at tool radius, drill with pecks, G-code", () => {
    const c = generateToolpath({ ...base, kind: "contour" }, tool, 5);
    const [bx] = cutBox(c.moves);
    expect(bx[0]).toBeCloseTo(-3, 2);
    expect(bx[1]).toBeCloseTo(43, 2);
    const d = generateToolpath({ ...base, kind: "drill", points: [[10, 10]], depth: 9, peck: 3 }, tool, 5);
    expect(d.moves.filter((m) => !m.rapid).map((m) => m.p[2])).toEqual([-3, -6, -9]);
    const g = toGcode("test", [{ label: "pocket", res: generateToolpath(base, tool, 5), tool, toolNo: 1 }], 5);
    expect(g).toContain("T1 M06");
    expect(g).toContain("S8000 M03");
    expect(g).toMatch(/G01 .*F150/);
    expect(g.trim().endsWith("%")).toBe(true);
  });
});
