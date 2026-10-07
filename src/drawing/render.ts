// Renders a drawing sheet to SVG (sheet millimetres, y down). The same markup
// is shown in the editor, printed to PDF and converted to DXF.

import type { Vec2 } from "../core/types";
import type { Seg2, ViewGeometry } from "../kernel/protocol";
import { dimText, dimValue, holeThread, linearPoints, sameCircles, toSheet } from "./geom";
import { scaleText, sheetSize, type Anno, type DimAnno, type DrawingDoc, type DView, type Sheet } from "./types";

export interface BomRow {
  item: number;
  name: string;
  qty: number;
  material: string;
  note: string;
}

export interface RenderCtx {
  doc: DrawingDoc;
  sheet: Sheet;
  geom: Map<string, ViewGeometry>;
  bom: BomRow[];
  /** Placement index -> BOM item number (balloons). */
  itemOfTag: (tag: number) => number | undefined;
  selected?: Set<string>;
  sheetIndex: number;
}

const W = { thick: 0.5, thin: 0.25, fine: 0.18, border: 0.7 };
const FONT = `'Yu Gothic UI','Hiragino Sans','Noto Sans CJK JP','Noto Sans JP',sans-serif`;
const f = (n: number) => (Math.abs(n) < 1e-9 ? "0" : n.toFixed(3).replace(/\.?0+$/, ""));
const esc = (s: string) => s.replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" })[c]!);

function segPath(v: DView, s: Seg2): string {
  const P = (p: Vec2) => {
    const q = toSheet(v, p);
    return `${f(q[0])} ${f(q[1])}`;
  };
  if (s.t === "line") return `M${P(s.a)}L${P(s.b)}`;
  if (s.t === "poly") return "M" + s.pts.map(P).join("L");
  const r = s.r * v.scale;
  if (s.t === "circle") {
    const c = toSheet(v, s.c);
    return `M${f(c[0] + r)} ${f(c[1])}A${f(r)} ${f(r)} 0 1 0 ${f(c[0] - r)} ${f(c[1])}A${f(r)} ${f(r)} 0 1 0 ${f(c[0] + r)} ${f(c[1])}`;
  }
  const a: Vec2 = [s.c[0] + s.r * Math.cos(s.a0), s.c[1] + s.r * Math.sin(s.a0)];
  const b: Vec2 = [s.c[0] + s.r * Math.cos(s.a1), s.c[1] + s.r * Math.sin(s.a1)];
  let span = s.a1 - s.a0;
  while (span < 0) span += 2 * Math.PI;
  // view CCW becomes sheet CW (y flipped) -> sweep flag 0
  return `M${P(a)}A${f(r)} ${f(r)} 0 ${span > Math.PI ? 1 : 0} 0 ${P(b)}`;
}

function arrow(tip: Vec2, from: Vec2, len = 3, wid = 0.9): string {
  const dx = tip[0] - from[0], dy = tip[1] - from[1];
  const l = Math.hypot(dx, dy) || 1;
  const ux = dx / l, uy = dy / l;
  const bx = tip[0] - ux * len, by = tip[1] - uy * len;
  return `<path d="M${f(tip[0])} ${f(tip[1])}L${f(bx - uy * wid)} ${f(by + ux * wid)}L${f(bx + uy * wid)} ${f(by - ux * wid)}Z" fill="#000" stroke="none"/>`;
}

function text(x: number, y: number, s: string, size = 3.5, anchor: "start" | "middle" | "end" = "middle", rot = 0, extra = ""): string {
  const tr = rot ? ` transform="rotate(${f(rot)} ${f(x)} ${f(y)})"` : "";
  return `<text x="${f(x)}" y="${f(y)}" font-size="${size}" text-anchor="${anchor}" font-family="${FONT}" fill="#000" stroke="none"${tr}${extra}>${esc(s)}</text>`;
}

