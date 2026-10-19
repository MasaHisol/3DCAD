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
  vibration: "振動と固有振動数",
  heat: "熱の設計 — 膨張と放熱",
  bearings: "軸受",
  gears: "歯車",
  springs: "ばね",
  keys: "キー・ピン・止め輪・軸継手",
  belts: "ベルト・チェーン・ねじ送り",
  mechanisms: "機構 — リンクとカム",
  "fea-practice": "解析 (FEA) を正しく使う",
  treatment: "熱処理と表面処理",
  cost: "コストの見積もりと工法の選択",
  "safety-design": "安全設計とリスクアセスメント",
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
  sustainable: "サステナブルデザイン",
  "2d-intro": "2D CAD とは",
  "2d-coords": "座標と入力",
  "2d-draw": "基本図形の作図",
  "2d-edit": "編集コマンド",
  "2d-constraints": "拘束と寸法でかたちを決める",
  "2d-layers": "線種・線の太さ・画層 (レイヤ)",
  "2d-drawing-workflow": "2D 図面の作図手順",
  "2d-to-3d": "2D から 3D へ",
  views: "投影図の選び方",
  sections: "断面図の種類",
  dimensioning: "寸法記入の詳細",
  symbols: "機械要素の略画法",
  "weld-symbols": "溶接記号",
  gdt: "幾何公差の詳細",
  reading: "図面を読む",
  mohr: "組合せ応力とモールの応力円",
  pressure: "薄肉円筒・球の圧力容器",
  indeterminate: "不静定はり",
  impact: "衝撃荷重とエネルギー",
  contact: "接触応力とすべり",
  fem: "有限要素法の仕組み",
  estimation: "単位・概算・有効数字",
  motors: "モーターの種類と選定",
  reducers: "減速機の選定",
  linear: "直動案内と位置決め機構",
  pneumatics: "空気圧・油圧の基礎",
  sensors: "センサとスイッチ",
  control: "制御の基礎",
  measurement: "測定と検査",
  quality: "品質管理の基礎",
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
