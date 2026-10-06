import "./styles.css";
import { App } from "./app";

// Toolbar-style buttons must not keep keyboard focus after a mouse click,
// otherwise Enter (OK) / Space would re-trigger the last clicked command.
document.addEventListener("mousedown", (e) => {
  const b = (e.target as HTMLElement).closest?.(".rb-btn, .icon-btn, .tg, .rb-tab, .picker, .wc-card, .mk-item");
  if (b) e.preventDefault();
});

const app = new App();
app.mount(document.getElementById("app")!);
// handy for debugging / automation
(window as unknown as { cad: App }).cad = app;
