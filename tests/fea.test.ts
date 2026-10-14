import { describe, expect, it } from "vitest";
import { FEA_MATERIALS, principal, sampleDisp, sampleVm, solveFea, vonMises, type FeaMesh } from "../src/analysis/fea";

/** Axis-aligned box as a triangle soup, with the triangle ids of each face. */
function box(lx: number, ly: number, lz: number): { mesh: FeaMesh; faces: Record<string, number[]> } {
  const v = [
    [0, 0, 0], [lx, 0, 0], [lx, ly, 0], [0, ly, 0],
    [0, 0, lz], [lx, 0, lz], [lx, ly, lz], [0, ly, lz],
  ];
  const quads: Record<string, number[]> = { xmin: [0, 3, 7, 4], xmax: [1, 5, 6, 2], ymin: [0, 4, 5, 1], ymax: [3, 2, 6, 7], zmin: [0, 1, 2, 3], zmax: [4, 7, 6, 5] };
  const idx: number[] = [];
  const faces: Record<string, number[]> = {};
  let t = 0;
  for (const [k, q] of Object.entries(quads)) {
    // outward winding (counter-clockwise seen from outside)
    idx.push(q[0], q[2], q[1], q[0], q[3], q[2]);
    faces[k] = [t, t + 1];
    t += 2;
  }
  return { mesh: { positions: v.flat(), indices: idx }, faces };
}

/** Round bar along +x: diameter d, length L, n segments. Returns mesh + end-cap triangle ids. */
function bar(d: number, L: number, n = 64) {
  const pos: number[] = [], idx: number[] = [];
  for (const x of [0, L]) for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; pos.push(x, (d / 2) * Math.cos(a), (d / 2) * Math.sin(a)); }
  pos.push(0, 0, 0, L, 0, 0);
  const c0 = 2 * n, c1 = 2 * n + 1;
  const cap0: number[] = [], cap1: number[] = [];
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    idx.push(i, j, n + j, i, n + j, n + i);
  }
  for (let i = 0; i < n; i++) { const j = (i + 1) % n; cap0.push(idx.length / 3); idx.push(c0, j, i); }
  for (let i = 0; i < n; i++) { const j = (i + 1) % n; cap1.push(idx.length / 3); idx.push(c1, n + i, n + j); }
  return { mesh: { positions: pos, indices: idx }, cap0, cap1 };
}

/** Plate W×L×t with a central round hole of diameter dh (x along L). */
function plateWithHole(L: number, W: number, t: number, dh: number, n = 96) {
  const pos: number[] = [], idx: number[] = [];
  const v = (x: number, y: number, z: number) => (pos.push(x, y, z), pos.length / 3 - 1);
  const cx = L / 2, cy = W / 2, r = dh / 2;
  // outline: rectangle; hole: circle. Build top/bottom faces by fanning between hole and outer rectangle points sampled at the same angles.
  const outer = (a: number): [number, number] => {
    const dx = Math.cos(a), dy = Math.sin(a);
    const s = Math.min(Math.abs((L / 2) / (dx || 1e-12)), Math.abs((W / 2) / (dy || 1e-12)));
    return [cx + dx * s, cy + dy * s];
  };
  const ring: { o: number[]; i: number[] }[] = [];
  const ang: number[] = [];
  for (let k = 0; k < n; k++) ang.push((k / n) * Math.PI * 2);
  // add the 4 rectangle corners exactly
  for (const c of [[L, W], [0, W], [0, 0], [L, 0]]) ang.push(Math.atan2(c[1] - cy, c[0] - cx) < 0 ? Math.atan2(c[1] - cy, c[0] - cx) + Math.PI * 2 : Math.atan2(c[1] - cy, c[0] - cx));
  ang.sort((a, b) => a - b);
  for (const a of ang) {
    const [ox, oy] = outer(a);
    ring.push({ o: [v(ox, oy, 0), v(ox, oy, t)], i: [v(cx + r * Math.cos(a), cy + r * Math.sin(a), 0), v(cx + r * Math.cos(a), cy + r * Math.sin(a), t)] });
  }
  const xmin: number[] = [], xmax: number[] = [];
  const m = ring.length;
  for (let k = 0; k < m; k++) {
    const A = ring[k], B = ring[(k + 1) % m];
    idx.push(A.i[0], B.o[0], A.o[0], A.i[0], B.i[0], B.o[0]); // bottom (normal -z)
    idx.push(A.i[1], A.o[1], B.o[1], A.i[1], B.o[1], B.i[1]); // top
    // outer wall
    const ax = pos[A.o[0] * 3], bx = pos[B.o[0] * 3];
    const id = idx.length / 3;
    idx.push(A.o[0], B.o[0], B.o[1], A.o[0], B.o[1], A.o[1]);
    if (Math.abs(ax) < 1e-9 && Math.abs(bx) < 1e-9) xmin.push(id, id + 1);
    if (Math.abs(ax - L) < 1e-9 && Math.abs(bx - L) < 1e-9) xmax.push(id, id + 1);
    // hole wall
    idx.push(A.i[0], A.i[1], B.i[1], A.i[0], B.i[1], B.i[0]);
  }
  return { mesh: { positions: pos, indices: idx }, xmin, xmax };
}


