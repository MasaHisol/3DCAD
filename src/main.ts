import "./styles.css";
import { App } from "./app";

const app = new App();
app.mount(document.getElementById("app")!);
// handy for debugging / automation
(window as unknown as { cad: App }).cad = app;
