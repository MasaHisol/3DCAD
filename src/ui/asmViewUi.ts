// Assembly viewing UI: saved views (表示状態) panel, colour mode menu and
// legend, visibility menu and the interference check panel.
import type { App } from "../app";
import { COLOR_MODES, type ColorMode } from "../assembly/colorBy";
import { DEFAULT_INTERFERENCE_OPTIONS, type InterferenceOptions, type InterferenceResult } from "../assembly/interference";
import { HOME_VIEW_ID } from "../assembly/views";
import { formatNumber } from "../core/expr";
import { contextMenu, h, iconEl, promptDialog, toast } from "./dom";
import { floatPanel } from "./bomPanel";

// ---------------------------------------------------------------- views ---

export function openViewsPanel(app: App) {
  const vw = app.asm.viewing;
  const list = h("div", { class: "views-list", role: "listbox", "aria-label": "保存したビュー" });
  const render = () => {
    list.innerHTML = "";
    const row = (id: string, name: string, sub: string, saved: boolean) => {
      const recall = h("button", { class: "view-name", title: "呼び出す" }, iconEl(id === HOME_VIEW_ID ? "home" : "screenshot"), h("span", {}, name), h("small", { class: "muted" }, sub));
      recall.addEventListener("click", () => vw.recallView(id));
      const btn = (label: string, title: string, fn: () => void) => {
        const b = h("button", { class: "view-act", title, "aria-label": title }, label);
        b.addEventListener("click", fn);
        return b;
      };
      const acts = saved
        ? [
            btn("更新", "現在の表示状態で上書き", () => (vw.saveView(undefined, id), toast(`「${name}」を更新しました`, "ok"))),
            btn("名前", "名前を変更", async () => {
              const n = await promptDialog("ビューの名前変更", "名前", name);
              if (n?.trim()) vw.renameView(id, n.trim());
            }),
            btn("削除", "削除", () => vw.deleteView(id)),
          ]
        : [btn("現在をホームに", "現在の表示状態をホーム ビューにします", () => vw.setHomeFromCurrent())];
      list.appendChild(h("div", { class: "view-row", "data-view": id }, recall, ...acts));
    };
    const views = vw.views();
    if (!views.some((v) => v.id === HOME_VIEW_ID)) row(HOME_VIEW_ID, "ホーム", "既定 (すべて表示・等角)", false);
    for (const v of views) row(v.id, v.name, `${v.hidden.length ? `非表示 ${v.hidden.length} ` : ""}${v.transparent.length ? `透明 ${v.transparent.length} ` : ""}${v.explode ? "分解 " : ""}${v.sections.length ? "断面 " : ""}${v.colorMode !== "default" ? "色分け" : ""}`, true);
  };
  const save = h("button", { class: "primary views-save" }, "現在の表示を保存");
  save.addEventListener("click", async () => {
    const n = await promptDialog("表示状態を保存", "名前", nextName(app));
    if (n?.trim()) vw.saveView(n.trim());
  });
  const body = h("div", { class: "views-body" }, h("p", { class: "muted" }, "カメラ・表示/非表示・透明・分解・断面・表示スタイル・色分けを保存します。"), save, list);
  vw.listeners.add(render);
  render();
  return floatPanel(app, "views-panel", "表示状態 (ビュー)", "screenshot", body, { width: 380, onClose: () => vw.listeners.delete(render) });
}

function nextName(app: App): string {
  const used = new Set(app.asm.viewing.views().map((v) => v.name));
  for (let i = 1; ; i++) if (!used.has(`ビュー${i}`)) return `ビュー${i}`;
}

// --------------------------------------------------------------- colour ---

let legendEl: HTMLElement | null = null;

/** Legend overlay of the current colour mode (bottom left of the viewport). */
export function renderLegend(app: App) {
  const vw = app.asm.viewing;
  const items = app.env === "assembly" ? vw.legend() : [];
  if (!items.length) {
    legendEl?.remove();
    legendEl = null;
    return;
  }
  if (!legendEl) {
    legendEl = h("div", { class: "color-legend", "aria-label": "色分けの凡例" });
    app.vp.el.appendChild(legendEl);
  }
  legendEl.innerHTML = "";
  legendEl.appendChild(h("div", { class: "cl-title" }, COLOR_MODES.find((m) => m.id === vw.colorMode)?.label ?? ""));
  const max = 24;
  for (const it of items.slice(0, max)) {
    const r = h("div", { class: "cl-item", title: "クリックで選択" }, h("span", { class: "cl-sw", style: `background:${it.color}` }), h("span", {}, it.label));
    r.addEventListener("click", () => app.asm.select(it.compIds));
    legendEl.appendChild(r);
  }
  if (items.length > max) legendEl.appendChild(h("div", { class: "muted" }, `他 ${items.length - max} 件`));
}

export function colorMenu(app: App, x: number, y: number) {
  const vw = app.asm.viewing;
  contextMenu(x, y, [
    ...COLOR_MODES.map((m) => ({ label: `${vw.colorMode === m.id ? "● " : ""}${m.label}`, action: () => vw.setColorMode(m.id as ColorMode) })),
    { label: "ランダムの配色を変更", action: () => vw.setColorMode("random", true) },
  ]);
}

// ----------------------------------------------------------- visibility ---

