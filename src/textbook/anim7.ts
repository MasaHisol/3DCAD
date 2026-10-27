// Animated and hands-on figures for the operator-UX chapters (content/opux.ts).
// Same conventions as anim.ts: static first frame, stops when the host leaves
// the page, and respects prefers-reduced-motion.
import { fmt } from "./chart";

import { frame, button, slider, select, loop, reduced } from "./animkit";

// ------------------------------------------------------------- figures ---

/** NIOSH frequency multiplier (V < 75 cm and V ≥ 75 cm are equal for these rows). */
const FM: Record<string, [number, number, number]> = {
  "0.2": [1.0, 0.95, 0.85],
  "1": [0.94, 0.88, 0.75],
  "2": [0.91, 0.84, 0.65],
  "4": [0.84, 0.72, 0.45],
  "6": [0.75, 0.5, 0.27],
};

// ------------------------------------------------------------- helpers ---
const n1 = (v: number) => Math.round(v * 10) / 10;
const panel = (x: number, y: number, w: number, h: number) => `<rect class="k-panel" x="${x}" y="${y}" width="${w}" height="${h}" rx="8"/>`;
/** A limb drawn as an outlined round-capped stroke. */
const limb = (pts: [number, number][], col: string, w: number) => {
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${n1(x)},${n1(y)}`).join(" ");
  return `<path d="${d}" fill="none" style="stroke:var(--k-line)" stroke-width="${w + 2.4}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" style="stroke:${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
};
/** Two-link inverse kinematics: joint position between a and b with link lengths l1, l2, bending to side `bend` (+1 / −1). */
function ik(a: [number, number], b: [number, number], l1: number, l2: number, bend: number): [number, number] {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const d = Math.min(l1 + l2 - 1e-6, Math.max(1e-6, Math.hypot(dx, dy)));
  const ca = (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d);
  const ang = Math.atan2(dy, dx) + bend * Math.acos(Math.max(-1, Math.min(1, ca)));
  return [a[0] + l1 * Math.cos(ang), a[1] + l1 * Math.sin(ang)];
}
const SHIRT = "var(--k-accent-1)", TROUSERS = "var(--k-steel-3)", SKIN = "var(--k-skin-1)";

