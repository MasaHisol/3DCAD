import type { TextChapter } from "../types";

/* ---------- 第 1 章 R&D 用装置 ---------- */

/** アルミフレームの縦柱 (溝付き) */
function post(x: number, y: number, h: number): string {
  return `<rect class="k-alu" x="${x}" y="${y}" width="16" height="${h}" rx="2"/><line class="k-thin" x1="${x + 8}" y1="${y + 4}" x2="${x + 8}" y2="${y + h - 4}"/>`;
}

const BENCH = `<svg class="tb-chart" viewBox="0 0 520 326" role="img" aria-label="アルミフレームとブレッドボードによるモジュール式試験台">
<text class="k-title lbl" x="260" y="18" text-anchor="middle">モジュール式の試験台 (R&amp;D 用)</text>
<rect class="k-ground" x="20" y="262" width="480" height="8"/>
<g class="k-shadow">${post(60, 120, 142)}${post(330, 120, 142)}
<rect class="k-alu" x="52" y="112" width="310" height="16" rx="2"/>
<rect class="k-alu" x="52" y="200" width="310" height="12" rx="2"/></g>
<rect class="k-part" x="70" y="94" width="276" height="18" rx="2"/>
<g fill="var(--tb-muted, #888)" opacity="0.7">${Array.from({ length: 13 }, (_, i) => `<circle cx="${82 + i * 21}" cy="103" r="2.2"/>`).join("")}</g>
<rect class="k-part" x="96" y="76" width="70" height="18" rx="2"/><rect class="k-alu" x="104" y="62" width="54" height="14" rx="2"/>
<circle class="k-part-h" cx="166" cy="69" r="6"/><rect class="k-rubber" x="172" y="66" width="14" height="6" rx="2"/>
<rect class="k-alu" x="214" y="40" width="12" height="54"/><rect class="k-alu" x="226" y="46" width="34" height="10"/>
<rect class="k-accent" x="252" y="56" width="16" height="22" rx="3"/><line class="k-thin" x1="260" y1="78" x2="260" y2="90" stroke-dasharray="2 2"/>
<rect class="k-copper" x="266" y="60" width="40" height="3" rx="1.5"/>
<path class="k-thin" fill="none" d="M306,61 C360,60 380,100 410,140"/>
<rect class="k-part" x="390" y="140" width="96" height="62" rx="5"/><rect class="k-screen" x="398" y="148" width="58" height="34" rx="2"/>
<polyline points="402,174 412,168 422,171 432,160 442,164 452,156" fill="none" stroke="#7fd18b" stroke-width="1.4"/>
<circle class="k-led-g" cx="472" cy="156" r="4"/><circle class="k-led-off" cx="472" cy="170" r="4"/>
<rect class="k-part" x="384" y="202" width="108" height="60" rx="3"/>
<rect class="k-glass" x="56" y="134" width="300" height="62" rx="2" opacity="0.5"/>
<circle class="k-badge" cx="40" cy="103" r="9"/><text class="k-badge-t" x="40" y="107" text-anchor="middle">1</text>
<circle class="k-badge" cx="131" cy="50" r="9"/><text class="k-badge-t" x="131" y="54" text-anchor="middle">2</text>
<circle class="k-badge" cx="200" cy="44" r="9"/><text class="k-badge-t" x="200" y="48" text-anchor="middle">3</text>
<circle class="k-badge" cx="438" cy="124" r="9"/><text class="k-badge-t" x="438" y="128" text-anchor="middle">4</text>
<circle class="k-badge" cx="40" cy="206" r="9"/><text class="k-badge-t" x="40" y="210" text-anchor="middle">5</text>
<g class="tick"><text x="40" y="290">① 格子状のねじ穴を持つブレッドボード (例: 25 mm ピッチ)</text>
<text x="40" y="304">② 手動ステージ　③ 位置を変えられるセンサ支柱　④ DAQ と PC</text>
<text x="40" y="318">⑤ 溝付きアルミフレームと保護カバー (ポリカーボネート)</text></g>
</svg>
<p class="tb-caption">図: 機能ごとのモジュールを格子穴の定盤とアルミフレームに載せる。センサの位置もステージの向きも、穴を変えるだけで組み替えられる。</p>`;

const FIXED_VS_MOD = `<svg class="tb-chart" viewBox="0 0 520 230" role="img" aria-label="溶接一体構造と長穴・スライド構造の比較">
<rect class="k-panel" x="10" y="10" width="245" height="210" rx="8"/><rect class="k-panel" x="265" y="10" width="245" height="210" rx="8"/>
<text class="k-bad-t lbl" x="132" y="32" text-anchor="middle">一体構造 (量産向き)</text>
<text class="k-good-t lbl" x="387" y="32" text-anchor="middle">調整代のある構造 (R&amp;D 向き)</text>
<rect class="k-ground" x="30" y="176" width="205" height="6"/>
<g class="k-shadow"><rect class="k-part" x="40" y="150" width="185" height="26" rx="2"/><rect class="k-part" x="110" y="80" width="22" height="70"/><rect class="k-part" x="110" y="68" width="80" height="16" rx="2"/></g>
<path class="k-edge" fill="none" d="M108,150 l-6,0 l6,-6 M134,150 l6,0 l-6,-6 M132,84 l6,6"/>
<text class="tick" x="132" y="200" text-anchor="middle">溶接: 位置を変えるには作り直し</text>
<rect class="k-ground" x="285" y="176" width="205" height="6"/>
<g class="k-shadow"><rect class="k-part" x="295" y="150" width="185" height="26" rx="2"/></g>
<rect x="320" y="158" width="130" height="8" rx="4" fill="var(--tb-bg, #fff)" class="k-thin"/>
<rect class="k-alu" x="370" y="80" width="22" height="70"/><rect class="k-alu" x="356" y="140" width="50" height="10" rx="2"/>
<circle class="k-part-h" cx="364" cy="162" r="5"/><circle class="k-part-h" cx="398" cy="162" r="5"/>
<rect class="k-alu" x="340" y="68" width="100" height="14" rx="2"/><rect x="350" y="72" width="80" height="6" rx="3" fill="var(--tb-bg, #fff)" class="k-thin"/>
<path class="k-move" fill="none" d="M330,128 H350" marker-end="url(#k-arrow-blue)"/><path class="k-move" fill="none" d="M432,128 H412" marker-end="url(#k-arrow-blue)"/>
<line class="k-dimline" x1="320" y1="198" x2="450" y2="198"/><text class="k-dimtext" x="385" y="193" text-anchor="middle">調整範囲 ±40 mm</text>
<text class="tick" x="387" y="214" text-anchor="middle">長穴 + 目盛: 位置を変えて記録できる</text>
</svg>
<p class="tb-caption">図: 量産では一体構造が剛性・コストで有利だが、試験条件が変わる R&amp;D では長穴やレールで調整代を残し、目盛で位置を記録できるようにする。</p>`;

/* ---------- 第 2 章 調整機構 ---------- */

const SCREWS = `<svg class="tb-chart" viewBox="0 0 520 250" role="img" aria-label="微動ねじと差動ねじの構造">
<text class="k-title lbl" x="260" y="18" text-anchor="middle">微動ねじ (左) と差動ねじ (右)</text>
<rect class="k-ground" x="20" y="200" width="230" height="7"/>
<g class="k-shadow"><rect class="k-part" x="30" y="150" width="60" height="50" rx="2"/></g>
<rect class="k-part" x="90" y="160" width="40" height="30" rx="3"/>
<rect class="k-part-h" x="130" y="164" width="40" height="22"/>
<g class="k-thin">${Array.from({ length: 8 }, (_, i) => `<line x1="${132 + i * 5}" y1="164" x2="${134 + i * 5}" y2="186"/>`).join("")}</g>
<rect class="k-alu" x="170" y="156" width="56" height="38" rx="4"/>
<g class="k-thin">${Array.from({ length: 9 }, (_, i) => `<line x1="174" y1="${160 + i * 4}" x2="${i % 5 === 0 ? 186 : 180}" y2="${160 + i * 4}"/>`).join("")}</g>
<line class="k-thin" x1="94" y1="175" x2="126" y2="175"/>
<circle class="k-sphere" cx="28" cy="175" r="6"/>
<path class="k-move" fill="none" d="M232,140 A20,20 0 0 1 232,210" marker-end="url(#k-arrow-blue)"/>
<text class="lbl" x="40" y="60">ピッチ p = 0.5 mm</text>
<text class="lbl" x="40" y="78">シンブル 50 目盛</text>
<text class="lbl" x="40" y="96">→ 1 目盛 = 0.5/50 = 10 µm</text>
<line class="k-thin" x1="150" y1="104" x2="150" y2="160"/>
<line class="k-thin" x1="200" y1="104" x2="198" y2="156"/>
<text class="tick" x="196" y="122">目盛付きシンブル</text>
<rect class="k-ground" x="270" y="200" width="230" height="7"/>
<g class="k-shadow"><rect class="k-part" x="280" y="140" width="50" height="60" rx="2"/></g>
<rect class="k-part-h" x="330" y="160" width="60" height="22"/>
<rect class="k-accent" x="390" y="162" width="50" height="18"/>
<rect class="k-alu" x="398" y="150" width="36" height="50" rx="2" opacity="0.85"/>
<g class="k-thin">${Array.from({ length: 11 }, (_, i) => `<line x1="${332 + i * 5.5}" y1="160" x2="${335 + i * 5.5}" y2="182"/>`).join("")}</g>
<rect class="k-alu" x="300" y="156" width="30" height="30" rx="3"/>
<path class="k-move" fill="none" d="M460,171 H490" marker-end="url(#k-arrow-blue)"/>
<text class="lbl" x="296" y="60">外ねじ p₁ = 0.50 mm (固定側)</text>
<text class="lbl" x="296" y="78">内ねじ p₂ = 0.45 mm (可動子)</text>
<text class="lbl" x="296" y="96">1 回転の移動 = p₁ − p₂ = 50 µm</text>
<line class="k-thin" x1="356" y1="104" x2="356" y2="160"/><line class="k-thin" x1="416" y1="104" x2="414" y2="150"/>
<text class="tick" x="500" y="124" text-anchor="end">回り止めされた可動子</text>
</svg>
<p class="tb-caption">図: 微動ねじの分解能は「ピッチ ÷ 1 回転の分割数」。差動ねじはピッチの近い 2 つのねじを直列にし、太く丈夫なねじのまま 1 回転あたりの移動を小さくする。</p>`;

