import type { TextChapter } from "../types";

/** 作業者 (立ち姿) */
function person(x: number, y: number, s = 1): string {
  return `<g transform="translate(${x} ${y}) scale(${s})"><circle class="k-person" cx="0" cy="-88" r="10"/><path class="k-person" d="M-11,-74 Q0,-80 11,-74 L14,-30 L9,0 L2,0 L0,-24 L-2,0 L-9,0 L-14,-30 Z"/></g>`;
}

/* ---------- 1. overview ---------- */
const THREE_KINDS = `<svg class="tb-chart" viewBox="0 0 520 280" role="img" aria-label="R&D 用装置・産業装置 (専用機)・量産ラインの比較イラスト">
<text class="k-title lbl" x="260" y="18" text-anchor="middle">3 種類の装置 (イメージ)</text>
<rect class="k-panel" x="8" y="30" width="160" height="242" rx="8"/>
<rect class="k-panel" x="180" y="30" width="160" height="242" rx="8"/>
<rect class="k-panel" x="352" y="30" width="160" height="242" rx="8"/>
<text class="lbl" x="88" y="50" text-anchor="middle" font-weight="700">R&amp;D 用装置</text>
<text class="lbl" x="260" y="50" text-anchor="middle" font-weight="700">産業装置 (専用機)</text>
<text class="lbl" x="432" y="50" text-anchor="middle" font-weight="700">量産ライン</text>
<!-- R&D: bench rig on table with adjustable stage, laptop -->
<rect class="k-ground" x="16" y="214" width="144" height="6"/>
<g class="k-shadow"><rect class="k-alu" x="24" y="170" width="120" height="8" rx="2"/></g>
<rect class="k-alu" x="30" y="178" width="6" height="36"/><rect class="k-alu" x="132" y="178" width="6" height="36"/>
<rect class="k-part" x="44" y="150" width="50" height="20" rx="2"/>
<rect class="k-alu" x="52" y="104" width="8" height="46"/><rect class="k-alu" x="52" y="104" width="34" height="8"/>
<rect class="k-accent" x="74" y="112" width="10" height="24" rx="2"/>
<circle class="k-part" cx="100" cy="160" r="6"/><circle class="k-part" cx="38" cy="160" r="5"/>
<path d="M84,120 C110,100 118,140 118,160" style="fill:none;stroke:#c87533;stroke-width:2"/>
<rect class="k-screen" x="104" y="140" width="34" height="22" rx="2"/><rect class="k-part" x="100" y="162" width="42" height="5" rx="1"/>
${person(154, 214, 0.75)}
<text class="tick" x="88" y="238" text-anchor="middle">条件を変えて試す</text>
<text class="tick" x="88" y="254" text-anchor="middle">1 台・調整しやすさ優先</text>
<rect class="k-ground" x="188" y="214" width="144" height="6"/>
<g transform="translate(10 0)"><!-- special machine: cabinet with window -->

<g class="k-shadow"><rect class="k-part" x="200" y="150" width="104" height="64" rx="4"/></g>
<rect class="k-alu" x="204" y="80" width="96" height="72" rx="3"/>
<rect class="k-glass" x="212" y="88" width="80" height="54" rx="2"/>
<rect class="k-accent" x="240" y="96" width="24" height="18" rx="2"/><rect class="k-part-h" x="248" y="114" width="8" height="16"/>
<rect class="k-part" x="234" y="130" width="36" height="8" rx="1"/>
<rect class="k-part" x="304" y="112" width="18" height="30" rx="2"/><circle class="k-estop" cx="313" cy="122" r="4"/><circle class="k-led-g" cx="313" cy="134" r="3"/>
<rect class="k-part" x="292" y="56" width="4" height="24"/><circle class="k-led-g" cx="294" cy="54" r="5"/>
</g>
${person(194, 214, 0.75)}
<text class="tick" x="260" y="238" text-anchor="middle">1 工程を自動化</text>
<text class="tick" x="260" y="254" text-anchor="middle">1〜数台・仕様は固定</text>
<!-- line: conveyor with 3 cells -->
<rect class="k-ground" x="360" y="214" width="144" height="6"/>
<rect class="k-rubber" x="362" y="176" width="140" height="8" rx="4"/>
<rect class="k-part" x="368" y="184" width="4" height="30"/><rect class="k-part" x="430" y="184" width="4" height="30"/><rect class="k-part" x="492" y="184" width="4" height="30"/>
<g class="k-shadow"><rect class="k-alu" x="366" y="112" width="40" height="56" rx="3"/><rect class="k-alu" x="414" y="112" width="40" height="56" rx="3"/><rect class="k-alu" x="462" y="112" width="40" height="56" rx="3"/></g>
<rect class="k-glass" x="370" y="118" width="32" height="40" rx="2"/><rect class="k-glass" x="418" y="118" width="32" height="40" rx="2"/><rect class="k-glass" x="466" y="118" width="32" height="40" rx="2"/>
<g class="k-accent"><rect x="378" y="168" width="10" height="8" rx="1"/><rect x="420" y="168" width="10" height="8" rx="1"/><rect x="452" y="168" width="10" height="8" rx="1"/><rect x="484" y="168" width="10" height="8" rx="1"/></g>
<path class="k-move" d="M372,198 H498" marker-end="url(#k-arrow-b)"/>
<circle class="k-led-g" cx="386" cy="104" r="4"/><circle class="k-led-g" cx="434" cy="104" r="4"/><circle class="k-led-y" cx="482" cy="104" r="4"/>
<text class="tick" x="432" y="238" text-anchor="middle">複数工程をつなぐ</text>
<text class="tick" x="432" y="254" text-anchor="middle">24 時間・止めない</text>
</svg>
<p class="tb-caption">図: 左から、条件を変えながら使う実験装置、1 つの工程を自動化する専用機、複数の工程をコンベヤでつなぎ連続運転する量産ライン。同じ「装置」でも重視するものが違う。</p>`;

const LIFECYCLE = `<svg class="tb-chart" viewBox="0 0 520 220" role="img" aria-label="装置のライフサイクルと関わる職種">
<text class="k-title lbl" x="260" y="18" text-anchor="middle">装置のライフサイクル</text>
<g class="k-shadow">
<rect class="k-panel" x="10" y="40" width="88" height="44" rx="8"/><rect class="k-panel" x="112" y="40" width="88" height="44" rx="8"/><rect class="k-panel" x="214" y="40" width="88" height="44" rx="8"/><rect class="k-panel" x="316" y="40" width="88" height="44" rx="8"/><rect class="k-panel" x="418" y="40" width="92" height="44" rx="8"/></g>
<g class="lbl" text-anchor="middle"><text x="54" y="60">企画・仕様</text><text x="156" y="60">設計</text><text x="258" y="60">製作・組立</text><text x="360" y="60">立上げ・受入</text><text x="464" y="60">稼働・保全</text></g>
<g class="tick" text-anchor="middle"><text x="54" y="76">URS・見積</text><text x="156" y="76">DR・出図</text><text x="258" y="76">加工・配線</text><text x="360" y="76">FAT・SAT</text><text x="464" y="76">改造・廃棄</text></g>
<g class="k-move"><path d="M98,62 H110" marker-end="url(#k-arrow-b)"/><path d="M200,62 H212" marker-end="url(#k-arrow-b)"/><path d="M302,62 H314" marker-end="url(#k-arrow-b)"/><path d="M404,62 H416" marker-end="url(#k-arrow-b)"/></g>
<path class="k-move" d="M464,86 Q464,104 260,104 Q54,104 54,88" fill="none" stroke-dasharray="4 3" marker-end="url(#k-arrow-b)"/>
<text class="tick" x="260" y="120" text-anchor="middle">改善要望は次の装置の仕様へ</text>
<text class="lbl" x="10" y="138">関わる量 (濃いほど主担当)</text>
<g class="tick"><text x="10" y="156">機械</text><text x="10" y="180">電気</text><text x="10" y="204">ソフト</text></g>
<g style="fill:var(--tb-accent)">
<rect x="56" y="146" width="96" height="12" opacity="0.4"/><rect x="152" y="146" width="102" height="12" opacity="0.9"/><rect x="254" y="146" width="102" height="12" opacity="0.7"/><rect x="356" y="146" width="102" height="12" opacity="0.4"/><rect x="458" y="146" width="52" height="12" opacity="0.3"/>
<rect x="56" y="170" width="96" height="12" opacity="0.3"/><rect x="152" y="170" width="102" height="12" opacity="0.7"/><rect x="254" y="170" width="102" height="12" opacity="0.8"/><rect x="356" y="170" width="102" height="12" opacity="0.6"/><rect x="458" y="170" width="52" height="12" opacity="0.3"/>
<rect x="56" y="194" width="96" height="12" opacity="0.2"/><rect x="152" y="194" width="102" height="12" opacity="0.5"/><rect x="254" y="194" width="102" height="12" opacity="0.6"/><rect x="356" y="194" width="102" height="12" opacity="0.9"/><rect x="458" y="194" width="52" height="12" opacity="0.4"/></g>
</svg>
<p class="tb-caption">図: 機械設計の山は設計段階、電気は製作段階、ソフトは立上げ段階に来る。立上げでソフトに負荷が集中するので、機械の出図遅れはそのままソフトの時間を削る。</p>`;

