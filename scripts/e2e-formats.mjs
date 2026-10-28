// End-to-end check of the exchange formats: opens every sample in
// tests/fixtures in the built app (like a double-clicked file), checks what is
// shown and measures a known distance on it.
//   npm run build && npm run e2e:formats
// CHROMIUM_PATH: Chromium binary, E2E_PORT: preview port (default 4175).
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { preview } from "vite";
import { chromium } from "playwright";

const port = +(process.env.E2E_PORT || 4175);
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
  await page.waitForTimeout(400);
};
const fixture = (name) => readFileSync(new URL(`../tests/fixtures/${name}`, import.meta.url)).toString("base64");

/** Opens a sample as if it was double-clicked (the desktop app passes the bytes the same way). */
const open = async (name) => {
  await page.evaluate(
    async ([name, b64]) => {
      const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
      await window.cad.openOrImport(new File([bytes], name));
    },
    [name, fixture(name)],
  );
  await settle();
};
const newPart = async () => {
  await page.evaluate(async () => {
    window.cad.store.dirty = false;
    window.cad.asm.store.dirty = false;
    for (const r of [...window.cad.vp.refModels]) window.cad.vp.removeRefModel(r.id);
    document.getElementById("ref-models-panel")?.remove();
    await window.cad.newDocument();
  });
  await settle();
};
/** Kernel distance between the two planar faces with normals -X / +X of body `bi`. */
const faceDistanceX = (bi = 0) =>
  page.evaluate(async (bi) => {
    const faces = window.cad.bodies[bi].faces;
    const a = faces.findIndex((f) => f.type === "PLANE" && f.normal[0] < -0.99);
    const b = faces.findIndex((f) => f.type === "PLANE" && f.normal[0] > 0.99);
    const r = await window.cad.kernel.measure({ body: bi, kind: "face", index: a }, { body: bi, kind: "face", index: b });
    return r.distance;
  }, bi);
/** Measure command on reference data: clicks two world points (top view) and reads the result panel. */
const measurePoints = async (p1, p2) => {
  await page.evaluate(() => {
    document.getElementById("ref-models-panel")?.remove();
    window.cad.vp.setStandardView([0, 0, 1], false);
    window.cad.vp.fitAll(false);
    window.cad.commands.run("measure");
  });
  await page.waitForTimeout(400);
  for (const p of [p1, p2]) {
    const s = await page.evaluate((p) => window.cad.vp.worldToScreen(p), p);
    await page.mouse.move(s.x, s.y);
    await page.waitForTimeout(80);
    await page.mouse.click(s.x, s.y);
    await page.waitForTimeout(250);
  }
  const text = await page.locator(".measure-out").innerText();
  await page.keyboard.press("Escape");
  await page.waitForTimeout(200);
  const m = /距離\s*([\d.]+) mm/.exec(text);
  if (!m) console.log("  measure output:", JSON.stringify(text));
  return m ? +m[1] : NaN;
};