const KINEMATIC = `<svg class="tb-chart" viewBox="0 0 520 250" role="img" aria-label="3 つの V 溝と 3 つの球によるキネマティックカップリング">
<text class="k-title lbl" x="260" y="18" text-anchor="middle">キネマティックカップリング (3 球 + 3 V 溝)</text>
<rect class="k-panel" x="10" y="28" width="250" height="212" rx="8"/><rect class="k-panel" x="270" y="28" width="240" height="212" rx="8"/>
<text class="lbl" x="135" y="48" text-anchor="middle">下側プレート (上から見る)</text>
<g class="k-shadow"><circle class="k-part" cx="135" cy="140" r="82"/></g>
${[90, 210, 330].map((a) => {
    const r = (a * Math.PI) / 180, cx = 135 + 52 * Math.cos(r), cy = 140 - 52 * Math.sin(r);
    return `<g transform="rotate(${-a} ${cx.toFixed(1)} ${cy.toFixed(1)})"><rect class="k-alu" x="${(cx - 22).toFixed(1)}" y="${(cy - 8).toFixed(1)}" width="44" height="16" rx="2"/><line class="k-edge" x1="${(cx - 22).toFixed(1)}" y1="${cy.toFixed(1)}" x2="${(cx + 22).toFixed(1)}" y2="${cy.toFixed(1)}"/></g><circle class="k-sphere" cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="8"/>`;
  }).join("")}
<circle class="k-center" cx="135" cy="140" r="3" fill="none"/>
<text class="tick" x="135" y="234" text-anchor="middle">V 溝は中心を向く (120° 間隔)</text>
<text class="lbl" x="390" y="48" text-anchor="middle">断面: 2 面で接触</text>
<g class="k-shadow"><rect class="k-part" x="300" y="70" width="180" height="40" rx="3"/></g>
<rect class="k-part-h" x="383" y="110" width="14" height="14"/>
<path class="k-alu" d="M300,140 H365 L390,165 L415,140 H480 V200 H300 Z"/>
<circle class="k-sphere" cx="390" cy="140" r="18"/>
<circle cx="377.3" cy="152.7" r="3" fill="#e53935"/><circle cx="402.7" cy="152.7" r="3" fill="#e53935"/>
<path class="k-force" fill="none" d="M466,52 V74" marker-end="url(#k-arrow-red)"/><text class="tick" x="472" y="62">予圧</text>
<text class="tick" x="390" y="222" text-anchor="middle">3 球 × 2 接触 = 6 点 → 6 自由度を一度だけ拘束</text>
</svg>
<p class="tb-caption">図: 3 つの球がそれぞれ V 溝の 2 面に接し、合計 6 点で 6 自由度をちょうど拘束する。外して戻しても同じ位置に戻る (再現性はミクロン級も可能)。</p>`;

const ABBE = `<svg class="tb-chart" viewBox="0 0 520 220" role="img" aria-label="アッベ誤差: 測定軸と機能点のずれ">
<text class="k-title lbl" x="260" y="18" text-anchor="middle">アッベ誤差 ε = L · tan θ</text>
<rect class="k-ground" x="30" y="190" width="460" height="7"/>
<g class="k-shadow"><rect class="k-part" x="40" y="170" width="440" height="20" rx="2"/></g>
<g transform="rotate(-6 250 150)"><rect class="k-alu" x="170" y="130" width="160" height="40" rx="3"/><rect class="k-alu" x="230" y="60" width="16" height="70"/><rect class="k-accent" x="246" y="62" width="24" height="12" rx="2"/></g>
<line class="k-center" x1="60" y1="150" x2="470" y2="150"/><text class="tick" x="60" y="144">目盛 (測定軸)</text>
<line class="k-center" x1="60" y1="70" x2="470" y2="70"/><text class="tick" x="60" y="64">工具・プローブの位置 (機能点)</text>
<line class="k-dimline" x1="440" y1="70" x2="440" y2="150"/><text class="k-dimtext" x="446" y="114">L</text>
<path class="k-edge" fill="none" d="M330,150 A80,80 0 0 0 329,146"/>
<text class="tick" x="340" y="146">θ (ピッチング)</text>
<line class="k-hidden" x1="238" y1="50" x2="238" y2="150"/><text class="lbl" x="246" y="48">ε (傾きによるずれ)</text>
</svg>
<p class="tb-caption">図: 測定軸と機能点が L だけ離れていると、案内のわずかな傾き θ が ε = L·tanθ の位置誤差になる。L を 0 に近づけるのが「アッベの原理」。</p>`;

/* ---------- 第 3 章 計測 ---------- */

const MEAS_SETUP = `<svg class="tb-chart" viewBox="0 0 520 280" role="img" aria-label="ロードセルと変位計を取り付けた試験装置">
<text class="k-title lbl" x="260" y="18" text-anchor="middle">押付け試験の計測系</text>
<rect class="k-ground" x="20" y="250" width="320" height="8"/>
<g class="k-shadow"><rect class="k-part" x="40" y="226" width="280" height="24" rx="2"/>
<rect class="k-part" x="56" y="40" width="22" height="186"/><rect class="k-part" x="282" y="40" width="22" height="186"/>
<rect class="k-part" x="50" y="32" width="260" height="20" rx="2"/></g>
<rect class="k-part" x="150" y="52" width="60" height="30" rx="3"/><rect class="k-part-h" x="172" y="82" width="16" height="36"/>
<rect class="k-accent" x="160" y="118" width="40" height="24" rx="3"/><text class="tick" x="122" y="134" text-anchor="end">ロードセル</text>
<rect class="k-part-h" x="174" y="142" width="12" height="30"/><path class="k-part" d="M168,172 H192 L186,184 H174 Z"/>
<rect class="k-rubber" x="140" y="184" width="80" height="16" rx="3"/><rect class="k-part" x="120" y="200" width="120" height="26" rx="2"/>
<line class="k-thin" x1="222" y1="192" x2="306" y2="192"/><text class="tick" x="310" y="196">試験片</text>
<rect class="k-alu" x="230" y="128" width="40" height="10" rx="2"/><rect class="k-alu" x="252" y="138" width="10" height="88"/>
<rect class="k-plastic" x="210" y="120" width="22" height="26" rx="3"/><line class="k-thin" x1="221" y1="146" x2="200" y2="164" stroke-dasharray="2 2"/>
<line class="k-thin" x1="232" y1="122" x2="308" y2="104"/><text class="tick" x="310" y="104">変位計 (別支柱)</text>
<circle class="k-copper" cx="214" cy="206" r="3"/><line class="k-thin" x1="217" y1="208" x2="306" y2="214"/><text class="tick" x="310" y="218">熱電対</text>
<path fill="none" stroke="#c77a3a" stroke-width="2" d="M200,128 C260,90 330,100 380,130"/>
<path fill="none" stroke="#c77a3a" stroke-width="2" d="M232,132 C300,140 340,150 380,150"/>
<path fill="none" stroke="#c77a3a" stroke-width="2" d="M217,206 C300,230 340,190 380,170"/>
<g class="k-shadow"><rect class="k-part" x="380" y="110" width="110" height="80" rx="5"/></g>
<rect class="k-screen" x="390" y="120" width="70" height="40" rx="2"/><text class="k-screen-t" x="425" y="144" text-anchor="middle">DAQ</text>
<circle class="k-led-g" cx="474" cy="132" r="4"/><text class="tick" x="435" y="208" text-anchor="middle">同期サンプリング</text>
<path class="k-thin" fill="none" d="M435,190 V246"/><rect class="k-ground" x="420" y="246" width="30" height="5"/><text class="tick" x="458" y="250">一点接地</text>
<path class="k-force" fill="none" d="M110,90 V120" marker-end="url(#k-arrow-red)"/><text class="tick" x="96" y="86">荷重</text>
</svg>
<p class="tb-caption">図: 変位計は荷重がかかる構造 (フレーム) と別の支柱に付け、フレームのたわみを測り込まない。ケーブルは信号ごとにまとめ、DAQ でまとめて接地する。</p>`;

const ALIAS = `<svg class="tb-chart" viewBox="0 0 520 210" role="img" aria-label="サンプリング周波数とエイリアシング">
<text class="k-title lbl" x="260" y="18" text-anchor="middle">サンプリングが粗いと別の波に見える (エイリアシング)</text>
<line class="k-thin" x1="30" y1="110" x2="500" y2="110"/>
<path fill="none" stroke="var(--tb-accent)" stroke-width="1.6" d="${Array.from({ length: 236 }, (_, i) => {
    const x = 30 + i * 2, y = 110 - 60 * Math.sin((2 * Math.PI * 10 * i * 2) / 470);
    return `${i ? "L" : "M"}${x},${y.toFixed(1)}`;
  }).join(" ")}"/>
<path fill="none" class="k-hidden" stroke-width="1.6" d="${Array.from({ length: 236 }, (_, i) => {
    const x = 30 + i * 2, y = 110 - 60 * Math.sin((2 * Math.PI * 1 * i * 2) / 470);
    return `${i ? "L" : "M"}${x},${y.toFixed(1)}`;
  }).join(" ")}"/>
${Array.from({ length: 10 }, (_, k) => {
    const t = (k * 470) / 9, x = 30 + t, y = 110 - 60 * Math.sin((2 * Math.PI * 10 * t) / 470);
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.5" fill="#e53935"/>`;
  }).join("")}
