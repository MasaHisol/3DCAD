// Closed-profile ("region") detection for sketches, like Inventor's profile
// picking: curves are split at their intersections, a planar graph is built
// and its faces are traced. Nested loops become holes of the enclosing region.

import type { SkArc, SkCircle, SkEntity, SkLine, SkPoint, Vec2 } from "../core/types";

export type LoopSeg =
  | { t: "line"; a: Vec2; b: Vec2 }
  | { t: "arc"; a: Vec2; b: Vec2; m: Vec2 }
  | { t: "circle"; c: Vec2; r: number };

export interface Region {
  outer: LoopSeg[];
  holes: LoopSeg[][];
  /** Polygonised outer / hole loops for hit testing and display. */
  outerPoly: Vec2[];
  holePolys: Vec2[][];
  area: number;
  /** Region lies inside a hole of another region (e.g. the disk in a washer). */
  island: boolean;
}

type Curve =
  | { kind: "line"; a: Vec2; b: Vec2 }
  | { kind: "arc"; c: Vec2; r: number; t0: number; t1: number };

const TOL = 1e-6;
const TAU = Math.PI * 2;

function curvePoint(c: Curve, u: number): Vec2 {
  if (c.kind === "line") return [c.a[0] + (c.b[0] - c.a[0]) * u, c.a[1] + (c.b[1] - c.a[1]) * u];
  return [c.c[0] + c.r * Math.cos(u), c.c[1] + c.r * Math.sin(u)];
}

function normAngle(t: number, t0: number): number {
  let a = (t - t0) % TAU;
  if (a < 0) a += TAU;
  return t0 + a;
}

/** Parameter of a point known to be on the curve, or null if outside its range. */
function paramOn(c: Curve, p: Vec2): number | null {
  if (c.kind === "line") {
    const dx = c.b[0] - c.a[0], dy = c.b[1] - c.a[1];
    const L2 = dx * dx + dy * dy;
    const u = ((p[0] - c.a[0]) * dx + (p[1] - c.a[1]) * dy) / L2;
    const tol = TOL / Math.sqrt(L2);
    return u >= -tol && u <= 1 + tol ? Math.min(1, Math.max(0, u)) : null;
  }
  const t = normAngle(Math.atan2(p[1] - c.c[1], p[0] - c.c[0]), c.t0);
  const tol = TOL / c.r;
  if (t <= c.t1 + tol) return Math.min(t, c.t1);
  if (t >= c.t0 + TAU - tol) return c.t0; // wraps onto the start point
  return null;
}

function circleOf(c: Curve): [Vec2, number] | null {
  return c.kind === "arc" ? [c.c, c.r] : null;
}

function intersect(c1: Curve, c2: Curve): Vec2[] {
  if (c1.kind === "line" && c2.kind === "line") {
    const [x1, y1] = c1.a, [x2, y2] = c1.b, [x3, y3] = c2.a, [x4, y4] = c2.b;
    const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (Math.abs(den) < 1e-12) {
      // collinear overlap: endpoints of one lying on the other
      const out: Vec2[] = [];
      for (const p of [c2.a, c2.b]) if (distToLine(p, c1) < TOL) out.push(p);
      for (const p of [c1.a, c1.b]) if (distToLine(p, c2) < TOL) out.push(p);
      return out;
    }
    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
    return [[x1 + t * (x2 - x1), y1 + t * (y2 - y1)]];
  }
  if (c1.kind === "line" || c2.kind === "line") {
    const l = (c1.kind === "line" ? c1 : c2) as Extract<Curve, { kind: "line" }>;
    const [cc, r] = circleOf(c1.kind === "line" ? c2 : c1)!;
    const dx = l.b[0] - l.a[0], dy = l.b[1] - l.a[1];
    const fx = l.a[0] - cc[0], fy = l.a[1] - cc[1];
    const a = dx * dx + dy * dy, b = 2 * (fx * dx + fy * dy), c = fx * fx + fy * fy - r * r;
    let disc = b * b - 4 * a * c;
    if (disc < -1e-9 * a * r) return [];
    disc = Math.max(0, disc);
    const s = Math.sqrt(disc);
    const ts = s < 1e-12 ? [-b / (2 * a)] : [(-b - s) / (2 * a), (-b + s) / (2 * a)];
    return ts.map((t) => [l.a[0] + t * dx, l.a[1] + t * dy] as Vec2);
  }
  const [p0, r0] = circleOf(c1)!, [p1, r1] = circleOf(c2)!;
  const d = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]);
  if (d < 1e-12 || d > r0 + r1 + TOL || d < Math.abs(r0 - r1) - TOL) return [];
  const a = (r0 * r0 - r1 * r1 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, r0 * r0 - a * a));
  const mx = p0[0] + (a * (p1[0] - p0[0])) / d, my = p0[1] + (a * (p1[1] - p0[1])) / d;
  if (h < 1e-12) return [[mx, my]];
  const ox = (h * (p1[1] - p0[1])) / d, oy = (h * (p1[0] - p0[0])) / d;
  return [
    [mx + ox, my - oy],
    [mx - ox, my + oy],
  ];
}

