import type { TextChapter } from "../types";

export const UX2: TextChapter[] = [
  {
    id: "human-senses",
    part: "ux",
    title: "【初級】人の感覚と情報処理",
    minutes: 20,
    level: 1,
    lead: "人は目・耳・皮膚で情報を受け取り、判断して手足を動かします。感覚ごとの得意・不得意、反応時間を見積もるヒックの法則、注意と記憶の限界を知ると、表示や操作の設計の根拠が持てます。",
    body: `
<h2>情報処理の流れ</h2>
<p>人の情報処理は、おおまかに <b>知覚 (感覚) → 認知 (判断) → 運動 (操作)</b> の段階で考えると整理しやすくなります。どの段階にも時間と容量の限界があり、<b>注意</b>がその全体を配分しています。</p>
<svg class="tb-chart" viewBox="0 0 520 170" role="img" aria-label="人の情報処理モデル">

<rect x="140" y="10" width="230" height="24" rx="12" style="fill:var(--tb-warn);stroke:var(--tb-warn)" fill-opacity="0.15"/><text class="mark-t" x="255" y="27" text-anchor="middle">注意 (限られた資源を配分)</text>
<path d="M190,34 L190,48 M320,34 L320,48 M450,34 L370,22" class="guide" fill="none"/>
<g class="k-shadow"><rect class="k-panel" x="20" y="50" width="90" height="52"/><rect class="k-panel" x="140" y="50" width="100" height="52" style="stroke:var(--tb-accent)" stroke-width="1.6"/><rect class="k-panel" x="270" y="50" width="100" height="52" style="stroke:var(--tb-accent)" stroke-width="1.6"/><rect class="k-panel" x="400" y="50" width="100" height="52" style="stroke:var(--tb-accent)" stroke-width="1.6"/></g>
<text class="mark-t" x="65" y="81" text-anchor="middle">刺激</text>
<text class="mark-t" x="190" y="72" text-anchor="middle">知覚</text><text class="tick" x="190" y="90" text-anchor="middle">視・聴・触</text>
<text class="mark-t" x="320" y="72" text-anchor="middle">認知・判断</text><text class="tick" x="320" y="90" text-anchor="middle">記憶と照合</text>
<text class="mark-t" x="450" y="72" text-anchor="middle">運動</text><text class="tick" x="450" y="90" text-anchor="middle">手足で操作</text>
<path d="M112,76 L138,76 M242,76 L268,76 M372,76 L398,76" class="k-move"/>
<path d="M450,102 L450,136 L65,136 L65,104" class="k-hidden" style="marker-end:url(#k-arrow)"/>
<text class="tick" x="260" y="156" text-anchor="middle">操作の結果が次の刺激になる (フィードバック)</text>
<circle r="5" style="fill:var(--tb-accent)" class="k-glow"><animateMotion path="M65,76 L450,76 L450,136 L65,136 z" dur="6s" repeatCount="indefinite"/></circle>
</svg>
<p class="tb-caption">図: 知覚 → 認知 → 運動 の流れとフィードバックのループ。</p>
<h2>視覚・聴覚・触覚の特性</h2>
<table class="tb-table">
  <tr><th>感覚</th><th>得意なこと</th><th>苦手なこと・注意</th><th>設計での使い方</th></tr>
  <tr><td>視覚</td><td>大量の情報、位置・形・色、比較</td><td>見ていない所の変化に気づかない。視野の周辺は色や細部に弱いが動きには敏感</td><td>状態表示・数値・図。重要な変化は点滅や動きで</td></tr>
  <tr><td>聴覚</td><td>どの方向を向いていても届く、注意を引く</td><td>騒音でかき消される。複雑な情報は覚えきれない。高齢で高音が聞こえにくい</td><td>警報・確認音。音の種類は少なく</td></tr>
  <tr><td>触覚</td><td>見ずに位置や状態が分かる、手元で即時</td><td>情報量は少ない。手袋で弱まる</td><td>クリック感、凸点、形の違い、振動</td></tr>
</table>
<p>視野の中心 (中心視) でははっきり見えますが、数度離れると細部は急に見えにくくなります。そのため<b>重要な表示は視線の中心近く</b>に置き、周辺に置くなら点滅など動きで気づかせます。</p>
<svg class="tb-chart" viewBox="0 0 520 230" role="img" aria-label="視野の中心と周辺">

<path d="M260,180 L80,40 A230,230 0 0 1 440,40 z" style="fill:var(--tb-accent);stroke:var(--tb-text-3)" fill-opacity="0.08"/>
<path d="M260,180 L225,40 A145,145 0 0 1 295,40 z" style="fill:var(--tb-accent);stroke:var(--tb-accent)" fill-opacity="0.3"/>
<text class="mark-t" x="260" y="80" text-anchor="middle">中心視</text><text class="tick" x="260" y="96" text-anchor="middle">細部・文字</text>
<text class="mark-t" x="140" y="90" text-anchor="middle">周辺視</text><text class="tick" x="140" y="106" text-anchor="middle">動き・明滅に敏感</text>
<circle cx="400" cy="90" r="8" style="fill:var(--tb-warn)" class="k-glow"><animate attributeName="opacity" values="1;0.15;1" dur="1s" repeatCount="indefinite"/></circle>
<text class="tick" x="415" y="94">点滅で気づかせる</text>
<g class="k-shadow"><rect x="212" y="200" width="96" height="26" rx="13" style="fill:var(--k-accent-1);stroke:var(--k-line)" stroke-width="1.4"/>
<ellipse class="k-skin" cx="243" cy="198" rx="4" ry="6"/><ellipse class="k-skin" cx="277" cy="198" rx="4" ry="6"/>
<circle class="k-skin" cx="260" cy="198" r="17"/><path d="M243,201 A17,17 0 0 0 277,201 Q260,188 243,201 Z" fill="#4a3728"/>
<path d="M256,182 L260,176 L264,182" class="k-skin" stroke-width="1"/></g>
<circle cx="254" cy="186" r="1.6" style="fill:var(--k-line)"/><circle cx="266" cy="186" r="1.6" style="fill:var(--k-line)"/>
</svg>
<p class="tb-caption">図: 視野の中心と周辺 (角度は概念的)。周辺に置く表示は点滅や動きで注意を引く。</p>
<h2>反応時間とヒックの法則</h2>
<p>合図が出てから動き始めるまでの<b>単純反応時間</b>は、条件によりますがおよそ 0.15〜0.3 秒程度です (目安)。選択肢が増えると、どれを選ぶか判断する時間が加わります。これを表すのが<b>ヒック (ヒック・ハイマン) の法則</b>です。</p>
<div class="tb-formula">RT = a + b × log₂(n + 1)　　n: 等確率の選択肢の数、a・b: 人と課題で決まる係数</div>
<p>選択肢の数が 2 倍になっても時間は 2 倍にはならず、<b>対数的</b>にゆっくり増えます。例えば a = 0.2 s、b = 0.15 s/bit と仮定すると:</p>
<table class="tb-table">
  <tr><th>選択肢 n</th><th>log₂(n+1)</th><th>RT (計算例)</th></tr>
  <tr><td>1</td><td>1</td><td>0.35 s</td></tr>
  <tr><td>3</td><td>2</td><td>0.50 s</td></tr>
  <tr><td>7</td><td>3</td><td>0.65 s</td></tr>
  <tr><td>15</td><td>4</td><td>0.80 s</td></tr>
</table>
<div class="tb-note">ヒックの法則は、選択肢が<b>よく知っていて等確率</b>の場合のモデルです。メニューを上から読んで探す (探索) 場合は項目数にほぼ比例して時間が増えることがあり、法則がそのまま当てはまるわけではありません。係数 a・b は例示用の値です。</div>
<p>設計への示唆: よく使う選択肢を少数にまとめる、項目をグループ化して段階的に選ばせる、緊急時の操作は<b>選択肢を 1 つ</b> (非常停止) にする。</p>
<h2>注意と記憶</h2>
<ul>
  <li><b>選択的注意</b>: 人は一度に多くのことに注意を向けられない。作業中は表示の変化を見落とす (変化の見落とし)</li>
  <li><b>作業記憶 (短期記憶)</b>: 一時的に覚えておける量は少ない。ミラーの「7±2」が有名だが、これは情報のまとまり (チャンク) の数の目安であり、現在は<b>4±1 程度</b>とする研究 (コーワンなど) もある</li>
  <li><b>チャンク化</b>: 「0312345678」より「03-1234-5678」のほうが覚えやすい</li>
  <li><b>長期記憶</b>: 思い出す (再生) より、見て選ぶ (再認) ほうがずっと楽 → 「記憶より認識」</li>
  <li>疲労・焦り・騒音・同時作業で、注意と記憶の容量はさらに減る</li>
</ul>
<div class="tb-tip"><b>3DCAD Studio</b>: 操作パネルをモデル化し、アセンブリで人の簡易モデルの目の位置から見て、重要な表示が視線の中心近くに来るか確認しましょう。測定で目から表示までの距離と角度を測れます。</div>`,
    points: [
      "知覚 → 認知 → 運動 の各段階に時間と容量の限界がある",
      "視覚は情報量、聴覚は注意喚起、触覚は見ずに確認 — 組み合わせて使う",
      "ヒックの法則 RT = a + b·log₂(n+1): 選択肢が増えると対数的に遅くなる",
      "作業記憶は小さい (7±2、近年は 4±1 とする説も) — 覚えさせず見せる",
    ],
    exercises: [
      {
        q: "ヒックの法則で a = 0.2 s、b = 0.15 s/bit とします。選択肢 7 個のメニューを、3 個ずつの 2 段階 (最初に 3 つから選び、次に 3 つから選ぶ) に分けた場合と比べてください (段階間の画面切替時間は無視)。",
        a: "1 段階 7 個: 0.2 + 0.15 × log₂(8) = 0.2 + 0.45 = <b>0.65 s</b>。2 段階 (3 個 + 3 個): 各 0.2 + 0.15 × log₂(4) = 0.5 s、合計 <b>1.0 s</b>。この計算では一度に並べたほうが速くなります (定数 a が 2 回かかるため)。ただし項目を知らずに探す場合や、画面が小さく項目が読めない場合は段階化が有利になることもあります。",
      },
    ],
    quiz: [
      { q: "ヒックの法則で、選択肢の数を 3 から 7 にすると log₂(n+1) は?", choices: ["2 から 3 に増える", "2 倍以上に増える", "変わらない"], answer: 0, explain: "log₂(4) = 2、log₂(8) = 3。対数なので増え方はゆるやかです。" },
      { q: "周辺視が比較的得意なのは?", choices: ["小さい文字を読む", "動きや点滅に気づく", "色の細かい違いを見分ける"], answer: 1, explain: "周辺視は細部や色に弱い一方、動きや明滅には敏感です。" },
      { q: "作業記憶の容量について適切な記述は?", choices: ["7 個まで必ず覚えられる", "7±2 が有名だが 4±1 程度とする研究もあり、覚えさせない設計が望ましい", "訓練すれば無制限"], answer: 1, explain: "容量の数値は研究により異なります。設計では記憶に頼らず表示で示します。" },
    ],
    lessons: ["9-1"],
  },
  {
    id: "pointing-targets",
    part: "ux",
    title: "【中級】ターゲットの大きさと配置",
    minutes: 20,
    level: 2,
    lead: "ボタンやアイコンを指やマウスで押す時間は、距離と大きさで予測できます。フィッツの法則を体験し、タッチターゲットの大きさの目安、画面の端と角の効用、物理ボタンとの違いを学びます。",
    body: `
<h2>フィッツの法則</h2>
<p>ポール・フィッツ (1954) は、目標へ手を素早く正確に動かす時間 MT が、距離 D と目標の幅 W で決まることを示しました。広く使われる形 (シャノン形) は次のとおりです。</p>
<div class="tb-formula">MT = a + b × log₂(D/W + 1)　　ID = log₂(D/W + 1) [bit] を難易度指数と呼ぶ</div>
<svg class="tb-chart" viewBox="0 0 520 170" role="img" aria-label="フィッツの法則の距離と幅">

<circle cx="60" cy="75" r="5" style="fill:var(--tb-text-3)"/><text class="tick" x="60" y="100" text-anchor="middle">開始点</text>
<g class="k-shadow"><rect class="k-accent" x="380" y="45" width="40" height="60" rx="5"/></g>
<line class="k-center" x1="400" y1="40" x2="400" y2="132"/>
<path d="M60,75 C200,40 330,70 400,75" class="guide" fill="none"/>
<line class="k-ext" x1="380" y1="42" x2="380" y2="24"/><line class="k-ext" x1="420" y1="42" x2="420" y2="24"/><line class="k-dimline" x1="380" y1="28" x2="420" y2="28"/>
<text class="k-dimtext" x="430" y="32">幅 W</text>
<line class="k-ext" x1="60" y1="84" x2="60" y2="128"/><line class="k-dimline" x1="60" y1="124" x2="400" y2="124"/>
<text class="k-dimtext" x="230" y="140" text-anchor="middle">距離 D (中心まで)</text>
<g><path d="M0,0 L0,17 L4.5,13 L8,20 L11,18.5 L7.5,12 L13,12 Z" fill="#fff" stroke="#111" stroke-width="1.2" stroke-linejoin="round"/><animateMotion path="M60,75 C200,40 330,70 400,75" dur="2.5s" repeatCount="indefinite" keyPoints="0;1;1" keyTimes="0;0.7;1" calcMode="spline" keySplines="0.3 0 0.2 1;0 0 1 1"/></g>
<text class="k-note" x="260" y="160" text-anchor="middle">D が大きく W が小さいほど遅い</text>
</svg>
<p class="tb-caption">図: 距離 D と幅 W。動きは「大きく速い移動 → 目標近くでの細かい修正」の 2 段階になる。</p>
<p>実際に試してみましょう。大きさと距離の違うターゲットを順にクリック (タップ) すると、所要時間が ID に対してほぼ直線に並ぶはずです。</p>
<div data-widget="anim-fitts"></div>
<p>計算例 (a = 0.1 s、b = 0.15 s/bit と仮定): D = 200 mm、W = 20 mm → ID = log₂(11) ≈ 3.46 bit、MT ≈ 0.62 s。W を 40 mm にすると ID = log₂(6) ≈ 2.58、MT ≈ 0.49 s。<b>幅を 2 倍にしても時間は半分にはならない</b>点に注意しましょう。</p>
<svg class="tb-chart" role="img" viewBox="0 0 520 220" aria-label="MT と ID の関係">
  <line class="axis" x1="50" y1="180" x2="480" y2="180"/><line class="axis" x1="50" y1="180" x2="50" y2="20"/>
  <line class="grid" x1="50" y1="140" x2="480" y2="140"/><line class="grid" x1="50" y1="100" x2="480" y2="100"/><line class="grid" x1="50" y1="60" x2="480" y2="60"/>
  <line style="stroke:var(--tb-accent)" x1="50" y1="153" x2="470" y2="41" stroke-width="2.5"/>
  <circle class="mark" cx="153" cy="128" r="4"/><circle class="mark" cx="230" cy="102" r="4"/><circle class="mark" cx="270" cy="96" r="4"/><circle class="mark" cx="330" cy="76" r="4"/><circle class="mark" cx="410" cy="60" r="4"/>
  <text class="tick" x="50" y="196" text-anchor="middle">0</text><text class="tick" x="155" y="196" text-anchor="middle">1</text><text class="tick" x="260" y="196" text-anchor="middle">2</text><text class="tick" x="365" y="196" text-anchor="middle">3</text><text class="tick" x="470" y="196" text-anchor="middle">4</text>
  <text class="lbl" x="480" y="214" text-anchor="end">ID [bit]</text><text class="lbl" x="56" y="16">MT</text>
  <text class="tick" x="56" y="150">切片 a</text><text class="tick" x="380" y="40" text-anchor="end">傾き b</text>
</svg>
<p class="tb-caption">図: 測定値 (点) を ID に対してプロットすると直線に近づく (データは説明用)。傾き b が小さいほど入力装置・人の性能が高い。</p>
<h2>タッチターゲットの大きさ (目安)</h2>
<table class="tb-table">
  <tr><th>出典 (概略)</th><th>最小の目安</th></tr>
  <tr><td>Apple Human Interface Guidelines</td><td>約 44 × 44 pt</td></tr>
  <tr><td>Google Material Design</td><td>約 48 × 48 dp (物理寸法で約 9 mm)</td></tr>
  <tr><td>WCAG 2.2 (達成基準 2.5.8、AA)</td><td>24 × 24 CSS px 以上 (例外あり)。2.5.5 (AAA) は 44 × 44</td></tr>
  <tr><td>指先の接触面の大きさ</td><td>成人で幅およそ 10〜20 mm 程度</td></tr>
</table>
<div class="tb-note">各社ガイドラインの数値は改訂されることがあり、単位 (pt・dp・px) も物理寸法と一致しません。ここでは<b>概略の目安</b>です。組込み機器では画面の画素ピッチから<b>物理寸法 (mm)</b> に換算して確認し、手袋使用・振動・高齢者を想定する場合は 15〜20 mm 程度以上と大きめにします。ボタン間のすき間も誤タッチ防止に重要です。</div>
<h2>端と角の効用、配置の工夫</h2>
<p>マウス操作では、カーソルは画面の端で止まるため、<b>端や角にあるターゲットは実質的に無限の幅</b>を持ち、勢いよく動かしても外しません。メニューバーを画面上端に置く設計はこの効用を使っています。</p>
<svg class="tb-chart" viewBox="0 0 520 200" role="img" aria-label="画面の端と角のターゲット">

<g class="k-shadow"><rect class="k-part" x="132" y="166" width="16" height="16"/><rect class="k-part" x="100" y="180" width="80" height="8" rx="3"/>
<rect class="k-part" x="20" y="10" width="240" height="158" rx="6"/></g>
<rect x="30" y="20" width="220" height="140" style="fill:var(--tb-surface-2);stroke:var(--k-line)"/>
<rect x="30" y="20" width="40" height="22" style="fill:var(--tb-good)"/><text class="tick" x="78" y="35">角: 2 方向で止まる</text>
<rect x="100" y="138" width="80" height="22" style="fill:var(--tb-good)" opacity="0.75"/><text class="tick" x="140" y="132" text-anchor="middle">端: 1 方向で止まる</text>
<rect x="120" y="78" width="30" height="16" rx="2" style="fill:var(--tb-bad)" opacity="0.75"/><text class="tick" x="135" y="110" text-anchor="middle">中央の小ボタン</text>
<g><path d="M0,0 L0,17 L4.5,13 L8,20 L11,18.5 L7.5,12 L13,12 Z" fill="#fff" stroke="#111" stroke-width="1.2" stroke-linejoin="round"/><animateMotion path="M200,110 L40,25" dur="2s" repeatCount="indefinite"/></g>
<g class="k-shadow"><rect class="k-part" x="292" y="12" width="206" height="170" rx="14"/></g>
<rect x="302" y="22" width="186" height="150" rx="4" style="fill:var(--tb-surface-2);stroke:var(--k-line)"/>
<rect x="312" y="118" width="78" height="40" rx="6" style="fill:var(--tb-accent)"/><rect x="400" y="118" width="78" height="40" rx="6" style="fill:var(--tb-surface);stroke:var(--tb-text-2)" stroke-width="1.5"/>
<text x="351" y="143" text-anchor="middle" fill="#fff" font-size="12" font-weight="700">決定</text><text class="mark-t" x="439" y="143" text-anchor="middle">取消</text>
<text class="tick" x="395" y="46" text-anchor="middle">タッチ画面では端は「止まらない」</text><text class="tick" x="395" y="64" text-anchor="middle">→ 大きさとすき間で確保</text>
<g transform="translate(360,140)"><g><animateTransform attributeName="transform" type="translate" values="0,-14;0,0;0,-14" dur="2.4s" repeatCount="indefinite"/><g transform="scale(0.6)"><rect x="-8" y="-86" width="30" height="24" rx="4" style="fill:var(--k-accent-1);stroke:var(--k-line)" stroke-width="1.2"/><rect class="k-skin" x="-8" y="-64" width="30" height="30" rx="10"/><path d="M14,-52 q7,0 7,5 M14,-44 q7,0 7,5" class="k-thin"/><rect class="k-skin" x="-11" y="-50" width="9" height="18" rx="4.5" transform="rotate(-12 -6 -41)"/><rect class="k-skin" x="-5" y="-40" width="10" height="40" rx="5"/><path d="M-3,-3 q3,-5 6,0" class="k-thin"/></g></g></g>
</svg>
<p class="tb-caption">図: マウスでは角と端が狙いやすい (左)。タッチ画面には端で止まる効果がないため、大きさと間隔で確保する (右)。</p>
<ul>
  <li>よく使うボタンは開始位置 (指・カーソルの定位置) の近くに置き D を小さく</li>
  <li>重要なボタンは大きく (W を大きく)、危険なボタンは逆に小さく・離して誤操作を防ぐ</li>
  <li>片手持ちのスマートフォンでは親指の届く下部が操作しやすい</li>
  <li>ポップアップメニューはカーソル位置に出すと D ≈ 0 になる</li>
</ul>
<h2>物理ボタンとの比較</h2>
<table class="tb-table">
  <tr><th>観点</th><th>物理ボタン</th><th>タッチ画面</th></tr>
  <tr><td>見ずに操作</td><td>形・位置・クリック感で可能</td><td>難しい (平らで手がかりがない)</td></tr>
  <tr><td>手袋・濡れた手</td><td>強い</td><td>静電容量式は反応しにくいことがある</td></tr>
  <tr><td>フィードバック</td><td>クリック感が自然に得られる</td><td>音・振動・表示を設計で加える必要</td></tr>
  <tr><td>柔軟性</td><td>機能の追加・変更が難しい</td><td>画面で自由に変えられる</td></tr>
  <tr><td>向く用途</td><td>非常停止、頻繁な操作、運転中の操作</td><td>設定、多数の選択肢、情報表示</td></tr>
</table>
<div class="tb-tip"><b>3DCAD Studio</b>: パラメータでボタン径とピッチの違う操作パネル案を作り、3D プリント試作で手袋をはめて押してみましょう。測定でボタンの中心間距離 (D) と幅 (W) を確認し、ID を計算して比べられます。</div>`,
    points: [
      "フィッツの法則 MT = a + b·log₂(D/W+1): 近く・大きくするほど速い",
      "幅を 2 倍にしても時間は半分にならない (対数)",
      "タッチターゲットは各社の目安 (約 44 pt・48 dp・約 9 mm) を物理寸法で確認、手袋なら大きく",
      "マウスでは端と角が狙いやすい。見ずに操作するなら物理ボタン",
    ],
    exercises: [
      {
        q: "a = 0.1 s、b = 0.15 s/bit とします。定位置から 300 mm 離れた幅 10 mm のボタンの MT を求め、幅 20 mm にすると何秒短くなるか計算してください。",
        a: "W = 10: ID = log₂(300/10 + 1) = log₂(31) ≈ 4.95 bit、MT = 0.1 + 0.15 × 4.95 ≈ <b>0.84 s</b>。W = 20: ID = log₂(16) = 4 bit、MT = 0.1 + 0.6 = <b>0.70 s</b>。約 <b>0.14 s</b> 短くなります (約 17 %)。",
      },
      {
        q: "画素ピッチ 0.2 mm の組込み画面で、物理寸法 10 mm のボタンを作るには何ピクセル必要ですか?",
        a: "10 ÷ 0.2 = <b>50 px</b> 四方。画面のピクセル数ではなく物理寸法で決めるのがポイントです。",
      },
    ],
    quiz: [
      { q: "フィッツの法則で難易度指数 ID が大きくなるのは?", choices: ["距離が短く幅が大きい", "距離が長く幅が小さい", "距離と幅が同じ比率で大きい"], answer: 1, explain: "ID = log₂(D/W + 1) なので D/W が大きいほど ID が大きくなります。D と W を同じ比率で変えても ID は同じです。" },
      { q: "マウス操作で画面の角にあるボタンが狙いやすい理由は?", choices: ["角は目立つから", "カーソルが端で止まり、実質的な幅が非常に大きくなるから", "角のボタンは大きく描かれるから"], answer: 1, explain: "カーソルは画面外に出ないため、行き過ぎても目標上で止まります。" },
      { q: "手袋をはめて使う装置の操作に最も向くのは?", choices: ["小さなアイコンのタッチ画面", "十分な大きさとクリック感のある物理ボタン", "スワイプ操作"], answer: 1, explain: "手袋では静電容量式タッチが反応しにくく、細かい操作も困難です。" },
    ],
    lessons: ["9-1"],
  },
  {
    id: "error-design",
    part: "ux",
    title: "【中級】ヒューマンエラーと設計",
    minutes: 20,
    level: 2,
    lead: "人は必ず間違えます。エラーを個人の不注意として責めるのではなく、種類を見分けて、起こりにくく・起きても被害が小さく・元に戻せる設計にする考え方を学びます。",
    body: `
<h2>エラーの分類 (リーズン)</h2>
<p>心理学者ジェームズ・リーズンは、意図しない不安全行為を次のように分類しました。種類によって効く対策が違います。</p>
<table class="tb-table">
  <tr><th>種類</th><th>何が起きているか</th><th>例</th><th>効く対策</th></tr>
  <tr><td>スリップ</td><td>意図は正しいが、実行を誤る (注意の失敗)</td><td>隣のボタンを押す、似た容器を取り違える</td><td>形・位置・色の区別、間隔、ガード</td></tr>
  <tr><td>ラプス</td><td>意図は正しいが、手順を忘れる (記憶の失敗)</td><td>給紙カバーを閉め忘れる、工具の置き忘れ</td><td>チェックリスト、状態表示、閉めないと次に進めない設計</td></tr>
  <tr><td>ミステイク</td><td>意図 (計画・判断) そのものが誤り</td><td>表示を誤解して逆の操作を選ぶ</td><td>分かりやすい表示と概念モデル、教育、確認</td></tr>
  <tr><td>違反</td><td>ルールを意図的に破る</td><td>安全カバーを外して作業</td><td>ルールに従うほうが楽な設計 (面倒な安全装置は無効化される)</td></tr>
</table>
<svg class="tb-chart" role="img" viewBox="0 0 520 190" aria-label="エラーの分類の木">
  <rect style="fill:var(--tb-surface-2);stroke:var(--tb-text-2)" x="190" y="10" width="140" height="28" rx="6"/><text class="mark-t" x="260" y="29" text-anchor="middle">不安全行為</text>
  <path style="stroke:var(--tb-text-3)" d="M260,38 L260,52 M110,52 L410,52 M110,52 L110,66 M410,52 L410,66" fill="none"/>
  <rect style="fill:var(--tb-surface-2);stroke:var(--tb-text-2)" x="40" y="66" width="140" height="28" rx="6"/><text class="mark-t" x="110" y="85" text-anchor="middle">意図しない行為</text>
  <rect style="fill:var(--tb-surface-2);stroke:var(--tb-text-2)" x="340" y="66" width="140" height="28" rx="6"/><text class="mark-t" x="410" y="85" text-anchor="middle">意図した行為</text>
  <path style="stroke:var(--tb-text-3)" d="M110,94 L110,108 M60,108 L160,108 M60,108 L60,122 M160,108 L160,122 M410,94 L410,108 M360,108 L460,108 M360,108 L360,122 M460,108 L460,122" fill="none"/>
  <rect style="fill:color-mix(in srgb, var(--tb-accent) 25%, transparent);stroke:var(--tb-accent)" x="20" y="122" width="80" height="28" rx="6"/><text class="mark-t" x="60" y="141" text-anchor="middle">スリップ</text>
  <rect style="fill:color-mix(in srgb, var(--tb-accent) 25%, transparent);stroke:var(--tb-accent)" x="120" y="122" width="80" height="28" rx="6"/><text class="mark-t" x="160" y="141" text-anchor="middle">ラプス</text>
  <rect style="fill:color-mix(in srgb, var(--tb-warn) 30%, transparent);stroke:var(--tb-warn)" x="315" y="122" width="90" height="28" rx="6"/><text class="mark-t" x="360" y="141" text-anchor="middle">ミステイク</text>
  <rect style="fill:color-mix(in srgb, var(--tb-bad) 25%, transparent);stroke:var(--tb-bad)" x="420" y="122" width="80" height="28" rx="6"/><text class="mark-t" x="460" y="141" text-anchor="middle">違反</text>
  <text class="tick" x="110" y="172" text-anchor="middle">実行・記憶の失敗</text><text class="tick" x="360" y="172" text-anchor="middle">計画の誤り</text><text class="tick" x="460" y="172" text-anchor="middle">意図的</text>
</svg>
<p class="tb-caption">図: リーズンによる不安全行為の分類 (簡略化)。</p>
<h2>エラーを起こしにくい設計</h2>
<ul>
  <li><b>強制的な制約 (フールプルーフ、ポカヨケ)</b>: 間違った向きには入らないコネクタ、ドアを閉めないと動かない電子レンジ、部品の左右で穴位置を変える</li>
  <li><b>区別しやすく</b>: 似た操作具を並べない。形・大きさ・色・手触りで区別する (航空機の操縦レバーの形状コードが有名)</li>
  <li><b>覚えさせない</b>: 状態と次の手順を表示する。手順の順番を形で示す</li>
  <li><b>モードを減らす</b>: 同じ操作の意味が状態で変わる (モード) と、モードの取り違えが起きる。モードを使うなら現在のモードを常に大きく表示する</li>
  <li><b>デフォルトを安全側に</b>: 初期値は安全な設定、電源投入時は停止状態から</li>
</ul>
<svg class="tb-chart" viewBox="0 0 520 170" role="img" aria-label="フールプルーフのコネクタ">

<g class="k-shadow"><rect class="k-part" x="40" y="38" width="80" height="54" rx="4"/></g>
<rect x="47" y="45" width="66" height="40" rx="2" style="fill:var(--k-steel-3);stroke:var(--k-line)"/>
<rect x="58" y="58" width="5" height="14" rx="1" fill="#d4a017" stroke="#7a5c00" stroke-width="0.8"/><rect x="74" y="58" width="5" height="14" rx="1" fill="#d4a017" stroke="#7a5c00" stroke-width="0.8"/><rect x="90" y="58" width="5" height="14" rx="1" fill="#d4a017" stroke="#7a5c00" stroke-width="0.8"/>
<g><animateTransform attributeName="transform" type="rotate" values="0 185 65;180 185 65;180 185 65;0 185 65" dur="5s" repeatCount="indefinite"/>
<g class="k-shadow"><rect class="k-plastic" x="152" y="47" width="66" height="36" rx="3"/></g><circle cx="168" cy="65" r="3.2" style="fill:var(--k-line)"/><circle cx="185" cy="65" r="3.2" style="fill:var(--k-line)"/><circle cx="202" cy="65" r="3.2" style="fill:var(--k-line)"/><path d="M156,51 L164,51 L156,59 Z" style="fill:var(--tb-bad)"/></g>
<text class="k-bad-t" x="130" y="120" text-anchor="middle">× 長方形: 逆向きでも入る</text>
<g class="k-shadow"><path class="k-part" d="M300,38 L382,38 L382,92 L316,92 L300,76 Z"/></g>
<path d="M307,45 L375,45 L375,85 L319,85 L307,73 Z" style="fill:var(--k-steel-3);stroke:var(--k-line)"/>
<rect x="322" y="58" width="5" height="14" rx="1" fill="#d4a017" stroke="#7a5c00" stroke-width="0.8"/><rect x="338" y="58" width="5" height="14" rx="1" fill="#d4a017" stroke="#7a5c00" stroke-width="0.8"/><rect x="354" y="58" width="5" height="14" rx="1" fill="#d4a017" stroke="#7a5c00" stroke-width="0.8"/>
<g class="k-shadow"><path class="k-plastic" d="M410,47 L476,47 L476,83 L422,83 L410,71 Z"/></g><circle cx="432" cy="65" r="3.2" style="fill:var(--k-line)"/><circle cx="449" cy="65" r="3.2" style="fill:var(--k-line)"/><circle cx="466" cy="65" r="3.2" style="fill:var(--k-line)"/>
<path d="M392,65 L404,65" class="k-move" style="stroke:var(--tb-good);marker-end:url(#k-arrow-green)"/>
<text class="k-good-t" x="390" y="120" text-anchor="middle">○ 角を落とす: 正しい向きにしか入らない</text>
<text class="mark-t" x="260" y="155" text-anchor="middle">物理的な制約はエラーを「起こせなく」する最も強い対策</text>
</svg>
<p class="tb-caption">図: 形状によるフールプルーフ。左は回転しても入ってしまう、右は向きが一意に決まる。</p>
<h2>確認と取消し</h2>
<p>防ぎきれないエラーには、<b>気づける・止められる・戻せる</b>設計で対処します。</p>
<ol class="tb-flow">
  <li><b>アンドゥ (取消し)</b> — 最も強い回復手段。可能な操作はすべて元に戻せるようにする</li>
  <li><b>確認</b> — 取り消せない重大操作にだけ使う。毎回出す確認は読まずに「はい」を押す習慣を生む</li>
  <li><b>具体的な確認文</b> — 「よろしいですか?」ではなく「プログラム P12 (3 件) を削除します」と対象と結果を示し、ボタンも「削除」「やめる」と動詞にする</li>
  <li><b>猶予</b> — 実行前の数秒の取消し、ゴミ箱、一時停止で止められる</li>
</ol>
<svg class="tb-chart" viewBox="0 0 520 170" role="img" aria-label="確認ダイアログの悪い例と良い例">

<g class="k-shadow"><rect x="20" y="12" width="220" height="124" rx="8" style="fill:var(--tb-surface);stroke:var(--tb-border)"/></g><path d="M20,30 L20,20 Q20,12 28,12 L232,12 Q240,12 240,20 L240,30 Z" style="fill:var(--tb-surface-2)"/><line x1="20" y1="30" x2="240" y2="30" style="stroke:var(--tb-border)"/><circle cx="224" cy="21" r="4" style="fill:var(--tb-text-3)"/><g class="k-shadow"><rect x="280" y="12" width="220" height="124" rx="8" style="fill:var(--tb-surface);stroke:var(--tb-border)"/></g><path d="M280,30 L280,20 Q280,12 288,12 L492,12 Q500,12 500,20 L500,30 Z" style="fill:var(--tb-surface-2)"/><line x1="280" y1="30" x2="500" y2="30" style="stroke:var(--tb-border)"/><circle cx="484" cy="21" r="4" style="fill:var(--tb-text-3)"/>
<text class="mark-t" x="130" y="66" text-anchor="middle">よろしいですか?</text>
<rect x="45" y="94" width="70" height="28" rx="5" style="fill:var(--tb-accent)"/><text x="80" y="112" text-anchor="middle" fill="#fff" font-size="12" font-weight="700">はい</text>
<rect x="145" y="94" width="70" height="28" rx="5" style="fill:var(--tb-surface-2);stroke:var(--tb-text-2)" stroke-width="1.5"/><text class="mark-t" x="180" y="112" text-anchor="middle">いいえ</text>
<path d="M302,74 L314,52 L326,74 Z" style="fill:var(--tb-warn);stroke:var(--k-line)" stroke-width="1"/><text x="314" y="71" text-anchor="middle" fill="#222" font-size="12" font-weight="700">!</text>
<text class="mark-t" x="336" y="58">P12 を削除します</text><text class="tick" x="336" y="76">工具データ 3 件も消えます</text>
<rect x="300" y="94" width="80" height="28" rx="5" style="fill:var(--tb-surface-2);stroke:var(--tb-text-2)" stroke-width="1.5"/><text class="mark-t" x="340" y="112" text-anchor="middle">やめる</text>
<rect x="400" y="94" width="80" height="28" rx="5" style="fill:var(--tb-bad)"/><text x="440" y="112" text-anchor="middle" fill="#fff" font-size="12" font-weight="700">削除</text>
<circle class="k-badge" cx="30" cy="156" r="10" style="fill:var(--tb-bad)"/><text class="k-badge-t" x="30" y="160" text-anchor="middle">✕</text><text class="k-bad-t" x="44" y="161">対象も結果も分からない</text>
<circle class="k-badge" cx="290" cy="156" r="10" style="fill:var(--tb-good)"/><text class="k-badge-t" x="290" y="160" text-anchor="middle">✓</text><text class="k-good-t" x="304" y="161">対象・結果・動詞のボタン</text>
</svg>
<p class="tb-caption">図: 確認ダイアログ。何がどうなるかを書き、ボタンを動作の名前にする。</p>
<h2>警告の出し方</h2>
<ul>
  <li>警告の優先順位: <b>本質安全設計 → 防護 (ガード・インターロック) → 使用上の情報 (警告)</b>。警告は最後の手段</li>
  <li>重大度で段階を分け (危険・警告・注意)、段階ごとに色・音・表示位置を一貫させる</li>
  <li>警告を出しすぎない。重要でない警告が多いと、慣れて無視されるようになる (警報疲れ)</li>
  <li>内容は「何が危ないか・どうなるか・どうすればよいか」</li>
</ul>
<div class="tb-tip"><b>3DCAD Studio</b>: 組み合わせる部品の形状に非対称な切欠きを入れ、アセンブリで逆向きに組めないこと (干渉すること) を確認しましょう。文字 (刻印) で向きの矢印を入れ、3D プリント試作で実際に組んでみると効果が分かります。</div>`,
    points: [
      "スリップ (実行)・ラプス (記憶)・ミステイク (判断)・違反を見分けて対策する",
      "最も強いのは物理的な制約 (フールプルーフ)。モードを減らし、デフォルトを安全側に",
      "アンドゥを基本に、確認は重大操作だけ・対象と結果を具体的に",
      "警告は最後の手段。出しすぎると無視される",
    ],
    exercises: [
      {
        q: "ある装置で「保存」と「全消去」のボタンが隣り合っており、押し間違いが月に数回起きています。エラーの種類を判断し、対策を 3 つ以上挙げてください。",
        a: "意図は正しいのに実行を誤っているので<b>スリップ</b>です。対策例: ① 2 つのボタンを離して配置し、全消去は別画面 (メニューの奥) に移す。② 全消去に長押し (2〜3 秒) または二段操作を要求する。③ 形・色を変え、全消去は小さく、保存は大きく。④ 全消去を取り消せるようにする (ゴミ箱・一定時間の復元)。⑤ 確認を出す場合は「全 25 件を消去します」と具体的にする。注意喚起の教育だけでは再発しやすい。",
      },
    ],
    quiz: [
      { q: "給紙カバーを閉め忘れて装置が止まるエラーは?", choices: ["スリップ", "ラプス", "ミステイク"], answer: 1, explain: "手順を忘れる記憶の失敗はラプスです。閉めないと次に進めない設計や状態表示が効きます。" },
      { q: "確認ダイアログの使い方として適切なのは?", choices: ["すべての操作で毎回出す", "取り消せない重大な操作にだけ、対象と結果を具体的に示して出す", "「よろしいですか?」と短く書く"], answer: 1, explain: "頻繁な確認は習慣的に「はい」を押させるため効果がなくなります。" },
      { q: "コネクタの角を 1 つ落として逆差しを防ぐのは?", choices: ["フールプルーフ (強制的な制約)", "警告表示", "教育"], answer: 0, explain: "物理的に誤った操作ができないようにする最も強い対策です。" },
    ],
    lessons: ["7-2"],
  },
  {
    id: "feedback-sound-haptics",
    part: "ux",
    title: "【中級】フィードバックの設計",
    minutes: 20,
    level: 2,
    lead: "操作したら「受け付けた」とすぐ分かることが、使いやすさと安心感の基本です。光・音・振動・クリック感の使い分け、応答時間の目安、ブザー音のパターンを学びます。",
    body: `
<h2>フィードバックの役割</h2>
<p>フィードバックは、<b>①操作を受け付けたか ②処理が進んでいるか ③結果はどうなったか</b> を知らせます。どれかが欠けると、利用者は何度も押したり、待ちきれずに電源を切ったりします。</p>
<svg class="tb-chart" viewBox="0 0 520 180" role="img" aria-label="フィードバックの種類">

<rect class="k-panel" x="8" y="8" width="118" height="160"/><rect class="k-panel" x="136" y="8" width="118" height="160"/><rect class="k-panel" x="264" y="8" width="118" height="160"/><rect class="k-panel" x="392" y="8" width="120" height="160"/>
<g class="k-shadow"><circle class="k-part" cx="67" cy="66" r="30"/></g>
<circle cx="67" cy="66" r="22" style="fill:var(--tb-good)" class="k-glow"><animate attributeName="opacity" values="1;0.25;1" dur="1.5s" repeatCount="indefinite"/></circle>
<ellipse cx="60" cy="58" rx="7" ry="4" fill="#fff" opacity="0.4"/>
<text class="mark-t" x="67" y="130" text-anchor="middle">光</text><text class="tick" x="67" y="148" text-anchor="middle">状態・持続</text>
<g class="k-shadow"><path class="k-part" d="M164,54 L178,54 L198,36 L198,96 L178,78 L164,78 Z"/></g>
<path d="M208,56 q9,10 0,20 M218,48 q17,18 0,36" style="stroke:var(--tb-accent)" fill="none" stroke-width="2.2"><animate attributeName="opacity" values="0;1;0" dur="1s" repeatCount="indefinite"/></path>
<text class="mark-t" x="195" y="130" text-anchor="middle">音</text><text class="tick" x="195" y="148" text-anchor="middle">注意喚起・確認</text>
<path d="M278.0,80.0 L370.0,72.0" fill="none" style="stroke:var(--k-line)" stroke-width="20.4"/><path d="M278.0,80.0 L370.0,72.0" fill="none" style="stroke:var(--k-skin-1)" stroke-width="18.0"/>
<g><animateTransform attributeName="transform" type="translate" values="0,0;-2,0;2,0;-2,0;0,0;0,0" dur="1s" repeatCount="indefinite"/>
<rect x="318" y="48" width="24" height="56" rx="6" style="fill:var(--k-line-2);stroke:var(--k-line)"/>
<g class="k-shadow"><rect class="k-part" x="312" y="58" width="36" height="34" rx="8"/></g><rect x="317" y="63" width="26" height="24" rx="5" style="fill:var(--tb-accent)" opacity="0.8"/></g>
<path d="M302,64 l-6,6 l6,6 M358,64 l6,6 l-6,6" style="stroke:var(--tb-accent)" fill="none" stroke-width="2"/>
<text class="mark-t" x="323" y="130" text-anchor="middle">振動</text><text class="tick" x="323" y="148" text-anchor="middle">身に着けた機器</text>
<g class="k-shadow"><rect class="k-part" x="422" y="90" width="64" height="12" rx="2"/><rect class="k-alu" x="444" y="78" width="20" height="12"/>
<g><animateTransform attributeName="transform" type="translate" values="0,0;0,6;0,0;0,0" keyTimes="0;0.15;0.3;1" dur="2s" repeatCount="indefinite"/><rect class="k-accent" x="432" y="60" width="44" height="20" rx="4"/></g></g>
<g transform="translate(462,60)"><g><animateTransform attributeName="transform" type="translate" values="0,0;0,6;0,0;0,0" keyTimes="0;0.15;0.3;1" dur="2s" repeatCount="indefinite"/><g transform="scale(0.55)"><rect x="-8" y="-86" width="30" height="24" rx="4" style="fill:var(--k-accent-1);stroke:var(--k-line)" stroke-width="1.2"/><rect class="k-skin" x="-8" y="-64" width="30" height="30" rx="10"/><path d="M14,-52 q7,0 7,5 M14,-44 q7,0 7,5" class="k-thin"/><rect class="k-skin" x="-11" y="-50" width="9" height="18" rx="4.5" transform="rotate(-12 -6 -41)"/><rect class="k-skin" x="-5" y="-40" width="10" height="40" rx="5"/><path d="M-3,-3 q3,-5 6,0" class="k-thin"/></g></g></g>
<text class="mark-t" x="452" y="130" text-anchor="middle">クリック感</text><text class="tick" x="452" y="148" text-anchor="middle">操作の瞬間</text>
</svg>
<p class="tb-caption">図: 4 つのフィードバック手段。重要な情報は 2 つ以上の感覚で重ねて伝える。</p>
<table class="tb-table">
  <tr><th>手段</th><th>長所</th><th>短所</th><th>向く用途</th></tr>
  <tr><td>光・表示</td><td>持続的に状態を示せる、静か</td><td>見ていないと気づかない</td><td>運転状態、残量、進捗</td></tr>
  <tr><td>音</td><td>見ていなくても届く</td><td>騒音下で聞こえない、周囲に迷惑、慣れて無視される</td><td>警報、操作確認、完了通知</td></tr>
  <tr><td>振動</td><td>本人だけに伝わる、騒音下でも有効</td><td>体に触れていないと伝わらない</td><td>携帯機器、ハンドル、タッチ画面の押下感</td></tr>
  <tr><td>クリック感 (触覚)</td><td>操作と同時、見ずに分かる</td><td>機構が必要、情報量は少ない</td><td>押しボタン、段階つまみ (デテント)</td></tr>
</table>
<h2>応答時間の目安</h2>
<p>ヤコブ・ニールセンらが紹介した、コンピュータの応答時間の 3 つの目安がよく使われます (古典的な目安であり、用途により異なります)。</p>
<table class="tb-table">
  <tr><th>応答時間</th><th>利用者の感じ方</th><th>設計</th></tr>
  <tr><td>約 0.1 秒以内</td><td>直接操作している、即座に反応した</td><td>ボタンの押下表示・音はこの範囲で</td></tr>
  <tr><td>約 1 秒以内</td><td>待たされた感はあるが思考は途切れない</td><td>特別な表示は不要なことが多い</td></tr>
  <tr><td>約 10 秒</td><td>注意を保てる限界</td><td>1 秒を超えたら処理中表示、長いものは進捗バーと残り時間・中止ボタン</td></tr>
</table>
<svg class="tb-chart" role="img" viewBox="0 0 520 150" aria-label="応答時間の目安の対数軸">
  <line class="axis" x1="40" y1="80" x2="490" y2="80"/>
  <line class="guide" x1="120" y1="40" x2="120" y2="100"/><line class="guide" x1="265" y1="40" x2="265" y2="100"/><line class="guide" x1="410" y1="40" x2="410" y2="100"/>
  <text class="tick" x="120" y="116" text-anchor="middle">0.1 s</text><text class="tick" x="265" y="116" text-anchor="middle">1 s</text><text class="tick" x="410" y="116" text-anchor="middle">10 s</text>
  <rect style="fill:var(--tb-good)" x="40" y="56" width="80" height="16" opacity="0.6"/><rect style="fill:var(--tb-warn)" x="120" y="56" width="145" height="16" opacity="0.45"/><rect style="fill:var(--tb-warn)" x="265" y="56" width="145" height="16" opacity="0.75"/><rect style="fill:var(--tb-bad)" x="410" y="56" width="80" height="16" opacity="0.6"/>
  <text class="tick" x="80" y="48" text-anchor="middle">即座</text><text class="tick" x="192" y="48" text-anchor="middle">流れは保てる</text><text class="tick" x="337" y="48" text-anchor="middle">処理中表示</text><text class="tick" x="450" y="48" text-anchor="middle">進捗+中止</text>
  <circle style="fill:var(--tb-accent)" cx="40" cy="64" r="6"><animate attributeName="cx" values="40;490" dur="6s" repeatCount="indefinite"/></circle>
  <text class="lbl" x="490" y="140" text-anchor="end">応答時間 (対数目盛)</text>
</svg>
<p class="tb-caption">図: 応答時間と必要なフィードバック (対数目盛)。境界は目安。</p>
<p>処理が速くても、<b>押した瞬間の表示変化</b> (0.1 秒以内) は必要です。組込み機器でセンサ処理や通信に時間がかかる場合も、まずボタンの見た目と音で受付を知らせ、結果は後から示します。</p>
<h2>ブザー音の使い分け</h2>
<p>音は種類を増やしすぎると区別できません。<b>意味ごとにパターンを決め、製品群で統一</b>します。日本では JIS S 0013 (消費生活製品の報知音) に、受付・終了・注意などの報知音のパターン例が示されています (詳細は規格本文で確認)。</p>
<svg class="tb-chart" role="img" viewBox="0 0 520 170" aria-label="報知音のパターン例">
  <text class="mark-t" x="20" y="38">受付</text><rect style="fill:var(--tb-accent)" x="110" y="25" width="16" height="18"/>
  <text class="mark-t" x="20" y="78">終了</text><rect style="fill:var(--tb-accent)" x="110" y="65" width="60" height="18"/><rect style="fill:var(--tb-accent)" x="190" y="65" width="60" height="18"/><rect style="fill:var(--tb-accent)" x="270" y="65" width="60" height="18"/>
  <text class="mark-t" x="20" y="118">注意</text><rect style="fill:var(--tb-bad)" x="110" y="105" width="22" height="18"/><rect style="fill:var(--tb-bad)" x="142" y="105" width="22" height="18"/><rect style="fill:var(--tb-bad)" x="174" y="105" width="22" height="18"/><rect style="fill:var(--tb-bad)" x="206" y="105" width="22" height="18"/><rect style="fill:var(--tb-bad)" x="238" y="105" width="22" height="18"/><rect style="fill:var(--tb-bad)" x="270" y="105" width="22" height="18"/>
  <text class="tick" x="350" y="38">短い単音「ピッ」</text><text class="tick" x="350" y="78">長めの音を数回</text><text class="tick" x="350" y="118">速い断続音を繰り返す</text>
  <line class="axis" x1="110" y1="145" x2="330" y2="145"/><text class="tick" x="330" y="162" text-anchor="end">時間 →</text>
  <line style="stroke:var(--tb-text)" x1="110" y1="20" x2="110" y2="128" stroke-width="1.5"><animate attributeName="x1" values="110;330" dur="3s" repeatCount="indefinite"/><animate attributeName="x2" values="110;330" dur="3s" repeatCount="indefinite"/></line>
</svg>
<p class="tb-caption">図: 報知音パターンの考え方 (概念図。実際の時間・周波数は規格や製品で定める)。緊急度が高いほど速く断続させる。</p>
<ul>
  <li>周波数: 高齢者は高音が聞きにくいため、2 kHz 前後〜それ以下を含む音が聞き取りやすいとされる (目安)</li>
  <li>音量: 周囲の騒音より十分大きく、ただし驚かせない。調整または消音機能 (消音中の表示も)</li>
  <li>緊急度: 断続の速さ・音の高さ・繰り返しで表現。最重要の警報は光と併用</li>
  <li>音が止まっても状態が続くなら、表示で残す</li>
</ul>
<h2>触覚のフィードバック</h2>
<ul>
  <li><b>クリック感</b>: スイッチの荷重が途中で急に下がる (荷重曲線のピーク) ことで「押した」と分かる</li>
  <li><b>デテント</b>: つまみの段ごとの手応え。段数を数えて見ずに設定できる</li>
  <li><b>振動 (ハプティクス)</b>: タッチ画面の押下に短い振動を返すと誤操作が減る。長い・強い振動は不快</li>
  <li><b>抵抗の変化</b>: 上限に近づくと重くなるなど、力で限界を伝える</li>
</ul>
<div class="tb-tip"><b>3DCAD Studio</b>: つまみのデテント用の溝やボタンのストロークを断面図で確認し、3D プリント試作で手応えを比べましょう。パラメータで溝の深さ違いの案を作ると、クリック感の強さを比較できます。</div>`,
    points: [
      "受付・進行・結果の 3 つを知らせる。重要な情報は 2 つ以上の感覚で",
      "応答時間の目安: 0.1 s 即座 / 1 s 流れを保つ / 10 s 注意の限界 (超えたら進捗表示)",
      "報知音は意味ごとにパターンを決めて統一 (JIS S 0013 などを参照)",
      "クリック感・デテント・振動で、見ずに操作を確かめられる",
    ],
    exercises: [
      {
        q: "組込み機器で「保存」ボタンを押すと、フラッシュメモリへの書込みに約 3 秒かかります。フィードバックを時系列で設計してください。",
        a: "例: ① 0.1 s 以内: ボタンの色が変わり、短い受付音「ピッ」。② 1 s 以内: 「保存中…」とスピナーまたは進捗バーを表示し、保存中は電源を切らないよう表示。他の操作は無効 (グレーアウト) にする。③ 完了時 (約 3 s): 「保存しました」と表示し、終了音。表示は数秒で消すが状態 (保存済み) は残す。④ 失敗時: 注意音と、原因と対処を言葉で表示。",
      },
    ],
    quiz: [
      { q: "ボタンを押してから見た目が変わるまでの目安として望ましいのは?", choices: ["約 0.1 秒以内", "約 1 秒", "約 10 秒"], answer: 0, explain: "0.1 秒程度以内だと、直接操作している感覚が得られます。" },
      { q: "騒音の大きい工場で、作業者本人だけに確実に伝えたい通知に向くのは?", choices: ["小さな音", "身に着けた機器の振動と表示", "画面の隅の小さなアイコン"], answer: 1, explain: "振動は騒音の影響を受けず本人だけに伝わります。表示と併用します。" },
      { q: "報知音の設計で適切なのは?", choices: ["機能ごとにすべて違うメロディーにする", "意味ごとに少数のパターンを決め、製品群で統一する", "高い周波数だけを使う"], answer: 1, explain: "音の種類が多いと区別できません。高音だけでは高齢者に聞こえにくくなります。" },
    ],
    lessons: ["9-1"],
  },
  {
    id: "interaction-hw",
    part: "ux",
    title: "【上級】機械の操作パネルと組込み画面の UX",
    minutes: 25,
    level: 3,
    lead: "産業機械や家電の操作部は、物理ボタンと画面を組み合わせて作られます。役割分担、画面遷移、状態表示、アラーム画面、多言語・アイコンの扱いを、HMI (ヒューマン・マシン・インタフェース) 設計のチェックリストとしてまとめます。",
    body: `
<h2>物理操作と画面の役割分担</h2>
<table class="tb-table">
  <tr><th>物理操作具に任せる</th><th>画面に任せる</th></tr>
  <tr><td>非常停止 (画面に頼らない、独立した安全回路)</td><td>設定値の入力・確認</td></tr>
  <tr><td>起動・停止・一時停止など頻繁で即時性が必要な操作</td><td>レシピ・プログラムの選択、多数の選択肢</td></tr>
  <tr><td>微調整 (ジョグダイヤル、オーバーライドつまみ)</td><td>状態の詳細、履歴、グラフ</td></tr>
  <tr><td>見ずに・手袋で行う操作</td><td>ヘルプ、手順の案内、アラームの原因と対処</td></tr>
</table>
<svg class="tb-chart" viewBox="0 0 520 236" role="img" aria-label="操作パネルのレイアウト例">

<defs><radialGradient id="ih-estop" cx="0.38" cy="0.32" r="0.75"><stop offset="0" stop-color="#ff6b5e"/><stop offset="0.6" stop-color="#c62828"/><stop offset="1" stop-color="#7f1414"/></radialGradient></defs>
<g class="k-shadow"><rect class="k-alu" x="14" y="10" width="492" height="212" rx="10"/></g>
<circle cx="26" cy="22" r="3" class="k-sphere"/><circle cx="26" cy="210" r="3" class="k-sphere"/><circle cx="494" cy="22" r="3" class="k-sphere"/><circle cx="494" cy="210" r="3" class="k-sphere"/>
<rect x="34" y="28" width="282" height="176" rx="6" style="fill:var(--k-line-2);stroke:var(--k-line)" stroke-width="1.4"/>
<rect x="40" y="34" width="270" height="164" style="fill:var(--tb-surface);stroke:var(--k-line)"/>
<rect x="40" y="34" width="270" height="22" style="fill:var(--tb-good)"/><text x="50" y="50" fill="#fff" font-size="12" font-weight="700">● 自動運転中　P12</text>
<text class="tick" x="50" y="78">主軸 1 200 rpm　送り 100 %</text><text class="tick" x="50" y="98">加工数 37 / 50</text>
<rect x="50" y="108" width="250" height="8" rx="4" style="fill:var(--tb-surface-2);stroke:var(--tb-text-3)"/><rect x="50" y="108" width="185" height="8" rx="4" style="fill:var(--tb-accent)"/>
<g style="fill:var(--tb-surface-2);stroke:var(--tb-text-3)"><rect x="42" y="164" width="62" height="32" rx="3"/><rect x="108" y="164" width="62" height="32" rx="3"/><rect x="174" y="164" width="62" height="32" rx="3"/><rect x="240" y="164" width="68" height="32" rx="3"/></g>
<text class="tick" x="73" y="184" text-anchor="middle">ホーム</text><text class="tick" x="139" y="184" text-anchor="middle">設定</text><text class="tick" x="205" y="184" text-anchor="middle">履歴</text><text class="tick" x="274" y="184" text-anchor="middle">アラーム</text>
<rect x="378" y="18" width="84" height="84" rx="6" fill="#fbc02d" stroke="#8a6d00" stroke-width="1.2"/>
<circle class="k-part" cx="420" cy="60" r="27"/>
<g class="k-shadow"><circle cx="420" cy="60" r="23" fill="url(#ih-estop)" stroke="#5c0f0f" stroke-width="1.2"/></g>
<text x="420" y="64" text-anchor="middle" fill="#fff" font-size="9" font-weight="700" opacity="0.85">STOP</text>
<text class="mark-t" x="420" y="118" text-anchor="middle">非常停止</text>
<circle class="k-part" cx="358" cy="146" r="19"/><circle cx="358" cy="146" r="14" style="fill:var(--tb-good)" stroke="#000" stroke-opacity="0.3"/><ellipse cx="353" cy="140" rx="5" ry="3" fill="#fff" opacity="0.4"/>
<circle class="k-part" cx="410" cy="146" r="19"/><circle cx="410" cy="146" r="14" style="fill:var(--k-line-2)" stroke="#000" stroke-opacity="0.3"/><ellipse cx="405" cy="140" rx="5" ry="3" fill="#fff" opacity="0.4"/>
<line class="k-thin" x1="456.5" y1="128.9" x2="453.9" y2="125.8" stroke-width="1.3"/><line class="k-thin" x1="462.8" y1="125.3" x2="461.4" y2="121.5" stroke-width="1.3"/><line class="k-thin" x1="470.0" y1="124.0" x2="470.0" y2="120.0" stroke-width="1.3"/><line class="k-thin" x1="477.2" y1="125.3" x2="478.6" y2="121.5" stroke-width="1.3"/><line class="k-thin" x1="483.5" y1="128.9" x2="486.1" y2="125.8" stroke-width="1.3"/>
<g class="k-shadow"><circle cx="470" cy="145" r="17" style="fill:var(--k-steel-3);stroke:var(--k-line)"/><circle class="k-part" cx="470" cy="145" r="13"/></g>
<line x1="470" y1="145" x2="470" y2="132" style="stroke:var(--tb-accent)" stroke-width="3.5"><animateTransform attributeName="transform" type="rotate" values="-40 470 145;40 470 145;-40 470 145" keyTimes="0;0.5;1" calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1" dur="4s" repeatCount="indefinite"/></line>
<text class="mark-t" x="358" y="186" text-anchor="middle">起動</text><text class="mark-t" x="410" y="186" text-anchor="middle">停止</text><text class="mark-t" x="470" y="186" text-anchor="middle">送り</text>
</svg>
<p class="tb-caption">図: 操作パネルの例。画面は状態と設定、物理操作具は非常停止・起動停止・オーバーライドを担当する。</p>
<h2>画面遷移の設計</h2>
<ul>
  <li><b>浅く広く</b>: よく使う機能はホームから 1〜2 回の操作で届くように。階層は深くしすぎない</li>
  <li><b>常に現在地と帰り道</b>: 画面タイトル (どこにいるか)、「戻る」「ホーム」を固定位置に</li>
  <li><b>運転中に変更できない設定</b>は、理由を表示してグレーアウト</li>
  <li>設定の変更は「入力 → 確認 → 反映」と段階を明確にし、反映前の値と後の値を並べて示す</li>
  <li>画面遷移図を作り、行き止まりや迷路になっている所がないかチェックする</li>
</ul>
<svg class="tb-chart" role="img" viewBox="0 0 520 190" aria-label="画面遷移図">
  <defs><marker id="ih-ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path style="fill:var(--tb-text-2)" d="M0,0 L10,5 L0,10 z"/></marker></defs>
  <rect style="fill:color-mix(in srgb, var(--tb-accent) 25%, transparent);stroke:var(--tb-accent)" x="210" y="15" width="100" height="32" rx="6" stroke-width="2"/><text class="mark-t" x="260" y="36" text-anchor="middle">ホーム</text>
  <rect style="fill:var(--tb-surface-2);stroke:var(--tb-text-2)" x="30" y="90" width="100" height="32" rx="6"/><text class="mark-t" x="80" y="111" text-anchor="middle">運転</text>
  <rect style="fill:var(--tb-surface-2);stroke:var(--tb-text-2)" x="160" y="90" width="100" height="32" rx="6"/><text class="mark-t" x="210" y="111" text-anchor="middle">設定</text>
  <rect style="fill:var(--tb-surface-2);stroke:var(--tb-text-2)" x="290" y="90" width="100" height="32" rx="6"/><text class="mark-t" x="340" y="111" text-anchor="middle">履歴</text>
  <rect style="fill:color-mix(in srgb, var(--tb-bad) 20%, transparent);stroke:var(--tb-bad)" x="410" y="90" width="90" height="32" rx="6"/><text class="mark-t" x="455" y="111" text-anchor="middle">アラーム</text>
  <rect style="fill:var(--tb-surface-2);stroke:var(--tb-text-2)" x="160" y="150" width="100" height="32" rx="6"/><text class="mark-t" x="210" y="171" text-anchor="middle">設定の確認</text>
  <path style="stroke:var(--tb-text-2)" d="M240,47 L90,88 M255,47 L215,88 M265,47 L335,88 M280,47 L445,88 M210,122 L210,148" fill="none" marker-end="url(#ih-ar)"/>
  <text class="tick" x="440" y="160" text-anchor="middle">どの画面からも</text><text class="tick" x="440" y="176" text-anchor="middle">アラームへ 1 タップ</text>
</svg>
<p class="tb-caption">図: 画面遷移図の例。階層は浅く、アラーム画面へはどこからでも直接行ける。</p>
<h2>状態表示</h2>
<ul>
  <li>装置の状態 (停止・準備完了・運転中・一時停止・異常・保守中) を<b>定義して漏れなく</b>表示する。状態遷移図を作って画面と照合する</li>
  <li>離れた所から分かるよう、積層信号灯 (シグナルタワー) と画面上部の状態バーの色を一致させる</li>
  <li>色に加えて文字・アイコン・点滅を併用 (色覚の多様性、逆光)</li>
  <li>手動モード・保守モードなど危険の大きい状態は特に目立たせる</li>
</ul>
<h2>アラーム画面</h2>
<ol class="tb-flow">
  <li><b>何が起きたか</b> — 「主軸モータ過負荷」(コードは補足として併記)</li>
  <li><b>どこで</b> — 装置図の上で場所を示す</li>
  <li><b>どうすればよいか</b> — 確認箇所と手順、リセットの方法</li>
  <li><b>優先度</b> — 重大度で色と並び順を分け、最初に発生したアラーム (根本原因の可能性が高い) を分かるように</li>
  <li><b>履歴</b> — 発生・解除時刻を記録し、保守に活かす</li>
</ol>
<p>一度に大量のアラームが出る「アラームの洪水」では、操作者は重要なものを見落とします。連鎖して出る二次的なアラームはまとめる・抑制するなど、<b>本当に対処が必要なものだけ</b>を出す設計 (アラームマネジメント) が重要です。</p>
<h2>多言語とアイコン</h2>
<ul>
  <li>翻訳で文字列の長さが変わる (英語→ドイツ語などで長くなることが多い) ため、ボタン幅に余裕を持たせ、レイアウトを確認する</li>
  <li>文字列をプログラムに直書きせず、言語ファイルに分離する。数値・日付・単位の書式も地域で変わる</li>
  <li>アイコンは<b>文字ラベルと併用</b>が基本。意味が文化で変わるもの (手のジェスチャ、色) に注意</li>
  <li>安全標識は ISO 7010 などの標準図記号を使う。独自アイコンは理解度をテストする</li>
</ul>
<h2>HMI のチェックリスト</h2>
<ul>
  <li>□ 非常停止は画面と独立し、どの操作位置からも届くか</li>
  <li>□ 現在の状態とモードが常に、離れても分かるか</li>
  <li>□ 押した瞬間に受付のフィードバックがあるか</li>
  <li>□ 「戻る」「ホーム」が固定位置にあり、行き止まりがないか</li>
  <li>□ アラームは原因・場所・対処を言葉で示し、優先度で並ぶか</li>
  <li>□ 危険な操作は二段操作・長押し・権限で保護されているか</li>
  <li>□ ボタンは手袋で押せる物理寸法か、文字は視距離に対して十分か</li>
  <li>□ 翻訳しても文字があふれないか、アイコンに文字が添えられているか</li>
  <li>□ 実際の作業者に、実際の環境 (照明・騒音・手袋) でテストしたか</li>
</ul>
<div class="tb-tip"><b>3DCAD Studio</b>: 操作盤の筐体と人の簡易モデルをアセンブリに配置し、拘束を駆動して腕を動かして非常停止へのリーチを確認しましょう。文字 (刻印/エンボス) でボタンのラベルを入れ、リアル表示で見え方を確かめ、3D プリント試作で画面とボタンの位置関係を検証できます。</div>`,
    points: [
      "非常停止・頻繁な即時操作は物理操作具、設定・情報は画面に",
      "画面遷移は浅く、現在地と帰り道を常に示す。遷移図で行き止まりを確認",
      "状態は定義して漏れなく表示し、信号灯と色をそろえ、色以外の手がかりも併用",
      "アラームは原因・場所・対処・優先度。洪水を防ぎ、多言語・アイコンには余裕と文字ラベル",
    ],
    exercises: [
      {
        q: "ある装置のアラームは「AL-503」とだけ表示され、1 回の停止で関連するアラームが 20 件並びます。改善案を挙げてください。",
        a: "例: ① 「AL-503 クーラント液面低下」と内容を言葉で表示し、タンクの位置を装置図で示す。② 対処手順 (補給 → リセット) を表示する。③ 最初に発生したアラームを先頭に強調し、連鎖して出る二次アラーム (ポンプ停止・温度上昇など) はまとめて折りたたむ。④ 重大度で色と並び順を分ける。⑤ 発生・解除時刻を履歴に残し、頻発するアラームは設計側で原因を対策する。",
      },
    ],
    quiz: [
      { q: "非常停止を画面上のボタンだけで実現するのが不適切な主な理由は?", choices: ["画面のボタンは小さいから", "画面やソフトの故障時にも確実に停止できる独立した手段が必要だから", "画面のボタンは色が付けられないから"], answer: 1, explain: "非常停止は画面・ソフトに依存しない独立した物理的手段とし、安全回路で実現します。" },
      { q: "アラームの洪水への対策として適切なのは?", choices: ["すべてのアラームを同じ色で表示する", "最初のアラームを強調し、連鎖する二次アラームをまとめる", "アラーム音を大きくする"], answer: 1, explain: "根本原因の可能性が高い最初のアラームを分かるようにし、対処の必要なものに絞ります。" },
      { q: "多言語対応の画面設計で注意すべきことは?", choices: ["文字列をプログラムに直書きする", "翻訳で文字列が長くなっても収まるよう余裕を持たせる", "アイコンだけにして文字をなくす"], answer: 1, explain: "言語により文字列の長さが変わるため、レイアウトに余裕を持たせ、言語ファイルに分離します。" },
    ],
    lessons: ["9-1"],
  },
  {
    id: "inclusive-cases",
    part: "ux",
    title: "【中級】インクルーシブデザインの実例",
    minutes: 20,
    level: 2,
    lead: "インクルーシブデザインは、これまで設計から外されがちだった人たちを最初から想定し、一緒に考える方法です。高齢者、子ども、左利き、車いす、手袋作業、色覚の多様性への配慮を、悪い例と良い例の対比で見ていきます。",
    body: `
<h2>インクルーシブデザインとは</h2>
<p>ユニバーサルデザインが「多くの人が使える結果」を目指すのに対し、インクルーシブデザインは<b>排除されがちな人 (極端な利用者) を設計の過程に巻き込む</b>ことを重視します。ある人のための工夫が、一時的・状況的な制約を持つ多くの人の役にも立つ (例: 片腕の人のための片手操作 → 赤ちゃんを抱いた人、ケガをした人にも便利) という考え方です。</p>
<h2>高齢者と握力: つまみと持ち手</h2>
<svg class="tb-chart" viewBox="0 0 520 180" role="img" aria-label="小さなつまみと大きな持ち手">

<g class="k-shadow"><circle class="k-sphere" cx="90" cy="80" r="14"/></g><text class="tick" x="90" y="83" text-anchor="middle" font-size="6">温度</text>
<circle class="k-badge" cx="30" cy="126" r="10" style="fill:var(--tb-bad)"/><text class="k-badge-t" x="30" y="130" text-anchor="middle">✕</text><text class="k-bad-t" x="44" y="131">小さく滑らか</text><text class="tick" x="90" y="150" text-anchor="middle">小さい文字・低コントラスト</text>
<line x1="265.4" y1="60.0" x2="260.2" y2="57.0" style="stroke:var(--tb-text)" stroke-width="2"/><line x1="280.0" y1="45.4" x2="277.0" y2="40.2" style="stroke:var(--tb-text)" stroke-width="2"/><line x1="300.0" y1="40.0" x2="300.0" y2="34.0" style="stroke:var(--tb-text)" stroke-width="2"/><line x1="320.0" y1="45.4" x2="323.0" y2="40.2" style="stroke:var(--tb-text)" stroke-width="2"/><line x1="334.6" y1="60.0" x2="339.8" y2="57.0" style="stroke:var(--tb-text)" stroke-width="2"/>
<g class="k-shadow"><circle cx="300" cy="80" r="34" style="fill:var(--k-steel-3);stroke:var(--k-line)" stroke-width="1.4"/><circle class="k-part" cx="300" cy="80" r="30"/>
<g><animateTransform attributeName="transform" type="rotate" values="-60 300 80;60 300 80;-60 300 80" keyTimes="0;0.5;1" calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1" dur="4s" repeatCount="indefinite"/><rect class="k-accent" x="293" y="46" width="14" height="68" rx="6"/><path d="M300,50 L300,62" stroke="#fff" stroke-width="3"/></g></g>
<text class="mark-t" x="354" y="46" font-size="14">高</text><text class="mark-t" x="232" y="46" font-size="14">低</text>
<circle class="k-badge" cx="220" cy="134" r="10" style="fill:var(--tb-good)"/><text class="k-badge-t" x="220" y="138" text-anchor="middle">✓</text><text class="k-good-t" x="234" y="139">大径 + つまみ板</text><text class="tick" x="300" y="158" text-anchor="middle">小さなトルクで回せ、向きで設定が分かる</text>
<text class="mark-t" x="420" y="84">文字は大きく</text><text class="mark-t" x="420" y="102">高コントラストで</text>
</svg>
<p class="tb-caption">図: 握力や指先の感覚が弱い人には、径が大きく指をかけられる形のつまみが回しやすい。板の向きが設定値の表示を兼ねる。</p>
<h2>子ども: 安全と手の届く範囲</h2>
<ul>
  <li>危険な機能 (高温・刃物・薬品) は子どもが操作できない<b>チャイルドロック</b>: 押しながら回す、長押し、2 か所同時押し</li>
  <li>飲み込みの危険がある小部品・ボタン電池は工具なしで外れないように</li>
  <li>逆に、子どもが使うもの (手洗い台、案内表示) は背の低い人の視線とリーチで設計</li>
</ul>
<h2>左利き: 左右どちらでも</h2>
<svg class="tb-chart" viewBox="0 0 520 170" role="img" aria-label="右手専用と左右対称の設計">

<rect class="k-panel" x="8" y="8" width="164" height="154"/><rect class="k-panel" x="178" y="8" width="164" height="154"/><rect class="k-panel" x="348" y="8" width="164" height="154"/>
<g class="k-shadow"><rect class="k-part" x="148" y="66" width="20" height="28" rx="3"/><path class="k-plastic" d="M30,60 L150,60 L150,100 L130,100 q-10,22 -20,0 q-10,22 -20,0 q-10,22 -20,0 q-10,16 -20,4 Q30,104 30,84 Z"/></g>
<path d="M40,64 Q36,80 42,96" class="k-thin"/>
<text class="k-note" x="90" y="40" text-anchor="middle">指の溝が片側だけ</text>
<circle class="k-badge" cx="22" cy="140" r="10" style="fill:var(--tb-bad)"/><text class="k-badge-t" x="22" y="144" text-anchor="middle">✕</text><text class="k-bad-t" x="36" y="145">右手専用の指溝グリップ</text>
<g class="k-shadow"><rect class="k-part" x="318" y="66" width="18" height="28" rx="3"/><rect class="k-plastic" x="196" y="52" width="124" height="56" rx="26"/></g>
<line class="k-center" x1="190" y1="80" x2="326" y2="80"/>
<circle class="k-badge" cx="192" cy="140" r="10" style="fill:var(--tb-good)"/><text class="k-badge-t" x="192" y="144" text-anchor="middle">✓</text><text class="k-good-t" x="206" y="145">左右対称の握り</text>
<g class="k-shadow"><rect class="k-plastic" x="370" y="36" width="120" height="84" rx="10"/></g>
<rect x="392" y="48" width="76" height="44" rx="3" style="fill:var(--tb-surface);stroke:var(--k-line)"/>
<rect class="k-accent" x="376" y="94" width="18" height="20" rx="4"/><rect class="k-accent" x="466" y="94" width="18" height="20" rx="4"/>
<line class="k-center" x1="430" y1="28" x2="430" y2="126"/>
<circle class="k-badge" cx="362" cy="140" r="10" style="fill:var(--tb-good)"/><text class="k-badge-t" x="362" y="144" text-anchor="middle">✓</text><text class="k-good-t" x="376" y="145">両側に操作ボタン</text>
</svg>
<p class="tb-caption">図: 右手の指に合わせた溝は左手では握りにくい。左右対称の形や両側の操作ボタンなら利き手を選ばない。</p>
<h2>車いす: 高さと足元</h2>
<svg class="tb-chart" viewBox="0 0 520 232" role="img" aria-label="車いすでの操作盤">

<rect class="k-ground" x="20" y="200" width="480" height="8"/><line class="k-edge" x1="20" y1="200" x2="500" y2="200"/>
<g class="k-shadow">
<path d="M70,98 L70,146 L130,146" fill="none" style="stroke:var(--k-line)" stroke-width="4"/>
<path d="M70,98 L58,92" fill="none" style="stroke:var(--k-line)" stroke-width="4"/>
<path d="M130,146 L148,190 L162,190" fill="none" style="stroke:var(--k-line)" stroke-width="3"/>
<path d="M112,146 L150,190" fill="none" style="stroke:var(--k-line-2)" stroke-width="3"/>
<circle cx="150" cy="192" r="8" class="k-sphere"/>
</g>
<g class="k-shadow"><path d="M92.0,144.0 L132.0,140.0 L136.0,184.0" fill="none" style="stroke:var(--k-line)" stroke-width="12.9"/><path d="M92.0,144.0 L132.0,140.0 L136.0,184.0" fill="none" style="stroke:var(--k-line-2)" stroke-width="10.5"/><path d="M132.0,181.0 L145.0,183.0 Q150.0,184.0 150.0,187.5 L131.0,187.5 Z" fill="#2b3340" style="stroke:var(--k-line)" stroke-width="1"/><path d="M94.0,90.0 L106.0,114.0" fill="none" style="stroke:var(--k-line)" stroke-width="9.9"/><path d="M106.0,114.0 L128.0,120.0" fill="none" style="stroke:var(--k-line)" stroke-width="8.4"/><path d="M94.0,90.0 L106.0,114.0" fill="none" style="stroke:var(--k-accent-2)" stroke-width="7.5"/><path d="M106.0,114.0 L128.0,120.0" fill="none" style="stroke:var(--k-skin-2)" stroke-width="6.0"/><circle class="k-skin" cx="128" cy="120" r="4.0"/><path d="M96.0,79.0 L94.0,90.0" fill="none" style="stroke:var(--k-line)" stroke-width="8.4"/><path d="M96.0,79.0 L94.0,90.0" fill="none" style="stroke:var(--k-skin-1)" stroke-width="6.0"/><path d="M94.0,90.0 L92.0,144.0" fill="none" style="stroke:var(--k-line)" stroke-width="21.4"/><path d="M94.0,90.0 L92.0,144.0" fill="none" style="stroke:var(--k-accent-1)" stroke-width="19.0"/><path d="M92.0,144.0 L138.0,142.0 L142.0,184.0" fill="none" style="stroke:var(--k-line)" stroke-width="13.4"/><path d="M92.0,144.0 L138.0,142.0 L142.0,184.0" fill="none" style="stroke:var(--k-steel-3)" stroke-width="11.0"/><path d="M138.0,181.0 L151.0,183.0 Q156.0,184.0 156.0,187.5 L137.0,187.5 Z" fill="#2b3340" style="stroke:var(--k-line)" stroke-width="1"/><circle class="k-skin" cx="98" cy="70" r="11.0"/><path d="M108.2,70.5 l2.6,3.2 l-2.8,0.6" class="k-skin" stroke-width="1"/><path d="M107.0,64.0 A11.0,11.0 0 1 0 90.1,77.5 Q96.3,71.1 107.0,64.0 Z" fill="#4a3728" style="stroke:var(--k-line)" stroke-width="1"/><circle cx="104.0" cy="69.8" r="1.4" style="fill:var(--k-line)"/><path d="M94.0,90.0 L114.0,112.0" fill="none" style="stroke:var(--k-line)" stroke-width="10.4"/><path d="M114.0,112.0 L142.0,112.0" fill="none" style="stroke:var(--k-line)" stroke-width="8.9"/><path d="M94.0,90.0 L114.0,112.0" fill="none" style="stroke:var(--k-accent-1)" stroke-width="8.0"/><path d="M114.0,112.0 L142.0,112.0" fill="none" style="stroke:var(--k-skin-1)" stroke-width="6.5"/><circle class="k-skin" cx="142" cy="112" r="4.3"/></g>
<g class="k-shadow"><circle cx="80" cy="160" r="40" fill="none" style="stroke:var(--k-line)" stroke-width="6"/><circle cx="80" cy="160" r="34" fill="none" style="stroke:var(--k-line-2)" stroke-width="2"/><line x1="80" y1="160" x2="114.0" y2="160.0" class="k-thin"/><line x1="80" y1="160" x2="109.4" y2="177.0" class="k-thin"/><line x1="80" y1="160" x2="97.0" y2="189.4" class="k-thin"/><line x1="80" y1="160" x2="80.0" y2="194.0" class="k-thin"/><line x1="80" y1="160" x2="63.0" y2="189.4" class="k-thin"/><line x1="80" y1="160" x2="50.6" y2="177.0" class="k-thin"/><line x1="80" y1="160" x2="46.0" y2="160.0" class="k-thin"/><line x1="80" y1="160" x2="50.6" y2="143.0" class="k-thin"/><line x1="80" y1="160" x2="63.0" y2="130.6" class="k-thin"/><line x1="80" y1="160" x2="80.0" y2="126.0" class="k-thin"/><line x1="80" y1="160" x2="97.0" y2="130.6" class="k-thin"/><line x1="80" y1="160" x2="109.4" y2="143.0" class="k-thin"/><circle cx="80" cy="160" r="5" class="k-sphere"/></g>
<g class="k-shadow"><rect class="k-alu" x="186" y="14" width="22" height="186"/></g>
<rect x="190" y="22" width="14" height="14" rx="2" style="fill:var(--tb-bad);stroke:var(--k-line)"/><text class="k-bad-t" x="214" y="34">× 高すぎるボタン</text>
<rect x="190" y="106" width="14" height="14" rx="2" style="fill:var(--tb-good);stroke:var(--k-line)"/><text class="k-good-t" x="214" y="118">○ 座った肩の高さ付近</text>
<path d="M148,112 L188,113" style="stroke:var(--tb-accent)" stroke-width="2" stroke-dasharray="4 3"/>
<g class="k-shadow"><rect class="k-part" x="300" y="130" width="180" height="10" rx="2"/><rect class="k-alu" x="466" y="140" width="8" height="60"/>
<rect class="k-plastic" x="300" y="140" width="70" height="60"/><line class="k-thin" x1="300" y1="160" x2="370" y2="160"/><line class="k-thin" x1="300" y1="180" x2="370" y2="180"/><line class="k-edge" x1="328" y1="150" x2="342" y2="150"/><line class="k-edge" x1="328" y1="170" x2="342" y2="170"/></g>
<line class="k-ext" x1="380" y1="140" x2="380" y2="198"/><line class="k-dimline" x1="420" y1="142" x2="420" y2="198"/>
<text class="k-bad-t" x="300" y="222">× 収納で足が入らない</text>
<text class="k-good-t" x="426" y="122" text-anchor="middle">○ ひざ下の空間</text>
</svg>
<p class="tb-caption">図: 車いす利用者は座った姿勢で届く高さと、正面から近づくためのひざ下の空間が必要 (具体的な数値は規格・ガイドラインで確認)。</p>
<h2>手袋作業: 大きさとすき間</h2>
<svg class="tb-chart" viewBox="0 0 520 150" role="img" aria-label="手袋で押すボタン">

<g class="k-shadow"><rect class="k-part" x="22" y="34" width="114" height="32" rx="4"/></g>
<rect x="30" y="40" width="20" height="20" rx="3" style="fill:var(--k-steel-1);stroke:var(--k-line)"/><rect x="56" y="40" width="20" height="20" rx="3" style="fill:var(--k-steel-1);stroke:var(--k-line)"/><rect x="82" y="40" width="20" height="20" rx="3" style="fill:var(--k-steel-1);stroke:var(--k-line)"/><rect x="108" y="40" width="20" height="20" rx="3" style="fill:var(--k-steel-1);stroke:var(--k-line)"/>
<ellipse cx="66" cy="50" rx="24" ry="18" style="fill:var(--tb-warn)" opacity="0.5"/>
<text class="k-bad-t" x="80" y="100" text-anchor="middle">× 小さく密集 → 2 つ同時に押す</text>
<g class="k-shadow"><rect class="k-part" x="258" y="22" width="208" height="60" rx="6"/></g>
<rect x="270" y="30" width="44" height="44" rx="6" class="k-sphere"/><rect x="340" y="30" width="44" height="44" rx="6" class="k-sphere"/><rect x="410" y="30" width="44" height="44" rx="6" class="k-sphere"/>
<ellipse cx="362" cy="52" rx="24" ry="18" style="fill:var(--tb-warn)" opacity="0.5"><animate attributeName="cx" values="292;362;432;362;292" dur="5s" repeatCount="indefinite"/></ellipse>
<text class="k-good-t" x="362" y="100" text-anchor="middle">○ 大きく間隔を空け、クリック感</text>
<text class="tick" x="260" y="135" text-anchor="middle">楕円 = 手袋の指先の接触範囲</text>
</svg>
<p class="tb-caption">図: 手袋の指先は素手より太い。ボタンを大きく、間隔を空け、クリック感で押したことが分かるようにする。</p>
<h2>色覚の多様性: グラフと表示灯</h2>
<svg class="tb-chart" role="img" viewBox="0 0 520 170" aria-label="色だけのグラフと形を併用したグラフ">
  <line class="axis" x1="30" y1="130" x2="230" y2="130"/>
  <polyline points="40,110 90,80 140,90 190,50 220,60" fill="none" stroke="#d32f2f" stroke-width="2.5"/>
  <polyline points="40,100 90,95 140,70 190,75 220,45" fill="none" stroke="#388e3c" stroke-width="2.5"/>
  <text style="fill:var(--tb-bad)" class="lbl" x="130" y="155" text-anchor="middle">× 赤と緑の線だけ・凡例が離れている</text>
  <line class="axis" x1="290" y1="130" x2="490" y2="130"/>
  <polyline points="300,110 350,80 400,90 450,50 480,60" fill="none" stroke="#d55e00" stroke-width="2.5"/>
  <polyline points="300,100 350,95 400,70 450,75 480,45" fill="none" stroke="#0072b2" stroke-width="2.5" stroke-dasharray="6 4"/>
  <circle cx="350" cy="80" r="4" fill="#d55e00"/><circle cx="450" cy="50" r="4" fill="#d55e00"/><rect x="346" y="91" width="8" height="8" fill="#0072b2"/><rect x="446" y="71" width="8" height="8" fill="#0072b2"/>
  <text class="tick" x="484" y="64">A</text><text class="tick" x="484" y="44">B</text>
  <text style="fill:var(--tb-good)" class="lbl" x="390" y="155" text-anchor="middle">○ 区別しやすい色 + 線種 + 直接ラベル</text>
</svg>
<p class="tb-caption">図: 赤と緑だけで区別するグラフ (左) は、色覚によって判別しにくい。オレンジと青など区別しやすい組合せに線種・マーカー・直接ラベルを加える (右)。</p>
<h2>進め方</h2>
<ol class="tb-flow">
  <li><b>排除を見つける</b> — 誰がこの製品を使えないか、どんな状況で使えなくなるかを洗い出す</li>
  <li><b>当事者と一緒に</b> — 該当する人に観察・インタビュー・試作評価に参加してもらう</li>
  <li><b>一人のための解決を多くの人へ</b> — 状況的制約 (片手・暗所・騒音・手袋) にも広げて検討</li>
  <li><b>試作で確かめる</b> — 3D プリントなどの試作を実際に使ってもらう</li>
</ol>
<div class="tb-tip"><b>3DCAD Studio</b>: パラメータでつまみ径・ボタン寸法・間隔の違う案を作り、3D プリント試作で高齢者や手袋をした作業者に試してもらいましょう。アセンブリに座った人の簡易モデルを置くと、車いすからのリーチやひざ下の空間を確認できます。材料と色で、色覚に配慮した配色も検討できます。</div>`,
    points: [
      "排除されがちな人を最初から設計の過程に巻き込む",
      "高齢者には大きく回しやすい操作部、子どもにはチャイルドロック",
      "左利き・車いす・手袋作業 — 対称形、低い位置とひざ下空間、大きなボタンと間隔",
      "色覚の多様性には、区別しやすい色 + 形・線種・直接ラベル",
    ],
    exercises: [
      {
        q: "公共施設に置く発券機の操作部を、本章の 6 つの観点 (高齢者・子ども・左利き・車いす・手袋・色覚) で見直す改善案を挙げてください。",
        a: "例: 高齢者 = 大きな文字と高コントラスト、大きなボタン、音声案内。子ども = 背の低い人も画面が見える傾斜・高さ、取出口で指を挟まない形状。左利き = 発券口・カード挿入口を中央に、左右どちらからでも操作できる配置。車いす = 操作部を低めに置き、正面に近づける足元空間、画面の映り込み対策。手袋 = 冬季の手袋でも押せる物理ボタンまたは感度の高いタッチ、ボタン間隔を広く。色覚 = 「発券」「取消」を色だけでなく文字・位置・形で区別。",
      },
    ],
    quiz: [
      { q: "インクルーシブデザインの特徴として適切なのは?", choices: ["平均的な利用者だけを想定する", "排除されがちな人を設計の過程に巻き込む", "障害者専用の製品を別に作る"], answer: 1, explain: "極端な利用者を巻き込むことで、多くの人に役立つ解決が見つかります。" },
      { q: "色覚の多様性に配慮したグラフとして最も適切なのは?", choices: ["赤と緑の実線", "区別しやすい色に線種・マーカー・直接ラベルを併用", "すべて灰色"], answer: 1, explain: "色だけに頼らず、複数の手がかりで区別できるようにします。" },
      { q: "手袋作業の操作部で重要なのは?", choices: ["ボタンを小さく密集させる", "大きなボタン・広い間隔・クリック感", "静電容量式の小さなタッチキー"], answer: 1, explain: "手袋の指先は太く感覚も鈍るため、大きさ・間隔・手応えが重要です。" },
    ],
    lessons: ["7-2"],
  },
  {
    id: "ux-metrics",
    part: "ux",
    title: "【上級】UX を数字で測る",
    minutes: 25,
    level: 3,
    lead: "「使いやすくなった」を数字で示せると、設計の判断や説得がしやすくなります。タスク成功率・所要時間・エラー率・SUS・NPS の計算と、少人数テストの数字をどこまで信じてよいかの考え方を学びます。",
    body: `
<h2>主な指標</h2>
<table class="tb-table">
  <tr><th>指標</th><th>計算</th><th>注意</th></tr>
  <tr><td>タスク成功率</td><td>成功した人数 ÷ 試行した人数</td><td>「成功」の基準 (助けなし・制限時間内など) を事前に決める</td></tr>
  <tr><td>所要時間</td><td>成功した試行の時間</td><td>分布が右に長い (一部の人が非常に遅い) ため、平均より中央値や幾何平均が代表値に向くことが多い</td></tr>
  <tr><td>エラー率</td><td>エラー数 ÷ エラーの機会の数 (または 1 試行あたりのエラー数)</td><td>何をエラーとするかを定義する</td></tr>
  <tr><td>SUS</td><td>10 項目質問紙 → 0〜100</td><td>平均はおよそ 68 (目安)。パーセントではない</td></tr>
  <tr><td>NPS</td><td>推奨者 % − 批判者 %</td><td>製品全体の推奨意向。使いやすさだけの指標ではない</td></tr>
</table>
<h2>所要時間の代表値</h2>
<p>5 人の所要時間が 30, 45, 60, 40, 120 秒だったとします。算術平均は (30 + 45 + 60 + 40 + 120) / 5 = <b>59 秒</b>ですが、120 秒の 1 人に引っ張られています。中央値は <b>45 秒</b>、幾何平均 (対数の平均) は約 <b>52 秒</b>です。</p>
<svg class="tb-chart" role="img" viewBox="0 0 520 150" aria-label="所要時間のばらつきと代表値">
  <line class="axis" x1="40" y1="90" x2="500" y2="90"/>
  <text class="tick" x="40" y="108" text-anchor="middle">0</text><text class="tick" x="190" y="108" text-anchor="middle">40</text><text class="tick" x="340" y="108" text-anchor="middle">80</text><text class="tick" x="490" y="108" text-anchor="middle">120 s</text>
  <circle class="mark" cx="152" cy="80" r="6"/><circle class="mark" cx="190" cy="80" r="6"/><circle class="mark" cx="209" cy="80" r="6"/><circle class="mark" cx="265" cy="80" r="6"/><circle class="mark" cx="490" cy="80" r="6"/>
  <line style="stroke:var(--tb-good)" x1="209" y1="40" x2="209" y2="96" stroke-width="2.5"/><text class="tick" x="205" y="34" text-anchor="end">中央値 45</text>
  <line style="stroke:var(--tb-accent)" x1="236" y1="50" x2="236" y2="96" stroke-width="2.5"/><text class="tick" x="240" y="48">幾何平均 52</text>
  <line style="stroke:var(--tb-warn)" x1="261" y1="60" x2="261" y2="96" stroke-width="2.5"/><text class="tick" x="268" y="66">平均 59</text>
  <text class="tick" x="490" y="132" text-anchor="end">1 人の遅い人が平均を押し上げる</text>
</svg>
<p class="tb-caption">図: 所要時間のばらつき。外れた値に強い中央値・幾何平均もあわせて報告する。</p>
<h2>SUS と NPS の計算</h2>
<p>SUS は「UX リサーチと評価手法」の章のとおり、奇数項目 (回答 − 1)、偶数項目 (5 − 回答) の合計 × 2.5 で参加者ごとに計算し、平均します。</p>
<p><b>NPS (ネット・プロモーター・スコア)</b> は「この製品を友人や同僚に薦める可能性は? (0〜10)」の 1 問で測ります。</p>
<div class="tb-formula">NPS = 推奨者 (9〜10) の割合 % − 批判者 (0〜6) の割合 %　　(7〜8 は中立者で計算に入れない)　範囲 −100〜+100</div>
<svg class="tb-chart" role="img" viewBox="0 0 520 140" aria-label="NPS の区分">
  <rect style="fill:var(--tb-bad)" x="30" y="40" width="270" height="30" opacity="0.5"/><rect style="fill:var(--tb-text-3)" x="300" y="40" width="90" height="30" opacity="0.4"/><rect style="fill:var(--tb-good)" x="390" y="40" width="100" height="30" opacity="0.6"/>
  <text class="mark-t" x="165" y="60" text-anchor="middle">批判者 0〜6</text><text class="mark-t" x="345" y="60" text-anchor="middle">中立 7〜8</text><text class="mark-t" x="440" y="60" text-anchor="middle">推奨者 9〜10</text>
  <text class="tick" x="260" y="100" text-anchor="middle">例: 100 人中 推奨者 45 人・中立 35 人・批判者 20 人 → NPS = 45 − 20 = +25</text>
</svg>
<p class="tb-caption">図: NPS の区分。中立者は計算に入らないので、同じ NPS でも分布は様々になりうる。</p>
<h2>少人数テストの限界と有意差の考え方</h2>
<p>5 人中 4 人が成功すれば成功率は 80 % ですが、これは「本当の成功率」の推定値にすぎません。少人数では<b>信頼区間</b> (本当の値がありそうな範囲) が非常に広くなります。少人数の成功率には、<b>調整ワルド法</b> (成功数に 1.92、人数に 3.84 を加えてから計算する簡便法、95 % の場合) がよく使われます。</p>
<div class="tb-formula">p̂ = (x + 1.92) / (n + 3.84)　　95 % 区間 ≈ p̂ ± 1.96 × √( p̂(1 − p̂) / (n + 3.84) )</div>
<pre class="tb-pre">5 人中 4 人成功:   p̂ = 5.92 / 8.84 = 0.670
                  幅 = 1.96 × √(0.670 × 0.330 / 8.84) ≈ 0.31
                  95 % 区間 ≈ 36 % 〜 98 %
10 人中 7 人成功:  p̂ = 8.92 / 13.84 = 0.645 → 区間 ≈ 39 % 〜 90 %</pre>
<svg class="tb-chart" role="img" viewBox="0 0 520 150" aria-label="人数と信頼区間の幅">
  <line class="axis" x1="60" y1="120" x2="500" y2="120"/>
  <text class="tick" x="60" y="138" text-anchor="middle">0 %</text><text class="tick" x="280" y="138" text-anchor="middle">50 %</text><text class="tick" x="500" y="138" text-anchor="middle">100 %</text>
  <text class="tick" x="55" y="44" text-anchor="end">n=5</text><line style="stroke:var(--tb-accent)" x1="218" y1="40" x2="491" y2="40" stroke-width="6" stroke-linecap="round"/><circle class="mark" cx="412" cy="40" r="5"/>
  <text class="tick" x="55" y="74" text-anchor="end">n=10</text><line style="stroke:var(--tb-accent)" x1="232" y1="70" x2="455" y2="70" stroke-width="6" stroke-linecap="round"/><circle class="mark" cx="368" cy="70" r="5"/>
  <text class="tick" x="55" y="104" text-anchor="end">n=100</text><line style="stroke:var(--tb-accent)" x1="327" y1="100" x2="404" y2="100" stroke-width="6" stroke-linecap="round"/><circle class="mark" cx="368" cy="100" r="5"/>
  <text class="tick" x="500" y="20" text-anchor="end">● 観測した成功率、帯 = 95 % 区間 (概算)</text>
</svg>
<p class="tb-caption">図: 人数と 95 % 区間の幅 (n = 5: 4/5、n = 10: 7/10、n = 100: 70/100 のときの概算)。人数が少ないほど区間が広い。</p>
<ul>
  <li><b>問題の発見</b>が目的なら少人数 (5 人程度を繰り返す) でも十分役立つ。1 人でもつまずけば問題の存在は分かる</li>
  <li><b>2 案の比較や数値目標の達成</b>を主張するには、区間が重ならないなど統計的な根拠が必要。少人数で「A 案 80 %、B 案 60 % だから A が良い」とは言えない</li>
  <li>差が偶然で起こりうる確率を評価するのが<b>検定</b> (成功率なら比率の検定、時間なら対数変換して t 検定など)。p &lt; 0.05 を慣例的な基準とすることが多いが、差の大きさ (効果量) と区間もあわせて見る</li>
  <li>同じ人が 2 案を試す場合は、順序の影響 (慣れ) を避けるため半数ずつ順番を入れ替える (カウンターバランス)</li>
</ul>
<div class="tb-tip"><b>3DCAD Studio</b>: パラメータで寸法違いの 2 案を作り、3D プリント試作で組立時間や操作の成功率を測ってみましょう。測定で寸法を記録しておくと、数値の差と設計の差を結び付けて報告できます。</div>`,
    points: [
      "成功率・時間・エラー率・SUS・NPS は、成功やエラーの定義を事前に決めて測る",
      "所要時間は右に裾が長い — 中央値・幾何平均も見る",
      "NPS = 推奨者 % − 批判者 % (中立者は除く)",
      "少人数の数字は区間が広い — 発見には十分、比較の主張には統計的根拠が必要",
    ],
    exercises: [
      {
        q: "NPS 調査で 200 人が回答し、9〜10 点が 70 人、7〜8 点が 80 人、0〜6 点が 50 人でした。NPS は?",
        a: "推奨者 70/200 = 35 %、批判者 50/200 = 25 %。NPS = 35 − 25 = <b>+10</b>。",
      },
      {
        q: "ユーザビリティテストで 10 人中 7 人がタスクに成功しました。成功率と、調整ワルド法による 95 % 区間の概算を求めてください。",
        a: "成功率 7/10 = <b>70 %</b>。p̂ = (7 + 1.92) / (10 + 3.84) = 8.92 / 13.84 ≈ 0.645。幅 = 1.96 × √(0.645 × 0.355 / 13.84) ≈ 1.96 × 0.129 ≈ 0.25。95 % 区間 ≈ <b>39 % 〜 90 %</b>。目標「成功率 80 % 以上」を達成したとも未達とも言い切れません。",
      },
    ],
    quiz: [
      { q: "NPS の計算で、7〜8 点をつけた人はどう扱う?", choices: ["推奨者に含める", "批判者に含める", "中立者として計算に入れない"], answer: 2, explain: "NPS は推奨者 (9〜10) の割合から批判者 (0〜6) の割合を引きます。" },
      { q: "所要時間の代表値として平均だけを報告すると問題になりやすいのは?", choices: ["全員がほぼ同じ時間のとき", "一部の人が極端に遅いとき", "人数が多いとき"], answer: 1, explain: "時間の分布は右に裾が長く、遅い人に平均が引っ張られます。中央値や幾何平均も示します。" },
      { q: "5 人中 4 人成功 (80 %) という結果について正しいのは?", choices: ["本当の成功率は 80 % と確定した", "95 % 区間はおよそ 36〜98 % と広く、比較の主張には不十分", "人数に関係なく信頼できる"], answer: 1, explain: "少人数では区間が非常に広くなります。問題の発見には役立ちますが、数値の比較には統計的根拠が必要です。" },
    ],
    lessons: ["5-1"],
  },
];
