// End-to-end: persistent topology names in the built app.
// A fillet placed on a picked edge keeps the same edge after the sketch
// dimension upstream is changed (stage 1.5, engine #2).
//   npm run build && node scripts/e2e-naming.mjs
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
  await page.goto(`http://localhost:${port}/`);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForFunction(() => window.cad);
  await page.mouse.click(5, 5);

  // 40 x 25 rectangle, extruded 12 mm
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

  // fillet the vertical edge at the (40, 25) corner, picked like the UI does
  await page.evaluate(() => window.cad.commands.run("fillet"));
  const picked = await page.evaluate(() => {
    const b = window.cad.bodies[0];
    let bi = 0;
    const d = (m) => Math.hypot(m[0] - 40, m[1] - 25, m[2] - 6);
    b.edges.forEach((e, i) => d(e.mid) < d(b.edges[bi].mid) && (bi = i));
    const r = window.cad.edgeRef({ kind: "edge", body: 0, index: bi, point: b.edges[bi].mid });
    window.cad.command.update((x) => x.edges.push(r));
    return r;
  });
  await settle();
  await page.keyboard.press("Enter");
  await settle();
  check("picked edge carries a topology name", typeof picked.name === "string" && picked.name.startsWith("E["), picked.name);
  const v1 = (await page.evaluate(() => window.cad.kernel.massProps())).volume;
  const fl = (4 - Math.PI) * 12;
  check("fillet built", Math.abs(v1 - (40 * 25 * 12 - fl)) < 1e-2, `volume=${v1.toFixed(2)}`);

  // upstream edit: the rectangle width 40 -> 90 (sketch dimension parameter)
  await page.evaluate(() =>
    window.cad.store.mutate("寸法変更", (d) => {
      const sk = d.features.find((f) => f.type === "sketch");
      const ps = sk.dimensions.map((x) => d.params.find((q) => q.name === x.param)).filter(Boolean);
      ps.find((q) => q.expr === "40").expr = "90";
    }),
  );
  await settle();
  const after = await page.evaluate(async () => {
    const f = window.cad.store.doc.features.find((x) => x.type === "fillet");
    return { errors: { ...window.cad.featureErrors }, ref: f.edges[0], broken: Object.keys(window.cad.brokenRefs), v: (await window.cad.kernel.massProps()).volume };
  });
  check("no errors / broken references after the upstream edit", Object.keys(after.errors).length === 0 && after.broken.length === 0, JSON.stringify(after.errors));
  check("fillet keeps the same named edge", after.ref.name === picked.name && Math.abs(after.ref.mid[0] - 90) < 1e-6, `${after.ref.name} x=${after.ref.mid[0]}`);
  check("fillet geometry follows", Math.abs(after.v - (90 * 25 * 12 - fl)) < 1e-2, `volume=${after.v.toFixed(2)}`);
} catch (e) {
  check("run", false, e.message);
} finally {
  check("no page errors", errors.length === 0, errors.join("; "));
  await browser.close();
  await server.close();
}
process.exit(failed ? 1 : 0);
