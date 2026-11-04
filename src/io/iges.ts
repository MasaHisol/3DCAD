// IGES 5.3 (ASCII, fixed 80 columns) reader and writer for trimmed NURBS
// surfaces. The bundled OpenCascade build has no IGES module, so the file is
// parsed here into plain NURBS data and the kernel builds faces from it.
//
// Read: 100 arc, 102 composite curve, 106 copious data (polylines), 108 plane,
// 110 line, 120 surface of revolution, 122 tabulated cylinder, 124 transform,
// 126 B-spline curve, 128 B-spline surface, 142 curve on surface, 143 bounded
// surface (141 boundaries), 144 trimmed surface, 314 colour, 402 groups with
// a 406 name property. Units from the global section are converted to mm.
// Write: one 144 (128 surface + 102/126 model-space boundaries) per face,
// faces grouped per body (402 form 7 with a 406-15 name), 314 colours.

import {
  arcCurve,
  composeAffine,
  evalCurve,
  evalSurface,
  extrudeSurface,
  IDENTITY_AFFINE,
  lineCurve,
  polylineCurve,
  revolveSurface,
  transformCurve,
  transformSurface,
  curveRange,
  surfaceRange,
  type Affine,
  type NurbsCurve,
  type NurbsSurface,
  type P3,
} from "./nurbs";

export interface IgesFace {
  surface: NurbsSurface;
  /** Outer loop (model space curves); null = natural boundary of the surface. */
  outer: NurbsCurve[] | null;
  inner: NurbsCurve[][];
  /** Plane faces may come without a NURBS surface: the boundary defines the face. */
  planar?: boolean;
}

export interface IgesBody {
  name: string;
  color?: [number, number, number];
  faces: IgesFace[];
}

export interface IgesModel {
  bodies: IgesBody[];
  /** Entities that were skipped (type -> count). */
  skipped: Record<number, number>;
  units: string;
}

// ------------------------------------------------------------------ read ---

interface DE {
  type: number;
  pd: number;
  transform: number;
  status: string;
  color: number;
  form: number;
  label: string;
  params: string[];
}

/** Splits the parameter text into tokens, honouring Hollerith strings. */
function tokenize(s: string, pdel: string, rdel: string): string[] {
  const out: string[] = [];
  let i = 0;
  while (i < s.length) {
    while (s[i] === " ") i++;
    // Hollerith nH...
    const m = /^(\d+)H/.exec(s.slice(i, i + 12));
    if (m) {
      const n = +m[1];
      const start = i + m[0].length;
      out.push(s.slice(start, start + n));
      i = start + n;
      while (i < s.length && s[i] !== pdel && s[i] !== rdel) i++;
      if (s[i] === rdel) break;
      i++;
      continue;
    }
    let j = i;
    while (j < s.length && s[j] !== pdel && s[j] !== rdel) j++;
    out.push(s.slice(i, j).trim());
    if (s[j] === rdel) break;
    i = j + 1;
  }
  return out;
}

const num = (t: string | undefined) => (t === undefined || t === "" ? 0 : parseFloat(t.replace(/D/i, "E")));

const UNIT_MM: Record<number, [number, string]> = {
  1: [25.4, "inch"], 2: [1, "mm"], 4: [304.8, "ft"], 5: [1609344, "mile"], 6: [1000, "m"], 7: [1e6, "km"], 8: [0.0254, "mil"], 9: [0.001, "micron"], 10: [10, "cm"], 11: [0.0000254, "microinch"],
};

const STD_COLORS: Record<number, [number, number, number]> = {
  1: [0, 0, 0], 2: [1, 0, 0], 3: [0, 1, 0], 4: [0, 0, 1], 5: [1, 1, 0], 6: [1, 0, 1], 7: [0, 1, 1], 8: [1, 1, 1],
};

