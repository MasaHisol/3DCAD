// Animated figures for the drafting chapters (<div data-widget="anim-...">).
// Same conventions as anim.ts: static first frame, stops when the host leaves
// the page, and respects prefers-reduced-motion.

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

const THICK = `stroke="var(--tb-text)" stroke-width="2.4" fill="none"`;
const THIN = `stroke="var(--tb-text-2)" stroke-width="1" fill="none"`;
const HID = `stroke="var(--tb-text-2)" stroke-width="1" stroke-dasharray="5 3" fill="none"`;
const CEN = `stroke="var(--tb-accent)" stroke-width="0.9" stroke-dasharray="12 3 2 3" fill="none"`;

let uid = 0;

// ------------------------------------------------------------- figures ---

export const ANIM4: Record<string, (host: HTMLElement) => void> = {
  /** Glass-box unfolding: front, top and right-side views in first / third angle. */
  "anim-projection"(host) {
    const { ctl, svg, out } = frame(host, "投影図の展開 — 第三角法と第一角法", 300);
    let mode: "3" | "1" = "3";
    let playing = !reduced();
    let t0 = performance.now() / 1000;
    select(ctl, [["3", "第三角法 (JIS の原則)"], ["1", "第一角法"]], "3", (v) => ((mode = v as "3" | "1"), (t0 = performance.now() / 1000), render(playing ? 0 : 1)));
    const pb = button(ctl, playing ? "■ 止める" : "▶ 動かす", () => {
      playing = !playing;
      pb.textContent = playing ? "■ 止める" : "▶ 動かす";
      if (!playing) render(1);
      t0 = performance.now() / 1000;
    });
    // object: W=100 (x), D=50 (y, 0 = side facing the viewer), H=60 (z)
    const W = 100, D = 50, FX = 210, FY = 190, GAP = 22;
    const line = (a: number[], b: number[], st: string) => `<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" ${st}/>`;
    const render = (t: number) => {
      const e = t < 1 ? 1 - (1 - t) ** 3 : 1; // ease out
      let s = "";
      // front view (fixed)
      const F = (x: number, z: number) => [FX + x, FY - z];
      s += `<path d="M${F(0, 0)} L${F(100, 0)} L${F(100, 25)} L${F(50, 25)} L${F(50, 60)} L${F(0, 60)} Z" ${THICK}/>`;
      s += line(F(67, 0), F(67, 25), HID) + line(F(83, 0), F(83, 25), HID) + line(F(75, -6), F(75, 31), CEN);
      s += `<text class="lbl" x="${FX + 50}" y="${FY + 18}" text-anchor="middle">正面図</text>`;
      // top view: depth coordinate measured from the hinge with the front view
      const adj = (y: number) => (mode === "3" ? y : D - y); // third angle: the face toward the viewer is adjacent
      const T = (x: number, y: number) => (mode === "3" ? [FX + x, FY - 60 - GAP * e - adj(y) * e] : [FX + x, FY + GAP * e + 8 + adj(y) * e]);
      s += `<path d="M${T(0, 0)} L${T(W, 0)} L${T(W, D)} L${T(0, D)} Z" ${THICK}/>`;
      s += line(T(50, 0), T(50, D), THICK);
      if (e > 0.3) {
        const c = T(75, 25);
        s += `<ellipse cx="${c[0]}" cy="${c[1]}" rx="8" ry="${(8 * e).toFixed(1)}" ${THICK}/>`;
        s += line(T(65, 25), T(85, 25), CEN) + line(T(75, 15), T(75, 35), CEN);
      }
      const tl = mode === "3" ? T(50, D)[1] - 6 : T(50, D)[1] + 16;
      s += `<text class="lbl" x="${FX + 50}" y="${tl.toFixed(1)}" text-anchor="middle">平面図</text>`;
      // right-side view (seen from +x)
      const R = (y: number, z: number) => (mode === "3" ? [FX + W + GAP * e + adj(y) * e, FY - z] : [FX - GAP * e - adj(y) * e, FY - z]);
      s += `<path d="M${R(0, 0)} L${R(D, 0)} L${R(D, 60)} L${R(0, 60)} Z" ${THICK}/>`;
      s += line(R(0, 25), R(D, 25), THICK);
      s += line(R(17, 0), R(17, 25), HID) + line(R(33, 0), R(33, 25), HID) + line(R(25, -6), R(25, 31), CEN);
      const rx = (R(0, 0)[0] + R(D, 0)[0]) / 2;
      s += `<text class="lbl" x="${rx.toFixed(1)}" y="${FY + 18}" text-anchor="middle">右側面図</text>`;
      // hinge lines while unfolding
      if (e < 1) {
        s += mode === "3" ? line([FX - 20, FY - 60 - GAP * e], [FX + 130, FY - 60 - GAP * e], `class="guide"`) : line([FX - 20, FY + GAP * e + 8], [FX + 130, FY + GAP * e + 8], `class="guide"`);
      }
      // projection symbol
      const sx = 440, sy = 40;
      const cone = `<path d="M0,-9 L18,-14 L18,14 L0,9 Z" ${THIN}/>`;
      const circ = `<circle r="14" ${THIN}/><circle r="9" ${THIN}/>`;
      s += mode === "3"
        ? `<g transform="translate(${sx - 30},${sy})">${cone}</g><g transform="translate(${sx + 25},${sy})">${circ}</g>`
        : `<g transform="translate(${sx - 25},${sy})">${circ}</g><g transform="translate(${sx + 2},${sy})">${cone}</g>`;
      s += `<text class="tick" x="${sx}" y="${sy + 30}" text-anchor="middle">${mode === "3" ? "第三角法の記号" : "第一角法の記号"}</text>`;
      svg.innerHTML = s;
    };
    out.innerHTML = `<p class="tb-note">第三角法は「見た側に置く」(上から見た図を上、右から見た図を右)。第一角法は逆に、平面図が下、右側面図が左に来ます。どちらの場合も、正面図の高さ・幅とは投影線でそろいます。第三角法では各図の<b>手前側の面が正面図に隣接</b>し、第一角法では奥側の面が隣接することに注目してください。</p>`;
    render(1); // static first frame: fully unfolded
    loop(host, (now) => {
      const p = ((now - t0) % 5) / 3; // 3 s unfold, 2 s hold
      render(Math.min(1, p));
    }, () => playing);
  },

  /** Step-by-step build-up of the JIS thread drawing convention. */
  "anim-threaddraw"(host) {
    const { ctl, svg, out } = frame(host, "ねじの描き方を一手ずつ (JIS B 0002 / ISO 6410)", 230);
    const id = `tbth${++uid}`;
    const steps = [
      "① おねじの外形 (山の頂 = 外径) を太い実線で描く。端は面取り。",
      "② 谷径を細い実線で描く。面取り部まで引く。",
      "③ 完全ねじ部の終わりを太い実線で示す (不完全ねじ部は通常描かない)。",
      "④ 端面から見た図: 外径は太い実線の円、谷径は細い実線の約 3/4 円。面取り円は描かない。",
      "⑤ めねじ (止まり穴) の断面: 内径 = 下穴を太線、谷径 (呼び径) を細線。ハッチングは太線 (内径) まで。下穴の先端は約 120° の円すいで描く。",
      "⑥ 呼びを記入: おねじ M10、めねじ M10 ↧15 (ねじ深さ)、下穴 φ8.5 ↧20 など。",
    ];
    let n = reduced() ? steps.length : 1;
    let playing = !reduced();
    let acc = 0;
    const prev = button(ctl, "◀ 戻る", () => ((n = Math.max(1, n - 1)), (playing = false), (pb.textContent = "▶ 自動"), render()));
    void prev;
    button(ctl, "進む ▶", () => ((n = Math.min(steps.length, n + 1)), (playing = false), (pb.textContent = "▶ 自動"), render()));
    const pb = button(ctl, playing ? "■ 止める" : "▶ 自動", () => ((playing = !playing), (pb.textContent = playing ? "■ 止める" : "▶ 自動")));
    const render = () => {
      let s = `<defs><clipPath id="${id}"><path d="M390,40 L500,40 L500,160 L390,160 Z M390,80 L460,80 L471.5,100 L460,120 L390,120 Z" clip-rule="evenodd"/></clipPath></defs>`;
      // centre lines always
      s += `<line x1="30" y1="100" x2="255" y2="100" ${CEN}/>`;
      if (n >= 1) s += `<path d="M40,70 L234,70 L242,78 L242,122 L234,130 L40,130 Z" ${THICK}/>`;
      if (n >= 2) s += `<line x1="120" y1="77" x2="241" y2="77" ${THIN}/><line x1="120" y1="123" x2="241" y2="123" ${THIN}/>`;
      if (n >= 3) s += `<line x1="120" y1="70" x2="120" y2="130" ${THICK}/>`;
      if (n >= 4) {
        s += `<line x1="270" y1="100" x2="370" y2="100" ${CEN}/><line x1="320" y1="50" x2="320" y2="150" ${CEN}/>`;
        s += `<circle cx="320" cy="100" r="30" ${THICK}/>`;
        s += `<path d="M320,77 A23,23 0 1 1 297,100" ${THIN}/>`;
      }
      if (n >= 5) {
        let h = "";
        for (let k = -120; k < 140; k += 9) h += `<line x1="${380 + k}" y1="170" x2="${380 + k + 130}" y2="40" stroke="var(--tb-text-2)" stroke-width="0.8"/>`;
        s += `<g clip-path="url(#${id})">${h}</g>`;
        s += `<rect x="390" y="40" width="110" height="120" ${THICK}/>`;
        s += `<path d="M390,80 L460,80 L471.5,100 L460,120 L390,120" ${THICK}/>`;
        s += `<line x1="460" y1="80" x2="460" y2="120" ${THICK}/>`;
        s += `<line x1="390" y1="74" x2="445" y2="74" ${THIN}/><line x1="390" y1="126" x2="445" y2="126" ${THIN}/>`;
        s += `<line x1="445" y1="74" x2="445" y2="126" ${THICK}/>`;
        s += `<line x1="380" y1="100" x2="485" y2="100" ${CEN}/>`;
      }
      if (n >= 6) {
        s += `<line x1="180" y1="70" x2="200" y2="35" ${THIN}/><line x1="200" y1="35" x2="240" y2="35" ${THIN}/><text class="mark-t" x="204" y="31">M10</text>`;
        s += `<line x1="430" y1="74" x2="410" y2="22" ${THIN}/><text class="mark-t" x="340" y="18">M10 ↧15 / 下穴 φ8.5 ↧20</text>`;
      }
      s += `<text class="tick" x="120" y="160" text-anchor="middle">おねじ</text><text class="tick" x="320" y="170" text-anchor="middle">${n >= 4 ? "端面図" : ""}</text><text class="tick" x="445" y="180" text-anchor="middle">${n >= 5 ? "めねじ (断面)" : ""}</text>`;
      svg.innerHTML = s;
      out.innerHTML = `<p class="tb-note">${steps[n - 1]}</p>`;
    };
    render();
    loop(host, (_t, dt) => {
      acc += dt;
      if (acc > 2.2) {
        acc = 0;
        n = n >= steps.length ? 1 : n + 1;
        render();
      }
    }, () => playing);
  },
};
