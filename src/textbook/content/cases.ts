import type { TextChapter } from "../types";

/**
 * Before/after figure: two k-panel cards (✕ left, ✓ right).
 * `bad` and `good` are drawn in the left panel's coordinates (x 8..252, y 44..190);
 * the right one is shifted by 260 px.
 */
function ba(aria: string, badTitle: string, goodTitle: string, bad: string, good: string, badNote: string, goodNote: string): string {
  return (
    '<svg class="tb-chart" viewBox="0 0 520 224" role="img" aria-label="' + aria + '">' +
    '<rect class="k-panel" x="8" y="8" width="244" height="208" rx="8"/><rect class="k-panel" x="268" y="8" width="244" height="208" rx="8"/>' +
    '<circle class="k-badge" cx="28" cy="28" r="10" style="fill:var(--tb-bad)"/><text class="k-badge-t" x="28" y="32" text-anchor="middle">✕</text>' +
    '<text class="k-title" x="46" y="32">' + badTitle + "</text>" +
    '<circle class="k-badge" cx="288" cy="28" r="10" style="fill:var(--tb-good)"/><text class="k-badge-t" x="288" y="32" text-anchor="middle">✓</text>' +
    '<text class="k-title" x="306" y="32">' + goodTitle + "</text>" +
    "<g>" + bad + "</g>" +
    '<g transform="translate(260,0)">' + good + "</g>" +
    '<text class="k-note" x="22" y="206">' + badNote + "</text>" +
    '<text class="k-note" x="282" y="206">' + goodNote + "</text>" +
    "</svg>"
  );
}

const GROUND = '<rect class="k-ground" x="24" y="182" width="212" height="8"/><line style="stroke:var(--k-line)" stroke-width="1.6" x1="24" y1="182" x2="236" y2="182"/>';

/* ---------- figures ---------- */

const FIG_FATIGUE = ba(
  "L形ブラケットの隅部: 鋭い角と大きな R",
  "鋭い入隅 (r≈0.5)",
  "R6 の隅肉",
  '<g class="k-shadow"><path class="k-part" d="M40,60 L64,60 L64,158 L200,158 L200,182 L40,182 Z"/></g>' +
    '<line class="k-force" x1="214" y1="120" x2="214" y2="156"/>' +
    '<text class="k-dimtext" x="220" y="112">F</text>' +
    '<path d="M64,150 L72,146 L66,140 L74,134" fill="none" style="stroke:var(--tb-bad)" stroke-width="2.2"/>' +
    '<circle cx="64" cy="158" r="12" fill="none" style="stroke:var(--tb-bad)" stroke-width="1.6" stroke-dasharray="4 3"/>' +
    '<text class="k-bad-t" x="84" y="130">き裂 (Kt≈2.8)</text>',
  '<g class="k-shadow"><path class="k-part" d="M40,60 L64,60 L64,134 Q64,158 88,158 L200,158 L200,182 L40,182 Z"/></g>' +
    '<line class="k-force" x1="214" y1="120" x2="214" y2="156"/>' +
    '<text class="k-dimtext" x="220" y="112">F</text>' +
    '<line class="k-ext" x1="64" y1="134" x2="96" y2="110"/><text class="k-dimtext" x="98" y="108">R6</text>' +
    '<text class="k-good-t" x="96" y="140">Kt≈1.4</text>',
  "応力が角に集中し、繰返しでき裂が進む",
  "応力の流れがなめらか → 疲労限度以下"
);

const FIG_WELD = ba(
  "補強板の溶接端",
  "高応力部で溶接を止める",
  "低応力部まで延長+回し溶接",
  '<g class="k-shadow"><rect class="k-part" x="30" y="120" width="200" height="22"/><rect class="k-alu" x="70" y="80" width="90" height="40"/></g>' +
    '<circle cx="70" cy="120" r="10" fill="none" style="stroke:var(--tb-bad)" stroke-width="1.6" stroke-dasharray="4 3"/>' +
    '<circle cx="160" cy="120" r="10" fill="none" style="stroke:var(--tb-bad)" stroke-width="1.6" stroke-dasharray="4 3"/>' +
    '<line class="k-force" x1="24" y1="160" x2="24" y2="146"/><line class="k-force" x1="236" y1="160" x2="236" y2="146"/>' +
    '<text class="k-bad-t" x="74" y="168">止端に応力集中 → き裂</text>',
  '<g class="k-shadow"><rect class="k-part" x="30" y="120" width="200" height="22"/><path class="k-alu" d="M50,120 L80,90 L150,90 L180,120 Z"/></g>' +
    '<line class="k-force" x1="24" y1="160" x2="24" y2="146"/><line class="k-force" x1="236" y1="160" x2="236" y2="146"/>' +
    '<text class="k-good-t" x="40" y="168">端部をテーパにして剛性変化を緩やかに</text>',
  "剛性が急変する所に溶接止端がある",
  "止端を低応力側へ、仕上げで止端をなめらかに"
);

const FIG_RESONANCE = ba(
  "フレームの共振: 補強前後の固有振動数",
  "fn 27 Hz ≒ 回転 25 Hz",
  "斜材追加 fn 54 Hz",
  GROUND +
    '<g class="k-shadow"><rect class="k-part" x="60" y="70" width="12" height="112"/><rect class="k-part" x="188" y="70" width="12" height="112"/><rect class="k-part" x="56" y="60" width="148" height="12"/><rect class="k-accent" x="104" y="40" width="52" height="20" rx="3"/></g>' +
    '<path d="M60,60 Q50,120 60,182" fill="none" style="stroke:var(--tb-bad)" stroke-width="1.4" stroke-dasharray="4 3"/>' +
    '<line class="k-move" x1="120" y1="100" x2="80" y2="100" style="stroke:var(--tb-bad);marker-end:url(#k-arrow-red)"/>' +
    '<line class="k-move" x1="140" y1="100" x2="180" y2="100" style="stroke:var(--tb-bad);marker-end:url(#k-arrow-red)"/>' +
    '<text class="k-bad-t" x="130" y="130" text-anchor="middle">横揺れ 7 倍</text>',
  GROUND +
    '<g class="k-shadow"><rect class="k-part" x="60" y="70" width="12" height="112"/><rect class="k-part" x="188" y="70" width="12" height="112"/><rect class="k-part" x="56" y="60" width="148" height="12"/><rect class="k-accent" x="104" y="40" width="52" height="20" rx="3"/>' +
    '<path class="k-part" d="M72,176 L80,182 L196,80 L188,72 Z"/></g>' +
    '<text class="k-good-t" x="130" y="160" text-anchor="middle">剛性 4 倍</text>',
  "運転周波数が固有振動数に近い (比 0.93)",
  "振動数比 0.46 → 倍率 1.27"
);

const FIG_SNAP = ba(
  "スナップフィットの腕長さ",
  "L = 8 mm (ひずみ 7%)",
  "L = 14 mm + 根元 R",
  '<g class="k-shadow"><rect class="k-plastic" x="30" y="150" width="200" height="20"/><path class="k-plastic" d="M110,150 L110,110 L124,104 L118,110 L118,150 Z"/></g>' +
    '<line class="k-ext" x1="132" y1="110" x2="160" y2="110"/><line class="k-ext" x1="132" y1="150" x2="160" y2="150"/>' +
    '<line class="k-dimline" x1="154" y1="110" x2="154" y2="150"/><text class="k-dimtext" x="160" y="134">8</text>' +
    '<path d="M110,150 L118,146" fill="none" style="stroke:var(--tb-bad)" stroke-width="2.6"/>' +
    '<text class="k-bad-t" x="40" y="96">根元が鋭角 → 白化・折損</text>',
  '<g class="k-shadow"><rect class="k-plastic" x="30" y="160" width="200" height="16"/><path class="k-plastic" d="M106,160 Q110,156 110,150 L110,70 L124,64 L118,70 L118,150 Q118,156 122,160 Z"/></g>' +
    '<line class="k-ext" x1="132" y1="70" x2="160" y2="70"/><line class="k-ext" x1="132" y1="160" x2="160" y2="160"/>' +
    '<line class="k-dimline" x1="154" y1="70" x2="154" y2="160"/><text class="k-dimtext" x="160" y="118">14</text>' +
    '<text class="k-good-t" x="40" y="56">ひずみ 2.3% に低下</text>',
  "ε = 1.5·t·y / L² が許容 (PC 約4%) を超える",
  "長く・根元に R、繰返しにも余裕"
);

const FIG_PINCH = ba(
  "移動テーブルと固定フレームのすき間",
  "40 → 0 mm に閉じる",
  "最小すき間 ≥ 25 mm",
  GROUND +
    '<g class="k-shadow"><rect class="k-part" x="180" y="80" width="40" height="102"/><rect class="k-alu" x="40" y="110" width="100" height="40" rx="3"/></g>' +
    '<line class="k-move" x1="90" y1="96" x2="150" y2="96"/>' +
    '<rect class="k-skin" x="146" y="122" width="30" height="12" rx="6"/>' +
    '<text class="k-bad-t" x="110" y="176" text-anchor="middle">指がはさまれる</text>',
  GROUND +
    '<g class="k-shadow"><rect class="k-part" x="180" y="80" width="40" height="102"/><rect class="k-alu" x="40" y="110" width="100" height="40" rx="3"/><rect class="k-part" x="132" y="104" width="8" height="52"/></g>' +
    '<line class="k-ext" x1="140" y1="160" x2="140" y2="176"/><line class="k-ext" x1="180" y1="160" x2="180" y2="176"/>' +
    '<line class="k-dimline" x1="140" y1="172" x2="180" y2="172"/><text class="k-dimtext" x="160" y="168" text-anchor="middle">≥25</text>' +
    '<text class="k-good-t" x="40" y="96">ストッパで最接近を制限</text>',
  "閉じる隙間はすべて「はさまれ箇所」",
  "指が入っても潰れない距離を残す"
);

