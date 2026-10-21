// Surface modelling: builds documents through the same path the app uses
// (document -> resolveDocument -> GeometryEngine.rebuild).
import { beforeAll, describe, expect, it } from "vitest";
import opencascade from "replicad-opencascadejs";
import * as R from "replicad";
import { GeometryEngine } from "../src/kernel/geometry";
import { newDocument } from "../src/core/document";
import { evaluateParams } from "../src/core/params";
import { prepareDocument, resolveDocument } from "../src/core/resolve";
import { validatePart } from "../src/core/validate";
import { vertexCurvature } from "../src/viewer/surfaceAnalysis";
import type { Feature, PartDocument, PlaneDef, SketchFeature, SkEntity } from "../src/core/types";

beforeAll(async () => {
  R.setOC((await (opencascade as unknown as () => Promise<unknown>)()) as never);
}, 60000);

const XY: PlaneDef = { origin: [0, 0, 0], xDir: [1, 0, 0], normal: [0, 0, 1] };

let n = 0;
/** Sketch from polylines (each closed when the first and last point coincide) and circles. */
function sketch(id: string, polys: [number, number][][], circles: { c: [number, number]; r: number }[] = [], plane = XY): SketchFeature {
  const entities: SkEntity[] = [];
  for (const poly of polys) {
    const closed = poly.length > 2 && poly[0][0] === poly[poly.length - 1][0] && poly[0][1] === poly[poly.length - 1][1];
    const pts = (closed ? poly.slice(0, -1) : poly).map(([x, y]) => ({ id: `p${++n}`, type: "point" as const, x, y }));
    entities.push(...pts);
    const segs = closed ? pts.length : pts.length - 1;
    for (let i = 0; i < segs; i++) entities.push({ id: `l${++n}`, type: "line", p1: pts[i].id, p2: pts[(i + 1) % pts.length].id });
  }
  for (const c of circles) {
    const p = { id: `p${++n}`, type: "point" as const, x: c.c[0], y: c.c[1] };
    entities.push(p, { id: `c${++n}`, type: "circle", c: p.id, r: c.r });
  }
  return { id, name: id, type: "sketch", plane, planeLabel: "XY", entities, constraints: [], dimensions: [] };
}

async function build(features: Feature[], eng = new GeometryEngine()) {
  const doc: PartDocument = newDocument("surf");
  doc.features = features;
  doc.endOfPart = features.length;
  // round-trip through file validation like opening a saved part
  const checked = validatePart(JSON.parse(JSON.stringify(doc)));
  const values = evaluateParams(checked.doc.params);
  prepareDocument(checked.doc, values);
  const resolved = resolveDocument(checked.doc, values);
  expect(resolved.errors).toEqual({});
  const res = await eng.rebuild(resolved.features);
  return { res, eng, warnings: checked.warnings };
}

const area = (s: { shape: unknown }) => R.measureArea(s.shape as never);

const rect = sketch("sk1", [[[0, 0], [40, 0], [40, 20], [0, 20], [0, 0]]]);

