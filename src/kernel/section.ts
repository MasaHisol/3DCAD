// Exact planar sections of solids (断面の強化): BRepAlgoAPI_Section of the
// B-rep with a plane, converted to 2D entities in the plane's coordinates
// (lines, circles and arcs kept exact, other curves as polylines) plus closed
// loops for the hatched area. Runs inside the geometry worker; no THREE.

import * as R from "replicad";
import type { PlaneDef, Vec3 } from "../core/types";

const oc = () => R.getOC() as any;

export type P2 = [number, number];

export type SectionEntity =
  | { t: "line"; a: P2; b: P2 }
  | { t: "circle"; c: P2; r: number }
  /** Counter-clockwise from a0 to a1 (degrees), like DXF ARC. */
  | { t: "arc"; c: P2; r: number; a0: number; a1: number }
  | { t: "poly"; pts: P2[]; closed: boolean };

export interface SectionResult {
  plane: PlaneDef;
  entities: SectionEntity[];
  /** Closed boundary loops (sampled polygons) for hatching / area. */
  loops: P2[][];
  /** Total length of the section curves (exact curve lengths). */
  length: number;
  /** Area enclosed by the section (even-odd over the loops). */
  area: number;
  /** Index of the source item (body / component) of each entity. */
  source: number[];
  /** Index of the source item of each loop. */
  loopSource: number[];
}

const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = (a: Vec3): Vec3 => {
  const l = Math.hypot(...a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};

/** 2D frame of a plane: x = xDir, y = normal × xDir. */
export function planeFrame(p: PlaneDef) {
  const n = unit(p.normal);
  let x = unit(p.xDir);
  x = unit([x[0] - n[0] * dot(x, n), x[1] - n[1] * dot(x, n), x[2] - n[2] * dot(x, n)]);
  const y = cross(n, x);
  const o = p.origin;
  return {
    n,
    x,
    y,
    to2: (q: Vec3): P2 => {
      const d: Vec3 = [q[0] - o[0], q[1] - o[1], q[2] - o[2]];
      return [dot(d, x), dot(d, y)];
    },
  };
}

/** Signed area of a polygon (shoelace). */
export function polyArea(pts: P2[]): number {
  let a = 0;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) a += (pts[j][0] - pts[i][0]) * (pts[j][1] + pts[i][1]);
  return a / 2;
}

function inside(p: P2, poly: P2[]): boolean {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}

/** Area of nested loops by even-odd (holes subtract, islands in holes add). */
export function loopsArea(loops: P2[][]): number {
  let area = 0;
  loops.forEach((l, i) => {
    if (l.length < 3) return;
    const probe = l[0];
    let depth = 0;
    loops.forEach((o, j) => {
      if (j !== i && o.length >= 3 && Math.abs(polyArea(o)) > Math.abs(polyArea(l)) && inside(probe, o)) depth++;
    });
    area += (depth % 2 ? -1 : 1) * Math.abs(polyArea(l));
  });
  return area;
}

/** Chains open polylines into closed loops by matching end points (tolerance `tol`). */
export function chainLoops(polys: P2[][], tol: number): P2[][] {
  const left = polys.filter((p) => p.length >= 2).map((p) => p.slice());
  const loops: P2[][] = [];
  const near = (a: P2, b: P2) => Math.abs(a[0] - b[0]) <= tol && Math.abs(a[1] - b[1]) <= tol;
  while (left.length) {
    const cur = left.pop()!;
    for (let guard = 0; guard < 100000 && !near(cur[0], cur[cur.length - 1]); guard++) {
      const end = cur[cur.length - 1];
      let k = left.findIndex((p) => near(p[0], end));
      if (k >= 0) cur.push(...left.splice(k, 1)[0].slice(1));
      else if ((k = left.findIndex((p) => near(p[p.length - 1], end))) >= 0) cur.push(...left.splice(k, 1)[0].reverse().slice(1));
      else break;
    }
    if (cur.length >= 4 && near(cur[0], cur[cur.length - 1])) loops.push(cur.slice(0, -1));
  }
  return loops;
}

function ccw(a: P2, b: P2, c: P2) {
  return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
}

/**
 * Section curves of `shapes` with a plane. `deflection` is the chordal
 * tolerance of the sampled polylines (default 0.05 % of the model size).
 */
