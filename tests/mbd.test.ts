import { describe, expect, it } from "vitest";
import { newDocument } from "../src/core/document";
import { validatePart } from "../src/core/validate";
import type { PartDocument } from "../src/core/types";
import type { BodyMesh } from "../src/kernel/protocol";
import { addPmi, cleanPmi, nextDatumLetter, pmiCsv, pmiText, removePmi, updatePmi, type PmiAnno, type PmiDim, type PmiDiameter } from "../src/mbd/pmi";
import { measureLinear, pmiGeometry, resolveRef } from "../src/mbd/resolve";
import { pmiToDrawing, pmiToViews } from "../src/mbd/drawing";
import { resnap } from "../src/drawing/geom";
import type { DView } from "../src/drawing/types";

const face = (center: [number, number, number], normal: [number, number, number], type = "PLANE") => ({ kind: "face" as const, ref: { center, normal, type } });

/** A w x h x d block body with its six planar faces and a vertical hole (cylinder, r = 5) through the middle. */
function block(w = 100, h = 50, d = 20): BodyMesh {
  const faces = [
    { center: [0, h / 2, d / 2], normal: [-1, 0, 0], type: "PLANE" },
    { center: [w, h / 2, d / 2], normal: [1, 0, 0], type: "PLANE" },
    { center: [w / 2, 0, d / 2], normal: [0, -1, 0], type: "PLANE" },
    { center: [w / 2, h, d / 2], normal: [0, 1, 0], type: "PLANE" },
    { center: [w / 2, h / 2, 0], normal: [0, 0, -1], type: "PLANE" },
    { center: [w / 2, h / 2, d], normal: [0, 0, 1], type: "PLANE" },
    { center: [w / 2 + 5, h / 2, d / 2], normal: [-1, 0, 0], type: "CYLINDRE", axis: { origin: [w / 2, h / 2, 0], dir: [0, 0, 1], radius: 5 } },
  ];
  return {
    name: "b",
    bbox: [
      [0, 0, 0],
      [w, h, d],
    ],
    positions: new Float32Array(),
    normals: new Float32Array(),
    indices: new Uint32Array(),
    faceRanges: new Int32Array(),
    faces: faces as BodyMesh["faces"],
    edgePositions: new Float32Array(),
    edgeRanges: new Int32Array(),
    edges: [],
  };
}

function dim(): PmiDim {
  // FaceRefs as the app captures them: with the bounding-box-normalised position `n`
  const l = face([0, 25, 10], [-1, 0, 0]), r = face([100, 25, 10], [1, 0, 0]);
  l.ref = { ...l.ref, n: [0, 0.5, 0.5] } as typeof l.ref;
  r.ref = { ...r.ref, n: [1, 0.5, 0.5] } as typeof r.ref;
  return { id: "p1", type: "dim", refs: [l, r], tol: { kind: "sym", value: "0.1" } };
}

