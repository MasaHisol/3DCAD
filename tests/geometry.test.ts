import { beforeAll, describe, expect, it } from "vitest";
import opencascade from "replicad-opencascadejs";
import { setOC } from "replicad";
import { GeometryEngine } from "../src/kernel/geometry";
import type { RFeature } from "../src/kernel/protocol";
import type { PlaneDef } from "../src/core/types";

const XY: PlaneDef = { origin: [0, 0, 0], xDir: [1, 0, 0], normal: [0, 0, 1] };
const rect = (w: number, h: number) => ({
  outer: [
    { t: "line" as const, a: [0, 0] as [number, number], b: [w, 0] as [number, number] },
    { t: "line" as const, a: [w, 0] as [number, number], b: [w, h] as [number, number] },
    { t: "line" as const, a: [w, h] as [number, number], b: [0, h] as [number, number] },
    { t: "line" as const, a: [0, h] as [number, number], b: [0, 0] as [number, number] },
  ],
  holes: [],
});

beforeAll(async () => {
  const OC = await (opencascade as unknown as () => Promise<unknown>)();
  setOC(OC as never);
}, 60000);

describe("geometry engine", () => {
  it("extrudes, cuts holes, fillets and tracks edge references", async () => {
    const eng = new GeometryEngine();
    const feats: RFeature[] = [
      { id: "e1", type: "extrude", plane: XY, regions: [rect(40, 20)], op: "new", from: 0, to: 10, through: false, flip: false },
      {
        id: "h1", type: "hole", plane: { ...XY, origin: [0, 0, 10] }, points: [[20, 10]], holeType: "counterbore",
        diameter: 6, depth: 0, through: true, cbDiameter: 10, cbDepth: 3, csDiameter: 0, csAngle: 90, flip: false,
      },
      { id: "f1", type: "fillet", edges: [{ mid: [40, 20, 5] }], radius: 2 },
    ];
    const r = await eng.rebuild(feats);
    expect(r.errors).toEqual({});
    expect(r.bodies.length).toBe(1);
    const mp = eng.massProps();
    const hole = Math.PI * 9 * 7 + Math.PI * 25 * 3;
    const fillet = (4 - Math.PI) * 10;
    expect(mp.volume).toBeCloseTo(8000 - hole - fillet, 0);
    // faces and edges carry ranges
    const b = r.bodies[0];
    expect(b.faces.length * 2).toBe(b.faceRanges.length);
    expect(b.faceRanges.reduce((s, v, i) => (i % 2 ? s + v : s), 0)).toBe(b.indices.length);

    // change the length: the fillet edge reference should follow
    feats[0] = { ...(feats[0] as any), regions: [rect(50, 20)] };
    feats[2] = { ...(feats[2] as any), edges: [{ ...r.updatedRefs.f1.edges![0], mid: [40, 20, 5] }] };
    const r2 = await eng.rebuild(feats);
    expect(r2.errors).toEqual({});
    expect(r2.updatedRefs.f1.edges![0].mid[0]).toBeCloseTo(50, 3);
  }, 60000);

  it("revolves, patterns and exports STEP", async () => {
    const eng = new GeometryEngine();
    const XZ: PlaneDef = { origin: [0, 0, 0], xDir: [1, 0, 0], normal: [0, -1, 0] };
    const feats: RFeature[] = [
      { id: "r1", type: "revolve", plane: XZ, regions: [rect(10, 5)], axisOrigin: [0, 0], axisDir: [0, 1], angle: 360, op: "new" },
      { id: "p", type: "primitive", shape: "cylinder", plane: XY, center: [7, 0], a: 2, b: 0, c: 5, op: "cut" },
      { id: "pt", type: "pattern", sources: ["p"], transforms: [1, 2, 3].map((k) => ({ rotate: { angle: k * 90, origin: [0, 0, 0], axis: [0, 0, 1] } })) },
    ];
    const r = await eng.rebuild(feats);
    expect(r.errors).toEqual({});
    expect(eng.massProps().volume).toBeCloseTo(Math.PI * 100 * 5 - 4 * Math.PI * 1 * 5, 0);
    const step = await eng.exportFile("step", "part").text();
    expect(step).toContain("ISO-10303-21");
    // the exported STEP re-imports as a solid
    const eng2 = new GeometryEngine();
    const r3 = await eng2.rebuild([{ id: "i", type: "import", format: "step", data: step }]);
    expect(r3.errors).toEqual({});
    expect(eng2.massProps().volume).toBeCloseTo(eng.massProps().volume, 0);
  }, 60000);

  it("lofts between sections and sweeps along a path", async () => {
    const eng = new GeometryEngine();
    const top: PlaneDef = { origin: [0, 0, 30], xDir: [1, 0, 0], normal: [0, 0, 1] };
    const r = await eng.rebuild([
      {
        id: "l",
        type: "loft",
        sections: [
          { plane: XY, outer: rect(20, 20).outer },
          { plane: top, outer: [{ t: "circle", c: [10, 10], r: 6 }] },
        ],
        ruled: false,
        op: "new",
      },
    ]);
    expect(r.errors).toEqual({});
    expect(eng.massProps().volume).toBeGreaterThan(Math.PI * 36 * 30);
    expect(eng.massProps().volume).toBeLessThan(400 * 30);
    const eng2 = new GeometryEngine();
    const r2 = await eng2.rebuild([
      {
        id: "s",
        type: "sweep",
        plane: XY,
        regions: [{ outer: [{ t: "circle", c: [0, 0], r: 3 }], holes: [[{ t: "circle", c: [0, 0], r: 2 }]] }],
        path: [{ t: "line", a: [0, 0, 0], b: [0, 0, 40] }],
        op: "new",
      },
    ]);
    expect(r2.errors).toEqual({});
    expect(eng2.massProps().volume).toBeCloseTo(Math.PI * (9 - 4) * 40, 1);
  }, 60000);

  it("imports STL and moves bodies", async () => {
    const eng = new GeometryEngine();
    await eng.rebuild([{ id: "e", type: "extrude", plane: XY, regions: [rect(10, 10)], op: "new", from: 0, to: 10, through: false, flip: false }]);
    const stl = new Uint8Array(await eng.exportFile("stl", "cube").arrayBuffer());
    let bin = "";
    stl.forEach((b) => (bin += String.fromCharCode(b)));
    const eng2 = new GeometryEngine();
    const r = await eng2.rebuild([
      { id: "i", type: "import", format: "stl", data: btoa(bin) },
      { id: "m", type: "move", transform: { rotate: { angle: 90, origin: [0, 0, 0], axis: [0, 0, 1] }, translate: [100, 0, 0] } },
    ]);
    expect(r.errors).toEqual({});
    const mp = eng2.massProps();
    expect(mp.bbox[0][0]).toBeCloseTo(90, 3);
    expect(mp.bbox[1][0]).toBeCloseTo(100, 3);
  }, 60000);

  it("reports a feature error but keeps building", async () => {
    const eng = new GeometryEngine();
    const r = await eng.rebuild([
      { id: "c", type: "extrude", plane: XY, regions: [rect(5, 5)], op: "cut", from: 0, to: 5, through: false, flip: false },
      { id: "e", type: "extrude", plane: XY, regions: [rect(5, 5)], op: "new", from: 0, to: 5, through: false, flip: false },
      { id: "s", type: "shell", faces: [{ center: [2.5, 2.5, 5], normal: [0, 0, 1] }], thickness: 1 },
    ]);
    expect(Object.keys(r.errors)).toEqual(["c"]);
    expect(r.bodies.length).toBe(1);
    // shell hollows inward by default: 5x5x5 minus 3x3x4 cavity
    expect(eng.massProps().volume).toBeCloseTo(125 - 36, 3);
  }, 60000);
});