export function sectionShapes(shapes: R.AnyShape[], plane: PlaneDef, deflection?: number): SectionResult {
  const O = oc();
  const F = planeFrame(plane);
  const entities: SectionEntity[] = [];
  const source: number[] = [];
  const loops: P2[][] = [];
  const loopSource: number[] = [];
  let length = 0;
  shapes.forEach((shape, si) => {
    const raw = (shape as any).wrapped ?? shape;
    if (!raw || raw.IsNull?.()) return;
    const bb = (shape as any).boundingBox?.bounds as [Vec3, Vec3] | undefined;
    const diag = bb ? Math.hypot(bb[1][0] - bb[0][0], bb[1][1] - bb[0][1], bb[1][2] - bb[0][2]) : 100;
    const defl = deflection ?? Math.max(1e-4, diag * 5e-4);
    const pln = new O.gp_Pln(new O.gp_Pnt(...plane.origin), new O.gp_Dir(...F.n));
    const sec = new O.BRepAlgoAPI_Section(raw, pln, false);
    const polys: P2[][] = [];
    try {
      sec.Approximation(true);
      sec.ComputePCurveOn1(false);
      sec.Build(new O.Message_ProgressRange());
      if (!sec.IsDone()) return;
      const res = sec.Shape();
      for (const e0 of R.iterTopo(res, "edge")) {
        const e = O.TopoDS.Edge(e0);
        const c = new O.BRepAdaptor_Curve(e);
        try {
          const u0 = c.FirstParameter(), u1 = c.LastParameter();
          const pt = (u: number): P2 => {
            const p = c.Value(u);
            const q = F.to2([p.X(), p.Y(), p.Z()]);
            p.delete?.();
            return q;
          };
          const type = c.GetType();
          let pts: P2[];
          if (type === O.GeomAbs_CurveType.GeomAbs_Line) {
            pts = [pt(u0), pt(u1)];
            entities.push({ t: "line", a: pts[0], b: pts[1] });
            length += Math.hypot(pts[1][0] - pts[0][0], pts[1][1] - pts[0][1]);
          } else {
            const d = new O.GCPnts_TangentialDeflection(c, u0, u1, 0.1, defl, 2, 1e-9, 1e-7);
            pts = [];
            for (let i = 1; i <= d.NbPoints(); i++) {
              const p = d.Value(i);
              pts.push(F.to2([p.X(), p.Y(), p.Z()]));
            }
            d.delete();
            let circ: any = null;
            if (type === O.GeomAbs_CurveType.GeomAbs_Circle) circ = c.Circle();
            const ax = circ ? circ.Axis().Direction() : null;
            if (circ && Math.abs(Math.abs(dot([ax.X(), ax.Y(), ax.Z()], F.n)) - 1) < 1e-7) {
              const loc = circ.Location();
              const cc = F.to2([loc.X(), loc.Y(), loc.Z()]);
              const r = circ.Radius();
              length += r * Math.abs(u1 - u0);
              if (Math.abs(Math.abs(u1 - u0) - 2 * Math.PI) < 1e-9) entities.push({ t: "circle", c: cc, r });
              else {
                const a = pts[0], b = pts[pts.length - 1], m = pt((u0 + u1) / 2);
                const ang = (p: P2) => (Math.atan2(p[1] - cc[1], p[0] - cc[0]) * 180) / Math.PI;
                const isCcw = ccw(a, m, b) > 0;
                entities.push(isCcw ? { t: "arc", c: cc, r, a0: ang(a), a1: ang(b) } : { t: "arc", c: cc, r, a0: ang(b), a1: ang(a) });
              }
            } else {
              const closed = pts.length > 2 && Math.hypot(pts[0][0] - pts[pts.length - 1][0], pts[0][1] - pts[pts.length - 1][1]) < defl;
              entities.push({ t: "poly", pts, closed });
              const props = new O.GProp_GProps();
              O.BRepGProp.LinearProperties(e, props, false, false);
              length += props.Mass();
              props.delete();
            }
          }
          source.push(si);
          polys.push(pts);
        } finally {
          c.delete();
        }
      }
    } finally {
      sec.delete();
      pln.delete?.();
    }
    for (const l of chainLoops(polys, Math.max(1e-5, defl * 0.01, diag * 1e-7))) (loops.push(l), loopSource.push(si));
  });
  // area per source (overlapping parts are not merged)
  let area = 0;
  for (const si of new Set(loopSource)) area += loopsArea(loops.filter((_, i) => loopSource[i] === si));
  return { plane, entities, loops, length, area, source, loopSource };
}
