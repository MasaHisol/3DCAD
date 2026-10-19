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

<div class="tb-tip"><b>3DCAD Studio</b>: ユーザ パラメータで主要寸法の比率を式にしておくと (例: 奥行 = 幅 / 1.618)、比率を保ったまま大きさを検討できます。
「リアル表示」で質感と光の当たり方を確認しましょう。</div>`,
    points: ["デザイン = 使い方が伝わり、作れて、ブランドらしい形", "比率 (黄金比 1:1.618、白銀比 1:√2) は全体を整えるものさし", "R・線・要素をそろえて統一感", "暗い・大きい・下の要素は重く見える"],
    exercises: [
      {
        q: "幅 160 mm の製品の奥行を黄金比で決めると何 mm ですか? 白銀比ではどうですか?",
        a: "黄金比: 160 / 1.618 ≈ <b>99 mm</b>。白銀比: 160 / 1.414 ≈ <b>113 mm</b>。",
      },
    ],
    quiz: [
      { q: "A4 用紙の縦横比は?", choices: ["1 : 1.618 (黄金比)", "1 : √2 (白銀比)", "3 : 4"], answer: 1, explain: "A 判・B 判は半分に折っても同じ比率になる 1 : √2 です。" },
      { q: "製品に統一感を出す方法として適切なのは?", choices: ["部品ごとに違う角の R を使う", "角の R や合わせ目の線をそろえる", "色の種類を増やす"], answer: 1, explain: "R・線・色・素材の種類をそろえ、要素を減らすと統一感が出ます。" },
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
<path d="M90,160 C155,158 190,46 260,46 C330,46 365,158 430,160 Z" style="fill:var(--tb-surface-2)" stroke="none"/><clipPath id="dz-pc"><rect x="168" y="30" width="184" height="131"/></clipPath><path clip-path="url(#dz-pc)" d="M90,160 C155,158 190,46 260,46 C330,46 365,158 430,160 Z" style="fill:var(--tb-accent)" opacity="0.22"/><path d="M90,160 C155,158 190,46 260,46 C330,46 365,158 430,160" fill="none" style="stroke:var(--tb-text)" stroke-width="2"/><line class="axis" x1="70" y1="160" x2="450" y2="160"/><path class="guide" d="M168,160 L168,104 M352,160 L352,104 M260,160 L260,46"/><text class="tick" x="168" y="176" text-anchor="middle">5 %ile</text><text class="tick" x="260" y="176" text-anchor="middle">50 %ile (平均付近)</text><text class="tick" x="352" y="176" text-anchor="middle">95 %ile</text><text class="k-note" x="260" y="128" text-anchor="middle">90 % の人</text><line class="k-dimline" x1="168" y1="140" x2="352" y2="140"/><text class="mark-t" x="120" y="80" text-anchor="middle">届く距離は</text><text class="mark-t" x="120" y="96" text-anchor="middle">小さい人に</text><text class="mark-t" x="400" y="80" text-anchor="middle">通る空間は</text><text class="mark-t" x="400" y="96" text-anchor="middle">大きい人に</text><path class="k-move" d="M120,102 C130,120 150,128 164,130"/><path class="k-move" d="M400,102 C390,120 370,128 356,130"/><line class="axis" x1="10" y1="160" x2="60" y2="160"/><g class="k-shadow"><rect x="29.7" y="127" width="5.6" height="33" rx="2" style="fill:var(--k-steel-3);stroke:var(--k-line)" stroke-width="1"/><rect x="36.7" y="127" width="5.6" height="33" rx="2" style="fill:var(--k-steel-3);stroke:var(--k-line)" stroke-width="1"/><path class="k-plastic" d="M41.9,104.6 L46.6,82.1 L50.5,82.8 L45.9,108.5 Z" stroke-width="1"/><circle class="k-skin" cx="48.5" cy="80.1" r="2.6"/><rect class="k-plastic" x="25.1" y="104.6" width="4" height="23.8" rx="2" stroke-width="1"/><circle class="k-skin" cx="27.1" cy="129.6" r="2.3"/><rect class="k-plastic" x="28.7" y="103.2" width="14.5" height="26.4" rx="3.3" stroke-width="1.2"/><circle class="k-skin" cx="36" cy="98.5" r="4.5"/></g><line class="axis" x1="458" y1="160" x2="512" y2="160"/><path class="k-edge" d="M462,160 L462,44 L508,44 L508,160" style="stroke:var(--k-line-2)"/><g class="k-shadow"><rect x="475.1" y="108" width="8.8" height="52" rx="3.1" style="fill:var(--k-steel-3);stroke:var(--k-line)" stroke-width="1"/><rect x="486" y="108" width="8.8" height="52" rx="3.1" style="fill:var(--k-steel-3);stroke:var(--k-line)" stroke-width="1"/><rect class="k-accent" x="495.9" y="72.6" width="6.2" height="37.4" rx="3.1" stroke-width="1"/><circle class="k-skin" cx="499" cy="112.2" r="3.6"/><rect class="k-accent" x="467.8" y="72.6" width="6.2" height="37.4" rx="3.1" stroke-width="1"/><circle class="k-skin" cx="471" cy="112.2" r="3.6"/><rect class="k-accent" x="473.6" y="70.6" width="22.9" height="41.6" rx="5.2" stroke-width="1.2"/><circle class="k-skin" cx="485" cy="63.1" r="7.1"/></g><text class="k-note" x="36" y="176" text-anchor="middle">小柄</text><text class="k-note" x="485" y="176" text-anchor="middle">大柄</text><text class="lbl" x="260" y="200" text-anchor="middle">平均に合わせると、残り半分の人には合わない</text>
</svg>
<p class="tb-caption">図: 人体寸法の分布。5〜95 パーセンタイルの範囲 (90 % の人) をカバーするのが一般的な目安</p>
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
<div class="tb-tip"><b>3DCAD Studio</b>: 人の手や体の簡単なモデル (円柱・直方体) をアセンブリに置いて、操作部の位置やすき間を確認すると、図面だけでは気づかない使いにくさが見えてきます。</div>`,
    points: ["届く距離は小さい人、通れる空間は大きい人に合わせる (パーセンタイル)", "握りは直径 30〜40 mm、ボタンは 10 mm 程度以上", "形で使い方を示し、配置を対応させ、フィードバックを返す", "挟み込み・鋭い縁をなくす"],
    exercises: [
      {
        q: "壁掛けの操作盤の最も高いスイッチの位置を決めます。だれの寸法を基準にすべきですか? その理由は?",
        a: "体の<b>小さい利用者 (例: 女性の 5 パーセンタイル、車いす利用者を含めるならその手の届く範囲)</b> を基準にします。小さい人が届けば、大きい人も届くからです。",
      },
    ],
    quiz: [
      { q: "扉の高さを決めるときに基準にする人体寸法は?", choices: ["小さい人 (5 パーセンタイル)", "平均の人", "大きい人 (95 パーセンタイル以上)"], answer: 2, explain: "通れる空間は大きい人に合わせます。" },
      { q: "コンロのつまみの並びを火口の並びと同じ配置にするのは、どの原則?", choices: ["フィードバック", "対応づけ (マッピング)", "比率"], answer: 1, explain: "操作部と動くもの (火口) の位置関係をそろえるのがマッピングです。" },
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
<div class="tb-tip"><b>3DCAD Studio</b>: 材料を設定して「リアル表示」にすると、金属・樹脂の質感で見え方を確認できます。高解像度画像を保存してデザイン検討に使いましょう。</div>`,
    points: ["CMF = 色・素材・仕上げ — 印象と品質感を決める", "明度は重さの印象、彩度の高い色はアクセントと注意表示に", "アルマイト・塗装・めっき・シボなど表面処理は機能 (防錆・耐摩耗) と見た目を両立", "環境・傷・ブランド・コストを考えて選ぶ"],
    exercises: [
      {
        q: "屋外で使う、手で頻繁に触るアルミ製ハンドルの仕上げを提案し、理由を述べてください。",
        a: "例: <b>ブラスト + アルマイト (黒または素地色)</b>。アルマイトで耐食性・耐摩耗性を確保し、ブラストのつや消しで指紋・小傷を目立たなくする。屋外の紫外線で染料が退色しにくい色 (素地・黒) を選ぶ。",
      },
    ],
    quiz: [
      { q: "JIS の安全色で「注意」を表す色は?", choices: ["赤", "黄", "青"], answer: 1, explain: "黄は注意、赤は禁止・停止・防火、青は指示、緑は安全です。" },
      { q: "アルミ部品の代表的な表面処理は?", choices: ["アルマイト (陽極酸化)", "黒染め", "焼入れ"], answer: 0, explain: "アルマイトは酸化皮膜を作って耐食性・耐摩耗性を上げ、染色もできます。" },
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
<div class="tb-tip"><b>3DCAD Studio</b>: パラメータで寸法違いの案を素早く作り、3D プリント チェック → STL / 3MF 書き出しで試作できます。試作で得た気づきを改訂履歴に記録しておきましょう。</div>`,
    points: ["理解 → 定義 → 発想 → 試作 → 評価 を繰り返す", "聞くより観察する。多様な利用者を見る", "試作は早く・安く・粗く・たくさん", "少人数のユーザテストでも多くの問題が見つかる"],
    exercises: [
      {
        q: "新しい電動ドライバーのグリップ形状を検討します。最初の 1 週間でできる試作と評価の計画を立ててください。",
        a: "例: ① 3D CAD で握り径 30・35・40 mm、角度 2 種類の 6 案をパラメータで作る。② 3D プリントで試作 (外形のみ、中は空洞でよい)。③ 手の大きさの違う 5〜6 人に、ねじ締めの動作をしてもらい、握りやすさ・疲れ・力の入り方を観察・記録。④ 結果から 2 案に絞り、重さ (重心) を再現した試作で再評価。",
      },
    ],
    quiz: [
      { q: "ユーザ調査で最も信頼できる情報源は?", choices: ["「何が欲しいか」のアンケート", "実際に使っている様子の観察", "開発者の経験"], answer: 1, explain: "人は自分の行動や要求をうまく言葉にできないため、観察が重要です。" },
      { q: "初期のプロトタイプの作り方として適切なのは?", choices: ["量産と同じ材料で精密に 1 つ作る", "紙や 3D プリントで粗く・たくさん作る", "作らずに図面だけで判断する"], answer: 1, explain: "初期は安く早く多くの案を試し、学びを得ることが目的です。" },
    ],
  },
];
