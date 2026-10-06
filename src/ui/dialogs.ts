import type { App } from "../app";
import { MATERIALS } from "../core/document";
import { evaluate, formatNumber, references } from "../core/expr";
import { createsCycle, evaluateParams, PARAM_NAME_RE } from "../core/params";
import type { ParamUnit, Vec3 } from "../core/types";
import { download, h, iconEl, modal, toast } from "./dom";

// ------------------------------------------------------------ parameters ---

export function openParameters(app: App) {
  const body = h("div", { class: "params-dlg" });
  const render = () => {
    const doc = app.store.doc;
    evaluateParams(doc.params);
    body.innerHTML = "";
    const owner = (id?: string) => (id ? (doc.features.find((f) => f.id === id)?.name ?? "") : "");
    const table = h(
      "table",
      { class: "ptable" },
      h("thead", {}, h("tr", {}, h("th", {}, "パラメータ名"), h("th", {}, "使用元"), h("th", {}, "単位"), h("th", {}, "式"), h("th", {}, "値"), h("th", {}, "コメント"), h("th", {}))),
    );
    const tb = h("tbody");
    const group = (title: string) => tb.appendChild(h("tr", { class: "pgroup" }, h("td", { colspan: "7" }, title)));
    const used = (name: string) => doc.params.some((p) => p.name !== name && references(p.expr).includes(name));
    const row = (i: number) => {
      const p = doc.params[i];
      const nameCell =
        p.kind === "user"
          ? (() => {
              const inp = h("input", { class: "cell-input", value: p.name });
              inp.addEventListener("change", () => {
                const nn = inp.value.trim();
                if (nn === p.name) return;
                if (!PARAM_NAME_RE.test(nn) || doc.params.some((x) => x.name === nn)) {
                  toast("無効または重複したパラメータ名です", "error");
                  inp.value = p.name;
                  return;
                }
                app.store.mutate("パラメータ名を変更", (d) => {
                  const re = new RegExp(`(?<![A-Za-z0-9_\\u00C0-\\uFFFF])${p.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![A-Za-z0-9_\\u00C0-\\uFFFF])`, "g");
                  for (const x of d.params) x.expr = x.expr.replace(re, nn);
                  d.params.find((x) => x.name === p.name)!.name = nn;
                });
                render();
              });
              return inp;
            })()
          : h("span", { class: "pname" }, p.name);
      const expr = h("input", { class: "cell-input expr" + (p.error ? " invalid" : ""), value: p.expr, title: p.error ?? "" });
      expr.addEventListener("keydown", (e) => e.key === "Enter" && expr.blur());
      expr.addEventListener("change", () => {
        const v = expr.value.trim();
        try {
          const vals = evaluateParams(doc.params);
          evaluate(v, (n) => vals.get(n));
          if (createsCycle(doc.params, p.name, v)) throw new Error("循環参照になります");
          app.store.mutate("パラメータを編集", (d) => (d.params.find((x) => x.name === p.name)!.expr = v));
          render();
        } catch (e) {
          expr.classList.add("invalid");
          toast((e as Error).message, "error");
        }
      });
      const unit = h("select", { class: "cell-input small", disabled: p.kind === "model" });
      for (const u of ["mm", "deg", "ul"] as ParamUnit[]) unit.appendChild(h("option", { value: u, selected: u === p.unit }, u));
      unit.addEventListener("change", () => app.store.mutate("単位", (d) => (d.params.find((x) => x.name === p.name)!.unit = unit.value as ParamUnit)));
      const comment = h("input", { class: "cell-input", value: p.comment ?? "" });
      comment.addEventListener("change", () => app.store.mutate("コメント", (d) => (d.params.find((x) => x.name === p.name)!.comment = comment.value)));
      const del =
        p.kind === "user"
          ? h(
              "button",
              {
                class: "icon-btn small",
                title: used(p.name) ? "他のパラメータから参照されています" : "削除",
                disabled: used(p.name) || app.store.doc.features.some((f) => JSON.stringify(f).includes(`"${p.name}"`)),
                onClick: () => {
                  app.store.mutate("パラメータを削除", (d) => (d.params = d.params.filter((x) => x.name !== p.name)));
                  render();
                },
              },
              iconEl("trash"),
            )
          : h("span");
      tb.appendChild(
        h(
          "tr",
          { class: p.error ? "err" : "" },
          h("td", {}, nameCell),
          h("td", { class: "muted" }, owner(p.owner)),
          h("td", {}, unit),
          h("td", {}, expr),
          h("td", { class: "num" }, p.value !== undefined ? formatNumber(p.value, 4) : "エラー"),
          h("td", {}, comment),
          h("td", {}, del),
        ),
      );
    };
    group("モデル パラメータ");
    doc.params.forEach((p, i) => p.kind === "model" && row(i));
    group("ユーザ パラメータ");
    doc.params.forEach((p, i) => p.kind === "user" && row(i));
    table.appendChild(tb);
    body.appendChild(h("div", { class: "ptable-wrap" }, table));
    body.appendChild(
      h(
        "div",
        { class: "params-actions" },
        h(
          "button",
          {
            class: "btn",
            onClick: () => {
              let i = 0;
              while (doc.params.some((p) => p.name === `ユーザ${i}`)) i++;
              app.store.mutate("ユーザ パラメータを追加", (d) => d.params.push({ name: `ユーザ${i}`, expr: "10", unit: "mm", kind: "user" }));
              render();
            },
          },
          iconEl("plus"),
          "ユーザ パラメータを追加",
        ),
        h("span", { class: "muted" }, "式には他のパラメータ名・四則演算・関数 (sin, cos, sqrt …)・単位 (mm, cm, in, deg) が使えます"),
      ),
    );
  };
  render();
  modal({ title: "パラメータ", icon: "params", body, width: 900, buttons: [{ label: "完了", primary: true }] });
}

