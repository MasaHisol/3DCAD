// DXF (AutoCAD 2D exchange) — reading sketches, writing sketches / drawings.
//
// Output is DXF R12 (AC1009), the most widely readable version (AutoCAD,
// Jw_cad, DraftSight, LibreCAD, BricsCAD, Inventor), with
//  - JIS-style layers: 外形線 / かくれ線 / 中心線 / 細線 / 寸法 / 文字 / ハッチング / 図枠
//  - real line types (CONTINUOUS / HIDDEN / CENTER) so dashed lines stay dashed
//  - Shift_JIS text with $DWGCODEPAGE ANSI_932, the encoding Japanese CAD
//    software expects in R12 files (UTF-8 text shows as garbage there)
//  - section hatching as real 45° lines.
// Input understands LINE, CIRCLE, ARC, LWPOLYLINE, POLYLINE (bulges),
// SPLINE, ELLIPSE and INSERT (blocks), in UTF-8 or Shift_JIS.

import type { SkEntity, SketchFeature } from "../core/types";

// --------------------------------------------------------------- encoding ---

let sjisMap: Map<string, number[]> | null = null;

/** char -> Shift_JIS bytes, built from the platform decoder (null if unsupported). */
function sjisTable(): Map<string, number[]> | null {
  if (sjisMap) return sjisMap;
  let dec: TextDecoder;
  try {
    dec = new TextDecoder("shift_jis", { fatal: true });
  } catch {
    return null;
  }
  const m = new Map<string, number[]>();
  for (let b = 0xa1; b <= 0xdf; b++) m.set(dec.decode(new Uint8Array([b])), [b]);
  const leads = [...Array(0x9f - 0x81 + 1).keys()].map((i) => i + 0x81).concat([...Array(0xfc - 0xe0 + 1).keys()].map((i) => i + 0xe0));
  for (const l of leads)
    for (let t = 0x40; t <= 0xfc; t++) {
      if (t === 0x7f) continue;
      try {
        const ch = dec.decode(new Uint8Array([l, t]));
        if (ch.length === 1 && !m.has(ch)) m.set(ch, [l, t]);
      } catch {
        /* unassigned */
      }
    }
  sjisMap = m;
  return m;
}

/** Encode DXF text: Shift_JIS (Japanese CAD) or UTF-8. Unmappable characters become \U+XXXX escapes. */
export function encodeDxf(text: string, encoding: "sjis" | "utf8" = "sjis"): Uint8Array {
  const table = encoding === "sjis" ? sjisTable() : null;
  if (!table) {
    // ASCII + AutoCAD unicode escapes keep the file readable everywhere
    const esc = text.replace(/[^\x00-\x7f]/g, (c) => `\\U+${c.codePointAt(0)!.toString(16).toUpperCase().padStart(4, "0")}`);
    return new TextEncoder().encode(esc);
  }
  const out: number[] = [];
  for (const ch of text) {
    const c = ch.codePointAt(0)!;
    if (c < 0x80) out.push(c);
    else {
      const b = table.get(ch);
      if (b) out.push(...b);
      else for (const x of `\\U+${c.toString(16).toUpperCase().padStart(4, "0")}`) out.push(x.charCodeAt(0));
    }
  }
  return Uint8Array.from(out);
}

/** Decode a DXF file: honours $DWGCODEPAGE (ANSI_932 = Shift_JIS), falls back to UTF-8, then Shift_JIS. */
export function decodeDxf(bytes: Uint8Array): string {
  const head = new TextDecoder("latin1").decode(bytes.subarray(0, Math.min(bytes.length, 20000)));
  const cp = /\$DWGCODEPAGE\s*\r?\n\s*3\s*\r?\n\s*(\S+)/.exec(head)?.[1]?.toUpperCase();
  const tryDec = (enc: string, fatal: boolean) => {
    try {
      return new TextDecoder(enc, { fatal }).decode(bytes);
    } catch {
      return null;
    }
  };
  let text: string | null = null;
  if (cp === "ANSI_932" || cp === "DOS932") text = tryDec("shift_jis", false);
  text ??= tryDec("utf-8", true) ?? tryDec("shift_jis", false) ?? new TextDecoder().decode(bytes);
  // \U+XXXX escapes
  return text.replace(/\\U\+([0-9A-Fa-f]{4})/g, (_, h) => String.fromCodePoint(parseInt(h, 16)));
}

