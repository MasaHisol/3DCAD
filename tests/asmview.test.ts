import { beforeAll, describe, expect, it } from "vitest";
import opencascade from "replicad-opencascadejs";
import * as R from "replicad";
import { bomCsv, buildBom, filterBom, flattenRows, isFastener, rowSelection, totalMass } from "../src/assembly/bom";
import { assignColors, distinctColor } from "../src/assembly/colorBy";
import { candidatePairs, chunkPairs, exactCheck, finishResults, pairKey, toggleIgnore } from "../src/assembly/interference";
import { captureView, deleteView, nextViewName, parseViews, renameView, sameState, serializeViews, upsertView, viewState, type DisplayState } from "../src/assembly/views";
import { newAssembly, type AssemblyDocument } from "../src/assembly/types";
import { interferenceEx } from "../src/kernel/interferenceK";
import { newDocument } from "../src/core/document";
import { validateAssembly } from "../src/core/validate";

const I = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

function sampleDoc(): AssemblyDocument {
  const d = newAssembly("テスト");
  const plate = newDocument("プレート");
  plate.iprops["パーツ番号"] = "PL-01";
  const bolt = newDocument("ボルト M6");
  bolt.iprops["パーツ番号"] = "M6x20";
  bolt.iprops["標準部品"] = "はい";
  bolt.material = { ...bolt.material, name: "鋼", density: 7.85, color: "#888888" } as never;
  d.parts = [
    { id: "p1", name: "プレート", kind: "part", doc: plate },
    { id: "p2", name: "ボルト", kind: "part", doc: bolt },
    { id: "p3", name: "未使用", kind: "part", doc: newDocument("未使用") },
  ];
  d.components = [
    { id: "c1", name: "プレート:1", partId: "p1", matrix: I, grounded: true },
    { id: "c2", name: "ボルト:1", partId: "p2", matrix: I, grounded: false },
    { id: "c3", name: "ボルト:2", partId: "p2", matrix: I, grounded: false, patternOf: { pattern: "pt1", index: 1 } },
    { id: "c4", name: "ボルト:3", partId: "p2", matrix: I, grounded: false, patternOf: { pattern: "pt1", index: 2 } },
  ];
  d.patterns = [{ id: "pt1", name: "矩形パターン:1" } as never];
  return d;
}

describe("BOM", () => {
  it("aggregates quantities per part (flat) with masses", () => {
    const rows = buildBom(sampleDoc(), "flat", (id) => (id === "p1" ? 100 : 5));
    expect(rows.map((r) => [r.no, r.partNo, r.qty])).toEqual([
      ["1", "PL-01", 1],
      ["2", "M6x20", 3],
    ]);
    expect(rows[1].compIds).toEqual(["c2", "c3", "c4"]);
    expect(rows[1].fastener).toBe(true);
    expect(rows[1].material).toBe("鋼");
    expect(totalMass(rows)).toBeCloseTo(115);
  });

  it("builds the structure tree with pattern groups, filters and exports CSV", () => {
    const rows = buildBom(sampleDoc(), "tree", () => 2);
    expect(rows.map((r) => r.name)).toEqual(["プレート:1", "ボルト:1", "矩形パターン:1"]);
    expect(rows[2].children!.map((r) => r.no)).toEqual(["3.1", "3.2"]);
    expect(rows[2].qty).toBe(2);
    expect(flattenRows(rows).length).toBe(5);
    const f = filterBom(rows, "ボルト:3");
    expect(f.length).toBe(1);
    expect(f[0].children!.map((r) => r.key)).toEqual(["c4"]);
    const csv = bomCsv(buildBom(sampleDoc(), "flat", () => 1.5));
    expect(csv.startsWith("﻿項目,")).toBe(true);
    expect(csv).toContain("2,ボルト,M6x20,鋼,3,1.50,4.50");
    expect(rowSelection(rows[2], new Set(["c3"]))).toBe("some");
    expect(rowSelection(rows[2], new Set(["c3", "c4"]))).toBe("all");
    expect(isFastener(sampleDoc().parts[0])).toBe(false);
  });
});

