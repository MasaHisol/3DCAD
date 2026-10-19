import type { TextChapter } from "../types";

export const MECHANICS_MORE: TextChapter[] = [
  {
    id: "vibration",
    part: "mechanics",
    title: "振動と固有振動数",
    minutes: 20,
    level: 3,
    lead: "回転する機械は必ず振動を生みます。加振の周波数が構造の固有振動数に近づくと共振し、小さな力でも大きく揺れて壊れます。固有振動数の見積もりと防振の考え方を学びます。",
    body: `
<h2>固有振動数</h2>
<div class="tb-formula">fn = (1 / 2π) √(k / m)　[Hz]</div>
<p>ばねが硬いほど・質量が軽いほど、固有振動数は高くなります。片持ちはりのような連続体には、1 次・2 次 … と複数の固有振動数があります。</p>
<div data-widget="cantilevervib"></div>
<h2>共振</h2>
<p>外から加わる力の周波数 f が固有振動数 fn に近いと、変位は静的なたわみの何倍にもなります (<b>共振</b>)。その倍率は減衰比 ζ で決まり、
共振点では約 1 / (2ζ) 倍 (ζ = 0.05 なら 10 倍) です。金属構造の減衰は小さい (ζ = 0.01〜0.05) ので、共振は特に危険です。</p>
<ul>
  <li>モーターの回転数 (min⁻¹ / 60 = Hz)、ファンの羽根の通過周波数、歯車のかみ合い周波数が代表的な加振源</li>
  <li>設計では、主な加振周波数から固有振動数を <b>±20〜30 % 以上離す</b></li>
  <li>固有振動数を上げる (剛性を上げる・軽くする) のが基本。回転数より十分高くする</li>
</ul>
<h2>防振 — 床に振動を伝えない</h2>
<p>逆に、機械をゴムやばねで<b>柔らかく</b>支えて固有振動数を下げ、f > √2 · fn にすると、床に伝わる力は小さくなります (伝達率 < 1)。
防振ゴムの選定は「固有振動数を加振周波数の 1/3 程度に」が目安です。</p>
<div data-widget="vibration"></div>
<div class="tb-tip"><b>3DCAD Studio</b>: 「応力解析 → 固有値解析」で部品の固有振動数とモード形状を確認し、「動的応答解析」で共振曲線を描けます。リブを足すと固有振動数がどう変わるか試してみましょう。</div>`,
    points: ["fn = (1/2π)√(k/m) — 硬く軽いほど高い", "加振周波数と固有振動数が近いと共振 (倍率 ≈ 1/2ζ)", "固有振動数は加振周波数から 20〜30 % 以上離す", "防振は柔らかく支えて f > √2 fn に"],
    exercises: [
      {
        q: "質量 20 kg の機械をばね定数の合計 50 N/mm の防振ゴムで支えます。固有振動数は? 1500 min⁻¹ のモーターで加振されるとき、防振になっていますか?",
        a: "k = 50 000 N/m、fn = (1/2π)√(50 000 / 20) = 50 / 2π ≈ <b>7.96 Hz</b>。加振は 1500 / 60 = 25 Hz、振動数比 ≈ 3.1 > √2 なので<b>防振領域</b>です (伝達率 ≈ 12 %)。",
      },
    ],
    quiz: [
      { q: "質量を 4 倍にすると固有振動数は?", choices: ["1/4", "1/2", "2 倍"], answer: 1, explain: "fn ∝ √(1/m) なので 1/2 になります。" },
      { q: "3000 min⁻¹ で回るモーターの加振周波数は?", choices: ["50 Hz", "300 Hz", "3000 Hz"], answer: 0, explain: "3000 / 60 = 50 Hz です。" },
      { q: "防振ゴムで床への振動伝達を減らす条件は?", choices: ["f < fn", "f = fn", "f > √2 fn"], answer: 2, explain: "振動数比が √2 を超えると伝達率が 1 より小さくなります。" },
    ],
  },
  {
    id: "heat",
    part: "mechanics",
    title: "熱の設計 — 膨張と放熱",
    minutes: 15,
    level: 2,
    lead: "温度が変わると部品は伸び縮みし、電子部品やモーターは熱を逃がさないと壊れます。熱膨張と熱伝導の基本、放熱設計の考え方を学びます。",
    body: `
<h2>熱膨張</h2>
<div class="tb-formula">ΔL = α × L × ΔT　　拘束されると σ = E α ΔT</div>
<p>アルミは鋼の約 2 倍、樹脂は約 7 倍伸びます。長い部材、異なる材料の組み合わせ、精密な位置決めでは必ず見積もりましょう。</p>
<ul>
  <li>異種材料を長い距離でボルト固定するときは、片側を<b>長穴</b>にして伸びを逃がす</li>
  <li>精密機械では、使用温度 (20 °C 基準) と温度分布を管理する</li>
  <li>樹脂と金属のはめあいは、温度で緩くなったりきつくなったりする</li>
</ul>
<h2>熱の伝わり方</h2>
<table class="tb-table">
  <tr><th>伝導</th><td>物体の中を伝わる: Q = λ A ΔT / t (λ: 熱伝導率。銅 390、アルミ 167、鋼 50、樹脂 0.2 W/(m·K))</td></tr>
  <tr><th>対流</th><td>表面から空気・液体へ: Q = h A ΔT (自然空冷 h ≈ 5〜10、強制空冷 20〜100 W/(m²·K))</td></tr>
  <tr><th>放射</th><td>表面から電磁波で: 黒い面ほど放射しやすい (放射率)</td></tr>
</table>
<div data-widget="thermal"></div>
<h2>放熱設計のコツ</h2>
<ul>
  <li><b>熱抵抗</b> (K/W) を直列につないで考える: 発熱部 → 接触面 → ケース → 空気。一番大きい抵抗を下げる</li>
  <li>表面積を増やす (フィン)。フィンは空気の流れる向きにそろえ、間隔を狭くしすぎない</li>
  <li>接触面には放熱シート・グリースで隙間をなくす</li>
  <li>暖かい空気は上に昇る — 吸気は下、排気は上</li>
</ul>
<div class="tb-tip"><b>3DCAD Studio</b>: 「応力解析 → 熱伝導解析」で温度固定・入熱・対流を与えて温度分布を計算し、「熱応力解析」で熱による変形と応力を確認できます。</div>`,
    points: ["ΔL = α L ΔT — アルミは鋼の約 2 倍、樹脂は約 7 倍", "異種材料の長い結合は長穴で逃がす", "伝導 Q = λAΔT/t、対流 Q = hAΔT", "熱抵抗の大きい所を下げ、表面積と風の流れを作る"],
    exercises: [
      {
        q: "長さ 500 mm のアルミ部品 (α = 23.6 × 10⁻⁶ /K) の温度が 40 K 上がると、何 mm 伸びますか?",
        a: "ΔL = 23.6 × 10⁻⁶ × 500 × 40 ≈ <b>0.47 mm</b>。精密な位置決めでは無視できない量です。",
      },
      {
        q: "100 × 100 mm、厚さ 5 mm の鋼板 (λ = 50 W/(m·K)) の両面に 10 K の温度差があるとき、通る熱量は?",
        a: "Q = 50 × 0.01 × 10 / 0.005 = <b>1 000 W</b>。",
      },
    ],
    quiz: [
      { q: "同じ温度変化で最も大きく伸びるのは?", choices: ["鋼", "アルミ", "ABS 樹脂"], answer: 2, explain: "線膨張係数は 鋼 約 12、アルミ 約 24、ABS 約 80 (×10⁻⁶/K) です。" },
      { q: "ケースの放熱で吸気口と排気口の配置として良いのは?", choices: ["吸気は上、排気は下", "吸気は下、排気は上", "どちらも側面の同じ高さ"], answer: 1, explain: "暖かい空気は上昇するので、下から吸って上から出すと自然に流れます。" },
    ],
  },
];

