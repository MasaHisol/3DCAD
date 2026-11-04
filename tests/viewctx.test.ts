// 閲覧時の右クリック操作: menu availability per context, the view undo stack,
// hide / isolate / transparency / colour state logic, STEP tree grouping,
// saved views with colours, and the BOM's wire / pipe rows.
import { describe, expect, it } from "vitest";
import * as VS from "../src/core/viewState";
import { ViewUndo } from "../src/core/viewUndo";
import { buildTree, filterTree, nodeItems } from "../src/core/viewTree";
import { nearestAxis, viewMenuSpec, type MenuContext } from "../src/ui/viewContextMenu";
import { routeBomRows } from "../src/assembly/bom";
import { captureView, parseView, sameState, viewState, type DisplayState } from "../src/assembly/views";

const ctx = (o: Partial<MenuContext> = {}): MenuContext => ({ viewer: true, kind: "part", count: 1, allHidden: false, allTransparent: false, anyHidden: false, anyTransparent: false, hasPoint: true, ...o });
const actions = (c: MenuContext) => viewMenuSpec(c).map((s) => s.action);
const enabled = (c: MenuContext) => viewMenuSpec(c).filter((s) => !s.disabled).map((s) => s.action);

describe("view menu availability", () => {
  const core = ["hide", "isolate", "ghostOthers", "ghostThis", "color", "zoom", "props", "measure", "section", "clearSel"];

  it("viewer / part: the full list, without 「同じ部品をすべて選択」", () => {
    expect(actions(ctx())).toEqual(core);
    expect(enabled(ctx())).toEqual(core);
  });

  it("assembly adds 「同じ部品をすべて選択」", () => {
    expect(actions(ctx({ kind: "assembly" }))).toContain("sameParts");
    expect(actions(ctx({ kind: "assembly", viewer: false }))).toContain("sameParts");
    expect(actions(ctx({ kind: "part", viewer: false }))).not.toContain("sameParts");
  });

  it("H shortcut only where H is not 「穴」", () => {
    const hk = (c: MenuContext) => viewMenuSpec(c).find((s) => s.action === "hide")!.shortcut;
    expect(hk(ctx())).toBe("H");
    expect(hk(ctx({ viewer: false, kind: "assembly" }))).toBe("H");
    expect(hk(ctx({ viewer: false, kind: "part" }))).toBeUndefined();
  });

  it("nothing under the cursor: item operations disabled, measure stays", () => {
    const e = enabled(ctx({ count: 0, hasPoint: false }));
    expect(e).toEqual(["measure"]);
  });

  it("several items: properties disabled, the rest enabled", () => {
    const e = enabled(ctx({ count: 3 }));
    expect(e).not.toContain("props");
    expect(e).toContain("isolate");
  });

  it("hidden / transparent items flip the labels; show-all and the hidden list appear", () => {
    const a = actions(ctx({ allHidden: true, allTransparent: true, anyHidden: true, anyTransparent: true }));
    expect(a).toContain("show");
    expect(a).not.toContain("hide");
    expect(a).toContain("opaque");
    expect(a).toContain("showAll");
    expect(a).toContain("hiddenList");
    expect(actions(ctx({ anyTransparent: true }))).toContain("showAll");
    expect(actions(ctx({ anyTransparent: true }))).not.toContain("hiddenList");
  });

  it("section needs a picked point (not from the tree)", () => {
    expect(enabled(ctx({ hasPoint: false }))).not.toContain("section");
  });

  it("nearest axis of a face normal", () => {
    expect(nearestAxis([0, 0, 1])).toEqual({ axis: "Z", negative: false, exact: true });
    expect(nearestAxis([-1, 0, 0])).toMatchObject({ axis: "X", negative: true, exact: true });
    expect(nearestAxis([0.3, 0.9, 0.1])).toMatchObject({ axis: "Y", exact: false });
  });
});

