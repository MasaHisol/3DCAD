import { formatNumber } from "../core/expr";
import type { Vec2, Vec3 } from "../core/types";
import type { Seg2, ViewGeometry, ViewSpec } from "../kernel/protocol";
import type { DimAnno, DView, GRef, Tolerance } from "./types";

// ------------------------------------------------------------ vector math ---

const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a: Vec3): Vec3 => {
  const l = Math.hypot(...a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
const neg = (a: Vec3): Vec3 => [-a[0], -a[1], -a[2]];
const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a: Vec3, s: number): Vec3 => [a[0] * s, a[1] * s, a[2] * s];

export function yAxisOf(v: { dir: Vec3; xAxis: Vec3 }): Vec3 {
  return cross(norm(v.dir), norm(v.xAxis));
}

/** 3D point of view coordinates (on the plane through the model origin). */
export function viewTo3d(v: DView, p: Vec2): Vec3 {
  return add(mul(norm(v.xAxis), p[0]), mul(yAxisOf(v), p[1]));
}

/** Frame of a view projected from `parent` towards a sheet direction (third angle). */
export function projectedFrame(parent: DView, side: "right" | "left" | "top" | "bottom" | "iso", sx = 1, sy = 1): { dir: Vec3; xAxis: Vec3 } {
  const x = norm(parent.xAxis), d = norm(parent.dir), y = yAxisOf(parent);
  switch (side) {
    case "right":
      return { dir: x, xAxis: neg(d) };
    case "left":
      return { dir: neg(x), xAxis: d };
    case "top":
      return { dir: y, xAxis: x };
    case "bottom":
      return { dir: neg(y), xAxis: x };
    case "iso": {
      const dir = norm(add(add(d, mul(x, sx)), mul(y, sy)));
      const up = Math.abs(dir[1]) > 0.99 ? ([0, 0, -1] as Vec3) : ([0, 1, 0] as Vec3);
      return { dir, xAxis: norm(cross(up, dir)) };
    }
  }
}

/** Kernel request for a view (section planes are derived from the parent's cutting line). */
export function viewSpec(v: DView, parent?: DView): ViewSpec {
  const spec: ViewSpec = { dir: v.dir, xAxis: v.xAxis, hidden: v.hidden };
  if (v.kind === "section" && v.section && parent) {
    spec.section = { origin: viewTo3d(parent, v.section.a), normal: v.dir };
  }
  return spec;
}

/** Section frame: looks perpendicular to the cutting line, horizontal along it. */
export function sectionFrame(parent: DView, a: Vec2, b: Vec2, flip: boolean): { dir: Vec3; xAxis: Vec3 } {
  const t = norm(add(mul(norm(parent.xAxis), b[0] - a[0]), mul(yAxisOf(parent), b[1] - a[1])));
  let n = norm(cross(t, norm(parent.dir)));
  if (flip) n = neg(n);
  // keep the section's x axis pointing like the parent's x where possible
  let xAxis = t;
  const px = norm(parent.xAxis);
  if (xAxis[0] * px[0] + xAxis[1] * px[1] + xAxis[2] * px[2] < -1e-9) xAxis = neg(xAxis);
  return { dir: n, xAxis };
}

// ----------------------------------------------------------- view mapping ---

/** View coords (mm, y up) -> sheet mm (y down). Detail views are centred on their circle. */
export function toSheet(v: DView, p: Vec2): Vec2 {
  const o = v.detail ? v.detail.c : [0, 0];
  return [v.x + (p[0] - o[0]) * v.scale, v.y - (p[1] - o[1]) * v.scale];
}

export function toView(v: DView, s: Vec2): Vec2 {
  const o = v.detail ? v.detail.c : [0, 0];
  return [(s[0] - v.x) / v.scale + o[0], -(s[1] - v.y) / v.scale + o[1]];
}

/** Sheet-space bounding box of a view's geometry. */
export function viewBox(v: DView, g: ViewGeometry | undefined): [number, number, number, number] {
  if (v.detail) {
    const r = v.detail.r * v.scale;
    return [v.x - r, v.y - r, v.x + r, v.y + r];
  }
  if (!g) return [v.x - 10, v.y - 10, v.x + 10, v.y + 10];
  const [a, b] = [toSheet(v, [g.bounds[0], g.bounds[1]]), toSheet(v, [g.bounds[2], g.bounds[3]])];
  return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])];
}

