// Extracts the command ids of the ribbon definitions from their source text, so a test can
// check that every command (including ones other modules add later) has a help page
// without building the DOM-bound App.

export interface ScannedCommand {
  id: string;
  label: string;
}

/** Text of the function body that starts at `start` (balanced braces). */
export function ribbonSection(src: string, start: RegExp): string {
  const m = start.exec(src);
  if (!m) return "";
  let i = src.indexOf("{", m.index + m[0].length - 1);
  let depth = 0;
  const from = i;
  for (; i < src.length; i++) {
    const c = src[i];
    if (c === "{") depth++;
    else if (c === "}" && --depth === 0) break;
  }
  return src.slice(from, i + 1);
}

/**
 * Ribbon command ids in a ribbon definition source: `id: "x", label: "..."` literals,
 * `cmd("x", "label")` (part commands), `sk("x", ...)` (sketch tools, id `sk-x`) and the
 * drawing tool helper `t("x", ...)` (id `dw-x`). `{ ...cmd(...), id: "y" }` yields both.
 */
export function scanRibbonIds(section: string): ScannedCommand[] {
  const out = new Map<string, string>();
  const add = (id: string, label: string) => {
    if (!out.has(id)) out.set(id, label);
  };
  // (tab definitions `id, label, contextual / visible / panels` are not commands)
  for (const m of section.matchAll(/\bid:\s*"([\w-]+)",\s*label:\s*"([^"]*)"(?!,\s*(?:contextual|visible|panels)\b)/g)) add(m[1], m[2]);
  for (const m of section.matchAll(/(?<![\w.])cmd\("([\w-]+)",\s*"([^"]*)"/g)) add(m[1], m[2]);
  for (const m of section.matchAll(/(?<![\w.])sk\("([\w-]+)",\s*"([^"]*)"/g)) add(`sk-${m[1]}`, m[2]);
  for (const m of section.matchAll(/(?<![\w.])t\("([\w-]+)",\s*"([^"]*)"/g)) add(`dw-${m[1]}`, m[2]);
  // overridden ids: { ...cmd("extrude", "切り抜き", ...), id: "sm-cut" }
  for (const m of section.matchAll(/\.\.\.(?:cmd|sk)\("[\w-]+",\s*"([^"]*)"[^}]*?\),\s*id:\s*"([\w-]+)"/g)) add(m[2], m[1]);
  return [...out].map(([id, label]) => ({ id, label }));
}

/** Files that define ribbon commands and the regex that starts their ribbon definition. */
export const RIBBON_SOURCES: [file: string, start: RegExp][] = [
  ["src/ui/ribbonTabs.ts", /export function buildRibbonTabs\(/],
  ["src/assembly/env.ts", /\bribbonTab\(\): RibbonTab \{/],
  ["src/drawing/env.ts", /\bribbonTab\(\): RibbonTab \{/],
  ["src/ui/viewerMode.ts", /export function viewerRibbonTab\(/],
];
