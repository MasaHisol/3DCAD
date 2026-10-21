import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { meshMass, minMax, peakRms, profileValue, solveDynamics, toCsv, type Frame } from "../src/assembly/dynamics";

/** Frames of a lever spinning about world Z through the origin, θ(t) given. */
function leverFrames(theta: (t: number) => number, T: number, n: number): Frame[] {
  const out: Frame[] = [];
  for (let i = 0; i <= n; i++) {
    const t = (T * i) / n, q = theta(t);
    out.push({ t, q, mats: new Map([["L", new THREE.Matrix4().makeRotationZ(q).toArray()]]) });
  }
  return out;
}

describe("dynamics: motor torque", () => {
  const m = 2, r = 100; // kg, mm
  const g: [number, number, number] = [0, -9.81, 0];

  it("rotating lever, point mass, constant speed: τ = m g r cos θ", () => {
    const frames = leverFrames((t) => t * Math.PI, 2, 400); // 0 → 2π, π rad/s
    const res = solveDynamics({ frames, bodies: [{ id: "L", mass: m, com: [r, 0, 0], inertia: [0, 0, 0, 0, 0, 0, 0, 0, 0] }], gravity: g, loads: [], springs: [], angular: true });
    for (let i = 5; i < frames.length - 5; i += 17) {
      const want = m * 9.81 * (r / 1000) * Math.cos(frames[i].q);
      expect(res.effort[i]).toBeCloseTo(want, 3);
      expect(res.effortEnergy[i]).toBeCloseTo(want, 2);
      expect(res.power[i]).toBeCloseTo(want * Math.PI, 2);
    }
    const pr = peakRms(res.t, res.effort);
    expect(pr.peak).toBeCloseTo(m * 9.81 * 0.1, 2);
    expect(pr.rms).toBeCloseTo((m * 9.81 * 0.1) / Math.SQRT2, 2);
  });

  it("energy balance matches inverse dynamics with acceleration, inertia, gravity and a torque load", () => {
    const frames = leverFrames((t) => profileValue("trapezoid", 0, Math.PI, 1, t, 0.3), 1, 800);
    const I = [0, 0, 0, 0, 0, 0, 0, 0, 5000]; // kg·mm² about the COG, Z axis
    const res = solveDynamics({
      frames,
      bodies: [{ id: "L", mass: m, com: [r, 0, 0], inertia: I }],
      gravity: g,
      loads: [{ kind: "torque", comp: "L", point: [0, 0, 0], vec: [0, 0, -0.5] }],
      springs: [],
      angular: true,
    });
    const Jz = 5000e-6 + m * 0.1 * 0.1;
    for (let i = 20; i < frames.length - 20; i += 37) {
      const e = res.effort[i], ee = res.effortEnergy[i];
      expect(Math.abs(e - ee)).toBeLessThan(0.02 * Math.max(1, Math.abs(e)));
      // analytic: τ = J α + m g r cos θ + 0.5
      const h = 1e-4, th = (t: number) => profileValue("trapezoid", 0, Math.PI, 1, t, 0.3);
      const t = frames[i].t, alpha = (th(t + h) - 2 * th(t) + th(t - h)) / (h * h);
      const want = Jz * alpha + m * 9.81 * 0.1 * Math.cos(frames[i].q) + 0.5;
      expect(e).toBeCloseTo(want, 1);
    }
  });

  it("spring force when stretched and its holding torque", () => {
    // spring from ground point (0,200) to the lever tip (100,0): at θ the tip is (100cosθ, 100 sinθ)
    const frames = leverFrames((t) => t, 1, 200);
    frames.forEach((f) => f.mats.set("G", new THREE.Matrix4().toArray()));
    const res = solveDynamics({
      frames,
      bodies: [],
      gravity: [0, 0, 0],
      loads: [],
      springs: [{ a: { comp: "G", point: [0, 200, 0] }, b: { comp: "L", point: [100, 0, 0] }, k: 2, c: 0, free: 150 }],
      angular: true,
    });
    const L0 = Math.hypot(100, 200);
    expect(res.springForce[0][0]).toBeCloseTo(2 * (L0 - 150), 6); // N, tension
    // virtual work: τ = F · dL/dθ, L² = 100² + 200² − 2·100·200 sinθ
    const i = 100, th = frames[i].q;
    const L = Math.sqrt(100 ** 2 + 200 ** 2 - 40000 * Math.sin(th));
    const dL = (-40000 * Math.cos(th)) / (2 * L) / 1000; // m/rad
    expect(res.effort[i]).toBeCloseTo(2000 * (L - 150) / 1000 * dL, 3);
    expect(res.effortEnergy[i]).toBeCloseTo(res.effort[i], 2);
  });

  it("linear drive lifting a mass: force = m g, damper adds c v", () => {
    const frames: Frame[] = [];
    for (let i = 0; i <= 50; i++) frames.push({ t: i * 0.02, q: i * 2, mats: new Map([["S", new THREE.Matrix4().makeTranslation(0, 0, i * 2).toArray()], ["G", new THREE.Matrix4().toArray()]]) });
    const res = solveDynamics({
      frames,
      bodies: [{ id: "S", mass: 3, com: [0, 0, 0], inertia: new Array(9).fill(0) }],
      gravity: [0, 0, -9.81],
      loads: [],
      springs: [{ a: { comp: "G", point: [0, 0, -100] }, b: { comp: "S", point: [0, 0, 0] }, k: 0, c: 0.01, free: 100 }],
      angular: false,
    });
    // v = 100 mm/s = 0.1 m/s, c = 10 N·s/m → 1 N
    expect(res.effort[25]).toBeCloseTo(3 * 9.81 + 1, 6);
    expect(res.effortEnergy[25]).toBeCloseTo(3 * 9.81 + 1, 6);
  });
});