function distToLine(p: Vec2, l: Extract<Curve, { kind: "line" }>): number {
  const u = paramOn(l, p);
  if (u === null) return Infinity;
  const q = curvePoint(l, u);
  return Math.hypot(p[0] - q[0], p[1] - q[1]);
}

interface Edge {
  curve: Curve;
  u0: number;
  u1: number;
  v0: number;
  v1: number;
}

interface HalfEdge {
  e: Edge;
  fwd: boolean;
  from: number;
  to: number;
  angle: number;
  used: boolean;
  twin?: HalfEdge;
}

/** Converts sketch entities into profile curves (construction geometry excluded). */
export function sketchCurves(entities: SkEntity[]): Curve[] {
  const pts = new Map<string, SkPoint>();
  for (const e of entities) if (e.type === "point") pts.set(e.id, e);
  const P = (id: string): Vec2 => {
    const p = pts.get(id)!;
    return [p.x, p.y];
  };
  const out: Curve[] = [];
  for (const e of entities) {
    if (e.construction) continue;
    if (e.type === "line") {
      const l = e as SkLine;
      const a = P(l.p1), b = P(l.p2);
      if (Math.hypot(b[0] - a[0], b[1] - a[1]) > TOL) out.push({ kind: "line", a, b });
    } else if (e.type === "circle") {
      const c = e as SkCircle;
      if (c.r > TOL) out.push({ kind: "arc", c: P(c.c), r: c.r, t0: 0, t1: TAU });
    } else if (e.type === "arc") {
      const a = e as SkArc;
      const c = P(a.c), p1 = P(a.p1), p2 = P(a.p2);
      const r = Math.hypot(p1[0] - c[0], p1[1] - c[1]);
      const t0 = Math.atan2(p1[1] - c[1], p1[0] - c[0]);
      let t1 = normAngle(Math.atan2(p2[1] - c[1], p2[0] - c[0]), t0);
      if (t1 - t0 < 1e-9) t1 += TAU;
      if (r > TOL) out.push({ kind: "arc", c, r, t0, t1 });
    }
  }
  return out;
}

