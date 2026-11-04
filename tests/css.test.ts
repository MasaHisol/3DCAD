// Stylesheets must stay well-formed: a lost brace (e.g. from a merge) silently
// disables every rule after it.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const files = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? files(join(dir, e.name)) : e.name.endsWith(".css") ? [join(dir, e.name)] : []));

describe("stylesheets", () => {
  for (const f of files("src")) {
    it(`${f} has balanced braces`, () => {
      const s = readFileSync(f, "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, '""');
      let depth = 0;
      for (const c of s) {
        if (c === "{") depth++;
        else if (c === "}") depth--;
        expect(depth, "a closing brace without an opening one").toBeGreaterThanOrEqual(0);
      }
      expect(depth, "an unclosed block").toBe(0);
    });
  }
});
