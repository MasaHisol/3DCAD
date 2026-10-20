import type { TextChapter } from "../types";

export const BASICS: TextChapter[] = [
  {
    id: "process",
    part: "basics",
    title: "設計とは何か — 設計のプロセス",
    minutes: 15,
    level: 1,
    lead: "設計は「形を描くこと」ではなく、要求を満たす解を決めて、作れる情報にまとめる一連の仕事です。全体の流れと、それぞれの段階で決めることを押さえましょう。",
    body: `
<h2>設計の流れ</h2>
<p>機械・製品の設計は、おおむね次の順に進みます。前の段階に戻ってやり直すことは珍しくありません (<b>反復</b>が前提)。</p>
<ol class="tb-flow">
  <li><b>要求の把握</b> — 誰が・何のために・どこで使うか。性能・コスト・納期・法規などの条件を集める</li>
  <li><b>仕様の決定</b> — 要求を「数値で確認できる」仕様に落とす (例: 定格荷重 500 N、質量 2 kg 以下)</li>
  <li><b>構想設計</b> — 機能を分解し、実現方法の案を複数出して比較・選定する。おおまかな配置と主要寸法を決める</li>
  <li><b>基本設計</b> — 強度・剛性・動作を計算し、材料・主要部品 (モーター・軸受など) を選ぶ</li>
  <li><b>詳細設計</b> — 部品ごとの形状・寸法・公差・表面性状・材料を決め、3D モデルと図面にする</li>
  <li><b>検証</b> — 計算・解析・試作・試験で、仕様を満たすか確かめる。設計審査 (デザインレビュー)</li>
  <li><b>製造・改善</b> — 量産での問題や使用者の声をフィードバックして改良する</li>
</ol>
<svg class="tb-chart" viewBox="0 0 520 170" role="img" aria-label="設計の流れと反復">
<g class="k-shadow"><rect class="" x="12" y="66" width="64" height="40" rx="8" style="fill:var(--tb-accent);fill-opacity:0.10;stroke:var(--tb-accent);stroke-width:1.4"/></g>
<text class="lbl" x="44" y="91" text-anchor="middle" style="fill:var(--tb-text)">要求</text>
<line class="" x1="76" y1="86" x2="84" y2="86" style="stroke:var(--k-line)" stroke-width="1.6"/>
<g class="k-shadow"><rect class="" x="84" y="66" width="64" height="40" rx="8" style="fill:var(--tb-accent);fill-opacity:0.15;stroke:var(--tb-accent);stroke-width:1.4"/></g>
<text class="lbl" x="116" y="91" text-anchor="middle" style="fill:var(--tb-text)">仕様</text>
<line class="" x1="148" y1="86" x2="156" y2="86" style="stroke:var(--k-line)" stroke-width="1.6"/>
<g class="k-shadow"><rect class="" x="156" y="66" width="64" height="40" rx="8" style="fill:var(--tb-accent);fill-opacity:0.20;stroke:var(--tb-accent);stroke-width:1.4"/></g>
<text class="lbl" x="188" y="91" text-anchor="middle" style="fill:var(--tb-text)">構想</text>
<line class="" x1="220" y1="86" x2="228" y2="86" style="stroke:var(--k-line)" stroke-width="1.6"/>
<g class="k-shadow"><rect class="" x="228" y="66" width="64" height="40" rx="8" style="fill:var(--tb-accent);fill-opacity:0.25;stroke:var(--tb-accent);stroke-width:1.4"/></g>
<text class="lbl" x="260" y="91" text-anchor="middle" style="fill:var(--tb-text)">基本</text>
<line class="" x1="292" y1="86" x2="300" y2="86" style="stroke:var(--k-line)" stroke-width="1.6"/>
<g class="k-shadow"><rect class="" x="300" y="66" width="64" height="40" rx="8" style="fill:var(--tb-accent);fill-opacity:0.30;stroke:var(--tb-accent);stroke-width:1.4"/></g>
<text class="lbl" x="332" y="91" text-anchor="middle" style="fill:var(--tb-text)">詳細</text>
<line class="" x1="364" y1="86" x2="372" y2="86" style="stroke:var(--k-line)" stroke-width="1.6"/>
<g class="k-shadow"><rect class="" x="372" y="66" width="64" height="40" rx="8" style="fill:var(--tb-accent);fill-opacity:0.35;stroke:var(--tb-accent);stroke-width:1.4"/></g>
<text class="lbl" x="404" y="91" text-anchor="middle" style="fill:var(--tb-text)">検証</text>
<line class="" x1="436" y1="86" x2="444" y2="86" style="stroke:var(--k-line)" stroke-width="1.6"/>
<g class="k-shadow"><rect class="" x="444" y="66" width="64" height="40" rx="8" style="fill:var(--tb-accent);fill-opacity:0.40;stroke:var(--tb-accent);stroke-width:1.4"/></g>
<text class="lbl" x="476" y="91" text-anchor="middle" style="fill:var(--tb-text)">製造</text>
<path class="k-move" d="M404,64 C404,24 188,24 188,62" style="stroke-dasharray:6 4"/>
<text class="tick" x="296" y="30" text-anchor="middle" style="fill:var(--tb-accent)">反復: 問題があれば前の段階へ戻る</text>
<path class="k-move" d="M394,64 C394,44 260,44 260,62" style="stroke-dasharray:3 3"/>
<path class="k-move" d="M476,108 C476,150 44,150 44,110" style="stroke:var(--tb-good);marker-end:url(#k-arrow-green);stroke-dasharray:6 4"/>
<text class="tick" x="260" y="162" text-anchor="middle" style="fill:var(--tb-good)">使用者の声・量産の問題をフィードバック</text>
</svg>
<p class="tb-caption">図: 設計は一方通行ではなく、検証の結果や使用者の声で前の段階へ戻りながら進む</p>
<h2>QCD — 設計で同時に満たすべき 3 つ</h2>
<table class="tb-table">
  <tr><th>Q (Quality) 品質</th><td>機能・性能・信頼性・安全性・使いやすさ・見た目</td></tr>
  <tr><th>C (Cost) コスト</th><td>材料費・加工費・組立費・検査費、さらに運用・保守・廃棄まで (ライフサイクルコスト)</td></tr>
  <tr><th>D (Delivery) 納期</th><td>開発期間、部品の調達期間、生産のしやすさ</td></tr>
</table>
<p>製品コストの 7〜8 割は<b>設計段階で決まる</b>と言われます。形・材料・部品点数・公差を決めた時点で、作り方とコストがほぼ決まるからです。
「後で現場が工夫する」ことはできても、設計で決めたコストを大きく下げることは困難です。</p>
<svg class="tb-chart" viewBox="0 0 520 220" role="img" aria-label="コストは設計段階で決まる">
<rect class="" x="70" y="24" width="240" height="156" rx="0" style="fill:var(--tb-accent);fill-opacity:0.07"/>
<text class="k-note" x="80" y="40">設計段階</text>
<line class="axis" x1="70" y1="180" x2="480" y2="180"/>
<line class="axis" x1="70" y1="180" x2="70" y2="20"/>
<line class="grid" x1="70" y1="56" x2="480" y2="56"/>
<line class="grid" x1="70" y1="118" x2="480" y2="118"/>
<text class="tick" x="64" y="60" text-anchor="end">80%</text>
<text class="tick" x="64" y="122" text-anchor="end">40%</text>
<text class="tick" x="64" y="184" text-anchor="end">0</text>
<text class="tick" x="110" y="196" text-anchor="middle">構想</text>
<text class="tick" x="190" y="196" text-anchor="middle">基本</text>
<text class="tick" x="270" y="196" text-anchor="middle">詳細</text>
<text class="tick" x="350" y="196" text-anchor="middle">試作</text>
<text class="tick" x="430" y="196" text-anchor="middle">製造</text>
<path d="M70,180 C110,120 160,80 230,66 C290,56 360,46 470,36" style="fill:none;stroke:var(--tb-accent)" stroke-width="2.8"/>
<path d="M70,180 C200,178 280,172 320,160 C380,140 430,80 470,36" style="fill:none;stroke:var(--tb-warn);stroke-dasharray:7 4" stroke-width="2.6"/>
<text class="mark-t" x="150" y="146" style="fill:var(--tb-accent)">決まるコスト (累積)</text>
<text class="mark-t" x="372" y="160" style="fill:var(--tb-warn)">実際に使う費用 (累積)</text>
<circle class="mark" cx="310" cy="54" r="5"/>
<text class="k-bad-t" x="300" y="100" text-anchor="end">設計が終わる頃に</text>
<text class="k-bad-t" x="300" y="116" text-anchor="end">7〜8 割が決まる</text>
<text class="lbl" x="480" y="214" text-anchor="end">開発の段階</text>
<text class="lbl" x="76" y="16">製品コスト</text>
</svg>
<p class="tb-caption">図: 製品コストが決まる時期と、実際に費用が出ていく時期のずれ (模式図)。安く変更できるのは設計段階</p>
<h2>3D CAD は設計のどこで使うか</h2>
<ul>
  <li><b>構想設計</b>: 主要部品をラフな形状で配置し、干渉や大きさを確認 (スケルトン・レイアウト)</li>
  <li><b>詳細設計</b>: パラメトリックに部品を作り、アセンブリで組み、図面を作成</li>
  <li><b>検証</b>: 質量・重心、干渉解析、応力解析、動作のシミュレーション</li>
  <li><b>製造</b>: STEP・STL・DXF・G コードなど、製造に必要なデータの出力</li>
</ul>
<div class="tb-tip"><b>設計者の心得</b>: 図面に書いたことだけが作られ、書かなかったことは作る人の判断に任されます。「当然こうなるはず」は通じないと考え、
必要な情報 (寸法・公差・材料・処理・注記) をもれなく伝えることが設計の責任です。</div>`,
    points: ["設計 = 要求 → 仕様 → 構想 → 基本 → 詳細 → 検証 の反復", "仕様は数値で確認できる形にする", "コストの大半は設計段階で決まる (QCD を同時に考える)", "図面に書いたことだけが作られる"],
    exercises: [
      {
        q: "「軽くて丈夫な椅子」という要求を、確認できる仕様に書き直してください (3 項目以上)。",
        a: "例: ① 耐荷重 1000 N の静荷重で破損・永久変形しない (JIS S 1203 などの試験に合格)、② 質量 4 kg 以下、③ 座面高さ 420±10 mm、④ 販売価格 1 万円以下 (製造原価 4000 円以下)。「軽い」「丈夫」を数値と試験方法で表すのがポイントです。",
      },
    ],
    quiz: [
      { q: "製品コストの大部分が決まるのは、どの段階?", choices: ["設計段階", "製造段階", "販売段階"], answer: 0, explain: "形状・材料・部品点数・公差を決めた時点で加工方法とコストの大部分が決まります。" },
      { q: "「仕様」として最も適切なものは?", choices: ["なるべく静かにする", "運転音 45 dB(A) 以下 (1 m 離れて測定)", "他社より静かにする"], answer: 1, explain: "仕様は測定方法を含めて数値で確認できる形にします。" },
      { q: "構想設計で行うことは?", choices: ["ねじ穴の公差を決める", "機能を実現する方式の案を比較・選定する", "部品の表面性状を決める"], answer: 1, explain: "構想設計では方式の比較と全体配置・主要寸法を決めます。公差や表面性状は詳細設計で決めます。" },
    ],
    lessons: ["1-1", "1-2"],
  },
  {
    id: "concept",
    part: "basics",
    title: "要求仕様と構想設計 — アイデアを選ぶ",
    minutes: 15,
    level: 1,
    lead: "良い設計は良い構想から生まれます。機能を分解し、複数の案を出し、根拠をもって選ぶ方法を学びます。",
    body: `
<h2>機能を分解する</h2>
<p>製品の全体機能を「〜を〜する」という形で、より小さな機能に分けていきます (<b>機能ブロック図</b>)。
例えば「卓上ボール盤」なら、次のようになります。</p>
<pre class="tb-pre">穴をあける
├─ 工具を回す ……… モーター、ベルト / 歯車で減速
├─ 工具を送る ……… レバー + ラック・ピニオン、戻しばね
├─ 工作物を保持する … テーブル、バイス
└─ 安全を保つ ……… カバー、非常停止スイッチ</pre>
<svg class="tb-chart" viewBox="0 0 520 240" role="img" aria-label="卓上ボール盤の機能と部品">
<rect class="k-ground" x="24" y="226" width="196" height="10"/><line class="k-edge" x1="24" y1="226" x2="220" y2="226"/>
<g class="k-shadow"><rect class="k-part" x="36" y="208" width="172" height="18" rx="3"/><rect class="k-part-h" x="78" y="46" width="18" height="162"/><rect class="k-alu" x="104" y="168" width="96" height="10" rx="2"/><rect class="k-part" x="94" y="164" width="14" height="18" rx="2"/><rect class="k-part" x="122" y="152" width="60" height="16" rx="2"/><rect class="k-alu" x="66" y="60" width="128" height="50" rx="10"/><rect class="k-plastic" x="66" y="38" width="128" height="24" rx="8"/><rect class="k-part" x="30" y="40" width="38" height="40" rx="4"/><rect class="k-part-h" x="146" y="110" width="14" height="30" rx="2"/><path class="k-part-h" d="M150,140 L156,140 L156,156 L153,162 L150,156 Z"/></g>
<line class="k-thin" x1="34" y1="46" x2="64" y2="46"/><line class="k-thin" x1="34" y1="52" x2="64" y2="52"/><line class="k-thin" x1="34" y1="58" x2="64" y2="58"/><line class="k-thin" x1="34" y1="64" x2="64" y2="64"/><line class="k-thin" x1="34" y1="70" x2="64" y2="70"/><line class="k-thin" x1="34" y1="76" x2="64" y2="76"/>
<line class="" x1="186" y1="90" x2="222" y2="126" style="stroke:var(--k-line)" stroke-width="4" stroke-linecap="round"/>
<circle class="k-sphere" cx="224" cy="128" r="6"/>
<circle class="" cx="178" cy="76" r="6" style="fill:var(--tb-bad);stroke:var(--k-line)"/>
<line class="k-thin" x1="104" y1="50" x2="270" y2="50"/>
<circle class="" cx="104" cy="50" r="3" style="fill:var(--tb-accent)"/>
<circle class="k-badge" cx="282" cy="50" r="10" style="fill:var(--tb-accent)"/><text class="k-badge-t" x="282" y="54" text-anchor="middle">1</text><text class="k-title" x="300" y="54">工具を回す</text>
<text class="k-note" x="300" y="68">モーター、ベルト / 歯車で減速</text>
<line class="k-thin" x1="214" y1="112" x2="270" y2="98"/>
<circle class="" cx="214" cy="112" r="3" style="fill:var(--tb-accent)"/>
<circle class="k-badge" cx="282" cy="98" r="10" style="fill:var(--tb-accent)"/><text class="k-badge-t" x="282" y="102" text-anchor="middle">2</text><text class="k-title" x="300" y="102">工具を送る</text>
<text class="k-note" x="300" y="116">レバー + ラック・ピニオン、戻しばね</text>
<line class="k-thin" x1="152" y1="166" x2="270" y2="146"/>
<circle class="" cx="152" cy="166" r="3" style="fill:var(--tb-accent)"/>
<circle class="k-badge" cx="282" cy="146" r="10" style="fill:var(--tb-accent)"/><text class="k-badge-t" x="282" y="150" text-anchor="middle">3</text><text class="k-title" x="300" y="150">工作物を保持する</text>
<text class="k-note" x="300" y="164">テーブル、バイス</text>
<line class="k-thin" x1="178" y1="76" x2="270" y2="194"/>
<circle class="" cx="178" cy="76" r="3" style="fill:var(--tb-accent)"/>
<circle class="k-badge" cx="282" cy="194" r="10" style="fill:var(--tb-accent)"/><text class="k-badge-t" x="282" y="198" text-anchor="middle">4</text><text class="k-title" x="300" y="198">安全を保つ</text>
<text class="k-note" x="300" y="212">カバー、非常停止スイッチ</text>
<text class="k-title" x="270" y="22">全体機能: 穴をあける</text>
</svg>
<p class="tb-caption">図: 卓上ボール盤の機能分解。1 つの機能に、それを実現する部品 (実現方法) が対応する</p>
<p>分解した機能ごとに実現方法の候補を並べると (<b>形態マトリクス</b>)、組み合わせで多くの案を系統的に作れます。</p>
<h2>案を評価する — 重み付き評価表</h2>
<p>案を感覚で選ぶと、声の大きい人の案が通りがちです。評価項目と重みを先に決め、点数を付けて比較します。</p>
<table class="tb-table">
  <tr><th>評価項目 (重み)</th><th>案 A ベルト</th><th>案 B 歯車</th><th>案 C 直結</th></tr>
  <tr><td>コスト (3)</td><td>4</td><td>2</td><td>5</td></tr>
  <tr><td>騒音 (2)</td><td>4</td><td>2</td><td>3</td></tr>
  <tr><td>変速のしやすさ (2)</td><td>5</td><td>3</td><td>1</td></tr>
  <tr><td>保守性 (1)</td><td>3</td><td>4</td><td>5</td></tr>
  <tr><th>合計 (点 × 重み)</th><th>3·4+2·4+2·5+1·3 = <b>33</b></th><th>6+4+6+4 = 20</th><th>15+6+2+5 = 28</th></tr>
</table>
<svg class="tb-chart" viewBox="0 0 520 190" role="img" aria-label="重み付き評価の内訳">
<text class="lbl" x="92" y="68" text-anchor="end">案 A ベルト</text>
<rect class="" x="100" y="50" width="132" height="26" rx="0" style="fill:var(--tb-accent);fill-opacity:0.55;stroke:var(--tb-surface);stroke-width:1.5"/>
<text class="tick" x="166" y="67" text-anchor="middle" style="fill:var(--tb-text)">12</text>
<rect class="" x="232" y="50" width="88" height="26" rx="0" style="fill:var(--tb-good);fill-opacity:0.55;stroke:var(--tb-surface);stroke-width:1.5"/>
<text class="tick" x="276" y="67" text-anchor="middle" style="fill:var(--tb-text)">8</text>
<rect class="" x="320" y="50" width="110" height="26" rx="0" style="fill:var(--tb-warn);fill-opacity:0.55;stroke:var(--tb-surface);stroke-width:1.5"/>
<text class="tick" x="375" y="67" text-anchor="middle" style="fill:var(--tb-text)">10</text>
<rect class="" x="430" y="50" width="33" height="26" rx="0" style="fill:var(--tb-text-3);fill-opacity:0.55;stroke:var(--tb-surface);stroke-width:1.5"/>
<text class="tick" x="446.5" y="67" text-anchor="middle" style="fill:var(--tb-text)">3</text>
<text class="mark-t" x="471" y="68" style="fill:var(--tb-good)">33 点</text>
<text class="lbl" x="92" y="110" text-anchor="end">案 B 歯車</text>
<rect class="" x="100" y="92" width="66" height="26" rx="0" style="fill:var(--tb-accent);fill-opacity:0.55;stroke:var(--tb-surface);stroke-width:1.5"/>
<text class="tick" x="133" y="109" text-anchor="middle" style="fill:var(--tb-text)">6</text>
<rect class="" x="166" y="92" width="44" height="26" rx="0" style="fill:var(--tb-good);fill-opacity:0.55;stroke:var(--tb-surface);stroke-width:1.5"/>
<text class="tick" x="188" y="109" text-anchor="middle" style="fill:var(--tb-text)">4</text>
<rect class="" x="210" y="92" width="66" height="26" rx="0" style="fill:var(--tb-warn);fill-opacity:0.55;stroke:var(--tb-surface);stroke-width:1.5"/>
<text class="tick" x="243" y="109" text-anchor="middle" style="fill:var(--tb-text)">6</text>
<rect class="" x="276" y="92" width="44" height="26" rx="0" style="fill:var(--tb-text-3);fill-opacity:0.55;stroke:var(--tb-surface);stroke-width:1.5"/>
<text class="tick" x="298" y="109" text-anchor="middle" style="fill:var(--tb-text)">4</text>
<text class="mark-t" x="328" y="110">20 点</text>
<text class="lbl" x="92" y="152" text-anchor="end">案 C 直結</text>
<rect class="" x="100" y="134" width="165" height="26" rx="0" style="fill:var(--tb-accent);fill-opacity:0.55;stroke:var(--tb-surface);stroke-width:1.5"/>
<text class="tick" x="182.5" y="151" text-anchor="middle" style="fill:var(--tb-text)">15</text>
<rect class="" x="265" y="134" width="66" height="26" rx="0" style="fill:var(--tb-good);fill-opacity:0.55;stroke:var(--tb-surface);stroke-width:1.5"/>
<text class="tick" x="298" y="151" text-anchor="middle" style="fill:var(--tb-text)">6</text>
<rect class="" x="331" y="134" width="22" height="26" rx="0" style="fill:var(--tb-warn);fill-opacity:0.55;stroke:var(--tb-surface);stroke-width:1.5"/>
<rect class="" x="353" y="134" width="55" height="26" rx="0" style="fill:var(--tb-text-3);fill-opacity:0.55;stroke:var(--tb-surface);stroke-width:1.5"/>
<text class="tick" x="380.5" y="151" text-anchor="middle" style="fill:var(--tb-text)">5</text>
<text class="mark-t" x="416" y="152">28 点</text>
<rect class="" x="100" y="18" width="12" height="12" rx="2" style="fill:var(--tb-accent);fill-opacity:0.55"/>
<text class="tick" x="116" y="28">コスト ×3</text>
<rect class="" x="192" y="18" width="12" height="12" rx="2" style="fill:var(--tb-good);fill-opacity:0.55"/>
<text class="tick" x="208" y="28">騒音 ×2</text>
<rect class="" x="284" y="18" width="12" height="12" rx="2" style="fill:var(--tb-warn);fill-opacity:0.55"/>
<text class="tick" x="300" y="28">変速 ×2</text>
<rect class="" x="376" y="18" width="12" height="12" rx="2" style="fill:var(--tb-text-3);fill-opacity:0.55"/>
<text class="tick" x="392" y="28">保守 ×1</text>
<line class="axis" x1="100" y1="44" x2="100" y2="182"/>
</svg>
<p class="tb-caption">図: 上の評価表を「点 × 重み」の積み上げで見たもの。どの項目で差がついたかがひと目でわかる</p>
<p>評価表は「正解を出す機械」ではなく、<b>判断の根拠を見える化</b>して議論するための道具です。重みを変えると結論が変わる場合は、その項目について追加の検討が必要です。</p>
<h2>仕様書に書くこと</h2>
<ul>
  <li><b>目的と使用条件</b>: 使用者、使用場所 (温度・湿度・屋内外)、使用頻度・寿命</li>
  <li><b>性能</b>: 荷重・速度・精度・容量など (数値と測定方法)</li>
  <li><b>制約</b>: 大きさ・質量・電源・コスト・生産数量・納期</li>
  <li><b>法規・規格</b>: 安全規格、電気用品安全法、JIS / ISO など</li>
  <li><b>必須 (Must) と希望 (Want)</b> の区別 — 必須を満たさない案は評価以前に除外する</li>
</ul>
<div class="tb-tip"><b>3D CAD での構想</b>: 最初から細部を作り込まず、主要部品を直方体や円柱で置いて配置と大きさを確認しましょう。
主要寸法をユーザ パラメータにしておくと、案の比較や後の変更が楽になります。</div>`,
    points: ["全体機能を小さな機能に分解し、それぞれの実現方法を並べる", "評価項目と重みを先に決め、点数で比較して根拠を残す", "仕様は Must (必須) と Want (希望) を分ける", "構想段階の CAD は簡単な形と主要パラメータで"],
    exercises: [
      {
        q: "上の評価表で「騒音」の重みを 2 → 4 に変えると、案 A と案 C の合計点はそれぞれ何点になりますか?",
        a: "案 A: 3·4 + 4·4 + 2·5 + 1·3 = 12 + 16 + 10 + 3 = <b>41 点</b>、案 C: 3·5 + 4·3 + 2·1 + 1·5 = 15 + 12 + 2 + 5 = <b>34 点</b>。どちらも増えますが、騒音で優れる案 A の差が広がります。",
      },
    ],
    quiz: [
      { q: "機能分解の書き方として適切なのは?", choices: ["モーター", "工具を回す", "アルミ製"], answer: 1, explain: "機能は「〜を〜する」の形で書きます。モーターやアルミは実現手段・材料です。" },
      { q: "重み付き評価表を使う一番の目的は?", choices: ["計算で自動的に正解を出す", "判断の根拠を見える化して議論する", "案の数を増やす"], answer: 1, explain: "評価は前提 (重み・点数) の置き方で変わります。根拠を共有して議論するための道具です。" },
    ],
  },
  {
    id: "drawing",
    part: "basics",
    title: "機械製図の基礎 — 図面で正しく伝える",
    minutes: 20,
    level: 1,
    lead: "図面は設計者と製作者の共通言語です。JIS の機械製図 (JIS B 0001) の基本ルールを、投影法・線・寸法・表面性状・幾何公差の順に学びます。",
    body: `
<h2>投影法 — 第三角法</h2>
<p>日本の機械製図は<b>第三角法</b>です。正面図を基準に、上から見た図 (平面図) を<b>上</b>に、右から見た図 (右側面図) を<b>右</b>に置きます。
欧州などで使われる<b>第一角法</b>は逆の配置になるため、表題欄に投影法の記号を必ず入れます。</p>
<ul>
  <li>正面図には、部品の特徴が最もよく表れる向きを選ぶ (加工時の置き方に合わせることも多い)</li>
  <li>必要最小限の図で表す。円筒部品なら正面図 1 つ + 直径記号 φ で足りることもある</li>
  <li>隠れ線が多くなるときは断面図にする</li>
</ul>
<svg class="tb-chart" viewBox="0 0 520 270" role="img" aria-label="第三角法の配置">
<line class="k-thin" x1="60" y1="140" x2="60" y2="104" style="stroke-dasharray:3 3"/>
<line class="k-thin" x1="100" y1="140" x2="100" y2="104" style="stroke-dasharray:3 3"/>
<line class="k-thin" x1="140" y1="140" x2="140" y2="104" style="stroke-dasharray:3 3"/>
<line class="k-thin" x1="146" y1="150" x2="176" y2="150" style="stroke-dasharray:3 3"/>
<line class="k-thin" x1="146" y1="180" x2="176" y2="180" style="stroke-dasharray:3 3"/>
<line class="k-thin" x1="146" y1="200" x2="176" y2="200" style="stroke-dasharray:3 3"/>
<path class="k-edge" d="M60,60 H140 V100 H60 Z" style="fill:var(--tb-surface)"/>
<line class="k-edge" x1="100" y1="60" x2="100" y2="100"/>
<path class="k-edge" d="M60,200 H140 V180 H100 V150 H60 Z" style="fill:var(--tb-surface)"/>
<path class="k-edge" d="M180,150 H220 V200 H180 Z" style="fill:var(--tb-surface)"/>
<line class="k-edge" x1="180" y1="180" x2="220" y2="180"/>
<text class="lbl" x="100" y="50" text-anchor="middle">平面図 (上)</text>
<text class="lbl" x="100" y="220" text-anchor="middle">正面図</text>
<text class="lbl" x="200" y="220" text-anchor="middle">右側面図 (右)</text>
<path class="k-part" d="M405,29.5 L448.3,54.5 L405,79.5 L361.7,54.5 Z"/>
<path class="k-part" d="M448.3,92 L491.6,117 L448.3,142 L405,117 Z"/>
<path class="k-alu" d="M448.3,92 L405,117 L405,79.5 L448.3,54.5 Z"/>
<path class="k-alu" d="M491.6,142 L448.3,167 L448.3,142 L491.6,117 Z"/>
<path d="M361.7,117 L448.3,167 L448.3,142 L405,117 L405,79.5 L361.7,54.5 Z" style="fill:var(--k-steel-3);stroke:var(--k-line);stroke-width:1.6"/>
<line class="k-move" x1="330" y1="196" x2="360" y2="170"/>
<text class="k-note" x="326" y="210" text-anchor="middle">正面</text>
<rect class="k-panel" x="370" y="206" width="140" height="46" rx="8"/>
<path class="k-edge" d="M386,216 L414,210 L414,242 L386,236 Z"/>
<line class="k-center" x1="378" y1="226" x2="422" y2="226"/>
<circle class="k-edge" cx="446" cy="226" r="16"/>
<circle class="k-edge" cx="446" cy="226" r="10"/>
<line class="k-center" x1="424" y1="226" x2="468" y2="226"/>
<line class="k-center" x1="446" y1="204" x2="446" y2="248"/>
<text class="k-note" x="440" y="264" text-anchor="middle">第三角法の記号</text>
</svg>
<p class="tb-caption">図: 第三角法。正面図を基準に、上から見た図を上に、右から見た図を右に置く。表題欄には投影法の記号を入れる</p>
<h2>線の種類と用途</h2>
<table class="tb-table">
  <tr><th>線</th><th>用途</th></tr>
  <tr><td>太い実線</td><td>外形線 (見える輪郭)</td></tr>
  <tr><td>細い実線</td><td>寸法線・寸法補助線・引出線・ハッチング</td></tr>
  <tr><td>細い破線</td><td>かくれ線 (見えない輪郭)</td></tr>
  <tr><td>細い一点鎖線</td><td>中心線・基準線・ピッチ線</td></tr>
  <tr><td>細い二点鎖線</td><td>想像線 (隣接部品・可動範囲・加工前の形)</td></tr>
  <tr><td>細い一点鎖線 (端部と曲がり角を太く)</td><td>切断線</td></tr>
</table>
<h2>寸法記入の原則</h2>
<ol>
  <li><b>機能・加工・検査に必要な寸法</b>を記入する (図から測らせない)</li>
  <li><b>重複させない</b>。同じ寸法を 2 か所に書くと、改訂時に片方だけ直して矛盾が生じる</li>
  <li><b>基準 (データム) から</b>記入する。加工・測定の基準面から寸法を入れると誤差が累積しにくい</li>
  <li>計算しなくても読めるようにする (全長・穴位置など)</li>
  <li>関連する寸法は 1 つの図にまとめ、外形線から離して見やすく配置する</li>
</ol>
<svg class="tb-chart" viewBox="0 0 520 226" role="img" aria-label="直列寸法と基準からの寸法">
<rect class="k-panel" x="8" y="8" width="244" height="210" rx="8"/>
<rect class="k-panel" x="268" y="8" width="244" height="210" rx="8"/>
<circle class="k-badge" cx="28" cy="28" r="10" style="fill:var(--tb-bad)"/><text class="k-badge-t" x="28" y="32" text-anchor="middle">✕</text><text class="k-title" x="46" y="32">直列に記入</text>
<circle class="k-badge" cx="288" cy="28" r="10" style="fill:var(--tb-good)"/><text class="k-badge-t" x="288" y="32" text-anchor="middle">✓</text><text class="k-title" x="306" y="32">基準 (データム) から</text>
<g class="k-shadow"><rect class="k-alu" x="30" y="100" width="200" height="40" rx="2"/></g>
<circle class="" cx="60" cy="120" r="7" style="fill:var(--tb-surface);stroke:var(--k-line);stroke-width:1.4"/>
<line class="k-center" x1="60" y1="106" x2="60" y2="134"/>
<circle class="" cx="120" cy="120" r="7" style="fill:var(--tb-surface);stroke:var(--k-line);stroke-width:1.4"/>
<line class="k-center" x1="120" y1="106" x2="120" y2="134"/>
<circle class="" cx="180" cy="120" r="7" style="fill:var(--tb-surface);stroke:var(--k-line);stroke-width:1.4"/>
<line class="k-center" x1="180" y1="106" x2="180" y2="134"/>
<line class="k-ext" x1="30" y1="98" x2="30" y2="54"/>
<line class="k-ext" x1="60" y1="110" x2="60" y2="54"/>
<line class="k-ext" x1="120" y1="110" x2="120" y2="54"/>
<line class="k-ext" x1="180" y1="110" x2="180" y2="54"/>
<line class="k-dimline" x1="30" y1="80" x2="60" y2="80"/>
<text class="k-dimtext" x="45" y="75" text-anchor="middle">10</text>
<line class="k-dimline" x1="60" y1="80" x2="120" y2="80"/>
<text class="k-dimtext" x="90" y="75" text-anchor="middle">20</text>
<line class="k-dimline" x1="120" y1="80" x2="180" y2="80"/>
<text class="k-dimtext" x="150" y="75" text-anchor="middle">20</text>
<g class="k-shadow"><rect class="k-alu" x="290" y="100" width="200" height="40" rx="2"/></g>
<circle class="" cx="320" cy="120" r="7" style="fill:var(--tb-surface);stroke:var(--k-line);stroke-width:1.4"/>
<line class="k-center" x1="320" y1="106" x2="320" y2="134"/>
<circle class="" cx="380" cy="120" r="7" style="fill:var(--tb-surface);stroke:var(--k-line);stroke-width:1.4"/>
<line class="k-center" x1="380" y1="106" x2="380" y2="134"/>
<circle class="" cx="440" cy="120" r="7" style="fill:var(--tb-surface);stroke:var(--k-line);stroke-width:1.4"/>
<line class="k-center" x1="440" y1="106" x2="440" y2="134"/>
<line class="k-ext" x1="290" y1="98" x2="290" y2="54"/>
<line class="k-ext" x1="320" y1="110" x2="320" y2="54"/>
<line class="k-ext" x1="380" y1="110" x2="380" y2="54"/>
<line class="k-ext" x1="440" y1="110" x2="440" y2="54"/>
<line class="k-dimline" x1="290" y1="92" x2="320" y2="92"/>
<text class="k-dimtext" x="305" y="88" text-anchor="middle">10</text>
<line class="k-dimline" x1="290" y1="76" x2="380" y2="76"/>
<text class="k-dimtext" x="355" y="72" text-anchor="middle">30</text>
<line class="k-dimline" x1="290" y1="60" x2="440" y2="60"/>
<text class="k-dimtext" x="405" y="56" text-anchor="middle">50</text>
<path d="M290,150 L280,160 L300,160 Z" style="fill:var(--k-line)"/>
<line class="k-edge" x1="290" y1="140" x2="290" y2="150"/>
<rect class="k-edge" x="280" y="160" width="20" height="16" rx="0" style="fill:var(--tb-surface)"/>
<text class="lbl" x="290" y="172" text-anchor="middle">A</text>
<text class="k-note" x="130" y="166" text-anchor="middle">穴 3 の位置は 3 つの公差の和</text>
<text class="k-bad-t" x="130" y="184" text-anchor="middle">→ 誤差が累積する</text>
<text class="k-note" x="400" y="196" text-anchor="middle">どの穴も基準から 1 つの公差</text>
<text class="k-good-t" x="400" y="212" text-anchor="middle">→ 累積しない</text>
</svg>
<p class="tb-caption">図: 同じ穴位置の 2 通りの寸法記入。加工・測定の基準面から記入すると、誤差が積み重ならない</p>
<p>記号: <code>φ</code> 直径、<code>R</code> 半径、<code>□</code> 正方形の辺、<code>C</code> 45° 面取り、<code>t</code> 板厚、<code>SR</code> 球の半径。穴は「4×φ6.6 キリ」「M6 深さ 12」のように個数と加工法を添えます。</p>
<h2>普通公差</h2>
<p>個々に公差を書かない寸法には、<b>普通公差</b> (JIS B 0405) を表題欄付近に指示します。例えば「普通公差 JIS B 0405-m (中級)」では次のとおりです。</p>
<table class="tb-table">
  <tr><th>基準寸法 (mm)</th><td>0.5〜6</td><td>6〜30</td><td>30〜120</td><td>120〜400</td><td>400〜1000</td></tr>
  <tr><th>許容差 (中級 m)</th><td>±0.1</td><td>±0.2</td><td>±0.3</td><td>±0.5</td><td>±0.8</td></tr>
</table>
<h2>表面性状</h2>
<p>面の粗さは算術平均粗さ <b>Ra</b> (µm) などで指示します。細かいほど加工に時間と費用がかかるので、機能に必要な面だけを細かくします。</p>
<table class="tb-table">
  <tr><th>Ra の目安</th><th>加工法・用途</th></tr>
  <tr><td>12.5〜25</td><td>荒加工、のこ切断、ガス切断 — 機能に関係しない面</td></tr>
  <tr><td>3.2〜6.3</td><td>一般的なフライス・旋削 — 一般の接触面</td></tr>
  <tr><td>0.8〜1.6</td><td>精密な旋削・研削 — はめあい面、摺動面</td></tr>
  <tr><td>0.1〜0.4</td><td>研削・ラップ — 軸受の転動面、シール面</td></tr>
</table>
<h2>幾何公差 (入門)</h2>
<p>寸法公差は「大きさ」を規制しますが、<b>形・向き・位置</b>は規制できません。例えば長さが公差内でも、面が反っていたり穴が傾いていたりします。これを規制するのが幾何公差です。</p>
<ul>
  <li><b>形状</b>: 平面度・真直度・真円度・円筒度 (データム不要)</li>
  <li><b>姿勢</b>: 平行度・直角度・傾斜度 (データムに対して)</li>
  <li><b>位置</b>: 位置度・同軸度・対称度</li>
  <li><b>振れ</b>: 円周振れ・全振れ (回転部品)</li>
</ul>
<p>公差記入枠は <code>[記号 | 公差値 | データム]</code> の順に書きます。例: <code>[⊥ | 0.02 | A]</code> = データム A に対する直角度 0.02 mm。</p>
<div class="tb-tip"><b>3D CAD との関係</b>: 3D モデルは「形」を正確に表しますが、公差・表面性状・材料・処理の指示は図面 (または 3D アノテーション) で伝えます。
3DCAD Studio では「図面ビュー」から投影図・断面図・寸法・表面性状・幾何公差・表題欄を作成できます。</div>`,
    points: ["JIS は第三角法 (平面図は上、右側面図は右)", "外形線は太い実線、かくれ線は破線、中心線は一点鎖線", "寸法は機能・加工・検査に必要なものを、基準から、重複なく", "普通公差で一般寸法を、個別公差・幾何公差・表面性状で重要部を指示"],
    exercises: [
      {
        q: "長さ 80 mm の寸法 (個別の公差なし) は、普通公差 JIS B 0405-m で何 mm から何 mm の範囲に仕上げればよいですか?",
        a: "30〜120 mm の区分なので ±0.3 mm。<b>79.7〜80.3 mm</b> です。",
      },
      {
        q: "ある部品で、両端の穴の距離を「左端から各穴」と「穴と穴の間」の両方に記入しました。何が問題ですか?",
        a: "寸法の<b>重複</b>です。3 つの寸法のうち 1 つは他の 2 つから決まるため、公差によっては両立しなくなり、改訂時に片方だけ直すと矛盾します。機能上重要な寸法を残し、他方は参考寸法 (かっこ付き) にします。",
      },
    ],
    quiz: [
      { q: "かくれ線に使う線は?", choices: ["細い破線", "細い一点鎖線", "太い実線"], answer: 0, explain: "見えない輪郭は破線で表します。一点鎖線は中心線です。" },
      { q: "寸法記入の原則として誤っているのは?", choices: ["基準面から記入する", "読みやすいように同じ寸法を複数の図に書く", "加工・検査に必要な寸法を記入する"], answer: 1, explain: "寸法の重複は矛盾の原因になるため避けます。" },
      { q: "穴が面に対して傾いていないことを規制したい。使う幾何公差は?", choices: ["真円度", "直角度", "平面度"], answer: 1, explain: "データム面に対する穴の軸の向きは直角度で規制します。" },
      { q: "はめあい面の表面性状として一般的な値は?", choices: ["Ra 25", "Ra 1.6", "Ra 0.025"], answer: 1, explain: "はめあい・摺動面は Ra 0.8〜1.6 程度が一般的です。必要以上に細かくするとコストが上がります。" },
    ],
    lessons: ["6-1"],
  },
  {
    id: "tolerance",
    part: "basics",
    title: "公差とはめあい — ばらつきを設計する",
    minutes: 20,
    level: 2,
    lead: "どんな加工にもばらつきがあります。公差は「どこまでずれても機能するか」を設計者が決めて伝えるもの。はめあいと公差の積み上げを計算できるようになりましょう。",
    body: `
<h2>寸法公差の考え方</h2>
<p><code>20 ±0.1</code> と書くと、19.9〜20.1 mm の範囲なら合格です。公差を<b>小さくするほど加工・検査のコストは急に上がります</b>。
機能に必要な所だけ厳しく、それ以外は普通公差にするのが基本です。</p>
<h2>はめあい (ISO 286 / JIS B 0401)</h2>
<p>穴と軸を組み合わせるとき、すきまのでき方で 3 種類に分けます。</p>
<ul>
  <li><b>すきまばめ</b> — 必ずすきまがある。回転・摺動する部分 (例: H7/g6, H7/f7)</li>
  <li><b>中間ばめ</b> — すきまにもしめしろにもなりうる。位置決めピン、軸受の取付 (例: H7/k6, H7/js6)</li>
  <li><b>しまりばめ</b> — 必ずしめしろがある。圧入して固定 (例: H7/p6)</li>
</ul>
<svg class="tb-chart" viewBox="0 0 520 250" role="img" aria-label="はめあいの公差域">
<rect class="" x="40" y="82" width="460" height="38" rx="0" style="fill:var(--tb-accent);fill-opacity:0.06"/>
<line class="" x1="30" y1="120" x2="500" y2="120" style="stroke:var(--k-line)" stroke-width="1.6"/>
<text class="k-note" x="34" y="136">基準寸法 (0 線)</text>
<line class="k-move" x1="22" y1="110" x2="22" y2="60" style="stroke:var(--k-line-2);marker-end:url(#k-arrow)"/>
<line class="k-move" x1="22" y1="130" x2="22" y2="180" style="stroke:var(--k-line-2);marker-end:url(#k-arrow)"/>
<text class="lbl" x="14" y="76" text-anchor="middle">+</text>
<text class="lbl" x="14" y="172" text-anchor="middle">−</text>
<g class="k-shadow"><rect class="k-accent" x="60" y="82" width="60" height="38" rx="2"/></g>
<text class="lbl" x="90" y="106" text-anchor="middle" style="fill:#fff">H7</text>
<text class="k-title" x="90" y="70" text-anchor="middle">穴</text>
<g class="k-shadow"><rect class="" x="190" y="128" width="50" height="26" rx="2" style="fill:var(--tb-good);fill-opacity:0.55;stroke:var(--tb-good);stroke-width:1.4"/></g>
<text class="lbl" x="215" y="146" text-anchor="middle" style="fill:var(--tb-text)">g6</text>
<text class="k-title" x="215" y="200" text-anchor="middle" style="fill:var(--tb-good)">すきまばめ</text>
<circle class="k-cut" cx="215" cy="226" r="14"/>
<circle class="k-part" cx="215" cy="226" r="7" style="fill:var(--tb-surface)"/>
<circle class="k-part-h" cx="215" cy="226" r="7"/>
<g class="k-shadow"><rect class="" x="300" y="96" width="50" height="30" rx="2" style="fill:var(--tb-warn);fill-opacity:0.55;stroke:var(--tb-warn);stroke-width:1.4"/></g>
<text class="lbl" x="325" y="116" text-anchor="middle" style="fill:var(--tb-text)">k6</text>
<text class="k-title" x="325" y="200" text-anchor="middle" style="fill:var(--tb-warn)">中間ばめ</text>
<circle class="k-cut" cx="325" cy="226" r="14"/>
<circle class="k-part" cx="325" cy="226" r="11" style="fill:var(--tb-surface)"/>
<circle class="k-part-h" cx="325" cy="226" r="11"/>
<g class="k-shadow"><rect class="" x="410" y="44" width="50" height="28" rx="2" style="fill:var(--tb-bad);fill-opacity:0.55;stroke:var(--tb-bad);stroke-width:1.4"/></g>
<text class="lbl" x="435" y="63" text-anchor="middle" style="fill:var(--tb-text)">p6</text>
<text class="k-title" x="435" y="200" text-anchor="middle" style="fill:var(--tb-bad)">しまりばめ</text>
<circle class="k-cut" cx="435" cy="226" r="14"/>
<circle class="k-part" cx="435" cy="226" r="14"/>
<circle class="k-part-h" cx="435" cy="226" r="14.6"/>
<text class="k-note" x="130" y="232" text-anchor="end">軸穴の例 →</text>
</svg>
<p class="tb-caption">図: 穴 H7 の公差域 (青) に対する軸の公差域の位置で、はめあいの種類が決まる (位置関係の模式図。幅は実寸ではない)</p>
<p>公差クラスは<b>記号 (位置) + 数字 (等級 IT)</b> で表します。大文字は穴、小文字は軸。等級の数字が小さいほど公差幅が小さく精密です。
穴の公差を H に固定して軸で調整する<b>穴基準はめあい</b>が一般的です (リーマなど穴の工具の種類を減らせるため)。</p>
<div data-widget="fit"></div>
<h2>公差の積み上げ</h2>
<p>部品を何個も重ねると、全体の寸法のばらつきは足し合わさります。</p>
<div class="tb-formula">ワーストケース: T = t₁ + t₂ + … + tₙ<br>二乗和平方根 (RSS): T = √(t₁² + t₂² + … + tₙ²)</div>
<p>ワーストケースは全部品が同時に最悪の値になる場合で、確実ですが公差が厳しくなります。
実際には全部が同時に端に寄ることはまれなので、量産品では統計的な <b>RSS</b> で評価することも多いです (各寸法が正規分布で、平均が中央にある前提)。</p>
<svg class="tb-chart" viewBox="0 0 520 232" role="img" aria-label="公差の積み上げ">
<g class="k-shadow"><path class="k-cut" d="M30,40 H50 V120 H470 V40 H490 V140 H30 Z"/></g>
<g class="k-shadow"><rect class="k-alu" x="51" y="58" width="98" height="60" rx="3"/></g>
<text class="lbl" x="100" y="92" text-anchor="middle">部品 1</text>
<text class="k-dimtext" x="100" y="108" text-anchor="middle">±0.1</text>
<g class="k-shadow"><rect class="k-alu" x="151" y="58" width="98" height="60" rx="3"/></g>
<text class="lbl" x="200" y="92" text-anchor="middle">部品 2</text>
<text class="k-dimtext" x="200" y="108" text-anchor="middle">±0.1</text>
<g class="k-shadow"><rect class="k-alu" x="251" y="58" width="98" height="60" rx="3"/></g>
<text class="lbl" x="300" y="92" text-anchor="middle">部品 3</text>
<text class="k-dimtext" x="300" y="108" text-anchor="middle">±0.1</text>
<g class="k-shadow"><rect class="k-alu" x="351" y="58" width="98" height="60" rx="3"/></g>
<text class="lbl" x="400" y="92" text-anchor="middle">部品 4</text>
<text class="k-dimtext" x="400" y="108" text-anchor="middle">±0.1</text>
<rect class="" x="450" y="58" width="20" height="60" rx="0" style="fill:var(--tb-warn);fill-opacity:0.3"/>
<text class="k-note" x="460" y="24" text-anchor="middle">すきま</text>
<line class="k-ext" x1="450" y1="60" x2="450" y2="30"/>
<line class="k-ext" x1="470" y1="60" x2="470" y2="30"/>
<line class="k-dimline" x1="436" y1="36" x2="450" y2="36" style="marker-start:none"/>
<line class="k-dimline" x1="484" y1="36" x2="470" y2="36" style="marker-start:none"/>
<text class="lbl" x="80" y="172">ワーストケース</text>
<rect class="" x="190" y="160" width="240" height="16" rx="3" style="fill:var(--tb-bad);fill-opacity:0.45"/>
<text class="k-bad-t" x="436" y="173">±0.4</text>
<text class="lbl" x="80" y="200">RSS (統計)</text>
<rect class="" x="250" y="188" width="120" height="16" rx="3" style="fill:var(--tb-good);fill-opacity:0.45"/>
<text class="k-good-t" x="376" y="201">±0.2</text>
<line class="k-center" x1="310" y1="154" x2="310" y2="210"/>
<text class="k-note" x="310" y="224" text-anchor="middle">すきまのばらつき</text>
</svg>
<p class="tb-caption">図: ±0.1 の部品 4 個が並ぶと、すきまのばらつきはワーストケースで ±0.4、RSS で √4 × 0.1 = ±0.2</p>
<div data-widget="stack"></div>
<div class="tb-tip"><b>設計のコツ</b>: 積み上げが厳しいときは、公差を締めるより<b>連鎖する部品の数を減らす</b>か、<b>調整機構</b> (シム・長穴) を設けるほうが安くつくことが多いです。
3DCAD Studio の「検査 → 公差累積」ではワーストケース・RSS・モンテカルロを計算できます。</div>`,
    points: ["公差は機能に必要な所だけ厳しく — 厳しいほど高価", "すきまばめ・中間ばめ・しまりばめ (H7/g6, H7/k6, H7/p6)", "穴基準はめあいが一般的", "積み上げはワーストケースと RSS。部品点数を減らすのが根本対策"],
    exercises: [
      {
        q: "φ20 H7/g6 の最大すきまと最小すきまを求めてください。(H7: +0.021 / 0、g6: −0.007 / −0.020)",
        a: "最大すきま = 穴の最大 − 軸の最小 = 20.021 − 19.980 = <b>0.041 mm</b>。最小すきま = 穴の最小 − 軸の最大 = 20.000 − 19.993 = <b>0.007 mm</b>。必ずすきまがあるので、すきまばめです。",
      },
      {
        q: "公差 ±0.05 mm の部品を 4 枚重ねたとき、合計の公差をワーストケースと RSS で求めてください。",
        a: "ワーストケース: 4 × 0.05 = <b>±0.20 mm</b>。RSS: √4 × 0.05 = <b>±0.10 mm</b>。",
      },
    ],
    quiz: [
      { q: "軸受の内輪を軸に固定したい。一般的に選ぶのは?", choices: ["すきまばめ", "中間ばめ〜しまりばめ", "公差なし"], answer: 1, explain: "回転荷重を受ける内輪はクリープを防ぐため、k6・m6 などの中間ばめ〜軽いしまりばめにします。" },
      { q: "H7 の「H」は何を表す?", choices: ["穴の公差域の位置 (下の許容差 = 0)", "硬さ", "高精度"], answer: 0, explain: "H は穴の公差域の位置を表し、下の許容差が 0 (基準寸法から上側) になります。7 は IT 等級です。" },
      { q: "部品 9 個 (各 ±0.1) の積み上げを RSS で見積もると?", choices: ["±0.9", "±0.3", "±0.1"], answer: 1, explain: "√9 × 0.1 = 0.3 mm です。" },
    ],
  },
  {
    id: "materials",
    part: "basics",
    title: "材料の選び方",
    minutes: 15,
    level: 1,
    lead: "材料は強さだけで選ぶものではありません。剛性・重さ・加工性・耐食性・コストのバランスを、代表的な材料の数値で比べてみましょう。",
    body: `
<h2>材料選定で見る項目</h2>
<table class="tb-table">
  <tr><th>ヤング率 E</th><td>変形のしにくさ (剛性)。鋼 約 206 GPa、アルミ 約 70 GPa — 同じ形ならアルミは鋼の約 3 倍たわむ</td></tr>
  <tr><th>降伏点 σy / 引張強さ σB</th><td>永久変形が始まる応力 / 破断する応力。強度設計の基準</td></tr>
  <tr><th>密度 ρ</th><td>質量。鋼 7.85、アルミ 2.7、樹脂 1〜1.4 g/cm³</td></tr>
  <tr><th>加工性</th><td>切削しやすさ (快削材)、曲げやすさ、溶接性、成形性</td></tr>
  <tr><th>耐食性・耐熱性</th><td>さび・薬品・温度。ステンレス・アルミ・樹脂の使い分け</td></tr>
  <tr><th>コスト・入手性</th><td>材料単価 × 質量 + 加工費。規格材 (定尺・標準の板厚) を使うと安く早い</td></tr>
</table>
<svg class="tb-chart" viewBox="0 0 520 176" role="img" aria-label="同じ形の鋼とアルミのたわみ">
<rect class="k-panel" x="8" y="8" width="244" height="160" rx="8"/><text class="k-title" x="130" y="30" text-anchor="middle">鋼 (E ≈ 206 GPa)</text><rect class="k-ground" x="26" y="50" width="12" height="60"/><line class="k-edge" x1="38" y1="50" x2="38" y2="110"/><path class="k-hidden" d="M38,80 Q138,80 218,90" style="stroke:var(--tb-bad)"/><g class="k-shadow"><rect class="k-part" x="38" y="74" width="180" height="12" rx="1"/></g><line class="k-force" x1="212" y1="40" x2="212" y2="70"/><text class="mark-t" x="198" y="52" text-anchor="end" style="fill:var(--tb-bad)">F</text><line class="k-ext" x1="224" y1="86" x2="240" y2="86"/><line class="k-ext" x1="224" y1="102" x2="240" y2="102"/><line class="k-dimline" x1="236" y1="86" x2="236" y2="102"/><text class="k-dimtext" x="168" y="124" text-anchor="middle">たわみ δ</text>
<rect class="k-panel" x="268" y="8" width="244" height="160" rx="8"/><text class="k-title" x="390" y="30" text-anchor="middle">アルミ (E ≈ 70 GPa)</text><rect class="k-ground" x="286" y="50" width="12" height="60"/><line class="k-edge" x1="298" y1="50" x2="298" y2="110"/><path class="k-hidden" d="M298,80 Q398,80 478,110" style="stroke:var(--tb-bad)"/><g class="k-shadow"><rect class="k-alu" x="298" y="74" width="180" height="12" rx="1"/></g><line class="k-force" x1="472" y1="40" x2="472" y2="70"/><text class="mark-t" x="458" y="52" text-anchor="end" style="fill:var(--tb-bad)">F</text><line class="k-ext" x1="484" y1="86" x2="500" y2="86"/><line class="k-ext" x1="484" y1="122" x2="500" y2="122"/><line class="k-dimline" x1="496" y1="86" x2="496" y2="122"/><text class="k-dimtext" x="428" y="144" text-anchor="middle">たわみ ≈ 3δ</text>
</svg>
<p class="tb-caption">図: 同じ形・同じ荷重なら、たわみはヤング率に反比例する。アルミは鋼の約 3 倍たわむ (たわみは誇張して描いた)</p>
<h2>比剛性と比強度</h2>
<p>軽量化を考えるときは、密度あたりの値で比べます。</p>
<div class="tb-formula">比剛性 = E / ρ　　比強度 = σy / ρ</div>
<p>おもしろいことに、鋼・アルミ・チタンの<b>比剛性はほぼ同じ</b> (約 26 GPa/(g/cm³)) です。つまり、同じ質量で「たわみにくさ」を上げたいとき、材料を変えても効果は小さく、
<b>形 (断面) を工夫する</b>ほうがはるかに有効です (→ 構造力学「断面の形と剛性」)。一方、比強度は高強度アルミ合金やチタンが有利です。</p>
<svg class="tb-chart" viewBox="0 0 520 212" role="img" aria-label="比剛性の比較">
<rect class="k-panel" x="8.0" y="8" width="164" height="196" rx="8"/>
<text class="k-title" x="90" y="30" text-anchor="middle">ヤング率 E (GPa)</text>
<line class="axis" x1="24" y1="170" x2="156" y2="170"/>
<g class="k-shadow"><rect class="" x="32" y="61.4" width="30" height="108.6" rx="2" style="fill:var(--k-steel-3);fill-opacity:0.75;stroke:var(--k-line);stroke-width:1"/></g>
<text class="tick" x="47" y="55.4" text-anchor="middle" style="fill:var(--tb-text)">206</text>
<text class="tick" x="47" y="188" text-anchor="middle">鋼</text>
<g class="k-shadow"><rect class="" x="74" y="133.1" width="30" height="36.9" rx="2" style="fill:var(--tb-accent);fill-opacity:0.75;stroke:var(--k-line);stroke-width:1"/></g>
<text class="tick" x="89" y="127.1" text-anchor="middle" style="fill:var(--tb-text)">70</text>
<text class="tick" x="89" y="188" text-anchor="middle">アルミ</text>
<g class="k-shadow"><rect class="" x="116" y="109.9" width="30" height="60.1" rx="2" style="fill:var(--tb-warn);fill-opacity:0.75;stroke:var(--k-line);stroke-width:1"/></g>
<text class="tick" x="131" y="103.9" text-anchor="middle" style="fill:var(--tb-text)">114</text>
<text class="tick" x="131" y="188" text-anchor="middle">チタン</text>
<rect class="k-panel" x="179.3" y="8" width="164" height="196" rx="8"/>
<text class="k-title" x="261.3" y="30" text-anchor="middle">密度 ρ (g/cm³)</text>
<line class="axis" x1="195.3" y1="170" x2="327.3" y2="170"/>
<g class="k-shadow"><rect class="" x="203.3" y="61.6" width="30" height="108.4" rx="2" style="fill:var(--k-steel-3);fill-opacity:0.75;stroke:var(--k-line);stroke-width:1"/></g>
<text class="tick" x="218.3" y="55.6" text-anchor="middle" style="fill:var(--tb-text)">7.85</text>
<text class="tick" x="218.3" y="188" text-anchor="middle">鋼</text>
<g class="k-shadow"><rect class="" x="245.3" y="132.7" width="30" height="37.3" rx="2" style="fill:var(--tb-accent);fill-opacity:0.75;stroke:var(--k-line);stroke-width:1"/></g>
<text class="tick" x="260.3" y="126.7" text-anchor="middle" style="fill:var(--tb-text)">2.70</text>
<text class="tick" x="260.3" y="188" text-anchor="middle">アルミ</text>
<g class="k-shadow"><rect class="" x="287.3" y="108.8" width="30" height="61.2" rx="2" style="fill:var(--tb-warn);fill-opacity:0.75;stroke:var(--k-line);stroke-width:1"/></g>
<text class="tick" x="302.3" y="102.8" text-anchor="middle" style="fill:var(--tb-text)">4.43</text>
<text class="tick" x="302.3" y="188" text-anchor="middle">チタン</text>
<rect class="k-panel" x="350.6" y="8" width="164" height="196" rx="8"/>
<text class="k-title" x="432.6" y="30" text-anchor="middle">比剛性 E/ρ</text>
<line class="axis" x1="366.6" y1="170" x2="498.6" y2="170"/>
<g class="k-shadow"><rect class="" x="374.6" y="85.4" width="30" height="84.6" rx="2" style="fill:var(--k-steel-3);fill-opacity:0.75;stroke:var(--k-line);stroke-width:1"/></g>
<text class="tick" x="389.6" y="79.4" text-anchor="middle" style="fill:var(--tb-text)">26.2</text>
<text class="tick" x="389.6" y="188" text-anchor="middle">鋼</text>
<g class="k-shadow"><rect class="" x="416.6" y="86.5" width="30" height="83.5" rx="2" style="fill:var(--tb-accent);fill-opacity:0.75;stroke:var(--k-line);stroke-width:1"/></g>
<text class="tick" x="431.6" y="80.5" text-anchor="middle" style="fill:var(--tb-text)">25.9</text>
<text class="tick" x="431.6" y="188" text-anchor="middle">アルミ</text>
<g class="k-shadow"><rect class="" x="458.6" y="87.1" width="30" height="82.9" rx="2" style="fill:var(--tb-warn);fill-opacity:0.75;stroke:var(--k-line);stroke-width:1"/></g>
<text class="tick" x="473.6" y="81.1" text-anchor="middle" style="fill:var(--tb-text)">25.7</text>
<text class="tick" x="473.6" y="188" text-anchor="middle">チタン</text>
<text class="k-good-t" x="431" y="54" text-anchor="middle">ほぼ同じ</text>
</svg>
<p class="tb-caption">図: ヤング率と密度は材料で大きく違うが、比で見ると鋼・アルミ・チタンはほぼ同じ (チタンは Ti-6Al-4V の代表値)</p>
<div data-widget="materials"></div>
<h2>よく使う材料と使い分け</h2>
<ul>
  <li><b>SS400</b>: 安価で溶接しやすい一般構造用鋼。フレームやブラケット。強度保証は引張強さ (400 MPa 以上)</li>
  <li><b>S45C</b>: 焼入れ・焼戻しで強くなる機械構造用鋼。軸・歯車・ピン</li>
  <li><b>SUS304</b>: さびにくいが、加工硬化しやすく切削・穴あけに時間がかかる</li>
  <li><b>A5052</b>: 曲げやすく耐食性の良いアルミ板金材。<b>A6061</b>: 切削部品・フレームの定番。<b>A7075</b>: 高強度だが溶接に不向き</li>
  <li><b>樹脂</b>: ABS (外装)、PC (透明・耐衝撃)、POM (摺動・歯車)、PA (強靭だが吸水)</li>
</ul>
<div class="tb-tip"><b>3DCAD Studio</b>: 画面左上の材料リストで材料を設定すると、iProperties に質量が出ます。応力解析ではヤング率・降伏点が使われます。</div>`,
    points: ["剛性はヤング率、強度は降伏点・引張強さで比べる", "鋼・アルミ・チタンの比剛性はほぼ同じ — 剛性は形で稼ぐ", "加工性・耐食性・コスト・入手性も含めて選ぶ", "規格材 (定尺・標準板厚) を使うと安く早い"],
    exercises: [
      {
        q: "鋼 (E = 206 GPa) のはりをアルミ (E = 70 GPa) に替えると、同じ形・同じ荷重でたわみは何倍になりますか? また質量は何倍ですか?",
        a: "たわみは E に反比例するので 206 / 70 ≈ <b>2.9 倍</b>。質量は密度の比 2.7 / 7.85 ≈ <b>0.34 倍</b>です。同じたわみにするには断面を大きくする (高さを約 1.43 倍にすると I が約 2.9 倍) 必要があります。",
      },
    ],
    quiz: [
      { q: "同じ形の部品で、たわみが最も小さいのは?", choices: ["アルミ A6061", "鋼 SS400", "ABS 樹脂"], answer: 1, explain: "たわみはヤング率に反比例。鋼 206 > アルミ 69 > ABS 2.3 GPa です。" },
      { q: "曲げ加工する板金に向くアルミ合金は?", choices: ["A5052", "A7075", "C3604"], answer: 0, explain: "A5052 は成形性・耐食性が良く板金の定番です。A7075 は高強度ですが曲げ・溶接に不向き、C3604 は黄銅です。" },
      { q: "軽くてたわみにくい構造を作るのに最も効果的なのは?", choices: ["材料をチタンに替える", "断面の形を工夫する (中空・高さを大きく)", "表面を研削する"], answer: 1, explain: "金属の比剛性はほぼ同じなので、断面二次モーメントを大きくする形の工夫が効果的です。" },
    ],
    lessons: ["4-2"],
  },
  {
    id: "fastening",
    part: "basics",
    title: "締結 — ねじとボルトの設計",
    minutes: 20,
    level: 2,
    lead: "ねじは最もよく使う機械要素ですが、緩み・破損のトラブルも多い部品です。強度区分、締付力とトルク、穴の設計を学びます。",
    body: `
<h2>ボルトの強度区分</h2>
<p>鋼製ボルトの頭には <code>8.8</code> や <code>10.9</code> のような<b>強度区分</b>が刻印されています。</p>
<div class="tb-formula">8.8 → 引張強さ 8 × 100 = 800 MPa、降伏点 = 800 × 0.8 = 640 MPa</div>
<p>ナットは「8」「10」のようにボルトと組み合わせる区分を選びます。ステンレスボルトは <code>A2-70</code> (SUS304 相当、引張強さ 700 MPa) のように表します。</p>
<h2>締付力 (軸力) が締結の主役</h2>
<p>ボルトは「ピンのように」せん断で荷重を受けるのではなく、<b>締め付けて部材同士を押し付ける力 (軸力)</b>で、摩擦により荷重を支えるのが基本です。</p>
<ul>
  <li>軸力が外力より十分大きければ、継手は開かず、ボルトにかかる変動荷重も小さい → 疲労・緩みに強い</li>
  <li>目標軸力は保証荷重の 60〜70 % 程度が目安</li>
  <li>締付トルクと軸力の関係: <b>T = K · F · d</b> (K はトルク係数 約 0.2、潤滑状態で大きく変わる)</li>
</ul>
<svg class="tb-chart" viewBox="0 0 520 222" role="img" aria-label="ボルト締結の力の受け方">
<rect class="k-panel" x="8" y="8" width="244" height="206" rx="8"/><circle class="k-badge" cx="28" cy="28" r="10" style="fill:var(--tb-bad)"/><text class="k-badge-t" x="28" y="32" text-anchor="middle">✕</text><text class="k-title" x="46" y="32">せん断で受ける (ピン扱い)</text><g class="k-shadow"><rect class="k-cut" x="28" y="82" width="150" height="26"/><rect class="k-cut2" x="82" y="112" width="150" height="26"/></g><g class="k-shadow"><rect class="k-part-h" x="123" y="62" width="14" height="100"/><rect class="k-part" x="112" y="58" width="36" height="16" rx="2"/><rect class="k-part" x="112" y="140" width="36" height="16" rx="2"/></g><line class="k-force" x1="32" y1="95" x2="16" y2="95"/><line class="k-force" x1="228" y1="121" x2="244" y2="121"/><line class="" x1="123" y1="110" x2="137" y2="110" style="stroke:var(--tb-bad)" stroke-width="3"/><text class="k-bad-t" x="152" y="172" text-anchor="middle">ボルト軸がせん断される</text><text class="k-note" x="26" y="206">締付けが弱いと滑ってボルトに当たる</text>
<rect class="k-panel" x="268" y="8" width="244" height="206" rx="8"/><circle class="k-badge" cx="288" cy="28" r="10" style="fill:var(--tb-good)"/><text class="k-badge-t" x="288" y="32" text-anchor="middle">✓</text><text class="k-title" x="306" y="32">軸力 + 摩擦で受ける</text><g class="k-shadow"><rect class="k-cut" x="288" y="82" width="150" height="26"/><rect class="k-cut2" x="342" y="108" width="150" height="26"/></g><g class="k-shadow"><rect class="k-part-h" x="383" y="62" width="14" height="100"/><rect class="k-part" x="372" y="66" width="36" height="16" rx="2"/><rect class="k-part" x="372" y="134" width="36" height="16" rx="2"/></g><line class="k-force" x1="292" y1="95" x2="276" y2="95"/><line class="k-force" x1="488" y1="121" x2="504" y2="121"/><line class="k-move" x1="390" y1="54" x2="390" y2="66"/><line class="k-move" x1="360" y1="52" x2="360" y2="78"/><line class="k-move" x1="420" y1="52" x2="420" y2="78"/><line class="k-move" x1="360" y1="172" x2="360" y2="146"/><line class="k-move" x1="420" y1="172" x2="420" y2="146"/><line class="" x1="368" y1="104" x2="328" y2="104" style="stroke:var(--tb-good);marker-end:url(#k-arrow-green)" stroke-width="2.4"/><text class="k-note" x="286" y="192">締付力で押し付け、接触面の摩擦で</text><text class="k-note" x="286" y="206">外力を支える → 緩み・疲労に強い</text><text class="k-good-t" x="290" y="76">摩擦</text>
</svg>
<p class="tb-caption">図: 重ね継手のボルト。ボルトはピンのように軸で受けるのではなく、締付力 (軸力) で部材を押し付けて摩擦で支えるのが基本</p>
<div data-widget="bolt"></div>
<h2>穴の設計</h2>
<table class="tb-table">
  <tr><th>穴</th><th>M6 の例</th><th>ポイント</th></tr>
  <tr><td>キリ穴 (ボルトを通す)</td><td>φ6.6 (2 級)</td><td>位置ずれを吸収できる。精密な位置決めには使わない</td></tr>
  <tr><td>座ぐり</td><td>φ11 深さ 6.5</td><td>六角穴付きボルトの頭を沈める</td></tr>
  <tr><td>ねじ穴 (タップ)</td><td>下穴 φ5、M6</td><td>はめあい長さ: 鋼で 1d、鋳鉄 1.5d、アルミ 2d 以上</td></tr>
</table>
<svg class="tb-chart" viewBox="0 0 520 222" role="img" aria-label="ボルト穴の種類">
<rect class="k-panel" x="8.0" y="8" width="164" height="206" rx="8"/>
<text class="k-title" x="90" y="30" text-anchor="middle">キリ穴</text>
<text class="lbl" x="90" y="190" text-anchor="middle">φ6.6 (2 級)</text>
<text class="k-note" x="90" y="206" text-anchor="middle">ボルトを通す</text>
<rect class="k-panel" x="179.3" y="8" width="164" height="206" rx="8"/>
<text class="k-title" x="261.3" y="30" text-anchor="middle">座ぐり</text>
<text class="lbl" x="261.3" y="190" text-anchor="middle">φ11 深さ 6.5</text>
<text class="k-note" x="261.3" y="206" text-anchor="middle">ボルトの頭を沈める</text>
<rect class="k-panel" x="350.6" y="8" width="164" height="206" rx="8"/>
<text class="k-title" x="432.6" y="30" text-anchor="middle">ねじ穴 (タップ)</text>
<text class="lbl" x="432.6" y="190" text-anchor="middle">下穴 φ5、M6</text>
<text class="k-note" x="432.6" y="206" text-anchor="middle">鋼 1d・アルミ 2d 以上</text>
<g class="k-shadow"><path class="k-cut" d="M24,80 H80 V140 H24 Z"/><path class="k-cut" d="M100,80 H156 V140 H100 Z"/><path class="k-cut2" d="M24,140 H80 V164 H24 Z"/><path class="k-cut2" d="M100,140 H156 V164 H100 Z"/></g>
<rect class="k-part-h" x="83" y="60" width="14" height="118"/>
<rect class="k-part" x="74" y="164" width="32" height="12" rx="2"/>
<rect class="k-part" x="74" y="48" width="32" height="12" rx="2"/>
<line class="k-center" x1="90" y1="40" x2="90" y2="170"/>
<line class="k-dimline" x1="80" y1="70" x2="100" y2="70"/>
<line class="k-ext" x1="80" y1="72" x2="80" y2="80"/>
<line class="k-ext" x1="100" y1="72" x2="100" y2="80"/>
<g class="k-shadow"><path class="k-cut" d="M195,64 H247 V82 H253 V140 H195 Z"/><path class="k-cut" d="M269,140 V82 H275 V64 H327 V140 Z"/><path class="k-cut2" d="M195,140 H327 V164 H195 Z"/></g>
<rect class="k-part-h" x="255" y="64" width="12" height="100"/>
<rect class="k-part" x="249" y="66" width="24" height="15" rx="3"/>
<line class="k-center" x1="261" y1="50" x2="261" y2="170"/>
<line class="k-dimline" x1="247" y1="56" x2="275" y2="56"/>
<line class="k-ext" x1="247" y1="58" x2="247" y2="64"/>
<line class="k-ext" x1="275" y1="58" x2="275" y2="64"/>
<line class="k-ext" x1="281" y1="64" x2="301" y2="64"/>
<line class="k-ext" x1="281" y1="82" x2="301" y2="82"/>
<line class="k-dimline" x1="295" y1="64" x2="295" y2="82"/>
<text class="k-dimtext" x="301" y="78">深さ</text>
<g class="k-shadow"><path class="k-cut" d="M366,92 H424 V158 L432,164 L440,158 V92 H498 V172 H366 Z"/><path class="k-cut2" d="M366,72 H498 V92 H366 Z"/></g>
<rect class="k-part-h" x="426" y="52" width="12" height="90"/>
<rect class="k-part" x="416" y="40" width="32" height="12" rx="2"/>
<line class="k-thin" x1="422" y1="94" x2="426" y2="97"/><line class="k-thin" x1="438" y1="97" x2="442" y2="94"/><line class="k-thin" x1="422" y1="100" x2="426" y2="103"/><line class="k-thin" x1="438" y1="103" x2="442" y2="100"/><line class="k-thin" x1="422" y1="106" x2="426" y2="109"/><line class="k-thin" x1="438" y1="109" x2="442" y2="106"/><line class="k-thin" x1="422" y1="112" x2="426" y2="115"/><line class="k-thin" x1="438" y1="115" x2="442" y2="112"/><line class="k-thin" x1="422" y1="118" x2="426" y2="121"/><line class="k-thin" x1="438" y1="121" x2="442" y2="118"/><line class="k-thin" x1="422" y1="124" x2="426" y2="127"/><line class="k-thin" x1="438" y1="127" x2="442" y2="124"/><line class="k-thin" x1="422" y1="130" x2="426" y2="133"/><line class="k-thin" x1="438" y1="133" x2="442" y2="130"/><line class="k-thin" x1="422" y1="136" x2="426" y2="139"/><line class="k-thin" x1="438" y1="139" x2="442" y2="136"/><line class="k-thin" x1="422" y1="142" x2="426" y2="145"/><line class="k-thin" x1="438" y1="145" x2="442" y2="142"/><line class="k-thin" x1="422" y1="148" x2="426" y2="151"/><line class="k-thin" x1="438" y1="151" x2="442" y2="148"/>
<line class="k-center" x1="432" y1="34" x2="432" y2="176"/>
<line class="k-ext" x1="462" y1="92" x2="480" y2="92"/>
<line class="k-ext" x1="444" y1="142" x2="480" y2="142"/>
<line class="k-dimline" x1="474" y1="92" x2="474" y2="142"/>
<text class="k-dimtext" x="472" y="160" text-anchor="end" style="stroke:var(--tb-surface);stroke-width:3px">はめあい長さ</text>
</svg>
<p class="tb-caption">図: M6 ボルトの穴の断面。キリ穴は位置ずれを吸収し、座ぐりは頭を沈め、ねじ穴は材料が柔らかいほど長くかみ合わせる</p>
<h2>緩み対策</h2>
<ul>
  <li>まず<b>十分な軸力</b>で締める (最も効果的)。座面の陥没を防ぐため、柔らかい材料には平座金</li>
  <li>振動が大きい所: ねじロック剤、緩み止めナット、ダブルナット</li>
  <li>ばね座金の緩み止め効果は限定的とされています</li>
  <li>位置決めはボルトではなく<b>ピン (リーマ穴)</b>で行い、ボルトは締結に専念させる</li>
</ul>
<div class="tb-tip"><b>3DCAD Studio</b>: 穴コマンドでキリ穴・座ぐり・ねじ穴を規格寸法で作れます。「標準部品」には六角穴付きボルト・ナット・座金・ピンがあります。</div>`,
    points: ["強度区分 8.8 = 引張強さ 800 MPa・降伏点 640 MPa", "ボルトは軸力で締め付けて摩擦で荷重を支える", "締付トルク T = K·F·d (K ≈ 0.2)", "位置決めはピン、締結はボルト。ねじ穴のはめあい長さは材料で変える"],
    exercises: [
      {
        q: "M10 (有効断面積 58 mm²)、強度区分 8.8 (保証応力 600 MPa) のボルトを保証荷重の 70 % で締めます。軸力と締付トルク (K = 0.2) を求めてください。",
        a: "保証荷重 = 58 × 600 = 34 800 N。軸力 F = 0.7 × 34 800 ≈ <b>24.4 kN</b>。T = 0.2 × 24 360 N × 10 mm = 48 720 N·mm ≈ <b>48.7 N·m</b>。",
      },
    ],
    quiz: [
      { q: "強度区分 10.9 のボルトの降伏点は?", choices: ["900 MPa", "1000 MPa", "109 MPa"], answer: 0, explain: "引張強さ 1000 MPa × 0.9 = 900 MPa です。" },
      { q: "ボルト締結で最も効果的な緩み対策は?", choices: ["ばね座金を入れる", "適正な軸力で締め付ける", "ボルトを長くする"], answer: 1, explain: "十分な軸力で締めることが基本で最も効果的です。" },
      { q: "アルミ材にねじ穴を作るとき、はめあい長さの目安は?", choices: ["0.5d", "1d", "2d 以上"], answer: 2, explain: "柔らかい材料ではねじ山がせん断で抜けないよう、はめあい長さを長くします (アルミ 2d 程度)。" },
    ],
    lessons: ["3-2", "5-1"],
  },
];
