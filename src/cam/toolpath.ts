// 2.5D CAM (Inventor CAM / Fusion "2D Pocket / 2D Contour / Drill" light):
// toolpaths in the sketch plane frame (X, Y = sketch u, v; Z = along the
// plane normal, 0 = sketch plane, cutting into -Z) and Fanuc-style G-code.

import ClipperLib from "clipper-lib";
import type { Vec2 } from "../core/types";

export interface CamTool {
  /** Tool diameter (mm). */
  d: number;
  /** Stepover as a fraction of the diameter (pocket). */
  stepover: number;
  /** Axial depth per pass (mm). */
  stepdown: number;
  feed: number;
  plunge: number;
  rpm: number;
}

export interface CamOp {
  kind: "pocket" | "contour" | "drill";
  /** Closed regions: outer loop + holes (pocket keeps out of the holes; contour cuts around the outer). */
  regions: { outer: Vec2[]; holes: Vec2[][] }[];
  /** Drill points. */
  points: Vec2[];
  depth: number;
  /** Contour: cut outside (true) or inside (false) of the outline. */
  outside: boolean;
  /** Leave stock on the walls (finishing allowance). */
  allowance: number;
  /** Peck depth for drilling (0 = G81). */
  peck: number;
}

export type Move = { rapid: boolean; p: [number, number, number] };

export interface CamResult {
  moves: Move[];
  /** Cutting length / rapid length (mm). */
  cutLength: number;
  rapidLength: number;
  /** Machining time estimate (s). */
  time: number;
  warnings: string[];
}

const S = 1000; // clipper integer scale (µm)
type IntPath = { X: number; Y: number }[];
const toInt = (p: Vec2[]): IntPath => p.map(([x, y]) => ({ X: Math.round(x * S), Y: Math.round(y * S) }));
const toF = (p: IntPath): Vec2[] => p.map((q) => [q.X / S, q.Y / S]);

/** Offset a set of closed paths (positive = grow). */
function offset(paths: IntPath[], d: number): IntPath[] {
  const co = new ClipperLib.ClipperOffset(2, 0.25 * S * 0.01);
  co.AddPaths(paths, ClipperLib.JoinType.jtRound, ClipperLib.EndType.etClosedPolygon);
  const out: IntPath[] = [];
  co.Execute(out, d * S);
  return out;
}

/** Region (outer + holes) as clipper paths with consistent orientation. */
function regionPaths(r: { outer: Vec2[]; holes: Vec2[][] }): IntPath[] {
  const o = toInt(r.outer);
  if (!ClipperLib.Clipper.Orientation(o)) o.reverse();
  const hs = r.holes.map((h) => {
    const p = toInt(h);
    if (ClipperLib.Clipper.Orientation(p)) p.reverse();
    return p;
  });
  return [o, ...hs];
}

function levels(depth: number, step: number): number[] {
  const n = Math.max(1, Math.ceil(depth / Math.max(step, 1e-3) - 1e-9));
  return Array.from({ length: n }, (_, i) => -(depth * (i + 1)) / n);
}

