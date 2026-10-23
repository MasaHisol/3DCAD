import { GLOSSARY } from "../../learn/glossary";
import type { GlossaryEntry } from "../../learn/types";
import type { Part, TextChapter } from "../types";
import { BASICS } from "./basics";
import { DESIGN } from "./design";
import { ELEMENTS } from "./elements";
import { DESIGN_MORE, KNOWHOW_MORE, MECHANICS_MORE } from "./more";
import { CAD2D } from "./cad2d";
import { DRAFTING } from "./drafting";
import { MECHANICS2 } from "./mechanics2";
import { MECHATRONICS, QUALITY } from "./mechatronics";
import { CAD2D_ADV } from "./cad2d_adv";
import { CAD3D } from "./cad3d";
import { MECHANICS3, MECHATRONICS2 } from "./mechanics3";
import { KNOWHOW2 } from "./knowhow2";
import { KNOWHOW3 } from "./knowhow3";
import { DESIGN2 } from "./design2";
import { DESIGN3 } from "./design3";
import { UX } from "./ux";
import { UX2 } from "./ux2";
import { SERVICE } from "./service";
import { KNOWHOW } from "./knowhow";
import { MECHANICS } from "./mechanics";
import { STIFFNESS } from "./stiffness";
import { IDESIGN } from "./idesign";
import { DRAFTING2 } from "./drafting2";
import { PROCESS } from "./process";
import { SAFETY2 } from "./safety2";
import { OPUX } from "./opux";
import { CASES } from "./cases";
import { DRILLS } from "./drills";
import { ELEMENTS2 } from "./elements2";
import { MECHATRONICS3 } from "./mechatronics3";
import { DRAFTING3 } from "./drafting3";
import { DESIGN4 } from "./design4";
import { KNOWHOW4 } from "./knowhow4";
import { SAFETY3 } from "./safety3";
import { IP } from "./ip";
import { HMI } from "./hmi";
import { EQUIPMENT } from "./equipment";
import { EQUIPMENT2 } from "./equipment2";
import { EQUIPMENT3 } from "./equipment3";

export const PARTS: Part[] = [
  { id: "cad2d", title: "第 1 部 2D CAD 初級〜上級", desc: "座標と入力、作図・編集、拘束と寸法、線種と画層、図面の作図手順、幾何作図、接線、標準化、レイアウト設計、データ交換、図面管理", color: "#0891b2" },
  { id: "cad3d", title: "第 2 部 3D CAD 初級〜上級", desc: "3D CAD の種類、最初の 10 時間、フィーチャの選び方、変更に強いモデル、曲面と連続性、トップダウン設計、アセンブリ上級、設計自動化、データ管理、MBD", color: "#0284c7" },
  { id: "basics", title: "第 3 部 設計の基礎", desc: "設計の進め方、製図の基本、公差とはめあい、材料、締結", color: "#2563eb" },
  { id: "drafting", title: "第 4 部 製図の実践", desc: "投影図の選び方、断面図、寸法記入、機械要素の略画法、溶接記号、幾何公差、図面を読む、表面性状、普通公差、フリーハンドスケッチと実測図", color: "#4f46e5" },
  { id: "mechanics", title: "第 5 部 構造力学 (材料力学)", desc: "つり合いから応力・はり・座屈・疲労・振動・熱、組合せ応力、圧力容器、不静定、衝撃、接触、FEM、疲労設計・溶接・ボルト継手の上級まで", color: "#b45309" },
  { id: "elements", title: "第 6 部 機械要素", desc: "軸受、歯車、ばね、キー・ピン・軸継手、ベルト・チェーン・ねじ送り、リンクとカム、軸の設計、潤滑と密封、送りねじ・ボールねじ、軸継手・クラッチ・ブレーキ", color: "#be123c" },
  { id: "mechatronics", title: "第 7 部 メカトロニクスと駆動", desc: "モーター・減速機・直動案内・空気圧・センサ・制御、電気の基礎、ロボットの運動学、動作パターンと振動抑制、サーボモーター選定計算、空気圧機器の選定、シーケンス制御と PLC", color: "#7c3aed" },
  { id: "knowhow", title: "第 8 部 設計ノウハウ", desc: "加工法別の設計、組立性、CAD の作法、解析、熱処理、コスト、安全、測定・品質、標準化、設計文書、試験、公差設計、規格、信頼性、失敗事例、設計計算の進め方、装置フレーム、設計 FMEA、保守作業の安全 (LOTO)、安全規格への適合、特許の基礎・請求項・調査と回避設計", color: "#0f766e" },
  { id: "design", title: "第 9 部 デザイン・意匠", desc: "形と比率、CMF、ユーザ中心設計、サステナブル、デザインの進め方、スケッチ、造形と面、色彩、デザイン言語、意匠権、デザインレビュー、デザインブリーフ、意匠 CAD モデリング、パッケージと開封体験、意匠登録の実務", color: "#9333ea" },
  { id: "ux", title: "第 10 部 人間工学・UX", desc: "人の感覚と情報処理、人体寸法、操作具、ターゲットの大きさ (フィッツの法則)、表示とサイン、UI/UX の原則、ヒューマンエラー、フィードバック、操作パネルの UX、ユニバーサル・インクルーシブデザイン、作業負担、UX リサーチと指標、操作盤の設計、HMI 画面の設計、機械の状態表示", color: "#db2777" },
  { id: "service", title: "第 11 部 配線・メンテナンスを考えた設計", desc: "配線設計、ケーブルベア、制御盤の配置、コネクタ、保全性、点検・給油、防塵防水 (IP)、保守のための情報", color: "#65a30d" },
  { id: "equipment", title: "第 12 部 装置設計 (産業・R&D・量産)", desc: "装置設計の全体像、仕様書、工程とサイクルタイム、コストと日程、購入品選定、R&D 装置、調整機構、計測設計、特殊環境、量産装置と稼働率、自動搬送、チョコ停対策、立上げと受入、装置データの活用", color: "#c2410c" },
];