// ------------------------------------------------------------------ DXF in ---

export interface DxfResult {
  entities: SkEntity[];
  skipped: Record<string, number>;
}

type Ent = { type: string; codes: [number, string][] };
type Xf = { m: [number, number, number, number, number, number]; s: number };
const IDENT: Xf = { m: [1, 0, 0, 1, 0, 0], s: 1 };

/** Reads the geometry of an ASCII DXF into sketch entities (shared end points). */
export function parseDxf(text: string): DxfResult {
  const lines = text.split(/\r?\n/);
  const pairs: [number, string][] = [];
  for (let i = 0; i + 1 < lines.length; i += 2) pairs.push([parseInt(lines[i].trim(), 10), lines[i + 1].trim()]);
  // sections: ENTITIES and BLOCKS
  const ents: Ent[] = [];
  const blocks = new Map<string, { base: [number, number]; ents: Ent[] }>();
  let section = "";
  let cur: Ent | null = null;
  let block: { name: string; base: [number, number]; ents: Ent[] } | null = null;
  const flush = () => {
    if (!cur) return;
    if (section === "ENTITIES") ents.push(cur);
    else if (section === "BLOCKS" && block && cur.type !== "BLOCK" && cur.type !== "ENDBLK") block.ents.push(cur);
    cur = null;
  };
  for (let i = 0; i < pairs.length; i++) {
    const [c, v] = pairs[i];
    if (c === 0 && v === "SECTION") {
      flush();
      section = pairs[i + 1]?.[0] === 2 ? pairs[i + 1][1] : "";
      i++;
      continue;
    }
    if (c === 0 && v === "ENDSEC") {
      flush();
      section = "";
      continue;
    }
    if (section !== "ENTITIES" && section !== "BLOCKS") continue;
    if (c === 0) {
      flush();
      if (section === "BLOCKS" && v === "BLOCK") block = { name: "", base: [0, 0], ents: [] };
      if (section === "BLOCKS" && v === "ENDBLK" && block) {
        blocks.set(block.name, { base: block.base, ents: block.ents });
        block = null;
      }
      cur = { type: v, codes: [] };
    } else if (cur) {
      cur.codes.push([c, v]);
      if (cur.type === "BLOCK" && block) {
        if (c === 2) block.name = v;
        if (c === 10) block.base[0] = parseFloat(v);
        if (c === 20) block.base[1] = parseFloat(v);
      }
    }
  }
  flush();

  const out: SkEntity[] = [];
  const skipped: Record<string, number> = {};
  let n = 0;
  const pts = new Map<string, string>();
  const P = (x: number, y: number): string => {
    const k = `${x.toFixed(6)},${y.toFixed(6)}`;
    let id = pts.get(k);
    if (!id) {
      id = `dp${n++}`;
      pts.set(k, id);
      out.push({ id, type: "point", x, y });
    }
    return id;
  };
  const num = (codes: [number, string][], c: number, d = 0) => {
    const f = codes.find((x) => x[0] === c);
    return f ? parseFloat(f[1]) : d;
  };
  const all = (codes: [number, string][], c: number) => codes.filter((x) => x[0] === c).map((x) => parseFloat(x[1]));

  const process = (list: Ent[], xf: Xf, depth: number) => {
    const T = (x: number, y: number): [number, number] => [xf.m[0] * x + xf.m[2] * y + xf.m[4], xf.m[1] * x + xf.m[3] * y + xf.m[5]];
    const rotDeg = (Math.atan2(xf.m[1], xf.m[0]) * 180) / Math.PI;
    const mirrored = xf.m[0] * xf.m[3] - xf.m[1] * xf.m[2] < 0;
    const line = (x1: number, y1: number, x2: number, y2: number) => {
      const a = T(x1, y1), b = T(x2, y2);
      if (Math.hypot(b[0] - a[0], b[1] - a[1]) < 1e-9) return;
      out.push({ id: `dl${n++}`, type: "line", p1: P(...a), p2: P(...b) });
    };
    const poly = (p: [number, number][], closed = false) => {
      for (let i = 0; i + 1 < p.length; i++) line(...p[i], ...p[i + 1]);
      if (closed && p.length > 2) line(...p[p.length - 1], ...p[0]);
    };
    const arc = (cx: number, cy: number, r: number, a0: number, a1: number) => {
      // a0 -> a1 counter-clockwise (degrees), in block coordinates
      const c = T(cx, cy);
      let s = a0 + rotDeg, e = a1 + rotDeg;
      if (mirrored) [s, e] = [rotDeg - a1, rotDeg - a0];
      const R = r * xf.s;
      const ps: [number, number] = [c[0] + R * Math.cos((s * Math.PI) / 180), c[1] + R * Math.sin((s * Math.PI) / 180)];
      const pe: [number, number] = [c[0] + R * Math.cos((e * Math.PI) / 180), c[1] + R * Math.sin((e * Math.PI) / 180)];
      out.push({ id: `da${n++}`, type: "arc", c: P(...c), p1: P(...ps), p2: P(...pe) });
    };
    const bulgeSeg = (x1: number, y1: number, x2: number, y2: number, b: number) => {
      if (Math.abs(b) < 1e-9) return line(x1, y1, x2, y2);
      const theta = 4 * Math.atan(b);
      const d = Math.hypot(x2 - x1, y2 - y1);
      const r = d / (2 * Math.sin(Math.abs(theta) / 2));
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      const h = Math.sqrt(Math.max(0, r * r - (d / 2) ** 2)) * Math.sign(b) * (Math.abs(theta) > Math.PI ? -1 : 1);
      const ux = -(y2 - y1) / d, uy = (x2 - x1) / d;
      const cx = mx + ux * h, cy = my + uy * h;
      const a1 = (Math.atan2(y1 - cy, x1 - cx) * 180) / Math.PI, a2 = (Math.atan2(y2 - cy, x2 - cx) * 180) / Math.PI;
      if (b > 0) arc(cx, cy, r, a1, a2);
      else arc(cx, cy, r, a2, a1);
    };
    const polyline = (vs: { x: number; y: number; b: number }[], closed: boolean) => {
      for (let i = 0; i + 1 < vs.length; i++) bulgeSeg(vs[i].x, vs[i].y, vs[i + 1].x, vs[i + 1].y, vs[i].b);
      if (closed && vs.length > 2) bulgeSeg(vs[vs.length - 1].x, vs[vs.length - 1].y, vs[0].x, vs[0].y, vs[vs.length - 1].b);
    };
    for (let i = 0; i < list.length; i++) {
      const e = list[i];
      switch (e.type) {
        case "LINE":
          line(num(e.codes, 10), num(e.codes, 20), num(e.codes, 11), num(e.codes, 21));
          break;
        case "CIRCLE": {
          const c = T(num(e.codes, 10), num(e.codes, 20));
          out.push({ id: `dc${n++}`, type: "circle", c: P(...c), r: num(e.codes, 40) * xf.s });
          break;
        }
        case "ARC":
          arc(num(e.codes, 10), num(e.codes, 20), num(e.codes, 40), num(e.codes, 50), num(e.codes, 51));
          break;
        case "LWPOLYLINE": {
          const vs: { x: number; y: number; b: number }[] = [];
          for (const [c, v] of e.codes) {
            if (c === 10) vs.push({ x: parseFloat(v), y: 0, b: 0 });
            else if (c === 20 && vs.length) vs[vs.length - 1].y = parseFloat(v);
            else if (c === 42 && vs.length) vs[vs.length - 1].b = parseFloat(v);
          }
          polyline(vs, (num(e.codes, 70) & 1) === 1);
          break;
        }
        case "POLYLINE": {
          const closed = (num(e.codes, 70) & 1) === 1;
          const vs: { x: number; y: number; b: number }[] = [];
          while (list[i + 1]?.type === "VERTEX") {
            i++;
            vs.push({ x: num(list[i].codes, 10), y: num(list[i].codes, 20), b: num(list[i].codes, 42) });
          }
          if (list[i + 1]?.type === "SEQEND") i++;
          polyline(vs, closed);
          break;
        }
        case "ELLIPSE": {
          // centre, major axis end point (relative), minor/major ratio, parameter range
          const cx = num(e.codes, 10), cy = num(e.codes, 20), mx = num(e.codes, 11), my = num(e.codes, 21);
          const ratio = num(e.codes, 40, 1);
          let t0 = num(e.codes, 41, 0), t1 = num(e.codes, 42, Math.PI * 2);
          if (t1 <= t0) t1 += Math.PI * 2;
          const a = Math.hypot(mx, my), ang = Math.atan2(my, mx), b = a * ratio;
          const steps = Math.max(8, Math.ceil(((t1 - t0) / (Math.PI * 2)) * 72));
          const p: [number, number][] = [];
          for (let k = 0; k <= steps; k++) {
            const t = t0 + ((t1 - t0) * k) / steps;
            const x = a * Math.cos(t), y = b * Math.sin(t);
            p.push([cx + x * Math.cos(ang) - y * Math.sin(ang), cy + x * Math.sin(ang) + y * Math.cos(ang)]);
          }
          poly(p, Math.abs(t1 - t0 - Math.PI * 2) < 1e-9);
          break;
        }
        case "SPLINE": {
          const deg = num(e.codes, 71, 3);
          const knots = all(e.codes, 40);
          const wts = all(e.codes, 41);
          const cxs = all(e.codes, 10), cys = all(e.codes, 20);
          const fx = all(e.codes, 11), fy = all(e.codes, 21);
          const closed = (num(e.codes, 70) & 1) === 1;
          if (cxs.length > deg && knots.length === cxs.length + deg + 1) {
            const ctrl = cxs.map((x, k) => [x, cys[k], wts[k] ?? 1]);
            poly(sampleNurbs(deg, knots, ctrl, Math.max(16, ctrl.length * 8)), false);
          } else if (fx.length > 1) poly(fx.map((x, k) => [x, fy[k]] as [number, number]), closed);
          else skipped.SPLINE = (skipped.SPLINE ?? 0) + 1;
          break;
        }
        case "INSERT": {
          const b = blocks.get(e.codes.find((c) => c[0] === 2)?.[1] ?? "");
          if (!b || depth > 8) {
            skipped.INSERT = (skipped.INSERT ?? 0) + 1;
            break;
          }
          const sx = num(e.codes, 41, 1), sy = num(e.codes, 42, sx), r = (num(e.codes, 50) * Math.PI) / 180;
          const ix = num(e.codes, 10), iy = num(e.codes, 20);
          const c = Math.cos(r), s = Math.sin(r);
          // local: translate(-base) -> scale -> rotate -> translate(insert) -> parent
          const L: Xf["m"] = [c * sx, s * sx, -s * sy, c * sy, 0, 0];
          L[4] = ix - (L[0] * b.base[0] + L[2] * b.base[1]);
          L[5] = iy - (L[1] * b.base[0] + L[3] * b.base[1]);
          const m = xf.m;
          const comp: Xf["m"] = [
            m[0] * L[0] + m[2] * L[1], m[1] * L[0] + m[3] * L[1],
            m[0] * L[2] + m[2] * L[3], m[1] * L[2] + m[3] * L[3],
            m[0] * L[4] + m[2] * L[5] + m[4], m[1] * L[4] + m[3] * L[5] + m[5],
          ];
          process(b.ents, { m: comp, s: xf.s * Math.sqrt(Math.abs(sx * sy)) }, depth + 1);
          break;
        }
        case "POINT":
          P(...T(num(e.codes, 10), num(e.codes, 20)));
          break;
        default:
          skipped[e.type] = (skipped[e.type] ?? 0) + 1;
      }
    }
  };
  process(ents, IDENT, 0);
  return { entities: out, skipped };
}

