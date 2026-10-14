import { describe, expect, it } from "vitest";
import { printCheck } from "../src/analysis/printcheck";

/** Closed box mesh with outward-facing triangles (separate vertices per face like the kernel meshes). */
function box(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number) {
  const P: number[] = [], I: number[] = [];
  const quad = (a: number[], b: number[], c: number[], d: number[]) => {
    const s = P.length / 3;
    P.push(...a, ...b, ...c, ...d);
    I.push(s, s + 1, s + 2, s, s + 2, s + 3);
  };
  quad([x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [x1, y0, z0]); // bottom (-z)
  quad([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]); // top
  quad([x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]); // -y
  quad([x0, y1, z0], [x0, y1, z1], [x1, y1, z1], [x1, y1, z0]); // +y
  quad([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]); // -x
  quad([x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]); // +x
  return { positions: Float32Array.from(P), indices: Uint32Array.from(I) };
}
const opt = { up: 2 as const, overhang: 45, minWall: 1 };

describe("3D print check", () => {
  it("a cube on the plate is printable and watertight", () => {
    const r = printCheck([box(0, 0, 0, 10, 10, 10)], opt);
    expect(r.overhangArea).toBe(0);
    expect(r.thinArea).toBe(0);
    expect(r.openEdges).toBe(0);
    expect(r.height).toBeCloseTo(10);
  });
  it("finds an overhanging block and a thin plate", () => {
    const r = printCheck([box(0, 0, 0, 40, 40, 2), box(0, 0, 10, 10, 10, 20), box(20, 0, 0, 20.5, 10, 12)], opt);
    expect(r.overhangArea).toBeCloseTo(100, 6);
    expect(r.thinnest).toBeCloseTo(0.5, 4);
    expect(r.thinArea).toBeGreaterThanOrEqual(2 * 10 * 10);
  });
  it("counts open edges", () => {
    const b = box(0, 0, 0, 10, 10, 10);
    const r = printCheck([{ positions: b.positions, indices: b.indices.slice(6) }], opt);
    expect(r.openEdges).toBe(4);
  });
});
