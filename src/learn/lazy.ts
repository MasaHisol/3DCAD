// Entry points of the learning center that load it on first use: the
// curriculum, tutor and glossary stay out of the CAD window's startup bundle.
import type { App } from "../app";

export function openLearningCenter(app: App) {
  void import("./center").then((m) => m.openLearningCenter(app));
}

export async function startLessonById(app: App, id: string): Promise<boolean> {
  return (await import("./center")).startLessonById(app, id);
}