describe("view state", () => {
  const all = ["a", "b", "c", "d"];
  it("hide / show / toggle", () => {
    let s = VS.hideItems(VS.emptyView(), ["b", "a"]);
    expect(s.hidden).toEqual(["a", "b"]);
    s = VS.showItems(s, ["a"]);
    expect(s.hidden).toEqual(["b"]);
    s = VS.toggleItems(s, ["b", "c"]); // not all hidden: hide both
    expect(s.hidden).toEqual(["b", "c"]);
    s = VS.toggleItems(s, ["b", "c"]); // all hidden: show
    expect(s.hidden).toEqual([]);
  });

  it("isolate hides the others and clears transparency, keeps colours", () => {
    const s0 = VS.colorItems(VS.setTransparentItems(VS.emptyView(), ["c"], true), ["a"], "#ff0000");
    const s = VS.isolateItems(s0, all, ["a", "b"]);
    expect(s.hidden).toEqual(["c", "d"]);
    expect(s.transparent).toEqual([]);
    expect(s.colors).toEqual({ a: "#ff0000" });
  });

  it("transparency: others / this / off; show-all clears hidden and transparent", () => {
    let s = VS.transparentOthers(VS.emptyView(), all, ["a"]);
    expect(s.transparent).toEqual(["b", "c", "d"]);
    s = VS.setTransparentItems(s, ["b"], false);
    expect(s.transparent).toEqual(["c", "d"]);
    s = VS.hideItems(s, ["d"]);
    s = VS.showAllItems(s);
    expect(s).toEqual({ hidden: [], transparent: [], colors: {} });
  });

  it("colours set and reset; prune drops vanished items; operations do not mutate", () => {
    const s0 = VS.emptyView();
    const s = VS.colorItems(s0, ["a", "b"], "#00ff00");
    expect(s0.colors).toEqual({});
    expect(VS.colorItems(s, ["a"], null).colors).toEqual({ b: "#00ff00" });
    expect(VS.pruneView({ hidden: ["a", "x"], transparent: ["x"], colors: { x: "#000000", a: "#111111" } }, all)).toEqual({ hidden: ["a"], transparent: [], colors: { a: "#111111" } });
    expect(VS.sameView({ hidden: ["b", "a"], transparent: [], colors: {} }, { hidden: ["a", "b"], transparent: [], colors: {} })).toBe(true);
    expect(VS.sameView(s, s0)).toBe(false);
  });

  it("hidden list follows the display order", () => {
    const items = all.map((id) => ({ id, name: id.toUpperCase() }));
    expect(VS.hiddenList({ hidden: ["d", "b"], transparent: [], colors: {} }, items).map((i) => i.name)).toEqual(["B", "D"]);
  });
});

describe("view undo stack", () => {
  it("undo / redo apply the before / after states", () => {
    let cur = VS.emptyView();
    const u = new ViewUndo<VS.ViewSt>((s) => (cur = s));
    const s1 = VS.hideItems(cur, ["a"]);
    u.push("非表示", cur, s1);
    cur = s1;
    const s2 = VS.isolateItems(cur, ["a", "b", "c"], ["c"]);
    u.push("分離", cur, s2);
    cur = s2;
    expect(u.undo()).toBe("分離");
    expect(cur.hidden).toEqual(["a"]);
    expect(u.undo()).toBe("非表示");
    expect(cur.hidden).toEqual([]);
    expect(u.undo()).toBeNull();
    expect(u.redo()).toBe("非表示");
    expect(cur.hidden).toEqual(["a"]);
    u.push("表示", cur, VS.emptyView()); // a new step clears the redo stack
    expect(u.canRedo()).toBe(false);
  });

  it("interleaves with the document history in the editing mode, view-only in the viewer", () => {
    const u = new ViewUndo<number>(() => {});
    // doc edit A (depth 1), view step V (made at depth 1), doc edit B (depth 2)
    u.push("V", 0, 1, 1);
    expect(u.wantsUndo(2, false)).toBe(false); // B is newer: the document undoes first
    expect(u.wantsUndo(1, false)).toBe(true); // after undoing B: V
    expect(u.wantsUndo(2, true)).toBe(true); // viewer mode: always the view stack
    u.undo();
    expect(u.wantsRedo(0, false)).toBe(false); // redo A first
    expect(u.wantsRedo(1, false)).toBe(true);
  });

  it("keeps at most `limit` steps", () => {
    const u = new ViewUndo<number>(() => {}, 3);
    for (let i = 0; i < 5; i++) u.push(String(i), i, i + 1);
    expect(u.size).toBe(3);
  });
});