describe("MBD / PMI data", () => {
  it("adds, edits and deletes annotations", () => {
    const doc = newDocument();
    expect(doc.pmi).toBeUndefined();
    addPmi(doc, dim());
    addPmi(doc, { id: "p2", type: "datum", refs: [face([50, 0, 10], [0, -1, 0])], letter: "A" });
    expect(doc.pmi!.length).toBe(2);
    expect(nextDatumLetter(doc)).toBe("B");
    const d = { ...(doc.pmi![0] as PmiDim), tol: { kind: "fit" as const, fit: "h7" } };
    expect(updatePmi(doc, d)).toBe(true);
    expect((doc.pmi![0] as PmiDim).tol).toEqual({ kind: "fit", fit: "h7" });
    expect(updatePmi(doc, { ...d, id: "nope" })).toBe(false);
    expect(removePmi(doc, ["p1"])).toBe(1);
    expect(doc.pmi!.map((a) => a.id)).toEqual(["p2"]);
    removePmi(doc, ["p2"]);
    expect(doc.pmi).toBeUndefined();
  });

  it("formats text with the drawing tolerance conventions", () => {
    const a: PmiDim = { ...dim(), value: 100 };
    expect(pmiText(a)).toBe("100 ±0.1");
    const dia: PmiDiameter = { id: "x", type: "diameter", refs: [], value: 10, tol: { kind: "fit", fit: "H7" } };
    expect(pmiText(dia)).toBe("φ10 H7");
    expect(pmiText({ ...dia, radius: true, tol: { kind: "dev", upper: "0.02", lower: "-0.01" } })).toBe("R5 (+0.02 / -0.01)");
    expect(pmiText({ id: "g", type: "gdt", refs: [], symbol: "⟂", value: "0.05", datums: "A B" })).toBe("⟂ 0.05 | A | B");
    expect(pmiText({ id: "s", type: "surface", refs: [], ra: "3.2", removal: "required" })).toBe("Ra 3.2");
  });

  it("serializes through JSON and validatePart, cleaning broken entries", () => {
    const doc = newDocument();
    addPmi(doc, dim());
    addPmi(doc, { id: "p1", type: "note", refs: [face([1, 2, 3], [0, 0, 1])], text: "バリなきこと" }); // duplicate id
    const raw = JSON.parse(JSON.stringify(doc));
    raw.pmi.push({ type: "dim", refs: [face([0, 0, 0], [1, 0, 0])] }); // too few refs
    raw.pmi.push({ type: "bogus", refs: [] });
    raw.pmi.push("junk");
    raw.pmi[0].tol = { kind: "dev" }; // incomplete tolerance gets defaults
    const { doc: out, warnings } = validatePart(raw);
    expect(out.pmi!.length).toBe(2);
    expect(out.pmi![0].type).toBe("dim");
    expect((out.pmi![0] as PmiDim).tol).toEqual({ kind: "dev", upper: "0", lower: "0" });
    expect(out.pmi![1].id).not.toBe("p1");
    expect(warnings.some((w) => w.includes("3 個"))).toBe(true);
  });

  it("loads old files without pmi and drops a non-array pmi", () => {
    const old = JSON.parse(JSON.stringify(newDocument()));
    expect(validatePart(old).doc.pmi).toBeUndefined();
    const bad = { ...old, pmi: { a: 1 } };
    const r = validatePart(bad);
    expect(r.doc.pmi).toBeUndefined();
    expect(r.warnings.length).toBe(1);
    const doc = newDocument() as PartDocument;
    expect(cleanPmi(doc)).toEqual([]);
  });

  it("exports a CSV", () => {
    const doc = newDocument();
    addPmi(doc, { ...dim(), value: 100 });
    addPmi(doc, { id: "n", type: "note", refs: [face([1, 2, 3], [0, 0, 1])], text: 'a,"b"' });
    const csv = pmiCsv(doc);
    const lines = csv.trim().split("\r\n");
    expect(lines.length).toBe(3);
    expect(lines[1]).toContain("寸法");
    expect(lines[1]).toContain("±0.1");
    expect(lines[2]).toContain('"a,""b"""');
  });
});

