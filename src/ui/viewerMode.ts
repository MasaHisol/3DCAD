// 閲覧専用モード: 編集 UI (編集用リボン タブ・タイムライン・フィーチャ編集・スケッチ) を隠し、
// 表示・測定・断面・分解・部品表・プロパティ・画像/印刷だけを並べた「閲覧」タブで表示する。
// 閲覧タブは下の VIEWER_PANELS (コマンド id の一覧) から作るので、他のモジュールが追加した
// コマンドも registerViewerCommand(id) で並べられる (定義のない id は表示しない)。
import type { App } from "../app";
import type { RibbonButton, RibbonItem, RibbonTab } from "./ribbon";
import { h, iconEl, toast } from "./dom";

/** Formats that open in the viewer mode when double-clicked (keep in sync with electron/fileRouting.cjs). */
export const VIEWER_EXTS = ["stp", "step", "igs", "iges", "gltf", "glb", "stl", "obj", "3mf", "ply", "e57", "ifc", "dxf"];
/** The app's own documents (open in the editing mode). */
export const NATIVE_EXTS = ["3dcp", "3dca", "json"];

export function fileExt(name: string): string {
  const m = /\.([^./\\]+)$/.exec(name);
  return m ? m[1].toLowerCase() : "";
}
export const isViewerFile = (name: string) => VIEWER_EXTS.includes(fileExt(name));

/** Viewer mode requested by the URL (?viewer=1 / ?viewer) or the command line (--viewer). */
export function viewerRequested(search: string, argv: readonly string[] = []): boolean {
  const v = new URLSearchParams(search).get("viewer");
  if (v !== null) return v !== "0" && v !== "false";
  return argv.includes("--viewer");
}

export interface ViewerPanel {
  title: string;
  /** Ribbon command ids (any tab) or viewer-only ids (vw-*). */
  ids: string[];
}

/** The viewer tab, by command id. Ids without a definition (e.g. not added yet) are skipped. */
export const VIEWER_PANELS: ViewerPanel[] = [
  { title: "ファイル", ids: ["vw-open", "vw-print", "shot", "save-image"] },
  { title: "ナビゲート", ids: ["home", "fit", "look", "ortho", "persp"] },
  { title: "表示スタイル", ids: ["st-se", "st-s", "st-h", "st-w", "realistic"] },
  { title: "測定・断面", ids: ["measure", "measure-hole", "measure-pcd", "measure-thickness", "measure-clearance", "measure-notes", "section"] },
  { title: "アセンブリ", ids: ["asm-explode", "asm-isolate", "asm-showall", "asm-visibility", "asm-transparent", "asm-bom", "asm-colorby", "asm-views", "asm-interference", "asm-light"] },
  { title: "情報", ids: ["vw-tree", "iprops", "pmi-toggle", "vw-help"] },
  { title: "モード", ids: ["vw-edit"] },
];

/** Adds a command (by ribbon id) to the viewer tab, e.g. a new measurement or saved-view tool. */
export function registerViewerCommand(id: string, panel = "測定・断面") {
  let p = VIEWER_PANELS.find((x) => x.title === panel);
  if (!p) VIEWER_PANELS.splice(VIEWER_PANELS.length - 1, 0, (p = { title: panel, ids: [] }));
  if (!p.ids.includes(id)) p.ids.push(id);
}

/** Every command id the viewer tab may show (for tests and the help index). */
export function viewerCommandIds(): string[] {
  return VIEWER_PANELS.flatMap((p) => p.ids);
}

/** Commands of the editing UI that the viewer mode never shows. */
export const EDIT_ONLY = /^(sketch|extrude|revolve|sk-|sm-|surf|pmi-(dim|diameter|gdt|datum|surface|note)$|dw-|rules|family|params|asm-(place|create|constrain|mate|insert|axis|move|rotate|pattern)$)/;

/** Keys that stay active in the viewer mode (navigation, measure, help, open). */
export function viewerAllowsKey(e: { key: string; ctrlKey: boolean; metaKey: boolean; shiftKey: boolean; altKey: boolean }): boolean {
  const k = e.key.toLowerCase();
  if (e.ctrlKey || e.metaKey) return k === "o" || k === "k" || k === "p";
  if (e.key.length === 1) return k === "m" || k === "?";
  return !["Delete", "Backspace"].includes(e.key);
}

