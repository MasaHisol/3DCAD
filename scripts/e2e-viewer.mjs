// End-to-end check of the viewer-only mode and the help:
// opens the app with ?viewer=1 (the path a double-clicked STEP takes in the desktop app),
// opens a STEP, checks that the editing UI is hidden, measures, opens the help with F1 and
// the tooltip link, switches to the editing mode, and opens a large assembly lightweight.
//   npm run build && npm run e2e:viewer
// CHROMIUM_PATH: Chromium binary, E2E_PORT: preview port (default 4176).
import { readFileSync } from "node:fs";
import { preview } from "vite";
import { chromium } from "playwright";

const port = +(process.env.E2E_PORT || 4176);
const server = await preview({ preview: { port, strictPort: true }, logLevel: "error" });
const url = `http://localhost:${port}/`;
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const page = await browser.newPage({ viewport: { width: 1400, height: 860 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
let failed = 0;
const check = (name, ok, extra = "") => {
  console.log(`${ok ? "✓" : "✗"} ${name} ${extra}`);
  if (!ok) failed++;
};
const settle = async () => {
  await page.waitForTimeout(300);
  await page.waitForFunction(() => !document.querySelector(".busy.show"), null, { timeout: 120000 });
  await page.waitForTimeout(400);
};
const visible = (sel) => page.evaluate((sel) => [...document.querySelectorAll(sel)].some((e) => e.getClientRects().length > 0 && getComputedStyle(e).visibility !== "hidden"), sel);
const fixture = (name) => readFileSync(new URL(`../tests/fixtures/${name}`, import.meta.url)).toString("base64");

try {
  await page.goto(url);
  await page.evaluate(() => localStorage.clear());
  await page.goto(url + "?viewer=1");
  await page.waitForFunction(() => window.cad);

  // ---------------------------------------------------------------- viewer UI ---
  const ui = await page.evaluate(() => ({
    cls: document.documentElement.classList.contains("viewer-mode"),
    tabs: [...document.querySelectorAll(".rb-tab:not(.file)")].map((t) => t.textContent),
    welcome: !!document.querySelector(".welcome"),
  }));
  check("?viewer=1 starts the viewer mode", ui.cls && ui.tabs.join() === "閲覧", JSON.stringify(ui));
  check("no welcome / recovery card in the viewer mode", !ui.welcome);
  check("editing UI hidden (timeline, sketch / extrude, save, material)", !(await visible(".timeline")) && !(await visible('[data-cmd="sketch"]')) && !(await visible('[data-cmd="extrude"]')) && !(await visible(".qat-select")) && !(await visible('[title^="保存"]')));
  const viewerCmds = await page.evaluate(() => [...document.querySelectorAll(".rb-btn")].map((b) => b.dataset.cmd));
  check("viewer tab: open, views, styles, measure, section, properties, print, edit mode", ["vw-open", "home", "fit", "st-se", "measure", "section", "iprops", "vw-print", "shot", "vw-edit"].every((c) => viewerCmds.includes(c)), viewerCmds.join(","));
  check("「編集モードで開く」 button in the title bar", await visible(".tb-edit-mode"));
  check("editing modules not loaded in the viewer mode", await page.evaluate(() => !performance.getEntriesByType("resource").some((r) => /sketchEditor/.test(r.name))));

  // ---------------------------------------------------------------- open a STEP ---
  await page.evaluate(async (b64) => {
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    await window.cad.viewer.open(new File([bytes], "assembly-colors.step"));
  }, fixture("assembly-colors.step"));
  await page.waitForFunction(() => window.cad.bodies.length > 0, null, { timeout: 120000 });
  await settle();
  const opened = await page.evaluate(() => ({ bodies: window.cad.bodies.length, dirty: window.cad.store.dirty, title: document.querySelector(".doc-title")?.textContent }));
  check("STEP opens in the viewer (not dirty)", opened.bodies === 3 && !opened.dirty, JSON.stringify(opened));
  check("still in the viewer mode after opening", await page.evaluate(() => document.documentElement.classList.contains("viewer-mode")));
  check("editing shortcut E is ignored", await page.evaluate(() => (window.dispatchEvent(new KeyboardEvent("keydown", { key: "e" })), !window.cad.command)));

  // ---------------------------------------------------------------- measure ---
  await page.click('[data-cmd="measure"]');
  await page.waitForTimeout(300);
  check("measure from the viewer tab", (await page.evaluate(() => window.cad.command?.id)) === "measure");
  const pt = await page.evaluate(() => {
    const cad = window.cad;
    cad.vp.setStandardView([0, 0, 1], false);
    cad.vp.fitAll(false);
    const bi = cad.bodies.findIndex((b) => b.name === "プレート:1");
    const f = cad.bodies[bi].faces.find((x) => x.type === "PLANE" && x.normal[2] > 0.99 && x.center[2] >= cad.bodies[bi].bbox[1][2] - 1e-6);
    return cad.vp.worldToScreen(f.center);
  });
  await page.mouse.move(pt.x, pt.y);
  await page.waitForTimeout(150);
  await page.mouse.click(pt.x, pt.y);
  await page.waitForFunction(() => /面積/.test(document.querySelector(".measure-out")?.textContent ?? ""), null, { timeout: 30000 }).catch(() => {});
  const mtext = await page.evaluate(() => document.querySelector(".measure-out")?.textContent ?? "");
  check("measure: clicked face shows its area", /面積\s*[\d.,]+\s*mm²/.test(mtext), JSON.stringify(mtext.slice(0, 120)));
  const dist = await page.evaluate(async () => {
    const cad = window.cad;
    const bi = cad.bodies.findIndex((b) => b.name === "プレート:1");
    const faces = cad.bodies[bi].faces;
    const a = faces.findIndex((f) => f.type === "PLANE" && f.normal[0] < -0.99);
    const b = faces.findIndex((f) => f.type === "PLANE" && f.normal[0] > 0.99);
    return (await cad.kernel.measure({ body: bi, kind: "face", index: a }, { body: bi, kind: "face", index: b })).distance;
  });
  check("measure: plate length 40 mm", Math.abs(dist - 40) < 1e-6, `${dist} mm`);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(200);

  // ---------------------------------------------------------------- help ---
  await page.hover('[data-cmd="section"]');
  await page.keyboard.press("F1");
  await page.waitForSelector(".help-back", { timeout: 10000 });
  const help1 = await page.evaluate(() => ({ h1: document.querySelector(".help-page h1")?.textContent, steps: document.querySelectorAll(".help-steps li").length, fig: !!document.querySelector(".help-fig svg") }));
  check("F1 on a hovered button opens its help page", help1.h1?.includes("断面図") && help1.steps > 0 && help1.fig, JSON.stringify(help1));
  await page.fill(".help-search", "測定");
  await page.waitForTimeout(100);
  const found = await page.evaluate(() => [...document.querySelectorAll(".help-item")].map((e) => e.textContent));
  check("help index search", found[0] === "測定", found.slice(0, 5).join(","));
  await page.keyboard.press("Escape");
  check("Esc closes the help", !(await visible(".help-back")));
  await page.mouse.move(700, 600);
  await page.hover('[data-cmd="measure"]');
  await page.waitForSelector(".rb-tip.show .rb-tip-help", { timeout: 5000 });
  await page.click(".rb-tip.show .rb-tip-help");
  await page.waitForSelector(".help-back", { timeout: 10000 });
  check("tooltip 「ヘルプ」 link opens the command's page", (await page.evaluate(() => document.querySelector(".help-page h1")?.textContent ?? "")).includes("測定"));
  await page.keyboard.press("Escape");

  // ---------------------------------------------------------------- edit mode ---
  await page.mouse.move(700, 600);
  await page.click(".tb-edit-mode");
  await page.waitForTimeout(500);
  const edit = await page.evaluate(() => ({
    cls: document.documentElement.classList.contains("viewer-mode"),
    tabs: [...document.querySelectorAll(".rb-tab:not(.file)")].map((t) => t.textContent),
    bodies: window.cad.bodies.length,
  }));
  check("「編集モードで開く」 switches to the full editing UI", !edit.cls && edit.tabs.includes("3D モデル") && edit.tabs.includes("スケッチ") === false && edit.tabs.includes("管理"), JSON.stringify(edit));
  check("model kept and editing UI shown", edit.bodies === 3 && (await visible('[data-cmd="extrude"]')) && (await visible(".timeline")));
  await page.waitForFunction(() => performance.getEntriesByType("resource").some((r) => /sketchEditor/.test(r.name)), null, { timeout: 15000 }).then(
    () => check("editing modules loaded after leaving the viewer mode", true),
    () => check("editing modules loaded after leaving the viewer mode", false),
  );
  await page.evaluate(() => window.cad.commands.run("sketch"));
  await page.waitForTimeout(300);
  check("editing commands work (2D スケッチ starts)", (await page.evaluate(() => window.cad.command?.id)) === "sketch");
  await page.keyboard.press("Escape");
  await page.mouse.move(700, 600);
  await page.keyboard.press("F1");
  await page.waitForSelector(".help-back", { timeout: 10000 });
  check("F1 without a hovered command opens the help index", (await page.evaluate(() => document.querySelectorAll(".help-item").length)) > 150);
  await page.keyboard.press("Escape");

  // ---------------------------------------------------------------- menu toggle + large assembly ---
  await page.evaluate(() => (window.cad.store.dirty = false));
  await page.keyboard.press("Control+Shift+V");
  await page.waitForTimeout(300);
  check("Ctrl+Shift+V toggles the viewer mode", await page.evaluate(() => document.documentElement.classList.contains("viewer-mode")));
  const asmJson = await page.evaluate(async () => {
    const cad = window.cad;
    cad.loadSampleAssembly();
    const d = structuredClone(cad.asm.store.doc);
    // a few dozen instances: below the automatic lightweight threshold
    return JSON.stringify(d);
  });
  await page.evaluate(async (j) => window.cad.viewer.open(new File([j], "sample.3dca")), asmJson);
  await settle();
  check("assemblies open in lightweight display in the viewer mode", await page.evaluate(() => window.cad.env === "assembly" && window.cad.asm.lightOpen === true));
  check("assembly viewer commands enabled (BOM, explode)", await page.evaluate(() => ["asm-bom", "asm-explode"].every((c) => !document.querySelector(`[data-cmd="${c}"]`)?.disabled)));

  check("no page errors", errors.length === 0, errors.join(" | "));
} catch (e) {
  console.error(e);
  failed++;
} finally {
  await browser.close();
  await server.close();
}
console.log(failed ? `${failed} check(s) failed` : "all viewer / help checks passed");
process.exit(failed ? 1 : 0);
