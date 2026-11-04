// The full opencascade.js build is loaded through a Vite alias (see vite.config.ts)
// so TypeScript does not parse its 9 MB declaration file; it is used untyped in ext.ts.
declare module "occt-full/opencascade.full.js" {
  const init: (module?: { locateFile?: (path: string) => string }) => Promise<unknown>;
  export default init;
}
declare module "occt-full/opencascade.full.wasm?url" {
  const url: string;
  export default url;
}
