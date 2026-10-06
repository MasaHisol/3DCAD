import { describe, expect, it } from "vitest";
import { evaluate, references } from "../src/core/expr";
import { evaluateParams } from "../src/core/params";
import type { Parameter, SkEntity, SkConstraint, SkDimension } from "../src/core/types";
import { solve } from "../src/sketch/solver";
import { findRegions, defaultProfiles } from "../src/sketch/profiles";

describe("expressions", () => {
  it("evaluates arithmetic, units and functions", () => {
    expect(evaluate("2 + 3 * 4")).toBe(14);
    expect(evaluate("1 in")).toBeCloseTo(25.4);
    expect(evaluate("sqrt(3^2 + 4^2)")).toBe(5);
    expect(evaluate("cos(60 deg)")).toBeCloseTo(0.5);
    expect(evaluate("2 PI")).toBeCloseTo(Math.PI * 2);
    expect(evaluate("-(2)^2")).toBe(-4);
    expect(evaluate("W/2", (n) => (n === "W" ? 10 : undefined))).toBe(5);
    expect(() => evaluate("foo + 1")).toThrow();
    expect(references("d0 * 2 + sin(d1) + 5 mm")).toEqual(["d0", "d1"]);
  });
  it("evaluates parameter tables in dependency order and detects cycles", () => {
    const ps: Parameter[] = [
      { name: "d1", expr: "d0 * 2", unit: "mm", kind: "model" },
      { name: "d0", expr: "Width + 1", unit: "mm", kind: "model" },
      { name: "Width", expr: "10", unit: "mm", kind: "user" },
      { name: "a", expr: "b", unit: "mm", kind: "user" },
      { name: "b", expr: "a", unit: "mm", kind: "user" },
    ];
    const v = evaluateParams(ps);
    expect(v.get("d1")).toBe(22);
    expect(ps[3].error).toBeTruthy();
  });
});

function rectSketch(): { e: SkEntity[]; c: SkConstraint[] } {
  const e: SkEntity[] = [
    { id: "o", type: "point", x: 0, y: 0, fixed: true },
    { id: "p1", type: "point", x: 0.3, y: -0.2 },
    { id: "p2", type: "point", x: 9, y: 0.5 },
    { id: "p3", type: "point", x: 10, y: 6 },
    { id: "p4", type: "point", x: 1, y: 5 },
    { id: "l1", type: "line", p1: "p1", p2: "p2" },
    { id: "l2", type: "line", p1: "p2", p2: "p3" },
    { id: "l3", type: "line", p1: "p3", p2: "p4" },
    { id: "l4", type: "line", p1: "p4", p2: "p1" },
  ];
  const c: SkConstraint[] = [
    { id: "c1", type: "horizontal", refs: ["l1"] },
    { id: "c2", type: "horizontal", refs: ["l3"] },
    { id: "c3", type: "vertical", refs: ["l2"] },
    { id: "c4", type: "vertical", refs: ["l4"] },
    { id: "c5", type: "coincident", refs: ["p1", "o"] },
  ];
  return { e, c };
}

