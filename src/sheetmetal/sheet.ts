// Sheet metal (Inventor sheet metal part): a base face of constant
// thickness plus bent flanges on its straight outer edges. The bent shape
// is analytic, so the flat pattern is computed exactly from the K factor:
//   bend allowance BA = angle(rad) * (R + K * T)

import type { LoopSeg } from "../sketch/profiles";
import type { PartDocument, PlaneDef, SheetFaceFeature, Vec2, Vec3 } from "../core/types";

export interface SheetStyle {
  thickness: number;
  radius: number;
  k: number;
}

export const STYLE_PARAMS = { thickness: "板厚", radius: "曲げ半径", kFactor: "K係数" } as const;

/** Create the sheet metal style parameters on first use. */
export function ensureSheetStyle(doc: PartDocument) {
  if (doc.sheetMetal) return;
  const add = (name: string, expr: string, unit: "mm" | "ul", comment: string) => {
    if (!doc.params.some((p) => p.name === name)) doc.params.push({ name, expr, unit, kind: "user", comment });
  };
  add(STYLE_PARAMS.thickness, "2", "mm", "板金の板厚");
  add(STYLE_PARAMS.radius, STYLE_PARAMS.thickness, "mm", "内側曲げ半径");
  add(STYLE_PARAMS.kFactor, "0.44", "ul", "中立軸位置 (0〜1)");
  doc.sheetMetal = { thickness: STYLE_PARAMS.thickness, radius: STYLE_PARAMS.radius, kFactor: STYLE_PARAMS.kFactor };
}

export function sheetStyle(doc: PartDocument, values: Map<string, number>): SheetStyle {
  const sm = doc.sheetMetal;
  if (!sm) throw new Error("板金スタイルがありません");
  const g = (n: string, label: string) => {
    const v = values.get(n);
    if (v === undefined || !Number.isFinite(v)) throw new Error(`${label}が評価できません`);
    return v;
  };
  const s = { thickness: g(sm.thickness, "板厚"), radius: g(sm.radius, "曲げ半径"), k: g(sm.kFactor, "K係数") };
  if (!(s.thickness > 0)) throw new Error("板厚は正の値にしてください");
  if (!(s.radius >= 0)) throw new Error("曲げ半径は 0 以上にしてください");
  if (!(s.k >= 0 && s.k <= 1)) throw new Error("K係数は 0〜1 にしてください");
  return s;
}

export function bendAllowance(angleDeg: number, s: SheetStyle): number {
  return ((Math.abs(angleDeg) * Math.PI) / 180) * (s.radius + s.k * s.thickness);
}

// ------------------------------------------------------------ edges ---

export interface SheetEdge {
  a: Vec2;
  b: Vec2;
  /** Outward unit normal in the sketch plane. */
  out: Vec2;
}

/** Straight outer edges of a base face profile, with outward normals. */
export function outerEdges(outer: LoopSeg[]): SheetEdge[] {
  // orientation from the chained loop (shoelace over segment start points)
  let area = 0;
  for (const s of outer) {
    if (s.t === "circle") return [];
    area += s.a[0] * s.b[1] - s.b[0] * s.a[1];
  }
  const ccw = area > 0;
  const out: SheetEdge[] = [];
  for (const s of outer) {
    if (s.t !== "line") continue;
    const dx = s.b[0] - s.a[0], dy = s.b[1] - s.a[1];
    const l = Math.hypot(dx, dy);
    if (l < 1e-9) continue;
    // CCW loop: material on the left, outward = right-hand normal
    const n: Vec2 = ccw ? [dy / l, -dx / l] : [-dy / l, dx / l];
    out.push({ a: s.a, b: s.b, out: n });
  }
  return out;
}

export function segPointDist(p: Vec2, a: Vec2, b: Vec2): number {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const l2 = dx * dx + dy * dy || 1;
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2));
  return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
}

/** Edge of the base face matching a stored midpoint reference. */
export function matchEdge(edges: SheetEdge[], ref: Vec2, tol: number): SheetEdge | undefined {
  let best: SheetEdge | undefined, bd = Infinity;
  for (const e of edges) {
    const d = segPointDist(ref, e.a, e.b);
    if (d < bd) (bd = d), (best = e);
  }
  return bd <= tol ? best : undefined;
}

// ------------------------------------------------------------ 3D frame ---

const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a: Vec3, k: number): Vec3 => [a[0] * k, a[1] * k, a[2] * k];
const crossV = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

