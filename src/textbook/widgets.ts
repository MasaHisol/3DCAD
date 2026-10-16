// Interactive calculators embedded in the textbook pages (<div data-widget="...">).
import { fmt, lineChart } from "./chart";
import {
  beam,
  beamDeflectionFormula,
  BOLT_CLASSES,
  BOLTS,
  boltCalc,
  END_CONDITIONS,
  euler,
  fit,
  HOLE_CLASSES,
  ktPlateHole,
  MATERIAL_DATA,
  safetyFactor,
  section,
  SHAFT_CLASSES,
  shaftDiameter,
  shaftShear,
  shaftTwist,
  slenderness,
  torqueFromPower,
  type BeamCase,
  type SectionKind,
} from "./mech";

type Field =
  | { key: string; label: string; type: "num"; value: number; unit?: string; step?: number; min?: number }
  | { key: string; label: string; type: "select"; value: string; options: [string, string][] };

/** A small input form: returns the container and a value getter; calls `onChange` on every edit. */
function form(fields: Field[], onChange: () => void) {
  const el = document.createElement("div");
  el.className = "tb-form";
  const inputs = new Map<string, HTMLInputElement | HTMLSelectElement>();
  const rows = new Map<string, HTMLElement>();
  for (const f of fields) {
    const row = document.createElement("label");
    row.className = "tb-field";
    const cap = document.createElement("span");
    cap.textContent = f.label;
    row.appendChild(cap);
    let inp: HTMLInputElement | HTMLSelectElement;
    if (f.type === "num") {
      const i = document.createElement("input");
      i.type = "number";
      i.value = String(f.value);
      i.step = String(f.step ?? "any");
      if (f.min !== undefined) i.min = String(f.min);
      inp = i;
    } else {
      const s = document.createElement("select");
      for (const [v, t] of f.options) {
        const o = document.createElement("option");
        o.value = v;
        o.textContent = t;
        s.appendChild(o);
      }
      s.value = f.value;
      inp = s;
    }
    inp.addEventListener("input", onChange);
    inp.addEventListener("change", onChange);
    row.appendChild(inp);
    if (f.type === "num" && f.unit) {
      const u = document.createElement("small");
      u.textContent = f.unit;
      row.appendChild(u);
    }
    inputs.set(f.key, inp);
    rows.set(f.key, row);
    el.appendChild(row);
  }
  return {
    el,
    num: (k: string) => Number(inputs.get(k)!.value),
    str: (k: string) => inputs.get(k)!.value,
    show: (k: string, on: boolean) => rows.get(k)!.classList.toggle("hidden", !on),
    set: (k: string, v: number | string) => (inputs.get(k)!.value = String(v)),
  };
}

function shell(host: HTMLElement, title: string) {
  host.classList.add("tb-widget");
  host.innerHTML = "";
  const head = document.createElement("div");
  head.className = "tb-widget-head";
  head.innerHTML = `<span class="tb-widget-badge">計算ツール</span>${title}`;
  const body = document.createElement("div");
  body.className = "tb-widget-body";
  const out = document.createElement("div");
  out.className = "tb-widget-out";
  host.append(head, body, out);
  return { body, out };
}

const table = (rows: [string, string, string?][]) =>
  `<table class="tb-res">${rows.map(([k, v, cls]) => `<tr${cls ? ` class="${cls}"` : ""}><th>${k}</th><td>${v}</td></tr>`).join("")}</table>`;

const safeClass = (n: number) => (n < 1 ? "bad" : n < 2 ? "warn" : "good");
const err = (e: unknown) => `<p class="tb-err">${(e as Error).message}</p>`;

const metals = MATERIAL_DATA.filter((m) => m.sy > 0);
const matOptions: [string, string][] = metals.map((m, i) => [String(i), m.name]);

const SECTION_FIELDS: Field[] = [
  {
    key: "sec",
    label: "断面",
    type: "select",
    value: "rect",
    options: [
      ["rect", "長方形 (b × h)"],
      ["round", "丸棒 (d)"],
      ["pipe", "丸パイプ (D × t)"],
      ["box", "角パイプ (B × H × t)"],
      ["hbeam", "H 形 (H × B × tw × tf)"],
    ],
  },
  { key: "b", label: "幅 b / B", type: "num", value: 20, unit: "mm", min: 0 },
  { key: "h", label: "高さ h / H", type: "num", value: 40, unit: "mm", min: 0 },
  { key: "d", label: "直径 d / D", type: "num", value: 30, unit: "mm", min: 0 },
  { key: "t", label: "肉厚 t", type: "num", value: 3, unit: "mm", min: 0 },
  { key: "tw", label: "ウェブ厚 tw", type: "num", value: 6, unit: "mm", min: 0 },
  { key: "tf", label: "フランジ厚 tf", type: "num", value: 8, unit: "mm", min: 0 },
];

