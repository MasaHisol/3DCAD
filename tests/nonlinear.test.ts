import { describe, expect, it } from "vitest";
import { FEA_MATERIALS, type FeaMesh } from "../src/analysis/fea";
import { solvePlastic } from "../src/analysis/nonlinear";

function box(lx: number, ly: number, lz: number): { mesh: FeaMesh; faces: Record<string, number[]> } {
  const v = [[0, 0, 0], [lx, 0, 0], [lx, ly, 0], [0, ly, 0], [0, 0, lz], [lx, 0, lz], [lx, ly, lz], [0, ly, lz]];
  const quads: Record<string, number[]> = { xmin: [0, 3, 7, 4], xmax: [1, 5, 6, 2], ymin: [0, 4, 5, 1], ymax: [3, 2, 6, 7], zmin: [0, 1, 2, 3], zmax: [4, 7, 6, 5] };
  const idx: number[] = [];
  const faces: Record<string, number[]> = {};
  let t = 0;
  for (const [k, q] of Object.entries(quads)) {
    idx.push(q[0], q[2], q[1], q[0], q[3], q[2]);
    faces[k] = [t, t + 1];
    t += 2;
  }
  return { mesh: { positions: v.flat(), indices: idx }, faces };
}

// cantilever 100 × 10 × 10, σy = 250 MPa: first yield at the root F_y = σy b h² / 6 / L,
// plastic collapse (full plastic hinge) at 1.5 F_y
const L = 100, hh = 10, b = 10;
const { mesh, faces } = box(L, hh, b);
const mat = { ...FEA_MATERIALS["汎用"], yield: 250 };
const Fy = (250 * b * hh * hh) / 6 / L;
const bcAt = (F: number) => ({ fixed: [faces.xmin], loads: [{ tris: faces.xmax, force: [0, -F, 0] as [number, number, number] }] });
const opt = { resolution: 60 };

describe("elasto-plastic (secant) analysis", () => {
  it("elastic below first yield", () => {
    const r = solvePlastic(mesh, bcAt(0.7 * Fy), mat, opt);
    expect(r.collapsed).toBe(false);
    expect(r.loadFactor).toBe(1);
    expect(r.result.maxDisp / r.linearDisp).toBeLessThan(1.03);
  }, 120000);
  it("contained plasticity between first yield and collapse", () => {
    const r = solvePlastic(mesh, bcAt(1.3 * Fy), mat, opt);
    expect(r.collapsed).toBe(false);
    // beam theory (rectangular section, plastic zone over the root 23 %): +3.9 %; the element-wise
    // secant factor resolves the plastic zone only partly, so expect a smaller but clear increase
    expect(r.result.maxDisp / r.linearDisp).toBeGreaterThan(1.002);
    expect(r.result.maxDisp / r.linearDisp).toBeLessThan(1.08);
    expect(r.plasticFraction).toBeGreaterThan(0);
    expect(r.result.maxVm).toBeLessThanOrEqual(250 + 1e-9);
  }, 240000);
  it("collapse above the plastic limit load (1.5 F_y)", () => {
    const r = solvePlastic(mesh, bcAt(2 * Fy), mat, opt);
    expect(r.collapsed).toBe(true);
    const limit = r.loadFactor * 2; // in units of F_y
    expect(limit).toBeGreaterThan(1.3);
    expect(limit).toBeLessThan(1.75);
  }, 300000);
});