describe("sketch solver", () => {
  it("solves a dimensioned rectangle to full constraint", () => {
    const { e, c } = rectSketch();
    const dims: SkDimension[] = [
      { id: "D1", type: "length", refs: ["l1"], param: "d0", pos: [0, 0] },
      { id: "D2", type: "length", refs: ["l2"], param: "d1", pos: [0, 0] },
    ];
    const res = solve({ entities: e, constraints: c, dimensions: dims, dimValues: new Map([["D1", 40], ["D2", 25]]) });
    expect(res.ok).toBe(true);
    expect(res.dof).toBe(0);
    const p3 = e.find((x) => x.id === "p3") as any;
    expect(p3.x).toBeCloseTo(40, 6);
    expect(p3.y).toBeCloseTo(25, 6);
  });
  it("reports remaining degrees of freedom", () => {
    const { e, c } = rectSketch();
    const res = solve({ entities: e, constraints: c, dimensions: [], dimValues: new Map() });
    expect(res.ok).toBe(true);
    expect(res.dof).toBe(2);
  });
  it("handles circle diameter and tangency", () => {
    const e: SkEntity[] = [
      { id: "c", type: "point", x: 0, y: 0, fixed: true },
      { id: "C", type: "circle", c: "c", r: 3 },
      { id: "a", type: "point", x: -10, y: 6 },
      { id: "b", type: "point", x: 10, y: 6.5 },
      { id: "L", type: "line", p1: "a", p2: "b" },
    ];
    const c: SkConstraint[] = [
      { id: "1", type: "horizontal", refs: ["L"] },
      { id: "2", type: "tangent", refs: ["L", "C"] },
    ];
    const d: SkDimension[] = [{ id: "D", type: "diameter", refs: ["C"], param: "x", pos: [0, 0] }];
    const res = solve({ entities: e, constraints: c, dimensions: d, dimValues: new Map([["D", 20]]) });
    expect(res.ok).toBe(true);
    expect((e[2] as any).y).toBeCloseTo(10, 5);
  });
});

describe("profile regions", () => {
  it("finds a washer region and an island disk", () => {
    const e: SkEntity[] = [
      { id: "p1", type: "point", x: 0, y: 0 },
      { id: "p2", type: "point", x: 40, y: 0 },
      { id: "p3", type: "point", x: 40, y: 20 },
      { id: "p4", type: "point", x: 0, y: 20 },
      { id: "l1", type: "line", p1: "p1", p2: "p2" },
      { id: "l2", type: "line", p1: "p2", p2: "p3" },
      { id: "l3", type: "line", p1: "p3", p2: "p4" },
      { id: "l4", type: "line", p1: "p4", p2: "p1" },
      { id: "cc", type: "point", x: 20, y: 10 },
      { id: "C", type: "circle", c: "cc", r: 5 },
    ];
    const r = findRegions(e);
    expect(r.length).toBe(2);
    const washer = r.find((x) => x.holes.length === 1)!;
    expect(washer.area).toBeCloseTo(800 - Math.PI * 25, 0);
    expect(defaultProfiles(r)).toEqual([r.indexOf(washer)]);
  });
  it("splits overlapping shapes into separate regions", () => {
    const e: SkEntity[] = [
      { id: "p1", type: "point", x: 0, y: 0 },
      { id: "p2", type: "point", x: 20, y: 0 },
      { id: "p3", type: "point", x: 20, y: 20 },
      { id: "p4", type: "point", x: 0, y: 20 },
      { id: "l1", type: "line", p1: "p1", p2: "p2" },
      { id: "l2", type: "line", p1: "p2", p2: "p3" },
      { id: "l3", type: "line", p1: "p3", p2: "p4" },
      { id: "l4", type: "line", p1: "p4", p2: "p1" },
      { id: "cc", type: "point", x: 20, y: 20 },
      { id: "C", type: "circle", c: "cc", r: 10 },
    ];
    const r = findRegions(e);
    expect(r.length).toBe(3);
    const total = r.reduce((s, x) => s + x.area, 0);
    expect(total).toBeCloseTo(400 + Math.PI * 100 * 0.75, 0);
  });
  it("handles a slot made of lines and arcs", () => {
    const e: SkEntity[] = [
      { id: "a", type: "point", x: 0, y: 0 },
      { id: "b", type: "point", x: 20, y: 0 },
      { id: "c", type: "point", x: 20, y: 10 },
      { id: "d", type: "point", x: 0, y: 10 },
      { id: "c1", type: "point", x: 20, y: 5 },
      { id: "c2", type: "point", x: 0, y: 5 },
      { id: "L1", type: "line", p1: "a", p2: "b" },
      { id: "A1", type: "arc", c: "c1", p1: "b", p2: "c" },
      { id: "L2", type: "line", p1: "c", p2: "d" },
      { id: "A2", type: "arc", c: "c2", p1: "d", p2: "a" },
    ];
    const r = findRegions(e);
    expect(r.length).toBe(1);
    expect(r[0].area).toBeCloseTo(200 + Math.PI * 25, 0);
  });
});
