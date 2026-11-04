import { beforeAll, describe, expect, it } from "vitest";
import opencascade from "replicad-opencascadejs";
import * as R from "replicad";
import { GeometryEngine, meshBody } from "../src/kernel/geometry";
import { legacyTessParams, levelForView, tessParams, errorPx, MESH_CACHE_VERSION } from "../src/kernel/tessellation";
import type { BodyMesh, RFeature } from "../src/kernel/protocol";
import type { PlaneDef } from "../src/core/types";

beforeAll(async () => {
  const OC = await (opencascade as unknown as () => Promise<unknown>)();
  R.setOC(OC as never);
}, 60000);

/**
 * Max deviation of the mesh from an analytic surface: distance function
 * `dev(p)` sampled at the vertices, edge midpoints, centroid and more interior
 * points of every triangle accepted by `use`.
 */
function maxDeviation(m: BodyMesh, dev: (x: number, y: number, z: number) => number, use?: (x: number, y: number, z: number) => boolean): number {
  const capsOff = !!use;
  use ??= () => true;
  const P = m.positions, I = m.indices;
  const bary = [
    [1 / 3, 1 / 3, 1 / 3],
    [0.5, 0.5, 0],
    [0, 0.5, 0.5],
    [0.5, 0, 0.5],
    [2 / 3, 1 / 6, 1 / 6],
    [1 / 6, 2 / 3, 1 / 6],
    [1 / 6, 1 / 6, 2 / 3],
  ];
  let worst = 0;
  for (let t = 0; t < I.length; t += 3) {
    const v = [I[t], I[t + 1], I[t + 2]].map((i) => [P[i * 3], P[i * 3 + 1], P[i * 3 + 2]]);
    if (!v.every((p) => use(p[0], p[1], p[2]))) continue;
    // lateral faces only for `use` filters: skip triangles facing ±z (caps)
    const ux = v[1][0] - v[0][0], uy = v[1][1] - v[0][1], uz = v[1][2] - v[0][2], wx = v[2][0] - v[0][0], wy = v[2][1] - v[0][1], wz = v[2][2] - v[0][2];
    const nx = uy * wz - uz * wy, ny = uz * wx - ux * wz, nz = ux * wy - uy * wx;
    if (capsOff && Math.abs(nz) > 0.5 * Math.hypot(nx, ny, nz)) continue;
    for (const [a, b, c] of bary) {
      const x = a * v[0][0] + b * v[1][0] + c * v[2][0], y = a * v[0][1] + b * v[1][1] + c * v[2][1], z = a * v[0][2] + b * v[1][2] + c * v[2][2];
      worst = Math.max(worst, Math.abs(dev(x, y, z)));
    }
  }
  return worst;
}

const tris = (m: BodyMesh) => m.indices.length / 3;

