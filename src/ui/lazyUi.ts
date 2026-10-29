// Editing dialogs that are not needed to view a model (rules, sheet metal, tolerance stack,
// standard parts library): loaded on first use so the start-up (in particular the viewer
// mode) does not parse them.
import type { App } from "../app";

export const openLibrary = (app: App) => void import("../library/dialog").then((m) => m.openLibrary(app));
export const openRules = (app: App) => void import("../rules/ui").then((m) => m.openRules(app));
export const openFamily = (app: App) => void import("../rules/ui").then((m) => m.openFamily(app));
export const openFlatPattern = (app: App) => void import("../sheetmetal/ui").then((m) => m.openFlatPattern(app));
export const openSheetStyle = (app: App) => void import("../sheetmetal/ui").then((m) => m.openSheetStyle(app));
export const openToleranceStack = (...a: Parameters<typeof import("../analysis/toleranceUi").openToleranceStack>) =>
  void import("../analysis/toleranceUi").then((m) => m.openToleranceStack(...a));

/** Fetches the editing modules in the background (after start-up, or when leaving the viewer mode). */
export function preloadEditingUi() {
  for (const load of [() => import("../library/dialog"), () => import("../rules/ui"), () => import("../sheetmetal/ui"), () => import("../analysis/toleranceUi")]) void load().catch(() => undefined);
}
