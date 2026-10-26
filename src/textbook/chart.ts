// Tiny SVG chart helpers for the textbook (no dependencies).

export function fmt(v: number, sig = 3): string {
  if (!Number.isFinite(v)) return v > 0 ? "∞" : "—";
  if (v === 0) return "0";
  const a = Math.abs(v);
  if (a >= 1e5 || a < 1e-3) return v.toExponential(sig - 1).replace("e+", "e");
  const d = Math.max(0, sig - 1 - Math.floor(Math.log10(a)));
  return Number(v.toFixed(Math.min(d, 6))).toLocaleString("ja-JP", { maximumFractionDigits: 6 });
}

/** "Nice" tick step for a range. */
function niceStep(span: number, target = 5): number {
  const raw = span / target;
  const p = 10 ** Math.floor(Math.log10(raw || 1));
  const m = raw / p;
  return (m < 1.5 ? 1 : m < 3 ? 2 : m < 7 ? 5 : 10) * p;
}

export interface Series {
  x: number[];
  y: number[];
  color?: string;
  label?: string;
  /** Shade the area between the curve and y = 0. */
  fill?: boolean;
  dash?: boolean;
}

export interface ChartOpts {
  width?: number;
  height?: number;
  xLabel?: string;
  yLabel?: string;
  /** Flip the y axis (deflection drawn downward). */
  invertY?: boolean;
  /** Mark points (x, y, text). */
  marks?: { x: number; y: number; text: string }[];
  yMin?: number;
  yMax?: number;
}

export function lineChart(series: Series[], o: ChartOpts = {}): string {
  const W = o.width ?? 560;
  const H = (o.height ?? 170) + 12;
  const m = { l: 56, r: 14, t: 24, b: 34 };
  const xs = series.flatMap((s) => s.x);
  const ys = series.flatMap((s) => s.y);
  let x0 = Math.min(...xs), x1 = Math.max(...xs);
  let y0 = Math.min(0, ...ys, o.yMin ?? Infinity), y1 = Math.max(0, ...ys, o.yMax ?? -Infinity);
  if (x1 === x0) x1 = x0 + 1;
  if (y1 - y0 < 1e-12) (y0 -= 1), (y1 += 1);
  const pad = (y1 - y0) * 0.08;
  y0 = y0 < 0 ? y0 - pad : y0;
  y1 = y1 > 0 ? y1 + pad : y1;
  const sx = (x: number) => m.l + ((x - x0) / (x1 - x0)) * (W - m.l - m.r);
  const syRaw = (y: number) => m.t + ((y1 - y) / (y1 - y0)) * (H - m.t - m.b);
  const sy = o.invertY ? (y: number) => H - m.b - (syRaw(y) - m.t) : syRaw;
  const out: string[] = [];
  // data for the hover read-out (pixel + value pairs, thinned to ≤ 160 points per series)
  const hover = {
    l: m.l,
    r: W - m.r,
    t: m.t,
    b: H - m.b,
    xl: o.xLabel ?? "x",
    s: series.map((s) => {
      const k = Math.max(1, Math.ceil(s.x.length / 160));
      const pts: number[][] = [];
      for (let i = 0; i < s.x.length; i += k) pts.push([+sx(s.x[i]).toFixed(1), +sy(s.y[i]).toFixed(1), s.x[i], s.y[i]]);
      return { c: s.color ?? "var(--tb-accent)", n: s.label ?? o.yLabel ?? "", p: pts };
    }),
  };
  installHover();
  out.push(
    `<svg class="tb-chart tb-hoverable" viewBox="0 0 ${W} ${H}" role="img" aria-label="${o.yLabel ?? "グラフ"}${o.xLabel ? ` – ${o.xLabel}` : ""}" data-hover='${JSON.stringify(hover).replace(/'/g, "&#39;")}'>`,
  );
  // grid + ticks
  const xs_ = niceStep(x1 - x0);
  for (let v = Math.ceil(x0 / xs_) * xs_; v <= x1 + 1e-9; v += xs_) {
    out.push(`<line class="grid" x1="${sx(v)}" x2="${sx(v)}" y1="${m.t}" y2="${H - m.b}"/>`);
    const X = sx(v);
    out.push(`<text class="tick" x="${X}" y="${H - m.b + 14}" text-anchor="${X > W - m.r - 24 ? "end" : "middle"}">${fmt(v)}</text>`);
  }
  const ys_ = niceStep(y1 - y0, 4);
  for (let v = Math.ceil(y0 / ys_) * ys_; v <= y1 + 1e-9; v += ys_) {
    out.push(`<line class="grid" x1="${m.l}" x2="${W - m.r}" y1="${sy(v)}" y2="${sy(v)}"/>`);
    out.push(`<text class="tick" x="${m.l - 6}" y="${sy(v) + 4}" text-anchor="end">${fmt(o.invertY ? v : v)}</text>`);
  }
  out.push(`<line class="axis" x1="${m.l}" x2="${W - m.r}" y1="${sy(0)}" y2="${sy(0)}"/>`);
  out.push(`<line class="axis" x1="${m.l}" x2="${m.l}" y1="${m.t}" y2="${H - m.b}"/>`);
  if (o.xLabel) out.push(`<text class="lbl" x="${W - m.r}" y="${H - 4}" text-anchor="end">${o.xLabel}</text>`);
  if (o.yLabel) out.push(`<text class="lbl" x="${m.l - 50}" y="14">${o.yLabel}</text>`);
  for (const s of series) {
    const c = s.color ?? "var(--tb-accent)";
    const pts = s.x.map((x, i) => `${sx(x).toFixed(1)},${sy(s.y[i]).toFixed(1)}`);
    if (s.fill) out.push(`<polygon class="area" points="${sx(s.x[0])},${sy(0)} ${pts.join(" ")} ${sx(s.x[s.x.length - 1])},${sy(0)}" fill="${c}" opacity="0.14"/>`);
    out.push(`<polyline class="line" points="${pts.join(" ")}" fill="none" stroke="${c}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"${s.dash ? ' stroke-dasharray="5 4"' : ""}/>`);
  }
  for (const k of o.marks ?? []) {
    const X = sx(k.x), Y = sy(k.y);
    const anchor = X > W * 0.7 ? "end" : X < W * 0.3 ? "start" : "middle";
    out.push(`<circle cx="${X}" cy="${Y}" r="3.5" class="mark"/>`);
    out.push(`<text class="mark-t" x="${X}" y="${Y + (Y < H / 2 ? 16 : -8)}" text-anchor="${anchor}">${k.text}</text>`);
  }
  if (series.some((s) => s.label)) {
    let lx = W - m.r - series.reduce((w, s) => w + (s.label ? 30 + s.label.length * 11 : 0), 0);
    for (const s of series) {
      if (!s.label) continue;
      out.push(`<line x1="${lx}" x2="${lx + 16}" y1="10" y2="10" stroke="${s.color ?? "var(--tb-accent)"}" stroke-width="2"${s.dash ? ' stroke-dasharray="4 3"' : ""}/>`);
      out.push(`<text class="tick" x="${lx + 20}" y="14">${s.label}</text>`);
      lx += 30 + s.label.length * 11;
    }
  }
  out.push("</svg>");
  return out.join("");
}