export function visibilityMenu(app: App, x: number, y: number) {
  const env = app.asm, vw = env.viewing;
  const sel = [...env.selected].filter((id) => env.doc.components.some((c) => c.id === id));
  const need = (fn: () => void) => () => (sel.length ? fn() : toast("コンポーネントを選択してください", "warn"));
  contextMenu(x, y, [
    { label: "選択のみ表示 (分離)", icon: "eye", action: need(() => vw.isolate(sel)) },
    { label: "選択を非表示", icon: "eyeOff", action: need(() => vw.hide(sel)) },
    { label: "他を透明に", action: need(() => vw.transparentOthers(sel)) },
    { label: "選択を透明に / 戻す", action: need(() => vw.setTransparent(sel, !sel.every((id) => vw.transparent.has(id)))) },
    { label: "同じ部品をすべて非表示", action: need(() => vw.hideByType("sameParts")) },
    { label: "締結部品を非表示", action: () => vw.hideByType("fasteners") || toast("締結部品はありません", "info") },
    { label: "STEP 部品を非表示", action: () => vw.hideByType("step") || toast("STEP 部品はありません", "info") },
    { label: "透明を解除", action: () => vw.clearTransparency() },
    { label: "すべて表示", icon: "eye", action: () => vw.showAll() },
  ]);
}

// --------------------------------------------------------- interference ---

let interfOpts: InterferenceOptions = { ...DEFAULT_INTERFERENCE_OPTIONS };

export function openInterferencePanel(app: App) {
  const env = app.asm, vw = env.viewing;
  if (env.doc.components.length < 2) return void toast("2 つ以上のコンポーネントが必要です", "info");
  const chk = (label: string, get: () => boolean, set: (v: boolean) => void) => {
    const i = h("input", { type: "checkbox" }) as HTMLInputElement;
    i.checked = get();
    i.addEventListener("change", () => set(i.checked));
    return h("label", { class: "chk" }, i, label);
  };
  const scope = h("select", { class: "if-scope", "aria-label": "対象" }, h("option", { value: "all" }, "すべての組み合わせ"), h("option", { value: "sel" }, "選択したコンポーネントのみ")) as HTMLSelectElement;
  if (env.selected.size >= 1 && [...env.selected].some((id) => env.doc.components.some((c) => c.id === id))) scope.value = "sel";
  const run = h("button", { class: "primary if-run" }, "計算");
  const list = h("div", { class: "if-list" });
  const status = h("div", { class: "muted if-status" });
  const name = (id: string) => env.doc.components.find((c) => c.id === id)?.name ?? id;
  const render = () => {
    const res = vw.lastInterference;
    list.innerHTML = "";
    if (!res.length) {
      list.appendChild(h("p", { class: "muted" }, status.dataset.ran ? "干渉は検出されませんでした" : "「計算」を押してください"));
      vw.showInterference([]);
      return;
    }
    const tbl = h("tbody");
    for (const r of res) {
      const ig = h("button", { class: "if-ignore", title: r.ignored ? "除外を解除" : "この組み合わせを除外 (圧入など)" }, r.ignored ? "戻す" : "除外");
      ig.addEventListener("click", (e) => (e.stopPropagation(), vw.toggleIgnore(r.a, r.b)));
      const tr = h(
        "tr",
        { class: `if-row ${r.kind}${r.ignored ? " ignored" : ""}`, "data-pair": `${r.a}|${r.b}` },
        h("td", {}, `${name(r.a)} ⟷ ${name(r.b)}`),
        h("td", {}, r.kind === "interfere" ? "干渉" : "接触"),
        h("td", { class: "num" }, r.kind === "interfere" ? `${formatNumber(r.volume, 3)} mm³` : "—"),
        h("td", {}, ig),
      );
      tr.addEventListener("click", () => focus(r));
      tbl.appendChild(tr);
    }
    list.appendChild(h("table", { class: "ptable" }, h("thead", {}, h("tr", {}, h("th", {}, "組み合わせ"), h("th", {}, "種類"), h("th", {}, "体積"), h("th", {}, ""))), tbl));
    vw.showInterference(res);
  };
  const focus = (r: InterferenceResult) => {
    env.select([r.a, r.b]);
    vw.transparentOthers([r.a, r.b]);
    vw.showInterference([r]);
  };
  run.addEventListener("click", async () => {
    run.setAttribute("disabled", "");
    status.textContent = "計算中…";
    try {
      const subset = scope.value === "sel" ? new Set([...env.selected]) : undefined;
      const res = await vw.runInterference({ ...interfOpts, subset });
      const st = vw.lastInterferenceStats;
      status.dataset.ran = "1";
      const nI = res.filter((r) => r.kind === "interfere" && !r.ignored).length, nT = res.filter((r) => r.kind === "touch" && !r.ignored).length;
      status.textContent = `干渉 ${nI} / 接触 ${nT} — 候補 ${st.candidates} / 全 ${st.pairs} 組 (${Math.round(st.ms)} ms${st.pooled ? "・並列" : ""})`;
      env.select([...new Set(res.filter((r) => r.kind === "interfere" && !r.ignored).flatMap((r) => [r.a, r.b]))]);
    } catch (e) {
      status.textContent = (e as Error).message;
    } finally {
      run.removeAttribute("disabled");
      render();
    }
  });
  const body = h(
    "div",
    { class: "if-body" },
    h("div", { class: "if-tools" }, scope, run),
    h(
      "div",
      { class: "if-opts" },
      chk("締結部品を含める", () => interfOpts.includeFasteners, (v) => (interfOpts.includeFasteners = v)),
      chk("接触も表示", () => interfOpts.touches, (v) => (interfOpts.touches = v)),
      chk("除外した組み合わせも表示", () => interfOpts.showIgnored, (v) => (interfOpts.showIgnored = v)),
    ),
    status,
    list,
  );
  vw.listeners.add(render);
  render();
  return floatPanel(app, "interference-panel", "干渉チェック", "intersect", body, {
    width: 460,
    onClose: () => {
      vw.listeners.delete(render);
      vw.showInterference([]);
    },
  });
}

export function resetInterferenceOptions() {
  interfOpts = { ...DEFAULT_INTERFERENCE_OPTIONS };
}
