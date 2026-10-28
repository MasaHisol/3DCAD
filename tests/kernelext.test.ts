/// <reference types="node" />
/* eslint-disable @typescript-eslint/no-explicit-any */
// Extended kernel (段階 1.5 #1): IGES / XCAF STEP / ShapeFix through the full
// opencascade.js build, HLR projection and precise mass properties.
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import opencascade from "replicad-opencascadejs";
import * as R from "replicad";
import { setOC } from "replicad";
import { exportIgesNative, exportStepTree, exportStepXcaf, fromBrep, healShapeNative, importIgesNative, importStepAssembly, importStepWithMeta, preciseProps, preciseVolume, toBrep } from "../src/kernel/exchange";
import { extKernel, setExtLoader, type ExtKernel } from "../src/kernel/ext";
import { hlrProject } from "../src/kernel/hlr";
import { GeometryEngine } from "../src/kernel/geometry";
import { readStepMeta, stepLeaves } from "../src/io/stepmeta";

/** Node entry of the full build (the app loads the same module through Vite in the worker). */
export function useNodeExtKernel() {
  setExtLoader(async () => {
    const entry = "opencascade.js/dist/node.js";
    const mod = await import(/* @vite-ignore */ entry);
    return mod.default();
  });
}

let X: ExtKernel;
beforeAll(async () => {
  const OC = await (opencascade as unknown as () => Promise<unknown>)();
  setOC(OC as never);
  useNodeExtKernel();
  X = (await extKernel())!;
}, 120000);
afterAll(() => setExtLoader(null));

const T = (x: number, y: number, z: number) => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1];
const fixture = (n: string) => readFileSync(new URL(`./fixtures/${n}`, import.meta.url), "utf8");

