// Kernel side of the assembly interference check (stage 2 "アセンブリの閲覧"):
// exact boolean volume per component pair, touch (contact) vs interference,
// and an optional mesh of the overlapping volume for highlighting.
import * as R from "replicad";
import type { Vec3 } from "../core/types";

type Shape = R.Shape3D;

export interface InterferenceExOptions {
  /** Placement index pairs to test (all pairs when absent). */
  pairs?: [number, number][];
  /** Distance (mm) under which non-overlapping parts count as touching; 0 disables touch detection. */
  touchTol?: number;
  /** Return a triangle mesh of the overlapping volume. */
  mesh?: boolean;
  /** Overlap volumes below this (mm³) count as touching (press-fit noise). */
  minVolume?: number;
}

export interface InterferenceExHit {
  a: number;
  b: number;
  kind: "interfere" | "touch";
  volume: number;
  /** Minimum distance (0 when overlapping / touching). */
  distance: number;
  /** Centre of the overlapping volume's bounding box (assembly mm). */
  center?: Vec3;
  mesh?: { positions: Float32Array; indices: Uint32Array };
}

const oc = () => R.getOC() as any; // eslint-disable-line @typescript-eslint/no-explicit-any

function bounds(s: Shape): [Vec3, Vec3] {
  return s.boundingBox.bounds as [Vec3, Vec3];
}

function boxGap(a: [Vec3, Vec3], b: [Vec3, Vec3]): number {
  let d2 = 0;
  for (let k = 0; k < 3; k++) {
    const g = Math.max(0, a[0][k] - b[1][k], b[0][k] - a[1][k]);
    d2 += g * g;
  }
  return Math.sqrt(d2);
}

function minDistance(a: Shape, b: Shape): number {
  try {
    const O = oc();
    const ds = new O.BRepExtrema_DistShapeShape(a.wrapped, b.wrapped);
    try {
      if (!ds.IsDone() || ds.NbSolution() < 1) return Infinity;
      return ds.Value();
    } finally {
      ds.delete?.();
    }
  } catch {
    return Infinity;
  }
}

/**
 * Tests placement pairs. `placed` holds every body of every placement in
 * assembly coordinates; `index` is the placement index.
 */
export function interferenceEx(placed: { shape: Shape; index: number }[], opts: InterferenceExOptions = {}): InterferenceExHit[] {
  const tol = Math.max(0, opts.touchTol ?? 0.01);
  const minVol = opts.minVolume ?? 1e-6;
  const byIndex = new Map<number, { shape: Shape; box: [Vec3, Vec3] }[]>();
  for (const p of placed) {
    let l = byIndex.get(p.index);
    if (!l) byIndex.set(p.index, (l = []));
    l.push({ shape: p.shape, box: bounds(p.shape) });
  }
  const idx = [...byIndex.keys()].sort((x, y) => x - y);
  const pairs: [number, number][] = opts.pairs ?? idx.flatMap((a, i) => idx.slice(i + 1).map((b) => [a, b] as [number, number]));
  const out: InterferenceExHit[] = [];
  for (const [a, b] of pairs) {
    if (a === b) continue;
    const A = byIndex.get(a), B = byIndex.get(b);
    if (!A || !B) continue;
    let volume = 0, distance = Infinity;
    const pos: number[] = [], ind: number[] = [];
    const lo: Vec3 = [Infinity, Infinity, Infinity], hi: Vec3 = [-Infinity, -Infinity, -Infinity];
    for (const x of A)
      for (const y of B) {
        const gap = boxGap(x.box, y.box);
        if (gap > tol) {
          distance = Math.min(distance, gap);
          continue;
        }
        let v = 0;
        try {
          const s = x.shape.intersect(y.shape) as Shape;
          if (s && !s.isNull && s.faces.length) {
            v = R.measureVolume(s as never);
            if (v > minVol) {
              const [l, u] = bounds(s);
              for (let k = 0; k < 3; k++) (lo[k] = Math.min(lo[k], l[k])), (hi[k] = Math.max(hi[k], u[k]));
              if (opts.mesh) {
                const m = s.mesh({ tolerance: 0.05, angularTolerance: 0.3 });
                const base = pos.length / 3;
                pos.push(...m.vertices);
                for (const t of m.triangles) ind.push(t + base);
              }
            }
          }
        } catch {
          /* failed boolean: fall back to the distance */
        }
        if (v > minVol) {
          volume += v;
          distance = 0;
        } else if (tol > 0 || v > 0) distance = Math.min(distance, v > 0 ? 0 : minDistance(x.shape, y.shape));
      }
    if (volume > minVol) {
      out.push({
        a, b, kind: "interfere", volume, distance: 0,
        center: [(lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2, (lo[2] + hi[2]) / 2],
        mesh: opts.mesh && ind.length ? { positions: new Float32Array(pos), indices: new Uint32Array(ind) } : undefined,
      });
    } else if (tol > 0 && distance <= tol) out.push({ a, b, kind: "touch", volume, distance });
  }
  return out;
}
