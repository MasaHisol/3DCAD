// Long synthetic part (40-80 features) for the incremental rebuild tests / benchmark.
import type { PlaneDef, Vec2 } from "../../src/core/types";
import type { RFeature, RRegion } from "../../src/kernel/protocol";

export const XY: PlaneDef = { origin: [0, 0, 0], xDir: [1, 0, 0], normal: [0, 0, 1] };

export function rectRegion(x: number, y: number, w: number, h: number): RRegion {
  const p: Vec2[] = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
  return { outer: p.map((a, i) => ({ t: "line" as const, a, b: p[(i + 1) % 4] })), holes: [] };
}

export const TOP = 20;
const top = (): PlaneDef => ({ ...XY, origin: [0, 0, TOP] });
const slot = (k: number): Vec2 => [12 + (k % 20) * 14, 12 + Math.floor(k / 20) * 34];

/**
 * Plate 300 x 160 x 20 with `n` features on top: pockets, bosses, holes,
 * hole patterns, corner fillets and one last pocket (the "late" feature).
 */
export function longModel(n = 60, width = 300): RFeature[] {
  const out: RFeature[] = [
    { id: "base", type: "extrude", plane: XY, regions: [rectRegion(0, 0, width, 160)], op: "new", from: 0, to: TOP, through: false, flip: false },
  ];
  const body = Math.max(0, n - 6);
  for (let k = 0; k < body; k++) {
    const [x, y] = slot(k);
    const kind = k % 4;
    if (kind === 0) out.push({ id: `pk${k}`, type: "extrude", plane: top(), regions: [rectRegion(x - 4, y - 4, 8, 8)], op: "cut", from: -5, to: 1, through: false, flip: false });
    else if (kind === 1) out.push({ id: `bs${k}`, type: "extrude", plane: top(), regions: [rectRegion(x - 3, y - 3, 6, 6)], op: "join", from: 0, to: 4, through: false, flip: false });
    else if (kind === 2)
      out.push({
        id: `h${k}`, type: "hole", plane: top(), points: [[x, y]], holeType: "simple", diameter: 4, depth: 8, through: false,
        cbDiameter: 0, cbDepth: 0, csDiameter: 0, csAngle: 90, flip: false,
      });
    else out.push({ id: `pt${k}`, type: "pattern", sources: [`h${k - 1}`], transforms: [{ translate: [0, 12, 0] }, { translate: [0, 22, 0] }] });
  }
  for (const [i, [x, y]] of ([[0, 0], [width, 0], [width, 160], [0, 160]] as Vec2[]).entries())
    out.push({ id: `fl${i}`, type: "fillet", edges: [{ mid: [x, y, TOP / 2] }], radius: 3 });
  out.push({ id: "last", type: "extrude", plane: top(), regions: [rectRegion(140, 150, 20, 6)], op: "cut", from: -2, to: 1, through: false, flip: false });
  return out;
}

/** Copy with the feature `id` changed by `fn`. */
export function edit(fs: RFeature[], id: string, fn: (f: RFeature) => void): RFeature[] {
  return fs.map((f) => {
    if (f.id !== id) return f;
    const c = structuredClone(f);
    fn(c);
    return c;
  });
}

/** A small change to a feature that keeps the model valid. */
export function nudge(f: RFeature, k = 1): void {
  if (f.type === "extrude") f.to += 0.5 * k;
  else if (f.type === "hole") f.diameter += 0.25 * k;
  else if (f.type === "pattern") f.transforms[0].translate = [0, 12 + 0.5 * k, 0];
  else if (f.type === "fillet") f.radius = 3 + 0.25 * k;
}
