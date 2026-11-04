// 使い方ヘルプの入口 (軽量)。本文と画面は初めて開いたときに読み込む。
import type { App } from "../app";

/** Opens the help window on a command's page (`id` = ribbon command id), or the index. */
export async function openHelp(app: App, id?: string | null): Promise<void> {
  const m = await import("./panel");
  m.showHelp(app, id ?? null);
}

/** Ribbon command id under the mouse (for F1 / ?), tracked without touching the ribbon. */
let hovered: string | null = null;
export function trackHoveredCommand() {
  document.addEventListener("mouseover", (e) => {
    const el = (e.target as HTMLElement | null)?.closest?.("[data-cmd]") as HTMLElement | null;
    hovered = el?.dataset.cmd ?? null;
  });
}
export function hoveredCommand(): string | null {
  return hovered;
}
