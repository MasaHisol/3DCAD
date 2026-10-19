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
<svg class="tb-chart" viewBox="0 0 520 210" role="img" aria-label="エンドミルと入隅 R">
<rect x="40" y="40" width="180" height="120" fill="var(--tb-surface-2)" stroke="currentColor" stroke-width="1.5"/>
<path d="M220,40 L202,40 A18,18 0 0 1 220,58 Z" fill="var(--tb-bad)"/>
<polyline points="90,58 202,58 202,130" fill="none" class="guide"/>
<g><circle r="18" fill="none" stroke="var(--tb-accent)" stroke-width="2.5"/><circle r="2" fill="var(--tb-accent)"/>
<animateTransform attributeName="transform" type="translate" values="90 58;202 58;202 130;202 58;90 58" keyTimes="0;0.4;0.6;0.8;1" dur="6s" repeatCount="indefinite"/></g>
<text class="lbl" x="232" y="36" text-anchor="start" style="fill:var(--tb-bad)">削り残し</text>
<text class="lbl" x="130" y="185" text-anchor="middle">図面: 入隅 R なし (直角)</text>
<rect x="300" y="40" width="180" height="120" rx="22" fill="var(--tb-surface-2)" stroke="currentColor" stroke-width="1.5"/>
<polyline points="370,58 458,58 462,62 462,130" fill="none" class="guide"/>
<g><circle r="18" fill="none" stroke="var(--tb-accent)" stroke-width="2.5"/><circle r="2" fill="var(--tb-accent)"/>
<animateTransform attributeName="transform" type="translate" values="370 58;458 58;462 62;462 130;462 62;458 58;370 58" keyTimes="0;0.38;0.42;0.6;0.78;0.82;1" dur="6s" repeatCount="indefinite"/></g>
<text class="lbl" x="390" y="185" text-anchor="middle" style="fill:var(--tb-good)">図面: 入隅 R ≥ 工具半径 → 一筆で削れる</text>
<text class="tick" x="130" y="202" text-anchor="middle">工具 (円) は丸いので角に届かない</text>
</svg>
<p class="tb-caption">図: 上から見たポケット加工。エンドミル (円) は丸いため、直角の入隅には削り残しが出る (左)。工具半径より少し大きい R を指示すれば、工具が止まらず滑らかに回り込める (右)</p>
<svg class="tb-chart" viewBox="0 0 520 220" role="img" aria-label="ポケットの深さと工具の長さ">
<path d="M40,60 L105,60 L105,110 L165,110 L165,60 L230,60 L230,180 L40,180 Z" fill="var(--tb-surface-2)" stroke="currentColor" stroke-width="1.5"/>
<rect x="120" y="20" width="30" height="88" fill="none" stroke="var(--tb-accent)" stroke-width="2"/>
<text class="lbl" x="135" y="140" text-anchor="middle" style="fill:var(--tb-good)">深さ 50 / φ30 ≈ 1.7 倍</text>
<text class="lbl" x="135" y="205" text-anchor="middle">短く太い工具: 剛性が高く速く削れる</text>
<path d="M290,60 L376,60 L376,170 L396,170 L396,60 L480,60 L480,180 L290,180 Z" fill="var(--tb-surface-2)" stroke="currentColor" stroke-width="1.5"/>
<g><rect x="380" y="10" width="12" height="158" fill="none" stroke="var(--tb-bad)" stroke-width="2"/>
<animateTransform attributeName="transform" type="rotate" values="0 386 10;0.8 386 10;-0.8 386 10;0 386 10" dur="0.5s" repeatCount="indefinite"/></g>
<text class="lbl" x="410" y="120" text-anchor="start" style="fill:var(--tb-bad)">深さ 30 / φ4 = 7.5 倍</text>
<text class="lbl" x="410" y="138" text-anchor="start" style="fill:var(--tb-bad)">→ びびり・折損</text>
<text class="lbl" x="385" y="205" text-anchor="middle">細長い工具: たわんで精度・寿命が落ちる</text>
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
<div class="tb-tip"><b>3DCAD Studio</b>: 「検査 → CAM」でポケット・輪郭・穴あけの工具経路と加工時間の目安を出せます。入隅 R が工具径より小さいとポケットの角が削り残されることを、工具経路で確かめてみましょう。</div>`,
    points: ["入隅には工具半径以上の R — 必ず指示する", "穴・溝の深さは径の 3〜5 倍以内が目安", "段取り回数を減らし、基準面から寸法を入れる", "公差・粗さは必要な所だけ。穴径・R の種類をそろえる"],
    exercises: [
      {
        q: "深さ 30 mm のポケットの内角を R2 と指示しました。何が問題で、どう直すべきですか?",
        a: "R2 には φ4 以下のエンドミルが必要ですが、深さ 30 mm は工具径の 7.5 倍でびびり・折損のおそれがあり、加工が非常に遅く高価になります。機能上問題なければ <b>R6 程度 (φ12 の工具、深さは径の 2.5 倍)</b> に大きくするか、ポケットを浅くします。",
      },
    ],
    quiz: [
      { q: "エンドミルで加工したポケットの内側の角はどうなる?", choices: ["鋭い角になる", "工具半径以上の R が残る", "面取りになる"], answer: 1, explain: "回転する工具は丸いため、内角には工具半径の R が残ります。" },
      { q: "加工コストを下げる設計は?", choices: ["穴径の種類をそろえる", "全寸法に厳しい公差を入れる", "斜めの穴を増やす"], answer: 0, explain: "穴径・ねじ・R の種類をそろえると工具交換が減り、加工時間が短くなります。" },
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
<svg class="tb-chart" viewBox="0 0 520 200" role="img" aria-label="曲げの逃げ (切り欠き)">
<rect x="40" y="80" width="160" height="80" fill="var(--tb-surface-2)" stroke="currentColor" stroke-width="1.5"/><rect x="40" y="40" width="160" height="40" fill="var(--tb-surface-2)" stroke="currentColor" stroke-width="1.5"/><rect x="200" y="80" width="50" height="80" fill="var(--tb-surface-2)" stroke="currentColor" stroke-width="1.5"/>
<line class="guide" x1="40" y1="80" x2="200" y2="80"/><line class="guide" x1="200" y1="80" x2="200" y2="160"/>
<polyline points="196,84 204,76 198,72 206,66" fill="none" stroke="var(--tb-bad)" stroke-width="2"/>
<text class="lbl" x="130" y="185" text-anchor="middle" style="fill:var(--tb-bad)">逃げなし: 角が裂ける・ふくらむ</text>
<rect x="300" y="80" width="160" height="80" fill="var(--tb-surface-2)" stroke="currentColor" stroke-width="1.5"/><rect x="300" y="40" width="152" height="40" fill="var(--tb-surface-2)" stroke="currentColor" stroke-width="1.5"/><rect x="460" y="88" width="50" height="72" fill="var(--tb-surface-2)" stroke="currentColor" stroke-width="1.5"/>
<rect x="452" y="40" width="8" height="48" fill="none" stroke="var(--tb-good)" stroke-width="2" stroke-dasharray="3 2"/>
<line class="guide" x1="300" y1="80" x2="452" y2="80"/><line class="guide" x1="460" y1="88" x2="460" y2="160"/>
<text class="lbl" x="390" y="185" text-anchor="middle" style="fill:var(--tb-good)">逃げあり: 曲げ線の交点を切り欠く</text>
<text class="tick" x="456" y="30" text-anchor="middle">逃げ</text>
</svg>
<p class="tb-caption">図: 展開図 (破線が曲げ線)。2 方向の曲げが交わる角に逃げ (切り欠き) を入れると、曲げたときに材料が逃げられる。逃げの幅は板厚以上、深さは曲げ線を越える程度が目安</p>
<svg class="tb-chart" viewBox="0 0 520 200" role="img" aria-label="穴と曲げ線の距離">
<path d="M60,148 L300,148 A28,28 0 0 0 328,120 L328,40 L320,40 L320,120 A20,20 0 0 1 300,140 L60,140 Z" fill="var(--tb-surface-2)" stroke="currentColor" stroke-width="1.5"/>
<line class="guide" x1="200" y1="132" x2="200" y2="156"/><line class="guide" x1="216" y1="132" x2="216" y2="156"/>
<line class="guide" x1="216" y1="170" x2="320" y2="170"/>
<line x1="216" y1="164" x2="216" y2="176" stroke="var(--tb-accent)"/><line x1="320" y1="164" x2="320" y2="176" stroke="var(--tb-accent)"/>
<text class="lbl" x="268" y="190" text-anchor="middle">≥ 2t + R (目安)</text>
<text class="tick" x="208" y="126" text-anchor="middle">穴</text>
<text class="tick" x="345" y="60" text-anchor="start">フランジ高さ ≥ 3〜4t (目安)</text>
<text class="tick" x="345" y="125" text-anchor="start">内側 R ≥ t</text>
<ellipse cx="80" cy="60" rx="10" ry="7" fill="none" stroke="var(--tb-bad)" stroke-width="2"/>
<text class="lbl" x="98" y="64" text-anchor="start" style="fill:var(--tb-bad)">曲げ線に近い穴は楕円に変形</text>
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
<div class="tb-tip"><b>3DCAD Studio</b>: 「板金」タブの面・フランジで板金部品を作り、「展開パターン」で展開寸法と DXF を出力できます。フレーム ジェネレータと溶接で溶接構造も作れます。</div>`,
    points: ["曲げ半径 ≥ 板厚、フランジ高さ ≥ 板厚の 3〜4 倍", "穴は曲げ線から 2t + R 以上離す、穴径 ≥ 板厚", "展開長さは K 係数 (中立面) で計算", "溶接は熱ひずみ・疲労・作業性に注意"],
    exercises: [
      {
        q: "板厚 2 mm、内側曲げ半径 2 mm、K = 0.4 で 90° 曲げるときの曲げ代 BA を求めてください。",
        a: "BA = (π/2) × (2 + 0.4 × 2) = 1.571 × 2.8 ≈ <b>4.40 mm</b>。",
      },
    ],
    quiz: [
      { q: "板厚 1.6 mm の板金にあける穴の最小径の目安は?", choices: ["0.5 mm", "1.6 mm 程度", "10 mm"], answer: 1, explain: "パンチで抜ける穴径は板厚程度以上が目安です。" },
      { q: "穴を曲げ線のすぐ近くに置くと何が起こる?", choices: ["穴が変形する", "曲げ角度が大きくなる", "何も起こらない"], answer: 0, explain: "曲げの変形が穴に及び、楕円に変形します。2t + R 以上離します。" },
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
<svg class="tb-chart" viewBox="0 0 520 200" role="img" aria-label="リブの厚さとひけ">
<path d="M40,60 L88,60 Q100,70 112,60 L170,60 L170,76 L108,76 L108,124 L92,124 L92,76 L40,76 Z" fill="var(--tb-surface-2)" stroke="currentColor" stroke-width="1.5"/>
<circle cx="100" cy="76" r="11" fill="none" stroke="var(--tb-bad)" stroke-dasharray="3 2"/>
<text class="lbl" x="100" y="48" text-anchor="middle" style="fill:var(--tb-bad)">ひけ</text>
<text class="lbl" x="105" y="150" text-anchor="middle" style="fill:var(--tb-bad)">リブ厚 = 肉厚 t → 交点が厚い</text>
<path d="M300,60 L460,60 L460,76 L385,76 L384,120 L376,120 L375,76 L300,76 Z" fill="var(--tb-surface-2)" stroke="currentColor" stroke-width="1.5"/>
<text class="lbl" x="380" y="48" text-anchor="middle" style="fill:var(--tb-good)">表面は平ら</text>
<text class="lbl" x="380" y="150" text-anchor="middle" style="fill:var(--tb-good)">リブ厚 0.5〜0.6t、高さ ≤ 3t (目安)</text>
<text class="tick" x="260" y="185" text-anchor="middle">交点に内接する円が大きいほど冷えるのが遅く、ひけ・ボイドが出やすい</text>
</svg>
<p class="tb-caption">図: 樹脂成形品の断面。リブを肉厚と同じにすると、交点が厚肉になって表側にひけ (へこみ) が出る。リブは薄く、高さを抑える</p>
<svg class="tb-chart" viewBox="0 0 520 200" role="img" aria-label="ボスの設計">
<path d="M30,44 L210,44 L210,60 L140,60 L140,150 L80,150 L80,60 L30,60 Z" fill="var(--tb-surface-2)" stroke="currentColor" stroke-width="1.5"/>
<circle cx="110" cy="80" r="7" fill="none" stroke="var(--tb-bad)" stroke-width="2"/>
<path d="M95,44 Q110,52 125,44" fill="none" stroke="var(--tb-bad)" stroke-width="2"/>
<text class="lbl" x="120" y="180" text-anchor="middle" style="fill:var(--tb-bad)">中実の太いボス: ひけ・ボイド</text>
<path d="M290,44 L470,44 L470,60 L400,60 L400,150 L388,150 L388,60 L352,60 L352,150 L340,150 L340,60 L290,60 Z" fill="var(--tb-surface-2)" stroke="currentColor" stroke-width="1.5"/>
<polygon points="300,60 340,60 340,130" fill="var(--tb-surface-2)" stroke="currentColor" stroke-width="1.5"/><polygon points="440,60 400,60 400,130" fill="var(--tb-surface-2)" stroke="currentColor" stroke-width="1.5"/>
<text class="tick" x="370" y="110" text-anchor="middle">ねじ穴</text>
<text class="lbl" x="380" y="180" text-anchor="middle" style="fill:var(--tb-good)">中空 + リブで壁とつなぐ</text>
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
<div class="tb-tip"><b>3DCAD Studio</b>: シェル (一定肉厚)・勾配 (抜き勾配)・リブ・フィレットのフィーチャで、成形品らしいモデルを作れます。断面図で肉厚が均一か確かめましょう。</div>`,
    points: ["肉厚を均一に (1.5〜3 mm)、厚い所は肉抜き + リブ", "型開き方向の面に抜き勾配 0.5〜2°", "リブ厚は肉厚の 50〜60 %、ボスは中空に", "アンダーカットは金型コストを上げる"],
    exercises: [
      {
        q: "肉厚 2.5 mm のケースにリブを付けます。リブの厚さと高さの目安は?",
        a: "厚さは 2.5 × 0.5〜0.6 = <b>1.25〜1.5 mm</b>、高さは 2.5 × 3 = <b>7.5 mm 以内</b>が目安です。根元に R、先端側に抜き勾配を付けます。",
      },
    ],
    quiz: [
      { q: "成形品の表面にひけが出る主な原因は?", choices: ["肉厚が部分的に厚い", "抜き勾配が大きい", "材料が透明"], answer: 0, explain: "厚い部分は冷却・収縮が遅れ、表面がへこみます。" },
      { q: "アンダーカットがあると何が起こる?", choices: ["金型にスライド機構が必要で高価になる", "製品が軽くなる", "抜き勾配が不要になる"], answer: 0, explain: "型開き方向に抜けない形は、スライドや傾斜ピンなど追加の機構が必要です。" },
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
<svg class="tb-chart" viewBox="0 0 520 200" role="img" aria-label="FDM のオーバーハング 45° の目安">
<line class="axis" x1="30" y1="170" x2="500" y2="170"/>
<line x1="60" y1="170" x2="120" y2="66" stroke="var(--tb-good)" stroke-width="8"/>
<line x1="230" y1="170" x2="315" y2="85" stroke="var(--tb-warn)" stroke-width="8"/>
<line x1="380" y1="170" x2="484" y2="110" stroke="var(--tb-bad)" stroke-width="8"/>
<line class="guide" x1="60" y1="170" x2="60" y2="60"/><line class="guide" x1="230" y1="170" x2="230" y2="80"/><line class="guide" x1="380" y1="170" x2="380" y2="100"/>
<line class="guide" x1="410" y1="170" x2="410" y2="153"/><line class="guide" x1="440" y1="170" x2="440" y2="136"/><line class="guide" x1="470" y1="170" x2="470" y2="119"/>
<text class="lbl" x="90" y="190" text-anchor="middle" style="fill:var(--tb-good)">垂直から 30°: OK</text>
<text class="lbl" x="272" y="190" text-anchor="middle" style="fill:var(--tb-warn)">45°: 限界の目安</text>
<text class="lbl" x="440" y="190" text-anchor="middle" style="fill:var(--tb-bad)">60°: サポートが必要</text>
<text class="tick" x="265" y="30" text-anchor="middle">破線 = 垂直 (積層方向)。右端の細い破線はサポート</text>
</svg>
<p class="tb-caption">図: オーバーハング (張り出し) は垂直から 45° 程度までならサポートなしで積める (目安)。それより寝た面は下の層が支えにならず垂れる</p>
<h2>強さは向きで変わる</h2>
<p>FDM の部品は層と層の境目 (積層方向) が弱く、強度が数分の 1 になることもあります。
<b>荷重が層に沿う向き</b>になるよう造形方向を決めましょう (例: フックは立てずに寝かせて造形)。</p>
<svg class="tb-chart" viewBox="0 0 520 210" role="img" aria-label="積層方向と強度">
<line class="axis" x1="30" y1="175" x2="240" y2="175"/>
<rect x="90" y="45" width="30" height="130" fill="var(--tb-surface-2)" stroke="currentColor" stroke-width="1.5"/>
<line class="grid" x1="90" y1="55" x2="120" y2="55"/><line class="grid" x1="90" y1="65" x2="120" y2="65"/><line class="grid" x1="90" y1="75" x2="120" y2="75"/><line class="grid" x1="90" y1="85" x2="120" y2="85"/><line class="grid" x1="90" y1="95" x2="120" y2="95"/><line class="grid" x1="90" y1="105" x2="120" y2="105"/><line class="grid" x1="90" y1="115" x2="120" y2="115"/><line class="grid" x1="90" y1="125" x2="120" y2="125"/><line class="grid" x1="90" y1="135" x2="120" y2="135"/><line class="grid" x1="90" y1="145" x2="120" y2="145"/><line class="grid" x1="90" y1="155" x2="120" y2="155"/><line class="grid" x1="90" y1="165" x2="120" y2="165"/>
<line x1="170" y1="55" x2="124" y2="55" stroke="var(--tb-accent)" stroke-width="2"/><polygon points="124,55 131.4,51.9 131.4,58.1" fill="var(--tb-accent)"/>
<polyline points="88,165 96,163 104,166 112,163 122,165" fill="none" stroke="var(--tb-bad)" stroke-width="2"/>
<text class="lbl" x="130" y="200" text-anchor="middle" style="fill:var(--tb-bad)">立てて造形: 層の境目ではがれる</text>
<line class="axis" x1="280" y1="175" x2="500" y2="175"/>
<rect x="300" y="145" width="170" height="30" fill="var(--tb-surface-2)" stroke="currentColor" stroke-width="1.5"/>
<line class="grid" x1="300" y1="150" x2="470" y2="150"/><line class="grid" x1="300" y1="155" x2="470" y2="155"/><line class="grid" x1="300" y1="160" x2="470" y2="160"/><line class="grid" x1="300" y1="165" x2="470" y2="165"/><line class="grid" x1="300" y1="170" x2="470" y2="170"/>
<line x1="462" y1="95" x2="462" y2="141" stroke="var(--tb-accent)" stroke-width="2"/><polygon points="462,141 458.9,133.6 465.1,133.6" fill="var(--tb-accent)"/>
<text class="lbl" x="390" y="200" text-anchor="middle" style="fill:var(--tb-good)">寝かせて造形: 層に沿って荷重を受ける</text>
<text class="tick" x="260" y="22" text-anchor="middle">細線 = 層の境目。矢印 = 荷重</text>
</svg>
<p class="tb-caption">図: 同じ棒でも造形の向きで強さが変わる。曲げで生じる引張が層の境目を引きはがす向き (左) を避け、層に沿う向き (右) にする</p>
<div class="tb-tip"><b>3DCAD Studio</b>: 「検査 → 3D プリント」でオーバーハング (赤) と薄肉 (橙) を色分けし、造形方向ごとのサポート量を比べられます。STL / 3MF で書き出してスライサへ。</div>`,
    points: ["オーバーハングは 45° まで — 面取りにすればサポート不要", "最小肉厚はノズル径の 2 倍以上", "穴は小さく出る — はめあいは補正する", "積層方向に弱い — 荷重の向きで造形方向を決める"],
    exercises: [
      {
        q: "下向きの水平な張り出し (幅 15 mm) をサポートなしで造形したい。形をどう変えますか?",
        a: "張り出しの下に <b>45° の面取り (または 45° 以下の傾斜)</b> を付けて、下から少しずつ積み上がる形にします。外観上問題なければ、造形方向を変えて張り出しを上向きにする方法もあります。",
      },
    ],
    quiz: [
      { q: "FDM でサポートなしに造形しやすい傾きの限界は、水平からおよそ何度?", choices: ["10°", "45°", "80°"], answer: 1, explain: "一般に 45° (垂直から 45°) まではサポートなしで造形できます。" },
      { q: "FDM 部品が最も弱い方向は?", choices: ["積層方向 (層の境目をはがす方向)", "層に沿った方向", "どの方向も同じ"], answer: 0, explain: "層間の接着が弱いため、積層方向に引っ張る力に弱くなります。" },
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
<svg class="tb-chart" viewBox="0 0 520 210" role="img" aria-label="部品統合の前後">
<rect x="30" y="150" width="190" height="16" fill="var(--tb-surface-2)" stroke="currentColor" stroke-width="1.5"/>
<path d="M60,150 L60,80 L72,80 L72,138 L110,138 L110,150 Z" fill="var(--tb-surface-2)" stroke="currentColor" stroke-width="1.5"/>
<path d="M150,150 L150,80 L162,80 L162,138 L190,138 L190,150 Z" fill="var(--tb-surface-2)" stroke="currentColor" stroke-width="1.5"/>
<rect x="50" y="64" width="130" height="14" fill="var(--tb-surface-2)" stroke="currentColor" stroke-width="1.5"/>
<circle cx="66" cy="56" r="5" fill="var(--tb-bad)"/><circle cx="156" cy="56" r="5" fill="var(--tb-bad)"/><circle cx="90" cy="168" r="5" fill="var(--tb-bad)"/><circle cx="175" cy="168" r="5" fill="var(--tb-bad)"/>
<text class="lbl" x="125" y="30" text-anchor="middle">前: 7 点 (ベース・ブラケット 2・カバー・ねじ 4)</text>
<text class="lbl" x="125" y="195" text-anchor="middle" style="fill:var(--tb-bad)">ねじ 4 本 = 4 回の位置合わせと締付</text>
<line x1="232" y1="110" x2="282" y2="110" stroke="var(--tb-accent)" stroke-width="2"/><polygon points="282,110 274.6,113.1 274.6,106.9" fill="var(--tb-accent)"/>
<rect x="300" y="150" width="190" height="16" fill="var(--tb-surface-2)" stroke="currentColor" stroke-width="1.5"/>
<path d="M330,150 L330,78 L460,78 L460,150 L448,150 L448,92 L342,92 L342,150 Z" fill="var(--tb-surface-2)" stroke="currentColor" stroke-width="1.5"/>
<path d="M330,150 l-6,8 l6,0 Z M460,150 l6,8 l-6,0 Z" fill="var(--tb-good)"/>
<text class="lbl" x="395" y="30" text-anchor="middle">後: 2 点 (ベース + 成形カバー)</text>
<text class="lbl" x="395" y="195" text-anchor="middle" style="fill:var(--tb-good)">スナップフィットで押し込むだけ</text>
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
<svg class="tb-chart" viewBox="0 0 520 210" role="img" aria-label="面取りによる挿入ガイド">
<rect x="40" y="110" width="75" height="70" fill="var(--tb-surface-2)" stroke="currentColor" stroke-width="1.5"/><rect x="145" y="110" width="75" height="70" fill="var(--tb-surface-2)" stroke="currentColor" stroke-width="1.5"/>
<rect x="104" y="42" width="28" height="68" fill="none" stroke="var(--tb-accent)" stroke-width="2"/>
<text class="lbl" x="130" y="200" text-anchor="middle" style="fill:var(--tb-bad)">面取りなし: 縁に当たって止まる</text>
<path d="M300,110 L362,110 L370,118 L370,180 L300,180 Z" fill="var(--tb-surface-2)" stroke="currentColor" stroke-width="1.5"/>
<path d="M408,110 L470,110 L470,180 L400,180 L400,118 Z" fill="var(--tb-surface-2)" stroke="currentColor" stroke-width="1.5"/>
<g><path d="M360,22 L388,22 L388,86 L384,90 L364,90 L360,86 Z" fill="none" stroke="var(--tb-accent)" stroke-width="2"/>
<animateTransform attributeName="transform" type="translate" values="0 0;0 22;11 34;11 82;11 82;0 0" keyTimes="0;0.25;0.4;0.65;0.85;1" dur="4s" repeatCount="indefinite"/></g>
<text class="lbl" x="385" y="200" text-anchor="middle" style="fill:var(--tb-good)">面取りあり: 斜面に沿って自然に入る</text>
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
<svg class="tb-chart" viewBox="0 0 520 200" role="img" aria-label="ポカヨケ — ピン位置の非対称化">
<rect x="40" y="50" width="180" height="100" fill="var(--tb-surface-2)" stroke="currentColor" stroke-width="1.5"/>
<circle cx="70" cy="100" r="7" fill="var(--tb-accent)"/><circle cx="190" cy="100" r="7" fill="var(--tb-accent)"/>
<rect x="34" y="44" width="192" height="112" fill="none" class="guide"/>
<text class="lbl" x="130" y="105" text-anchor="middle">180° 回しても入る</text>
<text class="lbl" x="130" y="180" text-anchor="middle" style="fill:var(--tb-bad)">対称配置: 逆向きに組めてしまう</text>
<rect x="300" y="50" width="180" height="100" fill="var(--tb-surface-2)" stroke="currentColor" stroke-width="1.5"/>
<circle cx="330" cy="100" r="7" fill="var(--tb-accent)"/><circle cx="450" cy="70" r="7" fill="var(--tb-accent)"/>
<text class="lbl" x="390" y="105" text-anchor="middle">向きは 1 通りだけ</text>
<text class="lbl" x="390" y="180" text-anchor="middle" style="fill:var(--tb-good)">片方のピンをずらす: 間違えると入らない</text>
</svg>
<p class="tb-caption">図: 上から見た取付面と位置決めピン。ピンを対称に置くと裏返し・逆向きでも入るが、位置をずらせば正しい向きでしか組めない</p>
<div class="tb-tip"><b>3DCAD Studio</b>: アセンブリの部品表で部品点数・ねじの種類を確認し、干渉解析で組立時のぶつかりを確かめましょう。分解表示は組立手順書の作成にも使えます。</div>`,
    points: ["部品点数を減らす (動く・材料が違う・分解が必要 以外は統合候補)", "一方向から組める構造、面取りでガイド", "位置決めは形で — 調整作業をなくす", "ポカヨケ: 間違った組み方ができない形にする"],
    exercises: [
      {
        q: "4 本のねじで留めているカバー (板金) を、組立工数を減らすために設計変更する案を 2 つ挙げてください。",
        a: "例: ① 一辺をツメ (引っ掛け) にして差し込み、反対側だけ 1〜2 本のねじで留める。② 樹脂化してスナップフィットにし、ねじをなくす。③ ねじを残す場合も、種類をそろえ、仮置きできるガイドピンを付ける。",
      },
    ],
    quiz: [
      { q: "隣の部品と一体化できる可能性が高いのは?", choices: ["相手に対して回転する部品", "同じ材料で、動かず、分解も不要な部品", "絶縁が必要な部品"], answer: 1, explain: "動かず・同じ材料で・分解不要なら、一体化の候補です。" },
      { q: "ポカヨケの例として適切なのは?", choices: ["組立手順書を厚くする", "逆向きでは入らないようにピン位置をずらす", "作業者に注意を促す"], answer: 1, explain: "ポカヨケは注意に頼らず、物理的に間違えられない形にすることです。" },
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
<svg class="tb-chart" viewBox="0 0 520 220" role="img" aria-label="寸法の付け方と設計意図">
<rect x="40" y="40" width="160" height="60" fill="var(--tb-surface-2)" stroke="currentColor" stroke-width="1.5"/><circle cx="120" cy="70" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/>
<rect x="300" y="40" width="200" height="60" fill="var(--tb-surface-2)" stroke="currentColor" stroke-width="1.5"/><circle cx="380" cy="70" r="9" fill="none" stroke="var(--tb-bad)" stroke-width="2"/>
<text class="lbl" x="120" y="30" text-anchor="middle">元: 幅 160、穴は左端から 80</text>
<text class="lbl" x="400" y="30" text-anchor="middle" style="fill:var(--tb-bad)">幅を 200 に変更 → 穴が中央からずれる</text>
<rect x="40" y="140" width="160" height="60" fill="var(--tb-surface-2)" stroke="currentColor" stroke-width="1.5"/><circle cx="120" cy="170" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/>
<rect x="300" y="140" width="200" height="60" fill="var(--tb-surface-2)" stroke="currentColor" stroke-width="1.5"/><circle cx="400" cy="170" r="9" fill="none" stroke="var(--tb-good)" stroke-width="2"/>
<line class="guide" x1="400" y1="135" x2="400" y2="205"/>
<text class="lbl" x="120" y="130" text-anchor="middle">元: 穴を「中央」に拘束 (幅/2)</text>
<text class="lbl" x="400" y="130" text-anchor="middle" style="fill:var(--tb-good)">幅を 200 に変更 → 穴は中央に追従</text>
<line x1="210" y1="70" x2="290" y2="70" stroke="var(--tb-accent)" stroke-width="2"/><polygon points="290,70 282.6,73.1 282.6,66.9" fill="var(--tb-accent)"/><line x1="210" y1="170" x2="290" y2="170" stroke="var(--tb-accent)" stroke-width="2"/><polygon points="290,170 282.6,173.1 282.6,166.9" fill="var(--tb-accent)"/>
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
<svg class="tb-chart" viewBox="0 0 520 160" role="img" aria-label="フィーチャの順序と参照">
<rect x="20" y="40" width="105" height="34" rx="6" fill="var(--tb-surface-2)" stroke="var(--tb-accent)" stroke-width="1.5"/><text class="lbl" x="72" y="62" text-anchor="middle">ベース押し出し</text><line x1="125" y1="57" x2="145" y2="57" stroke="var(--tb-accent)" stroke-width="2"/><polygon points="145,57 137.6,60.1 137.6,53.9" fill="var(--tb-accent)"/><rect x="145" y="40" width="105" height="34" rx="6" fill="var(--tb-surface-2)" stroke="var(--tb-accent)" stroke-width="1.5"/><text class="lbl" x="197" y="62" text-anchor="middle">穴</text><line x1="250" y1="57" x2="270" y2="57" stroke="var(--tb-accent)" stroke-width="2"/><polygon points="270,57 262.6,60.1 262.6,53.9" fill="var(--tb-accent)"/><rect x="270" y="40" width="105" height="34" rx="6" fill="var(--tb-surface-2)" stroke="var(--tb-accent)" stroke-width="1.5"/><text class="lbl" x="322" y="62" text-anchor="middle">パターン</text><line x1="375" y1="57" x2="395" y2="57" stroke="var(--tb-accent)" stroke-width="2"/><polygon points="395,57 387.6,60.1 387.6,53.9" fill="var(--tb-accent)"/><rect x="395" y="40" width="105" height="34" rx="6" fill="var(--tb-surface-2)" stroke="var(--tb-accent)" stroke-width="1.5"/><text class="lbl" x="447" y="62" text-anchor="middle">フィレット</text>
<path d="M450,74 C450,130 250,130 205,78" fill="none" stroke="var(--tb-bad)" stroke-width="2" stroke-dasharray="5 3"/>
<text class="lbl" x="330" y="138" text-anchor="middle" style="fill:var(--tb-bad)">途中のフィーチャがフィレットの稜線を参照すると、R を変えただけで壊れやすい</text>
<text class="tick" x="260" y="22" text-anchor="middle">仕上げ (フィレット・面取り) は最後に</text>
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
<div class="tb-tip"><b>3DCAD Studio の学習センター</b> (第 1〜4 章) で、これらの作法を実際に体験できます。</div>`,
    points: ["原点・基準平面を基準に、スケッチは完全拘束", "関係は式で — 設計意図を残す", "ベース → 加工 → パターン → 仕上げ の順", "名前・材料・iProperties を入れて再利用しやすく"],
    exercises: [
      {
        q: "幅 W の板の中央に穴を置くモデルで、幅を変えると穴が中央からずれてしまいました。原因と対策は?",
        a: "穴の位置寸法が数値 (例: 40) で入っているためです。位置を <b>W / 2</b> の式にするか、板を原点に対して対称に描いて穴を原点に一致させます (どちらも設計意図「穴は中央」を表す)。",
      },
    ],
    quiz: [
      { q: "フィレットを作る順序として一般的に良いのは?", choices: ["最初", "主要な形と加工の後 (最後のほう)", "スケッチの前"], answer: 1, explain: "仕上げのフィーチャは最後にまとめると、参照が壊れにくく変更に強いモデルになります。" },
      { q: "スケッチを完全拘束にする主な理由は?", choices: ["ファイルが小さくなる", "寸法変更時に形が予想どおりに変わる", "表示が速くなる"], answer: 1, explain: "自由度が残っていると、寸法を変えたときに想定外の動き方をします。" },
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
<svg class="tb-chart" viewBox="0 0 520 220" role="img" aria-label="修正コストの増え方">
<line class="axis" x1="60" y1="180" x2="490" y2="180"/><line class="axis" x1="60" y1="20" x2="60" y2="180"/>
<rect x="95" y="155" width="56" height="25" fill="var(--tb-accent)" opacity="0.45"/><text class="mark-t" x="123" y="147" text-anchor="middle">×1</text><text class="tick" x="123" y="198" text-anchor="middle">設計中</text><rect x="195" y="113" width="56" height="67" fill="var(--tb-accent)" opacity="0.63"/><text class="mark-t" x="223" y="105" text-anchor="middle">×10</text><text class="tick" x="223" y="198" text-anchor="middle">試作後</text><rect x="295" y="71" width="56" height="109" fill="var(--tb-accent)" opacity="0.81"/><text class="mark-t" x="323" y="63" text-anchor="middle">×100</text><text class="tick" x="323" y="198" text-anchor="middle">量産準備</text><rect x="395" y="29" width="56" height="151" fill="var(--tb-bad)" opacity="0.99"/><text class="mark-t" x="423" y="21" text-anchor="middle">×1000</text><text class="tick" x="423" y="198" text-anchor="middle">出荷後</text>
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
<rect x="30" y="50" width="90" height="56" rx="6" fill="var(--tb-surface-2)" stroke="var(--tb-accent)" stroke-width="1.5"/><text class="lbl" x="75" y="72" text-anchor="middle">重大度 S</text><text class="mark-t" x="75" y="96" text-anchor="middle">8</text><text class="mark-t" x="135" y="84" text-anchor="middle">×</text><rect x="150" y="50" width="90" height="56" rx="6" fill="var(--tb-surface-2)" stroke="var(--tb-accent)" stroke-width="1.5"/><text class="lbl" x="195" y="72" text-anchor="middle">発生度 O</text><text class="mark-t" x="195" y="96" text-anchor="middle">3</text><text class="mark-t" x="255" y="84" text-anchor="middle">×</text><rect x="270" y="50" width="90" height="56" rx="6" fill="var(--tb-surface-2)" stroke="var(--tb-accent)" stroke-width="1.5"/><text class="lbl" x="315" y="72" text-anchor="middle">検出度 D</text><text class="mark-t" x="315" y="96" text-anchor="middle">5</text>
<text class="mark-t" x="390" y="84" text-anchor="middle">=</text>
<rect x="405" y="50" width="90" height="56" rx="6" fill="none" stroke="var(--tb-bad)" stroke-width="2"/><text class="lbl" x="450" y="72" text-anchor="middle">RPN</text><text class="lbl" x="450" y="96" text-anchor="middle" style="fill:var(--tb-bad)">120</text>
<text class="tick" x="260" y="140" text-anchor="middle">各 1〜10 点で評価。RPN の大きい項目、または S が大きい項目から対策する</text>
</svg>
<p class="tb-caption">図: FMEA では重大度・発生度・検出度を掛けた RPN で優先順位を付ける (点数の付け方は会社・規格で異なる)</p>
`,
    points: ["誤りは後で見つかるほど修正コストが大きい — 早めにレビュー", "機能・強度・製造・組立・安全・環境・図面をチェック", "熱膨張・工具の入る空間・公差積み上げ・電食は定番の失敗", "FMEA で故障を事前に想像して対策する"],
    exercises: [
      {
        q: "長さ 1000 mm のアルミ板 (α = 23 × 10⁻⁶ /K) と鋼の台 (α = 12 × 10⁻⁶ /K) を両端でボルト固定しました。温度が 40 °C 上がると、自由な場合に比べて長さの差は何 mm 生じようとしますか?",
        a: "差 = (23 − 12) × 10⁻⁶ × 40 × 1000 = <b>0.44 mm</b>。これが拘束されると反り・応力・ボルトの緩みの原因になるため、片側を長穴にして逃がすなどの対策をとります。",
      },
    ],
    quiz: [
      { q: "設計の誤りを見つける費用が最も安いのは?", choices: ["設計段階", "試作後", "量産後"], answer: 0, explain: "後の工程ほど作り直す物が増え、修正コストは大きくなります。" },
      { q: "アルミとステンレスを湿った環境で直接接触させると起こりやすいのは?", choices: ["アルミの腐食 (電食)", "ステンレスの軟化", "何も起こらない"], answer: 0, explain: "電位差のある異種金属が水分を介して接触すると、卑な金属 (アルミ) が腐食します。" },
    ],
  },
];
