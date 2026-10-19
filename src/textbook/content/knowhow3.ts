import type { TextChapter } from "../types";

export const KNOWHOW3: TextChapter[] = [
  {
    id: "design-thinking-eng",
    part: "knowhow",
    title: "【初級】設計者の考え方",
    minutes: 15,
    level: 1,
    lead: "設計は CAD を操作することではなく、「何のために、どんな働きが必要か」を考え、それを作れる形に落とし込む仕事です。ベテランが無意識にやっている考え方の順番を、新人向けに言葉にします。",
    body: `
<h2>機能から考える</h2>
<p>いきなり形を描き始めると、「なぜこの形なのか」を説明できない設計になります。まず<b>目的 → 機能 → 手段 (形)</b> の順に分解します。</p>
<svg class="tb-chart" viewBox="0 0 520 210" role="img" aria-label="目的・機能・手段の分解">
  <rect x="180" y="16" width="160" height="34" rx="6" fill="var(--tb-surface-2)" stroke="var(--tb-accent)" stroke-width="2"/>
  <text class="mark-t" x="260" y="38" text-anchor="middle">目的: 箱を棚へ載せる</text>
  <rect x="30" y="86" width="130" height="34" rx="6" fill="var(--tb-surface-2)" stroke="currentColor"/>
  <text class="lbl" x="95" y="108" text-anchor="middle">機能: つかむ</text>
  <rect x="195" y="86" width="130" height="34" rx="6" fill="var(--tb-surface-2)" stroke="currentColor"/>
  <text class="lbl" x="260" y="108" text-anchor="middle">機能: 持ち上げる</text>
  <rect x="360" y="86" width="130" height="34" rx="6" fill="var(--tb-surface-2)" stroke="currentColor"/>
  <text class="lbl" x="425" y="108" text-anchor="middle">機能: 位置で止める</text>
  <line class="guide" x1="260" y1="50" x2="95" y2="86"/><line class="guide" x1="260" y1="50" x2="260" y2="86"/><line class="guide" x1="260" y1="50" x2="425" y2="86"/>
  <text class="tick" x="95" y="150" text-anchor="middle">吸着 / 爪 / 磁石</text>
  <text class="tick" x="260" y="150" text-anchor="middle">ボールねじ / ベルト / シリンダ</text>
  <text class="tick" x="425" y="150" text-anchor="middle">センサ + 停止 / ストッパ</text>
  <line class="guide" x1="95" y1="120" x2="95" y2="138"/><line class="guide" x1="260" y1="120" x2="260" y2="138"/><line class="guide" x1="425" y1="120" x2="425" y2="138"/>
  <text class="lbl" x="260" y="190" text-anchor="middle">手段 (形・部品) は機能ごとに複数の候補から選ぶ</text>
</svg>
<p class="tb-caption">図: 目的を機能に分け、機能ごとに手段の候補を並べる。候補を比べてから形にすると、選んだ理由を説明できる</p>
<ul>
  <li>「穴をあける」ではなく「位置を決める」「固定する」のように<b>動詞 + 目的語</b>で機能を書く</li>
  <li>機能ごとに手段を 2〜3 案出し、性能・コスト・リスクで比べる (いきなり 1 案に決めない)</li>
  <li>仕様書の数値 (荷重・速度・寿命・環境) をここで確認する。数値のない要求は質問して決める</li>
</ul>
<h2>まず手で描く・概算する</h2>
<p>CAD に向かう前に、紙に<b>ポンチ絵</b> (ラフスケッチ) を描き、主な寸法・質量・力を<b>桁が合う程度に概算</b>します。CAD は細部まで描けてしまうため、全体の成立性を確かめる前に細部に時間を使いがちです。</p>
<ul>
  <li>質量 ≈ 体積 × 密度 (鋼 7.85、アルミ 2.7、樹脂 1〜1.4 g/cm³)</li>
  <li>力・応力は「F = ma」「σ = F/A」「σ = M/Z」の 1 行で桁を出す</li>
  <li>概算と詳細計算 (解析) が 2〜3 倍以上違ったら、どちらかの条件が間違っている</li>
</ul>
<svg class="tb-chart" viewBox="0 0 520 170" role="img" aria-label="設計の繰り返しの流れ">
  <rect x="20" y="60" width="100" height="40" rx="6" fill="var(--tb-surface-2)" stroke="var(--tb-accent)" stroke-width="1.5"/><text class="lbl" x="70" y="85" text-anchor="middle">ポンチ絵</text>
  <rect x="145" y="60" width="100" height="40" rx="6" fill="var(--tb-surface-2)" stroke="var(--tb-accent)" stroke-width="1.5"/><text class="lbl" x="195" y="85" text-anchor="middle">概算</text>
  <rect x="270" y="60" width="100" height="40" rx="6" fill="var(--tb-surface-2)" stroke="var(--tb-accent)" stroke-width="1.5"/><text class="lbl" x="320" y="85" text-anchor="middle">3D モデル</text>
  <rect x="395" y="60" width="100" height="40" rx="6" fill="var(--tb-surface-2)" stroke="var(--tb-accent)" stroke-width="1.5"/><text class="lbl" x="445" y="85" text-anchor="middle">詳細計算・解析</text>
  <line x1="120" y1="80" x2="145" y2="80" stroke="var(--tb-accent)" stroke-width="2"/><line x1="245" y1="80" x2="270" y2="80" stroke="var(--tb-accent)" stroke-width="2"/><line x1="370" y1="80" x2="395" y2="80" stroke="var(--tb-accent)" stroke-width="2"/>
  <path d="M445,100 C445,150 70,150 70,104" fill="none" class="guide"/>
  <text class="tick" x="260" y="160" text-anchor="middle">合わなければ早い段階に戻る。戻るのは失敗ではなく設計の普通の進み方</text>
  <text class="tick" x="132" y="45" text-anchor="middle">安い・速い</text><text class="tick" x="408" y="45" text-anchor="middle">高い・遅い</text>
</svg>
<p class="tb-caption">図: 安く速い手段 (手描き・概算) で大きな間違いを先につぶし、時間のかかる作業は後に回す</p>
<h2>作る人・使う人・直す人を想像する</h2>
<table class="tb-table">
  <tr><th>立場</th><th>想像すること</th><th>設計への反映の例</th></tr>
  <tr><td>作る人 (加工・組立)</td><td>工具が届くか、つかめるか、どの順に組むか</td><td>入隅 R、基準面、一方向から組める構造</td></tr>
  <tr><td>使う人</td><td>どう操作するか、どう間違えるか、どこに触るか</td><td>操作部の位置、ポカヨケ、角の面取り、カバー</td></tr>
  <tr><td>直す人 (保守)</td><td>何が壊れ・すり減るか、どう交換するか</td><td>消耗品を手前に、交換に必要な空間、標準部品</td></tr>
  <tr><td>運ぶ人・捨てる人</td><td>吊れるか、梱包できるか、分別できるか</td><td>吊りボルト穴、分解しやすい締結、材質表示</td></tr>
</table>
<h2>よい設計の条件</h2>
<table class="tb-table">
  <tr><th>条件</th><th>意味</th><th>確かめ方</th></tr>
  <tr><td>機能を満たす</td><td>仕様の数値をすべて満たす</td><td>計算書・試験</td></tr>
  <tr><td>壊れない</td><td>最大荷重・繰返し・環境で寿命まで持つ</td><td>強度・疲労計算、解析</td></tr>
  <tr><td>作れる・安い</td><td>普通の設備・公差で作れる</td><td>加工者・調達との相談</td></tr>
  <tr><td>安全</td><td>誤使用・故障時も危険にならない</td><td>リスクアセスメント</td></tr>
  <tr><td>単純</td><td>部品が少なく、理由を説明できる</td><td>部品表・設計レビュー</td></tr>
  <tr><td>伝わる</td><td>図面・文書で意図が誤解なく伝わる</td><td>検図</td></tr>
</table>
<h2>新人がつまずく点</h2>
<ul>
  <li><b>いきなり細部を描く</b>: 全体レイアウトが決まる前にフィレットやねじ穴を描き込み、変更のたびに作り直す</li>
  <li><b>根拠のない寸法</b>: 「なんとなく 10 mm」。なぜその値かを 1 行でよいので残す</li>
  <li><b>一人で抱え込む</b>: 加工・組立・品質の担当者に早く見せるほど、手戻りが小さい</li>
  <li><b>公差を全部厳しく</b>: 安心のつもりがコストと納期を悪化させる</li>
  <li><b>モデルが合っている = 実物が動く</b>と思い込む: たわみ・熱・公差・組立誤差は CAD 上では見えない</li>
</ul>
<div class="tb-tip"><b>3DCAD Studio</b>: 概算した質量は <b>iProperties</b> の質量・重心と比べて検算しましょう。大きく違えば材料設定か形状に誤りがあります。</div>`,
    points: [
      "目的 → 機能 → 手段の順に考え、手段は複数案から選ぶ",
      "CAD の前にポンチ絵と概算で全体の成立性を確かめる",
      "作る人・使う人・直す人 (運ぶ人・捨てる人) の立場で見直す",
      "寸法には根拠を残し、早く周りの人に見せる",
    ],
    exercises: [
      {
        q: "鋼板 300 × 200 × 10 mm のベースの質量を概算してください (鋼の密度 7.85 g/cm³)。",
        a: "体積 = 300 × 200 × 10 = 600,000 mm³ = 600 cm³。質量 ≈ 600 × 7.85 = 4,710 g ≈ <b>4.7 kg</b>。片手で持てるが、作業者が繰り返し持つなら取っ手や吊り方を考える重さです。",
      },
    ],
    quiz: [
      { q: "機能の書き方として適切なのは?", choices: ["φ6 の穴をあける", "部品の位置を決める", "SS400 を使う"], answer: 1, explain: "機能は「動詞 + 目的語」で働きを表します。穴や材料は機能を実現する手段です。" },
      { q: "CAD の前に概算する主な理由は?", choices: ["図面を早く出すため", "全体の成立性と桁を安く早く確かめるため", "解析を省略するため"], answer: 1, explain: "大きな間違いを安い手段で先につぶすためです。解析は概算で桁を確認したうえで行います。" },
      { q: "保守 (直す人) の視点で優先すべき設計は?", choices: ["消耗部品を奥にまとめる", "消耗部品を手前に置き交換空間を確保する", "全部品を接着する"], answer: 1, explain: "壊れる・すり減る部品ほど、手が届き交換しやすい場所に置きます。" },
    ],
    lessons: ["3-2", "9-1"],
  },
  {
    id: "layout-design",
    part: "knowhow",
    title: "【中級】レイアウト設計の進め方",
    minutes: 20,
    level: 2,
    lead: "部品の詳細を描く前に、主要部品をどこに置くかを決めるのがレイアウト設計です。ここで決まった配置は後から変えにくく、性能・安全・保守性・コストの大部分を左右します。",
    body: `
<h2>主要部品の配置から始める</h2>
<ol class="tb-flow">
  <li>仕様の確認 (外形の制約・設置場所・搬入経路)</li>
  <li>主要部品 (モーター・ワーク・制御盤など) を箱で置く</li>
  <li>動く範囲と力の流れを確認</li>
  <li>人の動線・保守空間を確保</li>
  <li>配線・配管ルートを決める</li>
  <li>重心・転倒の確認</li>
</ol>
<p>最初は部品を<b>直方体の箱</b>で表し、外形寸法と質量だけを持たせます。形を作り込むのは配置が固まってからです。重いもの・大きいものから先に、力の流れが短くなるように置きます。</p>
<h2>動線と保守スペース</h2>
<svg class="tb-chart" viewBox="0 0 520 220" role="img" aria-label="装置の平面レイアウト">
  <rect x="140" y="40" width="240" height="110" fill="var(--tb-surface-2)" stroke="currentColor" stroke-width="1.5"/>
  <text class="lbl" x="260" y="64" text-anchor="middle">装置本体</text>
  <rect x="160" y="80" width="70" height="50" fill="none" stroke="var(--tb-accent)" stroke-width="1.5"/><text class="tick" x="195" y="110" text-anchor="middle">駆動部</text>
  <rect x="290" y="80" width="70" height="50" fill="none" stroke="var(--tb-accent)" stroke-width="1.5"/><text class="tick" x="325" y="110" text-anchor="middle">作業部</text>
  <rect x="390" y="40" width="50" height="110" fill="var(--tb-surface-2)" stroke="currentColor" stroke-width="1.5"/><text class="tick" x="415" y="99" text-anchor="middle">盤</text>
  <rect x="140" y="150" width="240" height="40" fill="var(--tb-good)" opacity="0.15" stroke="var(--tb-good)" stroke-dasharray="4 3"/>
  <text class="lbl" x="260" y="175" text-anchor="middle" style="fill:var(--tb-good)">作業者側 (操作・ワーク出し入れ)</text>
  <rect x="80" y="40" width="60" height="110" fill="var(--tb-warn)" opacity="0.15" stroke="var(--tb-warn)" stroke-dasharray="4 3"/>
  <text class="tick" x="110" y="92" text-anchor="middle">保守</text><text class="tick" x="110" y="108" text-anchor="middle">空間</text>
  <rect x="440" y="40" width="50" height="110" fill="var(--tb-warn)" opacity="0.15" stroke="var(--tb-warn)" stroke-dasharray="4 3"/>
  <text class="tick" x="465" y="92" text-anchor="middle">扉の</text><text class="tick" x="465" y="108" text-anchor="middle">開閉</text>
  <polyline points="230,105 290,105" fill="none" stroke="var(--tb-accent)" stroke-width="2" stroke-dasharray="6 4"/>
  <path d="M390,60 L250,60 L250,80" fill="none" stroke="var(--tb-bad)" stroke-width="1.5" stroke-dasharray="2 3"/>
  <text class="tick" x="320" y="54" text-anchor="middle">配線ルート</text>
  <text class="tick" x="260" y="212" text-anchor="middle">点線の領域は物を置かない空間としてモデルに入れておく</text>
</svg>
<p class="tb-caption">図: 平面レイアウトの例。作業者側・保守空間・扉の開閉範囲を「空間の部品」として確保し、配線は動く部分を避けて最短に通す</p>
<ul>
  <li><b>作業者の動線</b>: ワークの出し入れ・操作盤・非常停止は作業者の正面、手の届く高さ (目安 床から 700〜1,500 mm 程度) に</li>
  <li><b>保守空間</b>: 消耗品・調整部の前に、手と工具が入る空間を確保する (人が入るなら体の寸法も)</li>
  <li><b>扉・カバーの開閉範囲</b>、引き出しの引き代、搬入時の寸法 (エレベータ・通路幅) も確認</li>
  <li>熱を出すもの (モーター・電源) と熱に弱いもの (センサ・樹脂部品) を離す</li>
</ul>
<h2>重心と転倒</h2>
<p>背の高い装置や台車では<b>転倒</b>の確認が欠かせません。重心が支点 (転倒の軸になる底面の縁) の真上を越えると倒れます。</p>
<svg class="tb-chart" viewBox="0 0 520 230" role="img" aria-label="転倒角の求め方">
  <line class="axis" x1="40" y1="200" x2="250" y2="200"/>
  <rect x="80" y="40" width="120" height="160" fill="var(--tb-surface-2)" stroke="currentColor" stroke-width="1.5"/>
  <circle class="mark" cx="140" cy="100" r="5"/><text class="mark-t" x="150" y="96">G</text>
  <line class="guide" x1="140" y1="100" x2="140" y2="200"/><line class="guide" x1="140" y1="100" x2="200" y2="200"/>
  <text class="tick" x="170" y="215" text-anchor="middle">b/2</text><text class="tick" x="132" y="155" text-anchor="end">h</text>
  <circle cx="200" cy="200" r="4" fill="var(--tb-accent)"/><text class="tick" x="208" y="196">支点</text>
  <text class="lbl" x="140" y="28" text-anchor="middle">tan θ = (b/2) / h</text>
  <g>
    <animateTransform attributeName="transform" type="rotate" values="0 460 200;-20.6 460 200;-20.6 460 200;0 460 200" keyTimes="0;0.4;0.7;1" dur="5s" repeatCount="indefinite"/>
    <rect x="340" y="40" width="120" height="160" fill="var(--tb-surface-2)" stroke="currentColor" stroke-width="1.5"/>
    <circle class="mark" cx="400" cy="100" r="5"/>
    <line x1="400" y1="100" x2="460" y2="200" stroke="var(--tb-bad)" stroke-width="1.5"/>
  </g>
  <line class="axis" x1="300" y1="200" x2="500" y2="200"/>
  <text class="lbl" x="400" y="225" text-anchor="middle">θ まで傾くと重心が支点の真上に来る</text>
</svg>
<p class="tb-caption">図: 転倒角 θ。重心 G の高さ h と、重心から支点までの水平距離 b/2 で決まる。右は θ まで傾けた状態 (ここが倒れる境目)</p>
<div class="tb-formula">転倒角 θ = tan⁻¹ ( (b/2) / h )　　横から押して倒れる力 F = W × (b/2) / h_F</div>
<p>例: 質量 200 kg、重心高さ h = 800 mm、重心から底面の縁までの水平距離 b/2 = 300 mm なら θ = tan⁻¹(300/800) ≈ <b>20.6°</b>。重心の高さで横に F をかけると、F = 1,962 × 300 / 800 ≈ <b>736 N</b> で倒れ始めます。重い部品を下に置いて重心を下げる、脚の間隔を広げる、床に固定する (アンカー) で対策します。</p>
<div class="tb-note">移動中の台車は加速・減速・段差・傾斜で横力を受けます。必要な転倒角は製品の規格で決まっていることが多いので確認してください (例: 機器の傾斜安定性試験の角度)。</div>
<h2>配線・配管ルート</h2>
<ul>
  <li>ケーブル・ホースは<b>レイアウトの段階で通り道を確保</b>する (後から通そうとすると穴も空間もない)</li>
  <li>動く部分にはケーブルベア (ケーブルキャリア) を使い、<b>最小曲げ半径</b>とストロークを確認する</li>
  <li>動力線と信号線は離す (ノイズ対策)。水・油の配管は電気部品の上を通さない</li>
  <li>コネクタの抜き差しに必要な空間、束ねたときの太さ (余裕を見る) を考える</li>
</ul>
<h2>3D での干渉確認</h2>
<p>レイアウトを 3D アセンブリで作り、<b>静止状態だけでなく動く範囲全体</b>で干渉を確認します。可動部は拘束を駆動して端から端まで動かし、カバー・工具・手の入る空間も「部品」としてモデルに入れておくと見落としが減ります。</p>
<div class="tb-tip"><b>3DCAD Studio</b>: 主要部品を箱で置いたアセンブリに <b>iProperties</b> の質量を入れると、全体の<b>重心</b>が分かり転倒角を計算できます。可動部は<b>拘束を駆動</b>しながら<b>干渉解析</b>で動く範囲全体をチェックしましょう。</div>`,
    points: [
      "主要部品を箱で置き、重いもの・大きいものから配置する",
      "作業者の動線・保守空間・扉の開閉範囲を空間として確保する",
      "転倒角 θ = tan⁻¹((b/2)/h)。重心を下げ、支点までの距離を広げる",
      "配線・配管の通り道を最初に確保し、可動範囲全体で干渉を確認",
    ],
    exercises: [
      {
        q: "質量 200 kg、重心高さ 800 mm、重心から転倒側の脚の縁までの水平距離 300 mm の装置があります。(1) 転倒角、(2) 重心の高さで水平に押したとき倒れ始める力を求めてください。(3) 重心が 1,000 mm に上がると転倒角はどうなりますか。",
        a: "(1) θ = tan⁻¹(300/800) = tan⁻¹(0.375) ≈ <b>20.6°</b><br>(2) 支点まわりのモーメントのつり合い F × 800 = W × 300、W = 200 × 9.81 = 1,962 N より F = 1,962 × 300 / 800 ≈ <b>736 N</b><br>(3) θ = tan⁻¹(300/1000) ≈ <b>16.7°</b>。重心が上がると倒れやすくなります。",
      },
      {
        q: "質量 150 kg の台車で、重心高さ 600 mm、重心から車輪接地点までの水平距離 250 mm です。転倒角と、重心高さで横から押して倒れる力はいくらですか。",
        a: "θ = tan⁻¹(250/600) ≈ <b>22.6°</b>。F = 150 × 9.81 × 250 / 600 ≈ <b>613 N</b>。",
      },
    ],
    quiz: [
      { q: "レイアウト設計の最初の段階で部品を表すのに適したのは?", choices: ["詳細形状のモデル", "外形と質量を持つ箱", "図面"], answer: 1, explain: "配置が固まるまでは箱で十分です。細部を作り込むと配置変更のたびに手戻りが出ます。" },
      { q: "転倒しにくくする方法として誤っているのは?", choices: ["重い部品を下に置く", "脚の間隔を広げる", "重い部品を上に置く"], answer: 2, explain: "重心が高いほど転倒角は小さくなり、倒れやすくなります。" },
      { q: "干渉確認で特に見落としやすいのは?", choices: ["静止状態の部品同士", "可動部の動作範囲・扉の開閉・工具や手の空間", "部品の色"], answer: 1, explain: "動く範囲や人・工具の空間はモデルに入れないと確認できません。" },
    ],
    lessons: ["7-1", "7-2", "8-3"],
  },
  {
    id: "cost-down",
    part: "knowhow",
    title: "【中級】VE とコストダウンの設計",
    minutes: 20,
    level: 2,
    lead: "製品コストの大半は設計の段階で決まると言われます。VE (価値工学) は「必要な機能を、最も安く実現する」ための考え方です。品質を落とさずにコストを下げる設計の見直し方を学びます。",
    body: `
<h2>価値 = 機能 / コスト</h2>
<div class="tb-formula">V (価値) = F (機能) / C (コスト)</div>
<p>VE では部品を「物」ではなく「機能」として見て、その機能にいくら払っているかを考えます。価値を上げる方向は 4 つあります。</p>
<svg class="tb-chart" viewBox="0 0 520 220" role="img" aria-label="価値を上げる方向">
  <line class="axis" x1="80" y1="190" x2="480" y2="190"/><line class="axis" x1="80" y1="20" x2="80" y2="190"/>
  <text class="lbl" x="476" y="210" text-anchor="end">コスト C</text><text class="lbl" x="86" y="16">機能 F</text>
  <circle cx="300" cy="110" r="7" fill="var(--tb-text-3)"/><text class="tick" x="310" y="128">現状</text>
  <line x1="300" y1="110" x2="200" y2="110" stroke="var(--tb-good)" stroke-width="2.5"/><polygon points="200,110 210,105 210,115" fill="var(--tb-good)"/>
  <line x1="300" y1="110" x2="300" y2="50" stroke="var(--tb-good)" stroke-width="2.5"/><polygon points="300,50 295,60 305,60" fill="var(--tb-good)"/>
  <line x1="300" y1="110" x2="220" y2="55" stroke="var(--tb-good)" stroke-width="2.5"/><polygon points="220,55 225.5,64.9 231.2,56.6" fill="var(--tb-good)"/>
  <line x1="300" y1="110" x2="360" y2="40" stroke="var(--tb-accent)" stroke-width="2" stroke-dasharray="5 3"/><polygon points="360,40 349.5,44.4 357.1,50.9" fill="var(--tb-accent)"/>
  <text class="tick" x="195" y="104" text-anchor="end">① 同じ機能で安く</text>
  <text class="tick" x="306" y="46">② 同じコストで機能向上</text>
  <text class="tick" x="215" y="48" text-anchor="end">③ 安く + 機能向上</text>
  <text class="tick" x="366" y="34">④ 少し高く、大きく機能向上</text>
  <line x1="300" y1="110" x2="380" y2="150" stroke="var(--tb-bad)" stroke-width="2" stroke-dasharray="2 3"/>
  <text class="tick" x="386" y="160" style="fill:var(--tb-bad)">× 機能を削って安く (コスト削減ではなく品質低下)</text>
</svg>
<p class="tb-caption">図: 価値を上げる 4 つの方向 (緑・青)。必要な機能を削って安くするのは VE ではない</p>
<p>VE の手順は「対象を決める → 機能を定義する (動詞 + 名詞) → 機能ごとのコストを出す → 価値の低い機能 (払いすぎ) を見つける → 代替案を出す → 評価して提案」です。</p>
<h2>部品統合</h2>
<p>部品を 1 つ減らすと、部品代だけでなく<b>図面・発注・在庫・検査・組立工数</b>が減ります。動かない・同じ材料でよい・分解の必要がない隣同士の部品は統合の候補です (DFA の 3 つの質問)。板金の溶接構造を 1 枚の曲げ板金に、複数の切削部品を 1 つの成形品やダイカストに、ねじ止めをスナップフィットに置き換えます。</p>
<h2>材料・加工・公差・表面処理の見直し</h2>
<table class="tb-table">
  <tr><th>見直す所</th><th>問い</th><th>よくある対策</th></tr>
  <tr><td>材料</td><td>その強度・特性は本当に必要か</td><td>SUS → SS400 + めっき、特殊サイズ → 定尺材、削り出し → 板金</td></tr>
  <tr><td>加工</td><td>工程・段取りを減らせないか</td><td>加工面を 1 方向に、穴径・R の統一、溶接 → 曲げ</td></tr>
  <tr><td>公差</td><td>機能に効く寸法だけ厳しいか</td><td>普通公差へ、調整機構で吸収</td></tr>
  <tr><td>表面</td><td>粗さ・処理は全面に必要か</td><td>はめあい面だけ細かく、処理の種類を統一</td></tr>
  <tr><td>購入品</td><td>標準品・推奨品を使っているか</td><td>特注品 → カタログ品、メーカー・型式の統一</td></tr>
  <tr><td>数量</td><td>まとめて作れないか</td><td>共通化でロットを大きく (段取り費の分散)</td></tr>
</table>
<svg class="tb-chart" viewBox="0 0 520 200" role="img" aria-label="コストダウン前後の内訳 (例)">
  <line class="axis" x1="60" y1="170" x2="460" y2="170"/>
  <rect x="130" y="50" width="80" height="40" fill="var(--tb-text-3)" opacity="0.6"/><rect x="130" y="90" width="80" height="48" fill="var(--tb-accent)" opacity="0.7"/><rect x="130" y="138" width="80" height="32" fill="var(--tb-warn)" opacity="0.7"/>
  <text class="tick" x="170" y="74" text-anchor="middle">材料 300</text><text class="tick" x="170" y="118" text-anchor="middle">加工 600</text><text class="tick" x="170" y="158" text-anchor="middle">組立 300</text>
  <text class="lbl" x="170" y="40" text-anchor="middle">前: 1,200 円 (4 部品)</text>
  <rect x="310" y="104" width="80" height="20" fill="var(--tb-text-3)" opacity="0.6"/><rect x="310" y="124" width="80" height="34" fill="var(--tb-accent)" opacity="0.7"/><rect x="310" y="158" width="80" height="12" fill="var(--tb-warn)" opacity="0.7"/>
  <text class="tick" x="400" y="118">材料 150</text><text class="tick" x="400" y="145">加工 400</text><text class="tick" x="400" y="168">組立 100</text>
  <text class="lbl" x="350" y="94" text-anchor="middle" style="fill:var(--tb-good)">後: 650 円 (1 部品)</text>
  <text class="tick" x="260" y="192" text-anchor="middle">高さはコストに比例 (数値は例、円/台)</text>
</svg>
<p class="tb-caption">図: 4 部品の溶接ブラケットを 1 枚の曲げ板金に統合した例。組立費の減少が大きい</p>
<h2>事例</h2>
<table class="tb-table">
  <tr><th>事例</th><th>前</th><th>後</th><th>効果 (例)</th></tr>
  <tr><td>ブラケット</td><td>切削 3 部品 + ボルト 4 本</td><td>曲げ板金 1 部品</td><td>部品代・組立時間 約半分</td></tr>
  <tr><td>カバー</td><td>SUS304 ヘアライン</td><td>SPCC 粉体塗装 (屋内用)</td><td>材料・加工費の削減</td></tr>
  <tr><td>軸</td><td>全長 h6 研削</td><td>軸受部のみ h6、他は普通公差</td><td>研削時間の削減</td></tr>
  <tr><td>締結</td><td>M3〜M10 の 12 種</td><td>M4・M6・M8 の 3 種</td><td>工具・在庫・取り違えの削減</td></tr>
</table>
<p class="tb-note">効果の大きさは製品・数量・取引先によって変わります。表は考え方の例です。</p>
<h2>品質とのバランス</h2>
<ul>
  <li><b>機能・安全・寿命に効く所は削らない</b>: 疲労がかかる R、防錆が必要な処理、安全装置</li>
  <li>材料・工法を変えたら<b>再評価</b> (強度計算・試験) を行い、変更記録に残す</li>
  <li>部品代だけでなく<b>総コスト</b> (型費・不良・保守・在庫) で比べる。安い部品で故障が増えれば高くつく</li>
  <li>初期投資 (型費) がある案は回収できる数量かを確認する (損益分岐)</li>
</ul>
<div class="tb-tip"><b>3DCAD Studio</b>: <b>部品表</b>で部品点数・ねじの種類を数え、<b>iProperties</b> の質量で材料費を見積もりましょう。<b>板金</b>の展開で、溶接構造を曲げ 1 枚に置き換えられるか確かめられます。</div>`,
    points: [
      "V = F / C。必要な機能を保ったままコストを下げる",
      "部品統合は部品代だけでなく図面・在庫・組立を減らす",
      "材料・加工・公差・表面処理・購入品を機能から見直す",
      "変更したら再評価し、総コストと品質で判断する",
    ],
    exercises: [
      {
        q: "1 台あたり 1,500 円 (部品 1,200 円 + 組立 300 円) のブラケット組品を、型費 200 万円の 1 部品 (900 円/台、組立込み) に置き換える案があります。年 10,000 台生産するとき、(1) 価値は何倍になるか (機能は同じ)、(2) 年間の削減額、(3) 型費を回収できる台数と期間を求めてください。",
        a: "(1) 機能 F が同じなので V は C に反比例: 1,500 / 900 ≈ <b>1.67 倍</b><br>(2) (1,500 − 900) × 10,000 = <b>600 万円/年</b><br>(3) 2,000,000 / 600 ≈ <b>3,334 台</b>。月 10,000 / 12 ≈ 833 台なので約 <b>4 か月</b>で回収できます。",
      },
    ],
    quiz: [
      { q: "VE の価値の式は?", choices: ["V = C / F", "V = F / C", "V = F × C"], answer: 1, explain: "価値は機能をコストで割ったものです。" },
      { q: "VE として適切でないのは?", choices: ["同じ機能をより安い工法で実現する", "必要な防錆処理をやめて安くする", "部品を統合して組立を減らす"], answer: 1, explain: "必要な機能 (防錆) を削るのは品質低下であり、VE ではありません。" },
      { q: "材料を変更した後に必ず行うべきことは?", choices: ["強度・寿命の再評価と変更記録", "図面の色を変える", "何もしない"], answer: 0, explain: "材料が変われば強度・腐食・熱などの特性が変わるため、再評価して記録します。" },
    ],
    lessons: ["9-3", "9-6"],
  },
  {
    id: "jigs-fixtures",
    part: "knowhow",
    title: "【中級】治具と組立を助ける設計",
    minutes: 20,
    level: 2,
    lead: "治具 (ジグ) は、加工や組立で部品を正しい位置に置き、動かないように押さえる道具です。治具の基本である位置決めの原則を知ると、治具そのものの設計だけでなく、組み立てやすい部品の設計にも役立ちます。",
    body: `
<h2>位置決めの原則 (3-2-1)</h2>
<p>空間に置かれた物体には 6 つの自由度 (X・Y・Z 方向の移動と、各軸まわりの回転) があります。これを<b>必要最小限の 6 点</b>で押さえるのが 3-2-1 の原則です。</p>
<svg class="tb-chart" viewBox="0 0 520 220" role="img" aria-label="3-2-1 の位置決め">
  <polygon points="100,90 160,50 320,50 260,90" fill="var(--tb-surface-2)" stroke="currentColor" stroke-width="1.5"/>
  <polygon points="260,90 320,50 320,130 260,170" fill="var(--tb-surface-2)" stroke="currentColor" stroke-width="1.5"/>
  <rect x="100" y="90" width="160" height="80" fill="var(--tb-surface-2)" stroke="currentColor" stroke-width="1.5"/>
  <polygon points="130,182 124,194 136,194" fill="var(--tb-accent)"/><polygon points="230,182 224,194 236,194" fill="var(--tb-accent)"/><polygon points="295,160 289,172 301,172" fill="var(--tb-accent)"/>
  <circle cx="140" cy="130" r="6" fill="var(--tb-good)"/><circle cx="220" cy="130" r="6" fill="var(--tb-good)"/>
  <circle cx="290" cy="110" r="6" fill="var(--tb-warn)"/>
  <text class="lbl" x="360" y="70" style="fill:var(--tb-accent)">▲ 底面 3 点: Z 移動と 2 つの傾きを止める</text>
  <text class="lbl" x="360" y="100" style="fill:var(--tb-good)">● 側面 2 点: Y 移動と Z 軸回転</text>
  <text class="lbl" x="360" y="130" style="fill:var(--tb-warn)">● 端面 1 点: X 移動</text>
  <text class="tick" x="360" y="160">3 + 2 + 1 = 6 自由度</text>
  <text class="tick" x="210" y="212" text-anchor="middle">押さえ (クランプ) は基準点に押し付ける向きに</text>
</svg>
<p class="tb-caption">図: 3-2-1 の原則。広い面に 3 点、長い側面に 2 点、端面に 1 点。点はできるだけ離して置くと姿勢が安定する</p>
<ul>
  <li><b>点を多くしすぎない</b>: 4 点で底面を受けると、部品のそりで 1 点が浮き、がたつく (過拘束)</li>
  <li>3 点はできるだけ<b>広い三角形</b>に、2 点はできるだけ離す</li>
  <li>位置決めする面は図面の<b>データム (基準面)</b> と一致させる。加工・組立・測定の基準をそろえると誤差が小さい</li>
</ul>
<h2>ピンと穴、丸ピンと長穴</h2>
<p>板状の部品は、底面で 3 自由度を止めたあと、<b>2 本のピン</b>で残り 3 自由度 (X・Y・回転) を決めるのが定番です。</p>
<svg class="tb-chart" viewBox="0 0 520 200" role="img" aria-label="丸穴と長穴による位置決め">
  <rect x="60" y="40" width="400" height="110" fill="var(--tb-surface-2)" stroke="currentColor" stroke-width="1.5"/>
  <circle cx="120" cy="95" r="12" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="120" cy="95" r="9" fill="var(--tb-accent)"/>
  <rect x="380" y="83" width="44" height="24" rx="12" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="402" cy="95" r="9" fill="var(--tb-accent)"/>
  <line class="guide" x1="120" y1="95" x2="402" y2="95"/>
  <text class="lbl" x="120" y="132" text-anchor="middle">丸穴: X・Y を決める</text>
  <text class="lbl" x="402" y="132" text-anchor="middle">長穴: 回転だけ止める</text>
  <text class="tick" x="260" y="88" text-anchor="middle">ピン間距離 L</text>
  <text class="tick" x="260" y="180" text-anchor="middle">長穴は 2 本のピンを結ぶ線の方向に長くする (ピン間距離の誤差を逃がす)</text>
</svg>
<p class="tb-caption">図: 1 本目は丸穴で位置を、2 本目は長穴 (またはひし形ピン) で回転だけを決める。両方を丸穴にするとピン間距離の誤差で入らなくなる</p>
<ul>
  <li>2 本とも丸穴だと、穴ピッチとピンピッチの誤差を吸収できず<b>はまらない</b> (過拘束)</li>
  <li>2 本目は<b>長穴</b>か<b>ひし形ピン</b> (削りピン) にする</li>
  <li>位置決めピンとすき間ばめの組合せ例: 穴 H7 / ピン g6 または h6。すき間の半分程度が位置ずれになる</li>
  <li>ピンの先端には面取り・テーパを付け、入れやすくする。ピンの長さは 2 本で変えると 1 本ずつ入れられる</li>
</ul>
<h2>クランプ (押さえ)</h2>
<ul>
  <li><b>基準点に押し付ける向き</b>に押さえる。基準から離す向きに押すと位置がずれる</li>
  <li>押さえる位置は受け (支持点) の真上。受けのない所を押すと部品がたわむ</li>
  <li>加工力・組立力の向きは<b>受け側</b>で受け、クランプには大きな力を持たせない</li>
  <li>トグルクランプ・ねじクランプ・空圧クランプなど標準品を使い、作業者が片手で操作できるように</li>
</ul>
<h2>治具の基本形</h2>
<table class="tb-table">
  <tr><th>種類</th><th>用途</th><th>設計のポイント</th></tr>
  <tr><td>加工治具 (フィクスチャ)</td><td>マシニングでの固定</td><td>段取り回数を減らす、切りくずが溜まらない、工具と干渉しない</td></tr>
  <tr><td>穴あけ治具 (ドリルジグ)</td><td>ブッシュでドリルを案内</td><td>ブッシュ位置の精度、切りくずの逃げ</td></tr>
  <tr><td>溶接治具</td><td>部材を所定の位置で保持</td><td>熱ひずみの逃げ、溶接トーチが届く、取り外せる</td></tr>
  <tr><td>組立治具</td><td>部品の仮置き・位置合わせ</td><td>入れる順に置ける、誤った向きでは置けない (ポカヨケ)</td></tr>
  <tr><td>検査治具 (ゲージ)</td><td>合否を素早く判定</td><td>通り・止まりで判定、測定の基準を図面のデータムに一致</td></tr>
</table>
<h2>組立の基準面を部品に持たせる</h2>
<p>治具がなくても正しく組めるように、部品自体に<b>位置決め形状</b>を設けるのが理想です。段 (インロー)、位置決めピン、突き当て面、ノックピン穴などを図面のデータムと一致させておくと、組立の再現性が上がり、調整作業が要らなくなります。</p>
<div class="tb-tip"><b>3DCAD Studio</b>: <b>アセンブリ</b>の<b>自由度</b>表示で、拘束によって何自由度が止まっているかを確認できます。位置決めピンを<b>標準部品</b>から配置し、<b>干渉解析</b>で長穴の向きと余裕をチェックしましょう。</div>`,
    points: [
      "3-2-1 の原則: 底面 3 点・側面 2 点・端面 1 点で 6 自由度を止める",
      "2 本ピンは丸穴 + 長穴 (またはひし形ピン) で過拘束を避ける",
      "クランプは基準点に押し付ける向きに、受けの真上で",
      "位置決め面を図面のデータムと一致させ、部品自体に基準を持たせる",
    ],
    exercises: [
      {
        q: "穴 φ6 H7 (+0.012 / 0) に位置決めピン φ6 g6 (−0.004 / −0.012) を使います。ピン間距離 100 mm の丸穴 + 長穴 (長穴の幅方向も同じはめあい) で位置決めするとき、(1) 最大すき間、(2) 回転方向の最大の傾き (概算) を求めてください。",
        a: "(1) 最大すき間 = 穴の最大 − ピンの最小 = 6.012 − 5.988 = <b>0.024 mm</b><br>(2) 各ピンは中心から最大 ±0.012 mm ずれる。両端が逆向きにずれたとき傾きは (0.012 + 0.012) / 100 = 0.00024 rad ≈ <b>0.014°</b>。部品の端 (例えば 200 mm 先) では 0.00024 × 200 ≈ 0.05 mm のずれになります。",
      },
    ],
    quiz: [
      { q: "3-2-1 の原則で止める自由度の数は?", choices: ["3", "5", "6"], answer: 2, explain: "3 + 2 + 1 = 6 点で、移動 3・回転 3 の 6 自由度を止めます。" },
      { q: "2 本の位置決めピンを両方とも丸穴にすると何が起きやすい?", choices: ["回転が止まらない", "ピッチ誤差を吸収できず入らない", "位置精度が上がる"], answer: 1, explain: "過拘束になります。2 本目は長穴やひし形ピンにします。" },
      { q: "クランプで押す向きとして正しいのは?", choices: ["基準点に押し付ける向き", "基準点から離す向き", "どちらでもよい"], answer: 0, explain: "基準に押し付けて初めて位置が決まります。" },
    ],
    lessons: ["7-1", "7-2", "4-1"],
  },
  {
    id: "design-change",
    part: "knowhow",
    title: "【上級】設計変更と影響範囲",
    minutes: 20,
    level: 3,
    lead: "量産が始まった製品の設計変更は、図面を直すだけでは終わりません。その部品を使う製品、在庫、金型、保守部品、取扱説明書まで影響が広がります。影響範囲の調べ方と、部品番号を変える・変えないの判断、変更管理の流れを学びます。",
    body: `
<h2>設計変更の種類</h2>
<table class="tb-table">
  <tr><th>種類</th><th>例</th><th>特徴</th></tr>
  <tr><td>不具合対策</td><td>破損・誤組・性能不足への対策</td><td>緊急度が高い。市場品への処置 (回収・交換) も判断</td></tr>
  <tr><td>コストダウン (VE)</td><td>材料・工法の変更、部品統合</td><td>品質を落とさないことの確認が必要</td></tr>
  <tr><td>調達・製造上の理由</td><td>部品の生産中止、取引先変更、工程変更</td><td>代替品の互換性評価が中心</td></tr>
  <tr><td>仕様変更・改良</td><td>顧客要求、法規改正、機能追加</td><td>新機種・派生機種として扱うかも判断</td></tr>
  <tr><td>図面の訂正</td><td>寸法の誤記、注記漏れ</td><td>実物は変わらないことが多いが、記録は必要</td></tr>
</table>
<h2>影響調査 — どこまで波及するか</h2>
<svg class="tb-chart" viewBox="0 0 520 230" role="img" aria-label="設計変更の影響範囲">
  <rect x="200" y="96" width="120" height="40" rx="6" fill="var(--tb-surface-2)" stroke="var(--tb-bad)" stroke-width="2"/>
  <text class="mark-t" x="260" y="121" text-anchor="middle">変更する部品</text>
  <g stroke="var(--tb-text-3)" stroke-dasharray="4 3">
    <line x1="200" y1="105" x2="120" y2="40"/><line x1="320" y1="105" x2="400" y2="40"/>
    <line x1="200" y1="116" x2="110" y2="116"/><line x1="320" y1="116" x2="410" y2="116"/>
    <line x1="200" y1="128" x2="120" y2="192"/><line x1="320" y1="128" x2="400" y2="192"/>
  </g>
  <rect x="30" y="22" width="170" height="34" rx="6" fill="var(--tb-surface-2)" stroke="var(--tb-accent)"/><text class="lbl" x="115" y="44" text-anchor="middle">使われ先 (他機種・組品)</text>
  <rect x="330" y="22" width="170" height="34" rx="6" fill="var(--tb-surface-2)" stroke="var(--tb-accent)"/><text class="lbl" x="415" y="44" text-anchor="middle">在庫・発注残・仕掛品</text>
  <rect x="10" y="99" width="100" height="34" rx="6" fill="var(--tb-surface-2)" stroke="var(--tb-accent)"/><text class="lbl" x="60" y="121" text-anchor="middle">金型・治具</text>
  <rect x="410" y="99" width="100" height="34" rx="6" fill="var(--tb-surface-2)" stroke="var(--tb-accent)"/><text class="lbl" x="460" y="121" text-anchor="middle">図面・部品表</text>
  <rect x="30" y="176" width="170" height="34" rx="6" fill="var(--tb-surface-2)" stroke="var(--tb-accent)"/><text class="lbl" x="115" y="198" text-anchor="middle">保守部品・市場品</text>
  <rect x="330" y="176" width="170" height="34" rx="6" fill="var(--tb-surface-2)" stroke="var(--tb-accent)"/><text class="lbl" x="415" y="198" text-anchor="middle">検査・認証・説明書</text>
  <circle cx="260" cy="116" r="70" fill="none" stroke="var(--tb-bad)" stroke-width="1" opacity="0.6">
    <animate attributeName="r" values="62;118;62" dur="4s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0.6;0;0.6" dur="4s" repeatCount="indefinite"/>
  </circle>
</svg>
<p class="tb-caption">図: 1 つの部品の変更は、使われ先・在庫・型・図面・保守・認証へと波紋のように広がる。変更前にすべての方向を調べる</p>
<table class="tb-table">
  <tr><th>調査項目</th><th>確認すること</th></tr>
  <tr><td>使われ先 (逆展開)</td><td>部品表を逆にたどり、その部品を使うすべての組品・機種を洗い出す。共通部品ほど影響が大きい</td></tr>
  <tr><td>在庫・発注残</td><td>旧品の在庫・仕掛品・発注済み数量。使い切るか、改造するか、廃棄するか</td></tr>
  <tr><td>型・治具・検査具</td><td>金型の修正・新作の費用と期間、治具・ゲージ・NC プログラムの変更</td></tr>
  <tr><td>図面・文書</td><td>部品図・組立図・部品表・計算書・検査基準・作業手順書</td></tr>
  <tr><td>相手部品・インターフェース</td><td>取付穴・寸法・電気的接続の変化で相手部品も変更が必要か</td></tr>
  <tr><td>保守・市場</td><td>修理用部品として旧品と置き換えられるか。市場品への対策の要否</td></tr>
  <tr><td>認証・法規</td><td>安全規格の認証品、材料の規制 (RoHS など) に影響しないか</td></tr>
</table>
<h2>互換性 — 部品番号を変える・変えない</h2>
<p>判断の基本は<b>「新旧の部品を区別せずに使ってよいか」</b>です。どの使われ先でも、新品と旧品を入れ替えて組めて、機能・品質・寿命が同等なら<b>互換</b>です。</p>
<svg class="tb-chart" viewBox="0 0 520 230" role="img" aria-label="部品番号の判断">
  <rect x="160" y="14" width="200" height="36" rx="6" fill="var(--tb-surface-2)" stroke="var(--tb-accent)" stroke-width="1.5"/>
  <text class="lbl" x="260" y="37" text-anchor="middle">旧品 → 新品に置き換えられる?</text>
  <rect x="160" y="88" width="200" height="36" rx="6" fill="var(--tb-surface-2)" stroke="var(--tb-accent)" stroke-width="1.5"/>
  <text class="lbl" x="260" y="111" text-anchor="middle">新品 → 旧品に戻しても使える?</text>
  <line x1="260" y1="50" x2="260" y2="88" stroke="var(--tb-good)" stroke-width="2"/><text class="tick" x="266" y="74">はい</text>
  <line x1="360" y1="32" x2="420" y2="32" stroke="var(--tb-bad)" stroke-width="2"/><line x1="420" y1="32" x2="420" y2="160" stroke="var(--tb-bad)" stroke-width="2"/><text class="tick" x="388" y="26">いいえ</text>
  <line x1="260" y1="124" x2="260" y2="160" stroke="var(--tb-good)" stroke-width="2"/><text class="tick" x="266" y="146">はい</text>
  <line x1="160" y1="106" x2="90" y2="106" stroke="var(--tb-warn)" stroke-width="2"/><line x1="90" y1="106" x2="90" y2="160" stroke="var(--tb-warn)" stroke-width="2"/><text class="tick" x="100" y="100">いいえ</text>
  <rect x="190" y="160" width="140" height="54" rx="6" fill="var(--tb-good)" opacity="0.18" stroke="var(--tb-good)"/>
  <text class="lbl" x="260" y="182" text-anchor="middle">完全互換</text><text class="tick" x="260" y="202" text-anchor="middle">番号そのまま、版 (Rev) を上げる</text>
  <rect x="20" y="160" width="140" height="54" rx="6" fill="var(--tb-warn)" opacity="0.18" stroke="var(--tb-warn)"/>
  <text class="lbl" x="90" y="182" text-anchor="middle">片互換</text><text class="tick" x="90" y="202" text-anchor="middle">新番号 (旧品の代替可と明記)</text>
  <rect x="360" y="160" width="140" height="54" rx="6" fill="var(--tb-bad)" opacity="0.15" stroke="var(--tb-bad)"/>
  <text class="lbl" x="430" y="182" text-anchor="middle">非互換</text><text class="tick" x="430" y="202" text-anchor="middle">新番号、使われ先も変更</text>
</svg>
<p class="tb-caption">図: 部品番号の判断の例。新旧の入れ替えが両方向に成り立つなら版の変更だけ、片方向なら新番号 + 代替関係の登録、成り立たなければ新番号</p>
<ul>
  <li><b>番号を変えない (版を上げる)</b>: 寸法・材料が変わっても、取付・機能・寿命が同等で新旧を混ぜてよい場合。例: 図面の誤記訂正、同等材料への変更</li>
  <li><b>番号を変える</b>: 取付寸法が変わる、性能が変わる、新旧を混ぜると問題が出る、保守で区別が必要な場合</li>
  <li>迷ったら番号を変えるほうが安全。同じ番号で中身の違う部品が混在すると、修理や不具合調査で追跡できなくなる</li>
  <li>判断基準は会社の規定で決まっていることが多い。自分で決めず規定に従う</li>
</ul>
<h2>変更管理の流れ</h2>
<ol class="tb-flow">
  <li>変更依頼 (理由・内容・緊急度)</li>
  <li>影響調査 (使われ先・在庫・型・文書・費用)</li>
  <li>審査・承認 (設計・製造・品質・調達)</li>
  <li>図面・部品表の改訂 (版・改訂履歴)</li>
  <li>関係部門への通知 (切替時期・在庫処置)</li>
  <li>切替と初品確認</li>
  <li>効果の確認・記録の保管</li>
</ol>
<div class="tb-note">切替時期は「旧品在庫がなくなり次第」「製造番号 ○○ から」「日付指定」などで明確にし、どの製品にどちらが入っているかを追跡できるようにします。</div>
<div class="tb-tip"><b>3DCAD Studio</b>: <b>改訂履歴</b>に変更の理由と内容を残し、アセンブリの<b>部品表</b>で使われ先を確認しましょう。<b>ファミリー表</b>で管理している部品は、1 つの寸法変更が全サイズに波及しないかも確認します。</div>`,
    points: [
      "設計変更は使われ先・在庫・型・図面・保守・認証まで波及する",
      "部品表の逆展開で使われ先をすべて洗い出す",
      "新旧を入れ替えて使えるかで部品番号を変える・変えないを判断する",
      "依頼 → 影響調査 → 承認 → 改訂 → 通知 → 切替 → 確認の流れで管理",
    ],
    exercises: [
      {
        q: "共通部品のブラケットの板厚を 2.0 → 2.3 mm に変更します (強度不足の対策)。取付穴の位置は同じですが、ブラケットに当たる相手部品とのすき間が 0.3 mm 減ります。旧品の在庫 300 個、月の使用量 100 個です。部品番号と切替をどう判断しますか。",
        a: "<b>考え方</b>: (1) 新品は旧品と取付が同じでも、すき間が 0.3 mm 減るので、すべての使われ先で干渉しないかを逆展開で確認します。(2) 強度不足対策なので旧品 → 新品は置き換え可、新品 → 旧品 (強度不足品に戻す) は不可で<b>片互換</b>。新番号を付け、旧品の代替として新品を使えることを登録するのが安全です。(3) 旧品の在庫 300 個は 300 / 100 = <b>3 か月分</b>ですが、強度不足の対策なので使い切りは不適切な場合があります。不具合の重大度で、即時切替 (旧品は廃棄・改造) か、使用条件の軽い機種で使い切るかを審査で決めます。",
      },
    ],
    quiz: [
      { q: "その部品を使うすべての製品を洗い出す作業は?", choices: ["正展開", "部品表の逆展開 (使われ先調査)", "分解図の作成"], answer: 1, explain: "部品表を逆にたどり、使われ先をすべて洗い出します。" },
      { q: "部品番号をそのままにして版だけ上げてよいのは?", choices: ["取付寸法が変わる", "新旧を混ぜて使っても機能・品質が同等", "性能が向上し旧品に戻せない"], answer: 1, explain: "新旧の完全な入れ替えが可能な場合だけ、番号を変えずに版を上げます。" },
      { q: "切替時期を明確にする主な目的は?", choices: ["図面を減らす", "どの製品にどちらの部品が入っているか追跡できるようにする", "在庫を増やす"], answer: 1, explain: "不具合調査や修理のとき、どの製品が新旧どちらかを追跡できる必要があります。" },
    ],
    lessons: ["9-2", "9-6"],
  },
  {
    id: "review-checklist",
    part: "knowhow",
    title: "【上級】総合設計チェックリスト",
    minutes: 25,
    level: 3,
    lead: "設計の見落としは、知識不足よりも「確認し忘れ」から生まれることが多いものです。機能から図面まで、観点別のチェック項目をひとまとめにし、レビューの段階ごとにどう使うかをまとめます。",
    body: `
<h2>観点の全体像</h2>
<svg class="tb-chart" viewBox="0 0 520 260" role="img" aria-label="設計チェックの 12 観点">
  <circle cx="260" cy="130" r="48" fill="var(--tb-surface-2)" stroke="var(--tb-accent)" stroke-width="2"/>
  <text class="mark-t" x="260" y="126" text-anchor="middle">設計</text><text class="tick" x="260" y="143" text-anchor="middle">12 の観点</text>
  <g stroke="var(--tb-text-3)" stroke-dasharray="3 3">
    <line x1="260" y1="82" x2="260" y2="40"/><line x1="284" y1="88" x2="320" y2="52"/><line x1="302" y1="106" x2="370" y2="80"/><line x1="308" y1="130" x2="380" y2="130"/><line x1="302" y1="154" x2="370" y2="180"/><line x1="284" y1="172" x2="320" y2="208"/>
    <line x1="260" y1="178" x2="260" y2="220"/><line x1="236" y1="172" x2="200" y2="208"/><line x1="218" y1="154" x2="150" y2="180"/><line x1="212" y1="130" x2="140" y2="130"/><line x1="218" y1="106" x2="150" y2="80"/><line x1="236" y1="88" x2="200" y2="52"/>
  </g>
  <text class="lbl" x="260" y="32" text-anchor="middle">機能</text>
  <text class="lbl" x="326" y="48" text-anchor="start">強度</text>
  <text class="lbl" x="376" y="78" text-anchor="start">剛性</text>
  <text class="lbl" x="386" y="134" text-anchor="start">熱</text>
  <text class="lbl" x="376" y="190" text-anchor="start">振動</text>
  <text class="lbl" x="326" y="222" text-anchor="start">製造</text>
  <text class="lbl" x="260" y="238" text-anchor="middle">組立</text>
  <text class="lbl" x="194" y="222" text-anchor="end">保守</text>
  <text class="lbl" x="144" y="190" text-anchor="end">安全</text>
  <text class="lbl" x="134" y="134" text-anchor="end">環境</text>
  <text class="lbl" x="144" y="78" text-anchor="end">コスト</text>
  <text class="lbl" x="194" y="48" text-anchor="end">図面</text>
</svg>
<p class="tb-caption">図: 設計チェックの 12 の観点。ひとつの観点だけ深く見るのではなく、全周を一通り確認する</p>
<h2>観点別チェック項目</h2>
<table class="tb-table">
  <tr><th>観点</th><th>チェック項目</th></tr>
  <tr><td>機能</td><td>仕様のすべての項目に対応する設計・計算・試験があるか / 動作範囲の全域で干渉しないか / 最悪の公差の組合せでも組めて動くか / 起動・停止・停電・非常停止時のふるまい</td></tr>
  <tr><td>強度</td><td>最大荷重・衝撃・起動時トルクを想定したか / 繰返し荷重は疲労で評価したか / 応力集中部 (段・穴・溝) に R があるか / 安全率の根拠 / ねじ・溶接・接着部の強度</td></tr>
  <tr><td>剛性</td><td>たわみ・ねじれが精度要求の範囲内か / 片持ちの長さ / 締結部・軸受部の剛性 / 薄板のへこみ・座屈</td></tr>
  <tr><td>熱</td><td>使用・保管温度範囲 / 異種材料の熱膨張差と拘束 / 発熱部品の放熱経路 / 熱に弱い部品 (樹脂・電子部品・潤滑剤) との距離</td></tr>
  <tr><td>振動</td><td>固有振動数と加振周波数 (回転数・極数・歯数) が離れているか / ねじの緩み止め / 輸送振動 / 騒音</td></tr>
  <tr><td>製造</td><td>工具が届く・つかめる形か / 入隅 R・穴深さ・板金の曲げルール・抜き勾配 / 素材は規格品か / 公差・粗さは必要な所だけか / 熱処理・表面処理の寸法変化</td></tr>
  <tr><td>組立</td><td>組立順序が成り立つか / 一方向から組めるか / 工具・手の入る空間 / 位置決め形状と面取りガイド / 誤組防止 (ポカヨケ) / ねじの種類の統一</td></tr>
  <tr><td>保守</td><td>消耗部品の交換性 (手前・短時間) / 点検・給油・調整の位置 / 分解できるか (接着・カシメの多用) / 保守部品の入手性</td></tr>
  <tr><td>安全</td><td>挟まれ・巻き込まれ・鋭い角 / 回転部・高温部のカバー / 電気安全 (絶縁・接地) / 転倒・落下 / 誤使用 / リスクアセスメントの記録</td></tr>
  <tr><td>環境</td><td>湿度・水・粉じん・薬品・紫外線 / 腐食と電食 (異種金属の接触) / 規制物質 (RoHS など) / 分別・リサイクルのしやすさ</td></tr>
  <tr><td>コスト</td><td>目標原価との差 / 部品点数・加工工程 / 標準部品・共通部品の活用 / 型費の回収数量 / 総コスト (保守・不良を含む)</td></tr>
  <tr><td>図面</td><td>寸法の漏れ・重複・基準の一貫性 / 公差・幾何公差・データム / 材料・熱処理・表面処理・注記 / 部品表との一致 / 版と改訂履歴</td></tr>
</table>
<h2>レビューの段階ごとの使い方</h2>
<p>すべての項目を毎回同じ深さで見る必要はありません。設計の段階に合わせて<b>重点を変えます</b>。</p>
<svg class="tb-chart" viewBox="0 0 520 220" role="img" aria-label="段階ごとのチェックの重点">
  <text class="lbl" x="150" y="30" text-anchor="middle">構想 DR</text><text class="lbl" x="260" y="30" text-anchor="middle">詳細 DR</text><text class="lbl" x="370" y="30" text-anchor="middle">出図前</text><text class="lbl" x="470" y="30" text-anchor="middle">試作後</text>
  <text class="tick" x="80" y="62" text-anchor="end">機能・安全</text><text class="tick" x="80" y="97" text-anchor="end">強度・熱・振動</text><text class="tick" x="80" y="132" text-anchor="end">製造・組立・保守</text><text class="tick" x="80" y="167" text-anchor="end">図面・コスト</text>
  <circle cx="150" cy="58" r="12" fill="var(--tb-accent)"/><circle cx="260" cy="58" r="8" fill="var(--tb-accent)" opacity="0.6"/><circle cx="370" cy="58" r="5" fill="var(--tb-accent)" opacity="0.4"/><circle cx="470" cy="58" r="12" fill="var(--tb-accent)"/>
  <circle cx="150" cy="93" r="8" fill="var(--tb-accent)" opacity="0.6"/><circle cx="260" cy="93" r="12" fill="var(--tb-accent)"/><circle cx="370" cy="93" r="5" fill="var(--tb-accent)" opacity="0.4"/><circle cx="470" cy="93" r="12" fill="var(--tb-accent)"/>
  <circle cx="150" cy="128" r="5" fill="var(--tb-accent)" opacity="0.4"/><circle cx="260" cy="128" r="12" fill="var(--tb-accent)"/><circle cx="370" cy="128" r="8" fill="var(--tb-accent)" opacity="0.6"/><circle cx="470" cy="128" r="8" fill="var(--tb-accent)" opacity="0.6"/>
  <circle cx="150" cy="163" r="5" fill="var(--tb-accent)" opacity="0.4"/><circle cx="260" cy="163" r="8" fill="var(--tb-accent)" opacity="0.6"/><circle cx="370" cy="163" r="12" fill="var(--tb-accent)"/><circle cx="470" cy="163" r="5" fill="var(--tb-accent)" opacity="0.4"/>
  <text class="tick" x="290" y="205" text-anchor="middle">円が大きいほど重点 (一例。製品・会社によって変わる)</text>
</svg>
<p class="tb-caption">図: 段階ごとのチェックの重点の例。構想段階では機能・安全、詳細段階では強度と作りやすさ、出図前は図面、試作後は試験結果との照合に重点を置く</p>
<h2>チェックリストを生かすコツ</h2>
<ul>
  <li><b>自分で一度通してからレビューに出す</b>: レビュアーの時間を、自分では気づけない問題に使ってもらう</li>
  <li><b>「OK」だけでなく根拠を書く</b>: 「強度 OK (計算書 No.12、安全率 3.1)」のように確認方法を残す</li>
  <li><b>該当しない項目は「対象外」と書く</b>: 空欄は「見ていない」のか「関係ない」のか区別できない</li>
  <li><b>失敗事例から項目を足す</b>: 不具合が出たら、それを防げた項目を追加し、社内のリストを育てる</li>
  <li><b>長くしすぎない</b>: 項目が多すぎると形骸化する。製品の種類ごとに重点項目を絞った版を作る</li>
</ul>
<div class="tb-note">チェックリストは考えることの代わりではなく、考え忘れを防ぐ道具です。リストにない新しい要素 (新材料・新工法・新しい使われ方) こそ、時間をかけて検討します。</div>
<div class="tb-tip"><b>3DCAD Studio</b>: チェックの多くはツールで裏付けられます。<b>干渉解析</b> (機能・組立)、<b>公差累積解析</b> (機能)、<b>応力解析</b> (強度・剛性)、<b>CAM</b>・<b>3D プリントチェック</b> (製造)、<b>部品表</b> (コスト・図面)、<b>改訂履歴</b> (図面)。結果を根拠としてチェック欄に記入しましょう。</div>`,
    points: [
      "機能・強度・剛性・熱・振動・製造・組立・保守・安全・環境・コスト・図面の 12 観点",
      "段階ごと (構想・詳細・出図前・試作後) に重点を変える",
      "OK には根拠を、関係ない項目は「対象外」と書く",
      "失敗事例から項目を足してリストを育て、長くしすぎない",
    ],
    exercises: [
      {
        q: "屋外に置く、モーター駆動の小型コンベヤ (アルミフレーム + 鋼の軸、樹脂カバー) の詳細 DR に向けて、チェックリストから特に重点を置くべき項目を 5 つ挙げ、理由を述べてください。",
        a: "例: (1) <b>環境 — 電食</b>: アルミフレームと鋼の軸・ステンレスねじが雨水のある所で接触するため、絶縁や表面処理を確認。(2) <b>熱 — 熱膨張</b>: 屋外の温度差でアルミと鋼の伸び差が出るため、長い部材の固定方法 (片側フリー) を確認。(3) <b>環境 — 紫外線</b>: 樹脂カバーの劣化。耐候グレードの材料か。(4) <b>安全 — 巻き込まれ</b>: ベルト・ローラーの巻き込み点のカバーと非常停止。(5) <b>強度 — 疲労</b>: 軸は回転曲げを受けるので、段付き部の R と疲労計算。ほかに振動 (モーター回転数と固有振動数)、保守 (ベルト交換性) も候補です。",
      },
    ],
    quiz: [
      { q: "チェック欄の書き方として最もよいのは?", choices: ["OK とだけ書く", "根拠 (計算書番号など) を添えて OK と書く", "関係ない項目は空欄にする"], answer: 1, explain: "根拠を書けば後から確認でき、関係ない項目は「対象外」と明記します。" },
      { q: "構想 DR で最も重点を置くべき観点は?", choices: ["図面の注記", "機能と安全", "ねじの長さ"], answer: 1, explain: "構想段階では、仕様を満たす機能と安全の成立性が最優先です。図面の細部は出図前に確認します。" },
      { q: "チェックリストを育てる方法として適切なのは?", choices: ["不具合が出たら、それを防げた項目を追加する", "項目を増やし続ける", "一度作ったら変えない"], answer: 0, explain: "失敗事例から項目を足し、同時に形骸化しないよう重点を絞ります。" },
    ],
    lessons: ["9-1", "9-2", "9-3", "8-3"],
  },
];
