import { describe, expect, it } from "vitest";
import { FEA_MATERIALS, sampleDisp, solveFea, type FeaMesh } from "../src/analysis/fea";

/** Axis-aligned box as a triangle soup, with the triangle ids of each face. */
function box(lx: number, ly: number, lz: number): { mesh: FeaMesh; faces: Record<string, number[]> } {
  const v = [
    [0, 0, 0], [lx, 0, 0], [lx, ly, 0], [0, ly, 0],
    [0, 0, lz], [lx, 0, lz], [lx, ly, lz], [0, ly, lz],
  ];
  const quads: Record<string, number[]> = { xmin: [0, 3, 7, 4], xmax: [1, 5, 6, 2], ymin: [0, 4, 5, 1], ymax: [3, 2, 6, 7], zmin: [0, 1, 2, 3], zmax: [4, 7, 6, 5] };
  const idx: number[] = [];
  const faces: Record<string, number[]> = {};
  let t = 0;
  for (const [k, q] of Object.entries(quads)) {
    idx.push(q[0], q[1], q[2], q[0], q[2], q[3]);
    faces[k] = [t, t + 1];
    t += 2;
  }
  return { mesh: { positions: v.flat(), indices: idx }, faces };
}

describe("stress analysis", () => {
  it("matches beam theory for a cantilever", () => {
    const L = 100, b = 10, hgt = 10, F = 100;
    const { mesh, faces } = box(L, hgt, b);
    const steel = FEA_MATERIALS["鋼"];
    const r = solveFea(mesh, { fixed: [faces.xmin], loads: [{ tris: faces.xmax, force: [0, -F, 0] }] }, steel, { resolution: 100 });
    expect(r.converged).toBe(true);
    expect(r.elements).toBe(100 * 10 * 10);
    const I = (b * hgt ** 3) / 12;
    const theory = (F * L ** 3) / (3 * steel.E * I);
    const tip = sampleDisp(r, [L, hgt / 2, b / 2]);
    // trilinear bricks are a little stiff in bending; shear adds a little
    expect(Math.abs(tip[1]) / theory).toBeGreaterThan(0.85);
    expect(Math.abs(tip[1]) / theory).toBeLessThan(1.1);
    // bending stress at the root: M c / I (peak element value is near it)
    const sigma = (F * L * (hgt / 2)) / I;
    expect(r.maxVm / sigma).toBeGreaterThan(0.6);
    expect(r.maxVm / sigma).toBeLessThan(1.4);
  }, 60000);

  it("tension bar: uniform stress F/A", () => {
    const { mesh, faces } = box(50, 10, 10);
    const r = solveFea(mesh, { fixed: [faces.xmin], loads: [{ tris: faces.xmax, force: [1000, 0, 0] }] }, FEA_MATERIALS["鋼"], { resolution: 25 });
    const mid = r.vm[(2 * r.dims[1] + 2) * r.dims[0] + 12];
    expect(mid).toBeCloseTo(1000 / 100, 0);
  }, 60000);
});
