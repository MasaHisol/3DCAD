// Drawing annotation automation: overlap-free dimension rows, hole tables,
// ordinate / chain dimension data and chamfer detection. Pure functions on
// view geometry (view coordinates, mm) so they can be unit tested.

import type { Vec2 } from "../core/types";
import type { ViewGeometry } from "../kernel/protocol";
import { dimText, linearPoints } from "./geom";
import type { DimAnno } from "./types";

type Circle = Extract<ViewGeometry["visible"][number], { t: "circle" }>;
type Line = Extract<ViewGeometry["visible"][number], { t: "line" }>;

/**
 * Interval stacking: assigns each interval the lowest row in which it does
 * not overlap (with `gap`) any interval already there. Shorter intervals
 * are placed first so they end up closest to the part (JIS / ISO 129).
 */
export function stackRows(items: { lo: number; hi: number }[], gap = 0): number[] {
  const order = items.map((_, i) => i).sort((a, b) => items[a].hi - items[a].lo - (items[b].hi - items[b].lo));
  const rows: { lo: number; hi: number }[][] = [];
  const out = new Array<number>(items.length).fill(0);
  for (const i of order) {
    const it = items[i];
    let r = 0;
    while (rows[r]?.some((o) => it.lo < o.hi + gap && o.lo < it.hi + gap)) r++;
    (rows[r] ??= []).push(it);
    out[i] = r;
  }
  return out;
}

/** Approximate dimension text width in sheet mm (3.5 mm font). */
export function labelWidth(d: DimAnno): number {
  const t = dimText(d);
  return (t.main.length + (t.upper || t.lower ? 4 : 0)) * 3.5 * 0.62 + 2;
}

/**
 * Rearranges the linear dimensions of a view into non-overlapping rows on
 * each side of the view (bounds in view coordinates, `scale` = sheet/view)
 * and pushes leader labels (radius / hole / diameter) apart. Returns the
 * new label positions by dimension id.
 */
export function arrangeDims(dims: DimAnno[], bounds: [number, number, number, number], scale: number): Map<string, Vec2> {
  const [x0, y0, x1, y1] = bounds;
  const out = new Map<string, Vec2>();
  const off = (row: number) => (10 + 7 * row) / scale;
  const sides: { pick: (d: DimAnno, p: [Vec2, Vec2]) => boolean; axis: 0 | 1; place: (row: number) => number }[] = [
    { pick: (d) => d.kind === "horizontal" && d.pos[1] < (y0 + y1) / 2, axis: 0, place: (r) => y0 - off(r) },
    { pick: (d) => d.kind === "horizontal" && d.pos[1] >= (y0 + y1) / 2, axis: 0, place: (r) => y1 + off(r) },
    { pick: (d) => d.kind === "vertical" && d.pos[0] < (x0 + x1) / 2, axis: 1, place: (r) => x0 - off(r) },
    { pick: (d) => d.kind === "vertical" && d.pos[0] >= (x0 + x1) / 2, axis: 1, place: (r) => x1 + off(r) },
  ];
  for (const s of sides) {
    const list: { d: DimAnno; lo: number; hi: number; mid: number }[] = [];
    for (const d of dims) {
      const p = linearPoints(d);
      if (!p || !s.pick(d, p)) continue;
      let lo = Math.min(p[0][s.axis], p[1][s.axis]), hi = Math.max(p[0][s.axis], p[1][s.axis]);
      const mid = (lo + hi) / 2;
      // a label wider than the dimension sticks out on both sides
      const w = labelWidth(d) / scale;
      if (w > hi - lo) {
        lo = mid - w / 2;
        hi = mid + w / 2;
      }
      list.push({ d, lo, hi, mid });
    }
    const rows = stackRows(list, 1 / scale);
    list.forEach((it, i) => {
      const c = s.place(rows[i]);
      out.set(it.d.id, s.axis === 0 ? [it.mid, c] : [c, it.mid]);
    });
  }
  // leader labels: push apart from each other and from the linear labels
  const boxes: { x: number; y: number; w: number; h: number }[] = [];
  for (const d of dims) {
    const p = out.get(d.id);
    if (p) boxes.push({ x: p[0], y: p[1], w: labelWidth(d) / scale, h: 4 / scale });
  }
  for (const d of dims) {
    if (d.kind !== "radius" && d.kind !== "hole" && d.kind !== "diameter") continue;
    const c = d.refs[0];
    if (!c) continue;
    let p: Vec2 = [...d.pos];
    const w = labelWidth(d) / scale, h = 4 / scale;
    const dir = [p[0] - c.p[0], p[1] - c.p[1]];
    const l = Math.hypot(dir[0], dir[1]) || 1;
    const u: Vec2 = [dir[0] / l, dir[1] / l];
    const hits = () => boxes.some((b) => Math.abs(b.x - (p[0] + w / 2)) < (b.w + w) / 2 && Math.abs(b.y - p[1]) < (b.h + h) / 2);
    for (let k = 0; k < 12 && hits(); k++) p = [p[0] + (u[0] * 5) / scale, p[1] + (u[1] * 5) / scale];
    boxes.push({ x: p[0] + w / 2, y: p[1], w, h });
    if (p[0] !== d.pos[0] || p[1] !== d.pos[1]) out.set(d.id, p);
  }
  return out;
}

