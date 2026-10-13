import { describe, expect, it } from "vitest";
import { buildGrid, FEA_MATERIALS, sampleNodal, solveFea, type FeaMesh } from "../src/analysis/fea";
import { solveBuckling, solveModal, solveThermal, symEig, THERMAL_MATERIALS } from "../src/analysis/advanced";

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
    idx.push(q[0], q[2], q[1], q[0], q[3], q[2]);
    faces[k] = [t, t + 1];
    t += 2;
  }
  return { mesh: { positions: v.flat(), indices: idx }, faces };
}
const steel = FEA_MATERIALS["鋼"];

describe("advanced analyses vs. closed-form solutions", () => {
  it("dense symmetric eigen-solver", () => {
    const { values } = symEig([[2, 1, 0], [1, 2, 1], [0, 1, 2]]);
    expect(values.map((v) => +v.toFixed(9))).toEqual([2 - Math.SQRT2, 2, 2 + Math.SQRT2].map((v) => +v.toFixed(9)));
  });

  it("modal: cantilever first bending frequency (Euler-Bernoulli 1.875²/2π √(EI/ρAL⁴))", () => {
    const L = 100, a = 10;
    const { mesh, faces } = box(L, a, a);
    const r = solveModal(mesh, [faces.xmin], steel, 7.85, { resolution: 30 }, 4);
    const I = a ** 4 / 12, rhoA = 7.85e-9 * a * a;
    const f1 = ((1.875104 ** 2) / (2 * Math.PI)) * Math.sqrt((steel.E * I) / (rhoA * L ** 4));
    expect(r.converged).toBe(true);
    // square section: two equal bending modes first
    expect(r.freqs[0] / f1).toBeGreaterThan(0.96);
    expect(r.freqs[0] / f1).toBeLessThan(1.03);
    expect(r.freqs[1] / r.freqs[0]).toBeCloseTo(1, 2);
    // effective mass of the first two modes ≈ 61% each in Y / Z (cantilever theory 0.613)
    const py = Math.max(r.participation[0][1], r.participation[1][1]);
    expect(py).toBeGreaterThan(0.55);
    expect(py).toBeLessThan(0.66);
  }, 120000);

  it("buckling: fixed-free column (Euler π²EI / 4L²)", () => {
    const L = 200, a = 10;
    const { mesh, faces } = box(a, L, a);
    const P = 1000;
    const r = solveBuckling(mesh, { fixed: [faces.ymin], loads: [{ tris: faces.ymax, force: [0, -P, 0] }] }, steel, { resolution: 40 });
    const Pcr = (Math.PI ** 2 * steel.E * (a ** 4 / 12)) / (4 * L * L);
    expect(r.factor * P / Pcr).toBeGreaterThan(0.95);
    expect(r.factor * P / Pcr).toBeLessThan(1.05);
  }, 120000);

  it("thermal: conduction through a bar, heat balance", () => {
    const { mesh, faces } = box(100, 10, 10);
    const k = THERMAL_MATERIALS["鋼"];
    const r = solveThermal(mesh, { temperature: [{ tris: faces.xmin, T: 20 }], flux: [{ tris: faces.xmax, Q: 10 }], convection: [] }, k, { resolution: 50 });
    // ΔT = Q L / (k A), k = 50 W/mK = 0.05 W/mmK
    const G = r;
    const tEnd = sampleNodal({ ...G, disp: new Float32Array(), vm: r.T } as never, r.T, 1, [100, 5, 5])[0];
    expect(tEnd).toBeCloseTo(20 + (10 * 100) / (0.05 * 100), 0);
    expect(r.heatOut).toBeCloseTo(10, 3);
  }, 60000);

  it("thermal stress: bar held at both ends, uniform heating (σ = -E α ΔT)", () => {
    const { mesh, faces } = box(100, 10, 10);
    const opt = { resolution: 50 };
    const G = buildGrid(mesh, opt);
    const T = new Float32Array(G.nNodes).fill(120);
    const alpha = 12e-6;
    const r = solveFea(mesh, { fixed: [faces.xmin, faces.xmax], loads: [], thermal: { T, Tref: 20, alpha } }, steel, opt);
    const sxx = sampleNodal(r, r.stress, 6, [50, 5, 5])[0];
    expect(sxx / (-steel.E * alpha * 100)).toBeCloseTo(1, 1);
  }, 60000);
});