const FIG_CURTAIN = ba(
  "ライトカーテンの安全距離",
  "S = 300 mm で設置",
  "S = 500 mm に再計算",
  GROUND +
    '<g class="k-shadow"><rect class="k-part" x="40" y="70" width="60" height="112"/><rect class="k-accent" x="180" y="60" width="8" height="122"/></g>' +
    '<text class="k-note" x="70" y="62" text-anchor="middle">危険源</text>' +
    '<line class="k-ext" x1="100" y1="150" x2="100" y2="170"/><line class="k-ext" x1="184" y1="150" x2="184" y2="170"/>' +
    '<line class="k-dimline" x1="100" y1="166" x2="184" y2="166"/><text class="k-dimtext" x="142" y="160" text-anchor="middle">300</text>' +
    '<text class="k-bad-t" x="110" y="96">停止前に手が届く</text>',
  GROUND +
    '<g class="k-shadow"><rect class="k-part" x="30" y="70" width="60" height="112"/><rect class="k-accent" x="216" y="60" width="8" height="122"/></g>' +
    '<text class="k-note" x="60" y="62" text-anchor="middle">危険源</text>' +
    '<line class="k-ext" x1="90" y1="150" x2="90" y2="170"/><line class="k-ext" x1="220" y1="150" x2="220" y2="170"/>' +
    '<line class="k-dimline" x1="90" y1="166" x2="220" y2="166"/><text class="k-dimtext" x="155" y="160" text-anchor="middle">500</text>' +
    '<text class="k-good-t" x="100" y="96">S = K·T + C</text>',
  "停止時間 T = 0.3 s を考慮していない",
  "K = 1600 で再計算し最小 500 mm"
);

const FIG_POKA = ba(
  "カバー取付のポカヨケ",
  "対称な穴 4 か所",
  "位置決めピンを非対称に",
  '<g class="k-shadow"><rect class="k-alu" x="50" y="56" width="160" height="110" rx="6"/></g>' +
    '<circle class="k-edge" cx="70" cy="76" r="6"/><circle class="k-edge" cx="190" cy="76" r="6"/><circle class="k-edge" cx="70" cy="146" r="6"/><circle class="k-edge" cx="190" cy="146" r="6"/>' +
    '<circle cx="168" cy="110" r="10" style="fill:var(--tb-surface);stroke:var(--tb-bad)" stroke-width="1.6"/>' +
    '<path class="k-move" d="M110,180 A40,20 0 1 1 150,180" style="stroke:var(--tb-bad);marker-end:url(#k-arrow-red)"/>' +
    '<text class="k-bad-t" x="130" y="114" text-anchor="middle">センサ穴</text>',
  '<g class="k-shadow"><rect class="k-alu" x="50" y="56" width="160" height="110" rx="6"/></g>' +
    '<circle class="k-edge" cx="70" cy="76" r="6"/><circle class="k-edge" cx="190" cy="76" r="6"/><circle class="k-edge" cx="70" cy="146" r="6"/><circle class="k-edge" cx="190" cy="146" r="6"/>' +
    '<circle class="k-part" cx="90" cy="76" r="5"/><circle class="k-part" cx="190" cy="120" r="5"/>' +
    '<circle cx="168" cy="110" r="10" style="fill:var(--tb-surface);stroke:var(--tb-good)" stroke-width="1.6"/>' +
    '<text class="k-good-t" x="130" y="186" text-anchor="middle">逆向きでは入らない</text>',
  "180° 回しても付く → 誤組付け",
  "形状で正しい向きしか許さない"
);

const FIG_CABLE = ba(
  "ケーブルベアの曲げ半径",
  "R = 50 (= 5d)",
  "R = 100 (= 10d)",
  '<path d="M30,160 L140,160 A30,30 0 0 1 140,100 L230,100" fill="none" style="stroke:var(--k-line)" stroke-width="10" stroke-linecap="round"/>' +
    '<path d="M30,160 L140,160 A30,30 0 0 1 140,100 L230,100" fill="none" style="stroke:var(--tb-accent)" stroke-width="4"/>' +
    '<circle cx="170" cy="130" r="14" fill="none" style="stroke:var(--tb-bad)" stroke-width="1.6" stroke-dasharray="4 3"/>' +
    '<text class="k-bad-t" x="60" y="86">外側素線ひずみ 10% → 断線</text>',
  '<path d="M30,176 L120,176 A50,50 0 0 1 120,76 L230,76" fill="none" style="stroke:var(--k-line)" stroke-width="10" stroke-linecap="round"/>' +
    '<path d="M30,176 L120,176 A50,50 0 0 1 120,76 L230,76" fill="none" style="stroke:var(--tb-accent)" stroke-width="4"/>' +
    '<line class="k-dimline" x1="120" y1="126" x2="160" y2="104" style="marker-start:none"/><text class="k-dimtext" x="132" y="140">R</text>' +
    '<text class="k-good-t" x="40" y="60">ひずみ 5% に半減</text>',
  "高屈曲ケーブルの推奨 R (7.5〜10d) 未満",
  "ケーブル径 d の 10 倍以上を確保"
);

const FIG_THERMAL = ba(
  "アルミレールの両端固定と片側スライド",
  "両端をボルト固定",
  "一端固定・他端長穴",
  '<g class="k-shadow"><rect class="k-part" x="30" y="140" width="200" height="30"/><path class="k-alu" d="M40,140 Q130,108 220,140 L220,124 Q130,92 40,124 Z"/></g>' +
    '<rect x="40" y="118" width="8" height="26" style="fill:var(--k-line)"/><rect x="212" y="118" width="8" height="26" style="fill:var(--k-line)"/>' +
    '<text class="k-bad-t" x="130" y="84" text-anchor="middle">反り・位置ずれ</text>',
  '<g class="k-shadow"><rect class="k-part" x="30" y="140" width="200" height="30"/><rect class="k-alu" x="40" y="122" width="180" height="18"/></g>' +
    '<rect x="44" y="116" width="8" height="28" style="fill:var(--k-line)"/>' +
    '<rect x="200" y="126" width="22" height="10" rx="5" fill="none" style="stroke:var(--tb-good)" stroke-width="1.6"/>' +
    '<line class="k-move" x1="180" y1="108" x2="226" y2="108"/>' +
    '<text class="k-good-t" x="48" y="100">固定</text><text class="k-good-t" x="168" y="96">伸びを逃がす</text>',
  "Δα による差 0.165 mm/m が拘束される",
  "伸びの方向と基準を設計で決める"
);

const FIG_MOLD = ba(
  "成形品の肉厚",
  "局部的な厚肉 5 mm",
  "均一肉厚 2 mm + 肉抜き",
  '<g class="k-shadow"><path class="k-cut" d="M30,80 L230,80 L230,96 L160,96 L160,140 L100,140 L100,96 L30,96 Z"/></g>' +
    '<path d="M100,80 Q130,90 160,80" fill="none" style="stroke:var(--tb-bad)" stroke-width="2.6"/>' +
    '<text class="k-bad-t" x="130" y="66" text-anchor="middle">ひけ</text>' +
    '<text class="k-bad-t" x="130" y="168" text-anchor="middle">冷却時間 6 倍、反り</text>',
  '<g class="k-shadow"><path class="k-cut" d="M30,80 L230,80 L230,96 L164,96 L164,140 L148,140 L148,96 L138,96 L138,140 L122,140 L122,96 L112,96 L112,140 L96,140 L96,96 L30,96 Z"/></g>' +
    '<text class="k-good-t" x="130" y="66" text-anchor="middle">表面は平ら</text>' +
    '<text class="k-good-t" x="130" y="168" text-anchor="middle">リブで剛性を確保</text>',
  "厚い所は遅れて冷え、収縮差が残る",
  "肉厚をそろえると冷却も収縮も均一"
);

const FIG_ACCESS = ba(
  "フィルタ交換のアクセス",
  "ねじ 12 本の後面パネル",
  "前面ヒンジ扉+ワンタッチ",
  '<g class="k-shadow"><rect class="k-part" x="50" y="50" width="160" height="130" rx="4"/></g>' +
    '<g style="fill:var(--k-line)"><circle cx="60" cy="60" r="3"/><circle cx="100" cy="60" r="3"/><circle cx="160" cy="60" r="3"/><circle cx="200" cy="60" r="3"/><circle cx="60" cy="115" r="3"/><circle cx="200" cy="115" r="3"/><circle cx="60" cy="170" r="3"/><circle cx="100" cy="170" r="3"/><circle cx="160" cy="170" r="3"/><circle cx="200" cy="170" r="3"/><circle cx="130" cy="60" r="3"/><circle cx="130" cy="170" r="3"/></g>' +
    '<text class="k-bad-t" x="130" y="120" text-anchor="middle">約 15 分/回</text>',
  '<g class="k-shadow"><rect class="k-part" x="50" y="50" width="160" height="130" rx="4"/><rect class="k-alu" x="70" y="70" width="120" height="90" rx="3"/></g>' +
    '<rect x="64" y="84" width="6" height="16" style="fill:var(--k-line)"/><rect x="64" y="130" width="6" height="16" style="fill:var(--k-line)"/>' +
    '<circle cx="180" cy="115" r="5" style="fill:var(--tb-good)"/>' +
    '<text class="k-good-t" x="130" y="120" text-anchor="middle">約 2 分/回</text>',
  "日常保全が後回しになる構造",
  "工具不要・前面から・見える位置"
);

