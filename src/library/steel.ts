// Structural steel sections for the frame generator (JIS G 3192 / G 3466 /
// G 3444 / G 3194 representative sizes, corner radii omitted).

import type { Vec2 } from "../core/types";

export type SectionKind = "sqtube" | "rectube" | "pipe" | "angle" | "channel" | "hbeam" | "flat";

export interface SteelSize {
  name: string;
  /** H (depth), B (width), t1 (web / wall), t2 (flange) in mm; pipes: D, t. */
  d: number[];
}

export const STEEL: { kind: SectionKind; label: string; std: string; sizes: SteelSize[] }[] = [
  {
    kind: "sqtube",
    label: "角形鋼管",
    std: "JIS G 3466 STKR",
    sizes: [[25, 1.6], [30, 2.3], [40, 2.3], [50, 2.3], [50, 3.2], [60, 3.2], [75, 3.2], [100, 3.2], [100, 4.5], [125, 4.5], [150, 6]].map(([a, t]) => ({ name: `□${a}×${a}×${t}`, d: [a, a, t] })),
  },
  {
    kind: "rectube",
    label: "長方形鋼管",
    std: "JIS G 3466 STKR",
    sizes: [[50, 25, 1.6], [60, 30, 2.3], [75, 45, 2.3], [100, 50, 2.3], [100, 50, 3.2], [125, 75, 3.2], [150, 100, 4.5]].map(([h, b, t]) => ({ name: `□${h}×${b}×${t}`, d: [h, b, t] })),
  },
  {
    kind: "pipe",
    label: "鋼管",
    std: "JIS G 3444 STK",
    sizes: [[21.7, 2], [27.2, 2.3], [34, 2.3], [42.7, 2.3], [48.6, 2.3], [60.5, 2.3], [76.3, 2.8], [89.1, 3.2], [114.3, 3.5]].map(([D, t]) => ({ name: `φ${D}×${t}`, d: [D, t] })),
  },
  {
    kind: "angle",
    label: "等辺山形鋼",
    std: "JIS G 3192",
    sizes: [[30, 3], [40, 3], [40, 5], [50, 4], [50, 6], [65, 6], [75, 6], [75, 9], [90, 10], [100, 10]].map(([a, t]) => ({ name: `L${a}×${a}×${t}`, d: [a, a, t] })),
  },
  {
    kind: "channel",
    label: "溝形鋼",
    std: "JIS G 3192",
    sizes: [[75, 40, 5, 7], [100, 50, 5, 7.5], [125, 65, 6, 8], [150, 75, 6.5, 10], [200, 80, 7.5, 11]].map(([h, b, t1, t2]) => ({ name: `[${h}×${b}×${t1}×${t2}`, d: [h, b, t1, t2] })),
  },
  {
    kind: "hbeam",
    label: "H形鋼",
    std: "JIS G 3192",
    sizes: [[100, 100, 6, 8], [125, 125, 6.5, 9], [150, 150, 7, 10], [148, 100, 6, 9], [200, 100, 5.5, 8], [200, 200, 8, 12], [250, 125, 6, 9], [300, 150, 6.5, 9]].map(([h, b, t1, t2]) => ({ name: `H${h}×${b}×${t1}×${t2}`, d: [h, b, t1, t2] })),
  },
  {
    kind: "flat",
    label: "平鋼",
    std: "JIS G 3194",
    sizes: [[25, 6], [32, 6], [38, 9], [50, 6], [50, 9], [65, 9], [75, 9], [100, 9], [100, 12]].map(([b, t]) => ({ name: `FB${b}×${t}`, d: [b, t] })),
  },
];

/** Section outline loops (local x = width, y = depth, centred on the centroid box). */
export type Loop = { pts: Vec2[] } | { r: number };
export interface SectionShape {
  outer: Loop;
  holes: Loop[];
  /** Area mm². */
  area: number;
  /** Bounding box size [width, depth]. */
  size: Vec2;
}

const rect = (w: number, h: number): Vec2[] => [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]];
const polyArea = (p: Vec2[]) => Math.abs(p.reduce((s, a, i) => s + a[0] * p[(i + 1) % p.length][1] - p[(i + 1) % p.length][0] * a[1], 0)) / 2;

