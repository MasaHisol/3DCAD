import { describe, expect, it } from "vitest";
import { stackup } from "../src/analysis/tolerance";

describe("tolerance stack-up", () => {
  // housing 50 ±0.1 minus three parts 10 ±0.05, 20 ±0.05, 19.5 ±0.05 → gap 0.5
  const rows = [
    { name: "H", nominal: 50, upper: 0.1, lower: -0.1, dir: 1 as const },
    { name: "A", nominal: 10, upper: 0.05, lower: -0.05, dir: -1 as const },
    { name: "B", nominal: 20, upper: 0.05, lower: -0.05, dir: -1 as const },
    { name: "C", nominal: 19.5, upper: 0.05, lower: -0.05, dir: -1 as const },
  ];
  it("worst case and RSS", () => {
    const r = stackup(rows, { min: 0.3 });
    expect(r.nominal).toBeCloseTo(0.5, 9);
    expect(r.worstMin).toBeCloseTo(0.25, 9);
    expect(r.worstMax).toBeCloseTo(0.75, 9);
    expect(r.rss).toBeCloseTo(Math.sqrt(0.01 + 3 * 0.0025), 9);
    expect(r.mc.sigma * 3).toBeCloseTo(r.rss, 2);
    expect(r.mc.yield!).toBeGreaterThan(0.99);
    expect(r.contrib[0]).toBeCloseTo((100 * 0.01) / 0.0175, 6);
  });
  it("asymmetric tolerance shifts the mean", () => {
    const r = stackup([{ name: "x", nominal: 10, upper: 0.2, lower: 0, dir: 1 }]);
    expect(r.mean).toBeCloseTo(10.1, 9);
  });
});