describe("surface modelling", () => {
  it("extrude surface (open profile) is an open surface body, not a solid", async () => {
    const { res, eng, warnings } = await build([
      sketch("s", [[[0, 0], [10, 0], [10, 10]]]),
      { id: "e", name: "e", type: "surfExtrude", sketch: "s", extent: "distance", distance: "5", flip: false },
    ]);
    expect(warnings).toEqual([]);
    expect(res.errors).toEqual({});
    expect(res.bodies.length).toBe(0);
    expect(res.surfaces?.length).toBe(1);
    expect(res.surfaces![0].surface).toBe("e");
    expect(area(eng.surfaces[0])).toBeCloseTo(100, 3);
  }, 60000);

  it("extrude surface → patches (sketch loop + model edges) → stitch → solid volume", async () => {
    const { res, eng } = await build([
      rect,
      { id: "tube", name: "tube", type: "surfExtrude", sketch: "sk1", extent: "distance", distance: "10", flip: false },
      { id: "bot", name: "bot", type: "surfPatch", sketch: "sk1", edges: [] },
      {
        id: "top", name: "top", type: "surfPatch",
        edges: [{ mid: [20, 0, 10] }, { mid: [40, 10, 10] }, { mid: [20, 20, 10] }, { mid: [0, 10, 10] }],
      },
      { id: "st", name: "st", type: "surfStitch", surfaces: ["tube", "bot", "top"], tolerance: "0.001", solid: true, op: "new" },
    ]);
    expect(res.errors).toEqual({});
    expect(res.surfaces?.length ?? 0).toBe(0);
    expect(res.bodies.length).toBe(1);
    expect(eng.massProps().volume).toBeCloseTo(40 * 20 * 10, 3);
  }, 60000);

  it("stitch of an open set keeps the sewn surface and reports it", async () => {
    const { res, eng } = await build([
      rect,
      { id: "tube", name: "tube", type: "surfExtrude", sketch: "sk1", extent: "distance", distance: "10", flip: false },
      { id: "bot", name: "bot", type: "surfPatch", sketch: "sk1", edges: [] },
      { id: "st", name: "st", type: "surfStitch", surfaces: ["tube", "bot"], tolerance: "0.001", solid: true, op: "new" },
    ]);
    expect(res.errors.st).toMatch(/閉じていません/);
    expect(res.bodies.length).toBe(0);
    expect(eng.surfaces.map((s) => s.id)).toEqual(["st"]);
  }, 60000);

  it("patch of a closed loop: planar and non-planar (filling)", async () => {
    const { res, eng } = await build([
      rect,
      { id: "p", name: "p", type: "surfPatch", sketch: "sk1", edges: [] },
    ]);
    expect(res.errors).toEqual({});
    expect(area(eng.surfaces[0])).toBeCloseTo(800, 3);
    // a saddle-like loop: the top edges of a ruled loft between a low and a tilted section
    const { res: r2, eng: e2 } = await build([
      sketch("a", [[[0, 0], [20, 0], [20, 20], [0, 20], [0, 0]]]),
      sketch("b", [[[0, 0], [20, 0], [20, 20], [0, 20], [0, 0]]], [], { origin: [0, 0, 10], xDir: [1, 0, 0], normal: [0, 0, 1] }),
      { id: "w", name: "w", type: "surfLoft", sketches: ["a", "b"], ruled: true },
    ]);
    expect(r2.errors).toEqual({});
    expect(area(e2.surfaces[0])).toBeCloseTo(4 * 20 * 10, 3);
    // non-planar boundary: a 3D zig-zag of model edges (two walls of a bent strip)
    const { res: r3, eng: e3 } = await build([
      sketch("z", [[[0, 0], [10, 0], [10, 10]]]),
      { id: "ex", name: "ex", type: "surfExtrude", sketch: "z", extent: "distance", distance: "10", flip: false },
      {
        id: "fill", name: "fill", type: "surfPatch",
        // closed loop: bottom L, the far vertical edge, top L, the near vertical edge -> non-planar
        edges: [{ mid: [5, 0, 0] }, { mid: [10, 5, 0] }, { mid: [10, 10, 5] }, { mid: [10, 5, 10] }, { mid: [5, 0, 10] }, { mid: [0, 0, 5] }],
      },
    ]);
    expect(r3.errors).toEqual({});
    expect(e3.surfaces.length).toBe(2);
    expect(area(e3.surfaces[1])).toBeGreaterThan(50);
  }, 120000);

  it("offset surface of a cylinder", async () => {
    const { res, eng } = await build([
      sketch("c", [], [{ c: [0, 0], r: 10 }]),
      { id: "cyl", name: "cyl", type: "surfExtrude", sketch: "c", extent: "distance", distance: "10", flip: false },
      { id: "off", name: "off", type: "surfOffset", surface: "cyl", distance: "2", flip: false },
    ]);
    expect(res.errors).toEqual({});
    expect(eng.surfaces.length).toBe(2);
    const a = area(eng.surfaces[1]);
    // outward or inward depending on the face orientation: radius 12 or 8
    expect([2 * Math.PI * 12 * 10, 2 * Math.PI * 8 * 10].some((x) => Math.abs(x - a) < 1e-3)).toBe(true);
  }, 60000);

  it("trim by a plane, a sketch profile and another surface", async () => {
    const strip = sketch("s", [[[0, -10], [0, 10]]]);
    const ext = { id: "strip", name: "strip", type: "surfExtrude" as const, sketch: "s", extent: "distance" as const, distance: "10", flip: false };
    // plane: XZ origin plane (normal +Y) keeps y > 0
    let r = await build([strip, ext, { id: "t", name: "t", type: "surfTrim", surface: "strip", tool: { kind: "origin", key: "XZ" }, flip: false }]);
    expect(r.res.errors).toEqual({});
    expect(r.eng.surfaces.map((s) => s.id)).toEqual(["t"]);
    expect(area(r.eng.surfaces[0])).toBeCloseTo(100, 3);
    expect(r.res.surfaces![0].bbox[0][1]).toBeCloseTo(0, 3);
    // sketch profile (circle r = 5 projected along Z): keep inside / outside
    const circ = sketch("k", [], [{ c: [0, 0], r: 5 }]);
    r = await build([strip, ext, circ, { id: "t", name: "t", type: "surfTrim", surface: "strip", tool: { kind: "sketch", sketch: "k" }, flip: false }]);
    expect(r.res.errors).toEqual({});
    expect(area(r.eng.surfaces[0])).toBeCloseTo(100, 3);
    r = await build([strip, ext, circ, { id: "t", name: "t", type: "surfTrim", surface: "strip", tool: { kind: "sketch", sketch: "k" }, flip: true }]);
    expect(area(r.eng.surfaces[0])).toBeCloseTo(100, 3);
    // another surface (plane y = -3): the two sides are 70 and 130
    const cutter = sketch("c2", [[[-10, -3], [10, -3]]]);
    const toolExt = { id: "wall", name: "wall", type: "surfExtrude" as const, sketch: "c2", extent: "symmetric" as const, distance: "40", flip: false };
    const areas: number[] = [];
    for (const flip of [false, true]) {
      r = await build([strip, ext, cutter, toolExt, { id: "t", name: "t", type: "surfTrim", surface: "strip", tool: { kind: "surface", id: "wall" }, flip }]);
      expect(r.res.errors).toEqual({});
      const t = r.eng.surfaces.find((s) => s.id === "t")!;
      areas.push(area(t));
    }
    expect(areas.sort((a, b) => a - b).map((a) => Math.round(a))).toEqual([70, 130]);
  }, 120000);

  it("thicken a surface (reuses the thicken feature) and revolve surface", async () => {
    const strip = sketch("s", [[[0, -10], [0, 10]]]);
    const { res, eng } = await build([
      strip,
      { id: "strip", name: "strip", type: "surfExtrude", sketch: "s", extent: "distance", distance: "10", flip: false },
      { id: "tk", name: "tk", type: "thicken", faces: [], surface: "strip", distance: "2", flip: false, op: "new" },
    ]);
    expect(res.errors).toEqual({});
    expect(eng.surfaces.length).toBe(0);
    expect(eng.massProps().volume).toBeCloseTo(400, 3);
    // revolve an open line about the sketch Y axis: a cylinder surface r = 5, h = 10
    const { res: r2, eng: e2 } = await build([
      sketch("r", [[[5, 0], [5, 10]]]),
      { id: "rv", name: "rv", type: "surfRevolve", sketch: "r", axis: "Y", extent: "full", angle: "360", flip: false },
    ]);
    expect(r2.errors).toEqual({});
    expect(area(e2.surfaces[0])).toBeCloseTo(2 * Math.PI * 5 * 10, 3);
  }, 60000);

  it("curvature estimate of a cylinder surface ≈ 1/r", async () => {
    const { res } = await build([
      sketch("c", [], [{ c: [0, 0], r: 10 }]),
      { id: "cyl", name: "cyl", type: "surfExtrude", sketch: "c", extent: "distance", distance: "20", flip: false },
    ]);
    const k = Array.from(vertexCurvature(res.surfaces![0])).sort((a, b) => a - b);
    expect(k[k.length >> 1]).toBeCloseTo(0.1, 2);
  }, 60000);

  it("mirror a half tube surface, then stitch it with caps into a closed solid", async () => {
    const top: PlaneDef = { origin: [0, 0, 10], xDir: [1, 0, 0], normal: [0, 0, 1] };
    const { res, eng } = await build([
      sketch("u", [[[0, -10], [20, -10], [20, 10], [0, 10]]]),
      { id: "half", name: "half", type: "surfExtrude", sketch: "u", extent: "distance", distance: "10", flip: false },
      { id: "mi", name: "mi", type: "mirror", features: ["half"], plane: "YZ", offset: "0" },
      sketch("cb", [[[-20, -10], [20, -10], [20, 10], [-20, 10], [-20, -10]]]),
      sketch("ct", [[[-20, -10], [20, -10], [20, 10], [-20, 10], [-20, -10]]], [], top),
      { id: "bot", name: "bot", type: "surfPatch", sketch: "cb", edges: [] },
      { id: "cap", name: "cap", type: "surfPatch", sketch: "ct", edges: [] },
      { id: "st", name: "st", type: "surfStitch", surfaces: ["half", "mi#1", "bot", "cap"], tolerance: "0.001", solid: true, op: "new" },
    ]);
    expect(res.errors).toEqual({});
    expect(res.surfaces?.length ?? 0).toBe(0);
    expect(eng.bodies.length).toBe(1);
    expect(R.measureVolume(eng.bodies[0] as never)).toBeCloseTo(8000, 1);
  }, 60000);

  it("rectangular pattern of a patch gives N surfaces keyed by the pattern id", async () => {
    const { res, eng } = await build([
      rect,
      { id: "p", name: "p", type: "surfPatch", sketch: "sk1", edges: [] },
      { id: "rp", name: "rp", type: "rectPattern", features: ["p"], axis: "X", count: "4", spacing: "50", axis2: "Y", count2: "2", spacing2: "30", flip: false },
    ]);
    expect(res.errors).toEqual({});
    expect(res.bodies.length).toBe(0);
    expect(eng.surfaces.length).toBe(8);
    expect(eng.surfaces.map((s) => s.id).sort()).toEqual(["p", ...Array.from({ length: 7 }, (_, i) => `rp#${i + 1}`)].sort());
    for (const s of eng.surfaces) expect(area(s)).toBeCloseTo(800, 3);
    const xs = eng.surfaces.map((s) => Math.round(s.shape.boundingBox.bounds[0][0]));
    expect(new Set(xs)).toEqual(new Set([0, 50, 100, 150]));
  }, 60000);

  it("move a surface (keeps its key; solids stay put when unchecked)", async () => {
    const { res, eng } = await build([
      rect,
      { id: "p", name: "p", type: "surfPatch", sketch: "sk1", edges: [] },
      { id: "mv", name: "mv", type: "move", dx: "5", dy: "0", dz: "7", rx: "0", ry: "0", rz: "90", surfaces: ["p"], solids: false },
      { id: "tk", name: "tk", type: "thicken", faces: [], surface: "p", distance: "2", flip: false, op: "new" },
    ]);
    expect(res.errors).toEqual({});
    expect(eng.bodies.length).toBe(1);
    const [lo, hi] = eng.bodies[0].boundingBox.bounds;
    // rotated 90° about Z: x ∈ [-20, 0] (+5), y ∈ [0, 40]; z lifted by 7
    expect(lo[0]).toBeCloseTo(-15, 3);
    expect(hi[0]).toBeCloseTo(5, 3);
    expect(hi[1]).toBeCloseTo(40, 3);
    expect(Math.min(lo[2], hi[2])).toBeGreaterThan(4.9);
    expect(R.measureVolume(eng.bodies[0] as never)).toBeCloseTo(1600, 1);
  }, 60000);
});