export function readIges(text: string): IgesModel {
  const lines = text.split(/\r?\n/).filter((l) => l.length >= 73);
  const sec = (c: string) => lines.filter((l) => l[72] === c);
  const gtext = sec("G").map((l) => l.slice(0, 72)).join("");
  let pdel = ",", rdel = ";";
  if (/^1H./.test(gtext)) pdel = gtext[2];
  const r2 = gtext.indexOf("1H", 3);
  if (r2 >= 0 && r2 < 8) rdel = gtext[r2 + 2];
  const g = tokenize(gtext, pdel, rdel);
  const unitFlag = Math.round(num(g[13])) || 2;
  let [scale, units] = UNIT_MM[unitFlag] ?? [1, "mm"];
  if (unitFlag === 3) {
    const n = (g[14] ?? "").toUpperCase();
    [scale, units] = n.includes("IN") ? [25.4, "inch"] : n === "M" ? [1000, "m"] : n === "CM" ? [10, "cm"] : [1, "mm"];
  }
  const dl = sec("D");
  const plines = sec("P");
  const pAt = new Map<number, string>(); // P sequence -> data columns
  for (const l of plines) pAt.set(parseInt(l.slice(73, 80), 10), l.slice(0, 64));
  const des = new Map<number, DE>();
  for (let i = 0; i + 1 < dl.length; i += 2) {
    const a = dl[i], b = dl[i + 1];
    const f = (l: string, k: number) => l.slice(k * 8, k * 8 + 8).trim();
    const seq = parseInt(a.slice(73, 80), 10);
    const pd = parseInt(f(a, 1), 10);
    const count = parseInt(f(b, 3), 10) || 1;
    let ptext = "";
    for (let k = 0; k < count; k++) ptext += pAt.get(pd + k) ?? "";
    const tokens = tokenize(ptext, pdel, rdel);
    des.set(seq, {
      type: parseInt(f(a, 0), 10),
      pd,
      transform: parseInt(f(a, 6), 10) || 0,
      status: f(a, 8).padStart(8, "0"),
      color: parseInt(f(b, 2), 10) || 0,
      form: parseInt(f(b, 4), 10) || 0,
      label: b.slice(56, 64).trim(),
      params: tokens.slice(1),
    });
  }
  const skipped: Record<number, number> = {};
  const skip = (t: number) => (skipped[t] = (skipped[t] ?? 0) + 1);

  const xform = (seq: number, depth = 0): Affine => {
    const e = des.get(seq);
    if (!e || e.type !== 124 || depth > 16) return IDENTITY_AFFINE;
    const m = e.params.slice(0, 12).map(num);
    return e.transform ? composeAffine(xform(e.transform, depth + 1), m) : m;
  };
  const placed = (e: DE): Affine => (e.transform ? xform(e.transform) : IDENTITY_AFFINE);

  /** Model-space curve entity -> NURBS segments (mm). */
  const curve = (seq: number, depth = 0): NurbsCurve[] => {
    const e = des.get(seq);
    if (!e || depth > 16) return [];
    const p = e.params.map(num);
    const T = placed(e);
    const done = (cs: NurbsCurve[]) => cs.map((c) => transformCurve(c, T, scale));
    switch (e.type) {
      case 110:
        return done([lineCurve([p[0], p[1], p[2]], [p[3], p[4], p[5]])]);
      case 100: {
        const [zt, cx, cy, sx, sy, ex, ey] = p;
        const r = Math.hypot(sx - cx, sy - cy);
        const a0 = Math.atan2(sy - cy, sx - cx);
        let a1 = Math.atan2(ey - cy, ex - cx);
        while (a1 <= a0 + 1e-9) a1 += 2 * Math.PI;
        return done([arcCurve([cx, cy, zt], [1, 0, 0], [0, 1, 0], r, a0, a1)]);
      }
      case 126:
        return done([bspline126(p)]);
      case 102:
        return p.slice(1, 1 + p[0]).flatMap((s) => curve(s, depth + 1)).map((c) => transformCurve(c, T));
      case 106: {
        const n = p[1];
        const pts: P3[] = [];
        if (e.form === 1 || e.form === 11) for (let i = 0; i < n; i++) pts.push([p[3 + i * 2], p[4 + i * 2], p[2]]);
        else if (e.form === 2 || e.form === 12) for (let i = 0; i < n; i++) pts.push([p[2 + i * 3], p[3 + i * 3], p[4 + i * 3]]);
        else return skip(106), [];
        return pts.length >= 2 ? done([polylineCurve(pts)]) : [];
      }
      case 142:
        // curve on surface: model-space curve when present
        if (p[3]) return curve(p[3], depth + 1).map((c) => transformCurve(c, T));
        if (p[2]) return paramCurveOnSurface(p[2], p[1]).map((c) => transformCurve(c, T, scale));
        return [];
      default:
        skip(e.type);
        return [];
    }
  };

  /** 142 with a parameter-space curve only: sample it through the surface. */
  const paramCurveOnSurface = (bseq: number, sseq: number): NurbsCurve[] => {
    const se = des.get(sseq);
    if (!se || se.type !== 128) return [];
    const s = bspline128(se.params.map(num));
    const pc = curveRaw(bseq);
    return pc.map((c) => {
      const [t0, t1] = curveRange(c);
      const pts: P3[] = [];
      for (let k = 0; k <= 32; k++) {
        const uv = evalCurve(c, t0 + ((t1 - t0) * k) / 32);
        pts.push(applyAffineRaw(placed(se), evalSurface(s, uv[0], uv[1])));
      }
      return polylineCurve(pts);
    });
  };
  /** Curve without units / transform (parameter space curves). */
  const curveRaw = (seq: number): NurbsCurve[] => {
    const e = des.get(seq);
    if (!e) return [];
    const p = e.params.map(num);
    if (e.type === 126) return [bspline126(p)];
    if (e.type === 110) return [lineCurve([p[0], p[1], p[2]], [p[3], p[4], p[5]])];
    if (e.type === 102) return p.slice(1, 1 + p[0]).flatMap((s) => curveRaw(s));
    if (e.type === 100) {
      const [zt, cx, cy, sx, sy, ex, ey] = p;
      const a0 = Math.atan2(sy - cy, sx - cx);
      let a1 = Math.atan2(ey - cy, ex - cx);
      while (a1 <= a0 + 1e-9) a1 += 2 * Math.PI;
      return [arcCurve([cx, cy, zt], [1, 0, 0], [0, 1, 0], Math.hypot(sx - cx, sy - cy), a0, a1)];
    }
    return [];
  };

  /** Surface entity -> NURBS (mm) or a plane marker. */
  const surface = (seq: number): { s?: NurbsSurface; planar?: boolean } => {
    const e = des.get(seq);
    if (!e) return {};
    const p = e.params.map(num);
    const T = placed(e);
    switch (e.type) {
      case 128:
        return { s: transformSurface(bspline128(p), T, scale) };
      case 108:
        return { planar: true };
      case 120: {
        const axis = curve(p[0])[0];
        const gen = curve(p[1]);
        if (!axis || gen.length !== 1) return skip(120), {};
        const o = axis.poles[0], d = axis.poles[axis.poles.length - 1];
        return { s: transformSurface(revolveSurface(gen[0], o, [d[0] - o[0], d[1] - o[1], d[2] - o[2]], p[2], p[3]), T) };
      }
      case 122: {
        const dir = curve(p[0]);
        if (dir.length !== 1) return skip(122), {};
        const c = dir[0];
        const start = evalCurve(c, curveRange(c)[0]);
        const L: P3 = applyAffineRaw(T, [p[1], p[2], p[3]]).map((x) => x * scale) as P3;
        return { s: transformSurface(extrudeSurface(c, [L[0] - start[0], L[1] - start[1], L[2] - start[2]]), T) };
      }
      default:
        skip(e.type);
        return {};
    }
  };

  const faceOf = (e: DE): IgesFace | null => {
    const p = e.params.map(num);
    const T = placed(e);
    const tf = (cs: NurbsCurve[]) => cs.map((c) => transformCurve(c, T));
    if (e.type === 144) {
      const sf = surface(p[0]);
      if (!sf.s && !sf.planar) return null;
      const outer = p[1] ? tf(curve(p[3])) : null;
      const inner: NurbsCurve[][] = [];
      for (let k = 0; k < p[2]; k++) inner.push(tf(curve(p[4 + k])));
      if (sf.planar && !outer) return null;
      return { surface: sf.s ? transformSurface(sf.s, T) : (undefined as never), outer, inner, planar: !sf.s };
    }
    if (e.type === 143) {
      const sf = surface(p[1]);
      if (!sf.s && !sf.planar) return null;
      const loops: NurbsCurve[][] = [];
      for (let k = 0; k < p[2]; k++) {
        const b = des.get(p[3 + k]);
        if (!b || b.type !== 141) continue;
        const bp = b.params.map(num);
        // TYPE PREF SPTR N, then per curve: CRVPT SENSE K PSCPT...
        let o = 4;
        const loop: NurbsCurve[] = [];
        for (let c = 0; c < bp[3]; c++) {
          loop.push(...curve(bp[o]));
          o += 3 + bp[o + 2];
        }
        loops.push(tf(loop));
      }
      if (!loops.length && sf.planar) return null;
      return { surface: sf.s ? transformSurface(sf.s, T) : (undefined as never), outer: loops[0] ?? null, inner: loops.slice(1), planar: !sf.s };
    }
    if (e.type === 128) return { surface: surface(seqOf(e)).s!, outer: null, inner: [] };
    return null;
  };
  const seqOf = (e: DE) => [...des.entries()].find(([, v]) => v === e)![0];

  const colorOf = (e: DE): [number, number, number] | undefined => {
    if (e.color < 0) {
      const c = des.get(-e.color);
      if (c?.type === 314) return [num(c.params[0]) / 100, num(c.params[1]) / 100, num(c.params[2]) / 100];
    } else if (e.color > 0) return STD_COLORS[e.color];
    return undefined;
  };
  const nameOf = (e: DE): string | undefined => {
    // trailing property pointers: params after the entity's own data hold "NA ptrs NB ptrs"
    for (const t of e.params) {
      const ref = des.get(parseInt(t, 10));
      if (ref?.type === 406 && ref.form === 15) return unescapeName(ref.params[1]);
    }
    return e.label || undefined;
  };

  // groups (402) -> bodies; faces not in a group form one body per colour
  const bodies: IgesBody[] = [];
  const grouped = new Set<number>();
  for (const [seq, e] of des) {
    if (e.type !== 402 || ![1, 7, 14, 15].includes(e.form)) continue;
    const p = e.params.map(num);
    const members = p.slice(1, 1 + p[0]);
    const faces: IgesFace[] = [];
    let color = colorOf(e);
    for (const m of members) {
      const me = des.get(m);
      if (!me || ![143, 144, 128].includes(me.type)) continue;
      grouped.add(m);
      const f = faceOf(me);
      if (f) faces.push(f);
      color ??= colorOf(me);
    }
    // the name is a 406-15 property in the trailing pointers
    const tail = e.params.slice(1 + p[0]).map((t) => parseInt(t, 10));
    let name: string | undefined;
    for (const t of tail) {
      const ref = des.get(t);
      if (ref?.type === 406 && ref.form === 15) name = unescapeName(ref.params[1]);
    }
    if (faces.length) bodies.push({ name: name ?? (e.label || `グループ${seq}`), color, faces });
  }
  const loose = new Map<string, IgesBody>();
  for (const [seq, e] of des) {
    if (grouped.has(seq)) continue;
    const independent = e.status.slice(2, 4) === "00" || e.status.slice(2, 4) === "";
    if (!(e.type === 144 || e.type === 143 || (e.type === 128 && independent))) continue;
    if (e.type === 128 && !independent) continue;
    const f = faceOf(e);
    if (!f) continue;
    const color = colorOf(e);
    const key = color ? color.join(",") : "";
    if (!loose.has(key)) loose.set(key, { name: nameOf(e) ?? `IGES ${loose.size + 1}`, color, faces: [] });
    loose.get(key)!.faces.push(f);
  }
  bodies.push(...loose.values());
  if (des.size && ![...des.values()].some((e) => [143, 144, 128].includes(e.type))) {
    const msbo = [...des.values()].some((e) => e.type === 186);
    throw new Error(msbo ? "IGES の B-rep ソリッド (186) は未対応です。送り側で「トリム サーフェス (144)」形式で書き出してください" : "IGES に面 (サーフェス) がありません");
  }
  return { bodies, skipped, units };
}

