import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  optimizeDeps: { exclude: ["replicad-opencascadejs"] },
  worker: { format: "es" },
  build: { target: "es2022", chunkSizeWarningLimit: 4000 },
  test: { environment: "node", include: ["tests/**/*.test.ts"] },
});
