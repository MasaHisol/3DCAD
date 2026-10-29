// End-to-end: viewer core (stage 2, engines #4 / #5 and 断面の強化).
//  1. WebGL session (no WebGPU in the browser): the "auto" backend falls back
//     to WebGL; GPU ID-buffer picking agrees with the BVH ray test; X-ray uses
//     weighted blended OIT; three section planes with filled hatched caps; the
//     section sweep moves the plane; the exact section outlines go to DXF.
//  2. WebGPU session (SwiftShader's WebGPU adapter): the WebGPU renderer is
//     used, the same model renders without errors, caps and transparency
//     (sorted fallback) and picking (BVH fallback) work.
//   npm run build && node scripts/e2e-view.mjs
import { preview } from "vite";
import { chromium } from "playwright";

const port = Number(process.env.E2E_PORT || 4174);
// SwiftShader WebGPU through Vulkan without a presentation surface: the default
// headless WebGPU path loses its device as soon as a canvas is presented.
const WEBGPU_FLAGS = ["--enable-unsafe-webgpu", "--enable-features=Vulkan", "--use-vulkan=swiftshader", "--use-webgpu-adapter=swiftshader", "--disable-vulkan-surface"];
const server = await preview({ preview: { port, strictPort: true }, logLevel: "error" });
let failed = 0;
const check = (name, ok, extra = "") => {
  console.log(`${ok ? "✓" : "✗"} ${name} ${extra}`);
  if (!ok) failed++;
};

