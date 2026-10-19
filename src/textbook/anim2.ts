// Animated figures for the stiffness / vibration chapters (content/stiffness.ts).
// Same conventions as anim.ts: plain SVG + requestAnimationFrame, a static first
// frame, stops when the host leaves the page, respects prefers-reduced-motion.

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

function playButton(ctl: HTMLElement, get: () => boolean, set: (v: boolean) => void) {
  const label = () => (get() ? "■ 止める" : "▶ 動かす");
  const b = button(ctl, label(), () => (set(!get()), (b.textContent = label())));
  return b;
}

/** Zig-zag spring path from (x, y1) to (x, y2). */
function spring(x: number, y1: number, y2: number, w = 10, n = 6) {
  const lead = 6;
  const a = y1 + lead, b = y2 - lead, seg = (b - a) / (n * 2);
  let d = `M${x},${y1} L${x},${a}`;
  for (let i = 0; i < n * 2; i++) d += ` L${x + (i % 2 ? -w : w)},${a + seg * (i + 0.5)}`;
  d += ` L${x},${b} L${x},${y2}`;
  return d;
}

// cantilever mode shapes: λL and σ coefficients
const LAM = [1.8751, 4.6941, 7.8548];
const modeShape = (i: number, x: number) => {
  const l = LAM[i];
  const s = (Math.cosh(l) + Math.cos(l)) / (Math.sinh(l) + Math.sin(l));
  const u = l * x;
  return Math.cosh(u) - Math.cos(u) - s * (Math.sinh(u) - Math.sin(u));
};

