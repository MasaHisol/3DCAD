import { describe, expect, it } from "vitest";
import { FEA_MATERIALS, solveFea, type FeaBoundary, type FeaMesh } from "../src/analysis/fea";
import { ContactError } from "../src/analysis/contact";

type Faces = Record<"xmin" | "xmax" | "ymin" | "ymax" | "zmin" | "zmax", number[]>;

/** Assembly of axis-aligned boxes (lo, hi): one closed part per box, with the triangle ids of each face. */
function boxes(list: { lo: number[]; hi: number[]; name: string }[]): { mesh: FeaMesh; faces: Faces[] } {
  const pos: number[] = [], idx: number[] = [];
  const parts: NonNullable<FeaMesh["parts"]> = [];
  const faces: Faces[] = [];
  for (const { lo, hi, name } of list) {
    const b = pos.length / 3, t0 = idx.length / 3;
    for (const [x, y, z] of [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0], [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]])
      pos.push(x ? hi[0] : lo[0], y ? hi[1] : lo[1], z ? hi[2] : lo[2]);
    const quads = { xmin: [0, 3, 7, 4], xmax: [1, 5, 6, 2], ymin: [0, 4, 5, 1], ymax: [3, 2, 6, 7], zmin: [0, 1, 2, 3], zmax: [4, 7, 6, 5] };
    const f = {} as Faces;
    for (const [k, q] of Object.entries(quads)) {
      const t = idx.length / 3;
      idx.push(b + q[0], b + q[2], b + q[1], b + q[0], b + q[3], b + q[2]);
      f[k as keyof Faces] = [t, t + 1];
    }
    faces.push(f);
    parts.push({ start: t0, count: 12, stiff: 1, density: 7.85, name });
  }
  return { mesh: { positions: pos, indices: idx, parts }, faces };
}

const steel = FEA_MATERIALS["構造用鋼 (S235)"] ?? Object.values(FEA_MATERIALS)[0];
const opt = { resolution: 16 } as const;

