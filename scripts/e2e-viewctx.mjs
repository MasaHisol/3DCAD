// End-to-end: 閲覧時の右クリック操作 (stage 2).
// In the viewer mode a STEP assembly opens with its product structure in the tree;
// right-click a part → 非表示, the tree's eye icon, H / Shift+H / I, Alt+click picks
// the part behind, box / Ctrl+click selection, undo / redo of view steps (file stays
// unmodified), the hidden-items panel, saving / recalling a display state; then one
// check in the normal part (editing) mode.
//   npm run build && node scripts/e2e-viewctx.mjs
// CHROMIUM_PATH: Chromium binary, E2E_PORT: preview port (default 4178).
import { readFileSync } from "node:fs";
import { preview } from "vite";
import { chromium } from "playwright";

const port = +(process.env.E2E_PORT || 4178);
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
  await page.waitForTimeout(300);
};
const fixture = (name) => readFileSync(new URL(`../tests/fixtures/${name}`, import.meta.url)).toString("base64");
const st = () =>
  page.evaluate(() => {
    const c = window.cad.viewCtx;
    const s = c.state();
    return { hidden: [...s.hidden].sort(), transparent: [...s.transparent].sort(), colors: s.colors, sel: c.selection(), on: window.cad.vp.bodies.map((_, i) => window.cad.vp.isBodyOn(i)), dirty: window.cad.store.dirty };
  });
const bodyId = (name) => page.evaluate((n) => `b${window.cad.bodies.findIndex((b) => b.name === n)}`, name);
/** Screen point on the top face of a body (top view), checked to pick that body. */
const topPoint = (name) =>
  page.evaluate((n) => {
    const cad = window.cad;
    const bi = cad.bodies.findIndex((b) => b.name === n);
    const b = cad.bodies[bi];
    const f = b.faces.filter((x) => x.normal[2] > 0.99).sort((p, q) => q.center[2] - p.center[2])[0];
    const p = cad.vp.worldToScreen(f.center);
    const hit = cad.vp.pick({ clientX: p.x, clientY: p.y }, new Set(["face"]));
    return { ...p, ok: hit?.body === bi, bi };
  }, name);
const menuItem = (label) => `.ctx-menu .ctx-item:has(.ctx-label:text-is("${label}"))`;
const key = async (k) => {
  await page.mouse.move(700, 820); // keep the pointer off buttons
  await page.keyboard.press(k);
  await page.waitForTimeout(120);
};