export function sectionShape(kind: SectionKind, d: number[]): SectionShape {
  switch (kind) {
    case "sqtube":
    case "rectube": {
      const [h, b, t] = d;
      return { outer: { pts: rect(b, h) }, holes: [{ pts: rect(b - 2 * t, h - 2 * t) }], area: b * h - (b - 2 * t) * (h - 2 * t), size: [b, h] };
    }
    case "pipe": {
      const [D, t] = d;
      return { outer: { r: D / 2 }, holes: [{ r: D / 2 - t }], area: (Math.PI / 4) * (D * D - (D - 2 * t) ** 2), size: [D, D] };
    }
    case "flat": {
      const [b, t] = d;
      return { outer: { pts: rect(b, t) }, holes: [], area: b * t, size: [b, t] };
    }
    case "angle": {
      const [a, , t] = d;
      // heel at the box corner (-a/2, -a/2)
      const o = -a / 2;
      const pts: Vec2[] = [[o, o], [o + a, o], [o + a, o + t], [o + t, o + t], [o + t, o + a], [o, o + a]];
      return { outer: { pts }, holes: [], area: polyArea(pts), size: [a, a] };
    }
    case "channel": {
      const [h, b, t1, t2] = d;
      const x0 = -b / 2, y0 = -h / 2;
      const pts: Vec2[] = [[x0, y0], [x0 + b, y0], [x0 + b, y0 + t2], [x0 + t1, y0 + t2], [x0 + t1, y0 + h - t2], [x0 + b, y0 + h - t2], [x0 + b, y0 + h], [x0, y0 + h]];
      return { outer: { pts }, holes: [], area: polyArea(pts), size: [b, h] };
    }
    case "hbeam": {
      const [h, b, t1, t2] = d;
      const X = b / 2, Y = h / 2, w = t1 / 2, f = Y - t2;
      const pts: Vec2[] = [[-X, -Y], [X, -Y], [X, -f], [w, -f], [w, f], [X, f], [X, Y], [-X, Y], [-X, f], [-w, f], [-w, -f], [-X, -f]];
      return { outer: { pts }, holes: [], area: polyArea(pts), size: [b, h] };
    }
  }
}

export function findSize(kind: SectionKind, name: string): SteelSize | undefined {
  return STEEL.find((s) => s.kind === kind)?.sizes.find((z) => z.name === name);
}

/** Unit mass kg/m for steel (7.85 g/cm³). */
export const unitMass = (area: number) => area * 7.85e-3;

type V3 = [number, number, number];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const len = (a: V3) => Math.hypot(a[0], a[1], a[2]);

export interface CutRow {
  section: string;
  length: number;
  /** End cut angles from square (deg). */
  angles: [number, number];
  qty: number;
  mass: number;
}

/**
 * Member joints: for each end of each member, the other member meeting it
 * end-to-end (for miters), and the cut list grouped by section / length / end cuts.
 */
export function frameJoints(members: { a: V3; b: V3 }[], tol = 1e-3): { end: 0 | 1; other: number; otherEnd: 0 | 1 }[][] {
  const out = members.map(() => [] as { end: 0 | 1; other: number; otherEnd: 0 | 1 }[]);
  members.forEach((m, i) =>
    ([0, 1] as const).forEach((e) => {
      const p = e ? m.b : m.a;
      const hits: { other: number; otherEnd: 0 | 1 }[] = [];
      members.forEach((n, j) => {
        if (j === i) return;
        if (len(sub(n.a, p)) < tol) hits.push({ other: j, otherEnd: 0 });
        else if (len(sub(n.b, p)) < tol) hits.push({ other: j, otherEnd: 1 });
      });
      // miters only where exactly two members meet
      if (hits.length === 1) out[i].push({ end: e, ...hits[0] });
    }),
  );
  return out;
}

/** Miter angle (deg from square) for a joint between members meeting at an end. */
export function miterAngle(m: { a: V3; b: V3 }, end: 0 | 1, n: { a: V3; b: V3 }, nEnd: 0 | 1): number {
  const P = end ? m.b : m.a;
  const d1 = sub(end ? m.a : m.b, P), d2 = sub(nEnd ? n.a : n.b, P);
  const c = (d1[0] * d2[0] + d1[1] * d2[1] + d1[2] * d2[2]) / (len(d1) * len(d2));
  const between = Math.acos(Math.max(-1, Math.min(1, c)));
  return 90 - (between * 180) / Math.PI / 2;
}

export function cutList(members: { a: V3; b: V3 }[], section: string, area: number, miter: boolean): CutRow[] {
  const joints = frameJoints(members);
  const rows: CutRow[] = [];
  members.forEach((m, i) => {
    const L = len(sub(m.b, m.a));
    const ang: [number, number] = [0, 0];
    if (miter)
      for (const j of joints[i]) {
        const a = miterAngle(m, j.end, members[j.other], j.otherEnd);
        if (a > 0.01) ang[j.end] = +a.toFixed(1);
      }
    const key = (r: CutRow) => Math.abs(r.length - L) < 0.05 && [...r.angles].sort().join() === [...ang].sort().join();
    const row = rows.find(key);
    if (row) {
      row.qty++;
      row.mass += (unitMass(area) * L) / 1000;
    } else rows.push({ section, length: +L.toFixed(1), angles: ang, qty: 1, mass: (unitMass(area) * L) / 1000 });
  });
  return rows.sort((a, b) => b.length - a.length);
}
