import type { TextChapter } from "../types";

export const UX: TextChapter[] = [
  {
    id: "anthropometry",
    part: "ux",
    title: "【中級】人体寸法データの使い方",
    minutes: 20,
    level: 2,
    lead: "「身長の平均」だけでは設計できません。人体寸法の分布をパーセンタイルで読み、平均と標準偏差から必要な値を計算し、届く・通る・調整の考え方で寸法を決める方法を学びます。",
    body: `
<h2>分布とパーセンタイル</h2>
<p>身長や座高などの人体寸法は、同じ性別・年代の集団ではおおむね<b>正規分布</b>に近い形になります。
<b>p パーセンタイル</b>とは「小さいほうから数えて p % の人がその値以下になる値」です。50 パーセンタイルは中央値 (正規分布なら平均と同じ) です。</p>
<svg class="tb-chart" viewBox="0 0 520 220" role="img" aria-label="正規分布とパーセンタイル">

<defs><clipPath id="ux-pct-clip"><rect x="170" y="0" width="200" height="181"/></clipPath></defs>
<path d="M40,179 C120,178 170,160 210,110 C240,60 255,30 270,30 C285,30 300,60 330,110 C370,160 420,178 500,179 L500,180 L40,180 Z" clip-path="url(#ux-pct-clip)" style="fill:var(--tb-accent)" opacity="0.18"/>
<path d="M40,179 C120,178 170,160 210,110 C240,60 255,30 270,30 C285,30 300,60 330,110 C370,160 420,178 500,179 L500,180 L40,180 Z" style="fill:var(--tb-text-3)" opacity="0.08"/>
<line class="axis" x1="40" y1="180" x2="500" y2="180"/>
<path d="M40,179 C120,178 170,160 210,110 C240,60 255,30 270,30 C285,30 300,60 330,110 C370,160 420,178 500,179" fill="none" style="stroke:var(--tb-accent)" stroke-width="2.5"/>
<line class="k-center" x1="270" y1="22" x2="270" y2="180"/>
<line class="guide" x1="170" y1="44" x2="170" y2="180"/><line class="guide" x1="370" y1="44" x2="370" y2="180"/>
<text class="tick" x="170" y="196" text-anchor="middle">μ − 1.645σ</text><text class="tick" x="270" y="196" text-anchor="middle">μ (平均)</text><text class="tick" x="370" y="196" text-anchor="middle">μ + 1.645σ</text>
<text class="mark-t" x="160" y="60" text-anchor="end">5 パーセンタイル</text><text class="mark-t" x="380" y="60">95 パーセンタイル</text>
<line class="k-dimline" x1="172" y1="150" x2="368" y2="150"/>
<text class="k-dimtext" x="270" y="142" text-anchor="middle">90 % の人がこの範囲</text>
<text class="k-note" x="105" y="170" text-anchor="middle">5 %</text><text class="k-note" x="435" y="170" text-anchor="middle">5 %</text>
<text class="lbl" x="500" y="212" text-anchor="end">寸法</text>
</svg>
<div class="tb-formula">p 値 = μ + z × σ　　(z: 5 % → −1.645、1 % → −2.326、50 % → 0、95 % → +1.645、99 % → +2.326)</div>
<p>注意: パーセンタイルは<b>寸法ごと</b>の値です。「身長 5 パーセンタイルの人」の腕の長さが 5 パーセンタイルとは限りません。複数の寸法を同時に満たすと、カバーできる人の割合は 90 % より小さくなります。また、パーセンタイル値どうしを足し算しても、その合計のパーセンタイルにはなりません。</p>
<h2>代表的な寸法 (日本人成人・概略値)</h2>
<table class="tb-table">
  <tr><th>寸法</th><th>男性 平均 (目安)</th><th>女性 平均 (目安)</th></tr>
  <tr><td>身長</td><td>約 1 710 mm</td><td>約 1 580 mm</td></tr>
  <tr><td>眼高 (立位)</td><td>約 1 590 mm</td><td>約 1 470 mm</td></tr>
  <tr><td>肘頭高 (立位)</td><td>約 1 050 mm</td><td>約 970 mm</td></tr>
  <tr><td>座面高に相当する膝窩高</td><td>約 400 mm</td><td>約 370 mm</td></tr>
  <tr><td>身長の標準偏差</td><td>約 55〜60 mm</td><td>約 50〜55 mm</td></tr>
</table>
<div class="tb-note">上の数値は説明用の<b>概略値</b>です。年代・調査年・測定方法で変わります。実際の設計では、産業技術総合研究所などの<b>人体寸法データベース</b>、JIS の人体測定関連規格、各種調査報告など一次出典を確認し、対象ユーザ (年代・国・作業服や靴の有無) に合ったデータを使ってください。</div>
<h2>設計の考え方: 届く・通る・調整</h2>
<table class="tb-table">
  <tr><th>種類</th><th>基準にする人</th><th>例</th></tr>
  <tr><td>届く (リーチ・操作力)</td><td>小さい人 (女性 5 パーセンタイルなど)</td><td>棚の最上段、非常停止の位置、ペダルまでの距離</td></tr>
  <tr><td>通る・入る (クリアランス)</td><td>大きい人 (男性 95 パーセンタイル以上)</td><td>扉の高さ、脚の入るすき間、点検口</td></tr>
  <tr><td>両方に影響 (適合)</td><td>調整範囲で 5〜95 パーセンタイルをカバー</td><td>椅子・作業台の高さ、ヘッドレスト</td></tr>
  <tr><td>安全 (到達防止)</td><td>大きい人・細い指 (極端側)</td><td>危険部へ指が届かない開口・距離</td></tr>
</table>
<svg class="tb-chart" viewBox="0 0 520 280" role="img" aria-label="リーチ範囲の側面図">
<g transform="translate(0,14)">
<rect class="k-ground" x="20" y="238" width="480" height="8"/><line class="k-edge" x1="20" y1="238" x2="500" y2="238"/>
<path d="M20,112 A90,90 0 0 1 200,112" class="guide" fill="none"/>
<path d="M110,22 A90,90 0 0 1 200,112 A90,90 0 0 1 168,181" style="stroke:var(--tb-accent)" fill="none" stroke-width="2.5" opacity="0.9"/>
<g class="k-shadow"><rect class="k-alu" x="282" y="6" width="7" height="228"/><rect class="k-alu" x="356" y="6" width="7" height="228"/><rect x="280" y="12" width="85" height="6" rx="1" style="fill:var(--tb-bad);stroke:var(--k-line)" stroke-width="1.2"/><rect x="280" y="66" width="85" height="6" rx="1" style="fill:var(--tb-good);stroke:var(--k-line)" stroke-width="1.2"/><rect class="k-part" x="280" y="126" width="85" height="6" rx="1"/><rect class="k-part" x="280" y="186" width="85" height="6" rx="1"/><rect class="k-plastic" x="296" y="-2" width="24" height="14" rx="2"/><rect class="k-plastic" x="300" y="46" width="28" height="20" rx="2"/><rect class="k-plastic" x="332" y="52" width="18" height="14" rx="2"/><rect class="k-plastic" x="298" y="104" width="34" height="22" rx="2"/><rect class="k-plastic" x="294" y="166" width="44" height="20" rx="2"/></g>
<line class="guide" x1="110" y1="15" x2="278" y2="15"/><line class="guide" x1="186" y1="69" x2="278" y2="69"/>
<g class="k-shadow"><path d="M108.0,160.0 L104.0,198.0 L100.0,234.0" fill="none" style="stroke:var(--k-line)" stroke-width="12.9"/><path d="M108.0,160.0 L104.0,198.0 L100.0,234.0" fill="none" style="stroke:var(--k-line-2)" stroke-width="10.5"/><path d="M96.0,231.0 L109.0,233.0 Q114.0,234.0 114.0,237.5 L95.0,237.5 Z" fill="#2b3340" style="stroke:var(--k-line)" stroke-width="1"/><path d="M110.0,112.0 L106.0,138.0" fill="none" style="stroke:var(--k-line)" stroke-width="9.9"/><path d="M106.0,138.0 L110.0,163.0" fill="none" style="stroke:var(--k-line)" stroke-width="8.4"/><path d="M110.0,112.0 L106.0,138.0" fill="none" style="stroke:var(--k-accent-2)" stroke-width="7.5"/><path d="M106.0,138.0 L110.0,163.0" fill="none" style="stroke:var(--k-skin-2)" stroke-width="6.0"/><circle class="k-skin" cx="110" cy="163" r="4.0"/><path d="M111.0,102.0 L110.0,112.0" fill="none" style="stroke:var(--k-line)" stroke-width="8.4"/><path d="M111.0,102.0 L110.0,112.0" fill="none" style="stroke:var(--k-skin-1)" stroke-width="6.0"/><path d="M110.0,112.0 L108.0,160.0" fill="none" style="stroke:var(--k-line)" stroke-width="21.4"/><path d="M110.0,112.0 L108.0,160.0" fill="none" style="stroke:var(--k-accent-1)" stroke-width="19.0"/><path d="M108.0,160.0 L111.0,198.0 L110.0,234.0" fill="none" style="stroke:var(--k-line)" stroke-width="13.4"/><path d="M108.0,160.0 L111.0,198.0 L110.0,234.0" fill="none" style="stroke:var(--k-steel-3)" stroke-width="11.0"/><path d="M106.0,231.0 L119.0,233.0 Q124.0,234.0 124.0,237.5 L105.0,237.5 Z" fill="#2b3340" style="stroke:var(--k-line)" stroke-width="1"/><circle class="k-skin" cx="113" cy="93" r="11.0"/><path d="M123.2,93.5 l2.6,3.2 l-2.8,0.6" class="k-skin" stroke-width="1"/><path d="M122.0,87.0 A11.0,11.0 0 1 0 105.1,100.5 Q111.3,94.1 122.0,87.0 Z" fill="#4a3728" style="stroke:var(--k-line)" stroke-width="1"/><circle cx="119.0" cy="92.8" r="1.4" style="fill:var(--k-line)"/><path d="M110.0,112.0 L144.0,82.0" fill="none" style="stroke:var(--k-line)" stroke-width="10.4"/><path d="M144.0,82.0 L176.0,56.0" fill="none" style="stroke:var(--k-line)" stroke-width="8.9"/><path d="M110.0,112.0 L144.0,82.0" fill="none" style="stroke:var(--k-accent-1)" stroke-width="8.0"/><path d="M144.0,82.0 L176.0,56.0" fill="none" style="stroke:var(--k-skin-1)" stroke-width="6.5"/><circle class="k-skin" cx="176" cy="56" r="4.3"/></g>
<circle cx="110" cy="112" r="3.5" style="fill:var(--tb-bad);stroke:var(--k-line)"/>
<line class="k-thin" x1="80" y1="122" x2="104" y2="114"/><text class="tick" x="78" y="127" text-anchor="end">肩</text>
<text class="k-bad-t" x="372" y="19">× 最上段 (届かない)</text>
<text class="k-good-t" x="372" y="73">○ リーチ円の高さ内</text>
<text class="mark-t" x="268" y="206" text-anchor="end">5 パーセンタイルの</text><text class="mark-t" x="268" y="222" text-anchor="end">腕のリーチ (概念図)</text>
<text class="tick" x="110" y="258" text-anchor="middle">小柄な利用者</text></g>
</svg>
<p class="tb-caption">図: 肩を中心とした腕のリーチ円 (側面)。棚や操作部は、小さい人のリーチ円の内側に置く。</p>
<svg class="tb-chart" viewBox="0 0 520 180" role="img" aria-label="調整範囲でカバーする">

<line class="axis" x1="40" y1="130" x2="500" y2="130"/>
<path d="M40,129 C110,128 150,110 180,70 C200,40 215,25 225,25 C235,25 250,40 270,70 C300,110 340,128 410,129" fill="none" style="stroke:var(--tb-text-3)" stroke-width="2"/>
<path d="M140,130 L140,118 C160,100 175,75 200,40 C210,28 220,25 225,25 C235,25 245,30 255,45 C275,75 295,100 310,118 L310,130 z" style="fill:var(--tb-accent);stroke:var(--tb-accent)" fill-opacity="0.22" stroke-width="1.5"/>
<text class="tick" x="140" y="146" text-anchor="middle">5 %</text><text class="tick" x="310" y="146" text-anchor="middle">95 %</text>
<text class="mark-t" x="225" y="100" text-anchor="middle">調整範囲</text>
<line class="k-dimline" x1="140" y1="164" x2="310" y2="164" style="marker-start:none;marker-end:none" stroke-width="3"/>
<g><animateTransform attributeName="transform" type="translate" values="-85,0;85,0;-85,0" keyTimes="0;0.5;1" calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1" dur="5s" repeatCount="indefinite"/>
<g class="k-shadow"><rect class="k-alu" x="221" y="156" width="8" height="10"/><rect class="k-accent" x="207" y="150" width="36" height="8" rx="3"/></g></g>
<text class="tick" x="330" y="168">座面高さを動かして 90 % をカバー</text>
</svg>
<p class="tb-caption">図: 椅子や作業台は 5〜95 パーセンタイルを調整範囲でカバーする (動く点は調整位置)。</p>
<p class="tb-caption">図: 肩を中心とした腕のリーチ円。棚や操作部は小さい人のリーチ円の内側に置く。</p>
<p>下のウィジェットで、パーセンタイルと性別を切り替えて、棚や操作盤の高さに手が届くかを確かめてみましょう。</p>
<div data-widget="anim-reach"></div>
<p>さらに、測定値は裸体・素足が基本なので、<b>靴 (+25〜40 mm 目安)・作業服・手袋・ヘルメット</b>などの<b>着衣補正</b>と、作業時の姿勢による<b>動作余裕</b>を加えます。</p>
<div class="tb-tip"><b>3DCAD Studio</b>: 5 パーセンタイルと 95 パーセンタイルの人を円柱・直方体の簡易形状で作ってアセンブリに置き、拘束を駆動して腕や脚を動かすと、届くか・干渉するかを干渉解析と測定で確認できます。パラメータで身長を変えた案も素早く作れます。</div>`,
    points: ["パーセンタイル値 = 平均 + z × 標準偏差 (5/95 % は z = ∓1.645)", "届く寸法は小さい人、通る寸法は大きい人、両方なら調整機構", "数値は概略値 — 人体寸法データベース等の一次出典を確認する", "着衣補正・動作余裕を加え、パーセンタイルどうしは足さない"],
    exercises: [
      {
        q: "ある女性集団の身長が平均 1 580 mm、標準偏差 55 mm の正規分布とします。5 パーセンタイルの身長は? また男性集団 (平均 1 710 mm、σ = 58 mm) の 95 パーセンタイルは?",
        a: "女性 5 %: 1 580 − 1.645 × 55 = 1 580 − 90.5 ≈ <b>1 490 mm</b>。男性 95 %: 1 710 + 1.645 × 58 = 1 710 + 95.4 ≈ <b>1 805 mm</b>。この 2 つの間に、男女を合わせた利用者の大部分が入ります (数値は例題用の仮定)。",
      },
      {
        q: "膝窩高 (平均 400 mm、σ = 30 mm と仮定) の 5〜95 パーセンタイルをカバーする椅子の座面高さ調整範囲を考えてください (靴の補正 +30 mm)。",
        a: "5 %: 400 − 1.645 × 30 ≈ 351 mm、95 %: 400 + 49 ≈ 449 mm。靴で +30 mm して<b>約 380〜480 mm</b> の調整範囲が目安になります。",
      },
    ],
    quiz: [
      { q: "正規分布で 95 パーセンタイルを求める式は?", choices: ["μ + 1.645σ", "μ + 1.96σ", "μ + 2σ"], answer: 0, explain: "片側 5 % の z 値は 1.645 です。1.96 は両側 5 % (片側 2.5 %) に相当します。" },
      { q: "脚の入るすき間 (机の下の高さ) の基準にするのは?", choices: ["小さい人", "平均の人", "大きい人"], answer: 2, explain: "クリアランス (通る・入る) は大きい人に合わせます。" },
      { q: "「身長 5 パーセンタイルの人」の腕の長さについて正しいのは?", choices: ["必ず 5 パーセンタイル", "5 パーセンタイルとは限らない", "必ず平均"], answer: 1, explain: "寸法間の相関は完全ではないので、パーセンタイルは寸法ごとに扱います。" },
    ],
    lessons: ["7-2"],
  },
  {
    id: "controls",
    part: "ux",
    title: "【中級】操作具の設計",
    minutes: 20,
    level: 2,
    lead: "ボタン・スイッチ・つまみ・レバー・ペダルは、人と機械が出会う接点です。種類の選び方、大きさ・操作力・ストローク、誤操作の防ぎ方、操作方向と配置のルールを学びます。",
    body: `
<h2>操作具の種類と選び方</h2>
<table class="tb-table">
  <tr><th>種類</th><th>向いている用途</th><th>注意</th></tr>
  <tr><td>押しボタン</td><td>起動・停止・確定など 2 値の瞬間操作</td><td>状態が見えにくい → 表示灯と組み合わせる</td></tr>
  <tr><td>トグル・ロッカースイッチ</td><td>ON/OFF の保持、状態が形でわかる</td><td>引っかけによる誤操作 → ガード</td></tr>
  <tr><td>ロータリースイッチ (段階)</td><td>3〜12 程度の選択</td><td>クリック感 (デテント) と目盛を明確に</td></tr>
  <tr><td>連続つまみ (ノブ)</td><td>音量・速度など連続量の調整</td><td>回転範囲と感度の設計</td></tr>
  <tr><td>レバー</td><td>大きな力・方向のある操作 (前進/後退)</td><td>操作方向を動きと一致させる</td></tr>
  <tr><td>ペダル</td><td>手がふさがっている時の操作、大きな力</td><td>踏み間違い・意図しない踏み込み → カバー</td></tr>
</table>
<svg class="tb-chart" viewBox="0 0 520 170" role="img" aria-label="操作具の種類と動き">

<rect class="k-panel" x="8" y="8" width="96" height="154"/><rect class="k-panel" x="110" y="8" width="96" height="154"/><rect class="k-panel" x="212" y="8" width="96" height="154"/><rect class="k-panel" x="314" y="8" width="96" height="154"/><rect class="k-panel" x="416" y="8" width="96" height="154"/>
<g class="k-shadow"><rect class="k-alu" x="20" y="100" width="72" height="8"/><rect class="k-part" x="38" y="90" width="36" height="10" rx="2"/>
<g><animateTransform attributeName="transform" type="translate" values="0,0;0,6;0,0" keyTimes="0;0.5;1" calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1" dur="2s" repeatCount="indefinite"/><rect class="k-accent" x="43" y="72" width="26" height="20" rx="4"/></g></g>
<line class="k-move" x1="56" y1="32" x2="56" y2="62"/>
<text class="tick" x="56" y="146" text-anchor="middle">押しボタン</text>
<g class="k-shadow"><rect class="k-alu" x="122" y="100" width="72" height="8"/><path class="k-part" d="M146,100 L146,90 L152,85 L164,85 L170,90 L170,100 Z"/>
<path d="M158,88 L174,52" fill="none" style="stroke:var(--k-line)" stroke-width="8.4"/><path d="M158,88 L174,52" fill="none" style="stroke:var(--k-steel-2)" stroke-width="6"/><circle class="k-sphere" cx="175" cy="50" r="5"/></g>
<path class="k-move" d="M134,62 A34,34 0 0 1 186,36"/>
<text class="tick" x="158" y="146" text-anchor="middle">トグル</text>
<line class="k-thin" x1="236.7" y1="107.3" x2="233.8" y2="110.2" stroke-width="1.4"/><line class="k-thin" x1="227.0" y1="84.0" x2="223.0" y2="84.0" stroke-width="1.4"/><line class="k-thin" x1="236.7" y1="60.7" x2="233.8" y2="57.8" stroke-width="1.4"/><line class="k-thin" x1="260.0" y1="51.0" x2="260.0" y2="47.0" stroke-width="1.4"/><line class="k-thin" x1="283.3" y1="60.7" x2="286.2" y2="57.8" stroke-width="1.4"/><line class="k-thin" x1="293.0" y1="84.0" x2="297.0" y2="84.0" stroke-width="1.4"/><line class="k-thin" x1="283.3" y1="107.3" x2="286.2" y2="110.2" stroke-width="1.4"/>
<g class="k-shadow"><circle cx="260" cy="84" r="28" style="fill:var(--k-steel-3);stroke:var(--k-line)" stroke-width="1.4"/><circle cx="260" cy="84" r="27" fill="none" style="stroke:var(--k-steel-1)" stroke-width="3" stroke-dasharray="2 2.6"/><circle class="k-part" cx="260" cy="84" r="22"/></g>
<g><animateTransform attributeName="transform" type="rotate" values="0 260 84;90 260 84;0 260 84" keyTimes="0;0.5;1" calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1" dur="4s" repeatCount="indefinite"/><line x1="260" y1="84" x2="260" y2="66" style="stroke:var(--tb-accent)" stroke-width="4"/></g>
<circle cx="260" cy="84" r="3" style="fill:var(--k-line)"/>
<path class="k-move" d="M228,52 A44,44 0 0 1 292,52"/>
<text class="tick" x="260" y="146" text-anchor="middle">つまみ (右回りで増)</text>
<g class="k-shadow"><g><animateTransform attributeName="transform" type="rotate" values="-6 362 96;14 362 96;-6 362 96" keyTimes="0;0.5;1" calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1" dur="3s" repeatCount="indefinite"/>
<path d="M362,96 L380,48" fill="none" style="stroke:var(--k-line)" stroke-width="8.4"/><path d="M362,96 L380,48" fill="none" style="stroke:var(--k-steel-2)" stroke-width="6"/><circle class="k-sphere" cx="381" cy="44" r="8"/></g>
<rect class="k-part" x="340" y="92" width="44" height="14" rx="3"/><line class="k-thin" x1="350" y1="96" x2="374" y2="96" stroke-width="2"/></g>
<path class="k-move" d="M334,34 A72,72 0 0 1 400,32"/>
<text class="tick" x="362" y="146" text-anchor="middle">レバー</text>
<g class="k-shadow"><rect class="k-part" x="424" y="108" width="80" height="8" rx="2"/>
<g><animateTransform attributeName="transform" type="rotate" values="0 432 106;7 432 106;0 432 106" keyTimes="0;0.5;1" calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1" dur="2.4s" repeatCount="indefinite"/>
<path class="k-part" d="M430,104 L500,84 L503,92 L433,110 Z"/>
<path d="M448,90 Q450,74 470,70 L494,66 Q506,66 503,76 L496,80 Z" fill="#2b3340" style="stroke:var(--k-line)" stroke-width="1.2"/></g>
<circle class="k-sphere" cx="432" cy="106" r="4"/></g>
<line class="k-move" x1="478" y1="26" x2="478" y2="58"/>
<text class="tick" x="464" y="146" text-anchor="middle">ペダル</text>
</svg>
<p class="tb-caption">図: 主な操作具と操作方向 (矢印)。つまみは右回りで値が増えるのが一般的なステレオタイプ。</p>
<h2>大きさ・操作力・ストロークの目安</h2>
<table class="tb-table">
  <tr><th>操作具</th><th>大きさ</th><th>操作力</th><th>ストローク</th></tr>
  <tr><td>指先の押しボタン</td><td>直径 10〜20 mm 程度 (手袋使用なら大きく)</td><td>約 3〜10 N</td><td>約 2〜6 mm</td></tr>
  <tr><td>手のひらで押すボタン (非常停止など)</td><td>直径 40 mm 程度以上</td><td>約 10〜20 N 以上</td><td>数 mm〜</td></tr>
  <tr><td>トグルスイッチ</td><td>レバー長 15〜50 mm 程度</td><td>約 3〜10 N</td><td>角度 30° 以上</td></tr>
  <tr><td>つまみ (指でつまむ)</td><td>直径 10〜50 mm 程度</td><td>トルク小 (〜0.3 N·m 程度)</td><td>—</td></tr>
  <tr><td>手で握るレバー</td><td>握り径 25〜40 mm 程度</td><td>〜100 N 程度 (頻度・姿勢で大きく変わる)</td><td>〜300 mm 程度</td></tr>
  <tr><td>ペダル (足首操作)</td><td>幅 75 mm 程度以上</td><td>約 20〜90 N</td><td>約 15〜65 mm</td></tr>
</table>
<div class="tb-note">表の値は人間工学の文献に見られる<b>概略の目安</b>で、出典・使用条件 (頻度・手袋・姿勢・対象者) によって異なります。重要な用途では関連規格や文献で確認し、試作で検証してください。</div>
<p>操作力は「軽ければよい」わけではありません。軽すぎると誤って触れただけで作動し、手応えがないため操作したかわかりません。<b>適度な抵抗 + クリック感 + 確実なフィードバック</b>が基本です。</p>
<h2>誤操作の防止</h2>
<ul>
  <li><b>ガード・囲い</b>: ボタンの周囲を一段高いリングで囲む (シュラウド)、トグルにカバー</li>
  <li><b>埋め込み (リセス)</b>: 面より奥に置き、指を入れないと押せないようにする</li>
  <li><b>二段操作・インターロック</b>: カバーを開けてから押す、引いてから倒す (ロック付きトグル)、2 つのボタンを同時に押す (両手操作)</li>
  <li><b>保持時間</b>: 長押し 2〜3 秒で作動 (リセット・初期化など)</li>
  <li><b>形・色・位置で区別</b>: 停止ボタンは大きく赤く、起動ボタンは埋め込み・小さめにすることが多い</li>
  <li>重大な操作は<b>取り消し可能</b>にするか、確認を求める</li>
</ul>
<svg class="tb-chart" viewBox="0 0 520 190" role="img" aria-label="誤操作防止の形状">

<rect class="k-panel" x="8" y="8" width="164" height="174"/><rect class="k-panel" x="178" y="8" width="164" height="174"/><rect class="k-panel" x="348" y="8" width="164" height="174"/>
<g class="k-shadow"><rect class="k-cut" x="18" y="120" width="144" height="16"/><rect class="k-accent" x="68" y="98" width="44" height="22" rx="3"/></g>
<g transform="translate(90,98)"><g><animateTransform attributeName="transform" type="translate" values="0,-24;0,0;0,0;0,-24" keyTimes="0;0.35;0.55;1" calcMode="spline" keySplines="0.45 0 0.55 1;0 0 1 1;0.45 0 0.55 1" dur="3s" repeatCount="indefinite"/><g transform="scale(0.75)"><rect x="-8" y="-86" width="30" height="24" rx="4" style="fill:var(--k-accent-1);stroke:var(--k-line)" stroke-width="1.2"/><rect class="k-skin" x="-8" y="-64" width="30" height="30" rx="10"/><path d="M14,-52 q7,0 7,5 M14,-44 q7,0 7,5" class="k-thin"/><rect class="k-skin" x="-11" y="-50" width="9" height="18" rx="4.5" transform="rotate(-12 -6 -41)"/><rect class="k-skin" x="-5" y="-40" width="10" height="40" rx="5"/><path d="M-3,-3 q3,-5 6,0" class="k-thin"/></g></g></g>
<line class="k-thin" x1="122" y1="44" x2="104" y2="52"/><text class="tick" x="126" y="44">指</text>
<g class="k-shadow"><path class="k-cut" d="M188,120 L222,120 L222,92 L234,92 L234,120 L286,120 L286,92 L298,92 L298,120 L332,120 L332,136 L188,136 Z"/><rect class="k-accent" x="240" y="108" width="40" height="12" rx="3"/></g>
<line class="guide" x1="210" y1="92" x2="310" y2="92"/>
<g class="k-shadow"><path class="k-cut" d="M358,120 L410,120 L410,140 L470,140 L470,120 L502,120 L502,152 L358,152 Z"/><rect class="k-accent" x="415" y="130" width="50" height="10" rx="3"/></g>
<line class="guide" x1="390" y1="120" x2="490" y2="120"/>
<text class="mark-t" x="90" y="172" text-anchor="middle">突出 (押しやすい)</text><text class="mark-t" x="260" y="172" text-anchor="middle">ガード (シュラウド)</text><text class="mark-t" x="430" y="172" text-anchor="middle">埋め込み (リセス)</text>
</svg>
<p class="tb-caption">図: 断面で見た押しボタンの形状。周囲を高くするほど偶発的に押されにくい (起動は埋め込み、停止は突出が多い)。</p>
<h2>操作方向のステレオタイプ</h2>
<table class="tb-table">
  <tr><th>操作</th><th>多くの人が期待する意味</th></tr>
  <tr><td>右回り (時計回り)</td><td>増加・ON・右へ移動 (ただし<b>バルブは右回りで閉</b>が慣習)</td></tr>
  <tr><td>上・前・右へ動かす</td><td>増加・ON・前進</td></tr>
  <tr><td>レバーを前に倒す</td><td>機械が前進 / 下降 (機器による — 統一が大切)</td></tr>
</table>
<p>なお、照明スイッチの上下は国や地域で慣習が異なります。<b>ステレオタイプは文化に依存</b>するので、海外向けでは確認が必要です。</p>
<h2>ターゲットの大きさと距離 (フィッツの法則)</h2>
<p>ボタンに手や指を動かす時間は、距離 D が長いほど、ボタン幅 W が小さいほど長くなります。これを<b>フィッツの法則</b>といいます (詳しくは「ターゲットの大きさと配置」の章)。</p>
<div class="tb-formula">MT = a + b × log₂(D/W + 1)　(a, b は人・装置ごとに実験で求める係数)</div>
<p>次の実験で、大きさと距離の違うターゲットをクリックし、所要時間と難易度 ID の関係を確かめてみましょう。</p>
<div data-widget="anim-fitts"></div>
<h2>配置の原則</h2>
<ol>
  <li><b>重要度</b>: 非常停止など重要なものは最も目立ち、すぐ届く位置に</li>
  <li><b>使用頻度</b>: よく使うものを手の届きやすい中心に</li>
  <li><b>機能別</b>: 関係する操作をグループにまとめ、枠線や色で区切る</li>
  <li><b>使用順序</b>: 手順どおり左→右、上→下に並べる</li>
  <li><b>対応づけ</b>: 制御対象の配置と操作具の配置をそろえる</li>
</ol>
<svg class="tb-chart" viewBox="0 0 520 230" role="img" aria-label="コンロのつまみ配置">

<rect class="k-panel" x="8" y="8" width="244" height="214"/><rect class="k-panel" x="268" y="8" width="244" height="214"/>
<circle class="k-badge" cx="28" cy="28" r="10" style="fill:var(--tb-bad)"/><text class="k-badge-t" x="28" y="32" text-anchor="middle">✕</text><text class="k-bad-t" x="44" y="33">悪い例: 一列 — どれがどれ?</text>
<circle class="k-badge" cx="288" cy="28" r="10" style="fill:var(--tb-good)"/><text class="k-badge-t" x="288" y="32" text-anchor="middle">✓</text><text class="k-good-t" x="304" y="33">良い例</text>
<g class="k-shadow"><rect class="k-part" x="20" y="46" width="220" height="150" rx="8"/></g>
<rect x="28" y="52" width="204" height="104" rx="4" style="fill:var(--k-steel-3)" opacity="0.55"/>
<circle cx="75" cy="79" r="20" style="fill:var(--k-line-2)" opacity="0.22"/><circle cx="75" cy="79" r="20" class="k-thin" stroke-width="1.4"/><circle cx="75" cy="79" r="12.0" class="k-thin"/><circle cx="75" cy="79" r="5.0" class="k-thin"/><circle cx="185" cy="79" r="20" style="fill:var(--k-line-2)" opacity="0.22"/><circle cx="185" cy="79" r="20" class="k-thin" stroke-width="1.4"/><circle cx="185" cy="79" r="12.0" class="k-thin"/><circle cx="185" cy="79" r="5.0" class="k-thin"/><circle cx="75" cy="129" r="20" style="fill:var(--k-line-2)" opacity="0.22"/><circle cx="75" cy="129" r="20" class="k-thin" stroke-width="1.4"/><circle cx="75" cy="129" r="12.0" class="k-thin"/><circle cx="75" cy="129" r="5.0" class="k-thin"/><circle cx="185" cy="129" r="20" style="fill:var(--k-line-2)" opacity="0.22"/><circle cx="185" cy="129" r="20" class="k-thin" stroke-width="1.4"/><circle cx="185" cy="129" r="12.0" class="k-thin"/><circle cx="185" cy="129" r="5.0" class="k-thin"/>
<circle class="k-sphere" cx="50" cy="176" r="9"/><line x1="50" y1="176" x2="46.4" y2="169.8" style="stroke:var(--k-line)" stroke-width="2"/><circle class="k-sphere" cx="100" cy="176" r="9"/><line x1="100" y1="176" x2="96.4" y2="169.8" style="stroke:var(--k-line)" stroke-width="2"/><circle class="k-sphere" cx="160" cy="176" r="9"/><line x1="160" y1="176" x2="156.4" y2="169.8" style="stroke:var(--k-line)" stroke-width="2"/><circle class="k-sphere" cx="210" cy="176" r="9"/><line x1="210" y1="176" x2="206.4" y2="169.8" style="stroke:var(--k-line)" stroke-width="2"/>
<text class="k-bad-t" x="130" y="214" text-anchor="middle">? ? ? ?</text>
<g class="k-shadow"><rect class="k-part" x="300" y="46" width="180" height="150" rx="8"/></g>
<rect x="308" y="52" width="164" height="94" rx="4" style="fill:var(--k-steel-3)" opacity="0.55"/>
<circle cx="340" cy="74" r="16" style="fill:var(--k-line-2)" opacity="0.22"/><circle cx="340" cy="74" r="16" class="k-thin" stroke-width="1.4"/><circle cx="340" cy="74" r="9.6" class="k-thin"/><circle cx="340" cy="74" r="4.0" class="k-thin"/><circle cx="440" cy="74" r="16" style="fill:var(--k-line-2)" opacity="0.22"/><circle cx="440" cy="74" r="16" class="k-thin" stroke-width="1.4"/><circle cx="440" cy="74" r="9.6" class="k-thin"/><circle cx="440" cy="74" r="4.0" class="k-thin"/><circle cx="345" cy="118" r="21" style="fill:var(--k-line-2)" opacity="0.22"/><circle cx="345" cy="118" r="21" class="k-thin" stroke-width="1.4"/><circle cx="345" cy="118" r="12.6" class="k-thin"/><circle cx="345" cy="118" r="5.2" class="k-thin"/><circle cx="435" cy="118" r="21" style="fill:var(--k-line-2)" opacity="0.22"/><circle cx="435" cy="118" r="21" class="k-thin" stroke-width="1.4"/><circle cx="435" cy="118" r="12.6" class="k-thin"/><circle cx="435" cy="118" r="5.2" class="k-thin"/>
<circle cx="435" cy="118" r="21" style="fill:var(--tb-bad)" opacity="0.3"><animate attributeName="opacity" values="0.1;0.6;0.1" dur="2s" repeatCount="indefinite"/></circle>
<line class="guide" x1="340" y1="74" x2="372" y2="162"/><line class="guide" x1="435" y1="118" x2="408" y2="184"/>
<circle class="k-sphere" cx="375" cy="162" r="9"/><line x1="375" y1="162" x2="371.4" y2="155.8" style="stroke:var(--k-line)" stroke-width="2"/><circle class="k-sphere" cx="405" cy="162" r="9"/><line x1="405" y1="162" x2="401.4" y2="155.8" style="stroke:var(--k-line)" stroke-width="2"/><circle class="k-sphere" cx="375" cy="184" r="9"/><line x1="375" y1="184" x2="371.4" y2="177.8" style="stroke:var(--k-line)" stroke-width="2"/><circle cx="405" cy="184" r="10" style="fill:var(--tb-accent)" opacity="0.35"><animate attributeName="opacity" values="0.1;0.6;0.1" dur="2s" repeatCount="indefinite"/></circle><circle class="k-sphere" cx="405" cy="184" r="9"/><line x1="405" y1="184" x2="401.4" y2="177.8" style="stroke:var(--k-line)" stroke-width="2"/>
<text class="k-note" x="390" y="212" text-anchor="middle">つまみもバーナーと同じ 2×2 配置</text>
</svg>
<p class="tb-caption">図: コンロのつまみ配置。右の例ではつまみがバーナーと同じ配置なので、右手前のつまみ → 右手前のバーナーと迷わない。</p>
<p>実際に試してみましょう。一列配置と空間的に対応づけた配置で、指示されたバーナーを点火するまでの時間と間違いの数を比べます。</p>
<div data-widget="anim-mapping"></div>
<div class="tb-tip"><b>3DCAD Studio</b>: 操作パネルをモデル化し、手の簡易形状をアセンブリに置いて隣のボタンとの干渉を確認しましょう。断面図でガードの高さとボタンの沈み込みを確認し、3D プリント試作で操作感を確かめられます。</div>`,
    points: ["用途 (瞬間/保持/選択/連続/大きな力) で操作具を選ぶ", "大きさ・操作力・ストロークは目安 — 軽すぎず手応えとフィードバックを", "ガード・埋め込み・二段操作・長押しで誤操作を防ぐ", "ステレオタイプに合わせ、重要度・頻度・機能・順序で配置する"],
    exercises: [
      {
        q: "工作機械の操作盤に「起動」「停止」「非常停止」「主軸速度調整」を配置します。それぞれの操作具の種類と誤操作防止策を提案してください。",
        a: "例: 起動 = 埋め込み型の押しボタン (緑系または白、軽く触れても作動しない)。停止 = 突出型の押しボタン (赤または黒、押しやすく)。非常停止 = 赤のきのこ形押しボタン・黄色の背景、どの操作位置からもすぐ届く位置、押すとロックし引く/回すまで復帰しない。主軸速度 = クリック付き連続つまみ、右回りで増加、目盛付き。速度の急変を防ぐには操作量に上限を設ける。",
      },
      {
        q: "手袋をした作業者が操作する盤で、直径 22 mm 級の押しボタンを 3 個横に並べる。ボタン中心間隔を 50 mm とすると、両端のボタン中心間の距離と、隣り合うボタンの縁と縁のすき間はいくらか。すき間が狭いと何が起こるか。",
        a: "両端の中心間 = 50 × 2 = <b>100 mm</b>。縁のすき間 = 50 − 22 = <b>28 mm</b>。すき間が狭いと手袋の指先が隣のボタンにかかり、2 つ同時に押したり違うボタンを押したりする。試作で実際の手袋をはめて押し比べ、間隔を決める。",
      },
    ],
    quiz: [
      { q: "3〜8 段階の選択に向く操作具は?", choices: ["押しボタン", "ロータリースイッチ", "ペダル"], answer: 1, explain: "段階 (デテント) 付きのロータリースイッチは選択状態が見え、多段の選択に向きます。" },
      { q: "一般的に「右回り」が意味として期待されないものは?", choices: ["音量を上げる", "水栓のバルブを開ける", "値を増やす"], answer: 1, explain: "バルブ・水栓は右回りで閉じるのが慣習です。" },
      { q: "誤操作防止の二段操作の例は?", choices: ["ボタンを大きくする", "カバーを開けてから押す", "ボタンを明るい色にする"], answer: 1, explain: "2 つの独立した動作を必要とすることで偶発的な作動を防ぎます。" },
    ],
    lessons: ["9-1"],
  },
  {
    id: "displays",
    part: "ux",
    title: "【中級】表示とサインの見やすさ",
    minutes: 20,
    level: 2,
    lead: "表示が読めなければ、どんなに良い機能も伝わりません。視角から必要な文字の大きさを計算し、照明とコントラスト、表示灯の色、ピクトグラムと警告ラベルの考え方を学びます。",
    body: `
<h2>視角と文字の大きさ</h2>
<p>文字の見やすさは、文字の絶対的な大きさではなく、目から見込む角度 = <b>視角</b>で決まります。視角は分 (arcmin、1° = 60′) で表します。</p>
<svg class="tb-chart" viewBox="0 0 520 180" role="img" aria-label="視角と文字高さ">

<path d="M30,180 Q30,118 52,112 L80,112 Q96,118 96,180 Z" style="fill:var(--k-accent-1);stroke:var(--k-line)" stroke-width="1.4"/>
<path d="M50.0,96.0 L52.0,112.0" fill="none" style="stroke:var(--k-line)" stroke-width="11.4"/><path d="M50.0,96.0 L52.0,112.0" fill="none" style="stroke:var(--k-skin-1)" stroke-width="9.0"/>
<circle class="k-skin" cx="52" cy="80" r="18"/><path d="M68.7,80.9 l2.6,3.2 l-2.8,0.6" class="k-skin" stroke-width="1"/><path d="M66.8,70.1 A18,18 0 1 0 39.0,92.2 Q49.3,81.8 66.8,70.1 Z" fill="#4a3728" style="stroke:var(--k-line)" stroke-width="1"/><circle cx="61.9" cy="79.6" r="1.4" style="fill:var(--k-line)"/>
<path d="M66,80 L420,40 L420,120 Z" style="fill:var(--tb-accent)" opacity="0.08"/>
<line class="guide" x1="66" y1="80" x2="420" y2="40"/><line class="guide" x1="66" y1="80" x2="420" y2="120"/>
<path d="M126,73.3 A60,60 0 0 1 126,86.8" fill="none" style="stroke:var(--k-dim)" stroke-width="1.6"/>
<text class="k-dimtext" x="134" y="84">視角 α</text>
<g class="k-shadow"><rect class="k-panel" x="420" y="26" width="64" height="108" rx="4"/></g>
<text x="452" y="120" text-anchor="middle" style="fill:var(--tb-text)" font-size="111" font-weight="700" font-family="Arial, Helvetica, sans-serif">A</text>
<line class="k-ext" x1="476" y1="40" x2="504" y2="40"/><line class="k-ext" x1="476" y1="120" x2="504" y2="120"/><line class="k-dimline" x1="500" y1="40" x2="500" y2="120"/>
<text class="k-dimtext" x="452" y="18" text-anchor="middle">文字高さ h</text>
<line class="k-ext" x1="66" y1="96" x2="66" y2="160"/><line class="k-ext" x1="420" y1="138" x2="420" y2="160"/><line class="k-dimline" x1="66" y1="154" x2="420" y2="154"/>
<text class="k-dimtext" x="243" y="170" text-anchor="middle">視距離 D</text>
<line class="k-thin" x1="90" y1="104" x2="70" y2="84"/><text class="tick" x="94" y="110">目</text>
</svg>
<div class="tb-formula">h ≈ D × tan(α)　　例: D = 700 mm、α = 20′ → h = 700 × tan(0.333°) ≈ 4.1 mm</div>
<p>文字高さの視角の目安は、読める限界でおよそ 10′ 前後、<b>楽に読める推奨値で 16〜24′ 程度</b>とされます (文献により異なる目安)。重要な表示・高齢者・低照度・振動のある環境では大きめにします。</p>
<div data-widget="legibility"></div>
<table class="tb-table">
  <tr><th>視距離</th><th>20′ のときの文字高さ</th><th>使われ方の例</th></tr>
  <tr><td>500 mm</td><td>約 2.9 mm</td><td>手元の機器・取扱説明</td></tr>
  <tr><td>700 mm</td><td>約 4.1 mm</td><td>操作パネル・画面</td></tr>
  <tr><td>1 000 mm</td><td>約 5.8 mm</td><td>装置前面の表示</td></tr>
  <tr><td>3 000 mm</td><td>約 17 mm</td><td>室内の案内表示</td></tr>
  <tr><td>10 000 mm</td><td>約 58 mm</td><td>工場内の大型表示</td></tr>
</table>
<h2>視力・照明・コントラスト</h2>
<ul>
  <li><b>視力</b>: 視力 1.0 は 1′ の切れ目を識別できる能力。視力が 0.5 なら必要な大きさはおよそ 2 倍。高齢になると近くが見えにくく (老視)、暗さ・まぶしさにも弱くなる</li>
  <li><b>照明</b>: 暗いと読める大きさが大きくなる。反射・映り込み (グレア) は表面をつや消しにし、表示面の角度を工夫して防ぐ</li>
  <li><b>コントラスト</b>: 文字と背景の明るさの差。輝度比で高いほどよく、画面の文字では Web のアクセシビリティ指針 (WCAG) で 4.5:1 以上が推奨値の一つ。色の違いだけに頼らない</li>
  <li><b>書体</b>: 線の太さが均一で字形の区別しやすい書体 (0/O、1/l/I) を選ぶ。細すぎ・詰めすぎは不可</li>
</ul>
<svg class="tb-chart" viewBox="0 0 520 140" role="img" aria-label="コントラストの比較">

<g class="k-shadow"><rect x="20" y="14" width="150" height="70" rx="8" fill="#9e9e9e"/><rect x="185" y="14" width="150" height="70" rx="8" fill="#c62828"/><rect x="350" y="14" width="150" height="70" rx="8" fill="#1a1a1a"/></g>
<text x="95" y="57" text-anchor="middle" fill="#bdbdbd" font-size="22">START</text>
<text x="260" y="57" text-anchor="middle" fill="#2e7d32" font-size="22">STOP</text>
<text x="425" y="57" text-anchor="middle" fill="#ffffff" font-size="22" font-weight="700">STOP</text>
<circle class="k-badge" cx="30" cy="108" r="10" style="fill:var(--tb-bad)"/><text class="k-badge-t" x="30" y="112" text-anchor="middle">✕</text><text class="tick" x="44" y="112">輝度差が小さい</text>
<circle class="k-badge" cx="195" cy="108" r="10" style="fill:var(--tb-bad)"/><text class="k-badge-t" x="195" y="112" text-anchor="middle">✕</text><text class="tick" x="209" y="112">赤地に緑 (色覚で判別困難)</text>
<circle class="k-badge" cx="360" cy="108" r="10" style="fill:var(--tb-good)"/><text class="k-badge-t" x="360" y="112" text-anchor="middle">✓</text><text class="tick" x="374" y="112">高コントラスト・太字</text>
</svg>
<p class="tb-caption">図: 文字と背景のコントラスト。色相の違いより明るさ (輝度) の差が読みやすさを決める。</p>
<h2>表示灯の色 (IEC 60204-1 / JIS B 9960-1)</h2>
<table class="tb-table">
  <tr><th>色</th><th>意味</th><th>説明・操作者の行動</th></tr>
  <tr><td>赤</td><td>非常</td><td>危険な状態 — 直ちに処置する</td></tr>
  <tr><td>黄</td><td>異常</td><td>異常な状態、差し迫った危険 — 監視または介入</td></tr>
  <tr><td>青</td><td>強制</td><td>操作者の行動が必要な状態 — 指示された操作を行う</td></tr>
  <tr><td>緑</td><td>正常</td><td>正常な状態 — 任意</td></tr>
  <tr><td>白</td><td>中立</td><td>その他の状態 (赤・黄・青・緑の使用が不明確なときなど) — 監視</td></tr>
</table>
<p>色だけで区別すると色覚の多様な人や逆光時に判別しにくいので、<b>点灯/点滅・位置・文字・形</b>を組み合わせます (点滅は注意を引く・優先度の高い情報に)。</p>
<h2>ピクトグラムと安全標識</h2>
<p>ISO 3864 / ISO 7010、JIS Z 9101 などの安全標識は、<b>形と色で種類</b>を表します。</p>
<svg class="tb-chart" viewBox="0 0 520 160" role="img" aria-label="安全標識の形">

<g class="k-shadow">
<circle cx="70" cy="65" r="42" fill="#fff" stroke="#d32f2f" stroke-width="9"/><line x1="41" y1="36" x2="99" y2="94" stroke="#d32f2f" stroke-width="9"/>
<circle cx="195" cy="65" r="44" fill="#fff"/><circle cx="195" cy="65" r="41" fill="#1565c0"/><text x="195" y="78" text-anchor="middle" fill="#fff" font-size="38" font-weight="700">!</text>
<path d="M320,22 L367,106 L273,106 z" fill="#fbc02d" stroke="#222" stroke-width="6" stroke-linejoin="round"/><text x="320" y="98" text-anchor="middle" fill="#222" font-size="38" font-weight="700">!</text>
<rect x="404" y="22" width="86" height="86" rx="4" fill="#2e7d32"/><rect x="408" y="26" width="78" height="78" rx="2" fill="none" stroke="#fff" stroke-width="1.5"/><path d="M430,82 L447,50 L464,82" stroke="#fff" stroke-width="6" fill="none"/><line x1="447" y1="54" x2="447" y2="96" stroke="#fff" stroke-width="6"/>
</g>
<text class="mark-t" x="70" y="132" text-anchor="middle">禁止</text><text class="mark-t" x="195" y="132" text-anchor="middle">指示 (義務)</text><text class="mark-t" x="320" y="132" text-anchor="middle">警告</text><text class="mark-t" x="447" y="132" text-anchor="middle">安全状態</text>
<text class="k-note" x="70" y="150" text-anchor="middle">赤い円 + 斜線</text><text class="k-note" x="195" y="150" text-anchor="middle">青い円</text><text class="k-note" x="320" y="150" text-anchor="middle">黄色の三角</text><text class="k-note" x="447" y="150" text-anchor="middle">緑の四角</text>
</svg>
<p class="tb-caption">図: 安全標識の基本形 (図記号は略)。形だけでも種類が分かるので、色が見分けにくい場合にも手がかりになる。</p>
<table class="tb-table">
  <tr><th>種類</th><th>形と色</th><th>例</th></tr>
  <tr><td>禁止</td><td>赤い円と斜線、白地、黒の図記号</td><td>立入禁止、火気厳禁</td></tr>
  <tr><td>指示 (義務)</td><td>青い円、白の図記号</td><td>保護めがね着用</td></tr>
  <tr><td>警告</td><td>黄色の三角形、黒枠と黒の図記号</td><td>感電注意、挟まれ注意</td></tr>
  <tr><td>安全状態</td><td>緑の四角形、白の図記号</td><td>非常口、救急箱</td></tr>
</table>
<h2>警告ラベルの考え方</h2>
<ul>
  <li><b>危険の程度を示す信号語</b>: 「危険」(死亡・重傷が差し迫る) &gt; 「警告」(死亡・重傷の可能性) &gt; 「注意」(軽傷・物的損害の可能性) — ISO 3864-2 や ANSI Z535 の考え方</li>
  <li>内容は <b>①危険の種類 ②無視した場合の結果 ③回避方法</b> の 3 要素</li>
  <li>危険源の近くで、作業する人の目に入る位置に。耐久性 (擦れ・油・紫外線) のある材料で</li>
  <li>ラベルは最後の手段。まず設計で危険をなくす (本質安全) → ガード → 表示の順</li>
</ul>
<div class="tb-tip"><b>3DCAD Studio</b>: 文字 (刻印/エンボス) で表示を形状に入れるときは、視距離から文字高さを計算して決めましょう。材料と色・リアル表示で文字と背景のコントラストを確認できます。</div>`,
    points: ["必要な文字高さ h ≈ 視距離 × tan(視角)、推奨 16〜24′ 程度 (目安)", "照明・グレア・コントラスト・書体・視力 (高齢者) を考慮", "IEC 60204-1 の表示灯: 赤 非常、黄 異常、青 強制、緑 正常、白 中立", "安全標識は形と色で種類を示し、警告は危険・結果・回避方法を書く"],
    exercises: [
      {
        q: "視距離 2 m から読む装置の表示を、視角 16′ で設計します。必要な文字高さは? 利用者に高齢者が多いので 1.5 倍の余裕をとると?",
        a: "h = 2000 × tan(16/60 °) = 2000 × tan(0.2667°) ≈ <b>9.3 mm</b>。1.5 倍で約 <b>14 mm</b>。",
      },
      {
        q: "通路の端から 5 m 離れた位置で、装置の状態表示 (文字) を読ませたい。視角 20′ で設計すると必要な文字高さは? また、文字が読めない距離でも状態が分かるようにする工夫を挙げよ。",
        a: "h = 5000 × tan(20/60 °) ≈ <b>29 mm</b>。遠くからは文字より色と位置で判別させるため、装置上部にシグナルタワーを置き、色の上下順を工場内で統一する。色覚の多様性にも配慮し、点灯位置 (段) や点滅でも区別できるようにする。",
      },
    ],
    quiz: [
      { q: "IEC 60204-1 で「操作者の行動が必要な状態」を表す表示灯の色は?", choices: ["黄", "青", "白"], answer: 1, explain: "青は「強制」で、操作者に特定の行動を求めます。黄は異常です。" },
      { q: "視距離が 2 倍になると、同じ視角に必要な文字高さは?", choices: ["約 1/2", "約 2 倍", "約 4 倍"], answer: 1, explain: "h ≈ D × tan(α) なので距離に比例します。" },
      { q: "ISO 3864 系の安全標識で、黄色の三角形が表すのは?", choices: ["禁止", "警告", "指示"], answer: 1, explain: "禁止は赤い円と斜線、指示は青い円、安全状態は緑の四角形です。" },
    ],
    lessons: ["9-1"],
  },
  {
    id: "ux-principles",
    part: "ux",
    title: "【初級】UI/UX の基本原則",
    minutes: 20,
    level: 1,
    lead: "使いやすさには、多くの製品に共通する原則があります。ニールセンの 10 のヒューリスティクスとノーマンのデザイン原則を学び、機械の操作パネルや組込み機器の画面にあてはめてみましょう。",
    body: `
<h2>UI と UX</h2>
<p><b>UI</b> (ユーザインタフェース) はボタン・画面・表示など人と製品が接する部分、<b>UX</b> (ユーザエクスペリエンス) は購入前から使用・保守・廃棄までを含めた<b>体験全体</b>です。UI が整っていても、説明書が分かりにくい、修理に時間がかかる、といった体験は UX を下げます。</p>
<h2>ニールセンの 10 のユーザビリティ・ヒューリスティクス</h2>
<table class="tb-table">
  <tr><th>#</th><th>原則</th><th>機械・組込み機器での例</th></tr>
  <tr><td>1</td><td>システム状態の可視化</td><td>運転中・待機・異常をランプと画面で常に示す。処理中は進捗を表示</td></tr>
  <tr><td>2</td><td>システムと現実世界の一致</td><td>現場の言葉・単位 (mm、rpm) を使う。内部のエラーコードだけを出さない</td></tr>
  <tr><td>3</td><td>ユーザの主導権と自由</td><td>「戻る」「取消」をいつでも。誤って入ったメニューから抜けられる</td></tr>
  <tr><td>4</td><td>一貫性と標準</td><td>どの画面でも「決定」は同じ位置。業界の慣例・規格の色に従う</td></tr>
  <tr><td>5</td><td>エラーの防止</td><td>入力範囲を制限、危険な操作には確認、物理的なインターロック</td></tr>
  <tr><td>6</td><td>記憶より認識</td><td>設定値を覚えさせず画面に表示。アイコンに文字を添える</td></tr>
  <tr><td>7</td><td>柔軟性と効率性</td><td>熟練者向けのショートカット・プリセット登録</td></tr>
  <tr><td>8</td><td>美的でミニマルなデザイン</td><td>今必要な情報だけを大きく。めったに使わない設定は奥へ</td></tr>
  <tr><td>9</td><td>エラーの認識・診断・回復の支援</td><td>「E-23」ではなく「カバーが開いています。閉じてリセットを押してください」</td></tr>
  <tr><td>10</td><td>ヘルプとドキュメント</td><td>必要な場面で探しやすく、手順が具体的な説明</td></tr>
</table>
<svg class="tb-chart" viewBox="0 0 520 200" role="img" aria-label="エラー表示の悪い例と良い例">

<g class="k-shadow"><rect class="k-part" x="14" y="10" width="232" height="146" rx="10"/></g><rect x="22" y="18" width="216" height="120" rx="3" style="fill:var(--tb-surface);stroke:var(--k-line)" stroke-width="1.2"/><circle cx="130" cy="147" r="3.5" style="fill:var(--tb-good)"/><g class="k-shadow"><rect class="k-part" x="274" y="10" width="232" height="146" rx="10"/></g><rect x="282" y="18" width="216" height="120" rx="3" style="fill:var(--tb-surface);stroke:var(--k-line)" stroke-width="1.2"/><circle cx="390" cy="147" r="3.5" style="fill:var(--tb-good)"/>
<rect x="22" y="18" width="216" height="22" style="fill:var(--tb-text-3)"/>
<text class="mark-t" x="130" y="86" text-anchor="middle" font-size="16" font-family="monospace">ERR 0x1F</text>
<rect x="100" y="106" width="60" height="24" rx="4" style="fill:var(--tb-surface-2);stroke:var(--tb-text-2)" stroke-width="1.5"/><text class="tick" x="130" y="122" text-anchor="middle">OK</text>
<rect x="282" y="18" width="216" height="22" style="fill:var(--tb-warn)"/><text class="mark-t" x="292" y="34">⚠ 異常: 冷却水不足</text>
<text class="tick" x="292" y="58">原因: 冷却水の流量が低下</text><text class="tick" x="292" y="75">対処: バルブ V2 を開き</text><text class="tick" x="292" y="90">　　　リセットを押す</text>
<rect x="290" y="104" width="80" height="26" rx="4" style="fill:var(--tb-accent)"/><text x="330" y="121" text-anchor="middle" fill="#fff" font-size="11" font-weight="700">リセット</text>
<rect x="378" y="104" width="112" height="26" rx="4" style="fill:var(--tb-surface-2);stroke:var(--tb-text-2)" stroke-width="1.5"/><text class="tick" x="434" y="121" text-anchor="middle">手順を見る (#10)</text>
<circle class="k-badge" cx="26" cy="182" r="10" style="fill:var(--tb-bad)"/><text class="k-badge-t" x="26" y="186" text-anchor="middle">✕</text><text class="k-bad-t" x="40" y="187">コードだけ (#2, #9 に反する)</text>
<circle class="k-badge" cx="286" cy="182" r="10" style="fill:var(--tb-good)"/><text class="k-badge-t" x="286" y="186" text-anchor="middle">✓</text><text class="k-good-t" x="300" y="187">原因と対処を言葉で</text>
</svg>
<p class="tb-caption">図: ヒューリスティクス #9「エラーの認識・診断・回復」の悪い例と良い例 (画面のモックアップ)。</p>
<svg class="tb-chart" viewBox="0 0 520 130" role="img" aria-label="状態の可視化と一貫性">

<g class="k-shadow"><rect class="k-part" x="8" y="4" width="504" height="122" rx="10"/></g>
<rect x="16" y="11" width="488" height="108" rx="3" style="fill:var(--tb-surface);stroke:var(--k-line)" stroke-width="1.2"/>
<rect x="22" y="16" width="476" height="26" rx="4" style="fill:var(--tb-good)"/><circle cx="36" cy="29" r="5" fill="#fff"><animate attributeName="opacity" values="1;0.35;1" dur="1.6s" repeatCount="indefinite"/></circle>
<text x="48" y="34" fill="#fff" font-size="13" font-weight="700">運転中　主軸 1 200 rpm　残り 03:20</text>
<rect x="22" y="50" width="476" height="8" rx="4" style="fill:var(--tb-surface-2);stroke:var(--tb-border)"/><rect x="22" y="50" width="300" height="8" rx="4" style="fill:var(--tb-accent)"><animate attributeName="width" values="40;476;40" dur="6s" repeatCount="indefinite"/></rect>
<rect x="22" y="76" width="90" height="32" rx="5" style="fill:var(--tb-surface-2);stroke:var(--tb-text-2)" stroke-width="1.5"/><text class="mark-t" x="67" y="97" text-anchor="middle">◀ 戻る</text>
<rect x="408" y="76" width="90" height="32" rx="5" style="fill:var(--tb-accent)"/><text x="453" y="97" text-anchor="middle" fill="#fff" font-size="12" font-weight="700">決定</text>
<text class="tick" x="260" y="96" text-anchor="middle">「戻る」「決定」は全画面で同じ位置 (#3, #4)</text>
</svg>
<p class="tb-caption">図: 状態バーと進捗表示 (#1)、常に同じ位置の「戻る」「決定」(#3・#4)。</p>
<h2>ノーマンのデザイン原則</h2>
<ul>
  <li><b>アフォーダンス</b>: モノと人の関係が可能にする行為 (取っ手は「引ける」、平板は「押せる」)</li>
  <li><b>シグニファイア</b>: どこで何をすればよいかを知らせる手がかり (くぼみ、矢印、ラベル、光)。画面ではアフォーダンス以上にシグニファイアが重要</li>
  <li><b>マッピング (対応づけ)</b>: 操作と結果の位置・方向の関係を自然にする</li>
  <li><b>フィードバック</b>: 操作の結果を<b>すぐに</b>知らせる (目安として 0.1 秒程度以内だと直接操作している感覚、1 秒を超えるなら進捗表示)</li>
  <li><b>制約</b>: できる操作を物理的・論理的・文化的に限定する (逆には差せないコネクタ、無効なボタンをグレーアウト)</li>
  <li><b>概念モデル</b>: 製品の仕組みを利用者が理解できるように見せる</li>
</ul>
<svg class="tb-chart" viewBox="0 0 520 190" role="img" aria-label="ボタン押下とフィードバック">
<g transform="translate(0,20)">
<g class="k-shadow"><rect class="k-cut" x="30" y="108" width="190" height="16"/><rect class="k-part" x="76" y="98" width="78" height="10" rx="2"/>
<g><animateTransform attributeName="transform" type="translate" values="0,0;0,4;0,0;0,0" keyTimes="0;0.1;0.3;1" dur="3s" repeatCount="indefinite"/>
<rect class="k-part" x="82" y="76" width="66" height="24" rx="5"/>
<rect x="82" y="76" width="66" height="24" rx="5" style="fill:var(--tb-accent)" opacity="0"><animate attributeName="opacity" values="0;1;0;0" keyTimes="0;0.1;0.3;1" dur="3s" repeatCount="indefinite"/></rect>
<text class="mark-t" x="104" y="93" text-anchor="middle">運転</text></g></g>
<g transform="translate(132,76)"><g><animateTransform attributeName="transform" type="translate" values="0,-26;0,4;0,-26;0,-26" keyTimes="0;0.1;0.3;1" dur="3s" repeatCount="indefinite"/><g transform="scale(0.75)"><rect x="-8" y="-86" width="30" height="24" rx="4" style="fill:var(--k-accent-1);stroke:var(--k-line)" stroke-width="1.2"/><rect class="k-skin" x="-8" y="-64" width="30" height="30" rx="10"/><path d="M14,-52 q7,0 7,5 M14,-44 q7,0 7,5" class="k-thin"/><rect class="k-skin" x="-11" y="-50" width="9" height="18" rx="4.5" transform="rotate(-12 -6 -41)"/><rect class="k-skin" x="-5" y="-40" width="10" height="40" rx="5"/><path d="M-3,-3 q3,-5 6,0" class="k-thin"/></g></g></g>
<g class="k-shadow"><path class="k-part" d="M236,82 L248,82 L262,70 L262,110 L248,98 L236,98 Z"/></g>
<path d="M270,80 q8,10 0,20 M280,72 q16,18 0,36" style="stroke:var(--tb-accent)" fill="none" stroke-width="2.2" opacity="0"><animate attributeName="opacity" values="0;1;0;0" keyTimes="0;0.12;0.35;1" dur="3s" repeatCount="indefinite"/></path>
<text class="tick" x="262" y="132" text-anchor="middle">ピッ (音)</text>
<circle class="k-part" cx="350" cy="90" r="19"/>
<circle cx="350" cy="90" r="13" style="fill:var(--k-steel-3);stroke:var(--k-line)"/>
<circle cx="350" cy="90" r="13" style="fill:var(--tb-good)" class="k-glow" opacity="0"><animate attributeName="opacity" values="0;0;1;1" keyTimes="0;0.1;0.12;1" dur="3s" repeatCount="indefinite"/></circle>
<text class="tick" x="376" y="94">ランプ点灯 (状態)</text>
<text class="mark-t" x="20" y="158">0.1 s 以内に色・音・ランプで応答 → 評価の隔たりを埋める</text></g>
</svg>
<p class="tb-caption">図: ボタンを押すと、すぐに色が変わり、音が鳴り、状態ランプが点く (印刷時は押した後の状態として読む)。</p>
<h2>メンタルモデルと 2 つの隔たり</h2>
<p>利用者は頭の中に「こう動くはず」という<b>メンタルモデル</b>を作り、それに基づいて操作します。設計者のモデルと利用者のモデルがずれると、「思った通りに動かない」体験になります。</p>
<ol class="tb-flow">
  <li><b>実行の隔たり</b> — 何をすればよいか分からない (シグニファイア・マッピング・制約で埋める)</li>
  <li><b>評価の隔たり</b> — 結果がどうなったか分からない (フィードバック・状態の可視化で埋める)</li>
</ol>
<h2>応用例: 小型装置のタッチパネル</h2>
<ul>
  <li>画面上部に状態バー (運転/停止/異常の色と文字)、下部に常に「戻る」「ホーム」</li>
  <li>ボタンは押した瞬間に色が変わり、ブザーや振動で応答 (手袋・騒音下を想定)</li>
  <li>数値入力は範囲外を受け付けず、範囲を表示する</li>
  <li>危険な操作 (原点復帰・初期化) は別画面・長押しに</li>
  <li>物理ボタン (非常停止など) と画面の役割を明確に分ける</li>
</ul>
<div class="tb-tip"><b>3DCAD Studio</b>: 操作パネルの筐体に文字 (刻印/エンボス) でラベルを入れ、くぼみや突起でシグニファイアを形にできます。3D プリント試作で、画面とボタンの位置関係を実際に触って確かめましょう。</div>`,
    points: ["UI は接点、UX は体験全体", "ニールセンの 10 原則: 状態の可視化・一貫性・エラー防止・記憶より認識 など", "ノーマン: アフォーダンス・シグニファイア・マッピング・フィードバック・制約", "メンタルモデルとの隔たり (実行・評価) を設計で埋める"],
    exercises: [
      {
        q: "ある装置は異常時に画面に「ERR 0x1F」とだけ表示し、操作者はマニュアルを探して対処しています。どのヒューリスティクスに反しているか挙げ、改善案を示してください。",
        a: "主に <b>#9 エラーの認識・診断・回復の支援</b>、<b>#2 現実世界との一致</b>、<b>#6 記憶より認識</b>、<b>#10 ヘルプ</b> に反します。改善例: 「冷却水の流量が不足しています。バルブ V2 が開いているか確認し、リセットを押してください」と原因と対処を表示し、詳細手順を画面から開けるようにする。コードは保守用に小さく併記する。",
      },
    ],
    quiz: [
      { q: "逆向きに差し込めないコネクタ形状は、ノーマンのどの原則?", choices: ["フィードバック", "制約", "マッピング"], answer: 1, explain: "物理的な制約によって誤った操作をできなくしています。" },
      { q: "「設定値を覚えさせず画面に表示する」はどのヒューリスティクス?", choices: ["記憶より認識", "柔軟性と効率性", "ヘルプとドキュメント"], answer: 0, explain: "人の記憶に頼らず、見て選べるようにする原則です。" },
      { q: "操作したのに何も変化が見えない状態で大きいのは?", choices: ["実行の隔たり", "評価の隔たり", "アフォーダンス"], answer: 1, explain: "結果が分からない状態は評価の隔たりで、フィードバックで埋めます。" },
    ],
    lessons: ["9-1"],
  },
  {
    id: "universal-design",
    part: "ux",
    title: "【中級】ユニバーサルデザインとアクセシビリティ",
    minutes: 20,
    level: 2,
    lead: "利用者は年齢・体格・能力・状況によってさまざまです。できるだけ多くの人が使える製品を目指すユニバーサルデザインの 7 原則と、多様な利用者への配慮、設計チェックリストを学びます。",
    body: `
<h2>ユニバーサルデザインとアクセシビリティ</h2>
<p><b>ユニバーサルデザイン (UD)</b> は、特別な改造なしに、できるだけ多くの人が使えるように最初から設計する考え方です (ロナルド・メイスらが提唱)。
<b>アクセシビリティ</b>は、障害や加齢などがあっても利用できる度合いを指します。後から付け足す「バリアフリー」より、最初から考えるほうが安く、見た目も自然です。</p>
<h2>UD の 7 原則</h2>
<table class="tb-table">
  <tr><th>#</th><th>原則</th><th>例</th></tr>
  <tr><td>1</td><td>誰でも公平に使える</td><td>自動ドア、段差のない入口</td></tr>
  <tr><td>2</td><td>使ううえで自由度が高い</td><td>左右どちらの手でも使えるはさみ・マウス</td></tr>
  <tr><td>3</td><td>使い方が簡単ですぐ分かる</td><td>説明がなくても操作できるボタン配置</td></tr>
  <tr><td>4</td><td>必要な情報がすぐ分かる</td><td>表示を文字・音・光・触覚で重ねて伝える</td></tr>
  <tr><td>5</td><td>うっかりミスや危険につながらない</td><td>誤操作しても安全側に停止する</td></tr>
  <tr><td>6</td><td>身体的な負担が少ない</td><td>小さな力で開くレバー式ハンドル</td></tr>
  <tr><td>7</td><td>接近や利用に十分な大きさと空間</td><td>車いすで近づける操作盤</td></tr>
</table>
<svg class="tb-chart" viewBox="0 0 520 190" role="img" aria-label="ドアノブとレバーハンドル">

<rect class="k-panel" x="8" y="8" width="164" height="174"/><rect class="k-panel" x="178" y="8" width="164" height="174"/><rect class="k-panel" x="348" y="8" width="164" height="174"/>
<g class="k-shadow"><rect class="k-plastic" x="24" y="18" width="110" height="138" rx="2"/></g><line class="k-thin" x1="34" y1="18" x2="34" y2="156"/>
<g class="k-shadow"><circle class="k-part" cx="96" cy="88" r="14"/><circle class="k-sphere" cx="96" cy="88" r="19"/></g>
<path class="k-move" d="M70,66 A34,34 0 0 1 122,66" style="stroke:var(--tb-bad);marker-end:url(#k-arrow-red)"/>
<path class="k-move" d="M122,110 A34,34 0 0 1 70,110" style="stroke:var(--tb-bad);marker-end:url(#k-arrow-red)"/>
<g class="k-shadow"><rect class="k-plastic" x="190" y="18" width="140" height="138" rx="2"/></g><line class="k-thin" x1="200" y1="18" x2="200" y2="156"/>
<g class="k-shadow"><rect class="k-part" x="200" y="64" width="20" height="40" rx="6"/>
<g><animateTransform attributeName="transform" type="rotate" values="0 210 80;25 210 80;0 210 80" keyTimes="0;0.5;1" calcMode="spline" keySplines="0.45 0 0.55 1;0.45 0 0.55 1" dur="3s" repeatCount="indefinite"/><path d="M210,80 L300,80" fill="none" style="stroke:var(--k-line)" stroke-width="13.4"/><path d="M210,80 L300,80" fill="none" style="stroke:var(--k-steel-2)" stroke-width="11"/>
<g transform="translate(284,73)"><g><g transform="scale(0.55)"><rect x="-8" y="-86" width="30" height="24" rx="4" style="fill:var(--k-accent-1);stroke:var(--k-line)" stroke-width="1.2"/><rect class="k-skin" x="-8" y="-64" width="30" height="30" rx="10"/><path d="M14,-52 q7,0 7,5 M14,-44 q7,0 7,5" class="k-thin"/><rect class="k-skin" x="-11" y="-50" width="9" height="18" rx="4.5" transform="rotate(-12 -6 -41)"/><rect class="k-skin" x="-5" y="-40" width="10" height="40" rx="5"/><path d="M-3,-3 q3,-5 6,0" class="k-thin"/></g></g></g></g>
<circle class="k-sphere" cx="210" cy="80" r="7"/></g>
<line class="k-move" x1="316" y1="96" x2="316" y2="128"/>
<g class="k-shadow"><rect class="k-plastic" x="364" y="28" width="132" height="104" rx="12"/></g>
<rect class="k-part" x="378" y="58" width="44" height="40" rx="6"/><rect class="k-part" x="438" y="58" width="44" height="40" rx="6"/>
<circle class="k-sphere" cx="400" cy="70" r="3.5"/>
<line class="k-thin" x1="404" y1="66" x2="420" y2="44"/><text class="tick" x="422" y="44">凸点</text>
<text class="tick" x="400" y="118" text-anchor="middle">電源</text><text class="tick" x="460" y="118" text-anchor="middle">他</text>
<circle class="k-badge" cx="22" cy="170" r="10" style="fill:var(--tb-bad)"/><text class="k-badge-t" x="22" y="174" text-anchor="middle">✕</text><text class="k-bad-t" x="36" y="175">握ってひねる握り玉</text>
<circle class="k-badge" cx="192" cy="170" r="10" style="fill:var(--tb-good)"/><text class="k-badge-t" x="192" y="174" text-anchor="middle">✓</text><text class="k-good-t" x="206" y="175">押し下げるだけのレバー</text>
<circle class="k-badge" cx="362" cy="170" r="10" style="fill:var(--tb-good)"/><text class="k-badge-t" x="362" y="174" text-anchor="middle">✓</text><text class="k-good-t" x="376" y="175">触って分かる凸点</text>
</svg>
<p class="tb-caption">図: 握力が弱い人や手がふさがった人でも開けられるレバーハンドル (原則 6) と、触覚で区別できる凸点 (原則 4)。</p>
<h2>多様な利用者への配慮</h2>
<table class="tb-table">
  <tr><th>利用者</th><th>特徴</th><th>配慮の例</th></tr>
  <tr><td>高齢者</td><td>近くが見えにくい、まぶしさに弱い、高い音が聞こえにくい、握力・指先の感覚の低下</td><td>大きな文字と高コントラスト、低めの周波数の報知音、軽い操作力、大きな操作部</td></tr>
  <tr><td>視覚障害</td><td>全盲・弱視</td><td>触って分かる凸点・形の違い、音声案内、クリック感</td></tr>
  <tr><td>聴覚障害</td><td>音の報知が届かない</td><td>光・表示・振動を併用</td></tr>
  <tr><td>上肢・下肢の障害、車いす</td><td>リーチ範囲・力・姿勢の制限</td><td>低い位置の操作部、片手操作、足元の空間</td></tr>
  <tr><td>左利き (人口の約 1 割程度)</td><td>右手前提の配置・形状が使いにくい</td><td>左右対称の形、両側から操作できる配置</td></tr>
  <tr><td>色覚の多様性</td><td>赤と緑などの区別がつきにくい人がいる (日本人男性で約 5 % 程度と言われる)</td><td>色だけで区別しない、形・文字・位置・点滅を併用</td></tr>
  <tr><td>一時的・状況的な制約</td><td>手袋、片手に荷物、騒音、暗所、ケガ</td><td>手袋で押せる大きさ、片手操作、複数の感覚での報知</td></tr>
</table>
<h2>規格・指針</h2>
<p>日本では <b>JIS S 0010 系</b> を中心に、高齢者・障害者に配慮した設計指針が規格化されています (例: 消費生活製品の報知音、凸記号 (シャンプー容器のきざみ、電源スイッチの凸点など)、視覚表示物の文字の大きさ、操作性などの規格群)。国際的には ISO/IEC Guide 71 が規格作成時の配慮指針になっています。具体的な数値はそれぞれの規格本文で確認してください。</p>
<svg class="tb-chart" viewBox="0 0 520 140" role="img" aria-label="色だけに頼らない表示">

<g class="k-shadow"><circle class="k-part" cx="60" cy="50" r="23"/><circle cx="60" cy="50" r="18" fill="#c62828" stroke="#000" stroke-opacity="0.35"/><ellipse cx="55" cy="43" rx="6" ry="3.5" fill="#fff" opacity="0.35"/><circle class="k-part" cx="110" cy="50" r="23"/><circle cx="110" cy="50" r="18" fill="#2e7d32" stroke="#000" stroke-opacity="0.35"/><ellipse cx="105" cy="43" rx="6" ry="3.5" fill="#fff" opacity="0.35"/><circle class="k-part" cx="230" cy="50" r="23"/><circle cx="230" cy="50" r="18" fill="#8a7a3a" stroke="#000" stroke-opacity="0.35"/><ellipse cx="225" cy="43" rx="6" ry="3.5" fill="#fff" opacity="0.35"/><circle class="k-part" cx="280" cy="50" r="23"/><circle cx="280" cy="50" r="18" fill="#8a7a3a" stroke="#000" stroke-opacity="0.35"/><ellipse cx="275" cy="43" rx="6" ry="3.5" fill="#fff" opacity="0.35"/>
<rect class="k-part" x="374" y="27" width="48" height="46" rx="4"/><rect x="380" y="32" width="36" height="36" rx="2" fill="#c62828"/>
<circle class="k-part" cx="460" cy="50" r="23"/><circle cx="460" cy="50" r="18" fill="#2e7d32"/></g>
<text x="398" y="57" text-anchor="middle" fill="#fff" font-size="16" font-weight="700">✕</text><text x="460" y="56" text-anchor="middle" fill="#fff" font-size="16" font-weight="700">✓</text>
<path d="M170,50 L196,50" class="k-move"/>
<text class="tick" x="85" y="95" text-anchor="middle">× 色だけ (赤/緑)</text>
<text class="tick" x="255" y="95" text-anchor="middle">P 型色覚での見え方の例</text>
<text class="tick" x="429" y="95" text-anchor="middle">○ 形 + 記号 + 色</text><text class="tick" x="398" y="115" text-anchor="middle">異常</text><text class="tick" x="460" y="115" text-anchor="middle">正常</text>
</svg>
<p class="tb-caption">図: 赤と緑の区別がつきにくい見え方の例 (中央は概念図)。形や記号を併用すると色に頼らず伝わる。</p>
<h2>設計チェックリスト</h2>
<ul>
  <li>□ 文字は視距離に対して十分大きく、背景とのコントラストは高いか</li>
  <li>□ 情報を色だけ・音だけで伝えていないか (2 つ以上の感覚で)</li>
  <li>□ 操作部は手袋・握力の弱い人でも操作できる大きさ・力か</li>
  <li>□ 左右どちらの手でも使えるか</li>
  <li>□ 座った人・背の低い人も届き、見える位置か</li>
  <li>□ 目を閉じても主要なボタンが触って分かるか (凸点・形の違い)</li>
  <li>□ 誤操作をしても危険にならず、元に戻せるか</li>
  <li>□ 説明書がなくても基本操作ができるか</li>
  <li>□ 多様な利用者 (高齢者・障害のある人など) に試してもらったか</li>
</ul>
<div class="tb-tip"><b>3DCAD Studio</b>: 凸点や触って分かる形状は文字 (エンボス) や小さな突起で作れます。パラメータで操作部の大きさを変えた案を作り、3D プリント試作で手袋をはめた状態や握力の弱い人にも試してもらいましょう。材料と色で色の組み合わせも検討できます。</div>`,
    points: ["UD は最初から多くの人が使えるように設計する考え方", "7 原則: 公平・自由度・簡単・情報・安全・低負担・空間", "高齢者・障害・左利き・色覚の多様性・状況的制約に配慮", "色だけ・音だけに頼らず、JIS S 0010 系など規格で数値を確認"],
    exercises: [
      {
        q: "家庭用の電気ポットの操作部を UD の観点で見直します。改善点を 4 つ以上挙げてください。",
        a: "例: ① 「給湯」ボタンは誤操作防止のロック解除と 2 段階にし、ロック状態を表示 (原則 5)。② ボタンに凸点を付け触って分かる (原則 4、視覚障害)。③ 状態を色 + 文字 + 報知音で伝える (色覚・聴覚)。④ 文字を大きく高コントラストに (高齢者)。⑤ 押す力を軽く、ボタンを大きく (原則 6)。⑥ 左右どちらからも注げる形 (原則 2、左利き)。",
      },
    ],
    quiz: [
      { q: "UD の 7 原則に含まれるものは?", choices: ["価格が安い", "身体的な負担が少ない", "デザインが新しい"], answer: 1, explain: "7 原則の 6 番目が「身体的負担が少ない」です。" },
      { q: "色覚の多様性への配慮として最も適切なのは?", choices: ["赤と緑をより鮮やかにする", "色に加えて形・文字・位置でも区別する", "色を使わない"], answer: 1, explain: "色だけに依存せず、複数の手がかりを併用します。" },
      { q: "高齢者向けの報知音の配慮として適切なのは?", choices: ["高い周波数の音にする", "比較的低めの周波数で、光や表示も併用する", "音を小さくする"], answer: 1, explain: "加齢により高い音が聞こえにくくなるため、低めの周波数と他の感覚の併用が有効です。" },
    ],
    lessons: ["7-2"],
  },
  {
    id: "workload",
    part: "ux",
    title: "【上級】作業姿勢と負担",
    minutes: 25,
    level: 3,
    lead: "設備や治具の寸法は、作業者の姿勢と身体負担を決めます。作業面の高さ、リーチ範囲、持ち上げ・繰り返し作業、振動・騒音、VDT 作業の考え方と、改善の進め方を学びます。",
    body: `
<h2>作業面の高さ</h2>
<p>作業面の高さは<b>肘の高さ</b>を基準に、作業の種類で変えます。</p>
<table class="tb-table">
  <tr><th>作業 (立位)</th><th>作業面の高さ (目安)</th><th>理由</th></tr>
  <tr><td>精密作業 (細かい組立・検査)</td><td>肘高より 5〜10 cm 程度<b>高く</b></td><td>目に近づけ、腕を支えられる</td></tr>
  <tr><td>軽作業</td><td>肘高より 10〜15 cm 程度<b>低く</b></td><td>肩を上げずに手を動かせる</td></tr>
  <tr><td>重作業 (力を下向きにかける)</td><td>肘高より 15〜40 cm 程度<b>低く</b></td><td>体重を使って力をかけられる</td></tr>
</table>
<p>座位では、座面高を膝窩高 (+靴) に合わせ、肘高に近い作業面と、脚が入る十分なすき間 (太もも + 余裕) を確保します。作業者の体格差が大きい場合は<b>高さ調整</b>か<b>足台</b>を用意します。数値は文献により異なる目安です。</p>
<svg class="tb-chart" viewBox="0 0 520 220" role="img" aria-label="作業面高さと肘高">

<rect class="k-ground" x="30" y="190" width="470" height="8"/><line class="k-edge" x1="30" y1="190" x2="500" y2="190"/>
<line class="guide" x1="40" y1="86" x2="500" y2="86"/><text class="mark-t" x="500" y="78" text-anchor="end">肘の高さ</text>
<g class="k-shadow"><rect class="k-alu" x="136" y="74" width="7" height="116"/><rect class="k-alu" x="217" y="74" width="7" height="116"/><rect class="k-part" x="130" y="66" width="100" height="8" rx="2"/><rect class="k-alu" x="256" y="108" width="7" height="82"/><rect class="k-alu" x="337" y="108" width="7" height="82"/><rect class="k-part" x="250" y="100" width="100" height="8" rx="2"/><rect class="k-alu" x="386" y="136" width="7" height="54"/><rect class="k-alu" x="467" y="136" width="7" height="54"/><rect class="k-part" x="380" y="128" width="100" height="8" rx="2"/>
<rect class="k-accent" x="166" y="60" width="28" height="6" rx="1"/><rect class="k-plastic" x="282" y="80" width="36" height="20" rx="2"/><rect class="k-part" x="406" y="98" width="48" height="30" rx="3"/></g>
<text class="mark-t" x="180" y="50" text-anchor="middle">精密作業</text>
<text class="mark-t" x="300" y="128" text-anchor="middle">軽作業</text>
<text class="mark-t" x="430" y="156" text-anchor="middle">重作業</text>
<line class="k-ext" x1="232" y1="66" x2="242" y2="66"/><line class="k-dimline" x1="238" y1="86" x2="238" y2="68" style="marker-start:none"/>
<line class="k-dimline" x1="358" y1="86" x2="358" y2="98" style="marker-start:none"/><line class="k-ext" x1="352" y1="100" x2="364" y2="100"/>
<line class="k-dimline" x1="488" y1="86" x2="488" y2="126" style="marker-start:none"/><line class="k-ext" x1="482" y1="128" x2="494" y2="128"/>
<g class="k-shadow"><path d="M64.0,112.0 L61.0,150.0 L58.0,186.0" fill="none" style="stroke:var(--k-line)" stroke-width="12.9"/><path d="M64.0,112.0 L61.0,150.0 L58.0,186.0" fill="none" style="stroke:var(--k-line-2)" stroke-width="10.5"/><path d="M54.0,183.0 L67.0,185.0 Q72.0,186.0 72.0,189.5 L53.0,189.5 Z" fill="#2b3340" style="stroke:var(--k-line)" stroke-width="1"/><path d="M66.0,57.0 L63.0,86.0" fill="none" style="stroke:var(--k-line)" stroke-width="9.9"/><path d="M63.0,86.0 L70.0,108.0" fill="none" style="stroke:var(--k-line)" stroke-width="8.4"/><path d="M66.0,57.0 L63.0,86.0" fill="none" style="stroke:var(--k-accent-2)" stroke-width="7.5"/><path d="M63.0,86.0 L70.0,108.0" fill="none" style="stroke:var(--k-skin-2)" stroke-width="6.0"/><circle class="k-skin" cx="70" cy="108" r="4.0"/><path d="M66.0,45.0 L66.0,57.0" fill="none" style="stroke:var(--k-line)" stroke-width="8.4"/><path d="M66.0,45.0 L66.0,57.0" fill="none" style="stroke:var(--k-skin-1)" stroke-width="6.0"/><path d="M66.0,57.0 L64.0,112.0" fill="none" style="stroke:var(--k-line)" stroke-width="21.4"/><path d="M66.0,57.0 L64.0,112.0" fill="none" style="stroke:var(--k-accent-1)" stroke-width="19.0"/><path d="M64.0,112.0 L66.0,150.0 L66.0,186.0" fill="none" style="stroke:var(--k-line)" stroke-width="13.4"/><path d="M64.0,112.0 L66.0,150.0 L66.0,186.0" fill="none" style="stroke:var(--k-steel-3)" stroke-width="11.0"/><path d="M62.0,183.0 L75.0,185.0 Q80.0,186.0 80.0,189.5 L61.0,189.5 Z" fill="#2b3340" style="stroke:var(--k-line)" stroke-width="1"/><circle class="k-skin" cx="68" cy="36" r="11.0"/><path d="M78.2,36.5 l2.6,3.2 l-2.8,0.6" class="k-skin" stroke-width="1"/><path d="M77.0,29.9 A11.0,11.0 0 1 0 60.1,43.5 Q66.3,37.1 77.0,29.9 Z" fill="#4a3728" style="stroke:var(--k-line)" stroke-width="1"/><circle cx="74.0" cy="35.8" r="1.4" style="fill:var(--k-line)"/><path d="M66.0,57.0 L68.0,86.0" fill="none" style="stroke:var(--k-line)" stroke-width="10.4"/><path d="M68.0,86.0 L96.0,88.0" fill="none" style="stroke:var(--k-line)" stroke-width="8.9"/><path d="M66.0,57.0 L68.0,86.0" fill="none" style="stroke:var(--k-accent-1)" stroke-width="8.0"/><path d="M68.0,86.0 L96.0,88.0" fill="none" style="stroke:var(--k-skin-1)" stroke-width="6.5"/><circle class="k-skin" cx="96" cy="88" r="4.3"/></g>
<text class="lbl" x="500" y="212" text-anchor="end">作業の種類</text>
</svg>
<svg class="tb-chart" viewBox="0 0 520 240" role="img" aria-label="立位と座位の作業高さ">

<rect class="k-ground" x="20" y="214" width="480" height="8"/><line class="k-edge" x1="20" y1="214" x2="500" y2="214"/>
<line class="guide" x1="56" y1="100" x2="250" y2="100"/><text class="tick" x="252" y="104">肘高</text>
<g class="k-shadow"><rect class="k-alu" x="124" y="116" width="7" height="98"/><rect class="k-alu" x="225" y="116" width="7" height="98"/><rect class="k-part" x="118" y="108" width="120" height="8" rx="2"/></g>
<line class="k-dimline" x1="228" y1="100" x2="228" y2="108" style="marker-start:none"/>
<g class="k-shadow"><path d="M78.0,122.0 L74.0,170.0 L72.0,210.0" fill="none" style="stroke:var(--k-line)" stroke-width="12.9"/><path d="M78.0,122.0 L74.0,170.0 L72.0,210.0" fill="none" style="stroke:var(--k-line-2)" stroke-width="10.5"/><path d="M68.0,207.0 L81.0,209.0 Q86.0,210.0 86.0,213.5 L67.0,213.5 Z" fill="#2b3340" style="stroke:var(--k-line)" stroke-width="1"/><path d="M80.0,62.0 L78.0,100.0" fill="none" style="stroke:var(--k-line)" stroke-width="9.9"/><path d="M78.0,100.0 L108.0,112.0" fill="none" style="stroke:var(--k-line)" stroke-width="8.4"/><path d="M80.0,62.0 L78.0,100.0" fill="none" style="stroke:var(--k-accent-2)" stroke-width="7.5"/><path d="M78.0,100.0 L108.0,112.0" fill="none" style="stroke:var(--k-skin-2)" stroke-width="6.0"/><circle class="k-skin" cx="108" cy="112" r="4.0"/><path d="M80.0,51.0 L80.0,62.0" fill="none" style="stroke:var(--k-line)" stroke-width="8.4"/><path d="M80.0,51.0 L80.0,62.0" fill="none" style="stroke:var(--k-skin-1)" stroke-width="6.0"/><path d="M80.0,62.0 L78.0,122.0" fill="none" style="stroke:var(--k-line)" stroke-width="21.4"/><path d="M80.0,62.0 L78.0,122.0" fill="none" style="stroke:var(--k-accent-1)" stroke-width="19.0"/><path d="M78.0,122.0 L80.0,170.0 L80.0,210.0" fill="none" style="stroke:var(--k-line)" stroke-width="13.4"/><path d="M78.0,122.0 L80.0,170.0 L80.0,210.0" fill="none" style="stroke:var(--k-steel-3)" stroke-width="11.0"/><path d="M76.0,207.0 L89.0,209.0 Q94.0,210.0 94.0,213.5 L75.0,213.5 Z" fill="#2b3340" style="stroke:var(--k-line)" stroke-width="1"/><circle class="k-skin" cx="82" cy="42" r="11.0"/><path d="M92.2,42.5 l2.6,3.2 l-2.8,0.6" class="k-skin" stroke-width="1"/><path d="M91.0,36.0 A11.0,11.0 0 1 0 74.1,49.5 Q80.3,43.1 91.0,36.0 Z" fill="#4a3728" style="stroke:var(--k-line)" stroke-width="1"/><circle cx="88.0" cy="41.8" r="1.4" style="fill:var(--k-line)"/><path d="M80.0,62.0 L84.0,100.0" fill="none" style="stroke:var(--k-line)" stroke-width="10.4"/><path d="M84.0,100.0 L120.0,106.0" fill="none" style="stroke:var(--k-line)" stroke-width="8.9"/><path d="M80.0,62.0 L84.0,100.0" fill="none" style="stroke:var(--k-accent-1)" stroke-width="8.0"/><path d="M84.0,100.0 L120.0,106.0" fill="none" style="stroke:var(--k-skin-1)" stroke-width="6.5"/><circle class="k-skin" cx="120" cy="106" r="4.3"/></g>
<text class="tick" x="150" y="234" text-anchor="middle">立位: 軽作業は肘高 −10〜15 cm</text>
<g class="k-shadow"><rect class="k-alu" x="474" y="140" width="8" height="74"/><rect class="k-part" x="372" y="132" width="118" height="8" rx="2"/>
<rect class="k-alu" x="333" y="162" width="6" height="40"/><rect class="k-part" x="312" y="202" width="50" height="6" rx="3"/>
<rect class="k-plastic" x="308" y="104" width="8" height="52" rx="3"/><rect class="k-plastic" x="314" y="152" width="50" height="10" rx="4"/></g>
<g class="k-shadow"><path d="M336.0,152.0 L380.0,148.0 L380.0,206.0" fill="none" style="stroke:var(--k-line)" stroke-width="12.9"/><path d="M336.0,152.0 L380.0,148.0 L380.0,206.0" fill="none" style="stroke:var(--k-line-2)" stroke-width="10.5"/><path d="M376.0,203.0 L389.0,205.0 Q394.0,206.0 394.0,209.5 L375.0,209.5 Z" fill="#2b3340" style="stroke:var(--k-line)" stroke-width="1"/><path d="M342.0,96.0 L344.0,126.0" fill="none" style="stroke:var(--k-line)" stroke-width="9.9"/><path d="M344.0,126.0 L376.0,130.0" fill="none" style="stroke:var(--k-line)" stroke-width="8.4"/><path d="M342.0,96.0 L344.0,126.0" fill="none" style="stroke:var(--k-accent-2)" stroke-width="7.5"/><path d="M344.0,126.0 L376.0,130.0" fill="none" style="stroke:var(--k-skin-2)" stroke-width="6.0"/><circle class="k-skin" cx="376" cy="130" r="4.0"/><path d="M342.0,85.0 L342.0,96.0" fill="none" style="stroke:var(--k-line)" stroke-width="8.4"/><path d="M342.0,85.0 L342.0,96.0" fill="none" style="stroke:var(--k-skin-1)" stroke-width="6.0"/><path d="M342.0,96.0 L336.0,152.0" fill="none" style="stroke:var(--k-line)" stroke-width="21.4"/><path d="M342.0,96.0 L336.0,152.0" fill="none" style="stroke:var(--k-accent-1)" stroke-width="19.0"/><path d="M336.0,152.0 L386.0,150.0 L388.0,206.0" fill="none" style="stroke:var(--k-line)" stroke-width="13.4"/><path d="M336.0,152.0 L386.0,150.0 L388.0,206.0" fill="none" style="stroke:var(--k-steel-3)" stroke-width="11.0"/><path d="M384.0,203.0 L397.0,205.0 Q402.0,206.0 402.0,209.5 L383.0,209.5 Z" fill="#2b3340" style="stroke:var(--k-line)" stroke-width="1"/><circle class="k-skin" cx="344" cy="76" r="11.0"/><path d="M354.2,76.5 l2.6,3.2 l-2.8,0.6" class="k-skin" stroke-width="1"/><path d="M353.0,70.0 A11.0,11.0 0 1 0 336.1,83.5 Q342.4,77.1 353.0,70.0 Z" fill="#4a3728" style="stroke:var(--k-line)" stroke-width="1"/><circle cx="350.1" cy="75.8" r="1.4" style="fill:var(--k-line)"/><path d="M342.0,96.0 L348.0,126.0" fill="none" style="stroke:var(--k-line)" stroke-width="10.4"/><path d="M348.0,126.0 L382.0,128.0" fill="none" style="stroke:var(--k-line)" stroke-width="8.9"/><path d="M342.0,96.0 L348.0,126.0" fill="none" style="stroke:var(--k-accent-1)" stroke-width="8.0"/><path d="M348.0,126.0 L382.0,128.0" fill="none" style="stroke:var(--k-skin-1)" stroke-width="6.5"/><circle class="k-skin" cx="382" cy="128" r="4.3"/></g>
<line class="guide" x1="430" y1="144" x2="430" y2="206"/><text class="tick" x="436" y="182">脚のすき間</text>
<text class="tick" x="400" y="234" text-anchor="middle">座位: 座面 ≈ 膝窩高、作業面 ≈ 肘高</text>
</svg>
<p class="tb-caption">図: 立位と座位の作業面高さの考え方 (寸法は目安)。座位では脚の入るすき間も必要。</p>
<h2>リーチ範囲</h2>
<ul>
  <li><b>通常作業域</b>: 上腕を体の横に付けたまま前腕を動かして届く範囲。頻繁に使う部品・工具はここに</li>
  <li><b>最大作業域</b>: 腕を伸ばして届く範囲。時々使うものまで</li>
  <li>それを超える位置は、前かがみ・ひねり・背伸びを生み、腰や肩の負担になる</li>
  <li>リーチは小さい人 (5 パーセンタイル) に合わせ、作業者の正面に作業点を置く</li>
</ul>
<svg class="tb-chart" viewBox="0 0 520 232" role="img" aria-label="通常作業域と最大作業域 (上から見た図)">

<rect x="14" y="10" width="492" height="180" rx="4" style="fill:var(--tb-surface);stroke:var(--tb-border)"/>
<line class="k-edge" x1="14" y1="190" x2="506" y2="190"/>
<path d="M90,190 A170,170 0 0 1 430,190" style="fill:var(--tb-accent);stroke:var(--tb-accent)" fill-opacity="0.1" stroke-dasharray="5 3" stroke-width="1.4"/>
<path d="M150,190 A110,110 0 0 1 370,190" style="fill:var(--tb-accent);stroke:var(--tb-accent)" fill-opacity="0.25" stroke-width="2"/>
<g class="k-shadow"><rect class="k-plastic" x="196" y="104" width="30" height="20" rx="3"/><rect class="k-plastic" x="294" y="104" width="30" height="20" rx="3"/>
<path d="M330,160 L352,150" fill="none" style="stroke:var(--tb-bad)" stroke-width="5"/><path d="M352,150 L372,141" fill="none" style="stroke:var(--k-line-2)" stroke-width="2"/>
<rect class="k-part" x="120" y="58" width="44" height="26" rx="3"/><rect class="k-part" x="356" y="58" width="44" height="26" rx="3"/></g>
<text class="mark-t" x="260" y="140" text-anchor="middle">通常作業域</text><text class="tick" x="260" y="156" text-anchor="middle">頻繁に使う部品・工具</text>
<text class="mark-t" x="260" y="45" text-anchor="middle">最大作業域</text><text class="tick" x="260" y="61" text-anchor="middle">時々使うもの</text>
<text class="tick" x="500" y="30" text-anchor="end">外側 = 前かがみ・ひねり</text>
<g class="k-shadow">
<path d="M222.0,206.0 L226.0,182.0 L242.0,172.0" fill="none" style="stroke:var(--k-line)" stroke-width="10.4"/><path d="M298.0,206.0 L294.0,182.0 L278.0,172.0" fill="none" style="stroke:var(--k-line)" stroke-width="10.4"/><path d="M222.0,206.0 L226.0,182.0 L242.0,172.0" fill="none" style="stroke:var(--k-accent-1)" stroke-width="8.0"/><path d="M298.0,206.0 L294.0,182.0 L278.0,172.0" fill="none" style="stroke:var(--k-accent-1)" stroke-width="8.0"/>
<path d="M232.0,182.0 L242.0,172.0" fill="none" style="stroke:var(--k-line)" stroke-width="8.9"/><path d="M288.0,182.0 L278.0,172.0" fill="none" style="stroke:var(--k-line)" stroke-width="8.9"/><path d="M232.0,182.0 L242.0,172.0" fill="none" style="stroke:var(--k-skin-1)" stroke-width="6.5"/><path d="M288.0,182.0 L278.0,172.0" fill="none" style="stroke:var(--k-skin-1)" stroke-width="6.5"/>
<circle class="k-skin" cx="244" cy="170" r="4.5"/><circle class="k-skin" cx="276" cy="170" r="4.5"/>
<rect x="210" y="198" width="100" height="26" rx="13" style="fill:var(--k-accent-1);stroke:var(--k-line)" stroke-width="1.4"/>
<circle class="k-skin" cx="260" cy="208" r="13"/><path d="M247,210 A13,13 0 0 0 273,210 A14,10 0 0 0 247,210 Z" fill="#4a3728"/>
<path d="M257,195 L260,190 L263,195" class="k-skin" stroke-width="1"/></g>
</svg>
<p class="tb-caption">図: 作業台を上から見た通常作業域と最大作業域 (半径は体格で変わる)。</p>
<h2>持ち上げ作業</h2>
<p>腰への負担は、重さだけでなく<b>体から荷物までの水平距離</b>、持ち上げる高さ、ひねり、頻度で大きく変わります。荷物を体に近づけると、腰にかかるモーメントは小さくなります。</p>
<ul>
  <li>重量の目安は法令・指針で示されています。日本では厚生労働省「職場における腰痛予防対策指針」で、人力で取り扱う重量について、満 18 歳以上の男性で体重のおおむね 40 % 以下、女性はさらにその 60 % 程度が目安とされています。<b>最新の法令・指針の本文を確認</b>してください</li>
  <li>海外では NIOSH の持ち上げ式 (推奨重量限界 RWL を各条件の係数で算出) なども使われる</li>
  <li>設計での対策: 持ち上げ高さを腰〜胸の範囲に、取っ手を付ける、重いものは台車・リフタ・バランサで</li>
</ul>
<svg class="tb-chart" viewBox="0 0 520 214" role="img" aria-label="荷物までの距離と腰のモーメント">

<rect class="k-panel" x="8" y="8" width="244" height="198"/><rect class="k-panel" x="268" y="8" width="244" height="198"/>
<rect class="k-ground" x="18" y="176" width="224" height="8"/><line class="k-edge" x1="18" y1="176" x2="242" y2="176"/><rect class="k-ground" x="278" y="176" width="224" height="8"/><line class="k-edge" x1="278" y1="176" x2="502" y2="176"/>
<g class="k-shadow"><path d="M80.0,108.0 L77.0,142.0 L74.0,172.0" fill="none" style="stroke:var(--k-line)" stroke-width="12.9"/><path d="M80.0,108.0 L77.0,142.0 L74.0,172.0" fill="none" style="stroke:var(--k-line-2)" stroke-width="10.5"/><path d="M70.0,169.0 L83.0,171.0 Q88.0,172.0 88.0,175.5 L69.0,175.5 Z" fill="#2b3340" style="stroke:var(--k-line)" stroke-width="1"/><path d="M82.0,54.0 L84.0,80.0" fill="none" style="stroke:var(--k-line)" stroke-width="9.9"/><path d="M84.0,80.0 L96.0,90.0" fill="none" style="stroke:var(--k-line)" stroke-width="8.4"/><path d="M82.0,54.0 L84.0,80.0" fill="none" style="stroke:var(--k-accent-2)" stroke-width="7.5"/><path d="M84.0,80.0 L96.0,90.0" fill="none" style="stroke:var(--k-skin-2)" stroke-width="6.0"/><circle class="k-skin" cx="96" cy="90" r="4.0"/><path d="M82.0,43.0 L82.0,54.0" fill="none" style="stroke:var(--k-line)" stroke-width="8.4"/><path d="M82.0,43.0 L82.0,54.0" fill="none" style="stroke:var(--k-skin-1)" stroke-width="6.0"/><path d="M82.0,54.0 L80.0,108.0" fill="none" style="stroke:var(--k-line)" stroke-width="21.4"/><path d="M82.0,54.0 L80.0,108.0" fill="none" style="stroke:var(--k-accent-1)" stroke-width="19.0"/><path d="M80.0,108.0 L82.0,142.0 L82.0,172.0" fill="none" style="stroke:var(--k-line)" stroke-width="13.4"/><path d="M80.0,108.0 L82.0,142.0 L82.0,172.0" fill="none" style="stroke:var(--k-steel-3)" stroke-width="11.0"/><path d="M78.0,169.0 L91.0,171.0 Q96.0,172.0 96.0,175.5 L77.0,175.5 Z" fill="#2b3340" style="stroke:var(--k-line)" stroke-width="1"/><circle class="k-skin" cx="84" cy="34" r="11.0"/><path d="M94.2,34.5 l2.6,3.2 l-2.8,0.6" class="k-skin" stroke-width="1"/><path d="M93.0,27.9 A11.0,11.0 0 1 0 76.1,41.5 Q82.3,35.1 93.0,27.9 Z" fill="#4a3728" style="stroke:var(--k-line)" stroke-width="1"/><circle cx="90.0" cy="33.8" r="1.4" style="fill:var(--k-line)"/><rect class="k-plastic" x="96" y="70" width="32" height="32" rx="2"/><path d="M82.0,54.0 L88.0,80.0" fill="none" style="stroke:var(--k-line)" stroke-width="10.4"/><path d="M88.0,80.0 L104.0,92.0" fill="none" style="stroke:var(--k-line)" stroke-width="8.9"/><path d="M82.0,54.0 L88.0,80.0" fill="none" style="stroke:var(--k-accent-1)" stroke-width="8.0"/><path d="M88.0,80.0 L104.0,92.0" fill="none" style="stroke:var(--k-skin-1)" stroke-width="6.5"/><circle class="k-skin" cx="104" cy="92" r="4.3"/></g>
<line class="k-force" x1="112" y1="104" x2="112" y2="136"/>
<line class="k-center" x1="80" y1="100" x2="80" y2="166"/>
<line class="k-ext" x1="112" y1="140" x2="112" y2="166"/><line class="k-dimline" x1="80" y1="160" x2="112" y2="160"/>
<text class="k-dimtext" x="118" y="164">d 小</text>
<circle cx="80" cy="108" r="3.5" style="fill:var(--tb-bad);stroke:var(--k-line)"/><text class="tick" x="62" y="112" text-anchor="end">腰</text>
<circle class="k-badge" cx="26" cy="192" r="10" style="fill:var(--tb-good)"/><text class="k-badge-t" x="26" y="196" text-anchor="middle">✓</text><text class="k-good-t" x="40" y="197">体に近づける</text>
<g class="k-shadow"><path d="M300.0,110.0 L300.0,142.0 L294.0,172.0" fill="none" style="stroke:var(--k-line)" stroke-width="12.9"/><path d="M300.0,110.0 L300.0,142.0 L294.0,172.0" fill="none" style="stroke:var(--k-line-2)" stroke-width="10.5"/><path d="M290.0,169.0 L303.0,171.0 Q308.0,172.0 308.0,175.5 L289.0,175.5 Z" fill="#2b3340" style="stroke:var(--k-line)" stroke-width="1"/><path d="M342.0,76.0 L362.0,90.0" fill="none" style="stroke:var(--k-line)" stroke-width="9.9"/><path d="M362.0,90.0 L388.0,96.0" fill="none" style="stroke:var(--k-line)" stroke-width="8.4"/><path d="M342.0,76.0 L362.0,90.0" fill="none" style="stroke:var(--k-accent-2)" stroke-width="7.5"/><path d="M362.0,90.0 L388.0,96.0" fill="none" style="stroke:var(--k-skin-2)" stroke-width="6.0"/><circle class="k-skin" cx="388" cy="96" r="4.0"/><path d="M356.0,73.0 L342.0,76.0" fill="none" style="stroke:var(--k-line)" stroke-width="8.4"/><path d="M356.0,73.0 L342.0,76.0" fill="none" style="stroke:var(--k-skin-1)" stroke-width="6.0"/><path d="M342.0,76.0 L300.0,110.0" fill="none" style="stroke:var(--k-line)" stroke-width="21.4"/><path d="M342.0,76.0 L300.0,110.0" fill="none" style="stroke:var(--k-accent-1)" stroke-width="19.0"/><path d="M300.0,110.0 L308.0,142.0 L302.0,172.0" fill="none" style="stroke:var(--k-line)" stroke-width="13.4"/><path d="M300.0,110.0 L308.0,142.0 L302.0,172.0" fill="none" style="stroke:var(--k-steel-3)" stroke-width="11.0"/><path d="M298.0,169.0 L311.0,171.0 Q316.0,172.0 316.0,175.5 L297.0,175.5 Z" fill="#2b3340" style="stroke:var(--k-line)" stroke-width="1"/><circle class="k-skin" cx="358" cy="64" r="11.0"/><path d="M368.2,64.5 l2.6,3.2 l-2.8,0.6" class="k-skin" stroke-width="1"/><path d="M367.0,58.0 A11.0,11.0 0 1 0 350.1,71.5 Q356.4,65.1 367.0,58.0 Z" fill="#4a3728" style="stroke:var(--k-line)" stroke-width="1"/><circle cx="364.1" cy="63.8" r="1.4" style="fill:var(--k-line)"/><rect class="k-plastic" x="392" y="84" width="32" height="32" rx="2"/><path d="M342.0,76.0 L366.0,92.0" fill="none" style="stroke:var(--k-line)" stroke-width="10.4"/><path d="M366.0,92.0 L396.0,100.0" fill="none" style="stroke:var(--k-line)" stroke-width="8.9"/><path d="M342.0,76.0 L366.0,92.0" fill="none" style="stroke:var(--k-accent-1)" stroke-width="8.0"/><path d="M366.0,92.0 L396.0,100.0" fill="none" style="stroke:var(--k-skin-1)" stroke-width="6.5"/><circle class="k-skin" cx="396" cy="100" r="4.3"/></g>
<line class="k-force" x1="408" y1="118" x2="408" y2="146"/>
<line class="k-center" x1="300" y1="104" x2="300" y2="166"/>
<line class="k-ext" x1="408" y1="150" x2="408" y2="166"/><line class="k-dimline" x1="300" y1="160" x2="408" y2="160"/>
<text class="k-dimtext" x="354" y="154" text-anchor="middle">d 大</text>
<circle cx="300" cy="110" r="3.5" style="fill:var(--tb-bad);stroke:var(--k-line)"/><text class="tick" x="284" y="104" text-anchor="end">腰</text>
<circle class="k-badge" cx="286" cy="192" r="10" style="fill:var(--tb-bad)"/><text class="k-badge-t" x="286" y="196" text-anchor="middle">✕</text><text class="k-bad-t" x="300" y="197">遠くで持つ</text>
<text class="lbl" x="504" y="30" text-anchor="end">腰のモーメント ≈ 重さ × d</text>
</svg>
<p class="tb-caption">図: 同じ重さでも腰 (●) から荷物までの水平距離 d が大きいほど腰の負担が増える。</p>
<h2>繰り返し作業・振動・騒音</h2>
<table class="tb-table">
  <tr><th>負担</th><th>起こりうる障害</th><th>設計での対策</th></tr>
  <tr><td>繰り返し・不自然な手首の角度</td><td>腱鞘炎・手根管症候群など</td><td>手首をまっすぐ保てる握りの角度、工具の重量支持、作業のローテーション</td></tr>
  <tr><td>静的な姿勢の保持</td><td>首・肩・腰の筋疲労</td><td>見る位置を下げすぎない、肘・腕を支える台</td></tr>
  <tr><td>手腕振動 (工具)</td><td>振動障害 (白指など)</td><td>低振動工具、防振ハンドル、使用時間の管理 (振動ばく露の指針)</td></tr>
  <tr><td>騒音</td><td>聴力低下、会話・報知音の妨げ</td><td>音源対策 (カバー・防振)、囲い、作業位置の分離。管理基準は法令・ガイドラインで確認</td></tr>
</table>
<h2>VDT (情報機器) 作業</h2>
<p>厚生労働省の「情報機器作業における労働衛生管理のためのガイドライン」では、ディスプレイとの視距離をおおむね 40 cm 以上とすること、画面の上端を眼の高さとほぼ同じか下にすること、一連続作業時間が 1 時間を超えないようにし途中で小休止をとることなどが示されています。詳細は最新の本文を確認してください。</p>
<ul>
  <li>足裏全体が床に付く座面高、背もたれで腰を支える</li>
  <li>キーボード・マウスは肘の高さ付近、手首を反らさない</li>
  <li>画面への映り込み (窓・照明) を避ける配置</li>
</ul>
<h2>改善の例</h2>
<ol class="tb-flow">
  <li><b>現状把握</b> — 作業を観察・撮影し、前かがみ・ひねり・腕上げの頻度と時間を記録</li>
  <li><b>評価</b> — チェックリストや姿勢評価手法 (RULA・OWAS など) でリスクの大きい作業を選ぶ</li>
  <li><b>対策</b> — 作業台の高さ変更、部品供給を手前・斜めに (傾斜棚)、反転治具で作業点を正面へ、補助具の導入</li>
  <li><b>効果確認</b> — 姿勢・作業時間・作業者の感想を再評価</li>
</ol>
<div class="tb-tip"><b>3DCAD Studio</b>: 作業台・棚・治具と、5/95 パーセンタイルの人の簡易モデルをアセンブリに置き、拘束を駆動して腕を動かすとリーチを確認できます。測定で手から荷物までの水平距離を測り、パラメータで作業台の高さ違いの案を作って比べましょう。</div>`,
    points: ["作業面は肘高基準: 精密は高く、軽作業・重作業は低く (目安)", "頻繁に使うものは通常作業域に、リーチは小さい人基準", "持ち上げ重量は法令・指針で確認。荷物を体に近づける設計を", "繰り返し・振動・騒音・VDT 作業も負担 — 観察 → 評価 → 対策 → 確認"],
    exercises: [
      {
        q: "肘頭高 1 000 mm の作業者が、ねじ締めの軽作業と、精密な目視検査を同じ作業台で行っています。台の高さ 900 mm は適切ですか? 改善案は?",
        a: "軽作業の目安は肘高 −10〜15 cm = <b>850〜900 mm</b> で適合範囲です。精密検査の目安は肘高 +5〜10 cm = <b>1 050〜1 100 mm</b> で、900 mm では前かがみになります。改善例: 検査用に高さ約 150〜200 mm の台 (または傾斜台) を作業台に置く、昇降式作業台にする。体格の違う作業者が交代するなら昇降式が望ましい。",
      },
    ],
    quiz: [
      { q: "立位の精密作業に適した作業面の高さは?", choices: ["肘高よりやや高い", "肘高よりかなり低い", "腰の高さ"], answer: 0, explain: "精密作業は目に近づけ腕を支えるため、肘高より少し高くします。" },
      { q: "持ち上げ作業で腰の負担を減らす最も効果的な方法の一つは?", choices: ["速く持ち上げる", "荷物を体に近づけて持つ", "腰を曲げて持つ"], answer: 1, explain: "水平距離が短いほど腰にかかるモーメントが小さくなります。" },
      { q: "頻繁に使う工具を置くべき位置は?", choices: ["最大作業域の端", "通常作業域", "背後の棚"], answer: 1, explain: "前腕だけで届く通常作業域に置くと、無理な姿勢が減ります。" },
    ],
    lessons: ["7-2"],
  },
  {
    id: "ux-research",
    part: "ux",
    title: "【上級】UX リサーチと評価手法",
    minutes: 25,
    level: 3,
    lead: "思い込みではなく証拠で設計を判断するために、利用者を理解する調査と、使いやすさを測る評価の手法を学びます。SUS のスコア計算や A/B テストの考え方も扱います。",
    body: `
<h2>調査の種類: 定性と定量</h2>
<table class="tb-table">
  <tr><th></th><th>定性調査</th><th>定量調査</th></tr>
  <tr><td>問い</td><td>なぜ? どのように?</td><td>どれくらい? どちらが?</td></tr>
  <tr><td>手法</td><td>インタビュー、観察、思考発話</td><td>アンケート、成功率・時間の計測、A/B テスト、ログ分析</td></tr>
  <tr><td>人数</td><td>少人数 (5〜10 人程度)</td><td>統計的に判断できる人数</td></tr>
  <tr><td>得られるもの</td><td>問題の発見と理由、仮説</td><td>問題の大きさ、改善の効果の比較</td></tr>
</table>
<p>定性で問題と仮説を見つけ、定量で大きさと効果を確かめる、と<b>組み合わせる</b>のが基本です。</p>
<h2>利用者を理解する</h2>
<ul>
  <li><b>インタビュー</b>: 意見より<b>具体的な過去の出来事</b>を聞く (「最後にこの機械で困ったのはいつ、どんな時?」)。誘導質問を避け、「なぜ」を掘り下げる</li>
  <li><b>観察 (文脈的調査)</b>: 実際の現場で作業を見せてもらう。メモ・自作の治具・テープでの補修など「回避策」は重要な手がかり</li>
  <li><b>ペルソナ</b>: 調査に基づく代表的な利用者像 (目標・状況・スキル・不満)。想像だけで作ると単なる思い込みになる</li>
  <li><b>カスタマージャーニーマップ</b>: 認知 → 購入 → 設置 → 使用 → 保守 → 廃棄の各段階で、行動・接点・感情・課題を時系列に並べ、体験の落ち込む所 (ペインポイント) を見つける</li>
</ul>
<svg class="tb-chart" role="img" viewBox="0 0 520 210" aria-label="カスタマージャーニーマップ">
  <line class="grid" x1="40" y1="110" x2="500" y2="110"/>
  <text class="tick" x="36" y="60" text-anchor="end">満足</text><text class="tick" x="36" y="170" text-anchor="end">不満</text>
  <text class="tick" x="70" y="22" text-anchor="middle">認知</text><text class="tick" x="145" y="22" text-anchor="middle">購入</text><text class="tick" x="220" y="22" text-anchor="middle">設置</text><text class="tick" x="295" y="22" text-anchor="middle">使用</text><text class="tick" x="370" y="22" text-anchor="middle">保守</text><text class="tick" x="450" y="22" text-anchor="middle">廃棄</text>
  <polyline style="stroke:var(--tb-accent)" points="70,70 145,60 220,160 295,80 370,150 450,100" fill="none" stroke-width="2.5"/>
  <circle class="mark" cx="220" cy="160" r="6"/><circle class="mark" cx="370" cy="150" r="6"/>
  <text class="tick" x="220" y="185" text-anchor="middle">設置手順が難しい</text><text class="tick" x="370" y="175" text-anchor="middle">消耗品の交換が面倒</text>
</svg>
<p class="tb-caption">図: カスタマージャーニーマップの感情曲線の例。落ち込む点 (●) がペインポイントで、改善の優先候補になる。</p>
<h2>ユーザビリティテスト</h2>
<ol class="tb-flow">
  <li><b>目的とタスク</b> — 現実的な作業を課題にする (「切削速度を 1 200 rpm に設定して運転を始めてください」)。操作手順そのものは教えない</li>
  <li><b>参加者</b> — 想定利用者に近い人。問題発見が目的なら 1 ラウンド 5 人程度を繰り返すのが効率的とされる</li>
  <li><b>思考発話法</b> — 考えていることを声に出しながら操作してもらう。司会は助けず、中立に促すだけ</li>
  <li><b>測定</b> — タスク成功率、完了時間、エラー数、主観評価 (SUS など)</li>
  <li><b>分析と改善</b> — 問題を重大度で分類し、修正して再テスト</li>
</ol>
<table class="tb-table">
  <tr><th>指標 (ISO 9241-11 の観点)</th><th>測り方の例</th></tr>
  <tr><td>有効さ</td><td>タスク成功率、エラー数</td></tr>
  <tr><td>効率</td><td>完了時間、操作ステップ数</td></tr>
  <tr><td>満足度</td><td>SUS などの質問紙、インタビュー</td></tr>
</table>
<h2>SUS (System Usability Scale)</h2>
<p>SUS はジョン・ブルックが考案した 10 項目の質問紙です。各項目に 1 (全くそう思わない) 〜 5 (強くそう思う) で答えます。奇数番の項目は肯定文 (例: 「このシステムを頻繁に使いたい」)、偶数番は否定文 (例: 「このシステムは不必要に複雑だ」) です。</p>
<div class="tb-formula">奇数項目: (回答 − 1)　偶数項目: (5 − 回答)　→ 10 項目の合計 (0〜40) × 2.5 = SUS スコア (0〜100)</div>
<pre class="tb-pre">回答:   Q1=4 Q2=2 Q3=5 Q4=1 Q5=4 Q6=2 Q7=5 Q8=2 Q9=4 Q10=1
奇数:   3 + 4 + 3 + 4 + 3 = 17
偶数:   3 + 4 + 3 + 3 + 4 = 17
合計:   34  →  34 × 2.5 = 85</pre>
<p>SUS スコアは<b>パーセントではありません</b>。多くの研究の平均はおよそ 68 とされ、それより高ければ平均以上の使いやすさと解釈されます (目安)。参加者ごとにスコアを出してから平均します。</p>
<svg class="tb-chart" role="img" viewBox="0 0 520 110" aria-label="SUS スコアの目安">
  <rect style="fill:var(--tb-surface-2);stroke:var(--tb-text-3)" x="40" y="40" width="440" height="20"/>
  <rect style="fill:var(--tb-bad)" x="40" y="40" width="226" height="20" opacity="0.35"/><rect style="fill:var(--tb-good)" x="266" y="40" width="214" height="20" opacity="0.35"/>
  <line style="stroke:var(--tb-accent)" x1="339" y1="30" x2="339" y2="70" stroke-width="3"/><text class="mark-t" x="339" y="24" text-anchor="middle">例題 85</text>
  <line class="guide" x1="266" y1="30" x2="266" y2="74"/><text class="tick" x="266" y="88" text-anchor="middle">平均 約 68</text>
  <text class="tick" x="40" y="88" text-anchor="middle">0</text><text class="tick" x="260" y="104" text-anchor="middle">50</text><text class="tick" x="480" y="88" text-anchor="middle">100</text>
</svg>
<p class="tb-caption">図: SUS スコアの数直線。平均の目安 (約 68) との比較で解釈する (パーセントではない)。</p>
<h2>A/B テスト</h2>
<ul>
  <li>2 つの案 (A と B) を利用者にランダムに割り当て、<b>事前に決めた 1 つの指標</b> (成功率・完了時間など) で比較する</li>
  <li>変える要素は 1 つに絞ると、原因が分かる</li>
  <li>差が偶然でないかを統計的に検定する。少人数で「なんとなく B が良い」と判断しない</li>
  <li>Web やソフトに向くが、物理製品でも 3D プリント試作の 2 案を作業時間で比べるなどの形で応用できる</li>
</ul>
<h2>よくある失敗</h2>
<ul>
  <li>開発者自身や社内の詳しい人だけでテストする</li>
  <li>「使いやすいですか?」と聞いて、行動を見ない</li>
  <li>テスト中に助けてしまう、誘導する</li>
  <li>結果を記録するだけで改善と再テストをしない</li>
</ul>
<div class="tb-tip"><b>3DCAD Studio</b>: パラメータで寸法違いの 2 案を作り、3D プリント試作でユーザビリティテストや比較テストに使えます。リアル表示の画像は、早い段階のインタビューで案を見せる材料になります。</div>`,
    points: ["定性 (なぜ) で発見し、定量 (どれくらい) で確かめる", "インタビュー・観察・ペルソナ・ジャーニーマップで利用者を理解", "ユーザビリティテスト: 現実的タスク・思考発話・成功率・時間", "SUS = (奇数: 点−1、偶数: 5−点) の合計 × 2.5、平均はおよそ 68"],
    exercises: [
      {
        q: "ある参加者の SUS の回答が Q1〜Q10 = 4, 2, 5, 1, 4, 2, 5, 2, 4, 1 でした。SUS スコアを計算してください。",
        a: "奇数項目 (回答 − 1): 3 + 4 + 3 + 4 + 3 = 17。偶数項目 (5 − 回答): 3 + 4 + 3 + 3 + 4 = 17。合計 34 × 2.5 = <b>85</b>。平均的な目安 (約 68) を上回ります。",
      },
      {
        q: "全項目に 3 (どちらでもない) と答えた場合の SUS スコアは?",
        a: "奇数項目は 3 − 1 = 2 が 5 つで 10、偶数項目は 5 − 3 = 2 が 5 つで 10。合計 20 × 2.5 = <b>50</b>。",
      },
    ],
    quiz: [
      { q: "SUS の偶数項目の得点の計算は?", choices: ["回答 − 1", "5 − 回答", "回答 × 2.5"], answer: 1, explain: "偶数項目は否定文なので 5 − 回答で換算し、合計に 2.5 を掛けます。" },
      { q: "思考発話法で司会者がすべきことは?", choices: ["迷ったらすぐ操作方法を教える", "中立に考えを声に出すよう促し、助けない", "製品の長所を説明する"], answer: 1, explain: "助けたり誘導したりすると、本当の問題が見えなくなります。" },
      { q: "「なぜ使いにくいのか」を知るのに適した調査は?", choices: ["定性調査 (観察・インタビュー)", "大規模アンケートの平均値", "A/B テスト"], answer: 0, explain: "理由の発見には定性調査が向いています。定量は大きさ・比較に使います。" },
    ],
    lessons: ["5-1"],
  },
];