/* ---------- 2. spec ---------- */
const PRESS_FIT = `<svg class="tb-chart" viewBox="0 0 520 270" role="img" aria-label="小形圧入機の仕様項目を示したイラスト">
<text class="k-title lbl" x="260" y="18" text-anchor="middle">小形圧入機と仕様項目</text>
<rect class="k-ground" x="120" y="250" width="220" height="8"/>
<g class="k-shadow"><rect class="k-part" x="140" y="160" width="180" height="90" rx="4"/></g>
<rect class="k-alu" x="150" y="150" width="160" height="12" rx="2"/>
<rect class="k-part-h" x="166" y="54" width="12" height="96"/><rect class="k-part-h" x="282" y="54" width="12" height="96"/>
<rect class="k-part" x="158" y="40" width="144" height="18" rx="3"/>
<rect class="k-alu" x="214" y="22" width="32" height="18" rx="3"/>
<rect class="k-part-h" x="225" y="58" width="10" height="34"/>
<rect class="k-yellow" x="214" y="92" width="32" height="10" rx="1"/>
<rect class="k-accent" x="224" y="102" width="12" height="14" rx="1"/>
<rect class="k-alu" x="206" y="124" width="48" height="26" rx="2"/>
<rect class="k-glass" x="146" y="46" width="168" height="104" rx="3" opacity="0.5"/>
<circle class="k-yellow" cx="166" cy="210" r="12"/><circle class="k-estop" cx="166" cy="210" r="8"/>
<rect class="k-screen" x="250" y="190" width="56" height="34" rx="2"/><text class="k-screen-t" x="278" y="211" text-anchor="middle" font-size="10">OK 1.82kN</text>
<g class="k-badge"><circle cx="40" cy="60" r="10"/><circle cx="40" cy="112" r="10"/><circle cx="40" cy="164" r="10"/><circle cx="480" cy="60" r="10"/><circle cx="480" cy="112" r="10"/><circle cx="480" cy="164" r="10"/><circle cx="480" cy="216" r="10"/></g>
<g class="k-badge-t" text-anchor="middle"><text x="40" y="64">1</text><text x="40" y="116">2</text><text x="40" y="168">3</text><text x="480" y="64">4</text><text x="480" y="116">5</text><text x="480" y="168">6</text><text x="480" y="220">7</text></g>
<g class="tick"><text x="56" y="56">ワーク</text><text x="56" y="70">寸法・材質</text><text x="56" y="108">能力</text><text x="56" y="122">荷重・タクト</text><text x="56" y="160">精度</text><text x="56" y="174">位置・荷重</text>
<text x="464" y="56" text-anchor="end">ユーティリティ</text><text x="464" y="70" text-anchor="end">電源・エア</text><text x="464" y="108" text-anchor="end">安全</text><text x="464" y="122" text-anchor="end">ガード・規格</text><text x="464" y="160" text-anchor="end">品質記録</text><text x="464" y="174" text-anchor="end">荷重波形</text><text x="464" y="212" text-anchor="end">受入基準</text><text x="464" y="226" text-anchor="end">何を何個で合格</text></g>
<g class="k-thin"><path d="M100,62 L218,108"/><path d="M110,116 L214,96"/><path d="M110,168 L230,136"/><path d="M380,62 L240,32"/><path d="M398,114 L314,66"/><path d="M410,166 L306,206"/><path d="M398,218 L340,240"/></g>
</svg>
<p class="tb-caption">図: 仕様書の各項目は装置のどこに効くかで考えると漏れにくい。サーボプレスの荷重値を画面に出すか、記録を何年残すかも仕様の一部。</p>`;

const AMBIG = `<svg class="tb-chart" viewBox="0 0 520 210" role="img" aria-label="あいまいな仕様と測れる仕様の比較">
<text class="k-title lbl" x="260" y="18" text-anchor="middle">あいまいな要求を「測れる」形に</text>
<rect class="k-panel" x="8" y="30" width="246" height="172" rx="8"/><rect class="k-panel" x="266" y="30" width="246" height="172" rx="8"/>
<text class="k-bad-t" x="131" y="52" text-anchor="middle">悪い例</text><text class="k-good-t" x="389" y="52" text-anchor="middle">良い例</text>
<g class="lbl"><text x="22" y="80">「高速に圧入する」</text><text x="22" y="112">「精度よく位置決め」</text><text x="22" y="144">「メンテしやすいこと」</text><text x="22" y="176">「安全であること」</text></g>
<g class="tick"><text x="280" y="76">サイクルタイム 12 s 以下</text><text x="280" y="90">(搬入〜搬出、連続 100 回の平均)</text>
<text x="280" y="108">圧入深さ 5.00 ± 0.05 mm</text><text x="280" y="122">(全数測定、Cpk 1.33 以上)</text>
<text x="280" y="140">消耗品交換 15 min 以内</text><text x="280" y="154">(専用工具なし、1 人)</text>
<text x="280" y="172">ISO 12100 でリスク評価</text><text x="280" y="186">ガードは ISO 14120 に基づく</text></g>
<path class="k-move" d="M232,108 H262" marker-end="url(#k-arrow-b)"/>
</svg>
<p class="tb-caption">図: 「値・条件・測り方」の 3 点がそろって初めて受入で合否を判定できる。</p>`;

/* ---------- 3. cycle time ---------- */
const GANTT = `<svg class="tb-chart" viewBox="0 0 520 250" role="img" aria-label="直列動作のタイムチャートとインデックステーブル化後の比較">
<text class="k-title lbl" x="260" y="18" text-anchor="middle">タイムチャート (直列 1 ステーション)</text>
<g class="tick" text-anchor="end"><text x="92" y="50">搬入・クランプ</text><text x="92" y="74">圧入</text><text x="92" y="98">検査</text><text x="92" y="122">搬出</text></g>
<line class="k-thin" x1="100" y1="34" x2="100" y2="134"/>
<g class="k-accent"><rect x="100" y="40" width="102.5" height="14" rx="2"/><rect x="202.5" y="64" width="125" height="14" rx="2"/><rect x="327.5" y="88" width="100" height="14" rx="2"/><rect x="427.5" y="112" width="75" height="14" rx="2"/></g>
<line class="k-thin" x1="100" y1="134" x2="502" y2="134"/>
<g class="tick" text-anchor="middle"><text x="100" y="148">0</text><text x="225" y="148">5</text><text x="350" y="148">10</text><text x="475" y="148">15 s</text></g>
<line x1="328" y1="30" x2="328" y2="136" stroke="#e53935" stroke-width="1.6" stroke-dasharray="5 3"/><text class="k-bad-t" x="332" y="32" font-size="11">目標 9.14 s</text>
<text class="lbl" x="502" y="166" text-anchor="end">合計 16.1 s → 目標を超える</text>
<text class="k-title lbl" x="260" y="192" text-anchor="middle">4 ステーション化 (同時に動く)</text>
<g class="k-accent"><rect x="100" y="204" width="102.5" height="8" rx="2"/><rect x="100" y="214" width="125" height="8" rx="2"/><rect x="100" y="224" width="100" height="8" rx="2"/><rect x="100" y="234" width="75" height="8" rx="2"/></g>
<rect x="225" y="204" width="30" height="38" rx="2" fill="#e8a33a" opacity="0.8"/>
<text class="tick" x="262" y="226">← インデックス 1.2 s</text><text class="lbl" x="502" y="226" text-anchor="end">6.2 s</text>
</svg>
<p class="tb-caption">図: 上は 1 か所ですべてを順に行う場合。下は回転テーブルで 4 工程を同時に行う場合で、サイクルは最も遅い工程 (圧入 5.0 s) とテーブル旋回 1.2 s の和になる。</p>`;