export const ANIM2: Record<string, (host: HTMLElement) => void> = {
  /** Cantilever vibrating in mode 1 / 2 / 3. */
  "anim-modeshape"(host) {
    const { ctl, svg, out } = frame(host, "片持ちはりの固有モード", 220);
    let mode = 0;
    let playing = !reduced();
    const btns: HTMLButtonElement[] = [];
    const notes = [
      "1 次モード: 全体が一方向に曲がる。最も低い固有振動数 f₁ で、実務で最も問題になりやすい。",
      "2 次モード: f₂ ≈ 6.27 f₁。先端近く (約 0.78L) に節 (動かない点) が 1 つできる。",
      "3 次モード: f₃ ≈ 17.5 f₁。節が 2 つ (約 0.50L と 0.87L)。",
    ];
    const setMode = (m: number) => {
      mode = m;
      btns.forEach((b, i) => b.classList.toggle("primary", i === m));
      out.innerHTML = `<p class="tb-note">${notes[m]} 節にセンサーや加振源を置くとそのモードは見えにくく/励起されにくくなり、腹に動吸振器を付けると効果的です。</p>`;
      draw(0.25);
    };
    ["1 次", "2 次", "3 次"].forEach((t, i) => btns.push(button(ctl, t, () => setMode(i))));
    playButton(ctl, () => playing, (v) => (playing = v));
    const x0 = 70, len = 400, y0 = 110;
    const draw = (t: number) => {
      const amp = 70 * Math.sin(2 * Math.PI * t * (0.6 + mode * 0.25));
      const tipVal = modeShape(mode, 1);
      let s = `<rect x="${x0 - 30}" y="${y0 - 70}" width="30" height="140" class="sec"/>`;
      s += `<line class="guide" x1="${x0}" y1="${y0}" x2="${x0 + len}" y2="${y0}"/>`;
      // envelope (±)
      for (const sg of [1, -1]) {
        let d = "";
        for (let k = 0; k <= 80; k++) {
          const x = k / 80;
          d += `${k ? "L" : "M"}${x0 + x * len},${y0 - (sg * 70 * modeShape(mode, x)) / Math.abs(tipVal)}`;
        }
        s += `<path d="${d}" fill="none" stroke="var(--tb-text-3)" stroke-dasharray="3 4"/>`;
      }
      let d = "";
      for (let k = 0; k <= 80; k++) {
        const x = k / 80;
        d += `${k ? "L" : "M"}${x0 + x * len},${y0 - (amp * modeShape(mode, x)) / Math.abs(tipVal)}`;
      }
      s += `<path d="${d}" fill="none" stroke="var(--tb-accent)" stroke-width="6" stroke-linecap="round"/>`;
      // nodes
      for (let k = 1; k < 400; k++) {
        const a = modeShape(mode, k / 400), b = modeShape(mode, (k + 1) / 400);
        if (a * b < 0) {
          const xn = x0 + ((k + 0.5) / 400) * len;
          s += `<circle class="mark" cx="${xn}" cy="${y0}" r="5"/><text class="mark-t" x="${xn}" y="${y0 + 95}" text-anchor="middle">節</text>`;
        }
      }
      const ratio = [1, 6.27, 17.55][mode];
      s += `<text class="lbl" x="${x0}" y="24">${mode + 1} 次モード　f = ${ratio} × f₁</text>`;
      s += `<text class="tick" x="${x0 - 15}" y="${y0 + 88}" text-anchor="middle">固定端</text>`;
      svg.innerHTML = s;
    };
    setMode(0);
    loop(host, (t) => draw(t), () => playing);
  },

  /** Base-excited mass on spring: transmissibility vs frequency ratio. */
  "anim-isolation"(host) {
    const { ctl, svg, out } = frame(host, "防振支持と伝達率", 240);
    let r = 3, zeta = 0.1;
    let playing = !reduced();
    const T = (rr: number, z: number) => Math.sqrt(1 + (2 * z * rr) ** 2) / Math.sqrt((1 - rr * rr) ** 2 + (2 * z * rr) ** 2);
    const phase = (rr: number, z: number) => {
      // phase lag of mass relative to base
      const num = 2 * z * rr ** 3, den = 1 - rr * rr + (2 * z * rr) ** 2;
      return Math.atan2(num, den);
    };
    const info = () => {
      const t = T(r, zeta);
      out.innerHTML = `<p class="tb-res">振動数比 r = f/fn = <b>${r.toFixed(2)}</b>　伝達率 T = <b>${t.toFixed(2)}</b> (${t > 1 ? "増幅" : "防振"})</p><p class="tb-note">r &gt; √2 ≈ 1.41 で T &lt; 1。防振領域では減衰比 ζ を大きくすると伝達率はかえって上がります。共振 (r = 1) 付近では T ≈ 1/(2ζ)。</p>`;
    };
    slider(ctl, "振動数比 r", 0.2, 5, r, 0.05, (v) => ((r = v), info(), draw(tNow)));
    slider(ctl, "減衰比 ζ", 0.02, 0.5, zeta, 0.01, (v) => ((zeta = v), info(), draw(tNow)));
    playButton(ctl, () => playing, (v) => (playing = v));
    let tNow = 0.2;
    // chart area
    const cx0 = 230, cx1 = 505, cy0 = 210, cy1 = 25, rMax = 5, tMax = 6;
    const px = (rr: number) => cx0 + (rr / rMax) * (cx1 - cx0);
    const py = (t: number) => cy0 - (Math.min(t, tMax) / tMax) * (cy0 - cy1);
    const draw = (t: number) => {
      tNow = t;
      const w = 2 * Math.PI * 0.8 * t;
      const base = 10 * Math.sin(w);
      const tr = T(r, zeta);
      const mass = 10 * Math.min(tr, 4) * Math.sin(w - phase(r, zeta));
      // left: physical model
      const by = 200 + base, my = 80 + mass;
      let s = `<rect x="40" y="${by}" width="120" height="14" class="sec"/>`;
      s += `<text class="tick" x="100" y="234" text-anchor="middle">床 (加振)</text>`;
      s += `<path d="${spring(100, my + 40, by)}" fill="none" stroke="var(--tb-text-2)" stroke-width="2"/>`;
      s += `<rect x="60" y="${my}" width="80" height="40" fill="var(--tb-accent)" opacity="0.6" stroke="var(--tb-accent)"/>`;
      s += `<text class="lbl" x="100" y="${my + 25}" text-anchor="middle">m</text>`;
      // right: transmissibility chart
      s += `<line class="axis" x1="${cx0}" y1="${cy0}" x2="${cx1}" y2="${cy0}"/><line class="axis" x1="${cx0}" y1="${cy0}" x2="${cx0}" y2="${cy1}"/>`;
      s += `<line class="guide" x1="${cx0}" y1="${py(1)}" x2="${cx1}" y2="${py(1)}"/><line class="guide" x1="${px(Math.SQRT2)}" y1="${cy0}" x2="${px(Math.SQRT2)}" y2="${cy1}"/>`;
      s += `<text class="tick" x="${cx0 - 4}" y="${py(1) + 4}" text-anchor="end">1</text><text class="tick" x="${px(Math.SQRT2)}" y="${cy0 + 14}" text-anchor="middle">√2</text>`;
      s += `<text class="tick" x="${px(1)}" y="${cy0 + 14}" text-anchor="middle">1</text><text class="tick" x="${px(3)}" y="${cy0 + 14}" text-anchor="middle">3</text><text class="tick" x="${px(5)}" y="${cy0 + 14}" text-anchor="middle">5</text>`;
      let d = "";
      for (let k = 0; k <= 200; k++) {
        const rr = 0.01 + (k / 200) * (rMax - 0.01);
        d += `${k ? "L" : "M"}${px(rr).toFixed(1)},${py(T(rr, zeta)).toFixed(1)}`;
      }
      s += `<path d="${d}" fill="none" stroke="var(--tb-accent)" stroke-width="2.5"/>`;
      s += `<circle class="mark" cx="${px(r)}" cy="${py(tr)}" r="5"/>`;
      s += `<text class="lbl" x="${cx1}" y="${cy0 + 28}" text-anchor="end">r = f / fn</text><text class="lbl" x="${cx0 + 6}" y="${cy1 + 4}">伝達率 T</text>`;
      svg.innerHTML = s;
    };
    info();
    draw(0.2);
    loop(host, (t) => draw(t), () => playing);
  },

  /** Two springs in series vs parallel under the same load. */
  "anim-stiffness-series"(host) {
    const { ctl, svg, out } = frame(host, "ばねの直列と並列", 240);
    let k2 = 1;
    let playing = !reduced();
    const info = () => {
      const ks = 1 / (1 + 1 / k2), kp = 1 + k2;
      out.innerHTML = `<p class="tb-res">k₁ = 1、k₂ = ${k2}　→　直列 k = <b>${ks.toFixed(2)}</b>　並列 k = <b>${kp.toFixed(2)}</b></p><p class="tb-note">同じ力 F で引いたときの伸び δ = F/k。直列は弱いほうのばねより必ず柔らかくなり、並列は足し算で硬くなります。k₂ を大きくしても直列剛性は k₁ (= 1) を超えません。</p>`;
    };
    slider(ctl, "k₂ / k₁", 0.25, 4, k2, 0.25, (v) => ((k2 = v), info(), draw(tNow)));
    playButton(ctl, () => playing, (v) => (playing = v));
    let tNow = 1;
    const draw = (t: number) => {
      tNow = t;
      const load = 0.5 - 0.5 * Math.cos(Math.min(1, (t % 4) / 2) * Math.PI); // ramps 0→1, holds
      const F = load * 30; // px of stretch for k = 1
      const top = 40, L0 = 60;
      // series: two springs stacked
      const d1 = F / 1, d2 = F / k2;
      const xs = 130;
      let s = `<rect x="60" y="${top - 12}" width="400" height="12" class="sec"/>`;
      const y1 = top + L0 + d1;
      s += `<path d="${spring(xs, top, y1)}" fill="none" stroke="var(--tb-accent)" stroke-width="2"/>`;
      s += `<rect x="${xs - 14}" y="${y1}" width="28" height="8" fill="var(--tb-text-3)"/>`;
      const y2 = y1 + 8 + L0 + d2;
      s += `<path d="${spring(xs, y1 + 8, y2)}" fill="none" stroke="var(--tb-warn)" stroke-width="2"/>`;
      s += `<rect x="${xs - 22}" y="${y2}" width="44" height="18" class="sec"/>`;
      s += `<text class="tick" x="${xs + 18}" y="${(top + y1) / 2}">k₁</text><text class="tick" x="${xs + 18}" y="${(y1 + y2) / 2}">k₂</text>`;
      s += `<text class="lbl" x="${xs}" y="${y2 + 34}" text-anchor="middle">直列 δ = ${(d1 + d2).toFixed(0)}</text>`;
      // parallel: two springs side by side, rigid bar
      const xp = 360, dp = F / (1 + k2), yp = top + L0 + dp;
      s += `<path d="${spring(xp - 30, top, yp)}" fill="none" stroke="var(--tb-accent)" stroke-width="2"/>`;
      s += `<path d="${spring(xp + 30, top, yp)}" fill="none" stroke="var(--tb-warn)" stroke-width="2"/>`;
      s += `<rect x="${xp - 50}" y="${yp}" width="100" height="18" class="sec"/>`;
      s += `<text class="tick" x="${xp - 58}" y="${(top + yp) / 2}" text-anchor="end">k₁</text><text class="tick" x="${xp + 48}" y="${(top + yp) / 2}">k₂</text>`;
      s += `<text class="lbl" x="${xp}" y="${yp + 34}" text-anchor="middle">並列 δ = ${dp.toFixed(0)}</text>`;
      s += `<text class="mark-t" x="260" y="230" text-anchor="middle">同じ荷重 F (${(load * 100).toFixed(0)} %) — 伸びは相対値</text>`;
      svg.innerHTML = s;
    };
    info();
    draw(2);
    loop(host, (t) => draw(t), () => playing);
  },
};
