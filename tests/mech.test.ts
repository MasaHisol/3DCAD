import { describe, expect, it } from "vitest";
import { beam, beamDeflectionFormula, boltCalc, BOLTS, deviations, euler, fit, ktPlateHole, section, shaftDiameter, shaftShear, stressArea, torqueFromPower, type BeamCase } from "../src/textbook/mech";

describe("section properties", () => {
  it("matches the textbook formulas", () => {
    const r = section("rect", { b: 20, h: 40 });
    expect(r.I).toBeCloseTo((20 * 40 ** 3) / 12, 6);
    expect(r.Z).toBeCloseTo((20 * 40 ** 2) / 6, 6);
    const c = section("round", { d: 20 });
    expect(c.Z).toBeCloseTo((Math.PI * 20 ** 3) / 32, 6);
    expect(c.Zp).toBeCloseTo((Math.PI * 20 ** 3) / 16, 6);
    const p = section("pipe", { D: 20, t: 10 });
    expect(p.I).toBeCloseTo(c.I, 6);
    // a box with the walls of an H-beam's flanges is stiffer than the H of the same outline only by its second web
    const box = section("box", { b: 50, h: 100, t: 5 });
    expect(box.A).toBeCloseTo(50 * 100 - 40 * 90, 6);
    const hb = section("hbeam", { h: 100, b: 100, tw: 6, tf: 8 });
    expect(hb.A).toBeCloseTo(2 * 100 * 8 + 84 * 6, 6);
    expect(hb.I).toBeCloseTo((100 * 100 ** 3 - 94 * 84 ** 3) / 12, 3);
    expect(() => section("pipe", { D: 10, t: 6 })).toThrow();
  });
});

describe("beams", () => {
  const E = 206000;
  const I = section("rect", { b: 20, h: 40 }).I;
  const cases: [BeamCase, number][] = [
    ["cantilever-point", 1000],
    ["cantilever-udl", 2],
    ["simple-point", 1000],
    ["simple-udl", 2],
  ];
  for (const [kind, P] of cases)
    it(`${kind}: deflection and moment match closed forms`, () => {
      const L = 1000;
      const r = beam({ kind, L, P, E, I });
      expect(r.ymax / beamDeflectionFormula(kind, L, P, E, I)).toBeCloseTo(1, 3);
      const Mexp = kind === "cantilever-point" ? -P * L : kind === "cantilever-udl" ? (-P * L * L) / 2 : kind === "simple-point" ? (P * L) / 4 : (P * L * L) / 8;
      expect(r.Mmax / Mexp).toBeCloseTo(1, 6);
      // equilibrium
      const total = kind.endsWith("udl") ? P * L : P;
      expect(r.R1 + r.R2).toBeCloseTo(total, 6);
    });

  it("off-centre point load on a simple beam", () => {
    const r = beam({ kind: "simple-point", L: 1000, P: 900, a: 300, E, I });
    expect(r.R1).toBeCloseTo(630, 6);
    expect(r.R2).toBeCloseTo(270, 6);
    expect(r.Mmax).toBeCloseTo(630 * 300, 3);
    expect(r.xMmax).toBeCloseTo(300, 6);
    // max deflection of an off-centre load: P b (L² − b²)^1.5 / (9√3 L E I), b = the shorter distance
    const b = 300;
    const exact = (900 * b * (1000 ** 2 - b ** 2) ** 1.5) / (9 * Math.sqrt(3) * 1000 * E * I);
    expect(r.ymax / exact).toBeCloseTo(1, 3);
  });
});

describe("buckling, torsion, concentration", () => {
  it("Euler load", () => {
    expect(euler(206000, 1000, 1000, 1)).toBeCloseTo((Math.PI ** 2 * 206000 * 1000) / 1e6, 6);
    expect(euler(206000, 1000, 1000, 0.5) / euler(206000, 1000, 1000, 1)).toBeCloseTo(4, 9);
  });
  it("shaft sizing round-trips", () => {
    const T = torqueFromPower(1.5, 1450); // 1.5 kW motor
    expect(T / 1000).toBeCloseTo(9.88, 2);
    const d = shaftDiameter(T, 30);
    expect(shaftShear(T, d)).toBeCloseTo(30, 6);
  });
  it("Heywood Kt tends to 3 for a small hole", () => {
    expect(ktPlateHole(0.001, 100)).toBeCloseTo(3, 3);
    expect(ktPlateHole(10, 50)).toBeCloseTo(2.512, 3);
  });
});

describe("bolts and fits", () => {
  it("stress areas follow the thread formula", () => {
    for (const b of BOLTS) expect(stressArea(b.d, b.p) / b.As).toBeCloseTo(1, 2);
    const m10 = boltCalc("M10", "8.8");
    expect(m10.proofLoad).toBeCloseTo(58 * 600, 6);
    expect(m10.torque).toBeCloseTo((0.2 * 0.7 * 58 * 600 * 10) / 1000, 6);
  });
  it("H7/g6 and H7/p6 at Ø20 match ISO 286 tables", () => {
    expect(deviations(20, "H7")).toEqual({ upper: 21, lower: 0 });
    expect(deviations(20, "g6")).toEqual({ upper: -7, lower: -20 });
    const c = fit(20, "H7", "g6");
    expect([c.minClear, c.maxClear, c.kind]).toEqual([7, 41, "すきまばめ"]);
    const p = fit(20, "H7", "p6");
    expect(p.kind).toBe("しまりばめ");
    expect(p.minClear).toBe(-35);
    expect(fit(20, "H7", "k6").kind).toBe("中間ばめ");
    expect(() => deviations(200, "H7")).toThrow();
  });
});
