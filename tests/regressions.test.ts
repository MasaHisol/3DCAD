// Regression tests for bugs found in the v2.1–v2.5 review.
import { describe, expect, it } from "vitest";
import { polylinePath } from "../src/core/resolve";
import { holeTable } from "../src/drawing/annolayout";
import { solveDynamic } from "../src/analysis/dynamic";
import { solveTopology } from "../src/analysis/topo";
import { FEA_MATERIALS, type FeaMesh } from "../src/analysis/fea";
import type { ViewGeometry } from "../src/kernel/protocol";

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

describe("review regressions", () => {
  it("3D path: reversal and duplicate points give clear errors", () => {
    expect(() => polylinePath([[0, 0, 0], [0, 0, 0]], 0)).toThrow(/2 点以上/);
    expect(() => polylinePath([[0, 0, 0], [10, 0, 0], [0, 0, 0]], 2)).toThrow(/折り返し/);
  });
  it("hole table: near-equal diameters are not listed twice", () => {
    const g = { bounds: [0, 0, 100, 50], visible: [{ t: "circle", c: [10, 10], r: 5 }, { t: "circle", c: [30, 10], r: 5.0004 }], hidden: [] } as unknown as ViewGeometry;
    const rows = holeTable(g, [0, 0]);
    expect(rows.length).toBe(2);
  });
  it("dynamic: unsupported model reports missing supports instead of NaN", () => {
    const { mesh, faces } = box(100, 10, 10);
    // only a tiny patch fixed in one point → near rigid-body modes are still constrained; fully free is caught
    expect(() => solveDynamic(mesh, { fixed: [], loads: [{ tris: faces.xmax, force: [0, -10, 0] }] }, FEA_MATERIALS["鋼"], 7.85, { resolution: 12 }, { kind: "harmonic", damping: 0.02, nModes: 3 })).toThrow();
  }, 120000);
  it("topology: self weight does not freeze the design space", () => {
    const { mesh, faces } = box(60, 20, 10);
    const r = solveTopology(mesh, { fixed: [faces.xmin], loads: [{ tris: faces.xmax, force: [0, -100, 0] }], gravity: { density: 7.85, dir: [0, -1, 0] } }, FEA_MATERIALS["鋼"], { resolution: 24 }, { volFrac: 0.5, iterations: 8 });
    expect(r.volumeFraction).toBeLessThan(0.7);
  }, 120000);
});