export interface HoleRow {
  tag: string;
  x: number;
  y: number;
  d: number;
  c: Vec2;
}

/**
 * Hole table rows: every circle of the view, measured from `origin`; one
 * letter per hole size (A, B, …), numbered left→right, bottom→top.
 */
export function holeTable(g: ViewGeometry, origin: Vec2): HoleRow[] {
  const circles = g.visible.filter((q) => q.t === "circle") as Circle[];
  const uniq: Circle[] = [];
  for (const c of circles) if (!uniq.some((u) => Math.hypot(u.c[0] - c.c[0], u.c[1] - c.c[1]) < 1e-4 && Math.abs(u.r - c.r) < 1e-4)) uniq.push(c);
  // concentric circles (counterbores) -> keep the smallest (through hole)
  const holes = uniq.filter((c) => !uniq.some((o) => o !== c && o.r < c.r - 1e-4 && Math.hypot(o.c[0] - c.c[0], o.c[1] - c.c[1]) < 1e-4));
  const sizes = [...new Set(holes.map((c) => +(2 * c.r).toFixed(3)))].sort((a, b) => b - a);
  const rows: HoleRow[] = [];
  sizes.forEach((d, si) => {
    const letter = String.fromCharCode(65 + (si % 26));
    holes
      .filter((c) => Math.abs(2 * c.r - d) < 2e-3)
      .sort((a, b) => a.c[1] - b.c[1] || a.c[0] - b.c[0])
      .forEach((c, i) => rows.push({ tag: `${letter}${i + 1}`, x: c.c[0] - origin[0], y: c.c[1] - origin[1], d, c: c.c }));
  });
  return rows;
}

/**
 * Chamfers: short straight edges at 45° between perpendicular edges (in the
 * view plane), grouped by size. Returns one representative per size with
 * the count, e.g. { c: 2, n: 4 } → "4×C2".
 */
export function findChamfers(g: ViewGeometry): { c: number; n: number; at: Vec2; dir: Vec2 }[] {
  const lines = g.visible.filter((q) => q.t === "line") as Line[];
  const [x0, y0, x1, y1] = g.bounds;
  const span = Math.max(x1 - x0, y1 - y0);
  const near = (a: Vec2, b: Vec2) => Math.hypot(a[0] - b[0], a[1] - b[1]) < 1e-4;
  const groups = new Map<string, { c: number; n: number; at: Vec2; dir: Vec2 }>();
  for (const l of lines) {
    const dx = l.b[0] - l.a[0], dy = l.b[1] - l.a[1];
    const len = Math.hypot(dx, dy);
    if (len < 1e-4 || len > span * 0.25) continue;
    if (Math.abs(Math.abs(dx) - Math.abs(dy)) > 1e-3 * len) continue;
    // both ends must meet an axis-aligned edge
    const meets = (p: Vec2) => lines.some((o) => o !== l && (near(o.a, p) || near(o.b, p)) && (Math.abs(o.a[0] - o.b[0]) < 1e-6 || Math.abs(o.a[1] - o.b[1]) < 1e-6));
    if (!meets(l.a) || !meets(l.b)) continue;
    const c = +(len / Math.SQRT2).toFixed(3);
    const k = c.toFixed(3);
    const mid: Vec2 = [(l.a[0] + l.b[0]) / 2, (l.a[1] + l.b[1]) / 2];
    // outward direction: away from the view centre
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    let n: Vec2 = [-dy / len, dx / len];
    if ((mid[0] - cx) * n[0] + (mid[1] - cy) * n[1] < 0) n = [-n[0], -n[1]];
    const cur = groups.get(k);
    if (cur) cur.n++;
    else groups.set(k, { c, n: 1, at: mid, dir: n });
  }
  return [...groups.values()];
}

/** Sorted unique coordinates of the hole centres and outline ends along an axis (ordinate / chain dimensions). */
export function featureCoords(g: ViewGeometry, axis: 0 | 1): number[] {
  const vals: number[] = [g.bounds[axis], g.bounds[axis + 2]];
  for (const q of g.visible) if (q.t === "circle") vals.push(q.c[axis]);
  return [...new Set(vals.map((x) => +x.toFixed(4)))].sort((a, b) => a - b);
}
