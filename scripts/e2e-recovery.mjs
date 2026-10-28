// End-to-end stability test: crash recovery, kernel restart and rollback.
//   npm run build && npm run e2e
// Set CHROMIUM_PATH to use a specific Chromium binary, E2E_PORT to change the preview port.
import { preview } from "vite";
import { chromium } from "playwright";

const port = Number(process.env.E2E_PORT || 4175);
const server = await preview({ preview: { port, strictPort: true }, logLevel: "error" });
const url = `http://localhost:${port}/`;
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const context = await browser.newContext({ viewport: { width: 1400, height: 860 } });
const errors = [];
let failed = 0;
const check = (name, ok, extra = "") => {
  console.log(`${ok ? "✓" : "✗"} ${name} ${extra}`);
  if (!ok) failed++;
};
const open = async () => {
  const page = await context.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(url);
  await page.waitForFunction(() => window.cad);
  return page;
};
// the restarted worker rebuilds asynchronously: poll the kernel until it holds a solid again
const volumeWhenBuilt = async (page) => {
  for (let i = 0; i < 60; i++) {
    const v = await page.evaluate(() => window.cad.kernel.massProps().then((m) => m.volume).catch(() => 0));
    if (v > 0) return v;
    await page.waitForTimeout(500);
  }
  return 0;
};
const kernelReady = (page) => page.waitForFunction(() => window.cad.bodies.length > 0, null, { timeout: 60000 });

try {
  // 1. a fresh session: open the sample, make an unsaved change and let autosave run
  let page = await open();
  await page.evaluate(() => window.cad.loadSample());
  await kernelReady(page);
  await page.evaluate(() => window.cad.store.mutate("rename", (d) => (d.name = "復元テスト")));
  await page.waitForTimeout(1800);

  // 2. abnormal exit: crash the renderer (no pagehide, no clean shutdown)
  const cdp = await context.newCDPSession(page);
  cdp.send("Page.crash").catch(() => {});
  await page.waitForEvent("crash", { timeout: 10000 }).catch(() => {});
  await page.close().catch(() => {});

  // 3. restart: the recovery prompt appears and restores the change
  page = await open();
  const dlg = page.locator(".modal-back", { hasText: "作業内容の復元" });
  await dlg.waitFor({ timeout: 10000 });
  const text = await dlg.innerText();
  check("recovery prompt after crash", /正常に終了しませんでした/.test(text) && /復元テスト/.test(text), JSON.stringify(text.slice(0, 120)));
  await dlg.getByRole("button", { name: "復元", exact: true }).click();
  const st = await page.evaluate(() => ({ name: window.cad.store.doc.name, dirty: window.cad.store.dirty, n: window.cad.store.doc.features.length }));
  check("recovery restores the change", st.name === "復元テスト" && st.dirty && st.n > 0, JSON.stringify(st));
  await kernelReady(page);

  // 4. kernel watchdog: a hung rebuild restarts the worker and rolls back to the last good model
  const vol0 = (await page.evaluate(() => window.cad.kernel.massProps())).volume;
  await page.evaluate(() => {
    window.cad.kernel.rebuildTimeoutMs = 1;
    window.cad.store.mutate("rename", (d) => (d.name = "壊れる変更"));
  });
  await page.waitForTimeout(300);
  await page.evaluate(() => (window.cad.kernel.rebuildTimeoutMs = 180000));
  await page.waitForFunction(() => window.cad.store.doc.name === "復元テスト" && window.cad.kernel.restarts > 0, null, { timeout: 30000 });
  const vol1 = await volumeWhenBuilt(page);
  check("kernel timeout: restart + rollback", Math.abs(vol1 - vol0) < 1e-6 * Math.max(1, vol0), `volume ${vol0.toFixed(1)} -> ${vol1.toFixed(1)}`);

  // 5. worker crash: restarted transparently and the model rebuilt from the document
  const r0 = await page.evaluate(() => window.cad.kernel.restarts);
  await page.evaluate(() => window.cad.kernel.simulateCrash());
  await page.waitForFunction((r) => window.cad.kernel.restarts > r, r0);
  const vol2 = await volumeWhenBuilt(page);
  check("worker crash: transparent restart", Math.abs(vol2 - vol0) < 1e-6 * Math.max(1, vol0), `volume ${vol2.toFixed(1)}`);

  // 6. operation log records commands and errors
  const log = await page.evaluate(() => window.cad.opLog.format());
  check("operation log", /kernel-restart/.test(log) && /rebuild/.test(log) && /session-start/.test(log), `${log.split("\n").length} lines`);

  // 7. a clean exit with everything saved continues silently (no prompt)
  await page.evaluate(() => (window.cad.store.dirty = false));
  await page.evaluate(() => window.cad.store.mutate("rename", (d) => (d.name = "保存済み")));
  await page.evaluate(() => (window.cad.store.dirty = false));
  await page.waitForTimeout(1500);
  await page.reload();
  await page.waitForFunction(() => window.cad && window.cad.store.doc.name === "保存済み", null, { timeout: 10000 });
  const prompt = await page.locator(".modal-back", { hasText: "作業内容の復元" }).count();
  check("clean exit: no prompt", prompt === 0);
} catch (e) {
  check("run", false, e.message);
} finally {
  check("no page errors", errors.length === 0, errors.join("; "));
  await browser.close();
  await server.close();
}
process.exit(failed ? 1 : 0);