<text class="tick" x="30" y="194">実線: 本当の信号 (10 周期)　破線: 10 点のサンプルから見えるゆっくりした波</text>
</svg>
<p class="tb-caption">図: 信号周波数の 2 倍 (ナイキスト) 以下でサンプルすると、実在しない低い周波数が現れる。後から区別できないので、取得前にアンチエイリアスフィルタとサンプリング周波数で防ぐ。</p>`;

/* ---------- 第 4 章 特殊環境 ---------- */

const FLANGES = `<svg class="tb-chart" viewBox="0 0 520 250" role="img" aria-label="O リングシールとメタルガスケットのフランジ断面">
<text class="k-title lbl" x="260" y="18" text-anchor="middle">真空フランジのシール (断面)</text>
<rect class="k-panel" x="10" y="28" width="245" height="212" rx="8"/><rect class="k-panel" x="265" y="28" width="245" height="212" rx="8"/>
<text class="lbl" x="132" y="50" text-anchor="middle">O リング (エラストマー)</text>
<text class="lbl" x="387" y="50" text-anchor="middle">メタルガスケット (ナイフエッジ)</text>
<rect class="k-part" x="40" y="70" width="180" height="40"/><rect class="k-part" x="40" y="110" width="70" height="44"/><rect class="k-part" x="144" y="110" width="76" height="44"/>
<rect class="k-part" x="110" y="126" width="34" height="28"/>
<ellipse class="k-rubber" cx="127" cy="118" rx="16" ry="7"/>
<rect class="k-part-h" x="190" y="60" width="14" height="104"/>
<text class="tick" x="40" y="184">溝に入れてつぶす (つぶし率は溝設計で)</text>
<text class="tick" x="40" y="202">繰返し使える / 透過・ガス放出がある</text>
<text class="tick" x="40" y="220">ベーク温度に制約</text>

<path class="k-part" d="M295,70 H475 V110 H400 L392,104 L384,110 H295 Z"/>
<path class="k-part" d="M295,154 H475 V116 H400 L392,122 L384,116 H295 Z"/>
<rect class="k-copper" x="360" y="109" width="64" height="8" rx="1"/>
<rect class="k-part-h" x="445" y="60" width="14" height="104"/>
<text class="tick" x="295" y="184">刃が銅ガスケットに食い込む</text>
<text class="tick" x="295" y="202">高温ベーク可 / 超高真空向き</text>
<text class="tick" x="295" y="220">ガスケットは原則 1 回使い捨て</text>
</svg>
<p class="tb-caption">図: 高真空まではエラストマー O リングが手軽。超高真空やベーク (加熱脱ガス) が必要な系では、ナイフエッジで銅ガスケットを塑性変形させる金属シールを使う。</p>`;

const THERMAL = `<svg class="tb-chart" viewBox="0 0 520 230" role="img" aria-label="線膨張係数の違う板をボルトで固定したときの熱変形">
<text class="k-title lbl" x="260" y="18" text-anchor="middle">線膨張係数の違う部材の固定</text>
<rect class="k-panel" x="10" y="28" width="245" height="190" rx="8"/><rect class="k-panel" x="265" y="28" width="245" height="190" rx="8"/>
<text class="k-bad-t lbl" x="132" y="48" text-anchor="middle">両端を丸穴で固定</text>
<text class="k-good-t lbl" x="387" y="48" text-anchor="middle">一端固定・他端は長穴</text>
<rect class="k-part" x="30" y="120" width="205" height="22"/>
<path class="k-alu" d="M30,118 Q132,86 235,118 V100 Q132,68 30,100 Z"/>
<rect class="k-part-h" x="44" y="90" width="10" height="52"/><rect class="k-part-h" x="210" y="90" width="10" height="52"/>
<text class="tick" x="132" y="64" text-anchor="middle">反り・ボルトせん断・すべり</text>
<text class="tick" x="132" y="164" text-anchor="middle">上: アルミ (α ≈ 23×10⁻⁶ /K)</text>
<text class="tick" x="132" y="180" text-anchor="middle">下: 鋼 (α ≈ 12×10⁻⁶ /K)</text>
<rect class="k-part" x="285" y="120" width="205" height="22"/>
<rect class="k-alu" x="285" y="100" width="215" height="20"/>
<rect class="k-part-h" x="299" y="90" width="10" height="52"/>
<rect class="k-part-h" x="465" y="90" width="10" height="52"/>
<rect x="455" y="104" width="30" height="12" rx="6" fill="none" class="k-edge"/>
<path class="k-move" fill="none" d="M420,82 H460" marker-end="url(#k-arrow-blue)"/>
<text class="tick" x="387" y="164" text-anchor="middle">固定点 (左) から自由に伸びる</text>
<text class="tick" x="387" y="180" text-anchor="middle">長穴の幅 &gt; 計算した差の伸び</text>
</svg>
<p class="tb-caption">図: 線膨張係数の違う 2 部材を 2 点で拘束すると、温度変化で反りや大きな熱応力が出る。1 点を基準にして、他端は伸び方向に逃がす。</p>`;

/* ---------- 第 5 章 試作→量産 ---------- */

const PROTO_PROD = `<svg class="tb-chart" viewBox="0 0 520 270" role="img" aria-label="試作装置と量産装置の違い">
<text class="k-title lbl" x="260" y="18" text-anchor="middle">試作装置 → 量産装置</text>
<rect class="k-panel" x="10" y="28" width="235" height="232" rx="8"/><rect class="k-panel" x="255" y="28" width="255" height="232" rx="8"/>
<text class="lbl" x="127" y="48" text-anchor="middle">試作 (技術者が操作)</text>
<text class="lbl" x="382" y="48" text-anchor="middle">量産 (作業者が運転)</text>
<rect class="k-ground" x="20" y="226" width="215" height="7"/>
<rect class="k-part" x="40" y="150" width="120" height="10" rx="2"/><rect class="k-part" x="48" y="160" width="8" height="66"/><rect class="k-part" x="144" y="160" width="8" height="66"/>
<rect class="k-alu" x="60" y="110" width="12" height="40"/><rect class="k-alu" x="60" y="104" width="50" height="10"/><rect class="k-accent" x="100" y="114" width="12" height="18" rx="2"/>
<rect class="k-part" x="120" y="136" width="30" height="14" rx="2"/>
<path fill="none" stroke="#c77a3a" stroke-width="1.6" d="M106,132 C120,170 60,190 90,210"/>
<rect class="k-part" x="58" y="128" width="40" height="22" rx="2"/><rect class="k-screen" x="62" y="132" width="30" height="14"/>
<circle class="k-person" cx="196" cy="98" r="11"/>
<path class="k-person" d="M184,114 Q196,108 208,114 L212,162 L206,226 L198,226 L196,176 L194,226 L186,226 L180,162 Z"/>
<path class="k-person" d="M186,118 Q176,120 170,128 L146,140 Q144,146 150,146 L178,134 Z"/>
<text class="tick" x="30" y="248">手動調整・都度判断</text>
<rect class="k-ground" x="265" y="226" width="235" height="7"/>
<g class="k-shadow"><rect class="k-part" x="270" y="80" width="190" height="146" rx="6"/></g>
<rect class="k-glass" x="282" y="94" width="120" height="70" rx="3"/>
<rect class="k-alu" x="300" y="140" width="84" height="18" rx="2"/><rect class="k-accent" x="330" y="112" width="20" height="28" rx="2"/>
<rect class="k-part" x="270" y="176" width="190" height="6"/>
<rect class="k-rubber" x="452" y="190" width="50" height="10" rx="4"/><rect class="k-rubber" x="242" y="190" width="30" height="10" rx="4"/>
<rect class="k-yellow" x="412" y="96" width="38" height="56" rx="3"/><rect class="k-screen" x="416" y="100" width="30" height="26"/><circle class="k-yellow" cx="431" cy="140" r="7"/><circle class="k-estop" cx="431" cy="140" r="5"/>
<rect class="k-alu" x="286" y="58" width="8" height="22"/><circle class="k-led-g" cx="290" cy="54" r="5"/><circle class="k-led-off" cx="290" cy="43" r="5"/>
<text class="tick" x="290" y="248">自動搬送・レシピ固定・インターロック</text>
</svg>
<p class="tb-caption">図: 試作装置では技術者が条件を変えながら確かめる。量産装置では条件を固定し、搬送・安全・状態表示を備えて、訓練を受けた作業者が毎日同じ結果を出せるようにする。</p>`;

const WINDOW = `<svg class="tb-chart" viewBox="0 0 520 250" role="img" aria-label="プロセスウィンドウと量産の運転点">
<text class="k-title lbl" x="260" y="18" text-anchor="middle">プロセスウィンドウ (例: 加熱接合)</text>
<line class="k-thin" x1="70" y1="215" x2="480" y2="215" marker-end="url(#k-arrow)"/><line class="k-thin" x1="70" y1="215" x2="70" y2="36" marker-end="url(#k-arrow)"/>
<text class="lbl" x="478" y="236" text-anchor="end">温度 (°C)</text><text class="lbl" x="76" y="40">加圧時間 (s)</text>
<g class="tick"><text x="110" y="230" text-anchor="middle">200</text><text x="200" y="230" text-anchor="middle">220</text><text x="290" y="230" text-anchor="middle">240</text><text x="380" y="230" text-anchor="middle">260</text>
<text x="62" y="190" text-anchor="end">2</text><text x="62" y="140" text-anchor="end">4</text><text x="62" y="90" text-anchor="end">6</text></g>
<path d="M150,190 C150,110 200,70 300,64 C380,60 400,110 390,160 C380,200 320,206 230,204 C170,202 150,200 150,190 Z" fill="var(--tb-accent)" opacity="0.18" stroke="var(--tb-accent)"/>
<rect x="230" y="110" width="80" height="50" fill="none" class="k-edge" stroke-dasharray="5 3"/>
<circle cx="270" cy="135" r="5" fill="#2e9e4a"/><text class="tick" x="270" y="152" text-anchor="middle">運転点</text>
<circle cx="168" cy="186" r="5" fill="#e53935"/><text class="tick" x="176" y="182">試作で最良だった点 (端に近い)</text>
<text class="tick" x="320" y="104">量産の管理幅</text>
<text class="tick" x="404" y="80">接合不良</text><text class="tick" x="404" y="196">焼け・変形</text><text class="tick" x="96" y="66">未接合</text>
</svg>
<p class="tb-caption">図: 良品が出る条件の範囲 (色の領域) の中で、装置のばらつき (破線の管理幅) が収まる中央付近を運転点にする。試作でたまたま最良だった端の点は量産では不良を出す。</p>`;

export const EQUIPMENT2: TextChapter[] = [
  {
    id: "rnd-equipment",
    part: "equipment",
    title: "R&D 用装置の設計 — 変えやすさ・測れること・安全",
    minutes: 25,
    level: 2,
    lead: "研究開発用の装置は、何を確かめたいかが実験の途中で変わります。仕様が決まらない中で作る装置には、量産装置とは違う設計の優先順位があります。組み替えやすいモジュール構造、調整代、計測器の取付余地、構成の記録、実験中の安全、そして予算と時間の使い方を学びます。",
    body: `