const INDEX_TABLE = `<svg class="tb-chart" viewBox="0 0 520 270" role="img" aria-label="4 ステーションのインデックステーブル">
<text class="k-title lbl" x="260" y="18" text-anchor="middle">インデックステーブル (上から見た図)</text>
<ellipse class="k-shadow" cx="260" cy="150" rx="108" ry="108" opacity="0.25"/>
<circle class="k-alu" cx="260" cy="146" r="104"/><circle class="k-part" cx="260" cy="146" r="22"/>
<path class="k-move" d="M330,70 A100,100 0 0 1 352,94" fill="none" marker-end="url(#k-arrow-b)"/>
<g class="k-part"><rect x="240" y="56" width="40" height="28" rx="4"/><rect x="322" y="126" width="28" height="40" rx="4"/><rect x="240" y="208" width="40" height="28" rx="4"/><rect x="170" y="126" width="28" height="40" rx="4"/></g>
<g class="k-accent"><circle cx="260" cy="70" r="8"/><circle cx="336" cy="146" r="8"/><circle cx="260" cy="222" r="8"/><circle cx="184" cy="146" r="8"/></g>
<rect class="k-yellow" x="226" y="250" width="68" height="8" rx="2"/>
<g class="k-shadow"><rect class="k-part" x="384" y="122" width="70" height="48" rx="4"/></g><rect class="k-part-h" x="358" y="140" width="28" height="12"/>
<text class="tick" x="419" y="190" text-anchor="middle">圧入ユニット</text>
<g class="k-shadow"><rect class="k-alu" x="236" y="28" width="48" height="18" rx="3"/></g><text class="tick" x="292" y="40">検査カメラ</text>
<rect class="k-glass" x="70" y="126" width="60" height="40" rx="3"/><text class="tick" x="100" y="184" text-anchor="middle">搬出シュート</text>
<g class="lbl"><text x="232" y="74" text-anchor="end">ST3 検査</text><text x="336" y="114" text-anchor="middle">ST2 圧入</text><text x="300" y="226">ST1 搬入</text><text x="184" y="114" text-anchor="middle">ST4 搬出</text></g>
<text class="tick" x="300" y="256">作業者側 (ライトカーテン)</text>
</svg>
<p class="tb-caption">図: テーブルが 90° ずつ回り、4 つのワークが同時にそれぞれの工程を受ける。作業者は手前の ST1 だけに触れ、他の工程はガードの内側にある。</p>`;

/* ---------- 4. cost & schedule ---------- */
const COST_BAR = `<svg class="tb-chart" viewBox="0 0 520 230" role="img" aria-label="装置開発費の内訳の積み上げ棒">
<text class="k-title lbl" x="260" y="18" text-anchor="middle">見積例の内訳 (合計 924 万円)</text>
<g transform="translate(20 50)">
<rect x="0" y="0" width="114.3" height="40" fill="#5b8def"/><rect x="114.3" y="0" width="71.4" height="40" fill="#e8a33a"/><rect x="185.7" y="0" width="57.1" height="40" fill="#8e6cd8"/><rect x="242.8" y="0" width="76.2" height="40" fill="#3aa57a"/><rect x="319" y="0" width="42.9" height="40" fill="#c4677d"/><rect x="361.9" y="0" width="38.1" height="40" fill="#5fb3c4"/><rect x="400" y="0" width="40" height="40" fill="#9aa3b0" stroke="#666" stroke-dasharray="3 2"/>
<g class="tick" text-anchor="middle"><text x="57" y="60">機械部品</text><text x="57" y="74">240</text><text x="150" y="60">電気部品</text><text x="150" y="74">150</text><text x="214" y="60">ソフト</text><text x="214" y="74">120</text><text x="281" y="60">機械設計</text><text x="281" y="74">160</text><text x="340" y="60">組立</text><text x="340" y="74">90</text><text x="381" y="60">立上げ</text><text x="381" y="74">80</text><text x="420" y="60">予備</text><text x="420" y="74">84</text></g>
</g>
<text class="tick" x="20" y="148">単位: 万円。購入品 (機械+電気) は 390 万円で全体の約 42 %。</text>
<text class="tick" x="20" y="166">人の時間 (設計・ソフト・組立・立上げ) は 450 万円で約 49 %。</text>
<text class="tick" x="20" y="184">予備費は小計 840 万円の 10 %。新規要素が多いほど増やす。</text>
<g class="k-shadow"><rect class="k-part" x="400" y="136" width="96" height="70" rx="6"/></g>
<rect class="k-screen" x="408" y="144" width="80" height="26" rx="2"/><text class="k-screen-t" x="482" y="162" text-anchor="end">9,240,000</text>
<g class="k-alu"><rect x="410" y="176" width="16" height="10" rx="2"/><rect x="432" y="176" width="16" height="10" rx="2"/><rect x="454" y="176" width="16" height="10" rx="2"/><rect x="410" y="190" width="16" height="10" rx="2"/><rect x="432" y="190" width="16" height="10" rx="2"/><rect x="454" y="190" width="16" height="10" rx="2"/></g>
<rect class="k-accent" x="474" y="176" width="12" height="24" rx="2"/>
</svg>
<p class="tb-caption">図: 専用機の見積は部品代だけでなく、設計・ソフト・組立・立上げの工数が半分近くを占めることが多い。</p>`;

const SCHEDULE = `<svg class="tb-chart" viewBox="0 0 520 250" role="img" aria-label="装置開発の日程表と DR、長納期品">
<text class="k-title lbl" x="260" y="18" text-anchor="middle">日程表の例 (20 週)</text>
<g class="tick" text-anchor="end"><text x="104" y="56">構想設計</text><text x="104" y="78">詳細設計・出図</text><text x="104" y="100">長納期品 (サーボ)</text><text x="104" y="122">加工品の手配</text><text x="104" y="144">電気・制御盤</text><text x="104" y="166">組立・配線</text><text x="104" y="188">ソフト・立上げ</text><text x="104" y="210">FAT・出荷</text></g>
<g class="k-thin"><line x1="110" y1="36" x2="110" y2="218"/><line x1="110" y1="218" x2="510" y2="218"/></g>
<g class="tick" text-anchor="middle"><text x="110" y="232">0</text><text x="210" y="232">5</text><text x="310" y="232">10</text><text x="410" y="232">15</text><text x="500" y="232">20 週</text></g>
<g style="fill:var(--tb-accent)" opacity="0.85"><rect x="110" y="46" width="60" height="12" rx="2"/><rect x="170" y="68" width="100" height="12" rx="2"/><rect x="270" y="112" width="80" height="12" rx="2"/><rect x="210" y="134" width="160" height="12" rx="2"/><rect x="410" y="156" width="40" height="12" rx="2"/><rect x="450" y="178" width="40" height="12" rx="2"/><rect x="490" y="200" width="20" height="12" rx="2"/></g>
<rect x="170" y="90" width="240" height="12" rx="2" fill="#e53935" opacity="0.8"/>
<text x="290" y="100" text-anchor="middle" style="fill:#fff;font-size:11px;font-weight:700">12 週 (先行発注)</text>
<g><path d="M110,40 l5,-8 l5,8 z" class="k-yellow"/><path d="M170,40 l5,-8 l5,8 z" class="k-yellow"/><path d="M270,40 l5,-8 l5,8 z" class="k-yellow"/><path d="M485,40 l5,-8 l5,8 z" class="k-yellow"/></g>
<g class="tick"><text x="122" y="34">DR0</text><text x="182" y="34">DR1</text><text x="282" y="34">DR2</text><text x="480" y="34" text-anchor="end">DR3</text></g>
</svg>
<p class="tb-caption">図: サーボプレスのような長納期品は DR1 (構想確定) の直後に先行発注し、加工品は DR2 (出図) 後に手配する。赤の帯がクリティカルパスを決める。</p>`;

