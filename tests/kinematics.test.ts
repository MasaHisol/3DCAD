import { describe, expect, it } from "vitest";
import { kinematics, minDistance, triSet } from "../src/assembly/kinematics";

const cube = (x: number, s = 10) => {
  const p: number[] = [];
  for (let i = 0; i < 8; i++) p.push(x + (i & 1 ? s : 0), i & 2 ? s : 0, i & 4 ? s : 0);
  const f = [0, 2, 1, 1, 2, 3, 4, 5, 6, 5, 7, 6, 0, 1, 4, 1, 5, 4, 2, 6, 3, 3, 6, 7, 0, 4, 2, 2, 4, 6, 1, 3, 5, 3, 7, 5];
  return triSet(Float32Array.from(p), Uint32Array.from(f));
};

describe("motion study", () => {
  it("circular motion: v = ωr, a = ω²r", () => {
    const r = 50, w = 2 * Math.PI, n = 400;
    const s = Array.from({ length: n + 1 }, (_, i) => {
      const t = i / n;
      return { t, p: [r * Math.cos(w * t), r * Math.sin(w * t), 0] as [number, number, number] };
    });
    const k = kinematics(s);
    expect(k.vel[200]).toBeCloseTo(w * r, 0);
    expect(k.acc[200] / (w * w * r)).toBeCloseTo(1, 2);
  });
  it("clearance between cubes", () => {
    expect(minDistance(cube(0), cube(13))).toBeCloseTo(3, 5);
    expect(minDistance(cube(0), cube(10))).toBeCloseTo(0, 5);
  });
});
