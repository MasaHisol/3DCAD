// Animated figures for the drafting chapters (<div data-widget="anim-...">).
// Same conventions as anim.ts: static first frame, stops when the host leaves
// the page, and respects prefers-reduced-motion.

import { frame, button, select, loop, reduced } from "./animkit";
const THICK = `style="stroke:var(--k-line);fill:none" stroke-width="2.2"`;
const THIN = `style="stroke:var(--k-line-2);fill:none" stroke-width="1"`;
const HID = `style="stroke:var(--k-line-2);fill:none" stroke-width="1" stroke-dasharray="5 3"`;
const CEN = `style="stroke:var(--k-dim);fill:none" stroke-width="0.9" stroke-dasharray="12 3 2 3"`;
/** Same line types, drawn in the accent colour (the line added in the current step). */
const NEW_THICK = `style="stroke:var(--tb-accent);fill:none" stroke-width="2.6"`;
const NEW_THIN = `style="stroke:var(--tb-accent);fill:none" stroke-width="1.4"`;

const n1 = (v: number) => Math.round(v * 10) / 10;
const badge = (x: number, y: number, t: string, col = "var(--tb-accent)") =>
  `<circle class="k-badge" cx="${x}" cy="${y}" r="10" style="fill:${col}"/><text class="k-badge-t" x="${x}" y="${y + 4}" text-anchor="middle">${t}</text>`;

/** Small isometric picture of the projected object (W 100 × D 50 × H 60, step at x = 50, hole Ø16 at (75, 25)). */
function isoPicture(ox: number, oy: number, s: number) {
  const c = 0.866, h = 0.5;
  const p = (x: number, y: number, z: number) => `${n1(ox + c * s * (x + y))},${n1(oy + h * s * (x - y) - z * s)}`;
  const face = (pts: [number, number, number][], fill: string) => `<polygon points="${pts.map((q) => p(...q)).join(" ")}" style="fill:${fill};stroke:var(--k-line)" stroke-width="1.4" stroke-linejoin="round"/>`;
  const T = "var(--k-steel-1)", R = "var(--k-steel-3)", F = "var(--k-steel-2)";
  let g = `<g class="k-shadow">`;
  g += face([[50, 0, 25], [100, 0, 25], [100, 50, 25], [50, 50, 25]], T);
  g += face([[100, 0, 0], [100, 50, 0], [100, 50, 25], [100, 0, 25]], R);
  g += face([[0, 0, 0], [100, 0, 0], [100, 0, 25], [0, 0, 25]], F);
  g += face([[50, 0, 25], [50, 50, 25], [50, 50, 60], [50, 0, 60]], R);
  g += face([[0, 0, 25], [50, 0, 25], [50, 0, 60], [0, 0, 60]], F);
  g += face([[0, 0, 60], [50, 0, 60], [50, 50, 60], [0, 50, 60]], T);
  g += `</g>`;
  // the through hole on the lower top face
  const [hx, hy] = p(75, 25, 25).split(",").map(Number);
  g += `<ellipse cx="${hx}" cy="${hy}" rx="${n1(8 * s * 1.22)}" ry="${n1(8 * s * 0.71)}" style="fill:var(--k-line);stroke:var(--k-line)" opacity="0.75"/>`;
  return { svg: g, front: p(50, -40, 12).split(",").map(Number), frontTo: p(50, -6, 12).split(",").map(Number) };
}

