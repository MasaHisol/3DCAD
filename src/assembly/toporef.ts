// Assembly constraint references (GeoRef) resolved against a part's rebuilt
// bodies: persistent topology name first, the stored geometry as fallback.

import type { EdgeRef, FaceRef, Vec3 } from "../core/types";
import type { BodyMesh, EdgeInfo, FaceInfo } from "../kernel/protocol";
import { resolveNamed, type RefCandidate } from "../core/naming";
import type { GeoRef } from "./types";

const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const dist = (a: Vec3, b: Vec3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const norm = (a: Vec3): Vec3 => {
  const l = Math.hypot(...a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};

export function faceGeo(f: FaceInfo, want: "plane" | "axis"): { point: Vec3; dir: Vec3 } | null {
  if (want === "plane") return f.type === "PLANE" ? { point: f.center, dir: f.normal } : null;
  return f.axis ? { point: f.axis.origin, dir: f.axis.dir } : null;
}

/** Circular edges use the normal of the planar face they bound (outward). */
export function edgeGeo(e: EdgeInfo, want: "plane" | "axis", body: BodyMesh): { point: Vec3; dir: Vec3 } | null {
  if (e.type === "LINE") return want === "axis" ? { point: e.a, dir: norm([e.b[0] - e.a[0], e.b[1] - e.a[1], e.b[2] - e.a[2]]) } : null;
  if (!e.axis) return null;
  let dir = e.axis.dir;
  let best = Infinity;
  for (const f of body.faces) {
    if (f.type !== "PLANE") continue;
    if (Math.abs(Math.abs(dot(f.normal, dir)) - 1) > 1e-6) continue;
    const off = Math.abs(dot([e.axis.origin[0] - f.center[0], e.axis.origin[1] - f.center[1], e.axis.origin[2] - f.center[2]], f.normal));
    if (off > 1e-4) continue;
    const d = dist(f.center, e.axis.origin);
    if (d < best) {
      best = d;
      dir = f.normal;
    }
  }
  return { point: e.axis.origin, dir };
}

/** Face reference of a mesh face (with its topology name). */
export function meshFaceRef(b: BodyMesh, i: number): FaceRef {
  const f = b.faces[i];
  return { center: f.center, normal: f.normal, type: f.type, ...(b.faceNames?.[i] ? { name: b.faceNames[i] } : {}) };
}
export function meshEdgeRef(b: BodyMesh, i: number): EdgeRef {
  const e = b.edges[i];
  return { mid: e.mid, a: e.a, b: e.b, type: e.type, ...(b.edgeNames?.[i] ? { name: b.edgeNames[i] } : {}) };
}

/** Geometry (point + direction) of a constraint reference on the current part, or null when lost. */
export function geoFromRef(g: GeoRef, bodies: BodyMesh[]): { point: Vec3; dir: Vec3; name?: string } | null {
  const cands: RefCandidate[] = [];
  if (g.face) {
    const fr = g.face;
    bodies.forEach((b, bi) => b.faces.forEach((f, index) => cands.push({ body: bi, index, name: b.faceNames?.[index], score: dist(f.center, fr.center) + (1 - dot(f.normal, fr.normal)) * 50 + (faceGeo(f, g.geom) ? 0 : 1e6) })));
  } else if (g.edge) {
    const er = g.edge;
    bodies.forEach((b, bi) => b.edges.forEach((e, index) => cands.push({ body: bi, index, name: b.edgeNames?.[index], score: dist(e.mid, er.mid) + (edgeGeo(e, g.geom, b) ? 0 : 1e6) })));
  } else return null;
  const res = resolveNamed(g.face ? "face" : "edge", g.face?.name ?? g.edge?.name, cands, 25);
  if ("broken" in res) return null;
  const b = bodies[res.ok.body];
  const geo = g.face ? faceGeo(b.faces[res.ok.index], g.geom) : edgeGeo(b.edges[res.ok.index], g.geom, b);
  if (!geo) return null;
  // keep the user's chosen direction sense
  if (dot(geo.dir, g.dir) < 0) geo.dir = geo.dir.map((x) => -x) as Vec3;
  return { ...geo, name: res.ok.name };
}
