import { beforeAll, describe, expect, it } from "vitest";
import opencascade from "replicad-opencascadejs";
import * as R from "replicad";
import { chainLoops, loopsArea, polyArea, sectionShapes } from "../src/kernel/section";
import { sectionsToDxf } from "../src/io/sectionDxf";
import { parseDxf } from "../src/io/dxf";
import { hatchPatternFor } from "../src/core/hatchStyle";

beforeAll(async () => {
  const OC = await (opencascade as unknown as () => Promise<unknown>)();
  R.setOC(OC as never);
}, 60000);

/** 40 × 20 × 10 block with a Ø10 through hole at (20, 10). */
const block = () => R.makeBox([0, 0, 0], [40, 20, 10]).cut(R.makeCylinder(5, 30, [20, 10, -10], [0, 0, 1]));

describe("loop helpers", () => {
  it("chains segments into loops and computes even-odd areas", () => {
    const sq = (s: number, o = 0): [number, number][][] => [
      [[o, o], [o + s, o]],
      [[o + s, o + s], [o + s, o]], // reversed piece
      [[o + s, o + s], [o, o + s]],
      [[o, o + s], [o, o]],
    ];
    const loops = chainLoops([...sq(10), ...sq(4, 3)], 1e-6);
    expect(loops.length).toBe(2);
    expect(Math.abs(polyArea(loops[0]))).toBeGreaterThan(0);
    expect(loopsArea(loops)).toBeCloseTo(100 - 16, 9);
  });
});

describe("exact planar sections (BRepAlgoAPI_Section)", () => {
  it("section of a block with a hole: length and area match the analytic values", () => {
    const r = sectionShapes([block()], { origin: [0, 0, 5], normal: [0, 0, 1], xDir: [1, 0, 0] });
    // 4 straight sides + a circle, kept exact
    const kinds = r.entities.map((e) => e.t).sort();
    expect(kinds.filter((k) => k === "line").length).toBe(4);
    expect(kinds.filter((k) => k === "circle" || k === "arc").length).toBeGreaterThanOrEqual(1);
    const circ = r.entities.find((e) => e.t === "circle" || e.t === "arc") as { r: number; c: [number, number] };
    expect(circ.r).toBeCloseTo(5, 9);
    expect(circ.c[0]).toBeCloseTo(20, 9);
    expect(circ.c[1]).toBeCloseTo(10, 9);
    expect(r.length).toBeCloseTo(120 + 10 * Math.PI, 6);
    // the area comes from sampled loops: within 0.1 %
    expect(Math.abs(r.area - (800 - 25 * Math.PI)) / (800 - 25 * Math.PI)).toBeLessThan(1e-3);
    expect(r.loops.length).toBe(2);
  });

  it("vertical sections through the hole (X and Y planes)", () => {
    const x = sectionShapes([block()], { origin: [20, 0, 0], normal: [1, 0, 0], xDir: [0, 1, 0] });
    // two 5 × 10 rectangles either side of the hole
    expect(x.area).toBeCloseTo(2 * 5 * 10, 3);
    const y = sectionShapes([block()], { origin: [0, 3, 0], normal: [0, 1, 0], xDir: [1, 0, 0] });
    expect(y.area).toBeCloseTo(40 * 10, 3);
    // plane missing the part: empty
    const none = sectionShapes([block()], { origin: [0, 0, 50], normal: [0, 0, 1], xDir: [1, 0, 0] });
    expect(none.entities.length).toBe(0);
    expect(none.area).toBe(0);
  });

  it("curved section (sphere) is exact in length", () => {
    const s = R.makeSphere(10);
    const r = sectionShapes([s], { origin: [0, 0, 6], normal: [0, 0, 1], xDir: [1, 0, 0] });
    expect(r.length).toBeCloseTo(2 * Math.PI * 8, 5);
    expect(Math.abs(r.area - 64 * Math.PI) / (64 * Math.PI)).toBeLessThan(2e-3);
  });

  it("writes the section outline and hatch to DXF", () => {
    const r1 = sectionShapes([block()], { origin: [0, 0, 5], normal: [0, 0, 1], xDir: [1, 0, 0] });
    const r2 = sectionShapes([block()], { origin: [20, 0, 0], normal: [1, 0, 0], xDir: [0, 1, 0] });
    const dxf = sectionsToDxf([r1, r2], { labels: ["Z = 5", "X = 20"] });
    expect(dxf).toContain("ENTITIES");
    expect(dxf).toMatch(/CIRCLE|ARC/);
    expect(dxf).toContain("HATCH");
    expect(dxf).toContain("Z = 5");
    const parsed = parseDxf(dxf) as unknown as { entities?: unknown[] } & Record<string, unknown>;
    expect(JSON.stringify(parsed).length).toBeGreaterThan(100);
    // outline lines on VISIBLE: 4 for the block section + 8 for the two rectangles
    const visibleLines = dxf.split("\r\n0\r\nLINE\r\n8\r\nVISIBLE").length - 1;
    expect(visibleLines).toBe(12);
    expect(hatchPatternFor(0).angle).toBe(45);
  });
});
