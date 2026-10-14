import { describe, expect, it } from "vitest";
import { diffSnapshots, nextRev } from "../src/core/revisions";

describe("revisions", () => {
  it("letters skip I and O and roll over", () => {
    expect(nextRev()).toBe("A");
    expect(nextRev("H")).toBe("J");
    expect(nextRev("N")).toBe("P");
    expect(nextRev("Z")).toBe("AA");
    expect(nextRev("AZ")).toBe("BA");
  });
  it("lists changes", () => {
    const mat = { name: "鋼", density: 7.85 } as never;
    const a = { params: [{ name: "d0", expr: "10", unit: "mm" as const, kind: "model" as const }], features: [{ id: "e1", name: "押し出し1", type: "extrude" } as never], endOfPart: 1, material: mat };
    const b = { params: [{ name: "d0", expr: "12", unit: "mm" as const, kind: "model" as const }], features: [{ id: "e1", name: "押し出し1", type: "extrude" } as never, { id: "f1", name: "フィレット1", type: "fillet" } as never], endOfPart: 2, material: { name: "アルミ", density: 2.7 } as never };
    const d = diffSnapshots(a, b);
    expect(d).toContain("寸法変更: d0 10 → 12");
    expect(d).toContain("フィーチャ追加: フィレット1");
    expect(d).toContain("材料変更: 鋼 → アルミ");
  });
});
