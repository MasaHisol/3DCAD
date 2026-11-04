// 使い方ヘルプの索引検索 (DOM なし、テスト可能)。
import type { HelpPage } from "./content";

const norm = (s: string) => s.normalize("NFKC").toLowerCase().replace(/\s+/g, " ").trim();

/**
 * Pages matching every word of the query, best first: title matches, then keywords /
 * category, then the body (purpose, steps, tips). An empty query returns all pages.
 */
export function searchHelp(pages: HelpPage[], query: string): HelpPage[] {
  const words = norm(query).split(" ").filter(Boolean);
  if (!words.length) return pages.slice();
  const scored: [HelpPage, number][] = [];
  for (const p of pages) {
    const title = norm(p.title);
    const meta = norm([p.id, p.cat, ...(p.keywords ?? [])].join(" "));
    const body = norm([p.purpose, ...p.steps, ...(p.tips ?? [])].join(" "));
    let score = 0;
    for (const w of words) {
      const s = title === w ? 100 : title.startsWith(w) ? 60 : title.includes(w) ? 40 : meta.includes(w) ? 25 : body.includes(w) ? 5 : 0;
      if (!s) {
        score = 0;
        break;
      }
      score += s;
    }
    if (score) scored.push([p, score]);
  }
  return scored.sort((a, b) => b[1] - a[1]).map(([p]) => p);
}
