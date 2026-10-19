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

// ------------------------------------------------------------- figures ---

export const ANIM5: Record<string, (host: HTMLElement) => void> = {
  /** Lathe turning: feed per rev and nose radius set the scallop height Rz ≈ f²/(8r). */
  "anim-turning"(host) {
    const { ctl, svg, out } = frame(host, "旋削の送りと仕上げ面粗さ (Rz ≈ f² / 8r)", 240);
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
      const y0 = 60, y1 = 160, xL = 60, xR = 470;
      let s = `<rect x="20" y="${y0 - 20}" width="40" height="${y1 - y0 + 40}" fill="var(--tb-surface-2)" stroke="var(--tb-text-3)"/><text class="tick" x="40" y="${y1 + 36}" text-anchor="middle">チャック</text>`;
      const cut = xR - x * (xR - xL); // tool position: moves from right to left
      s += `<rect x="${xL}" y="${y0 + 12}" width="${cut - xL}" height="${y1 - y0 - 24}" fill="var(--tb-surface-2)" stroke="var(--tb-text-2)"/>`;
      s += `<rect x="${cut}" y="${y0}" width="${xR - cut}" height="${y1 - y0}" class="sec"/>`;
      // rotation marks on the uncut stock
      for (let i = 0; i < 4; i++) {
        const ph = (spin + i / 4) % 1;
        const yy = y0 + 12 + ph * (y1 - y0 - 24);
        s += `<line x1="${xL + 4}" x2="${Math.max(xL + 4, cut - 4)}" y1="${yy}" y2="${yy}" stroke="var(--tb-text-3)" stroke-dasharray="2 6"/>`;
      }
      // tool insert below the part
      s += `<path d="M${cut},${y1 - 12} l18,40 l-36,0 Z" fill="var(--tb-accent)"/><text class="tick" x="${cut + 22}" y="${y1 + 24}">バイト ← 送り</text>`;
      // magnified profile of the finished surface
      const px0 = 70, pw = 380, py = 214, amp = Math.min(40, rz * 1.2 + 1);
      const scale = pw / 2.0; // 2 mm shown
      let d = `M${px0},${py - 22}`;
      for (let k = 0; k <= 200; k++) {
        const xm = (k / 200) * 2.0;
        const u = ((xm % f) + f) % f - f / 2; // position inside one scallop
        const h = (u * u) / (2 * r); // parabola approx of the nose circle (mm)
        const hn = h / ((f * f) / (8 * r)); // 0..1
        d += ` L${px0 + xm * scale},${py - 22 + amp / 2 - hn * amp}`;
      }
      s += `<path d="${d}" fill="none" stroke="var(--tb-warn)" stroke-width="1.6"/><text class="tick" x="${px0}" y="${py + 20}">仕上げ面の断面 (高さ方向を拡大、幅 2 mm)</text>`;
      s += `<text class="mark-t" x="20" y="22">f = ${fmt(f, 2)} mm/rev、r = ${r} mm → Rz ≈ ${fmt(rz, 3)} µm、Ra ≈ ${fmt(ra, 2)} µm (理論値)</text>`;
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
    const { ctl, svg, out } = frame(host, "曲げのスプリングバック", 240);
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
    select(ctl, Object.entries(mats).map(([k, v]) => [k, v.name] as [string, string]), m, (v) => ((m = v), (p = 0)));
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
    const draw = (final = !playing) => {
      const { thF, sb } = calc();
      const phase = final ? 2 : p;
      const ang = phase <= 1 ? 90 * phase : 90 - sb * Math.min(1, phase - 1); // bend angle shown
      const cx = 220, cy = 170, L = 150;
      const a = (ang * Math.PI) / 180;
      let s = `<line x1="${cx - L}" x2="${cx}" y1="${cy}" y2="${cy}" stroke="var(--tb-accent)" stroke-width="6" stroke-linecap="round"/>`;
      s += `<line x1="${cx}" y1="${cy}" x2="${cx + L * Math.cos(a)}" y2="${cy - L * Math.sin(a)}" stroke="var(--tb-accent)" stroke-width="6" stroke-linecap="round"/>`;
      // ghost of the 90° target
      s += `<line class="guide" x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy - L}"/><text class="tick" x="${cx - 4}" y="${cy - L - 6}" text-anchor="end">狙い 90°</text>`;
      if (phase > 1) s += `<path d="M${cx},${cy - 100} A100,100 0 0 1 ${cx + 100 * Math.cos(a)},${cy - 100 * Math.sin(a)}" fill="none" stroke="var(--tb-bad)" stroke-width="2"/>`;
      // punch
      const punchY = phase <= 1 ? cy - 40 + 30 * phase : cy - 10 - 30 * Math.min(1, phase - 1);
      s += `<path d="M${cx - 14},${punchY - 60} L${cx + 14},${punchY - 60} L${cx},${punchY} Z" fill="var(--tb-surface-2)" stroke="var(--tb-text-2)" transform="rotate(-45 ${cx} ${cy})"/>`;
      s += `<text class="mark-t" x="20" y="24">${mats[m].name}、R/t = ${rt}: 戻り ≈ ${fmt(sb, 2)}° → 除荷後 ${fmt(thF, 3)}°</text>`;
      // bar chart of all materials at this R/t
      let bx = 380;
      s += `<text class="lbl" x="${bx}" y="60">同じ R/t の戻り角</text>`;
      Object.entries(mats).forEach(([k, mt], i) => {
        const t = 1, Ri = rt;
        const x = (Ri * mt.sy) / (mt.E * t);
        const Rf = Ri / (4 * x ** 3 - 3 * x + 1);
        const v = 90 - (90 * (Ri + 0.5)) / (Rf + 0.5);
        const w = Math.min(120, v * 6);
        s += `<rect x="${bx}" y="${74 + i * 30}" width="${w}" height="14" fill="${k === m ? "var(--tb-warn)" : "var(--tb-text-3)"}"/><text class="tick" x="${bx}" y="${70 + i * 30 + 30}">${mt.name.split(" ")[0]} ${fmt(v, 2)}°</text>`;
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
    const { ctl, svg, out } = frame(host, "材料選択チャート (ヤング率 E – 密度 ρ)", 300);
    // [name, density g/cm³, E GPa, class]
    const M: [string, number, number, string][] = [
      ["鋼", 7.85, 206, "metal"], ["SUS304", 7.93, 193, "metal"], ["鋳鉄 FC250", 7.2, 110, "metal"], ["黄銅", 8.5, 100, "metal"],
      ["アルミ合金", 2.7, 70, "metal"], ["マグネシウム合金", 1.8, 45, "metal"], ["チタン合金", 4.43, 114, "metal"],
      ["CFRP (擬似等方)", 1.6, 60, "comp"], ["CFRP (一方向)", 1.6, 140, "comp"], ["GFRP", 1.9, 20, "comp"],
      ["POM", 1.41, 2.9, "poly"], ["PA6", 1.13, 2.5, "poly"], ["PC", 1.2, 2.3, "poly"], ["ABS", 1.05, 2.2, "poly"], ["PP", 0.9, 1.4, "poly"],
      ["木材 (繊維方向)", 0.5, 11, "nat"], ["アルミナ", 3.9, 370, "cer"], ["ガラス", 2.5, 70, "cer"],
    ];
    const col: Record<string, string> = { metal: "var(--tb-accent)", comp: "var(--tb-good)", poly: "var(--tb-warn)", nat: "var(--tb-text-2)", cer: "var(--tb-bad)" };
    let idx = 2; // exponent n in E^(1/n)/ρ
    let off = 0;
    let playing = !reduced();
    let pick = -1;
    select(ctl, [["1", "引張棒: E/ρ"], ["2", "曲げはり: E^½/ρ"], ["3", "曲げ板: E^⅓/ρ"]], "2", (v) => ((idx = Number(v)), draw()));
    const pb = button(ctl, playing ? "■ 止める" : "▶ 線を動かす", () => ((playing = !playing), (pb.textContent = playing ? "■ 止める" : "▶ 線を動かす")));
    const X = (rho: number) => 60 + ((Math.log10(rho) - Math.log10(0.3)) / (Math.log10(20) - Math.log10(0.3))) * 440;
    const Y = (E: number) => 260 - ((Math.log10(E) - Math.log10(0.5)) / (Math.log10(1000) - Math.log10(0.5))) * 230;
    const draw = () => {
      let s = `<line class="axis" x1="60" x2="500" y1="260" y2="260"/><line class="axis" x1="60" x2="60" y1="30" y2="260"/>`;
      for (const r of [0.5, 1, 2, 5, 10]) s += `<text class="tick" x="${X(r)}" y="274" text-anchor="middle">${r}</text><line class="guide" x1="${X(r)}" x2="${X(r)}" y1="30" y2="260"/>`;
      for (const e of [1, 10, 100, 1000]) s += `<text class="tick" x="54" y="${Y(e) + 4}" text-anchor="end">${e}</text><line class="guide" x1="60" x2="500" y1="${Y(e)}" y2="${Y(e)}"/>`;
      s += `<text class="lbl" x="500" y="292" text-anchor="end">密度 ρ (g/cm³, 対数)</text><text class="lbl" x="64" y="26">E (GPa, 対数)</text>`;
      // guide line E = C·ρ^n  → slope n on log-log
      const C = Math.pow(10, -1 + off * 3);
      const p1 = 0.3, p2 = 20;
      s += `<line x1="${X(p1)}" y1="${Y(C * p1 ** idx)}" x2="${X(p2)}" y2="${Y(C * p2 ** idx)}" stroke="var(--tb-warn)" stroke-width="2" stroke-dasharray="6 4"/>`;
      const score = (rho: number, E: number) => Math.pow(E, 1 / idx) / rho;
      const ranked = M.map((m, i) => ({ i, v: score(m[1], m[2]) })).sort((a, b) => b.v - a.v);
      M.forEach(([n, rho, E, c], i) => {
        const above = E > C * rho ** idx;
        s += `<circle data-i="${i}" cx="${X(rho)}" cy="${Y(E)}" r="${i === pick ? 7 : 5}" fill="${col[c]}" opacity="${above ? 1 : 0.35}" style="cursor:pointer"/>`;
        s += `<text class="tick" x="${X(rho) + 7}" y="${Y(E) - 5}" opacity="${above ? 1 : 0.5}">${n}</text>`;
      });
      svg.innerHTML = s;
      const lab = idx === 1 ? "E/ρ" : idx === 2 ? "E^½/ρ" : "E^⅓/ρ";
      const top = ranked.slice(0, 4).map((r) => `${M[r.i][0]} (${fmt(r.v, 3)})`).join("、");
      const sel = pick >= 0 ? `<tr><th>選択中</th><td>${M[pick][0]}: ρ = ${M[pick][1]} g/cm³、E = ${M[pick][2]} GPa、${lab} = ${fmt(score(M[pick][1], M[pick][2]), 3)}</td></tr>` : "";
      out.innerHTML = `<table class="tb-res"><tr><th>指標 ${lab} の上位</th><td>${top}</td></tr>${sel}</table><p class="tb-note">破線は傾き ${idx} の「指標が等しい線」。線より左上の材料ほど、同じ剛性をより軽く実現できます。点をクリックすると値が出ます。軽くたわみにくい「はり」では E^½/ρ、「板」では E^⅓/ρ で比べるので、密度の小さい材料ほど有利になります。</p>`;
    };
    svg.addEventListener("click", (e) => {
      const b = svg.getBoundingClientRect();
      if (!b.width) return;
      const k = 520 / b.width;
      const mx = (e.clientX - b.left) * k, my = (e.clientY - b.top) * k;
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
