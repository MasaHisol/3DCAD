// Animated and hands-on figures for the machine-safety chapters (content/safety2.ts).
// Same conventions as anim.ts: static first frame, stops when the host leaves
// the page, and honours prefers-reduced-motion.

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

// ------------------------------------------------------------- figures ---

export const ANIM6: Record<string, (host: HTMLElement) => void> = {
  /** Pick S, F, P and follow the branch to the required PL. */
  "anim-riskgraph"(host) {
    const { ctl, svg, out } = frame(host, "リスクグラフで PLr を決める (ISO 13849-1 の要約)", 240);
    let S: 1 | 2 = 2, F: 1 | 2 = 2, P: 1 | 2 = 1;
    select(ctl, [["1", "S1 軽傷"], ["2", "S2 重傷・死亡"]], "2", (v) => ((S = Number(v) as 1 | 2), draw()));
    select(ctl, [["1", "F1 まれ・短時間"], ["2", "F2 頻繁・長時間"]], "2", (v) => ((F = Number(v) as 1 | 2), draw()));
    select(ctl, [["1", "P1 回避できる場合あり"], ["2", "P2 ほぼ不可能"]], "1", (v) => ((P = Number(v) as 1 | 2), draw()));
    const draw = () => {
      const x0 = 30, xs = 140, xf = 260, xp = 380, xr = 470;
      const yS = (s: number) => (s === 1 ? 70 : 170);
      const yF = (s: number, f: number) => yS(s) + (f === 1 ? -30 : 30);
      const yP = (s: number, f: number, p: number) => yF(s, f) + (p === 1 ? -13 : 13);
      let g = "";
      const line = (x1: number, y1: number, x2: number, y2: number, on: boolean) =>
        `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${on ? "var(--tb-accent)" : "var(--tb-text-3)"}" stroke-width="${on ? 3.5 : 1}" opacity="${on ? 1 : 0.6}"/>`;
      for (const s of [1, 2]) {
        g += line(x0, 120, xs, yS(s), s === S);
        g += `<text class="tick" x="${xs - 8}" y="${yS(s) - 6}" text-anchor="end">S${s}</text>`;
        for (const f of [1, 2]) {
          g += line(xs, yS(s), xf, yF(s, f), s === S && f === F);
          g += `<text class="tick" x="${xf - 8}" y="${yF(s, f) - 4}" text-anchor="end">F${f}</text>`;
          for (const p of [1, 2]) {
            const on = s === S && f === F && p === P;
            const y = yP(s, f, p);
            g += line(xf, yF(s, f), xp, y, on);
            g += `<text class="tick" x="${xp - 6}" y="${y - 3}" text-anchor="end">P${p}</text>`;
            const pl = requiredPL(s as 1 | 2, f as 1 | 2, p as 1 | 2);
            g += line(xp, y, xr - 14, y, on);
            g += `<circle cx="${xr}" cy="${y}" r="11" fill="${on ? "var(--tb-accent)" : "var(--tb-surface-2)"}" stroke="var(--tb-text-3)"/><text class="lbl" x="${xr}" y="${y + 4}" text-anchor="middle" ${on ? 'fill="#fff"' : ""}>${pl}</text>`;
          }
        }
      }
      g += `<circle class="mark" cx="${x0}" cy="120" r="6"/><text class="tick" x="${x0}" y="140" text-anchor="middle">開始</text>`;
      g += `<text class="tick" x="${xr}" y="16" text-anchor="middle">PLr</text>`;
      svg.innerHTML = g;
      const pl = requiredPL(S, F, P);
      out.innerHTML = `<p class="tb-note">S${S} → F${F} → P${P} のとき <b>PLr = ${pl}</b>。達成する PL が ${pl} 以上になるよう、カテゴリ・MTTF<sub>D</sub>・DC・CCF を設計します。規格の要約です。実際には適用版の原文を確認してください。</p>`;
    };
    draw();
  },

  /** A hand approaches a light curtain; the machine must stop before the hand reaches the hazard. */
  "anim-lightcurtain"(host) {
    const { ctl, svg, out } = frame(host, "ライトカーテンの安全距離 S = K×T + C (ISO 13855 の要約)", 220);
    let T = 0.2, d = 14, place = 400;
    let playing = !reduced();
    let t0 = performance.now() / 1000;
    slider(ctl, "停止時間 T (s)", 0.05, 0.5, T, 0.01, (v) => ((T = v), restart()));
    select(ctl, [["14", "検出能力 d = 14 mm"], ["20", "d = 20 mm"], ["30", "d = 30 mm"]], "14", (v) => ((d = Number(v)), restart()));
    slider(ctl, "設置距離 (mm)", 100, 800, place, 10, (v) => ((place = v), restart()));
    const pb = button(ctl, playing ? "■ 止める" : "▶ 動かす", () => ((playing = !playing), (pb.textContent = playing ? "■ 止める" : "▶ 動かす"), restart()));
    const restart = () => ((t0 = performance.now() / 1000), draw(playing ? 0 : -1));
    const px = 0.42; // px per mm
    const hz = 470; // hazard x
    // time-based: hand moves at 2000 mm/s (K for hand approach)
    const draw = (time: number) => {
      const S = curtainDistance(T, d);
      const curtain = hz - place * px;
      const startX = curtain - 120;
      const v = 2000 * px; // px/s
      const tCross = (curtain - startX) / v;
      let hand: number, stopped = false, hit = false;
      let phase = "";
      if (time < 0) {
        hand = curtain - 6;
        phase = "静止図: 手が光の幕に達した瞬間";
      } else {
        const tt = time % (tCross + T + 1.2);
        const reach = Math.min(tt, tCross + T);
        hand = startX + v * reach;
        if (hand >= hz) (hand = hz), (hit = tt >= (hz - startX) / v);
        if (tt >= tCross + T) stopped = true;
        phase = tt < tCross ? "接近中" : tt < tCross + T ? "検出 → 停止中" : "";
        if (hit) phase = "危険区域に到達 — 停止が間に合わない";
        else if (stopped) phase = "停止完了 — 手は届かなかった";
      }
      const ok = place >= S;
      let g = `<line x1="20" y1="170" x2="510" y2="170" stroke="var(--tb-text-3)"/>`;
      g += `<rect x="${hz}" y="50" width="40" height="120" fill="var(--tb-bad)" opacity="${stopped && !hit ? 0.15 : 0.35}" stroke="var(--tb-bad)"/><text class="tick" x="${hz + 20}" y="44" text-anchor="middle">危険区域</text>`;
      for (let y = 60; y <= 160; y += 10) g += `<circle cx="${curtain}" cy="${y}" r="1.6" fill="var(--tb-warn)"/>`;
      g += `<line x1="${curtain}" y1="55" x2="${curtain}" y2="165" stroke="var(--tb-warn)" stroke-width="1" opacity="0.6"/><text class="tick" x="${curtain}" y="44" text-anchor="middle">光の幕</text>`;
      const sx = hz - S * px;
      g += `<line class="guide" x1="${sx}" y1="60" x2="${sx}" y2="170"/><text class="tick" x="${sx}" y="186" text-anchor="middle">必要 S</text>`;
      g += `<line class="guide" x1="${curtain}" y1="200" x2="${hz}" y2="200"/><text class="tick" x="${(curtain + hz) / 2}" y="214" text-anchor="middle">設置 ${place} mm</text>`;
      g += `<path d="M${Math.max(20, hand - 160)},115 L${hand - 18},115" stroke="var(--tb-accent)" stroke-width="14" stroke-linecap="round" opacity="0.5"/><circle cx="${hand - 10}" cy="115" r="10" fill="var(--tb-accent)" opacity="${hit ? 1 : 0.8}"/>`;
      if (phase) g += `<text class="mark-t" x="20" y="22">${phase}</text>`;
      svg.innerHTML = g;
      out.innerHTML = `<p class="tb-note">T = ${T.toFixed(2)} s、C = ${Math.max(0, 8 * (d - 14))} mm → 必要な最小安全距離 <b>S = ${Math.round(S)} mm</b>。設置距離 ${place} mm は <b style="color:var(${ok ? "--tb-good" : "--tb-bad"})">${ok ? "十分" : "不足"}</b>。手の速さ K = 2 000 mm/s で動かしています (S が 500 mm を超えると K = 1 600 での再計算が認められるため、図の手が届いても規格上は足りる場合があります)。規格の要約であり、原文を確認してください。</p>`;
    };
    draw(-1);
    loop(host, (t) => draw(t - t0), () => playing);
  },

  /** Opening an interlocked guard stops the machine; closing alone does not restart it. */
  "anim-interlock"(host) {
    const { ctl, svg, out } = frame(host, "インターロック付きガード: 開けると止まり、閉じても勝手に動かない", 220);
    let open = false, running = true, speed = 1, angle = 0;
    let lock = false;
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
      bGuard.textContent = open ? "ガードを閉じる" : "ガードを開ける";
      status();
      draw();
    };
    const status = (msg?: string) => {
      const s = msg ?? (open ? "ガードが開いている: 駆動を遮断 (停止)" : running ? "運転中" : speed > 0.02 ? "停止指令 → 惰性で減速中" : "停止中: 閉じただけでは再起動しない。起動ボタンで再開");
      out.innerHTML = `<p class="tb-note">${s}。停止に時間がかかる機械では、止まるまで開かないガードロックを使います。</p>`;
    };
    const draw = () => {
      const cx = 330, cy = 110;
      let g = `<rect x="200" y="30" width="270" height="160" rx="6" fill="none" stroke="var(--tb-text-3)"/>`;
      g += `<circle cx="${cx}" cy="${cy}" r="55" class="sec"/>`;
      for (let k = 0; k < 3; k++) {
        const a = angle + (k * 2 * Math.PI) / 3;
        g += `<line x1="${cx}" y1="${cy}" x2="${cx + 50 * Math.cos(a)}" y2="${cy + 50 * Math.sin(a)}" stroke="var(--tb-text-3)" stroke-width="5" stroke-linecap="round"/>`;
      }
      g += `<text class="tick" x="${cx}" y="185" text-anchor="middle">回転体</text>`;
      const gx = open ? 130 : 200;
      g += `<rect x="${gx - 6}" y="30" width="12" height="160" fill="${open ? "var(--tb-warn)" : "var(--tb-good)"}" opacity="0.6" stroke="var(--tb-text-3)"/><text class="tick" x="${gx}" y="22" text-anchor="middle">ガード</text>`;
      g += `<rect x="186" y="96" width="16" height="28" fill="var(--tb-surface-2)" stroke="var(--tb-text-3)"/><text class="tick" x="178" y="140" text-anchor="end">スイッチ</text>`;
      if (lock) g += `<text class="tick" x="178" y="156" text-anchor="end">${speed > 0.02 && !open ? "ロック中" : "ロック解除"}</text>`;
      g += `<circle cx="60" cy="60" r="12" fill="${running ? "var(--tb-good)" : "var(--tb-bad)"}"/><text class="tick" x="80" y="64" text-anchor="start">${running ? "運転" : "停止"}</text>`;
      g += `<text class="tick" x="40" y="100" text-anchor="start">速度 ${Math.round(speed * 100)} %</text>`;
      svg.innerHTML = g;
    };
    status();
    draw();
    loop(host, (_t, dt) => {
      const target = running ? 1 : 0;
      speed += (target - speed) * Math.min(1, dt * (running ? 2 : 0.6));
      if (speed < 0.005) speed = 0;
      angle += speed * dt * 8;
      if (!still) { draw(); if (!running && !open) status(); }
    }, () => !still);
  },
};
