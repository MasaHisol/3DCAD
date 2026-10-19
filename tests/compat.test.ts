// Compatibility / reliability: export round trips and file validation.
import { beforeAll, describe, expect, it } from "vitest";
import opencascade from "replicad-opencascadejs";
import { setOC } from "replicad";
import { GeometryEngine } from "../src/kernel/geometry";
import type { RFeature } from "../src/kernel/protocol";
import type { PlaneDef } from "../src/core/types";
import { validateAssembly, validatePart } from "../src/core/validate";
import { newDocument } from "../src/core/document";
import { decodeDxf, encodeDxf, parseDxf } from "../src/io/dxf";

const XY: PlaneDef = { origin: [0, 0, 0], xDir: [1, 0, 0], normal: [0, 0, 1] };
const rect = (x0: number, y0: number, x1: number, y1: number) => ({
  outer: [
    { t: "line" as const, a: [x0, y0] as [number, number], b: [x1, y0] as [number, number] },
    { t: "line" as const, a: [x1, y0] as [number, number], b: [x1, y1] as [number, number] },
    { t: "line" as const, a: [x1, y1] as [number, number], b: [x0, y1] as [number, number] },
    { t: "line" as const, a: [x0, y1] as [number, number], b: [x0, y0] as [number, number] },
  ],
  holes: [[{ t: "circle" as const, c: [30, 20] as [number, number], r: 8 }]],
});
// plate 60×40×10 with a Ø16 through hole and a 3 mm fillet on the hole edge
const model: RFeature[] = [
  { id: "a", type: "extrude", plane: XY, regions: [rect(0, 0, 60, 40)], op: "new", from: 0, to: 10, through: false, flip: false },
  { id: "f", type: "fillet", edges: [{ mid: [38, 20, 10], type: "CIRCLE" } as never], radius: 3 },
];

beforeAll(async () => {
  setOC((await (opencascade as unknown as () => Promise<unknown>)()) as never);
}, 60000);

describe("export round trips", () => {
  it("STEP: export → import keeps volume, area and size", async () => {
    const eng = new GeometryEngine();
    const r = await eng.rebuild(model);
    expect(r.errors).toEqual({});
    const mp = eng.massProps();
    const step = await eng.exportFile("step", "plate").text();
    expect(step).toMatch(/^ISO-10303-21;/);
    expect(step).toContain("MILLI");
    const eng2 = new GeometryEngine();
    const r2 = await eng2.rebuild([{ id: "i", type: "import", format: "step", data: step } as never]);
    expect(r2.errors).toEqual({});
    const mp2 = eng2.massProps();
    expect(mp2.volume / mp.volume).toBeCloseTo(1, 9);
    expect(mp2.area / mp.area).toBeCloseTo(1, 9);
    expect(mp2.bbox).toEqual(mp.bbox.map((p) => p.map((v) => expect.closeTo(v, 6))));
  }, 120000);

  it("STL: closed (watertight) mesh with the solid's volume", async () => {
    const eng = new GeometryEngine();
    await eng.rebuild(model);
    const buf = new Uint8Array(await eng.exportFile("stl", "plate").arrayBuffer());
    const dv = new DataView(buf.buffer);
    const n = dv.getUint32(80, true);
    expect(buf.length).toBe(84 + n * 50);
    let vol = 0;
    const edges = new Map<string, number>();
    const key = (o: number) => [0, 1, 2].map((k) => dv.getFloat32(o + k * 4, true).toFixed(4)).join(",");
    for (let t = 0; t < n; t++) {
      const o = 84 + t * 50 + 12;
      const P = [0, 1, 2].map((v) => [0, 1, 2].map((k) => dv.getFloat32(o + v * 12 + k * 4, true)));
      vol += (P[0][0] * (P[1][1] * P[2][2] - P[1][2] * P[2][1]) - P[0][1] * (P[1][0] * P[2][2] - P[1][2] * P[2][0]) + P[0][2] * (P[1][0] * P[2][1] - P[1][1] * P[2][0])) / 6;
      const ks = [0, 1, 2].map((v) => key(o + v * 12));
      for (let e = 0; e < 3; e++) {
        const a = ks[e], b = ks[(e + 1) % 3];
        const k = a < b ? `${a}|${b}` : `${b}|${a}`;
        edges.set(k, (edges.get(k) ?? 0) + 1);
      }
    }
    const open = [...edges.values()].filter((c) => c !== 2).length;
    expect(open).toBe(0);
    expect(vol / eng.massProps().volume).toBeCloseTo(1, 2);
  }, 120000);

  it("BREP: OpenCascade native text format", async () => {
    const eng = new GeometryEngine();
    await eng.rebuild(model);
    const txt = await eng.exportFile("brep", "plate").text();
    expect(txt).toMatch(/DBRep_DrawableShape|CASCADE Topology/);
    expect(txt.length).toBeGreaterThan(1000);
  }, 120000);

  it("DXF: Shift_JIS text survives encode → decode → parse", () => {
    const dxf = ["0", "SECTION", "2", "ENTITIES", "0", "TEXT", "8", "注記", "10", "5", "20", "6", "40", "3.5", "1", "表題欄 ブラケット φ10", "0", "LINE", "8", "外形線", "10", "0", "20", "0", "11", "100", "21", "0", "0", "ENDSEC", "0", "EOF"].join("\r\n");
    const back = decodeDxf(encodeDxf(dxf, "sjis"));
    expect(back).toBe(dxf);
    const r = parseDxf(back);
    // geometry is imported into a sketch, text is reported as skipped
    expect(r.entities.filter((e) => e.type === "line").length).toBe(1);
    expect(r.skipped.TEXT).toBe(1);
  });
});

