// Display performance benchmark for large assemblies (段階 1 表示性能).
//   npm run build && node scripts/bench-view.mjs [--brackets=N] [--pins=N] [--json=out.json]
// Generates an assembly of many instances of the sample bracket / pin (several
// distinct part variants so the kernel builds more than one body), opens it
// and measures: open time (cold and warm), orbit frame rate, draw calls,
// triangles and pick latency. Set CHROMIUM_PATH for a specific Chromium and
// BENCH_PORT to change the preview port.
import { writeFileSync } from "node:fs";
import { preview } from "vite";
import { chromium } from "playwright";

const arg = (n, d) => {
  const a = process.argv.find((x) => x.startsWith(`--${n}=`));
  return a ? a.split("=")[1] : d;
};
const BRACKETS = +arg("brackets", 200), PINS = +arg("pins", 1000), VARIANTS = +arg("variants", 8), FRAMES = +arg("frames", 20);
const port = +(process.env.BENCH_PORT || 4180);
const server = await preview({ preview: { port, strictPort: true }, logLevel: "error" });
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
});
const page = await browser.newPage({ viewport: { width: 1400, height: 860 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));

try {
  await page.goto(`http://localhost:${port}/`);
  await page.evaluate(async () => {
    localStorage.clear();
    await new Promise((r) => {
      const q = indexedDB.deleteDatabase("3dcad");
      q.onsuccess = q.onerror = q.onblocked = () => r();
    });
  });
  await page.reload();
  await page.waitForFunction(() => window.cad);
  await page.mouse.click(5, 5);
  await page.evaluate(() => window.cad.loadSampleAssembly());
  await page.waitForFunction(() => window.cad.asm.bodyMap.length >= 3, null, { timeout: 60000 });

  // build the large document from the sample's parts
  await page.evaluate(
    ([B, P, V]) => {
      const s = structuredClone(window.cad.asm.doc);
      const bracket = s.parts.find((p) => p.id === "p-bracket"), pin = s.parts.find((p) => p.id === "p-pin");
      const parts = [], components = [];
      for (let k = 0; k < V; k++)
        for (const [base, tag] of [[bracket, "b"], [pin, "p"]]) {
          const doc = structuredClone(base.doc);
          doc.params = [...(doc.params ?? []), { name: `bench_${tag}${k}`, expr: String(k + 1) }];
          parts.push({ id: `${tag}${k}`, name: `${base.name}-${k}`, kind: "part", doc });
        }
      const place = (n, tag, spacing, z0) => {
        const side = Math.ceil(Math.sqrt(n));
        for (let i = 0; i < n; i++) {
          const x = (i % side) * spacing, y = Math.floor(i / side) * spacing;
          const a = (i * 0.37) % (2 * Math.PI), c = Math.cos(a), sn = Math.sin(a);
          components.push({ id: `${tag}c${i}`, name: `${tag}:${i}`, partId: `${tag}${i % V}`, matrix: [c, sn, 0, 0, -sn, c, 0, 0, 0, 0, 1, 0, x, y, z0, 1], grounded: true });
        }
      };
      place(B, "b", 220, 0);
      place(P, "p", 70, 200);
      window.__benchDoc = { ...s, name: "bench", parts, components, constraints: [], patterns: [] };
    },
    [BRACKETS, PINS, VARIANTS],
  );
  const N = BRACKETS + PINS;
  const benchDoc = await page.evaluate(() => window.__benchDoc);

  const open = async () => {
    // leave the assembly so the open is a full load
    await page.evaluate(() => window.cad.newPart?.() ?? null).catch(() => {});
    await page.waitForTimeout(300);
    return page.evaluate(async (n) => {
      const t0 = performance.now();
      window.cad.loadAssembly(structuredClone(window.__benchDoc), "bench.3dca");
      const frame = () => new Promise((r) => requestAnimationFrame(() => r()));
      for (;;) {
        await frame();
        const a = window.cad.asm;
        if (a.bodyMap.length >= n && !a.loading) break;
        if (performance.now() - t0 > 600000) throw new Error("open timeout");
      }
      window.cad.vp.fitAll(false);
      window.cad.vp.invalidate();
      await frame();
      await frame();
      return performance.now() - t0;
    }, N);
  };
  const coldMs = await open();
  await page.waitForTimeout(1500);
  const warmMs = await open();
  await page.waitForTimeout(1000);
  // new session (page reload): only persistent caches help
  await page.reload();
  await page.waitForFunction(() => window.cad);
  await page.evaluate((d) => (window.__benchDoc = d), benchDoc);
  const reloadMs = await open();
  await page.waitForTimeout(1000);

  const m = await page.evaluate(async (FRAMES) => {
    const vp = window.cad.vp;
    const frame = () => new Promise((r) => requestAnimationFrame(() => r()));
    vp.fitAll(false);
    vp.invalidate();
    await frame();
    await frame();
    const st = vp.stats();
    // orbit: one step per animation frame
    const pivot = vp.modelBounds().getCenter(new (vp.view.target.constructor)());
    const frames = FRAMES;
    await frame();
    const gl = vp.renderer.getContext(), px = new Uint8Array(4);
    const t0 = performance.now();
    for (let i = 0; i < frames; i++) {
      vp.orbit(6, 2, pivot);
      await frame();
      // wait until the GPU has really drawn the frame (software GL queues work asynchronously)
      gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
    }
    const fps = (frames * 1000) / (performance.now() - t0);
    const st2 = vp.stats();
    // pick latency at the screen positions of 40 bodies spread over the assembly
    const pts = [];
    for (let k = 0; k < 40; k++) {
      const b = vp.bodies[Math.floor((k * vp.bodies.length) / 40)];
      const c = b.mesh.geometry.boundingSphere.center.clone();
      if (b.matrix) c.applyMatrix4(b.matrix);
      const s = vp.toScreen(c);
      pts.push({ clientX: s.x, clientY: s.y });
    }
    // first pass is cold (acceleration structures are built lazily), the second warm
    const pass = () => {
      const t = performance.now();
      let n = 0;
      for (const p of pts) if (vp.pick(p)) n++;
      return { ms: (performance.now() - t) / pts.length, n };
    };
    const cold = pass(), warm = pass();
    return { fps, calls: st.calls, triangles: st.triangles, callsOrbit: st2.calls, trianglesOrbit: st2.triangles, geometries: st.geometries, pickMs: warm.ms, pickColdMs: cold.ms, pickHits: warm.n, picks: pts.length };
  }, FRAMES);
  const res = { instances: N, coldOpenMs: Math.round(coldMs), warmOpenMs: Math.round(warmMs), reloadOpenMs: Math.round(reloadMs), orbitFps: +m.fps.toFixed(2), drawCalls: m.calls, triangles: m.triangles, drawCallsOrbit: m.callsOrbit, trianglesOrbit: m.trianglesOrbit, gpuGeometries: m.geometries, pickMs: +m.pickMs.toFixed(2), pickColdMs: +m.pickColdMs.toFixed(2), pickHits: `${m.pickHits}/${m.picks}`, pageErrors: errors.length };
  console.table(res);
  const out = arg("json", "");
  if (out) writeFileSync(out, JSON.stringify(res, null, 2));
} finally {
  await browser.close();
  await server.close();
}