export function planeYDir(p: PlaneDef): Vec3 {
  return crossV(p.normal, p.xDir);
}
export function uvToWorld(p: PlaneDef, uv: Vec2): Vec3 {
  return add(p.origin, add(mul(p.xDir, uv[0]), mul(planeYDir(p), uv[1])));
}
export function uvDir(p: PlaneDef, d: Vec2): Vec3 {
  return add(mul(p.xDir, d[0]), mul(planeYDir(p), d[1]));
}

/** One bent flange, ready for the kernel: cross-section in the (out, up) frame at `origin`, extruded along `along` by `width`. */
export interface FlangeSpec {
  origin: Vec3;
  out: Vec3;
  up: Vec3;
  along: Vec3;
  width: number;
}

export function flangeSpecs(base: SheetFaceFeature, plane: PlaneDef, edges: SheetEdge[], down: boolean, s: SheetStyle): FlangeSpec[] {
  // the plate occupies [0, T] along `n` from the sketch plane
  const n = base.flip ? mul(plane.normal, -1) : plane.normal;
  return edges.map((e) => {
    const a = uvToWorld(plane, e.a);
    const along = uvDir(plane, [e.b[0] - e.a[0], e.b[1] - e.a[1]]);
    const w = Math.hypot(...along);
    return {
      // bending away from the sketch plane starts on the plate's far face
      origin: down ? add(a, mul(n, s.thickness)) : a,
      out: uvDir(plane, e.out),
      up: down ? mul(n, -1) : n,
      along: mul(along, 1 / w),
      width: w,
    };
  });
}

// --------------------------------------------------------- flat pattern ---

export interface FlatPattern {
  /** Closed outlines (sketch-plane coordinates of the base face). */
  outlines: Vec2[][];
  /** Bend centre lines with their angle (deg) and direction. */
  bends: { a: Vec2; b: Vec2; angle: number; up: boolean }[];
  bounds: [number, number, number, number];
  area: number;
}

export interface FlatInput {
  outerPoly: Vec2[];
  holePolys: Vec2[][];
  flanges: { edge: SheetEdge; angle: number; length: number; down: boolean }[];
}

/**
 * Unfold base face + flanges. Each flange becomes a rectangle attached to
 * its edge: bend zone (BA wide) followed by the straight leg.
 */
export function flatPattern(input: FlatInput, s: SheetStyle): FlatPattern {
  const outlines: Vec2[][] = [input.outerPoly, ...input.holePolys];
  const bends: FlatPattern["bends"] = [];
  let area = Math.abs(polyArea(input.outerPoly)) - input.holePolys.reduce((t, h) => t + Math.abs(polyArea(h)), 0);
  for (const f of input.flanges) {
    const ba = bendAllowance(f.angle, s);
    const total = ba + f.length;
    const { a, b, out } = f.edge;
    const o = (p: Vec2, k: number): Vec2 => [p[0] + out[0] * k, p[1] + out[1] * k];
    outlines.push([a, b, o(b, total), o(a, total)]);
    bends.push({ a: o(a, ba / 2), b: o(b, ba / 2), angle: f.angle, up: !f.down });
    area += Math.hypot(b[0] - a[0], b[1] - a[1]) * total;
  }
  const bounds: [number, number, number, number] = [Infinity, Infinity, -Infinity, -Infinity];
  for (const pl of outlines)
    for (const p of pl) {
      bounds[0] = Math.min(bounds[0], p[0]);
      bounds[1] = Math.min(bounds[1], p[1]);
      bounds[2] = Math.max(bounds[2], p[0]);
      bounds[3] = Math.max(bounds[3], p[1]);
    }
  return { outlines, bends, bounds, area };
}

function polyArea(p: Vec2[]): number {
  let a = 0;
  for (let i = 0; i < p.length; i++) {
    const q = p[(i + 1) % p.length];
    a += p[i][0] * q[1] - q[0] * p[i][1];
  }
  return a / 2;
}

/**
 * Straight leg length for a flange of outside height `height` (measured
 * perpendicular to the plate from its outer face, Inventor "外側の高さ").
 * The bend's outer arc rises (T + R)(1 - cos a), the leg rises L sin a.
 */
export function legLength(height: number, angle: number, s: SheetStyle): number {
  const a = (angle * Math.PI) / 180;
  return (height - (s.thickness + s.radius) * (1 - Math.cos(a))) / Math.sin(a);
}
