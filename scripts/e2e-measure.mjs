// End-to-end: stage 2 measurements in the built app.
// Hole Ø (with counterbore), pitch circle, wall thickness map + probe,
// clearance list, saving measurements as annotations, reloading the page and
// seeing the annotations again (re-resolved through the topology names).
//   npm run build && node scripts/e2e-measure.mjs
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
const close = (a, b, tol = 1e-6) => Math.abs(a - b) <= tol;
const settle = async () => {
  await page.waitForTimeout(300);
  await page.waitForFunction(() => !document.querySelector(".busy.show"));
  await page.waitForTimeout(400);
};

/** Face pick of the cylinder whose axis passes nearest (x, z) with radius r (sample part: Y up). */
const cylPick = (x, z, r) =>
  page.evaluate(
    ([x, z, r]) => {
      const b = window.cad.pickBodies[0];
      let best = -1, bd = Infinity;
      b.faces.forEach((f, i) => {
        if (f.type !== "CYLINDRE" || !f.axis || Math.abs(f.axis.radius - r) > 1e-6) return;
        const d = Math.hypot(f.axis.origin[0] - x, f.axis.origin[2] - z);
        if (d < bd) (bd = d), (best = i);
      });
      return { kind: "face", body: 0, index: best, point: b.faces[best].center };
    },
    [x, z, r],
  );

