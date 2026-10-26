import type { TextChapter } from "../types";

export const DESIGN: TextChapter[] = [
  {
    id: "form",
    part: "design",
    title: "プロダクトデザインの基礎 — 形と比率",
    minutes: 20,
    level: 1,
    lead: "機能を満たすだけでなく、「美しい」「わかりやすい」「欲しくなる」形にするのがプロダクトデザインです。形・比率・統一感の基本原則を学びます。",
    body: `
<h2>デザインとエンジニアリング</h2>
<p>工業製品のデザインは、見た目の飾りではありません。<b>使い方が形から伝わる</b>こと、<b>作れる</b>こと、<b>ブランドらしさ</b>を持つことを同時に満たす設計活動です。
エンジニアとデザイナーが早い段階から一緒に考えると、作りやすく魅力的な製品になります。</p>
<h2>比率 (プロポーション)</h2>
<p>形の印象は縦横の比率で大きく変わります。正方形は安定・静的、細長い形は動き・方向性を感じさせます。
古くから美しいとされる比率に<b>黄金比 1 : 1.618</b> や、A 判の用紙で使われる<b>白銀比 1 : √2 (≈ 1.414)</b> があります。</p>
<div data-widget="ratio"></div>
<p>比率は「正解」ではなく、全体と部分の関係を整える<b>ものさし</b>です。主要な寸法の比をそろえると、全体にまとまりが出ます。</p>
<svg class="tb-chart" viewBox="0 0 520 204" role="img" aria-label="正方形・白銀比・黄金比の長方形">
<defs><linearGradient id="dz-gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fde7b0"/><stop offset="1" stop-color="#f2c45a"/></linearGradient></defs><g class="k-shadow"><rect class="k-alu" x="24" y="52" width="90" height="90" rx="2"/><rect class="k-alu" x="150" y="52" width="127" height="90" rx="2"/><rect x="318" y="52" width="146" height="90" rx="2" style="fill:url(#dz-gold);stroke:var(--k-line)" stroke-width="1.6"/></g><path class="k-thin" d="M408,52 L408,142 M408,108 L464,108 M430,108 L430,142"/><path d="M318,142 A90,90 0 0 1 408,52 A56,56 0 0 1 464,108 A34,34 0 0 1 430,142 A22,22 0 0 1 408,120" fill="none" style="stroke:var(--tb-bad)" stroke-width="1.8"/><path class="k-hidden" d="M213.5,52 L213.5,142"/><text class="k-note" x="182" y="101" text-anchor="middle">√2</text><text class="k-note" x="245" y="101" text-anchor="middle">√2</text><text class="k-note" x="392" y="44" text-anchor="middle">正方形を切り取ると残りも同じ比</text><line class="k-ext" x1="22" y1="52" x2="10" y2="52"/><line class="k-ext" x1="22" y1="142" x2="10" y2="142"/><line class="k-dimline" x1="14" y1="52" x2="14" y2="142"/><text class="k-dimtext" x="9" y="101" text-anchor="end">1</text><line class="k-ext" x1="24" y1="144" x2="24" y2="158"/><line class="k-ext" x1="114" y1="144" x2="114" y2="158"/><line class="k-dimline" x1="24" y1="154" x2="114" y2="154"/><text class="k-dimtext" x="69" y="170" text-anchor="middle">1</text><line class="k-ext" x1="150" y1="144" x2="150" y2="158"/><line class="k-ext" x1="277" y1="144" x2="277" y2="158"/><line class="k-dimline" x1="150" y1="154" x2="277" y2="154"/><text class="k-dimtext" x="213.5" y="170" text-anchor="middle">1.414</text><line class="k-ext" x1="318" y1="144" x2="318" y2="158"/><line class="k-ext" x1="464" y1="144" x2="464" y2="158"/><line class="k-dimline" x1="318" y1="154" x2="464" y2="154"/><text class="k-dimtext" x="391" y="170" text-anchor="middle">1.618</text><text class="lbl" x="69" y="192" text-anchor="middle">1 : 1 安定・静的</text><text class="lbl" x="213" y="192" text-anchor="middle">1 : 1.414 (白銀比)</text><text class="lbl" x="391" y="192" text-anchor="middle">1 : 1.618 (黄金比)</text><path d="M27,55 L111,55" fill="none" style="stroke:#ffffff" stroke-width="1.6" opacity="0.8"/><path d="M153,55 L274,55" fill="none" style="stroke:#ffffff" stroke-width="1.6" opacity="0.8"/><path d="M321,55 L461,55" fill="none" style="stroke:#ffffff" stroke-width="1.6" opacity="0.8"/>
</svg>
<p class="tb-caption">図: 同じ高さでも横の比率で印象が変わる。黄金比の長方形から正方形を除くと、残りも黄金比になる</p>
<h2>統一感をつくる</h2>
<ul>
  <li><b>R をそろえる</b>: 角の丸みの大きさや考え方 (大きく柔らかい / 小さくシャープ) を統一する</li>
  <li><b>線をそろえる</b>: 部品の合わせ目 (パーティングライン)、ボタンの端、窓の縁を同じ線上に並べる</li>
  <li><b>要素の数を減らす</b>: 色・素材・形の種類が多いほど雑然と見える</li>
  <li><b>面の向き</b>: 光の当たり方 (ハイライト) が連続するよう、面をなめらかにつなぐ</li>
</ul>
<h2>視覚的な重さとバランス</h2>
<ul>
  <li>暗い色・大きい面・下の方にある要素は<b>重く</b>見える — 下を重くすると安定感が出る</li>
  <li>底面を少し内側に引っ込める (面取り・逃げ) と、軽やかに浮いて見える</li>
  <li>左右対称は安定・格式、非対称は動き・親しみ</li>
</ul>
<svg class="tb-chart" viewBox="0 0 520 212" role="img" aria-label="視覚的な重さと浮いて見える底面">
<defs><linearGradient id="dz-dark" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#56606e"/><stop offset="1" stop-color="#262c35"/></linearGradient></defs><rect class="k-panel" x="8" y="8" width="160" height="196" rx="8"/><circle class="k-badge" cx="28" cy="28" r="10" style="fill:var(--tb-good)"/><text class="k-badge-t" x="28" y="32" text-anchor="middle">✓</text><text class="k-title" x="46" y="32">下を暗く</text><rect class="k-ground" x="18" y="152" width="140" height="10"/><line class="axis" x1="18" y1="152" x2="158" y2="152"/><rect class="k-panel" x="180" y="8" width="160" height="196" rx="8"/><circle class="k-badge" cx="200" cy="28" r="10" style="fill:var(--tb-bad)"/><text class="k-badge-t" x="200" y="32" text-anchor="middle">✕</text><text class="k-title" x="218" y="32">上を暗く</text><rect class="k-ground" x="190" y="152" width="140" height="10"/><line class="axis" x1="190" y1="152" x2="330" y2="152"/><rect class="k-panel" x="352" y="8" width="160" height="196" rx="8"/><circle class="k-badge" cx="372" cy="28" r="10" style="fill:var(--tb-good)"/><text class="k-badge-t" x="372" y="32" text-anchor="middle">✓</text><text class="k-title" x="390" y="32">底を逃がす</text><rect class="k-ground" x="362" y="152" width="140" height="10"/><line class="axis" x1="362" y1="152" x2="502" y2="152"/><ellipse cx="98" cy="152" rx="64" ry="3" style="fill:var(--tb-text)" opacity="0.13"/><g class="k-shadow"><rect class="k-alu" x="38" y="62" width="120" height="90" rx="6"/></g><path d="M38,122 L158,122 L158,146 Q158,152 152,152 L44,152 Q38,152 38,146 Z" style="fill:url(#dz-dark);stroke:var(--k-line)" stroke-width="1.6"/><path d="M44,65 L152,65" fill="none" style="stroke:#ffffff" stroke-width="1.6" opacity="0.8"/><text class="k-good-t" x="88" y="186" text-anchor="middle">→ 安定</text><ellipse cx="270" cy="152" rx="64" ry="3" style="fill:var(--tb-text)" opacity="0.13"/><g class="k-shadow"><rect class="k-alu" x="210" y="62" width="120" height="90" rx="6"/></g><path d="M210,92 L330,92 L330,68 Q330,62 324,62 L216,62 Q210,62 210,68 Z" style="fill:url(#dz-dark);stroke:var(--k-line)" stroke-width="1.6"/><text class="k-bad-t" x="270" y="186" text-anchor="middle">→ 頭が重い</text><ellipse cx="442" cy="152" rx="46" ry="4" style="fill:var(--tb-text)" opacity="0.32"/><g class="k-shadow"><path class="k-alu" d="M388,62 L496,62 Q502,62 502,68 L502,132 L490,144 L400,144 L388,132 L388,68 Q388,62 394,62 Z"/></g><path d="M400,144 L490,144" style="stroke:var(--tb-accent)" stroke-width="3"/><path d="M394,65 L496,65" fill="none" style="stroke:#ffffff" stroke-width="1.6" opacity="0.8"/><path class="k-thin" d="M470,146 L486,120" marker-start="url(#k-dot)"/><text class="k-note" x="486" y="114" text-anchor="middle">逃げ</text><text class="k-note" x="442" y="178" text-anchor="middle">影ができ、</text><text class="k-note" x="442" y="194" text-anchor="middle">浮いて軽く見える</text>
</svg>
<p class="tb-caption">図: 色の配置と底面の逃げで、同じ箱の「重さ」の印象が変わる</p>

<h2>例題: 比率で寸法を決める手順</h2>
<p>高さ 240 mm の卓上スピーカー (縦長の箱) の正面を例に、比率で寸法を決める流れを追ってみます。</p>
<ol class="tb-flow">
  <li><b>動かせない寸法を確認する</b> — 内部のユニット径・基板から、高さ 240 mm が先に決まっている</li>
  <li><b>全体の比を選ぶ</b> — 黄金比なら幅 = 240 / 1.618 ≈ <b>148 mm</b>、白銀比なら 240 / 1.414 ≈ <b>170 mm</b>。細身で軽快に見せたいので黄金比を採用</li>
  <li><b>部分を同じ比で分ける</b> — 上部の表示窓と下部のスピーカー面の境目を、高さの 0.382 倍 (= 1 − 0.618) の位置、上から約 <b>92 mm</b> に置く。下部は 148 mm で、全体の幅とほぼ同じ正方形になる</li>
  <li><b>細部を全体に合わせる</b> — 角 R・ボタン間隔なども主要寸法の分数 (1/8・1/16 など) にそろえる</li>
  <li><b>実物大で確かめる</b> — 数字どおりでも、置いたときの見え方 (目線の高さ、遠近) で印象は変わる。最後は目で判断する</li>
</ol>
<svg class="tb-chart" viewBox="0 0 520 250" role="img" aria-label="黄金比で分割したスピーカー正面の寸法例">
<g class="k-shadow"><rect class="k-alu" x="186" y="20" width="111" height="180" rx="6"/></g><line class="k-thin" x1="186" y1="89" x2="297" y2="89"/><rect class="k-plastic" x="198" y="34" width="87" height="40" rx="3"/><circle cx="241.5" cy="144" r="40" style="fill:var(--tb-surface-2);stroke:var(--k-line)" stroke-width="1.6"/><circle cx="241.5" cy="144" r="14" style="fill:var(--tb-text-3)" opacity="0.5"/><line class="k-ext" x1="184" y1="20" x2="150" y2="20"/><line class="k-ext" x1="184" y1="200" x2="130" y2="200"/><line class="k-ext" x1="184" y1="89" x2="150" y2="89"/><line class="k-dimline" x1="134" y1="20" x2="134" y2="200"/><text class="k-dimtext" x="128" y="114" text-anchor="end">240</text><line class="k-dimline" x1="154" y1="20" x2="154" y2="89"/><text class="k-dimtext" x="160" y="58">92</text><line class="k-dimline" x1="154" y1="89" x2="154" y2="200"/><text class="k-dimtext" x="160" y="148">148</text><line class="k-ext" x1="186" y1="202" x2="186" y2="222"/><line class="k-ext" x1="297" y1="202" x2="297" y2="222"/><line class="k-dimline" x1="186" y1="216" x2="297" y2="216"/><text class="k-dimtext" x="241.5" y="236" text-anchor="middle">148 (= 240 / 1.618)</text><text class="k-note" x="312" y="58">表示窓: 0.382 H</text><text class="k-note" x="312" y="148">スピーカー面: 0.618 H</text><text class="k-note" x="312" y="166">(ほぼ正方形)</text><text class="lbl" x="20" y="240">全体も分割も同じ比</text>
</svg>
<p class="tb-caption">図: 高さ 240 mm を黄金比で分割した例 (寸法 mm)。全体の比と部分の比をそろえると、まとまって見える</p>
<h2>製品で見る比率</h2>
<ul>
  <li><b>ノート・手帳・書類トレー</b>: A 判に合わせるため白銀比が自然に現れる。収納する物の比に形を合わせると無駄がない</li>
  <li><b>ディスプレイ・テレビ</b>: 映像の 16 : 9 (1 : 1.78) が全体比を決める。枠を細くするほど画面の比がそのまま製品の比になる</li>
  <li><b>家電の操作パネル</b>: 表示部と操作部の面積を 1 : 1.6 前後にすると、どちらが主役かがはっきりする</li>
</ul>
<h2>よくある失敗</h2>
<ul>
  <li><b>比率を当てはめただけで終える</b>: 側面・上面の比、厚みとの関係を見ていないと、正面だけ整って立体として重く見える</li>
  <li><b>中途半端な比</b>: 1 : 1.1 のような「ほぼ正方形」は、正方形の意図なのか長方形なのかがあいまいで落ち着かない。違いを出すならはっきり出す</li>
  <li><b>R や線がバラバラ</b>: 比率が整っていても、角 R が部品ごとに違うと統一感が崩れる</li>
</ul>
<div class="tb-tip"><b>3DCAD Studio</b>: ユーザ パラメータで主要寸法の比率を式にしておくと (例: 奥行 = 幅 / 1.618)、比率を保ったまま大きさを検討できます。
「リアル表示」で質感と光の当たり方を確認しましょう。</div>`,
    points: ["デザイン = 使い方が伝わり、作れて、ブランドらしい形", "比率 (黄金比 1:1.618、白銀比 1:√2) は全体を整えるものさし", "R・線・要素をそろえて統一感", "暗い・大きい・下の要素は重く見える"],
    exercises: [
      {
        q: "幅 160 mm の製品の奥行を黄金比で決めると何 mm ですか? 白銀比ではどうですか?",
        a: "黄金比: 160 / 1.618 ≈ <b>99 mm</b>。白銀比: 160 / 1.414 ≈ <b>113 mm</b>。",
      },
      {
        q: "幅 300 mm の白銀比の操作パネル (横長) があります。高さは何 mm ですか? また、このパネルを横半分に分けた 2 つの領域の比はいくつですか?",
        a: "高さ = 300 / 1.414 ≈ <b>212 mm</b>。横半分に分けると 150 × 212 mm で、212 / 150 ≈ 1.414 — <b>元と同じ 1 : √2</b> になります (A 判を半分に折っても同じ比になるのと同じ性質)。",
      },
      {
        q: "幅 200 × 高さ 190 mm の箱型製品が「なんとなく落ち着かない」と言われました。原因と改善案を述べてください。",
        a: "1 : 0.95 は<b>正方形とも長方形ともつかない中途半端な比</b>で、意図が伝わらないことが原因と考えられます。案: ① 高さを 200 mm にそろえて正方形 (安定) と明確にする、② 高さを 200 / 1.414 ≈ 141 mm や 200 / 1.618 ≈ 124 mm にして横長をはっきり出す。内部寸法の制約と合わせて選びます。",
      },
    ],
    quiz: [
      { q: "A4 用紙の縦横比は?", choices: ["1 : 1.618 (黄金比)", "1 : √2 (白銀比)", "3 : 4"], answer: 1, explain: "A 判・B 判は半分に折っても同じ比率になる 1 : √2 です。" },
      { q: "製品に統一感を出す方法として適切なのは?", choices: ["部品ごとに違う角の R を使う", "角の R や合わせ目の線をそろえる", "色の種類を増やす"], answer: 1, explain: "R・線・色・素材の種類をそろえ、要素を減らすと統一感が出ます。" },
      { q: "黄金比の長方形 (1 : 1.618) から短辺を一辺とする正方形を切り取ると、残りの長方形の比は?", choices: ["1 : 1", "1 : 1.414", "1 : 1.618"], answer: 2, explain: "1.618 − 1 = 0.618 で、1 / 0.618 ≈ 1.618 なので、残りも黄金比になります。" },
      { q: "比率を使った形の決め方として、よくある失敗は?", choices: ["正面だけを比率で決め、側面・厚みとの関係を見ない", "主要寸法の比をそろえる", "最後に実物大の模型で確かめる"], answer: 0, explain: "製品は立体です。正面・側面・上面と厚みの関係まで見ないと、立体としてのまとまりは出ません。" },
    ],
  },
  {
    id: "ergonomics",
    part: "design",
    title: "人間工学 — 人に合わせて寸法を決める",
    minutes: 20,
    level: 2,
    lead: "道具や機械を使うのは人です。手の大きさ・力・視野・姿勢に合わない製品は、使いにくく、疲れ、事故の原因にもなります。人間工学の基本と、寸法の決め方を学びます。",
    body: `
<h2>人体寸法とパーセンタイル</h2>
<p>人の体格はさまざまなので、「平均の人」に合わせると半分の人に合いません。人体寸法のデータは<b>パーセンタイル</b>で表します (5 パーセンタイル = 小さいほうから 5 % の人の値)。</p>
<ul>
  <li><b>届く距離</b> (手が届く棚の高さ、操作レバーの位置) → 体の<b>小さい人</b> (女性 5 パーセンタイルなど) に合わせる</li>
  <li><b>通れる・入れる空間</b> (扉の高さ、足元のすき間) → 体の<b>大きい人</b> (男性 95 パーセンタイルなど) に合わせる</li>
  <li>どちらにも合わない場合は<b>調整機構</b> (高さ調整・スライド) を設ける</li>
</ul>
<svg class="tb-chart" viewBox="0 0 520 210" role="img" aria-label="パーセンタイルと設計の基準">
<path d="M90,160 C155,158 190,46 260,46 C330,46 365,158 430,160 Z" style="fill:var(--tb-surface-2)" stroke="none"/><clipPath id="dz-pc"><rect x="168" y="30" width="184" height="131"/></clipPath><path clip-path="url(#dz-pc)" d="M90,160 C155,158 190,46 260,46 C330,46 365,158 430,160 Z" style="fill:var(--tb-accent)" opacity="0.22"/><path d="M90,160 C155,158 190,46 260,46 C330,46 365,158 430,160" fill="none" style="stroke:var(--tb-text)" stroke-width="2"/><line class="axis" x1="70" y1="160" x2="450" y2="160"/><path class="guide" d="M168,160 L168,104 M352,160 L352,104 M260,160 L260,46"/><text class="tick" x="168" y="176" text-anchor="middle">5 %ile</text><text class="tick" x="260" y="176" text-anchor="middle">50 %ile (平均付近)</text><text class="tick" x="352" y="176" text-anchor="middle">95 %ile</text><text class="k-note" x="306" y="132" text-anchor="middle">90 % の人</text><line class="k-dimline" x1="168" y1="140" x2="352" y2="140"/><text class="mark-t" x="120" y="80" text-anchor="middle">届く距離は</text><text class="mark-t" x="120" y="96" text-anchor="middle">小さい人に</text><text class="mark-t" x="400" y="80" text-anchor="middle">通る空間は</text><text class="mark-t" x="400" y="96" text-anchor="middle">大きい人に</text><path class="k-move" d="M120,102 C130,120 150,128 164,130"/><path class="k-move" d="M400,102 C390,120 370,128 356,130"/><line class="axis" x1="10" y1="160" x2="60" y2="160"/><g class="k-shadow"><rect x="29.7" y="127" width="5.6" height="33" rx="2" style="fill:var(--k-steel-3);stroke:var(--k-line)" stroke-width="1"/><rect x="36.7" y="127" width="5.6" height="33" rx="2" style="fill:var(--k-steel-3);stroke:var(--k-line)" stroke-width="1"/><path class="k-plastic" d="M41.9,104.6 L46.6,82.1 L50.5,82.8 L45.9,108.5 Z" stroke-width="1"/><circle class="k-skin" cx="48.5" cy="80.1" r="2.6"/><rect class="k-plastic" x="25.1" y="104.6" width="4" height="23.8" rx="2" stroke-width="1"/><circle class="k-skin" cx="27.1" cy="129.6" r="2.3"/><rect class="k-plastic" x="28.7" y="103.2" width="14.5" height="26.4" rx="3.3" stroke-width="1.2"/><circle class="k-skin" cx="36" cy="98.5" r="4.5"/></g><line class="axis" x1="458" y1="160" x2="512" y2="160"/><path class="k-edge" d="M462,160 L462,44 L508,44 L508,160" style="stroke:var(--k-line-2)"/><g class="k-shadow"><rect x="475.1" y="108" width="8.8" height="52" rx="3.1" style="fill:var(--k-steel-3);stroke:var(--k-line)" stroke-width="1"/><rect x="486" y="108" width="8.8" height="52" rx="3.1" style="fill:var(--k-steel-3);stroke:var(--k-line)" stroke-width="1"/><rect class="k-accent" x="495.9" y="72.6" width="6.2" height="37.4" rx="3.1" stroke-width="1"/><circle class="k-skin" cx="499" cy="112.2" r="3.6"/><rect class="k-accent" x="467.8" y="72.6" width="6.2" height="37.4" rx="3.1" stroke-width="1"/><circle class="k-skin" cx="471" cy="112.2" r="3.6"/><rect class="k-accent" x="473.6" y="70.6" width="22.9" height="41.6" rx="5.2" stroke-width="1.2"/><circle class="k-skin" cx="485" cy="63.1" r="7.1"/></g><text class="k-note" x="36" y="176" text-anchor="middle">小柄</text><text class="k-note" x="485" y="176" text-anchor="middle">大柄</text><text class="lbl" x="260" y="200" text-anchor="middle">平均に合わせると、残り半分の人には合わない</text>
</svg>
<p class="tb-caption">図: 人体寸法の分布。5〜95 パーセンタイルの範囲 (90 % の人) をカバーするのが一般的な目安</p>
<div data-widget="3d-ergonomic"></div>
<p class="tb-caption">3D 図: 作業面の高さを変えると、肘の高さとの差に応じて腕の上がり方や前かがみの姿勢が変わります。身長の違いも試してください。</p>
<h2>手と操作</h2>
<table class="tb-table">
  <tr><th>項目</th><th>目安</th></tr>
  <tr><td>握り (パワーグリップ) の直径</td><td>30〜40 mm 程度 (細すぎ・太すぎは力が入らない)</td></tr>
  <tr><td>指で押すボタンの大きさ</td><td>10 mm 角程度以上、間隔をあける (手袋なら大きく)</td></tr>
  <tr><td>タッチ画面のボタン</td><td>約 7〜10 mm 以上</td></tr>
  <tr><td>片手で長時間扱う道具の質量</td><td>できるだけ軽く、重心を握りの近くに</td></tr>
</table>
<svg class="tb-chart" viewBox="0 0 520 212" role="img" aria-label="握り径とボタンの大きさ">
<rect class="k-panel" x="8" y="8" width="330" height="196" rx="8"/><rect class="k-panel" x="346" y="8" width="166" height="196" rx="8"/><text class="k-title" x="22" y="30">握りの断面</text><text class="k-title" x="360" y="30">ボタン (正面)</text><g class="k-shadow"><circle class="k-part-h" cx="56" cy="108" r="12"/></g><path d="M47.5,104.9 A9,9 0 0 1 52.9,99.5" fill="none" style="stroke:#ffffff" stroke-width="1.6" opacity="0.9"/><circle cx="56" cy="108" r="18" fill="none" style="stroke:url(#k-skin)" stroke-width="9" stroke-dasharray="113.1 999" transform="rotate(-60 56 108)" opacity="0.92"/><circle cx="56" cy="108" r="26" fill="none" style="stroke:url(#k-skin)" stroke-width="9" stroke-dasharray="86.9 999" transform="rotate(-60 56 108)" opacity="0.92"/><text class="k-bad-t" x="56" y="188" text-anchor="middle">細すぎ</text><g class="k-shadow"><circle class="k-part-h" cx="162" cy="108" r="30"/></g><path d="M136.6,98.8 A27,27 0 0 1 152.8,82.6" fill="none" style="stroke:#ffffff" stroke-width="1.6" opacity="0.9"/><circle cx="162" cy="108" r="36" fill="none" style="stroke:url(#k-skin)" stroke-width="9" stroke-dasharray="200 999" transform="rotate(-60 162 108)" opacity="0.92"/><text class="k-good-t" x="162" y="188" text-anchor="middle">30〜40 mm</text><g class="k-shadow"><circle class="k-part-h" cx="272" cy="108" r="50"/></g><path d="M227.8,91.9 A47,47 0 0 1 255.9,63.8" fill="none" style="stroke:#ffffff" stroke-width="1.6" opacity="0.9"/><circle cx="272" cy="108" r="56" fill="none" style="stroke:url(#k-skin)" stroke-width="9" stroke-dasharray="200 999" transform="rotate(-60 272 108)" opacity="0.92"/><text class="k-bad-t" x="272" y="188" text-anchor="middle">太すぎ</text><line class="k-dimline" x1="132" y1="108" x2="192" y2="108"/><text class="k-dimtext" x="162" y="104" text-anchor="middle">⌀</text><text class="k-note" x="56" y="72" text-anchor="middle">指が余る</text><text class="k-note" x="272" y="50" text-anchor="middle">指が届かない</text><g class="k-shadow"><rect class="k-plastic" x="372" y="86" width="36" height="36" rx="6"/></g><rect x="376" y="90" width="28" height="24" rx="4" fill="none" style="stroke:#ffffff" stroke-width="1.4" opacity="0.6"/><g class="k-shadow"><rect class="k-plastic" x="436" y="86" width="36" height="36" rx="6"/></g><rect x="440" y="90" width="28" height="24" rx="4" fill="none" style="stroke:#ffffff" stroke-width="1.4" opacity="0.6"/><line class="k-ext" x1="372" y1="84" x2="372" y2="66"/><line class="k-ext" x1="408" y1="84" x2="408" y2="66"/><line class="k-dimline" x1="372" y1="70" x2="408" y2="70"/><text class="k-dimtext" x="390" y="62" text-anchor="middle">10 mm〜</text><line class="k-ext" x1="408" y1="124" x2="408" y2="144"/><line class="k-ext" x1="436" y1="124" x2="436" y2="144"/><line class="k-dimline" x1="408" y1="140" x2="436" y2="140"/><text class="k-dimtext" x="422" y="158" text-anchor="middle">間隔</text><text class="lbl" x="429" y="188" text-anchor="middle">大きさ + 間隔</text>
</svg>
<p class="tb-caption">図: 握り径とボタン寸法の目安 (断面・正面を模式化)。手袋使用ならさらに大きく</p>
<h2>操作をわかりやすく</h2>
<ul>
  <li><b>アフォーダンス / シグニファイア</b>: 形が使い方を示す (押す所はくぼみ、つまむ所は突起、回す所はローレット)</li>
  <li><b>対応づけ (マッピング)</b>: 操作部と動くものの配置をそろえる (コンロのつまみの並びと火口の並び)</li>
  <li><b>フィードバック</b>: 押した感触 (クリック感)・音・光で操作が伝わったことを示す</li>
  <li><b>ステレオタイプ</b>: 右に回すと増える、上げると ON — 多くの人の思い込みに合わせる</li>
</ul>
<h2>安全</h2>
<ul>
  <li>指・手が挟まれるすき間をなくすか、十分に広げる</li>
  <li>手が触れる角・縁は面取り・R でなめらかに</li>
  <li>非常停止は誰でもすぐ押せる位置・大きさ・色 (赤いきのこ形) に</li>
</ul>
<h2>例題: 平均と標準偏差からパーセンタイル値を求める</h2>
<p>人体寸法は多くの場合、正規分布で近似できます。平均 μ と標準偏差 σ が分かれば、次の式でパーセンタイル値を求められます。</p>
<table class="tb-table">
  <tr><th>パーセンタイル</th><th>計算式</th><th>使いどころ</th></tr>
  <tr><td>5 %ile</td><td>μ − 1.645 σ</td><td>届く距離・握れる大きさの上限</td></tr>
  <tr><td>50 %ile</td><td>μ</td><td>調整機構の中央値</td></tr>
  <tr><td>95 %ile</td><td>μ + 1.645 σ</td><td>通る空間・すき間・入る大きさの下限</td></tr>
  <tr><td>1 % / 99 %ile</td><td>μ ∓ 2.326 σ</td><td>安全にかかわる寸法 (挟み込み防止など)</td></tr>
</table>
<p><b>例 1 (届く高さ)</b>: 共用の収納棚の最上段を決める。利用者に女性を含むので、女性の上方到達高 (μ = 1900 mm、σ = 75 mm と仮定) の 5 %ile を使う。<br>
1900 − 1.645 × 75 = 1900 − 123 ≈ <b>1777 mm</b> → 最上段の取っ手は<b>約 1770 mm 以下</b>に置く。</p>
<p><b>例 2 (すき間)</b>: 手袋をした手を差し入れる取っ手の内のり幅。男性の手幅 (μ = 85 mm、σ = 4.5 mm と仮定) の 95 %ile は 85 + 1.645 × 4.5 ≈ <b>92 mm</b>。手袋分 約 10 mm と余裕 5 mm を足して<b>約 110 mm</b> にする。</p>
<svg class="tb-chart" viewBox="0 0 520 200" role="img" aria-label="上方到達高の分布と5パーセンタイルの位置">
<path d="M60,160 C150,158 200,40 290,40 C380,40 430,158 520,160" fill="none" style="stroke:var(--tb-text)" stroke-width="2"/><clipPath id="dz-p5"><rect x="0" y="20" width="167" height="141"/></clipPath><path clip-path="url(#dz-p5)" d="M60,160 C150,158 200,40 290,40 C380,40 430,158 520,160 Z" style="fill:var(--tb-bad)" opacity="0.25"/><line class="axis" x1="40" y1="160" x2="510" y2="160"/><path class="guide" d="M167,160 L167,60 M290,160 L290,40"/><text class="tick" x="167" y="176" text-anchor="middle">1777 (5 %ile)</text><text class="tick" x="290" y="176" text-anchor="middle">1900 (μ)</text><line class="k-dimline" x1="167" y1="70" x2="290" y2="70"/><text class="k-dimtext" x="228" y="64" text-anchor="middle">1.645 σ = 123</text><text class="k-note" x="110" y="120" text-anchor="middle">届かない 5 %</text><text class="lbl" x="400" y="80">上方到達高 [mm]</text><text class="lbl" x="400" y="96">(女性、仮定値)</text><text class="k-good-t" x="290" y="194" text-anchor="middle">棚の取っ手を 1770 mm 以下に → 95 % の人が届く</text>
</svg>
<p class="tb-caption">図: 平均から 1.645 σ 下がった値が 5 パーセンタイル。設計値はここから決める (数値は説明用の仮定値)</p>
<h2>寸法を決める手順</h2>
<ol class="tb-flow">
  <li><b>利用者を決める</b> — 成人男女、子ども、高齢者、車いす利用者、手袋着用など</li>
  <li><b>関係する人体寸法を選ぶ</b> — 届く距離か、通る空間か、握る大きさか</li>
  <li><b>パーセンタイルを決める</b> — 届く側は小さい人、空間側は大きい人。安全に関わるなら 1 / 99 %ile</li>
  <li><b>補正を加える</b> — 靴・衣服・手袋、動作の余裕 (姿勢の変化、繰り返し)</li>
  <li><b>試作で確かめる</b> — 両端の体格の人に実際に使ってもらう</li>
</ol>
<h2>よくある失敗</h2>
<ul>
  <li><b>設計者自身の体で決める</b>: 自分が使いやすい = 多くの人が使いやすい、ではない</li>
  <li><b>パーセンタイルを足し合わせる</b>: 「95 %ile の脚 + 95 %ile の胴」の人はほとんどいない。複数寸法の組み合わせは人体モデルや実測で確かめる</li>
  <li><b>年齢・地域の違いを無視</b>: 体格データは国・世代で異なる。輸出製品や高齢者向け製品では対象に合ったデータを使う</li>
</ul>
<div class="tb-tip"><b>3DCAD Studio</b>: 人の手や体の簡単なモデル (円柱・直方体) をアセンブリに置いて、操作部の位置やすき間を確認すると、図面だけでは気づかない使いにくさが見えてきます。</div>`,
    points: ["届く距離は小さい人、通れる空間は大きい人に合わせる (パーセンタイル)", "握りは直径 30〜40 mm、ボタンは 10 mm 程度以上", "形で使い方を示し、配置を対応させ、フィードバックを返す", "挟み込み・鋭い縁をなくす"],
    exercises: [
      {
        q: "壁掛けの操作盤の最も高いスイッチの位置を決めます。だれの寸法を基準にすべきですか? その理由は?",
        a: "体の<b>小さい利用者 (例: 女性の 5 パーセンタイル、車いす利用者を含めるならその手の届く範囲)</b> を基準にします。小さい人が届けば、大きい人も届くからです。",
      },
      {
        q: "作業台の下の足を入れる空間の奥行を決めます。男性の座位ひざ奥行 (膝の前端までの水平距離) が μ = 600 mm、σ = 30 mm と仮定し、95 パーセンタイルに靴の分 30 mm を加えた値を求めてください。",
        a: "95 %ile = 600 + 1.645 × 30 ≈ 649 mm。靴の分を加えて 649 + 30 ≈ <b>679 mm → 約 680 mm 以上</b>。空間は大きい人に合わせるので 95 %ile を使います。",
      },
      {
        q: "身長 155〜185 cm の作業者が共用する立ち作業台の高さを、1 つの固定値で決めようとしています。問題点と対策を述べてください。",
        a: "最適な作業面高さは肘の高さに比例し、身長差 30 cm では肘高も約 20 cm 違うため、<b>1 つの固定値では両端の人が前かがみや肩上げになる</b>。対策: ① 高さ調整機構 (昇降天板) を設ける、② 固定なら大きい人に合わせ、小さい人用に踏み台を用意する、③ 作業内容 (精密作業は高め、力作業は低め) も考える。",
      },
    ],
    quiz: [
      { q: "扉の高さを決めるときに基準にする人体寸法は?", choices: ["小さい人 (5 パーセンタイル)", "平均の人", "大きい人 (95 パーセンタイル以上)"], answer: 2, explain: "通れる空間は大きい人に合わせます。" },
      { q: "コンロのつまみの並びを火口の並びと同じ配置にするのは、どの原則?", choices: ["フィードバック", "対応づけ (マッピング)", "比率"], answer: 1, explain: "操作部と動くもの (火口) の位置関係をそろえるのがマッピングです。" },
      { q: "平均 μ、標準偏差 σ の正規分布で、95 パーセンタイル値は?", choices: ["μ + 1.645 σ", "μ + 2 σ", "μ + σ"], answer: 0, explain: "片側 5 % の点は平均から 1.645 σ 離れています。5 %ile は μ − 1.645 σ です。" },
      { q: "「95 %ile の座高と 95 %ile の脚長を持つ人」を想定して設計するのが不適切な理由は?", choices: ["計算が難しいから", "両方が同時に 95 %ile の人はごく少なく、過大設計になるから", "法律で禁止されているから"], answer: 1, explain: "各寸法の相関は完全ではないため、パーセンタイルを単純に組み合わせると実在しない体格になります。" },
    ],
  },
  {
    id: "cmf",
    part: "design",
    title: "CMF — 色・素材・仕上げ",
    minutes: 15,
    level: 1,
    lead: "同じ形でも、色 (Color)・素材 (Material)・仕上げ (Finish) で製品の印象・品質感・価格帯が大きく変わります。CMF の基本と、表面処理の選び方を学びます。",
    body: `
<h2>色</h2>
<ul>
  <li><b>明度</b> (明るさ) は重さ・大きさの印象に効く。明るい色は軽く大きく、暗い色は重く引き締まって見える</li>
  <li><b>彩度</b> の高い色はアクセントとして小さな面積に。操作部・注意表示に使うと目立つ</li>
  <li>安全色 (JIS Z 9103): 赤 = 防火・禁止・停止、黄赤 = 危険、黄 = 注意、緑 = 安全・進行、青 = 指示</li>
  <li>色は<b>マンセル値</b>や色見本の番号で指定し、限度見本で管理する</li>
</ul>
<svg class="tb-chart" viewBox="0 0 520 204" role="img" aria-label="明度と見かけの大きさ・重さ">
<defs><linearGradient id="dz-lt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#d9dee5"/></linearGradient><linearGradient id="dz-dk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a6371"/><stop offset="1" stop-color="#20252d"/></linearGradient></defs><ellipse cx="140" cy="132" rx="84" ry="5" style="fill:var(--tb-text)" opacity="0.13"/><ellipse cx="380" cy="132" rx="84" ry="5" style="fill:var(--tb-text)" opacity="0.13"/><g class="k-shadow"><rect x="60" y="30" width="160" height="98" rx="12" style="fill:url(#dz-lt);stroke:#9aa3b0" stroke-width="1.4"/><rect x="300" y="30" width="160" height="98" rx="12" style="fill:url(#dz-dk);stroke:#1a1e24" stroke-width="1.4"/></g><circle cx="140" cy="79" r="30" fill="url(#k-dots)" style="stroke:#9aa3b0" stroke-width="1.2"/><circle cx="380" cy="79" r="30" fill="#2b313a" style="stroke:#14181d" stroke-width="1.2"/><circle cx="380" cy="79" r="30" fill="url(#k-dots)" opacity="0.6"/><path d="M72,34 L208,34" fill="none" style="stroke:#ffffff" stroke-width="1.6" opacity="0.9"/><path d="M312,34 L448,34" fill="none" style="stroke:#ffffff" stroke-width="1.4" opacity="0.35"/><text class="k-note" x="260" y="84" text-anchor="middle">＝</text><text class="k-note" x="260" y="100" text-anchor="middle">同寸</text><text class="lbl" x="140" y="152" text-anchor="middle">明るい色: 軽く・大きく見える</text><text class="lbl" x="380" y="152" text-anchor="middle">暗い色: 重く・引き締まって見える</text><rect x="80" y="166" width="40" height="14" fill="#f5f6f8" style="stroke:var(--tb-border)" stroke-width="0.8"/><rect x="120" y="166" width="40" height="14" fill="#dcdfe4" style="stroke:var(--tb-border)" stroke-width="0.8"/><rect x="160" y="166" width="40" height="14" fill="#c2c7cf" style="stroke:var(--tb-border)" stroke-width="0.8"/><rect x="200" y="166" width="40" height="14" fill="#a6adb7" style="stroke:var(--tb-border)" stroke-width="0.8"/><rect x="240" y="166" width="40" height="14" fill="#8a929e" style="stroke:var(--tb-border)" stroke-width="0.8"/><rect x="280" y="166" width="40" height="14" fill="#6c7480" style="stroke:var(--tb-border)" stroke-width="0.8"/><rect x="320" y="166" width="40" height="14" fill="#4f5661" style="stroke:var(--tb-border)" stroke-width="0.8"/><rect x="360" y="166" width="40" height="14" fill="#343a43" style="stroke:var(--tb-border)" stroke-width="0.8"/><rect x="400" y="166" width="40" height="14" fill="#1e2228" style="stroke:var(--tb-border)" stroke-width="0.8"/><text class="k-note" x="72" y="177" text-anchor="end">明</text><text class="k-note" x="448" y="177">暗</text><text class="k-note" x="260" y="196" text-anchor="middle">明度スケール</text>
</svg>
<p class="tb-caption">図: 同じ寸法でも明度で印象が変わる。小型に見せたい製品は暗い色、圧迫感を減らしたい大型製品は明るい色が目安</p>
<h2>素材の見え方</h2>
<p>金属・樹脂・木・ガラスは、それぞれ固有の質感と「らしさ」を持っています。
金属は冷たく高品質、樹脂は軽く親しみやすい、木は温かい印象です。触れる部分の素材は、温度感や手触りも含めて選びます。</p>
<svg class="tb-chart" viewBox="0 0 520 212" role="img" aria-label="鏡面と梨地の反射">
<defs><linearGradient id="dz-mir" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1f2530"/><stop offset="0.45" stop-color="#3a4352"/><stop offset="0.5" stop-color="#f4f7fb"/><stop offset="0.56" stop-color="#3a4352"/><stop offset="1" stop-color="#151a22"/></linearGradient><radialGradient id="dz-mat" cx="0.35" cy="0.3" r="0.9"><stop offset="0" stop-color="#c7cdd6"/><stop offset="1" stop-color="#5c6573"/></radialGradient></defs><rect class="k-panel" x="8" y="8" width="248" height="196" rx="8"/><text class="k-title" x="24" y="32">鏡面</text><rect class="k-panel" x="264" y="8" width="248" height="196" rx="8"/><text class="k-title" x="280" y="32">梨地 (シボ・ブラスト)</text><rect x="198" y="16" width="44" height="26" rx="4" style="fill:url(#dz-mir);stroke:var(--k-line)" stroke-width="1"/><rect x="454" y="16" width="44" height="26" rx="4" style="fill:url(#dz-mat);stroke:var(--k-line)" stroke-width="1"/><circle cx="48" cy="66" r="9" style="fill:var(--tb-warn)"/><line x1="60" y1="66" x2="65" y2="66" style="stroke:var(--tb-warn)" stroke-width="1.6"/><line x1="56.5" y1="74.5" x2="60" y2="78" style="stroke:var(--tb-warn)" stroke-width="1.6"/><line x1="48" y1="78" x2="48" y2="83" style="stroke:var(--tb-warn)" stroke-width="1.6"/><line x1="39.5" y1="74.5" x2="36" y2="78" style="stroke:var(--tb-warn)" stroke-width="1.6"/><line x1="36" y1="66" x2="31" y2="66" style="stroke:var(--tb-warn)" stroke-width="1.6"/><line x1="39.5" y1="57.5" x2="36" y2="54" style="stroke:var(--tb-warn)" stroke-width="1.6"/><line x1="48" y1="54" x2="48" y2="49" style="stroke:var(--tb-warn)" stroke-width="1.6"/><line x1="56.5" y1="57.5" x2="60" y2="54" style="stroke:var(--tb-warn)" stroke-width="1.6"/><circle cx="304" cy="66" r="9" style="fill:var(--tb-warn)"/><line x1="316" y1="66" x2="321" y2="66" style="stroke:var(--tb-warn)" stroke-width="1.6"/><line x1="312.5" y1="74.5" x2="316" y2="78" style="stroke:var(--tb-warn)" stroke-width="1.6"/><line x1="304" y1="78" x2="304" y2="83" style="stroke:var(--tb-warn)" stroke-width="1.6"/><line x1="295.5" y1="74.5" x2="292" y2="78" style="stroke:var(--tb-warn)" stroke-width="1.6"/><line x1="292" y1="66" x2="287" y2="66" style="stroke:var(--tb-warn)" stroke-width="1.6"/><line x1="295.5" y1="57.5" x2="292" y2="54" style="stroke:var(--tb-warn)" stroke-width="1.6"/><line x1="304" y1="54" x2="304" y2="49" style="stroke:var(--tb-warn)" stroke-width="1.6"/><line x1="312.5" y1="57.5" x2="316" y2="54" style="stroke:var(--tb-warn)" stroke-width="1.6"/><g class="k-shadow"><rect class="k-part" x="28" y="140" width="208" height="22"/></g><line x1="28" y1="140" x2="236" y2="140" style="stroke:var(--k-line)" stroke-width="2.2"/><path d="M60,78 L132,139" style="stroke:var(--tb-warn)" stroke-width="2.2" marker-end="url(#k-arrow)"/><path d="M132,139 L204,78" style="stroke:var(--tb-warn)" stroke-width="2.2" marker-end="url(#k-arrow)"/><path class="k-center" d="M132,140 L132,70"/><text class="k-note" x="132" y="182" text-anchor="middle">正反射 → 映り込み・</text><text class="k-note" x="132" y="196" text-anchor="middle">傷が目立つ</text><g class="k-shadow"><path class="k-part" d="M284,162 L284,141 l6,-4 l6,4 l6,-4 l6,4 l6,-4 l6,4 l6,-4 l6,4 l6,-4 l6,4 l6,-4 l6,4 l6,-4 l6,4 l6,-4 l6,4 l6,-4 l6,4 l6,-4 l6,4 l6,-4 l6,4 l6,-4 l6,4 l6,-4 l6,4 l6,-4 l6,4 l6,-4 l6,4 l6,-4 l6,4 l6,-4 l6,4 L492,162 Z"/></g><path d="M316,78 L388,138" style="stroke:var(--tb-warn)" stroke-width="2.2" marker-end="url(#k-arrow)"/><line x1="388" y1="138" x2="354.2" y2="125.7" style="stroke:var(--tb-warn)" stroke-width="1.3" opacity="0.85" marker-end="url(#k-arrow)"/><line x1="388" y1="138" x2="362.5" y2="112.5" style="stroke:var(--tb-warn)" stroke-width="1.3" opacity="0.85" marker-end="url(#k-arrow)"/><line x1="388" y1="138" x2="375.7" y2="104.2" style="stroke:var(--tb-warn)" stroke-width="1.3" opacity="0.85" marker-end="url(#k-arrow)"/><line x1="388" y1="138" x2="391.1" y2="102.1" style="stroke:var(--tb-warn)" stroke-width="1.3" opacity="0.85" marker-end="url(#k-arrow)"/><line x1="388" y1="138" x2="411" y2="98.2" style="stroke:var(--tb-warn)" stroke-width="1.3" opacity="0.85" marker-end="url(#k-arrow)"/><line x1="388" y1="138" x2="425.7" y2="111.6" style="stroke:var(--tb-warn)" stroke-width="1.3" opacity="0.85" marker-end="url(#k-arrow)"/><line x1="388" y1="138" x2="422.8" y2="128.7" style="stroke:var(--tb-warn)" stroke-width="1.3" opacity="0.85" marker-end="url(#k-arrow)"/><text class="k-note" x="388" y="182" text-anchor="middle">拡散 → 落ち着く</text>
</svg>
<p class="tb-caption">図: 表面の凹凸で光の返り方が変わり、つや・傷の目立ちやすさが決まる</p>
<h2>主な表面処理・仕上げ</h2>
<table class="tb-table">
  <tr><th>素材</th><th>処理</th><th>特徴</th></tr>
  <tr><td>鋼</td><td>塗装 (焼付・粉体)、亜鉛めっき、三価クロメート、黒染め</td><td>防錆と色付け。粉体塗装は厚く丈夫</td></tr>
  <tr><td>ステンレス</td><td>ヘアライン、鏡面 (#800〜)、バイブレーション</td><td>処理なしでも耐食性が高い。仕上げで印象が変わる</td></tr>
  <tr><td>アルミ</td><td>アルマイト (陽極酸化)、ブラスト + アルマイト</td><td>硬く耐食性のある皮膜。黒・赤など染色も可能</td></tr>
  <tr><td>樹脂</td><td>シボ (梨地)、鏡面、塗装、印刷、インモールド</td><td>シボは傷・指紋が目立ちにくい。抜き勾配を大きく</td></tr>
</table>
<h2>CMF を決めるときに考えること</h2>
<ul>
  <li>使用環境 (屋外の紫外線・薬品・摩耗) で色あせ・剥がれが起きないか</li>
  <li>傷・指紋・汚れが目立たないか (鏡面・黒は目立ちやすい)</li>
  <li>製品シリーズ・ブランドとして一貫しているか</li>
  <li>コストと量産での品質ばらつき (色差の管理)</li>
</ul>
<h2>CMF シート — 部品ごとに指定する</h2>
<p>CMF は「何となく白」では量産できません。部品ごとに<b>素材 (グレード)・色 (色番号)・仕上げ (シボ番号・つや)</b> を一覧にした CMF シートを作り、限度見本とともに関係者で共有します。</p>
<svg class="tb-chart" viewBox="0 0 520 220" role="img" aria-label="電気ケトルを例にしたCMFシート">
<rect class="k-panel" x="8" y="8" width="504" height="204" rx="8"/><text class="k-title" x="24" y="32">CMF シート (例: 電気ケトル)</text><g class="k-shadow"><path d="M60,190 L70,70 Q72,58 84,58 L150,58 Q162,58 164,70 L174,190 Z" style="fill:#f1f2f0;stroke:var(--k-line)" stroke-width="1.6"/><path d="M164,80 Q206,82 204,124 Q202,162 170,166" fill="none" style="stroke:#6b7078" stroke-width="12" stroke-linecap="round"/><rect x="94" y="48" width="46" height="12" rx="4" style="fill:#6b7078;stroke:var(--k-line)" stroke-width="1.2"/><circle cx="117" cy="168" r="7" style="fill:#e8742c;stroke:var(--k-line)" stroke-width="1.2"/></g><path class="k-thin" d="M140,110 L260,72" marker-start="url(#k-dot)"/><path class="k-thin" d="M200,120 L260,118" marker-start="url(#k-dot)"/><path class="k-thin" d="M124,168 L260,166" marker-start="url(#k-dot)"/><rect x="266" y="60" width="24" height="24" rx="3" style="fill:#f1f2f0;stroke:var(--tb-border)"/><text class="lbl" x="298" y="70">本体: PP / 白 W-01</text><text class="k-note" x="298" y="84">シボ 浅め・半つや</text><rect x="266" y="106" width="24" height="24" rx="3" style="fill:#6b7078;stroke:var(--tb-border)"/><text class="lbl" x="298" y="116">ハンドル・ふた: PP / グレー G-12</text><text class="k-note" x="298" y="130">シボ 深め (滑り止め)</text><rect x="266" y="154" width="24" height="24" rx="3" style="fill:#e8742c;stroke:var(--tb-border)"/><text class="lbl" x="298" y="164">スイッチ: PC / オレンジ A-03</text><text class="k-note" x="298" y="178">鏡面・アクセント</text>
</svg>
<p class="tb-caption">図: CMF シートの例。白い本体に同系のグレー、操作部だけ彩度の高いアクセント色 (色番号は架空)</p>
<h2>CMF を決める手順</h2>
<ol class="tb-flow">
  <li><b>狙いの印象を言葉にする</b> — 「清潔」「道具らしい」「温かい」など 2〜3 語</li>
  <li><b>基調色・副色・アクセントの面積比を決める</b> — 目安は 70 : 25 : 5。アクセントは操作部や注意箇所に限る</li>
  <li><b>部品の機能から素材を選ぶ</b> — 熱・薬品・摩耗・触感・コスト</li>
  <li><b>仕上げを決める</b> — 触れる所は傷・指紋が目立たないシボ、見せ場だけ鏡面など</li>
  <li><b>実物見本で確認する</b> — 画面の色は実物と違う。照明 (昼光・電球色) を変えて確認し、限度見本を作る</li>
</ol>
<p><b>製品例</b>: キッチン家電は清潔感から白・明るいグレーが多く、熱くなる部分は耐熱樹脂。電動工具は現場で見つけやすい彩度の高い本体色と、黒いエラストマーのグリップで「道具らしさ」を出す。オーディオ機器はアルミのヘアラインやアルマイトで精密感を表す — 素材の選択が製品のカテゴリーを語っています。</p>
<h2>よくある失敗</h2>
<ul>
  <li><b>画面上の色だけで決める</b>: ディスプレイの発色・照明で印象が大きく変わる。必ず実物の色見本で</li>
  <li><b>異素材で同じ色を指定</b>: 樹脂と塗装金属では同じ色番号でも見え方が違う (メタメリズム)。並ぶ部品は同時に確認する</li>
  <li><b>黒の鏡面を広い面に</b>: 指紋・ほこり・小傷・ヒケが最も目立つ組み合わせ</li>
  <li><b>アクセント色の使いすぎ</b>: 目立たせたい所が多いと、どこも目立たなくなる</li>
</ul>
<div class="tb-tip"><b>3DCAD Studio</b>: 材料を設定して「リアル表示」にすると、金属・樹脂の質感で見え方を確認できます。高解像度画像を保存してデザイン検討に使いましょう。</div>`,
    points: ["CMF = 色・素材・仕上げ — 印象と品質感を決める", "明度は重さの印象、彩度の高い色はアクセントと注意表示に", "アルマイト・塗装・めっき・シボなど表面処理は機能 (防錆・耐摩耗) と見た目を両立", "環境・傷・ブランド・コストを考えて選ぶ"],
    exercises: [
      {
        q: "屋外で使う、手で頻繁に触るアルミ製ハンドルの仕上げを提案し、理由を述べてください。",
        a: "例: <b>ブラスト + アルマイト (黒または素地色)</b>。アルマイトで耐食性・耐摩耗性を確保し、ブラストのつや消しで指紋・小傷を目立たなくする。屋外の紫外線で染料が退色しにくい色 (素地・黒) を選ぶ。",
      },
      {
        q: "幼児向けの音の出るおもちゃ (樹脂製) の CMF を、基調色・副色・アクセントの面積比の目安 70 : 25 : 5 を使って提案してください。",
        a: "例: 基調色 <b>70 %</b> = 明るいクリーム色の本体 (ABS、浅いシボで傷を目立たせない)、副色 <b>25 %</b> = くすみの水色のパーツ、アクセント <b>5 %</b> = 押すボタンだけ彩度の高い赤やオレンジ (鏡面)。押す所が一目で分かり、全体は落ち着く。口に入れることを考え、食品衛生・玩具安全基準に適合する材料と着色剤を使う。",
      },
      {
        q: "白い樹脂の本体に白く塗装したアルミのふたを組み合わせたら、蛍光灯の下では同じ色に見えたのに、店頭の電球色照明では色が違って見えました。原因と対策を答えてください。",
        a: "原因は<b>メタメリズム (条件等色)</b>: 素材・顔料が違うと、光源によって色の見え方が変わる。対策: ① 両部品を<b>複数の光源 (昼光・電球色・蛍光灯)</b> で並べて確認する、② 色見本を同じ光源条件で承認する、③ 同色に見せる必要がない設計 (あえて色や質感を変える) も検討する。",
      },
    ],
    quiz: [
      { q: "JIS の安全色で「注意」を表す色は?", choices: ["赤", "黄", "青"], answer: 1, explain: "黄は注意、赤は禁止・停止・防火、青は指示、緑は安全です。" },
      { q: "アルミ部品の代表的な表面処理は?", choices: ["アルマイト (陽極酸化)", "黒染め", "焼入れ"], answer: 0, explain: "アルマイトは酸化皮膜を作って耐食性・耐摩耗性を上げ、染色もできます。" },
      { q: "CMF の面積配分で、彩度の高いアクセント色を使うのに適した所は?", choices: ["本体の外装全体", "操作部や注意箇所など小さな面積", "底面"], answer: 1, explain: "アクセントは小面積に限ると、見てほしい所 (操作部・注意) に視線を集められます。" },
      { q: "広い面に使うと指紋・小傷が最も目立ちやすい仕上げは?", choices: ["明るい色のシボ", "黒の鏡面", "ブラスト + アルマイト"], answer: 1, explain: "黒の鏡面は映り込みが強く、指紋・傷・ヒケが目立ちます。" },
    ],
  },
  {
    id: "ucd",
    part: "design",
    title: "ユーザ中心設計とプロトタイピング",
    minutes: 15,
    level: 2,
    lead: "良い製品は、作り手の思い込みではなく、使う人の観察から生まれます。ユーザを理解し、試作と評価を素早く繰り返す進め方を学びます。",
    body: `
<h2>ユーザ中心設計 (人間中心設計) のサイクル</h2>
<ol class="tb-flow">
  <li><b>理解する</b> — 使う人・場面を観察し、話を聞く (困りごと・回避策・本当の目的)</li>
  <li><b>定義する</b> — ペルソナ (代表的な利用者像) と、解くべき課題を明確にする</li>
  <li><b>発想する</b> — たくさんの案を出す (質より量、批判しない)</li>
  <li><b>試作する</b> — 早く・安く形にする</li>
  <li><b>評価する</b> — 実際の利用者に使ってもらい、観察する → 1 に戻る</li>
</ol>
<svg class="tb-chart" viewBox="0 0 520 222" role="img" aria-label="ユーザ中心設計のサイクル">
<circle cx="260" cy="124" r="80" fill="none" style="stroke:var(--tb-border)" stroke-width="10"/><path class="k-move" d="M280.7,46.7 A80,80 0 0 1 327.1,80.4"/><path class="k-move" d="M339.9,119.8 A80,80 0 0 1 322.2,174.3"/><path class="k-move" d="M288.7,198.7 A80,80 0 0 1 231.3,198.7"/><path class="k-move" d="M197.8,174.3 A80,80 0 0 1 180.1,119.8"/><path class="k-move" d="M192.9,80.4 A80,80 0 0 1 239.3,46.7"/><circle r="7" style="fill:var(--tb-accent)" class="k-glow"><animateMotion dur="8s" repeatCount="indefinite" path="M260,44 A80,80 0 1 1 259.9,44"/></circle><circle cx="260" cy="44" r="15" style="fill:var(--tb-surface);stroke:var(--tb-accent)" stroke-width="2"/><text class="k-title" x="260" y="48.5" text-anchor="middle" style="fill:var(--tb-accent)">1</text><text class="lbl" x="260" y="18" text-anchor="middle">理解する</text><circle cx="336.1" cy="99.3" r="15" style="fill:var(--tb-surface);stroke:var(--tb-accent)" stroke-width="2"/><text class="k-title" x="336.1" y="103.8" text-anchor="middle" style="fill:var(--tb-accent)">2</text><text class="lbl" x="362" y="108" text-anchor="start">定義する</text><circle cx="307" cy="188.7" r="15" style="fill:var(--tb-surface);stroke:var(--tb-accent)" stroke-width="2"/><text class="k-title" x="307" y="193.2" text-anchor="middle" style="fill:var(--tb-accent)">3</text><text class="lbl" x="330" y="208" text-anchor="start">発想する</text><circle cx="213" cy="188.7" r="15" style="fill:var(--tb-surface);stroke:var(--tb-accent)" stroke-width="2"/><text class="k-title" x="213" y="193.2" text-anchor="middle" style="fill:var(--tb-accent)">4</text><text class="lbl" x="190" y="208" text-anchor="end">試作する</text><circle cx="183.9" cy="99.3" r="15" style="fill:var(--tb-surface);stroke:var(--tb-accent)" stroke-width="2"/><text class="k-title" x="183.9" y="103.8" text-anchor="middle" style="fill:var(--tb-accent)">5</text><text class="lbl" x="158" y="108" text-anchor="end">評価する</text><circle cx="260" cy="124" r="34" style="fill:var(--tb-surface-2);stroke:var(--tb-border)"/><text class="sec" x="260" y="129" text-anchor="middle">くり返す</text>
</svg>
<p class="tb-caption">図: 5 つの段階は一周で終わらず、評価の結果をもとに何度も回す (点は回る様子を示す)</p>
<h2>観察のコツ</h2>
<ul>
  <li>「何が欲しいですか」と聞くより、<b>実際に使っている様子を見る</b>。人は自分の行動をうまく説明できない</li>
  <li>メモ書き・テープで補修されている所は、製品が要求を満たしていない証拠</li>
  <li>熟練者だけでなく、初めての人・高齢者・左利きなど<b>多様な利用者</b>を見る</li>
</ul>
<h2>プロトタイプの段階</h2>
<table class="tb-table">
  <tr><th>段階</th><th>作り方</th><th>確かめること</th></tr>
  <tr><td>スケッチ・ラフモデル</td><td>紙・スチレンボード・粘土</td><td>大きさ・持った感じ・全体の雰囲気</td></tr>
  <tr><td>3D プリント試作</td><td>3D CAD + 3D プリンタ</td><td>形状・はめあい・操作感・組立</td></tr>
  <tr><td>外観試作 (モックアップ)</td><td>切削・塗装</td><td>色・質感・最終の見た目</td></tr>
  <tr><td>機能試作</td><td>量産に近い材料と工法</td><td>強度・耐久・性能</td></tr>
</table>
<p>早い段階ほど<b>安く・粗く・たくさん</b>作るのがコツです。完成度の高い試作に時間をかけすぎると、問題が見つかっても方向転換しにくくなります。</p>
<svg class="tb-chart" viewBox="0 0 520 230" role="img" aria-label="試作の完成度とコスト">
<line class="grid" x1="50" y1="70" x2="500" y2="70"/><line class="grid" x1="50" y1="130" x2="500" y2="130"/><line class="axis" x1="50" y1="190" x2="500" y2="190"/><line class="axis" x1="50" y1="190" x2="50" y2="18"/><text class="lbl" x="58" y="24">1 回あたりの費用・時間</text><rect class="k-accent" x="70" y="170" width="70" height="20" rx="3" opacity="1.0"/><text class="tick" x="105" y="206" text-anchor="middle">紙・粘土</text><rect class="k-accent" x="170" y="145" width="70" height="45" rx="3" opacity="0.8"/><text class="tick" x="205" y="206" text-anchor="middle">3D プリント</text><rect class="k-accent" x="270" y="110" width="70" height="80" rx="3" opacity="0.6"/><text class="tick" x="305" y="206" text-anchor="middle">外観試作</text><rect class="k-accent" x="370" y="70" width="70" height="120" rx="3" opacity="0.45"/><text class="tick" x="405" y="206" text-anchor="middle">機能試作</text><g class="k-shadow"><path d="M88,164 L118,160 L120,140 L90,144 Z" style="fill:#fbfaf6;stroke:var(--k-line)" stroke-width="1.2"/></g><path class="k-thin" d="M94,150 C100,146 106,152 114,146 M95,156 L112,154"/><g class="k-shadow"><rect class="k-plastic" x="190" y="114" width="30" height="24" rx="3"/></g><path class="k-thin" d="M191,120 L219,120 M191,125 L219,125 M191,130 L219,130 M191,135 L219,135"/><g class="k-shadow"><rect class="k-accent" x="288" y="78" width="34" height="24" rx="8"/></g><path d="M294,82 L316,82" fill="none" style="stroke:#ffffff" stroke-width="1.6" opacity="0.9"/><g class="k-shadow"><rect class="k-alu" x="388" y="38" width="34" height="26" rx="4"/></g><circle cx="399" cy="51" r="6" fill="none" style="stroke:var(--k-line)" stroke-width="1.4" stroke-dasharray="2 1.5"/><rect x="408" y="45" width="10" height="12" rx="1" class="k-plastic" stroke-width="1"/><text class="lbl" x="495" y="222" text-anchor="end">完成度 →</text><path class="k-move" d="M120,40 C220,30 300,24 360,30" style="stroke:var(--tb-text-3);marker-end:url(#k-arrow)" stroke-dasharray="4 3"/><text class="k-note" x="150" y="52">安く・たくさん → 高く・少なく</text>
</svg>
<p class="tb-caption">図: 初期は安い試作をたくさん、後半ほど高価な試作を少なく (数値は相対的な目安)</p>
<h2>ユーザビリティ評価</h2>
<ul>
  <li>代表的な作業 (タスク) を決め、5 人程度に試してもらうだけでも主な問題の多くが見つかる</li>
  <li>説明せずに使ってもらい、迷った所・間違えた所・かかった時間を記録する</li>
  <li>「使いやすいですか?」ではなく、行動を観察する</li>
</ul>
<h2>見つかった問題に優先順位をつける</h2>
<p>ユーザテストでは多くの問題が見つかります。すべてを直す時間はないので、<b>深刻度 (起きたときの影響)</b> と <b>発生頻度 (何人中何人が困ったか)</b> で並べ、右上から直します。</p>
<svg class="tb-chart" viewBox="0 0 520 230" role="img" aria-label="深刻度と頻度による問題の優先度マトリクス">
<rect x="90" y="20" width="190" height="90" style="fill:var(--tb-warn)" opacity="0.18"/><rect x="280" y="20" width="190" height="90" style="fill:var(--tb-bad)" opacity="0.22"/><rect x="90" y="110" width="190" height="90" style="fill:var(--tb-good)" opacity="0.15"/><rect x="280" y="110" width="190" height="90" style="fill:var(--tb-warn)" opacity="0.18"/><line class="axis" x1="90" y1="200" x2="476" y2="200"/><line class="axis" x1="90" y1="200" x2="90" y2="14"/><line class="grid" x1="280" y1="20" x2="280" y2="200"/><line class="grid" x1="90" y1="110" x2="470" y2="110"/><text class="lbl" x="470" y="218" text-anchor="end">発生頻度 (困った人の割合) →</text><text class="lbl" x="84" y="24" text-anchor="end">深刻度</text><text class="lbl" x="84" y="40" text-anchor="end">↑</text><text class="k-bad-t" x="375" y="44" text-anchor="middle">すぐ直す</text><text class="mark-t" x="185" y="44" text-anchor="middle">早めに直す</text><text class="mark-t" x="375" y="134" text-anchor="middle">直す (簡単なら即)</text><text class="k-good-t" x="185" y="134" text-anchor="middle">記録して後回し</text><circle cx="400" cy="80" r="7" style="fill:var(--tb-accent)"/><text class="k-note" x="412" y="84">A ふたを逆に</text><circle cx="180" cy="70" r="7" style="fill:var(--tb-accent)"/><text class="k-note" x="192" y="74">B 刃に指が近づく</text><circle cx="360" cy="168" r="7" style="fill:var(--tb-accent)"/><text class="k-note" x="372" y="172">C ボタン名が分かりにくい</text><circle cx="150" cy="176" r="7" style="fill:var(--tb-accent)"/><text class="k-note" x="162" y="180">D 色の好み</text>
</svg>
<p class="tb-caption">図: 問題を深刻度と頻度で配置する。安全にかかわる問題 (B) は頻度が低くても必ず対策する</p>
<h2>例題: 何人でテストすればよいか</h2>
<p>1 人の利用者がある問題に出会う確率を p とすると、n 人のテストで少なくとも 1 人がその問題に出会う確率は <b>1 − (1 − p)<sup>n</sup></b> です。
p = 0.31 (よく引用される平均的な値) なら、5 人で 1 − 0.69<sup>5</sup> ≈ <b>0.84</b>、つまり問題の約 8 割が見つかる計算です。
ただし p が小さい (まれな) 問題は 5 人では見つからないので、<b>5 人のテストを、直しながら何回も回す</b>ほうが、1 回に 20 人集めるより効率的です。</p>
<h2>製品例で考える観察</h2>
<ul>
  <li><b>キッチンばさみ</b>: 調理中は手がぬれている・油がついている。乾いた手での試用では滑りの問題に気づけない — <b>実際の場面</b>で試す</li>
  <li><b>家電のリモコン</b>: 暗い部屋で手探りで使う。ボタンの形や突起で区別できるか</li>
  <li><b>工具</b>: 手袋をした状態、上向き・狭い所など無理な姿勢で使えるか</li>
</ul>
<h2>よくある失敗</h2>
<ul>
  <li><b>社内の人だけでテスト</b>: 製品を知りすぎていて、初めての人の迷いが再現できない</li>
  <li><b>誘導してしまう</b>: 「このボタンを押してみてください」と言うと、迷う様子が見えない。目的だけを伝える</li>
  <li><b>試作を作り込みすぎる</b>: 外観まで仕上げた試作は、評価者も遠慮して否定しにくくなる</li>
  <li><b>結果を記録しない</b>: 発言・行動・時間を記録し、次の改良と比較できるようにする</li>
</ul>
<div class="tb-tip"><b>3DCAD Studio</b>: パラメータで寸法違いの案を素早く作り、3D プリント チェック → STL / 3MF 書き出しで試作できます。試作で得た気づきを改訂履歴に記録しておきましょう。</div>`,
    points: ["理解 → 定義 → 発想 → 試作 → 評価 を繰り返す", "聞くより観察する。多様な利用者を見る", "試作は早く・安く・粗く・たくさん", "少人数のユーザテストでも多くの問題が見つかる"],
    exercises: [
      {
        q: "新しい電動ドライバーのグリップ形状を検討します。最初の 1 週間でできる試作と評価の計画を立ててください。",
        a: "例: ① 3D CAD で握り径 30・35・40 mm、角度 2 種類の 6 案をパラメータで作る。② 3D プリントで試作 (外形のみ、中は空洞でよい)。③ 手の大きさの違う 5〜6 人に、ねじ締めの動作をしてもらい、握りやすさ・疲れ・力の入り方を観察・記録。④ 結果から 2 案に絞り、重さ (重心) を再現した試作で再評価。",
      },
      {
        q: "1 人が問題に出会う確率 p = 0.1 のまれな問題を、80 % 以上の確率で見つけるには、最低何人のテストが必要ですか?",
        a: "1 − 0.9<sup>n</sup> ≥ 0.8 → 0.9<sup>n</sup> ≤ 0.2 → n ≥ log 0.2 / log 0.9 ≈ 15.3 → <b>16 人</b>。5 人では 1 − 0.9<sup>5</sup> ≈ 0.41 しか見つかりません。まれな問題は回数を重ねるか、対象を絞った追加テストで探します。",
      },
      {
        q: "5 人のテストで次の問題が見つかりました。直す順番を理由とともに答えてください。(a) 5 人中 4 人が電源ボタンを探して 10 秒以上迷った、(b) 1 人が組立時に指を挟みそうになった、(c) 2 人が本体色が地味と言った。",
        a: "① <b>(b)</b>: 頻度は低いが安全にかかわる深刻な問題なので最優先。② <b>(a)</b>: 頻度が高く、基本操作を妨げる。③ <b>(c)</b>: 好みの問題で深刻度が低い。記録して CMF 検討時に参考にする。",
      },
    ],
    quiz: [
      { q: "ユーザ調査で最も信頼できる情報源は?", choices: ["「何が欲しいか」のアンケート", "実際に使っている様子の観察", "開発者の経験"], answer: 1, explain: "人は自分の行動や要求をうまく言葉にできないため、観察が重要です。" },
      { q: "初期のプロトタイプの作り方として適切なのは?", choices: ["量産と同じ材料で精密に 1 つ作る", "紙や 3D プリントで粗く・たくさん作る", "作らずに図面だけで判断する"], answer: 1, explain: "初期は安く早く多くの案を試し、学びを得ることが目的です。" },
      { q: "ユーザテストの進め方として適切なのは?", choices: ["操作手順を説明してから使ってもらう", "目的だけを伝え、迷う様子を観察する", "開発チームのメンバーだけで試す"], answer: 1, explain: "手順を教えると迷いが見えなくなります。初めての利用者に目的だけ伝えて観察します。" },
      { q: "見つかった問題の優先順位を決める 2 つの軸は?", choices: ["深刻度と発生頻度", "コストと納期", "色と形"], answer: 0, explain: "深刻で頻繁な問題から直します。安全にかかわる問題は頻度が低くても優先します。" },
    ],
  },
];