/** Dimension text block with optional stacked deviations / box / parentheses. */
function dimLabel(d: DimAnno, x: number, y: number, rot: number, holes: number): string {
  const t = dimText(d, holes);
  const size = 3.5;
  const main = t.paren ? `(${t.main})` : t.main;
  let out = text(x, y, main, size, "middle", rot);
  const w = main.length * size * 0.62;
  if (t.boxed) {
    out += `<rect x="${f(x - w / 2 - 1)}" y="${f(y - size - 0.6)}" width="${f(w + 2)}" height="${f(size + 1.8)}" fill="none" stroke="#000" stroke-width="${W.fine}"${rot ? ` transform="rotate(${f(rot)} ${f(x)} ${f(y)})"` : ""}/>`;
  }
  if (t.upper || t.lower) {
    const tr = rot ? ` transform="rotate(${f(rot)} ${f(x)} ${f(y)})"` : "";
    out += `<g${tr}>${text(x + w / 2 + 0.8, y - size * 0.55, t.upper ?? "", 2.5, "start")}${text(x + w / 2 + 0.8, y + 0.4, t.lower ?? "", 2.5, "start")}</g>`;
  }
  return out;
}

function renderDim(d: DimAnno, v: DView, g: ViewGeometry | undefined): string {
  const S = (p: Vec2) => toSheet(v, p);
  const P = S(d.pos);
  const parts: string[] = [];
  const line = (a: Vec2, b: Vec2) => parts.push(`<path d="M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}"/>`);
  const holes = d.kind === "hole" && g ? sameCircles(g, d.refs[0]?.r ?? 0) : 1;
  const thr = d.kind === "hole" ? holeThread(g, d.refs[0]) : null;
  if (d.kind === "diameter" || d.kind === "radius" || d.kind === "hole") {
    const r0 = d.refs[0];
    if (!r0) return "";
    const C = S(r0.p), r = (r0.r ?? 0) * v.scale;
    const dx = P[0] - C[0], dy = P[1] - C[1];
    const l = Math.hypot(dx, dy) || 1;
    const ux = dx / l, uy = dy / l;
    const edge: Vec2 = [C[0] + ux * r, C[1] + uy * r];
    if (d.kind === "diameter" && l < r) {
      // inside: full diameter line with two arrows
      const e2: Vec2 = [C[0] - ux * r, C[1] - uy * r];
      line(e2, edge);
      parts.push(arrow(edge, C), arrow(e2, C));
      const rot = (Math.atan2(uy, ux) * 180) / Math.PI;
      const rr = rot > 90 || rot < -90 ? rot + 180 : rot;
      parts.push(dimLabel(d, P[0], P[1] - 1, rr, holes));
    } else {
      const start: Vec2 = d.kind === "radius" ? C : edge;
      line(d.kind === "radius" ? C : edge, P);
      parts.push(arrow(edge, d.kind === "radius" ? C : P));
      const label = dimText(d, holes, thr).main;
      const sh = Math.max(8, label.length * 2.2 + 2);
      const dir = ux >= 0 ? 1 : -1;
      const E: Vec2 = [P[0] + dir * sh, P[1]];
      line(P, E);
      parts.push(dimLabel(d, (P[0] + E[0]) / 2, P[1] - 1, 0, holes));
      void start;
    }
  } else if (d.kind === "angle") {
    const [l1, l2] = d.refs;
    if (!l1?.p2 || !l2?.p2) return "";
    const a1 = S(l1.p), b1 = S(l1.p2), a2 = S(l2.p), b2 = S(l2.p2);
    const den = (a1[0] - b1[0]) * (a2[1] - b2[1]) - (a1[1] - b1[1]) * (a2[0] - b2[0]);
    if (Math.abs(den) < 1e-9) return "";
    const t = ((a1[0] - a2[0]) * (a2[1] - b2[1]) - (a1[1] - a2[1]) * (a2[0] - b2[0])) / den;
    const X: Vec2 = [a1[0] + t * (b1[0] - a1[0]), a1[1] + t * (b1[1] - a1[1])];
    const R = Math.hypot(P[0] - X[0], P[1] - X[1]);
    const la = Math.atan2(P[1] - X[1], P[0] - X[0]);
    const nrm = (x: number) => ((x % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI) - Math.PI;
    const pick = (a: Vec2, b: Vec2) => {
      const ds = [Math.atan2(b[1] - a[1], b[0] - a[0]), Math.atan2(a[1] - b[1], a[0] - b[0])];
      return ds.reduce((p, c) => (Math.abs(nrm(c - la)) < Math.abs(nrm(p - la)) ? c : p));
    };
    let s = pick(a1, b1), e = pick(a2, b2);
    if (nrm(e - s) < 0) [s, e] = [e, s];
    const span = nrm(e - s);
    const A: Vec2 = [X[0] + R * Math.cos(s), X[1] + R * Math.sin(s)], B: Vec2 = [X[0] + R * Math.cos(s + span), X[1] + R * Math.sin(s + span)];
    parts.push(`<path d="M${f(A[0])} ${f(A[1])}A${f(R)} ${f(R)} 0 0 1 ${f(B[0])} ${f(B[1])}"/>`);
    const tA: Vec2 = [A[0] - Math.sin(s) * 3, A[1] + Math.cos(s) * 3], tB: Vec2 = [B[0] + Math.sin(s + span) * 3, B[1] - Math.cos(s + span) * 3];
    parts.push(arrow(A, tA), arrow(B, tB));
    parts.push(dimLabel(d, P[0], P[1], 0, 1));
  } else {
    const pts = linearPoints(d);
    if (!pts) return "";
    const A = S(pts[0]), B = S(pts[1]);
    let dir: Vec2;
    if (d.kind === "horizontal") dir = [1, 0];
    else if (d.kind === "vertical") dir = [0, 1];
    else {
      const l = Math.hypot(B[0] - A[0], B[1] - A[1]) || 1;
      dir = [(B[0] - A[0]) / l, (B[1] - A[1]) / l];
    }
    const n: Vec2 = [-dir[1], dir[0]];
    const off = (p: Vec2) => (P[0] - p[0]) * n[0] + (P[1] - p[1]) * n[1];
    const A2: Vec2 = [A[0] + n[0] * off(A), A[1] + n[1] * off(A)];
    const B2: Vec2 = [B[0] + n[0] * off(B), B[1] + n[1] * off(B)];
    const ext = (p: Vec2, q: Vec2) => {
      const dx = q[0] - p[0], dy = q[1] - p[1];
      const l = Math.hypot(dx, dy);
      if (l < 1e-6) return;
      line([p[0] + (dx / l) * 1, p[1] + (dy / l) * 1], [q[0] + (dx / l) * 2, q[1] + (dy / l) * 2]);
    };
    ext(A, A2);
    ext(B, B2);
    line(A2, B2);
    const len = Math.hypot(B2[0] - A2[0], B2[1] - A2[1]);
    if (len > 8) parts.push(arrow(A2, B2), arrow(B2, A2));
    else {
      // small dimension: arrows outside
      const u: Vec2 = [(B2[0] - A2[0]) / (len || 1), (B2[1] - A2[1]) / (len || 1)];
      parts.push(arrow(A2, [A2[0] - u[0] * 4, A2[1] - u[1] * 4]), arrow(B2, [B2[0] + u[0] * 4, B2[1] + u[1] * 4]));
      line([A2[0] - u[0] * 6, A2[1] - u[1] * 6], A2);
      line(B2, [B2[0] + u[0] * 6, B2[1] + u[1] * 6]);
    }
    // text: along the dimension line, read from the bottom or the right (JIS)
    let rot = (Math.atan2(dir[1], dir[0]) * 180) / Math.PI;
    if (rot > 90) rot -= 180;
    if (rot <= -90) rot += 180;
    const along = (P[0] - A2[0]) * dir[0] + (P[1] - A2[1]) * dir[1];
    const tPos = Math.abs(along) > 0 && Math.abs(along) < len ? along : len / 2;
    const T: Vec2 = [A2[0] + dir[0] * tPos, A2[1] + dir[1] * tPos];
    const nn: Vec2 = [Math.sin((rot * Math.PI) / 180), -Math.cos((rot * Math.PI) / 180)];
    parts.push(dimLabel(d, T[0] + nn[0] * 1, T[1] + nn[1] * 1, rot, 1));
  }
  return parts.join("");
}

function renderAnno(a: Anno, views: Map<string, DView>, ctx: RenderCtx): string {
  const sel = ctx.selected?.has(a.id) ? " sel" : "";
  const open = (cls: string) => `<g class="anno ${cls}${sel}" data-id="${a.id}" stroke="#000" stroke-width="${W.fine}" fill="none">`;
  const vS = (vid: string, p: Vec2) => {
    const v = views.get(vid);
    return v ? toSheet(v, p) : null;
  };
  switch (a.type) {
    case "dim": {
      const v = views.get(a.view);
      return v ? open("dim") + renderDim(a, v, ctx.geom.get(v.id)) + "</g>" : "";
    }
    case "note": {
      const lines = a.text.split("\n");
      const size = a.size ?? 3.5;
      let out = open("note");
      lines.forEach((l, i) => (out += text(a.x, a.y + i * size * 1.5, l, size, "start")));
      if (a.leader) {
        const p = vS(a.leader.view, a.leader.p);
        if (p) {
          const s: Vec2 = [a.x - 1, a.y - size * 0.35];
          out += `<path d="M${f(s[0])} ${f(s[1])}L${f(p[0])} ${f(p[1])}"/>` + arrow(p, s);
        }
      }
      return out + "</g>";
    }
    case "surface": {
      const p = vS(a.view, a.p);
      if (!p) return "";
      const [x, y] = p;
      let out = open("surface");
      out += `<path d="M${f(x - 2.5)} ${f(y - 4.3)}L${f(x)} ${f(y)}L${f(x + 5)} ${f(y - 8.6)}L${f(x + 16)} ${f(y - 8.6)}"/>`;
      if (a.removal === "required") out += `<path d="M${f(x - 2.5)} ${f(y - 4.3)}L${f(x + 2.5)} ${f(y - 4.3)}"/>`;
      if (a.removal === "prohibited") out += `<circle cx="${f(x)}" cy="${f(y - 2.9)}" r="1.4"/>`;
      out += text(x + 6, y - 9.6, a.ra, 3, "start");
      return out + "</g>";
    }
    case "gdt": {
      const cells = [a.symbol, a.value, ...a.datums.split(/[\s,|]+/).filter(Boolean)];
      const widths = cells.map((c, i) => (i === 0 ? 7 : Math.max(7, c.length * 2.4 + 3)));
      let x = a.x;
      let out = open("gdt");
      cells.forEach((c, i) => {
        out += `<rect x="${f(x)}" y="${f(a.y)}" width="${f(widths[i])}" height="7"/>` + text(x + widths[i] / 2, a.y + 5, c, i === 0 ? 4.2 : 3.5);
        x += widths[i];
      });
      if (a.leader) {
        const p = vS(a.leader.view, a.leader.p);
        if (p) {
          const s: Vec2 = [a.x, a.y + 3.5];
          out += `<path d="M${f(s[0])} ${f(s[1])}L${f(s[0] - 4)} ${f(s[1])}L${f(p[0])} ${f(p[1])}"/>` + arrow(p, [s[0] - 4, s[1]]);
        }
      }
      return out + "</g>";
    }
    case "datum": {
      const p = vS(a.view, a.p), q = vS(a.view, a.pos);
      if (!p || !q) return "";
      const dx = q[0] - p[0], dy = q[1] - p[1];
      const l = Math.hypot(dx, dy) || 1;
      const ux = dx / l, uy = dy / l;
      let out = open("datum");
      out += `<path d="M${f(p[0] - uy * 1.8)} ${f(p[1] + ux * 1.8)}L${f(p[0] + uy * 1.8)} ${f(p[1] - ux * 1.8)}L${f(p[0] + ux * 2.6)} ${f(p[1] + uy * 2.6)}Z" fill="#000"/>`;
      out += `<path d="M${f(p[0] + ux * 2.6)} ${f(p[1] + uy * 2.6)}L${f(q[0])} ${f(q[1])}"/>`;
      out += `<rect x="${f(q[0] - 3.5)}" y="${f(q[1] - 3.5)}" width="7" height="7"/>` + text(q[0], q[1] + 1.4, a.letter, 4);
      return out + "</g>";
    }
    case "balloon": {
      const p = vS(a.view, a.p), q = vS(a.view, a.pos);
      if (!p || !q) return "";
      const item = ctx.itemOfTag(a.tag);
      const dx = p[0] - q[0], dy = p[1] - q[1];
      const l = Math.hypot(dx, dy) || 1;
      const R = 4.5;
      let out = open("balloon");
      out += `<path d="M${f(q[0] + (dx / l) * R)} ${f(q[1] + (dy / l) * R)}L${f(p[0])} ${f(p[1])}"/><circle cx="${f(p[0])}" cy="${f(p[1])}" r="0.6" fill="#000"/>`;
      out += `<circle cx="${f(q[0])}" cy="${f(q[1])}" r="${R}"/>` + text(q[0], q[1] + 1.5, item ? String(item) : "?", 4.2);
      return out + "</g>";
    }
    case "centerline": {
      const p = vS(a.view, a.a), q = vS(a.view, a.b);
      if (!p || !q) return "";
      const dx = q[0] - p[0], dy = q[1] - p[1];
      const l = Math.hypot(dx, dy) || 1;
      const e = 2.5;
      return `${open("centerline")}<path d="M${f(p[0] - (dx / l) * e)} ${f(p[1] - (dy / l) * e)}L${f(q[0] + (dx / l) * e)} ${f(q[1] + (dy / l) * e)}" stroke-dasharray="8 1.5 1 1.5"/></g>`;
    }
  }
}

function renderView(v: DView, ctx: RenderCtx, views: Map<string, DView>): string {
  const g = ctx.geom.get(v.id);
  const sel = ctx.selected?.has(v.id) ? " sel" : "";
  let out = `<g class="dview${sel}" data-id="${v.id}" fill="none" stroke-linecap="round" stroke-linejoin="round">`;
  if (!g) return out + text(v.x, v.y, "計算中…", 3.5) + "</g>";
  const clip = v.detail ? ` clip-path="url(#clip-${v.id})"` : "";
  if (v.detail) out += `<clipPath id="clip-${v.id}"><circle cx="${f(v.x)}" cy="${f(v.y)}" r="${f(v.detail.r * v.scale)}"/></clipPath>`;
  out += `<g${clip}>`;
  // section hatching (JIS: thin lines at 45°)
  if (g.hatch.length) {
    const d = g.hatch.map((face) => face.map((ring) => "M" + ring.map((p) => toSheet(v, p).map(f).join(" ")).join("L") + "Z").join("")).join("");
    out += `<path d="${d}" fill="url(#hatch)" fill-rule="evenodd" stroke="none"/>`;
  }
  if (v.hidden && g.hidden.length) out += `<path d="${g.hidden.map((s) => segPath(v, s)).join("")}" stroke="#000" stroke-width="${W.thin}" stroke-dasharray="3 1.2" class="hidden-lines"/>`;
  out += `<path d="${g.visible.map((s) => segPath(v, s)).join("")}" stroke="#000" stroke-width="${W.thick}" class="visible-lines"/>`;
  if (g.thin?.length) out += `<path d="${g.thin.map((s) => segPath(v, s)).join("")}" stroke="#000" stroke-width="${W.thin}" class="thread-lines"/>`;
  // centre marks for circles
  if (v.centerMarks) {
    const cm: string[] = [];
    const seen = new Set<string>();
    for (const s of g.visible) {
      if (s.t !== "circle" && s.t !== "arc") continue;
      const k = `${s.c[0].toFixed(3)},${s.c[1].toFixed(3)}`;
      if (seen.has(k)) continue;
      seen.add(k);
      const c = toSheet(v, s.c), r = s.r * v.scale + 2;
      cm.push(`M${f(c[0] - r)} ${f(c[1])}L${f(c[0] + r)} ${f(c[1])}M${f(c[0])} ${f(c[1] - r)}L${f(c[0])} ${f(c[1] + r)}`);
    }
    if (cm.length) out += `<path d="${cm.join("")}" stroke="#000" stroke-width="${W.fine}" stroke-dasharray="6 1.2 1 1.2"/>`;
  }
  out += "</g>";
  if (v.detail) out += `<circle cx="${f(v.x)}" cy="${f(v.y)}" r="${f(v.detail.r * v.scale)}" stroke="#000" stroke-width="${W.fine}"/>`;
  // cutting line / detail circle on this view for its children
  for (const c of views.values()) {
    if (c.parent !== v.id) continue;
    if (c.kind === "section" && c.section) {
      const A = toSheet(v, c.section.a), B = toSheet(v, c.section.b);
      const dx = B[0] - A[0], dy = B[1] - A[1];
      const l = Math.hypot(dx, dy) || 1;
      const ux = dx / l, uy = dy / l;
      // arrows point the viewing direction: away from the kept material
      const nx = -uy * (c.section.flip ? -1 : 1), ny = ux * (c.section.flip ? -1 : 1);
      out += `<path d="M${f(A[0] - ux * 3)} ${f(A[1] - uy * 3)}L${f(B[0] + ux * 3)} ${f(B[1] + uy * 3)}" stroke="#000" stroke-width="${W.fine}" stroke-dasharray="10 1.5 1.5 1.5"/>`;
      for (const [P, s] of [
        [A, -1],
        [B, 1],
      ] as [Vec2, number][]) {
        const E: Vec2 = [P[0] + ux * 3 * s, P[1] + uy * 3 * s];
        out += `<path d="M${f(P[0])} ${f(P[1])}L${f(E[0])} ${f(E[1])}" stroke="#000" stroke-width="${W.thick * 1.4}"/>`;
        const T: Vec2 = [E[0] - nx * 6, E[1] - ny * 6];
        out += `<path d="M${f(E[0])} ${f(E[1])}L${f(T[0])} ${f(T[1])}" stroke="#000" stroke-width="${W.fine}"/>` + arrow(T, E, 3, 1);
        out += text(T[0] - nx * 3 + ux * 3 * s, T[1] - ny * 3 + uy * 3 * s + 1.8, c.label.split("-")[0], 5);
      }
    }
    if (c.kind === "detail" && c.detail) {
      const C = toSheet(v, c.detail.c), r = c.detail.r * v.scale;
      out += `<circle cx="${f(C[0])}" cy="${f(C[1])}" r="${f(r)}" stroke="#000" stroke-width="${W.thin}" stroke-dasharray="6 1.2 1 1.2"/>`;
      out += text(C[0] + r * 0.75 + 2, C[1] - r * 0.75 - 1, c.label, 5);
    }
  }
  // view label
  const b = viewBounds(v, g);
  const base = baseScale(ctx.sheet);
  let label = "";
  if (v.kind === "section") label = `断面 ${v.label}`;
  else if (v.kind === "detail") label = `詳細 ${v.label}`;
  else if (v.label && v.kind !== "projected") label = v.label;
  const sc = Math.abs(v.scale - base) > 1e-9 || v.kind === "detail" ? ` (${scaleText(v.scale)})` : "";
  if (label || sc) out += text((b[0] + b[2]) / 2, b[3] + 7, `${label}${sc}`, 4);
  return out + "</g>";
}

function viewBounds(v: DView, g: ViewGeometry): [number, number, number, number] {
  if (v.detail) {
    const r = v.detail.r * v.scale;
    return [v.x - r, v.y - r, v.x + r, v.y + r];
  }
  const a = toSheet(v, [g.bounds[0], g.bounds[1]]), b = toSheet(v, [g.bounds[2], g.bounds[3]]);
  return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])];
}

