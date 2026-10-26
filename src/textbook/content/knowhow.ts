import type { TextChapter } from "../types";

export const KNOWHOW: TextChapter[] = [
  {
    id: "dfm-machining",
    part: "knowhow",
    title: "切削加工を考えた設計",
    minutes: 20,
    level: 2,
    lead: "フライス盤・旋盤・マシニングセンタで作る部品は、工具の形と動きで「作れる形」と「コスト」が決まります。加工者に喜ばれる設計のポイントをまとめます。",
    body: `
<h2>工具の形を思い浮かべる</h2>
<ul>
  <li><b>内側の角 (入隅) には R が残る</b>: エンドミルは丸いので、ポケットの内角は工具半径以上の R になる。R を指示しないと加工できないか、放電加工などで高価になる。深いポケットほど太い工具が必要で R も大きくなる</li>
  <li><b>外側の角</b>は鋭くできるが、バリ取りのため C0.5 程度の面取りを「指示なき角は C0.5」などと一括指示するのが一般的</li>
  <li><b>深いポケット・細い溝</b>は細長い工具が必要でびびりやすい。深さは工具径の 3〜4 倍以内が目安</li>
  <li><b>ドリル穴</b>の底は 118° の円すいになる。止まり穴の深さは径の 3〜5 倍以内が楽 (深穴は専用の加工が必要)</li>
  <li><b>ねじ穴</b>は下穴深さをねじ深さより長く (+3 ピッチ程度) とり、止まり穴の奥まで完全ねじにしない</li>
</ul>
<svg class="tb-chart" viewBox="0 0 520 236" role="img" aria-label="エンドミルと入隅 R">
<rect class="k-panel" x="8" y="8" width="244" height="220" rx="8"/><rect class="k-panel" x="268" y="8" width="244" height="220" rx="8"/>
<circle class="k-badge" cx="28" cy="28" r="10" style="fill:var(--tb-bad)"/><text class="k-badge-t" x="28" y="32" text-anchor="middle">✕</text><text class="k-title" x="46" y="32">図面: 入隅 R なし (直角)</text>
<circle class="k-badge" cx="288" cy="28" r="10" style="fill:var(--tb-good)"/><text class="k-badge-t" x="288" y="32" text-anchor="middle">✓</text><text class="k-title" x="306" y="32">入隅 R ≥ 工具半径</text>
<g class="k-shadow"><rect class="k-alu" x="30" y="52" width="200" height="140" rx="3"/><rect class="k-alu" x="290" y="52" width="200" height="140" rx="3"/></g>
<path d="M50,70 L210,70 L210,180 L50,180 Z" style="fill:var(--tb-surface-2);stroke:var(--k-line)" stroke-width="1.4"/>
<path d="M210,70 L194,70 A16,16 0 0 1 210,86 Z" style="fill:var(--tb-bad)"/>
<polyline class="k-hidden" points="90,86 194,86 194,150"/>
<g><animateTransform attributeName="transform" type="translate" values="90 86;194 86;194 150;194 86;90 86" keyTimes="0;0.4;0.6;0.8;1" dur="6s" repeatCount="indefinite" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1;.45 0 .55 1;.45 0 .55 1"/>
<circle r="16" class="k-accent" style="fill-opacity:0.88"/>
<g><animateTransform attributeName="transform" type="rotate" values="0;360" dur="0.8s" repeatCount="indefinite"/><path d="M0,-15 L0,15 M-15,0 L15,0" fill="none" style="stroke:var(--tb-surface)" stroke-width="1.6"/><path d="M0,-15 A15,15 0 0 1 15,0" fill="none" style="stroke:var(--tb-surface)" stroke-width="1"/></g>
<circle r="2.5" style="fill:var(--k-line)"/></g>
<text class="k-bad-t" x="92" y="134" text-anchor="middle">削り残し</text>
<line x1="124" y1="126" x2="203" y2="78" style="stroke:var(--tb-bad);marker-end:url(#k-arrow-red)" class="k-move"/>
<text class="k-note" x="130" y="210" text-anchor="middle">工具 (円) は丸いので角に届かない</text>
<path d="M310,70 L450,70 A20,20 0 0 1 470,90 L470,180 L310,180 Z" style="fill:var(--tb-surface-2);stroke:var(--k-line)" stroke-width="1.4"/>
<polyline class="k-hidden" points="350,86 450,86 454,90 454,150"/>
<g><animateTransform attributeName="transform" type="translate" values="350 86;450 86;454 90;454 150;454 90;450 86;350 86" keyTimes="0;0.38;0.42;0.6;0.78;0.82;1" dur="6s" repeatCount="indefinite" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1;.45 0 .55 1;.45 0 .55 1;.45 0 .55 1;.45 0 .55 1"/>
<circle r="16" class="k-accent" style="fill-opacity:0.88"/>
<g><animateTransform attributeName="transform" type="rotate" values="0;360" dur="0.8s" repeatCount="indefinite"/><path d="M0,-15 L0,15 M-15,0 L15,0" fill="none" style="stroke:var(--tb-surface)" stroke-width="1.6"/><path d="M0,-15 A15,15 0 0 1 15,0" fill="none" style="stroke:var(--tb-surface)" stroke-width="1"/></g>
<circle r="2.5" style="fill:var(--k-line)"/></g>
<text class="k-dimtext" x="330" y="160">R ≥ 工具半径</text>
<line class="k-ext" x1="404" y1="150" x2="463" y2="80" style="marker-end:url(#k-arrow-blue)"/>
<text class="k-good-t" x="390" y="210" text-anchor="middle">一筆で削れる</text>
</svg>
<p class="tb-caption">図: 上から見たポケット加工。エンドミル (円) は丸いため、直角の入隅には削り残しが出る (左)。工具半径より少し大きい R を指示すれば、工具が止まらず滑らかに回り込める (右)</p>
<svg class="tb-chart" viewBox="0 0 520 250" role="img" aria-label="ポケットの深さと工具の長さ">
<rect class="k-panel" x="8" y="8" width="244" height="234" rx="8"/><rect class="k-panel" x="268" y="8" width="244" height="234" rx="8"/>
<circle class="k-badge" cx="28" cy="28" r="10" style="fill:var(--tb-good)"/><text class="k-badge-t" x="28" y="32" text-anchor="middle">✓</text><text class="k-title" x="46" y="32">短く太い工具</text>
<circle class="k-badge" cx="288" cy="28" r="10" style="fill:var(--tb-bad)"/><text class="k-badge-t" x="288" y="32" text-anchor="middle">✕</text><text class="k-title" x="306" y="32">細長い工具</text>
<g class="k-shadow">
<path class="k-cut" d="M30,100 L100,100 L100,150 L160,150 L160,100 L200,100 L200,196 L30,196 Z"/>
<rect class="k-part" x="100" y="44" width="60" height="18" rx="3"/>
<rect class="k-part" x="115" y="62" width="30" height="86" rx="2"/>
</g>
<path d="M115,74 L145,90 M115,94 L145,110 M115,114 L145,130 M115,134 L141,147" class="k-thin"/>
<line class="k-center" x1="130" y1="38" x2="130" y2="158"/>
<line class="k-ext" x1="162" y1="150" x2="240" y2="150"/><line class="k-ext" x1="202" y1="100" x2="240" y2="100"/>
<line class="k-dimline" x1="234" y1="100" x2="234" y2="150"/><text class="k-dimtext" x="228" y="129" text-anchor="end">50</text>
<text class="k-dimtext" x="168" y="58">φ30</text>
<text class="k-good-t" x="130" y="220" text-anchor="middle">深さ 50 / φ30 ≈ 1.7 倍</text>
<text class="k-note" x="130" y="236" text-anchor="middle">剛性が高く速く削れる</text>
<path class="k-cut" d="M290,100 L385,100 L385,175 L395,175 L395,100 L490,100 L490,196 L290,196 Z" style="filter:url(#k-shadow)"/>
<g><animateTransform attributeName="transform" type="rotate" values="0 390 44;0.9 390 44;-0.9 390 44;0 390 44" dur="0.45s" repeatCount="indefinite"/>
<g class="k-shadow"><rect class="k-part" x="370" y="44" width="40" height="18" rx="3"/><rect class="k-part" x="386" y="62" width="8" height="111" rx="1.5"/></g></g>
<polyline points="383,140 380,144 383,148 380,152 383,156 380,160" fill="none" style="stroke:var(--tb-bad)" stroke-width="1.6"/>
<polyline points="397,140 400,144 397,148 400,152 397,156 400,160" fill="none" style="stroke:var(--tb-bad)" stroke-width="1.6"/>
<text class="k-bad-t" x="420" y="80">びびり・折損</text>
<line class="k-move" x1="440" y1="86" x2="404" y2="140" style="stroke:var(--tb-bad);marker-end:url(#k-arrow-red)"/>
<text class="k-bad-t" x="390" y="220" text-anchor="middle">深さ 30 / φ4 = 7.5 倍</text>
<text class="k-note" x="390" y="236" text-anchor="middle">たわんで精度・寿命が落ちる</text>
</svg>
<p class="tb-caption">図: 深さは工具径の 3〜4 倍以内が目安。深く細い溝ほど工具が長く細くなり、たわみ (びびり) が出る。止まった図でも、右の工具がたわみやすい形であることが読み取れる</p>
<p>入隅 R は加工のためだけでなく、強度にも効きます。下のアニメーションで角の R を変えると、力の流れ (力線) が角で詰まる様子と、応力集中がやわらぐ様子が見られます。</p>
<div data-widget="anim-stressflow"></div>
<h2>段取りと基準</h2>
<ul>
  <li><b>段取り (つかみ替え) の回数を減らす</b>: 加工する面が 1〜2 方向にまとまるよう形を工夫する。斜めの穴は段取りが増え高価</li>
  <li><b>基準面を決めて寸法を入れる</b>: 加工・測定の基準になる面から寸法を記入すると、誤差が累積しにくい</li>
  <li><b>つかめる所を残す</b>: 薄くて大きい板や細長い部品は固定しにくく、加工中に変形する</li>
</ul>
<h2>コストを下げるチェックポイント</h2>
<table class="tb-table">
  <tr><th>項目</th><th>高くなる設計</th><th>安くなる設計</th></tr>
  <tr><td>素材</td><td>特殊な寸法・材料</td><td>市販の板厚・丸棒径・角材 (削る量を減らす)</td></tr>
  <tr><td>公差</td><td>全寸法に ±0.01</td><td>機能に必要な所だけ厳しく、他は普通公差</td></tr>
  <tr><td>表面</td><td>全面 Ra 0.8</td><td>はめあい・摺動面だけ細かく</td></tr>
  <tr><td>形状</td><td>3D 曲面、深い溝、小さい内 R</td><td>平面・円筒の組み合わせ、大きめの R</td></tr>
  <tr><td>工具</td><td>穴径・R の種類が多い</td><td>穴径・R・ねじの種類をそろえる (工具交換が減る)</td></tr>
</table>
<svg class="tb-chart" viewBox="0 0 520 236" role="img" aria-label="止まりねじ穴の下穴深さ">
<rect class="k-panel" x="8" y="8" width="244" height="220" rx="8"/><rect class="k-panel" x="268" y="8" width="244" height="220" rx="8"/>
<circle class="k-badge" cx="28" cy="28" r="10" style="fill:var(--tb-bad)"/><text class="k-badge-t" x="28" y="32" text-anchor="middle">✕</text><text class="k-title" x="46" y="32">ねじが穴底まで</text>
<circle class="k-badge" cx="288" cy="28" r="10" style="fill:var(--tb-good)"/><text class="k-badge-t" x="288" y="32" text-anchor="middle">✓</text><text class="k-title" x="306" y="32">下穴をねじより深く</text>
<g class="k-shadow"><rect class="k-cut" x="40" y="60" width="180" height="140"/><rect class="k-cut" x="300" y="60" width="180" height="140"/></g>
<rect x="110" y="60" width="40" height="90" style="fill:var(--tb-surface-2);stroke:var(--k-line)" stroke-width="1.4"/>
<polyline class="k-edge" points="110,60 116,66 110,72 116,78 110,84 116,90 110,96 116,102 110,108 116,114 110,120 116,126 110,132 116,138 110,144 116,150"/><polyline class="k-edge" points="150,60 144,66 150,72 144,78 150,84 144,90 150,96 144,102 150,108 144,114 150,120 144,126 150,132 144,138 150,144 144,150"/>
<path d="M118,144 L142,144 L130,156 Z" style="fill:var(--tb-bad)"/><text class="k-bad-t" x="130" y="176" text-anchor="middle">タップが底付き・折損</text>
<text class="k-note" x="130" y="220" text-anchor="middle">完全ねじを穴底まで指示 → 加工不能</text>
<path d="M370,60 L410,60 L410,165 L390,177 L370,165 Z" style="fill:var(--tb-surface-2);stroke:var(--k-line)" stroke-width="1.4"/>
<polyline class="k-edge" points="370,60 376,66 370,72 376,78 370,84 376,90 370,96 376,102 370,108 376,114 370,120 376,126"/><polyline class="k-edge" points="410,60 404,66 410,72 404,78 410,84 404,90 410,96 404,102 410,108 404,114 410,120 404,126"/>
<line class="k-ext" x1="412" y1="128" x2="470" y2="128"/><line class="k-ext" x1="412" y1="165" x2="470" y2="165"/><line class="k-ext" x1="368" y1="60" x2="320" y2="60"/><line class="k-ext" x1="368" y1="128" x2="320" y2="128"/>
<line class="k-dimline" x1="326" y1="60" x2="326" y2="128"/><text class="k-dimtext" x="330" y="98">12</text>
<line class="k-ext" x1="412" y1="60" x2="470" y2="60"/><line class="k-dimline" x1="462" y1="60" x2="462" y2="165"/><text class="k-dimtext" x="458" y="116" text-anchor="end">15</text>
<text class="k-good-t" x="390" y="220" text-anchor="middle">M6 ねじ深さ 12 / 下穴 φ5 深さ 15</text>
</svg>
<p class="tb-caption">図: 止まりねじ穴の断面。タップの先端は食いつき部 (不完全ねじ) なので、下穴はねじ深さより 3 ピッチ程度深くとる。ドリル先端の 118° の円すいはさらにその下にできる</p>
<h2>加工の目安値</h2>
<table class="tb-table">
  <tr><th>項目</th><th>目安</th><th>理由</th></tr>
  <tr><td>ポケットの入隅 R</td><td>工具半径 + 0.5〜1 mm</td><td>工具が角で止まらず、送りを落とさずに回り込める</td></tr>
  <tr><td>ポケット深さ</td><td>工具径の 3〜4 倍以内</td><td>突き出しが長いと工具がたわみ、びびる</td></tr>
  <tr><td>止まり穴の深さ</td><td>穴径の 3〜5 倍以内</td><td>切りくずが詰まり、ドリルが折れやすい</td></tr>
  <tr><td>下穴深さ (止まりタップ)</td><td>ねじ深さ + 3 ピッチ程度</td><td>食いつき部の不完全ねじと切りくずの逃げ</td></tr>
  <tr><td>薄い壁</td><td>深さに対して厚さを確保 (アルミで 1 mm 以下は要相談)</td><td>加工中にたわみ、寸法・面が出ない</td></tr>
</table>
<h2>計算例: 加工時間をざっくり見積もる</h2>
<p>アルミのブロックに 60 × 40 × 深さ 20 mm のポケットを荒加工します。除去体積は 60 × 40 × 20 = 48 000 mm³ = 48 cm³。
仮に除去能率 (1 分あたり削れる体積) を 20 cm³/min とすると、荒加工は 48 / 20 = <b>2.4 分</b>。ここに仕上げ・工具交換・段取りが加わります。
入隅を R2 にすると φ4 の細い工具で角を仕上げる工程が増え、時間は大きく延びます。</p>
<h2>よくある失敗</h2>
<ul>
  <li>入隅 R を指示せず「直角」— 加工者が独断で R を付けるか、放電加工で高額になる</li>
  <li>止まり穴のねじを穴底まで指示 — タップ折損の原因</li>
  <li>測定できない寸法 (仮想交点や R の中心から) を指示 — 検査ができない</li>
  <li>6 面すべてに加工を配置 — 段取りが 6 回になる</li>
</ul>
<div class="tb-tip"><b>3DCAD Studio</b>: 「検査 → CAM」でポケット・輪郭・穴あけの工具経路と加工時間の目安を出せます。入隅 R が工具径より小さいとポケットの角が削り残されることを、工具経路で確かめてみましょう。</div>`,
    points: ["入隅には工具半径以上の R — 必ず指示する", "穴・溝の深さは径の 3〜5 倍以内が目安", "段取り回数を減らし、基準面から寸法を入れる", "公差・粗さは必要な所だけ。穴径・R の種類をそろえる"],
    exercises: [
      {
        q: "深さ 30 mm のポケットの内角を R2 と指示しました。何が問題で、どう直すべきですか?",
        a: "R2 には φ4 以下のエンドミルが必要ですが、深さ 30 mm は工具径の 7.5 倍でびびり・折損のおそれがあり、加工が非常に遅く高価になります。機能上問題なければ <b>R6 程度 (φ12 の工具、深さは径の 2.5 倍)</b> に大きくするか、ポケットを浅くします。",
      },
      {
        q: "M6 (ピッチ 1.0 mm) のねじを深さ 12 mm で止まり穴に切ります。下穴径・下穴深さと、ドリル先端 (118°) の円すい部の長さを求めなさい。",
        a: "下穴径はおよそ D − P = 6 − 1 = <b>φ5.0</b>。下穴深さ = 12 + 3 × 1.0 = <b>15 mm</b> (円筒部)。円すい部の長さ = (5/2) / tan 59° ≈ 2.5 / 1.664 ≈ <b>1.5 mm</b> で、穴底の頂点は 16.5 mm の位置になります。裏側の壁はこれより厚くします。",
      },
      {
        q: "60 × 40 × 20 mm のポケットを除去能率 20 cm³/min で荒加工します。荒加工時間は? 深さを 10 mm にできれば何分短くなりますか?",
        a: "体積 48 cm³ → 48 / 20 = <b>2.4 分</b>。深さ 10 mm なら 24 cm³ → 1.2 分で、<b>1.2 分短縮</b>。深さが浅いと短い工具が使え、除去能率そのものも上げやすくなります。",
      },
    ],
    quiz: [
      { q: "エンドミルで加工したポケットの内側の角はどうなる?", choices: ["鋭い角になる", "工具半径以上の R が残る", "面取りになる"], answer: 1, explain: "回転する工具は丸いため、内角には工具半径の R が残ります。" },
      { q: "加工コストを下げる設計は?", choices: ["穴径の種類をそろえる", "全寸法に厳しい公差を入れる", "斜めの穴を増やす"], answer: 0, explain: "穴径・ねじ・R の種類をそろえると工具交換が減り、加工時間が短くなります。" },
      { q: "止まりねじ穴の下穴深さの目安は?", choices: ["ねじ深さと同じ", "ねじ深さ + 3 ピッチ程度", "ねじ深さの半分"], answer: 1, explain: "タップ先端の不完全ねじと切りくずの逃げのため、下穴はねじより深くします。" },
    ],
    lessons: ["3-2", "3-4"],
  },
  {
    id: "dfm-sheet",
    part: "knowhow",
    title: "板金と溶接の設計",
    minutes: 20,
    level: 2,
    lead: "板金は、薄い板を切って曲げるだけで軽くて丈夫な部品を安く作れる加工法です。曲げの制約と、溶接構造の注意点を学びます。",
    body: `
<h2>板金加工の流れ</h2>
<p>レーザー・タレットパンチで<b>展開形状を切り抜き</b> → プレスブレーキで<b>曲げ</b> → 必要なら溶接・タップ・塗装。金型が不要なので少量でも安く作れます。</p>
<h2>曲げの設計ルール</h2>
<ul>
  <li><b>内側曲げ半径</b>は板厚程度以上 (R ≥ t)。小さすぎると外側が割れる</li>
  <li><b>フランジ (曲げ部) の高さ</b>は、板厚の 3〜4 倍以上ないと金型に掛からない</li>
  <li><b>穴と曲げ線の距離</b>は、板厚の 2 倍 + 曲げ半径 程度以上離す (近いと穴が変形する)</li>
  <li><b>穴径は板厚以上</b> (パンチで抜ける最小径)。穴と縁、穴と穴の間も板厚以上</li>
  <li>2 方向の曲げが交わる角には<b>逃げ (切り欠き)</b> を設ける</li>
  <li>曲げの方向・半径をそろえると、金型交換が減る</li>
</ul>
<svg class="tb-chart" viewBox="0 0 520 236" role="img" aria-label="曲げの逃げ (切り欠き)">
<rect class="k-panel" x="8" y="8" width="244" height="220" rx="8"/><rect class="k-panel" x="268" y="8" width="244" height="220" rx="8"/>
<circle class="k-badge" cx="28" cy="28" r="10" style="fill:var(--tb-bad)"/><text class="k-badge-t" x="28" y="32" text-anchor="middle">✕</text><text class="k-title" x="46" y="32">逃げなし</text>
<circle class="k-badge" cx="288" cy="28" r="10" style="fill:var(--tb-good)"/><text class="k-badge-t" x="288" y="32" text-anchor="middle">✓</text><text class="k-title" x="306" y="32">逃げあり</text>
<g class="k-shadow"><path class="k-alu" d="M40,52 L170,52 L170,84 L210,84 L210,186 L40,186 Z"/>
<path class="k-alu" d="M300,52 L422,52 L422,92 L470,92 L470,186 L300,186 Z"/></g>
<line class="k-hidden" x1="40" y1="84" x2="170" y2="84"/><line class="k-hidden" x1="170" y1="84" x2="170" y2="186"/>
<line class="k-hidden" x1="300" y1="84" x2="422" y2="84"/><line class="k-hidden" x1="430" y1="92" x2="430" y2="186"/>
<text class="k-note" x="105" y="72" text-anchor="middle">フランジ</text><text class="k-note" x="105" y="140" text-anchor="middle">ベース</text>
<text class="k-note" x="365" y="72" text-anchor="middle">フランジ</text><text class="k-note" x="365" y="140" text-anchor="middle">ベース</text>
<circle cx="170" cy="84" r="11" fill="none" style="stroke:var(--tb-bad)" stroke-width="1.6" stroke-dasharray="4 3"/>
<polyline points="166,88 174,80 168,76 176,70" fill="none" style="stroke:var(--tb-bad)" stroke-width="2.2"/>
<text class="k-bad-t" x="130" y="208" text-anchor="middle">角が裂ける・ふくらむ</text>
<path d="M422,52 L430,52 L430,84 L470,84 L470,92 L422,92 Z" style="fill:var(--tb-good);fill-opacity:0.25;stroke:var(--tb-good)" stroke-width="1.6" stroke-dasharray="3 2"/>
<text class="k-good-t" x="470" y="66" text-anchor="middle">逃げ</text>
<line class="k-move" x1="458" y1="70" x2="434" y2="80" style="stroke:var(--tb-good);marker-end:url(#k-arrow-green)"/>
<text class="k-good-t" x="390" y="208" text-anchor="middle">曲げ線の交点を切り欠く</text>
</svg>
<p class="tb-caption">図: 展開図 (破線が曲げ線)。2 方向の曲げが交わる角に逃げ (切り欠き) を入れると、曲げたときに材料が逃げられる。逃げの幅は板厚以上、深さは曲げ線を越える程度が目安</p>
<svg class="tb-chart" viewBox="0 0 520 220" role="img" aria-label="穴と曲げ線の距離">
<rect class="k-panel" x="20" y="16" width="230" height="78" rx="8"/>
<text class="k-note" x="30" y="32">平面図</text>
<g class="k-shadow"><rect class="k-alu" x="34" y="40" width="196" height="44"/></g>
<line class="k-center" x1="212" y1="36" x2="212" y2="88"/>
<circle cx="80" cy="62" r="8" style="fill:var(--tb-surface);stroke:var(--tb-good)" stroke-width="2"/>
<ellipse cx="198" cy="62" rx="5.5" ry="10" style="fill:var(--tb-surface);stroke:var(--tb-bad)" stroke-width="2"/>
<text class="k-note" x="224" y="32" text-anchor="end">曲げ線</text>
<text class="k-bad-t" x="20" y="114">曲げ線に近い穴は楕円に変形</text>
<g class="k-shadow">
<path class="k-cut" d="M40,140 L200,140 L200,148 L40,148 Z"/>
<path class="k-cut" d="M216,140 L300,140 A20,20 0 0 0 320,120 L320,40 L328,40 L328,120 A28,28 0 0 1 300,148 L216,148 Z"/>
</g>
<line class="k-center" x1="208" y1="128" x2="208" y2="160"/>
<text class="k-note" x="208" y="124" text-anchor="middle">穴</text>
<line class="k-ext" x1="216" y1="152" x2="216" y2="178"/><line class="k-ext" x1="320" y1="126" x2="320" y2="178"/>
<line class="k-dimline" x1="216" y1="172" x2="320" y2="172"/>
<text class="k-dimtext" x="268" y="194" text-anchor="middle">≥ 2t + R (目安)</text>
<line class="k-ext" x1="332" y1="40" x2="350" y2="40"/><line class="k-ext" x1="332" y1="148" x2="350" y2="148"/>
<line class="k-dimline" x1="344" y1="40" x2="344" y2="148"/>
<text class="k-dimtext" x="354" y="64">フランジ高さ</text><text class="k-dimtext" x="354" y="80">≥ 3〜4t (目安)</text>
<text class="k-dimtext" x="354" y="126">内側 R ≥ t</text>
<line class="k-ext" x1="352" y1="122" x2="314" y2="132" style="marker-end:url(#k-arrow-blue)"/>
<text class="k-note" x="354" y="172">t = 板厚</text>
</svg>
<p class="tb-caption">図: 曲げの断面 (t: 板厚、R: 内側曲げ半径)。穴が曲げ部に近いと、曲げで引き伸ばされて楕円になる</p>
<h2>展開長さと K 係数</h2>
<div class="tb-formula">曲げ代 BA = θ(rad) × (R + K × t)　　(K: 中立面の位置、0.3〜0.5 程度)</div>
<p>曲げると板の外側は伸び、内側は縮みます。伸び縮みしない<b>中立面</b>の位置を K 係数で表し、展開長さを計算します。</p>
<h2>溶接構造の注意点</h2>
<ul>
  <li><b>熱ひずみ</b>で反る・縮む。精度が必要な面は溶接後に機械加工する</li>
  <li>溶接部は<b>疲労に弱い</b>。応力の大きい所・角を避け、なめらかにつなぐ</li>
  <li>溶接の<b>トーチが届く</b>か、ビードを置く余地があるかを確認</li>
  <li>隅肉溶接の強さの目安: のど厚 a = 脚長 × 0.7、せん断応力 τ = F / (a × 溶接長さ)</li>
</ul>
<svg class="tb-chart" viewBox="0 0 520 220" role="img" aria-label="フランジ高さと V 溝">
<rect class="k-panel" x="8" y="8" width="244" height="204" rx="8"/><rect class="k-panel" x="268" y="8" width="244" height="204" rx="8"/>
<circle class="k-badge" cx="28" cy="28" r="10" style="fill:var(--tb-bad)"/><text class="k-badge-t" x="28" y="32" text-anchor="middle">✕</text><text class="k-title" x="46" y="32">フランジが短い</text>
<circle class="k-badge" cx="288" cy="28" r="10" style="fill:var(--tb-good)"/><text class="k-badge-t" x="288" y="32" text-anchor="middle">✓</text><text class="k-title" x="306" y="32">両肩に掛かる</text>
<g class="k-shadow"><path class="k-part" d="M40,150 L100,150 L130,180 L160,150 L220,150 L220,190 L40,190 Z"/></g>
<path class="k-part" d="M118,60 L142,60 L142,120 L130,140 L118,120 Z"/>
<line class="k-move" x1="130" y1="46" x2="130" y2="58"/>
<rect class="k-alu" x="30" y="142" width="120" height="6"/><path d="M150,148 L156,162" style="stroke:var(--tb-bad)" stroke-width="2"/>
<text class="k-bad-t" x="130" y="208" text-anchor="middle">板端が V 溝に落ちる</text>
<g class="k-shadow"><path class="k-part" d="M300,150 L360,150 L390,180 L420,150 L480,150 L480,190 L300,190 Z"/></g>
<path class="k-part" d="M378,60 L402,60 L402,120 L390,140 L378,120 Z"/>
<line class="k-move" x1="390" y1="46" x2="390" y2="58"/>
<rect class="k-alu" x="290" y="142" width="175" height="6"/>
<line class="k-ext" x1="420" y1="138" x2="420" y2="100"/><line class="k-ext" x1="360" y1="138" x2="360" y2="100"/><line class="k-dimline" x1="360" y1="106" x2="420" y2="106"/><text class="k-dimtext" x="430" y="102">V 幅</text>
<text class="k-good-t" x="390" y="208" text-anchor="middle">フランジ ≥ V 幅の半分 + α</text>
</svg>
<p class="tb-caption">図: プレスブレーキの曲げ。下型の V 溝の幅は板厚の 6〜8 倍程度が一般的で、フランジが V 幅の半分より短いと板端が肩に掛からず曲げられない。これが「フランジ高さ ≥ 板厚の 3〜4 倍」の理由</p>
<h2>板厚ごとの目安値</h2>
<table class="tb-table">
  <tr><th>板厚 t</th><th>内側 R (≈ t)</th><th>最小フランジ (3〜4t)</th><th>穴〜曲げ線 (2t + R)</th></tr>
  <tr><td>1.0 mm</td><td>1.0 mm</td><td>3〜4 mm</td><td>3.0 mm</td></tr>
  <tr><td>1.6 mm</td><td>1.6 mm</td><td>4.8〜6.4 mm</td><td>4.8 mm</td></tr>
  <tr><td>2.0 mm</td><td>2.0 mm</td><td>6〜8 mm</td><td>6.0 mm</td></tr>
  <tr><td>3.2 mm</td><td>3.2 mm</td><td>9.6〜12.8 mm</td><td>9.6 mm</td></tr>
</table>
<p>数値は一般的な目安です。実際の最小値は材料 (SPCC・SUS・アルミ) と加工先の金型で変わるので、量産前に加工先の標準を確認します。</p>
<h2>計算例: L 曲げの展開長さ</h2>
<p>外形寸法 50 × 30 mm、板厚 t = 2、内側 R = 2、K = 0.4 の 90° 曲げ。直線部は外形から (R + t) を引きます。</p>
<div class="tb-formula">直線部 = (50 − 4) + (30 − 4) = 72 mm　　BA = (π/2)(2 + 0.4 × 2) ≈ 4.40 mm　　展開長 ≈ 76.40 mm</div>
<p>外形寸法の合計 80 mm から引く量 (<b>曲げ控除</b> BD = 2(R + t) − BA ≈ 3.60 mm) で表すこともできます。CAD の板金機能はこの計算を K 係数や曲げ表で自動で行います。</p>
<h2>よくある失敗</h2>
<ul>
  <li>曲げの近くに穴・切り欠き → 穴がつぶれる、曲げ線がずれる</li>
  <li>短すぎるフランジ・Z 曲げの段差が小さすぎ → 金型が入らない</li>
  <li>両側から曲げで囲う箱で、最後の曲げで金型と既存フランジが干渉する</li>
  <li>溶接ナットやタップの位置が曲げ R に掛かる</li>
</ul>
<div class="tb-tip"><b>3DCAD Studio</b>: 「板金」タブの面・フランジで板金部品を作り、「展開パターン」で展開寸法と DXF を出力できます。フレーム ジェネレータと溶接で溶接構造も作れます。</div>`,
    points: ["曲げ半径 ≥ 板厚、フランジ高さ ≥ 板厚の 3〜4 倍", "穴は曲げ線から 2t + R 以上離す、穴径 ≥ 板厚", "展開長さは K 係数 (中立面) で計算", "溶接は熱ひずみ・疲労・作業性に注意"],
    exercises: [
      {
        q: "板厚 2 mm、内側曲げ半径 2 mm、K = 0.4 で 90° 曲げるときの曲げ代 BA を求めてください。",
        a: "BA = (π/2) × (2 + 0.4 × 2) = 1.571 × 2.8 ≈ <b>4.40 mm</b>。",
      },
      {
        q: "外形 50 × 30 mm の L 字 (t = 2 mm、内側 R = 2 mm、K = 0.4、90°) の展開長さを求めなさい。",
        a: "直線部 = (50 − 4) + (30 − 4) = 72 mm。BA = (π/2)(2 + 0.8) ≈ 4.40 mm。展開長 ≈ <b>76.40 mm</b>。外形和 80 mm から曲げ控除 3.60 mm を引いても同じです。",
      },
      {
        q: "板厚 1.6 mm、内側 R = 1.6 mm の板金で、曲げ線の近くに φ4 の穴をあけます。穴の縁は曲げ線から何 mm 以上離すべきですか? また最小フランジ高さの目安は?",
        a: "穴の縁〜曲げ線 ≥ 2t + R = 3.2 + 1.6 = <b>4.8 mm</b>。フランジ高さは 3〜4t = <b>4.8〜6.4 mm</b> 以上。φ4 の穴を収めるならフランジはさらに高く (4.8 + 4 + 縁の余裕) 必要です。",
      },
    ],
    quiz: [
      { q: "板厚 1.6 mm の板金にあける穴の最小径の目安は?", choices: ["0.5 mm", "1.6 mm 程度", "10 mm"], answer: 1, explain: "パンチで抜ける穴径は板厚程度以上が目安です。" },
      { q: "穴を曲げ線のすぐ近くに置くと何が起こる?", choices: ["穴が変形する", "曲げ角度が大きくなる", "何も起こらない"], answer: 0, explain: "曲げの変形が穴に及び、楕円に変形します。2t + R 以上離します。" },
      { q: "フランジが短すぎると曲げられない主な理由は?", choices: ["板が割れるから", "板端が下型の V 溝の肩に掛からないから", "展開長さが計算できないから"], answer: 1, explain: "曲げには V 溝の両肩で板を支える必要があり、フランジは V 幅の半分以上必要です。" },
      { q: "外形 50 × 30 mm、曲げ控除 3.6 mm の L 曲げの展開長さは?", choices: ["80 mm", "76.4 mm", "83.6 mm"], answer: 1, explain: "80 − 3.6 = 76.4 mm。曲げると中立面より外は伸びるので、外形和より短くなります。" },
    ],
  },
  {
    id: "dfm-molding",
    part: "knowhow",
    title: "樹脂成形品の設計",
    minutes: 20,
    level: 2,
    lead: "射出成形は、金型に溶けた樹脂を流し込んで大量の部品を安く作る方法です。金型は高価なので、最初から「成形できる形」に設計することが重要です。",
    body: `
<h2>肉厚は均一に</h2>
<p>厚い所は冷えるのが遅く、<b>ひけ (へこみ)・ボイド・そり</b>の原因になります。一般的な肉厚は 1.5〜3 mm。厚くしたい所は肉を抜き、リブで補強します。</p>
<h2>抜き勾配</h2>
<p>金型から製品を取り出せるよう、型の開く方向と平行な面には<b>抜き勾配</b> (0.5〜2°程度、シボ加工面はさらに大きく) を付けます。</p>
<h2>リブとボス</h2>
<ul>
  <li><b>リブの厚さは肉厚の 50〜60 %</b>。厚すぎると表側にひけが出る。高さは肉厚の 3 倍以内</li>
  <li><b>ボス</b> (ねじ止めの円柱) は肉厚を均一にするため中空にし、根元を壁やリブでつなぐ</li>
  <li>角には R を付ける (内側 R ≈ 肉厚の 0.5 倍以上)。樹脂の流れが良くなり、応力集中も減る</li>
</ul>
<svg class="tb-chart" viewBox="0 0 520 230" role="img" aria-label="リブの厚さとひけ">
<rect class="k-panel" x="8" y="8" width="244" height="214" rx="8"/><rect class="k-panel" x="268" y="8" width="244" height="214" rx="8"/>
<circle class="k-badge" cx="28" cy="28" r="10" style="fill:var(--tb-bad)"/><text class="k-badge-t" x="28" y="32" text-anchor="middle">✕</text>
<text class="k-title" x="46" y="32">リブ厚 = 肉厚 t</text>
<circle class="k-badge" cx="288" cy="28" r="10" style="fill:var(--tb-good)"/><text class="k-badge-t" x="288" y="32" text-anchor="middle">✓</text>
<text class="k-title" x="306" y="32">リブ厚 0.5〜0.6 t</text>
<g class="k-shadow"><path class="k-cut" d="M36,70 L112,70 Q130,80 148,70 L224,70 L224,92 L141,92 L141,170 L119,170 L119,92 L36,92 Z"/></g>
<circle cx="130" cy="94" r="15" fill="none" style="stroke:var(--tb-bad)" stroke-width="1.6" stroke-dasharray="4 3"/>
<path d="M112,70 Q130,80 148,70" fill="none" style="stroke:var(--tb-bad)" stroke-width="2.6"/>
<path class="k-move" d="M170,52 L140,72" style="stroke:var(--tb-bad);marker-end:url(#k-arrow-red)"/>
<text class="k-bad-t" x="174" y="50">ひけ (へこみ)</text>
<line class="k-ext" x1="119" y1="172" x2="119" y2="190"/><line class="k-ext" x1="141" y1="172" x2="141" y2="190"/>
<line class="k-dimline" x1="119" y1="186" x2="141" y2="186"/><text class="k-dimtext" x="152" y="190">t</text>
<line class="k-ext" x1="226" y1="70" x2="240" y2="70"/><line class="k-ext" x1="226" y1="92" x2="240" y2="92"/>
<line class="k-dimline" x1="236" y1="70" x2="236" y2="92"/><text class="k-dimtext" x="230" y="112" text-anchor="end">t</text>
<text class="k-note" x="22" y="214">交点の内接円が大きい → 冷えにくく、ひけ・ボイド</text>
<g class="k-shadow"><path class="k-cut" d="M296,70 L484,70 L484,92 L396,92 L395,170 L385,170 L384,92 L296,92 Z"/></g>
<circle cx="390" cy="92" r="7" fill="none" style="stroke:var(--tb-good)" stroke-width="1.6" stroke-dasharray="4 3"/>
<text class="k-good-t" x="390" y="58" text-anchor="middle">表面は平ら</text>
<line class="k-ext" x1="384" y1="172" x2="384" y2="190"/><line class="k-ext" x1="396" y1="172" x2="396" y2="190"/>
<line class="k-dimline" x1="370" y1="186" x2="384" y2="186" style="marker-start:none"/><line class="k-dimline" x1="410" y1="186" x2="396" y2="186" style="marker-start:none"/>
<text class="k-dimtext" x="390" y="205" text-anchor="middle">0.5〜0.6 t</text>
<line class="k-ext" x1="397" y1="170" x2="440" y2="170"/><line class="k-dimline" x1="436" y1="92" x2="436" y2="170"/><text class="k-dimtext" x="442" y="135">≤ 3 t</text>
</svg>
<p class="tb-caption">図: 樹脂成形品の断面。リブを肉厚と同じにすると、交点が厚肉になって表側にひけ (へこみ) が出る。リブは薄く、高さを抑える</p>
<svg class="tb-chart" viewBox="0 0 520 236" role="img" aria-label="ボスの設計">
<rect class="k-panel" x="8" y="8" width="244" height="220" rx="8"/><rect class="k-panel" x="268" y="8" width="244" height="220" rx="8"/>
<circle class="k-badge" cx="28" cy="28" r="10" style="fill:var(--tb-bad)"/><text class="k-badge-t" x="28" y="32" text-anchor="middle">✕</text><text class="k-title" x="46" y="32">中実の太いボス</text>
<circle class="k-badge" cx="288" cy="28" r="10" style="fill:var(--tb-good)"/><text class="k-badge-t" x="288" y="32" text-anchor="middle">✓</text><text class="k-title" x="306" y="32">中空 + リブ</text>
<g class="k-shadow"><path class="k-cut" d="M36,70 L108,70 Q130,80 152,70 L224,70 L224,90 L160,90 L160,180 L100,180 L100,90 L36,90 Z"/></g>
<path d="M108,70 Q130,80 152,70" fill="none" style="stroke:var(--tb-bad)" stroke-width="2.6"/>
<ellipse cx="130" cy="112" rx="7" ry="5" style="fill:var(--tb-surface);stroke:var(--tb-bad)" stroke-width="1.6"/>
<line class="k-center" x1="130" y1="60" x2="130" y2="190"/>
<text class="k-bad-t" x="176" y="58">ひけ</text><line class="k-move" x1="174" y1="56" x2="150" y2="72" style="stroke:var(--tb-bad);marker-end:url(#k-arrow-red)"/>
<text class="k-bad-t" x="176" y="132">ボイド</text><line class="k-move" x1="174" y1="128" x2="140" y2="115" style="stroke:var(--tb-bad);marker-end:url(#k-arrow-red)"/>
<text class="k-bad-t" x="130" y="208" text-anchor="middle">中実の太いボス: ひけ・ボイド</text>
<g class="k-shadow">
<path class="k-part" d="M366,90 L326,90 L366,150 Z"/><path class="k-part" d="M414,90 L454,90 L414,150 Z"/>
<path class="k-cut" d="M296,70 L484,70 L484,90 L414,90 L414,180 L400,180 L400,96 L380,96 L380,180 L366,180 L366,90 L296,90 Z"/>
</g>
<line class="k-center" x1="390" y1="60" x2="390" y2="190"/>
<text class="k-note" x="390" y="196" text-anchor="middle">ねじ穴</text>
<text class="k-note" x="300" y="128">リブ</text><line class="k-thin" x1="318" y1="124" x2="350" y2="110" style="marker-end:url(#k-arrow)"/>
<text class="k-good-t" x="390" y="56" text-anchor="middle">表面は平ら</text>
<text class="k-good-t" x="390" y="214" text-anchor="middle">中空 + リブで壁とつなぐ</text>
</svg>
<p class="tb-caption">図: ボス (ねじ止め用の円柱) の断面。中空にして肉厚を均一にし、根元を三角リブで補強する</p>
<h2>アンダーカットを避ける</h2>
<p>型の開く方向に抜けない形 (横穴・内側のツメなど) を<b>アンダーカット</b>と呼び、スライド機構が必要になって金型が高価になります。
穴の向きを型開き方向にそろえる、ツメの下を貫通させるなどで回避します。</p>
<h2>樹脂ならではの機能</h2>
<ul>
  <li><b>スナップフィット</b>: ツメのたわみで組み付け、ねじを減らせる</li>
  <li><b>ヒンジ</b>: PP の薄肉ヒンジで一体成形</li>
  <li>部品の<b>統合</b>: 金属なら複数部品の形を 1 部品にまとめられる</li>
</ul>
<div data-widget="3d-snapfit"></div>
<p class="tb-caption">3D 図: ふたを押し込むとフックが根元からたわみ、かえしを越えると元に戻ります。根元のひずみが許容値を超えないよう L と t を決めます。</p>
<svg class="tb-chart" viewBox="0 0 520 230" role="img" aria-label="抜き勾配の有無">
<rect class="k-panel" x="8" y="8" width="244" height="214" rx="8"/><rect class="k-panel" x="268" y="8" width="244" height="214" rx="8"/>
<circle class="k-badge" cx="28" cy="28" r="10" style="fill:var(--tb-bad)"/><text class="k-badge-t" x="28" y="32" text-anchor="middle">✕</text><text class="k-title" x="46" y="32">勾配なし</text>
<circle class="k-badge" cx="288" cy="28" r="10" style="fill:var(--tb-good)"/><text class="k-badge-t" x="288" y="32" text-anchor="middle">✓</text><text class="k-title" x="306" y="32">抜き勾配あり</text>
<g class="k-shadow"><path class="k-plastic" d="M70,190 L70,80 L190,80 L190,190 L176,190 L176,94 L84,94 L84,190 Z"/><rect class="k-part" x="84" y="94" width="92" height="96"/></g>
<line class="k-move" x1="130" y1="74" x2="130" y2="50"/>
<path d="M78,110 L72,118 M78,130 L72,138 M78,150 L72,158 M182,110 L188,118 M182,130 L188,138 M182,150 L188,158" style="stroke:var(--tb-bad)" stroke-width="2"/>
<text class="k-bad-t" x="130" y="212" text-anchor="middle">こすれ傷・離型不良</text>
<g class="k-shadow"><path class="k-plastic" d="M326,190 L334,80 L446,80 L454,190 L440,190 L433,94 L347,94 L340,190 Z"/><path class="k-part" d="M347,94 L433,94 L440,190 L340,190 Z"/></g>
<line class="k-move" x1="390" y1="74" x2="390" y2="50"/>
<line class="k-center" x1="454" y1="190" x2="454" y2="74"/><text class="k-dimtext" x="458" y="100">1°</text>
<text class="k-good-t" x="390" y="212" text-anchor="middle">少し動けば型から離れる</text>
</svg>
<p class="tb-caption">図: 型 (コア) に張り付いた成形品の断面。壁が型開き方向と平行だと、取り出す間ずっとこすれる。わずかな勾配で、動いた瞬間にすき間ができる (勾配は誇張して描いている)</p>
<h2>肉厚別の目安値</h2>
<table class="tb-table">
  <tr><th>基本肉厚 t</th><th>リブ厚 (0.5〜0.6t)</th><th>リブ高さ (≤ 3t)</th><th>入隅 R (≥ 0.5t)</th><th>リブ間隔 (≥ 2t)</th></tr>
  <tr><td>1.5 mm</td><td>0.75〜0.9 mm</td><td>4.5 mm</td><td>0.75 mm</td><td>3 mm</td></tr>
  <tr><td>2.0 mm</td><td>1.0〜1.2 mm</td><td>6.0 mm</td><td>1.0 mm</td><td>4 mm</td></tr>
  <tr><td>2.5 mm</td><td>1.25〜1.5 mm</td><td>7.5 mm</td><td>1.25 mm</td><td>5 mm</td></tr>
  <tr><td>3.0 mm</td><td>1.5〜1.8 mm</td><td>9.0 mm</td><td>1.5 mm</td><td>6 mm</td></tr>
</table>
<p>樹脂の種類 (流れやすさ・収縮率) で最適値は変わります。表は設計の出発点として使い、成形メーカーと確認します。</p>
<h2>計算例: 勾配による寸法差</h2>
<p>深さ 30 mm の側壁に抜き勾配 1° を付けると、片側で 30 × tan 1° ≈ <b>0.52 mm</b> 根元と先端の寸法が違います (両側で約 1.05 mm)。
0.5° なら片側 0.26 mm。はめあいや外観の合わせがある面では、どちらの端の寸法を基準にするか図面に明記します。</p>
<h2>よくある失敗</h2>
<ul>
  <li>切削部品の形をそのまま成形品に — 厚肉でひけ・そり、勾配なし</li>
  <li>リブを肉厚と同じ厚さ — 表面にひけ</li>
  <li>収縮を見込まない寸法 — 型寸法は製品寸法 × (1 + 収縮率) 程度で作られる</li>
  <li>ゲート位置を考えずに薄肉部の先に厚肉部 — ショートショット (充填不足)</li>
</ul>
<div class="tb-tip"><b>3DCAD Studio</b>: シェル (一定肉厚)・勾配 (抜き勾配)・リブ・フィレットのフィーチャで、成形品らしいモデルを作れます。断面図で肉厚が均一か確かめましょう。</div>`,
    points: ["肉厚を均一に (1.5〜3 mm)、厚い所は肉抜き + リブ", "型開き方向の面に抜き勾配 0.5〜2°", "リブ厚は肉厚の 50〜60 %、ボスは中空に", "アンダーカットは金型コストを上げる"],
    exercises: [
      {
        q: "肉厚 2.5 mm のケースにリブを付けます。リブの厚さと高さの目安は?",
        a: "厚さは 2.5 × 0.5〜0.6 = <b>1.25〜1.5 mm</b>、高さは 2.5 × 3 = <b>7.5 mm 以内</b>が目安です。根元に R、先端側に抜き勾配を付けます。",
      },
      {
        q: "深さ 30 mm のケース側壁に抜き勾配 1° を付けます。片側で根元と先端の寸法はどれだけ違いますか? 0.5° ではどうですか?",
        a: "1°: 30 × tan 1° ≈ <b>0.52 mm</b>。0.5°: 30 × tan 0.5° ≈ <b>0.26 mm</b>。両側ではそれぞれ約 1.05 mm、0.52 mm 幅が変わります。",
      },
      {
        q: "収縮率を 0.6 % と仮定すると、製品寸法 100.0 mm の部分の型寸法はおよそいくつにしますか?",
        a: "型寸法 ≈ 100 × (1 + 0.006) = <b>100.6 mm</b> (厳密に 100 / (1 − 0.006) とすると 100.60 mm)。実際の収縮率は材料・肉厚・流れ方向で変わるため、成形メーカーと決めます。",
      },
    ],
    quiz: [
      { q: "成形品の表面にひけが出る主な原因は?", choices: ["肉厚が部分的に厚い", "抜き勾配が大きい", "材料が透明"], answer: 0, explain: "厚い部分は冷却・収縮が遅れ、表面がへこみます。" },
      { q: "アンダーカットがあると何が起こる?", choices: ["金型にスライド機構が必要で高価になる", "製品が軽くなる", "抜き勾配が不要になる"], answer: 0, explain: "型開き方向に抜けない形は、スライドや傾斜ピンなど追加の機構が必要です。" },
      { q: "基本肉厚 2 mm の成形品で、リブ高さの目安の上限は?", choices: ["2 mm", "6 mm", "20 mm"], answer: 1, explain: "リブ高さは肉厚の 3 倍程度まで。高すぎると充填不足や倒れの原因になります。" },
    ],
    lessons: ["3-4"],
  },
  {
    id: "dfm-3dp",
    part: "knowhow",
    title: "3D プリントのための設計",
    minutes: 15,
    level: 1,
    lead: "3D プリント (積層造形) は金型なしで複雑な形を作れますが、積層ならではの制約があります。失敗しにくく強い部品の設計を学びます。",
    body: `
<h2>主な方式</h2>
<table class="tb-table">
  <tr><th>方式</th><th>特徴</th><th>向く用途</th></tr>
  <tr><td>FDM / FFF (熱溶解積層)</td><td>安価。樹脂の糸を溶かして積む。積層方向に弱い</td><td>試作・治具・趣味</td></tr>
  <tr><td>光造形 (SLA / DLP)</td><td>表面がきれいで精細。後硬化が必要</td><td>外観試作・小物・型</td></tr>
  <tr><td>粉末焼結 (SLS / MJF)</td><td>サポート不要。強度が高め</td><td>機能部品・少量生産</td></tr>
  <tr><td>金属 (L-PBF)</td><td>高価。複雑な金属部品</td><td>航空・医療・金型</td></tr>
</table>
<h2>FDM で失敗しない形</h2>
<ul>
  <li><b>オーバーハングは 45° まで</b>: それより寝た面や水平な張り出しにはサポートが必要。面取り (C) にすると支えなしで造形できる</li>
  <li><b>ブリッジ</b> (両端が支えられた水平部分) は短ければ可能 (5〜10 mm 程度)</li>
  <li><b>最小肉厚</b>: ノズル径の 2 倍以上 (0.4 mm ノズルで 0.8 mm、強度を考えると 1.2〜2 mm)</li>
  <li><b>穴は小さめに出る</b>: はめあい用の穴は 0.2〜0.3 mm 大きく設計するか、後でドリルで仕上げる</li>
  <li>底面 (ベッドに着く面) は平らで広く。角に R を付けるとそり・はがれが減る</li>
</ul>
<svg class="tb-chart" viewBox="0 0 520 214" role="img" aria-label="FDM のオーバーハング 45° の目安">
<text class="k-note" x="260" y="22" text-anchor="middle">破線 = 垂直 (積層方向)。右端の細い破線はサポート</text>
<rect class="k-ground" x="20" y="177" width="490" height="10"/><line class="k-edge" x1="20" y1="176" x2="510" y2="176"/>
<line class="k-hidden" x1="409.4" y1="155" x2="409.4" y2="176" style="stroke:var(--tb-bad)"/><line class="k-hidden" x1="421.5" y1="148" x2="421.5" y2="176" style="stroke:var(--tb-bad)"/><line class="k-hidden" x1="433.6" y1="141" x2="433.6" y2="176" style="stroke:var(--tb-bad)"/><line class="k-hidden" x1="445.7" y1="134" x2="445.7" y2="176" style="stroke:var(--tb-bad)"/><line class="k-hidden" x1="457.8" y1="127" x2="457.8" y2="176" style="stroke:var(--tb-bad)"/><line class="k-hidden" x1="470.0" y1="120" x2="470.0" y2="176" style="stroke:var(--tb-bad)"/><line class="k-hidden" x1="482.1" y1="113" x2="482.1" y2="176" style="stroke:var(--tb-bad)"/>
<g class="k-shadow"><rect class="k-plastic" x="60.0" y="169" width="26" height="7" rx="3.5" style="stroke-width:1"/><rect class="k-plastic" x="64.0" y="162" width="26" height="7" rx="3.5" style="stroke-width:1"/><rect class="k-plastic" x="68.1" y="155" width="26" height="7" rx="3.5" style="stroke-width:1"/><rect class="k-plastic" x="72.1" y="148" width="26" height="7" rx="3.5" style="stroke-width:1"/><rect class="k-plastic" x="76.2" y="141" width="26" height="7" rx="3.5" style="stroke-width:1"/><rect class="k-plastic" x="80.2" y="134" width="26" height="7" rx="3.5" style="stroke-width:1"/><rect class="k-plastic" x="84.2" y="127" width="26" height="7" rx="3.5" style="stroke-width:1"/><rect class="k-plastic" x="88.3" y="120" width="26" height="7" rx="3.5" style="stroke-width:1"/><rect class="k-plastic" x="92.3" y="113" width="26" height="7" rx="3.5" style="stroke-width:1"/><rect class="k-plastic" x="96.4" y="106" width="26" height="7" rx="3.5" style="stroke-width:1"/><rect class="k-plastic" x="210.0" y="169" width="26" height="7" rx="3.5" style="stroke-width:1"/><rect class="k-plastic" x="217.0" y="162" width="26" height="7" rx="3.5" style="stroke-width:1"/><rect class="k-plastic" x="224.0" y="155" width="26" height="7" rx="3.5" style="stroke-width:1"/><rect class="k-plastic" x="231.0" y="148" width="26" height="7" rx="3.5" style="stroke-width:1"/><rect class="k-plastic" x="238.0" y="141" width="26" height="7" rx="3.5" style="stroke-width:1"/><rect class="k-plastic" x="245.0" y="134" width="26" height="7" rx="3.5" style="stroke-width:1"/><rect class="k-plastic" x="252.0" y="127" width="26" height="7" rx="3.5" style="stroke-width:1"/><rect class="k-plastic" x="259.0" y="120" width="26" height="7" rx="3.5" style="stroke-width:1"/><rect class="k-plastic" x="266.0" y="113" width="26" height="7" rx="3.5" style="stroke-width:1"/><rect class="k-plastic" x="273.0" y="106" width="26" height="7" rx="3.5" style="stroke-width:1"/><rect class="k-plastic" x="360.0" y="169" width="26" height="7" rx="3.5" style="stroke-width:1"/><rect class="k-plastic" x="372.1" y="162" width="26" height="7" rx="3.5" style="stroke-width:1"/><rect class="k-plastic" x="384.2" y="155" width="26" height="7" rx="3.5" style="stroke-width:1"/><rect class="k-plastic" x="396.4" y="148" width="26" height="7" rx="3.5" style="stroke-width:1"/><rect class="k-plastic" x="408.5" y="141" width="26" height="7" rx="3.5" style="stroke-width:1"/><rect class="k-plastic" x="420.6" y="134" width="26" height="7" rx="3.5" style="stroke-width:1"/><rect class="k-plastic" x="432.7" y="127" width="26" height="7" rx="3.5" style="stroke-width:1"/><rect class="k-plastic" x="444.8" y="120" width="26" height="7" rx="3.5" style="stroke-width:1"/><rect class="k-plastic" x="457.0" y="113" width="26" height="7" rx="3.5" style="stroke-width:1"/><rect class="k-plastic" x="469.1" y="106" width="26" height="7" rx="3.5" style="stroke-width:1"/></g>
<line class="k-center" x1="60" y1="176" x2="60" y2="88"/><line class="k-thin" x1="60" y1="176" x2="110.0" y2="89.4"/><path d="M60,132 A44,44 0 0 1 82.0,137.9" fill="none" style="stroke:var(--tb-good)" stroke-width="1.6"/><text x="68.5" y="121.9" style="fill:var(--tb-good);font-size:12px;font-weight:700">30°</text><line class="k-center" x1="210" y1="176" x2="210" y2="88"/><line class="k-thin" x1="210" y1="176" x2="280.7" y2="105.3"/><path d="M210,132 A44,44 0 0 1 241.1,144.9" fill="none" style="stroke:var(--tb-warn)" stroke-width="1.6"/><text x="225.4" y="124.3" style="fill:var(--tb-warn);font-size:12px;font-weight:700">45°</text><line class="k-center" x1="360" y1="176" x2="360" y2="88"/><line class="k-thin" x1="360" y1="176" x2="446.6" y2="126.0"/><path d="M360,132 A44,44 0 0 1 398.1,154.0" fill="none" style="stroke:var(--tb-bad)" stroke-width="1.6"/><text x="382.0" y="127.5" style="fill:var(--tb-bad);font-size:12px;font-weight:700">60°</text>
<g class="k-shadow"><rect class="k-part" x="470" y="58" width="26" height="22" rx="3"/><path class="k-part" d="M476,80 L490,80 L485,94 L481,94 Z"/></g>
<text class="k-note" x="466" y="72" text-anchor="end">ノズル</text>
<text class="k-good-t" x="100" y="204" text-anchor="middle">垂直から 30°: OK</text>
<text class="k-good-t" x="262" y="204" text-anchor="middle" style="fill:var(--tb-warn)">45°: 限界の目安</text>
<text class="k-bad-t" x="436" y="204" text-anchor="middle">60°: サポートが必要</text>
</svg>
<p class="tb-caption">図: オーバーハング (張り出し) は垂直から 45° 程度までならサポートなしで積める (目安)。それより寝た面は下の層が支えにならず垂れる</p>
<h2>強さは向きで変わる</h2>
<p>FDM の部品は層と層の境目 (積層方向) が弱く、強度が数分の 1 になることもあります。
<b>荷重が層に沿う向き</b>になるよう造形方向を決めましょう (例: フックは立てずに寝かせて造形)。</p>
<svg class="tb-chart" viewBox="0 0 520 238" role="img" aria-label="積層方向と強度">
<rect class="k-panel" x="8" y="8" width="244" height="206" rx="8"/><rect class="k-panel" x="268" y="8" width="244" height="206" rx="8"/>
<circle class="k-badge" cx="28" cy="28" r="10" style="fill:var(--tb-bad)"/><text class="k-badge-t" x="28" y="32" text-anchor="middle">✕</text><text class="k-title" x="46" y="32">立てて造形</text>
<circle class="k-badge" cx="288" cy="28" r="10" style="fill:var(--tb-good)"/><text class="k-badge-t" x="288" y="32" text-anchor="middle">✓</text><text class="k-title" x="306" y="32">寝かせて造形</text>
<g class="k-shadow"><rect class="k-cut" x="22" y="60" width="18" height="110"/><rect class="k-plastic" x="40" y="100" width="170" height="30" rx="2"/>
<rect class="k-cut" x="282" y="60" width="18" height="110"/><rect class="k-plastic" x="300" y="100" width="170" height="30" rx="2"/></g>
<line class="k-thin" x1="52" y1="100" x2="52" y2="130"/><line class="k-thin" x1="64" y1="100" x2="64" y2="130"/><line class="k-thin" x1="76" y1="100" x2="76" y2="130"/><line class="k-thin" x1="88" y1="100" x2="88" y2="130"/><line class="k-thin" x1="100" y1="100" x2="100" y2="130"/><line class="k-thin" x1="112" y1="100" x2="112" y2="130"/><line class="k-thin" x1="124" y1="100" x2="124" y2="130"/><line class="k-thin" x1="136" y1="100" x2="136" y2="130"/><line class="k-thin" x1="148" y1="100" x2="148" y2="130"/><line class="k-thin" x1="160" y1="100" x2="160" y2="130"/><line class="k-thin" x1="172" y1="100" x2="172" y2="130"/><line class="k-thin" x1="184" y1="100" x2="184" y2="130"/><line class="k-thin" x1="196" y1="100" x2="196" y2="130"/><line class="k-thin" x1="208" y1="100" x2="208" y2="130"/><line class="k-thin" x1="300" y1="106" x2="470" y2="106"/><line class="k-thin" x1="300" y1="112" x2="470" y2="112"/><line class="k-thin" x1="300" y1="118" x2="470" y2="118"/><line class="k-thin" x1="300" y1="124" x2="470" y2="124"/>
<polyline points="52,100 49,106 54,112 50,118 53,124 50,130" fill="none" style="stroke:var(--tb-bad)" stroke-width="2.4"/>
<line class="k-force" x1="196" y1="56" x2="196" y2="96"/><line class="k-force" x1="456" y1="56" x2="456" y2="96"/>
<text class="k-bad-t" x="64" y="78">はがれ</text>
<line class="k-move" x1="70" y1="152" x2="180" y2="152"/><text class="k-note" x="125" y="170" text-anchor="middle">積層方向</text>
<line class="k-move" x1="385" y1="172" x2="385" y2="140"/><text class="k-note" x="395" y="166">積層方向</text>
<text class="k-bad-t" x="130" y="198" text-anchor="middle">層の境目ではがれる</text>
<text class="k-good-t" x="390" y="198" text-anchor="middle">層に沿って荷重を受ける</text>
<text class="k-note" x="260" y="232" text-anchor="middle">細線 = 層の境目。矢印 = 荷重</text>
</svg>
<p class="tb-caption">図: 同じ棒でも造形の向きで強さが変わる。曲げで生じる引張が層の境目を引きはがす向き (左) を避け、層に沿う向き (右) にする</p>
<svg class="tb-chart" viewBox="0 0 520 220" role="img" aria-label="横穴の形とオーバーハング">
<rect class="k-panel" x="8" y="8" width="244" height="204" rx="8"/><rect class="k-panel" x="268" y="8" width="244" height="204" rx="8"/>
<circle class="k-badge" cx="28" cy="28" r="10" style="fill:var(--tb-bad)"/><text class="k-badge-t" x="28" y="32" text-anchor="middle">✕</text><text class="k-title" x="46" y="32">丸い横穴</text>
<circle class="k-badge" cx="288" cy="28" r="10" style="fill:var(--tb-good)"/><text class="k-badge-t" x="288" y="32" text-anchor="middle">✓</text><text class="k-title" x="306" y="32">ティアドロップ形</text>
<g class="k-shadow"><rect class="k-plastic" x="50" y="60" width="160" height="130" rx="3"/><rect class="k-plastic" x="310" y="60" width="160" height="130" rx="3"/></g>
<circle cx="130" cy="130" r="32" style="fill:var(--tb-surface)" class="k-edge"/>
<path d="M108,108 Q114,114 112,104 M120,100 Q124,108 126,99 M134,99 Q137,108 141,100 M146,104 Q148,112 152,108" style="fill:none;stroke:var(--tb-bad)" stroke-width="2"/>
<text class="k-bad-t" x="130" y="182" text-anchor="middle">上側が垂れる</text>
<path d="M367.4,107.4 L390,84.7 L412.6,107.4 A32,32 0 1 1 367.4,107.4 Z" style="fill:var(--tb-surface)" class="k-edge"/>
<line class="k-center" x1="390" y1="70" x2="390" y2="170"/><text class="k-dimtext" x="414" y="92">45°</text>
<text class="k-good-t" x="390" y="182" text-anchor="middle">上を 45° でとがらせる</text>
<text class="k-note" x="260" y="208" text-anchor="middle">造形方向 ↑ (層は下から積まれる)</text>
</svg>
<p class="tb-caption">図: 水平な丸穴の天井はオーバーハングになり垂れる。上部を 45° の三角にしたティアドロップ形なら、サポートなしできれいに積める</p>
<h2>FDM の設計目安 (0.4 mm ノズルの例)</h2>
<table class="tb-table">
  <tr><th>項目</th><th>目安</th></tr>
  <tr><td>オーバーハング</td><td>垂直から 45° 程度まで</td></tr>
  <tr><td>ブリッジ</td><td>5〜10 mm 程度まで</td></tr>
  <tr><td>最小肉厚</td><td>0.8 mm (2 線)、強度部は 1.2〜2 mm</td></tr>
  <tr><td>はめあいのすき間</td><td>片側 0.2〜0.3 mm (機種で調整)</td></tr>
  <tr><td>層の厚さ</td><td>0.1〜0.3 mm (薄いほどきれいで遅い)</td></tr>
  <tr><td>文字・刻印</td><td>線幅 0.8 mm 以上、上向き面に</td></tr>
</table>
<h2>計算例: 層数と造形時間の感覚</h2>
<p>高さ 40 mm の部品を層厚 0.2 mm で積むと 40 / 0.2 = <b>200 層</b>、0.1 mm なら 400 層。層数が 2 倍なら造形時間もおおむね 2 倍です。
同じ部品を寝かせて高さ 15 mm にできれば 75 層で済みます。造形方向は<b>強度・サポート量・時間・表面</b>のバランスで決めます。</p>
<h2>よくある失敗</h2>
<ul>
  <li>はめあいを CAD 寸法どおりに設計 → 入らない (穴は小さく、軸は太く出る)</li>
  <li>細いピン・ツメを積層方向に立てる → 層間で折れる</li>
  <li>大きな平面の角が直角 → そり・はがれ</li>
  <li>サポートの中に機能面 → 跡が残って精度が出ない</li>
</ul>
<div class="tb-tip"><b>3DCAD Studio</b>: 「検査 → 3D プリント」でオーバーハング (赤) と薄肉 (橙) を色分けし、造形方向ごとのサポート量を比べられます。STL / 3MF で書き出してスライサへ。</div>`,
    points: ["オーバーハングは 45° まで — 面取りにすればサポート不要", "最小肉厚はノズル径の 2 倍以上", "穴は小さく出る — はめあいは補正する", "積層方向に弱い — 荷重の向きで造形方向を決める"],
    exercises: [
      {
        q: "下向きの水平な張り出し (幅 15 mm) をサポートなしで造形したい。形をどう変えますか?",
        a: "張り出しの下に <b>45° の面取り (または 45° 以下の傾斜)</b> を付けて、下から少しずつ積み上がる形にします。外観上問題なければ、造形方向を変えて張り出しを上向きにする方法もあります。",
      },
      {
        q: "φ8 の軸を差し込む穴を FDM で造形します。片側すき間 0.25 mm を見込むと、CAD 上の穴径はいくつにしますか?",
        a: "8 + 2 × 0.25 = <b>φ8.5</b>。さらに、穴が横向きならティアドロップ形にし、精度が必要ならドリル・リーマで仕上げます。",
      },
      {
        q: "高さ 40 mm の部品を層厚 0.2 mm と 0.1 mm で積むとき、それぞれの層数は? 寝かせて高さ 15 mm にした場合 (0.2 mm) は?",
        a: "40 / 0.2 = <b>200 層</b>、40 / 0.1 = <b>400 層</b>。寝かせると 15 / 0.2 = <b>75 層</b>。ただし寝かせると荷重の向きと層の関係が変わるので、強度も確認します。",
      },
    ],
    quiz: [
      { q: "FDM でサポートなしに造形しやすい傾きの限界は、水平からおよそ何度?", choices: ["10°", "45°", "80°"], answer: 1, explain: "一般に 45° (垂直から 45°) まではサポートなしで造形できます。" },
      { q: "FDM 部品が最も弱い方向は?", choices: ["積層方向 (層の境目をはがす方向)", "層に沿った方向", "どの方向も同じ"], answer: 0, explain: "層間の接着が弱いため、積層方向に引っ張る力に弱くなります。" },
      { q: "水平な丸い横穴の天井をサポートなしできれいに造形する形は?", choices: ["ティアドロップ (上を 45° でとがらせる)", "穴を小さくする", "層を厚くする"], answer: 0, explain: "天井を 45° の斜面にすれば、各層が下の層に支えられます。" },
    ],
    lessons: ["7-2"],
  },
  {
    id: "dfa",
    part: "knowhow",
    title: "組立性の設計 (DFA) とポカヨケ",
    minutes: 15,
    level: 2,
    lead: "部品が作れても、組み立てにくければコストも品質も悪くなります。部品点数を減らし、迷わず・間違えずに組める設計の考え方を学びます。",
    body: `
<h2>部品点数を減らす</h2>
<p>部品が 1 つ減ると、設計・調達・在庫・検査・組立の仕事がまとめて減ります。次の質問で、その部品が本当に必要かを確かめます。</p>
<ol>
  <li>その部品は、隣の部品に対して<b>動く</b>必要があるか?</li>
  <li><b>別の材料</b>である必要があるか (絶縁・耐摩耗など)?</li>
  <li><b>分解・交換</b>のために別部品である必要があるか?</li>
</ol>
<p>どれにも当てはまらなければ、隣の部品と<b>一体化</b>できる候補です。ねじ・座金などの締結部品も、スナップフィットや位置決め形状で減らせます。</p>
<svg class="tb-chart" viewBox="0 0 520 232" role="img" aria-label="部品統合の前後">
<rect class="k-panel" x="8" y="8" width="244" height="216" rx="8"/><rect class="k-panel" x="268" y="8" width="244" height="216" rx="8"/>
<circle class="k-badge" cx="28" cy="28" r="10" style="fill:var(--tb-bad)"/><text class="k-badge-t" x="28" y="32" text-anchor="middle">✕</text><text class="k-title" x="46" y="32">前: 7 点</text>
<circle class="k-badge" cx="288" cy="28" r="10" style="fill:var(--tb-good)"/><text class="k-badge-t" x="288" y="32" text-anchor="middle">✓</text><text class="k-title" x="306" y="32">後: 2 点</text>
<text class="k-note" x="22" y="54">ベース・ブラケット 2・カバー・ねじ 4</text>
<text class="k-note" x="282" y="54">ベース + 成形カバー</text>
<g class="k-shadow">
<rect class="k-part" x="30" y="168" width="200" height="14" rx="2"/>
<path class="k-alu" d="M60,168 L60,96 L72,96 L72,156 L110,156 L110,168 Z"/>
<path class="k-alu" d="M200,168 L200,96 L188,96 L188,156 L150,156 L150,168 Z"/>
<rect class="k-part" x="50" y="82" width="160" height="14" rx="2"/>
</g>
<line class="k-hidden" x1="66" y1="84" x2="66" y2="112"/><line class="k-hidden" x1="194" y1="84" x2="194" y2="112"/>
<line class="k-hidden" x1="92" y1="158" x2="92" y2="180"/><line class="k-hidden" x1="168" y1="158" x2="168" y2="180"/>
<rect class="k-part" x="60" y="75" width="12" height="7" rx="2" style="stroke-width:1.2"/><circle cx="66" cy="79" r="10" fill="none" style="stroke:var(--tb-bad)" stroke-width="1.4" stroke-dasharray="3 2"/><rect class="k-part" x="188" y="75" width="12" height="7" rx="2" style="stroke-width:1.2"/><circle cx="194" cy="79" r="10" fill="none" style="stroke:var(--tb-bad)" stroke-width="1.4" stroke-dasharray="3 2"/><rect class="k-part" x="86" y="149" width="12" height="7" rx="2" style="stroke-width:1.2"/><circle cx="92" cy="153" r="10" fill="none" style="stroke:var(--tb-bad)" stroke-width="1.4" stroke-dasharray="3 2"/><rect class="k-part" x="162" y="149" width="12" height="7" rx="2" style="stroke-width:1.2"/><circle cx="168" cy="153" r="10" fill="none" style="stroke:var(--tb-bad)" stroke-width="1.4" stroke-dasharray="3 2"/>
<text class="k-bad-t" x="130" y="212" text-anchor="middle">ねじ 4 本 = 4 回の位置合わせと締付</text>
<g class="k-shadow">
<rect class="k-part" x="290" y="168" width="200" height="14" rx="2"/>
<path class="k-plastic" d="M320,190 L320,82 L460,82 L460,190 L448,190 L448,96 L332,96 L332,190 Z"/>
</g>
<path d="M320,180 L312,190 L320,190 Z M460,180 L468,190 L460,190 Z" style="fill:var(--tb-good);stroke:var(--tb-good)" stroke-width="1"/>
<circle cx="318" cy="186" r="10" fill="none" style="stroke:var(--tb-good)" stroke-width="1.4" stroke-dasharray="3 2"/><circle cx="462" cy="186" r="10" fill="none" style="stroke:var(--tb-good)" stroke-width="1.4" stroke-dasharray="3 2"/>
<line class="k-move" x1="390" y1="62" x2="390" y2="78"/>
<text class="k-note" x="390" y="140" text-anchor="middle">スナップ</text><text class="k-note" x="390" y="154" text-anchor="middle">フィット</text>
<line class="k-thin" x1="364" y1="150" x2="326" y2="182"/><line class="k-thin" x1="416" y1="150" x2="456" y2="182"/>
<text class="k-good-t" x="390" y="212" text-anchor="middle">スナップフィットで押し込むだけ</text>
</svg>
<p class="tb-caption">図: ブラケットとカバーは互いに動かず、同じ材料でよいので一体化できる。ねじ 4 本はスナップフィット (緑の爪) に置き換えた</p>
<p>部品統合の効果を動きで確かめましょう。統合前後の組立を再生すると、ねじやブラケットが消え、部品点数と組立時間がどう変わるかが分かります。</p>
<div data-widget="anim-dfa"></div>
<h2>組み立てやすくする</h2>
<ul>
  <li><b>一方向から組む</b>: 上から順に積み重ねられる構造 (ひっくり返さない)</li>
  <li><b>ガイドを付ける</b>: 面取り・テーパで、挿入時に自然に位置が合うように</li>
  <li><b>位置決めを形で</b>: ピン・段・溝で位置を決め、調整作業をなくす</li>
  <li>工具が入るすき間、ねじを回す空間、手が届くかを確認する</li>
  <li>ねじの種類・長さをそろえる</li>
</ul>
<svg class="tb-chart" viewBox="0 0 520 246" role="img" aria-label="面取りによる挿入ガイド">
<rect class="k-panel" x="8" y="8" width="244" height="230" rx="8"/><rect class="k-panel" x="268" y="8" width="244" height="230" rx="8"/>
<circle class="k-badge" cx="28" cy="28" r="10" style="fill:var(--tb-bad)"/><text class="k-badge-t" x="28" y="32" text-anchor="middle">✕</text><text class="k-title" x="46" y="32">面取りなし</text>
<circle class="k-badge" cx="288" cy="28" r="10" style="fill:var(--tb-good)"/><text class="k-badge-t" x="288" y="32" text-anchor="middle">✓</text><text class="k-title" x="306" y="32">面取りあり</text>
<g class="k-shadow"><rect class="k-cut" x="40" y="140" width="75" height="70"/><rect class="k-cut" x="145" y="140" width="75" height="70"/>
<rect class="k-part" x="104" y="72" width="28" height="68" rx="1"/></g>
<line class="k-center" x1="130" y1="134" x2="130" y2="216"/><line class="k-center" x1="118" y1="64" x2="118" y2="146"/>
<circle cx="112" cy="140" r="9" fill="none" style="stroke:var(--tb-bad)" stroke-width="1.6" stroke-dasharray="3 2"/>
<text class="k-bad-t" x="138" y="96">ずれ</text>
<text class="k-bad-t" x="130" y="232" text-anchor="middle">縁に当たって止まる</text>
<g class="k-shadow"><path class="k-cut" d="M300,140 L362,140 L370,148 L370,210 L300,210 Z"/><path class="k-cut" d="M408,140 L470,140 L470,210 L400,210 L400,148 Z"/></g>
<line class="k-center" x1="385" y1="134" x2="385" y2="216"/>
<g><animateTransform attributeName="transform" type="translate" values="0 0;0 22;11 34;11 82;11 82;0 0" keyTimes="0;0.25;0.4;0.65;0.85;1" dur="4s" repeatCount="indefinite" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1;.45 0 .55 1;0 0 1 1;.45 0 .55 1"/>
<path class="k-part" d="M360,60 L388,60 L388,116 L384,120 L364,120 L360,116 Z" style="filter:url(#k-shadow)"/></g>
<text class="k-dimtext" x="440" y="128">C 面取り</text>
<line class="k-ext" x1="438" y1="124" x2="406" y2="143" style="marker-end:url(#k-arrow-blue)"/>
<text class="k-good-t" x="390" y="232" text-anchor="middle">斜面に沿って自然に入る</text>
</svg>
<p class="tb-caption">図: 穴の入口に面取り (ガイド) を付けると、少しずれて差し込んでも斜面で位置が修正される (右はピンが入る動き)</p>
<h2>ポカヨケ (誤組防止)</h2>
<p>人は必ず間違えます。<b>間違えた組み方ができない形</b>にするのがポカヨケです。</p>
<ul>
  <li>対称に見えて実は向きがある部品 → <b>はっきり非対称</b>にする、または完全に対称にする</li>
  <li>表裏・上下を間違えると<b>入らない</b>ように、ピンや切り欠きの位置をずらす</li>
  <li>似ているが違う部品 (長さ違いのねじなど) を同じ製品に混在させない</li>
  <li>コネクタは形・色で区別する</li>
</ul>
<svg class="tb-chart" viewBox="0 0 520 226" role="img" aria-label="ポカヨケ — ピン位置の非対称化">
<rect class="k-panel" x="8" y="8" width="244" height="210" rx="8"/><rect class="k-panel" x="268" y="8" width="244" height="210" rx="8"/>
<circle class="k-badge" cx="28" cy="28" r="10" style="fill:var(--tb-bad)"/><text class="k-badge-t" x="28" y="32" text-anchor="middle">✕</text><text class="k-title" x="46" y="32">対称配置</text>
<circle class="k-badge" cx="288" cy="28" r="10" style="fill:var(--tb-good)"/><text class="k-badge-t" x="288" y="32" text-anchor="middle">✓</text><text class="k-title" x="306" y="32">片方のピンをずらす</text>
<g class="k-shadow"><rect class="k-alu" x="40" y="58" width="180" height="84" rx="6"/><rect class="k-alu" x="300" y="58" width="180" height="84" rx="6"/></g>
<circle class="k-sphere" cx="70" cy="100" r="8"/><circle class="k-sphere" cx="190" cy="100" r="8"/>
<path class="k-move" d="M118,78 A30,22 0 1 1 118,122"/>
<text class="lbl" x="130" y="164" text-anchor="middle">180° 回しても入る</text>
<circle class="k-sphere" cx="330" cy="100" r="8"/><circle class="k-sphere" cx="450" cy="76" r="8"/>
<circle cx="450" cy="100" r="8" fill="none" style="stroke:var(--tb-bad)" stroke-width="1.4" stroke-dasharray="3 2"/><circle cx="330" cy="124" r="8" fill="none" style="stroke:var(--tb-bad)" stroke-width="1.4" stroke-dasharray="3 2"/>
<text class="lbl" x="390" y="164" text-anchor="middle">向きは 1 通りだけ</text>
<text class="k-note" x="390" y="180" text-anchor="middle">破線 = 180° 回したときの位置</text>
<text class="k-bad-t" x="130" y="204" text-anchor="middle">逆向きに組めてしまう</text>
<text class="k-good-t" x="390" y="204" text-anchor="middle">間違えると入らない</text>
</svg>
<p class="tb-caption">図: 上から見た取付面と位置決めピン。ピンを対称に置くと裏返し・逆向きでも入るが、位置をずらせば正しい向きでしか組めない</p>
<svg class="tb-chart" viewBox="0 0 520 220" role="img" aria-label="組付け方向の数">
<rect class="k-panel" x="8" y="8" width="244" height="204" rx="8"/><rect class="k-panel" x="268" y="8" width="244" height="204" rx="8"/>
<circle class="k-badge" cx="28" cy="28" r="10" style="fill:var(--tb-bad)"/><text class="k-badge-t" x="28" y="32" text-anchor="middle">✕</text><text class="k-title" x="46" y="32">3 方向から締結</text>
<circle class="k-badge" cx="288" cy="28" r="10" style="fill:var(--tb-good)"/><text class="k-badge-t" x="288" y="32" text-anchor="middle">✓</text><text class="k-title" x="306" y="32">上 1 方向から組む</text>
<g class="k-shadow"><rect class="k-alu" x="70" y="90" width="120" height="80" rx="3"/><rect class="k-alu" x="330" y="90" width="120" height="80" rx="3"/></g>
<line class="k-force" x1="130" y1="50" x2="130" y2="86"/><line class="k-force" x1="40" y1="130" x2="66" y2="130"/><line class="k-force" x1="130" y1="206" x2="130" y2="174" />
<text class="k-bad-t" x="200" y="70">裏返し・持ち替え</text>
<line x1="360" y1="48" x2="360" y2="86" style="stroke:var(--tb-good);marker-end:url(#k-arrow-green)" stroke-width="2.4"/>
<line x1="390" y1="48" x2="390" y2="86" style="stroke:var(--tb-good);marker-end:url(#k-arrow-green)" stroke-width="2.4"/>
<line x1="420" y1="48" x2="420" y2="86" style="stroke:var(--tb-good);marker-end:url(#k-arrow-green)" stroke-width="2.4"/>
<text class="k-good-t" x="390" y="196" text-anchor="middle">重力を味方に積み重ねる</text>
</svg>
<p class="tb-caption">図: 組付け方向が増えるほど、ワークの裏返し・持ち替え・治具の付け替えが増える。上から積み重ねる (トップダウン組立) 構造にする</p>
<h2>組立効率を数値で見る</h2>
<p>DFA の代表的な手法 (Boothroyd–Dewhurst 法) では、理論上の最少部品数 N<sub>min</sub> (上の 3 つの質問で残る部品数) と、実際の組立時間 T から<b>組立効率</b>を求めます。1 部品あたりの理想時間を約 3 秒とします。</p>
<div class="tb-formula">組立効率 E = 3 × N<sub>min</sub> / T　(T: 全部品の組立時間 [s])</div>
<table class="tb-table">
  <tr><th></th><th>部品点数</th><th>ねじ</th><th>組立時間 T</th><th>N<sub>min</sub></th><th>効率 E</th></tr>
  <tr><td>改善前</td><td>12</td><td>6 本</td><td>85 s</td><td>4</td><td>14 %</td></tr>
  <tr><td>改善後</td><td>5</td><td>1 本</td><td>30 s</td><td>4</td><td>40 %</td></tr>
</table>
<p>改善前: E = 3 × 4 / 85 ≈ 0.14。ねじとブラケットを統合して改善後: E = 3 × 4 / 30 = 0.40。部品点数が減ると、組立時間だけでなく部品表の行・発注・検査もまとめて減ります。</p>
<h2>よくある失敗</h2>
<ul>
  <li>長さだけ違うねじが混在 — 取り違え・締め忘れ</li>
  <li>組立順の後ろで、先に付けた部品が工具の邪魔になる</li>
  <li>柔らかい部品 (ケーブル・ホース) の取り回しを考えていない</li>
  <li>位置決めを「現物合わせ」に任せる — ばらつきと調整時間</li>
</ul>
<div class="tb-tip"><b>3DCAD Studio</b>: アセンブリの部品表で部品点数・ねじの種類を確認し、干渉解析で組立時のぶつかりを確かめましょう。分解表示は組立手順書の作成にも使えます。</div>`,
    points: ["部品点数を減らす (動く・材料が違う・分解が必要 以外は統合候補)", "一方向から組める構造、面取りでガイド", "位置決めは形で — 調整作業をなくす", "ポカヨケ: 間違った組み方ができない形にする"],
    exercises: [
      {
        q: "4 本のねじで留めているカバー (板金) を、組立工数を減らすために設計変更する案を 2 つ挙げてください。",
        a: "例: ① 一辺をツメ (引っ掛け) にして差し込み、反対側だけ 1〜2 本のねじで留める。② 樹脂化してスナップフィットにし、ねじをなくす。③ ねじを残す場合も、種類をそろえ、仮置きできるガイドピンを付ける。",
      },
      {
        q: "ある製品は部品 12 点、組立時間 85 秒で、理論最少部品数は 4 点です。組立効率は? 部品を 5 点・30 秒にすると?",
        a: "改善前 E = 3 × 4 / 85 ≈ <b>14 %</b>。改善後 E = 3 × 4 / 30 = <b>40 %</b>。組立時間は 55 秒 (約 65 %) 短縮です。",
      },
      {
        q: "ねじ 6 本 (締付け 1 本 8 秒) を、ツメ 2 か所 + ねじ 1 本に変えます。ツメ 1 か所の組付けを 3 秒とすると、締結にかかる時間は何秒短くなりますか?",
        a: "改善前 6 × 8 = 48 秒。改善後 2 × 3 + 1 × 8 = 14 秒。<b>34 秒短縮</b>。ねじ・座金の部品点数も減ります。",
      },
    ],
    quiz: [
      { q: "隣の部品と一体化できる可能性が高いのは?", choices: ["相手に対して回転する部品", "同じ材料で、動かず、分解も不要な部品", "絶縁が必要な部品"], answer: 1, explain: "動かず・同じ材料で・分解不要なら、一体化の候補です。" },
      { q: "ポカヨケの例として適切なのは?", choices: ["組立手順書を厚くする", "逆向きでは入らないようにピン位置をずらす", "作業者に注意を促す"], answer: 1, explain: "ポカヨケは注意に頼らず、物理的に間違えられない形にすることです。" },
      { q: "組立時間を短くする構造として適切なのは?", choices: ["上から一方向に積み重ねて組める", "上下左右から順にねじ止めする", "組立後に現物合わせで調整する"], answer: 0, explain: "組付け方向を 1 つにまとめると裏返しや持ち替えがなくなります。" },
    ],
    lessons: ["5-1"],
  },
  {
    id: "cad-practice",
    part: "knowhow",
    title: "3D CAD モデリングの作法",
    minutes: 15,
    level: 1,
    lead: "同じ形でも、作り方 (フィーチャ履歴) によって「変更に強いモデル」と「すぐ壊れるモデル」ができます。チームで使い回せるモデルを作るための作法です。",
    body: `
<h2>設計意図をモデルに込める</h2>
<ul>
  <li><b>原点・基準平面を基準に</b>: 対称な部品は原点を中心に描き、基準平面に対して対称にする</li>
  <li><b>スケッチは完全拘束</b>: 寸法を変えたとき形が予想どおりに変わる</li>
  <li><b>寸法は機能から</b>: 図面に書きたい寸法 (機能寸法) でスケッチを拘束しておくと、図面化も楽</li>
  <li><b>関係は式で</b>: 「穴は中央」「高さは幅の 1/4」をパラメータの式で表す</li>
</ul>
<svg class="tb-chart" viewBox="0 0 520 280" role="img" aria-label="寸法の付け方と設計意図">
<rect class="k-panel" x="8" y="8" width="504" height="128" rx="8"/><circle class="k-badge" cx="28" cy="28" r="10" style="fill:var(--tb-bad)"/><text class="k-badge-t" x="28" y="32" text-anchor="middle">✕</text><text class="k-title" x="46" y="32">端からの寸法</text><g class="k-shadow"><rect class="k-alu" x="50" y="48" width="120" height="44" rx="2"/><rect class="k-alu" x="270" y="48" width="150" height="44" rx="2"/></g><circle cx="110" cy="70" r="8" style="fill:var(--tb-surface);stroke:var(--k-line)" stroke-width="1.6"/><circle cx="330" cy="70" r="8" style="fill:var(--tb-surface);stroke:var(--tb-bad)" stroke-width="2.2"/><line class="k-center" x1="345" y1="42" x2="345" y2="100"/><line class="k-move" x1="188" y1="70" x2="252" y2="70"/><text class="k-note" x="220" y="62" text-anchor="middle">幅を変更</text><line class="k-ext" x1="50" y1="94" x2="50" y2="112"/><line class="k-ext" x1="110" y1="80" x2="110" y2="112"/><line class="k-dimline" x1="50" y1="108" x2="110" y2="108"/><text class="k-dimtext" x="80" y="104" text-anchor="middle">80</text><line class="k-ext" x1="270" y1="94" x2="270" y2="112"/><line class="k-ext" x1="330" y1="80" x2="330" y2="112"/><line class="k-dimline" x1="270" y1="108" x2="330" y2="108"/><text class="k-dimtext" x="300" y="104" text-anchor="middle">80</text><path d="M330,44 L345,44" fill="none" style="stroke:var(--tb-bad)" stroke-width="2"/><text class="k-bad-t" x="436" y="74">ずれ</text><text class="k-note" x="110" y="128" text-anchor="middle">元: 幅 160、穴は左端から 80</text><text class="k-note" x="345" y="128" text-anchor="middle" style="fill:var(--tb-bad);font-weight:700">幅を 200 に変更 → 穴が中央からずれる</text>
<rect class="k-panel" x="8" y="144" width="504" height="128" rx="8"/><circle class="k-badge" cx="28" cy="164" r="10" style="fill:var(--tb-good)"/><text class="k-badge-t" x="28" y="168" text-anchor="middle">✓</text><text class="k-title" x="46" y="168">「中央」に拘束</text><g class="k-shadow"><rect class="k-alu" x="50" y="184" width="120" height="44" rx="2"/><rect class="k-alu" x="270" y="184" width="150" height="44" rx="2"/></g><circle cx="110" cy="206" r="8" style="fill:var(--tb-surface);stroke:var(--k-line)" stroke-width="1.6"/><circle cx="345" cy="206" r="8" style="fill:var(--tb-surface);stroke:var(--tb-good)" stroke-width="2.2"/><line class="k-center" x1="345" y1="178" x2="345" y2="236"/><line class="k-move" x1="188" y1="206" x2="252" y2="206"/><text class="k-note" x="220" y="198" text-anchor="middle">幅を変更</text><line class="k-ext" x1="50" y1="230" x2="50" y2="248"/><line class="k-ext" x1="110" y1="216" x2="110" y2="248"/><line class="k-ext" x1="170" y1="230" x2="170" y2="248"/><line class="k-dimline" x1="50" y1="244" x2="110" y2="244"/><line class="k-dimline" x1="110" y1="244" x2="170" y2="244"/><text class="k-dimtext" x="80" y="240" text-anchor="middle">幅/2</text><text class="k-dimtext" x="140" y="240" text-anchor="middle">幅/2</text><line class="k-ext" x1="270" y1="230" x2="270" y2="248"/><line class="k-ext" x1="345" y1="216" x2="345" y2="248"/><line class="k-ext" x1="420" y1="230" x2="420" y2="248"/><line class="k-dimline" x1="270" y1="244" x2="345" y2="244"/><line class="k-dimline" x1="345" y1="244" x2="420" y2="244"/><text class="k-dimtext" x="307" y="240" text-anchor="middle">幅/2</text><text class="k-dimtext" x="382" y="240" text-anchor="middle">幅/2</text><text class="k-note" x="110" y="264" text-anchor="middle">元: 穴を「中央」に拘束 (幅/2)</text><text class="k-note" x="345" y="264" text-anchor="middle" style="fill:var(--tb-good);font-weight:700">幅を 200 に変更 → 穴は中央に追従</text>
</svg>
<p class="tb-caption">図: 同じ形でも、寸法の付け方 (拘束) で変更時のふるまいが変わる。「穴は中央」という意図は、対称拘束か式 (幅/2) でモデルに込める</p>
<h2>フィーチャの順序</h2>
<ol>
  <li>主要な形 (ベース) — 押し出し・回転</li>
  <li>大きな加工 (切り取り・穴)</li>
  <li>パターン・ミラー</li>
  <li>仕上げ — フィレット・面取り・シェル (最後のほうに)</li>
</ol>
<p>フィレットや面取りのエッジを参照して後のフィーチャを作ると、フィレットを変えただけで参照が壊れやすくなります。</p>
<svg class="tb-chart" viewBox="0 0 520 176" role="img" aria-label="フィーチャの順序と参照">
<text class="lbl" x="260" y="22" text-anchor="middle">仕上げ (フィレット・面取り) は最後に</text>
<rect x="20" y="40" width="105" height="62" rx="8" style="fill:var(--tb-surface);stroke:var(--tb-accent)" stroke-width="1.5"/><rect class="k-part" x="59" y="52" width="26" height="14" rx="1.5" style="stroke-width:1.2"/><text class="lbl" x="72" y="90" text-anchor="middle">ベース押し出し</text><circle class="k-badge" cx="20" cy="40" r="10" style="fill:var(--tb-accent)"/><text class="k-badge-t" x="20" y="44" text-anchor="middle">1</text><line class="k-move" x1="127" y1="71" x2="143" y2="71" style="stroke-width:1.6"/><rect x="145" y="40" width="105" height="62" rx="8" style="fill:var(--tb-surface);stroke:var(--tb-accent)" stroke-width="1.5"/><rect class="k-part" x="184" y="52" width="26" height="14" rx="1.5" style="stroke-width:1.2"/><ellipse cx="197" cy="59" rx="4" ry="3" style="fill:var(--tb-surface);stroke:var(--k-line)"/><text class="lbl" x="197" y="90" text-anchor="middle">穴</text><circle class="k-badge" cx="145" cy="40" r="10" style="fill:var(--tb-accent)"/><text class="k-badge-t" x="145" y="44" text-anchor="middle">2</text><line class="k-move" x1="252" y1="71" x2="268" y2="71" style="stroke-width:1.6"/><rect x="270" y="40" width="105" height="62" rx="8" style="fill:var(--tb-surface);stroke:var(--tb-accent)" stroke-width="1.5"/><rect class="k-part" x="309" y="52" width="26" height="14" rx="1.5" style="stroke-width:1.2"/><circle cx="314" cy="59" r="2.4" style="fill:var(--tb-surface);stroke:var(--k-line)"/><circle cx="322" cy="59" r="2.4" style="fill:var(--tb-surface);stroke:var(--k-line)"/><circle cx="330" cy="59" r="2.4" style="fill:var(--tb-surface);stroke:var(--k-line)"/><text class="lbl" x="322" y="90" text-anchor="middle">パターン</text><circle class="k-badge" cx="270" cy="40" r="10" style="fill:var(--tb-accent)"/><text class="k-badge-t" x="270" y="44" text-anchor="middle">3</text><line class="k-move" x1="377" y1="71" x2="393" y2="71" style="stroke-width:1.6"/><rect x="395" y="40" width="105" height="62" rx="8" style="fill:var(--tb-surface);stroke:var(--tb-accent)" stroke-width="1.5"/><path class="k-part" d="M434,66 L434,58 Q434,52 440,52 L460,52 L460,66 Z" style="stroke-width:1.2"/><text class="lbl" x="447" y="90" text-anchor="middle">フィレット</text><circle class="k-badge" cx="395" cy="40" r="10" style="fill:var(--tb-accent)"/><text class="k-badge-t" x="395" y="44" text-anchor="middle">4</text>
<path d="M197,104 C210,146 430,146 447,106" fill="none" style="stroke:var(--tb-bad);marker-end:url(#k-arrow-red)" stroke-width="2" stroke-dasharray="5 3"/>
<text class="k-bad-t" x="322" y="128" text-anchor="middle">✕ 参照</text>
<text class="lbl" x="260" y="166" text-anchor="middle" style="fill:var(--tb-bad)">途中のフィーチャがフィレットの稜線を参照すると、R を変えただけで壊れやすい</text>
</svg>
<p class="tb-caption">図: フィーチャは「ベース → 大きな加工 → パターン → 仕上げ」の順に。フィレットの稜線や面を前のフィーチャから参照しない</p>
<h2>扱いやすいモデルのために</h2>
<ul>
  <li>1 つのスケッチに詰め込みすぎない (1 スケッチ 1 機能が目安)</li>
  <li>フィーチャとパラメータに<b>意味のある名前</b> (例: 取付穴、板厚)</li>
  <li>不要なフィーチャ・抑制したままのフィーチャを残さない</li>
  <li>材料・iProperties (品番・名称・設計者) を入れる — 部品表と図面に反映される</li>
  <li>サイズ違いはファミリー表、規則はルールで管理する</li>
</ul>
<svg class="tb-chart" viewBox="0 0 520 230" role="img" aria-label="フィーチャツリーの比較">
<rect class="k-panel" x="8" y="8" width="244" height="214" rx="8"/><rect class="k-panel" x="268" y="8" width="244" height="214" rx="8"/>
<circle class="k-badge" cx="28" cy="28" r="10" style="fill:var(--tb-bad)"/><text class="k-badge-t" x="28" y="32" text-anchor="middle">✕</text><text class="k-title" x="46" y="32">名前なし・参照が乱れる</text>
<circle class="k-badge" cx="288" cy="28" r="10" style="fill:var(--tb-good)"/><text class="k-badge-t" x="288" y="32" text-anchor="middle">✓</text><text class="k-title" x="306" y="32">名前付き・順序どおり</text>
<rect x="30" y="46" width="200" height="19" rx="3" class="k-panel"/><text class="lbl" x="40" y="60">押し出し1</text>
<rect x="290" y="46" width="200" height="19" rx="3" class="k-panel"/><text class="lbl" x="300" y="60">ベース (板厚=t)</text>
<rect x="30" y="68" width="200" height="19" rx="3" class="k-panel"/><text class="lbl" x="40" y="82">フィレット1</text>
<rect x="290" y="68" width="200" height="19" rx="3" class="k-panel"/><text class="lbl" x="300" y="82">取付面の段</text>
<rect x="30" y="90" width="200" height="19" rx="3" class="k-panel"/><text class="lbl" x="40" y="104" style="fill:var(--tb-bad)">スケッチ5 (フィレット面に配置)</text>
<rect x="290" y="90" width="200" height="19" rx="3" class="k-panel"/><text class="lbl" x="300" y="104">取付穴 M5</text>
<rect x="30" y="112" width="200" height="19" rx="3" class="k-panel"/><text class="lbl" x="40" y="126">押し出し3</text>
<rect x="290" y="112" width="200" height="19" rx="3" class="k-panel"/><text class="lbl" x="300" y="126">取付穴パターン</text>
<rect x="30" y="134" width="200" height="19" rx="3" class="k-panel"/><text class="lbl" x="40" y="148">穴2</text>
<rect x="290" y="134" width="200" height="19" rx="3" class="k-panel"/><text class="lbl" x="300" y="148">肉抜き</text>
<rect x="30" y="156" width="200" height="19" rx="3" class="k-panel"/><text class="lbl" x="40" y="170" style="fill:var(--tb-bad)">パターン1 (無効)</text>
<rect x="290" y="156" width="200" height="19" rx="3" class="k-panel"/><text class="lbl" x="300" y="170">フィレット R3</text>
<rect x="30" y="178" width="200" height="19" rx="3" class="k-panel"/><text class="lbl" x="40" y="192">面取り4</text>
<rect x="290" y="178" width="200" height="19" rx="3" class="k-panel"/><text class="lbl" x="300" y="192">面取り C0.5</text>
<text class="k-bad-t" x="130" y="218" text-anchor="middle">変更すると参照が切れる</text><text class="k-good-t" x="390" y="218" text-anchor="middle">誰が開いても意図が読める</text>
</svg>
<p class="tb-caption">図: 同じ部品のフィーチャツリー。左はフィレット面にスケッチを置いており、R を変えると以降のフィーチャが壊れる。右は機能名で並び、仕上げが最後にある</p>
<h2>計算例: 式で設計意図を残す</h2>
<p>幅 W の板に、両端から 15 mm の位置を起点として n 個の穴を等間隔に並べるとします。ピッチを式にしておけば、W や n を変えても自動で並び直します。</p>
<div class="tb-formula">ピッチ p = (W − 2 × 15) / (n − 1)　　W = 120、n = 4 → p = 90 / 3 = 30 mm</div>
<p>W = 150 に変えれば p = 40 mm。数値で 30 と入れていたら、穴が端に寄ったまま残ります。</p>
<h2>モデルの点検チェックリスト</h2>
<table class="tb-table">
  <tr><th>項目</th><th>確認</th></tr>
  <tr><td>スケッチ</td><td>すべて完全拘束か。原点・基準平面に関係付いているか</td></tr>
  <tr><td>参照</td><td>フィレット・面取りの面や稜線を後のフィーチャが参照していないか</td></tr>
  <tr><td>パラメータ</td><td>主要寸法に名前があるか (t, W, pitch)。式で関係付けたか</td></tr>
  <tr><td>ツリー</td><td>エラー・警告・抑制フィーチャが残っていないか</td></tr>
  <tr><td>プロパティ</td><td>材料・品番・名称・設計者・質量が入っているか</td></tr>
  <tr><td>変更テスト</td><td>主要寸法を ±20 % 振っても再構築できるか</td></tr>
</table>
<h2>よくある失敗</h2>
<ul>
  <li>他人のモデルの寸法を変えたら、穴が飛ぶ・フィーチャが赤くなる (参照の連鎖)</li>
  <li>アセンブリで部品同士を関連付けすぎ — 1 部品の変更が全体に波及して重くなる</li>
  <li>インポートしたモデル (STEP) に履歴があると思い込む — 形状だけで意図は失われている</li>
</ul>
<div class="tb-tip"><b>3DCAD Studio の学習センター</b> (第 1〜4 章) で、これらの作法を実際に体験できます。</div>`,
    points: ["原点・基準平面を基準に、スケッチは完全拘束", "関係は式で — 設計意図を残す", "ベース → 加工 → パターン → 仕上げ の順", "名前・材料・iProperties を入れて再利用しやすく"],
    exercises: [
      {
        q: "幅 W の板の中央に穴を置くモデルで、幅を変えると穴が中央からずれてしまいました。原因と対策は?",
        a: "穴の位置寸法が数値 (例: 40) で入っているためです。位置を <b>W / 2</b> の式にするか、板を原点に対して対称に描いて穴を原点に一致させます (どちらも設計意図「穴は中央」を表す)。",
      },
      {
        q: "幅 W の板に、端から 15 mm を起点として 4 個の穴を等間隔に並べます。W = 120 と 150 のときのピッチを求め、ピッチの式を書きなさい。",
        a: "p = (W − 30) / (n − 1)。W = 120 → 90 / 3 = <b>30 mm</b>、W = 150 → 120 / 3 = <b>40 mm</b>。",
      },
      {
        q: "R3 のフィレット面にスケッチを置いて穴をあけたモデルで、R を 5 に変えたら穴が消えました。原因と直し方は?",
        a: "フィレットの再計算で面の ID が変わり、スケッチの配置面 (参照) が失われたためです。穴のスケッチを<b>基準平面や主要な平面</b>に置き直し、フィレットは<b>ツリーの最後</b>に移します。",
      },
    ],
    quiz: [
      { q: "フィレットを作る順序として一般的に良いのは?", choices: ["最初", "主要な形と加工の後 (最後のほう)", "スケッチの前"], answer: 1, explain: "仕上げのフィーチャは最後にまとめると、参照が壊れにくく変更に強いモデルになります。" },
      { q: "スケッチを完全拘束にする主な理由は?", choices: ["ファイルが小さくなる", "寸法変更時に形が予想どおりに変わる", "表示が速くなる"], answer: 1, explain: "自由度が残っていると、寸法を変えたときに想定外の動き方をします。" },
      { q: "主要寸法を変えてもモデルが壊れないか確かめる良い方法は?", choices: ["寸法を ±20 % 程度振って再構築してみる", "表示色を変える", "ファイルを別名保存する"], answer: 0, explain: "変更テストで参照切れや拘束不足が見つかります。" },
    ],
    lessons: ["1-2", "2-2", "4-1"],
  },
  {
    id: "review",
    part: "knowhow",
    title: "設計レビューとよくある失敗",
    minutes: 15,
    level: 2,
    lead: "設計の誤りは、後の工程で見つかるほど修正費用が大きくなります。設計審査 (デザインレビュー) のチェックリストと、よくある失敗例を紹介します。",
    body: `
<h2>修正コストは 10 倍ずつ増える</h2>
<p>設計中に見つかれば図面を直すだけですが、試作後なら部品の作り直し、量産後なら回収や金型修正が必要になります。
「早く見つけて早く直す」ために、節目ごとに<b>設計レビュー</b>を行います。</p>
<svg class="tb-chart" viewBox="0 0 520 214" role="img" aria-label="修正コストの増え方">
<line class="grid" x1="60" y1="155" x2="490" y2="155"/><text class="tick" x="54" y="159" text-anchor="end">1</text><line class="grid" x1="60" y1="113" x2="490" y2="113"/><text class="tick" x="54" y="117" text-anchor="end">10</text><line class="grid" x1="60" y1="71" x2="490" y2="71"/><text class="tick" x="54" y="75" text-anchor="end">100</text><line class="grid" x1="60" y1="29" x2="490" y2="29"/><text class="tick" x="54" y="33" text-anchor="end">1000</text>
<line class="axis" x1="60" y1="180" x2="490" y2="180"/><line class="axis" x1="60" y1="20" x2="60" y2="180"/>
<path d="M123,150 C200,140 300,90 423,24" fill="none" style="stroke:var(--tb-text-3)" stroke-width="1.2" stroke-dasharray="4 3"/>
<rect x="95" y="155" width="56" height="25" rx="4" style="fill:var(--tb-accent);fill-opacity:0.45"/><text class="mark-t" x="123" y="147" text-anchor="middle">×1</text><text class="tick" x="123" y="198" text-anchor="middle">設計中</text><rect x="195" y="113" width="56" height="67" rx="4" style="fill:var(--tb-accent);fill-opacity:0.63"/><text class="mark-t" x="223" y="105" text-anchor="middle">×10</text><text class="tick" x="223" y="198" text-anchor="middle">試作後</text><rect x="295" y="71" width="56" height="109" rx="4" style="fill:var(--tb-accent);fill-opacity:0.81"/><text class="mark-t" x="323" y="63" text-anchor="middle">×100</text><text class="tick" x="323" y="198" text-anchor="middle">量産準備</text><rect x="395" y="29" width="56" height="151" rx="4" style="fill:var(--tb-bad);fill-opacity:1"/><text class="mark-t" x="423" y="21" text-anchor="middle">×1000</text><text class="tick" x="423" y="198" text-anchor="middle">出荷後</text>
<text class="lbl" x="66" y="14" text-anchor="start">修正コスト (相対値・対数目盛)</text>
</svg>
<p class="tb-caption">図: 見つかる時期が 1 段階遅れるごとに修正コストはおよそ 10 倍になると言われる (経験則・目安)。早い時期のレビューほど効果が大きい</p>
<h2>設計チェックリスト (例)</h2>
<table class="tb-table">
  <tr><th>分類</th><th>確認すること</th></tr>
  <tr><td>機能</td><td>仕様をすべて満たすか。動く範囲で干渉しないか。最悪の公差でも組めるか</td></tr>
  <tr><td>強度・剛性</td><td>最大荷重・衝撃・繰り返しを想定したか。応力集中部に R があるか。たわみは許容内か</td></tr>
  <tr><td>製造</td><td>加工・板金・成形できる形か。工具が届くか。素材は規格品か</td></tr>
  <tr><td>組立・保守</td><td>組立順序、工具の入るすき間、消耗部品の交換性、誤組防止</td></tr>
  <tr><td>安全</td><td>鋭い角・挟み込み・回転部のカバー・電気安全・転倒</td></tr>
  <tr><td>環境</td><td>温度・湿度・腐食・振動・粉じん、異種金属の接触 (電食)</td></tr>
  <tr><td>図面</td><td>寸法の漏れ・重複、公差・材料・表面処理・注記、版の管理</td></tr>
</table>
<h2>よくある失敗例</h2>
<ul>
  <li><b>熱膨張を忘れた</b>: アルミと鋼を長い距離でボルト固定 → 温度変化で反り・ねじの緩み</li>
  <li><b>工具が入らない</b>: ボルトの頭が壁に近すぎてレンチが回らない</li>
  <li><b>入隅が鋭い</b>: 繰り返し荷重で角から疲労き裂</li>
  <li><b>公差の積み上げ</b>: 部品単体は合格なのに組むと入らない</li>
  <li><b>異種金属の接触</b>: アルミとステンレスが水分のある所で接触 → アルミが腐食</li>
  <li><b>想定外の使い方</b>: 踏み台にされる、落とされる、子どもが触る</li>
</ul>
<h2>FMEA (故障モード影響解析) 入門</h2>
<p>部品ごとに「どう壊れうるか (故障モード)」「そのとき何が起こるか (影響)」「原因」を表にし、
<b>重大度 × 発生度 × 検出度</b>で優先順位を付けて対策します。起こる前に失敗を想像する道具です。</p>
<svg class="tb-chart" viewBox="0 0 520 170" role="img" aria-label="FMEA の優先度 RPN">
<rect x="30" y="34" width="90" height="82" rx="8" style="fill:var(--tb-surface);stroke:var(--tb-accent)" stroke-width="1.5"/><text class="lbl" x="75" y="54" text-anchor="middle">重大度 S</text><text x="75" y="86" text-anchor="middle" style="fill:var(--tb-text);font-size:22px;font-weight:700">8</text><rect x="40.0" y="98" width="5.6" height="8" rx="1" style="fill:var(--tb-accent)"/><rect x="47.2" y="98" width="5.6" height="8" rx="1" style="fill:var(--tb-accent)"/><rect x="54.4" y="98" width="5.6" height="8" rx="1" style="fill:var(--tb-accent)"/><rect x="61.6" y="98" width="5.6" height="8" rx="1" style="fill:var(--tb-accent)"/><rect x="68.8" y="98" width="5.6" height="8" rx="1" style="fill:var(--tb-accent)"/><rect x="76.0" y="98" width="5.6" height="8" rx="1" style="fill:var(--tb-accent)"/><rect x="83.2" y="98" width="5.6" height="8" rx="1" style="fill:var(--tb-accent)"/><rect x="90.4" y="98" width="5.6" height="8" rx="1" style="fill:var(--tb-accent)"/><rect x="97.6" y="98" width="5.6" height="8" rx="1" style="fill:var(--tb-border)"/><rect x="104.8" y="98" width="5.6" height="8" rx="1" style="fill:var(--tb-border)"/><text class="mark-t" x="135" y="82" text-anchor="middle">×</text>
<rect x="150" y="34" width="90" height="82" rx="8" style="fill:var(--tb-surface);stroke:var(--tb-accent)" stroke-width="1.5"/><text class="lbl" x="195" y="54" text-anchor="middle">発生度 O</text><text x="195" y="86" text-anchor="middle" style="fill:var(--tb-text);font-size:22px;font-weight:700">3</text><rect x="160.0" y="98" width="5.6" height="8" rx="1" style="fill:var(--tb-accent)"/><rect x="167.2" y="98" width="5.6" height="8" rx="1" style="fill:var(--tb-accent)"/><rect x="174.4" y="98" width="5.6" height="8" rx="1" style="fill:var(--tb-accent)"/><rect x="181.6" y="98" width="5.6" height="8" rx="1" style="fill:var(--tb-border)"/><rect x="188.8" y="98" width="5.6" height="8" rx="1" style="fill:var(--tb-border)"/><rect x="196.0" y="98" width="5.6" height="8" rx="1" style="fill:var(--tb-border)"/><rect x="203.2" y="98" width="5.6" height="8" rx="1" style="fill:var(--tb-border)"/><rect x="210.4" y="98" width="5.6" height="8" rx="1" style="fill:var(--tb-border)"/><rect x="217.6" y="98" width="5.6" height="8" rx="1" style="fill:var(--tb-border)"/><rect x="224.8" y="98" width="5.6" height="8" rx="1" style="fill:var(--tb-border)"/><text class="mark-t" x="255" y="82" text-anchor="middle">×</text>
<rect x="270" y="34" width="90" height="82" rx="8" style="fill:var(--tb-surface);stroke:var(--tb-accent)" stroke-width="1.5"/><text class="lbl" x="315" y="54" text-anchor="middle">検出度 D</text><text x="315" y="86" text-anchor="middle" style="fill:var(--tb-text);font-size:22px;font-weight:700">5</text><rect x="280.0" y="98" width="5.6" height="8" rx="1" style="fill:var(--tb-accent)"/><rect x="287.2" y="98" width="5.6" height="8" rx="1" style="fill:var(--tb-accent)"/><rect x="294.4" y="98" width="5.6" height="8" rx="1" style="fill:var(--tb-accent)"/><rect x="301.6" y="98" width="5.6" height="8" rx="1" style="fill:var(--tb-accent)"/><rect x="308.8" y="98" width="5.6" height="8" rx="1" style="fill:var(--tb-accent)"/><rect x="316.0" y="98" width="5.6" height="8" rx="1" style="fill:var(--tb-border)"/><rect x="323.2" y="98" width="5.6" height="8" rx="1" style="fill:var(--tb-border)"/><rect x="330.4" y="98" width="5.6" height="8" rx="1" style="fill:var(--tb-border)"/><rect x="337.6" y="98" width="5.6" height="8" rx="1" style="fill:var(--tb-border)"/><rect x="344.8" y="98" width="5.6" height="8" rx="1" style="fill:var(--tb-border)"/><text class="mark-t" x="387" y="82" text-anchor="middle">=</text>
<rect x="405" y="34" width="90" height="82" rx="8" style="fill:var(--tb-surface);stroke:var(--tb-bad)" stroke-width="2"/><text class="lbl" x="450" y="54" text-anchor="middle">RPN</text><text x="450" y="86" text-anchor="middle" style="fill:var(--tb-bad);font-size:22px;font-weight:700">120</text>
<text class="k-note" x="450" y="106" text-anchor="middle">最大 1000</text>
<text class="tick" x="260" y="146" text-anchor="middle">各 1〜10 点で評価。RPN の大きい項目、または S が大きい項目から対策する</text>
</svg>
<p class="tb-caption">図: FMEA では重大度・発生度・検出度を掛けた RPN で優先順位を付ける (点数の付け方は会社・規格で異なる)</p>
<svg class="tb-chart" viewBox="0 0 520 220" role="img" aria-label="レンチの回る空間">
<rect class="k-panel" x="8" y="8" width="244" height="204" rx="8"/><rect class="k-panel" x="268" y="8" width="244" height="204" rx="8"/>
<circle class="k-badge" cx="28" cy="28" r="10" style="fill:var(--tb-bad)"/><text class="k-badge-t" x="28" y="32" text-anchor="middle">✕</text><text class="k-title" x="46" y="32">壁にレンチが当たる</text>
<circle class="k-badge" cx="288" cy="28" r="10" style="fill:var(--tb-good)"/><text class="k-badge-t" x="288" y="32" text-anchor="middle">✓</text><text class="k-title" x="306" y="32">工具の回転域を確保</text>
<g class="k-shadow"><rect class="k-part" x="30" y="170" width="200" height="16"/><rect class="k-part" x="60" y="60" width="16" height="110"/></g>
<polygon class="k-part-h" points="80,150 104,150 104,170 80,170"/>
<circle cx="92" cy="160" r="46" class="k-hidden"/>
<line x1="92" y1="150" x2="136" y2="120" style="stroke:var(--tb-accent)" stroke-width="6" stroke-linecap="round"/>
<path d="M76,118 L76,150" style="stroke:var(--tb-bad)" stroke-width="4"/><text class="k-bad-t" x="130" y="206" text-anchor="middle">回転域が壁と重なる</text>
<g class="k-shadow"><rect class="k-part" x="290" y="170" width="200" height="16"/><rect class="k-part" x="320" y="60" width="16" height="110"/></g>
<polygon class="k-part-h" points="378,150 402,150 402,170 378,170"/>
<circle cx="390" cy="160" r="46" class="k-hidden"/>
<line x1="390" y1="150" x2="434" y2="120" style="stroke:var(--tb-accent)" stroke-width="6" stroke-linecap="round"/>
<text class="k-good-t" x="390" y="206" text-anchor="middle">回転域 + 手のすき間</text>
</svg>
<p class="tb-caption">図: 断面で見たボルトと壁。CAD では締結部品が「置けて」も、レンチやドライバーが回る空間 (破線の円) と手が入るすき間がなければ組めない</p>
<h2>計算例: 公差の積み上げ</h2>
<p>ハウジングの内のり 65.5 ± 0.1 mm に、20 ± 0.1、30 ± 0.1、15 ± 0.05 の 3 部品を並べます。すき間の基準値は 65.5 − 65 = 0.5 mm。</p>
<table class="tb-table">
  <tr><th>方法</th><th>すき間のばらつき</th><th>すき間の範囲</th><th>考え方</th></tr>
  <tr><td>最悪値 (ワーストケース)</td><td>± (0.1 + 0.1 + 0.1 + 0.05) = ± 0.35</td><td>0.15〜0.85 mm</td><td>全部品が同時に最悪側。必ず組める</td></tr>
  <tr><td>二乗和平方根 (RSS)</td><td>± √(0.1² + 0.1² + 0.1² + 0.05²) ≈ ± 0.18</td><td>約 0.32〜0.68 mm</td><td>ばらつきが独立で量産のとき。まれに外れる</td></tr>
</table>
<p>すき間が負になれば組めません。重要な部品は最悪値で、量産品で部品数が多いときは RSS も併用して判断します。</p>
<h2>レビューの進め方</h2>
<ol class="tb-flow">
  <li><b>準備</b> — 資料 (3D・図面・計算書・仕様) を事前に配り、チェックリストで自己点検</li>
  <li><b>説明</b> — 設計者が仕様と設計の根拠 (前提条件・計算) を説明</li>
  <li><b>指摘</b> — 他部署 (製造・品証・サービス) の視点で質問。人ではなく設計を評価する</li>
  <li><b>記録と追跡</b> — 指摘・担当・期限を表にし、次のレビューで完了を確認</li>
</ol>
`,
    points: ["誤りは後で見つかるほど修正コストが大きい — 早めにレビュー", "機能・強度・製造・組立・安全・環境・図面をチェック", "熱膨張・工具の入る空間・公差積み上げ・電食は定番の失敗", "FMEA で故障を事前に想像して対策する"],
    exercises: [
      {
        q: "長さ 1000 mm のアルミ板 (α = 23 × 10⁻⁶ /K) と鋼の台 (α = 12 × 10⁻⁶ /K) を両端でボルト固定しました。温度が 40 °C 上がると、自由な場合に比べて長さの差は何 mm 生じようとしますか?",
        a: "差 = (23 − 12) × 10⁻⁶ × 40 × 1000 = <b>0.44 mm</b>。これが拘束されると反り・応力・ボルトの緩みの原因になるため、片側を長穴にして逃がすなどの対策をとります。",
      },
      {
        q: "内のり 65.5 ± 0.1 のハウジングに、20 ± 0.1、30 ± 0.1、15 ± 0.05 の部品を並べます。最悪値法と RSS 法で、すき間の最小値を求めなさい。",
        a: "基準すき間 0.5 mm。最悪値: 0.5 − 0.35 = <b>0.15 mm</b>。RSS: √(0.01 + 0.01 + 0.01 + 0.0025) ≈ 0.18 → 0.5 − 0.18 ≈ <b>0.32 mm</b>。どちらも正なので組めます。",
      },
      {
        q: "デザインレビューで「このボルトは締められるか」と指摘されました。CAD 上でどう確認しますか?",
        a: "工具 (レンチ・ソケット・ドライバー) の簡易モデルを置き、<b>回転域と挿入方向</b>で干渉を調べます。手や腕の入る空間、締付けトルクをかけられる姿勢か、組立順で先に付く部品が邪魔しないかも確認します。",
      },
    ],
    quiz: [
      { q: "設計の誤りを見つける費用が最も安いのは?", choices: ["設計段階", "試作後", "量産後"], answer: 0, explain: "後の工程ほど作り直す物が増え、修正コストは大きくなります。" },
      { q: "アルミとステンレスを湿った環境で直接接触させると起こりやすいのは?", choices: ["アルミの腐食 (電食)", "ステンレスの軟化", "何も起こらない"], answer: 0, explain: "電位差のある異種金属が水分を介して接触すると、卑な金属 (アルミ) が腐食します。" },
      { q: "公差の積み上げを「最悪値」で計算する意味は?", choices: ["全部品が同時に最も不利な寸法でも成り立つか確かめる", "平均的な寸法で確かめる", "公差を無視する"], answer: 0, explain: "最悪値法は全数で組めることを保証します。RSS は統計的な見積もりです。" },
    ],
  },
];
