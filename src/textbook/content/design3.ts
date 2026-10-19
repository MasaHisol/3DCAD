import type { TextChapter } from "../types";

export const DESIGN3: TextChapter[] = [
  {
    id: "form-language",
    part: "design",
    title: "【初級】かたちの言葉 — 立体と見え方の基本",
    minutes: 20,
    level: 1,
    lead: "箱・円柱・球といった基本立体は、それぞれ固有の印象を持っています。角の処理 (面取りと R)、エッジの立て方、そして人がまとまりを見つける仕組み (ゲシュタルトの原則) を知ると、形で意図を伝えられるようになります。",
    body: `
<h2>基本立体が持つ印象</h2>
<p>多くの製品は、箱 (直方体)・円柱・球の組合せや変形でできています。まず基本立体そのものの印象をつかみましょう。</p>
<svg class="tb-chart" viewBox="0 0 520 190" aria-label="箱・円柱・球の印象">
  <path d="M40,70 L110,70 L110,140 L40,140 Z M40,70 L65,50 L135,50 L110,70 M135,50 L135,120 L110,140" fill="var(--tb-surface-2)" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
  <ellipse cx="260" cy="55" rx="40" ry="12" fill="var(--tb-surface-2)" stroke="currentColor" stroke-width="2"/>
  <path d="M220,55 L220,135 A40,12 0 0 0 300,135 L300,55" fill="none" stroke="currentColor" stroke-width="2"/>
  <circle cx="420" cy="95" r="45" fill="var(--tb-surface-2)" stroke="currentColor" stroke-width="2"/>
  <ellipse cx="405" cy="78" rx="12" ry="8" fill="var(--tb-accent)" opacity="0.4"/>
  <text class="lbl" x="88" y="170" text-anchor="middle">箱: 安定・実直・収納</text>
  <text class="lbl" x="260" y="170" text-anchor="middle">円柱: 方向性・回す・握る</text>
  <text class="lbl" x="420" y="170" text-anchor="middle">球: 柔らかい・親しみ・転がる</text>
</svg>
<p class="tb-caption">図: 基本立体の印象。製品の役割に合った立体を骨格に選ぶ</p>
<table class="tb-table">
  <tr><th>立体</th><th>印象</th><th>製品例</th></tr>
  <tr><td>箱</td><td>安定、積める、きちんとした</td><td>電源装置、スピーカ、収納家電</td></tr>
  <tr><td>円柱</td><td>軸の方向を感じる、手になじむ</td><td>ボトル、ライト、つまみ</td></tr>
  <tr><td>球</td><td>やわらかい、かわいい、どこから見ても同じ</td><td>スマートスピーカ、玩具</td></tr>
</table>
<h2>面取りと R — 角の表情</h2>
<p>角の処理は印象を大きく左右します。<b>面取り (C)</b> は角を平面で落とし、<b>R (フィレット)</b> は円弧でつなぎます。</p>
<svg class="tb-chart" viewBox="0 0 520 170" aria-label="ピン角・面取り・小R・大R">
  <path d="M30,130 L30,40 L110,40" fill="none" stroke="currentColor" stroke-width="3"/>
  <path d="M150,130 L150,60 L170,40 L230,40" fill="none" stroke="currentColor" stroke-width="3"/>
  <path d="M270,130 L270,52 A12,12 0 0 1 282,40 L350,40" fill="none" stroke="currentColor" stroke-width="3"/>
  <path d="M390,130 L390,90 A50,50 0 0 1 440,40 L490,40" fill="none" stroke="var(--tb-accent)" stroke-width="3"/>
  <text class="lbl" x="70" y="155" text-anchor="middle">ピン角: 鋭い・危険</text>
  <text class="lbl" x="190" y="155" text-anchor="middle">面取り: 硬質・精密</text>
  <text class="lbl" x="310" y="155" text-anchor="middle">小 R: 端正</text>
  <text class="lbl" x="440" y="155" text-anchor="middle">大 R: やさしい</text>
</svg>
<p class="tb-caption">図: 同じ角でも処理で性格が変わる。面取りには光る細い帯ができ、R は光がなだらかに変わる</p>
<ul>
  <li>面取りは光を受けて<b>細い明るい線</b>になり、輪郭を引き締める (金属製品・工具に多い)</li>
  <li>R は大きくするほど柔らかくなるが、大きすぎると「ぼってり」と鈍く見える</li>
  <li>手が触れる角は、ピン角を避けて最低でも小さな R や面取りを付けるのが安全面の基本</li>
</ul>
<h2>エッジの立て方</h2>
<p>同じ R でも、<b>どの面を主役にするか</b>でエッジの効き方が変わります。正面の大きな面に小さな R をつけて側面との境を立てると、正面が「顔」として際立ちます。</p>
<svg class="tb-chart" viewBox="0 0 520 160" aria-label="エッジを立てる・寝かせる">
  <rect x="40" y="30" width="180" height="90" rx="4" fill="var(--tb-surface-2)" stroke="currentColor" stroke-width="2.5"/>
  <rect x="300" y="30" width="180" height="90" rx="30" fill="var(--tb-surface-2)" stroke="currentColor" stroke-width="1.5"/>
  <line x1="44" y1="32" x2="216" y2="32" stroke="var(--tb-accent)" stroke-width="2"><animate attributeName="opacity" values="1;0.2;1" dur="3s" repeatCount="indefinite"/></line>
  <text class="lbl" x="130" y="145" text-anchor="middle">エッジを立てる: シャープ・輪郭明快</text>
  <text class="lbl" x="390" y="145" text-anchor="middle">エッジを寝かせる: 柔らか・輪郭があいまい</text>
</svg>
<p class="tb-caption">図: 小 R のエッジは光る線 (色の線) として輪郭を描く。大 R は輪郭がぼける</p>
<h2>ゲシュタルトの原則 — 人はまとまりを見つける</h2>
<p>人はバラバラの要素を、自動的に<b>グループ</b>として見ます。この性質を利用すると、ボタンの配置や分割線だけで「何と何が関係しているか」を伝えられます。</p>
<svg class="tb-chart" viewBox="0 0 520 200" aria-label="近接・類同・閉合・連続">
  <g fill="currentColor">
    <circle cx="30" cy="50" r="7"/><circle cx="50" cy="50" r="7"/><circle cx="30" cy="70" r="7"/><circle cx="50" cy="70" r="7"/>
    <circle cx="90" cy="50" r="7"/><circle cx="110" cy="50" r="7"/><circle cx="90" cy="70" r="7"/><circle cx="110" cy="70" r="7"/>
  </g>
  <g>
    <circle cx="160" cy="50" r="7" fill="currentColor"/><circle cx="180" cy="50" r="7" fill="var(--tb-accent)"/><circle cx="200" cy="50" r="7" fill="currentColor"/><circle cx="220" cy="50" r="7" fill="var(--tb-accent)"/>
    <circle cx="160" cy="70" r="7" fill="currentColor"/><circle cx="180" cy="70" r="7" fill="var(--tb-accent)"/><circle cx="200" cy="70" r="7" fill="currentColor"/><circle cx="220" cy="70" r="7" fill="var(--tb-accent)"/>
  </g>
  <g fill="none" stroke="currentColor" stroke-width="3">
    <path d="M290,40 L340,40"/><path d="M350,40 L350,80"/><path d="M340,90 L290,90"/><path d="M280,80 L280,50"/>
  </g>
  <path d="M400,90 C430,20 460,110 500,40" fill="none" stroke="currentColor" stroke-width="3"/>
  <path d="M400,40 C440,60 470,70 500,90" fill="none" stroke="var(--tb-accent)" stroke-width="3"/>
  <text class="lbl" x="70" y="120" text-anchor="middle">近接</text><text class="tick" x="70" y="138" text-anchor="middle">近いものは仲間</text>
  <text class="lbl" x="190" y="120" text-anchor="middle">類同</text><text class="tick" x="190" y="138" text-anchor="middle">同じ色・形は仲間</text>
  <text class="lbl" x="315" y="120" text-anchor="middle">閉合</text><text class="tick" x="315" y="138" text-anchor="middle">すき間があっても四角</text>
  <text class="lbl" x="450" y="120" text-anchor="middle">連続</text><text class="tick" x="450" y="138" text-anchor="middle">なめらかな線は 1 本</text>
  <text class="lbl" x="260" y="180" text-anchor="middle">製品では: ボタンの群・色分け・分割線の流れで関係を伝える</text>
</svg>
<p class="tb-caption">図: ゲシュタルトの 4 原則。左から近接・類同・閉合・連続</p>
<ul>
  <li><b>近接</b>: 音量 + と − は寄せ、電源は離す → 機能のグループが見える</li>
  <li><b>類同</b>: 同じ種類の操作は同じ形・色にする。違うものは違って見せる</li>
  <li><b>閉合</b>: 分割線が途中で切れていても、人は 1 つの面として補って見る</li>
  <li><b>連続</b>: 窓の縁・分割線・ボタン列を 1 本の流れに乗せると、全体が整う</li>
</ul>
<svg class="tb-chart" viewBox="0 0 520 170" aria-label="リモコンの配置の前後比較">
  <rect x="60" y="20" width="110" height="130" rx="14" fill="none" stroke="currentColor" stroke-width="2"/>
  <g fill="var(--tb-text-3)"><circle cx="85" cy="45" r="8"/><circle cx="120" cy="55" r="8"/><circle cx="145" cy="40" r="8"/><circle cx="90" cy="90" r="8"/><circle cx="135" cy="85" r="8"/><circle cx="110" cy="125" r="8"/></g>
  <rect x="330" y="20" width="110" height="130" rx="14" fill="none" stroke="currentColor" stroke-width="2"/>
  <circle cx="415" cy="42" r="8" fill="var(--tb-bad)"/>
  <g fill="var(--tb-accent)"><circle cx="365" cy="80" r="8"/><circle cx="365" cy="105" r="8"/></g>
  <g fill="var(--tb-text-3)"><circle cx="405" cy="80" r="8"/><circle cx="405" cy="105" r="8"/></g>
  <text class="lbl" x="115" y="166" text-anchor="middle">前: ばらばら</text>
  <text class="lbl" x="385" y="166" text-anchor="middle">後: 近接 + 類同でグループ化</text>
</svg>
<p class="tb-caption">図: 同じ 6 個 (後は 5 個) のボタンでも、配置と色で使い方が読み取れるようになる</p>
<div class="tb-tip"><b>3DCAD Studio</b>: 同じ箱にフィレットと面取りをそれぞれかけ、リアル表示で光の映り方を見比べてみましょう。R の値をパラメータにしておくと、印象の変化を素早く試せます。</div>`,
    points: [
      "箱は安定、円柱は方向性と握りやすさ、球は親しみ — 骨格になる立体を役割から選ぶ",
      "面取りは硬質で輪郭が締まり、R は大きいほど柔らかい。触れる角はピン角を避ける",
      "主役の面の境を小 R で立てると、その面が「顔」として際立つ",
      "近接・類同・閉合・連続を使うと、配置と色だけで要素の関係が伝わる",
    ],
    exercises: [
      {
        q: "電源・音量+・音量−・入力切替の 4 ボタンを持つ小型スピーカの上面配置を、ゲシュタルトの原則を使って考えてください。",
        a: "音量 + と − は<b>近接</b>させ、同じ形にそろえる (<b>類同</b>)。電源は誤操作を防ぐため離し、形 (丸) や色を変えて区別する。入力切替は音量群と電源の中間に置き、ボタンの中心を 1 本の線にそろえる (<b>連続</b>)。音量群をくぼみで囲むと、1 つのまとまりとして見える (<b>閉合</b>)。",
      },
    ],
    quiz: [
      { q: "角を平面で落とす処理は?", choices: ["R (フィレット)", "面取り (C)", "シェル"], answer: 1, explain: "面取りは角を平面で落とし、硬質で精密な印象を与えます。" },
      { q: "「近いものは同じグループに見える」原則は?", choices: ["類同", "近接", "閉合"], answer: 1, explain: "近接の原則です。関係の深いボタンを寄せて配置します。" },
      { q: "線が途中で切れていても 1 つの形として見えるのは?", choices: ["閉合", "連続", "対称"], answer: 0, explain: "人は欠けた部分を補って閉じた形として見ます (閉合)。" },
    ],
    lessons: ["3-4"],
  },
  {
    id: "proportion-grid",
    part: "design",
    title: "【中級】レイアウトと比率の実践",
    minutes: 20,
    level: 2,
    lead: "操作パネルや製品の正面は、見えない「グリッド」と整列線で整えると、要素が増えても落ち着いて見えます。余白、モジュール寸法、黄金比・白銀比の使いどころを、前後比較で学びます。",
    body: `
<h2>グリッドで考える</h2>
<p>グリッドは、要素を置く位置の「マス目」です。先に余白 (マージン) と列 (カラム) の幅を決め、ボタン・表示窓・ロゴをその線に合わせて置きます。</p>
<svg class="tb-chart" viewBox="0 0 520 200" aria-label="グリッドなしとグリッドありの操作パネル">
  <rect x="20" y="20" width="220" height="140" rx="10" fill="none" stroke="currentColor" stroke-width="2"/>
  <rect x="38" y="34" width="120" height="44" fill="var(--tb-surface-2)" stroke="currentColor"/>
  <circle cx="200" cy="52" r="12" fill="none" stroke="currentColor"/>
  <g fill="none" stroke="currentColor"><rect x="45" y="100" width="34" height="22"/><rect x="95" y="94" width="34" height="22"/><rect x="152" y="104" width="34" height="22"/></g>
  <text class="tick" x="185" y="148">ロゴ</text>
  <rect x="280" y="20" width="220" height="140" rx="10" fill="none" stroke="currentColor" stroke-width="2"/>
  <g class="guide"><line x1="300" y1="20" x2="300" y2="160"/><line x1="480" y1="20" x2="480" y2="160"/><line x1="360" y1="20" x2="360" y2="160"/><line x1="420" y1="20" x2="420" y2="160"/><line x1="280" y1="40" x2="500" y2="40"/><line x1="280" y1="140" x2="500" y2="140"/></g>
  <rect x="300" y="40" width="120" height="44" fill="var(--tb-surface-2)" stroke="currentColor"/>
  <circle cx="450" cy="62" r="12" fill="none" stroke="var(--tb-accent)" stroke-width="2"/>
  <g fill="none" stroke="var(--tb-accent)" stroke-width="2"><rect x="300" y="104" width="48" height="22"/><rect x="360" y="104" width="48" height="22"/><rect x="420" y="104" width="48" height="22"/></g>
  <text class="tick" x="480" y="152" text-anchor="end">ロゴ</text>
  <text class="lbl" x="130" y="185" text-anchor="middle">前: 位置がばらばら</text>
  <text class="lbl" x="390" y="185" text-anchor="middle">後: 余白・列・行にそろえる</text>
</svg>
<p class="tb-caption">図: 同じ要素でも、グリッド (点線) に合わせるだけで整然と見える</p>
<h2>余白と整列線</h2>
<ul>
  <li><b>外周の余白</b>は、内側の要素間のすき間より<b>広く</b>とるのが目安。窮屈さがなくなる</li>
  <li>関係の深い要素どうしのすき間は狭く、グループ間は広く (近接の原則)</li>
  <li>要素の<b>端</b>か<b>中心</b>のどちらかに整列線を通す。両者が混在すると落ち着かない</li>
  <li>表示窓・ボタン・分割線・ロゴの基準線を、製品の外形線とも関係づける</li>
</ul>
<h2>モジュール寸法</h2>
<p>すべての寸法を基本単位 (モジュール) の倍数にすると、要素どうしが自然にそろいます。例えば 4 mm モジュールなら、余白 8、ボタン 12、ボタン間隔 4 … のように決めます。</p>
<svg class="tb-chart" viewBox="0 0 520 130" aria-label="モジュール寸法">
  <g stroke="var(--tb-text-3)" stroke-width="0.5">
    <line x1="20" y1="30" x2="500" y2="30"/><line x1="20" y1="90" x2="500" y2="90"/>
  </g>
  <rect x="20" y="30" width="40" height="60" fill="none" stroke="currentColor" stroke-dasharray="3 3"/>
  <rect x="60" y="30" width="120" height="60" fill="var(--tb-accent)" opacity="0.45"/>
  <rect x="180" y="30" width="40" height="60" fill="none" stroke="currentColor" stroke-dasharray="3 3"/>
  <rect x="220" y="30" width="120" height="60" fill="var(--tb-accent)" opacity="0.45"/>
  <rect x="340" y="30" width="40" height="60" fill="none" stroke="currentColor" stroke-dasharray="3 3"/>
  <rect x="380" y="30" width="80" height="60" fill="var(--tb-accent)" opacity="0.7"/>
  <text class="tick" x="40" y="112" text-anchor="middle">4</text><text class="tick" x="120" y="112" text-anchor="middle">12</text><text class="tick" x="200" y="112" text-anchor="middle">4</text><text class="tick" x="280" y="112" text-anchor="middle">12</text><text class="tick" x="360" y="112" text-anchor="middle">4</text><text class="tick" x="420" y="112" text-anchor="middle">8</text>
  <text class="lbl" x="490" y="66" text-anchor="end">mm</text>
</svg>
<p class="tb-caption">図: 4 mm モジュールでの寸法の並び (例)。余白・部品・すき間がすべて 4 の倍数</p>
<h2>黄金比・白銀比の実例</h2>
<p>比率は、外形だけでなく<b>内部の分割</b>にも使えます。例えば正面を上下に分割するとき、1 : 1 で真ん中を割ると単調ですが、黄金比 (約 0.382 : 0.618) で割ると主従がはっきりします。</p>
<svg class="tb-chart" viewBox="0 0 520 190" aria-label="中央分割と黄金比分割">
  <rect x="40" y="20" width="180" height="130" rx="8" fill="none" stroke="currentColor" stroke-width="2"/>
  <line x1="40" y1="85" x2="220" y2="85" stroke="var(--tb-bad)" stroke-width="2"/>
  <rect x="300" y="20" width="180" height="130" rx="8" fill="none" stroke="currentColor" stroke-width="2"/>
  <rect x="300" y="20" width="180" height="50" rx="8" fill="var(--tb-surface-2)"/>
  <line x1="300" y1="70" x2="480" y2="70" stroke="var(--tb-good)" stroke-width="2"/>
  <text class="tick" x="490" y="48">0.382</text><text class="tick" x="490" y="115">0.618</text>
  <text class="lbl" x="130" y="175" text-anchor="middle">1 : 1 — どちらが主役かあいまい</text>
  <text class="lbl" x="390" y="175" text-anchor="middle">黄金比 — 上が操作部、下が本体</text>
</svg>
<p class="tb-caption">図: 同じ外形の正面分割の前後比較</p>
<table class="tb-table">
  <tr><th>比率</th><th>値</th><th>身近な例</th></tr>
  <tr><td>黄金比</td><td>1 : 1.618</td><td>名刺やクレジットカードに近い比率 (カードは約 1 : 1.59)</td></tr>
  <tr><td>白銀比</td><td>1 : 1.414 (√2)</td><td>A 判・B 判の用紙 (半分に折っても同じ比)</td></tr>
  <tr><td>白銀比 (もう一つの定義・白銀数)</td><td>1 : 2.414 (1 + √2)</td><td>「白銀比」はこの値を指すこともあるので、どちらの意味か確認する</td></tr>
  <tr><td>16 : 9</td><td>1 : 1.778</td><td>ディスプレイ</td></tr>
</table>
<div class="tb-note">黄金比が「最も美しい」という主張には、実験的な裏付けが弱いという指摘もあります。比率は<b>そろえるためのものさし</b>として使い、最後は実物大の模型やレンダリングで目で確かめるのが実務の目安です。</div>
<div class="tb-tip"><b>3DCAD Studio</b>: パラメータに「幅 W」を作り、高さを W / 1.618 や W / 1.414 の式にしておくと、比率を切り替えて比べられます。高解像度画像で並べて保存し、レビューで比較しましょう。</div>`,
    points: [
      "先に余白と列を決め、要素をグリッドの線に合わせて置く",
      "外周の余白は内部のすき間より広く。整列は端か中心かを統一する",
      "寸法をモジュールの倍数にすると、要素が自然にそろう",
      "黄金比・白銀比は分割にも使えるものさし。最後は目で確かめる",
    ],
    exercises: [
      {
        q: "幅 120 mm の操作パネルに、外周余白 8 mm、同じ幅のボタンを 4 個、ボタン間隔 4 mm で並べます。ボタン幅はいくつですか。4 mm モジュールに乗っていますか。",
        a: "ボタンに使える幅 = 120 − 8 × 2 − 4 × 3 = 120 − 16 − 12 = <b>92 mm</b>。1 個あたり 92 / 4 = <b>23 mm</b>。23 は 4 の倍数ではないので、外周余白を 10 mm にして 88 / 4 = 22 mm、またはボタン幅 24 mm として余白を 6 mm にするなど、モジュールに合わせて調整する (どちらが良いかは外周余白 > すき間 の原則で判断し、余白 6 mm でも間隔 4 mm より広いので可)。",
      },
    ],
    quiz: [
      { q: "A 判用紙の縦横比は?", choices: ["1 : 1.618", "1 : 1.414", "16 : 9"], answer: 1, explain: "A 判は白銀比 1 : √2 で、半分に切っても同じ比になります。" },
      { q: "外周の余白と要素間のすき間の関係として一般的な目安は?", choices: ["外周余白を広く", "同じにする", "外周余白を狭く"], answer: 0, explain: "外周を広くとると窮屈さがなく、まとまって見えます。" },
      { q: "モジュール寸法の利点は?", choices: ["材料費が下がる", "寸法どうしが自然にそろい、整って見える", "強度が上がる"], answer: 1, explain: "基本単位の倍数で決めると、要素の端や間隔がそろいます。" },
    ],
    lessons: ["8-1"],
  },
  {
    id: "materials-finish-design",
    part: "design",
    title: "【中級】素材と加工が生む表情",
    minutes: 20,
    level: 2,
    lead: "同じ形でも、シボの深さ、鏡面か梨地か、ヘアラインかブラストかで印象はまったく変わります。主な仕上げの仕組みを断面で理解し、量産で同じ表情を再現するための注意点を学びます。",
    body: `
<h2>樹脂の表面 — 金型の表面がそのまま写る</h2>
<p>射出成形品の表面は、<b>金型の表面の転写</b>です。金型を磨けば鏡面に、エッチングで凹凸をつければシボになります。</p>
<svg class="tb-chart" viewBox="0 0 520 200" aria-label="樹脂表面仕上げの断面模式図">
  <text class="sec" x="20" y="22">断面 (拡大模式図)</text>
  <rect x="30" y="80" width="130" height="40" fill="var(--tb-surface-2)" stroke="currentColor"/>
  <line x1="30" y1="80" x2="160" y2="80" stroke="var(--tb-accent)" stroke-width="2"/>
  <path d="M190,120 L190,82 l6,-5 l5,5 l7,-6 l5,6 l6,-4 l6,4 l5,-6 l7,6 l5,-5 l6,5 l6,-4 l6,4 l5,-6 l6,6 l5,-5 l6,5 l6,-4 l6,4 l4,-3 L320,120 Z" fill="var(--tb-surface-2)" stroke="currentColor"/>
  <rect x="350" y="86" width="140" height="34" fill="var(--tb-surface-2)" stroke="currentColor"/>
  <rect x="350" y="76" width="140" height="10" fill="var(--tb-accent)" opacity="0.6"/>
  <rect x="350" y="72" width="140" height="4" fill="var(--tb-text-3)" opacity="0.6"/>
  <text class="lbl" x="95" y="145" text-anchor="middle">鏡面</text><text class="tick" x="95" y="162" text-anchor="middle">金型を研磨</text>
  <text class="lbl" x="255" y="145" text-anchor="middle">シボ</text><text class="tick" x="255" y="162" text-anchor="middle">金型をエッチング</text>
  <text class="lbl" x="420" y="145" text-anchor="middle">塗装</text><text class="tick" x="420" y="162" text-anchor="middle">下塗り + 上塗り (クリア)</text>
  <text class="tick" x="420" y="64" text-anchor="middle">クリア層</text>
</svg>
<p class="tb-caption">図: 樹脂の主な仕上げの断面。シボの深さは数十 µm 程度が多い (柄により異なる)</p>
<table class="tb-table">
  <tr><th>仕上げ</th><th>表情</th><th>注意点</th></tr>
  <tr><td>シボ</td><td>落ち着いた梨地、革調など柄は多数</td><td>深いほど抜き勾配が必要。傷・指紋・ヒケが目立ちにくい</td></tr>
  <tr><td>鏡面</td><td>高級感・つや</td><td>傷・ヒケ・ウェルドが目立つ。金型の磨きに費用</td></tr>
  <tr><td>塗装</td><td>色・つやの自由度が高い、メタリックも可</td><td>工程とコストが増える。剥がれ・ブツ (異物) の管理</td></tr>
  <tr><td>インモールド (IMD/IML)</td><td>印刷したフィルムを型内で一体化。柄・文字が摩耗しにくい</td><td>深い曲面はフィルムが追従しにくい。初期費用</td></tr>
</table>
<h2>金属の表面 — 削る・打つ・染める</h2>
<svg class="tb-chart" viewBox="0 0 520 200" aria-label="金属表面仕上げの模式図">
  <rect x="30" y="30" width="140" height="90" fill="var(--tb-surface-2)" stroke="currentColor"/>
  <g stroke="var(--tb-text-3)" stroke-width="1"><line x1="34" y1="40" x2="166" y2="40"/><line x1="34" y1="50" x2="166" y2="50"/><line x1="34" y1="58" x2="166" y2="58"/><line x1="34" y1="68" x2="166" y2="68"/><line x1="34" y1="77" x2="166" y2="77"/><line x1="34" y1="86" x2="166" y2="86"/><line x1="34" y1="96" x2="166" y2="96"/><line x1="34" y1="104" x2="166" y2="104"/><line x1="34" y1="112" x2="166" y2="112"/></g>
  <rect x="30" y="30" width="20" height="90" fill="var(--tb-accent)" opacity="0.3"><animate attributeName="x" values="30;150;30" dur="5s" repeatCount="indefinite"/></rect>
  <rect x="190" y="30" width="140" height="90" fill="var(--tb-surface-2)" stroke="currentColor"/>
  <g fill="var(--tb-text-3)"><circle cx="205" cy="45" r="1.5"/><circle cx="230" cy="60" r="1.5"/><circle cx="255" cy="42" r="1.5"/><circle cx="280" cy="70" r="1.5"/><circle cx="310" cy="50" r="1.5"/><circle cx="215" cy="90" r="1.5"/><circle cx="245" cy="105" r="1.5"/><circle cx="270" cy="88" r="1.5"/><circle cx="300" cy="100" r="1.5"/><circle cx="320" cy="80" r="1.5"/><circle cx="235" cy="78" r="1.5"/><circle cx="290" cy="112" r="1.5"/></g>
  <rect x="350" y="70" width="140" height="50" fill="var(--tb-surface-2)" stroke="currentColor"/>
  <rect x="350" y="58" width="140" height="12" fill="var(--tb-accent)" opacity="0.55"/>
  <g stroke="var(--tb-accent)"><line x1="365" y1="58" x2="365" y2="70"/><line x1="385" y1="58" x2="385" y2="70"/><line x1="405" y1="58" x2="405" y2="70"/><line x1="425" y1="58" x2="425" y2="70"/><line x1="445" y1="58" x2="445" y2="70"/><line x1="465" y1="58" x2="465" y2="70"/></g>
  <text class="tick" x="420" y="50" text-anchor="middle">多孔質の酸化皮膜に染料 → 封孔</text>
  <text class="lbl" x="100" y="145" text-anchor="middle">ヘアライン</text><text class="tick" x="100" y="162" text-anchor="middle">一方向の研磨目。光が帯になる</text>
  <text class="lbl" x="260" y="145" text-anchor="middle">ブラスト</text><text class="tick" x="260" y="162" text-anchor="middle">粒を吹き付け均一な梨地</text>
  <text class="lbl" x="420" y="145" text-anchor="middle">アルマイト</text><text class="tick" x="420" y="162" text-anchor="middle">アルミの陽極酸化</text>
</svg>
<p class="tb-caption">図: 金属の仕上げ。ヘアラインは目の方向に光の帯が走る (帯が動くのは見る角度を変えた様子)</p>
<ul>
  <li><b>ヘアライン</b>: 目の方向を製品の長手方向にそろえるのが一般的。継ぎ目で目の向きが変わると目立つ</li>
  <li><b>ブラスト + アルマイト</b>: ノート PC などに多い組合せ。皮膜は薄いので、角は欠けやすい → 角に小さな面取り</li>
  <li><b>アルマイトの色</b>は、合金の種類やロットで色味がずれやすい。同じ製品の部品は同じ合金・同じ処理条件で</li>
</ul>
<h2>木・布 — 自然素材の扱い</h2>
<table class="tb-table">
  <tr><th>素材</th><th>魅力</th><th>量産での注意</th></tr>
  <tr><td>木 (突板・無垢)</td><td>温かみ、経年で味が出る</td><td>木目・色が 1 点ずつ違う。含水率による反り。限度見本で許容範囲を決める</td></tr>
  <tr><td>布 (ファブリック)</td><td>柔らかさ、音を通す (スピーカ前面)</td><td>張りのしわ・端末処理、汚れ、難燃性の要否</td></tr>
  <tr><td>革・合成皮革</td><td>高級感、手になじむ</td><td>合成皮革は加水分解で劣化するものがある。用途に合う種類を選ぶ</td></tr>
</table>
<h2>量産での再現性</h2>
<ul>
  <li>シボ・つやは<b>番号 (シボメーカーの柄番号、光沢度)</b>で指定し、実物の見本板で承認する</li>
  <li>同じシボでも、樹脂の種類・成形条件・金型温度で見え方が変わる → 量産材料で見本を作る</li>
  <li>複数の部品 (樹脂と金属、異なる成形メーカー) を並べたとき、色とつやがそろうかを確認</li>
  <li>手作業の工程 (研磨・ヘアライン) はばらつきやすい → 限度見本で「ここまで良し」を決める</li>
</ul>
<div class="tb-tip"><b>3DCAD Studio</b>: 材料と色で金属・樹脂を切り替え、リアル表示で映り込みの違いを確認できます。勾配を付けた後で、シボ面の勾配が足りているか断面図で確かめましょう。</div>`,
    points: [
      "樹脂の表面は金型の転写。鏡面は磨き、シボはエッチングでつくる",
      "シボは傷・ヒケを隠すが勾配が多く必要。鏡面は欠点がすべて見える",
      "ヘアラインは目の向き、アルマイトは合金と処理条件で見え方が変わる",
      "量産では番号と見本板で指定し、量産材料・条件で承認する",
    ],
    exercises: [
      {
        q: "黒い樹脂のリモコンで、成形品の表面にヒケと指紋が目立つという不満が出ました。外観仕上げの面からの対策を挙げてください。",
        a: "鏡面をやめて<b>シボ (梨地)</b> にする (光が拡散し、ヒケ・指紋・傷が目立ちにくい)。シボの深さに応じて<b>抜き勾配を増やす</b>。色を真っ黒から<b>濃いグレー</b>にすると、ほこりや指紋の白さが目立ちにくくなる。根本的には肉厚の見直し (ヒケ対策) も併せて行う。",
      },
    ],
    quiz: [
      { q: "射出成形品のシボは通常どうやってつくる?", choices: ["成形後に紙やすりで削る", "金型表面をエッチングして転写する", "樹脂に粉を混ぜる"], answer: 1, explain: "金型表面に凹凸 (シボ) を付け、成形で転写します。" },
      { q: "アルマイト処理ができる代表的な金属は?", choices: ["鉄", "アルミニウム", "銅"], answer: 1, explain: "アルマイトはアルミニウムの陽極酸化処理です。" },
      { q: "鏡面仕上げの短所として正しいのは?", choices: ["傷やヒケが目立ちやすい", "勾配が多く必要", "色が付けられない"], answer: 0, explain: "鏡面は映り込みが強く、わずかな欠点も目立ちます。" },
    ],
    lessons: ["8-2"],
  },
  {
    id: "molded-design",
    part: "design",
    title: "【中級】樹脂成形品の意匠設計",
    minutes: 25,
    level: 2,
    lead: "射出成形品には、パーティングライン・ゲート跡・エジェクタピン跡・ウェルドライン・ヒケといった「成形の痕跡」が必ず生まれます。それらを見えない所へ導き、合わせ目の段差やすき間を意図的に設計して、量産品を美しく見せる方法を学びます。",
    body: `
<h2>成形の痕跡を知る</h2>
<svg class="tb-chart" viewBox="0 0 520 220" aria-label="成形品に現れる痕跡">
  <rect x="60" y="40" width="300" height="130" rx="18" fill="var(--tb-surface-2)" stroke="currentColor" stroke-width="2"/>
  <line x1="56" y1="105" x2="364" y2="105" stroke="var(--tb-accent)" stroke-width="2" stroke-dasharray="6 3"/>
  <circle cx="210" cy="40" r="5" fill="var(--tb-warn)"/>
  <path d="M290,40 C285,80 300,120 290,170" fill="none" stroke="var(--tb-bad)" stroke-width="1.5" stroke-dasharray="2 2"/>
  <circle cx="110" cy="140" r="6" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="160" cy="140" r="6" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <ellipse cx="240" cy="140" rx="18" ry="6" fill="var(--tb-text-3)" opacity="0.5"/>
  <circle cx="320" cy="75" r="10" fill="none" stroke="currentColor"/>
  <text class="tick" x="370" y="108">パーティングライン</text>
  <text class="tick" x="218" y="30">ゲート跡</text>
  <text class="tick" x="370" y="60">穴 → 下流にウェルド</text>
  <text class="tick" x="300" y="190">ウェルドライン</text>
  <text class="tick" x="80" y="190">エジェクタピン跡</text>
  <text class="tick" x="215" y="162">ヒケ (リブの裏)</text>
</svg>
<p class="tb-caption">図: 成形品に現れる主な痕跡 (模式図)。外観面にはできるだけ出さない</p>
<table class="tb-table">
  <tr><th>痕跡</th><th>原因</th><th>見せない工夫</th></tr>
  <tr><td>パーティングライン (PL)</td><td>金型の分割面</td><td>稜線・段差・溝に沿わせる。底面寄りに置く</td></tr>
  <tr><td>ゲート跡</td><td>樹脂の注入口</td><td>内側・底面・後で隠れる位置。サブマリンゲートで内側に</td></tr>
  <tr><td>エジェクタピン跡</td><td>成形品を押し出すピン</td><td>裏面 (非外観面) のリブやボス付近に配置</td></tr>
  <tr><td>ウェルドライン</td><td>流れが合流した所の細い線</td><td>ゲート位置を工夫して目立たない所で合流させる。シボ・濃色で目立ちにくく</td></tr>
  <tr><td>ヒケ</td><td>厚肉部の収縮でへこむ</td><td>肉厚を均一に、リブ厚は一般肉厚の 50〜60 % 程度を目安に</td></tr>
</table>
<h2>抜き勾配と離型</h2>
<p>型から取り出す方向の面に勾配がないと、成形品が型の壁にこすれて傷 (かじり) が付きます。下のアニメーションで、勾配の有無を切り替えて比べてみましょう。</p>
<div data-widget="anim-draft"></div>
<h2>合わせ目 (見切り) の段差とすき間</h2>
<p>上ケースと下ケースの合わせ目は、部品の寸法ばらつきや反りで、どうしても<b>ずれ</b>が生じます。ぴったり面一 (つらいち) を狙うと、0.05 mm のずれでも段差が目立ちます。そこで<b>あえて段差を付けて</b>、ずれを影の中に隠します。</p>
<svg class="tb-chart" viewBox="0 0 520 210" aria-label="面一と意図的な段差の比較">
  <text class="sec" x="20" y="20">断面 (合わせ目付近の拡大)</text>
  <rect x="40" y="40" width="80" height="60" fill="var(--tb-surface-2)" stroke="currentColor"/>
  <rect x="40" y="102" width="80" height="60" fill="var(--tb-surface-2)" stroke="currentColor"><animateTransform attributeName="transform" type="translate" values="0,0;3,0;-3,0;0,0" dur="3s" repeatCount="indefinite"/></rect>
  <text class="lbl" x="90" y="185" text-anchor="middle">面一: ずれると逆段差が目立つ</text>
  <rect x="300" y="40" width="80" height="60" fill="var(--tb-surface-2)" stroke="currentColor"/>
  <rect x="300" y="102" width="74" height="60" fill="var(--tb-surface-2)" stroke="var(--tb-accent)" stroke-width="1.5"><animateTransform attributeName="transform" type="translate" values="0,0;2,0;-2,0;0,0" dur="3s" repeatCount="indefinite"/></rect>
  <line class="guide" x1="374" y1="100" x2="374" y2="175"/><line class="guide" x1="380" y1="100" x2="380" y2="175"/>
  <text class="mark-t" x="390" y="140">段差 0.1〜0.3 mm</text>
  <text class="mark-t" x="390" y="105">すき間</text>
  <text class="lbl" x="350" y="185" text-anchor="middle">下を引っ込める: ずれても常に同じ向きの段差</text>
</svg>
<p class="tb-caption">図: 合わせ目の断面。ばらつき (左右の揺れ) があっても、意図した段差なら見た目が安定する</p>
<ul>
  <li>段差は<b>0.1〜0.3 mm 程度</b>が一つの目安。部品のばらつき (公差) より大きくすれば、ずれても段差の向きが逆転しない</li>
  <li>引っ込める側は、<b>小さく作っても違和感のない側</b> (下ケース・付属部品側) にするのが一般的</li>
  <li>すき間 (見切りのすき) も目安として 0.1〜0.3 mm 程度で、全周で<b>均一</b>に見えることが重要。不均一なすき間はずれ以上に目立つ</li>
  <li>V 溝や R 付きの見切りにすると、影ができて合わせ目が 1 本の「線」として見え、ずれが分からなくなる</li>
</ul>
<div class="tb-note">段差・すき間の具体値は、材料・部品の大きさ・成形メーカーの実力で変わります。ここでの値は<b>目安</b>であり、試作 (T0, T1) で実測して決めます。</div>
<h2>ヒケを防ぐ外観面</h2>
<svg class="tb-chart" viewBox="0 0 520 190" aria-label="リブとヒケ">
  <path d="M30,50 L230,50 L230,70 L150,70 L150,140 L110,140 L110,70 L30,70 Z" fill="var(--tb-surface-2)" stroke="currentColor"/>
  <path d="M110,50 Q130,58 150,50" fill="none" stroke="var(--tb-bad)" stroke-width="2.5"/>
  <text class="mark-t" x="130" y="40" text-anchor="middle">ヒケ</text>
  <text class="lbl" x="130" y="170" text-anchor="middle">リブが厚い (肉厚と同じ)</text>
  <path d="M290,50 L490,50 L490,70 L400,70 L398,140 L382,140 L380,70 L290,70 Z" fill="var(--tb-surface-2)" stroke="var(--tb-good)" stroke-width="1.5"/>
  <text class="mark-t" x="390" y="40" text-anchor="middle">外観面が平ら</text>
  <text class="lbl" x="390" y="170" text-anchor="middle">リブを薄く (肉厚の 50〜60 % 目安)</text>
</svg>
<p class="tb-caption">図: リブ根元の肉だまりがヒケの原因。外観面の裏ほどリブ・ボスを薄く</p>
<ul>
  <li>一般肉厚をそろえ、厚肉部は肉抜きする</li>
  <li>外観面の裏にボスを立てるときは、ボスの周りを薄くする、または外観面から離して補強リブでつなぐ</li>
  <li>どうしても消えないヒケは、シボ・わずかに張った面 (クラウン)・濃色で目立ちにくくする</li>
</ul>
<h2>スナップフィットの見せ方</h2>
<p>ねじを使わずに組み立てるスナップフィットは、外観にねじ穴が出ない利点があります。フックがたわんで引っかかる様子と、そのときのひずみを次のアニメーションで確認しましょう。</p>
<div data-widget="anim-snapfit"></div>
<p>フックのひずみが材料の許容値を超えると白化・破損するため、たわみ量とフックの長さを調整します。外観面には、フックの穴や<b>無理抜きのための逃げ</b>が出ないよう、内側から組み付ける構造にするのが基本です。</p>
<div class="tb-tip"><b>3DCAD Studio</b>: 勾配とシェルでケースを作り、合わせ目の段差は断面図で確認しましょう。3D プリントチェックで薄すぎる肉厚を見つけ、試作で段差の見え方を確かめると効果的です。</div>`,
    points: [
      "PL・ゲート・エジェクタピン・ウェルド・ヒケは必ず生まれる。見えない所へ導く",
      "合わせ目は面一を狙わず、0.1〜0.3 mm 程度 (目安) の意図的な段差でばらつきを隠す",
      "すき間は大きさより均一さが重要。V 溝や R の見切りで線として見せる",
      "ヒケはリブ・ボスを薄くして防ぎ、残るものはシボや張りで目立たなくする",
    ],
    exercises: [
      {
        q: "上下ケースの外形寸法のばらつきがそれぞれ ±0.08 mm です。面一で設計すると、合わせ目の段差は最悪いくらになりますか。段差を常に同じ向きにするには、下ケースをどれだけ引っ込めればよいですか。",
        a: "片側あたりの段差の最悪値は 0.08 + 0.08 = <b>0.16 mm</b> (上が大きく下が小さい場合と、その逆の両方向)。段差の向きを逆転させないためには、下ケースを<b>0.16 mm より大きく</b>引っ込める必要があり、例えば <b>0.2 mm</b> とする。これは 0.1〜0.3 mm の目安とも合う (実際には反りや組立ずれも加味し、試作で確認する)。",
      },
    ],
    quiz: [
      { q: "ウェルドラインができる場所は?", choices: ["樹脂の流れが合流する所", "ゲートの真上", "エジェクタピンの位置"], answer: 0, explain: "穴の下流など、分かれた流れが合流する所に細い線が出ます。" },
      { q: "合わせ目に 0.1〜0.3 mm の段差を意図的に付ける主な理由は?", choices: ["強度を上げる", "部品のばらつきによるずれを目立たなくする", "材料を節約する"], answer: 1, explain: "ばらつきより大きな段差にすれば、段差の向きが常に一定で、ずれが目立ちません。" },
      { q: "外観面にヒケを出さないためのリブ厚の目安は?", choices: ["一般肉厚の 50〜60 % 程度", "一般肉厚の 2 倍", "一般肉厚と同じ"], answer: 0, explain: "リブ根元の肉だまりを減らすため、肉厚より薄くします。" },
    ],
    lessons: ["7-2", "8-1"],
  },
  {
    id: "cmf-planning",
    part: "design",
    title: "【上級】CMF 企画と色の量産管理",
    minutes: 25,
    level: 3,
    lead: "カラーバリエーションは「色を何色か並べる」ことではなく、誰に・どの売り場で・何色を何台売るかという企画です。バリエーションの組み方、限度見本、色差 ΔE、光源とメタメリズム、トレンドの読み方まで、量産で色を守る実務を学びます。",
    body: `
<h2>カラーバリエーションの組み方</h2>
<p>バリエーションは、売れ筋を支える<b>ベース色</b>と、話題をつくる<b>アクセント色</b>で構成するのが定石です。色数が増えるほど在庫と管理の負担が増えるので、役割を決めて絞ります。</p>
<svg class="tb-chart" viewBox="0 0 520 200" aria-label="カラーバリエーションの構成">
  <rect x="40" y="40" width="70" height="90" rx="10" fill="var(--tb-text-2)" stroke="currentColor"/>
  <rect x="125" y="40" width="70" height="90" rx="10" fill="var(--tb-surface-2)" stroke="currentColor"/>
  <rect x="210" y="40" width="70" height="90" rx="10" fill="var(--tb-text-3)" stroke="currentColor"/>
  <rect x="330" y="40" width="70" height="90" rx="10" fill="var(--tb-accent)" stroke="currentColor"/>
  <rect x="415" y="40" width="70" height="90" rx="10" fill="var(--tb-warn)" stroke="currentColor"/>
  <line class="guide" x1="305" y1="30" x2="305" y2="150"/>
  <text class="lbl" x="160" y="160" text-anchor="middle">ベース (無彩色・定番) 売上の大半</text>
  <text class="lbl" x="408" y="160" text-anchor="middle">アクセント (限定・季節)</text>
  <text class="tick" x="160" y="25" text-anchor="middle">長く売る</text><text class="tick" x="408" y="25" text-anchor="middle">話題・入れ替え</text>
</svg>
<p class="tb-caption">図: ベース色とアクセント色の組み方 (例)。売上構成は製品分野によって大きく異なる</p>
<ul>
  <li><b>部品単位で色を分ける</b>: 外装 1 部品だけ色を変え、内部部品は共通にすると、コストを抑えて色数を増やせる</li>
  <li><b>素材・仕上げの軸</b>も使う: 同じ色でも、つやとマットで別の価値になる</li>
  <li><b>色名</b>は印象を左右する。「グレー」より「ストーン」「フォグ」のように世界観を伝える</li>
</ul>
<h2>限度見本 — 「ここまで良し」を物で決める</h2>
<p>色・つや・シボは数値だけでは管理しきれません。<b>標準見本</b> (狙いの色) と、許容できる範囲の端を示す<b>限度見本</b> (明るい側・暗い側・赤み・青み など) を実物で用意し、関係者が同じものを持ちます。</p>
<svg class="tb-chart" viewBox="0 0 520 170" aria-label="標準見本と限度見本">
  <rect x="200" y="40" width="120" height="80" rx="6" fill="var(--tb-accent)" stroke="currentColor" stroke-width="2"/>
  <rect x="60" y="55" width="90" height="50" rx="6" fill="var(--tb-accent)" opacity="0.7" stroke="currentColor"/>
  <rect x="370" y="55" width="90" height="50" rx="6" fill="var(--tb-accent)" stroke="currentColor"/>
  <rect x="370" y="55" width="90" height="50" rx="6" fill="var(--tb-text-2)" opacity="0.35"/>
  <text class="lbl" x="260" y="140" text-anchor="middle">標準見本</text>
  <text class="lbl" x="105" y="140" text-anchor="middle">限度 (明)</text>
  <text class="lbl" x="415" y="140" text-anchor="middle">限度 (暗)</text>
  <text class="tick" x="260" y="160" text-anchor="middle">この間に入れば合格</text>
</svg>
<p class="tb-caption">図: 標準見本と上下の限度見本。見本は退色するので保管条件と更新時期を決める</p>
<h2>色差 ΔE</h2>
<p>色を数値で比べるときは、L*a*b* 色空間 (L* = 明度、a* = 赤−緑、b* = 黄−青) で測色し、2 色の距離を<b>色差 ΔE</b> で表します。</p>
<p class="tb-formula">ΔE*ab = √( (ΔL*)² + (Δa*)² + (Δb*)² )</p>
<table class="tb-table">
  <tr><th>ΔE*ab の目安</th><th>見え方 (並べて比べたとき)</th></tr>
  <tr><td>〜0.5 程度</td><td>ほとんど区別できない</td></tr>
  <tr><td>〜1 程度</td><td>注意深く並べると分かる</td></tr>
  <tr><td>〜2〜3 程度</td><td>並べると分かる。離して置くと同じ色に見えることが多い</td></tr>
  <tr><td>それ以上</td><td>はっきり違う色</td></tr>
</table>
<div class="tb-note">許容値は<b>目安</b>で、業界・部位・色によって変わります。隣り合う部品は厳しく、離れた部品は緩くするのが一般的です。より人の感覚に近い式として ΔE00 (CIEDE2000) も広く使われるので、契約ではどの式で何以下かを明記します。</div>
<h2>光源とメタメリズム</h2>
<p>色の見え方は照明で変わります。測色や目視比較の基準光源として、昼光の <b>D65</b> (約 6500 K)、白熱電球の <b>A 光源</b> (約 2856 K) などが使われます。</p>
<svg class="tb-chart" viewBox="0 0 520 210" aria-label="メタメリズム">
  <text class="sec" x="20" y="22">D65 (昼光) の下</text>
  <rect x="40" y="35" width="90" height="50" rx="6" fill="var(--tb-good)"/>
  <rect x="150" y="35" width="90" height="50" rx="6" fill="var(--tb-good)"/>
  <text class="tick" x="140" y="102" text-anchor="middle">同じ色に見える</text>
  <text class="sec" x="280" y="22">A 光源 (白熱灯) の下</text>
  <rect x="300" y="35" width="90" height="50" rx="6" fill="var(--tb-good)"/>
  <rect x="410" y="35" width="90" height="50" rx="6" fill="var(--tb-warn)" opacity="0.8"/>
  <text class="tick" x="400" y="102" text-anchor="middle">違って見える</text>
  <text class="sec" x="20" y="130">分光反射率 (模式)</text>
  <line class="axis" x1="40" y1="195" x2="500" y2="195"/>
  <path d="M40,180 C120,175 180,130 260,135 C340,140 400,170 500,175" fill="none" stroke="currentColor" stroke-width="2"/>
  <path d="M40,185 C100,160 180,150 230,135 C300,120 360,175 420,165 C460,158 480,145 500,150" fill="none" stroke="var(--tb-accent)" stroke-width="2"/>
  <text class="tick" x="45" y="208">短波長 (青)</text><text class="tick" x="500" y="208" text-anchor="end">長波長 (赤)</text>
</svg>
<p class="tb-caption">図: メタメリズム (条件等色)。分光反射率の形が違う 2 つの色は、ある光源では一致しても別の光源ではずれる</p>
<ul>
  <li>樹脂部品と塗装部品など<b>材料や顔料が違う</b>部品を同色に見せると、メタメリズムが起きやすい</li>
  <li>色合わせは<b>複数の光源</b> (例: D65 と A、店舗照明に近い光源) で確認し、どの光源を基準にするかを取り決める</li>
  <li>目視比較は、規格に沿った色評価用のブース (標準光源装置) で、同じ角度・背景で行う</li>
</ul>
<h2>トレンドの読み方</h2>
<ul>
  <li>色のトレンドは、ファッション・インテリア・自動車などの動きが数年かけて家電・雑貨に広がることが多い</li>
  <li>色見本会社やトレンド予測機関の発表、展示会 (家具・素材) を<b>参考</b>にしつつ、自社の顧客と売り場で検証する</li>
  <li>製品寿命が長い物ほど、トレンド色は<b>交換できる部品・限定色</b>にとどめ、本体は定番色にするのが無難</li>
</ul>
<div class="tb-tip"><b>3DCAD Studio</b>: 材料と色で部品ごとの色を切り替え、リアル表示と高解像度画像でバリエーションを並べて比較できます。ただし画面の色は照明・モニタで変わるため、最終判断は実物見本で行いましょう。</div>`,
    points: [
      "バリエーションはベース色 + アクセント色で役割を決め、部品単位で色を分ける",
      "標準見本と限度見本を実物で共有し、保管と更新を管理する",
      "色差 ΔE は L*a*b* の距離。許容値は部位で変え、式 (ΔE*ab / ΔE00) を明記する",
      "メタメリズムに備え、D65・A など複数光源で色合わせを確認する",
    ],
    exercises: [
      {
        q: "標準見本 L* = 50.0, a* = 2.0, b* = −3.0、量産品 L* = 51.2, a* = 1.5, b* = −2.0 のとき、ΔE*ab を求め、許容値 ΔE ≤ 1.5 に対して合否を判定してください。",
        a: "ΔL* = 1.2, Δa* = −0.5, Δb* = 1.0。ΔE*ab = √(1.44 + 0.25 + 1.00) = √2.69 ≈ <b>1.64</b>。許容値 1.5 を超えるので<b>不合格</b>。明度 (ΔL* = +1.2、明るい側) のずれが最も大きいので、まず明るさを合わせる調色を依頼する。",
      },
    ],
    quiz: [
      { q: "昼光を代表する標準光源は?", choices: ["A 光源", "D65", "F2"], answer: 1, explain: "D65 は相関色温度約 6500 K の昼光を代表する標準イルミナントです。" },
      { q: "ある光源では同じ色、別の光源では違う色に見える現象は?", choices: ["メタメリズム (条件等色)", "色順応", "ハレーション"], answer: 0, explain: "分光反射率が異なる色どうしで起こります。" },
      { q: "L*a*b* で L* が表すのは?", choices: ["赤−緑", "明度", "黄−青"], answer: 1, explain: "L* は明度、a* は赤−緑、b* は黄−青の軸です。" },
    ],
    lessons: ["8-2"],
  },
  {
    id: "design-for-emotion",
    part: "design",
    title: "【上級】愛着とストーリー — 長く使われるデザイン",
    minutes: 20,
    level: 3,
    lead: "人が物に愛着を持つのは、見た目だけでなく、触れたときの感触、操作音、重さ、使い込んで変わっていく様子、そして背景にある物語があるからです。感性品質と経年変化を設計し、長く使われる製品をつくる考え方を学びます。",
    body: `
<h2>経年変化 — 劣化か、味わいか</h2>
<p>時間とともに物は必ず変化します。その変化が「汚れ・劣化」に見えるか「味わい (エイジング)」に見えるかは、素材と仕上げの選び方で決まります。</p>
<svg class="tb-chart" viewBox="0 0 520 200" aria-label="経年変化と魅力">
  <line class="axis" x1="50" y1="160" x2="500" y2="160"/><line class="axis" x1="50" y1="160" x2="50" y2="20"/>
  <text class="lbl" x="56" y="30">魅力</text><text class="lbl" x="495" y="180" text-anchor="end">使用年数 →</text>
  <path d="M55,50 C150,60 250,110 495,140" fill="none" stroke="var(--tb-bad)" stroke-width="2.5"/>
  <path d="M55,70 C150,70 250,55 495,35" fill="none" stroke="var(--tb-good)" stroke-width="2.5"/>
  <text class="mark-t" x="400" y="128">塗装の剥げ・樹脂の黄変</text>
  <text class="mark-t" x="330" y="40">革・真鍮・無垢材</text>
  <circle r="5" fill="var(--tb-accent)"><animateMotion dur="6s" repeatCount="indefinite" path="M55,70 C150,70 250,55 495,35"/></circle>
</svg>
<p class="tb-caption">図: 経年変化の 2 つの方向 (概念図)。新品が最も美しい物と、使うほど良くなる物</p>
<ul>
  <li><b>味わいになる素材</b>: 革 (つやが出る)、真鍮 (色が深まる)、無垢材 (色が濃くなる)、デニム (色落ち)</li>
  <li><b>劣化に見えやすい</b>: 薄い塗装の剥げ、印刷文字の摩耗、白い樹脂の黄変、光沢面の細かい傷</li>
  <li>対策: 素地と同色にする (剥げても目立たない)、文字は刻印・インモールドに、よく触れる所はシボやブラストに</li>
</ul>
<h2>感性品質 — 触感・音・重さ</h2>
<table class="tb-table">
  <tr><th>感覚</th><th>設計の要素</th><th>例</th></tr>
  <tr><td>触感</td><td>表面の粗さ、温度感 (熱伝導率)、R の大きさ、すき間・段差の少なさ</td><td>金属は冷たく硬質、木・布は温かい</td></tr>
  <tr><td>音</td><td>スイッチのクリック音、蓋が閉まる音、ファンの音質</td><td>自動車のドアの「閉まる音」は高級感の評価対象</td></tr>
  <tr><td>重さ</td><td>質量と重心の位置</td><td>適度な重さは安定感・信頼感。手持ち品は軽さが優先</td></tr>
  <tr><td>操作感</td><td>荷重とストロークの関係 (クリック感)、ダイヤルの節度</td><td>押し始めに抵抗が増え、ある点で急に抜けると「押した」感じが明確</td></tr>
</table>
<svg class="tb-chart" viewBox="0 0 520 200" aria-label="スイッチの荷重とストローク">
  <line class="axis" x1="60" y1="160" x2="480" y2="160"/><line class="axis" x1="60" y1="160" x2="60" y2="20"/>
  <text class="lbl" x="66" y="30">荷重</text><text class="lbl" x="475" y="180" text-anchor="end">ストローク →</text>
  <path d="M60,160 L200,60 L260,120 L330,110 L400,30" fill="none" stroke="var(--tb-accent)" stroke-width="2.5"/>
  <circle cx="200" cy="60" r="4" fill="currentColor"/><circle cx="260" cy="120" r="4" fill="currentColor"/>
  <text class="mark-t" x="205" y="52">ピーク荷重</text>
  <text class="mark-t" x="265" y="140">急に抜ける → クリック感</text>
  <line class="guide" x1="200" y1="60" x2="200" y2="160"/><line class="guide" x1="260" y1="120" x2="260" y2="160"/>
</svg>
<p class="tb-caption">図: タクトスイッチの荷重−ストローク特性 (模式図)。ピークから落ちる量が「クリック感」をつくる</p>
<div class="tb-note">感性品質は、言葉 (「しっとり」「カチッと」) と物理量 (荷重、音圧、周波数、表面粗さ) を<b>対応づけて</b>評価すると、設計目標にできます。複数の人に試作を比べてもらう官能評価で、好まれる範囲を探ります。</div>
<h2>ブランド体験 — 物を超えた接点</h2>
<ul>
  <li><b>開封体験</b>: 箱を開ける順序、最初に目に入る物、付属品の収まり</li>
  <li><b>使い始め</b>: 初回の設定が迷わず終わるか。最初の成功体験</li>
  <li><b>修理・サポート</b>: 部品が買える、直せる、相談できる — 長く付き合える安心感</li>
  <li><b>物語</b>: 産地・素材・作り手・開発の背景。ただし事実に基づくこと (誇張は信頼を失う)</li>
</ul>
<h2>長く使われるデザイン</h2>
<svg class="tb-chart" viewBox="0 0 520 170" aria-label="長寿命化の要素">
  <circle cx="260" cy="85" r="34" fill="var(--tb-surface-2)" stroke="var(--tb-accent)" stroke-width="2"/>
  <text class="lbl" x="260" y="90" text-anchor="middle">長く使う</text>
  <g stroke="var(--tb-text-3)"><line x1="226" y1="78" x2="140" y2="45"/><line x1="226" y1="95" x2="140" y2="130"/><line x1="294" y1="78" x2="380" y2="45"/><line x1="294" y1="95" x2="380" y2="130"/></g>
  <text class="lbl" x="135" y="40" text-anchor="end">飽きない形</text>
  <text class="lbl" x="135" y="138" text-anchor="end">直せる構造</text>
  <text class="lbl" x="385" y="40">美しく古びる素材</text>
  <text class="lbl" x="385" y="138">愛着 (物語・体験)</text>
</svg>
<p class="tb-caption">図: 長く使われる製品を支える 4 つの要素</p>
<ul>
  <li><b>飽きない形</b>: 流行の装飾に頼らず、比率と面の質で勝負する</li>
  <li><b>直せる構造</b>: ねじで開けられる、消耗部品 (電池・ベルト・カバー) を交換できる</li>
  <li><b>美しく古びる素材</b>: 傷が味になる仕上げ、色あせしにくい顔料</li>
  <li><b>愛着</b>: 名前を刻める、カスタマイズできる、使い方の記憶が残る</li>
</ul>
<p>長く使われることは、資源の消費を減らすことにもつながります (サステナブルデザインの章も参照)。</p>
<div class="tb-tip"><b>3DCAD Studio</b>: 文字機能で名前やシリアルを刻印・エンボスしたモデルを作り、リアル表示で質感を確認してみましょう。材料と色で真鍮や木を選び、経年変化後の色をイメージした別バリエーションと並べるのも有効です。</div>`,
    points: [
      "変化が劣化に見えるか味わいに見えるかは素材と仕上げで決まる",
      "触感・音・重さ・操作感は物理量と対応づけて設計目標にする",
      "開封・使い始め・修理まで含めた体験がブランドへの信頼をつくる",
      "飽きない形・直せる構造・美しく古びる素材・愛着が長寿命を支える",
    ],
    exercises: [
      {
        q: "毎日持ち歩く金属製のペンケースを「10 年使える」コンセプトで企画します。仕上げと構造の工夫を 3 つ挙げてください。",
        a: "① 表面を<b>ブラストやヘアライン</b>にして小傷を目立ちにくくする、または真鍮など<b>経年で色が深まる素材</b>を選ぶ。② ロゴや名前は印刷ではなく<b>刻印</b>にし、摩耗で消えないようにする。③ 開閉のヒンジや内張りを<b>ねじ止めで交換可能</b>にし、消耗部品を販売する。角は大きめの R にして、落としたときの打痕も目立ちにくくする。",
      },
    ],
    quiz: [
      { q: "使うほど味わいが増す素材の例として適切なのは?", choices: ["薄い塗装の白い樹脂", "革や真鍮", "印刷フィルム"], answer: 1, explain: "革はつやが出て、真鍮は色が深まり、経年変化が魅力になります。" },
      { q: "タクトスイッチの「クリック感」を主に生むのは?", choices: ["ピーク荷重の後に荷重が急に下がること", "ストロークが長いこと", "表面のシボ"], answer: 0, explain: "荷重−ストローク特性で、ピーク後に荷重が落ちる量が感触を決めます。" },
      { q: "長く使われるための構造上の工夫は?", choices: ["接着で完全に一体化する", "消耗部品を交換できるようにする", "流行色を全面に使う"], answer: 1, explain: "直せる・交換できる構造は製品寿命を延ばします。" },
    ],
    lessons: ["1-1", "8-2"],
  },
];