const steel = FEA_MATERIALS["鋼"];

describe("stress analysis accuracy (vs. closed-form solutions)", () => {
  const L = 100, b = 10, hgt = 10, F = 100;
  const I = (b * hgt ** 3) / 12;
  const theory = (F * L ** 3) / (3 * steel.E * I);
  const { mesh, faces } = box(L, hgt, b);
  const bc = { fixed: [faces.xmin], loads: [{ tris: faces.xmax, force: [0, -F, 0] as [number, number, number] }] };

  it("cantilever with only 2 elements through the depth (H11, no shear locking)", () => {
    const r = solveFea(mesh, bc, steel, { resolution: 20 });
    expect(r.converged).toBe(true);
    const tip = Math.abs(sampleDisp(r, [L, hgt / 2, b / 2])[1]);
    expect(tip / theory).toBeGreaterThan(0.98);
    expect(tip / theory).toBeLessThan(1.02);
    // bending stress at mid span on the top surface: M c / I
    expect(sampleVm(r, [L / 2, hgt, b / 2]) / ((F * (L / 2) * (hgt / 2)) / I)).toBeCloseTo(1, 1);
    // equilibrium: reactions balance the load
    expect(r.equilibriumError).toBeLessThan(1e-6);
    expect(r.reaction[1]).toBeCloseTo(F, 3);
  });

  it("plain 8-node bricks lock in bending (reference)", () => {
    const r = solveFea(mesh, bc, steel, { resolution: 20, element: "h8" });
    expect(Math.abs(sampleDisp(r, [L, hgt / 2, b / 2])[1]) / theory).toBeLessThan(0.9);
  });

  it("multigrid and Jacobi CG agree", () => {
    const a = solveFea(mesh, bc, steel, { resolution: 30 });
    const j = solveFea(mesh, bc, steel, { resolution: 30, solver: "jacobi" });
    expect(a.iterations).toBeLessThan(j.iterations / 2);
    expect(a.maxDisp).toBeCloseTo(j.maxDisp, 6);
  });

  it("round cantilever: element size from the volume, partial-volume boundary cells", () => {
    const d = 10;
    const bar0 = bar(d, L);
    const r = solveFea(bar0.mesh, { fixed: [bar0.cap0], loads: [{ tris: bar0.cap1, force: [0, -F, 0] }] }, steel, { targetElements: 8000 });
    const th = (F * L ** 3) / (3 * steel.E * ((Math.PI * d ** 4) / 64));
    expect(Math.abs(sampleDisp(r, [L, 0, 0])[1]) / th).toBeGreaterThan(0.97);
    expect(Math.abs(sampleDisp(r, [L, 0, 0])[1]) / th).toBeLessThan(1.03);
    expect(r.volume / ((Math.PI * d * d * L) / 4)).toBeCloseTo(1, 1);
  }, 60000);

  it("plate with a hole: stress concentration (Heywood: Kt_net = 2 + (1 - d/W)³ = 2.512)", () => {
    const W = 50, t = 5, dh = 10, Ft = 10000;
    const p = plateWithHole(150, W, t, dh);
    const r = solveFea(p.mesh, { fixed: [p.xmin], loads: [{ tris: p.xmax, force: [Ft, 0, 0] }] }, steel, { resolution: 75 });
    const kt = r.maxS1 / (Ft / ((W - dh) * t));
    expect(kt).toBeGreaterThan(2.512 * 0.95);
    expect(kt).toBeLessThan(2.512 * 1.05);
  }, 60000);

  it("tension bar: uniform stress F/A", () => {
    const bx = box(50, 10, 10);
    const r = solveFea(bx.mesh, { fixed: [bx.faces.xmin], loads: [{ tris: bx.faces.xmax, force: [1000, 0, 0] }] }, steel, { resolution: 25 });
    expect(sampleVm(r, [25, 5, 5])).toBeCloseTo(10, 1);
    // elongation F L / (E A) (the clamped end restrains the Poisson contraction a little)
    const ratio = sampleDisp(r, [50, 5, 5])[0] / ((1000 * 50) / (steel.E * 100));
    expect(ratio).toBeGreaterThan(0.98);
    expect(ratio).toBeLessThan(1.001);
  });

  it("pressure and self weight are balanced by the supports", () => {
    const bx = box(40, 10, 20);
    const pr = solveFea(bx.mesh, { fixed: [bx.faces.ymin], loads: [{ tris: bx.faces.ymax, pressure: 2 }] }, steel, { resolution: 20 });
    expect(pr.applied[1]).toBeCloseTo(-2 * 40 * 20, 3);
    expect(pr.reaction[1]).toBeCloseTo(2 * 40 * 20, 3);
    const gr = solveFea(bx.mesh, { fixed: [bx.faces.ymin], loads: [], gravity: { density: 7.85, dir: [0, -1, 0] } }, steel, { resolution: 20 });
    const weight = 40 * 10 * 20 * 7.85e-6 * 9.81; // N
    expect(gr.reaction[1]).toBeCloseTo(weight, 6);
  });

  it("principal and von Mises stresses", () => {
    expect(principal([100, 0, 0, 0, 0, 0])).toEqual([100, 0, 0].map((x) => expect.closeTo(x, 9)) as never);
    // pure shear τ: principal ±τ, von Mises √3 τ
    expect(principal([0, 0, 0, 50, 0, 0])).toEqual([50, 0, -50].map((x) => expect.closeTo(x, 9)) as never);
    expect(vonMises([0, 0, 0, 50, 0, 0])).toBeCloseTo(50 * Math.sqrt(3), 9);
  });

  it("sub-model: refining around the hole recovers the stress concentration of a coarse model", () => {
    const W = 50, t = 5, dh = 10, Ft = 10000;
    const p = plateWithHole(150, W, t, dh);
    const bc = { fixed: [p.xmin], loads: [{ tris: p.xmax, force: [Ft, 0, 0] as [number, number, number] }] };
    const coarse = solveFea(p.mesh, bc, steel, { resolution: 75 });
    const snet = Ft / ((W - dh) * t);
    const ktCoarse = coarse.maxS1 / snet;
    const sub = solveFea(
      p.mesh,
      { ...bc, submodel: { h: coarse.h, origin: coarse.origin, dims: coarse.dims, used: coarse.used, disp: coarse.disp } },
      steel,
      { targetElements: 30000, region: { lo: [60, 10, -1], hi: [90, 40, 6] } },
    );
    const ktSub = sub.maxS1 / snet;
    expect(Math.abs(ktSub - 2.512)).toBeLessThan(Math.abs(ktCoarse - 2.512));
    expect(Math.abs(ktSub / 2.512 - 1)).toBeLessThan(0.02);
  }, 120000);

  it("assembly: two bonded bars of different materials in series", () => {
    // steel 0..50 and aluminium 50..100 along x, 10×10 section, pulled at the free end
    const a = box(50, 10, 10), b = box(50, 10, 10);
    const pos = [...a.mesh.positions, ...Array.from(b.mesh.positions as number[]).map((v, i) => (i % 3 === 0 ? v + 50 : v))];
    const idx = [...(a.mesh.indices as number[]), ...(b.mesh.indices as number[]).map((i) => i + 8)];
    const alu = FEA_MATERIALS["アルミニウム 6061"];
    const mesh = { positions: pos, indices: idx, parts: [{ start: 0, count: 12, stiff: 1, density: 7.85 }, { start: 12, count: 12, stiff: alu.E / steel.E, density: 2.7 }] };
    const F = 1000;
    const r = solveFea(mesh, { fixed: [a.faces.xmin], loads: [{ tris: b.faces.xmax.map((t) => t + 12), force: [F, 0, 0] }] }, steel, { resolution: 50 });
    // series springs: F L/(E A) for each half
    const theory = (F * 50) / (steel.E * 100) + (F * 50) / (alu.E * 100);
    const tip = sampleDisp(r, [100, 5, 5])[0];
    expect(tip / theory).toBeGreaterThan(0.97);
    expect(tip / theory).toBeLessThan(1.01);
    // same stress F/A in both materials
    expect(sampleVm(r, [25, 5, 5])).toBeCloseTo(10, 0);
    expect(sampleVm(r, [75, 5, 5])).toBeCloseTo(10, 0);
  }, 60000);
});
