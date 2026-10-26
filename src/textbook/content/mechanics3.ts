import type { TextChapter } from "../types";

export const MECHANICS3: TextChapter[] = [
  {
    id: "fatigue-design",
    part: "mechanics",
    title: "【上級】疲労設計の実践",
    minutes: 25,
    level: 3,
    lead: "疲労の基礎 (S-N 曲線と疲労限度) を踏まえ、実際の部品で避けられない平均応力の影響、表面・寸法・切欠きによる疲労限度の低下、変動荷重の累積損傷を扱い、疲労安全率を求める手順を身につけます。",
    body: `
<h2>平均応力と応力振幅</h2>
<p>繰返し応力の最大値 σmax と最小値 σmin から、<b>平均応力</b>と<b>応力振幅</b>を定義します。</p>
<div class="tb-math">\\sigma_m = \\dfrac{\\sigma_{\\max} + \\sigma_{\\min}}{2} \\qquad \\sigma_a = \\dfrac{\\sigma_{\\max} - \\sigma_{\\min}}{2} \\qquad \\text{応力比}\\ R = \\dfrac{\\sigma_{\\min}}{\\sigma_{\\max}}</div>
<p>材料試験で得られる疲労限度 σw は、ふつう両振り (σm = 0) の値です。ボルトの初期張力やばねの初期たわみのように<b>引張の平均応力</b>が加わると、耐えられる振幅は小さくなります。圧縮の平均応力は逆に有利に働きます (ショットピーニングが効く理由)。</p>
<h2>修正グッドマン線図</h2>
<p>横軸に σm、縦軸に σa をとり、(0, σw) と (σB, 0) を直線で結びます。応力の点がこの線の内側にあれば疲労破壊しないと判定します。</p>
<div class="tb-math">\\dfrac{\\sigma_a}{\\sigma_w} + \\dfrac{\\sigma_m}{\\sigma_B} = \\dfrac{1}{S} \\qquad (S:\\ \\text{疲労安全率})</div>
<svg class="tb-chart" viewBox="0 0 520 260" role="img" aria-label="修正グッドマン線図">
<path d="M60,60 L460,220 L60,220 Z" style="fill:var(--tb-good);fill-opacity:0.09"/>
<line class="grid" x1="60" y1="130" x2="480" y2="130"/>
<line class="grid" x1="270" y1="30" x2="270" y2="220"/>
<line class="axis" x1="60" y1="220" x2="490" y2="220"/>
<line class="axis" x1="60" y1="225" x2="60" y2="20"/>
<line class="" x1="60" y1="60" x2="460" y2="220" style="stroke:var(--tb-accent)" stroke-width="2.8"/>
<line class="guide" x1="60" y1="220" x2="160" y2="153"/>
<line class="" x1="60" y1="116" x2="320" y2="220" style="stroke:var(--tb-warn);stroke-dasharray:7 4" stroke-width="2"/>
<circle class="mark" cx="160" cy="153" r="4.5"/>
<text class="mark-t" x="160" y="140" text-anchor="middle">(σm, σa)</text>
<text class="tick" x="54" y="64" text-anchor="end">σw</text>
<text class="tick" x="460" y="236" text-anchor="middle">σB</text>
<text class="mark-t" x="250" y="106" style="fill:var(--tb-accent)">限界線 (S = 1)</text>
<text class="tick" x="70" y="212" style="fill:var(--tb-warn)">σw/S〜σB/S の線</text>
<text class="k-good-t" x="340" y="206">安全側</text>
<rect class="k-panel" x="330" y="14" width="180" height="104" rx="8"/>
<line class="k-center" x1="345" y1="66" x2="495" y2="66"/>
<line class="k-thin" x1="345" y1="44" x2="495" y2="44" style="stroke-dasharray:3 3"/>
<line class="k-thin" x1="345" y1="88" x2="495" y2="88" style="stroke-dasharray:3 3"/>
<path d="M345,66 L346.5,63.2 L348,60.5 L349.5,57.9 L351,55.4 L352.5,53.1 L354,50.9 L355.5,49 L357,47.4 L358.5,46.1 L360,45.1 L361.5,44.4 L363,44 L364.5,44 L366,44.4 L367.5,45.1 L369,46.1 L370.5,47.4 L372,49 L373.5,50.9 L375,53.1 L376.5,55.4 L378,57.9 L379.5,60.5 L381,63.2 L382.5,66 L384,68.8 L385.5,71.5 L387,74.1 L388.5,76.6 L390,78.9 L391.5,81.1 L393,83 L394.5,84.6 L396,85.9 L397.5,86.9 L399,87.6 L400.5,88 L402,88 L403.5,87.6 L405,86.9 L406.5,85.9 L408,84.6 L409.5,83 L411,81.1 L412.5,78.9 L414,76.6 L415.5,74.1 L417,71.5 L418.5,68.8 L420,66 L421.5,63.2 L423,60.5 L424.5,57.9 L426,55.4 L427.5,53.1 L429,50.9 L430.5,49 L432,47.4 L433.5,46.1 L435,45.1 L436.5,44.4 L438,44 L439.5,44 L441,44.4 L442.5,45.1 L444,46.1 L445.5,47.4 L447,49 L448.5,50.9 L450,53.1 L451.5,55.4 L453,57.9 L454.5,60.5 L456,63.2 L457.5,66 L459,68.8 L460.5,71.5 L462,74.1 L463.5,76.6 L465,78.9 L466.5,81.1 L468,83 L469.5,84.6 L471,85.9 L472.5,86.9 L474,87.6 L475.5,88 L477,88 L478.5,87.6 L480,86.9 L481.5,85.9 L483,84.6 L484.5,83 L486,81.1 L487.5,78.9 L489,76.6 L490.5,74.1 L492,71.5 L493.5,68.8 L495,66" style="fill:none;stroke:var(--tb-accent)" stroke-width="2"/>
<line class="k-dimline" x1="500" y1="66" x2="500" y2="44"/>
<text class="k-dimtext" x="496" y="38" text-anchor="end">σa</text>
<text class="k-note" x="340" y="30">応力の時間変化</text>
<text class="k-note" x="352" y="110">σm (平均)</text>
<text class="lbl" x="485" y="250" text-anchor="end">平均応力 σm</text>
<text class="lbl" x="66" y="16">応力振幅 σa</text>
</svg>
<p>原点と応力点を結ぶ直線 (荷重が比例して増える場合) が限界線と交わるまでの倍率が S です。降伏を避けるため、σm + σa ≤ σy (ランガー線) もあわせて確認します。</p>
<div data-widget="goodman"></div>
<h2>実部品の疲労限度を補正する</h2>
<p>試験片の疲労限度 σw0 は、磨いた小径の平滑材の値です。実部品では次の係数で補正します。</p>
<div class="tb-math">\\sigma_w = \\dfrac{\\sigma_{w0} \\times \\zeta_1 \\times \\zeta_2}{\\beta}</div><p>ζ1: 表面係数、ζ2: 寸法係数、β: 切欠き係数</p>
<table class="tb-table">
  <tr><th>係数</th><th>要因</th><th>目安</th></tr>
  <tr><td>表面係数 ζ1</td><td>研削・切削・黒皮。粗いほど低い。高強度鋼ほど影響大</td><td>研削 0.9 前後、切削 0.7〜0.9、黒皮 0.4〜0.7</td></tr>
  <tr><td>寸法係数 ζ2</td><td>大径ほど欠陥を含む確率が高い</td><td>φ10 で約 1、φ50 で 0.8 前後</td></tr>
  <tr><td>切欠き係数 β</td><td>段・穴・溝の応力集中 (形状係数 α と切欠き感度で決まる)</td><td>1.3〜3 程度</td></tr>
</table>
<p class="tb-note">係数の値は材料・資料によって幅があります。設計では使用する規格・便覧の値を使ってください。</p>
<h2>累積損傷 (マイナー則)</h2>
<p>振幅が変わる荷重では、各振幅 σi の繰返し数 ni と、その振幅での寿命 Ni の比を足し合わせます。</p>
<div class="tb-math">D = \\sum \\dfrac{n_i}{N_i} \\qquad D = 1\\ \\text{で破壊と推定}</div>
<p>実際には順序効果などでばらつくため、D ≤ 0.3〜0.5 程度を許容値にすることが多いです。疲労限度以下の振幅も、大振幅で損傷が進むと効いてくる点に注意します (修正マイナー則)。</p>
<div class="tb-tip">3DCAD Studio の応力解析では、静解析の結果から疲労安全率を表示できます。応力集中部 (フィレットや穴) のメッシュを細かくして評価してください。</div>
`,
    points: [
      "σm = (σmax+σmin)/2、σa = (σmax−σmin)/2。引張の平均応力は許容振幅を下げる",
      "修正グッドマン: σa/σw + σm/σB = 1/S。降伏 (σm+σa ≤ σy) も確認",
      "実部品の疲労限度は σw0 × ζ1 × ζ2 / β で補正する",
      "変動荷重はマイナー則 D = Σni/Ni で評価し、余裕をもたせる",
    ],
    exercises: [
      {
        q: "σB = 600 MPa、補正後の疲労限度 σw = 250 MPa の部品に σm = 150 MPa、σa = 100 MPa が加わります。修正グッドマン線図による疲労安全率は?",
        a: "1/S = 100/250 + 150/600 = 0.40 + 0.25 = 0.65 → S = <b>1.54</b>。",
      },
      {
        q: "σw0 = 280 MPa の鋼で、ζ1 = 0.85、ζ2 = 0.9、β = 1.8 のときの補正後の疲労限度は? また寿命 5×10⁵ 回の振幅で 1×10⁵ 回、寿命 1×10⁵ 回の振幅で 2×10⁴ 回使ったときの累積損傷 D は?",
        a: "σw = 280 × 0.85 × 0.9 / 1.8 = <b>119 MPa</b> (試験値の約 43%)。D = 1×10⁵/5×10⁵ + 2×10⁴/1×10⁵ = 0.2 + 0.2 = <b>0.4</b>。",
      },
    ],
    quiz: [
      { q: "引張の平均応力が大きくなると、許容できる応力振幅は?", choices: ["大きくなる", "小さくなる", "変わらない"], answer: 1, explain: "グッドマン線は右下がりで、σm が増えるほど許容 σa は減ります。" },
      { q: "切欠き係数 β の扱いとして正しいものは?", choices: ["疲労限度を β で割る", "疲労限度に β を掛ける", "引張強さを β で割る"], answer: 0, explain: "σw = σw0 ζ1 ζ2 / β と、疲労限度を下げる方向に補正します。" },
      { q: "マイナー則で D = 1 が意味するのは?", choices: ["損傷なし", "破壊と推定される", "安全率 1 の静強度"], answer: 1, explain: "Σni/Ni = 1 で寿命を使い切ったと推定します。実設計では余裕をとります。" },
    ],
    lessons: ["7-1"],
  },
  {
    id: "weld-strength",
    part: "mechanics",
    title: "【上級】溶接継手の強度",
    minutes: 20,
    level: 3,
    lead: "溶接記号で指示した継手が、どれだけの荷重に耐えるかを見積もります。突合せと隅肉の違い、のど厚による応力計算、曲げを受ける隅肉の概算、そして溶接部が疲労に弱い理由を学びます。",
    body: `
<h2>突合せ溶接と隅肉溶接</h2>
<table class="tb-table">
  <tr><th>種類</th><th>強度計算の断面</th><th>特徴</th></tr>
  <tr><td>突合せ (完全溶込み)</td><td>母材の板厚 × 溶接長</td><td>母材と同等の強度を期待できる。開先加工と検査が必要</td></tr>
  <tr><td>隅肉</td><td>のど厚 a × 溶接長 l</td><td>加工が簡単で多用される。のど断面のせん断で評価</td></tr>
</table>
<h2>のど厚とせん断応力</h2>
<p>等脚の隅肉では、脚長 s の直角二等辺三角形の高さが理論<b>のど厚</b>です。</p>
<div class="tb-math">a = s \\times \\cos 45^\\circ \\fallingdotseq 0.7\\,s \\qquad \\tau = \\dfrac{F}{a \\cdot \\Sigma l}</div>
<p>Σl は有効溶接長の合計です。始端・終端はクレーターなどで欠陥が出やすいため、実長から脚長分程度を差し引くことがあります。</p>
<svg class="tb-chart" viewBox="0 0 520 220" role="img" aria-label="隅肉溶接ののど厚">
<g class="k-shadow"><rect class="k-cut" x="60" y="150" width="400" height="26"/><rect class="k-cut2" x="240" y="40" width="25" height="110"/><path d="M240,150 L180,150 L240,90 Z" style="fill:var(--tb-warn);fill-opacity:0.55;stroke:var(--k-line)" stroke-width="1.6"/><path d="M265,150 L325,150 L265,90 Z" style="fill:var(--tb-warn);fill-opacity:0.55;stroke:var(--k-line)" stroke-width="1.6"/></g>
<line class="" x1="265" y1="150" x2="295" y2="120" style="stroke:var(--tb-bad)" stroke-width="2.4"/>
<text class="mark-t" x="340" y="92">のど厚 a = 0.7s</text>
<line class="k-thin" x1="338" y1="96" x2="286" y2="128" style="marker-end:url(#k-arrow)"/>
<text class="k-note" x="340" y="110">(のど断面のせん断で評価)</text>
<line class="k-ext" x1="265" y1="178" x2="265" y2="200"/>
<line class="k-ext" x1="325" y1="178" x2="325" y2="200"/>
<line class="k-dimline" x1="265" y1="194" x2="325" y2="194"/>
<text class="k-dimtext" x="295" y="190" text-anchor="middle">脚長 s</text>
<line class="k-ext" x1="236" y1="90" x2="152" y2="90"/>
<line class="k-ext" x1="176" y1="150" x2="152" y2="150"/>
<text class="k-dimtext" x="150" y="124" text-anchor="end">脚長 s</text>
<line class="k-dimline" x1="158" y1="90" x2="158" y2="150"/>
<line class="k-force" x1="252" y1="38" x2="252" y2="12"/>
<text class="mark-t" x="262" y="22" style="fill:var(--tb-bad)">F</text>
<text class="lbl" x="452" y="168" text-anchor="end">板 A</text>
<text class="lbl" x="232" y="60" text-anchor="end">板 B</text>
<text class="k-note" x="372" y="140">溶接ビード</text>
<line class="k-thin" x1="370" y1="137" x2="306" y2="138"/>
</svg>
<div data-widget="weld"></div>
<h2>曲げを受ける隅肉の概算</h2>
<p>板の両側を高さ h の隅肉 2 本で留め、距離 e の位置に力 F が加わる片持ちを考えます。のど断面を厚さ a の長方形とみなすと、</p>
<div class="tb-math">Z = 2 \\times \\dfrac{a h^2}{6} \\qquad \\sigma_b = \\dfrac{F e}{Z} \\qquad \\tau = \\dfrac{F}{2 a h} \\qquad \\text{合成} \\fallingdotseq \\sqrt{\\sigma_b^2 + \\tau^2}</div>
<p>合成のしかたや許容値の比較方法は基準によって異なります。ここでは概算として、曲げが支配的であることを確かめる程度に使います。</p>
<h2>許容応力の考え方</h2>
<p>許容応力は母材の強さ、溶接材料、施工・検査の等級、荷重の種類 (静的・繰返し) によって決まります。建築・クレーン・圧力容器などでは<b>それぞれの基準・規格で値と計算方法が定められている</b>ので、必ずそれに従います。一般機械の目安として、軟鋼の隅肉の静的許容せん断応力を 60〜90 MPa 程度にとる例があります。</p>
<h2>溶接部が疲労に弱い理由</h2>
<ul>
  <li>止端 (ビードと母材の境目) の形状による<b>応力集中</b></li>
  <li>ブローホール・溶込み不良・アンダーカットなどの<b>欠陥</b>が亀裂の起点になる</li>
  <li>冷却収縮による<b>引張残留応力</b>が平均応力として加わる</li>
  <li>熱影響部の組織変化</li>
</ul>
<p>そのため溶接継手の疲労強度は母材の強さにほとんど依存せず、継手の形式ごとの等級 (強度区分) で評価します。止端仕上げ、ピーニング、溶接線を高応力部から離す配置が有効です。</p>
<div class="tb-tip">3DCAD Studio の溶接 (隅肉ビード) でビードをモデル化し、応力解析で止端付近の応力集中を確認できます。フレーム ジェネレータで作った架台の接合部の検討にも使えます。</div>
`,
    points: [
      "隅肉ののど厚 a ≒ 0.7 × 脚長、応力は τ = F/(a·Σl)",
      "突合せ (完全溶込み) は母材断面で評価できる",
      "許容応力は適用する基準・規格に従う",
      "溶接部は応力集中・欠陥・残留応力のため疲労に弱い",
    ],
    exercises: [
      {
        q: "脚長 6 mm、長さ 100 mm の隅肉 2 本で 20 000 N のせん断荷重を受けます。のど厚、せん断応力、許容せん断応力 80 MPa に対する安全率は?",
        a: "a = 0.7 × 6 = <b>4.2 mm</b>。τ = 20 000 / (4.2 × 200) = <b>23.8 MPa</b>。安全率 = 80 / 23.8 = <b>3.36</b>。",
      },
      {
        q: "のど厚 4.2 mm、高さ h = 100 mm の隅肉 2 本で留めた板に、e = 200 mm の位置で F = 5 000 N。曲げ応力・せん断応力・合成応力の概算は?",
        a: "M = 5 000 × 200 = 1.0×10⁶ N·mm。Z = 2 × 4.2 × 100² / 6 = 14 000 mm³ → σb = <b>71.4 MPa</b>。τ = 5 000 / (2 × 4.2 × 100) = <b>5.95 MPa</b>。合成 √(71.4² + 5.95²) ≒ <b>71.7 MPa</b> (曲げが支配的)。",
      },
    ],
    quiz: [
      { q: "脚長 10 mm の等脚隅肉ののど厚は?", choices: ["5 mm", "7 mm", "10 mm"], answer: 1, explain: "a = 0.7 × 10 = 7 mm です。" },
      { q: "隅肉溶接の強度計算で使う断面は?", choices: ["脚長 × 溶接長", "のど厚 × 溶接長", "板厚 × 板幅"], answer: 1, explain: "最も薄い断面であるのど断面で評価します。" },
      { q: "溶接部の疲労強度について正しいのは?", choices: ["高張力鋼にすれば比例して上がる", "母材の強さにあまり依存しない", "残留応力は影響しない"], answer: 1, explain: "止端の応力集中や残留応力が支配的なため、母材強度の効果は小さいです。" },
    ],
    lessons: ["7-1"],
  },
  {
    id: "bolt-joint",
    part: "mechanics",
    title: "【上級】ボルト継手の詳細設計",
    minutes: 25,
    level: 3,
    lead: "締結の基礎で学んだ締付力を、ボルトと被締結物のばねとして扱います。締付線図から外力が加わったときのボルト荷重と分離限界を求め、摩擦で力を伝えるすべり継手と、ボルト軸で受けるせん断継手を設計します。",
    body: `
<h2>締付線図</h2>
<p>締め付けるとボルトは伸び、被締結物 (部材) は縮みます。両者をばね定数 kb (ボルト)、kc (部材) のばねとみなします。部材はボルトより断面が大きいので、ふつう kc は kb の数倍です。</p>
<svg class="tb-chart" viewBox="0 0 520 250" role="img" aria-label="締付線図">
<path d="M50,230 L250,100 L400,230 Z" style="fill:var(--tb-accent);fill-opacity:0.07"/>
<line class="axis" x1="50" y1="230" x2="490" y2="230"/>
<line class="axis" x1="50" y1="235" x2="50" y2="20"/>
<line class="" x1="50" y1="230" x2="250" y2="100" style="stroke:var(--tb-accent)" stroke-width="2.8"/>
<line class="" x1="250" y1="100" x2="400" y2="230" style="stroke:var(--tb-warn)" stroke-width="2.8"/>
<line class="" x1="250" y1="100" x2="290" y2="74" style="stroke:var(--tb-accent);stroke-dasharray:5 3" stroke-width="2.8"/>
<line class="guide" x1="250" y1="100" x2="250" y2="230"/>
<line class="guide" x1="50" y1="100" x2="250" y2="100"/>
<line class="" x1="290" y1="74" x2="290" y2="134.7" style="stroke:var(--tb-bad)" stroke-width="3"/>
<circle class="mark" cx="250" cy="100" r="4.5"/>
<circle class="mark" cx="290" cy="74" r="3.5"/>
<text class="tick" x="44" y="104" text-anchor="end">Ff</text>
<line class="k-dimline" x1="300" y1="74" x2="300" y2="100"/>
<text class="k-dimtext" x="306" y="90">ΔF = φF</text>
<line class="k-dimline" x1="300" y1="100" x2="300" y2="134.7"/>
<text class="tick" x="306" y="122">部材の圧縮減少</text>
<text class="mark-t" x="282" y="66" text-anchor="end" style="fill:var(--tb-bad)">外力 F</text>
<text class="mark-t" x="140" y="200" style="fill:var(--tb-accent)">ボルト (傾き kb)</text>
<text class="mark-t" x="340" y="160" style="fill:var(--tb-warn)">部材 (傾き kc)</text>
<rect class="k-panel" x="410" y="12" width="100" height="112" rx="8"/>
<g class="k-shadow"><rect class="k-cut" x="420" y="50" width="80" height="20"/><rect class="k-cut2" x="420" y="70" width="80" height="20"/><rect class="k-part-h" x="454" y="34" width="12" height="72"/><rect class="k-part" x="442" y="38" width="36" height="12" rx="1.5"/><rect class="k-part" x="442" y="90" width="36" height="12" rx="1.5"/></g>
<line class="k-force" x1="432" y1="48" x2="432" y2="22"/>
<line class="k-force" x1="432" y1="92" x2="432" y2="116"/>
<text class="mark-t" x="490" y="30" style="fill:var(--tb-bad)">F</text>
<text class="lbl" x="485" y="246" text-anchor="end">伸び・縮み</text>
<text class="lbl" x="56" y="18">力</text>
</svg>
<p>初期締付力 Ff の状態で軸方向の外力 F を加えると、ボルトはさらに伸び、部材の圧縮は減ります。外力のうちボルトに加わる割合が<b>内力係数 φ</b>です。</p>
<div class="tb-math">\\begin{aligned} \\phi &= \\dfrac{k_b}{k_b + k_c} \\\\ \\text{ボルト荷重}\\ F_b &= F_f + \\phi F \\\\ \\text{部材の残留締付力}\\ F_c &= F_f - (1 - \\phi)F \\\\ \\text{分離限界}\\ F_{sep} &= \\dfrac{F_f}{1 - \\phi} \\end{aligned}</div>
<p>φ が小さいほど (ボルトが柔らかく部材が硬いほど) ボルトの変動荷重は小さくなり、疲労に有利です。長く細いボルトや伸びボルトが使われる理由です。実際には荷重の作用位置による補正 (荷重導入係数) もあります。</p>
<h2>すべり継手 (摩擦接合)</h2>
<p>板どうしの摩擦で横方向の力を伝え、ボルト軸には力を受けさせない方式です。</p>
<div class="tb-math">\\text{伝達力}\\ F = \\mu \\cdot m \\cdot n \\cdot F_f</div><p>μ: 摩擦係数、m: 摩擦面の数、n: ボルト本数</p>
<table class="tb-table">
  <tr><th>接触面の状態</th><th>摩擦係数 μ の目安</th></tr>
  <tr><td>機械加工面・油分あり</td><td>0.1〜0.15</td></tr>
  <tr><td>機械加工面・脱脂</td><td>0.15〜0.2</td></tr>
  <tr><td>ブラスト処理・赤さび面 (高力ボルト摩擦接合)</td><td>0.4〜0.5</td></tr>
</table>
<p>すべり始めると穴とボルトのすきま分だけ位置がずれるため、位置決めが必要な部分ではノックピンを併用します。</p>
<h2>せん断継手</h2>
<p>リーマボルトやピンで穴と軸をはめあわせ、軸のせん断で力を受けます。</p>
<div class="tb-math">\\tau = \\dfrac{F}{n \\cdot m \\cdot \\pi d^2/4} \\qquad (m:\\ \\text{せん断面の数})</div>
<p>あわせて板の穴の面圧 (支圧) と、穴の縁までの距離 (縁端距離) も確認します。一般のボルト穴はすきまがあるため、せん断継手としては精度が出ません。</p>
<div class="tb-tip">標準部品からボルトを配置し、応力解析でブラケットの変形を確認できます。締付力を荷重として与えた静解析で、部材の接触面の圧力分布の目安をつかめます。</div>
`,
    points: [
      "内力係数 φ = kb/(kb+kc)。外力 F でボルトに加わる追加荷重は ΔF = φF",
      "分離限界 F_sep = Ff/(1−φ)。部材の残留締付力が 0 になると分離する",
      "すべり継手の伝達力は μ·m·n·Ff。位置決めはピンで",
      "せん断継手はボルト軸のせん断と穴の面圧を確認する",
    ],
    exercises: [
      {
        q: "kb = 2.0×10⁵ N/mm、kc = 8.0×10⁵ N/mm、初期締付力 Ff = 20 000 N のボルトに外力 F = 10 000 N。φ、ボルト荷重、部材の残留締付力、分離限界は?",
        a: "φ = 2/(2+8) = <b>0.2</b>。ΔF = 0.2 × 10 000 = 2 000 N → Fb = <b>22 000 N</b>。Fc = 20 000 − 0.8 × 10 000 = <b>12 000 N</b>。F_sep = 20 000 / 0.8 = <b>25 000 N</b>。",
      },
      {
        q: "μ = 0.2、摩擦面 1 面、ボルト 4 本、Ff = 20 000 N のすべり継手の伝達力は? すべりに対する安全率 1.5 での許容横荷重は? また同じ力 10 000 N を φ10 のリーマボルト 2 本 (1 面せん断) で受けるときのせん断応力は?",
        a: "F = 0.2 × 1 × 4 × 20 000 = <b>16 000 N</b>、許容 16 000/1.5 = <b>10 667 N</b>。τ = 10 000 / (2 × π × 10²/4) = <b>63.7 MPa</b>。",
      },
    ],
    quiz: [
      { q: "内力係数 φ を小さくする方法は?", choices: ["太く短いボルトにする", "細く長いボルトにする", "部材を柔らかくする"], answer: 1, explain: "kb を小さく (または kc を大きく) すると φ = kb/(kb+kc) は小さくなります。" },
      { q: "φ = 0.25、Ff = 15 000 N のときの分離限界は?", choices: ["11 250 N", "15 000 N", "20 000 N"], answer: 2, explain: "F_sep = 15 000 / (1 − 0.25) = 20 000 N です。" },
      { q: "すべり継手の伝達力に比例しないものは?", choices: ["摩擦係数", "締付力", "ボルトの引張強さ"], answer: 2, explain: "伝達力は μ·m·n·Ff です。強さは締付力の上限を決めるだけです。" },
    ],
    lessons: ["7-1"],
  },
];

