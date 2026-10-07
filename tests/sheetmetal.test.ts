import { beforeAll, describe, expect, it } from "vitest";
import opencascade from "replicad-opencascadejs";
import { setOC } from "replicad";
import { GeometryEngine } from "../src/kernel/geometry";
import { evaluateParams } from "../src/core/params";
import { newDocument, ORIGIN_PLANES } from "../src/core/document";
import { prepareDocument, resolveDocument } from "../src/core/resolve";
import type { PartDocument, SketchFeature } from "../src/core/types";
import { bendAllowance, ensureSheetStyle, flatPattern, outerEdges, sheetStyle, legLength } from "../src/sheetmetal/sheet";
import { sheetFlat } from "../src/sheetmetal/flat";

beforeAll(async () => {
  const OC = await (opencascade as unknown as () => Promise<unknown>)();
  setOC(OC as never);
}, 60000);

function rectSketch(w: number, h: number): SketchFeature {
  const p = (id: string, x: number, y: number) => ({ id, type: "point" as const, x, y });
  const l = (id: string, a: string, b: string) => ({ id, type: "line" as const, p1: a, p2: b });
  return {
    id: "sk", type: "sketch", name: "スケッチ1", plane: ORIGIN_PLANES.XY, planeLabel: "XY",
    entities: [p("a", 0, 0), p("b", w, 0), p("c", w, h), p("d", 0, h), l("l1", "a", "b"), l("l2", "b", "c"), l("l3", "c", "d"), l("l4", "d", "a")],
    constraints: [], dimensions: [],
  };
}

function boxDoc(): PartDocument {
  const doc = newDocument("箱");
  ensureSheetStyle(doc);
  doc.params.push({ name: "H", expr: "30", unit: "mm", kind: "user" });
  doc.features.push(
    rectSketch(100, 60),
    { id: "f1", type: "sheetFace", name: "面1", sketch: "sk", profiles: [0], profilePts: [[50, 30]], op: "new", flip: false },
    { id: "f2", type: "flange", name: "フランジ1", base: "f1", edges: [[50, 0], [100, 30], [50, 60], [0, 30]], height: "H", angle: "90", down: false },
  );
  doc.endOfPart = doc.features.length;
  return doc;
}

describe("sheet metal", () => {
  it("computes outward edges and bend allowance", () => {
    const s = { thickness: 2, radius: 2, k: 0.44 };
    expect(bendAllowance(90, s)).toBeCloseTo((Math.PI / 2) * (2 + 0.88), 9);
    expect(legLength(30, 90, s)).toBeCloseTo(26, 9);
    const edges = outerEdges([
      { t: "line", a: [0, 0], b: [10, 0] },
      { t: "line", a: [10, 0], b: [10, 5] },
      { t: "line", a: [10, 5], b: [0, 5] },
      { t: "line", a: [0, 5], b: [0, 0] },
    ]);
    expect(edges[0].out).toEqual([0, -1].map((x) => expect.closeTo(x, 9)) as never);
    expect(edges[1].out).toEqual([1, 0].map((x) => expect.closeTo(x, 9)) as never);
  });

  it("builds a box with four flanges and unfolds it", async () => {
    const doc = boxDoc();
    const values = evaluateParams(doc.params);
    prepareDocument(doc, values);
    const res = resolveDocument(doc, values);
    expect(res.errors).toEqual({});
    const eng = new GeometryEngine();
    const r = await eng.rebuild(res.features);
    expect(r.errors).toEqual({});
    expect(r.bodies.length).toBe(1);
    const mp = eng.massProps();
    const perLen = (Math.PI / 4) * (4 * 4 - 2 * 2) + 2 * 26;
    expect(mp.volume).toBeCloseTo(100 * 60 * 2 + 2 * (100 + 60) * perLen, 1);
    // flanges rise to the outside height H from the plate's outer face
    expect(mp.bbox[1][2]).toBeCloseTo(30, 6);
    expect(mp.bbox[0][0]).toBeCloseTo(-4, 6);
    expect(mp.bbox[1][0]).toBeCloseTo(104, 6);

    const s = sheetStyle(doc, values);
    const flat = sheetFlat(doc, res)!;
    const ba = bendAllowance(90, s);
    expect(flat.bounds[2] - flat.bounds[0]).toBeCloseTo(100 + 2 * (ba + 26), 6);
    expect(flat.bounds[3] - flat.bounds[1]).toBeCloseTo(60 + 2 * (ba + 26), 6);
    expect(flat.bends.length).toBe(4);
    void flatPattern;
  }, 60000);
});
