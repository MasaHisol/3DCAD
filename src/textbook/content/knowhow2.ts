import type { TextChapter } from "../types";

export const KNOWHOW2: TextChapter[] = [
  {
    id: "standardization",
    part: "knowhow",
    title: "【中級】標準化と共通化",
    minutes: 20,
    level: 2,
    lead: "部品やねじ、板厚の種類が増えるほど、設計・調達・在庫・組立・保守のすべてでコストとミスが増えます。標準部品・社内標準・モジュール設計・プラットフォーム化によって「選ばなくてよい」状態をつくる考え方を学びます。",
    body: `
<h2>なぜ標準化するのか</h2>
<p>新しい部品を 1 つ増やすと、図面・検図・見積・発注・受入検査・在庫管理・保守部品の登録まで、見えない仕事が連鎖的に増えます。標準化は「部品点数」ではなく<b>部品の種類数</b>を減らす活動です。</p>
<table class="tb-table">
  <tr><th>対象</th><th>標準化しないと</th><th>標準化すると</th></tr>
  <tr><td>設計</td><td>毎回ゼロから選定・計算</td><td>実績のある部品を選ぶだけ。検討時間が短い</td></tr>
  <tr><td>調達</td><td>少量多品種で単価が高い</td><td>まとめ買いで単価・納期が安定</td></tr>
  <tr><td>製造</td><td>工具・治具・作業手順がばらばら</td><td>工具交換が減り、作業者が慣れる</td></tr>
  <tr><td>品質</td><td>初物ごとに不具合リスク</td><td>実績品なので不具合が出にくい</td></tr>
  <tr><td>保守</td><td>交換部品の在庫が膨大</td><td>少ない保守在庫で多機種に対応</td></tr>
</table>
<h2>何をそろえるか — 社内標準の例</h2>
<table class="tb-table">
  <tr><th>項目</th><th>社内標準の例</th><th>ねらい</th></tr>
  <tr><td>ねじ</td><td>M3・M4・M5・M6・M8 のみ。長さは 2 mm〜5 mm 刻みの推奨系列</td><td>工具・在庫を削減、取り違え防止</td></tr>
  <tr><td>ねじの種類</td><td>六角穴付きボルト + 平座金を基本、なべ小ねじは M4 以下</td><td>締付工具の統一</td></tr>
  <tr><td>穴径</td><td>ボルト通し穴は M4→φ4.5、M5→φ5.5、M6→φ6.6 などに固定</td><td>ドリル本数を減らす</td></tr>
  <tr><td>板厚</td><td>鋼板 1.0 / 1.6 / 2.3 / 3.2、アルミ 1.0 / 2.0 / 3.0 など市販品に限定</td><td>材料在庫・曲げ条件を統一</td></tr>
  <tr><td>材料</td><td>構造材 SS400、軸 S45C、カバー A5052 など用途別に 1〜2 種</td><td>材料証明・調達の簡素化</td></tr>
  <tr><td>表面処理</td><td>鋼は三価クロメート亜鉛めっき、アルミは白アルマイト</td><td>外注先・色の統一</td></tr>
  <tr><td>購入品</td><td>軸受・センサ・モーターは推奨メーカーの推奨型式から選ぶ</td><td>実績品を使い、評価を省く</td></tr>
</table>
<div class="tb-note">標準は「禁止リスト」ではなく「推奨リスト」です。標準外を使うときは理由を設計書に残し、レビューで承認する運用にすると、標準が形骸化しません。</div>
<h2>モジュール設計</h2>
<p>製品を<b>機能のまとまり (モジュール)</b> に分け、モジュール間の<b>インタフェース (取付穴・コネクタ・軸径など)</b> を固定します。インタフェースが変わらなければ、中身を入れ替えても他に影響しません。</p>
<ol class="tb-flow">
  <li>機能を分解</li><li>インタフェースを定義・固定</li><li>モジュールごとに設計・評価</li><li>組み合わせで品種展開</li>
</ol>
<svg class="tb-chart" viewBox="0 0 520 190" aria-label="モジュールの組み合わせ">
  <rect x="30" y="30" width="120" height="40" fill="none" stroke="var(--tb-accent)" stroke-width="2"/>
  <text class="lbl" x="90" y="55" text-anchor="middle">駆動 A / B</text>
  <rect x="200" y="30" width="120" height="40" fill="none" stroke="var(--tb-accent)" stroke-width="2"/>
  <text class="lbl" x="260" y="55" text-anchor="middle">搬送 短 / 長</text>
  <rect x="370" y="30" width="120" height="40" fill="none" stroke="var(--tb-accent)" stroke-width="2"/>
  <text class="lbl" x="430" y="55" text-anchor="middle">制御 標準 / 高機能</text>
  <line class="guide" x1="150" y1="50" x2="200" y2="50"/><line class="guide" x1="320" y1="50" x2="370" y2="50"/>
  <rect x="30" y="120" width="460" height="40" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text class="lbl" x="260" y="145" text-anchor="middle">共通プラットフォーム (フレーム・取付ピッチ・電源・通信)</text>
  <line class="guide" x1="90" y1="70" x2="90" y2="120"/><line class="guide" x1="260" y1="70" x2="260" y2="120"/><line class="guide" x1="430" y1="70" x2="430" y2="120"/>
  <text class="sec" x="260" y="182" text-anchor="middle">2 × 2 × 2 = 8 機種を 6 モジュール + 共通部で構成</text>
</svg>
<h2>プラットフォーム化</h2>
<p>複数の製品で共通に使う土台 (フレーム、取付ピッチ、電源、制御基板、ソフトウェア) を<b>プラットフォーム</b>として先に作り込み、製品ごとの違いは上に載るモジュールで出します。開発のたびに土台を作り直さないため、開発期間と評価工数が大きく減ります。</p>
<ul>
  <li><b>共通にする所</b>: お客様に見えない・差別化にならない部分 (骨格、締結、配線、電源)</li>
  <li><b>変える所</b>: お客様が選ぶ・価値を感じる部分 (能力、サイズ、意匠、オプション)</li>
  <li><b>注意</b>: 最上位機種に合わせて共通部を作ると、下位機種が過剰品質で高くなる。逆に下位に合わせると上位で強度不足。対象範囲を最初に決める</li>
</ul>
<h2>効果の例</h2>
<table class="tb-table">
  <tr><th>指標</th><th>標準化前</th><th>標準化後</th></tr>
  <tr><td>ねじの品番数</td><td>180 種</td><td>45 種</td></tr>
  <tr><td>ドリル・タップの本数</td><td>28 本</td><td>12 本</td></tr>
  <tr><td>新機種の新規部品率</td><td>70 %</td><td>30 %</td></tr>
  <tr><td>開発期間</td><td>12 か月</td><td>7 か月</td></tr>
</table>
<p class="tb-note">数値は考え方を示すための一般的な例です。効果は製品・業種によって大きく変わります。</p>
<svg class="tb-chart" viewBox="0 0 520 190" role="img" aria-label="標準化による種類数の削減 (例)">
<line class="axis" x1="40" y1="160" x2="490" y2="160"/>
<rect x="70" y="50" width="34" height="110" fill="var(--tb-text-3)" opacity="0.5"/><rect x="110" y="132.5" width="34" height="27.5" fill="var(--tb-accent)"/><text class="tick" x="87" y="45" text-anchor="middle">180</text><text class="tick" x="127" y="127.5" text-anchor="middle">45</text><text class="tick" x="107" y="178" text-anchor="middle">ねじの品番数</text><rect x="220" y="50" width="34" height="110" fill="var(--tb-text-3)" opacity="0.5"/><rect x="260" y="112.85714285714286" width="34" height="47.1" fill="var(--tb-accent)"/><text class="tick" x="237" y="45" text-anchor="middle">28</text><text class="tick" x="277" y="107.85714285714286" text-anchor="middle">12</text><text class="tick" x="257" y="178" text-anchor="middle">ドリル・タップ</text><rect x="370" y="50" width="34" height="110" fill="var(--tb-text-3)" opacity="0.5"/><rect x="410" y="112.85714285714286" width="34" height="47.1" fill="var(--tb-accent)"/><text class="tick" x="387" y="45" text-anchor="middle">70</text><text class="tick" x="427" y="107.85714285714286" text-anchor="middle">30</text><text class="tick" x="407" y="178" text-anchor="middle">新規部品率 %</text>
<text class="tick" x="260" y="22" text-anchor="middle">灰 = 標準化前、色 = 標準化後 (項目ごとに前を 100 として表示)</text>
</svg>
<p class="tb-caption">図: 上の「効果の例」の表をグラフにしたもの。数値は考え方を示す一般的な例</p>
<div class="tb-tip"><b>3DCAD Studio</b>: <b>標準部品</b>ライブラリから締結部品を選び、<b>ルール・ファミリー表</b>と<b>パラメータ表</b>でサイズ違いを 1 つのモデルから展開できます。<b>部品表</b>で品番数を数え、標準外部品が混ざっていないか確認しましょう。</div>`,
    points: [
      "標準化は部品の「種類数」を減らし、設計から保守までの見えないコストを削る",
      "ねじ・穴径・板厚・材料・表面処理を社内標準の推奨リストにする",
      "モジュール設計はインタフェースを固定し、中身を入れ替えられるようにする",
      "プラットフォームは差別化しない土台を共通化し、違いはモジュールで出す",
    ],
    exercises: [
      {
        q: "駆動部 3 種、搬送部 2 種、制御部 2 種のモジュールを組み合わせると何機種を構成できますか。また、機種ごとに専用設計した場合と比べて、設計するユニット数はいくつ減りますか (1 機種 = 3 ユニットとする)。",
        a: "機種数 = 3 × 2 × 2 = <b>12 機種</b>。専用設計なら 12 × 3 = 36 ユニット、モジュール設計なら 3 + 2 + 2 = 7 ユニットで、<b>29 ユニット減</b>ります (ただしインタフェース統一のための検討工数は別に必要)。",
      },
    ],
    quiz: [
      { q: "標準化で主に減らすべきものは?", choices: ["部品の種類数", "製品の機能", "図面の枚数だけ"], answer: 0, explain: "種類数を減らすことで調達・在庫・工具・検査など連鎖的なコストが下がります。" },
      { q: "モジュール設計で最も重要なのは?", choices: ["モジュールの中身を毎回最適化する", "モジュール間のインタフェースを固定する", "すべてを 1 部品にまとめる"], answer: 1, explain: "インタフェースが固定されていれば中身を入れ替えても他に影響しません。" },
      { q: "プラットフォームとして共通化するのに向く部分は?", choices: ["お客様が選ぶ意匠", "差別化にならない骨格・締結・電源", "オプション機能"], answer: 1, explain: "見えない・差別化しない部分を共通化し、価値を感じる部分を変えます。" },
    ],
    lessons: ["4-1"],
  },
  {
    id: "design-docs",
    part: "knowhow",
    title: "【中級】設計計算書と設計文書",
    minutes: 20,
    level: 2,
    lead: "図面は「何を作るか」を伝えますが、「なぜその寸法・材料なのか」は伝えません。設計根拠を計算書や設計文書に残しておくと、レビュー・変更・不具合対応・後任への引継ぎが格段に楽になります。",
    body: `
<h2>設計文書の種類</h2>
<table class="tb-table">
  <tr><th>文書</th><th>内容</th><th>主な読み手</th></tr>
  <tr><td>仕様書</td><td>何を満たすべきか (性能・寸法・環境・寿命・コスト)</td><td>顧客・企画・設計</td></tr>
  <tr><td>設計計算書</td><td>仕様を満たすことの根拠 (強度・寿命・熱・公差など)</td><td>設計・レビュアー・後任</td></tr>
  <tr><td>DR 資料</td><td>設計審査での判断材料 (構想、リスク、未解決事項)</td><td>審査メンバー・上長</td></tr>
  <tr><td>試験計画書・報告書</td><td>何をどう試し、結果はどうだったか</td><td>設計・品質保証</td></tr>
  <tr><td>変更記録 (改訂履歴)</td><td>いつ・誰が・何を・なぜ変えたか</td><td>製造・調達・保守</td></tr>
</table>
<svg class="tb-chart" viewBox="0 0 520 190" role="img" aria-label="設計文書のつながり">
<rect x="20" y="50" width="105" height="40" rx="6" fill="var(--tb-surface-2)" stroke="var(--tb-accent)" stroke-width="1.5"/><text class="lbl" x="72" y="75" text-anchor="middle">仕様書</text><line x1="125" y1="70" x2="145" y2="70" stroke="var(--tb-accent)" stroke-width="2"/><polygon points="145,70 137.6,73.1 137.6,66.9" fill="var(--tb-accent)"/><rect x="145" y="50" width="105" height="40" rx="6" fill="var(--tb-surface-2)" stroke="var(--tb-accent)" stroke-width="1.5"/><text class="lbl" x="197" y="75" text-anchor="middle">設計計算書</text><line x1="250" y1="70" x2="270" y2="70" stroke="var(--tb-accent)" stroke-width="2"/><polygon points="270,70 262.6,73.1 262.6,66.9" fill="var(--tb-accent)"/><rect x="270" y="50" width="105" height="40" rx="6" fill="var(--tb-surface-2)" stroke="var(--tb-accent)" stroke-width="1.5"/><text class="lbl" x="322" y="75" text-anchor="middle">図面・部品表</text><line x1="375" y1="70" x2="395" y2="70" stroke="var(--tb-accent)" stroke-width="2"/><polygon points="395,70 387.6,73.1 387.6,66.9" fill="var(--tb-accent)"/><rect x="395" y="50" width="105" height="40" rx="6" fill="var(--tb-surface-2)" stroke="var(--tb-accent)" stroke-width="1.5"/><text class="lbl" x="447" y="75" text-anchor="middle">試験報告書</text>
<path d="M447,90 C447,150 72,150 72,94" fill="none" class="guide"/>
<line x1="73" y1="104" x2="72" y2="94" stroke="var(--tb-text-3)" stroke-width="2"/><polygon points="72,94 75.8,101.0 69.6,101.6" fill="var(--tb-text-3)"/>
<text class="tick" x="260" y="160" text-anchor="middle">試験で仕様を満たさなければ、仕様・計算・図面に戻って直し、改訂履歴に残す</text>
<text class="tick" x="72" y="40" text-anchor="middle">何を</text><text class="tick" x="197" y="40" text-anchor="middle">なぜ大丈夫か</text><text class="tick" x="322" y="40" text-anchor="middle">どう作るか</text><text class="tick" x="447" y="40" text-anchor="middle">本当にそうか</text>
</svg>
<p class="tb-caption">図: 設計文書は 1 本の鎖。仕様の項目番号を計算書が引用し、計算結果が図面の寸法・材料に反映され、試験で確かめる</p>
<h2>計算書の構成</h2>
<ol class="tb-flow">
  <li>目的</li><li>条件</li><li>前提・仮定</li><li>式</li><li>結果</li><li>判定</li><li>参考文献</li>
</ol>
<table class="tb-table">
  <tr><th>項目</th><th>書くこと</th><th>例</th></tr>
  <tr><td>目的</td><td>何を確かめる計算か</td><td>アーム取付ボルトの強度確認</td></tr>
  <tr><td>条件</td><td>荷重・温度・寸法・材料と、その出所</td><td>先端荷重 200 N (仕様書 3.2 項)、M6 強度区分 8.8</td></tr>
  <tr><td>前提・仮定</td><td>単純化した点、無視した影響</td><td>アームは剛体、ボルト 2 本で均等に負担、衝撃係数 2</td></tr>
  <tr><td>式</td><td>使った式と記号の意味、単位</td><td>σ = F × k / (n × A<sub>s</sub>)</td></tr>
  <tr><td>結果</td><td>数値と単位 (途中計算も残す)</td><td>σ = 9.95 MPa (2 本・衝撃係数 2)</td></tr>
  <tr><td>判定</td><td>基準値と比較し、合否と安全率</td><td>許容 213 MPa 以下 → OK (安全率 21)</td></tr>
  <tr><td>参考文献</td><td>規格・便覧・カタログ (版・ページ)</td><td>JIS B 1082、メーカーカタログ 2025 年版 p.12</td></tr>
</table>
<div class="tb-note">いちばん抜けやすいのが<b>前提・仮定</b>です。結果が正しくても、前提が変われば結論は変わります。後で条件が変わったとき、どこを見直せばよいかが前提から分かります。</div>
<h2>悪い例と良い例</h2>
<table class="tb-table">
  <tr><th>悪い例</th><th>良い例</th></tr>
  <tr><td>「荷重 200、応力 24、OK」</td><td>「先端荷重 F = 200 N (仕様書 3.2)、引張応力 σ = 9.95 MPa ≤ 許容 213 MPa、安全率 21 で OK」</td></tr>
  <tr><td>単位がない・混在している</td><td>すべて SI 単位、式に単位を併記</td></tr>
  <tr><td>Excel のセルにだけ式がある</td><td>式を文章で書き、Excel は検算用として添付</td></tr>
  <tr><td>結論だけで判定基準がない</td><td>許容値・安全率の根拠 (規格・社内基準) を書く</td></tr>
  <tr><td>日付・作成者・版がない</td><td>表紙に文書番号・版・作成/確認/承認者・日付</td></tr>
  <tr><td>不利な結果は書かない</td><td>NG や懸念点も書き、対策と残リスクを明記</td></tr>
</table>
<svg class="tb-chart" viewBox="0 0 520 170" role="img" aria-label="根拠のトレーサビリティ">
<rect x="20" y="50" width="140" height="56" rx="6" fill="var(--tb-surface-2)" stroke="currentColor"/><text class="lbl" x="90" y="72" text-anchor="middle">仕様書 3.2 項</text><text class="tick" x="90" y="92" text-anchor="middle">先端荷重 200 N</text>
<rect x="190" y="50" width="140" height="56" rx="6" fill="var(--tb-surface-2)" stroke="currentColor"/><text class="lbl" x="260" y="72" text-anchor="middle">計算書 No.12</text><text class="tick" x="260" y="92" text-anchor="middle">M6 8.8 で安全率 3.1</text>
<rect x="360" y="50" width="140" height="56" rx="6" fill="var(--tb-surface-2)" stroke="currentColor"/><text class="lbl" x="430" y="72" text-anchor="middle">図面 A-102</text><text class="tick" x="430" y="92" text-anchor="middle">M6 × 4、強度区分 8.8</text>
<line x1="160" y1="78" x2="188" y2="78" stroke="var(--tb-accent)" stroke-width="2"/><polygon points="188,78 180.6,81.1 180.6,74.9" fill="var(--tb-accent)"/><line x1="330" y1="78" x2="358" y2="78" stroke="var(--tb-accent)" stroke-width="2"/><polygon points="358,78 350.6,81.1 350.6,74.9" fill="var(--tb-accent)"/>
<text class="tick" x="260" y="140" text-anchor="middle">「なぜ M6 なのか」を後任が逆にたどれるよう、番号で引用し合う (数値は例)</text>
</svg>
<p class="tb-caption">図: 根拠は文書間の参照番号でつなぐ。図面の寸法から計算書、計算書から仕様へと逆にたどれることが大切</p>
<h2>設計根拠を残すコツ</h2>
<ul>
  <li><b>決めた理由を 1 行で書く</b>: 「φ20 は軸受内径の標準から」「SUS304 は洗浄液対策」など。数年後の自分が一番の読み手</li>
  <li><b>捨てた案も残す</b>: 比較表で「なぜ B 案にしなかったか」を書くと、同じ議論を繰り返さない</li>
  <li><b>図面と計算書を相互参照</b>: 図面の重要寸法に計算書番号を、計算書に図番を書く</li>
  <li><b>変更時は計算書も改訂</b>: 図面だけ変えて計算書が古いままになるのが典型的な事故の芽</li>
</ul>
<h2>変更記録の書き方</h2>
<pre class="tb-pre">版  日付        内容                                  理由                    承認
B   2026-05-10  板厚 t2.0 → t2.3                      DR2 指摘: たわみ過大       山田
C   2026-07-02  取付穴 φ5.5 → 長穴 5.5×8              組立時の位置調整のため     山田</pre>
<div class="tb-tip"><b>3DCAD Studio</b>: <b>改訂履歴</b>に変更内容と理由を残せます。<b>応力解析・PDF レポート</b>で出力したレポートを計算書の添付資料にすると、条件と結果をそのまま記録できます。</div>`,
    points: [
      "図面は「何を」、計算書は「なぜ」を伝える。根拠を必ず残す",
      "計算書は 目的・条件・前提・式・結果・判定・参考文献 の順で書く",
      "前提・仮定と判定基準の出所を明記し、単位を省略しない",
      "変更時は図面・計算書・改訂履歴をセットで更新する",
    ],
    exercises: [
      {
        q: "M6 ボルト (有効断面積 A<sub>s</sub> = 20.1 mm²) 2 本で、引張荷重 200 N を衝撃係数 2 として支えます。1 本あたりの引張応力を計算書の「式・結果・判定」の形で書きなさい (許容応力 213 MPa)。",
        a: "式: σ = F × k / (n × A<sub>s</sub>)<br>結果: σ = 200 × 2 / (2 × 20.1) = <b>9.95 MPa</b><br>判定: 9.95 MPa ≤ 213 MPa → OK、安全率 213 / 9.95 ≈ <b>21</b>。前提: 2 本均等負担、曲げ・締付力の影響は別途確認。",
      },
    ],
    quiz: [
      { q: "計算書で最も抜けやすく、後で問題になりやすい項目は?", choices: ["結果の数値", "前提・仮定", "タイトル"], answer: 1, explain: "前提が変われば結論が変わるため、明記しておかないと見直し箇所が分かりません。" },
      { q: "良い計算書の書き方は?", choices: ["Excel のセルにだけ式を入れる", "単位と判定基準の出所を書く", "NG の結果は省く"], answer: 1, explain: "単位と判定基準の根拠があって初めて第三者が確認できます。" },
      { q: "図面を変更したときに忘れてはいけないのは?", choices: ["計算書と改訂履歴も更新する", "旧図面を捨てる", "何もしない"], answer: 0, explain: "図面だけ新しく計算書が古いと、根拠のない設計になります。" },
    ],
    lessons: ["9-1", "9-3"],
  },
  {
    id: "testing",
    part: "knowhow",
    title: "【中級】試作と評価試験",
    minutes: 22,
    level: 2,
    lead: "計算や解析は現実を単純化したモデルにすぎません。試作品を作って試験し、想定どおりかを確かめることで初めて設計が完成します。試作の段階、試験の種類、計画と合否基準、加速試験の考え方を学びます。",
    body: `
<h2>試作の段階</h2>
<ol class="tb-flow">
  <li>DR (構想・詳細)</li><li>機能試作</li><li>評価試験</li><li>DR (量産移行)</li><li>量産試作</li><li>量産</li>
</ol>
<table class="tb-table">
  <tr><th>段階</th><th>目的</th><th>作り方</th></tr>
  <tr><td>機能試作 (原理試作)</td><td>原理・機能が成立するか</td><td>3D プリント・切削・手作業。見た目は問わない</td></tr>
  <tr><td>設計試作 (評価試作)</td><td>仕様を満たすか、強度・寿命・環境</td><td>量産に近い材料・形状</td></tr>
  <tr><td>量産試作</td><td>量産工程・金型で品質が安定するか</td><td>量産の型・治具・作業者で作る</td></tr>
</table>
<div class="tb-note">機能試作を 3D プリントで作ると、材料が違うため強度・剛性・熱変形の評価には使えません。<b>何を確かめる試作か</b>を先に決め、それに合った作り方を選びます。</div>
<svg class="tb-chart" viewBox="0 0 520 190" role="img" aria-label="試作段階ごとに確かめること">
<text class="lbl" x="110" y="72" text-anchor="end">原理・機能</text><text class="lbl" x="110" y="112" text-anchor="end">強度・寿命・環境</text><text class="lbl" x="110" y="152" text-anchor="end">量産の品質安定</text>
<text class="lbl" x="190" y="40" text-anchor="middle">機能試作</text><text class="lbl" x="310" y="40" text-anchor="middle">設計試作</text><text class="lbl" x="430" y="40" text-anchor="middle">量産試作</text>
<circle cx="190" cy="68" r="9" fill="var(--tb-accent)" stroke="var(--tb-accent)" stroke-width="1.5"/><circle cx="190" cy="108" r="9" fill="none" stroke="var(--tb-accent)" stroke-width="1.5"/><circle cx="190" cy="148" r="9" fill="none" stroke="var(--tb-accent)" stroke-width="1.5"/><circle cx="310" cy="68" r="9" fill="var(--tb-accent)" stroke="var(--tb-accent)" stroke-width="1.5"/><circle cx="310" cy="108" r="9" fill="var(--tb-accent)" stroke="var(--tb-accent)" stroke-width="1.5"/><circle cx="310" cy="148" r="9" fill="none" stroke="var(--tb-accent)" stroke-width="1.5"/><circle cx="430" cy="68" r="9" fill="var(--tb-accent)" stroke="var(--tb-accent)" stroke-width="1.5"/><circle cx="430" cy="108" r="9" fill="var(--tb-accent)" stroke="var(--tb-accent)" stroke-width="1.5"/><circle cx="430" cy="148" r="9" fill="var(--tb-accent)" stroke="var(--tb-accent)" stroke-width="1.5"/>
<line class="grid" x1="40" y1="50" x2="490" y2="50"/>
<text class="tick" x="300" y="182" text-anchor="middle">● 確かめられる  ○ 確かめられない (材料・工法が違うため)</text>
</svg>
<p class="tb-caption">図: 試作の段階が進むほど量産品に近づき、確かめられることが増える。機能試作の結果で強度を判断しない</p>
<h2>評価試験の種類</h2>
<table class="tb-table">
  <tr><th>分類</th><th>試験</th><th>確かめること</th></tr>
  <tr><td rowspan="2">強度</td><td>静的強度試験</td><td>最大荷重で壊れない・永久変形しない (破壊まで負荷して余裕を確認)</td></tr>
  <tr><td>剛性試験</td><td>荷重とたわみの関係が計算と合うか</td></tr>
  <tr><td rowspan="2">耐久</td><td>繰返し負荷試験</td><td>想定回数の負荷で疲労破壊しない</td></tr>
  <tr><td>連続運転試験</td><td>摩耗・緩み・発熱が許容内か</td></tr>
  <tr><td rowspan="5">環境</td><td>温度試験 (高温・低温・温度サイクル)</td><td>熱膨張・材料劣化・はんだや接着の割れ</td></tr>
  <tr><td>湿度試験 (高温高湿)</td><td>腐食・絶縁低下・樹脂の吸湿変形</td></tr>
  <tr><td>振動試験 (正弦波掃引・ランダム)</td><td>共振・緩み・疲労 (輸送・使用時)</td></tr>
  <tr><td>落下・衝撃試験</td><td>輸送中や使用中の落下で壊れない</td></tr>
  <tr><td>塩水噴霧試験</td><td>めっき・塗装の防食性</td></tr>
</table>
<h2>試験計画の立て方</h2>
<ul>
  <li><b>目的</b>: どの仕様・どのリスクを確かめるか (FMEA や DR 指摘と結びつける)</li>
  <li><b>試料</b>: 数量、試作の版、ロット。1 個だけではばらつきが分からない</li>
  <li><b>条件</b>: 荷重・温度・回数・時間、測定項目と測定器、測定タイミング</li>
  <li><b>合否基準</b>: 試験の<b>前に</b>数値で決める (後から決めると甘くなる)</li>
  <li><b>日程と設備</b>: 試験機の予約、外部試験所の手配</li>
</ul>
<table class="tb-table">
  <tr><th>悪い合否基準</th><th>良い合否基準</th></tr>
  <tr><td>「異常がないこと」</td><td>「10⁶ 回後にき裂なし (浸透探傷で確認)、ガタ 0.05 mm 以下」</td></tr>
  <tr><td>「十分に強いこと」</td><td>「定格 500 N の 2 倍 (1000 N) で永久変形 0.1 mm 以下」</td></tr>
  <tr><td>「動作すること」</td><td>「−10 °C〜50 °C で起動時間 2 s 以下、位置決め誤差 ±0.1 mm」</td></tr>
</table>
<h2>加速試験の考え方</h2>
<p>10 年の寿命を 10 年かけて試験することはできません。負荷・温度・頻度を<b>厳しく</b>して短時間で同じ劣化を起こさせるのが加速試験です。</p>
<div class="tb-formula">加速係数 AF = 実使用での寿命 / 試験条件での寿命</div>
<ul>
  <li><b>頻度の加速</b>: 1 日 100 回の開閉を、試験機で 1 時間 3600 回行う (発熱しない範囲で)</li>
  <li><b>温度の加速</b>: 化学反応による劣化は温度が高いほど速い (アレニウスの式)。経験則として「10 °C 上がると寿命が約半分」が目安に使われることがあるが、材料・劣化メカニズムで異なる</li>
  <li><b>荷重の加速</b>: S-N 曲線を使い、高い応力で回数を減らす</li>
</ul>
<svg class="tb-chart" viewBox="0 0 520 210" aria-label="温度と寿命 (10℃ 2 倍則の目安)">
  <line class="axis" x1="60" y1="170" x2="490" y2="170"/><line class="axis" x1="60" y1="20" x2="60" y2="170"/>
  <line class="grid" x1="60" y1="45" x2="490" y2="45"/><line class="grid" x1="60" y1="95" x2="490" y2="95"/><line class="grid" x1="60" y1="145" x2="490" y2="145"/>
  <polyline points="80,35 140,52 200,68 260,85 320,102 380,118 440,135" fill="none" stroke="var(--tb-accent)" stroke-width="2.5"/>
  <circle class="mark" cx="80" cy="35" r="4"/><circle class="mark" cx="440" cy="135" r="4"/>
  <text class="mark-t" x="88" y="30">25 °C: 1</text><text class="mark-t" x="430" y="155" text-anchor="end">85 °C: 1/64</text>
  <text class="tick" x="80" y="186" text-anchor="middle">25</text><text class="tick" x="260" y="186" text-anchor="middle">55</text><text class="tick" x="440" y="186" text-anchor="middle">85</text>
  <text class="lbl" x="485" y="204" text-anchor="end">温度 °C</text>
  <text class="lbl" x="66" y="16">相対寿命 (対数目盛)</text>
</svg>
<div class="tb-note">加速しすぎると、実使用では起こらない壊れ方 (樹脂の軟化、潤滑剤の分解など) が起きます。<b>壊れ方 (故障モード) が実使用と同じか</b>を必ず確認します。</div>
<div class="tb-tip"><b>3DCAD Studio</b>: <b>応力解析・PDF レポート</b>で試験前に応力集中箇所を予測し、ひずみゲージの貼り位置や観察箇所を決めておくと、試験結果と解析の比較ができます。</div>`,
    points: [
      "試作は 機能試作 → 設計試作 → 量産試作。何を確かめるかで作り方を選ぶ",
      "強度・耐久・環境 (温度・湿度・振動・落下) の試験を仕様とリスクから選ぶ",
      "合否基準は試験の前に数値で決める",
      "加速試験は故障モードが実使用と同じであることを確認する",
    ],
    exercises: [
      {
        q: "25 °C で使う部品を 85 °C で加速試験します。「10 °C で寿命半分」の目安を使うと、加速係数はいくつですか。実使用 10 年 (87 600 h) 相当は何時間の試験になりますか。",
        a: "温度差 60 °C → 2<sup>60/10</sup> = 2⁶ = <b>64</b>。試験時間 = 87 600 / 64 ≈ <b>1 369 h (約 57 日)</b>。ただし目安にすぎないため、材料ごとの活性化エネルギーや故障モードの確認が必要です。",
      },
    ],
    quiz: [
      { q: "3D プリントの機能試作で確かめるのに適さないのは?", choices: ["組立性・干渉", "動きの原理", "量産材料での疲労強度"], answer: 2, explain: "材料・製法が違うため強度や疲労の評価には使えません。" },
      { q: "合否基準はいつ決めるべき?", choices: ["試験の前", "試験の後、結果を見て", "量産開始後"], answer: 0, explain: "後から決めると結果に引きずられて甘くなります。" },
      { q: "加速試験で必ず確認すべきことは?", choices: ["試験時間が短いこと", "故障モードが実使用と同じこと", "試料が 1 個であること"], answer: 1, explain: "加速しすぎて別の壊れ方をすると、寿命の推定ができません。" },
    ],
    lessons: ["9-2"],
  },
  {
    id: "tolerance-design",
    part: "knowhow",
    title: "【上級】公差設計の実践",
    minutes: 25,
    level: 3,
    lead: "公差は厳しくすれば安心ですが、コストは急上昇します。機能から必要なすき間を決め、寸法の累積をワーストケース・RSS・モンテカルロで計算し、寄与率を見て公差を配分する — 実務での公差設計の進め方を数値例で学びます。",
    body: `
<h2>機能から公差を決める</h2>
<p>公差設計は「この寸法は ±0.1 くらい」から始めるのではなく、<b>機能上の要求 (すき間、位置、はめあい)</b> から始めます。</p>
<ol class="tb-flow">
  <li>機能要求を決める (例: すき間 0.1〜0.9)</li><li>寸法ループを描く</li><li>累積を計算</li><li>寄与率を見て配分</li><li>工程能力と照合</li>
</ol>
<h2>寸法ループと累積の計算</h2>
<p>ハウジングの中に 4 つの部品を並べ、端に残るすき間 G を考えます。</p>
<svg class="tb-chart" viewBox="0 0 520 170" aria-label="寸法ループ">
  <rect x="40" y="40" width="440" height="60" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="40" y="50" width="100" height="40" fill="none" stroke="var(--tb-accent)" stroke-width="2"/>
  <rect x="140" y="50" width="150" height="40" fill="none" stroke="var(--tb-accent)" stroke-width="2"/>
  <rect x="290" y="50" width="75" height="40" fill="none" stroke="var(--tb-accent)" stroke-width="2"/>
  <rect x="365" y="50" width="100" height="40" fill="none" stroke="var(--tb-accent)" stroke-width="2"/>
  <text class="lbl" x="90" y="75" text-anchor="middle">A 20</text><text class="lbl" x="215" y="75" text-anchor="middle">B 30</text>
  <text class="lbl" x="327" y="75" text-anchor="middle">C 15</text><text class="lbl" x="415" y="75" text-anchor="middle">D 10</text>
  <text class="mark-t" x="472" y="35" text-anchor="middle">G</text>
  <line class="guide" x1="40" y1="125" x2="480" y2="125"/>
  <text class="sec" x="260" y="145" text-anchor="middle">ハウジング内寸 H = 75.5 ± 0.1</text>
</svg>
<div class="tb-formula">G = H − (A + B + C + D)　　公称 G = 75.5 − 75 = 0.5</div>
<table class="tb-table">
  <tr><th>寸法</th><th>公称</th><th>公差 ±t</th><th>t²</th></tr>
  <tr><td>H</td><td>75.5</td><td>0.10</td><td>0.0100</td></tr>
  <tr><td>A</td><td>20</td><td>0.10</td><td>0.0100</td></tr>
  <tr><td>B</td><td>30</td><td>0.15</td><td>0.0225</td></tr>
  <tr><td>C</td><td>15</td><td>0.05</td><td>0.0025</td></tr>
  <tr><td>D</td><td>10</td><td>0.10</td><td>0.0100</td></tr>
  <tr><td colspan="2">合計</td><td>0.50</td><td>0.0550</td></tr>
</table>
<table class="tb-table">
  <tr><th>方法</th><th>計算</th><th>G の範囲</th><th>特徴</th></tr>
  <tr><td>ワーストケース</td><td>Σt = 0.50</td><td>0.00〜1.00</td><td>全数保証。公差が厳しくなりがち</td></tr>
  <tr><td>RSS (二乗和平方根)</td><td>√Σt² = √0.055 ≈ 0.235</td><td>0.265〜0.735</td><td>各寸法が独立・正規分布・±3σ の前提で約 99.73 %</td></tr>
  <tr><td>モンテカルロ</td><td>乱数で多数回 (例: 20 万回) 組み立て</td><td>RSS とほぼ同じ (±0.23 程度)</td><td>分布が偏っている・非線形でも使える</td></tr>
</table>
<div class="tb-note">RSS は部品数が少ない (2〜3 個) と楽観的になりやすく、加工が公差の片側に寄る (偏り) 場合も外れます。実務ではワーストケースと RSS の中間を取る修正 RSS (係数 1.5 倍など) を使う会社もあります。</div>
<svg class="tb-chart" viewBox="0 0 520 220" role="img" aria-label="ワーストケースと RSS の範囲">
<line class="axis" x1="40" y1="165" x2="490" y2="165"/>
<rect x="60" y="40" width="400" height="125" fill="var(--tb-bad)" opacity="0.08"/>
<line x1="60" y1="35" x2="60" y2="165" stroke="var(--tb-bad)" stroke-width="1.5"/><line x1="460" y1="35" x2="460" y2="165" stroke="var(--tb-bad)" stroke-width="1.5"/>
<line x1="166" y1="55" x2="166" y2="165" stroke="var(--tb-accent)" stroke-dasharray="4 3"/><line x1="354" y1="55" x2="354" y2="165" stroke="var(--tb-accent)" stroke-dasharray="4 3"/>
<polyline points="120.0,165.0 124.0,165.0 128.0,165.0 132.0,165.0 136.0,165.0 140.0,164.9 144.0,164.9 148.0,164.8 152.0,164.7 156.0,164.5 160.0,164.3 164.0,163.9 168.0,163.5 172.0,162.8 176.0,161.8 180.0,160.6 184.0,158.9 188.0,156.8 192.0,154.1 196.0,150.7 200.0,146.6 204.0,141.7 208.0,136.0 212.0,129.4 216.0,122.1 220.0,114.1 224.0,105.6 228.0,96.7 232.0,87.9 236.0,79.2 240.0,71.2 244.0,64.1 248.0,58.1 252.0,53.7 256.0,50.9 260.0,50.0 264.0,50.9 268.0,53.7 272.0,58.1 276.0,64.1 280.0,71.2 284.0,79.2 288.0,87.9 292.0,96.7 296.0,105.6 300.0,114.1 304.0,122.1 308.0,129.4 312.0,136.0 316.0,141.7 320.0,146.6 324.0,150.7 328.0,154.1 332.0,156.8 336.0,158.9 340.0,160.6 344.0,161.8 348.0,162.8 352.0,163.5 356.0,163.9 360.0,164.3 364.0,164.5 368.0,164.7 372.0,164.8 376.0,164.9 380.0,164.9 384.0,165.0 388.0,165.0 392.0,165.0 396.0,165.0 400.0,165.0" fill="none" stroke="var(--tb-accent)" stroke-width="2.5"/>
<text class="tick" x="60" y="181" text-anchor="middle">0</text><text class="tick" x="166" y="181" text-anchor="middle">0.265</text><text class="tick" x="260" y="181" text-anchor="middle">0.5</text><text class="tick" x="354" y="181" text-anchor="middle">0.735</text><text class="tick" x="460" y="181" text-anchor="middle">1.0</text>
<text class="lbl" x="64" y="30" text-anchor="start" style="fill:var(--tb-bad)">ワーストケース 0〜1.00</text>
<text class="mark-t" x="360" y="70" text-anchor="start">RSS 0.265〜0.735 (±3σ)</text>
<text class="lbl" x="480" y="199" text-anchor="end">すき間 G (mm)</text>
</svg>
<p class="tb-caption">図: 上の例のすき間 G の分布。実際の組立品はほとんどが RSS の範囲に入り、ワーストケースの両端は極めてまれ (各寸法が独立・正規分布で ±3σ = 公差の前提)</p>
<p>実際の組立品で何が起きるかをアニメーションで見てみましょう。寸法がばらついた部品を次々に組み立て、すき間と合否の数を積み上げていきます。ワーストケースの範囲の端にはほとんど届かないことが分かります。</p>
<div data-widget="anim-stack"></div>
<h2>寄与率と公差配分</h2>
<div class="tb-formula">寄与率 = t<sub>i</sub>² / Σt²</div>
<table class="tb-table">
  <tr><th>寸法</th><th>H</th><th>A</th><th>B</th><th>C</th><th>D</th></tr>
  <tr><td>寄与率</td><td>18.2 %</td><td>18.2 %</td><td>40.9 %</td><td>4.5 %</td><td>18.2 %</td></tr>
</table>
<p>B が全体のばらつきの約 4 割を占めます。B を ±0.15 → ±0.10 にすると Σt² = 0.0425、RSS = 0.206 に減ります。逆に C (4.5 %) を厳しくしても効果は小さく、コストだけが増えます。<b>寄与率の大きい寸法から手を打つ</b>のが鉄則です。</p>
<ul>
  <li><b>加工しやすい寸法には厳しく、難しい寸法には緩く</b>配分する (同じ ±0.05 でも旋盤の外径と板金の曲げ寸法では難しさが全く違う)</li>
  <li>購入品 (軸受幅など) の公差は変えられないので、残りを自社部品で配分する</li>
</ul>
<h2>工程能力との関係</h2>
<p>RSS は「公差 = ±3σ」を前提とします。工程の実力が Cp = 1.0 なら前提どおりですが、Cp が低い工程では実際のばらつきが大きく、RSS の結果も外れます。公差を決めるときは、その加工法で<b>どの程度のばらつきが実際に出るか</b>を製造部門のデータで確認します。</p>
<h2>調整機構による吸収</h2>
<p>累積がどうしても機能要求に収まらない場合、部品精度で頑張るより<b>組立時に調整</b>するほうが安いことがあります。</p>
<table class="tb-table">
  <tr><th>方法</th><th>例</th><th>注意</th></tr>
  <tr><td>シム (調整板)</td><td>0.05 / 0.1 / 0.2 mm のシムで隙間を合わせる</td><td>組立工数が増える、作業者依存</td></tr>
  <tr><td>長穴</td><td>取付位置を ±1 mm 調整</td><td>締付後のずれ止め (ピン・接着) が必要なことも</td></tr>
  <tr><td>調整ねじ・偏心カム</td><td>ベルト張力、位置決めの微調整</td><td>緩み止め、調整手順書</td></tr>
  <tr><td>選択組立</td><td>部品を寸法で層別し組み合わせる</td><td>互換性がなくなり保守部品で困る</td></tr>
  <tr><td>現物合わせ追加工</td><td>組立後に最終面を加工</td><td>量産には不向き</td></tr>
</table>
<div class="tb-tip"><b>3DCAD Studio</b>: <b>公差累積解析</b>で寸法チェーンを入力すると、ワーストケース・RSS・モンテカルロの結果と寄与率を比べられます。<b>干渉解析</b>で最大実体状態のモデルを確認するのも有効です。</div>`,
    points: [
      "公差は機能要求 (すき間・位置) から逆算して決める",
      "ワーストケースは全数保証、RSS とモンテカルロは統計的な見積もり",
      "寄与率 t²/Σt² の大きい寸法から公差を見直す",
      "工程能力を確認し、収まらなければ調整機構で吸収する",
    ],
    exercises: [
      {
        q: "上の例で B の公差を ±0.15 → ±0.10 にしたとき、ワーストケースと RSS の G の範囲を求めなさい。",
        a: "ワーストケース: Σt = 0.10+0.10+0.10+0.05+0.10 = 0.45 → G = <b>0.05〜0.95</b>。<br>RSS: Σt² = 0.01×4 + 0.0025 = 0.0425、√0.0425 ≈ 0.206 → G = <b>0.294〜0.706</b>。",
      },
      {
        q: "機能上 G ≥ 0.1 が必要です。元の公差 (B ±0.15) のワーストケースでは満たせますか。満たさない場合、ワーストケースで満たすにはどの公差をどれだけ減らせばよいでしょう。",
        a: "元のワーストケース下限は 0.00 で <b>満たしません</b>。Σt を 0.40 以下にする必要があり、寄与率最大の B を ±0.15 → <b>±0.05</b> にすれば Σt = 0.40、G = 0.10〜0.90 となります (または B を ±0.10、他の寸法で 0.05 削る)。",
      },
    ],
    quiz: [
      { q: "公差 ±0.1, ±0.1, ±0.2 の 3 寸法を RSS で累積すると?", choices: ["±0.40", "約 ±0.245", "±0.20"], answer: 1, explain: "√(0.01+0.01+0.04) = √0.06 ≈ 0.245。" },
      { q: "公差を厳しくする効果が最も大きい寸法は?", choices: ["寄与率の最も大きい寸法", "公称寸法の最も大きい寸法", "最も加工しやすい寸法"], answer: 0, explain: "寄与率の大きい寸法が全体のばらつきを支配します。" },
      { q: "RSS の前提として正しいのは?", choices: ["各寸法が独立にばらつき、公差が ±3σ 程度", "すべての寸法が同時に最大になる", "部品が 1 個だけ"], answer: 0, explain: "独立・正規分布・公差 = 3σ が前提です。偏りがあると外れます。" },
    ],
    lessons: ["7-1"],
  },
  {
    id: "standards",
    part: "knowhow",
    title: "【中級】規格の調べ方と使い方",
    minutes: 18,
    level: 2,
    lead: "ねじ、材料、公差、製図、安全 — 設計のあらゆる場面で規格を参照します。JIS・ISO・IEC などの規格の種類、番号の読み方、閲覧方法、法規との違いと、機械設計でよく使う JIS を整理します。",
    body: `
<h2>規格の種類</h2>
<table class="tb-table">
  <tr><th>区分</th><th>例</th><th>内容</th></tr>
  <tr><td>国際規格</td><td>ISO (国際標準化機構)、IEC (国際電気標準会議)</td><td>ISO は機械・材料・品質など広く、IEC は電気・電子</td></tr>
  <tr><td>国家規格</td><td>JIS (日本)、ANSI (米国)、DIN (ドイツ)、GB (中国)</td><td>JIS は ISO と整合化が進んでいる</td></tr>
  <tr><td>団体・業界規格</td><td>JASO (自動車)、JEM (電機工業会) など</td><td>業界固有の要求</td></tr>
  <tr><td>社内規格</td><td>設計基準、標準部品リスト、製図規定</td><td>公的規格を自社向けに絞り込み・具体化</td></tr>
</table>
<svg class="tb-chart" viewBox="0 0 520 210" role="img" aria-label="規格の階層">
<polygon points="260,20 330,70 190,70" fill="var(--tb-accent)" opacity="0.85"/>
<polygon points="190,74 330,74 390,116 130,116" fill="var(--tb-accent)" opacity="0.6"/>
<polygon points="130,120 390,120 440,156 80,156" fill="var(--tb-accent)" opacity="0.4"/>
<polygon points="80,160 440,160 490,196 30,196" fill="var(--tb-accent)" opacity="0.22"/>
<text class="mark-t" x="260" y="60" text-anchor="middle">ISO / IEC</text><text class="mark-t" x="260" y="100" text-anchor="middle">JIS・ANSI・DIN (国家規格)</text><text class="mark-t" x="260" y="143" text-anchor="middle">JASO・JEM など (団体規格)</text><text class="mark-t" x="260" y="183" text-anchor="middle">社内規格 (設計基準・標準部品)</text>
</svg>
<p class="tb-caption">図: 上ほど適用範囲が広く、下ほど自社向けに具体的。社内規格は公的規格を絞り込み・具体化したもの</p>
<h2>規格番号の読み方</h2>
<pre class="tb-pre">JIS B 1180 : 2014
│   │ │       └─ 制定・改正の年
│   │ └─────── 番号 (B の中の分類)
│   └───────── 部門記号 (B = 機械、G = 鉄鋼、H = 非鉄、Z = その他・共通)
└───────────── 規格の種類</pre>
<ul>
  <li>部門記号の例: <b>B</b> 機械、<b>C</b> 電気、<b>G</b> 鉄鋼、<b>H</b> 非鉄金属、<b>K</b> 化学、<b>Z</b> その他 (製図総則・品質など)</li>
  <li>ISO は「ISO 2768-1:1989」のように番号・部・年。JIS が ISO を翻訳した規格は、規格本文に対応国際規格が書かれている</li>
  <li><b>年版に注意</b>: 改正で記号や数値が変わることがある (例: 表面性状の記号、幾何公差の表示方式)。図面・計算書には参照した年版を書く</li>
</ul>
<h2>規格の調べ方</h2>
<ul>
  <li><b>JISC (日本産業標準調査会) のウェブサイト</b>: JIS の検索と本文の閲覧 (閲覧のみ、印刷・保存不可) ができる。利用者登録が必要</li>
  <li><b>日本規格協会 (JSA)</b>: JIS・ISO の規格票を購入できる</li>
  <li><b>JIS ハンドブック</b>: 分野ごとの主要規格をまとめた書籍。設計室に置くと便利</li>
  <li><b>メーカーカタログ</b>: ねじ・軸受などの寸法表は規格に基づく。ただし規格外の独自品番もあるので注意</li>
</ul>
<h2>法規と規格の違い</h2>
<table class="tb-table">
  <tr><th></th><th>法規 (法令)</th><th>規格</th></tr>
  <tr><td>性格</td><td>守る義務がある</td><td>原則は任意 (自主的に使う)</td></tr>
  <tr><td>例</td><td>労働安全衛生法、電気用品安全法、建築基準法</td><td>JIS、ISO、IEC</td></tr>
  <tr><td>関係</td><td colspan="2">法令が規格を引用すると、その規格は事実上の義務になる。契約・仕様書で指定された規格も守る義務が生じる</td></tr>
</table>
<svg class="tb-chart" viewBox="0 0 520 180" role="img" aria-label="法規と規格の関係">
<ellipse cx="190" cy="90" rx="140" ry="62" fill="var(--tb-bad)" opacity="0.12" stroke="var(--tb-bad)"/>
<ellipse cx="330" cy="90" rx="140" ry="62" fill="var(--tb-accent)" opacity="0.12" stroke="var(--tb-accent)"/>
<text class="lbl" x="120" y="85" text-anchor="middle" style="fill:var(--tb-bad)">法規 (強制)</text><text class="tick" x="120" y="104" text-anchor="middle">守らないと違法</text>
<text class="mark-t" x="400" y="85" text-anchor="middle">規格 (任意)</text><text class="tick" x="400" y="104" text-anchor="middle">守ると品質・互換性を示せる</text>
<text class="mark-t" x="260" y="85" text-anchor="middle">法令が引用</text><text class="mark-t" x="260" y="104" text-anchor="middle">した規格</text>
<text class="tick" x="260" y="172" text-anchor="middle">重なり: 法令が引用した規格は実質的に強制になる</text>
</svg>
<p class="tb-caption">図: 規格は本来任意だが、法令や契約で引用されると守る義務が生じる</p>
<h2>機械設計でよく使う JIS</h2>
<table class="tb-table">
  <tr><th>番号</th><th>名称 (略)</th></tr>
  <tr><td>JIS Z 8310</td><td>製図総則</td></tr>
  <tr><td>JIS B 0001</td><td>機械製図</td></tr>
  <tr><td>JIS B 0021</td><td>製品の幾何特性仕様 (GPS) — 幾何公差表示方式</td></tr>
  <tr><td>JIS B 0401</td><td>製品の幾何特性仕様 (GPS) — 長さに関わるサイズ公差の ISO コード方式 (はめあい)</td></tr>
  <tr><td>JIS B 0405</td><td>普通公差 — 第 1 部: 個々に公差の指示がない長さ寸法及び角度寸法に対する公差</td></tr>
  <tr><td>JIS B 0601</td><td>製品の幾何特性仕様 (GPS) — 表面性状: 輪郭曲線方式</td></tr>
  <tr><td>JIS B 0205</td><td>一般用メートルねじ</td></tr>
  <tr><td>JIS B 1176</td><td>六角穴付きボルト</td></tr>
  <tr><td>JIS B 1180</td><td>六角ボルト</td></tr>
  <tr><td>JIS B 1181</td><td>六角ナット</td></tr>
  <tr><td>JIS B 1301</td><td>キー及びキー溝</td></tr>
  <tr><td>JIS B 2401</td><td>O リング</td></tr>
  <tr><td>JIS G 3101</td><td>一般構造用圧延鋼材 (SS400 など)</td></tr>
  <tr><td>JIS G 4051</td><td>機械構造用炭素鋼鋼材 (S45C など)</td></tr>
  <tr><td>JIS H 4000</td><td>アルミニウム及びアルミニウム合金の板及び条</td></tr>
</table>
<p class="tb-note">名称は改正で変わることがあります。使う前に JISC で最新版の名称・内容を確認してください。</p>
<div class="tb-tip"><b>3DCAD Studio</b>: <b>標準部品</b>のねじ・ナットは規格寸法に基づいています。<b>部品表</b>に規格番号を記入しておくと、調達時の取り違えを防げます。</div>`,
    points: [
      "国際 (ISO・IEC)、国家 (JIS)、業界、社内の階層で規格を使い分ける",
      "JIS 番号は部門記号 + 番号 + 年版。参照した年版を記録する",
      "JIS は JISC のサイトで閲覧できる (購入は日本規格協会)",
      "規格は原則任意、法規は義務。法令や契約で引用されると規格も義務になる",
    ],
    exercises: [
      {
        q: "図面の注記に「普通公差 JIS B 0405-m」とあります。この注記の意味と、設計者が確認すべきことを説明しなさい。",
        a: "公差の指示がない長さ・角度寸法には JIS B 0405 の<b>中級 (m)</b> の公差を適用する、という意味です。例えば 30 超 120 以下の長さでは ±0.3 になります。確認すべきこと: 機能上重要な寸法が普通公差で足りるか (足りなければ個別に公差を記入)、加工先がその等級を理解しているか。",
      },
    ],
    quiz: [
      { q: "JIS の部門記号 G が表すのは?", choices: ["機械", "鉄鋼", "電気"], answer: 1, explain: "B = 機械、C = 電気、G = 鉄鋼、H = 非鉄金属です。" },
      { q: "規格と法規の関係で正しいのは?", choices: ["規格はすべて法的義務", "法令に引用された規格は事実上義務になる", "法規は任意"], answer: 1, explain: "規格自体は任意ですが、法令や契約で引用されると守る義務が生じます。" },
      { q: "JIS 本文を無料で閲覧できるのは?", choices: ["JISC のウェブサイト", "どこにもない", "メーカーカタログのみ"], answer: 0, explain: "JISC のサイトで閲覧できます (印刷・保存は不可)。" },
    ],
    lessons: ["4-1"],
  },
  {
    id: "reliability",
    part: "knowhow",
    title: "【上級】信頼性設計",
    minutes: 25,
    level: 3,
    lead: "「どのくらいの確率で、どのくらいの期間、壊れずに働くか」を数字で扱うのが信頼性設計です。故障率、MTBF・MTTR、アベイラビリティ、バスタブ曲線、直列・並列系の信頼度、冗長とディレーティングを学びます。",
    body: `
<h2>故障率と信頼度</h2>
<p><b>故障率 λ</b> は単位時間あたりに故障する割合です (例: 1 × 10⁻⁴ /h)。故障率が一定 (偶発故障期) なら、時間 t まで壊れない確率 = <b>信頼度 R(t)</b> は指数分布になります。</p>
<div class="tb-formula">R(t) = exp(−λt) = exp(−t / MTBF)　　MTBF = 1 / λ</div>
<p>MTBF と同じ時間だけ動かしたときの信頼度は exp(−1) ≈ 0.368 — つまり <b>MTBF まで生き残るのは約 37 %</b> です。「MTBF = 寿命」ではない点に注意します。</p>
<h2>MTBF・MTTR・アベイラビリティ</h2>
<table class="tb-table">
  <tr><th>指標</th><th>意味</th></tr>
  <tr><td>MTBF (平均故障間隔)</td><td>修理して使う装置で、故障から次の故障までの平均時間</td></tr>
  <tr><td>MTTF (平均故障時間)</td><td>修理しない部品で、故障するまでの平均時間</td></tr>
  <tr><td>MTTR (平均修復時間)</td><td>故障してから復旧するまでの平均時間</td></tr>
  <tr><td>アベイラビリティ A</td><td>使いたいときに使える時間の割合</td></tr>
</table>
<div class="tb-formula">A = MTBF / (MTBF + MTTR)</div>
<p>例: MTBF 10 000 h、MTTR 5 h → A = 10 000 / 10 005 ≈ 0.9995 (99.95 %)。年間 8 760 h のうち停止は約 4.4 h。MTTR を短くする (交換しやすい構造、予備品、診断機能) こともアベイラビリティ向上に効きます。</p>
<h2>バスタブ曲線</h2>
<svg class="tb-chart" viewBox="0 0 520 210" aria-label="バスタブ曲線">
  <line class="axis" x1="50" y1="170" x2="500" y2="170"/><line class="axis" x1="50" y1="20" x2="50" y2="170"/>
  <path d="M60,30 C90,110 120,130 170,130 L360,130 C410,130 450,110 490,35" fill="none" stroke="var(--tb-accent)" stroke-width="2.5"/>
  <line class="guide" x1="170" y1="25" x2="170" y2="170"/><line class="guide" x1="360" y1="25" x2="360" y2="170"/>
  <text class="sec" x="110" y="160" text-anchor="middle">初期故障期</text>
  <text class="sec" x="265" y="160" text-anchor="middle">偶発故障期 (λ 一定)</text>
  <text class="sec" x="430" y="160" text-anchor="middle">摩耗故障期</text>
  <text class="lbl" x="495" y="190" text-anchor="end">時間</text>
  <text class="lbl" x="56" y="16">故障率 λ</text>
</svg>
<table class="tb-table">
  <tr><th>期間</th><th>原因</th><th>対策</th></tr>
  <tr><td>初期故障期</td><td>製造不良、組立ミス、材料欠陥</td><td>出荷前のエージング (スクリーニング)、工程管理</td></tr>
  <tr><td>偶発故障期</td><td>突発的な過負荷、偶然の故障</td><td>ディレーティング、冗長、保護回路</td></tr>
  <tr><td>摩耗故障期</td><td>疲労、摩耗、劣化 (軸受、ベルト、電解コンデンサ)</td><td>寿命計算、定期交換 (予防保全)</td></tr>
</table>
<h2>直列系と並列系</h2>
<div class="tb-formula">直列: R<sub>s</sub> = Π R<sub>i</sub>　　並列: R<sub>p</sub> = 1 − Π (1 − R<sub>i</sub>)</div>
<svg class="tb-chart" viewBox="0 0 520 170" aria-label="直列系と並列系">
  <text class="lbl" x="20" y="25">直列</text>
  <line class="guide" x1="20" y1="50" x2="240" y2="50"/>
  <rect x="45" y="35" width="40" height="30" fill="var(--tb-bg, #fff)" stroke="var(--tb-accent)" stroke-width="2"/>
  <rect x="110" y="35" width="40" height="30" fill="var(--tb-bg, #fff)" stroke="var(--tb-accent)" stroke-width="2"/>
  <rect x="175" y="35" width="40" height="30" fill="var(--tb-bg, #fff)" stroke="var(--tb-accent)" stroke-width="2"/>
  <text class="tick" x="130" y="95" text-anchor="middle">1 つでも壊れると停止</text>
  <text class="lbl" x="280" y="25">並列 (冗長)</text>
  <line class="guide" x1="280" y1="80" x2="320" y2="80"/><line class="guide" x1="320" y1="50" x2="320" y2="110"/>
  <line class="guide" x1="420" y1="50" x2="420" y2="110"/><line class="guide" x1="420" y1="80" x2="460" y2="80"/>
  <line class="guide" x1="320" y1="50" x2="420" y2="50"/><line class="guide" x1="320" y1="110" x2="420" y2="110"/>
  <rect x="350" y="35" width="40" height="30" fill="var(--tb-bg, #fff)" stroke="var(--tb-accent)" stroke-width="2"/>
  <rect x="350" y="95" width="40" height="30" fill="var(--tb-bg, #fff)" stroke="var(--tb-accent)" stroke-width="2"/>
  <text class="tick" x="370" y="150" text-anchor="middle">全部壊れるまで動く</text>
</svg>
<p>例: 単体 MTBF 10 000 h、使用時間 1 000 h → R = exp(−0.1) ≈ 0.905。</p>
<table class="tb-table">
  <tr><th>構成</th><th>信頼度 (1 000 h)</th></tr>
  <tr><td>単体</td><td>0.905</td></tr>
  <tr><td>3 個直列</td><td>0.905³ ≈ 0.741</td></tr>
  <tr><td>2 個並列</td><td>1 − 0.095² ≈ 0.991</td></tr>
</table>
<p>部品点数が多い直列系ほど信頼度は下がります。部品を減らすこと自体が信頼性向上になります。</p>
<div data-widget="reliability"></div>
<h2>冗長とディレーティング</h2>
<ul>
  <li><b>冗長 (並列化)</b>: ポンプ 2 台、電源 2 系統、センサ 2 重化など。ただし<b>共通原因故障</b> (同じ電源・同じ設置場所・同じ設計ミス) があると両方同時に壊れ、計算どおりにならない</li>
  <li><b>待機冗長と稼働冗長</b>: 予備を止めておくか、常に一緒に動かすか。待機冗長は切替器の信頼性が鍵</li>
  <li><b>ディレーティング</b>: 定格に対して余裕を持って使うこと。電子部品なら電圧・電流・温度を定格の 50〜80 % 程度に抑える、機械部品なら許容荷重に安全率を持たせる。負荷を下げると故障率は大きく下がる</li>
</ul>
<div class="tb-tip"><b>3DCAD Studio</b>: <b>応力解析・PDF レポート</b>で各部品の応力と安全率を確認し、ディレーティング (余裕) が十分かを記録しましょう。<b>部品表</b>で直列に並ぶ重要部品の数を把握すると、システム信頼度の見積もりに使えます。</div>`,
    points: [
      "R(t) = exp(−t/MTBF)。MTBF まで生き残るのは約 37 % で、寿命ではない",
      "アベイラビリティ A = MTBF / (MTBF + MTTR)。修理しやすさも効く",
      "直列は ΠRi で下がり、並列は 1 − Π(1−Ri) で上がる",
      "冗長は共通原因故障に注意。ディレーティングで故障率を下げる",
    ],
    exercises: [
      {
        q: "MTBF 50 000 h の装置を 1 年 (8 760 h) 連続運転したときの信頼度を求めなさい。また MTTR 4 h のときのアベイラビリティは?",
        a: "R = exp(−8 760 / 50 000) = exp(−0.1752) ≈ <b>0.839</b> (約 84 %)。<br>A = 50 000 / 50 004 ≈ <b>0.99992</b> (99.992 %)。",
      },
      {
        q: "信頼度 0.9 の部品を 2 個並列にした系を、さらに信頼度 0.99 の切替器と直列につなぎます。系全体の信頼度は?",
        a: "並列部: 1 − (0.1)² = 0.99。直列: 0.99 × 0.99 = <b>0.9801</b>。切替器の信頼度が冗長の効果を打ち消すことがわかります。",
      },
    ],
    quiz: [
      { q: "MTBF 時間だけ運転したとき、壊れずに動いている確率は (故障率一定)?", choices: ["約 37 %", "50 %", "100 %"], answer: 0, explain: "R = exp(−1) ≈ 0.368 です。" },
      { q: "信頼度 0.9 の部品 3 個の直列系の信頼度は?", choices: ["0.729", "0.9", "0.999"], answer: 0, explain: "0.9³ = 0.729。" },
      { q: "バスタブ曲線の初期故障期の対策は?", choices: ["定期交換", "出荷前のエージング (スクリーニング)", "何もしない"], answer: 1, explain: "初期不良を出荷前にふるい落とします。定期交換は摩耗故障期の対策です。" },
    ],
    lessons: ["9-2"],
  },
  {
    id: "failures",
    part: "knowhow",
    title: "【上級】失敗事例に学ぶ",
    minutes: 25,
    level: 3,
    lead: "機械設計の失敗の多くは、新しい未知の現象ではなく、知られた原因の見落としから起きます。一般化した典型的な失敗事例 10 件を「現象・原因・対策・教訓」で整理し、自分の設計をチェックする目を養います。",
    body: `
<h2>失敗から学ぶ姿勢</h2>
<p>ここで紹介する事例は、特定の企業や事故ではなく、多くの現場で繰り返し起きている典型的なパターンを一般化したものです。大切なのは「誰が悪いか」ではなく「<b>なぜ見落としたか、どの段階で気づけたか</b>」です。</p>
<ol class="tb-flow">
  <li>現象 (何が起きたか)</li><li>原因 (物理的な理由)</li><li>対策 (直す)</li><li>教訓 (次に活かす)</li>
</ol>
<h2>1. 疲労破壊</h2>
<table class="tb-table">
  <tr><th>現象</th><td>静的強度は十分なはずの軸が、数か月の運転後に段付き部で折損</td></tr>
  <tr><th>原因</th><td>段付き部の隅 R が小さく応力集中、回転曲げの繰返し応力。静的な安全率だけで判断</td></tr>
  <tr><th>対策</th><td>隅 R を大きく、逃げ溝の形状変更、表面硬化、疲労限度に基づく再計算</td></tr>
  <tr><th>教訓</th><td>繰返し荷重がかかる部品は必ず疲労で評価。破面のビーチマークは疲労のサイン</td></tr>
</table>
<svg class="tb-chart" viewBox="0 0 520 200" role="img" aria-label="段付き軸の隅 R と疲労き裂">
<path d="M30,60 L130,60 L130,80 L230,80 L230,120 L130,120 L130,140 L30,140 Z" fill="var(--tb-surface-2)" stroke="currentColor" stroke-width="1.5"/>
<polyline points="131,82 137,90 133,96" fill="none" stroke="var(--tb-bad)" stroke-width="2"/>
<circle cx="130" cy="80" r="9" fill="none" stroke="var(--tb-bad)" stroke-dasharray="3 2"/>
<text class="lbl" x="130" y="175" text-anchor="middle" style="fill:var(--tb-bad)">隅 R が小さい: 応力集中 → き裂</text>
<path d="M290,60 L380,60 A20,20 0 0 0 400,80 L490,80 L490,120 L400,120 A20,20 0 0 0 380,140 L290,140 Z" fill="var(--tb-surface-2)" stroke="currentColor" stroke-width="1.5"/>
<text class="lbl" x="390" y="175" text-anchor="middle" style="fill:var(--tb-good)">隅 R を大きく: 応力集中を緩和</text>
<text class="tick" x="260" y="30" text-anchor="middle">回転曲げ (繰返し応力) を受ける軸</text>
</svg>
<p class="tb-caption">図: 事例 1。段付き部の隅 R が小さいと、繰返し荷重で隅からき裂が進む (破面にビーチマーク)</p>
<h2>2. 熱膨張</h2>
<table class="tb-table">
  <tr><th>現象</th><td>アルミフレームに鋼のリニアガイドを固定した装置が、夏場に動きが渋くなる</td></tr>
  <tr><th>原因</th><td>線膨張係数の差 (Al 約 23 × 10⁻⁶ /K、鋼 約 12 × 10⁻⁶ /K)。長さ 500 mm、ΔT 40 K で約 0.23 mm の差</td></tr>
  <tr><th>対策</th><td>片側固定・片側フリー、同材質化、温度範囲の再定義</td></tr>
  <tr><th>教訓</th><td>異種材料を長い距離で拘束しない。使用温度範囲を仕様に明記する</td></tr>
</table>
<svg class="tb-chart" viewBox="0 0 520 210" role="img" aria-label="異種材料の拘束と片側フリー">
<rect x="40" y="40" width="440" height="18" fill="var(--tb-surface-2)" stroke="var(--tb-text-3)"/><text class="tick" x="260" y="54" text-anchor="middle">アルミフレーム (23 × 10⁻⁶ /K)</text>
<rect x="60" y="58" width="400" height="12" fill="none" stroke="var(--tb-accent)" stroke-width="2"/>
<rect x="60" y="54" width="10" height="20" fill="var(--tb-bad)"/><rect x="450" y="54" width="10" height="20" fill="var(--tb-bad)"/>
<text class="lbl" x="260" y="92" text-anchor="middle" style="fill:var(--tb-bad)">両端固定: 膨張差 0.22 mm が逃げられず、反り・渋り</text>
<rect x="40" y="120" width="440" height="18" fill="var(--tb-surface-2)" stroke="var(--tb-text-3)"/><text class="tick" x="260" y="134" text-anchor="middle">アルミフレーム</text>
<rect x="60" y="138" width="400" height="12" fill="none" stroke="var(--tb-accent)" stroke-width="2"/>
<rect x="60" y="134" width="10" height="20" fill="var(--tb-bad)"/>
<rect x="440" y="136" width="26" height="16" rx="8" fill="none" stroke="var(--tb-good)" stroke-width="2"/>
<circle cy="144" r="4" fill="var(--tb-good)"><animate attributeName="cx" values="447;459;447" dur="3s" repeatCount="indefinite"/></circle>
<text class="lbl" x="260" y="175" text-anchor="middle" style="fill:var(--tb-good)">片側固定 + 長穴: 伸び縮みを逃がす</text>
<text class="tick" x="260" y="200" text-anchor="middle">鋼のリニアガイド 500 mm、ΔT 40 K のとき 500 × 11 × 10⁻⁶ × 40 ≈ 0.22 mm</text>
</svg>
<p class="tb-caption">図: 事例 2。線膨張係数の違う材料を長い距離で両端固定しない。片側は長穴などで動けるようにする (緑の点が温度変化で動く)</p>
<h2>3. 電食 (異種金属接触腐食)</h2>
<table class="tb-table">
  <tr><th>現象</th><td>屋外装置のアルミ板とステンレスねじの周りが白く腐食し、ねじが緩む</td></tr>
  <tr><th>原因</th><td>電位差のある金属が水分を介して接触し、卑な金属 (アルミ) が溶ける</td></tr>
  <tr><th>対策</th><td>絶縁ワッシャ・スリーブ、同系材料、塗装・シール、水がたまらない形状</td></tr>
  <tr><th>教訓</th><td>屋外・湿潤環境では材料の組合せを確認。「ステンレスなら錆びない」は思い込み</td></tr>
</table>
<h2>4. ボルトの緩み</h2>
<table class="tb-table">
  <tr><th>現象</th><td>振動のある装置でボルトが脱落</td></tr>
  <tr><th>原因</th><td>軸直角方向の繰返し滑りによる回転緩み、締付力不足、座面の陥没 (へたり)</td></tr>
  <tr><th>対策</th><td>適正トルク管理、締付力を上げられる強度区分、座面の面圧確認、ねじロック剤、緩み止めナット、ずれをピンで受ける</td></tr>
  <tr><th>教訓</th><td>ばね座金だけに頼らない。ボルトにせん断を受けさせず、摩擦かピンで受ける</td></tr>
</table>
<h2>5. 樹脂のクリープ</h2>
<table class="tb-table">
  <tr><th>現象</th><td>樹脂ケースのねじ締結部が半年後に緩む、スナップフィットが外れやすくなる</td></tr>
  <tr><th>原因</th><td>一定応力のもとで時間とともに変形が進むクリープ・応力緩和。高温ほど顕著</td></tr>
  <tr><th>対策</th><td>金属インサート、ボス周りの応力を下げる、カラーで締付力を受ける、クリープ特性の良い材料</td></tr>
  <tr><th>教訓</th><td>樹脂は短時間の強度データだけで判断しない。温度と時間を条件に入れる</td></tr>
</table>
<h2>6. 共振</h2>
<table class="tb-table">
  <tr><th>現象</th><td>特定の回転数でだけカバーが大きく振動し、騒音と取付部の割れ</td></tr>
  <tr><th>原因</th><td>カバーの固有振動数がモーター回転数 (または整数倍) と一致</td></tr>
  <tr><th>対策</th><td>リブ・曲げで剛性を上げ固有振動数をずらす、制振材、運転回転数の変更</td></tr>
  <tr><th>教訓</th><td>加振源の周波数と主要部品の固有振動数を設計段階で比較する</td></tr>
</table>
<h2>7. 誤組 (組立ミス)</h2>
<table class="tb-table">
  <tr><th>現象</th><td>左右対称に見える部品が逆向きに組まれ、出荷後に機能不良</td></tr>
  <tr><th>原因</th><td>わずかに非対称な形状、見分けがつかない、組立手順書頼み</td></tr>
  <tr><th>対策</th><td>完全対称にするか、明確に非対称にして逆向きでは組めない形にする (ポカヨケ)</td></tr>
  <tr><th>教訓</th><td>「注意して組む」は対策ではない。間違えられない形にする</td></tr>
</table>
<h2>8. 公差累積</h2>
<table class="tb-table">
  <tr><th>現象</th><td>部品は全数図面どおりなのに、一部の組立品で蓋が閉まらない</td></tr>
  <tr><th>原因</th><td>個々の公差は守られていても、寸法チェーンの累積で干渉</td></tr>
  <tr><th>対策</th><td>累積計算 (ワーストケース・RSS)、寄与率の大きい寸法の公差見直し、調整機構</td></tr>
  <tr><th>教訓</th><td>「全部品合格 = 組立品合格」ではない。機能寸法のループを必ず計算</td></tr>
</table>
<h2>9. 腐食</h2>
<table class="tb-table">
  <tr><th>現象</th><td>溶接構造の内側やすき間から錆が進み、外観では分からないまま板厚が減少</td></tr>
  <tr><th>原因</th><td>水がたまる袋構造、すき間腐食、塗装が届かない内面</td></tr>
  <tr><th>対策</th><td>水抜き穴、すき間をなくす・シールする、めっき・塗装の仕様見直し</td></tr>
  <tr><th>教訓</th><td>水・ほこりがたまる所を形状で作らない。環境条件 (屋外・薬品・塩分) を仕様に書く</td></tr>
</table>
<h2>10. 想定外の使い方</h2>
<table class="tb-table">
  <tr><th>現象</th><td>ハンドルに足をかけて乗る、カバーを踏み台にするなどで破損・けが</td></tr>
  <tr><th>原因</th><td>設計者が想定した「正しい使い方」だけで荷重を決めた</td></tr>
  <tr><th>対策</th><td>予見可能な誤使用を洗い出し、強度を持たせるか、乗れない形状・警告表示</td></tr>
  <tr><th>教訓</th><td>使う人は取扱説明書を読まない前提で、予見可能な誤使用までを設計条件にする</td></tr>
</table>
<h2>まとめ — 設計チェックリスト</h2>
<table class="tb-table">
  <tr><th>観点</th><th>確認すること</th><th>関連事例</th></tr>
  <tr><td>荷重</td><td>繰返し・衝撃・誤使用の荷重を含めたか</td><td>1, 10</td></tr>
  <tr><td>温度・時間</td><td>温度範囲と長期の変化 (膨張・クリープ) を考えたか</td><td>2, 5</td></tr>
  <tr><td>環境</td><td>水・塩分・異種金属の組合せを確認したか</td><td>3, 9</td></tr>
  <tr><td>振動</td><td>固有振動数と緩み対策を確認したか</td><td>4, 6</td></tr>
  <tr><td>寸法・組立</td><td>公差累積と誤組防止を確認したか</td><td>7, 8</td></tr>
</table>
<div class="tb-tip"><b>3DCAD Studio</b>: <b>公差累積解析</b> (事例 8)、<b>干渉解析</b> (事例 7・8)、<b>応力解析・PDF レポート</b> (事例 1・10) で、設計段階に気づける失敗を減らせます。対策の内容は<b>改訂履歴</b>に理由とともに残しましょう。</div>`,
    points: [
      "失敗の多くは既知の原因の見落とし。典型パターンを知ることが予防になる",
      "疲労・熱膨張・クリープは「時間・繰返し・温度」の視点で見落としやすい",
      "電食・腐食・共振・緩みは環境と振動の条件を仕様に書くことで防ぐ",
      "誤組・公差累積・誤使用は「注意」ではなく形と計算で防ぐ",
    ],
    exercises: [
      {
        q: "長さ 500 mm のアルミフレーム (α = 23 × 10⁻⁶ /K) と鋼レール (α = 11.7 × 10⁻⁶ /K) を両端で固定しました。温度が 40 K 上がったときの伸びの差はいくらですか。",
        a: "ΔL<sub>Al</sub> = 500 × 23×10⁻⁶ × 40 = 0.46 mm、ΔL<sub>鋼</sub> = 500 × 11.7×10⁻⁶ × 40 = 0.234 mm。差は <b>約 0.23 mm</b>。両端固定ではこの差が大きな熱応力やガイドのこじれになるため、片側をフリーにします。",
      },
    ],
    quiz: [
      { q: "破面にビーチマーク (貝殻状の模様) が見られた。考えられる破壊は?", choices: ["疲労破壊", "静的な過荷重", "腐食のみ"], answer: 0, explain: "ビーチマークはき裂が少しずつ進んだ疲労破壊の特徴です。" },
      { q: "誤組の対策として最も有効なのは?", choices: ["作業者に注意を促す", "逆向きでは組めない形状にする", "検査を増やす"], answer: 1, explain: "形状で間違いを不可能にするポカヨケが根本対策です。" },
      { q: "アルミ板をステンレスねじで屋外に固定するときの注意は?", choices: ["特になし", "電食に注意し絶縁や防水を行う", "ねじを長くする"], answer: 1, explain: "電位差のある金属が水分を介して接触すると、アルミ側が腐食します。" },
    ],
    lessons: ["9-1", "9-3"],
  },
];