/** Rational B-spline (NURBS) sampled at n+1 parameter values (de Boor). */
export function sampleNurbs(deg: number, knots: number[], ctrl: number[][], n: number): [number, number][] {
  const t0 = knots[deg], t1 = knots[knots.length - deg - 1];
  const out: [number, number][] = [];
  for (let k = 0; k <= n; k++) {
    const t = Math.min(t1 - 1e-12, t0 + ((t1 - t0) * k) / n);
    let span = deg;
    while (span < knots.length - deg - 2 && t >= knots[span + 1]) span++;
    const d = [];
    for (let j = 0; j <= deg; j++) {
      const [x, y, w] = ctrl[span - deg + j];
      d.push([x * w, y * w, w]);
    }
    for (let r = 1; r <= deg; r++)
      for (let j = deg; j >= r; j--) {
        const i = span - deg + j;
        const den = knots[i + deg - r + 1] - knots[i];
        const a = den ? (t - knots[i]) / den : 0;
        for (let c = 0; c < 3; c++) d[j][c] = (1 - a) * d[j - 1][c] + a * d[j][c];
      }
    out.push([d[deg][0] / d[deg][2], d[deg][1] / d[deg][2]]);
  }
  return out;
}

// ----------------------------------------------------------------- DXF out ---

/** Layer name, ACI colour, line type. */
export const DXF_LAYERS: [string, number, string][] = [
  ["0", 7, "CONTINUOUS"],
  ["VISIBLE", 7, "CONTINUOUS"], // 外形線
  ["HIDDEN", 4, "HIDDEN"], // かくれ線
  ["CENTER", 1, "CENTER"], // 中心線
  ["THIN", 8, "CONTINUOUS"], // 細線 (ねじの谷径など)
  ["DIM", 3, "CONTINUOUS"], // 寸法・注記
  ["TEXT", 7, "CONTINUOUS"], // 文字
  ["HATCH", 8, "CONTINUOUS"], // ハッチング
  ["FRAME", 7, "CONTINUOUS"], // 図枠・表題欄
  ["CONSTRUCTION", 8, "HIDDEN"],
  ["OUTER", 7, "CONTINUOUS"],
  ["BEND_UP", 1, "CENTER"],
  ["BEND_DOWN", 5, "HIDDEN"],
];

