import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

// Cross-origin isolation: lets the analysis use SharedArrayBuffer for its
// multi-core solver (the desktop app sends the same headers from app://).
const isolation = { "Cross-Origin-Opener-Policy": "same-origin", "Cross-Origin-Embedder-Policy": "require-corp" };

export default defineConfig({
  base: "./",
  // extended OpenCascade kernel (full opencascade.js build, loaded on demand: src/kernel/ext.ts)
  resolve: { alias: { "occt-full": fileURLToPath(new URL("./node_modules/opencascade.js/dist", import.meta.url)) } },
  optimizeDeps: { exclude: ["replicad-opencascadejs", "opencascade.js"] },
  worker: { format: "es" },
  server: { headers: isolation },
  preview: { headers: isolation },
  build: { target: "es2022", chunkSizeWarningLimit: 4000, rollupOptions: { input: { main: "index.html", textbook: "textbook.html" } } },
  test: { environment: "node", include: ["tests/**/*.test.ts"] },
});
