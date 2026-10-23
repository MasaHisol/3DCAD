import type { TextChapter } from "../types";

// Machine safety design, in depth. Builds on "safety-design" (overview),
// "reliability", "failures", "standards", "error-design" and "maintainability".
// Standards are summarised for learning; always consult the current original text.

const NOTE = `<div class="tb-tip"><b>規格について</b>: この章の規格の内容は学習用に要約したものです。版の改訂で数値や手順が変わることがあります。実際の設計では必ず最新の規格原文 (ISO / IEC / JIS) と、適用される法令を確認してください。</div>`;

export const SAFETY2: TextChapter[] = [
  // ------------------------------------------------------------------ 1
  {
    id: "risk-assessment",
    part: "knowhow",
    title: "リスクアセスメントの進め方 (ISO 12100)",
    minutes: 20,
    level: 2,
    lead: "「安全設計とリスクアセスメント」で概要を学びました。ここでは ISO 12100 に沿って、機械の制限の決め方、危険源の洗い出し、リスク見積もりの要素、記録の残し方まで、実務の進め方を詳しく見ます。",
    body: `
<h2>全体の流れ — 反復するプロセス</h2>
<p>ISO 12100 (JIS B 9700) では、<b>リスクアセスメント</b> = リスク分析 (機械の制限の決定・危険源の同定・リスク見積もり) + リスク評価 と定義し、許容できなければ<b>リスク低減</b>を行って再び見積もります。1 回で終わる作業ではなく、設計の進行に合わせて何度も回します。</p>
<svg class="tb-chart" viewBox="0 0 520 250" role="img" aria-label="ISO 12100 のリスクアセスメントの流れ">
<g class="k-shadow">
<rect x="150" y="10" width="220" height="30" rx="6" style="fill:var(--tb-surface)"/><rect x="150" y="10" width="220" height="30" rx="6" style="fill:var(--tb-accent);stroke:var(--tb-accent)" fill-opacity="0.16" stroke-width="1.4"/><rect x="150" y="55" width="220" height="30" rx="6" style="fill:var(--tb-surface)"/><rect x="150" y="55" width="220" height="30" rx="6" style="fill:var(--tb-accent);stroke:var(--tb-accent)" fill-opacity="0.16" stroke-width="1.4"/><rect x="150" y="100" width="220" height="30" rx="6" style="fill:var(--tb-surface)"/><rect x="150" y="100" width="220" height="30" rx="6" style="fill:var(--tb-accent);stroke:var(--tb-accent)" fill-opacity="0.16" stroke-width="1.4"/><rect x="150" y="145" width="220" height="30" rx="6" style="fill:var(--tb-surface)"/><rect x="150" y="145" width="220" height="30" rx="6" style="fill:var(--tb-accent);stroke:var(--tb-accent)" fill-opacity="0.16" stroke-width="1.4"/>
<polygon points="260,188 336,210 260,232 184,210" style="fill:var(--tb-surface)"/>
<polygon points="260,188 336,210 260,232 184,210" style="fill:var(--tb-warn);stroke:var(--tb-warn)" fill-opacity="0.22" stroke-width="1.6"/>
<rect x="398" y="98" width="112" height="54" rx="6" style="fill:var(--tb-surface)"/><rect x="398" y="98" width="112" height="54" rx="6" style="fill:var(--tb-bad);stroke:var(--tb-bad)" fill-opacity="0.16" stroke-width="1.4"/>
<rect x="10" y="196" width="98" height="28" rx="6" style="fill:var(--tb-surface)"/><rect x="10" y="196" width="98" height="28" rx="6" style="fill:var(--tb-good);stroke:var(--tb-good)" fill-opacity="0.16" stroke-width="1.4"/>
</g>
<rect x="150" y="10" width="5" height="30" style="fill:var(--tb-accent)"/><rect x="150" y="55" width="5" height="30" style="fill:var(--tb-accent)"/>
<rect x="150" y="100" width="5" height="30" style="fill:var(--tb-accent)"/><rect x="150" y="145" width="5" height="30" style="fill:var(--tb-accent)"/>
<text class="lbl" x="262" y="30" text-anchor="middle">1. 機械の制限の決定</text>
<text class="lbl" x="262" y="75" text-anchor="middle">2. 危険源の同定</text>
<text class="lbl" x="262" y="120" text-anchor="middle">3. リスクの見積もり</text>
<text class="lbl" x="262" y="165" text-anchor="middle">4. リスクの評価</text>
<text class="mark-t" x="260" y="214" text-anchor="middle">許容可能?</text>
<line x1="260" y1="40" x2="260" y2="53" style="stroke:var(--k-line-2)" stroke-width="1.5" marker-end="url(#k-arrow)"/><line x1="260" y1="85" x2="260" y2="98" style="stroke:var(--k-line-2)" stroke-width="1.5" marker-end="url(#k-arrow)"/><line x1="260" y1="130" x2="260" y2="143" style="stroke:var(--k-line-2)" stroke-width="1.5" marker-end="url(#k-arrow)"/><line x1="260" y1="175" x2="260" y2="186" style="stroke:var(--k-line-2)" stroke-width="1.5" marker-end="url(#k-arrow)"/>
<path d="M336,210 L455,210 L455,154" fill="none" style="stroke:var(--tb-bad)" stroke-width="2" marker-end="url(#k-arrow-red)"/>
<text class="k-bad-t" x="390" y="203" text-anchor="middle">いいえ</text>
<text class="lbl" x="454" y="121" text-anchor="middle">5. リスク低減</text><text class="tick" x="454" y="139" text-anchor="middle">3 ステップ</text>
<path d="M455,98 L455,25 L374,25" fill="none" style="stroke:var(--tb-accent)" stroke-width="2" marker-end="url(#k-arrow-blue)"/>
<text class="tick" x="462" y="65">再検討</text>
<line x1="184" y1="210" x2="111" y2="210" style="stroke:var(--tb-good)" stroke-width="2" marker-end="url(#k-arrow-green)"/>
<text class="k-good-t" x="147" y="203" text-anchor="middle">はい</text>
<text class="mark-t" x="59" y="214" text-anchor="middle">文書化して終了</text>
</svg>
<p class="tb-caption">図: リスク低減策を加えたら、新しい危険源 (例: ガードによる挟まれ) が生まれていないかも含めて、最初の段階から見直す</p>

<h2>1. 機械の制限を決める</h2>
<table class="tb-table">
  <tr><th>使用上の制限</th><td>意図する使用、<b>合理的に予見可能な誤使用</b>、操作者の熟練度・年齢・利き手、ライフサイクルの全段階 (運搬・据付・調整・段取り・清掃・保全・解体)</td></tr>
  <tr><th>空間上の制限</th><td>可動範囲、作業者の位置・動線、保全のためのスペース、周囲の設備</td></tr>
  <tr><th>時間上の制限</th><td>寿命、消耗部品の交換周期、点検周期</td></tr>
  <tr><th>その他</th><td>環境 (温度・湿度・屋外)、扱う材料 (粉じん・可燃物)、電源の条件</td></tr>
</table>
<p>事故の多くは<b>通常運転以外</b> — 段取り替え・詰まりの除去・清掃・保全 — で起きています。運転モードごとに作業を書き出すのがコツです。</p>

<h2>2. 危険源を漏れなく洗い出す</h2>
<p>ISO 12100 の附属書には危険源の一覧 (機械的・電気的・熱的・騒音・振動・放射・材料/物質・人間工学・環境など) があり、これをチェックリストとして使います。機械的危険源は「何が人にどう当たるか」で考えます。</p>
<table class="tb-table">
  <tr><th>現象</th><th>機械要素の例</th></tr>
  <tr><td>押しつぶし・挟まれ</td><td>プレスのラム、昇降テーブルと床、閉まる扉</td></tr>
  <tr><td>せん断</td><td>すれ違う 2 部品の縁 (リンク、カッター)</td></tr>
  <tr><td>巻き込まれ</td><td>回転軸・カップリング、ベルトとプーリの噛み込み側、ローラの間</td></tr>
  <tr><td>切れ・刺さり</td><td>刃物、板金のばり、とがった角</td></tr>
  <tr><td>衝突・はね飛ばし</td><td>ロボットアーム、飛散する工具・ワーク</td></tr>
  <tr><td>高圧流体の噴出</td><td>油圧ホースの破裂、エア配管の外れ</td></tr>
</table>
<p>作業ごとに「危険源 × 危険区域 × 危険事象 (何をきっかけに危害になるか)」を表にします。</p>

<h2>3. リスクの見積もり — 4 つの要素</h2>
<p>ISO 12100 では、リスクを<b>危害のひどさ</b>と<b>発生確率</b>の組合せとし、発生確率をさらに 3 つに分けて考えます。</p>
<svg class="tb-chart" viewBox="0 0 520 252" role="img" aria-label="手送りプレスで見るリスクの 4 要素">
<rect class="k-ground" x="10" y="230" width="300" height="10"/><line class="k-edge" x1="10" y1="230" x2="310" y2="230"/>
<rect x="176" y="136" width="70" height="34" style="fill:var(--tb-bad)" opacity="0.16"/>
<g class="k-shadow">
<rect class="k-part" x="150" y="196" width="150" height="34" rx="3"/>
<rect class="k-part" x="258" y="40" width="42" height="160" rx="4"/>
<rect class="k-part" x="150" y="34" width="150" height="44" rx="7"/>
<rect class="k-alu" x="180" y="78" width="62" height="48" rx="2"/>
<rect class="k-part" x="186" y="126" width="50" height="10" rx="1"/>
<rect class="k-part" x="176" y="176" width="70" height="20" rx="1"/>
<rect class="k-alu" x="184" y="170" width="54" height="6"/>
<rect class="k-yellow" x="128" y="218" width="30" height="12" rx="3"/>
</g>
<rect class="k-hazard" x="150" y="196" width="150" height="7"/>
<line class="k-force" x1="168" y1="86" x2="168" y2="124"/>
<g transform="translate(108 230) scale(-1 1)">
<path d="M-6,-118 Q-40,-104 -78,-72" fill="none" style="stroke:var(--k-person-2)" stroke-width="9"/>
<path class="k-person" d="M-12,-128 Q0,-134 12,-128 Q16,-126 16,-118 L15,-72 L11,-70 L10,-2 L2,0 L0,-60 L-2,0 L-10,-2 L-11,-70 L-15,-72 L-16,-118 Q-16,-126 -12,-128 Z"/>
<circle class="k-skin" cx="0" cy="-142" r="11"/>
<circle class="k-skin" cx="-79" cy="-72" r="5"/>
<rect x="-12" y="-4" width="11" height="5" rx="2" fill="#2a2f38"/><rect x="2" y="-4" width="13" height="5" rx="2" fill="#2a2f38"/>
</g>
<g class="k-shadow">
<rect class="k-panel" x="322" y="14" width="192" height="46" rx="7"/><rect class="k-panel" x="322" y="68" width="192" height="46" rx="7"/>
<rect class="k-panel" x="322" y="122" width="192" height="46" rx="7"/><rect class="k-panel" x="322" y="176" width="192" height="46" rx="7"/>
</g>
<circle class="k-badge" cx="340" cy="37" r="11" style="fill:var(--tb-bad)"/><text class="k-badge-t" x="340" y="41" text-anchor="middle">S</text>
<circle class="k-badge" cx="340" cy="91" r="11" style="fill:var(--tb-warn)"/><text class="k-badge-t" x="340" y="95" text-anchor="middle">F</text>
<circle class="k-badge" cx="340" cy="145" r="11" style="fill:var(--tb-warn)"/><text class="k-badge-t" x="340" y="149" text-anchor="middle">O</text>
<circle class="k-badge" cx="340" cy="199" r="11" style="fill:var(--tb-warn)"/><text class="k-badge-t" x="340" y="203" text-anchor="middle">P</text>
<text class="lbl" x="358" y="33">危害のひどさ</text><text class="k-note" x="358" y="50">指の押しつぶし・切断 (重傷)</text>
<text class="lbl" x="358" y="87">さらされる頻度</text><text class="k-note" x="358" y="104">1 サイクルごとに手を入れる</text>
<text class="lbl" x="358" y="141">危険事象の発生確率</text><text class="k-note" x="358" y="158">ペダルの誤踏み・二度打ち</text>
<text class="lbl" x="358" y="195">回避の可能性</text><text class="k-note" x="358" y="212">下降は速く、ほぼ回避不能</text>
<path class="k-thin" d="M322,37 L262,37 L210,150"/><circle cx="210" cy="152" r="3" style="fill:var(--tb-bad)"/>
<path class="k-thin" d="M322,91 L120,91 L112,96"/>
<path class="k-thin" d="M322,145 L306,145 L306,212 L160,224"/>
<path class="k-thin" d="M322,199 L312,199 L312,104 L244,104"/>
<text class="k-title" x="14" y="24">リスク = S × (F・O・P)</text>
</svg>
<p class="tb-caption">図: 手送りプレスで見るリスクの要素。ひどさ (S) は危険源の性質で決まり、発生確率は F・O・P の 3 つに分けて考える。見積もり方法 (マトリクス、リスクグラフ、点数法) は規格で 1 つに決められておらず、社内で手法を定めて一貫して使う</p>
<h3>点数法の例</h3>
<p>社内で使われる点数法の一例です (点数の付け方は会社ごとに異なります)。</p>
<table class="tb-table">
  <tr><th>要素</th><th>1 点</th><th>2 点</th><th>4 点</th><th>6 点 / 10 点</th></tr>
  <tr><td>ひどさ</td><td>軽傷 (休業なし)</td><td>休業を伴う</td><td>後遺障害</td><td>10: 死亡</td></tr>
  <tr><td>頻度</td><td>年数回</td><td>月数回</td><td>毎日</td><td>6: 常時</td></tr>
  <tr><td>回避</td><td>容易</td><td>可能</td><td>困難</td><td>—</td></tr>
</table>
<p>例: 合計点で「〜5: 許容 / 6〜9: 低減を検討 / 10〜: 直ちに低減」と決めます。足し算か掛け算か、閾値をどこに置くかは、過去の事故と照らして社内で校正します。</p>
<h3>リスクグラフ</h3>
<p>分岐をたどってリスクの水準を決めるのがリスクグラフです。制御系の要求性能 (PL) を決める ISO 13849-1 のリスクグラフが代表例で、「制御システムの安全」の章で扱います。</p>

<h2>見積もりの完全な例 — 手送りプレス</h2>
<p>上の図の手送りプレス (作業者が 1 枚ずつ板を型の上に置き、足踏みペダルで打つ) を、点数法とマトリクスの両方で見積もってみます。</p>
<table class="tb-table">
  <tr><th>手順</th><th>内容</th></tr>
  <tr><td>① 作業の特定</td><td>通常運転: 型への材料の出し入れ (1 日 数百回)。ほかに型交換、くず除去、清掃を別の行として扱う</td></tr>
  <tr><td>② 危険事象</td><td>手が型の間にあるときにラムが下降する (ペダルの誤踏み、クラッチ・ブレーキの不具合による二度打ち)</td></tr>
  <tr><td>③ 点数 (対策前)</td><td>ひどさ 4 (指の切断 = 後遺障害) + 頻度 6 (常時) + 回避 4 (困難) = <b>14 点 → 直ちに低減</b></td></tr>
  <tr><td>④ 低減策</td><td>第 1 段階: 型の開口を指が入らない狭さにできないか、送り装置で手を入れずに済まないか検討 → 製品形状の都合で不可と記録。第 2 段階: 側面・後面を固定式ガード、前面をライトカーテン (PLr は「制御システムの安全」の章で決める)</td></tr>
  <tr><td>⑤ 再見積もり</td><td>ひどさは 4 のまま。手が入ればラムが止まるので、危害に至る確率は「安全機能が故障したとき」だけになる → マトリクス上で右から左へ移る</td></tr>
  <tr><td>⑥ 新しい危険源</td><td>ライトカーテンの外から中に体が入れないか (すり抜け)、ガードと機械の間の挟まれはないか — 対策が生んだ危険源も行を追加して評価する</td></tr>
</table>
<svg class="tb-chart" viewBox="0 0 520 226" role="img" aria-label="リスクマトリクスでの対策前後の比較">
<text class="k-title" x="14" y="20">リスクマトリクス (例)</text>
<rect x="130" y="30" width="70" height="36" style="fill:var(--tb-warn);stroke:var(--tb-surface)" fill-opacity="0.22" stroke-width="2"/><rect x="200" y="30" width="70" height="36" style="fill:var(--tb-warn);stroke:var(--tb-surface)" fill-opacity="0.22" stroke-width="2"/><rect x="270" y="30" width="70" height="36" style="fill:var(--tb-bad);stroke:var(--tb-surface)" fill-opacity="0.3" stroke-width="2"/><rect x="340" y="30" width="70" height="36" style="fill:var(--tb-bad);stroke:var(--tb-surface)" fill-opacity="0.3" stroke-width="2"/><rect x="130" y="66" width="70" height="36" style="fill:var(--tb-good);stroke:var(--tb-surface)" fill-opacity="0.22" stroke-width="2"/><rect x="200" y="66" width="70" height="36" style="fill:var(--tb-warn);stroke:var(--tb-surface)" fill-opacity="0.22" stroke-width="2"/><rect x="270" y="66" width="70" height="36" style="fill:var(--tb-warn);stroke:var(--tb-surface)" fill-opacity="0.22" stroke-width="2"/><rect x="340" y="66" width="70" height="36" style="fill:var(--tb-bad);stroke:var(--tb-surface)" fill-opacity="0.3" stroke-width="2"/><rect x="130" y="102" width="70" height="36" style="fill:var(--tb-good);stroke:var(--tb-surface)" fill-opacity="0.22" stroke-width="2"/><rect x="200" y="102" width="70" height="36" style="fill:var(--tb-good);stroke:var(--tb-surface)" fill-opacity="0.22" stroke-width="2"/><rect x="270" y="102" width="70" height="36" style="fill:var(--tb-warn);stroke:var(--tb-surface)" fill-opacity="0.22" stroke-width="2"/><rect x="340" y="102" width="70" height="36" style="fill:var(--tb-warn);stroke:var(--tb-surface)" fill-opacity="0.22" stroke-width="2"/><rect x="130" y="138" width="70" height="36" style="fill:var(--tb-good);stroke:var(--tb-surface)" fill-opacity="0.22" stroke-width="2"/><rect x="200" y="138" width="70" height="36" style="fill:var(--tb-good);stroke:var(--tb-surface)" fill-opacity="0.22" stroke-width="2"/><rect x="270" y="138" width="70" height="36" style="fill:var(--tb-good);stroke:var(--tb-surface)" fill-opacity="0.22" stroke-width="2"/><rect x="340" y="138" width="70" height="36" style="fill:var(--tb-warn);stroke:var(--tb-surface)" fill-opacity="0.22" stroke-width="2"/>
<text class="tick" x="122" y="52" text-anchor="end">死亡</text><text class="tick" x="122" y="88" text-anchor="end">重傷</text><text class="tick" x="122" y="124" text-anchor="end">軽傷</text><text class="tick" x="122" y="160" text-anchor="end">軽微</text><text class="tick" x="165" y="190" text-anchor="middle">ほぼない</text><text class="tick" x="235" y="190" text-anchor="middle">まれ</text><text class="tick" x="305" y="190" text-anchor="middle">ときどき</text><text class="tick" x="375" y="190" text-anchor="middle">頻繁</text>
<text class="lbl" x="60" y="110" text-anchor="middle">ひどさ</text>
<text class="lbl" x="270" y="214" text-anchor="middle">危害の発生確率 (F・O・P を総合) →</text>
<line class="k-move" x1="356" y1="84" x2="186" y2="84" stroke-width="2.6"/>
<circle cx="375" cy="84" r="13" style="fill:var(--tb-bad);stroke:var(--tb-surface)" stroke-width="2"/><text class="k-badge-t" x="375" y="88" text-anchor="middle">前</text>
<circle cx="165" cy="84" r="13" style="fill:var(--tb-good);stroke:var(--tb-surface)" stroke-width="2"/><text class="k-badge-t" x="165" y="88" text-anchor="middle">後</text>
<text class="mark-t" x="270" y="76" text-anchor="middle">ガード + ライトカーテン</text>
<rect x="426" y="40" width="14" height="14" rx="2" style="fill:var(--tb-good)" fill-opacity="0.5"/><text class="tick" x="446" y="52">許容</text>
<rect x="426" y="64" width="14" height="14" rx="2" style="fill:var(--tb-warn)" fill-opacity="0.5"/><text class="tick" x="446" y="76">低減を検討</text>
<rect x="426" y="88" width="14" height="14" rx="2" style="fill:var(--tb-bad)" fill-opacity="0.6"/><text class="tick" x="446" y="100">直ちに低減</text>
<text class="k-note" x="426" y="130">ひどさの行は</text><text class="k-note" x="426" y="146">対策しても</text><text class="k-note" x="426" y="162">ふつう変わらない</text>
</svg>
<p class="tb-caption">図: 対策は主に「確率」を下げる。だから対策後も、その対策 (ガード・安全機能) 自体の信頼性が評価の前提になる</p>
<h3>よくある間違い</h3>
<ul>
  <li><b>対策後にひどさを下げる</b>: ガードを付けても、指が挟まれたときのけがの大きさは変わりません。下げてよいのは、力や速度を制限して危害そのものを小さくしたとき (本質的安全設計) だけです</li>
  <li><b>「教育する」「注意喚起」で確率を大きく下げる</b>: 使用上の情報の効果は限られます。点数を 1 段階以上下げる根拠にしないのが無難です</li>
  <li><b>設計者 1 人で評価する</b>: 操作者・保全担当・生産技術を交え、実際の作業 (詰まりの取り方、清掃のしかた) を聞き取ります</li>
  <li><b>閾値を後から動かす</b>: 「この点数なら許容」にするために基準を変えるのは本末転倒です。基準は評価の前に決めておきます</li>
</ul>

<h2>4. 評価と 3 ステップメソッド</h2>
<p>評価では「同種の機械と比べて」「法令・規格を満たして」「最新技術 (state of the art) で可能な対策をとったか」を確認します。低減は必ず<b>本質的安全設計 → 安全防護・付加保護方策 → 使用上の情報</b>の順に検討し、前の段階で「できない」理由を記録します。</p>
<h2>記録 — リスクアセスメントシート</h2>
<table class="tb-table">
  <tr><th>No.</th><th>作業/モード</th><th>危険源・事象</th><th>見積 (前)</th><th>低減策</th><th>見積 (後)</th><th>残留リスク</th></tr>
  <tr><td>3</td><td>詰まり除去</td><td>送りローラへの巻き込まれ</td><td>S2 F2 P1 = 高</td><td>インターロックカバー + 逆転ボタン (ホールド・トゥ・ラン)</td><td>低</td><td>取説に除去手順を記載</td></tr>
</table>
<p>この表は、設計審査の資料、取扱説明書の「残留リスク」の根拠、事故時の説明資料にもなります。</p>
${NOTE}`,
    points: [
      "リスクアセスメント = 制限の決定 → 危険源の同定 → 見積もり → 評価、低減後に再実施",
      "通常運転だけでなく、段取り・清掃・保全・予見可能な誤使用まで含める",
      "リスク = 危害のひどさ × (さらされる頻度・事象の発生確率・回避の可能性)",
      "低減は 3 ステップの順。前段で対策できない理由と残留リスクを記録する",
    ],
    exercises: [
      {
        q: "本文の点数法 (ひどさ・頻度・回避の合計) で、「毎日行うベルト交換時に、プーリの噛み込みで指を骨折して休業する恐れがあり、回避は困難」の点数を求めてください。対策後、ベルトカバーを開けるとモーター電源が切れて回転が止まり、事象の発生がほぼなくなったため頻度を「年数回 (保全時の不具合時のみ)」、回避を「容易」と再評価した場合の点数も求めてください。",
        a: "対策前: ひどさ 2 (休業) + 頻度 4 (毎日) + 回避 4 (困難) = <b>10 点</b> → 直ちに低減。<br>対策後: ひどさ 2 + 頻度 1 + 回避 1 = <b>4 点</b> → 許容。ただしひどさ自体は変わっていないので、インターロックの故障時の安全性 (制御システムの要求性能) も確認します。",
      },
      {
        q: "自動包装機の「機械の制限」を決める際に、使用上の制限として書き出すべきライフサイクル段階を 5 つ以上挙げてください。",
        a: "運搬、据付・試運転、通常運転、段取り替え (品種変更)、詰まりの除去、清掃、保全 (部品交換・点検)、故障診断、解体・廃棄。さらに予見可能な誤使用 (ガードを外して運転する、手でフィルムを押し込む等) も含めます。",
      },
      {
        q: "手送りプレスに固定式ガードとライトカーテンを付けた後、担当者がリスクアセスメントシートの「ひどさ」を 4 (後遺障害) から 1 (軽傷) に書き換えて「許容」と判定しました。この判定の問題点を説明してください。",
        a: "ガードやライトカーテンは、手が型の間に入る<b>確率</b>を下げる対策で、挟まれたときの<b>ひどさ</b>は変わりません。ひどさは 4 のまま、発生確率 (O・F) を下げて再見積もりするのが正しい手順です。また、許容と判定できるのは、ライトカーテンの安全機能が要求される PLr を満たし、すり抜けなど新しい危険源も評価した後です。",
      },
    ],
    quiz: [
      { q: "ISO 12100 のリスクアセスメントに含まれないものは?", choices: ["機械の制限の決定", "危険源の同定", "製品の販売価格の決定"], answer: 2, explain: "リスクアセスメントは、制限の決定・危険源の同定・リスク見積もり・リスク評価から成ります。" },
      { q: "発生確率を構成する要素として正しい組合せは?", choices: ["さらされる頻度・事象の発生確率・回避の可能性", "質量・速度・温度", "部品点数・コスト・納期"], answer: 0, explain: "ISO 12100 では、発生確率を暴露頻度、危険事象の発生確率、回避・制限の可能性で考えます。" },
      { q: "事故が多い場面として特に注意すべきなのは?", choices: ["通常の自動運転だけ", "段取り・詰まり除去・清掃・保全などの非定常作業", "電源を入れる前の梱包状態だけ"], answer: 1, explain: "非定常作業ではガードを開けて危険区域に入ることが多く、事故が集中します。" },
    ],
  },

  // ------------------------------------------------------------------ 2
  {
    id: "inherent-safety",
    part: "knowhow",
    title: "本質的安全設計 — 危険源をなくす・小さくする",
    minutes: 18,
    level: 2,
    lead: "3 ステップメソッドの第 1 段階が本質的安全設計です。ガードや警告に頼る前に、形・寸法・エネルギー・配置を変えて危険源そのものをなくす具体的な手法を学びます。",
    body: `
<h2>本質的安全設計の手法</h2>
<table class="tb-table">
  <tr><th>手法</th><th>具体例</th></tr>
  <tr><td>危険源の除去</td><td>回転刃を使わない工法に変える、突起を出さない、ピンチポイントをなくす形にする</td></tr>
  <tr><td>エネルギーの制限</td><td>力・速度・トルク・圧力・電圧・温度を、危害にならない水準まで下げる</td></tr>
  <tr><td>すき間の確保 / 排除</td><td>挟まれる部分に体の部位が入らない狭さにするか、挟まれない広さを確保する</td></tr>
  <tr><td>形状</td><td>角を丸める、ばりを取る、とがった部分を出さない</td></tr>
  <tr><td>安定性</td><td>転倒しない重心と支持、地震・風・不意の力に対する固定</td></tr>
  <tr><td>危険区域外での作業</td><td>給油・調整・ワーク投入を危険区域の外から行えるようにする (集中給油、外部からの調整ノブ)</td></tr>
  <tr><td>材料・物質</td><td>有害物質を使わない、可燃性の低い材料を選ぶ</td></tr>
  <tr><td>人間工学</td><td>無理な姿勢や重量物の手扱いをなくす (誤操作・疲労が事故につながる)</td></tr>
</table>

<h2>挟まれを防ぐすき間 — 「狭く」か「広く」か</h2>
<p>2 つの部品の間で体の一部が押しつぶされる危険は、すき間を<b>体の部位が入らないほど狭く</b>するか、<b>入っても挟まれないほど広く</b>することでなくせます。ISO 13854 は後者の<b>最小すき間</b>を部位ごとに定めています (概要は「安全設計とリスクアセスメント」の表を参照)。</p>
<table class="tb-table">
  <tr><th>部位</th><th>体</th><th>頭</th><th>脚</th><th>足</th><th>つま先</th><th>腕</th><th>手・手首・こぶし</th><th>指</th></tr>
  <tr><td>最小すき間 (mm)</td><td>500</td><td>300</td><td>180</td><td>120</td><td>50</td><td>120</td><td>100</td><td>25</td></tr>
</table>
<svg class="tb-chart" viewBox="0 0 520 200" role="img" aria-label="挟まれのすき間の考え方">
<rect class="k-panel" x="8" y="8" width="160" height="184" rx="8"/><rect class="k-panel" x="180" y="8" width="160" height="184" rx="8"/><rect class="k-panel" x="352" y="8" width="160" height="184" rx="8"/>
<circle class="k-badge" cx="26" cy="26" r="10" style="fill:var(--tb-good)"/><text class="k-badge-t" x="26" y="30" text-anchor="middle">✓</text><text class="k-title" x="42" y="31">a ≥ 最小すき間</text>
<circle class="k-badge" cx="198" cy="26" r="10" style="fill:var(--tb-bad)"/><text class="k-badge-t" x="198" y="30" text-anchor="middle">✕</text><text class="k-title" x="214" y="31">中間のすき間</text>
<circle class="k-badge" cx="370" cy="26" r="10" style="fill:var(--tb-good)"/><text class="k-badge-t" x="370" y="30" text-anchor="middle">✓</text><text class="k-title" x="386" y="31">入らない (狭い)</text>
<g class="k-shadow">
<rect class="k-part" x="44" y="50" width="104" height="24" rx="2"/><rect class="k-part" x="44" y="132" width="104" height="24" rx="2"/>
<rect class="k-part" x="216" y="62" width="104" height="24" rx="2" style="stroke:var(--tb-bad)"/><rect class="k-part" x="216" y="114" width="104" height="24" rx="2" style="stroke:var(--tb-bad)"/>
<rect class="k-part" x="404" y="78" width="96" height="24" rx="2"/><rect class="k-part" x="404" y="105" width="96" height="24" rx="2"/>
</g>
<rect class="k-skin" x="14" y="94.0" width="82" height="18" rx="9.0"/><path d="M87,97.0 L92,97.0 Q94,103 92,109.0 L87,109.0 Z" fill="#ffffff" opacity="0.5"/>
<rect class="k-skin" x="186" y="92.0" width="80" height="16" rx="8.0"/><path d="M257,95.0 L262,95.0 Q264,100 262,105.0 L257,105.0 Z" fill="#ffffff" opacity="0.5"/>
<rect class="k-skin" x="358" y="95.0" width="44" height="16" rx="8.0"/><path d="M393,98.0 L398,98.0 Q400,103 398,108.0 L393,108.0 Z" fill="#ffffff" opacity="0.5"/>
<line class="k-ext" x1="150" y1="74" x2="160" y2="74"/><line class="k-ext" x1="150" y1="132" x2="160" y2="132"/>
<line class="k-dimline" x1="140" y1="76" x2="140" y2="130"/><text class="k-dimtext" x="132" y="108" text-anchor="end">a</text>
<line class="k-force" x1="290" y1="38" x2="290" y2="58"/><line class="k-force" x1="290" y1="162" x2="290" y2="142"/>
<circle cx="262" cy="100" r="13" fill="none" style="stroke:var(--tb-bad)" stroke-width="1.6" stroke-dasharray="4 3"/>
<text class="tick" x="88" y="178" text-anchor="middle">挟まれない (広い)</text>
<text class="k-bad-t" x="260" y="178" text-anchor="middle">指・手が入り、挟まれる</text>
<text class="tick" x="432" y="178" text-anchor="middle">指先も入らない狭さ</text>
</svg>
<p class="tb-caption">図: 危ないのは中間のすき間。「最小すき間以上」は ISO 13854、「体の部位が届かない狭さ・距離」は ISO 13857 で考える。可動範囲の全ストロークで確認する</p>
<p>注意: 最小すき間は「その部位だけが入る」ことを前提にしています。例えば腕のすき間 120 mm でも、頭や体が入る位置関係なら、より大きい値が必要です。</p>

<h2>届かない距離 — ISO 13857</h2>
<p>ISO 13857 は、ガードの上から、開口部から、周りから<b>危険区域に手足が届かない安全距離</b>を定めています。例えば、上方への到達については、リスクが高い場合、危険区域の高さが <b>2 700 mm 以上</b>なら防護構造は不要とされています。ガードの開口 (メッシュ、スリット) から腕を差し込む場合の距離は、開口の形と大きさごとに表で定められているので、原文の表で確認します。</p>
<svg class="tb-chart" viewBox="0 0 520 220" role="img" aria-label="開口部と安全距離">
<rect class="k-ground" x="20" y="196" width="480" height="10"/><line class="k-edge" x1="20" y1="196" x2="500" y2="196"/>
<circle cx="400" cy="106" r="42" style="fill:var(--tb-bad);stroke:var(--tb-bad)" fill-opacity="0.1" stroke-width="1.4" stroke-dasharray="5 3"/>
<g class="k-shadow">
<rect class="k-part" x="200" y="40" width="12" height="58" rx="1"/><rect class="k-part" x="200" y="116" width="12" height="80" rx="1"/>
<circle class="k-part" cx="400" cy="92" r="14"/><circle class="k-part" cx="400" cy="120" r="14"/>
</g>
<circle cx="400" cy="92" r="3" style="fill:var(--k-line)"/><circle cx="400" cy="120" r="3" style="fill:var(--k-line)"/>
<path class="k-force" d="M384,80 A20,20 0 0 1 412,76" stroke-width="1.8"/><path class="k-force" d="M416,132 A20,20 0 0 1 388,136" stroke-width="1.8"/>
<g class="k-shadow" transform="translate(130 196) scale(1.0 1.0)"><path d="M-11,-72 L-12,-5 L-2,-5 L0,-48 L2,-5 L12,-5 L11,-72 Z" fill="#46505f" style="stroke:var(--k-line)" stroke-width="1.2"/><path d="M-14,-6 L-1,-6 L-1,0 L-14,0 Z M1,-6 L13,-6 Q19,-4 18,0 L1,0 Z" fill="#2a2f38"/><g transform="rotate(0 0 -70)"><path d="M2,-122 L-4,-96 L10,-74" fill="none" style="stroke:var(--k-line)" stroke-width="10"/><path d="M-4,-96 L10,-74" fill="none" style="stroke:var(--k-skin-2)" stroke-width="7.4"/><path d="M2,-122 L-4,-96" fill="none" style="stroke:var(--k-accent-2)" stroke-width="7.6"/><circle class="k-skin" cx="10" cy="-74" r="4.8"/><rect class="k-accent" x="-13" y="-131" width="27" height="64" rx="9"/><rect x="-12" y="-76" width="25" height="5" fill="#2a2f38"/><rect class="k-skin" x="-1" y="-136" width="8" height="8"/><circle class="k-skin" cx="3" cy="-145" r="11"/><circle cx="10" cy="-146" r="1.3" style="fill:var(--k-line)"/><path d="M-9,-147 A12.5,12.5 0 0 1 15.5,-147 Z" fill="#f2c230" style="stroke:var(--k-line)" stroke-width="1.2"/><line x1="13" y1="-147" x2="20" y2="-147" style="stroke:var(--k-line)" stroke-width="2"/><path d="M2,-122 L40,-100 L108,-90" fill="none" style="stroke:var(--k-line)" stroke-width="10"/><path d="M40,-100 L108,-90" fill="none" style="stroke:var(--k-skin-2)" stroke-width="7.4"/><path d="M2,-122 L40,-100" fill="none" style="stroke:var(--k-accent-2)" stroke-width="7.6"/><circle class="k-skin" cx="108" cy="-90" r="4.8"/></g></g>
<text class="tick" x="206" y="32" text-anchor="middle">ガード</text>
<text class="tick" x="218" y="90">開口 e</text>
<text class="tick" x="176" y="134" text-anchor="middle">腕</text>
<text class="k-bad-t" x="400" y="56" text-anchor="middle">危険区域</text>
<line class="k-ext" x1="240" y1="112" x2="240" y2="140"/><line class="k-ext" x1="358" y1="130" x2="358" y2="168"/>
<line class="k-ext" x1="212" y1="140" x2="212" y2="168"/>
<line class="k-dimline" x1="212" y1="136" x2="240" y2="136"/><text class="k-dimtext" x="246" y="140">届く深さ</text>
<line class="k-dimline" x1="212" y1="162" x2="358" y2="162"/><text class="k-dimtext" x="286" y="182" text-anchor="middle">安全距離 sr</text>
</svg>
<p class="tb-caption">図: 開口 e から差し込んだ指・手・腕が届く深さより、危険区域を遠くに置く。開口が大きいほど深く届くので、安全距離は大きくなる</p>

<h3>例題 — メッシュガードの目の大きさと距離</h3>
<p>ISO 13857 (14 歳以上を対象とする上肢の表) から、規則的な開口の代表的な値を抜き出すと次のとおりです (開口 e は、スロットでは短い方の幅、正方形では辺、円形では直径)。</p>
<table class="tb-table">
  <tr><th>開口 e (mm)</th><th>届く部位</th><th>スロット</th><th>正方形</th><th>円形</th></tr>
  <tr><td>4 &lt; e ≤ 6</td><td>指先</td><td>≥ 10</td><td>≥ 5</td><td>≥ 5</td></tr>
  <tr><td>8 &lt; e ≤ 10</td><td>指 (付け根まで)</td><td>≥ 80</td><td>≥ 25</td><td>≥ 20</td></tr>
  <tr><td>12 &lt; e ≤ 20</td><td>手のひら</td><td>≥ 120</td><td>≥ 120</td><td>≥ 120</td></tr>
  <tr><td>40 &lt; e ≤ 120</td><td>腕 (肩まで)</td><td>≥ 850</td><td>≥ 850</td><td>≥ 850</td></tr>
</table>
<p><b>例</b>: 回転する歯車から 80 mm の位置に、目開き 20 mm 角の金網ガードを付ける計画があります。表から 12 &lt; e ≤ 20 の正方形は安全距離 120 mm 以上が必要なので、80 mm では<b>不足</b>です。対策は (a) ガードを歯車から 120 mm 以上離す、または (b) 目開きを 10 mm 角にして必要距離を 25 mm にする (80 mm ≥ 25 mm で OK)。目を細かくすると中が見えにくく、放熱も悪くなるので、パンチングメタルやポリカーボネートの窓と使い分けます。</p>
<p>数値は版や対象者 (子どもが近づく場所など) で変わるため、必ず原文の表で確認してください。</p>

<h2>危険区域の外で作業できるようにする</h2>
<p>保全の手間が大きい設計は、ガードを開けたままの運転を招きます。給油・調整・点検を<b>ガードの外から</b>できれば、危険区域に入る理由そのものがなくなります。これも本質的安全設計の重要な手法です。</p>
<svg class="tb-chart" viewBox="0 0 520 222" role="img" aria-label="危険区域の外から給油できる設計">
<rect class="k-panel" x="8" y="8" width="244" height="206" rx="8"/><rect class="k-panel" x="268" y="8" width="244" height="206" rx="8"/>
<circle class="k-badge" cx="28" cy="28" r="10" style="fill:var(--tb-bad)"/><text class="k-badge-t" x="28" y="32" text-anchor="middle">✕</text><text class="k-title" x="46" y="32">中に手を入れて給油</text>
<circle class="k-badge" cx="288" cy="28" r="10" style="fill:var(--tb-good)"/><text class="k-badge-t" x="288" y="32" text-anchor="middle">✓</text><text class="k-title" x="306" y="32">外から集中給油</text>
<g class="k-shadow"><rect class="k-part-h" x="120" y="118" width="110" height="12" rx="2"/>
<circle class="k-part" cx="178" cy="124" r="24"/><circle cx="178" cy="124" r="17" fill="none" style="stroke:var(--k-line-2)" stroke-dasharray="3 3"/><circle class="k-sphere" cx="178" cy="124" r="6"/>
<rect class="k-part" x="132" y="104" width="18" height="40" rx="3"/><rect class="k-part" x="206" y="104" width="18" height="40" rx="3"/>
<rect class="k-part" x="116" y="182" width="124" height="10" rx="2"/></g>
<path class="k-force" d="M162,96 A30,30 0 0 1 200,100" stroke-width="2"/>
<rect x="112" y="50" width="128" height="140" rx="4" class="k-edge"/>
<polygon class="k-glass" points="112,52 76,62 76,178 112,188"/>
<path d="M14,168 Q60,150 120,96" fill="none" style="stroke:var(--k-person-2)" stroke-width="11"/>
<g transform="rotate(-40 128 92)"><rect class="k-yellow" x="112" y="84" width="34" height="14" rx="3"/><rect class="k-part" x="146" y="88" width="16" height="5" rx="1"/></g>
<circle class="k-skin" cx="120" cy="96" r="7"/>
<text class="k-bad-t" x="130" y="204" text-anchor="middle">運転中に扉を開けて給油しがち</text>
<g class="k-shadow"><rect class="k-part-h" x="380" y="118" width="110" height="12" rx="2"/>
<circle class="k-part" cx="438" cy="124" r="24"/><circle cx="438" cy="124" r="17" fill="none" style="stroke:var(--k-line-2)" stroke-dasharray="3 3"/><circle class="k-sphere" cx="438" cy="124" r="6"/>
<rect class="k-part" x="392" y="104" width="18" height="40" rx="3"/><rect class="k-part" x="466" y="104" width="18" height="40" rx="3"/>
<rect class="k-part" x="376" y="182" width="124" height="10" rx="2"/></g>
<path d="M401,104 L401,72 L366,72 M475,104 L475,64 L366,64" fill="none" style="stroke:#b8642d" stroke-width="3"/>
<rect class="k-glass" x="372" y="50" width="128" height="140" rx="4"/>
<g class="k-shadow"><rect class="k-alu" x="344" y="54" width="22" height="30" rx="3"/></g>
<circle cx="340" cy="64" r="3.5" class="k-sphere"/><circle cx="340" cy="74" r="3.5" class="k-sphere"/>
<path d="M276,170 Q300,140 318,88" fill="none" style="stroke:var(--k-person-2)" stroke-width="11"/>
<g transform="rotate(-20 322 82)"><rect class="k-yellow" x="300" y="74" width="30" height="13" rx="3"/></g>
<circle class="k-skin" cx="318" cy="86" r="7"/>
<text class="k-note" x="436" y="44" text-anchor="middle">ガードは閉じたまま</text>
<text class="k-note" x="330" y="104" text-anchor="middle">給油ブロック</text>
<text class="k-good-t" x="390" y="204" text-anchor="middle">危険区域に入る理由をなくす</text>
</svg>
<p class="tb-caption">図: 軸受への給油配管をガードの外の給油ブロックに集めると、ガードを開ける頻度が下がり、ガードを固定式にできることもある</p>
<ul>
  <li>調整ねじ・目盛をガードの外に出す (延長軸、外部ノブ)</li>
  <li>点検窓 (透明ガード) やのぞき窓から油面・ベルトの状態を見られるようにする</li>
  <li>重い型・刃物の交換を、リフタやスライド式の引出しで危険区域外まで引き出してから行う</li>
</ul>
<h3>よくある間違い</h3>
<ul>
  <li>すき間を「なんとなく 50 mm」にする — 指 (25 mm) には十分でも、手 (100 mm) や腕 (120 mm) には中間のすき間になる</li>
  <li>可動部の<b>途中の位置</b>を確認しない — 端点では広くても、ストロークの途中で狭くなるリンク機構は多い</li>
  <li>速度だけ下げて力を忘れる — 低速でも大きな推力のシリンダは押しつぶしの危険がある</li>
</ul>

<h2>エネルギーを制限する</h2>
<p>危害の大きさは、体に加わる<b>力・圧力・運動エネルギー</b>で決まります。例えば、運動エネルギー E = ½mv² は速度の 2 乗に比例するので、速度を半分にするとエネルギーは 1/4 になります。</p>
<ul>
  <li>自動ドアや電動スライドの閉まる力を、トルク制限・電流監視で制限する</li>
  <li>段取り時は低速 (例: 規格や社内基準で定めた監視付き低速) でしか動かせないモードにする</li>
  <li>手で触れる部分の温度を下げる (断熱カバー、熱源の配置)</li>
  <li>保護特別低電圧 (SELV/PELV) で回路を構成する</li>
</ul>

<h2>部品の強度とフェールセーフな構造</h2>
<p>本質安全には「壊れない・壊れても危険にならない」構造も含まれます。ワイヤ・チェーンの安全率、ボルトの緩み止め、ばねで閉じるブレーキ (電源断で保持)、自重で安全側に戻る機構などです。強度の検討は「強度設計」「故障事例」の章も参照してください。</p>
${NOTE}`,
    points: [
      "本質的安全設計: 危険源の除去、エネルギーの制限、形状、安定性、危険区域外での作業",
      "挟まれは「部位が入らない狭さ」か「最小すき間以上 (ISO 13854)」にする",
      "ガードの上・開口部から届かない安全距離は ISO 13857 の表で決める",
      "運動エネルギーは速度の 2 乗に比例 — 速度の制限は効果が大きい",
    ],
    exercises: [
      {
        q: "昇降テーブル (上昇端) と天井梁の間に作業者の頭が挟まれる恐れがあります。ISO 13854 の最小すき間を使って、上昇端での必要なすき間を答えてください。また、同じ場所に体全体が入りうる場合はどうなりますか。",
        a: "頭の最小すき間は <b>300 mm</b> なので、上昇端でテーブルと梁の間を 300 mm 以上にします。体全体が入る位置関係なら、体の最小すき間 <b>500 mm</b> 以上が必要です。確保できなければ、ガードで近づけなくするなど第 2 段階の対策を考えます。",
      },
      {
        q: "質量 20 kg のスライドが 0.5 m/s で動いています。速度を 0.25 m/s に下げると運動エネルギーはいくらからいくらになりますか。",
        a: "E = ½mv²。0.5 m/s: ½ × 20 × 0.5² = <b>2.5 J</b>。0.25 m/s: ½ × 20 × 0.25² = <b>0.625 J</b>。速度半分でエネルギーは 1/4 になります。",
      },
      {
        q: "回転部から 100 mm の位置にあるガードに、幅 10 mm の長いスロット (すき間) があります。本文の表で安全距離は足りていますか。正方形 10 mm 角の開口ならどうですか。",
        a: "8 &lt; e ≤ 10 のスロットは <b>80 mm 以上</b>が必要 → 100 mm なので<b>足りています</b>。正方形 10 mm 角なら 25 mm 以上で、これも満たします。ただしスロット幅が 12 mm に広がると 100 mm 以上 (10 &lt; e ≤ 12) が必要になり余裕がなくなるため、変形や摩耗で開口が広がらないかも確認します。",
      },
    ],
    quiz: [
      { q: "挟まれの危険が最も高いのは?", choices: ["指も入らない狭いすき間", "その部位の最小すき間以上の広いすき間", "指や手が入るが逃げられない中間のすき間"], answer: 2, explain: "部位が入り、しかも押しつぶされる中間のすき間が最も危険です。" },
      { q: "ISO 13854 での指の最小すき間は?", choices: ["8 mm", "25 mm", "100 mm"], answer: 1, explain: "指は 25 mm です (手・手首・こぶしは 100 mm)。" },
      { q: "本質的安全設計に当たらないものは?", choices: ["閉まる力をトルク制限する", "危険区域の外から給油できるようにする", "「手を入れるな」のラベルを貼る"], answer: 2, explain: "ラベルは使用上の情報で、3 ステップの最後の手段です。" },
    ],
  },

  // ------------------------------------------------------------------ 3
  {
    id: "guards-devices",
    part: "knowhow",
    title: "ガードと保護装置 — インターロックとライトカーテン",
    minutes: 22,
    level: 3,
    lead: "本質的安全設計で除去できない危険には、ガードや保護装置で人を近づけない・近づいたら止めます。ガードの種類と選び方、インターロックスイッチ、ライトカーテンの安全距離 S = K×T + C の計算を学びます。",
    body: `
<h2>ガードの種類</h2>
<table class="tb-table">
  <tr><th>固定式ガード</th><td>工具がないと外せない。開ける必要がほとんどない場所 (動力伝達部など) に。外したら固定具が落ちない (ガードに残る) ようにする</td></tr>
  <tr><th>インターロック付き可動式ガード</th><td>開けると危険な動作が止まり、閉じるまで起動しない。頻繁に開ける場所に</td></tr>
  <tr><th>施錠式 (ガードロック付き) インターロック</th><td>危険な動作が止まる (惰性回転が止まる) まで開かない。停止時間が長い機械 (大きな回転体) に</td></tr>
  <tr><th>調整式ガード</th><td>加工物の大きさに合わせて開口を調整 (丸のこの刃カバーなど)</td></tr>
</table>
<p>選び方の目安: 開ける頻度が低い (保全時だけ) なら固定式、頻繁 (毎日、段取りごと) ならインターロック付きにします。頻繁に開けるのに固定式にすると、外したまま運転される原因になります。</p>

<svg class="tb-chart" viewBox="0 0 520 262" role="img" aria-label="ロボットセルの固定式ガード、インターロック扉、ライトカーテン、非常停止">
<text class="k-title" x="14" y="18">ロボットセルの安全防護 (正面から見た図)</text>
<rect class="k-ground" x="8" y="244" width="504" height="10"/><line class="k-edge" x1="8" y1="244" x2="512" y2="244"/>
<g class="k-shadow">
<rect class="k-part" x="56" y="208" width="48" height="36" rx="3"/>
</g>
<path d="M80,208 L72,142 L122,112" fill="none" style="stroke:var(--k-line)" stroke-width="17"/><path d="M80,208 L72,142 L122,112" fill="none" style="stroke:var(--k-accent-1)" stroke-width="13"/>
<circle class="k-sphere" cx="80" cy="206" r="10"/><circle class="k-sphere" cx="72" cy="142" r="9"/><circle class="k-sphere" cx="122" cy="112" r="6"/>
<path class="k-part" d="M126,106 L134,102 L134,108 L128,112 L134,116 L134,122 L126,118 Z" stroke-width="1.2"/>
<rect class="k-glass" x="26" y="60" width="112" height="176"/>
<g class="k-shadow">
<rect class="k-part" x="26" y="232" width="112" height="12"/>
<rect class="k-alu" x="148" y="60" width="78" height="180" rx="3"/>
</g>
<rect class="k-glass" x="157" y="72" width="60" height="116" rx="2"/>
<rect class="k-part" x="208" y="150" width="7" height="32" rx="3"/>
<rect class="k-glass" x="236" y="60" width="94" height="50"/>
<g class="k-shadow">
<rect class="k-part" x="236" y="192" width="150" height="12" rx="2"/>
<rect class="k-part" x="244" y="204" width="8" height="40"/><rect class="k-part" x="370" y="204" width="8" height="40"/>
<rect class="k-alu" x="276" y="178" width="40" height="14" rx="2"/>
</g>
<line x1="247" y1="118" x2="319" y2="118" style="stroke:var(--tb-bad)" stroke-width="1.2" opacity="0.6"/><line x1="247" y1="126" x2="319" y2="126" style="stroke:var(--tb-bad)" stroke-width="1.2" opacity="0.6"/><line x1="247" y1="134" x2="319" y2="134" style="stroke:var(--tb-bad)" stroke-width="1.2" opacity="0.6"/><line x1="247" y1="142" x2="319" y2="142" style="stroke:var(--tb-bad)" stroke-width="1.2" opacity="0.6"/><line x1="247" y1="150" x2="319" y2="150" style="stroke:var(--tb-bad)" stroke-width="1.2" opacity="0.6"/><line x1="247" y1="158" x2="319" y2="158" style="stroke:var(--tb-bad)" stroke-width="1.2" opacity="0.6"/><line x1="247" y1="166" x2="319" y2="166" style="stroke:var(--tb-bad)" stroke-width="1.2" opacity="0.6"/><line x1="247" y1="174" x2="319" y2="174" style="stroke:var(--tb-bad)" stroke-width="1.2" opacity="0.6"/><line x1="247" y1="182" x2="319" y2="182" style="stroke:var(--tb-bad)" stroke-width="1.2" opacity="0.6"/>
<g class="k-shadow">
<rect class="k-yellow" x="18" y="52" width="8" height="192"/><rect class="k-yellow" x="138" y="52" width="10" height="192"/>
<rect class="k-yellow" x="226" y="52" width="10" height="192"/><rect class="k-yellow" x="330" y="52" width="8" height="140"/>
<rect class="k-yellow" x="239" y="112" width="8" height="78" rx="2"/><rect class="k-yellow" x="319" y="112" width="8" height="78" rx="2"/>
<rect class="k-yellow" x="214" y="84" width="22" height="26" rx="3"/>
</g>
<circle class="k-led-g" cx="243" cy="108" r="3"/>
<rect class="k-part" x="331" y="40" width="5" height="12"/><circle class="k-led-off" cx="334" cy="26" r="6"/><circle class="k-led-g" cx="334" cy="38" r="6"/>
<g class="k-shadow">
<rect class="k-part" x="478" y="176" width="12" height="68"/><rect class="k-part" x="466" y="240" width="36" height="5" rx="2"/>
<rect class="k-part" x="460" y="138" width="48" height="40" rx="5"/>
</g>
<circle class="k-yellow" cx="484" cy="158" r="14"/><circle class="k-estop" cx="484" cy="158" r="9"/>
<g transform="translate(414 244)">
<path d="M-6,-118 Q-36,-104 -66,-82" fill="none" style="stroke:var(--k-person-2)" stroke-width="9"/>
<path class="k-person" d="M-12,-128 Q0,-134 12,-128 Q16,-126 16,-118 L15,-72 L11,-70 L10,-2 L2,0 L0,-60 L-2,0 L-10,-2 L-11,-70 L-15,-72 L-16,-118 Q-16,-126 -12,-128 Z"/>
<circle class="k-skin" cx="0" cy="-142" r="11"/><circle class="k-skin" cx="-67" cy="-82" r="5"/>
<rect x="-14" y="-4" width="12" height="5" rx="2" fill="#2a2f38"/><rect x="2" y="-4" width="11" height="5" rx="2" fill="#2a2f38"/>
</g>
<text class="k-note" x="82" y="46" text-anchor="middle">固定式ガード (透明)</text>
<text class="k-note" x="187" y="46" text-anchor="middle">インターロック扉</text>
<path class="k-thin" d="M225,84 L250,66"/><text class="k-note" x="252" y="64">スイッチ</text>
<text class="k-note" x="283" y="128" text-anchor="middle" style="fill:var(--tb-bad)">光軸</text>
<text class="k-note" x="300" y="226" text-anchor="middle">ワーク投入口</text>
<text class="k-note" x="484" y="128" text-anchor="middle">非常停止</text>
<text class="k-note" x="352" y="30">表示灯</text>
</svg>
<p class="tb-caption">図: 開ける必要のない面は固定式ガード (中が見える透明板)、人が入る扉はインターロック付き、ワークを出し入れする開口はライトカーテン。非常停止は操作位置から手の届く所に置く</p>
<h2>インターロックの仕組み</h2>
<div data-widget="anim-interlock"></div>
<p>インターロックスイッチは、ガードの開閉を検出して安全回路 (セーフティリレー、安全 PLC) に伝えます。</p>
<ul>
  <li><b>直接開路動作 (強制開離)</b>: 接点が溶着していても、ガードを開ける動きで機械的に接点を引き離す構造 (IEC 60947-5-1)。安全用のスイッチはこれを使う</li>
  <li><b>無効化 (バイパス) されにくく</b>: 専用キー (アクチュエータ) 式、コード化された非接触 (RFID) 式。磁石やテープで簡単にだませないものを選び、取付けも隠す (ISO 14119)</li>
  <li><b>2 チャンネル</b>: 2 つの接点 (または 2 個のスイッチ) で冗長化し、不一致を監視する</li>
  <li><b>閉じただけで起動しない</b>: ガードを閉じた後、起動ボタンを押して初めて動く</li>
</ul>
<svg class="tb-chart" viewBox="0 0 520 200" role="img" aria-label="直接開路動作のしくみ">
<rect class="k-panel" x="8" y="8" width="244" height="184" rx="8"/><rect class="k-panel" x="268" y="8" width="244" height="184" rx="8"/>
<circle class="k-badge" cx="28" cy="28" r="10" style="fill:var(--tb-bad)"/><text class="k-badge-t" x="28" y="32" text-anchor="middle">✕</text><text class="k-title" x="46" y="32">一般のスイッチ</text><circle class="k-badge" cx="288" cy="28" r="10" style="fill:var(--tb-good)"/><text class="k-badge-t" x="288" y="32" text-anchor="middle">✓</text><text class="k-title" x="306" y="32">直接開路動作</text>
<g class="k-shadow"><rect class="k-part" x="44" y="120" width="46" height="12" rx="1"/><rect class="k-part" x="170" y="120" width="46" height="12" rx="1"/><rect class="k-cut" x="40" y="150" width="180" height="8"/>
<rect class="k-part" x="74" y="108" width="112" height="12" rx="2"/>
<rect class="k-part-h" x="122" y="44" width="16" height="30" rx="2"/>
</g>
<polyline points="130,120 139,125.0 121,130.0 139,135.0 121,140.0 139,145.0 130,150" fill="none" style="stroke:var(--tb-warn)" stroke-width="2.2"/>
<ellipse cx="84" cy="120" rx="8" ry="3.4" style="fill:var(--tb-bad)"/><ellipse cx="176" cy="120" rx="8" ry="3.4" style="fill:var(--tb-bad)"/>
<text class="k-bad-t" x="192" y="104">溶着</text>
<line class="k-move" x1="150" y1="76" x2="150" y2="50"/>
<text class="tick" x="146" y="144">ばね</text>
<text class="tick" x="130" y="182" text-anchor="middle">ばねで離す → 溶着すると離れない</text>
<g class="k-shadow"><rect class="k-part" x="304" y="120" width="46" height="12" rx="1"/><rect class="k-part" x="430" y="120" width="46" height="12" rx="1"/><rect class="k-cut" x="300" y="150" width="180" height="8"/>
<rect class="k-part-h" x="382" y="44" width="16" height="52" rx="2"/>
<rect class="k-part" x="334" y="94" width="112" height="12" rx="2"/>
</g>
<path d="M340,120 l3,-4 l3,4 M432,120 l3,-4 l3,4" fill="none" style="stroke:var(--tb-bad)" stroke-width="1.4"/>
<line class="k-force" x1="364" y1="90" x2="364" y2="58"/>
<text class="k-good-t" x="404" y="70">剛体で押し離す</text>
<text class="tick" x="390" y="182" text-anchor="middle">溶着しても力ずくで開く</text>
</svg>
<p class="tb-caption">図: 安全用スイッチの接点は、ばねではなく操作部と剛に連結した部品で引き離す (概念図)</p>

<div data-widget="3d-guard"></div>
<p class="tb-caption">3D 図: 扉を開くと主軸は停止指令を受けますが、惰性ですぐには止まりません。停止時間が長い機械では、止まるまで開かないガードロックを使います。</p>
<h2>保護装置 — 近づいたら止める</h2>
<table class="tb-table">
  <tr><th>ライトカーテン (AOPD)</th><td>光の幕を遮ると停止。ワークの出し入れが頻繁な場所に。人が光の幕を越えて中に入れてしまう配置では、再起動防止とリセットを外から行う工夫が必要</td></tr>
  <tr><th>レーザスキャナ</th><td>床面の領域に人が入ったことを検出</td></tr>
  <tr><th>セーフティマット</th><td>踏むと停止</td></tr>
  <tr><th>両手操作装置</th><td>両手が操作位置にある間だけ動く (ISO 13851)。操作者本人だけを守る</td></tr>
  <tr><th>イネーブルスイッチ</th><td>3 ポジション (離す・握る・強く握り込む) で、中間位置だけ動作を許可。ティーチング時に使う</td></tr>
</table>

<h2>安全距離 S = K × T + C (ISO 13855)</h2>
<p>近づいたら止める装置は、<b>人が危険区域に届く前に機械が止まる</b>位置に置かなければなりません。ISO 13855 の基本式です。</p>
<table class="tb-table">
  <tr><th>S</th><td>最小安全距離 (mm): 検出面から危険区域まで</td></tr>
  <tr><th>K</th><td>人体の接近速度 (mm/s)。手・腕の接近では 2 000 mm/s、体の接近では 1 600 mm/s</td></tr>
  <tr><th>T</th><td>全体の停止時間 (s) = 保護装置の応答時間 + 制御回路 + 機械の停止時間</td></tr>
  <tr><th>C</th><td>侵入距離 (mm)。検出能力 d が小さいほど小さい</td></tr>
</table>
<p>検出面に垂直に近づくライトカーテンの場合の要点 (要約):</p>
<ul>
  <li>検出能力 d ≤ 40 mm: C = 8 × (d − 14)、まず K = 2 000 で計算する</li>
  <li>そのとき S が 100 mm 未満なら S = 100 mm</li>
  <li>S が 500 mm を超えたら K = 1 600 で再計算してよい。ただしその結果が 500 mm 未満なら S = 500 mm</li>
  <li>d &gt; 40 mm (体の検出用): S = 1 600 × T + 850 (光軸の高さの条件あり)</li>
</ul>
<div data-widget="anim-lightcurtain"></div>
<svg class="tb-chart" viewBox="0 0 520 200" role="img" aria-label="停止時間と安全距離">
<line class="grid" x1="60" y1="120" x2="480" y2="120"/><line class="grid" x1="60" y1="70" x2="480" y2="70"/><line class="grid" x1="60" y1="20" x2="480" y2="20"/>
<line class="grid" x1="160" y1="20" x2="160" y2="170"/><line class="grid" x1="260" y1="20" x2="260" y2="170"/><line class="grid" x1="360" y1="20" x2="360" y2="170"/><line class="grid" x1="460" y1="20" x2="460" y2="170"/>
<polygon points="60,170 60,150 110,150 160,130 210,110 260,90 310,70 372.5,70 410,58 460,42 460,170" style="fill:var(--tb-accent)" opacity="0.12"/>
<line class="axis" x1="60" y1="170" x2="494" y2="170" marker-end="url(#k-arrow)"/><line class="axis" x1="60" y1="170" x2="60" y2="12" marker-end="url(#k-arrow)"/>
<text class="tick" x="60" y="188" text-anchor="middle">0</text><text class="tick" x="160" y="188" text-anchor="middle">0.1</text><text class="tick" x="260" y="188" text-anchor="middle">0.2</text><text class="tick" x="360" y="188" text-anchor="middle">0.3</text><text class="tick" x="460" y="188" text-anchor="middle">0.4</text><text class="lbl" x="490" y="160" text-anchor="end">T (s)</text>
<text class="tick" x="54" y="174" text-anchor="end">0</text><text class="tick" x="54" y="124" text-anchor="end">250</text><text class="tick" x="54" y="74" text-anchor="end">500</text><text class="tick" x="54" y="24" text-anchor="end">750</text><text class="lbl" x="68" y="16" text-anchor="start">S (mm)</text>
<line x1="60" y1="70" x2="480" y2="70" style="stroke:var(--tb-warn)" stroke-width="1.4" stroke-dasharray="6 3"/>
<polyline points="60,150 110,150 160,130 210,110 260,90 310,70 372.5,70 410,58 460,42" fill="none" style="stroke:var(--tb-accent)" stroke-width="2.8"/>
<circle cx="110" cy="150" r="3.5" style="fill:var(--tb-accent)"/><circle cx="310" cy="70" r="3.5" style="fill:var(--tb-accent)"/><circle cx="372.5" cy="70" r="3.5" style="fill:var(--tb-warn)"/>
<text class="mark-t" x="210" y="50" text-anchor="middle">500 mm で頭打ち (K を 1 600 に切替)</text>
<text class="tick" x="64" y="138" text-anchor="start">最小 100 mm</text>
</svg>
<p class="tb-caption">図: d = 14 mm (C = 0) のライトカーテンの最小安全距離。T = 0.25 s を超えると K = 1 600 で再計算するが、結果が 500 mm 未満の範囲 (0.25〜0.3125 s) は 500 mm となる</p>
<svg class="tb-chart" viewBox="0 0 520 216" role="img" aria-label="ライトカーテンと危険区域の距離">
<rect class="k-ground" x="8" y="196" width="504" height="10"/><line class="k-edge" x1="8" y1="196" x2="512" y2="196"/>
<rect x="352" y="100" width="100" height="40" style="fill:var(--tb-bad)" opacity="0.15"/>
<g class="k-shadow">
<rect class="k-part" x="336" y="140" width="172" height="56" rx="3"/>
<rect class="k-part" x="470" y="30" width="38" height="112" rx="3"/>
<rect class="k-part" x="336" y="22" width="172" height="26" rx="5"/>
<rect class="k-alu" x="364" y="48" width="78" height="44" rx="2"/>
<rect class="k-part" x="372" y="92" width="62" height="8"/>
<rect class="k-part" x="362" y="132" width="82" height="8"/>
<rect class="k-part" x="148" y="152" width="8" height="44"/><rect class="k-part" x="138" y="192" width="28" height="4" rx="1"/>
<rect class="k-yellow" x="144" y="60" width="16" height="94" rx="3"/>
</g>
<rect class="k-hazard" x="336" y="140" width="172" height="6"/>
<line x1="152" y1="54" x2="152" y2="160" style="stroke:var(--tb-bad)" stroke-width="1.6" stroke-dasharray="5 3"/>
<line class="k-force" x1="404" y1="54" x2="404" y2="88"/>
<path d="M8,170 Q50,140 96,116" fill="none" style="stroke:var(--k-person-2)" stroke-width="12"/>
<path class="k-skin" d="M94,110 Q110,104 122,110 Q126,114 120,118 L96,124 Z"/>
<line class="k-move" x1="58" y1="92" x2="132" y2="92"/>
<text class="lbl" x="20" y="84">K: 接近速度</text>
<line class="k-ext" x1="152" y1="54" x2="152" y2="30"/><line class="k-ext" x1="352" y1="100" x2="352" y2="30"/>
<line class="k-dimline" x1="152" y1="36" x2="352" y2="36"/><text class="k-dimtext" x="252" y="30" text-anchor="middle">S = K × T + C</text>
<text class="k-note" x="152" y="174" text-anchor="middle">検出面</text>
<text class="k-bad-t" x="402" y="122" text-anchor="middle">危険区域</text>
<rect class="k-panel" x="176" y="112" width="148" height="66" rx="6"/>
<text class="k-note" x="186" y="130">T = 装置の応答</text><text class="k-note" x="198" y="148">+ 制御回路の応答</text><text class="k-note" x="198" y="166">+ 機械の停止時間</text>
</svg>
<p class="tb-caption">図: 手が検出面を横切った瞬間から、機械が止まるまでの時間 T のあいだにも手は進む。その分 (K×T) と、検出される前に入り込む分 (C) だけ危険区域から離す</p>
<h3>例題 — K = 1 600 での再計算まで</h3>
<p>手送りプレスの前面に、検出能力 d = 14 mm のライトカーテンを垂直に置きます。カタログ値の応答時間 20 ms、安全リレーと制御回路 30 ms、実測した機械の停止時間 300 ms です。</p>
<table class="tb-table">
  <tr><th>手順</th><th>計算</th></tr>
  <tr><td>① T を合計</td><td>T = 0.020 + 0.030 + 0.300 = 0.35 s</td></tr>
  <tr><td>② C を求める</td><td>C = 8 × (14 − 14) = 0 mm</td></tr>
  <tr><td>③ K = 2 000 で計算</td><td>S = 2 000 × 0.35 + 0 = 700 mm → 500 mm を超える</td></tr>
  <tr><td>④ K = 1 600 で再計算</td><td>S = 1 600 × 0.35 + 0 = 560 mm → 500 mm 以上なのでこの値を使える</td></tr>
  <tr><td>⑤ 結論</td><td>最小安全距離 <b>S = 560 mm</b>。停止時間の劣化を見込んで余裕を持たせ、定期的に停止時間を測る</td></tr>
</table>
<p>同じ機械に d = 30 mm (手の検出) のライトカーテンを使うと C = 8 × (30 − 14) = 128 mm。K = 2 000 で 828 mm、K = 1 600 で 688 mm となり、14 mm より 128 mm 遠くに置く必要があります。検出能力の細かいカーテンほど機械に近づけられます。</p>
<h3>よくある間違い</h3>
<ul>
  <li><b>カタログの応答時間だけで計算する</b>: 機械の停止時間 (ブレーキ、惰性) が最大の項であることが多い。必ず実測し、最悪条件 (最大負荷・最高速度) で測る</li>
  <li><b>上・下・横からの回り込み</b>: 光軸の上を越えて、下をくぐって、横のすき間から危険区域に届かないか。届くなら固定式ガードで塞ぐ</li>
  <li><b>カーテンと機械の間に人が立てる</b>: S が大きいと、カーテンを越えた後に人が中に残れる。再起動防止 (リセットは外から、危険区域を見渡せる位置) や追加の検出が必要</li>
  <li><b>ミューティングの誤用</b>: ワーク通過時に一時的に無効化する機能は、人とワークを確実に区別できる配置と条件でだけ使う</li>
</ul>
<p>T を小さくする (ブレーキの強化、応答の速い装置) と安全距離が縮まり、機械を小さくできます。<b>停止時間は実測</b>し、ブレーキの摩耗で長くならないか定期点検にも含めます。</p>
${NOTE}`,
    points: [
      "開ける頻度が低ければ固定式、頻繁ならインターロック付き、停止に時間がかかればガードロック",
      "安全用スイッチは直接開路動作・2 チャンネル・無効化されにくい構造",
      "安全距離 S = K × T + C。T は装置の応答 + 制御 + 機械の停止時間",
      "停止時間は実測し、ブレーキの劣化も定期点検で確認する",
    ],
    exercises: [
      {
        q: "検出能力 d = 14 mm のライトカーテン (応答時間 15 ms) を、停止時間 185 ms の機械に垂直方向に設置します。最小安全距離 S を求めてください。",
        a: "T = 0.015 + 0.185 = 0.2 s。C = 8 × (14 − 14) = 0。S = 2 000 × 0.2 + 0 = <b>400 mm</b>。100 mm 以上 500 mm 以下なので S = 400 mm。",
      },
      {
        q: "同じライトカーテンで、機械の停止時間がブレーキ劣化により 285 ms に延びました。S はいくらになりますか。",
        a: "T = 0.3 s。S = 2 000 × 0.3 = 600 mm &gt; 500 mm なので K = 1 600 で再計算: 1 600 × 0.3 = 480 mm。500 mm 未満になるので <b>S = 500 mm</b>。最初の設置位置 400 mm では不足します。停止時間の定期測定が重要な理由です。",
      },
      {
        q: "d = 30 mm のライトカーテンで T = 0.1 s のとき、S を求めてください。",
        a: "C = 8 × (30 − 14) = 128 mm。S = 2 000 × 0.1 + 128 = <b>328 mm</b>。",
      },
      {
        q: "体の検出用のライトカーテン (d &gt; 40 mm、複数光軸) を、停止時間を含めた T = 0.2 s の機械の手前に置きます。本文の式で S を求めてください。また、この配置で注意すべき点を 1 つ挙げてください。",
        a: "S = 1 600 × 0.2 + 850 = <b>1 170 mm</b>。体の検出用は手の侵入を検出できないので、光軸の間から手を差し込んだり、最下光軸の下をくぐったりできないよう、光軸の高さの条件を原文で確認します。また 1 m 以上離れるため、カーテンの内側に人が残れないかも確認し、リセットは危険区域を見渡せる外側に置きます。",
      },
    ],
    quiz: [
      { q: "毎日何度も開けて段取りする扉に適したガードは?", choices: ["ボルト止めの固定式ガード", "インターロック付き可動式ガード", "ガードなしで警告表示"], answer: 1, explain: "頻繁に開ける場所を固定式にすると、外したまま運転される原因になります。" },
      { q: "安全距離の式 S = K × T + C の T に含めるべきものは?", choices: ["機械の停止時間だけ", "保護装置の応答時間 + 制御回路 + 機械の停止時間", "作業者の反応時間"], answer: 1, explain: "検出してから危険な動きが止まるまでの全体の時間です。" },
      { q: "停止までに惰性回転が長く続く機械で使うべきものは?", choices: ["ガードロック付きインターロック", "非常停止ボタンだけ", "両手操作装置"], answer: 0, explain: "止まるまで開かないようにロックします。" },
    ],
  },

  // ------------------------------------------------------------------ 4
  {
    id: "safety-control",
    part: "knowhow",
    title: "制御システムの安全 — PL・カテゴリ・非常停止",
    minutes: 24,
    level: 3,
    lead: "インターロックやライトカーテンも、信号を受けて止める制御回路が故障すれば役に立ちません。ISO 13849-1 のパフォーマンスレベル (PL) とカテゴリ、ISO 13850 の非常停止と停止カテゴリを学びます。",
    body: `
<h2>安全機能と安全関連部</h2>
<p><b>安全機能</b>とは「ガードが開いたらモーターを止める」のように、故障すると直ちにリスクが高まる制御の機能です。入力 (スイッチ、センサ) → 論理 (セーフティリレー、安全 PLC) → 出力 (コンタクタ、安全トルクオフ付きインバータ、バルブ) の全体を<b>制御システムの安全関連部 (SRP/CS)</b> と呼びます。</p>
<svg class="tb-chart" viewBox="0 0 520 176" role="img" aria-label="安全機能の構成">
<g class="k-shadow"><rect class="k-panel" x="14" y="10" width="140" height="126" rx="8"/><rect class="k-panel" x="190" y="10" width="140" height="126" rx="8"/><rect class="k-panel" x="366" y="10" width="140" height="126" rx="8"/></g>
<g class="k-shadow">
<rect class="k-alu" x="30" y="22" width="44" height="58" rx="2"/>
<rect class="k-plastic" x="86" y="34" width="26" height="34" rx="3"/>
<rect class="k-part" x="72" y="46" width="16" height="8" rx="1"/>
<rect class="k-plastic" x="238" y="20" width="44" height="62" rx="3"/>
<rect class="k-alu" x="394" y="26" width="34" height="54" rx="3"/><rect class="k-alu" x="438" y="26" width="34" height="54" rx="3"/>
</g>
<rect x="34" y="26" width="36" height="50" style="fill:url(#k-dots)"/>
<circle cx="99" cy="42" r="2.4" style="fill:var(--tb-good)"/>
<rect x="244" y="40" width="32" height="20" rx="2" style="fill:var(--tb-surface)" opacity="0.85"/>
<circle cx="252" cy="50" r="2.6" style="fill:var(--tb-good)"/><circle cx="260" cy="50" r="2.6" style="fill:var(--tb-good)"/><circle cx="268" cy="50" r="2.6" style="fill:var(--tb-warn)"/>
<circle cx="246.0" cy="27" r="2.6" class="k-sphere" stroke-width="0.8"/><circle cx="255.5" cy="27" r="2.6" class="k-sphere" stroke-width="0.8"/><circle cx="265.0" cy="27" r="2.6" class="k-sphere" stroke-width="0.8"/><circle cx="274.5" cy="27" r="2.6" class="k-sphere" stroke-width="0.8"/><circle cx="246.0" cy="75" r="2.6" class="k-sphere" stroke-width="0.8"/><circle cx="255.5" cy="75" r="2.6" class="k-sphere" stroke-width="0.8"/><circle cx="265.0" cy="75" r="2.6" class="k-sphere" stroke-width="0.8"/><circle cx="274.5" cy="75" r="2.6" class="k-sphere" stroke-width="0.8"/>
<rect x="400" y="44" width="22" height="16" rx="2" fill="#2f333a"/><rect x="444" y="44" width="22" height="16" rx="2" fill="#2f333a"/>
<circle cx="402" cy="32" r="2.6" class="k-sphere" stroke-width="0.8"/><circle cx="411" cy="32" r="2.6" class="k-sphere" stroke-width="0.8"/><circle cx="420" cy="32" r="2.6" class="k-sphere" stroke-width="0.8"/><circle cx="446" cy="32" r="2.6" class="k-sphere" stroke-width="0.8"/><circle cx="455" cy="32" r="2.6" class="k-sphere" stroke-width="0.8"/><circle cx="464" cy="32" r="2.6" class="k-sphere" stroke-width="0.8"/><circle cx="402" cy="74" r="2.6" class="k-sphere" stroke-width="0.8"/><circle cx="411" cy="74" r="2.6" class="k-sphere" stroke-width="0.8"/><circle cx="420" cy="74" r="2.6" class="k-sphere" stroke-width="0.8"/><circle cx="446" cy="74" r="2.6" class="k-sphere" stroke-width="0.8"/><circle cx="455" cy="74" r="2.6" class="k-sphere" stroke-width="0.8"/><circle cx="464" cy="74" r="2.6" class="k-sphere" stroke-width="0.8"/>
<text class="k-title" x="84" y="104" text-anchor="middle">入力 I</text><text class="tick" x="84" y="122" text-anchor="middle">インターロック</text>
<text class="k-title" x="260" y="104" text-anchor="middle">論理 L</text><text class="tick" x="260" y="122" text-anchor="middle">安全リレー/PLC</text>
<text class="k-title" x="436" y="104" text-anchor="middle">出力 O</text><text class="tick" x="436" y="122" text-anchor="middle">コンタクタ×2</text>
<line x1="156" y1="73" x2="186" y2="73" style="stroke:var(--tb-accent)" stroke-width="2.2" marker-end="url(#k-arrow-blue)"/><line x1="332" y1="73" x2="362" y2="73" style="stroke:var(--tb-accent)" stroke-width="2.2" marker-end="url(#k-arrow-blue)"/>
<text class="mark-t" x="260" y="162" text-anchor="middle">安全機能の PL は I・L・O を組み合わせた全体で評価する</text>
</svg>
<p class="tb-caption">図: 一番弱い部分が全体の性能を決める。高価な安全 PLC を使っても、出力のコンタクタが 1 個では高い PL にならない</p>

<h2>要求パフォーマンスレベル PLr をリスクグラフで決める</h2>
<p>ISO 13849-1 では、安全機能ごとにリスクグラフで<b>PLr (a〜e)</b> を決めます。</p>
<table class="tb-table">
  <tr><th>S 危害のひどさ</th><td>S1: 軽傷 (通常は回復する) / S2: 重傷 (回復不能、死亡を含む)</td></tr>
  <tr><th>F 頻度・暴露時間</th><td>F1: まれ〜やや頻繁、または暴露時間が短い / F2: 頻繁〜連続、または暴露時間が長い</td></tr>
  <tr><th>P 回避の可能性</th><td>P1: 条件によっては可能 / P2: ほとんど不可能</td></tr>
</table>
<div data-widget="anim-riskgraph"></div>
<table class="tb-table">
  <tr><th></th><th>F1 P1</th><th>F1 P2</th><th>F2 P1</th><th>F2 P2</th></tr>
  <tr><th>S1</th><td>a</td><td>b</td><td>b</td><td>c</td></tr>
  <tr><th>S2</th><td>c</td><td>d</td><td>d</td><td>e</td></tr>
</table>
<p>2023 年版 (ISO 13849-1:2023) では、危険事象の発生確率が低い場合に 1 段階下げられる考え方の扱いなどが整理されています。適用する版の原文を確認してください。</p>

<h2>達成する PL — 4 つの要素</h2>
<p>設計した回路の PL は、次の組合せで決まります。</p>
<table class="tb-table">
  <tr><th>カテゴリ</th><td>構造 (下表)</td></tr>
  <tr><th>MTTF<sub>D</sub></th><td>各チャンネルの危険側故障までの平均時間。低: 3〜10 年 / 中: 10〜30 年 / 高: 30〜100 年</td></tr>
  <tr><th>DC</th><td>診断範囲 (危険側故障のうち検出できる割合)。なし: 60 % 未満 / 低: 60〜90 % / 中: 90〜99 % / 高: 99 % 以上</td></tr>
  <tr><th>CCF</th><td>共通原因故障の対策 (分離、異種の部品、過電圧対策など)。カテゴリ 2〜4 では点数評価で一定以上が必要</td></tr>
</table>
<table class="tb-table">
  <tr><th>カテゴリ</th><th>構造と考え方</th><th>1 つの故障で</th></tr>
  <tr><td>B</td><td>基本的な安全原則に従った部品</td><td>安全機能を失うことがある</td></tr>
  <tr><td>1</td><td>B + 十分に吟味された部品・安全原則 (MTTF<sub>D</sub> 高)</td><td>失うことがある (起こりにくい)</td></tr>
  <tr><td>2</td><td>1 チャンネル + 定期的な機能テスト</td><td>テストの間に失うことがある</td></tr>
  <tr><td>3</td><td>2 チャンネル (冗長) + 監視</td><td>失わない。故障の一部を検出</td></tr>
  <tr><td>4</td><td>2 チャンネル + 高い監視</td><td>失わない。故障を検出し、蓄積しても失わない</td></tr>
</table>
<svg class="tb-chart" viewBox="0 0 520 236" role="img" aria-label="カテゴリ 3 の 2 チャンネル回路の例">
<text class="k-title" x="14" y="18">カテゴリ 3 / 4 の例: 2 チャンネル + 相互監視 + フィードバック</text>
<path d="M88,70 L150,70 L150,84 L190,84" fill="none" style="stroke:var(--tb-accent)" stroke-width="2.4"/>
<path d="M88,150 L150,150 L150,136 L190,136" fill="none" style="stroke:var(--tb-warn)" stroke-width="2.4"/>
<path d="M270,84 L310,70" fill="none" style="stroke:var(--tb-accent)" stroke-width="2.4"/>
<path d="M270,136 L310,150" fill="none" style="stroke:var(--tb-warn)" stroke-width="2.4"/>
<path d="M335,100 L335,112 L292,112 M335,180 L335,212 L232,212 L232,176" fill="none" style="stroke:var(--tb-good)" stroke-width="1.8" stroke-dasharray="5 3"/>
<path d="M292,112 L292,212" fill="none" style="stroke:var(--tb-good)" stroke-width="1.8" stroke-dasharray="5 3"/>
<line class="k-hidden" x1="360" y1="66" x2="432" y2="66"/><line class="k-hidden" x1="360" y1="146" x2="432" y2="146"/>
<path d="M444,34 L444,56 M444,78 L444,136 M444,158 L444,176" fill="none" style="stroke:#b8642d" stroke-width="3.2"/>
<line x1="444" y1="56" x2="452" y2="76" style="stroke:var(--k-line)" stroke-width="2.4"/><line x1="444" y1="136" x2="452" y2="156" style="stroke:var(--k-line)" stroke-width="2.4"/>
<circle cx="444" cy="56" r="2.6" style="fill:var(--k-line)"/><circle cx="444" cy="78" r="2.6" style="fill:var(--k-line)"/><circle cx="444" cy="136" r="2.6" style="fill:var(--k-line)"/><circle cx="444" cy="158" r="2.6" style="fill:var(--k-line)"/>
<g class="k-shadow">
<rect class="k-alu" x="14" y="36" width="52" height="150" rx="3"/>
<rect class="k-yellow" x="64" y="58" width="24" height="24" rx="3"/><rect class="k-yellow" x="64" y="138" width="24" height="24" rx="3"/>
<rect class="k-plastic" x="190" y="50" width="82" height="126" rx="6"/>
<rect class="k-alu" x="310" y="40" width="50" height="60" rx="4"/><rect class="k-alu" x="310" y="120" width="50" height="60" rx="4"/>
<circle class="k-part" cx="444" cy="198" r="22"/>
</g>
<rect class="k-glass" x="22" y="46" width="36" height="100" rx="2"/>
<rect class="k-screen" x="200" y="62" width="62" height="26" rx="3"/><text class="k-screen-t" x="231" y="80" text-anchor="middle">SAFE</text>
<circle class="k-led-g" cx="210" cy="104" r="4.5"/><circle class="k-led-g" cx="226" cy="104" r="4.5"/><circle class="k-led-off" cx="242" cy="104" r="4.5"/>
<text class="k-note" x="231" y="132" text-anchor="middle">相互比較</text>
<path d="M216,140 L246,140" fill="none" style="stroke:var(--k-line-2)" stroke-width="1.4" marker-start="url(#k-arrow)" marker-end="url(#k-arrow)"/>
<text class="lbl" x="335" y="76" text-anchor="middle">K1</text><text class="lbl" x="335" y="156" text-anchor="middle">K2</text>
<text class="lbl" x="444" y="203" text-anchor="middle">M</text>
<text class="k-note" x="76" y="52" text-anchor="middle">SW1</text><text class="k-note" x="76" y="178" text-anchor="middle">SW2</text>
<text class="k-note" x="40" y="200" text-anchor="middle">扉</text>
<text class="k-note" x="118" y="64" style="fill:var(--tb-accent)">ch1</text><text class="k-note" x="118" y="166" style="fill:var(--tb-warn)">ch2</text>
<text class="k-note" x="231" y="192" text-anchor="middle">安全リレー</text>
<text class="k-note" x="456" y="30">電源</text>
<text class="k-note" x="300" y="228" style="fill:var(--tb-good)">ミラー接点で溶着を監視</text>
</svg>
<p class="tb-caption">図: 扉のスイッチ 2 個 (異なる動作原理にすると共通原因故障に強い) → 安全リレーで相互比較 → コンタクタ 2 個を直列に。片方が故障しても、もう片方で止められる。コンタクタの接点溶着は補助接点 (ミラー接点) で監視し、次の起動を禁止する</p>
<p>PL と PFH<sub>D</sub> (1 時間あたりの危険側故障確率) の対応: a: 10<sup>−5</sup>〜10<sup>−4</sup>、b: 3×10<sup>−6</sup>〜10<sup>−5</sup>、c: 10<sup>−6</sup>〜3×10<sup>−6</sup>、d: 10<sup>−7</sup>〜10<sup>−6</sup>、e: 10<sup>−8</sup>〜10<sup>−7</sup>。達成 PL ≥ PLr を確認し、計算には SISTEMA などのツールがよく使われます。</p>

<h3>例題 — 安全機能ごとに PLr を決める</h3>
<p>ロボットセル (前節の図) の安全機能を 3 つ取り出し、リスクグラフで PLr を決めます。PLr は「機械ごと」ではなく「安全機能ごと」に決めるのがポイントです。</p>
<table class="tb-table">
  <tr><th>安全機能</th><th>S</th><th>F</th><th>P</th><th>PLr</th></tr>
  <tr><td>扉を開けたらロボットを停止 (段取りで 1 日数十回開ける)</td><td>S2 (アームの衝突で重傷)</td><td>F2</td><td>P2 (高速)</td><td><b>e</b></td></tr>
  <tr><td>同上、ただし扉が開いている間は監視付き低速 (250 mm/s 以下など) でしか動かない場合</td><td>S2</td><td>F2</td><td>P1 (低速で回避の余地あり)</td><td><b>d</b></td></tr>
  <tr><td>投入口のコンベヤ (低速・小さな力) で指をはさむ</td><td>S1 (打撲程度)</td><td>F2</td><td>P1</td><td><b>b</b></td></tr>
</table>
<p>2 行目のように、速度を制限して回避の可能性を上げることで PLr を下げられることがあります。ただし低速の監視自体が安全機能になり、その PL も評価が必要です。</p>
<h3>よくある間違い</h3>
<ul>
  <li>安全 PLC やセーフティリレーの「PL e 対応」を見て、回路全体が PL e だと思い込む — 入力・出力の構成と部品の MTTF<sub>D</sub> で決まる</li>
  <li>2 チャンネルにしたが、2 本の配線を同じケーブルに通して一緒に断線・短絡する — 配線の分離や短絡検出 (テストパルス) で共通原因故障を防ぐ</li>
  <li>コンタクタの溶着を監視していない — 1 個が溶着したまま運転を続け、2 個目の故障で安全機能を失う (故障の蓄積)</li>
  <li>非常停止を「安全防護の代わり」にする — 人が危険に気付いて押すまでに危害が起きる</li>
</ul>

<h2>非常停止 (ISO 13850) と停止カテゴリ (IEC 60204-1)</h2>
<table class="tb-table">
  <tr><th>停止カテゴリ 0</th><td>動力を直ちに遮断する (制御されない停止)</td></tr>
  <tr><th>停止カテゴリ 1</th><td>制御して減速・停止させ、停止後に動力を遮断する</td></tr>
  <tr><th>停止カテゴリ 2</th><td>制御して停止させ、動力は保持したまま</td></tr>
</table>
<ul>
  <li>非常停止は<b>停止カテゴリ 0 または 1</b> とし、リスクアセスメントで選ぶ (カテゴリ 2 は使えない)</li>
  <li>操作部は<b>赤色</b>、背景は<b>黄色</b>。押したら<b>自己保持 (ラッチ)</b> し、意図的な操作で解除する</li>
  <li>解除しても機械は再起動しない。別のリセット・起動操作が必要</li>
  <li>非常停止は<b>補助的な保護方策</b>であり、ガードや保護装置の代わりにはならない</li>
  <li>操作者の位置と、危険に気付く可能性のある場所から容易に届く位置に</li>
</ul>
<svg class="tb-chart" viewBox="0 0 520 206" role="img" aria-label="非常停止の押下、ラッチ、解除後のリセット">
<rect class="k-panel" x="8" y="8" width="164" height="190" rx="8"/><rect class="k-panel" x="178" y="8" width="164" height="190" rx="8"/><rect class="k-panel" x="348" y="8" width="164" height="190" rx="8"/>
<circle class="k-badge" cx="26" cy="27" r="10"/><text class="k-badge-t" x="26" y="31" text-anchor="middle">1</text><text class="k-title" x="42" y="32">運転中</text>
<circle class="k-badge" cx="196" cy="27" r="10"/><text class="k-badge-t" x="196" y="31" text-anchor="middle">2</text><text class="k-title" x="212" y="32">押す → ラッチ</text>
<circle class="k-badge" cx="366" cy="27" r="10"/><text class="k-badge-t" x="366" y="31" text-anchor="middle">3</text><text class="k-title" x="382" y="32">解除しても停止</text>
<g class="k-shadow"><rect class="k-plastic" x="56" y="132" width="48" height="40" rx="3"/><rect class="k-yellow" x="36" y="120" width="88" height="12" rx="3"/></g>
<rect class="k-part" x="73" y="100" width="14" height="20"/>
<path class="k-estop" d="M48,104 Q80,64 112,104 Z"/><g class="k-shadow"><rect class="k-plastic" x="226" y="132" width="48" height="40" rx="3"/><rect class="k-yellow" x="206" y="120" width="88" height="12" rx="3"/></g>
<rect class="k-part" x="243" y="112" width="14" height="8"/>
<path class="k-estop" d="M218,116 Q250,76 282,116 Z"/><g class="k-shadow"><rect class="k-plastic" x="396" y="132" width="48" height="40" rx="3"/><rect class="k-yellow" x="376" y="120" width="88" height="12" rx="3"/></g>
<rect class="k-part" x="413" y="100" width="14" height="20"/>
<path class="k-estop" d="M388,104 Q420,64 452,104 Z"/>
<circle class="k-led-g" cx="150" cy="58" r="7"/><circle class="k-led-r" cx="320" cy="58" r="7"/><circle class="k-led-y" cx="490" cy="58" r="7"/>
<line class="k-force" x1="250" y1="44" x2="250" y2="70"/>
<path class="k-move" d="M396,66 A30,14 0 0 1 456,62"/>
<text class="k-note" x="90" y="188" text-anchor="middle">機械は運転・緑ランプ</text>
<text class="k-note" x="260" y="188" text-anchor="middle">押し込まれた位置で保持</text>
<text class="k-note" x="430" y="188" text-anchor="middle">リセット + 起動で再開</text>
</svg>
<p class="tb-caption">図: 非常停止の操作部は赤、背景は黄。押すと機械的にラッチし、回す・引くなどの意図的な操作でしか戻らない。戻しただけでは動かず、別のリセット・起動操作が必要</p>
<p>重力でアームが落ちる機械では、カテゴリ 0 でブレーキだけに頼ると落下距離が大きくなることがあります。カテゴリ 1 で減速してからブレーキをかけるのか、機械式の落下防止を設けるのかを検討します。</p>
${NOTE}`,
    points: [
      "安全機能は入力・論理・出力の全体で評価し、一番弱い部分が全体を決める",
      "PLr は S・F・P のリスクグラフで決め、達成 PL (カテゴリ・MTTFD・DC・CCF) ≥ PLr を確認",
      "カテゴリ 3/4 は 2 チャンネル + 監視で、1 つの故障で安全機能を失わない",
      "非常停止は停止カテゴリ 0 か 1、赤/黄、自己保持、解除で再起動しない",
    ],
    exercises: [
      {
        q: "ローラ間への手の巻き込み (骨折・切断の恐れ) があり、作業者は 1 日に何度も近づき、ローラは高速で回避はほとんど不可能です。リスクグラフで PLr を求めてください。",
        a: "S2 (切断は回復不能) → F2 (頻繁) → P2 (回避ほぼ不可能) → <b>PLr = e</b>。危険源を除去する、速度を落として P1 にできないかなど、第 1 段階の対策も合わせて検討します。",
      },
      {
        q: "ある安全機能の PFHD が 2.0 × 10⁻⁷ /h と計算されました。この値に対応する PL はどれですか。また PLr = e を満たしますか。",
        a: "10⁻⁷ 以上 10⁻⁶ 未満なので <b>PL d</b>。PL e は 10⁻⁸〜10⁻⁷ なので<b>満たしません</b> (カテゴリ・DC・MTTFD などの要件も別途必要)。",
      },
      {
        q: "扉インターロックを 2 チャンネルで安全リレーに入れ、出力はコンタクタ 1 個だけでモーターを止めています。この構成の弱点と、カテゴリ 3 にするための改善を説明してください。",
        a: "出力が 1 チャンネルなので、コンタクタの接点が溶着すると扉を開けてもモーターが止まりません (1 つの故障で安全機能を失う)。改善: コンタクタを 2 個直列にし (K1・K2)、それぞれのミラー接点を安全リレーのフィードバック回路に入れて、溶着していれば次の起動を禁止します。インバータ駆動なら、安全トルクオフ (STO) 入力を 2 チャンネルで使う方法もあります。",
      },
    ],
    quiz: [
      { q: "非常停止に使えない停止カテゴリは?", choices: ["カテゴリ 0", "カテゴリ 1", "カテゴリ 2"], answer: 2, explain: "非常停止は停止カテゴリ 0 か 1 です。カテゴリ 2 は動力を保持したままです。" },
      { q: "1 つの故障で安全機能を失わず、故障の蓄積も考慮するカテゴリは?", choices: ["カテゴリ 2", "カテゴリ 3", "カテゴリ 4"], answer: 2, explain: "カテゴリ 4 は高い診断で故障を検出し、蓄積しても安全機能を失いません。" },
      { q: "S1・F2・P2 の PLr は?", choices: ["b", "c", "d"], answer: 1, explain: "S1 の枝では F2・P2 が最も高く PLr = c です。" },
    ],
  },

  // ------------------------------------------------------------------ 5
  {
    id: "energy-safety",
    part: "knowhow",
    title: "電気・空圧・残留エネルギーの安全",
    minutes: 18,
    level: 2,
    lead: "電源を切っても機械が安全とは限りません。コンデンサの電荷、配管に残った圧力、持ち上げられた荷物の重力、圧縮されたばね — 残留エネルギーを設計で逃がし、保全時に確実に遮断・確認できる機械にする方法を学びます。",
    body: `
<h2>エネルギーの種類と残り方</h2>
<table class="tb-table">
  <tr><th>種類</th><th>残る場所</th><th>設計での対策</th></tr>
  <tr><td>電気</td><td>インバータ・サーボアンプの平滑コンデンサ、UPS</td><td>放電抵抗、充電表示 LED、放電待ち時間の表示</td></tr>
  <tr><td>空圧</td><td>シリンダと電磁弁の間、タンク</td><td>残圧排気弁 (ロック付き)、圧力計、急速排気</td></tr>
  <tr><td>油圧</td><td>アキュムレータ、シリンダの閉じ込め回路</td><td>アキュムレータの自動放圧弁、圧力計</td></tr>
  <tr><td>重力</td><td>上昇した昇降部、垂直軸、カウンタウェイト</td><td>機械式の落下防止 (安全ブロック、ラチェット)、保持ブレーキ</td></tr>
  <tr><td>機械</td><td>圧縮ばね、張ったベルト、はずみ車の惰性回転</td><td>ばねの解放手順、回転停止の確認</td></tr>
  <tr><td>熱</td><td>ヒーター、加熱した金型</td><td>温度表示、冷却待ち</td></tr>
</table>

<h2>LOTO を支える設計</h2>
<p>保全作業の手順としての LOTO (ロックアウト・タグアウト) は「保守マニュアル」の章で扱いました。設計者の役割は、その手順を<b>確実に・簡単にできる機械</b>にすることです。</p>
<ul>
  <li>主電源の遮断器を、<b>南京錠で切位置にロックできる</b>ものにする (IEC 60204-1 の電源断路器)</li>
  <li>エアの元弁を<b>ロック可能な残圧排気付き 3 ポート弁</b>にする。閉じると下流の圧力を抜く</li>
  <li>エネルギー源ごとの<b>遮断点の一覧と位置</b>を機械に表示し、取扱説明書に載せる</li>
  <li>遮断後に<b>ゼロエネルギーを確認</b>できる手段 (圧力計、充電表示、検電端子)</li>
  <li>制御回路の停止 (ソフトの停止、非常停止) は<b>遮断ではない</b> — 保全の隔離には使わない</li>
</ul>

<svg class="tb-chart" viewBox="0 0 520 236" role="img" aria-label="主電源断路器とエア元弁のロックアウト">
<rect class="k-panel" x="8" y="8" width="250" height="220" rx="8"/><rect class="k-panel" x="262" y="8" width="250" height="220" rx="8"/>
<text class="k-title" x="22" y="30">主電源断路器を切でロック</text><text class="k-title" x="276" y="30">エア元弁を閉・残圧排気でロック</text>
<g class="k-shadow"><rect class="k-alu" x="30" y="42" width="130" height="176" rx="4"/></g>
<rect class="k-yellow" x="58" y="70" width="74" height="74" rx="6"/>
<text class="k-note" x="95" y="84" text-anchor="middle" style="fill:#1f2328">ON</text><text class="k-note" x="95" y="138" text-anchor="middle" style="fill:#1f2328">OFF</text>
<circle class="k-part" cx="95" cy="107" r="16"/>
<g class="k-shadow"><rect x="88" y="104" width="54" height="12" rx="4" fill="#d32f2f" style="stroke:#5a0a0a" stroke-width="1.2"/></g>
<rect class="k-part" x="104" y="150" width="30" height="10" rx="2"/>
<path d="M105,166 L105,156 A7,7 0 0 1 119,156 L119,166" fill="none" style="stroke:var(--k-line)" stroke-width="3.2"/>
<rect x="101" y="166" width="22" height="20" rx="3" fill="#d32f2f" style="stroke:var(--k-line)" stroke-width="1.2"/><circle cx="112" cy="175" r="2.2" fill="#1f2328"/><path d="M125,166 L125,156 A7,7 0 0 1 139,156 L139,166" fill="none" style="stroke:var(--k-line)" stroke-width="3.2"/>
<rect x="121" y="166" width="22" height="20" rx="3" fill="#1565c0" style="stroke:var(--k-line)" stroke-width="1.2"/><circle cx="132" cy="175" r="2.2" fill="#1f2328"/>
<path d="M112,186 Q120,196 180,176" fill="none" style="stroke:var(--k-line-2)" stroke-width="1.2"/>
<g class="k-shadow"><rect x="176" y="132" width="70" height="86" rx="4" fill="#ffffff" style="stroke:#d32f2f" stroke-width="2"/></g>
<rect x="176" y="132" width="70" height="20" rx="3" fill="#d32f2f"/><text x="211" y="147" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="bold">操作禁止</text>
<text x="211" y="170" text-anchor="middle" fill="#222" font-size="10">保全作業中</text><text x="211" y="186" text-anchor="middle" fill="#222" font-size="10">氏名・連絡先</text><text x="211" y="202" text-anchor="middle" fill="#222" font-size="10">日時</text>
<circle cx="182" cy="176" r="3" fill="none" style="stroke:#222"/>
<text class="k-note" x="190" y="66">2 人なら</text><text class="k-note" x="190" y="82">錠も 2 個</text>
<path d="M276,110 L310,110 M402,110 L500,110" fill="none" style="stroke:var(--k-line)" stroke-width="7"/>
<g class="k-shadow"><rect class="k-alu" x="310" y="92" width="92" height="40" rx="5"/><rect class="k-yellow" x="338" y="62" width="36" height="30" rx="4"/><rect class="k-part" x="350" y="132" width="12" height="18"/></g>
<path d="M346,150 l-6,14 M356,150 l0,16 M366,150 l6,14" fill="none" style="stroke:var(--k-line-2)" stroke-width="1.6" stroke-dasharray="3 2"/>
<path d="M349,70 L349,60 A7,7 0 0 1 363,60 L363,70" fill="none" style="stroke:var(--k-line)" stroke-width="3.2"/>
<rect x="345" y="70" width="22" height="20" rx="3" fill="#d32f2f" style="stroke:var(--k-line)" stroke-width="1.2"/><circle cx="356" cy="79" r="2.2" fill="#1f2328"/>
<circle class="k-part" cx="450" cy="80" r="22"/><circle cx="450" cy="80" r="17" style="fill:var(--tb-surface)"/>
<line x1="450" y1="80" x2="438" y2="90" style="stroke:var(--tb-bad)" stroke-width="2"/><text x="450" y="74" text-anchor="middle" font-size="9" style="fill:var(--tb-text)">0 MPa</text>
<rect class="k-part" x="446" y="102" width="8" height="8"/>
<text class="k-note" x="280" y="96">供給</text><text class="k-note" x="470" y="130">機械側</text>
<text class="k-note" x="356" y="186" text-anchor="middle">閉じると下流を排気</text>
<text class="k-note" x="450" y="54" text-anchor="middle">圧力計で確認</text>
<text class="k-good-t" x="386" y="214" text-anchor="middle">遮断 → ロック → ゼロ確認</text>
</svg>
<p class="tb-caption">図: 断路器のハンドルは切位置で南京錠を掛けられる構造にし、作業者一人ひとりが自分の錠と札を掛ける。エアは元弁を閉じると下流の残圧を排気する弁にし、圧力計で 0 を確かめられるようにする</p>
<h2>空圧回路の落とし穴</h2>
<svg class="tb-chart" viewBox="0 0 520 254" role="img" aria-label="垂直シリンダの落下">
<rect class="k-panel" x="8" y="8" width="244" height="238" rx="8"/><rect class="k-panel" x="268" y="8" width="244" height="238" rx="8"/>
<circle class="k-badge" cx="28" cy="28" r="10" style="fill:var(--tb-bad)"/><text class="k-badge-t" x="28" y="32" text-anchor="middle">✕</text><text class="k-title" x="46" y="32">対策なし</text><circle class="k-badge" cx="288" cy="28" r="10" style="fill:var(--tb-good)"/><text class="k-badge-t" x="288" y="32" text-anchor="middle">✓</text><text class="k-title" x="306" y="32">落下防止あり</text>
<g transform="translate(0 14)">
<rect x="66" y="72" width="28" height="76" style="fill:var(--tb-accent)" opacity="0.12"/><g class="k-shadow"><rect class="k-part" x="74" y="28" width="12" height="7"/><rect class="k-cut" x="60" y="42" width="6" height="106"/><rect class="k-cut" x="94" y="42" width="6" height="106"/><rect class="k-cut" x="57" y="34" width="46" height="8" rx="1"/><rect class="k-cut" x="57" y="148" width="18" height="8" rx="1"/><rect class="k-cut" x="85" y="148" width="18" height="8" rx="1"/><rect class="k-part-h" x="75" y="72" width="10" height="114"/><rect class="k-part" x="66" y="60" width="28" height="12" rx="1"/><rect class="k-part" x="42" y="186" width="76" height="26" rx="2"/><rect class="k-part" x="100" y="138" width="8" height="8"/></g><text class="tick" x="80" y="203" text-anchor="middle">荷重</text>
<line class="k-force" x1="134" y1="150" x2="134" y2="206"/>
<text class="k-bad-t" x="146" y="100" text-anchor="start">排気すると</text><text class="k-bad-t" x="146" y="117" text-anchor="start">自重で落下</text>
<text class="tick" x="80" y="226" text-anchor="middle">荷重 (重力)</text>
<rect x="306" y="72" width="28" height="76" style="fill:var(--tb-accent)" opacity="0.12"/><g class="k-shadow"><rect class="k-part" x="314" y="28" width="12" height="7"/><rect class="k-cut" x="300" y="42" width="6" height="106"/><rect class="k-cut" x="334" y="42" width="6" height="106"/><rect class="k-cut" x="297" y="34" width="46" height="8" rx="1"/><rect class="k-cut" x="297" y="148" width="18" height="8" rx="1"/><rect class="k-cut" x="325" y="148" width="18" height="8" rx="1"/><rect class="k-part-h" x="315" y="72" width="10" height="114"/><rect class="k-part" x="306" y="60" width="28" height="12" rx="1"/><rect class="k-part" x="282" y="186" width="76" height="26" rx="2"/><rect class="k-part" x="340" y="138" width="8" height="8"/></g><text class="tick" x="320" y="203" text-anchor="middle">荷重</text>
<path d="M348,142 L364,142 L364,56 L378,56" fill="none" style="stroke:var(--k-line)" stroke-width="2"/>
<rect x="378" y="42" width="126" height="28" rx="5" style="fill:var(--tb-surface)"/><rect x="378" y="42" width="126" height="28" rx="5" style="fill:var(--tb-good);stroke:var(--tb-good)" fill-opacity="0.16" stroke-width="1.4"/>
<circle cx="392" cy="56" r="5" fill="none" style="stroke:var(--tb-good)" stroke-width="1.6"/><path d="M384,49 L392,56 L384,63" fill="none" style="stroke:var(--tb-good)" stroke-width="1.6"/>
<text class="tick" x="448" y="60" text-anchor="middle">パイロット逆止</text>
<g class="k-shadow"><rect class="k-part" x="306" y="158" width="28" height="12" rx="2"/>
<rect x="333" y="172" width="22" height="14" rx="1" fill="#f2c230" style="stroke:var(--k-line)" stroke-width="1.2"/></g>
<path d="M337,172 L333,177 M343,172 L335,184 M349,172 L339,186 M355,174 L346,186 M355,181 L352,186" style="stroke:#2a2f38" stroke-width="2"/>
<line class="k-thin" x1="334" y1="164" x2="390" y2="140"/><rect x="390" y="124" width="100" height="26" rx="5" style="fill:var(--tb-surface)"/><rect x="390" y="124" width="100" height="26" rx="5" style="fill:var(--tb-good);stroke:var(--tb-good)" fill-opacity="0.16" stroke-width="1.4"/><text class="tick" x="440" y="142" text-anchor="middle">ロッドロック</text>
<line class="k-thin" x1="355" y1="180" x2="390" y2="196"/><rect x="390" y="184" width="100" height="26" rx="5" style="fill:var(--tb-surface)"/><rect x="390" y="184" width="100" height="26" rx="5" style="fill:var(--tb-good);stroke:var(--tb-good)" fill-opacity="0.16" stroke-width="1.4"/><text class="tick" x="440" y="202" text-anchor="middle">安全ブロック</text>
</g>
</svg>
<p class="tb-caption">図: 垂直に荷重を持つシリンダは、残圧を抜くと落ちる。逆止弁は漏れがあるので長時間の保持には機械式のロックや安全ブロックを併用する</p>
<ul>
  <li><b>排気すると落ちる</b> / <b>残圧で動き出す</b>: 両方を同時に満たす対策は少なく、機械式ロックで保持してから排気するのが基本</li>
  <li><b>再加圧時の飛び出し</b>: シリンダの片側だけ排気された状態で圧を戻すと急に動く。スロースタート弁で徐々に加圧する</li>
  <li><b>5 ポート弁の中立位置</b>: クローズドセンタ (保持)、エキゾーストセンタ (排気)、プレッシャセンタのどれが安全かは、負荷の向きで変わる</li>
</ul>

<h3>例題 — 残圧の力とエネルギー</h3>
<p>内径 50 mm のシリンダに、元弁を閉じた後もゲージ圧 0.5 MPa が閉じ込められているとします。</p>
<ul>
  <li>ピストンを押す力: F = p × A = 0.5 N/mm² × π × 25² mm² ≈ <b>982 N</b> (約 100 kgf)。継手を緩めた瞬間にロッドが動けば、指を押しつぶすのに十分な力です</li>
  <li>配管とシリンダ内の閉じ込め空気が 0.5 L あるとき、等温膨張で取り出せる仕事は W = p₁V ln(p₁/p₀) ≈ 0.601 MPa × 0.5 L × ln(0.601/0.101) ≈ <b>約 540 J</b> (絶対圧で計算)。高さ 1 m から 55 kg の物を落とすのと同程度で、ホースが外れて暴れる原因になります</li>
</ul>
<p>比べると、インバータのコンデンサ 1 000 µF が DC 560 V に充電されていれば E = ½CV² = ½ × 0.001 × 560² ≈ <b>157 J</b>。いずれも「電源を切った」だけでは消えないエネルギーです。</p>
<h3>よくある間違い</h3>
<ul>
  <li>電磁弁を OFF にしただけで「エアを切った」と考える (弁の下流に圧が残る、手動操作ボタンで動く)</li>
  <li>残圧排気弁の排気口をふさぐ・サイレンサが目詰まりして、排気に時間がかかる</li>
  <li>サーボの垂直軸を保持ブレーキだけで支えて下に入る (ブレーキの摩耗・油の付着で滑る)</li>
</ul>

<h2>電気の安全 (概要)</h2>
<ul>
  <li><b>直接接触の保護</b>: 充電部を外郭 (IP2X 以上など) で覆う、扉を開けると主電源が切れる構造</li>
  <li><b>間接接触の保護</b>: 保護接地 (PE) と漏電遮断器。全ての露出導電部を接地する</li>
  <li><b>コンデンサの放電</b>: IEC 60204-1 では、電源を切った後に危険な電圧が残る場合、所定の時間内に放電させるか、警告表示を行う</li>
</ul>
<p>放電の時定数 τ = RC。電圧は V = V₀ e<sup>−t/τ</sup> で下がり、蓄えられるエネルギーは E = ½CV² です。</p>
${NOTE}`,
    points: [
      "電源を切っても電気・圧力・重力・ばね・熱のエネルギーは残る",
      "ロック可能な遮断器・残圧排気弁と、ゼロエネルギーを確認できる手段を設計で用意",
      "垂直荷重は排気で落ちる — 機械式ロック・安全ブロックで保持してから排気",
      "コンデンサは E = ½CV²、放電は V = V₀ e^(−t/RC)",
    ],
    exercises: [
      {
        q: "インバータの平滑コンデンサ 2 200 µF が DC 300 V に充電されています。蓄えられたエネルギーと、10 kΩ の放電抵抗で 50 V まで下がる時間を求めてください。",
        a: "E = ½ × 0.0022 × 300² = <b>99 J</b>。τ = RC = 10 000 × 0.0022 = 22 s。t = τ ln(300/50) = 22 × ln 6 ≈ 22 × 1.79 ≈ <b>39 s</b>。カバーに「電源を切った後、1 分以上待ってから開ける」などと表示し、充電表示 LED を設けます。",
      },
      {
        q: "質量 50 kg の昇降部が高さ 1.2 m の位置にあります。落下した場合の位置エネルギーを求め、保全時の対策を挙げてください (g = 9.8 m/s²)。",
        a: "E = mgh = 50 × 9.8 × 1.2 ≈ <b>588 J</b>。保全時は下降端まで下げる、または安全ブロック・機械式ロックで保持してから動力を遮断・残圧を排気します。保持ブレーキだけに頼らないようにします。",
      },
      {
        q: "内径 63 mm のシリンダにゲージ圧 0.5 MPa の残圧があります。ロッドを押し出す力を求めてください。",
        a: "A = π × 31.5² ≈ 3 117 mm²。F = 0.5 × 3 117 ≈ <b>1 559 N</b> (約 160 kgf)。継手を外す前に残圧排気弁で排気し、圧力計で 0 を確認します。",
      },
    ],
    quiz: [
      { q: "保全時の隔離 (LOTO) に使ってはいけないものは?", choices: ["ロック可能な主電源断路器", "非常停止ボタンや制御の停止指令", "ロック可能な残圧排気弁"], answer: 1, explain: "制御による停止は動力源の遮断ではないので、隔離には使いません。" },
      { q: "垂直シリンダで荷重を保持している回路を排気すると?", choices: ["その位置で止まる", "自重で落下する恐れがある", "上昇する"], answer: 1, explain: "排気で保持力を失うので、機械式ロックなどで保持してから排気します。" },
      { q: "コンデンサの電圧を半分にすると、蓄えられたエネルギーは?", choices: ["1/2", "1/4", "変わらない"], answer: 1, explain: "E = ½CV² なので 1/4 になります。" },
    ],
  },

  // ------------------------------------------------------------------ 6
  {
    id: "safety-info",
    part: "knowhow",
    title: "使用上の情報 — 警告表示と取扱説明書",
    minutes: 16,
    level: 2,
    lead: "3 ステップの最後が使用上の情報です。設計と防護で残ったリスク (残留リスク) を、誰に・どこで・何を伝えるか。ISO 3864 / JIS の安全標識、警告ラベルの構成、取扱説明書の書き方を学びます。",
    body: `
<h2>使用上の情報の役割と限界</h2>
<p>警告は人が読み、理解し、従って初めて効果を持ちます。だから最後の手段です。「設計で対策できたのにラベルで済ませる」ことは許されません。一方で、残留リスクを<b>伝えないこと</b>も設計の欠陥になります。ISO 12100 の 6.4 項と ISO 20607 (取扱説明書) が基本です。</p>

<h2>安全標識の形と色 (ISO 3864-1 / JIS Z 9103 など)</h2>
<svg class="tb-chart" viewBox="0 0 520 170" role="img" aria-label="安全標識の 4 種類">
<g class="k-shadow">
<circle cx="70" cy="70" r="44" fill="#ffffff"/><circle cx="70" cy="70" r="38" fill="#ffffff" stroke="#d32f2f" stroke-width="9"/><line x1="43" y1="43" x2="97" y2="97" stroke="#d32f2f" stroke-width="9"/>
<circle cx="200" cy="70" r="44" fill="#ffffff"/><circle cx="200" cy="70" r="40" fill="#1565c0"/>
<polygon points="330,24 380,110 280,110" fill="#fbc02d" stroke="#222" stroke-width="6" stroke-linejoin="round"/>
<rect x="418" y="28" width="84" height="84" rx="6" fill="#ffffff"/><rect x="422" y="32" width="76" height="76" rx="4" fill="#2e7d32"/>
</g>
<rect x="195" y="46" width="10" height="32" rx="4" fill="#ffffff"/><circle cx="200" cy="90" r="6" fill="#ffffff"/>
<rect x="326" y="56" width="8" height="30" rx="3" fill="#222"/><circle cx="330" cy="96" r="5" fill="#222"/>
<rect x="453" y="44" width="14" height="52" fill="#ffffff"/><rect x="434" y="63" width="52" height="14" fill="#ffffff"/>
<text class="lbl" x="70" y="138" text-anchor="middle">禁止</text><text class="tick" x="70" y="155" text-anchor="middle">赤の円と斜線</text>
<text class="lbl" x="200" y="138" text-anchor="middle">指示 (義務)</text><text class="tick" x="200" y="155" text-anchor="middle">青の円</text>
<text class="lbl" x="330" y="138" text-anchor="middle">警告 (注意)</text><text class="tick" x="330" y="155" text-anchor="middle">黄の三角と黒枠</text>
<text class="lbl" x="460" y="138" text-anchor="middle">安全状態</text><text class="tick" x="460" y="155" text-anchor="middle">緑の四角</text>
</svg>
<p class="tb-caption">図: 形と色で意味が決まっている。図記号 (ピクトグラム) は ISO 7010 に登録されたものを優先して使う (この図は形と色の説明用の簡略図)</p>

<h2>警告ラベルの構成</h2>
<p>製品安全ラベルでは、ISO 3864-2 や ANSI Z535 などの考え方に沿って、次の要素を組み合わせます。</p>
<table class="tb-table">
  <tr><th>シグナルワード</th><td><b>危険</b>: 回避しないと死亡・重傷を招く切迫した状況 / <b>警告</b>: 死亡・重傷を招く可能性 / <b>注意</b>: 軽傷・中程度の傷害の可能性</td></tr>
  <tr><th>危険の内容</th><td>何が起きるか (例: 「回転するローラに巻き込まれる」)</td></tr>
  <tr><th>結果</th><td>どうなるか (例: 「手を切断する恐れ」)</td></tr>
  <tr><th>回避方法</th><td>何をすべきか (例: 「カバーを開ける前に主電源を切り、ロックする」)</td></tr>
</table>
<svg class="tb-chart" viewBox="0 0 520 150" role="img" aria-label="警告ラベルの例">
<g class="k-shadow"><rect x="60" y="8" width="400" height="134" rx="6" fill="#ffffff" stroke="#222" stroke-width="2"/></g>
<path d="M61,40 L61,14 Q61,9 66,9 L454,9 Q459,9 459,14 L459,40 Z" fill="#f57c00"/>
<polygon points="90,14 104,37 76,37" fill="#fbc02d" stroke="#222" stroke-width="2" stroke-linejoin="round"/><rect x="88.6" y="20" width="2.8" height="9" fill="#222"/><circle cx="90" cy="32.5" r="1.6" fill="#222"/>
<text x="250" y="31" text-anchor="middle" fill="#000" font-size="16" font-weight="bold">警告</text>
<rect x="72" y="50" width="80" height="84" rx="3" fill="none" stroke="#222" stroke-width="1.6"/>
<circle cx="100" cy="76" r="15" fill="none" stroke="#222" stroke-width="3"/><circle cx="100" cy="108" r="15" fill="none" stroke="#222" stroke-width="3"/>
<circle cx="100" cy="76" r="3" fill="#222"/><circle cx="100" cy="108" r="3" fill="#222"/>
<path d="M146,86 L126,86 Q118,86 116,90 L113,92 L116,94 Q118,98 126,98 L146,98 Z" fill="#222"/>
<path d="M84,64 A20,20 0 0 1 104,57" fill="none" stroke="#d32f2f" stroke-width="2.4"/><path d="M104,57 l-6,-3 l1,6 z" fill="#d32f2f"/>
<path d="M84,120 A20,20 0 0 0 104,127" fill="none" stroke="#d32f2f" stroke-width="2.4"/><path d="M104,127 l-6,3 l1,-6 z" fill="#d32f2f"/>
<text x="165" y="68" fill="#222" font-size="13" font-weight="bold">回転ローラに巻き込まれる</text>
<text x="165" y="90" fill="#222" font-size="13">手や指を切断する恐れがあります</text>
<text x="165" y="112" fill="#222" font-size="13">カバーを開ける前に主電源を切り</text>
<text x="165" y="130" fill="#222" font-size="13">ロックすること</text>
</svg>
<p class="tb-caption">図: 警告ラベルの構成例 (内容・結果・回避方法)。色・レイアウトは採用する規格に合わせる</p>
<h3>貼る場所と見せ方</h3>
<ul>
  <li>危険源の<b>近く</b>、危険に近づく<b>前に</b>目に入る位置。ガードを外すと見える位置にも</li>
  <li>耐久性: 油・洗浄剤・紫外線で読めなくならない材質。保守部品として供給する</li>
  <li>貼りすぎない: ラベルが多すぎると全部無視される。リスクの高い順に厳選する</li>
  <li>言語: 使用国の言語。図記号を主にして文字を補う</li>
</ul>

<svg class="tb-chart" viewBox="0 0 520 240" role="img" aria-label="警告ラベルを貼る位置">
<text class="k-title" x="14" y="20">ラベルは「危険に近づく前に」見える位置へ</text>
<rect class="k-ground" x="8" y="222" width="504" height="10"/><line class="k-edge" x1="8" y1="222" x2="512" y2="222"/>
<g class="k-shadow">
<rect class="k-part" x="40" y="70" width="210" height="152" rx="5"/>
<rect class="k-part" x="250" y="150" width="200" height="14" rx="3"/>
<rect class="k-part" x="270" y="164" width="8" height="58"/><rect class="k-part" x="426" y="164" width="8" height="58"/>
</g>
<circle class="k-part-h" cx="262" cy="157" r="9"/><circle class="k-part-h" cx="440" cy="157" r="9"/>
<rect class="k-glass" x="60" y="84" width="120" height="80" rx="3"/>
<rect class="k-hazard" x="40" y="206" width="210" height="8"/>
<rect class="k-alu" x="196" y="96" width="40" height="60" rx="3"/>
<g class="k-shadow"><polygon points="216,110.6 229.5,134 202.5,134" fill="#fbc02d" stroke="#222" stroke-width="2" stroke-linejoin="round"/><rect x="214.65" y="118.556" width="2.7" height="8.892000000000001" fill="#222"/><circle cx="216" cy="130.256" r="1.62" fill="#222"/><polygon points="262,121.8 272.5,140 251.5,140" fill="#fbc02d" stroke="#222" stroke-width="2" stroke-linejoin="round"/><rect x="260.95" y="127.988" width="2.0999999999999996" height="6.9159999999999995" fill="#222"/><circle cx="262" cy="137.088" r="1.26" fill="#222"/><polygon points="120,34.599999999999994 133.5,58 106.5,58" fill="#fbc02d" stroke="#222" stroke-width="2" stroke-linejoin="round"/><rect x="118.65" y="42.556" width="2.7" height="8.892000000000001" fill="#222"/><circle cx="120" cy="54.256" r="1.62" fill="#222"/></g>
<line class="k-thin" x1="216" y1="134" x2="300" y2="96"/><text class="k-note" x="302" y="90">点検カバーの上</text>
<line class="k-thin" x1="262" y1="128" x2="320" y2="122"/><text class="k-note" x="322" y="126">巻込み点の近く</text>
<line class="k-thin" x1="134" y1="48" x2="196" y2="44"/><text class="k-note" x="198" y="48">遠くから見える上部</text>
<g transform="translate(480 222)">
<path class="k-person" d="M-12,-128 Q0,-134 12,-128 Q16,-126 16,-118 L15,-72 L11,-70 L10,-2 L2,0 L0,-60 L-2,0 L-10,-2 L-11,-70 L-15,-72 L-16,-118 Q-16,-126 -12,-128 Z"/>
<circle class="k-skin" cx="0" cy="-142" r="11"/>
</g>
<path d="M470,82 L250,130" fill="none" style="stroke:var(--tb-accent)" stroke-width="1.2" stroke-dasharray="4 3"/>
<text class="k-note" x="420" y="200" text-anchor="middle">視線</text>
</svg>
<p class="tb-caption">図: ラベルは危険源の近くで、作業者の視線に入る位置へ。カバーを外したときに見える内側にも貼る (三角の図記号は説明用の一般的な警告マーク)</p>
<h3>よくある間違い</h3>
<ul>
  <li>「注意」「危険」のシグナルワードを、ひどさではなく目立たせたい度合いで選ぶ</li>
  <li>取扱説明書の警告を巻頭にまとめるだけで、該当する手順の中に置かない</li>
  <li>設計変更でリスクが変わったのに、ラベル・取説を更新しない</li>
</ul>
<h2>機械に付ける情報 — 表示灯・信号</h2>
<p>IEC 60204-1 の表示灯の色: <b>赤</b> = 非常 (直ちに対処)、<b>黄</b> = 異常 (監視・介入)、<b>青</b> = 指示 (操作が必要)、<b>緑</b> = 正常、<b>白</b> = 中立。起動前の警報音・回転灯 (自動起動する機械) も使用上の情報です。</p>

<h2>取扱説明書</h2>
<table class="tb-table">
  <tr><th>章立ての例</th><td>安全上の注意 (残留リスク一覧) / 仕様と意図する使用・禁止事項 / 運搬・据付 / 運転 / 段取り・調整 / 清掃・保守 (LOTO 手順、停止時間の点検) / 故障対応 / 廃棄</td></tr>
  <tr><th>残留リスク</th><td>リスクアセスメントシートの「残留リスク」欄と一対一で対応させる</td></tr>
  <tr><th>書き方</th><td>1 文 1 動作、手順は番号付き、警告は該当する手順の直前に置く</td></tr>
</table>
${NOTE}`,
    points: [
      "使用上の情報は最後の手段だが、残留リスクを伝えないことも欠陥",
      "安全標識: 禁止 = 赤円斜線、指示 = 青円、警告 = 黄三角、安全状態 = 緑四角",
      "警告ラベル = シグナルワード + 危険の内容 + 結果 + 回避方法",
      "取扱説明書の残留リスクはリスクアセスメントの記録と一対一で対応させる",
    ],
    exercises: [
      {
        q: "射出成形機の金型周り (ヒーター 250 °C) の清掃作業について、警告ラベルの文案を「シグナルワード・内容・結果・回避方法」の構成で作ってください。",
        a: "例: <b>警告</b> / 高温の金型・ノズル / 触れるとやけどを負う恐れがあります / 清掃は温度表示が 50 °C 以下になってから、耐熱手袋を着用して行うこと。<br>重傷の可能性があれば「警告」、軽傷にとどまるなら「注意」と、ひどさに応じてシグナルワードを選びます。",
      },
      {
        q: "あるラベルに「注意: 機械に手を入れないでください」と書かれています。改善点を 2 つ挙げてください。",
        a: "① 何が起きるか (挟まれる・巻き込まれる) と結果 (切断等) が書かれていない。重傷の可能性ならシグナルワードは「警告」以上。② 「手を入れない」ではなく、作業が必要なら具体的な回避方法 (主電源を切ってロック) を示す。そもそも手が入る構造ならガードで対策できないか (第 1・2 段階) を先に検討する。",
      },
    ],
    quiz: [
      { q: "黄色の三角形に黒枠の標識の意味は?", choices: ["禁止", "警告 (注意)", "指示"], answer: 1, explain: "ISO 3864 では警告は黄の三角形と黒枠です。" },
      { q: "「回避しないと死亡・重傷を招く切迫した状況」を表すシグナルワードは?", choices: ["危険", "警告", "注意"], answer: 0, explain: "危険が最も重い区分です。" },
      { q: "警告ラベルの貼り方として適切でないものは?", choices: ["危険に近づく前に見える位置", "できるだけ多くのラベルを全面に貼る", "ガードを外すと見える位置にも貼る"], answer: 1, explain: "貼りすぎると無視されます。リスクの高いものを厳選します。" },
    ],
  },

  // ------------------------------------------------------------------ 7
  {
    id: "functional-safety",
    part: "knowhow",
    title: "機能安全・ソフトウェアと協働ロボット",
    minutes: 20,
    level: 3,
    lead: "安全機能をプログラマブルな電子機器やソフトウェアで実現することが増えています。IEC 61508 / IEC 62061 の SIL と ISO 13849 の PL の関係、安全ソフトウェアの作り方、協働ロボットの安全 (ISO 10218 / ISO/TS 15066) の概要を学びます。",
    body: `
<h2>機能安全とは</h2>
<p><b>機能安全</b>は、安全関連の制御が正しく機能することで確保される安全です。基本規格が <b>IEC 61508</b> (電気・電子・プログラマブル電子の安全関連系) で、機械分野向けに <b>IEC 62061</b> (SIL) と <b>ISO 13849-1</b> (PL) があります。</p>
<table class="tb-table">
  <tr><th></th><th>ISO 13849-1</th><th>IEC 62061</th></tr>
  <tr><td>指標</td><td>PL a〜e</td><td>SIL 1〜3</td></tr>
  <tr><td>対象技術</td><td>電気・電子に加え、空圧・油圧・機械も</td><td>電気・電子・プログラマブル電子が中心 (2021 年版で非電気技術も扱えるよう拡張)</td></tr>
  <tr><td>手法</td><td>カテゴリ (指定構造) + MTTF<sub>D</sub>・DC・CCF</td><td>サブシステムの構成と故障率から PFH を計算</td></tr>
</table>
<svg class="tb-chart" viewBox="0 0 520 172" role="img" aria-label="PL と SIL の対応">
<text class="lbl" x="20" y="22" text-anchor="start">PFH<tspan font-size="9" dy="3">D</tspan><tspan dy="-3"> (1/h)</tspan></text>
<text class="tick" x="14" y="60">PL</text><text class="tick" x="14" y="105">SIL</text>
<line class="grid" x1="80" y1="34" x2="80" y2="140"/><line class="grid" x1="170" y1="34" x2="170" y2="140"/><line class="grid" x1="260" y1="34" x2="260" y2="140"/><line class="grid" x1="350" y1="34" x2="350" y2="140"/><line class="grid" x1="440" y1="34" x2="440" y2="140"/>
<g class="k-shadow"><rect x="80" y="40" width="90" height="30" style="fill:var(--tb-surface)"/><rect x="80" y="40" width="90" height="30" style="fill:var(--tb-accent);stroke:var(--tb-surface)" fill-opacity="0.12" stroke-width="2"/><text class="mark-t" x="125.0" y="60" text-anchor="middle">PL a</text><rect x="170" y="40" width="47" height="30" style="fill:var(--tb-surface)"/><rect x="170" y="40" width="47" height="30" style="fill:var(--tb-accent);stroke:var(--tb-surface)" fill-opacity="0.22" stroke-width="2"/><text class="mark-t" x="193.5" y="60" text-anchor="middle">b</text><rect x="217" y="40" width="43" height="30" style="fill:var(--tb-surface)"/><rect x="217" y="40" width="43" height="30" style="fill:var(--tb-accent);stroke:var(--tb-surface)" fill-opacity="0.32" stroke-width="2"/><text class="mark-t" x="238.5" y="60" text-anchor="middle">c</text><rect x="260" y="40" width="90" height="30" style="fill:var(--tb-surface)"/><rect x="260" y="40" width="90" height="30" style="fill:var(--tb-accent);stroke:var(--tb-surface)" fill-opacity="0.45" stroke-width="2"/><text class="mark-t" x="305.0" y="60" text-anchor="middle">PL d</text><rect x="350" y="40" width="90" height="30" style="fill:var(--tb-surface)"/><rect x="350" y="40" width="90" height="30" style="fill:var(--tb-accent);stroke:var(--tb-surface)" fill-opacity="0.6" stroke-width="2"/><text class="mark-t" x="395.0" y="60" text-anchor="middle">PL e</text>
<rect x="170" y="85" width="90" height="30" style="fill:var(--tb-good);stroke:var(--tb-surface)" fill-opacity="0.2" stroke-width="2"/><text class="mark-t" x="215" y="105" text-anchor="middle">SIL 1</text><rect x="260" y="85" width="90" height="30" style="fill:var(--tb-good);stroke:var(--tb-surface)" fill-opacity="0.35" stroke-width="2"/><text class="mark-t" x="305" y="105" text-anchor="middle">SIL 2</text><rect x="350" y="85" width="90" height="30" style="fill:var(--tb-good);stroke:var(--tb-surface)" fill-opacity="0.5" stroke-width="2"/><text class="mark-t" x="395" y="105" text-anchor="middle">SIL 3</text></g>
<line class="axis" x1="80" y1="135" x2="450" y2="135"/>
<text class="tick" x="80" y="152" text-anchor="middle">10⁻⁴</text><text class="tick" x="170" y="152" text-anchor="middle">10⁻⁵</text><text class="tick" x="260" y="152" text-anchor="middle">10⁻⁶</text><text class="tick" x="350" y="152" text-anchor="middle">10⁻⁷</text><text class="tick" x="440" y="152" text-anchor="middle">10⁻⁸</text>
<line class="k-move" x1="380" y1="164" x2="440" y2="164"/>
<text class="tick" x="370" y="168" text-anchor="end">右ほど危険側故障が起きにくい</text>
</svg>
<p class="tb-caption">図: PFH の範囲で見た PL と SIL のおおよその対応 (PL b・c ≒ SIL 1、PL d ≒ SIL 2、PL e ≒ SIL 3)。PL a に対応する SIL はない。数値の対応だけでなく、構造・ソフトウェアの要件も満たす必要がある</p>

<h2>安全ソフトウェアの作り方</h2>
<p>ソフトウェアは摩耗故障しませんが、<b>仕様の誤り・作り込みの誤り</b> (系統的故障) が起きます。確率で評価できないため、開発プロセスで防ぎます (ISO 13849-1 のソフトウェア要件、IEC 61508-3)。</p>
<ul>
  <li><b>V 字モデル</b>: 安全要求仕様 → 設計 → コーディング → 単体・結合テスト → 妥当性確認。各段階の成果物とレビューを残す</li>
  <li><b>認証済みの部品を使う</b>: 安全 PLC と、認証済みのファンクションブロック (非常停止、ガード監視、2 ハンド) を組み合わせる (限定可変言語)</li>
  <li><b>安全と一般の制御を分ける</b>: 安全プログラムは一般のプログラムから書き換えられないようにし、変更はパスワード・チェックサムで管理</li>
  <li><b>デフォルトは停止</b>: 通信断、ウォッチドッグ、範囲外の値は安全側 (停止) に倒す</li>
  <li><b>変更管理</b>: 改造時は影響分析と再検証。立上げ時の「一時的な」バイパスを残さない</li>
</ul>

<svg class="tb-chart" viewBox="0 0 520 210" role="img" aria-label="安全ソフトウェアの V 字モデル">
<g class="k-shadow">
<rect class="k-panel" x="14" y="20" width="140" height="34" rx="6"/><rect class="k-panel" x="54" y="76" width="140" height="34" rx="6"/><rect class="k-panel" x="94" y="132" width="140" height="34" rx="6"/>
<rect class="k-panel" x="366" y="20" width="140" height="34" rx="6"/><rect class="k-panel" x="326" y="76" width="140" height="34" rx="6"/><rect class="k-panel" x="286" y="132" width="140" height="34" rx="6"/>
<rect class="k-panel" x="200" y="168" width="120" height="34" rx="6" style="stroke:var(--tb-accent)"/>
</g>
<text class="lbl" x="84" y="42" text-anchor="middle">安全要求仕様</text><text class="lbl" x="124" y="98" text-anchor="middle">ソフト設計</text><text class="lbl" x="164" y="154" text-anchor="middle">モジュール設計</text>
<text class="lbl" x="260" y="190" text-anchor="middle">コーディング</text>
<text class="lbl" x="436" y="42" text-anchor="middle">妥当性確認</text><text class="lbl" x="396" y="98" text-anchor="middle">結合テスト</text><text class="lbl" x="356" y="154" text-anchor="middle">単体テスト</text>
<line class="k-move" x1="84" y1="56" x2="110" y2="74"/><line class="k-move" x1="124" y1="112" x2="150" y2="130"/><line class="k-move" x1="170" y1="168" x2="198" y2="182"/>
<line class="k-move" x1="322" y1="182" x2="346" y2="168"/><line class="k-move" x1="370" y1="130" x2="394" y2="112"/><line class="k-move" x1="410" y1="74" x2="434" y2="56"/>
<line class="k-hidden" x1="156" y1="37" x2="364" y2="37"/><line class="k-hidden" x1="196" y1="93" x2="324" y2="93"/><line class="k-hidden" x1="236" y1="149" x2="284" y2="149"/>
<text class="k-note" x="260" y="31" text-anchor="middle">何を確かめるかを先に決める</text>
</svg>
<p class="tb-caption">図: 左側の各段階で、右側で使う試験の内容 (合格基準) を決めておく。各段階の成果物とレビュー記録が、系統的故障を防いだ証拠になる</p>
<h3>例題 — 安全 PLC プログラムの変更</h3>
<p>立上げ後、「扉が開いていても低速なら手動送りできる」ようにプログラムを変更したい、という依頼が来たとします。手順は (1) リスクアセスメントの更新 (低速で回避できるか、PLr は d か e か) → (2) 安全要求仕様の改訂 (速度の上限、イネーブル装置が必須) → (3) 変更箇所と影響範囲のレビュー → (4) 低速監視が上限を超えたら停止することを含む試験 → (5) チェックサムと版の記録、です。「1 行変えるだけ」でも V 字を小さく 1 周させます。</p>
<h2>協働ロボットの安全 (ISO 10218 / ISO/TS 15066)</h2>
<p>産業用ロボットは柵で囲うのが基本ですが、協働運転では人とロボットが同じ空間で作業します。ISO 10218 (2011 年版) は協働運転の 4 つの方式を挙げています (2025 年の改訂で構成や用語が整理されているので、適用版を確認してください)。</p>
<table class="tb-table">
  <tr><th>安全適合監視停止</th><td>人が協働作業空間に入るとロボットが停止 (電源は保持したまま監視)。人が出ると自動で再開</td></tr>
  <tr><th>ハンドガイド</th><td>人がイネーブル装置付きの操作部でロボットを手で導く</td></tr>
  <tr><th>速度と間隔の監視</th><td>人との距離に応じて減速・停止する。分離距離の考え方は S = K×T + C と同じ発想</td></tr>
  <tr><th>動力と力の制限</th><td>接触しても危害にならない力・圧力に制限する。ISO/TS 15066 に体の部位ごとの許容値が示されている</td></tr>
</table>
<svg class="tb-chart" viewBox="0 0 520 196" role="img" aria-label="速度と間隔の監視">
<rect x="150" y="20" width="110" height="152" style="fill:var(--tb-bad)" opacity="0.14"/>
<rect x="260" y="20" width="110" height="152" style="fill:var(--tb-warn)" opacity="0.16"/>
<rect x="370" y="20" width="136" height="152" style="fill:var(--tb-good)" opacity="0.12"/>
<line x1="260" y1="20" x2="260" y2="172" style="stroke:var(--tb-warn)" stroke-dasharray="4 3"/><line x1="370" y1="20" x2="370" y2="172" style="stroke:var(--tb-good)" stroke-dasharray="4 3"/>
<text class="k-bad-t" x="205" y="40" text-anchor="middle">停止域</text>
<text class="mark-t" x="315" y="40" text-anchor="middle">減速域</text>
<text class="k-good-t" x="438" y="40" text-anchor="middle">通常速度</text>
<rect class="k-ground" x="14" y="172" width="492" height="8"/><line class="k-edge" x1="14" y1="172" x2="506" y2="172"/>
<line x1="104" y1="160" x2="500" y2="160" style="stroke:var(--tb-accent)" stroke-width="1" stroke-dasharray="2 4"/>
<g class="k-shadow">
<rect class="k-part" x="28" y="138" width="72" height="34" rx="3"/>
<rect class="k-part" x="48" y="118" width="32" height="22" rx="3"/>
<path d="M64,118 L92,66" fill="none" style="stroke:var(--k-line)" stroke-width="18"/><path d="M64,118 L92,66" fill="none" style="stroke:var(--k-accent-1)" stroke-width="15"/><path d="M92,66 L140,82" fill="none" style="stroke:var(--k-line)" stroke-width="15"/><path d="M92,66 L140,82" fill="none" style="stroke:var(--k-accent-1)" stroke-width="12"/>
<circle class="k-sphere" cx="64" cy="118" r="10"/><circle class="k-sphere" cx="92" cy="66" r="9"/><circle class="k-sphere" cx="140" cy="82" r="6"/>
<path class="k-part" d="M144,76 L156,72 L156,78 L148,82 L156,86 L156,92 L144,88 Z" stroke-width="1.2"/>
<rect x="96" y="154" width="12" height="12" rx="2" fill="#2f333a" style="stroke:var(--k-line)"/>
</g>
<g class="k-shadow" transform="translate(452 172) scale(-0.82 0.82)"><path d="M-11,-72 L-12,-5 L-2,-5 L0,-48 L2,-5 L12,-5 L11,-72 Z" fill="#46505f" style="stroke:var(--k-line)" stroke-width="1.2"/><path d="M-14,-6 L-1,-6 L-1,0 L-14,0 Z M1,-6 L13,-6 Q19,-4 18,0 L1,0 Z" fill="#2a2f38"/><g transform="rotate(0 0 -70)"><path d="M2,-122 L-12,-100 L-14,-78" fill="none" style="stroke:var(--k-line)" stroke-width="10"/><path d="M-12,-100 L-14,-78" fill="none" style="stroke:var(--k-skin-2)" stroke-width="7.4"/><path d="M2,-122 L-12,-100" fill="none" style="stroke:var(--k-accent-2)" stroke-width="7.6"/><circle class="k-skin" cx="-14" cy="-78" r="4.8"/><rect class="k-accent" x="-13" y="-131" width="27" height="64" rx="9"/><rect x="-12" y="-76" width="25" height="5" fill="#2a2f38"/><rect class="k-skin" x="-1" y="-136" width="8" height="8"/><circle class="k-skin" cx="3" cy="-145" r="11"/><circle cx="10" cy="-146" r="1.3" style="fill:var(--k-line)"/><path d="M-9,-147 A12.5,12.5 0 0 1 15.5,-147 Z" fill="#f2c230" style="stroke:var(--k-line)" stroke-width="1.2"/><line x1="13" y1="-147" x2="20" y2="-147" style="stroke:var(--k-line)" stroke-width="2"/><path d="M2,-122 L14,-104 L18,-80" fill="none" style="stroke:var(--k-line)" stroke-width="10"/><path d="M14,-104 L18,-80" fill="none" style="stroke:var(--k-skin-2)" stroke-width="7.4"/><path d="M2,-122 L14,-104" fill="none" style="stroke:var(--k-accent-2)" stroke-width="7.6"/><circle class="k-skin" cx="18" cy="-80" r="4.8"/></g></g>
<line class="k-move" x1="420" y1="104" x2="384" y2="104"/>
<text class="tick" x="64" y="192" text-anchor="middle">ロボット</text>
<text class="tick" x="452" y="192" text-anchor="middle">人</text>
</svg>
<p class="tb-caption">図: 速度と間隔の監視。レーザスキャナなどで人の位置を検出し、距離に応じてロボットを減速・停止する</p>
<p>注意: 「協働ロボット」を買えば安全になるわけではありません。安全なのは<b>用途 (アプリケーション)</b> です。ハンドの刃物、尖ったワーク、頭の高さでの動作は、力を制限しても危険です。用途ごとにリスクアセスメントを行います。</p>
${NOTE}`,
    points: [
      "機能安全の基本は IEC 61508、機械では ISO 13849-1 (PL) と IEC 62061 (SIL)",
      "PFH の範囲でおおよそ PL d ≒ SIL 2、PL e ≒ SIL 3",
      "ソフトウェアの誤りは確率で評価できない — V 字の開発プロセスと変更管理で防ぐ",
      "協働運転の 4 方式。安全なのはロボット単体ではなく用途全体",
    ],
    exercises: [
      {
        q: "安全 PLC を使った安全機能の PFHD が、入力 2×10⁻⁸、論理 1×10⁻⁸、出力 6×10⁻⁸ /h と求まりました。全体の PFHD と、対応する PL・SIL を求めてください。",
        a: "直列なので足し合わせ: 2 + 1 + 6 = 9 × 10⁻⁸ /h。10⁻⁸ 以上 10⁻⁷ 未満なので <b>PL e</b> 相当、<b>SIL 3</b> 相当の範囲です (カテゴリ・SIL の構造要件・ソフトウェア要件も別途満たす必要があります)。",
      },
      {
        q: "人が近づくと減速する協働ロボットで、人の接近速度 1 600 mm/s、検出から停止までの時間 0.5 s、検出位置の誤差などの余裕 200 mm とします。S = K×T + C の考え方で、停止域の外側の境界を何 mm に置けばよいですか (学習用の簡略計算)。",
        a: "S = 1 600 × 0.5 + 200 = <b>1 000 mm</b>。実際の分離距離はロボットの移動距離・停止距離も加える必要があり、ISO/TS 15066 などの式で求めます。",
      },
    ],
    quiz: [
      { q: "SIL 2 におおよそ対応する PL は?", choices: ["PL b", "PL d", "PL e"], answer: 1, explain: "PFH の範囲 10⁻⁷〜10⁻⁶ が重なり、PL d ≒ SIL 2 です。" },
      { q: "ソフトウェアの故障の主な原因は?", choices: ["摩耗", "仕様や作り込みの誤り (系統的故障)", "温度による劣化"], answer: 1, explain: "ソフトウェアは摩耗しないので、開発プロセスで系統的故障を防ぎます。" },
      { q: "協働ロボットについて正しいのは?", choices: ["協働ロボットを使えばリスクアセスメントは不要", "用途ごとにリスクアセスメントが必要", "力の制限があれば刃物を持たせてもよい"], answer: 1, explain: "安全性は用途全体で決まります。" },
    ],
  },

  // ------------------------------------------------------------------ 8
  {
    id: "safety-cases",
    part: "knowhow",
    title: "安全設計の事例とチェックリスト",
    minutes: 18,
    level: 2,
    lead: "これまでの章の内容を、実際の設計の流れに当てはめます。典型的な事故の型と設計対策、設計段階ごとのチェックリスト、設計審査での確認ポイントをまとめます。",
    body: `
<h2>事例で学ぶ — 事故の型と設計対策</h2>
<p>以下は機械災害でよくある型を一般化した例です。</p>
<table class="tb-table">
  <tr><th>状況</th><th>なぜ起きたか</th><th>設計での対策</th></tr>
  <tr><td>コンベヤの詰まりを運転中に手で除去してローラに巻き込まれた</td><td>止めると再起動に時間がかかり、手で取る方が早かった</td><td>詰まりにくい搬送形状、インターロックカバー、カバーを開けずに外から除去できる工夫、再起動を簡単に (止めることの手間を減らす)</td></tr>
  <tr><td>インターロックが磁石でだまされ、扉を開けたまま運転</td><td>扉を閉めると段取りの様子が見えなかった</td><td>コード化スイッチ、透明な窓、段取り用の低速モード (イネーブル装置付き)</td></tr>
  <tr><td>保全中に他の作業者が電源を入れ、機械が動いた</td><td>主電源にロック機構がなく、遮断点が複数あった</td><td>ロック可能な断路器、遮断点の集約と表示</td></tr>
  <tr><td>エアを抜いたら上昇していた治具が落下</td><td>重力負荷の保持をエア圧だけに頼っていた</td><td>機械式ロック、安全ブロック、保全時は下降端で作業する手順</td></tr>
  <tr><td>ライトカーテンを通過して中に入り、外から別の人が起動</td><td>内部に人が残っていることを検出できなかった</td><td>リセットボタンを危険区域全体が見える外側に配置、起動前の警報、内部のセーフティマット</td></tr>
</table>
<svg class="tb-chart" viewBox="0 0 520 214" role="img" aria-label="コンベヤの詰まり除去の改善">
<rect class="k-panel" x="8" y="8" width="250" height="198" rx="8"/><rect class="k-panel" x="262" y="8" width="250" height="198" rx="8"/>
<circle class="k-badge" cx="28" cy="28" r="10" style="fill:var(--tb-bad)"/><text class="k-badge-t" x="28" y="32" text-anchor="middle">✕</text><text class="k-title" x="46" y="32">運転中に手で除去</text>
<circle class="k-badge" cx="282" cy="28" r="10" style="fill:var(--tb-good)"/><text class="k-badge-t" x="282" y="32" text-anchor="middle">✓</text><text class="k-title" x="300" y="32">カバー + 外から除去</text>
<g class="k-shadow"><rect class="k-rubber" x="30" y="120" width="200" height="14" rx="7"/><circle class="k-part-h" cx="38" cy="127" r="12"/><circle class="k-part-h" cx="222" cy="127" r="12"/><rect class="k-part" x="40" y="140" width="8" height="50"/><rect class="k-part" x="212" y="140" width="8" height="50"/>
<rect class="k-alu" x="120" y="96" width="44" height="24" rx="2"/><rect class="k-alu" x="160" y="90" width="34" height="30" rx="2" transform="rotate(12 177 105)"/></g>
<path class="k-force" d="M190,148 A14,14 0 0 0 214,148" stroke-width="2"/>
<path d="M16,70 Q80,70 196,112" fill="none" style="stroke:var(--k-person-2)" stroke-width="11"/><circle class="k-skin" cx="198" cy="114" r="7"/>
<text class="k-bad-t" x="133" y="196" text-anchor="middle">止めると再起動が面倒</text>
<g class="k-shadow"><rect class="k-rubber" x="284" y="120" width="200" height="14" rx="7"/><circle class="k-part-h" cx="292" cy="127" r="12"/><circle class="k-part-h" cx="476" cy="127" r="12"/><rect class="k-part" x="294" y="140" width="8" height="50"/><rect class="k-part" x="466" y="140" width="8" height="50"/>
<rect class="k-alu" x="374" y="96" width="44" height="24" rx="2"/></g>
<path class="k-glass" d="M440,112 L440,92 Q440,82 452,82 L494,82 L494,146 L462,146 L462,112 Z"/>
<rect class="k-yellow" x="494" y="92" width="10" height="16" rx="2"/>
<rect class="k-part" x="300" y="64" width="80" height="6" rx="2"/><path d="M380,62 L388,72 L380,72" fill="none" style="stroke:var(--k-line)" stroke-width="2"/>
<g class="k-shadow"><rect class="k-part" x="422" y="44" width="40" height="28" rx="4"/></g>
<circle class="k-accent" cx="434" cy="58" r="6"/><circle class="k-yellow" cx="451" cy="58" r="8"/><circle class="k-estop" cx="451" cy="58" r="5"/>
<text class="k-note" x="340" y="58" text-anchor="middle">除去用フック</text>
<text class="k-good-t" x="387" y="196" text-anchor="middle">逆転は押している間だけ</text>
</svg>
<p class="tb-caption">図: 巻込み点 (プーリの入り側) はインターロックカバーで覆い、詰まりは外からフックや寸動逆転 (ホールド・トゥ・ラン) で取れるようにする。「止める手間」を減らすと無効化の動機も減る</p>
<p>共通点: <b>人がガードを無効化するのは、安全装置が作業を妨げるとき</b>です。作業のしやすさと安全を両立させるのが設計者の仕事です。</p>
<svg class="tb-chart" viewBox="0 0 520 184" role="img" aria-label="無効化の動機">
<rect x="60" y="20" width="430" height="65" style="fill:var(--tb-bad)" opacity="0.07"/>
<line class="grid" x1="60" y1="85" x2="490" y2="85"/>
<line class="axis" x1="60" y1="150" x2="496" y2="150" marker-end="url(#k-arrow)"/><line class="axis" x1="60" y1="150" x2="60" y2="14" marker-end="url(#k-arrow)"/>
<text class="lbl" x="275" y="174" text-anchor="middle">安全装置による作業の手間 (時間・回数)</text>
<text class="lbl" x="68" y="16" text-anchor="start">無効化される可能性</text>
<path d="M60,140 C200,135 300,110 360,70 S460,30 490,26 L490,150 L60,150 Z" style="fill:var(--tb-bad)" opacity="0.1"/>
<path d="M60,140 C200,135 300,110 360,70 S460,30 490,26" fill="none" style="stroke:var(--tb-bad)" stroke-width="2.8"/>
<circle cx="380" cy="58" r="7" style="fill:var(--tb-bad);stroke:var(--tb-surface)" stroke-width="2"/><text class="k-bad-t" x="392" y="66" text-anchor="start">手間が大きい設計</text>
<circle cx="150" cy="137" r="7" style="fill:var(--tb-good);stroke:var(--tb-surface)" stroke-width="2"/><text class="k-good-t" x="150" y="112" text-anchor="start">作業を妨げない設計</text>
</svg>
<p class="tb-caption">図: 無効化の動機の概念図。安全装置の手間が増えるほど無効化されやすい (ISO 14119 は、無効化の動機を評価して減らすことを求めている)</p>

<h2>設計段階ごとのチェックリスト</h2>
<h3>構想設計</h3>
<ul>
  <li>機械の制限 (ライフサイクル、運転モード、予見可能な誤使用) を書き出したか</li>
  <li>危険源をなくす工法・レイアウトを比較したか (危険区域外からの給油・調整)</li>
  <li>ガード・ライトカーテンの安全距離を見込んだ設置スペースがあるか</li>
</ul>
<h3>詳細設計</h3>
<ul>
  <li>挟まれ部の最小すき間 (ISO 13854)、開口部の安全距離 (ISO 13857) を確認したか</li>
  <li>固定式ガードは工具がないと外せず、固定具が脱落しないか</li>
  <li>インターロックは直接開路動作・2 チャンネル・無効化しにくい取付けか</li>
  <li>安全機能ごとに PLr を決め、達成 PL を計算したか</li>
  <li>非常停止は停止カテゴリ 0/1、ラッチ、解除で再起動しないか</li>
  <li>エネルギー源ごとにロック可能な遮断点と残留エネルギーの解放手段があるか</li>
  <li>重力負荷に機械式の落下防止があるか</li>
  <li>停電・復電・通信断で予期しない起動が起きないか</li>
</ul>
<h3>製作・立上げ・出荷</h3>
<ul>
  <li>停止時間を実測し、安全距離を満たしているか</li>
  <li>安全機能を 1 つずつ試験 (妥当性確認) し、記録したか</li>
  <li>立上げ時のバイパス・仮配線を撤去したか</li>
  <li>警告ラベル・取扱説明書が残留リスクの一覧と一致しているか</li>
</ul>

<h2>設計審査 (DR) で聞くべき質問</h2>
<ol class="tb-flow">
  <li>この危険源は<b>なくせないのか</b> — なくせない理由は記録されているか</li>
  <li>作業者は<b>なぜここに手を入れるのか</b> — 入れなくて済む方法はないか</li>
  <li>この安全装置が<b>故障したら</b>どうなるか — 故障は検出されるか</li>
  <li>この安全装置は<b>だましたくなるか</b> — 作業の邪魔になっていないか</li>
  <li><b>保全する人</b>は安全に作業できるか — 遮断・確認・保持の手段はあるか</li>
</ol>
<div class="tb-tip"><b>3DCAD Studio</b>: アセンブリの干渉チェックと計測で、可動部のストローク全域のすき間 (挟まれ部) やガードの開口から危険区域までの距離を確認できます。</div>
${NOTE}`,
    points: [
      "人がガードを無効化するのは、安全装置が作業を妨げるとき",
      "構想・詳細・立上げの各段階でチェックリストを使う",
      "停止時間の実測と安全機能の妥当性確認を記録に残す",
      "DR では「なくせないか」「故障したら」「だましたくなるか」「保全者は安全か」を問う",
    ],
    exercises: [
      {
        q: "ライトカーテン (d = 14 mm、応答 10 ms) を設置した機械の停止時間を立上げ時に実測したら 240 ms でした。設計時は 150 ms と見込んで、ライトカーテンを危険区域から 350 mm の位置に置いています。安全距離は足りていますか。",
        a: "T = 0.01 + 0.24 = 0.25 s、C = 0。S = 2 000 × 0.25 = <b>500 mm</b>。500 mm を超えないので K = 2 000 のまま S = 500 mm。設置位置 350 mm では<b>不足</b>です。ブレーキを強化して停止時間を短くするか、ライトカーテンを 500 mm 以上離します。(設計時の見込みでは 2 000 × 0.16 = 320 mm で足りていた)",
      },
      {
        q: "「段取りのたびにガードを開けるとインターロックで止まり、再起動に 3 分かかる」という現場の不満があります。ガードが無効化されないための設計改善を 3 つ挙げてください。",
        a: "例: ① ガードを開けたときは停止カテゴリ 1 で止め、閉じたら短時間で再開できる (原点復帰などが不要な) 制御にする。② 段取り用の監視付き低速モードとイネーブル装置を用意する。③ 段取り作業そのものを危険区域の外からできるようにする (外部からの調整機構、工具レスの交換)。④ 透明な窓で中が見えるようにする。",
      },
      {
        q: "既設の機械に、検出能力 14 mm のライトカーテンを危険区域から 450 mm の位置に付けたいと考えています。装置と制御の応答の合計が 25 ms のとき、機械の停止時間は最大何 ms まで許されますか。",
        a: "S = 2 000 × T ≤ 450 mm → T ≤ 0.225 s (S が 500 mm 以下の範囲なので K = 2 000 のまま)。機械の停止時間は 225 − 25 = <b>200 ms 以下</b>。劣化の余裕を見て、点検で停止時間がこの値に近づいたらブレーキを整備する基準を決めます。",
      },
    ],
    quiz: [
      { q: "インターロックが無効化される主な動機は?", choices: ["スイッチの価格が高い", "安全装置が作業の邪魔になる", "ラベルが小さい"], answer: 1, explain: "作業を妨げる安全装置は無効化されやすいので、作業性と両立させます。" },
      { q: "ライトカーテンのリセットボタンの配置として適切なのは?", choices: ["危険区域の内部", "危険区域全体を見渡せる外側", "どこでもよい"], answer: 1, explain: "内部に人が残っていないことを確認できる外側に置きます。" },
      { q: "立上げ時に必ず行うべきことは?", choices: ["停止時間の実測と安全機能の試験", "警告ラベルの追加だけ", "インターロックの一時的なバイパス"], answer: 0, explain: "設計時の見込みを実測で確認し、安全機能を 1 つずつ妥当性確認します。" },
    ],
  },
];