export const KNOWHOW_MORE: TextChapter[] = [
  {
    id: "fea-practice",
    part: "knowhow",
    title: "解析 (FEA) を正しく使う",
    minutes: 15,
    level: 3,
    lead: "応力解析は、きれいなカラー図がすぐに出るため「正しそう」に見えます。しかし条件を間違えれば結果も間違います。解析結果を信頼できるものにするための手順を学びます。",
    body: `
<h2>解析の流れと間違えやすい所</h2>
<table class="tb-table">
  <tr><th>手順</th><th>確認すること</th></tr>
  <tr><td>1. 目的を決める</td><td>何を知りたいか (最大応力・たわみ・固有振動数)、合否の基準は何か</td></tr>
  <tr><td>2. モデルの簡略化</td><td>小さな面取り・ロゴ・ねじ山は省略してよいが、応力の大きい所の R は残す</td></tr>
  <tr><td>3. 材料</td><td>ヤング率・ポアソン比・降伏点。単位 (MPa と GPa) の間違いに注意</td></tr>
  <tr><td>4. 拘束 (境界条件)</td><td>実際の支え方に近いか。全面固定は剛すぎ、固定面の縁に偽の応力集中が出る</td></tr>
  <tr><td>5. 荷重</td><td>大きさ・向き・かかる範囲。点に力をかけると応力が無限大になる</td></tr>
  <tr><td>6. メッシュ</td><td>応力の大きい所を細かく。細かくして結果が変わらなくなるまで (<b>収束確認</b>)</td></tr>
  <tr><td>7. 結果の検証</td><td>反力の合計 = 荷重か。変形の向きは自然か。<b>手計算と桁が合うか</b></td></tr>
</table>
<h2>特異点に注意</h2>
<p>鋭い入隅・固定面の縁・点荷重の位置では、理論上の応力が無限大になります。メッシュを細かくするほど値が大きくなり続けるのが特徴です。
こうした値で合否を判断してはいけません。実物では R を付ける、荷重を面で受ける、などで対処し、R を付けたモデルで再解析します。</p>
<svg class="tb-chart" viewBox="0 0 520 200" role="img" aria-label="特異点と R 付きモデル">
<path d="M40,40 L100,40 L100,120 L220,120 L220,170 L40,170 Z" fill="var(--tb-surface-2)" stroke="currentColor" stroke-width="1.5"/>
<circle cx="100" cy="120" r="10" fill="var(--tb-bad)" opacity="0.7"/>
<text class="lbl" x="130" y="110" text-anchor="start" style="fill:var(--tb-bad)">σ → ∞</text>
<text class="lbl" x="130" y="192" text-anchor="middle">鋭い入隅: 理論上の応力は無限大</text>
<path d="M300,40 L360,40 L360,100 A20,20 0 0 0 380,120 L480,120 L480,170 L300,170 Z" fill="var(--tb-surface-2)" stroke="currentColor" stroke-width="1.5"/>
<path d="M360,100 A20,20 0 0 0 380,120" fill="none" stroke="var(--tb-warn)" stroke-width="5"/>
<text class="lbl" x="390" y="100" text-anchor="start" style="fill:var(--tb-good)">有限の値に収束</text>
<text class="lbl" x="390" y="192" text-anchor="middle">R を付けたモデル: 合否判定に使える</text>
</svg>
<p class="tb-caption">図: 鋭い入隅・点荷重・固定面の縁は特異点。実物に合わせて R を付け、面で荷重をかけたモデルで評価する</p>
<svg class="tb-chart" viewBox="0 0 520 220" role="img" aria-label="メッシュ細分化と最大応力">
<line class="axis" x1="60" y1="180" x2="490" y2="180"/><line class="axis" x1="60" y1="20" x2="60" y2="180"/>
<polyline points="90,150 180,110 270,82 360,58 450,36" fill="none" stroke="var(--tb-bad)" stroke-width="2.5"/>
<polyline points="90,130 180,112 270,106 360,104 450,103.5" fill="none" stroke="var(--tb-good)" stroke-width="2.5"/>
<text class="tick" x="90" y="196" text-anchor="middle">粗い</text><text class="tick" x="180" y="196" text-anchor="middle"></text><text class="tick" x="270" y="196" text-anchor="middle"></text><text class="tick" x="360" y="196" text-anchor="middle"></text><text class="tick" x="450" y="196" text-anchor="middle">細かい</text>
<text class="lbl" x="444" y="32" text-anchor="end" style="fill:var(--tb-bad)">鋭い入隅: 上がり続ける</text>
<text class="lbl" x="444" y="96" text-anchor="end" style="fill:var(--tb-good)">R 付き: 収束</text>
<text class="lbl" x="470" y="214" text-anchor="end">メッシュの細かさ</text><text class="lbl" x="66" y="16" text-anchor="start">最大応力</text>
</svg>
<p class="tb-caption">図: メッシュを細かくしても値が落ち着かないのは特異点のサイン。収束した値だけを判断に使う (傾向を示す模式図)</p>
<h2>手計算で検算する</h2>
<p>解析の前に、はりの公式などで<b>おおよその答え</b>を出しておきましょう。解析結果が手計算と 2〜3 倍以上違うときは、多くの場合、条件の入力ミスです。</p>
<ul>
  <li>片持ちはりに近い形 → σ = PL / Z、δ = PL³ / 3EI</li>
  <li>引張・圧縮の部材 → σ = F / A</li>
  <li>穴の近く → 公称応力 × Kt (≈ 2〜3)</li>
</ul>
<div class="tb-tip"><b>3DCAD Studio</b>: 応力解析には「メッシュ収束確認」「支点反力とつり合い検算」「最大応力部の詳細解析 (サブモデル)」があり、固定面の縁の特異点は詳細解析から除外されます。座学テキスト「はりの曲げ」の計算ツールと結果を比べてみましょう。</div>`,
    points: ["目的と合否基準を先に決める", "境界条件 (拘束・荷重) が結果を左右する", "メッシュの収束確認と、特異点の見分け", "反力のつり合いと手計算で必ず検算"],
    exercises: [
      {
        q: "解析で最大応力が 2 000 MPa と出ました。場所は固定面の角です。メッシュを細かくすると 3 500 MPa になりました。どう判断し、どうしますか?",
        a: "細かくするほど値が増え続けるのは<b>特異点</b> (固定面の縁の応力集中) の特徴で、この値は実際の応力ではありません。固定面から少し離れた位置の応力で評価するか、実際の取付け (ボルト・座面) に近い拘束にし、必要なら角に R を付けて再解析します。",
      },
    ],
    quiz: [
      { q: "メッシュを細かくするほど最大応力が増え続けるのは?", choices: ["正しく収束している", "特異点の可能性が高い", "材料が弱い"], answer: 1, explain: "鋭い角や点荷重の特異点では、メッシュを細かくすると応力が限りなく大きくなります。" },
      { q: "解析結果の検算として有効なのは?", choices: ["色がきれいか見る", "支点反力の合計と荷重のつり合い、手計算との比較", "計算時間を見る"], answer: 1, explain: "つり合いと手計算で桁が合うかを確かめると、入力ミスを見つけられます。" },
    ],
    lessons: ["7-1"],
  },
  {
    id: "treatment",
    part: "knowhow",
    title: "熱処理と表面処理",
    minutes: 15,
    level: 2,
    lead: "同じ鋼でも、熱処理で硬さと強さは何倍にも変わります。また、さび・摩耗を防ぐには表面処理が欠かせません。図面で指示するための基本を学びます。",
    body: `
<h2>鋼の熱処理</h2>
<table class="tb-table">
  <tr><th>処理</th><th>内容</th><th>目的・用途</th></tr>
  <tr><td>焼なまし</td><td>加熱してゆっくり冷やす</td><td>軟らかくして加工しやすく、内部応力を取る</td></tr>
  <tr><td>焼入れ</td><td>加熱して急冷</td><td>硬く強くする (もろくなる)。炭素 0.3 % 以上の鋼 (S45C など) で効く</td></tr>
  <tr><td>焼戻し</td><td>焼入れ後に再加熱</td><td>ねばさを戻す。焼入れとセットで「調質」</td></tr>
  <tr><td>高周波焼入れ</td><td>表面だけ急加熱・急冷</td><td>表面は硬く (耐摩耗)、中はねばく — 軸・歯車</td></tr>
  <tr><td>浸炭焼入れ</td><td>表面に炭素を入れて焼入れ</td><td>低炭素鋼の表面硬化 — 歯車</td></tr>
  <tr><td>窒化</td><td>表面に窒素を入れる (低温)</td><td>ひずみが小さく硬い表面 — 金型・精密部品</td></tr>
</table>
<p>硬さは <b>HRC</b> (ロックウェル C) や <b>HV</b> (ビッカース) で指示します。例: 「高周波焼入れ HRC 50〜55、有効硬化層深さ 1〜2 mm」。
焼入れするとひずむので、<b>精度の必要な面は熱処理後に研削</b>します。</p>
<svg class="tb-chart" viewBox="0 0 520 220" role="img" aria-label="表面硬化と有効硬化層深さ">
<circle cx="490" cy="70" r="0" fill="none"/>
<line class="axis" x1="70" y1="180" x2="470" y2="180"/><line class="axis" x1="70" y1="20" x2="70" y2="180"/>
<polyline points="70.0,40.2 83.0,40.3 96.0,40.5 109.0,40.7 122.0,41.0 135.0,41.5 148.0,42.3 161.0,43.4 174.0,44.9 187.0,47.2 200.0,50.5 213.0,55.0 226.0,61.2 239.0,69.2 252.0,79.1 265.0,90.6 278.0,103.0 291.0,115.4 304.0,126.9 317.0,136.8 330.0,144.8 343.0,151.0 356.0,155.5 369.0,158.8 382.0,161.1 395.0,162.6 408.0,163.7 421.0,164.5 434.0,165.0 447.0,165.3 460.0,165.5" fill="none" stroke="var(--tb-accent)" stroke-width="2.5"/>
<line class="guide" x1="70" y1="81.99999999999999" x2="470" y2="81.99999999999999"/>
<line class="guide" x1="255.9" y1="81.99999999999999" x2="255.9" y2="180"/>
<circle class="mark" cx="255.9" cy="81.99999999999999" r="4"/>
<text class="mark-t" x="263.9" y="73.99999999999999" text-anchor="start">有効硬化層深さ (この例 ≈ 1.4 mm)</text>
<text class="tick" x="466" y="75.99999999999999" text-anchor="end">限界硬さ (例 HV 550)</text>
<text class="tick" x="70" y="196" text-anchor="middle">0</text><text class="tick" x="200" y="196" text-anchor="middle">1</text><text class="tick" x="330" y="196" text-anchor="middle">2</text><text class="tick" x="460" y="196" text-anchor="middle">3</text>
<text class="lbl" x="470" y="214" text-anchor="end">表面からの深さ (mm)</text><text class="lbl" x="76" y="16" text-anchor="start">硬さ HV</text>
<text class="tick" x="76" y="54" text-anchor="start">表面 ≈ HV 700</text><text class="tick" x="460" y="158" text-anchor="end">芯部 (ねばい)</text>
</svg>
<p class="tb-caption">図: 表面硬化した軸の硬さ分布 (模式図)。表面から限界硬さまでの深さを有効硬化層深さと呼び、図面に「有効硬化層深さ 1〜2 mm」のように指示する。限界硬さは処理法・炭素量で決まる (浸炭は HV 550)</p>
<h2>表面処理</h2>
<table class="tb-table">
  <tr><th>処理</th><th>対象</th><th>特徴</th></tr>
  <tr><td>亜鉛めっき + 三価クロメート</td><td>鋼</td><td>安価で一般的な防錆 (ボルト・板金)</td></tr>
  <tr><td>無電解ニッケルめっき</td><td>鋼・アルミ</td><td>膜厚が均一で寸法精度が良い、耐摩耗</td></tr>
  <tr><td>硬質クロムめっき</td><td>鋼</td><td>非常に硬く耐摩耗 (シリンダロッド)</td></tr>
  <tr><td>黒染め (四三酸化鉄皮膜)</td><td>鋼</td><td>薄く寸法が変わらない。防錆力は弱い</td></tr>
  <tr><td>アルマイト / 硬質アルマイト</td><td>アルミ</td><td>耐食・耐摩耗・絶縁、染色可</td></tr>
  <tr><td>塗装 (焼付・粉体)</td><td>鋼など</td><td>防錆と外観。膜厚 (数十 µm) を寸法に考慮</td></tr>
  <tr><td>不動態化処理</td><td>ステンレス</td><td>加工後の耐食性の回復</td></tr>
</table>
<h2>図面での注意</h2>
<ul>
  <li>めっき・アルマイトは<b>膜厚の分だけ寸法が変わる</b> (アルマイトは半分が内側、半分が外側に成長)。はめあい面は処理後の寸法を指示するか、マスキングを指示</li>
  <li>ねじ穴は処理で入りにくくなる — 処理後にタップを通す、または指示する</li>
  <li>めっきによる<b>水素ぜい化</b> (高強度ボルト 10.9 以上) に注意 — ベーキング処理を指示</li>
</ul>
<svg class="tb-chart" viewBox="0 0 520 180" role="img" aria-label="アルマイト皮膜の成長">
<rect x="60" y="100" width="400" height="60" fill="var(--tb-surface-2)" stroke="currentColor" stroke-width="1.5"/>
<rect x="60" y="70" width="400" height="30" fill="var(--tb-accent)" opacity="0.35"/>
<line x1="60" y1="85" x2="460" y2="85" stroke="var(--tb-bad)" stroke-dasharray="5 3"/>
<text class="lbl" x="470" y="89" text-anchor="start" style="fill:var(--tb-bad)">処理前の表面</text>
<text class="mark-t" x="260" y="80" text-anchor="middle">外側に成長 (約半分)</text><text class="mark-t" x="260" y="97" text-anchor="middle">内側に食い込む (約半分)</text>
<text class="tick" x="260" y="135" text-anchor="middle">アルミ素地</text>
<text class="tick" x="260" y="40" text-anchor="middle">膜厚 t のとき、寸法は片側で約 t/2 増える (目安。処理条件で比率は変わる)</text>
</svg>
<p class="tb-caption">図: アルマイトは素地を酸化させて皮膜を作るため、膜の一部が内側に食い込み、残りが外側に成長する</p>
`,
    points: ["焼入れ + 焼戻し (調質) で強く、高周波・浸炭で表面だけ硬く", "硬さは HRC / HV で指示、精度面は熱処理後に研削", "防錆: 亜鉛めっき・ニッケル・塗装、アルミはアルマイト", "処理の膜厚と寸法変化、ねじ穴、水素ぜい化に注意"],
    exercises: [
      {
        q: "S45C の軸の、軸受がはまる部分を耐摩耗にしたい。熱処理と図面の指示の例を挙げてください。",
        a: "例: 「軸受はめあい部 高周波焼入れ HRC 50〜55、有効硬化層深さ 1.5〜2.5 mm、焼入れ後研削 φ20 k5 Ra 0.8」。全体は調質して強度を確保し、表面だけを硬くします。",
      },
    ],
    quiz: [
      { q: "表面は硬く、内部はねばくしたい軸に適した処理は?", choices: ["焼なまし", "高周波焼入れ", "黒染め"], answer: 1, explain: "高周波焼入れは表面だけを焼入れし、内部のねばさを残します。" },
      { q: "アルミ部品の代表的な表面処理は?", choices: ["亜鉛めっき", "アルマイト", "浸炭"], answer: 1, explain: "アルマイト (陽極酸化) は耐食性・耐摩耗性を上げ、染色もできます。" },
    ],
  },
  {
    id: "cost",
    part: "knowhow",
    title: "コストの見積もりと工法の選択",
    minutes: 15,
    level: 2,
    lead: "同じ部品でも、作る数量によって最適な工法は変わります。部品単価の内訳と、数量による工法の選び方 (損益分岐) を学びます。",
    body: `
<h2>部品単価の内訳</h2>
<div class="tb-formula">単価 = 材料費 + 加工時間 × チャージ + 段取り費 / ロット数 + 型・治具費 / 総数量 + 処理・検査・運搬</div>
<ul>
  <li><b>材料費</b>: 素材の質量 × 単価。削る前の素材 (定尺からの切り出し) で計算する</li>
  <li><b>チャージ (時間単価)</b>: 機械と人の 1 時間あたりの費用。マシニングセンタで数千〜1 万円/時程度</li>
  <li><b>段取り費</b>: 治具の準備・プログラム・初品確認。ロットが小さいと 1 個あたりが高くなる</li>
  <li><b>型費</b>: 金型・プレス型。数量で割ると、量が多いほど安くなる</li>
</ul>
<svg class="tb-chart" viewBox="0 0 520 190" role="img" aria-label="単価の内訳とロット">
<rect x="120" y="147.5" width="70" height="12.5" fill="var(--tb-text-3)" opacity="0.75"/><text class="tick" x="155" y="157.75" text-anchor="middle">材料 500</text><rect x="120" y="97.5" width="70" height="50.0" fill="var(--tb-accent)" opacity="0.75"/><text class="tick" x="155" y="126.5" text-anchor="middle">加工 2000</text><rect x="120" y="47.5" width="70" height="50.0" fill="var(--tb-warn)" opacity="0.75"/><text class="tick" x="155" y="76.5" text-anchor="middle">段取り 2000</text><text class="tick" x="155" y="178" text-anchor="middle">ロット 10 個: 4,500 円</text><rect x="340" y="147.5" width="70" height="12.5" fill="var(--tb-text-3)" opacity="0.75"/><text class="tick" x="375" y="157.75" text-anchor="middle">材料 500</text><rect x="340" y="97.5" width="70" height="50.0" fill="var(--tb-accent)" opacity="0.75"/><text class="tick" x="375" y="126.5" text-anchor="middle">加工 2000</text><rect x="340" y="97.0" width="70" height="0.5" fill="var(--tb-warn)" opacity="0.75"/><text class="tick" x="375" y="178" text-anchor="middle">ロット 1000 個: 2,520 円</text>
<line class="axis" x1="80" y1="160" x2="450" y2="160"/>
<text class="tick" x="260" y="22" text-anchor="middle">段取り費 2 万円をロット数で割る (数値は例、円/個)</text>
</svg>
<p class="tb-caption">図: 同じ部品でも、段取り費はロット数で割られるため少量ほど単価が高い</p>
<h2>工法と数量</h2>
<table class="tb-table">
  <tr><th>数量の目安</th><th>向く工法</th></tr>
  <tr><td>1〜数十個</td><td>切削、3D プリント、板金 (レーザー + 曲げ)、溶接構造</td></tr>
  <tr><td>数百〜数千個</td><td>板金、簡易型の成形、ダイカスト・鋳造 (形による)</td></tr>
  <tr><td>数千〜数百万個</td><td>射出成形、プレス、ダイカスト、鍛造</td></tr>
</table>
<div data-widget="cost"></div>
<svg class="tb-chart" viewBox="0 0 520 220" role="img" aria-label="損益分岐数量">
<line class="axis" x1="60" y1="180" x2="490" y2="180"/><line class="axis" x1="60" y1="20" x2="60" y2="180"/>
<line x1="60" y1="180" x2="480" y2="12.0" stroke="var(--tb-warn)" stroke-width="2.5"/>
<line x1="60" y1="100" x2="480" y2="88.8" stroke="var(--tb-accent)" stroke-width="2.5"/>
<circle class="mark" cx="274.3" cy="94.3" r="5"/>
<line class="guide" x1="274.3" y1="94.3" x2="274.3" y2="180"/>
<text class="mark-t" x="274.28571428571433" y="196" text-anchor="middle">≈ 714 個</text>
<text class="tick" x="476" y="28" text-anchor="end">切削 3,000 円/個</text>
<text class="tick" x="476" y="104.8" text-anchor="end">成形 型費 200 万 + 200 円/個</text>
<text class="lbl" x="480" y="214" text-anchor="end">数量 (個)</text><text class="lbl" x="66" y="16" text-anchor="start">総費用</text>
</svg>
<p class="tb-caption">図: 総費用 = 初期費用 + 単価 × 数量。2 本の直線の交点 N = 2,000,000 ÷ (3,000 − 200) ≈ 714 個より多く作るなら成形が有利 (数値は例)</p>
<h2>設計でコストを下げる</h2>
<ul>
  <li>市販品・標準部品を使う (ボルト・軸受・リニアガイド・アルミフレーム)</li>
  <li>部品点数・加工面・公差・表面処理の種類を減らす</li>
  <li>同じ部品を複数の場所・製品で使い回す (共通化)</li>
  <li>量産を見込むなら、試作の段階から量産工法 (成形・プレス) を前提に形を考える</li>
</ul>`,
    points: ["単価 = 材料 + 加工時間 × チャージ + 段取り/ロット + 型費/数量", "少量は切削・板金・3D プリント、大量は成形・プレス", "損益分岐の数量で工法を選ぶ", "標準部品・共通化・部品点数削減でコストを下げる"],
    exercises: [
      {
        q: "切削: 材料 300 円、加工 12 分 (チャージ 6000 円/時)、段取り 90 分 / ロット 50 個。成形: 金型 150 万円、1 個 60 円。1000 個作るとき、それぞれの単価と損益分岐の数量を求めてください。",
        a: "切削 = 300 + 1200 + 9000/50 = <b>1 680 円</b>。成形 = 60 + 1 500 000 / 1000 = <b>1 560 円</b>。損益分岐は 60 + 1 500 000 / q = 1 680 → q ≈ <b>926 個</b>。それより多ければ成形が有利です。",
      },
    ],
    quiz: [
      { q: "数量が少ないほど 1 個あたりが高くなる費用は?", choices: ["材料費", "段取り費・型費", "加工時間"], answer: 1, explain: "段取り費や型費は固定費なので、数量で割ると少量ほど 1 個あたりが高くなります。" },
      { q: "10 個の試作部品に最も適した工法は?", choices: ["射出成形", "切削または 3D プリント", "プレス"], answer: 1, explain: "型が不要な切削・3D プリントが少量向きです。" },
    ],
  },
  {
    id: "safety-design",
    part: "knowhow",
    title: "安全設計とリスクアセスメント",
    minutes: 15,
    level: 2,
    lead: "機械による事故の多くは、設計段階で防ぐことができます。国際規格 (ISO 12100) の考え方に沿って、リスクを見つけ、減らす手順を学びます。",
    body: `
<h2>リスクアセスメントの手順</h2>
<ol class="tb-flow">
  <li><b>使用条件の決定</b> — 誰が、どこで、どう使うか。予見できる誤使用も含める</li>
  <li><b>危険源の特定</b> — 挟まれ・巻き込まれ・切れ・落下・感電・高温・騒音 …</li>
  <li><b>リスクの見積もり</b> — 危害のひどさ × 発生の可能性 (さらされる頻度・回避の可能性)</li>
  <li><b>評価</b> — 許容できるか</li>
  <li><b>リスク低減</b> — 下の 3 ステップで。低減後にもう一度見積もる</li>
</ol>
<h2>リスク低減の 3 ステップ (順番が大切)</h2>
<table class="tb-table">
  <tr><th>1. 本質的安全設計</th><td>危険そのものをなくす・小さくする: すき間をなくす / 十分広げる、力・速度・エネルギーを下げる、鋭い角をなくす、低電圧にする</td></tr>
  <tr><th>2. 安全防護</th><td>ガード (固定式・インターロック付き)、光電センサ、両手操作、非常停止</td></tr>
  <tr><th>3. 使用上の情報</th><td>警告表示、取扱説明書、訓練 — 最後の手段</td></tr>
</table>
<p>「注意してください」と書くだけで済ませず、<b>まず設計で危険をなくす</b>のが原則です。</p>
<svg class="tb-chart" viewBox="0 0 520 210" role="img" aria-label="リスク低減の 3 ステップ">
<polygon points="40,30 480,30 410,85 110,85" fill="var(--tb-good)" opacity="0.35" stroke="var(--tb-good)"/>
<polygon points="110,90 410,90 340,145 180,145" fill="var(--tb-warn)" opacity="0.35" stroke="var(--tb-warn)"/>
<polygon points="180,150 340,150 260,200" fill="var(--tb-bad)" opacity="0.3" stroke="var(--tb-bad)"/>
<text class="mark-t" x="260" y="55" text-anchor="middle">1. 本質的安全設計</text><text class="tick" x="260" y="72" text-anchor="middle">危険そのものをなくす</text>
<text class="mark-t" x="260" y="113" text-anchor="middle">2. 安全防護</text><text class="tick" x="260" y="130" text-anchor="middle">ガード・インターロック</text>
<text class="mark-t" x="260" y="170" text-anchor="middle">3. 使用上の情報</text>
<line x1="30" y1="40" x2="30" y2="190" stroke="var(--tb-text-3)" stroke-width="2"/><polygon points="30,190 26.9,182.6 33.1,182.6" fill="var(--tb-text-3)"/><text class="tick" x="36" y="200" text-anchor="start">効果は下ほど小さい</text>
</svg>
<p class="tb-caption">図: 上から順に検討する。幅の広い段ほどリスク低減の効果が大きく、人の注意に頼る警告表示は最後の手段</p>
<h2>安全設計の考え方</h2>
<ul>
  <li><b>フェールセーフ</b>: 故障したら安全側になる (停電でブレーキがかかる、ばねで閉じるバルブ)</li>
  <li><b>フールプルーフ</b>: 誤操作しても危険にならない (ふたを開けると止まる、逆に挿せないコネクタ)</li>
  <li><b>インターロック</b>: 条件がそろわないと動かない</li>
  <li><b>冗長化</b>: 重要な機能を 2 重にする</li>
</ul>
<svg class="tb-chart" viewBox="0 0 520 200" role="img" aria-label="リスクの見積もりと低減">
<rect x="120" y="120" width="88" height="43" fill="var(--tb-good)" opacity="0.3"/><rect x="210" y="120" width="88" height="43" fill="var(--tb-good)" opacity="0.3"/><rect x="300" y="120" width="88" height="43" fill="var(--tb-warn)" opacity="0.3"/><rect x="120" y="75" width="88" height="43" fill="var(--tb-good)" opacity="0.3"/><rect x="210" y="75" width="88" height="43" fill="var(--tb-warn)" opacity="0.3"/><rect x="300" y="75" width="88" height="43" fill="var(--tb-bad)" opacity="0.3"/><rect x="120" y="30" width="88" height="43" fill="var(--tb-warn)" opacity="0.3"/><rect x="210" y="30" width="88" height="43" fill="var(--tb-bad)" opacity="0.3"/><rect x="300" y="30" width="88" height="43" fill="var(--tb-bad)" opacity="0.3"/>
<text class="tick" x="164" y="182" text-anchor="middle">小</text><text class="tick" x="254" y="182" text-anchor="middle">中</text><text class="tick" x="344" y="182" text-anchor="middle">大</text><text class="lbl" x="255" y="198" text-anchor="middle">危害のひどさ</text>
<text class="tick" x="110" y="149" text-anchor="end">低</text><text class="tick" x="110" y="104" text-anchor="end">中</text><text class="tick" x="110" y="59" text-anchor="end">高</text><text class="lbl" x="60" y="100" text-anchor="middle">発生の</text><text class="lbl" x="60" y="116" text-anchor="middle">可能性</text>
<circle class="mark" cx="344" cy="52" r="6"/><line x1="338" y1="58" x2="260" y2="136" stroke="var(--tb-accent)" stroke-width="2"/><polygon points="260,136 263.0,128.6 267.4,133.0" fill="var(--tb-accent)"/><circle cx="254" cy="142" r="6" fill="var(--tb-good)"/>
<text class="tick" x="400" y="60" text-anchor="start">低減前</text><text class="tick" x="270" y="160" text-anchor="start">低減後: 再見積もり</text>
</svg>
<p class="tb-caption">図: リスクは危害のひどさと発生の可能性の組合せで見積もる (3×3 の簡易マトリクスの例)。低減策の後にもう一度見積もり、許容できるまで繰り返す</p>
<h2>挟まれ防止のすき間 (ISO 13854 の例)</h2>
<table class="tb-table">
  <tr><th>体の部位</th><th>最小すき間</th></tr>
  <tr><td>指</td><td>25 mm</td></tr>
  <tr><td>手・手首</td><td>100 mm</td></tr>
  <tr><td>腕</td><td>120 mm</td></tr>
  <tr><td>体</td><td>500 mm</td></tr>
</table>
<p>動く部品の間がこれより狭く、かつ危険なほど狭い (挟まれる) 場合は、すき間を広げるか、ガードで手が届かないようにします。</p>`,
    points: ["リスク = 危害のひどさ × 発生の可能性", "低減は 本質安全 → 安全防護 → 使用上の情報 の順", "フェールセーフ・フールプルーフ・インターロック", "挟まれ防止のすき間 (指 25 mm、手 100 mm …)"],
    exercises: [
      {
        q: "ふたを手で閉める卓上機械で、ふたと本体の間に指が挟まれる危険があります。3 ステップの順で対策を挙げてください。",
        a: "① 本質安全: ふたの閉まる力・速度を小さくする (ダンパー、軽量化)、閉じたときも 25 mm 以上のすき間が残る形にする。② 安全防護: ふたが開いているときは動力を切るインターロック。③ 情報: 挟まれ注意の表示と取扱説明書への記載。",
      },
    ],
    quiz: [
      { q: "リスク低減で最初に検討すべきなのは?", choices: ["警告ラベル", "本質的安全設計", "取扱説明書"], answer: 1, explain: "まず設計で危険源そのものをなくす・小さくすることを検討します。" },
      { q: "停電したときにブレーキがかかる設計の考え方は?", choices: ["フェールセーフ", "フールプルーフ", "冗長化"], answer: 0, explain: "故障したときに安全側に動作するのがフェールセーフです。" },
    ],
  },
];