// ----------------------------------------------------------- iProperties ---

export async function openIProperties(app: App) {
  const doc = app.store.doc;
  const tabs = h("div", { class: "tabs" });
  const pane = h("div", { class: "tab-pane" });
  const body = h("div", { class: "iprops" }, tabs, pane);
  let mp: Awaited<ReturnType<App["kernel"]["massProps"]>> | null = null;
  try {
    if (app.bodies.length) mp = await app.kernel.massProps();
  } catch (e) {
    toast((e as Error).message, "error");
  }
  const summary = () => {
    pane.innerHTML = "";
    const fields = ["パーツ番号", "説明", "設計者", "作成日", "会社", "プロジェクト"];
    const grid = h("div", { class: "form-grid" });
    for (const k of fields) {
      const inp = h("input", { class: "field-input", value: doc.iprops[k] ?? "" });
      inp.addEventListener("change", () => app.store.mutate("iProperties", (d) => (d.iprops[k] = inp.value)));
      grid.append(h("label", {}, k), inp);
    }
    const name = h("input", { class: "field-input", value: doc.name });
    name.addEventListener("change", () => app.store.mutate("名前", (d) => (d.name = name.value.trim() || d.name)));
    grid.prepend(h("label", {}, "ファイル名"), name);
    pane.appendChild(grid);
  };
  const physical = () => {
    pane.innerHTML = "";
    const sel = h("select", { class: "field-input" });
    for (const m of MATERIALS) sel.appendChild(h("option", { value: m.name, selected: m.name === app.store.doc.material.name }, `${m.name} (${m.density} g/cm³)`));
    const out = h("div");
    const draw = () => {
      out.innerHTML = "";
      if (!mp || !mp.bodies) {
        out.appendChild(h("p", { class: "muted" }, "ソリッド ボディがありません"));
        return;
      }
      const dens = app.store.doc.material.density;
      const massG = (mp.volume / 1000) * dens;
      const [lo, hi] = mp.bbox;
      const v3 = (v: Vec3) => v.map((x) => formatNumber(x, 3)).join(", ");
      const rows: [string, string][] = [
        ["マテリアル", app.store.doc.material.name],
        ["密度", `${dens} g/cm³`],
        ["質量", massG >= 1000 ? `${formatNumber(massG / 1000, 4)} kg` : `${formatNumber(massG, 3)} g`],
        ["体積", `${formatNumber(mp.volume, 3)} mm³`],
        ["表面積", `${formatNumber(mp.area, 3)} mm²`],
        ["重心 (X, Y, Z)", `${v3(mp.centerOfMass)} mm`],
        ["範囲 (長さ × 幅 × 高さ)", `${formatNumber(hi[0] - lo[0], 3)} × ${formatNumber(hi[1] - lo[1], 3)} × ${formatNumber(hi[2] - lo[2], 3)} mm`],
        ["ソリッド本体数", String(mp.bodies)],
      ];
      out.appendChild(h("table", { class: "kv wide" }, ...rows.map(([k, v]) => h("tr", {}, h("th", {}, k), h("td", {}, v)))));
    };
    sel.addEventListener("change", () => {
      const m = MATERIALS.find((x) => x.name === sel.value)!;
      app.store.mutate("マテリアル", (d) => (d.material = { ...m }));
      draw();
    });
    pane.append(h("label", { class: "field" }, h("span", { class: "field-label" }, "マテリアル"), sel), out);
    draw();
  };
  const tabDefs: [string, () => void][] = [
    ["概要", summary],
    ["物理", physical],
  ];
  tabDefs.forEach(([label, fn], i) => {
    const b = h(
      "button",
      {
        class: "tab" + (i === 1 ? " on" : ""),
        onClick: () => {
          tabs.querySelectorAll(".tab").forEach((x) => x.classList.toggle("on", x === b));
          fn();
        },
      },
      label,
    );
    tabs.appendChild(b);
  });
  physical();
  modal({ title: `iProperties — ${doc.name}`, icon: "iprops", body, width: 560 });
}

