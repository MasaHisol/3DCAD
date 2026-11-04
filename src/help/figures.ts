// 使い方ヘルプの図解 (インライン SVG、オフラインで表示できるように画像ファイルは使わない)。
// 色は currentColor とアクセント (CSS 変数) を使い、明暗どちらのテーマでも読めるようにする。

export type FigureKind =
  | "sketch"
  | "constraint"
  | "extrude"
  | "revolve"
  | "loft"
  | "hole"
  | "fillet"
  | "pattern"
  | "measure"
  | "section"
  | "styles"
  | "mate"
  | "explode"
  | "viewer";

const A = "var(--accent, #0a6ed1)";
const svg = (body: string, caption: string) =>
  `<figure class="help-fig"><svg viewBox="0 0 320 140" role="img" aria-label="${caption}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">${body}</svg><figcaption>${caption}</figcaption></figure>`;
const arrow = (x1: number, y1: number, x2: number, y2: number) =>
  `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${A}" stroke-width="2"/><circle cx="${x2}" cy="${y2}" r="3" fill="${A}" stroke="none"/>`;
const label = (x: number, y: number, t: string) => `<text x="${x}" y="${y}" font-size="11" fill="currentColor" stroke="none" text-anchor="middle">${t}</text>`;
const step = (x: number, n: number) => `<circle cx="${x}" cy="14" r="9" fill="${A}" stroke="none"/><text x="${x}" y="18" font-size="11" fill="#fff" stroke="none" text-anchor="middle">${n}</text>`;
/** Isometric box outline at (x, y) with width w, depth d, height h. */
const box = (x: number, y: number, w: number, d: number, h: number, extra = "") =>
  `<path ${extra} d="M${x} ${y}l${w} 0l${d} ${-d / 2}l${-w} 0zM${x} ${y}l0 ${-h}l${w} 0l0 ${h}M${x + w} ${y - h}l${d} ${-d / 2}l0 ${h}M${x} ${y - h}l${d} ${-d / 2}l${w} 0"/>`;

