// Animated and hands-on figures for the operator-UX chapters (content/opux.ts).
// Same conventions as anim.ts: static first frame, stops when the host leaves
// the page, and respects prefers-reduced-motion.
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

/** NIOSH frequency multiplier (V < 75 cm and V ≥ 75 cm are equal for these rows). */
const FM: Record<string, [number, number, number]> = {
  "0.2": [1.0, 0.95, 0.85],
  "1": [0.94, 0.88, 0.75],
  "2": [0.91, 0.84, 0.65],
  "4": [0.84, 0.72, 0.45],
  "6": [0.75, 0.5, 0.27],
};

export const ANIM7: Record<string, (host: HTMLElement) => void> = {
  /** Recommended work-surface height from stature and task type. */
  "anim-workheight"(host) {
    const { ctl, svg, out } = frame(host, "身長と作業の種類から作業面の高さを決める (立位・側面)", 250);
    let H = 1600;
    let task = "light";
    // offset of the work surface from elbow height (mm), mid value of the usual ranges
    const tasks: Record<string, [number, string]> = {
      precision: [75, "精密作業: 肘高 +50〜100 mm (腕を支え、目を近づける)"],
      light: [-125, "軽作業: 肘高 −100〜150 mm (肩を上げずに手を動かす)"],
      heavy: [-275, "重作業: 肘高 −150〜400 mm (体重を下向きの力に使う)"],
    };
    slider(ctl, "身長 mm", 1450, 1900, H, 10, (v) => ((H = v), draw()));
    select(ctl, [["precision", "精密作業"], ["light", "軽作業"], ["heavy", "重作業"]], task, (v) => ((task = v), draw()));
    const draw = () => {
      const k = 0.11, g = 235, X = 110;
      const elbow = H * 0.62; // standing elbow height ≈ 0.62 × stature (rough)
      const sh = H * 0.818, head = H * 0.13;
      const [off, label] = tasks[task];
      const surf = elbow + off;
      const fixed = 900; // a typical fixed bench
      let s = `<line class="axis" x1="20" x2="500" y1="${g}" y2="${g}"/>`;
      s += `<circle cx="${X}" cy="${g - (H - head / 2) * k}" r="${(head / 2) * k}" class="sec"/>`;
      s += `<path d="M${X},${g - sh * k} L${X},${g - H * 0.48 * k} L${X - 12},${g} M${X},${g - H * 0.48 * k} L${X + 12},${g}" stroke="var(--tb-accent)" stroke-width="5" fill="none" stroke-linecap="round"/>`;
      // upper arm down to the elbow, forearm to the work surface
      const ex = X + 8, ey = g - elbow * k;
      const hx = X + 70, hy = g - (surf + 30) * k;
      s += `<path d="M${X},${g - sh * k} L${ex},${ey} L${hx},${hy}" stroke="var(--tb-accent)" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
      s += `<line class="guide" x1="40" x2="300" y1="${ey}" y2="${ey}"/><text class="tick" x="300" y="${ey - 3}" text-anchor="end">肘高 ${Math.round(elbow)}</text>`;
      s += `<rect x="${X + 40}" y="${g - surf * k}" width="140" height="7" fill="var(--tb-good)"/><line x1="${X + 170}" x2="${X + 170}" y1="${g - surf * k}" y2="${g}" stroke="var(--tb-text-3)" stroke-width="3"/>`;
      s += `<line x1="${X + 40}" x2="${X + 180}" y1="${g - fixed * k}" y2="${g - fixed * k}" stroke="var(--tb-text-3)" stroke-dasharray="4 3"/><text class="tick" x="${X + 185}" y="${g - fixed * k + 4}">固定台 900</text>`;
      const diff = fixed - surf;
      const col = Math.abs(diff) <= 50 ? "var(--tb-good)" : Math.abs(diff) <= 100 ? "var(--tb-warn)" : "var(--tb-bad)";
      s += `<text class="mark-t" x="330" y="60">推奨作業面 ≈ ${Math.round(surf / 10) * 10} mm</text>`;
      s += `<text class="tick" x="330" y="80">身長 ${H} mm / 肘高 ≈ 0.62 × 身長</text>`;
      s += `<text class="tick" x="330" y="98">固定台 900 mm との差 ${diff > 0 ? "+" : ""}${Math.round(diff)} mm</text>`;
      s += `<text class="mark-t" x="330" y="122" fill="${col}">${Math.abs(diff) <= 50 ? "固定台でほぼ合う" : diff > 0 ? "台が高い → 肩が上がる / 足台" : "台が低い → 前かがみ / 昇降・かさ上げ"}</text>`;
      svg.innerHTML = s;
      out.innerHTML = `<p class="tb-note">${label}。体の比率と範囲は説明用の概略値です (靴の高さ約 20〜30 mm は含めていません)。身長 1 450〜1 900 mm を 1 台でカバーするには、およそ 250 mm 以上の昇降範囲が必要になります。</p>`;
    };
    draw();
  },

  /** Revised NIOSH lifting equation calculator. */
  "anim-niosh"(host) {
    const { ctl, svg, out } = frame(host, "NIOSH 持ち上げ式 (改訂版) で推奨重量限界 RWL を求める", 240);
    const st = { load: 12, H: 40, V: 30, D: 50, A: 0, f: "1", dur: 1, cpl: 1.0 };
    slider(ctl, "重量 kg", 1, 30, st.load, 1, (v) => ((st.load = v), draw()));
    slider(ctl, "水平距離 H cm", 25, 63, st.H, 1, (v) => ((st.H = v), draw()));
    slider(ctl, "始点の手の高さ V cm", 0, 175, st.V, 5, (v) => ((st.V = v), draw()));
    slider(ctl, "垂直移動距離 D cm", 25, 175, st.D, 5, (v) => ((st.D = v), draw()));
    slider(ctl, "体のねじり A °", 0, 135, st.A, 15, (v) => ((st.A = v), draw()));
    select(ctl, [["0.2", "0.2 回/分"], ["1", "1 回/分"], ["2", "2 回/分"], ["4", "4 回/分"], ["6", "6 回/分"]], st.f, (v) => ((st.f = v), draw()));
    select(ctl, [["0", "1 時間以内"], ["1", "1〜2 時間"], ["2", "2〜8 時間"]], "1", (v) => ((st.dur = Number(v)), draw()));
    select(ctl, [["1", "持ち手: 良"], ["0.95", "持ち手: 可"], ["0.9", "持ち手: 不良"]], "1", (v) => ((st.cpl = Number(v)), draw()));
    const draw = () => {
      const HM = 25 / st.H;
      const VM = 1 - 0.003 * Math.abs(st.V - 75);
      const DM = 0.82 + 4.5 / st.D;
      const AM = 1 - 0.0032 * st.A;
      const FMv = FM[st.f][st.dur];
      const CM = st.cpl === 0.95 && st.V >= 75 ? 1.0 : st.cpl; // "fair" is 1.00 when V ≥ 75 cm
      const RWL = 23 * HM * VM * DM * AM * FMv * CM;
      const LI = st.load / RWL;
      const rows: [string, number][] = [["HM", HM], ["VM", VM], ["DM", DM], ["AM", AM], ["FM", FMv], ["CM", CM]];
      let s = `<text class="lbl" x="20" y="20">係数 (1.0 が最良)</text>`;
      rows.forEach(([n, v], i) => {
        const y = 34 + i * 24;
        s += `<text class="tick" x="20" y="${y + 12}">${n}</text><rect x="50" y="${y}" width="200" height="14" fill="var(--tb-surface-2)"/>`;
        s += `<rect x="50" y="${y}" width="${Math.max(0, Math.min(1, v)) * 200}" height="14" fill="${v >= 0.85 ? "var(--tb-good)" : v >= 0.65 ? "var(--tb-warn)" : "var(--tb-bad)"}"/>`;
        s += `<text class="tick" x="258" y="${y + 12}">${v.toFixed(2)}</text>`;
      });
      const col = LI <= 1 ? "var(--tb-good)" : LI <= 3 ? "var(--tb-warn)" : "var(--tb-bad)";
      s += `<text class="mark-t" x="310" y="40">RWL = 23 × HM × VM × DM</text><text class="mark-t" x="352" y="60">× AM × FM × CM</text>`;
      s += `<text class="mark-t" x="310" y="84">RWL ≈ ${fmt(RWL)} kg</text>`;
      s += `<text class="mark-t" x="310" y="110" fill="${col}">LI = ${st.load} / ${fmt(RWL)} ≈ ${LI.toFixed(2)}</text>`;
      // LI gauge
      const gx = (v: number) => 310 + Math.min(v, 4) / 4 * 190;
      s += `<rect x="${gx(0)}" y="130" width="${gx(1) - gx(0)}" height="12" fill="var(--tb-good)"/><rect x="${gx(1)}" y="130" width="${gx(3) - gx(1)}" height="12" fill="var(--tb-warn)"/><rect x="${gx(3)}" y="130" width="${gx(4) - gx(3)}" height="12" fill="var(--tb-bad)"/>`;
      s += `<path d="M${gx(LI)},126 l-5,-8 h10 Z" fill="var(--tb-text)"/>`;
      [0, 1, 3, 4].forEach((v) => (s += `<text class="tick" x="${gx(v)}" y="156" text-anchor="middle">${v}</text>`));
      s += `<text class="tick" x="310" y="180">${LI <= 1 ? "LI ≤ 1: 大多数の健康な作業者に許容" : LI <= 3 ? "1 < LI ≤ 3: リスク増。作業の改善を検討" : "LI > 3: 多くの作業者に高リスク。早急に改善"}</text>`;
      s += `<text class="tick" x="20" y="200">H: 足首中点から手までの水平距離 / V: 床から手の高さ / A: 正面からのねじり角</text>`;
      s += `<text class="tick" x="20" y="218">範囲外 (H &lt; 25 は 25 として扱う、H &gt; 63 や V &gt; 175 は係数 0) に注意</text>`;
      svg.innerHTML = s;
    };
    out.innerHTML = `<p class="tb-note">係数式は NIOSH 改訂持ち上げ式 (1991) の SI 版、FM は表の一部 (この範囲では V &lt; 75 と V ≥ 75 で同じ値) を使っています。片手作業、押し引き、極端な温湿度などは式の適用外です。</p>`;
    draw();
  },

  /** Alarm flood vs rationalised, prioritised alarms. */
  "anim-alarmflood"(host) {
    const { ctl, svg, out } = frame(host, "アラームフラッド と 優先度付けしたアラーム", 240);
    let mode = "flood";
    let playing = !reduced();
    select(ctl, [["flood", "未整理 (すべて同じ扱い)"], ["good", "整理後 (抑制・優先度付き)"]], mode, (v) => ((mode = v), (t0 = performance.now() / 1000)));
    const pb = button(ctl, playing ? "■ 止める" : "▶ 動かす", () => ((playing = !playing), (pb.textContent = playing ? "■ 止める" : "▶ 動かす")));
    let t0 = performance.now() / 1000;
    // one root cause (air pressure drop at t=1 s) triggers many consequential alarms
    const flood = [
      "エア圧低下", "クランプ1 未確認", "クランプ2 未確認", "クランプ3 未確認", "シリンダA 前進タイムアウト", "シリンダB 前進タイムアウト",
      "ワーク有無センサ不一致", "サイクルタイム超過", "搬送 待ちタイムアウト", "上流 停止中", "下流 待機", "グリッパ 開確認なし",
      "真空 未到達", "安全扉 ロック待ち", "治具 位置ずれ", "工程3 異常停止",
    ];
    const prio = ["高", "中", "低"];
    const draw = (now: number) => {
      const t = (now - t0) % 12;
      const n = t < 1 ? 0 : Math.min(flood.length, Math.floor((t - 1) * 3) + 1);
      let s = `<rect x="10" y="10" width="330" height="220" fill="var(--tb-surface-2)" stroke="var(--tb-text-3)"/>`;
      if (mode === "flood") {
        for (let i = 0; i < n; i++) {
          const y = 28 + i * 13;
          if (y > 225) break;
          s += `<rect x="14" y="${y - 10}" width="322" height="12" fill="var(--tb-bad)" opacity="${0.35 + 0.65 * ((i + Math.floor(now * 2)) % 2)}"/>`;
          s += `<text class="tick" x="20" y="${y}">ALM${String(100 + i)} ${flood[i]}</text>`;
        }
      } else if (n > 0) {
        s += `<rect x="14" y="16" width="322" height="40" fill="var(--tb-bad)" opacity="0.9"/>`;
        s += `<text class="mark-t" x="22" y="34" fill="#fff">[高] エア圧低下 0.32 MPa (下限 0.45)</text>`;
        s += `<text class="tick" x="22" y="50" fill="#fff">対応: 元圧バルブ・フィルタを確認 → 復帰後 リセット</text>`;
        s += `<text class="tick" x="22" y="78">関連して抑制したアラーム ${Math.max(0, n - 2)} 件 (展開して表示)</text>`;
        if (n > 4) s += `<rect x="14" y="88" width="322" height="20" fill="var(--tb-warn)" opacity="0.8"/><text class="tick" x="22" y="102">[中] 工程3 停止中 (原因: エア圧低下)</text>`;
      }
      // counter
      const shown = mode === "flood" ? n : n === 0 ? 0 : n > 4 ? 2 : 1;
      s += `<text class="mark-t" x="360" y="40">表示中のアラーム</text><text class="mark-t" x="360" y="80" font-size="30" fill="${shown > 5 ? "var(--tb-bad)" : "var(--tb-good)"}">${shown} 件</text>`;
      s += `<text class="tick" x="360" y="110">原因: エア圧低下 1 件</text>`;
      s += `<text class="tick" x="360" y="130">${mode === "flood" ? "原因が埋もれる" : "原因と対応が先頭に"}</text>`;
      s += `<text class="tick" x="360" y="160">優先度: ${prio.join(" / ")}</text>`;
      s += `<text class="tick" x="360" y="178">目安の比率 5 / 15 / 80 %</text>`;
      s += `<text class="tick" x="360" y="210">t = ${t.toFixed(1)} s</text>`;
      svg.innerHTML = s;
    };
    out.innerHTML = `<p class="tb-note">エア圧が 1 回下がっただけで、連鎖した結果アラームが 5 秒で 16 件出る例です。整理後は、原因アラームに優先度と対応手順を付け、結果アラームは状態に基づいて抑制 (グループ化) します。</p>`;
    draw(t0 + 6);
    loop(host, (t) => draw(t), () => playing);
  },
};
