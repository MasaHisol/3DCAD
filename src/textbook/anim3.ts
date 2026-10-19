// Animated and hands-on figures for the industrial-design chapters (<div data-widget="anim-...">).
// Same conventions as anim.ts: plain SVG, static first frame, stops when off the page.

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

const f1 = (v: number) => v.toFixed(1);

export const ANIM3: Record<string, (host: HTMLElement) => void> = {
  /** Visual weight: base/top width ratio and height ratio vs. perceived stability. */
  "anim-visualweight"(host) {
    const { ctl, svg, out } = frame(host, "視覚的重さと安定感 — 裾の広がりと縦横比", 230);
    let top = 0.7, hr = 1.618, playing = !reduced(), golden = true;
    const pb = button(ctl, playing ? "■ 止める" : "▶ 動かす", () => ((playing = !playing), (pb.textContent = playing ? "■ 止める" : "▶ 動かす")));
    const ts = slider(ctl, "上幅 / 下幅", 0.4, 1.6, top, 0.05, (v) => ((top = v), (playing = false), (pb.textContent = "▶ 動かす"), draw()));
    slider(ctl, "高さ / 下幅", 0.6, 2.4, hr, 0.01, (v) => ((hr = v), draw()));
    button(ctl, "黄金比ガイド", () => ((golden = !golden), draw()));
    const draw = () => {
      const base = 120, cx = 150, gy = 200;
      const H = Math.min(175, base * hr * 0.6);
      const tw = base * top;
      const pts = `${cx - base / 2},${gy} ${cx + base / 2},${gy} ${cx + tw / 2},${gy - H} ${cx - tw / 2},${gy - H}`;
      // centroid height of trapezoid from base
      const cy = (H * (base + 2 * tw)) / (3 * (base + tw));
      const tilt = top > 1 ? Math.min(6, (top - 1) * 10) : 0;
      let s = `<line class="guide" x1="20" x2="300" y1="${gy}" y2="${gy}"/>`;
      s += `<g transform="rotate(${tilt} ${cx + base / 2} ${gy})"><polygon points="${pts}" fill="var(--tb-surface-2)" stroke="currentColor" stroke-width="2"/>`;
      s += `<circle cx="${cx}" cy="${gy - cy}" r="5" fill="var(--tb-accent)"/><line x1="${cx}" x2="${cx}" y1="${gy - cy}" y2="${gy}" stroke="var(--tb-accent)" stroke-dasharray="3 3"/></g>`;
      if (golden) {
        const gH = Math.min(175, base * 1.618 * 0.6);
        s += `<rect x="${cx - base / 2}" y="${gy - gH}" width="${base}" height="${gH}" fill="none" stroke="var(--tb-warn)" stroke-dasharray="5 4"/>`;
        s += `<text class="tick" x="${cx + base / 2 + 4}" y="${gy - gH + 10}">1 : 1.618 (表示上 0.6 倍)</text>`;
      }
      const ratio = cy / H;
      const verdict = top > 1.05 ? "不安定 (頭が重い)" : top < 0.6 ? "とても安定 (重厚・どっしり)" : top < 0.95 ? "安定 (落ち着き)" : "中立 (直方体)";
      s += `<text class="lbl" x="330" y="50">重心高さ / 全高 = ${ratio.toFixed(2)}</text>`;
      s += `<text class="lbl" x="330" y="80">見え方: ${verdict}</text>`;
      s += `<rect x="330" y="100" width="160" height="12" fill="var(--tb-surface-2)" stroke="currentColor"/>`;
      s += `<rect x="330" y="100" width="${Math.max(0, Math.min(160, (0.6 - ratio) / 0.25 * 160))}" height="12" fill="var(--tb-accent)"/>`;
      s += `<text class="tick" x="330" y="128">安定感の目安 (重心が低いほど長い)</text>`;
      s += `<text class="tick" x="330" y="160">高さ比 ${hr.toFixed(2)}${Math.abs(hr - 1.618) < 0.05 ? " ≈ 黄金比" : Math.abs(hr - 1.414) < 0.05 ? " ≈ 白銀比" : ""}</text>`;
      svg.innerHTML = s;
    };
    out.innerHTML = `<p class="tb-note">重心 (橙の点) が低いほど人は「安定・重い」と感じ、上が広いと物理的に倒れなくても不安を感じます。卓上機器は裾を少し絞る (上幅/下幅 0.9 前後) と軽快に、大きく広げると重厚に見えます。</p>`;
    draw();
    loop(host, (t) => {
      top = 1 + 0.5 * Math.sin(t * 0.6);
      ts.value = String(top.toFixed(2));
      ts.dispatchEvent(new Event("input"));
      playing = true;
      pb.textContent = "■ 止める";
    }, () => playing);
  },

  /** Gap & flush between two panels: reflection line break and perceived quality. */
  "anim-gapflush"(host) {
    const { ctl, svg, out } = frame(host, "見切りの隙間と段差 (ギャップ & フラッシュ)", 230);
    let gap = 0.6, flush = 0.3, taper = 0.2;
    slider(ctl, "隙間 mm", 0.2, 2.0, gap, 0.1, (v) => ((gap = v), draw()));
    slider(ctl, "段差 mm", -0.6, 0.6, flush, 0.05, (v) => ((flush = v), draw()));
    slider(ctl, "隙間の不均一 mm", 0, 0.6, taper, 0.05, (v) => ((taper = v), draw()));
    let phase = 0, playing = !reduced();
    const pb = button(ctl, playing ? "■ 光を止める" : "▶ 光を動かす", () => ((playing = !playing), (pb.textContent = playing ? "■ 光を止める" : "▶ 光を動かす")));
    const draw = () => {
      const k = 20; // px per mm (exaggerated)
      const midX = 260, y0 = 30, y1 = 150;
      const gTop = gap * k, gBot = (gap + taper) * k;
      let s = "";
      // left panel (reference) and right panel (offset by flush in "depth" -> drawn as shading + line shift)
      s += `<polygon points="30,${y0} ${midX - gTop / 2},${y0} ${midX - gBot / 2},${y1} 30,${y1}" fill="var(--tb-surface-2)" stroke="currentColor"/>`;
      const shade = flush > 0 ? 0.12 + flush * 0.3 : 0;
      s += `<polygon points="${midX + gTop / 2},${y0} 490,${y0} 490,${y1} ${midX + gBot / 2},${y1}" fill="var(--tb-surface-2)" stroke="currentColor"/>`;
      if (shade > 0) s += `<polygon points="${midX + gTop / 2},${y0} ${midX + gTop / 2 + 6},${y0} ${midX + gBot / 2 + 6},${y1} ${midX + gBot / 2},${y1}" fill="currentColor" opacity="${shade}"/>`;
      // reflection line: diagonal highlight that breaks by flush * gain
      const ly = 60 + 50 * Math.sin(phase);
      const off = flush * k * 1.5;
      s += `<line x1="30" y1="${ly + 30}" x2="${midX - gTop / 2}" y2="${ly}" stroke="#fff" stroke-width="4"/><line x1="30" y1="${ly + 30}" x2="${midX - gTop / 2}" y2="${ly}" stroke="var(--tb-warn)" stroke-width="1"/>`;
      const slope = -30 / (midX - 30);
      const yr = ly + off;
      s += `<line x1="${midX + gTop / 2}" y1="${yr}" x2="490" y2="${yr + slope * (490 - midX)}" stroke="#fff" stroke-width="4"/><line x1="${midX + gTop / 2}" y1="${yr}" x2="490" y2="${yr + slope * (490 - midX)}" stroke="var(--tb-warn)" stroke-width="1"/>`;
      // score: simple illustrative index
      const score = Math.max(0, 100 - Math.abs(flush) * 90 - taper * 80 - Math.max(0, gap - 0.8) * 25 - (flush < 0 ? 15 : 0));
      const verdict = score > 80 ? "精緻に見える" : score > 55 ? "許容範囲" : "安っぽく見える";
      s += `<text class="lbl" x="30" y="180">隙間 ${f1(gap)}〜${f1(gap + taper)} mm / 段差 ${flush.toFixed(2)} mm ${flush < 0 ? "(後ろ側が飛び出し: 逆段差)" : ""}</text>`;
      s += `<rect x="30" y="192" width="300" height="12" fill="var(--tb-surface-2)" stroke="currentColor"/><rect x="30" y="192" width="${score * 3}" height="12" fill="var(--tb-accent)"/>`;
      s += `<text class="lbl" x="340" y="203">見た目の品質: ${verdict}</text>`;
      s += `<text class="tick" x="30" y="222">※ 寸法は図上で誇張。指標は説明用の目安で規格値ではありません</text>`;
      svg.innerHTML = s;
    };
    out.innerHTML = `<p class="tb-note">人は隙間の「幅」そのものより、<b>不均一</b>と<b>段差による映り込みの折れ</b>に敏感です。段差を付けるなら向きをそろえ (奥の部品を引っ込める)、隙間は全周で均一に見せます。</p>`;
    draw();
    loop(host, (_t, dt) => ((phase += dt * 1.2), draw()), () => playing);
  },

  /** SD-method profile: two designs rated on bipolar adjective scales. */
  "anim-semantic"(host) {
    const { ctl, svg, out } = frame(host, "SD 法プロファイル — 2 案の印象比較", 260);
    const pairs = [
      ["冷たい", "暖かい"], ["重い", "軽い"], ["安っぽい", "高級な"], ["古い", "新しい"],
      ["複雑な", "シンプルな"], ["弱々しい", "頑丈な"], ["硬い", "柔らかい"],
    ];
    const target = [0.5, 1, 2, 1.5, 2, 1.5, 0];
    const A = [-1, 0.5, 1.5, 2, 2, 0.5, -1];
    const B = [1.5, 1, 0, 0.5, 1, 1.5, 1.5];
    let blend = 0, playing = !reduced();
    const pb = button(ctl, playing ? "■ 止める" : "▶ 動かす", () => ((playing = !playing), (pb.textContent = playing ? "■ 止める" : "▶ 動かす")));
    let edit = 0;
    slider(ctl, "案 A を調整: 項目", 1, pairs.length, 1, 1, (v) => ((edit = v - 1), (vs.value = String(A[edit])), vs.dispatchEvent(new Event("input"))));
    const vs = slider(ctl, "評価 (−3〜+3)", -3, 3, A[0], 0.5, (v) => ((A[edit] = v), draw()));
    const draw = () => {
      const x = (v: number) => 260 + v * 50, y = (i: number) => 30 + i * 30;
      let s = "";
      for (let v = -3; v <= 3; v++) s += `<line class="guide" x1="${x(v)}" x2="${x(v)}" y1="18" y2="${y(pairs.length - 1) + 12}"/><text class="tick" x="${x(v)}" y="${y(pairs.length - 1) + 28}" text-anchor="middle">${v}</text>`;
      pairs.forEach(([l, r], i) => {
        s += `<text class="lbl" x="${x(-3) - 8}" y="${y(i) + 4}" text-anchor="end">${l}</text><text class="lbl" x="${x(3) + 8}" y="${y(i) + 4}">${r}</text>`;
      });
      const line = (vals: number[], col: string, dash = "") =>
        `<polyline points="${vals.map((v, i) => `${x(v)},${y(i)}`).join(" ")}" fill="none" stroke="${col}" stroke-width="2.5" ${dash ? `stroke-dasharray="${dash}"` : ""}/>` +
        vals.map((v, i) => `<circle cx="${x(v)}" cy="${y(i)}" r="4" fill="${col}"/>`).join("");
      const Bt = B.map((v, i) => v + Math.sin(blend + i) * 0.15);
      s += line(target, "var(--tb-warn)", "5 4") + line(A, "var(--tb-accent)") + line(Bt, "currentColor");
      s += `<rect x="${x(-3) + 4}" y="${y(edit) - 12}" width="${x(3) - x(-3) - 8}" height="24" fill="var(--tb-accent)" opacity="0.08"/>`;
      const d = (v: number[]) => Math.sqrt(v.reduce((a, b, i) => a + (b - target[i]) ** 2, 0));
      out.innerHTML = `<p class="tb-note">橙の破線 = 狙いの印象 (コンセプト)、色付き = 案 A、黒 = 案 B (回答のばらつきを揺れで表示)。狙いとの距離: 案 A <b>${d(A).toFixed(2)}</b> / 案 B <b>${d(B).toFixed(2)}</b>。平均値だけでなく、どの項目でずれているかを見て次の改良点を決めます。</p>`;
      svg.innerHTML = s;
    };
    draw();
    loop(host, (_t, dt) => ((blend += dt * 2), draw()), () => playing);
  },
};
