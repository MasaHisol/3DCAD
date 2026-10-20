// Animated figures for the 加工法と材料 chapters (process.ts).
// Same conventions as anim.ts: static first frame, stops when the host leaves the page, honours prefers-reduced-motion.
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

// ------------------------------------------------------------- helpers ---
const n1 = (v: number) => Math.round(v * 10) / 10;
const panel = (x: number, y: number, w: number, h: number) => `<rect class="k-panel" x="${x}" y="${y}" width="${w}" height="${h}" rx="8"/>`;
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

export const ANIM5: Record<string, (host: HTMLElement) => void> = {
  /** Lathe turning: feed per rev and nose radius set the scallop height Rz ≈ f²/(8r). */
  "anim-turning"(host) {
    const { ctl, svg, out } = frame(host, "旋削の送りと仕上げ面粗さ (Rz ≈ f² / 8r)", 280);
    let f = 0.2; // mm/rev
    let r = 0.8; // nose radius mm
    let playing = !reduced();
    let x = 0.6; // tool travel (0..1 of the shown length)
    const pb = button(ctl, playing ? "■ 止める" : "▶ 動かす", () => ((playing = !playing), (pb.textContent = playing ? "■ 止める" : "▶ 動かす")));
    slider(ctl, "送り f (mm/rev)", 0.05, 0.5, f, 0.01, (v) => ((f = v), draw()));
    select(ctl, [["0.4", "ノーズ R 0.4"], ["0.8", "ノーズ R 0.8"], ["1.2", "ノーズ R 1.2"]], "0.8", (v) => ((r = Number(v)), draw()));
    let spin = 0;
    const draw = () => {
      const rz = (f * f) / (8 * r) * 1000; // µm
      const ra = rz / 4; // theoretical Ra ≈ f²/(32r)
      // workpiece (side view), chuck at left
      const y0 = 42, y1 = 130, xL = 70, xR = 452, yc = (y0 + y1) / 2;
      let s = `<text class="mark-t" x="10" y="18">f = ${fmt(f, 2)} mm/rev、r = ${r} mm → Rz ≈ ${fmt(rz, 3)} µm、Ra ≈ ${fmt(ra, 2)} µm (理論値)</text>`;
      // chuck body and jaws
      s += `<g class="k-shadow"><rect class="k-part" x="14" y="${y0 - 14}" width="44" height="${y1 - y0 + 28}" rx="4"/>`;
      s += `<rect class="k-part" x="52" y="${y0 - 8}" width="18" height="16" rx="2"/><rect class="k-part" x="52" y="${y1 - 8}" width="18" height="16" rx="2"/></g>`;
      s += `<text class="tick" x="36" y="${y1 + 30}" text-anchor="middle">チャック</text>`;
      const cut = xR - x * (xR - xL); // tool position: moves from right to left
      // finished (smaller) diameter on the left, stock on the right
      s += `<g class="k-shadow"><rect class="k-part" x="${xL}" y="${y0 + 10}" width="${n1(cut - xL)}" height="${y1 - y0 - 20}"/>`;
      s += `<rect class="k-part" x="${n1(cut)}" y="${y0}" width="${n1(xR - cut)}" height="${y1 - y0}"/></g>`;
      // feed marks on the finished surface (fine helix lines)
      const pitch = Math.max(3, f * 18);
      for (let xx = cut - pitch; xx > xL + 2; xx -= pitch) s += `<line x1="${n1(xx)}" x2="${n1(xx - 4)}" y1="${y0 + 11}" y2="${y1 - 11}" class="k-thin" opacity="0.7"/>`;
      // rotation marks on the uncut stock
      for (let i = 0; i < 4; i++) {
        const ph = (spin + i / 4) % 1;
        const yy = y0 + 4 + (0.5 - 0.5 * Math.cos(ph * Math.PI)) * (y1 - y0 - 8);
        s += `<line x1="${n1(cut + 4)}" x2="${xR - 4}" y1="${n1(yy)}" y2="${n1(yy)}" class="k-thin" stroke-dasharray="2 6"/>`;
      }
      // tail-stock centre
      s += `<path class="k-part" d="M${xR},${yc} L${xR + 18},${yc - 12} L${xR + 52},${yc - 12} L${xR + 52},${yc + 12} L${xR + 18},${yc + 12} Z"/>`;
      s += `<line class="k-center" x1="40" x2="512" y1="${yc}" y2="${yc}"/>`;
      // rotation arrow
      s += `<path class="k-move" d="M${xR - 16},${y0 - 10} q14,-12 26,0"/><text class="tick" x="${xR + 16}" y="${y0 - 16}">回転</text>`;
      // tool: shank from below, insert tip touching the finished diameter
      const tipY = y1 - 10;
      s += `<g class="k-shadow"><rect class="k-part" x="${n1(cut - 8)}" y="${tipY + 22}" width="44" height="18" rx="2"/>`;
      s += `<path class="k-accent" d="M${n1(cut)},${tipY} L${n1(cut + 24)},${tipY + 24} L${n1(cut - 4)},${tipY + 24} Z"/></g>`;
      // chip curling off the tool
      if (x > 0.02 && x < 0.999) s += `<path d="M${n1(cut + 2)},${tipY - 2} q10,-14 22,-6 q8,8 -2,12" fill="none" style="stroke:var(--tb-warn)" stroke-width="2"/>`;
      const lr = cut < 340;
      s += `<line class="k-move" x1="${n1(cut + 62)}" x2="${n1(cut + 42)}" y1="${tipY + 31}" y2="${tipY + 31}"/>`;
      s += `<text class="tick" x="${n1(lr ? cut + 68 : cut - 14)}" y="${tipY + 35}" text-anchor="${lr ? "start" : "end"}">バイト (送り f)</text>`;
      // magnified profile of the finished surface
      const px0 = 70, pw = 380, py = 226, amp = Math.min(40, rz * 1.2 + 1);
      const scale = pw / 2.0; // 2 mm shown
      const yPk = py - amp / 2, yVl = py + amp / 2; // peak (cusp) and valley levels
      let d = "";
      for (let k = 0; k <= 400; k++) {
        const xm = (k / 400) * 2.0;
        const u = ((xm % f) + f) % f - f / 2; // position inside one scallop
        const h = (u * u) / (2 * r); // parabola approx of the nose circle (mm)
        const hn = h / ((f * f) / (8 * r)); // 0..1
        d += `${k ? " L" : "M"}${n1(px0 + xm * scale)},${n1(yVl - hn * amp)}`;
      }
      s += panel(6, 168, 508, 106) + `<text class="k-note" x="18" y="186">仕上げ面の断面 (高さ方向を拡大、幅 2 mm)</text>`;
      s += `<path class="k-cut" d="${d} L${px0 + pw},${py + 34} L${px0},${py + 34} Z"/>`;
      // Rz dimension at the right end
      s += `<line class="k-ext" x1="${px0 + pw + 2}" x2="${px0 + pw + 30}" y1="${n1(yPk)}" y2="${n1(yPk)}"/><line class="k-ext" x1="${px0 + pw + 2}" x2="${px0 + pw + 30}" y1="${n1(yVl)}" y2="${n1(yVl)}"/>`;
      if (amp > 10) s += `<line class="k-dimline" x1="${px0 + pw + 24}" x2="${px0 + pw + 24}" y1="${n1(yPk)}" y2="${n1(yVl)}"/>`;
      s += `<text class="k-dimtext" x="${px0 + pw + 34}" y="${n1(py + 4)}">Rz</text>`;
      // feed (pitch) dimension between two cusps
      const fx1 = px0 + f * scale, fx2 = px0 + 2 * f * scale;
      s += `<line class="k-ext" x1="${n1(fx1)}" x2="${n1(fx1)}" y1="${n1(yPk - 2)}" y2="${n1(yPk - 20)}"/><line class="k-ext" x1="${n1(fx2)}" x2="${n1(fx2)}" y1="${n1(yPk - 2)}" y2="${n1(yPk - 20)}"/>`;
      s += `<line class="k-dimline" x1="${n1(fx1)}" x2="${n1(fx2)}" y1="${n1(yPk - 14)}" y2="${n1(yPk - 14)}"/>`;
      s += `<text class="k-dimtext" x="${n1(fx2 + 6)}" y="${n1(yPk - 10)}">f</text>`;
      svg.innerHTML = s;
    };
    out.innerHTML = `<p class="tb-note">バイト先端の丸み (ノーズ R) が 1 回転ごとに f だけずれながら転写され、山形の削り残し (送りマーク) ができます。高さ Rz ≈ f²/(8r) は f の 2 乗に比例するので、送りを半分にすると粗さは 1/4 になります。実際の面は工具摩耗・構成刃先・びびりで理論値より 1.5〜3 倍ほど粗くなるのが普通です。</p>`;
    draw();
    loop(host, (_t, dt) => {
      spin = (spin + dt * 2) % 1;
      x += dt * 0.08;
      if (x > 1) x = 0.05;
      draw();
    }, () => playing);
  },

  /** Air bending with springback: elastic recovery depends on σy/E and R/t. */
  "anim-springback"(host) {
    const { ctl, svg, out } = frame(host, "曲げのスプリングバック", 260);
    const mats: Record<string, { name: string; sy: number; E: number }> = {
      spcc: { name: "SPCC (冷間圧延鋼板)", sy: 200, E: 206000 },
      sus: { name: "SUS304", sy: 300, E: 193000 },
      al: { name: "A5052-H32", sy: 195, E: 70000 },
      hts: { name: "高張力鋼板 980 MPa 級", sy: 650, E: 206000 },
    };
    let m = "spcc";
    let rt = 2; // R/t
    let p = 1; // animation phase: 0..1 load, 1..2 unload
    let playing = !reduced();
    select(ctl, Object.entries(mats).map(([k, v]) => [k, v.name] as [string, string]), m, (v) => ((m = v), (p = 0), draw()));
    slider(ctl, "内 R / 板厚", 1, 20, rt, 1, (v) => ((rt = v), draw()));
    button(ctl, "↻ もう一度", () => ((p = 0), (playing = !reduced()), draw(true)));
    const calc = () => {
      const t = 1, Ri = rt * t, mt = mats[m];
      const x = (Ri * mt.sy) / (mt.E * t);
      const ratio = 4 * x ** 3 - 3 * x + 1; // Ri / Rf
      const Rf = Ri / ratio;
      const thI = 90;
      const thF = (thI * (Ri + t / 2)) / (Rf + t / 2); // neutral-axis length conserved
      return { Rf, thF, sb: thI - thF };
    };
    const ease = (u: number) => {
      const v = Math.max(0, Math.min(1, u));
      return v * v * (3 - 2 * v);
    };
    const draw = (final = !playing) => {
      const { thF, sb } = calc();
      const phase = final ? 2 : p;
      const ang = phase <= 1 ? 90 * ease(phase) : 90 - sb * ease(phase - 1); // bend angle shown
      const cx = 196, cy = 196, L = 140;
      const a = (ang * Math.PI) / 180;
      let s = `<text class="mark-t" x="10" y="18">${mats[m].name}、R/t = ${rt}: 戻り ≈ ${fmt(sb, 2)}° → 除荷後 ${fmt(thF, 3)}°</text>`;
      // clamp (lower die + pressure pad) holding the fixed leg
      s += `<g class="k-shadow"><rect class="k-cut2" x="${cx - L - 6}" y="${cy + 4}" width="${L}" height="30"/>`;
      s += `<rect class="k-cut" x="${cx - L - 6}" y="${cy - 30}" width="${L - 30}" height="26"/></g>`;
      s += `<text class="tick" x="${cx - L + 2}" y="${cy + 50}">固定 (ダイ・押さえ)</text>`;
      // ghost of the 90° target
      s += `<line class="guide" x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy - L - 6}"/><text class="tick" x="${cx - 6}" y="${cy - L - 4}" text-anchor="end">狙い 90°</text>`;
      // sheet: dark outline + steel core, with a small bend radius
      const ex = cx + L * Math.cos(a), ey = cy - L * Math.sin(a);
      const sheet = `M${cx - L},${cy} L${cx},${cy} L${n1(ex)},${n1(ey)}`;
      s += `<g class="k-shadow"><path d="${sheet}" fill="none" style="stroke:var(--k-line)" stroke-width="8" stroke-linejoin="round"/>`;
      s += `<path d="${sheet}" fill="none" style="stroke:var(--k-steel-2)" stroke-width="5" stroke-linejoin="round"/></g>`;
      // springback arc
      if (phase > 1 && sb > 0.05) {
        const R0 = 108;
        s += `<path d="M${cx},${cy - R0} A${R0},${R0} 0 0 1 ${n1(cx + R0 * Math.cos(a))},${n1(cy - R0 * Math.sin(a))}" fill="none" style="stroke:var(--tb-bad)" stroke-width="2.4"/>`;
        s += `<text class="k-bad-t" x="${cx + 12}" y="${cy - R0 - 4}">戻り Δθ</text>`;
      }
      // punch (rotated wedge pressing on the inside of the bend)
      const punchY = phase <= 1 ? cy - 40 + 30 * ease(phase) : cy - 10 - 30 * ease(phase - 1);
      s += `<g class="k-shadow" transform="rotate(-45 ${cx} ${cy})"><path class="k-part" d="M${cx - 16},${n1(punchY - 64)} L${cx + 16},${n1(punchY - 64)} L${cx + 5},${n1(punchY - 3)} Q${cx},${n1(punchY + 1)} ${cx - 5},${n1(punchY - 3)} Z"/></g>`;
      // bar chart of all materials at this R/t
      const bx = 330;
      s += panel(bx - 8, 30, 192, 222) + `<text class="k-title" x="${bx + 4}" y="50">同じ R/t の戻り角</text>`;
      Object.entries(mats).forEach(([k, mt], i) => {
        const t = 1, Ri = rt;
        const x = (Ri * mt.sy) / (mt.E * t);
        const Rf = Ri / (4 * x ** 3 - 3 * x + 1);
        const v = 90 - (90 * (Ri + 0.5)) / (Rf + 0.5);
        const w = Math.max(2, Math.min(120, v * 6));
        const yy = 72 + i * 45;
        const on = k === m;
        s += `<text class="${on ? "mark-t" : "tick"}" x="${bx + 4}" y="${yy}">${mt.name.split(" ")[0]}</text>`;
        s += `<rect x="${bx + 4}" y="${yy + 6}" width="${n1(w)}" height="14" rx="3" style="fill:${on ? "var(--tb-warn)" : "var(--tb-text-3)"}" opacity="${on ? 1 : 0.55}"/>`;
        s += `<text class="${on ? "mark-t" : "tick"}" x="${n1(bx + 10 + w)}" y="${yy + 18}">${fmt(v, 2)}°</text>`;
      });
      svg.innerHTML = s;
    };
    out.innerHTML = `<p class="tb-note">曲げた板は、荷重を抜くと弾性ひずみの分だけ戻ります。戻り量は (降伏点 / ヤング率) × (R / t) が大きいほど大きく、アルミ (E が鋼の 1/3) や高張力鋼板 (降伏点が高い) で目立ちます。計算は弾完全塑性モデル Ri/Rf = 4x³ − 3x + 1、x = Ri·σy/(E·t) による目安で、実際は加工硬化や金型条件で変わります。現場では見込み曲げ (オーバーベンド) やボトミングで補正します。</p>`;
    draw(true);
    loop(host, (_t, dt) => {
      p += dt * 0.6;
      if (p > 2.6) p = 0;
      draw();
    }, () => playing);
  },

  /** Ashby-style chart: Young's modulus vs density on log axes with a performance-index guide line. */
  "anim-ashby"(host) {
    const { ctl, svg, out } = frame(host, "材料選択チャート (ヤング率 E – 密度 ρ)", 320);
    // [name, density g/cm³, E GPa, class]
    const M: [string, number, number, string][] = [
      ["鋼", 7.85, 206, "metal"], ["SUS304", 7.93, 193, "metal"], ["鋳鉄 FC250", 7.2, 110, "metal"], ["黄銅", 8.5, 100, "metal"],
      ["アルミ合金", 2.7, 70, "metal"], ["マグネシウム合金", 1.8, 45, "metal"], ["チタン合金", 4.43, 114, "metal"],
      ["CFRP (擬似等方)", 1.6, 60, "comp"], ["CFRP (一方向)", 1.6, 140, "comp"], ["GFRP", 1.9, 20, "comp"],
      ["POM", 1.41, 2.9, "poly"], ["PA6", 1.13, 2.5, "poly"], ["PC", 1.2, 2.3, "poly"], ["ABS", 1.05, 2.2, "poly"], ["PP", 0.9, 1.4, "poly"],
      ["木材 (繊維方向)", 0.5, 11, "nat"], ["アルミナ", 3.9, 370, "cer"], ["ガラス", 2.5, 70, "cer"],
    ];
    // hand-placed label positions [x, y, anchor] so that no two labels overlap; a leader line is drawn when the label is away from its point
    const LBL: [number, number, "start" | "middle" | "end"][] = [
      [440, 66, "start"], [440, 84, "start"], [440, 124, "start"], [440, 104, "start"],
      [302, 128, "start"], [242, 140, "end"], [342, 86, "middle"],
      [226, 116, "end"], [226, 88, "end"], [262, 152, "start"],
      [232, 204, "start"], [190, 199, "end"], [216, 228, "start"], [182, 220, "end"], [166, 234, "end"],
      [122, 162, "start"], [338, 58, "start"], [282, 98, "middle"],
    ];
    const col: Record<string, string> = { metal: "var(--tb-accent)", comp: "var(--tb-good)", poly: "var(--tb-warn)", nat: "var(--tb-text-2)", cer: "var(--tb-bad)" };
    const clsName: [string, string][] = [["metal", "金属"], ["comp", "複合材"], ["poly", "樹脂"], ["nat", "天然材"], ["cer", "セラミックス"]];
    let idx = 2; // exponent n in E^(1/n)/ρ
    let off = 0;
    let playing = !reduced();
    let pick = -1;
    select(ctl, [["1", "引張棒: E/ρ"], ["2", "曲げはり: E^½/ρ"], ["3", "曲げ板: E^⅓/ρ"]], "2", (v) => ((idx = Number(v)), draw()));
    const pb = button(ctl, playing ? "■ 止める" : "▶ 線を動かす", () => ((playing = !playing), (pb.textContent = playing ? "■ 止める" : "▶ 線を動かす")));
    const X = (rho: number) => 60 + ((Math.log10(rho) - Math.log10(0.3)) / (Math.log10(20) - Math.log10(0.3))) * 440;
    const Y = (E: number) => 260 - ((Math.log10(E) - Math.log10(0.5)) / (Math.log10(1000) - Math.log10(0.5))) * 230;
    const clipId = `tbash${Math.random().toString(36).slice(2, 8)}`;
    const draw = () => {
      let s = `<defs><clipPath id="${clipId}"><rect x="60" y="30" width="440" height="230"/></clipPath></defs>`;
      for (const r of [0.5, 1, 2, 5, 10]) s += `<line class="grid" x1="${n1(X(r))}" x2="${n1(X(r))}" y1="30" y2="260"/><text class="tick" x="${n1(X(r))}" y="274" text-anchor="middle">${r}</text>`;
      for (const e of [1, 10, 100, 1000]) s += `<line class="grid" x1="60" x2="500" y1="${n1(Y(e))}" y2="${n1(Y(e))}"/><text class="tick" x="54" y="${n1(Y(e) + 4)}" text-anchor="end">${e}</text>`;
      s += `<line class="axis" x1="60" x2="500" y1="260" y2="260"/><line class="axis" x1="60" x2="60" y1="30" y2="260"/>`;
      s += `<text class="lbl" x="500" y="290" text-anchor="end">密度 ρ (g/cm³, 対数)</text><text class="lbl" x="64" y="22">E (GPa, 対数)</text>`;
      // guide line E = C·ρ^n  → slope n on log-log; the region above it is tinted
      const C = Math.pow(10, -1 + off * 3);
      const p1 = 0.3, p2 = 20;
      const ax = X(p1), ay = Y(C * p1 ** idx), bx = X(p2), by = Y(C * p2 ** idx);
      s += `<g clip-path="url(#${clipId})"><path d="M${n1(ax)},${n1(ay)} L${n1(bx)},${n1(by)} L${n1(bx)},-2000 L${n1(ax)},-2000 Z" style="fill:var(--tb-good)" opacity="0.07"/>`;
      s += `<line x1="${n1(ax)}" y1="${n1(ay)}" x2="${n1(bx)}" y2="${n1(by)}" style="stroke:var(--tb-warn)" stroke-width="2.2" stroke-dasharray="7 4"/></g>`;
      const score = (rho: number, E: number) => Math.pow(E, 1 / idx) / rho;
      const ranked = M.map((m, i) => ({ i, v: score(m[1], m[2]) })).sort((a, b) => b.v - a.v);
      // points first, then leaders and labels (with a halo so grid lines do not cut them)
      let pts = "", labs = "";
      M.forEach(([n, rho, E, c], i) => {
        const above = E > C * rho ** idx;
        const px = X(rho), py = Y(E);
        const [lx, ly, an] = LBL[i];
        pts += `<circle data-i="${i}" cx="${n1(px)}" cy="${n1(py)}" r="${i === pick ? 7 : 5}" style="fill:${col[c]};stroke:var(--tb-surface);cursor:pointer" stroke-width="1.2" opacity="${above ? 1 : 0.4}"/>`;
        if (i === pick) pts += `<circle cx="${n1(px)}" cy="${n1(py)}" r="11" fill="none" style="stroke:${col[c]}" stroke-width="1.5"/>`;
        const tx = an === "start" ? lx - 3 : an === "end" ? lx + 3 : lx;
        const ty = an === "middle" ? ly + 3 : ly - 4;
        if (Math.hypot(tx - px, ty - py) > 13) labs += `<line class="k-thin" x1="${n1(px)}" y1="${n1(py)}" x2="${tx}" y2="${ty}" opacity="${above ? 1 : 0.5}"/>`;
        labs += `<text class="tick" x="${lx}" y="${ly}" text-anchor="${an}" style="stroke:var(--tb-surface);stroke-width:3px;${i === pick ? "fill:var(--tb-text);font-weight:700;" : ""}" opacity="${above ? 1 : 0.55}">${n}</text>`;
      });
      s += labs + pts;
      // class legend (direct swatches under the axis title)
      let lx = 60;
      for (const [k, t] of clsName) {
        s += `<circle cx="${lx + 5}" cy="308" r="5" style="fill:${col[k]}"/><text class="tick" x="${lx + 14}" y="312">${t}</text>`;
        lx += 24 + t.length * 11;
      }
      s += `<line x1="${lx + 6}" x2="${lx + 30}" y1="308" y2="308" style="stroke:var(--tb-warn)" stroke-width="2.2" stroke-dasharray="7 4"/><text class="tick" x="${lx + 36}" y="312">指標が等しい線</text>`;
      svg.innerHTML = s;
      const lab = idx === 1 ? "E/ρ" : idx === 2 ? "E^½/ρ" : "E^⅓/ρ";
      const top = ranked.slice(0, 4).map((r) => `${M[r.i][0]} (${fmt(r.v, 3)})`).join("、");
      const sel = pick >= 0 ? `<tr><th>選択中</th><td>${M[pick][0]}: ρ = ${M[pick][1]} g/cm³、E = ${M[pick][2]} GPa、${lab} = ${fmt(score(M[pick][1], M[pick][2]), 3)}</td></tr>` : "";
      out.innerHTML = `<table class="tb-res"><tr><th>指標 ${lab} の上位</th><td>${top}</td></tr>${sel}</table><p class="tb-note">破線は傾き ${idx} の「指標が等しい線」。線より左上の材料ほど、同じ剛性をより軽く実現できます。点をクリックすると値が出ます。軽くたわみにくい「はり」では E^½/ρ、「板」では E^⅓/ρ で比べるので、密度の小さい材料ほど有利になります。</p>`;
    };
    svg.addEventListener("click", (e) => {
      const b = svg.getBoundingClientRect();
      if (!b.width) return;
      const { x: mx, y: my } = svgPoint(svg, e, 520, 320);
      let best = -1, bd = 14 * 14;
      M.forEach(([, rho, E], i) => {
        const d = (X(rho) - mx) ** 2 + (Y(E) - my) ** 2;
        if (d < bd) ((bd = d), (best = i));
      });
      pick = best;
      draw();
    });
    draw();
    loop(host, (_t, dt) => ((off = (off + dt * 0.08) % 1), draw()), () => playing);
  },
};
