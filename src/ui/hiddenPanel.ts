// Hidden-items panel (非表示の一覧) and the part's saved display states
// (表示状態). Both work through the view controller (viewContextMenu.ts), so
// restoring an item or recalling a view is one undoable view step.
import * as THREE from "three";
import type { App } from "../app";
import { hiddenList, nextPartViewName, partViewState, type PartView } from "../core/viewState";
import type { VisualStyle } from "../viewer/viewport";
import { floatPanel } from "./bomPanel";
import { h, iconEl, promptDialog, toast } from "./dom";

/** Lists the hidden bodies / components; each can be shown again, or all at once. */
export function openHiddenPanel(app: App) {
  const ctl = app.viewCtx;
  const list = h("div", { class: "hidden-list", role: "list", "aria-label": "非表示の部品" });
  const count = h("span", { class: "muted hidden-count" });
  const render = () => {
    list.innerHTML = "";
    const hidden = hiddenList(ctl.state(), ctl.items());
    count.textContent = hidden.length ? `${hidden.length} 個を非表示にしています` : "非表示の部品はありません";
    for (const it of hidden) {
      const show = h("button", { class: "hidden-show", title: "表示する" }, iconEl("eye"), "表示");
      show.addEventListener("click", () => ctl.show([it.id]));
      const name = h("button", { class: "hidden-name", title: "選択" }, iconEl("eyeOff"), h("span", {}, it.name));
      name.addEventListener("click", () => ctl.target()?.select([it.id]));
      list.appendChild(h("div", { class: "hidden-row", role: "listitem", "data-item": it.id }, name, show));
    }
  };
  const all = h("button", { class: "primary hidden-all" }, "すべて表示");
  all.addEventListener("click", () => ctl.showAll());
  const body = h("div", { class: "hidden-body" }, h("div", { class: "hidden-tools" }, count, all), list);
  ctl.listeners.add(render);
  render();
  return floatPanel(app, "hidden-panel", "非表示の部品", "eyeOff", body, { width: 320, top: 60, onClose: () => ctl.listeners.delete(render) });
}

// ------------------------------------------------------- part views ---

function partViews(app: App): PartView[] {
  return app.store.doc.views ?? [];
}

/** Stores the views without a document history entry; the editing mode marks the file modified. */
function writeViews(app: App, views: PartView[]) {
  app.store.doc.views = views;
  if (!app.viewer.active) app.store.dirty = true;
  app.refreshUI();
}

/** Saves the current display state of the part (camera, bodies, sections, style). */
export function savePartView(app: App, name?: string): PartView {
  const vp = app.vp;
  const v = vp.anim ? vp.anim.to : vp.view;
  const s = app.viewCtx.partState;
  const views = partViews(app);
  const view: PartView = {
    id: `pv${Date.now().toString(36)}${Math.floor(Math.random() * 1e4)}`,
    name: name ?? nextPartViewName(views),
    camera: { target: [v.target.x, v.target.y, v.target.z], quat: [v.quat.x, v.quat.y, v.quat.z, v.quat.w], height: v.height, perspective: vp.perspective },
    hidden: [...s.hidden],
    transparent: [...s.transparent],
    colors: { ...s.colors },
    sections: vp.sectionPlanes().map((p) => ({ normal: [p.normal.x, p.normal.y, p.normal.z], constant: p.constant })),
    style: vp.style,
    saved: new Date().toISOString(),
  };
  writeViews(app, [...views, view]);
  for (const l of app.viewCtx.listeners) l();
  return view;
}

/** Recalls a saved part view (the body state is one undo step; the camera moves smoothly). */
export function recallPartView(app: App, id: string, animate = true): boolean {
  const v = partViews(app).find((x) => x.id === id);
  if (!v) return false;
  const vp = app.vp;
  app.viewCtx.op(`ビュー「${v.name}」`, () => partViewState(v));
  if (vp.style !== v.style) app.setStyle(v.style as VisualStyle);
  if (!app.sectionView) vp.setSections(v.sections.map((p) => new THREE.Plane(new THREE.Vector3(...p.normal), p.constant)), { caps: true });
  if (vp.perspective !== v.camera.perspective) vp.setPerspective(v.camera.perspective);
  const to = { target: new THREE.Vector3(...v.camera.target), quat: new THREE.Quaternion(...v.camera.quat).normalize(), height: v.camera.height };
  if (animate) vp.animateTo(to, 450);
  else {
    vp.anim = null;
    vp.view = to;
    vp.updateCamera();
  }
  return true;
}

/** 表示状態: the assembly's views panel, or the part's own list. */
export function openViewStates(app: App) {
  if (app.env === "assembly") return void import("./asmViewUi").then((m) => m.openViewsPanel(app));
  const ctl = app.viewCtx;
  const list = h("div", { class: "views-list", role: "listbox", "aria-label": "保存したビュー" });
  const render = () => {
    list.innerHTML = "";
    for (const v of partViews(app)) {
      const recall = h("button", { class: "view-name", title: "呼び出す" }, iconEl("screenshot"), h("span", {}, v.name), h("small", { class: "muted" }, `${v.hidden.length ? `非表示 ${v.hidden.length} ` : ""}${v.transparent.length ? `透明 ${v.transparent.length} ` : ""}${Object.keys(v.colors).length ? "色 " : ""}${v.sections.length ? "断面" : ""}`));
      recall.addEventListener("click", () => recallPartView(app, v.id));
      const del = h("button", { class: "view-act", title: "削除", "aria-label": "削除" }, "削除");
      del.addEventListener("click", () => {
        writeViews(app, partViews(app).filter((x) => x.id !== v.id));
        render();
      });
      list.appendChild(h("div", { class: "view-row", "data-view": v.id }, recall, del));
    }
    if (!partViews(app).length) list.appendChild(h("p", { class: "muted" }, "保存したビューはありません。"));
  };
  const save = h("button", { class: "primary views-save" }, "現在の表示を保存");
  save.addEventListener("click", async () => {
    const n = await promptDialog("表示状態を保存", "名前", nextPartViewName(partViews(app)));
    if (!n?.trim()) return;
    savePartView(app, n.trim());
    toast(`「${n.trim()}」を保存しました`, "ok");
  });
  const body = h("div", { class: "views-body" }, h("p", { class: "muted" }, "カメラ・ボディの表示/非表示・半透明・色・断面・表示スタイルを保存します。"), save, list);
  ctl.listeners.add(render);
  render();
  return floatPanel(app, "views-panel", "表示状態 (ビュー)", "screenshot", body, { width: 360, onClose: () => ctl.listeners.delete(render) });
}
