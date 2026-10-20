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

// ------------------------------------------------------------- helpers ---
const n1 = (v: number) => Math.round(v * 10) / 10;
const panel = (x: number, y: number, w: number, h: number) => `<rect class="k-panel" x="${x}" y="${y}" width="${w}" height="${h}" rx="8"/>`;
const badge = (x: number, y: number, t: string, col = "var(--tb-accent)") =>
  `<circle class="k-badge" cx="${x}" cy="${y}" r="10" style="fill:${col}"/><text class="k-badge-t" x="${x}" y="${y + 4}" text-anchor="middle">${t}</text>`;

/** Coil spring (zig-zag with straight leads) from (x, y1) to (x, y2). */
function spring(x: number, y1: number, y2: number, w = 10, n = 6) {
  const lead = 6;
  const a = y1 + lead, b = y2 - lead, seg = (b - a) / (n * 2);
  let d = `M${x},${n1(y1)} L${x},${n1(a)}`;
  for (let i = 0; i < n * 2; i++) d += ` L${x + (i % 2 ? -w : w)},${n1(a + seg * (i + 0.5))}`;
  d += ` L${x},${n1(b)} L${x},${n1(y2)}`;
  return d;
}
/** Spring drawn with a dark outline and a coloured core so it reads as wire. */
const springWire = (x: number, y1: number, y2: number, col: string, w = 10, n = 6) =>
  `<path d="${spring(x, y1, y2, w, n)}" fill="none" style="stroke:var(--k-line)" stroke-width="4.2" stroke-linejoin="round"/>` +
  `<path d="${spring(x, y1, y2, w, n)}" fill="none" style="stroke:${col}" stroke-width="2.2" stroke-linejoin="round"/>`;