/* ---------- 5. purchased parts ---------- */
const CATALOG = `<svg class="tb-chart" viewBox="0 0 520 250" role="img" aria-label="カタログから選ぶ標準部品の例">
<text class="k-title lbl" x="260" y="18" text-anchor="middle">カタログで選ぶ代表的な標準部品</text>
<g class="k-shadow"><rect class="k-part" x="20" y="70" width="110" height="18" rx="3"/></g><rect class="k-alu" x="44" y="56" width="40" height="16" rx="3"/><g class="k-part-h"><rect x="26" y="88" width="8" height="10"/><rect x="116" y="88" width="8" height="10"/></g>
<text class="tick" x="75" y="122" text-anchor="middle">リニアガイド</text>
<g class="k-shadow"><rect class="k-alu" x="160" y="58" width="80" height="34" rx="4"/></g><rect class="k-part-h" x="240" y="68" width="34" height="12"/><rect class="k-part" x="272" y="64" width="10" height="20" rx="2"/><circle class="k-led-off" cx="200" cy="56" r="3"/>
<text class="tick" x="220" y="122" text-anchor="middle">エアシリンダ</text>
<g class="k-shadow"><rect class="k-alu" x="320" y="64" width="150" height="24" rx="3"/></g><rect class="k-part" x="390" y="54" width="34" height="12" rx="2"/><rect class="k-part" x="300" y="60" width="22" height="32" rx="3"/><path class="k-rubber" d="M300,76 h-14" stroke-width="6"/>
<text class="tick" x="385" y="122" text-anchor="middle">電動アクチュエータ</text>
<g class="k-shadow"><rect class="k-part" x="40" y="160" width="12" height="40"/></g><rect class="k-part" x="34" y="156" width="24" height="8" rx="2"/><rect class="k-part-h" x="70" y="166" width="40" height="10"/><rect class="k-part" x="96" y="160" width="10" height="22" rx="1"/>
<text class="tick" x="75" y="222" text-anchor="middle">位置決めピン・ボルト</text>
<rect class="k-rubber" x="160" y="168" width="40" height="14" rx="4"/><circle class="k-part" cx="230" cy="175" r="18"/><circle class="k-alu" cx="230" cy="175" r="8"/><rect class="k-part-h" x="248" y="171" width="34" height="8"/>
<text class="tick" x="220" y="222" text-anchor="middle">カップリング・軸受</text>
<rect class="k-part" x="320" y="160" width="60" height="36" rx="3"/><circle class="k-led-g" cx="370" cy="170" r="3"/><path d="M320,178 C300,178 300,200 290,206" style="fill:none;stroke:#c87533;stroke-width:3"/>
<rect class="k-part" x="400" y="156" width="70" height="44" rx="4"/><rect class="k-glass" x="410" y="164" width="22" height="22" rx="11"/><text class="tick" x="450" y="182">ON</text>
<text class="tick" x="395" y="222" text-anchor="middle">センサ・スイッチ類</text>
</svg>
<p class="tb-caption">図: 機能部品の多くはカタログ品で賄える。設計者が描くのはそれらをつなぐ板・ブラケット・治具であることが多い。</p>`;

const SELECT_FLOW = `<svg class="tb-chart" viewBox="0 0 520 220" role="img" aria-label="購入品の選定フロー">
<text class="k-title lbl" x="260" y="18" text-anchor="middle">購入品の選定フロー</text>
<g class="k-shadow">
<rect class="k-panel" x="10" y="40" width="92" height="56" rx="8"/><rect class="k-panel" x="112" y="40" width="92" height="56" rx="8"/><rect class="k-panel" x="214" y="40" width="92" height="56" rx="8"/><rect class="k-panel" x="316" y="40" width="92" height="56" rx="8"/><rect class="k-panel" x="418" y="40" width="92" height="56" rx="8"/></g>
<g class="lbl" text-anchor="middle"><text x="56" y="64">要求を数値化</text><text x="158" y="64">形式を選ぶ</text><text x="260" y="64">計算で型番</text><text x="362" y="64">供給を確認</text><text x="464" y="64">BOM に登録</text></g>
<g class="tick" text-anchor="middle"><text x="56" y="82">荷重・速度</text><text x="158" y="82">空圧 or 電動</text><text x="260" y="82">寿命・余裕</text><text x="362" y="82">納期・代替</text><text x="464" y="82">型番を固定</text></g>
<g class="k-move"><path d="M102,68 H110" marker-end="url(#k-arrow-b)"/><path d="M204,68 H212" marker-end="url(#k-arrow-b)"/><path d="M306,68 H314" marker-end="url(#k-arrow-b)"/><path d="M408,68 H416" marker-end="url(#k-arrow-b)"/></g>
<path class="k-move" d="M362,98 Q362,130 260,130 Q170,130 166,100" fill="none" stroke-dasharray="4 3" marker-end="url(#k-arrow-b)"/>
<text class="tick" x="260" y="146" text-anchor="middle">納期 NG・生産終了予定なら形式選定に戻る</text>
<g class="k-shadow"><rect class="k-part" x="160" y="160" width="200" height="50" rx="6"/></g>
<rect class="k-screen" x="168" y="166" width="184" height="38" rx="3"/>
<text class="k-screen-t" x="176" y="182" font-size="10">型番: XG-20-150-B-M</text>
<text class="k-screen-t" x="176" y="198" font-size="10">納期 3 週 / 代替: 2 社 / 標準品</text>
</svg>
<p class="tb-caption">図: 計算で決めた型番も、納期や供給の確認で否決されることがある。選定は性能と調達の両方を満たして完了 (型番は架空)。</p>`;

