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
const n1 = (v: number) => Math.round(v * 10) / 10;
const panel = (x: number, y: number, w: number, h: number) => `<rect class="k-panel" x="${x}" y="${y}" width="${w}" height="${h}" rx="8"/>`;

export const ANIM3: Record<string, (host: HTMLElement) => void> = {
  /** Visual weight: base/top width ratio and height ratio vs. perceived stability. */
  "anim-visualweight"(host) {
    const { ctl, svg, out } = frame(host, "視覚的重さと安定感 — 裾の広がりと縦横比", 240);
    let top = 0.7, hr = 1.618, playing = !reduced(), golden = true;
    const pb = button(ctl, playing ? "■ 止める" : "▶ 動かす", () => ((playing = !playing), (pb.textContent = playing ? "■ 止める" : "▶ 動かす")));
    const ts = slider(ctl, "上幅 / 下幅", 0.4, 1.6, top, 0.05, (v) => ((top = v), (playing = false), (pb.textContent = "▶ 動かす"), draw()));
    slider(ctl, "高さ / 下幅", 0.6, 2.4, hr, 0.01, (v) => ((hr = v), draw()));
    button(ctl, "黄金比ガイド", () => ((golden = !golden), draw()));
    const draw = () => {
      const base = 120, cx = 150, gy = 206;
      const H = Math.min(180, base * hr * 0.6);
      const tw = base * top;
      const pts = `${n1(cx - base / 2)},${gy} ${n1(cx + base / 2)},${gy} ${n1(cx + tw / 2)},${n1(gy - H)} ${n1(cx - tw / 2)},${n1(gy - H)}`;
      // centroid height of trapezoid from base
      const cy = (H * (base + 2 * tw)) / (3 * (base + tw));
      const tilt = top > 1 ? Math.min(6, (top - 1) * 10) : 0;
      let s = panel(6, 6, 292, 228);
      s += `<rect class="k-ground" x="20" y="${gy}" width="264" height="10"/><line class="k-edge" x1="20" x2="284" y1="${gy}" y2="${gy}"/>`;
      // the product body: shaded block with a top face highlight and a front panel line
      s += `<g transform="rotate(${n1(tilt)} ${cx + base / 2} ${gy})"><g class="k-shadow"><polygon class="k-part" points="${pts}"/></g>`;
      const inset = 10;
      const ix = (y: number) => (tw / 2 - base / 2) * ((gy - y) / H) + base / 2 - inset;
      const yA = gy - H + 16, yB = gy - 16;
      s += `<polygon class="k-thin" points="${n1(cx - ix(yA))},${n1(yA)} ${n1(cx + ix(yA))},${n1(yA)} ${n1(cx + ix(yB))},${n1(yB)} ${n1(cx - ix(yB))},${n1(yB)}"/>`;
      s += `<line x1="${n1(cx - tw / 2 + 2)}" x2="${n1(cx + tw / 2 - 2)}" y1="${n1(gy - H + 2)}" y2="${n1(gy - H + 2)}" style="stroke:var(--k-steel-1)" stroke-width="2"/>`;
      s += `<line x1="${cx}" x2="${cx}" y1="${n1(gy - cy)}" y2="${gy}" style="stroke:var(--tb-warn)" stroke-width="1.4" stroke-dasharray="3 3"/>`;
      s += `<circle cx="${cx}" cy="${n1(gy - cy)}" r="6" style="fill:var(--tb-warn);stroke:var(--tb-surface)" stroke-width="1.5"/>`;
      s += `<text class="lbl" x="${cx + 10}" y="${n1(gy - cy + 4)}">重心</text></g>`;
      if (golden) {
        const gH = Math.min(180, base * 1.618 * 0.6);
        s += `<rect x="${cx - base / 2}" y="${n1(gy - gH)}" width="${base}" height="${n1(gH)}" fill="none" style="stroke:var(--tb-good)" stroke-width="1.2" stroke-dasharray="5 4"/>`;
        s += `<line x1="18" x2="40" y1="23" y2="23" style="stroke:var(--tb-good)" stroke-width="1.2" stroke-dasharray="5 4"/><text class="tick" x="46" y="27" style="fill:var(--tb-good)">1 : 1.618 の枠 (表示上 0.6 倍)</text>`;
      }
      const ratio = cy / H;
      const verdict = top > 1.05 ? "不安定 (頭が重い)" : top < 0.6 ? "とても安定 (重厚・どっしり)" : top < 0.95 ? "安定 (落ち着き)" : "中立 (直方体)";
      const vcls = top > 1.05 ? "k-bad-t" : top < 0.95 ? "k-good-t" : "mark-t";
      s += panel(310, 6, 204, 228);
      s += `<text class="k-note" x="324" y="30">重心高さ / 全高</text>`;
      s += `<text class="k-title" x="324" y="52" style="font-size:20px">${ratio.toFixed(2)}</text>`;
      s += `<text class="k-note" x="324" y="80">見え方</text>`;
      s += `<text class="${vcls}" x="324" y="99">${verdict}</text>`;
      const bw = Math.max(0, Math.min(170, ((0.6 - ratio) / 0.25) * 170));
      s += `<rect x="324" y="114" width="170" height="12" rx="6" style="fill:var(--tb-surface-2);stroke:var(--tb-border)"/>`;
      s += `<rect x="324" y="114" width="${n1(bw)}" height="12" rx="6" style="fill:var(--tb-accent)"/>`;
      s += `<text class="tick" x="324" y="142">安定感の目安</text><text class="tick" x="324" y="157">(重心が低いほど長い)</text>`;
      s += `<text class="k-note" x="324" y="186">高さ比</text>`;
      s += `<text class="mark-t" x="324" y="205">${hr.toFixed(2)}${Math.abs(hr - 1.618) < 0.05 ? " ≈ 黄金比" : Math.abs(hr - 1.414) < 0.05 ? " ≈ 白銀比" : ""}</text>`;
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
    const { ctl, svg, out } = frame(host, "見切りの隙間と段差 (ギャップ & フラッシュ)", 300);
    let gap = 0.6, flush = 0.3, taper = 0.2;
    slider(ctl, "隙間 mm", 0.2, 2.0, gap, 0.1, (v) => ((gap = v), draw()));
    slider(ctl, "段差 mm", -0.6, 0.6, flush, 0.05, (v) => ((flush = v), draw()));
    slider(ctl, "隙間の不均一 mm", 0, 0.6, taper, 0.05, (v) => ((taper = v), draw()));
    let phase = 0, playing = !reduced();
    const pb = button(ctl, playing ? "■ 光を止める" : "▶ 光を動かす", () => ((playing = !playing), (pb.textContent = playing ? "■ 光を止める" : "▶ 光を動かす")));
    const clipId = `tbgf${Math.random().toString(36).slice(2, 8)}`;
    const draw = () => {
      const k = 20; // px per mm (exaggerated)
      const midX = 260, y0 = 26, y1 = 146;
      const gTop = gap * k, gBot = (gap + taper) * k;
      let s = `<text class="k-note" x="14" y="18">正面 (映り込み)</text>`;
      // panels (left: reference, right: offset by flush)
      s += `<g class="k-shadow"><polygon class="k-alu" points="14,${y0} ${n1(midX - gTop / 2)},${y0} ${n1(midX - gBot / 2)},${y1} 14,${y1}"/>`;
      s += `<polygon class="k-alu" points="${n1(midX + gTop / 2)},${y0} 506,${y0} 506,${y1} ${n1(midX + gBot / 2)},${y1}"/></g>`;
      // the visible gap is dark (looking into the shadow)
      s += `<polygon points="${n1(midX - gTop / 2 + 0.8)},${y0} ${n1(midX + gTop / 2 - 0.8)},${y0} ${n1(midX + gBot / 2 - 0.8)},${y1} ${n1(midX - gBot / 2 + 0.8)},${y1}" style="fill:var(--k-line)" opacity="0.75"/>`;
      // the proud edge catches light / the recessed edge shows a shadow line
      if (Math.abs(flush) > 0.02) {
        const sx = flush > 0 ? midX + gTop / 2 : midX - gTop / 2;
        const sb = flush > 0 ? midX + gBot / 2 : midX - gBot / 2;
        const dir = flush > 0 ? 1 : -1;
        s += `<polygon points="${n1(sx)},${y0} ${n1(sx + dir * 5)},${y0} ${n1(sb + dir * 5)},${y1} ${n1(sb)},${y1}" style="fill:var(--k-steel-1)" opacity="${n1(0.4 + Math.abs(flush))}"/>`;
      }
      // reflection line: diagonal highlight that breaks by flush * gain
      const ly = 84 + 30 * Math.sin(phase);
      const off = flush * k * 1.5;
      const hl = (x1: number, ya: number, x2: number, yb: number) =>
        `<line x1="${n1(x1)}" y1="${n1(ya)}" x2="${n1(x2)}" y2="${n1(yb)}" class="k-glow" style="stroke:#fff" stroke-width="5"/><line x1="${n1(x1)}" y1="${n1(ya)}" x2="${n1(x2)}" y2="${n1(yb)}" style="stroke:var(--tb-warn)" stroke-width="1.2"/>`;
      s += `<defs><clipPath id="${clipId}"><rect x="14" y="${y0}" width="492" height="${y1 - y0}"/></clipPath></defs><g clip-path="url(#${clipId})">`;
      s += hl(14, ly + 30, midX - gTop / 2, ly);
      const slope = -30 / (midX - 14);
      const yr = ly + off;
      s += hl(midX + gTop / 2, yr, 506, yr + slope * (506 - midX));
      s += `</g>`;
      if (Math.abs(off) > 3) s += `<text class="k-dimtext" x="${midX}" y="${y1 + 16}" text-anchor="middle">↑ 映り込みの折れ</text>`;
      // section view: two skins, gap and flush with real dimension lines
      const sy = 198, th = 12, sk = 22;
      const lx2 = midX - (gap * sk) / 2, rx1 = midX + (gap * sk) / 2, dy = -flush * sk;
      s += `<text class="k-note" x="14" y="170">断面 (A–A、さらに拡大)</text>`;
      s += `<g class="k-shadow"><rect class="k-cut" x="120" y="${sy}" width="${n1(lx2 - 120)}" height="${th}"/>`;
      s += `<rect class="k-cut2" x="${n1(rx1)}" y="${n1(sy + dy)}" width="${n1(400 - rx1)}" height="${th}"/></g>`;
      // gap dimension (above)
      s += `<line class="k-ext" x1="${n1(lx2)}" x2="${n1(lx2)}" y1="${sy - 4}" y2="${sy - 22}"/><line class="k-ext" x1="${n1(rx1)}" x2="${n1(rx1)}" y1="${n1(Math.min(sy, sy + dy) - 4)}" y2="${sy - 22}"/>`;
      s += `<line class="k-dimline" x1="${n1(lx2 - 16)}" x2="${n1(lx2)}" y1="${sy - 18}" y2="${sy - 18}"/><line class="k-dimline" x1="${n1(rx1 + 16)}" x2="${n1(rx1)}" y1="${sy - 18}" y2="${sy - 18}"/>`;
      s += `<text class="k-dimtext" x="${n1(lx2 - 20)}" y="${sy - 14}" text-anchor="end">隙間 ${f1(gap)}</text>`;
      // flush dimension (right)
      s += `<line class="k-ext" x1="${n1(rx1 - 30)}" x2="104" y1="${sy}" y2="${sy}"/>`;
      s += `<line class="k-ext" x1="400" x2="440" y1="${sy}" y2="${sy}"/><line class="k-ext" x1="404" x2="440" y1="${n1(sy + dy)}" y2="${n1(sy + dy)}"/>`;
      if (Math.abs(dy) > 2) s += `<line class="k-dimline" x1="432" x2="432" y1="${sy}" y2="${n1(sy + dy)}"/>`;
      s += `<text class="k-dimtext" x="446" y="${n1(sy + dy / 2 + 4)}">段差 ${flush.toFixed(2)}</text>`;
      // score: simple illustrative index
      const score = Math.max(0, 100 - Math.abs(flush) * 90 - taper * 80 - Math.max(0, gap - 0.8) * 25 - (flush < 0 ? 15 : 0));
      const verdict = score > 80 ? "精緻に見える" : score > 55 ? "許容範囲" : "安っぽく見える";
      const vc = score > 80 ? "var(--tb-good)" : score > 55 ? "var(--tb-warn)" : "var(--tb-bad)";
      s += `<text class="lbl" x="14" y="242">隙間 ${f1(gap)}〜${f1(gap + taper)} mm / 段差 ${flush.toFixed(2)} mm ${flush < 0 ? "(後ろ側が飛び出し: 逆段差)" : ""}</text>`;
      s += `<rect x="14" y="252" width="300" height="12" rx="6" style="fill:var(--tb-surface-2);stroke:var(--tb-border)"/><rect x="14" y="252" width="${n1(score * 3)}" height="12" rx="6" style="fill:${vc}"/>`;
      s += `<text class="lbl" x="326" y="263" style="fill:${vc}">見た目の品質: ${verdict}</text>`;
      s += `<text class="tick" x="14" y="288">※ 寸法は図上で誇張。指標は説明用の目安で規格値ではありません</text>`;
      svg.innerHTML = s;
    };
    out.innerHTML = `<p class="tb-note">人は隙間の「幅」そのものより、<b>不均一</b>と<b>段差による映り込みの折れ</b>に敏感です。段差を付けるなら向きをそろえ (奥の部品を引っ込める)、隙間は全周で均一に見せます。</p>`;
    draw();
    loop(host, (_t, dt) => ((phase += dt * 1.2), draw()), () => playing);
  },

  /** SD-method profile: two designs rated on bipolar adjective scales. */
  "anim-semantic"(host) {
    const { ctl, svg, out } = frame(host, "SD 法プロファイル — 2 案の印象比較", 280);
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
    const CT = "var(--tb-warn)", CA = "var(--tb-accent)", CB = "var(--tb-text-2)";
    const draw = () => {
      const x = (v: number) => 260 + v * 48, y = (i: number) => 54 + i * 28;
      let s = panel(6, 6, 508, 268);
      // legend row (direct, at the top)
      const leg = (lx: number, col: string, t: string, dash = "") =>
        `<line x1="${lx}" x2="${lx + 24}" y1="24" y2="24" style="stroke:${col}" stroke-width="2.6" ${dash ? `stroke-dasharray="${dash}"` : ""}/><circle cx="${lx + 12}" cy="24" r="3.5" style="fill:${col}"/><text class="lbl" x="${lx + 30}" y="28">${t}</text>`;
      s += leg(120, CT, "狙いの印象", "5 4") + leg(250, CA, "案 A") + leg(350, CB, "案 B");
      // band for the row being edited
      s += `<rect x="${x(-3) - 6}" y="${y(edit) - 12}" width="${x(3) - x(-3) + 12}" height="24" rx="5" style="fill:var(--tb-accent)" opacity="0.1"/>`;
      // centre zone tint
      s += `<rect x="${x(-1)}" y="40" width="${x(1) - x(-1)}" height="${y(pairs.length - 1) - 26}" style="fill:var(--tb-surface-2)" opacity="0.6"/>`;
      for (let v = -3; v <= 3; v++) s += `<line class="${v === 0 ? "axis" : "grid"}" x1="${x(v)}" x2="${x(v)}" y1="40" y2="${y(pairs.length - 1) + 14}"/><text class="tick" x="${x(v)}" y="${y(pairs.length - 1) + 30}" text-anchor="middle">${v > 0 ? "+" + v : v}</text>`;
      pairs.forEach(([l, r], i) => {
        const on = i === edit;
        s += `<text class="${on ? "mark-t" : "lbl"}" x="${x(-3) - 12}" y="${y(i) + 4}" text-anchor="end">${l}</text><text class="${on ? "mark-t" : "lbl"}" x="${x(3) + 12}" y="${y(i) + 4}">${r}</text>`;
      });
      const line = (vals: number[], col: string, dash = "") =>
        `<polyline points="${vals.map((v, i) => `${n1(x(v))},${y(i)}`).join(" ")}" fill="none" style="stroke:${col}" stroke-width="2.6" ${dash ? `stroke-dasharray="${dash}"` : ""}/>` +
        vals.map((v, i) => `<circle cx="${n1(x(v))}" cy="${y(i)}" r="4.5" style="fill:${col};stroke:var(--tb-surface)" stroke-width="1.2"/>`).join("");
      const Bt = B.map((v, i) => v + Math.sin(blend + i) * 0.15);
      s += line(target, CT, "5 4") + line(Bt, CB) + line(A, CA);
      svg.innerHTML = s;
      const d = (v: number[]) => Math.sqrt(v.reduce((a, b, i) => a + (b - target[i]) ** 2, 0));
      out.innerHTML = `<p class="tb-note">橙の破線 = 狙いの印象 (コンセプト)、色付き = 案 A、黒 = 案 B (回答のばらつきを揺れで表示)。狙いとの距離: 案 A <b>${d(A).toFixed(2)}</b> / 案 B <b>${d(B).toFixed(2)}</b>。平均値だけでなく、どの項目でずれているかを見て次の改良点を決めます。</p>`;
    };
    draw();
    loop(host, (_t, dt) => ((blend += dt * 2), draw()), () => playing);
  },
};
