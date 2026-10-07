import type { App } from "../app";
import { formatNumber } from "../core/expr";
import { download, h, modal, toast } from "../ui/dom";
import { flatToDxf, flatToSvg, sheetFlat } from "./flat";
import { ensureSheetStyle } from "./sheet";

/** Sheet metal defaults (Inventor "シートメタルの既定値"): thickness, bend radius, K factor. */
export function openSheetStyle(app: App) {
  const doc = app.store.doc;
  if (!doc.sheetMetal) app.store.mutate("板金に変換", (d) => ensureSheetStyle(d));
  const sm = app.store.doc.sheetMetal!;
  const fields: [string, string, string][] = [
    [sm.thickness, "板厚", "mm"],
    [sm.radius, "曲げ半径 (内側)", "mm"],
    [sm.kFactor, "K係数", ""],
  ];
  const inputs = fields.map(([name]) => h("input", { class: "field-input", value: app.store.param(name)?.expr ?? "" }) as HTMLInputElement);
  const body = h(
    "div",
    { class: "settings" },
    ...fields.map(([, label, unit], i) => h("label", { class: "field" }, h("span", { class: "field-label" }, label), h("span", { class: "field-ctl" }, inputs[i], unit ? h("span", { class: "muted" }, ` ${unit}`) : null))),
    h("p", { class: "muted" }, "値は式で入力できます (パラメータ「板厚」「曲げ半径」「K係数」)。K係数は中立軸の位置で、展開長さ = 曲げ角度 × (曲げ半径 + K係数 × 板厚) で計算されます。一般的な鋼板の曲げでは 0.3〜0.5 です。"),
  );
  modal({
    title: "板金スタイル",
    icon: "smStyle",
    body,
    width: 460,
    buttons: [
      {
        label: "OK",
        primary: true,
        onClick: () => {
          app.store.mutate("板金スタイル", (d) => {
            fields.forEach(([name], i) => {
              const p = d.params.find((x) => x.name === name);
              if (p) p.expr = inputs[i].value.trim() || p.expr;
            });
          });
        },
      },
      { label: "キャンセル" },
    ],
  });
}

/** Flat pattern preview with DXF / SVG output for laser cutting / punching. */
export function openFlatPattern(app: App) {
  const doc = app.store.doc;
  const res = app.resolved;
  let fp = null;
  try {
    fp = res ? sheetFlat(doc, res) : null;
  } catch (e) {
    toast(`展開できません: ${(e as Error).message}`, "error");
    return;
  }
  if (!fp) {
    toast("板金の面がありません — 「板金」タブの「面」で作成してください", "warn");
    return;
  }
  const [x0, y0, x1, y1] = fp.bounds;
  const T = res!.values.get(doc.sheetMetal!.thickness) ?? 0;
  const mass = (fp.area * T * doc.material.density) / 1000;
  const view = h("div", { class: "flat-view", html: flatToSvg(fp) });
  const svg = view.querySelector("svg")!;
  svg.removeAttribute("width");
  svg.removeAttribute("height");
  const info = h(
    "table",
    { class: "lib-spec" },
    h("tr", {}, h("th", {}, "展開寸法"), h("td", {}, `${formatNumber(x1 - x0, 2)} × ${formatNumber(y1 - y0, 2)} mm`)),
    h("tr", {}, h("th", {}, "曲げ"), h("td", {}, `${fp.bends.length} 箇所 (${fp.bends.map((b) => `${formatNumber(b.angle, 1)}°${b.up ? "上" : "下"}`).join(", ") || "なし"})`)),
    h("tr", {}, h("th", {}, "面積"), h("td", {}, `${formatNumber(fp.area, 1)} mm²`)),
    h("tr", {}, h("th", {}, "質量"), h("td", {}, `${formatNumber(mass, 1)} g (${doc.material.name}, 板厚 ${formatNumber(T, 2)} mm)`)),
  );
  const name = doc.name || "flat";
  modal({
    title: "展開パターン",
    icon: "unfold",
    body: h("div", {}, view, info, h("p", { class: "muted" }, "赤の一点鎖線は曲げ線です。DXF ではレイヤ OUTER (外形)、BEND_UP / BEND_DOWN (山折り / 谷折り) に分かれます。")),
    width: 720,
    buttons: [
      { label: "DXF 書き出し", primary: true, onClick: () => (download(`${name}_展開.dxf`, flatToDxf(fp!), "application/dxf"), false) },
      { label: "SVG 書き出し", onClick: () => (download(`${name}_展開.svg`, flatToSvg(fp!), "image/svg+xml"), false) },
      { label: "閉じる" },
    ],
  });
}