/** The viewer tab's own buttons (open / print / tree / help / edit mode). */
export function viewerRibbonTab(app: App, mode: ViewerMode): RibbonTab {
  const own: RibbonButton[] = [
    { id: "vw-open", label: "開く", icon: "open", shortcut: "Ctrl+O", tip: "STEP・IGES・glTF・STL・OBJ・3MF・PLY・E57・IFC・DXF などを開いて表示します。", action: () => void mode.pickAndOpen() },
    { id: "vw-print", label: "印刷", icon: "screenshot", size: "small", shortcut: "Ctrl+P", tip: "現在のビューを印刷します (PDF に保存することもできます)。", action: () => mode.print() },
    { id: "vw-tree", label: "モデル構成", icon: "assembly", size: "small", tip: "モデル ブラウザ (部品構成・フィーチャ一覧) の表示を切り替えます。", action: () => mode.toggleTree(), active: () => !document.documentElement.classList.contains("viewer-no-tree") },
    { id: "vw-help", label: "ヘルプ", icon: "help", size: "small", shortcut: "F1", tip: "閲覧モードの使い方を表示します。", action: () => void import("../help").then((m) => m.openHelp(app, "help:viewer")) },
    { id: "vw-edit", label: "編集モードで開く", icon: "edit", tip: "閲覧モードを終了し、スケッチ・フィーチャ・図面などすべての編集機能を使えるようにします。", action: () => mode.exit() },
  ];
  const tab: RibbonTab = { id: "viewer", label: "閲覧", visible: () => mode.active, panels: [] };
  const resolve = (id: string): RibbonButton | null => {
    const o = own.find((b) => b.id === id);
    if (o) return o;
    // a command of another tab: shown only while its tab belongs to the current environment
    for (const t of app.ribbon.tabs) {
      if (t.id === "viewer") continue;
      for (const p of t.panels)
        for (const it of p.items)
          for (const b of "stack" in it ? it.stack : "custom" in it ? [] : [it])
            if (b.id === id) return { ...b, enabled: () => (!t.visible || t.visible()) && (!b.enabled || b.enabled()) };
    }
    return null;
  };
  /** Rebuilds the panels from VIEWER_PANELS (picks up commands registered later). */
  mode.rebuildTab = () => {
    tab.panels = VIEWER_PANELS.map((p) => {
      const btns = p.ids.map(resolve).filter((b): b is RibbonButton => !!b);
      const items: RibbonItem[] = [];
      const small = btns.filter((b) => b.size === "small");
      for (const b of btns) if (b.size !== "small") items.push(b);
      for (let i = 0; i < small.length; i += 3) items.push({ stack: small.slice(i, i + 3) });
      return { title: p.title, items };
    }).filter((p) => p.items.length);
  };
  mode.rebuildTab();
  return tab;
}

export class ViewerMode {
  active = false;
  rebuildTab = () => {};
  private tab: RibbonTab | null = null;
  private editBtn: HTMLElement | null = null;

  constructor(private app: App) {}

  /** Switches to the viewer mode (hides the editing UI). */
  enter() {
    const app = this.app;
    if (!this.tab) {
      this.tab = viewerRibbonTab(app, this);
      app.ribbon.addTab(this.tab, true);
    }
    if (app.mode === "sketch") app.exitSketch(true);
    if (app.command) app.finishCommand(app.command, false);
    if (app.env === "drawing") app.leaveDrawingEnv();
    this.active = true;
    this.rebuildTab();
    document.documentElement.classList.add("viewer-mode");
    app.ribbon.tabFilter = (t) => t.id === "viewer";
    app.ribbon.setActive("viewer");
    this.ensureEditButton();
    document.title = "3DCAD Viewer";
    app.refreshUI();
  }

  /** Back to the full editing UI (the open model stays and becomes editable). */
  exit() {
    const app = this.app;
    if (!this.active) return;
    this.active = false;
    document.documentElement.classList.remove("viewer-mode", "viewer-no-tree");
    app.ribbon.tabFilter = null;
    app.ribbon.setActive(app.env === "assembly" ? "assemble" : "model");
    document.title = "3DCAD Studio";
    app.refreshUI();
    app.preloadEditing();
    toast("編集モードに切り替えました。すべての編集機能を使えます", "ok", 3000);
  }

  toggle(on = !this.active) {
    if (on) this.enter();
    else this.exit();
  }

  private ensureEditButton() {
    if (this.editBtn?.isConnected) return;
    this.editBtn = h("button", { class: "tb-edit-mode", title: "編集モードで開く (すべての編集機能を使う)", onClick: () => this.exit() }, iconEl("edit"), h("span", {}, "編集モードで開く"));
    document.querySelector(".tb-right")?.prepend(this.editBtn);
  }

  /** Opens a file for viewing: replaces the current (viewed) model instead of importing into it. */
  async open(f: File) {
    const app = this.app;
    await app.openForViewing(f);
  }

  async pickAndOpen() {
    const { pickFile } = await import("./dom");
    const f = await pickFile(`.3dcp,.3dca,.json,${VIEWER_EXTS.map((e) => "." + e).join(",")}`);
    if (f) await this.open(f);
  }

  print() {
    const url = this.app.vp.screenshot();
    const w = window.open("", "_blank");
    if (!w) return void toast("印刷ウィンドウを開けませんでした (ポップアップを許可してください)", "error");
    const name = (this.app.store.doc.name || "3DCAD").replace(/[<>&"]/g, "");
    w.document.write(`<!doctype html><meta charset="utf-8"><title>${name}</title><style>body{margin:0;font-family:sans-serif}img{max-width:100%;display:block;margin:auto}p{text-align:center;font-size:12px}</style><img src="${url}"><p>${name} — ${new Date().toLocaleString("ja-JP")}</p><script>onload=()=>{print()}</` + `script>`);
    w.document.close();
  }

  toggleTree() {
    document.documentElement.classList.toggle("viewer-no-tree");
    this.app.ribbon.refresh();
    window.dispatchEvent(new Event("resize"));
  }
}
