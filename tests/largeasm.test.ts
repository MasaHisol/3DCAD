import { describe, expect, it } from "vitest";
import { boxMatrix, edgeVisibleAtZoom, groupInstances, isolateVisibility, matchesFilter, rebuildOrder, useProxy } from "../src/assembly/largeAsm";

describe("large assembly helpers", () => {
  it("groups display slots by shared body mesh", () => {
    const bolt = { id: "bolt" }, plate = { id: "plate" };
    const g = groupInstances([plate, bolt, bolt, plate, bolt]);
    expect(g.size).toBe(2);
    expect(g.get(bolt)).toEqual([1, 2, 4]);
    expect(g.get(plate)).toEqual([0, 3]);
  });

  it("filters browser rows by any label, case-insensitive", () => {
    expect(matchesFilter("", "x")).toBe(true);
    expect(matchesFilter("BOLT", "ボルト:1", "Bolt M6")).toBe(true);
    expect(matchesFilter("nut", "ボルト:1", undefined)).toBe(false);
  });

  it("isolates the selection", () => {
    const v = isolateVisibility(["a", "b", "c"], new Set(["b"]));
    expect([...v]).toEqual([["a", false], ["b", true], ["c", false]]);
  });

  it("decides box proxies", () => {
    const sel = new Set(["s"]);
    expect(useProxy({ light: true, simplifyPatterns: false }, { id: "a" }, sel)).toBe(true);
    expect(useProxy({ light: true, simplifyPatterns: false }, { id: "s" }, sel)).toBe(false);
    expect(useProxy({ light: false, simplifyPatterns: true }, { id: "a" }, sel)).toBe(false);
    expect(useProxy({ light: false, simplifyPatterns: true }, { id: "p", patternOf: {} }, sel)).toBe(true);
  });

  it("culls edges of small bodies when zoomed out", () => {
    expect(edgeVisibleAtZoom(5, 0.1, 12)).toBe(true); // 100 px
    expect(edgeVisibleAtZoom(5, 2, 12)).toBe(false); // 5 px
    expect(edgeVisibleAtZoom(5, 2, 0)).toBe(true);
  });

  it("maps the unit cube onto a box", () => {
    const m = boxMatrix([0, 0, 0], [10, 20, 30]);
    // corner (0.5, 0.5, 0.5) -> max
    const p = [0, 1, 2].map((i) => m[i] * 0.5 + m[4 + i] * 0.5 + m[8 + i] * 0.5 + m[12 + i]);
    expect(p).toEqual([10, 20, 30]);
  });

  it("rebuilds parts with many instances first", () => {
    expect(rebuildOrder(["a", "b", "c"], [{ partId: "b" }, { partId: "b" }, { partId: "c" }, { partId: "a" }, { partId: "c" }, { partId: "c" }])).toEqual(["c", "b", "a"]);
    expect(rebuildOrder(["a", "b"], [])).toEqual(["a", "b"]);
  });
});
