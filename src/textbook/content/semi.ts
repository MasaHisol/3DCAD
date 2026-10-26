import type { TextChapter } from "../types";

// Part 12 (equipment): semiconductor manufacturing equipment.
// Related: "special-environment" (特殊環境の装置: クリーン・真空・高温・低温) in equipment2.ts.

export const SEMI: TextChapter[] = [
  // ------------------------------------------------------------------ 1
  {
    id: "semi-equipment-overview",
    part: "equipment",
    title: "半導体製造装置の概要 — 前工程・後工程と装置の構成",
    minutes: 18,
    level: 2,
    lead: "半導体デバイスは、シリコンウェーハの上で「膜をつける・形を写す・削る・不純物を入れる・熱を加える・平らにする・洗う・測る」を数百回繰り返して作られます。この章では工程と装置の対応を整理し、多くの装置に共通する構成 (ロードポート・EFEM・搬送室・プロセスチャンバ) を学びます。クリーン・真空の一般論は「特殊環境の装置: クリーン・真空・高温・低温」の章を参照してください。",
    body: `
<h2>前工程と後工程</h2>
<p><b>前工程</b>はウェーハの上に素子と配線を作り込む工程、<b>後工程</b>は完成したウェーハをチップに切り分けて組み立て、検査する工程です。前工程は同じ種類の工程を何度も繰り返す「ループ」になっているのが特徴です。</p>
<table class="tb-table">
<tr><th>工程</th><th>目的</th><th>代表的な装置</th></tr>
<tr><td>成膜</td><td>絶縁膜・導電膜をつける</td><td>CVD (気相の化学反応で堆積)、PVD (スパッタで堆積)、熱酸化炉、めっき装置</td></tr>
<tr><td>リソグラフィ</td><td>回路パターンをレジストに写す</td><td>レジスト塗布・現像装置 (コータ/デベロッパ)、露光装置</td></tr>
<tr><td>エッチング</td><td>レジストの形に膜を削る</td><td>プラズマエッチング装置 (ドライ)、ウェットエッチング装置</td></tr>
<tr><td>イオン注入</td><td>不純物を打ち込み電気特性を作る</td><td>イオン注入装置</td></tr>
<tr><td>熱処理</td><td>注入した不純物の活性化・膜質改善</td><td>縦型拡散炉、ランプ加熱の枚葉式 (RTP)</td></tr>
<tr><td>CMP</td><td>表面を研磨して平らにする</td><td>化学機械研磨装置</td></tr>
<tr><td>洗浄</td><td>パーティクル・金属・有機物を除く</td><td>枚葉式・バッチ式洗浄装置</td></tr>
<tr><td>検査・計測</td><td>膜厚・寸法・欠陥を測る</td><td>膜厚計、寸法測定 SEM、欠陥検査装置</td></tr>
</table>
<p>後工程では、<b>ダイシング</b> (ブレードやレーザでチップに切断)、<b>ダイボンディング</b> (チップを基板・リードフレームに固定)、<b>ワイヤボンディング</b>またはバンプ接合 (電気的接続)、<b>モールド</b> (樹脂封止)、<b>テスト</b> (テスタとプローバ・ハンドラで電気検査) を行います。前工程装置ほど高真空や極端な清浄度は求められないことが多い一方、搬送物の形 (ウェーハ・フレーム・トレイ・ストリップ) が多様で、高速なピック&プレースが中心になります。</p>

<h2>クラスタツール — 前工程装置の典型構成</h2>
<p>真空中で処理する枚葉式装置の多くは、中央の真空搬送室の周りに複数のプロセスチャンバを並べた<b>クラスタツール</b>です。ウェーハは大気側から真空側へ、次の順で流れます。</p>
<ol>
<li><b>ロードポート</b>: ウェーハ 25 枚入りの密閉容器 (FOUP) を載せ、扉を開ける</li>
<li><b>EFEM</b> (装置前面モジュール): 天井のファンフィルタで清浄な下降気流を作った大気搬送部。大気ロボットがウェーハを取り出し、必要ならアライナで向きをそろえる</li>
<li><b>ロードロック</b>: 大気と真空を切り替える小部屋。小さいので短時間で排気できる</li>
<li><b>搬送室</b>: 真空ロボットが各チャンバへウェーハを配る</li>
<li><b>プロセスチャンバ</b>: 成膜・エッチングなどを行う。ゲートバルブで搬送室と仕切る</li>
</ol>
<svg class="tb-chart" viewBox="0 -30 520 360" role="img" aria-label="クラスタツールの上面図: ロードポート、EFEM、ロードロック、搬送室、プロセスチャンバ">
<text class="k-title" x="260" y="-12" text-anchor="middle">クラスタツール (上から見た図)</text>
<g class="k-shadow">
<rect class="k-alu" x="30" y="250" width="300" height="56" rx="5"/>
<rect class="k-alu" x="40" y="306" width="80" height="16" rx="3"/>
<rect class="k-alu" x="140" y="306" width="80" height="16" rx="3"/>
<rect class="k-alu" x="240" y="306" width="80" height="16" rx="3"/>
<rect class="k-plastic" x="52" y="308" width="56" height="12" rx="3"/>
<rect class="k-plastic" x="152" y="308" width="56" height="12" rx="3"/>
<rect class="k-part" x="120" y="196" width="50" height="50" rx="4"/>
<rect class="k-part" x="190" y="196" width="50" height="50" rx="4"/>
<polygon class="k-part" points="130,150 180,100 230,150 230,190 130,190" />
<circle class="k-part" cx="180" cy="148" r="1"/>
</g>
<polygon class="k-alu" points="180,74 240,98 264,150 240,200 120,200 96,150 120,98" style="stroke:var(--tb-line);stroke-width:1.2"/>
<g class="k-shadow">
<rect class="k-part" x="40" y="96" width="70" height="70" rx="10" transform="rotate(-20 75 131)"/>
<rect class="k-part" x="145" y="10" width="70" height="62" rx="10"/>
<rect class="k-part" x="250" y="96" width="70" height="70" rx="10" transform="rotate(20 285 131)"/>
</g>
<circle class="k-glass" cx="75" cy="131" r="22"/>
<circle class="k-glass" cx="180" cy="42" r="20"/>
<circle class="k-glass" cx="285" cy="131" r="22"/>
<rect class="k-yellow" x="104" y="110" width="8" height="30" rx="2" transform="rotate(-20 108 125)"/>
<rect class="k-yellow" x="176" y="70" width="8" height="8" rx="1" transform="rotate(90 180 74)"/>
<rect class="k-yellow" x="248" y="110" width="8" height="30" rx="2" transform="rotate(20 252 125)"/>
<circle class="k-part-h" cx="180" cy="148" r="16"/>
<path class="k-rubber" d="M180 148 L150 120 L140 108" style="fill:none;stroke-width:6;stroke-linecap:round"/>
<circle class="k-sphere" cx="138" cy="106" r="9"/>
<circle class="k-sphere" cx="145" cy="221" r="16"/>
<circle class="k-sphere" cx="215" cy="221" r="16"/>
<circle class="k-part-h" cx="180" cy="278" r="12"/>
<path class="k-rubber" d="M180 278 L210 262" style="fill:none;stroke-width:5;stroke-linecap:round"/>
<rect class="k-hazard" x="30" y="246" width="300" height="4"/>
<line class="k-thin" x1="330" y1="278" x2="370" y2="278"/><text class="lbl" x="374" y="282">EFEM (大気・下降気流)</text>
<line class="k-thin" x1="320" y1="314" x2="370" y2="314"/><text class="lbl" x="374" y="318">ロードポート + FOUP</text>
<line class="k-thin" x1="240" y1="221" x2="370" y2="236"/><text class="lbl" x="374" y="240">ロードロック ×2</text>
<line class="k-thin" x1="250" y1="170" x2="370" y2="190"/><text class="lbl" x="374" y="194">搬送室 (真空ロボット)</text>
<line class="k-thin" x1="310" y1="120" x2="370" y2="120"/><text class="lbl" x="374" y="124">プロセスチャンバ</text>
<line class="k-thin" x1="216" y1="72" x2="370" y2="80"/><text class="lbl" x="374" y="84">ゲートバルブ (黄)</text>
<circle class="k-badge" cx="20" cy="314" r="9"/><text class="k-badge-t" x="20" y="318" text-anchor="middle">1</text>
<circle class="k-badge" cx="20" cy="278" r="9"/><text class="k-badge-t" x="20" y="282" text-anchor="middle">2</text>
<circle class="k-badge" cx="104" cy="221" r="9"/><text class="k-badge-t" x="104" y="225" text-anchor="middle">3</text>
<circle class="k-badge" cx="88" cy="186" r="9"/><text class="k-badge-t" x="88" y="190" text-anchor="middle">4</text>
<circle class="k-badge" cx="30" cy="90" r="9"/><text class="k-badge-t" x="30" y="94" text-anchor="middle">5</text>
</svg>
<p class="tb-caption">図: 番号は本文のウェーハの流れ。大気側 (下) と真空側 (上) をロードロックがつなぐ</p>

<h3>なぜこの構成なのか</h3>
<ul>
<li><b>真空を保ったまま複数工程を連続処理</b>できる (下地を大気にさらさずに次の膜をつける)</li>
<li>プロセスチャンバを大気開放するのは保守のときだけ。毎回の搬入出はロードロックだけを大気↔真空に切り替える</li>
<li>チャンバを増やせば並列処理でスループットが上がる。逆に、1 台のチャンバ故障で装置全体を止めない運用 (そのチャンバだけ切り離す) も可能</li>
</ul>
<p>拡散炉のような<b>バッチ式</b> (100 枚前後を一度に処理) や、洗浄・塗布現像のような大気中の装置も、ロードポート・大気搬送ロボット・処理ユニットという骨格は共通です。</p>
<svg class="tb-chart" viewBox="0 0 520 230" role="img" aria-label="クリーンルームで装置の前に立つ作業者と、装置の背後の保守エリア">
<text class="k-title" x="260" y="20" text-anchor="middle">装置の配置 — クリーン側と保守側</text>
<rect class="k-ground" x="10" y="196" width="500" height="10"/><line class="k-edge" x1="10" y1="196" x2="510" y2="196"/>
<line class="k-hidden" x1="236" y1="40" x2="236" y2="196"/>
<g class="k-shadow">
<rect class="k-alu" x="150" y="70" width="86" height="126" rx="4"/>
<rect class="k-part" x="236" y="90" width="200" height="106" rx="4"/>
<rect class="k-plastic" x="118" y="132" width="32" height="30" rx="4"/>
<rect class="k-alu" x="112" y="162" width="40" height="34" rx="2"/>
</g>
<rect class="k-glass" x="160" y="44" width="66" height="26" rx="2"/>
<text class="tick" x="193" y="61" text-anchor="middle">FFU</text>
<rect class="k-screen" x="196" y="96" width="30" height="22" rx="2"/>
<rect class="k-glass" x="250" y="110" width="80" height="50" rx="3"/>
<rect class="k-glass" x="345" y="110" width="80" height="50" rx="3"/>
<circle class="k-person" cx="70" cy="92" r="11"/>
<path class="k-person" d="M54 196 L56 140 Q56 108 70 106 Q84 108 86 140 L88 196 Z"/>
<path class="k-skin" d="M84 128 Q104 136 116 144 L114 150 Q100 144 82 138 Z"/>
<path class="k-move" d="M193 74 L193 120" marker-end="url(#k-arrow)" style="fill:none"/>
<path class="k-move" d="M193 74 L193 120" style="fill:none"/>
<text class="lbl" x="14" y="218">クリーン側 (作業者・AMHS)</text>
<text class="lbl" x="380" y="218" text-anchor="middle">保守エリア (グレーゾーン)</text>
<text class="tick" x="340" y="82" text-anchor="middle">チャンバ・ポンプ・電源・ガス</text>
<text class="tick" x="236" y="36" text-anchor="middle">壁</text>
</svg>
<p class="tb-caption">図: 前面 (ロードポート) だけを清浄な側に出し、チャンバやポンプは保守用の裏側に置く配置が一般的</p>

<h3>計算例 — クラスタツールのスループット</h3>
<div class="tb-example">
<p>同じ処理をするチャンバ 4 台。1 枚あたりの処理時間 120 s、チャンバでの入替え (ゲート開閉・ウェーハ交換) 30 s。真空ロボットは 1 枚につき 2 回の移載 (ロードロック→チャンバ、チャンバ→ロードロック) を行い、1 回 15 s かかります。</p>
<p>チャンバ側の上限 = 4 台 × 3600 s ÷ (120 + 30) s = <b>96 枚/h</b><br>
ロボット側の上限 = 3600 s ÷ (2 × 15 s) = <b>120 枚/h</b><br>
小さい方が装置のスループットなので <b>96 枚/h</b> (チャンバ律速)。1 ロット 25 枚は約 25 ÷ 96 × 60 ≈ 15.6 分です。</p>
<p>処理時間を短くする改良が進むとロボット律速に変わります。どこが律速かを計算してから、チャンバ数やロボットのアーム数 (2 本アームで取って置くを同時に行う) を決めます。</p>
</div>

<h3>機構設計者のチェックリスト</h3>
<ul>
<li>ロードポート前面の高さ・FOUP 受け渡し面は規格に合わせ、装置側の寸法は最新の SEMI 規格で確認する</li><li>チャンバ上蓋の開閉スペース (目安: 上方に蓋の最大寸法 + 作業余裕) と吊り具の取付け点を確保する</li><li>大気側と真空側の部品で材料・潤滑の指定を分け、部品表に区分を書く</li>
</ul>

<h3>よくある失敗</h3>
<ul>
<li>処理時間だけでスループットを見積もり、ロードロックの排気・ベント時間やロボットの待ちを入れていない</li>
<li>チャンバの保守スペース (上蓋を開ける、部品を引き出す) をレイアウトで確保していない</li>
<li>大気側と真空側で同じ設計基準 (材料・潤滑) を使い、真空側でアウトガスや発じんを起こす</li>
<li>後工程装置に前工程並みの仕様を求めてコストが過大になる (逆も同様)</li>
</ul>`,
    points: [
      "前工程は成膜・リソグラフィ・エッチング・イオン注入・熱処理・CMP・洗浄・検査の繰返し",
      "後工程はダイシング・ボンディング・モールド・テスト",
      "枚葉真空装置の典型はロードポート → EFEM → ロードロック → 搬送室 → プロセスチャンバのクラスタツール",
      "スループットはチャンバ側とロボット側の上限の小さい方で決まる",
    ],
    exercises: [
      {
        q: "処理時間 90 s、入替え 30 s のチャンバが 3 台あります。真空ロボットは 1 枚あたり移載 2 回、1 回 12 s です。装置のスループットと律速箇所を求めてください。",
        a: "チャンバ側 = 3 × 3600 ÷ (90 + 30) = <b>90 枚/h</b><br>ロボット側 = 3600 ÷ (2 × 12) = <b>150 枚/h</b><br>小さい方の <b>90 枚/h</b>、チャンバ律速です。",
      },
      {
        q: "上の装置でチャンバを 6 台に増やしたときのスループットはいくらになりますか。",
        a: "チャンバ側 = 6 × 3600 ÷ 120 = 180 枚/h、ロボット側は 150 枚/h のまま。<b>150 枚/h</b> となりロボット律速に変わります。チャンバを増やした効果の一部しか得られません。",
      },
    ],
    quiz: [
      { q: "大気と真空を切り替えるための小部屋は?", choices: ["プロセスチャンバ", "ロードロック", "ロードポート"], answer: 1, explain: "ロードロックだけを排気・ベントすることで、プロセスチャンバを真空に保ったまま搬入出できます。" },
      { q: "後工程に含まれるのは?", choices: ["イオン注入", "CMP", "ワイヤボンディング"], answer: 2, explain: "イオン注入と CMP は前工程、ワイヤボンディングは後工程の組立です。" },
      { q: "EFEM の天井に付いていて清浄な下降気流を作るのは?", choices: ["ファンフィルタユニット (FFU)", "ターボ分子ポンプ", "ゲートバルブ"], answer: 0, explain: "FFU が HEPA/ULPA フィルタを通した空気を上から下へ流します。" },
    ],
  },

  // ------------------------------------------------------------------ 2
  {
    id: "wafer-handling",
    part: "equipment",
    title: "ウェーハ搬送の設計 — FOUP・ロードポート・EFEM・搬送ロボット",
    minutes: 20,
    level: 3,
    lead: "ウェーハは薄く、割れやすく、表面に触れてはいけない搬送物です。しかも 1 枚に多数のチップが載り、落とせば大きな損失になります。この章では 300 mm ウェーハと FOUP の基本、ロードポートと EFEM の役割、大気・真空ロボットとエンドエフェクタの選び方、そしてウェーハが滑らない加速度の決め方を学びます。",
    body: `
<h2>300 mm ウェーハと FOUP</h2>
<p>現在の量産の主流は直径 300 mm のシリコンウェーハです。厚さは約 0.775 mm、質量は約 128 g (シリコン密度 2.33 g/cm³ から π × 15² × 0.0775 × 2.33 ≈ 128 g)。結晶方位を示す小さな切欠き (<b>ノッチ</b>) が外周に 1 か所あり、装置内では<b>アライナ</b>でノッチを検出して向きをそろえます。表面 (デバイス面) には触れず、裏面と外周のわずかな幅だけに触れるのが原則です。</p>
<p>300 mm ウェーハは <b>FOUP</b> (前面開口の密閉ポッド) に 25 枚ずつ、棚 (スロット) に水平に入れて運びます。FOUP の寸法、扉、位置決めピン、天井搬送 (AMHS) がつかむフランジなどは SEMI 規格で定められており、どのメーカーの装置でも同じ FOUP が使えるようになっています。具体的な寸法は設計時に最新の規格文書で確認します。</p>

<h2>ロードポートと EFEM</h2>
<p>ロードポートは FOUP を位置決めピンで受け、前進させて EFEM の壁に密着させ、扉をはずして下へ逃がします。続いて<b>マッピング</b>センサが各スロットを走査し、ウェーハの有無・二重載せ・斜め挿入 (クロススロット) を検出します。異常があるスロットにロボットを入れないことが破損防止の第一歩です。</p>
<svg class="tb-chart" viewBox="0 0 520 280" role="img" aria-label="ロードポートとEFEMの断面: FOUP、扉オープナ、マッピングセンサ、大気ロボット、FFUの下降気流">
<text class="k-title" x="260" y="20" text-anchor="middle">ロードポートと EFEM (横から見た断面)</text>
<rect class="k-ground" x="10" y="246" width="500" height="10"/><line class="k-edge" x1="10" y1="246" x2="510" y2="246"/>
<g class="k-shadow">
<rect class="k-alu" x="30" y="160" width="130" height="86" rx="3"/>
<rect class="k-plastic" x="40" y="70" width="110" height="90" rx="10"/>
<rect class="k-alu" x="70" y="56" width="50" height="14" rx="3"/>
<rect class="k-alu" x="200" y="40" width="300" height="206" rx="4" style="opacity:0.35"/>
<rect class="k-part" x="196" y="40" width="8" height="206"/>
<rect class="k-part" x="206" y="168" width="12" height="70" rx="2"/>
<rect class="k-part" x="320" y="190" width="56" height="56" rx="4"/>
</g>
<rect class="k-glass" x="200" y="40" width="300" height="20" rx="2"/>
<text class="tick" x="350" y="54" text-anchor="middle">FFU (ファン + ULPA フィルタ)</text>
<g class="k-thin">
<line x1="56" y1="88" x2="150" y2="88"/><line x1="56" y1="100" x2="150" y2="100"/><line x1="56" y1="112" x2="150" y2="112"/>
<line x1="56" y1="124" x2="150" y2="124"/><line x1="56" y1="136" x2="150" y2="136"/><line x1="56" y1="148" x2="150" y2="148"/>
</g>
<rect class="k-accent" x="206" y="96" width="10" height="20" rx="2"/>
<path class="k-hidden" d="M216 100 L150 100" />
<rect class="k-part-h" x="340" y="150" width="16" height="40"/>
<path class="k-rubber" d="M348 152 L300 132 L250 124" style="fill:none;stroke-width:8;stroke-linecap:round"/>
<rect class="k-yellow" x="226" y="120" width="40" height="5" rx="2"/>
<g class="k-move" style="fill:none">
<path d="M420 66 L420 120" marker-end="url(#k-arrow)"/><path d="M470 66 L470 120" marker-end="url(#k-arrow)"/>
</g>
<path class="k-move" d="M212 168 L212 230" marker-end="url(#k-arrow)" style="fill:none"/>
<line class="k-thin" x1="95" y1="56" x2="95" y2="36"/><text class="lbl" x="95" y="32" text-anchor="middle">FOUP (25 枚)</text>
<text class="tick" x="95" y="206" text-anchor="middle">ロードポート</text>
<line class="k-thin" x1="216" y1="100" x2="226" y2="86"/><text class="tick" x="228" y="82">マッピングセンサ</text>
<text class="tick" x="224" y="214">扉は下へ</text>
<line class="k-thin" x1="356" y1="175" x2="420" y2="175"/><text class="lbl" x="424" y="179">大気ロボット</text>
<line class="k-thin" x1="246" y1="126" x2="240" y2="146"/><text class="tick" x="226" y="160">エンドエフェクタ</text>
<text class="tick" x="445" y="140" text-anchor="middle">下降気流</text>
</svg>
<p class="tb-caption">図: FFU の下降気流の中でロボットが動く。発じんしやすい駆動部はアームの下方・床側に置き、粒子を下へ流す</p>

<h2>搬送ロボットとエンドエフェクタ</h2>
<p><b>大気ロボット</b>は EFEM 内で FOUP・アライナ・ロードロック間を、<b>真空ロボット</b>は搬送室内でロードロックとチャンバ間を運びます。どちらも水平多関節 (旋回・伸縮・昇降) が一般的です。真空ロボットはモータを大気側に置き、磁気結合や磁性流体シール越しに動力を伝えて、真空中の発じん・アウトガスを抑えます。</p>
<table class="tb-table">
<tr><th>保持方式</th><th>しくみ</th><th>長所</th><th>注意点</th></tr>
<tr><td>摩擦載置</td><td>裏面を小さなパッドに載せるだけ</td><td>単純・真空でも使える</td><td>加速度は摩擦で決まる (下の計算)</td></tr>
<tr><td>真空吸着</td><td>裏面を負圧で吸う</td><td>高加速度が可能</td><td>大気中のみ。裏面に吸着痕・汚れ</td></tr>
<tr><td>エッジグリップ</td><td>外周の端を爪でつかむ</td><td>裏面に触れない・高速</td><td>機構が複雑。端部の欠けに注意</td></tr>
<tr><td>ベルヌーイ</td><td>気流の負圧で非接触に近く保持</td><td>薄いウェーハ・反りに強い</td><td>大気中のみ。ガス消費、横方向の拘束が別途必要</td></tr>
</table>
<svg class="tb-chart" viewBox="0 0 520 220" role="img" aria-label="摩擦載置したウェーハに働く慣性力と摩擦力">
<text class="k-title" x="260" y="20" text-anchor="middle">摩擦で保持したウェーハが滑らない条件</text>
<g class="k-shadow">
<path class="k-part" d="M40 150 L330 150 Q350 150 350 140 L350 132 L40 132 Z"/>
<rect class="k-part-h" x="20" y="120" width="30" height="50" rx="4"/>
</g>
<rect class="k-rubber" x="120" y="122" width="22" height="10" rx="2"/>
<rect class="k-rubber" x="300" y="122" width="22" height="10" rx="2"/>
<rect class="k-accent" x="90" y="114" width="260" height="8" rx="3"/>
<path class="k-move" d="M120 70 L250 70" marker-end="url(#k-arrow)" style="fill:none"/>
<text class="lbl" x="185" y="62" text-anchor="middle">アームの加速度 a</text>
<path class="k-force" d="M240 100 L160 100" marker-end="url(#k-arrow-r)" style="fill:none"/>
<text class="k-bad-t" x="200" y="94" text-anchor="middle">慣性力 m·a</text>
<path class="k-force" d="M300 140 L360 140" marker-end="url(#k-arrow-r)" style="fill:none;opacity:0.7"/>
<text class="tick" x="380" y="144">摩擦力 ≤ μ·m·g</text>
<text class="tick" x="220" y="168" text-anchor="middle">パッド (μ は材料と表面で決まる)</text>
<text class="mark-t" x="260" y="200" text-anchor="middle">m·a ≤ μ·m·g → a ≤ μ·g (質量によらない)</text>
</svg>
<p class="tb-caption">図: 慣性力が最大静止摩擦力を超えるとウェーハは滑る。滑りは位置ずれ・発じん・落下の原因</p>

<h3>計算例 — 許容加速度</h3>
<div class="tb-example">
<p>摩擦載置のエンドエフェクタで、パッドとウェーハ裏面の静止摩擦係数を μ = 0.2 と見積もりました。水平加速度の上限は</p>
<p>a ≤ μ·g = 0.2 × 9.81 = <b>1.96 m/s²</b></p>
<p>μ はパッドの摩耗・汚れ・ウェーハ裏面の膜で変わるので、安全率 2 を取って <b>約 1.0 m/s² (約 0.1 G)</b> を加速度の上限にします。旋回動作では遠心加速度 v²/r も加わるため、並進加速度と合成した値で確認します。急減速を避けるため、加速度が滑らかに変わる S 字加減速の速度曲線を使います。</p>
</div>

<h2>破損・発じんを防ぐ設計</h2>
<ul>
<li>ロボットのティーチングは FOUP スロット・アライナ・ロードロックの各受け渡し位置で行い、ウェーハの有無センサで受け渡しを毎回確認する</li>
<li>ウェーハの<b>はみ出し・ずれ検出</b> (アーム通過時の外周センサ) でずれを補正し、ずれが大きければ停止する</li>
<li>停電・非常停止で吸着が切れても落ちない保持 (ガイドの段差、エッジグリップのばね閉じ) にする</li>
<li>FOUP のスロット間隔は狭いため、エンドエフェクタの厚さとたわみ、昇降の余裕を図面で確認する</li>
</ul>

<h3>機構設計者のチェックリスト</h3>
<ul>
<li>エンドエフェクタの厚さ・たわみと FOUP スロット間隔 (300 mm 用で目安 10 mm) の隙間を図面で確認する</li><li>ウェーハ接触パッドは PEEK・セラミックスなど低発じん材。接触幅は外周の数 mm 以内 (目安)</li><li>停電時も落ちない保持構造 (ガイド段差・ばね閉じ) にする</li><li>駆動部・ケーブルはウェーハ搬送面より下に配置する</li>
</ul>

<h3>よくある失敗</h3>
<ul>
<li>摩擦係数を新品パッドで測り、摩耗・汚れ後に滑りが出る</li>
<li>旋回中の遠心加速度を忘れ、直線では滑らないのに旋回で位置ずれする</li>
<li>マッピングの異常を無視して搬送し、二重載せのウェーハを割る</li>
<li>真空中で大気用の摩擦パッド材 (アウトガスの多いゴム) を使う</li>
</ul>`,
    points: [
      "300 mm ウェーハは厚さ約 0.775 mm・約 128 g、ノッチで向きを合わせる",
      "FOUP・ロードポートの寸法やインタフェースは SEMI 規格で標準化されている",
      "マッピングで欠落・二重・斜め挿入を検出してから搬送する",
      "摩擦保持の加速度上限は a ≤ μg。安全率と旋回の遠心加速度を考える",
    ],
    exercises: [
      {
        q: "摩擦係数 μ = 0.3 のパッドで、安全率 2 として許容加速度を求めてください。また、アームの先端が半径 0.4 m で 0.5 m/s で旋回するときの遠心加速度と比べてください。",
        a: "a ≤ 0.3 × 9.81 ÷ 2 = <b>1.47 m/s²</b><br>遠心加速度 = v²/r = 0.5² ÷ 0.4 = <b>0.625 m/s²</b>。これだけなら許容内ですが、旋回の加減速による接線加速度と合成した値 (ベクトル和) が 1.47 m/s² 以下になるよう速度曲線を決めます。",
      },
      {
        q: "直径 300 mm、厚さ 0.775 mm のシリコンウェーハ (密度 2.33 g/cm³) の質量を求め、25 枚入り FOUP の中身だけの質量を求めてください。",
        a: "体積 = π × 15² × 0.0775 ≈ 54.8 cm³、質量 ≈ 54.8 × 2.33 ≈ <b>128 g</b><br>25 枚で約 <b>3.2 kg</b> (容器を含めた FOUP 全体はさらに重い)。",
      },
    ],
    quiz: [
      { q: "ウェーハが摩擦だけで保持されているとき、滑らない加速度の上限は?", choices: ["μ·g", "μ·m·g", "g / μ"], answer: 0, explain: "m·a ≤ μ·m·g から a ≤ μ·g。質量に依存しません。" },
      { q: "真空中で使えない保持方式は?", choices: ["摩擦載置", "真空吸着", "エッジグリップ"], answer: 1, explain: "周囲が真空では吸着の圧力差が作れません。ベルヌーイも同様に使えません。" },
      { q: "マッピングの目的は?", choices: ["ウェーハの膜厚を測る", "各スロットのウェーハ有無・二重・斜め挿入を検出する", "ノッチの向きをそろえる"], answer: 1, explain: "ノッチ合わせはアライナの役割です。" },
    ],
  },

  // ------------------------------------------------------------------ 3
  {
    id: "contamination-control",
    part: "equipment",
    title: "汚染管理と材料選定 — パーティクル・金属汚染・アウトガス",
    minutes: 20,
    level: 3,
    lead: "微細なデバイスでは、ウェーハに落ちた 1 個のパーティクルや、ごく微量の金属原子が不良の原因になります。装置設計者は「ごみを出さない・ためない・ウェーハに届かせない」構造と、汚染源にならない材料を選ぶ責任があります。クリーンルームの一般論は「特殊環境の装置: クリーン・真空・高温・低温」の章を参照し、ここでは装置内部の設計に踏み込みます。",
    body: `
<h2>汚染の 3 種類</h2>
<table class="tb-table">
<tr><th>種類</th><th>主な発生源</th><th>影響</th></tr>
<tr><td>パーティクル</td><td>摺動部・ベアリング・ケーブルの屈曲・ねじの締付け・ウェーハと治具の接触・堆積膜のはがれ</td><td>パターン欠陥・短絡・断線</td></tr>
<tr><td>金属汚染</td><td>部品材料 (Fe・Ni・Cr・Cu など) のこすれや腐食、Na・K などのアルカリ金属</td><td>電気特性の劣化 (リーク・しきい値変動)</td></tr>
<tr><td>分子汚染・アウトガス</td><td>樹脂・接着剤・潤滑剤・ケーブル被覆から出る有機物や水分</td><td>膜の密着不良・真空度の悪化・光学系のくもり</td></tr>
</table>
<p>特に<b>銅</b>やアルカリ金属 (<b>ナトリウム</b>など) はシリコンや酸化膜中で動きやすく、ごく微量でも特性を損なうため、ウェーハの近くでは黄銅・銅合金のむき出し部品や、汗・塩分が付く素手での取扱いを避けます。</p>

<h2>気流で「届かせない」</h2>
<p>EFEM や大気搬送部では FFU から一様な<b>下降気流</b> (一般に 0.3〜0.5 m/s 程度) を流し、発生したパーティクルを床方向へ押し流します。設計の原則は次の 3 つです。</p>
<ul>
<li><b>ウェーハより下に発じん源を置く</b>: 駆動部・ケーブルベアはウェーハ搬送面より下</li>
<li><b>気流をさえぎらない</b>: 搬送面より上の大きな水平板は渦を作る。パンチングプレートや開口を使う</li>
<li><b>発じん部は囲って排気する</b>: リニアガイドやボールねじをカバーで覆い、内部を負圧にして吸い出す</li>
</ul>
<svg class="tb-chart" viewBox="0 0 520 260" role="img" aria-label="良い例と悪い例: 駆動部の配置と下降気流">
<text class="k-title" x="260" y="20" text-anchor="middle">発じん源の配置と下降気流</text>
<rect class="k-panel" x="12" y="32" width="240" height="214" rx="8"/>
<rect class="k-panel" x="268" y="32" width="240" height="214" rx="8"/>
<text class="k-bad-t" x="132" y="52" text-anchor="middle">悪い例: 駆動部がウェーハの上</text>
<text class="k-good-t" x="388" y="52" text-anchor="middle">良い例: 駆動部は下・囲って排気</text>
<rect class="k-glass" x="30" y="60" width="204" height="12" rx="2"/>
<rect class="k-glass" x="286" y="60" width="204" height="12" rx="2"/>
<g class="k-move" style="fill:none">
<path d="M50 76 L50 104" marker-end="url(#k-arrow)"/><path d="M214 76 L214 104" marker-end="url(#k-arrow)"/>
<path d="M306 76 L306 130" marker-end="url(#k-arrow)"/><path d="M388 76 L388 130" marker-end="url(#k-arrow)"/><path d="M470 76 L470 130" marker-end="url(#k-arrow)"/>
</g>
<g class="k-shadow">
<rect class="k-part" x="70" y="96" width="124" height="18" rx="3"/>
<rect class="k-alu" x="120" y="114" width="24" height="40"/>
<rect class="k-part" x="330" y="190" width="116" height="30" rx="3"/>
<rect class="k-alu" x="380" y="160" width="16" height="30"/>
</g>
<rect class="k-accent" x="70" y="160" width="124" height="6" rx="2"/>
<rect class="k-accent" x="326" y="150" width="124" height="6" rx="2"/>
<g style="fill:var(--tb-bad)">
<circle cx="90" cy="124" r="2"/><circle cx="104" cy="134" r="2"/><circle cx="160" cy="128" r="2"/><circle cx="176" cy="142" r="2"/><circle cx="96" cy="150" r="2"/>
</g>
<path class="k-hidden" d="M60 120 Q40 140 60 160" style="fill:none"/>
<path class="k-hidden" d="M204 120 Q224 140 204 160" style="fill:none"/>
<g style="fill:var(--tb-bad)"><circle cx="350" cy="205" r="2"/><circle cx="420" cy="210" r="2"/></g>
<path class="k-move" d="M446 214 L482 236" marker-end="url(#k-arrow)" style="fill:none"/>
<text class="tick" x="132" y="196" text-anchor="middle">粒子が落ちてウェーハに付く</text>
<text class="tick" x="132" y="212" text-anchor="middle">板の下に渦ができる</text>
<text class="tick" x="454" y="146">ウェーハ</text>
<text class="tick" x="388" y="238" text-anchor="middle">カバー内を局所排気</text>
<text class="tick" x="66" y="178" text-anchor="end">ウェーハ</text>
</svg>
<p class="tb-caption">図: 粒子は気流に乗って下へ流れる。発じん源をウェーハの上や風上に置かないことが最も効く対策</p>

<h2>清浄度クラスの考え方</h2>
<p>ISO 14644-1 では空気 1 m³ 中の粒子数で清浄度をクラス分けします。クラス N の上限濃度は粒径 D (μm) 以上の粒子について</p>
<p style="text-align:center"><b>C<sub>n</sub> = 10<sup>N</sup> × (0.1 / D)<sup>2.08</sup></b> 個/m³</p>
<p>で与えられ、たとえばクラス 5 の 0.5 μm 以上は約 3,520 個/m³ です。装置内部 (EFEM、ミニエンバイロメント) は周囲のクリーンルームより高い清浄度にし、FOUP の中はさらに清浄に保つ、という「局所清浄化」が現在の主流です。適用する版と測定方法は規格本文で確認します。</p>

<h2>材料と潤滑</h2>
<table class="tb-table">
<tr><th>材料</th><th>使いどころ</th><th>注意</th></tr>
<tr><td>ステンレス (SUS316L など) 電解研磨</td><td>真空チャンバ、ガス配管、接ガス部品</td><td>表面が平滑で吸着ガス・粒子が少ない</td></tr>
<tr><td>アルミ合金 + アルマイト</td><td>チャンバ、フレーム、ステージ</td><td>処理によっては腐食性ガスで劣化</td></tr>
<tr><td>PEEK</td><td>ウェーハ接触部、絶縁部品</td><td>機械的強度と低発じんのバランスがよい</td></tr>
<tr><td>PTFE・PFA</td><td>薬液配管・槽、パッキン</td><td>耐薬品性が高いがクリープしやすい</td></tr>
<tr><td>アルミナ・石英などセラミックス</td><td>高温部、プラズマにさらされる部品、エンドエフェクタ</td><td>もろい。角の欠けが粒子源になる</td></tr>
</table>
<p>潤滑剤は、真空中では蒸気圧の低いフッ素系グリースや固体潤滑 (被膜) を使い、大気クリーン環境でも低発じん品を選びます。一般の鉱油系グリースは飛散・蒸発で汚染源になります。接着剤・ケーブル被覆・ラベルも低アウトガス品を指定します。</p>

<h3>計算例 — 発じんと希釈</h3>
<div class="tb-example">
<p>EFEM 内の床面積 1 m²、下降気流 0.3 m/s。駆動部から 0.1 μm 以上の粒子が毎分 10,000 個漏れ出し、気流に一様に混ざると仮定します。</p>
<p>風量 Q = 1 m² × 0.3 m/s = 0.3 m³/s<br>
発生量 G = 10,000 ÷ 60 ≈ 167 個/s<br>
平均濃度 ≈ G ÷ Q = 167 ÷ 0.3 ≈ <b>556 個/m³</b></p>
<p>ISO クラス 4 の 0.1 μm 以上の上限は 10,000 個/m³ なので平均では余裕があるように見えます。しかし実際には発生源の真下に濃く流れるため、<b>ウェーハが発生源の風下を通らない配置</b>が平均濃度の計算より重要です。</p>
</div>

<h2>部品の洗浄と梱包</h2>
<ul>
<li>加工後の部品は脱脂・超純水リンス・乾燥を行い、クリーンルーム内で二重袋に入れて真空シール包装する</li>
<li>図面に「洗浄指定」「接ガス面の表面粗さ」「刻印・マーキング禁止の面」を明記する</li>
<li>組立はクリーンブースで手袋を着用。素手で触った部品は洗い直す</li>
<li>ねじ穴は抜き穴または逃げを設け、加工屑や洗浄液が残らない形にする</li>
</ul>

<h3>機構設計者のチェックリスト</h3>
<ul>
<li>ウェーハより上に摺動部・ケーブルベアがないか</li><li>ウェーハ近傍に銅合金・めっき・素手接触部品がないか</li><li>潤滑剤・接着剤・ケーブル被覆の品名 (低アウトガス・低発じん) を図面に指定したか</li><li>洗浄指定・梱包方法・刻印禁止面を図面に書いたか</li>
</ul>

<h3>よくある失敗</h3>
<ul>
<li>ケーブルベアをウェーハ搬送面より上に配置し、屈曲で出た粉が落ちる</li>
<li>ウェーハ近くに黄銅の継手やめっき部品を使い、金属汚染を出す</li>
<li>大気用グリースをそのまま真空中の機構に使う</li>
<li>タップ穴の底に切削油が残り、真空引き後もアウトガスが続く</li>
</ul>`,
    points: [
      "汚染はパーティクル・金属汚染・分子汚染 (アウトガス) の 3 種類",
      "発じん源はウェーハより下・風下に置き、囲って局所排気する",
      "Cu・Na などはウェーハ近くで避ける。接ガス部は電解研磨ステンレス、接触部は PEEK・セラミックスなど",
      "真空・クリーン用の潤滑剤と低アウトガス材料を図面で指定する",
    ],
    exercises: [
      {
        q: "ISO 14644-1 の式 C = 10^N × (0.1/D)^2.08 を使い、クラス 5 の 0.3 μm 以上の上限濃度を求めてください。",
        a: "C = 10⁵ × (0.1/0.3)^2.08 = 10⁵ × 0.1018 ≈ <b>10,200 個/m³</b> (規格の表では 10,200)。",
      },
      {
        q: "下降気流 0.4 m/s、床面積 2 m² のミニエンバイロメントで、毎分 30,000 個の粒子が発生します。一様に混ざると仮定した平均濃度を求めてください。",
        a: "Q = 2 × 0.4 = 0.8 m³/s、G = 30,000 ÷ 60 = 500 個/s<br>平均濃度 = 500 ÷ 0.8 = <b>625 個/m³</b>。ただし発生源の直下はこれより濃いので、配置で風下を避けることが重要です。",
      },
    ],
    quiz: [
      { q: "ウェーハ近くで特に避けるべき元素の組合せは?", choices: ["Cu と Na", "Si と O", "N と Ar"], answer: 0, explain: "銅やアルカリ金属は微量でもデバイス特性を損ないます。" },
      { q: "下降気流の中で駆動部を置く位置として適切なのは?", choices: ["ウェーハより上", "ウェーハより下で、カバー内を排気", "ウェーハと同じ高さの風上"], answer: 1, explain: "粒子は気流で下へ運ばれるので、発生源は下に置き、囲って排気します。" },
      { q: "真空中の機構の潤滑に適するのは?", choices: ["一般の鉱油系グリース", "蒸気圧の低いフッ素系グリースや固体潤滑", "潤滑なしで金属同士を摺動"], answer: 1, explain: "鉱油系は蒸発・飛散して汚染源になります。金属同士の無潤滑摺動はかじりと発じんを起こします。" },
    ],
  },

  // ------------------------------------------------------------------ 4
  {
    id: "vacuum-chamber-design",
    part: "equipment",
    title: "真空チャンバと排気系の設計 — コンダクタンス・排気時間・リーク",
    minutes: 22,
    level: 3,
    lead: "真空チャンバの性能は、ポンプのカタログ値ではなく「配管を通した実効排気速度」「材料から出るガス」「漏れ」で決まります。この章ではポンプの使い分け、分子流のコンダクタンスと実効排気速度、排気時間の見積もり、リーク試験、そして大気圧に耐える壁の確認方法を学びます。",
    body: `
<h2>ポンプと圧力領域</h2>
<table class="tb-table">
<tr><th>ポンプ</th><th>動作圧力の目安</th><th>役割</th></tr>
<tr><td>ドライポンプ (スクリュー・ルーツ多段など)</td><td>大気圧 〜 約 1 Pa</td><td>粗引き、ターボ分子ポンプの背圧側。油を使わず清浄</td></tr>
<tr><td>メカニカルブースタ (ルーツ)</td><td>約 1000 Pa 〜 0.1 Pa</td><td>粗引きポンプと組み合わせて排気速度を上げる</td></tr>
<tr><td>ターボ分子ポンプ</td><td>約 1 Pa 〜 10⁻⁷ Pa</td><td>高真空。背圧側に粗引きポンプが必要</td></tr>
<tr><td>クライオポンプ</td><td>約 1 Pa 以下 〜 超高真空</td><td>極低温面にガスを凝縮・吸着。定期的な再生が必要</td></tr>
</table>
<p>大気圧付近では気体分子同士が衝突しながら流れる<b>粘性流</b>、高真空では分子が壁にしか衝突しない<b>分子流</b>になります。分子流では配管の抵抗が非常に大きくなり、細く長い配管はポンプの能力を台無しにします。</p>

<h2>コンダクタンスと実効排気速度</h2>
<p>配管がガスを通す能力を<b>コンダクタンス C</b> (L/s) と呼びます。20 °C の空気、分子流で、長さ L が直径 d より十分長い円管では</p>
<p style="text-align:center"><b>C ≈ 12.1 × d³ / L</b> [L/s] (d, L は cm)</p>
<p>直径の 3 乗に比例するので、<b>配管を太く短く</b>するのが最も効きます。ポンプの排気速度 S と配管 C を直列につないだときのチャンバでの<b>実効排気速度</b>は、電気の直列抵抗と同じ形で</p>
<p style="text-align:center"><b>1 / S<sub>eff</sub> = 1 / S + 1 / C</b></p>
<svg class="tb-chart" viewBox="0 0 520 260" role="img" aria-label="真空チャンバ、ゲートバルブ、ターボ分子ポンプ、粗引きポンプの排気系">
<text class="k-title" x="260" y="20" text-anchor="middle">チャンバと排気系 (断面)</text>
<rect class="k-ground" x="10" y="232" width="500" height="10"/><line class="k-edge" x1="10" y1="232" x2="510" y2="232"/>
<g class="k-shadow">
<path class="k-part" d="M40 50 L240 50 L240 160 L40 160 Z M52 62 L52 148 L228 148 L228 62 Z" fill-rule="evenodd"/>
<rect class="k-part" x="34" y="40" width="212" height="12" rx="2"/>
<rect class="k-part-h" x="110" y="160" width="60" height="20"/>
<rect class="k-yellow" x="100" y="180" width="80" height="14" rx="2"/>
<rect class="k-alu" x="112" y="194" width="56" height="38" rx="4"/>
<rect class="k-part" x="380" y="190" width="100" height="42" rx="6"/>
</g>
<rect class="k-accent" x="80" y="120" width="120" height="6" rx="2"/>
<rect class="k-copper" x="76" y="126" width="128" height="10" rx="2"/>
<path class="k-part-h" d="M168 214 L300 214 Q320 214 320 196 L320 180 L430 180 L430 190" style="fill:none;stroke:var(--k-steel-d, #778);stroke-width:8"/>
<rect class="k-glass" x="246" y="90" width="10" height="30" rx="2"/>
<rect class="k-rubber" x="34" y="49" width="212" height="3"/>
<circle class="k-sphere" cx="290" cy="80" r="10"/>
<line class="k-thin" x1="246" y1="80" x2="280" y2="80"/>
<g style="fill:var(--tb-bad)"><circle cx="70" cy="80" r="2"/><circle cx="210" cy="100" r="2"/><circle cx="140" cy="70" r="2"/></g>
<path class="k-move" d="M140 140 L140 176" marker-end="url(#k-arrow)" style="fill:none"/>
<text class="tick" x="140" y="110" text-anchor="middle">ウェーハ・ステージ</text>
<line class="k-thin" x1="246" y1="46" x2="300" y2="46"/><text class="lbl" x="304" y="50">蓋 + O リング</text>
<text class="lbl" x="304" y="84">真空計</text>
<line class="k-thin" x1="180" y1="187" x2="300" y2="140"/><text class="lbl" x="304" y="140">ゲートバルブ</text>
<line class="k-thin" x1="168" y1="214" x2="196" y2="250"/><text class="lbl" x="200" y="254">ターボ分子ポンプ</text>
<text class="lbl" x="430" y="216" text-anchor="middle">粗引きポンプ</text>
<text class="tick" x="370" y="174" text-anchor="middle">背圧配管</text>
<text class="tick" x="304" y="112">アウトガス (赤点: 壁・部品)</text>
</svg>
<p class="tb-caption">図: 高真空ポンプはチャンバの真下に大口径で直結し、配管のコンダクタンス損失を最小にする</p>

<h3>計算例 1 — 配管で排気速度はどれだけ落ちるか</h3>
<div class="tb-example">
<p>排気速度 S = 100 L/s のポンプを、内径 4 cm・長さ 50 cm の配管でつなぎます (分子流)。</p>
<p>C = 12.1 × 4³ ÷ 50 = 12.1 × 64 ÷ 50 ≈ <b>15.5 L/s</b><br>
1/S<sub>eff</sub> = 1/100 + 1/15.5 → S<sub>eff</sub> ≈ <b>13.4 L/s</b></p>
<p>ポンプの 13% しか使えていません。内径 10 cm にすると C = 12.1 × 1000 ÷ 50 = 242 L/s、S<sub>eff</sub> ≈ <b>70.8 L/s</b> に改善します。ポンプを大きくするより配管を太く短くする方が効果的です。</p>
</div>

<h2>排気時間とガス負荷</h2>
<p>粘性流の領域で、ガス放出を無視し排気速度 S が一定とみなせるとき、体積 V のチャンバを p<sub>0</sub> から p まで下げる時間は</p>
<p style="text-align:center"><b>t = (V / S) × ln(p<sub>0</sub> / p)</b></p>
<p>例: V = 100 L、S = 10 L/s、大気 (1×10⁵ Pa) から 10 Pa まで: t = 10 × ln(10⁴) ≈ <b>92 s</b>。実際には低圧ほどポンプの排気速度が下がるため、この値は目安です。</p>
<p>高真空域では、到達圧力は<b>ガス負荷 Q</b> (Pa·m³/s) と実効排気速度の比 p ≈ Q / S<sub>eff</sub> で決まります。ガス負荷は表面からの放出ガス (水分が主) + リーク + 透過の合計です。表面積を小さくし、ベーキング (加熱脱ガス) ができる材料と構造にすると到達圧力が下がります。</p>

<h2>リークと試験</h2>
<p>リーク量は<b>Pa·m³/s</b> (圧力 × 体積 ÷ 時間) で表します。チャンバを封じきって圧力上昇を測る<b>ビルドアップ試験</b>では、Q = V × Δp / Δt です。漏れ箇所を特定するには<b>ヘリウムリークディテクタ</b>を使い、外側からヘリウムを吹き付けて、チャンバ内に入ったヘリウムを質量分析で検出します。</p>
<p>フランジは用途で使い分けます。<b>KF</b> (クランプ式・O リング) は粗引き・中真空の配管、<b>ISO</b> (大口径・O リング) はポンプ接続、<b>CF</b> (ナイフエッジで銅ガスケットを押しつぶす金属シール) はベーキングする超高真空に使います。寸法は各規格で標準化されています。</p>

<h3>計算例 2 — 大気圧に耐える蓋のたわみ</h3>
<div class="tb-example">
<p>半径 a = 200 mm、厚さ t = 10 mm のステンレス (E = 193 GPa、ν = 0.3) の円板の蓋を周辺固定と見なし、大気圧 p = 0.101 MPa を受けるとします。</p>
<p>曲げ剛性 D = E·t³ / [12(1 − ν²)] ≈ 1.77×10⁴ N·m<br>
中央たわみ w = p·a⁴ / (64D) ≈ <b>0.14 mm</b><br>
周辺の最大曲げ応力 σ = 3p·a² / (4t²) ≈ <b>30 MPa</b></p>
<p>強度には余裕がありますが、0.14 mm のたわみは O リングの押しつぶし量や、蓋に付けた電極とウェーハの距離に影響します。実際の蓋はボルト固定で「周辺固定」と「単純支持」の間になり、単純支持ではたわみが約 4 倍になるので、精度が要る部品は蓋から切り離して支持します。</p>
</div>

<h3>機構設計者のチェックリスト</h3>
<ul>
<li>高真空ポンプはチャンバ直下に大口径で直結したか (配管コンダクタンスを計算)</li><li>止まり穴のねじに通気溝・通気穴を設けたか</li><li>大気圧による蓋・窓のたわみと応力を計算したか</li><li>リーク試験の方法と判定値 (Pa·m³/s) を仕様に書いたか</li>
</ul>

<h3>よくある失敗</h3>
<ul>
<li>大きなポンプを細長い配管でつなぎ、到達圧力が出ない</li>
<li>止まり穴にねじを入れて空気だまり (仮想リーク) を作る。ねじには通気溝・通気穴を設ける</li>
<li>蓋のたわみを考えず、真空引きで内部部品の位置がずれる</li>
<li>粗引き中に急排気して、ウェーハが動いたり粒子を巻き上げたりする (スロー排気を設ける)</li>
</ul>`,
    points: [
      "分子流の円管コンダクタンス C ≈ 12.1 d³/L (L/s, cm)。直径の 3 乗に比例",
      "1/Seff = 1/S + 1/C。配管を太く短くするのが最も効く",
      "粘性流の排気時間 t = (V/S) ln(p0/p)。高真空の到達圧力は p ≈ Q/Seff",
      "リーク量は Pa·m³/s。He リークディテクタで箇所を特定する",
    ],
    exercises: [
      {
        q: "排気速度 300 L/s のポンプを、内径 10 cm・長さ 50 cm の配管でつなぎました (分子流・20 °C 空気)。実効排気速度を求めてください。",
        a: "C = 12.1 × 10³ ÷ 50 = 242 L/s<br>1/S<sub>eff</sub> = 1/300 + 1/242 → S<sub>eff</sub> ≈ <b>134 L/s</b>。ポンプの約 45% しか生かせていません。",
      },
      {
        q: "体積 50 L のチャンバを封じきり、10 分間で圧力が 1.0 Pa から 1.6 Pa に上がりました。ガス負荷 (リーク + 放出ガス) を Pa·m³/s で求めてください。",
        a: "Q = V × Δp ÷ Δt = 0.05 m³ × 0.6 Pa ÷ 600 s = <b>5×10⁻⁵ Pa·m³/s</b>。圧力上昇が時間に比例し続けるならリーク、だんだん頭打ちになるなら放出ガスが主と推定できます。",
      },
    ],
    quiz: [
      { q: "分子流で配管の直径を 2 倍にすると、コンダクタンスは (長さ一定)?", choices: ["2 倍", "4 倍", "8 倍"], answer: 2, explain: "C ∝ d³ なので 2³ = 8 倍です。" },
      { q: "S = 100 L/s、C = 100 L/s を直列につないだ実効排気速度は?", choices: ["200 L/s", "100 L/s", "50 L/s"], answer: 2, explain: "1/Seff = 1/100 + 1/100 → 50 L/s。" },
      { q: "ベーキングする超高真空に適したフランジは?", choices: ["KF (O リング)", "CF (銅ガスケット)", "ISO (O リング)"], answer: 1, explain: "金属シールの CF はエラストマを使わないので高温ベーキングと超高真空に向きます。" },
    ],
  },

  // ------------------------------------------------------------------ 5
  {
    id: "gas-chemical-supply",
    part: "equipment",
    title: "ガス・薬液供給系の設計 — 配管・バルブ・MFC・安全",
    minutes: 20,
    level: 3,
    lead: "半導体製造では、毒性・可燃性・腐食性をもつガスや薬液を、正確な流量で、汚さずに、漏らさずに供給する必要があります。この章ではガスボックスの構成、継手とデッドレグ、マスフローコントローラ (MFC)、パージの考え方、そしてシリンダキャビネット・排気・検知器・二重配管による安全設計を学びます。",
    body: `
<h2>ガス供給の流れ</h2>
<p>ガスは工場側のシリンダキャビネットやバルク供給から配管で装置まで来て、装置内の<b>ガスボックス</b>で 1 系統ずつ「手動弁 → レギュレータ → 圧力計 → フィルタ → 空圧弁 → MFC → 空圧弁」と通り、混合されてチャンバへ入ります。各系統には不活性ガス (窒素) の<b>パージライン</b>が接続されます。</p>
<svg class="tb-chart" viewBox="0 0 520 270" role="img" aria-label="ガスボックス内の1系統: レギュレータ、フィルタ、空圧弁、MFC、パージ、排気されるキャビネット">
<text class="k-title" x="260" y="20" text-anchor="middle">ガスボックス (排気された筐体の中の 1 系統)</text>
<rect class="k-ground" x="10" y="240" width="500" height="10"/><line class="k-edge" x1="10" y1="240" x2="510" y2="240"/>
<g class="k-shadow">
<rect class="k-alu" x="20" y="44" width="480" height="196" rx="6" style="opacity:0.35"/>
</g>
<rect class="k-part" x="40" y="150" width="440" height="14" rx="2"/>
<g class="k-shadow">
<rect class="k-part-h" x="56" y="122" width="26" height="28" rx="3"/>
<circle class="k-part" cx="69" cy="112" r="12"/>
<rect class="k-part-h" x="110" y="118" width="30" height="32" rx="4"/>
<circle class="k-alu" cx="125" cy="104" r="12"/>
<rect class="k-part-h" x="164" y="124" width="24" height="26" rx="3"/>
<rect class="k-part-h" x="210" y="120" width="26" height="30" rx="3"/>
<rect class="k-yellow" x="212" y="102" width="22" height="18" rx="3"/>
<rect class="k-alu" x="262" y="90" width="80" height="60" rx="4"/>
<rect class="k-part-h" x="366" y="120" width="26" height="30" rx="3"/>
<rect class="k-yellow" x="368" y="102" width="22" height="18" rx="3"/>
</g>
<rect class="k-screen" x="276" y="100" width="52" height="20" rx="2"/>
<text class="k-screen-t" x="302" y="114" text-anchor="middle">500 sccm</text>
<circle class="k-part-h" cx="125" cy="104" r="3"/>
<path class="k-copper" d="M223 164 L223 200 L120 200" style="fill:none;stroke-width:6"/>
<rect class="k-part-h" x="96" y="190" width="24" height="20" rx="3"/>
<path class="k-move" d="M480 157 L508 157" marker-end="url(#k-arrow)" style="fill:none"/>
<path class="k-move" d="M440 60 L440 34" marker-end="url(#k-arrow)" style="fill:none"/>
<rect class="k-led-off" x="450" y="196" width="30" height="20" rx="3"/>
<text class="tick" x="69" y="180" text-anchor="middle">手動弁</text>
<text class="tick" x="125" y="88" text-anchor="middle">レギュレータ</text>
<text class="tick" x="176" y="180" text-anchor="middle">フィルタ</text>
<text class="tick" x="223" y="96" text-anchor="middle">空圧弁</text>
<text class="tick" x="302" y="84" text-anchor="middle">MFC</text>
<text class="tick" x="379" y="96" text-anchor="middle">空圧弁</text>
<text class="tick" x="80" y="226" text-anchor="middle">N₂ パージ</text>
<text class="tick" x="432" y="40" text-anchor="end">筐体排気</text>
<text class="tick" x="465" y="230" text-anchor="middle">ガス検知器</text>
<text class="tick" x="500" y="176" text-anchor="end">チャンバへ</text>
<text class="tick" x="26" y="144">入</text>
</svg>
<p class="tb-caption">図: 部品は表面実装形のブロックに並べ、筐体全体を排気して万一の漏れを検知器で捉える</p>

<h2>継手・バルブ・デッドレグ</h2>
<ul>
<li>高純度ガスには、金属ガスケットを面で押しつぶす<b>フェースシール継手</b>や溶接継手を使う。食い込み式継手より漏れ・粒子が少なく、再組立しても内面に段差が残りにくい</li>
<li>配管は電解研磨したステンレス管で、内面は滑らか、溶接は内面の酸化を防ぐため不活性ガスを流しながら行う</li>
<li><b>デッドレグ</b> (流れのない行き止まり部) はガスが滞留し、パージで置換できず、水分や腐食生成物がたまる。分岐は短く、弁は分岐の根元に置く</li>
<li>弁は金属ダイヤフラム弁が一般的。通電・空圧が失われたとき閉じる<b>ノーマルクローズ</b>を基本にする</li>
</ul>

<h2>MFC と流量の単位</h2>
<p>MFC (マスフローコントローラ) はガスの<b>質量流量</b>を測って制御します。単位の <b>sccm</b> は「標準状態に換算した cm³/min」で、標準状態は 0 °C・101.325 kPa とするのが一般的ですが、メーカーや規格で異なる場合があるので仕様書で確認します。熱式 MFC は気体の熱的性質で流量を測るので、校正ガスと異なるガスを流すときは<b>ガス換算係数</b>で補正します。</p>

<h3>計算例 — sccm の換算とパージ回数</h3>
<div class="tb-example">
<p><b>(1) 流量換算</b>: 窒素 500 sccm は、標準状態 (0 °C・101.325 kPa) のモル体積 22,414 cm³/mol を使って</p>
<p>500 ÷ 22,414 ≈ <b>0.0223 mol/min</b>、質量では 0.0223 × 28 ≈ <b>0.62 g/min</b></p>
<p><b>(2) フロー置換</b>: 外径 1/4 インチ管 (内径 4.57 mm)・長さ 5 m の配管の体積は π/4 × 0.457² × 500 ≈ <b>82 cm³</b>。窒素 1,000 sccm で流すと 1 回の置換は約 4.9 s (圧力が大気圧付近の場合)。完全混合を仮定すると濃度は e<sup>−n</sup> で下がるので、1 (100%) から 1 ppm (10⁻⁶) まで下げるには n = ln(10⁶) ≈ <b>13.8 回</b>、約 68 s 必要です。</p>
<p><b>(3) サイクルパージ</b>: 真空引き 1 kPa と窒素充填 100 kPa を繰り返すと 1 サイクルで濃度は 1/100 になり、3 サイクルで 10⁻⁶ に届きます。デッドレグのある配管ではフローだけでは置換できないため、サイクルパージが有効です。</p>
</div>

<h2>安全設計</h2>
<svg class="tb-chart" viewBox="0 0 520 250" role="img" aria-label="シリンダキャビネットと薬液の二重配管、作業者">
<text class="k-title" x="260" y="20" text-anchor="middle">シリンダキャビネットと二重配管</text>
<rect class="k-ground" x="10" y="216" width="500" height="10"/><line class="k-edge" x1="10" y1="216" x2="510" y2="216"/>
<g class="k-shadow">
<rect class="k-alu" x="40" y="46" width="150" height="170" rx="4"/>
<rect class="k-part-h" x="70" y="96" width="34" height="116" rx="14"/>
<rect class="k-part-h" x="124" y="96" width="34" height="116" rx="14"/>
<rect class="k-part" x="300" y="150" width="190" height="16" rx="8"/>
</g>
<rect class="k-glass" x="50" y="56" width="130" height="30" rx="3"/>
<rect class="k-yellow" x="64" y="104" width="46" height="6"/>
<rect class="k-yellow" x="118" y="104" width="46" height="6"/>
<rect class="k-alu" x="90" y="34" width="50" height="12" rx="2"/>
<path class="k-move" d="M115 34 L115 14" marker-end="url(#k-arrow)" style="fill:none"/>
<rect class="k-led-g" x="160" y="60" width="12" height="10" rx="2"/>
<rect class="k-glass" x="300" y="140" width="190" height="36" rx="18"/>
<rect class="k-plastic" x="300" y="152" width="190" height="12" rx="6"/>
<path class="k-hidden" d="M300 176 L300 196 L280 196" style="fill:none"/>
<rect class="k-led-r" x="262" y="190" width="14" height="10" rx="2"/>
<circle class="k-person" cx="236" cy="104" r="10"/>
<path class="k-person" d="M222 216 L224 160 Q224 122 236 120 Q248 122 250 160 L252 216 Z"/>
<path class="k-skin" d="M224 140 Q210 140 198 132 L200 126 Q212 132 226 134 Z"/>
<text class="tick" x="148" y="42">排気ダクト</text>
<text class="tick" x="115" y="236" text-anchor="middle">シリンダキャビネット</text>
<text class="tick" x="395" y="132" text-anchor="middle">外管 (透明) + 内管 (薬液)</text>
<text class="tick" x="395" y="196" text-anchor="middle">外管の漏液センサ</text>
<text class="tick" x="236" y="236" text-anchor="middle">作業者は外から操作</text>
</svg>
<p class="tb-caption">図: 毒性・可燃性ガスは排気されたキャビネット内に置き、薬液は内管が漏れても外管で受ける二重配管にする</p>
<ul>
<li>毒性・可燃性ガスの容器は<b>排気されたシリンダキャビネット</b>に置き、ガス検知器・過流量遮断・緊急遮断弁を備える</li>
<li>装置内のガスボックスも筐体を排気し、検知器が反応したら<b>ガス供給を遮断</b>して警報を出すインタロックを組む</li>
<li>互いに反応するガス (可燃性と支燃性など) は系統・排気を分ける</li>
<li>薬液配管は<b>二重配管</b>や受け皿 (漏液トレイ) と<b>漏液センサ</b>で漏れを閉じ込め、検出する</li>
<li>適用法令 (高圧ガス・毒物劇物・消防など) や業界の安全ガイドラインに従い、設計段階で安全担当と確認する</li>
</ul>

<h3>機構設計者のチェックリスト</h3>
<ul>
<li>分岐配管を短くしデッドレグをなくしたか</li><li>すべての毒性・可燃性系統にパージラインと排気・検知器・遮断弁があるか</li><li>弁はノーマルクローズか</li><li>薬液部は二重配管または受け皿 + 漏液センサか</li>
</ul>

<h3>よくある失敗</h3>
<ul>
<li>保守用の分岐を長く残し、デッドレグに水分がたまって腐食・粒子発生を起こす</li>
<li>校正ガスと異なるガスに換算係数を入れず、流量がずれる</li>
<li>パージ不足のまま配管を開放し、残留ガスに作業者がさらされる</li>
<li>検知器の位置を考えず、ガスの比重 (空気より軽い・重い) に合わない高さに付ける</li>
</ul>`,
    points: [
      "ガスボックスは手動弁・レギュレータ・フィルタ・空圧弁・MFC で構成し、筐体を排気する",
      "高純度ガスはフェースシール継手・電解研磨管。デッドレグをなくす",
      "sccm は標準状態換算の体積流量。異なるガスには換算係数",
      "完全混合のフロー置換は e^(−n)。1 ppm まで約 14 回、サイクルパージも有効",
      "検知器・遮断弁のインタロック、シリンダキャビネット、二重配管で漏れを閉じ込める",
    ],
    exercises: [
      {
        q: "体積 200 cm³ の配管を窒素 2,000 sccm (大気圧付近) でフロー置換し、残留濃度を 10 ppm まで下げたい。完全混合と仮定して必要な時間を求めてください。",
        a: "必要回数 n = ln(1 / 10⁻⁵) = ln(10⁵) ≈ 11.5 回<br>1 回の置換時間 = 200 ÷ 2,000 min = 0.1 min = 6 s<br>合計 ≈ 11.5 × 6 ≈ <b>69 s</b>",
      },
      {
        q: "真空引き 2 kPa と窒素充填 100 kPa を繰り返すサイクルパージで、濃度を 10⁻⁶ 以下にするには何サイクル必要ですか。",
        a: "1 サイクルで 2/100 = 0.02 倍。0.02ⁿ ≤ 10⁻⁶ → n ≥ 6 ÷ (−log₁₀ 0.02) = 6 ÷ 1.70 ≈ 3.53。<b>4 サイクル</b>必要です。",
      },
    ],
    quiz: [
      { q: "デッドレグが問題になる理由は?", choices: ["流れがなくパージで置換されず、滞留・汚染の原因になる", "圧力損失が大きくなる", "MFC の精度が上がりすぎる"], answer: 0, explain: "行き止まり部はガスが入れ替わらず、水分や不純物がたまります。" },
      { q: "MFC が直接制御するのは?", choices: ["体積流量 (実際の温度・圧力)", "質量流量", "配管圧力"], answer: 1, explain: "MFC は質量流量を制御し、sccm は標準状態に換算した表示です。" },
      { q: "ガス検知器が反応したときの装置の動作として適切なのは?", choices: ["警報だけ出して処理を続ける", "ガス供給を遮断し警報を出す", "排気を止める"], answer: 1, explain: "供給遮断と警報をインタロックで行い、排気は継続します。" },
    ],
  },

  // ------------------------------------------------------------------ 6
  {
    id: "semi-thermal-control",
    part: "equipment",
    title: "温度制御と熱設計 — ヒータ・チラー・ウェーハ温度均一性",
    minutes: 20,
    level: 3,
    lead: "成膜速度、エッチング速度、膜質は温度に強く依存するため、ウェーハ面内の温度均一性はプロセスの均一性に直結します。この章ではヒータステージのゾーン分割と温度センサの配置、チラーによる冷却ループの熱収支、熱膨張の逃がし方、モータや軸受を熱から守る断熱設計を学びます。",
    body: `
<h2>ヒータステージとゾーン制御</h2>
<p>ウェーハを載せるステージ (サセプタ) には抵抗ヒータを埋め込みます。ウェーハ外周は周囲の壁への放射や支持部からの熱逃げが大きく、中央より冷えやすいので、ヒータを<b>同心円状の複数ゾーン</b>に分け、それぞれを独立に制御します。</p>
<svg class="tb-chart" viewBox="0 0 520 260" role="img" aria-label="ヒータステージの断面: ウェーハ、内外ゾーンのヒータ、熱電対、冷却ジャケット、支柱">
<text class="k-title" x="260" y="20" text-anchor="middle">ヒータステージの断面</text>
<rect class="k-ground" x="10" y="232" width="500" height="10"/><line class="k-edge" x1="10" y1="232" x2="510" y2="232"/>
<g class="k-shadow">
<rect class="k-alu" x="80" y="80" width="360" height="40" rx="6"/>
<rect class="k-part-h" x="236" y="120" width="48" height="80"/>
<rect class="k-part" x="200" y="200" width="120" height="32" rx="4"/>
</g>
<rect class="k-accent" x="100" y="72" width="320" height="8" rx="3"/>
<g class="k-copper">
<rect x="110" y="96" width="14" height="10" rx="2"/><rect x="130" y="96" width="14" height="10" rx="2"/>
<rect x="376" y="96" width="14" height="10" rx="2"/><rect x="396" y="96" width="14" height="10" rx="2"/>
<rect x="190" y="96" width="14" height="10" rx="2"/><rect x="230" y="96" width="14" height="10" rx="2"/>
<rect x="276" y="96" width="14" height="10" rx="2"/><rect x="316" y="96" width="14" height="10" rx="2"/>
</g>
<line class="k-edge" x1="166" y1="100" x2="166" y2="190" style="stroke:var(--tb-bad);stroke-width:2"/>
<line class="k-edge" x1="260" y1="100" x2="260" y2="210" style="stroke:var(--tb-bad);stroke-width:2"/>
<circle cx="166" cy="98" r="3" style="fill:var(--tb-bad)"/><circle cx="260" cy="98" r="3" style="fill:var(--tb-bad)"/>
<rect class="k-glass" x="236" y="150" width="48" height="16"/>
<path class="k-move" d="M150 210 L196 214" style="fill:none"/>
<g class="k-force" style="fill:none">
<path d="M88 76 Q60 60 40 66" marker-end="url(#k-arrow-r)"/>
<path d="M432 76 Q460 60 480 66" marker-end="url(#k-arrow-r)"/>
</g>
<text class="lbl" x="260" y="62" text-anchor="middle">ウェーハ</text>
<text class="tick" x="40" y="58">熱逃げ (外周)</text>
<text class="tick" x="128" y="140" text-anchor="middle">外ゾーン</text>
<text class="tick" x="260" y="140" text-anchor="end">内</text>
<text class="tick" x="393" y="140" text-anchor="middle">外ゾーン</text>
<line class="k-thin" x1="166" y1="180" x2="120" y2="196"/><text class="tick" x="116" y="200" text-anchor="end">熱電対</text>
<line class="k-thin" x1="284" y1="158" x2="340" y2="170"/><text class="tick" x="344" y="174">断熱 (熱絶縁部)</text>
<text class="tick" x="328" y="222">冷却ジャケット付きベース</text>
</svg>
<p class="tb-caption">図: 内・外ゾーンにそれぞれ熱電対を置き独立制御する。支柱には熱を通しにくい部分を設けて下部を守る</p>
<h3>温度センサの配置</h3>
<ul>
<li>熱電対や測温抵抗体は<b>ウェーハにできるだけ近い位置</b>、かつ各ゾーンの代表点に置く。ヒータ線のすぐ近くでは局所的な高温を測ってしまう</li>
<li>制御用と別に<b>過昇温保護用</b>のセンサと独立したリミッタを設け、制御系の故障でも電源を遮断する</li>
<li>ウェーハ自体の温度は、センサ付きの計測用ウェーハで面内分布を測り、ゾーンの出力比を調整して合わせ込む</li>
<li>真空中では気体による伝熱がほとんどなく、ステージとウェーハの間の伝熱が悪い。静電チャックで密着させ、裏面に少量のヘリウムを流して伝熱を補うことが多い</li>
</ul>

<h2>チラーと熱収支</h2>
<p>チャンバ壁、電極、ポンプ、ヒータのベースなどは<b>チラー</b> (循環式の温調装置) の冷却水や熱媒で温度を保ちます。冷却ループの熱収支は</p>
<p style="text-align:center"><b>Q = ṁ × c × ΔT</b></p>
<p>(Q: 除去熱量 W、ṁ: 質量流量 kg/s、c: 比熱 J/(kg·K)、ΔT: 出入口の温度差 K)</p>
<div class="tb-example">
<p><b>計算例</b>: 電極から 2 kW を除去したい。冷却水 (c = 4,180 J/(kg·K)) の出入口温度差を 3 K に抑えます。</p>
<p>ṁ = Q ÷ (c·ΔT) = 2,000 ÷ (4,180 × 3) ≈ <b>0.159 kg/s</b> ≈ <b>9.6 L/min</b></p>
<p>温度差を小さくするほど面内の温度むらは減りますが、流量が増え、配管の圧力損失とポンプ動力が増えます。チラー能力は、この熱量に配管からの熱損失と余裕を加えて選びます。冷却水に絶縁性が要る高電圧電極では、純水やフッ素系熱媒を使い比抵抗を管理します (フッ素系熱媒は比熱が水より小さいので、同じ熱量に大きな流量が必要)。</p>
</div>

<h2>熱膨張と断熱</h2>
<svg class="tb-chart" viewBox="0 0 520 220" role="img" aria-label="良い例と悪い例: 熱膨張を逃がす支持と、モータの断熱">
<text class="k-title" x="260" y="20" text-anchor="middle">熱膨張を逃がす支持</text>
<rect class="k-panel" x="12" y="32" width="240" height="176" rx="8"/>
<rect class="k-panel" x="268" y="32" width="240" height="176" rx="8"/>
<text class="k-bad-t" x="132" y="52" text-anchor="middle">悪い例: 両端をピン固定</text>
<text class="k-good-t" x="388" y="52" text-anchor="middle">良い例: 1 点固定 + 長穴</text>
<g class="k-shadow">
<path class="k-alu" d="M40 110 Q132 86 224 110 L224 124 Q132 100 40 124 Z"/>
<rect class="k-part" x="36" y="124" width="16" height="50" rx="2"/>
<rect class="k-part" x="212" y="124" width="16" height="50" rx="2"/>
<rect class="k-alu" x="296" y="100" width="184" height="14" rx="3"/>
<rect class="k-part" x="292" y="114" width="16" height="60" rx="2"/>
<rect class="k-part" x="468" y="114" width="16" height="60" rx="2"/>
</g>
<circle class="k-sphere" cx="44" cy="117" r="4"/><circle class="k-sphere" cx="220" cy="117" r="4"/>
<circle class="k-sphere" cx="300" cy="107" r="4"/>
<rect class="k-edge" x="466" y="103" width="20" height="8" rx="4" style="fill:none"/>
<circle class="k-sphere" cx="476" cy="107" r="3"/>
<path class="k-force" d="M132 80 L132 66" marker-end="url(#k-arrow-r)" style="fill:none"/>
<path class="k-move" d="M440 88 L476 88" marker-end="url(#k-arrow)" style="fill:none"/>
<text class="tick" x="132" y="150" text-anchor="middle">伸びが逃げず</text>
<text class="tick" x="132" y="166" text-anchor="middle">反る・応力が出る</text>
<text class="tick" x="388" y="140" text-anchor="middle">固定点から</text>
<text class="tick" x="388" y="156" text-anchor="middle">長穴側へ自由に伸びる</text>
<text class="tick" x="300" y="190" text-anchor="middle">固定</text>
<text class="tick" x="476" y="190" text-anchor="middle">長穴</text>
</svg>
<p class="tb-caption">図: 高温部品は 1 点を基準に固定し、他は長穴やたわみ支持で伸びを逃がす</p>
<p>線膨張は ΔL = α × L × ΔT。アルミ合金 (α ≈ 23×10⁻⁶ /K) の直径 300 mm のステージを 25 °C から 350 °C に上げると ΔL ≈ 23×10⁻⁶ × 300 × 325 ≈ <b>2.2 mm</b>。ステンレス (α ≈ 17×10⁻⁶ /K) のチャンバ 500 mm を 100 K 上げると約 0.87 mm 伸びます。ウェーハの受け渡し位置、リフトピン穴、ロボットのティーチング位置は高温時の寸法で確認します。</p>
<ul>
<li>モータ・エンコーダ・軸受は高温部から離し、低熱伝導の部材 (ステンレス薄肉管、セラミックス、樹脂スペーサ) で<b>熱的に絶縁</b>し、必要なら水冷する</li>
<li>放射を遮る<b>遮熱板</b> (反射率の高い薄板を数枚重ねる) を高温部と周囲の間に入れる</li>
<li>O リングなどエラストマのシール部は耐熱温度以下に保つ (シール部近くの水冷)</li>
<li>人が触れる外装は安全な温度に保ち、高温部には表示とカバーを設ける</li>
</ul>

<h3>機構設計者のチェックリスト</h3>
<ul>
<li>熱電対の位置をウェーハ近傍・各ゾーン代表点にしたか</li><li>独立した過昇温保護があるか</li><li>高温部品は 1 点固定 + 長穴か</li><li>モータ・軸受・O リング部の温度を断熱・水冷で許容値以下にしたか</li>
</ul>

<h3>よくある失敗</h3>
<ul>
<li>熱電対をヒータ線の真上に置き、ウェーハ温度より高い値で制御してしまう</li>
<li>高温部品を複数のピンで拘束し、昇温で反る・割れる (特にセラミックス)</li>
<li>チラー流量を絞りすぎて出入口温度差が大きくなり、面内に温度むらが出る</li>
<li>モータを高温のステージ軸に直結し、磁石の減磁やエンコーダの故障を起こす</li>
</ul>`,
    points: [
      "外周は熱が逃げやすいので、ヒータを同心ゾーンに分けて独立制御する",
      "センサはウェーハ近く・各ゾーンの代表点に置き、独立の過昇温保護を設ける",
      "冷却ループは Q = ṁcΔT で流量を決める",
      "熱膨張は 1 点固定 + 長穴で逃がし、モータ・軸受・シールは断熱・水冷で守る",
    ],
    exercises: [
      {
        q: "チャンバ壁から 5 kW を冷却水で除去します。出入口温度差を 5 K にするとき必要な流量 (L/min) を求めてください (c = 4,180 J/(kg·K)、密度 1 kg/L)。",
        a: "ṁ = 5,000 ÷ (4,180 × 5) ≈ 0.239 kg/s → 0.239 × 60 ≈ <b>14.4 L/min</b>",
      },
      {
        q: "アルミ合金 (α = 23×10⁻⁶ /K) のステージで、中心から 140 mm の位置にあるリフトピン穴は、25 °C から 400 °C に昇温するとどれだけ外側へ移動しますか。",
        a: "ΔL = 23×10⁻⁶ × 140 × 375 ≈ <b>1.21 mm</b>。ピンの穴径やピン位置はこの移動を見込んで決めます。",
      },
    ],
    quiz: [
      { q: "ヒータステージでウェーハ外周が冷えやすい主な理由は?", choices: ["外周から周囲への熱逃げが大きい", "外周はシリコンが薄い", "熱電対が外周にない"], answer: 0, explain: "外周は放射や支持部への熱逃げが大きく、ゾーン制御で補います。" },
      { q: "Q = 3 kW、ΔT = 3 K、水 (c = 4,180 J/(kg·K)) の必要流量は約?", choices: ["2.4 L/min", "14.4 L/min", "36 L/min"], answer: 1, explain: "3,000 ÷ (4,180 × 3) ≈ 0.239 kg/s ≈ 14.4 L/min。" },
      { q: "高温部品の熱膨張の扱いとして適切なのは?", choices: ["全周を強く拘束する", "1 点を基準に固定し、他は長穴などで逃がす", "膨張は小さいので無視する"], answer: 1, explain: "拘束すると反りや熱応力が生じます。" },
    ],
  },
];