export const MECHATRONICS2: TextChapter[] = [
  {
    id: "electric-basics",
    part: "mechatronics",
    title: "【初級】機械設計者のための電気の基礎",
    minutes: 20,
    level: 1,
    lead: "モーターやセンサを載せる装置では、機械設計者も電線の太さや電源の容量を考える場面があります。オームの法則から電線の選び方、電圧降下、保護と接地まで、装置設計で必要な電気の基礎をまとめます。",
    body: `
<h2>オームの法則と電力</h2>
<div class="tb-math">V = I \\times R \\qquad P = V \\times I = I^2 R = \\dfrac{V^2}{R}</div>
<p>電圧 V [V] は電気を押す力、電流 I [A] は流れの量、抵抗 R [Ω] は流れにくさです。電力 P [W] は単位時間のエネルギーで、抵抗で消費された電力は熱になります。24 V で 2 A 流れる負荷は 12 Ω、48 W です。</p>
<h2>直流と交流</h2>
<table class="tb-table">
  <tr><th></th><th>直流 (DC)</th><th>交流 (AC)</th></tr>
  <tr><td>例</td><td>DC 24 V (制御・センサ)、電池</td><td>AC 100 V / 200 V (商用電源)</td></tr>
  <tr><td>特徴</td><td>向きと大きさが一定</td><td>50 Hz (東日本) / 60 Hz (西日本) で向きが変わる。表示電圧は実効値</td></tr>
  <tr><td>装置での使い方</td><td>PLC、センサ、ソレノイド、小形モーター</td><td>電源ユニットの入力、インバータ、ヒーター</td></tr>
</table>
<p>装置ではふつう AC を電源ユニットで DC 24 V に変換して制御系に使います。交流の電力には力率が関わるため、P = V × I × 力率 となります。</p>
<h2>電線の太さと許容電流</h2>
<p>電線は流れる電流で発熱するため、太さごとに<b>許容電流</b>があります。下表は単線を空中配線したときの一般的な目安です。</p>
<table class="tb-table">
  <tr><th>断面積 (sq = mm²)</th><th>AWG (概略の対応)</th><th>許容電流の目安</th></tr>
  <tr><td>0.3</td><td>22</td><td>約 3〜5 A</td></tr>
  <tr><td>0.5</td><td>20</td><td>約 5〜7 A</td></tr>
  <tr><td>0.75</td><td>18</td><td>約 7〜10 A</td></tr>
  <tr><td>1.25</td><td>16</td><td>約 12〜15 A</td></tr>
  <tr><td>2.0</td><td>14</td><td>約 17〜20 A</td></tr>
  <tr><td>3.5</td><td>12</td><td>約 25〜30 A</td></tr>
</table>
<p class="tb-note">AWG と sq は規格が異なり、断面積は完全には一致しません (対応は概略です)。許容電流は電線の種類、周囲温度、束ねる本数、ダクト内かどうかで大きく下がります。実際の選定は電線メーカーの資料と適用規格に従ってください。</p>
<h2>電圧降下</h2>
<p>電線にも抵抗があり、長い配線では負荷に届く電圧が下がります。電流は行きと帰りの 2 本を流れるので、片道長さ L の 2 倍で計算します。</p>
<div class="tb-math">\\begin{aligned} R &= \\dfrac{\\rho L}{A} \\qquad (\\text{銅}\\ \\rho \\fallingdotseq 0.0172\\,\\mathrm{\\Omega\\cdot mm^2/m}) \\\\ \\Delta V &= 2 \\cdot I \\cdot R_1 \\cdot L \\qquad (R_1 = \\rho/A:\\ 1\\,\\mathrm{m}\\ \\text{あたりの抵抗}) \\end{aligned}</div>
<p>DC 24 V の制御回路では、電圧降下を数 % 以内に抑えるのが目安です。センサやバルブの動作電圧範囲を下回らないよう、長い配線は太くするか、電源を近くに置きます。</p>
<div data-widget="wire"></div>
<h2>ヒューズとブレーカー</h2>
<p>短絡 (ショート) や過負荷で大電流が流れると、電線が過熱して火災の原因になります。<b>ヒューズ</b>は溶けて回路を切り、<b>ブレーカー</b> (配線用遮断器) は自動で切れて再投入できます。保護の定格は<b>電線の許容電流以下</b>で、負荷の通常電流 (モーターの始動電流を含む) では切れない値を選びます。</p>
<h2>接地 (アース)</h2>
<p>金属のフレームを大地につなぎ、漏電したときに人が触れても感電しないよう電流を逃がします。漏電遮断器と組み合わせて使います。装置の架台やカバーはアース線で確実に接続し、塗装面では塗装をはがして端子を締結します。ノイズ対策の接地 (信号のシールド) とは目的が違う点にも注意します。</p>
<div class="tb-tip">3DCAD Studio のアセンブリで配線ダクトや電装ボックスの配置スペースを早い段階で確保しておくと、後から電線の曲げ半径や通し穴が足りなくなるのを防げます。</div>
`,
    points: [
      "V = IR、P = VI = I²R。抵抗で消費した電力は熱になる",
      "電線は許容電流で選ぶ (束線・温度で低下)。AWG と sq の対応は概略",
      "電圧降下は往復で ΔV = 2·I·R1·L。DC 24 V では数 % 以内が目安",
      "保護は電線の許容電流以下で選び、金属フレームは確実に接地する",
    ],
    exercises: [
      {
        q: "DC 24 V、電流 10 A の負荷を片道 10 m の銅線 1.25 mm² で配線します。片道の抵抗、電圧降下 (V と %)、電線での損失は? 2.0 mm² にすると電圧降下は?",
        a: "R = 0.0172 × 10 / 1.25 = 0.1376 Ω (往復 0.2752 Ω)。ΔV = 10 × 0.2752 = <b>2.75 V</b> (<b>11.5%</b>)。損失 = 10² × 0.2752 = <b>27.5 W</b>。2.0 mm² では ΔV = <b>1.72 V</b> (7.2%)。それでも大きいので、より太くするか電源を近づけます。",
      },
    ],
    quiz: [
      { q: "24 V で 48 W の負荷に流れる電流は?", choices: ["0.5 A", "2 A", "1 152 A"], answer: 1, explain: "I = P/V = 48/24 = 2 A です。" },
      { q: "電圧降下を計算するときの電線の長さは?", choices: ["片道の長さ", "往復 (片道の 2 倍)", "片道の半分"], answer: 1, explain: "電流は行きと帰りの両方の電線を流れます。" },
      { q: "ヒューズの定格の選び方として正しいのは?", choices: ["電線の許容電流より大きくする", "電線の許容電流以下で、通常電流では切れない値", "負荷の通常電流と同じにする"], answer: 1, explain: "電線を守るのが目的なので、許容電流以下で選び、始動電流で切れないよう余裕をとります。" },
    ],
    lessons: ["8-3"],
  },
  {
    id: "kinematics",
    part: "mechatronics",
    title: "【上級】ロボットアームと機構の運動学",
    minutes: 25,
    level: 3,
    lead: "関節の角度から先端の位置を求める順運動学と、目標位置から関節角を求める逆運動学を、2 リンクの平面アームで学びます。作業領域、ヤコビアン、特異点の考え方は、リンク機構やロボットの設計に共通します。",
    body: `
<h2>自由度</h2>
<p>物体の空間での位置と姿勢は 6 自由度 (並進 3 + 回転 3) です。平面では 3 自由度 (x, y, 回転)。回転関節や直動関節は 1 自由度で、アームの自由度は関節数で決まります。一般的な産業用ロボットは 6 軸で任意の位置・姿勢をとれます。</p>
<table class="tb-table">
  <tr><th>構成</th><th>自由度</th><th>例</th></tr>
  <tr><td>直交 (XYZ)</td><td>3 (直動 × 3)</td><td>ガントリ、3D プリンタ</td></tr>
  <tr><td>スカラ</td><td>4 (回転 3 + 直動 1)</td><td>組立・搬送</td></tr>
  <tr><td>垂直多関節</td><td>6 (回転 × 6)</td><td>溶接・塗装・ハンドリング</td></tr>
</table>
<h2>順運動学 (2 リンク平面アーム)</h2>
<p>リンク長 L1, L2、第 1 関節角 θ1 (x 軸から)、第 2 関節角 θ2 (第 1 リンクから) のとき、先端位置は</p>
<div class="tb-math">\\begin{aligned} x &= L_1 \\cos\\theta_1 + L_2 \\cos(\\theta_1 + \\theta_2) \\\\ y &= L_1 \\sin\\theta_1 + L_2 \\sin(\\theta_1 + \\theta_2) \\end{aligned}</div>
<svg class="tb-chart" viewBox="0 0 520 275" role="img" aria-label="2 リンク平面アーム">
<path d="M290,240 A210,210 0 0 0 80,30 L80,190 A50,50 0 0 1 130,240 Z" style="fill:var(--tb-accent);fill-opacity:0.08"/>
<line class="axis" x1="60" y1="240" x2="490" y2="240"/>
<line class="axis" x1="80" y1="250" x2="80" y2="20"/>
<path class="guide" d="M80,30 A210,210 0 0 1 290,240" style="fill:none"/>
<path class="guide" d="M80,190 A50,50 0 0 1 130,240" style="fill:none"/>
<path class="k-thin" d="M120,240 A40,40 0 0 0 114.6,220" style="stroke:var(--k-dim)"/>
<text class="k-dimtext" x="126" y="237">θ1</text>
<line class="k-center" x1="192.6" y1="175" x2="222" y2="158"/>
<path class="k-thin" d="M213.4,163 A24,24 0 0 0 198.8,151.8" style="stroke:var(--k-dim)"/>
<text class="k-dimtext" x="222" y="152">θ2</text>
<g class="k-shadow"><rect class="k-part" x="64" y="236" width="32" height="14" rx="2"/><line class="" x1="80" y1="240" x2="192.6" y2="175" style="stroke:var(--k-line)" stroke-width="15" stroke-linecap="round"/><line class="" x1="80" y1="240" x2="192.6" y2="175" style="stroke:var(--k-alu-2)" stroke-width="11.5" stroke-linecap="round"/><line class="" x1="192.6" y1="175" x2="213.3" y2="97.7" style="stroke:var(--k-line)" stroke-width="15" stroke-linecap="round"/><line class="" x1="192.6" y1="175" x2="213.3" y2="97.7" style="stroke:var(--k-alu-2)" stroke-width="11.5" stroke-linecap="round"/></g>
<rect class="k-ground" x="54" y="250" width="52" height="8"/><line class="k-edge" x1="54" y1="250" x2="106" y2="250"/>
<circle class="k-sphere" cx="80" cy="240" r="7"/>
<circle class="k-sphere" cx="192.6" cy="175" r="7"/>
<circle class="k-accent" cx="213.3" cy="97.7" r="6"/>
<text class="mark-t" x="150" y="222">L1</text>
<text class="mark-t" x="218" y="132">L2</text>
<text class="mark-t" x="202" y="92" text-anchor="end">(x, y)</text>
<text class="tick" x="296" y="60">作業領域の外周 r = L1 + L2</text>
<line class="k-thin" x1="300" y1="66" x2="262" y2="134" style="marker-end:url(#k-arrow)"/>
<text class="lbl" x="485" y="266" text-anchor="end">x</text>
<text class="lbl" x="86" y="28">y</text>
</svg>
<h2>逆運動学 — 肘上と肘下</h2>
<p>目標 (x, y) から関節角を求めます。余弦定理から</p>
<div class="tb-math">\\begin{aligned} \\cos\\theta_2 &= \\dfrac{x^2 + y^2 - L_1^2 - L_2^2}{2 L_1 L_2} \\\\ \\theta_2 &= \\pm \\arccos(\\cdots) \\\\ \\theta_1 &= \\operatorname{atan2}(y, x) - \\operatorname{atan2}(L_2 \\sin\\theta_2,\\ L_1 + L_2 \\cos\\theta_2) \\end{aligned}</div>
<p>θ2 の符号で 2 つの解 (<b>肘上 / 肘下</b>) があります。どちらを選ぶかは障害物や関節の可動範囲で決めます。|cos θ2| > 1 なら届かない位置です。6 軸ロボットでは解が最大 8 通りあり、数値計算で求めることもあります。</p>
<h2>作業領域</h2>
<p>2 リンクアームの先端が届く範囲は、半径 |L1 − L2| から L1 + L2 までの円環です (関節の可動範囲で欠ける)。L1 = L2 にすると根元まで届きます。外周付近では腕が伸びきって動きが不自由になるため、作業点は領域の中ほどに置きます。</p>
<h2>ヤコビアンと特異点</h2>
<p>関節速度と先端速度の関係を表す行列が<b>ヤコビアン J</b> です。</p>
<div class="tb-math">\\begin{bmatrix} \\dot x \\\\ \\dot y \\end{bmatrix} = J \\begin{bmatrix} \\dot\\theta_1 \\\\ \\dot\\theta_2 \\end{bmatrix}</div><div class="tb-math">J = \\begin{bmatrix} -L_1 \\sin\\theta_1 - L_2 \\sin(\\theta_1+\\theta_2) & -L_2 \\sin(\\theta_1+\\theta_2) \\\\ L_1 \\cos\\theta_1 + L_2 \\cos(\\theta_1+\\theta_2) & L_2 \\cos(\\theta_1+\\theta_2) \\end{bmatrix}</div><div class="tb-math">\\det J = L_1 L_2 \\sin\\theta_2</div>
<p>det J = 0 となる姿勢 (θ2 = 0°: 腕が伸びきる、θ2 = 180°: 折りたたむ) が<b>特異点</b>です。特異点ではある方向に先端を動かせず、その近くでは小さな先端速度に大きな関節速度が必要になります。軌道計画では特異点を避けます。ヤコビアンの転置は、先端の力と関節トルクの関係 (τ = Jᵀ F) も与えます。</p>
<div class="tb-tip">3DCAD Studio のアセンブリで回転拘束を駆動し、モーション解析で先端の軌跡を確認すると、計算した作業領域や干渉を目で検証できます。</div>
`,
    points: [
      "関節 1 つが 1 自由度。空間の位置と姿勢には 6 自由度が必要",
      "順運動学 x = L1cosθ1 + L2cos(θ1+θ2)、y も同様",
      "逆運動学は余弦定理で θ2 を求め、肘上/肘下の 2 解がある",
      "det J = L1L2 sinθ2 = 0 の姿勢が特異点。作業点は領域の中ほどに",
    ],
    exercises: [
      {
        q: "L1 = 300 mm、L2 = 200 mm、θ1 = 30°、θ2 = 45° のときの先端位置は? その位置に対する逆運動学のもう一方の解と、この姿勢での det J は?",
        a: "x = 300 cos30° + 200 cos75° = 259.8 + 51.8 = <b>311.6 mm</b>、y = 150 + 193.2 = <b>343.2 mm</b>。距離 √(x²+y²) = 463.5 mm (< 500 で到達可)。cos θ2 = (463.5² − 300² − 200²)/(2·300·200) = 0.707 → θ2 = ±45°。もう一方の解は θ2 = <b>−45°</b>、θ1 = atan2(343.2, 311.6) − atan2(200 sin(−45°), 300 + 200 cos(−45°)) = <b>65.5°</b>。det J = 300 × 200 × sin45° = <b>42 426 mm²</b>。",
      },
    ],
    quiz: [
      { q: "L1 = 300 mm、L2 = 200 mm の 2 リンクアームの作業領域は?", choices: ["半径 0〜500 mm", "半径 100〜500 mm", "半径 200〜300 mm"], answer: 1, explain: "|L1 − L2| = 100 から L1 + L2 = 500 までの円環です。" },
      { q: "2 リンクアームの特異点は?", choices: ["θ1 = 0°", "θ2 = 0° または 180°", "θ2 = 90°"], answer: 1, explain: "det J = L1L2 sinθ2 が 0 になるのは θ2 = 0°, 180° です。" },
      { q: "逆運動学で cos θ2 の計算値が 1.2 になった。意味するのは?", choices: ["肘下の解", "目標が作業領域の外", "特異点の内側"], answer: 1, explain: "|cos θ2| > 1 は解なし、つまり届かない位置です。" },
    ],
    lessons: ["8-3"],
  },
  {
    id: "motion-control-adv",
    part: "mechatronics",
    title: "【上級】動作パターンと振動抑制",
    minutes: 20,
    level: 3,
    lead: "速く動かしても止まったときに揺れていては作業に入れません。台形と S 字の加減速、ジャーク、残留振動と機械の固有振動数の関係を理解し、整定時間を含めたサイクルタイムを短くする考え方を学びます。",
    body: `
<h2>台形加減速と S 字加減速</h2>
<p><b>台形</b>は一定加速度で加速し、一定速度で移動し、一定減速度で止まります。計算が簡単ですが、加速度が階段状に変わるため衝撃が出ます。<b>S 字</b>は加速度をなめらかに立ち上げ、加速度の変化率 (<b>ジャーク</b> [mm/s³]) を有限にします。</p>
<svg class="tb-chart" viewBox="0 0 520 300" role="img" aria-label="台形と S 字の速度パターン">
<line class="grid" x1="60" y1="50" x2="480" y2="50"/>
<line class="axis" x1="60" y1="170" x2="490" y2="170"/>
<line class="axis" x1="60" y1="175" x2="60" y2="20"/>
<path d="M60,170 L140,50 L380,50 L460,170" style="fill:none;stroke:var(--tb-accent)" stroke-width="2.6"/>
<path d="M60,170 C110,170 120,50 170,50 L350,50 C400,50 410,170 460,170" style="fill:none;stroke:var(--tb-good);stroke-dasharray:7 4" stroke-width="2.6"/>
<text class="mark-t" x="140" y="42" text-anchor="middle" style="fill:var(--tb-accent)">台形</text>
<text class="mark-t" x="160" y="92" style="fill:var(--tb-good)">S 字 (加速度の変化がなめらか)</text>
<text class="tick" x="100" y="186" text-anchor="middle">加速 ta</text>
<text class="tick" x="420" y="186" text-anchor="middle">減速</text>
<text class="tick" x="54" y="54" text-anchor="end">vmax</text>
<text class="lbl" x="66" y="28">速度</text>
<line class="axis" x1="60" y1="245" x2="490" y2="245"/>
<line class="axis" x1="60" y1="285" x2="60" y2="200"/>
<path d="M60,245 L60,220 L140,220 L140,245 L380,245 L380,270 L460,270 L460,245" style="fill:none;stroke:var(--tb-accent)" stroke-width="2.4"/>
<path d="M60,245 L60,245 L62.8,244.8 L65.5,244.1 L68.2,243 L71,241.6 L73.8,239.7 L76.5,237.6 L79.2,235.2 L82,232.6 L84.8,229.8 L87.5,227 L90.2,224.2 L93,221.4 L95.8,218.8 L98.5,216.4 L101.2,214.3 L104,212.4 L106.8,211 L109.5,209.9 L112.2,209.2 L115,209 L117.8,209.2 L120.5,209.9 L123.2,211 L126,212.4 L128.8,214.3 L131.5,216.4 L134.2,218.8 L137,221.4 L139.8,224.2 L142.5,227 L145.2,229.8 L148,232.6 L150.8,235.2 L153.5,237.6 L156.2,239.7 L159,241.6 L161.8,243 L164.5,244.1 L167.2,244.8 L170,245 L350,245 L350,245 L352.8,245.2 L355.5,245.9 L358.2,247 L361,248.4 L363.8,250.3 L366.5,252.4 L369.2,254.8 L372,257.4 L374.8,260.2 L377.5,263 L380.2,265.8 L383,268.6 L385.8,271.2 L388.5,273.6 L391.2,275.7 L394,277.6 L396.8,279 L399.5,280.1 L402.2,280.8 L405,281 L407.8,280.8 L410.5,280.1 L413.2,279 L416,277.6 L418.8,275.7 L421.5,273.6 L424.2,271.2 L427,268.6 L429.8,265.8 L432.5,263 L435.2,260.2 L438,257.4 L440.8,254.8 L443.5,252.4 L446.2,250.3 L449,248.4 L451.8,247 L454.5,245.9 L457.2,245.2 L460,245" style="fill:none;stroke:var(--tb-good);stroke-dasharray:7 4" stroke-width="2.4"/>
<text class="lbl" x="66" y="208">加速度</text>
<text class="tick" x="196" y="230">台形: 階段状に急変 → 衝撃・残留振動</text>
<text class="tick" x="196" y="268" style="fill:var(--tb-good)">S 字: なめらか (ジャーク有限)</text>
<text class="lbl" x="485" y="296" text-anchor="end">時間</text>
</svg>
<div class="tb-math">\\text{台形の移動時間}\\ T = \\dfrac{S}{v_{\\max}} + t_a \\qquad t_a = \\dfrac{v_{\\max}}{a}</div><p>(t<sub>a</sub>: 加速時間、加減速が等しい場合)</p>
<table class="tb-table">
  <tr><th></th><th>台形</th><th>S 字</th></tr>
  <tr><td>ジャーク</td><td>加速の始まりと終わりで無限大 (理論上)</td><td>有限</td></tr>
  <tr><td>振動</td><td>出やすい</td><td>出にくい</td></tr>
  <tr><td>同じ最大加速度での移動時間</td><td>短い</td><td>やや長い</td></tr>
</table>
<h2>残留振動と固有振動数</h2>
<p>機械をばね-質量系とみると、加速度は構造を揺らす力 (m·a) になります。加速度が急に変わると、固有振動数 fn で揺れ始め、停止後も<b>残留振動</b>として残ります。</p>
<p>一定加速度を時間 ta だけ加えると、加速の始まりで生じた揺れと、加速の終わりで生じた逆向きの揺れが重なります。ta が<b>固有周期 Tn = 1/fn の整数倍</b>なら、2 つの揺れが同じ位相で打ち消し合い、残留振動は理論上ゼロになります。残留振幅は |sin(π fn ta) / (π fn ta)| に比例し、ta = k·Tn で 0 になります。</p>
<div class="tb-math">\\text{残留振動が小さい加速時間:}\\ t_a = \\dfrac{k}{f_n} \\quad (k = 1, 2, 3, \\dots)</div>
<p>例えば fn = 10 Hz の機構なら ta = 0.1 s、0.2 s が有利です。ただし固有振動数は負荷や姿勢で変わるため、この方法だけに頼らず、構造の剛性を上げて fn を高くすることが基本です。S 字加減速やフィルタ (入力整形) も同じ原理で振動を抑えます。</p>
<h2>整定時間とサイクルタイム</h2>
<p><b>整定時間</b>は、指令が終わってから位置偏差や振動が許容幅に収まるまでの時間です。実際のサイクルタイムは「移動時間 + 整定時間 + 作業時間」で、加速度を上げて移動時間を縮めても整定時間が延びれば逆効果です。</p>
<ul>
  <li>可動部を軽く、構造を高剛性にして固有振動数を上げる (減衰が速くなる)</li>
  <li>加速時間を固有周期に合わせる、S 字加減速を使う</li>
  <li>移動距離が短い場合は最高速度に達しない (三角形パターン) ので、加速度のほうが効く</li>
  <li>動作の重ね合わせ (前の動作の減速中に次の準備を始める)</li>
</ul>
<div class="tb-tip">3DCAD Studio の応力解析 (固有値) で機構の固有振動数を求め、加速時間の設定に使えます。動的応答解析で加速時の揺れを確認し、アセンブリのモーション解析で動作の重なりを検討しましょう。</div>
`,
    points: [
      "台形はジャークが大きく振動しやすい。S 字はジャークを有限にする",
      "台形の移動時間 T = S/vmax + ta",
      "加速時間を固有周期の整数倍にすると残留振動が打ち消される",
      "サイクルタイム = 移動 + 整定 + 作業。剛性を上げ fn を高くするのが基本",
    ],
    exercises: [
      {
        q: "ストローク 200 mm を最高速度 500 mm/s、加速時間 0.1 s (減速も同じ) の台形で動かします。加速度、加速中の移動距離、移動時間は? 機構の固有振動数が 10 Hz のとき、この加速時間は適切ですか?",
        a: "a = 500 / 0.1 = <b>5 000 mm/s²</b>。加速距離 = 500 × 0.1 / 2 = <b>25 mm</b> (減速も 25 mm、定速 150 mm)。T = 200/500 + 0.1 = <b>0.5 s</b>。固有周期 Tn = 1/10 = 0.1 s で、ta = Tn なので残留振動は理論上小さくなり<b>適切</b>です。",
      },
    ],
    quiz: [
      { q: "ジャークとは?", choices: ["速度の変化率", "加速度の変化率", "位置の誤差"], answer: 1, explain: "ジャークは加速度の時間微分で、単位は mm/s³ です。" },
      { q: "固有振動数 20 Hz の機構で残留振動が小さくなる加速時間は?", choices: ["0.025 s", "0.05 s", "0.075 s"], answer: 1, explain: "固有周期 1/20 = 0.05 s の整数倍が有利です。" },
      { q: "サイクルタイム短縮で加速度を上げたのに効果がなかった。原因として考えられるのは?", choices: ["整定時間が延びた", "ジャークが小さくなった", "固有振動数が上がった"], answer: 0, explain: "振動が大きくなり整定時間が延びると、移動時間の短縮が相殺されます。" },
    ],
    lessons: ["8-3"],
  },
];
