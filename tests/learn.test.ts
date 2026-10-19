import { beforeAll, describe, expect, it } from "vitest";
import opencascade from "replicad-opencascadejs";
import { setOC } from "replicad";
import { GeometryEngine } from "../src/kernel/geometry";
import { evaluateParams } from "../src/core/params";
import { newDocument, ORIGIN_PLANES } from "../src/core/document";
import { ensureSheetStyle } from "../src/sheetmetal/sheet";
import { prepareDocument, resolveDocument } from "../src/core/resolve";
import type { Feature, PartDocument, PlaneDef, SketchFeature, SkEntity } from "../src/core/types";
import { newAssembly } from "../src/assembly/types";
import { sampleDocument } from "../src/samples";
import { ALL_LESSONS, CURRICULUM, EXERCISES, GLOSSARY, findLesson } from "../src/learn/curriculum";
import { blockStarter, pinAssemblyStarter, plateStarter } from "../src/learn/starters";
import { features, has, usesUserParam } from "../src/learn/checks";
import type { LearnState } from "../src/learn/types";
import ribbonSrc from "../src/ui/ribbonTabs.ts?raw";
import asmSrc from "../src/assembly/env.ts?raw";
import drawingSrc from "../src/drawing/env.ts?raw";

beforeAll(async () => {
  const OC = await (opencascade as unknown as () => Promise<unknown>)();
  setOC(OC as never);
}, 60000);

function state(part: PartDocument, over: Partial<LearnState> = {}): LearnState {
  return {
    env: "part",
    mode: "model",
    part,
    asm: newAssembly(),
    values: evaluateParams(part.params),
    command: null,
    sketch: null,
    bodies: 1,
    errors: 0,
    style: "shadedEdges",
    section: false,
    realistic: false,
    analysisDone: false,
    ...over,
  };
}

async function build(doc: PartDocument) {
  const values = evaluateParams(doc.params);
  prepareDocument(doc, values);
  const res = resolveDocument(doc, values);
  expect(res.errors).toEqual({});
  const eng = new GeometryEngine();
  const r = await eng.rebuild(res.features);
  expect(r.errors).toEqual({});
  return { bodies: r.bodies.length, volume: eng.massProps().volume };
}

const stepCheck = (lessonId: string, i: number) => findLesson(lessonId)!.steps[i].check!;