describe("tessellation policy (#5)", () => {
  it("parameters: relative to model and part size, levels ordered", () => {
    const n = tessParams(100, 100, "normal"), c = tessParams(100, 100, "coarse"), f = tessParams(100, 100, "fine");
    expect(c.linear).toBeGreaterThan(n.linear);
    expect(f.linear).toBeLessThan(n.linear);
    // same specified display error and mesher deflection as stage 1 (within 1 %)
    expect(Math.abs(n.tolerance / legacyTessParams(100).tolerance - 1)).toBeLessThan(0.01);
    expect(Math.abs(n.linear / legacyTessParams(100).linear - 1)).toBeLessThan(0.01);
    // a small part in a big model is never coarser than 1/100 of its size
    expect(tessParams(10000, 2).tolerance).toBeLessThanOrEqual(2 * 1e-2 + 1e-12);
    expect(errorPx(0.03, 0.01)).toBeCloseTo(3, 9);
  });

  it("view-dependent level selection", () => {
    const lv = { coarse: 0.12, normal: 0.03, fine: 0.0075 };
    expect(levelForView(lv, 1)).toBe("coarse"); // zoomed out: 0.12 px
    expect(levelForView(lv, 0.05)).toBe("normal"); // 0.6 px
    expect(levelForView(lv, 0.02)).toBe("fine"); // normal would be 1.5 px
    expect(levelForView(lv, 0.001)).toBe("fine"); // nothing is enough: finest
  });

  const shapes: [string, () => R.Shape3D, (x: number, y: number, z: number) => number, ((x: number, y: number, z: number) => boolean)?][] = [
    ["sphere R20", () => R.makeSphere(20) as R.Shape3D, (x, y, z) => Math.hypot(x, y, z) - 20],
    ["cylinder r5 h40", () => R.makeCylinder(5, 40) as R.Shape3D, (x, y) => Math.hypot(x, y) - 5, (x, y) => Math.abs(Math.hypot(x, y) - 5) < 1e-3],
    ["cylinder r60 h10", () => R.makeCylinder(60, 10) as R.Shape3D, (x, y) => Math.hypot(x, y) - 60, (x, y) => Math.abs(Math.hypot(x, y) - 60) < 1e-3],
  ];
  const report: string[] = [];
  for (const [name, make, dev, use] of shapes) {
    it(`keeps the display error within tolerance without more triangles: ${name}`, { timeout: 60000 }, () => {
      const s = make();
      const [a, b] = s.boundingBox.bounds;
      const diag = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
      const legacy = meshBody(s, "x", diag, "normal", legacyTessParams(diag));
      const now = meshBody(s, "x", diag, "normal");
      const tol = now.tess!.tolerance;
      const dLegacy = maxDeviation(legacy, dev, use), dNow = maxDeviation(now, dev, use);
      report.push(`${name}: tol ${tol.toFixed(4)} mm, legacy ${tris(legacy)} tris (dev ${dLegacy.toFixed(4)}), new ${tris(now)} tris (dev ${dNow.toFixed(4)}), -${(100 * (1 - tris(now) / tris(legacy))).toFixed(0)}%`);
      // display error within the specified tolerance (mesher tolerance 5 %)
      console.log(report[report.length - 1]);
      expect(dNow).toBeLessThanOrEqual(tol * 1.05);
      // large analytic faces: the linear deflection decides, as before
      expect(tris(now)).toBeLessThanOrEqual(tris(legacy));
      expect(dLegacy).toBeLessThanOrEqual(tol * 1.05);
      // coarse / fine levels bound their own tolerance and order the triangle counts
      const coarse = meshBody(s, "x", diag, "coarse"), fine = meshBody(s, "x", diag, "fine");
      expect(maxDeviation(coarse, dev, use)).toBeLessThanOrEqual(coarse.tess!.tolerance * 1.05);
      expect(maxDeviation(fine, dev, use)).toBeLessThanOrEqual(fine.tess!.tolerance * 1.05);
      expect(tris(coarse)).toBeLessThanOrEqual(tris(now));
      expect(tris(fine)).toBeGreaterThan(tris(now));
      expect(now.tess!.version).toBe(MESH_CACHE_VERSION);
    });
  }
  it("mechanical part with small holes: same error bound, far fewer triangles", { timeout: 60000 }, () => {
    let s = R.makeBox([0, 0, 0], [200, 100, 10]) as R.Shape3D;
    const holes: [number, number, number][] = [];
    for (let i = 0; i < 10; i++) for (let j = 0; j < 3; j++) holes.push([15 + i * 19, 20 + j * 30, 1.5]);
    holes.push([100, 50, 4]);
    for (const [x, y, r] of holes) s = s.cut(R.makeCylinder(r, 30, [x, y, -10], [0, 0, 1])) as R.Shape3D;
    const diag = Math.hypot(200, 100, 10);
    const legacy = meshBody(s, "x", diag, "normal", legacyTessParams(diag));
    const now = meshBody(s, "x", diag, "normal");
    const tol = now.tess!.tolerance;
    // deviation from the holes' cylinders (lateral triangles on a hole wall)
    const onHole = (x: number, y: number) => holes.some(([hx, hy, r]) => Math.abs(Math.hypot(x - hx, y - hy) - r) < 1e-3);
    const dev = (x: number, y: number) => {
      let best = Infinity;
      for (const [hx, hy, r] of holes) best = Math.min(best, Math.abs(Math.hypot(x - hx, y - hy) - r));
      return best;
    };
    const dNow = maxDeviation(now, dev, onHole), dLegacy = maxDeviation(legacy, dev, onHole);
    const red = 1 - tris(now) / tris(legacy);
    report.push(`plate 200x100 + 31 holes: tol ${tol.toFixed(4)} mm, legacy ${tris(legacy)} tris (dev ${dLegacy.toFixed(4)}), new ${tris(now)} tris (dev ${dNow.toFixed(4)}), -${(100 * red).toFixed(0)}%`);
    console.log(report[report.length - 1]);
    expect(dNow).toBeLessThanOrEqual(tol * 1.05);
    expect(red).toBeGreaterThan(0.25);
  });

  it("summary", () => {
    console.log("[tessellation]\n" + report.join("\n"));
  });
});

const XY: PlaneDef = { origin: [0, 0, 0], xDir: [1, 0, 0], normal: [0, 0, 1] };
const circle = (r: number) => ({ outer: [{ t: "circle" as const, c: [0, 0] as [number, number], r }], holes: [] });

describe("progressive meshing (coarse first, refined on request)", () => {
  it("rebuild returns coarse meshes for large models and remesh refines with the same topology", async () => {
    const eng = new GeometryEngine();
    const feats: RFeature[] = [{ id: "e1", type: "extrude", plane: XY, regions: [circle(30)], op: "new", from: 0, to: 20, through: false, flip: false } as RFeature];
    const full = await eng.rebuild(feats, undefined, {});
    expect(full.refine).toBeFalsy();
    // force the progressive path with a low face threshold via quality
    const coarse = await eng.rebuild(feats, undefined, { quality: "coarse" });
    expect(coarse.bodies[0].tess!.quality).toBe("coarse");
    const refined = eng.remesh("normal");
    expect(refined.bodies[0].tess!.quality).toBe("normal");
    expect(refined.bodies[0].faces.length).toBe(coarse.bodies[0].faces.length);
    expect(refined.bodies[0].indices.length).toBeGreaterThan(coarse.bodies[0].indices.length);
    eng.dispose();
  });
});