/** Hydraulic damper (dashpot): cylinder fixed at the bottom (yb), rod from the top (yt). */
function dashpot(x: number, yt: number, yb: number) {
  const cylTop = yb - 34;
  const pist = Math.max(cylTop + 6, Math.min(yb - 8, yt + 30));
  let s = `<rect class="k-part-h" x="${x - 9}" y="${n1(cylTop)}" width="18" height="${n1(yb - cylTop)}" rx="2"/>`;
  s += `<line x1="${x}" y1="${n1(yt)}" x2="${x}" y2="${n1(pist)}" style="stroke:var(--k-line)" stroke-width="2.4"/>`;
  s += `<rect x="${x - 7}" y="${n1(pist - 2)}" width="14" height="4" style="fill:var(--k-line)"/>`;
  return s;
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
    const { ctl, svg, out } = frame(host, "片持ちはりの固有モード", 240);
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
    const x0 = 78, len = 400, y0 = 122, A = 62;
    const draw = (t: number) => {
      const amp = A * Math.sin(2 * Math.PI * t * (0.6 + mode * 0.25));
      const tipVal = Math.abs(modeShape(mode, 1));
      const yAt = (x: number, a: number) => y0 - (a * modeShape(mode, x)) / tipVal;
      // header
      const ratio = [1, 6.27, 17.55][mode];
      let s = badge(18, 20, String(mode + 1)) + `<text class="k-title" x="34" y="25">${mode + 1} 次モード</text>`;
      s += `<text class="mark-t" x="508" y="25" text-anchor="end">f = ${ratio} × f₁</text>`;
      // envelope band (± amplitude)
      let up = "", dn = "";
      for (let k = 0; k <= 80; k++) {
        const x = k / 80;
        up += `${k ? "L" : "M"}${n1(x0 + x * len)},${n1(yAt(x, A))}`;
        dn = `L${n1(x0 + x * len)},${n1(yAt(x, -A))}` + dn;
      }
      s += `<path d="${up} ${dn} Z" style="fill:var(--tb-accent)" opacity="0.08"/>`;
      s += `<path d="${up}" class="k-hidden"/><path d="${dn.replace(/^L/, "M")}" class="k-hidden"/>`;
      s += `<line class="k-center" x1="${x0 - 6}" y1="${y0}" x2="${x0 + len + 14}" y2="${y0}"/>`;
      // wall (fixed end)
      s += `<rect class="k-ground" x="${x0 - 30}" y="${y0 - 80}" width="22" height="160"/>`;
      s += `<g class="k-shadow"><rect class="k-cut" x="${x0 - 10}" y="${y0 - 70}" width="10" height="140"/></g>`;
      // beam: dark outline + steel core
      let d = "";
      for (let k = 0; k <= 80; k++) {
        const x = k / 80;
        d += `${k ? "L" : "M"}${n1(x0 + x * len)},${n1(yAt(x, amp))}`;
      }
      s += `<g class="k-shadow"><path d="${d}" fill="none" style="stroke:var(--k-line)" stroke-width="9"/>`;
      s += `<path d="${d}" fill="none" style="stroke:var(--k-steel-2)" stroke-width="6"/></g>`;
      s += `<path d="${d}" fill="none" style="stroke:var(--k-steel-1)" stroke-width="1.6" transform="translate(0 -1.4)"/>`;
      // nodes
      for (let k = 1; k < 400; k++) {
        const a = modeShape(mode, k / 400), b = modeShape(mode, (k + 1) / 400);
        if (a * b < 0) {
          const xn = x0 + ((k + 0.5) / 400) * len;
          s += `<circle cx="${n1(xn)}" cy="${y0}" r="5.5" class="mark" style="stroke:var(--tb-surface)" stroke-width="1.5"/>`;
          s += `<line class="k-thin" x1="${n1(xn)}" y1="${y0 + 8}" x2="${n1(xn)}" y2="${y0 + 84}"/>`;
          s += `<text class="mark-t" x="${n1(xn)}" y="${y0 + 98}" text-anchor="middle">節 ${((k + 0.5) / 400).toFixed(2)}L</text>`;
        }
      }
      // tip amplitude marker
      const ty = yAt(1, amp);
      s += `<circle cx="${x0 + len}" cy="${n1(ty)}" r="4" style="fill:var(--tb-accent)"/>`;
      s += `<text class="tick" x="${x0 + len + 8}" y="${y0 - A - 4}" text-anchor="end">先端 (腹)</text>`;
      s += `<text class="tick" x="${x0 - 19}" y="${y0 + 98}" text-anchor="middle">固定端</text>`;
      svg.innerHTML = s;
    };
    setMode(0);
    loop(host, (t) => draw(t), () => playing);
  },

  /** Base-excited mass on spring: transmissibility vs frequency ratio. */
  "anim-isolation"(host) {
    const { ctl, svg, out } = frame(host, "防振支持と伝達率", 260);
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
    const cx0 = 252, cx1 = 506, cy0 = 214, cy1 = 34, rMax = 5, tMax = 6;
    const px = (rr: number) => cx0 + (rr / rMax) * (cx1 - cx0);
    const py = (t: number) => cy0 - (Math.min(t, tMax) / tMax) * (cy0 - cy1);
    const draw = (t: number) => {
      tNow = t;
      const w = 2 * Math.PI * 0.8 * t;
      const base = 8 * Math.sin(w);
      const tr = T(r, zeta);
      const mass = 8 * Math.min(tr, 4) * Math.sin(w - phase(r, zeta));
      // left: physical model on a panel
      let s = panel(6, 6, 226, 248);
      s += `<text class="k-title" x="18" y="26">モデル</text>`;
      const by = 196 + base, my = 82 + mass;
      // floor (shaker) block and ground
      s += `<rect class="k-ground" x="24" y="${n1(by + 16)}" width="160" height="10"/>`;
      s += `<g class="k-shadow"><rect class="k-part" x="30" y="${n1(by)}" width="150" height="16" rx="2"/></g>`;
      s += `<text class="tick" x="105" y="246" text-anchor="middle">床 (加振)</text>`;
      // spring + damper between floor and mass
      s += springWire(80, my + 40, by, "var(--tb-accent)", 11, 6);
      s += dashpot(132, my + 40, by);
      s += `<text class="tick" x="62" y="${n1((my + 40 + by) / 2 + 4)}" text-anchor="end">k</text>`;
      s += `<text class="tick" x="148" y="${n1((my + 40 + by) / 2 + 4)}">c</text>`;
      // mass
      s += `<g class="k-shadow"><rect class="k-part" x="50" y="${n1(my)}" width="110" height="40" rx="3"/></g>`;
      s += `<text class="mark-t" x="105" y="${n1(my + 25)}" text-anchor="middle">m</text>`;
      // amplitude bars (right of the model): base vs mass
      const ab = 8, am = 8 * Math.min(tr, 4);
      s += `<line x1="200" x2="200" y1="${196 - ab}" y2="${196 + ab}" style="stroke:var(--tb-text-3)" stroke-width="3"/>`;
      s += `<line x1="200" x2="200" y1="${n1(82 + 20 - am)}" y2="${n1(82 + 20 + am)}" style="stroke:${tr > 1 ? "var(--tb-bad)" : "var(--tb-good)"}" stroke-width="3"/>`;
      s += `<text class="tick" x="200" y="44" text-anchor="middle">振幅</text>`;
      s += `<text class="tick" x="207" y="${n1(82 + 24)}">m</text><text class="tick" x="207" y="200">床</text>`;
      // right: transmissibility chart with region tints
      const xs = px(Math.SQRT2);
      s += `<rect x="${cx0}" y="${cy1}" width="${n1(xs - cx0)}" height="${cy0 - cy1}" style="fill:var(--tb-bad)" opacity="0.07"/>`;
      s += `<rect x="${n1(xs)}" y="${cy1}" width="${n1(cx1 - xs)}" height="${cy0 - cy1}" style="fill:var(--tb-good)" opacity="0.08"/>`;
      s += `<text class="k-bad-t" x="${n1((cx0 + xs) / 2)}" y="${cy1 + 16}" text-anchor="middle">増幅</text>`;
      s += `<text class="k-good-t" x="${n1((xs + cx1) / 2 + 20)}" y="${cy1 + 16}" text-anchor="middle">防振領域 (T &lt; 1)</text>`;
      for (const tv of [2, 4, 6]) s += `<line class="grid" x1="${cx0}" y1="${py(tv)}" x2="${cx1}" y2="${py(tv)}"/><text class="tick" x="${cx0 - 4}" y="${py(tv) + 4}" text-anchor="end">${tv}</text>`;
      s += `<line class="axis" x1="${cx0}" y1="${cy0}" x2="${cx1}" y2="${cy0}"/><line class="axis" x1="${cx0}" y1="${cy0}" x2="${cx0}" y2="${cy1}"/>`;
      s += `<line class="guide" x1="${cx0}" y1="${py(1)}" x2="${cx1}" y2="${py(1)}"/><line class="guide" x1="${n1(xs)}" y1="${cy0}" x2="${n1(xs)}" y2="${cy1}"/>`;
      s += `<text class="tick" x="${cx0 - 4}" y="${py(1) + 4}" text-anchor="end">1</text><text class="tick" x="${n1(xs)}" y="${cy0 + 14}" text-anchor="middle">√2</text>`;
      s += `<text class="tick" x="${px(1) - 4}" y="${cy0 + 14}" text-anchor="end">1</text><text class="tick" x="${px(3)}" y="${cy0 + 14}" text-anchor="middle">3</text><text class="tick" x="${px(5)}" y="${cy0 + 14}" text-anchor="middle">5</text>`;
      let d = "";
      for (let k = 0; k <= 200; k++) {
        const rr = 0.01 + (k / 200) * (rMax - 0.01);
        d += `${k ? "L" : "M"}${px(rr).toFixed(1)},${py(T(rr, zeta)).toFixed(1)}`;
      }
      s += `<path d="${d}" fill="none" style="stroke:var(--tb-accent)" stroke-width="2.6"/>`;
      const mx = px(r), myy = py(tr);
      s += `<line class="k-thin" x1="${n1(mx)}" x2="${n1(mx)}" y1="${n1(myy)}" y2="${cy0}"/>`;
      s += `<circle class="k-glow" cx="${n1(mx)}" cy="${n1(myy)}" r="5.5" style="fill:${tr > 1 ? "var(--tb-bad)" : "var(--tb-good)"}"/>`;
      const lx = mx > cx1 - 70 ? mx - 8 : mx + 8;
      s += `<text class="mark-t" x="${n1(lx)}" y="${n1(Math.max(cy1 + 34, myy - 8))}" text-anchor="${mx > cx1 - 70 ? "end" : "start"}">T = ${tr.toFixed(2)}</text>`;
      s += `<text class="lbl" x="${cx1}" y="${cy0 + 32}" text-anchor="end">r = f / fn</text><text class="lbl" x="${cx0}" y="${cy1 - 8}">伝達率 T</text>`;
      svg.innerHTML = s;
    };
    info();
    draw(0.2);
    loop(host, (t) => draw(t), () => playing);
  },

  /** Two springs in series vs parallel under the same load. */
  "anim-stiffness-series"(host) {
    const { ctl, svg, out } = frame(host, "ばねの直列と並列", 300);
    let k2 = 1;
    let playing = !reduced();
    const info = () => {
      const ks = 1 / (1 + 1 / k2), kp = 1 + k2;
      out.innerHTML = `<p class="tb-res">k₁ = 1、k₂ = ${k2}　→　直列 k = <b>${ks.toFixed(2)}</b>　並列 k = <b>${kp.toFixed(2)}</b></p><p class="tb-note">同じ力 F で引いたときの伸び δ = F/k。直列は弱いほうのばねより必ず柔らかくなり、並列は足し算で硬くなります。k₂ を大きくしても直列剛性は k₁ (= 1) を超えません。</p>`;
    };
    slider(ctl, "k₂ / k₁", 0.25, 4, k2, 0.25, (v) => ((k2 = v), info(), draw(tNow)));
    playButton(ctl, () => playing, (v) => (playing = v));
    let tNow = 1;
    const C1 = "var(--tb-accent)", C2 = "var(--tb-warn)";
    const draw = (t: number) => {
      tNow = t;
      const load = 0.5 - 0.5 * Math.cos(Math.min(1, (t % 4) / 2) * Math.PI); // ramps 0→1 (ease-in-out), holds
      const F = load * 18; // px of stretch for k = 1
      const top = 44, L0 = 40;
      let s = panel(6, 6, 250, 272) + panel(264, 6, 250, 272);
      s += `<text class="k-title" x="20" y="26">直列</text><text class="k-title" x="278" y="26">並列</text>`;
      // ceilings
      for (const [x, w] of [[46, 170], [304, 170]]) {
        s += `<rect class="k-ground" x="${x}" y="${top - 10}" width="${w}" height="10"/><line class="k-edge" x1="${x}" x2="${x + w}" y1="${top}" y2="${top}"/>`;
      }
      // series: two springs stacked
      const d1 = F / 1, d2 = F / k2;
      const xs = 120;
      const y1 = top + L0 + d1;
      s += springWire(xs, top, y1, C1, 11, 5);
      s += `<g class="k-shadow"><rect class="k-part" x="${xs - 16}" y="${n1(y1)}" width="32" height="9" rx="2"/></g>`;
      const y2 = y1 + 9 + L0 + d2;
      s += springWire(xs, y1 + 9, y2, C2, 11, 5);
      s += `<g class="k-shadow"><rect class="k-part" x="${xs - 26}" y="${n1(y2)}" width="52" height="20" rx="3"/></g>`;
      s += `<text class="lbl" x="${xs + 20}" y="${n1((top + y1) / 2 + 4)}" style="fill:${C1}">k₁</text><text class="lbl" x="${xs + 20}" y="${n1((y1 + y2) / 2 + 4)}" style="fill:${C2}">k₂</text>`;
      s += `<line class="k-force" x1="${xs}" y1="${n1(y2 + 22)}" x2="${xs}" y2="${n1(y2 + 22 + 8 + 12 * load)}"/>`;
      s += `<text class="k-bad-t" x="${xs + 10}" y="${n1(y2 + 40)}">F</text>`;
      // stretch dimension: unloaded bottom vs loaded bottom
      const ys0 = top + 2 * L0 + 9;
      s += `<line class="k-ext" x1="${xs + 30}" x2="${xs + 74}" y1="${ys0}" y2="${ys0}"/><line class="k-ext" x1="${xs + 30}" x2="${xs + 74}" y1="${n1(y2)}" y2="${n1(y2)}"/>`;
      if (y2 - ys0 > 6) s += `<line class="k-dimline" x1="${xs + 66}" x2="${xs + 66}" y1="${ys0}" y2="${n1(y2)}"/>`;
      s += `<text class="k-dimtext" x="${xs + 78}" y="${n1((ys0 + y2) / 2 + 4)}">δ = ${(d1 + d2).toFixed(0)}</text>`;
      // parallel: two springs side by side, rigid bar
      const xp = 380, dp = F / (1 + k2), yp = top + L0 * 2 + 9 + dp;
      s += springWire(xp - 32, top, yp, C1, 11, 9);
      s += springWire(xp + 32, top, yp, C2, 11, 9);
      s += `<g class="k-shadow"><rect class="k-part" x="${xp - 56}" y="${n1(yp)}" width="112" height="20" rx="3"/></g>`;
      s += `<text class="lbl" x="${xp - 50}" y="${n1((top + yp) / 2 + 4)}" text-anchor="end" style="fill:${C1}">k₁</text><text class="lbl" x="${xp + 50}" y="${n1((top + yp) / 2 + 4)}" style="fill:${C2}">k₂</text>`;
      s += `<line class="k-force" x1="${xp}" y1="${n1(yp + 22)}" x2="${xp}" y2="${n1(yp + 22 + 8 + 12 * load)}"/>`;
      s += `<text class="k-bad-t" x="${xp + 10}" y="${n1(yp + 40)}">F</text>`;
      const yq0 = top + 2 * L0 + 9;
      s += `<line class="k-ext" x1="${xp + 60}" x2="${xp + 96}" y1="${yq0}" y2="${yq0}"/><line class="k-ext" x1="${xp + 60}" x2="${xp + 96}" y1="${n1(yp)}" y2="${n1(yp)}"/>`;
      if (yp - yq0 > 6) s += `<line class="k-dimline" x1="${xp + 88}" x2="${xp + 88}" y1="${yq0}" y2="${n1(yp)}"/>`;
      s += `<text class="k-dimtext" x="${xp + 74}" y="${n1(yq0 - 6)}">δ = ${dp.toFixed(0)}</text>`;
      s += `<text class="k-note" x="260" y="294" text-anchor="middle">同じ荷重 F (${(load * 100).toFixed(0)} %) — 伸びは相対値</text>`;
      svg.innerHTML = s;
    };
    info();
    draw(2);
    loop(host, (t) => draw(t), () => playing);
  },
};
