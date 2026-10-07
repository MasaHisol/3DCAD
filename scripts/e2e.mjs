// End-to-end smoke test: drives the built app in Chromium like a user.
//   npm run build && npm run e2e
// Set CHROMIUM_PATH to use a specific Chromium binary.
import { preview } from "vite";
import { chromium } from "playwright";

const server = await preview({ preview: { port: 4174, strictPort: true }, logLevel: "error" });
const url = "http://localhost:4174/";
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
  await page.waitForFunction(() => !document.querySelector(".busy.show"));
  await page.waitForTimeout(500);
};
const S = (u, v) => page.evaluate(([u, v]) => window.cad.sketchToScreen(u, v), [u, v]);
const clickUV = async (u, v) => {
  const p = await S(u, v);
  await page.mouse.click(p.x, p.y);
};

try {
  await page.goto(url);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForFunction(() => window.cad);
  await page.mouse.click(5, 5);

  // sketch -> rectangle with typed size -> extrude -> fillet
  await page.evaluate(() => window.cad.createSketch({ origin: [0, 0, 0], xDir: [1, 0, 0], normal: [0, 0, 1] }, "XY 平面"));
  await page.waitForTimeout(700);
  await page.keyboard.press("r");
  await clickUV(0, 0);
  const p = await S(20, 10);
  await page.mouse.move(p.x, p.y);
  await page.keyboard.type("40");
  await page.keyboard.press("Tab");
  await page.keyboard.type("25");
  await page.keyboard.press("Enter");
  await page.keyboard.press("Escape");
  await page.keyboard.press("Control+Enter");
  await settle();
  await page.keyboard.press("e");
  await settle();
  await page.locator(".prop-panel input.expr").first().fill("12");
  await page.waitForTimeout(500);
  await page.keyboard.press("Enter");
  await settle();
  const v = (await page.evaluate(() => window.cad.kernel.massProps())).volume;
  check("sketch + extrude", Math.abs(v - 40 * 25 * 12) < 1e-3, `volume=${v.toFixed(2)}`);

  // sample part rebuilds without feature errors and follows a parameter change
  await page.evaluate(() => window.cad.loadSample());
  await settle();
  check("sample part", (await page.evaluate(() => Object.keys(window.cad.featureErrors).length)) === 0);
  await page.evaluate(() => window.cad.store.mutate("p", (d) => (d.params.find((x) => x.name === "幅").expr = "110")));
  await settle();
  const bb = (await page.evaluate(() => window.cad.kernel.massProps())).bbox;
  check("parameter drives model", Math.abs(bb[1][0] - bb[0][0] - 110) < 1e-6 && (await page.evaluate(() => Object.keys(window.cad.featureErrors).length)) === 0);

  // 2D drawing of the part: standard views, automatic dimensions, DXF/SVG output
  await page.evaluate(() => window.cad.openDrawingEnv());
  await page.waitForFunction(() => window.cad.env === "drawing" && document.querySelectorAll(".dw-stage .dview").length >= 4, null, { timeout: 60000 });
  await settle();
  const dw = await page.evaluate(() => ({
    views: document.querySelectorAll(".dw-stage .dview").length,
    lines: [...document.querySelectorAll(".dw-stage .visible-lines")].reduce((n, e) => n + (e.getAttribute("d") || "").length, 0),
    dims: window.cad.store.doc.drawing.sheets[0].annos.filter((a) => a.type === "dim").length,
  }));
  check("part drawing", dw.views >= 4 && dw.lines > 200 && dw.dims > 0, JSON.stringify(dw));
  if (process.env.E2E_SHOTS) await page.screenshot({ path: `${process.env.E2E_SHOTS}/drawing.png` });
  await page.keyboard.press("Control+z");
  await page.keyboard.press("Control+y");
  await page.evaluate(() => window.cad.leaveDrawingEnv());
  await settle();
  check("back to model", (await page.evaluate(() => window.cad.env)) === "part");

  // sample assembly: insert constraint seats the pin
  await page.evaluate(() => window.cad.loadSampleAssembly());
  await page.waitForFunction(() => window.cad.asm.bodyMap.length >= 3, null, { timeout: 60000 });
  await settle();
  const pin = await page.evaluate(() => window.cad.asm.doc.components.find((c) => c.id === "c2").matrix.slice(12, 15));
  check("assembly insert constraint", Math.abs(pin[0]) < 1e-6 && Math.abs(pin[1] - 35) < 1e-6 && Math.abs(pin[2]) < 1e-6, JSON.stringify(pin));
  const hits = await page.evaluate(() => window.cad.kernel.interference(window.cad.asm.placements()));
  check("no interference", hits.length === 0);
  await page.evaluate(() => window.cad.openDrawingEnv());
  await page.waitForFunction(() => window.cad.env === "drawing" && document.querySelectorAll(".dw-stage .dview").length >= 4, null, { timeout: 60000 });
  await settle();
  check("assembly drawing + parts list", (await page.evaluate(() => document.querySelectorAll(".dw-stage .partslist").length)) === 1);
  if (process.env.E2E_SHOTS) await page.screenshot({ path: `${process.env.E2E_SHOTS}/asm-drawing.png` });
} catch (e) {
  check("run", false, e.message);
} finally {
  check("no page errors", errors.length === 0, errors.join("; "));
  await browser.close();
  await server.close();
}
process.exit(failed ? 1 : 0);
