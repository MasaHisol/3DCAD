// End-to-end: assembly viewing (stage 2 "アセンブリの閲覧").
//  - BOM panel ⇄ 3D selection sync, isolate from the BOM
//  - save a view, change camera / visibility / transparency / colours /
//    explode / style, recall the view: the display state is restored
//  - interference check finds the deliberately overlapping pair, ignore list
//   npm run build && node scripts/e2e-asmview.mjs
import { preview } from "vite";
import { chromium } from "playwright";

const port = Number(process.env.E2E_PORT || 4174);
const server = await preview({ preview: { port, strictPort: true }, logLevel: "error" });
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
const state = () =>
  page.evaluate(() => {
    const v = window.cad.asm.viewing.displayState();
    return { ...v, hidden: [...v.hidden].sort(), transparent: [...v.transparent].sort(), anim: !!window.cad.vp.anim };
  });
const close = (a, b, t = 1e-3) => a.length === b.length && a.every((x, i) => Math.abs(x - b[i]) <= t * Math.max(1, Math.abs(x)));
const sameCam = (a, b) => {
  const s = a.quat.reduce((acc, v, i) => acc + v * b.quat[i], 0) < 0 ? -1 : 1;
  return close(a.target, b.target) && close(a.quat, b.quat.map((v) => v * s)) && close([a.height], [b.height]) && a.perspective === b.perspective;
};

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
  await page.waitForFunction(() => window.cad && window.cad.kernelReady);
  await page.mouse.click(5, 5);

  // sample assembly, with the free pin moved onto the inserted one (a known overlap)
  await page.evaluate(() => window.cad.loadSampleAssembly());
  await page.waitForFunction(() => window.cad.asm.bodyMap.length >= 3 && !window.cad.asm.loading, null, { timeout: 120000 });
  await page.evaluate(async () => {
    const a = window.cad.asm;
    await a.update();
    const c2 = a.doc.components.find((c) => c.id === "c2");
    const m = [...c2.matrix];
    m[12] += 3; // 3 mm beside the inserted pin: the two pins overlap
    a.store.mutate("e2e", (d) => (d.components.find((c) => c.id === "c3").matrix = m));
    await a.update();
  });

  // ---------------------------------------------------------- BOM ⇄ 3D
  await page.click('[data-tab="assemble"]').catch(() => {});
  const bomBtn = await page.$('[data-cmd="asm-bom"]');
  if (bomBtn) await bomBtn.click();
  else await page.evaluate(() => window.cad.asm.openBom());
  await page.waitForSelector("#bom-panel tr.bom-row");
  const rows = await page.$$eval("#bom-panel tr.bom-row", (trs) => trs.map((t) => [t.dataset.key, t.children[4].textContent]));
  check("BOM lists parts with quantities", JSON.stringify(rows) === JSON.stringify([["p-bracket", "1"], ["p-pin", "2"]]), JSON.stringify(rows));
  await page.click('#bom-panel tr.bom-row[data-key="p-pin"]');
  const sel = await page.evaluate(() => ({ sel: [...window.cad.asm.selected].sort(), hl: window.cad.vp.highlighted.size, pinBodies: window.cad.asm.bodyMap.filter((m) => m.comp !== "c1").length }));
  check("BOM row selects the components in 3D", JSON.stringify(sel.sel) === '["c2","c3"]' && sel.hl === sel.pinBodies && sel.hl > 0, JSON.stringify(sel));
  await page.evaluate(() => window.cad.asm.select(["c1"]));
  const rowSel = await page.$$eval("#bom-panel tr.bom-row.selected", (trs) => trs.map((t) => t.dataset.key));
  check("3D selection highlights the BOM row", JSON.stringify(rowSel) === '["p-bracket"]', JSON.stringify(rowSel));
  await page.fill("#bom-panel .bom-search", "ピン");
  const filtered = await page.$$eval("#bom-panel tr.bom-row", (trs) => trs.length);
  check("BOM search filters rows", filtered === 1, String(filtered));
  await page.fill("#bom-panel .bom-search", "");

  // ------------------------------------------------------------- isolate
  await page.click('#bom-panel tr.bom-row[data-key="p-pin"]');
  await page.click("#bom-panel .bom-iso");
  await page.waitForFunction(() => window.cad.asm.doc.components.find((c) => c.id === "c1").visible === false);
  await page.waitForFunction(() => window.cad.asm.bodyMap.every((m) => m.comp !== "c1"));
  const iso = await state();
  check("isolate hides the other components", JSON.stringify(iso.hidden) === '["c1"]');

  // ---------------------------------------------------------- saved view
  await page.evaluate(() => {
    const vp = window.cad.vp;
    vp.setStandardView([1, 0.3, 0.6], false);
    window.cad.asm.viewing.setTransparent(["c3"], true);
    window.cad.asm.viewing.setColorMode("part");
    window.cad.asm.explode = 0.4;
    window.cad.asm.render();
    window.cad.setStyle("shaded");
  });
  await page.evaluate(() => {
    const b = document.querySelector('[data-cmd="asm-views"]');
    if (b) b.click();
    else window.cad.asm.viewing.saveView("dummy");
  });
  await page.evaluate(() => window.cad.asm.viewing.saveView("E2E ビュー"));
  const saved = await state();
  const views = await page.evaluate(() => window.cad.asm.doc.views.map((v) => v.name));
  check("view saved in the assembly document", views.includes("E2E ビュー"), JSON.stringify(views));
  if (await page.$("#views-panel")) {
    const listed = await page.$$eval("#views-panel .view-row", (r) => r.map((x) => x.textContent));
    check("views panel lists the saved view", listed.some((t) => t.includes("E2E ビュー")), JSON.stringify(listed));
  }

  // change everything
  await page.evaluate(() => {
    const a = window.cad.asm;
    a.viewing.showAll();
    a.viewing.setColorMode("random");
    a.explode = 0;
    a.render();
    window.cad.setStyle("wireframe");
    window.cad.vp.setStandardView([0, 0, 1], false);
    window.cad.vp.zoomBy(1.7);
    window.cad.vp.setPerspective(!window.cad.vp.perspective);
  });
  const changed = await state();
  check("display state changed", !sameCam(changed.camera, saved.camera) && changed.hidden.length === 0 && changed.style === "wireframe");

  // recall (through the panel when present)
  const id = await page.evaluate(() => window.cad.asm.doc.views.find((v) => v.name === "E2E ビュー").id);
  if (await page.$(`#views-panel .view-row[data-view="${id}"] .view-name`)) await page.click(`#views-panel .view-row[data-view="${id}"] .view-name`);
  else await page.evaluate((i) => window.cad.asm.viewing.recallView(i), id);
  const mid = await state();
  check("camera moves smoothly (animation running)", mid.anim === true);
  await page.waitForFunction(() => !window.cad.vp.anim, null, { timeout: 5000 });
  await page.waitForTimeout(200);
  const rec = await state();
  const vpState = await page.evaluate(() => {
    const a = window.cad.asm;
    const op = window.cad.vp.bodyOpacity;
    return { ghost: a.bodyMap.map((m, i) => [m.comp, op[i] ?? 1]), visComps: [...new Set(a.bodyMap.map((m) => m.comp))].sort(), legend: !!document.querySelector(".color-legend") };
  });
  check("recalled camera", sameCam(rec.camera, saved.camera), JSON.stringify({ rec: rec.camera, saved: saved.camera }));
  check("recalled visibility", JSON.stringify(rec.hidden) === JSON.stringify(saved.hidden) && JSON.stringify(vpState.visComps) === '["c2","c3"]', JSON.stringify(vpState.visComps));
  check("recalled transparency", JSON.stringify(rec.transparent) === '["c3"]' && vpState.ghost.every(([c, o]) => (c === "c3" ? o < 1 : o === 1)), JSON.stringify(vpState.ghost));
  check("recalled explode, style and colour mode", rec.explode === 0.4 && rec.style === "shaded" && rec.colorMode === "part" && vpState.legend, JSON.stringify({ e: rec.explode, s: rec.style, c: rec.colorMode }));

  // home view restores everything
  await page.evaluate(() => window.cad.asm.viewing.recallView("home"));
  await page.waitForFunction(() => !window.cad.vp.anim, null, { timeout: 5000 });
  const home = await state();
  check("home view: all visible, opaque, assembled", home.hidden.length === 0 && home.transparent.length === 0 && home.explode === 0 && home.colorMode === "default");

  // --------------------------------------------------------- interference
  const ib = await page.$('[data-cmd="asm-interference"]');
  if (ib) await ib.click();
  else await page.evaluate(() => window.cad.asm.checkInterference());
  await page.waitForSelector("#interference-panel .if-run");
  await page.selectOption("#interference-panel .if-scope", "all");
  await page.click("#interference-panel .if-run");
  await page.waitForFunction(() => document.querySelector("#interference-panel .if-status")?.dataset.ran === "1", null, { timeout: 120000 });
  const res = await page.evaluate(() => window.cad.asm.viewing.lastInterference.map((r) => ({ a: r.a, b: r.b, kind: r.kind, volume: r.volume, ignored: r.ignored })));
  console.log("  interference:", JSON.stringify(res));
  const pins = res.find((r) => [r.a, r.b].sort().join() === "c2,c3");
  check("interference finds the overlapping pins", !!pins && pins.kind === "interfere" && pins.volume > 1);
  const overlay = await page.evaluate(() => window.cad.vp.overlayCount());
  check("overlap volume highlighted in 3D", overlay >= 1, String(overlay));
  await page.click('#interference-panel tr.if-row[data-pair="c2|c3"] .if-ignore, #interference-panel tr.if-row[data-pair="c3|c2"] .if-ignore');
  const ign = await page.evaluate(() => ({ list: window.cad.asm.doc.interferenceIgnore, overlay: window.cad.vp.overlayCount() }));
  check("pair excluded and stored in the document", JSON.stringify(ign.list) === '["c2|c3"]', JSON.stringify(ign));

  check("no page errors", errors.length === 0, errors.join(" | "));
} catch (e) {
  console.error(e);
  failed++;
} finally {
  await browser.close();
  await new Promise((r) => server.httpServer.close(r));
}
if (failed) {
  console.error(`${failed} check(s) failed`);
  process.exit(1);
}
console.log("asm view e2e passed");
