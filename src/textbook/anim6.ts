// Animated and hands-on figures for the machine-safety chapters (content/safety2.ts).
// Same conventions as anim.ts: static first frame, stops when the host leaves
// the page, and honours prefers-reduced-motion.

import { frame, button, slider, select, loop, reduced } from "./animkit";

/** ISO 13849-1 risk graph (summarised): S/F/P -> PLr. */
export function requiredPL(s: 1 | 2, f: 1 | 2, p: 1 | 2): string {
  return "abcde"[(s - 1) * 2 + (f - 1) + (p - 1)];
}

/** ISO 13855 (summarised) minimum distance for a light curtain approached normally, d <= 40 mm. */
export function curtainDistance(tSec: number, dMm: number): number {
  const c = Math.max(0, 8 * (dMm - 14));
  let s = 2000 * tSec + c;
  if (s < 100) s = 100;
  else if (s > 500) s = Math.max(500, 1600 * tSec + c);
  return s;
}

// ------------------------------------------------------------- helpers ---
const n1 = (v: number) => Math.round(v * 10) / 10;
const ease = (u: number) => {
  const v = Math.max(0, Math.min(1, u));
  return v * v * (3 - 2 * v);
};
/** Colour for a performance level: a, b low (green), c middle (amber), d, e high (red). */
const plCol = (pl: string) => (pl <= "b" ? "var(--tb-good)" : pl === "c" ? "var(--tb-warn)" : "var(--tb-bad)");

// ------------------------------------------------------------- figures ---