export class DxfWriter {
  private body: string[] = [];
  private add(...kv: (string | number)[]) {
    for (let i = 0; i < kv.length; i += 2) this.body.push(String(kv[i]), typeof kv[i + 1] === "number" ? (kv[i + 1] as number).toFixed(6) : String(kv[i + 1]));
  }
  line(x1: number, y1: number, x2: number, y2: number, layer = "0") {
    this.add(0, "LINE", 8, layer, 10, x1, 20, y1, 30, 0, 11, x2, 21, y2, 31, 0);
  }
  circle(x: number, y: number, r: number, layer = "0") {
    this.add(0, "CIRCLE", 8, layer, 10, x, 20, y, 30, 0, 40, r);
  }
  arc(x: number, y: number, r: number, a0: number, a1: number, layer = "0") {
    this.add(0, "ARC", 8, layer, 10, x, 20, y, 30, 0, 40, r, 50, a0, 51, a1);
  }
  text(x: number, y: number, h: number, s: string, rot = 0, layer = "TEXT") {
    this.add(0, "TEXT", 8, layer, 10, x, 20, y, 30, 0, 40, h, 1, s, 50, rot);
  }
  toString(): string {
    const head = ["0", "SECTION", "2", "HEADER", "9", "$ACADVER", "1", "AC1009", "9", "$DWGCODEPAGE", "3", "ANSI_932", "9", "$INSUNITS", "70", "4", "9", "$LTSCALE", "40", "1.0", "0", "ENDSEC"];
    const ltypes = [
      ["CONTINUOUS", "Solid line", []],
      ["HIDDEN", "Hidden __ __ __", [3, -1.5]],
      ["CENTER", "Center ____ _ ____", [12, -1.5, 1.5, -1.5]],
    ] as [string, string, number[]][];
    const ltab = ["0", "TABLE", "2", "LTYPE", "70", String(ltypes.length)];
    for (const [name, desc, pat] of ltypes)
      ltab.push("0", "LTYPE", "2", name, "70", "0", "3", desc, "72", "65", "73", String(pat.length), "40", pat.reduce((s, v) => s + Math.abs(v), 0).toFixed(3), ...pat.flatMap((v) => ["49", v.toFixed(3)]));
    ltab.push("0", "ENDTAB");
    const lay = ["0", "TABLE", "2", "LAYER", "70", String(DXF_LAYERS.length)];
    for (const [name, color, lt] of DXF_LAYERS) lay.push("0", "LAYER", "2", name, "70", "0", "62", String(color), "6", lt);
    lay.push("0", "ENDTAB");
    return [...head, "0", "SECTION", "2", "TABLES", ...ltab, ...lay, "0", "ENDSEC", "0", "SECTION", "2", "ENTITIES", ...this.body, "0", "ENDSEC", "0", "EOF", ""].join("\r\n");
  }
}