<h2>R&amp;D 装置の性格: 「答えが分からない」ための装置</h2>
<p>量産装置は「決まった製品を決まった条件で」作るため、仕様を固めてから最適化します。R&amp;D 装置はその逆で、<b>条件そのものを探す</b>ための装置です。最初の実験で分かったことが次の実験の仕様を変えるので、要求は途中で必ず変わると考えます。設計の優先順位はおおむね次のようになります。</p>
<table class="tb-table">
  <tr><th>観点</th><th>量産装置</th><th>R&amp;D 装置</th></tr>
  <tr><td>仕様</td><td>固定・詳細</td><td>未確定・変化する</td></tr>
  <tr><td>重視するもの</td><td>タクト・信頼性・コスト</td><td>変えやすさ・測れること・早く始められること</td></tr>
  <tr><td>操作者</td><td>訓練された作業者</td><td>技術者・研究者 (装置の中身を触る)</td></tr>
  <tr><td>台数</td><td>複数台・長期</td><td>1 台・数か月〜数年</td></tr>
</table>

<h2>変えやすさ: モジュール化と調整代</h2>
${BENCH}
<ul>
  <li><b>格子穴の定盤 (ブレッドボード)</b>: 一定ピッチのねじ穴に部品を固定すれば、穴あけなしで配置を変えられる。基準端面やピンを設けると位置の再現もできる。</li>
  <li><b>溝付きアルミフレーム</b>: ナットを溝に入れて任意の位置に固定できる。剛性は溶接鋼構造に劣るので、振動や大荷重がかかる部分は別に検討する。</li>
  <li><b>機能ごとのモジュール</b>: 「駆動」「試料保持」「計測」「加熱」などを独立した板やユニットにし、インターフェース (取付穴・コネクタ・配管継手) を揃える。交換するモジュールだけを作り直せばよい。</li>
  <li><b>調整範囲は想定の 1.5〜2 倍</b>: 「たぶん ±10 mm で足りる」なら ±20 mm 動くようにしておく。範囲を外れたときの作り直しの方が高くつく。</li>
  <li><b>早く交換できる取付</b>: 試料や治具は位置決めピン + 少数のボルト、ケーブルはコネクタで。頻繁に外すものに 8 本のボルトを使わない。</li>
</ul>
${FIXED_VS_MOD}

<h2>測れること: 計測器の居場所を最初から確保する</h2>
<p>R&amp;D 装置の成果は「データ」です。後からセンサを付けようとして、付ける場所も配線の通り道もない、というのが典型的な失敗です。</p>
<ul>
  <li>力・変位・温度・圧力を測りたい点の近くに、取付面と穴を<b>予備で</b>用意する。</li>
  <li>覗き窓やカメラの視線、手やプローブが入る隙間を残す。</li>
  <li>ケーブルの通り道 (ダクトや結束ベース) と、DAQ・PC を置く場所を図面に描く。</li>
  <li>アクチュエータの指令値もデータとして記録できるように、制御器から信号を取り出せるようにしておく。</li>
</ul>

<h2>構成を記録する</h2>
<p>組み替えやすい装置は、裏返すと「先月のデータを取ったときの構成が分からない」装置になりがちです。実験ごとに次を残します。</p>
<ul>
  <li>構成の写真 (全体と要部、目盛が読める距離で)</li>
  <li>モジュールの組合せと調整位置 (目盛値)、センサの型式・シリアル・校正日</li>
  <li>ソフトウェア・設定ファイルのバージョン</li>
  <li>図面上の「構成番号」とデータファイル名の対応</li>
</ul>
<p>目盛付きの長穴やステージを使うのは、位置を<b>数字で記録</b>できるからでもあります。</p>

<h2>実験中の安全</h2>
<p>R&amp;D 装置は、カバーを外して中を触り、未知の条件で動かすことが多い装置です。量産装置より危険が見えにくい分、次を最低限とします。</p>
<ul>
  <li>危険源 (回転・挟まれ・高温・高電圧・高圧ガス・レーザなど) を洗い出し、リスクアセスメントを実験計画とセットで行う。</li>
  <li>非常停止と、動力 (電気・空気) を確実に遮断できる手段を用意する。</li>
  <li>条件を変えるときは、低速・低圧・低温から段階的に上げる。</li>
  <li>透明カバーで飛散を防ぎつつ観察できるようにする。カバーを外して運転する手順は、別に定めて承認する。</li>
</ul>

<h2>予算と時間のトレードオフ</h2>
<p>R&amp;D では「早くデータを取り始めること」自体に価値があります。最初から完璧な装置を作るより、<b>最小限の装置で早く 1 回目の実験</b>をし、分かったことを元に改良する方が全体として速いことが多いです。一方で、測定精度に直結する部分 (剛性・温度・センサ) をけちると、データが使えず全てがやり直しになります。お金と時間をかける場所を見極めます。</p>

<h2>設計例: 接着剤の剥離試験装置</h2>
<p>研究者から「接着剤を剥がす力を測りたい。角度と速度は試しながら決めたい」と依頼されたとします。</p>
<ol>
  <li><b>変わるもの</b>: 剥離角度 (90° か 180° か未定)、速度 (1〜100 mm/min)、試料の幅 (10〜25 mm)。</li>
  <li><b>構成</b>: ブレッドボード上に、電動の直動ステージ (速度範囲を広く選ぶ)、ロードセル付きつかみ具、角度を変えられる試料台 (ピンで 90° / 180° を切替)。</li>
  <li><b>計測</b>: 力とステージ位置を同じ DAQ で同期取得。温度センサ用の取付穴も予備で用意。</li>
  <li><b>記録</b>: 試料台の角度ピン位置とつかみ具の型番を、データファイルのヘッダに自動で書き込む。</li>
  <li><b>安全</b>: 推力が小さいステージを選び、ストロークエンドにリミットスイッチと機械的ストッパ。</li>
</ol>

<div class="tb-note">よくある失敗: 最初の仕様で一体構造に作り込み、2 回目の実験で作り直し / センサの取付場所と配線経路がない / 組み替えた後の構成を記録しておらず、データの比較ができない / 「実験だから」とカバーや非常停止を省く / アルミフレームの剛性不足を測定値のばらつきとして見誤る。</div>`,
    points: [
      "R&D 装置は条件を探すための装置。要求は途中で変わる前提で設計する",
      "ブレッドボード・溝付きフレーム・機能別モジュールで組み替えやすく",
      "調整範囲は想定の 1.5〜2 倍、頻繁に外すものは早く交換できる取付に",
      "センサの取付面・視線・配線経路・DAQ の置き場を最初から確保する",
      "構成 (写真・目盛値・センサ・ソフト版) をデータと対応付けて記録する",
      "未知の条件では段階的に上げ、非常停止と動力遮断を必ず用意する",
    ],
    exercises: [
      {
        q: "25 mm ピッチの格子穴を持つブレッドボードに、幅 40 mm のセンサ台を任意の位置に置きたい。センサ台に穴を 1 列だけあけると位置は 25 mm 刻みになる。センサ台側に長さ何 mm 以上の長穴を設ければ、連続的に (どの位置にも) 固定できるか。ボルトの呼び径 6 mm とする。",
        a: "格子の間隔 25 mm の間のどこにでも置くには、ボルトの中心が長穴の中で 25 mm 動ければよい。長穴の長さ (外寸) = 移動量 25 mm + 穴の幅 (呼び 6 mm 用のすきま穴 約 6.6 mm) ≈ <b>32 mm 程度以上</b>。実際には余裕を持たせ、35 mm 程度にする。長穴は 2 本以上平行に設け、回転も止める。",
      },
      {
        q: "1 回目の装置を 3 週間・60 万円で作ってデータを取るか、全ての要求を想定した装置を 10 週間・200 万円で作るか。1 回目の結果で仕様の半分が変わる可能性が高い場合、どう考えるか。",
        a: "仕様の半分が変わるなら、10 週間かけた装置もかなりの部分を作り直すことになる。3 週間の装置で早く実験し、変わった仕様を反映して 2 台目 (または改造) を作れば、合計でも時間・費用が小さくなる可能性が高い。ただし、測定精度に効く部分 (剛性・センサ・温度管理) は 1 回目から妥協しない。データが使えなければ 3 週間も無駄になるため。",
      },
    ],
    quiz: [
      { q: "R&D 装置の調整範囲の決め方として適切なのはどれか。", choices: ["想定した範囲ちょうど", "想定の 1.5〜2 倍程度の余裕を持たせる", "調整機構は付けない", "量産装置と同じにする"], answer: 1, explain: "要求は変わるので、範囲を外れて作り直すより余裕を持たせておく方が安く済みます。" },
      { q: "組み替えやすい装置で特に重要になる記録はどれか。", choices: ["装置の購入金額", "実験ごとの構成 (写真・目盛値・センサ・ソフト版)", "作業者の勤務時間", "フレームの色"], answer: 1, explain: "構成が分からなければ、過去のデータと比較できません。" },
      { q: "R&D 装置の安全について正しいのはどれか。", choices: ["実験なので非常停止は不要", "条件は低い側から段階的に上げ、非常停止と動力遮断を用意する", "カバーは常に外して運転する", "危険源の洗い出しは量産時に行えばよい"], answer: 1, explain: "未知の条件で動かすからこそ、段階的な確認と確実な停止手段が必要です。" },
    ],
  },
  {
    id: "rnd-adjustment",
    part: "equipment",
    title: "調整機構と精密位置決め — 微動ステージ・キネマティック支持・調整代",
    minutes: 30,
    level: 3,
    lead: "部品の加工精度だけでは届かない位置精度は、調整で作ります。微動ねじと差動ねじの分解能、すべりも遊びもないたわみヒンジ、外して戻しても同じ位置に戻るキネマティック支持、シムによる高さ調整、調整後の固定、そしてアッベ誤差の見積もりまでを学びます。",
    body: `
