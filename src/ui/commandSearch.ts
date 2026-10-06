import type { App } from "../app";
import { h, iconEl } from "./dom";

interface Entry {
  label: string;
  where: string;
  icon: string;
  shortcut?: string;
  run: () => void;
}

/** Fusion 360 / SOLIDWORKS-style command search (Ctrl+K). */
export function openCommandSearch(app: App) {
  document.querySelector(".cmd-search-back")?.remove();
  const entries: Entry[] = [
    ...app.ribbon.allCommands().map((c) => ({ label: c.label, where: c.tab, icon: c.icon, shortcut: c.shortcut, run: c.action })),
    { label: "新規パーツ", where: "ファイル", icon: "new", shortcut: "Ctrl+N", run: () => app.newDocument() },
    { label: "新規アセンブリ", where: "ファイル", icon: "assembly", run: () => app.newAssembly() },
    { label: "開く", where: "ファイル", icon: "open", shortcut: "Ctrl+O", run: () => app.openFile() },
    { label: "保存", where: "ファイル", icon: "save", shortcut: "Ctrl+S", run: () => app.save() },
    { label: "インポート (STEP / STL / OBJ / DXF)", where: "ファイル", icon: "import", run: () => app.importFile() },
    { label: "エクスポート (STEP / STL / 3MF / OBJ / GLB / DXF)", where: "ファイル", icon: "export", run: () => app.exportMenu(window.innerWidth / 2 - 150, 120) },
    { label: "オプション (マウス操作)", where: "設定", icon: "settings", run: () => app.openSettings() },
    { label: "元に戻す", where: "編集", icon: "undo", shortcut: "Ctrl+Z", run: () => app.undo() },
    { label: "やり直し", where: "編集", icon: "redo", shortcut: "Ctrl+Y", run: () => app.redo() },
  ];
  const input = h("input", { class: "cmd-input", placeholder: "コマンドを検索 (例: 押し出し、fillet、DXF)…", spellcheck: "false" });
  const list = h("div", { class: "cmd-list", role: "listbox" });
  const back = h("div", { class: "cmd-search-back" }, h("div", { class: "cmd-search" }, h("div", { class: "cmd-head" }, iconEl("search"), input), list));
  let shown: Entry[] = [];
  let sel = 0;
  const close = () => back.remove();
  const run = (e: Entry) => {
    close();
    e.run();
  };
  const aliases: Record<string, string> = {
    extrude: "押し出し", revolve: "回転", fillet: "フィレット", chamfer: "面取り", shell: "シェル", hole: "穴", sketch: "スケッチ",
    pattern: "パターン", mirror: "ミラー", loft: "ロフト", sweep: "スイープ", measure: "測定", "press pull": "プレス/プル", pushpull: "プレス/プル",
    parameter: "パラメータ", section: "断面", constraint: "拘束", mate: "メイト", export: "エクスポート", import: "インポート", line: "線分",
    circle: "円", rectangle: "長方形", dimension: "寸法", trim: "トリム", plane: "平面", drawing: "図面", bom: "部品表",
  };
  const update = () => {
    const q = input.value.trim().toLowerCase();
    const jp = Object.entries(aliases).filter(([k]) => q && k.startsWith(q)).map(([, v]) => v);
    shown = entries.filter((e) => !q || e.label.toLowerCase().includes(q) || e.where.toLowerCase().includes(q) || jp.some((j) => e.label.includes(j))).slice(0, 12);
    sel = Math.min(sel, Math.max(0, shown.length - 1));
    list.innerHTML = "";
    shown.forEach((e, i) =>
      list.appendChild(
        h(
          "button",
          { class: "cmd-item" + (i === sel ? " on" : ""), role: "option", onClick: () => run(e), onMouseenter: () => ((sel = i), update()) },
          iconEl(e.icon),
          h("span", { class: "cmd-label" }, e.label),
          h("span", { class: "cmd-where" }, e.where),
          e.shortcut ? h("kbd", {}, e.shortcut) : null,
        ),
      ),
    );
    if (!shown.length) list.appendChild(h("div", { class: "cmd-empty" }, "一致するコマンドがありません"));
  };
  input.addEventListener("input", () => ((sel = 0), update()));
  input.addEventListener("keydown", (e) => {
    e.stopPropagation();
    if (e.key === "Escape") close();
    else if (e.key === "ArrowDown") (sel = Math.min(sel + 1, shown.length - 1)), update(), e.preventDefault();
    else if (e.key === "ArrowUp") (sel = Math.max(sel - 1, 0)), update(), e.preventDefault();
    else if (e.key === "Enter" && shown[sel]) run(shown[sel]);
  });
  back.addEventListener("pointerdown", (e) => e.target === back && close());
  document.body.appendChild(back);
  update();
  input.focus();
}
