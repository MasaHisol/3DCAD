// Desktop shell for 3DCAD Studio (Electron main process).
// The built web bundle (dist/) is served through a private "app://" scheme so
// module workers and WebAssembly load exactly as they do over HTTP, fully offline.
const { app, BrowserWindow, Menu, dialog, ipcMain, protocol, shell } = require("electron");
const fs = require("node:fs");
const path = require("node:path");

const DIST = path.join(__dirname, "..", "dist");
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".wasm": "application/wasm",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};
const OPENABLE = new Set([".3dcp", ".3dca", ".stp", ".step", ".stl", ".json"]);

// CAD needs WebGL even on blocklisted / virtual GPUs (VMs, remote desktop):
// allow the GPU anyway and fall back to software rendering when there is none.
app.commandLine.appendSwitch("ignore-gpu-blocklist");
app.commandLine.appendSwitch("enable-unsafe-swiftshader");

protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true, codeCache: true } },
]);

let win = null;
let pendingFiles = [];
let rendererReady = false;

function filesFromArgv(argv) {
  return argv.slice(app.isPackaged ? 1 : 2).filter((a) => !a.startsWith("-") && OPENABLE.has(path.extname(a).toLowerCase()) && fs.existsSync(a));
}

function sendFile(file) {
  if (!win || !rendererReady) {
    pendingFiles.push(file);
    return;
  }
  try {
    const data = fs.readFileSync(file);
    win.webContents.send("open-file", { name: path.basename(file), data: data.toString("base64") });
    if (win.isMinimized()) win.restore();
    win.focus();
  } catch (e) {
    dialog.showErrorBox("ファイルを開けません", String(e));
  }
}