const FIG_BOLT = ba(
  "振動によるボルトのゆるみ",
  "軸力不足 6.3 kN",
  "規定トルクで 15.6 kN",
  '<g class="k-shadow"><rect class="k-part" x="40" y="80" width="180" height="30"/><rect class="k-alu" x="40" y="110" width="180" height="30"/><rect class="k-part-h" x="120" y="64" width="20" height="96"/><rect class="k-part" x="108" y="54" width="44" height="12"/></g>' +
    '<line class="k-move" x1="70" y1="126" x2="30" y2="126" style="stroke:var(--tb-bad);marker-end:url(#k-arrow-red)"/>' +
    '<line class="k-move" x1="190" y1="94" x2="232" y2="94" style="stroke:var(--tb-bad);marker-end:url(#k-arrow-red)"/>' +
    '<text class="k-bad-t" x="130" y="182" text-anchor="middle">μF &lt; 横荷重 → すべり → 回転ゆるみ</text>',
  '<g class="k-shadow"><rect class="k-part" x="40" y="80" width="180" height="30"/><rect class="k-alu" x="40" y="110" width="180" height="30"/><rect class="k-part-h" x="120" y="64" width="20" height="96"/><rect class="k-part" x="108" y="54" width="44" height="12"/></g>' +
    '<line class="k-force" x1="130" y1="40" x2="130" y2="54"/><line class="k-force" x1="130" y1="178" x2="130" y2="162"/>' +
    '<text class="k-good-t" x="130" y="194" text-anchor="middle">摩擦で横荷重を受け、すべらない</text>',
  "ばね座金では止まらない",
  "軸力 × 摩擦係数 > 横荷重"
);

const FIG_MODE = ba(
  "操作パネルのモード表示",
  "小さな文字でモード表示",
  "大きな色帯+キー切替",
  '<g class="k-shadow"><rect class="k-part" x="40" y="50" width="180" height="130" rx="6"/></g>' +
    '<rect x="56" y="64" width="148" height="60" rx="3" style="fill:var(--tb-surface)"/>' +
    '<text class="k-note" x="62" y="78">mode: AUTO</text>' +
    '<circle cx="90" cy="150" r="14" style="fill:var(--tb-good)"/><text class="k-badge-t" x="90" y="154" text-anchor="middle">START</text>' +
    '<text class="k-bad-t" x="130" y="104" text-anchor="middle">手動のつもりで起動</text>',
  '<g class="k-shadow"><rect class="k-part" x="40" y="50" width="180" height="130" rx="6"/></g>' +
    '<rect x="56" y="64" width="148" height="30" rx="3" style="fill:var(--tb-warn)"/>' +
    '<text class="k-title" x="130" y="84" text-anchor="middle">自動運転</text>' +
    '<circle cx="90" cy="150" r="14" style="fill:var(--tb-good)"/><text class="k-badge-t" x="90" y="154" text-anchor="middle">START</text>' +
    '<rect x="150" y="136" width="36" height="28" rx="4" style="fill:var(--k-line)"/><text class="k-badge-t" x="168" y="154" text-anchor="middle">KEY</text>' +
    '<text class="k-good-t" x="130" y="116" text-anchor="middle">モードが一目でわかる</text>',
  "同じボタンがモードで別の意味",
  "状態を常に大きく・切替は意図的に"
);