describe("STEP product structure in the tree", () => {
  // bodies of a STEP assembly: path = root … instance (sub-assemblies included)
  const bodies = [
    { item: 0, path: ["組立品", "プレート:1"] },
    { item: 1, path: ["組立品", "ピン組:1", "Pin-M6:1"] },
    { item: 2, path: ["組立品", "ピン組:1", "Pin-M6:2"] },
    { item: 3, path: ["組立品", "ピン組:2", "Pin-M6:1"] },
    { item: 4 }, // a body made in the app (no path)
  ];

  it("groups by sub-assembly with every item under its instance", () => {
    const { roots, loose } = buildTree(bodies);
    expect(loose).toEqual([4]);
    expect(roots.map((r) => r.name)).toEqual(["組立品"]);
    const root = roots[0];
    expect(root.children.map((c) => c.name)).toEqual(["プレート:1", "ピン組:1", "ピン組:2"]);
    expect(nodeItems(root).sort()).toEqual([0, 1, 2, 3]);
    const sub = root.children[1];
    expect(sub.depth).toBe(1);
    expect(nodeItems(sub)).toEqual([1, 2]); // the sub-assembly hides / isolates as one unit
    expect(sub.children.map((c) => [c.name, c.items])).toEqual([["Pin-M6:1", [1]], ["Pin-M6:2", [2]]]);
    // same instance name in two sub-assemblies stays apart
    expect(nodeItems(root.children[2])).toEqual([3]);
  });

  it("assembly components: the sub-assembly path groups them", () => {
    const comps = [{ id: "c1" }, { id: "c2", path: ["サブ A"] }, { id: "c3", path: ["サブ A", "サブ B"] }];
    const { roots, loose } = buildTree(comps.map((c) => ({ item: c.id, path: c.path })));
    expect(loose).toEqual(["c1"]);
    expect(roots[0].items).toEqual(["c2"]);
    expect(nodeItems(roots[0])).toEqual(["c2", "c3"]);
  });

  it("search keeps matching items and their groups", () => {
    const { roots } = buildTree(bodies.map((b) => ({ item: { id: b.item, name: b.path?.[b.path.length - 1] ?? "x" }, path: b.path })));
    const f = filterTree(roots, (it) => it.name.includes("Pin-M6:2"), "pin-m6:2");
    expect(nodeItems(f[0]).map((i) => i.id)).toEqual([2]);
    const g = filterTree(roots, () => false, "ピン組:2"); // a group name match keeps the group
    expect(nodeItems(g[0]).map((i) => i.id)).toEqual([3]);
  });
});

describe("saved views keep colour overrides", () => {
  const st: DisplayState = {
    camera: { target: [0, 0, 0], quat: [0, 0, 0, 1], height: 100, perspective: false },
    hidden: new Set(["c2"]),
    transparent: new Set(["c3"]),
    explode: 0,
    sections: [],
    style: "shadedEdges",
    colorMode: "default",
    colors: { c1: "#ff0000", gone: "#00ff00" },
  };
  it("capture / parse / recall", () => {
    const v = captureView("v1", "V", st, ["c1", "c2", "c3"]);
    expect(v.colors).toEqual({ c1: "#ff0000" });
    const back = parseView(JSON.parse(JSON.stringify(v)))!;
    const s = viewState(back, ["c1", "c2", "c3"]);
    expect(s.colors).toEqual({ c1: "#ff0000" });
    expect(sameState(s, { ...st, colors: { c1: "#ff0000" } })).toBe(true);
    expect(sameState(s, { ...st, colors: {} })).toBe(false);
  });
});

describe("BOM: wire / pipe routes", () => {
  const cut = [
    { name: "配線1", kind: "電線", size: "AWG18", length: 123.44, margin: 10, cut: 135.8, bends: 2, bendRadius: 5 },
    { name: "ホース1", kind: "ホース", size: "φ8", length: 250, margin: 5, cut: 262.5, bends: 0, bendRadius: 20 },
  ];
  it("one row per route with its length and cut length", () => {
    expect(routeBomRows(cut)).toEqual([
      { no: "R1", name: "配線1", spec: "電線 AWG18", length: 123.44, cut: 136 },
      { no: "R2", name: "ホース1", spec: "ホース φ8", length: 250, cut: 263 },
    ]);
  });
  it("filtered by the BOM search", () => {
    expect(routeBomRows(cut, "ホース").map((r) => r.no)).toEqual(["R2"]);
    expect(routeBomRows(cut, "配管").length).toBe(2);
    expect(routeBomRows([], "")).toEqual([]);
  });
});
