// DXF output of section outlines (断面形状の DXF 出力): exact section curves
// from the kernel (src/kernel/section.ts) written with the drawing DXF writer,
// outlines on VISIBLE, hatching on HATCH (same patterns as the drawings).
import { DxfWriter, hatchLines } from "./dxf";
import { hatchPatternFor } from "../core/hatchStyle";
import type { SectionResult } from "../kernel/section";

export interface SectionDxfOptions {
  /** Hatch the enclosed areas (default true). */
  hatch?: boolean;
  /** Labels of the sections (e.g. "X = 12.5"), written under each one. */
  labels?: string[];
  /** Pattern key per source index (part id / material). */
  patternOf?: (source: number) => number | string | undefined;
}

export function sectionBounds(r: SectionResult): [number, number, number, number] {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const add = (x: number, y: number) => ((x0 = Math.min(x0, x)), (y0 = Math.min(y0, y)), (x1 = Math.max(x1, x)), (y1 = Math.max(y1, y)));
  for (const e of r.entities) {
    if (e.t === "line") (add(...e.a), add(...e.b));
    else if (e.t === "poly") e.pts.forEach((p) => add(...p));
    else (add(e.c[0] - e.r, e.c[1] - e.r), add(e.c[0] + e.r, e.c[1] + e.r));
  }
  return x0 <= x1 ? [x0, y0, x1, y1] : [0, 0, 0, 0];
}

/** One DXF with the given sections laid out left to right (each in its plane's 2D frame). */
export function sectionsToDxf(results: SectionResult[], opt: SectionDxfOptions = {}): string {
  const w = new DxfWriter();
  let cursor = 0;
  results.forEach((r, k) => {
    const [x0, y0, x1, y1] = sectionBounds(r);
    const size = Math.max(x1 - x0, y1 - y0, 1);
    // the first section at its true plane coordinates, the others to its right
    const dx = k === 0 ? 0 : cursor - x0;
    cursor = x1 + dx + size * 0.25;
    const P = (p: [number, number]): [number, number] => [p[0] + dx, p[1]];
    for (const e of r.entities) {
      if (e.t === "line") w.line(...P(e.a), ...P(e.b), "VISIBLE");
      else if (e.t === "circle") w.circle(...P(e.c), e.r, "VISIBLE");
      else if (e.t === "arc") w.arc(...P(e.c), e.r, e.a0, e.a1, "VISIBLE");
      else w.polyline(e.pts.map(P), e.closed, "VISIBLE");
    }
    if (opt.hatch !== false && r.loops.length) {
      // one pattern per part, like the 3D caps
      for (const si of new Set(r.loopSource)) {
        const pat = hatchPatternFor(opt.patternOf ? opt.patternOf(si) : si);
        const rings = r.loops.filter((_, i) => r.loopSource[i] === si).map((l) => l.map(P));
        for (const a of pat.cross ? [pat.angle, pat.angle + 90] : [pat.angle]) for (const s of hatchLines(rings, pat.spacing, a)) w.line(s[0], s[1], s[2], s[3], "HATCH");
      }
    }
    const label = opt.labels?.[k];
    if (label) w.text(x0 + dx, y0 - size * 0.08 - 3.5, 3.5, label);
  });
  return w.toString();
}
