// Start-up time of the built app, normal (editing) mode vs viewer-only mode:
// the time from navigation to the first rendered model when the app is launched with a
// STEP file (what a double-click does), plus the JavaScript fetched until then.
//   npm run build && npm run bench:startup
// CHROMIUM_PATH: Chromium binary, E2E_PORT: preview port (default 4177), RUNS (default 5),
// FILE: fixture in tests/fixtures (default assembly-colors.step).
import { readFileSync } from "node:fs";
import { preview } from "vite";
import { chromium } from "playwright";

const port = +(process.env.E2E_PORT || 4177);
const runs = +(process.env.RUNS || 5);
const fileName = process.env.FILE || "assembly-colors.step";
const b64 = readFileSync(new URL(`../tests/fixtures/${fileName}`, import.meta.url)).toString("base64");
const server = await preview({ preview: { port, strictPort: true }, logLevel: "error" });
const url = `http://localhost:${port}/`;
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});

/** One cold start (fresh browser context: no HTTP / code cache). */
async function start(viewer) {
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 860 } });
  const page = await ctx.newPage();
  await page.goto(url + (viewer ? "?viewer=1" : ""));
  await page.waitForFunction(() => window.cad);
  const appReady = await page.evaluate(() => performance.now());
  // the file arrives right after start-up, as from the OS (desktop: open-file IPC)
  const t = await page.evaluate(async ([b64, name, viewer]) => {
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const f = new File([bytes], name);
    const cad = window.cad;
    if (viewer) await cad.viewer.open(f);
    else await cad.openOrImport(f);
    await new Promise((res) => {
      const poll = () => (cad.bodies.length > 0 && !document.querySelector(".busy.show") ? requestAnimationFrame(() => requestAnimationFrame(res)) : setTimeout(poll, 10));
      poll();
    });
    const js = performance.getEntriesByType("resource").filter((r) => /\.js(\?|$)/.test(r.name));
    return { model: performance.now(), jsFiles: js.length, jsKB: Math.round(js.reduce((s, r) => s + (r.encodedBodySize || r.transferSize || 0), 0) / 1024) };
  }, [b64, fileName, viewer]);
  await ctx.close();
  return { appReady, ...t };
}

const median = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];
const results = { normal: [], viewer: [] };
try {
  await start(false); // warm the server / OS file cache
  for (let i = 0; i < runs; i++) for (const mode of ["normal", "viewer"]) results[mode].push(await start(mode === "viewer"));
} finally {
  await browser.close();
  await server.close();
}
console.log(`start-up with ${fileName}, ${runs} cold runs each (median):`);
for (const [mode, rs] of Object.entries(results)) {
  console.log(
    `  ${mode.padEnd(6)}  app ready ${median(rs.map((r) => r.appReady)).toFixed(0).padStart(5)} ms   first rendered model ${median(rs.map((r) => r.model)).toFixed(0).padStart(5)} ms   JS ${median(rs.map((r) => r.jsFiles))} files / ${median(rs.map((r) => r.jsKB))} KB`,
  );
}
const n = median(results.normal.map((r) => r.model)), v = median(results.viewer.map((r) => r.model));
console.log(`  viewer vs normal: ${(((v - n) / n) * 100).toFixed(1)} % time to first model`);
