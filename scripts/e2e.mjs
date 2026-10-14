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
    cmd.sets.fixed.push({ kind: "face", body: 0, index: lo, point: faces[lo].center });
    cmd.sets.load.push({ kind: "face", body: 0, index: hi, point: faces[hi].center });
  });
  await page.locator('[data-k="mesh"]').selectOption("5000");
  await page.locator(".pp-body .btn", { hasText: "解析を実行" }).click();
  await page.waitForFunction(() => document.querySelector(".measure-out")?.textContent.includes("最大ミーゼス"), null, { timeout: 120000 });
  const fea = await page.locator(".measure-out").innerText();
  check("stress analysis", /最大ミーゼス応力\s*[\d.]+ MPa/.test(fea) && /つり合い誤差 < 0\.001%/.test(fea) && (await page.locator(".fea-legend.show").count()) === 1, fea.split("\n").slice(0, 2).join(" "));
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
      if (f.normal[1] > 0.99 && (!hi || f.center[1] > B[hi[0]].faces[hi[1]].center[1])) hi = [bi, i];
    }));
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
  await page.evaluate(() => window.cad.openDrawingEnv());
  await page.waitForFunction(() => window.cad.env === "drawing" && document.querySelectorAll(".dw-stage .dview").length >= 4, null, { timeout: 60000 });
  await settle();
  await page.evaluate(() => window.cad.leaveDrawingEnv());
  await settle();
  await page.locator('[data-cmd="asm-library"]').click();
  await page.locator(".lib-item", { hasText: "六角穴付きボルト" }).click();
  await page.locator(".modal-foot .btn", { hasText: "アセンブリに配置" }).click();
  await page.waitForFunction(() => window.cad.asm.doc.components.length === 4, null, { timeout: 60000 });
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
  if (process.env.E2E_SHOTS) await page.screenshot({ path: `${process.env.E2E_SHOTS}/asm-drawing.png` });
} catch (e) {
  check("run", false, e.message);
} finally {
  check("no page errors", errors.length === 0, errors.join("; "));
  await browser.close();
  await server.close();
}
process.exit(failed ? 1 : 0);
