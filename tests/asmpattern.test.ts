import { describe, expect, it } from "vitest";
import { patternMatrices } from "../src/assembly/pattern";
import { IDENTITY } from "../src/assembly/types";

describe("component patterns", () => {
  it("rectangular 3 × 2", () => {
    const m = patternMatrices({ id: "p", name: "", source: "c", kind: "rect", dir1: [1, 0, 0], count1: 3, spacing1: 20, dir2: [0, 1, 0], count2: 2, spacing2: 15 }, IDENTITY);
    expect(m.length).toBe(5);
    expect(m.map((x) => [x[12], x[13]])).toEqual([[20, 0], [40, 0], [0, 15], [20, 15], [40, 15]]);
  });
  it("circular 4 × 90° about Z through (0,0,0)", () => {
    const src = [...IDENTITY];
    src[12] = 50;
    const m = patternMatrices({ id: "p", name: "", source: "c", kind: "circ", dir1: [1, 0, 0], count1: 1, spacing1: 0, axisPoint: [0, 0, 0], axisDir: [0, 0, 1], count: 4, angle: 360 }, src);
    expect(m.length).toBe(3);
    expect(m[0][12]).toBeCloseTo(0, 9);
    expect(m[0][13]).toBeCloseTo(50, 9);
    expect(m[1][12]).toBeCloseTo(-50, 9);
  });
});
