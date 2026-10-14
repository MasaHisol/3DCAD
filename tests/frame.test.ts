import { beforeAll, describe, expect, it } from "vitest";
import opencascade from "replicad-opencascadejs";
import { setOC } from "replicad";
import { GeometryEngine } from "../src/kernel/geometry";
import type { RFeature } from "../src/kernel/protocol";
import type { PlaneDef } from "../src/core/types";
import { cutList, findSize, sectionShape } from "../src/library/steel";

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

type V = [number, number, number];
const square: { a: V; b: V; up: V }[] = [
  { a: [0, 0, 0], b: [400, 0, 0], up: [0, 0, 1] },
  { a: [400, 0, 0], b: [400, 300, 0], up: [0, 0, 1] },
  { a: [400, 300, 0], b: [0, 300, 0], up: [0, 0, 1] },
  { a: [0, 300, 0], b: [0, 0, 0], up: [0, 0, 1] },
];

describe("frame generator + welding", () => {
  it("mitered square-tube frame: 4 members, volume = A × centre-line length", async () => {
    const z = findSize("sqtube", "□50×50×2.3")!;
    const sec = sectionShape("sqtube", z.d);
    const eng = new GeometryEngine();
    const r = await eng.rebuild([{ id: "f", type: "frame", members: square, outer: sec.outer, holes: sec.holes, miter: true, rotate: 0 }]);
    expect(r.errors).toEqual({});
    expect(r.bodies.length).toBe(4);
    expect(eng.massProps().volume / (sec.area * 1400)).toBeCloseTo(1, 4);
    const rows = cutList(square, z.name, sec.area, true);
    expect(rows.map((x) => [x.length, x.qty, x.angles.join()])).toEqual([[400, 2, "45,45"], [300, 2, "45,45"]]);
    expect(rows[0].mass).toBeCloseTo((sec.area * 7.85e-3 * 0.4) * 2, 6);
  }, 120000);

  it("fillet weld between a post and a base plate", async () => {
    const eng = new GeometryEngine();
    const feats: RFeature[] = [
      { id: "p", type: "extrude", plane: XY, regions: [rect(0, 0, 100, 100)], op: "new", from: 0, to: 10, through: false, flip: false },
      { id: "q", type: "extrude", plane: { ...XY, origin: [0, 0, 10] }, regions: [rect(40, 40, 60, 60)], op: "new", from: 0, to: 50, through: false, flip: false },
    ];
    await eng.rebuild(feats);
    const v0 = eng.massProps().volume;
    const r = await eng.rebuild([...feats, { id: "w", type: "weld", edges: [{ mid: [50, 40, 10], dir: [1, 0, 0] } as never], size: 5 }]);
    expect(r.errors).toEqual({});
    expect(eng.massProps().volume - v0).toBeCloseTo((5 * 5) / 2 * 20, 3);
    // the bead sits in the corner outside the post, on top of the plate
    const bb = r.bodies[2].bbox;
    expect(bb[0].map((x) => +x.toFixed(3))).toEqual([40, 35, 10]);
    expect(bb[1].map((x) => +x.toFixed(3))).toEqual([60, 40, 15]);
  }, 120000);
});
