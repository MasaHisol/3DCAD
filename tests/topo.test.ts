import { describe, expect, it } from "vitest";
import { FEA_MATERIALS, type FeaMesh } from "../src/analysis/fea";
import { solveTopology, surfaceNets } from "../src/analysis/topo";

function box(lx: number, ly: number, lz: number) {
  const v = [[0, 0, 0], [lx, 0, 0], [lx, ly, 0], [0, ly, 0], [0, 0, lz], [lx, 0, lz], [lx, ly, lz], [0, ly, lz]];
  const quads: Record<string, number[]> = { xmin: [0, 3, 7, 4], xmax: [1, 5, 6, 2], ymin: [0, 4, 5, 1], ymax: [3, 2, 6, 7], zmin: [0, 1, 2, 3], zmax: [4, 7, 6, 5] };
  const idx: number[] = [], faces: Record<string, number[]> = {};
  let t = 0;
  for (const [k, q] of Object.entries(quads)) {
    idx.push(q[0], q[2], q[1], q[0], q[3], q[2]);
    faces[k] = [t, t + 1];
    t += 2;
  }
  return { mesh: { positions: v.flat(), indices: idx } as FeaMesh, faces };
}

const signedVolume = (p: Float32Array, ix: Uint32Array) => {
  let v = 0;
  for (let t = 0; t < ix.length; t += 3) {
    const a = ix[t] * 3, b = ix[t + 1] * 3, c = ix[t + 2] * 3;
    v += (p[a] * (p[b + 1] * p[c + 2] - p[b + 2] * p[c + 1]) - p[a + 1] * (p[b] * p[c + 2] - p[b + 2] * p[c]) + p[a + 2] * (p[b] * p[c + 1] - p[b + 1] * p[c])) / 6;
  }
  return v;
};

describe("topology optimisation", () => {
  it("surface nets give a closed, outward surface of about the right volume", () => {
    // a 4x4x4 solid block of samples inside a 6x6x6 grid (unit spacing)
    const N = 6;
    const f = new Float32Array(N * N * N);
    for (let k = 1; k < 5; k++) for (let j = 1; j < 5; j++) for (let i = 1; i < 5; i++) f[(k * N + j) * N + i] = 1;
    const s = surfaceNets(f, [N, N, N], [0, 0, 0], 1, 0.5);
    // every edge used twice (closed)
    const edges = new Map<string, number>();
    for (let t = 0; t < s.indices.length; t += 3)
      for (let q = 0; q < 3; q++) {
        const a = s.indices[t + q], b = s.indices[t + ((q + 1) % 3)];
        const key = a < b ? `${a},${b}` : `${b},${a}`;
        edges.set(key, (edges.get(key) ?? 0) + 1);
      }
    expect([...edges.values()].every((n) => n === 2)).toBe(true);
    expect(signedVolume(s.positions, s.indices)).toBeGreaterThan(20);
  });

  it("cantilever: reaches the volume target and is stiffer than a uniform material spread", () => {
    const { mesh, faces } = box(60, 20, 8);
    const r = solveTopology(mesh, { fixed: [faces.xmin], loads: [{ tris: faces.xmax, force: [0, -100, 0] }] }, FEA_MATERIALS["鋼"], { resolution: 30 }, { volFrac: 0.4, iterations: 30 });
    expect(r.volumeFraction).toBeCloseTo(0.4, 1);
    // compliance falls during the optimisation
    expect(r.history[r.history.length - 1]).toBeLessThan(r.history[0]);
    // a uniform 40% density with SIMP p=3 would be 1/0.4³ ≈ 15.6× as compliant as solid;
    // the optimised layout keeps far more of the stiffness
    expect(r.stiffnessRatio).toBeGreaterThan(1 / 4);
    expect(r.surface.indices.length).toBeGreaterThan(100);
  }, 300000);
});
