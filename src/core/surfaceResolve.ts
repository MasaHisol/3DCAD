// Resolves surface-modelling features (types.ts SurfaceFeature) into kernel
// input: sketch curves become 3D wire chains (open or closed).

import type { RFeature } from "../kernel/protocol";
import type { SCurve, SWire } from "../kernel/surface";
import { ORIGIN_PLANES } from "./document";
import type { Feature, PartDocument, PlaneDef, SketchFeature, SkLine, SkPoint, SurfaceFeature, ThickenFeature, Vec2, Vec3, WorkPlaneFeature } from "./types";

const SURFACE_TYPES = new Set(["surfExtrude", "surfRevolve", "surfLoft", "surfPatch", "surfTrim", "surfStitch", "surfOffset"]);
/** Shown when the part has only surfaces and the command needs volume (STL, mass properties). */
export const SURFACE_ONLY_MSG = "サーフェスには体積がありません。ステッチ (閉じたサーフェスを縫合) または厚み付けでソリッドにしてください";

/** Feature id behind a surface key: pattern / mirror copies are keyed "<feature id>#<n>". */
export const surfaceBase = (key: string) => {
  const k = key.indexOf("#");
  return k < 0 ? key : key.slice(0, k);
};
export const isSurfaceFeature = (f: Feature): f is SurfaceFeature => SURFACE_TYPES.has(f.type);

function cross(a: Vec3, b: Vec3): Vec3 {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}
function toWorld(p: PlaneDef, uv: Vec2): Vec3 {
  const y = cross(p.normal, p.xDir);
  return [0, 1, 2].map((i) => p.origin[i] + p.xDir[i] * uv[0] + y[i] * uv[1]) as Vec3;
}

/**
 * The sketch's (non-construction) curves as connected 3D chains: open chains
 * first (from their free ends), then closed loops; circles are loops of their own.
 */
export function sketchWires(sk: SketchFeature, exclude: Set<string> = new Set()): SWire[] {
  const pts = new Map(sk.entities.filter((e): e is SkPoint => e.type === "point").map((p) => [p.id, p]));
  const alias = new Map<string, string>();
  for (const c of sk.constraints) if (c.type === "coincident" && c.refs.length === 2 && pts.has(c.refs[0]) && pts.has(c.refs[1])) alias.set(c.refs[0], c.refs[1]);
  const key = (x: string) => {
    let k = x;
    for (let i = 0; i < 10 && alias.has(k); i++) k = alias.get(k)!;
    return k;
  };
  const W = (id: string): Vec3 => {
    const p = pts.get(id)!;
    return toWorld(sk.plane, [p.x, p.y]);
  };
  type Seg = { a: string; b: string; mid?: Vec2 };
  const segs: Seg[] = [];
  const out: SWire[] = [];
  for (const e of sk.entities) {
    if (e.construction || e.ref || exclude.has(e.id)) continue;
    if (e.type === "line") segs.push({ a: e.p1, b: e.p2 });
    else if (e.type === "arc") {
      const c = pts.get(e.c)!, p1 = pts.get(e.p1)!, p2 = pts.get(e.p2)!;
      const r = Math.hypot(p1.x - c.x, p1.y - c.y);
      const t0 = Math.atan2(p1.y - c.y, p1.x - c.x);
      let t1 = Math.atan2(p2.y - c.y, p2.x - c.x);
      while (t1 <= t0) t1 += Math.PI * 2;
      const tm = (t0 + t1) / 2;
      segs.push({ a: e.p1, b: e.p2, mid: [c.x + r * Math.cos(tm), c.y + r * Math.sin(tm)] });
    } else if (e.type === "circle") {
      const c = pts.get(e.c)!;
      out.push([{ t: "circle", c: toWorld(sk.plane, [c.x, c.y]), n: sk.plane.normal, r: e.r }]);
    }
  }
  const deg = new Map<string, number>();
  for (const s of segs) for (const v of [key(s.a), key(s.b)]) deg.set(v, (deg.get(v) ?? 0) + 1);
  const used = new Set<Seg>();
  const walk = (start: string): SWire => {
    const chain: SCurve[] = [];
    let cur = start;
    for (;;) {
      const next = segs.find((s) => !used.has(s) && (key(s.a) === cur || key(s.b) === cur));
      if (!next) break;
      used.add(next);
      const fwd = key(next.a) === cur;
      const a = fwd ? next.a : next.b, b = fwd ? next.b : next.a;
      chain.push(next.mid ? { t: "arc", a: W(a), m: toWorld(sk.plane, next.mid), b: W(b) } : { t: "line", a: W(a), b: W(b) });
      cur = key(b);
    }
    return chain;
  };
  // open chains from their free ends, then the remaining closed loops
  for (const [v, d] of deg) if (d === 1 && segs.some((s) => !used.has(s) && (key(s.a) === v || key(s.b) === v))) out.unshift(walk(v));
  for (const s of segs) if (!used.has(s)) out.push(walk(key(s.a)));
  return out.filter((w) => w.length);
}

const isClosed = (w: SWire) => {
  if (w.length === 1 && w[0].t === "circle") return true;
  const a = (w[0] as { a: Vec3 }).a, last = w[w.length - 1] as { b: Vec3 };
  return Math.hypot(a[0] - last.b[0], a[1] - last.b[1], a[2] - last.b[2]) < 1e-6;
};

type Num = (f: Feature, expr: string, label: string) => number;