<h2>なぜ調整機構が必要か</h2>
<p>部品を何点も積み重ねると、各部品の公差が足し合わされます。ミクロン級の位置合わせを全て加工精度で実現しようとすると、費用が急に上がります。そこで「加工は常識的な精度で作り、最後の数十 µm を調整で合わせる」設計がよく使われます。調整機構に求められるのは次の 4 つです。</p>
<ol>
  <li><b>分解能</b>: 1 回の操作でどれだけ細かく動かせるか</li>
  <li><b>調整範囲 (調整代)</b>: 公差の積み上げを吸収できる広さ</li>
  <li><b>安定性</b>: 調整後に固定しても動かず、時間・温度で戻らない</li>
  <li><b>独立性</b>: ある軸を動かしても他の軸がずれない</li>
</ol>

<h2>微動ねじと差動ねじ</h2>
${SCREWS}
<div class="tb-math">\\begin{aligned} \\text{分解能} &= \\dfrac{p}{n} \\\\ \\text{差動ねじの送り} & = p_1 - p_2 \\end{aligned}</div>
<p>(p: ピッチ、n: 1 回転の分割数。差動ねじの送りは 1 回転あたり)</p>
<p>ピッチ 0.5 mm のねじに 50 目盛のシンブルを付けると、1 目盛 10 µm です。細目ねじでピッチを 0.25 mm にすれば 5 µm になりますが、ねじが細く弱くなります。<b>差動ねじ</b>は、ピッチ 0.50 mm と 0.45 mm の 2 つのねじを同じ軸に切り、一方を固定側、他方を回り止めした可動子にはめます。1 回転で外ねじは 0.50 mm 進み、可動子はそれに対して 0.45 mm 戻るので、正味 0.05 mm (50 µm) だけ動きます。50 目盛なら 1 目盛 1 µm です。</p>
<p>実際の位置分解能は目盛だけでは決まりません。ねじのバックラッシや摩擦によるスティックスリップで、数 µm 以下の送りはねらい通りに出ないことがあります。<b>ばねで一方向に押し付け</b>てバックラッシを消し、<b>最後は常に同じ方向から合わせる</b>のが基本です。</p>

<h2>たわみヒンジ (フレクシャ)</h2>
<p>板の一部を薄く削り、その弾性変形で回転や平行移動をさせる機構です。すべり面がないので<b>摩擦もガタもなく</b>、ナノメートル級の動きも滑らかに出せます。一方で、動ける範囲は小さく (多くは数十 µm〜数 mm)、変形させる力が必要で、大きく曲げると疲労で破損します。微動ねじや圧電素子でフレクシャを押し、てこ比で縮小すると、さらに細かい分解能が得られます。</p>

<h2>キネマティック支持と 3-2-1 の原則</h2>
${KINEMATIC}
<p>剛体の自由度は 6 (並進 3 + 回転 3) です。拘束点が 6 より少ないとガタが残り、多いと<b>過拘束</b>になって部品の寸法誤差がそのまま変形や浮きになります。ちょうど 6 点で拘束するのが<b>キネマティック設計</b>です。</p>
<ul>
  <li><b>3 球 + 3 V 溝</b>: 図のように 120° 間隔で中心を向いた V 溝に球を置く。熱膨張しても中心は動かない。</li>
  <li><b>3-2-1 の原則 (治具)</b>: 1 つの面を 3 点、次の面を 2 点、残りの面を 1 点で受け、合計 6 点で位置決めする。クランプ力はこれらの点に向けて押す。</li>
</ul>
<p>キネマティック支持の接触は点 (実際は小さな楕円) なので、接触応力が高くなります。硬い材料 (焼入れ鋼、セラミック球) を使い、予圧の大きさを検討します。</p>

<h2>シムと調整後の固定</h2>
<p><b>シム</b> (薄板) を挟んで高さや傾きを合わせる方法は、単純で剛性が高く、調整後も動きにくい方法です。ステンレスの薄板を 0.01〜0.05 mm 刻みで揃え、枚数を少なく (多くて 3〜4 枚) します。枚数が増えると合わせ面の数だけ剛性が下がり、ばらつきが増えるためです。</p>
<p>調整ねじで合わせたら、<b>固定</b>が要ります。</p>
<ul>
  <li>止めねじやロックナットで固定する。締めるときにずれるので、ずれ量を見込んで合わせるか、締めながら確認する。</li>
  <li>調整ねじとは別の固定ボルトで本締めし、調整ねじは「位置を決めるだけ」にする。</li>
  <li>位置が決まったら、ピンで位置を残す (分解後の再組立のため)。</li>
  <li>接着剤での固定は、硬化収縮でずれる量を確認してから使う。</li>
</ul>

<h2>アッベ誤差</h2>
${ABBE}
<p>測定軸 (目盛やエンコーダ) と、実際に位置を合わせたい点 (機能点) が距離 L だけ離れていると、案内のわずかな傾き θ が位置誤差 ε になります。</p>
<div class="tb-math">\\varepsilon = L \\tan\\theta \\approx L\\,\\theta</div>
<p>(θ はラジアン、小さいとき)</p>
<p><b>計算例</b>: エンコーダのスケールがテーブル下面にあり、プローブ先端はそこから L = 50 mm 上にある。案内のピッチングが θ = 10″ (秒) のとき、10″ = 10/3600° = 4.85×10⁻⁵ rad なので、ε = 50 mm × 4.85×10⁻⁵ = <b>約 2.4 µm</b>。目盛が 0.1 µm 単位で読めても、機能点の位置は 2.4 µm ずれ得ます。対策は L を小さくする (スケールを機能点の延長線上に置く)、案内の真直度・姿勢精度を上げる、または傾きを測って補正することです。</p>

<div class="tb-note">よくある失敗: 調整ねじだけで位置を保ち、振動や温度で戻る / 固定ボルトを締めたらずれた (締め付け時のずれを考えていない) / 4 点支持で過拘束になり、架台のひずみで部品が浮く / シムを何枚も重ねて剛性が下がる / 目盛の分解能をそのまま位置精度と思い込む (アッベ誤差・バックラッシ) / 調整範囲が公差の積み上げより小さく、合わせきれない。</div>`,
    points: [
      "微動ねじの分解能 = ピッチ ÷ 分割数。差動ねじは p₁ − p₂ で細かく送る",
      "ばねで片寄せしてバックラッシを消し、常に同じ方向から合わせる",
      "フレクシャは摩擦・ガタなしだが範囲が小さく、疲労に注意",
      "6 自由度を 6 点で拘束 (3 球 + 3 V 溝、3-2-1)。過拘束を避ける",
      "調整後は別ボルトで本締めし、ピンで位置を残す。シムは少枚数で",
      "アッベ誤差 ε = L·tanθ。測定軸を機能点に近づける",
    ],
    exercises: [
      {
        q: "ピッチ 0.35 mm と 0.30 mm の差動ねじに 100 目盛のつまみを付けた。1 目盛あたりの送りはいくらか。また、同じ 1 目盛の送りを単一のねじ (100 目盛) で得るにはピッチ何 mm のねじが必要か。",
        a: "1 回転の送り = 0.35 − 0.30 = 0.05 mm。1 目盛 = 0.05 / 100 = <b>0.5 µm</b>。単一のねじで同じにするにはピッチ 0.05 mm が必要で、これは非常に細く加工も強度も現実的でない。差動ねじならピッチ 0.3 mm 級の丈夫なねじで実現できる。",
      },
      {
        q: "測定軸から L = 120 mm 離れた位置で工具の位置を合わせる。案内のヨーイングが 5″ のとき、アッベ誤差はいくらか。誤差を 1 µm 以下にしたい場合、L を何 mm 以下にすべきか。",
        a: "5″ = 5/3600 × π/180 = 2.42×10⁻⁵ rad。ε = 120 × 2.42×10⁻⁵ = 2.9×10⁻³ mm = <b>約 2.9 µm</b>。1 µm 以下にするには L ≤ 1×10⁻³ / 2.42×10⁻⁵ ≈ <b>41 mm 以下</b>。または案内のヨーイングを 5″ から 1.7″ 程度に良くする必要がある。",
      },
    ],
    quiz: [
      { q: "ピッチ 0.5 mm のねじに 50 目盛のつまみを付けたときの 1 目盛の送りはどれか。", choices: ["1 µm", "5 µm", "10 µm", "50 µm"], answer: 2, explain: "0.5 mm ÷ 50 = 0.01 mm = 10 µm です。" },
      { q: "3 球 + 3 V 溝のキネマティックカップリングの接触点の数はどれか。", choices: ["3", "4", "6", "9"], answer: 2, explain: "各球が V 溝の 2 面に接するので 3 × 2 = 6 点で、6 自由度をちょうど拘束します。" },
      { q: "アッベ誤差を小さくする方法として正しいのはどれか。", choices: ["目盛の分解能を上げる", "測定軸を機能点の延長線上に近づける", "調整ねじのピッチを大きくする", "シムを増やす"], answer: 1, explain: "ε = L·tanθ なので、L を小さくするのが基本です。目盛を細かくしても誤差は減りません。" },
      { q: "たわみヒンジ (フレクシャ) の特徴として正しいのはどれか。", choices: ["大きなストロークに向く", "摩擦とガタがない", "疲労を考えなくてよい", "力がいらない"], answer: 1, explain: "弾性変形で動くので摩擦・ガタがありません。範囲は小さく、繰返し曲げの疲労に注意します。" },
    ],
  },
  {
    id: "rnd-measurement",
    part: "equipment",
    title: "実験装置の計測設計 — センサの取付・データ収集・誤差の見積もり",
    minutes: 30,
    level: 3,
    lead: "実験の価値は、測った数字をどこまで信じられるかで決まります。センサの選び方、取付の剛性と熱の影響、サンプリング周波数、データ収集器 (DAQ)、接地とノイズの基本、そして不確かさの見積もり (RSS) までを、装置設計者の視点で学びます。",
    body: `
