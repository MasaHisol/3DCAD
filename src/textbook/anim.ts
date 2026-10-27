// Animated and hands-on figures for the textbook (<div data-widget="anim-...">).
// Plain SVG + requestAnimationFrame; every figure has a static first frame
// so it still reads when printed, and stops when it leaves the page.
// Drawing uses the shared figure kit (figkit.ts / "figure kit" in textbook.css).
import { fmt } from "./chart";

import { frame, button, slider, select, loop, reduced } from "./animkit";

// ------------------------------------------------------------- helpers ---
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
/** smoothstep easing on [0, 1] */
const ease = (x: number) => {
  const u = clamp01(x);
  return u * u * (3 - 2 * u);
};
const n1 = (v: number) => Math.round(v * 10) / 10;
const P = (pts: [number, number][]) => pts.map(([x, y]) => `${n1(x)},${n1(y)}`).join(" ");
const panel = (x: number, y: number, w: number, h: number) => `<rect class="k-panel" x="${x}" y="${y}" width="${w}" height="${h}" rx="8"/>`;
const badge = (x: number, y: number, t: string, col = "var(--tb-accent)") =>
  `<circle class="k-badge" cx="${x}" cy="${y}" r="10" style="fill:${col}"/><text class="k-badge-t" x="${x}" y="${y + 4}" text-anchor="middle">${t}</text>`;
/** SVG user coordinates of a mouse event (handles CSS padding / scaling). */
function svgPoint(svg: SVGSVGElement, e: MouseEvent, w: number, h: number) {
  const m = svg.getScreenCTM?.();
  if (m) {
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    return { x: p.x, y: p.y };
  }
  const r = svg.getBoundingClientRect();
  return { x: ((e.clientX - r.left) / r.width) * w, y: ((e.clientY - r.top) / r.height) * h };
}

// ------------------------------------------------------------- figures ---