describe("saved views", () => {
  const state = (): DisplayState => ({
    camera: { target: [1, 2, 3], quat: [0.1, 0.2, 0.3, 0.927], height: 120, perspective: true },
    hidden: new Set(["c2", "gone"]),
    transparent: new Set(["c3"]),
    explode: 0.5,
    sections: [{ normal: [0, 0, -1], constant: 10 }],
    style: "wireframe",
    colorMode: "part",
  });

  it("serialises and recalls the same display state", () => {
    const doc = sampleDoc();
    const v = captureView("v1", "正面", state(), doc.components.map((c) => c.id));
    expect(v.hidden).toEqual(["c2"]); // unknown ids dropped
    upsertView(doc, v);
    const json = serializeViews(doc.views!);
    const back = parseViews(json);
    expect(back).toEqual(doc.views);
    const s = viewState(back[0], doc.components.map((c) => c.id));
    const expected = state();
    expected.hidden.delete("gone");
    expect(sameState(s, expected)).toBe(true);
    // a changed state is detected
    expect(sameState({ ...s, explode: 0 }, expected)).toBe(false);
    expect(sameState({ ...s, hidden: new Set() }, expected)).toBe(false);
    // q and -q are the same orientation
    expect(sameState({ ...s, camera: { ...s.camera, quat: s.camera.quat.map((x) => -x) as never } }, expected)).toBe(true);
  });

  it("renames, updates, deletes and survives document validation", () => {
    const doc = sampleDoc();
    upsertView(doc, captureView("a", nextViewName(doc), state()));
    upsertView(doc, captureView("b", nextViewName(doc), state()));
    expect(doc.views!.map((v) => v.name)).toEqual(["ビュー1", "ビュー2"]);
    renameView(doc, "a", "上面");
    upsertView(doc, { ...doc.views![0], explode: 0 });
    expect(doc.views!.length).toBe(2);
    expect(doc.views![0]).toMatchObject({ name: "上面", explode: 0 });
    deleteView(doc, "b");
    doc.interferenceIgnore = ["c1|c2"];
    const raw = JSON.parse(JSON.stringify(doc));
    raw.views.push({ bogus: true });
    const { doc: v } = validateAssembly(raw);
    expect(v.views!.map((x) => x.id)).toEqual(["a"]);
    expect(v.interferenceIgnore).toEqual(["c1|c2"]);
  });
});

