import { describe, expect, it } from "vitest";
import { csvToParams, objToStl, paramsToCsv, parseDxf, sketchToDxf, zipStore } from "../src/io/formats";
import { findRegions } from "../src/sketch/profiles";
import type { SketchFeature } from "../src/core/types";

const dxf = (body: string[]) => ["0", "SECTION", "2", "ENTITIES", ...body, "0", "ENDSEC", "0", "EOF"].join("\n");

describe("DXF", () => {
  it("reads lines, circles, arcs and bulged polylines into closed profiles", () => {
    const r = parseDxf(
      dxf([
        // 40 x 20 rounded slot as LWPOLYLINE with bulges (semicircles at both ends)
        "0", "LWPOLYLINE", "8", "0", "90", "4", "70", "1",
        "10", "0", "20", "0", "42", "0",
        "10", "40", "20", "0", "42", "1",
        "10", "40", "20", "20", "42", "0",
        "10", "0", "20", "20", "42", "1",
        "0", "CIRCLE", "10", "20", "20", "10", "40", "5",
        "0", "TEXT", "1", "x",
      ]),
    );
    expect(r.skipped.TEXT).toBe(1);
    const regions = findRegions(r.entities);
    const outer = regions.find((x) => x.holes.length === 1)!;
    expect(Math.abs(outer.area - (800 + Math.PI * 100 - Math.PI * 25)) / outer.area).toBeLessThan(2e-3);
  });
  it("round-trips a sketch through DXF", () => {
    const sk = {
      id: "s", type: "sketch", name: "s", plane: { origin: [0, 0, 0], xDir: [1, 0, 0], normal: [0, 0, 1] }, planeLabel: "",
      entities: [
        { id: "a", type: "point", x: 0, y: 0 }, { id: "b", type: "point", x: 10, y: 0 }, { id: "c", type: "point", x: 5, y: 8 },
        { id: "l1", type: "line", p1: "a", p2: "b" }, { id: "l2", type: "line", p1: "b", p2: "c" }, { id: "l3", type: "line", p1: "c", p2: "a" },
      ],
      constraints: [], dimensions: [],
    } as SketchFeature;
    const back = parseDxf(sketchToDxf(sk));
    expect(findRegions(back.entities)[0].area).toBeCloseTo(40, 6);
  });
});

describe("other formats", () => {
  it("converts OBJ polygons to binary STL triangles", () => {
    const stl = objToStl("v 0 0 0\nv 1 0 0\nv 1 1 0\nv 0 1 0\nf 1 2 3 4\n");
    expect(new DataView(stl.buffer).getUint32(80, true)).toBe(2);
  });
  it("round-trips parameters through CSV", () => {
    const csv = paramsToCsv([{ name: "幅", expr: "80", unit: "mm", value: 80, comment: 'a "b", c' }, { name: "d0", expr: "幅 / 2", unit: "mm" }]);
    expect(csvToParams(csv)).toEqual([{ name: "幅", expr: "80" }, { name: "d0", expr: "幅 / 2" }]);
  });
  it("writes a valid zip container", () => {
    const z = zipStore([["a.txt", new TextEncoder().encode("hello")]]);
    const dv = new DataView(z.buffer);
    expect(dv.getUint32(0, true)).toBe(0x04034b50);
    expect(dv.getUint32(z.length - 22, true)).toBe(0x06054b50);
  });
});
