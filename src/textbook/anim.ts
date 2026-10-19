// Animated and hands-on figures for the textbook (<div data-widget="anim-...">).
// Plain SVG + requestAnimationFrame; every figure has a static first frame
// so it still reads when printed, and stops when it leaves the page.
import { fmt } from "./chart";

const NS = "http://www.w3.org/2000/svg";

function frame(host: HTMLElement, title: string, h = 220) {
  host.classList.add("tb-widget", "tb-anim");
  host.innerHTML = "";
  const head = document.createElement("div");
  head.className = "tb-widget-head";
  head.innerHTML = `<span class="tb-widget-badge anim">動く図</span>${title}`;
  const ctl = document.createElement("div");
  ctl.className = "tb-anim-ctl";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", `0 0 520 ${h}`);
  svg.setAttribute("class", "tb-chart");
  const out = document.createElement("div");
  out.className = "tb-widget-out";
  host.append(head, ctl, svg, out);
  return { ctl, svg, out };
}

function button(ctl: HTMLElement, label: string, on: () => void, cls = "") {
  const b = document.createElement("button");
  b.className = "tb-btn" + (cls ? ` ${cls}` : "");
  b.textContent = label;
  b.addEventListener("click", on);
  ctl.appendChild(b);
  return b;
}

function slider(ctl: HTMLElement, label: string, min: number, max: number, value: number, step: number, on: (v: number) => void) {
  const l = document.createElement("label");
  l.className = "tb-anim-slider";
  const span = document.createElement("span");
  const i = document.createElement("input");
  i.type = "range";
  Object.assign(i, { min: String(min), max: String(max), step: String(step), value: String(value) });
  const show = () => (span.textContent = `${label} ${i.value}`);
  i.addEventListener("input", () => (show(), on(Number(i.value))));
  show();
  l.append(span, i);
  ctl.appendChild(l);
  return i;
}

function select(ctl: HTMLElement, options: [string, string][], value: string, on: (v: string) => void) {
  const s = document.createElement("select");
  for (const [v, t] of options) {
    const o = document.createElement("option");
    o.value = v;
    o.textContent = t;
    s.appendChild(o);
  }
  s.value = value;
  s.addEventListener("change", () => on(s.value));
  ctl.appendChild(s);
  return s;
}