describe("dynamics: helpers", () => {
  it("mesh mass properties of a box", () => {
    // 20 x 40 x 60 mm box at (10,20,30)..(30,60,90), steel 7.85
    const g = new THREE.BoxGeometry(20, 40, 60).toNonIndexed();
    g.translate(20, 40, 60);
    const pos = g.getAttribute("position").array as Float32Array;
    const idx = Uint32Array.from({ length: pos.length / 3 }, (_, i) => i);
    const mp = meshMass(pos, idx, 7.85);
    expect(mp.volume).toBeCloseTo(48000, 3);
    expect(mp.mass).toBeCloseTo(0.048 * 7.85, 6);
    expect(mp.com[0]).toBeCloseTo(20, 6);
    expect(mp.com[2]).toBeCloseTo(60, 6);
    expect(mp.inertia[0]).toBeCloseTo((mp.mass * (40 ** 2 + 60 ** 2)) / 12, 4);
    expect(mp.inertia[8]).toBeCloseTo((mp.mass * (20 ** 2 + 40 ** 2)) / 12, 4);
    expect(Math.abs(mp.inertia[1])).toBeLessThan(1e-6);
  });

  it("trapezoidal profile reaches the end and is symmetric", () => {
    expect(profileValue("trapezoid", 0, 10, 2, 0)).toBe(0);
    expect(profileValue("trapezoid", 0, 10, 2, 2)).toBeCloseTo(10, 9);
    expect(profileValue("trapezoid", 0, 10, 2, 1)).toBeCloseTo(5, 9);
    expect(profileValue("constant", 0, 10, 2, 0.5)).toBeCloseTo(2.5, 9);
  });

  it("min/max and CSV", () => {
    expect(minMax([3, 1, NaN, 7])).toEqual({ min: 1, minAt: 1, max: 7, maxAt: 3 });
    expect(toCsv([{ name: "a", data: [1, 2] }, { name: "b", data: [Infinity, 0.5] }])).toBe("a,b\n1,\n2,0.5");
  });
});