export function resolveSurfaceFeature(doc: PartDocument, f: SurfaceFeature | ThickenFeature, num: Num, regionsOf: (sketchId: string) => { plane: PlaneDef; regions: { outer: unknown[]; holes: unknown[][] }[] }): RFeature {
  const sketch = (id: string | undefined) => {
    if (!id) throw new Error("スケッチを選択してください");
    const sk = doc.features.find((x) => x.id === id);
    if (!sk || sk.type !== "sketch") throw new Error("スケッチが見つかりません");
    return sk;
  };
  const wiresOf = (sk: SketchFeature, exclude?: Set<string>) => {
    const w = sketchWires(sk, exclude);
    if (!w.length) throw new Error(`${sk.name} に曲線がありません`);
    return w;
  };
  const surfRef = (id: string, label = "サーフェス") => {
    if (!id) throw new Error(`${label}を選択してください`);
    if (!doc.features.some((x) => x.id === surfaceBase(id))) throw new Error(`${label}が見つかりません`);
    return id;
  };
  switch (f.type) {
    case "thicken": {
      const d = num(f, f.distance, "厚さ");
      if (!(d > 0)) throw new Error("厚さは正の値にしてください");
      return { id: f.id, type: "surfThicken", surface: surfRef(f.surface!), distance: f.flip ? -d : d, op: f.op };
    }
    case "surfExtrude": {
      const sk = sketch(f.sketch);
      const d = num(f, f.distance, "距離");
      if (!(d > 0)) throw new Error("距離は正の値である必要があります");
      let from = 0, to = d;
      if (f.extent === "symmetric") (from = -d / 2), (to = d / 2);
      if (f.flip) [from, to] = [-to, -from];
      return { id: f.id, type: "surfExtrude", wires: wiresOf(sk), dir: sk.plane.normal, from, to };
    }
    case "surfRevolve": {
      const sk = sketch(f.sketch);
      let o: Vec2 = [0, 0], dir: Vec2 = [1, 0];
      const exclude = new Set<string>();
      if (f.axis === "Y") dir = [0, 1];
      else if (f.axis.startsWith("wa:")) {
        const wa = doc.features.find((x) => x.id === f.axis.slice(3));
        if (!wa || wa.type !== "workaxis") throw new Error("作業軸が見つかりません");
        const angle = f.extent === "full" ? 360 : num(f, f.angle, "角度");
        return { id: f.id, type: "surfRevolve", wires: wiresOf(sk), origin: wa.origin, axis: f.flip ? (wa.dir.map((x) => -x) as Vec3) : wa.dir, angle };
      } else if (f.axis !== "X") {
        const l = sk.entities.find((e) => e.id === f.axis) as SkLine | undefined;
        if (!l) throw new Error("回転軸が見つかりません");
        const p1 = sk.entities.find((e) => e.id === l.p1) as SkPoint, p2 = sk.entities.find((e) => e.id === l.p2) as SkPoint;
        o = [p1.x, p1.y];
        dir = [p2.x - p1.x, p2.y - p1.y];
        exclude.add(l.id);
      }
      const angle = f.extent === "full" ? 360 : num(f, f.angle, "角度");
      const O = toWorld(sk.plane, o), E = toWorld(sk.plane, [o[0] + dir[0], o[1] + dir[1]]);
      const axis: Vec3 = [E[0] - O[0], E[1] - O[1], E[2] - O[2]];
      return { id: f.id, type: "surfRevolve", wires: wiresOf(sk, exclude), origin: O, axis: f.flip ? (axis.map((x) => -x) as Vec3) : axis, angle };
    }
    case "surfLoft": {
      if (f.sketches.length < 2) throw new Error("断面を 2 つ以上選択してください");
      const sections = f.sketches.map((id) => {
        const w = wiresOf(sketch(id));
        return w.find(isClosed) ?? w[0];
      });
      return { id: f.id, type: "surfLoft", sections, ruled: f.ruled };
    }
    case "surfPatch": {
      if (f.sketch) {
        const w = wiresOf(sketch(f.sketch)).find(isClosed);
        if (!w) throw new Error("スケッチに閉じたループがありません");
        return { id: f.id, type: "surfPatch", wire: w };
      }
      if (!f.edges.length) throw new Error("境界のエッジ (閉じたループ) を選択してください");
      return { id: f.id, type: "surfPatch", edges: f.edges };
    }
    case "surfTrim": {
      const surface = surfRef(f.surface, "トリムするサーフェス");
      const t = f.tool;
      if (t.kind === "surface") return { id: f.id, type: "surfTrim", surface, tool: { kind: "surface", id: surfRef(t.id, "ツールのサーフェス") }, flip: f.flip };
      if (t.kind === "sketch") {
        const r = regionsOf(t.sketch);
        if (!r.regions.length) throw new Error("トリム用のスケッチに閉じたプロファイルがありません");
        return { id: f.id, type: "surfTrim", surface, tool: { kind: "profile", plane: r.plane, regions: r.regions as never }, flip: f.flip };
      }
      const plane = t.kind === "origin" ? ORIGIN_PLANES[t.key] : (doc.features.find((x) => x.id === t.id) as WorkPlaneFeature | undefined)?.plane;
      if (!plane) throw new Error("トリムする平面が見つかりません");
      return { id: f.id, type: "surfTrim", surface, tool: { kind: "plane", plane }, flip: f.flip };
    }
    case "surfStitch": {
      if (!f.surfaces.length) throw new Error("縫合するサーフェスを選択してください");
      f.surfaces.forEach((id) => surfRef(id));
      return { id: f.id, type: "surfStitch", surfaces: f.surfaces, tolerance: num(f, f.tolerance, "許容差"), solid: f.solid, op: f.op };
    }
    case "surfOffset": {
      const d = num(f, f.distance, "距離");
      return { id: f.id, type: "surfOffset", surface: surfRef(f.surface), distance: f.flip ? -d : d };
    }
  }
}