// ------------------------------------------------------------ hover read-out
let hoverInstalled = false;
interface HoverData {
  l: number;
  r: number;
  t: number;
  b: number;
  xl: string;
  s: { c: string; n: string; p: number[][] }[];
}

/** One delegated listener for every chart: crosshair + values under the pointer. */
function installHover() {
  if (hoverInstalled || typeof document === "undefined") return;
  hoverInstalled = true;
  let cur: SVGSVGElement | null = null;
  const clear = () => {
    cur?.querySelector(".tb-hover-g")?.remove();
    cur = null;
  };
  const NS = "http://www.w3.org/2000/svg";
  document.addEventListener("pointermove", (e) => {
    const svg = (e.target as Element | null)?.closest?.("svg.tb-hoverable") as SVGSVGElement | null;
    if (svg !== cur) clear();
    if (!svg) return;
    let d: HoverData;
    try {
      d = JSON.parse(svg.dataset.hover ?? "");
    } catch {
      return;
    }
    const mtx = svg.getScreenCTM();
    if (!mtx) return;
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(mtx.inverse());
    if (pt.x < d.l || pt.x > d.r || pt.y < d.t - 10 || pt.y > d.b + 10) return clear();
    cur = svg;
    let g = svg.querySelector<SVGGElement>(".tb-hover-g");
    if (!g) {
      g = document.createElementNS(NS, "g") as SVGGElement;
      g.setAttribute("class", "tb-hover-g");
      g.setAttribute("pointer-events", "none");
      svg.appendChild(g);
    }
    let html = "";
    const rows: [string, string, string][] = [];
    let X = pt.x;
    let xv = NaN;
    for (const s of d.s) {
      if (!s.p.length) continue;
      let best = s.p[0];
      for (const q of s.p) if (Math.abs(q[0] - pt.x) < Math.abs(best[0] - pt.x)) best = q;
      if (Number.isNaN(xv)) (xv = best[2]), (X = best[0]);
      html += `<circle cx="${best[0]}" cy="${best[1]}" r="4" fill="${s.c}" stroke="var(--tb-surface)" stroke-width="1.5"/>`;
      rows.push([s.c, s.n, fmt(best[3])]);
    }
    const lines = [`${d.xl.replace(/ *\[.*$/, "")} = ${fmt(xv)}`, ...rows.map((r) => (r[1] ? `${r[1].replace(/ *\[.*$/, "")}: ${r[2]}` : r[2]))];
    const bw = Math.max(...lines.map((t) => t.length)) * 7 + 18;
    const bh = lines.length * 15 + 8;
    const bx = X + 10 + bw > d.r ? X - 10 - bw : X + 10;
    const by = d.t + 2;
    html =
      `<line x1="${X}" x2="${X}" y1="${d.t}" y2="${d.b}" class="tb-hover-x"/>` +
      html +
      `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="5" class="tb-hover-box"/>` +
      lines.map((t, i) => `<text x="${bx + 8}" y="${by + 16 + i * 15}" class="tb-hover-t"${i > 0 ? ` style="fill:${rows[i - 1][0]}"` : ""}>${t}</text>`).join("");
    g.innerHTML = html;
  });
  document.addEventListener("pointerleave", clear);
}