describe("assembly contact", () => {
  const stack = () => boxes([
    { lo: [0, 0, 0], hi: [20, 20, 10], name: "下" },
    { lo: [0, 0, 10], hi: [20, 20, 20], name: "上" },
  ]);

  it("compressed stack: contact matches bonded", () => {
    const { mesh, faces } = stack();
    const bc: FeaBoundary = { fixed: [faces[0].zmin], loads: [{ tris: faces[1].zmax, force: [0, 0, -1000] }] };
    const bonded = solveFea(mesh, bc, steel, opt);
    const contact = solveFea(mesh, bc, steel, { ...opt, contact: "contact" });
    expect(bonded.contact).toBeUndefined();
    const c = contact.contact!;
    expect(c.faces).toBeGreaterThan(100);
    expect(c.converged).toBe(true);
    expect(c.released).toBeLessThan(c.faces * 0.1);
    expect(Math.abs(contact.maxDisp - bonded.maxDisp) / bonded.maxDisp).toBeLessThan(0.02);
    expect(contact.equilibriumError).toBeLessThan(1e-3);
  });

  it("stack pulled apart: bonded transmits, contact reports the loose part", () => {
    const { mesh, faces } = stack();
    const bc: FeaBoundary = { fixed: [faces[0].zmin], loads: [{ tris: faces[1].zmax, force: [0, 0, 1000] }] };
    const bonded = solveFea(mesh, bc, steel, opt);
    expect(bonded.maxDisp).toBeGreaterThan(0);
    expect(bonded.equilibriumError).toBeLessThan(1e-3);
    expect(() => solveFea(mesh, bc, steel, { ...opt, contact: "contact" })).toThrow(ContactError);
    expect(() => solveFea(mesh, bc, steel, { ...opt, contact: "contact" })).toThrow(/「上」.*固定拘束から外れます/);
  });

  it("stacked cantilevers in bending: part of the interface opens", () => {
    // two plates clamped at x = 0, the upper one longer and loaded down at its tip:
    // it bears on the lower plate's end and lifts off between root and that edge
    const { mesh, faces } = boxes([
      { lo: [0, 0, 0], hi: [40, 10, 4], name: "A" },
      { lo: [0, 0, 4], hi: [60, 10, 8], name: "B" },
    ]);
    const bc: FeaBoundary = { fixed: [faces[0].xmin, faces[1].xmin], loads: [{ tris: faces[1].xmax, force: [0, 0, -100] }] };
    const bonded = solveFea(mesh, bc, steel, { resolution: 40 });
    const contact = solveFea(mesh, bc, steel, { resolution: 40, contact: "contact" });
    const c = contact.contact!;
    expect(c.released).toBeGreaterThan(0);
    expect(c.closed).toBeGreaterThan(0);
    expect(c.converged).toBe(true);
    // opening makes the joint more flexible
    expect(contact.maxDisp).toBeGreaterThan(bonded.maxDisp * 1.01);
    expect(contact.equilibriumError).toBeLessThan(1e-3);
  }, 120000);

  /** Largest |x| displacement and most negative z displacement of the result. */
  const extremes = (r: ReturnType<typeof solveFea>) => {
    let mx = 0, mz = 0;
    for (let n = 0; n < r.disp.length / 3; n++) {
      mx = Math.max(mx, Math.abs(r.disp[n * 3]));
      mz = Math.min(mz, r.disp[n * 3 + 2]);
    }
    return { mx, mz };
  };

  it("block pressed onto a fixed block: same normal displacement in all modes", () => {
    const { mesh, faces } = stack();
    const bc: FeaBoundary = { fixed: [faces[0].zmin], loads: [{ tris: faces[1].zmax, force: [0, 0, -1000] }] };
    const ref = extremes(solveFea(mesh, bc, steel, opt)).mz;
    for (const mode of ["contact", "frictionless"] as const) {
      const r = solveFea(mesh, bc, steel, { ...opt, contact: mode });
      expect(r.contact!.mode).toBe(mode);
      expect(r.contact!.converged).toBe(true);
      expect(r.contact!.released).toBeLessThan(r.contact!.faces * 0.1);
      expect(Math.abs(extremes(r).mz - ref) / Math.abs(ref)).toBeLessThan(0.02);
      expect(r.equilibriumError).toBeLessThan(1e-3);
    }
  });

  it("block pushed sideways: slides on a frictionless interface (stabilised, with a warning)", () => {
    const { mesh, faces } = stack();
    const bc: FeaBoundary = { fixed: [faces[0].zmin], loads: [{ tris: faces[1].zmax, force: [300, 0, -1000] }] };
    const stick = solveFea(mesh, bc, steel, { ...opt, contact: "contact" });
    const slide = solveFea(mesh, bc, steel, { ...opt, contact: "frictionless" });
    expect(stick.contact!.stabilized).toEqual([]);
    // only the normals (z) hold the upper block: it gets the weak tangential spring, named in the result
    expect(slide.contact!.stabilized).toEqual(["上"]);
    expect(slide.contact!.converged).toBe(true);
    expect(extremes(slide).mx).toBeGreaterThan(extremes(stick).mx * 10);
    // the normal response is unchanged
    expect(Math.abs(extremes(slide).mz - extremes(stick).mz) / Math.abs(extremes(stick).mz)).toBeLessThan(0.02);
    // the stabilising springs carry the tangential load to the support: still in equilibrium
    expect(slide.equilibriumError).toBeLessThan(1e-3);
  });

  it("frictionless stacked cantilevers: the plates slide and bend more than without slip", () => {
    const { mesh, faces } = boxes([
      { lo: [0, 0, 0], hi: [40, 10, 4], name: "A" },
      { lo: [0, 0, 4], hi: [60, 10, 8], name: "B" },
    ]);
    const bc: FeaBoundary = { fixed: [faces[0].xmin, faces[1].xmin], loads: [{ tris: faces[1].xmax, force: [0, 0, -100] }] };
    const stick = solveFea(mesh, bc, steel, { resolution: 40, contact: "contact" });
    const slide = solveFea(mesh, bc, steel, { resolution: 40, contact: "frictionless" });
    const c = slide.contact!;
    expect(c.converged).toBe(true);
    expect(c.stabilized).toEqual([]); // both plates are clamped
    expect(c.released).toBeGreaterThan(0);
    expect(slide.maxDisp).toBeGreaterThan(stick.maxDisp * 1.5);
    expect(slide.equilibriumError).toBeLessThan(1e-3);
  }, 120000);
});
