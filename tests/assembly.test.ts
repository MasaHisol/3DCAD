import * as THREE from "three";
import { describe, expect, it } from "vitest";
import { solveAssembly, type SolverConstraint } from "../src/assembly/solver";

const pose = (rx: number, ry: number, rz: number, t: [number, number, number]) =>
  new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rx, ry, rz)).setPosition(...t);

describe("assembly solver", () => {
  it("fully positions a block with three mates/flushes", () => {
    const m = new Map([
      ["A", new THREE.Matrix4()],
      ["B", pose(0.4, -0.7, 1.1, [33, -12, 7])],
    ]);
    const cons: SolverConstraint[] = [
      // B bottom on A top
      { type: "mate", a: { comp: "A", geom: "plane", point: [5, 5, 10], dir: [0, 0, 1] }, b: { comp: "B", geom: "plane", point: [5, 5, 0], dir: [0, 0, -1] }, value: 0 },
      // side faces flush
      { type: "flush", a: { comp: "A", geom: "plane", point: [10, 5, 5], dir: [1, 0, 0] }, b: { comp: "B", geom: "plane", point: [10, 5, 5], dir: [1, 0, 0] }, value: 0 },
      { type: "flush", a: { comp: "A", geom: "plane", point: [5, 10, 5], dir: [0, 1, 0] }, b: { comp: "B", geom: "plane", point: [5, 10, 5], dir: [0, 1, 0] }, value: 0 },
    ];
    const r = solveAssembly(m, new Set(["A"]), cons);
    expect(r.ok).toBe(true);
    const e = m.get("B")!.elements;
    // pure translation (0,0,10)
    expect(e[0]).toBeCloseTo(1, 6);
    expect(e[5]).toBeCloseTo(1, 6);
    expect(e[10]).toBeCloseTo(1, 6);
    expect(e[12]).toBeCloseTo(0, 5);
    expect(e[13]).toBeCloseTo(0, 5);
    expect(e[14]).toBeCloseTo(10, 5);
  });

  it("inserts a pin into a hole with an offset", () => {
    const m = new Map([
      ["Plate", new THREE.Matrix4()],
      ["Pin", pose(1.2, 0.3, -0.5, [50, 40, -20])],
    ]);
    // hole edge on plate top: centre (20,20,10), normal +z; pin head underside circle at (0,0,30) facing -z
    const cons: SolverConstraint[] = [
      { type: "insert", a: { comp: "Plate", geom: "axis", point: [20, 20, 10], dir: [0, 0, 1] }, b: { comp: "Pin", geom: "axis", point: [0, 0, 30], dir: [0, 0, -1] }, value: 2 },
    ];
    const r = solveAssembly(m, new Set(["Plate"]), cons);
    expect(r.ok).toBe(true);
    const p = new THREE.Vector3(0, 0, 30).applyMatrix4(m.get("Pin")!);
    expect(p.x).toBeCloseTo(20, 5);
    expect(p.y).toBeCloseTo(20, 5);
    expect(p.z).toBeCloseTo(12, 5);
    const d = new THREE.Vector3(0, 0, -1).transformDirection(m.get("Pin")!);
    expect(d.z).toBeCloseTo(-1, 6);
  });

  it("chains through a free component and honours angle constraints", () => {
    const m = new Map([
      ["G", new THREE.Matrix4()],
      ["M", pose(0.2, 0.1, 0.3, [5, 5, 5])],
      ["N", pose(-0.4, 0.8, 0.1, [-9, 3, 2])],
    ]);
    const cons: SolverConstraint[] = [
      { type: "axis", a: { comp: "G", geom: "axis", point: [0, 0, 0], dir: [0, 0, 1] }, b: { comp: "M", geom: "axis", point: [0, 0, 0], dir: [0, 0, 1] }, value: 0 },
      { type: "mate", a: { comp: "G", geom: "plane", point: [0, 0, 0], dir: [0, 0, 1] }, b: { comp: "M", geom: "plane", point: [0, 0, 0], dir: [0, 0, -1] }, value: 0 },
      { type: "angle", a: { comp: "G", geom: "plane", point: [0, 0, 0], dir: [1, 0, 0] }, b: { comp: "M", geom: "plane", point: [0, 0, 0], dir: [1, 0, 0] }, value: 30 },
      { type: "flush", a: { comp: "M", geom: "plane", point: [0, 0, 5], dir: [0, 0, 1] }, b: { comp: "N", geom: "plane", point: [0, 0, 0], dir: [0, 0, 1] }, value: 0 },
    ];
    const r = solveAssembly(m, new Set(["G"]), cons);
    expect(r.ok).toBe(true);
    const x = new THREE.Vector3(1, 0, 0).transformDirection(m.get("M")!);
    expect(Math.acos(x.x) * 180 / Math.PI).toBeCloseTo(30, 3);
  });
});

describe("assembly motion", () => {
  it("counts remaining degrees of freedom", async () => {
    const { analyzeDof } = await import("../src/assembly/motion");
    const { sampleAssembly } = await import("../src/samples");
    const doc = sampleAssembly();
    const cons = doc.constraints.map((c) => ({ type: c.type, a: c.a, b: c.b, value: Number(c.offset), flip: c.flip }));
    const rep = analyzeDof(doc.components, cons);
    expect(rep.perComp.get("c1")!.dof).toBe(0);
    // insert: only the spin about the pin axis remains
    expect(rep.perComp.get("c2")).toEqual({ dof: 1, trans: 0, rot: 1 });
    expect(rep.perComp.get("c3")!.dof).toBe(6);
    // a mate alone leaves 2 translations + 1 rotation
    const mate = { type: "mate" as const, a: { comp: "c1", geom: "plane" as const, point: [0, 10, 0] as [number, number, number], dir: [0, 1, 0] as [number, number, number] }, b: { comp: "c3", geom: "plane" as const, point: [0, 0, 0] as [number, number, number], dir: [0, -1, 0] as [number, number, number] }, value: 0 };
    const comps = doc.components.map((c) => (c.id === "c3" ? { ...c, matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 50, 10, 0, 1] } : c));
    expect(analyzeDof(comps, [...cons, mate]).perComp.get("c3")).toEqual({ dof: 3, trans: 2, rot: 1 });
  });
});