/** Reading order. The review chapter closes the know-how part. */
const knowhow = [...KNOWHOW3.filter((c) => c.id === "design-thinking-eng"), ...KNOWHOW.filter((c) => c.id !== "review"), ...KNOWHOW_MORE, ...QUALITY, ...KNOWHOW2, ...SAFETY2, ...SAFETY3, ...PROCESS.filter((c) => c.part !== "basics"), ...KNOWHOW3.filter((c) => c.id !== "design-thinking-eng"), ...KNOWHOW4, ...IP.filter((c) => c.part === "knowhow"), ...KNOWHOW.filter((c) => c.id === "review")];
export const CHAPTERS: TextChapter[] = [...CAD2D, ...CAD2D_ADV, ...CAD3D, ...BASICS, ...PROCESS.filter((c) => c.part === "basics"), ...DRAFTING, ...DRAFTING2, ...DRAFTING3, ...MECHANICS, ...MECHANICS_MORE, ...MECHANICS2, ...MECHANICS3, ...STIFFNESS, ...ELEMENTS, ...ELEMENTS2, ...MECHATRONICS, ...MECHATRONICS2, ...MECHATRONICS3, ...knowhow, ...DESIGN2.filter((c) => c.id === "design-process"), ...DESIGN3.filter((c) => c.id === "form-language"), ...DESIGN, ...DESIGN3.filter((c) => c.id !== "form-language"), ...DESIGN_MORE, ...DESIGN2.filter((c) => c.id !== "design-process"), ...IDESIGN, ...DESIGN4, ...IP.filter((c) => c.part === "design"), ...UX2.filter((c) => c.id === "human-senses"), ...UX, ...OPUX, ...HMI, ...UX2.filter((c) => c.id !== "human-senses"), ...SERVICE, ...EQUIPMENT, ...EQUIPMENT2, ...EQUIPMENT3, ...CASES, ...DRILLS];