export function baseScale(s: Sheet): number {
  return s.views.find((v) => v.kind === "base")?.scale ?? 1;
}

function titleBlock(ctx: RenderCtx, w: number, h: number): string {
  const t = ctx.doc.title;
  const m = 10;
  const tbW = 180, rowH = 8;
  const x0 = w - m - tbW, y0 = h - m - rowH * 5;
  const cell = (x: number, y: number, ww: number, hh: number, label: string, value: string, big = false) =>
    `<rect x="${f(x)}" y="${f(y)}" width="${f(ww)}" height="${f(hh)}"/>` +
    text(x + 1.2, y + 2.6, label, 2, "start", 0, ` fill="#444"`) +
    text(x + 2, y + hh - 1.6, value, big ? 5 : 3.2, "start");
  let out = `<g class="title-block" stroke="#000" stroke-width="${W.thin}" fill="none">`;
  out += cell(x0, y0, 120, rowH * 2, "名称", t.title, true);
  out += cell(x0 + 120, y0, 60, rowH * 2, "図番", t.number, true);
  out += cell(x0, y0 + rowH * 2, 50, rowH, "材質", t.material);
  out += cell(x0 + 50, y0 + rowH * 2, 30, rowH, "尺度", scaleText(baseScale(ctx.sheet)));
  out += cell(x0 + 80, y0 + rowH * 2, 30, rowH, "単位", "mm");
  out += `<rect x="${f(x0 + 110)}" y="${f(y0 + rowH * 2)}" width="30" height="${rowH}"/>`;
  // third-angle projection symbol
  const sx = x0 + 113, sy = y0 + rowH * 2 + 4;
  out += `<path d="M${f(sx)} ${f(sy - 2)}L${f(sx + 7)} ${f(sy - 3)}L${f(sx + 7)} ${f(sy + 3)}L${f(sx)} ${f(sy + 2)}Z"/><circle cx="${f(sx + 16)}" cy="${f(sy)}" r="3"/><circle cx="${f(sx + 16)}" cy="${f(sy)}" r="1.4"/>`;
  out += cell(x0 + 140, y0 + rowH * 2, 40, rowH, "版", t.revision);
  out += cell(x0, y0 + rowH * 3, 45, rowH, "設計", t.designer);
  out += cell(x0 + 45, y0 + rowH * 3, 45, rowH, "検図", t.checker);
  out += cell(x0 + 90, y0 + rowH * 3, 45, rowH, "承認", t.approver);
  out += cell(x0 + 135, y0 + rowH * 3, 45, rowH, "日付", t.date);
  out += cell(x0, y0 + rowH * 4, 110, rowH, "普通公差", t.generalTol);
  out += cell(x0 + 110, y0 + rowH * 4, 70, rowH, "会社", t.company);
  out += text(w - m - 1, y0 - 1.5, `シート ${ctx.sheetIndex + 1}/${ctx.doc.sheets.length}`, 2.5, "end");
  return out + "</g>";
}