const SYM = `style="stroke:var(--k-line);fill:none" stroke-width="1.4"`;

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
    const PAPER = `style="fill:var(--tb-surface);stroke:var(--k-line)" stroke-width="2.2"`;
    const render = (t: number) => {
      const e = t < 1 ? 1 - (1 - t) ** 3 : 1; // ease out
      // header
      let s = badge(18, 20, mode) + `<text class="k-title" x="34" y="25">${mode === "3" ? "第三角法" : "第一角法"}</text>`;
      // pictorial of the object (bottom-left)
      const iso = isoPicture(14, 240, 0.7);
      s += `<text class="k-note" x="14" y="172">品物 (見取図)</text>` + iso.svg;
      s += `<line class="k-move" x1="${iso.front[0]}" y1="${iso.front[1]}" x2="${iso.frontTo[0]}" y2="${iso.frontTo[1]}"/>`;
      s += `<text class="tick" x="${iso.front[0] + 4}" y="${iso.front[1] + 16}" text-anchor="middle">正面</text>`;
      // front view (fixed)
      const F = (x: number, z: number) => [FX + x, FY - z];
      s += `<path d="M${F(0, 0)} L${F(100, 0)} L${F(100, 25)} L${F(50, 25)} L${F(50, 60)} L${F(0, 60)} Z" ${PAPER}/>`;
      s += line(F(67, 0), F(67, 25), HID) + line(F(83, 0), F(83, 25), HID) + line(F(75, -6), F(75, 31), CEN);
      s += `<text class="lbl" x="${FX + 50}" y="${FY + 18}" text-anchor="middle">正面図</text>`;
      // top view: depth coordinate measured from the hinge with the front view
      const adj = (y: number) => (mode === "3" ? y : D - y); // third angle: the face toward the viewer is adjacent
      const T = (x: number, y: number) => (mode === "3" ? [FX + x, FY - 60 - GAP * e - adj(y) * e] : [FX + x, FY + GAP * e + 8 + adj(y) * e]);
      // projection lines once unfolded
      if (e > 0.98) {
        const PL = `style="stroke:var(--k-line-2)" stroke-width="0.7" stroke-dasharray="2 3"`;
        for (const x of [0, 50, 100]) s += mode === "3" ? line(F(x, 60), T(x, 0), PL) : line(F(x, 0), T(x, D), PL);
        const R0 = mode === "3" ? FX + W : FX;
        const R1 = mode === "3" ? FX + W + GAP : FX - GAP;
        for (const z of [0, 25, 60]) s += line([R0, FY - z], [R1, FY - z], PL);
      }
      s += `<path d="M${T(0, 0)} L${T(W, 0)} L${T(W, D)} L${T(0, D)} Z" ${PAPER}/>`;
      s += line(T(50, 0), T(50, D), THICK);
      if (e > 0.3) {
        const c = T(75, 25);
        s += `<ellipse cx="${c[0]}" cy="${c[1]}" rx="8" ry="${(8 * e).toFixed(1)}" ${THICK}/>`;
        s += line(T(65, 25), T(85, 25), CEN) + line(T(75, 15), T(75, 35), CEN);
      }
      const tl = mode === "3" ? Math.min(T(50, D)[1], T(50, 0)[1]) - 6 : Math.max(T(50, D)[1], T(50, 0)[1]) + 16;
      s += `<text class="lbl" x="${FX + 50}" y="${tl.toFixed(1)}" text-anchor="middle">平面図</text>`;
      // right-side view (seen from +x)
      const R = (y: number, z: number) => (mode === "3" ? [FX + W + GAP * e + adj(y) * e, FY - z] : [FX - GAP * e - adj(y) * e, FY - z]);
      s += `<path d="M${R(0, 0)} L${R(D, 0)} L${R(D, 60)} L${R(0, 60)} Z" ${PAPER}/>`;
      s += line(R(0, 25), R(D, 25), THICK);
      s += line(R(17, 0), R(17, 25), HID) + line(R(33, 0), R(33, 25), HID) + line(R(25, -6), R(25, 31), CEN);
      const rx = (R(0, 0)[0] + R(D, 0)[0]) / 2;
      s += `<text class="lbl" x="${rx.toFixed(1)}" y="${FY + 18}" text-anchor="middle">右側面図</text>`;
      // the face toward the viewer (y = 0) is marked in each unfolded view
      s += line(T(0, 0), T(W, 0), `style="stroke:var(--tb-accent)" stroke-width="3"`);
      s += line(R(0, 0), R(0, 60), `style="stroke:var(--tb-accent)" stroke-width="3"`);
      // hinge lines while unfolding
      if (e < 1) {
        s += mode === "3" ? line([FX - 20, FY - 60 - GAP * e], [FX + 130, FY - 60 - GAP * e], `class="guide"`) : line([FX - 20, FY + GAP * e + 8], [FX + 130, FY + GAP * e + 8], `class="guide"`);
      }
      // projection symbol
      const sx = 448, sy = 40;
      const cone = `<path d="M0,-9 L18,-14 L18,14 L0,9 Z" ${SYM}/>`;
      const circ = `<circle r="14" ${SYM}/><circle r="9" ${SYM}/>`;
      s += mode === "3"
        ? `<g transform="translate(${sx - 30},${sy})">${cone}</g><g transform="translate(${sx + 25},${sy})">${circ}</g>`
        : `<g transform="translate(${sx - 25},${sy})">${circ}</g><g transform="translate(${sx + 2},${sy})">${cone}</g>`;
      s += `<text class="tick" x="${sx}" y="${sy + 30}" text-anchor="middle">${mode === "3" ? "第三角法の記号" : "第一角法の記号"}</text>`;
      s += `<line x1="376" x2="396" y1="${sy + 46}" y2="${sy + 46}" style="stroke:var(--tb-accent)" stroke-width="3"/><text class="tick" x="400" y="${sy + 50}">手前側 (正面側) の辺</text>`;
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
    const { ctl, svg, out } = frame(host, "ねじの描き方を一手ずつ (JIS B 0002 / ISO 6410)", 236);
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
      const tk = (k: number) => (k === n ? NEW_THICK : THICK);
      const tn = (k: number) => (k === n ? NEW_THIN : THIN);
      let s = badge(18, 20, String(n)) + `<text class="k-title" x="34" y="25">手順 ${n} / ${steps.length}</text>`;
      s += `<rect x="${12 + (n - 1) * 0}" y="34" width="${n * 30}" height="4" rx="2" style="fill:var(--tb-accent)"/><rect x="${12 + n * 30}" y="34" width="${(steps.length - n) * 30}" height="4" rx="2" style="fill:var(--tb-surface-2)"/>`;
      // centre lines always
      s += `<line x1="30" y1="110" x2="255" y2="110" ${CEN}/>`;
      if (n >= 1) s += `<path d="M40,80 L234,80 L242,88 L242,132 L234,140 L40,140 Z" style="fill:var(--tb-surface)" stroke="none"/><path d="M40,80 L234,80 L242,88 L242,132 L234,140 L40,140 Z" ${tk(1)}/>`;
      if (n >= 2) s += `<line x1="120" y1="87" x2="241" y2="87" ${tn(2)}/><line x1="120" y1="133" x2="241" y2="133" ${tn(2)}/>`;
      if (n >= 3) s += `<line x1="120" y1="80" x2="120" y2="140" ${tk(3)}/>`;
      if (n >= 1) s += `<line x1="30" y1="110" x2="255" y2="110" ${CEN}/>`;
      if (n >= 4) {
        s += `<line x1="270" y1="110" x2="370" y2="110" ${CEN}/><line x1="320" y1="60" x2="320" y2="160" ${CEN}/>`;
        s += `<circle cx="320" cy="110" r="30" ${tk(4)}/>`;
        s += `<path d="M320,87 A23,23 0 1 1 297,110" ${tn(4)}/>`;
      }
      if (n >= 5) {
        // section with hatching up to the thick (minor-diameter) line
        s += `<path d="M390,50 L500,50 L500,170 L390,170 Z M390,90 L460,90 L471.5,110 L460,130 L390,130 Z" fill-rule="evenodd" style="fill:url(#k-hatch)"/>`;
        const S5 = tk(5), s5 = tn(5);
        s += `<rect x="390" y="50" width="110" height="120" ${S5}/>`;
        s += `<path d="M390,90 L460,90 L471.5,110 L460,130 L390,130" ${S5}/>`;
        s += `<line x1="460" y1="90" x2="460" y2="130" ${S5}/>`;
        s += `<line x1="390" y1="84" x2="445" y2="84" ${s5}/><line x1="390" y1="136" x2="445" y2="136" ${s5}/>`;
        s += `<line x1="445" y1="84" x2="445" y2="136" ${S5}/>`;
        s += `<line x1="380" y1="110" x2="485" y2="110" ${CEN}/>`;
      }
      if (n >= 6) {
        const L6 = n === 6 ? NEW_THIN : THIN;
        s += `<line x1="180" y1="80" x2="196" y2="54" ${L6}/><line x1="196" y1="54" x2="240" y2="54" ${L6}/><text class="mark-t" x="200" y="50">M10</text>`;
        s += `<line x1="430" y1="84" x2="414" y2="40" ${L6}/><line x1="414" y1="40" x2="300" y2="40" ${L6}/><text class="mark-t" x="300" y="35">M10 ↧15 / 下穴 φ8.5 ↧20</text>`;
      }
      s += `<text class="lbl" x="120" y="166" text-anchor="middle">おねじ</text>`;
      if (n >= 4) s += `<text class="lbl" x="320" y="184" text-anchor="middle">端面図</text>`;
      if (n >= 5) s += `<text class="lbl" x="445" y="190" text-anchor="middle">めねじ (断面)</text>`;
      s += `<line x1="14" x2="34" y1="222" y2="222" ${NEW_THICK}/><text class="tick" x="40" y="226">この手順で加えた線</text>`;
      s += `<line x1="170" x2="190" y1="222" y2="222" ${THICK}/><text class="tick" x="196" y="226">太い実線</text><line x1="262" x2="282" y1="222" y2="222" ${THIN}/><text class="tick" x="288" y="226">細い実線</text>`;
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
