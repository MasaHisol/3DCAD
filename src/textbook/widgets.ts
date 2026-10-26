// Interactive calculators embedded in the textbook pages (<div data-widget="...">).
import { ANIM } from "./anim";
import { ANIM2 } from "./anim2";
import { ANIM3 } from "./anim3";
import { ANIM4 } from "./anim4";
import { ANIM5 } from "./anim5";
import { ANIM6 } from "./anim6";
import { ANIM7 } from "./anim7";
import { VIEW3D } from "./viewer3d";
import { fmt, lineChart } from "./chart";
import { renderMath } from "./math";
import {
  charHeight,
  filletWeld,
  goodman,
  reliability,
  wireDrop,
  airCylinder,
  cadPoint,
  cylinderThickness,
  motorSizing,
  planeStress,
  thinCylinder,
  beam,
  BEARINGS,
  bearingLife,
  beltDrive,
  cantileverFrequency,
  coilSpring,
  conduction,
  equivalentLoad,
  fourBar,
  gearPair,
  grashof,
  keyCheck,
  naturalFrequency,
  response,
  THERMAL,
  unitCost,
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
    const fire = () => {
      // invalid numbers are flagged and the last valid result stays on screen
      if (f.type === "num") {
        const i = inp as HTMLInputElement;
        const v = Number(i.value);
        const bad = i.value.trim() === "" || !Number.isFinite(v) || (f.min !== undefined && v < f.min);
        i.setAttribute("aria-invalid", String(bad));
        row.classList.toggle("invalid", bad);
        row.title = bad ? (f.min !== undefined ? `${f.min} 以上の数値を入力してください` : "数値を入力してください") : "";
        if (bad) return;
      }
      onChange();
    };
    inp.addEventListener("input", fire);
    inp.addEventListener("change", fire);
    inp.setAttribute("aria-label", f.label + (f.type === "num" && f.unit ? ` [${f.unit}]` : ""));
    if (f.type === "num") (inp as HTMLInputElement).inputMode = "decimal";
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
  head.innerHTML = `<span class="tb-widget-badge">計算ツール</span><span class="tb-widget-title">${title}</span>`;
  const tools = document.createElement("span");
  tools.className = "tb-transport";
  const copy = document.createElement("button");
  copy.type = "button";
  copy.className = "tb-tr-btn tb-copy";
  copy.textContent = "結果をコピー";
  copy.title = "入力値と結果をテキストでコピー";
  tools.appendChild(copy);
  const mount = (host as HTMLElement & { __tbMount?: () => void }).__tbMount;
  if (mount) {
    const reset = document.createElement("button");
    reset.type = "button";
    reset.className = "tb-tr-btn";
    reset.textContent = "↺";
    reset.title = "初期値に戻す";
    reset.setAttribute("aria-label", "初期値に戻す");
    reset.addEventListener("click", () => mount());
    tools.appendChild(reset);
  }
  head.appendChild(tools);
  const body = document.createElement("div");
  body.className = "tb-widget-body";
  const out = document.createElement("div");
  out.className = "tb-widget-out";
  out.setAttribute("aria-live", "polite");
  host.append(head, body, out);
  copy.addEventListener("click", () => {
    const lines = [title, ""];
    for (const r of body.querySelectorAll<HTMLElement>(".tb-field:not(.hidden)")) {
      const i = r.querySelector<HTMLInputElement | HTMLSelectElement>("input, select");
      if (!i) continue;
      const v = i instanceof HTMLSelectElement ? i.selectedOptions[0]?.textContent ?? i.value : i.value;
      lines.push(`${r.querySelector("span")?.textContent ?? ""}: ${v} ${r.querySelector("small")?.textContent ?? ""}`.trim());
    }
    lines.push("");
    for (const tr of out.querySelectorAll<HTMLTableRowElement>(".tb-res tr")) {
      const th = tr.querySelector("th")?.querySelector(".tb-res-n")?.textContent ?? tr.querySelector("th")?.textContent ?? "";
      const f = tr.querySelector<HTMLElement>(".tb-res-f")?.dataset.f;
      lines.push(`${th}${f ? ` (${f})` : ""}\t${tr.querySelector("td")?.textContent ?? ""}`);
    }
    const text = lines.join("\n");
    const done = (ok: boolean) => {
      copy.textContent = ok ? "コピーしました ✓" : "コピーできませんでした";
      setTimeout(() => (copy.textContent = "結果をコピー"), 1600);
    };
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(() => done(true), () => done(false));
    else done(false);
  });
  // TeX written as <span class="tb-m">…</span> in results is typeset; results flash briefly when they change
  if (typeof MutationObserver === "function") {
    let t = 0;
    new MutationObserver(() => {
      if (out.querySelector(".tb-m:not([data-tex])")) renderMath(out);
      out.classList.remove("tb-flash");
      clearTimeout(t);
      t = window.setTimeout(() => out.classList.add("tb-flash"), 0);
    }).observe(out, { childList: true });
  }
  return { body, out };
}

/** "せん断応力 τ = F / (a·l·n)" → name + formula (the formula is set as math). */
function splitFormula(label: string): [string, string] {
  const i = label.indexOf(" = ");
  if (i < 0) return [label, ""];
  const sp = label.lastIndexOf(" ", i - 1);
  if (sp <= 0 || label[sp + 1] === "(") return [label, ""];
  return [label.slice(0, sp), label.slice(sp + 1)];
}