const EXTRA: GlossaryEntry[] = [
  { term: "応力", en: "Stress", desc: "単位面積あたりの内力。σ = F / A (MPa = N/mm²)。" },
  { term: "ひずみ", en: "Strain", desc: "伸び ÷ 元の長さ。単位なし。" },
  { term: "ヤング率 (縦弾性係数)", en: "Young's modulus", desc: "応力とひずみの比 E = σ / ε。変形のしにくさ。鋼 約 206 GPa、アルミ 約 70 GPa。" },
  { term: "降伏点 (耐力)", en: "Yield strength", desc: "永久変形が始まる応力。明確な降伏点がない材料は 0.2 % 耐力を使う。" },
  { term: "引張強さ", en: "Tensile strength", desc: "材料が耐えられる最大の応力。" },
  { term: "断面二次モーメント", en: "Second moment of area", desc: "曲げにくさを表す断面の量 I (mm⁴)。長方形は bh³/12。" },
  { term: "断面係数", en: "Section modulus", desc: "Z = I / e (mm³)。曲げ応力 σ = M / Z。" },
  { term: "曲げモーメント", en: "Bending moment", desc: "はりを曲げようとする内部のモーメント。最大の位置が危険断面。" },
  { term: "たわみ", en: "Deflection", desc: "荷重によるはりの変位。EI に反比例し、スパンの 3〜4 乗に比例する。" },
  { term: "座屈", en: "Buckling", desc: "細長い部材が圧縮で突然横に曲がる不安定現象。Pcr = π²EI / (KL)²。" },
  { term: "細長比", en: "Slenderness ratio", desc: "柱の有効長さ ÷ 断面二次半径。大きいほど座屈しやすい。" },
  { term: "疲労", en: "Fatigue", desc: "繰り返し荷重で、降伏点より低い応力でもき裂が進んで破断する現象。" },
  { term: "疲労限度", en: "Endurance limit", desc: "何回繰り返しても疲労破壊しない応力振幅。鋼で引張強さの約 1/2。" },
  { term: "応力集中係数", en: "Stress concentration factor", desc: "Kt = 最大応力 / 公称応力。穴・切欠き・段で大きくなる。" },
  { term: "はめあい", en: "Fit", desc: "穴と軸の寸法差による組合せの状態。すきまばめ・中間ばめ・しまりばめ。" },
  { term: "IT 等級", en: "IT grade", desc: "寸法公差の大きさの等級。数字が小さいほど精密 (IT6, IT7 …)。" },
  { term: "普通公差", en: "General tolerance", desc: "個別に指示しない寸法に一括で適用する公差 (JIS B 0405)。" },
  { term: "幾何公差", en: "Geometrical tolerance", desc: "形状・姿勢・位置・振れを規制する公差 (平面度・直角度・位置度など)。" },
  { term: "表面性状 (Ra)", en: "Surface texture", desc: "面の粗さ。算術平均粗さ Ra (µm) などで指示する。" },
  { term: "強度区分", en: "Property class", desc: "ボルトの強さの表示。8.8 = 引張強さ 800 MPa、降伏点 640 MPa。" },
  { term: "軸力", en: "Preload", desc: "ボルトを締め付けたときに生じる引張力。締結の性能を決める。" },
  { term: "抜き勾配", en: "Draft angle", desc: "成形品を金型から抜くための傾き (0.5〜2° 程度)。" },
  { term: "アンダーカット", en: "Undercut", desc: "型開き方向に抜けない形状。金型にスライドが必要になる。" },
  { term: "K 係数", en: "K-factor", desc: "板金の曲げで中立面の位置を板厚に対する比で表したもの。展開長さの計算に使う。" },
  { term: "DFM / DFA", en: "Design for manufacturing / assembly", desc: "製造しやすさ / 組み立てやすさを考えた設計。" },
  { term: "ポカヨケ", en: "Mistake-proofing", desc: "間違った作業ができない形・仕組みにして誤りを防ぐこと。" },
  { term: "FMEA", en: "Failure mode and effects analysis", desc: "故障の起こり方と影響を事前に洗い出し、優先度を付けて対策する手法。" },
  { term: "QCD", en: "Quality, Cost, Delivery", desc: "品質・コスト・納期。設計で同時に満たすべき 3 要素。" },
  { term: "黄金比", en: "Golden ratio", desc: "1 : 1.618。美しいとされる比率の一つ。" },
  { term: "パーセンタイル", en: "Percentile", desc: "小さいほうから数えて何 % の位置の値か。人体寸法の設計に使う。" },
  { term: "CMF", en: "Color, Material, Finish", desc: "色・素材・仕上げ。製品の印象と品質感を決める。" },
  { term: "アルマイト", en: "Anodizing", desc: "アルミの陽極酸化処理。耐食・耐摩耗の皮膜で、染色もできる。" },
  { term: "プロトタイプ", en: "Prototype", desc: "検証のための試作品。初期は安く早く多く作る。" },
  { term: "基本定格寿命 (L10)", en: "Basic rating life", desc: "同じ条件の軸受の 90 % が転がり疲れで壊れずに回れる回転数。(C/P)³ × 10⁶ 回転 (玉軸受)。" },
  { term: "基本動定格荷重", en: "Basic dynamic load rating", desc: "軸受の寿命計算に使うカタログ値 C。寿命が 10⁶ 回転になる荷重。" },
  { term: "モジュール", en: "Module", desc: "歯車の歯の大きさ。ピッチ円直径 = モジュール × 歯数。かみ合う歯車は同じモジュール。" },
  { term: "バックラッシ", en: "Backlash", desc: "かみ合う歯の間のすきま。位置決め精度に影響する。" },
  { term: "ばね定数", en: "Spring rate", desc: "荷重 ÷ たわみ (N/mm)。コイルばねでは線径の 4 乗に比例。" },
  { term: "平行キー", en: "Parallel key", desc: "軸とボスのキー溝に入れてトルクを伝える部品。寸法は軸径で決まる (JIS B 1301)。" },
  { term: "止め輪", en: "Retaining ring", desc: "軸や穴の溝にはめて軸方向の抜けを止める部品 (C 形・E 形)。" },
  { term: "軸継手", en: "Coupling", desc: "2 本の軸をつなぎ、芯ずれを吸収する部品。" },
  { term: "グラスホフの条件", en: "Grashof condition", desc: "四節リンクで 最短 + 最長 ≤ 他の 2 本の和 のとき、いずれかのリンクが 1 回転できる。" },
  { term: "自由度 (機構)", en: "Mobility", desc: "機構の動きを決めるのに必要な入力の数。平面ではグリューブラーの式 F = 3(n−1) − 2j₁ − j₂。" },
  { term: "固有振動数", en: "Natural frequency", desc: "構造が自然に振動しやすい周波数。fn = (1/2π)√(k/m)。" },
  { term: "共振", en: "Resonance", desc: "加振の周波数が固有振動数に近く、振動が大きく増幅される現象。" },
  { term: "減衰比", en: "Damping ratio", desc: "振動の減衰の大きさを表す無次元数 ζ。金属構造では 0.01〜0.05 程度。" },
  { term: "線膨張係数", en: "Coefficient of thermal expansion", desc: "温度 1 K あたりのひずみ α。鋼 約 12、アルミ 約 24 (×10⁻⁶/K)。" },
  { term: "熱抵抗", en: "Thermal resistance", desc: "熱の流れにくさ (K/W)。温度差 = 熱抵抗 × 熱流。" },
  { term: "焼入れ・焼戻し", en: "Quenching and tempering", desc: "鋼を加熱・急冷して硬くし、再加熱でねばさを戻す熱処理 (調質)。" },
  { term: "HRC", en: "Rockwell hardness C", desc: "焼入れ鋼などの硬さの尺度。工具鋼で 60 前後。" },
  { term: "特異点 (解析)", en: "Singularity", desc: "鋭い角・点荷重などで理論上応力が無限大になる箇所。メッシュを細かくするほど値が増える。" },
  { term: "リスクアセスメント", en: "Risk assessment", desc: "危険源を特定し、リスクを見積もり・評価して低減する手順 (ISO 12100)。" },
  { term: "フェールセーフ", en: "Fail-safe", desc: "故障したときに安全側になるように設計すること。" },
  { term: "LCA", en: "Life cycle assessment", desc: "材料から廃棄までの製品の一生の環境影響を評価する手法。" },
  { term: "チャージ", en: "Hourly rate", desc: "加工の時間単価 (円/時)。機械と作業者の費用。" },
];

export const TEXT_GLOSSARY: GlossaryEntry[] = [...GLOSSARY, ...EXTRA].sort((a, b) => a.term.localeCompare(b.term, "ja"));
