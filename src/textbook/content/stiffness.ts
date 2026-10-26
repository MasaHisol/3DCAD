import type { TextChapter } from "../types";

// 剛性・変形・振動の発展編 (機械設計者向け)
export const STIFFNESS: TextChapter[] = [
  {
    id: "stiffness-design",
    part: "mechanics",
    title: "剛性設計の考え方 — 強さより「硬さ」",
    minutes: 25,
    level: 2,
    lead: "機械の多くは、壊れる前に「たわみすぎて」役に立たなくなります。工作機械・ロボット・検査装置の精度を決めるのは強度より剛性です。剛性をばねとして捉え、直列・並列の合成と剛性ループで機械全体を見積もる考え方を学びます。",
    body: `
<h2>強度と剛性は別物</h2>
<p><b>強度</b>は「どこまでの力で壊れない(降伏しない)か」、<b>剛性</b>は「力に対してどれだけ変形しにくいか」です。剛性は荷重とたわみの比、すなわち<b>ばね定数</b>で表します。</p>
<div class="tb-math">k = \\dfrac{F}{\\delta}\\ \\ [\\mathrm{N/mm},\\ \\mathrm{N/\\mu m}] \\qquad \\text{ねじり剛性}\\ k_\\theta = \\dfrac{T}{\\theta}\\ \\ [\\mathrm{N\\cdot m/rad}]</div>
<table class="tb-table">
  <tr><th></th><th>強度</th><th>剛性</th></tr>
  <tr><td>評価量</td><td>応力 σ と許容応力</td><td>たわみ δ・傾き θ・固有振動数</td></tr>
  <tr><td>材料で効くもの</td><td>降伏点・引張強さ (熱処理で大きく変わる)</td><td>縦弾性係数 E (鋼ならどの鋼種もほぼ 206 GPa)</td></tr>
  <tr><td>形状で効くもの</td><td>断面係数 Z ∝ h²</td><td>断面二次モーメント I ∝ h³、長さ L³</td></tr>
  <tr><td>典型的な設計例</td><td>クレーンのフック、ボルト</td><td>工作機械のコラム、測定器、ロボットアーム</td></tr>
</table>
<div class="tb-tip"><b>落とし穴</b>: 「たわむから高強度鋼に替える」は効きません。SS400 も SCM440 も E はほぼ同じなので、たわみは変わりません。剛性を上げるのは<b>形状と長さ</b>です。</div>
<h2>ばねモデルと直列・並列</h2>
<p>部材・接合部・軸受など、力が通る要素をすべてばねに置き換えると、機械全体の剛性が計算できます。</p>
<div class="tb-math">\\text{直列:}\\ \\dfrac{1}{k} = \\dfrac{1}{k_1} + \\dfrac{1}{k_2} + \\cdots \\qquad \\text{並列:}\\ k = k_1 + k_2 + \\cdots</div>
<div data-widget="anim-stiffness-series"></div>
<ul>
  <li><b>直列</b>では全体の剛性は<b>最も弱い要素</b>より必ず小さくなります。1 つだけ柔らかい要素があると、ほかをいくら硬くしても効きません。</li>
  <li><b>並列</b>では足し算。支点を増やす・ガイドを 2 本にするのは並列化です。</li>
  <li>たわみの内訳 (コンプライアンス 1/k の割合) を出すと、どこを改善すべきかが一目でわかります。</li>
</ul>
<h2>剛性ループ (力の流れの輪)</h2>
<p>工具とワーク、プローブと測定物のように、相対位置が重要な 2 点の間には、力が回って戻る閉じた経路 (<b>剛性ループ / 構造ループ</b>) があります。ループ上のすべての要素が直列ばねになります。</p>
<svg class="tb-chart" viewBox="0 0 520 250" role="img" aria-label="剛性ループ">
<rect class="k-ground" x="50" y="212" width="420" height="10"/><line class="k-edge" x1="50" y1="212" x2="470" y2="212"/>
<g class="k-shadow"><rect class="k-part" x="60" y="186" width="400" height="26" rx="3"/><rect class="k-part" x="90" y="40" width="45" height="146"/><rect class="k-part" x="90" y="40" width="260" height="32" rx="3"/><rect class="k-part" x="296" y="72" width="48" height="36" rx="2"/><rect class="k-alu" x="240" y="168" width="180" height="18" rx="2"/><rect class="k-alu" x="280" y="142" width="90" height="26" rx="2"/><path class="k-part-h" d="M314,108 L326,108 L326,132 L320,140 L314,132 Z"/></g>
<path d="M320,128 L320,88 L112,58 L112,198 L330,198 L330,156" style="fill:none;stroke:var(--tb-accent);stroke-dasharray:8 5;marker-end:url(#k-arrow-blue)" stroke-width="3"/>
<text class="lbl" x="84" y="120" text-anchor="end">コラム</text>
<text class="lbl" x="220" y="30" text-anchor="middle">アーム</text>
<text class="lbl" x="354" y="126">工具</text>
<line class="k-thin" x1="352" y1="122" x2="328" y2="122"/>
<text class="lbl" x="378" y="160">ワーク</text>
<text class="lbl" x="426" y="182">テーブル</text>
<text class="lbl" x="260" y="240" text-anchor="middle">ベース</text>
<text class="mark-t" x="150" y="124" style="fill:var(--tb-accent)">剛性ループ: すべて直列</text>
</svg>
<p>ループを<b>短く小さく</b>するほど、剛性も熱変形も有利です。門形 (ガントリー) 構造が片持ち (C 形) より精度を出しやすいのは、ループが閉じて対称になるからです。</p>
<h2>剛性バジェット</h2>
<p>目標たわみ (例: 工具先端で 100 N あたり 5 µm) を、ループ上の要素に割り振ったものを<b>剛性バジェット</b>と呼びます。経験的には、構造部材より<b>接合部・軸受・ガイド・ねじ</b>のほうが柔らかく、全たわみの半分以上を占めることも珍しくありません。</p>
<table class="tb-table">
  <tr><th>要素</th><th>剛性の例</th><th>コンプライアンス割合</th></tr>
  <tr><td>フレーム (溶接構造)</td><td>200 N/µm</td><td>14 %</td></tr>
  <tr><td>リニアガイド</td><td>100 N/µm</td><td>29 %</td></tr>
  <tr><td>ボールねじ + サポート軸受</td><td>50 N/µm</td><td>57 %</td></tr>
  <tr><th>合計 (直列)</th><th>28.6 N/µm</th><th>100 %</th></tr>
</table>
<p>この例ではボールねじ系を強化するのが最も効果的です。フレームを 2 倍硬くしても全体は 28.6 → 30.8 N/µm (約 8 %) しか上がりません。</p>
<h2>剛性が効いてくる場面</h2>
<ul>
  <li><b>精度</b>: 切削力・自重・加速度による位置誤差 = 力 / 剛性</li>
  <li><b>振動</b>: 固有振動数 fn ∝ √(k/m)。剛性を 4 倍にして初めて fn が 2 倍</li>
  <li><b>制御</b>: サーボのゲインを上げられるかは機構の剛性 (共振周波数) 次第</li>
  <li><b>座屈・びびり</b>: 剛性不足は不安定現象の入口</li>
</ul>`,
    points: [
      "剛性 k = F/δ。強度 (壊れにくさ) とは別の設計指標",
      "鋼種を替えても E はほぼ同じ — 剛性は形状と長さで稼ぐ",
      "直列は 1/k の足し算で最弱要素が支配、並列は k の足し算",
      "剛性ループを短く閉じて対称に。接合部・軸受・ねじがたわみの主役になりやすい",
      "コンプライアンスの内訳 (剛性バジェット) で改善箇所を決める",
    ],
    exercises: [
      {
        q: "フレーム 200 N/µm、リニアガイド 100 N/µm、ボールねじ系 50 N/µm が直列につながっています。全体剛性と、500 N の切削力による変位を求めなさい。",
        a: "1/k = 1/200 + 1/100 + 1/50 = 0.005 + 0.010 + 0.020 = 0.035 µm/N → <b>k ≈ 28.6 N/µm</b>。変位 δ = 500 / 28.6 ≈ <b>17.5 µm</b>。内訳はボールねじ系が 0.020/0.035 ≈ 57 % を占めます。",
      },
      {
        q: "直径 20 mm、長さ 200 mm の鋼製丸棒 (E = 206 GPa) を片持ちで使います。先端の曲げ剛性 k = 3EI/L³ を求めなさい。",
        a: "I = πd⁴/64 = π × 160 000 / 64 ≈ 7 854 mm⁴。k = 3 × 206 000 × 7 854 / 200³ = 4.854 × 10⁹ / 8 × 10⁶ ≈ <b>607 N/mm</b> (0.607 N/µm)。100 N で約 0.16 mm たわみます。",
      },
      {
        q: "同じばね 2 本 (各 k) を並列にして、それをもう 1 本の同じばねと直列につなぎました。全体の剛性は?",
        a: "並列部 2k、直列で 1/K = 1/(2k) + 1/k = 3/(2k) → <b>K = 2k/3 ≈ 0.67k</b>。",
      },
    ],
    quiz: [
      { q: "鋼のシャフトのたわみが大きすぎます。最も効果がない対策は?", choices: ["軸径を太くする", "軸受間隔を短くする", "高強度の合金鋼に変更する"], answer: 2, explain: "鋼種を変えても縦弾性係数 E はほぼ同じなので、たわみは変わりません。" },
      { q: "剛性 100 N/µm と 25 N/µm の要素の直列剛性は?", choices: ["125 N/µm", "20 N/µm", "62.5 N/µm"], answer: 1, explain: "1/k = 0.01 + 0.04 = 0.05 → k = 20 N/µm。弱いほうより小さくなります。" },
      { q: "剛性ループについて正しいのは?", choices: ["ループが長いほど精度が出る", "ループ上の要素は直列ばねとして働く", "接合部はループに含めなくてよい"], answer: 1, explain: "力はループを一巡するので、全要素のたわみが足し合わされます。接合部も重要な要素です。" },
    ],
    lessons: ["7-1"],
  },
  {
    id: "stiffness-shape",
    part: "mechanics",
    title: "剛性を高める形状 — 断面・リブ・閉断面",
    minutes: 25,
    level: 2,
    lead: "同じ重さでも形しだいで剛性は何倍にも変わります。断面二次モーメントの使い方、閉断面と開断面のねじり剛性の大差、リブの効かせ方、比剛性 E/ρ による材料選びまで、軽くて硬い構造の作り方を学びます。",
    body: `
<h2>曲げ剛性 EI — 高さの 3 乗が効く</h2>
<div class="tb-math">\\text{長方形}\\ I = \\dfrac{b h^3}{12}</div><p>同じ断面積なら「高く・外側へ」</p>
<p>20 × 60 mm の平角棒は、立てて使うと寝かせたときの (60/20)² = <b>9 倍</b>の曲げ剛性になります。材料を中立軸から遠ざける I 形・箱形・パイプが軽量高剛性の基本形です。</p>
<div data-widget="section"></div>
<table class="tb-table">
  <tr><th>断面 (ほぼ同じ断面積 ≈ 400 mm²)</th><th>I (mm⁴)</th><th>比</th></tr>
  <tr><td>丸棒 φ22.6</td><td>約 12 800</td><td>1</td></tr>
  <tr><td>パイプ φ50 × t2.7</td><td>約 113 000</td><td>約 8.8</td></tr>
  <tr><td>角パイプ □50 × t2.1</td><td>約 154 000</td><td>約 12</td></tr>
</table>
<p>ただし薄くしすぎると<b>局部座屈</b>や局部変形 (断面のつぶれ) が起きます。肉厚の目安は幅の 1/30〜1/50 程度以上です。</p>
<h2>ねじり剛性 — 閉断面と開断面は桁違い</h2>
<div class="tb-math">\\text{閉断面 (ブレットの式):}\\ J = \\dfrac{4A_0^2 t}{s} \\qquad \\text{開断面:}\\ J = \\sum \\dfrac{b t^3}{3}</div>
<p>A₀ は肉厚中心線で囲まれた面積、s は中心線の周長です。開断面 (チャンネル、L 形、スリット入りパイプ) は t³ にしか比例しないため、ねじりに極端に弱くなります。</p>
<svg class="tb-chart" viewBox="0 0 520 250" role="img" aria-label="閉断面と開断面">
<rect class="k-panel" x="8" y="8" width="244" height="214" rx="8"/>
<rect class="k-panel" x="268" y="8" width="244" height="214" rx="8"/>
<circle class="k-badge" cx="28" cy="28" r="10" style="fill:var(--tb-good)"/><text class="k-badge-t" x="28" y="32" text-anchor="middle">✓</text><text class="k-title" x="46" y="32">閉断面 (角パイプ)</text>
<circle class="k-badge" cx="288" cy="28" r="10" style="fill:var(--tb-bad)"/><text class="k-badge-t" x="288" y="32" text-anchor="middle">✕</text><text class="k-title" x="306" y="32">スリット入り (開断面)</text>
<g class="k-shadow"><path class="k-cut" d="M84,66 H176 V158 H84 Z M92,74 V150 H168 V74 Z" fill-rule="evenodd"/></g>
<line class="k-move" x1="112" y1="70" x2="148" y2="70" stroke-width="1.6"/><line class="k-move" x1="172" y1="94" x2="172" y2="130" stroke-width="1.6"/><line class="k-move" x1="148" y1="154" x2="112" y2="154" stroke-width="1.6"/><line class="k-move" x1="88" y1="130" x2="88" y2="94" stroke-width="1.6"/>
<path class="k-force" d="M196,70 A72,72 0 0 1 196,154" stroke-width="2"/>
<text class="mark-t" x="216" y="116" style="fill:var(--tb-bad)">T</text>
<text class="mark-t" x="130" y="184" text-anchor="middle">J ≈ 221 000</text>
<text class="k-note" x="130" y="204" text-anchor="middle">せん断流れが断面を一周</text>
<g class="k-shadow"><path class="k-cut" d="M344,106 V66 H436 V158 H344 V118 H352 V150 H428 V74 H352 V106 Z"/></g>
<line class="" x1="336" y1="104" x2="336" y2="84" style="stroke:var(--tb-bad);marker-end:url(#k-arrow-red)" stroke-width="2"/>
<line class="" x1="336" y1="120" x2="336" y2="140" style="stroke:var(--tb-bad);marker-end:url(#k-arrow-red)" stroke-width="2"/>
<path class="k-force" d="M456,70 A72,72 0 0 1 456,154" stroke-width="2"/>
<text class="mark-t" x="476" y="116" style="fill:var(--tb-bad)">T</text>
<text class="mark-t" x="390" y="184" text-anchor="middle">J ≈ 512</text>
<text class="k-note" x="390" y="204" text-anchor="middle">スリット面がずれて大きくねじれる</text>
<text class="lbl" x="260" y="240" text-anchor="middle">同じ材料・寸法でも、ねじり剛性は約 430 倍の差</text>
</svg>
<ul>
  <li>板金フレームは<b>端を閉じる</b> (箱にする、ふたを溶接・リベット止めする) だけでねじり剛性が激増します。</li>
  <li>開口部 (点検窓、配線穴) はねじり剛性を大きく落とします。縁にフランジを付ける、開口を小さく複数に分けるなどで補います。</li>
  <li>ねじりを受ける開断面にはタイプレート・斜めリブ (ダイアゴナル) を入れて閉断面に近づけます。</li>
</ul>
<h2>リブの効かせ方</h2>
<ul>
  <li>リブは<b>力の流れに沿って</b>、荷重点と支点を結ぶように配置する。</li>
  <li>平板の曲げには<b>格子リブ</b>、ねじりには<b>斜め (X) リブ</b>が効く。平行リブだけではねじりはほとんど上がらない。</li>
  <li>リブの先端 (自由縁) が薄いと、そこが局部的にたわむ。縁にフランジを付けると効率が上がる。</li>
  <li>鋳物・樹脂ではリブ厚を主壁の 0.5〜0.7 倍にし、ひけを防ぐ。</li>
</ul>
<h2>比剛性 — 材料選びは E/ρ で比べる</h2>
<table class="tb-table">
  <tr><th>材料</th><th>E (GPa)</th><th>ρ (g/cm³)</th><th>E/ρ</th><th>E^(1/3)/ρ (板)</th></tr>
  <tr><td>鋼</td><td>206</td><td>7.85</td><td>26</td><td>0.75</td></tr>
  <tr><td>アルミ合金</td><td>70</td><td>2.7</td><td>26</td><td>1.53</td></tr>
  <tr><td>マグネシウム合金</td><td>45</td><td>1.8</td><td>25</td><td>1.97</td></tr>
  <tr><td>鋳鉄 (FC250)</td><td>110</td><td>7.2</td><td>15</td><td>0.67</td></tr>
  <tr><td>CFRP (一方向)</td><td>130〜</td><td>1.6</td><td>80〜</td><td>3.2</td></tr>
</table>
<p>棒の引張や同一形状の比較では鋼もアルミも E/ρ はほぼ同じです。しかし<b>板の曲げ</b>で同じ重さにする場合、軽い材料は板を厚くでき、剛性は t³ で効くため E^(1/3)/ρ が大きいアルミ・マグネシウムが有利になります。同じ形状のまま鋼をアルミに置き換えると、剛性は約 1/3 に落ちる点に注意しましょう。</p>
<div class="tb-tip"><b>材料 vs 形状</b>: E を上げる手段は限られます (鋼 → 超硬でも約 3 倍)。形状 (高さ・閉断面・支点間距離) なら一桁の改善も可能です。まず形状で考えましょう。</div>`,
    points: [
      "曲げ剛性は I ∝ b h³。材料を中立軸から遠くへ",
      "閉断面のねじり剛性は開断面の数百倍。スリット・開口に注意",
      "ねじりには斜めリブ、曲げには格子リブ。リブは力の流れに沿う",
      "比剛性 E/ρ は鋼・アルミでほぼ同じ。板の曲げでは軽い材料が有利",
      "同形状で鋼 → アルミにすると剛性は約 1/3",
    ],
    exercises: [
      {
        q: "□50 × 50、肉厚 2 mm の角パイプのねじり定数 J を、閉断面の場合と、1 か所に縦スリットを入れた開断面の場合で比べなさい (肉厚中心線で計算)。",
        a: "中心線は 48 × 48 mm。閉断面: A₀ = 2 304 mm²、s = 192 mm、J = 4 × 2 304² × 2 / 192 = 42 467 328 / 192 ≈ <b>221 000 mm⁴</b>。開断面: J = s t³ / 3 = 192 × 8 / 3 = <b>512 mm⁴</b>。比は約 <b>430 倍</b>です。",
      },
      {
        q: "鋼製の角パイプ梁をアルミ合金 (E = 70 GPa) に置き換え、同じ曲げ剛性を保つには I を何倍にすればよいですか? 断面の高さだけで調整する (幅・肉厚の比は一定で相似に拡大する) と、外形は何倍になりますか?",
        a: "EI 一定より I_Al / I_St = 206 / 70 ≈ <b>2.94 倍</b>。相似拡大なら I ∝ (寸法)⁴ なので、寸法は 2.94^(1/4) ≈ <b>1.31 倍</b>。このとき断面積は 1.31² ≈ 1.72 倍、密度比 2.7/7.85 ≈ 0.344 なので重さは約 0.59 倍 (約 4 割軽量化) になります。",
      },
    ],
    quiz: [
      { q: "幅 20 mm × 高さ 60 mm の平角棒を寝かせて (高さ 20 mm で) 使うと、立てた場合に比べて曲げ剛性は?", choices: ["1/3", "1/9", "1/27"], answer: 1, explain: "I = bh³/12 の比は (20/60)² = 1/9 です (幅と高さが入れ替わるため 2 乗)。" },
      { q: "板金のチャンネル形フレームのねじり剛性を上げる最も効果的な方法は?", choices: ["板厚を 10 % 増やす", "開いた面をふさいで閉断面にする", "長手方向に平行リブを入れる"], answer: 1, explain: "閉断面化でねじり剛性は桁違いに上がります。" },
      { q: "同じ重さの平板で曲げ剛性を最大にしたい。有利な材料は?", choices: ["鋼", "アルミ合金", "どちらも同じ"], answer: 1, explain: "同重量なら軽い材料は厚くでき、剛性は t³ で効くためアルミが有利です (E^(1/3)/ρ)。" },
    ],
  },
  {
    id: "joint-stiffness",
    part: "mechanics",
    title: "接合部・締結部・軸受の剛性",
    minutes: 25,
    level: 3,
    lead: "部材単体の計算では十分硬いのに、組み立てるとたわむ — 原因の多くは接合部です。ボルト締結部の剛性、接触剛性、軸受やリニアガイドの剛性と予圧、フレーム継手の柔らかさを見積もり、対策する方法を学びます。",
    body: `
<h2>なぜ接合部は柔らかいのか</h2>
<ul>
  <li><b>接触面</b>: 表面の微小な凹凸が先に接触し、つぶれながら面圧を支える (接触剛性)。面圧が低いほど柔らかい。</li>
  <li><b>局部変形</b>: ボルト周りやフランジの曲げ、板の面外変形。</li>
  <li><b>すべり・離間</b>: 締付力を超える力でずれる、モーメントで口開きする。こうなると剛性が急落し、非線形になる。</li>
</ul>
<h2>ボルト締結部の剛性</h2>
<div class="tb-math">\\text{ボルト}\\ k_b = \\dfrac{E A_b}{l_k} \\qquad \\text{被締結部}\\ k_c = \\dfrac{E A_c}{l_k}</div><p>A<sub>c</sub>: 等価円筒の面積</p>
<p>被締結部は座面から円すい状に広がる領域で圧縮力を受け、一般に kc はボルトの 3〜10 倍硬くなります。外力 W のうちボルトに加わるのは内力係数 φ = kb/(kb+kc) 倍だけです (詳しくは「ボルト締結」の章)。</p>
<svg class="tb-chart" viewBox="0 0 520 210" role="img" aria-label="ボルト締結部の圧縮円すい">
<g class="k-shadow"><rect class="k-cut" x="140" y="60" width="240" height="45"/><rect class="k-cut2" x="140" y="105" width="240" height="45"/></g>
<rect class="" x="244" y="60" width="32" height="90" style="fill:var(--tb-surface)"/>
<path d="M222,60 L196,105 L222,150 L298,150 L324,105 L298,60 Z" style="fill:var(--tb-accent);fill-opacity:0.28;stroke:var(--tb-accent);stroke-dasharray:6 4" stroke-width="2"/>
<g class="k-shadow"><rect class="k-part-h" x="248" y="36" width="24" height="140"/><rect class="k-part" x="222" y="40" width="76" height="20" rx="2"/><rect class="k-part" x="222" y="150" width="76" height="22" rx="2"/></g>
<line class="k-thin" x1="246" y1="40" x2="246" y2="60"/>
<line class="k-thin" x1="274" y1="40" x2="274" y2="60"/>
<line class="k-thin" x1="246" y1="150" x2="246" y2="172"/>
<line class="k-thin" x1="274" y1="150" x2="274" y2="172"/>
<line class="k-center" x1="260" y1="26" x2="260" y2="186"/>
<line class="k-ext" x1="298" y1="60" x2="298" y2="92"/>
<path class="k-thin" d="M298,86 A26,26 0 0 0 311,82.5" style="stroke:var(--k-dim)"/>
<text class="k-dimtext" x="300" y="100" style="stroke:var(--tb-surface);stroke-width:3px">30°</text>
<text class="mark-t" x="388" y="100">圧縮円すい</text>
<text class="mark-t" x="388" y="116">(約 30°)</text>
<line class="k-thin" x1="386" y1="104" x2="320" y2="112" style="marker-end:url(#k-arrow)"/>
<text class="lbl" x="130" y="86" text-anchor="end">部材 1</text>
<text class="lbl" x="130" y="132" text-anchor="end">部材 2</text>
<text class="lbl" x="310" y="30">ボルト</text>
<line class="k-thin" x1="308" y1="27" x2="286" y2="42"/>
<text class="k-note" x="260" y="202" text-anchor="middle">締付力は頭・ナットの座面から約 30° で広がって部材に伝わる</text>
</svg>
<h3>モーメントを受ける継手</h3>
<p>柱の根元・アームの付け根などのボルト継手は、モーメントで<b>口開き</b>すると回転剛性が急に低下します。</p>
<ul>
  <li>ボルトを<b>モーメントの腕が長くなる位置</b> (外側) に配置し、ピッチを詰める</li>
  <li>フランジを厚くし (ボルト径の 1.5〜2 倍以上)、座面周辺の局部曲げを抑える</li>
  <li>接触面は面圧が高くなるよう<b>周辺だけを当てる</b> (中央を逃がす) と安定する</li>
  <li>位置決めピン・インロー・キーでせん断を受け、ボルトは締付けに専念させる</li>
</ul>
<h2>軸受・ガイドの剛性と予圧</h2>
<p>転がり軸受は、玉と軌道のヘルツ接触のため荷重とともに硬くなる<b>非線形ばね</b>です (玉軸受では δ ∝ F^(2/3))。軽荷重域やすきまがあると非常に柔らかく、ガタになります。</p>
<ul>
  <li><b>予圧</b>: あらかじめ内部に押付け力を与え、硬い領域で使う。アンギュラ玉軸受の背面組合せ (DB)、リニアガイドの予圧等級 (軽・中・重)。</li>
  <li>予圧を上げると剛性は上がるが、発熱・寿命低下・駆動抵抗が増える。高速主軸は軽予圧、工作機械の送り系は中〜重予圧が目安。</li>
  <li>背面組合せ (DB) は作用点間距離が広く、<b>モーメント剛性</b>が高い。</li>
  <li>ころ軸受 (線接触) は玉軸受 (点接触) より剛性が高い。</li>
</ul>
<h2>フレーム継手の柔らかさ</h2>
<table class="tb-table">
  <tr><th>継手</th><th>剛性の傾向</th><th>注意点</th></tr>
  <tr><td>全周溶接</td><td>母材に近い</td><td>溶接ひずみ・残留応力、焼鈍の要否</td></tr>
  <tr><td>アルミフレーム + ブラケット</td><td>柔らかい (直角度もずれやすい)</td><td>コーナーに三角ガセット・斜材を追加</td></tr>
  <tr><td>ボルト + インロー/ピン</td><td>締付力と面圧しだい</td><td>当たり面の平面度、ボルト配置</td></tr>
  <tr><td>接着</td><td>接着層が薄いほど硬い</td><td>はく離力を避け、せん断で受ける</td></tr>
</table>
<div class="tb-tip"><b>FEA の注意</b>: 解析モデルで部品を「完全結合」にすると、接合部の柔らかさが入らず固有振動数を高めに (実測の 1.2〜2 倍) 予測しがちです。重要な継手はばね要素や接触条件で柔らかさを入れるか、実測で補正します。</div>`,
    points: [
      "接合部の柔らかさは接触・局部変形・口開き/すべりから来る",
      "被締結部はボルトより数倍硬く、外力の一部 φ だけがボルトに加わる",
      "モーメント継手はボルトを外側に、フランジは厚く、口開きさせない",
      "軸受・ガイドは非線形ばね。予圧で硬い領域を使う (発熱とのトレードオフ)",
      "FEA の完全結合は剛性を過大評価しやすい",
    ],
    exercises: [
      {
        q: "M10 ボルト (有効断面積 58 mm²) で厚さ合計 30 mm の鋼板を締結します。被締結部の等価断面積を 300 mm² とすると、ボルトと被締結部の剛性、内力係数 φ はいくらですか (E = 206 GPa、ねじ部の柔らかさは無視)。",
        a: "kb = 206 000 × 58 / 30 ≈ <b>398 000 N/mm</b>、kc = 206 000 × 300 / 30 = <b>2 060 000 N/mm</b>。φ = 398 / (398 + 2 060) ≈ <b>0.16</b>。外力の約 16 % だけがボルト軸力の増加になります。",
      },
      {
        q: "高さ 500 mm の柱を根元でボルト固定しました。根元継手の回転剛性は 5 × 10⁸ N·mm/rad です。柱先端に横力 200 N が加わるとき、継手の回転による先端の変位はいくらですか。",
        a: "モーメント M = 200 × 500 = 1 × 10⁵ N·mm、回転角 θ = M / kθ = 2 × 10⁻⁴ rad、先端変位 = θ × L = 2 × 10⁻⁴ × 500 = <b>0.10 mm</b>。柱自身の曲げたわみとは別にこれが加わります。",
      },
    ],
    quiz: [
      { q: "リニアガイドの予圧を重くすると?", choices: ["剛性が上がり、駆動抵抗と発熱も増える", "剛性が下がり、寿命が延びる", "剛性も抵抗も変わらない"], answer: 0, explain: "予圧は剛性とのトレードオフで、摩擦・発熱・寿命に影響します。" },
      { q: "モーメントを受けるボルト継手で剛性を保つポイントは?", choices: ["ボルトを中心付近に集める", "接合面が口開きしないよう、ボルトを外側に配置し締付力を確保する", "フランジを薄くしてなじませる"], answer: 1, explain: "口開きすると回転剛性が急落します。" },
      { q: "部品を完全結合した FEA の固有振動数は、実機と比べて一般に?", choices: ["低めに出る", "高めに出る", "常に一致する"], answer: 1, explain: "接合部の柔らかさが無視されるため、剛性と固有振動数を過大評価しがちです。" },
    ],
  },
  {
    id: "deflection-design",
    part: "mechanics",
    title: "変形の計算とたわみ許容値",
    minutes: 25,
    level: 2,
    lead: "たわみは「計算して終わり」ではなく、機能に照らして許容値と比べて初めて意味を持ちます。重ね合わせによる計算、機械で使われるたわみ・傾きの許容目安、軸受部の傾き、熱変形の見積もりを学びます。",
    body: `
<h2>基本公式の一覧</h2>
<table class="tb-table">
  <tr><th>条件</th><th>最大たわみ δ</th><th>傾き θ</th></tr>
  <tr><td>片持ち・先端集中荷重 F</td><td>F L³ / (3EI)</td><td>先端 F L² / (2EI)</td></tr>
  <tr><td>片持ち・等分布 w</td><td>w L⁴ / (8EI)</td><td>先端 w L³ / (6EI)</td></tr>
  <tr><td>両端支持・中央集中 F</td><td>F L³ / (48EI)</td><td>支点 F L² / (16EI)</td></tr>
  <tr><td>両端支持・等分布 w</td><td>5 w L⁴ / (384EI)</td><td>支点 w L³ / (24EI)</td></tr>
  <tr><td>両端固定・中央集中 F</td><td>F L³ / (192EI)</td><td>—</td></tr>
</table>
<div data-widget="beam"></div>
<p>支持条件だけで、中央集中荷重のたわみは両端支持 → 両端固定で <b>1/4</b> になります。ただし「固定」が本当に固定になっているか (継手の回転剛性) を必ず確認しましょう。</p>
<h2>重ね合わせの原理</h2>
<p>線形弾性の範囲では、複数の荷重によるたわみは各荷重単独のたわみの和です。自重 (等分布) + 搭載物 (集中) のように分けて計算し、足し合わせます。</p>
<svg class="tb-chart" viewBox="0 0 520 190" role="img" aria-label="重ね合わせ">
<rect class="k-panel" x="8" y="12" width="154" height="148" rx="8"/><text class="k-title" x="85" y="34" text-anchor="middle">自重 w</text><line class="" x1="25" y1="50" x2="145" y2="50" style="stroke:var(--tb-bad)" stroke-width="1.6"/><line class="k-force" x1="25" y1="50" x2="25" y2="71" stroke-width="1.6"/><line class="k-force" x1="45" y1="50" x2="45" y2="71" stroke-width="1.6"/><line class="k-force" x1="65" y1="50" x2="65" y2="71" stroke-width="1.6"/><line class="k-force" x1="85" y1="50" x2="85" y2="71" stroke-width="1.6"/><line class="k-force" x1="105" y1="50" x2="105" y2="71" stroke-width="1.6"/><line class="k-force" x1="125" y1="50" x2="125" y2="71" stroke-width="1.6"/><line class="k-force" x1="145" y1="50" x2="145" y2="71" stroke-width="1.6"/><path class="k-hidden" d="M25,82 Q85,102 145,82" style="stroke:var(--tb-accent)"/><g class="k-shadow"><rect class="k-part-h" x="21" y="73" width="128" height="9" rx="1"/></g><path class="k-part" d="M25,82 L17,94 L33,94 Z"/><circle class="k-edge" cx="25" cy="82" r="2.6" style="fill:var(--tb-surface)"/><rect class="k-ground" x="11" y="94" width="28" height="7"/><line class="k-edge" x1="11" y1="94" x2="39" y2="94"/><path class="k-part" d="M145,82 L137,91.6 L153,91.6 Z"/><circle class="k-edge" cx="145" cy="82" r="2.6" style="fill:var(--tb-surface)"/><circle class="k-sphere" cx="141" cy="94.8" r="3"/><circle class="k-sphere" cx="149" cy="94.8" r="3"/><rect class="k-ground" x="131" y="98" width="28" height="7"/><line class="k-edge" x1="131" y1="98" x2="159" y2="98"/><text class="k-dimtext" x="85" y="120" text-anchor="middle">δ1</text>
<text class="k-title" x="172" y="92" text-anchor="middle">+</text>
<rect class="k-panel" x="182" y="12" width="154" height="148" rx="8"/><text class="k-title" x="259" y="34" text-anchor="middle">集中 F</text><line class="k-force" x1="259" y1="42" x2="259" y2="71"/><path class="k-hidden" d="M199,82 Q259,110 319,82" style="stroke:var(--tb-accent)"/><g class="k-shadow"><rect class="k-part-h" x="195" y="73" width="128" height="9" rx="1"/></g><path class="k-part" d="M199,82 L191,94 L207,94 Z"/><circle class="k-edge" cx="199" cy="82" r="2.6" style="fill:var(--tb-surface)"/><rect class="k-ground" x="185" y="94" width="28" height="7"/><line class="k-edge" x1="185" y1="94" x2="213" y2="94"/><path class="k-part" d="M319,82 L311,91.6 L327,91.6 Z"/><circle class="k-edge" cx="319" cy="82" r="2.6" style="fill:var(--tb-surface)"/><circle class="k-sphere" cx="315" cy="94.8" r="3"/><circle class="k-sphere" cx="323" cy="94.8" r="3"/><rect class="k-ground" x="305" y="98" width="28" height="7"/><line class="k-edge" x1="305" y1="98" x2="333" y2="98"/><text class="k-dimtext" x="259" y="124" text-anchor="middle">δ2</text>
<text class="k-title" x="346" y="92" text-anchor="middle">=</text>
<rect class="k-panel" x="356" y="12" width="154" height="148" rx="8"/><text class="k-title" x="433" y="34" text-anchor="middle">合計</text><line class="" x1="373" y1="50" x2="493" y2="50" style="stroke:var(--tb-bad)" stroke-width="1.6"/><line class="k-force" x1="373" y1="50" x2="373" y2="71" stroke-width="1.6"/><line class="k-force" x1="393" y1="50" x2="393" y2="71" stroke-width="1.6"/><line class="k-force" x1="413" y1="50" x2="413" y2="71" stroke-width="1.6"/><line class="k-force" x1="433" y1="50" x2="433" y2="71" stroke-width="1.6"/><line class="k-force" x1="453" y1="50" x2="453" y2="71" stroke-width="1.6"/><line class="k-force" x1="473" y1="50" x2="473" y2="71" stroke-width="1.6"/><line class="k-force" x1="493" y1="50" x2="493" y2="71" stroke-width="1.6"/><line class="k-force" x1="433" y1="42" x2="433" y2="71"/><path class="k-hidden" d="M373,82 Q433,130 493,82" style="stroke:var(--tb-accent)"/><g class="k-shadow"><rect class="k-part-h" x="369" y="73" width="128" height="9" rx="1"/></g><path class="k-part" d="M373,82 L365,94 L381,94 Z"/><circle class="k-edge" cx="373" cy="82" r="2.6" style="fill:var(--tb-surface)"/><rect class="k-ground" x="359" y="94" width="28" height="7"/><line class="k-edge" x1="359" y1="94" x2="387" y2="94"/><path class="k-part" d="M493,82 L485,91.6 L501,91.6 Z"/><circle class="k-edge" cx="493" cy="82" r="2.6" style="fill:var(--tb-surface)"/><circle class="k-sphere" cx="489" cy="94.8" r="3"/><circle class="k-sphere" cx="497" cy="94.8" r="3"/><rect class="k-ground" x="479" y="98" width="28" height="7"/><line class="k-edge" x1="479" y1="98" x2="507" y2="98"/><text class="k-dimtext" x="433" y="134" text-anchor="middle">δ1 + δ2</text>
<text class="tick" x="260" y="180" text-anchor="middle">線形範囲なら、たわみ・傾き・応力はすべて足し算できる</text>
</svg>
<p>ねじり・せん断たわみ・継手の回転による変位も、同じように足し合わせます。短く太いはり (L/h &lt; 5 程度) では<b>せん断たわみ</b>が無視できなくなります。</p>
<h2>たわみ許容値の目安</h2>
<table class="tb-table">
  <tr><th>用途</th><th>許容たわみの目安</th></tr>
  <tr><td>建築の床ばり</td><td>L/300 程度</td></tr>
  <tr><td>一般機械のフレーム・架台</td><td>L/1000〜L/2000</td></tr>
  <tr><td>精密機械・工作機械の構造</td><td>L/5000 以下、または絶対値 (数 µm)</td></tr>
  <tr><td>歯車軸 (かみ合い部)</td><td>0.01 × モジュール程度以下</td></tr>
  <tr><td>搬送ローラ・ガイドレール</td><td>機能 (蛇行・段差) から決める</td></tr>
</table>
<p>許容値は「ユーザーが気付く・機能が損なわれる」量から決めます。たとえば位置決め精度 ±10 µm の装置なら、加減速力による構造変形は数 µm 以下に抑える必要があります。</p>
<h2>軸受部の傾き</h2>
<p>軸がたわむと軸受位置で傾き θ が生じ、内輪と外輪がずれて (ミスアライメント) 寿命が縮みます。</p>
<ul>
  <li>深溝玉軸受: 許容傾きの目安 約 1/1000〜1/300 rad (0.001〜0.003 rad)</li>
  <li>円筒ころ・円すいころ軸受: 約 1/2000〜1/1000 rad と厳しい</li>
  <li>自動調心軸受: 数度まで許容 (たわみの大きい長軸に)</li>
</ul>
<h2>熱変形</h2>
<div class="tb-math">\\text{伸び}\\ \\Delta L = \\alpha L \\Delta T \\qquad \\text{反り (両端支持)}\\ \\delta = \\dfrac{\\alpha\\, \\Delta T_h L^2}{8h}</div><p>ΔT<sub>h</sub>: 上下面の温度差</p>
<p>鋼 α ≈ 11.5 × 10⁻⁶ /K では、1 m が 1 K で <b>11.5 µm</b> 伸びます。精密機械では荷重によるたわみより熱変形のほうが大きいことがよくあります。</p>
<ul>
  <li>上下面の温度差 (モーター・照明・日射) が反りを生む。熱源を対称に配置する。</li>
  <li>熱膨張の基準点 (固定点) を決め、ほかは逃がす (固定側・自由側の軸受配置と同じ考え方)。</li>
  <li>低熱膨張材 (インバー、セラミックス)、温度管理、暖機運転、熱変位補正を組み合わせる。</li>
</ul>`,
    points: [
      "支持条件で係数が大きく変わる (中央集中: 1/48 → 両端固定 1/192)",
      "線形範囲ではたわみ・傾きは重ね合わせで足し算",
      "許容値の目安: 一般機械 L/1000〜L/2000、精密機械はさらに厳しく機能から決める",
      "軸受部の傾きは軸受の種類ごとの許容値と比べる",
      "精密機械では熱変形 (1 m・1 K で約 11.5 µm) が支配的になりやすい",
    ],
    exercises: [
      {
        q: "直径 30 mm の鋼軸 (E = 206 GPa) を 400 mm 間隔の玉軸受で支え、中央に 2 000 N の荷重が加わります。中央のたわみと軸受部の傾きを求め、L/1000 と玉軸受の許容傾き 0.002 rad と比べなさい。",
        a: "I = π × 30⁴ / 64 = π × 810 000 / 64 ≈ 39 760 mm⁴。EI = 206 000 × 39 760 ≈ 8.19 × 10⁹ N·mm²。δ = 2 000 × 400³ / (48 × 8.19 × 10⁹) = 1.28 × 10¹¹ / 3.93 × 10¹¹ ≈ <b>0.33 mm</b> (L/1000 = 0.4 mm 以内)。θ = 2 000 × 400² / (16 × 8.19 × 10⁹) = 3.2 × 10⁸ / 1.31 × 10¹¹ ≈ <b>0.0024 rad</b> で許容 0.002 rad を超えます。たわみは合格でも傾きで不合格になる例です。",
      },
      {
        q: "長さ 1 m、高さ 100 mm の鋼製ビーム (α = 11.5 × 10⁻⁶ /K) が両端支持されています。上面が下面より 2 K 高いとき、中央の反りはいくらですか。また全体が 5 K 上がったときの伸びは?",
        a: "反り δ = α ΔT L² / (8h) = 11.5 × 10⁻⁶ × 2 × 1 000² / (8 × 100) = 23 / 800 ≈ <b>0.029 mm (29 µm)</b>。伸び ΔL = 11.5 × 10⁻⁶ × 1 000 × 5 = <b>0.0575 mm (57.5 µm)</b>。",
      },
    ],
    quiz: [
      { q: "両端支持・中央集中荷重のはりを両端固定にすると、たわみは?", choices: ["1/2", "1/4", "1/8"], answer: 1, explain: "FL³/48EI → FL³/192EI で 1/4 になります。" },
      { q: "一般的な機械フレームのたわみ許容の目安は?", choices: ["L/100", "L/300", "L/1000〜L/2000"], answer: 2, explain: "L/300 は建築の目安で、機械はより厳しくします。" },
      { q: "長軸がたわんで軸受部が大きく傾く場合に適した軸受は?", choices: ["円筒ころ軸受", "自動調心玉軸受", "アンギュラ玉軸受"], answer: 1, explain: "自動調心軸受は外輪軌道が球面で、傾きを吸収できます。" },
    ],
    lessons: ["7-1"],
  },
  {
    id: "vibration-modes",
    part: "mechanics",
    title: "多自由度振動・モード・危険速度",
    minutes: 30,
    level: 3,
    lead: "実際の構造物には固有振動数がたくさんあり、それぞれ決まった揺れ方 (モード形状) を持ちます。2 自由度系の考え方、はりのモード、回転軸の危険速度とキャンベル線図を学び、FEA のモード解析結果を読めるようになりましょう。",
    body: `
<h2>自由度とモード</h2>
<p>質量とばねが 1 組なら固有振動数は 1 つですが、質量が n 個あれば固有振動数は n 個あります。それぞれの固有振動数で構造は決まった形で揺れ、これを<b>固有モード (モード形状)</b>と呼びます。連続体 (はり・板) は無限の自由度を持ち、低い順に 1 次・2 次・3 次 … のモードがあります。</p>
<div data-widget="anim-modeshape"></div>
<h3>2 自由度系の例</h3>
<p>固定端 — ばね k — 質量 m — ばね k — 質量 m のくし形系では、</p>
<div class="tb-math">\\omega^2 = \\dfrac{3 \\mp \\sqrt{5}}{2} \\cdot \\dfrac{k}{m} \\quad\\Rightarrow\\quad \\omega_1 = 0.618\\sqrt{k/m},\\ \\ \\omega_2 = 1.618\\sqrt{k/m}</div>
<ul>
  <li>1 次モード: 2 つの質量が<b>同じ向き</b>に動く (振幅比 1 : 1.618)</li>
  <li>2 次モード: 2 つの質量が<b>逆向き</b>に動く (振幅比 1 : −0.618)</li>
  <li>任意の振動は、これらモードの重ね合わせで表せる (<b>モード重ね合わせ法</b>)</li>
</ul>
<h2>はりの固有振動数</h2>
<div class="tb-math">f_i = \\dfrac{\\lambda_i^2}{2\\pi L^2} \\sqrt{\\dfrac{EI}{\\rho A}}</div>
<table class="tb-table">
  <tr><th>支持条件</th><th>λ₁</th><th>λ₂</th><th>λ₃</th><th>f₂/f₁</th></tr>
  <tr><td>片持ち</td><td>1.875</td><td>4.694</td><td>7.855</td><td>6.27</td></tr>
  <tr><td>両端単純支持</td><td>π</td><td>2π</td><td>3π</td><td>4</td></tr>
  <tr><td>両端固定</td><td>4.730</td><td>7.853</td><td>10.996</td><td>2.76</td></tr>
</table>
<div data-widget="cantilevervib"></div>
<p>モードの<b>節</b> (動かない点) と<b>腹</b> (最も動く点) を知ることは実務で重要です。加振点や重い部品を節に置くとそのモードは励起されにくく、ダンパーやセンサーは腹に置くと効果的です。</p>
<h2>近似法</h2>
<ul>
  <li><b>静たわみから</b>: 自重による最大たわみ δ (mm) から f₁ ≈ 15.8 / √δ [Hz] (1 自由度換算。分布質量では係数 ≈ 17.8〜18)</li>
  <li><b>レイリー法</b>: 運動エネルギーとひずみエネルギーの最大値を等しく置く。仮定した変形形状が正しいほど精度が上がり、常に真値以上を与える。</li>
  <li><b>ダンカレーの式</b>: 1/f² = 1/f₁² + 1/f₂² + … (各質量単独の固有振動数から全体を下限で見積もる)</li>
</ul>
<h2>回転軸の危険速度</h2>
<p>回転軸の質量中心がわずかに偏心していると、回転数が曲げの固有振動数に一致したとき振れ回りが急増します。この回転数を<b>危険速度</b>と呼びます。</p>
<div class="tb-math">N_c = \\dfrac{60}{2\\pi} \\sqrt{\\dfrac{g}{\\delta_{st}}} \\approx \\dfrac{946}{\\sqrt{\\delta_{st}\\,(\\mathrm{mm})}}\\ \\ [\\mathrm{min^{-1}}]</div>
<ul>
  <li>常用回転数は危険速度の <b>0.7 倍以下</b> (剛性軸) か、<b>1.3〜1.4 倍以上</b> (たわみ軸、速やかに通過させる) にする</li>
  <li>不つり合いを減らす (バランシング) と共振時の振幅も小さくなる</li>
  <li>軸受やハウジングの剛性が低いと危険速度は計算より下がる</li>
</ul>
<h3>キャンベル線図</h3>
<svg class="tb-chart" viewBox="0 0 520 240" role="img" aria-label="キャンベル線図">
<rect class="" x="60" y="134" width="380" height="12" style="fill:var(--tb-warn);opacity:0.14"/>
<rect class="" x="60" y="64" width="380" height="12" style="fill:var(--tb-warn);opacity:0.14"/>
<line class="" x1="60" y1="140" x2="440" y2="140" style="stroke:var(--tb-warn)" stroke-width="2"/>
<line class="" x1="60" y1="70" x2="440" y2="70" style="stroke:var(--tb-warn)" stroke-width="2"/>
<line class="axis" x1="60" y1="200" x2="490" y2="200"/>
<line class="axis" x1="60" y1="200" x2="60" y2="20"/>
<line class="" x1="60" y1="200" x2="440" y2="118.6" style="stroke:var(--tb-accent)" stroke-width="2.4"/>
<line class="" x1="60" y1="200" x2="300" y2="20" style="stroke:var(--tb-accent);stroke-dasharray:7 4" stroke-width="2.4"/>
<circle class="mark" cx="340" cy="140" r="6" style="fill:var(--tb-bad)" filter="url(#k-glow)"/>
<circle class="mark" cx="140" cy="140" r="6" filter="url(#k-glow)"/>
<circle class="mark" cx="233" cy="70" r="6" filter="url(#k-glow)"/>
<text class="tick" x="446" y="144">1 次モード</text>
<text class="tick" x="446" y="74">2 次モード</text>
<text class="tick" x="446" y="116" style="fill:var(--tb-accent)">1× 回転</text>
<text class="tick" x="306" y="26" style="fill:var(--tb-accent)">n× (羽根数・歯数)</text>
<text class="lbl" x="480" y="225" text-anchor="end">回転数</text>
<text class="lbl" x="66" y="16">周波数</text>
<text class="mark-t" x="250" y="192" style="fill:var(--tb-bad)">交点 = 共振の危険がある回転数</text>
</svg>
<p>横軸に回転数、縦軸に周波数をとり、固有振動数 (横線) と加振の次数線 (1×、2×、羽根数×…) を重ねます。<b>運転範囲内に交点がない</b>ことを確認します。</p>`,
    points: [
      "n 自由度系には n 個の固有振動数とモード形状がある",
      "片持ちはりの f₂/f₁ ≈ 6.3、両端支持では 4",
      "モードの節・腹を意識して加振源・重量物・ダンパーを配置",
      "危険速度 Nc ≈ 946/√δst(mm) min⁻¹。常用は 0.7 Nc 以下か 1.3 Nc 以上",
      "キャンベル線図で運転範囲内に共振交点がないか確認",
    ],
    exercises: [
      {
        q: "幅 20 mm、厚さ 3 mm、長さ 200 mm の鋼製板ばね (E = 206 GPa、ρ = 7 850 kg/m³) を片持ちにし、厚さ方向に振動させます。1 次・2 次固有振動数を求めなさい。",
        a: "I = 20 × 3³ / 12 = 45 mm⁴ = 45 × 10⁻¹² m⁴、EI = 9.27 N·m²。ρA = 7 850 × 60 × 10⁻⁶ = 0.471 kg/m。√(EI/(ρA L⁴)) = √(9.27 / (0.471 × 0.0016)) = √12 300 ≈ 110.9 s⁻¹。f₁ = 1.875² / 2π × 110.9 = 0.5595 × 110.9 ≈ <b>62 Hz</b>、f₂ = 6.27 × f₁ ≈ <b>389 Hz</b>。",
      },
      {
        q: "ロータを載せた軸の、自重による静たわみが 0.05 mm でした。危険速度を求め、常用回転数 3 000 min⁻¹ が適切か判断しなさい。",
        a: "Nc ≈ 946 / √0.05 = 946 / 0.2236 ≈ <b>4 230 min⁻¹</b>。3 000 / 4 230 ≈ 0.71 で、0.7 倍の目安ぎりぎりです。軸を太くする・軸受間を詰めるなどで余裕を持たせたいところです。",
      },
      {
        q: "固定端 — k — m — k — m の 2 自由度系で k = 1 × 10⁵ N/m、m = 10 kg のとき、2 つの固有振動数は?",
        a: "√(k/m) = √10 000 = 100 rad/s。ω₁ = 0.618 × 100 = 61.8 rad/s → f₁ = 61.8 / 2π ≈ <b>9.8 Hz</b>。ω₂ = 1.618 × 100 = 161.8 rad/s → f₂ ≈ <b>25.8 Hz</b>。",
      },
    ],
    quiz: [
      { q: "片持ちはりの 2 次固有振動数は 1 次のおよそ何倍?", choices: ["2 倍", "4 倍", "6.3 倍"], answer: 2, explain: "(4.694/1.875)² ≈ 6.27 倍です。" },
      { q: "あるモードを励起しにくくするには、加振源をどこに置く?", choices: ["モードの腹", "モードの節", "どこでも同じ"], answer: 1, explain: "節はそのモードで動かないため、力を加えてもエネルギーが入りにくくなります。" },
      { q: "キャンベル線図で確認することは?", choices: ["材料の疲労限度", "運転回転数範囲で加振次数線と固有振動数が交わらないこと", "軸受の寿命"], answer: 1, explain: "交点は共振が起きる回転数です。" },
    ],
    lessons: ["7-1"],
  },
  {
    id: "isolation-damping",
    part: "mechanics",
    title: "防振と制振 — 伝えない・揺れを止める",
    minutes: 30,
    level: 3,
    lead: "振動対策には、振動を伝えない「防振 (振動絶縁)」と、揺れそのものを減らす「制振 (減衰付与)」、特定周波数を打ち消す「動吸振器」があります。伝達率の式から防振材の選び方、減衰の種類、動吸振器の設計までを学びます。",
    body: `
<h2>振動対策の 3 つの方向</h2>
<table class="tb-table">
  <tr><th>方法</th><th>考え方</th><th>例</th></tr>
  <tr><td>加振源を減らす</td><td>不つり合い・ガタ・衝撃を減らす</td><td>バランシング、S 字加減速、歯車精度</td></tr>
  <tr><td>共振を避ける</td><td>固有振動数を加振周波数から離す</td><td>剛性アップ、質量配置の変更</td></tr>
  <tr><td>防振</td><td>柔らかく支えて伝達を遮る</td><td>防振ゴム、空気ばね、除振台</td></tr>
  <tr><td>制振</td><td>振動エネルギーを熱に変える</td><td>制振鋼板、粘弾性材、摩擦、動吸振器</td></tr>
</table>
<h2>伝達率</h2>
<div class="tb-math">T = \\dfrac{\\sqrt{1 + (2\\zeta r)^2}}{\\sqrt{(1 - r^2)^2 + (2\\zeta r)^2}} \\qquad r = \\dfrac{f}{f_n}</div>
<div data-widget="anim-isolation"></div>
<ul>
  <li>r &lt; √2: T &gt; 1 (増幅)。r = 1 で共振 (T ≈ 1/(2ζ))</li>
  <li>r &gt; √2: T &lt; 1 (防振領域)。r = 3 で約 1/8、r = 5 で約 1/24</li>
  <li>防振領域では<b>減衰が大きいほど伝達率は悪化</b>する。共振通過時 (起動・停止) との兼ね合いで ζ = 0.05〜0.2 程度を選ぶ</li>
</ul>
<div data-widget="vibration"></div>
<h3>防振材の選び方</h3>
<div class="tb-math">f_n \\approx \\dfrac{15.8}{\\sqrt{\\delta_{st}\\,(\\mathrm{mm})}} \\qquad \\delta_{st} = \\dfrac{g}{(2\\pi f_n)^2}</div>
<ol>
  <li>加振周波数 f (最低回転数) を求める</li>
  <li>目標の振動数比 r = 2.5〜4 から fn = f / r を決める</li>
  <li>静たわみ δst (またはばね定数 k = m (2π fn)²) から防振材を選ぶ</li>
  <li>重心とばね配置を合わせ、ロッキング (回転) モードも考える</li>
</ol>
<p>低い fn を得るには大きな静たわみが必要です (5 Hz で約 10 mm)。防振ゴムで実現できるのは概ね 5〜8 Hz 以上で、それ以下は金属ばね・空気ばねを使います。</p>
<h2>減衰を与える (制振)</h2>
<table class="tb-table">
  <tr><th>手段</th><th>減衰の目安</th><th>特徴</th></tr>
  <tr><td>溶接鋼構造そのもの</td><td>ζ ≈ 0.001〜0.01</td><td>ほとんど減衰しない</td></tr>
  <tr><td>ボルト継手が多い構造</td><td>ζ ≈ 0.02〜0.05</td><td>接触面の摩擦で減衰</td></tr>
  <tr><td>鋳鉄・ポリマーコンクリート</td><td>鋼の数倍〜10 倍</td><td>工作機械ベッドに使われる</td></tr>
  <tr><td>拘束型制振 (鋼板 + 粘弾性層 + 拘束板)</td><td>損失係数 η = 0.1〜0.3</td><td>板の曲げ振動・騒音に有効</td></tr>
  <tr><td>オイル・粘性ダンパー</td><td>大</td><td>大振幅・低周波向け</td></tr>
</table>
<p>損失係数 η と減衰比 ζ の関係は η ≈ 2ζ です。粘弾性材料は温度と周波数で特性が大きく変わるので、使用条件でのデータを確認します。</p>
<h2>動吸振器 (ダイナミックダンパー)</h2>
<p>主構造に小さな質量 ma とばね ka を付け、その固有振動数を問題の周波数に合わせると、副質量が逆位相で揺れて主構造の振動を打ち消します。</p>
<svg class="tb-chart" viewBox="0 0 520 220" role="img" aria-label="動吸振器">
<rect class="k-ground" x="60" y="196" width="200" height="10"/><line class="k-edge" x1="60" y1="196" x2="260" y2="196"/>
<path class="k-edge" d="M160,196 L160,190 L171,187.9 L149,183.6 L171,179.4 L149,175.1 L171,170.9 L149,166.6 L171,162.4 L149,158.1 L160,156 L160,150"/>
<g class="k-shadow"><rect class="k-part" x="110" y="110" width="100" height="40" rx="3"/></g>
<text class="lbl" x="160" y="135" text-anchor="middle">主質量 M</text>
<path class="k-edge" d="M142,110 L142,105 L151,103.2 L133,99.8 L151,96.2 L133,92.8 L151,89.2 L133,85.8 L151,82.2 L133,78.8 L142,77 L142,72" style="stroke:var(--tb-accent)"/>
<line class="k-edge" x1="182" y1="110" x2="182" y2="96" style="stroke:var(--tb-accent)"/>
<path class="k-edge" d="M174,82 L174,98 L190,98 L190,82" style="stroke:var(--tb-accent)"/>
<line class="k-edge" x1="182" y1="72" x2="182" y2="92" style="stroke:var(--tb-accent)"/>
<line class="k-edge" x1="176" y1="92" x2="188" y2="92" style="stroke:var(--tb-accent)"/>
<g class="k-shadow"><rect class="k-accent" x="126" y="46" width="68" height="26" rx="3"/></g>
<text class="lbl" x="160" y="64" text-anchor="middle" style="fill:#fff">ma</text>
<text class="tick" x="124" y="94" text-anchor="end">ka</text>
<text class="tick" x="196" y="90">ca</text>
<text class="tick" x="176" y="176">K</text>
<line class="k-force" x1="226" y1="150" x2="226" y2="116"/>
<text class="tick" x="232" y="140" style="fill:var(--tb-bad)">加振</text>
<rect class="k-panel" x="262" y="22" width="250" height="172" rx="8"/>
<text class="mark-t" x="276" y="52">最適同調: fa / fn = 1 / (1 + μ)</text>
<text class="mark-t" x="276" y="80">最適減衰: ζopt = √(3μ / 8(1 + μ)³)</text>
<text class="tick" x="276" y="110">μ = ma / M (質量比、0.05〜0.2 程度)</text>
<text class="tick" x="276" y="140">減衰なしでは同調点の両側に</text>
<text class="tick" x="276" y="156">新たなピークが出る</text>
<text class="k-note" x="276" y="182">主振動系 M に小さな ma・ka・ca を付加</text>
</svg>
<ul>
  <li>減衰のない動吸振器は 1 つの周波数だけに効き、前後に 2 つの新しい共振ピークができる</li>
  <li>適度な減衰を与えると (デン・ハルトッグの最適調整)、広い周波数で振幅を抑えられる</li>
  <li>主構造のモードの<b>腹</b>に取り付ける。節では効かない</li>
</ul>`,
    points: [
      "対策は加振源低減・共振回避・防振・制振の順に考える",
      "防振は r = f/fn > √2 で効き、r = 2.5〜4 が目安",
      "防振領域では減衰が大きいほど伝達率が悪化 — 共振通過とのバランス",
      "fn ≈ 15.8/√δst(mm)。低い fn には大きな静たわみが必要",
      "動吸振器は fa/fn = 1/(1+μ) に同調し、モードの腹に付ける",
    ],
    exercises: [
      {
        q: "振動数比 r = 3、減衰比 ζ = 0.05 の防振支持の伝達率を求めなさい。減衰なしの場合とも比べなさい。",
        a: "2ζr = 0.3。分子 √(1 + 0.09) ≈ 1.044、分母 √((1 − 9)² + 0.09) = √64.09 ≈ 8.006。T ≈ 1.044 / 8.006 ≈ <b>0.13 (13 %)</b>。減衰なしでは T = 1/|1 − 9| = <b>0.125 (12.5 %)</b> で、防振領域では減衰がわずかに不利に働きます。",
      },
      {
        q: "固有振動数 5 Hz の防振支持を作るには、静たわみをいくらにする必要がありますか。",
        a: "δst = g / (2π fn)² = 9.81 / (31.42)² = 9.81 / 987 ≈ 0.00994 m ≈ <b>9.9 mm</b>。防振ゴムでは難しく、金属コイルばねや空気ばねの領域です。",
      },
      {
        q: "質量 100 kg、固有振動数 30 Hz の主構造に、質量比 μ = 0.1 の動吸振器を付けます。最適同調の副質量、固有振動数、ばね定数、最適減衰比を求めなさい。",
        a: "ma = 0.1 × 100 = <b>10 kg</b>。fa = 30 / 1.1 ≈ <b>27.3 Hz</b>。ka = ma (2π fa)² = 10 × (171.4)² ≈ 10 × 29 380 ≈ <b>2.94 × 10⁵ N/m (≈ 294 N/mm)</b>。ζopt = √(3 × 0.1 / (8 × 1.1³)) = √(0.3 / 10.65) ≈ √0.0282 ≈ <b>0.17</b>。",
      },
    ],
    quiz: [
      { q: "防振領域 (r > √2) で減衰を大きくすると伝達率は?", choices: ["小さくなる", "大きくなる", "変わらない"], answer: 1, explain: "防振領域では減衰が伝達率を悪化させます。共振通過を考えて適度な値を選びます。" },
      { q: "伝達率 T = 1 となる振動数比は (減衰によらず)?", choices: ["r = 1", "r = √2", "r = 2"], answer: 1, explain: "すべての減衰比の曲線が r = √2 で T = 1 を通ります。" },
      { q: "動吸振器の取付け位置として適切なのは?", choices: ["対象モードの腹", "対象モードの節", "支持点の真上"], answer: 0, explain: "腹は振幅が最大で、副質量に効率よくエネルギーが移ります。" },
    ],
  },
  {
    id: "stiffness-vibration-practice",
    part: "mechanics",
    title: "剛性と振動の設計実務 — 目標設定から実測まで",
    minutes: 25,
    level: 3,
    lead: "剛性・振動の設計は、目標値を決め、見積もり、解析し、実測で確かめるサイクルです。固有振動数の目標の決め方、サーボ制御との関係、ハンマリング試験による実測、3DCAD Studio のモード解析の使い方とトラブル対策の進め方を学びます。",
    body: `
<h2>目標値の決め方</h2>
<table class="tb-table">
  <tr><th>根拠</th><th>目標の目安</th></tr>
  <tr><td>回転機械の加振 (回転数・羽根・歯車)</td><td>主要な加振周波数から ±20〜30 % 以上離す。剛性系では 1 次 fn を最大加振周波数の 1.5〜2 倍以上</td></tr>
  <tr><td>サーボ制御 (位置決め機構)</td><td>機構の 1 次共振を制御帯域の 3〜5 倍以上</td></tr>
  <tr><td>床振動・人の歩行</td><td>精密機器の架台は 30〜50 Hz 以上 (床の振動 5〜20 Hz を避ける)</td></tr>
  <tr><td>輸送振動</td><td>トラック輸送の主成分 (数〜数十 Hz) に部品の共振を合わせない</td></tr>
  <tr><td>位置決め後の整定</td><td>残留振動の周期 1/fn が整定時間に効く。fn が高いほど早く止まる</td></tr>
</table>
<h2>見積もりの進め方</h2>
<ol>
  <li><b>ばね-質量モデル</b>で 1 次固有振動数を概算 (fn = (1/2π)√(k/m))</li>
  <li><b>静たわみ</b>から確認: 自重たわみ δ (mm) なら fn ≈ 15.8 / √δ Hz</li>
  <li><b>FEA モード解析</b>で複数モードと形状を確認 (接合部の扱いに注意)</li>
  <li><b>試作品の実測</b>でモデルを補正し、次の設計に反映</li>
</ol>
<div class="tb-tip"><b>3DCAD Studio</b>: 「応力解析 → 固有値解析」でモード形状をアニメーション表示できます。リブ追加・肉厚変更・支持条件変更の前後で 1 次固有振動数を比べ、「質量あたりの効果」が最も大きい対策を選びましょう。拘束条件 (固定面) の選び方で結果が大きく変わる点にも注意します。</div>
<h2>剛性と質量のどちらを動かすか</h2>
<ul>
  <li>fn ∝ √(k/m) なので、剛性を 2 倍にしても fn は 1.41 倍。<b>先端の質量を減らす</b>ほうが効くことが多い (片持ちアームの先端は特に)。</li>
  <li>補強で質量も増えると相殺される。モードの<b>腹の質量を減らし、ひずみの大きい部分 (根元) を補強</b>するのが鉄則。</li>
  <li>FEA のひずみエネルギー分布を見ると、どこを補強すれば効くかがわかる。</li>
</ul>
<h2>ハンマリング試験 (打撃試験)</h2>
<svg class="tb-chart" viewBox="0 0 520 230" role="img" aria-label="ハンマリング試験と周波数応答">
<rect class="k-ground" x="24" y="184" width="200" height="10"/><line class="k-edge" x1="24" y1="184" x2="224" y2="184"/>
<g class="k-shadow"><rect class="k-part" x="30" y="166" width="188" height="18" rx="2"/><rect class="k-alu" x="50" y="118" width="136" height="48" rx="2"/><rect class="k-accent" x="138" y="104" width="16" height="14" rx="2"/></g>
<path class="k-edge" d="M154,110 C182,110 190,80 200,58" stroke-width="1.4"/>
<rect class="k-panel" x="176" y="34" width="64" height="24" rx="4"/>
<text class="tick" x="208" y="50" text-anchor="middle">FFT 解析</text>
<text class="k-note" x="118" y="146" text-anchor="middle">加速度計</text>
<line class="" x1="46" y1="50" x2="84" y2="104" style="stroke:var(--k-line)" stroke-width="7" stroke-linecap="round"/>
<line class="" x1="46" y1="50" x2="84" y2="104" style="stroke:var(--k-plastic-2)" stroke-width="4.5" stroke-linecap="round"/>
<rect class="k-part" x="72" y="98" width="34" height="14" rx="3" transform="rotate(-35 89 105)"/>
<circle class="" cx="102" cy="113" r="4.5" style="fill:var(--tb-bad)"/>
<path class="k-thin" d="M108,122 l6,-6 M100,124 l0,-8 M114,128 l8,-2" style="stroke:var(--tb-bad)"/>
<text class="tick" x="14" y="36">インパルスハンマ</text>
<line class="axis" x1="260" y1="200" x2="505" y2="200"/>
<line class="axis" x1="260" y1="200" x2="260" y2="26"/>
<g transform="translate(260,10) scale(0.96,1) translate(-250,0)"><path d="M250,170 C300,168 320,160 335,120 C340,60 345,40 350,40 C355,40 360,60 365,120 C380,165 410,172 430,150 C440,110 445,100 450,100 C455,100 460,115 470,160 L500,170" style="fill:none;stroke:var(--tb-accent)" stroke-width="2.6" vector-effect="non-scaling-stroke"/></g>
<line class="k-dimline" x1="347" y1="72" x2="365" y2="72"/>
<line class="guide" x1="356" y1="50" x2="356" y2="200"/>
<line class="guide" x1="452" y1="110" x2="452" y2="200"/>
<text class="mark-t" x="372" y="70">半値幅 Δf</text>
<text class="tick" x="356" y="216" text-anchor="middle">f₁</text>
<text class="tick" x="452" y="216" text-anchor="middle">f₂</text>
<text class="lbl" x="505" y="228" text-anchor="end">周波数</text>
<text class="lbl" x="266" y="22">応答 / 力 (FRF)</text>
</svg>
<ul>
  <li>力センサー付きハンマで叩き、加速度計で応答を測り、FFT アナライザで<b>周波数応答関数 (FRF)</b>を求める</li>
  <li>ピークの周波数が固有振動数。複数点で測ると<b>モード形状</b>もわかる</li>
  <li>減衰比は半値幅法で: ζ ≈ Δf / (2 fn) (Δf はピーク振幅の 1/√2 での幅)</li>
  <li>ハンマの先端 (チップ) が硬いほど高い周波数まで加振できる。ゴムチップは低周波向け</li>
  <li>簡易的にはスマートフォンの加速度センサーアプリや、マイクで打撃音を拾う方法でも 1 次 fn は確認できる</li>
</ul>
<h2>振動トラブルの進め方</h2>
<ol>
  <li><b>周波数を測る</b>: 振動の周波数が回転数・歯数・電源周波数・制御周期の何倍かを調べ、加振源を特定する</li>
  <li><b>共振か強制振動か</b>を見分ける: 回転数を少し変えて振幅が急変すれば共振</li>
  <li><b>対策の優先順位</b>: 加振源を減らす → 共振を離す (剛性・質量) → 減衰を与える → 防振</li>
  <li>対策後に再測定し、別の周波数に問題が移っていないか確認する</li>
</ol>`,
    points: [
      "目標 fn は加振周波数・制御帯域 (3〜5 倍)・床振動などの根拠から決める",
      "fn ≈ 15.8/√δ(mm) で静たわみから即座に概算",
      "腹の質量を減らし、ひずみの大きい根元を補強する",
      "ハンマリング試験で FRF を測り、半値幅法 ζ ≈ Δf/2fn で減衰を求める",
      "トラブルはまず周波数を測って加振源を特定する",
    ],
    exercises: [
      {
        q: "架台の自重による最大たわみが 0.1 mm でした。1 次固有振動数の概算値は? 床振動 (〜20 Hz) を避けられますか?",
        a: "fn ≈ 15.8 / √0.1 = 15.8 / 0.316 ≈ <b>50 Hz</b>。床振動の 20 Hz の 2.5 倍あり、おおむね避けられています。",
      },
      {
        q: "制御帯域 50 Hz のサーボステージで、可動部質量 20 kg の 1 次共振を 200 Hz 以上にしたい。必要な駆動系の剛性は?",
        a: "k = m (2π f)² = 20 × (2π × 200)² = 20 × (1 256.6)² ≈ 20 × 1.579 × 10⁶ ≈ <b>3.16 × 10⁷ N/m (≈ 31.6 N/µm)</b>。制御帯域の 4 倍を確保できます。",
      },
      {
        q: "ハンマリング試験で 120 Hz にピークがあり、半値幅が 3.6 Hz でした。減衰比と共振倍率 (Q 値) を求めなさい。",
        a: "ζ ≈ Δf / (2 fn) = 3.6 / 240 = <b>0.015</b>。Q ≈ 1 / (2ζ) = <b>約 33 倍</b>。溶接構造に近い低減衰で、共振させると危険なレベルです。",
      },
    ],
    quiz: [
      { q: "位置決め機構の 1 次共振周波数の目安は?", choices: ["制御帯域と同じ", "制御帯域の 3〜5 倍以上", "制御帯域の半分"], answer: 1, explain: "共振が帯域に近いと発振やゲイン不足の原因になります。" },
      { q: "片持ちアームの固有振動数を上げる効果的な方法は?", choices: ["先端に補強板を足す", "先端を軽くし、根元を補強する", "全体を均一に厚くする"], answer: 1, explain: "腹 (先端) の質量を減らし、ひずみの大きい根元を補強するのが効率的です。" },
      { q: "振動トラブルで最初にすべきことは?", choices: ["防振ゴムを入れる", "振動の周波数を測り加振源を特定する", "板厚を増やす"], answer: 1, explain: "周波数から加振源と共振の有無がわかり、適切な対策を選べます。" },
    ],
    lessons: ["7-1"],
  },
];
