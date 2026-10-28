// End-to-end smoke test: drives the built app in Chromium like a user.
//   npm run build && npm run e2e
// Set CHROMIUM_PATH to use a specific Chromium binary.
import { preview } from "vite";
import { chromium } from "playwright";

// E2E_PORT: preview port (default 4174)
const port = +(process.env.E2E_PORT || 4174);
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

  // shape editing: thicken the top face by 2 mm, then split the block in two with a work-plane-free origin plane
  await page.evaluate(() => window.cad.commands.run("thicken"));
  await page.evaluate(() => {
    const faces = window.cad.bodies[0].faces;
    const i = faces.findIndex((f) => f.type === "PLANE" && f.normal[2] > 0.99);
    const r = window.cad.faceRef({ kind: "face", body: 0, index: i, point: faces[i].center });
    window.cad.command.update((x) => x.faces.push(r));
  });
  await settle();
  await page.keyboard.press("Enter");
  await settle();
  const vt = (await page.evaluate(() => window.cad.kernel.massProps())).volume;
  check("thicken", Math.abs(vt - 40 * 25 * 14) < 1e-3, `volume=${vt.toFixed(1)}`);
  await page.evaluate(() => window.cad.commands.run("split"));
  await page.evaluate(() => window.cad.command.update((x) => ((x.tool = { kind: "origin", key: "XY" }), (x.keep = "both"))));
  await settle();
  await page.keyboard.press("Enter");
  await settle();
  check("split", (await page.evaluate(() => window.cad.bodies.length)) >= 1 && Object.keys(await page.evaluate(() => window.cad.featureErrors)).length === 0);

  // sample part rebuilds without feature errors and follows a parameter change
  await page.evaluate(() => window.cad.loadSample());
  await settle();
  check("sample part", (await page.evaluate(() => Object.keys(window.cad.featureErrors).length)) === 0);
  await page.evaluate(() => window.cad.store.mutate("p", (d) => (d.params.find((x) => x.name === "幅").expr = "110")));
  await settle();
  const bb = (await page.evaluate(() => window.cad.kernel.massProps())).bbox;
  check("parameter drives model", Math.abs(bb[1][0] - bb[0][0] - 110) < 1e-6 && (await page.evaluate(() => Object.keys(window.cad.featureErrors).length)) === 0);

  // rules (iLogic): a parameter change suppresses the fillet and writes an iProperty
  await page.evaluate(() =>
    window.cad.store.mutate("ルールを追加", (d) => {
      d.rules = [{ id: "r1", name: "幅ルール", trigger: "paramChange", enabled: true, code: 'suppress("フィレット1", 幅 > 120);\niprop("説明", `ブラケット W${幅}`);' }];
    }),
  );
  await page.evaluate(() => window.cad.store.mutate("p", (d) => (d.params.find((x) => x.name === "幅").expr = "130")));
  await page.waitForFunction(() => window.cad.store.doc.iprops["説明"] === "ブラケット W130", null, { timeout: 15000 });
  await settle();
  check("rule on parameter change", await page.evaluate(() => window.cad.store.doc.features.find((f) => f.name === "フィレット1").suppressed === true));
  await page.locator(".rb-tab", { hasText: "管理" }).click();
  await page.locator('[data-cmd="rules"]').click();
  await page.locator(".rl-code").fill('幅 = 110;\nsuppress("フィレット1", 幅 > 120);');
  await page.locator(".btn", { hasText: "このルールを実行" }).click();
  await page.waitForFunction(() => document.querySelector(".rl-out")?.textContent.includes("幅 = 110"), null, { timeout: 15000 });
  check("rule editor run", (await page.locator(".rl-out").innerText()).includes("フィレット1 を抑制解除"));
  if (process.env.E2E_SHOTS) await page.screenshot({ path: `${process.env.E2E_SHOTS}/rules.png` });
  await page.locator(".modal-foot .btn", { hasText: "OK" }).click();
  await settle();
  await page.locator('[data-cmd="family"]').click();
  await page.locator(".modal-foot .btn", { hasText: "選択した構成を適用" }).click();
  check("family table", await page.evaluate(() => window.cad.store.doc.iprops["構成"] === "標準" && window.cad.store.doc.family.rows.length === 1));
  await page.locator(".rb-tab", { hasText: "3D モデル" }).click();

  // stress analysis on the bracket: base fixed, boss top pushed down
  await page.evaluate(() => window.cad.commands.run("stress"));
  await page.evaluate(() => {
    const cmd = window.cad.command;
    const faces = window.cad.bodies[0].faces;
    let lo = 0, hi = 0;
    faces.forEach((f, i) => {
      if (f.type === "PLANE" && f.normal[1] < -0.99 && f.center[1] <= faces[lo].center[1]) lo = i;
      if (f.type === "PLANE" && f.normal[1] > 0.99 && f.center[1] >= faces[hi].center[1]) hi = i;
    });
    cmd.sets.load.push({ kind: "face", body: 0, index: hi, point: faces[hi].center });
    window.__lo = lo;
  });
  // the hidden bottom face comes from the quick-select button
  await page.locator(".pp-body .btn", { hasText: "底面を追加" }).click();
  check("analysis bottom-face quick pick", await page.evaluate(() => window.cad.command.sets.fixed.some((p) => p.index === window.__lo)));
  await page.locator('[data-k="mesh"]').selectOption("5000");
  await page.locator(".pp-body .btn", { hasText: "解析を実行" }).click();
  await page.waitForFunction(() => document.querySelector(".measure-out")?.textContent.includes("最大ミーゼス"), null, { timeout: 120000 });
  const fea = await page.locator(".measure-out").innerText();
  check("stress analysis", /最大ミーゼス応力\s*[\d.]+ MPa/.test(fea) && /つり合い誤差 < 0\.001%/.test(fea) && (await page.locator(".fea-legend.show").count()) === 1, fea.split("\n").slice(0, 2).join(" "));
  // PDF report: printable HTML with the result image (popup in the browser build)
  const [rep] = await Promise.all([page.waitForEvent("popup"), page.locator(".pp-body .btn", { hasText: "PDF レポート" }).click()]);
  await rep.waitForLoadState();
  const repInfo = await rep.evaluate(() => ({ tables: document.querySelectorAll("table").length, img: document.querySelector("img")?.src.length ?? 0, h1: document.querySelector("h1")?.textContent }));
  await rep.close();
  check("PDF analysis report", repInfo.tables >= 2 && repInfo.img > 10000 && /レポート/.test(repInfo.h1 ?? ""), JSON.stringify({ ...repInfo, img: Math.round(repInfo.img / 1024) + " KB" }));
  await page.locator(".pp-body .btn", { hasText: "収束確認" }).click();
  await page.waitForFunction(() => document.querySelector(".measure-out")?.textContent.includes("メッシュ収束"), null, { timeout: 180000 });
  check("mesh convergence check", true, (await page.locator(".measure-out").innerText()).split("\n").filter((l) => l.includes("収束") || l.includes("要素")).join(" "));
  await page.locator(".pp-body .btn", { hasText: "最大応力部を詳細解析" }).click();
  await page.waitForFunction(() => document.querySelector(".measure-out")?.textContent.includes("詳細解析: 最大ミーゼス応力"), null, { timeout: 240000 });
  check("sub-model zoom analysis", true, (await page.locator(".measure-out").innerText()).split("\n").filter((l) => l.includes("詳細")).join(" "));
  await page.locator('[data-k="show"]').selectOption("s1");
  await page.locator('[data-k="deform"]').selectOption("auto");
  if (process.env.E2E_SHOTS) await page.screenshot({ path: `${process.env.E2E_SHOTS}/stress.png` });
  // modal analysis keeps the selected supports
  await page.locator('[data-k="kind"]').selectOption("modal");
  await page.locator('[data-k="mesh"]').selectOption("5000");
  await page.locator('[data-k="modes"]').selectOption("3");
  await page.locator(".pp-body .btn", { hasText: "解析を実行" }).click();
  await page.waitForFunction(() => document.querySelectorAll(".mode-row").length === 3, null, { timeout: 180000 });
  check("modal analysis", true, (await page.locator(".mode-row").first().innerText()).replace(/\s+/g, " "));
  if (process.env.E2E_SHOTS) await page.screenshot({ path: `${process.env.E2E_SHOTS}/modal.png` });
  // thermal: hold the base at 20 °C, 5 W into the boss top
  await page.locator('[data-k="kind"]').selectOption("thermal");
  await page.evaluate(() => {
    const cmd = window.cad.command;
    const faces = window.cad.bodies[0].faces;
    let lo = 0, hi = 0;
    faces.forEach((f, i) => {
      if (f.type === "PLANE" && f.normal[1] < -0.99 && f.center[1] <= faces[lo].center[1]) lo = i;
      if (f.type === "PLANE" && f.normal[1] > 0.99 && f.center[1] >= faces[hi].center[1]) hi = i;
    });
    cmd.sets.temp = [{ kind: "face", body: 0, index: lo, point: faces[lo].center }];
    cmd.sets.flux = [{ kind: "face", body: 0, index: hi, point: faces[hi].center }];
  });
  await page.locator('[data-k="mesh"]').selectOption("5000");
  await page.locator(".pp-body .btn", { hasText: "解析を実行" }).click();
  await page.waitForFunction(() => document.querySelector(".measure-out")?.textContent.includes("最高温度"), null, { timeout: 180000 });
  const th = await page.locator(".measure-out").innerText();
  check("thermal analysis", /最高温度\s*[\d.]+ °C/.test(th), th.split("\n").slice(0, 2).join(" "));
  if (process.env.E2E_SHOTS) await page.screenshot({ path: `${process.env.E2E_SHOTS}/thermal.png` });
  // elasto-plastic and dynamic response analyses with the same supports / load
  await page.locator('[data-k="kind"]').selectOption("plastic");
  await page.locator('[data-k="mesh"]').selectOption("5000");
  await page.locator(".pp-body .btn", { hasText: "解析を実行" }).click();
  await page.waitForFunction(() => document.querySelector(".measure-out")?.textContent.includes("降伏した体積"), null, { timeout: 300000 });
  const pl = await page.locator(".measure-out").innerText();
  check("elasto-plastic analysis", /判定\s*(弾性範囲内|局所的に降伏|塑性崩壊)/.test(pl) && (await page.locator(".measure-out .motion-chart").count()) === 1, pl.split("\n").slice(0, 2).join(" "));
  await page.locator('[data-k="kind"]').selectOption("dynamic");
  await page.locator('[data-k="mesh"]').selectOption("5000");
  await page.locator(".pp-body .btn", { hasText: "解析を実行" }).click();
  await page.waitForFunction(() => document.querySelector(".measure-out")?.textContent.includes("応答倍率"), null, { timeout: 300000 });
  const dy = await page.locator(".measure-out").innerText();
  check("dynamic response analysis", /応答倍率 \(動的 \/ 静的\)\s*[\d.]+ 倍/.test(dy), dy.split("\n").slice(0, 3).join(" "));
  if (process.env.E2E_SHOTS) await page.screenshot({ path: `${process.env.E2E_SHOTS}/dynamic.png` });
  // topology optimisation with the structural supports chosen above
  await page.locator('[data-k="kind"]').selectOption("topology");
  await page.locator('[data-k="mesh"]').selectOption("5000");
  await page.locator('[data-k="topoIters"]').selectOption("20");
  await page.locator(".pp-body .btn", { hasText: "解析を実行" }).click();
  await page.waitForFunction(() => document.querySelector(".measure-out")?.textContent.includes("材料あたりの剛性"), null, { timeout: 300000 });
  const topo = await page.locator(".measure-out").innerText();
  check("topology optimisation", /体積\s*[\d.]+ %/.test(topo), topo.split("\n").slice(0, 4).join(" "));
  if (process.env.E2E_SHOTS) await page.screenshot({ path: `${process.env.E2E_SHOTS}/topology.png` });
  await page.keyboard.press("Escape");
  await settle();

  // studio rendering + high resolution image
  await page.locator(".rb-tab", { hasText: "表示" }).click();
  await page.locator('[data-cmd="realistic"]').click();
  await settle();
  const png = await page.evaluate(() => window.cad.vp.capture(2));
  check("realistic rendering + capture", png.startsWith("data:image/png") && png.length > 20000, `${Math.round(png.length / 1024)} KB`);
  if (process.env.E2E_SHOTS) await page.screenshot({ path: `${process.env.E2E_SHOTS}/render.png` });
  await page.locator('[data-cmd="realistic"]').click();

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
  // DXF export: JIS layers, line types, Shift_JIS title block text
  const [dl] = await Promise.all([page.waitForEvent("download"), page.locator('[data-cmd="dw-dxf"]').click()]);
  const dxfBytes = await (await import("node:fs/promises")).readFile(await dl.path());
  const dxfText = new TextDecoder("shift_jis").decode(dxfBytes);
  check("drawing DXF (layers, Shift_JIS)", /ANSI_932/.test(dxfText) && /\nVISIBLE\r?\n/.test(dxfText.replace(/\r/g, "")) && dxfText.includes("HIDDEN") && dxfText.includes("CENTER") && dxfText.includes("ブラケット"), `${Math.round(dxfBytes.length / 1024)} KB`);
  // hole table, ordinate dimensions, overlap-free dimension text
  await page.locator('[data-cmd="dw-holetable"]').click();
  await page.locator('[data-cmd="dw-style-ord"]').click();
  await page.evaluate(() => {
    const d = window.cad.store.doc.drawing.sheets[0];
    window.cad.drawing.mutate("clear", (x) => (x.sheets[0].annos = x.sheets[0].annos.filter((a) => a.type !== "dim")));
    void d;
  });
  await page.locator('[data-cmd="dw-autodim"]').click();
  await settle();
  const dw2 = await page.evaluate(() => {
    const boxes = [...document.querySelectorAll(".dw-stage .anno.dim text")].map((t) => t.getBoundingClientRect());
    let overlaps = 0;
    for (let i = 0; i < boxes.length; i++)
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i], b = boxes[j];
        if (a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1) overlaps++;
      }
    return { table: document.querySelectorAll(".dw-stage .holetable text").length, ord: document.querySelectorAll(".dw-stage .ordinate text").length, dims: boxes.length, overlaps };
  });
  check("hole table + ordinate dims, no overlapping text", dw2.table >= 8 && dw2.ord >= 4 && dw2.overlaps === 0, JSON.stringify(dw2));
  if (process.env.E2E_SHOTS) await page.screenshot({ path: `${process.env.E2E_SHOTS}/drawing-ordinate.png` });
  // broken view: the base view is shortened, dimensions keep the true length
  const w0 = await page.evaluate(() => document.querySelector(".dw-stage .dview").getBBox().width);
  await page.locator('[data-cmd="dw-break"]').click();
  await page.locator(".modal-foot .btn.primary").click();
  await settle();
  const brk = await page.evaluate(() => ({ lines: document.querySelectorAll(".dw-stage .break-line").length, w: document.querySelector(".dw-stage .dview").getBBox().width }));
  check("broken view", brk.lines === 2 && brk.w < w0 - 10, JSON.stringify({ ...brk, w0 }));
  if (process.env.E2E_SHOTS) await page.screenshot({ path: `${process.env.E2E_SHOTS}/drawing-break.png` });
  // weld symbol via the tool: click an edge of the base view, place the reference line, accept the dialog
  await page.locator('[data-cmd="dw-weld"]').click();
  {
    const bb = await page.locator(".dw-stage .dview .visible-lines").first().boundingBox();
    await page.mouse.click(bb.x + bb.width * 0.3, bb.y + bb.height - 1);
    await page.mouse.click(bb.x + bb.width * 0.3 - 40, bb.y + bb.height + 40);
    await page.locator(".modal-foot .btn.primary").click();
    await page.keyboard.press("Escape");
  }
  await settle();
  // stepped section of the base view (programmatic placement, offset 5 mm from mid-length)
  await page.evaluate(async () => {
    const dw = window.cad.drawing;
    const sh = dw.doc.sheets[dw.activeSheet];
    const v = sh.views.find((x) => x.kind === "base");
    const g = dw.geom.get(v.id);
    const [x0, y0, x1, y1] = g.bounds;
    const cy = (y0 + y1) / 2;
    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const dir = cross(v.xAxis, v.dir);
    dw.mutate("断面", (d) => d.sheets[dw.activeSheet].views.push({ id: "secS", label: "Z-Z", kind: "section", parent: v.id, dir, xAxis: v.xAxis, scale: v.scale, x: v.x, y: v.y + 120, hidden: false, centerMarks: false, section: { a: [x0 - 5, cy], b: [x1 + 5, cy], flip: false, steps: [{ at: (x1 - x0) / 2 + 5, offset: 5 }] } }));
    await dw.refresh(true);
  });
  await settle();
  const sw = await page.evaluate(() => ({ weld: document.querySelectorAll(".dw-stage .anno.weld").length, stepped: document.querySelectorAll(".dw-stage .stepped-cut").length, hatch: document.querySelectorAll('.dw-stage .dview[data-id="secS"] path[fill="url(#hatch)"]').length }));
  check("weld symbol + stepped section", sw.weld === 1 && sw.stepped === 1 && sw.hatch === 1, JSON.stringify(sw));
  if (process.env.E2E_SHOTS) await page.screenshot({ path: `${process.env.E2E_SHOTS}/drawing-weld.png` });
  // partial (breakout) section of the base view
  await page.evaluate(() => window.cad.drawing.selected.clear());
  await page.locator('[data-cmd="dw-breakout"]').click();
  await page.locator('[data-k="breakout-depth"]').fill("20");
  await page.locator(".modal-foot .btn.primary").click();
  await settle();
  await page
    .waitForFunction(() => {
      const v = window.cad.drawing.doc.sheets[window.cad.drawing.activeSheet].views.find((x) => x.kind === "base");
      return document.querySelectorAll(`.dw-stage .dview[data-id="${v.id}"] path[fill="url(#hatch)"]`).length > 0;
    }, null, { timeout: 60000 })
    .catch(() => {});
  const bo = await page.evaluate(() => {
    const v = window.cad.drawing.doc.sheets[window.cad.drawing.activeSheet].views.find((x) => x.kind === "base");
    return { line: document.querySelectorAll(".dw-stage .breakout-line").length, hatch: document.querySelectorAll(`.dw-stage .dview[data-id="${v.id}"] path[fill="url(#hatch)"]`).length };
  });
  check("breakout (partial section)", bo.line === 1 && bo.hatch >= 1, JSON.stringify(bo));
  await page.keyboard.press("Control+z");
  await page.keyboard.press("Control+y");
  await page.evaluate(() => window.cad.leaveDrawingEnv());
  await settle();
  check("back to model", (await page.evaluate(() => window.cad.env)) === "part");

  // standard parts library: hex nut M10 opens as a part with a tapped hole (cosmetic thread)
  await page.locator(".rb-tab", { hasText: "管理" }).click();
  await page.locator('[data-cmd="library"]').click();
  await page.locator(".lib-item", { hasText: "六角ナット" }).click();
  await page.locator(".lib-detail select").first().selectOption("M10");
  await page.locator(".modal-foot .btn", { hasText: "パーツとして開く" }).click();
  await page.locator(".modal-foot .btn", { hasText: "破棄して続行" }).click(); // the edited sample is unsaved
  await settle();
  const nut = await page.evaluate(() => ({ errors: Object.keys(window.cad.featureErrors).length, threads: window.cad.vp.threadLayer.children.length, name: window.cad.store.doc.name }));
  check("library: hex nut with tapped thread", nut.errors === 0 && nut.threads === 1 && nut.name.includes("M10"), JSON.stringify(nut));
  if (process.env.E2E_SHOTS) await page.screenshot({ path: `${process.env.E2E_SHOTS}/nut.png` });
  await page.evaluate(() => window.cad.openDrawingEnv());
  await page.waitForFunction(() => window.cad.env === "drawing" && document.querySelectorAll(".dw-stage .dview").length >= 4, null, { timeout: 60000 });
  await settle();
  const thinLines = await page.evaluate(() => document.querySelectorAll(".dw-stage .thread-lines").length);
  check("drawing: JIS thread representation", thinLines >= 1, `views with thread lines=${thinLines}`);
  if (process.env.E2E_SHOTS) await page.screenshot({ path: `${process.env.E2E_SHOTS}/nut-drawing.png` });
  await page.evaluate(() => window.cad.leaveDrawingEnv());
  await settle();

  // frame generator: square tube along a 400×300 rectangle, cut list
  await page.evaluate(() => void window.cad.newDocument());
  await page.locator(".modal-foot .btn", { hasText: "破棄して続行" }).click({ timeout: 2000 }).catch(() => {});
  await settle();
  await page.evaluate(() => window.cad.createSketch({ origin: [0, 0, 0], xDir: [1, 0, 0], normal: [0, 0, 1] }, "XY 平面"));
  await page.waitForTimeout(700);
  await page.keyboard.press("r");
  await clickUV(0, 0);
  {
    const q2 = await S(60, 40);
    await page.mouse.move(q2.x, q2.y);
  }
  await page.keyboard.type("400");
  await page.keyboard.press("Tab");
  await page.keyboard.type("300");
  await page.keyboard.press("Enter");
  await page.keyboard.press("Escape");
  await page.keyboard.press("Control+Enter");
  await settle();
  await page.locator('[data-cmd="frame"]').click();
  await settle();
  const cut = await page.locator('[data-k="cutlist-total"]').innerText();
  await page.keyboard.press("Enter");
  await settle();
  const fr = await page.evaluate(() => ({ errors: Object.keys(window.cad.featureErrors).length }));
  const frVol = await page.evaluate(() => window.cad.kernel.massProps());
  check("frame generator + cut list", fr.errors === 0 && cut.includes("4 本") && cut.includes("1400 mm") && Math.abs(frVol.volume / ((50 * 50 - 45.4 * 45.4) * 1400) - 1) < 1e-3, `${cut} vol=${frVol.volume?.toFixed(0)}`);
  if (process.env.E2E_SHOTS) await page.screenshot({ path: `${process.env.E2E_SHOTS}/frame.png` });
  // engraved Japanese text on the frame sketch plane
  const v0 = (await page.evaluate(() => window.cad.kernel.massProps())).volume;
  await page.locator(".rb-tab", { hasText: "3D モデル" }).click();
  await page.locator('[data-cmd="emboss"]').click();
  await page.locator('[data-k="emboss-text"]').fill("刻印 A-1");
  {
    const yIn = page.locator(".field", { hasText: "位置 Y" }).locator("input");
    await yIn.fill("20");
    await yIn.press("Tab");
  }
  await settle();
  await page.keyboard.press("Enter");
  await settle();
  const em = await page.evaluate(async () => ({ errors: Object.keys(window.cad.featureErrors).length, v: (await window.cad.kernel.massProps()).volume }));
  check("text engraving (Japanese)", em.errors === 0 && em.v < v0 - 1, `removed ${(v0 - em.v).toFixed(1)} mm³`);
  // 3D print check on the frame (no overhang when lying flat), tolerance stack-up, revisions
  await page.locator(".rb-tab", { hasText: "検査" }).click();
  await page.locator('[data-cmd="printcheck"]').click();
  await page.waitForSelector('[data-k="pc-result"]', { timeout: 30000 });
  const pc = await page.locator('[data-k="pc-result"]').innerText();
  check("3D print check", pc.includes("開いたエッジ\t0") && pc.includes("造形高さ\t50"), pc.replace(/\n/g, " | "));
  if (process.env.E2E_SHOTS) await page.screenshot({ path: `${process.env.E2E_SHOTS}/printcheck.png` });
  await page.keyboard.press("Escape");
  await page.locator('[data-cmd="tolstack"]').click();
  const tol = await page.locator('[data-k="tol-result"]').innerText();
  check("tolerance stack-up", tol.includes("0.5") && tol.includes("RSS"), tol.split("\n").slice(0, 3).join(" | "));
  await page.locator(".modal-foot .btn", { hasText: "閉じる" }).click();
  await page.locator(".rb-tab", { hasText: "管理" }).click();
  await page.locator('[data-cmd="revisions"]').click();
  await page.locator(".modal-foot .btn", { hasText: "改訂を記録" }).click();
  await page.locator(".modal-foot .btn.primary").last().click();
  await page.waitForSelector('[data-k="rev-pending"]');
  await page.locator(".modal-foot .btn", { hasText: "閉じる" }).click();
  await page.evaluate(() => {
    const st = window.cad.store;
    const p = st.doc.params.find((x) => x.kind === "model");
    st.mutate("edit", (d) => (d.params.find((x) => x.name === p.name).expr = "350"));
  });
  await settle();
  await page.locator('[data-cmd="revisions"]').click();
  const revTxt = await page.locator('[data-k="rev-pending"]').innerText();
  check("revision record + change list", (await page.evaluate(() => window.cad.store.doc.revisions?.[0]?.rev)) === "A" && revTxt.includes("寸法変更"), revTxt);
  await page.locator(".modal-foot .btn", { hasText: "閉じる" }).click();
  // 2.5D CAM: pocket inside the frame sketch, G-code export
  await page.locator(".rb-tab", { hasText: "検査" }).click();
  await page.locator('[data-cmd="cam"]').click();
  await page.waitForSelector('[data-k="cam-result"]', { timeout: 30000 });
  const camTxt = await page.locator('[data-k="cam-result"]').innerText();
  const [nc] = await Promise.all([page.waitForEvent("download"), page.locator('[data-k="cam-gcode"]').click()]);
  const gcode = await (await import("node:fs/promises")).readFile(await nc.path(), "utf8");
  check("CAM pocket + G-code", /切削長さ\t[\d,]+ mm/.test(camTxt) && gcode.includes("T1 M06") && gcode.includes("Z-5.") && gcode.split("\n").length > 100, `${camTxt.replace(/\n/g, " | ")} lines=${gcode.split("\n").length}`);
  if (process.env.E2E_SHOTS) await page.screenshot({ path: `${process.env.E2E_SHOTS}/cam.png` });
  await page.keyboard.press("Escape");

  // sheet metal: face from the 120x80 sketch, four flanges, flat pattern
  await page.evaluate(() => void window.cad.newDocument());
  await page.locator(".modal-foot .btn", { hasText: "破棄して続行" }).click({ timeout: 2000 }).catch(() => {});
  await settle();
  await page.evaluate(() => window.cad.createSketch({ origin: [0, 0, 0], xDir: [1, 0, 0], normal: [0, 0, 1] }, "XY 平面"));
  await page.waitForTimeout(700);
  await page.keyboard.press("r");
  await clickUV(0, 0);
  const q = await S(60, 40);
  await page.mouse.move(q.x, q.y);
  await page.keyboard.type("120");
  await page.keyboard.press("Tab");
  await page.keyboard.type("80");
  await page.keyboard.press("Enter");
  await page.keyboard.press("Escape");
  await page.keyboard.press("Control+Enter");
  await settle();
  await page.locator(".rb-tab", { hasText: "板金" }).click();
  await page.locator('[data-cmd="sheetFace"]').click();
  await settle();
  await page.keyboard.press("Enter");
  await settle();
  const sm1 = await page.evaluate(() => window.cad.kernel.massProps());
  check("sheet metal face", Math.abs(sm1.volume - 120 * 80 * 2) < 1e-3, `volume=${sm1.volume.toFixed(2)}`);
  await page.evaluate(() => {
    const st = window.cad.store;
    const face = st.doc.features.find((f) => f.type === "sheetFace");
    st.mutate("フランジ", (d) => {
      d.params.push({ name: "d_fl", expr: "25", unit: "mm", kind: "model", owner: "fl1" }, { name: "a_fl", expr: "90", unit: "deg", kind: "model", owner: "fl1" });
      d.features.push({ id: "fl1", type: "flange", name: "フランジ1", base: face.id, edges: [[60, 0], [120, 40], [60, 80], [0, 40]], height: "d_fl", angle: "a_fl", down: false });
      d.endOfPart = d.features.length;
    });
  });
  await settle();
  const smErr = await page.evaluate(() => Object.values(window.cad.featureErrors));
  check("sheet metal flanges", smErr.length === 0 && (await page.evaluate(() => window.cad.kernel.massProps())).bbox[1][2] > 24.99, JSON.stringify(smErr));
  await page.locator('[data-cmd="sm-flat"]').click();
  await page.waitForSelector(".flat-view svg");
  const flatTxt = await page.locator(".modal .lib-spec").innerText();
  const ba = (Math.PI / 2) * (2 + 0.44 * 2);
  const want = (120 + 2 * (ba + 21)).toFixed(2);
  check("flat pattern size", flatTxt.includes(want), `${flatTxt.split("\n")[0]} (expected ${want})`);
  if (process.env.E2E_SHOTS) await page.screenshot({ path: `${process.env.E2E_SHOTS}/flat.png` });
  await page.locator(".modal-foot .btn", { hasText: "閉じる" }).click();
  if (process.env.E2E_SHOTS) await page.screenshot({ path: `${process.env.E2E_SHOTS}/sheetmetal.png` });

  // sample assembly: insert constraint seats the pin
  await page.evaluate(() => window.cad.loadSampleAssembly());
  await page.waitForFunction(() => window.cad.asm.bodyMap.length >= 3, null, { timeout: 60000 });
  await settle();
  const pin = await page.evaluate(() => window.cad.asm.doc.components.find((c) => c.id === "c2").matrix.slice(12, 15));
  check("assembly insert constraint", Math.abs(pin[0]) < 1e-6 && Math.abs(pin[1] - 35) < 1e-6 && Math.abs(pin[2]) < 1e-6, JSON.stringify(pin));
  const hits = await page.evaluate(() => window.cad.kernel.interference(window.cad.asm.placements()));
  check("no interference", hits.length === 0);
  // degrees of freedom: the inserted pin can only spin, the loose pin is free
  const dof = await page.evaluate(() => ({ c2: window.cad.asm.dof.perComp.get("c2").dof, c3: window.cad.asm.dof.perComp.get("c3").dof, status: document.querySelector(".st-dof").textContent }));
  check("assembly DOF", dof.c2 === 1 && dof.c3 === 6 && dof.status.includes("自由度 7"), JSON.stringify(dof));
  // drive the insert offset: the pin slides out and comes back on cancel
  await page.locator('[data-cmd="asm-drive"]').click();
  await page.locator(".drive-btns .btn", { hasText: "▶▶" }).click();
  await page.waitForFunction(() => Math.abs(window.cad.asm.doc.components.find((c) => c.id === "c2").matrix[13] - 55) < 1e-6, null, { timeout: 20000 });
  check("drive constraint", true);
  // motion study: 20 mm in 1 s -> 20 mm/s, clearance reported
  await page.locator('[data-k="motion-run"]').click();
  await page.waitForSelector('[data-k="vmax"]', { timeout: 60000 });
  const mo = await page.evaluate(() => ({ v: parseFloat(document.querySelector('[data-k="vmax"]').textContent), c: document.querySelector('[data-k="minclear"]')?.textContent, charts: document.querySelectorAll(".motion-chart").length }));
  check("motion study", Math.abs(mo.v - 20) < 0.5 && mo.c != null && mo.charts >= 3, JSON.stringify(mo));
  await page.keyboard.press("Escape");
  await settle();
  check("drive restores", Math.abs((await page.evaluate(() => window.cad.asm.doc.components.find((c) => c.id === "c2").matrix[13])) - 35) < 1e-6);
  // assembly structural analysis: bracket base fixed, inserted pin pushed down (bonded parts, per-part materials)
  await page.locator('[data-cmd="asm-analysis"]').click();
  await page.evaluate(() => {
    const cmd = window.cad.command;
    const B = cmd.B;
    let lo = null, hi = null;
    B.forEach((b, bi) => b.faces.forEach((f, i) => {
      if (f.type !== "PLANE") return;
      if (f.normal[1] < -0.99 && (!lo || f.center[1] < B[lo[0]].faces[lo[1]].center[1])) lo = [bi, i];
    }));
    // load the top of the same (supported) body: a load on a free part is refused
    B[lo[0]].faces.forEach((f, i) => {
      if (f.type === "PLANE" && f.normal[1] > 0.99 && (!hi || f.center[1] > B[hi[0]].faces[hi[1]].center[1])) hi = [lo[0], i];
    });
    cmd.sets.fixed = [{ kind: "face", body: lo[0], index: lo[1], point: B[lo[0]].faces[lo[1]].center }];
    cmd.sets.load = [{ kind: "face", body: hi[0], index: hi[1], point: B[hi[0]].faces[hi[1]].center }];
  });
  await page.locator('[data-k="mesh"]').selectOption("5000");
  await page.locator(".pp-body .btn", { hasText: "解析を実行" }).click();
  await page.waitForFunction(() => document.querySelector(".measure-out")?.textContent.includes("最大ミーゼス応力"), null, { timeout: 240000 });
  check("assembly structural analysis", /最大ミーゼス応力\s*[\d.]+ MPa/.test(await page.locator(".measure-out").innerText()));
  if (process.env.E2E_SHOTS) await page.screenshot({ path: `${process.env.E2E_SHOTS}/asm-stress.png` });
  await page.keyboard.press("Escape");
  await settle();
  await page.locator('[data-cmd="asm-explode"]').click();
  await settle();
  const ex = await page.evaluate(() => ({ trails: window.cad.vp.trailLayer.children.length, y: window.cad.asm.doc.components.find((c) => c.id === "c2").matrix[13] }));
  check("exploded view", ex.trails === 1 && Math.abs(ex.y - 35) < 1e-6, JSON.stringify(ex));
  if (process.env.E2E_SHOTS) await page.screenshot({ path: `${process.env.E2E_SHOTS}/explode.png` });
  await page.keyboard.press("Escape");
  await settle();
  // component pattern: 3 copies of the loose pin along X, following the source
  await page.evaluate(() => window.cad.asm.select(["c3"]));
  await page.locator('[data-cmd="asm-pattern"]').click();
  await page.locator(".modal-foot .btn.primary").click();
  await settle();
  const pat = await page.evaluate(() => {
    const d = window.cad.asm.doc;
    const src = d.components.find((c) => c.id === "c3");
    const inst = d.components.filter((c) => c.patternOf);
    return { n: inst.length, dx: inst.map((c) => +(c.matrix[12] - src.matrix[12]).toFixed(3)), dof: window.cad.asm.dof.perComp.get(inst[0]?.id)?.dof };
  });
  check("component pattern", pat.n === 2 && pat.dx.join() === "30,60" && pat.dof === 0, JSON.stringify(pat));
  await page.evaluate(() => window.cad.openDrawingEnv());
  await page.waitForFunction(() => window.cad.env === "drawing" && document.querySelectorAll(".dw-stage .dview").length >= 4, null, { timeout: 60000 });
  await settle();
  await page.evaluate(() => window.cad.leaveDrawingEnv());
  await settle();
  const nComp = await page.evaluate(() => window.cad.asm.doc.components.length);
  await page.locator('[data-cmd="asm-library"]').click();
  await page.locator(".lib-item", { hasText: "六角穴付きボルト" }).click();
  await page.locator(".modal-foot .btn", { hasText: "アセンブリに配置" }).click();
  await page.waitForFunction((n) => window.cad.asm.doc.components.length === n + 1, nComp, { timeout: 60000 });
  await settle();
  check("library: bolt placed in assembly", (await page.evaluate(() => window.cad.asm.doc.parts.some((p) => p.doc?.iprops?.["規格"] === "ISO 4762"))) === true);
  await page.evaluate(() => window.cad.openDrawingEnv());
  await page.waitForFunction(() => window.cad.env === "drawing" && document.querySelectorAll(".dw-stage .dview").length >= 4, null, { timeout: 60000 });
  await settle();
  // drawing set: assembly sheet + one detail sheet per part, with dimensions and balloons
  await page.locator('[data-cmd="dw-set"]').click();
  await page.waitForFunction(() => window.cad.asm.doc.drawing.sheets.length >= 3, null, { timeout: 120000 });
  await settle();
  const set = await page.evaluate(() => {
    const sh = window.cad.asm.doc.drawing.sheets;
    return { sheets: sh.length, detail: sh.filter((s) => s.part).length, dims: sh.filter((s) => s.part).map((s) => s.annos.filter((a) => a.type === "dim").length), balloons: sh[0].annos.filter((a) => a.type === "balloon").length };
  });
  check("drawing set + auto dimensions + balloons", set.detail >= 2 && set.dims.every((n) => n >= 2) && set.balloons >= 2, JSON.stringify(set));
  if (process.env.E2E_SHOTS) await page.screenshot({ path: `${process.env.E2E_SHOTS}/drawing-set.png` });
  await page.evaluate(() => window.cad.drawing.switchSheet?.(1));
  await settle();
  if (process.env.E2E_SHOTS) await page.screenshot({ path: `${process.env.E2E_SHOTS}/detail-sheet.png` });
  await page.evaluate(() => window.cad.drawing.switchSheet(0));
  await settle();
  check("assembly drawing + parts list", (await page.evaluate(() => document.querySelectorAll(".dw-stage .partslist").length)) === 1);
  // edit the parts list: note of item 1
  await page.evaluate(() => window.cad.drawing.editPartsList());
  await page.locator('[data-k="bom-edit"] tr').nth(1).locator("input").nth(3).fill("焼入れ HRC40");
  await page.locator(".modal-foot .btn.primary").click();
  await settle();
  check("parts list edit", (await page.evaluate(() => document.querySelector(".dw-stage .partslist").textContent)).includes("焼入れ HRC40"));
  if (process.env.E2E_SHOTS) await page.screenshot({ path: `${process.env.E2E_SHOTS}/asm-drawing.png` });

  // learning center: start lesson 1-2 on its sample part; a parameter change completes the step automatically
  await page.evaluate(() => window.cad.leaveDrawingEnv());
  await page.click(".tb-learn");
  await page.locator(".ln-lesson", { hasText: "フィーチャ履歴" }).locator("button").click();
  const discard = page.locator(".modal .btn.primary", { hasText: "破棄して続行" });
  if (await discard.isVisible({ timeout: 1000 }).catch(() => false)) await discard.click();
  await page.locator(".ln-coach .btn.primary", { hasText: "操作をはじめる" }).click();
  await page.locator(".ln-coach .btn.primary", { hasText: "次へ" }).click();
  await page.waitForSelector(".ln-glow", { timeout: 3000 }).catch(() => {});
  const glow = await page.evaluate(() => [...document.querySelectorAll(".ln-glow")].map((e) => e.dataset.cmd));
  await page.evaluate(() => window.cad.store.mutate("幅", (d) => (d.params.find((p) => p.name === "幅").expr = "100")));
  await page.waitForFunction(() => document.querySelector(".ln-step.current")?.textContent.includes("板厚"), null, { timeout: 5000 }).catch(() => {});
  const cur = await page.evaluate(() => document.querySelector(".ln-step.current")?.textContent ?? "");
  check("learning: guided step auto-completes", glow.includes("params") && cur.includes("板厚"), JSON.stringify({ glow, cur: cur.slice(0, 30) }));
  if (process.env.E2E_SHOTS) await page.screenshot({ path: `${process.env.E2E_SHOTS}/learning.png` });

  // textbook (separate page): every chapter renders and its calculators produce results
  const tb = await browser.newPage({ viewport: { width: 1300, height: 860 } });
  tb.on("pageerror", (e) => errors.push(`textbook: ${e.message}`));
  await tb.goto(url + "textbook.html");
  await tb.waitForSelector(".tb-hero");
  const ids = await tb.evaluate(() => [...document.querySelectorAll(".tb-nav-part a")].map((a) => a.getAttribute("href")));
  let widgetErrors = 0;
  for (const href of ids) {
    await tb.goto(url + "textbook.html" + href);
    await tb.waitForSelector(".tb-article");
    widgetErrors += await tb.evaluate(() => document.querySelectorAll(".tb-err").length + [...document.querySelectorAll("[data-widget]")].filter((w) => !w.querySelector(".tb-widget-out")?.children.length).length);
  }
  check("textbook: chapters and calculators", ids.length >= 20 && widgetErrors === 0, `${ids.length} chapters, ${widgetErrors} widget errors`);
  if (process.env.E2E_SHOTS) await tb.screenshot({ path: `${process.env.E2E_SHOTS}/textbook.png` });
  await tb.close();
} catch (e) {
  check("run", false, e.message);
} finally {
  check("no page errors", errors.length === 0, errors.join("; "));
  await browser.close();
  await server.close();
}
process.exit(failed ? 1 : 0);