function applyAffineRaw(m: Affine, p: P3): P3 {
  return [m[0] * p[0] + m[1] * p[1] + m[2] * p[2] + m[3], m[4] * p[0] + m[5] * p[1] + m[6] * p[2] + m[7], m[8] * p[0] + m[9] * p[1] + m[10] * p[2] + m[11]];
}

function bspline126(p: number[]): NurbsCurve {
  const K = p[0], M = p[1], poly = p[4] === 1;
  let o = 6;
  const knots = p.slice(o, o + K + M + 2);
  o += K + M + 2;
  const weights = p.slice(o, o + K + 1);
  o += K + 1;
  const poles: P3[] = [];
  for (let i = 0; i <= K; i++) poles.push([p[o + i * 3], p[o + i * 3 + 1], p[o + i * 3 + 2]]);
  o += 3 * (K + 1);
  const c: NurbsCurve = { degree: M, knots, poles, weights: poly || weights.every((w) => w === 1) ? undefined : weights };
  // V0, V1 may trim the curve: keep it simple and trust the knot range (most writers use the full range)
  return c;
}

function bspline128(p: number[]): NurbsSurface {
  const K1 = p[0], K2 = p[1], M1 = p[2], M2 = p[3];
  const nu = K1 + 1, nv = K2 + 1;
  let o = 9;
  const knotsU = p.slice(o, o + nu + M1 + 1);
  o += nu + M1 + 1;
  const knotsV = p.slice(o, o + nv + M2 + 1);
  o += nv + M2 + 1;
  const w = p.slice(o, o + nu * nv);
  o += nu * nv;
  const poles: P3[][] = [], weights: number[][] = [];
  for (let i = 0; i < nu; i++) {
    poles.push([]);
    weights.push([]);
  }
  for (let j = 0; j < nv; j++)
    for (let i = 0; i < nu; i++) {
      const k = j * nu + i;
      poles[i][j] = [p[o + k * 3], p[o + k * 3 + 1], p[o + k * 3 + 2]];
      weights[i][j] = w[k];
    }
  const rational = !w.every((x) => Math.abs(x - 1) < 1e-14);
  return { degreeU: M1, degreeV: M2, knotsU, knotsV, poles, weights: rational ? weights : undefined };
}

