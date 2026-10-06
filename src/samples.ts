import { newDocument, ORIGIN_PLANES } from "./core/document";
import type { Parameter, PartDocument, SketchFeature } from "./core/types";
import type { AssemblyDocument } from "./assembly/types";

/**
 * A small parametric sample: a base plate with a boss, a bored hole and a
 * rectangular pattern of mounting holes, driven by user parameters.
 */
export function sampleDocument(): PartDocument {
  const doc = newDocument("ブラケット");
  doc.iprops["パーツ番号"] = "BRK-001";
  doc.iprops["説明"] = "サンプル ブラケット";
  doc.material = { name: "アルミニウム 6061", density: 2.7, color: "#d6dae0" };
  let n = 0;
  const P = (expr: string, owner: string, unit: Parameter["unit"] = "mm"): string => {
    const name = `d${n++}`;
    doc.params.push({ name, expr, unit, kind: "model", owner });
    return name;
  };
  doc.params.push(
    { name: "幅", expr: "80", unit: "mm", kind: "user", comment: "プレート幅" },
    { name: "奥行", expr: "50", unit: "mm", kind: "user", comment: "プレート奥行" },
    { name: "板厚", expr: "10", unit: "mm", kind: "user" },
    { name: "ボス径", expr: "30", unit: "mm", kind: "user" },
  );

  // Sketch 1: centred rectangle on the XZ (top) plane
  const sk1: SketchFeature = {
    id: "sk1",
    type: "sketch",
    name: "スケッチ1",
    plane: ORIGIN_PLANES.XZ,
    planeLabel: "XZ 平面",
    entities: [
      { id: "origin", type: "point", x: 0, y: 0, fixed: true, ref: true },
      { id: "a", type: "point", x: -40, y: -25 },
      { id: "b", type: "point", x: 40, y: -25 },
      { id: "c", type: "point", x: 40, y: 25 },
      { id: "d", type: "point", x: -40, y: 25 },
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
  sk1.dimensions.push(
    { id: "D1", type: "length", refs: ["l1"], param: P("幅", "sk1"), pos: [0, -36] },
    { id: "D2", type: "length", refs: ["l2"], param: P("奥行", "sk1"), pos: [52, 0] },
    { id: "D3", type: "hdistance", refs: ["origin", "a"], param: P("幅 / 2", "sk1"), pos: [-20, -46] },
    { id: "D4", type: "vdistance", refs: ["origin", "a"], param: P("奥行 / 2", "sk1"), pos: [-54, -12] },
  );
  doc.features.push(sk1);
  doc.features.push({
    id: "ex1",
    type: "extrude",
    name: "押し出し1",
    sketch: "sk1",
    profiles: [0],
    profilePts: [[0, 0]],
    op: "new",
    extent: "distance",
    distance: P("板厚", "ex1"),
    flip: false,
  });

  // Work plane on top of the plate, boss sketch on it
  doc.features.push({
    id: "wp1",
    type: "workplane",
    name: "作業平面1",
    base: ORIGIN_PLANES.XZ,
    baseLabel: "XZ 平面",
    offset: P("板厚", "wp1"),
    visible: false,
  });
  const sk2: SketchFeature = {
    id: "sk2",
    type: "sketch",
    name: "スケッチ2",
    plane: { origin: [0, 10, 0], xDir: [1, 0, 0], normal: [0, 1, 0] },
    planeLabel: "作業平面1",
    planeRef: "wp1",
    entities: [
      { id: "origin", type: "point", x: 0, y: 0, fixed: true, ref: true },
      { id: "C", type: "circle", c: "origin", r: 15 },
    ],
    constraints: [],
    dimensions: [],
  };
  sk2.dimensions.push({ id: "D5", type: "diameter", refs: ["C"], param: P("ボス径", "sk2"), pos: [14, 14] });
  doc.features.push(sk2);
  doc.features.push({
    id: "ex2",
    type: "extrude",
    name: "押し出し2",
    sketch: "sk2",
    profiles: [0],
    profilePts: [[0, 0]],
    op: "join",
    extent: "distance",
    distance: P("25", "ex2"),
    flip: false,
  });

  // Hole sketch on the bottom plane: centre bore + one mounting hole
  const sk3: SketchFeature = {
    id: "sk3",
    type: "sketch",
    name: "スケッチ3",
    plane: ORIGIN_PLANES.XZ,
    planeLabel: "XZ 平面",
    entities: [
      { id: "origin", type: "point", x: 0, y: 0, fixed: true, ref: true },
      { id: "hc", type: "point", x: 0, y: 0 },
    ],
    constraints: [{ id: "c5", type: "coincident", refs: ["hc", "origin"] }],
    dimensions: [],
  };
  doc.features.push(sk3);
  doc.features.push({
    id: "ho1",
    type: "hole",
    name: "穴1",
    sketch: "sk3",
    points: [],
    holeType: "simple",
    diameter: P("ボス径 - 14", "ho1"),
    depth: P("10", "ho1"),
    through: true,
    cbDiameter: P("11", "ho1"),
    cbDepth: P("6.5", "ho1"),
    csDiameter: P("12", "ho1"),
    csAngle: P("90", "ho1", "deg"),
    flip: true,
  });

  const sk4: SketchFeature = {
    id: "sk4",
    type: "sketch",
    name: "スケッチ4",
    plane: ORIGIN_PLANES.XZ,
    planeLabel: "XZ 平面",
    entities: [
      { id: "origin", type: "point", x: 0, y: 0, fixed: true, ref: true },
      { id: "m1", type: "point", x: -30, y: 17.5 },
    ],
    constraints: [],
    dimensions: [],
  };
  sk4.dimensions.push(
    { id: "D6", type: "hdistance", refs: ["origin", "m1"], param: P("幅 / 2 - 10", "sk4"), pos: [-15, 26] },
    { id: "D7", type: "vdistance", refs: ["origin", "m1"], param: P("奥行 / 2 - 7.5", "sk4"), pos: [-38, 8] },
  );
  doc.features.push(sk4);
  doc.features.push({
    id: "ho2",
    type: "hole",
    name: "穴2",
    sketch: "sk4",
    points: [],
    holeType: "counterbore",
    diameter: P("6.6", "ho2"),
    depth: P("10", "ho2"),
    through: true,
    cbDiameter: P("11", "ho2"),
    cbDepth: P("4", "ho2"),
    csDiameter: P("12", "ho2"),
    csAngle: P("90", "ho2", "deg"),
    flip: true,
  });
  doc.features.push({
    id: "rp1",
    type: "rectPattern",
    name: "矩形状パターン1",
    features: ["ho2"],
    axis: "X",
    count: P("2", "rp1", "ul"),
    spacing: P("幅 - 20", "rp1"),
    axis2: "Z",
    count2: P("2", "rp1", "ul"),
    spacing2: P("奥行 - 15", "rp1"),
    flip: false,
  });
  doc.features.push({
    id: "fl1",
    type: "fillet",
    name: "フィレット1",
    edges: [
      { mid: [40, 5, 25], a: [40, 0, 25], b: [40, 10, 25], type: "LINE" },
      { mid: [-40, 5, 25], a: [-40, 0, 25], b: [-40, 10, 25], type: "LINE" },
      { mid: [40, 5, -25], a: [40, 0, -25], b: [40, 10, -25], type: "LINE" },
      { mid: [-40, 5, -25], a: [-40, 0, -25], b: [-40, 10, -25], type: "LINE" },
    ],
    radius: P("6", "fl1"),
  });
  doc.endOfPart = doc.features.length;
  return doc;
}

/** A stepped pin: head Ø26 × 6 on top of a Ø16 × 50 shaft, axis along Y. */
export function samplePin(): PartDocument {
  const doc = newDocument("ピン");
  doc.iprops["パーツ番号"] = "PIN-016";
  doc.iprops["説明"] = "段付きピン";
  doc.material = { name: "鋼", density: 7.85, color: "#b9bec5" };
  doc.params.push(
    { name: "d0", expr: "26", unit: "mm", kind: "model", owner: "head" },
    { name: "d1", expr: "6", unit: "mm", kind: "model", owner: "head" },
    { name: "d2", expr: "16", unit: "mm", kind: "model", owner: "shaft" },
    { name: "d3", expr: "50", unit: "mm", kind: "model", owner: "shaft" },
    { name: "d4", expr: "1", unit: "mm", kind: "model", owner: "cf" },
  );
  doc.features.push(
    { id: "head", type: "cylinder", name: "円柱1", plane: ORIGIN_PLANES.XZ, center: [0, 0], a: "d0", b: "0", c: "d1", op: "new" },
    { id: "shaft", type: "cylinder", name: "円柱2", plane: { origin: [0, 0, 0], xDir: [1, 0, 0], normal: [0, -1, 0] }, center: [0, 0], a: "d2", b: "0", c: "d3", op: "join" },
    { id: "cf", type: "chamfer", name: "面取り1", edges: [{ mid: [-8, -50, 0], type: "CIRCLE" }], distance: "d4" },
  );
  doc.endOfPart = doc.features.length;
  return doc;
}

/** Bracket + two pins: one inserted into the bore, one free next to it. */
export function sampleAssembly(): AssemblyDocument {
  const bracket = sampleDocument();
  const pin = samplePin();
  return {
    format: "3dcad-assembly",
    version: 1,
    name: "ピン組立",
    parts: [
      { id: "p-bracket", name: bracket.name, kind: "part", doc: bracket },
      { id: "p-pin", name: pin.name, kind: "part", doc: pin },
    ],
    components: [
      { id: "c1", name: "ブラケット:1", partId: "p-bracket", matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], grounded: true },
      { id: "c2", name: "ピン:1", partId: "p-pin", matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 70, 30, 0, 1], grounded: false },
      { id: "c3", name: "ピン:2", partId: "p-pin", matrix: [0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, 0, -90, 20, 40, 1], grounded: false },
    ],
    constraints: [
      {
        id: "k1",
        name: "挿入:1",
        type: "insert",
        // bore edge on the boss top face (normal +Y) and the head's underside rim (normal -Y)
        a: { comp: "c1", geom: "axis", point: [0, 35, 0], dir: [0, 1, 0], label: "ブラケット:1 エッジ" },
        b: { comp: "c2", geom: "axis", point: [0, 0, 0], dir: [0, -1, 0], label: "ピン:1 エッジ" },
        offset: "0",
      },
    ],
    params: [],
    iprops: { パーツ番号: "ASM-001", 説明: "サンプル アセンブリ", 設計者: "", 作成日: new Date().toISOString().slice(0, 10) },
  };
}