try {
  await page.goto(`http://localhost:${port}/`);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForFunction(() => window.cad);
  await page.evaluate(() => window.cad.loadSample());
  await page.waitForFunction(() => window.cad.bodies.length > 0, null, { timeout: 60000 });
  await settle();

  // ---- hole Ø: centre bore Ø16 through plate + boss (35), counterbore hole Ø6.6 / Ø11 x 4
  await page.evaluate(() => window.cad.commands.run("measure-hole"));
  const bore = await page.evaluate(async (p) => window.cad.command.measure(p), await cylPick(0, 0, 8));
  check("hole Ø16 through", bore && close(bore.diameter, 16, 1e-9) && bore.through && close(bore.depth, 35, 1e-6), JSON.stringify(bore && { d: bore.diameter, t: bore.through, depth: bore.depth }));
  const cb = await page.evaluate(async (p) => window.cad.command.measure(p), await cylPick(-30, 17.5, 3.3));
  check("counterbore hole Ø6.6 / Ø11 × 4", cb && close(cb.diameter, 6.6, 1e-9) && cb.counterbore && close(cb.counterbore.diameter, 11, 1e-9) && close(cb.counterbore.depth, 4, 2e-3), JSON.stringify(cb && cb.counterbore));
  const rows = await page.locator(".measure-out table").innerText();
  check("hole panel shows Ø", /Ø6\.600/.test(rows) && /座ぐり/.test(rows));
  const n1 = await page.evaluate(() => window.cad.command.save(false));
  check("hole saved as annotation", !!n1 && (await page.evaluate(() => window.cad.measure.group.children.length)) >= 1);
  await page.keyboard.press("Escape");
  await page.evaluate(() => window.cad.finishCommand(window.cad.command, true));

  // ---- PCD: 4 counterbore holes at (±30, ±17.5) -> Ø 2·√(30² + 17.5²)
  await page.evaluate(() => window.cad.commands.run("measure-pcd"));
  const picks = [];
  for (const [x, z] of [[-30, -17.5], [30, -17.5], [30, 17.5], [-30, 17.5]]) picks.push(await cylPick(x, z, 3.3));
  const fit = await page.evaluate(async (ps) => window.cad.command.setPicks(ps), picks);
  const pcd = 2 * Math.hypot(30, 17.5);
  const a = (Math.atan2(17.5, 30) * 360) / Math.PI;
  check("PCD of 4 holes", fit && close(fit.diameter, pcd, 1e-8) && Math.hypot(fit.center[0], fit.center[2]) < 1e-8, `Ø${fit && fit.diameter.toFixed(6)} (theory ${pcd.toFixed(6)})`);
  check("PCD spacing", fit && fit.spacing.every((s) => close(s, a, 1e-6) || close(s, 180 - a, 1e-6)), JSON.stringify(fit && fit.spacing.map((s) => +s.toFixed(4))));
  const n2 = await page.evaluate(() => window.cad.command.save(false));
  check("PCD saved", !!n2);
  await page.evaluate(() => window.cad.finishCommand(window.cad.command, true));

  // ---- wall thickness map + probe: wall between the counterbore (Ø11) and the side face z=25 -> 25 - 17.5 - 5.5 = 2
  await page.evaluate(() => window.cad.commands.run("measure-thickness"));
  const tm = await page.evaluate(async () => {
    const r = await window.cad.command.compute(0);
    return r && { min: r.min, max: r.max, n: r.values.filter(Number.isFinite).length };
  });
  check("thickness map computed", tm && tm.n > 100 && tm.min > 0 && tm.max >= 35 - 1e-6, JSON.stringify(tm));
  check("thickness legend shown", (await page.locator(".measure-legend").count()) === 1);
  const colored = await page.evaluate(() => !!window.cad.vp.bodies[0].mesh.geometry.getAttribute("color"));
  check("thickness colour map on the body", colored);
  const probe = await page.evaluate(async () => {
    const b = window.cad.pickBodies[0];
    const fi = b.faces.findIndex((f) => f.type === "PLANE" && f.normal[2] > 0.99 && Math.abs(f.center[2] - 25) < 1e-6);
    return window.cad.command.probeAt({ kind: "face", body: 0, index: fi, point: [-30, 2, 25] });
  });
  check("thickness probe = 2", close(probe, 2, 1e-6), String(probe));
  const n3 = await page.evaluate(() => window.cad.command.save(false));
  check("thickness probe saved", !!n3 && close(n3.value, 2, 1e-6));
  await page.evaluate(() => window.cad.finishCommand(window.cad.command, true));
  check("colour map removed after closing", !(await page.evaluate(() => !!window.cad.vp.bodies[0].mesh.geometry.getAttribute("color"))));

  // ---- clearance: a second body (box 20 x 20 x 10 at x 50..70) -> 10 mm from the plate side x = 40
  await page.evaluate(() =>
    window.cad.store.mutate("ボックス追加", (d) => {
      d.params.push({ name: "bx", expr: "20", unit: "mm", kind: "model", owner: "bx1" }, { name: "bh", expr: "10", unit: "mm", kind: "model", owner: "bx1" });
      d.features.splice(d.endOfPart, 0, { id: "bx1", type: "box", name: "直方体1", plane: { origin: [0, 0, 0], xDir: [1, 0, 0], normal: [0, 1, 0] }, center: [60, 0], a: "bx", b: "bx", c: "bh", op: "new" });
      d.endOfPart++;
    }),
  );
  await page.waitForFunction(() => window.cad.bodies.length === 2, null, { timeout: 60000 });
  await settle();
  await page.evaluate(() => window.cad.commands.run("measure-clearance"));
  const cl = await page.evaluate(async () => {
    window.cad.command.threshold = 15;
    return window.cad.command.run();
  });
  check("clearance list", cl.length === 1 && close(cl[0].distance, 10, 1e-7) && close(cl[0].pa[0], 40, 1e-4) && close(cl[0].pb[0], 50, 1e-4), JSON.stringify(cl.map((x) => [x.a, x.b, x.distance])));
  await page.evaluate(() => {
    window.cad.command.threshold = 5;
  });
  check("clearance threshold respected", (await page.evaluate(() => window.cad.command.run())).length === 0);
  await page.evaluate(() => {
    window.cad.command.threshold = 15;
  });
  await page.evaluate(() => window.cad.command.run());
  const n4 = await page.evaluate(() => window.cad.command.save(0, false));
  check("clearance saved", !!n4 && close(n4.value, 10, 1e-7));
  await page.evaluate(() => window.cad.finishCommand(window.cad.command, true));

  // ---- general measure: two faces -> distance with closest points, angle; units toggle
  await page.evaluate(() => window.cad.commands.run("measure"));
  const pr = await page.evaluate(async () => {
    const b = window.cad.pickBodies[0];
    const top = b.faces.findIndex((f) => f.type === "PLANE" && f.normal[1] > 0.99 && Math.abs(f.center[1] - 10) < 1e-6);
    const side = b.faces.findIndex((f) => f.type === "PLANE" && f.normal[2] > 0.99);
    return window.cad.command.pickRefs([{ kind: "face", body: 0, index: top, point: b.faces[top].center }, { kind: "face", body: 0, index: side, point: b.faces[side].center }]);
  });
  check("angle between faces = 90°", pr && close(pr.angle, 90, 1e-9), String(pr && pr.angle));
  await page.evaluate(() => window.cad.measure.setFormat({ unit: "inch", precision: 4 }));
  const inchText = await page.evaluate(() => window.cad.measure.group.children.map((g) => g.children.find((c) => c.element)?.element.textContent).join(" | "));
  check("inch display", /Ø0\.2598 in/.test(inchText), inchText);
  await page.evaluate(() => window.cad.measure.setFormat({ unit: "mm", precision: 3 }));
  await page.evaluate(() => window.cad.finishCommand(window.cad.command, true));

  // ---- annotations: listed, CSV, persisted, re-displayed after reload
  const before = await page.evaluate(() => window.cad.store.doc.measureNotes.map((n) => ({ name: n.name, kind: n.kind, value: n.value })));
  check("4 annotations stored in the document", before.length === 4, JSON.stringify(before.map((n) => n.kind)));
  await page.evaluate(() => window.cad.commands.run("measure-notes"));
  check("annotation panel lists them", (await page.locator(".measure-notes tr").count()) === 4);
  const [dl] = await Promise.all([page.waitForEvent("download"), page.locator('[data-measure="csv"]').click()]);
  const csv = (await import("node:fs")).readFileSync(await dl.path(), "utf8");
  check("CSV export", /名前,種類,値,単位,状態/.test(csv) && csv.trim().split("\n").length === 5 && /69\.462/.test(csv), JSON.stringify(csv.slice(0, 80)));
  await page.evaluate(() => window.cad.finishCommand(window.cad.command, true));

  await page.evaluate(() => (window.cad.store.dirty = false));
  await page.waitForTimeout(1800);
  await page.reload();
  await page.waitForFunction(() => window.cad && window.cad.bodies.length === 2, null, { timeout: 60000 });
  await page.waitForFunction(() => window.cad.measure.reresolved > 0, null, { timeout: 30000 });
  await settle();
  const after = await page.evaluate(() => ({
    notes: (window.cad.store.doc.measureNotes ?? []).map((n) => ({ kind: n.kind, value: n.value, broken: !!n.broken })),
    labels: [...document.querySelectorAll(".measure-note")].map((e) => e.textContent),
  }));
  check("annotations re-displayed after reload", after.notes.length === 4 && after.labels.length === 4, JSON.stringify(after.labels));
  check("annotations re-resolved, none broken", after.notes.every((n) => !n.broken), JSON.stringify(after.notes));
  check("annotation values kept", close(after.notes.find((n) => n.kind === "pcd").value, pcd, 1e-8) && close(after.notes.find((n) => n.kind === "hole").value, 6.6, 1e-9));

  // ---- upstream edit: hole Ø 6.6 -> 9 re-measures the note; deleting the box breaks the clearance note
  await page.evaluate(() =>
    window.cad.store.mutate("穴径", (d) => {
      const h = d.features.find((f) => f.id === "ho2");
      d.params.find((p) => p.name === h.diameter).expr = "9";
    }),
  );
  const r0 = await page.evaluate(() => window.cad.measure.reresolved);
  await page.waitForFunction((r) => window.cad.measure.reresolved > r, r0, { timeout: 60000 });
  const hole9 = await page.evaluate(() => window.cad.store.doc.measureNotes.find((n) => n.kind === "hole"));
  check("hole annotation follows the edit", close(hole9.value, 9, 1e-9) && !hole9.broken, String(hole9.value));
  const r1 = await page.evaluate(() => window.cad.measure.reresolved);
  await page.evaluate(() =>
    window.cad.store.mutate("ボックス削除", (d) => {
      d.features = d.features.filter((f) => f.id !== "bx1");
      d.endOfPart--;
    }),
  );
  await page.waitForFunction((r) => window.cad.measure.reresolved > r, r1, { timeout: 60000 });
  await settle();
  const broken = await page.evaluate(() => window.cad.store.doc.measureNotes.filter((n) => n.broken).map((n) => n.kind));
  check("clearance annotation flagged broken", broken.length === 1 && broken[0] === "clearance", JSON.stringify(broken));
  check("broken label shown", (await page.locator(".measure-note.lost").count()) === 1);
} catch (e) {
  check("run", false, e.message);
} finally {
  check("no page errors", errors.length === 0, errors.join("; "));
  await browser.close();
  await server.close();
}
process.exit(failed ? 1 : 0);