export function findRegions(entities: SkEntity[]): Region[] {
  const curves = sketchCurves(entities);
  if (!curves.length) return [];

  // 1. split parameters
  const splits: number[][] = curves.map((c) => (c.kind === "line" ? [0, 1] : [c.t0, c.t1]));
  for (let i = 0; i < curves.length; i++)
    for (let j = i + 1; j < curves.length; j++) {
      for (const p of intersect(curves[i], curves[j])) {
        const ui = paramOn(curves[i], p), uj = paramOn(curves[j], p);
        if (ui === null || uj === null) continue;
        splits[i].push(ui);
        splits[j].push(uj);
      }
    }

  // 2. vertices + edges
  const verts: Vec2[] = [];
  const vid = (p: Vec2) => {
    for (let k = 0; k < verts.length; k++) if (Math.hypot(verts[k][0] - p[0], verts[k][1] - p[1]) < 1e-5) return k;
    verts.push(p);
    return verts.length - 1;
  };
  let edges: Edge[] = [];
  curves.forEach((c, i) => {
    const us = [...new Set(splits[i])].sort((a, b) => a - b);
    const clean: number[] = [];
    const span = c.kind === "line" ? 1 : c.t1 - c.t0;
    for (const u of us) if (!clean.length || u - clean[clean.length - 1] > 1e-9 * Math.max(1, span)) clean.push(u);
    for (let k = 0; k + 1 < clean.length; k++) {
      const u0 = clean[k], u1 = clean[k + 1];
      const a = curvePoint(c, u0), b = curvePoint(c, u1);
      const v0 = vid(a), v1 = vid(b);
      const len = c.kind === "line" ? Math.hypot(b[0] - a[0], b[1] - a[1]) : c.r * (u1 - u0);
      if (len < 1e-7) continue;
      edges.push({ curve: c, u0, u1, v0, v1 });
    }
  });

  // 3. prune dangling edges (vertices of degree 1)
  for (;;) {
    const deg = new Map<number, number>();
    for (const e of edges) {
      deg.set(e.v0, (deg.get(e.v0) ?? 0) + 1);
      deg.set(e.v1, (deg.get(e.v1) ?? 0) + 1);
    }
    const keep = edges.filter((e) => (deg.get(e.v0)! > 1 && deg.get(e.v1)! > 1) || e.v0 === e.v1);
    if (keep.length === edges.length) break;
    edges = keep;
  }
  if (!edges.length) return [];

  // 4. half edges with departure angle (sampled slightly along the curve so
  //    tangent curves are ordered by curvature)
  const out = new Map<number, HalfEdge[]>();
  const halves: HalfEdge[] = [];
  const depart = (e: Edge, fwd: boolean): number => {
    const from = fwd ? e.u0 : e.u1;
    const span = e.u1 - e.u0;
    const u = from + (fwd ? 1 : -1) * span * 1e-3;
    const p0 = curvePoint(e.curve, from), p1 = curvePoint(e.curve, u);
    return Math.atan2(p1[1] - p0[1], p1[0] - p0[0]);
  };
  for (const e of edges) {
    const h1: HalfEdge = { e, fwd: true, from: e.v0, to: e.v1, angle: depart(e, true), used: false };
    const h2: HalfEdge = { e, fwd: false, from: e.v1, to: e.v0, angle: depart(e, false), used: false };
    h1.twin = h2;
    h2.twin = h1;
    for (const h of [h1, h2]) {
      halves.push(h);
      if (!out.has(h.from)) out.set(h.from, []);
      out.get(h.from)!.push(h);
    }
  }
  for (const list of out.values()) list.sort((a, b) => a.angle - b.angle);

  // 5. trace faces: next = outgoing edge just clockwise of the twin
  const faces: HalfEdge[][] = [];
  for (const h0 of halves) {
    if (h0.used) continue;
    const face: HalfEdge[] = [];
    let h = h0;
    let guard = 0;
    while (!h.used && guard++ < 100000) {
      h.used = true;
      face.push(h);
      const list = out.get(h.to)!;
      const idx = list.indexOf(h.twin!);
      h = list[(idx - 1 + list.length) % list.length];
    }
    faces.push(face);
  }

  // 6. polygonise + signed area
  const toSegs = (face: HalfEdge[]): LoopSeg[] => {
    if (face.length === 1 && face[0].e.curve.kind === "arc" && face[0].e.v0 === face[0].e.v1) {
      const c = face[0].e.curve;
      return [{ t: "circle", c: c.c, r: c.r }];
    }
    return face.map((h) => {
      const a = verts[h.from], b = verts[h.to];
      if (h.e.curve.kind === "line") return { t: "line", a, b };
      return { t: "arc", a, b, m: curvePoint(h.e.curve, (h.e.u0 + h.e.u1) / 2) };
    });
  };
  const poly = (face: HalfEdge[]): Vec2[] => {
    const pts: Vec2[] = [];
    for (const h of face) {
      const c = h.e.curve;
      const n = c.kind === "line" ? 1 : Math.max(4, Math.ceil(((h.e.u1 - h.e.u0) / TAU) * 64));
      for (let k = 0; k < n; k++) {
        const s = k / n;
        const u = h.fwd ? h.e.u0 + (h.e.u1 - h.e.u0) * s : h.e.u1 - (h.e.u1 - h.e.u0) * s;
        pts.push(curvePoint(c, u));
      }
    }
    return pts;
  };
  const area = (p: Vec2[]) => {
    let s = 0;
    for (let i = 0; i < p.length; i++) {
      const [x1, y1] = p[i], [x2, y2] = p[(i + 1) % p.length];
      s += x1 * y2 - x2 * y1;
    }
    return s / 2;
  };

  // connected components (for assigning holes)
  const comp = new Map<number, number>();
  let ncomp = 0;
  for (const v of out.keys()) {
    if (comp.has(v)) continue;
    const stack = [v];
    comp.set(v, ncomp);
    while (stack.length) {
      const x = stack.pop()!;
      for (const h of out.get(x) ?? [])
        if (!comp.has(h.to)) {
          comp.set(h.to, ncomp);
          stack.push(h.to);
        }
    }
    ncomp++;
  }

  interface F {
    segs: LoopSeg[];
    poly: Vec2[];
    area: number;
    comp: number;
  }
  const bounded: F[] = [];
  const outers: F[] = [];
  for (const f of faces) {
    const p = poly(f);
    const a = area(p);
    const rec = { segs: toSegs(f), poly: p, area: a, comp: comp.get(f[0].from)! };
    if (a > 1e-9) bounded.push(rec);
    else if (a < -1e-9) outers.push(rec);
  }

  const regions: Region[] = bounded.map((f) => ({
    outer: f.segs,
    holes: [],
    outerPoly: f.poly,
    holePolys: [],
    area: f.area,
    island: false,
  }));

  // 7. holes: each component's outer boundary goes into the smallest region
  //    of another component that contains it
  const islandComps = new Set<number>();
  for (const o of outers) {
    let best = -1;
    for (let i = 0; i < bounded.length; i++) {
      const b = bounded[i];
      if (b.comp === o.comp || b.area <= -o.area) continue;
      if (!pointInPoly(o.poly[0], b.poly)) continue;
      // reject if inside one of b's existing holes? handled by "smallest" rule
      if (best < 0 || b.area < bounded[best].area) best = i;
    }
    if (best >= 0) {
      const reversed = reverseLoop(o.segs);
      regions[best].holes.push(reversed);
      regions[best].holePolys.push([...o.poly].reverse());
      regions[best].area += o.area;
      islandComps.add(o.comp);
    }
  }
  bounded.forEach((b, i) => (regions[i].island = islandComps.has(b.comp)));
  return regions;
}

function reverseLoop(segs: LoopSeg[]): LoopSeg[] {
  return [...segs].reverse().map((s) => {
    if (s.t === "line") return { t: "line", a: s.b, b: s.a };
    if (s.t === "arc") return { t: "arc", a: s.b, b: s.a, m: s.m };
    return s;
  });
}

export function pointInPoly(p: Vec2, poly: Vec2[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

export function pointInRegion(p: Vec2, r: Region): boolean {
  return pointInPoly(p, r.outerPoly) && !r.holePolys.some((h) => pointInPoly(p, h));
}

/** Default profile selection: all non-island regions. */
export function defaultProfiles(regions: Region[]): number[] {
  if (regions.length === 1) return [0];
  return regions.map((r, i) => (r.island ? -1 : i)).filter((i) => i >= 0);
}