export const EQUIPMENT: TextChapter[] = [
  {
    id: "equip-overview",
    part: "equipment",
    title: "装置設計とは — 産業装置・R&D 用装置・量産装置の違い",
    minutes: 15,
    level: 1,
    lead: "「装置設計」は、製品そのものではなく、製品を作る・試験する・研究するための機械を設計する仕事です。実験装置、専用機、量産ラインでは求められるものが大きく違い、同じ部品選びでも正解が変わります。この部では装置設計の全体像から仕様・工程・コスト・購入品までを扱います。",
    body: `
<h2>装置設計は「製品の設計」と何が違うか</h2>
<p>家電や自動車のような<b>製品</b>は同じものを何万台も作るため、1 台あたりの部品コストを徹底的に削り、金型や専用部品を起こします。一方、<b>装置</b>は多くの場合 1 台〜数台しか作りません。そのため、</p>
<ul>
  <li>設計工数 (人の時間) がコストの大きな割合を占める。</li>
  <li>金型を起こさず、<b>カタログ部品と切削加工品</b>で構成する (「購入品の選定と標準部品の活用」の章)。</li>
  <li>試作機がそのまま本番機になる。「作ってから直す」余地が小さく、立上げ時の調整機構が重要。</li>
  <li>使う人は社内や顧客の作業者・保全員で、仕様書と受入検査で約束を交わす (「装置仕様書の作り方」の章)。</li>
</ul>

<h2>3 種類の装置</h2>
${THREE_KINDS}
<table class="tb-table">
  <tr><th>観点</th><th>R&amp;D 用装置</th><th>産業装置 (専用機)</th><th>量産ライン</th></tr>
  <tr><td>目的</td><td>現象を調べる・条件を探す</td><td>1 工程を自動化・省人化</td><td>大量に安定して作る</td></tr>
  <tr><td>最重視</td><td><b>柔軟性</b>・測定のしやすさ</td><td>仕様どおりの<b>能力と品質</b></td><td><b>処理能力 (スループット)</b>と<b>信頼性</b></td></tr>
  <tr><td>台数</td><td>1 台</td><td>1〜数台</td><td>ライン 1 本 (多数のユニット)</td></tr>
  <tr><td>運転時間</td><td>実験時のみ</td><td>1〜2 直</td><td>2〜3 直、連続</td></tr>
  <tr><td>コストの考え方</td><td>予算内で早く</td><td>投資回収 (省人化効果)</td><td>1 個あたり費用・稼働率</td></tr>
  <tr><td>典型的な工夫</td><td>長穴・目盛付きステージ、センサを後付けできる余白</td><td>段取り替え・品質記録</td><td>冗長化、予備ユニット、MTTR 短縮</td></tr>
</table>
<p>R&amp;D 用装置で「位置を ±5 mm 動かせる長穴」は美点ですが、量産ラインで同じ長穴を残すと、ずれて不良の原因になります。逆に量産ラインの重厚な安全・保全の仕組みを試験装置に持ち込むと、予算と日程を圧迫します。<b>まず自分の装置がどの種類か</b>を決めることが設計の出発点です。</p>

<h2>ライフサイクルと関わる人</h2>
${LIFECYCLE}
<p>装置は「企画・仕様 → 設計 → 製作・組立 → 立上げ・受入 → 稼働・保全 → 改造・廃棄」のライフサイクルをたどります。機械・電気・ソフトの 3 分野が並行して進むため、<b>インタフェース</b> (センサの取付位置、配線ルート、動作シーケンス) を早い段階で決めることが重要です。配置は「レイアウト設計の進め方」、骨組みは「装置フレームの設計」、安全は「安全設計とリスクアセスメント」の章を参照してください。</p>

<h2>設計例: 同じ「ねじ締め」を 3 種類で考える</h2>
<p>M3 ねじ締めを例に比べます。</p>
<ul>
  <li><b>R&amp;D 用</b>: トルクと回転角を測りたい。電動ドライバをリニアステージに付け、トルクセンサとデータロガーを付ける。ワークは手置き、治具は交換式。</li>
  <li><b>専用機</b>: 1 直 500 個を 1 人で。ワークを置いて両手押しボタンで起動、締付けトルク OK/NG を記録。サイクル 20 s 程度で十分。</li>
  <li><b>量産ライン</b>: 3 直で 1 日 2 万個。自動供給機、複数スピンドル、ねじ詰まり時の自動リトライ、予備ユニットへの切替を設計する。</li>
</ul>
<div class="tb-note">よくある失敗: 試験装置の「調整できる構造」をそのまま量産機に流用する / 量産ラインの仕様を R&amp;D 装置に要求して予算超過 / 機械設計が終わってから電気・ソフトに相談する / 保全する人を想定していない。</div>
`,
    points: [
      "装置は少数生産なので、設計工数とカタログ部品の活用がコストを決める。",
      "R&D 用は柔軟性、専用機は仕様どおりの能力、量産ラインはスループットと信頼性を最重視する。",
      "機械・電気・ソフトのインタフェースを早期に決める。立上げではソフトに負荷が集中する。",
      "まず装置の種類を決め、それに合った作り込みのレベルを選ぶ。",
    ],
    exercises: [
      {
        q: "大学の研究室から「接着剤の硬化条件を調べるため、加圧力 10〜200 N、温度 25〜150 ℃ で試験片を押さえる装置」を頼まれた。量産用の加圧装置と比べ、設計で重視する点を 3 つ挙げよ。",
        a: "① <b>条件の可変範囲と測定</b>: 加圧力を連続可変にし、ロードセルと温度センサで実測値を記録できること。② <b>試験片の着脱・治具交換のしやすさ</b>: 形状の違う試験片に対応するため治具を交換式に。③ <b>拡張余地</b>: センサやカメラを後付けできる取付穴・空間を残す。逆にサイクルタイムや無人運転、24 時間耐久は優先度が低い。",
      },
      {
        q: "量産ラインで 1 台のユニットが停止するとライン全体が止まる。このリスクに対し、装置設計でとれる対策を 2 つ挙げよ。",
        a: "① <b>MTTR の短縮</b>: 消耗部を工具なしで交換できるユニット構造、異常箇所を示す HMI、予備品の常備。② <b>冗長化・バッファ</b>: 重要工程を 2 台並列にする、工程間にワークを貯めるバッファを置いて短時間の停止を吸収する。",
      },
    ],
    quiz: [
      { q: "量産ラインの装置で最も重視されるものは?", choices: ["条件を変えられる柔軟性", "スループットと信頼性", "1 台あたりの部品の安さだけ"], answer: 1, explain: "連続運転で大量に作るため、処理能力と止まらないことが最優先です。" },
      { q: "装置が製品と違い、カタログ部品と切削加工品を中心に作られる主な理由は?", choices: ["作る台数が少なく金型が割に合わない", "カタログ部品の方が必ず高性能", "規格で決まっている"], answer: 0, explain: "1〜数台では金型費を回収できないため、標準部品と加工品で構成します。" },
      { q: "立上げ段階で負荷が集中しやすいのはどの分野?", choices: ["機械設計", "ソフト (制御プログラム)", "購買"], answer: 1, explain: "実機で動作を確認・調整するのは立上げ段階なので、ソフトに負荷が集中します。" },
    ],
  },
  {
    id: "equip-spec",
    part: "equipment",
    title: "装置仕様書の作り方 — 要求仕様書・受入条件・変更管理",
    minutes: 18,
    level: 2,
    lead: "装置の失敗の多くは設計ミスではなく、仕様のあいまいさから生まれます。発注側がまとめる要求仕様書 (URS) と、受注側が返す仕様書の項目、測れる書き方、受入基準、変更管理までを、小形圧入機を例に学びます。",
    body: `
<h2>URS と仕様書</h2>
<p>発注側 (使う側) が「何をしたいか」をまとめたものを<b>要求仕様書 (URS: User Requirement Specification)</b> と呼びます。受注側 (設計側) はこれを読んで「どう実現するか」を<b>仕様書 (機能仕様書)</b> にまとめて返し、双方が合意してから設計に入ります。社内で装置を作る場合も、生産技術部門と製造部門の間で同じ約束が必要です。</p>

<h2>仕様書に必要な項目</h2>
<table class="tb-table">
  <tr><th>項目</th><th>書く内容の例</th></tr>
  <tr><td>目的・範囲</td><td>何の工程を自動化するか、前後工程との境界、作業者の役割</td></tr>
  <tr><td>ワーク仕様</td><td>図面番号、寸法・公差のばらつき、材質、質量、品種数</td></tr>
  <tr><td>能力・タクト</td><td>生産数/日、稼働時間、サイクルタイム、稼働率の目標</td></tr>
  <tr><td>精度・品質</td><td>位置・荷重・寸法の許容値、全数検査の有無、記録の保存</td></tr>
  <tr><td>環境</td><td>温度・湿度、粉じん、クリーン度、床荷重、設置スペース</td></tr>
  <tr><td>ユーティリティ</td><td>電源 (電圧・相・容量)、圧縮空気 (圧力・流量)、通信</td></tr>
  <tr><td>安全・規格</td><td>リスクアセスメントの方法、適用規格、ガード・非常停止</td></tr>
  <tr><td>保守</td><td>消耗品と交換周期、予備品、取扱説明書・図面の納品物</td></tr>
  <tr><td>受入基準</td><td>FAT (出荷前検査) と SAT (据付後検査) の項目・方法・合否</td></tr>
</table>
${PRESS_FIT}

<h2>あいまいな言葉を「測れる」形に</h2>
<p>「高速」「高精度」「安全」「使いやすい」は、人によって思い浮かべる数値が違います。各要求に <b>値</b>・<b>条件</b>・<b>測り方</b> を付けます。</p>
${AMBIG}
<ul>
  <li><b>サイクルタイム</b>は「どこからどこまで」を書く。作業者の手置き時間を含むかで数秒変わる。</li>
  <li><b>精度</b>は「何の・どこを基準に・何個測って・どの統計量で」を書く。</li>
  <li><b>稼働率</b>は計画停止 (段取り替え・点検) を分母に入れるかを明記する。</li>
  <li>ワークのばらつきは「図面公差内のすべてを流せること」とするか、「実測の範囲」とするかで設計が変わる。</li>
</ul>

<h2>設計例: 小形圧入機の仕様表</h2>
<p>軸 (φ6 mm) をハウジングに圧入する専用機の仕様を、受入で判定できる形で書きます。</p>
<table class="tb-table">
  <tr><th>項目</th><th>仕様</th><th>受入での確認方法</th></tr>
  <tr><td>ワーク</td><td>ハウジング (アルミ, 40×40×20 mm) + 軸 φ6 (鋼), 2 品種</td><td>両品種で実施</td></tr>
  <tr><td>生産数</td><td>1 直 (430 min 稼働) で 1 800 個</td><td>—</td></tr>
  <tr><td>サイクルタイム</td><td>12 s 以下 (起動ボタン押下〜搬出完了)</td><td>連続 100 サイクルの平均と最大を記録</td></tr>
  <tr><td>圧入荷重</td><td>最大 3 kN、荷重を 0.01 kN 単位で記録</td><td>校正済みロードセルとの比較</td></tr>
  <tr><td>圧入深さ</td><td>5.00 ± 0.05 mm</td><td>50 個を測定し Cpk 1.33 以上</td></tr>
  <tr><td>判定</td><td>荷重−変位の波形が上下限窓内なら OK</td><td>限度見本 (OK/NG) で誤判定 0</td></tr>
  <tr><td>ユーティリティ</td><td>AC 200 V 単相 1 kVA、エア 0.5 MPa</td><td>銘板・配線図の確認</td></tr>
  <tr><td>安全</td><td>ISO 12100 によるリスク評価、前面ライトカーテン、非常停止</td><td>停止機能の試験・記録</td></tr>
  <tr><td>段取り替え</td><td>品種切替 5 min 以内、工具不要</td><td>作業者 1 人で実測</td></tr>
  <tr><td>納品物</td><td>組立図、部品表、電気図、プログラム、取扱説明書</td><td>チェックリスト</td></tr>
</table>
<p>1 直 1 800 個は 430 min = 25 800 s を 1 800 で割って 14.3 s/個。サイクル 12 s とすれば、稼働率 12/14.3 ≒ 84 % でも達成できる計算です。こうした根拠を備考に残しておくと、後で仕様を変えるときに判断しやすくなります。</p>

<h2>変更管理</h2>
<p>設計途中の仕様変更は避けられません。問題は<b>口頭で変更して記録が残らない</b>ことです。</p>
<ol class="tb-flow">
  <li>変更依頼書を起票 (内容・理由・依頼者・日付)。</li>
  <li>影響を評価 (コスト・日程・安全・他ユニットへの影響)。</li>
  <li>双方で承認し、仕様書の版数を上げて変更履歴に記載。</li>
  <li>図面・部品表・プログラムに反映し、受入基準も更新。</li>
</ol>
<div class="tb-note">よくある失敗: 「現状と同等」「適宜」「十分な」で済ませる / サイクルタイムの起点と終点を書かない / ワークの公差ばらつきを考えず実物 1 個で試す / 受入基準を出荷直前に決める / 電話で受けた変更が図面に反映されない。</div>
`,
    points: [
      "URS は発注側の「何をしたいか」、仕様書は受注側の「どう実現するか」。合意してから設計する。",
      "すべての要求に値・条件・測り方を付け、受入で合否を判定できるようにする。",
      "サイクルタイムは区間、精度は統計量、稼働率は分母を明記する。",
      "変更は書面で影響評価し、版数と履歴を残す。",
    ],
    exercises: [
      {
        q: "URS に「ワークを素早く正確に搬送すること」と書かれていた。測れる形に書き直す例を示せ。",
        a: "例: 「ワーク (質量 0.5 kg) をコンベヤ上の A 点から治具上の B 点まで、2.0 s 以内に搬送し、治具上の位置ずれを ±0.1 mm 以内とする。連続 200 回で測定し、全数が範囲内であること」。値 (2.0 s, ±0.1 mm)、条件 (ワーク質量、区間)、測り方 (連続 200 回、全数) がそろっている。",
      },
      {
        q: "1 直 7.5 h 稼働で 2 000 個の要求がある。稼働率 85 % を見込むと、仕様書に書くべきサイクルタイムの上限は何 s か。",
        a: "使える時間 = 7.5 × 3 600 = 27 000 s。必要な平均 = 27 000 / 2 000 = 13.5 s/個。稼働率 85 % を見込むとサイクルタイム ≤ 13.5 × 0.85 = <b>11.5 s</b> (11.475 s を切り下げ)。",
      },
    ],
    quiz: [
      { q: "URS (要求仕様書) を主に作成するのは?", choices: ["装置を使う発注側", "部品メーカー", "認証機関"], answer: 0, explain: "URS は使う側が「何をしたいか」を記述します。" },
      { q: "「高精度に位置決めすること」の改善として最も適切なのは?", choices: ["「非常に高精度に」と強調する", "「基準面から 10.00 ± 0.02 mm、30 回測定で全数範囲内」と書く", "「他社装置と同等」と書く"], answer: 1, explain: "値・基準・測り方がそろって初めて受入で判定できます。" },
      { q: "FAT とは?", choices: ["据付後の現地検査", "出荷前に製作工場で行う受入検査", "故障解析"], answer: 1, explain: "FAT は Factory Acceptance Test、据付後は SAT (Site Acceptance Test) です。" },
    ],
  },
  {
    id: "equip-cycle-time",
    part: "equipment",
    title: "工程設計とサイクルタイム — タクト・タイムチャート・ボトルネック",
    minutes: 20,
    level: 2,
    lead: "必要な生産数からタクトタイムを求め、装置の動作をタイムチャートに並べてサイクルタイムを見積もり、足りなければ並列化やインデックステーブルで縮めます。工程の組み方は、機械の構成そのものを決める最初の判断です。",
    body: `
<h2>タクトタイムとサイクルタイム</h2>
<div class="tb-formula">タクトタイム = 稼働可能時間 ÷ 必要生産数</div>
<p><b>タクトタイム</b>は「何秒に 1 個作らなければならないか」という<b>需要側</b>の値、<b>サイクルタイム</b>は「装置が 1 個作るのに何秒かかるか」という<b>装置側</b>の値です。装置は故障・材料待ち・段取り替えで止まるので、稼働率 (目標 85 % など) を見込んでサイクルタイムをタクトより短くします。</p>
<div class="tb-formula">目標サイクルタイム ≤ タクトタイム × 稼働率</div>

<h2>タイムチャート</h2>
<p>アクチュエータごとの動作を横軸=時間の帯で並べたものが<b>タイムチャート</b> (ガントチャート) です。シリンダの前進・後退、モータの移動、センサ確認の待ちを 1 行ずつ書き、どれが同時に動けるか (並行)、どれが前の動作の完了を待つか (直列) を整理します。</p>
<ul>
  <li>エアシリンダは速度調整で変わるため、ストローク ÷ 速度に加え、起動遅れ・クッションを含めた実測に近い値を使う。</li>
  <li>センサ確認・判定・通信の待ち (数十〜数百 ms) も積み重なると無視できない。</li>
  <li>動作が干渉しない範囲で、前の動作の終わり際に次を始める「オーバーラップ」を検討する。</li>
</ul>

<h2>設計例: 圧入セルのタクト</h2>
<p>条件: 2 直、1 直 480 min から休憩等 50 min を引いた 430 min 稼働、必要数 4 800 個/日、稼働率 85 %。</p>
<ol>
  <li>稼働可能時間 = 2 × 430 × 60 = 51 600 s</li>
  <li>タクト = 51 600 ÷ 4 800 = <b>10.75 s</b></li>
  <li>目標サイクル = 10.75 × 0.85 = <b>9.14 s</b></li>
</ol>
<p>工程の所要時間を見積もると、搬入・クランプ 4.1 s、圧入 5.0 s、検査 4.0 s、搬出 3.0 s でした。1 か所で順に行うと合計 16.1 s で、目標を大きく超えます。</p>
${GANTT}
<p>そこで 4 ステーションのインデックステーブルにすると、4 つの工程が同時に進みます。サイクルは最も遅い工程 (圧入 5.0 s) とテーブルの旋回 1.2 s の和で <b>6.2 s</b>。1 日の能力は 51 600 ÷ 6.2 ≒ 8 320 個、稼働率 85 % で約 7 070 個となり、4 800 個を余裕をもって満たします。</p>
${INDEX_TABLE}

<h2>ボトルネックとライン編成</h2>
<p>工程を分けたとき、最も時間のかかる工程 (<b>ボトルネック</b>) がサイクルを決めます。工程間の時間のばらつきを表すのが<b>編成効率</b>です。</p>
<div class="tb-formula">編成効率 = 各工程時間の合計 ÷ (工程数 × 最大工程時間)</div>
<p>上の例は 16.1 ÷ (4 × 5.0) = 80.5 %。ボトルネックの圧入をさらに縮めるには、</p>
<ul>
  <li>圧入の「接近」を早送り、「圧入」だけ低速にする (サーボプレスなら速度切替が容易)。</li>
  <li>圧入ステーションを 2 か所にして並列化する (1 個おきに振り分け)。</li>
  <li>短い工程 (搬出 3.0 s) と長い工程の作業を組み替える。</li>
</ul>
<p>並列化は装置の台数・コストが増えます。必要な能力を満たした時点で止め、余力は将来の増産用に残すのが現実的です。装置の配置は「レイアウト設計の進め方」、品種切替は「段取り替え・治具交換の作業性」の章も参照してください。</p>
<div class="tb-note">よくある失敗: タクトとサイクルタイムを混同する / 稼働率を見込まず 100 % で計算する / シリンダの動作時間をカタログの最高速度で見積もる / センサ待ちや通信時間を入れない / インデックス旋回時間を忘れる / 作業者の手作業時間を含めずに約束する。</div>
`,
    points: [
      "タクト = 稼働可能時間 ÷ 必要数。サイクルタイムはタクト × 稼働率以下にする。",
      "タイムチャートで直列・並行の動作を整理し、待ち時間も含めて見積もる。",
      "インデックステーブルでは「最大工程時間 + 旋回時間」がサイクルになる。",
      "ボトルネック工程を縮める・並列化する。編成効率で工程分割のバランスを評価する。",
    ],
    exercises: [
      {
        q: "1 直 450 min 稼働、3 直で 1 日 9 000 個が必要。稼働率 80 % を見込むと目標サイクルタイムは何 s か。",
        a: "稼働可能時間 = 3 × 450 × 60 = 81 000 s。タクト = 81 000 / 9 000 = 9.0 s。目標サイクル = 9.0 × 0.80 = <b>7.2 s</b>。",
      },
      {
        q: "5 工程 (2.0, 3.5, 2.5, 3.0, 1.5 s) を 5 ステーションのインデックステーブルで行う。旋回 1.0 s のときサイクルタイムと編成効率を求めよ。また 3.5 s の工程を 2 ステーションに分けて 1.8 s と 1.7 s にし、6 ステーションにした場合のサイクルタイムを求めよ。",
        a: "5 ステーション: サイクル = 3.5 + 1.0 = <b>4.5 s</b>。編成効率 = (2.0+3.5+2.5+3.0+1.5) / (5 × 3.5) = 12.5 / 17.5 = <b>71.4 %</b>。6 ステーション: 最大は 3.0 s なのでサイクル = 3.0 + 1.0 = <b>4.0 s</b> (編成効率 12.5 / (6 × 3.0) = 69.4 %)。ステーションが増えるとテーブル径・コストも増える点に注意。",
      },
    ],
    quiz: [
      { q: "稼働可能時間 36 000 s、必要数 3 000 個のタクトタイムは?", choices: ["8 s", "12 s", "0.083 s"], answer: 1, explain: "36 000 ÷ 3 000 = 12 s/個です。" },
      { q: "4 工程を回転テーブルで同時に行うとき、サイクルタイムを決めるのは?", choices: ["4 工程の合計", "最も遅い工程 + 旋回時間", "最も速い工程"], answer: 1, explain: "全ステーションが終わるのを待ってから旋回するため、最大工程時間と旋回時間の和になります。" },
      { q: "目標サイクルタイムをタクトより短く設定する主な理由は?", choices: ["故障・段取り替えなどで装置が止まる時間を見込むため", "作業者を減らすため", "電力を減らすため"], answer: 0, explain: "稼働率 100 % はあり得ないので、停止時間分の余裕を持たせます。" },
    ],
  },
  {
    id: "equip-cost-schedule",
    part: "equipment",
    title: "装置開発のコストと日程 — 見積もり・DR・立上げ計画",
    minutes: 18,
    level: 3,
    lead: "装置の見積もりは部品代の合計ではありません。設計・ソフト・組立・立上げの工数、長納期品、設計審査 (DR) の節目、リスクに備えた予備費を組み込んで初めて、守れるコストと日程になります。",
    body: `
<h2>コストの内訳</h2>
<table class="tb-table">
  <tr><th>区分</th><th>内容</th><th>見積の根拠</th></tr>
  <tr><td>機械部品</td><td>加工品、カタログ部品、フレーム、カバー</td><td>部品表 × 単価 (加工品は類似品の実績)</td></tr>
  <tr><td>電気部品</td><td>制御盤、PLC、サーボ、センサ、ケーブル</td><td>I/O 点数・軸数から積算</td></tr>
  <tr><td>ソフト</td><td>PLC・HMI・ロボット・検査のプログラム</td><td>動作ステップ数 × 標準工数</td></tr>
  <tr><td>機械設計</td><td>構想・詳細設計、図面、DR 資料</td><td>部品点数・新規度 × 工数</td></tr>
  <tr><td>組立・配線</td><td>機械組立、配線、配管、調整</td><td>類似装置の実績時間</td></tr>
  <tr><td>立上げ</td><td>試運転、FAT、据付、SAT、教育</td><td>日数 × 人数 (出張費含む)</td></tr>
  <tr><td>予備費</td><td>想定外の作り直し・追加</td><td>新規要素の多さで 5〜20 %</td></tr>
</table>

<h2>設計例: 圧入セルの見積</h2>
<p>前章のインデックステーブル式圧入セルを見積もります (単位: 万円)。</p>
<table class="tb-table">
  <tr><th>区分</th><th>金額</th><th>備考</th></tr>
  <tr><td>機械部品</td><td>240</td><td>インデックス 1 式、圧入ユニット、治具 4 組、フレーム</td></tr>
  <tr><td>電気部品</td><td>150</td><td>サーボプレス制御、PLC、ライトカーテン、カメラ</td></tr>
  <tr><td>ソフト</td><td>120</td><td>15 人日 × 8 万円</td></tr>
  <tr><td>機械設計</td><td>160</td><td>20 人日 × 8 万円</td></tr>
  <tr><td>組立・配線</td><td>90</td><td>15 人日 × 6 万円</td></tr>
  <tr><td>立上げ</td><td>80</td><td>10 人日 × 8 万円</td></tr>
  <tr><td>小計</td><td>840</td><td></td></tr>
  <tr><td>予備費 10 %</td><td>84</td><td>新規要素はサーボプレスの波形判定のみ</td></tr>
  <tr><td><b>合計</b></td><td><b>924</b></td><td></td></tr>
</table>
${COST_BAR}
<p>省人化で年間 1 人分 (仮に 500 万円) の労務費が減るなら、単純回収期間は 924 ÷ 500 ≒ 1.8 年です。投資判断ではこの回収期間が問われることが多く、見積は判断材料そのものになります (単価・工数は説明用の仮の値)。</p>

<h2>日程と長納期品</h2>
<p>日程は「設計 → 手配 → 組立 → 立上げ」と単純に並べると間に合わないことがほとんどです。<b>長納期品</b> (サーボプレス、特殊モータ、大形の加工品、制御盤) は構想が固まった時点で<b>先行発注</b>します。</p>
${SCHEDULE}
<p>この例では、サーボプレスの納期 12 週が構想確定 (第 3 週) から入荷 (第 15 週) までを占め、組立・立上げの開始を決めています。これが<b>クリティカルパス</b>で、ここが 1 週遅れると出荷が 1 週遅れます。</p>

<h2>設計審査 (DR)</h2>
<table class="tb-table">
  <tr><th>DR</th><th>時期</th><th>確認すること</th></tr>
  <tr><td>DR0</td><td>受注・企画</td><td>仕様の合意、実現性、見積の前提</td></tr>
  <tr><td>DR1</td><td>構想設計完了</td><td>工程・サイクル・レイアウト、リスクアセスメント、長納期品の発注可否</td></tr>
  <tr><td>DR2</td><td>詳細設計完了 (出図前)</td><td>強度・精度計算、組立性・保守性、電気とのインタフェース</td></tr>
  <tr><td>DR3</td><td>出荷前</td><td>FAT 結果、残課題、取扱説明書、安全確認</td></tr>
</table>
<p>DR は「問題を見つけて直すための場」で、通過儀礼ではありません。チェックリスト (「設計チェックリスト」や安全の各章) を使い、製造・保全・電気の担当者も参加します。DR1 で見つかった問題は紙の上で直せますが、立上げで見つかれば部品の作り直しになります。</p>

<h2>リスクと予備</h2>
<ul>
  <li>新規要素 (初めて使う方式、未経験のワーク) を一覧にし、<b>早い時期に試作・試験</b>して確かめる。</li>
  <li>日程にも予備 (バッファ) を置く。各作業に少しずつ乗せるより、出荷前にまとめて置く方が使い切られにくい。</li>
  <li>立上げは「ワークが仕様どおりに来ない」「ばらつきが大きい」で延びやすい。量産ワークを早期に入手する。</li>
</ul>
<div class="tb-note">よくある失敗: 部品代だけで見積もり、工数を入れない / 長納期品を出図後に手配して数か月待つ / DR を形式的に済ませる / 予備費 0 % で受注する / 立上げ期間を「1 週間あれば」と根拠なく決める。</div>
`,
    points: [
      "見積は部品代に加え、設計・ソフト・組立・立上げの工数と予備費を積み上げる。",
      "長納期品は構想確定 (DR1) 直後に先行発注し、クリティカルパスを管理する。",
      "DR0〜DR3 で仕様・構想・詳細・出荷前を審査し、問題を早く見つける。",
      "新規要素は早期に試験し、予備費と日程バッファで不確かさに備える。",
    ],
    exercises: [
      {
        q: "機械部品 300、電気部品 180、ソフト 25 人日、機械設計 30 人日、組立 20 人日、立上げ 12 人日 (単価は組立 6 万円/人日、他は 8 万円/人日)、予備費 15 % のとき合計 (万円) を求めよ。",
        a: "工数: ソフト 25×8 = 200、設計 30×8 = 240、組立 20×6 = 120、立上げ 12×8 = 96。小計 = 300+180+200+240+120+96 = <b>1 136</b>。予備費 = 1 136 × 0.15 = 170.4。合計 = <b>1 306.4 万円</b>。",
      },
      {
        q: "構想設計 4 週、詳細設計 5 週、加工品手配 4 週、組立 3 週、立上げ 3 週の直列日程に、納期 14 週の特殊モータがある。モータを構想設計完了時に発注した場合と、詳細設計完了時に発注した場合で、組立開始は何週目になるか (組立にはモータと加工品の両方が必要とする)。",
        a: "加工品の入荷: 4+5+4 = 13 週目。① 構想完了 (4 週) に発注: モータ入荷 4+14 = 18 週目 → 組立開始は <b>18 週目</b>、出荷は 18+3+3 = 24 週目。② 詳細完了 (9 週) に発注: 入荷 23 週目 → 組立開始 <b>23 週目</b>、出荷 29 週目。先行発注で 5 週短縮できるが、それでも加工品より 5 週遅く、モータがクリティカルパス。標準品への変更や構想段階のさらに早い仮発注を検討する。",
      },
    ],
    quiz: [
      { q: "長納期品を発注すべき時期として適切なのは?", choices: ["構想が固まった DR1 直後", "全図面の出図後", "組立開始の直前"], answer: 0, explain: "構想確定後すぐに先行発注しないと、納期がクリティカルパスになります。" },
      { q: "DR2 で主に確認するのは?", choices: ["仕様の合意", "詳細設計の強度・精度・組立性と電気とのインタフェース", "出荷前の FAT 結果"], answer: 1, explain: "DR2 は出図前の詳細設計の審査です。" },
      { q: "見積で予備費を大きめにすべき状況は?", choices: ["過去に何度も作った装置の再製作", "初めての方式や未経験のワークを含む", "購入品が多い"], answer: 1, explain: "新規要素が多いほど作り直しのリスクが高く、予備費を増やします。" },
    ],
  },
  {
    id: "equip-purchased-parts",
    part: "equipment",
    title: "購入品の選定と標準部品の活用 — カタログ部品・型番・納期",
    minutes: 16,
    level: 2,
    lead: "装置の部品の多くはカタログから選ぶ購入品です。仕様から型番を決める手順、寸法を指定できるコンフィギュラブル部品、部品表での購入品と製作品の区別、納期・生産終了・代替品の管理を学びます。",
    body: `
<h2>何を買い、何を作るか</h2>
${CATALOG}
<p>リニアガイド、ボールねじ、エアシリンダ、電動アクチュエータ、軸受、カップリング、センサなどの機能部品は、専門メーカーが寿命や精度を保証したカタログ品を使うのが基本です。自分で作るのは、それらを取り付ける板・ブラケット・治具・フレームのような<b>その装置専用の部分</b>に絞ります (「治具と組立を助ける設計」「装置フレームの設計」の章)。</p>
<p>さらに、ピン・シャフト・ブラケット・スペーサのような単純部品も、寸法を指定して注文できる<b>コンフィギュラブル部品</b> (寸法指定型の標準部品) で買えることが多く、図面を描かずに型番だけで手配できます。設計時間と加工品手配の手間が減り、納期も短くなります。</p>

<h2>選定の手順</h2>
${SELECT_FLOW}
<ol>
  <li><b>要求を数値化</b>: 荷重、モーメント、ストローク、速度、加速度、精度、使用頻度、環境。</li>
  <li><b>形式を選ぶ</b>: 2 点間移動ならエアシリンダ、多点位置決めなら電動アクチュエータ、など。</li>
  <li><b>計算で型番</b>: カタログの選定式で寿命・推力・許容モーメントを確認し、安全率を見て型番を決める。</li>
  <li><b>供給を確認</b>: 標準納期、在庫、生産終了予定、代替品の有無。</li>
  <li><b>BOM に登録</b>: 型番をオプション記号まで含めて完全に書く。</li>
</ol>

<h2>部品表 (BOM) の書き方</h2>
<table class="tb-table">
  <tr><th>No.</th><th>品名</th><th>区分</th><th>型番 / 図番</th><th>数</th><th>納期</th><th>備考</th></tr>
  <tr><td>1</td><td>ベースプレート</td><td>製作品</td><td>PF-001</td><td>1</td><td>3 週</td><td>A5052, 白アルマイト</td></tr>
  <tr><td>2</td><td>リニアガイド</td><td>購入品</td><td>LG15-280-2B</td><td>2</td><td>2 週</td><td>代替 2 社可</td></tr>
  <tr><td>3</td><td>エアシリンダ</td><td>購入品</td><td>CY-20-50-M</td><td>1</td><td>1 週</td><td>オートスイッチ付</td></tr>
  <tr><td>4</td><td>位置決めピン</td><td>寸法指定品</td><td>PIN-D6-L20-P</td><td>2</td><td>1 週</td><td>図面不要</td></tr>
  <tr><td>5</td><td>サーボプレス</td><td>購入品</td><td>SP-3K-100</td><td>1</td><td><b>12 週</b></td><td>長納期・先行発注</td></tr>
</table>
<p>型番は説明用の架空のものです。<b>区分</b>を分けておくと、購買は購入品を発注し、加工品は図面とともに外注先へ回すという流れが明確になります。</p>

<h2>納期・生産終了・セカンドソース</h2>
<ul>
  <li><b>納期</b>: 標準品でも半導体不足などで延びることがある。見積時と発注時で必ず再確認する。</li>
  <li><b>生産終了 (ディスコン)</b>: 装置は 10 年以上使われる。新しい装置に生産終了予定の型番を使わない。保守部品は予備を確保する。</li>
  <li><b>セカンドソース</b>: 取付寸法が業界で共通化された部品 (リニアガイドの一部サイズ、エアシリンダの一部規格) は複数社から選べる。代替可能かを BOM に書いておく。</li>
  <li><b>社内標準化</b>: よく使う部品を社内標準リストにまとめると、在庫・保守部品・設計時間が減る。</li>
</ul>

<h2>設計例: 搬送軸の選定</h2>
<p>ワーク+治具 3 kg を水平に 200 mm 移動、3 か所で停止、繰返し位置決め ±0.02 mm、1 往復 2 s、年 250 日 × 16 h 運転。</p>
<ul>
  <li>多点停止があるため、エアシリンダではなく<b>電動アクチュエータ</b> (ボールねじ駆動) を選ぶ。</li>
  <li>可搬質量・ストローク・繰返し精度でカタログから候補を絞る。可搬質量は余裕を見て 6 kg 以上級とする。</li>
  <li>走行距離: 1 往復 0.4 m、1 時間 1 800 往復 → 720 m/h。年 250 × 16 = 4 000 h で 2 880 km/年。カタログの寿命走行距離 (例 5 000 km) なら約 1.7 年、10 年使うなら途中交換が前提になり、保守計画に入れるか上位機種を選ぶ。</li>
  <li>標準納期 2 週、取付寸法互換の他社品ありを確認して BOM に登録。</li>
</ul>
<div class="tb-note">よくある失敗: 型番のオプション記号 (スイッチ、ケーブル長) を書き漏らす / カタログの最大値ぎりぎりで選ぶ / 走行距離寿命を計算しない / 生産終了予定品を採用する / 単純なピンまで図面を描いて手配に時間をかける。</div>
`,
    points: [
      "機能部品はカタログ品を使い、自分で作るのは装置専用の部分に絞る。",
      "単純部品は寸法指定の標準部品で図面なしに手配できる。",
      "選定は要求の数値化 → 形式 → 計算で型番 → 供給確認 → BOM 登録の順。",
      "BOM で購入品・製作品を区分し、納期・生産終了・代替品を管理する。",
    ],
    exercises: [
      {
        q: "電動アクチュエータが 1 往復 0.3 m、サイクル 5 s で 1 日 20 h、年 300 日稼働する。カタログの寿命走行距離が 5 000 km のとき寿命は何年か。",
        a: "1 時間の往復数 = 3 600 / 5 = 720、走行 = 720 × 0.3 = 216 m/h。年間 = 216 × 20 × 300 = 1 296 000 m = 1 296 km。寿命 = 5 000 / 1 296 ≒ <b>3.9 年</b>。装置寿命が 10 年なら交換を保守計画に入れる。",
      },
      {
        q: "BOM に「エアシリンダ φ20」とだけ書かれていた。購買が発注できるようにするには何を追記すべきか。",
        a: "メーカー型番 (シリーズ・内径・ストローク・取付形式・クッション・オートスイッチの種類と数・リード線長などのオプション記号まで)、数量、区分 (購入品)、必要納期、代替可否。例: 「CY-20-50-M-S2-L3 (架空), 1 個, 購入品, 代替: 取付互換品可」。",
      },
    ],
    quiz: [
      { q: "コンフィギュラブル部品 (寸法指定型の標準部品) の主な利点は?", choices: ["図面を描かずに型番で手配でき、納期も短い", "必ず最安になる", "強度計算が不要になる"], answer: 0, explain: "寸法を型番で指定でき、設計と手配の手間が減ります。強度確認は必要です。" },
      { q: "セカンドソースを確保する目的は?", choices: ["納期遅れや生産終了時に代替品を使えるようにする", "部品点数を増やす", "精度を上げる"], answer: 0, explain: "供給のリスクを下げるためです。" },
      { q: "多点で停止する搬送軸に適した形式は?", choices: ["エアシリンダ", "電動アクチュエータ", "ばね"], answer: 1, explain: "エアシリンダは基本的に 2 点間の移動です。多点位置決めは電動アクチュエータを使います。" },
    ],
  },
];
