import { beforeAll, describe, expect, it } from "vitest";
import opencascade from "replicad-opencascadejs";
import { setOC } from "replicad";
import { GeometryEngine } from "../src/kernel/geometry";
import type { RFeature } from "../src/kernel/protocol";
import type { PlaneDef } from "../src/core/types";

const XY: PlaneDef = { origin: [0, 0, 0], xDir: [1, 0, 0], normal: [0, 0, 1] };
const rect = (x0: number, y0: number, x1: number, y1: number) => ({
  outer: [
    { t: "line" as const, a: [x0, y0] as [number, number], b: [x1, y0] as [number, number] },
    { t: "line" as const, a: [x1, y0] as [number, number], b: [x1, y1] as [number, number] },
    { t: "line" as const, a: [x1, y1] as [number, number], b: [x0, y1] as [number, number] },
    { t: "line" as const, a: [x0, y1] as [number, number], b: [x0, y0] as [number, number] },
  ],
  holes: [],
});

beforeAll(async () => {
  setOC((await (opencascade as unknown as () => Promise<unknown>)()) as never);
}, 60000);

/** L-bracket in the XY plane, 20 deep in Z: base 60×10, wall 10×60. */
const lBracket: RFeature[] = [
  { id: "a", type: "extrude", plane: XY, regions: [rect(0, 0, 60, 10)], op: "new", from: 0, to: 20, through: false, flip: false },
  { id: "b", type: "extrude", plane: XY, regions: [rect(0, 10, 10, 60)], op: "join", from: 0, to: 20, through: false, flip: false },
];
const base = 60 * 10 * 20 + 10 * 50 * 20;

describe("shape editing features", () => {
  it("rib fills the triangle between the sketch line and the walls", async () => {
    const eng = new GeometryEngine();
    const r = await eng.rebuild([...lBracket, { id: "r", type: "rib", plane: { ...XY, origin: [0, 0, 10] }, segs: [[[10, 50], [50, 10]]], thickness: 4, flip: false }]);
    expect(r.errors).toEqual({});
    expect(eng.massProps().volume).toBeCloseTo(base + (40 * 40) / 2 * 4, 3);
    expect(r.bodies.length).toBe(1);
  }, 60000);

  it("draft tapers a side face about a neutral face", async () => {
    const eng = new GeometryEngine();
    const r = await eng.rebuild([
      { id: "a", type: "extrude", plane: XY, regions: [rect(0, 0, 40, 20)], op: "new", from: 0, to: 10, through: false, flip: false },
      // +X side face drafted 5° about the bottom face (pull direction +Z)
      { id: "d", type: "draft", faces: [{ center: [40, 10, 5], normal: [1, 0, 0] }], neutral: { center: [20, 10, 0], normal: [0, 0, -1] }, angle: 5, flip: true },
    ]);
    expect(r.errors).toEqual({});
    // removed wedge: ½ · h · (h tan5°) · depth
    const wedge = 0.5 * 10 * 10 * Math.tan((5 * Math.PI) / 180) * 20;
    expect(Math.abs(eng.massProps().volume - 40 * 20 * 10)).toBeCloseTo(wedge, 2);
  }, 60000);

  it("split keeps one side or both", async () => {
    const eng = new GeometryEngine();
    const box: RFeature = { id: "a", type: "extrude", plane: XY, regions: [rect(0, 0, 40, 20)], op: "new", from: 0, to: 10, through: false, flip: false };
    let r = await eng.rebuild([box, { id: "s", type: "split", plane: { origin: [10, 0, 0], xDir: [0, 1, 0], normal: [1, 0, 0] }, keep: "positive" }]);
    expect(r.errors).toEqual({});
    expect(eng.massProps().volume).toBeCloseTo(30 * 20 * 10, 3);
    r = await eng.rebuild([box, { id: "s", type: "split", plane: { origin: [10, 0, 0], xDir: [0, 1, 0], normal: [1, 0, 0] }, keep: "both" }]);
    expect(r.bodies.length).toBe(2);
    expect(eng.massProps().volume).toBeCloseTo(40 * 20 * 10, 3);
  }, 60000);

  it("thicken extrudes planar faces", async () => {
    const eng = new GeometryEngine();
    const r = await eng.rebuild([
      { id: "a", type: "extrude", plane: XY, regions: [rect(0, 0, 40, 20)], op: "new", from: 0, to: 10, through: false, flip: false },
      { id: "t", type: "thicken", faces: [{ center: [20, 10, 10], normal: [0, 0, 1] }], distance: 3, flip: false, op: "join" },
    ]);
    expect(r.errors).toEqual({});
    expect(eng.massProps().volume).toBeCloseTo(40 * 20 * 13, 3);
  }, 60000);
});
