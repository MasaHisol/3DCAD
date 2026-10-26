import type { TextChapter } from "../types";

// Part 12 (equipment), third group: mass-production equipment, handling,
// minor stoppages, start-up/acceptance and equipment data.
// Related: "op-changeover", "op-handling", "maintainability", "reliability".

export const EQUIPMENT3: TextChapter[] = [
  // ------------------------------------------------------------------ 1
  {
    id: "mass-production-equip",
    part: "equipment",
    title: "量産装置の設計 — 稼働率・OEE・MTBF/MTTR",
    minutes: 18,
    level: 2,
    lead: "量産装置は「速く動く」だけでは評価されません。計画した時間のうち、どれだけ良品を作れたかが問われます。この章では設備総合効率 (OEE) と MTBF/MTTR を使って装置の実力を数値で表し、止まりにくく、止まってもすぐ戻る装置を設計する考え方を学びます。",
    body: `
<h2>OEE — 3 つのロスに分解する</h2>
<p><b>OEE (設備総合効率)</b> は次の 3 つの積です。</p>
<ul>
<li><b>時間稼働率</b> (Availability) = 稼働時間 ÷ 負荷時間 — 故障・段取り・調整で止まった時間のロス</li>
<li><b>性能稼働率</b> (Performance) = (理論サイクルタイム × 加工数) ÷ 稼働時間 — 速度低下とチョコ停のロス</li>
<li><b>良品率</b> (Quality) = 良品数 ÷ 加工数 — 不良・手直し・立上げ不良のロス</li>
</ul>
<p>OEE = 時間稼働率 × 性能稼働率 × 良品率。掛け算なので、どれも 90% でも OEE は約 73% になります。どのロスが大きいかを見て、設計で手を打つ場所を決めます。</p>
<svg class="tb-chart" viewBox="0 0 520 250" role="img" aria-label="負荷時間から良品を作った時間までのロスの内訳">
<text class="k-title" x="260" y="20" text-anchor="middle">負荷時間 480 分 → 良品を作った時間</text>
<g class="k-shadow">
<rect class="k-alu" x="150" y="36" width="340" height="30" rx="3"/>
<rect class="k-alu" x="150" y="86" width="306" height="30" rx="3"/>
<rect class="k-alu" x="150" y="136" width="275" height="30" rx="3"/>
<rect class="k-accent" x="150" y="186" width="270" height="30" rx="3"/>
</g>
<rect x="456" y="86" width="34" height="30" rx="3" style="fill:var(--tb-bad)" opacity="0.35"/>
<rect x="425" y="136" width="31" height="30" rx="3" style="fill:var(--tb-warn)" opacity="0.45"/>
<rect x="420" y="186" width="5" height="30" style="fill:var(--tb-bad)" opacity="0.6"/>
<text class="lbl" x="140" y="56" text-anchor="end">負荷時間</text>
<text class="lbl" x="140" y="106" text-anchor="end">稼働時間</text>
<text class="lbl" x="140" y="156" text-anchor="end">正味稼働時間</text>
<text class="lbl" x="140" y="206" text-anchor="end">価値稼働時間</text>
<text class="mark-t" x="320" y="56" text-anchor="middle">480 分</text>
<text class="mark-t" x="300" y="106" text-anchor="middle">432 分</text>
<text class="mark-t" x="288" y="156" text-anchor="middle">388.8 分</text>
<text class="mark-t" x="285" y="206" text-anchor="middle">381.0 分 (OEE 79.4%)</text>
<text class="k-bad-t" x="473" y="132" text-anchor="middle">停止</text>
<text class="tick" x="440" y="182" text-anchor="middle">速度</text>
<text class="tick" x="150" y="238">時間稼働率 90% × 性能稼働率 90% × 良品率 98% = 79.4%</text>
</svg>
<p class="tb-caption">図: 3 つのロスを順に差し引くと、良品を作るのに使えた時間が残る (下の計算例の数値)</p>

<h3>計算例</h3>
<div class="tb-example">
<p>1 直 480 分の負荷時間で、故障と段取りの停止が合計 48 分。理論サイクルタイム 2.0 s、加工数 11,664 個、うち良品 11,431 個でした。</p>
<p>時間稼働率 = (480 − 48) ÷ 480 = 432 ÷ 480 = <b>0.90</b><br>
性能稼働率 = 2.0 s × 11,664 ÷ (432 × 60 s) = 23,328 ÷ 25,920 = <b>0.90</b><br>
良品率 = 11,431 ÷ 11,664 = <b>0.98</b><br>
OEE = 0.90 × 0.90 × 0.98 = <b>0.794 (79.4%)</b></p>
<p>性能稼働率の 10% は「動いているはずなのに作れていない」時間で、多くは数秒〜数分の<b>チョコ停</b>です (「チョコ停をなくす設計」の章)。</p>
</div>

<h2>MTBF と MTTR — 止まる間隔と戻る速さ</h2>
<p><b>MTBF</b> (平均故障間隔) は「動き続けられる平均時間」、<b>MTTR</b> (平均修復時間) は「止まってから再開するまでの平均時間」です。故障だけで考えた固有の稼働率は</p>
<p style="text-align:center"><b>A = MTBF ÷ (MTBF + MTTR)</b></p>
<p>MTBF 120 分・MTTR 5 分なら A = 120 ÷ 125 = 96.0%。MTTR を 2.5 分に半減すると 120 ÷ 122.5 = 98.0% になります。<b>MTBF を 2 倍にするより、MTTR を半分にする方が安く実現できる</b>ことがよくあります。信頼性の数学は「信頼性設計」の章、修理しやすさは「保全性設計」の章を参照してください。</p>
<svg class="tb-chart" viewBox="0 0 520 240" role="img" aria-label="装置の積層表示灯と稼働・停止のタイムライン">
<rect class="k-ground" x="10" y="160" width="150" height="10"/><line class="k-edge" x1="10" y1="160" x2="160" y2="160"/>
<g class="k-shadow">
<rect class="k-part" x="22" y="110" width="126" height="50" rx="4"/>
<rect class="k-alu" x="30" y="50" width="110" height="62" rx="6"/>
<rect class="k-glass" x="42" y="60" width="62" height="40" rx="3"/>
<rect class="k-screen" x="112" y="64" width="20" height="28" rx="2"/>
<rect class="k-alu" x="136" y="20" width="6" height="32"/>
</g>
<rect class="k-led-g" x="132" y="22" width="14" height="9" rx="2"/>
<rect class="k-led-off" x="132" y="31" width="14" height="9" rx="2"/>
<rect class="k-led-off" x="132" y="40" width="14" height="9" rx="2"/>
<circle class="k-part-h" cx="60" cy="88" r="7"/>
<text class="tick" x="85" y="180" text-anchor="middle">量産装置</text>
<line class="k-edge" x1="180" y1="120" x2="510" y2="120"/>
<rect x="180" y="100" width="120" height="20" style="fill:var(--tb-good)" opacity="0.55"/>
<rect x="300" y="100" width="18" height="20" style="fill:var(--tb-bad)" opacity="0.7"/>
<rect x="318" y="100" width="140" height="20" style="fill:var(--tb-good)" opacity="0.55"/>
<rect x="458" y="100" width="14" height="20" style="fill:var(--tb-bad)" opacity="0.7"/>
<rect x="472" y="100" width="38" height="20" style="fill:var(--tb-good)" opacity="0.55"/>
<line class="k-dimline" x1="180" y1="85" x2="300" y2="85" marker-start="url(#k-arrow)" marker-end="url(#k-arrow)"/>
<text class="k-dimtext" x="240" y="80" text-anchor="middle">故障までの時間</text>
<line class="k-dimline" x1="300" y1="140" x2="318" y2="140"/>
<text class="k-bad-t" x="309" y="158" text-anchor="middle">修理</text>
<text class="tick" x="388" y="94" text-anchor="middle">稼働</text>
<text class="lbl" x="180" y="196">MTBF = 稼働時間の平均</text>
<text class="lbl" x="180" y="216">MTTR = 停止 (赤) 時間の平均</text>
<text class="tick" x="510" y="140" text-anchor="end">時間 →</text>
</svg>
<p class="tb-caption">図: 緑 = 稼働、赤 = 故障停止。稼働区間の平均が MTBF、停止区間の平均が MTTR</p>

<h2>止まらない・すぐ戻る装置にする設計</h2>
<table class="tb-table">
<tr><th>狙い</th><th>設計での手段</th></tr>
<tr><td>MTBF を延ばす (ロバスト化)</td><td>ワークのばらつきを許容するガイド・コンプライアンス、部品の定格に余裕 (ディレーティング)、配線・配管の屈曲寿命の確認、粉じん・切粉からセンサを守るカバー</td></tr>
<tr><td>MTTR を縮める (早期復旧)</td><td>アラームに原因と処置を表示、原点復帰・ワーク排出のワンボタン化、詰まり箇所に手が届く扉、工具なしで外せるカバー、ユニット丸ごと交換</td></tr>
<tr><td>待ち時間をなくす</td><td>予備品 (スペア) を装置ごとに準備、消耗品の交換周期を明示、ロギングで故障履歴を残す</td></tr>
<tr><td>段取りロスを減らす</td><td>「段取り替え」の章の外段取り化・ワンタッチ治具</td></tr>
</table>
<p><b>予備品</b>は「故障したら装置が止まる」「入手に日数がかかる」部品 (専用加工部品、特殊なセンサ・アクチュエータ) から優先して準備します。納入時に予備品リストと推奨数量を渡すのが設計者の仕事です。</p>

<h3>よくある失敗</h3>
<ul>
<li>サイクルタイムだけを仕様にして、稼働率・OEE の目標値を決めていない</li>
<li>OEE の「理論サイクルタイム」を実績値にしてしまい、速度ロスが見えなくなる</li>
<li>故障の平均だけを見て、復旧に 1 時間かかる稀な故障 (専用部品の破損) を見落とす</li>
<li>修理に分解が必要な場所に、よく詰まる機構を置く</li>
</ul>`,
    points: [
      "OEE = 時間稼働率 × 性能稼働率 × 良品率。掛け算なので小さなロスが積み重なる",
      "固有の稼働率 A = MTBF ÷ (MTBF + MTTR)",
      "MTTR の短縮は MTBF の延長より安く効くことが多い",
      "ロバスト化 (止まらない) と早期復旧 (すぐ戻る) を両方設計する",
      "納入時に予備品リストと推奨数量を渡す",
    ],
    exercises: [
      {
        q: "負荷時間 450 分、停止 27 分、理論サイクルタイム 3.0 s、加工数 7,614 個、良品 7,538 個のとき、時間稼働率・性能稼働率・良品率・OEE を求めてください。",
        a: "時間稼働率 = (450 − 27) ÷ 450 = 423 ÷ 450 = <b>0.940</b><br>性能稼働率 = 3.0 × 7,614 ÷ (423 × 60) = 22,842 ÷ 25,380 = <b>0.900</b><br>良品率 = 7,538 ÷ 7,614 = <b>0.990</b><br>OEE = 0.940 × 0.900 × 0.990 ≈ <b>0.838 (83.8%)</b>",
      },
      {
        q: "MTBF 200 分・MTTR 10 分の装置があります。(a) 稼働率を求めてください。(b) MTBF を 400 分にした場合と、MTTR を 5 分にした場合の稼働率を比べてください。",
        a: "(a) 200 ÷ 210 = <b>95.2%</b><br>(b) MTBF 400 分: 400 ÷ 410 = <b>97.6%</b>。MTTR 5 分: 200 ÷ 205 = <b>97.6%</b>。どちらも同じ効果で、MTBF ÷ MTTR の比が同じなら稼働率は同じです。MTTR の半減 (アラーム表示・交換しやすさ) の方が、故障率の半減より安く実現できることが多いです。",
      },
    ],
    quiz: [
      { q: "OEE を構成する 3 つの要素の組合せは?", choices: ["時間稼働率・性能稼働率・良品率", "MTBF・MTTR・サイクルタイム", "人・設備・材料"], answer: 0, explain: "OEE は時間稼働率 × 性能稼働率 × 良品率です。" },
      { q: "チョコ停のロスが主に現れるのはどの要素?", choices: ["時間稼働率", "性能稼働率", "良品率"], answer: 1, explain: "短い停止は停止時間として記録されにくく、加工数の不足 (性能稼働率の低下) として現れます。" },
      { q: "MTBF 120 分・MTTR 5 分の固有稼働率は?", choices: ["約 96%", "約 92%", "約 99%"], answer: 0, explain: "120 ÷ (120 + 5) = 0.96 です。" },
    ],
  },

  // ------------------------------------------------------------------ 2
  {
    id: "automation-handling",
    part: "equipment",
    title: "自動化とワーク搬送 — コンベア・パレット・ピック&プレース・パーツフィーダ",
    minutes: 20,
    level: 2,
    lead: "組立ラインでは、加工や組付けそのものより、ワークを「運ぶ・止める・位置決めする・つかむ・供給する」動作の方が多くの機構を占めます。搬送方式の選び方、工程間バッファの効果、ピック&プレースのサイクル、パーツフィーダの基本を学びます。人による運搬は「運搬と取扱い」の章を参照してください。",
    body: `
<h2>搬送方式の種類</h2>
<table class="tb-table">
<tr><th>方式</th><th>特徴</th><th>向く用途</th></tr>
<tr><td>インデックス (同期) 搬送</td><td>ロータリテーブルやウォーキングビームで全ワークを同時に 1 ピッチ送る。全工程が同じタクトで動く</td><td>小物・高速・工程数が少ない</td></tr>
<tr><td>フリーフロー (非同期) 搬送</td><td>ワークをパレットに載せ、ベルトやローラで流しながらストッパで各工程に止める。工程ごとに独立して動ける</td><td>工程数が多い・工程時間がばらつく</td></tr>
<tr><td>ロボット・直交軸による移載</td><td>工程間をハンドで移す。レイアウトの自由度が高い</td><td>多品種・工程が離れている</td></tr>
</table>
<svg class="tb-chart" viewBox="0 0 520 240" role="img" aria-label="フリーフローパレットコンベアとストッパ・バッファ">
<text class="k-title" x="260" y="20" text-anchor="middle">フリーフロー搬送 (パレットが工程前にたまる)</text>
<rect class="k-ground" x="10" y="200" width="500" height="10"/><line class="k-edge" x1="10" y1="200" x2="510" y2="200"/>
<g class="k-shadow">
<rect class="k-part" x="40" y="170" width="10" height="30"/><rect class="k-part" x="470" y="170" width="10" height="30"/><rect class="k-part" x="255" y="170" width="10" height="30"/>
<rect class="k-alu" x="20" y="150" width="480" height="20" rx="3"/>
<rect class="k-alu" x="300" y="40" width="110" height="18" rx="3"/>
<rect class="k-part" x="300" y="58" width="12" height="70"/>
<rect class="k-part" x="345" y="58" width="22" height="46" rx="2"/>
<rect class="k-part" x="350" y="104" width="12" height="18"/>
</g>
<rect class="k-rubber" x="20" y="146" width="480" height="5" rx="2"/>
<g class="k-shadow">
<rect class="k-plastic" x="70" y="126" width="52" height="20" rx="3"/>
<rect class="k-plastic" x="124" y="126" width="52" height="20" rx="3"/>
<rect class="k-plastic" x="178" y="126" width="52" height="20" rx="3"/>
<rect class="k-plastic" x="330" y="126" width="52" height="20" rx="3"/>
<rect class="k-plastic" x="440" y="126" width="52" height="20" rx="3"/>
</g>
<rect class="k-accent" x="85" y="116" width="22" height="10" rx="2"/><rect class="k-accent" x="139" y="116" width="22" height="10" rx="2"/><rect class="k-accent" x="193" y="116" width="22" height="10" rx="2"/><rect class="k-accent" x="345" y="116" width="22" height="10" rx="2"/><rect class="k-accent" x="455" y="116" width="22" height="10" rx="2"/>
<rect class="k-yellow" x="232" y="132" width="8" height="18" rx="1"/>
<rect class="k-yellow" x="384" y="132" width="8" height="18" rx="1"/>
<line class="k-move" x1="420" y1="100" x2="490" y2="100" marker-end="url(#k-arrow-blue)"/>
<text class="tick" x="455" y="92" text-anchor="middle">流れ</text>
<line class="k-thin" x1="236" y1="150" x2="236" y2="226"/><text class="lbl" x="242" y="226">ストッパ</text>
<text class="lbl" x="420" y="52">工程ユニット</text>
<line class="k-dimline" x1="70" y1="104" x2="230" y2="104" marker-start="url(#k-arrow)" marker-end="url(#k-arrow)"/>
<text class="k-dimtext" x="150" y="98" text-anchor="middle">バッファ (3 パレット)</text>
<text class="tick" x="30" y="226">ベルトはパレットの下を滑り続ける</text>
</svg>
<p class="tb-caption">図: ストッパで止められたパレットの下でベルトは動き続ける。前工程が止まっても、たまったパレットで後工程は動ける</p>

<h2>パレットの位置決め</h2>
<p>ストッパで止めた位置は ±1 mm 程度ばらつくので、精密な作業ではパレットを<b>リフト&ロケート</b>します。パレット下面の基準穴 (丸穴 + 長穴) に下からテーパ付きの<b>位置決めピン</b>を差し込み、ベルトから持ち上げてクランプします。丸穴で位置、長穴で回転を拘束するのは治具設計と同じ「3-2-1 の考え方」です。パレットごとの誤差も公差に入れ、全パレットで確認します。</p>

<h2>工程間バッファの効果</h2>
<div class="tb-example">
<p><b>計算例</b>: 2 工程 A・B が直列につながり、それぞれ単独の稼働率が 90% (停止は互いに独立) とします。</p>
<p><b>バッファなし</b> (インデックス搬送): どちらかが止まるとライン全体が止まるので、ライン稼働率 ≈ 0.90 × 0.90 = <b>81%</b>。</p>
<p><b>十分なバッファあり</b>: A が止まっても B はたまったワークで動き、B が止まっても A はバッファへ送り続けられます。停止の影響が互いに伝わらなくなり、ライン稼働率は単独の 90% に<b>近づきます</b>。</p>
<p>必要な量の目安: 典型的な停止時間 5 分、サイクルタイム 30 s なら、5 × 60 ÷ 30 = <b>10 個</b>分のバッファで、その停止を吸収できます。ただし、バッファは仕掛品・床面積・不良の発見遅れを増やすので、むやみに大きくしません。</p>
</div>

<h2>ピック&プレースのサイクル</h2>
<p>空圧シリンダや電動アクチュエータの 2 軸ユニットで、ワークを取り出して置く動作は次の 8 ステップです。</p>
<table class="tb-table">
<tr><th>動作</th><th>下降</th><th>把持</th><th>上昇</th><th>横行</th><th>下降</th><th>解放</th><th>上昇</th><th>戻り</th></tr>
<tr><td>時間 s</td><td>0.30</td><td>0.15</td><td>0.30</td><td>0.50</td><td>0.30</td><td>0.10</td><td>0.30</td><td>0.50</td></tr>
</table>
<p>合計 2.45 s。速くするには、上昇途中で横行を始める (動作の<b>オーバーラップ</b>)、戻りの間に次のワークを供給する、下降量を短くする、などの工夫をします。把持と解放には、確実につかんだ・離したことを確認するセンサ (真空圧スイッチ、グリッパの開閉センサ) を付けます。</p>
<svg class="tb-chart" viewBox="0 0 520 250" role="img" aria-label="振動ボウルフィーダとリニアフィーダ、ピック&プレースユニット">
<rect class="k-ground" x="10" y="218" width="500" height="10"/><line class="k-edge" x1="10" y1="218" x2="510" y2="218"/>
<g class="k-shadow">
<rect class="k-part" x="40" y="168" width="140" height="50" rx="6"/>
<path class="k-alu" d="M30,110 L190,110 L176,168 L44,168 Z"/>
<ellipse class="k-alu" cx="110" cy="110" rx="80" ry="16"/>
<rect class="k-part" x="190" y="176" width="120" height="42" rx="4"/>
<rect class="k-alu" x="180" y="164" width="140" height="12" rx="2"/>
<rect class="k-part" x="350" y="40" width="14" height="178"/>
<rect class="k-alu" x="340" y="40" width="160" height="18" rx="3"/>
<rect class="k-part" x="300" y="58" width="26" height="54" rx="3"/>
<rect class="k-part" x="306" y="112" width="14" height="40"/>
<rect class="k-part" x="420" y="186" width="80" height="32" rx="3"/>
</g>
<ellipse cx="110" cy="110" rx="60" ry="10" style="fill:var(--tb-surface)" opacity="0.6"/>
<path class="k-edge" d="M50,112 Q110,138 170,112" fill="none"/>
<path class="k-edge" d="M60,124 Q120,148 182,126" fill="none"/>
<rect class="k-accent" x="70" y="104" width="8" height="6" rx="1"/><rect class="k-accent" x="96" y="112" width="8" height="6" rx="1"/><rect class="k-accent" x="128" y="106" width="8" height="6" rx="1"/>
<rect class="k-accent" x="196" y="156" width="8" height="8" rx="1"/><rect class="k-accent" x="212" y="156" width="8" height="8" rx="1"/><rect class="k-accent" x="228" y="156" width="8" height="8" rx="1"/><rect class="k-accent" x="244" y="156" width="8" height="8" rx="1"/>
<rect class="k-rubber" x="302" y="152" width="22" height="8" rx="2"/>
<rect class="k-accent" x="450" y="178" width="8" height="8" rx="1"/>
<line class="k-move" x1="330" y1="76" x2="420" y2="76" marker-end="url(#k-arrow-blue)"/>
<line class="k-move" x1="292" y1="80" x2="292" y2="140" marker-end="url(#k-arrow-blue)"/>
<text class="lbl" x="60" y="40">ボウルフィーダ</text><line class="k-thin" x1="100" y1="44" x2="110" y2="96"/>
<text class="tick" x="110" y="200" text-anchor="middle">振動駆動部</text>
<text class="lbl" x="196" y="140">リニアフィーダ</text>
<text class="lbl" x="400" y="34">ピック&プレース</text>
<text class="tick" x="460" y="208" text-anchor="middle">組付け治具</text>
</svg>
<p class="tb-caption">図: ボウル内のらせん状の通路を部品が登り、姿勢をそろえてリニアフィーダへ送られ、ハンドがつかむ</p>

<h2>振動パーツフィーダの基本</h2>
<p>ボウルを斜め上下に小さく振動させると、部品は少しずつ跳ねながらボウル内壁の<b>らせん状トラック</b>を登ります。途中に<b>姿勢選別</b> (切欠き・段差・エアジェット) を置き、向きの違う部品をボウル内に落として戻します。選別で落ちる分があるので、フィーダの供給能力は必要量より余裕を持たせます (目安 1.3〜1.5 倍)。上の例で 2.45 s に 1 個なら必要量は 60 ÷ 2.45 ≈ 24.5 個/分、フィーダは 32〜37 個/分程度で選びます。リニアフィーダ上の部品が満杯か空かをセンサで見て、ボウルの運転を制御します。</p>

<h3>よくある失敗</h3>
<ul>
<li>バッファなしの同期搬送に工程を詰め込み、1 か所の停止でライン全体が止まる</li>
<li>パレット単体の精度しか確認せず、パレット間のばらつきで位置がずれる</li>
<li>フィーダの供給能力を必要量ぴったりで選び、選別落ちや部品のばらつきで供給が追いつかない</li>
<li>把持を確認するセンサがなく、落としたワークに気付かず空のまま組付ける</li>
</ul>`,
    points: [
      "インデックス搬送は高速・単純、フリーフローは工程の独立性が高い",
      "工程間バッファは停止の伝播を断ち、ライン稼働率を単独稼働率に近づける",
      "必要バッファ量 ≈ 吸収したい停止時間 ÷ サイクルタイム",
      "精密作業はリフト&ロケート (丸穴 + 長穴に位置決めピン)",
      "フィーダは選別落ちを見込んで必要量の 1.3〜1.5 倍の供給能力",
    ],
    exercises: [
      {
        q: "3 工程が直列にあり、単独稼働率がそれぞれ 95%・90%・92% です。バッファがない場合のライン稼働率の目安を求め、十分なバッファを入れた場合の上限を述べてください。",
        a: "バッファなし: 0.95 × 0.90 × 0.92 ≈ <b>0.787 (約 79%)</b>。十分なバッファでは停止が独立に吸収され、ラインはおおむね最も低い工程の <b>90%</b> 程度が上限になります (実際にはバッファが有限なので少し下回ります)。",
      },
      {
        q: "サイクルタイム 12 s のラインで、後工程の典型的な停止 (チョコ停の処置) が 3 分です。この停止中も前工程を止めないために必要なバッファ数を求めてください。",
        a: "3 × 60 ÷ 12 = <b>15 個</b>。前工程はこの間バッファへ送り続け、後工程は復旧後にバッファを消化します。後工程が前工程より速くないとバッファは元に戻らないので、後工程のサイクルタイムにも余裕が必要です。",
      },
    ],
    quiz: [
      { q: "フリーフロー搬送でパレットが止まっている間、ベルトは?", choices: ["パレットの下を滑りながら動き続ける", "ライン全体で停止する", "逆転する"], answer: 0, explain: "ストッパで止めたパレットの下でベルトは動き続け、パレットがたまってバッファになります。" },
      { q: "工程間バッファの主な効果は?", choices: ["ある工程の停止が他工程に伝わるのを防ぐ", "サイクルタイムを理論値より短くする", "不良を自動的に除去する"], answer: 0, explain: "停止の伝播を断つことで、ライン稼働率が工程単独の稼働率に近づきます。" },
      { q: "振動ボウルフィーダで向きの違う部品はどう扱う?", choices: ["選別部でボウル内に落として戻す", "そのまま供給してロボットが修正する", "フィーダを停止する"], answer: 0, explain: "切欠き・段差・エアジェットなどで向きの違う部品を落とし、再び登らせます。" },
    ],
  },

  // ------------------------------------------------------------------ 3
  {
    id: "minor-stoppage",
    part: "equipment",
    title: "チョコ停をなくす設計 — ワーク姿勢・センサ・リトライ",
    minutes: 18,
    level: 3,
    lead: "チョコ停 (短時間停止) は、部品の引っかかりやセンサの誤検出で数秒〜数分止まり、作業者がワークを取り除くか直して再起動すれば戻る停止です。1 回は小さくても 1 日に何十回も起きると、性能稼働率を大きく下げます。原因を数えて大きいものから潰し、設計で再発を防ぐ方法を学びます。",
    body: `
<h2>チョコ停の主な原因</h2>
<table class="tb-table">
<tr><th>原因</th><th>典型的な現象</th></tr>
<tr><td>供給ミス</td><td>フィーダから出てこない、2 個重なって出る、逆向きで出る</td></tr>
<tr><td>詰まり・引っかかり</td><td>シュートの継ぎ目、ばりのある部品、ガイドのすき間に部品が挟まる</td></tr>
<tr><td>センサの誤検出</td><td>光沢面・透明品での誤反射、汚れ、振動による瞬断、検出位置のずれ</td></tr>
<tr><td>部品のばらつき</td><td>ロットによる寸法・反り・ばりの違いで、つかめない・入らない</td></tr>
<tr><td>把持・挿入ミス</td><td>吸着の漏れ、位置ずれのまま押し込みエラー</td></tr>
</table>
<p>チョコ停は「故障」として記録されにくく、原因が埋もれがちです。<b>装置自身が停止の原因と時刻を記録する</b>仕組みを最初から設計に入れておくことが第一歩です (「装置データの活用」の章)。</p>

<h2>パレート分析で優先順位を決める</h2>
<div class="tb-example">
<p><b>計算例</b>: 1 週間のアラーム記録 100 件を原因別に集計しました。</p>
<table class="tb-table">
<tr><th>原因</th><th>件数</th><th>累積比率</th></tr>
<tr><td>フィーダ供給ミス</td><td>42</td><td>42%</td></tr>
<tr><td>シュート詰まり</td><td>27</td><td>69%</td></tr>
<tr><td>センサ誤検出</td><td>15</td><td>84%</td></tr>
<tr><td>吸着ミス</td><td>8</td><td>92%</td></tr>
<tr><td>その他</td><td>8</td><td>100%</td></tr>
</table>
<p>上位 2 項目で 69% を占めます。1 件の処置が平均 1.5 分なら、上位 2 項目を半減させると (42 + 27) ÷ 2 × 1.5 ≈ <b>52 分/週</b>の停止が減ります。件数だけでなく、1 件あたりの停止時間も掛けて「時間」で並べるとさらに正確です。</p>
</div>
<svg class="tb-chart" viewBox="0 0 520 250" role="img" aria-label="チョコ停原因のパレート図">
<text class="k-title" x="260" y="20" text-anchor="middle">チョコ停のパレート図 (1 週間 100 件)</text>
<line class="k-edge" x1="60" y1="200" x2="470" y2="200"/>
<line class="k-edge" x1="60" y1="40" x2="60" y2="200"/>
<line class="k-edge" x1="470" y1="40" x2="470" y2="200"/>
<text class="tick" x="54" y="204" text-anchor="end">0</text><text class="tick" x="54" y="124" text-anchor="end">25</text><text class="tick" x="54" y="44" text-anchor="end">50</text>
<text class="tick" x="476" y="204">0%</text><text class="tick" x="476" y="124">50%</text><text class="tick" x="476" y="44">100%</text>
<g class="k-shadow">
<rect class="k-accent" x="72" y="65.6" width="62" height="134.4" rx="2"/>
<rect class="k-alu" x="152" y="113.6" width="62" height="86.4" rx="2"/>
<rect class="k-alu" x="232" y="152" width="62" height="48" rx="2"/>
<rect class="k-alu" x="312" y="174.4" width="62" height="25.6" rx="2"/>
<rect class="k-alu" x="392" y="174.4" width="62" height="25.6" rx="2"/>
</g>
<polyline points="103,132.8 183,89.6 263,65.6 343,52.8 423,40" fill="none" style="stroke:var(--tb-bad)" stroke-width="2"/>
<circle cx="103" cy="132.8" r="3.5" style="fill:var(--tb-bad)"/><circle cx="183" cy="89.6" r="3.5" style="fill:var(--tb-bad)"/><circle cx="263" cy="65.6" r="3.5" style="fill:var(--tb-bad)"/><circle cx="343" cy="52.8" r="3.5" style="fill:var(--tb-bad)"/><circle cx="423" cy="40" r="3.5" style="fill:var(--tb-bad)"/>
<text class="mark-t" x="103" y="60" text-anchor="middle">42</text><text class="mark-t" x="183" y="108" text-anchor="middle">27</text><text class="mark-t" x="263" y="146" text-anchor="middle">15</text>
<text class="tick" x="103" y="216" text-anchor="middle">供給ミス</text><text class="tick" x="183" y="216" text-anchor="middle">詰まり</text><text class="tick" x="263" y="216" text-anchor="middle">誤検出</text><text class="tick" x="343" y="216" text-anchor="middle">吸着ミス</text><text class="tick" x="423" y="216" text-anchor="middle">その他</text>
<text class="k-bad-t" x="222" y="104">累積 69%</text>
<text class="tick" x="20" y="240">棒 = 件数 (左軸) / 折れ線 = 累積比率 (右軸)</text>
</svg>
<p class="tb-caption">図: 左から大きい順に並べ、累積比率で「どこまで潰せば大半が消えるか」を見る</p>

<h2>設計での対策</h2>
<h3>1. ワークの姿勢を機構で決める</h3>
<p>入口に<b>面取り・テーパ</b>を付けて呼び込み、シュートは継ぎ目に段差を作らない (下流側を低く)。ガイドのすき間は「部品が 2 個重なって入らず、傾いても噛み込まない」寸法にします。部品のばり・反りの最悪値で確認します。</p>
<svg class="tb-chart" viewBox="0 0 520 230" role="img" aria-label="シュートの継ぎ目とガイド入口の悪い例と良い例">
<rect class="k-panel" x="10" y="10" width="245" height="210" rx="8"/>
<rect class="k-panel" x="265" y="10" width="245" height="210" rx="8"/>
<text class="k-bad-t" x="132" y="32" text-anchor="middle">悪い例: 段差と角</text>
<text class="k-good-t" x="387" y="32" text-anchor="middle">良い例: 下流を低く・面取り</text>
<g class="k-shadow">
<path class="k-part" d="M24,90 L120,120 L120,136 L24,106 Z"/>
<path class="k-part" d="M120,112 L236,148 L236,164 L120,128 Z"/>
<path class="k-part" d="M279,90 L375,120 L375,136 L279,106 Z"/>
<path class="k-part" d="M375,126 L491,162 L491,178 L375,142 Z"/>
</g>
<rect class="k-accent" x="98" y="98" width="22" height="14" rx="2" transform="rotate(17 109 105)"/>
<rect class="k-accent" x="400" y="120" width="22" height="14" rx="2" transform="rotate(17 411 127)"/>
<circle cx="120" cy="116" r="14" fill="none" style="stroke:var(--tb-bad)" stroke-width="2"/>
<text class="tick" x="132" y="188" text-anchor="middle">継ぎ目で下流が高く、部品の角が当たる</text>
<text class="tick" x="387" y="188" text-anchor="middle">継ぎ目で下流を 0.5〜1 mm 下げる</text>
<line class="k-move" x1="300" y1="70" x2="360" y2="88" marker-end="url(#k-arrow-blue)"/>
<line class="k-move" x1="45" y1="70" x2="100" y2="87" marker-end="url(#k-arrow-blue)"/>
<text class="k-bad-t" x="132" y="206" text-anchor="middle">引っかかって停止</text>
<text class="k-good-t" x="387" y="206" text-anchor="middle">段差を落ちるだけ</text>
</svg>
<p class="tb-caption">図: 流れの方向に対して段差は「下り」にする。上りの段差は必ず引っかかる</p>

<h3>2. 確実に検出する</h3>
<ul>
<li>光沢品・透明品には透過形センサや、背景との差を見る方式を選ぶ。反射形の誤検出を避ける</li>
<li>信号の瞬断にはオンディレイ・オフディレイ (数十 ms) のフィルタを入れる</li>
<li>「あるべきときにある」だけでなく「ないべきときにない」(前のワークが残っていない) も確認する</li>
<li>センサはワークに当たらず、清掃しやすい位置に。光軸調整の基準を図面に残す</li>
</ul>

<h3>3. リトライと自動回復</h3>
<p>吸着ミスや挿入の引っかかりは、もう 1 回やれば成功することが多い現象です。<b>決めた回数 (例: 1〜2 回) だけ自動でリトライ</b>し、それでも失敗したらワークを NG シュートへ排出して次へ進む、最後に停止してアラーム、という順序で設計します。リトライは無制限にしない、リトライ回数を記録する、安全に関わる動作はリトライしない、が原則です。リトライ回数の増加は、部品のばらつきや摩耗の早期の兆候になります。</p>

<h3>4. ポカヨケ</h3>
<p>逆向き・別品種の部品が物理的に入らない形状 (非対称の切欠き、ピン)、品種ごとに違う治具のキー、取付け忘れの検出など、間違いを起こせない設計にします。</p>

<h3>よくある失敗</h3>
<ul>
<li>試作部品 (きれいな少量品) だけで調整し、量産部品のばり・反りで詰まる</li>
<li>アラームを「異常」の 1 種類しか作らず、原因別の件数が取れない</li>
<li>リトライを無制限にして、不良ワークを何度も押し込み治具を壊す</li>
<li>作業者が毎回直している「いつものこと」を記録せず、チョコ停と認識しない</li>
</ul>`,
    points: [
      "チョコ停は故障として記録されにくい。装置が原因と時刻を自動記録する",
      "パレート分析で、件数 (または停止時間) の上位から潰す",
      "シュートの継ぎ目は下流を低く、入口は面取りで呼び込む",
      "センサはワークの材質に合った方式とフィルタ、残留の確認も",
      "リトライは回数を限定し、NG 排出 → 停止の順。回数を記録する",
    ],
    exercises: [
      {
        q: "1 日のチョコ停が 60 件、1 件あたりの処置時間が平均 2 分、負荷時間 960 分のラインです。(a) チョコ停による停止時間の割合を求めてください。(b) 件数を 1/3 に減らすと何分の改善ですか。",
        a: "(a) 60 × 2 = 120 分、120 ÷ 960 = <b>12.5%</b>。<br>(b) 60 件 → 20 件で 40 件減、40 × 2 = <b>80 分/日</b>の改善です。サイクルタイム 10 s なら 80 × 60 ÷ 10 = 480 個/日の増産に相当します。",
      },
      {
        q: "吸着ミスの発生率が 1 回の試行あたり 2% で、各試行は独立とします。リトライなし、リトライ 1 回、リトライ 2 回のとき、ワーク 1 個あたり最終的に失敗 (停止) する確率を求めてください。",
        a: "リトライなし: 2% = 0.02。リトライ 1 回: 0.02² = <b>0.0004 (0.04%)</b>。リトライ 2 回: 0.02³ = <b>0.000008 (0.0008%)</b>。ただし実際には失敗が独立でない (ワークの不良や摩耗が原因) ことが多いので、リトライで消えない失敗は NG 排出して原因を調べます。",
      },
    ],
    quiz: [
      { q: "パレート分析で最初に取り組むべきなのは?", choices: ["件数 (または停止時間) が最も大きい原因", "対策が最も簡単な原因", "最近発生した原因"], answer: 0, explain: "大きい順に並べ、上位から潰すのが最も効果的です。" },
      { q: "シュートの継ぎ目の段差の付け方として正しいのは?", choices: ["流れの下流側を少し低くする", "流れの下流側を少し高くする", "段差は気にしなくてよい"], answer: 0, explain: "上り段差は部品の角が当たって引っかかります。" },
      { q: "リトライ設計の原則として正しくないのは?", choices: ["回数を限定する", "回数を記録する", "成功するまで無制限に繰り返す"], answer: 2, explain: "無制限のリトライは不良ワークの押し込みや機構の破損を招きます。" },
    ],
  },

  // ------------------------------------------------------------------ 4
  {
    id: "equip-startup-acceptance",
    part: "equipment",
    title: "装置の立上げと受入 — FAT・SAT・初期流動",
    minutes: 20,
    level: 3,
    lead: "装置は組み上がったら終わりではありません。製作者の工場での立会い検査 (FAT)、納入先での据付後の検査 (SAT)、工程能力の確認、定格速度での連続運転、量産初期の特別管理 (初期流動) を経て、ようやく量産が始まります。この章では、立上げ・受入の手順と判定の考え方を学びます。",
    body: `
<h2>立上げの流れ</h2>
<svg class="tb-chart" viewBox="0 0 520 240" role="img" aria-label="製作工場での FAT から輸送、納入先での SAT と初期流動までの流れ">
<rect class="k-ground" x="10" y="180" width="500" height="10"/><line class="k-edge" x1="10" y1="180" x2="510" y2="180"/>
<text class="k-title" x="90" y="24" text-anchor="middle">製作工場</text>
<text class="k-title" x="410" y="24" text-anchor="middle">納入先工場</text>
<g class="k-shadow">
<rect class="k-alu" x="30" y="100" width="100" height="80" rx="5"/>
<rect class="k-glass" x="42" y="112" width="52" height="40" rx="3"/>
<rect class="k-screen" x="102" y="114" width="20" height="26" rx="2"/>
<rect class="k-alu" x="200" y="120" width="70" height="44" rx="3"/>
<rect class="k-part" x="270" y="132" width="34" height="32" rx="4"/>
<rect class="k-alu" x="360" y="100" width="100" height="80" rx="5"/>
<rect class="k-glass" x="372" y="112" width="52" height="40" rx="3"/>
<rect class="k-screen" x="432" y="114" width="20" height="26" rx="2"/>
</g>
<rect class="k-glass" x="282" y="136" width="18" height="12" rx="2"/>
<circle class="k-rubber" cx="220" cy="170" r="10"/><circle class="k-rubber" cx="288" cy="170" r="10"/>
<rect class="k-led-g" x="452" y="84" width="10" height="8" rx="2"/><rect class="k-alu" x="455" y="92" width="4" height="8"/>
<circle class="k-person" cx="150" cy="96" r="9"/>
<path class="k-person" d="M141,108 Q150,104 159,108 L162,140 L158,180 L152,180 L150,150 L148,180 L142,180 L138,140 Z"/>
<circle class="k-person" cx="480" cy="96" r="9"/>
<path class="k-person" d="M471,108 Q480,104 489,108 L492,140 L488,180 L482,180 L480,150 L478,180 L472,180 L468,140 Z"/>
<rect class="k-plastic" x="160" y="118" width="14" height="18" rx="2"/>
<line class="k-move" x1="180" y1="100" x2="330" y2="100" marker-end="url(#k-arrow-blue)"/>
<text class="tick" x="255" y="92" text-anchor="middle">分割・梱包・輸送</text>
<text class="lbl" x="80" y="210" text-anchor="middle">FAT (工場立会い)</text>
<text class="lbl" x="410" y="210" text-anchor="middle">SAT → 初期流動</text>
<text class="tick" x="80" y="228" text-anchor="middle">仕様・機能・性能を確認</text>
<text class="tick" x="410" y="228" text-anchor="middle">据付後の再確認・量産性</text>
</svg>
<p class="tb-caption">図: FAT で問題を出し切ってから輸送する。現地で直すと時間も費用も何倍もかかる</p>

<h2>FAT と SAT のチェック項目</h2>
<table class="tb-table">
<tr><th>区分</th><th>FAT (Factory Acceptance Test)</th><th>SAT (Site Acceptance Test)</th></tr>
<tr><td>外観・構造</td><td>仕様書・図面との照合、傷、銘板、ラベル</td><td>輸送による損傷、据付・レベル出し、アンカー</td></tr>
<tr><td>ユーティリティ</td><td>仮設の電源・エアで確認</td><td>現地の電源電圧・相回転・エア圧・アース・排気</td></tr>
<tr><td>安全</td><td>非常停止、インターロック、安全距離、残留リスクの表示</td><td>周辺設備との取り合い、避難通路、再確認</td></tr>
<tr><td>機能</td><td>全動作・全アラーム・全モード (自動・手動・段取り)</td><td>上下流設備との通信・連動</td></tr>
<tr><td>性能</td><td>サイクルタイム、精度、工程能力 (試作部品)</td><td>量産部品・量産作業者での連続運転 (Run at Rate)</td></tr>
<tr><td>文書</td><td>図面・取扱説明書・電気図・プログラムの草案</td><td>最終版一式、予備品リスト、教育記録</td></tr>
</table>
<p>判定基準 (合否の数値) は<b>仕様書の段階で</b>決めておきます。立会いの場で基準を議論し始めると、検査が交渉になってしまいます。</p>

<h2>工程能力 Cp・Cpk</h2>
<p>装置が規格内のものを安定して作れるかは、測定値の平均 μ と標準偏差 σ から求めます。上限規格 USL、下限規格 LSL として</p>
<p style="text-align:center"><b>Cp = (USL − LSL) ÷ 6σ</b> 、 <b>Cpk = min(USL − μ, μ − LSL) ÷ 3σ</b></p>
<p>Cp はばらつきの小ささだけ、Cpk は中心のずれも含めた実力を表します。新規装置の受入では Cpk ≥ 1.33 (あるいは 1.67) を求めることが多く、値は顧客との合意で決めます。</p>
<div class="tb-example">
<p><b>計算例</b>: 圧入高さの規格 10.00 ± 0.05 mm。50 個の測定で μ = 10.012 mm、σ = 0.008 mm。</p>
<p>Cp = 0.10 ÷ (6 × 0.008) = 0.10 ÷ 0.048 = <b>2.08</b><br>
Cpk = min(10.05 − 10.012, 10.012 − 9.95) ÷ (3 × 0.008) = 0.038 ÷ 0.024 = <b>1.58</b></p>
<p>ばらつきは十分小さいが、中心が上側に 0.012 mm ずれています。調整機構で中心を 10.00 に寄せれば Cpk は Cp の 2.08 に近づきます。サンプル数が少ないと σ の推定がぶれるので、個数と採取方法も合意しておきます。</p>
</div>
<svg class="tb-chart" viewBox="0 0 520 220" role="img" aria-label="規格幅と分布の位置で見る Cp と Cpk">
<line class="k-edge" x1="30" y1="180" x2="490" y2="180"/>
<path d="M140,180 C190,180 205,52 260,52 C315,52 330,180 380,180 Z" style="fill:var(--tb-accent)" opacity="0.18" transform="translate(29 0)"/>
<path d="M140,180 C190,180 205,52 260,52 C315,52 330,180 380,180" fill="none" style="stroke:var(--tb-accent)" stroke-width="2" transform="translate(29 0)"/>
<line x1="80" y1="40" x2="80" y2="190" style="stroke:var(--tb-bad)" stroke-width="2"/>
<line x1="440" y1="40" x2="440" y2="190" style="stroke:var(--tb-bad)" stroke-width="2"/>
<line class="k-center" x1="260" y1="40" x2="260" y2="190"/>
<line class="k-hidden" x1="289" y1="50" x2="289" y2="190"/>
<text class="k-bad-t" x="80" y="34" text-anchor="middle">LSL 9.95</text>
<text class="k-bad-t" x="440" y="34" text-anchor="middle">USL 10.05</text>
<text class="tick" x="250" y="34" text-anchor="end">規格中心 10.00</text>
<text class="mark-t" x="295" y="46">μ = 10.012</text>
<line class="k-dimline" x1="289" y1="120" x2="440" y2="120" marker-start="url(#k-arrow)" marker-end="url(#k-arrow)"/>
<text class="k-dimtext" x="385" y="114" text-anchor="middle">0.038 (近い側)</text>
<line class="k-dimline" x1="80" y1="200" x2="440" y2="200" marker-start="url(#k-arrow)" marker-end="url(#k-arrow)"/>
<text class="k-dimtext" x="260" y="214" text-anchor="middle">規格幅 0.10 → Cp</text>
<text class="tick" x="400" y="140" text-anchor="middle">÷ 3σ → Cpk</text>
</svg>
<p class="tb-caption">図: Cpk は分布の中心から「近い方の規格」までの余裕で決まる</p>

<h2>Run at Rate と初期流動管理</h2>
<p><b>Run at Rate</b> は、量産と同じ部品・作業者・速度で一定時間 (例: 2 時間〜1 直) 連続運転し、計画通りの数の良品が出るかを確かめる試験です。サイクルタイム 6 s・2 時間なら理論 1,200 個。実績と停止の内訳を記録し、OEE を算出します。</p>
<p>量産開始から一定期間 (例: 1〜3 か月、または一定数量) は<b>初期流動管理</b>として、検査の頻度を上げ、不具合・停止を毎日集計して対策します。決めた条件 (不良率、OEE、Cpk の安定) を満たしたら通常管理へ移行します。</p>

<h2>パンチリストと文書の引渡し</h2>
<p>検査で見つかった未完了・不具合は<b>パンチリスト</b> (番号・内容・重要度・担当・期限・完了確認者) にまとめます。「出荷前に必須」「現地で対応可」を区別し、全項目が閉じるまで最終検収としません。引渡す文書は、機械・電気・空圧図面、部品表、取扱説明書、保全手順と点検表、プログラムのバックアップ (版番号付き)、パラメータ一覧、予備品リスト、検査成績書、リスクアセスメントの記録です。</p>

<h3>よくある失敗</h3>
<ul>
<li>合否基準を決めないまま FAT を迎え、立会いが交渉になる</li>
<li>試作の「良い部品」だけで FAT に合格し、量産部品でチョコ停が多発する</li>
<li>現地でプログラムを修正したまま、最新版のバックアップを残さない</li>
<li>パンチリストの「現地対応」項目が誰の担当か曖昧なまま放置される</li>
</ul>`,
    points: [
      "FAT で問題を出し切り、SAT で据付後と連動を確認する",
      "合否の数値は仕様書の段階で合意しておく",
      "Cp = 規格幅 ÷ 6σ、Cpk = 近い側の余裕 ÷ 3σ",
      "Run at Rate で量産条件の連続運転を確認し、初期流動で特別管理",
      "パンチリストを全て閉じ、最新の図面・プログラム・予備品リストを引渡す",
    ],
    exercises: [
      {
        q: "規格 25.00 ± 0.03 mm、測定で μ = 24.990 mm、σ = 0.005 mm でした。Cp と Cpk を求め、受入基準 Cpk ≥ 1.33 に対する判定と対策を述べてください。",
        a: "Cp = 0.06 ÷ (6 × 0.005) = 0.06 ÷ 0.03 = <b>2.00</b><br>Cpk = min(25.03 − 24.990, 24.990 − 24.97) ÷ (3 × 0.005) = min(0.040, 0.020) ÷ 0.015 = <b>1.33</b><br>基準ちょうどで余裕がありません。ばらつきは小さいので、中心を 0.010 mm 上げる調整をすれば Cpk は 2.00 近くになります。",
      },
      {
        q: "サイクルタイム 8 s の装置で 3 時間の Run at Rate を行い、良品 1,215 個、不良 15 個、停止合計 12 分でした。理論生産数、時間稼働率、性能稼働率、良品率、OEE を求めてください。",
        a: "理論 = 3 × 3,600 ÷ 8 = <b>1,350 個</b>。時間稼働率 = (180 − 12) ÷ 180 = <b>0.933</b>。性能稼働率 = 8 × 1,230 ÷ (168 × 60) = 9,840 ÷ 10,080 = <b>0.976</b>。良品率 = 1,215 ÷ 1,230 = <b>0.988</b>。OEE = 0.933 × 0.976 × 0.988 ≈ <b>0.90</b> (= 1,215 × 8 ÷ 10,800 と同じ)。",
      },
    ],
    quiz: [
      { q: "FAT が行われる場所は?", choices: ["装置の製作者の工場", "納入先の工場", "部品メーカー"], answer: 0, explain: "FAT は製作工場での立会い検査、SAT は納入先での据付後の検査です。" },
      { q: "Cpk が Cp より小さくなる理由は?", choices: ["分布の中心が規格中心からずれているため", "サンプル数が多すぎるため", "規格幅が広いため"], answer: 0, explain: "Cpk は近い側の規格までの余裕で決まり、中心がずれるほど小さくなります。" },
      { q: "パンチリストに含めるべきでないものは?", choices: ["担当者と期限", "重要度", "装置の販売価格"], answer: 2, explain: "パンチリストは未完了・不具合項目を、内容・重要度・担当・期限・完了確認で管理します。" },
    ],
  },

  // ------------------------------------------------------------------ 5
  {
    id: "equip-data-iot",
    part: "equipment",
    title: "装置データの活用 — 稼働監視・トレーサビリティ・予知保全",
    minutes: 18,
    level: 2,
    lead: "装置は自分の状態を最もよく知っています。状態・サイクルタイム・アラーム・工程値を記録しておけば、停止の原因分析、不良の追跡、故障の予兆検知に使えます。何をどの粒度で記録するか、データ量の見積もり、セキュリティの基本までを設計段階で決めておきましょう。",
    body: `
<h2>何を記録するか</h2>
<table class="tb-table">
<tr><th>種類</th><th>内容</th><th>使い道</th></tr>
<tr><td>状態</td><td>運転・待ち (材料待ち・払出し待ち)・停止・段取り・保全、変化した時刻</td><td>稼働率・OEE の自動計算</td></tr>
<tr><td>サイクルタイム</td><td>1 サイクルごと、できれば工程の動作ごと</td><td>速度ロス、動作の劣化の検知</td></tr>
<tr><td>アラーム</td><td>番号・発生/解除時刻・リトライ回数</td><td>チョコ停のパレート分析、MTBF/MTTR</td></tr>
<tr><td>工程値</td><td>圧入荷重、締付けトルク、温度、測定値と合否</td><td>品質の追跡、工程能力の監視</td></tr>
<tr><td>状態監視</td><td>モータ電流、振動、エア流量</td><td>予知保全</td></tr>
</table>
<p>状態は「待ち」と「停止」を区別するのが大切です。材料待ちは装置の問題ではないので、混ぜると装置の改善点が見えなくなります。</p>

<svg class="tb-chart" viewBox="0 0 520 240" role="img" aria-label="装置から制御器、エッジ機器、サーバ、ダッシュボードへのデータの流れ">
<rect class="k-ground" x="10" y="190" width="200" height="10"/><line class="k-edge" x1="10" y1="190" x2="210" y2="190"/>
<g class="k-shadow">
<rect class="k-part" x="20" y="150" width="130" height="40" rx="4"/>
<rect class="k-alu" x="26" y="80" width="118" height="72" rx="6"/>
<rect class="k-glass" x="36" y="92" width="64" height="48" rx="3"/>
<rect class="k-alu" x="160" y="110" width="40" height="80" rx="3"/>
<rect class="k-part" x="250" y="120" width="60" height="34" rx="4"/>
<rect class="k-alu" x="360" y="70" width="56" height="90" rx="4"/>
<rect class="k-part" x="436" y="40" width="74" height="54" rx="4"/>
</g>
<rect class="k-screen" x="440" y="44" width="66" height="44" rx="2"/>
<rect x="446" y="70" width="8" height="14" style="fill:var(--tb-good)"/><rect x="458" y="62" width="8" height="22" style="fill:var(--tb-good)"/><rect x="470" y="74" width="8" height="10" style="fill:var(--tb-bad)"/><rect x="482" y="58" width="8" height="26" style="fill:var(--tb-good)"/>
<text class="k-screen-t" x="473" y="54" text-anchor="middle">OEE</text>
<rect class="k-part" x="468" y="94" width="10" height="16"/>
<rect class="k-led-g" x="166" y="120" width="8" height="6" rx="1"/><rect class="k-led-g" x="178" y="120" width="8" height="6" rx="1"/><rect class="k-led-off" x="190" y="120" width="6" height="6" rx="1"/>
<rect class="k-led-g" x="260" y="130" width="8" height="6" rx="1"/>
<line class="k-thin" x1="368" y1="90" x2="408" y2="90"/><line class="k-thin" x1="368" y1="110" x2="408" y2="110"/><line class="k-thin" x1="368" y1="130" x2="408" y2="130"/>
<rect class="k-led-g" x="370" y="96" width="6" height="5" rx="1"/><rect class="k-led-g" x="370" y="116" width="6" height="5" rx="1"/>
<path class="k-copper" d="M200,150 C220,150 230,137 250,137" fill="none" stroke-width="3" style="stroke:var(--tb-accent)"/>
<line class="k-move" x1="312" y1="137" x2="356" y2="137" marker-end="url(#k-arrow-blue)"/>
<line class="k-move" x1="418" y1="80" x2="434" y2="70" marker-end="url(#k-arrow-blue)"/>
<line class="k-hidden" x1="330" y1="30" x2="330" y2="200"/>
<text class="tick" x="320" y="214" text-anchor="end">現場ネットワーク</text>
<text class="tick" x="340" y="214">上位ネットワーク</text>
<text class="lbl" x="85" y="216" text-anchor="middle">装置 + 制御器</text>
<text class="lbl" x="280" y="176" text-anchor="middle">エッジ機器</text>
<text class="lbl" x="388" y="178" text-anchor="middle">サーバ</text>
<text class="lbl" x="472" y="128" text-anchor="middle">ダッシュボード</text>
<text class="tick" x="280" y="30" text-anchor="middle">境界で分離 (ファイアウォール)</text>
</svg>
<p class="tb-caption">図: 制御器から直接上位へつなぐのではなく、エッジ機器で集約・変換し、ネットワークの境界で分離する</p>

<h2>トレーサビリティ — シリアル番号で紐付ける</h2>
<p>ワークやパレットに 2 次元コードや RFID で<b>シリアル番号</b>を付け、各工程で読み取って、工程値・使った部品のロット・時刻・装置番号を紐付けて記録します。不良が見つかったとき「同じ条件で作られたのはどれか」を絞り込めるので、回収の範囲を最小にできます。読み取りに失敗したワークは先へ流さず排出する、という設計が必要です。</p>

<h2>状態監視と予知保全</h2>
<p>軸受の損傷は振動の増加として、ボールねじの潤滑不足やガイドのかじりはモータ電流の増加として、故障の前に現れます。<b>平常時の値 (ベースライン) を記録</b>し、そこからの変化をしきい値で監視するのが基本です。周期で部品を交換する<b>予防保全</b>に対し、状態を見て必要なときに交換するのが<b>予知保全</b>です。</p>
<svg class="tb-chart" viewBox="0 0 520 240" role="img" aria-label="モータに付けた振動センサと振動値の傾向グラフ">
<g class="k-shadow">
<rect class="k-part" x="20" y="120" width="90" height="56" rx="8"/>
<rect class="k-part" x="16" y="176" width="100" height="10" rx="2"/>
<rect class="k-part-h" x="110" y="138" width="50" height="20" rx="2"/>
<rect class="k-yellow" x="50" y="104" width="22" height="16" rx="3"/>
</g>
<line class="k-thin" x1="24" y1="130" x2="24" y2="168"/><line class="k-thin" x1="34" y1="130" x2="34" y2="168"/><line class="k-thin" x1="44" y1="130" x2="44" y2="168"/>
<path class="k-copper" d="M61,104 C61,80 100,70 130,70" fill="none" stroke-width="2.5" style="stroke:var(--k-line-2)"/>
<text class="lbl" x="20" y="60">振動センサ</text>
<text class="tick" x="65" y="206" text-anchor="middle">モータ</text>
<line class="k-edge" x1="200" y1="190" x2="500" y2="190"/>
<line class="k-edge" x1="200" y1="40" x2="200" y2="190"/>
<line x1="200" y1="90" x2="500" y2="90" style="stroke:var(--tb-bad)" stroke-width="1.5" stroke-dasharray="6 4"/>
<line x1="200" y1="120" x2="500" y2="120" style="stroke:var(--tb-warn)" stroke-width="1.5" stroke-dasharray="6 4"/>
<polyline points="205,160 225,158 245,162 265,157 285,159 305,156 325,158 345,152 365,148 385,140 405,132 425,121 445,110 465,96 485,80" fill="none" style="stroke:var(--tb-accent)" stroke-width="2.2"/>
<circle cx="425" cy="121" r="4" style="fill:var(--tb-warn)"/>
<text class="tick" x="208" y="84">停止しきい値</text>
<text class="tick" x="208" y="114">注意しきい値</text>
<text class="tick" x="260" y="176">ベースライン</text>
<text class="mark-t" x="418" y="140" text-anchor="end">ここで交換を計画</text>
<text class="tick" x="500" y="206" text-anchor="end">運転時間 →</text>
<text class="tick" x="196" y="36" text-anchor="end">振動</text>
</svg>
<p class="tb-caption">図: 注意しきい値を超えた時点で部品を手配し、計画停止で交換する。突発停止を計画停止に変えるのが目的</p>

<h2>ダッシュボード</h2>
<p>現場の大画面には「今止まっているか・理由・今日の実績と目標の差」だけを大きく表示し、詳しい分析 (パレート、傾向) は事務所の画面に分けます。見る人と、その人が取る行動から表示を決めます。</p>

<h2>データ量の見積もり</h2>
<div class="tb-example">
<p><b>計算例</b>: 装置 20 台、サイクルタイム 10 s、24 時間稼働。1 サイクルの記録 (シリアル番号・時刻・工程値 20 項目など) を 200 バイトとします。さらに振動波形を 10 kHz・2 バイト/点で 1 秒分、10 分ごとに保存します。</p>
<p>サイクル記録: 86,400 ÷ 10 × 20 台 × 200 B = <b>34.6 MB/日</b><br>
振動波形: 10,000 × 2 B × 144 回 × 20 台 = <b>57.6 MB/日</b><br>
合計 92.2 MB/日 → 1 年で約 <b>33.6 GB</b></p>
<p>波形を連続で保存すると 10,000 × 2 × 86,400 × 20 ≈ 34.6 GB/日 と 600 倍になります。波形はエッジで特徴量 (実効値・ピーク値) に変換し、異常時だけ生波形を残すのが一般的です。保存期間は製品の保証期間などから決めます。</p>
</div>

<h2>セキュリティの基本</h2>
<ul>
<li>制御ネットワークと事務ネットワークを分け、境界をファイアウォールで守る。装置から外部へ直接つながない</li>
<li>初期パスワードを必ず変更し、使わないサービス・ポートを閉じる</li>
<li>データ収集は読み出し専用を基本とし、遠隔からの書き込み・運転指令は原則として行わない</li>
<li>USB メモリなどの持込み媒体を管理し、プログラムのバックアップと変更履歴を残す</li>
</ul>

<h3>よくある失敗</h3>
<ul>
<li>「とりあえず全部」記録して、必要なデータが探せず、ストレージが溢れる</li>
<li>装置ごとに時刻がずれていて、工程をまたいだ追跡ができない (時刻同期を忘れる)</li>
<li>ベースラインを取らずに振動センサを付け、しきい値を決められない</li>
<li>保守用の遠隔接続を常時開放のまま残す</li>
</ul>`,
    points: [
      "状態・サイクルタイム・アラーム・工程値・状態監視値を記録する。待ちと停止は区別",
      "シリアル番号で工程値・部品ロット・時刻を紐付けると、不良の範囲を絞れる",
      "ベースラインからの変化を監視し、突発停止を計画停止に変える",
      "波形はエッジで特徴量に変換。データ量は事前に見積もる",
      "ネットワークを分離し、初期パスワード変更・読み出し専用・時刻同期",
    ],
    exercises: [
      {
        q: "装置 10 台、サイクルタイム 5 s、1 日 16 時間稼働、1 サイクルの記録 500 バイトです。1 日と 1 年 (250 日稼働) のデータ量を求めてください。",
        a: "1 台 1 日のサイクル数 = 16 × 3,600 ÷ 5 = 11,520。<br>1 日: 11,520 × 10 × 500 B = <b>57.6 MB</b>。<br>1 年: 57.6 × 250 = <b>14.4 GB</b>。",
      },
      {
        q: "ある軸受の振動 (実効値) のベースラインは 1.0 mm/s で、注意しきい値 2.5 mm/s、停止しきい値 4.5 mm/s です。最近 1 週間で 1.8 → 2.6 mm/s と一定の割合で上がっています。このまま直線的に増えると、停止しきい値まであと何日ですか。どう対応すべきですか。",
        a: "増加率 = (2.6 − 1.8) ÷ 7 ≈ 0.114 mm/s/日。残り = (4.5 − 2.6) ÷ 0.114 ≈ <b>17 日</b>。注意しきい値を超えたので、交換部品を手配し、17 日より前の計画停止で交換します。損傷が進むと増加が加速することが多いので、監視の頻度を上げ、直線の見込みより早めに計画します。",
      },
    ],
    quiz: [
      { q: "稼働状態を記録するとき、区別すべきなのは?", choices: ["材料待ちと装置の停止", "午前と午後", "作業者の名前"], answer: 0, explain: "待ちは装置の問題ではないため、混ぜると装置の改善点が見えなくなります。" },
      { q: "予知保全の基本となる考え方は?", choices: ["平常時のベースラインからの変化を監視する", "決まった周期で全部品を交換する", "壊れてから交換する"], answer: 0, explain: "状態を監視し、変化から交換時期を判断します。" },
      { q: "装置データ収集のセキュリティとして適切なのは?", choices: ["制御ネットワークを分離し、境界で守る", "便利なので装置を直接インターネットに接続する", "初期パスワードを共有して使う"], answer: 0, explain: "ネットワーク分離、パスワード変更、読み出し専用が基本です。" },
    ],
  },
];