export function sketchToDxf(sk: SketchFeature): string {
  const w = new DxfWriter();
  const pts = new Map(sk.entities.filter((e) => e.type === "point").map((p) => [p.id, p as Extract<SkEntity, { type: "point" }>]));
  for (const e of sk.entities) {
    const lay = e.construction ? "CONSTRUCTION" : "VISIBLE";
    if (e.type === "line") {
      const a = pts.get(e.p1)!, b = pts.get(e.p2)!;
      w.line(a.x, a.y, b.x, b.y, lay);
    } else if (e.type === "circle") {
      const c = pts.get(e.c)!;
      w.circle(c.x, c.y, e.r, lay);
    } else if (e.type === "arc") {
      const c = pts.get(e.c)!, a = pts.get(e.p1)!, b = pts.get(e.p2)!;
      const r = Math.hypot(a.x - c.x, a.y - c.y);
      w.arc(c.x, c.y, r, (Math.atan2(a.y - c.y, a.x - c.x) * 180) / Math.PI, (Math.atan2(b.y - c.y, b.x - c.x) * 180) / Math.PI, lay);
    }
  }
  return w.toString();
}

/** 45° hatch lines (spacing in mm) inside polygons (even-odd), as segments. */
export function hatchLines(rings: [number, number][][], spacing = 2.5, angleDeg = 45): [number, number, number, number][] {
  const a = (angleDeg * Math.PI) / 180;
  const c = Math.cos(a), s = Math.sin(a);
  // rotate so the hatch lines are horizontal
  const rot = rings.map((r) => r.map(([x, y]) => [x * c + y * s, -x * s + y * c] as [number, number]));
  let ymin = Infinity, ymax = -Infinity;
  for (const r of rot) for (const p of r) (ymin = Math.min(ymin, p[1])), (ymax = Math.max(ymax, p[1]));
  const out: [number, number, number, number][] = [];
  for (let y = Math.ceil(ymin / spacing) * spacing; y <= ymax; y += spacing) {
    const xs: number[] = [];
    for (const r of rot)
      for (let i = 0; i < r.length; i++) {
        const p = r[i], q = r[(i + 1) % r.length];
        if ((p[1] <= y) !== (q[1] <= y)) xs.push(p[0] + ((y - p[1]) / (q[1] - p[1])) * (q[0] - p[0]));
      }
    xs.sort((u, v) => u - v);
    for (let i = 0; i + 1 < xs.length; i += 2) {
      const [x1, x2] = [xs[i], xs[i + 1]];
      out.push([x1 * c - y * s, x1 * s + y * c, x2 * c - y * s, x2 * s + y * c]);
    }
  }
  return out;
}

