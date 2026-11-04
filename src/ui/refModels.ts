// Panel for reference data (point clouds, IFC buildings): visibility, point
// size, colour, removal, and a shortcut to the measure command.

import type { App } from "../app";
import { h, iconEl } from "./dom";

const PANEL_ID = "ref-models-panel";

export function openRefModels(app: App) {
  document.getElementById(PANEL_ID)?.remove();
  const vp = app.vp;
  if (!vp.refModels.length) return;
  const list = h("div", { class: "ref-list" });
  const panel = h(
    "div",
    {
      id: PANEL_ID,
      class: "ref-panel",
      role: "dialog",
      "aria-label": "参照データ",
      style:
        "position:absolute;right:12px;top:12px;z-index:6;width:280px;max-height:60%;overflow:auto;background:var(--panel-bg,#fff);color:inherit;border:1px solid rgba(127,127,127,.35);border-radius:8px;box-shadow:0 4px 14px rgba(0,0,0,.18);font-size:12px",
    },
    h(
      "div",
      { style: "display:flex;align-items:center;gap:6px;padding:8px 10px;border-bottom:1px solid rgba(127,127,127,.25);font-weight:600" },
      iconEl("import"),
      h("span", { style: "flex:1" }, "参照データ (表示専用)"),
      h("button", { class: "icon-btn", title: "測定 (点をクリック)", onClick: () => app.commands.run("measure"), html: iconEl("measure").outerHTML }),
      h("button", { class: "icon-btn", title: "閉じる", onClick: () => panel.remove(), html: iconEl("close").outerHTML }),
    ),
    list,
  );
  const render = () => {
    list.innerHTML = "";
    for (const r of vp.refModels) {
      const row = h("div", { class: "ref-row", style: "padding:8px 10px;border-bottom:1px solid rgba(127,127,127,.15);display:grid;gap:4px" });
      const vis = h("input", { type: "checkbox", checked: r.visible, title: "表示", onChange: () => vp.setRefModelStyle(r.id, { visible: vis.checked }) });
      row.append(
        h(
          "div",
          { style: "display:flex;align-items:center;gap:6px" },
          vis,
          h("span", { style: "flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap", title: r.name }, r.name),
          h(
            "button",
            {
              class: "icon-btn",
              title: "削除",
              onClick: () => {
                vp.removeRefModel(r.id);
                if (!vp.refModels.length) panel.remove();
                else render();
              },
              html: iconEl("trash").outerHTML,
            },
          ),
        ),
        h("div", { class: "muted" }, r.kind === "points" ? `点群 ${r.count.toLocaleString()} 点` : `メッシュ ${r.count.toLocaleString()} 三角形`),
      );
      if (r.kind === "points") {
        const size = h("input", { type: "range", min: "1", max: "12", step: "1", value: String(r.pointSize), "aria-label": "点の大きさ", onInput: () => vp.setRefModelStyle(r.id, { pointSize: +size.value }) });
        row.append(h("label", { style: "display:flex;align-items:center;gap:6px" }, "点の大きさ", size));
      }
      const own = h("input", { type: "checkbox", checked: r.color === null, onChange: () => vp.setRefModelStyle(r.id, { color: own.checked ? null : color.value }) });
      const color = h("input", { type: "color", value: r.color ?? "#5b8bd9", "aria-label": "表示色", onInput: () => ((own.checked = false), vp.setRefModelStyle(r.id, { color: color.value })) });
      row.append(h("label", { style: "display:flex;align-items:center;gap:6px" }, own, "ファイルの色", h("span", { style: "flex:1" }), "単色", color));
      list.append(row);
    }
  };
  render();
  vp.el.appendChild(panel);
}