function buildMenu() {
  const isMac = process.platform === "darwin";
  const template = [
    ...(isMac ? [{ label: app.name, submenu: [{ role: "about", label: "3DCAD Studio について" }, { type: "separator" }, { role: "hide", label: "隠す" }, { role: "quit", label: "終了" }] }] : []),
    {
      label: "ファイル",
      submenu: [isMac ? { role: "close", label: "ウィンドウを閉じる" } : { role: "quit", label: "終了" }],
    },
    {
      // only clipboard roles: undo/redo/shortcuts are handled by the CAD itself
      label: "編集",
      submenu: [
        { role: "cut", label: "切り取り" },
        { role: "copy", label: "コピー" },
        { role: "paste", label: "貼り付け" },
        { role: "selectAll", label: "すべて選択" },
      ],
    },
    {
      label: "表示",
      submenu: [
        { role: "togglefullscreen", label: "全画面表示" },
        { role: "resetZoom", label: "実際のサイズ" },
        { role: "zoomIn", label: "拡大" },
        { role: "zoomOut", label: "縮小" },
        { type: "separator" },
        { role: "toggleDevTools", label: "開発者ツール" },
      ],
    },
    {
      label: "ヘルプ",
      submenu: [
        { label: "座学テキスト (設計の基礎・構造力学・デザイン)", click: () => openTextbook() },
        { type: "separator" },
        {
          label: "バージョン情報",
          click: () =>
            dialog.showMessageBox(win, {
              type: "info",
              title: "3DCAD Studio",
              message: `3DCAD Studio ${app.getVersion()}`,
              detail: `パラメトリック 3D CAD\nElectron ${process.versions.electron} / Chromium ${process.versions.chrome}\nジオメトリ カーネル: OpenCascade (replicad)`,
            }),
        },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// ------------------------------------------------------------ textbook ---

let textbookWin = null;

/** The textbook (textbook.html) in its own window; reuses the open one. */
function openTextbook(hash = "") {
  const url = "app://cad/textbook.html" + hash;
  if (textbookWin && !textbookWin.isDestroyed()) {
    if (hash) textbookWin.loadURL(url);
    if (textbookWin.isMinimized()) textbookWin.restore();
    textbookWin.focus();
    return;
  }
  textbookWin = new BrowserWindow({
    width: 1200,
    height: 860,
    minWidth: 480,
    minHeight: 480,
    title: "設計の座学テキスト",
    backgroundColor: "#f5f6f8",
    icon: path.join(__dirname, "..", "build", "icon.png"),
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true, spellcheck: false },
  });
  textbookWin.webContents.setWindowOpenHandler(windowOpenHandler);
  textbookWin.webContents.on("will-navigate", (e, u) => {
    if (!u.startsWith("app://cad/textbook.html")) {
      e.preventDefault();
      if (/^https?:/.test(u)) shell.openExternal(u);
    }
  });
  textbookWin.on("closed", () => (textbookWin = null));
  textbookWin.loadURL(url);
}

function windowOpenHandler({ url }) {
  if (url === "about:blank" || url === "") return { action: "allow" };
  const m = /^app:\/\/cad\/textbook\.html(#.*)?$/.exec(url);
  if (m) {
    openTextbook(m[1] ?? "");
    return { action: "deny" };
  }
  // the textbook asks the CAD window (already open) to start a lesson: just bring it forward
  if (url.startsWith("app://cad/index.html")) {
    if (win && !win.isDestroyed()) win.focus();
    return { action: "deny" };
  }
  if (/^https?:/.test(url)) shell.openExternal(url);
  return { action: "deny" };
}

function createWindow() {
  win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1000,
    minHeight: 640,
    title: "3DCAD Studio",
    backgroundColor: "#eef0f3",
    icon: path.join(__dirname, "..", "build", "icon.png"),
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false,
    },
  });
  win.once("ready-to-show", () => {
    win.maximize();
    win.show();
  });

  // print window (about:blank) and the textbook are allowed; real links open in the system browser
  win.webContents.setWindowOpenHandler(windowOpenHandler);
  win.webContents.on("will-navigate", (e, url) => {
    if (!url.startsWith("app://")) {
      e.preventDefault();
      if (/^https?:/.test(url)) shell.openExternal(url);
    }
  });

  // the renderer blocks unload while there are unsaved changes: ask the user
  win.webContents.on("will-prevent-unload", (e) => {
    const choice = dialog.showMessageBoxSync(win, {
      type: "warning",
      buttons: ["保存せずに終了", "キャンセル"],
      defaultId: 1,
      cancelId: 1,
      title: "3DCAD Studio",
      message: "保存されていない変更があります。",
      detail: "保存せずに終了すると変更は失われます (作業内容は次回起動時に自動復元されます)。",
    });
    if (choice === 0) e.preventDefault();
  });

  win.loadURL("app://cad/index.html");
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", (_e, argv) => {
    for (const f of filesFromArgv(argv)) sendFile(f);
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });
  // macOS: files opened from Finder / dock
  app.on("open-file", (e, file) => {
    e.preventDefault();
    sendFile(file);
  });

  app.whenReady().then(() => {
    protocol.handle("app", async (req) => {
      const url = new URL(req.url);
      let rel = decodeURIComponent(url.pathname);
      if (rel === "/" || rel === "") rel = "/index.html";
      const file = path.normalize(path.join(DIST, rel));
      if (!file.startsWith(DIST)) return new Response("forbidden", { status: 403 });
      try {
        const data = await fs.promises.readFile(file);
        return new Response(data, {
          headers: {
            "content-type": MIME[path.extname(file).toLowerCase()] ?? "application/octet-stream",
            // cross-origin isolation: shared memory for the multi-core analysis
            "cross-origin-opener-policy": "same-origin",
            "cross-origin-embedder-policy": "require-corp",
          },
        });
      } catch {
        return new Response("not found", { status: 404 });
      }
    });
    ipcMain.handle("print-pdf", async (e, { html, w, h, name }) => {
      const parent = BrowserWindow.fromWebContents(e.sender);
      const res = await dialog.showSaveDialog(parent, { defaultPath: name, filters: [{ name: "PDF", extensions: ["pdf"] }] });
      if (res.canceled || !res.filePath) return false;
      const win = new BrowserWindow({ show: false, webPreferences: { offscreen: true, javascript: false } });
      try {
        await win.loadURL("data:text/html;charset=utf-8," + encodeURIComponent(html));
        const pdf = await win.webContents.printToPDF({
          printBackground: true,
          margins: { marginType: "none" },
          pageSize: { width: w / 25.4, height: h / 25.4 },
        });
        await fs.promises.writeFile(res.filePath, pdf);
        return true;
      } finally {
        win.destroy();
      }
    });
    ipcMain.on("renderer-ready", () => {
      rendererReady = true;
      const files = pendingFiles;
      pendingFiles = [];
      for (const f of files) sendFile(f);
    });
    buildMenu();
    pendingFiles.push(...filesFromArgv(process.argv));
    createWindow();
  });

  app.on("window-all-closed", () => app.quit());
}
