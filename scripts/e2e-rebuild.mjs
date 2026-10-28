// End-to-end: incremental rebuild and parallel part rebuild (stage 1.5, engine #3).
//  1. a long part (60 features) in the main kernel worker: editing the last
//     feature only re-evaluates it, quickly, and equals a full rebuild;
//  2. an assembly of many distinct parts: first open one by one in the main
//     worker vs in the worker pool (timings printed), same meshes, and kernel
//     operations (interference) still work after the pool open.
//   npm run build && node scripts/e2e-rebuild.mjs
import { preview } from "vite";
import { chromium } from "playwright";

const port = Number(process.env.E2E_PORT || 4174);
const VARIANTS = Number(process.env.E2E_ASM_VARIANTS || 8);
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

  // ---------------------------------------------------------------- part
  const part = await page.evaluate(async () => {
    const XY = { origin: [0, 0, 0], xDir: [1, 0, 0], normal: [0, 0, 1] };
    const rect = (x, y, w, h) => {
      const p = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
      return { outer: p.map((a, i) => ({ t: "line", a, b: p[(i + 1) % 4] })), holes: [] };
    };
    const top = () => ({ ...XY, origin: [0, 0, 20] });
    const fs = [{ id: "base", type: "extrude", plane: XY, regions: [rect(0, 0, 300, 160)], op: "new", from: 0, to: 20, through: false, flip: false }];
    for (let k = 0; k < 54; k++) {
      const x = 12 + (k % 20) * 14, y = 12 + Math.floor(k / 20) * 34;
      const kind = k % 4;
      if (kind === 0) fs.push({ id: `pk${k}`, type: "extrude", plane: top(), regions: [rect(x - 4, y - 4, 8, 8)], op: "cut", from: -5, to: 1, through: false, flip: false });
      else if (kind === 1) fs.push({ id: `bs${k}`, type: "extrude", plane: top(), regions: [rect(x - 3, y - 3, 6, 6)], op: "join", from: 0, to: 4, through: false, flip: false });
      else if (kind === 2) fs.push({ id: `h${k}`, type: "hole", plane: top(), points: [[x, y]], holeType: "simple", diameter: 4, depth: 8, through: false, cbDiameter: 0, cbDepth: 0, csDiameter: 0, csAngle: 90, flip: false });
      else fs.push({ id: `pt${k}`, type: "pattern", sources: [`h${k - 1}`], transforms: [{ translate: [0, 12, 0] }, { translate: [0, 22, 0] }] });
    }
    [[0, 0], [300, 0], [300, 160], [0, 160]].forEach(([x, y], i) => fs.push({ id: `fl${i}`, type: "fillet", edges: [{ mid: [x, y, 10] }], radius: 3 }));
    fs.push({ id: "last", type: "extrude", plane: top(), regions: [rect(140, 150, 20, 6)], op: "cut", from: -2, to: 1, through: false, flip: false });
    const k = window.cad.kernel;
    let t0 = performance.now();
    await k.rebuild(fs);
    const cold = performance.now() - t0;
    const edited = fs.map((f) => (f.id === "last" ? { ...f, to: 1.5, from: -3 } : f));
    t0 = performance.now();
    const r = await k.rebuild(edited);
    const late = performance.now() - t0;
    const inc = await k.massProps();
    // full rebuild of the same features in a fresh engine
    const fr = await k.rebuildKey("verify-full", edited);
    const ref = await k.massPropsKey("verify-full");
    await k.dropEngine("verify-full");
    const names = (res) => JSON.stringify(res.bodies.map((b) => [b.faces.length, b.edges.length, b.faceNames, b.edgeNames]));
    return { n: fs.length, cold, late, stats: r.stats, errors: Object.keys(r.errors), v: inc.volume, vf: ref.volume, same: names(r) === names(fr) };
  });
  console.log(`  part: ${part.n} features, full ${Math.round(part.cold)} ms, edit last ${Math.round(part.late)} ms (${part.stats?.recomputed}/${part.stats?.features} evaluated)`);
  check("long part builds without errors", part.errors.length === 0, part.errors.join());
  check("editing the last feature re-evaluates only it", part.stats?.recomputed === 1, JSON.stringify(part.stats && { first: part.stats.first, recomputed: part.stats.recomputed }));
  check("late edit is fast (< 1/3 of a full rebuild)", part.late < part.cold / 3, `${Math.round(part.late)} vs ${Math.round(part.cold)} ms`);
  check("incremental result equals a full rebuild", part.same && Math.abs(part.v - part.vf) < 1e-6 * part.vf, `volume ${part.v.toFixed(3)} / ${part.vf.toFixed(3)}`);

  // ------------------------------------------------------------ assembly
  await page.evaluate(() => window.cad.loadSampleAssembly());
  await page.waitForFunction(() => window.cad.asm.bodyMap.length >= 3 && !window.cad.asm.loading, null, { timeout: 120000 });
  await page.waitForTimeout(500);
  await page.evaluate((V) => {
    const s = structuredClone(window.cad.asm.doc);
    const bracket = s.parts.find((p) => p.id === "p-bracket"), pin = s.parts.find((p) => p.id === "p-pin");
    const parts = [], components = [];
    for (let k = 0; k < V; k++)
      for (const [base, tag] of [[bracket, "b"], [pin, "p"]]) {
        const doc = structuredClone(base.doc);
        doc.params = [...(doc.params ?? []), { name: `e2e_${tag}${k}`, expr: String(k + 1), unit: "mm", kind: "user" }];
        parts.push({ id: `${tag}${k}`, name: `${base.name}-${k}`, kind: "part", doc });
        components.push({ id: `${tag}c${k}`, name: `${tag}:${k}`, partId: `${tag}${k}`, matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, k * 200, tag === "b" ? 0 : 400, 0, 1], grounded: true });
      }
    window.__asmDoc = { ...s, name: "e2e-rebuild", parts, components, constraints: [], patterns: [] };
  }, VARIANTS);
  // each open uses fresh part ids (nothing reused from the previous open)
  const open = (parallel, tag) =>
    page.evaluate(async ([parallel, tag]) => {
      const a = window.cad.asm;
      a.parallel = parallel;
      const n = window.__asmDoc.components.length;
      const t0 = performance.now();
      const d = structuredClone(window.__asmDoc);
      d.parts.forEach((p) => (p.id = tag + p.id));
      d.components.forEach((c) => (c.partId = tag + c.partId));
      window.cad.loadAssembly(d, "e2e.3dca");
      await new Promise((r) => setTimeout(r, 50));
      for (;;) {
        await new Promise((r) => setTimeout(r, 20));
        if (a.bodyMap.length >= n && !a.loading && !a.updating) break;
        if (performance.now() - t0 > 600000) throw new Error("open timeout");
      }
      const ms = performance.now() - t0;
      const meshes = [...a.parts.entries()].filter(([id]) => id.startsWith(tag)).map(([id, c]) => [id.slice(tag.length), c]).sort(([x], [y]) => (x < y ? -1 : 1)).map(([id, c]) => [id, c.error ?? "", c.bodies.map((b) => [b.faces.length, b.edges.length, b.positions.length])]);
      return { ms, build: a.lastBuild, meshes: JSON.stringify(meshes) };
    }, [parallel, tag]);
  const seq = await open(false, "s-");
  const par = await open(true, "q-");
  console.log(`  assembly: ${VARIANTS * 2} distinct parts, first open sequential ${Math.round(seq.ms)} ms, parallel ${Math.round(par.ms)} ms (${par.build.pooled} parts in the pool)`);
  check("pool built the parts", par.build.pooled === VARIANTS * 2, JSON.stringify(par.build));
  check("pool meshes equal main-worker meshes", seq.meshes === par.meshes);
  check("parallel first open is faster", par.ms < seq.ms, `${Math.round(par.ms)} vs ${Math.round(seq.ms)} ms`);
  const hits = await page.evaluate(async () => {
    await window.cad.asm.ensureBrep();
    const r = await window.cad.kernel.interference(window.cad.asm.placements());
    return { n: r.length, light: window.cad.asm.lightParts().length };
  });
  check("B-rep loaded on demand after the pool open (interference runs)", hits.light === 0, JSON.stringify(hits));
} catch (e) {
  check("run", false, e.stack ?? e.message);
} finally {
  check("no page errors", errors.length === 0, errors.join("; "));
  await browser.close();
  await server.close();
}
process.exit(failed ? 1 : 0);
