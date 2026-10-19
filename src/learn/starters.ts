// Starting models for lessons that build on an existing part, so each lesson
// can be taken on its own.
import { newDocument, ORIGIN_PLANES } from "../core/document";
import type { Parameter, PartDocument, SketchFeature } from "../core/types";
import type { AssemblyDocument } from "../assembly/types";
import { sampleAssembly } from "../samples";

function builder(doc: PartDocument) {
  let n = 0;
  return (expr: string, owner: string, unit: Parameter["unit"] = "mm"): string => {
    const name = `d${n++}`;
    doc.params.push({ name, expr, unit, kind: "model", owner });
    return name;
  };
}

/** Centred, fully dimensioned rectangle on the XZ (floor) plane. */
function rectSketch(id: string, name: string, w: string, d: string, P: ReturnType<typeof builder>, W: number, D: number): SketchFeature {
  const sk: SketchFeature = {
    id,
    type: "sketch",
    name,
    plane: ORIGIN_PLANES.XZ,
    planeLabel: "XZ 平面",
    entities: [
      { id: "origin", type: "point", x: 0, y: 0, fixed: true, ref: true },
      { id: "a", type: "point", x: -W / 2, y: -D / 2 },
      { id: "b", type: "point", x: W / 2, y: -D / 2 },
      { id: "c", type: "point", x: W / 2, y: D / 2 },
      { id: "d", type: "point", x: -W / 2, y: D / 2 },
      { id: "l1", type: "line", p1: "a", p2: "b" },
      { id: "l2", type: "line", p1: "b", p2: "c" },
      { id: "l3", type: "line", p1: "c", p2: "d" },
      { id: "l4", type: "line", p1: "d", p2: "a" },
    ],
    constraints: [
      { id: "c1", type: "horizontal", refs: ["l1"] },
      { id: "c2", type: "vertical", refs: ["l2"] },
      { id: "c3", type: "horizontal", refs: ["l3"] },
      { id: "c4", type: "vertical", refs: ["l4"] },
    ],
    dimensions: [],
  };
  // the position dimensions follow the size ones, so the rectangle stays centred on the origin
  const pw = P(w, id);
  const pd = P(d, id);
  sk.dimensions.push(
    { id: "D1", type: "length", refs: ["l1"], param: pw, pos: [0, -D / 2 - 10] },
    { id: "D2", type: "length", refs: ["l2"], param: pd, pos: [W / 2 + 12, 0] },
    { id: "D3", type: "hdistance", refs: ["origin", "a"], param: P(`${pw} / 2`, id), pos: [-W / 4, -D / 2 - 20] },
    { id: "D4", type: "vdistance", refs: ["origin", "a"], param: P(`${pd} / 2`, id), pos: [-W / 2 - 14, -D / 4] },
  );
  return sk;
}

/** 60 × 40 × 15 block: the base for the modify-feature lessons. */
export function blockStarter(): PartDocument {
  const doc = newDocument("練習ブロック");
  doc.iprops["説明"] = "学習用ブロック";
  const P = builder(doc);
  doc.features.push(rectSketch("sk1", "スケッチ1", "60", "40", P, 60, 40));
  doc.features.push({ id: "ex1", type: "extrude", name: "押し出し1", sketch: "sk1", profiles: [0], profilePts: [[0, 0]], op: "new", extent: "distance", distance: P("15", "ex1"), flip: false });
  doc.endOfPart = doc.features.length;
  return doc;
}

/** 100 × 60 × 8 plate with one Ø9 through hole near the (-X, -Z) corner (pattern lesson). */
export function plateStarter(): PartDocument {
  const doc = newDocument("取付プレート");
  doc.iprops["説明"] = "学習用プレート";
  const P = builder(doc);
  doc.features.push(rectSketch("sk1", "スケッチ1", "100", "60", P, 100, 60));
  doc.features.push({ id: "ex1", type: "extrude", name: "押し出し1", sketch: "sk1", profiles: [0], profilePts: [[0, 0]], op: "new", extent: "distance", distance: P("8", "ex1"), flip: false });
  const sk2: SketchFeature = {
    id: "sk2",
    type: "sketch",
    name: "スケッチ2",
    plane: ORIGIN_PLANES.XZ,
    planeLabel: "XZ 平面",
    entities: [
      { id: "origin", type: "point", x: 0, y: 0, fixed: true, ref: true },
      { id: "h1", type: "point", x: -40, y: 20 },
    ],
    constraints: [],
    dimensions: [],
  };
  sk2.dimensions.push(
    { id: "D5", type: "hdistance", refs: ["origin", "h1"], param: P("40", "sk2"), pos: [-20, 30] },
    { id: "D6", type: "vdistance", refs: ["origin", "h1"], param: P("20", "sk2"), pos: [-52, 10] },
  );
  doc.features.push(sk2);
  doc.features.push({
    id: "ho1",
    type: "hole",
    name: "穴1",
    sketch: "sk2",
    points: [],
    holeType: "simple",
    diameter: P("9", "ho1"),
    depth: P("8", "ho1"),
    through: true,
    cbDiameter: P("14", "ho1"),
    cbDepth: P("5", "ho1"),
    csDiameter: P("16", "ho1"),
    csAngle: P("90", "ho1", "deg"),
    flip: true,
  });
  doc.endOfPart = doc.features.length;
  return doc;
}

/** Bracket (grounded) and one loose pin, no constraints yet. */
export function pinAssemblyStarter(): AssemblyDocument {
  const asm = sampleAssembly();
  asm.name = "ピン組立 (練習)";
  asm.components = asm.components.filter((c) => c.id !== "c3");
  const pin = asm.components.find((c) => c.id === "c2")!;
  pin.matrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 90, 40, 0, 1];
  asm.constraints = [];
  return asm;
}
