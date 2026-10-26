import type { TextChapter } from "../types";

export const MECHANICS2: TextChapter[] = [
  {
    id: "mohr",
    part: "mechanics",
    title: "組合せ応力とモールの応力円",
    minutes: 25,
    level: 3,
    lead: "実際の部品では、引張・曲げ・せん断・ねじりが同時に働きます。平面応力の状態から主応力と最大せん断応力を求め、ミーゼス相当応力で材料の強さと比べる方法を学びます。",
    body: `
<h2>平面応力の状態</h2>
<p>薄い板や部品の表面では、面に垂直な応力がほぼゼロになり、<b>σx, σy, τxy</b> の 3 成分で応力状態を表せます (<b>平面応力</b>)。同じ点でも、座標軸を回すと応力成分の値が変わります。</p>
<h2>主応力と主方向</h2>
<p>せん断応力がゼロになる向きでの垂直応力を<b>主応力</b>といいます。</p>
<div class="tb-math">\\begin{aligned} \\sigma_{1,2} &= \\dfrac{\\sigma_x + \\sigma_y}{2} \\pm \\sqrt{\\left(\\dfrac{\\sigma_x - \\sigma_y}{2}\\right)^2 + \\tau_{xy}^2} \\\\ \\text{主方向:}\\ \\tan 2\\theta &= \\dfrac{2\\tau_{xy}}{\\sigma_x - \\sigma_y} \\\\ \\text{最大せん断応力:}\\ \\tau_{\\max} &= \\sqrt{\\left(\\dfrac{\\sigma_x - \\sigma_y}{2}\\right)^2 + \\tau_{xy}^2} = \\dfrac{\\sigma_1 - \\sigma_2}{2} \\end{aligned}</div>
<h2>モールの応力円</h2>
<p>横軸に σ、縦軸に τ をとると、点 (σx, τxy) と (σy, −τxy) を結ぶ線分を直径とする円が描けます。円が横軸と交わる点が主応力、円の半径が最大せん断応力 (面内) です。円上で角度 2θ 回ることが、実際の要素を θ 回すことに対応します。</p>
<svg class="tb-chart" viewBox="0 0 520 250" role="img" aria-label="モールの応力円">
<circle class="" cx="280" cy="125" r="90" style="fill:var(--tb-accent);fill-opacity:0.07;stroke:var(--tb-accent)"/>
<line class="axis" x1="30" y1="125" x2="500" y2="125"/>
<line class="axis" x1="80" y1="235" x2="80" y2="15"/>
<line class="guide" x1="217" y1="61" x2="343" y2="189"/>
<path class="k-thin" d="M310,125 A30,30 0 0 1 301,146" style="stroke:var(--k-dim)"/>
<text class="k-dimtext" x="318" y="148">2θ</text>
<circle class="mark" cx="343" cy="189" r="4"/>
<text class="mark-t" x="350" y="205">(σx, τxy)</text>
<circle class="mark" cx="217" cy="61" r="4"/>
<text class="mark-t" x="150" y="53">(σy, −τxy)</text>
<circle class="mark" cx="370" cy="125" r="4"/>
<text class="mark-t" x="374" y="117">σ1</text>
<circle class="mark" cx="190" cy="125" r="4"/>
<text class="mark-t" x="170" y="117">σ2</text>
<line class="" x1="280" y1="125" x2="280" y2="35" style="stroke:var(--tb-bad)" stroke-width="1.8"/>
<text class="tick" x="286" y="75">R = τmax</text>
<circle class="k-edge" cx="280" cy="125" r="3" style="fill:var(--k-line)"/>
<text class="tick" x="268" y="143">C</text>
<rect class="k-part" x="424" y="40" width="52" height="52"/>
<line class="k-force" x1="477" y1="66" x2="506" y2="66"/>
<line class="k-force" x1="423" y1="66" x2="394" y2="66"/>
<line class="k-force" x1="450" y1="39" x2="450" y2="16"/>
<line class="k-force" x1="450" y1="93" x2="450" y2="114"/>
<line class="" x1="458" y1="33" x2="480" y2="33" style="stroke:var(--tb-warn);marker-end:url(#k-arrow)" stroke-width="2"/>
<line class="" x1="483" y1="48" x2="483" y2="84" style="stroke:var(--tb-warn);marker-end:url(#k-arrow)" stroke-width="2"/>
<text class="tick" x="504" y="58" text-anchor="end">σx</text>
<text class="tick" x="442" y="24" text-anchor="end">σy</text>
<text class="tick" x="484" y="26">τxy</text>
<text class="k-note" x="450" y="152" text-anchor="middle">要素の応力</text>
<text class="lbl" x="495" y="143" text-anchor="end">σ</text>
<text class="lbl" x="86" y="25">τ</text>
</svg>
<div data-widget="mohr"></div>
<h2>相当応力 (破損の判定)</h2>
<table class="tb-table">
  <tr><th>説</th><th>相当応力</th><th>主な適用</th></tr>
  <tr><td>ミーゼス (せん断ひずみエネルギー説)</td><td>σeq = √(σx² − σxσy + σy² + 3τxy²)</td><td>延性材料 (鋼・アルミ) の降伏判定で標準</td></tr>
  <tr><td>トレスカ (最大せん断応力説)</td><td>σeq = σ1 − σ3 (= 2τmax)</td><td>延性材料。ミーゼスより少し安全側</td></tr>
  <tr><td>最大主応力説</td><td>σeq = σ1</td><td>脆性材料 (鋳鉄など)</td></tr>
</table>
<p>トレスカで使う σ3 は 3 番目の主応力です。平面応力では面外の主応力 0 も含めて、最大と最小の差をとります。</p>
<h2>曲げとねじりを受ける丸軸</h2>
<p>直径 d の軸に曲げモーメント M とトルク T が加わると、表面で次の応力が生じます。</p>
<div class="tb-math">\\begin{aligned} &\\sigma = \\dfrac{32M}{\\pi d^3} \\qquad \\tau = \\dfrac{16T}{\\pi d^3} \\\\ &\\text{ミーゼス:}\\ \\sigma_{eq} = \\sqrt{\\sigma^2 + 3\\tau^2} \\qquad \\text{トレスカ:}\\ \\sigma_{eq} = \\sqrt{\\sigma^2 + 4\\tau^2} \\\\ &\\text{相当ねじりモーメント}\\ T_e = \\sqrt{M^2 + T^2} \\\\ &\\text{相当曲げモーメント}\\ M_e = \\dfrac{M + \\sqrt{M^2 + T^2}}{2} \\end{aligned}</div>
<p>Te はトレスカ (最大せん断応力説) による τmax = 16Te/(πd³)、Me は最大主応力説による σ1 = 32Me/(πd³) に対応し、軸径の手計算で使われます。</p>
<div class="tb-tip"><b>3DCAD Studio</b>: 応力解析の結果はミーゼス応力と主応力を切り替えて表示できます。延性材料はミーゼス、鋳物など脆性材料は最大主応力で見るのが基本です。</div>`,
    points: ["主応力はせん断応力ゼロの向きの垂直応力", "モールの円: 中心 (σx+σy)/2、半径 τmax", "延性材料はミーゼス (またはトレスカ) 相当応力で判定", "曲げ+ねじり軸は σ = 32M/πd³, τ = 16T/πd³ を合成"],
    exercises: [
      {
        q: "σx = 80 MPa、σy = 20 MPa、τxy = 30 MPa のとき、主応力・面内最大せん断応力・主方向・ミーゼス相当応力を求めてください。",
        a: "中心 (80+20)/2 = 50、半径 √(30² + 30²) = 42.4。σ1 = <b>92.4 MPa</b>、σ2 = <b>7.6 MPa</b>、τmax = <b>42.4 MPa</b>。tan 2θ = 60/60 = 1 → θ = <b>22.5°</b>。ミーゼス √(6400 − 1600 + 400 + 2700) = √7900 = <b>88.9 MPa</b>。",
      },
      {
        q: "直径 40 mm の軸に M = 200 N·m、T = 150 N·m が加わります。σ、τ、ミーゼス相当応力、相当ねじり・曲げモーメントを求めてください。",
        a: "πd³ = 201 062 mm³。σ = 32 × 200 000 / 201 062 = <b>31.8 MPa</b>、τ = 16 × 150 000 / 201 062 = <b>11.9 MPa</b>。σeq = √(31.8² + 3 × 11.9²) = <b>38.0 MPa</b>。Te = √(200² + 150²) = <b>250 N·m</b>、Me = (200 + 250)/2 = <b>225 N·m</b>。",
      },
    ],
    quiz: [
      { q: "モールの応力円の半径が表すのは?", choices: ["最大主応力", "面内の最大せん断応力", "ミーゼス応力"], answer: 1, explain: "半径 = √(((σx−σy)/2)² + τxy²) = τmax です。" },
      { q: "純せん断 (σx = σy = 0, τxy = τ) の主応力は?", choices: ["±τ", "±2τ", "0 と τ"], answer: 0, explain: "中心 0、半径 τ の円なので σ1 = τ、σ2 = −τ です。" },
      { q: "鋼の軸の降伏判定に通常使う相当応力は?", choices: ["最大主応力", "ミーゼス相当応力", "平均応力"], answer: 1, explain: "延性材料はせん断で降伏するため、ミーゼス (またはトレスカ) を使います。" },
    ],
    lessons: ["7-1"],
  },
  {
    id: "pressure",
    part: "mechanics",
    title: "薄肉円筒・球の圧力容器",
    minutes: 20,
    level: 2,
    lead: "タンク・配管・シリンダーは内圧で膨らもうとします。薄肉円筒と球の応力式を使い、必要な板厚やふたにかかる力を見積もります。",
    body: `
<h2>薄肉円筒の応力</h2>
<p>内径 D、板厚 t の円筒に内圧 p がかかると、周方向 (フープ) と軸方向に引張応力が生じます。半分に切った自由体図で力のつり合いを考えると導けます。</p>
<div class="tb-math">\\text{周方向応力}\\ \\sigma_\\theta = \\dfrac{pD}{2t} \\qquad \\text{軸方向応力}\\ \\sigma_z = \\dfrac{pD}{4t} \\qquad \\text{球:}\\ \\sigma = \\dfrac{pD}{4t}</div>
<p>周方向は軸方向の 2 倍です。そのため円筒容器は<b>軸方向に沿って割れる</b> (縦割れ) ことが多く、同じ容量・圧力なら球は円筒の半分の板厚で済みます。</p>
<svg class="tb-chart" viewBox="0 0 520 220" role="img" aria-label="円筒の周方向応力">
<g class="k-shadow"><path class="k-part" d="M60,60 L300,60 A16,40 0 0 1 300,140 L60,140 A16,40 0 0 1 60,60 Z"/></g>
<ellipse class="k-thin" cx="300" cy="100" rx="16" ry="40"/>
<rect class="" x="162" y="86" width="28" height="28" style="fill:var(--tb-surface);stroke:var(--k-line)"/>
<line class="k-force" x1="176" y1="85" x2="176" y2="56"/>
<line class="k-force" x1="176" y1="115" x2="176" y2="144"/>
<line class="k-force" x1="191" y1="100" x2="222" y2="100" style="stroke:var(--tb-accent);marker-end:url(#k-arrow-blue)"/>
<line class="k-force" x1="161" y1="100" x2="130" y2="100" style="stroke:var(--tb-accent);marker-end:url(#k-arrow-blue)"/>
<text class="mark-t" x="186" y="40">σθ = pD/2t (周方向)</text>
<line class="k-thin" x1="184" y1="44" x2="180" y2="58"/>
<text class="mark-t" x="228" y="104" style="fill:var(--tb-accent)">σz = pD/4t</text>
<text class="lbl" x="60" y="170">内径 D・板厚 t</text>
<text class="k-note" x="60" y="188">周方向は軸方向の 2 倍 → 軸に沿って縦割れしやすい</text>
<path class="k-cut" fill-rule="evenodd" d="M410,40 A62,62 0 1 1 409.9,40 Z M410,50 A52,52 0 1 0 410.1,50 Z"/>
<line class="k-force" x1="422.9" y1="107.4" x2="450.7" y2="118.8" stroke-width="1.8"/><line class="k-force" x1="415.4" y1="114.9" x2="426.8" y2="142.7" stroke-width="1.8"/><line class="k-force" x1="404.6" y1="114.9" x2="393.2" y2="142.7" stroke-width="1.8"/><line class="k-force" x1="397.1" y1="107.4" x2="369.3" y2="118.8" stroke-width="1.8"/><line class="k-force" x1="397.1" y1="96.6" x2="369.3" y2="85.2" stroke-width="1.8"/><line class="k-force" x1="404.6" y1="89.1" x2="393.2" y2="61.3" stroke-width="1.8"/><line class="k-force" x1="415.4" y1="89.1" x2="426.8" y2="61.3" stroke-width="1.8"/><line class="k-force" x1="422.9" y1="96.6" x2="450.7" y2="85.2" stroke-width="1.8"/>
<text class="tick" x="352" y="40" text-anchor="end">内圧 p</text>
<line class="k-thin" x1="354" y1="44" x2="384" y2="70"/>
<line class="k-dimline" x1="358" y1="182" x2="462" y2="182"/><text class="k-dimtext" x="410" y="177" text-anchor="middle">D</text>
<line class="k-ext" x1="358" y1="102" x2="358" y2="186"/>
<line class="k-ext" x1="462" y1="102" x2="462" y2="186"/>
<text class="k-dimtext" x="484" y="52">t</text>
<line class="k-thin" x1="482" y1="54" x2="462" y2="62"/>
</svg>
<h2>薄肉とみなせる条件</h2>
<p>板厚方向の応力分布を一様とみなすため、目安として <b>t/D &lt; 1/10 程度</b>で使います。厚肉になると内面の応力が大きくなるので、厚肉円筒の式 (ラメの式) や解析で確認します。</p>
<h2>必要板厚とふたの力</h2>
<div class="tb-math">\\begin{aligned} \\text{必要板厚}\\ t &= \\dfrac{pD}{2\\sigma_a} \\qquad (\\sigma_a = \\text{降伏点} / \\text{安全率}) \\\\ \\text{ふたにかかる力}\\ F &= p \\times \\dfrac{\\pi D^2}{4} \\end{aligned}</div>
<p>直径 500 mm のふたに 1 MPa かかると F = 196 350 N (約 20 トン重) にもなります。ボルトはこの力に初期締付力の余裕を加えて選びます。</p>
<div data-widget="pressure"></div>
<table class="tb-table">
  <tr><th>形状</th><th>最大応力</th><th>備考</th></tr>
  <tr><td>円筒 (胴)</td><td>pD/(2t)</td><td>周方向が支配的</td></tr>
  <tr><td>球</td><td>pD/(4t)</td><td>全方向同じ</td></tr>
  <tr><td>平板のふた</td><td>曲げで大きい</td><td>鏡板 (皿形・半球) にすると薄くできる</td></tr>
</table>
<div class="tb-note">圧力容器・ボイラー・高圧ガス設備は、圧力容器構造規格や高圧ガス保安法などの法規・規格で材料、許容応力、溶接継手効率、検査が定められています。本章の式は概算用で、実際の設計は該当する法規・規格に従ってください。</div>
<div class="tb-tip"><b>3DCAD Studio</b>: 応力解析で内面に圧力荷重をかけると、ノズル付け根や鏡板のつなぎ目など式では扱えない応力集中を確認できます。</div>`,
    points: ["周方向応力 pD/2t は軸方向 pD/4t の 2 倍", "球は円筒の半分の応力", "薄肉の式は t/D < 1/10 程度で使う", "ふたの力 p·πD²/4 は想像以上に大きい。法規に従う"],
    exercises: [
      {
        q: "内径 500 mm、板厚 5 mm の円筒に内圧 1 MPa。周方向・軸方向応力と、降伏点 245 MPa の材料に対する安全率は?",
        a: "σθ = 1 × 500 / (2 × 5) = <b>50 MPa</b>、σz = 500/20 = <b>25 MPa</b>。安全率 = 245 / 50 = <b>4.9</b>。",
      },
      {
        q: "同じ条件 (p = 1 MPa、D = 500 mm、降伏点 245 MPa) で安全率 2 にするための最小板厚は?",
        a: "σa = 245/2 = 122.5 MPa。t = 1 × 500 / (2 × 122.5) = <b>2.04 mm</b> (実際は腐れ代や継手効率、規格の最小厚さを加える)。",
      },
    ],
    quiz: [
      { q: "円筒容器の周方向応力と軸方向応力の比は?", choices: ["1 : 1", "2 : 1", "1 : 2"], answer: 1, explain: "σθ = pD/2t、σz = pD/4t なので 2 : 1 です。" },
      { q: "直径 200 mm のふたに 0.5 MPa がかかるときの力は約?", choices: ["1 570 N", "15 700 N", "157 000 N"], answer: 1, explain: "0.5 × π × 200²/4 = 15 708 N です。" },
      { q: "薄肉の式を使える目安は?", choices: ["t/D < 1/10 程度", "t/D > 1/2", "板厚によらず常に使える"], answer: 0, explain: "厚肉では内面の応力が大きくなり、薄肉の式は危険側になります。" },
    ],
    lessons: ["7-1"],
  },
  {
    id: "indeterminate",
    part: "mechanics",
    title: "不静定はり",
    minutes: 20,
    level: 3,
    lead: "支点が多く、つり合い式だけでは反力が決まらない構造を不静定構造といいます。両端固定はりなど代表的な公式と、変形の条件を使った解き方を学びます。",
    body: `
<h2>静定と不静定</h2>
<p>平面のはりでは、つり合い式は 3 つです。未知の反力が 3 つ以下なら<b>静定</b>、それより多いと<b>不静定</b>で、余った数を<b>不静定次数</b>といいます。不静定では「支点でたわみ・たわみ角がゼロ」という<b>変形の条件</b>を追加して解きます。</p>
<h2>代表的な公式</h2>
<table class="tb-table">
  <tr><th>支持・荷重</th><th>最大曲げモーメント</th><th>最大たわみ</th></tr>
  <tr><td>単純支持・中央集中 P (比較)</td><td>PL/4 (中央)</td><td>PL³/(48EI)</td></tr>
  <tr><td>両端固定・中央集中 P</td><td>PL/8 (端部と中央)</td><td>PL³/(192EI)</td></tr>
  <tr><td>両端固定・等分布 w</td><td>端部 wL²/12、中央 wL²/24</td><td>wL⁴/(384EI)</td></tr>
  <tr><td>一端固定他端支持・等分布 w</td><td>固定端 wL²/8</td><td>約 wL⁴/(185EI)</td></tr>
  <tr><td>一端固定他端支持・中央集中 P</td><td>固定端 3PL/16</td><td>約 PL³/(107EI)</td></tr>
</table>
<p>両端固定にすると、単純支持と比べて最大モーメントは半分、たわみは 1/4 になります。</p>
<svg class="tb-chart" viewBox="0 0 520 250" role="img" aria-label="両端固定はりの曲げモーメント図">
<rect class="k-ground" x="46" y="30" width="14" height="62"/><line class="k-edge" x1="60" y1="30" x2="60" y2="92"/>
<rect class="k-ground" x="460" y="30" width="14" height="62"/><line class="k-edge" x1="460" y1="30" x2="460" y2="92"/>
<path class="k-hidden" d="M60,68 C140,68 180,86 260,86 C340,86 380,68 460,68" style="stroke:var(--tb-accent)"/>
<g class="k-shadow"><rect class="k-part-h" x="60" y="54" width="400" height="14"/></g>
<line class="k-force" x1="260" y1="12" x2="260" y2="51"/>
<text class="mark-t" x="270" y="26" style="fill:var(--tb-bad)">P</text>
<text class="k-note" x="268" y="106">たわみ (誇張)</text>
<line class="guide" x1="160" y1="92" x2="160" y2="200"/>
<line class="guide" x1="360" y1="92" x2="360" y2="200"/>
<path d="M60,170 L60,135 L64,136.4 L68,137.8 L72,139.2 L76,140.6 L80,142 L84,143.4 L88,144.8 L92,146.2 L96,147.6 L100,149 L104,150.4 L108,151.8 L112,153.2 L116,154.6 L120,156 L124,157.4 L128,158.8 L132,160.2 L136,161.6 L140,163 L144,164.4 L148,165.8 L152,167.2 L156,168.6 L160,170 L160,170 Z" style="fill:var(--tb-bad);fill-opacity:0.18"/>
<path d="M360,170 L360,170 L364,168.6 L368,167.2 L372,165.8 L376,164.4 L380,163 L384,161.6 L388,160.2 L392,158.8 L396,157.4 L400,156 L404,154.6 L408,153.2 L412,151.8 L416,150.4 L420,149 L424,147.6 L428,146.2 L432,144.8 L436,143.4 L440,142 L444,140.6 L448,139.2 L452,137.8 L456,136.4 L460,135 L460,170 Z" style="fill:var(--tb-bad);fill-opacity:0.18"/>
<path d="M160,170 L160,170 L164,171.4 L168,172.8 L172,174.2 L176,175.6 L180,177 L184,178.4 L188,179.8 L192,181.2 L196,182.6 L200,184 L204,185.4 L208,186.8 L212,188.2 L216,189.6 L220,191 L224,192.4 L228,193.8 L232,195.2 L236,196.6 L240,198 L244,199.4 L248,200.8 L252,202.2 L256,203.6 L260,205 L264,203.6 L268,202.2 L272,200.8 L276,199.4 L280,198 L284,196.6 L288,195.2 L292,193.8 L296,192.4 L300,191 L304,189.6 L308,188.2 L312,186.8 L316,185.4 L320,184 L324,182.6 L328,181.2 L332,179.8 L336,178.4 L340,177 L344,175.6 L348,174.2 L352,172.8 L356,171.4 L360,170 L360,170 Z" style="fill:var(--tb-accent);fill-opacity:0.18"/>
<path d="M60,135 L64,136.4 L68,137.8 L72,139.2 L76,140.6 L80,142 L84,143.4 L88,144.8 L92,146.2 L96,147.6 L100,149 L104,150.4 L108,151.8 L112,153.2 L116,154.6 L120,156 L124,157.4 L128,158.8 L132,160.2 L136,161.6 L140,163 L144,164.4 L148,165.8 L152,167.2 L156,168.6 L160,170 L164,171.4 L168,172.8 L172,174.2 L176,175.6 L180,177 L184,178.4 L188,179.8 L192,181.2 L196,182.6 L200,184 L204,185.4 L208,186.8 L212,188.2 L216,189.6 L220,191 L224,192.4 L228,193.8 L232,195.2 L236,196.6 L240,198 L244,199.4 L248,200.8 L252,202.2 L256,203.6 L260,205 L264,203.6 L268,202.2 L272,200.8 L276,199.4 L280,198 L284,196.6 L288,195.2 L292,193.8 L296,192.4 L300,191 L304,189.6 L308,188.2 L312,186.8 L316,185.4 L320,184 L324,182.6 L328,181.2 L332,179.8 L336,178.4 L340,177 L344,175.6 L348,174.2 L352,172.8 L356,171.4 L360,170 L364,168.6 L368,167.2 L372,165.8 L376,164.4 L380,163 L384,161.6 L388,160.2 L392,158.8 L396,157.4 L400,156 L404,154.6 L408,153.2 L412,151.8 L416,150.4 L420,149 L424,147.6 L428,146.2 L432,144.8 L436,143.4 L440,142 L444,140.6 L448,139.2 L452,137.8 L456,136.4 L460,135" style="fill:none;stroke:var(--tb-accent)" stroke-width="2.4"/>
<line class="axis" x1="60" y1="170" x2="460" y2="170"/>
<text class="mark-t" x="64" y="128">−PL/8</text>
<text class="mark-t" x="456" y="128" text-anchor="end">−PL/8</text>
<text class="mark-t" x="260" y="224" text-anchor="middle">+PL/8</text>
<text class="tick" x="160" y="214" text-anchor="middle">M = 0 (L/4)</text>
<text class="tick" x="360" y="214" text-anchor="middle">M = 0</text>
<text class="lbl" x="260" y="244" text-anchor="middle">曲げモーメント図 (中央集中荷重)</text>
</svg>
<h2>重ね合わせの原理で解く</h2>
<p>線形弾性の範囲では、複数の荷重による変形は個々の荷重による変形の和です。一端固定他端支持はり (等分布) なら、支点を外した片持ちはりのたわみ wL⁴/(8EI) を、先端の反力 R によるたわみ RL³/(3EI) で打ち消す条件から <b>R = 3wL/8</b> が求まります。</p>
<h2>不静定の利点と注意</h2>
<ul>
  <li><b>利点</b>: 剛性が高く、たわみと応力が小さい。1 つの支点が壊れても荷重を分担できる (冗長性)</li>
  <li><b>熱応力</b>: 両端を拘束すると温度変化で伸び縮みできず、大きな応力が出る (σ = Eα ΔT)</li>
  <li><b>組立誤差</b>: 支点の高さのずれや穴位置の誤差が、そのまま内力・反力になる</li>
  <li>実際の「固定」は完全ではないため、固定と単純支持の中間の挙動になることが多い</li>
</ul>
<div class="tb-tip"><b>3DCAD Studio</b>: 不静定構造では応力解析の反力のつり合い検算で荷重の配分を確認しましょう。温度変化があるなら熱伝導・熱応力解析も行います。</div>`,
    points: ["未知反力がつり合い式より多いと不静定", "変形の条件 (たわみ・たわみ角 = 0) を追加して解く", "両端固定・中央集中: Mmax = PL/8、δ = PL³/192EI", "剛性は高いが熱応力・組立誤差に注意"],
    exercises: [
      {
        q: "L = 1000 mm、E = 206 000 MPa、I = 1.0 × 10⁵ mm⁴ のはりの中央に P = 1000 N。両端固定と単純支持の最大たわみと最大モーメントを比べてください。",
        a: "両端固定: δ = 1000 × 1000³ / (192 × 206 000 × 10⁵) = <b>0.253 mm</b>、M = PL/8 = <b>125 000 N·mm</b>。単純支持: δ = PL³/48EI = <b>1.01 mm</b>、M = PL/4 = <b>250 000 N·mm</b>。たわみは 1/4、モーメントは 1/2。",
      },
    ],
    quiz: [
      { q: "両端固定はり (等分布) の最大曲げモーメントの位置は?", choices: ["中央", "固定端", "1/4 点"], answer: 1, explain: "端部 wL²/12 が中央 wL²/24 の 2 倍で最大です。" },
      { q: "不静定構造で温度が上がると?", choices: ["応力は生じない", "拘束により熱応力が生じる", "必ず座屈する"], answer: 1, explain: "伸びが拘束されるため熱応力が生じます。" },
      { q: "一端固定他端支持はり (等分布 w) の支持端反力は?", choices: ["wL/2", "3wL/8", "5wL/8"], answer: 1, explain: "変形の条件から R = 3wL/8、固定端側は 5wL/8 です。" },
    ],
    lessons: ["7-1"],
  },
  {
    id: "impact",
    part: "mechanics",
    title: "衝撃荷重とエネルギー",
    minutes: 20,
    level: 3,
    lead: "物が落ちてきたり、急に荷重がかかったりすると、静かに載せたときより何倍も大きな力が生じます。エネルギーの考え方で衝撃荷重を見積もります。",
    body: `
<h2>ひずみエネルギー</h2>
<p>弾性体を変形させた仕事は、ひずみエネルギーとして蓄えられます。軸力 F を受ける棒 (長さ L、断面積 A) では次の式です。</p>
<div class="tb-math">U = \\dfrac{F \\times \\delta}{2} = \\dfrac{F^2 L}{2AE}</div>
<h2>急に加わる荷重</h2>
<p>荷重 W を高さゼロから急に (手を離して) 載せると、最大変形は静的たわみの <b>2 倍</b>になり、応力も 2 倍になります。</p>
<h2>落下物による衝撃</h2>
<p>重さ W が高さ h から落ちて弾性体に当たるとき、位置エネルギーとひずみエネルギーのつり合い W(h + δ) = kδ²/2 から次が得られます。</p>
<div class="tb-math">\\begin{aligned} &\\text{衝撃係数}\\ n = 1 + \\sqrt{1 + \\dfrac{2h}{\\delta_{st}}} \\\\ &\\text{最大たわみ}\\ \\delta = n \\times \\delta_{st} \\qquad \\text{最大荷重}\\ F = n \\times W \\end{aligned}</div><p>(δ<sub>st</sub> = W/k: 静的たわみ)</p>
<p>h = 0 で n = 2 になります。<b>δst が大きい (柔らかい) ほど n は小さく</b>なります。</p>
<svg class="tb-chart" viewBox="0 0 520 220" role="img" aria-label="衝撃係数とh/δst">
<line class="grid" x1="50" y1="114" x2="500" y2="114"/>
<line class="grid" x1="50" y1="34" x2="500" y2="34"/>
<line class="axis" x1="50" y1="190" x2="500" y2="190"/>
<line class="axis" x1="50" y1="190" x2="50" y2="15"/>
<path d="M50,178 L54.5,172.1 L59,168.1 L68,162 L77,157.2 L95,149.3 L117.5,141.5 L140,134.8 L185,123.5 L230,114 L275,105.6 L320,98 L365,91 L410,84.5 L455,78.4 L500,72.6" style="fill:none;stroke:var(--tb-accent)" stroke-width="2.8"/>
<circle class="mark" cx="50" cy="178" r="4"/>
<text class="tick" x="70" y="177">h = 0 でも n = 2</text>
<text class="tick" x="44" y="182" text-anchor="end">2</text>
<text class="tick" x="44" y="118" text-anchor="end">10</text>
<text class="tick" x="44" y="38" text-anchor="end">20</text>
<text class="tick" x="95" y="205" text-anchor="middle">10</text>
<text class="tick" x="230" y="205" text-anchor="middle">40</text>
<text class="tick" x="500" y="205" text-anchor="middle">100</text>
<g class="k-shadow"><rect class="k-part" x="334" y="122" width="40" height="18" rx="2"/></g>
<text class="tick" x="354" y="135" text-anchor="middle">W</text>
<path class="k-edge" d="M354,158 L354,161 L345,162 L363,164 L345,166 L363,168 L345,170 L363,172 L345,174 L363,176 L354,177 L354,180"/>
<rect class="k-part" x="338" y="154" width="32" height="5" rx="1"/>
<rect class="k-ground" x="320" y="180" width="70" height="8"/><line class="k-edge" x1="320" y1="180" x2="390" y2="180"/>
<line class="k-move" x1="354" y1="141" x2="354" y2="152" style="stroke-dasharray:3 2"/>
<line class="k-dimline" x1="396" y1="140" x2="396" y2="155"/>
<line class="k-ext" x1="376" y1="140" x2="400" y2="140"/>
<line class="k-ext" x1="372" y1="155" x2="400" y2="155"/>
<text class="k-dimtext" x="404" y="151">h</text>
<text class="tick" x="404" y="176">δst = W / k</text>
<text class="lbl" x="440" y="207" text-anchor="end">h / δst</text>
<text class="lbl" x="56" y="14">衝撃係数 n</text>
</svg>
<h2>緩衝材の考え方</h2>
<ul>
  <li>同じエネルギーでも、長い距離で受け止めれば力は小さい (F ≈ エネルギー / 変形量)</li>
  <li>ゴム・ばね・ショックアブソーバで δst を大きくすると衝撃係数が下がる</li>
  <li>部材を太くすると剛性が上がって n が増えるため、応力が思ったほど下がらないことがある。<b>体積を増やしてエネルギーを分散</b>させるのが効く</li>
  <li>切欠きなど局所に変形が集中すると、エネルギーがそこに集まり壊れやすい</li>
</ul>
<div class="tb-note">この式は質量のエネルギー損失や部材の質量を無視した簡易モデルで、通常は安全側の目安になります。</div>
<div class="tb-tip"><b>3DCAD Studio</b>: 動的応答解析を使うと、時間とともに変わる荷重への応答を計算できます。概算の衝撃係数と比べて妥当性を確認しましょう。</div>`,
    points: ["急に載せた荷重は静的の 2 倍", "衝撃係数 n = 1 + √(1 + 2h/δst)", "柔らかく受けるほど衝撃荷重は小さい", "U = F²L/(2AE): 体積が大きいほどエネルギーを蓄えられる"],
    exercises: [
      {
        q: "W = 100 N の物が h = 50 mm から台に落ちます。静かに載せたときの台のたわみ δst = 0.5 mm。衝撃係数、最大たわみ、最大荷重は?",
        a: "n = 1 + √(1 + 2 × 50 / 0.5) = 1 + √201 = <b>15.2</b>。δ = 15.2 × 0.5 = <b>7.6 mm</b>、F = 15.2 × 100 = <b>1 518 N</b>。",
      },
      {
        q: "長さ 1000 mm、断面積 100 mm² の鋼棒 (E = 206 000 MPa) に F = 10 000 N の引張。蓄えられるひずみエネルギーは?",
        a: "U = 10 000² × 1000 / (2 × 100 × 206 000) = <b>2 427 N·mm (約 2.4 J)</b>。",
      },
    ],
    quiz: [
      { q: "荷重を高さゼロから急に加えたときの応力は静的の何倍?", choices: ["1 倍", "2 倍", "4 倍"], answer: 1, explain: "h = 0 で n = 1 + √1 = 2 です。" },
      { q: "衝撃荷重を小さくするには?", choices: ["受ける側を硬くする", "受ける側を柔らかくして変形量を大きくする", "落下高さを上げる"], answer: 1, explain: "δst を大きくすると衝撃係数が下がります。" },
      { q: "ひずみエネルギー U = F²L/(2AE) で、F が 2 倍になると U は?", choices: ["2 倍", "4 倍", "変わらない"], answer: 1, explain: "F の 2 乗に比例します。" },
    ],
    lessons: ["7-1"],
  },
  {
    id: "contact",
    part: "mechanics",
    title: "接触応力とすべり",
    minutes: 20,
    level: 3,
    lead: "玉軸受・歯車・カムなど、曲面同士が触れ合う部分では小さな面積に力が集中し、非常に高い応力が生じます。ヘルツの接触応力と摩擦・摩耗の基本を学びます。",
    body: `
<h2>ヘルツの接触応力</h2>
<p>球や円筒が接触すると、弾性変形で小さな接触面ができ、その中央で圧力が最大になります。これを<b>ヘルツの接触応力</b>といいます。荷重に比例せず、<b>荷重の 1/3 乗</b>で増えるのが特徴です。</p>
<p>球 (半径 R) と平面:</p><div class="tb-math">\\begin{aligned} a &= \\left(\\dfrac{3FR}{4E^*}\\right)^{1/3} \\qquad p_{\\max} = \\dfrac{3F}{2\\pi a^2} \\\\ \\dfrac{1}{E^*} &= \\dfrac{1 - \\nu_1^2}{E_1} + \\dfrac{1 - \\nu_2^2}{E_2} \\quad (\\text{等価ヤング率}) \\end{aligned}</div>
<p>最大せん断応力は表面ではなく、表面から少し内部 (球と平面では約 0.5a の深さ) に生じます。転がり軸受や歯車のはく離 (ピッチング) が内部から始まるのはこのためです。</p>
<div class="tb-note">ヘルツの式は弾性・摩擦なし・接触面が小さいなどの前提があります。軸受や歯車の面圧・寿命の詳細は、専門書と JIS・ISO などの規格、メーカーのカタログの計算方法を参照してください。</div>
<h2>摩擦係数の目安</h2>
<table class="tb-table">
  <tr><th>組合せ</th><th>乾燥</th><th>潤滑</th></tr>
  <tr><td>鋼 − 鋼</td><td>約 0.5〜0.8</td><td>約 0.05〜0.15</td></tr>
  <tr><td>鋼 − 青銅</td><td>約 0.2〜0.4</td><td>約 0.05〜0.1</td></tr>
  <tr><td>鋼 − PTFE</td><td>約 0.05〜0.2</td><td>—</td></tr>
  <tr><td>ゴム − 乾いた路面</td><td>約 0.6〜1.0</td><td>—</td></tr>
  <tr><td>転がり軸受 (参考)</td><td colspan="2">約 0.001〜0.005</td></tr>
</table>
<p>上の値は一般的な目安で、特定の出典に基づくものではありません。表面粗さ・面圧・速度・温度で大きく変わるため、重要な設計では試験やメーカー資料で確認してください。</p>
<h2>摩耗とかじり</h2>
<ul>
  <li><b>凝着摩耗・かじり</b>: 同種金属 (特にステンレス同士・アルミ同士) が無潤滑で高面圧のすべりをすると、表面が溶着してむしれる。異種材料の組合せ、表面処理、潤滑で防ぐ</li>
  <li><b>アブレシブ摩耗</b>: 硬い粒子や硬い相手面で削られる。異物の侵入を防ぐ</li>
  <li><b>フレッティング</b>: はめあい面などの微小な往復すべりで生じ、疲労き裂の起点になる</li>
</ul>
<h2>面圧の許容値</h2>
<p>平らなすべり面では、平均面圧 p = F / (投影面積) で評価します。すべり軸受では面圧 p とすべり速度 v の積 <b>pv 値</b>も制限されます。許容値は材料・潤滑条件で大きく異なるため、軸受メーカーのカタログ値を使います。</p>
<div class="tb-tip"><b>3DCAD Studio</b>: 接触部の局所応力は粗いメッシュでは過小評価されがちです。応力解析のメッシュ収束確認やサブモデル詳細解析で細かく評価しましょう。</div>`,
    points: ["曲面同士の接触は面積が小さく応力が非常に高い", "ヘルツ応力は荷重の 1/3 乗に比例、最大せん断は内部に生じる", "摩擦係数は条件で大きく変わる目安値", "同種金属の無潤滑すべりはかじりやすい"],
    exercises: [
      {
        q: "半径 10 mm の鋼球を鋼の平面に F = 100 N で押し付けます (E = 206 000 MPa、ν = 0.3)。接触円の半径 a と最大接触圧力 pmax を求めてください。",
        a: "1/E* = 2 × (1 − 0.09)/206 000 → E* = 113 187 MPa。a = (3 × 100 × 10 / (4 × 113 187))^(1/3) = (0.006 63)^(1/3) = <b>0.188 mm</b>。pmax = 3 × 100 / (2π × 0.188²) = <b>約 1 350 MPa</b>。わずか 100 N でも降伏点を超えるほど高く、軸受鋼のような硬い材料が必要な理由がわかります。",
      },
    ],
    quiz: [
      { q: "ヘルツ接触で荷重を 8 倍にすると最大接触圧力は?", choices: ["2 倍", "4 倍", "8 倍"], answer: 0, explain: "pmax は F^(1/3) に比例するので 8^(1/3) = 2 倍です。" },
      { q: "転がり接触で最大せん断応力が生じる位置は?", choices: ["表面", "表面から少し内部", "接触円の外周"], answer: 1, explain: "内部に生じるため、はく離は内部の疲労から始まります。" },
      { q: "かじりが起きやすい組合せは?", choices: ["ステンレス同士を無潤滑ですべらせる", "鋼と青銅を潤滑してすべらせる", "鋼と PTFE"], answer: 0, explain: "同種金属・無潤滑・高面圧は凝着しやすい条件です。" },
    ],
    lessons: ["7-1"],
  },
  {
    id: "fem",
    part: "mechanics",
    title: "有限要素法の仕組み",
    minutes: 25,
    level: 3,
    lead: "CAD の応力解析の中で動いているのが有限要素法 (FEM) です。ばね 2 つの手計算で [K]{u} = {F} の考え方をつかみ、要素の種類やメッシュ、線形解析の前提を理解します。",
    body: `
<h2>要素と節点</h2>
<p>FEM は形状を小さな<b>要素</b>に分け、要素の角などの<b>節点</b>の変位を未知数として解きます。各要素の「力と変位の関係」(<b>要素剛性マトリクス</b>) を組み立てて全体の連立方程式にします。</p>
<div class="tb-math">[K]\\{u\\} = \\{F\\}</div><p>[K]: 全体剛性マトリクス、{u}: 節点変位、{F}: 節点力</p>
<h2>ばね要素 2 つの手計算</h2>
<svg class="tb-chart" viewBox="0 0 520 140" role="img" aria-label="ばね要素 2 つのモデル">
<rect class="k-ground" x="26" y="30" width="14" height="70"/><line class="k-edge" x1="40" y1="30" x2="40" y2="100"/>
<path class="k-edge" d="M40,65 L62,65 L66.8,77 L76.4,53 L86,77 L95.6,53 L105.2,77 L114.8,53 L124.4,77 L134,53 L143.6,77 L153.2,53 L158,65 L180,65" style="stroke:var(--tb-accent)" stroke-width="2.4"/>
<path class="k-edge" d="M190,65 L212,65 L217.3,77 L227.9,53 L238.5,77 L249.1,53 L259.7,77 L270.3,53 L280.9,77 L291.5,53 L302.1,77 L312.7,53 L318,65 L340,65" style="stroke:var(--tb-accent)" stroke-width="2.4"/>
<circle class="k-sphere" cx="40" cy="65" r="7"/>
<circle class="k-sphere" cx="185" cy="65" r="7"/>
<circle class="k-sphere" cx="345" cy="65" r="7"/>
<line class="k-force" x1="353" y1="65" x2="420" y2="65"/>
<text class="mark-t" x="426" y="70">F = 600 N</text>
<circle class="k-badge" cx="110" cy="30" r="10" style="fill:var(--tb-accent)"/><text class="k-badge-t" x="110" y="34" text-anchor="middle">1</text>
<text class="lbl" x="126" y="34">k1</text>
<circle class="k-badge" cx="265" cy="30" r="10" style="fill:var(--tb-accent)"/><text class="k-badge-t" x="265" y="34" text-anchor="middle">2</text>
<text class="lbl" x="281" y="34">k2</text>
<line class="k-move" x1="185" y1="92" x2="215" y2="92"/>
<text class="tick" x="185" y="108" text-anchor="middle">u2</text>
<line class="k-move" x1="345" y1="92" x2="375" y2="92"/>
<text class="tick" x="345" y="108" text-anchor="middle">u3</text>
<text class="tick" x="40" y="128" text-anchor="middle">節点1 (固定)</text>
<text class="tick" x="185" y="128" text-anchor="middle">節点2</text>
<text class="tick" x="345" y="128" text-anchor="middle">節点3</text>
</svg>
<p>ばね要素 1 つの剛性マトリクスは k[[1, −1], [−1, 1]] です。k1 = 1000 N/mm、k2 = 2000 N/mm を重ねると次のようになります。</p>
<pre class="tb-pre">| k1    −k1      0  | |u1|   |R1|
| −k1  k1+k2   −k2  | |u2| = | 0|
| 0    −k2      k2  | |u3|   |600|</pre>
<p>節点 1 を固定 (u1 = 0、境界条件) して 1 行目と 1 列目を除くと、</p>
<pre class="tb-pre">| 3000  −2000 | |u2|   |  0|
| −2000  2000 | |u3| = |600|</pre>
<p>これを解くと <b>u2 = 0.6 mm、u3 = 0.9 mm</b>、反力 R1 = −k1 × u2 = −600 N (外力とつり合う) です。境界条件がないと [K] は特異 (逆行列なし) で解けません。拘束不足で「解析が解けない」エラーになるのはこのためです。</p>
<h2>形状関数</h2>
<p>要素内部の変位は、節点変位を<b>形状関数</b>で補間して表します。1 次要素は直線 (要素内でひずみ一定)、2 次要素 (中間節点つき) は曲線で補間でき、曲げや応力集中を少ない要素数で精度よく表せます。</p>
<h2>要素の種類</h2>
<table class="tb-table">
  <tr><th>要素</th><th>用途</th><th>注意</th></tr>
  <tr><td>四面体 (テトラ)</td><td>複雑な形状の自動メッシュ</td><td>1 次四面体は硬すぎる。2 次を使う</td></tr>
  <tr><td>六面体 (ヘキサ)</td><td>単純形状で高精度・少ない要素数</td><td>複雑形状では作りにくい</td></tr>
  <tr><td>シェル</td><td>板金・薄肉部品</td><td>板厚は属性で与える</td></tr>
  <tr><td>はり</td><td>フレーム・トラス</td><td>断面性能を与える。局所応力は出ない</td></tr>
</table>
<h2>メッシュの細かさと精度</h2>
<p>メッシュを細かくすると解は真の値に近づきますが、計算時間が増えます。応力集中部だけを細かくし、メッシュを変えても結果がほぼ変わらない (<b>収束</b>) ことを確認します。鋭い角 (R なし) の応力はメッシュを細かくするほど増え続け収束しない (特異点) ので、評価に使いません。</p>
<h2>線形静解析の前提と非線形</h2>
<ul>
  <li><b>線形静解析</b>: 小変形、線形弾性 (σ = Eε)、荷重はゆっくり一定、接触状態は変わらない</li>
  <li><b>材料非線形</b>: 降伏後の塑性、ゴムなど (弾塑性解析)</li>
  <li><b>幾何非線形</b>: 大変形・大回転、座屈後の挙動</li>
  <li><b>接触非線形</b>: 部品同士が離れたり触れたりする</li>
</ul>
<p>線形解析で降伏点を超える応力が出ても「実際にその応力になる」わけではありません。前提が崩れていることを示すので、弾塑性解析などで確認します。</p>
<div class="tb-tip"><b>3DCAD Studio</b>: 応力解析でメッシュ収束確認と反力のつり合い検算を行い、結果は PDF レポートにまとめましょう。降伏を超える場合は弾塑性解析、細部はサブモデル詳細解析が使えます。</div>`,
    points: ["FEM は [K]{u} = {F} を節点変位について解く", "境界条件がないと剛性マトリクスは特異で解けない", "四面体は 2 次要素、薄板はシェル、フレームははり", "メッシュ収束を確認し、線形解析の前提を守る"],
    exercises: [
      {
        q: "本文のばねモデルで k1 = 1000 N/mm、k2 = 2000 N/mm、節点 3 に 600 N。各節点の変位と各ばねの力を求めてください。",
        a: "直列なので両ばねとも力は <b>600 N</b>。u2 = 600/1000 = <b>0.6 mm</b>、u3 = 0.6 + 600/2000 = <b>0.9 mm</b>。マトリクスで解いても 3000u2 − 2000u3 = 0、−2000u2 + 2000u3 = 600 から同じ値になる。",
      },
    ],
    quiz: [
      { q: "拘束条件を与えずに静解析すると?", choices: ["正しく解ける", "剛体移動が残り解けない", "変位がゼロになる"], answer: 1, explain: "[K] が特異になり、解が一意に決まりません。" },
      { q: "鋭い角 (R なし) の応力をメッシュを細かくして評価すると?", choices: ["一定値に収束する", "増え続け収束しない", "ゼロになる"], answer: 1, explain: "応力特異点なので評価に使いません。" },
      { q: "板金部品の解析に適した要素は?", choices: ["シェル要素", "はり要素", "1 次四面体"], answer: 0, explain: "薄肉はシェル要素が効率的です。" },
    ],
    lessons: ["7-1"],
  },
  {
    id: "estimation",
    part: "mechanics",
    title: "単位・概算・有効数字",
    minutes: 15,
    level: 2,
    lead: "強度計算の間違いの多くは、式ではなく単位の換算や桁のずれで起きます。SI 単位の扱い、概算で桁を確かめる方法、有効数字と計算書の書き方を身につけます。",
    body: `
<h2>SI 単位と接頭語</h2>
<table class="tb-table">
  <tr><th>接頭語</th><th>記号</th><th>倍率</th><th>例</th></tr>
  <tr><td>ギガ</td><td>G</td><td>10⁹</td><td>ヤング率 206 GPa</td></tr>
  <tr><td>メガ</td><td>M</td><td>10⁶</td><td>応力 MPa</td></tr>
  <tr><td>キロ</td><td>k</td><td>10³</td><td>荷重 kN</td></tr>
  <tr><td>ミリ</td><td>m</td><td>10⁻³</td><td>寸法 mm</td></tr>
  <tr><td>マイクロ</td><td>μ</td><td>10⁻⁶</td><td>ひずみ με、粗さ μm</td></tr>
</table>
<h2>機械設計でよく使う換算</h2>
<div class="tb-math">\\begin{aligned} &1\\,\\mathrm{MPa} = 1\\,\\mathrm{N/mm^2} = 10^6\\,\\mathrm{Pa} \\qquad 1\\,\\mathrm{GPa} = 1000\\,\\mathrm{MPa} \\\\ &1\\,\\mathrm{N\\cdot m} = 1000\\,\\mathrm{N\\cdot mm} \\qquad 1\\,\\mathrm{J} = 1\\,\\mathrm{N\\cdot m} = 1000\\,\\mathrm{N\\cdot mm} \\\\ &1\\,\\mathrm{kgf} = 9.81\\,\\mathrm{N}\\ (9.80665\\,\\mathrm{N}) \\qquad 1\\,\\mathrm{kgf/mm^2} \\approx 9.81\\,\\mathrm{MPa} \\end{aligned}</div>
<p><b>mm・N・MPa</b> で統一すると、応力 = N/mm² = MPa がそのまま出てきて間違いが減ります。この場合、密度は t/mm³ (鋼 7.85 × 10⁻⁹) を使う必要があり、質量の計算で混乱しやすいので注意します。</p>
<h2>kg と N、kgf の違い</h2>
<p>kg は質量、N は力です。質量 m [kg] の重さは <b>m × 9.81 N</b>。古い図面や資料にある kgf (重量キログラム) は力の単位で、1 kgf = 9.81 N です。「荷重 100 kg」とあれば 981 N に換算します。</p>
<h2>オーダー見積もり</h2>
<p>詳細計算の前に、桁だけを大まかに見積もります (フェルミ推定的な設計の概算)。結果が概算と 10 倍違えば、どこかに間違いがあります。</p>
<ul>
  <li>鋼 1 リットル (100 mm 角 × 100 mm) ≈ 8 kg ≈ 80 N</li>
  <li>鋼の降伏点 ≈ 200〜400 MPa → 10 mm² で 2〜4 kN</li>
  <li>M10 ボルトの有効断面積 ≈ 58 mm² → 強度区分 8.8 で 1 本あたり十数 kN まで</li>
  <li>人が押す力 ≈ 数百 N、人の体重 ≈ 700〜1000 N</li>
</ul>
<h2>有効数字</h2>
<p>荷重や材料値は 2〜3 桁程度の精度しかないことが多く、計算結果も <b>3 桁程度</b>で示せば十分です。途中計算は桁を多めに残し、最後に丸めます。「安全率 2.0371」のような表示は精度を誤解させます。</p>
<h2>計算書の書き方</h2>
<ol>
  <li><b>前提</b>: 対象、荷重条件、材料と物性値 (出典)、仮定 (支持条件など)</li>
  <li><b>式</b>: 使う式と出典</li>
  <li><b>数値</b>: 代入した値を単位付きで書く</li>
  <li><b>結果</b>: 単位付き、有効数字に注意</li>
  <li><b>判定</b>: 許容値・安全率と比べて OK / NG を明記</li>
</ol>
<div class="tb-tip"><b>3DCAD Studio</b>: 応力解析の結果は PDF レポートで出力できます。手計算の計算書と並べ、反力のつり合い検算で荷重の単位ミスがないか確認しましょう。</div>`,
    points: ["mm・N・MPa で統一すると応力が直接 MPa で出る", "質量 kg × 9.81 = 重さ N、1 kgf = 9.81 N", "概算で桁を確認してから詳細計算", "計算書は前提・式・数値・結果・判定の順"],
    exercises: [
      {
        q: "1000 × 500 × 10 mm の鋼板 (密度 7.85 × 10⁻⁶ kg/mm³) の質量と重さは?",
        a: "体積 = 5 × 10⁶ mm³。質量 = 5 × 10⁶ × 7.85 × 10⁻⁶ = <b>39.3 kg</b>。重さ = 39.25 × 9.81 = <b>385 N</b>。",
      },
      {
        q: "旧資料の許容応力 12 kgf/mm² を MPa に換算してください。",
        a: "12 × 9.81 = 117.7 → <b>約 118 MPa</b>。",
      },
    ],
    quiz: [
      { q: "1 MPa と等しいのは?", choices: ["1 N/m²", "1 N/mm²", "1 kN/mm²"], answer: 1, explain: "1 MPa = 10⁶ N/m² = 1 N/mm² です。" },
      { q: "250 N·m を N·mm で表すと?", choices: ["2 500 N·mm", "25 000 N·mm", "250 000 N·mm"], answer: 2, explain: "1 N·m = 1000 N·mm です。" },
      { q: "荷重 50 kg (質量) は何 N?", choices: ["約 50 N", "約 490 N", "約 5 000 N"], answer: 1, explain: "50 × 9.81 = 490.5 N です。" },
    ],
    lessons: ["7-1"],
  },
];