describe("colour assignment", () => {
  it("assigns distinct colours per component / part / level and a legend", () => {
    const doc = sampleDoc();
    const comp = assignColors(doc, "component", () => "#000");
    expect(new Set(comp.colors.values()).size).toBe(4);
    expect(comp.legend.length).toBe(4);
    const part = assignColors(doc, "part", () => "#000");
    expect(part.colors.get("c2")).toBe(part.colors.get("c4"));
    expect(part.colors.get("c1")).not.toBe(part.colors.get("c2"));
    expect(part.legend.map((l) => l.label)).toEqual(["プレート", "ボルト"]);
    const lvl = assignColors(doc, "level", () => "#000");
    expect(lvl.colors.get("c3")).toBe(lvl.colors.get("c4"));
    expect(lvl.colors.get("c2")).not.toBe(lvl.colors.get("c3"));
    const mat = assignColors(doc, "material", () => "#000");
    expect(mat.legend.length).toBe(2);
    expect(assignColors(doc, "default", () => "#123456").colors.size).toBe(0);
    const r1 = assignColors(doc, "random", () => "#000", 1), r2 = assignColors(doc, "random", () => "#000", 1);
    expect([...r1.colors]).toEqual([...r2.colors]);
    expect(new Set(r1.colors.values()).size).toBe(4);
    const cols = Array.from({ length: 30 }, (_, i) => distinctColor(i));
    expect(new Set(cols).size).toBe(30);
    for (const c of cols) expect(c).toMatch(/^#[0-9a-f]{6}$/);
  });
});

describe("interference", () => {
  beforeAll(async () => {
    const OC = await (opencascade as unknown as () => Promise<unknown>)();
    R.setOC(OC as never);
  }, 60000);

  it("broad phase finds only overlapping boxes, also for a subset", () => {
    const boxes = [
      { id: "a", min: [0, 0, 0], max: [10, 10, 10] },
      { id: "b", min: [5, 5, 5], max: [15, 15, 15] },
      { id: "c", min: [20, 0, 0], max: [30, 10, 10] },
      { id: "d", min: [10, 0, 0], max: [20, 10, 10] },
    ] as never;
    expect(candidatePairs(boxes).map((p) => p.join("")).sort()).toEqual(["ab", "ad", "bd", "cd"]);
    expect(candidatePairs(boxes, 0, new Set(["c"])).map((p) => p.join(""))).toEqual(["cd"]);
    expect(chunkPairs([["a", "b"], ["a", "c"], ["b", "c"]], 2).flat().length).toBe(3);
  });

  it("measures the overlap volume, tells touch from interference and applies the ignore list", async () => {
    const box = (x: number, y: number, z: number, s: number) => R.makeBox([x, y, z], [x + s, y + s, z + s]) as unknown as R.Shape3D;
    // A 10³ at origin, B 10³ shifted by 5 in x/y/z (overlap 5³ = 125), C touching A on the face x=10 (no overlap), D far away
    const placed = [
      { shape: box(0, 0, 0, 10), index: 0 },
      { shape: box(5, 5, 5, 10), index: 1 },
      { shape: R.makeBox([10, 0, -20], [20, 10, -10]) as unknown as R.Shape3D, index: 2 },
      { shape: R.makeBox([10, 0, 0], [12, 10, -5]) as unknown as R.Shape3D, index: 2 },
      { shape: box(100, 100, 100, 5), index: 3 },
    ];
    const hits = interferenceEx(placed, { touchTol: 0.01, mesh: true });
    const ab = hits.find((h) => h.a === 0 && h.b === 1)!;
    expect(ab.kind).toBe("interfere");
    expect(ab.volume).toBeCloseTo(125, 3);
    expect(ab.center).toEqual([7.5, 7.5, 7.5]);
    expect(ab.mesh!.indices.length).toBeGreaterThan(0);
    const ac = hits.find((h) => h.a === 0 && h.b === 2)!;
    expect(ac.kind).toBe("touch");
    expect(ac.volume).toBe(0);
    expect(hits.some((h) => h.a === 3 || h.b === 3)).toBe(false);
    // only the requested pairs
    expect(interferenceEx(placed, { pairs: [[0, 2]], touchTol: 0 })).toEqual([]);

    // through the pair runner: ids, ignore list, touches off
    const pm = new Map(["A", "B", "C"].map((id, i) => [id, { key: id, matrix: I, name: id }]));
    const shapes = new Map([["A", [placed[0]]], ["B", [placed[1]]], ["C", [placed[2], placed[3]]]]);
    const res = await exactCheck([["A", "B"], ["A", "C"]], pm as never, 2, async (jobs) => jobs.map((j) => interferenceEx(j.placements.flatMap((p, i) => shapes.get(p.key)!.map((x) => ({ shape: x.shape, index: i }))), j.opts)), { touchTol: 0.01, mesh: false });
    expect(res.map((r) => `${r.a}${r.b}${r.kind}`).sort()).toEqual(["ABinterfere", "ACtouch"]);
    const ig = toggleIgnore([], pairKey("B", "A"));
    expect(ig).toEqual(["A|B"]);
    const shown = finishResults(res, ig, { touches: true, showIgnored: true });
    expect(shown.map((r) => [r.a + r.b, r.ignored])).toEqual([["AC", false], ["AB", true]]);
    expect(finishResults(res, ig, { touches: false, showIgnored: false })).toEqual([]);
    expect(finishResults(res, [], { touches: false, showIgnored: false }).map((r) => r.volume)).toEqual([expect.closeTo(125, 3)]);
    expect(toggleIgnore(ig, "A|B")).toEqual([]);
  });
});