function partsList(ctx: RenderCtx): string {
  const pl = ctx.sheet.partsList;
  if (!pl || !ctx.bom.length) return "";
  const cols: [string, number][] = [
    ["品番", 12],
    ["品名", 52],
    ["数量", 14],
    ["材質", 36],
    ["備考", 26],
  ];
  const rowH = 7;
  let out = `<g class="anno partslist${ctx.selected?.has("__partslist") ? " sel" : ""}" data-id="__partslist" stroke="#000" stroke-width="${W.thin}" fill="none">`;
  const rows = [["品番", "品名", "数量", "材質", "備考"], ...ctx.bom.map((r) => [String(r.item), r.name, String(r.qty), r.material, r.note])];
  rows.forEach((row, ri) => {
    let x = pl.x;
    row.forEach((c, ci) => {
      out += `<rect x="${f(x)}" y="${f(pl.y + ri * rowH)}" width="${cols[ci][1]}" height="${rowH}"${ri === 0 ? ` fill="#f0f0f0"` : ""}/>`;
      out += text(x + (ci === 1 || ci === 4 ? 1.5 : cols[ci][1] / 2), pl.y + ri * rowH + 5, c, 3, ci === 1 || ci === 4 ? "start" : "middle");
      x += cols[ci][1];
    });
  });
  return out + "</g>";
}

