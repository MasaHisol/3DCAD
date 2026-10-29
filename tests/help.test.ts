// 使い方ヘルプ: すべてのリボン コマンドにヘルプ ページがあり、リンク先 (関連コマンド・
// レッスン・座学テキストの章) が実在すること。
import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { HELP_PAGES, LESSON_TITLES } from "../src/help/content";
import { FIGURE_KINDS, figure } from "../src/help/figures";
import { RIBBON_SOURCES, ribbonSection, scanRibbonIds } from "../src/help/scan";
import { searchHelp } from "../src/help/search";
import { TEXTBOOK_TITLES } from "../src/learn/textbookTitles";
import { CURRICULUM } from "../src/learn/curriculum";

const commands = RIBBON_SOURCES.flatMap(([file, start]) => {
  expect(existsSync(file), file).toBe(true);
  const sec = ribbonSection(readFileSync(file, "utf8"), start);
  expect(sec.length, `ribbon definition in ${file}`).toBeGreaterThan(100);
  return scanRibbonIds(sec);
});
const pages = new Map(HELP_PAGES.map((p) => [p.id, p]));

describe("help coverage", () => {
  it("finds the ribbon commands", () => {
    // sanity: the scanner sees the known commands of every environment
    const ids = new Set(commands.map((c) => c.id));
    for (const id of ["sketch", "extrude", "sk-line", "sk-coincident", "sm-cut", "surf-thicken", "asm-bom", "dw-projected", "dw-close", "vw-edit", "measure", "section"]) expect(ids.has(id), id).toBe(true);
    expect(ids.has("model")).toBe(false); // tab ids are not commands
    expect(commands.length).toBeGreaterThan(160);
  });

  it("every ribbon command has a help page", () => {
    const missing = commands.filter((c) => !pages.has(c.id)).map((c) => `${c.id} (${c.label})`);
    expect(missing, `commands without help: add pages to src/help/content.ts`).toEqual([]);
  });

  it("page titles match the ribbon labels", () => {
    for (const c of commands) expect(pages.get(c.id)!.title, c.id).toContain(c.label);
  });

  it("pages are unique and complete", () => {
    expect(pages.size).toBe(HELP_PAGES.length);
    for (const p of HELP_PAGES) {
      expect(p.purpose.length, p.id).toBeGreaterThan(8);
      expect(p.steps.length, p.id).toBeGreaterThan(0);
      for (const r of p.related ?? []) expect(pages.has(r), `${p.id} → related ${r}`).toBe(true);
      for (const c of p.chapters ?? []) expect(TEXTBOOK_TITLES[c], `${p.id} → chapter ${c}`).toBeTruthy();
      for (const l of p.lessons ?? []) expect(LESSON_TITLES[l], `${p.id} → lesson ${l}`).toBeTruthy();
      if (p.fig) expect(FIGURE_KINDS).toContain(p.fig);
    }
  });

  it("lesson titles match the curriculum", () => {
    const all = new Map(CURRICULUM.flatMap((ch) => ch.lessons.map((l) => [l.id, l.title] as const)));
    for (const [id, title] of Object.entries(LESSON_TITLES)) expect(all.get(id), id).toBe(title);
  });

  it("figures are well-formed SVG", () => {
    for (const k of FIGURE_KINDS) {
      const s = figure(k);
      expect(s).toMatch(/^<figure class="help-fig"><svg [^>]*>.*<\/svg><figcaption>[^<]+<\/figcaption><\/figure>$/s);
      expect(s).not.toContain("NaN");
    }
  });

  it("searches titles, keywords and text", () => {
    expect(searchHelp(HELP_PAGES, "押し出し")[0].id).toBe("extrude");
    expect(searchHelp(HELP_PAGES, "fillet")[0].id).toBe("fillet");
    expect(searchHelp(HELP_PAGES, "bom").map((p) => p.id)).toContain("asm-bom");
    expect(searchHelp(HELP_PAGES, "断面 図面").map((p) => p.id)).toContain("dw-section");
    expect(searchHelp(HELP_PAGES, "ｓｔｅｐ").length).toBeGreaterThan(0); // full-width input
    expect(searchHelp(HELP_PAGES, "zzzz")).toEqual([]);
    expect(searchHelp(HELP_PAGES, "").length).toBe(HELP_PAGES.length);
  });
});
