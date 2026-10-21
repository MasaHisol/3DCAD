// Bridge between the CAD app and the separate textbook page (textbook.html).

/** Chapter titles for links (kept in sync with src/textbook/content by tests/learn.test.ts). */
export { TEXTBOOK_TITLES } from "./textbookTitles";

/** Open the textbook (in its own window in the desktop app, a new tab in the browser). */
export function openTextbook(chapter?: string) {
  const url = `textbook.html${chapter ? `#/c/${encodeURIComponent(chapter)}` : ""}`;
  window.open(url, "3dcad-textbook");
}

/**
 * Lets the textbook start a lesson in this window: it posts {type: "start-lesson"}
 * on a same-origin BroadcastChannel and we acknowledge. Also handles
 * index.html#lesson=ID (used when no CAD window was open).
 */
export function listenForLessons(start: (id: string) => boolean | Promise<boolean>) {
  try {
    const ch = new BroadcastChannel("3dcad-learn");
    ch.onmessage = async (e) => {
      const d = e.data as { type?: string; id?: string };
      if (d?.type === "start-lesson" && d.id && (await start(d.id))) {
        ch.postMessage({ type: "ack", id: d.id });
        window.focus();
      }
    };
  } catch {
    /* BroadcastChannel unavailable: the hash fallback still works */
  }
  const m = /^#lesson=([\w-]+)$/.exec(location.hash);
  if (m) {
    history.replaceState(null, "", location.pathname + location.search);
    setTimeout(() => void start(decodeURIComponent(m[1])), 300);
  }
}
