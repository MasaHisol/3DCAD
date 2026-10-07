import { beforeAll, describe, expect, it } from "vitest";
import opencascade from "replicad-opencascadejs";
import { setOC } from "replicad";
import { GeometryEngine } from "../src/kernel/geometry";
import { evaluateParams } from "../src/core/params";
import { prepareDocument, resolveDocument } from "../src/core/resolve";
import { clearanceHole, tapDrill, threadByName } from "../src/core/threads";
import { LIBRARY } from "../src/library/standard";

beforeAll(async () => {
  const OC = await (opencascade as unknown as () => Promise<unknown>)();
  setOC(OC as never);
}, 60000);

describe("thread tables", () => {
  it("looks up sizes and derives drill sizes", () => {
    expect(threadByName("M6")).toMatchObject({ d: 6, pitch: 1 });
    expect(threadByName("M10x1.25")).toMatchObject({ d: 10, pitch: 1.25 });
    expect(threadByName("1/4-20 UNC")!.d).toBeCloseTo(6.35, 6);
    expect(tapDrill(threadByName("M6")!)).toBe(5);
    expect(tapDrill(threadByName("M8")!)).toBe(6.75);
    expect(clearanceHole(6, "normal")).toBe(6.6);
    expect(clearanceHole(10, "close")).toBe(10.5);
  });
});

describe("standard parts library", () => {
  for (const fam of LIBRARY)
    it(`builds ${fam.name} (${fam.standard})`, async () => {
      for (const item of [fam.items[0], fam.items[fam.items.length - 1]]) {
        const L = item.lengths.length ? item.lengths[Math.floor(item.lengths.length / 2)] : 0;
        const doc = fam.build(item.size, L);
        const values = evaluateParams(doc.params);
        prepareDocument(doc, values);
        const res = resolveDocument(doc, values);
        expect(res.errors).toEqual({});
        const eng = new GeometryEngine();
        const r = await eng.rebuild(res.features);
        expect(r.errors).toEqual({});
        expect(r.bodies.length).toBe(1);
        const mp = eng.massProps();
        expect(mp.volume).toBeGreaterThan(0);
        if (fam.id.startsWith("iso40") || fam.id === "iso4762") {
          expect(r.threads.length).toBe(1);
          expect(r.threads[0].name).toBe(item.size);
        }
        if (fam.id === "iso4762" || fam.id === "iso4017") expect(mp.bbox[0][1]).toBeCloseTo(-L, 4);
      }
    }, 60000);
});