// --------------------------------------------------------------- snapping ---

export interface Snap {
  ref: GRef;
  d: number;
}

function segDist(p: Vec2, a: Vec2, b: Vec2): number {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const l2 = dx * dx + dy * dy || 1;
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2));
  return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
}

const onArc = (s: Extract<Seg2, { t: "arc" }>, p: Vec2) => {
  const a = Math.atan2(p[1] - s.c[1], p[0] - s.c[0]);
  const n = (x: number) => ((x % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  return n(a - s.a0) <= n(s.a1 - s.a0) + 1e-9;
};

/** Nearest snappable geometry: end points / centres first, then lines and circles. */
export function snapAt(g: ViewGeometry, p: Vec2, tol: number, kinds: GRef["kind"][] = ["point", "line", "circle"]): Snap | null {
  let best: Snap | null = null;
  const consider = (ref: GRef, d: number) => {
    if (!kinds.includes(ref.kind) || d > tol) return;
    if (!best || d < best.d) best = { ref, d };
  };
  for (const s of g.visible) {
    if (s.t === "line") {
      consider({ kind: "point", p: s.a }, Math.hypot(p[0] - s.a[0], p[1] - s.a[1]) * 0.6);
      consider({ kind: "point", p: s.b }, Math.hypot(p[0] - s.b[0], p[1] - s.b[1]) * 0.6);
      consider({ kind: "line", p: s.a, p2: s.b }, segDist(p, s.a, s.b));
    } else if (s.t === "circle" || s.t === "arc") {
      consider({ kind: "point", p: s.c }, Math.hypot(p[0] - s.c[0], p[1] - s.c[1]) * 0.6);
      const dc = Math.abs(Math.hypot(p[0] - s.c[0], p[1] - s.c[1]) - s.r);
      if (s.t === "circle" || onArc(s, p)) consider({ kind: "circle", p: s.c, r: s.r }, dc);
      if (s.t === "arc") {
        for (const a of [s.a0, s.a1]) {
          const e: Vec2 = [s.c[0] + s.r * Math.cos(a), s.c[1] + s.r * Math.sin(a)];
          consider({ kind: "point", p: e }, Math.hypot(p[0] - e[0], p[1] - e[1]) * 0.6);
        }
      }
    }
  }
  return best;
}

/** Re-attach a stored reference to the regenerated geometry (keeps dimensions associative). */
export function resnap(g: ViewGeometry, r: GRef, tol: number): GRef | null {
  let best: { ref: GRef; d: number } | null = null;
  for (const s of g.visible) {
    if (r.kind === "line" && s.t === "line") {
      const d = Math.min(
        Math.hypot(s.a[0] - r.p[0], s.a[1] - r.p[1]) + Math.hypot(s.b[0] - r.p2![0], s.b[1] - r.p2![1]),
        Math.hypot(s.b[0] - r.p[0], s.b[1] - r.p[1]) + Math.hypot(s.a[0] - r.p2![0], s.a[1] - r.p2![1]),
      );
      if (!best || d < best.d) best = { ref: { kind: "line", p: s.a, p2: s.b }, d };
    } else if (r.kind === "circle" && (s.t === "circle" || s.t === "arc")) {
      const d = Math.hypot(s.c[0] - r.p[0], s.c[1] - r.p[1]) + Math.abs(s.r - (r.r ?? 0));
      if (!best || d < best.d) best = { ref: { kind: "circle", p: s.c, r: s.r }, d };
    } else if (r.kind === "point") {
      const cands: Vec2[] = s.t === "line" ? [s.a, s.b] : s.t === "circle" || s.t === "arc" ? [s.c] : [];
      for (const c of cands) {
        const d = Math.hypot(c[0] - r.p[0], c[1] - r.p[1]);
        if (!best || d < best.d) best = { ref: { kind: "point", p: c }, d };
      }
    }
  }
  const found = best as { ref: GRef; d: number } | null;
  return found && found.d <= tol ? found.ref : null;
}

// ---------------------------------------------------------- measurement ---

/** Anchor points of a linear dimension. */
export function linearPoints(d: DimAnno): [Vec2, Vec2] | null {
  const [r0, r1] = d.refs;
  if (!r0) return null;
  if (!r1) return r0.kind === "line" ? [r0.p, r0.p2!] : null;
  const pt = (r: GRef) => (r.kind === "line" ? null : r.p);
  const a = pt(r0), b = pt(r1);
  if (a && b) return [a, b];
  // point/line or line/line (parallel): foot of the perpendicular
  const P = a ?? (r0.kind === "line" && r1.kind === "line" ? r1.p : b)!;
  const L = a ? r1 : r0;
  if (L.kind !== "line") return null;
  const dx = L.p2![0] - L.p[0], dy = L.p2![1] - L.p[1];
  const t = ((P[0] - L.p[0]) * dx + (P[1] - L.p[1]) * dy) / (dx * dx + dy * dy || 1);
  return [P, [L.p[0] + t * dx, L.p[1] + t * dy]];
}

export function dimValue(d: DimAnno): number {
  if (d.kind === "diameter" || d.kind === "hole") return 2 * (d.refs[0]?.r ?? 0);
  if (d.kind === "radius") return d.refs[0]?.r ?? 0;
  if (d.kind === "angle") {
    const [l1, l2] = d.refs;
    if (!l1?.p2 || !l2?.p2) return 0;
    const u = [l1.p2[0] - l1.p[0], l1.p2[1] - l1.p[1]], w = [l2.p2[0] - l2.p[0], l2.p2[1] - l2.p[1]];
    return (Math.atan2(Math.abs(u[0] * w[1] - u[1] * w[0]), Math.abs(u[0] * w[0] + u[1] * w[1])) * 180) / Math.PI;
  }
  const pts = linearPoints(d);
  if (!pts) return 0;
  const [a, b] = pts;
  if (d.kind === "horizontal") return Math.abs(b[0] - a[0]);
  if (d.kind === "vertical") return Math.abs(b[1] - a[1]);
  return Math.hypot(b[0] - a[0], b[1] - a[1]);
}

/** Main text and stacked tolerance text of a dimension (JIS style). */
/** Thread at a hole circle of a view (tapped holes get "M6 深さ12" notes). */
export function holeThread(g: ViewGeometry | undefined, ref: GRef | undefined): { name: string; depth: number | null } | null {
  if (!g || !ref || ref.r === undefined) return null;
  const t = g.threads?.find((x) => Math.hypot(x.c[0] - ref.p[0], x.c[1] - ref.p[1]) < 1e-3 && Math.abs(x.r - ref.r!) < 1e-3);
  return t ? { name: t.name, depth: t.depth } : null;
}

export function dimText(d: DimAnno, holeCount = 1, thread?: { name: string; depth: number | null } | null): { main: string; upper?: string; lower?: string; boxed?: boolean; paren?: boolean } {
  const v = dimValue(d);
  const num = formatNumber(v, d.kind === "angle" ? 1 : 2);
  let main = d.text ?? "";
  if (!main) {
    if (d.kind === "diameter") main = `φ${num}`;
    else if (d.kind === "radius") main = `R${num}`;
    else if (d.kind === "angle") main = `${num}°`;
    else if (d.kind === "hole" && thread) main = `${holeCount > 1 ? `${holeCount}×` : ""}${thread.name}${thread.depth ? ` 深さ${formatNumber(thread.depth, 2)}` : ""}`;
    else if (d.kind === "hole") main = `${holeCount > 1 ? `${holeCount}×` : ""}φ${num}`;
    else main = num;
  }
  main = `${d.prefix ?? ""}${main}${d.suffix ?? ""}`;
  const tol: Tolerance = d.tol ?? { kind: "none" };
  switch (tol.kind) {
    case "sym":
      return { main: `${main} ±${tol.value}` };
    case "dev":
      return { main, upper: signed(tol.upper), lower: signed(tol.lower) };
    case "fit":
      return { main: `${main} ${tol.fit}` };
    case "basic":
      return { main, boxed: true };
    case "ref":
      return { main, paren: true };
  }
  return { main };
}

function signed(s: string): string {
  const t = s.trim();
  if (!t || t === "0") return "0";
  return /^[+-]/.test(t) ? t : `+${t}`;
}

/** Count circles of the same radius in a view (for "4×φ6.6" hole notes). */
export function sameCircles(g: ViewGeometry, r: number): number {
  const seen = new Set<string>();
  for (const s of g.visible)
    if (s.t === "circle" && Math.abs(s.r - r) < 1e-4) seen.add(`${s.c[0].toFixed(3)},${s.c[1].toFixed(3)}`);
  return Math.max(1, seen.size);
}