// ----------------------------------------------------------------- write ---

/** Number formatting: compact, exact enough for CAD (15 significant digits). */
function f(x: number): string {
  if (!Number.isFinite(x)) return "0.";
  if (Number.isInteger(x) && Math.abs(x) < 1e15) return `${x}.`;
  const s = x.toPrecision(15).replace(/(\.\d*?)0+(e|$)/, "$1$2").replace(/\.(e|$)/, ".$1");
  return s.replace("e", "E");
}
/** Hollerith string; non-ASCII characters are escaped as &#xHHHH; (IGES is ASCII only). */
export const escapeIgesName = (s: string) => s.replace(/[^\x20-\x7e]|&/g, (c) => `&#x${c.codePointAt(0)!.toString(16)};`);
const H = (s: string) => {
  const a = escapeIgesName(s);
  return `${a.length}H${a}`;
};
export const unescapeName = (s: string) => s.replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)));

class Writer {
  private ents: { type: number; form: number; params: string[]; status: string; color: number; label: string }[] = [];
  add(type: number, params: (string | number)[], opt: { form?: number; status?: string; color?: number; label?: string } = {}): number {
    this.ents.push({ type, form: opt.form ?? 0, params: [String(type), ...params.map((p) => (typeof p === "number" ? (Number.isInteger(p) ? String(p) : f(p)) : p))], status: opt.status ?? "00000000", color: opt.color ?? 0, label: opt.label ?? "" });
    return this.ents.length * 2 - 1; // DE sequence number of the new entity
  }
  /** Floats that must be written as reals (knots, coordinates). */
  static r(x: number) {
    return f(x);
  }
  build(fileName: string, author: string, inch = false): string {
    const out: string[] = [];
    const line = (data: string, sec: string, n: number) => data.padEnd(72).slice(0, 72) + sec + String(n).padStart(7);
    const start = ["3DCAD Studio IGES export"];
    start.forEach((s, i) => out.push(line(s, "S", i + 1)));
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const date = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}.${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const gp = [H(","), H(";"), H(fileName), H(fileName), H("3DCAD Studio"), H("3DCAD Studio IGES 1.0"), "32", "38", "6", "308", "15", H(fileName), "1.", inch ? "1" : "2", H(inch ? "INCH" : "MM"), "1", "0.", H(date), inch ? "4.E-08" : "1.E-06", inch ? "40." : "1000.", H(author), H("3DCAD Studio"), "11", "0", H(date)];
    const gl = wrapParams(gp, ",", ";", 72);
    gl.forEach((s, i) => out.push(line(s, "G", i + 1)));
    // parameter data
    const pdLines: string[] = [];
    const deLines: string[] = [];
    this.ents.forEach((e, k) => {
      const de = k * 2 + 1;
      const pl = wrapParams(e.params, ",", ";", 64);
      const first = pdLines.length + 1;
      pl.forEach((s) => pdLines.push(s.padEnd(64) + " " + String(de).padStart(7) + "P" + String(pdLines.length + 1).padStart(7)));
      const c8 = (v: string | number) => String(v).padStart(8);
      deLines.push(c8(e.type) + c8(first) + c8(0) + c8(0) + c8(0) + c8(0) + c8(0) + c8(0) + e.status.padStart(8, "0") + "D" + String(de).padStart(7));
      deLines.push(c8(e.type) + c8(0) + c8(e.color) + c8(pl.length) + c8(e.form) + c8("") + c8("") + e.label.slice(0, 8).padStart(8) + c8(0) + "D" + String(de + 1).padStart(7));
    });
    out.push(...deLines, ...pdLines);
    out.push(`S${String(start.length).padStart(7)}G${String(gl.length).padStart(7)}D${String(deLines.length).padStart(7)}P${String(pdLines.length).padStart(7)}`.padEnd(72) + "T" + "1".padStart(7));
    return out.join("\n") + "\n";
  }
}

