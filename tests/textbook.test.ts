import { describe, expect, it } from "vitest";
import { CHAPTERS, PARTS, TEXT_GLOSSARY } from "../src/textbook/content";
import { WIDGET_NAMES } from "../src/textbook/widgets";
import { ALL_LESSONS } from "../src/learn/curriculum";
import { TEXTBOOK_TITLES } from "../src/learn/textbookLink";

describe("textbook content", () => {
  it("has well-formed chapters in every part", () => {
    const ids = CHAPTERS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const p of PARTS) expect(CHAPTERS.filter((c) => c.part === p.id).length, p.id).toBeGreaterThanOrEqual(4);
    for (const c of CHAPTERS) {
      expect(c.points.length, c.id).toBeGreaterThan(0);
      expect(c.quiz.length, c.id).toBeGreaterThanOrEqual(2);
      expect(c.exercises.length, c.id).toBeGreaterThan(0);
      for (const q of c.quiz) {
        expect(q.answer, `${c.id}: ${q.q}`).toBeGreaterThanOrEqual(0);
        expect(q.answer, `${c.id}: ${q.q}`).toBeLessThan(q.choices.length);
      }
      // balanced markup for the tags we use
      for (const tag of ["div", "table", "ul", "ol", "section", "svg", "p"]) {
        const open = (c.body.match(new RegExp(`<${tag}[\\s>]`, "g")) ?? []).length;
        const close = (c.body.match(new RegExp(`</${tag}>`, "g")) ?? []).length;
        expect(close, `${c.id}: <${tag}>`).toBe(open);
      }
    }
  });

  it("only embeds calculators that exist", () => {
    const used = new Set<string>();
    for (const c of CHAPTERS) for (const m of c.body.matchAll(/data-widget="([\w-]+)"/g)) used.add(m[1]);
    for (const w of used) expect(WIDGET_NAMES, w).toContain(w);
    // every calculator is used somewhere
    for (const w of WIDGET_NAMES) expect(used, w).toContain(w);
  });

  it("links to existing lessons, and lessons link to existing chapters", () => {
    const lessons = new Set(ALL_LESSONS.map((l) => l.id));
    for (const c of CHAPTERS) for (const l of c.lessons ?? []) expect(lessons.has(l), `${c.id} → ${l}`).toBe(true);
    const chapters = new Set(CHAPTERS.map((c) => c.id));
    for (const l of ALL_LESSONS) for (const c of l.see ?? []) expect(chapters.has(c), `${l.id} → ${c}`).toBe(true);
    expect(Object.keys(TEXTBOOK_TITLES).sort()).toEqual([...chapters].sort());
  });

  it("has a glossary without duplicate terms", () => {
    const terms = TEXT_GLOSSARY.map((g) => g.term);
    expect(new Set(terms).size).toBe(terms.length);
    expect(terms.length).toBeGreaterThan(60);
  });
});