describe("MBD / PMI geometry", () => {
  it("resolves refs and measures after the model is resized", () => {
    const a = dim();
    const g = pmiGeometry(a, [block()]);
    expect(g!.value).toBeCloseTo(100);
    // parameter change: block becomes 140 long -> right face moved, still found via the box-normalised position
    const g2 = pmiGeometry(a, [block(140)]);
    expect(g2!.value).toBeCloseTo(140);
    expect((g2!.refs[1].updated.ref as { center: number[] }).center[0]).toBe(140);
  });

  it("measures cylinder diameter and loses refs that vanish", () => {
    const dia: PmiAnno = { id: "d", type: "diameter", refs: [face([55, 25, 10], [-1, 0, 0], "CYLINDRE")] };
    expect(pmiGeometry(dia, [block()])!.value).toBeCloseTo(10);
    const lost: PmiAnno = { id: "l", type: "datum", letter: "A", refs: [face([500, 500, 500], [0, 1, 0], "BSPLINE")] };
    expect(pmiGeometry(lost, [block()])).toBeNull();
  });

  it("measures plane to plane along the normal", () => {
    const b = block();
    const r1 = resolveRef([b], face([0, 25, 10], [-1, 0, 0]), 100)!;
    const r2 = resolveRef([b], face([100, 25, 10], [1, 0, 0]), 100)!;
    const m = measureLinear(r1, r2);
    expect(m.value).toBeCloseTo(100);
    expect(Math.abs(m.dir[0])).toBeCloseTo(1);
  });

  it("projects compatible PMI into a drawing view", () => {
    const b = block();
    const front: DView = { id: "v1", label: "正面図", kind: "base", dir: [0, 0, 1], xAxis: [1, 0, 0], scale: 1, x: 100, y: 150, hidden: true, centerMarks: true };
    const items: PmiAnno[] = [
      dim(),
      { id: "d", type: "diameter", refs: [face([55, 25, 10], [-1, 0, 0], "CYLINDRE")], tol: { kind: "fit", fit: "H7" } },
      { id: "g", type: "gdt", refs: [face([50, 0, 10], [0, -1, 0])], symbol: "⏥", value: "0.05", datums: "" },
      { id: "s", type: "surface", refs: [face([50, 25, 20], [0, 0, 1])], ra: "1.6", removal: "required" },
    ];
    const res = pmiToDrawing(items.map((anno) => ({ anno, geom: pmiGeometry(anno, [b]) })), front, new Set());
    const dimA = res.annos.find((a) => a.id === "pmi-p1-v1");
    expect(dimA?.type === "dim" && dimA.kind).toBe("horizontal");
    const diaA = res.annos.find((a) => a.id === "pmi-d-v1");
    expect(diaA?.type === "dim" && diaA.kind).toBe("diameter");
    expect(res.annos.some((a) => a.type === "gdt")).toBe(true);
    // the front face is seen face-on: its surface texture goes to the table
    expect(res.skipped.map((a) => a.id)).toEqual(["s"]);
    expect(res.annos.some((a) => a.type === "note" && a.text.includes("Ra 1.6"))).toBe(true);
    // re-import skips what is already there
    const again = pmiToDrawing(items.map((anno) => ({ anno, geom: pmiGeometry(anno, [b]) })), front, new Set(res.annos.map((a) => a.id)));
    expect(again.annos.length).toBe(0);
  });

  it("imports PMI the front view cannot show into the other views instead of only the table", () => {
    // regression: the import targeted the front view only; PMI on faces perpendicular to its
    // direction (dims along it, datums / surfaces on faces seen face-on) all went to the table
    const b = block();
    const front: DView = { id: "v1", label: "正面図", kind: "base", dir: [0, 0, 1], xAxis: [1, 0, 0], scale: 1, x: 100, y: 150, hidden: true, centerMarks: true };
    const top: DView = { id: "v2", label: "", kind: "projected", dir: [0, 1, 0], xAxis: [1, 0, 0], scale: 1, x: 100, y: 80, hidden: true, centerMarks: true };
    const items: PmiAnno[] = [
      { id: "z", type: "dim", refs: [face([50, 25, 0], [0, 0, -1]), face([50, 25, 20], [0, 0, 1])] },
      { id: "a", type: "datum", letter: "A", refs: [face([50, 25, 20], [0, 0, 1])] },
      { id: "s", type: "surface", ra: "1.6", removal: "required", refs: [face([50, 25, 0], [0, 0, -1])] },
    ];
    const geo = items.map((anno) => ({ anno, geom: pmiGeometry(anno, [b]) }));
    const only = pmiToDrawing(geo, front, new Set());
    expect(only.annos.filter((a) => !a.id.startsWith("pmi-table")).length).toBe(0);
    const res = pmiToViews(geo, [front, top], new Set());
    expect(res.skipped).toEqual([]);
    expect(res.annos.map((a) => a.id).sort()).toEqual(["pmi-a-v2", "pmi-s-v2", "pmi-z-v2"]);
    const d = res.annos.find((a) => a.id === "pmi-z-v2");
    expect(d?.type === "dim" && d.kind).toBe("vertical");
    // the 3D label offset points along the top view's direction: the label must still be off the dim line
    if (d?.type === "dim") expect(Math.abs(d.pos[0] - d.refs[0].p[0])).toBeGreaterThan(5);
    // already imported in either view -> not imported again (also when a new view is added)
    const ids = new Set(res.annos.map((a) => a.id));
    expect(pmiToViews(geo, [front], ids, undefined, [front, top]).annos).toEqual([]);
  });

  it("a PMI dim placed mid-edge is not pulled onto a nearby feature with a tight resnap tolerance", () => {
    // regression: the drawing re-snapped imported dims with a 25 mm tolerance, collapsing both ends onto a hole centre
    const g = { visible: [{ t: "circle", c: [0, 0], r: 15 }, { t: "line", a: [-40, -25], b: [40, -25] }], hidden: [] } as unknown as Parameters<typeof resnap>[0];
    const r = { kind: "point" as const, p: [0, -25] as [number, number] };
    expect(resnap(g, r, 25)?.p).toEqual([0, 0]);
    expect(resnap(g, r, 0.5)).toBeNull();
  });
});