export const ANIM7: Record<string, (host: HTMLElement) => void> = {
  /** Recommended work-surface height from stature and task type. */
  "anim-workheight"(host) {
    const { ctl, svg, out } = frame(host, "身長と作業の種類から作業面の高さを決める (立位・側面)", 254);
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
      const k = 0.11, g = 238, X = 104;
      const elbow = H * 0.62; // standing elbow height ≈ 0.62 × stature (rough)
      const sh = H * 0.818, head = H * 0.13;
      const [off, label] = tasks[task];
      const surf = elbow + off;
      const fixed = 900; // a typical fixed bench
      const Y = (mm: number) => g - mm * k;
      let s = `<rect class="k-ground" x="10" y="${g}" width="320" height="10"/><line class="k-edge" x1="10" x2="330" y1="${g}" y2="${g}"/>`;
      // elbow-height guide
      const ex = X + 8, ey = Y(elbow);
      s += `<line class="guide" x1="14" x2="${X + 166}" y1="${n1(ey)}" y2="${n1(ey)}"/><text class="tick" x="14" y="${n1(ey - 4)}">肘高 ${Math.round(elbow)}</text>`;
      // bench at the recommended height: top + legs + a workpiece
      const ty = Y(surf);
      s += `<g class="k-shadow"><rect class="k-part" x="${X + 48}" y="${n1(ty + 8)}" width="8" height="${n1(g - ty - 8)}"/><rect class="k-part" x="${X + 144}" y="${n1(ty + 8)}" width="8" height="${n1(g - ty - 8)}"/>`;
      s += `<rect class="k-plastic" x="${X + 76}" y="${n1(ty - 14)}" width="34" height="14" rx="2"/>`;
      s += `<rect class="k-alu" x="${X + 40}" y="${n1(ty)}" width="120" height="8" rx="2" style="stroke:var(--tb-good)"/></g>`;
      // the fixed 900 mm bench for comparison
      s += `<line x1="${X + 40}" x2="${X + 160}" y1="${n1(Y(fixed))}" y2="${n1(Y(fixed))}" style="stroke:var(--tb-text-3)" stroke-width="1.4" stroke-dasharray="5 3"/>`;
      s += `<text class="tick" x="${X + 166}" y="${n1(Y(fixed) + 4)}">固定台 900</text>`;
      const diff = fixed - surf;
      const col = Math.abs(diff) <= 50 ? "var(--tb-good)" : Math.abs(diff) <= 100 ? "var(--tb-warn)" : "var(--tb-bad)";
      if (Math.abs(diff) * k > 8) s += `<line x1="${X + 136}" x2="${X + 136}" y1="${n1(Y(fixed))}" y2="${n1(ty)}" style="stroke:${col}" stroke-width="1.6" marker-start="url(#k-dot)" marker-end="url(#k-arrow)"/>`;
      // the person (side view, facing right)
      const hip = Y(H * 0.52), knee = Y(H * 0.285), ank = Y(H * 0.04), sY = Y(sh);
      s += `<g class="k-shadow">`;
      s += limb([[X - 2, hip], [X + 2, knee], [X - 2, ank]], TROUSERS, 13);
      s += `<path d="M${X - 6},${n1(ank - 2)} L${X + 16},${n1(ank - 2)} Q${X + 20},${g} ${X + 14},${g} L${X - 8},${g} Z" fill="#374151" style="stroke:var(--k-line)" stroke-width="0.8"/>`;
      s += `<path class="k-accent" d="M${X - 12},${n1(sY - 2)} Q${X + 2},${n1(sY - 7)} ${X + 13},${n1(sY + 4)} L${X + 11},${n1(hip + 4)} L${X - 13},${n1(hip + 4)} Z"/>`;
      // neck and head
      const hr = (head / 2) * k;
      const hcY = Y(H - head / 2);
      s += `<rect class="k-skin" x="${X - 3}" y="${n1(hcY + hr - 2)}" width="8" height="${n1(Math.max(3, sY - (hcY + hr) + 2))}"/>`;
      s += `<ellipse class="k-skin" cx="${X + 1}" cy="${n1(hcY)}" rx="${n1(hr * 0.85)}" ry="${n1(hr)}"/>`;
      s += `<path d="M${n1(X - hr * 0.85)},${n1(hcY - 1)} Q${n1(X - hr * 0.6)},${n1(hcY - hr - 3)} ${n1(X + hr * 0.6)},${n1(hcY - hr + 1)} Q${n1(X + hr * 0.2)},${n1(hcY - hr * 0.3)} ${n1(X - hr * 0.3)},${n1(hcY - hr * 0.2)} Z" fill="#374151" style="stroke:var(--k-line)" stroke-width="0.8"/>`;
      s += `<circle cx="${n1(X + hr * 0.45)}" cy="${n1(hcY - 1)}" r="1.2" style="fill:var(--k-line)"/>`;
      // upper arm down to the elbow, forearm to the work surface
      const hx = X + 74, hy = Y(surf + 30);
      s += limb([[X, sY + 3], [ex, ey]], SHIRT, 9);
      s += limb([[ex, ey], [hx, hy]], SKIN, 7);
      s += `<circle class="k-skin" cx="${n1(hx + 2)}" cy="${n1(hy)}" r="4.5"/>`;
      s += `</g>`;
      // readout panel
      s += panel(342, 8, 172, 238);
      s += `<text class="k-note" x="354" y="32">推奨作業面</text>`;
      s += `<text class="k-title" x="354" y="56" style="font-size:20px;fill:var(--tb-good)">≈ ${Math.round(surf / 10) * 10} mm</text>`;
      s += `<text class="tick" x="354" y="84">身長 ${H} mm</text><text class="tick" x="354" y="100">肘高 ≈ 0.62 × 身長</text>`;
      s += `<text class="k-note" x="354" y="130">固定台 900 mm との差</text>`;
      s += `<text class="mark-t" x="354" y="150" style="fill:${col}">${diff > 0 ? "+" : ""}${Math.round(diff)} mm</text>`;
      const verdict = Math.abs(diff) <= 50 ? ["固定台でほぼ合う"] : diff > 0 ? ["台が高い", "→ 肩が上がる / 足台"] : ["台が低い", "→ 前かがみ /", "昇降・かさ上げ"];
      verdict.forEach((t, i) => (s += `<text class="mark-t" x="354" y="${180 + i * 18}" style="fill:${col}">${t}</text>`));
      svg.innerHTML = s;
      out.innerHTML = `<p class="tb-note">${label}。体の比率と範囲は説明用の概略値です (靴の高さ約 20〜30 mm は含めていません)。身長 1 450〜1 900 mm を 1 台でカバーするには、およそ 250 mm 以上の昇降範囲が必要になります。</p>`;
    };
    draw();
  },

  /** Revised NIOSH lifting equation calculator. */
  "anim-niosh"(host) {
    const { ctl, svg, out } = frame(host, "NIOSH 持ち上げ式 (改訂版) で推奨重量限界 RWL を求める", 326);
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
      const col = LI <= 1 ? "var(--tb-good)" : LI <= 3 ? "var(--tb-warn)" : "var(--tb-bad)";
      // left: the lift posture at the start (H and V from the sliders)
      let s = panel(6, 6, 236, 268) + `<text class="k-title" x="18" y="26">始点の姿勢</text>`;
      const sc = 1.12, gy = 248, ax = 52; // px per cm, floor, ankle midpoint
      const bx = ax + st.H * sc, by = gy - st.V * sc;
      s += `<rect class="k-ground" x="14" y="${gy}" width="220" height="8"/><line class="k-edge" x1="14" x2="234" y1="${gy}" y2="${gy}"/>`;
      // posture: hips drop and the trunk leans until the hands reach the load
      const hipH = Math.min(86, 42 + st.V * 0.5);
      const hip: [number, number] = [ax - 6, gy - hipH * sc];
      let th = 0, shp: [number, number] = [hip[0], hip[1] - 52 * sc];
      for (; th <= 1.35; th += 0.03) {
        shp = [hip[0] + 52 * sc * Math.sin(th), hip[1] - 52 * sc * Math.cos(th)];
        if (Math.hypot(bx - shp[0], by - shp[1]) <= 58 * sc) break;
      }
      const ank: [number, number] = [ax, gy - 6];
      const kn = ik(ank, hip, 45 * sc, 45 * sc, 1);
      const hand: [number, number] = [bx - 14, by];
      const elb = ik(shp, hand, 30 * sc, 30 * sc, 1);
      const hd: [number, number] = [shp[0] + 15 * sc * Math.sin(th) + 3, shp[1] - 15 * sc * Math.cos(th)];
      s += `<g class="k-shadow">`;
      s += limb([hip, kn, ank], TROUSERS, 12);
      s += `<path d="M${ax - 8},${gy - 7} L${ax + 14},${gy - 7} Q${ax + 18},${gy} ${ax + 12},${gy} L${ax - 10},${gy} Z" fill="#374151" style="stroke:var(--k-line)" stroke-width="0.8"/>`;
      s += limb([hip, shp], SHIRT, 18);
      s += `<ellipse class="k-skin" cx="${n1(hd[0])}" cy="${n1(hd[1])}" rx="8.5" ry="10" transform="rotate(${n1((th * 180) / Math.PI)} ${n1(hd[0])} ${n1(hd[1])})"/>`;
      // the load (box) and the arm in front of it
      s += `<rect class="k-plastic" x="${n1(bx - 18)}" y="${n1(by - 14)}" width="36" height="28" rx="2"/>`;
      s += `<text class="lbl" x="${n1(bx + 2)}" y="${n1(by - 20)}">${st.load} kg</text>`;
      s += limb([shp, elb], SHIRT, 8) + limb([elb, hand], SKIN, 6);
      s += `</g>`;
      // H and V dimensions
      s += `<line class="k-ext" x1="${ax}" x2="${ax}" y1="${gy + 2}" y2="${gy + 20}"/><line class="k-ext" x1="${n1(bx)}" x2="${n1(bx)}" y1="${n1(by + 16)}" y2="${gy + 20}"/>`;
      s += `<line class="k-dimline" x1="${ax}" x2="${n1(bx)}" y1="${gy + 15}" y2="${gy + 15}"/><text class="k-dimtext" x="${n1(bx + 4)}" y="${gy + 20}">H</text>`;
      if (st.V >= 8) {
        s += `<line class="k-ext" x1="${n1(bx + 20)}" x2="${n1(bx + 40)}" y1="${n1(by)}" y2="${n1(by)}"/>`;
        s += `<line class="k-dimline" x1="${n1(bx + 34)}" x2="${n1(bx + 34)}" y1="${gy}" y2="${n1(by)}"/><text class="k-dimtext" x="${n1(bx + 40)}" y="${n1((gy + by) / 2 + 4)}">V</text>`;
      }
      // right: coefficient bars
      s += panel(250, 6, 264, 268) + `<text class="k-title" x="262" y="26">係数 (1.0 が最良)</text>`;
      rows.forEach(([n, v], i) => {
        const y = 38 + i * 22;
        const c = v >= 0.85 ? "var(--tb-good)" : v >= 0.65 ? "var(--tb-warn)" : "var(--tb-bad)";
        s += `<text class="lbl" x="262" y="${y + 11}">${n}</text><rect x="292" y="${y}" width="170" height="13" rx="6.5" style="fill:var(--tb-surface-2);stroke:var(--tb-border)"/>`;
        s += `<rect x="292" y="${y}" width="${n1(Math.max(0, Math.min(1, v)) * 170)}" height="13" rx="6.5" style="fill:${c}"/>`;
        s += `<text class="tick" x="470" y="${y + 11}">${v.toFixed(2)}</text>`;
      });
      s += `<text class="k-note" x="262" y="186">RWL = 23 × HM × VM × DM × AM × FM × CM</text>`;
      s += `<text class="mark-t" x="262" y="206">RWL ≈ ${fmt(RWL)} kg</text>`;
      s += `<text class="mark-t" x="262" y="226" style="fill:${col}">LI = ${st.load} / ${fmt(RWL)} ≈ ${LI.toFixed(2)}</text>`;
      // LI gauge
      const gx = (v: number) => 262 + (Math.min(v, 4) / 4) * 240;
      s += `<rect x="${gx(0)}" y="238" width="${gx(1) - gx(0)}" height="10" style="fill:var(--tb-good)"/><rect x="${gx(1)}" y="238" width="${gx(3) - gx(1)}" height="10" style="fill:var(--tb-warn)"/><rect x="${gx(3)}" y="238" width="${gx(4) - gx(3)}" height="10" style="fill:var(--tb-bad)"/>`;
      s += `<path d="M${n1(gx(LI))},236 l-5,-7 h10 Z" style="fill:var(--tb-text)"/>`;
      [0, 1, 3, 4].forEach((v) => (s += `<text class="tick" x="${gx(v)}" y="263" text-anchor="${v === 0 ? "start" : v === 4 ? "end" : "middle"}">${v}</text>`));
      s += `<text class="mark-t" x="10" y="294" style="fill:${col}">${LI <= 1 ? "LI ≤ 1: 大多数の健康な作業者に許容" : LI <= 3 ? "1 < LI ≤ 3: リスク増。作業の改善を検討" : "LI > 3: 多くの作業者に高リスク。早急に改善"}</text>`;
      s += `<text class="tick" x="10" y="308">H: 足首中点から手までの水平距離 / V: 床から手の高さ / A: 正面からのねじり角</text>`;
      s += `<text class="tick" x="10" y="322">範囲外 (H &lt; 25 は 25 として扱う、H &gt; 63 や V &gt; 175 は係数 0) に注意</text>`;
      svg.innerHTML = s;
    };
    out.innerHTML = `<p class="tb-note">係数式は NIOSH 改訂持ち上げ式 (1991) の SI 版、FM は表の一部 (この範囲では V &lt; 75 と V ≥ 75 で同じ値) を使っています。片手作業、押し引き、極端な温湿度などは式の適用外です。</p>`;
    draw();
  },

  /** Alarm flood vs rationalised, prioritised alarms. */
  "anim-alarmflood"(host) {
    const { ctl, svg, out } = frame(host, "アラームフラッド と 優先度付けしたアラーム", 296);
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
      const blink = 0.5 + 0.5 * Math.sin(now * 6);
      // HMI: bezel + screen + header bar
      let s = `<g class="k-shadow"><rect class="k-part" x="8" y="6" width="340" height="284" rx="10"/></g>`;
      s += `<rect x="18" y="16" width="320" height="264" rx="4" style="fill:var(--tb-surface);stroke:var(--k-line)" stroke-width="1"/>`;
      s += `<rect x="18" y="16" width="320" height="22" rx="4" style="fill:var(--tb-surface-2)"/>`;
      s += `<text class="lbl" x="26" y="31">アラーム一覧</text><text class="tick" x="330" y="31" text-anchor="end">t = ${t.toFixed(1)} s</text>`;
      if (mode === "flood") {
        for (let i = 0; i < n; i++) {
          const y = 42 + i * 14.6;
          const fresh = i >= n - 3;
          s += `<rect x="22" y="${n1(y)}" width="312" height="13" rx="2" style="fill:var(--tb-bad)" opacity="${n1(fresh ? 0.12 + 0.3 * blink : 0.16)}"/>`;
          s += `<rect x="22" y="${n1(y)}" width="3" height="13" style="fill:var(--tb-bad)"/>`;
          s += `<text class="tick" x="30" y="${n1(y + 10.5)}" style="fill:var(--tb-text)">ALM${String(100 + i)} ${flood[i]}</text>`;
        }
      } else if (n > 0) {
        s += `<rect x="22" y="44" width="312" height="44" rx="3" style="fill:var(--tb-bad)"/>`;
        s += `<circle cx="38" cy="58" r="8" style="fill:#fff"/><text x="38" y="62" text-anchor="middle" style="fill:var(--tb-bad);font-size:11px;font-weight:700">高</text>`;
        s += `<text class="mark-t" x="52" y="62" style="fill:#fff">エア圧低下 0.32 MPa (下限 0.45)</text>`;
        s += `<text class="tick" x="30" y="80" style="fill:#fff">対応: 元圧バルブ・フィルタを確認 → 復帰後 リセット</text>`;
        s += `<text class="tick" x="26" y="106">▸ 関連して抑制したアラーム ${Math.max(0, n - 2)} 件 (展開して表示)</text>`;
        if (n > 4) s += `<rect x="22" y="116" width="312" height="22" rx="3" style="fill:var(--tb-warn)" opacity="0.85"/><circle cx="38" cy="127" r="7" style="fill:#fff"/><text x="38" y="131" text-anchor="middle" style="fill:var(--tb-warn);font-size:10px;font-weight:700">中</text><text class="tick" x="52" y="131" style="fill:#fff">工程3 停止中 (原因: エア圧低下)</text>`;
      }
      // counter panel
      const shown = mode === "flood" ? n : n === 0 ? 0 : n > 4 ? 2 : 1;
      s += panel(360, 6, 154, 284);
      s += `<text class="k-note" x="374" y="30">表示中のアラーム</text>`;
      s += `<text class="${shown > 5 ? "k-bad-t" : "k-good-t"}" x="374" y="72" style="font-size:34px">${shown} 件</text>`;
      s += `<text class="tick" x="374" y="102">原因: エア圧低下 1 件</text>`;
      s += `<text class="mark-t" x="374" y="124" style="fill:${mode === "flood" ? "var(--tb-bad)" : "var(--tb-good)"}">${mode === "flood" ? "原因が埋もれる" : "原因と対応が先頭に"}</text>`;
      s += `<text class="k-note" x="374" y="160">優先度: ${prio.join(" / ")}</text>`;
      s += `<text class="k-note" x="374" y="176">目安の比率</text>`;
      // priority ratio bar 5 / 15 / 80 %
      s += `<rect x="374" y="186" width="${n1(126 * 0.05)}" height="12" style="fill:var(--tb-bad)"/><rect x="${n1(374 + 126 * 0.05)}" y="186" width="${n1(126 * 0.15)}" height="12" style="fill:var(--tb-warn)"/><rect x="${n1(374 + 126 * 0.2)}" y="186" width="${n1(126 * 0.8)}" height="12" style="fill:var(--tb-text-3)" opacity="0.6"/>`;
      s += `<text class="tick" x="374" y="214">5 / 15 / 80 %</text>`;
      svg.innerHTML = s;
    };
    out.innerHTML = `<p class="tb-note">エア圧が 1 回下がっただけで、連鎖した結果アラームが 5 秒で 16 件出る例です。整理後は、原因アラームに優先度と対応手順を付け、結果アラームは状態に基づいて抑制 (グループ化) します。</p>`;
    draw(t0 + 6);
    loop(host, (t) => draw(t), () => playing);
  },
};