try {
  await page.goto(url);
  await page.evaluate(() => localStorage.clear());
  await page.goto(url + "?viewer=1");
  await page.waitForFunction(() => window.cad && window.cad.kernelReady);

  // ---------------------------------------------------------- open the STEP ---
  await page.evaluate(async (b64) => {
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    await window.cad.viewer.open(new File([bytes], "assembly-colors.step"));
  }, fixture("assembly-colors.step"));
  await page.waitForFunction(() => window.cad.bodies.length === 3, null, { timeout: 120000 });
  await settle();
  await page.evaluate(() => {
    window.cad.vp.setStandardView([0, 0, 1], false);
    window.cad.vp.fitAll(false);
  });
  await page.waitForTimeout(200);
  const tree = await page.evaluate(() => ({
    groups: [...document.querySelectorAll(".vw-group .br-label")].map((e) => e.textContent),
    items: [...document.querySelectorAll(".vw-item .br-label")].map((e) => e.textContent),
    paths: window.cad.bodies.map((b) => (b.path ?? []).join("/")),
  }));
  check("STEP product structure in the tree (assembly → parts)", tree.groups.some((g) => g === "組立品") && ["プレート:1", "Pin-M6:1", "Pin-M6:2"].every((n) => tree.items.includes(n)), JSON.stringify(tree));

  const pin = await bodyId("Pin-M6:1");
  const plate = await bodyId("プレート:1");
  let pinPt = await topPoint("Pin-M6:1");
  check("pin top face pickable in the top view", pinPt.ok, JSON.stringify(pinPt));

  // ---------------------------------------------------------- right-click → 非表示 ---
  await page.mouse.click(pinPt.x, pinPt.y, { button: "right" });
  await page.waitForSelector(".ctx-menu", { timeout: 5000 });
  const labels = await page.$$eval(".ctx-menu .ctx-label", (es) => es.map((e) => e.textContent));
  check("viewer right-click: the view menu (no editing items)", ["非表示", "この部品だけ表示 (分離)", "他を半透明に", "この部品を半透明に", "色を変える…", "ここにズーム", "プロパティ", "測定を開始", "断面をここで切る", "選択を解除"].every((l) => labels.includes(l)) && !labels.includes("押し出し"), labels.join(","));
  await page.click(menuItem("非表示"));
  let s = await st();
  check("右クリック → 非表示: the part disappears", s.hidden.join() === pin && s.on[pinPt.bi] === false, JSON.stringify(s));
  check("viewer: hiding does not modify the file", s.dirty === false);
  const gone = await page.evaluate((p) => window.cad.vp.pick({ clientX: p.x, clientY: p.y }, new Set(["face"]))?.body ?? -1, pinPt);
  check("hidden part is not picked", gone !== pinPt.bi, String(gone));

  // ---------------------------------------------------------- undo / redo ---
  await key("Control+z");
  s = await st();
  check("Ctrl+Z restores the hidden part", s.hidden.length === 0 && s.on[pinPt.bi] === true && !s.dirty);
  await key("Control+y");
  s = await st();
  check("Ctrl+Y hides it again", s.hidden.join() === pin);
  await key("Shift+H");
  s = await st();
  check("Shift+H shows everything", s.hidden.length === 0 && s.on.every(Boolean));

  // ---------------------------------------------------------- tree eye ---
  await page.click(`.vw-item[data-item="${pin}"] .vw-eye`);
  s = await st();
  check("tree eye icon hides the part", s.hidden.join() === pin && s.on[pinPt.bi] === false);
  check("tree row dimmed", await page.evaluate((id) => document.querySelector(`.vw-item[data-item="${id}"]`)?.classList.contains("dimmed"), pin));
  await page.click(`.vw-item[data-item="${pin}"] .vw-eye`);
  s = await st();
  check("tree eye icon shows it again", s.hidden.length === 0);
  await page.click(`.vw-group[data-group="組立品"] .vw-eye`);
  s = await st();
  check("group eye hides the whole level", s.hidden.length === 3);
  await page.click(`.vw-group[data-group="組立品"] .vw-eye`);
  s = await st();
  check("group eye shows the whole level", s.hidden.length === 0);

  // ---------------------------------------------------------- H / I ---
  await page.mouse.click(pinPt.x, pinPt.y);
  s = await st();
  check("click selects the part", s.sel.join() === pin, JSON.stringify(s.sel));
  await key("h");
  s = await st();
  check("H hides the selection", s.hidden.join() === pin);
  await key("Shift+H");
  await page.mouse.click(pinPt.x, pinPt.y);
  await key("i");
  s = await st();
  check("I isolates the selection", s.hidden.length === 2 && !s.hidden.includes(pin) && s.on[pinPt.bi], JSON.stringify(s.hidden));
  await key("Shift+H");

  // ---------------------------------------------------------- multi-select ---
  const pin2Pt = await topPoint("Pin-M6:2");
  await page.mouse.click(pinPt.x, pinPt.y);
  await page.keyboard.down("Control");
  await page.mouse.click(pin2Pt.x, pin2Pt.y);
  await page.keyboard.up("Control");
  s = await st();
  check("Ctrl+click adds to the selection", s.sel.length === 2, JSON.stringify(s.sel));
  await page.mouse.click(pinPt.x, pinPt.y, { button: "right" });
  await page.click(menuItem("非表示"));
  s = await st();
  check("menu acts on the whole selection", s.hidden.length === 2, JSON.stringify(s.hidden));
  await key("Shift+H");
  const r = await page.evaluate(() => {
    const b = window.cad.vp.el.getBoundingClientRect();
    return { l: b.left, t: b.top, r: b.right, b: b.bottom };
  });
  await page.mouse.click(r.l + 30, r.b - 40); // empty background: clears
  await page.mouse.move(r.l + 30, r.t + 30);
  await page.mouse.down();
  await page.mouse.move(r.l + 300, r.t + 200, { steps: 4 });
  await page.mouse.move(r.r - 160, r.b - 40, { steps: 4 });
  await page.mouse.up();
  s = await st();
  check("box selection selects the parts inside", s.sel.length === 3, JSON.stringify(s.sel));
  await key("Escape");

  // ---------------------------------------------------------- Alt+click ---
  await page.evaluate(() => {
    window.cad.vp.setStandardView([1, -1, 0.6], false);
    window.cad.vp.fitAll(false);
  });
  await page.waitForTimeout(200);
  const layered = await page.evaluate(() => {
    const vp = window.cad.vp, b = vp.el.getBoundingClientRect(), kinds = new Set(["face"]);
    for (let y = b.top + 20; y < b.bottom - 20; y += 6)
      for (let x = b.left + 20; x < b.right - 20; x += 6) {
        const a = vp.pick({ clientX: x, clientY: y }, kinds);
        if (!a || a.body < 0) continue;
        vp.setBodyVisible(a.body, false);
        const c = vp.pick({ clientX: x, clientY: y }, kinds);
        vp.setBodyVisible(a.body, true);
        if (c && c.body >= 0 && c.body !== a.body) return { x, y, front: a.body, back: c.body };
      }
    return null;
  });
  check("found a point with one part behind another", !!layered, JSON.stringify(layered));
  if (layered) {
    await page.keyboard.down("Alt");
    await page.mouse.click(layered.x, layered.y);
    await page.keyboard.up("Alt");
    s = await st();
    check("Alt+click hides the front part for the moment and selects the one behind", s.sel.join() === `b${layered.back}` && s.on[layered.front] === false && s.hidden.length === 0, JSON.stringify(s));
    await key("Escape");
    s = await st();
    check("Esc shows the front part again", s.on[layered.front] === true);
  }
  await page.evaluate(() => {
    window.cad.vp.anim = null;
    window.cad.vp.setStandardView([0, 0, 1], false);
    window.cad.vp.fitAll(false);
  });
  await page.waitForTimeout(200);
  pinPt = await topPoint("Pin-M6:1");
  check("pin pickable again after the view change", pinPt.ok);

  // ---------------------------------------------------------- hidden-items panel ---
  await page.mouse.click(pinPt.x, pinPt.y, { button: "right" });
  await page.click(menuItem("非表示"));
  await page.click('[data-cmd="view-hidden"]');
  await page.waitForSelector("#hidden-panel .hidden-row");
  const rows = await page.$$eval("#hidden-panel .hidden-row", (e) => e.map((x) => x.textContent));
  check("hidden-items panel lists the hidden part", rows.length === 1 && rows[0].includes("Pin-M6:1"), JSON.stringify(rows));
  await page.click(`#hidden-panel .hidden-row[data-item="${pin}"] .hidden-show`);
  s = await st();
  const rows2 = await page.$$eval("#hidden-panel .hidden-row", (e) => e.length);
  check("restore from the panel", s.hidden.length === 0 && s.on[pinPt.bi] && rows2 === 0);
  await page.click("#hidden-panel .fp-close");
  pinPt = await topPoint("Pin-M6:1");

  // ---------------------------------------------------------- transparency / colour ---
  await page.mouse.click(pinPt.x, pinPt.y, { button: "right" });
  await page.click(menuItem("この部品を半透明に"));
  const plPt = await page.evaluate((id) => {
    const cad = window.cad;
    const bi = Number(id.slice(1));
    const b = cad.bodies[bi];
    const p = cad.vp.worldToScreen([b.bbox[0][0] + 2, b.bbox[0][1] + 2, b.bbox[1][2]]);
    return p;
  }, plate);
  await page.mouse.click(plPt.x, plPt.y, { button: "right" });
  await page.click(menuItem("色を変える…"));
  await page.click('.vw-palette .vw-swatch[data-color="#5cb85c"]');
  s = await st();
  const op = await page.evaluate((bi) => window.cad.vp.bodyOpacity.get(bi), pinPt.bi);
  check("この部品を半透明に / 色を変える", s.transparent.join() === pin && s.colors[plate] === "#5cb85c" && op < 1, JSON.stringify({ t: s.transparent, c: s.colors, op }));

  // ---------------------------------------------------------- saved view ---
  const pin2 = await bodyId("Pin-M6:2");
  await page.evaluate((id) => window.cad.viewCtx.hide([id]), pin2);
  const saved = await st();
  await page.click('[data-cmd="view-states"]');
  await page.waitForSelector("#views-panel .views-save");
  await page.click("#views-panel .views-save");
  await page.waitForSelector(".modal input.field-input");
  await page.fill(".modal input.field-input", "E2E 表示");
  await page.keyboard.press("Enter");
  await page.waitForSelector('#views-panel .view-row');
  await key("Shift+H");
  await page.evaluate(() => window.cad.viewCtx.setColor(["b0", "b1", "b2"], null));
  const cleared = await st();
  check("display state changed before recall", cleared.hidden.length === 0 && Object.keys(cleared.colors).length === 0);
  await page.click("#views-panel .view-row .view-name");
  await page.waitForTimeout(600);
  const rec = await st();
  check("recalled view restores hidden / transparent / colours", JSON.stringify([rec.hidden, rec.transparent, rec.colors]) === JSON.stringify([saved.hidden, saved.transparent, saved.colors]), JSON.stringify({ rec, saved }));
  await key("Control+z");
  const un = await st();
  check("recalling a view is undoable", un.hidden.length === 0 && Object.keys(un.colors).length === 0, JSON.stringify(un));
  await page.click("#views-panel .fp-close");
  await key("Shift+H");

  // ---------------------------------------------------------- properties / section ---
  await page.mouse.click(pinPt.x, pinPt.y, { button: "right" });
  await page.click(menuItem("プロパティ"));
  await page.waitForSelector("#vw-props-panel");
  await page.waitForFunction(() => !/計算中/.test(document.querySelector("#vw-props-panel")?.textContent ?? ""), null, { timeout: 30000 }).catch(() => {});
  const props = await page.$eval("#vw-props-panel", (e) => e.textContent);
  check("プロパティ: name, material, mass and size", /Pin-M6:1/.test(props) && /材質/.test(props) && /質量/.test(props) && /× .* ×/.test(props), props.slice(0, 200));
  await page.click("#vw-props-panel .fp-close");
  await page.mouse.click(pinPt.x, pinPt.y, { button: "right" });
  await page.click(menuItem("断面をここで切る"));
  await page.waitForTimeout(200);
  const sec = await page.evaluate(() => ({ panel: !!document.querySelector("[data-testid=section-panel]"), planes: window.cad.vp.sectionPlanes().map((p) => [p.normal.x, p.normal.y, p.normal.z].map((v) => Math.round(v))) }));
  check("断面をここで切る: a Z section through the picked top face", sec.panel && sec.planes.length === 1 && Math.abs(sec.planes[0][2]) === 1, JSON.stringify(sec));
  await page.evaluate(() => window.cad.toggleSectionView());
  check("viewer: still not modified after all view operations", (await st()).dirty === false);

  // ---------------------------------------------------------- normal (editing) part mode ---
  await page.mouse.move(700, 600);
  await page.click(".tb-edit-mode");
  await page.waitForTimeout(500);
  await settle();
  const pinPt2 = await topPoint("Pin-M6:1");
  await page.mouse.click(pinPt2.x, pinPt2.y, { button: "right" });
  await page.waitForSelector(".marking .mk-overflow", { timeout: 5000 });
  const ov = await page.$$eval(".marking .mk-overflow .ctx-label", (e) => e.map((x) => x.textContent));
  check("editing mode: marking menu keeps the editing items and adds a 「表示」 section", ov.includes("iProperties") && ov.includes("表示") && ov.includes("非表示") && ov.includes("この部品だけ表示 (分離)"), ov.join(","));
  // the overflow list may extend below the window at this cursor position: click it directly
  await page.$eval('.marking .mk-overflow .ctx-item:has(.ctx-label:text-is("非表示"))', (b) => b.click());
  s = await st();
  check("editing mode: 非表示 from the marking menu", s.hidden.join() === pin && s.on[pinPt2.bi] === false, JSON.stringify(s.hidden));
  await key("Control+z");
  s = await st();
  check("editing mode: Ctrl+Z undoes the view step first", s.hidden.length === 0 && s.on[pinPt2.bi] === true);
  check("editing mode: the model is kept (3 bodies)", (await page.evaluate(() => window.cad.bodies.length)) === 3);

  check("no page errors", errors.length === 0, errors.join(" | "));
} catch (e) {
  console.error(e);
  failed++;
} finally {
  await browser.close();
  await server.close();
}
console.log(failed ? `${failed} check(s) failed` : "all viewer right-click checks passed");
process.exit(failed ? 1 : 0);
