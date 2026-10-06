// Turns the parametric document into fully evaluated kernel input:
// parameters -> numbers, sketches -> solved geometry + profile regions,
// patterns -> transform lists.

import type { PathSeg, RFeature, Transform } from "../kernel/protocol";
import { findRegions, pointInRegion, type Region } from "../sketch/profiles";
import { solve, type SolveResult } from "../sketch/solver";
import { evalWith } from "./params";
import type { AxisRef, Feature, PartDocument, PlaneDef, SketchFeature, SkLine, SkPoint, Vec2, Vec3, WorkPlaneFeature } from "./types";

export interface SketchState {
  regions: Region[];
  solve: SolveResult;
}

export interface Resolved {
  features: RFeature[];
  /** Kernel feature index -> document feature id (suppressed / sketches are skipped). */
  errors: Record<string, string>;
  sketches: Map<string, SketchState>;
  values: Map<string, number>;
}

const AXES: Record<AxisRef, Vec3> = { X: [1, 0, 0], Y: [0, 1, 0], Z: [0, 0, 1] };

export function cross(a: Vec3, b: Vec3): Vec3 {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

export function planeToWorld(p: PlaneDef, uv: Vec2): Vec3 {
  const y = cross(p.normal, p.xDir);
  return [
    p.origin[0] + p.xDir[0] * uv[0] + y[0] * uv[1],
    p.origin[1] + p.xDir[1] * uv[0] + y[1] * uv[1],
    p.origin[2] + p.xDir[2] * uv[0] + y[2] * uv[1],
  ];
}

export function worldToPlane(p: PlaneDef, w: Vec3): Vec2 {
  const y = cross(p.normal, p.xDir);
  const d: Vec3 = [w[0] - p.origin[0], w[1] - p.origin[1], w[2] - p.origin[2]];
  return [d[0] * p.xDir[0] + d[1] * p.xDir[1] + d[2] * p.xDir[2], d[0] * y[0] + d[1] * y[1] + d[2] * y[2]];
}

/** Solve one sketch in place using the current parameter values. */
export function solveSketch(sk: SketchFeature, values: Map<string, number>, hold?: Set<string>): SolveResult {
  const dimValues = new Map<string, number>();
  for (const d of sk.dimensions) {
    if (d.driven) continue;
    const v = values.get(d.param);
    if (v !== undefined) dimValues.set(d.id, v);
  }
  return solve({ entities: sk.entities, constraints: sk.constraints, dimensions: sk.dimensions, dimValues, hold });
}

/** Points usable as hole centres: free-standing sketch points. */
export function holeCenterPoints(sk: SketchFeature): SkPoint[] {
  const used = new Set<string>();
  for (const e of sk.entities) {
    if (e.type === "line") used.add(e.p1), used.add(e.p2);
    if (e.type === "circle") used.add(e.c);
    if (e.type === "arc") used.add(e.c), used.add(e.p1), used.add(e.p2);
  }
  return sk.entities.filter((e): e is SkPoint => e.type === "point" && !used.has(e.id) && !e.fixed && !e.ref && !e.construction);
}

/** Updates cached work-plane frames and sketches that live on work planes. */
export function prepareDocument(doc: PartDocument, values: Map<string, number>) {
  for (const f of doc.features)
    if (f.type === "workplane") {
      let off = 0;
      try {
        off = evalWith(values, f.offset);
      } catch {
        /* keep 0 */
      }
      f.plane = { ...f.base, origin: f.base.origin.map((o, i) => o + f.base.normal[i] * off) as Vec3 };
    }
  for (const f of doc.features)
    if (f.type === "sketch" && f.planeRef) {
      const wp = doc.features.find((x) => x.id === f.planeRef) as WorkPlaneFeature | undefined;
      if (wp?.plane) f.plane = wp.plane;
    }
}

export function resolveDocument(doc: PartDocument, values: Map<string, number>, upto = doc.endOfPart): Resolved {
  const errors: Record<string, string> = {};
  const sketches = new Map<string, SketchState>();
  const out: RFeature[] = [];
  const num = (f: Feature, expr: string, label: string): number => {
    try {
      return evalWith(values, expr);
    } catch (e) {
      throw new Error(`${label}: ${(e as Error).message}`);
    }
  };

  const active = doc.features.slice(0, upto);
  for (const f of doc.features) {
    if (f.type === "sketch") {
      const res = solveSketch(f, values);
      sketches.set(f.id, { regions: findRegions(f.entities), solve: res });
    }
  }

  for (const f of active) {
    if (f.suppressed || f.type === "sketch" || f.type === "workplane") continue;
    try {
      const rf = resolveFeature(doc, f, sketches, num);
      if (rf) out.push(rf);
    } catch (e) {
      errors[f.id] = (e as Error).message;
    }
  }
  return { features: out, errors, sketches, values };
}

function resolveFeature(
  doc: PartDocument,
  f: Feature,
  sketches: Map<string, SketchState>,
  num: (f: Feature, expr: string, label: string) => number,
): RFeature | null {
  const sketchOf = (id: string) => {
    if (!id) throw new Error("プロファイルを選択してください");
    const sk = doc.features.find((x) => x.id === id) as SketchFeature | undefined;
    if (!sk) throw new Error("スケッチが見つかりません");
    return { sk, st: sketches.get(id)! };
  };
  const regionsOf = (st: SketchState, idx: number[], samples?: Vec2[]) => {
    if (!st) throw new Error("スケッチが見つかりません");
    if (samples?.length) {
      // re-find regions by their interior sample points (stable across sketch edits)
      idx = samples.map((p, k) => {
        const found = st.regions.findIndex((r) => pointInRegion(p, r));
        return found >= 0 ? found : idx[k];
      });
      idx = [...new Set(idx.filter((i) => i !== undefined))];
    }
    const rs = idx.filter((i) => st.regions[i]).map((i) => ({ outer: st.regions[i].outer, holes: st.regions[i].holes }));
    if (!rs.length) throw new Error("プロファイルが選択されていないか、スケッチが変更されました");
    return rs;
  };
  switch (f.type) {
    case "extrude": {
      const { sk, st } = sketchOf(f.sketch);
      const d = f.extent === "through" ? 0 : num(f, f.distance, "距離");
      if (f.extent !== "through" && !(d > 0)) throw new Error("距離は正の値である必要があります");
      let from = 0, to = d;
      if (f.extent === "symmetric") (from = -d / 2), (to = d / 2);
      return {
        id: f.id,
        type: "extrude",
        plane: sk.plane,
        regions: regionsOf(st, f.profiles, f.profilePts),
        op: f.op,
        from,
        to,
        through: f.extent === "through",
        flip: f.flip,
      };
    }
    case "revolve": {
      const { sk, st } = sketchOf(f.sketch);
      let axisOrigin: Vec2 = [0, 0], axisDir: Vec2 = [1, 0];
      if (f.axis === "Y") axisDir = [0, 1];
      else if (f.axis !== "X") {
        const l = sk.entities.find((e) => e.id === f.axis) as SkLine | undefined;
        if (!l) throw new Error("回転軸が見つかりません");
        const p1 = sk.entities.find((e) => e.id === l.p1) as SkPoint, p2 = sk.entities.find((e) => e.id === l.p2) as SkPoint;
        axisOrigin = [p1.x, p1.y];
        axisDir = [p2.x - p1.x, p2.y - p1.y];
      }
      const angle = f.extent === "full" ? 360 : num(f, f.angle, "角度");
      return {
        id: f.id,
        type: "revolve",
        plane: sk.plane,
        regions: regionsOf(st, f.profiles, f.profilePts),
        axisOrigin,
        axisDir: f.flip ? [-axisDir[0], -axisDir[1]] : axisDir,
        angle,
        op: f.op,
      };
    }
    case "loft": {
      const sections = f.sketches.map((id) => {
        const { sk, st } = sketchOf(id);
        const r = st.regions.find((x) => !x.island) ?? st.regions[0];
        if (!r) throw new Error(`${sk.name} に閉じたプロファイルがありません`);
        return { plane: sk.plane, outer: r.outer };
      });
      if (sections.length < 2) throw new Error("断面を 2 つ以上選択してください");
      return { id: f.id, type: "loft", sections, ruled: f.ruled, op: f.op };
    }
    case "sweep": {
      const { sk, st } = sketchOf(f.sketch);
      if (!f.path) throw new Error("パスを選択してください");
      const pathSk = doc.features.find((x) => x.id === f.path) as SketchFeature | undefined;
      if (!pathSk) throw new Error("パスのスケッチが見つかりません");
      return { id: f.id, type: "sweep", plane: sk.plane, regions: regionsOf(st, f.profiles, f.profilePts), path: sketchPath(pathSk), op: f.op };
    }
    case "fillet":
      if (!f.edges.length) throw new Error("エッジが選択されていません");
      return { id: f.id, type: "fillet", edges: f.edges, radius: num(f, f.radius, "半径") };
    case "chamfer":
      if (!f.edges.length) throw new Error("エッジが選択されていません");
      return { id: f.id, type: "chamfer", edges: f.edges, distance: num(f, f.distance, "距離") };
    case "shell":
      return { id: f.id, type: "shell", faces: f.faces, thickness: num(f, f.thickness, "厚さ"), outside: f.outside };
    case "hole": {
      const { sk } = sketchOf(f.sketch);
      const pts = (f.points.length ? f.points.map((id) => sk.entities.find((e) => e.id === id)) : holeCenterPoints(sk)).filter(
        (p): p is SkPoint => !!p && p.type === "point",
      );
      if (!pts.length) throw new Error("穴の中心点がありません (スケッチに点を配置してください)");
      return {
        id: f.id,
        type: "hole",
        plane: sk.plane,
        points: pts.map((p) => [p.x, p.y]),
        holeType: f.holeType,
        diameter: num(f, f.diameter, "直径"),
        depth: f.through ? 0 : num(f, f.depth, "深さ"),
        through: f.through,
        cbDiameter: f.holeType === "counterbore" ? num(f, f.cbDiameter, "座ぐり径") : 0,
        cbDepth: f.holeType === "counterbore" ? num(f, f.cbDepth, "座ぐり深さ") : 0,
        csDiameter: f.holeType === "countersink" ? num(f, f.csDiameter, "皿径") : 0,
        csAngle: f.holeType === "countersink" ? num(f, f.csAngle, "皿角度") : 90,
        flip: f.flip,
      };
    }
    case "rectPattern":
    case "circPattern": {
      if (!f.features.length) throw new Error("パターン化するフィーチャを選択してください");
      const n = Math.round(num(f, f.count, "数"));
      if (!(n >= 1) || n > 500) throw new Error("数は 1〜500 で指定してください");
      const sgn = f.flip ? -1 : 1;
      const transforms: Transform[] = [];
      if (f.type === "rectPattern") {
        const s = num(f, f.spacing, "間隔");
        const a = AXES[f.axis];
        const n2 = f.axis2 ? Math.round(num(f, f.count2, "数 2")) : 1;
        const s2 = f.axis2 ? num(f, f.spacing2, "間隔 2") : 0;
        const b = f.axis2 ? AXES[f.axis2] : ([0, 0, 0] as Vec3);
        for (let i = 0; i < n; i++)
          for (let j = 0; j < Math.max(1, n2); j++) {
            if (i === 0 && j === 0) continue;
            transforms.push({
              translate: [0, 1, 2].map((k) => sgn * a[k] * s * i + b[k] * s2 * j) as Vec3,
            });
          }
      } else {
        const total = num(f, f.spacing, "角度");
        const step = Math.abs(total - 360) < 1e-9 ? total / n : n > 1 ? total / (n - 1) : 0;
        for (let i = 1; i < n; i++) transforms.push({ rotate: { angle: sgn * step * i, origin: [0, 0, 0], axis: AXES[f.axis] } });
      }
      return { id: f.id, type: "pattern", sources: f.features, transforms };
    }
    case "mirror": {
      if (!f.features.length) throw new Error("ミラー化するフィーチャを選択してください");
      const off = num(f, f.offset, "オフセット");
      const normal: Vec3 = f.plane === "XY" ? [0, 0, 1] : f.plane === "YZ" ? [1, 0, 0] : [0, 1, 0];
      return {
        id: f.id,
        type: "pattern",
        sources: f.features,
        transforms: [{ mirror: { origin: [normal[0] * off, normal[1] * off, normal[2] * off], normal } }],
      };
    }
    case "box":
    case "cylinder":
    case "sphere":
    case "torus":
      return {
        id: f.id,
        type: "primitive",
        shape: f.type,
        plane: f.plane,
        center: f.center,
        a: num(f, f.a, "寸法"),
        b: f.type === "box" || f.type === "torus" ? num(f, f.b, "寸法") : 0,
        c: f.type === "box" || f.type === "cylinder" ? num(f, f.c, "高さ") : 0,
        op: f.op,
      };
    case "import":
      return { id: f.id, type: "import", format: f.format, data: f.data };
    case "move": {
      const v = (e: string, l: string) => num(f, e, l);
      const t: Transform = { translate: [v(f.dx, "X"), v(f.dy, "Y"), v(f.dz, "Z")] };
      const rx = v(f.rx, "回転 X"), ry = v(f.ry, "回転 Y"), rz = v(f.rz, "回転 Z");
      if (rx || ry || rz) return composeMove(f.id, [rx, ry, rz], t);
      return { id: f.id, type: "move", transform: t };
    }
    default:
      return null;
  }
}

/** Orders the non-construction curves of a sketch into one 3D path chain. */
export function sketchPath(sk: SketchFeature): PathSeg[] {
  const pts = new Map(sk.entities.filter((e): e is SkPoint => e.type === "point").map((p) => [p.id, p]));
  type Seg = { a: string; b: string; mid?: Vec2 };
  const segs: Seg[] = [];
  for (const e of sk.entities) {
    if (e.construction) continue;
    if (e.type === "line") segs.push({ a: e.p1, b: e.p2 });
    if (e.type === "arc") {
      const c = pts.get(e.c)!, p1 = pts.get(e.p1)!, p2 = pts.get(e.p2)!;
      const r = Math.hypot(p1.x - c.x, p1.y - c.y);
      const t0 = Math.atan2(p1.y - c.y, p1.x - c.x);
      let t1 = Math.atan2(p2.y - c.y, p2.x - c.x);
      while (t1 <= t0) t1 += Math.PI * 2;
      const tm = (t0 + t1) / 2;
      segs.push({ a: e.p1, b: e.p2, mid: [c.x + r * Math.cos(tm), c.y + r * Math.sin(tm)] });
    }
  }
  if (!segs.length) throw new Error("パスに線分または円弧がありません");
  // coincident points are shared ids in this sketcher; also honour coincident constraints
  const alias = new Map<string, string>();
  for (const c of sk.constraints) if (c.type === "coincident") alias.set(c.refs[0], c.refs[1]);
  const id = (x: string) => {
    let k = x;
    for (let i = 0; i < 10 && alias.has(k); i++) k = alias.get(k)!;
    return k;
  };
  const deg = new Map<string, number>();
  for (const s of segs) for (const v of [id(s.a), id(s.b)]) deg.set(v, (deg.get(v) ?? 0) + 1);
  let start = [...deg.entries()].find(([, d]) => d === 1)?.[0] ?? id(segs[0].a);
  const used = new Set<Seg>();
  const out: PathSeg[] = [];
  const W = (pid: string): Vec3 => {
    const p = pts.get(pid)!;
    return planeToWorld(sk.plane, [p.x, p.y]);
  };
  for (;;) {
    const next = segs.find((s) => !used.has(s) && (id(s.a) === start || id(s.b) === start));
    if (!next) break;
    used.add(next);
    const fwd = id(next.a) === start;
    const a = fwd ? next.a : next.b, b = fwd ? next.b : next.a;
    if (next.mid) out.push({ t: "arc", a: W(a), m: planeToWorld(sk.plane, next.mid), b: W(b) });
    else out.push({ t: "line", a: W(a), b: W(b) });
    start = id(b);
  }
  if (used.size !== segs.length) throw new Error("パスは 1 本につながった曲線である必要があります");
  return out;
}

function composeMove(id: string, [rx, ry, rz]: number[], t: Transform): RFeature {
  // Compose X, then Y, then Z rotations into a single axis-angle rotation.
  const q = quatMul(quatMul(axisQuat([0, 0, 1], rz), axisQuat([0, 1, 0], ry)), axisQuat([1, 0, 0], rx));
  const angle = (2 * Math.acos(Math.max(-1, Math.min(1, q[3]))) * 180) / Math.PI;
  const s = Math.sqrt(Math.max(0, 1 - q[3] * q[3]));
  const axis: Vec3 = s < 1e-9 ? [1, 0, 0] : [q[0] / s, q[1] / s, q[2] / s];
  return { id, type: "move", transform: { rotate: { angle, origin: [0, 0, 0], axis }, translate: t.translate } };
}

function axisQuat(a: Vec3, deg: number): [number, number, number, number] {
  const h = (deg * Math.PI) / 360;
  const s = Math.sin(h);
  return [a[0] * s, a[1] * s, a[2] * s, Math.cos(h)];
}

function quatMul(a: number[], b: number[]): [number, number, number, number] {
  return [
    a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
    a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
    a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3],
    a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2],
  ];
}
