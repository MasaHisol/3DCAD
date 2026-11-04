// Stage 2 "測定の強化": exact measurements compared with theoretical values,
// and measurement annotations that follow upstream edits (topology names).
import { beforeAll, describe, expect, it } from "vitest";
import opencascade from "replicad-opencascadejs";
import { setOC } from "replicad";
import { GeometryEngine } from "../src/kernel/geometry";
import type { BodyMesh, RFeature, RRegion } from "../src/kernel/protocol";
import type { PlaneDef, Vec2, Vec3 } from "../src/core/types";
import { runMeasure, type MeasureCtx } from "../src/measure/kernel";
import { fitPitchCircle } from "../src/measure/pcd";
import { applyNoteResult, captureRef, noteRequest, resolveNote } from "../src/measure/notes";
import type { ClearancePair, DistanceResult, HoleInfo, MeasureNote, PropsResult, ThicknessResult } from "../src/measure/types";
import { formatMeasure, notesCsv } from "../src/measure/format";

const XY: PlaneDef = { origin: [0, 0, 0], xDir: [1, 0, 0], normal: [0, 0, 1] };
const top = (z: number): PlaneDef => ({ ...XY, origin: [0, 0, z] });
const rect = (x: number, y: number, w: number, h: number): RRegion => {
  const p: Vec2[] = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
  return { outer: p.map((a, i) => ({ t: "line" as const, a, b: p[(i + 1) % 4], src: `L${i + 1}` })), holes: [] };
};
const plate = (id: string, w: number, h: number, t: number): RFeature => ({ id, type: "extrude", plane: XY, regions: [rect(0, 0, w, h)], op: "new", from: 0, to: t, through: false, flip: false });
type HoleF = Extract<RFeature, { type: "hole" }>;
const hole = (id: string, z: number, pts: Vec2[], d: number, extra: Partial<HoleF> = {}): RFeature => ({
  id, type: "hole", plane: top(z), points: pts, holeType: "simple", diameter: d, depth: 0, through: true,
  cbDiameter: 0, cbDepth: 0, csDiameter: 0, csAngle: 90, flip: false, ...extra,
});
const box = (id: string, c: Vec2, a: number, b: number, h: number, z = 0): RFeature => ({ id, type: "primitive", shape: "box", plane: top(z), center: c, a, b, c: h, op: "new" });
const cyl = (id: string, c: Vec2, d: number, h: number): RFeature => ({ id, type: "primitive", shape: "cylinder", plane: XY, center: c, a: d, b: 0, c: h, op: "new" });

