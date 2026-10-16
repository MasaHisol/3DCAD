import { GLOSSARY } from "../../learn/glossary";
import type { GlossaryEntry } from "../../learn/types";
import type { Part, TextChapter } from "../types";
import { BASICS } from "./basics";
import { DESIGN } from "./design";
import { KNOWHOW } from "./knowhow";
import { MECHANICS } from "./mechanics";

export const PARTS: Part[] = [
  { id: "basics", title: "第 1 部 設計の基礎", desc: "設計の進め方、製図、公差とはめあい、材料、締結", color: "#2563eb" },
  { id: "mechanics", title: "第 2 部 構造力学 (材料力学)", desc: "力のつり合い、応力とひずみ、はりの曲げ、断面、ねじり、座屈、疲労、安全率", color: "#b45309" },
  { id: "knowhow", title: "第 3 部 設計ノウハウ", desc: "切削・板金・樹脂成形・3D プリントの設計、組立性、CAD の作法、設計レビュー", color: "#0f766e" },
  { id: "design", title: "第 4 部 プロダクトデザイン", desc: "形と比率、人間工学、色・素材・仕上げ、ユーザ中心設計", color: "#9333ea" },
];

export const CHAPTERS: TextChapter[] = [...BASICS, ...MECHANICS, ...KNOWHOW, ...DESIGN];

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
];

export const TEXT_GLOSSARY: GlossaryEntry[] = [...GLOSSARY, ...EXTRA].sort((a, b) => a.term.localeCompare(b.term, "ja"));