export function renderSheet(ctx: RenderCtx, opts: { forExport?: boolean } = {}): string {
  const [w, h] = sheetSize(ctx.sheet);
  const views = new Map(ctx.sheet.views.map((v) => [v.id, v]));
  const m = 10;
  let out = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}mm" height="${h}mm" font-family="${FONT}">`;
  out += `<defs><pattern id="hatch" patternUnits="userSpaceOnUse" width="2.5" height="2.5" patternTransform="rotate(45)"><path d="M0 0V2.5" stroke="#000" stroke-width="0.18"/></pattern></defs>`;
  out += `<rect class="paper" width="${w}" height="${h}" fill="#fff"/>`;
  out += `<rect x="${m}" y="${m}" width="${w - 2 * m}" height="${h - 2 * m}" fill="none" stroke="#000" stroke-width="${W.border}"/>`;
  // centring marks (JIS)
  out += `<path d="M${w / 2} 0V${m}M${w / 2} ${h}V${h - m}M0 ${h / 2}H${m}M${w} ${h / 2}H${w - m}" stroke="#000" stroke-width="${W.border}"/>`;
  for (const v of ctx.sheet.views) out += renderView(v, ctx, views);
  for (const a of ctx.sheet.annos) out += renderAnno(a, views, ctx);
  out += partsList(ctx);
  out += titleBlock(ctx, w, h);
  void opts;
  void dimValue;
  return out + "</svg>";
}