function readSection(f: ReturnType<typeof form>) {
  const kind = f.str("sec") as SectionKind;
  const show: Record<string, string[]> = { rect: ["b", "h"], round: ["d"], pipe: ["d", "t"], box: ["b", "h", "t"], hbeam: ["b", "h", "tw", "tf"] };
  for (const k of ["b", "h", "d", "t", "tw", "tf"]) f.show(k, show[kind].includes(k));
  const dims = { b: f.num("b"), h: f.num("h"), d: f.num("d"), D: f.num("d"), t: f.num("t"), tw: f.num("tw"), tf: f.num("tf") };
  return { kind, dims, props: section(kind, dims) };
}

/** Outline of a section for display (centred, scaled to fit 120 px). */
function sectionSvg(kind: SectionKind, s: { b: number; h: number; d: number; t: number; tw: number; tf: number }): string {
  const size = Math.max(kind === "round" || kind === "pipe" ? s.d : Math.max(s.b, s.h), 1e-6);
  const k = 110 / size;
  const c = 70;
  const fill = `class="sec"`;
  let shape = "";
  if (kind === "rect") shape = `<rect ${fill} x="${c - (s.b * k) / 2}" y="${c - (s.h * k) / 2}" width="${s.b * k}" height="${s.h * k}"/>`;
  if (kind === "round") shape = `<circle ${fill} cx="${c}" cy="${c}" r="${(s.d * k) / 2}"/>`;
  if (kind === "pipe") shape = `<path ${fill} fill-rule="evenodd" d="M${c - (s.d * k) / 2},${c}a${(s.d * k) / 2},${(s.d * k) / 2} 0 1,0 ${s.d * k},0a${(s.d * k) / 2},${(s.d * k) / 2} 0 1,0 ${-s.d * k},0zM${c - ((s.d - 2 * s.t) * k) / 2},${c}a${((s.d - 2 * s.t) * k) / 2},${((s.d - 2 * s.t) * k) / 2} 0 1,1 ${(s.d - 2 * s.t) * k},0a${((s.d - 2 * s.t) * k) / 2},${((s.d - 2 * s.t) * k) / 2} 0 1,1 ${-(s.d - 2 * s.t) * k},0z"/>`;
  if (kind === "box") {
    const W = s.b * k, H = s.h * k, t = s.t * k;
    shape = `<path ${fill} fill-rule="evenodd" d="M${c - W / 2},${c - H / 2}h${W}v${H}h${-W}zM${c - W / 2 + t},${c - H / 2 + t}v${H - 2 * t}h${W - 2 * t}v${-(H - 2 * t)}z"/>`;
  }
  if (kind === "hbeam") {
    const W = s.b * k, H = s.h * k, tw = s.tw * k, tf = s.tf * k;
    const x = c - W / 2, y = c - H / 2;
    shape = `<path ${fill} d="M${x},${y}h${W}v${tf}h${-(W - tw) / 2}v${H - 2 * tf}h${(W - tw) / 2}v${tf}h${-W}v${-tf}h${(W - tw) / 2}v${-(H - 2 * tf)}h${-(W - tw) / 2}z"/>`;
  }
  return `<svg class="tb-sec" viewBox="0 0 140 140" aria-label="断面形状">${shape}<line class="na" x1="4" x2="136" y1="${c}" y2="${c}"/><text class="tick" x="136" y="${c - 4}" text-anchor="end">中立軸</text></svg>`;
}

// ------------------------------------------------------------- widgets ---