/** Packs parameters into fixed-width lines (never splitting a token unless a Hollerith string is too long). */
function wrapParams(params: string[], pd: string, rd: string, width: number): string[] {
  const lines: string[] = [];
  let cur = "";
  params.forEach((p, i) => {
    const tok = p + (i === params.length - 1 ? rd : pd);
    if (cur.length + tok.length > width) {
      if (cur) lines.push(cur);
      cur = "";
      let t = tok;
      while (t.length > width) {
        lines.push(t.slice(0, width));
        t = t.slice(width);
      }
      cur = t;
    } else cur += tok;
  });
  if (cur) lines.push(cur);
  return lines;
}

function curveParams(c: NurbsCurve): (string | number)[] {
  const K = c.poles.length - 1;
  const w = c.weights ?? c.poles.map(() => 1);
  const [t0, t1] = curveRange(c);
  const planar = 0;
  return [K, c.degree, planar, 0, c.weights ? 0 : 1, 0, ...c.knots.map(Writer.r), ...w.map(Writer.r), ...c.poles.flatMap((p) => p.map(Writer.r)), Writer.r(t0), Writer.r(t1), "0.", "0.", "0."];
}

function surfaceParams(s: NurbsSurface): (string | number)[] {
  const nu = s.poles.length, nv = s.poles[0].length;
  const w: string[] = [], P: string[] = [];
  for (let j = 0; j < nv; j++)
    for (let i = 0; i < nu; i++) {
      w.push(Writer.r(s.weights?.[i][j] ?? 1));
      P.push(...s.poles[i][j].map(Writer.r));
    }
  const [u0, u1, v0, v1] = surfaceRange(s);
  return [nu - 1, nv - 1, s.degreeU, s.degreeV, 0, 0, s.weights ? 0 : 1, 0, 0, ...s.knotsU.map(Writer.r), ...s.knotsV.map(Writer.r), ...w, ...P, Writer.r(u0), Writer.r(u1), Writer.r(v0), Writer.r(v1)];
}

