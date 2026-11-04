// Rebuild benchmark (stage 1.5 engine #3). Skipped unless BENCH=1:
//   node scripts/bench-rebuild.mjs [features]
import { beforeAll, describe, it } from "vitest";
import opencascade from "replicad-opencascadejs";
import { setOC } from "replicad";
import { GeometryEngine } from "../src/kernel/geometry";
import type { RFeature } from "../src/kernel/protocol";
import { edit, longModel, nudge } from "./helpers/longModel";

const run = process.env.BENCH === "1";

beforeAll(async () => {
  if (!run) return;
  const OC = await (opencascade as unknown as () => Promise<unknown>)();
  setOC(OC as never);
}, 60000);

describe.skipIf(!run)("rebuild benchmark", () => {
  it("long part: edit last / middle / first, undo, suppress", async () => {
    const N = Number(process.env.BENCH_FEATURES || 60);
    const base = longModel(N);
    const eng = new GeometryEngine();
    const t = async (fs: RFeature[]) => {
      const t0 = performance.now();
      const r = await eng.rebuild(fs);
      if (Object.keys(r.errors).length) throw new Error(JSON.stringify(r.errors));
      return Math.round(performance.now() - t0);
    };
    const rows: Record<string, number> = {};
    rows["full rebuild (cold)"] = await t(base);
    rows["no change"] = await t(base);
    const lastEd = edit(base, "last", (f) => nudge(f));
    rows["(a) edit last feature"] = await t(lastEd);
    const mid = base[Math.floor(base.length / 2)].id;
    const midEd = edit(lastEd, mid, (f) => nudge(f));
    rows[`(b) edit middle feature`] = await t(midEd);
    rows["undo middle edit"] = await t(lastEd);
    rows["redo middle edit"] = await t(midEd);
    const firstEd = edit(midEd, "base", (f) => f.type === "extrude" && (f.to = 21));
    rows["(c) edit first sketch/feature"] = await t(firstEd);
    rows["undo first edit"] = await t(midEd);
    const sup = base[Math.floor(base.length / 2) - 2].id;
    const suppressed = midEd.filter((f) => f.id !== sup);
    rows["suppress middle feature"] = await t(suppressed);
    rows["unsuppress"] = await t(midEd);
    console.log(`BENCH ${base.length} features (${mid} edited)\n` + Object.entries(rows).map(([k, v]) => `  ${k.padEnd(32)} ${String(v).padStart(6)} ms`).join("\n"));
  }, 600000);
});