<h2>何を測るか: 主なセンサ</h2>
<table class="tb-table">
  <tr><th>測る量</th><th>代表的なセンサ</th><th>設計で気を付けること</th></tr>
  <tr><td>力</td><td>ロードセル (ひずみゲージ式)、圧電式</td><td>力の作用線をセンサ軸に合わせる。曲げ・ねじりを入れない。圧電式は静的な力の長時間測定に向かない</td></tr>
  <tr><td>変位</td><td>接触式変位計、レーザ変位計、渦電流式、静電容量式</td><td>測る面の材質・色・傾き。支持する構造の変形を測り込まない</td></tr>
  <tr><td>温度</td><td>熱電対、測温抵抗体 (Pt100)、サーミスタ</td><td>測りたい点に熱的に密着させる。リード線からの熱の逃げ</td></tr>
  <tr><td>圧力</td><td>圧力センサ (ひずみ式・静電容量式)</td><td>ゲージ圧か絶対圧か。配管の長さと容積による応答遅れ</td></tr>
</table>
<p>選ぶときは、<b>測定範囲</b> (最大値の 1.5〜3 倍程度の定格を目安に、過負荷保護も考える)、<b>必要な精度</b>、<b>応答 (周波数帯域)</b>、<b>環境</b> (温度・油・電磁ノイズ) を先に決めます。定格が大きすぎると、小さな値の精度が落ちます (多くの誤差は定格 FS に対する % で示されるため)。</p>

<h2>取付: 剛性と熱</h2>
${MEAS_SETUP}
<ul>
  <li><b>計測ループと荷重ループを分ける</b>: 変位計を荷重のかかるフレームに付けると、フレームのたわみも一緒に測ってしまう。変位計は荷重がかからない別の支柱 (計測フレーム) から測る。</li>
  <li><b>取付の剛性</b>: 支柱が細長いと、振動でセンサが揺れ、ノイズのように見える。片持ちの長さを短くする。</li>
  <li><b>熱の影響</b>: 長さ 100 mm のアルミ支柱は、1 °C の温度変化で約 2.3 µm 伸びる。ミクロン級の変位を測るなら、支柱の材料・長さ・温度を管理する (線膨張係数の小さい材料、短い支柱、温度の記録)。</li>
  <li><b>ロードセルの取付</b>: 球面座やロッドエンドで曲げを逃がし、軸方向の力だけが入るようにする。取付面の平面度と締付トルクはメーカー指示に従う。</li>
</ul>

<h2>サンプリング周波数と DAQ</h2>
${ALIAS}
<div class="tb-math">\\begin{gathered} f_s \\gt 2 f_{\\max} \\\\ \\text{(波形を見るなら } f_s \\approx 10 f_{\\max} \\text{ 以上)} \\end{gathered}</div>
<p>ナイキスト条件 (f<sub>s</sub>: サンプリング周波数、f<sub>max</sub>: 信号の最高周波数)</p>
<p>ナイキスト条件は「周波数成分を区別できる最低条件」で、波形のピーク値や形を見るには足りません。実務では最高周波数の 10 倍程度以上を目安にします。また、測りたい周波数より高いノイズがあると、それも低い周波数に折り返されて混ざるので、<b>サンプリングの前にアナログのローパスフィルタ</b> (アンチエイリアスフィルタ) を入れます。</p>
<p>DAQ を選ぶときは、チャンネル数、分解能 (ビット数) と入力レンジ、サンプリング周波数、<b>チャンネル間の同期</b> (力と変位を同じ時刻で取れるか)、ひずみゲージ用のブリッジ電源や熱電対の冷接点補償の有無を確認します。16 ビットの DAQ で ±10 V レンジなら 1 LSB は 20 V / 65 536 ≈ 0.3 mV です。センサ出力が数 mV しかないなら、増幅器を入れるかレンジを合わせます。</p>

<h2>接地とノイズの基本</h2>
<ul>
  <li><b>一点接地</b>: 信号の基準 (グラウンド) を複数の場所で接地すると、接地点間の電位差で電流が流れ (グラウンドループ)、ノイズになる。</li>
  <li><b>シールド線</b>のシールドは、原則として片端 (計測器側) で接地する。</li>
  <li>信号線を<b>モータ動力線やインバータ出力線から離して</b>配線する。並べるときは別ダクトにし、交差は直角に。</li>
  <li>微小信号は差動入力で受け、ツイストペアで配線する。</li>
  <li>ノイズに気づいたら、まず装置の電源を切ったときと入れたときで信号を比べ、原因を切り分ける。</li>
</ul>

<h2>不確かさの見積もり (RSS)</h2>
<p>測定値には複数の誤差要因が入ります。各要因が独立でランダムなら、二乗和の平方根 (RSS) で合成します。</p>
<div class="tb-math">u_c = \\sqrt{u_1^2 + u_2^2 + \\cdots + u_n^2} \\qquad U = k\\,u_c</div>
<p>u<sub>c</sub>: 合成標準不確かさ、U: 拡張不確かさ (k = 2 で約 95 %)</p>
<p><b>計算例</b>: 定格 1000 N のロードセルで力を測る。各要因を標準不確かさとして次のように見積もった (データシートの値を標準不確かさに換算済みとする)。</p>
<table class="tb-table">
  <tr><th>要因</th><th>標準不確かさ</th><th>u²</th></tr>
  <tr><td>非直線性 (0.05 % FS)</td><td>0.5 N</td><td>0.25</td></tr>
  <tr><td>ヒステリシス (0.03 % FS)</td><td>0.3 N</td><td>0.09</td></tr>
  <tr><td>温度の影響</td><td>0.2 N</td><td>0.04</td></tr>
  <tr><td>DAQ・増幅器</td><td>0.1 N</td><td>0.01</td></tr>
  <tr><td><b>合計</b></td><td></td><td><b>0.39</b></td></tr>
</table>
<p>u_c = √0.39 ≈ <b>0.62 N</b>、U = 2 × 0.62 ≈ <b>1.25 N</b> (k = 2)。単純に足すと 1.1 N で、RSS より大きくなります。表にすると、<b>最大の要因 (非直線性)</b> が全体を支配していることが分かり、改善の優先順位が決まります。例えば DAQ を高価なものに替えても、u_c はほとんど変わりません。なお、データシートの値を標準不確かさにする換算 (矩形分布なら ÷√3 など) は、不確かさの評価の手順 (GUM) に従って行います。</p>

<div class="tb-note">よくある失敗: 変位計を荷重のかかるフレームに付けてフレームのたわみを測る / ロードセルに曲げが入る取付 / 最大値の 10 倍の定格を選び、小さな力の精度が出ない / サンプリング周波数が低くピークを見逃す (または折り返しノイズ) / 信号線を動力線と同じダクトに通す / 不確かさを見積もらずに「差が出た」と判断する / センサの校正日を記録していない。</div>`,
    points: [
      "範囲・精度・応答・環境からセンサを選ぶ。定格は大きすぎない",
      "計測ループと荷重ループを分け、取付の剛性と熱膨張を考える",
      "fs > 2 fmax は最低条件。波形を見るなら 10 倍以上 + アンチエイリアスフィルタ",
      "DAQ は分解能・レンジ・同期・ブリッジ電源/冷接点補償を確認",
      "一点接地、シールドは片端、信号線は動力線から離す",
      "不確かさは RSS で合成し、最大の要因から改善する",
    ],
    exercises: [
      {
        q: "回転数 1800 min⁻¹ の軸に 4 枚刃の工具が付いており、刃が当たるたびの力の変動を波形として観察したい。必要なサンプリング周波数の目安を求めよ。",
        a: "回転周波数 = 1800 / 60 = 30 Hz。刃の通過周波数 = 30 × 4 = <b>120 Hz</b>。ナイキスト条件では 240 Hz より大きければよいが、波形を見るには 10 倍の <b>1.2 kHz 以上</b>を目安にする。高調波も見たい場合や余裕をとるなら数 kHz で取り、アンチエイリアスフィルタを入れる。",
      },
      {
        q: "変位計測の不確かさ要因が、センサ 0.8 µm、支柱の熱膨張 1.5 µm、取付の振動 0.6 µm、DAQ 0.2 µm (いずれも標準不確かさ) と見積もられた。合成標準不確かさと拡張不確かさ (k = 2) を求め、最初に手を付けるべき要因を答えよ。",
        a: "u_c = √(0.8² + 1.5² + 0.6² + 0.2²) = √(0.64 + 2.25 + 0.36 + 0.04) = √3.29 ≈ <b>1.81 µm</b>。U = 2 × 1.81 ≈ <b>3.6 µm</b>。最大の要因は<b>支柱の熱膨張</b> (二乗で全体の約 68 %)。支柱を短くする、線膨張係数の小さい材料にする、温度を安定させる、などが先。センサを高精度品に替えても効果は小さい。",
      },
    ],
    quiz: [
      { q: "最高 50 Hz の成分を含む信号を、波形の形まで見たい。サンプリング周波数の目安はどれか。", choices: ["50 Hz", "100 Hz", "500 Hz 以上", "5 Hz"], answer: 2, explain: "ナイキストの 100 Hz は最低条件で、波形を見るには 10 倍程度 (500 Hz) 以上を目安にします。" },
      { q: "変位計を取り付ける場所として適切なのはどれか。", choices: ["荷重がかかる主フレーム", "荷重がかからない別の計測用支柱", "モータの上", "どこでもよい"], answer: 1, explain: "計測ループと荷重ループを分けて、フレームのたわみを測り込まないようにします。" },
      { q: "独立な要因 0.3 と 0.4 の標準不確かさを RSS で合成した値はどれか。", choices: ["0.1", "0.5", "0.7", "0.12"], answer: 1, explain: "√(0.09 + 0.16) = √0.25 = 0.5 です。" },
      { q: "グラウンドループを防ぐ基本的な方法はどれか。", choices: ["信号の基準を複数箇所で接地する", "一点接地にする", "信号線を動力線と束ねる", "シールドを両端とも外す"], answer: 1, explain: "複数箇所で接地すると接地点間の電位差で電流が流れ、ノイズになります。" },
    ],
  },
  {
    id: "special-environment",
    part: "equipment",
    title: "特殊環境の装置 — クリーン・真空・高温・低温",
    minutes: 30,
    level: 3,
    lead: "半導体・光学・医療・材料研究などの装置は、クリーンルーム、真空、高温、低温といった特殊な環境で動きます。通常の大気中では問題にならない発塵、ガス放出、熱膨張差、結露が、装置の性能や製品の品質を左右します。それぞれの環境で設計者が押さえるべき基本を学びます。",
    body: `