describe("curriculum", () => {
  it("has unique ids and well-formed lessons and quizzes", () => {
    const ids = ALL_LESSONS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(CURRICULUM.length).toBeGreaterThanOrEqual(7);
    for (const l of ALL_LESSONS) {
      expect(l.steps.length, l.id).toBeGreaterThan(2);
      expect(l.goals.length, l.id).toBeGreaterThan(0);
      expect(l.summary.length, l.id).toBeGreaterThan(0);
      expect(l.quiz.length, l.id).toBeGreaterThan(0);
      // every lesson checks at least part of the work automatically
      expect(l.steps.some((s) => s.check), l.id).toBe(true);
      for (const q of l.quiz) {
        expect(q.answer).toBeGreaterThanOrEqual(0);
        expect(q.answer).toBeLessThan(q.choices.length);
        expect(q.explain.length).toBeGreaterThan(0);
      }
    }
    expect(new Set(EXERCISES.map((e) => e.id)).size).toBe(EXERCISES.length);
    expect(new Set(GLOSSARY.map((g) => g.term)).size).toBe(GLOSSARY.length);
  });

  it("only points at ribbon commands and tabs that exist", () => {
    const src = [ribbonSrc, asmSrc, drawingSrc].join("\n");
    const known = new Set<string>();
    for (const m of src.matchAll(/id: "([\w-]+)"/g)) known.add(m[1]);
    for (const m of src.matchAll(/\bcmd\("([\w-]+)"/g)) known.add(m[1]);
    for (const m of src.matchAll(/\bsk\("([\w-]+)"/g)) known.add(`sk-${m[1]}`);
    for (const m of src.matchAll(/\bt\("([\w-]+)"/g)) known.add(`dw-${m[1]}`);
    for (const l of ALL_LESSONS)
      for (const s of l.steps) {
        if (s.tab) expect(known.has(s.tab), `${l.id}: tab ${s.tab}`).toBe(true);
        for (const u of [s.ui ?? []].flat()) if (!/^[.#[]/.test(u)) expect(known.has(u), `${l.id}: ${u}`).toBe(true);
      }
  });

  it("starts the first steps unfinished on the lesson's own setup", () => {
    for (const l of ALL_LESSONS) {
      if (l.setup.kind === "assembly") continue;
      const doc = l.setup.kind === "part" ? l.setup.make() : newDocument();
      const first = l.steps.findIndex((s) => s.check);
      expect(l.steps[first].check!(state(doc)), `${l.id} step ${first + 1}`).toBe(false);
    }
  });
});

describe("starter models", () => {
  it("block builds as 60 × 40 × 15", async () => {
    const r = await build(blockStarter());
    expect(r.bodies).toBe(1);
    expect(r.volume).toBeCloseTo(60 * 40 * 15, 3);
  }, 60000);

  it("plate builds with one through hole; a 2 × 2 pattern gives four", async () => {
    const plate = plateStarter();
    const one = await build(plateStarter());
    const hole = Math.PI * 4.5 * 4.5 * 8;
    expect(one.volume).toBeCloseTo(100 * 60 * 8 - hole, 1);

    // what the learner builds in lesson 3-5 (default directions, no flip)
    plate.params.push({ name: "d20", expr: "2", unit: "ul", kind: "model", owner: "rp1" }, { name: "d21", expr: "80", unit: "mm", kind: "model", owner: "rp1" });
    plate.features.push({ id: "rp1", type: "rectPattern", name: "矩形状パターン1", features: ["ho1"], axis: "X", count: "d20", spacing: "d21", axis2: "", count2: "1", spacing2: "40", flip: false });
    plate.endOfPart = plate.features.length;
    const two = await build(plate);
    expect(two.volume).toBeCloseTo(100 * 60 * 8 - 2 * hole, 1);
    expect(stepCheck("3-5", 0)(state(plate))).toBe(true);
    expect(stepCheck("3-5", 1)(state(plate))).toBe(false);

    const rp = plate.features.at(-1) as { axis2: string; count2: string };
    rp.axis2 = "Z";
    rp.count2 = "2";
    const four = await build(plate);
    expect(four.bodies).toBe(1);
    expect(four.volume).toBeCloseTo(100 * 60 * 8 - 4 * hole, 1);
    expect(stepCheck("3-5", 1)(state(plate))).toBe(true);
    expect(stepCheck("3-5", 2)(state(plate))).toBe(false);
    plate.params.find((p) => p.owner === "ho1" && p.expr === "9")!.expr = "11";
    expect(stepCheck("3-5", 2)(state(plate))).toBe(true);
  }, 60000);

  it("pin assembly starts without constraints", () => {
    const asm = pinAssemblyStarter();
    expect(asm.components.length).toBe(2);
    expect(asm.constraints.length).toBe(0);
    const s = state(newDocument(), { env: "assembly", asm });
    expect(stepCheck("5-1", 1)(s)).toBe(false);
  });
});

describe("step checks", () => {
  it("ignores the live preview of a feature until its command is closed", () => {
    const doc = blockStarter();
    expect(has(state(doc), "extrude")).toBe(true);
    expect(features(state(doc, { command: "extrude" }), "extrude").length).toBe(0);
  });

  it("follows the parametric lesson (4-1)", () => {
    const doc = blockStarter();
    expect(stepCheck("4-1", 0)(state(doc))).toBe(false);
    doc.params.push({ name: "幅", expr: "60", unit: "mm", kind: "user" });
    expect(stepCheck("4-1", 0)(state(doc))).toBe(true);
    expect(usesUserParam(state(doc))).toBe(false);
    doc.params.find((p) => p.name === "d0")!.expr = "幅";
    expect(stepCheck("4-1", 1)(state(doc))).toBe(true);
    doc.params.find((p) => p.name === "d4")!.expr = "幅 / 4";
    expect(stepCheck("4-1", 2)(state(doc))).toBe(true);
    expect(stepCheck("4-1", 3)(state(doc))).toBe(false);
    doc.params.find((p) => p.name === "幅")!.expr = "100";
    expect(stepCheck("4-1", 3)(state(doc))).toBe(true);
  });

  it("does not mistake a parameter name inside another for a reference", () => {
    const doc = blockStarter();
    doc.params.push({ name: "幅", expr: "60", unit: "mm", kind: "user" }, { name: "幅2", expr: "10", unit: "mm", kind: "user" });
    doc.params.find((p) => p.name === "d0")!.expr = "幅2 * 6";
    expect(usesUserParam(state(doc))).toBe(true); // 幅2 is itself a user parameter
    doc.params.splice(doc.params.findIndex((p) => p.name === "幅2"), 1);
    doc.params.find((p) => p.name === "d0")!.expr = "幅2x";
    expect(usesUserParam(state(doc))).toBe(false);
  });

  it("recognises a fully constrained sketch with the right dimensions (2-2)", () => {
    const doc = blockStarter();
    const sk = doc.features[0] as SketchFeature;
    doc.params.find((p) => p.name === "d0")!.expr = "80";
    doc.params.find((p) => p.name === "d1")!.expr = "50";
    const s = state(doc, { mode: "sketch", sketch: { id: sk.id, tool: "select", dof: 0, ok: true } });
    expect(stepCheck("2-2", 0)(s)).toBe(true);
    expect(stepCheck("2-2", 1)(s)).toBe(true);
    expect(stepCheck("2-2", 2)(s)).toBe(true);
    expect(stepCheck("2-2", 3)(s)).toBe(true);
    expect(stepCheck("2-2", 4)(s)).toBe(true);
    expect(stepCheck("2-2", 4)({ ...s, sketch: { ...s.sketch!, dof: 2 } })).toBe(false);
  });

  it("checks the sample bracket against exercise 1", () => {
    const doc = sampleDocument();
    const ex = EXERCISES.find((e) => e.id === "ex-bracket")!;
    const res = ex.requirements.map((r) => r.check(state(doc)));
    // the sample has holes, a pattern, a fillet, user parameters and aluminium
    expect(res.every(Boolean)).toBe(true);
    expect(ex.requirements.every((r) => !r.check(state(newDocument(), { bodies: 0 })))).toBe(true);
  });
});

const sk = (id: string, plane: PlaneDef, entities: SkEntity[], planeRef?: string): SketchFeature => ({
  id, type: "sketch", name: id, plane, planeLabel: "", planeRef,
  entities: [{ id: "origin", type: "point", x: 0, y: 0, fixed: true, ref: true }, ...entities], constraints: [], dimensions: [],
});
const rect = (w: number, d: number): SkEntity[] => [
  { id: "a", type: "point", x: -w / 2, y: -d / 2 }, { id: "b", type: "point", x: w / 2, y: -d / 2 },
  { id: "c", type: "point", x: w / 2, y: d / 2 }, { id: "d", type: "point", x: -w / 2, y: d / 2 },
  { id: "l1", type: "line", p1: "a", p2: "b" }, { id: "l2", type: "line", p1: "b", p2: "c" },
  { id: "l3", type: "line", p1: "c", p2: "d" }, { id: "l4", type: "line", p1: "d", p2: "a" },
];
function finish(doc: PartDocument, ...f: Feature[]) {
  doc.features.push(...f);
  doc.endOfPart = doc.features.length;
  return doc;
}

describe("applied modelling lessons (chapter 8)", () => {
  it("8-1: an L-shaped path swept with a circle builds and completes the sweep step", async () => {
    const doc = finish(
      newDocument(),
      sk("p", ORIGIN_PLANES.XY, [{ id: "a", type: "point", x: 0, y: 60 }, { id: "b", type: "point", x: 80, y: 60 }, { id: "l1", type: "line", p1: "origin", p2: "a" }, { id: "l2", type: "line", p1: "a", p2: "b" }]),
      sk("c", ORIGIN_PLANES.XZ, [{ id: "C", type: "circle", c: "origin", r: 6 }]),
      { id: "sw", type: "sweep", name: "スイープ1", sketch: "c", profiles: [0], profilePts: [[0, 0]], path: "p", op: "new" },
    );
    const r = await build(doc);
    expect(r.bodies).toBe(1);
    expect(r.volume).toBeCloseTo(Math.PI * 36 * 140, -1);
    expect(stepCheck("8-1", 5)(state(doc))).toBe(true);
  }, 60000);

  it("8-2: rectangle to circle loft on a work plane builds and completes the loft step", async () => {
    const doc = newDocument();
    doc.params.push({ name: "d0", expr: "40", unit: "mm", kind: "model", owner: "wp" });
    finish(
      doc,
      { id: "wp", type: "workplane", name: "作業平面1", base: ORIGIN_PLANES.XZ, baseLabel: "XZ 平面", offset: "d0" },
      sk("r", ORIGIN_PLANES.XZ, rect(60, 40)),
      sk("ci", { origin: [0, 40, 0], xDir: [1, 0, 0], normal: [0, 1, 0] }, [{ id: "C", type: "circle", c: "origin", r: 15 }], "wp"),
      { id: "lf", type: "loft", name: "ロフト1", sketches: ["r", "ci"], op: "new", ruled: false },
    );
    const r = await build(doc);
    expect(r.bodies).toBe(1);
    // between the prism of the circle and that of the rectangle
    expect(r.volume).toBeGreaterThan(Math.PI * 225 * 40);
    expect(r.volume).toBeLessThan(60 * 40 * 40);
    const s = state(doc);
    expect([0, 1, 2, 3].map((i) => stepCheck("8-2", i)(s))).toEqual([true, true, true, true]);
  }, 60000);

  it("8-3: sheet metal face with two flanges builds and completes its steps", async () => {
    const doc = newDocument();
    ensureSheetStyle(doc);
    doc.params.push({ name: "d0", expr: "20", unit: "mm", kind: "model", owner: "fl" }, { name: "d1", expr: "90", unit: "deg", kind: "model", owner: "fl" });
    finish(
      doc,
      sk("r", ORIGIN_PLANES.XZ, rect(100, 60)),
      { id: "sf", type: "sheetFace", name: "面1", sketch: "r", profiles: [0], profilePts: [[0, 0]], op: "new", flip: false },
      { id: "fl", type: "flange", name: "フランジ1", base: "sf", edges: [[0, -30], [0, 30]], height: "d0", angle: "d1", down: false },
    );
    const r = await build(doc);
    expect(r.bodies).toBe(1);
    expect(r.volume).toBeGreaterThan(100 * 60 * 2);
    const s = state(doc);
    expect([0, 1, 2].map((i) => stepCheck("8-3", i)(s))).toEqual([true, true, true]);
    expect(EXERCISES.find((e) => e.id === "ex-sheet")!.requirements[1].check(s)).toBe(true);
  }, 60000);
});
