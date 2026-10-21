// Kernel side of wire / pipe routing: sweeps a circle (cable) or ring (hose / pipe)
// along the filleted route path and keeps the solids for interference checks and STEP export.
import * as R from "replicad";
import type { Vec3 } from "../core/types";
import { meshBody } from "./geometry";
import type { BodyMesh, PathSeg } from "./protocol";

type Shape = R.Shape3D;

export interface RouteSolidSpec {
  id: string;
  name: string;
  path: PathSeg[];
  /** Outside / inside diameter (inside 0 = solid). */
  od: number;
  innerD: number;
}

export interface RouteSolidResult {
  id: string;
  mesh?: BodyMesh;
  volume?: number;
  error?: string;
}

/** Last built route solids (assembly coordinates). */
const solids = new Map<string, { shape: Shape; name: string }>();

const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
function unit(a: Vec3): Vec3 {
  const l = Math.hypot(...a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
}
function perp(n: Vec3): Vec3 {
  const t: Vec3 = Math.abs(n[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
  const d = t[0] * n[0] + t[1] * n[1] + t[2] * n[2];
  return unit([t[0] - n[0] * d, t[1] - n[1] * d, t[2] - n[2] * d]);
}

/** Start tangent of a path (arc: direction from a towards the chord-mid side). */
function startTangent(s: PathSeg): Vec3 {
  if (s.t === "line") return unit(sub(s.b, s.a));
  // tangent at a of the circle through a, m, b: perpendicular to (a - centre) in the arc plane
  const a = s.a, m = s.m, b = s.b;
  const u = sub(m, a), v = sub(b, a);
  const n = unit([u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]]);
  // centre: solve in plane
  const uu = u[0] * u[0] + u[1] * u[1] + u[2] * u[2], vv = v[0] * v[0] + v[1] * v[1] + v[2] * v[2], uv = u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
  const det = 2 * (uu * vv - uv * uv);
  const k1 = (vv * (uu - uv)) / det, k2 = (uu * (vv - uv)) / det;
  const c: Vec3 = [a[0] + u[0] * k1 + v[0] * k2, a[1] + u[1] * k1 + v[1] * k2, a[2] + u[2] * k1 + v[2] * k2];
  const r = sub(a, c);
  const t = unit([n[1] * r[2] - n[2] * r[1], n[2] * r[0] - n[0] * r[2], n[0] * r[1] - n[1] * r[0]]);
  return t;
}

/** Sweeps the route section along its path. */
export function routeSolid(spec: RouteSolidSpec): Shape {
  if (!spec.path.length) throw new Error("経路がありません");
  const spine = R.assembleWire(spec.path.map((s) => (s.t === "line" ? R.makeLine(s.a, s.b) : R.makeThreePointArc(s.a, s.m, s.b))) as R.Edge[]);
  const n = startTangent(spec.path[0]);
  const plane = new R.Plane(spec.path[0].a, perp(n), n);
  const sweep = (d: number) => {
    const sk = R.drawCircle(d / 2).sketchOnPlane(plane) as R.Sketch;
    return R.genericSweep(sk.wire, spine, { frenet: true, transitionMode: "round" }, false) as Shape;
  };
  let solid = sweep(spec.od);
  if (spec.innerD > 0) solid = solid.cut(sweep(spec.innerD)) as Shape;
  return solid;
}

export function buildRoutes(specs: RouteSolidSpec[]): RouteSolidResult[] {
  solids.clear();
  return specs.map((spec) => {
    try {
      const shape = routeSolid(spec);
      const vol = R.measureVolume(shape as never);
      if (!(vol > 0)) throw new Error("スイープ結果が空です");
      solids.set(spec.id, { shape, name: spec.name });
      const [lo, hi] = shape.boundingBox.bounds as [Vec3, Vec3];
      return { id: spec.id, mesh: meshBody(shape, spec.name, Math.hypot(...sub(hi, lo))), volume: vol };
    } catch (e) {
      return { id: spec.id, error: e instanceof Error ? e.message : "スイープに失敗しました (OpenCascade 例外)" };
    }
  });
}

/** Route solids for export (assembly coordinates). */
export function routeShapes(): { shape: Shape; name: string }[] {
  return [...solids.values()];
}

function overlap(a: Shape, b: Shape): boolean {
  const [a0, a1] = a.boundingBox.bounds as [Vec3, Vec3];
  const [b0, b1] = b.boundingBox.bounds as [Vec3, Vec3];
  return a0[0] <= b1[0] && b0[0] <= a1[0] && a0[1] <= b1[1] && b0[1] <= a1[1] && a0[2] <= b1[2] && b0[2] <= a1[2];
}

/** Interference volume of each route solid with each placed component shape. */
export function routeInterference(placed: { shape: Shape; index: number }[]): { route: string; comp: number; volume: number }[] {
  const out: { route: string; comp: number; volume: number }[] = [];
  for (const [id, r] of solids)
    for (const p of placed) {
      if (!overlap(r.shape, p.shape)) continue;
      try {
        const x = r.shape.intersect(p.shape);
        const v = x && !x.isNull && x.faces.length ? R.measureVolume(x as never) : 0;
        if (v > 1e-6) {
          const prev = out.find((o) => o.route === id && o.comp === p.index);
          if (prev) prev.volume += v;
          else out.push({ route: id, comp: p.index, volume: v });
        }
      } catch {
        /* failed boolean */
      }
    }
  return out;
}