describe("file validation and repair", () => {
  it("keeps a valid part unchanged (JSON round trip)", () => {
    const d = newDocument("t");
    d.features.push({ id: "s1", type: "sketch", name: "スケッチ1", plane: XY, planeLabel: "XY", entities: [], constraints: [], dimensions: [] } as never);
    d.endOfPart = 1;
    const { doc, warnings } = validatePart(JSON.parse(JSON.stringify(d)));
    expect(warnings).toEqual([]);
    expect(doc).toEqual(d);
  });
  it("repairs duplicate ids, bad end-of-part and duplicate parameters", () => {
    const d = newDocument("t") as unknown as Record<string, unknown>;
    d.features = [
      { id: "x", type: "sketch", name: "a", plane: XY, entities: [], constraints: [], dimensions: [] },
      { id: "x", type: "sketch", name: "b", plane: XY, entities: [], constraints: [], dimensions: [] },
    ];
    d.endOfPart = 9;
    d.params = [{ name: "d0", expr: "1", unit: "mm", kind: "model" }, { name: "d0", expr: "2", unit: "mm", kind: "model" }];
    const { doc, warnings } = validatePart(d);
    expect(new Set(doc.features.map((f) => f.id)).size).toBe(2);
    expect(doc.endOfPart).toBe(2);
    expect(doc.params.length).toBe(1);
    expect(warnings.length).toBe(3);
  });
  it("refuses unknown formats and feature types with a clear message", () => {
    expect(() => validatePart({ format: "x" })).toThrow(/パーツ ファイルではありません/);
    const d = newDocument("t") as unknown as Record<string, unknown>;
    d.features = [{ id: "a", type: "hyperFeature", name: "?" }];
    expect(() => validatePart(d)).toThrow(/hyperFeature/);
  });
  it("assembly: drops dangling components / constraints, regrounds", () => {
    const part = newDocument("p");
    const raw = {
      format: "3dcad-assembly",
      version: 1,
      name: "a",
      parts: [{ id: "p1", name: "p", kind: "part", doc: part }],
      components: [
        { id: "c1", name: "p:1", partId: "p1", matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], grounded: false },
        { id: "c2", name: "q:1", partId: "missing", matrix: [], grounded: false },
        { id: "c3", name: "p:2", partId: "p1", matrix: [1, 2], grounded: false },
      ],
      constraints: [{ id: "k", name: "m", type: "mate", a: { comp: "c1", point: [0, 0, 0], dir: [0, 0, 1] }, b: { comp: "c2", point: [0, 0, 0], dir: [0, 0, 1] }, offset: "0" }],
      params: [],
      iprops: {},
    };
    const { doc, warnings } = validateAssembly(raw);
    expect(doc.components.map((c) => c.id)).toEqual(["c1", "c3"]);
    expect(doc.components[1].matrix.length).toBe(16);
    expect(doc.constraints.length).toBe(0);
    expect(doc.components[0].grounded).toBe(true);
    expect(warnings.length).toBe(4);
  });
});
