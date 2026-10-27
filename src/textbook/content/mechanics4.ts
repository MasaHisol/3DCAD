import type { TextChapter } from "../types";

// Part 5 (mechanics): advanced structural mechanics and dynamics — energy methods,
// frames, curved beams / thick cylinders, plates, plasticity, fracture,
// Lagrangian mechanics and rigid-body dynamics.

export const MECHANICS4: TextChapter[] = [
  // ------------------------------------------------------------------ 1
  {
    id: "energy-methods",
    part: "mechanics",
    title: "エネルギー法 — ひずみエネルギーとカスティリアノの定理",
    minutes: 25,
    level: 3,
    lead: "部材に蓄えられるひずみエネルギーを使うと、曲がった部材や荷重が複雑な構造でも、たわみの微分方程式を解かずに変位を求められます。この章では、軸力・曲げ・ねじりのひずみエネルギーを導き、カスティリアノの第 2 定理と単位荷重法で片持ちはりと 1/4 円の曲がりブラケットのたわみを計算します。",
    body: `
<h2>ひずみエネルギー — 外力の仕事が部材に蓄えられる</h2>
<p>線形弾性体に荷重 <span class="tb-m">F</span> をゆっくり加えると、荷重点の変位 <span class="tb-m">\\delta</span> は荷重に比例して増えます。外力がした仕事は荷重–変位線図の三角形の面積で、それがそのまま部材内部に<b>ひずみエネルギー</b> <span class="tb-m">U</span> として蓄えられます (除荷すれば戻る、ばねのエネルギーと同じ)。</p>
<div class="tb-math">U = W = \\int_0^{\\delta} F\\,d\\delta = \\dfrac{1}{2}F\\delta \\qquad (\\text{線形弾性})</div>
<p>単位体積あたりでは、単軸応力で <span class="tb-m">u = \\sigma\\varepsilon/2 = \\sigma^2/(2E)</span>、せん断で <span class="tb-m">u = \\tau^2/(2G)</span> です。これを部材の断面と長さで積分すると、棒・はり・軸の 3 つの基本形が得られます。</p>

<svg class="tb-chart" viewBox="0 0 520 250" role="img" aria-label="荷重変位線図の三角形面積がひずみエネルギー。軸力・曲げ・ねじりの3つの変形">
<text class="k-title" x="260" y="20" text-anchor="middle">外力の仕事 = ひずみエネルギー</text>
<line class="axis" x1="40" y1="200" x2="200" y2="200"/><line class="axis" x1="40" y1="200" x2="40" y2="50"/>
<path d="M40,200 L170,80 L170,200 Z" style="fill:var(--tb-accent)" opacity="0.18"/>
<line x1="40" y1="200" x2="180" y2="71" style="stroke:var(--tb-accent)" stroke-width="2.2"/>
<line class="k-hidden" x1="170" y1="80" x2="40" y2="80"/>
<text class="lbl" x="34" y="84" text-anchor="end">F</text><text class="lbl" x="170" y="216" text-anchor="middle">δ</text>
<text class="mark-t" x="128" y="176" text-anchor="middle">U = Fδ/2</text>
<text class="tick" x="120" y="232" text-anchor="middle">変位 →</text><text class="tick" x="44" y="46">荷重</text>
<rect class="k-panel" x="226" y="36" width="284" height="196" rx="8"/>
<rect class="k-ground" x="238" y="56" width="8" height="40"/><line class="k-edge" x1="246" y1="56" x2="246" y2="96"/>
<rect class="k-part-h" x="246" y="70" width="150" height="12" rx="1"/>
<line class="k-force" x1="398" y1="76" x2="440" y2="76"/>
<text class="lbl" x="452" y="80">軸力 N</text>
<rect class="k-ground" x="238" y="118" width="8" height="40"/><line class="k-edge" x1="246" y1="118" x2="246" y2="158"/>
<path class="k-part-h" d="M246,132 Q330,134 396,146 L396,158 Q330,146 246,144 Z"/>
<line class="k-force" x1="392" y1="122" x2="392" y2="144"/>
<text class="lbl" x="452" y="146">曲げ M</text>
<rect class="k-ground" x="238" y="176" width="8" height="44"/><line class="k-edge" x1="246" y1="176" x2="246" y2="220"/>
<rect class="k-part-h" x="246" y="190" width="150" height="16" rx="2"/>
<line class="k-thin" x1="280" y1="190" x2="300" y2="206"/><line class="k-thin" x1="320" y1="190" x2="340" y2="206"/><line class="k-thin" x1="360" y1="190" x2="380" y2="206"/>
<path class="k-force" d="M404,184 A14,14 0 0 1 404,212" stroke-width="2"/>
<text class="lbl" x="452" y="202">ねじり T</text>
</svg>
<p class="tb-caption">図: 線形弾性なら仕事は三角形の面積。軸力・曲げ・ねじりのそれぞれでエネルギーの式が決まる</p>

<div class="tb-math">\\begin{aligned}
U_{\\text{軸}} &amp;= \\int_0^L \\dfrac{N^2}{2EA}\\,dx \\qquad
U_{\\text{曲げ}} = \\int_0^L \\dfrac{M^2}{2EI}\\,dx \\\\
U_{\\text{ねじり}} &amp; = \\int_0^L \\dfrac{T^2}{2GJ}\\,dx
\\end{aligned}</div>
<p>曲げの式は、曲げ応力 <span class="tb-m">\\sigma = My/I</span> を <span class="tb-m">u = \\sigma^2/2E</span> に入れて断面で積分すれば出ます: <span class="tb-m">\\int_A \\dfrac{M^2y^2}{2EI^2}\\,dA = \\dfrac{M^2}{2EI}</span>。せん断力によるエネルギー <span class="tb-m">\\int \\kappa V^2/(2GA)\\,dx</span> (長方形断面で <span class="tb-m">\\kappa = 6/5</span>) もありますが、細長いはり (長さ/高さ ≳ 5) では曲げに比べて数 % 以下なので、通常は省きます。</p>

<h2>カスティリアノの第 2 定理</h2>
<p>複数の荷重 <span class="tb-m">F_1, F_2, \\dots</span> が作用する線形弾性体で、ひずみエネルギーを荷重の関数 <span class="tb-m">U(F_1, F_2, \\dots)</span> として表すと、<b>荷重 <span class="tb-m">F_i</span> の作用点の、<span class="tb-m">F_i</span> 方向の変位</b>は</p>
<div class="tb-math">\\delta_i = \\dfrac{\\partial U}{\\partial F_i} \\qquad \\theta_i = \\dfrac{\\partial U}{\\partial M_i}\\ (\\text{モーメントに対しては回転角})</div>
<p><b>導出の筋道</b>: すべての荷重を加えた後に <span class="tb-m">F_i</span> だけを <span class="tb-m">dF_i</span> 増やすと、エネルギーは <span class="tb-m">(\\partial U/\\partial F_i)\\,dF_i</span> 増えます。逆に、先に <span class="tb-m">dF_i</span> を加えてから全荷重を加えると、<span class="tb-m">dF_i</span> は全荷重による変位 <span class="tb-m">\\delta_i</span> の間ずっと作用しているので、余分な仕事は <span class="tb-m">dF_i\\,\\delta_i</span> (2 次の微小量を除く)。線形弾性体のエネルギーは載荷順序によらないので両者は等しく、<span class="tb-m">\\delta_i = \\partial U/\\partial F_i</span> が得られます。</p>
<p>実際の計算では、積分の前に偏微分すると楽です。</p>
<div class="tb-math">\\delta_i = \\int_0^L \\dfrac{M}{EI}\\dfrac{\\partial M}{\\partial F_i}\\,dx + \\int_0^L \\dfrac{N}{EA}\\dfrac{\\partial N}{\\partial F_i}\\,dx + \\int_0^L \\dfrac{T}{GJ}\\dfrac{\\partial T}{\\partial F_i}\\,dx</div>
<p>荷重が作用していない点の変位が欲しいときは、そこに<b>仮想荷重</b> <span class="tb-m">Q</span> を置いて微分し、最後に <span class="tb-m">Q = 0</span> とします。</p>

<h2>単位荷重法 — 同じ計算を「単位荷重のモーメント」で書く</h2>
<p>仮想荷重 <span class="tb-m">Q</span> による曲げモーメントは <span class="tb-m">M = M_0 + Q\\,m</span> の形になります (<span class="tb-m">M_0</span>: 実荷重によるモーメント、<span class="tb-m">m</span>: 求めたい点・方向に<b>大きさ 1 の荷重</b>を置いたときのモーメント)。<span class="tb-m">\\partial M/\\partial Q = m</span> なので</p>
<div class="tb-math">\\delta = \\int_0^L \\dfrac{M_0\\,m}{EI}\\,dx \\qquad (\\text{回転角なら単位モーメントの } m \\text{ を使う})</div>
<p>これが<b>単位荷重法</b> (仮想仕事の原理による変位の式) です。トラスなら <span class="tb-m">\\delta = \\sum N_0 n L/(EA)</span> と、部材ごとの和になります。</p>

<h2>例 1 — 片持ちはりの先端たわみ</h2>
<p>長さ <span class="tb-m">L</span> の片持ちはりの先端に荷重 <span class="tb-m">F</span>。先端から <span class="tb-m">x</span> の断面で <span class="tb-m">M = -Fx</span>、<span class="tb-m">\\partial M/\\partial F = -x</span> です。</p>
<div class="tb-math">\\begin{aligned}
\\delta &amp;= \\int_0^L \\dfrac{(-Fx)(-x)}{EI}\\,dx = \\dfrac{FL^3}{3EI} \\\\
\\theta &amp;= \\int_0^L \\dfrac{(-Fx)(-1)}{EI}\\,dx = \\dfrac{FL^2}{2EI}
\\end{aligned}</div>
<p>回転角は先端に仮想モーメント <span class="tb-m">M_Q</span> を置き、<span class="tb-m">\\partial M/\\partial M_Q = -1</span> として求めました。微分方程式を 2 回積分して境界条件を入れる方法と同じ結果が、1 回の積分で出ます。</p>
<div class="tb-note"><b>計算例</b>: 鋼 (E = 206 GPa) の角棒 b × h = 20 × 30 mm、L = 400 mm、F = 500 N。I = 20 × 30³/12 = 45 000 mm⁴。<br>
δ = 500 × 400³ / (3 × 206 000 × 45 000) = <b>1.15 mm</b>、θ = 500 × 400² / (2 × 206 000 × 45 000) = 4.31 × 10⁻³ rad (0.25°)。<br>
せん断の寄与は κFL/(GA) = 1.2 × 500 × 400 / (79 000 × 600) ≈ 0.005 mm で、曲げの約 0.4 % にすぎません。</div>

<h2>例 2 — 1/4 円の曲がりブラケット</h2>
<p>半径 <span class="tb-m">R</span> の 1/4 円弧で、上端を固定し、下端 (自由端) に鉛直荷重 <span class="tb-m">P</span> がかかる丸棒ブラケットです。曲率半径が断面寸法より十分大きければ (R/h ≳ 5)、直線はりのエネルギー式をそのまま弧長 <span class="tb-m">ds = R\\,d\\phi</span> に沿って使えます。</p>

<svg class="tb-chart" viewBox="0 0 520 290" role="img" aria-label="上端を固定した1/4円の曲がりブラケット。自由端に鉛直荷重P、仮想水平荷重Q、角度φ">
<text class="k-title" x="260" y="20" text-anchor="middle">1/4 円ブラケット (自由端に P、水平変位用の仮想荷重 Q)</text>
<rect class="k-ground" x="165" y="26" width="10" height="38"/><line class="k-edge" x1="175" y1="26" x2="175" y2="64"/>
<path d="M175,44 A150,150 0 0 1 325,194" style="fill:none;stroke:var(--k-line);stroke-width:13;stroke-linecap:butt" opacity="0.85"/>
<path d="M175,44 A150,150 0 0 1 325,194" style="fill:none;stroke:var(--k-steel-1, #cfd6de);stroke-width:9" opacity="0.9"/>
<circle cx="175" cy="194" r="3" style="fill:var(--k-dim)"/><text class="tick" x="166" y="210">O</text>
<line class="k-center" x1="175" y1="194" x2="175" y2="44"/><line class="k-center" x1="175" y1="194" x2="335" y2="194"/>
<line class="k-thin" x1="175" y1="194" x2="281" y2="88"/>
<path class="k-edge" d="M215,194 A40,40 0 0 0 203,166" stroke-width="1.2"/>
<text class="lbl" x="222" y="180">φ</text>
<text class="lbl" x="228" y="136" text-anchor="middle">R</text>
<circle cx="281" cy="88" r="3.5" style="fill:var(--tb-accent)"/>
<text class="tick" x="290" y="82">断面 (角度 φ)</text>
<line class="k-force" x1="325" y1="200" x2="325" y2="240"/><text class="lbl" x="334" y="234">P</text>
<line class="k-move" x1="331" y1="194" x2="380" y2="194"/><text class="lbl" x="386" y="198">Q (仮想)</text>
<line class="k-hidden" x1="281" y1="88" x2="281" y2="194"/>
<line class="k-dimline" x1="281" y1="254" x2="325" y2="254"/><line class="k-ext" x1="281" y1="194" x2="281" y2="260"/><line class="k-ext" x1="325" y1="246" x2="325" y2="260"/>
<text class="k-dimtext" x="303" y="270" text-anchor="middle">R(1−cosφ)</text>
<text class="k-note" x="40" y="284">P の腕 = R(1−cosφ)、Q の腕 = R sinφ (φ は自由端から測る)</text>
</svg>
<p class="tb-caption">図: 自由端から角度 φ の断面のモーメントの腕。腕を図から正しく読むことが計算のすべて</p>

<p>中心 O から見て自由端の位置を角度 0 とし、角度 <span class="tb-m">\\phi</span> の断面を考えます。その断面と荷重作用線との水平距離は <span class="tb-m">R(1-\\cos\\phi)</span>、仮想水平荷重 <span class="tb-m">Q</span> の作用線との鉛直距離は <span class="tb-m">R\\sin\\phi</span> です。</p>
<div class="tb-math">\\begin{aligned}
M &amp;= PR(1-\\cos\\phi) + QR\\sin\\phi \\\\
\\delta_v &amp;= \\dfrac{1}{EI}\\int_0^{\\pi/2} PR(1-\\cos\\phi)\\cdot R(1-\\cos\\phi)\\,R\\,d\\phi = \\left(\\dfrac{3\\pi}{4}-2\\right)\\dfrac{PR^3}{EI} \\approx 0.356\\,\\dfrac{PR^3}{EI} \\\\
\\delta_h &amp;= \\dfrac{1}{EI}\\int_0^{\\pi/2} PR(1-\\cos\\phi)\\cdot R\\sin\\phi\\,R\\,d\\phi = \\dfrac{PR^3}{2EI}
\\end{aligned}</div>
<p>鉛直荷重しかないのに、自由端は<b>水平方向にも</b>動きます (しかも鉛直より大きい)。曲がり部材ではこうした連成が普通に起こり、エネルギー法はそれを機械的に拾い出せます。</p>
<div class="tb-note"><b>計算例</b>: R = 150 mm、丸棒 d = 20 mm (I = π d⁴/64 = 7 854 mm⁴)、鋼 E = 206 GPa、P = 300 N。<br>
PR³/(EI) = 300 × 150³ / (206 000 × 7 854) = 0.626 mm。<br>
鉛直たわみ δ<sub>v</sub> = 0.356 × 0.626 = <b>0.223 mm</b>、水平変位 δ<sub>h</sub> = 0.5 × 0.626 = <b>0.313 mm</b>。</div>

<h2>相反定理とエネルギー法の位置づけ</h2>
<p>線形弾性体では、点 1 の荷重による点 2 の変位と、同じ大きさの荷重を点 2 に置いたときの点 1 の変位が等しくなります (<b>マクスウェルの相反定理</b>)。剛性行列が対称になるのはこのためで、FEM の要素剛性もひずみエネルギー (または仮想仕事) から作られます。手計算のエネルギー法は、FEM の結果を検算するための強力な道具でもあります。</p>
<p>不静定構造では、余分な反力 <span class="tb-m">X</span> を未知の荷重とみなし、その点の変位が 0 という条件 <span class="tb-m">\\partial U/\\partial X = 0</span> から反力を決めます (最小仕事の原理)。不静定はりの詳しい解き方は不静定構造の章と合わせて読んでください。</p>

<h2>よくある失敗</h2>
<ul>
<li><b>積分してから微分しようとして式が膨らむ</b>: 先に <span class="tb-m">\\partial M/\\partial F</span> を求め、被積分関数に入れてから積分します。</li>
<li><b>区間ごとに M の式が変わるのを忘れる</b>: 集中荷重・支点ごとに区間を分け、各区間で M と ∂M/∂F を書きます。</li>
<li><b>仮想荷重を 0 にするのが早すぎる</b>: Q を入れたまま偏微分し、そのあとで Q = 0 とします。先に 0 にすると ∂M/∂Q が消えてしまいます。</li>
<li><b>非線形の問題に使う</b>: 第 2 定理は線形弾性が前提です。大変形・塑性・接触がある場合はそのまま使えません。</li>
<li><b>曲率の大きい部材に直線はりの式を使う</b>: R/h が小さい (≲ 5) ときは曲がりはりの理論 (次々章) で補正します。</li>
</ul>
`,
    points: [
      "線形弾性体のひずみエネルギーは U = Fδ/2。軸力 N²/2EA、曲げ M²/2EI、ねじり T²/2GJ を長さ方向に積分する。",
      "カスティリアノの第 2 定理: δᵢ = ∂U/∂Fᵢ、θᵢ = ∂U/∂Mᵢ。積分の前に偏微分すると計算が簡単になる。",
      "荷重のない点の変位は仮想荷重 Q を置いて微分し、最後に Q = 0 とする。これは単位荷重法 δ = ∫M₀m/EI dx と同じ。",
      "曲がり部材では鉛直荷重でも水平変位が生じる。1/4 円ブラケットは δv ≈ 0.356PR³/EI、δh = PR³/2EI。",
      "細長いはりではせん断エネルギーは曲げの数 % 以下で、通常は省略できる。",
    ],
    exercises: [
      {
        q: "鋼 (E = 206 GPa) の丸棒 (断面積 A = 100 mm²、長さ L = 1 m) を F = 10 kN で引っ張りました。ひずみエネルギーと伸びを求めなさい。",
        a: "U = F²L/(2EA) = 10 000² × 1 000 / (2 × 206 000 × 100) = <b>2 427 N·mm ≈ 2.43 J</b>。伸びは δ = ∂U/∂F = FL/(EA) = 10 000 × 1 000 / (206 000 × 100) = <b>0.485 mm</b> (U = Fδ/2 からも 2 × 2 427 / 10 000 = 0.485 mm)。",
      },
      {
        q: "単純支持はり (スパン L) の中央に荷重 F が作用します。カスティリアノの定理で中央のたわみを導き、L = 1 000 mm、F = 2 000 N、E = 206 GPa、I = 1.0 × 10⁶ mm⁴ の値を求めなさい。",
        a: "反力は F/2。左半分で M = Fx/2、∂M/∂F = x/2。対称なので δ = 2∫₀^{L/2} (Fx/2)(x/2)/(EI) dx = (F/2EI)·(L/2)³/3 = <b>FL³/48EI</b>。数値: 2 000 × 1 000³ / (48 × 206 000 × 10⁶) = <b>0.202 mm</b>。",
      },
      {
        q: "片持ちはり (長さ L) に等分布荷重 w がかかっています。先端に仮想荷重 Q を置いて先端たわみを求め、w = 2 N/mm、L = 500 mm、例 1 と同じ断面 (I = 45 000 mm⁴、E = 206 GPa) の値を計算しなさい。",
        a: "先端から x で M = −wx²/2 − Qx、∂M/∂Q = −x。Q = 0 として δ = ∫₀^L (wx²/2)(x)/(EI) dx = <b>wL⁴/8EI</b>。数値: 2 × 500⁴ / (8 × 206 000 × 45 000) = <b>1.69 mm</b>。",
      },
      {
        q: "直径 30 mm、長さ 800 mm の鋼軸 (G = 79 GPa) にトルク 200 N·m がかかっています。ねじりのひずみエネルギーとねじれ角を求めなさい。",
        a: "J = πd⁴/32 = 79 522 mm⁴。U = T²L/(2GJ) = (200 000)² × 800 / (2 × 79 000 × 79 522) = <b>2 547 N·mm ≈ 2.55 J</b>。ねじれ角 φ = ∂U/∂T = TL/(GJ) = <b>0.0255 rad (1.46°)</b>。",
      },
    ],
    quiz: [
      { q: "カスティリアノの第 2 定理 δ = ∂U/∂F が成り立つ前提は?", choices: ["線形弾性体であること", "部材が静定であること", "荷重が 1 つだけであること"], answer: 0, explain: "線形弾性でエネルギーが載荷順序によらないことが導出の根拠です。不静定構造や複数荷重でも使えます。" },
      { q: "荷重が作用していない点のたわみをエネルギー法で求めるには?", choices: ["その点に仮想荷重を置いて偏微分し、最後に 0 とする", "ひずみエネルギーをその点の座標で微分する", "求められない"], answer: 0, explain: "仮想荷重 Q を置き ∂U/∂Q を計算してから Q = 0 にします。これは単位荷重法と同じ計算です。" },
      { q: "1/4 円ブラケットの自由端に鉛直荷重をかけたときの変位について正しいのは?", choices: ["水平方向にも変位し、この形では水平変位の方が大きい", "鉛直方向にしか変位しない", "変位は直線片持ちはりと同じ"], answer: 0, explain: "δv ≈ 0.356PR³/EI に対し δh = 0.5PR³/EI。曲がり部材では荷重方向と直交する変位が生じます。" },
      { q: "細長いはりでせん断によるひずみエネルギーを通常省略してよい理由は?", choices: ["曲げによるエネルギーに比べて数 % 以下だから", "せん断応力がゼロだから", "せん断は弾性変形しないから"], answer: 0, explain: "長さ/高さが大きいはりでは、せん断の寄与は曲げに比べて小さくなります。短く太いはりでは無視できません。" },
    ],
  },
  // ------------------------------------------------------------------ 2
  {
    id: "truss-frame",
    part: "mechanics",
    title: "トラスとラーメン — 骨組構造の解き方",
    minutes: 24,
    level: 2,
    lead: "架台・クレーン・ブラケット・装置フレームの多くは、棒や形鋼を組み合わせた骨組構造です。節点をピンとみなして軸力だけで考えるのがトラス、節点を剛結して曲げも伝えるのがラーメンです。この章では静定・不静定の判定、節点法と切断法によるトラスの部材力、簡単なラーメンの曲げモーメント図の描き方を、数値例で身につけます。",
    body: `
<h2>トラスとラーメンの違い</h2>
<p><b>トラス</b>は、細長い部材を節点で<b>ピン結合</b>し、荷重は節点にだけ作用すると理想化した構造です。部材には軸力 (引張か圧縮) だけが生じ、曲げは生じません。三角形を単位に組むと形が崩れないので、少ない材料で高い剛性が得られます。</p>
<p><b>ラーメン</b> (剛節骨組、rigid frame) は節点を<b>剛結</b> (溶接・高力ボルト・一体成形) し、部材が軸力・せん断力・曲げモーメントを伝える構造です。斜材がなくても形を保てるので、装置フレームや門形の架台によく使われますが、曲げで抵抗するぶん同じ重さならトラスより変形しやすくなります。</p>
<svg class="tb-chart" viewBox="0 0 520 220" role="img" aria-label="左にピン結合トラス、右に剛結の門形ラーメン。トラスは軸力のみ、ラーメンは曲げで抵抗">
<rect class="k-panel" x="8" y="10" width="246" height="200" rx="8"/><rect class="k-panel" x="266" y="10" width="246" height="200" rx="8"/>
<text class="k-title" x="131" y="32" text-anchor="middle">トラス (ピン節点)</text>
<text class="k-title" x="389" y="32" text-anchor="middle">ラーメン (剛節点)</text>
<g class="k-shadow">
<line x1="36" y1="160" x2="226" y2="160" style="stroke:var(--k-line)" stroke-width="7"/>
<line x1="36" y1="160" x2="83" y2="90" style="stroke:var(--k-line)" stroke-width="7"/>
<line x1="83" y1="90" x2="179" y2="90" style="stroke:var(--k-line)" stroke-width="7"/>
<line x1="179" y1="90" x2="226" y2="160" style="stroke:var(--k-line)" stroke-width="7"/>
<line x1="83" y1="90" x2="131" y2="160" style="stroke:var(--k-line)" stroke-width="7"/>
<line x1="179" y1="90" x2="131" y2="160" style="stroke:var(--k-line)" stroke-width="7"/>
</g>
<g style="stroke:var(--k-steel-1)" stroke-width="4">
<line x1="36" y1="160" x2="226" y2="160"/><line x1="36" y1="160" x2="83" y2="90"/><line x1="83" y1="90" x2="179" y2="90"/><line x1="179" y1="90" x2="226" y2="160"/><line x1="83" y1="90" x2="131" y2="160"/><line x1="179" y1="90" x2="131" y2="160"/>
</g>
<g style="fill:var(--tb-surface);stroke:var(--k-line)" stroke-width="1.6"><circle cx="36" cy="160" r="5"/><circle cx="131" cy="160" r="5"/><circle cx="226" cy="160" r="5"/><circle cx="83" cy="90" r="5"/><circle cx="179" cy="90" r="5"/></g>
<path class="k-part" d="M36,165 L26,182 L46,182 Z"/><rect class="k-ground" x="20" y="182" width="32" height="8"/>
<path class="k-part" d="M226,165 L216,178 L236,178 Z"/><circle class="k-sphere" cx="220" cy="182" r="3.5"/><circle class="k-sphere" cx="232" cy="182" r="3.5"/><rect class="k-ground" x="210" y="186" width="32" height="8"/>
<line class="k-force" x1="131" y1="168" x2="131" y2="200"/>
<text class="tick" x="131" y="72" text-anchor="middle">部材力 = 軸力のみ</text>
<g class="k-shadow"><path d="M300,182 L300,70 L478,70 L478,182" style="fill:none;stroke:var(--k-line)" stroke-width="12" stroke-linejoin="miter"/></g>
<path d="M300,182 L300,70 L478,70 L478,182" style="fill:none;stroke:var(--k-steel-1)" stroke-width="8" stroke-linejoin="miter"/>
<path class="k-hidden" d="M296,182 Q290,120 306,76 Q389,96 472,76 Q488,120 482,182" style="stroke:var(--tb-accent)"/>
<rect class="k-ground" x="286" y="186" width="28" height="8"/><rect class="k-ground" x="464" y="186" width="28" height="8"/>
<line class="k-edge" x1="286" y1="186" x2="314" y2="186"/><line class="k-edge" x1="464" y1="186" x2="492" y2="186"/>
<line class="k-force" x1="389" y1="40" x2="389" y2="64"/>
<text class="tick" x="389" y="110" text-anchor="middle">隅角部で曲げを伝える</text>
<text class="tick" x="389" y="124" text-anchor="middle">(破線: 変形の様子)</text>
</svg>
<p class="tb-caption">図: トラスは三角形の組合せで軸力だけ、ラーメンは剛節点で曲げモーメントを伝えて形を保つ</p>

<h2>静定・不静定の判定</h2>
<p>平面トラスでは、節点ごとに 2 つのつり合い式 (<span class="tb-m">\\sum F_x = 0,\\ \\sum F_y = 0</span>) が書けます。節点数 <span class="tb-m">j</span>、部材数 <span class="tb-m">m</span>、支点反力の数 <span class="tb-m">r</span> とすると</p>
<div class="tb-math">n = m + r - 2j \\qquad \\begin{cases} n \\lt 0 &amp; \\text{不安定 (機構)} \\\\ n = 0 &amp; \\text{静定 (形が安定なら)} \\\\ n \\gt 0 &amp; \\text{n 次の不静定} \\end{cases}</div>
<p>平面ラーメン (剛節) では部材の両端に 3 つずつ内力があるので、<span class="tb-m">n = 3m + r - 3j</span> で数えます (ピン節点があれば、その分のモーメント条件を差し引く)。<span class="tb-m">n = 0</span> は必要条件にすぎず、部材の並びが平行四辺形のように<b>形として崩れる配置</b>なら不安定です。数だけでなく、三角形で組まれているかを図で確かめます。</p>
<p>静定構造はつり合い式だけで部材力が決まり、温度変化や支点の沈下で余分な応力が生じません。不静定構造は冗長性があり剛性も高いのですが、部材の剛性比で力の流れが変わり、熱膨張や組立誤差で内力が発生します。</p>

<h2>節点法 — 節点ごとにつり合いを解く</h2>
<p>未知の部材力が 2 つ以下の節点から順に、<span class="tb-m">\\sum F_x = 0,\\ \\sum F_y = 0</span> を解いていきます。部材力は<b>すべて引張と仮定</b> (節点から離れる向き) して式を立て、答えが負なら圧縮と読みます。この約束を守ると符号の混乱がなくなります。</p>

<svg class="tb-chart" viewBox="0 0 520 250" role="img" aria-label="5節点7部材のトラス。A ピン、B ローラ、下弦中央Cに10 kN。部材力の結果を表示">
<text class="k-title" x="260" y="20" text-anchor="middle">計算例のトラス (スパン 4 m、高さ 1.5 m、C に 10 kN)</text>
<g class="k-shadow">
<g style="stroke:var(--k-line)" stroke-width="8">
<line x1="80" y1="180" x2="440" y2="180"/><line x1="80" y1="180" x2="170" y2="45"/><line x1="170" y1="45" x2="350" y2="45"/><line x1="350" y1="45" x2="440" y2="180"/><line x1="170" y1="45" x2="260" y2="180"/><line x1="350" y1="45" x2="260" y2="180"/>
</g></g>
<line x1="80" y1="180" x2="260" y2="180" style="stroke:var(--tb-accent)" stroke-width="4.5"/><line x1="260" y1="180" x2="440" y2="180" style="stroke:var(--tb-accent)" stroke-width="4.5"/>
<line x1="170" y1="45" x2="260" y2="180" style="stroke:var(--tb-accent)" stroke-width="4.5"/><line x1="350" y1="45" x2="260" y2="180" style="stroke:var(--tb-accent)" stroke-width="4.5"/>
<line x1="80" y1="180" x2="170" y2="45" style="stroke:var(--tb-bad)" stroke-width="4.5"/><line x1="170" y1="45" x2="350" y2="45" style="stroke:var(--tb-bad)" stroke-width="4.5"/><line x1="350" y1="45" x2="440" y2="180" style="stroke:var(--tb-bad)" stroke-width="4.5"/>
<g style="fill:var(--tb-surface);stroke:var(--k-line)" stroke-width="1.6"><circle cx="80" cy="180" r="6"/><circle cx="260" cy="180" r="6"/><circle cx="440" cy="180" r="6"/><circle cx="170" cy="45" r="6"/><circle cx="350" cy="45" r="6"/></g>
<path class="k-part" d="M80,186 L68,204 L92,204 Z"/><rect class="k-ground" x="62" y="204" width="36" height="8"/>
<path class="k-part" d="M440,186 L428,200 L452,200 Z"/><circle class="k-sphere" cx="433" cy="204" r="4"/><circle class="k-sphere" cx="447" cy="204" r="4"/><rect class="k-ground" x="422" y="208" width="36" height="8"/>
<line class="k-force" x1="260" y1="190" x2="260" y2="232"/><text class="lbl" x="268" y="230">10 kN</text>
<text class="lbl" x="66" y="176" text-anchor="end">A</text><text class="lbl" x="456" y="176">B</text><text class="lbl" x="246" y="174" text-anchor="end">C</text><text class="lbl" x="160" y="40" text-anchor="end">D</text><text class="lbl" x="360" y="40">E</text>
<text class="mark-t" x="260" y="38" text-anchor="middle">−6.67</text>
<text class="mark-t" x="112" y="106" text-anchor="end">−6.01</text><text class="mark-t" x="408" y="106">−6.01</text>
<text class="mark-t" x="204" y="128" text-anchor="end">+6.01</text><text class="mark-t" x="316" y="128">+6.01</text>
<text class="mark-t" x="170" y="196" text-anchor="middle">+3.33</text><text class="mark-t" x="350" y="196" text-anchor="middle">+3.33</text>
<text class="k-note" x="20" y="240">単位 kN、+ 引張 (青)、− 圧縮 (赤)</text>
</svg>
<p class="tb-caption">図: 節点 j = 5、部材 m = 7、反力 r = 3 → n = 7 + 3 − 10 = 0 で静定。三角形で組まれているので安定</p>

<div class="tb-note"><b>計算例</b>: 図のトラス (A(0, 0)、C(2, 0)、B(4, 0)、D(1, 1.5)、E(3, 1.5) m) の部材力を求めます。斜材の長さは √(1² + 1.5²) = 1.803 m、方向余弦は cos = 1/1.803 = 0.555、sin = 1.5/1.803 = 0.832。<br>
<b>① 反力</b>: 対称なので R<sub>A</sub> = R<sub>B</sub> = 5 kN (上向き)、A の水平反力 0。<br>
<b>② 節点 A</b>: 鉛直 5 + N<sub>AD</sub> × 0.832 = 0 → N<sub>AD</sub> = <b>−6.01 kN (圧縮)</b>。水平 N<sub>AC</sub> + N<sub>AD</sub> × 0.555 = 0 → N<sub>AC</sub> = <b>+3.33 kN (引張)</b>。<br>
<b>③ 節点 D</b>: 鉛直 −N<sub>AD</sub> × 0.832 − N<sub>DC</sub> × 0.832 = 0 → N<sub>DC</sub> = <b>+6.01 kN</b>。水平 −N<sub>AD</sub> × 0.555 + N<sub>DC</sub> × 0.555 + N<sub>DE</sub> = 0 → N<sub>DE</sub> = −(3.33 + 3.33) = <b>−6.67 kN</b>。<br>
<b>④ 検算 (節点 C)</b>: 斜材 2 本の鉛直成分 2 × 6.01 × 0.832 = 10.0 kN が荷重 10 kN とつり合う。対称性から残りの部材も決まります。</div>

<h2>切断法 — 欲しい部材だけを一発で求める</h2>
<p>構造を仮想的に切断し、片側の自由体に <span class="tb-m">\\sum M = 0</span> を適用します。未知力が 3 つ以下になるように切り、<b>他の 2 つの未知力の交点まわり</b>にモーメントを取ると、1 式で 1 つの部材力が出ます。</p>
<p>上の例で上弦 DE を求めるには、DE・DC・AC を切る断面を考え、左側部分について DC と AC の交点 C まわりのモーメントを取ります。</p>
<div class="tb-math">\\textstyle\\sum M_C = -2R_A - 1.5\\,N_{DE} = 0 \\qquad N_{DE} = -\\dfrac{5\\times 2}{1.5} = -6.67\\,\\mathrm{kN}</div>
<p>(N<sub>DE</sub> を引張 = 右向きと仮定。D は C より 1.5 m 上にあるので、右向きの力は C まわりに時計回りのモーメントを作ります。) 上弦は圧縮、下弦は引張というのは、トラス全体を「はり」とみなしたときの曲げモーメントを、上下の弦材が偶力で負担しているからです。<span class="tb-m">N \\approx M/h</span> (h: トラスの高さ) という見方は、概略設計で弦材の大きさを決めるのに便利です。</p>
<div class="tb-tip"><b>圧縮材は座屈を確認</b>: トラスの圧縮材は細長いので、強度より<b>座屈</b>で決まることがよくあります。部材長さをピン-ピンの座屈長さとしてオイラー荷重を確認しましょう (座屈の章)。</div>

<h2>簡単なラーメンの曲げモーメント図</h2>
<p>静定ラーメンは、はりと同じく「切断して片側のつり合い」から曲げモーメントを求めます。隅角部 (剛節点) では、<b>外力のモーメントがなければ両側の部材のモーメントは等しく連続</b>します。図は柱の外側 (または内側) のどちらが引張になるかを決めて、<b>引張側に描く</b>約束にすると読みやすくなります。</p>

<svg class="tb-chart" viewBox="0 0 520 240" role="img" aria-label="ピンとローラで支持した門形ラーメンの頂部に水平力H。左柱で直線的に増え、梁で直線的に減る曲げモーメント図">
<text class="k-title" x="260" y="20" text-anchor="middle">門形ラーメン (A ピン、D ローラ、B に水平力 H)</text>
<g class="k-shadow"><path d="M150,200 L150,70 L370,70 L370,200" style="fill:none;stroke:var(--k-line)" stroke-width="11"/></g>
<path d="M150,200 L150,70 L370,70 L370,200" style="fill:none;stroke:var(--k-steel-1)" stroke-width="7"/>
<path d="M150,200 L205,70 L150,70 Z" style="fill:var(--tb-bad)" opacity="0.16"/><line x1="150" y1="200" x2="205" y2="70" style="stroke:var(--tb-bad)" stroke-width="2"/>
<path d="M150,70 L150,125 L370,70 Z" style="fill:var(--tb-bad)" opacity="0.16"/><line x1="150" y1="125" x2="370" y2="70" style="stroke:var(--tb-bad)" stroke-width="2"/>
<text class="mark-t" x="212" y="86">Hh (柱)</text>
<text class="mark-t" x="142" y="128" text-anchor="end">Hh (梁)</text>
<line class="k-force" x1="96" y1="52" x2="144" y2="52"/><line class="k-thin" x1="150" y1="52" x2="150" y2="64"/>
<text class="lbl" x="92" y="48" text-anchor="end">H</text>
<path class="k-part" d="M150,205 L139,222 L161,222 Z"/><rect class="k-ground" x="132" y="222" width="36" height="8"/>
<path class="k-part" d="M370,205 L359,218 L381,218 Z"/><circle class="k-sphere" cx="364" cy="222" r="3.5"/><circle class="k-sphere" cx="376" cy="222" r="3.5"/><rect class="k-ground" x="354" y="226" width="36" height="8"/>
<text class="lbl" x="128" y="204" text-anchor="end">A</text><text class="lbl" x="392" y="204">D</text><text class="lbl" x="158" y="64">B</text><text class="lbl" x="378" y="64">C</text>
<line class="k-force" x1="196" y1="232" x2="166" y2="232"/><text class="tick" x="200" y="236">H</text>
<text class="tick" x="360" y="160" text-anchor="end">右柱: M = 0</text>
<text class="tick" x="360" y="176" text-anchor="end">(D は鉛直反力のみ)</text>
<line class="k-dimline" x1="470" y1="70" x2="470" y2="200"/><text class="k-dimtext" x="476" y="136">h</text>
<text class="k-dimtext" x="260" y="62" text-anchor="middle">L</text>
</svg>
<p class="tb-caption">図: 左柱は下端 0 から頂部 Hh まで直線、梁は Hh から右端 0 まで直線。引張側 (この荷重ではフレームの内側) に描いている</p>
<p>反力は、全体の水平つり合いから A の水平反力 = H (左向き)、A まわりのモーメントから <span class="tb-m">R_D = Hh/L</span> (上向き)、<span class="tb-m">R_A = -Hh/L</span> (下向き)。左柱は高さ y で <span class="tb-m">M = Hy</span>、梁は B から x で <span class="tb-m">M = Hh - (Hh/L)x</span>、右柱は D の反力が柱の軸線上にあるので <span class="tb-m">M = 0</span> です。数値は演習で確かめます。</p>
<p>実際の装置フレームは柱脚を固定し、上下とも剛結するので不静定 (この門形で 3 次) になります。そのときは FEM か、たわみ角法・エネルギー法で解きますが、<b>静定に置き換えたモデルでモーメントの上限と分布の形を把握しておく</b>と、FEM の結果が妥当かどうかを判断できます。</p>

<h2>よくある失敗</h2>
<ul>
<li><b>部材の途中に荷重がかかるのに軸力だけで計算する</b>: トラス仮定は節点荷重が前提です。部材の自重や途中の荷重があれば、その部材は曲げも受けるはりとして別に確認します。</li>
<li><b>溶接フレームをピン節点として解き、隅角部の曲げを見落とす</b>: 実際の継手は剛結に近く、二次曲げ応力が生じます。疲労に効くのはこの隅角部です。</li>
<li><b>符号の約束を途中で変える</b>: 「すべて引張と仮定」を最後まで貫きます。</li>
<li><b>静定数だけで安定と判断する</b>: n = 0 でも四角形の枠は崩れます。三角形の構成を確認します。</li>
<li><b>圧縮材の座屈を確認しない</b>: 軸応力が小さくても細長い圧縮材は座屈で壊れます。</li>
</ul>
`,
    points: [
      "トラスはピン節点・節点荷重の理想化で部材は軸力のみ。ラーメンは剛節点で曲げモーメントも伝える。",
      "平面トラスの静定判定は n = m + r − 2j、平面ラーメンは n = 3m + r − 3j。n = 0 でも形が崩れる配置は不安定。",
      "節点法: 未知力 2 つ以下の節点から順に解く。部材力はすべて引張と仮定し、負なら圧縮。",
      "切断法: 欲しい部材を含む断面で切り、他の未知力の交点まわりのモーメントで 1 式で求める。弦材力 ≈ M/h。",
      "ラーメンの曲げモーメント図は引張側に描き、外力モーメントのない剛節点ではモーメントが連続する。",
    ],
    exercises: [
      {
        q: "壁に取り付けた 2 部材ブラケット: 上の部材は水平、下の部材は水平と 30° をなし、両者が先端でピン結合されて W = 5 kN を吊っています。各部材の軸力を求めなさい。",
        a: "先端の節点で鉛直つり合い: 斜材の鉛直成分が W を支えるので N<sub>斜</sub> sin 30° = 5 → <b>N<sub>斜</sub> = 10 kN (圧縮)</b>。水平つり合い: 水平材 = N<sub>斜</sub> cos 30° = <b>8.66 kN (引張)</b>。下の斜材は壁に向かって押し、上の水平材は壁から引き抜かれる向きです。",
      },
      {
        q: "本文の門形ラーメンで H = 2 kN、h = 1.5 m、L = 3 m のとき、支点反力と最大曲げモーメントを求めなさい。",
        a: "A の水平反力 2 kN (左向き)。R<sub>D</sub> = Hh/L = 2 × 1.5 / 3 = <b>1 kN (上向き)</b>、R<sub>A</sub> = <b>1 kN (下向き)</b>。最大曲げモーメントは隅角部 B で M = Hh = <b>3 kN·m</b>。梁の中央では 1.5 kN·m、右柱は 0。",
      },
      {
        q: "部材 9 本、節点 6 個、支点反力 3 個の平面トラスと、部材 3 本 (柱 2 本と梁)、節点 4 個、柱脚 2 か所とも固定 (反力 3 + 3) の門形ラーメンの不静定次数を求めなさい。",
        a: "トラス: n = 9 + 3 − 2 × 6 = <b>0 (静定)</b> (三角形で組まれていれば安定)。ラーメン: n = 3 × 3 + 6 − 3 × 4 = <b>3 次の不静定</b>。",
      },
      {
        q: "本文の例のトラスで、荷重が C ではなく上弦の節点 D に 10 kN 作用するとき、反力 R<sub>A</sub>、R<sub>B</sub> を求めなさい。",
        a: "D の水平位置は x = 1 m。B まわりのモーメントで R<sub>A</sub> × 4 = 10 × (4 − 1) → <b>R<sub>A</sub> = 7.5 kN</b>、<b>R<sub>B</sub> = 2.5 kN</b>。反力は荷重の高さによらず水平位置だけで決まります。",
      },
    ],
    quiz: [
      { q: "理想トラスの部材に生じる内力は?", choices: ["軸力のみ", "曲げモーメントのみ", "軸力と曲げモーメント"], answer: 0, explain: "ピン節点で節点にのみ荷重が作用するため、部材は二力部材となり軸力だけを受けます。" },
      { q: "切断法で 1 つの部材力を 1 式で求めるコツは?", choices: ["残り 2 つの未知力の交点まわりにモーメントを取る", "水平方向の力のつり合いだけを使う", "切断面をできるだけ多くの部材にまたがらせる"], answer: 0, explain: "交点まわりのモーメントでは、その 2 力のモーメントが 0 になり未知数が 1 つになります。" },
      { q: "単純支持の平行弦トラスに下向き荷重がかかるとき、一般に上弦材と下弦材は?", choices: ["上弦が圧縮、下弦が引張", "上弦が引張、下弦が圧縮", "どちらも引張"], answer: 0, explain: "トラス全体をはりと見ると正の曲げで上側が圧縮、下側が引張。弦材力は M/h 程度です。" },
      { q: "n = m + r − 2j = 0 となったトラスについて正しいのは?", choices: ["静定の必要条件を満たすが、配置によっては不安定", "必ず安定な静定トラス", "必ず不静定"], answer: 0, explain: "数の条件は必要条件です。平行四辺形のように崩れる配置なら機構になります。" },
    ],
  },
  // ------------------------------------------------------------------ 3
  {
    id: "curved-thick",
    part: "mechanics",
    title: "曲がりはりと厚肉円筒 — ラーメの式・焼ばめ",
    minutes: 24,
    level: 3,
    lead: "クレーンフック・C 形フレーム・チェーンのリンクのように強く曲がった部材では、まっすぐなはりの曲げの式が内側の応力を過小評価します。また、肉厚が半径に比べて厚い円筒では、薄肉円筒の式 σ = pr/t が使えません。この章では、曲がりはりのウィンクラーの式、厚肉円筒のラーメの式を導き、焼ばめ (締りばめ) の面圧・ハブ応力・伝達トルクを計算します。",
    body: `
<h2>曲がりはり — 中立軸は図心より内側にずれる</h2>
<p>まっすぐなはりでは、平面保持の仮定からひずみは中立軸からの距離に比例します。初めから曲率をもつはりでも断面は平面のまま回転しますが、<b>繊維の元の長さが半径に比例して違う</b>ため、同じ伸び量でも内側の短い繊維ほどひずみが大きくなります。半径 <span class="tb-m">r</span> の繊維の元の長さは <span class="tb-m">r\\,d\\phi</span>、断面が中立面 (半径 <span class="tb-m">r_n</span>) まわりに <span class="tb-m">\\Delta d\\phi</span> 回転すると伸びは <span class="tb-m">(r_n - r)\\Delta d\\phi</span> なので</p>
<div class="tb-math">\\varepsilon = \\dfrac{(r_n - r)\\,\\Delta d\\phi}{r\\,d\\phi} \\qquad \\Rightarrow \\qquad \\sigma = E\\varepsilon \\propto \\dfrac{r_n - r}{r}</div>
<p>応力分布は直線ではなく<b>双曲線</b>になります。軸力ゼロの条件 <span class="tb-m">\\int_A \\sigma\\,dA = 0</span> から中立軸の半径が、モーメントのつり合い <span class="tb-m">\\int_A \\sigma (r_n - r)\\,dA = M</span> から応力の大きさが決まり、次の<b>ウィンクラー (Winkler–Bach) の式</b>が得られます。</p>
<div class="tb-math">r_n = \\dfrac{A}{\\displaystyle\\int_A \\dfrac{dA}{r}} \\qquad
\\sigma = \\dfrac{M\\,(r_n - r)}{A\\,e\\,r} \\qquad e = \\bar r - r_n</div>
<p>ここで e は図心 (半径 <span class="tb-m">\\bar r</span>) と中立軸の距離です。</p>
<p>長方形断面 (幅 b、内半径 <span class="tb-m">r_i</span>、外半径 <span class="tb-m">r_o</span>、高さ <span class="tb-m">h = r_o - r_i</span>) では <span class="tb-m">\\int dA/r = b\\ln(r_o/r_i)</span> なので <span class="tb-m">r_n = h/\\ln(r_o/r_i)</span>。e は小さな数の差なので、<b>有効数字を多めに</b>取って計算します。</p>

<svg class="tb-chart" viewBox="0 0 520 250" role="img" aria-label="曲がりはりの断面と応力分布。中立軸は図心より内側、内側で応力が大きい双曲線分布を直線分布と比較">
<text class="k-title" x="260" y="20" text-anchor="middle">曲がりはりの応力分布 (r_i = 40、r_o = 80 mm、M = 1 kN·m)</text>
<path class="k-part" d="M30,210 A140,140 0 0 1 170,70 L170,120 A90,90 0 0 0 80,210 Z"/>
<circle cx="170" cy="210" r="3" style="fill:var(--k-dim)"/><text class="tick" x="166" y="228" text-anchor="middle">曲率中心</text>
<line class="k-center" x1="170" y1="210" x2="170" y2="60"/>
<path class="k-force" d="M44,234 A26,26 0 0 1 22,196" stroke-width="2"/>
<path class="k-force" d="M196,84 A26,26 0 0 0 184,56" stroke-width="2"/>
<text class="lbl" x="56" y="240">M</text><text class="lbl" x="200" y="64">M</text>
<text class="tick" x="120" y="66" text-anchor="end">外側 r_o</text><text class="tick" x="122" y="196" text-anchor="middle">内側 r_i</text>
<line class="axis" x1="370" y1="56" x2="370" y2="206"/>
<line class="k-hidden" x1="270" y1="130" x2="480" y2="130"/>
<line class="k-thin" x1="270" y1="138" x2="480" y2="138" style="stroke:var(--tb-bad)"/>
<path d="M478.6,200.0 L461.8,193.0 L446.5,186.0 L432.5,179.0 L419.6,172.0 L407.8,165.0 L396.9,158.0 L386.8,151.0 L377.5,144.0 L368.8,137.0 L360.6,130.0 L353.0,123.0 L345.9,116.0 L339.2,109.0 L332.9,102.0 L326.9,95.0 L321.3,88.0 L316.0,81.0 L310.9,74.0 L306.2,67.0 L301.6,60.0" style="fill:none;stroke:var(--tb-bad)" stroke-width="2.4"/>
<path d="M454.4,200 L285.6,60" style="fill:none;stroke:var(--tb-accent)" stroke-width="1.6" stroke-dasharray="6 3"/>
<line class="k-thin" x1="370" y1="200" x2="478.6" y2="200"/><line class="k-thin" x1="370" y1="60" x2="301.6" y2="60"/>
<text class="mark-t" x="482" y="204">241</text><text class="mark-t" x="296" y="56" text-anchor="end">−152</text>
<text class="tick" x="440" y="216" text-anchor="middle">直線はり 188</text>
<text class="tick" x="484" y="128">図心</text><text class="tick" x="484" y="148" style="fill:var(--tb-bad)">中立軸</text>
<text class="tick" x="376" y="70">外側 (r = 80)</text><text class="tick" x="376" y="196">内側 (r = 40)</text>
<text class="k-note" x="370" y="240" text-anchor="middle">実線: ウィンクラー、破線: 直線はり (MPa)</text>
</svg>
<p class="tb-caption">図: 中立軸は図心より e = 2.29 mm 内側にずれ、内側の応力は直線はりの式より約 29 % 大きい</p>

<div class="tb-note"><b>計算例</b>: 長方形断面 b = 20 mm、r<sub>i</sub> = 40 mm、r<sub>o</sub> = 80 mm (h = 40、A = 800 mm²)、曲率を小さくする (開く) 向きの M = 1.0 kN·m。<br>
r<sub>n</sub> = 40 / ln 2 = 57.708 mm、図心 r̄ = 60 mm → e = 2.292 mm。<br>
内側: σ<sub>i</sub> = 1.0 × 10⁶ × (57.708 − 40) / (800 × 2.292 × 40) = <b>241 MPa (引張)</b><br>
外側: σ<sub>o</sub> = 1.0 × 10⁶ × (80 − 57.708) / (800 × 2.292 × 80) = <b>152 MPa (圧縮)</b><br>
直線はりの式 6M/(bh²) = 188 MPa に対し、内側は <b>1.29 倍</b>です。r̄/h = 1.5 程度の強い曲がりでは補正が欠かせません。</div>
<p>曲率が小さい (r̄/h ≳ 5〜10) ときは直線はりとの差が数 % 以下になるので、前章のエネルギー法のように直線はりの式で扱えます。クレーンフックでは荷重が「フックを開く」向きに作用するので、引張になる内側 (荷重のかかる側) を太くした台形やI 形に近い断面にして、内外の応力をそろえます。</p>

<h2>厚肉円筒 — ラーメの式</h2>
<p>内半径 <span class="tb-m">a</span>、外半径 <span class="tb-m">b</span> の長い円筒に内圧 <span class="tb-m">p_i</span>、外圧 <span class="tb-m">p_o</span> が作用するとき、軸対称なので半径方向応力 <span class="tb-m">\\sigma_r</span> と周方向応力 <span class="tb-m">\\sigma_\\theta</span> は半径 r だけの関数です。微小要素の半径方向のつり合いと、変位 u による適合条件は</p>
<div class="tb-math">\\dfrac{d\\sigma_r}{dr} + \\dfrac{\\sigma_r - \\sigma_\\theta}{r} = 0 \\qquad \\varepsilon_r = \\dfrac{du}{dr},\\quad \\varepsilon_\\theta = \\dfrac{u}{r}</div>
<p>フックの法則を入れて u の微分方程式 <span class="tb-m">\\dfrac{d}{dr}\\left[\\dfrac{1}{r}\\dfrac{d(ru)}{dr}\\right] = 0</span> を解くと <span class="tb-m">u = C_1 r + C_2/r</span>、応力は次の形になります (<b>ラーメの式</b>)。</p>
<div class="tb-math">\\begin{gathered}\\sigma_r = A - \\dfrac{B}{r^2} \\qquad \\sigma_\\theta = A + \\dfrac{B}{r^2} \\\\
A = \\dfrac{p_i a^2 - p_o b^2}{b^2 - a^2},\\quad B = \\dfrac{(p_i - p_o)a^2 b^2}{b^2 - a^2}\\end{gathered}</div>
<p>境界条件は <span class="tb-m">\\sigma_r(a) = -p_i</span>、<span class="tb-m">\\sigma_r(b) = -p_o</span> です。内圧だけなら最大応力は内面の周方向応力で</p>
<div class="tb-math">\\sigma_{\\theta,\\max} = p_i\\,\\dfrac{b^2 + a^2}{b^2 - a^2} \\qquad (\\text{内面、引張}) \\qquad \\sigma_r(a) = -p_i</div>
<p>肉厚をいくら増やしても <span class="tb-m">\\sigma_{\\theta,\\max} \\gt p_i</span> で、外側の材料はあまり働きません。高圧では、焼ばめや自緊処理で内側にあらかじめ圧縮応力を入れて耐圧を上げます。<span class="tb-m">\\sigma_r + \\sigma_\\theta = 2A</span> は一定なので、軸方向ひずみも r によらず一様 (断面は平面のまま) になります。</p>

<h2>焼ばめ・圧入 — 締め代から面圧を求める</h2>
<p>軸 (外径 = 接触径 d) を、内径が少し小さいハブ (外径 D) にはめると、接触面に面圧 <span class="tb-m">p</span> が生じます。ハブは内圧 p を受ける厚肉円筒として内径が広がり、軸は外圧 p を受けて縮みます。この 2 つの半径変位の和が<b>半径締め代</b>に等しいという条件から p が決まります。中実軸・ハブとも同じ材料 (E、ν) なら ν は打ち消し合い、直径締め代 <span class="tb-m">\\delta</span> を使って</p>
<div class="tb-math">\\begin{aligned}\\dfrac{\\delta}{2} &amp;= \\dfrac{p\\,(d/2)}{E}\\left[\\dfrac{D^2 + d^2}{D^2 - d^2} + \\nu\\right] + \\dfrac{p\\,(d/2)}{E}(1 - \\nu) \\\\
\\Rightarrow\\quad p &amp;= \\dfrac{E\\,\\delta}{2d}\\left(1 - \\dfrac{d^2}{D^2}\\right)\\end{aligned}</div>
<p>ハブ内面の周方向応力 (最大、引張) は <span class="tb-m">\\sigma_{\\theta} = p\\,(D^2 + d^2)/(D^2 - d^2)</span>、中実軸の内部は <span class="tb-m">\\sigma_r = \\sigma_\\theta = -p</span> の一様な圧縮です。伝達できるトルクと軸方向力は、摩擦係数 μ、はめあい長さ L として</p>
<div class="tb-math">T = \\mu\\,p\\,\\pi d L\\cdot\\dfrac{d}{2} \\qquad F_a = \\mu\\,p\\,\\pi d L</div>

<svg class="tb-chart" viewBox="0 0 520 250" role="img" aria-label="焼ばめ断面と半径方向の応力分布。ハブ内面で周方向応力が最大、軸内部は一様な圧縮">
<text class="k-title" x="260" y="20" text-anchor="middle">焼ばめ d = 50、D = 100 mm、δ = 0.04 mm の応力分布</text>
<circle class="k-part" cx="80" cy="140" r="70"/><circle class="k-part-h" cx="80" cy="140" r="35"/>
<circle cx="80" cy="140" r="35" style="fill:none;stroke:var(--tb-bad)" stroke-width="2"/>
<g class="k-force" stroke-width="1.6"><line x1="80" y1="92" x2="80" y2="103"/><line x1="80" y1="188" x2="80" y2="177"/><line x1="32" y1="140" x2="43" y2="140"/><line x1="128" y1="140" x2="117" y2="140"/></g>
<text class="tick" x="80" y="144" text-anchor="middle">軸</text><text class="tick" x="80" y="82" text-anchor="middle">ハブ</text>
<text class="k-note" x="80" y="228" text-anchor="middle">接触面に面圧 p</text>
<line class="axis" x1="180" y1="160" x2="490" y2="160"/><line class="axis" x1="180" y1="40" x2="180" y2="235"/>
<line class="k-hidden" x1="330" y1="40" x2="330" y2="235"/>
<path d="M180,221.8 L330,221.8" style="fill:none;stroke:var(--tb-accent)" stroke-width="2.2"/>
<path d="M180,221.8 L330,221.8" style="fill:none;stroke:var(--tb-bad)" stroke-width="2.2" stroke-dasharray="7 5"/>
<path d="M330.0,57.0 L345.0,71.3 L360.0,82.2 L375.0,90.6 L390.0,97.4 L405.0,102.8 L420.0,107.2 L435.0,110.9 L450.0,114.0 L465.0,116.6 L480.0,118.8" style="fill:none;stroke:var(--tb-bad)" stroke-width="2.4"/>
<path d="M330.0,221.8 L345.0,207.5 L360.0,196.6 L375.0,188.2 L390.0,181.4 L405.0,176.0 L420.0,171.6 L435.0,167.9 L450.0,164.8 L465.0,162.2 L480.0,160.0" style="fill:none;stroke:var(--tb-accent)" stroke-width="2.4"/>
<text class="mark-t" x="336" y="54">σθ = 103</text><text class="tick" x="484" y="114">41</text>
<text class="mark-t" x="190" y="214">軸: σr = σθ = −61.8</text>
<text class="tick" x="404" y="196" style="fill:var(--tb-accent)">σr (ハブ)</text><text class="tick" x="410" y="98" style="fill:var(--tb-bad)">σθ (ハブ)</text>
<text class="tick" x="180" y="250" text-anchor="middle">r = 0</text><text class="tick" x="330" y="250" text-anchor="middle">25</text><text class="tick" x="480" y="250" text-anchor="middle">50 mm</text>
<text class="tick" x="174" y="164" text-anchor="end">0</text><text class="tick" x="186" y="48">応力 MPa</text>
</svg>
<p class="tb-caption">図: ハブ内面の周方向引張応力が最大。軸は全体が −p の一様な圧縮 (σr と σθ が重なる)</p>

<div class="tb-note"><b>計算例</b>: 鋼の中実軸 d = 50 mm、鋼ハブ外径 D = 100 mm、直径締め代 δ = 0.04 mm、E = 206 GPa、はめあい長さ L = 60 mm、摩擦係数 μ = 0.15。<br>
面圧 p = 206 000 × 0.04 / (2 × 50) × (1 − 50²/100²) = 82.4 × 0.75 = <b>61.8 MPa</b>。<br>
ハブ内面 σ<sub>θ</sub> = 61.8 × (100² + 50²)/(100² − 50²) = 61.8 × 12 500/7 500 = <b>103 MPa (引張)</b>、ハブ外面 σ<sub>θ</sub> = 2p d²/(D² − d²) = 41.2 MPa。<br>
伝達トルク T = 0.15 × 61.8 × π × 50 × 60 × 25 = 2.18 × 10⁶ N·mm = <b>2 180 N·m</b>、軸方向の保持力 F<sub>a</sub> = 87.4 kN。<br>
焼ばめ温度: 組立すきま 0.03 mm を見込んでハブ内径を 0.07 mm 広げるには、α = 11.5 × 10⁻⁶ /K として ΔT = 0.07/(11.5 × 10⁻⁶ × 50) ≈ <b>122 K</b> の加熱 (室温 20 °C から約 140 °C)。</div>
<p>実際の締め代は公差の組合せで最大・最小があります。<b>最小締め代で伝達トルクを、最大締め代でハブ応力 (と軸の圧入力) を</b>確認します。また表面粗さの山がつぶれる分だけ有効な締め代は減ります (目安として Rz の和の 0.4〜0.8 倍程度を差し引く考え方が使われますが、規格・社内基準に従います)。ハブが薄い・軸が中空・材料が異なる場合は、それぞれの半径変位を個別の式で計算して足し合わせます。</p>

<h2>よくある失敗</h2>
<ul>
<li><b>強く曲がった部材に σ = M/Z を使う</b>: 内側の応力を 20〜30 % 以上過小評価します。r̄/h が小さいときはウィンクラーの式か FEM で評価します。</li>
<li><b>e を有効数字不足で計算する</b>: r̄ と r<sub>n</sub> の差は小さいので、4〜5 桁で計算しないと応力が大きく狂います。</li>
<li><b>厚肉円筒に薄肉の式を使う</b>: 肉厚/内半径 ≳ 0.1 では誤差が無視できず、しかも危険側 (小さめ) に出ます。</li>
<li><b>最大締め代でトルクを、最小締め代で応力を確認する</b>: 逆です。最小締め代で滑らないこと、最大締め代で割れないことを確認します。</li>
<li><b>ハブの端やキー溝の応力集中を忘れる</b>: 圧入端では面圧が局部的に高くなり、フレッティング疲労の起点になります。</li>
</ul>
`,
    points: [
      "曲がりはりではひずみが (rₙ − r)/r に比例し、応力は双曲線分布。中立軸は図心より内側にずれる。",
      "ウィンクラーの式 σ = M(rₙ − r)/(A e r)。長方形断面は rₙ = h/ln(rₒ/rᵢ)。e は有効数字を多く取って計算する。",
      "ラーメの式 σr = A − B/r²、σθ = A + B/r²。内圧のみの最大応力は内面の周方向で p(b² + a²)/(b² − a²)。",
      "同材質の焼ばめ (中実軸) の面圧は p = Eδ/(2d)·(1 − d²/D²)。ハブ内面に最大の周方向引張応力が生じる。",
      "最小締め代で伝達トルク、最大締め代でハブ応力を確認する。",
    ],
    exercises: [
      {
        q: "内半径 20 mm、外半径 40 mm の厚肉円筒に内圧 30 MPa がかかります。内面の周方向応力をラーメの式で求め、平均半径を使った薄肉の式 σ = pr/t と比べなさい。",
        a: "k = b/a = 2。σθ,max = 30 × (4 + 1)/(4 − 1) = <b>50 MPa</b>。薄肉の式 (r = 30、t = 20): 30 × 30/20 = <b>45 MPa</b>。薄肉の式は 10 % 小さく、危険側の評価になります。",
      },
      {
        q: "長方形断面 b = 20 mm、r<sub>i</sub> = 20 mm、r<sub>o</sub> = 60 mm の曲がりはりに M = 0.5 kN·m が作用します。内側・外側の応力と、直線はりの式の値を求めなさい。",
        a: "h = 40、A = 800 mm²、r<sub>n</sub> = 40/ln 3 = 36.410 mm、r̄ = 40 → e = 3.590 mm。σ<sub>i</sub> = 0.5 × 10⁶ × (36.410 − 20)/(800 × 3.590 × 20) = <b>143 MPa</b>、σ<sub>o</sub> = 0.5 × 10⁶ × (60 − 36.410)/(800 × 3.590 × 60) = <b>68 MPa</b>。直線はり 6M/(bh²) = <b>93.8 MPa</b>。内側は 1.52 倍で、曲がりが強いほど差が大きくなります。",
      },
      {
        q: "本文の焼ばめ例で、ハブ外面の周方向応力が 41.2 MPa になることを確かめなさい。また、締め代を 0.02 mm に減らすと伝達トルクはいくらになりますか。",
        a: "外面 (r = b) では σθ = 2A = 2p a²/(b² − a²) = 2 × 61.8 × 25²/(50² − 25²) = <b>41.2 MPa</b>。面圧は締め代に比例するので p = 30.9 MPa、トルクも比例して <b>約 1 090 N·m</b> (半分) になります。",
      },
      {
        q: "外径 100 mm の鋼ハブに内径 50 mm の穴をあけ、焼ばめで中実軸をはめるとき、面圧 p を d と D で表した式の (1 − d²/D²) の項は何を表していますか。D を 150 mm に大きくすると p は何倍になりますか (他は同じ)。",
        a: "ハブの剛性 (外径が大きいほど広がりにくい) を表します。D = 100 で 0.75、D = 150 で 1 − 2 500/22 500 = 0.889 → p は <b>約 1.19 倍</b>。ただし D → ∞ でも 1 が上限なので、ハブを太くする効果には限りがあります。",
      },
    ],
    quiz: [
      { q: "曲がりはりの中立軸の位置について正しいのは?", choices: ["図心より曲率中心側 (内側) にずれる", "図心と一致する", "図心より外側にずれる"], answer: 0, explain: "内側の繊維ほど元の長さが短くひずみが大きいため、中立軸は内側へ移動します。" },
      { q: "内圧を受ける厚肉円筒で最大応力が生じる場所と成分は?", choices: ["内面の周方向応力", "外面の周方向応力", "外面の半径方向応力"], answer: 0, explain: "σθ = A + B/r² は r が小さいほど大きく、内面で最大になります。" },
      { q: "焼ばめで伝達トルクを確認するときに使う締め代は?", choices: ["公差の組合せで最小の締め代", "最大の締め代", "公称の締め代"], answer: 0, explain: "滑らないことは最小締め代で、ハブが割れないことは最大締め代で確認します。" },
      { q: "厚肉円筒の肉厚を大きくしていったときの内面の周方向応力は?", choices: ["内圧 p より小さくはならない", "肉厚に反比例して 0 に近づく", "肉厚に関係なく一定"], answer: 0, explain: "b → ∞ でも σθ,max → p。外側の材料はあまり働かないため、高圧では焼ばめや自緊で予圧縮を与えます。" },
    ],
  },
  // ------------------------------------------------------------------ 4
  {
    id: "plates-shells",
    part: "mechanics",
    title: "平板と薄肉殻 — 円板・長方形板のたわみと応力",
    minutes: 24,
    level: 3,
    lead: "カバー・底板・覗き窓・真空チャンバの蓋・ダイヤフラムなど、面に垂直な圧力を受ける板は「はり」とは違う式で評価します。この章では、板の曲げ剛性 D と基礎方程式 D∇⁴w = q の意味を押さえ、円板の周辺固定・周辺単純支持の公式を導き、長方形板の係数表を正しく使う方法と、薄肉殻の膜応力・端部曲げの考え方を学びます。",
    body: `
<h2>板の曲げ剛性 D</h2>
<p>板厚 t が面の寸法に比べて十分薄く (目安 t/短辺 ≲ 1/10)、たわみが板厚より小さい (w ≲ t/2) とき、<b>キルヒホッフの薄板理論</b>が使えます。仮定は、はりの平面保持と同じく「中立面に垂直な線は変形後も中立面に垂直」です。はりと違うのは、板は 2 方向に曲がり、<b>横方向の伸縮がポアソン効果で拘束される</b>ことです。そのため単位幅あたりの曲げ剛性は、はりの <span class="tb-m">EI = Et^3/12</span> (単位幅) より <span class="tb-m">1/(1-\\nu^2)</span> 倍だけ大きくなります。</p>
<div class="tb-math">\\begin{gathered}D = \\dfrac{E t^3}{12(1-\\nu^2)} \\\\
M_x = -D\\left(\\dfrac{\\partial^2 w}{\\partial x^2} + \\nu\\dfrac{\\partial^2 w}{\\partial y^2}\\right),\\quad
M_y = -D\\left(\\dfrac{\\partial^2 w}{\\partial y^2} + \\nu\\dfrac{\\partial^2 w}{\\partial x^2}\\right)\\end{gathered}</div>
<p>モーメントとせん断力のつり合いをまとめると、板の基礎方程式 (ソフィー・ジェルマン–ラグランジュの式) が得られます。</p>
<div class="tb-math">D\\,\\nabla^4 w = D\\left(\\dfrac{\\partial^4 w}{\\partial x^4} + 2\\dfrac{\\partial^4 w}{\\partial x^2\\partial y^2} + \\dfrac{\\partial^4 w}{\\partial y^4}\\right) = q</div>
<p>はりの <span class="tb-m">EI\\,w'''' = q</span> を 2 次元に拡張した形です。曲げ応力は単位幅のモーメントから <span class="tb-m">\\sigma = 6M/t^2</span> で求めます。D は <b>t³ に比例</b>するので、板厚を 2 倍にするとたわみは 1/8、応力は 1/4 になります。</p>

<h2>円板の公式 — 軸対称なら積分で解ける</h2>
<p>半径 a の円板が等分布圧力 q を受ける軸対称問題では、基礎方程式は r だけの常微分方程式になります。</p>
<div class="tb-math">\\dfrac{1}{r}\\dfrac{d}{dr}\\left\\{ r\\dfrac{d}{dr}\\left[\\dfrac{1}{r}\\dfrac{d}{dr}\\left(r\\dfrac{dw}{dr}\\right)\\right]\\right\\} = \\dfrac{q}{D}</div>
<p>4 回積分すると <span class="tb-m">w = \\dfrac{q r^4}{64D} + C_1 r^2 \\ln r + C_2 r^2 + C_3 \\ln r + C_4</span>。中心でたわみと傾きが有限なので <span class="tb-m">C_1 = C_3 = 0</span>。<b>周辺固定</b> (<span class="tb-m">w(a) = 0,\\ w'(a) = 0</span>) なら</p>
<div class="tb-math">w(r) = \\dfrac{q}{64D}\\left(a^2 - r^2\\right)^2 \\qquad w_{\\max} = \\dfrac{q a^4}{64D}\\ (\\text{中心})</div>
<p>半径方向モーメント <span class="tb-m">M_r = -D\\left(w'' + \\dfrac{\\nu}{r}w'\\right)</span> を計算すると、周辺で <span class="tb-m">M_r = -qa^2/8</span>、中心で <span class="tb-m">(1+\\nu)qa^2/16</span>。<b>周辺単純支持</b> (<span class="tb-m">w(a) = 0,\\ M_r(a) = 0</span>) でも同様に積分定数を決めると、次の表になります。</p>
<table class="tb-table">
<tr><th>円板 (半径 a、等分布 q)</th><th>最大たわみ (中心)</th><th>最大曲げ応力</th></tr>
<tr><td>周辺固定</td><td><span class="tb-m">\\dfrac{qa^4}{64D}</span></td><td><span class="tb-m">\\dfrac{3qa^2}{4t^2}</span> (周辺、半径方向)</td></tr>
<tr><td>周辺単純支持</td><td><span class="tb-m">\\dfrac{(5+\\nu)qa^4}{64(1+\\nu)D}</span></td><td><span class="tb-m">\\dfrac{3(3+\\nu)qa^2}{8t^2}</span> (中心)</td></tr>
<tr><td>中心集中荷重 P・周辺固定</td><td><span class="tb-m">\\dfrac{Pa^2}{16\\pi D}</span></td><td>荷重点で理論上無限大 (荷重の分布半径で評価)</td></tr>
<tr><td>中心集中荷重 P・周辺単純支持</td><td><span class="tb-m">\\dfrac{(3+\\nu)Pa^2}{16\\pi(1+\\nu)D}</span></td><td>同上</td></tr>
</table>

<svg class="tb-chart" viewBox="0 0 520 250" role="img" aria-label="円板の支持条件。周辺固定と周辺単純支持の断面とたわみ形状、最大応力の位置">
<rect class="k-panel" x="8" y="10" width="246" height="230" rx="8"/><rect class="k-panel" x="266" y="10" width="246" height="230" rx="8"/>
<text class="k-title" x="131" y="32" text-anchor="middle">周辺固定</text><text class="k-title" x="389" y="32" text-anchor="middle">周辺単純支持</text>
<g class="k-force" stroke-width="1.5"><line x1="56" y1="50" x2="56" y2="72"/><line x1="94" y1="50" x2="94" y2="72"/><line x1="131" y1="50" x2="131" y2="72"/><line x1="168" y1="50" x2="168" y2="72"/><line x1="206" y1="50" x2="206" y2="72"/>
<line x1="314" y1="50" x2="314" y2="72"/><line x1="352" y1="50" x2="352" y2="72"/><line x1="389" y1="50" x2="389" y2="72"/><line x1="426" y1="50" x2="426" y2="72"/><line x1="464" y1="50" x2="464" y2="72"/></g>
<rect class="k-cut" x="18" y="68" width="22" height="40"/><rect class="k-cut" x="222" y="68" width="22" height="40"/>
<path class="k-part" d="M40,80 C80,80 100,112 131,112 C162,112 182,80 222,80 L222,88 C182,88 162,120 131,120 C100,120 80,88 40,88 Z"/>
<path class="k-hidden" d="M40,80 L222,80"/>
<path class="k-part" d="M290,84 C320,96 350,122 389,122 C428,122 458,96 488,84 L488,92 C458,104 428,130 389,130 C350,130 320,104 290,92 Z"/>
<path class="k-hidden" d="M290,84 L488,84"/>
<path class="k-part" d="M290,92 L282,106 L298,106 Z"/><path class="k-part" d="M488,92 L480,106 L496,106 Z"/>
<rect class="k-ground" x="276" y="106" width="28" height="7"/><rect class="k-ground" x="474" y="106" width="28" height="7"/>
<line class="axis" x1="30" y1="190" x2="232" y2="190"/><line class="axis" x1="288" y1="190" x2="490" y2="190"/>
<path d="M40,150 C70,190 90,210 131,212 C172,210 192,190 222,150" style="fill:none;stroke:var(--tb-bad)" stroke-width="2"/>
<path d="M290,190 C320,206 350,228 389,229 C428,228 458,206 488,190" style="fill:none;stroke:var(--tb-bad)" stroke-width="2"/>
<text class="tick" x="131" y="140" text-anchor="middle">Mr の分布 (下が正)</text>
<text class="mark-t" x="148" y="160">端 −qa²/8 最大</text>
<text class="mark-t" x="131" y="230" text-anchor="middle">(1+ν)qa²/16</text>
<text class="mark-t" x="389" y="174" text-anchor="middle">中心で最大 (3+ν)qa²/16</text>
<text class="k-note" x="389" y="150" text-anchor="middle">周辺は Mr = 0</text>
</svg>
<p class="tb-caption">図: 周辺固定は周辺の上面が引張で最大、単純支持は中心で最大。単純支持のたわみは固定の約 4 倍 (ν = 0.3 で 4.08 倍)</p>

<div class="tb-note"><b>計算例</b>: 鋼の円板 a = 150 mm (Ø300)、t = 10 mm、E = 206 GPa、ν = 0.3、q = 0.5 MPa。<br>
D = 206 000 × 10³ / (12 × 0.91) = 1.886 × 10⁷ N·mm。<br>
周辺固定: w = 0.5 × 150⁴ / (64 × 1.886 × 10⁷) = <b>0.210 mm</b>、周辺の応力 3 × 0.5 × 150² / (4 × 10²) = <b>84.4 MPa</b> (中心は 54.8 MPa)。<br>
周辺単純支持: w = 5.3 × 0.5 × 150⁴ / (64 × 1.3 × 1.886 × 10⁷) = <b>0.855 mm</b>、中心の応力 3 × 3.3 × 0.5 × 150² / (8 × 10²) = <b>139 MPa</b>。<br>
ボルト締めのフランジに載る蓋は、その中間にあります。<b>両方の条件で計算して範囲で把握する</b>のが安全です。</div>

<h2>長方形板 — 係数表は条件を確かめて使う</h2>
<p>長方形板は級数解 (ナビエ解・レビ解) になるので、実務では便覧の係数表を使います。短辺を b、長辺を a として</p>
<div class="tb-math">w_{\\max} = \\alpha\\,\\dfrac{q b^4}{D} \\qquad M_{\\max} = \\beta\\,q b^2 \\qquad \\sigma_{\\max} = \\dfrac{6M_{\\max}}{t^2}</div>
<svg class="tb-chart" viewBox="0 0 520 250" role="img" aria-label="長方形板の最大たわみ係数αの辺長比による変化。周辺単純支持と周辺固定">
<text class="k-title" x="260" y="20" text-anchor="middle">最大たわみ係数 α (w = α q b⁴ / D、ν = 0.3)</text>
<line class="grid" x1="70" y1="150" x2="290" y2="150"/><line class="grid" x1="70" y1="90" x2="290" y2="90"/>
<line class="axis" x1="70" y1="210" x2="290" y2="210"/><line class="axis" x1="70" y1="210" x2="70" y2="40"/>
<line class="k-hidden" x1="70" y1="53.8" x2="290" y2="53.8"/><text class="tick" x="76" y="49">a/b = ∞: 0.0130</text>
<polyline points="70,161.3 90,142.3 110,125.4 130,110.4 150,98.3 170,88.4 270,63.2" style="fill:none;stroke:var(--tb-bad)" stroke-width="2.4"/>
<polyline points="70,194.9 90,189.4 110,185.2 130,182.4 150,180.6 170,179.5" style="fill:none;stroke:var(--tb-accent)" stroke-width="2.4"/>
<g style="fill:var(--tb-bad)"><circle cx="70" cy="161.3" r="3"/><circle cx="170" cy="88.4" r="3"/><circle cx="270" cy="63.2" r="3"/></g>
<g style="fill:var(--tb-accent)"><circle cx="70" cy="194.9" r="3"/><circle cx="170" cy="179.5" r="3"/></g>
<text class="tick" x="70" y="226" text-anchor="middle">1</text><text class="tick" x="120" y="226" text-anchor="middle">1.5</text><text class="tick" x="170" y="226" text-anchor="middle">2</text><text class="tick" x="270" y="226" text-anchor="middle">3</text>
<text class="tick" x="180" y="244" text-anchor="middle">辺長比 a/b</text>
<text class="tick" x="64" y="214" text-anchor="end">0</text><text class="tick" x="64" y="154" text-anchor="end">0.005</text><text class="tick" x="64" y="94" text-anchor="end">0.010</text>
<text class="mark-t" x="182" y="108">単純支持</text><text class="mark-t" x="182" y="198">周辺固定</text>
<rect class="k-panel" x="330" y="50" width="176" height="150" rx="8"/>
<rect class="k-alu" x="356" y="92" width="124" height="62"/>
<line class="k-dimline" x1="356" y1="170" x2="480" y2="170"/><text class="k-dimtext" x="418" y="186" text-anchor="middle">a (長辺)</text>
<line class="k-dimline" x1="344" y1="92" x2="344" y2="154"/><text class="k-dimtext" x="340" y="80" text-anchor="start">b (短辺)</text>
<text class="tick" x="418" y="127" text-anchor="middle">t、等分布 q</text>
</svg>
<p class="tb-caption">図: a/b が 3 を超えると、単純支持の長方形板は「幅 b の両端支持はり」(帯板) とほぼ同じになる</p>
<table class="tb-table">
<tr><th>a/b</th><th>単純支持 α</th><th>単純支持 β (中央)</th><th>周辺固定 α</th><th>周辺固定 β (長辺中央)</th></tr>
<tr><td>1.0</td><td>0.00406</td><td>0.0479</td><td>0.00126</td><td>0.0513</td></tr>
<tr><td>1.5</td><td>0.00772</td><td>0.0812</td><td>0.00220</td><td>0.0757</td></tr>
<tr><td>2.0</td><td>0.01013</td><td>0.1017</td><td>0.00254</td><td>0.0829</td></tr>
<tr><td>∞</td><td>0.01302</td><td>0.1250</td><td>0.00260</td><td>0.0833</td></tr>
</table>
<p class="tb-caption">ν = 0.3 (Timoshenko の板の理論の表に基づく値)。∞ の値は帯板 (EI の代わりに D を使ったはり) の公式 5/384 = 0.01302、1/8、1/384 = 0.00260、1/12 と一致する</p>
<p>係数表を使うときの確認事項: ① <b>b がどちらの辺か</b> (短辺基準か長辺基準か、表によって違う)、② α が <b>D 基準か E t³ 基準か</b> (<span class="tb-m">D = Et^3/10.92</span> の違いで約 11 倍ずれる)、③ ν の値、④ 支持条件の定義 (固定 = 傾き 0) です。∞ の行が帯板のはり公式と一致するかを確かめると、表の読み違えを防げます。</p>
<div class="tb-note"><b>計算例</b>: 鋼板 400 × 200 mm、t = 8 mm、q = 0.05 MPa (水頭約 5 m)、周辺単純支持。D = 206 000 × 8³/10.92 = 9.66 × 10⁶ N·mm。<br>
w = 0.01013 × 0.05 × 200⁴ / 9.66 × 10⁶ = <b>0.084 mm</b>、M = 0.1017 × 0.05 × 200² = 203 N·mm/mm、σ = 6 × 203 / 8² = <b>19.1 MPa</b>。<br>
周辺固定なら w = 0.00254 × 0.05 × 200⁴/D = 0.021 mm、長辺中央の応力 6 × 0.0829 × 0.05 × 200²/64 = 15.5 MPa。</div>

<h2>薄肉殻 — 膜応力と端部の曲げ</h2>
<p>曲面の殻は、圧力を主に<b>面内の膜力</b>で支えるので、平板よりはるかに効率的です。円筒 (半径 r、肉厚 t) では周方向 <span class="tb-m">\\sigma_\\theta = pr/t</span>、軸方向 <span class="tb-m">\\sigma_x = pr/(2t)</span>、球殻では <span class="tb-m">pr/(2t)</span> です。ところが、円筒と平らな鏡板の接合部・フランジ・板厚の段差などでは、膜変形の食い違いを合わせるために<b>局部的な曲げ</b> (不連続応力) が生じます。</p>
<div class="tb-math">\\beta = \\dfrac{\\sqrt[4]{3(1-\\nu^2)}}{\\sqrt{rt}} \\approx \\dfrac{1.285}{\\sqrt{rt}} \\qquad x_{\\text{影響}} \\approx \\dfrac{\\pi}{\\beta} \\approx 2.4\\sqrt{rt}</div>
<p>端部の曲げは <span class="tb-m">e^{-\\beta x}</span> に比例して振動しながら減衰し、<span class="tb-m">x \\approx \\pi/\\beta</span> でほぼ消えます。</p>
<p>例えば r = 200 mm、t = 5 mm の円筒では <span class="tb-m">\\sqrt{rt} = 31.6</span> mm、影響範囲は約 77 mm です。この範囲に溶接やポートを置かない、鏡板は皿形・半楕円形にして曲げを減らす、といった設計判断の根拠になります。また外圧を受ける薄肉殻 (真空容器の胴など) は、応力が小さくても<b>座屈</b>で潰れるので、圧力容器の規格に従った座屈評価が必要です。</p>

<h2>よくある失敗</h2>
<ul>
<li><b>板をはり (幅 b のはり) として計算する</b>: 正方形に近い板ではたわみを 3 倍程度過大に見積もり、支持の拘束も無視することになります。逆に、細長い板はほぼはりとして扱えます。</li>
<li><b>係数表の基準辺・基準剛性を取り違える</b>: 短辺/長辺、D/Et³ の違いで 1 桁ずれます。∞ の行で検算します。</li>
<li><b>「周辺固定」を過信する</b>: ボルト締めの蓋は完全固定になりません。単純支持との両方で評価します。</li>
<li><b>たわみが板厚の半分を超えても線形の式を使う</b>: 膜作用でたわみは式より小さくなりますが、応力分布も変わります。大たわみ理論か FEM を使います。</li>
<li><b>集中荷重の荷重点応力を点荷重の式で出す</b>: 理論上は無限大になります。荷重の分布半径を考えた式か FEM で評価します。</li>
</ul>
`,
    points: [
      "板の曲げ剛性 D = Et³/12(1 − ν²)。基礎方程式 D∇⁴w = q。曲げ応力は σ = 6M/t²。",
      "板厚 2 倍でたわみ 1/8、応力 1/4。剛性を上げるには板厚またはリブ・曲面化が効く。",
      "円板 (等分布): 周辺固定 w = qa⁴/64D、σ = 3qa²/4t² (周辺)。単純支持 w は約 4 倍、σ = 3(3 + ν)qa²/8t² (中心)。",
      "長方形板の係数表は基準辺 (短辺)・D 基準か Et³ 基準か・ν を確認し、∞ の行がはり公式と一致するかで検算する。",
      "薄肉殻は膜応力で圧力を支えるが、接合部では約 2.4√(rt) の範囲に曲げが生じる。外圧では座屈に注意。",
    ],
    exercises: [
      {
        q: "アルミ合金 (E = 70 GPa、ν = 0.33) の円板 a = 100 mm、t = 5 mm が周辺固定で q = 0.1 MPa を受けます。D、最大たわみ、最大応力を求めなさい。",
        a: "D = 70 000 × 125 / (12 × (1 − 0.1089)) = <b>8.18 × 10⁵ N·mm</b>。w = 0.1 × 100⁴ / (64 × 8.18 × 10⁵) = <b>0.191 mm</b>。σ = 3 × 0.1 × 100² / (4 × 25) = <b>30 MPa</b> (周辺、半径方向)。",
      },
      {
        q: "本文の鋼円板 (a = 150 mm、t = 10 mm、周辺単純支持、q = 0.5 MPa) で、中心たわみを 0.3 mm 以下にするには板厚をいくつにすればよいですか。",
        a: "w ∝ 1/t³ なので t = 10 × (0.855/0.3)^(1/3) = 10 × 1.418 = <b>14.2 mm 以上</b> (例えば 16 mm)。このとき応力は 139 × (10/14.2)² ≈ 69 MPa に下がります。",
      },
      {
        q: "鋼 (E = 206 GPa、ν = 0.3) の周辺固定円板 a = 100 mm、t = 6 mm の中心に P = 1 000 N の集中荷重がかかります。中心のたわみを求めなさい。",
        a: "D = 206 000 × 216/10.92 = 4.07 × 10⁶ N·mm。w = Pa²/(16πD) = 1 000 × 100² / (16π × 4.07 × 10⁶) = <b>0.049 mm</b>。応力は荷重点で理論上大きくなるので、荷重の接触半径を考えて別途評価します。",
      },
      {
        q: "表の周辺単純支持の a/b = ∞ の値 α = 0.01302、β = 0.125 が、幅 1 の両端単純支持はり (スパン b) の公式と一致することを確かめなさい。",
        a: "非常に細長い板の中央部は、幅 1 の帯板が短辺 b をスパンとして曲がる状態です。帯板は幅方向のひずみが拘束されるので、はりの EI の代わりに D を使います。両端単純支持はりの公式から w = 5qb⁴/(384D) = <b>0.01302 qb⁴/D</b>、M = qb²/8 = <b>0.125 qb²</b>。表の値と一致します。",
      },
    ],
    quiz: [
      { q: "板の曲げ剛性 D がはりの EI (単位幅) より 1/(1 − ν²) 倍大きい理由は?", choices: ["横方向のポアソン変形が拘束されるから", "板は 2 方向から支持されるから", "せん断変形を無視するから"], answer: 0, explain: "板では幅方向のひずみが周囲の材料に拘束されるため、見かけの剛性が上がります。" },
      { q: "等分布圧力を受ける周辺固定円板の最大曲げ応力の位置は?", choices: ["周辺 (固定端) の表面", "中心", "半径の中間"], answer: 0, explain: "周辺の Mr = −qa²/8 が中心の (1 + ν)qa²/16 より大きく、周辺で最大になります。" },
      { q: "長方形板の係数表を使うときに特に注意すべきことは?", choices: ["基準の辺と、係数が D 基準か Et³ 基準か", "板の色", "荷重の単位を必ず kgf にすること"], answer: 0, explain: "基準辺や剛性の定義を取り違えると 1 桁以上ずれます。∞ の行で検算できます。" },
      { q: "円筒殻と平板の接合部で生じる局部曲げの影響範囲の目安は?", choices: ["約 2.4√(rt)", "円筒の長さ全体", "板厚と同じ長さ"], answer: 0, explain: "端部の曲げは e^(−βx)、β ≈ 1.285/√(rt) で減衰し、π/β ≈ 2.4√(rt) でほぼ消えます。" },
    ],
  },
  // ------------------------------------------------------------------ 5
  {
    id: "plasticity-limit",
    part: "mechanics",
    title: "塑性と極限設計 — 全塑性モーメント・形状係数・残留応力",
    minutes: 24,
    level: 3,
    lead: "部材の表面が降伏しても、構造はすぐには壊れません。断面の内側と、構造の他の部分にまだ余力があるからです。この章では弾完全塑性体の仮定から全塑性モーメントと形状係数を導き、塑性ヒンジと崩壊機構による極限荷重の求め方、除荷後に残る残留応力までを、数値例で確かめます。",
    body: `
<h2>弾完全塑性体と断面の塑性化</h2>
<p>軟鋼のように明瞭な降伏点をもつ材料は、<b>弾完全塑性体</b> (降伏応力 <span class="tb-m">\\sigma_Y</span> まではフックの法則、降伏後は応力一定でひずみだけが増える) で近似できます。ひずみ硬化を無視するので安全側の近似です。</p>
<p>長方形断面 (幅 b、高さ h) のはりに曲げモーメントを増やしていくと、断面の応力分布は次のように変わります。</p>
<svg class="tb-chart" viewBox="0 0 520 250" role="img" aria-label="弾完全塑性体の応力ひずみ線図と、曲げの増加に伴う断面応力分布の変化。弾性、弾塑性、全塑性">
<text class="k-title" x="260" y="20" text-anchor="middle">弾完全塑性体と曲げ応力分布の変化</text>
<line class="axis" x1="30" y1="200" x2="150" y2="200"/><line class="axis" x1="30" y1="200" x2="30" y2="60"/>
<polyline points="30,200 60,90 145,90" style="fill:none;stroke:var(--tb-accent)" stroke-width="2.4"/>
<text class="lbl" x="24" y="94" text-anchor="end">σY</text><text class="tick" x="146" y="216" text-anchor="end">ε</text><text class="tick" x="36" y="58">σ</text>
<text class="tick" x="60" y="216" text-anchor="middle">εY</text><line class="k-hidden" x1="60" y1="90" x2="60" y2="200"/>
<g transform="translate(180,0)">
<rect class="k-panel" x="0" y="40" width="104" height="180" rx="6"/>
<text class="lbl" x="52" y="60" text-anchor="middle">① 弾性</text>
<line class="k-edge" x1="52" y1="80" x2="52" y2="200"/>
<path d="M52,80 L88,80 L16,200 L52,200 Z" style="fill:var(--tb-bad)" opacity="0.16"/>
<line x1="88" y1="80" x2="16" y2="200" style="stroke:var(--tb-bad)" stroke-width="2"/>
<text class="tick" x="52" y="214" text-anchor="middle">M ≤ My</text>
</g>
<g transform="translate(296,0)">
<rect class="k-panel" x="0" y="40" width="104" height="180" rx="6"/>
<text class="lbl" x="52" y="60" text-anchor="middle">② 弾塑性</text>
<line class="k-edge" x1="52" y1="80" x2="52" y2="200"/>
<path d="M52,80 L88,80 L88,110 L16,170 L16,200 L52,200 Z" style="fill:var(--tb-bad)" opacity="0.16"/>
<polyline points="88,80 88,110 16,170 16,200" style="fill:none;stroke:var(--tb-bad)" stroke-width="2"/>
<text class="tick" x="8" y="98">塑性域</text>
<text class="tick" x="52" y="214" text-anchor="middle">My &lt; M &lt; Mp</text>
</g>
<g transform="translate(412,0)">
<rect class="k-panel" x="0" y="40" width="104" height="180" rx="6"/>
<text class="lbl" x="52" y="60" text-anchor="middle">③ 全塑性</text>
<line class="k-edge" x1="52" y1="80" x2="52" y2="200"/>
<path d="M52,80 L88,80 L88,140 L16,140 L16,200 L52,200 Z" style="fill:var(--tb-bad)" opacity="0.16"/>
<polyline points="88,80 88,140 16,140 16,200" style="fill:none;stroke:var(--tb-bad)" stroke-width="2"/>
<text class="tick" x="52" y="214" text-anchor="middle">M = Mp</text>
</g>
<text class="k-note" x="300" y="242" text-anchor="middle">右向き: 引張 σY、左向き: 圧縮 σY (断面の上が圧縮側の例)</text>
</svg>
<p class="tb-caption">図: 表面が降伏した後も内側の弾性核が荷重を受け持ち、全断面が降伏した状態が全塑性モーメント</p>
<p>① 表面が <span class="tb-m">\\sigma_Y</span> に達したときが<b>降伏モーメント</b> <span class="tb-m">M_Y = \\sigma_Y Z</span> (<span class="tb-m">Z = bh^2/6</span>)。② さらに曲げると表面から塑性域が広がり、中央に弾性核が残ります。③ 弾性核がゼロになった極限が<b>全塑性モーメント</b> <span class="tb-m">M_p</span> です。全塑性状態では圧縮側・引張側とも応力 <span class="tb-m">\\sigma_Y</span> 一定なので、軸力ゼロの条件から<b>塑性中立軸は断面積を 2 等分する線</b>になります (対称断面なら図心と一致、非対称断面ではずれる)。</p>
<div class="tb-math">M_p = \\sigma_Y\\,Z_p \\qquad Z_p = A_c\\,\\bar y_c + A_t\\,\\bar y_t</div>
<p>ここで <span class="tb-m">A_c, A_t</span> は塑性中立軸で分けた圧縮側・引張側の面積 (それぞれ A/2)、<span class="tb-m">\\bar y_c, \\bar y_t</span> は塑性中立軸からそれぞれの図心までの距離です。</p>
<p>長方形では <span class="tb-m">Z_p = 2\\cdot\\dfrac{bh}{2}\\cdot\\dfrac{h}{4} = \\dfrac{bh^2}{4}</span>。<span class="tb-m">Z_p</span> を<b>塑性断面係数</b>、比 <span class="tb-m">f = Z_p/Z = M_p/M_Y</span> を<b>形状係数</b>と呼びます。</p>
<table class="tb-table">
<tr><th>断面</th><th>Z</th><th>Z<sub>p</sub></th><th>形状係数 f</th></tr>
<tr><td>長方形 b × h</td><td>bh²/6</td><td>bh²/4</td><td>1.5</td></tr>
<tr><td>中実円 d</td><td>πd³/32</td><td>d³/6</td><td>16/(3π) ≈ 1.70</td></tr>
<tr><td>薄肉円管</td><td>—</td><td>—</td><td>≈ 4/π ≈ 1.27</td></tr>
<tr><td>H 形・I 形 (強軸)</td><td>—</td><td>—</td><td>約 1.10〜1.20</td></tr>
<tr><td>ひし形 (対角線方向の曲げ)</td><td>—</td><td>—</td><td>2.0</td></tr>
</table>
<p>I 形は材料をフランジ (表面近く) に集めているので、弾性範囲ですでに効率よく働いており、塑性化による「余力」は小さくなります。弾性設計で効率のよい断面ほど形状係数は 1 に近い、と覚えておきます。</p>
<div class="tb-note"><b>計算例 (形状係数)</b>: H 形鋼 H-200 × 100 × 5.5 × 8 (フィレットを無視)。<br>
I = [100 × 200³ − (100 − 5.5) × 184³]/12 = 1.761 × 10⁷ mm⁴、Z = I/100 = 1.761 × 10⁵ mm³。<br>
Z<sub>p</sub> = 100 × 8 × (200 − 8) + 5.5 × 184²/4 = 153 600 + 46 552 = 2.002 × 10⁵ mm³。<br>
f = 2.002/1.761 = <b>1.14</b>。(規格表の値はフィレットを含むため少し異なります。)</div>

<h2>モーメント–曲率関係と塑性ヒンジ</h2>
<p>長方形断面で弾性核の半高さを <span class="tb-m">y_0</span> とすると、<span class="tb-m">M = M_p\\left[1 - \\dfrac{1}{3}\\left(\\dfrac{2y_0}{h}\\right)^2\\right]</span>、曲率は <span class="tb-m">\\kappa = \\varepsilon_Y / y_0</span> なので</p>
<div class="tb-math">\\dfrac{M}{M_Y} = \\dfrac{3}{2}\\left[1 - \\dfrac{1}{3}\\left(\\dfrac{\\kappa_Y}{\\kappa}\\right)^2\\right] \\qquad (\\kappa \\ge \\kappa_Y)</div>
<p>曲率が増えても M は <span class="tb-m">M_p = 1.5M_Y</span> を超えず、その断面は一定のモーメントを保ったまま自由に回転する<b>塑性ヒンジ</b>になります (κ = 3κ<sub>Y</sub> で既に 0.96 M<sub>p</sub>)。</p>

<h2>極限荷重 — 崩壊機構と仮想仕事</h2>
<p>静定はりでは、最大モーメントの断面に塑性ヒンジが 1 つできると機構になって崩壊します。単純支持はり中央集中荷重なら <span class="tb-m">P_c = 4M_p/L</span> で、初期降伏荷重の f 倍です。<b>不静定はり</b>では、最初のヒンジができた後もモーメントが他の断面に<b>再配分</b>され、ヒンジが機構を作るのに十分な数そろうまで荷重を増やせます。極限荷重は、崩壊機構を仮定して<b>外力の仮想仕事 = 塑性ヒンジで消費される仕事</b>と置けば求まります。</p>
<svg class="tb-chart" viewBox="0 0 520 230" role="img" aria-label="両端固定はりの等分布荷重による崩壊機構。両端と中央に塑性ヒンジ、回転角θと2θ">
<text class="k-title" x="260" y="20" text-anchor="middle">両端固定はり・等分布荷重の崩壊機構</text>
<rect class="k-cut" x="50" y="60" width="20" height="90"/><rect class="k-cut" x="450" y="60" width="20" height="90"/>
<g class="k-force" stroke-width="1.5"><line x1="90" y1="40" x2="90" y2="70"/><line x1="130" y1="40" x2="130" y2="70"/><line x1="170" y1="40" x2="170" y2="70"/><line x1="210" y1="40" x2="210" y2="70"/><line x1="250" y1="40" x2="250" y2="70"/><line x1="290" y1="40" x2="290" y2="70"/><line x1="330" y1="40" x2="330" y2="70"/><line x1="370" y1="40" x2="370" y2="70"/><line x1="410" y1="40" x2="410" y2="70"/></g>
<line x1="70" y1="40" x2="450" y2="40" style="stroke:var(--tb-bad)" stroke-width="1.5"/><text class="lbl" x="456" y="44">w</text>
<rect class="k-part-h" x="70" y="74" width="380" height="10" style="opacity:0.35"/>
<path class="k-part-h" d="M70,74 L260,124 L450,74 L450,84 L260,134 L70,84 Z"/>
<circle cx="72" cy="79" r="6" style="fill:var(--tb-surface);stroke:var(--tb-bad)" stroke-width="2.4"/>
<circle cx="448" cy="79" r="6" style="fill:var(--tb-surface);stroke:var(--tb-bad)" stroke-width="2.4"/>
<circle cx="260" cy="129" r="6" style="fill:var(--tb-surface);stroke:var(--tb-bad)" stroke-width="2.4"/>
<text class="lbl" x="116" y="94">θ</text>
<text class="lbl" x="260" y="156" text-anchor="middle">2θ</text>
<text class="lbl" x="400" y="102">θ</text>
<line class="k-dimline" x1="282" y1="79" x2="282" y2="129"/><text class="k-dimtext" x="288" y="108">θL/2</text>
<line class="k-dimline" x1="70" y1="176" x2="450" y2="176"/><text class="k-dimtext" x="260" y="194" text-anchor="middle">L</text>
<text class="k-note" x="260" y="216" text-anchor="middle">外力仕事 w·L·(θL/2)/2 = 塑性仕事 Mp(θ + 2θ + θ) → wc = 16Mp/L²</text>
</svg>
<p class="tb-caption">図: 塑性ヒンジ (○) が 3 つできると機構になる。中央のたわみ θL/2 の三角形が等分布荷重の仕事</p>
<div class="tb-math">\\underbrace{w L\\cdot \\dfrac{1}{2}\\cdot\\dfrac{\\theta L}{2}}_{\\text{外力の仕事}} = \\underbrace{M_p(\\theta + 2\\theta + \\theta)}_{\\text{ヒンジの仕事}} \\;\\Rightarrow\\; w_c = \\dfrac{16M_p}{L^2}</div>
<p>弾性解では固定端のモーメント <span class="tb-m">wL^2/12</span> が最大なので、初期降伏は <span class="tb-m">w_Y = 12M_Y/L^2</span>。両者の比は <span class="tb-m">w_c/w_Y = (16/12)\\times f</span> で、長方形なら 2.0 倍になります。仮定した機構が正しい保証はないので (上界定理)、複数の機構を試して<b>最小</b>の荷重を採ります。また、求めた荷重でどこでも <span class="tb-m">|M| \\le M_p</span> となっていれば正解です。</p>
<div class="tb-note"><b>計算例</b>: 長方形断面 30 × 60 mm (強軸曲げ)、SS400 (σ<sub>Y</sub> = 245 MPa)、両端固定、スパン L = 2 m、等分布荷重。<br>
Z = 30 × 60²/6 = 18 000 mm³、Z<sub>p</sub> = 30 × 60²/4 = 27 000 mm³。M<sub>Y</sub> = 4.41 kN·m、M<sub>p</sub> = 6.615 kN·m。<br>
初期降伏 w<sub>Y</sub> = 12 × 4.41 × 10⁶ / 2 000² = <b>13.2 N/mm (kN/m)</b>、崩壊 w<sub>c</sub> = 16 × 6.615 × 10⁶ / 2 000² = <b>26.5 N/mm</b>。<br>
降伏してから崩壊までに荷重が 2 倍の余裕があります。ただし大きな永久たわみが残るので、機械では「使えなくなる」荷重です。</div>

<h2>残留応力 — 除荷は弾性的に戻る</h2>
<p>塑性域に入った部材から荷重を取り除くと、除荷は<b>弾性的</b> (傾き E) に進みます。したがって残留応力は「弾塑性状態の応力」から「同じモーメントを弾性はりとして計算した応力」を引いたものです。</p>
<div class="tb-math">\\sigma_{\\text{res}}(y) = \\sigma_{\\text{弾塑性}}(y) - \\dfrac{M\\,y}{I}</div>
<p>長方形断面を <span class="tb-m">M_p</span> まで曲げて除荷すると、表面の弾性除荷応力は <span class="tb-m">M_p/Z = 1.5\\sigma_Y</span> なので、表面の残留応力は <span class="tb-m">\\sigma_Y - 1.5\\sigma_Y = -0.5\\sigma_Y</span> (載荷時と逆符号)、中立軸の直近では <span class="tb-m">+\\sigma_Y</span> が残ります。</p>
<svg class="tb-chart" viewBox="0 0 520 220" role="img" aria-label="全塑性応力から弾性除荷応力を引くと残留応力分布になる3つの図">
<text class="k-title" x="260" y="20" text-anchor="middle">全塑性 − 弾性除荷 = 残留応力 (長方形断面)</text>
<g transform="translate(20,0)"><rect class="k-panel" x="0" y="34" width="140" height="160" rx="6"/><line class="k-edge" x1="70" y1="54" x2="70" y2="174"/>
<polyline points="70,54 110,54 110,114 30,114 30,174 70,174" style="fill:var(--tb-bad);fill-opacity:0.15;stroke:var(--tb-bad)" stroke-width="2"/>
<text class="tick" x="114" y="70">σY</text><text class="tick" x="70" y="188" text-anchor="middle">載荷 (Mp)</text></g>
<text class="lbl" x="172" y="118" text-anchor="middle">−</text>
<g transform="translate(184,0)"><rect class="k-panel" x="0" y="34" width="140" height="160" rx="6"/><line class="k-edge" x1="70" y1="54" x2="70" y2="174"/>
<polyline points="70,54 130,54 10,174 70,174" style="fill:var(--tb-accent);fill-opacity:0.15;stroke:var(--tb-accent)" stroke-width="2"/>
<text class="tick" x="98" y="48">1.5σY</text><text class="tick" x="70" y="188" text-anchor="middle">弾性除荷 Mp y/I</text></g>
<text class="lbl" x="336" y="118" text-anchor="middle">=</text>
<g transform="translate(348,0)"><rect class="k-panel" x="0" y="34" width="150" height="160" rx="6"/><line class="k-edge" x1="75" y1="54" x2="75" y2="174"/>
<polyline points="75,54 55,54 115,114 35,114 95,174 75,174" style="fill:var(--tb-good);fill-opacity:0.15;stroke:var(--tb-good)" stroke-width="2"/>
<text class="tick" x="10" y="66">−0.5σY</text><text class="tick" x="118" y="106">+σY</text><text class="tick" x="75" y="188" text-anchor="middle">残留応力</text></g>
<text class="k-note" x="260" y="212" text-anchor="middle">断面内で力もモーメントもつり合う自己平衡の応力</text>
</svg>
<p class="tb-caption">図: 除荷後は表面に逆向きの残留応力が残る。この性質を逆手に取るのがショットピーニングや自緊処理</p>
<p>残留応力は外力がなくても存在する自己平衡の応力で、次の荷重では外力の応力に重ね合わされます。<b>逆方向に曲げると早く降伏する</b> (バウシンガー効果も加わる)、表面に圧縮残留応力があると疲労強度が上がる、溶接や焼入れでも残留応力ができる、といった実務上の現象はこの考え方で説明できます。また除荷後の曲率の戻り量 (<span class="tb-m">\\Delta\\kappa = M/(EI)</span>) が、曲げ加工の<b>スプリングバック</b>です。</p>

<h2>よくある失敗</h2>
<ul>
<li><b>形状係数を「安全率の上乗せ」と考える</b>: 塑性化で大きな永久変形が残るので、精度が必要な機械部品では降伏が実質的な限界です。極限設計は「壊れ方の余裕」を知るために使います。</li>
<li><b>非対称断面で塑性中立軸を図心に置く</b>: 全塑性状態の中立軸は面積を 2 等分する線です (T 形などで差が出る)。</li>
<li><b>仮定した崩壊機構を 1 つだけ試す</b>: 仮想仕事法の答えは上界です。複数の機構の最小値を採り、モーメントが M<sub>p</sub> を超えないことを確かめます。</li>
<li><b>座屈・局部座屈を無視する</b>: 薄いフランジやウェブは全塑性モーメントに達する前に局部座屈します。幅厚比の制限を確認します。</li>
<li><b>繰返し荷重に極限荷重を使う</b>: 塑性域を繰り返すと低サイクル疲労や漸増塑性変形 (ラチェット) が起きます。</li>
</ul>
`,
    points: [
      "弾完全塑性体の曲げでは、表面降伏 My = σY·Z の後も弾性核が残り、全断面降伏で Mp = σY·Zp に達する。",
      "塑性中立軸は面積を 2 等分する線。形状係数 f = Zp/Z は長方形 1.5、中実円 1.70、I 形 約 1.1〜1.2。",
      "塑性ヒンジは Mp を保ったまま回転する。不静定構造ではモーメントが再配分され、機構ができるまで荷重を増やせる。",
      "極限荷重は仮想仕事 (外力の仕事 = Mp × ヒンジ回転角の和) で求める。両端固定・等分布で wc = 16Mp/L²。",
      "除荷は弾性的。残留応力 = 弾塑性応力 − My/I。長方形を Mp から除荷すると表面に −0.5σY が残る。",
    ],
    exercises: [
      {
        q: "中実丸棒の形状係数が 16/(3π) ≈ 1.70 になることを、Z = πd³/32 と Z<sub>p</sub> の計算から確かめなさい。",
        a: "半円の面積 πd²/8、その図心は中心から 2d/(3π)。Z<sub>p</sub> = 2 × (πd²/8) × 2d/(3π) = <b>d³/6</b>。f = (d³/6)/(πd³/32) = 32/(6π) = 16/(3π) = <b>1.70</b>。",
      },
      {
        q: "本文の 30 × 60 mm 断面 (M<sub>p</sub> = 6.615 kN·m)、スパン 2 m の一端固定・他端単純支持はりの中央に集中荷重 P がかかります。崩壊荷重を求めなさい。",
        a: "ヒンジは固定端と荷重点。固定端の回転 θ、荷重点の下がり θL/2、荷重点のヒンジ回転 2θ。P·θL/2 = M<sub>p</sub>(θ + 2θ) → P<sub>c</sub> = 6M<sub>p</sub>/L = 6 × 6.615/2 = <b>19.8 kN</b>。",
      },
      {
        q: "SS400 (σ<sub>Y</sub> = 245 MPa) の長方形断面はりを全塑性モーメントまで曲げて除荷しました。表面と中立軸近くの残留応力を求めなさい。",
        a: "表面: σ<sub>Y</sub> − 1.5σ<sub>Y</sub> = −0.5 × 245 = <b>−122.5 MPa</b> (載荷時に引張だった側は圧縮)。中立軸のすぐ外側: σ<sub>Y</sub> − 0 ≈ <b>+245 MPa</b>。",
      },
      {
        q: "単純支持はり (スパン L) の中央集中荷重で、崩壊荷重と初期降伏荷重の比はいくらですか。長方形断面と H 形断面 (f = 1.14) で答えなさい。",
        a: "静定なので再配分はなく、P<sub>c</sub>/P<sub>Y</sub> = M<sub>p</sub>/M<sub>Y</sub> = f。長方形 <b>1.5</b>、H 形 <b>1.14</b>。(本文の断面では P<sub>Y</sub> = 4M<sub>Y</sub>/L = 8.82 kN、P<sub>c</sub> = 13.2 kN。)",
      },
    ],
    quiz: [
      { q: "長方形断面の形状係数は?", choices: ["1.5", "1.0", "1.7"], answer: 0, explain: "Zp = bh²/4、Z = bh²/6 なので 1.5 です。中実円は約 1.70、I 形は約 1.1〜1.2。" },
      { q: "全塑性状態の中立軸の位置は?", choices: ["断面積を 2 等分する線", "常に図心", "最も幅の広い位置"], answer: 0, explain: "引張側と圧縮側の応力がともに σY なので、軸力ゼロの条件から面積が等しくなる位置です。" },
      { q: "仮想仕事法で求めた極限荷重について正しいのは?", choices: ["仮定した機構が誤っていれば真の値より大きく出る (上界)", "常に真の値より小さい", "機構の仮定によらず同じ値"], answer: 0, explain: "運動学的に許される機構からの値は上界です。複数の機構の最小値を採ります。" },
      { q: "塑性域まで曲げて除荷したはりの表面に残る残留応力の符号は?", choices: ["載荷時と逆", "載荷時と同じ", "必ずゼロ"], answer: 0, explain: "弾性除荷応力 (1.5σY) が表面の σY より大きいため、差し引きで逆符号の −0.5σY が残ります。" },
    ],
  },
  // ------------------------------------------------------------------ 6
  {
    id: "fracture-mechanics",
    part: "mechanics",
    title: "破壊力学の基礎 — 応力拡大係数とき裂の許容寸法",
    minutes: 24,
    level: 3,
    lead: "応力が許容応力より十分低いのに、部品が突然割れることがあります。原因の多くは、溶接欠陥・鋳巣・加工傷・疲労き裂など、もともと存在した小さなき裂です。破壊力学は「どの大きさのき裂なら、どの応力で壊れるか」「き裂がどれだけの回数で危険な大きさまで成長するか」を定量的に答えます。この章では応力拡大係数 K、破壊靱性 K_IC、限界き裂寸法、パリス則による疲労き裂進展寿命を学びます。",
    body: `
<h2>なぜ応力だけでは足りないのか</h2>
<p>鋭いき裂の先端では、弾性解析の応力は理論上無限大になります。応力集中係数 <span class="tb-m">K_t = 1 + 2\\sqrt{a/\\rho}</span> (楕円穴、ρ: 先端半径) で ρ → 0 とすれば分かるとおり、「最大応力 ≤ 許容応力」という判定がそもそも成り立ちません。そこで、先端の応力場の<b>強さ</b>を表す 1 つのパラメータで評価する、というのが線形破壊力学 (LEFM) の考え方です。</p>
<p>き裂の変形様式には、開口形 (モード I)・面内せん断形 (II)・面外せん断形 (III) がありますが、実務で最も危険で重要なのはモード I です。モード I のき裂先端近傍の応力は、極座標 (r, θ) で</p>
<div class="tb-math">\\sigma_{ij} = \\dfrac{K_I}{\\sqrt{2\\pi r}}\\,f_{ij}(\\theta) \\qquad (r \\to 0)</div>
<p>(き裂の延長線上では <span class="tb-m">\\sigma_y = K_I/\\sqrt{2\\pi r}</span>) と、どんな形状・荷重でも同じ <span class="tb-m">1/\\sqrt{r}</span> の特異性をもち、違いは係数 <span class="tb-m">K_I</span> (<b>応力拡大係数</b>) だけに集約されます。だから「K が材料固有の限界値に達したら破壊する」という判定ができるのです。</p>

<h2>応力拡大係数 K と形状係数 Y</h2>
<div class="tb-math">K_I = Y\\,\\sigma\\sqrt{\\pi a} \\qquad [\\,\\mathrm{MPa\\sqrt{m}}\\,]</div>
<p>σ はき裂がないとしたときの公称応力、a はき裂寸法、Y は形状と荷重様式で決まる無次元の係数です。a は <b>m 単位</b>で代入するのが慣例です (MPa√m)。</p>
<svg class="tb-chart" viewBox="0 0 520 240" role="img" aria-label="代表的なき裂の形状と形状係数Y。中央き裂Y=1、片側縁き裂Y=1.12、円板状内部き裂Y=2/π。き裂先端の応力分布">
<text class="k-title" x="260" y="20" text-anchor="middle">代表的なき裂と形状係数 Y (無限板・引張)</text>
<g transform="translate(10,0)"><rect class="k-panel" x="0" y="30" width="150" height="200" rx="8"/>
<rect class="k-alu" x="25" y="70" width="100" height="110"/>
<path d="M50,125 Q75,121 100,125 Q75,129 50,125 Z" style="fill:var(--tb-surface);stroke:var(--k-line)" stroke-width="1.4"/>
<g class="k-force" stroke-width="1.6"><line x1="50" y1="66" x2="50" y2="44"/><line x1="100" y1="66" x2="100" y2="44"/><line x1="50" y1="184" x2="50" y2="206"/><line x1="100" y1="184" x2="100" y2="206"/></g>
<line class="k-dimline" x1="50" y1="140" x2="100" y2="140"/><text class="k-dimtext" x="75" y="154" text-anchor="middle">2a</text>
<text class="lbl" x="75" y="222" text-anchor="middle">中央き裂 Y = 1</text></g>
<g transform="translate(184,0)"><rect class="k-panel" x="0" y="30" width="150" height="200" rx="8"/>
<rect class="k-alu" x="25" y="70" width="100" height="110"/>
<path d="M25,121 L62,125 L25,129 Z" style="fill:var(--tb-surface);stroke:var(--k-line)" stroke-width="1.4"/>
<g class="k-force" stroke-width="1.6"><line x1="50" y1="66" x2="50" y2="44"/><line x1="100" y1="66" x2="100" y2="44"/><line x1="50" y1="184" x2="50" y2="206"/><line x1="100" y1="184" x2="100" y2="206"/></g>
<line class="k-dimline" x1="25" y1="140" x2="62" y2="140"/><text class="k-dimtext" x="44" y="154" text-anchor="middle">a</text>
<text class="lbl" x="75" y="222" text-anchor="middle">縁き裂 Y ≈ 1.12</text></g>
<g transform="translate(358,0)"><rect class="k-panel" x="0" y="30" width="152" height="200" rx="8"/>
<line class="axis" x1="22" y1="190" x2="140" y2="190"/><line class="axis" x1="22" y1="190" x2="22" y2="46"/>
<rect x="8" y="186" width="14" height="8" style="fill:var(--k-line)"/>
<path d="M28,50 Q32,120 50,150 Q80,176 140,182" style="fill:none;stroke:var(--tb-bad)" stroke-width="2.4"/>
<line class="k-hidden" x1="22" y1="178" x2="140" y2="178"/>
<text class="tick" x="132" y="174" text-anchor="end">公称 σ</text>
<text class="tick" x="36" y="62">σy ∝ K/√(2πr)</text>
<text class="tick" x="132" y="204" text-anchor="end">r (先端から)</text>
<text class="lbl" x="76" y="222" text-anchor="middle">先端の応力場</text></g>
</svg>
<p class="tb-caption">図: 自由表面のある縁き裂は 12 % 大きい。円板状の内部き裂 (半径 a) は Y = 2/π ≈ 0.64。有限幅・曲げ・穴縁では便覧の Y を使う</p>
<p>有限幅の板では、き裂が幅に対して大きくなると Y が増えます (中央き裂で 2a/W = 0.5 なら Y ≈ 1.19 程度)。表面の半楕円き裂は形状比で Y が変わるので、Newman–Raju の式などの便覧値を使います。<b>Y を一定とする手計算は、き裂が部材寸法より十分小さいときの近似</b>です。</p>

<h2>破壊靱性 K<sub>IC</sub> と限界き裂寸法</h2>
<p>K が材料の<b>破壊靱性</b> <span class="tb-m">K_{IC}</span> (平面ひずみ破壊靱性) に達すると、き裂は不安定に進展して破壊します。</p>
<div class="tb-math">K_I = Y\\sigma\\sqrt{\\pi a} = K_{IC} \\;\\Rightarrow\\; a_c = \\dfrac{1}{\\pi}\\left(\\dfrac{K_{IC}}{Y\\sigma}\\right)^2 \\qquad \\sigma_c = \\dfrac{K_{IC}}{Y\\sqrt{\\pi a}}</div>
<table class="tb-table">
<tr><th>材料 (代表的な目安)</th><th>K<sub>IC</sub> [MPa√m]</th><th>備考</th></tr>
<tr><td>構造用炭素鋼 (室温)</td><td>50〜150 以上</td><td>低温では急低下 (延性–脆性遷移)</td></tr>
<tr><td>高強度鋼 (調質、高硬度)</td><td>30〜80</td><td>強度を上げるほど低下する傾向</td></tr>
<tr><td>アルミ合金 (7075-T6 など)</td><td>20〜35</td><td>板厚方向・方位で異なる</td></tr>
<tr><td>鋳鉄 (片状黒鉛)</td><td>10〜20</td><td>脆性的</td></tr>
<tr><td>アルミナ・ガラス</td><td>1〜5</td><td>微小な傷で割れる</td></tr>
</table>
<p class="tb-caption">値は材料・熱処理・温度・試験方向で大きく変わる。設計にはその材料の試験値や規格値を使う</p>
<p>K<sub>IC</sub> は、き裂先端が<b>平面ひずみ</b>状態のときの下限値です。有効な値と認められる板厚の目安は <span class="tb-m">B \\ge 2.5(K_{IC}/\\sigma_Y)^2</span> (ASTM E399)。薄い板では見かけの靱性が高くなります。また、き裂先端には塑性域 (平面応力で半径 <span class="tb-m">r_p \\approx \\dfrac{1}{2\\pi}(K/\\sigma_Y)^2</span>) ができ、これが部材寸法に比べて十分小さいことが LEFM の適用条件です。延性の高い材料で塑性域が大きいときは、J 積分や CTOD による弾塑性破壊力学で評価します。</p>
<div class="tb-note"><b>計算例 (限界き裂寸法)</b>: 鋼板 (K<sub>IC</sub> = 50 MPa√m) に公称応力 σ = 200 MPa、表面の縁き裂 (Y = 1.12)。<br>
a<sub>c</sub> = (1/π) × (50 / (1.12 × 200))² = (1/π) × 0.2232² = 0.01586 m = <b>15.9 mm</b>。<br>
検査で検出できるき裂寸法 (例えば 2 mm) よりはるかに大きいので、静的な破壊には余裕があります。問題は次節の<b>疲労き裂の成長</b>です。</div>

<h2>疲労き裂進展 — パリス則</h2>
<p>繰返し荷重のもとでは、き裂は 1 サイクルごとに少しずつ進みます。応力拡大係数の変動幅 <span class="tb-m">\\Delta K = Y\\Delta\\sigma\\sqrt{\\pi a}</span> とき裂進展速度の関係を両対数で描くと、中間の領域で直線になります (<b>パリス則</b>)。</p>
<div class="tb-math">\\dfrac{da}{dN} = C\\,(\\Delta K)^m</div>
<p>下限には<b>下限界値</b> <span class="tb-m">\\Delta K_{th}</span> (これ以下ではほとんど進展しない、鋼で数 MPa√m 程度、応力比で変わる) があり、上限では <span class="tb-m">K_{\\max} \\to K_{IC}</span> で急加速します。Barsom がまとめたフェライト–パーライト鋼の代表値は <span class="tb-m">C = 6.9\\times 10^{-12}</span>、m = 3.0 (da/dN: m/cycle、ΔK: MPa√m) で、設計の目安としてよく引用されます。</p>
<p>Y を一定として変数分離で積分すると、初期き裂 <span class="tb-m">a_0</span> から限界き裂 <span class="tb-m">a_c</span> までの寿命は (m ≠ 2)</p>
<div class="tb-math">N_f = \\int_{a_0}^{a_c}\\dfrac{da}{C\\,(Y\\Delta\\sigma\\sqrt{\\pi a})^m} = \\dfrac{a_0^{\\,1-m/2} - a_c^{\\,1-m/2}}{C\\,(Y\\Delta\\sigma\\sqrt{\\pi})^m\\,(m/2-1)}</div>
<svg class="tb-chart" viewBox="0 0 520 250" role="img" aria-label="パリス則によるき裂長さとサイクル数の関係。初期き裂1 mmと2 mmで寿命が大きく異なる">
<text class="k-title" x="260" y="20" text-anchor="middle">き裂の成長曲線 (Δσ = 150 MPa、Y = 1.12、C = 6.9e-12、m = 3)</text>
<line class="grid" x1="60" y1="120" x2="470" y2="120"/><line class="grid" x1="60" y1="40" x2="470" y2="40"/>
<line class="axis" x1="60" y1="200" x2="470" y2="200"/><line class="axis" x1="60" y1="200" x2="60" y2="32"/>
<line class="k-hidden" x1="60" y1="37.6" x2="470" y2="37.6" style="stroke:var(--tb-bad)"/>
<text class="tick" x="72" y="54" style="fill:var(--tb-bad)">a_c = 40.6 mm (K_max = K_IC = 60)</text>
<path d="M60.0,196.0 L69.8,195.8 L79.5,195.6 L89.3,195.4 L99.0,195.2 L108.8,195.0 L118.5,194.8 L128.3,194.5 L138.0,194.2 L147.8,193.9 L157.6,193.6 L167.3,193.2 L177.1,192.8 L186.8,192.4 L196.6,192.0 L206.3,191.4 L216.1,190.9 L225.8,190.3 L235.6,189.6 L245.4,188.9 L255.1,188.0 L264.9,187.1 L274.6,186.1 L284.4,184.9 L294.1,183.6 L303.9,182.1 L313.7,180.4 L323.4,178.5 L333.2,176.2 L342.9,173.5 L352.7,170.4 L362.4,166.7 L372.2,162.3 L381.9,156.9 L391.7,150.2 L401.5,141.9 L411.2,131.3 L421.0,117.5 L430.7,99.1 L440.5,73.8 L450.2,37.6" style="fill:none;stroke:var(--tb-accent)" stroke-width="2.4"/>
<path d="M60.0,192.0 L66.4,191.7 L72.7,191.3 L79.1,191.0 L85.5,190.6 L91.8,190.2 L98.2,189.7 L104.6,189.3 L110.9,188.8 L117.3,188.2 L123.7,187.7 L130.0,187.1 L136.4,186.4 L142.8,185.7 L149.1,184.9 L155.5,184.1 L161.9,183.1 L168.2,182.1 L174.6,181.1 L181.0,179.9 L187.3,178.6 L193.7,177.1 L200.1,175.6 L206.4,173.8 L212.8,171.9 L219.2,169.7 L225.5,167.3 L231.9,164.5 L238.3,161.4 L244.6,157.9 L251.0,153.9 L257.4,149.2 L263.7,143.9 L270.1,137.6 L276.5,130.2 L282.8,121.5 L289.2,111.0 L295.6,98.2 L301.9,82.4 L308.3,62.7 L314.7,37.6" style="fill:none;stroke:var(--tb-bad)" stroke-width="2.4"/>
<text class="mark-t" x="240" y="118" text-anchor="end">a₀ = 2 mm</text><text class="tick" x="240" y="134" text-anchor="end">1.91 × 10⁵ 回</text>
<text class="mark-t" x="438" y="140">a₀ = 1 mm</text><text class="tick" x="438" y="156">2.93 × 10⁵ 回</text>
<text class="tick" x="60" y="216" text-anchor="middle">0</text><text class="tick" x="193" y="216" text-anchor="middle">1 × 10⁵</text><text class="tick" x="327" y="216" text-anchor="middle">2 × 10⁵</text><text class="tick" x="460" y="216" text-anchor="middle">3 × 10⁵</text>
<text class="tick" x="265" y="236" text-anchor="middle">繰返し数 N</text>
<text class="tick" x="54" y="204" text-anchor="end">0</text><text class="tick" x="54" y="124" text-anchor="end">20</text><text class="tick" x="54" y="44" text-anchor="end">40</text>
<text class="tick" x="22" y="120" text-anchor="middle" transform="rotate(-90 22 120)">き裂 a [mm]</text>
</svg>
<p class="tb-caption">図: 寿命の大半は、き裂が小さい段階で消費される。初期き裂の大きさ (検査の検出限界) が寿命を支配する</p>
<div class="tb-note"><b>計算例 (疲労き裂進展寿命)</b>: 鋼板の縁き裂 (Y = 1.12 一定と仮定、幅は十分大きい)、応力範囲 Δσ = 150 MPa (σ<sub>max</sub> = 150、σ<sub>min</sub> = 0)、K<sub>IC</sub> = 60 MPa√m、C = 6.9 × 10⁻¹²、m = 3、初期き裂 a<sub>0</sub> = 1 mm。<br>
① 限界き裂: a<sub>c</sub> = (1/π)(60/(1.12 × 150))² = <b>40.6 mm</b>。<br>
② 初期の ΔK = 1.12 × 150 × √(π × 0.001) = 9.4 MPa√m (下限界値を超えるので進展する)。<br>
③ 寿命: N = (0.001<sup>−0.5</sup> − 0.0406<sup>−0.5</sup>) / [6.9 × 10⁻¹² × (1.12 × 150 × √π)³ × 0.5] = (31.62 − 4.96) / (9.11 × 10⁻⁵) = <b>2.93 × 10⁵ 回</b> (数値積分でも同じ値)。<br>
初期き裂が 2 mm なら 1.91 × 10⁵ 回と <b>35 % 短く</b>なります。限界き裂寸法を 2 倍に誤っても寿命はほとんど変わりませんが (a<sub>c</sub><sup>−0.5</sup> の項は小さい)、初期き裂の見積もりは寿命を大きく変えます。</div>

<h2>設計への使い方 — 損傷許容設計</h2>
<p>破壊力学を使う設計 (<b>損傷許容設計</b>) では、① 製造時・検査で見逃しうる最大き裂 <span class="tb-m">a_0</span> を仮定し、② 使用中の応力範囲で <span class="tb-m">a_c</span> まで成長する寿命を求め、③ その寿命に余裕をもたせて<b>点検間隔</b> (例えば寿命の 1/2〜1/3) を決めます。航空機・圧力容器・クレーン・鉄道車両などで使われ、疲労の章の S–N 曲線による設計 (き裂が発生しない前提) を補います。溶接部の疲労評価がき裂進展の考え方に近いのも、溶接止端に初めから微小な欠陥があるためです。</p>

<h2>よくある失敗</h2>
<ul>
<li><b>a を mm のまま代入する</b>: MPa√m 単位では a は m で代入します。mm で入れると K が √1000 ≈ 31.6 倍になります。</li>
<li><b>中央き裂の a を全長で取る</b>: 中央き裂は全長 2a、K の式に入るのは<b>半長</b> a です。縁き裂は深さ a。</li>
<li><b>低温での靱性低下を見落とす</b>: 鋼は延性–脆性遷移温度以下で K<sub>IC</sub> が数分の 1 になります。屋外・冷凍設備・寒冷地輸送で問題になります。</li>
<li><b>Y を一定としたまま大きなき裂まで計算する</b>: き裂が板幅の 1 割を超えるあたりから Y が増え、寿命を過大に見積もります。</li>
<li><b>平均応力 (応力比 R) の影響を無視する</b>: 同じ ΔK でも R が大きいと進展が速く、下限界値も下がります。</li>
</ul>
`,
    points: [
      "き裂先端の応力は K/√(2πr) の特異性をもち、強さは応力拡大係数 K = Yσ√(πa) に集約される。",
      "K が破壊靱性 K_IC に達すると不安定破壊。限界き裂 a_c = (1/π)(K_IC/Yσ)²、限界応力 σ_c = K_IC/(Y√(πa))。",
      "K_IC は平面ひずみの下限値で、温度・熱処理・板厚・方向で変わる。高強度鋼ほど低い傾向。",
      "疲労き裂はパリス則 da/dN = C(ΔK)^m で進み、寿命は初期き裂の大きさに強く依存する。",
      "損傷許容設計: 検出限界のき裂から限界き裂までの寿命を求め、点検間隔を決める。",
    ],
    exercises: [
      {
        q: "幅の広い鋼板に全長 10 mm の中央き裂があり、公称応力 150 MPa が作用しています。応力拡大係数を求めなさい。",
        a: "半長 a = 5 mm = 0.005 m、Y = 1。K = 150 × √(π × 0.005) = 150 × 0.1253 = <b>18.8 MPa√m</b>。",
      },
      {
        q: "K<sub>IC</sub> = 50 MPa√m の高強度鋼部品に深さ 3 mm の縁き裂 (Y = 1.12) があります。破壊応力を求めなさい。",
        a: "σ<sub>c</sub> = 50 / (1.12 × √(π × 0.003)) = 50 / (1.12 × 0.0971) = <b>460 MPa</b>。降伏応力がこれより高い材料では、降伏する前に脆性的に割れる可能性があります。",
      },
      {
        q: "パリス則の指数 m = 3 のとき、応力範囲 Δσ を 2 倍にすると疲労き裂進展寿命は何倍になりますか (限界き裂寸法の変化は無視)。",
        a: "N ∝ 1/(Δσ)^m なので 1/2³ = <b>1/8</b>。応力範囲の小さな違いが寿命に大きく効きます (実際には a<sub>c</sub> も小さくなるのでさらに短くなります)。",
      },
      {
        q: "K<sub>IC</sub> = 60 MPa√m、降伏応力 800 MPa の鋼で、平面ひずみの有効な K<sub>IC</sub> 試験に必要な板厚の目安と、K = K<sub>IC</sub> のときの塑性域寸法 (平面応力の式) を求めなさい。",
        a: "B ≥ 2.5 × (60/800)² = 2.5 × 0.005625 = 0.0141 m = <b>14 mm</b>。r<sub>p</sub> = (1/2π)(60/800)² = 0.000895 m ≈ <b>0.9 mm</b>。",
      },
    ],
    quiz: [
      { q: "応力拡大係数 K の単位として一般的なのは?", choices: ["MPa√m", "MPa", "MPa/m"], answer: 0, explain: "K = Yσ√(πa) なので応力 × 長さの平方根の次元です。a は m で代入します。" },
      { q: "中央き裂 (全長 2a) と同じ深さ a の縁き裂を比べると?", choices: ["縁き裂の方が Y が約 12 % 大きい", "同じ", "中央き裂の方が危険"], answer: 0, explain: "自由表面の影響で縁き裂は Y ≈ 1.12 です (中央き裂は半長 a で Y = 1)。" },
      { q: "疲労き裂進展寿命に最も強く影響するのは?", choices: ["初期き裂の大きさ", "限界き裂の大きさ", "部品の色"], answer: 0, explain: "寿命の大半はき裂が小さいうちに消費されるため、a₀ が支配的です。" },
      { q: "鋼の破壊靱性について正しいのは?", choices: ["低温で大きく低下することがある", "温度に無関係", "強度を上げるほど必ず高くなる"], answer: 0, explain: "延性–脆性遷移温度以下では K_IC が急低下します。また高強度化で靱性が下がる傾向があります。" },
    ],
  },
  // ------------------------------------------------------------------ 7
  {
    id: "lagrange-mechanics",
    part: "mechanics",
    title: "解析力学入門 — ラグランジュの運動方程式",
    minutes: 26,
    level: 3,
    lead: "ニュートンの運動方程式は、物体ごとに力の図を描き、拘束力 (糸の張力・軸受の反力) まで含めて連立させる必要があります。ラグランジュの方法は、系の運動エネルギー T と位置エネルギー V を一般化座標で書くだけで、拘束力を消去した運動方程式を機械的に導きます。この章では一般化座標、ダランベールの原理からの導出、振り子・ばね–質量・台車–振り子の例を一歩ずつたどります。",
    body: `
<h2>一般化座標と自由度</h2>
<p>系の配置を完全に決めるのに必要な、互いに独立な変数の数が<b>自由度</b>です。その変数として、デカルト座標にこだわらず、角度や長さなど都合のよいものを選んだのが<b>一般化座標</b> <span class="tb-m">q_1, q_2, \\dots, q_n</span> です。</p>
<ul>
<li>単振り子: 質点の (x, y) は 2 変数ですが、糸の長さ一定 <span class="tb-m">x^2 + y^2 = l^2</span> という拘束があるので自由度 1。一般化座標は振れ角 θ。</li>
<li>台車の上の振り子: 台車の位置 x と振れ角 θ の 2 自由度。</li>
<li>平面内の剛体: 重心の位置 2 つと回転角 1 つの 3 自由度。</li>
</ul>
<p>拘束が「座標の間の等式」で書けるもの (<b>ホロノミック拘束</b>) なら、一般化座標を選ぶことで拘束条件は自動的に満たされ、拘束力は運動方程式に現れません。</p>

<h2>ダランベールの原理から導く</h2>
<p>質点 i (質量 <span class="tb-m">m_i</span>、位置 <span class="tb-m">\\boldsymbol r_i</span>) に作用する力を、与えられた力 <span class="tb-m">\\boldsymbol F_i</span> と拘束力 <span class="tb-m">\\boldsymbol R_i</span> に分けます。ニュートンの法則 <span class="tb-m">\\boldsymbol F_i + \\boldsymbol R_i - m_i\\ddot{\\boldsymbol r}_i = 0</span> に、拘束と矛盾しない<b>仮想変位</b> <span class="tb-m">\\delta\\boldsymbol r_i</span> を内積して足し合わせます。滑らかな拘束の拘束力は仮想変位に垂直で仕事をしないので (<span class="tb-m">\\sum \\boldsymbol R_i\\cdot\\delta\\boldsymbol r_i = 0</span>)、</p>
<div class="tb-math">\\sum_i \\left(\\boldsymbol F_i - m_i\\ddot{\\boldsymbol r}_i\\right)\\cdot\\delta\\boldsymbol r_i = 0 \\qquad (\\text{ダランベールの原理})</div>
<p><b>ステップ 1 — 仮想変位を一般化座標で書く</b>: <span class="tb-m">\\boldsymbol r_i = \\boldsymbol r_i(q_1,\\dots,q_n,t)</span> なので <span class="tb-m">\\delta\\boldsymbol r_i = \\sum_k \\dfrac{\\partial \\boldsymbol r_i}{\\partial q_k}\\delta q_k</span>。</p>
<p><b>ステップ 2 — 与えられた力の項</b>: <span class="tb-m">\\sum_i \\boldsymbol F_i\\cdot\\delta\\boldsymbol r_i = \\sum_k Q_k\\,\\delta q_k</span>、ここで <span class="tb-m">Q_k = \\sum_i \\boldsymbol F_i\\cdot\\dfrac{\\partial\\boldsymbol r_i}{\\partial q_k}</span> を<b>一般化力</b>と呼びます。力が位置エネルギーから導かれる (保存力) なら <span class="tb-m">Q_k = -\\partial V/\\partial q_k</span>。</p>
<p><b>ステップ 3 — 慣性力の項</b>: 速度 <span class="tb-m">\\dot{\\boldsymbol r}_i = \\sum_k \\dfrac{\\partial\\boldsymbol r_i}{\\partial q_k}\\dot q_k + \\dfrac{\\partial\\boldsymbol r_i}{\\partial t}</span> から、2 つの恒等式</p>
<div class="tb-math">\\dfrac{\\partial\\dot{\\boldsymbol r}_i}{\\partial\\dot q_k} = \\dfrac{\\partial\\boldsymbol r_i}{\\partial q_k} \\qquad \\dfrac{d}{dt}\\left(\\dfrac{\\partial\\boldsymbol r_i}{\\partial q_k}\\right) = \\dfrac{\\partial\\dot{\\boldsymbol r}_i}{\\partial q_k}</div>
<p>が成り立ちます。これを使い、積の微分を逆にたどると、<span class="tb-m">T = \\sum \\tfrac{1}{2}m_i\\dot{\\boldsymbol r}_i^2</span> として</p>
<div class="tb-math">\\begin{aligned}\\sum_i m_i\\ddot{\\boldsymbol r}_i\\cdot\\dfrac{\\partial\\boldsymbol r_i}{\\partial q_k}
&amp;=\\dfrac{d}{dt}\\left(\\sum_i m_i\\dot{\\boldsymbol r}_i\\cdot\\dfrac{\\partial\\dot{\\boldsymbol r}_i}{\\partial\\dot q_k}\\right) - \\sum_i m_i\\dot{\\boldsymbol r}_i\\cdot\\dfrac{\\partial\\dot{\\boldsymbol r}_i}{\\partial q_k} \\\\
&amp;= \\dfrac{d}{dt}\\dfrac{\\partial T}{\\partial\\dot q_k} - \\dfrac{\\partial T}{\\partial q_k}\\end{aligned}</div>
<p><b>ステップ 4 — まとめる</b>: <span class="tb-m">\\sum_k\\left[Q_k - \\dfrac{d}{dt}\\dfrac{\\partial T}{\\partial\\dot q_k} + \\dfrac{\\partial T}{\\partial q_k}\\right]\\delta q_k = 0</span>。<span class="tb-m">\\delta q_k</span> は互いに独立に選べるので、括弧の中は k ごとに 0 です。保存力を V にまとめ、<b>ラグランジアン</b> <span class="tb-m">L = T - V</span> を定義すると</p>
<div class="tb-math">\\dfrac{d}{dt}\\left(\\dfrac{\\partial L}{\\partial\\dot q_k}\\right) - \\dfrac{\\partial L}{\\partial q_k} = Q_k^{\\text{nc}} \\qquad (k = 1,\\dots,n)</div>
<p>右辺の <span class="tb-m">Q_k^{\\text{nc}}</span> は V に含めなかった力 (駆動力・摩擦・減衰など) の一般化力です。これが<b>ラグランジュの運動方程式</b>で、変分原理 (ハミルトンの原理 <span class="tb-m">\\delta\\int L\\,dt = 0</span>) からも同じ式が得られます。</p>
<div class="tb-tip"><b>手順のまとめ</b>: ① 一般化座標を選ぶ → ② 各質点 (剛体は重心と回転) の速度を q, q̇ で表して T を書く → ③ V を書く → ④ L = T − V → ⑤ 各 q について偏微分・時間微分 → ⑥ 非保存力の Q を仮想仕事から求める。</div>

<h2>例 1 — 単振り子</h2>
<svg class="tb-chart" viewBox="0 0 520 240" role="img" aria-label="単振り子とばね質量系。振れ角θ、糸の長さl、重力mg、変位x、ばね定数k">
<rect class="k-panel" x="8" y="10" width="246" height="220" rx="8"/><rect class="k-panel" x="266" y="10" width="246" height="220" rx="8"/>
<text class="k-title" x="131" y="32" text-anchor="middle">単振り子 (q = θ)</text>
<rect class="k-ground" x="80" y="40" width="100" height="10"/><line class="k-edge" x1="80" y1="50" x2="180" y2="50"/>
<circle cx="130" cy="50" r="4" style="fill:var(--tb-surface);stroke:var(--k-line)" stroke-width="1.6"/>
<line class="k-center" x1="130" y1="50" x2="130" y2="200"/>
<line x1="130" y1="50" x2="190" y2="164" style="stroke:var(--k-line)" stroke-width="2"/>
<circle class="k-sphere" cx="190" cy="164" r="14"/>
<path class="k-edge" d="M130,95 A45,45 0 0 0 151,90" stroke-width="1.2"/><text class="lbl" x="140" y="112">θ</text>
<text class="lbl" x="170" y="104">l</text>
<line class="k-force" x1="190" y1="180" x2="190" y2="218"/><text class="lbl" x="198" y="214">mg</text>
<path class="k-move" d="M200,140 Q214,152 212,170" stroke-width="1.6"/><text class="tick" x="198" y="130">v = lθ̇</text>
<line class="k-hidden" x1="130" y1="164" x2="190" y2="164"/>
<text class="tick" x="40" y="168">高さ −l cosθ</text>
<text class="k-title" x="389" y="32" text-anchor="middle">ばね–質量 (q = x)</text>
<rect class="k-ground" x="282" y="70" width="10" height="90"/><line class="k-edge" x1="292" y1="70" x2="292" y2="160"/>
<path d="M292,115 L304,115 L310,103 L322,127 L334,103 L346,127 L358,103 L364,115 L380,115" style="fill:none;stroke:var(--k-line)" stroke-width="1.8"/>
<rect class="k-part" x="380" y="92" width="56" height="46" rx="4"/><text class="lbl" x="408" y="120" text-anchor="middle">m</text>
<circle class="k-sphere" cx="392" cy="144" r="6"/><circle class="k-sphere" cx="424" cy="144" r="6"/>
<rect class="k-ground" x="292" y="150" width="200" height="10"/><line class="k-edge" x1="292" y1="150" x2="492" y2="150"/>
<text class="tick" x="334" y="96" text-anchor="middle">k</text>
<line class="k-move" x1="408" y1="80" x2="460" y2="80"/><text class="lbl" x="466" y="84">x</text>
<text class="tick" x="389" y="186" text-anchor="middle">T = ½mẋ²、V = ½kx²</text>
<text class="tick" x="389" y="206" text-anchor="middle">→ mẍ + kx = 0</text>
</svg>
<p class="tb-caption">図: 振り子では糸の張力は仕事をしないので、T と V を θ で書くだけで張力を含まない式が得られる</p>
<p>質点の位置 <span class="tb-m">(l\\sin\\theta,\\ -l\\cos\\theta)</span>、速さ <span class="tb-m">l\\dot\\theta</span>。基準を支点の高さに取ると</p>
<div class="tb-math">\\begin{aligned}
T &amp;= \\tfrac{1}{2}m l^2\\dot\\theta^2, \\qquad V = -mgl\\cos\\theta, \\qquad L = \\tfrac{1}{2}ml^2\\dot\\theta^2 + mgl\\cos\\theta \\\\
\\dfrac{\\partial L}{\\partial\\dot\\theta} &amp;= ml^2\\dot\\theta, \\qquad \\dfrac{d}{dt}\\dfrac{\\partial L}{\\partial\\dot\\theta} = ml^2\\ddot\\theta, \\qquad \\dfrac{\\partial L}{\\partial\\theta} = -mgl\\sin\\theta \\\\
&amp;\\Rightarrow\\; ml^2\\ddot\\theta + mgl\\sin\\theta = 0 \\;\\Rightarrow\\; \\ddot\\theta + \\dfrac{g}{l}\\sin\\theta = 0
\\end{aligned}</div>
<p>小振幅 (<span class="tb-m">\\sin\\theta\\approx\\theta</span>) では単振動で、周期 <span class="tb-m">T_p = 2\\pi\\sqrt{l/g}</span>。l = 0.5 m なら <span class="tb-m">2\\pi\\sqrt{0.5/9.81}</span> = <b>1.42 s</b> です。ばね–質量系も同じ手順で <span class="tb-m">m\\ddot x + kx = 0</span> になります。</p>

<h2>例 2 — 台車の上の振り子 (2 自由度)</h2>
<p>水平に動ける台車 (質量 M、位置 x、駆動力 F) にピンで振り子 (質点 m、長さ l、振れ角 θ) を吊ります。クレーンの荷振れ・倒立振子の制御・搬送ロボットのワーク揺れのモデルです。</p>
<svg class="tb-chart" viewBox="0 0 520 240" role="img" aria-label="レール上の台車に吊られた振り子。台車位置x、振れ角θ、駆動力F、質点の速度成分">
<text class="k-title" x="260" y="20" text-anchor="middle">台車–振り子系 (q₁ = x、q₂ = θ)</text>
<rect class="k-ground" x="40" y="96" width="440" height="10"/><line class="k-edge" x1="40" y1="96" x2="480" y2="96"/>
<rect class="k-part" x="170" y="52" width="110" height="36" rx="5"/>
<circle class="k-rubber" cx="192" cy="90" r="7"/><circle class="k-rubber" cx="258" cy="90" r="7"/>
<text class="lbl" x="225" y="75" text-anchor="middle">M</text>
<circle cx="225" cy="88" r="4" style="fill:var(--tb-surface);stroke:var(--k-line)" stroke-width="1.6"/>
<line class="k-force" x1="110" y1="70" x2="164" y2="70"/><text class="lbl" x="104" y="74" text-anchor="end">F</text>
<line class="k-center" x1="225" y1="88" x2="225" y2="228"/>
<line x1="225" y1="88" x2="290" y2="196" style="stroke:var(--k-line)" stroke-width="2"/>
<circle class="k-sphere" cx="290" cy="196" r="14"/><text class="lbl" x="312" y="200">m</text>
<path class="k-edge" d="M225,130 A42,42 0 0 0 247,124" stroke-width="1.2"/><text class="lbl" x="232" y="148">θ</text>
<text class="lbl" x="266" y="136">l</text>
<line class="k-dimline" x1="40" y1="40" x2="225" y2="40"/><line class="k-ext" x1="225" y1="36" x2="225" y2="50"/><line class="k-ext" x1="40" y1="34" x2="40" y2="96"/>
<text class="k-dimtext" x="132" y="34" text-anchor="middle">x</text>
<line class="k-move" x1="290" y1="216" x2="338" y2="216"/><text class="tick" x="344" y="220">ẋ + lθ̇cosθ</text>
<line class="k-move" x1="306" y1="196" x2="306" y2="170"/><text class="tick" x="312" y="168">lθ̇sinθ</text>
<text class="k-note" x="380" y="70">質点の位置</text>
<text class="k-note" x="380" y="86">(x + l sinθ, −l cosθ)</text>
</svg>
<p class="tb-caption">図: 質点の速度は台車の速度と振り子の回転による速度のベクトル和。T にこの 2 つの「交差項」が現れる</p>
<div class="tb-math">\\begin{aligned}
T &amp;= \\tfrac{1}{2}M\\dot x^2 + \\tfrac{1}{2}m\\left[(\\dot x + l\\dot\\theta\\cos\\theta)^2 + (l\\dot\\theta\\sin\\theta)^2\\right] \\\\
&amp;= \\tfrac{1}{2}(M+m)\\dot x^2 + ml\\dot x\\dot\\theta\\cos\\theta + \\tfrac{1}{2}ml^2\\dot\\theta^2 \\\\
V &amp;= -mgl\\cos\\theta
\\end{aligned}</div>
<p>駆動力 F の一般化力は、仮想変位 δx で仕事 Fδx、δθ で仕事 0 なので <span class="tb-m">Q_x = F,\\ Q_\\theta = 0</span>。偏微分を順に計算すると</p>
<div class="tb-math">\\begin{aligned}
x:&amp;\\quad (M+m)\\ddot x + ml\\ddot\\theta\\cos\\theta - ml\\dot\\theta^2\\sin\\theta = F \\\\
\\theta:&amp;\\quad ml\\ddot x\\cos\\theta + ml^2\\ddot\\theta + mgl\\sin\\theta = 0
\\end{aligned}</div>
<p>(θ の式で <span class="tb-m">\\partial L/\\partial\\theta = -ml\\dot x\\dot\\theta\\sin\\theta - mgl\\sin\\theta</span> と、<span class="tb-m">\\frac{d}{dt}(ml\\dot x\\cos\\theta)</span> から出る <span class="tb-m">-ml\\dot x\\dot\\theta\\sin\\theta</span> が打ち消し合います。) <span class="tb-m">ml\\dot\\theta^2\\sin\\theta</span> は振り子の遠心力が台車を引く項、<span class="tb-m">ml\\ddot x\\cos\\theta</span> は台車の加速が振り子を振らせる慣性力の項です。ニュートン法なら台車と振り子に分けてピンの反力を消去する必要がありますが、ここでは一度も反力が出てきません。</p>
<p><b>保存量</b>: F = 0 のとき L は x を含まない (<b>循環座標</b>) ので、<span class="tb-m">p_x = \\partial L/\\partial\\dot x = (M+m)\\dot x + ml\\dot\\theta\\cos\\theta</span> = 一定 (水平方向の運動量保存) が直ちに分かります。</p>
<div class="tb-note"><b>計算例</b>: M = 2 kg、m = 0.5 kg、l = 0.4 m、F = 0 で台車が自由に動ける場合の小振幅振動数。<br>
線形化 (cos θ ≈ 1、sin θ ≈ θ、θ̇² ≈ 0) して x の式から ẍ = −mlθ̈/(M + m) を θ の式に代入すると <span class="tb-m">\\dfrac{Ml}{M+m}\\ddot\\theta + g\\theta = 0</span>、すなわち <span class="tb-m">\\omega^2 = \\dfrac{(M+m)g}{Ml}</span>。<br>
ω = √(2.5 × 9.81 / (2 × 0.4)) = <b>5.54 rad/s (0.881 Hz)</b>。台車を固定した場合の √(g/l) = 4.95 rad/s (0.788 Hz) より高くなります。台車が逆向きに動いて、振り子の実効的な長さが短くなるためです。</div>

<h2>よくある失敗</h2>
<ul>
<li><b>速度の合成を忘れて T を書く</b>: 動く台車に付いた物体の速度は、台車の速度とのベクトル和です。交差項 <span class="tb-m">ml\\dot x\\dot\\theta\\cos\\theta</span> を落とすと連成が消えます。</li>
<li><b>V の符号・基準を混同する</b>: 基準はどこでもよいが、高さが上がるほど V が増えるように書きます。</li>
<li><b>非保存力を V に入れようとする</b>: 駆動力・摩擦・減衰は右辺の一般化力 Q (仮想仕事 Σ Q δq) で入れます。</li>
<li><b>時間微分と偏微分の順序を誤る</b>: まず ∂L/∂q̇ を q, q̇ の関数として求め、それを時間で全微分します (q も q̇ も時間の関数)。</li>
<li><b>線形化の前に式を簡略化する</b>: 先に完全な非線形方程式を導き、そのあと平衡点まわりで線形化します。</li>
</ul>
`,
    points: [
      "一般化座標は系の配置を決める独立な変数。ホロノミック拘束なら拘束力は運動方程式から消える。",
      "ダランベールの原理 Σ(F − m r̈)·δr = 0 から、d/dt(∂L/∂q̇) − ∂L/∂q = Q^nc (L = T − V) が導かれる。",
      "手順: 座標を選ぶ → T と V を q, q̇ で書く → 偏微分と時間微分 → 非保存力は仮想仕事で一般化力に。",
      "単振り子 θ̈ + (g/l)sinθ = 0。台車–振り子では交差項 ml ẋ θ̇ cosθ が台車と振り子の連成を表す。",
      "L に含まれない座標 (循環座標) に対応する一般化運動量は保存される。",
    ],
    exercises: [
      {
        q: "鉛直につるしたばね (k = 1.0 × 10⁵ N/m) に質量 m = 3 kg をつけた系で、ばねの自然長からの下向き変位を x とします。ラグランジュ方程式を導き、静的なたわみと固有振動数を求めなさい。",
        a: "T = ½mẋ²、V = ½kx² − mgx (下向きを正)。L = ½mẋ² − ½kx² + mgx → <b>mẍ + kx = mg</b>。静的たわみ x<sub>s</sub> = mg/k = 3 × 9.81/10⁵ = <b>0.294 mm</b>。x = x<sub>s</sub> + u とおくと mü + ku = 0 で、f = (1/2π)√(k/m) = <b>29.1 Hz</b>。重力はつり合い位置を変えるだけで振動数には影響しません。",
      },
      {
        q: "質量 m、半径 r の一様な円板が傾斜角 30° の斜面を滑らずに転がります。斜面に沿った位置 s を一般化座標としてラグランジュ方程式を立て、加速度を求めなさい。",
        a: "滑らないので回転角速度 ṡ/r。T = ½mṡ² + ½(½mr²)(ṡ/r)² = ¾mṡ²、V = −mgs sin 30°。(3/2)m s̈ − mg sin 30° = 0 → s̈ = (2/3) g sin 30° = <b>3.27 m/s²</b>。摩擦力は仕事をしない拘束力なので現れません。",
      },
      {
        q: "長さ 1 m の単振り子の小振幅周期を求めなさい。また台車–振り子系で M → ∞ とすると本文の振動数の式はどうなりますか。",
        a: "T<sub>p</sub> = 2π√(1/9.81) = <b>2.01 s</b>。ω² = (M + m)g/(Ml) → M → ∞ で <b>ω² = g/l</b>。台車が動かない (固定) 場合の単振り子に一致します。",
      },
    ],
    quiz: [
      { q: "ラグランジアン L の定義は?", choices: ["T − V", "T + V", "V − T"], answer: 0, explain: "運動エネルギーから位置エネルギーを引いたものです。T + V は全エネルギー (ハミルトニアンに相当する場合が多い) です。" },
      { q: "ラグランジュ方程式で糸の張力やピンの反力が現れない理由は?", choices: ["滑らかな拘束の拘束力は仮想変位に対して仕事をしないから", "拘束力が常にゼロだから", "質量を無視しているから"], answer: 0, explain: "拘束と矛盾しない仮想変位に対して、滑らかな拘束力の仕事は 0 なので、ダランベールの原理から消えます。" },
      { q: "モーターの駆動力や粘性減衰はラグランジュ方程式のどこに入れる?", choices: ["右辺の一般化力 Q (仮想仕事から求める)", "位置エネルギー V", "運動エネルギー T"], answer: 0, explain: "非保存力は仮想仕事 ΣQδq から一般化力として右辺に入れます (減衰はレイリーの散逸関数でも扱える)。" },
      { q: "L が座標 x を含まないとき、成り立つことは?", choices: ["∂L/∂ẋ (一般化運動量) が保存される", "x が一定になる", "ẋ がゼロになる"], answer: 0, explain: "d/dt(∂L/∂ẋ) = ∂L/∂x = 0 なので、対応する一般化運動量が保存されます (循環座標)。" },
    ],
  },
  // ------------------------------------------------------------------ 8
  {
    id: "lagrange-machines",
    part: "mechanics",
    title: "ラグランジュ方程式で機械を解く — 多自由度系・回転体・拘束",
    minutes: 26,
    level: 3,
    lead: "前章のラグランジュの方法は、実際の機械でこそ威力を発揮します。この章では、2 自由度のばね–質量系から質量行列・剛性行列を組み立てて固有振動数とモードを求め、歯車やボールねじを含む駆動系の換算慣性を運動エネルギーの等価から導きます。さらに減衰をレイリーの散逸関数で、拘束をラグランジュの未定乗数で扱う方法を学び、FEM のモード解析とのつながりを確認します。",
    body: `
<h2>多自由度系 — T と V から行列が出てくる</h2>
<p>変位が小さい線形系では、運動エネルギーは速度の 2 次形式、位置エネルギーは変位の 2 次形式になります。</p>
<div class="tb-math">T = \\tfrac{1}{2}\\,\\dot{\\boldsymbol q}^{\\mathsf T}\\boldsymbol M\\,\\dot{\\boldsymbol q} \\qquad V = \\tfrac{1}{2}\\,\\boldsymbol q^{\\mathsf T}\\boldsymbol K\\,\\boldsymbol q
\\qquad\\Rightarrow\\qquad \\boldsymbol M\\ddot{\\boldsymbol q} + \\boldsymbol K\\boldsymbol q = \\boldsymbol Q</div>
<p>ラグランジュ方程式に入れると、<span class="tb-m">\\partial T/\\partial\\dot q_k</span> と <span class="tb-m">\\partial V/\\partial q_k</span> がそのまま行列とベクトルの積になります。<b>質量行列 M と剛性行列 K は、T と V の 2 次形式の係数</b>で、エネルギーから作るので必ず対称です。</p>

<h3>例 — 2 自由度のばね–質量系</h3>
<svg class="tb-chart" viewBox="0 0 520 250" role="img" aria-label="2自由度ばね質量系と2つの固有モード。1次は同相で振幅比1対2、2次は逆相で1対-1">
<text class="k-title" x="260" y="20" text-anchor="middle">2 自由度系と固有モード (m₁ = 10、m₂ = 5 kg、k₁ = 2k₂ = 2 × 10⁵ N/m)</text>
<rect class="k-ground" x="20" y="44" width="10" height="70"/><line class="k-edge" x1="30" y1="44" x2="30" y2="114"/>
<path d="M30,80 L44,80 L50,68 L62,92 L74,68 L86,92 L92,80 L110,80" style="fill:none;stroke:var(--k-line)" stroke-width="1.8"/>
<rect class="k-part" x="110" y="56" width="60" height="46" rx="4"/><text class="lbl" x="140" y="84" text-anchor="middle">m₁</text>
<path d="M170,80 L184,80 L190,68 L202,92 L214,68 L226,92 L232,80 L250,80" style="fill:none;stroke:var(--k-line)" stroke-width="1.8"/>
<rect class="k-part" x="250" y="60" width="50" height="40" rx="4"/><text class="lbl" x="275" y="85" text-anchor="middle">m₂</text>
<rect class="k-ground" x="30" y="108" width="300" height="8"/><line class="k-edge" x1="30" y1="108" x2="330" y2="108"/>
<circle class="k-sphere" cx="124" cy="104" r="4"/><circle class="k-sphere" cx="156" cy="104" r="4"/><circle class="k-sphere" cx="262" cy="104" r="4"/><circle class="k-sphere" cx="288" cy="104" r="4"/>
<text class="tick" x="68" y="62" text-anchor="middle">k₁</text><text class="tick" x="208" y="62" text-anchor="middle">k₂</text>
<line class="k-move" x1="140" y1="46" x2="180" y2="46"/><text class="lbl" x="184" y="50">x₁</text>
<line class="k-move" x1="275" y1="46" x2="315" y2="46"/><text class="lbl" x="319" y="50">x₂</text>
<rect class="k-panel" x="352" y="36" width="160" height="90" rx="8"/>
<text class="tick" x="432" y="56" text-anchor="middle">T = ½m₁ẋ₁² + ½m₂ẋ₂²</text>
<text class="tick" x="432" y="76" text-anchor="middle">V = ½k₁x₁² + ½k₂(x₂ − x₁)²</text>
<text class="tick" x="432" y="104" text-anchor="middle">→ M、K を読み取る</text>
<line class="axis" x1="60" y1="190" x2="250" y2="190"/><line class="axis" x1="300" y1="190" x2="490" y2="190"/>
<text class="lbl" x="155" y="146" text-anchor="middle">1 次 15.9 Hz (同相)</text><text class="lbl" x="395" y="146" text-anchor="middle">2 次 31.8 Hz (逆相)</text>
<line class="k-thin" x1="80" y1="190" x2="80" y2="190"/>
<g style="stroke:var(--tb-accent)" stroke-width="10" stroke-linecap="round"><line x1="110" y1="190" x2="110" y2="172"/><line x1="200" y1="190" x2="200" y2="154"/><line x1="350" y1="190" x2="350" y2="172"/><line x1="440" y1="190" x2="440" y2="208"/></g>
<polyline points="60,190 110,172 200,154" style="fill:none;stroke:var(--tb-accent)" stroke-dasharray="4 3"/>
<polyline points="300,190 350,172 440,208" style="fill:none;stroke:var(--tb-accent)" stroke-dasharray="4 3"/>
<text class="tick" x="110" y="208" text-anchor="middle">x₁: 1</text><text class="tick" x="200" y="208" text-anchor="middle">x₂: 2</text>
<text class="tick" x="350" y="208" text-anchor="middle">x₁: 1</text><text class="tick" x="440" y="226" text-anchor="middle">x₂: −1</text>
<text class="tick" x="60" y="208" text-anchor="middle">固定</text><text class="tick" x="300" y="208" text-anchor="middle">固定</text>
<circle cx="395" cy="190" r="3" style="fill:var(--tb-bad)"/><text class="tick" x="395" y="182" text-anchor="middle" style="fill:var(--tb-bad)">節</text>
</svg>
<p class="tb-caption">図: 1 次モードは 2 つの質量が同じ向きに 1 : 2 で、2 次モードは逆向きに 1 : −1 で振動する。2 次モードには動かない点 (節) がある</p>
<p>ばね <span class="tb-m">k_2</span> の伸びは <span class="tb-m">x_2 - x_1</span> です。V を展開して係数を読むと</p>
<div class="tb-math">\\boldsymbol M = \\begin{bmatrix} m_1 &amp; 0 \\\\ 0 &amp; m_2 \\end{bmatrix} \\qquad
\\boldsymbol K = \\begin{bmatrix} k_1 + k_2 &amp; -k_2 \\\\ -k_2 &amp; k_2 \\end{bmatrix}</div>
<p>自由振動を <span class="tb-m">\\boldsymbol q = \\boldsymbol\\phi\\,\\sin\\omega t</span> と置くと、<b>一般化固有値問題</b> <span class="tb-m">(\\boldsymbol K - \\omega^2\\boldsymbol M)\\boldsymbol\\phi = \\boldsymbol 0</span> になり、非自明解の条件 <span class="tb-m">\\det(\\boldsymbol K - \\omega^2\\boldsymbol M) = 0</span> から固有角振動数が決まります。</p>
<div class="tb-note"><b>計算例</b>: m₁ = 10 kg、m₂ = 5 kg、k₁ = 2 × 10⁵ N/m、k₂ = 1 × 10⁵ N/m。λ = ω² として<br>
det = (3 × 10⁵ − 10λ)(1 × 10⁵ − 5λ) − (1 × 10⁵)² = 50λ² − 2.5 × 10⁶ λ + 2 × 10¹⁰ = 0<br>
→ λ = 1 × 10⁴、4 × 10⁴ → <b>ω₁ = 100 rad/s (15.9 Hz)、ω₂ = 200 rad/s (31.8 Hz)</b>。<br>
モード: 1 行目 (3 × 10⁵ − 10λ)φ₁ = 10⁵ φ₂ より、λ₁ で φ₂/φ₁ = <b>2</b>、λ₂ で φ₂/φ₁ = <b>−1</b>。(numpy.linalg.eig で同じ結果。)<br>
2 つの質量を一体とみなした 1 自由度近似 √(k₁/(m₁ + m₂)) は 18.4 Hz で、1 次を 16 % 高く見積もります。</div>
<p>固有モードは質量行列に関して<b>直交</b>します (<span class="tb-m">\\boldsymbol\\phi_1^{\\mathsf T}\\boldsymbol M\\boldsymbol\\phi_2 = 0</span>)。そこでモードを並べた行列で座標変換 (<span class="tb-m">\\boldsymbol q = \\boldsymbol\\Phi\\boldsymbol\\eta</span>) すると、連立方程式が独立な 1 自由度系 <span class="tb-m">\\ddot\\eta_r + \\omega_r^2\\eta_r = \\dots</span> の集まりに分解されます。これが<b>モード解析</b>の基本で、FEM の固有値解析は、形状関数で作った大きな M と K に対して同じ計算をしています。</p>

<h2>回転体と換算慣性 — 運動エネルギーの等価</h2>
<p>モーター・歯車・ボールねじ・テーブルがつながった駆動系は、拘束 (歯数比・リード) によって 1 自由度です。モーターの回転角 <span class="tb-m">\\theta_m</span> を一般化座標に取り、各要素の速度を <span class="tb-m">\\dot\\theta_m</span> で表して運動エネルギーを足し合わせれば、<b>モーター軸に換算した慣性モーメント</b>が得られます。</p>
<svg class="tb-chart" viewBox="0 0 520 220" role="img" aria-label="モーター、カップリング、ボールねじ、テーブルの駆動系と、運動エネルギー等価によるモーター軸換算慣性">
<text class="k-title" x="260" y="20" text-anchor="middle">ボールねじ駆動系の換算慣性</text>
<rect class="k-ground" x="30" y="150" width="460" height="10"/><line class="k-edge" x1="30" y1="150" x2="490" y2="150"/>
<rect class="k-part" x="40" y="86" width="70" height="56" rx="6"/><rect class="k-alu" x="110" y="104" width="12" height="20"/>
<text class="tick" x="75" y="78" text-anchor="middle">モーター Jm</text>
<rect class="k-rubber" x="124" y="100" width="22" height="28" rx="4"/><text class="tick" x="135" y="92" text-anchor="middle">継手</text>
<rect class="k-part-h" x="146" y="108" width="300" height="12" rx="2"/>
<g class="k-thin"><line x1="160" y1="108" x2="166" y2="120"/><line x1="172" y1="108" x2="178" y2="120"/><line x1="184" y1="108" x2="190" y2="120"/><line x1="196" y1="108" x2="202" y2="120"/><line x1="208" y1="108" x2="214" y2="120"/><line x1="220" y1="108" x2="226" y2="120"/><line x1="232" y1="108" x2="238" y2="120"/><line x1="340" y1="108" x2="346" y2="120"/><line x1="352" y1="108" x2="358" y2="120"/><line x1="364" y1="108" x2="370" y2="120"/><line x1="376" y1="108" x2="382" y2="120"/><line x1="388" y1="108" x2="394" y2="120"/><line x1="400" y1="108" x2="406" y2="120"/><line x1="412" y1="108" x2="418" y2="120"/></g>
<rect class="k-part" x="446" y="96" width="24" height="36" rx="3"/><text class="tick" x="458" y="88" text-anchor="middle">軸受</text>
<rect class="k-alu" x="250" y="62" width="80" height="34" rx="4"/><rect class="k-part" x="270" y="96" width="40" height="36" rx="3"/>
<text class="tick" x="290" y="56" text-anchor="middle">テーブル m</text>
<line class="k-move" x1="336" y1="72" x2="380" y2="72"/><text class="tick" x="384" y="76">v = (p/2π)θ̇m</text>
<text class="tick" x="200" y="140" text-anchor="middle">ねじ軸 Js、リード p</text>
<path class="k-move" d="M70,130 A18,10 0 1 0 84,132" stroke-width="1.6"/><text class="tick" x="14" y="124">θ̇m</text>
<rect class="k-panel" x="60" y="170" width="400" height="40" rx="8"/>
<text class="tick" x="260" y="195" text-anchor="middle">½J_eq θ̇m² = ½(Jm + Jc + Js)θ̇m² + ½m(p/2π)²θ̇m²</text>
</svg>
<p class="tb-caption">図: 直線運動する質量 m は、ねじのリード p を介して m(p/2π)² の慣性モーメントに換算される</p>
<div class="tb-math">\\begin{aligned}
\\text{歯車 (減速比 } i = \\omega_m/\\omega_L\\text{)}:&amp;\\quad J_{eq} = J_m + J_1 + \\dfrac{J_2 + J_L}{i^2} \\\\
\\text{ボールねじ (リード } p\\text{)}:&amp;\\quad J_{eq} = J_m + J_c + J_s + m\\left(\\dfrac{p}{2\\pi}\\right)^2
\\end{aligned}</div>
<p>ラグランジュ方程式 <span class="tb-m">J_{eq}\\ddot\\theta_m = T_m - T_{\\text{負荷}}</span> がそのまま加減速トルクの式になります (負荷トルクも仮想仕事で同じくモーター軸に換算: 推力 F なら <span class="tb-m">Fp/(2\\pi\\eta)</span>)。減速比を大きくすると負荷側の慣性は <span class="tb-m">1/i^2</span> で効かなくなるので、サーボの<b>慣性モーメント比</b> (負荷換算慣性 / モーター慣性) を適正範囲 (メーカー推奨、目安として数倍〜10 倍程度以下) に収める設計ができます。</p>
<div class="tb-note"><b>計算例</b>: テーブル + ワーク m = 50 kg、リード p = 10 mm、ねじ軸 Ø20 × 500 mm (鋼、ρ = 7 850 kg/m³)、モーター J<sub>m</sub> = 1.0 × 10⁻⁴ kg·m² (継手は無視)。<br>
テーブルの換算: 50 × (0.01/2π)² = <b>1.27 × 10⁻⁴ kg·m²</b>。ねじ軸: J<sub>s</sub> = πρLd⁴/32 = π × 7 850 × 0.5 × 0.02⁴/32 = <b>6.17 × 10⁻⁵ kg·m²</b>。<br>
負荷合計 1.88 × 10⁻⁴、慣性モーメント比 <b>1.9</b>、J<sub>eq</sub> = 2.88 × 10⁻⁴ kg·m²。<br>
0.1 s で 3 000 min⁻¹ まで加速 (α = 3 000 × 2π/60/0.1 = 3 142 rad/s²) するのに必要なトルクは J<sub>eq</sub>α = <b>0.91 N·m</b> (摩擦・推力を除く)。</div>

<h2>減衰 — レイリーの散逸関数</h2>
<p>粘性減衰力 <span class="tb-m">-c\\dot x</span> は保存力ではないので V に入りません。各ダンパーの相対速度を <span class="tb-m">\\dot\\Delta_j</span> として<b>レイリーの散逸関数</b> <span class="tb-m">\\mathcal F = \\tfrac{1}{2}\\sum_j c_j\\dot\\Delta_j^2</span> を定義すると、減衰力の一般化力は <span class="tb-m">-\\partial\\mathcal F/\\partial\\dot q_k</span> になり</p>
<div class="tb-math">\\dfrac{d}{dt}\\dfrac{\\partial L}{\\partial\\dot q_k} - \\dfrac{\\partial L}{\\partial q_k} + \\dfrac{\\partial\\mathcal F}{\\partial\\dot q_k} = Q_k
\\qquad\\Rightarrow\\qquad \\boldsymbol M\\ddot{\\boldsymbol q} + \\boldsymbol C\\dot{\\boldsymbol q} + \\boldsymbol K\\boldsymbol q = \\boldsymbol Q</div>
<p>V から K を読むのと同じように、<span class="tb-m">\\mathcal F = \\tfrac12\\dot{\\boldsymbol q}^{\\mathsf T}\\boldsymbol C\\dot{\\boldsymbol q}</span> から減衰行列 C を読み取れます。<span class="tb-m">2\\mathcal F</span> は単位時間に熱として失われるエネルギーです。</p>

<h2>拘束の扱い — ラグランジュの未定乗数</h2>
<p>閉ループのリンク機構や、拘束力そのもの (軸受反力・ピン荷重) を知りたい場合は、独立でない座標を使い、拘束条件 <span class="tb-m">g(\\boldsymbol q) = 0</span> を<b>未定乗数</b> λ で組み込みます。</p>
<div class="tb-math">\\dfrac{d}{dt}\\dfrac{\\partial L}{\\partial\\dot q_k} - \\dfrac{\\partial L}{\\partial q_k} = Q_k + \\lambda\\,\\dfrac{\\partial g}{\\partial q_k} \\qquad g(\\boldsymbol q) = 0</div>
<p><span class="tb-m">\\lambda\\,\\partial g/\\partial q_k</span> が拘束力の一般化力です。例えば単振り子を (x, y) で書き、<span class="tb-m">g = x^2 + y^2 - l^2</span> とすると、<span class="tb-m">m\\ddot x = 2\\lambda x,\\ m\\ddot y = -mg + 2\\lambda y</span>。静止して真下 (x = 0、y = −l) にあるとき <span class="tb-m">\\lambda = -mg/(2l)</span>、糸の張力は <span class="tb-m">-2\\lambda l = mg</span> と、拘束力が答えとして出てきます。マルチボディ解析ソフトは、この形の方程式 (微分代数方程式) を数値的に解いています。</p>

<h2>よくある失敗</h2>
<ul>
<li><b>ばねの伸びを絶対変位で書く</b>: 質量間のばねは相対変位 x₂ − x₁ です。これを誤ると K の非対角項が消えます。</li>
<li><b>換算慣性で i を掛ける向きを逆にする</b>: 減速側の慣性はモーター軸に 1/i² で換算されます。速度の比を 2 乗して運動エネルギーで考えれば迷いません。</li>
<li><b>ボールねじ駆動でねじ軸の慣性を忘れる</b>: 長く太いねじ軸はテーブル以上の慣性をもつことがあります (J<sub>s</sub> ∝ L d⁴)。</li>
<li><b>1 自由度近似だけで固有振動数を判断する</b>: 支持の柔らかさや別の質量があると、1 次は低く、高次モードも現れます。</li>
<li><b>減衰行列を物理的根拠なしに作る</b>: 実構造の減衰は分布が不明なことが多く、モード減衰比を実測から与えるのが普通です。</li>
</ul>
`,
    points: [
      "線形系では T = ½q̇ᵀMq̇、V = ½qᵀKq。ラグランジュ方程式から Mq̈ + Kq = Q がそのまま得られ、M と K は対称。",
      "固有値問題 (K − ω²M)φ = 0。モードは M に関して直交し、モード座標で独立な 1 自由度系に分解できる (FEM のモード解析)。",
      "駆動系の換算慣性は運動エネルギーの等価から: 歯車は J_L/i²、ボールねじは m(p/2π)²。",
      "粘性減衰はレイリーの散逸関数 ℱ = ½Σcⱼ Δ̇ⱼ² を使い、+∂ℱ/∂q̇ の項で入れる。",
      "拘束は未定乗数 λ で組み込むと、拘束力 λ∂g/∂q が答えとして得られる。",
    ],
    exercises: [
      {
        q: "モーター J<sub>m</sub> = 2.0 × 10⁻⁴ kg·m² が減速比 i = 8 の歯車を介して慣性 J<sub>L</sub> = 0.8 kg·m² の回転テーブルを駆動します (歯車自体の慣性は無視)。モーター軸換算の全慣性と慣性モーメント比を求めなさい。",
        a: "J<sub>L</sub>/i² = 0.8/64 = 0.0125 kg·m²。J<sub>eq</sub> = 0.0002 + 0.0125 = <b>0.0127 kg·m²</b>。慣性モーメント比 = 0.0125/0.0002 = <b>62.5</b>。一般的なサーボの推奨範囲を大きく超えるので、減速比を上げる、慣性の大きいモーターを選ぶ、などを検討します。",
      },
      {
        q: "質量 30 kg のテーブルをリード 5 mm のボールねじで駆動します。テーブルのモーター軸換算慣性を求めなさい。",
        a: "J = m(p/2π)² = 30 × (0.005/2π)² = 30 × 6.33 × 10⁻⁷ = <b>1.90 × 10⁻⁵ kg·m²</b>。リードを 10 mm にすると 4 倍になります。",
      },
      {
        q: "本文の 2 自由度系で、求めた 2 つのモード φ₁ = (1, 2)、φ₂ = (1, −1) が質量行列に関して直交していることを確かめなさい。また K に関する直交も確かめなさい。",
        a: "φ₁ᵀMφ₂ = 10 × 1 × 1 + 5 × 2 × (−1) = <b>0</b>。Kφ₂ = (3 × 10⁵ + 10⁵, −10⁵ − 10⁵) = (4 × 10⁵, −2 × 10⁵)、φ₁ᵀKφ₂ = 4 × 10⁵ − 4 × 10⁵ = <b>0</b>。",
      },
      {
        q: "本文の 2 自由度系で、m₁ と m₂ の間に (ばね k₂ と並列に) ダンパー c を入れました。レイリーの散逸関数から減衰行列 C を求めなさい。",
        a: "ℱ = ½c(ẋ₂ − ẋ₁)² = ½c(ẋ₁² − 2ẋ₁ẋ₂ + ẋ₂²)。∂ℱ/∂ẋ₁ = c(ẋ₁ − ẋ₂)、∂ℱ/∂ẋ₂ = c(ẋ₂ − ẋ₁) より <b>C = [[c, −c], [−c, c]]</b>。k₂ による K の部分と同じ形です。",
      },
    ],
    quiz: [
      { q: "質量行列・剛性行列が対称になる理由は?", choices: ["運動エネルギー・位置エネルギーの 2 次形式の係数だから", "質量が正だから", "対称な構造しか扱わないから"], answer: 0, explain: "スカラーの 2 次形式は対称行列で表せます。エネルギーから導くので必ず対称になります。" },
      { q: "減速比 i の歯車を介した負荷慣性 J_L のモーター軸換算値は?", choices: ["J_L / i²", "J_L / i", "J_L × i²"], answer: 0, explain: "負荷の角速度はモーターの 1/i なので、運動エネルギーの等価から J_L/i² になります。" },
      { q: "ボールねじで駆動される質量 m のモーター軸換算慣性は (リード p)?", choices: ["m (p/2π)²", "m p²", "m (2π/p)²"], answer: 0, explain: "テーブル速度 v = (p/2π)θ̇ を ½mv² に代入すると得られます。" },
      { q: "ラグランジュの未定乗数法の利点は?", choices: ["拘束力を求められ、閉ループ機構も扱える", "自由度が増えない", "必ず解析解が得られる"], answer: 0, explain: "拘束力が λ∂g/∂q として現れます。代わりに未知数は増え、微分代数方程式になります。" },
    ],
  },
  // ------------------------------------------------------------------ 9
  {
    id: "rigid-body-dynamics",
    part: "mechanics",
    title: "剛体の動力学 — 慣性モーメント・回転の運動方程式・ジャイロ",
    minutes: 24,
    level: 2,
    lead: "回転テーブル・スピンドル・フライホイール・ロボットアームなど、機械の多くは回転する剛体です。この章では、質量の慣性モーメントと平行軸の定理、固定軸まわりと平面運動の運動方程式、3 次元回転のオイラーの運動方程式の概要、ジャイロモーメント、回転体の不釣合いと釣合い良さ (バランス等級) の考え方を学び、回転テーブルの起動トルクを計算します。",
    body: `
<h2>質量の慣性モーメント</h2>
<p>並進運動で質量 m が「動かしにくさ」を表すように、回転運動では<b>慣性モーメント</b> <span class="tb-m">I</span> が回しにくさを表します。回転軸からの距離 r の微小質量 dm を足し合わせて</p>
<div class="tb-math">I = \\int r^2\\,dm \\qquad [\\,\\mathrm{kg\\cdot m^2}\\,] \\qquad I = m k^2 \\;(k: \\text{回転半径})</div>
<p>材料力学の断面二次モーメント (mm⁴、面積の 2 次モーメント) と名前が似ていますが、こちらは<b>質量</b>の 2 次モーメントです。質量が軸から遠いほど r² で効くので、同じ質量でも外周に集めたリングは中実円板の 2 倍の慣性をもちます。</p>
<table class="tb-table">
<tr><th>形状 (質量 m)</th><th>軸</th><th>慣性モーメント</th></tr>
<tr><td>中実円柱・円板 (半径 r)</td><td>中心軸</td><td><span class="tb-m">\\tfrac{1}{2}mr^2</span></td></tr>
<tr><td>中空円筒 (外径 r_o、内径 r_i)</td><td>中心軸</td><td><span class="tb-m">\\tfrac{1}{2}m(r_o^2 + r_i^2)</span></td></tr>
<tr><td>薄肉リング (半径 r)</td><td>中心軸</td><td><span class="tb-m">mr^2</span></td></tr>
<tr><td>細い棒 (長さ L)</td><td>重心を通り棒に垂直</td><td><span class="tb-m">\\tfrac{1}{12}mL^2</span></td></tr>
<tr><td>細い棒 (長さ L)</td><td>端を通り棒に垂直</td><td><span class="tb-m">\\tfrac{1}{3}mL^2</span></td></tr>
<tr><td>直方体 (辺 a、b)</td><td>重心を通り辺 c に平行</td><td><span class="tb-m">\\tfrac{1}{12}m(a^2 + b^2)</span></td></tr>
<tr><td>中実球 (半径 r)</td><td>中心を通る軸</td><td><span class="tb-m">\\tfrac{2}{5}mr^2</span></td></tr>
</table>
<p><b>平行軸の定理</b>: 重心まわりの慣性モーメント <span class="tb-m">I_G</span> が分かっていれば、それと平行で距離 d 離れた軸まわりは</p>
<div class="tb-math">I = I_G + m d^2</div>
<svg class="tb-chart" viewBox="0 0 520 240" role="img" aria-label="回転テーブルの上に偏心して置かれたワーク。平行軸の定理でテーブル中心まわりの慣性モーメントを求める">
<text class="k-title" x="260" y="20" text-anchor="middle">平行軸の定理: テーブル上のワーク</text>
<ellipse cx="200" cy="168" rx="150" ry="40" style="fill:var(--k-steel-3)" stroke="var(--k-line)" stroke-width="1.4"/>
<path class="k-part" d="M50,140 L50,168 A150,40 0 0 0 350,168 L350,140 Z"/>
<ellipse class="k-part" cx="200" cy="140" rx="150" ry="40"/>
<rect class="k-part" x="176" y="180" width="48" height="40"/>
<rect class="k-ground" x="120" y="220" width="160" height="10"/>
<line class="k-center" x1="200" y1="40" x2="200" y2="215"/>
<path class="k-move" d="M150,62 A60,14 0 1 0 250,62" stroke-width="1.8"/>
<text class="tick" x="210" y="50">回転軸 O</text>
<path class="k-alu" d="M262,118 L300,108 L322,120 L284,130 Z"/>
<path class="k-alu" d="M262,118 L284,130 L284,148 L262,136 Z"/><path class="k-alu" d="M284,130 L322,120 L322,138 L284,148 Z"/>
<line class="k-center" x1="292" y1="74" x2="292" y2="150"/>
<text class="tick" x="298" y="72">ワーク重心 G</text>
<line class="k-dimline" x1="200" y1="100" x2="292" y2="100"/><text class="k-dimtext" x="246" y="96" text-anchor="middle">d</text>
<rect class="k-panel" x="388" y="84" width="124" height="110" rx="8"/>
<text class="tick" x="450" y="108" text-anchor="middle">I_O = I_table</text>
<text class="tick" x="450" y="128" text-anchor="middle">+ I_G,work</text>
<text class="tick" x="450" y="148" text-anchor="middle">+ m_work d²</text>
<text class="k-note" x="450" y="176" text-anchor="middle">偏心は不釣合いも生む</text>
</svg>
<p class="tb-caption">図: ワークの慣性は「自分の重心まわり」に「md²」を足して回転軸まわりに直す</p>

<h2>回転の運動方程式</h2>
<p><b>固定軸まわりの回転</b>では、軸まわりのモーメントの和 = 慣性モーメント × 角加速度です。</p>
<div class="tb-math">\\sum M_O = I_O\\,\\ddot\\theta \\qquad \\text{運動エネルギー } T = \\tfrac{1}{2}I_O\\dot\\theta^2</div>
<p><b>平面運動</b> (転がる車輪、リンク) では、重心の並進と重心まわりの回転に分けます: <span class="tb-m">m\\ddot{\\boldsymbol r}_G = \\sum\\boldsymbol F</span>、<span class="tb-m">I_G\\ddot\\theta = \\sum M_G</span>、<span class="tb-m">T = \\tfrac12 m v_G^2 + \\tfrac12 I_G\\dot\\theta^2</span>。重心以外の点まわりにモーメントを取るときは、その点が加速していれば慣性力のモーメントを加える必要があるので、<b>「重心」か「固定点」まわりに取る</b>のが安全です。</p>

<h3>3 次元の回転 — 慣性テンソルとオイラーの運動方程式</h3>
<p>3 次元では慣性は 3 × 3 の<b>慣性テンソル</b> (対角に慣性モーメント、非対角に慣性乗積 <span class="tb-m">I_{xy} = -\\int xy\\,dm</span> など) で表され、角運動量 <span class="tb-m">\\boldsymbol H = \\boldsymbol I\\boldsymbol\\omega</span> は一般に <span class="tb-m">\\boldsymbol\\omega</span> と平行ではありません。慣性乗積が 0 になる直交軸 (<b>慣性主軸</b>) を物体に固定した座標に取ると、<span class="tb-m">\\boldsymbol M = d\\boldsymbol H/dt</span> は次の<b>オイラーの運動方程式</b>になります。</p>
<div class="tb-math">\\begin{aligned}
I_1\\dot\\omega_1 - (I_2 - I_3)\\,\\omega_2\\omega_3 &amp;= M_1 \\\\
I_2\\dot\\omega_2 - (I_3 - I_1)\\,\\omega_3\\omega_1 &amp;= M_2 \\\\
I_3\\dot\\omega_3 - (I_1 - I_2)\\,\\omega_1\\omega_2 &amp;= M_3
\\end{aligned}</div>
<p>第 2 項は、回転座標で見たときに現れる角運動量の向きの変化 (<span class="tb-m">\\boldsymbol\\omega\\times\\boldsymbol H</span>) です。ここから、回転軸が慣性主軸からずれた回転体は軸受に回転する<b>モーメント</b>を及ぼす (動不釣合い)、スピンしている物体の軸を傾けるとそれと直角方向のモーメントが必要になる (ジャイロ効果)、といった現象が説明されます。</p>

<h3>ジャイロモーメント</h3>
<p>スピン角速度 ω で回る回転体 (スピン軸まわりの慣性モーメント I) の軸を、角速度 Ω で旋回 (歳差) させるには、スピン軸と旋回軸の両方に直角な軸まわりに</p>
<div class="tb-math">M = I\\,\\omega\\,\\Omega \\qquad (\\boldsymbol M = \\boldsymbol\\Omega\\times\\boldsymbol H)</div>
<p>のモーメントが必要で、その反作用が軸受に加わります。5 軸加工機の旋回ヘッドに載った高速スピンドル、車両や船の旋回中のエンジン・タービン、ドローンのロータなどで考慮します。例えば I = 0.01 kg·m² のスピンドルが 10 000 min⁻¹ (1 047 rad/s) で回転中に、ヘッドを 0.5 rad/s で旋回させると M = 0.01 × 1 047 × 0.5 = <b>5.2 N·m</b>。軸受間隔 0.2 m なら、前後の軸受に ±26 N の偶力が加わります。</p>

<h2>回転体の不釣合いと釣合い良さ</h2>
<p>回転体の重心が回転軸から e だけずれていると、回転とともに向きを変える遠心力が軸受に作用します。</p>
<div class="tb-math">F = m\\,e\\,\\omega^2 = U\\omega^2 \\qquad U = m e \\;[\\mathrm{g\\cdot mm}]</div>
<svg class="tb-chart" viewBox="0 0 520 240" role="img" aria-label="静不釣合いと偶不釣合いのロータ。回転する遠心力と、2面での修正">
<text class="k-title" x="260" y="20" text-anchor="middle">静不釣合いと偶不釣合い</text>
<rect class="k-panel" x="8" y="32" width="246" height="200" rx="8"/><rect class="k-panel" x="266" y="32" width="246" height="200" rx="8"/>
<text class="lbl" x="131" y="54" text-anchor="middle">静不釣合い (重心が偏心)</text>
<text class="lbl" x="389" y="54" text-anchor="middle">偶不釣合い (主軸が傾く)</text>
<line class="k-center" x1="20" y1="140" x2="242" y2="140"/>
<rect class="k-part-h" x="30" y="132" width="200" height="16" rx="3"/>
<rect class="k-part" x="80" y="96" width="100" height="88" rx="6"/>
<circle cx="146" cy="112" r="6" style="fill:var(--tb-bad)"/>
<line class="k-force" x1="146" y1="104" x2="146" y2="70"/><text class="tick" x="152" y="80">meω²</text>
<rect class="k-yellow" x="36" y="150" width="20" height="26"/><rect class="k-yellow" x="204" y="150" width="20" height="26"/>
<text class="tick" x="46" y="194" text-anchor="middle">軸受</text><text class="tick" x="214" y="194" text-anchor="middle">軸受</text>
<text class="k-note" x="131" y="216" text-anchor="middle">止めても重い側が下に来る</text>
<line class="k-center" x1="278" y1="140" x2="500" y2="140"/>
<rect class="k-part-h" x="288" y="132" width="200" height="16" rx="3"/>
<rect class="k-part" x="320" y="96" width="140" height="88" rx="6"/>
<circle cx="336" cy="112" r="6" style="fill:var(--tb-bad)"/><circle cx="444" cy="168" r="6" style="fill:var(--tb-bad)"/>
<line class="k-force" x1="336" y1="104" x2="336" y2="70"/><line class="k-force" x1="444" y1="176" x2="444" y2="210"/>
<line class="k-hidden" x1="300" y1="100" x2="480" y2="180" style="stroke:var(--tb-accent)"/>
<text class="tick" x="500" y="94" text-anchor="end" style="fill:var(--tb-accent)">慣性主軸</text>
<text class="k-note" x="389" y="226" text-anchor="middle">静止では釣り合う → 2 面修正が必要</text>
</svg>
<p class="tb-caption">図: 静不釣合いは 1 面で修正できるが、主軸が傾く偶不釣合いは回転させて 2 面で修正する (動釣合わせ)</p>
<p>許容できる残留不釣合いは、<b>釣合い良さ (バランス等級) G</b> で指定するのが一般的です (ISO 21940-11、旧 ISO 1940-1)。G は許容偏心量と角速度の積で、速度の次元 (mm/s) をもちます。</p>
<div class="tb-math">G = e_{\\text{per}}\\,\\omega \\;[\\mathrm{mm/s}] \\qquad e_{\\text{per}} = \\dfrac{G}{\\omega} \\qquad U_{\\text{per}} = m\\,e_{\\text{per}}</div>
<p>等級の数字は 0.4、1、2.5、6.3、16 … と約 2.5 倍刻みで、小さいほど厳しくなります。一般的な目安として、ファン・ポンプ・一般機械の回転体は G6.3、工作機械の駆動部・タービンなどは G2.5、研削盤スピンドルなどの精密回転体は G1 以下が使われます。具体的な等級は規格の表と製品の要求で決めます。</p>
<div class="tb-note"><b>計算例 (許容不釣合い)</b>: 質量 20 kg のロータ、3 000 min⁻¹ (ω = 314.2 rad/s)、G6.3。<br>
e<sub>per</sub> = 6.3/314.2 = 0.0201 mm = <b>20 µm</b>、U<sub>per</sub> = 20 kg × 20.1 µm = <b>401 g·mm</b> (2 面修正なら各面に配分)。<br>
この残留不釣合いによる遠心力は F = 4.01 × 10⁻⁴ kg·m × 314.2² = <b>39.6 N</b> (ロータ重量 196 N の約 20 %)。</div>

<h2>計算例 — 回転テーブルの起動トルク</h2>
<div class="tb-note"><b>条件</b>: 鋼製テーブル Ø600 × 40 mm (ρ = 7 850 kg/m³)、0.5 s で 30 min⁻¹ まで等加速、減速比 i = 10 (効率 η = 0.9)、モーター慣性 J<sub>m</sub> = 5 × 10⁻⁴ kg·m²。<br>
① テーブル質量 m = 7 850 × π × 0.3² × 0.04 = 88.8 kg、慣性 I = ½ × 88.8 × 0.3² = <b>4.00 kg·m²</b>。<br>
② 角加速度 α = (30 × 2π/60)/0.5 = 6.28 rad/s²、テーブル軸の加速トルク I α = <b>25.1 N·m</b>。<br>
③ モーター軸: 25.1/(10 × 0.9) + J<sub>m</sub> × α × i = 2.79 + 0.03 = <b>2.82 N·m</b> (摩擦トルクは別途加算)。<br>
④ 50 kg のワークを中心から 0.2 m に偏心して載せると、平行軸の定理で I ≈ 4.0 + 50 × 0.2² = 6.0 kg·m² (ワーク自身の I<sub>G</sub> を無視)、モーター軸トルクは 4.2 N·m に増えます。さらに 30 min⁻¹ で 50 × 0.2 × π² = 98.7 N の遠心力が回転する荷重として軸受に加わります。<br>
⑤ 負荷のモーター軸換算慣性は 4.0/10² = 0.040 kg·m² で、モーター慣性の <b>80 倍</b>。サーボで位置決めするなら、減速比を上げるか慣性の大きなモーターを選んで、慣性モーメント比をメーカー推奨値に収めます。</div>

<h2>よくある失敗</h2>
<ul>
<li><b>断面二次モーメントと質量の慣性モーメントを混同する</b>: 単位 (mm⁴ と kg·m²) が違います。CAD の質量特性で出る値の単位と基準軸 (重心か原点か) を確認します。</li>
<li><b>直径と半径を取り違える</b>: I = ½mr² に直径を入れると 4 倍になります。GD² (旧単位系の「はずみ車効果」) との換算は I = GD²/4 です。</li>
<li><b>平行軸の定理を重心以外の軸から使う</b>: I = I<sub>G</sub> + md² は重心軸からの移動にだけ使えます。軸 A から軸 B へは、いったん重心軸に戻します。</li>
<li><b>加速トルクだけでモーターを選ぶ</b>: 摩擦・切削負荷・重力 (傾斜テーブル) と、減速時の回生、実効トルク (サイクル全体の 2 乗平均) を確認します。</li>
<li><b>不釣合いを「低速だから大丈夫」と判断する</b>: 力は ω² に比例します。運転速度を上げる改造では、釣合わせのやり直しが必要です。</li>
</ul>
`,
    points: [
      "質量の慣性モーメント I = ∫r²dm。円板 ½mr²、リング mr²、棒 (重心) mL²/12。平行軸の定理 I = I_G + md²。",
      "固定軸まわり ΣM = Iθ̈、平面運動は重心の並進と重心まわりの回転に分けて書く。",
      "3 次元の回転は慣性テンソルと主軸で考え、オイラーの運動方程式 I₁ω̇₁ − (I₂ − I₃)ω₂ω₃ = M₁ などに従う。",
      "スピン軸を旋回させるとジャイロモーメント M = IωΩ が軸受に加わる。",
      "不釣合いの遠心力 F = meω²。許容残留不釣合いは釣合い良さ G = e·ω (mm/s) で決め、U = m·G/ω。",
    ],
    exercises: [
      {
        q: "鋼製 (ρ = 7 850 kg/m³) の中空円筒 (外径 Ø200、内径 Ø120、長さ 200 mm) の中心軸まわりの慣性モーメントを求めなさい。",
        a: "m = 7 850 × π × (0.1² − 0.06²) × 0.2 = <b>31.6 kg</b>。I = ½ × 31.6 × (0.1² + 0.06²) = <b>0.215 kg·m²</b>。",
      },
      {
        q: "前問の円筒を、中心軸から 150 mm 離れた平行な軸まわりに回すときの慣性モーメントを求めなさい。",
        a: "I = I<sub>G</sub> + md² = 0.215 + 31.6 × 0.15² = 0.215 + 0.710 = <b>0.925 kg·m²</b>。偏心による md² の方が大きくなっています。",
      },
      {
        q: "回転体の半径 10 mm の位置に 5 g の不釣合い質量があります。6 000 min⁻¹ で回したときの遠心力を求めなさい。",
        a: "ω = 6 000 × 2π/60 = 628.3 rad/s。F = 0.005 × 0.01 × 628.3² = <b>19.7 N</b>。わずか 5 g でも約 2 kgf の回転荷重になります。",
      },
      {
        q: "質量 5 kg の研削スピンドルロータを 12 000 min⁻¹ で使います。G2.5 で釣り合わせるとき、許容偏心量と許容残留不釣合いを求めなさい。",
        a: "ω = 1 256.6 rad/s。e<sub>per</sub> = 2.5/1 256.6 = 0.00199 mm = <b>2.0 µm</b>、U<sub>per</sub> = 5 kg × 1.99 µm = <b>9.9 g·mm</b>。",
      },
    ],
    quiz: [
      { q: "同じ質量・同じ外径の薄肉リングと中実円板の中心軸まわりの慣性モーメントの比 (リング/円板) は?", choices: ["2", "1", "0.5"], answer: 0, explain: "リングは mr²、円板は ½mr² なので 2 倍です。質量が外周にあるほど慣性は大きくなります。" },
      { q: "平行軸の定理 I = I_G + md² の d は?", choices: ["重心軸と求めたい軸の距離", "任意の 2 軸の距離", "物体の直径"], answer: 0, explain: "重心を通る軸から平行移動するときにだけ使える式です。" },
      { q: "不釣合いによる遠心力は回転速度とどんな関係にある?", choices: ["角速度の 2 乗に比例", "角速度に比例", "回転速度に無関係"], answer: 0, explain: "F = meω² なので、回転速度が 2 倍になると力は 4 倍です。" },
      { q: "釣合い良さ G の値と要求の厳しさの関係は?", choices: ["値が小さいほど厳しい", "値が大きいほど厳しい", "回転速度だけで決まる"], answer: 0, explain: "G = e·ω なので、小さいほど許容偏心量が小さく、精密な釣合わせが必要です。" },
    ],
  },
];