export const ANIM: Record<string, (host: HTMLElement) => void> = {
  /** Reflection line crossing G0 / G1 / G2 joints. */
  "anim-highlight"(host) {
    const { ctl, svg, out } = frame(host, "面のつながりとハイライト (G0 / G1 / G2)", 236);
    let playing = !reduced();
    const pb = button(ctl, playing ? "■ 止める" : "▶ 動かす", () => ((playing = !playing), (pb.textContent = playing ? "■ 止める" : "▶ 動かす")));
    // three profiles: y(x) on x in [0,1], joint at 0.5
    const prof = {
      G0: (x: number) => (x < 0.5 ? 0.25 : 0.25 + (x - 0.5) * 1.2), // corner (slope jump)
      G1: (x: number) => (x < 0.5 ? 0.25 : 0.25 + 0.6 * (x - 0.5) ** 2 * 4 * 0.5), // tangent, curvature jump
      G2: (x: number) => (x < 0.5 ? 0.25 : 0.25 + 0.6 * (x - 0.5) ** 3 * 8 * 0.5), // curvature continuous
    };
    const slope = (f: (x: number) => number, x: number) => (f(Math.min(1, x + 1e-3)) - f(Math.max(0, x - 1e-3))) / 2e-3;
    const cols = [
      ["G0", "位置だけ連続 (角)", prof.G0, "var(--tb-bad)"],
      ["G1", "接線連続 (正接 R)", prof.G1, "var(--tb-warn)"],
      ["G2", "曲率連続", prof.G2, "var(--tb-good)"],
    ] as const;
    let clock = 1.2;
    const draw = () => {
      // light direction sweeps back and forth with ease-in-out
      const phase = 0.5 - 0.5 * Math.cos(clock * 0.9);
      const light = -0.4 + phase * 1.6;
      let s = "";
      cols.forEach(([id, label, f, col], i) => {
        const px0 = 8 + i * 172, x0 = px0 + 12, w = 140, base = 176;
        const Pt = (x: number): [number, number] => [x0 + x * w, base - f(x) * 120];
        s += panel(px0, 8, 160, 220);
        s += badge(px0 + 20, 28, id === "G0" ? "0" : id === "G1" ? "1" : "2", col);
        s += `<text class="k-title" x="${px0 + 38}" y="33">${id}</text>`;
        const line: [number, number][] = [];
        for (let k = 0; k <= 60; k++) line.push(Pt(k / 60));
        s += `<g class="k-shadow"><path class="k-part" d="M${P(line).replace(/ /g, " L")} L${x0 + w},${base + 20} L${x0},${base + 20} Z"/></g>`;
        // joint line
        const [jx, jy] = Pt(0.5);
        s += `<line class="k-center" x1="${jx}" x2="${jx}" y1="${n1(jy - 26)}" y2="${base + 20}"/>`;
        // reflection band: where the surface normal faces the light (slope ≈ light slope)
        const runs: [number, number][][] = [];
        let cur: [number, number][] | null = null;
        for (let k = 0; k <= 120; k++) {
          const x = k / 120;
          if (Math.abs(slope(f, x) - light) < 0.12) {
            if (!cur) runs.push((cur = []));
            cur.push(Pt(x));
          } else cur = null;
        }
        // the lamp
        const lx = x0 + 8 + phase * (w - 16), ly = 56;
        const first = runs[0];
        if (first) {
          const m = first[Math.floor(first.length / 2)];
          s += `<line x1="${n1(lx)}" y1="${ly}" x2="${n1(m[0])}" y2="${n1(m[1] - 4)}" style="stroke:var(--tb-warn)" stroke-width="1" stroke-dasharray="3 3"/>`;
        }
        s += `<circle class="k-glow" cx="${n1(lx)}" cy="${ly}" r="6" style="fill:var(--tb-warn)"/>`;
        for (const r of runs) {
          const pts = r.length === 1 ? [[r[0][0] - 2, r[0][1]] as [number, number], [r[0][0] + 2, r[0][1]] as [number, number]] : r;
          s += `<polyline class="k-glow" points="${P(pts)}" fill="none" style="stroke:var(--tb-warn)" stroke-width="7"/>`;
          s += `<polyline points="${P(pts)}" fill="none" style="stroke:#fff" stroke-width="2.6"/>`;
        }
        s += `<text class="lbl" x="${px0 + 80}" y="216" text-anchor="middle">${label}</text>`;
      });
      svg.innerHTML = s;
    };
    out.innerHTML = `<p class="tb-note">白い点は光が映り込む位置 (ハイライト)。G0 では映り込みが跳び、G1 では位置は続くが速さが急に変わり、G2 ではなめらかに流れます。高級感のある外装は G2 以上でつなぎます。</p>`;
    draw();
    loop(host, (_t, dt) => ((clock += dt), draw()), () => playing);
  },

  /** Moulded part ejected with / without draft. */
  "anim-draft"(host) {
    const { ctl, svg, out } = frame(host, "抜き勾配と型開き", 240);
    let draft = 2;
    let t0 = performance.now() / 1000;
    select(ctl, [["0", "抜き勾配なし (0°)"], ["1", "抜き勾配 1°"], ["2", "抜き勾配 2°"], ["4", "抜き勾配 4°"]], "2", (v) => ((draft = Number(v)), (t0 = performance.now() / 1000), draw(t0 + 1.4)));
    button(ctl, "↻ もう一度", () => (t0 = performance.now() / 1000));
    const draw = (now: number) => {
      const t = ease(((now - t0) % 4) / 2.5);
      const lift = t * 60;
      const e = draft * 3.5; // side offset in px, exaggerated for visibility
      const scrape = draft === 0 && t > 0.03 && t < 0.999;
      const cx = 250, top = 100, bot = 192, half = 66, wall = 9;
      // fixed core (section) on the moving-side plate
      let s = `<g class="k-shadow"><rect class="k-cut2" x="110" y="${bot}" width="280" height="22"/>`;
      s += `<path class="k-cut2" d="M${cx - half - e},${bot} L${cx - half},${top} L${cx + half},${top} L${cx + half + e},${bot} Z"/></g>`;
      // ejector pins push the part
      for (const px of [cx - 34, cx + 34]) s += `<rect class="k-part-h" x="${px - 5}" y="${top - lift}" width="10" height="${n1(bot + 22 - (top - lift))}" stroke-width="1.2"/>`;
      s += `<text class="tick" x="396" y="${bot + 15}">可動型 (コア)</text>`;
      // moulded part (plastic shell) moving up
      const y = -lift;
      const o = (yy: number) => ((yy - top) / (bot - top)) * e; // side offset at height yy
      s += `<g transform="translate(0 ${n1(y)})" class="k-shadow"><path class="k-plastic" d="M${n1(cx - half - wall - e)},${bot} L${cx - half - wall},${top - wall} L${cx + half + wall},${top - wall} L${n1(cx + half + wall + e)},${bot} L${n1(cx + half + e)},${bot} L${cx + half},${top} L${cx - half},${top} L${n1(cx - half - e)},${bot} Z"/></g>`;
      s += `<text class="lbl" x="${cx}" y="${n1(top - wall - 8 - lift)}" text-anchor="middle">成形品</text>`;
      if (scrape) {
        for (let i = 0; i < 4; i++) {
          const yy = top + 18 + i * 20;
          const xo = o(yy);
          s += `<path d="M${n1(cx - half - xo)},${yy} l-9,5 l5,1 l-7,5" fill="none" style="stroke:var(--tb-bad)" stroke-width="2"/><path d="M${n1(cx + half + xo)},${yy} l9,5 l-5,1 l7,5" fill="none" style="stroke:var(--tb-bad)" stroke-width="2"/>`;
        }
      } else if (lift > 1) {
        s += `<text class="k-good-t" x="${cx + half + 30}" y="${top + 40}">側面が離れる</text>`;
      }
      // draft angle annotation (right side of the core)
      s += `<line class="k-thin" x1="${cx + half + e}" y1="${bot}" x2="${cx + half + e}" y2="${top - 4}" stroke-dasharray="4 3"/>`;
      if (draft > 0) s += `<text class="k-dimtext" x="${cx + half + e + 6}" y="${top + 4}">${draft}°</text>`;
      // mould-opening direction
      s += `<line class="k-move" x1="460" y1="170" x2="460" y2="96" stroke-width="2.4"/><text class="tick" x="460" y="186" text-anchor="middle">型開き方向</text>`;
      const msg = draft === 0 ? "側面がこすれ続ける → 傷・変形・離型不良" : `${draft}° — 少し上がると側面が離れる`;
      s += badge(22, 228, draft === 0 ? "✕" : "✓", draft === 0 ? "var(--tb-bad)" : "var(--tb-good)");
      s += `<text class="${draft === 0 ? "k-bad-t" : "k-good-t"}" x="38" y="232">${msg}</text>`;
      svg.innerHTML = s;
    };
    out.innerHTML = `<p class="tb-note">勾配は見やすいよう誇張して描いています。一般的な目安は 0.5〜2°、シボ (しぼ) 加工の面はさらに大きくします。</p>`;
    draw(t0 + 1.4);
    loop(host, (now) => draw(now), () => !reduced());
  },

  /** Snap-fit hook deflecting while the lid is pushed on. */
  "anim-snapfit"(host) {
    const { ctl, svg, out } = frame(host, "スナップフィットのたわみ", 262);
    let pos = 0;
    let u = 0;
    let playing = !reduced();
    const sl = slider(ctl, "押し込み量 %", 0, 100, 0, 1, (v) => ((pos = v / 100), (u = pos), (playing = false), draw()));
    button(ctl, "▶ 自動", () => (playing = true));
    const L = 14, t = 1.5, y = 1.2; // hook length, thickness, undercut (mm)
    const k = 9; // px per mm
    const draw = () => {
      const bx = 200, by = 200; // hook root
      const tipy = by - L * k; // top of the hook
      const barbH = 22, barbW = y * k + 6;
      const lidH = 30;
      // the lid edge travels down past the barb: lidBottom from above the hook to below the barb
      const lidBottom = tipy - 30 + Math.min(1, pos / 0.9) * (barbH + lidH + 30);
      // the sloped barb is pushed aside while the lid edge slides along it, then springs back over the lid
      const over = lidBottom - tipy; // how far the lid edge has passed the barb top
      const d = over <= 0 ? 0 : over < barbH ? (over / barbH) * y : lidBottom - lidH < tipy + barbH ? y : 0;
      const latched = lidBottom - lidH >= tipy + barbH;
      const strain = ((1.5 * t * d) / (L * L)) * 100; // % (cantilever snap formula)
      const tk = t * k * 0.9; // drawn thickness
      const lidX = bx + tk / 2 + barbW - y * k; // lid edge overlaps the barb by the undercut
      // body (base) section
      let s = `<g class="k-shadow"><rect class="k-plastic" x="${bx - 70}" y="${by}" width="320" height="16"/>`;
      // hook beam: bends to the left (−x) by d at the tip, shape ∝ height²
      const cxAt = (h: number) => bx - d * (h / L) ** 2 * k;
      const left: [number, number][] = [], right: [number, number][] = [];
      for (let i = 0; i <= 20; i++) {
        const h = (i / 20) * L;
        left.push([cxAt(h) - tk / 2, by - h * k]);
        right.push([cxAt(h) + tk / 2, by - h * k]);
      }
      const tx = cxAt(L);
      const barb = `L${n1(tx + tk / 2 + barbW)},${n1(tipy + barbH)} L${n1(tx + tk / 2)},${n1(tipy + barbH)}`;
      s += `<path class="k-plastic" d="M${bx - tk / 2 - 7},${by + 1} Q${bx - tk / 2},${by} ${bx - tk / 2},${by - 7} L${P(left.slice(1)).replace(/ /g, " L")} L${P([right[20]])} ${barb} L${P(right.slice(1, 17).reverse()).replace(/ /g, " L")} L${bx + tk / 2},${by - 7} Q${bx + tk / 2},${by} ${bx + tk / 2 + 7},${by + 1} Z"/></g>`;
      // lid (mating part)
      s += `<g class="k-shadow"><rect class="k-alu" x="${n1(lidX)}" y="${n1(lidBottom - lidH)}" width="200" height="${lidH}" rx="2"/></g><text class="tick" x="${n1(lidX + 100)}" y="${n1(lidBottom - lidH / 2 + 4)}" text-anchor="middle">ふた (相手側)</text>`;
      s += `<line class="k-move" x1="${n1(lidX + 186)}" y1="${n1(lidBottom - lidH - 26)}" x2="${n1(lidX + 186)}" y2="${n1(lidBottom - lidH - 4)}"/>`;
      s += `<text class="tick" x="${bx - 66}" y="${by + 12}">本体</text>`;
      if (d > 0) {
        s += `<circle class="k-glow" cx="${bx - tk / 2}" cy="${by - 4}" r="${n1(4 + d * 3)}" style="fill:var(--tb-bad)" opacity="${n1(0.25 + 0.5 * (d / y))}"/>`;
        s += `<path d="M${bx - 48},${by - 40} Q${bx - 30},${by - 10} ${bx - tk / 2 - 6},${by - 6}" class="k-thin" style="stroke:var(--tb-bad);marker-end:url(#k-arrow-red)" stroke-width="1.4"/><text class="k-bad-t" x="${bx - 50}" y="${by - 46}" text-anchor="middle">根元にひずみが集中</text>`;
      }
      if (latched) s += badge(bx + 60, tipy + 4, "✓", "var(--tb-good)") + `<text class="k-good-t" x="${bx + 76}" y="${tipy + 8}">はまった (ロック)</text>`;
      // strain meter: 0..3 %
      const mx = 150, mw = 340, my = 230;
      s += `<text class="lbl" x="20" y="${my + 9}">根元のひずみ</text>`;
      s += `<rect x="${mx}" y="${my}" width="${mw}" height="10" rx="5" style="fill:var(--tb-surface-2);stroke:var(--tb-border)"/>`;
      s += `<rect x="${mx + (mw * 2) / 3}" y="${my}" width="${mw / 3}" height="10" rx="0" style="fill:var(--tb-warn)" opacity="0.35"/>`;
      s += `<rect x="${mx}" y="${my}" width="${n1(Math.max(0, Math.min(1, strain / 3)) * mw)}" height="10" rx="5" style="fill:var(--tb-accent)"/>`;
      for (let i = 0; i <= 3; i++) s += `<text class="tick" x="${mx + (i * mw) / 3}" y="${my + 24}" text-anchor="middle">${i} %</text>`;
      s += `<text class="tick" x="${mx + (mw * 5) / 6}" y="${my - 6}" text-anchor="middle">ABS の許容 2〜3 %</text>`;
      s += `<text class="mark-t" x="20" y="24">たわみ ${fmt(d, 2)} mm / 根元のひずみ ≈ ${fmt(strain, 2)} %${latched ? " — はまった (ロック)" : ""}</text>`;
      svg.innerHTML = s;
      out.innerHTML = `<p class="tb-note">ふたが下りると、ツメの斜面が押されて片持ちばりのようにたわみ、通り過ぎると戻って引っかかります。根元のひずみ ε ≈ 1.5·t·y / L² (t: 厚さ、y: 引っかかり量、L: 長さ)。樹脂の許容ひずみ (ABS で 2〜3 % 程度、繰返しはその半分程度が目安) を超えないよう、ツメを長く・薄く、根元に R を付けます。</p>`;
    };
    draw();
    loop(host, (_t, dt) => {
      u = (u + dt * 0.32) % 1.15;
      pos = ease(Math.min(1, u));
      sl.value = String(Math.round(pos * 100));
      (sl.previousElementSibling as HTMLElement).textContent = `押し込み量 % ${sl.value}`;
      draw();
    }, () => playing);
  },

  /** Force flow around a notch: lines crowd at a sharp corner, spread with a larger R. */
  "anim-stressflow"(host) {
    const { ctl, svg, out } = frame(host, "力の流れと角の R (応力集中)", 250);
    let R = 2;
    let phase = 0;
    slider(ctl, "段の角の R (mm)", 0, 20, 2, 1, (v) => ((R = v), draw()));
    const kOf = (r: number) => 1 + 1.6 / Math.sqrt(1 + r / 1.2); // illustrative trend only
    const draw = () => {
      // stepped bar: wide (y 40..130) → narrow (y 70..130), step at x=260
      const yTop = 40, yTopN = 70, yB = 130, step = 260, xL = 40, xR = 480;
      const r = Math.min(30, R * 1.5);
      const kt = kOf(R);
      let s = `<g class="k-shadow"><path class="k-part" d="M${xL},${yTop} L${step},${yTop} L${step},${yTopN - r}${r > 0 ? ` A${r},${r} 0 0 0 ${step + r},${yTopN}` : ""} L${xR},${yTopN} L${xR},${yB} L${xL},${yB} Z"/></g>`;
      // hot spot at the corner
      s += `<circle class="k-glow" cx="${step + r * 0.3}" cy="${yTopN - r * 0.3}" r="${n1(6 + (kt - 1) * 10)}" style="fill:var(--tb-bad)" opacity="${n1(0.15 + (kt - 1) * 0.35)}"/>`;
      const n = 7;
      for (let i = 0; i < n; i++) {
        const yl = yTop + 8 + (i * (yB - yTop - 16)) / (n - 1); // in wide part
        const yr = yTopN + 6 + (i * (yB - yTopN - 12)) / (n - 1); // in narrow part
        const bend = 30 + r * 2;
        const d = `M${xL + 4},${n1(yl)} L${step - bend},${n1(yl)} C${n1(step - bend / 3)},${n1(yl)} ${n1(step + bend / 3 - 10)},${n1(yr)} ${step + bend},${n1(yr)} L${xR - 4},${n1(yr)}`;
        const crowd = i === 0;
        s += `<path d="${d}" fill="none" style="stroke:${crowd ? "var(--tb-bad)" : "var(--tb-accent)"}" stroke-width="${crowd ? n1(1.4 + (kt - 1) * 1.6) : 1.4}" stroke-dasharray="10 8" stroke-dashoffset="${n1(-phase)}"/>`;
      }
      // tension arrows at both ends
      s += `<line class="k-force" x1="${xL - 2}" y1="85" x2="12" y2="85"/><line class="k-force" x1="${xR + 2}" y1="100" x2="508" y2="100"/>`;
      s += `<text class="tick" x="${xL}" y="146">← 引張力</text><text class="tick" x="${xR}" y="146" text-anchor="end">引張力 →</text>`;
      s += `<text class="mark-t" x="${step + r + 10}" y="${yTopN - 12}">角: 応力集中係数の目安 ≈ ${fmt(kt, 2)}</text>`;
      if (R > 0) s += `<text class="k-dimtext" x="${step - 6}" y="${yTop - 6}" text-anchor="end">R${R}</text>`;
      // small chart: Kt vs R
      const gx = 60, gy = 236, gw = 400, gh = 70;
      const X = (v: number) => gx + (v / 20) * gw, Y = (v: number) => gy - ((v - 1) / 1.8) * gh;
      let curve = "";
      for (let v = 0; v <= 20; v += 0.5) curve += `${curve ? " L" : "M"}${n1(X(v))},${n1(Y(kOf(v)))}`;
      s += `<line class="axis" x1="${gx}" y1="${gy}" x2="${gx + gw}" y2="${gy}"/><line class="axis" x1="${gx}" y1="${gy}" x2="${gx}" y2="${gy - gh - 6}"/>`;
      s += `<path d="${curve}" fill="none" style="stroke:var(--tb-text-3)" stroke-width="1.6"/>`;
      s += `<circle cx="${n1(X(R))}" cy="${n1(Y(kt))}" r="5" style="fill:var(--tb-bad);stroke:var(--tb-surface)" stroke-width="1.5"/>`;
      s += `<text class="tick" x="${gx - 6}" y="${gy - gh + 4}" text-anchor="end">Kt</text><text class="tick" x="${gx - 6}" y="${gy + 4}" text-anchor="end">1</text><text class="tick" x="${gx - 6}" y="${n1(Y(2) + 4)}" text-anchor="end">2</text><line class="grid" x1="${gx}" x2="${gx + gw}" y1="${n1(Y(2))}" y2="${n1(Y(2))}"/><text class="tick" x="${gx + gw + 6}" y="${gy + 4}">R</text>`;
      s += `<text class="tick" x="${gx}" y="${gy + 12}" text-anchor="middle">0</text><text class="tick" x="${gx + gw}" y="${gy + 12}" text-anchor="middle">20</text>`;
      svg.innerHTML = s;
    };
    out.innerHTML = `<p class="tb-note">力の流れ (流線) は、断面が急に変わる角に集まります。R を大きくすると流れがなめらかになり、応力集中が下がります。係数の値は傾向を示すための目安です (実際の値は形状・寸法比による)。</p>`;
    draw();
    loop(host, (_t, dt) => ((phase += dt * 30), draw()), () => !reduced());
  },

  /** Monte-Carlo tolerance stack: parts vary, the gap is checked against limits. */
  "anim-stack"(host) {
    const { ctl, svg, out } = frame(host, "公差の積み上げシミュレーション", 244);
    const parts = [
      { nom: 40, tol: 0.1 },
      { nom: 25, tol: 0.1 },
      { nom: 20, tol: 0.15 },
      { nom: 14.5, tol: 0.05 },
    ];
    const H = { nom: 100, tol: 0.1 };
    const gapMin = 0.1;
    let n = 0, fail = 0;
    const hist = new Array(30).fill(0);
    let playing = !reduced();
    const pb = button(ctl, playing ? "■ 止める" : "▶ 動かす", () => ((playing = !playing), (pb.textContent = playing ? "■ 止める" : "▶ 動かす")));
    button(ctl, "リセット", () => ((n = 0), (fail = 0), hist.fill(0), draw(cur)));
    const gauss = () => {
      let u = 0, v = 0;
      while (!u) u = Math.random();
      while (!v) v = Math.random();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    };
    const sample = () => {
      // ±tol = ±3σ, clipped (normal distribution within tolerance)
      const v = (p: { nom: number; tol: number }) => p.nom + Math.max(-p.tol, Math.min(p.tol, (gauss() * p.tol) / 3));
      const sizes = parts.map(v);
      const h = v(H);
      return { sizes, h, gap: h - sizes.reduce((a, b) => a + b, 0) };
    };
    const nominalGap = H.nom - parts.reduce((a, p) => a + p.nom, 0);
    const wc = H.tol + parts.reduce((a, p) => a + p.tol, 0);
    const fills = ["k-part", "k-alu", "k-plastic", "k-part-h"];
    const draw = (sm: ReturnType<typeof sample>) => {
      const k = 4.4, x0 = 30, yT = 46, yBot = 84;
      const xin = x0 + sm.h * k;
      // housing section (U shape)
      let s = `<g class="k-shadow"><path class="k-cut" d="M${x0 - 8},${yT - 6} L${x0},${yT - 6} L${x0},${yBot} L${n1(xin)},${yBot} L${n1(xin)},${yT - 6} L${n1(xin + 8)},${yT - 6} L${n1(xin + 8)},${yBot + 8} L${x0 - 8},${yBot + 8} Z"/>`;
      let x = x0;
      sm.sizes.forEach((w, i) => {
        s += `<rect class="${fills[i]}" x="${n1(x)}" y="${yT}" width="${n1(w * k)}" height="${yBot - yT}"/>`;
        x += w * k;
      });
      s += `</g>`;
      x = x0;
      sm.sizes.forEach((w, i) => {
        s += `<text class="tick" x="${n1(x + (w * k) / 2)}" y="${yT + 23}" text-anchor="middle" style="fill:var(--tb-text-2)">${String.fromCharCode(65 + i)} ${fmt(w, 4)}</text>`;
        x += w * k;
      });
      s += `<line class="k-ext" x1="${x0}" y1="${yT - 10}" x2="${x0}" y2="${22}"/><line class="k-ext" x1="${n1(xin)}" y1="${yT - 10}" x2="${n1(xin)}" y2="22"/>`;
      s += `<line class="k-dimline" x1="${x0}" y1="26" x2="${n1(xin)}" y2="26"/><text class="k-dimtext" x="${x0 + 220}" y="20" text-anchor="middle">ハウジング内寸 ${fmt(sm.h, 4)}</text>`;
      const ok = sm.gap >= gapMin;
      const col = ok ? "var(--tb-good)" : "var(--tb-bad)";
      s += `<line x1="${n1(xin - 3)}" y1="${yBot + 14}" x2="${n1(xin - 3)}" y2="${yBot + 22}" style="stroke:${col}" stroke-width="2"/>`;
      s += `<text class="mark-t" x="${n1(xin - 10)}" y="${yBot + 30}" text-anchor="end" style="fill:${col}">すきま ${fmt(sm.gap, 3)} ${ok ? "OK" : "NG"}</text>`;
      // histogram of gaps between nominal ± worst case
      const lo = nominalGap - wc, hi = nominalGap + wc, max = Math.max(1, ...hist);
      const hx = 30, hw = 460, hb = 214, hh = 82;
      s += `<line class="axis" x1="${hx}" y1="${hb}" x2="${hx + hw}" y2="${hb}"/>`;
      hist.forEach((c, i) => {
        const bx = hx + (i * hw) / hist.length;
        const xv = lo + ((i + 0.5) * (hi - lo)) / hist.length;
        const bh = (c / max) * hh;
        s += `<rect x="${n1(bx + 1)}" y="${n1(hb - bh)}" width="${n1(hw / hist.length - 2)}" height="${n1(bh)}" rx="1.5" style="fill:${xv < gapMin ? "var(--tb-bad)" : "var(--tb-accent)"}" opacity="0.8"/>`;
      });
      const X = (g: number) => hx + ((g - lo) / (hi - lo)) * hw;
      const gx = X(gapMin);
      s += `<line x1="${n1(gx)}" x2="${n1(gx)}" y1="${hb - hh - 8}" y2="${hb + 2}" style="stroke:var(--tb-bad)" stroke-width="1.4" stroke-dasharray="4 3"/><text class="tick" x="${n1(gx + 4)}" y="${hb - hh}">下限 ${gapMin}</text>`;
      const cx = Math.max(hx, Math.min(hx + hw, X(sm.gap)));
      s += `<path d="M${n1(cx)},${hb + 3} l-5,8 l10,0 Z" style="fill:${col}"/>`;
      s += `<text class="tick" x="${hx}" y="${hb + 22}">${fmt(lo, 3)}</text><text class="tick" x="${hx + hw}" y="${hb + 22}" text-anchor="end">${fmt(hi, 3)}</text><text class="tick" x="${hx + hw / 2}" y="${hb + 22}" text-anchor="middle">すきまの分布 (ワーストケースの範囲)</text>`;
      svg.innerHTML = s;
      out.innerHTML = `<table class="tb-res"><tr><th>試行回数</th><td>${n}</td></tr><tr><th>不良 (すきま &lt; ${gapMin})</th><td>${fail} (${fmt((fail / Math.max(1, n)) * 100, 3)} %)</td></tr><tr><th>ワーストケースの範囲</th><td>${fmt(nominalGap - wc, 3)} 〜 ${fmt(nominalGap + wc, 3)}</td></tr></table><p class="tb-note">各寸法は公差内で正規分布 (±公差 = ±3σ) とした例です。ワーストケースでは不良が出うる設計でも、実際の発生率はずっと小さいことがわかります。ただし工程の平均がずれると不良は急に増えます。</p>`;
    };
    let acc = 0;
    let cur = sample();
    draw(cur);
    loop(host, (_t, dt) => {
      acc += dt;
      if (acc < 0.05) return;
      acc = 0;
      for (let i = 0; i < 20; i++) {
        const sm = sample();
        n++;
        if (sm.gap < gapMin) fail++;
        const lo = nominalGap - wc, hi = nominalGap + wc;
        const b = Math.floor(((sm.gap - lo) / (hi - lo)) * hist.length);
        if (b >= 0 && b < hist.length) hist[b]++;
        cur = sm;
      }
      draw(cur);
    }, () => playing);
  },

  /** Part consolidation before / after (DFA). */
  "anim-dfa"(host) {
    const { ctl, svg, out } = frame(host, "部品点数の削減 (DFA)", 236);
    let after = false;
    let t0 = performance.now() / 1000;
    const b = button(ctl, "改善後を見る →", () => ((after = !after), (b.textContent = after ? "← 改善前を見る" : "改善後を見る →"), (t0 = performance.now() / 1000)));
    // screws: [x, head y, direction (+1 head on top / −1 head below)]
    const screws: [number, number, number][] = [
      [157, 44, 1], [363, 44, 1], [178, 136, 1], [342, 136, 1], [157, 178, -1], [363, 178, -1],
    ];
    const screw = (x: number, y: number, dir: number) =>
      `<rect class="k-part-h" x="${x - 3}" y="${dir > 0 ? y + 4 : y - 18}" width="6" height="14" stroke-width="0.8"/><path class="k-part" d="M${x - 8},${dir > 0 ? y + 4 : y - 4} L${x + 8},${dir > 0 ? y + 4 : y - 4} L${x + 6},${dir > 0 ? y - 3 : y + 3} L${x - 6},${dir > 0 ? y - 3 : y + 3} Z" stroke-width="1"/>`;
    const draw = (now: number) => {
      const k = ease((now - t0) / 1.4);
      const e = after ? k : 1 - k; // 0 = before, 1 = after
      let s = `<rect class="k-ground" x="100" y="196" width="320" height="10"/><line class="k-edge" x1="100" y1="196" x2="420" y2="196" stroke-width="1.2"/>`;
      // feet + base
      s += `<g class="k-shadow"><rect class="k-part" x="130" y="160" width="260" height="14"/><rect class="k-part" x="140" y="174" width="30" height="22"/><rect class="k-part" x="350" y="174" width="30" height="22"/>`;
      // ribs integrated into the base (after)
      s += `<g opacity="${n1(e)}"><path class="k-part" d="M150,160 L150,66 L164,66 L164,140 Q164,150 176,152 L176,160 Z"/><path class="k-part" d="M370,160 L370,66 L356,66 L356,140 Q356,150 344,152 L344,160 Z"/></g>`;
      // separate L brackets (before)
      s += `<g opacity="${n1(1 - e)}"><path class="k-alu" d="M150,66 L164,66 L164,140 L190,140 L190,150 L150,150 Z"/><path class="k-alu" d="M370,66 L356,66 L356,140 L330,140 L330,150 L370,150 Z"/></g>`;
      // cover
      s += `<rect class="k-plastic" x="144" y="48" width="232" height="18" rx="3"/>`;
      s += `</g>`;
      // snap hooks on the cover (after)
      s += `<g opacity="${n1(e)}"><path d="M146,64 L146,86 L156,80" fill="none" style="stroke:var(--tb-good)" stroke-width="3"/><path d="M374,64 L374,86 L364,80" fill="none" style="stroke:var(--tb-good)" stroke-width="3"/>`;
      s += `<text class="k-good-t" x="138" y="104" text-anchor="end">スナップフィット</text><text class="k-good-t" x="260" y="120" text-anchor="middle">ベースと一体のリブ</text></g>`;
      // screws fly out and fade
      screws.forEach(([x, y, dir]) => (s += `<g opacity="${n1(1 - e)}" transform="translate(0 ${n1(-dir * e * 26)})">${screw(x, y, dir)}</g>`));
      s += `<text class="tick" x="196" y="128" opacity="${n1(1 - e)}">ブラケット</text><text class="tick" x="260" y="40" text-anchor="middle">カバー</text>`;
      s += `<text class="tick" x="260" y="188" text-anchor="middle">ベース</text>`;
      const parts = Math.round(4 + 6 - (2 + 6) * e);
      const time = Math.round(95 - 60 * e);
      // readout cards
      s += panel(410, 34, 102, 56) + panel(410, 100, 102, 56);
      s += `<text class="tick" x="461" y="52" text-anchor="middle">部品点数</text><text class="k-title" x="461" y="78" text-anchor="middle" style="font-size:20px">${parts}</text>`;
      s += `<text class="tick" x="461" y="118" text-anchor="middle">組立時間の目安</text><text class="k-title" x="461" y="144" text-anchor="middle" style="font-size:20px">${time} 秒</text>`;
      s += `<text class="mark-t" x="20" y="226">部品点数 ${parts} 点 (うち ねじ ${Math.round(6 * (1 - e))} 本)・組立時間の目安 ${time} 秒</text>`;
      svg.innerHTML = s;
    };
    out.innerHTML = `<p class="tb-note">ブラケットをベースと一体化 (リブ化) し、カバーをスナップフィットにすると、ねじ 6 本とブラケット 2 個がなくなります。部品が減ると、設計・調達・在庫・組立・検査の手間がまとめて減ります (時間は説明用の目安)。</p>`;
    draw(t0 + 2);
    loop(host, (now) => draw(now), () => true);
  },

  /** Fitts' law experiment. */
  "anim-fitts"(host) {
    const { ctl, svg, out } = frame(host, "体験: フィッツの法則 (ターゲットの大きさと距離)", 240);
    const trials: { id: number; ms: number }[] = [];
    let target: { x: number; y: number; w: number; d: number } | null = null;
    let from = { x: 260, y: 120 };
    let shownAt = 0;
    button(ctl, "▶ 開始 / やり直し", () => ((trials.length = 0), next()), "primary");
    const info = document.createElement("span");
    info.className = "tb-anim-info";
    ctl.appendChild(info);
    const next = () => {
      const w = [12, 20, 32, 52][Math.floor(Math.random() * 4)];
      const ang = Math.random() * Math.PI * 2;
      const d = [80, 140, 200][Math.floor(Math.random() * 3)];
      const x = Math.max(w / 2 + 4, Math.min(516 - w / 2, from.x + Math.cos(ang) * d));
      const y = Math.max(w / 2 + 14, Math.min(226 - w / 2, from.y + Math.sin(ang) * d * 0.6));
      target = { x, y, w, d: Math.hypot(x - from.x, y - from.y) };
      shownAt = performance.now();
      draw();
    };
    const draw = () => {
      let s = `<rect x="0" y="0" width="520" height="240" rx="8" style="fill:var(--tb-surface)"/><rect x="0" y="0" width="520" height="240" rx="8" fill="url(#k-dots)" opacity="0.6"/>`;
      // progress bar
      s += `<rect x="12" y="8" width="496" height="5" rx="2.5" style="fill:var(--tb-surface-2)"/><rect x="12" y="8" width="${n1((trials.length / 20) * 496)}" height="5" rx="2.5" style="fill:var(--tb-good)"/>`;
      if (target) {
        const r = target.w / 2;
        s += `<line x1="${n1(from.x)}" y1="${n1(from.y)}" x2="${n1(target.x)}" y2="${n1(target.y)}" class="k-thin" stroke-dasharray="4 4"/>`;
        const mx = (from.x + target.x) / 2, my = (from.y + target.y) / 2;
        s += `<text class="k-dimtext" x="${n1(mx)}" y="${n1(my - 6)}" text-anchor="middle" style="paint-order:stroke;stroke:var(--tb-surface);stroke-width:3px">D</text>`;
        s += `<g class="k-shadow"><circle class="fitts-target k-accent" cx="${n1(target.x)}" cy="${n1(target.y)}" r="${r}"/></g>`;
        if (r > 8) s += `<circle cx="${n1(target.x)}" cy="${n1(target.y)}" r="${n1(r * 0.55)}" style="fill:none;stroke:#fff;pointer-events:none" stroke-width="1.5"/>`;
        s += `<circle cx="${n1(target.x)}" cy="${n1(target.y)}" r="2" style="fill:#fff;pointer-events:none"/>`;
      } else s += `<text class="lbl" x="260" y="124" text-anchor="middle">「開始」を押し、現れた円をできるだけ速くクリック</text>`;
      if (target || trials.length) s += `<circle cx="${n1(from.x)}" cy="${n1(from.y)}" r="5" style="fill:var(--tb-text-3);stroke:var(--tb-surface)" stroke-width="1.5"/>`;
      svg.innerHTML = s;
      info.textContent = `${trials.length} / 20 回`;
    };
    svg.addEventListener("click", (e) => {
      if (!target) return;
      const { x, y } = svgPoint(svg, e, 520, 240);
      if (Math.hypot(x - target.x, y - target.y) > target.w / 2 + 2) return;
      const id = Math.log2(target.d / target.w + 1);
      trials.push({ id, ms: performance.now() - shownAt });
      from = { x: target.x, y: target.y };
      if (trials.length >= 20) {
        target = null;
        result();
        draw();
      } else next();
    });
    const result = () => {
      const n = trials.length;
      const mx = trials.reduce((a, t) => a + t.id, 0) / n, my = trials.reduce((a, t) => a + t.ms, 0) / n;
      const b = trials.reduce((a, t) => a + (t.id - mx) * (t.ms - my), 0) / Math.max(1e-9, trials.reduce((a, t) => a + (t.id - mx) ** 2, 0));
      const a = my - b * mx;
      const X = (id: number) => 50 + (id / 5) * 440, Y = (ms: number) => 170 - Math.min(ms, 1600) / 10;
      let grid = "";
      for (let ms = 400; ms <= 1600; ms += 400) grid += `<line class="grid" x1="50" x2="490" y1="${Y(ms)}" y2="${Y(ms)}"/><text class="tick" x="44" y="${Y(ms) + 4}" text-anchor="end">${ms}</text>`;
      for (let id = 1; id <= 5; id++) grid += `<text class="tick" x="${X(id)}" y="184" text-anchor="middle">${id}</text>`;
      const pts = trials.map((t) => `<circle cx="${n1(X(t.id))}" cy="${n1(Y(t.ms))}" r="4" style="fill:var(--tb-accent);stroke:var(--tb-surface)" stroke-width="1" opacity="0.85"/>`).join("");
      out.innerHTML = `<svg class="tb-chart" viewBox="0 0 520 206" role="img" aria-label="難しさと時間の関係">${grid}<line class="axis" x1="50" x2="500" y1="170" y2="170"/><line class="axis" x1="50" x2="50" y1="10" y2="170"/><line x1="${X(0)}" y1="${n1(Y(a))}" x2="${X(5)}" y2="${n1(Y(a + b * 5))}" style="stroke:var(--tb-warn)" stroke-width="2.4"/>${pts}<text class="lbl" x="500" y="200" text-anchor="end">難しさ ID = log₂(D/W + 1)</text><text class="lbl" x="56" y="20">時間 [ms]</text></svg>
        <table class="tb-res"><tr><th>あなたの式</th><td>時間 ≈ ${fmt(a, 3)} + ${fmt(b, 3)} × ID [ms]</td></tr><tr><th>平均時間</th><td>${fmt(my, 3)} ms</td></tr></table>
        <p class="tb-note">遠くて小さいターゲットほど時間がかかります (ID が大きい)。よく使うボタンは大きく・近くに、危険なボタンは小さく・離して置く理由がここにあります。</p>`;
    };
    out.innerHTML = `<p class="tb-note">20 回クリックすると、難しさ (ID) と時間の関係があなたのデータでグラフになります。</p>`;
    draw();
  },

  /** Reach envelope by percentile. */
  "anim-reach"(host) {
    const { ctl, svg, out } = frame(host, "体格の違いと手の届く範囲 (立位・側面)", 262);
    // stature (mm) by group/percentile — rough illustrative values for Japanese adults
    const data: Record<string, number> = { "f5": 1490, "f50": 1580, "f95": 1670, "m5": 1615, "m50": 1710, "m95": 1805 };
    let key = "f5";
    let shelf = 1800;
    let curAng: number | null = null;
    select(ctl, [["f5", "女性 5 パーセンタイル"], ["f50", "女性 50"], ["f95", "女性 95"], ["m5", "男性 5"], ["m50", "男性 50"], ["m95", "男性 95"]], key, (v) => ((key = v), draw()));
    slider(ctl, "棚・操作部の高さ mm", 1000, 2100, shelf, 10, (v) => ((shelf = v), draw()));
    const targetAng = () => {
      const H = data[key];
      const sh = H * 0.818, arm = H * 0.44, reachUp = sh + arm;
      const reachTo = Math.min(shelf, reachUp);
      return Math.asin(Math.max(-1, Math.min(1, (reachTo - sh) / arm)));
    };
    const draw = () => {
      const H = data[key];
      const k = 0.105; // px per mm
      const g = 244; // ground y
      const sh = H * 0.818, arm = H * 0.44, reachUp = sh + arm; // shoulder height, arm length, overhead reach (rough ratios)
      const head = H * 0.13;
      const X = 110;
      const Y = (mm: number) => g - mm * k;
      if (curAng === null) curAng = targetAng();
      const ang = curAng;
      let s = `<rect class="k-ground" x="14" y="${g}" width="490" height="10"/><line class="k-edge" x1="14" y1="${g}" x2="504" y2="${g}" stroke-width="1.4"/>`;
      // height dimension
      s += `<line class="k-ext" x1="${X - 14}" y1="${n1(Y(H))}" x2="${X - 46}" y2="${n1(Y(H))}"/><line class="k-dimline" x1="${X - 40}" y1="${g}" x2="${X - 40}" y2="${n1(Y(H))}"/>`;
      s += `<text class="k-dimtext" x="${X - 46}" y="${n1(Y(H / 2))}" text-anchor="end">${H}</text>`;
      // reach arc and shoulder line
      s += `<path d="M${X},${n1(Y(reachUp))} A${n1(arm * k)},${n1(arm * k)} 0 0 1 ${n1(X + arm * k)},${n1(Y(sh))}" class="k-hidden" style="stroke:var(--tb-accent)"/>`;
      s += `<line class="k-thin" x1="${X}" y1="${n1(Y(sh))}" x2="${n1(X + arm * k + 10)}" y2="${n1(Y(sh))}" stroke-dasharray="3 3"/>`;
      // person (side view, facing right)
      const hip = H * 0.53, knee = H * 0.285, legW = H * 0.075 * k, bodyW = H * 0.13 * k;
      s += `<g class="k-shadow">`;
      s += `<path d="M${X - 2},${n1(Y(hip))} L${X + 2},${n1(Y(knee))} L${X - 1},${n1(Y(H * 0.045))}" fill="none" style="stroke:var(--k-line-2)" stroke-width="${n1(legW)}" stroke-linecap="round"/>`;
      s += `<path d="M${X - 1},${n1(Y(H * 0.03))} l${n1(H * 0.13 * k * 0.9)},0" style="stroke:var(--k-line)" stroke-width="${n1(H * 0.03 * k + 1)}" stroke-linecap="round"/>`;
      s += `<rect class="k-accent" x="${n1(X - bodyW / 2)}" y="${n1(Y(sh + H * 0.02))}" width="${n1(bodyW)}" height="${n1((sh + H * 0.02 - hip + H * 0.03) * k)}" rx="${n1(bodyW / 2.4)}"/>`;
      s += `<rect class="k-skin" x="${n1(X - H * 0.022 * k)}" y="${n1(Y(sh + H * 0.06))}" width="${n1(H * 0.044 * k)}" height="${n1(H * 0.05 * k)}" stroke-width="0.8"/>`;
      s += `<ellipse class="k-skin" cx="${n1(X + 1)}" cy="${n1(Y(H - head / 2))}" rx="${n1((head / 2) * k * 0.85)}" ry="${n1((head / 2) * k)}"/>`;
      // arm (sleeve + forearm + hand)
      const ax = X, ay = Y(sh);
      const hx = ax + arm * k * Math.cos(ang), hy = ay - arm * k * Math.sin(ang);
      const ex = ax + arm * k * 0.45 * Math.cos(ang), ey = ay - arm * k * 0.45 * Math.sin(ang);
      s += `<line x1="${n1(ax)}" y1="${n1(ay)}" x2="${n1(hx)}" y2="${n1(hy)}" style="stroke:var(--k-line)" stroke-width="${n1(H * 0.045 * k + 2)}" stroke-linecap="round"/>`;
      s += `<line x1="${n1(ax)}" y1="${n1(ay)}" x2="${n1(hx)}" y2="${n1(hy)}" style="stroke:var(--k-skin-2)" stroke-width="${n1(H * 0.045 * k)}" stroke-linecap="round"/>`;
      s += `<line x1="${n1(ax)}" y1="${n1(ay)}" x2="${n1(ex)}" y2="${n1(ey)}" style="stroke:var(--k-accent-2)" stroke-width="${n1(H * 0.05 * k)}" stroke-linecap="round"/>`;
      s += `<circle class="k-skin" cx="${n1(hx)}" cy="${n1(hy)}" r="${n1(H * 0.03 * k)}"/>`;
      s += `</g>`;
      // shelf on a cabinet
      const state = shelf <= reachUp * 0.9 ? 0 : shelf <= reachUp ? 1 : 2;
      const col = ["var(--tb-good)", "var(--tb-warn)", "var(--tb-bad)"][state];
      const sx0 = X + 34, sx1 = X + 168, sy = Y(shelf);
      s += `<rect class="k-alu" x="${sx1}" y="${n1(Y(2150))}" width="12" height="${n1(2150 * k)}"/>`;
      s += `<g class="k-shadow"><rect class="k-alu" x="${sx0}" y="${n1(sy - 3)}" width="${sx1 - sx0}" height="7" rx="1.5"/></g>`;
      s += `<rect x="${sx0}" y="${n1(sy - 3)}" width="5" height="7" style="fill:${col}"/>`;
      s += `<rect x="${sx0 + 26}" y="${n1(sy - 15)}" width="22" height="12" rx="2" class="k-plastic" stroke-width="1"/>`;
      s += `<text class="tick" x="${sx0 + 56}" y="${n1(sy - 7)}">棚 ${shelf} mm</text>`;
      if (state === 2) s += `<line x1="${n1(hx)}" y1="${n1(hy)}" x2="${n1(hx)}" y2="${n1(sy + 6)}" style="stroke:var(--tb-bad)" stroke-width="1.4" stroke-dasharray="3 3"/>`;
      // readouts
      s += panel(306, 70, 206, 128);
      s += `<text class="mark-t" x="318" y="94">身長 ${H} mm</text><text class="tick" x="318" y="116">肩の高さ ≈ ${Math.round(sh)} mm</text><text class="tick" x="318" y="136">腕を伸ばして届く高さ ≈ ${Math.round(reachUp)} mm</text>`;
      s += badge(328, 170, ["✓", "!", "✕"][state], col);
      s += `<text class="mark-t" x="344" y="174" style="fill:${col}">${["楽に届く", "ぎりぎり届く (腕を伸ばしきる)", "届かない / 踏み台が必要"][state]}</text>`;
      svg.innerHTML = s;
    };
    out.innerHTML = `<p class="tb-note">身長と体の比率は説明用の概略値です。実際の設計では人体寸法データベースなどの一次資料を使ってください。「届く」寸法は小さい人 (女性 5 パーセンタイルなど) で確認します。</p>`;
    draw();
    loop(host, (_t, dt) => {
      const tgt = targetAng();
      if (curAng === null || Math.abs(tgt - curAng) < 1e-3) return;
      curAng += (tgt - curAng) * Math.min(1, dt * 7);
      draw();
    }, () => !reduced());
    if (reduced()) {
      // no easing: snap to the target on every change
      const snap = () => ((curAng = targetAng()), draw());
      ctl.addEventListener("input", snap);
      ctl.addEventListener("change", snap);
    }
  },

  /** Stove knob mapping test. */
  "anim-mapping"(host) {
    const { ctl, svg, out } = frame(host, "体験: 操作具の対応づけ (コンロのつまみ)", 236);
    let layout: "row" | "mapped" = "row";
    let target = -1, errors = 0, done = 0, t0 = 0;
    let wrong = -1;
    const results: Record<string, string> = {};
    select(ctl, [["row", "つまみが一列 (対応がわかりにくい)"], ["mapped", "火口と同じ配置 (対応づけ)"]], layout, (v) => ((layout = v as "row" | "mapped"), start()));
    button(ctl, "▶ 開始", () => start(), "primary");
    const burners = [[110, 64], [210, 64], [110, 144], [210, 144]];
    const knobs = () => (layout === "row" ? [[340, 200], [380, 200], [420, 200], [460, 200]] : [[360, 64], [440, 64], [360, 144], [440, 144]]);
    // row layout mapping is deliberately non-obvious: 左奥, 右奥, 左手前, 右手前
    const start = () => {
      errors = 0;
      done = 0;
      t0 = performance.now();
      pick();
    };
    const pick = () => {
      target = Math.floor(Math.random() * 4);
      draw();
    };
    const draw = () => {
      let s = `<g class="k-shadow"><rect class="k-alu" x="56" y="16" width="210" height="182" rx="10"/></g>`;
      s += `<rect x="64" y="24" width="194" height="166" rx="6" style="fill:var(--tb-text);fill-opacity:0.82"/>`;
      burners.forEach(([x, y], i) => {
        const on = i === target;
        if (on) s += `<circle class="k-glow" cx="${x}" cy="${y}" r="30" style="fill:var(--tb-bad)" opacity="0.45"/>`;
        s += `<circle cx="${x}" cy="${y}" r="30" fill="none" style="stroke:${on ? "var(--tb-bad)" : "var(--k-line-2)"}" stroke-width="${on ? 4 : 2}"/>`;
        s += `<circle cx="${x}" cy="${y}" r="16" fill="none" style="stroke:var(--k-line-2)" stroke-width="1.5"/>`;
        for (let a = 0; a < 4; a++) {
          const c = Math.cos((a * Math.PI) / 2 + Math.PI / 4), sn = Math.sin((a * Math.PI) / 2 + Math.PI / 4);
          s += `<line x1="${n1(x + c * 10)}" y1="${n1(y + sn * 10)}" x2="${n1(x + c * 34)}" y2="${n1(y + sn * 34)}" style="stroke:var(--k-line-2)" stroke-width="3"/>`;
        }
        if (on) s += `<rect x="${x - 20}" y="${y - 10}" width="40" height="20" rx="10" style="fill:var(--tb-bad)"/><text x="${x}" y="${y + 5}" text-anchor="middle" style="fill:#fff;font-size:12px;font-weight:700">点火</text>`;
      });
      const ks = knobs();
      const minx = Math.min(...ks.map((p) => p[0])) - 26, maxx = Math.max(...ks.map((p) => p[0])) + 26;
      const miny = Math.min(...ks.map((p) => p[1])) - 26, maxy = Math.max(...ks.map((p) => p[1])) + 26;
      s += `<g class="k-shadow"><rect class="k-panel" x="${minx}" y="${miny}" width="${maxx - minx}" height="${maxy - miny}" rx="8"/></g>`;
      ks.forEach(([x, y], i) => {
        const bad = i === wrong;
        s += `<g class="knob" data-k="${i}" style="cursor:pointer"><circle cx="${x}" cy="${y}" r="17" style="fill:transparent"/><g class="k-shadow"><circle class="k-part" cx="${x}" cy="${y}" r="15" style="${bad ? "stroke:var(--tb-bad);stroke-width:3" : ""}"/></g><circle cx="${x}" cy="${y}" r="9" style="fill:var(--k-steel-1);stroke:var(--k-line-2)" stroke-width="1"/><line x1="${x}" x2="${x}" y1="${y - 13}" y2="${y - 3}" style="stroke:var(--tb-accent)" stroke-width="3.5"/></g>`;
      });
      if (target < 0) s += `<text class="lbl" x="${(minx + maxx) / 2}" y="${miny - 10}" text-anchor="middle">「開始」を押す</text>`;
      else s += `<text class="tick" x="${(minx + maxx) / 2}" y="${miny - 10}" text-anchor="middle">${done + 1} / 8 回目・誤操作 ${errors} 回</text>`;
      svg.innerHTML = s;
    };
    svg.addEventListener("click", (e) => {
      const g = (e.target as Element).closest?.(".knob");
      if (!g || target < 0) return;
      const ki = Number(g.getAttribute("data-k"));
      if (ki !== target) {
        errors++;
        wrong = ki;
        draw();
        setTimeout(() => {
          if (wrong === ki) (wrong = -1), draw();
        }, 350);
        return;
      }
      wrong = -1;
      done++;
      if (done >= 8) {
        results[layout] = `誤操作 ${errors} 回・平均 ${fmt((performance.now() - t0) / 8, 3)} ms`;
        target = -1;
        out.innerHTML = `<table class="tb-res"><tr><th>一列の配置</th><td>${results.row ?? "未実施"}</td></tr><tr><th>火口と同じ配置</th><td>${results.mapped ?? "未実施"}</td></tr></table><p class="tb-note">赤い火口に対応するつまみを 8 回クリックした結果です。両方の配置で試すと、空間的に対応した配置 (マッピング) のほうが速く、間違いが少なくなるはずです。</p>`;
        draw();
      } else pick();
    });
    out.innerHTML = `<p class="tb-note">赤く光った火口に火をつけるつまみをクリックします (8 回)。2 つの配置で比べてみましょう。</p>`;
    draw();
  },
};