<h2>クリーン環境: 発塵を出さない・溜めない</h2>
<p>クリーンルームでは空気中の粒子の数を管理します (清浄度クラスは ISO 14644-1 で定義)。装置は人と並ぶ大きな発塵源になり得ます。</p>
<ul>
  <li><b>摺動部・回転部</b>: ボールねじ、ガイド、ベルト、ケーブルベアは摩耗粉を出す。カバーで覆い、内部を局所排気して負圧にする。クリーン用グリースを使う。</li>
  <li><b>材料</b>: 塗装のはがれ、樹脂の削れ、さびが粒子になる。ステンレスや表面処理したアルミ (アルマイトなど) を使い、発塵の少ない樹脂を選ぶ。</li>
  <li><b>形</b>: 水平な棚や凹みは粒子が溜まり、清掃しにくい。上面を少なくし、角を丸め、清掃できる形にする。</li>
  <li><b>気流</b>: 上から下へのダウンフローを妨げないよう、製品の真上に可動部を置かない。可動部は製品の下流側 (下・横) に。</li>
</ul>

<h2>真空: 材料・ガス放出・シール</h2>
<p>真空容器の圧力は、ポンプの排気速度と、容器内に入ってくるガス (漏れ、材料表面からのガス放出、透過) のつり合いで決まります。高い真空ほど、<b>材料表面からのガス放出</b>が支配的になります。</p>
<ul>
  <li><b>材料</b>: ステンレス鋼 (SUS304 など)、アルミ合金、無酸素銅、セラミックスがよく使われる。多孔質な材料、ガス放出の多い樹脂、亜鉛・カドミウムなど蒸気圧の高い金属を含む材料 (黄銅、一部のめっき) は避けるか条件付きで使う。</li>
  <li><b>表面</b>: 表面積が小さく滑らかなほどガス放出が少ない。脱脂・洗浄し、素手で触らない (手袋)。</li>
  <li><b>閉じ込め空間</b>: 盲穴にねじを入れると、ねじ底の空気がゆっくり漏れ出て (仮想リーク) 排気が終わらない。ガス抜き穴付きのねじや貫通穴、溝を使う。</li>
  <li><b>ベーキング</b>: 容器を加熱して表面の水分などを追い出し、到達圧力を下げる。ベーク温度に耐える部品・シールを選ぶ。</li>
  <li><b>潤滑</b>: 一般の油やグリースは蒸発して汚染源になる。真空用潤滑剤や固体潤滑を使う。</li>
</ul>
${FLANGES}
<p>シールは、<b>O リング (エラストマー)</b> と<b>メタルガスケット</b>が代表です。フッ素ゴム O リングは手軽で繰返し使えますが、ガスの透過やガス放出があり、使用温度に上限があります。超高真空や高温ベークが必要な系では、ナイフエッジで銅ガスケットを押しつぶす金属シール (いわゆる CF 系フランジ) を使い、ガスケットは原則として毎回交換します。</p>

<h2>高温: 熱膨張差と材料の性質の変化</h2>
${THERMAL}
<p>温度が上がると部材は伸びます。同じ材料なら全体が相似に大きくなるだけですが、<b>線膨張係数の違う材料</b>を拘束すると、差の分だけ反りや応力が出ます。</p>
<div class="tb-math">\\Delta L = (\\alpha_1 - \\alpha_2)\\,L\\,\\Delta T</div>
<p>ΔL: 差の伸び</p>
<p><b>計算例</b>: 長さ 300 mm のアルミ板 (α ≈ 23×10⁻⁶ /K) を鋼のベース (α ≈ 12×10⁻⁶ /K) にボルトで固定し、20 °C から 200 °C に加熱する (ΔT = 180 K)。差の伸び = (23 − 12)×10⁻⁶ × 300 × 180 ≈ <b>0.59 mm</b>。両端を丸穴で固定すると、この 0.6 mm を拘束することになり、板の反り、ボルトのせん断、すべりによる位置ずれが起こります。一端を固定し、他端は伸び方向の長穴にして 0.6 mm 以上 (余裕を見て 1 mm 程度) 動けるようにします。</p>
<p>高温では他にも次を確認します。</p>
<ul>
  <li><b>強度の低下とクリープ</b>: 特にアルミ合金や樹脂は、比較的低い温度から強度が落ちる。材料の使用温度範囲を確認する。</li>
  <li><b>ボルトのゆるみ</b>: 熱膨張差や締結部材のへたりで軸力が落ちる。</li>
  <li><b>はめあいの変化</b>: 軸と穴の材料が違うと、すきまがなくなったり大きくなったりする。</li>
  <li><b>周辺部品の保護</b>: センサ・ケーブル・モータは断熱や冷却で使用温度範囲内に保つ。</li>
</ul>

<h2>低温: 結露と材料のもろさ</h2>
<p>空気中の水蒸気は、物体の表面温度が<b>露点</b>以下になると結露します。例えば 23 °C・相対湿度 50 % の空気の露点は約 12 °C です。冷却した部品の表面がこれより低いと水が付き、電気部品のショート、さび、光学面のくもりの原因になります。</p>
<ul>
  <li>冷えた部分を断熱材で覆い、外表面を露点より高く保つ。</li>
  <li>乾燥空気や窒素でパージして、周囲の露点を下げる。</li>
  <li>冷えた部品を取り出すときは、室温に戻るまで乾燥雰囲気に置く。</li>
  <li>低温で靭性が落ちる材料 (一部の鋼や樹脂) は脆性破壊に注意し、低温用途ではオーステナイト系ステンレスなどを検討する。</li>
</ul>

<div class="tb-note">よくある失敗: クリーン装置で製品の真上にベルトやケーブルベアを置く / 真空容器内に盲穴のねじを使って仮想リーク / 真空内で一般グリースや黄銅部品を使う / メタルガスケットを再使用して漏れる / 異種材料を 2 点で固定し、加熱で反る / 冷却ステージのケーブル接続部が結露してショート。</div>`,
    points: [
      "クリーン: 発塵源を覆って排気、発塵しにくい材料、溜まらない形、気流の下流に可動部",
      "真空: ガス放出の少ない材料と表面、盲穴を避ける (仮想リーク)、真空用潤滑",
      "シール: O リングは手軽、超高真空・ベークはメタルガスケット (原則使い捨て)",
      "高温: 差の伸び ΔL = (α₁ − α₂)·L·ΔT。一端固定・他端は長穴",
      "高温では強度低下・クリープ・ボルトのゆるみ・はめあいの変化も確認",
      "低温: 表面を露点より高く保つか乾燥ガスでパージ。低温脆性に注意",
    ],
    exercises: [
      {
        q: "長さ 500 mm の銅製ヒータブロック (α ≈ 17×10⁻⁶ /K) をステンレスのベース (α ≈ 17×10⁻⁶ /K 前後の SUS304) とアルミのベース (α ≈ 23×10⁻⁶ /K) のどちらかに固定し、25 °C から 150 °C まで加熱する。それぞれの差の伸びを求め、どちらが有利か答えよ。",
        a: "ΔT = 125 K。SUS304 の場合: 差 (17 − 17)×10⁻⁶ ≈ 0 なので差の伸びは<b>ほぼ 0 mm</b> (実際は数 ×10⁻⁶ /K の差は残る)。アルミの場合: (23 − 17)×10⁻⁶ × 500 × 125 ≈ <b>0.38 mm</b>。線膨張係数の近い SUS304 の方が熱応力・反りが小さく有利。ただしいずれの場合も一端固定・他端長穴にしておけば安全側になる。",
      },
      {
        q: "室温 25 °C・相対湿度 60 % の部屋で、表面温度 10 °C の冷却ステージを使う。結露するか。露点は約 16.7 °C とする。結露を防ぐ方法を 2 つ挙げよ。",
        a: "表面温度 10 °C は露点 16.7 °C より低いので<b>結露する</b>。対策: ① ステージを断熱材で覆い、外側の表面温度を露点より高くする。② ステージ周囲を乾燥空気・窒素でパージして周囲の露点を 10 °C より十分低くする (例えば露点 −20 °C の乾燥空気)。他に、部屋の湿度を下げる、カバーで囲って乾燥剤を入れる、なども有効。",
      },
    ],
    quiz: [
      { q: "真空容器内で盲穴にねじを入れたときに起こりやすい問題はどれか。", choices: ["ねじが熱で溶ける", "ねじ底の空気がゆっくり漏れ出す仮想リーク", "ねじが磁化する", "問題は起きない"], answer: 1, explain: "閉じ込められた気体が少しずつ出てきて、排気に長い時間がかかります。ガス抜き穴付きねじなどを使います。" },
      { q: "超高真空で高温ベークが必要な系に適したシールはどれか。", choices: ["ニトリルゴム O リング", "銅ガスケットを使う金属シール", "シール材なしの面接触", "テープシール"], answer: 1, explain: "ナイフエッジで銅ガスケットを塑性変形させる金属シールは、ベーク温度にも耐え、ガス放出が少ないです。" },
      { q: "線膨張係数の違う 2 部材を固定するときの基本はどれか。", choices: ["両端を丸穴で強く固定する", "一端を固定し、他端は伸び方向の長穴にする", "接着だけにする", "ボルトを増やす"], answer: 1, explain: "一点を基準にして、伸びを逃がすと熱応力や反りを避けられます。" },
      { q: "冷却部品の結露を防ぐ方法として正しいのはどれか。", choices: ["表面温度を露点より低くする", "周囲を乾燥ガスでパージする", "湿度を上げる", "冷却温度を下げる"], answer: 1, explain: "周囲の露点を下げれば、冷えた表面でも水蒸気が凝縮しません。" },
    ],
  },
  {
    id: "prototype-to-production",
    part: "equipment",
    title: "試作装置から量産装置へ — スケールアップと知見の移管",
    minutes: 30,
    level: 3,
    lead: "研究室の試作装置で良品ができても、それをそのまま量産すればよいわけではありません。生産能力、信頼性、コスト、操作者のスキルが大きく変わるからです。プロセスウィンドウと実験計画 (DOE) の結果をどう移すか、何を固定し何を管理するか、量産装置の設計とドキュメントまでを学びます。",
    body: `