describe("extended kernel", { timeout: 120000 }, () => {
  it("loads and exchanges shapes with the main kernel through BRep text", () => {
    expect(X).toBeTruthy();
    const box = R.makeBaseBox(10, 20, 30) as unknown as R.Shape3D;
    const back = fromBrep(X.writeBrep(X.readBrep(toBrep(box))));
    expect(preciseVolume(back)).toBeCloseTo(6000, 6);
  });

  it("reads STEP names, colours and instances with the XCAF reader", async () => {
    const imp = await importStepWithMeta(fixture("assembly-colors.step"));
    expect(imp.native).toBe(true);
    expect(imp.shapes.length).toBe(3);
    expect(imp.products).toBe(2);
    expect(imp.meta.map((m) => m.name).sort()).toEqual(["Pin-M6:1", "Pin-M6:2", "プレート:1"]);
    expect(imp.meta.find((m) => m.name === "Pin-M6:2")!.color).toBe("#cc3300");
    expect(imp.meta.find((m) => m.name === "プレート:1")!.color).toBe("#336699");
  });

  it("round-trips a STEP assembly with a sub-assembly hierarchy", async () => {
    const plate = R.makeBaseBox(40, 20, 5) as unknown as R.Shape3D;
    const pin = R.makeCylinder(3, 12) as unknown as R.Shape3D;
    const blob = exportStepTree(
      [
        { name: "プレート", color: "#336699", shapes: [plate] },
        { name: "Pin-M6", color: "#cc3300", shapes: [pin] },
      ],
      [
        { name: "プレート:1", product: "プレート", matrix: T(0, 0, 0), part: 0, children: [] },
        {
          name: "ピン組:1",
          product: "ピン組",
          matrix: T(100, 0, 0),
          children: [
            { name: "Pin-M6:1", product: "Pin-M6", matrix: T(0, 0, 5), part: 1, children: [] },
            { name: "Pin-M6:2", product: "Pin-M6", matrix: T(10, 0, 5), part: 1, children: [] },
          ],
        },
      ],
      "組立品",
    );
    const text = await blob.text();
    const asm = await importStepAssembly(text);
    expect(asm.native).toBe(true);
    expect(asm.parts.map((p) => p.name).sort()).toEqual(["Pin-M6", "プレート"]);
    expect(asm.comps.length).toBe(3);
    // tree: root -> [plate, sub-assembly -> [pin, pin]]
    expect(asm.tree!.length).toBe(1);
    const root = asm.tree![0];
    expect(root.product).toBe("組立品");
    expect(root.children.map((c) => c.name)).toEqual(["プレート:1", "ピン組:1"]);
    const sub = root.children[1];
    expect(sub.product).toBe("ピン組");
    expect(sub.part).toBeUndefined();
    expect(sub.matrix[12]).toBeCloseTo(100, 9);
    expect(sub.children.map((c) => c.name)).toEqual(["Pin-M6:1", "Pin-M6:2"]);
    expect(sub.children[1].matrix[12]).toBeCloseTo(10, 9);
    expect(asm.parts[sub.children[0].part!].name).toBe("Pin-M6");
    expect(sub.children[0].part).toBe(sub.children[1].part);
    // flattened instances carry the composed placement and the path
    const p2 = asm.comps.find((c) => c.name === "Pin-M6:2")!;
    expect(p2.path).toEqual(["組立品", "ピン組:1", "Pin-M6:2"]);
    expect(p2.matrix[12]).toBeCloseTo(110, 9);
    expect(p2.matrix[14]).toBeCloseTo(5, 9);
    expect(asm.parts[p2.part].color).toBe("#cc3300");
    // the part file is in its own coordinates
    const pinShape = (await R.importSTEP(new Blob([asm.parts[p2.part].step]))) as R.Shape3D;
    expect(Math.abs(pinShape.boundingBox.center[0])).toBeLessThan(1e-6);
    // the text reader of stage 1 sees the same structure
    const leaves = stepLeaves(readStepMeta(text));
    expect(leaves.find((l) => l.path.includes("Pin-M6:2"))!.matrix[12]).toBeCloseTo(110, 6);
  });

  it("imports and exports IGES through the kernel (names, colours, units)", async () => {
    const box = R.makeBaseBox(30, 20, 10) as unknown as R.Shape3D;
    const cyl = (R.makeCylinder(5, 15) as unknown as R.Shape3D).translate([50, 0, 0]);
    const text = (await exportIgesNative([
      { shape: box, name: "ブロック", color: "#ff8000" },
      { shape: cyl, name: "Shaft", color: "#2080ff" },
    ]))!;
    expect(text).toBeTruthy();
    for (const l of text.trimEnd().split("\n")) expect(l.replace(/\r$/, "").length).toBe(80);
    const imp = (await importIgesNative(text))!;

    expect(imp.shapes.length).toBe(2);
    const byName = new Map(imp.meta.map((m, i) => [m.name, { m, s: imp.shapes[i] }]));
    expect(preciseVolume(byName.get("ブロック")!.s)).toBeCloseTo(6000, 3);
    expect(byName.get("ブロック")!.m.color).toBe("#ff8000");
    expect(preciseVolume(byName.get("Shaft")!.s) / (Math.PI * 25 * 15)).toBeCloseTo(1, 6);
    expect(byName.get("Shaft")!.m.color).toBe("#2080ff");

    // inch file: converted to millimetres by the kernel
    const inch = (await importIgesNative(fixture("plate-inch.igs")))!;
    expect(inch.shapes.length).toBe(1);
    expect(preciseVolume(inch.shapes[0])).toBeCloseTo(2 * 1 * 0.5 * 25.4 ** 3, 0);
  });

  it("imports IGES as a feature: complete files keep the analytic path, others go through the kernel", async () => {
    const eng = new GeometryEngine();
    const r = await eng.rebuild([{ id: "im", type: "import", format: "iges", data: fixture("sample.igs") }]);
    expect(r.errors).toEqual({});
    expect(r.bodies[0].name).toBe("IGES-Block");
    expect([...new Set(r.bodies[0].faces.map((f) => f.type))].sort()).toEqual(["CYLINDRE", "PLANE"]);
    const out = await (await eng.exportFileAsync("iges", "x")).text();
    expect(out).toContain("IGES-Blo");
    // a BRep-mode file (MSBO solids, type 186) is not read by the NURBS path: the kernel reads it
    const box = R.makeBaseBox(30, 20, 10) as unknown as R.Shape3D;
    const msbo = (await exportIgesNative([{ shape: box, name: "Solid-Box", color: "#ff8000" }], { brep: true }))!;
    const eng2 = new GeometryEngine();
    const r2 = await eng2.rebuild([{ id: "b", type: "import", format: "iges", data: msbo }]);
    expect(r2.errors).toEqual({});
    expect(r2.notices?.b ?? "").toContain("カーネル");
    expect(r2.bodies.length).toBe(1);
    expect(r2.bodies[0].name).toBe("Solid-Box");
    expect(r2.bodies[0].color).toBe("#ff8000");
    expect(preciseVolume(eng2.bodies[0])).toBeCloseTo(6000, 3);
  });

  it("heals a broken box with ShapeFix_Shape", async () => {
    const OC = R.getOC() as any;
    const sq = (pts: [number, number, number][]) => new OC.BRepBuilderAPI_MakeFace((R.makePolygon(pts as never) as unknown as { wrapped: unknown }).wrapped).Face();
    const g = 0.004;
    const faces = [
      sq([[0, 0, 0], [0, 10, 0], [10, 10, 0], [10, 0, 0]]),
      sq([[0, 0, 10 + g], [10, 0, 10 + g], [10, 10, 10 + g], [0, 10, 10 + g]]),
      sq([[0, 0, 0], [10, 0, 0], [10, 0, 10], [0, 0, 10]]),
      sq([[0, 10, 0], [0, 10, 10], [10, 10, 10], [10, 10, 0]]),
      sq([[0, 0, 0], [0, 0, 10], [0, 10, 10], [0, 10, 0]]),
      sq([[10, 0, 0], [10, 0, 10], [10, 10, 10], [10, 10, 0]]),
      sq([[3, 3, 0], [3.001, 3, 0], [3.001, 3.01, 0], [3, 3.01, 0]]),
    ];
    const comp = R.makeCompound(faces.map((f) => R.cast(f as never)) as never) as unknown as { wrapped: unknown };
    const h = (await healShapeNative(comp.wrapped, 0.01))!;
    expect(h.report.native).toBe(true);
    expect(h.report.tinyFaces).toBe(1);
    expect(h.report.freeEdgesBefore).toBeGreaterThan(0);
    expect(h.report.freeEdgesAfter).toBe(0);
    expect(h.report.solidsMade).toBe(1);
    expect(h.report.validAfter).toBe(true);
    expect(preciseVolume(h.shapes[0])).toBeGreaterThan(999);
    expect(preciseVolume(h.shapes[0])).toBeLessThan(1001);
  });

  it("builds a trimmed face on a surface (MakeFace(surface, wire))", () => {
    const big = (R.makeBaseBox(100, 100, 1) as unknown as R.Shape3D).faces.find((f) => f.geomType === "PLANE" && Math.abs(f.normalAt().z - 1) < 1e-9)!;
    const tri = R.makePolygon([[0, 0, 1], [10, 0, 1], [0, 20, 1]] as never);
    const face = fromBrep(X.trimmedFace(toBrep(big), toBrep(tri)));
    expect(R.measureArea(face as never)).toBeCloseTo(100, 9);
  });
});