const WIDGETS: Record<string, (host: HTMLElement) => void> = {
  section(host) {
    const { body, out } = shell(host, "断面性能 (断面二次モーメント・断面係数)");
    const f = form(SECTION_FIELDS, update);
    body.appendChild(f.el);
    function update() {
      try {
        const { kind, dims, props: p } = readSection(f);
        const massPerM = (p.A * 1000 * 7.85) / 1e6; // kg/m for steel
        const solid = section("rect", { b: Math.sqrt(p.A), h: Math.sqrt(p.A) });
        out.innerHTML =
          `<div class="tb-split">${sectionSvg(kind, { ...dims })}` +
          table([
            ["断面積 A", `${fmt(p.A)} mm²`],
            ["断面二次モーメント I", `${fmt(p.I)} mm⁴`],
            ["断面係数 Z = I / e", `${fmt(p.Z)} mm³`],
            ["断面二次半径 i = √(I/A)", `${fmt(p.r)} mm`],
            ...(p.Zp ? ([["極断面係数 Zp", `${fmt(p.Zp)} mm³`]] as [string, string][]) : []),
            ["鋼製の場合の質量", `${fmt(massPerM)} kg/m`],
            ["同じ断面積の正方形と比べた曲げ剛性", `${fmt(p.I / solid.I)} 倍`, p.I / solid.I > 1.5 ? "good" : ""],
          ]) +
          "</div>";
      } catch (e) {
        out.innerHTML = err(e);
      }
    }
    update();
  },

  beam(host) {
    const { body, out } = shell(host, "はりの計算 (反力・せん断力図・曲げモーメント図・たわみ)");
    const f = form(
      [
        {
          key: "kind",
          label: "支持と荷重",
          type: "select",
          value: "simple-point",
          options: [
            ["cantilever-point", "片持ちはり・先端に集中荷重"],
            ["cantilever-udl", "片持ちはり・等分布荷重"],
            ["simple-point", "単純支持はり・集中荷重"],
            ["simple-udl", "単純支持はり・等分布荷重"],
          ],
        },
        { key: "L", label: "スパン L", type: "num", value: 1000, unit: "mm", min: 0 },
        { key: "P", label: "荷重 P (分布は w)", type: "num", value: 2000, unit: "N (N/mm)" },
        { key: "a", label: "荷重の位置 a", type: "num", value: 500, unit: "mm" },
        { key: "mat", label: "材料", type: "select", value: "0", options: matOptions },
        ...SECTION_FIELDS,
      ],
      update,
    );
    body.appendChild(f.el);
    let lastKind = f.str("kind");
    function update() {
      try {
        const kind = f.str("kind") as BeamCase;
        // keep the total load when switching between a point load (N) and a distributed one (N/mm)
        if (kind.endsWith("udl") !== lastKind.endsWith("udl") && f.num("L") > 0) {
          const v = kind.endsWith("udl") ? f.num("P") / f.num("L") : f.num("P") * f.num("L");
          f.set("P", Number(v.toPrecision(4)));
        }
        lastKind = kind;
        f.show("a", kind === "simple-point");
        const { props: s } = readSection(f);
        const m = metals[Number(f.str("mat"))];
        const L = f.num("L"), P = f.num("P");
        const r = beam({ kind, L, P, a: f.num("a"), E: m.E * 1000, I: s.I });
        const sigma = Math.abs(r.Mmax) / s.Z;
        const sf = safetyFactor(m.sy, sigma);
        const formula = kind === "simple-point" && Math.abs(f.num("a") - L / 2) > 1e-9 ? null : beamDeflectionFormula(kind, L, P, m.E * 1000, s.I);
        out.innerHTML =
          diagram(kind, f.num("a") / L) +
          table([
            kind.startsWith("cantilever") ? ["固定端の反力 R / モーメント M₀", `${fmt(r.R1)} N / ${fmt(r.M0 / 1000)} N·m`] : ["支点反力 R₁ / R₂", `${fmt(r.R1)} N / ${fmt(r.R2)} N`],
            ["最大曲げモーメント M<sub>max</sub>", `${fmt(r.Mmax / 1000)} N·m (x = ${fmt(r.xMmax)} mm)`],
            ["最大曲げ応力 σ = M / Z", `${fmt(sigma)} MPa`],
            ["最大たわみ δ", `${fmt(r.ymax)} mm (x = ${fmt(r.xYmax)} mm)${formula ? ` — 公式値 ${fmt(formula)} mm` : ""}`],
            ["たわみ / スパン", `1 / ${fmt(L / Math.abs(r.ymax || 1e-12))}`, L / Math.abs(r.ymax) < 300 ? "warn" : ""],
            [`降伏に対する安全率 (σy = ${m.sy} MPa)`, fmt(sf, 2), safeClass(sf)],
          ]) +
          lineChart([{ x: r.x, y: r.V, fill: true, color: "#0f766e" }], { yLabel: "せん断力 V [N]", xLabel: "x [mm]", height: 130 }) +
          lineChart([{ x: r.x, y: r.M.map((v) => v / 1000), fill: true, color: "#b45309" }], { yLabel: "曲げモーメント M [N·m]", xLabel: "x [mm]", height: 140, invertY: true }) +
          lineChart([{ x: r.x, y: r.y, color: "#2563eb" }], { yLabel: "たわみ δ [mm] (下向き)", xLabel: "x [mm]", height: 130, invertY: true, marks: [{ x: r.xYmax, y: r.ymax, text: `${fmt(r.ymax)} mm` }] }) +
          `<p class="tb-note">曲げモーメント図は機械系の慣例どおり、下側が引張 (下に凸) になる正の曲げモーメントを下向きに描いています。</p>`;
      } catch (e) {
        out.innerHTML = err(e);
      }
    }
    update();
  },

  buckling(host) {
    const { body, out } = shell(host, "柱の座屈 (オイラーの式)");
    const f = form(
      [
        { key: "sec", label: "断面", type: "select", value: "pipe", options: [["round", "丸棒 (d)"], ["pipe", "丸パイプ (D × t)"]] },
        { key: "d", label: "直径 d / D", type: "num", value: 34, unit: "mm" },
        { key: "t", label: "肉厚 t", type: "num", value: 2.3, unit: "mm" },
        { key: "L", label: "長さ L", type: "num", value: 1500, unit: "mm" },
        { key: "end", label: "端末条件", type: "select", value: "pinned", options: END_CONDITIONS.map((c) => [c.id, `${c.label} (K = ${c.K})`]) },
        { key: "mat", label: "材料", type: "select", value: "0", options: matOptions },
        { key: "F", label: "加わる圧縮力", type: "num", value: 10000, unit: "N" },
      ],
      update,
    );
    body.appendChild(f.el);
    function update() {
      try {
        const kind = f.str("sec") as SectionKind;
        f.show("t", kind === "pipe");
        const s = section(kind, { d: f.num("d"), D: f.num("d"), t: f.num("t") });
        const m = metals[Number(f.str("mat"))];
        const K = END_CONDITIONS.find((c) => c.id === f.str("end"))!.K;
        const L = f.num("L"), E = m.E * 1000;
        const Pcr = euler(E, s.I, L, K);
        const Py = m.sy * s.A;
        const sl = slenderness(K, L, s.r, E, m.sy);
        const F = f.num("F");
        const gov = Math.min(Pcr, Py);
        const xs = Array.from({ length: 80 }, (_, i) => (L * 2 * (i + 1)) / 80);
        out.innerHTML =
          table([
            ["座屈荷重 P<sub>cr</sub> = π²EI / (KL)²", `${fmt(Pcr / 1000)} kN`],
            ["降伏荷重 σy · A", `${fmt(Py / 1000)} kN`],
            ["細長比 λ = KL / i", `${fmt(sl.lambda)} (限界細長比 ${fmt(sl.lambdaLimit)})`],
            ["判定", sl.lambda > sl.lambdaLimit ? "長柱 — 座屈で決まる (オイラーの式が適用できる)" : "短柱 — 降伏で決まる (オイラーの式は過大評価)", sl.lambda > sl.lambdaLimit ? "" : "warn"],
            ["圧縮力に対する安全率", fmt(gov / F, 2), safeClass(gov / F / 1.5)],
          ]) +
          lineChart(
            [
              { x: xs, y: xs.map((x) => Math.min(euler(E, s.I, x, K), Py * 3) / 1000), color: "#2563eb", label: "座屈荷重" },
              { x: xs, y: xs.map(() => Py / 1000), color: "#b45309", dash: true, label: "降伏荷重" },
            ],
            { xLabel: "長さ L [mm]", yLabel: "荷重 [kN]", height: 170, marks: [{ x: L, y: Math.min(Pcr, Py * 3) / 1000, text: "現在" }] },
          );
      } catch (e) {
        out.innerHTML = err(e);
      }
    }
    update();
  },

  shaft(host) {
    const { body, out } = shell(host, "伝動軸の太さ (ねじり)");
    const f = form(
      [
        { key: "kW", label: "動力", type: "num", value: 1.5, unit: "kW" },
        { key: "rpm", label: "回転数", type: "num", value: 1450, unit: "min⁻¹" },
        { key: "tau", label: "許容せん断応力", type: "num", value: 30, unit: "MPa" },
        { key: "L", label: "軸の長さ (ねじれ角用)", type: "num", value: 300, unit: "mm" },
      ],
      update,
    );
    body.appendChild(f.el);
    const STD = [6, 8, 10, 12, 15, 17, 20, 25, 30, 35, 40, 45, 50, 55, 60, 70, 80, 90, 100];
    function update() {
      try {
        const T = torqueFromPower(f.num("kW"), f.num("rpm"));
        const d = shaftDiameter(T, f.num("tau"));
        const std = STD.find((x) => x >= d) ?? Math.ceil(d);
        out.innerHTML = table([
          ["トルク T = P / ω", `${fmt(T / 1000)} N·m`],
          ["必要な軸径 d = ∛(16T / πτ)", `${fmt(d)} mm`],
          ["選ぶ軸径 (軸受内径の系列から)", `φ${std} mm`, "good"],
          ["φ" + std + " のせん断応力", `${fmt(shaftShear(T, std))} MPa`],
          ["ねじれ角 (鋼 G = 79 GPa)", `${fmt(shaftTwist(T, f.num("L"), 79000, std), 2)}° (目安: 1 m あたり 0.25° 以下)`],
        ]);
      } catch (e) {
        out.innerHTML = err(e);
      }
    }
    update();
  },

  bolt(host) {
    const { body, out } = shell(host, "ボルトの強度と締付トルク");
    const f = form(
      [
        { key: "size", label: "呼び径", type: "select", value: "M8", options: BOLTS.map((b) => [b.size, b.size]) },
        { key: "cls", label: "強度区分", type: "select", value: "8.8", options: BOLT_CLASSES.map((c) => [c.cls, c.cls]) },
        { key: "K", label: "トルク係数 K", type: "num", value: 0.2, step: 0.01 },
        { key: "F", label: "外力 (軸方向)", type: "num", value: 5000, unit: "N" },
      ],
      update,
    );
    body.appendChild(f.el);
    function update() {
      try {
        const r = boltCalc(f.str("size"), f.str("cls"), f.num("K"));
        const F = f.num("F");
        out.innerHTML = table([
          ["有効断面積 As", `${fmt(r.As)} mm²`],
          [`引張強さ / 降伏点 (${r.cls})`, `${r.Rm} / ${r.Re} MPa (区分の数字: ${r.cls.split(".")[0]}×100, ×0.${r.cls.split(".")[1]})`],
          ["降伏荷重 As · σy", `${fmt(r.yieldLoad / 1000)} kN`],
          ["保証荷重 As · Sp", `${fmt(r.proofLoad / 1000)} kN`],
          ["推奨締付力 (保証荷重の 70 %)", `${fmt(r.preload / 1000)} kN`, "good"],
          ["締付トルク T = K · F · d", `${fmt(r.torque)} N·m`, "good"],
          ["外力に対する安全率 (降伏)", fmt(r.yieldLoad / F, 2), safeClass(r.yieldLoad / F / 1.5)],
          ["締付力 > 外力 (継手が開かない)", r.preload > F ? "OK" : "NG — 締付力より外力が大きい", r.preload > F ? "good" : "bad"],
        ]);
      } catch (e) {
        out.innerHTML = err(e);
      }
    }
    update();
  },

  fit(host) {
    const { body, out } = shell(host, "はめあい (ISO 286 / JIS B 0401)");
    const f = form(
      [
        { key: "size", label: "基準寸法", type: "num", value: 20, unit: "mm" },
        { key: "hole", label: "穴", type: "select", value: "H7", options: HOLE_CLASSES.map((c) => [c, c]) },
        { key: "shaft", label: "軸", type: "select", value: "g6", options: SHAFT_CLASSES.map((c) => [c, c]) },
      ],
      update,
    );
    body.appendChild(f.el);
    function update() {
      try {
        const size = f.num("size");
        const r = fit(size, f.str("hole"), f.str("shaft"));
        const lo = Math.min(r.hole.lower, r.shaft.lower, 0) - 8;
        const hi = Math.max(r.hole.upper, r.shaft.upper, 0) + 8;
        const Y = (v: number) => 20 + ((hi - v) / (hi - lo)) * 160;
        const bar = (x: number, d: { upper: number; lower: number }, cls: string, lbl: string) =>
          `<rect class="${cls}" x="${x}" y="${Y(d.upper)}" width="90" height="${Math.max(2, Y(d.lower) - Y(d.upper))}"/>` +
          `<text class="tick" x="${x + 45}" y="${Y(d.upper) - 4}" text-anchor="middle">${d.upper > 0 ? "+" : ""}${fmt(d.upper)}</text>` +
          `<text class="tick" x="${x + 45}" y="${Y(d.lower) + 13}" text-anchor="middle">${d.lower > 0 ? "+" : ""}${fmt(d.lower)}</text>` +
          `<text class="lbl" x="${x + 45}" y="198" text-anchor="middle">${lbl}</text>`;
        const svg =
          `<svg class="tb-chart tb-fit" viewBox="0 0 360 206" aria-label="公差域">` +
          `<line class="axis" x1="20" x2="340" y1="${Y(0)}" y2="${Y(0)}"/><text class="tick" x="340" y="${Y(0) - 4}" text-anchor="end">基準線 (φ${fmt(size)})</text>` +
          bar(70, r.hole, "zone-hole", `穴 ${f.str("hole")}`) +
          bar(200, r.shaft, "zone-shaft", `軸 ${f.str("shaft")}`) +
          `<text class="tick" x="24" y="14">µm</text></svg>`;
        const mm = (v: number) => fmt(size + v / 1000, 6);
        out.innerHTML =
          `<div class="tb-split">${svg}` +
          table([
            ["穴の許容寸法", `${mm(r.hole.lower)} 〜 ${mm(r.hole.upper)} mm`],
            ["軸の許容寸法", `${mm(r.shaft.lower)} 〜 ${mm(r.shaft.upper)} mm`],
            ["最大すきま", `${fmt(r.maxClear)} µm${r.maxClear < 0 ? " (しめしろ)" : ""}`],
            ["最小すきま", `${fmt(r.minClear)} µm${r.minClear < 0 ? ` (最大しめしろ ${fmt(-r.minClear)} µm)` : ""}`],
            ["はめあいの種類", r.kind, r.kind === "すきまばめ" ? "good" : r.kind === "しまりばめ" ? "bad" : "warn"],
          ]) +
          "</div>";
      } catch (e) {
        out.innerHTML = err(e);
      }
    }
    update();
  },

  kt(host) {
    const { body, out } = shell(host, "穴あき板の応力集中");
    const f = form(
      [
        { key: "W", label: "板幅 W", type: "num", value: 50, unit: "mm" },
        { key: "d", label: "穴径 d", type: "num", value: 10, unit: "mm" },
        { key: "t", label: "板厚 t", type: "num", value: 5, unit: "mm" },
        { key: "F", label: "引張力 F", type: "num", value: 10000, unit: "N" },
      ],
      update,
    );
    body.appendChild(f.el);
    function update() {
      try {
        const W = f.num("W"), d = f.num("d"), t = f.num("t"), F = f.num("F");
        if (!(d > 0 && d < W && t > 0)) throw new Error("0 < 穴径 < 板幅 にしてください");
        const kt = ktPlateHole(d, W);
        const net = F / ((W - d) * t);
        const xs = Array.from({ length: 60 }, (_, i) => (i + 1) / 70);
        out.innerHTML =
          table([
            ["公称応力 (穴のない断面) F / (W·t)", `${fmt(F / (W * t))} MPa`],
            ["正味断面の応力 F / ((W−d)·t)", `${fmt(net)} MPa`],
            ["応力集中係数 Kt (Heywood)", fmt(kt, 3)],
            ["穴の縁の最大応力 Kt · σ<sub>net</sub>", `${fmt(kt * net)} MPa`, "warn"],
          ]) + lineChart([{ x: xs, y: xs.map((r) => ktPlateHole(r, 1)), color: "#b45309" }], { xLabel: "d / W", yLabel: "Kt", height: 150, yMin: 2, marks: [{ x: d / W, y: kt, text: `Kt = ${fmt(kt, 3)}` }] });
      } catch (e) {
        out.innerHTML = err(e);
      }
    }
    update();
  },

  materials(host) {
    const { body, out } = shell(host, "材料の比較 (代表値)");
    const f = form(
      [
        {
          key: "sort",
          label: "並べ替え",
          type: "select",
          value: "spE",
          options: [
            ["spE", "比剛性 E/ρ (軽くて曲がりにくい)"],
            ["spS", "比強度 σy/ρ (軽くて強い)"],
            ["E", "ヤング率 E"],
            ["sy", "降伏点 σy"],
            ["cost", "価格 (安い順)"],
          ],
        },
      ],
      update,
    );
    body.appendChild(f.el);
    function update() {
      const key = f.str("sort");
      const v = (m: (typeof MATERIAL_DATA)[number]) => (key === "spE" ? m.E / m.rho : key === "spS" ? (m.sy || m.su) / m.rho : key === "E" ? m.E : key === "sy" ? m.sy || m.su : -m.cost);
      const list = [...MATERIAL_DATA].sort((a, b) => v(b) - v(a));
      const max = Math.max(...list.map((m) => Math.abs(v(m))));
      out.innerHTML =
        `<div class="tb-scroll"><table class="tb-table"><tr><th>材料</th><th>E [GPa]</th><th>σy [MPa]</th><th>ρ [g/cm³]</th><th>価格比</th><th class="bar-h">${f.el.querySelector("select")!.selectedOptions[0].textContent!.split(" (")[0]}</th><th>主な用途</th></tr>` +
        list
          .map(
            (m) =>
              `<tr class="g-${m.group}"><td>${m.name}</td><td>${fmt(m.E)}</td><td>${m.sy ? m.sy : `(σB ${m.su})`}</td><td>${m.rho}</td><td>${m.cost}</td><td class="bar-c"><span class="bar" style="width:${(Math.abs(v(m)) / max) * 100}%"></span><b>${fmt(Math.abs(v(m)))}</b></td><td>${m.use}</td></tr>`,
          )
          .join("") +
        `</table></div><p class="tb-note">値は教育用の代表値です。実際の設計では材料メーカーの規格値・保証値を使ってください。価格比は SS400 を 1 とした kg あたりのおおよその目安です。</p>`;
    }
    update();
  },

  stress(host) {
    const { body, out } = shell(host, "引張・圧縮の応力とひずみ");
    const f = form(
      [
        { key: "F", label: "力 F", type: "num", value: 10000, unit: "N" },
        { key: "d", label: "丸棒の直径 d", type: "num", value: 10, unit: "mm" },
        { key: "L", label: "長さ L", type: "num", value: 200, unit: "mm" },
        { key: "mat", label: "材料", type: "select", value: "0", options: matOptions },
      ],
      update,
    );
    body.appendChild(f.el);
    function update() {
      try {
        const m = metals[Number(f.str("mat"))];
        const A = (Math.PI * f.num("d") ** 2) / 4;
        const s = f.num("F") / A;
        const eps = s / (m.E * 1000);
        out.innerHTML = table([
          ["断面積 A = πd²/4", `${fmt(A)} mm²`],
          ["応力 σ = F / A", `${fmt(s)} MPa`],
          ["ひずみ ε = σ / E", `${fmt(eps * 1e6)} × 10⁻⁶ (${fmt(eps * 100)} %)`],
          ["伸び λ = ε · L", `${fmt(eps * f.num("L"))} mm`],
          [`安全率 σy / σ (σy = ${m.sy} MPa)`, fmt(safetyFactor(m.sy, s), 2), safeClass(safetyFactor(m.sy, s))],
        ]);
      } catch (e) {
        out.innerHTML = err(e);
      }
    }
    update();
  },

  stack(host) {
    const { body, out } = shell(host, "寸法公差の積み上げ (ワーストケースと二乗和)");
    const f = form(
      [
        { key: "n", label: "部品の数", type: "num", value: 5, min: 1, step: 1 },
        { key: "tol", label: "1 部品の公差 ±", type: "num", value: 0.1, unit: "mm", step: 0.01 },
      ],
      update,
    );
    body.appendChild(f.el);
    function update() {
      const n = Math.max(1, Math.round(f.num("n")));
      const t = f.num("tol");
      const wc = n * t;
      const rss = Math.sqrt(n) * t;
      const ns = Array.from({ length: 12 }, (_, i) => i + 1);
      out.innerHTML =
        table([
          ["ワーストケース (単純加算) n · t", `± ${fmt(wc)} mm`, "warn"],
          ["二乗和平方根 (RSS) √n · t", `± ${fmt(rss)} mm`, "good"],
          ["RSS / ワーストケース", `${fmt((rss / wc) * 100)} %`],
        ]) +
        lineChart(
          [
            { x: ns, y: ns.map((k) => k * t), color: "#b45309", label: "ワーストケース" },
            { x: ns, y: ns.map((k) => Math.sqrt(k) * t), color: "#0f766e", label: "RSS" },
          ],
          { xLabel: "部品の数 n", yLabel: "合計の公差 ± [mm]", height: 160, marks: [{ x: n, y: wc, text: fmt(wc) }] },
        );
    }
    update();
  },

  ratio(host) {
    const { body, out } = shell(host, "比率と見え方");
    const f = form(
      [
        {
          key: "r",
          label: "縦横比",
          type: "select",
          value: "1.618",
          options: [
            ["1", "1 : 1 (正方形 — 安定・静的)"],
            ["1.414", "1 : √2 (白銀比 — 用紙 A 判)"],
            ["1.618", "1 : 1.618 (黄金比)"],
            ["1.778", "9 : 16 (ディスプレイ)"],
            ["3", "1 : 3 (細長い — 動き・方向性)"],
          ],
        },
        { key: "R", label: "角の丸み R (短辺比 %)", type: "num", value: 8, unit: "%", min: 0 },
      ],
      update,
    );
    body.appendChild(f.el);
    function update() {
      const r = f.num("r") || 1;
      const h = 110, w = Math.min(330, h * r);
      const hh = w / r;
      const R = (Math.min(w, hh) * Math.max(0, f.num("R"))) / 100;
      const x = (360 - w) / 2, y = (140 - hh) / 2;
      const sq = r > 1.2 ? `<line class="guide" x1="${x + hh}" x2="${x + hh}" y1="${y}" y2="${y + hh}"/>` : "";
      out.innerHTML = `<svg class="tb-chart" viewBox="0 0 360 140" aria-label="比率"><rect class="sec" x="${x}" y="${y}" width="${w}" height="${hh}" rx="${R}"/>${sq}<text class="tick" x="180" y="136" text-anchor="middle">1 : ${fmt(r, 4)}${R ? ` / R ${fmt(R / Math.min(w, hh) * 100)} %` : ""}</text></svg>`;
    }
    update();
  },
};

