import { defineConfig } from "vite";

// Cross-origin isolation: lets the analysis use SharedArrayBuffer for its
// multi-core solver (the desktop app sends the same headers from app://).
const isolation = { "Cross-Origin-Opener-Policy": "same-origin", "Cross-Origin-Embedder-Policy": "require-corp" };

export default defineConfig({
  base: "./",
  optimizeDeps: { exclude: ["replicad-opencascadejs"] },
  worker: { format: "es" },
  server: { headers: isolation },
  preview: { headers: isolation },
  build: { target: "es2022", chunkSizeWarningLimit: 4000, rollupOptions: { input: { main: "index.html", textbook: "textbook.html" } } },
  test: { environment: "node", include: ["tests/**/*.test.ts"] },
});