/** Layer for an SVG element of a rendered drawing sheet. */
function layerOf(el: Element): string {
  if (el.closest(".title-block") || el.classList.contains("frame")) return "FRAME";
  if (el.closest(".hidden-lines") || el.classList.contains("hidden-lines")) return "HIDDEN";
  if (el.classList.contains("thread-lines")) return "THIN";
  const dash = el.getAttribute("stroke-dasharray") ?? el.closest("[stroke-dasharray]")?.getAttribute("stroke-dasharray");
  if (dash && dash.trim().split(/[\s,]+/).length >= 4) return "CENTER";
  if (dash) return "HIDDEN";
  if (el.closest(".anno")) return "DIM";
  if (el.closest(".dview")) return "VISIBLE";
  return "FRAME";
}

/**
 * Converts an SVG drawing (paths in mm, y down) into DXF (y up). Straight
 * segments become LINEs, curves are sampled into short LINEs, section
 * hatching becomes 45° lines on the HATCH layer.
 */
export function svgToDxf(svg: SVGSVGElement, heightMm: number): string {
  const w = new DxfWriter();
  const paths = svg.querySelectorAll("path, rect, line, circle, text");
  paths.forEach((el) => {
    if (el.classList.contains("paper")) return;
    if (el.closest("defs, clipPath, pattern")) return;
    const lay = layerOf(el);
    const ctm = (el as SVGGraphicsElement).getCTM();
    const root = svg.getCTM();
    const m = ctm && root ? root.inverse().multiply(ctm) : null;
    const tp = (x: number, y: number): [number, number] => {
      if (!m) return [x, heightMm - y];
      return [m.a * x + m.c * y + m.e, heightMm - (m.b * x + m.d * y + m.f)];
    };
    if (el instanceof SVGTextElement) {
      const x = parseFloat(el.getAttribute("x") ?? "0"), y = parseFloat(el.getAttribute("y") ?? "0");
      const size = parseFloat(el.getAttribute("font-size") ?? "3.5");
      const s = el.textContent ?? "";
      if (!s.trim()) return;
      const anchor = el.getAttribute("text-anchor") ?? "start";
      const rotM = /rotate\(([-0-9.]+)/.exec(el.getAttribute("transform") ?? "");
      const rot = rotM ? -parseFloat(rotM[1]) : 0;
      // CJK glyphs are about twice as wide as Latin ones
      const width = [...s].reduce((acc, ch) => acc + (ch.charCodeAt(0) > 0xff ? 1 : 0.62), 0) * size;
      const wEst = width * (anchor === "middle" ? 0.5 : anchor === "end" ? 1 : 0);
      const [px, py] = tp(x, y);
      const r = (rot * Math.PI) / 180;
      w.text(px - wEst * Math.cos(r), py - wEst * Math.sin(r), size, s, rot, lay === "FRAME" ? "FRAME" : "TEXT");
      return;
    }
    if (el instanceof SVGCircleElement) {
      const [cx, cy] = tp(el.cx.baseVal.value, el.cy.baseVal.value);
      w.circle(cx, cy, el.r.baseVal.value * (m ? Math.hypot(m.a, m.b) : 1), lay);
      return;
    }
    if (el instanceof SVGRectElement) {
      const x = el.x.baseVal.value, y = el.y.baseVal.value, ww = el.width.baseVal.value, hh = el.height.baseVal.value;
      const c = [tp(x, y), tp(x + ww, y), tp(x + ww, y + hh), tp(x, y + hh)];
      for (let i = 0; i < 4; i++) w.line(...c[i], ...c[(i + 1) % 4], lay);
      return;
    }
    if (!(el instanceof SVGPathElement)) return;
    const d = el.getAttribute("d") ?? "";
    const hatch = /url\(#hatch\)/.test(el.getAttribute("fill") ?? "");
    if (/^[MLZ0-9.\s,eE+-]+$/i.test(d)) {
      // polyline path
      const toks = d.match(/[MLZ]|-?[0-9.]+(?:e[-+]?\d+)?/gi) ?? [];
      const rings: [number, number][][] = [];
      let cmd = "M", start: [number, number] | null = null, last: [number, number] | null = null;
      for (let i = 0; i < toks.length; ) {
        const t = toks[i];
        if (/[MLZ]/i.test(t)) {
          cmd = t.toUpperCase();
          i++;
          if (cmd === "Z" && last && start) {
            if (!hatch) w.line(...tp(...last), ...tp(...start), lay);
            last = start;
          }
          continue;
        }
        const p: [number, number] = [parseFloat(toks[i]), parseFloat(toks[i + 1])];
        i += 2;
        if (cmd === "M") {
          start = last = p;
          rings.push([tp(...p)]);
          cmd = "L";
        } else if (last) {
          if (!hatch) w.line(...tp(...last), ...tp(...p), lay);
          rings[rings.length - 1].push(tp(...p));
          last = p;
        }
      }
      if (hatch) for (const [x1, y1, x2, y2] of hatchLines(rings)) w.line(x1, y1, x2, y2, "HATCH");
      return;
    }
    // curves: sample
    const len = el.getTotalLength();
    const steps = Math.max(8, Math.ceil(len / 0.5));
    let prev = el.getPointAtLength(0);
    for (let i = 1; i <= steps; i++) {
      const q = el.getPointAtLength((len * i) / steps);
      w.line(...tp(prev.x, prev.y), ...tp(q.x, q.y), lay);
      prev = q;
    }
  });
  return w.toString();
}