export const ANIM6: Record<string, (host: HTMLElement) => void> = {
  /** Pick S, F, P and follow the branch to the required PL. */
  "anim-riskgraph"(host) {
    const { ctl, svg, out } = frame(host, "リスクグラフで PLr を決める (ISO 13849-1 の要約)", 256);
    let S: 1 | 2 = 2, F: 1 | 2 = 2, P: 1 | 2 = 1;
    select(ctl, [["1", "S1 軽傷"], ["2", "S2 重傷・死亡"]], "2", (v) => ((S = Number(v) as 1 | 2), draw()));
    select(ctl, [["1", "F1 まれ・短時間"], ["2", "F2 頻繁・長時間"]], "2", (v) => ((F = Number(v) as 1 | 2), draw()));
    select(ctl, [["1", "P1 回避できる場合あり"], ["2", "P2 ほぼ不可能"]], "1", (v) => ((P = Number(v) as 1 | 2), draw()));
    const draw = () => {
      const x0 = 34, xs = 150, xf = 270, xp = 390, xr = 476, yc = 140;
      const yS = (s: number) => (s === 1 ? 88 : 192);
      const yF = (s: number, f: number) => yS(s) + (f === 1 ? -28 : 28);
      const yP = (s: number, f: number, p: number) => yF(s, f) + (p === 1 ? -12 : 12);
      // column headings
      let g = "";
      const head = (x: number, t: string) => `<text class="k-note" x="${x}" y="22" text-anchor="middle">${t}</text>`;
      g += head((x0 + xs) / 2, "重大さ S") + head((xs + xf) / 2, "頻度・時間 F") + head((xf + xp) / 2, "回避 P") + head(xr, "PLr");
      g += `<line class="grid" x1="20" x2="500" y1="32" y2="32"/>`;
      const seg = (x1: number, y1: number, x2: number, y2: number, on: boolean) => {
        const d = `M${x1},${y1} C${n1(x1 + (x2 - x1) * 0.5)},${y1} ${n1(x1 + (x2 - x1) * 0.5)},${y2} ${x2},${y2}`;
        return on
          ? `<path d="${d}" fill="none" class="k-glow" style="stroke:var(--tb-accent)" stroke-width="4"/>`
          : `<path d="${d}" fill="none" style="stroke:var(--k-line-2)" stroke-width="1.2" opacity="0.7"/>`;
      };
      const node = (x: number, y: number, on: boolean) => `<circle cx="${x}" cy="${y}" r="4.5" style="fill:${on ? "var(--tb-accent)" : "var(--tb-surface)"};stroke:${on ? "var(--tb-accent)" : "var(--k-line-2)"}" stroke-width="1.4"/>`;
      const tag = (x: number, y: number, t: string, on: boolean) =>
        `<text class="${on ? "mark-t" : "tick"}" x="${x}" y="${y}" text-anchor="end" style="stroke:var(--tb-surface);stroke-width:3px${on ? ";fill:var(--tb-accent)" : ""}">${t}</text>`;
      let nodes = "", tags = "";
      for (const s of [1, 2]) {
        const sOn = s === S;
        g += seg(x0, yc, xs, yS(s), sOn);
        tags += tag(xs - 10, yS(s) - 8, `S${s}`, sOn);
        for (const f of [1, 2]) {
          const fOn = sOn && f === F;
          g += seg(xs, yS(s), xf, yF(s, f), fOn);
          tags += tag(xf - 10, yF(s, f) - 7, `F${f}`, fOn);
          for (const p of [1, 2]) {
            const on = fOn && p === P;
            const y = yP(s, f, p);
            g += seg(xf, yF(s, f), xp, y, on);
            tags += tag(xp + 26, y - 5, `P${p}`, on);
            const pl = requiredPL(s as 1 | 2, f as 1 | 2, p as 1 | 2);
            g += on ? `<line x1="${xp}" y1="${y}" x2="${xr - 13}" y2="${y}" style="stroke:var(--tb-accent)" stroke-width="4"/>` : `<line x1="${xp}" y1="${y}" x2="${xr - 11}" y2="${y}" style="stroke:var(--k-line-2)" stroke-width="1" opacity="0.7"/>`;
            nodes += on
              ? `<circle class="k-glow" cx="${xr}" cy="${y}" r="12" style="fill:${plCol(pl)}"/><text class="k-badge-t" x="${xr}" y="${y + 4}" text-anchor="middle">${pl}</text>`
              : `<circle cx="${xr}" cy="${y}" r="10" style="fill:var(--tb-surface);stroke:${plCol(pl)}" stroke-width="1.4" opacity="0.85"/><text class="tick" x="${xr}" y="${y + 4}" text-anchor="middle">${pl}</text>`;
          }
          nodes += node(xf, yF(s, f), fOn);
        }
        nodes += node(xs, yS(s), sOn);
      }
      g += nodes + tags;
      g += `<circle class="mark" cx="${x0}" cy="${yc}" r="7" style="stroke:var(--tb-surface)" stroke-width="2"/><text class="tick" x="${x0}" y="${yc + 22}" text-anchor="middle">開始</text>`;
      // low ↔ high bar beside the PL column
      g += `<text class="tick" x="${xr + 18}" y="50" style="fill:var(--tb-good)">低</text><text class="tick" x="${xr + 18}" y="246" style="fill:var(--tb-bad)">高</text>`;
      svg.innerHTML = g;
      const pl = requiredPL(S, F, P);
      out.innerHTML = `<p class="tb-note">S${S} → F${F} → P${P} のとき <b>PLr = ${pl}</b>。達成する PL が ${pl} 以上になるよう、カテゴリ・MTTF<sub>D</sub>・DC・CCF を設計します。規格の要約です。実際には適用版の原文を確認してください。</p>`;
    };
    draw();
  },

  /** A hand approaches a light curtain; the machine must stop before the hand reaches the hazard. */
  "anim-lightcurtain"(host) {
    const { ctl, svg, out } = frame(host, "ライトカーテンの安全距離 S = K×T + C (ISO 13855 の要約)", 262);
    let T = 0.2, d = 14, place = 400;
    let playing = !reduced();
    let t0 = performance.now() / 1000;
    slider(ctl, "停止時間 T (s)", 0.05, 0.5, T, 0.01, (v) => ((T = v), restart()));
    select(ctl, [["14", "検出能力 d = 14 mm"], ["20", "d = 20 mm"], ["30", "d = 30 mm"]], "14", (v) => ((d = Number(v)), restart()));
    slider(ctl, "設置距離 (mm)", 100, 800, place, 10, (v) => ((place = v), restart()));
    const pb = button(ctl, playing ? "■ 止める" : "▶ 動かす", () => ((playing = !playing), (pb.textContent = playing ? "■ 止める" : "▶ 動かす"), restart()));
    const restart = () => ((t0 = performance.now() / 1000), draw(playing ? 0 : -1));
    const px = 0.42; // px per mm
    const hz = 448; // hazard x (front edge of the die)
    const gy = 196; // floor / table line
    // time-based: hand moves at 2000 mm/s (K for hand approach)
    const draw = (time: number) => {
      const S = curtainDistance(T, d);
      const curtain = hz - place * px;
      const startX = curtain - 120;
      const v = 2000 * px; // px/s
      const tCross = (curtain - startX) / v;
      let hand: number, stopped = false, hit = false, detected = false;
      let phase = "";
      let ram = 0; // 0 = top, 1 = closed
      if (time < 0) {
        hand = curtain - 6;
        detected = true;
        phase = "静止図: 手が光の幕に達した瞬間";
        ram = 0.55;
      } else {
        const tt = time % (tCross + T + 1.2);
        const reach = Math.min(tt, tCross + T);
        hand = startX + v * reach;
        if (hand >= hz) (hand = hz), (hit = tt >= (hz - startX) / v);
        if (tt >= tCross + T) stopped = true;
        detected = tt >= tCross;
        phase = tt < tCross ? "接近中" : tt < tCross + T ? "検出 → 停止中" : "";
        if (hit) phase = "危険区域に到達 — 停止が間に合わない";
        else if (stopped) phase = "停止完了 — 手は届かなかった";
        // the ram keeps cycling until the stop is complete, then freezes
        const tr = Math.min(tt, tCross + T);
        ram = 0.5 - 0.5 * Math.cos(tr * 2 * Math.PI * 0.9);
      }
      const ok = place >= S;
      let g = "";
      if (phase) g += `<text class="${hit ? "k-bad-t" : stopped ? "k-good-t" : "mark-t"}" x="10" y="18">${phase}</text>`;
      // table / floor
      g += `<rect class="k-ground" x="10" y="${gy}" width="500" height="10"/><line class="k-edge" x1="10" x2="510" y1="${gy}" y2="${gy}"/>`;
      // press: frame, ram, die; hazard zone between ram and die
      g += `<g class="k-shadow"><rect class="k-part" x="484" y="26" width="28" height="${gy - 26}" rx="3"/>`;
      g += `<rect class="k-part" x="${hz}" y="${gy - 22}" width="48" height="22" rx="2"/>`;
      const ramY = 40 + ram * 70;
      g += `<rect class="k-part-h" x="${hz + 14}" y="30" width="20" height="${n1(ramY - 30)}"/>`;
      g += `<rect class="k-part" x="${hz + 2}" y="${n1(ramY)}" width="44" height="26" rx="2"/></g>`;
      g += `<rect x="${hz}" y="${n1(ramY + 28)}" width="48" height="${n1(Math.max(0, gy - 24 - ramY - 28))}" style="fill:var(--tb-bad)" opacity="${stopped && !hit ? 0.1 : 0.22}"/>`;
      g += `<text class="tick" x="${hz + 6}" y="${gy + 26}" style="fill:var(--tb-bad)">危険区域</text>`;
      // light curtain post with beam LEDs
      g += `<g class="k-shadow"><rect class="k-alu" x="${n1(curtain - 5)}" y="44" width="10" height="${gy - 44}" rx="3"/></g>`;
      for (let y = 54; y <= gy - 10; y += 10) g += `<circle cx="${n1(curtain)}" cy="${y}" r="2.2" style="fill:${detected ? "var(--tb-bad)" : "var(--tb-warn)"}"/>`;
      g += `<rect x="${n1(curtain + 5)}" y="48" width="4" height="${gy - 52}" style="fill:${detected ? "var(--tb-bad)" : "var(--tb-warn)"}" opacity="0.25"/>`;
      g += `<text class="tick" x="${n1(curtain)}" y="38" text-anchor="middle">光の幕</text>`;
      // the arm: sleeve, forearm and hand
      const hy = 120;
      const sx0 = Math.max(12, hand - 190);
      g += `<g class="k-shadow"><rect class="k-accent" x="${n1(sx0)}" y="${hy - 14}" width="${n1(Math.max(0, hand - 44 - sx0))}" height="28" rx="10"/>`;
      g += `<rect class="k-skin" x="${n1(hand - 50)}" y="${hy - 9}" width="34" height="18" rx="8"/>`;
      g += `<path class="k-skin" d="M${n1(hand - 22)},${hy - 11} L${n1(hand - 6)},${hy - 9} Q${n1(hand + 1)},${hy - 7} ${n1(hand)},${hy} Q${n1(hand + 1)},${hy + 7} ${n1(hand - 6)},${hy + 8} L${n1(hand - 22)},${hy + 10} Z"/>`;
      g += `<path class="k-skin" d="M${n1(hand - 20)},${hy - 10} q4,-9 12,-7" fill="none"/></g>`;
      if (hit) g += `<circle class="k-glow" cx="${n1(hand)}" cy="${hy}" r="9" fill="none" style="stroke:var(--tb-bad)" stroke-width="3"/>`;
      // dimensions: installed distance and the required S
      g += `<line class="k-ext" x1="${n1(curtain)}" x2="${n1(curtain)}" y1="${gy + 2}" y2="${gy + 40}"/><line class="k-ext" x1="${hz}" x2="${hz}" y1="${gy + 2}" y2="${gy + 62}"/>`;
      g += `<line class="k-dimline" x1="${n1(curtain)}" x2="${hz}" y1="${gy + 34}" y2="${gy + 34}"/>`;
      g += `<text class="k-dimtext" x="${n1((curtain + hz) / 2)}" y="${gy + 29}" text-anchor="middle" style="stroke:var(--tb-surface);stroke-width:3px">設置 ${place} mm</text>`;
      const sxp = hz - S * px;
      const sc = ok ? "var(--tb-good)" : "var(--tb-bad)";
      g += `<line x1="${n1(sxp)}" x2="${n1(sxp)}" y1="${gy - 120}" y2="${gy + 62}" style="stroke:${sc}" stroke-width="1.2" stroke-dasharray="4 3"/>`;
      g += `<line x1="${n1(sxp)}" x2="${hz}" y1="${gy + 56}" y2="${gy + 56}" style="stroke:${sc}" stroke-width="1.2" marker-start="url(#${ok ? "k-arrow-green" : "k-arrow-red"})" marker-end="url(#${ok ? "k-arrow-green" : "k-arrow-red"})"/>`;
      const sLabX = sxp - 6 > 130 ? sxp - 6 : sxp + 6;
      g += `<text class="${ok ? "k-good-t" : "k-bad-t"}" x="${n1(sLabX)}" y="${gy + 52}" text-anchor="${sxp - 6 > 130 ? "end" : "start"}" style="stroke:var(--tb-surface);stroke-width:3px">必要 S = ${Math.round(S)} mm</text>`;
      svg.innerHTML = g;
      out.innerHTML = `<p class="tb-note">T = ${T.toFixed(2)} s、C = ${Math.max(0, 8 * (d - 14))} mm → 必要な最小安全距離 <b>S = ${Math.round(S)} mm</b>。設置距離 ${place} mm は <b style="color:var(${ok ? "--tb-good" : "--tb-bad"})">${ok ? "十分" : "不足"}</b>。手の速さ K = 2 000 mm/s で動かしています (S が 500 mm を超えると K = 1 600 での再計算が認められるため、図の手が届いても規格上は足りる場合があります)。規格の要約であり、原文を確認してください。</p>`;
    };
    draw(-1);
    loop(host, (t) => draw(t - t0), () => playing);
  },

  /** Opening an interlocked guard stops the machine; closing alone does not restart it. */
  "anim-interlock"(host) {
    const { ctl, svg, out } = frame(host, "インターロック付きガード: 開けると止まり、閉じても勝手に動かない", 226);
    let open = false, running = true, speed = 1, angle = 0;
    let lock = false;
    let gpos = 0; // 0 = closed, 1 = fully open (eased)
    const still = reduced();
    const bGuard = button(ctl, "ガードを開ける", () => toggle());
    button(ctl, "▶ 起動", () => { if (!open) { running = true; if (still) speed = 1; } status(); draw(); }, "primary");
    const lockSel = select(ctl, [["0", "通常のインターロック"], ["1", "ガードロック付き"]], "0", (v) => { lock = v === "1"; status(); draw(); });
    void lockSel;
    const toggle = () => {
      if (!open && lock && speed > 0.02) { status("惰性回転中のためロックされて開きません"); return; }
      open = !open;
      if (open) running = false;
      if (still && !running) speed = 0;
      if (still) gpos = open ? 1 : 0;
      bGuard.textContent = open ? "ガードを閉じる" : "ガードを開ける";
      status();
      draw();
    };
    const status = (msg?: string) => {
      const s = msg ?? (open ? "ガードが開いている: 駆動を遮断 (停止)" : running ? "運転中" : speed > 0.02 ? "停止指令 → 惰性で減速中" : "停止中: 閉じただけでは再起動しない。起動ボタンで再開");
      out.innerHTML = `<p class="tb-note">${s}。停止に時間がかかる機械では、止まるまで開かないガードロックを使います。</p>`;
    };
    const draw = () => {
      const cx = 336, cy = 112;
      const ge = ease(gpos);
      // machine enclosure (back wall, frame)
      let g = `<rect class="k-ground" x="196" y="196" width="284" height="10"/>`;
      g += `<g class="k-shadow"><rect x="200" y="28" width="276" height="168" rx="6" style="fill:var(--tb-surface-2);stroke:var(--k-line)" stroke-width="1.6"/></g>`;
      // rotating disc with three arms (a cutter / rotor)
      g += `<g class="k-shadow"><circle class="k-part" cx="${cx}" cy="${cy}" r="58"/></g>`;
      for (let k = 0; k < 3; k++) {
        const a = angle + (k * 2 * Math.PI) / 3;
        const x2 = cx + 50 * Math.cos(a), y2 = cy + 50 * Math.sin(a);
        g += `<line x1="${cx}" y1="${cy}" x2="${n1(x2)}" y2="${n1(y2)}" style="stroke:var(--k-line)" stroke-width="7"/>`;
        g += `<line x1="${cx}" y1="${cy}" x2="${n1(x2)}" y2="${n1(y2)}" style="stroke:var(--k-steel-1)" stroke-width="3.5"/>`;
      }
      g += `<circle class="k-sphere" cx="${cx}" cy="${cy}" r="9"/>`;
      if (speed > 0.05) g += `<path class="k-move" d="M${cx + 46},${cy - 50} A68,68 0 0 1 ${cx + 66},${cy - 8}" opacity="${n1(Math.min(1, speed))}"/>`;
      g += `<text class="tick" x="${cx}" y="188" text-anchor="middle">回転体</text>`;
      // interlock switch on the frame, actuator tongue on the guard
      g += `<g class="k-shadow"><rect class="k-part" x="184" y="96" width="18" height="30" rx="2"/></g>`;
      g += `<circle cx="193" cy="104" r="3" style="fill:${!open && gpos < 0.02 ? "var(--tb-good)" : "var(--tb-bad)"}"/>`;
      if (lock) g += `<rect x="186" y="114" width="14" height="8" rx="2" style="fill:${speed > 0.02 && !open ? "var(--tb-warn)" : "var(--tb-surface)"};stroke:var(--k-line)" stroke-width="0.8"/>`;
      g += `<text class="tick" x="176" y="140" text-anchor="end">スイッチ</text>`;
      if (lock) g += `<text class="tick" x="176" y="156" text-anchor="end" style="fill:${speed > 0.02 && !open ? "var(--tb-warn)" : "var(--tb-text-3)"}">${speed > 0.02 && !open ? "ロック中" : "ロック解除"}</text>`;
      // guard panel (sliding) with a window
      const gx = 200 - ge * 82;
      g += `<g class="k-shadow"><rect class="k-alu" x="${n1(gx - 7)}" y="28" width="14" height="168" rx="3"/></g>`;
      g += `<rect x="${n1(gx - 3)}" y="50" width="6" height="40" rx="2" style="fill:var(--tb-accent)" opacity="0.35"/>`;
      g += `<rect x="${n1(gx + 5)}" y="104" width="8" height="12" rx="1.5" style="fill:var(--k-line)"/>`;
      g += `<text class="tick" x="${n1(gx)}" y="20" text-anchor="middle" style="fill:${open ? "var(--tb-warn)" : "var(--tb-good)"}">ガード</text>`;
      if (ge > 0.05) g += `<line class="k-move" x1="${n1(gx + 12)}" x2="${n1(gx + 40)}" y1="210" y2="210" opacity="0.8" style="marker-end:none;marker-start:url(#k-arrow-blue)"/>`;
      // status lamp and speed gauge
      g += `<circle class="k-glow" cx="30" cy="44" r="11" style="fill:${running ? "var(--tb-good)" : "var(--tb-bad)"}"/>`;
      g += `<text class="mark-t" x="48" y="49">${running ? "運転" : "停止"}</text>`;
      g += `<text class="tick" x="18" y="84">速度 ${Math.round(speed * 100)} %</text>`;
      g += `<rect x="18" y="92" width="76" height="10" rx="5" style="fill:var(--tb-surface-2);stroke:var(--tb-border)"/><rect x="18" y="92" width="${n1(76 * speed)}" height="10" rx="5" style="fill:${speed > 0.02 ? "var(--tb-accent)" : "var(--tb-text-3)"}"/>`;
      svg.innerHTML = g;
    };
    status();
    draw();
    loop(host, (_t, dt) => {
      const target = running ? 1 : 0;
      speed += (target - speed) * Math.min(1, dt * (running ? 2 : 0.6));
      if (speed < 0.005) speed = 0;
      angle += speed * dt * 8;
      gpos += ((open ? 1 : 0) - gpos) * Math.min(1, dt * 6);
      if (!still) { draw(); if (!running && !open) status(); }
    }, () => !still);
  },
};
