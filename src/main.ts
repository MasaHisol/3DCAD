import "./styles.css";
import { App } from "./app";

// Toolbar-style buttons must not keep keyboard focus after a mouse click,
// otherwise Enter (OK) / Space would re-trigger the last clicked command.
document.addEventListener("mousedown", (e) => {
  const b = (e.target as HTMLElement).closest?.(".rb-btn, .icon-btn, .tg, .rb-tab, .picker, .wc-card, .mk-item");
  if (b) e.preventDefault();
});

const app = new App();
try {
  app.mount(document.getElementById("app")!);
} catch (e) {
  // most likely WebGL is unavailable (GPU disabled / unsupported driver)
  document.getElementById("app")!.innerHTML = `<div class="fatal"><h1>3D 表示を開始できませんでした</h1>
    <p>このコンピュータでは WebGL (3D グラフィックス) を利用できません。グラフィックス ドライバを更新するか、
    ハードウェア アクセラレーションが有効か確認してください。</p><pre>${String((e as Error)?.message ?? e).replace(/</g, "&lt;")}</pre></div>`;
  throw e;
}
// handy for debugging / automation
(window as unknown as { cad: App }).cad = app;

// Desktop app: files opened from the OS (double-click a .3dcp / .3dca, "open with")
interface DesktopBridge {
  platform: string;
  onOpenFile(cb: (f: { name: string; data: string }) => void): void;
}
const desktop = (window as unknown as { desktop?: DesktopBridge }).desktop;
if (desktop) {
  document.documentElement.classList.add("desktop", `os-${desktop.platform}`);
  desktop.onOpenFile(({ name, data }) => {
    const bytes = Uint8Array.from(atob(data), (c) => c.charCodeAt(0));
    void app.openOrImport(new File([bytes], name));
  });
}
