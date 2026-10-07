import { describe, expect, it } from "vitest";
import { runRule, type RuleContext } from "../src/rules/engine";

const ctx = (): RuleContext => ({
  params: { 幅: 120, 厚さ: 4, 穴数: 4 },
  features: { フィレット1: false, 穴1: false },
  iprops: { 説明: "" },
  material: "汎用",
  materials: ["汎用", "鋼"],
  mass: 812.5,
});

describe("rules", () => {
  it("reads and writes parameters as variables", () => {
    const r = runRule("if (幅 > 100) 穴数 = 6; 厚さ = round(厚さ * 1.3, 0.5);", ctx());
    expect(r.params).toEqual({ 穴数: 6, 厚さ: 5 });
  });
  it("suppresses features, sets iProperties and material", () => {
    const r = runRule('suppress("フィレット1", 厚さ < 5); iprop("説明", `W${幅}`); material("鋼"); message("質量", mass());', ctx());
    expect(r.suppress).toEqual({ フィレット1: true });
    expect(r.iprops).toEqual({ 説明: "W120" });
    expect(r.material).toBe("鋼");
    expect(r.messages).toEqual(["質量 812.5"]);
  });
  it("reports only real changes and rejects unknown names", () => {
    expect(runRule("幅 = 120;", ctx()).params).toEqual({});
    expect(() => runRule("長さ = 3;", ctx())).toThrow();
    expect(() => runRule('suppress("なし")', ctx())).toThrow(/フィーチャ/);
    expect(() => runRule('幅 = "abc"', ctx())).toThrow(/数値/);
  });
  it("keeps globals like Math reachable", () => {
    expect(runRule("幅 = Math.max(幅, 150);", ctx()).params).toEqual({ 幅: 150 });
  });
});