/** Schematic of the beam case (supports, load arrows). */
function diagram(kind: BeamCase, aRatio: number): string {
  const x0 = 40, x1 = 520, y = 40;
  const ax = x0 + (x1 - x0) * Math.min(Math.max(aRatio, 0), 1);
  let s = `<svg class="tb-chart tb-beam" viewBox="0 0 560 80" aria-label="はりの模式図"><rect class="beam" x="${x0}" y="${y - 5}" width="${x1 - x0}" height="10"/>`;
  if (kind.startsWith("cantilever")) s += `<rect class="wall" x="${x0 - 14}" y="${y - 28}" width="14" height="56"/>`;
  else s += `<path class="sup" d="M${x0},${y + 5}l-10,16h20z"/><path class="sup" d="M${x1},${y + 5}l-10,16h20z"/><line class="sup" x1="${x1 - 14}" x2="${x1 + 14}" y1="${y + 25}" y2="${y + 25}"/>`;
  const arrow = (x: number) => `<path class="load" d="M${x},${y - 32}v24m-5,-7l5,7l5,-7"/>`;
  if (kind.endsWith("udl")) {
    for (let i = 0; i <= 12; i++) s += arrow(x0 + ((x1 - x0) * i) / 12);
    s += `<line class="load" x1="${x0}" x2="${x1}" y1="${y - 32}" y2="${y - 32}"/>`;
  } else s += arrow(kind === "cantilever-point" ? x1 : ax);
  return s + "</svg>";
}

export function mountWidgets(root: HTMLElement) {
  for (const el of root.querySelectorAll<HTMLElement>("[data-widget]")) {
    const w = WIDGETS[el.dataset.widget!];
    if (w) w(el);
  }
}

export const WIDGET_NAMES = Object.keys(WIDGETS);