export const CASES: TextChapter[] = [
  /* 1 ------------------------------------------------------------ */
  {
    id: "case-fatigue-corner",
    part: "knowhow",
    title: "ケース: 鋭い角から疲労き裂 — ブラケットと溶接端",
    minutes: 15,
    level: 2,
    lead: "静的には十分な強度のはずの部品が、数か月後に割れる。原因の多くは応力集中と繰返し荷重の組み合わせです。2 つの現場例で、計算と対策の考え方をたどります。",
    body: `
<h2>ケース 1: センサ取付ブラケットが 3 か月で破断</h2>
<h3>状況</h3>
<p>SS400 の板 (厚さ t = 6 mm、幅 b = 40 mm) を曲げた L 形ブラケット。先端 100 mm の位置に、振動するセンサ部 (片振り荷重 最大 150 N) が付く。静的には「降伏点 245 MPa に対して十分」と判断していたが、約 10<sup>5</sup> 回で入隅から割れた。</p>
<h3>原因</h3>
<div class="tb-math">\\begin{aligned} M &= F \\cdot L = 150 \\times 100 = 15\\,000\\,\\mathrm{N\\cdot mm} \\\\ Z &= \\dfrac{b t^2}{6} = \\dfrac{40 \\times 36}{6} = 240\\,\\mathrm{mm^3} \\\\ \\text{公称応力}\\ \\sigma_n &= \\dfrac{M}{Z} = 62.5\\,\\mathrm{MPa} \\end{aligned}</div>
<p>曲げの入隅は板金の内 R ≈ 0.5 mm のほぼ鋭角で、応力集中係数 K<sub>t</sub> ≈ 2.8 (目安)。最大応力は 62.5 × 2.8 ≈ 175 MPa。SS400 の疲労限度は平滑材で約 200 MPa 程度ですが、表面粗さ・寸法効果を考えると実用上 140 MPa 前後にまで下がり、これを超えていました。</p>
<h3>対策</h3>
<p>隅に R6 (r/t = 1) を設け K<sub>t</sub> ≈ 1.4 → 最大応力 ≈ 88 MPa。さらに荷重点を根元寄りに変更して余裕を確保しました。</p>
FIGURE1
<p class="tb-caption">図: 入隅の R を大きくすると、応力の流れがなめらかになり集中が下がる</p>
<h3>教訓</h3>
<ul><li>「静的に OK」は疲労の保証にならない。<b>繰返し荷重があれば必ず疲労を確認</b>する</li><li>最大応力 = 公称応力 × K<sub>t</sub>。<b>角には必ず R</b> を指示する (図面の「指示なき角 R」も確認)</li></ul>

<h2>ケース 2: 補強板の溶接端から割れる</h2>
<h3>状況</h3>
<p>搬送機のビームの中央に補強板をすみ肉溶接で追加した。数か月後、補強板の<b>端部の溶接止端</b>からき裂が発生した。</p>
<h3>原因</h3>
<p>補強板の端で断面 (剛性) が急変し、そこに溶接止端の形状的な応力集中と引張残留応力が重なった。溶接継手の疲労強度は母材の数分の一 (継手等級による) しかない。</p>
<h3>対策</h3>
<ul><li>補強板の端部をテーパ状にして剛性変化を緩やかにする</li><li>溶接端を曲げモーメントの小さい位置まで延ばし、回し溶接して止端をグラインダで仕上げる</li></ul>
FIGURE2
<p class="tb-caption">図: 剛性の急変部と溶接止端を重ねない</p>
<h3>教訓</h3>
<p>「補強したら壊れた」は典型的な失敗。<b>補強は剛性の段差を作る</b>ことを忘れない。溶接は疲労に弱い場所として扱う。</p>
`.replace("FIGURE1", FIG_FATIGUE).replace("FIGURE2", FIG_WELD),
    points: [
      "最大応力 = 公称応力 × 応力集中係数 Kt",
      "繰返し荷重では降伏点ではなく疲労限度 (補正後) と比べる",
      "入隅には R、補強端はテーパ、溶接止端は低応力部へ",
    ],
    exercises: [
      { q: "ケース 1 で荷重を 200 N にしたら、R6 対策後の最大応力はいくらか (Kt = 1.4)。", a: "M = 200 × 100 = 20 000 N·mm、σ<sub>n</sub> = 20 000 / 240 = 83.3 MPa、最大 = 83.3 × 1.4 ≈ <b>117 MPa</b>。補正後の疲労限度 140 MPa 程度に対し余裕は小さい (安全率 約 1.2)。" },
      { q: "板厚を 6 mm から 8 mm にすると、公称曲げ応力は何倍になるか。", a: "Z ∝ t² なので (6/8)² = <b>0.5625 倍</b> (約 44% 減)。150 N の条件で 62.5 → 35.2 MPa。" },
      { q: "溶接継手の疲労対策を 3 つ挙げよ。", a: "① 溶接位置を低応力部へ移す ② 止端をグラインダ仕上げ・TIG ドレッシングでなめらかにする ③ 剛性の急変を避ける (テーパ・回し溶接)。ほかにショットピーニングで圧縮残留応力を与える方法もある。" },
    ],
    quiz: [
      { q: "公称応力 50 MPa、Kt = 3 の切欠きの最大応力は?", choices: ["17 MPa", "50 MPa", "150 MPa", "450 MPa"], answer: 2, explain: "最大応力 = 公称応力 × Kt = 150 MPa。" },
      { q: "応力集中を下げる最も基本的な対策は?", choices: ["材料を硬くする", "角に R を付ける", "塗装する", "穴を増やす"], answer: 1, explain: "R を大きくすると Kt が下がる。r/t が大きいほど効果的。" },
      { q: "補強板の溶接端で割れた原因として最も適切なのは?", choices: ["溶接が長すぎた", "剛性急変部と溶接止端が重なった", "材料が軟らかすぎた", "ボルトがゆるんだ"], answer: 1, explain: "剛性急変による応力集中と止端の形状集中・残留応力が重なった。" },
    ],
    lessons: ["7-1"],
  },

  /* 2 ------------------------------------------------------------ */
  {
    id: "case-frame-resonance",
    part: "knowhow",
    title: "ケース: モーターとフレームの共振",
    minutes: 15,
    level: 2,
    lead: "強度は十分なのに、ある回転数でだけ装置が大きく揺れる。共振は「固有振動数」と「加振周波数」の関係で決まります。計算で原因を特定し、剛性で解決した例です。",
    body: `
<h2>ケース 1: 1500 rpm で架台が大きく揺れる</h2>
<h3>状況</h3>
<p>4 極モーター (約 1500 rpm) とファンを載せた鋼製架台。試運転でモーター上部が横方向に大きく揺れ、ボルトのゆるみと騒音が発生した。架台上の質量は約 40 kg。</p>
<h3>原因</h3>
<p>加振周波数 f = 1500 / 60 = <b>25 Hz</b>。打撃試験で架台の横方向固有振動数を測ると f<sub>n</sub> = 27 Hz だった。</p>
<div class="tb-math">\\begin{aligned} \\text{振動数比}\\ r &= 25 / 27 = 0.93 \\\\ \\text{応答倍率 (減衰なし)} &= \\dfrac{1}{|1 - r^2|} = \\dfrac{1}{1 - 0.857} \\approx \\mathbf{7.0} \\end{aligned}</div>
<p>架台の横剛性は k = (2π·27)² × 40 ≈ 1.15 × 10<sup>6</sup> N/m。縦方向だけを考えて設計し、横方向の剛性が不足していた。</p>
<h3>対策</h3>
<p>斜材 (ブレース) を追加して横剛性を約 4 倍に。f<sub>n</sub> ∝ √k なので 27 × 2 = <b>54 Hz</b>。r = 0.46、倍率 = 1 / (1 − 0.215) ≈ 1.27 に低下した。</p>
FIGURE1
<p class="tb-caption">図: 斜材 1 本で横剛性が大きく上がり、固有振動数が運転周波数から離れる</p>
<h3>教訓</h3>
<ul><li>回転機を載せる構造は、<b>運転周波数と固有振動数の比</b>を必ず確認 (目安: f<sub>n</sub> は運転周波数の 2 倍以上、または √2 倍以下で防振)</li><li>門形フレームは横方向が弱い。斜材・ガセットで三角形を作る</li></ul>

<h2>ケース 2: インバーター可変速で、途中の速度だけ揺れる</h2>
<h3>状況</h3>
<p>コンベヤの駆動をインバーターで 10〜30 Hz 可変にしたところ、約 18 Hz 付近でカバーがビビり音を出した。</p>
<h3>原因</h3>
<p>運転範囲が広いと、どこかで固有振動数を<b>通過</b>する。カバー板 (薄板) の固有振動数が 18 Hz 付近にあった。</p>
<h3>対策</h3>
<ul><li>カバーにビードや折り曲げを入れて固有振動数を運転範囲外 (30 Hz 超) へ</li><li>当面はインバーターの「ジャンプ周波数」(回避周波数) を設定して 16〜20 Hz を常用しない</li><li>制振材を貼って減衰を増やす</li></ul>
<h3>教訓</h3>
<p>可変速機では「1 点の運転周波数」ではなく<b>周波数範囲</b>で共振を確認する。</p>
`.replace("FIGURE1", FIG_RESONANCE),
    points: [
      "f = rpm / 60、fn = (1/2π)√(k/m)",
      "振動数比が 1 に近いと応答が何倍にもなる",
      "剛性を 4 倍にすると固有振動数は 2 倍",
      "可変速では周波数範囲で確認、ジャンプ周波数も有効",
    ],
    exercises: [
      { q: "6 極モーター (約 1000 rpm) の加振周波数と、それを避けるための fn の目安 (2 倍以上) を求めよ。", a: "f = 1000 / 60 ≈ <b>16.7 Hz</b>。fn ≥ <b>約 33 Hz</b> を目標にする。" },
      { q: "ケース 1 の架台で、剛性を変えず質量を 40 kg → 60 kg にすると fn はいくらか。", a: "fn ∝ 1/√m。27 × √(40/60) = 27 × 0.816 ≈ <b>22 Hz</b>。運転 25 Hz との比は 1.14 で、まだ共振域 (倍率 1/|1−1.29| ≈ 3.4)。質量追加は解決にならない。" },
      { q: "fn を 27 Hz → 60 Hz にするには剛性を何倍にすればよいか。", a: "k ∝ fn² より (60/27)² = <b>約 4.9 倍</b>。" },
    ],
    quiz: [
      { q: "1800 rpm の回転体の加振周波数は?", choices: ["18 Hz", "30 Hz", "60 Hz", "180 Hz"], answer: 1, explain: "1800 / 60 = 30 Hz。" },
      { q: "剛性を 4 倍にすると固有振動数は?", choices: ["1/2", "2 倍", "4 倍", "16 倍"], answer: 1, explain: "fn ∝ √k なので 2 倍。" },
      { q: "インバーターで特定の速度域を避ける設定は?", choices: ["トルクブースト", "ジャンプ周波数", "キャリア周波数", "加速時間"], answer: 1, explain: "ジャンプ (回避) 周波数で共振域を常用しないようにできる。" },
    ],
  },

  /* 3 ------------------------------------------------------------ */
  {
    id: "case-snap-fit",
    part: "design",
    title: "ケース: スナップフィットの折損",
    minutes: 12,
    level: 2,
    lead: "樹脂ケースのスナップフィットが組立中に折れる、数回の開閉で白化する。ひずみの簡単な式で、腕の長さと根元形状を見直した例です。",
    body: `
<h2>ケース 1: 組立時にツメが折れる</h2>
<h3>状況</h3>
<p>PC (ポリカーボネート) 製ケース。片持ち形スナップの腕長さ L = 8 mm、根元の厚さ t = 2 mm、引っかかり (たわみ量) y = 1.5 mm。量産初期に組立工程で 2% 程度が折損した。</p>
<h3>原因</h3>
<p>片持ち形スナップの最大ひずみ (長方形断面・一様断面)</p><div class="tb-math">\\varepsilon = \\dfrac{1.5\\, t\\, y}{L^2} = \\dfrac{1.5 \\times 2 \\times 1.5}{8^2} = \\dfrac{4.5}{64} \\approx \\mathbf{7.0\\%}</div>
<p>PC の許容ひずみ (1 回の組付け) は約 4% が目安。大きく超えていた。根元も R なしの鋭角で、実際のひずみはさらに大きかった。</p>
<h3>対策</h3>
<ul><li>腕を L = 14 mm に延長: ε = 4.5 / 196 ≈ <b>2.3%</b></li><li>根元に R = 0.5t 程度を付ける</li><li>腕をテーパ (先端を薄く) にすると、ひずみが均一になり同じたわみで根元ひずみが下がる</li></ul>
FIGURE1
<p class="tb-caption">図: 腕を長くし根元に R を付けると、同じ引っかかり量でもひずみが下がる</p>

<h2>ケース 2: メンテナンス用カバーのツメが数回の開閉で白化</h2>
<h3>状況</h3>
<p>電池交換のたびに外すカバー。新品では問題ないが、10 回程度で根元が白化し、ツメが戻らなくなった。</p>
<h3>原因</h3>
<p>1 回しか外さない前提の許容ひずみで設計していた。繰返し使うスナップでは許容値を 1 回用の 6 割程度に下げるのが一般的な目安。</p>
<h3>対策</h3>
<p>繰返し用として ε ≤ 4% × 0.6 = 2.4% で再設計。外すための指掛かり・解除方向の表示も追加した。</p>
<h3>教訓</h3>
<ul><li>スナップの破損は「ひずみ」で評価する。<b>ε ∝ t·y / L²</b>: 長さが最も効く</li><li>使用回数 (1 回 / 繰返し) で許容ひずみを変える</li><li>根元 R・テーパ腕・材料のクリープも考慮</li></ul>
`.replace("FIGURE1", FIG_SNAP),
    points: [
      "片持ちスナップのひずみ ε = 1.5·t·y / L²",
      "L を 1.5 倍にするとひずみは約 0.44 倍",
      "繰返し使用は許容ひずみを下げる (目安 6 割)",
      "根元には R を付ける",
    ],
    exercises: [
      { q: "t = 1.5 mm、y = 1.2 mm、L = 10 mm のひずみを求めよ。", a: "ε = 1.5 × 1.5 × 1.2 / 100 = 2.7 / 100 = <b>2.7%</b>。" },
      { q: "PC (許容 4%) で t = 2、y = 1.5 のとき、1 回組付け用に必要な最小 L は?", a: "L² ≥ 1.5 × 2 × 1.5 / 0.04 = 112.5 → L ≥ <b>10.6 mm</b> (11 mm 以上)。" },
      { q: "厚さ t を半分にするとひずみはどうなるか (他は同じ)。また何に注意すべきか。", a: "ε ∝ t なので<b>半分</b>。ただし保持力 (引き抜き力) も下がるので、保持力の確認が必要。" },
    ],
    quiz: [
      { q: "スナップのひずみを最も効果的に下げるのは?", choices: ["厚さを増す", "腕を長くする", "引っかかりを深くする", "根元を鋭くする"], answer: 1, explain: "ε ∝ 1/L² なので長さが最も効く。" },
      { q: "繰返し着脱するスナップの許容ひずみは?", choices: ["1 回用より高くしてよい", "1 回用と同じ", "1 回用より下げる", "考えなくてよい"], answer: 2, explain: "繰返しでは疲労・白化があるため下げる (目安 6 割)。" },
      { q: "ε = 1.5·t·y/L² で t = 2、y = 1、L = 10 のひずみは?", choices: ["0.3%", "3%", "30%", "1.5%"], answer: 1, explain: "1.5 × 2 × 1 / 100 = 0.03 = 3%。" },
    ],
  },

  /* 4 ------------------------------------------------------------ */
  {
    id: "case-pinch-point",
    part: "knowhow",
    title: "ケース: はさまれ箇所とライトカーテンの距離",
    minutes: 15,
    level: 2,
    lead: "ヒヤリハットの報告から見つかった 2 つの危険: 閉じるすき間と、近すぎる安全装置。どちらも「数値で決める」ことで防げます。",
    body: `
<h2>ケース 1: 移動テーブルと固定フレームのすき間</h2>
<h3>状況</h3>
<p>手動で段取りする位置決めテーブル。原点復帰で、テーブル端と固定フレームのすき間が 40 mm から 0 mm まで閉じる。清掃中の作業者の指がはさまれそうになった。</p>
<h3>原因</h3>
<p>開いているときのすき間 40 mm は指 (およそ 25 mm 未満で危険) も手も入る大きさで、閉じると<b>押しつぶし</b>になる。設計時に「人がそこに手を入れる」ことを想定していなかった。</p>
<h3>対策</h3>
<ul><li>メカストッパで最接近を 25 mm 以上に制限 (ISO 13854 の指の最小すき間: 25 mm)</li><li>それができない箇所は固定ガードで覆う、または清掃は停止・遮断状態で行う手順とインターロック</li></ul>
FIGURE1
<p class="tb-caption">図: 閉じる部分に最小すき間を確保するか、手が入らないようにする</p>
<table class="tb-table"><tr><th>身体部位</th><th>押しつぶしを避ける最小すき間 (ISO 13854)</th></tr>
<tr><td>体</td><td>500 mm</td></tr><tr><td>頭</td><td>300 mm</td></tr><tr><td>脚</td><td>180 mm</td></tr><tr><td>腕</td><td>120 mm</td></tr><tr><td>手・手首・こぶし</td><td>100 mm</td></tr><tr><td>指</td><td>25 mm</td></tr></table>

<h2>ケース 2: ライトカーテンが危険源に近すぎる</h2>
<h3>状況</h3>
<p>プレス工程の前面に分解能 14 mm のライトカーテンを、危険源から 300 mm の位置に取り付けていた。停止時間を実測すると T = 0.3 s (カーテン応答 + 制御 + 機械停止) だった。</p>
<h3>原因</h3>
<div class="tb-math">\\begin{aligned} S &= K \\cdot T + C \\qquad (\\text{ISO 13855、垂直検出面}) \\\\ C &= 8(d - 14) = 0 \\qquad (d = 14\\,\\mathrm{mm}) \\end{aligned}</div><p>K = 2000 mm/s: <span class="tb-m">S = 2000 \\times 0.3 = 600\\,\\mathrm{mm}</span> (&gt; 500 なので K = 1600 で再計算)<br>K = 1600 mm/s: <span class="tb-m">S = 1600 \\times 0.3 = 480\\,\\mathrm{mm}</span> → 最小値 500 mm を採用</p>
<p>必要な距離 500 mm に対し 300 mm では、<b>機械が止まる前に手が届く</b>。</p>
<h3>対策</h3>
<p>取付位置を 500 mm に後退し、すき間からの回り込みを側面ガードで塞いだ。停止時間は定期点検で実測する項目に入れた。</p>
FIGURE2
<p class="tb-caption">図: 安全距離は停止時間から計算する</p>
<h3>教訓</h3>
<ul><li>動くものと固定物の間は、<b>すべて「はさまれ箇所」として洗い出す</b></li><li>安全装置の位置は「感覚」でなく停止時間からの計算で決める。停止時間は経年で伸びる</li></ul>
`.replace("FIGURE1", FIG_PINCH).replace("FIGURE2", FIG_CURTAIN),
    points: [
      "指 25 mm・手 100 mm・腕 120 mm などの最小すき間",
      "安全距離 S = K·T + C、C = 8(d − 14)",
      "K = 2000 で 500 mm を超えたら K = 1600 で再計算 (最小 500)",
      "停止時間は実測・定期確認する",
    ],
    exercises: [
      { q: "分解能 14 mm、停止時間 T = 0.2 s のライトカーテンの安全距離は?", a: "S = 2000 × 0.2 + 0 = <b>400 mm</b> (500 以下なのでこれを採用、最小 100 mm 以上も満たす)。" },
      { q: "分解能 30 mm、T = 0.25 s のときの安全距離は?", a: "C = 8 × (30 − 14) = 128。K = 2000: 500 + 128 = 628 &gt; 500 → K = 1600: 400 + 128 = <b>528 mm</b> (500 以上なのでそのまま)。" },
      { q: "手首が入るすき間を押しつぶしの危険なしにするには、最小何 mm 必要か。", a: "ISO 13854 では手・手首・こぶしで <b>100 mm</b>。" },
    ],
    quiz: [
      { q: "ISO 13854 で指の押しつぶしを避ける最小すき間は?", choices: ["8 mm", "25 mm", "50 mm", "100 mm"], answer: 1, explain: "指は 25 mm。" },
      { q: "安全距離の式 S = K·T + C の T は何か?", choices: ["検出分解能", "人の反応時間", "全体の停止時間", "保護高さ"], answer: 2, explain: "検出から危険が止まるまでの全停止時間。" },
      { q: "停止時間が経年で伸びたとき、必要な安全距離は?", choices: ["短くなる", "変わらない", "長くなる", "ゼロになる"], answer: 2, explain: "S は T に比例して長くなる。定期実測が必要。" },
    ],
  },

  /* 5 ------------------------------------------------------------ */
  {
    id: "case-poka-yoke",
    part: "knowhow",
    title: "ケース: 誤組付けをポカヨケで防ぐ",
    minutes: 12,
    level: 1,
    lead: "注意喚起や手順書だけでは誤組付けはゼロになりません。形状で「間違えられない」ようにした 2 つの例と、効果の見積もりです。",
    body: `
<h2>ケース 1: カバーを 180° 逆に取り付け</h2>
<h3>状況</h3>
<p>4 隅のねじで止める対称形状のカバー。内側のセンサ用穴が片側に寄っているが、外形と穴位置が対称なので 180° 回しても付いてしまう。月 2000 台の生産で月 2 件程度、出荷検査で検出。</p>
<h3>原因</h3>
<p>形が対称なのに機能は非対称。作業者が向きを判断する手がかりは「マークを見る」だけで、ミス率 0.1% = 2000 × 0.001 = 2 件/月 が発生していた。</p>
<h3>対策</h3>
<p>位置決めピンを<b>非対称</b>に 2 本配置 (1 本を対角からずらす)。逆向きではピンが入らず、物理的に組めない。</p>
FIGURE1
<p class="tb-caption">図: 非対称なピン配置で、正しい向きでしか付かないようにする</p>

<h2>ケース 2: X 軸と Y 軸のモーターケーブルを逆接続</h2>
<h3>状況</h3>
<p>同じ型式のコネクタで X 軸・Y 軸モーターを接続する。保全で交換した際に逆に接続し、原点復帰で衝突した。</p>
<h3>原因</h3>
<p>同形状・同色のコネクタで、ハーネス長にも余裕があったため、どちらにも届いた。</p>
<h3>対策</h3>
<ul><li>キー位置の異なるコネクタ (キーイング) を採用</li><li>ハーネス長を正しい位置にしか届かない長さにする</li><li>色分けとラベルは補助として併用</li></ul>
<h3>教訓</h3>
<table class="tb-table"><tr><th>レベル</th><th>方法</th><th>効果</th></tr>
<tr><td>高</td><td>形状で組めない (非対称・キー)</td><td>ミスが起きない</td></tr>
<tr><td>中</td><td>センサで検出して止める</td><td>流出しない</td></tr>
<tr><td>低</td><td>色・表示・手順書</td><td>減るがゼロにならない</td></tr></table>
<p><b>「対称なのに向きがある部品」は設計の段階で消す</b>か、完全に対称にして向きを問わない設計にする。</p>
`.replace("FIGURE1", FIG_POKA),
    points: [
      "形が対称で機能が非対称な部品は誤組付けの温床",
      "形状 (非対称ピン・キー) で防ぐのが最も確実",
      "件数 = 生産数 × ミス率 で効果を見積もる",
      "表示・色は補助と考える",
    ],
    exercises: [
      { q: "月 5000 台、誤組付け率 0.05%、手直し 1 件 30 000 円。年間の損失は?", a: "5000 × 0.0005 = 2.5 件/月 → 30 件/年 × 30 000 = <b>90 万円/年</b>。" },
      { q: "完全に対称にすることでポカヨケする方法の例を挙げよ。", a: "センサ穴を左右両側に設ける、ねじ穴を等配にして機能をどの向きでも満たすなど。「向きが関係ない」形にすれば間違いが存在しない。" },
      { q: "ケーブルの誤接続防止策を 3 つ挙げよ。", a: "① キー位置・極数の異なるコネクタ ② 正しい位置にしか届かないハーネス長 ③ 色・ラベル (補助)。" },
    ],
    quiz: [
      { q: "最も確実なポカヨケは?", choices: ["手順書", "注意ラベル", "形状で組めなくする", "ダブルチェック"], answer: 2, explain: "物理的に組めなければミスは起こらない。" },
      { q: "月 3000 台、ミス率 0.1% の誤組付けは月何件?", choices: ["0.3 件", "3 件", "30 件", "300 件"], answer: 1, explain: "3000 × 0.001 = 3 件。" },
      { q: "誤組付けが起きやすい部品は?", choices: ["完全対称で機能も対称", "形が対称で機能が非対称", "形が明らかに非対称", "1 か所しか付かない"], answer: 1, explain: "見た目で向きの区別がつかないのに向きがある部品。" },
    ],
  },

  /* 6 ------------------------------------------------------------ */
  {
    id: "case-cable-carrier",
    part: "service",
    title: "ケース: ケーブルベア内の断線",
    minutes: 12,
    level: 2,
    lead: "可動部のケーブルが半年で断線、あるいはケーブルがねじれて飛び出す。曲げ半径・収納率・固定方法の 3 点を見直した事例です。",
    body: `
<h2>ケース 1: 半年でエンコーダケーブルが断線</h2>
<h3>状況</h3>
<p>1 日 2 万往復するリニア軸。外径 d = 10 mm のエンコーダケーブルを、曲げ半径 R = 50 mm のケーブルベアに通していた。約 半年 (約 300 万回) で信号が途切れるようになった。</p>
<h3>原因</h3>
<div class="tb-math">\\text{外側素線のひずみ (目安)}\\ \\varepsilon \\approx \\dfrac{d/2}{R} = \\dfrac{5}{50} = \\mathbf{10\\%}</div>
<p>R = 5d は高屈曲ケーブルの推奨 (一般に 7.5〜10d 以上) を下回っていた。さらに、ベアに入れたのは固定配線用ケーブルだった。</p>
<h3>対策</h3>
<ul><li>R = 100 mm (10d) のケーブルベアに変更: ε ≈ 5 / 100 = 5%</li><li>可動用 (高屈曲) ケーブルに変更</li></ul>
FIGURE1
<p class="tb-caption">図: 曲げ半径を 2 倍にすると外側素線のひずみは半分になる</p>

<h2>ケース 2: ケーブルが絡んで飛び出す</h2>
<h3>状況</h3>
<p>後から追加したエアチューブと信号線を、空いているすき間に詰め込んだ。数週間後、ケーブル同士がねじれてベアから押し出された。</p>
<h3>原因</h3>
<ul><li>収納率が高すぎ (断面の 8 割以上)、ケーブルが自由に動けなかった</li><li>太いケーブルと細いケーブルを同じ区画で重ねた</li><li>両端の固定 (ストレインリリーフ) がなく、ケーブル長がずれた</li></ul>
<h3>対策</h3>
<ul><li>セパレータで区画を分け、ケーブル同士は横並び・すき間 10% 程度。収納率は 60% 程度までに</li><li>重いケーブルは外側 (左右) に、左右の重量をバランス</li><li>可動端・固定端の両方でクランプし、中立長さで固定</li></ul>
<h3>教訓</h3>
<p>ケーブルは<b>「機械要素」として寿命設計する</b>。曲げ半径・収納率・固定方法を図面とチェックリストに明記し、後からの追加にも予備スペースを残しておく。</p>
`.replace("FIGURE1", FIG_CABLE),
    points: [
      "曲げ半径はケーブル径の 7.5〜10 倍以上 (メーカー値を確認)",
      "外側素線ひずみ ≈ (d/2)/R",
      "可動部には高屈曲ケーブルを使う",
      "収納率は 60% 程度、区画分け、両端クランプ",
    ],
    exercises: [
      { q: "外径 12 mm のケーブルに推奨 10d を適用すると必要な曲げ半径は?", a: "R ≥ 10 × 12 = <b>120 mm</b>。" },
      { q: "1 日 2 万往復、年 250 日稼働。保証寿命 1000 万回のケーブルは何年もつか。", a: "2 万 × 250 = 500 万回/年 → 1000 万 / 500 万 = <b>2 年</b>。往復を 2 回と数える仕様なら 1 年になるので、寿命の数え方も確認する。" },
      { q: "R = 75 mm、d = 10 mm のとき外側素線ひずみの目安は?", a: "ε ≈ 5 / 75 ≈ <b>6.7%</b>。" },
    ],
    quiz: [
      { q: "ケーブルベアの曲げ半径を決める基準は?", choices: ["ベアの幅", "ケーブル外径の倍数", "モーター容量", "ストローク"], answer: 1, explain: "ケーブル外径 × 係数 (7.5〜10 など、メーカー指定)。" },
      { q: "ケーブルの収納率の目安は?", choices: ["100%", "90%", "60% 程度", "10%"], answer: 2, explain: "余裕を持たせ、ケーブルが自由に動けるようにする。" },
      { q: "可動部のケーブルで正しいのは?", choices: ["中央でだけ固定", "両端でクランプ", "固定しない", "テープで束ねる"], answer: 1, explain: "可動端と固定端でクランプして、ベア内で長さがずれないようにする。" },
    ],
  },

  /* 7 ------------------------------------------------------------ */
  {
    id: "case-thermal-misalign",
    part: "knowhow",
    title: "ケース: 熱変形による位置ずれ",
    minutes: 15,
    level: 2,
    lead: "朝と午後で位置決め精度が変わる、運転を続けると軸受が熱くなる。原因はわずかな温度変化による伸びが「拘束」されたことでした。",
    body: `
<h2>ケース 1: アルミレールの両端固定で午後に位置ずれ</h2>
<h3>状況</h3>
<p>鋼製ベースに長さ 1000 mm のアルミ製リニアレール台を、両端と中間をボルトで固定。工場の温度が朝から午後で 15 ℃ 上がると、ワークの位置が 0.1 mm 以上ずれた。</p>
<h3>原因</h3>
<p>線膨張係数: アルミ 23 × 10<sup>−6</sup> /K、鋼 12 × 10<sup>−6</sup> /K</p><div class="tb-math">\\begin{aligned} \\text{伸びの差} &= (23 - 12) \\times 10^{-6} \\times 1000 \\times 15 \\\\ &= \\mathbf{0.165\\,mm} \\\\ \\text{熱応力} &\\approx E \\cdot \\Delta\\alpha \\cdot \\Delta T \\\\ &= 70\\,000 \\times 11 \\times 10^{-6} \\times 15 \\approx 11.6\\,\\mathrm{MPa} \\end{aligned}</div><p>(熱応力は完全拘束したときのアルミ側の値)</p>
<p>伸びの差が両端で拘束され、アルミ台が反る・ボルトがすべるなどして位置が変わった。</p>
<h3>対策</h3>
<ul><li>位置決めの基準側を 1 か所でピン固定し、反対側は長穴 (すべり許容) にして伸びを一方向へ逃がす</li><li>精度が必要な基準寸法は「固定点から」測る</li><li>可能なら同材質 (鋼同士) にする</li></ul>
FIGURE1
<p class="tb-caption">図: 異種材料は両端固定せず、伸びる方向を決める</p>

<h2>ケース 2: 軸受の発熱が止まらない</h2>
<h3>状況</h3>
<p>モーター直結の軸 (長さ 400 mm) を両端の深溝玉軸受で、どちらも外輪を軸方向に固定した。運転 1 時間で軸受温度が上昇し続けた。</p>
<h3>原因</h3>
<p>モーターの熱で軸がハウジングより 25 ℃ 高くなると、伸び = 12 × 10<sup>−6</sup> × 400 × 25 = <b>0.12 mm</b>。両側固定なので逃げ場がなく、軸受に大きな軸方向荷重 (予圧) がかかって発熱 → さらに伸びる悪循環。</p>
<h3>対策</h3>
<p>一方を固定側、他方を<b>自由側</b> (外輪を軸方向に拘束しない、または円筒ころ軸受) に変更した。</p>
<h3>教訓</h3>
<ul><li>ΔL = α·L·ΔT。<b>1 m・10 ℃ で鋼 0.12 mm、アルミ 0.23 mm</b> を覚えておく</li><li>熱で伸びるものは「どこを基準に、どちらへ伸ばすか」を設計で決める</li></ul>
`.replace("FIGURE1", FIG_THERMAL),
    points: [
      "ΔL = α·L·ΔT (鋼 12、アルミ 23 × 10⁻⁶/K)",
      "異種材料の両端固定は反り・すべりの原因",
      "一端固定・他端自由 (長穴、自由側軸受)",
      "熱応力 ≈ E·α·ΔT (完全拘束時)",
    ],
    exercises: [
      { q: "鋼のボールねじ (長さ 800 mm) が 20 ℃ 上昇したときの伸びは?", a: "12 × 10⁻⁶ × 800 × 20 = <b>0.192 mm</b>。" },
      { q: "鋼の棒を両端完全拘束して 30 ℃ 上げたときの熱応力は? (E = 206 GPa)", a: "σ = 206 000 × 12 × 10⁻⁶ × 30 ≈ <b>74 MPa</b> (圧縮)。" },
      { q: "アルミと鋼で 500 mm、ΔT = 20 ℃ の伸び差は?", a: "11 × 10⁻⁶ × 500 × 20 = <b>0.11 mm</b>。" },
    ],
    quiz: [
      { q: "1 m の鋼が 10 ℃ 上がると伸びは約?", choices: ["0.012 mm", "0.12 mm", "1.2 mm", "12 mm"], answer: 1, explain: "12 × 10⁻⁶ × 1000 × 10 = 0.12 mm。" },
      { q: "長い軸の軸受配置で正しいのは?", choices: ["両側とも固定", "一方固定・他方自由", "両側とも自由", "中央 1 個のみ"], answer: 1, explain: "熱伸びを自由側で逃がす。" },
      { q: "アルミの線膨張係数は鋼のおよそ何倍?", choices: ["0.5 倍", "1 倍", "2 倍", "5 倍"], answer: 2, explain: "23 / 12 ≈ 2 倍。" },
    ],
  },

  /* 8 ------------------------------------------------------------ */
  {
    id: "case-molding-sink-warp",
    part: "design",
    title: "ケース: 成形品のひけと反り",
    minutes: 12,
    level: 2,
    lead: "外観面にへこみ、組み付けると隙間ができるほどの反り。どちらも肉厚の不均一から生まれます。設計変更で解決した 2 例です。",
    body: `
<h2>ケース 1: 取付ボス周りの外観ひけ</h2>
<h3>状況</h3>
<p>一般肉厚 2 mm の ABS 製パネル。内側に中実の取付部 (厚さ 5 mm) を設けたところ、表側に目立つへこみ (ひけ) が出た。成形サイクルも想定より長くなった。</p>
<h3>原因</h3>
<div class="tb-math">\\text{冷却時間} \\propto (\\text{肉厚})^2 \\qquad \\left(\\dfrac{5}{2}\\right)^2 = \\mathbf{6.25}\\ \\text{倍}</div>
<p>厚い部分が遅れて固まり、収縮が表面を内側へ引き込んだ。サイクルは最も厚い部分の冷却で決まる。</p>
<h3>対策</h3>
<ul><li>中実部を肉抜きして均一肉厚 (2 mm) に</li><li>剛性はリブ (厚さ 0.5〜0.6 t = 1.0〜1.2 mm) で確保</li><li>ボスは中空にし、根元をリブでつなぐ</li></ul>
FIGURE1
<p class="tb-caption">図: 厚肉を肉抜きし、リブで剛性を補う</p>

<h2>ケース 2: 箱形ケースの反り</h2>
<h3>状況</h3>
<p>ガラス繊維入り PA の細長いケース (長さ 250 mm)。成形後、長手方向に 1 mm 以上反り、ふたと隙間ができた。</p>
<h3>原因</h3>
<ul><li>底面 3 mm、側面 1.5 mm と肉厚差があり、収縮量が場所で違った</li><li>端部ゲートで繊維が長手方向にそろい、流れ方向と直角方向で収縮率が異なった (異方性)</li></ul>
<h3>対策</h3>
<ul><li>肉厚を 2 mm に統一</li><li>ゲートを中央に移し流れを対称に</li><li>長手方向に対称なリブを配置して剛性を上げ、反りを抑える</li></ul>
<h3>教訓</h3>
<p>成形品の不具合の多くは<b>肉厚の不均一</b>が根本原因。「部分的に厚くして強くする」のではなく、<b>均一肉厚 + リブ</b>で強くする。ゲート位置も設計段階で成形メーカーと相談する。</p>
`.replace("FIGURE1", FIG_MOLD),
    points: [
      "冷却時間は肉厚の 2 乗に比例",
      "ひけ・ボイド・反りの根本は肉厚の不均一",
      "リブ厚は 0.5〜0.6 t",
      "繊維入り材は流れ方向で収縮率が違う",
    ],
    exercises: [
      { q: "肉厚を 3 mm から 2 mm にすると冷却時間はどうなるか。", a: "(2/3)² = 0.44 → <b>約 56% 短縮</b>。" },
      { q: "一般肉厚 2.5 mm のときのリブ厚の目安は?", a: "0.5〜0.6 × 2.5 = <b>1.25〜1.5 mm</b>。" },
      { q: "ひけを外観で目立たなくする設計上の工夫を 2 つ挙げよ (肉厚変更以外)。", a: "① ひけが出やすい位置の表面にシボ (テクスチャ) や段差・意匠線を設ける ② リブの位置を外観面から見えにくい所に寄せる、など。" },
    ],
    quiz: [
      { q: "肉厚が 2 倍になると冷却時間は?", choices: ["同じ", "2 倍", "4 倍", "8 倍"], answer: 2, explain: "冷却時間 ∝ t² で 4 倍。" },
      { q: "ひけの主な原因は?", choices: ["肉厚が薄すぎる", "局部的な厚肉", "金型温度が一定", "抜き勾配"], answer: 1, explain: "厚肉部が遅れて収縮し表面を引き込む。" },
      { q: "剛性を上げる正しい方法は?", choices: ["全体を厚くする", "リブを付ける", "中実ボスにする", "肉厚を不均一にする"], answer: 1, explain: "均一肉厚 + リブが原則。" },
    ],
  },

  /* 9 ------------------------------------------------------------ */
  {
    id: "case-maintenance-access",
    part: "service",
    title: "ケース: 忘れられたメンテナンス性",
    minutes: 12,
    level: 1,
    lead: "設計時には完璧だった装置が、現場で保全されずに故障する。「やりにくい保全は行われない」ことを示す 2 つの事例です。",
    body: `
<h2>ケース 1: フィルタ交換に 15 分</h2>
<h3>状況</h3>
<p>制御盤の冷却ファンフィルタは月 1 回の清掃が必要。しかし後面パネルの M4 ねじ 12 本を外さないとアクセスできず、装置を壁から離す必要もあった。結果として清掃が行われず、盤内温度が上がってインバーターが停止した。</p>
<h3>原因</h3>
<p>アクセスを考えずに配置した。作業時間の見積もり:</p>
<div class="tb-math">\\begin{aligned} &15\\ \\text{分} \\times 12\\ \\text{回/年} \\times 50\\ \\text{台} = 9000\\ \\text{分} = \\mathbf{150}\\ \\textbf{時間/年} \\\\ &\\text{改善後 2 分:}\\ 2 \\times 12 \\times 50 = 1200\\ \\text{分} = 20\\ \\text{時間/年}\\ \\ (\\text{差 130 時間}) \\end{aligned}</div>
<h3>対策</h3>
<ul><li>フィルタを前面のヒンジ扉に移し、工具不要のワンタッチで外せる構造に</li><li>目詰まりが見える位置にし、差圧や温度の監視も追加</li></ul>
FIGURE1
<p class="tb-caption">図: 日常保全の対象は、前面から工具なしで</p>

<h2>ケース 2: 給脂されない軸受</h2>
<h3>状況</h3>
<p>グリースニップルがベルトカバーの内側にあり、給脂のたびにカバーを外す必要があった。給脂が省略され、軸受が 1 年で焼き付いた。</p>
<h3>対策</h3>
<p>給脂配管を延長し、カバー外の集中給脂ブロックにまとめた。給脂周期と量を銘板に表示した。</p>
<h3>教訓</h3>
<table class="tb-table"><tr><th>頻度</th><th>アクセスの目標</th></tr>
<tr><td>毎日〜毎週</td><td>カバーを外さず、外から目視・操作できる</td></tr>
<tr><td>毎月</td><td>工具なしで開けられる扉の内側</td></tr>
<tr><td>年 1 回程度</td><td>工具を使ってもよい</td></tr></table>
<p>保全の<b>頻度に応じてアクセスのしやすさを決める</b>。設計審査では「誰が・どの頻度で・何分で」できるかを確認する。</p>
`.replace("FIGURE1", FIG_ACCESS),
    points: [
      "やりにくい保全は行われない",
      "頻度が高い作業ほど、工具なし・前面から・目視できる位置に",
      "保全時間 × 頻度 × 台数 で効果を見積もる",
      "給脂点は集中給脂などで外へ出す",
    ],
    exercises: [
      { q: "週 1 回の点検に 10 分かかり、改善で 3 分になる。20 台・年 50 週で何時間削減?", a: "(10 − 3) × 50 × 20 = 7000 分 = <b>約 117 時間/年</b>。" },
      { q: "ケース 1 で保全員の人件費 4000 円/時とすると、年間の削減額は?", a: "130 時間 × 4000 = <b>52 万円/年</b>。" },
      { q: "設計審査で保全性を確認するための質問を 3 つ挙げよ。", a: "① どの部品を、どの周期で点検・交換するか ② 工具・停止・カバー外しは必要か、何分かかるか ③ 交換部品の重さ・手が入るすき間・照明は十分か、など。" },
    ],
    quiz: [
      { q: "毎日の点検箇所として望ましいのは?", choices: ["工具でカバーを外す", "外から目視できる", "装置を移動して後面", "分解が必要"], answer: 1, explain: "頻度が高いほど外から見える・触れる位置に。" },
      { q: "15 分の作業を月 1 回、10 台で行うと年間何時間?", choices: ["2.5 時間", "15 時間", "30 時間", "150 時間"], answer: 2, explain: "15 × 12 × 10 = 1800 分 = 30 時間。" },
      { q: "ベルトカバー内の給脂点の改善策は?", choices: ["給脂をやめる", "集中給脂で外へ出す", "カバーを外したままにする", "注意書きを貼る"], answer: 1, explain: "配管で給脂点を外へ出し、カバーを外さずにできるようにする。" },
    ],
  },

  /* 10 ------------------------------------------------------------ */
  {
    id: "case-bolt-loosening",
    part: "knowhow",
    title: "ケース: 振動でボルトがゆるむ",
    minutes: 15,
    level: 2,
    lead: "ばね座金を入れたのにゆるむ。ボルトのゆるみ止めの本質は「部品」ではなく「軸力」です。計算で原因を確認した 2 つの例を見ます。",
    body: `
<h2>ケース 1: 振動フィーダの取付ボルトが毎月ゆるむ</h2>
<h3>状況</h3>
<p>M8 (強度区分 8.8) 4 本で振動フィーダを固定。ばね座金を使用していたが、毎月数本がゆるんでいた。締付けは作業者の手感覚 (実測で約 10 N·m) だった。ボルト 1 本あたりの横方向の変動荷重は最大 1.5 kN。</p>
<h3>原因</h3>
<div class="tb-math">\\text{軸力}\\ F = \\dfrac{T}{K \\cdot d} \\qquad (\\text{トルク係数}\\ K \\approx 0.2)</div><p>現状: <span class="tb-m">F = 10\\,000 / (0.2 \\times 8) = 6250\\,\\mathrm{N}</span> → 摩擦で耐えられる横荷重 <span class="tb-m">\\mu F = 0.15 \\times 6250 \\approx 940\\,\\mathrm{N} \\lt 1500\\,\\mathrm{N}</span><br>規定 25 N·m: <span class="tb-m">F = 25\\,000 / 1.6 \\approx 15\\,600\\,\\mathrm{N}</span> → <span class="tb-m">\\mu F \\approx 2340\\,\\mathrm{N} \\gt 1500\\,\\mathrm{N}</span></p>
<p>軸力不足で接合面がすべり、すべりの繰返しでねじが回転してゆるんだ (横振動によるゆるみ)。ばね座金はこの種のゆるみを防げないことが試験で知られている。</p>
<h3>対策</h3>
<ul><li>トルクレンチで規定トルク 25 N·m を管理 (締付け後にマーキング)</li><li>横荷重をボルトで受けず、ノックピンや段付き (位置決め面) で受ける</li></ul>
FIGURE1
<p class="tb-caption">図: 摩擦力 (μ × 軸力) が横荷重より大きければ、すべらず、ゆるまない</p>

<h2>ケース 2: 塗装面を挟んだボルトのへたり</h2>
<h3>状況</h3>
<p>塗装されたフレーム同士をボルトで締結。数週間後、トルクを確認すると大きく低下していた。</p>
<h3>原因</h3>
<p>塗膜が圧縮されて薄くなり (へたり)、ボルトの伸びが減って軸力が低下した。ボルトの伸び量自体が小さい (グリップ長が短い) と、わずかなへたりでも軸力が大きく失われる。</p>
<h3>対策</h3>
<ul><li>締結面は塗装しない (マスキング)</li><li>グリップ長を長くする (カラーを使う) とボルトのばねが柔らかくなり、へたりに強い</li><li>初期なじみ後に増し締め</li></ul>
<h3>教訓</h3>
<p>ゆるみ止めの基本は<b>「十分な軸力」と「すべらない構造」</b>。ゆるみ止め部品に頼る前に、軸力・横荷重・へたりを数値で確認する。</p>
`.replace("FIGURE1", FIG_BOLT),
    points: [
      "軸力 F = T / (K·d)、K ≈ 0.2",
      "すべらない条件: μ·F > 横荷重",
      "ばね座金は横振動のゆるみを防げない",
      "締結面の塗装・短いグリップ長はへたりで軸力低下",
    ],
    exercises: [
      { q: "M10 を 45 N·m で締めたときの軸力 (K = 0.2) は?", a: "F = 45 000 / (0.2 × 10) = <b>22 500 N</b>。" },
      { q: "M8 ボルト 4 本 (各軸力 15 kN)、μ = 0.15 の継手が受けられる横荷重の合計は?", a: "0.15 × 15 000 × 4 = <b>9000 N</b>。" },
      { q: "M8 (8.8) の有効断面積 36.6 mm²、軸力 15.6 kN のときの引張応力は? 耐力 640 MPa に対して何 % か。", a: "15 600 / 36.6 ≈ <b>426 MPa</b>、426 / 640 ≈ <b>67%</b>。締付け時のねじりも加わるので、通常はこの程度が上限の目安。" },
    ],
    quiz: [
      { q: "トルク 20 N·m、M8、K = 0.2 の軸力は?", choices: ["1.25 kN", "12.5 kN", "125 kN", "2.5 kN"], answer: 1, explain: "20 000 / (0.2 × 8) = 12 500 N。" },
      { q: "横振動によるゆるみを防ぐ最も基本的な方法は?", choices: ["ばね座金", "十分な軸力", "平座金を 2 枚", "ボルトを太く見せる"], answer: 1, explain: "摩擦で横荷重を受けられる軸力を確保する。" },
      { q: "締結面に塗装があると?", choices: ["ゆるみにくい", "へたって軸力が下がる", "関係ない", "トルクが上がる"], answer: 1, explain: "塗膜のへたりで軸力が低下する。" },
    ],
  },

  /* 11 ------------------------------------------------------------ */
  {
    id: "case-ui-mode-error",
    part: "ux",
    title: "ケース: 操作パネルのモードエラー",
    minutes: 12,
    level: 1,
    lead: "「手動のつもりで押したら自動で動いた」「10 mm のつもりが 10 倍動いた」。人のミスに見える事故の多くは、画面と操作の設計で防げます。",
    body: `
<h2>ケース 1: 自動モードのまま START を押した</h2>
<h3>状況</h3>
<p>操作パネルの START ボタンは、手動モードでは選んだ 1 軸だけを動かし、自動モードではサイクル全体を開始する。モードは画面の隅に小さく「mode: AUTO」と表示されていた。段取り中の作業者が手動のつもりで START を押し、全軸が動いてワークが落下した。</p>
<h3>原因</h3>
<ul><li><b>同じ操作がモードによって別の結果</b>になる (モードエラーの典型)</li><li>現在のモードが目立たず、作業者の注意は手元のワークにあった</li><li>モードの切替が画面タッチ 1 回で、意図せず変わることがあった</li></ul>
<h3>対策</h3>
<ul><li>モードを画面上部の大きな色帯で常時表示 (自動 = 黄、手動 = 青など)</li><li>モード切替をキースイッチにして、意図的な操作にする</li><li>手動ではホールド・トゥ・ラン (押している間だけ動く) にし、START の意味を変えない</li></ul>
FIGURE1
<p class="tb-caption">図: 状態は大きく常時表示し、モード切替は意図的な操作にする</p>

<h2>ケース 2: 移動量の単位の取り違え</h2>
<h3>状況</h3>
<p>ジョグ送りの入力欄に「10」と入力。作業者は 1 mm 単位のつもりだったが、設定画面で単位が 0.1 mm から 1 mm に変更されていたため、想定の 10 倍動いた。</p>
<h3>対策</h3>
<ul><li>入力欄のすぐ横に単位を表示 (「10 mm」)</li><li>移動量に上限を設け、大きな値は確認ダイアログ</li><li>単位や倍率の設定は保守者権限に限定し、変更履歴を残す</li></ul>
<h3>教訓</h3>
<ul><li>モードはできるだけ減らす。残すなら<b>常に見える・切替は意図的・危険な操作の意味を変えない</b></li><li>数値には必ず単位を併記し、範囲をチェックする</li><li>「作業者の不注意」で片付けず、なぜ間違えられたかを設計に戻す</li></ul>
`.replace("FIGURE1", FIG_MODE),
    points: [
      "モードエラー: 同じ操作がモードで別の結果になる",
      "現在の状態を大きく常時表示する",
      "モード切替・危険な操作は意図的な操作に (キー・ホールド)",
      "数値には単位を併記し範囲チェック",
    ],
    exercises: [
      { q: "モードエラーを減らす設計方針を 3 つ挙げよ。", a: "① モード数を減らす ② 現在のモードを目立つ方法で常時表示 ③ 危険な操作はモードで意味を変えない (または切替にキー・確認を要求)。" },
      { q: "ジョグ移動量の上限を 50 mm とし、それ以上は確認を求める仕様の利点と欠点を述べよ。", a: "利点: 桁違い入力による大移動を防げる。欠点: 正当な大移動のたびに確認が出て、慣れると確認が形骸化する。頻度に応じて上限を決め、確認画面には移動量と単位を大きく表示する。" },
      { q: "このケースを「ヒューマンエラー」と報告書に書くだけで済ませるべきでない理由は?", a: "原因が人にあるとすると対策が「注意する」になり再発する。モードの表示・切替・単位の設計という<b>仕組みの原因</b>を直せば、だれが操作しても防げるため。" },
    ],
    quiz: [
      { q: "モードエラーとは?", choices: ["入力値の誤り", "同じ操作がモードで別の結果になることによる誤り", "ボタンの故障", "通信エラー"], answer: 1, explain: "現在のモードを誤認して操作するエラー。" },
      { q: "モード切替を意図的にする方法として適切なのは?", choices: ["画面の隅のアイコン", "キースイッチ", "長押し不要のボタン", "自動切替"], answer: 1, explain: "キースイッチなどで誤操作で変わらないようにする。" },
      { q: "数値入力欄の改善として最も基本的なのは?", choices: ["色を変える", "単位を併記する", "フォントを小さくする", "入力欄を広げる"], answer: 1, explain: "単位を併記し、範囲チェックを行う。" },
    ],
  },
];
