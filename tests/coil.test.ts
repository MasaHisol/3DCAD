import { beforeAll, describe, expect, it } from "vitest";
import opencascade from "replicad-opencascadejs";
import { setOC } from "replicad";
import { GeometryEngine } from "../src/kernel/geometry";
import type { PlaneDef } from "../src/core/types";

beforeAll(async () => {
  setOC((await (opencascade as unknown as () => Promise<unknown>)()) as never);
}, 60000);

const XY: PlaneDef = { origin: [0, 0, 0], xDir: [1, 0, 0], normal: [0, 0, 1] };

describe("coil", () => {
  it("spring volume = profile area × helix length", async () => {
    const eng = new GeometryEngine();
    const pitch = 5, turns = 3, R = 10, a = 1;
    const r = await eng.rebuild([
      { id: "c", type: "coil", plane: XY, regions: [{ outer: [{ t: "circle", c: [R, 0], r: a }], holes: [] }], axisOrigin: [0, 0], axisDir: [0, 1], pitch, turns, leftHand: false, op: "new" },
    ]);
    expect(r.errors).toEqual({});
    const helix = turns * Math.hypot(2 * Math.PI * R, pitch);
    expect(eng.massProps().volume / (Math.PI * a * a * helix)).toBeCloseTo(1, 2);
    // height along the axis (Y): turns × pitch + wire diameter
    const bb = r.bodies[0].bbox;
    expect(bb[1][1] - bb[0][1]).toBeCloseTo(turns * pitch + 2 * a, 1);
  }, 120000);
});

const rect = (x0: number, y0: number, x1: number, y1: number) => ({
  outer: [
    { t: "line" as const, a: [x0, y0] as [number, number], b: [x1, y0] as [number, number] },
    { t: "line" as const, a: [x1, y0] as [number, number], b: [x1, y1] as [number, number] },
    { t: "line" as const, a: [x1, y1] as [number, number], b: [x0, y1] as [number, number] },
    { t: "line" as const, a: [x0, y1] as [number, number], b: [x0, y0] as [number, number] },
  ],
  holes: [],
});

describe("emboss / engrave text", () => {
  const plate = { id: "p", type: "extrude" as const, plane: XY, regions: [rect(0, 0, 100, 40)], op: "new" as const, from: 0, to: 10, through: false, flip: false };
  const top: PlaneDef = { origin: [0, 0, 10], xDir: [1, 0, 0], normal: [0, 0, 1] };
  it("engraves Latin text and embosses Japanese text", async () => {
    const eng = new GeometryEngine();
    await eng.rebuild([plate]);
    const v0 = eng.massProps().volume;
    let r = await eng.rebuild([plate, { id: "t", type: "emboss", plane: top, text: "ABC-123", pos: [5, 10], size: 10, depth: 1, angle: 0, op: "cut" }]);
    expect(r.errors).toEqual({});
    const cut = v0 - eng.massProps().volume;
    expect(cut).toBeGreaterThan(50);
    expect(cut).toBeLessThan(10 * 70 * 1);
    r = await eng.rebuild([plate, { id: "t", type: "emboss", plane: top, text: "日本語", pos: [5, 10], size: 10, depth: 2, angle: 0, op: "join" }]);
    expect(r.errors).toEqual({});
    expect(eng.massProps().volume - v0).toBeGreaterThan(50);
    expect(r.bodies[0].bbox[1][2]).toBeCloseTo(12, 3);
  }, 120000);
});

import { polylinePath } from "../src/core/resolve";

describe("3D sweep path", () => {
  it("bent tube: volume = area × centre-line length", async () => {
    const pts: [number, number, number][] = [[0, 0, 0], [0, 0, 100], [100, 0, 100], [100, 80, 160]];
    const R = 20;
    const path = polylinePath(pts, R);
    expect(path.map((s) => s.t)).toEqual(["line", "arc", "line", "arc", "line"]);
    // centre-line length: straight lengths minus 2t per corner plus arc lengths
    const seg = (a: number[], b: number[]) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
    let L = 0;
    for (const s of path) L += s.t === "line" ? seg(s.a, s.b) : 0;
    for (const s of path) if (s.t === "arc") {
      const c = seg(s.a, s.b) / 2;
      L += 2 * R * Math.asin(c / R);
    }
    const eng = new GeometryEngine();
    const prof: PlaneDef = { origin: [0, 0, 0], xDir: [1, 0, 0], normal: [0, 0, 1] };
    const r = await eng.rebuild([{ id: "s", type: "sweep", plane: prof, regions: [{ outer: [{ t: "circle", c: [0, 0], r: 5 }], holes: [] }], path, op: "new" }]);
    expect(r.errors).toEqual({});
    expect(eng.massProps().volume / (Math.PI * 25 * L)).toBeCloseTo(1, 2);
  }, 120000);
});

import { drawView } from "../src/kernel/geometry";
import * as Rp from "replicad";

describe("stepped section view", () => {
  it("cuts on two planes and hatches both faces", () => {
    const box = Rp.makeBox([0, 0, 0], [100, 60, 20]) as never;
    const g = drawView([{ shape: box, tag: 0 }], { dir: [0, -1, 0], xAxis: [1, 0, 0], section: { origin: [0, 10, 0], normal: [0, -1, 0], along: [1, 0, 0], steps: [{ at: 50, offset: -20 }] } });
    expect(g.hatch.length).toBe(2);
    const area = (ring: [number, number][]) => Math.abs(ring.reduce((s, p, i) => s + p[0] * ring[(i + 1) % ring.length][1] - ring[(i + 1) % ring.length][0] * p[1], 0)) / 2;
    expect(g.hatch.map((h) => +area(h[0]).toFixed(3)).sort()).toEqual([1000, 1000]);
  }, 60000);
});
