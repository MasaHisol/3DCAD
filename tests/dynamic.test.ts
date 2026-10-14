import { describe, expect, it } from "vitest";
import { FEA_MATERIALS, type FeaMesh } from "../src/analysis/fea";
import { solveDynamic } from "../src/analysis/dynamic";

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

const { mesh, faces } = box(100, 10, 10);
const bc = { fixed: [faces.xmin], loads: [{ tris: faces.xmax, force: [0, -100, 0] as [number, number, number] }] };
const steel = FEA_MATERIALS["鋼"];
const opt = { resolution: 30 };

describe("modal superposition dynamics", () => {
  it("harmonic response: static limit at 0 Hz, resonance at the first mode", () => {
    const r = solveDynamic(mesh, bc, steel, 7.85, opt, { kind: "harmonic", damping: 0.02, nModes: 6, points: 2000 });
    expect(r.y[0] / r.staticDisp).toBeCloseTo(1, 3);
    expect(Math.abs(r.peakAt / r.freqs[0] - 1)).toBeLessThan(0.01);
    // single-mode resonance: Q = 1/(2ζ) = 25 (minus the share of the higher modes)
    expect(r.amplification).toBeGreaterThan(20);
    expect(r.amplification).toBeLessThan(27);
  }, 240000);
  it("suddenly applied load: dynamic amplification ≈ 2 without damping", () => {
    const r = solveDynamic(mesh, bc, steel, 7.85, opt, { kind: "transient", damping: 0, pulse: "step", nModes: 6 });
    expect(r.amplification).toBeGreaterThan(1.9);
    expect(r.amplification).toBeLessThan(2.05);
    expect(r.peakVm / r.staticResult.maxVm).toBeCloseTo(r.amplification, 6);
  }, 240000);
});
