import { describe, expect, it } from "vitest";
import { DxfWriter, decodeDxf, encodeDxf, hatchLines, parseDxf, sampleNurbs } from "../src/io/dxf";

const dxf = (entities: string, blocks = "") =>
  ["0", "SECTION", "2", "HEADER", "9", "$DWGCODEPAGE", "3", "ANSI_932", "0", "ENDSEC", ...(blocks ? ["0", "SECTION", "2", "BLOCKS", blocks, "0", "ENDSEC"] : []), "0", "SECTION", "2", "ENTITIES", entities, "0", "ENDSEC", "0", "EOF"].join("\n");

describe("DXF", () => {
  it("writes Japanese text as Shift_JIS and reads it back", () => {
    const w = new DxfWriter();
    w.text(0, 0, 3.5, "部品名 ブラケット");
    const bytes = encodeDxf(w.toString());
    // 部 = 0x95 0x94 in Shift_JIS
    const i = bytes.findIndex((b, k) => b === 0x95 && bytes[k + 1] === 0x94);
    expect(i).toBeGreaterThan(0);
    expect(decodeDxf(bytes)).toContain("部品名 ブラケット");
    expect(w.toString()).toContain("ANSI_932");
    expect(w.toString()).toContain("HIDDEN");
  });

  it("reads ellipses, splines and block inserts", () => {
    const ell = ["0", "ELLIPSE", "8", "0", "10", "0", "20", "0", "11", "20", "21", "0", "40", "0.5"].join("\n");
    // quadratic B-spline (clamped) through (0,0) .. (10,0) with control (5,10)
    const spl = ["0", "SPLINE", "71", "2", "72", "6", "73", "3", "40", "0", "40", "0", "40", "0", "40", "1", "40", "1", "40", "1", "10", "0", "20", "0", "10", "5", "20", "10", "10", "10", "20", "0"].join("\n");
    const blk = ["0", "BLOCK", "2", "SQ", "10", "0", "20", "0", "0", "LINE", "10", "0", "20", "0", "11", "1", "21", "0", "0", "ENDBLK"].join("\n");
    const ins = ["0", "INSERT", "2", "SQ", "10", "100", "20", "50", "41", "10", "50", "90"].join("\n");
    const r = parseDxf(dxf([ell, spl, ins].join("\n"), blk));
    const pts = r.entities.filter((e) => e.type === "point") as { x: number; y: number }[];
    // ellipse extremes
    expect(pts.some((p) => Math.abs(p.x - 20) < 1e-6 && Math.abs(p.y) < 1e-6)).toBe(true);
    expect(pts.some((p) => Math.abs(p.y - 10) < 1e-6 && Math.abs(p.x) < 1e-6)).toBe(true);
    // spline apex at t=0.5: (5, 5)
    expect(pts.some((p) => Math.abs(p.x - 5) < 1e-6 && Math.abs(p.y - 5) < 1e-6)).toBe(true);
    // block line (0,0)-(1,0) scaled 10, rotated 90°, inserted at (100,50) -> (100,50)-(100,60)
    expect(pts.some((p) => Math.abs(p.x - 100) < 1e-6 && Math.abs(p.y - 60) < 1e-6)).toBe(true);
    expect(r.skipped).toEqual({});
  });

  it("NURBS sampling reproduces a circle quadrant", () => {
    const w = Math.SQRT1_2;
    const p = sampleNurbs(2, [0, 0, 0, 1, 1, 1], [[1, 0, 1], [1, 1, w], [0, 1, 1]], 10);
    for (const [x, y] of p) expect(Math.hypot(x, y)).toBeCloseTo(1, 9);
  });

  it("hatches a square with 45° lines of the right total length", () => {
    const segs = hatchLines([[[0, 0], [10, 0], [10, 10], [0, 10]]], 1);
    const total = segs.reduce((s, [a, b, c, d]) => s + Math.hypot(c - a, d - b), 0);
    // area / spacing
    expect(total).toBeCloseTo(100, 0);
  });
});
