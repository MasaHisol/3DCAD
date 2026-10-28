// Persistent topological naming — generation side (runs in the geometry worker).
//
// Names are attached to shapes in a WeakMap (index-aligned with `shape.faces`
// and `shape.edges`, whose order OpenCascade keeps stable for one shape object).
// After every feature the new bodies get their names from:
//   1. the feature's own tool (role names: extrude caps / sides per sketch
//      segment, hole walls per point, ...), and
//   2. inheritance: a result face lying on the same underlying surface as a face
//      of an input body or tool keeps that face's name — this is what OCC's
//      BRepAlgoAPI Modified() history reports for booleans, computed
//      geometrically so it works for every operation (replicad does not expose
//      the builders), and
//   3. new faces (fillet / chamfer / shell / draft results) are named from the
//      operation role and their inherited neighbours.
// Edges are named by the faces they separate.

import * as R from "replicad";
import type { PlaneDef, Vec2, Vec3 } from "../core/types";
import type { LoopSeg } from "../sketch/profiles";
import { baseName, edgeName } from "../core/naming";
import type { RRegion } from "./protocol";
import { edgeFaceTable } from "./topo";

type Shape = R.Shape3D;

export interface TopoNames {
  faces: string[];
  edges: string[];
}

const NAMES = new WeakMap<object, TopoNames>();

export function namesOf(s: object | undefined | null): TopoNames | undefined {
  return s ? NAMES.get(s) : undefined;
}
export function setNames(s: object, n: TopoNames) {
  NAMES.set(s, n);
}

// ------------------------------------------------------------- vectors ---

