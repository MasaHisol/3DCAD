// Bridge between the CAD app and the separate textbook page (textbook.html).

/** Chapter titles for links (kept in sync with src/textbook/content by tests/learn.test.ts). */
export const TEXTBOOK_TITLES: Record<string, string> = {
  process: "設計とは何か",
  concept: "要求仕様と構想設計",
  drawing: "機械製図の基礎",
  tolerance: "公差とはめあい",
  materials: "材料の選び方",
  fastening: "締結 — ねじとボルト",
  statics: "力とモーメントのつり合い",
  stress: "応力とひずみ",
  bending: "はりの曲げ",
  section: "断面の形と剛性",
  torsion: "ねじりと伝動軸",
  buckling: "座屈",
  fatigue: "応力集中と疲労",
  safety: "安全率と許容応力",
  "dfm-machining": "切削加工を考えた設計",
  "dfm-sheet": "板金と溶接の設計",
  "dfm-molding": "樹脂成形品の設計",
  "dfm-3dp": "3D プリントのための設計",
  dfa: "組立性の設計とポカヨケ",
  "cad-practice": "3D CAD モデリングの作法",
  review: "設計レビューとよくある失敗",
  form: "形と比率",
  ergonomics: "人間工学",
  cmf: "色・素材・仕上げ",
  ucd: "ユーザ中心設計とプロトタイピング",
};

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
export function listenForLessons(start: (id: string) => boolean) {
  try {
    const ch = new BroadcastChannel("3dcad-learn");
    ch.onmessage = (e) => {
      const d = e.data as { type?: string; id?: string };
      if (d?.type === "start-lesson" && d.id && start(d.id)) {
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
    setTimeout(() => start(decodeURIComponent(m[1])), 300);
  }
}
