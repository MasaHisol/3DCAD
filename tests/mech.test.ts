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

describe("machine elements", () => {
  it("bearing life follows (C/P)^3", async () => {
    const { bearingLife } = await import("../src/textbook/mech");
    const r = bearingLife(12.8, 1.28, 1000);
    expect(r.L10).toBeCloseTo(1e9, 0);
    expect(r.hours).toBeCloseTo(1e9 / 60000, 3);
    expect(bearingLife(10, 5, 100, true).L10).toBeCloseTo(2 ** (10 / 3) * 1e6, 0);
  });
  it("gear pair geometry", async () => {
    const { gearPair } = await import("../src/textbook/mech");
    const g = gearPair(2, 20, 60, 1500, 10000, 1);
    expect([g.d1, g.d2, g.a, g.da1, g.ratio, g.rpm2, g.T2, g.Ft]).toEqual([40, 120, 80, 44, 3, 500, 30000, 500]);
    expect(gearPair(1, 12, 30, 100, 1).undercut).toBe(true);
  });
  it("coil spring rate and Wahl factor", async () => {
    const { coilSpring } = await import("../src/textbook/mech");
    const s = coilSpring(2, 16, 8, 78500, 10);
    expect(s.k).toBeCloseTo((78500 * 16) / (8 * 4096 * 8), 9);
    expect(s.c).toBe(8);
    expect(s.Kw).toBeCloseTo(1.184, 3);
  });
  it("key selection and stresses", async () => {
    const { keyCheck } = await import("../src/textbook/mech");
    const k = keyCheck(20, 50000, 25);
    expect([k.b, k.h]).toEqual([6, 6]);
    expect(k.F).toBe(5000);
    expect(k.shear).toBeCloseTo(5000 / 150, 9);
    expect(k.pressure).toBeCloseTo(5000 / (2.5 * 25), 9);
  });
  it("belt length and wrap angle", async () => {
    const { beltDrive } = await import("../src/textbook/mech");
    const b = beltDrive(100, 100, 300, 1000);
    expect(b.L).toBeCloseTo(600 + Math.PI * 100, 9);
    expect(b.wrap).toBeCloseTo(180, 9);
    expect(beltDrive(100, 200, 300, 1000).wrap).toBeCloseTo(180 - 2 * (Math.asin(100 / 600) * 180) / Math.PI, 9);
  });
  it("four-bar linkage closes with the right link lengths", async () => {
    const { fourBar, grashof, grubler } = await import("../src/textbook/mech");
    for (const th of [0, 45, 90, 180, 270]) {
      const p = fourBar(20, 70, 50, 60, th)!;
      expect(Math.hypot(p.B[0] - p.A[0], p.B[1] - p.A[1])).toBeCloseTo(70, 9);
      expect(Math.hypot(p.B[0] - 60, p.B[1])).toBeCloseTo(50, 9);
    }
    expect(grashof(20, 70, 50, 60).kind).toContain("てこクランク");
    expect(grashof(60, 30, 40, 80).ok).toBe(false);
    expect(grubler(4, 4)).toBe(1);
  });
  it("vibration: natural frequency and resonance", async () => {
    const { naturalFrequency, response, cantileverFrequency, section } = await import("../src/textbook/mech");
    // k = (2π·10 Hz)² × 1 kg = 3948 N/m → 10 Hz
    expect(naturalFrequency((2 * Math.PI * 10) ** 2 / 1000, 1)).toBeCloseTo(10, 9);
    expect(response(0, 0.05).magnification).toBeCloseTo(1, 9);
    expect(response(1, 0.05).magnification).toBeCloseTo(10, 6);
    expect(response(Math.SQRT2, 0.1).transmissibility).toBeCloseTo(1, 9);
    // steel cantilever 20 × 40 (bending about the strong axis), 500 mm: hand calculation ≈ 132.4 Hz
    const s = section("rect", { b: 20, h: 40 });
    expect(cantileverFrequency(206000, s.I, s.A, 7.85, 500)).toBeCloseTo(132.4, 0);
  });
  it("conduction and cost", async () => {
    const { conduction, unitCost } = await import("../src/textbook/mech");
    expect(conduction(50, 1e6, 10, 10)).toBeCloseTo(50000, 6);
    const c = unitCost({ material: 300, setupMin: 60, cycleMin: 30, rate: 6000, tooling: 0, lot: 10, quantity: 10 });
    expect(c.total).toBeCloseTo(300 + 600 + 3000, 9);
  });
});
