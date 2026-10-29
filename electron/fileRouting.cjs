// Which files open in the viewer-only mode (pure helpers shared by the Electron main
// process and the tests). Keep VIEWER_EXTS in sync with src/ui/viewerMode.ts and the
// "3DCAD Viewer" entries of build.fileAssociations in package.json (tests/viewerMode.test.ts).
const path = require("node:path");

/** Other CAD / mesh / point cloud formats: double-click opens them in the viewer mode. */
const VIEWER_EXTS = [".stp", ".step", ".igs", ".iges", ".gltf", ".glb", ".stl", ".obj", ".3mf", ".ply", ".e57", ".ifc", ".dxf"];
/** The app's own documents: they open in the full editing mode. */
const NATIVE_EXTS = [".3dcp", ".3dca", ".json"];

const ext = (f) => path.extname(String(f)).toLowerCase();
const isViewerFile = (f) => VIEWER_EXTS.includes(ext(f));
const isOpenable = (f) => isViewerFile(f) || NATIVE_EXTS.includes(ext(f));

/** File arguments of a command line (skips the executable / script and switches). */
function fileArgs(argv, packaged) {
  return argv.slice(packaged ? 1 : 2).filter((a) => !String(a).startsWith("-") && isOpenable(a));
}

/**
 * Start-up mode: "viewer" with --viewer, or when every file the app was launched with is a
 * non-native format (a STEP / STL … was double-clicked); otherwise "edit".
 */
function launchMode(argv, files) {
  if (argv.includes("--viewer")) return "viewer";
  if (argv.includes("--edit")) return "edit";
  return files.length > 0 && files.every(isViewerFile) ? "viewer" : "edit";
}

module.exports = { VIEWER_EXTS, NATIVE_EXTS, isViewerFile, isOpenable, fileArgs, launchMode };
