// Minimal, safe bridge between the desktop shell and the CAD UI.
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("desktop", {
  platform: process.platform,
  /** Files opened from the OS (double-click, "Open with", drag onto the icon). */
  onOpenFile(cb) {
    ipcRenderer.on("open-file", (_e, f) => cb(f));
    ipcRenderer.send("renderer-ready");
  },
  /** Vector PDF of the drawing sheets (HTML with one SVG per page). */
  printPdf(html, w, h, name) {
    return ipcRenderer.invoke("print-pdf", { html, w, h, name });
  },
});