const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a: Vec3) => Math.hypot(a[0], a[1], a[2]);
const unit = (a: Vec3): Vec3 => {
  const l = len(a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
const tuple = (v: R.Vector): Vec3 => v.toTuple() as Vec3;
type OcXYZ = { X(): number; Y(): number; Z(): number };
type OcAx = { Location(): OcXYZ; Direction(): OcXYZ };
const xyz = (p: OcXYZ): Vec3 => [p.X(), p.Y(), p.Z()];

// ------------------------------------------------------ surface identity ---

interface SurfDesc {
  type: string;
  /** plane normal / axis direction */
  dir?: Vec3;
  /** point on the plane / axis / centre / apex */
  at?: Vec3;
  r1?: number;
  r2?: number;
  box: [Vec3, Vec3];
  /** points on the face boundary (on the surface) */
  samples: Vec3[];
  center: Vec3;
}

const DESC = new WeakMap<object, SurfDesc[]>();

function faceDesc(f: R.Face): SurfDesc {
  const type = String(f.geomType);
  const box = f.boundingBox.bounds as [Vec3, Vec3];
  const center = tuple(f.center);
  const samples: Vec3[] = [];
  try {
    for (const e of f.edges.slice(0, 3)) samples.push(tuple(e.pointAt(0.37)));
  } catch {
    /* degenerate edges */
  }
  const d: SurfDesc = { type, box, samples, center };
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ad = (f as any)._geomAdaptor();
    if (type === "PLANE") {
      const ax: OcAx = ad.Plane().Axis();
      d.dir = unit(xyz(ax.Direction()));
      d.at = xyz(ax.Location());
    } else if (type === "CYLINDRE") {
      const c = ad.Cylinder();
      const ax: OcAx = c.Axis();
      (d.dir = unit(xyz(ax.Direction()))), (d.at = xyz(ax.Location())), (d.r1 = c.Radius());
    } else if (type === "CONE") {
      const c = ad.Cone();
      const ax: OcAx = c.Axis();
      (d.dir = unit(xyz(ax.Direction()))), (d.at = xyz(c.Apex())), (d.r1 = c.SemiAngle());
    } else if (type === "SPHERE") {
      const s = ad.Sphere();
      (d.at = xyz(s.Location())), (d.r1 = s.Radius());
    } else if (type === "TORUS") {
      const t = ad.Torus();
      const ax: OcAx = t.Axis();
      (d.dir = unit(xyz(ax.Direction()))), (d.at = xyz(ax.Location())), (d.r1 = t.MajorRadius()), (d.r2 = t.MinorRadius());
    }
  } catch {
    /* fall back to samples */
  }
  return d;
}

const FACES = new WeakMap<object, R.Face[]>();

/** Face wrappers of a shape (explored once per shape object). */
function facesOf(s: Shape): R.Face[] {
  let f = FACES.get(s);
  if (!f) {
    f = s.faces;
    FACES.set(s, f);
  }
  return f;
}

/**
 * Descriptions of faces already described (input bodies / tools of the current
 * step), by OCC hash: a result face that is the very same TopoDS face (same
 * TShape, location and orientation) reuses its description instead of
 * re-measuring it — booleans leave most faces of a large body untouched.
 */
let descPool: Map<number, { face: R.Face; desc: SurfDesc }[]> | null = null;

function descs(s: Shape): SurfDesc[] {
  let d = DESC.get(s);
  if (!d) {
    d = facesOf(s).map((f) => {
      const hit = descPool?.get(f.hashCode)?.find((x) => x.face.isEqual(f));
      return hit ? hit.desc : faceDesc(f);
    });
    DESC.set(s, d);
  }
  return d;
}

function poolOf(shapes: Shape[]): Map<number, { face: R.Face; desc: SurfDesc }[]> {
  const pool = new Map<number, { face: R.Face; desc: SurfDesc }[]>();
  for (const s of shapes) {
    const d = DESC.get(s);
    if (!d) continue;
    facesOf(s).forEach((face, i) => {
      const h = face.hashCode;
      const l = pool.get(h);
      if (l) l.push({ face, desc: d[i] });
      else pool.set(h, [{ face, desc: d[i] }]);
    });
  }
  return pool;
}

/** Distance from p to the line (o, dir). */
function lineDist(p: Vec3, o: Vec3, dir: Vec3): number {
  const w = sub(p, o);
  return len(cross(w, dir));
}

function sameSurface(a: SurfDesc, b: SurfDesc, tol: number): boolean {
  if (a.type !== b.type) return false;
  const par = (x?: Vec3, y?: Vec3) => !!x && !!y && Math.abs(Math.abs(dot(x, y)) - 1) < 1e-7;
  switch (a.type) {
    case "PLANE":
      return par(a.dir, b.dir) && Math.abs(dot(sub(a.at!, b.at!), a.dir!)) < tol;
    case "CYLINDRE":
      return par(a.dir, b.dir) && lineDist(b.at!, a.at!, a.dir!) < tol && Math.abs(a.r1! - b.r1!) < tol;
    case "CONE":
      return par(a.dir, b.dir) && len(sub(a.at!, b.at!)) < tol && Math.abs(Math.abs(a.r1!) - Math.abs(b.r1!)) < 1e-7;
    case "SPHERE":
      return len(sub(a.at!, b.at!)) < tol && Math.abs(a.r1! - b.r1!) < tol;
    case "TORUS":
      return par(a.dir, b.dir) && len(sub(a.at!, b.at!)) < tol && Math.abs(a.r1! - b.r1!) < tol && Math.abs(a.r2! - b.r2!) < tol;
    default:
      return false;
  }
}

function boxContains(outer: [Vec3, Vec3], inner: [Vec3, Vec3], tol: number): boolean {
  for (let i = 0; i < 3; i++) if (inner[0][i] < outer[0][i] - tol || inner[1][i] > outer[1][i] + tol) return false;
  return true;
}
function boxGap(a: [Vec3, Vec3], b: [Vec3, Vec3]): number {
  let g = 0;
  for (let i = 0; i < 3; i++) g = Math.max(g, a[0][i] - b[1][i], b[0][i] - a[1][i]);
  return g;
}

/** Free-form faces: boundary samples of `out` lie on the source face. */
function liesOn(out: SurfDesc, srcFace: R.Face, src: SurfDesc, tol: number): boolean {
  if (out.type !== src.type || !out.samples.length || boxGap(out.box, src.box) > tol) return false;
  try {
    for (const p of out.samples.slice(0, 2)) if (R.measureDistanceBetween(R.makeVertex(p), srcFace as never) > tol) return false;
    return true;
  } catch {
    return false;
  }
}

// ------------------------------------------------------------ sources ---

export interface NameSource {
  shape: Shape;
  names: TopoNames;
  /** Earlier sources win ties (input bodies before tools). */
  priority: number;
}

export interface NamingHints {
  /** fillet / chamfer: edges that were rounded, with the faces they separated. */
  blends?: { edge: string; faces: string[] }[];
  /** shell / thicken: offset distance of new faces from their source face. */
  offset?: number;
}

/**
 * Name the faces / edges of `body` (a result of feature `fid`) from the sources.
 */
export function nameFromSources(body: Shape, sources: NameSource[], fid: string, diag: number, hints: NamingHints = {}): TopoNames {
  const tol = Math.max(1e-6, diag * 1e-7) * 100;
  const faces = facesOf(body);
  const srcData = sources.map((s) => ({ s, d: descs(s.shape), f: null as R.Face[] | null }));
  if (!DESC.has(body)) {
    descPool = poolOf(sources.map((s) => s.shape).filter((x) => x !== body));
    try {
      descs(body);
    } finally {
      descPool = null;
    }
  }
  const out = descs(body);
  const names: (string | null)[] = faces.map(() => null);
  out.forEach((od, i) => {
    let best: { name: string; rank: number } | null = null;
    for (const sd of srcData)
      sd.d.forEach((d, j) => {
        let hit = sameSurface(od, d, tol);
        if (!hit && !["PLANE", "CYLINDRE", "CONE", "SPHERE", "TORUS"].includes(od.type)) {
          sd.f ??= facesOf(sd.s.shape);
          hit = liesOn(od, sd.f[j], d, tol);
        }
        if (!hit) return;
        // prefer the source face that contains the result face, then the nearest, then input order
        const rank = (boxContains(d.box, od.box, tol * 10) ? 0 : 1e6 + boxGap(d.box, od.box)) + sd.s.priority * 1e-3;
        const nm = sd.s.names.faces[j];
        if (nm && (!best || rank < best.rank)) best = { name: baseName(nm), rank };
      });
    if (best) names[i] = (best as { name: string }).name;
  });
  // adjacency
  let edgeW: R.Edge[] | null = null;
  const edgesOf = () => (edgeW ??= body.edges);
  const edgeFaces = edgeFaceTable(body) ?? slowEdgeFaces(faces, edgesOf());
  const faceAdj: Set<number>[] = faces.map(() => new Set());
  for (const fl of edgeFaces) for (const a of fl) for (const b of fl) if (a !== b) faceAdj[a].add(b);
  // new faces
  const inherited = names.slice();
  names.forEach((n, i) => {
    if (n) return;
    const adj = [...faceAdj[i]].map((k) => inherited[k]).filter((x): x is string => !!x);
    const blend = hints.blends?.find((b) => b.faces.length >= 2 && b.faces.every((f) => adj.includes(baseName(f))));
    if (blend) names[i] = `${fid}:blend(${blend.edge})`;
    else if (hints.offset !== undefined) {
      const od = out[i];
      let src: string | null = null;
      for (const sd of srcData)
        sd.d.forEach((d, j) => {
          if (src || d.type !== od.type || !d.dir || !od.dir || Math.abs(Math.abs(dot(d.dir, od.dir)) - 1) > 1e-6) return;
          const off = od.type === "PLANE" ? Math.abs(dot(sub(od.at!, d.at!), d.dir)) : Math.abs((od.r1 ?? 0) - (d.r1 ?? 0));
          if (Math.abs(off - Math.abs(hints.offset!)) < tol * 10 && boxGap(d.box, od.box) <= Math.abs(hints.offset!) + tol) src = sd.s.names.faces[j];
        });
      names[i] = src ? `${fid}:offset(${baseName(src)})` : null;
    }
    if (!names[i]) names[i] = adj.length ? `${fid}:gen(${[...new Set(adj)].sort().join(",")})` : `${fid}:new`;
  });
  const faceNames = dedupe(names as string[], out.map((d) => d.center));
  const edgeNames = dedupe(
    edgeFaces.map((fl) => edgeName(fl.map((k) => faceNames[k]))),
    (i) => {
      try {
        return tuple(edgesOf()[i].pointAt(0.5));
      } catch {
        return [0, 0, 0] as Vec3;
      }
    },
  );
  return { faces: faceNames, edges: edgeNames };
}

/** Edge -> faces table through replicad wrappers (fallback of edgeFaceTable). */
function slowEdgeFaces(faces: R.Face[], edges: R.Edge[]): number[][] {
  const edgeIdx = new Map<number, number[]>();
  edges.forEach((e, i) => {
    const h = e.hashCode;
    if (!edgeIdx.has(h)) edgeIdx.set(h, []);
    edgeIdx.get(h)!.push(i);
  });
  const edgeFaces: number[][] = edges.map(() => []);
  faces.forEach((f, fi) => {
    for (const e of f.edges) {
      const list = edgeIdx.get(e.hashCode);
      if (!list) continue;
      const ei = list.length === 1 ? list[0] : list.find((k) => edges[k].isSame(e));
      if (ei === undefined) continue;
      if (!edgeFaces[ei].includes(fi)) edgeFaces[ei].push(fi);
    }
  });
  return edgeFaces;
}

/**
 * Make names unique within a body: duplicates get "~1", "~2", … ordered along
 * the direction in which the duplicates are spread the most (stable under
 * moves of the whole group).
 */
export function dedupe(names: string[], posOf: Vec3[] | ((i: number) => Vec3)): string[] {
  // positions are only needed for duplicated names (computed lazily, once each)
  const memo = new Map<number, Vec3>();
  const P = (i: number): Vec3 => {
    if (typeof posOf !== "function") return posOf[i];
    let v = memo.get(i);
    if (!v) memo.set(i, (v = posOf(i)));
    return v;
  };
  const groups = new Map<string, number[]>();
  names.forEach((n, i) => {
    if (!groups.has(n)) groups.set(n, []);
    groups.get(n)!.push(i);
  });
  const out = names.slice();
  for (const [n, idx] of groups) {
    if (idx.length < 2) continue;
    const lo: Vec3 = [Infinity, Infinity, Infinity], hi: Vec3 = [-Infinity, -Infinity, -Infinity];
    for (const i of idx)
      for (let k = 0; k < 3; k++) {
        lo[k] = Math.min(lo[k], P(i)[k]);
        hi[k] = Math.max(hi[k], P(i)[k]);
      }
    const spread = [0, 1, 2].map((k) => hi[k] - lo[k]);
    const order = [0, 1, 2].sort((a, b) => spread[b] - spread[a]);
    const key = (i: number) => order.map((k) => Math.round(P(i)[k] * 1e4) / 1e4);
    idx.sort((a, b) => {
      const ka = key(a), kb = key(b);
      for (let k = 0; k < 3; k++) if (ka[k] !== kb[k]) return ka[k] - kb[k];
      return a - b;
    });
    idx.forEach((i, k) => (out[i] = `${n}~${k + 1}`));
  }
  return out;
}

/** Names for a freshly built tool shape from per-face role names. */
export function nameTool(shape: Shape, role: (f: R.Face, i: number, d: SurfDesc) => string): TopoNames {
  const d = descs(shape);
  const faceRoles = shape.faces.map((f, i) => role(f, i, d[i]));
  return nameFromSources(shape, [{ shape, names: { faces: faceRoles, edges: [] }, priority: 0 }], "", 1);
}

// ---------------------------------------------------- role names: tools ---

function segDist(p: Vec2, s: LoopSeg): { d: number; interior: boolean } {
  if (s.t === "line") {
    const dx = s.b[0] - s.a[0], dy = s.b[1] - s.a[1];
    const L2 = dx * dx + dy * dy || 1;
    const u = ((p[0] - s.a[0]) * dx + (p[1] - s.a[1]) * dy) / L2;
    const uc = Math.max(0, Math.min(1, u));
    const d = Math.hypot(p[0] - (s.a[0] + dx * uc), p[1] - (s.a[1] + dy * uc));
    return { d, interior: u > 1e-4 && u < 1 - 1e-4 };
  }
  if (s.t === "circle") return { d: Math.abs(Math.hypot(p[0] - s.c[0], p[1] - s.c[1]) - s.r), interior: true };
  // arc through a, m, b
  const c = circleCentre(s.a, s.m, s.b);
  if (!c) return { d: Infinity, interior: false };
  const r = Math.hypot(s.a[0] - c[0], s.a[1] - c[1]);
  const d = Math.abs(Math.hypot(p[0] - c[0], p[1] - c[1]) - r);
  const near = (q: Vec2) => Math.hypot(p[0] - q[0], p[1] - q[1]) < 1e-4 * Math.max(1, r);
  return { d, interior: !near(s.a) && !near(s.b) && onArc(p, s, c) };
}

function circleCentre(a: Vec2, b: Vec2, c: Vec2): Vec2 | null {
  const d = 2 * (a[0] * (b[1] - c[1]) + b[0] * (c[1] - a[1]) + c[0] * (a[1] - b[1]));
  if (Math.abs(d) < 1e-12) return null;
  const a2 = a[0] * a[0] + a[1] * a[1], b2 = b[0] * b[0] + b[1] * b[1], c2 = c[0] * c[0] + c[1] * c[1];
  return [(a2 * (b[1] - c[1]) + b2 * (c[1] - a[1]) + c2 * (a[1] - b[1])) / d, (a2 * (c[0] - b[0]) + b2 * (a[0] - c[0]) + c2 * (b[0] - a[0])) / d];
}

function onArc(p: Vec2, s: Extract<LoopSeg, { t: "arc" }>, c: Vec2): boolean {
  const ang = (q: Vec2) => Math.atan2(q[1] - c[1], q[0] - c[0]);
  const norm = (x: number) => ((x % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  const a = ang(s.a), m = norm(ang(s.m) - a), b = norm(ang(s.b) - a), t = norm(ang(p) - a);
  return m < b ? t < b : t > b;
}

function segKey(s: LoopSeg & { src?: string }, ri: number, li: number, si: number): string {
  return s.src ?? `r${ri}l${li}s${si}`;
}

function toPlane2(plane: PlaneDef, p: Vec3): Vec2 {
  const y = cross(plane.normal, plane.xDir);
  const w = sub(p, plane.origin);
  return [dot(w, plane.xDir), dot(w, y)];
}

/** Sketch segment a side face was swept from (by its boundary edges projected onto the sketch plane). */
function sideSegment(f: R.Face, plane: PlaneDef, regions: RRegion[], inPlaneOnly: boolean, tol: number): string | null {
  const votes = new Map<string, number>();
  for (const e of f.edges) {
    let p: Vec3;
    try {
      p = tuple(e.pointAt(0.5));
    } catch {
      continue;
    }
    if (inPlaneOnly && Math.abs(dot(sub(p, plane.origin), plane.normal)) > tol) continue;
    const q = toPlane2(plane, p);
    regions.forEach((r, ri) =>
      [r.outer, ...r.holes].forEach((loop, li) =>
        loop.forEach((s, si) => {
          const m = segDist(q, s);
          if (m.d < tol && m.interior) {
            const k = segKey(s, ri, li, si);
            votes.set(k, (votes.get(k) ?? 0) + 1);
          }
        }),
      ),
    );
  }
  if (!votes.size) return null;
  return [...votes.entries()].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))[0][0];
}

/** Extrude / revolve / sweep tool: caps and one side face per sketch segment. */
export function nameProfileTool(fid: string, tool: Shape, plane: PlaneDef, regions: RRegion[], kind: "extrude" | "revolve" | "sweep", diag: number): TopoNames {
  const tol = Math.max(1e-5, diag * 1e-6);
  const n = plane.normal;
  return nameTool(tool, (f, _i, d) => {
    if (kind === "extrude" && d.type === "PLANE" && d.dir && Math.abs(Math.abs(dot(d.dir, n)) - 1) < 1e-7) {
      const off = dot(sub(d.at!, plane.origin), n);
      return `${fid}:${off <= 1e-9 ? "start" : "end"}`;
    }
    const seg = sideSegment(f, plane, regions, kind !== "extrude", tol);
    if (seg) return `${fid}:side:${seg}`;
    // revolve / sweep caps (planar, not swept from a segment)
    if (d.type === "PLANE" && d.dir && Math.abs(Math.abs(dot(d.dir, n)) - 1) < 1e-7 && Math.abs(dot(sub(d.at!, plane.origin), n)) < tol) return `${fid}:start`;
    return `${fid}:${kind === "extrude" ? "side" : "end"}`;
  });
}

/** Hole tool: per point, the drilled wall, counterbore / countersink, floors. */
export function nameHoleTool(fid: string, tool: Shape, plane: PlaneDef, points: Vec2[], diameter: number): TopoNames {
  const n = plane.normal;
  const pts3 = points.map((uv) => {
    const y = cross(n, plane.xDir);
    return [0, 1, 2].map((k) => plane.origin[k] + plane.xDir[k] * uv[0] + y[k] * uv[1]) as Vec3;
  });
  const nearest = (c: Vec3) => {
    let bi = 0, bd = Infinity;
    pts3.forEach((p, i) => {
      const d = lineDist(c, p, n);
      if (d < bd) (bd = d), (bi = i);
    });
    return bi;
  };
  return nameTool(tool, (_f, _i, d) => {
    const at = d.type === "CYLINDRE" || d.type === "CONE" ? d.at! : d.center;
    const p = nearest(at);
    if (d.type === "CYLINDRE") return `${fid}:${Math.abs(d.r1! * 2 - diameter) < 1e-6 ? "wall" : "cbwall"}:p${p}`;
    if (d.type === "CONE") return `${fid}:cs:p${p}`;
    if (d.type === "PLANE") return `${fid}:floor:p${p}`;
    return `${fid}:${d.type.toLowerCase()}:p${p}`;
  });
}

/** Any other tool: names by surface type (duplicates ordered geometrically). */
export function nameGenericTool(fid: string, tool: Shape): TopoNames {
  return nameTool(tool, (_f, _i, d) => `${fid}:${d.type.toLowerCase()}`);
}

/** Names of a transformed copy (pattern instance k). */
export function copyNames(n: TopoNames, suffix: string): TopoNames {
  return { faces: n.faces.map((x) => `${x}@${suffix}`), edges: [] };
}