<h2>試作と量産で何が変わるか</h2>
${PROTO_PROD}
<table class="tb-table">
  <tr><th>項目</th><th>試作装置</th><th>量産装置</th></tr>
  <tr><td>生産能力</td><td>1 日数個〜数十個</td><td>タクトで決まる (例: 1 個 / 50 s)</td></tr>
  <tr><td>稼働</td><td>止まっても技術者が直す</td><td>2 交替・3 交替で連続、稼働率が利益を決める</td></tr>
  <tr><td>操作者</td><td>原理を知る技術者</td><td>訓練を受けた作業者 (交替で人が変わる)</td></tr>
  <tr><td>条件</td><td>毎回変える・手で合わせる</td><td>レシピで固定、変更は承認制</td></tr>
  <tr><td>ワークの供給</td><td>手で置く</td><td>自動搬送・トレイ・前後工程との連結</td></tr>
  <tr><td>品質の確認</td><td>全数を技術者が見る</td><td>工程内検査・データ記録・トレーサビリティ</td></tr>
  <tr><td>安全</td><td>実験の手順書と注意</td><td>ガード・インターロック・規格適合</td></tr>
  <tr><td>コストの見方</td><td>装置の値段</td><td>1 個あたりの費用 (装置償却 + 人 + 材料 + 不良)</td></tr>
</table>

<h2>知見を移す: プロセスウィンドウ</h2>
${WINDOW}
<p>試作で分かったことの中で、量産に最も大事なのは「<b>どの条件の範囲なら良品が出るか</b>」(プロセスウィンドウ) です。「この条件で良品ができた」という 1 点の情報だけでは不十分です。量産装置は、温度・圧力・時間などを必ずばらつかせるので、ばらつき全体がウィンドウの内側に入る必要があります。</p>
<ul>
  <li><b>実験計画法 (DOE)</b> で、どのパラメータが品質に効くか (主効果・交互作用)、効かないかを調べておく。</li>
  <li>効くパラメータは<b>管理幅</b>を決めて量産装置で制御・監視する。効かないパラメータは、コストの安い方に固定してよい。</li>
  <li>運転点はウィンドウの<b>中央付近</b>に置く。端の点は、試作では最良でも量産では不良を出す。</li>
  <li>試作装置で測れていなかったもの (例: ワークの実温度でなくヒータの設定温度しか見ていない) は、量産装置では何を測るのかを決め直す。</li>
</ul>

<h2>スケールアップで変わる物理</h2>
<p>同じ条件設定でも、装置が大きく速くなると物理が変わります。</p>
<ul>
  <li><b>熱</b>: 大きなワークや多数個取りでは温まり方・冷え方が変わり、温度分布ができる。連続運転では装置自身が温まる。</li>
  <li><b>時間</b>: タクトを短くすると、加熱時間・硬化時間・保圧時間が足りなくなる。時間が品質に効く工程は並列化で稼ぐ。</li>
  <li><b>動き</b>: 速度・加速度を上げると振動や位置ずれが増える。</li>
  <li><b>材料のロット</b>: 試作は 1 ロットの材料で行うことが多い。量産では複数ロット・複数仕入先のばらつきが入る。</li>
</ul>

<h2>量産装置の設計で決めること</h2>
<ol>
  <li><b>固定するもの</b>: 試作で調整していた機構のうち、調整不要と分かったものは固定構造にして剛性とコストを稼ぐ。</li>
  <li><b>管理するもの</b>: 効くパラメータは、センサで測り、範囲外なら止める・警報する。</li>
  <li><b>交換するもの</b>: 消耗品の交換周期と、交換後に再調整が要らない位置決め (ピン・キネマティック) を設計する。</li>
  <li><b>人がやること</b>: 作業者に判断させない。必要な判断は装置側で自動化するか、明確な基準 (限度見本など) を用意する。</li>
</ol>

<h2>計算例: 生産能力から必要台数を決める</h2>
<p>月 20 000 個を、稼働日 20 日・2 交替 (1 交替 8 h)・総合設備効率 (OEE) 85 % で作る。使える時間は 20 × 2 × 8 × 3600 × 0.85 = 979 200 s なので、<b>1 個あたり 49 s 以下</b>で作る必要があります。試作装置の 1 個 120 s のままなら 120 / 49 ≈ 2.45 で <b>3 台</b>必要。量産装置で搬送の自動化と加熱の 3 個並列化により 45 s にできれば <b>1 台</b>で足ります。どちらが安いかは、装置 1 台の費用・床面積・作業者の人数で比べます。</p>
<table class="tb-table">
  <tr><th></th><th>試作装置を 3 台</th><th>量産専用装置 1 台</th></tr>
  <tr><td>サイクルタイム</td><td>120 s</td><td>45 s</td></tr>
  <tr><td>生産能力 (月)</td><td>約 24 500 個</td><td>約 21 800 個</td></tr>
  <tr><td>作業者</td><td>各台に 1 人 (手で置く)</td><td>1 人で材料補給・監視</td></tr>
  <tr><td>品質のばらつき</td><td>台ごと・人ごとの差が出る</td><td>1 台で条件が揃う</td></tr>
  <tr><td>リスク</td><td>1 台止まっても 2/3 は動く</td><td>止まると全停止 (保全体制が重要)</td></tr>
</table>

<h2>ドキュメント: 何を移管するか</h2>
<ul>
  <li><b>プロセス条件書</b>: パラメータの狙い値・管理幅・根拠 (DOE の結果)。</li>
  <li><b>品質に効く理由</b>: なぜその条件か。原理が分かれば、量産で起きた不具合の原因を追える。</li>
  <li><b>失敗の記録</b>: 試作でどの条件で何が起きたか (ウィンドウの外側の情報)。</li>
  <li><b>評価方法</b>: 良品判定の方法と限度見本、測定方法と測定器。</li>
  <li><b>装置仕様書</b>: 上記から導いた量産装置の要求 (タクト・精度・管理項目・安全・保全)。</li>
</ul>
<p>知見は文書だけでは移りません。量産装置の立上げに試作担当者が立ち会い、試作装置と量産装置で同じ材料を流して結果を比較する (相関をとる) のが確実です。</p>

<div class="tb-note">よくある失敗: 試作で最良だった 1 点の条件だけを渡す (ウィンドウが分からない) / 試作装置の調整機構を量産でも残し、作業者ごとに条件がずれる / タクト短縮で加熱時間が不足 / 試作は 1 ロットの材料だけで評価していた / 「なぜその条件か」が残っておらず、量産で不具合が出ても原因が追えない / 量産装置の立上げで試作装置との比較をしない。</div>`,
    points: [
      "量産では生産能力・稼働率・操作者・コストの見方が変わる",
      "1 点の条件ではなくプロセスウィンドウを移し、運転点は中央付近に",
      "DOE で効くパラメータを特定し、効くものは管理、効かないものは固定",
      "スケールアップで熱・時間・振動・材料ロットのばらつきが変わる",
      "必要タクト = 使える時間 ÷ 必要数。台数と装置構成を比較して決める",
      "条件の根拠・失敗の記録・評価方法まで移管し、立上げで相関をとる",
    ],
    exercises: [
      {
        q: "月 12 000 個を、稼働 20 日・1 交替 8 h・OEE 80 % で作りたい。必要なサイクルタイムを求めよ。試作装置のサイクルタイムが 60 s のとき何台必要か。",
        a: "使える時間 = 20 × 8 × 3600 × 0.80 = 460 800 s。必要サイクルタイム = 460 800 / 12 000 = <b>38.4 s 以下</b>。60 s の装置なら 60 / 38.4 ≈ 1.56 → <b>2 台</b>。2 台なら能力は 2 × 460 800 / 60 = 15 360 個 / 月で余裕がある。または 1 台を 38 s 以下に改良する案と比較する。",
      },
      {
        q: "試作で加熱温度 230 °C・時間 3 s が最良とされたが、DOE の結果、良品の範囲は温度 220〜250 °C、時間 2.5〜5 s だった。量産装置の温度ばらつきは ±5 °C、時間ばらつきは ±0.2 s である。運転点をどう設定すべきか。",
        a: "温度: 範囲の中央は 235 °C。±5 °C でも 230〜240 °C で 220〜250 °C の内側に入る。時間: 中央は 3.75 s。±0.2 s でも 3.55〜3.95 s で十分内側。試作の最良点 3 s は下限 2.5 s に近く、ばらつきや材料ロットの差で不良が出やすい。よって<b>運転点は 235 °C・約 3.7 s</b> (タクトとの兼ね合いで 3.5 s 程度でも可) とし、管理幅を 230〜240 °C、3.5〜4.0 s などに設定する。",
      },
    ],
    quiz: [
      { q: "量産装置の運転点の決め方として適切なのはどれか。", choices: ["試作で最良だった 1 点", "プロセスウィンドウの中央付近", "ウィンドウの端", "作業者が毎回決める"], answer: 1, explain: "装置のばらつき全体がウィンドウ内に入るよう、中央付近に置きます。" },
      { q: "DOE で品質に効かないと分かったパラメータの扱いとして適切なのはどれか。", choices: ["厳しく管理する", "コストの安い方に固定してよい", "作業者に任せる", "毎回変える"], answer: 1, explain: "効かないパラメータに管理の手間をかける必要はありません。根拠は記録しておきます。" },
      { q: "月 20 000 個、使える時間 979 200 s のとき必要なサイクルタイムはどれか。", choices: ["約 20 s", "約 49 s", "約 98 s", "約 120 s"], answer: 1, explain: "979 200 / 20 000 ≈ 49 s です。" },
      { q: "知見の移管で文書と合わせて行うべきことはどれか。", choices: ["試作装置を廃棄する", "試作装置と量産装置で同じ材料を流して結果を比較する", "条件を全て作業者に任せる", "量産装置の仕様を試作装置と同じにする"], answer: 1, explain: "相関をとれば、装置の違いによる差を立上げ時に見つけられます。" },
    ],
  },
];
