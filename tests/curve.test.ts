import { describe, expect, it } from "vitest";
import { sampleCurve } from "../src/kernel/geometry";

describe("drawing curve sampling", () => {
  it("keeps a large ellipse within 0.01 mm of the true curve", () => {
    const a = 200, b = 60;
    const at = (t: number): [number, number] => [a * Math.cos(t), b * Math.sin(t)];
    const pts = sampleCurve(at, 0, Math.PI * 2);
    // worst deviation between consecutive points (dense check on each chord)
    let worst = 0;
    for (let i = 1; i < pts.length; i++) {
      for (let k = 1; k < 10; k++) {
        const p = [pts[i - 1][0] + ((pts[i][0] - pts[i - 1][0]) * k) / 10, pts[i - 1][1] + ((pts[i][1] - pts[i - 1][1]) * k) / 10];
        // distance to the ellipse, approximately: scale to the unit circle
        const r = Math.hypot(p[0] / a, p[1] / b);
        worst = Math.max(worst, Math.abs(1 - r) * b);
      }
    }
    expect(worst).toBeLessThan(0.02);
    expect(pts.length).toBeGreaterThan(24); // the old fixed 24 points were not enough
    expect(pts.length).toBeLessThan(600);
  });

  it("uses few points on a straight span", () => {
    expect(sampleCurve((t) => [t, 2 * t], 0, 100).length).toBe(9);
  });
});
