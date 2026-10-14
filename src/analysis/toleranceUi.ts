import { formatNumber } from "../core/expr";
import { download, h, modal } from "../ui/dom";
import { stackup, type StackRow } from "./tolerance";

const KEY = "3dcad.tolstack.";

/** 公差累積解析: dimension chain table, worst case / RSS / Monte Carlo. */
export function openToleranceStack(docName: string, params: Map<string, number>) {
  let rows: StackRow[] = [];
  let spec: { min?: number; max?: number } = {};
  try {
    const saved = JSON.parse(localStorage.getItem(KEY + docName) ?? "null");
    if (saved) ({ rows, spec } = saved);
  } catch {
    /* none */
  }
  if (!rows.length) rows = [{ name: "寸法1", nominal: 50, upper: 0.1, lower: -0.1, dir: 1 }, { name: "寸法2", nominal: 49.5, upper: 0.05, lower: -0.05, dir: -1 }];
  const table = h("table", { class: "tol-table" });
  const result = h("div", { class: "tol-result", "data-k": "tol-result" });
  const save = () => {
    try {
      localStorage.setItem(KEY + docName, JSON.stringify({ rows, spec }));
    } catch {
      /* private mode */
    }
  };
  const numIn = (v: number | undefined, set: (x: number | undefined) => void, w = 70) =>
    h("input", {
      class: "field-input",
      style: `width:${w}px`,
      value: v === undefined ? "" : String(v),
      onChange: (e: Event) => {
        const s = (e.target as HTMLInputElement).value.trim();
        set(s === "" ? undefined : Number(s));
        update();
      },
    });
  const render = () => {
    table.innerHTML = "";
    table.appendChild(h("tr", {}, ...["寸法", "呼び", "上の許容差", "下の許容差", "向き", "寄与率", ""].map((t) => h("th", {}, t))));
    const r = stackup(rows, spec, 4000);
    rows.forEach((row, i) => {
      const dir = h("select", { class: "field-input", onChange: (e: Event) => ((row.dir = Number((e.target as HTMLSelectElement).value) as 1 | -1), update()) }, h("option", { value: "1", selected: row.dir > 0 }, "+ (加算)"), h("option", { value: "-1", selected: row.dir < 0 }, "− (減算)"));
      table.appendChild(
        h(
          "tr",
          {},
          h("td", {}, h("input", { class: "field-input", style: "width:110px", value: row.name, onChange: (e: Event) => ((row.name = (e.target as HTMLInputElement).value), save()) })),
          h("td", {}, numIn(row.nominal, (x) => (row.nominal = x ?? 0))),
          h("td", {}, numIn(row.upper, (x) => (row.upper = x ?? 0), 60)),
          h("td", {}, numIn(row.lower, (x) => (row.lower = x ?? 0), 60)),
          h("td", {}, dir),
          h("td", {}, `${formatNumber(r.contrib[i] ?? 0, 1)} %`),
          h("td", {}, h("button", { class: "btn", onClick: () => (rows.splice(i, 1), update()) }, "削除")),
        ),
      );
    });
  };
  const update = () => {
    for (const r of rows) if (r.upper < r.lower) [r.upper, r.lower] = [r.lower, r.upper];
    save();
    render();
    if (!rows.length) return void (result.textContent = "寸法を追加してください");
    const r = stackup(rows, spec);
    const f = (x: number) => formatNumber(x, 4);
    const lines: [string, string][] = [
      ["呼び寸法 (すき間)", f(r.nominal)],
      ["最悪値 (ワーストケース)", `${f(r.worstMin)} 〜 ${f(r.worstMax)}  (±${f((r.worstMax - r.worstMin) / 2)})`],
      ["統計的 (RSS, 3σ)", `${f(r.mean - r.rss)} 〜 ${f(r.mean + r.rss)}  (平均 ${f(r.mean)} ±${f(r.rss)})`],
      ["モンテカルロ (2 万回)", `σ = ${f(r.mc.sigma)}, 最小 ${f(r.mc.min)} / 最大 ${f(r.mc.max)}`],
    ];
    if (r.mc.yield !== null) lines.push(["規格内の割合", `${formatNumber(r.mc.yield * 100, 3)} %  (不良率 ${formatNumber((1 - r.mc.yield) * 1e6, 0)} ppm)`]);
    const wcOk = (spec.min === undefined || r.worstMin >= spec.min) && (spec.max === undefined || r.worstMax <= spec.max);
    if (spec.min !== undefined || spec.max !== undefined) lines.push(["判定", wcOk ? "✓ 最悪値でも規格内" : "⚠ 最悪値で規格外 (統計的な割合を確認)"]);
    result.innerHTML = "";
    result.appendChild(h("table", { class: "kv" }, ...lines.map(([k, v]) => h("tr", {}, h("th", {}, k), h("td", {}, v)))));
  };
  const paramSel = h("select", { class: "field-input" }, h("option", { value: "" }, "パラメータから追加…"), ...[...params.keys()].map((k) => h("option", { value: k }, `${k} = ${formatNumber(params.get(k)!, 3)}`)));
  paramSel.addEventListener("change", () => {
    const k = paramSel.value;
    if (k) rows.push({ name: k, nominal: params.get(k)!, upper: 0.1, lower: -0.1, dir: 1 });
    paramSel.value = "";
    update();
  });
  const body = h(
    "div",
    { class: "tol-dialog" },
    h("p", { class: "muted" }, "すき間 (または組立寸法) に影響する寸法を順に並べ、すき間を広げる寸法は「+」、狭める寸法は「−」にします。許容差は ±3σ として統計計算します。"),
    table,
    h("div", { class: "row" }, h("button", { class: "btn", onClick: () => (rows.push({ name: `寸法${rows.length + 1}`, nominal: 10, upper: 0.05, lower: -0.05, dir: -1 }), update()) }, "寸法を追加"), paramSel),
    h("div", { class: "row" }, h("span", {}, "規格 (すき間) 最小"), numIn(spec.min, (x) => (spec.min = x)), h("span", {}, "最大"), numIn(spec.max, (x) => (spec.max = x))),
    result,
  );
  update();
  modal({
    title: "公差累積解析",
    icon: "measure",
    body,
    width: 720,
    buttons: [
      {
        label: "CSV 書き出し",
        onClick: () => {
          const r = stackup(rows, spec);
          const csv = ["name,nominal,upper,lower,dir,contribution_pct", ...rows.map((x, i) => [x.name, x.nominal, x.upper, x.lower, x.dir, r.contrib[i].toFixed(2)].join(",")), "", `nominal,${r.nominal}`, `worst_min,${r.worstMin}`, `worst_max,${r.worstMax}`, `rss_mean,${r.mean}`, `rss_3sigma,${r.rss}`];
          download(`${docName}_公差累積.csv`, "﻿" + csv.join("\n"), "text/csv");
          return false;
        },
      },
      { label: "閉じる", primary: true },
    ],
  });
}