describe("HLR projection", { timeout: 60000 }, () => {
  it("an isometric box shows 9 visible and 3 hidden edges", () => {
    const box = R.makeBaseBox(10, 20, 30) as unknown as R.Shape3D;
    const r = hlrProject([box], { dir: [1, 1, 1], xAxis: [1, -1, 0] });
    expect(r.visible.sharp.length + r.visible.outline.length).toBe(9);
    expect(r.hidden.sharp.length + r.hidden.outline.length).toBe(3);
    expect(r.visible.smooth.length).toBe(0);
  });

  it("a top view of a box with a hole: rectangle and circle visible, hole hidden lines none", () => {
    const part = (R.makeBaseBox(40, 20, 10) as unknown as R.Shape3D).cut(R.makeCylinder(4, 10) as never) as R.Shape3D;
    const r = hlrProject([part], { dir: [0, 0, 1], xAxis: [1, 0, 0] });
    // outer rectangle (4 lines) + top circle of the hole; the bottom circle coincides and is hidden
    const vis = [...r.visible.sharp, ...r.visible.outline];
    expect(vis.length).toBeGreaterThanOrEqual(5);
    expect(r.bounds[0]).toBeCloseTo(-20, 6);
    expect(r.bounds[2]).toBeCloseTo(20, 6);
    expect(r.bounds[1]).toBeCloseTo(-10, 6);
    expect(r.bounds[3]).toBeCloseTo(10, 6);
    // a front view sees the hole as two hidden lines (cylinder silhouettes)
    const f = hlrProject([part], { dir: [0, -1, 0], xAxis: [1, 0, 0] });
    const hid = [...f.hidden.sharp, ...f.hidden.outline, ...f.hidden.smooth];
    const vertical = hid.filter((pl) => Math.abs(pl[0][0] - pl[pl.length - 1][0]) < 1e-6 && Math.abs(Math.abs(pl[0][0]) - 4) < 1e-6);
    expect(vertical.length).toBe(2);
  });
});