// ------------------------------------------------------------- shortcuts ---

export function openShortcuts() {
  const sec = (title: string, rows: [string, string][]) =>
    h("section", { class: "keys-sec" }, h("h3", {}, title), h("table", { class: "kv" }, ...rows.map(([k, v]) => h("tr", {}, h("th", {}, h("kbd", {}, k)), h("td", {}, v)))));
  const body = h(
    "div",
    { class: "keys" },
    sec("マウス", [
      ["中ボタン ドラッグ", "画面移動 (パン)"],
      ["Shift + 中ボタン / Alt + 左", "オービット (カーソル下の点まわり)"],
      ["ホイール", "カーソル位置にズーム"],
      ["右クリック", "マーキング メニュー"],
      ["ダブルクリック (面)", "その面を注視"],
      ["ViewCube クリック / ドラッグ", "標準ビュー / 回転"],
    ]),
    sec("3D モデル", [
      ["S", "2D スケッチを作成"],
      ["E", "押し出し"],
      ["R", "回転"],
      ["H", "穴"],
      ["F", "フィレット"],
      ["Ctrl+Shift+K", "面取り"],
      ["Ctrl+Shift+R / O / M", "矩形状 / 円形状パターン / ミラー"],
      ["M", "測定"],
      ["Enter / Esc", "OK / キャンセル"],
    ]),
    sec("スケッチ", [
      ["L / C / A / R", "線分 / 円 / 円弧 / 長方形"],
      ["G / P", "ポリゴン / 点"],
      ["D", "寸法"],
      ["X", "トリム"],
      ["数値入力", "作図中に長さ・直径・幅,高さを指定"],
      ["F7 / F8", "スライス表示 / 拘束の表示"],
      ["S / Ctrl+Enter", "スケッチを終了"],
    ]),
    sec("表示・一般", [
      ["F2 / F3 / F4 (押しながら)", "画面移動 / ズーム / オービット"],
      ["F6", "ホーム ビュー"],
      ["Home", "全体表示"],
      ["PageUp", "注視"],
      ["Ctrl+Z / Ctrl+Y", "元に戻す / やり直し"],
      ["Ctrl+S / Ctrl+O / Ctrl+N", "保存 / 開く / 新規"],
      ["Delete", "選択を削除"],
    ]),
  );
  modal({ title: "キーボード ショートカットとマウス操作", icon: "keyboard", body, width: 760 });
}

// --------------------------------------------------------------- drawing ---

const VIEWS: { name: string; label: string; dir: Vec3; xAxis: Vec3 }[] = [
  { name: "front", label: "正面図", dir: [0, 0, 1], xAxis: [1, 0, 0] },
  { name: "top", label: "平面図", dir: [0, 1, 0], xAxis: [1, 0, 0] },
  { name: "right", label: "右側面図", dir: [1, 0, 0], xAxis: [0, 0, -1] },
  { name: "iso", label: "等角図", dir: [1, 1, 1], xAxis: [1, 0, -1] },
];

