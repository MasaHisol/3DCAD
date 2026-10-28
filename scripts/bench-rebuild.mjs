// Part rebuild benchmark (stage 1.5 engine #3): runs tests/bench-rebuild.test.ts in vitest.
//   node scripts/bench-rebuild.mjs [features]
// The assembly first-open timing runs in the browser: node scripts/e2e-rebuild.mjs
import { spawnSync } from "node:child_process";

const n = process.argv[2] || process.env.BENCH_FEATURES || "60";
const r = spawnSync("npx", ["vitest", "run", "tests/bench-rebuild.test.ts", "--silent=false"], {
  stdio: "inherit",
  env: { ...process.env, BENCH: "1", BENCH_FEATURES: n },
});
process.exit(r.status ?? 1);