describe("mass properties on rational B-spline faces", { timeout: 60000 }, () => {
  const nurbs = (make: (oc: any) => any) => fromBrep(X.writeBrep(new X.oc.BRepBuilderAPI_NurbsConvert_2(make(X.oc), true).Shape()));

  it("NURBS sphere and torus within 1e-5 relative", () => {
    const cases = [
      { s: nurbs((o) => new o.BRepPrimAPI_MakeSphere_1(10).Shape()), v: (4 / 3) * Math.PI * 1000, a: 4 * Math.PI * 100 },
      { s: nurbs((o) => new o.BRepPrimAPI_MakeTorus_1(20, 5).Shape()), v: 2 * Math.PI ** 2 * 20 * 25, a: 4 * Math.PI ** 2 * 100 },
    ];
    for (const c of cases) {
      expect(c.s.faces.every((f) => f.geomType === "BSPLINE_SURFACE")).toBe(true);
      const p = preciseProps(c.s);
      expect(Math.abs(p.volume / c.v - 1)).toBeLessThan(1e-5);
      expect(Math.abs(p.area / c.a - 1)).toBeLessThan(1e-5);
      for (const k of [0, 1, 2]) expect(Math.abs(p.centerOfMass[k])).toBeLessThan(1e-6);
      // the default rule of stage 1 was measurably off
      expect(Math.abs(R.measureShapeVolumeProperties(c.s).volume / c.v - 1)).toBeGreaterThan(1e-4);
    }
  });

  it("the engine reports precise mass properties", async () => {
    const eng = new GeometryEngine();
    const sphere = nurbs((o) => new o.BRepPrimAPI_MakeSphere_1(10).Shape());
    const step = await exportStepXcaf([{ name: "ball", shapes: [sphere] }], null, "ball").text();
    await eng.rebuild([{ id: "s", type: "import", format: "step", data: step }]);
    const m = eng.massProps();
    expect(Math.abs(m.volume / ((4 / 3) * Math.PI * 1000) - 1)).toBeLessThan(1e-5);
    expect(Math.abs(m.area / (4 * Math.PI * 100) - 1)).toBeLessThan(1e-5);
  });
});