/** Run `step(t)` every frame while the host is on the page and `playing()` is true. */
function loop(host: HTMLElement, step: (t: number, dt: number) => void, playing: () => boolean = () => true) {
  let last = performance.now();
  const tick = (now: number) => {
    if (!host.isConnected) return;
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    if (playing()) step(now / 1000, dt);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

const reduced = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

// ------------------------------------------------------------- figures ---

export const ANIM: Record<string, (host: HTMLElement) => void> = {
  /** Reflection line crossing G0 / G1 / G2 joints. */
  "anim-highlight"(host) {
    const { ctl, svg, out } = frame(host, "面のつながりとハイライト (G0 / G1 / G2)", 230);
    let playing = !reduced();
    const pb = button(ctl, playing ? "■ 止める" : "▶ 動かす", () => ((playing = !playing), (pb.textContent = playing ? "■ 止める" : "▶ 動かす")));
    // three profiles: y(x) on x in [0,1], joint at 0.5
    const prof = {
      G0: (x: number) => (x < 0.5 ? 0.25 : 0.25 + (x - 0.5) * 1.2), // corner (slope jump)
      G1: (x: number) => (x < 0.5 ? 0.25 : 0.25 + 0.6 * (x - 0.5) ** 2 * 4 * 0.5 + 0 * x), // tangent, curvature jump
      G2: (x: number) => (x < 0.5 ? 0.25 : 0.25 + 0.6 * (x - 0.5) ** 3 * 8 * 0.5), // curvature continuous
    };
    const slope = (f: (x: number) => number, x: number) => (f(Math.min(1, x + 1e-3)) - f(Math.max(0, x - 1e-3))) / 2e-3;
    const cols = [
      ["G0", "位置だけ連続 (角)", prof.G0],
      ["G1", "接線連続 (正接 R)", prof.G1],
      ["G2", "曲率連続", prof.G2],
    ] as const;
    const draw = (t: number) => {
      const phase = (t * 0.25) % 1; // light direction sweeps
      let s = "";
      cols.forEach(([id, label, f], i) => {
        const x0 = 15 + i * 170, w = 150, base = 150;
        const P = (x: number) => [x0 + x * w, base - f(x) * 120] as const;
        let path = `M${P(0).join(",")}`;
        for (let k = 1; k <= 60; k++) path += ` L${P(k / 60).join(",")}`;
        s += `<path d="${path} L${x0 + w},${base + 30} L${x0},${base + 30} Z" class="sec"/>`;
        // reflection band: where the surface normal faces the light (slope ≈ light slope)
        const light = -0.4 + phase * 1.6;
        for (let k = 0; k <= 120; k++) {
          const x = k / 120;
          if (Math.abs(slope(f, x) - light) < 0.12) {
            const [px, py] = P(x);
            s += `<circle cx="${px}" cy="${py}" r="3.2" fill="#fff" stroke="var(--tb-warn)" stroke-width="1"/>`;
          }
        }
        s += `<line class="guide" x1="${P(0.5)[0]}" x2="${P(0.5)[0]}" y1="${base - 100}" y2="${base + 30}"/>`;
        s += `<text class="lbl" x="${x0 + w / 2}" y="20" text-anchor="middle">${id}</text><text class="tick" x="${x0 + w / 2}" y="210" text-anchor="middle">${label}</text>`;
      });
      svg.innerHTML = s;
    };
    out.innerHTML = `<p class="tb-note">白い点は光が映り込む位置 (ハイライト)。G0 では映り込みが跳び、G1 では位置は続くが速さが急に変わり、G2 ではなめらかに流れます。高級感のある外装は G2 以上でつなぎます。</p>`;
    draw(0.3 / 0.25);
    loop(host, (t) => draw(t), () => playing);
  },

  /** Moulded part ejected with / without draft. */
  "anim-draft"(host) {
    const { ctl, svg, out } = frame(host, "抜き勾配と型開き", 230);
    let draft = 2;
    let t0 = performance.now() / 1000;
    select(ctl, [["0", "抜き勾配なし (0°)"], ["1", "抜き勾配 1°"], ["2", "抜き勾配 2°"], ["4", "抜き勾配 4°"]], "2", (v) => ((draft = Number(v)), (t0 = performance.now() / 1000)));
    button(ctl, "↻ もう一度", () => (t0 = performance.now() / 1000));
    const draw = (now: number) => {
      const t = Math.min(1, ((now - t0) % 4) / 2.5);
      const lift = t * 90;
      const k = Math.tan((draft * Math.PI) / 180) * 80 * 6; // exaggerated for visibility
      const scrape = draft === 0 && t > 0.05 && t < 1;
      // core (fixed) and part (moving up)
      const cx = 260, top = 90, bot = 190, half = 70;
      let s = `<rect x="120" y="${bot}" width="280" height="22" fill="var(--tb-surface-2)" stroke="var(--tb-text-3)"/>`;
      s += `<text class="tick" x="260" y="${bot + 16}" text-anchor="middle">可動型 (コア)</text>`;
      s += `<path d="M${cx - half - k * 0.05},${bot} L${cx - half + k * 0.05},${top} L${cx + half - k * 0.05},${top} L${cx + half + k * 0.05},${bot} Z" fill="var(--tb-surface-2)" stroke="var(--tb-text-3)"/>`;
      const y = -lift;
      s += `<g transform="translate(0 ${y})"><path d="M${cx - half - 8 - k * 0.05},${bot} L${cx - half - 8 + k * 0.05},${top - 8} L${cx + half + 8 - k * 0.05},${top - 8} L${cx + half + 8 + k * 0.05},${bot} L${cx + half + k * 0.05},${bot} L${cx + half - k * 0.05},${top} L${cx - half + k * 0.05},${top} L${cx - half - k * 0.05},${bot} Z" class="sec"/>`;
      s += `<text class="lbl" x="${cx}" y="${top - 16}" text-anchor="middle">成形品</text></g>`;
      if (scrape) for (let i = 0; i < 5; i++) s += `<line x1="${cx - half}" x2="${cx - half - 10}" y1="${top + 15 + i * 18 - lift * 0.2}" y2="${top + 20 + i * 18 - lift * 0.2}" stroke="var(--tb-bad)" stroke-width="2"/><line x1="${cx + half}" x2="${cx + half + 10}" y1="${top + 15 + i * 18 - lift * 0.2}" y2="${top + 20 + i * 18 - lift * 0.2}" stroke="var(--tb-bad)" stroke-width="2"/>`;
      s += `<text class="mark-t" x="20" y="24">${draft === 0 ? "側面がこすれ続ける → 傷・変形・離型不良" : `${draft}° — 少し上がると側面が離れる`}</text>`;
      svg.innerHTML = s;
    };
    out.innerHTML = `<p class="tb-note">勾配は見やすいよう誇張して描いています。一般的な目安は 0.5〜2°、シボ (しぼ) 加工の面はさらに大きくします。</p>`;
    draw(t0 + 1);
    loop(host, (now) => draw(now), () => !reduced());
  },

  /** Snap-fit hook deflecting while the lid is pushed on. */
  "anim-snapfit"(host) {
    const { ctl, svg, out } = frame(host, "スナップフィットのたわみ", 220);
    let pos = 0;
    let playing = !reduced();
    const sl = slider(ctl, "押し込み量 %", 0, 100, 0, 1, (v) => ((pos = v / 100), (playing = false), draw()));
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
      const lidX = bx + t * k / 2 + barbW - y * k; // lid edge overlaps the barb by the undercut
      let s = `<line x1="${bx - 60}" x2="${bx + 240}" y1="${by}" y2="${by}" stroke="var(--tb-text-3)" stroke-width="4"/><text class="tick" x="${bx - 60}" y="${by + 16}">本体</text>`;
      s += `<rect x="${lidX}" y="${lidBottom - lidH}" width="200" height="${lidH}" fill="var(--tb-surface-2)" stroke="var(--tb-text-2)"/><text class="tick" x="${lidX + 100}" y="${lidBottom - lidH / 2 + 4}" text-anchor="middle">ふた (相手側)</text>`;
      // hook beam: bends to the left (−x) by d at the tip, shape ∝ height²
      let path = `M${bx},${by}`;
      for (let i = 0; i <= 20; i++) {
        const h = (i / 20) * L;
        path += ` L${bx - d * (h / L) ** 2 * k},${by - h * k}`;
      }
      s += `<path d="${path}" fill="none" stroke="var(--tb-accent)" stroke-width="${t * k * 0.9}" stroke-linecap="butt"/>`;
      const tx = bx - d * k;
      s += `<path d="M${tx + (t * k) / 2},${tipy} L${tx + (t * k) / 2 + barbW},${tipy + barbH} L${tx + (t * k) / 2},${tipy + barbH} Z" fill="var(--tb-accent)"/>`;
      s += `<text class="mark-t" x="20" y="24">たわみ ${fmt(d, 2)} mm / 根元のひずみ ≈ ${fmt(strain, 2)} %${latched ? " — はまった (ロック)" : ""}</text>`;
      if (d > 0) s += `<path d="M${bx + 30},${by - 20} a30,30 0 0 0 -16,-30" fill="none" stroke="var(--tb-bad)" stroke-width="2"/><text class="tick" x="${bx + 36}" y="${by - 20}">根元にひずみが集中</text>`;
      svg.innerHTML = s;
      out.innerHTML = `<p class="tb-note">ふたが下りると、ツメの斜面が押されて片持ちばりのようにたわみ、通り過ぎると戻って引っかかります。根元のひずみ ε ≈ 1.5·t·y / L² (t: 厚さ、y: 引っかかり量、L: 長さ)。樹脂の許容ひずみ (ABS で 2〜3 % 程度、繰返しはその半分程度が目安) を超えないよう、ツメを長く・薄く、根元に R を付けます。</p>`;
    };
    draw();
    loop(host, (_t, dt) => {
      pos = (pos + dt * 0.35) % 1.05;
      sl.value = String(Math.round(Math.min(1, pos) * 100));
      draw();
    }, () => playing);
  },

  /** Force flow around a notch: lines crowd at a sharp corner, spread with a larger R. */
  "anim-stressflow"(host) {
    const { ctl, svg, out } = frame(host, "力の流れと角の R (応力集中)", 230);
    let R = 2;
    let phase = 0;
    slider(ctl, "段の角の R (mm)", 0, 20, 2, 1, (v) => ((R = v), draw()));
    const draw = () => {
      // stepped bar: wide (h=120) → narrow (h=60), step at x=260
      const yTop = 40, yBotW = 160, yTopN = 70, step = 260;
      const r = Math.max(R * 3, 1);
      let s = `<path d="M20,${yTop} L${step - r},${yTop} Q${step},${yTop} ${step},${yTop + Math.min(r, 30)} L${step},${yTopN - Math.min(r, 30) * 0} L${step},${yTopN - r} Q${step},${yTopN} ${step + r},${yTopN} L500,${yTopN} L500,${yBotW - 30} L20,${yBotW - 30} Z" fill="var(--tb-surface-2)" stroke="var(--tb-text-3)"/>`;
      s = `<path d="M20,${yTop} L${step},${yTop} L${step},${yTopN - r} Q${step},${yTopN} ${step + r},${yTopN} L500,${yTopN} L500,130 L20,130 Z" fill="var(--tb-surface-2)" stroke="var(--tb-text-2)"/>`;
      const n = 7;
      for (let i = 0; i < n; i++) {
        const yl = yTop + 8 + (i * (130 - yTop - 16)) / (n - 1); // in wide part
        const yr = yTopN + 6 + (i * (130 - yTopN - 12)) / (n - 1); // in narrow part
        const bend = 30 + r * 2;
        const d = `M20,${yl} L${step - bend},${yl} C${step - bend / 3},${yl} ${step + bend / 3 - 10},${yr} ${step + bend},${yr} L500,${yr}`;
        const crowd = i === 0 ? 1 : 0;
        s += `<path d="${d}" fill="none" stroke="${crowd ? "var(--tb-bad)" : "var(--tb-accent)"}" stroke-width="${crowd ? 2.4 : 1.4}" stroke-dasharray="10 8" stroke-dashoffset="${-phase}"/>`;
      }
      const kt = 1 + 1.6 / Math.sqrt(1 + R / 1.2); // illustrative trend only
      s += `<text class="mark-t" x="${step + 8}" y="${yTopN - 8}">角: 応力集中係数の目安 ≈ ${fmt(kt, 2)}</text>`;
      s += `<path d="M30,180 l40,0 m-8,-5 l8,5 l-8,5" stroke="var(--tb-text-2)" fill="none"/><text class="tick" x="80" y="184">引張力</text>`;
      svg.innerHTML = s;
    };
    out.innerHTML = `<p class="tb-note">力の流れ (流線) は、断面が急に変わる角に集まります。R を大きくすると流れがなめらかになり、応力集中が下がります。係数の値は傾向を示すための目安です (実際の値は形状・寸法比による)。</p>`;
    draw();
    loop(host, (_t, dt) => ((phase += dt * 30), draw()), () => !reduced());
  },

  /** Monte-Carlo tolerance stack: parts vary, the gap is checked against limits. */
  "anim-stack"(host) {
    const { ctl, svg, out } = frame(host, "公差の積み上げシミュレーション", 220);
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
    button(ctl, "リセット", () => ((n = 0), (fail = 0), hist.fill(0)));
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
    const draw = (sm: ReturnType<typeof sample>) => {
      const k = 4.4;
      let s = `<rect x="20" y="30" width="${H.nom * k}" height="40" fill="none" stroke="var(--tb-text-3)" stroke-dasharray="4 3"/><text class="tick" x="20" y="24">ハウジング内寸 ${fmt(sm.h, 4)}</text>`;
      let x = 20;
      sm.sizes.forEach((w, i) => {
        s += `<rect x="${x}" y="38" width="${w * k}" height="24" class="sec"/><text class="tick" x="${x + (w * k) / 2}" y="54" text-anchor="middle">${String.fromCharCode(65 + i)} ${fmt(w, 4)}</text>`;
        x += w * k;
      });
      const ok = sm.gap >= gapMin;
      s += `<text class="mark-t" x="${Math.min(x + 4, 380)}" y="92" fill="${ok ? "var(--tb-good)" : "var(--tb-bad)"}">すきま ${fmt(sm.gap, 3)} ${ok ? "OK" : "NG"}</text>`;
      // histogram of gaps between nominal ± worst case
      const lo = nominalGap - wc, hi = nominalGap + wc, max = Math.max(1, ...hist);
      hist.forEach((c, i) => {
        const bx = 20 + (i * 480) / hist.length;
        const xv = lo + ((i + 0.5) * (hi - lo)) / hist.length;
        s += `<rect x="${bx}" y="${210 - (c / max) * 90}" width="${480 / hist.length - 2}" height="${(c / max) * 90}" fill="${xv < gapMin ? "var(--tb-bad)" : "var(--tb-accent)"}" opacity="0.7"/>`;
      });
      const gx = 20 + ((gapMin - lo) / (hi - lo)) * 480;
      s += `<line x1="${gx}" x2="${gx}" y1="112" y2="212" stroke="var(--tb-bad)" stroke-dasharray="4 3"/><text class="tick" x="${gx + 4}" y="122">下限 ${gapMin}</text>`;
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
    const { ctl, svg, out } = frame(host, "部品点数の削減 (DFA)", 220);
    let after = false;
    let t0 = performance.now() / 1000;
    const b = button(ctl, "改善後を見る →", () => ((after = !after), (b.textContent = after ? "← 改善前を見る" : "改善後を見る →"), (t0 = performance.now() / 1000)));
    const before = [
      { n: "カバー", x: 150, y: 40, w: 220, h: 18 },
      { n: "ブラケット", x: 150, y: 70, w: 30, h: 70 },
      { n: "ブラケット", x: 340, y: 70, w: 30, h: 70 },
      { n: "ベース", x: 130, y: 150, w: 260, h: 20 },
    ];
    const screws = [
      [160, 30], [360, 30], [140, 160], [380, 160], [165, 105], [355, 105],
    ];
    const draw = (now: number) => {
      const k = Math.min(1, (now - t0) / 1.2);
      const e = after ? k : 1 - k; // 0 = before, 1 = after
      let s = "";
      // base merges with brackets (brackets fade into ribs), cover becomes snap-fit
      before.forEach((p) => {
        const fade = p.n === "ブラケット" ? 1 - e : 1;
        s += `<rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" class="sec" opacity="${fade}"/>`;
      });
      s += `<path d="M150,150 l0,-${70 * e} l14,0 l0,${70 * e} M356,150 l0,-${70 * e} l14,0 l0,${70 * e}" fill="var(--tb-accent)" opacity="${0.5 * e}"/>`;
      screws.forEach(([x, y]) => (s += `<g opacity="${1 - e}"><circle cx="${x}" cy="${y}" r="6" fill="var(--tb-warn)"/><line x1="${x - 4}" x2="${x + 4}" y1="${y}" y2="${y}" stroke="#fff"/></g>`));
      s += `<path d="M150,58 l-8,10 M370,58 l8,10" stroke="var(--tb-good)" stroke-width="3" opacity="${e}"/>`;
      const parts = Math.round(4 + 6 - (2 + 6) * e);
      const time = Math.round(95 - 60 * e);
      s += `<text class="mark-t" x="20" y="200">部品点数 ${parts} 点 (うち ねじ ${Math.round(6 * (1 - e))} 本)・組立時間の目安 ${time} 秒</text>`;
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
      const y = Math.max(w / 2 + 4, Math.min(236 - w / 2, from.y + Math.sin(ang) * d * 0.6));
      target = { x, y, w, d: Math.hypot(x - from.x, y - from.y) };
      shownAt = performance.now();
      draw();
    };
    const draw = () => {
      let s = `<rect x="0" y="0" width="520" height="240" fill="transparent"/>`;
      s += `<circle cx="${from.x}" cy="${from.y}" r="4" fill="var(--tb-text-3)"/>`;
      if (target) s += `<circle class="fitts-target" cx="${target.x}" cy="${target.y}" r="${target.w / 2}" fill="var(--tb-accent)"/>`;
      else s += `<text class="lbl" x="260" y="124" text-anchor="middle">「開始」を押し、現れた円をできるだけ速くクリック</text>`;
      svg.innerHTML = s;
      info.textContent = `${trials.length} / 20 回`;
    };
    svg.addEventListener("click", (e) => {
      if (!target) return;
      const r = svg.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 520, y = ((e.clientY - r.top) / r.height) * 240;
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
      const pts = trials.map((t) => `<circle cx="${40 + (t.id / 5) * 440}" cy="${170 - Math.min(t.ms, 1600) / 10}" r="3" fill="var(--tb-accent)"/>`).join("");
      out.innerHTML = `<svg class="tb-chart" viewBox="0 0 520 190"><line class="axis" x1="40" x2="500" y1="170" y2="170"/><line class="axis" x1="40" x2="40" y1="10" y2="170"/>${pts}<line x1="40" y1="${170 - a / 10}" x2="480" y2="${170 - (a + b * 5) / 10}" stroke="var(--tb-warn)" stroke-width="2"/><text class="lbl" x="500" y="186" text-anchor="end">難しさ ID = log₂(D/W + 1)</text><text class="lbl" x="44" y="20">時間 [ms]</text></svg>
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
    select(ctl, [["f5", "女性 5 パーセンタイル"], ["f50", "女性 50"], ["f95", "女性 95"], ["m5", "男性 5"], ["m50", "男性 50"], ["m95", "男性 95"]], key, (v) => ((key = v), draw()));
    slider(ctl, "棚・操作部の高さ mm", 1000, 2100, shelf, 10, (v) => ((shelf = v), draw()));
    const draw = () => {
      const H = data[key];
      const k = 0.105; // px per mm
      const g = 250; // ground y
      const sh = H * 0.818, arm = H * 0.44, reachUp = sh + arm; // shoulder height, arm length, overhead reach (rough ratios)
      const head = H * 0.13;
      const X = 120;
      let s = `<line class="axis" x1="20" x2="500" y1="${g}" y2="${g}"/>`;
      // silhouette: head above the shoulders, trunk, legs
      s += `<circle cx="${X}" cy="${g - (H - head / 2) * k}" r="${(head / 2) * k}" class="sec"/>`;
      s += `<path d="M${X},${g - sh * k} L${X},${g - H * 0.48 * k} L${X - 12},${g} M${X},${g - H * 0.48 * k} L${X + 12},${g}" stroke="var(--tb-accent)" stroke-width="5" fill="none" stroke-linecap="round"/>`;
      const reachTo = Math.min(shelf, reachUp);
      const ang = Math.asin(Math.max(-1, Math.min(1, (reachTo - sh) / arm)));
      const hx = X + arm * k * Math.cos(ang), hy = g - (sh + arm * Math.sin(ang)) * k;
      s += `<path d="M${X},${g - sh * k} L${hx},${hy}" stroke="var(--tb-accent)" stroke-width="5" stroke-linecap="round"/>`;
      s += `<path d="M${X},${g - reachUp * k} A${arm * k},${arm * k} 0 0 1 ${X + arm * k},${g - sh * k}" fill="none" class="guide"/>`;
      const state = shelf <= reachUp * 0.9 ? 0 : shelf <= reachUp ? 1 : 2;
      const col = ["var(--tb-good)", "var(--tb-warn)", "var(--tb-bad)"][state];
      s += `<rect x="${X + 30}" y="${g - shelf * k - 4}" width="130" height="8" fill="${col}"/><text class="tick" x="${X + 30}" y="${g - shelf * k - 8}">棚 ${shelf} mm</text>`;
      s += `<text class="mark-t" x="310" y="110">身長 ${H} mm</text><text class="tick" x="310" y="130">肩の高さ ≈ ${Math.round(sh)} mm</text><text class="tick" x="310" y="148">腕を伸ばして届く高さ ≈ ${Math.round(reachUp)} mm</text>`;
      s += `<text class="mark-t" x="310" y="176" fill="${col}">${["楽に届く", "ぎりぎり届く (腕を伸ばしきる)", "届かない / 踏み台が必要"][state]}</text>`;
      svg.innerHTML = s;
    };
    out.innerHTML = `<p class="tb-note">身長と体の比率は説明用の概略値です。実際の設計では人体寸法データベースなどの一次資料を使ってください。「届く」寸法は小さい人 (女性 5 パーセンタイルなど) で確認します。</p>`;
    draw();
  },

  /** Stove knob mapping test. */
  "anim-mapping"(host) {
    const { ctl, svg, out } = frame(host, "体験: 操作具の対応づけ (コンロのつまみ)", 230);
    let layout: "row" | "mapped" = "row";
    let target = -1, errors = 0, done = 0, t0 = 0;
    const results: Record<string, string> = {};
    select(ctl, [["row", "つまみが一列 (対応がわかりにくい)"], ["mapped", "火口と同じ配置 (対応づけ)"]], layout, (v) => ((layout = v as "row" | "mapped"), start()));
    button(ctl, "▶ 開始", () => start(), "primary");
    const burners = [[110, 60], [210, 60], [110, 140], [210, 140]];
    const knobs = () => (layout === "row" ? [[330, 200], [370, 200], [410, 200], [450, 200]] : [[350, 60], [430, 60], [350, 140], [430, 140]]);
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
      let s = `<rect x="60" y="20" width="200" height="170" rx="8" fill="var(--tb-surface-2)" stroke="var(--tb-text-3)"/>`;
      burners.forEach(([x, y], i) => (s += `<circle cx="${x}" cy="${y}" r="28" fill="none" stroke="${i === target ? "var(--tb-bad)" : "var(--tb-text-3)"}" stroke-width="${i === target ? 5 : 2}"/>${i === target ? `<text class="mark-t" x="${x}" y="${y + 5}" text-anchor="middle">点火</text>` : ""}`));
      knobs().forEach(([x, y], i) => (s += `<g class="knob" data-k="${i}" style="cursor:pointer"><circle cx="${x}" cy="${y}" r="16" fill="var(--tb-surface)" stroke="var(--tb-accent)" stroke-width="3"/><line x1="${x}" x2="${x}" y1="${y - 12}" y2="${y - 4}" stroke="var(--tb-accent)" stroke-width="3"/></g>`));
      if (target < 0) s += `<text class="lbl" x="390" y="110" text-anchor="middle">「開始」を押す</text>`;
      svg.innerHTML = s;
    };
    svg.addEventListener("click", (e) => {
      const g = (e.target as Element).closest?.(".knob");
      if (!g || target < 0) return;
      if (Number(g.getAttribute("data-k")) !== target) {
        errors++;
        return;
      }
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