export const DESIGN_MORE: TextChapter[] = [
  {
    id: "sustainable",
    part: "design",
    title: "サステナブルデザイン",
    minutes: 15,
    level: 1,
    lead: "製品は、材料の採掘から製造・輸送・使用・廃棄まで、一生を通じて環境に影響を与えます。長く使え、直せて、資源として戻る製品の設計を学びます。",
    body: `
<h2>ライフサイクルで考える</h2>
<p>環境への影響 (エネルギー・CO₂・資源) は、<b>材料 → 製造 → 輸送 → 使用 → 廃棄・リサイクル</b>の各段階で生じます。
家電や車のように電気・燃料を使う製品は<b>使用段階</b>、使い捨て製品は<b>材料と廃棄</b>の影響が大きくなります。
この評価を <b>LCA (ライフサイクルアセスメント)</b> と呼びます。</p>
<h2>設計でできること</h2>
<table class="tb-table">
  <tr><th>減らす (Reduce)</th><td>軽量化 (形の工夫で材料を減らす)、部品点数の削減、梱包の削減、省エネ</td></tr>
  <tr><th>長く使う</th><td>丈夫で飽きのこないデザイン、消耗部品を交換できる構造、ソフトウェアの更新</td></tr>
  <tr><th>直せる</th><td>ねじで分解できる (接着・溶着を避ける)、標準工具で開く、部品の供給</td></tr>
  <tr><th>再び使う (Reuse)</th><td>部品の再利用、モジュール化</td></tr>
  <tr><th>資源に戻す (Recycle)</th><td>単一素材化、異なる材料を分けやすく、樹脂の材質表示 (&gt;ABS&lt; など)、塗装・めっきを減らす</td></tr>
</table>
<h2>設計の例</h2>
<ul>
  <li>樹脂部品に金属のインサートを埋めず、ねじで留める → 分別できる</li>
  <li>多色の部品を塗装ではなく、色付きの材料 (原着) にする</li>
  <li>リブとシェルで肉厚を減らし、材料を 30 % 削減 → 成形時間も短くなる</li>
  <li>電池を工具なしで交換できるようにする</li>
</ul>
<div class="tb-tip"><b>3DCAD Studio</b>: iProperties で材料ごとの質量を確認しながら、シェル・リブ・トポロジー最適化で材料を減らす検討ができます。</div>`,
    points: ["材料・製造・輸送・使用・廃棄のライフサイクルで影響を考える (LCA)", "減らす・長く使う・直せる・再利用・資源に戻す", "分解しやすく、材料を分けやすい構造に", "材質表示・単一素材化でリサイクルしやすく"],
    exercises: [
      {
        q: "ドライヤーの外装 (ABS)・内部の金属部品・モーターを、リサイクルしやすくする設計の工夫を 3 つ挙げてください。",
        a: "例: ① 外装をねじで留め (接着しない)、標準のドライバーで開けられるようにする。② 外装の樹脂に材質表示 (>ABS<) を入れ、塗装をやめて原着材料にする。③ 金属部品を樹脂に埋め込まず、取り外せるように固定する。④ モーターをコネクタで外せるユニットにする。",
      },
    ],
    quiz: [
      { q: "リサイクルしにくい構造は?", choices: ["ねじ留めの単一素材部品", "異なる材料を接着した部品", "材質表示のある樹脂部品"], answer: 1, explain: "接着された異種材料は分別が難しく、リサイクルの妨げになります。" },
      { q: "家電の環境負荷が最も大きくなりやすい段階は?", choices: ["材料", "使用 (電力)", "輸送"], answer: 1, explain: "長く電気を使う製品では、使用段階のエネルギー消費が大きな割合を占めます。" },
    ],
  },
];