const table = (rows: [string, string, string?][]) =>
  `<table class="tb-res">${rows
    .map(([k, v, cls]) => {
      const [n, f] = splitFormula(k);
      const th = f ? `<span class="tb-res-n">${n}</span><span class="tb-res-f" data-f="${f.replace(/<[^>]+>/g, "").replace(/"/g, "&quot;")}">${f}</span>` : k;
      return `<tr${cls ? ` class="${cls}"` : ""}><th>${th}</th><td>${v}</td></tr>`;
    })
    .join("")}</table>`;

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

const MORE: Record<string, (host: HTMLElement) => void> = {
  bearing(host) {
    const { body, out } = shell(host, "転がり軸受の寿命 (基本定格寿命 L10)");
    const f = form(
      [
        { key: "brg", label: "軸受 (深溝玉)", type: "select", value: "6204", options: BEARINGS.map((b) => [b.name, `${b.name} (内径 ${b.d} × 外径 ${b.D} × 幅 ${b.B})`]) },
        { key: "Fr", label: "ラジアル荷重 Fr", type: "num", value: 1500, unit: "N" },
        { key: "Fa", label: "アキシアル荷重 Fa", type: "num", value: 0, unit: "N" },
        { key: "n", label: "回転数", type: "num", value: 1450, unit: "min⁻¹" },
        { key: "fw", label: "荷重係数 fw (衝撃)", type: "num", value: 1.2, step: 0.1 },
      ],
      update,
    );
    body.appendChild(f.el);
    function update() {
      try {
        const b = BEARINGS.find((x) => x.name === f.str("brg"))!;
        const P = equivalentLoad(f.num("Fr"), f.num("Fa")) * f.num("fw");
        const r = bearingLife(b.Cr * 1000, P, f.num("n"));
        const years = r.hours / (8 * 250);
        out.innerHTML = table([
          ["基本動定格荷重 Cr / 静定格荷重 C0r", `${b.Cr} kN / ${b.C0r} kN`],
          ["動等価荷重 P (× fw)", `${fmt(P)} N`],
          ["定格寿命 L10 = (C/P)³ × 10⁶", `${fmt(r.L10 / 1e6)} × 10⁶ 回転`],
          ["寿命時間 L10h = L10 / 60n", `${fmt(r.hours)} 時間`, r.hours >= 20000 ? "good" : r.hours >= 5000 ? "warn" : "bad"],
          ["1 日 8 時間・年 250 日で", `約 ${fmt(years, 2)} 年`],
          ["静的安全係数 C0r / P", fmt((b.C0r * 1000) / P, 2), (b.C0r * 1000) / P >= 1.5 ? "good" : "warn"],
        ]) + `<p class="tb-note">目安: 一般機械 2〜3 万時間、連続運転の機械 4〜6 万時間。値はカタログの代表値です。Fa / Fr が大きい場合は X = 0.56、Y ≈ 1.6 で概算しています。</p>`;
      } catch (e) {
        out.innerHTML = err(e);
      }
    }
    update();
  },

  gear(host) {
    const { body, out } = shell(host, "平歯車の寸法と速比");
    const f = form(
      [
        { key: "m", label: "モジュール m", type: "num", value: 2, step: 0.5 },
        { key: "z1", label: "小歯車の歯数 z₁", type: "num", value: 20, step: 1 },
        { key: "z2", label: "大歯車の歯数 z₂", type: "num", value: 60, step: 1 },
        { key: "n1", label: "入力回転数", type: "num", value: 1500, unit: "min⁻¹" },
        { key: "T1", label: "入力トルク", type: "num", value: 10, unit: "N·m" },
        { key: "eff", label: "効率", type: "num", value: 0.98, step: 0.01 },
      ],
      update,
    );
    body.appendChild(f.el);
    function update() {
      try {
        const g = gearPair(f.num("m"), Math.round(f.num("z1")), Math.round(f.num("z2")), f.num("n1"), f.num("T1") * 1000, f.num("eff"));
        const k = 150 / (g.da1 + g.da2);
        const r1 = (g.d1 / 2) * k, r2 = (g.d2 / 2) * k;
        const cx1 = 20 + (g.da1 / 2) * k, cx2 = cx1 + g.a * k;
        const svg = `<svg class="tb-chart" viewBox="0 0 ${cx2 + (g.da2 / 2) * k + 20} ${(g.da2 * k) + 20}" aria-label="歯車"><g transform="translate(0 ${(g.da2 * k) / 2 + 10})">
          <circle class="sec" cx="${cx1}" cy="0" r="${(g.da1 / 2) * k}"/><circle class="sec" cx="${cx2}" cy="0" r="${(g.da2 / 2) * k}"/>
          <circle cx="${cx1}" cy="0" r="${r1}" fill="none" class="guide"/><circle cx="${cx2}" cy="0" r="${r2}" fill="none" class="guide"/>
          <line class="axis" x1="${cx1}" x2="${cx2}" y1="0" y2="0"/><text class="tick" x="${(cx1 + cx2) / 2 + r1 / 2}" y="14" text-anchor="middle">a = ${fmt(g.a)}</text></g></svg>`;
        out.innerHTML =
          `<div class="tb-split">${svg}` +
          table([
            ["ピッチ円直径 d = m·z", `${fmt(g.d1)} / ${fmt(g.d2)} mm`],
            ["歯先円直径 da = m(z + 2)", `${fmt(g.da1)} / ${fmt(g.da2)} mm`],
            ["中心距離 a = m(z₁ + z₂)/2", `${fmt(g.a)} mm`],
            ["速比 i = z₂ / z₁", fmt(g.ratio, 4)],
            ["出力回転数 / 出力トルク", `${fmt(g.rpm2)} min⁻¹ / ${fmt(g.T2 / 1000)} N·m`],
            ["接線力 Ft = 2T / d₁", `${fmt(g.Ft)} N`],
            ["ピッチ円周速度", `${fmt(g.v)} m/s`],
            ["切下げ", g.undercut ? "歯数 17 未満 — 切下げに注意 (転位で回避)" : "なし (歯数 17 以上)", g.undercut ? "warn" : "good"],
          ]) +
          "</div>";
      } catch (e) {
        out.innerHTML = err(e);
      }
    }
    update();
  },

  spring(host) {
    const { body, out } = shell(host, "圧縮コイルばね");
    const f = form(
      [
        { key: "d", label: "線径 d", type: "num", value: 2, unit: "mm", step: 0.1 },
        { key: "D", label: "コイル平均径 D", type: "num", value: 16, unit: "mm" },
        { key: "n", label: "有効巻数 n", type: "num", value: 8 },
        { key: "G", label: "材料", type: "select", value: "78500", options: [["78500", "ピアノ線・硬鋼線 (G = 78.5 GPa)"], ["68500", "ステンレス SUS304-WPB (G = 68.5 GPa)"]] },
        { key: "x", label: "たわみ量", type: "num", value: 10, unit: "mm" },
      ],
      update,
    );
    body.appendChild(f.el);
    function update() {
      try {
        const r = coilSpring(f.num("d"), f.num("D"), f.num("n"), Number(f.str("G")), f.num("x"));
        out.innerHTML = table([
          ["ばね定数 k = G d⁴ / (8 D³ n)", `${fmt(r.k)} N/mm`],
          ["荷重 P = k · δ", `${fmt(r.P)} N`],
          ["ばね指数 c = D / d", fmt(r.c, 3), r.c >= 4 && r.c <= 10 ? "good" : "warn"],
          ["応力修正係数 (ワール) κ", fmt(r.Kw, 3)],
          ["ねじり応力 τ = κ · 8PD / (πd³)", `${fmt(r.tau)} MPa`, r.tau < 0.45 * 1800 ? "" : "warn"],
        ]) + `<p class="tb-note">ばね指数は 4〜10 が作りやすい範囲。許容ねじり応力はピアノ線で引張強さの 40〜50 % 程度 (線径により異なる) が目安です。</p>`;
      } catch (e) {
        out.innerHTML = err(e);
      }
    }
    update();
  },

  key(host) {
    const { body, out } = shell(host, "平行キーの強度");
    const f = form(
      [
        { key: "d", label: "軸径 d", type: "num", value: 20, unit: "mm" },
        { key: "T", label: "伝達トルク T", type: "num", value: 50, unit: "N·m" },
        { key: "l", label: "キーの有効長さ l", type: "num", value: 25, unit: "mm" },
      ],
      update,
    );
    body.appendChild(f.el);
    function update() {
      try {
        const k = keyCheck(f.num("d"), f.num("T") * 1000, f.num("l"));
        out.innerHTML = table([
          ["呼び寸法 b × h (JIS B 1301)", `${k.b} × ${k.h} mm (軸溝深さ t₁ = ${k.t1})`],
          ["軸表面の接線力 F = 2T / d", `${fmt(k.F)} N`],
          ["せん断応力 τ = F / (b·l)", `${fmt(k.shear)} MPa`, k.shear < 40 ? "good" : "warn"],
          ["側面の面圧 p = F / ((h − t₁)·l)", `${fmt(k.pressure)} MPa`, k.pressure < 100 ? "good" : "bad"],
        ]) + `<p class="tb-note">S45C のキーで、許容せん断応力 約 40 MPa、許容面圧 約 100 MPa (ボス側が鋳鉄なら 50 MPa 程度) が一般的な目安です。キーの長さは軸径の 1.5 倍程度まで。</p>`;
      } catch (e) {
        out.innerHTML = err(e);
      }
    }
    update();
  },

  belt(host) {
    const { body, out } = shell(host, "ベルト伝動 (オープンベルト)");
    const f = form(
      [
        { key: "D1", label: "駆動プーリ径 D₁", type: "num", value: 100, unit: "mm" },
        { key: "D2", label: "従動プーリ径 D₂", type: "num", value: 250, unit: "mm" },
        { key: "C", label: "軸間距離 C", type: "num", value: 400, unit: "mm" },
        { key: "n1", label: "駆動側回転数", type: "num", value: 1450, unit: "min⁻¹" },
      ],
      update,
    );
    body.appendChild(f.el);
    function update() {
      try {
        const b = beltDrive(f.num("D1"), f.num("D2"), f.num("C"), f.num("n1"));
        out.innerHTML = table([
          ["速比 D₂ / D₁", fmt(b.ratio, 4)],
          ["従動側回転数", `${fmt(b.rpm2)} min⁻¹`],
          ["ベルト長さ L = 2C + π(D₁+D₂)/2 + (D₂−D₁)²/4C", `${fmt(b.L)} mm`],
          ["小プーリの巻き掛け角", `${fmt(b.wrap)}°`, b.wrap >= 120 ? "good" : "bad"],
          ["ベルト速度", `${fmt(b.v)} m/s`, b.v <= 30 ? "" : "warn"],
        ]) + `<p class="tb-note">巻き掛け角は 120° 以上 (できれば 150° 以上) にします。小さいと滑りやすくなります。実際のベルトは規格長さから選び、軸間距離を調整します。</p>`;
      } catch (e) {
        out.innerHTML = err(e);
      }
    }
    update();
  },

  linkage(host) {
    const { body, out } = shell(host, "四節リンク機構");
    const f = form(
      [
        { key: "a", label: "クランク (入力) a", type: "num", value: 20, unit: "mm" },
        { key: "b", label: "連結リンク b", type: "num", value: 70, unit: "mm" },
        { key: "c", label: "てこ (出力) c", type: "num", value: 50, unit: "mm" },
        { key: "d", label: "固定リンク d", type: "num", value: 60, unit: "mm" },
        { key: "th", label: "クランク角 θ", type: "num", value: 30, unit: "°" },
      ],
      update,
    );
    body.appendChild(f.el);
    const play = document.createElement("button");
    play.className = "tb-btn";
    play.textContent = "▶ クランクを回す";
    body.appendChild(play);
    let timer = 0;
    play.addEventListener("click", () => {
      if (timer) {
        clearInterval(timer);
        timer = 0;
        play.textContent = "▶ クランクを回す";
        return;
      }
      play.textContent = "■ 止める";
      timer = window.setInterval(() => {
        if (!host.isConnected) return clearInterval(timer);
        f.set("th", (f.num("th") + 4) % 360);
        update();
      }, 50);
    });
    function update() {
      const a = f.num("a"), b = f.num("b"), c = f.num("c"), d = f.num("d");
      const g = grashof(a, b, c, d);
      const p = fourBar(a, b, c, d, f.num("th"));
      // rocker swing range and the area swept by the joints over a full turn
      const angles: number[] = [];
      const xs = [0, d], ys = [0, 0];
      for (let t = 0; t < 360; t += 2) {
        const q = fourBar(a, b, c, d, t);
        if (!q) continue;
        angles.push(q.rockerAngle);
        xs.push(q.A[0], q.B[0]);
        ys.push(q.A[1], q.B[1]);
      }
      const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
      const k = Math.min(480 / Math.max(x1 - x0, 1), 200 / Math.max(y1 - y0, 1));
      const ox = 260 - ((x0 + x1) / 2) * k, oy = 120 + ((y0 + y1) / 2) * k;
      const P = (x: number, y: number) => `${(ox + x * k).toFixed(1)},${(oy - y * k).toFixed(1)}`;
      let svg = `<svg class="tb-chart tb-linkage" viewBox="0 0 520 260" aria-label="四節リンク"><path class="ground" d="M${ox - 14},${oy + 9} L${ox + d * k + 14},${oy + 9}"/>`;
      if (p) {
        svg += `<polyline class="lk" points="${P(0, 0)} ${P(p.A[0], p.A[1])} ${P(p.B[0], p.B[1])} ${P(d, 0)}"/>`;
        svg += [P(0, 0), P(p.A[0], p.A[1]), P(p.B[0], p.B[1]), P(d, 0)].map((q) => `<circle class="pin" cx="${q.split(",")[0]}" cy="${q.split(",")[1]}" r="4"/>`).join("");
      }
      svg += `<text class="tick" x="${ox}" y="${oy + 28}" text-anchor="middle">O₂</text><text class="tick" x="${ox + d * k}" y="${oy + 28}" text-anchor="middle">O₄</text></svg>`;
      const swing = angles.length ? Math.max(...angles) - Math.min(...angles) : 0;
      out.innerHTML =
        svg +
        table([
          ["グラスホフの条件 (最短 + 最長 ≤ 他の 2 本の和)", g.ok ? "満たす" : "満たさない", g.ok ? "good" : "warn"],
          ["機構の種類", g.kind],
          ["この角度で組み立てられるか", p ? "はい" : "いいえ (リンクが届かない)", p ? "" : "bad"],
          ["出力リンクの角度", p ? `${fmt(p.rockerAngle, 4)}°` : "—"],
          ["出力の揺動角 (1 回転あたり)", angles.length === 180 ? `${fmt(swing, 3)}°` : "全周では動かない"],
        ]);
    }
    update();
  },

  vibration(host) {
    const { body, out } = shell(host, "ばね-質量系の振動と防振");
    const f = form(
      [
        { key: "m", label: "質量 m", type: "num", value: 20, unit: "kg" },
        { key: "k", label: "ばね定数 k (合計)", type: "num", value: 50, unit: "N/mm" },
        { key: "z", label: "減衰比 ζ", type: "num", value: 0.05, step: 0.01 },
        { key: "f", label: "加振周波数 (回転数/60)", type: "num", value: 25, unit: "Hz" },
      ],
      update,
    );
    body.appendChild(f.el);
    function update() {
      try {
        const fn = naturalFrequency(f.num("k"), f.num("m"));
        const r = f.num("f") / fn;
        const z = f.num("z");
        const res = response(r, z);
        const rs = Array.from({ length: 150 }, (_, i) => (i + 1) * 0.02);
        out.innerHTML =
          table([
            ["固有振動数 fn = (1/2π)√(k/m)", `${fmt(fn)} Hz`],
            ["振動数比 f / fn", fmt(r, 3), Math.abs(r - 1) < 0.3 ? "bad" : ""],
            ["応答倍率 (変位)", fmt(res.magnification, 3), res.magnification > 3 ? "bad" : ""],
            ["力の伝達率 (床へ伝わる割合)", `${fmt(res.transmissibility * 100, 3)} %`, res.transmissibility < 1 ? "good" : "warn"],
            ["判定", r > Math.SQRT2 ? "防振領域 (f > √2·fn)" : Math.abs(r - 1) < 0.3 ? "共振に近い — 危険" : "伝達率 > 1 (振動が増幅される)", r > Math.SQRT2 ? "good" : "warn"],
          ]) +
          lineChart(
            [{ x: rs, y: rs.map((x) => Math.min(response(x, z).transmissibility, 12)), color: "#2563eb" }],
            { xLabel: "振動数比 f / fn", yLabel: "伝達率", height: 150, marks: [{ x: Math.min(r, 3), y: Math.min(res.transmissibility, 12), text: "現在" }] },
          );
      } catch (e) {
        out.innerHTML = err(e);
      }
    }
    update();
  },

  cantilevervib(host) {
    const { body, out } = shell(host, "片持ちはりの 1 次固有振動数");
    const f = form([{ key: "L", label: "長さ L", type: "num", value: 500, unit: "mm" }, { key: "mat", label: "材料", type: "select", value: "0", options: matOptions }, ...SECTION_FIELDS], update);
    body.appendChild(f.el);
    function update() {
      try {
        const { props: s } = readSection(f);
        const m = metals[Number(f.str("mat"))];
        const fr = cantileverFrequency(m.E * 1000, s.I, s.A, m.rho, f.num("L"));
        out.innerHTML = table([
          ["1 次固有振動数 f₁ = (1.875² / 2π) √(EI / ρAL⁴)", `${fmt(fr)} Hz`],
          ["長さを 2 倍にすると", `${fmt(fr / 4)} Hz (1/4)`],
        ]);
      } catch (e) {
        out.innerHTML = err(e);
      }
    }
    update();
  },

  thermal(host) {
    const { body, out } = shell(host, "熱膨張と熱伝導");
    const f = form(
      [
        { key: "mat", label: "材料", type: "select", value: "2", options: THERMAL.map((t, i) => [String(i), `${t.name} (α ${t.alpha}×10⁻⁶/K, λ ${t.k} W/mK)`]) },
        { key: "L", label: "長さ L", type: "num", value: 500, unit: "mm" },
        { key: "dT", label: "温度変化・温度差 ΔT", type: "num", value: 40, unit: "K" },
        { key: "A", label: "伝熱面積 A", type: "num", value: 10000, unit: "mm²" },
        { key: "t", label: "板厚 t", type: "num", value: 5, unit: "mm" },
      ],
      update,
    );
    body.appendChild(f.el);
    function update() {
      try {
        const m = THERMAL[Number(f.str("mat"))];
        const dL = m.alpha * 1e-6 * f.num("L") * f.num("dT");
        out.innerHTML = table([
          ["伸び ΔL = α · L · ΔT", `${fmt(dL * 1000)} µm (${fmt(dL)} mm)`],
          ["板を通る熱流 Q = λ A ΔT / t", `${fmt(conduction(m.k, f.num("A"), f.num("t"), f.num("dT")))} W`],
          ["熱抵抗 R = t / (λ A)", `${fmt(f.num("t") / 1000 / (m.k * f.num("A") * 1e-6))} K/W`],
        ]);
      } catch (e) {
        out.innerHTML = err(e);
      }
    }
    update();
  },

  cost(host) {
    const { body, out } = shell(host, "部品単価の見積もり (切削 vs 樹脂成形)");
    const f = form(
      [
        { key: "q", label: "生産数量", type: "num", value: 1000, step: 1 },
        { key: "mc", label: "切削: 材料費", type: "num", value: 300, unit: "円/個" },
        { key: "cy", label: "切削: 加工時間", type: "num", value: 12, unit: "分/個" },
        { key: "rate", label: "切削: チャージ", type: "num", value: 6000, unit: "円/時" },
        { key: "su", label: "切削: 段取り", type: "num", value: 90, unit: "分/ロット" },
        { key: "lot", label: "ロット数", type: "num", value: 50, step: 1 },
        { key: "die", label: "成形: 金型費", type: "num", value: 1500000, unit: "円" },
        { key: "mp", label: "成形: 材料+成形費", type: "num", value: 60, unit: "円/個" },
      ],
      update,
    );
    body.appendChild(f.el);
    function update() {
      try {
        const cut = (q: number) => unitCost({ material: f.num("mc"), setupMin: f.num("su"), cycleMin: f.num("cy"), rate: f.num("rate"), tooling: 0, lot: Math.max(1, Math.min(f.num("lot"), q)), quantity: q });
        const mold = (q: number) => f.num("mp") + f.num("die") / q;
        const q = Math.max(1, Math.round(f.num("q")));
        const c = cut(q);
        const qs = Array.from({ length: 60 }, (_, i) => Math.round(10 ** (1 + (i * 4) / 59)));
        // exact break-even once the lot is full: die / q + mold part = cutting unit cost
        const full = cut(Math.max(1, f.num("lot"))).total;
        const exact = full > f.num("mp") ? f.num("die") / (full - f.num("mp")) : Infinity;
        const be = exact >= f.num("lot") ? (Number.isFinite(exact) ? Math.ceil(exact) : undefined) : qs.find((x) => mold(x) < cut(x).total);
        const cap = 3 * Math.max(cut(10).total, f.num("mp"));
        out.innerHTML =
          table([
            ["切削の単価 (材料 + 加工 + 段取り)", `${fmt(c.total)} 円 = ${fmt(c.material)} + ${fmt(c.machining)} + ${fmt(c.setup)}`],
            ["樹脂成形の単価 (材料・成形 + 金型償却)", `${fmt(mold(q))} 円`],
            ["有利な工法", mold(q) < c.total ? "樹脂成形" : "切削", "good"],
            ["損益分岐の数量 (目安)", be ? `約 ${fmt(be)} 個` : "この範囲では切削が有利"],
          ]) +
          lineChart(
            [
              { x: qs.map((x) => Math.log10(x)), y: qs.map((x) => Math.min(cut(x).total, cap)), color: "#b45309", label: "切削" },
              { x: qs.map((x) => Math.log10(x)), y: qs.map((x) => Math.min(mold(x), cap)), color: "#0f766e", label: "成形" },
            ],
            { xLabel: "数量 (log₁₀: 1 = 10 個, 3 = 1000 個)", yLabel: "単価 [円]", height: 170 },
          );
      } catch (e) {
        out.innerHTML = err(e);
      }
    }
    update();
  },
};

const MORE2: Record<string, (host: HTMLElement) => void> = {
  coords(host) {
    const { body, out } = shell(host, "座標入力 (絶対・相対・極座標)");
    const f = form(
      [
        { key: "x0", label: "始点 X", type: "num", value: 20, unit: "mm" },
        { key: "y0", label: "始点 Y", type: "num", value: 10, unit: "mm" },
        { key: "mode", label: "入力方法", type: "select", value: "polar", options: [["abs", "絶対座標 (X, Y)"], ["rel", "相対座標 @ΔX, ΔY"], ["polar", "極座標 @距離 < 角度"]] },
        { key: "a", label: "X / ΔX / 距離", type: "num", value: 50 },
        { key: "b", label: "Y / ΔY / 角度 (°)", type: "num", value: 30 },
      ],
      update,
    );
    body.appendChild(f.el);
    function update() {
      const mode = f.str("mode") as "abs" | "rel" | "polar";
      const s: [number, number] = [f.num("x0"), f.num("y0")];
      const e = cadPoint(s, mode, f.num("a"), f.num("b"));
      const xs = [0, s[0], e[0]], ys = [0, s[1], e[1]];
      const x0 = Math.min(...xs) - 10, x1 = Math.max(...xs) + 10, y0 = Math.min(...ys) - 10, y1 = Math.max(...ys) + 10;
      const k = Math.min(480 / (x1 - x0), 200 / (y1 - y0));
      const X = (x: number) => 20 + (x - x0) * k, Y = (y: number) => 215 - (y - y0) * k;
      const text = mode === "abs" ? `${fmt(f.num("a"))}, ${fmt(f.num("b"))}` : mode === "rel" ? `@${fmt(f.num("a"))}, ${fmt(f.num("b"))}` : `@${fmt(f.num("a"))}<${fmt(f.num("b"))}`;
      out.innerHTML =
        `<svg class="tb-chart" viewBox="0 0 520 230" aria-label="座標"><line class="axis" x1="${X(x0)}" x2="${X(x1)}" y1="${Y(0)}" y2="${Y(0)}"/><line class="axis" x1="${X(0)}" x2="${X(0)}" y1="${Y(y0)}" y2="${Y(y1)}"/>` +
        `<text class="tick" x="${X(0) + 4}" y="${Y(0) + 14}">原点 (0, 0)</text>` +
        (mode === "polar" ? `<line class="guide" x1="${X(s[0])}" x2="${X(s[0]) + 60}" y1="${Y(s[1])}" y2="${Y(s[1])}"/>` : "") +
        `<line x1="${X(s[0])}" y1="${Y(s[1])}" x2="${X(e[0])}" y2="${Y(e[1])}" stroke="var(--tb-accent)" stroke-width="3"/>` +
        `<circle class="mark" cx="${X(s[0])}" cy="${Y(s[1])}" r="4"/><circle class="mark" cx="${X(e[0])}" cy="${Y(e[1])}" r="4"/>` +
        `<text class="mark-t" x="${X(s[0])}" y="${Y(s[1]) + 18}" text-anchor="middle">始点</text><text class="mark-t" x="${X(e[0])}" y="${Y(e[1]) - 8}" text-anchor="middle">${text}</text></svg>` +
        table([
          ["終点の絶対座標", `(${fmt(e[0], 5)}, ${fmt(e[1], 5)})`, "good"],
          ["始点からの相対", `@${fmt(e[0] - s[0], 5)}, ${fmt(e[1] - s[1], 5)}`],
          ["始点からの極座標", `@${fmt(Math.hypot(e[0] - s[0], e[1] - s[1]), 5)} < ${fmt((Math.atan2(e[1] - s[1], e[0] - s[0]) * 180) / Math.PI, 5)}°`],
        ]);
    }
    update();
  },

  mohr(host) {
    const { body, out } = shell(host, "組合せ応力とモールの応力円");
    const f = form(
      [
        { key: "sx", label: "σx", type: "num", value: 80, unit: "MPa" },
        { key: "sy", label: "σy", type: "num", value: -40, unit: "MPa" },
        { key: "t", label: "τxy", type: "num", value: 45, unit: "MPa" },
        { key: "mat", label: "材料", type: "select", value: "0", options: matOptions },
      ],
      update,
    );
    body.appendChild(f.el);
    function update() {
      const sx = f.num("sx"), sy = f.num("sy"), t = f.num("t");
      const r = planeStress(sx, sy, t);
      const m = metals[Number(f.str("mat"))];
      const span = Math.max(Math.abs(r.s1), Math.abs(r.s2), r.R, 1) * 1.15;
      const k = 100 / span;
      const cx = 260, cy = 115;
      const X = (v: number) => cx + v * k, Y = (v: number) => cy + v * k; // τ drawn downward-positive (common convention)
      const svg =
        `<svg class="tb-chart" viewBox="0 0 520 235" aria-label="モールの応力円"><line class="axis" x1="20" x2="500" y1="${cy}" y2="${cy}"/><line class="axis" x1="${cx}" x2="${cx}" y1="8" y2="222"/>` +
        `<text class="lbl" x="498" y="${cy - 6}" text-anchor="end">σ</text><text class="lbl" x="${cx + 6}" y="18">τ</text>` +
        `<circle cx="${X(r.center)}" cy="${cy}" r="${r.R * k}" fill="none" stroke="var(--tb-accent)" stroke-width="2"/>` +
        `<line class="guide" x1="${X(sx)}" y1="${Y(t)}" x2="${X(sy)}" y2="${Y(-t)}"/>` +
        `<circle class="mark" cx="${X(sx)}" cy="${Y(t)}" r="4"/><text class="mark-t" x="${X(sx) + 6}" y="${Y(t) + 14}">X (σx, τxy)</text>` +
        `<circle class="mark" cx="${X(sy)}" cy="${Y(-t)}" r="4"/><text class="mark-t" x="${X(sy) - 6}" y="${Y(-t) - 6}" text-anchor="end">Y (σy, −τxy)</text>` +
        `<text class="tick" x="${X(r.s1)}" y="${cy + 14}" text-anchor="middle">σ₁</text><text class="tick" x="${X(r.s2)}" y="${cy + 14}" text-anchor="middle">σ₂</text></svg>`;
      out.innerHTML =
        svg +
        table([
          ["中心 (σx + σy)/2・半径 R", `${fmt(r.center)} MPa ・ ${fmt(r.R)} MPa`],
          ["主応力 σ₁ / σ₂", `${fmt(r.s1)} / ${fmt(r.s2)} MPa`],
          ["最大せん断応力 τmax = R", `${fmt(r.tmax)} MPa`],
          ["主方向 θp (x 軸から)", `${fmt(r.theta, 3)}°`],
          ["ミーゼス相当応力", `${fmt(r.mises)} MPa`],
          [`降伏に対する安全率 (σy = ${m.sy} MPa)`, fmt(safetyFactor(m.sy, r.mises), 2), safeClass(safetyFactor(m.sy, r.mises))],
        ]);
    }
    update();
  },

  pressure(host) {
    const { body, out } = shell(host, "薄肉円筒の圧力容器");
    const f = form(
      [
        { key: "p", label: "内圧 p", type: "num", value: 1, unit: "MPa", step: 0.1 },
        { key: "D", label: "内径 D", type: "num", value: 200, unit: "mm" },
        { key: "t", label: "板厚 t", type: "num", value: 5, unit: "mm" },
        { key: "mat", label: "材料", type: "select", value: "0", options: matOptions },
        { key: "S", label: "目標の安全率", type: "num", value: 4, step: 0.5 },
      ],
      update,
    );
    body.appendChild(f.el);
    function update() {
      try {
        const c = thinCylinder(f.num("p"), f.num("D"), f.num("t"));
        const m = metals[Number(f.str("mat"))];
        const sf = safetyFactor(m.sy, c.hoop);
        out.innerHTML = table([
          ["周方向応力 σθ = pD / 2t", `${fmt(c.hoop)} MPa`],
          ["軸方向応力 σz = pD / 4t", `${fmt(c.axial)} MPa`],
          ["球形容器なら σ = pD / 4t", `${fmt(c.sphere)} MPa`],
          [`安全率 (σy = ${m.sy} MPa、周方向)`, fmt(sf, 2), safeClass(sf / 2)],
          [`安全率 ${fmt(f.num("S"))} に必要な板厚`, `${fmt(cylinderThickness(f.num("p"), f.num("D"), m.sy, f.num("S")))} mm`],
          ["鏡板 (ふた) を押す力 p·πD²/4", `${fmt(c.lidForce / 1000)} kN`],
          ["薄肉の条件 t/D < 0.1", c.thin ? "満たす" : "満たさない (厚肉円筒の式が必要)", c.thin ? "good" : "warn"],
        ]) + `<p class="tb-note">圧力容器は法規 (労働安全衛生法の圧力容器構造規格など) で設計・検査が定められている場合があります。この計算は学習用の概算です。</p>`;
      } catch (e) {
        out.innerHTML = err(e);
      }
    }
    update();
  },

  motor(host) {
    const { body, out } = shell(host, "モーター選定 (水平移動軸)");
    const f = form(
      [
        { key: "drive", label: "駆動方式", type: "select", value: "screw", options: [["screw", "ボールねじ (リード)"], ["belt", "ベルト・プーリ (プーリ径)"]] },
        { key: "m", label: "移動質量", type: "num", value: 20, unit: "kg" },
        { key: "lead", label: "リード / プーリ径", type: "num", value: 10, unit: "mm" },
        { key: "mu", label: "摩擦係数", type: "num", value: 0.1, step: 0.01 },
        { key: "v", label: "最高速度", type: "num", value: 500, unit: "mm/s" },
        { key: "ta", label: "加速時間", type: "num", value: 0.1, unit: "s", step: 0.01 },
        { key: "eff", label: "機械効率", type: "num", value: 0.9, step: 0.05 },
        { key: "Jm", label: "モーター慣性 (×10⁻⁴)", type: "num", value: 0.2, unit: "kg·m²", step: 0.01 },
      ],
      update,
    );
    body.appendChild(f.el);
    function update() {
      try {
        const r = motorSizing({ drive: f.str("drive") as "screw" | "belt", mass: f.num("m"), lead: f.num("lead"), mu: f.num("mu"), speed: f.num("v"), tacc: f.num("ta"), eff: f.num("eff"), rotor: f.num("Jm") * 1e-4 });
        out.innerHTML = table([
          ["モーター回転数", `${fmt(r.rpm)} min⁻¹`, r.rpm > 4500 ? "warn" : ""],
          ["負荷慣性 (モーター軸換算)", `${fmt(r.JL * 1e4)} × 10⁻⁴ kg·m²`],
          ["慣性比 負荷 / モーター", fmt(r.ratio, 3), r.ratio <= 10 ? "good" : "warn"],
          ["定速時のトルク (摩擦)", `${fmt(r.Tconst)} N·m`],
          ["加速トルク", `${fmt(r.Tacc)} N·m`],
          ["最大トルク (加速 + 摩擦)", `${fmt(r.peak)} N·m`, "good"],
          ["最大出力の目安", `${fmt(r.power)} W`],
        ]) + `<p class="tb-note">実際の選定ではメーカーの選定ツールで、実効トルク・回生・安全率 (1.5〜2 倍) を確認します。慣性比の許容値は機種と求める応答性で異なります。</p>`;
      } catch (e) {
        out.innerHTML = err(e);
      }
    }
    update();
  },

  pneumatic(host) {
    const { body, out } = shell(host, "空気圧シリンダの推力と空気消費量");
    const f = form(
      [
        { key: "D", label: "チューブ内径 D", type: "num", value: 40, unit: "mm" },
        { key: "d", label: "ロッド径 d", type: "num", value: 16, unit: "mm" },
        { key: "p", label: "使用圧力", type: "num", value: 0.5, unit: "MPa", step: 0.05 },
        { key: "lr", label: "負荷率", type: "num", value: 0.5, step: 0.05 },
        { key: "st", label: "ストローク", type: "num", value: 100, unit: "mm" },
      ],
      update,
    );
    body.appendChild(f.el);
    function update() {
      try {
        const c = airCylinder(f.num("D"), f.num("d"), f.num("p"), f.num("lr"), f.num("st"));
        out.innerHTML = table([
          ["押し側の理論推力 p·πD²/4", `${fmt(c.push)} N`],
          ["引き側の理論推力 p·π(D²−d²)/4", `${fmt(c.pull)} N`],
          [`使える推力 (負荷率 ${fmt(f.num("lr"))})`, `押し ${fmt(c.pushUse)} N / 引き ${fmt(c.pullUse)} N`, "good"],
          ["1 往復の空気消費量 (大気圧換算)", `${fmt(c.air)} L`],
        ]) + `<p class="tb-note">負荷率は動かす用途で 0.5 以下 (速く動かすなら 0.3〜0.4) が目安。クランプなど静的に押し付けるだけなら 0.7 程度まで。</p>`;
      } catch (e) {
        out.innerHTML = err(e);
      }
    }
    update();
  },
};

const MORE3: Record<string, (host: HTMLElement) => void> = {
  goodman(host) {
    const { body, out } = shell(host, "疲労 — 修正グッドマン線図");
    const f = form(
      [
        { key: "sB", label: "引張強さ σB", type: "num", value: 600, unit: "MPa" },
        { key: "sw", label: "疲労限度 σw (補正後)", type: "num", value: 220, unit: "MPa" },
        { key: "sm", label: "平均応力 σm", type: "num", value: 150, unit: "MPa" },
        { key: "sa", label: "応力振幅 σa", type: "num", value: 80, unit: "MPa" },
      ],
      update,
    );
    body.appendChild(f.el);
    function update() {
      const sB = f.num("sB"), sw = f.num("sw"), sm = f.num("sm"), sa = f.num("sa");
      const g = goodman(sB, sw, sm, sa);
      out.innerHTML =
        table([
          ["安全率 S = 1 / (σa/σw + σm/σB)", fmt(g.S, 3), safeClass(g.S / 1.5)],
          ["この平均応力で許される振幅 (S = 1)", `${fmt(g.allowedAmp)} MPa`],
        ]) +
        lineChart(
          [
            { x: [0, sB], y: [sw, 0], color: "#b45309", label: "グッドマン線" },
            { x: [0, sB / 1.5], y: [sw / 1.5, 0], color: "#94a3b8", dash: true, label: "S = 1.5" },
          ],
          { xLabel: "平均応力 σm [MPa]", yLabel: "応力振幅 σa [MPa]", height: 170, marks: [{ x: sm, y: sa, text: "使用点" }] },
        ) +
        `<p class="tb-note">σw には、試験片の疲労限度に表面・寸法・切欠きの係数を掛けた「部品の疲労限度」を入れます。</p>`;
    }
    update();
  },

  weld(host) {
    const { body, out } = shell(host, "隅肉溶接のせん断強さ");
    const f = form(
      [
        { key: "leg", label: "脚長", type: "num", value: 6, unit: "mm" },
        { key: "l", label: "溶接長さ (1 本)", type: "num", value: 100, unit: "mm" },
        { key: "n", label: "溶接線の本数", type: "num", value: 2, step: 1 },
        { key: "F", label: "荷重 (せん断方向)", type: "num", value: 20000, unit: "N" },
        { key: "ta", label: "許容せん断応力", type: "num", value: 80, unit: "MPa" },
      ],
      update,
    );
    body.appendChild(f.el);
    function update() {
      const w = filletWeld(f.num("leg"), f.num("l"), f.num("F"), Math.max(1, Math.round(f.num("n"))), f.num("ta"));
      out.innerHTML = table([
        ["のど厚 a = 0.7 × 脚長", `${fmt(w.throat)} mm`],
        ["せん断応力 τ = F / (a·l·n)", `${fmt(w.tau)} MPa`],
        ["許容応力に対する余裕", fmt(w.S, 3), safeClass(w.S)],
      ]) +
        (() => {
          // τ against leg length: where the allowable line is crossed
          const n = Math.max(1, Math.round(f.num("n")));
          const legs = Array.from({ length: 50 }, (_, i) => 2 + (i * 18) / 49);
          return lineChart(
            [
              { x: legs, y: legs.map((h) => filletWeld(h, f.num("l"), f.num("F"), n, f.num("ta")).tau), color: "#2563eb", label: "τ", fill: true },
              { x: legs, y: legs.map(() => f.num("ta")), color: "#dc2626", label: "許容", dash: true },
            ],
            { xLabel: "脚長 [mm]", yLabel: "せん断応力 [MPa]", height: 150, marks: [{ x: f.num("leg"), y: w.tau, text: "現在" }] },
          );
        })() +
        `<p class="tb-note">許容応力は、母材・溶接材料・荷重の種類 (静的 / 繰返し) と適用する基準で決まります。疲労を受ける溶接は大幅に低くとります。</p>`;
    }
    update();
  },

  wire(host) {
    const { body, out } = shell(host, "電線の電圧降下");
    const f = form(
      [
        { key: "I", label: "電流", type: "num", value: 5, unit: "A" },
        { key: "L", label: "片道の長さ", type: "num", value: 10, unit: "m" },
        { key: "A", label: "導体断面積", type: "select", value: "0.75", options: ["0.3", "0.5", "0.75", "1.25", "2", "3.5", "5.5"].map((x) => [x, `${x} mm²`]) },
        { key: "V", label: "電源電圧", type: "num", value: 24, unit: "V" },
      ],
      update,
    );
    body.appendChild(f.el);
    function update() {
      const d = wireDrop(f.num("I"), f.num("L"), Number(f.str("A")), f.num("V"));
      out.innerHTML = table([
        ["往復の抵抗 (銅 20 °C)", `${fmt(d.R)} Ω`],
        ["電圧降下 ΔV = I·R", `${fmt(d.dV)} V`],
        ["電源電圧に対する割合", `${fmt(d.ratio * 100)} %`, d.ratio <= 0.05 ? "good" : "warn"],
        ["電線での損失 (発熱)", `${fmt(d.loss)} W`],
      ]) +
        (() => {
          const Ls = Array.from({ length: 40 }, (_, i) => (i * Math.max(20, f.num("L") * 2)) / 39);
          const sizes = ["0.5", "0.75", "1.25", "2"];
          const cols = ["#dc2626", "#d97706", "#2563eb", "#0f766e"];
          return lineChart(
            [
              ...sizes.map((a, k) => ({ x: Ls, y: Ls.map((L) => wireDrop(f.num("I"), L, Number(a), f.num("V")).ratio * 100), color: cols[k], label: `${a} mm²` })),
              { x: Ls, y: Ls.map(() => 5), color: "#6b7280", dash: true },
            ],
            { xLabel: "片道の長さ [m]", yLabel: "電圧降下 [%]", height: 160, marks: [{ x: f.num("L"), y: d.ratio * 100, text: `${f.str("A")} mm²` }] },
          );
        })() + `<p class="tb-note">電線は許容電流 (周囲温度・束ねる本数で低下) と電圧降下の両方で選びます。DC 24 V の制御回路では電圧降下を数 % 以内に抑えるのが目安です。</p>`;
    }
    update();
  },

  reliability(host) {
    const { body, out } = shell(host, "信頼度とアベイラビリティ");
    const f = form(
      [
        { key: "mtbf", label: "MTBF (1 台)", type: "num", value: 5000, unit: "h" },
        { key: "mttr", label: "MTTR", type: "num", value: 4, unit: "h" },
        { key: "t", label: "使用時間", type: "num", value: 1000, unit: "h" },
        { key: "n", label: "台数", type: "num", value: 2, step: 1 },
        { key: "cfg", label: "構成", type: "select", value: "series", options: [["series", "直列 (全部が必要)"], ["parallel", "並列 (1 台あればよい・冗長)"]] },
      ],
      update,
    );
    body.appendChild(f.el);
    function update() {
      const n = Math.max(1, Math.round(f.num("n")));
      const r = reliability(f.num("mtbf"), f.num("mttr"), f.num("t"), n, f.str("cfg") === "parallel");
      const ts = Array.from({ length: 60 }, (_, i) => (f.num("mtbf") * 2 * i) / 59);
      out.innerHTML =
        table([
          ["1 台の信頼度 R = exp(−t / MTBF)", `${fmt(r.unit * 100)} %`],
          ["システムの信頼度", `${fmt(r.system * 100)} %`, r.system > 0.9 ? "good" : "warn"],
          ["アベイラビリティ MTBF / (MTBF + MTTR)", `${fmt(r.availability * 100, 5)} %`],
        ]) +
        lineChart(
          [
            { x: ts, y: ts.map((t) => reliability(f.num("mtbf"), 1, t, n, false).system * 100), color: "#b45309", label: "直列" },
            { x: ts, y: ts.map((t) => reliability(f.num("mtbf"), 1, t, n, true).system * 100), color: "#0f766e", label: "並列" },
          ],
          { xLabel: "使用時間 [h]", yLabel: "信頼度 [%]", height: 160 },
        );
    }
    update();
  },

  legibility(host) {
    const { body, out } = shell(host, "見やすい文字の大きさ");
    const f = form(
      [
        { key: "d", label: "見る距離", type: "num", value: 700, unit: "mm" },
        { key: "a", label: "視角 (文字高さ)", type: "num", value: 20, unit: "分 (′)" },
      ],
      update,
    );
    body.appendChild(f.el);
    function update() {
      const a = f.num("a");
      const rows = [300, 500, 700, 1000, 2000, 5000].map((d) => [`${d / 1000} m`, `${fmt(charHeight(d, a))} mm`] as [string, string]);
      out.innerHTML =
        lineChart(
          [{ x: Array.from({ length: 40 }, (_, i) => 200 + i * 125), y: Array.from({ length: 40 }, (_, i) => charHeight(200 + i * 125, a)), color: "#2563eb", label: `視角 ${fmt(a)}′`, fill: true }],
          { xLabel: "見る距離 [mm]", yLabel: "文字高さ [mm]", height: 140, marks: [{ x: f.num("d"), y: charHeight(f.num("d"), a), text: "現在" }] },
        ) +
        table([[`距離 ${fmt(f.num("d"))} mm で必要な文字高さ`, `${fmt(charHeight(f.num("d"), a))} mm (≈ ${fmt(charHeight(f.num("d"), a) / 0.3528 / 0.7)} pt 相当)`, "good"], ...rows]) +
        `<p class="tb-note">視角 16〜24 分が読みやすさの目安 (最小 10〜12 分程度)。暗い場所、高齢者、重要な表示はさらに大きく、コントラストを高くします。pt 換算は文字の高さ ≈ 0.7 em とした概算です。</p>`;
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

Object.assign(WIDGETS, MORE, MORE2, MORE3, ANIM, ANIM2, ANIM3, ANIM4, ANIM5, ANIM6, ANIM7, VIEW3D);

export function mountWidgets(root: HTMLElement) {
  for (const el of root.querySelectorAll<HTMLElement>("[data-widget]")) {
    const w = WIDGETS[el.dataset.widget!];
    if (!w) continue;
    // lets a widget offer "reset" (re-mount with its initial state)
    (el as HTMLElement & { __tbMount?: () => void }).__tbMount = () => w(el);
    w(el);
  }
}

export const WIDGET_NAMES = Object.keys(WIDGETS);
