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
  "form-language": "かたちの言葉",
  "proportion-grid": "レイアウトと比率の実践",
  "materials-finish-design": "素材と加工が生む表情",
  "molded-design": "樹脂成形品の意匠設計",
  "cmf-planning": "CMF 企画と色の量産管理",
  "design-for-emotion": "愛着とストーリー",
  "human-senses": "人の感覚と情報処理",
  "pointing-targets": "ターゲットの大きさと配置",
  "error-design": "ヒューマンエラーと設計",
  "feedback-sound-haptics": "フィードバックの設計",
  "interaction-hw": "機械の操作パネルと組込み画面の UX",
  "inclusive-cases": "インクルーシブデザインの実例",
  "ux-metrics": "UX を数字で測る",
  "design-thinking-eng": "設計者の考え方",
  "layout-design": "レイアウト設計の進め方",
  "cost-down": "VE とコストダウンの設計",
  "jigs-fixtures": "治具と組立を助ける設計",
  "design-change": "設計変更と影響範囲",
  "review-checklist": "総合設計チェックリスト",
  "2d-geometry": "幾何作図",
  "2d-tangent": "接線・接円とフィレット形状の作図",
  "2d-blocks": "部品化と標準化",
  "2d-layout": "2D レイアウト設計とスケルトン",
  "2d-data": "データ交換とトラブル対策",
  "2d-management": "図面管理",
  "2d-efficiency": "速く正確に描くための技術",
  "3d-overview": "3D CAD の種類と使い分け",
  "3d-first-steps": "最初の 10 時間で身につけること",
  "3d-feature-choice": "フィーチャの選び方",
  "3d-robust": "変更に強いモデル",
  "3d-surfaces": "曲面と連続性",
  "3d-topdown": "トップダウン設計とスケルトン",
  "3d-assembly-adv": "アセンブリ設計の上級テクニック",
  "3d-automation": "設計の自動化",
  "3d-data-management": "3D データ管理",
  "3d-mbd": "MBD と CAD-CAE-CAM 連携",
  "fatigue-design": "疲労設計の実践",
  "weld-strength": "溶接継手の強度",
  "bolt-joint": "ボルト継手の詳細設計",
  "electric-basics": "機械設計者のための電気の基礎",
  kinematics: "ロボットアームと機構の運動学",
  "motion-control-adv": "動作パターンと振動抑制",
  standardization: "標準化と共通化",
  "design-docs": "設計計算書と設計文書",
  testing: "試作と評価試験",
  "tolerance-design": "公差設計の実践",
  standards: "規格の調べ方と使い方",
  reliability: "信頼性設計",
  failures: "失敗事例に学ぶ",
  "design-process": "プロダクトデザインの進め方",
  sketching: "アイデアスケッチとレンダリング",
  "form-surfaces": "造形",
  "color-theory": "色彩の基礎と配色",
  "design-language": "デザイン言語とブランド",
  "design-rights": "意匠権と知的財産",
  "design-review": "デザインレビューとプレゼンテーション",
  anthropometry: "人体寸法データの使い方",
  controls: "操作具の設計",
  displays: "表示とサインの見やすさ",
  "ux-principles": "UI/UX の基本原則",
  "universal-design": "ユニバーサルデザインとアクセシビリティ",
  workload: "作業姿勢と負担",
  "ux-research": "UX リサーチと評価手法",
  "wiring-design": "配線を考えた機械設計",
  "cable-carrier": "可動部の配線",
  "panel-layout": "制御盤・電装品の配置",
  connectors: "コネクタと端子",
  maintainability: "保全性の設計",
  "inspection-design": "点検・給油・清掃のしやすさ",
  enclosure: "筐体と保護",
  "service-docs": "保守のための情報",
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
