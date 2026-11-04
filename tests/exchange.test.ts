/// <reference types="node" />
/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeAll, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import opencascade from "replicad-opencascadejs";
import * as R from "replicad";
import { setOC } from "replicad";
import { exportStepXcaf, healShape, igesToShapes, importStepAssembly, importStepWithMeta, preciseVolume, shapesToIges } from "../src/kernel/exchange";
import { readStepMeta, stepLeaves } from "../src/io/stepmeta";
import { readIges, writeIges } from "../src/io/iges";
import { GeometryEngine } from "../src/kernel/geometry";

beforeAll(async () => {
  const OC = await (opencascade as unknown as () => Promise<unknown>)();
  setOC(OC as never);
}, 60000);

const vol = (s: unknown) => preciseVolume(s as R.Shape3D);
const translate = (x: number, y: number, z: number) => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1];
const rotZ90 = (x: number) => [0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1, 0, x, 0, 0, 1];

describe("STEP names, colours and structure", { timeout: 60000 }, () => {
  it("round-trips an assembly of two parts and three instances", async () => {
    const plate = R.makeBaseBox(40, 20, 5) as unknown as R.Shape3D;
    const pin = R.makeCylinder(3, 12) as unknown as R.Shape3D;
    const blob = exportStepXcaf(
      [
        { name: "プレート", color: "#336699", shapes: [plate] },
        { name: "Pin-M6", color: "#cc3300", shapes: [pin] },
      ],
      [
        { part: 0, name: "プレート:1", matrix: translate(0, 0, 0) },
        { part: 1, name: "Pin-M6:1", matrix: translate(-10, 0, 5) },
        { part: 1, name: "Pin-M6:2", matrix: rotZ90(10) },
      ],
      "組立品",
    );
    const text = await blob.text();
    const meta = readStepMeta(text);
    expect(meta.roots.length).toBe(1);
    expect(meta.roots[0].product).toBe("組立品");
    const leaves = stepLeaves(meta);
    expect(leaves.length).toBe(3);
    const names = leaves.map((l) => l.path[l.path.length - 1]).sort();
    expect(names).toEqual(["Pin-M6:1", "Pin-M6:2", "プレート:1"]);
    const pin2 = leaves.find((l) => l.path.includes("Pin-M6:2"))!;
    expect(pin2.product).toBe("Pin-M6");
    expect(pin2.solid.color).toBe("#cc3300");
    expect(pin2.matrix[12]).toBeCloseTo(10, 6);
    expect(pin2.matrix[1]).toBeCloseTo(1, 6); // x axis -> +y
    expect(leaves.find((l) => l.product === "プレート")!.solid.color).toBe("#336699");

    // part import: names and colours land on the solids
    const imp = await importStepWithMeta(text);
    expect(imp.shapes.length).toBe(3);
    expect(imp.products).toBe(2);
    const byName = new Map(imp.meta.map((m, i) => [m.name, { m, s: imp.shapes[i] }]));
    expect(byName.get("Pin-M6:1")?.m.color).toBe("#cc3300");
    expect(byName.get("プレート:1")?.m.color).toBe("#336699");
    expect(vol(byName.get("プレート:1")!.s)).toBeCloseTo(4000, 3);

    // assembly import: one part per product, instances placed by their matrices
    const asm = await importStepAssembly(text);
    expect(asm.parts.map((p) => p.name).sort()).toEqual(["Pin-M6", "プレート"]);
    expect(asm.comps.length).toBe(3);
    const c2 = asm.comps.find((c) => c.name === "Pin-M6:2")!;
    expect(c2.matrix[12]).toBeCloseTo(10, 6);
    const pinPart = asm.parts[c2.part];
    const pinShape = (await R.importSTEP(new Blob([pinPart.step]))) as R.Shape3D;
    const bb = pinShape.boundingBox;
    // the part geometry is back in its own coordinates (centred on the origin)
    expect(Math.abs(bb.center[0])).toBeLessThan(1e-6);
    expect(readStepMeta(pinPart.step).roots[0].product).toBe("Pin-M6");
  });

  it("reads the committed sample file", () => {
    const text = readFileSync(new URL("./fixtures/assembly-colors.step", import.meta.url), "utf8");
    const leaves = stepLeaves(readStepMeta(text));
    expect(leaves.length).toBe(3);
    expect(new Set(leaves.map((l) => l.solid.color))).toEqual(new Set(["#336699", "#cc3300"]));
  });
});