/** IGES text for bodies of trimmed NURBS faces (coordinates in mm). */
export function writeIges(bodies: IgesBody[], fileName = "model.igs", author = "3DCAD Studio", units: "mm" | "inch" = "mm"): string {
  const w = new Writer();
  const k = units === "inch" ? 1 / 25.4 : 1;
  const sc = (c: NurbsCurve): NurbsCurve => (k === 1 ? c : { ...c, poles: c.poles.map((p) => p.map((x) => x * k) as P3) });
  const ss = (x: NurbsSurface): NurbsSurface => (k === 1 ? x : { ...x, poles: x.poles.map((r) => r.map((p) => p.map((v) => v * k) as P3)) });
  const DEP = "00010001"; // physically dependent, geometry
  for (const b of bodies) {
    let color = 0;
    if (b.color) color = -w.add(314, [Writer.r(b.color[0] * 100), Writer.r(b.color[1] * 100), Writer.r(b.color[2] * 100), H(b.name.slice(0, 40) || "COLOR")], { status: "00000200" });
    const faceDes: number[] = [];
    for (const face of b.faces) {
      const sde = w.add(128, surfaceParams(ss(face.surface)), { status: DEP, color });
      const loop = (cs: NurbsCurve[]) => {
        const segs = cs.map((c) => w.add(126, curveParams(sc(c)), { status: DEP, color }));
        const comp = w.add(102, [segs.length, ...segs], { status: DEP, color });
        return w.add(142, [0, sde, 0, comp, 2], { status: DEP, color });
      };
      const outer = face.outer ? loop(face.outer) : 0;
      const inner = face.inner.map(loop);
      faceDes.push(w.add(144, [sde, face.outer ? 1 : 0, inner.length, outer, ...inner], { color }));
    }
    const nameDe = w.add(406, [1, H(b.name || "BODY")], { form: 15, status: "00000300" });
    w.add(402, [faceDes.length, ...faceDes, 0, 1, nameDe], { form: 7, color, label: b.name.replace(/[^\x20-\x7e]/g, "").slice(0, 8) });
  }
  return w.build(fileName, author, units === "inch");
}