export function generateToolpath(op: CamOp, tool: CamTool, safeZ: number): CamResult {
  const moves: Move[] = [];
  const warnings: string[] = [];
  const r = tool.d / 2;
  const rapidTo = (x: number, y: number, z: number) => moves.push({ rapid: true, p: [x, y, z] });
  const feedTo = (x: number, y: number, z: number) => moves.push({ rapid: false, p: [x, y, z] });
  /** Cut one closed loop at depth z, entering from safe height. */
  const loop = (pts: Vec2[], z: number, zPrev: number) => {
    if (pts.length < 2) return;
    rapidTo(pts[0][0], pts[0][1], safeZ);
    rapidTo(pts[0][0], pts[0][1], zPrev + 1);
    feedTo(pts[0][0], pts[0][1], z);
    for (const p of pts.slice(1)) feedTo(p[0], p[1], z);
    feedTo(pts[0][0], pts[0][1], z);
    rapidTo(pts[0][0], pts[0][1], safeZ);
  };
  if (op.kind === "drill") {
    for (const p of op.points) {
      rapidTo(p[0], p[1], safeZ);
      if (op.peck > 0) {
        for (const z of levels(op.depth, op.peck)) {
          feedTo(p[0], p[1], z);
          rapidTo(p[0], p[1], 1);
        }
      } else feedTo(p[0], p[1], -op.depth);
      rapidTo(p[0], p[1], safeZ);
    }
    if (!op.points.length) warnings.push("穴あけ位置 (スケッチの点・円) がありません");
  } else {
    const zs = levels(op.depth, tool.stepdown);
    for (const reg of op.regions) {
      const base = regionPaths(reg);
      let rings: IntPath[][] = [];
      if (op.kind === "contour") {
        // only the outer outline; tool centre offset outside (or inside) by r + allowance
        const d = (op.outside ? 1 : -1) * (r + op.allowance);
        rings = [offset([base[0]], d)];
        if (!rings[0].length) warnings.push("工具が大きすぎて輪郭を加工できません");
      } else {
        // pocket: concentric offsets from the wall inwards
        let cur = offset(base, -(r + op.allowance));
        if (!cur.length) warnings.push("工具がポケットに入りません (工具径を小さくしてください)");
        const step = Math.max(0.05, tool.d * tool.stepover);
        for (let k = 0; cur.length && k < 2000; k++) {
          rings.push(cur);
          cur = offset(cur, -step);
        }
        rings.reverse(); // centre first, then outwards to the wall
      }
      let zPrev = 0;
      for (const z of zs) {
        for (const ring of rings) for (const p of ring) loop(toF(p), z, zPrev);
        zPrev = z;
      }
    }
  }
  // lengths and time
  let cut = 0, rapid = 0, time = 0;
  for (let i = 1; i < moves.length; i++) {
    const a = moves[i - 1].p, b = moves[i].p;
    const l = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    if (moves[i].rapid) {
      rapid += l;
      time += l / (5000 / 60);
    } else {
      cut += l;
      const plunge = Math.abs(b[2] - a[2]) > 1e-9 && Math.hypot(b[0] - a[0], b[1] - a[1]) < 1e-9;
      time += l / ((plunge ? tool.plunge : tool.feed) / 60);
    }
  }
  return { moves, cutLength: cut, rapidLength: rapid, time, warnings };
}

const n = (x: number) => (Math.abs(x) < 5e-4 ? "0." : x.toFixed(3).replace(/0+$/, "").replace(/\.$/, "."));

/** Fanuc-style G-code (G17 G21 G90), one tool. */
export function toGcode(name: string, ops: { label: string; res: CamResult; tool: CamTool; toolNo: number }[], safeZ: number): string {
  const out = ["%", `O0001 (${name.replace(/[()]/g, "")})`, "G17 G21 G40 G49 G80 G90"];
  for (const { label, res, tool, toolNo } of ops) {
    out.push(`(${label.replace(/[()]/g, "")} - D${tool.d}MM)`, `T${toolNo} M06`, `S${Math.round(tool.rpm)} M03`, `G54 G00 Z${n(safeZ)}`);
    let last: [number, number, number] | null = null;
    let mode = "";
    let feed = -1;
    for (const m of res.moves) {
      const [x, y, z] = m.p;
      const words: string[] = [];
      const g = m.rapid ? "G00" : "G01";
      if (g !== mode) words.push(g);
      if (!last || Math.abs(last[0] - x) > 5e-4) words.push(`X${n(x)}`);
      if (!last || Math.abs(last[1] - y) > 5e-4) words.push(`Y${n(y)}`);
      if (!last || Math.abs(last[2] - z) > 5e-4) words.push(`Z${n(z)}`);
      if (!m.rapid) {
        const plunge = last && Math.abs(last[2] - z) > 5e-4 && Math.abs(last[0] - x) < 5e-4 && Math.abs(last[1] - y) < 5e-4;
        const f = plunge ? tool.plunge : tool.feed;
        if (f !== feed) {
          words.push(`F${Math.round(f)}`);
          feed = f;
        }
      }
      if (words.length > (g !== mode ? 1 : 0)) {
        out.push(words.join(" "));
        mode = g;
      }
      last = m.p;
    }
    out.push(`G00 Z${n(safeZ)}`, "M05");
  }
  out.push("G28 G91 Z0.", "G90", "M30", "%");
  return out.join("\n");
}