try {
  await page.goto(url);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForFunction(() => window.cad);
  await page.mouse.click(5, 5);
  await page.waitForTimeout(500);


  // STEP with names, colours and an assembly structure (part environment: one body per instance)
  await newPart();
  await open("assembly-colors.step");
  const st = await page.evaluate(() => window.cad.bodies.map((b) => ({ name: b.name, color: b.color })));
  check(
    "STEP: names and colours",
    st.length === 3 && st.some((b) => b.name === "Pin-M6:2" && b.color === "#cc3300") && st.some((b) => b.name === "プレート:1" && b.color === "#336699"),
    JSON.stringify(st),
  );
  const plate = st.findIndex((b) => b.name === "プレート:1");
  check("STEP: measure plate length", Math.abs((await faceDistanceX(plate)) - 40) < 1e-6, `${await faceDistanceX(plate)} mm`);

  // STEP into an assembly: one part per product, instances placed
  await page.evaluate(async () => {
    window.cad.store.dirty = false;
    await window.cad.newAssembly();
  });
  await settle();
  await open("assembly-colors.step");
  await page.waitForTimeout(1500);
  await settle();
  const asm = await page.evaluate(() => ({ parts: window.cad.asm.doc.parts.map((p) => p.name).sort(), comps: window.cad.asm.doc.components.map((c) => [c.name, c.matrix[12]]) }));
  check(
    "STEP: assembly structure (parts + placed instances)",
    asm.parts.join() === ["Pin-M6", "プレート"].join() && asm.comps.length === 3 && asm.comps.some(([n, x]) => n === "Pin-M6:2" && Math.abs(x - 10) < 1e-6),
    JSON.stringify(asm),
  );

  // IGES (trimmed NURBS faces, block with a hole), through the import file dialog
  await newPart();
  const chooser = page.waitForEvent("filechooser");
  await page.evaluate(() => void window.cad.importFile());
  const fc = await chooser;
  const accept = await fc.element().evaluate((el) => el.accept);
  check("import dialog lists the new formats", [".igs", ".iges", ".gltf", ".glb", ".ply", ".e57", ".ifc"].every((x) => accept.split(",").includes(x)), accept);
  await fc.setFiles(fileURLToPath(new URL("../tests/fixtures/sample.igs", import.meta.url)));
  await settle();
  await page.waitForFunction(() => window.cad.bodies.length > 0, null, { timeout: 60000 });
  const ig = await page.evaluate(async () => ({ bodies: window.cad.bodies.map((b) => [b.name, b.color]), volume: (await window.cad.kernel.massProps()).volume }));
  check("IGES: solid with name and colour", ig.bodies.length === 1 && ig.bodies[0][0] === "IGES-Block" && ig.bodies[0][1] === "#3a7bd5" && Math.abs(ig.volume - (8000 - Math.PI * 160)) < 1, JSON.stringify(ig));
  check("IGES: measure", Math.abs((await faceDistanceX()) - 40) < 1e-4, `${await faceDistanceX()} mm`);

  // glTF (text, embedded buffer) and GLB
  for (const f of ["sample.gltf", "sample.glb"]) {
    await newPart();
    await open(f);
    const n = await page.evaluate(() => window.cad.bodies.length);
    const d = n ? await faceDistanceX() : NaN;
    check(`glTF: ${f} opens as a solid and measures`, n === 1 && Math.abs(d - 40) < 1e-3, `${d} mm`);
  }

  // PLY point cloud (no faces): reference data, measured point to point
  await newPart();
  await open("cloud.ply");
  const ply = await page.evaluate(() => window.cad.vp.refModels.map((r) => [r.kind, r.count]));
  check("PLY: point cloud shown", ply.length === 1 && ply[0][0] === "points" && ply[0][1] === 231, JSON.stringify(ply));
  check("PLY: panel with size / colour controls", (await page.locator("#ref-models-panel input[type=range]").count()) === 1 && (await page.locator("#ref-models-panel input[type=color]").count()) === 1);
  await page.evaluate(() => window.cad.vp.setRefModelStyle(window.cad.vp.refModels[0].id, { pointSize: 6 }));
  const dPly = await measurePoints([0, 0, 0], [100, 50, 0]);
  check("PLY: measure between two points", Math.abs(dPly - Math.hypot(100, 50)) < 0.01, `${dPly} mm`);

  // E57 (scaled integers, intensity, pose +10 mm in X)
  await newPart();
  await open("cloud.e57");
  const e57 = await page.evaluate(() => window.cad.vp.refModels.map((r) => [r.kind, r.count]));
  check("E57: point cloud shown", e57.length === 1 && e57[0][1] === 231, JSON.stringify(e57));
  const dE57 = await measurePoints([10, 0, 0], [110, 50, 0]);
  check("E57: measure between two points", Math.abs(dE57 - Math.hypot(100, 50)) < 0.01, `${dE57} mm`);

  // IFC (web-ifc, loaded on demand): wall 4000 x 200 x 2500 on a slab
  await newPart();
  await open("building.ifc");
  const toasts = await page.evaluate(() => [...document.querySelectorAll(".toast")].map((t) => t.textContent));
  const ifc = await page.evaluate(() => {
    const r = window.cad.vp.refModels[0];
    const box = window.cad.vp.modelBounds();
    return { kind: r?.kind, tris: r?.count, zmax: box.max.z, zmin: box.min.z };
  });
  check("IFC: building shown (Z up, mm)", ifc.kind === "mesh" && ifc.tris > 0 && Math.abs(ifc.zmax - 2500) < 1 && Math.abs(ifc.zmin + 200) < 1, JSON.stringify({ ...ifc, toasts }));
  const dIfc = await measurePoints([300, 100, 2500], [3700, 100, 2500]);
  check("IFC: measure on the wall top", Math.abs(dIfc - 3400) < 2, `${dIfc} mm`);
} catch (e) {
  check("run", false, e.message);
} finally {
  check("no page errors", errors.length === 0, errors.join("; "));
  await browser.close();
  await server.close();
}
process.exit(failed ? 1 : 0);