async function session(webgpu) {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", ...(webgpu ? WEBGPU_FLAGS : [])],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 820 }, acceptDownloads: true });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const consoleErrors = [];
  page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));
  try {
    await page.goto(`http://localhost:${port}/?renderer=auto`);
    await page.evaluate(async () => {
      localStorage.clear();
      await new Promise((r) => {
        const q = indexedDB.deleteDatabase("3dcad");
        q.onsuccess = q.onerror = q.onblocked = () => r();
      });
    });
    await page.reload();
    await page.waitForFunction(() => window.cad && window.cad.kernelReady);
    const backend = await page.evaluate(async () => await window.cad.vp.backendReady);
    const tag = webgpu ? "[webgpu]" : "[webgl]";
    if (webgpu) {
      if (backend.kind !== "webgpu") {
        console.log(`- ${tag} WebGPU unavailable in this browser (${backend.reason}): WebGPU checks skipped, fallback verified`);
        check(`${tag} automatic fallback to WebGL`, backend.kind === "webgl");
        return;
      }
      check(`${tag} WebGPU renderer selected`, backend.kind === "webgpu", backend.adapter ?? "");
    } else check(`${tag} auto backend falls back to WebGL without WebGPU`, backend.kind === "webgl" && /自動切替/.test(backend.reason), backend.reason);
    await page.mouse.click(5, 5);
    await page.evaluate(() => window.cad.loadSample());
    await page.waitForFunction(() => window.cad.vp.bodies.length > 0, null, { timeout: 60000 });
    await page.evaluate(async () => {
      const vp = window.cad.vp;
      vp.setStandardView([1, 1, 1], false);
      vp.fitAll(false);
      vp.invalidate();
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    });
    // canvas pixels (WebGL canvas keeps its buffer; WebGPU: screenshot)
    const shot = async () => page.locator(".vp-canvas").screenshot();
    const diff = (a, b) => {
      // PNG bytes differ when the image differs: count differing bytes as a rough measure
      let n = 0;
      const m = Math.min(a.length, b.length);
      for (let i = 0; i < m; i++) if (a[i] !== b[i]) n++;
      return n + Math.abs(a.length - b.length);
    };

    // -------------------------------------------------------------- picking
    const pick = await page.evaluate(async () => {
      const vp = window.cad.vp;
      const r = vp.renderer.domElement.getBoundingClientRect();
      const pts = [];
      // screen positions of face centres of the first body
      const d = vp.bodies[0].data;
      for (let f = 0; f < d.faces.length && pts.length < 12; f += Math.max(1, Math.floor(d.faces.length / 12))) {
        const s = d.faceRanges[f * 2];
        const i = d.indices[s] * 3, j = d.indices[s + 1] * 3, k = d.indices[s + 2] * 3;
        const P = d.positions;
        const c = [(P[i] + P[j] + P[k]) / 3, (P[i + 1] + P[j + 1] + P[k + 1]) / 3, (P[i + 2] + P[j + 2] + P[k + 2]) / 3];
        pts.push(vp.worldToScreen(c));
      }
      const ev = (p) => ({ clientX: p.x, clientY: p.y });
      const run = (gpu) => {
        vp.gpuPicking = gpu;
        return pts.map((p) => {
          const h = vp.pick(ev(p), new Set(["face"]));
          return h ? `${h.body}:${h.index}` : "-";
        });
      };
      const before = { ...vp.pickStats };
      const g = run(true);
      const after = { ...vp.pickStats };
      const b = run(false);
      vp.gpuPicking = true;
      const bg = vp.pick({ clientX: r.left + 3, clientY: r.top + 3 }, new Set(["face"]));
      return { g, b, gpuUsed: after.gpu - before.gpu, bg: bg === null };
    });
    const same = pick.g.filter((x, i) => x === pick.b[i]).length;
    check(`${tag} picking: GPU ID buffer and BVH agree`, same >= pick.g.length - 1 && pick.g.some((x) => x !== "-"), `${same}/${pick.g.length}`);
    if (webgpu) check(`${tag} picking falls back to the BVH (no sync readback)`, pick.gpuUsed === 0);
    else check(`${tag} picking used the GPU ID buffer`, pick.gpuUsed > 0, `${pick.gpuUsed} picks`);
    check(`${tag} background pick is empty`, pick.bg);

    // --------------------------------------------------------- transparency
    const opaque = await shot();
    const tr = await page.evaluate(async () => {
      const vp = window.cad.vp;
      vp.setXRay(true, 0.3);
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      return { mode: vp.transparencyMode, calls: vp.stats().calls };
    });
    const xray = await shot();
    check(`${tag} X-ray transparency mode`, tr.mode === (webgpu ? "sorted" : "oit"), tr.mode);
    check(`${tag} X-ray changes the image`, diff(opaque, xray) > 1000);
    const trPick = await page.evaluate(() => {
      const vp = window.cad.vp;
      const r = vp.renderer.domElement.getBoundingClientRect();
      const c = vp.worldToScreen(vp.bodies[0].mesh.geometry.boundingSphere.center.toArray());
      return !!vp.pick({ clientX: c.x, clientY: c.y });
    });
    check(`${tag} picking through X-ray`, trPick);
    await page.evaluate(() => window.cad.vp.setXRay(false));

    // -------------------------------------------------- 3-plane section + caps
    await page.evaluate(() => window.cad.toggleSectionView());
    await page.waitForSelector("[data-testid=section-panel]");
    for (const a of ["X", "Y"]) await page.locator(`[data-testid=section-panel] input[data-axis=${a}]`).check();
    await page.waitForTimeout(200);
    const sec = await page.evaluate(async () => {
      const vp = window.cad.vp;
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      return { planes: vp.clipPlanes.length, caps: { ...vp.caps.stats }, back: vp.bodies[0].back.visible };
    });
    check(`${tag} three section planes active`, sec.planes === 3, JSON.stringify(sec.caps));
    check(`${tag} stencil caps built for the planes`, sec.caps.planes === 3 && sec.caps.groups >= 3 && sec.caps.stencilMeshes > 0);
    const capped = await shot();
    await page.locator("[data-testid=section-panel] .sec-opts input").first().uncheck();
    await page.waitForTimeout(150);
    const uncapped = await shot();
    check(`${tag} caps fill the cut faces (image differs without caps)`, diff(capped, uncapped) > 500);
    await page.locator("[data-testid=section-panel] .sec-opts input").first().check();

    // sweep animation moves the X plane
    const x0 = await page.evaluate(() => window.cad.sectionView.state.planes[0].value);
    await page.locator("[data-testid=section-panel] .sec-row").first().locator("button").last().click();
    await page.waitForTimeout(700);
    const x1 = await page.evaluate(() => window.cad.sectionView.state.planes[0].value);
    await page.locator("[data-testid=section-panel] .sec-row").first().locator("button").last().click();
    check(`${tag} section sweep animates the plane`, Math.abs(x1 - x0) > 1e-3, `${x0.toFixed(2)} → ${x1.toFixed(2)}`);

    // DXF output of the exact section outlines
    const dl = page.waitForEvent("download", { timeout: 60000 });
    const dxf = await page.evaluate(async () => {
      const d = await window.cad.sectionView.exportDxf();
      const r = window.cad.sectionView.lastExport.results;
      return { d, n: r.map((x) => x.entities.length), area: r.map((x) => x.area), len: r.map((x) => x.length) };
    });
    const file = await dl;
    const { readFileSync } = await import("node:fs");
    const saved = readFileSync(await file.path());
    check(`${tag} DXF downloaded`, saved.length > 1000 && saved.includes("ENTITIES"), `${saved.length} bytes`);
    check(`${tag} DXF has outlines of all three sections`, dxf.d && dxf.n.length === 3 && dxf.n.every((k) => k > 0) && /X = /.test(dxf.d) && /Y = /.test(dxf.d) && /Z = /.test(dxf.d), `entities ${dxf.n.join("/")}`);
    check(`${tag} DXF hatch on HATCH layer, outline on VISIBLE`, /\r\n8\r\nHATCH\r\n/.test(dxf.d) && /\r\n8\r\nVISIBLE\r\n/.test(dxf.d));
    check(`${tag} section areas positive`, dxf.area.every((a) => a > 0), dxf.area.map((a) => a.toFixed(1)).join("/"));
    await page.evaluate(() => window.cad.toggleSectionView());
    const off = await page.evaluate(() => window.cad.vp.clipPlanes.length);
    check(`${tag} section view closes`, off === 0);
    const still = await page.evaluate(() => window.cad.vp.backend);
    if (webgpu) check(`${tag} still on WebGPU at the end`, still.kind === "webgpu", still.reason);
    check(`${tag} no page errors`, errors.length === 0, errors.slice(0, 3).join(" | "));
    if (consoleErrors.length) console.log(`  console errors (${consoleErrors.length}):`, consoleErrors.slice(0, 5).join("\n   "));
  } finally {
    await browser.close();
  }
}

try {
  await session(false);
  await session(true);
} finally {
  await server.close();
}
console.log(failed ? `\n${failed} check(s) failed` : "\nall view checks passed");
process.exit(failed ? 1 : 0);
