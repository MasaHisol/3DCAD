// 閲覧専用モード: 起動の判定 (URL / コマンドライン / ダブルクリックしたファイルの形式)、
// 閲覧タブのコマンド一覧、関連付けの設定の整合。
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";
import { EDIT_ONLY, NATIVE_EXTS, VIEWER_EXTS, VIEWER_PANELS, fileExt, isViewerFile, registerViewerCommand, viewerAllowsKey, viewerCommandIds, viewerRequested } from "../src/ui/viewerMode";
import { RIBBON_SOURCES, ribbonSection, scanRibbonIds } from "../src/help/scan";
import { IMPORT_EXTS } from "../src/app";

const require = createRequire(import.meta.url);
const routing = require("../electron/fileRouting.cjs") as {
  VIEWER_EXTS: string[];
  NATIVE_EXTS: string[];
  isViewerFile(f: string): boolean;
  isOpenable(f: string): boolean;
  fileArgs(argv: string[], packaged: boolean): string[];
  launchMode(argv: string[], files: string[]): "viewer" | "edit";
};
const pkg = JSON.parse(readFileSync("package.json", "utf8")) as { build: { fileAssociations: { ext: string | string[]; name: string; role: string }[] } };

describe("file-extension routing", () => {
  it("same viewer formats in the renderer, the Electron main process and the file associations", () => {
    expect([...routing.VIEWER_EXTS].sort()).toEqual(VIEWER_EXTS.map((e) => "." + e).sort());
    expect([...routing.NATIVE_EXTS].sort()).toEqual(NATIVE_EXTS.map((e) => "." + e).sort());
    const assoc = pkg.build.fileAssociations.filter((a) => a.role === "Viewer");
    expect(assoc.flatMap((a) => [a.ext].flat()).sort()).toEqual([...VIEWER_EXTS].sort());
    for (const a of assoc) expect(a.name).toMatch(/^3DCAD Viewer /);
    // every viewer format can also be imported (file dialogs)
    for (const e of VIEWER_EXTS) expect(IMPORT_EXTS.split(",")).toContain("." + e);
  });

  it("classifies files", () => {
    expect(fileExt("C:\\data\\Bracket.STEP")).toBe("step");
    expect(fileExt("noext")).toBe("");
    for (const f of ["a.stp", "b.STEP", "c.igs", "d.glb", "e.gltf", "f.stl", "g.obj", "h.3mf", "i.ply", "j.e57", "k.ifc", "l.dxf"]) {
      expect(isViewerFile(f), f).toBe(true);
      expect(routing.isViewerFile(f), f).toBe(true);
    }
    for (const f of ["part.3dcp", "asm.3dca", "x.json", "y.ipt", "z.txt"]) {
      expect(isViewerFile(f), f).toBe(false);
      expect(routing.isViewerFile(f), f).toBe(false);
    }
    expect(routing.isOpenable("part.3dcp")).toBe(true);
    expect(routing.isOpenable("y.ipt")).toBe(false);
  });

  it("chooses the start-up mode from the command line", () => {
    const dev = ["electron", "."];
    expect(routing.fileArgs([...dev, "--viewer", "/m/a.step", "/m/notes.txt"], false)).toEqual(["/m/a.step"]);
    expect(routing.fileArgs(["3DCAD Studio.exe", "/m/a.3dcp"], true)).toEqual(["/m/a.3dcp"]);
    expect(routing.launchMode([...dev], [])).toBe("edit");
    expect(routing.launchMode([...dev, "--viewer"], [])).toBe("viewer");
    expect(routing.launchMode([...dev, "/m/a.step"], ["/m/a.step"])).toBe("viewer");
    expect(routing.launchMode([...dev, "/m/a.stl", "/m/b.glb"], ["/m/a.stl", "/m/b.glb"])).toBe("viewer");
    expect(routing.launchMode([...dev, "/m/a.3dcp"], ["/m/a.3dcp"])).toBe("edit");
    expect(routing.launchMode([...dev, "/m/a.step", "/m/b.3dca"], ["/m/a.step", "/m/b.3dca"])).toBe("edit");
    expect(routing.launchMode([...dev, "--edit", "/m/a.step"], ["/m/a.step"])).toBe("edit");
  });

  it("reads the URL / argv flag", () => {
    expect(viewerRequested("?viewer=1")).toBe(true);
    expect(viewerRequested("?viewer")).toBe(true);
    expect(viewerRequested("?a=2&viewer=true")).toBe(true);
    expect(viewerRequested("?viewer=0")).toBe(false);
    expect(viewerRequested("")).toBe(false);
    expect(viewerRequested("", ["--viewer"])).toBe(true);
  });
});

describe("viewer command list", () => {
  const known = new Set(RIBBON_SOURCES.flatMap(([f, re]) => scanRibbonIds(ribbonSection(readFileSync(f, "utf8"), re))).map((c) => c.id));

  it("lists existing viewing commands only", () => {
    const ids = viewerCommandIds();
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(known.has(id), `${id} is not a ribbon command`).toBe(true);
      expect(EDIT_ONLY.test(id), `${id} is an editing command`).toBe(false);
    }
    for (const id of ["vw-open", "vw-edit", "measure", "section", "asm-explode", "asm-bom", "iprops", "home", "st-se", "shot", "vw-print"]) expect(ids).toContain(id);
    expect(VIEWER_PANELS.at(-1)!.ids).toEqual(["vw-edit"]);
  });

  it("other modules can add commands", () => {
    const before = viewerCommandIds().length;
    registerViewerCommand("saved-views", "ビュー");
    registerViewerCommand("saved-views", "ビュー");
    registerViewerCommand("measure-clearance");
    expect(viewerCommandIds().length).toBe(before + 2);
    expect(VIEWER_PANELS.find((p) => p.title === "ビュー")!.ids).toEqual(["saved-views"]);
    expect(VIEWER_PANELS.at(-1)!.title).toBe("モード"); // the edit-mode button stays last
    // undo
    VIEWER_PANELS.splice(VIEWER_PANELS.findIndex((p) => p.title === "ビュー"), 1);
    const m = VIEWER_PANELS.find((p) => p.title === "測定・断面")!;
    m.ids.splice(m.ids.indexOf("measure-clearance"), 1);
  });

  it("blocks editing shortcuts", () => {
    const k = (key: string, mod: Partial<{ ctrlKey: boolean; shiftKey: boolean }> = {}) => viewerAllowsKey({ key, ctrlKey: false, metaKey: false, shiftKey: false, altKey: false, ...mod });
    expect(k("m")).toBe(true);
    expect(k("Escape")).toBe(true);
    expect(k("Home")).toBe(true);
    expect(k("F6")).toBe(true);
    expect(k("o", { ctrlKey: true })).toBe(true);
    for (const key of ["e", "s", "f", "h", "q"]) expect(k(key), key).toBe(false);
    expect(k("Delete")).toBe(false);
    expect(k("z", { ctrlKey: true })).toBe(false);
    expect(k("s", { ctrlKey: true })).toBe(false);
  });
});