const ctxOf = (e: GeometryEngine): MeasureCtx => ({ bodies: [...e.bodies, ...e.surfaces.map((s) => s.shape)] as never, threads: e.threads });
const near = (a: Vec3, b: Vec3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

/** Index of the cylindrical face whose axis passes nearest (x, y). */
function cylFace(b: BodyMesh, x: number, y: number, r?: number): number {
  let best = -1, bd = Infinity;
  b.faces.forEach((f, i) => {
    if (f.type !== "CYLINDRE" || !f.axis) return;
    if (r !== undefined && Math.abs(f.axis.radius - r) > 1e-6) return;
    const d = Math.hypot(f.axis.origin[0] - x, f.axis.origin[1] - y);
    if (d < bd) (bd = d), (best = i);
  });
  return best;
}

beforeAll(async () => {
  const OC = await (opencascade as unknown as () => Promise<unknown>)();
  setOC(OC as never);
}, 60000);

describe("hole recognition", () => {
  it("diameter, depth, counterbore, countersink and thread", async () => {
    const e = new GeometryEngine();
    const r = await e.rebuild([
      plate("p", 120, 60, 20),
      hole("h1", 20, [[15, 15]], 10),
      hole("h2", 20, [[40, 15]], 8, { through: false, depth: 12 }),
      hole("h3", 20, [[65, 15]], 6.6, { holeType: "counterbore", cbDiameter: 11, cbDepth: 6.5 }),
      hole("h4", 20, [[90, 15]], 6.6, { holeType: "countersink", csDiameter: 13.2, csAngle: 90 }),
      hole("h5", 20, [[15, 45]], 6.917, { thread: { name: "M8", d: 8, pitch: 1.25, length: 0, full: true } }),
    ]);
    expect(Object.keys(r.errors)).toEqual([]);
    const b = r.bodies[0];
    const ctx = ctxOf(e);
    const hi = (x: number, y: number, rr?: number) => runMeasure(ctx, { op: "hole", ref: { body: 0, kind: "face", index: cylFace(b, x, y, rr) } }) as HoleInfo;
    const h1 = hi(15, 15);
    expect(h1.kind).toBe("hole");
    expect(h1.diameter).toBeCloseTo(10, 9);
    expect(h1.through).toBe(true);
    expect(h1.depth).toBeCloseTo(20, 6);
    const h2 = hi(40, 15);
    expect(h2.diameter).toBeCloseTo(8, 9);
    expect(h2.through).toBe(false);
    expect(h2.depth).toBeCloseTo(12, 6);
    expect(near(h2.center, [40, 15, 20])).toBeLessThan(1e-6);
    expect(h2.axis[2]).toBeCloseTo(-1, 9);
    const h3 = hi(65, 15, 3.3);
    expect(h3.diameter).toBeCloseTo(6.6, 9);
    expect(h3.counterbore!.diameter).toBeCloseTo(11, 9);
    expect(h3.counterbore!.depth).toBeCloseTo(6.5, 3);
    // picking the counterbore wall finds the same hole
    expect(hi(65, 15, 5.5).diameter).toBeCloseTo(6.6, 9);
    const h4 = hi(90, 15);
    // the hole tool starts 0.001 mm above the face (geometry.ts buildHole): Ø at the face = 13.2 - 2 * 0.001 * tan 45°
    expect(h4.countersink!.diameter).toBeCloseTo(13.198, 9);
    expect(h4.through).toBe(true);
    expect(h4.depth).toBeCloseTo(20, 6);
    expect(h4.countersink!.angle).toBeCloseTo(90, 3);
    const h5 = hi(15, 45);
    expect(h5.thread?.major).toBeCloseTo(8, 6);
    expect(h5.thread?.pitch).toBeCloseTo(1.25, 6);
  }, 120000);

  it("boss / shaft diameter", async () => {
    const e = new GeometryEngine();
    const r = await e.rebuild([cyl("c", [0, 0], 25, 40)]);
    const h = runMeasure(ctxOf(e), { op: "hole", ref: { body: 0, kind: "face", index: cylFace(r.bodies[0], 0, 0) } }) as HoleInfo;
    expect(h.kind).toBe("boss");
    expect(h.diameter).toBeCloseTo(25, 9);
    expect(h.depth).toBeCloseTo(40, 6);
  }, 60000);
});

describe("pitch circle", () => {
  it("6 holes on Ø100", async () => {
    const pts: Vec2[] = [0, 1, 2, 3, 4, 5].map((k) => [80 + 50 * Math.cos((k * Math.PI) / 3 + 0.2), 80 + 50 * Math.sin((k * Math.PI) / 3 + 0.2)]);
    const e = new GeometryEngine();
    const r = await e.rebuild([plate("p", 160, 160, 10), hole("h", 10, pts, 9)]);
    const b = r.bodies[0];
    const refs = pts.map(([x, y]) => ({ body: 0, kind: "face" as const, index: cylFace(b, x, y) }));
    const hs = runMeasure(ctxOf(e), { op: "holes", refs }) as HoleInfo[];
    const fit = fitPitchCircle(hs.map((h) => h.center), hs[0].axis);
    expect(fit.diameter).toBeCloseTo(100, 8);
    expect(near(fit.center, [80, 80, 10])).toBeLessThan(1e-8);
    for (const s of fit.spacing) expect(s).toBeCloseTo(60, 6);
    expect(fit.angularDeviation).toBeLessThan(1e-6);
    expect(fit.radialDeviation).toBeLessThan(1e-8);
  }, 60000);

  it("reports deviation of an uneven pattern", () => {
    const at = (deg: number, r = 50): Vec3 => [r * Math.cos((deg * Math.PI) / 180), r * Math.sin((deg * Math.PI) / 180), 0];
    const fit = fitPitchCircle([at(0), at(90), at(180), at(272)], [0, 0, 1]);
    expect(fit.diameter).toBeCloseTo(100, 6);
    expect(fit.angularDeviation).toBeCloseTo(2, 6);
    expect(fit.positionDeviation).toBeGreaterThan(0.5);
  });
});

describe("wall thickness", () => {
  it("shell part: uniform 2 mm walls, 5 mm floor", async () => {
    const e = new GeometryEngine();
    // 60 x 40 x 30 box, open top, walls 2 mm; then a 3 mm plate under the floor -> floor 5 mm
    const r = await e.rebuild([
      plate("b", 60, 40, 30),
      { id: "s", type: "shell", faces: [{ center: [30, 20, 30], normal: [0, 0, 1], type: "PLANE" }], thickness: 2 },
      { id: "f", type: "extrude", plane: top(0), regions: [rect(0, 0, 60, 40)], op: "join", from: -3, to: 0, through: false, flip: false },
    ]);
    expect(Object.keys(r.errors)).toEqual([]);
    const t = runMeasure(ctxOf(e), { op: "thickness", body: 0, samples: 300 }) as ThicknessResult;
    expect(t.min).toBeCloseTo(2, 6);
    expect(t.max).toBeLessThanOrEqual(60 + 1e-6);
    // points on the outer side walls (x = 0, mid height): exactly 2
    const side = t.points.map((p, i) => [p, t.values[i]] as const).filter(([p]) => Math.abs(p[0]) < 1e-9 && p[2] > 5 && p[2] < 25 && p[1] > 5 && p[1] < 35);
    expect(side.length).toBeGreaterThan(0);
    for (const [, v] of side) expect(v).toBeCloseTo(2, 6);
    // floor (z = -3, away from the walls): 5
    const floor = t.points.map((p, i) => [p, t.values[i]] as const).filter(([p]) => Math.abs(p[2] + 3) < 1e-9 && p[0] > 5 && p[0] < 55 && p[1] > 5 && p[1] < 35);
    expect(floor.length).toBeGreaterThan(0);
    for (const [, v] of floor) expect(v).toBeCloseTo(5, 6);
    // probe
    const v = runMeasure(ctxOf(e), { op: "thicknessAt", body: 0, point: [30, 0, 15], normal: [0, -1, 0] }) as number;
    expect(v).toBeCloseTo(2, 9);
  }, 120000);
});

describe("distance and clearance", () => {
  it("minimum distance between boxes and cylinders with closest points", async () => {
    const e = new GeometryEngine();
    await e.rebuild([box("b1", [5, 5], 10, 10, 10), box("b2", [25, 10], 10, 10, 10), cyl("c1", [0, 60], 10, 10), cyl("c2", [20, 60], 6, 10)]);
    const ctx = ctxOf(e);
    expect(e.bodies.length).toBe(4);
    const d1 = runMeasure(ctx, { op: "distance", a: { kind: "body", body: 0 }, b: { kind: "body", body: 1 } }) as DistanceResult;
    expect(d1.distance).toBeCloseTo(10, 9);
    expect(d1.pa![0]).toBeCloseTo(10, 5);
    expect(d1.pb![0]).toBeCloseTo(20, 5);
    expect(near(d1.pa!, d1.pb!)).toBeCloseTo(10, 5);
    const d2 = runMeasure(ctx, { op: "distance", a: { kind: "body", body: 2 }, b: { kind: "body", body: 3 } }) as DistanceResult;
    expect(d2.distance).toBeCloseTo(20 - 5 - 3, 9);
    expect(near(d2.pa!, d2.pb!)).toBeCloseTo(12, 5);
    expect(d2.pa![1]).toBeCloseTo(60, 4);
    // box to cylinder: box b1 (0..10, 0..10), cylinder c1 centre (0, 60) r5 -> 45
    const d3 = runMeasure(ctx, { op: "distance", a: { kind: "body", body: 0 }, b: { kind: "body", body: 2 } }) as DistanceResult;
    expect(d3.distance).toBeCloseTo(45, 9);
  }, 60000);

  it("clearance list below a threshold", async () => {
    const e = new GeometryEngine();
    // gaps: b1-b2 1 mm, b2-b3 5 mm, b3-b4 40 mm; b1 and b5 touch
    await e.rebuild([
      box("b1", [5, 5], 10, 10, 10),
      box("b2", [16, 5], 10, 10, 10),
      box("b3", [31, 5], 10, 10, 10),
      box("b4", [81, 5], 10, 10, 10),
      box("b5", [5, -5], 10, 10, 10, 0),
    ]);
    const list = runMeasure(ctxOf(e), { op: "clearance", threshold: 6 }) as ClearancePair[];
    const pairs = list.map((p) => `${p.a}-${p.b}:${p.distance.toFixed(6)}`);
    expect(pairs).toContain("0-1:1.000000");
    expect(pairs).toContain("1-2:5.000000");
    expect(list.some((p) => (p.a === 2 && p.b === 3) || (p.a === 3 && p.b === 2))).toBe(false);
    // touching pair reported first with zero clearance
    expect(list[0].distance).toBe(0);
    expect(list.find((p) => p.a === 0 && p.b === 1)!.pa![0]).toBeCloseTo(10, 5);
  }, 60000);

  it("angle, radius, arc, area, perimeter, volume", async () => {
    const e = new GeometryEngine();
    const r = await e.rebuild([plate("p", 50, 30, 10), hole("h", 10, [[25, 15]], 10)]);
    const b = r.bodies[0];
    const ctx = ctxOf(e);
    const topF = b.faces.findIndex((f) => f.type === "PLANE" && f.normal[2] > 0.99);
    const sideF = b.faces.findIndex((f) => f.type === "PLANE" && f.normal[0] > 0.99);
    const p = runMeasure(ctx, { op: "props", refs: [{ body: 0, kind: "face", index: topF }, { body: 0, kind: "face", index: sideF }] }) as PropsResult;
    expect(p.angle).toBeCloseTo(90, 9);
    expect(p.items[0].area).toBeCloseTo(50 * 30 - Math.PI * 25, 6);
    expect(p.items[0].perimeter).toBeCloseTo(160 + Math.PI * 10, 6);
    const circ = b.edges.findIndex((x) => x.type === "CIRCLE" && x.mid[2] > 9);
    const pe = runMeasure(ctx, { op: "props", refs: [{ body: 0, kind: "edge", index: circ }] }) as PropsResult;
    expect(pe.items[0].radius).toBeCloseTo(5, 9);
    expect(pe.items[0].arc! + 1e-9).toBeGreaterThan(179.99);
    const pv = runMeasure(ctx, { op: "props", refs: [{ kind: "body", body: 0 }], density: 0.00785 }) as PropsResult;
    expect(pv.items[0].volume).toBeCloseTo(50 * 30 * 10 - Math.PI * 25 * 10, 5);
    expect(pv.items[0].mass).toBeCloseTo((50 * 30 * 10 - Math.PI * 250) * 0.00785, 5);
  }, 60000);

  it("unit / precision formatting and CSV", () => {
    expect(formatMeasure(25.4, "length", { unit: "inch", precision: 3 })).toBe("1.000 in");
    expect(formatMeasure(12.3456, "length", { unit: "mm", precision: 2 })).toBe("12.35 mm");
    expect(formatMeasure(645.16, "area", { unit: "inch", precision: 2 })).toBe("1.00 in²");
    expect(formatMeasure(90, "angle", { unit: "inch", precision: 1 })).toBe("90.0°");
    const csv = notesCsv([{ id: "a", name: "穴 \"A\"", kind: "diameter", refs: [], value: 10, points: [] }], { unit: "mm", precision: 3 });
    expect(csv.split("\n")[1]).toBe('"穴 ""A""",直径,10.000,mm,OK');
  });
});

describe("measurement annotations", () => {
  const model = (d: number, x = 30): RFeature[] => [plate("p", 60, 40, 10), hole("h1", 10, [[x, 20]], d)];
  async function save(e: GeometryEngine, bodies: BodyMesh[]): Promise<MeasureNote> {
    const fi = cylFace(bodies[0], 30, 20);
    const ref = captureRef(bodies, { body: 0, kind: "face", index: fi })!;
    expect(ref.ref.name).toBe("h1:wall:p0");
    const note: MeasureNote = { id: "m1", name: "穴径", kind: "diameter", refs: [ref], value: 0, points: [] };
    const res = resolveNote(note, bodies);
    applyNoteResult(note, runMeasure(ctxOf(e), noteRequest(note, res)!));
    return note;
  }

  it("persists, re-resolves after an upstream edit and re-measures", async () => {
    const e = new GeometryEngine();
    const r1 = await e.rebuild(model(10));
    const note = await save(e, r1.bodies);
    expect(note.value).toBeCloseTo(10, 9);
    // document round trip (save / reload)
    const doc = JSON.parse(JSON.stringify({ measureNotes: [note] })) as { measureNotes: MeasureNote[] };
    const loaded = doc.measureNotes[0];
    // upstream edit: plate grows, hole diameter 10 -> 14 and moves
    const r2 = await e.rebuild([plate("p", 90, 40, 10), hole("h1", 10, [[45, 20]], 14)]);
    const res = resolveNote(loaded, r2.bodies);
    expect(res.ok).toBe(true);
    expect(loaded.broken).toBeUndefined();
    applyNoteResult(loaded, runMeasure(ctxOf(e), noteRequest(loaded, res)!));
    expect(loaded.value).toBeCloseTo(14, 9);
    expect(loaded.points[0][0]).toBeCloseTo(45, 6);
    expect(loaded.refs[0].ref.name).toBe("h1:wall:p0");
  }, 60000);

  it("distance note between named faces follows a dimension change", async () => {
    const e = new GeometryEngine();
    const r1 = await e.rebuild([plate("p", 60, 40, 10)]);
    const b = r1.bodies[0];
    const L = b.faces.findIndex((f) => f.normal[0] < -0.99), Rt = b.faces.findIndex((f) => f.normal[0] > 0.99);
    const note: MeasureNote = { id: "d", name: "幅", kind: "distance", refs: [captureRef(r1.bodies, { body: 0, kind: "face", index: L })!, captureRef(r1.bodies, { body: 0, kind: "face", index: Rt })!], value: 0, points: [] };
    applyNoteResult(note, runMeasure(ctxOf(e), noteRequest(note, resolveNote(note, r1.bodies))!));
    expect(note.value).toBeCloseTo(60, 9);
    const r2 = await e.rebuild([plate("p", 75, 40, 10)]);
    applyNoteResult(note, runMeasure(ctxOf(e), noteRequest(note, resolveNote(note, r2.bodies))!));
    expect(note.value).toBeCloseTo(75, 9);
  }, 60000);

  it("flags the note as broken when the measured hole is deleted", async () => {
    const e = new GeometryEngine();
    const r1 = await e.rebuild(model(10));
    const note = await save(e, r1.bodies);
    const r2 = await e.rebuild([plate("p", 60, 40, 10)]);
    const res = resolveNote(note, r2.bodies);
    expect(res.ok).toBe(false);
    expect(note.broken).toBe(true);
    expect(noteRequest(note, res)).toBeNull();
    // repair: re-pick the reference, the note resolves again
    const r3 = await e.rebuild([plate("p", 60, 40, 10), hole("h9", 10, [[20, 20]], 6)]);
    note.refs[0] = captureRef(r3.bodies, { body: 0, kind: "face", index: cylFace(r3.bodies[0], 20, 20) })!;
    const res3 = resolveNote(note, r3.bodies);
    expect(res3.ok).toBe(true);
    applyNoteResult(note, runMeasure(ctxOf(e), noteRequest(note, res3)!));
    expect(note.value).toBeCloseTo(6, 9);
    expect(note.broken).toBeUndefined();
  }, 60000);
});