const FIGS: Record<FigureKind, () => string> = {
  sketch: () =>
    svg(
      `${step(20, 1)}<path d="M30 110l70 -30l60 0l-70 30z" stroke-dasharray="4 3"/>${label(95, 132, "平面を選ぶ")}` +
        `${step(180, 2)}<path d="M190 110l70 -30l60 0l-70 30z" stroke-dasharray="4 3"/><path d="M215 103l40 -17l24 0l-40 17z" stroke="${A}" stroke-width="2"/>${label(255, 132, "輪郭を描いて寸法")}`,
      "スケッチ: 平面を選んで 2D の輪郭を描く",
    ),
  constraint: () =>
    svg(
      `<path d="M40 100h110v-60h-110z"/><text x="95" y="114" font-size="11" fill="${A}" stroke="none" text-anchor="middle">60</text><path d="M40 108h110" stroke="${A}" stroke-width="1"/>` +
        `<text x="30" y="74" font-size="11" fill="${A}" stroke="none" text-anchor="end">30</text><rect x="88" y="34" width="12" height="12" stroke="${A}"/><text x="94" y="44" font-size="9" fill="${A}" stroke="none" text-anchor="middle">=</text>` +
        `<path d="M200 100h90M200 100l50 -60" />${label(250, 120, "寸法と拘束で形を決める")}`,
      "寸法 (数値) と幾何拘束 (水平・平行など) で形を決める",
    ),
  extrude: () =>
    svg(
      `${step(20, 1)}<path d="M30 110l60 0l20 -10l-60 0z" stroke="${A}" stroke-width="2"/>${label(70, 132, "プロファイル")}` +
        `${step(170, 2)}${box(180, 110, 60, 20, 60)}${arrow(250, 60, 250, 25)}${label(240, 132, "距離を指定")}`,
      "押し出し: 閉じたプロファイルに厚みを付ける",
    ),
  revolve: () =>
    svg(
      `<path d="M60 20v110" stroke-dasharray="6 3"/><path d="M60 40h30v20h-15v40h25v20h-40z" stroke="${A}" stroke-width="2"/>${label(80, 136, "断面 + 軸")}` +
        `<path d="M220 20v110" stroke-dasharray="6 3"/><ellipse cx="220" cy="40" rx="30" ry="8"/><ellipse cx="220" cy="120" rx="40" ry="10"/><path d="M190 40v20h15v40h-25v20M250 40v20h-15v40h25v20"/>${label(220, 12, "360° 回転")}`,
      "回転: 断面を軸まわりに回す",
    ),
  loft: () =>
    svg(`<rect x="40" y="100" width="80" height="20" stroke="${A}"/><ellipse cx="80" cy="30" rx="20" ry="6" stroke="${A}"/><path d="M40 110L60 30M120 110L100 30"/>${label(200, 70, "断面の間を滑らかにつなぐ")}`, "ロフト: 複数の断面をつなぐ"),
  hole: () =>
    svg(
      `${box(30, 120, 120, 40, 40)}<ellipse cx="100" cy="90" rx="14" ry="6" stroke="${A}" stroke-width="2"/>` +
        `<path d="M200 40h40v20h-10v60h-20v-60h-10z"/><path d="M200 40h40" stroke="${A}"/>${label(220, 134, "座ぐり穴の断面")}`,
      "穴: 位置をクリックして種類と径を選ぶ",
    ),
  fillet: () =>
    svg(
      `<path d="M40 110v-70h80"/><circle cx="40" cy="40" r="4" fill="${A}" stroke="none"/>${label(80, 130, "エッジを選ぶ")}` +
        `<path d="M190 110v-50a20 20 0 0 1 20 -20h60" stroke="${A}" stroke-width="2"/>${label(235, 130, "半径 R で丸める")}`,
      "フィレット: 角を丸める",
    ),
  pattern: () =>
    svg(
      Array.from({ length: 4 }, (_, i) => `<circle cx="${40 + i * 30}" cy="70" r="9" ${i ? "" : `stroke="${A}" stroke-width="2"`}/>`).join("") +
        label(85, 110, "矩形状 (間隔 × 個数)") +
        Array.from({ length: 6 }, (_, i) => {
          const a = (i * Math.PI) / 3;
          return `<circle cx="${240 + 40 * Math.cos(a)}" cy="${70 + 40 * Math.sin(a)}" r="8" ${i ? "" : `stroke="${A}" stroke-width="2"`}/>`;
        }).join("") +
        `<circle cx="240" cy="70" r="2" fill="currentColor"/>`,
      "パターン: 元のフィーチャ (青) を並べる",
    ),
  measure: () =>
    svg(
      `${box(40, 120, 100, 40, 50)}<path d="M40 70v-40M140 70v-40" stroke="${A}" stroke-dasharray="3 3"/><path d="M40 36h100" stroke="${A}" stroke-width="2"/>` +
        `<text x="90" y="30" font-size="12" fill="${A}" stroke="none" text-anchor="middle">距離 100 mm</text><rect x="200" y="40" width="100" height="56" rx="4"/>${label(250, 62, "面・エッジを")}${label(250, 80, "2 つクリック")}`,
      "測定: 面やエッジを順にクリックすると距離・角度を表示",
    ),
  section: () =>
    svg(
      `${box(60, 120, 100, 40, 70)}<path d="M110 130l0 -100l20 -10l0 100z" fill="${A}" fill-opacity=".18" stroke="${A}"/>${label(240, 70, "断面位置をスライダで移動")}`,
      "断面図: 平面でモデルを切って内部を見る",
    ),
  styles: () =>
    svg(
      [0, 1, 2, 3]
        .map((i) => {
          const x = 20 + i * 76;
          const fill = i < 2 ? `fill="currentColor" fill-opacity="${i === 0 ? 0.25 : 0.15}"` : "";
          const dash = i === 2 ? `<path d="M${x + 50} ${100}l0 -40" stroke-dasharray="3 3"/>` : "";
          return box(x, 110, 50, 16, 50, i === 1 ? `${fill} stroke="none"` : fill) + dash + label(x + 30, 132, ["エッジ付き", "シェーディング", "隠れ線付き", "ワイヤ"][i]);
        })
        .join(""),
      "表示スタイル",
    ),
  mate: () =>
    svg(`<rect x="40" y="80" width="90" height="30"/><rect x="60" y="30" width="50" height="30" stroke="${A}"/>${arrow(85, 60, 85, 78)}${label(220, 70, "面と面を合わせる")}`, "組立拘束: 2 つの部品の面・軸を合わせる"),
  explode: () =>
    svg(`<rect x="40" y="100" width="90" height="20"/><rect x="60" y="60" width="50" height="20" stroke="${A}"/><rect x="75" y="20" width="20" height="20" stroke="${A}"/>${arrow(85, 98, 85, 84)}${label(220, 70, "拘束の軸方向に分解")}`, "分解: 部品を離して構成を見せる"),
  viewer: () =>
    svg(
      `<rect x="10" y="10" width="300" height="120" rx="6"/><path d="M10 34h300"/><text x="20" y="27" font-size="10" fill="currentColor" stroke="none">開く ・ 表示 ・ 測定 ・ 断面 ・ 分解 ・ 部品表</text>` +
        `<rect x="226" y="16" width="78" height="14" rx="3" fill="${A}" stroke="none"/><text x="265" y="27" font-size="9" fill="#fff" stroke="none" text-anchor="middle">編集モードで開く</text>${box(120, 110, 70, 24, 50)}`,
      "閲覧モード: 表示・確認の機能だけを並べた画面",
    ),
};

export function figure(kind: FigureKind): string {
  return FIGS[kind]();
}

export const FIGURE_KINDS = Object.keys(FIGS) as FigureKind[];