describe("shape healing", { timeout: 60000 }, () => {
  it("sews a box with a gap, a reversed face and a tiny sliver into a valid solid", () => {
    const OC = R.getOC() as any;
    const sq = (pts: [number, number, number][]) => new OC.BRepBuilderAPI_MakeFace((R.makePolygon(pts as never) as unknown as { wrapped: unknown }).wrapped).Face();
    const g = 0.004; // gap left by the "exporter"
    const faces = [
      sq([[0, 0, 0], [0, 10, 0], [10, 10, 0], [10, 0, 0]]),
      sq([[0, 0, 10 + g], [10, 0, 10 + g], [10, 10, 10 + g], [0, 10, 10 + g]]),
      sq([[0, 0, 0], [10, 0, 0], [10, 0, 10], [0, 0, 10]]),
      sq([[0, 10, 0], [0, 10, 10], [10, 10, 10], [10, 10, 0]]),
      // reversed orientation on purpose
      sq([[0, 0, 0], [0, 0, 10], [0, 10, 10], [0, 10, 0]]),
      sq([[10, 0, 0], [10, 0, 10], [10, 10, 10], [10, 10, 0]]),
      // tiny sliver face (area 1e-5 mm²)
      sq([[3, 3, 0], [3.001, 3, 0], [3.001, 3.01, 0], [3, 3.01, 0]]),
    ];
    const comp = R.makeCompound(faces.map((f) => R.cast(f as never)) as never) as unknown as { wrapped: unknown };
    const { shapes, report } = healShape(comp.wrapped, 0.01);
    expect(report.tinyFaces).toBe(1);
    expect(report.freeEdgesBefore).toBeGreaterThan(0);
    expect(report.freeEdgesAfter).toBe(0);
    expect(report.solidsMade).toBe(1);
    expect(report.validAfter).toBe(true);
    expect(shapes.length).toBe(1);
    expect(vol(shapes[0])).toBeGreaterThan(999);
    expect(vol(shapes[0])).toBeLessThan(1001);
  });
});

describe("IGES", { timeout: 60000 }, () => {
  it("round-trips solids with names and colours", () => {
    const box = R.makeBaseBox(30, 20, 10) as unknown as R.Shape3D;
    const cyl = (R.makeCylinder(5, 15) as unknown as R.Shape3D).translate([50, 0, 0]);
    const sph = R.makeSphere(6).translate([0, 50, 0]) as unknown as R.Shape3D;
    const bodies = shapesToIges([
      { shape: box, name: "ブロック", color: "#ff8000" },
      { shape: cyl, name: "Shaft", color: "#2080ff" },
      { shape: sph, name: "Ball" },
    ]);
    const text = writeIges(bodies, "test.igs");
    for (const l of text.trimEnd().split("\n")) expect(l.length).toBe(80);
    const model = readIges(text);
    expect(model.bodies.map((b) => b.name)).toEqual(["ブロック", "Shaft", "Ball"]);
    expect(model.units).toBe("mm");
    const res = igesToShapes(model);
    expect(res.failedFaces).toBe(0);
    expect(res.shapes.length).toBe(3);
    expect(vol(res.shapes[0])).toBeCloseTo(6000, 1);
    expect(vol(res.shapes[1]) / (Math.PI * 25 * 15)).toBeCloseTo(1, 4);
    expect(vol(res.shapes[2]) / ((4 / 3) * Math.PI * 216)).toBeCloseTo(1, 3);
    expect(res.meta[0]).toMatchObject({ name: "ブロック", color: "#ff8000" });
    expect(res.meta[1].color).toBe("#2080ff");
    expect((res.shapes[2] as R.Shape3D).faces.map((f) => f.geomType)).toEqual(["SPHERE"]);
  });

  it("reads the committed sample file in inches", () => {
    const model = readIges(readFileSync(new URL("./fixtures/plate-inch.igs", import.meta.url), "utf8"));
    expect(model.units).toBe("inch");
    const res = igesToShapes(model);
    expect(res.shapes.length).toBe(1);
    expect(vol(res.shapes[0])).toBeCloseTo(2 * 1 * 0.5 * 25.4 ** 3, 0);
    expect(res.meta[0]).toMatchObject({ name: "Plate", color: "#808080" });
  });

  it("imports as a feature: a block with a hole keeps its name and colour", async () => {
    const eng = new GeometryEngine();
    const data = readFileSync(new URL("./fixtures/sample.igs", import.meta.url), "utf8");
    const r = await eng.rebuild([{ id: "im", type: "import", format: "iges", data }]);
    expect(r.errors).toEqual({});
    expect(r.bodies.length).toBe(1);
    expect(r.bodies[0].name).toBe("IGES-Block");
    expect(r.bodies[0].color).toBe("#3a7bd5");
    // planes and the hole come back as analytic surfaces (measurable)
    expect([...new Set(r.bodies[0].faces.map((f) => f.type))].sort()).toEqual(["CYLINDRE", "PLANE"]);
    expect(vol(eng.bodies[0])).toBeCloseTo(8000 - Math.PI * 16 * 10, 1);
    // and STEP: names / colours per body, a notice about the products
    const step = readFileSync(new URL("./fixtures/assembly-colors.step", import.meta.url), "utf8");
    const s = await eng.rebuild([{ id: "st", type: "import", format: "step", data: step }]);
    expect(s.bodies.map((b) => b.name).sort()).toEqual(["Pin-M6:1", "Pin-M6:2", "プレート:1"]);
    expect(s.bodies.find((b) => b.name === "Pin-M6:1")?.color).toBe("#cc3300");
    expect(s.notices?.st).toContain("部品 2 種類");
    // exporting the part again keeps them
    const again = await eng.exportFile("step", "x").text();
    const leaves = stepLeaves(readStepMeta(again));
    expect(leaves.map((l) => l.solid.color).sort()).toEqual(["#336699", "#cc3300", "#cc3300"]);
  });
});