const SCALES = [10, 5, 4, 2, 1, 1 / 2, 1 / 2.5, 1 / 5, 1 / 10, 1 / 20, 1 / 50, 1 / 100];

export async function openDrawing(app: App) {
  if (!app.bodies.length) {
    toast("図面を作成するソリッドがありません", "warn");
    return;
  }
  const holder = h("div", { class: "drawing-holder" }, h("div", { class: "spinner" }), " 投影ビューを計算中…");
  const m = modal({
    title: `図面 — ${app.store.doc.name}`,
    icon: "drawing",
    body: holder,
    width: 1180,
    buttons: [
      { label: "SVG を書き出し", onClick: () => (exportSvg(), false) },
      { label: "印刷 / PDF", onClick: () => (printSheet(), false) },
      { label: "閉じる", primary: true },
    ],
  });
  let svgText = "";
  const exportSvg = () => svgText && download(`${app.store.doc.name}.svg`, svgText, "image/svg+xml");
  const printSheet = () => {
    if (!svgText) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!doctype html><title>${app.store.doc.name}</title><style>@page{size:A3 landscape;margin:0}body{margin:0}svg{width:420mm;height:297mm}</style>${svgText}`);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  };
  try {
    const views = await app.kernel.projection(VIEWS.map(({ name, dir, xAxis }) => ({ name, dir, xAxis })));
    const doc = app.store.doc;
    // A3 landscape sheet, third-angle projection (JIS)
    const W = 420, H = 297, margin = 10, tbH = 36;
    const get = (n: string) => views.find((v) => v.name === n)!;
    const size = (n: string) => {
      const b = get(n).bounds;
      return [b[2] - b[0], b[3] - b[1]];
    };
    const [fw, fh] = size("front"), [, th] = size("top"), [rw] = size("right");
    const [iw, ih] = size("iso");
    const availW = W - 2 * margin - 40, availH = H - 2 * margin - tbH - 40;
    const scale = SCALES.find((s) => (fw + rw + iw * 0.8) * s + 60 <= availW && (fh + th) * s + 40 <= availH) ?? SCALES[SCALES.length - 1];
    const gap = 22;
    const x0 = margin + 22, yTop = margin + 18;
    const pos: Record<string, [number, number]> = {
      top: [x0, yTop],
      front: [x0, yTop + th * scale + gap],
      right: [x0 + fw * scale + gap, yTop + th * scale + gap],
      iso: [x0 + (fw + rw) * scale + gap * 2.2, yTop],
    };
    const isoScale = Math.min(scale, (W - margin - 8 - pos.iso[0]) / Math.max(iw, 1), (availH * 0.55) / Math.max(ih, 1));
    const parts: string[] = [];
    const sw = (k: number) => (k / scale).toFixed(4);
    for (const v of VIEWS) {
      const pv = get(v.name);
      const s = v.name === "iso" ? isoScale : scale;
      const [px, py] = pos[v.name];
      const t = `translate(${px - pv.bounds[0] * s} ${py - pv.bounds[1] * s}) scale(${s})`;
      const lw = (k: number) => (k / s).toFixed(4);
      parts.push(
        `<g transform="${t}" fill="none" stroke-linecap="round">`,
        v.name === "iso" ? "" : `<g stroke="#555" stroke-width="${lw(0.18)}" stroke-dasharray="${lw(1.6)} ${lw(0.9)}">${pv.hidden.map((d) => `<path d="${d}"/>`).join("")}</g>`,
        `<g stroke="#000" stroke-width="${lw(0.35)}">${pv.visible.map((d) => `<path d="${d}"/>`).join("")}</g>`,
        `</g>`,
        `<text x="${px}" y="${py + (pv.bounds[3] - pv.bounds[1]) * s + 6}" font-size="3.2" fill="#333">${v.label}${v.name === "iso" ? "" : ""}</text>`,
      );
    }
    void sw;
    // overall dimensions on the front view
    const dim = (x1: number, y1: number, x2: number, y2: number, off: number, horizontal: boolean, val: number) => {
      const t = formatNumber(val, 2);
      if (horizontal) {
        const y = y1 - off;
        return `<g stroke="#1d4ed8" stroke-width="0.18" fill="#1d4ed8"><path d="M${x1} ${y1 - 1}V${y - 1.5}M${x2} ${y2 - 1}V${y - 1.5}M${x1} ${y}H${x2}"/><path d="M${x1} ${y}l2.2 -0.7v1.4zM${x2} ${y}l-2.2 -0.7v1.4z"/><text x="${(x1 + x2) / 2}" y="${y - 1}" font-size="3" text-anchor="middle" stroke="none">${t}</text></g>`;
      }
      const x = x1 - off;
      return `<g stroke="#1d4ed8" stroke-width="0.18" fill="#1d4ed8"><path d="M${x1 - 1} ${y1}H${x - 1.5}M${x2 - 1} ${y2}H${x - 1.5}M${x} ${y1}V${y2}"/><path d="M${x} ${y1}l-0.7 2.2h1.4zM${x} ${y2}l-0.7 -2.2h1.4z"/><text x="${x - 1}" y="${(y1 + y2) / 2}" font-size="3" text-anchor="middle" stroke="none" transform="rotate(-90 ${x - 1} ${(y1 + y2) / 2})">${t}</text></g>`;
    };
    const [fx, fy] = pos.front;
    parts.push(dim(fx, fy + fh * scale, fx + fw * scale, fy + fh * scale, -8, true, fw));
    parts.push(dim(fx, fy, fx, fy + fh * scale, 7, false, fh));
    const [tx, ty] = pos.top;
    parts.push(dim(tx, ty, tx, ty + th * scale, 7, false, th));
    // title block
    const tbW = 180, tbX = W - margin - tbW, tbY = H - margin - tbH;
    const scaleText = scale >= 1 ? `${formatNumber(scale, 2)}:1` : `1:${formatNumber(1 / scale, 2)}`;
    const cell = (x: number, y: number, w: number, hh: number, label: string, value: string, big = false) =>
      `<rect x="${x}" y="${y}" width="${w}" height="${hh}"/><text x="${x + 1.5}" y="${y + 3.2}" font-size="2.2" fill="#555" stroke="none">${label}</text><text x="${x + 2}" y="${y + hh - 2.2}" font-size="${big ? 5 : 3.4}" fill="#000" stroke="none">${escapeXml(value)}</text>`;
    parts.push(
      `<g stroke="#000" stroke-width="0.35" fill="none">`,
      cell(tbX, tbY, 110, 14, "名称", doc.name, true),
      cell(tbX + 110, tbY, 70, 14, "図番 / パーツ番号", doc.iprops["パーツ番号"] ?? ""),
      cell(tbX, tbY + 14, 55, 11, "材質", doc.material.name),
      cell(tbX + 55, tbY + 14, 30, 11, "尺度", scaleText),
      cell(tbX + 85, tbY + 14, 30, 11, "投影法", "第三角法"),
      cell(tbX + 115, tbY + 14, 65, 11, "単位", "mm"),
      cell(tbX, tbY + 25, 55, 11, "設計", doc.iprops["設計者"] ?? ""),
      cell(tbX + 55, tbY + 25, 60, 11, "日付", doc.iprops["作成日"] ?? ""),
      cell(tbX + 115, tbY + 25, 65, 11, "作成", "3DCAD Studio"),
      `</g>`,
    );
    svgText =
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}mm" height="${H}mm" font-family="'Noto Sans JP', sans-serif">` +
      `<rect width="${W}" height="${H}" fill="#fff"/>` +
      `<rect x="${margin}" y="${margin}" width="${W - 2 * margin}" height="${H - 2 * margin}" fill="none" stroke="#000" stroke-width="0.7"/>` +
      parts.join("") +
      `</svg>`;
    holder.innerHTML = "";
    holder.classList.add("ready");
    holder.innerHTML = svgText;
  } catch (e) {
    holder.textContent = `図面を作成できませんでした: ${(e as Error).message}`;
  }
  void m;
}

function escapeXml(s: string) {
  return s.replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" })[c]!);
}
