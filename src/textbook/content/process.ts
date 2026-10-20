import type { TextChapter } from "../types";

// 加工法と材料 — in-depth chapters for designers (knowhow: processes, basics: materials).
// Complements dfm-machining / dfm-sheet / dfm-molding / dfm-3dp / treatment / materials / cost.

export const PROCESS: TextChapter[] = [
  {
    id: "machining-practice",
    part: "knowhow",
    title: "切削加工の実際 — 旋削・フライス・穴あけと切削条件",
    minutes: 25,
    level: 2,
    lead: "「切削加工を考えた設計」では作れる形を学びました。ここでは一歩進んで、切削速度・送り・切込みが加工時間・面粗さ・精度をどう決めるかを数値で押さえ、図面の指示がコストにどう跳ね返るかを見積もれるようにします。",
    body: `
<h2>3 つの基本加工と切削の 3 条件</h2>
<table class="tb-table">
  <tr><th>加工</th><th>回るもの</th><th>動くもの</th><th>得意な形</th></tr>
  <tr><td>旋削 (旋盤)</td><td>工作物</td><td>バイト (刃物)</td><td>軸・フランジ・ねじなどの回転体</td></tr>
  <tr><td>フライス削り (マシニングセンタ)</td><td>工具 (エンドミル・正面フライス)</td><td>テーブル (工作物)</td><td>平面・ポケット・輪郭・角物</td></tr>
  <tr><td>穴あけ (ドリル・リーマ・タップ)</td><td>工具</td><td>工具 (軸方向)</td><td>丸穴・ねじ穴</td></tr>
</table>
<p>どの加工も、次の 3 つの<b>切削条件</b>で決まります。</p>
<ul>
  <li><b>切削速度 V<sub>c</sub></b> (m/min): 刃先が材料をこする速さ。工具寿命を最も左右する</li>
  <li><b>送り f</b> (旋削: mm/rev、フライス: 1 刃あたり f<sub>z</sub> mm/tooth): 面粗さと加工時間を左右する</li>
  <li><b>切込み a<sub>p</sub></b> (mm): 1 回で削る深さ。切削抵抗 (力) と取り代を左右する</li>
</ul>
<div class="tb-formula">回転数 n = 1000 · V<sub>c</sub> / (π · D)　[min⁻¹]　　送り速度 V<sub>f</sub> = f · n (旋削)、 V<sub>f</sub> = f<sub>z</sub> · z · n (フライス)</div>
<div class="tb-formula">加工時間 T = L / V<sub>f</sub>　　除去率 Q = a<sub>p</sub> · f · V<sub>c</sub>　[cm³/min]</div>
<svg class="tb-chart" viewBox="0 0 520 222" role="img" aria-label="旋削の切削条件">
  <g class="k-shadow">
    <rect class="k-part" x="16" y="34" width="44" height="132" rx="4"/>
    <rect class="k-part" x="56" y="52" width="24" height="18" rx="2"/><rect class="k-part" x="56" y="130" width="24" height="18" rx="2"/>
    <path class="k-part" d="M80,66 L300,66 L300,80 L470,80 L470,120 L300,120 L300,134 L80,134 Z"/>
  </g>
  <path d="M300,80 L470,80 M300,120 L470,120" style="stroke:var(--k-line)" stroke-width="1.6"/>
  <text class="k-note" x="38" y="182" text-anchor="middle">チャック</text>
  <line class="k-center" x1="10" y1="100" x2="500" y2="100"/>
  <path d="M230,58 A12,42 0 0 1 230,142" fill="none" class="k-move" style="stroke-width:2.2"/>
  <text class="mark-t" x="246" y="50">回転 n (工作物が回る)</text>
  <line class="k-dimline" x1="150" y1="66" x2="150" y2="134"/><text class="k-dimtext" x="156" y="94">素材径 D</text>
  <line class="k-dimline" x1="396" y1="80" x2="396" y2="120"/><text class="k-dimtext" x="402" y="94">仕上げ径 d</text>
  <path class="k-ext" d="M304,66 H500"/>
  <line class="k-dimline" x1="492" y1="48" x2="492" y2="66" style="marker-start:none"/><line class="k-dimline" x1="492" y1="98" x2="492" y2="80" style="marker-start:none"/>
  <text class="k-dimtext" x="486" y="36" text-anchor="end">切込み a<tspan style="font-size:9px" dy="3">p</tspan><tspan dy="-3"> = (D − d) / 2</tspan></text>
  <g class="k-shadow">
    <path class="k-part" d="M290,150 L322,148 L340,206 L276,206 Z"/>
    <path class="k-accent" d="M300,121 L326,146 L292,150 Z"/>
  </g>
  <path d="M306,124 q18,4 18,18 q-1,9 -10,7 q-7,-3 -1,-10 q6,-5 13,1" fill="none" style="stroke:var(--tb-warn)" stroke-width="2"/>
  <text class="k-note" x="348" y="186">バイト</text>
  <line class="k-move" x1="266" y1="196" x2="206" y2="196"/>
  <text class="mark-t" x="198" y="200" text-anchor="end">送り f (mm/rev)</text>
</svg>
<p class="tb-caption">図: 外径旋削。工作物が回転し (n)、バイトが軸方向に送られる (f)。半径方向の切込み a<sub>p</sub> で素材径 D から径 d に削る。切削速度は外周の速さ V<sub>c</sub> = π D n / 1000</p>
<h2>材料別の切削速度の目安 (超硬工具)</h2>
<table class="tb-table">
  <tr><th>被削材</th><th>V<sub>c</sub> (m/min)</th><th>削りやすさ</th><th>設計者が知っておくこと</th></tr>
  <tr><td>アルミ合金 (A6061, A5052)</td><td>300〜1000</td><td>◎</td><td>速く削れるが、軟らかい A1050 などは構成刃先・むしれが出やすい</td></tr>
  <tr><td>快削黄銅 C3604</td><td>200〜400</td><td>◎</td><td>切りくずが細かく分断され、自動旋盤部品の定番</td></tr>
  <tr><td>炭素鋼 S45C (生材)</td><td>150〜250</td><td>○</td><td>標準的。調質材 (HRC 30 前後) は 2〜3 割遅く</td></tr>
  <tr><td>SUS304</td><td>100〜180</td><td>△</td><td>加工硬化・熱がこもる・切りくずが切れにくい → 時間と工具費が 1.5〜2 倍</td></tr>
  <tr><td>チタン合金 Ti-6Al-4V</td><td>40〜80</td><td>×</td><td>熱伝導が悪く刃先が高温に。鋼の数倍の加工費</td></tr>
  <tr><td>焼入れ鋼 (HRC 50 以上)</td><td>50〜150 (cBN 等)</td><td>×</td><td>原則は焼入れ前に削り、焼入れ後は研削。ハードミリングは高価</td></tr>
</table>
<p class="tb-note">数値は工具メーカーのカタログ値をまとめた目安です。機械の剛性・工具径・突出し長さで大きく変わります。</p>
<h2>送りと仕上げ面粗さ</h2>
<p>旋削の仕上げ面には、バイト先端の丸み (<b>ノーズ半径 r</b>) が 1 回転ごとに送り f ずつずれて転写された<b>送りマーク</b>が残ります。その理論高さは</p>
<div class="tb-formula">R<sub>z</sub> ≈ f² / (8 r)　　R<sub>a</sub> ≈ R<sub>z</sub> / 4 ≈ f² / (32 r)</div>
<p>送りを半分にすれば粗さは 1/4 になりますが、加工時間は 2 倍になります。ノーズ R を大きくすれば同じ送りで面はきれいになりますが、切削抵抗の背分力が増えて細長い軸ではびびりやすくなります。</p>
<div data-widget="anim-turning"></div>
<h2>加工法で到達できる精度と粗さ</h2>
<p>図面で公差・粗さを決めるときは、「その数値はどの工程で出るのか」を考えます。下の表は量産で無理なく安定して出せる範囲の目安です (IT は JIS B 0401 の基本公差等級)。</p>
<table class="tb-table">
  <tr><th>加工</th><th>寸法公差 (IT 等級)</th><th>R<sub>a</sub> (µm)</th><th>φ20 での公差幅の目安</th></tr>
  <tr><td>荒削り (旋削・フライス)</td><td>IT11〜IT13</td><td>6.3〜25</td><td>0.13〜0.33 mm</td></tr>
  <tr><td>仕上げ削り (旋削・フライス)</td><td>IT7〜IT9</td><td>0.8〜3.2</td><td>0.021〜0.052 mm</td></tr>
  <tr><td>ドリル穴</td><td>IT11〜IT13</td><td>3.2〜12.5</td><td>0.13〜0.33 mm</td></tr>
  <tr><td>リーマ穴</td><td>IT7〜IT8</td><td>0.8〜1.6</td><td>0.021〜0.033 mm</td></tr>
  <tr><td>ボーリング (中ぐり)</td><td>IT6〜IT8</td><td>0.4〜1.6</td><td>0.013〜0.033 mm</td></tr>
  <tr><td>円筒研削</td><td>IT5〜IT6</td><td>0.1〜0.8</td><td>0.009〜0.013 mm</td></tr>
</table>
<svg class="tb-chart" viewBox="0 0 520 204" role="img" aria-label="公差と加工コストの関係">
  <rect x="62" y="20" width="96" height="150" style="fill:color-mix(in srgb, var(--tb-bad) 9%, transparent)"/>
  <rect x="158" y="20" width="142" height="150" style="fill:color-mix(in srgb, var(--tb-warn) 9%, transparent)"/>
  <rect x="300" y="20" width="190" height="150" style="fill:color-mix(in srgb, var(--tb-good) 9%, transparent)"/>
  <line class="axis" x1="60" y1="170" x2="494" y2="170" marker-end="url(#k-arrow)"/><line class="axis" x1="60" y1="170" x2="60" y2="16" marker-end="url(#k-arrow)"/>
  <path d="M80,40 L120,70 L170,105 L230,130 L300,147 L380,157 L470,162 L470,170 L80,170 Z" style="fill:color-mix(in srgb, var(--tb-accent) 14%, transparent)"/>
  <polyline points="80,40 120,70 170,105 230,130 300,147 380,157 470,162" fill="none" style="stroke:var(--tb-accent)" stroke-width="2.8"/>
  <circle cx="120" cy="70" r="5" style="fill:var(--tb-bad);stroke:var(--tb-surface)" stroke-width="1.5"/><text class="mark-t" x="130" y="66">研削が必要 (IT6 以下)</text>
  <circle cx="230" cy="130" r="5" style="fill:var(--tb-warn);stroke:var(--tb-surface)" stroke-width="1.5"/><text class="mark-t" x="240" y="124">仕上げ削りで出る (IT7〜9)</text>
  <circle cx="380" cy="157" r="5" style="fill:var(--tb-good);stroke:var(--tb-surface)" stroke-width="1.5"/><text class="mark-t" x="372" y="146">普通公差 (荒〜中仕上げ)</text>
  <text class="lbl" x="490" y="192" text-anchor="end">公差幅 (広い →)</text><text class="lbl" x="68" y="14">相対コスト</text>
</svg>
<p class="tb-caption">図: 公差とコストの関係 (模式図)。公差を狭くするほどコストは指数関数的に上がる。特に「削りで出る範囲」から「研削・測定の追加が必要な範囲」に踏み込むと工程そのものが増え、段差状に高くなる</p>
<h2>加工コストを決めるもの</h2>
<div class="tb-formula">加工費 ≈ (段取り時間 + 加工時間 × 個数) × 機械チャージ (円/時間) + 工具費 + 材料費</div>
<ul>
  <li><b>段取り</b>: 治具の準備、原点出し、プログラム作成。1 個〜数個の試作ではこれが大半。段取り回数 (加工面の向きの数) を減らす</li>
  <li><b>加工時間</b>: 取り代 (削る体積) ÷ 除去率 + 仕上げパスの長さ ÷ 送り速度。素材を形に近い規格材から選ぶと荒削りが減る</li>
  <li><b>機械チャージ</b>: 汎用旋盤 &lt; NC 旋盤 &lt; 3 軸 MC &lt; 5 軸 MC &lt; 研削盤・ジグボーラ。精度の要求が機械を選ぶ</li>
  <li><b>測定</b>: 厳しい公差は三次元測定機での検査が必要になり、それも加工費に含まれる</li>
  <li><b>被削材</b>: 同じ形でも SUS304 はアルミの数倍、チタンは十倍近い時間になることがある</li>
</ul>
<h2>穴あけの注意</h2>
<ul>
  <li>ドリル穴は<b>入口が広がり、曲がる</b>。位置精度 ±0.1 mm 程度、深い穴ほど曲がりが大きい。精度が要るならセンタ穴 → ドリル → リーマ (またはボーリング)</li>
  <li>ドリルの入口・出口の面は<b>穴軸に垂直</b>に。斜面にいきなり当てると刃が逃げて折れる (座ぐりや平面を設ける)</li>
  <li>リーマは下穴から 0.1〜0.3 mm 程度を削る。<b>止まり穴のリーマ</b>は底まで仕上がらないので、有効長さ + 逃げを確保</li>
  <li>タップは止まり穴より通り穴が楽。小径 (M3 以下) の SUS 材タップは折損が多いので、ねじインサートや貫通を検討</li>
</ul>
<div class="tb-tip"><b>3DCAD Studio</b>: 「検査 → CAM」で工具経路を出すと、加工時間の目安が表示されます。送りを変えると時間が反比例で変わることを確かめてみましょう。</div>`,
    points: [
      "切削速度 Vc は工具寿命、送り f は面粗さと時間、切込み ap は力と取り代を決める",
      "n = 1000·Vc/(πD)、加工時間 T = L/(f·n)",
      "旋削の理論粗さ Rz ≈ f²/(8r) — 送り半分で粗さ 1/4、時間 2 倍",
      "削りで IT7〜9・Ra 0.8〜3.2 が目安。IT6 以下や Ra 0.4 以下は研削など工程が増える",
      "SUS・チタンは時間と工具費が大きい。段取り回数と取り代を減らす形にする",
    ],
    exercises: [
      {
        q: "φ50 の S45C 丸棒を切削速度 Vc = 150 m/min、送り f = 0.2 mm/rev で長さ 100 mm 外径旋削します。回転数と 1 パスの加工時間を求めてください。",
        a: "n = 1000 × 150 / (π × 50) = 150000 / 157.1 ≈ <b>955 min⁻¹</b>。送り速度 Vf = 0.2 × 955 = 191 mm/min なので T = 100 / 191 ≈ <b>0.52 min (約 31 秒)</b>。",
      },
      {
        q: "ノーズ半径 r = 0.8 mm のバイトで送り f = 0.2 mm/rev のとき、理論粗さ Rz と Ra はいくらですか? Ra 0.8 µm 以下にしたい場合、送りをいくら以下にすればよいですか?",
        a: "Rz = 0.2² / (8 × 0.8) = 0.04 / 6.4 = 0.00625 mm = <b>6.25 µm</b>、Ra ≈ 6.25 / 4 ≈ <b>1.6 µm</b>。Ra = f²/(32r) ≤ 0.0008 mm より f² ≤ 0.0008 × 32 × 0.8 = 0.02048、<b>f ≤ 0.14 mm/rev</b>。実際は理論値より粗くなるので 0.1 mm/rev 程度に下げるのが無難です。",
      },
      {
        q: "4 枚刃 φ10 のエンドミルで、アルミを Vc = 300 m/min、fz = 0.05 mm/tooth で削ります。回転数と送り速度を求めてください。",
        a: "n = 1000 × 300 / (π × 10) ≈ <b>9550 min⁻¹</b>。Vf = 0.05 × 4 × 9550 ≈ <b>1910 mm/min</b>。",
      },
    ],
    quiz: [
      { q: "旋削で送りを 0.2 から 0.1 mm/rev に下げると、理論粗さ Rz はどうなる?", choices: ["1/2 になる", "1/4 になる", "変わらない"], answer: 1, explain: "Rz ≈ f²/(8r) なので送りの 2 乗に比例し、1/4 になります。加工時間は 2 倍になります。" },
      { q: "φ20 の穴に H7 (公差幅 0.021 mm) を指示した。ドリルだけで加工すると?", choices: ["問題なく出る", "ドリルでは IT11〜13 程度なのでリーマかボーリングが必要", "研削しか方法がない"], answer: 1, explain: "ドリル穴は IT11〜13 程度。H7 はリーマ・ボーリングで仕上げます。" },
      { q: "同じ形状で最も加工時間が長くなりやすい材料は?", choices: ["A6061", "C3604", "Ti-6Al-4V"], answer: 2, explain: "チタン合金は熱伝導が悪く切削速度を大きく下げる必要があり、加工時間・工具費が大きくなります。" },
    ],
    lessons: ["3-2", "3-4"],
  },
  {
    id: "grinding-finishing",
    part: "knowhow",
    title: "研削・仕上げ・精密加工",
    minutes: 20,
    level: 3,
    lead: "軸受のはまる軸、摺動面、シール面 — µm 単位の寸法と鏡のような面が要る部分は、切削のあとに研削や仕上げ加工をします。どの工程でどこまで出るのか、図面にどう書けば無駄な工程を増やさずに済むのかを学びます。",
    body: `
<h2>研削とは</h2>
<p>研削は、<b>砥石</b> (といし) の表面に無数にある硬い砥粒 (アルミナ・炭化ケイ素・cBN・ダイヤモンド) で、ごく少しずつ材料を削る加工です。1 粒の切込みは数 µm 以下と小さいため、</p>
<ul>
  <li>寸法精度 IT5〜6、R<sub>a</sub> 0.1〜0.8 µm が安定して出る</li>
  <li><b>焼入れ鋼</b> (HRC 60 前後) も削れる — 熱処理後の仕上げはほぼ研削</li>
  <li>取り代は小さい (径で 0.1〜0.5 mm 程度)。前工程で寸法を「研削代」だけ残しておく</li>
</ul>
<div class="tb-formula">砥石周速 V<sub>s</sub> = π · D<sub>s</sub> · n<sub>s</sub> / 60000　[m/s]　(一般砥石で 30 m/s 前後、高速研削で 60 m/s 以上)</div>
<table class="tb-table">
  <tr><th>研削の種類</th><th>対象</th><th>用途</th></tr>
  <tr><td>円筒研削</td><td>軸の外径</td><td>軸受・オイルシールのはまる軸、ピン</td></tr>
  <tr><td>内面研削</td><td>穴の内径</td><td>軸受ハウジング、焼入れしたブシュ</td></tr>
  <tr><td>平面研削</td><td>平面</td><td>ゲージブロック、治具のプレート、金型部品</td></tr>
  <tr><td>センタレス研削</td><td>ピン・シャフト (センタ穴なし)</td><td>大量の細い軸を高能率に</td></tr>
  <tr><td>成形研削・プロファイル研削</td><td>歯車の歯面、ねじ、パンチ形状</td><td>精密な輪郭</td></tr>
</table>
<h2>研削の注意点 — 研削焼けと逃げ</h2>
<ul>
  <li><b>研削焼け</b>: 研削点は局所的に非常に高温になる。条件が悪いと表面が焼戻され (軟化) たり再焼入れされたり、引張残留応力や微細な割れが残り、疲労強度を大きく下げる。図面に「研削焼けなきこと」と書く場合もある</li>
  <li><b>研削逃げ (ぬすみ)</b>: 砥石の角は丸くなるので、段付き軸の隅は直角に仕上がらない。隅にはヌスミ溝 (JIS B 0711 など) か、砥石の R に合わせた隅 R を指示する</li>
  <li>研削するのは<b>機能面だけ</b>。軸全長を研削指示にしない</li>
</ul>
<svg class="tb-chart" viewBox="0 0 520 222" role="img" aria-label="研削逃げ">
  <rect class="k-panel" x="8" y="8" width="244" height="206" rx="8"/><rect class="k-panel" x="268" y="8" width="244" height="206" rx="8"/>
  <circle class="k-badge" cx="28" cy="28" r="10" style="fill:var(--tb-bad)"/><text class="k-badge-t" x="28" y="32" text-anchor="middle">✕</text><text class="k-title" x="46" y="32">逃げなし</text>
  <circle class="k-badge" cx="288" cy="28" r="10" style="fill:var(--tb-good)"/><text class="k-badge-t" x="288" y="32" text-anchor="middle">✓</text><text class="k-title" x="306" y="32">ヌスミ溝</text>
  <g class="k-shadow"><path class="k-cut" d="M24,112 L170,112 L170,84 L236,84 L236,180 L24,180 Z"/></g>
  <line class="k-center" x1="16" y1="180" x2="244" y2="180"/>
  <rect x="98" y="46" width="72" height="66" rx="12" style="fill:url(#k-dots);stroke:var(--k-line)" stroke-width="1.6"/>
  <path class="k-move" d="M114,58 A16,10 0 0 1 150,58"/>
  <text class="mark-t" x="92" y="70" text-anchor="end">砥石</text>
  <path d="M158,112 L170,112 L170,100 A12,12 0 0 1 158,112 Z" style="fill:var(--tb-bad)"/>
  <circle cx="166" cy="106" r="13" fill="none" style="stroke:var(--tb-bad)" stroke-width="1.6" stroke-dasharray="4 3"/>
  <text class="k-bad-t" x="130" y="200" text-anchor="middle">逃げなし: 隅に研削残り</text>
  <g class="k-shadow"><path class="k-cut" d="M284,112 L410,112 L410,120 L426,120 L426,84 L496,84 L496,180 L284,180 Z"/></g>
  <line class="k-center" x1="276" y1="180" x2="504" y2="180"/>
  <rect x="354" y="46" width="72" height="66" rx="12" style="fill:url(#k-dots);stroke:var(--k-line)" stroke-width="1.6"/>
  <path class="k-move" d="M370,58 A16,10 0 0 1 406,58"/>
  <line class="k-thin" x1="418" y1="118" x2="446" y2="70" style="stroke:var(--k-line)"/><text class="mark-t" x="440" y="64">溝</text>
  <circle cx="418" cy="114" r="12" fill="none" style="stroke:var(--tb-good)" stroke-width="1.6" stroke-dasharray="4 3"/>
  <text class="k-good-t" x="390" y="200" text-anchor="middle">ヌスミ溝: 砥石が段まで抜ける</text>
</svg>
<p class="tb-caption">図: 段付き軸の研削 (上半分の断面)。砥石の角は丸く減るため、段の隅は直角に研げない (左)。ヌスミ溝を入れると、軸受を段に密着させられる (右)。ただし溝は応力集中になるので、高応力の軸では隅 R 仕上げを選ぶ</p>
<h2>さらに細かい仕上げ</h2>
<table class="tb-table">
  <tr><th>加工</th><th>R<sub>a</sub> の目安 (µm)</th><th>原理</th><th>用途</th></tr>
  <tr><td>ホーニング</td><td>0.1〜0.4</td><td>砥石棒を回転+往復させて穴をなでる</td><td>エンジンシリンダ、油圧シリンダ内面 (クロスハッチで油を保持)</td></tr>
  <tr><td>超仕上げ</td><td>0.025〜0.2</td><td>細かい砥石を振動させながら押し当てる</td><td>軸受の軌道面、シール摺動面</td></tr>
  <tr><td>ラッピング</td><td>0.012〜0.1</td><td>ラップ盤と遊離砥粒で擦り合わせる</td><td>ゲージ、メカニカルシール、平面度 1 µm 以下</td></tr>
  <tr><td>バフ研磨</td><td>0.025〜0.2 (光沢)</td><td>布バフと研磨剤</td><td>外観の鏡面、寸法精度は出ない</td></tr>
  <tr><td>電解研磨</td><td>微小凹凸の平滑化</td><td>電気化学的に凸部を溶かす</td><td>ステンレスの衛生配管・真空部品</td></tr>
</table>
<h2>特殊加工 — 放電・ワイヤ・レーザ</h2>
<ul>
  <li><b>形彫り放電加工</b>: 電極の形を放電で転写。焼入れ鋼の深いリブ・入隅のシャープな角 (金型) に使う。遅い</li>
  <li><b>ワイヤ放電加工</b>: φ0.1〜0.3 mm の線で糸のこのように切る。焼入れ鋼のパンチ・ダイ、精度 ±0.005 mm 程度。入隅 R は線径/2 + 放電ギャップまで小さくできる</li>
  <li><b>レーザ・ウォータジェット</b>: 板の切断。熱影響層 (レーザ) やテーパ (ウォータジェット) に注意</li>
</ul>
<h2>粗さの指示と工程の対応</h2>
<p>粗さ記号は JIS B 0031 (ISO 1302) に従い、√ 記号に R<sub>a</sub> 値などを添えます。「R<sub>a</sub> 0.4」と書いた瞬間に研削工程が追加されると考えてください。</p>
<svg class="tb-chart" viewBox="0 0 520 172" role="img" aria-label="粗さと加工法">
  <path class="grid" d="M60,14 V130 M130,14 V130 M200,14 V130 M270,14 V130 M340,14 V130 M410,14 V130"/>
  <line class="axis" x1="40" y1="130" x2="490" y2="130"/>
  <path class="axis" d="M60,130 V135 M130,130 V135 M200,130 V135 M270,130 V135 M340,130 V135 M410,130 V135"/>
  <text class="tick" x="60" y="148" text-anchor="middle">0.025</text><text class="tick" x="130" y="148" text-anchor="middle">0.1</text><text class="tick" x="200" y="148" text-anchor="middle">0.4</text><text class="tick" x="270" y="148" text-anchor="middle">1.6</text><text class="tick" x="340" y="148" text-anchor="middle">6.3</text><text class="tick" x="410" y="148" text-anchor="middle">25</text>
  <rect x="235" y="20" width="175" height="18" rx="9" style="fill:var(--tb-accent)"/><text class="lbl" x="245" y="33" style="fill:var(--tb-surface)">旋削・フライス</text>
  <rect x="95" y="44" width="175" height="18" rx="9" style="fill:var(--tb-good)"/><text class="lbl" x="105" y="57" style="fill:var(--tb-surface)">研削</text>
  <rect x="95" y="68" width="105" height="18" rx="9" style="fill:var(--tb-warn)"/><text class="lbl" x="105" y="81" style="fill:var(--tb-surface)">ホーニング</text>
  <rect x="40" y="92" width="125" height="18" rx="9" style="fill:var(--tb-bad)"/><text class="lbl" x="50" y="105" style="fill:var(--tb-surface)">ラップ・超仕上げ</text>
  <text class="lbl" x="40" y="166">← 細かい (なめらか)</text>
  <text class="lbl" x="490" y="166" text-anchor="end">Ra (µm, 対数目盛) 粗い →</text>
</svg>
<p class="tb-caption">図: 加工法ごとの到達粗さ R<sub>a</sub> の目安 (横軸は対数)。右ほど粗い。1 段階細かくするごとに工程が増え、時間も増える</p>`,
    points: [
      "研削は IT5〜6、Ra 0.1〜0.8 µm。焼入れ後の仕上げの主役",
      "前工程で研削代 (径 0.1〜0.5 mm 程度) を残す",
      "研削焼けは疲労強度を下げる。条件管理と検査を指示",
      "段付き軸の隅は研削逃げ (ヌスミ) か砥石 R に合わせた隅 R",
      "Ra 0.4 以下は研削、0.1 以下はホーニング・超仕上げ・ラップ — 必要な面だけに",
    ],
    exercises: [
      {
        q: "外径 305 mm の砥石を 1800 min⁻¹ で回すときの周速 Vs を求めてください。",
        a: "Vs = π × 305 × 1800 / 60000 = 1,724,734 / 60000 ≈ <b>28.7 m/s</b>。一般的な研削の周速 (30 m/s 前後) に収まっています。",
      },
      {
        q: "φ25 h6 (公差 −0.013〜0) の軸を、焼入れ後に研削で仕上げます。研削代を直径で 0.3 mm とるとき、旋削仕上げの寸法 (中央値) はいくらにしますか?",
        a: "研削後の中央値は 25 − 0.0065 ≈ 24.9935 mm。これに 0.3 を足して <b>φ25.29〜25.30 程度</b> (旋削公差は ±0.05 程度で十分)。焼入れひずみ (曲がり) も研削代で吸収するため、長い軸では代を多めにとります。",
      },
    ],
    quiz: [
      { q: "HRC 60 に焼入れした軸受はめあい面の仕上げに最も一般的な加工は?", choices: ["旋削", "円筒研削", "バフ研磨"], answer: 1, explain: "焼入れ鋼を µm 精度で仕上げるには研削が一般的です。バフは光沢は出ますが寸法精度は出ません。" },
      { q: "研削焼けが問題になる主な理由は?", choices: ["見た目が悪くなるだけ", "表面が軟化したり引張残留応力・微細割れが残り疲労強度が下がる", "寸法が大きくなる"], answer: 1, explain: "研削熱で表面組織が変わり、疲労強度の低下や割れの原因になります。" },
      { q: "油圧シリンダの内面にクロスハッチ模様を付ける仕上げ加工は?", choices: ["ホーニング", "ワイヤ放電加工", "ラッピング"], answer: 0, explain: "ホーニングは回転と往復で網目状の条痕を付け、油を保持しやすい面を作ります。" },
    ],
  },
  {
    id: "casting-forging",
    part: "knowhow",
    title: "鋳造と鍛造 — 素形材の選び方と設計",
    minutes: 25,
    level: 2,
    lead: "複雑な形を一度に作る鋳造、強くねばい部品を作る鍛造。どちらも「形に近い素材 (素形材)」を作り、必要な所だけを削る工法です。それぞれの種類と特徴、設計者が守るべき形状ルールを学びます。",
    body: `
<h2>鋳造の種類</h2>
<p>鋳造は溶かした金属を型に流し込んで固める工法です。</p>
<table class="tb-table">
  <tr><th>工法</th><th>主な材料</th><th>数量</th><th>寸法精度・肉厚の目安</th><th>特徴</th></tr>
  <tr><td>砂型鋳造</td><td>鋳鉄 FC・FCD、鋳鋼 SC、アルミ AC</td><td>1 個〜数千</td><td>粗い (数 mm 単位で削り代)、肉厚 4〜5 mm 以上</td><td>大物・少量に向く。型代が安い</td></tr>
  <tr><td>金型重力鋳造</td><td>アルミ AC</td><td>数千〜数万</td><td>砂型より良い</td><td>組織が緻密で強い</td></tr>
  <tr><td>ダイカスト</td><td>アルミ ADC12、亜鉛 ZDC</td><td>数万以上</td><td>良い、肉厚 1.5〜4 mm</td><td>高速・高圧で薄肉複雑形状。巣のため熱処理・溶接に不向き</td></tr>
  <tr><td>ロストワックス (精密鋳造)</td><td>ステンレス、鋼、Ni 合金</td><td>数百〜数万</td><td>非常に良い、細かい形状可</td><td>削れない材料や複雑形状を寸法通りに</td></tr>
</table>
<p>JIS 記号の例: <b>FC250</b> (ねずみ鋳鉄、引張強さ 250 MPa 以上)、<b>FCD450</b> (球状黒鉛鋳鉄、450 MPa 以上でねばい)、<b>SC450</b> (炭素鋼鋳鋼)、<b>AC4C</b> (アルミ合金鋳物)、<b>ADC12</b> (アルミダイカスト)。</p>
<h2>鋳物の設計ルール</h2>
<ul>
  <li><b>肉厚を均一に</b>: 厚い所は最後に固まり、収縮の不足分が<b>引け巣</b>になる。厚肉部は肉抜きし、肉厚の変化はなだらかに (比 1:2 以内、テーパでつなぐ)</li>
  <li><b>角には R</b>: 鋭い入隅は凝固のとき割れ (熱間割れ) や応力集中の原因。外 R・内 R とも付ける</li>
  <li><b>抜き勾配</b>: 型から抜くため 1〜3° 程度 (砂型は大きめ)</li>
  <li><b>交差部 (T, X 字) を避ける</b>: 肉が集まる所 (ホットスポット) は引け巣になりやすい。X 字は 2 つの T にずらす</li>
  <li><b>削り代</b>を見込む: 加工面は砂型で片側 3〜6 mm 程度、ダイカストで 0.5〜1 mm 程度。基準にする面 (鋳肌の基準) を図面で決めておく</li>
  <li><b>縮み代</b>: 金属は固まって冷えると縮む。型は縮み分大きく作る (鋳鉄 約 0.8〜1.0 %、アルミ 約 1.2〜1.3 %、鋳鋼 約 2.0 %)</li>
</ul>
<svg class="tb-chart" viewBox="0 0 520 218" role="img" aria-label="鋳物の肉厚と引け巣">
  <rect class="k-panel" x="8" y="8" width="244" height="202" rx="8"/><rect class="k-panel" x="268" y="8" width="244" height="202" rx="8"/>
  <circle class="k-badge" cx="28" cy="28" r="10" style="fill:var(--tb-bad)"/><text class="k-badge-t" x="28" y="32" text-anchor="middle">✕</text><text class="k-title" x="46" y="32">厚い交差部</text>
  <circle class="k-badge" cx="288" cy="28" r="10" style="fill:var(--tb-good)"/><text class="k-badge-t" x="288" y="32" text-anchor="middle">✓</text><text class="k-title" x="306" y="32">均一肉厚 + R</text>
  <g class="k-shadow"><path class="k-cut" d="M30,64 L110,64 L110,150 L234,150 L234,174 L30,174 Z"/></g>
  <path d="M74,146 q8,-8 16,-2 q8,4 6,12 q-4,10 -14,8 q-10,-2 -12,-8 q-2,-6 4,-10 Z" style="fill:var(--tb-surface);stroke:var(--tb-bad)" stroke-width="1.8"/>
  <path d="M80,150 l6,4 M86,148 l2,8" style="stroke:var(--tb-bad)" stroke-width="1"/>
  <line class="k-thin" x1="98" y1="152" x2="134" y2="118" style="stroke:var(--tb-bad)"/>
  <text class="k-bad-t" x="138" y="116">引け巣 (空洞)</text>
  <text class="k-note" x="138" y="132">最後に固まる所</text>
  <path class="k-ext" d="M30,62 V44 M110,62 V44"/>
  <line class="k-dimline" x1="30" y1="50" x2="110" y2="50"/><text class="k-dimtext" x="116" y="54">肉厚 80</text>
  <text class="k-bad-t" x="130" y="198" text-anchor="middle">厚い交差部 → 引け巣</text>
  <g class="k-shadow"><path class="k-cut" d="M290,64 L320,64 L320,130 A14,14 0 0 0 334,144 L490,144 L490,174 L334,174 A44,44 0 0 1 290,130 Z"/></g>
  <path class="k-ext" d="M290,62 V44 M320,62 V44"/>
  <line class="k-dimline" x1="290" y1="50" x2="320" y2="50"/><text class="k-dimtext" x="326" y="54">30</text>
  <path class="k-ext" d="M492,144 H504 M492,174 H504"/><line class="k-dimline" x1="500" y1="144" x2="500" y2="174"/><text class="k-dimtext" x="494" y="138" text-anchor="end">30</text>
  <text class="mark-t" x="340" y="100">肉厚 30 で一定</text>
  <text class="k-note" x="340" y="116">隅に R → 凝固が均一</text>
  <text class="k-good-t" x="390" y="198" text-anchor="middle">均一肉厚 + R → 健全</text>
</svg>
<p class="tb-caption">図: 鋳物の断面。肉厚の大きい交差部は最後まで溶けたまま残り、周りが固まったあとに縮んで内部に空洞 (引け巣) ができる (左)。肉厚をそろえ、隅に R を付けると、凝固が均一になり欠陥が減る (右)</p>
<h2>鍛造の種類と特徴</h2>
<p>鍛造は金属をたたいたり押したりして形を作る工法です。内部の空隙がつぶれ、<b>メタルフロー (鍛流線)</b> が形に沿って連続するので、同じ材料でも削り出しや鋳物より<b>疲労強度・靭性が高く</b>なります。</p>
<table class="tb-table">
  <tr><th>工法</th><th>温度</th><th>特徴</th><th>例</th></tr>
  <tr><td>自由鍛造</td><td>熱間</td><td>型を使わず、たたいて伸ばす。大物・少量</td><td>大型軸、リング</td></tr>
  <tr><td>型鍛造 (熱間)</td><td>1100〜1250 °C (鋼)</td><td>上下の型で形を作る。バリが出て後で抜く</td><td>クランク軸、コンロッド、ナックル</td></tr>
  <tr><td>温間鍛造</td><td>600〜900 °C</td><td>熱間と冷間の中間。精度と成形性のバランス</td><td>等速ジョイント部品</td></tr>
  <tr><td>冷間鍛造 (圧造)</td><td>室温</td><td>精度が良く、加工硬化で強くなる。大きな力が要る</td><td>ボルト、小ねじ、ピン、ギヤブランク</td></tr>
</table>
<svg class="tb-chart" viewBox="0 0 520 210" role="img" aria-label="メタルフローの比較">
  <rect class="k-panel" x="8" y="8" width="244" height="194" rx="8"/><rect class="k-panel" x="268" y="8" width="244" height="194" rx="8"/>
  <circle class="k-badge" cx="28" cy="28" r="10" style="fill:var(--tb-bad)"/><text class="k-badge-t" x="28" y="32" text-anchor="middle">✕</text><text class="k-title" x="46" y="32">削り出し</text>
  <circle class="k-badge" cx="288" cy="28" r="10" style="fill:var(--tb-good)"/><text class="k-badge-t" x="288" y="32" text-anchor="middle">✓</text><text class="k-title" x="306" y="32">鍛造</text>
  <g class="k-shadow"><path class="k-part" d="M30,58 L230,58 L230,98 L90,98 L90,168 L30,168 Z"/></g>
  <path d="M30,64 H230 M30,71 H230 M30,78 H230 M30,85 H230 M30,92 H230 M30,106 H90 M30,114 H90 M30,122 H90 M30,130 H90 M30,138 H90 M30,146 H90 M30,154 H90 M30,162 H90" style="stroke:var(--k-line-2)" stroke-width="1"/>
  <path class="k-part" d="M30,58 L230,58 L230,98 L90,98 L90,168 L30,168 Z" style="fill:none"/>
  <circle cx="90" cy="98" r="11" fill="none" style="stroke:var(--tb-bad)" stroke-width="1.8" stroke-dasharray="4 3"/>
  <line class="k-thin" x1="100" y1="106" x2="124" y2="128" style="stroke:var(--tb-bad)"/><text class="k-bad-t" x="126" y="140">流線が切れる</text>
  <text class="k-note" x="126" y="156">疲労の起点に</text>
  <text class="lbl" x="130" y="190" text-anchor="middle">削り出し: 流線が隅で切れる</text>
  <g class="k-shadow"><path class="k-part" d="M290,58 L490,58 L490,98 L370,98 Q350,98 350,118 L350,168 L290,168 Z"/></g>
  <path d="M297,168 L297,77 Q297,65 309,65 L490,65 M307,168 L307,83 Q307,72 318,72 L490,72 M317,168 L317,90 Q317,79 328,79 L490,79 M327,168 L327,96 Q327,86 338,86 L490,86 M337,168 L337,104 Q337,92 350,92 L490,92" fill="none" style="stroke:var(--tb-good)" stroke-width="1.4"/>
  <path class="k-part" d="M290,58 L490,58 L490,98 L370,98 Q350,98 350,118 L350,168 L290,168 Z" style="fill:none"/>
  <text class="k-good-t" x="390" y="190" text-anchor="middle">鍛造: 流線が形に沿って連続</text>
</svg>
<p class="tb-caption">図: L 字部品のメタルフロー (模式図)。圧延材から削り出すと繊維状の組織が隅で切断され、そこが疲労の起点になりやすい。鍛造では流線が形に沿って曲がり、隅が強い</p>
<h2>鍛造品の設計ルール</h2>
<ul>
  <li><b>パーティングライン</b> (上下型の合わせ目) を最大断面に。そこにバリが出るので機能面から外す</li>
  <li>抜き勾配 外側 3〜5°、内側 5〜7° 程度 (熱間型鍛造)。R は大きめ (材料が流れやすく型も長持ち)</li>
  <li>薄く広いウェブ、深く細いリブは材料が流れにくい。リブ高さはリブ幅の数倍以内に</li>
  <li>体積一定: 鍛造で形を変えても体積は変わらない。素材寸法はバリ・スケール分を足して決める</li>
</ul>
<h2>工法の選び方</h2>
<table class="tb-table">
  <tr><th>求めるもの</th><th>向く工法</th></tr>
  <tr><td>複雑な中空・内部通路、大物、振動吸収</td><td>鋳造 (鋳鉄は減衰が良く工作機械ベッドに)</td></tr>
  <tr><td>高い疲労強度・衝撃強さ (安全部品)</td><td>鍛造</td></tr>
  <tr><td>薄肉・複雑・大量・軽量</td><td>アルミダイカスト</td></tr>
  <tr><td>少量・試作</td><td>削り出し、溶接構造、3D プリント (砂型の 3D プリントも)</td></tr>
</table>`,
    points: [
      "鋳造: 砂型 (大物・少量)、ダイカスト (薄肉・大量)、ロストワックス (精密)",
      "鋳物は肉厚均一・R・抜き勾配・交差部回避で引け巣を防ぐ",
      "縮み代 (鋳鉄 約 1 %、アルミ 約 1.3 %、鋳鋼 約 2 %) と削り代を見込む",
      "鍛造はメタルフローが連続し疲労強度・靭性が高い",
      "鍛造は体積一定。パーティングライン・勾配・大きな R を設計で配慮",
    ],
    exercises: [
      {
        q: "長さ 200 mm のアルミ鋳物 (縮み代 1.3 %) を作ります。型 (模型) の長さはいくらにしますか?",
        a: "200 × (1 + 0.013) = <b>202.6 mm</b>。正確には L/(1 − 0.013) = 202.6 mm で、この大きさではほぼ同じです。",
      },
      {
        q: "φ40 × 高さ 60 mm の円柱素材を、高さ 30 mm まで据込み (アプセット) 鍛造します。たる形にならないと仮定すると直径はいくらになりますか?",
        a: "体積一定: π/4 × 40² × 60 = π/4 × D² × 30 より D² = 40² × 2 = 3200、<b>D ≈ 56.6 mm</b>。",
      },
    ],
    quiz: [
      { q: "鋳物で厚肉部が交差する所に発生しやすい欠陥は?", choices: ["引け巣", "スプリングバック", "研削焼け"], answer: 0, explain: "最後に固まる厚肉部では収縮を補う溶湯が届かず、空洞 (引け巣) になります。" },
      { q: "鍛造品が削り出し品より疲労に強い主な理由は?", choices: ["表面が粗いから", "メタルフローが形に沿って連続しているから", "密度が小さいから"], answer: 1, explain: "鍛流線が切れずに形に沿うことと、内部欠陥がつぶれることが理由です。" },
      { q: "アルミダイカスト ADC12 の部品について正しいのは?", choices: ["溶接・溶体化処理に向く", "内部の巣のため溶接や熱処理に不向き", "肉厚 10 mm 以上が基本"], answer: 1, explain: "高速充填で空気を巻き込みやすく、加熱すると巣がふくれる (ブリスタ) ため、溶接・熱処理は一般に避けます。" },
    ],
  },
  {
    id: "welding-joining",
    part: "knowhow",
    title: "溶接・接合技術 — 工法の選択とひずみの制御",
    minutes: 25,
    level: 2,
    lead: "溶接構造の強度計算は「溶接継手の強度」で扱いました。ここでは工法そのもの — アーク・TIG・MIG・スポット・ろう付・接着の違いと選び方、そして溶接で避けられない熱ひずみをどう抑えるかを学びます。",
    body: `
<h2>接合法の全体像</h2>
<table class="tb-table">
  <tr><th>工法</th><th>原理</th><th>主な材料・板厚</th><th>特徴</th></tr>
  <tr><td>被覆アーク溶接</td><td>被覆棒と母材の間のアーク</td><td>鋼、3 mm 以上</td><td>設備が安く屋外・現場向き。スラグ除去が必要</td></tr>
  <tr><td>CO₂ / MAG 溶接</td><td>ワイヤを自動送給、シールドガス (CO₂ や Ar+CO₂)</td><td>鋼、1〜数十 mm</td><td>能率が高く工場の鋼構造の主流。ロボット化しやすい</td></tr>
  <tr><td>MIG 溶接</td><td>不活性ガス (Ar) シールド</td><td>アルミ、ステンレス</td><td>アルミの中〜厚板に</td></tr>
  <tr><td>TIG 溶接</td><td>タングステン電極 (溶けない) + 溶加棒、Ar</td><td>ステンレス、アルミ、薄板 0.5 mm〜</td><td>ビードがきれいで高品質、遅い。外観部品・配管</td></tr>
  <tr><td>スポット溶接 (抵抗溶接)</td><td>電極で挟んで電流、抵抗発熱</td><td>鋼板の重ね、0.5〜3 mm</td><td>速い (1 点 1 秒未満)、溶加材不要。自動車ボディ</td></tr>
  <tr><td>レーザ溶接</td><td>レーザ光の集中熱</td><td>薄板〜中板</td><td>熱影響が小さくひずみが少ない。設備が高価</td></tr>
  <tr><td>ろう付・はんだ付</td><td>母材を溶かさず、低融点のろう材を流し込む</td><td>銅、鋼、ステンレス、異種金属</td><td>ひずみが小さく、細い隙間を一度に接合。強度は母材より低い</td></tr>
  <tr><td>接着</td><td>接着剤の硬化</td><td>金属・樹脂・複合材・異種材</td><td>応力が面で分散、穴を開けない。耐熱・はく離・経年に注意</td></tr>
  <tr><td>機械的接合</td><td>リベット、セルフピアスリベット、クリンチング</td><td>板</td><td>熱を入れない。アルミと鋼の異種接合にも</td></tr>
</table>
<h2>溶接部の構造と入熱</h2>
<p>溶接部は、溶けて固まった<b>溶接金属</b>、溶けなかったが熱で組織が変わった<b>熱影響部 (HAZ)</b>、母材からなります。熱影響部は硬くもろくなったり (炭素量の多い鋼)、逆に軟らかくなったり (熱処理アルミ A6061-T6 は強度が母材の 6 割程度まで落ちる) します。</p>
<div class="tb-formula">入熱 Q = η · V · I / v　[J/mm]　(V: アーク電圧、I: 電流、v: 溶接速度 mm/s、η: 熱効率)</div>
<p>入熱が大きいほど溶込みは深くなりますが、熱影響部が広がり、ひずみも大きくなります。</p>
<svg class="tb-chart" viewBox="0 30 520 172" role="img" aria-label="溶接部の断面">
  <g class="k-shadow">
    <path class="k-cut" d="M30,96 L226,96 L254,150 L30,150 Z"/>
    <path class="k-cut2" d="M294,96 L490,96 L490,150 L266,150 Z"/>
  </g>
  <path d="M206,96 L314,96 L284,150 L236,150 Z" style="fill:color-mix(in srgb, var(--tb-warn) 38%, transparent)"/>
  <path class="k-accent" d="M220,96 Q260,78 300,96 L268,150 Q260,160 252,150 Z" style="stroke-width:1.6"/>
  <path d="M232,108 Q260,98 288,108 M241,124 Q260,116 279,124 M249,139 Q260,133 271,139" fill="none" style="stroke:var(--tb-surface)" stroke-width="1" opacity="0.7"/>
  <line class="k-thin" x1="260" y1="60" x2="260" y2="86" style="stroke:var(--k-line)"/>
  <text class="mark-t" x="260" y="54" text-anchor="middle">溶接金属 (ビード)</text>
  <circle cx="220" cy="96" r="5" fill="none" style="stroke:var(--tb-bad)" stroke-width="1.8"/>
  <line class="k-thin" x1="216" y1="92" x2="180" y2="70" style="stroke:var(--tb-bad)"/>
  <text class="k-bad-t" x="176" y="68" text-anchor="end">止端 (き裂の起点)</text>
  <line class="k-thin" x1="296" y1="118" x2="330" y2="178" style="stroke:var(--k-line)"/>
  <text class="mark-t" x="334" y="182">熱影響部 (HAZ)</text>
  <line class="k-thin" x1="440" y1="130" x2="440" y2="170" style="stroke:var(--k-line)"/>
  <text class="mark-t" x="440" y="186" text-anchor="middle">母材</text>
  <text class="mark-t" x="60" y="186" text-anchor="middle">母材</text><line class="k-thin" x1="60" y1="130" x2="60" y2="170" style="stroke:var(--k-line)"/>
</svg>
<p class="tb-caption">図: 突合せ溶接部の断面 (模式図)。溶接金属のまわりの熱影響部 (HAZ) は、溶けていなくても組織と強度が変わる。疲労き裂は止端 (ビードと母材の境目) から発生しやすい</p>
<h2>溶接ひずみ — なぜ起き、どう抑えるか</h2>
<p>溶接部は加熱されて膨張しようとしますが、まわりの冷たい母材に拘束されて縮み、冷えるとさらに縮みます。結果として溶接線の近くに<b>引張残留応力</b>が残り、部材は<b>縮み・角変形・反り</b>を起こします。</p>
<svg class="tb-chart" viewBox="0 0 520 202" role="img" aria-label="溶接ひずみの種類">
  <rect class="k-panel" x="8" y="8" width="160" height="162" rx="8"/><rect class="k-panel" x="180" y="8" width="160" height="162" rx="8"/><rect class="k-panel" x="352" y="8" width="160" height="162" rx="8"/>
  <text class="k-title" x="88" y="30" text-anchor="middle">縦・横収縮</text>
  <text class="k-title" x="260" y="30" text-anchor="middle">角変形</text>
  <text class="k-title" x="432" y="30" text-anchor="middle">縦曲がり (反り)</text>
  <rect x="30" y="58" width="116" height="84" fill="none" style="stroke:var(--tb-bad)" stroke-width="1.4" stroke-dasharray="5 3"/>
  <g class="k-shadow"><rect class="k-part" x="40" y="66" width="96" height="68"/></g>
  <rect x="84" y="66" width="8" height="68" style="fill:url(#k-accent);stroke:var(--k-dim)" stroke-width="1"/>
  <line class="k-move" x1="16" y1="100" x2="36" y2="100"/><line class="k-move" x1="160" y1="100" x2="140" y2="100"/>
  <line class="k-move" x1="62" y1="40" x2="62" y2="62"/>
  <text class="k-note" x="88" y="162" text-anchor="middle">上から見た図</text>
  <rect x="196" y="104" width="128" height="10" fill="none" style="stroke:var(--tb-bad)" stroke-width="1.4" stroke-dasharray="5 3"/>
  <g class="k-shadow">
    <g transform="rotate(12 260 104)"><rect class="k-part" x="198" y="104" width="60" height="10"/></g>
    <g transform="rotate(-12 260 104)"><rect class="k-part" x="262" y="104" width="60" height="10"/></g>
  </g>
  <path d="M250,104 Q260,94 270,104 Z" style="fill:url(#k-accent);stroke:var(--k-dim)" stroke-width="1"/>
  <line class="k-move" x1="206" y1="96" x2="206" y2="78"/><line class="k-move" x1="314" y1="96" x2="314" y2="78"/>
  <text class="k-note" x="260" y="150" text-anchor="middle">断面 (ビードは上)</text>
  <rect x="370" y="98" width="124" height="10" fill="none" style="stroke:var(--tb-bad)" stroke-width="1.4" stroke-dasharray="5 3"/>
  <g class="k-shadow"><path class="k-part" d="M370,84 Q432,118 494,84 L494,94 Q432,128 370,94 Z"/></g>
  <path d="M372,83 Q432,115 492,83" fill="none" style="stroke:var(--tb-accent)" stroke-width="3"/>
  <line class="k-move" x1="378" y1="104" x2="378" y2="80" style="stroke-width:1.6"/><line class="k-move" x1="486" y1="104" x2="486" y2="80" style="stroke-width:1.6"/>
  <text class="k-note" x="432" y="150" text-anchor="middle">側面 (ビードは上面)</text>
  <text class="lbl" x="260" y="192" text-anchor="middle">片側から溶接すると、ビード側が縮んでそちらに曲がる</text>
</svg>
<p class="tb-caption">図: 溶接ひずみの代表的な 3 つの形。破線は溶接前の形。どれも溶接金属が冷えて縮むことが原因</p>
<table class="tb-table">
  <tr><th>対策</th><th>内容</th></tr>
  <tr><td>溶接量を減らす</td><td>脚長を必要最小限に (脚長を 2 倍にするとビード断面積は 4 倍)。連続溶接を断続溶接に</td></tr>
  <tr><td>対称に溶接する</td><td>X 開先・両側隅肉で表裏を交互に。中央から外へ、対称順序で</td></tr>
  <tr><td>逆ひずみ</td><td>あらかじめ反対方向に曲げておき、溶接後にまっすぐになるようにする</td></tr>
  <tr><td>拘束 (治具)</td><td>治具・仮付けで固定して変形を抑える。ただし残留応力は大きくなる</td></tr>
  <tr><td>入熱の小さい工法</td><td>レーザ・パルス MIG・スポットなど</td></tr>
  <tr><td>後処理</td><td>応力除去焼なまし (鋼で 600〜650 °C)、ひずみ取り (加熱・プレス)、溶接後の機械加工</td></tr>
</table>
<div class="tb-tip"><b>設計の鉄則</b>: 精度が必要な取付面・穴は<b>溶接後に機械加工</b>する前提で、削り代 (2〜3 mm) を付けた図面にします。溶接後の応力除去焼なましを入れると、加工後の変形 (残留応力の解放) も防げます。</div>
<h2>溶接性 — 材料による違い</h2>
<ul>
  <li><b>SS400・SM490</b>: 溶接しやすい。厚板は予熱が必要なことがある (炭素当量で判断 → 「鉄鋼材料の選び方」)</li>
  <li><b>S45C・SCM440</b>: 炭素・合金が多く、HAZ が焼き入って割れやすい。予熱・後熱が必須で、構造部材の溶接には基本的に使わない</li>
  <li><b>SUS304</b>: 溶接できるが、熱で炭化物が析出し耐食性が落ちる (鋭敏化)。低炭素の SUS304L・SUS316L を選ぶ。熱膨張が大きくひずみやすい</li>
  <li><b>アルミ</b>: 熱伝導が大きく酸化皮膜が強固で難しい (TIG・MIG)。A5052・A5083 は溶接性が良い。A6061 は HAZ が軟化、<b>A7075 は溶接割れのため原則不可</b></li>
</ul>
<h2>ろう付と接着の設計</h2>
<ul>
  <li><b>ろう付</b>: 隙間は 0.05〜0.15 mm 程度 (毛細管現象で流れる)。重ね長さは板厚の 3 倍程度以上。突合せより<b>重ね継手</b></li>
  <li><b>接着</b>: せん断で受け、<b>はく離 (ピール) と割裂</b>を避ける形に。重ね長さを伸ばしても強度は比例して増えない (端部に応力が集中する)。表面の脱脂・粗化が強度を左右する</li>
</ul>
<svg class="tb-chart" viewBox="0 0 520 172" role="img" aria-label="接着継手の荷重方向">
  <rect class="k-panel" x="8" y="8" width="244" height="156" rx="8"/><rect class="k-panel" x="268" y="8" width="244" height="156" rx="8"/>
  <circle class="k-badge" cx="28" cy="28" r="10" style="fill:var(--tb-good)"/><text class="k-badge-t" x="28" y="32" text-anchor="middle">✓</text><text class="k-title" x="46" y="32">せん断</text>
  <circle class="k-badge" cx="288" cy="28" r="10" style="fill:var(--tb-bad)"/><text class="k-badge-t" x="288" y="32" text-anchor="middle">✕</text><text class="k-title" x="306" y="32">はく離</text>
  <g class="k-shadow">
    <rect class="k-alu" x="44" y="76" width="106" height="12"/>
    <rect class="k-alu" x="110" y="92" width="106" height="12"/>
  </g>
  <rect x="110" y="88" width="40" height="4" style="fill:var(--tb-good)"/>
  <path d="M116,90 h28" style="stroke:#fff" stroke-width="0.8" stroke-dasharray="2 3"/>
  <line class="k-force" x1="42" y1="82" x2="16" y2="82"/><line class="k-force" x1="218" y1="98" x2="244" y2="98"/>
  <text class="k-note" x="130" y="124" text-anchor="middle">接着面全体で力を受ける</text>
  <text class="k-good-t" x="130" y="150" text-anchor="middle">せん断: 強い</text>
  <g class="k-shadow">
    <rect class="k-alu" x="290" y="98" width="200" height="12"/>
  </g>
  <path d="M290,88 L398,88 Q438,88 462,52" fill="none" style="stroke:var(--k-line)" stroke-width="13"/>
  <path d="M290,88 L398,88 Q438,88 462,52" fill="none" style="stroke:var(--k-alu-1)" stroke-width="10"/>
  <rect x="290" y="94" width="104" height="4" style="fill:var(--k-line-2)"/>
  <rect x="388" y="93" width="8" height="6" style="fill:var(--tb-bad)" class="k-glow"/>
  <line class="k-force" x1="466" y1="48" x2="480" y2="22"/>
  <line class="k-thin" x1="394" y1="100" x2="404" y2="122" style="stroke:var(--tb-bad)"/><text class="k-note" x="406" y="130" style="fill:var(--tb-bad)">端の 1 線に集中</text>
  <text class="k-bad-t" x="390" y="152" text-anchor="middle">はく離: 端の 1 線で受けて弱い</text>
</svg>
<p class="tb-caption">図: 接着継手の荷重方向。重ね継手を引っ張るせん断では接着面全体で力を受ける (左)。端からめくるはく離では、力が端の狭い範囲に集中し、数分の 1 の力で破壊する (右)</p>`,
    points: [
      "鋼構造は MAG、ステンレス薄板・外観は TIG、アルミは MIG/TIG、薄板の重ねはスポット",
      "入熱 Q = ηVI/v が大きいほど HAZ とひずみが大きい",
      "ひずみ対策: 溶接量を減らす・対称順序・逆ひずみ・拘束・後加工",
      "S45C・SCM・A7075 は溶接に不向き。ステンレスは L 材、A6061 は HAZ 軟化",
      "ろう付は隙間 0.05〜0.15 mm の重ね継手、接着はせん断で受けてはく離を避ける",
    ],
    exercises: [
      {
        q: "MAG 溶接でアーク電圧 24 V、電流 200 A、溶接速度 5 mm/s、熱効率 0.8 のとき、入熱 Q を求めてください。",
        a: "Q = 0.8 × 24 × 200 / 5 = 3840 / 5 = <b>768 J/mm</b> (η を含めない値は 960 J/mm)。",
      },
      {
        q: "隅肉溶接の脚長を 6 mm から 8 mm に増やすと、ビードの断面積 (= 溶着量・入熱の目安) は何倍になりますか?",
        a: "隅肉の断面は直角二等辺三角形で面積 = 脚長² / 2。(8/6)² = <b>約 1.78 倍</b>。強度 (のど厚) は 1.33 倍しか増えないのに、ひずみと時間は約 1.8 倍になります。",
      },
      {
        q: "せん断強さ 10 MPa の接着剤で、幅 25 mm、重ね長さ 12.5 mm の単純重ね継手を作ります。破断荷重の目安はいくらですか?",
        a: "F = τ × A = 10 × 25 × 12.5 = <b>3125 N (約 3.1 kN)</b>。ただし実際は端部に応力集中があるので、重ね長さを 2 倍にしても破断荷重は 2 倍にはなりません。",
      },
    ],
    quiz: [
      { q: "ステンレス薄板の外観部品で、ビードをきれいに仕上げたい。適した溶接法は?", choices: ["被覆アーク溶接", "TIG 溶接", "スポット溶接のみ"], answer: 1, explain: "TIG はスパッタがなく、入熱を細かく調整できるため薄板・外観部品に適します。" },
      { q: "溶接ひずみの対策として誤っているのは?", choices: ["脚長を必要以上に大きくする", "表裏を交互に対称に溶接する", "逆ひずみを与えておく"], answer: 0, explain: "脚長を大きくすると溶着量が 2 乗で増え、ひずみも大きくなります。" },
      { q: "溶接構造に原則として使わないアルミ合金は?", choices: ["A5052", "A5083", "A7075"], answer: 2, explain: "A7075 は溶接割れが起きやすく、HAZ の強度低下も大きいため溶接構造には使いません。" },
    ],
    lessons: ["6-10"],
  },
  {
    id: "press-sheet-detail",
    part: "knowhow",
    title: "プレス・板金加工の詳細 — 打抜き・曲げ・絞り",
    minutes: 25,
    level: 3,
    lead: "「板金と溶接の設計」では曲げ半径や穴位置のルールを学びました。ここでは、打抜きのせん断力とクリアランス、曲げのスプリングバック、深絞りの限界といった、プレス加工の現象そのものを数値で理解し、量産金型のコストと品質を左右する設計判断ができるようにします。",
    body: `
<h2>板金加工とプレス加工</h2>
<table class="tb-table">
  <tr><th></th><th>板金 (レーザ + ベンダ)</th><th>プレス (専用金型)</th></tr>
  <tr><td>数量</td><td>1〜数千個</td><td>数千〜数百万個</td></tr>
  <tr><td>型代</td><td>汎用型のみ (ほぼ 0)</td><td>数十万〜数千万円</td></tr>
  <tr><td>1 個の時間</td><td>数分</td><td>数秒以下 (順送型は 1 ストロークで 1 個)</td></tr>
  <tr><td>できる形</td><td>切断と直線曲げ</td><td>絞り・張出し・バーリング・エンボスなど立体形状</td></tr>
</table>
<h2>打抜き (せん断) — 力とクリアランス</h2>
<p>パンチとダイの間で板をせん断して穴をあけたり外形を抜いたりします。必要な力は</p>
<div class="tb-formula">打抜き力 F = L · t · τ<sub>s</sub>　(L: 切り口の長さ、t: 板厚、τ<sub>s</sub>: せん断抵抗 ≈ 0.8 × 引張強さ)</div>
<p>パンチとダイの片側すき間 (<b>クリアランス</b>) は板厚の 5〜10 % (軟鋼)、アルミで 4〜8 %、ステンレスはやや大きめが目安です。切り口は、上から<b>だれ・せん断面・破断面・かえり (バリ)</b> の 4 つの層になります。</p>
<svg class="tb-chart" viewBox="0 0 520 218" role="img" aria-label="打抜きの切り口">
  <line class="k-force" x1="156" y1="8" x2="156" y2="28"/>
  <g class="k-shadow">
    <rect class="k-part" x="116" y="30" width="80" height="62" rx="2"/>
    <rect class="k-part" x="20" y="112" width="92" height="58"/>
    <rect class="k-part" x="200" y="112" width="90" height="58"/>
    <path class="k-cut" d="M20,92 L116,92 L112,112 L20,112 Z"/>
    <path class="k-cut" d="M196,92 L290,92 L290,112 L200,112 Z"/>
    <path class="k-cut" d="M116,98 L196,98 L200,118 L112,118 Z"/>
  </g>
  <path d="M116,92 L112,112 M196,92 L200,112" style="stroke:var(--tb-bad)" stroke-width="1.6" stroke-dasharray="3 2"/>
  <text class="mark-t" x="156" y="66" text-anchor="middle">パンチ</text>
  <text class="mark-t" x="66" y="146" text-anchor="middle">ダイ</text><text class="mark-t" x="245" y="146" text-anchor="middle">ダイ</text>
  <text class="k-note" x="24" y="86">板</text>
  <path class="k-ext" d="M196,96 V194 M200,174 V194"/>
  <line class="k-dimline" x1="182" y1="190" x2="196" y2="190" style="marker-start:none"/><line class="k-dimline" x1="214" y1="190" x2="200" y2="190" style="marker-start:none"/>
  <text class="k-dimtext" x="198" y="208" text-anchor="middle">クリアランス c (片側)</text>
  <line x1="306" y1="10" x2="306" y2="210" style="stroke:var(--tb-border)"/>
  <text class="k-title" x="320" y="30">切り口 (拡大)</text>
  <g class="k-shadow"><path class="k-cut" d="M326,60 L380,60 Q392,60 394,74 L396,116 L404,168 L408,182 L402,182 L398,172 L326,172 Z"/></g>
  <path d="M380,60 Q392,60 394,74" fill="none" style="stroke:var(--tb-text-2)" stroke-width="3"/>
  <path d="M394,74 L396,116" fill="none" style="stroke:var(--tb-good)" stroke-width="5"/>
  <path d="M396,116 L398,124 L397,132 L400,140 L399,148 L402,156 L401,164 L404,168" fill="none" style="stroke:var(--tb-warn)" stroke-width="3"/>
  <path d="M404,168 L408,182 L402,182" fill="none" style="stroke:var(--tb-bad)" stroke-width="2.4"/>
  <path class="k-thin" d="M394,64 H420 M398,96 H420 M402,142 H420 M406,180 H420" style="stroke:var(--k-line)"/>
  <text class="mark-t" x="424" y="68">だれ</text>
  <text class="mark-t" x="424" y="96">せん断面</text><text class="k-note" x="424" y="110">(光沢)</text>
  <text class="mark-t" x="424" y="142">破断面</text><text class="k-note" x="424" y="156">(ざらざら)</text>
  <text class="mark-t" x="424" y="184">かえり</text><text class="k-note" x="424" y="198">(バリ)</text>
</svg>
<p class="tb-caption">図: 打抜きの断面 (左) と切り口の 4 層 (右)。クリアランスが小さいとせん断面が増えて切り口はきれいだが力と型摩耗が増え、大きいとだれ・バリが増える。図面ではバリの方向 (かえり方向) を指示することがある</p>
<ul>
  <li>穴径 ≥ 板厚 (軟鋼)、ステンレスは 1.5〜2 倍。小径パンチは座屈・折損する</li>
  <li>穴と縁・穴と穴の距離 ≥ 板厚 (できれば 1.5〜2 倍)</li>
  <li>精度の要る穴は<b>シェービング</b>やファインブランキングで全面をせん断面にできる</li>
  <li>外形に鋭い角や細い突起があると型が欠けやすい。R 0.5t 以上を付ける</li>
</ul>
<h2>曲げとスプリングバック</h2>
<p>曲げた板は、荷重を抜くと弾性ひずみの分だけ戻ります (<b>スプリングバック</b>)。弾完全塑性体の簡単なモデルでは</p>
<div class="tb-formula">R<sub>i</sub> / R<sub>f</sub> = 4x³ − 3x + 1、　x = R<sub>i</sub> · σ<sub>y</sub> / (E · t)　(R<sub>i</sub>: 曲げ中の内 R、R<sub>f</sub>: 除荷後の内 R)</div>
<p>戻りが大きくなるのは、<b>降伏点が高い</b> (高張力鋼・ステンレス)、<b>ヤング率が小さい</b> (アルミは鋼の約 1/3)、<b>R/t が大きい</b> 場合です。下の図で材料と R/t を変えて確かめてください。</p>
<div data-widget="anim-springback"></div>
<table class="tb-table">
  <tr><th>補正法</th><th>内容</th></tr>
  <tr><td>見込み曲げ (オーバーベンド)</td><td>戻り分だけ余分に曲げる。ベンダの角度補正</td></tr>
  <tr><td>ボトミング・コイニング</td><td>パンチで底まで強く押し、曲げ部を塑性変形させて戻りを減らす</td></tr>
  <tr><td>形状で抑える</td><td>曲げ部にリブ (ビード) を入れる、フランジ端を折り返す</td></tr>
  <tr><td>設計で許す</td><td>角度公差を ±1° 程度にとる。厳しい角度は相手側で決める</td></tr>
</table>
<p class="tb-note">曲げの<b>方向</b>も大切です。圧延方向に平行に曲げ線を置くと (繊維に沿って曲げる) 割れやすいので、小さい R で曲げるときは曲げ線を圧延方向と直角にします。</p>
<h2>深絞り — 板から容器を作る</h2>
<p>平らな円板 (ブランク) をパンチでダイに押し込み、継ぎ目のないカップを作ります。フランジ部が円周方向に縮みながら流れ込むため、しわ押え力でしわを防ぎます。</p>
<div class="tb-formula">円筒カップのブランク径 D ≈ √(d² + 4 d h)　　絞り率 m = d / D (1 回目は 0.5〜0.6 が限界の目安)</div>
<svg class="tb-chart" viewBox="0 0 520 196" role="img" aria-label="深絞りの断面">
  <line class="k-force" x1="154" y1="6" x2="154" y2="26"/>
  <g class="k-shadow">
    <path class="k-part" d="M24,110 L98,110 Q104,110 104,116 L104,172 L24,172 Z"/>
    <path class="k-part" d="M284,110 L210,110 Q204,110 204,116 L204,172 L284,172 Z"/>
    <rect class="k-alu" x="24" y="70" width="80" height="30"/>
    <rect class="k-alu" x="204" y="70" width="80" height="30"/>
    <path class="k-part-h" d="M110,30 L198,30 L198,152 Q198,160 190,160 L118,160 Q110,160 110,152 Z"/>
  </g>
  <path d="M14,104 L100,104 Q107,104 107,111 L107,154 Q107,163 116,163 L192,163 Q201,163 201,154 L201,111 Q201,104 208,104 L294,104" fill="none" style="stroke:var(--tb-accent)" stroke-width="4"/>
  <text class="mark-t" x="154" y="100" text-anchor="middle">パンチ</text>
  <text class="mark-t" x="64" y="90" text-anchor="middle">しわ押え</text><text class="mark-t" x="244" y="90" text-anchor="middle">しわ押え</text>
  <text class="mark-t" x="64" y="146" text-anchor="middle">ダイ</text><text class="mark-t" x="244" y="146" text-anchor="middle">ダイ</text>
  <line class="k-move" x1="34" y1="60" x2="80" y2="60"/><line class="k-move" x1="274" y1="60" x2="228" y2="60"/>
  <path d="M286,98 q2,-4 4,0 q2,4 4,0" fill="none" style="stroke:var(--tb-warn)" stroke-width="1.6"/>
  <circle cx="198" cy="160" r="9" fill="none" style="stroke:var(--tb-bad)" stroke-width="1.8" stroke-dasharray="3 2"/>
  <circle cx="110" cy="160" r="9" fill="none" style="stroke:var(--tb-bad)" stroke-width="1.8" stroke-dasharray="3 2"/>
  <rect class="k-panel" x="312" y="40" width="200" height="56" rx="8"/>
  <text class="lbl" x="324" y="62" style="fill:var(--tb-warn)">流入するフランジ:</text><text class="k-note" x="324" y="82">周方向に縮む → しわ</text>
  <rect class="k-panel" x="312" y="110" width="200" height="56" rx="8"/>
  <text class="lbl" x="324" y="132" style="fill:var(--tb-bad)">パンチ肩 R 付近 (赤丸):</text><text class="k-note" x="324" y="152">板が薄くなる → 割れ</text>
</svg>
<p class="tb-caption">図: 円筒深絞りの断面。フランジは縮みながら流れ込み (しわの原因)、パンチ肩の近くは引き伸ばされて薄くなる (割れの原因)。しわ押え力・ダイ肩 R・潤滑のバランスで成形する</p>
<ul>
  <li>パンチ肩 R・ダイ肩 R は板厚の 4〜10 倍程度。小さいと割れる</li>
  <li>深いカップは数回に分けて絞る (再絞り率 0.7〜0.8 程度)。工程数が型代に直結する</li>
  <li>四角い容器は角の R を大きく。角に材料が集まってしわ・割れが出やすい</li>
  <li>板厚は場所で変わる (底の角で薄く、口元で厚く)。強度計算は最も薄い所で</li>
</ul>
<h2>その他の成形とプレス品の設計</h2>
<ul>
  <li><b>バーリング</b>: 下穴を広げて筒状のフランジを立てる。薄板にタップを立てられる (ねじ山を増やせる)</li>
  <li><b>エンボス・ビード</b>: 浅い凹凸で剛性を上げる。平板のたわみ・鳴きを抑える</li>
  <li><b>順送型</b>: 帯板を送りながら複数工程を 1 つの型で行う。キャリア (つなぎ) と送りピッチを考慮した形にする</li>
  <li>材料歩留り: ブランクを帯板にどう並べるか (ネスティング) で材料費が大きく変わる</li>
</ul>`,
    points: [
      "打抜き力 F = L·t·τs (τs ≈ 0.8σB)、クリアランスは片側で板厚の 5〜10 % (軟鋼)",
      "切り口はだれ・せん断面・破断面・バリの 4 層。バリ方向を指示する",
      "スプリングバックは σy/E と R/t が大きいほど大きい — アルミ・高張力鋼・ステンレスで注意",
      "深絞りのブランク径 D ≈ √(d²+4dh)、1 回目の絞り率 d/D は 0.5〜0.6 が限界",
      "プレスは型代が高く単価が安い。数量で板金と使い分ける",
    ],
    exercises: [
      {
        q: "板厚 2 mm、せん断抵抗 300 MPa の鋼板に φ20 の穴を打ち抜きます。必要な打抜き力を求めてください。",
        a: "L = π × 20 = 62.8 mm、F = 62.8 × 2 × 300 ≈ 37,700 N ≈ <b>37.7 kN (約 3.8 tf)</b>。プレス機は余裕をみて 1.3 倍程度以上の能力のものを選びます。",
      },
      {
        q: "内径 d = 50 mm、高さ h = 30 mm の円筒カップを深絞りします (板厚は無視、底の R は無視)。ブランク径と絞り率を求め、1 回で絞れるか判断してください。",
        a: "D = √(50² + 4 × 50 × 30) = √(2500 + 6000) = √8500 ≈ <b>92.2 mm</b>。m = 50 / 92.2 ≈ <b>0.54</b>。限界の目安 0.5〜0.6 の範囲内なので 1 回で絞れる可能性はありますが余裕は小さく、条件 (材料・R・潤滑) 次第で 2 工程にします。",
      },
      {
        q: "A5052-H32 (σy = 195 MPa、E = 70 GPa) の板厚 1 mm を内 R 2 mm で 90° 曲げます。スプリングバック後の角度を、x = Ri σy/(E t)、Ri/Rf = 4x³ − 3x + 1、中立面の長さ一定 θi(Ri + t/2) = θf(Rf + t/2) で求めてください。",
        a: "x = 2 × 195 / 70000 = 0.00557。Ri/Rf = 1 − 3 × 0.00557 + (ほぼ 0) = 0.9833 → Rf = 2.034 mm。θf = 90 × 2.5 / 2.534 ≈ <b>88.8° (約 1.2° 戻る)</b>。同じ条件の SPCC (σy 200 MPa、E 206 GPa) では約 0.4° で、アルミは約 3 倍戻ります。",
      },
    ],
    quiz: [
      { q: "打抜きのクリアランスを大きくしすぎると?", choices: ["だれ・バリが大きくなる", "せん断面が増えて切り口がきれいになる", "打抜き力が 2 倍になる"], answer: 0, explain: "クリアランスが大きいと板が引きちぎられるように破断し、だれとバリが増えます。" },
      { q: "スプリングバックが最も大きくなるのは? (同じ R/t)", choices: ["SPCC", "A5052", "どれも同じ"], answer: 1, explain: "戻りは σy/E に比例的。A5052 は降伏点は SPCC と同程度でもヤング率が約 1/3 なので約 3 倍戻ります。" },
      { q: "深絞りでパンチ肩付近に起きやすい不良は?", choices: ["しわ", "割れ (板厚減少による)", "引け巣"], answer: 1, explain: "パンチ肩付近は引張で板が薄くなり、割れやすい部分です。しわはフランジ部で起きます。" },
    ],
    lessons: ["8-3"],
  },
  {
    id: "steel-selection",
    part: "basics",
    title: "鉄鋼材料の選び方 — JIS 記号と熱処理",
    minutes: 25,
    level: 2,
    lead: "SS400、S45C、SCM440、SUS304 — 図面に書く鋼の記号には意味があり、選び方次第で強度もコストも加工性も大きく変わります。JIS 記号の読み方、代表鋼種の強さと使い分け、熱処理でどう性質が変わるかを整理します。",
    body: `
<h2>JIS 記号の読み方</h2>
<table class="tb-table">
  <tr><th>記号</th><th>規格</th><th>意味</th></tr>
  <tr><td><b>SS</b>400</td><td>JIS G 3101 一般構造用圧延鋼材</td><td>Steel Structure。数字は<b>引張強さの下限</b> (400 MPa)。成分は P・S 以外ほぼ規定なし</td></tr>
  <tr><td><b>SM</b>490A</td><td>JIS G 3106 溶接構造用圧延鋼材</td><td>Steel Marine (溶接用)。C・Mn を規定し溶接性を保証。A/B/C は衝撃値</td></tr>
  <tr><td>S<b>45</b>C</td><td>JIS G 4051 機械構造用炭素鋼</td><td>炭素量 <b>0.45 %</b> 前後 (0.42〜0.48 %)。焼入れできる</td></tr>
  <tr><td>SCM<b>4</b>40</td><td>JIS G 4053 機械構造用合金鋼</td><td>Cr-Mo 鋼。4 は主要合金量の区分、<b>40</b> は炭素量 0.40 %</td></tr>
  <tr><td>SUS304</td><td>JIS G 4303 / 4304 ステンレス鋼</td><td>Steel Use Stainless。300 番台はオーステナイト系、400 番台はフェライト・マルテンサイト系</td></tr>
  <tr><td>SPCC</td><td>JIS G 3141 冷間圧延鋼板</td><td>Steel Plate Cold Commercial。板金の基本。SPHC は熱間圧延</td></tr>
  <tr><td>SECC</td><td>JIS G 3313 電気亜鉛めっき鋼板</td><td>SPCC に亜鉛めっき。筐体・家電</td></tr>
  <tr><td>SK、SKD、SKH</td><td>工具鋼</td><td>SK: 炭素工具鋼、SKD11: 冷間金型、SKH: 高速度鋼 (ハイス)</td></tr>
  <tr><td>SUJ2</td><td>JIS G 4805 高炭素クロム軸受鋼</td><td>C 1 %・Cr 1.5 %。軸受、焼入れピン</td></tr>
</table>
<h2>代表鋼種の機械的性質</h2>
<table class="tb-table">
  <tr><th>鋼種</th><th>状態</th><th>降伏点 / 耐力 (MPa)</th><th>引張強さ (MPa)</th><th>硬さの目安</th><th>主な用途</th></tr>
  <tr><td>SS400</td><td>圧延のまま</td><td>≥ 245 (t ≤ 16)</td><td>400〜510</td><td>HB 120 前後</td><td>フレーム、ブラケット、ベース</td></tr>
  <tr><td>S45C</td><td>焼ならし (N)</td><td>≥ 345</td><td>≥ 570</td><td>HB 167〜229</td><td>一般の軸・ピン (生材)</td></tr>
  <tr><td>S45C</td><td>焼入れ焼戻し (H)</td><td>≥ 490</td><td>≥ 690</td><td>HB 201〜269</td><td>強度が要る軸・歯車</td></tr>
  <tr><td>SCM440</td><td>焼入れ焼戻し</td><td>≥ 835</td><td>≥ 980</td><td>HB 285〜352</td><td>高強度ボルト、重荷重の軸・歯車</td></tr>
  <tr><td>SUS304</td><td>固溶化熱処理</td><td>≥ 205</td><td>≥ 520</td><td>HB ≤ 187</td><td>耐食部品、食品・医療機器</td></tr>
  <tr><td>SUS430</td><td>焼なまし</td><td>≥ 205</td><td>≥ 420</td><td>HB ≤ 183</td><td>厨房機器、内装 (安価、磁性あり)</td></tr>
</table>
<p class="tb-note">数値は JIS 規格の代表値 (S45C・SCM440 は JIS G 4051/4053 参考の熱処理後、試験片寸法による)。実際の丸棒は太いほど中心まで焼きが入らず (質量効果)、強さが下がります。ヤング率はどの鋼でもほぼ同じ 約 206 GPa (ステンレスは 約 193 GPa) です。</p>
<svg class="tb-chart" viewBox="0 0 520 220" role="img" aria-label="鋼種別の降伏点と引張強さ">
  <path class="grid" d="M200,22 V190 M290,22 V190 M380,22 V190 M470,22 V190"/>
  <line class="axis" x1="110" y1="190" x2="500" y2="190"/><line class="axis" x1="110" y1="20" x2="110" y2="190"/>
  <text class="tick" x="110" y="206" text-anchor="middle">0</text><text class="tick" x="290" y="206" text-anchor="middle">500</text><text class="tick" x="470" y="206" text-anchor="middle">1000 MPa</text>
  <rect x="110" y="30" width="88" height="10" rx="2" style="fill:var(--tb-accent)"/><rect x="110" y="42" width="144" height="10" rx="2" style="fill:var(--tb-text-3)"/><text class="mark-t" x="102" y="46" text-anchor="end">SS400</text>
  <rect x="110" y="62" width="124" height="10" rx="2" style="fill:var(--tb-accent)"/><rect x="110" y="74" width="205" height="10" rx="2" style="fill:var(--tb-text-3)"/><text class="mark-t" x="102" y="78" text-anchor="end">S45C (N)</text>
  <rect x="110" y="94" width="176" height="10" rx="2" style="fill:var(--tb-accent)"/><rect x="110" y="106" width="248" height="10" rx="2" style="fill:var(--tb-text-3)"/><text class="mark-t" x="102" y="110" text-anchor="end">S45C (QT)</text>
  <rect x="110" y="126" width="301" height="10" rx="2" style="fill:var(--tb-accent)"/><rect x="110" y="138" width="353" height="10" rx="2" style="fill:var(--tb-text-3)"/><text class="mark-t" x="102" y="142" text-anchor="end">SCM440 (QT)</text>
  <rect x="110" y="158" width="74" height="10" rx="2" style="fill:var(--tb-accent)"/><rect x="110" y="170" width="187" height="10" rx="2" style="fill:var(--tb-text-3)"/><text class="mark-t" x="102" y="174" text-anchor="end">SUS304</text>
  <rect x="366" y="24" width="140" height="40" rx="6" style="fill:var(--tb-surface);stroke:var(--tb-border)"/>
  <rect x="376" y="31" width="10" height="10" rx="2" style="fill:var(--tb-accent)"/><text class="tick" x="392" y="40">降伏点・耐力 (下限)</text>
  <rect x="376" y="47" width="10" height="10" rx="2" style="fill:var(--tb-text-3)"/><text class="tick" x="392" y="56">引張強さ (下限)</text>
</svg>
<p class="tb-caption">図: 代表鋼種の降伏点 (耐力) と引張強さの規格下限値。同じ S45C でも焼入れ焼戻し (QT) で降伏点は約 1.4 倍、SCM440 の調質では SS400 の 3 倍以上になる。SUS304 は引張強さは高いが耐力は低く、降伏比が小さい (よく伸びる)</p>
<h2>使い分けの考え方</h2>
<ul>
  <li><b>溶接して作るフレーム・ベース → SS400</b> (厚板・重要構造は SM490)。安く、どこでも手に入る。SS400 は降伏点ではなく引張強さで規定されている点に注意</li>
  <li><b>削って作る軸・ピン → S45C</b>。強度・耐摩耗が要れば調質や高周波焼入れ</li>
  <li><b>大きな荷重・衝撃・小型化 → SCM435/440</b>。焼入れ性が良く太い軸でも中まで焼きが入る</li>
  <li><b>さびては困る → SUS304</b> (汎用)、SUS316 (塩水・薬品)、SUS430 (安価・磁性)。SUS303 は快削 (S 添加) だが耐食性・溶接性がやや劣る</li>
  <li><b>板金・筐体 → SPCC / SECC</b>。塗装するなら SPCC、無塗装で防錆するなら SECC や SUS</li>
</ul>
<h2>熱処理で性質が変わる仕組み</h2>
<p>炭素鋼は加熱して<b>オーステナイト</b> (約 750〜900 °C、炭素量で変わる) にしてから冷やします。冷やし方で組織が変わり、性質が大きく変わります。</p>
<table class="tb-table">
  <tr><th>処理</th><th>冷却</th><th>組織</th><th>結果</th></tr>
  <tr><td>焼なまし</td><td>炉内でゆっくり</td><td>フェライト + 粗いパーライト</td><td>最も軟らかい。加工性改善</td></tr>
  <tr><td>焼ならし</td><td>空冷</td><td>細かいパーライト</td><td>組織が均一・微細に。標準の状態</td></tr>
  <tr><td>焼入れ</td><td>水冷・油冷</td><td>マルテンサイト</td><td>非常に硬いがもろい (S45C で HRC 55 前後)</td></tr>
  <tr><td>焼入れ + 焼戻し (調質)</td><td>焼入れ後 550〜650 °C で再加熱</td><td>焼戻しマルテンサイト (ソルバイト)</td><td>強さとねばさのバランスが最良</td></tr>
</table>
<p><b>焼入れが効くのは炭素 0.3 % 以上</b>が目安です。SS400 (炭素量は規定なしで実際は 0.2 % 前後以下) はほとんど焼きが入りません。表面だけ硬くしたい低炭素鋼は浸炭焼入れを使います (→「熱処理と表面処理」)。</p>
<h2>硬さと強さ、溶接性の目安</h2>
<div class="tb-formula">引張強さ σ<sub>B</sub> ≈ 3.4〜3.5 × HB　[MPa]　(炭素鋼・低合金鋼の目安)</div>
<div class="tb-formula">炭素当量 C<sub>eq</sub> = C + Mn/6 + Si/24 + Ni/40 + Cr/5 + Mo/4 + V/14　[%]</div>
<p>炭素当量が 0.44 % 程度を超えると溶接部が硬化して割れやすくなり、予熱が必要になります。SS400 は 0.3 % 前後で溶接しやすく、S45C は 0.55 % を超えるため溶接構造には向きません。</p>`,
    points: [
      "SS400 の数字は引張強さ下限、S45C の数字は炭素量 0.45 %、SCM は Cr-Mo 鋼",
      "溶接フレームは SS400 (重要構造は SM490)、削る軸は S45C、高強度は SCM440",
      "調質で S45C の降伏点は約 1.4 倍、SCM440 は 835 MPa 以上",
      "焼入れが効くのは炭素 0.3 % 以上。太い材は質量効果で中心が硬くなりにくい",
      "SUS304 は汎用耐食、SUS316 は塩水、SUS430 は安価で磁性あり。ヤング率は鋼とほぼ同じ",
      "炭素当量 Ceq が大きい鋼は溶接割れしやすい",
    ],
    exercises: [
      {
        q: "S45C (C 0.45 %、Mn 0.75 %、Si 0.25 %、他は 0) の炭素当量を求め、溶接構造に向くか判断してください。",
        a: "Ceq = 0.45 + 0.75/6 + 0.25/24 = 0.45 + 0.125 + 0.0104 ≈ <b>0.585 %</b>。0.44 % を大きく超えるため、予熱・後熱なしでは溶接割れのおそれがあり、溶接構造には向きません。",
      },
      {
        q: "ブリネル硬さ HB 250 の調質鋼の引張強さを、σB ≈ 3.45 × HB で推定してください。",
        a: "σB ≈ 3.45 × 250 ≈ <b>860 MPa</b>。硬さ試験は非破壊に近いので、熱処理の確認に硬さを指示し、強度はこの換算で見積もるのが一般的です。",
      },
      {
        q: "φ20 の軸に引張荷重 100 kN がかかります。SS400 (降伏点 245 MPa) と SCM440 調質 (835 MPa) で、降伏に対する安全率はそれぞれいくらですか?",
        a: "応力 σ = 100000 / (π/4 × 20²) = 100000 / 314.2 ≈ 318 MPa。SS400: 245 / 318 ≈ <b>0.77 (降伏する)</b>。SCM440: 835 / 318 ≈ <b>2.6</b>。",
      },
    ],
    quiz: [
      { q: "「S45C」の「45」の意味は?", choices: ["引張強さ 450 MPa", "炭素量 約 0.45 %", "硬さ HRC 45"], answer: 1, explain: "機械構造用炭素鋼の数字は炭素量 (0.01 % 単位) を表します。SS400 の数字は引張強さです。" },
      { q: "磁石につき、SUS304 より安価で、厨房機器によく使われるステンレスは?", choices: ["SUS316", "SUS430", "SUS303"], answer: 1, explain: "SUS430 はフェライト系で磁性があり、Ni を含まないため安価です。" },
      { q: "SS400 の部品を焼入れしても硬くならない主な理由は?", choices: ["炭素量が少ない (0.2 % 前後以下)", "Cr が多すぎる", "ヤング率が低い"], answer: 0, explain: "焼入れで硬いマルテンサイトにするには炭素 0.3 % 以上が目安です。" },
    ],
    lessons: ["4-2"],
  },
  {
    id: "nonferrous-polymer-selection",
    part: "basics",
    title: "非鉄・樹脂・複合材料の選び方 — 材料選択チャート",
    minutes: 25,
    level: 3,
    lead: "アルミ合金・銅合金・エンジニアリングプラスチック・CFRP は、それぞれ得意な分野がはっきりしています。代表材種の性質と記号、そして Ashby の材料選択チャートと性能指標を使って「目的に合う材料を論理的に選ぶ」方法を学びます。",
    body: `
<h2>アルミニウム合金</h2>
<p>JIS の 4 桁番号の最初の数字が主な添加元素を表します。後ろの <b>-H32</b> や <b>-T6</b> は質別 (加工硬化・熱処理の状態) です。</p>
<table class="tb-table">
  <tr><th>合金</th><th>系</th><th>耐力 (MPa)</th><th>引張強さ (MPa)</th><th>特徴・用途</th></tr>
  <tr><td>A1050</td><td>1000 系 純アルミ</td><td>≈ 30 (O)</td><td>≈ 80</td><td>導電・熱伝導・成形性。強度は低い</td></tr>
  <tr><td>A2017</td><td>2000 系 Al-Cu (ジュラルミン)</td><td>≈ 275 (T4)</td><td>≈ 425</td><td>高強度の切削部品。耐食性が劣る</td></tr>
  <tr><td>A5052-H32</td><td>5000 系 Al-Mg</td><td>≈ 195</td><td>≈ 230</td><td>板金の定番。耐食・溶接性良好</td></tr>
  <tr><td>A6061-T6</td><td>6000 系 Al-Mg-Si</td><td>≈ 275</td><td>≈ 310</td><td>切削・構造材の定番。A6063 は押出形材 (アルミフレーム)</td></tr>
  <tr><td>A7075-T6</td><td>7000 系 Al-Zn-Mg</td><td>≈ 505</td><td>≈ 570</td><td>超々ジュラルミン。航空機・高強度部品。溶接不可、応力腐食に注意</td></tr>
</table>
<p class="tb-note">値は代表値 (規格下限はこれより低い)。アルミのヤング率は合金によらず約 69〜72 GPa、密度は約 2.7 g/cm³ です。</p>
<h2>銅合金とその他の金属</h2>
<table class="tb-table">
  <tr><th>材料</th><th>記号例</th><th>特徴・用途</th></tr>
  <tr><td>純銅 (タフピッチ銅)</td><td>C1100</td><td>導電率・熱伝導率が最高クラス。バスバー、放熱</td></tr>
  <tr><td>快削黄銅</td><td>C3604</td><td>Cu-Zn-Pb。最も削りやすい金属の 1 つ。継手、ねじ部品 (鉛規制品は鉛レス黄銅)</td></tr>
  <tr><td>黄銅板</td><td>C2801</td><td>プレス・絞り・装飾</td></tr>
  <tr><td>りん青銅</td><td>C5191</td><td>ばね性と導電性。コネクタ接点、板ばね</td></tr>
  <tr><td>青銅鋳物</td><td>CAC406 (旧 BC6)</td><td>軸受ブシュ、バルブ</td></tr>
  <tr><td>チタン合金</td><td>Ti-6Al-4V (60 種)</td><td>比強度が高く耐食・生体適合。高価で削りにくい</td></tr>
  <tr><td>マグネシウム合金</td><td>AZ91D</td><td>実用金属で最軽量 (1.8 g/cm³)。ダイカスト筐体</td></tr>
</table>
<h2>エンジニアリングプラスチック</h2>
<table class="tb-table">
  <tr><th>樹脂</th><th>密度</th><th>E (GPa)</th><th>連続使用温度の目安</th><th>強み</th><th>弱み</th></tr>
  <tr><td>ABS</td><td>1.05</td><td>≈ 2.2</td><td>≈ 70 °C</td><td>成形・塗装・めっきが容易、外観</td><td>耐候・耐薬品性</td></tr>
  <tr><td>PC (ポリカーボネート)</td><td>1.20</td><td>≈ 2.3</td><td>≈ 120 °C</td><td>透明、耐衝撃が非常に高い</td><td>応力割れ (溶剤)、傷</td></tr>
  <tr><td>POM (ポリアセタール)</td><td>1.41</td><td>≈ 2.8</td><td>≈ 90〜100 °C</td><td>摺動・耐摩耗・寸法安定、ばね性</td><td>接着しにくい、酸に弱い</td></tr>
  <tr><td>PA6 / PA66 (ナイロン)</td><td>1.13 / 1.14</td><td>≈ 2.5〜3 (乾燥)</td><td>≈ 80〜120 °C</td><td>強靭、耐摩耗、耐油</td><td><b>吸水で寸法・剛性が変わる</b></td></tr>
  <tr><td>PBT</td><td>1.31</td><td>≈ 2.5</td><td>≈ 120 °C</td><td>電気部品、寸法安定</td><td>加水分解</td></tr>
  <tr><td>PPS</td><td>1.35 (GF で 1.6)</td><td>≈ 4 (GF40 で ≈ 14)</td><td>≈ 200 °C</td><td>耐熱・耐薬品・難燃</td><td>もろい、高価</td></tr>
  <tr><td>PEEK</td><td>1.30</td><td>≈ 3.6</td><td>≈ 250 °C</td><td>最高クラスの耐熱・機械特性</td><td>非常に高価</td></tr>
</table>
<p>樹脂は<b>ガラス繊維 (GF)</b> を 20〜40 % 入れると剛性が 2〜4 倍、熱変形温度も上がりますが、繊維の向きで収縮・強度に異方性が出てそりの原因になります。また樹脂は<b>クリープ</b> (一定荷重でじわじわ変形) するので、常時荷重のかかるボス・スナップは長期の変形を考えます。</p>
<h2>複合材料 — CFRP と GFRP</h2>
<ul>
  <li><b>CFRP</b> (炭素繊維強化プラスチック): 密度 約 1.5〜1.6 g/cm³。<b>一方向材は繊維方向に E ≈ 130〜150 GPa</b> と鋼並みだが、直角方向は 10 GPa 程度。積層を工夫した擬似等方材で 50〜70 GPa 程度 (アルミ並み)</li>
  <li><b>GFRP</b>: 安価、絶縁性。E は 20 GPa 前後</li>
  <li>層間はく離、穴あけ時の欠け、ボルト締結部の面圧、アルミとの<b>電食</b>に注意。修理・リサイクルが難しい</li>
</ul>
<h2>材料選択チャートと性能指標</h2>
<p>M. F. Ashby が提唱した方法では、2 つの性質 (例: ヤング率と密度) を<b>両対数</b>グラフに描き、目的から導いた<b>性能指標</b>で材料を比べます。例えば、決められた剛性を最も軽く実現したいとき:</p>
<table class="tb-table">
  <tr><th>部材</th><th>決まっているもの</th><th>最大化する指標</th><th>チャート上の線の傾き</th></tr>
  <tr><td>引張の棒 (タイ)</td><td>長さ、剛性</td><td>E / ρ</td><td>1</td></tr>
  <tr><td>曲げのはり</td><td>長さ、剛性 (断面寸法は自由)</td><td>E<sup>1/2</sup> / ρ</td><td>2</td></tr>
  <tr><td>曲げの板 (パネル)</td><td>面積、剛性 (板厚は自由)</td><td>E<sup>1/3</sup> / ρ</td><td>3</td></tr>
</table>
<p>はりや板では密度の効き方が大きく、<b>密度の小さい材料ほど有利</b>になります。鋼・アルミ・チタンの E/ρ はほぼ同じでも、板として使えば E<sup>1/3</sup>/ρ でアルミが鋼の約 2 倍有利 — これが航空機の外板や軽量パネルにアルミや CFRP、ハニカムが使われる理由です。下のチャートで指標を切り替えてみましょう。</p>
<div data-widget="anim-ashby"></div>
<h2>選定の手順</h2>
<ol>
  <li><b>機能</b>を言葉にする (何を支えるか、何を伝えるか)</li>
  <li><b>制約</b>を書き出す (温度、腐食環境、電気、食品衛生、最大寸法、数量)</li>
  <li><b>目的</b>を 1 つ決める (最軽量・最安・最小たわみ) → 性能指標を導く</li>
  <li>制約でふるい分け、指標で順位付け、最後に<b>加工法・入手性・コスト</b>で決める</li>
</ol>
<div class="tb-tip"><b>3DCAD Studio</b>: 材料リストで材料を替えて質量と解析結果を比べてみましょう。同じ形でたわみを比べると、E の比がそのまま効くことを確かめられます。</div>`,
    points: [
      "アルミは系 (1000〜7000) と質別 (H32, T6) で選ぶ。板金 A5052、切削 A6061、高強度 A7075",
      "C3604 は快削、C1100 は導電、C5191 はばね接点",
      "樹脂は POM 摺動、PA 強靭 (吸水注意)、PC 透明耐衝撃、ABS 外装。クリープと温度を考える",
      "CFRP は異方性。擬似等方で E 50〜70 GPa、一方向で 130 GPa 以上",
      "Ashby チャートでは目的から性能指標 (E/ρ、E^½/ρ、E^⅓/ρ) を導いて比較する",
    ],
    exercises: [
      {
        q: "決められた曲げ剛性のはりを最も軽く作りたい。指標 E^½/ρ で鋼 (E 206 GPa、ρ 7.85)、アルミ (70 GPa、2.7)、CFRP 擬似等方 (60 GPa、1.6) を比べてください。",
        a: "鋼: √206 / 7.85 = 14.35 / 7.85 ≈ <b>1.83</b>。アルミ: √70 / 2.7 = 8.37 / 2.7 ≈ <b>3.10</b>。CFRP: √60 / 1.6 = 7.75 / 1.6 ≈ <b>4.84</b>。質量は指標に反比例するので、同じ剛性でアルミは鋼の約 0.59 倍、CFRP は約 0.38 倍の質量になります。",
      },
      {
        q: "同じく板 (指標 E^⅓/ρ) で鋼とアルミを比べると、アルミは何倍有利ですか?",
        a: "鋼: 206^(1/3) / 7.85 = 5.91 / 7.85 ≈ 0.753。アルミ: 70^(1/3) / 2.7 = 4.12 / 2.7 ≈ 1.53。比は <b>約 2.0 倍</b> — 同じ曲げ剛性の板が鋼の約半分の質量でできます (板厚は約 1.44 倍)。",
      },
    ],
    quiz: [
      { q: "吸水によって寸法・剛性が変わりやすい樹脂は?", choices: ["POM", "PA (ナイロン)", "PP"], answer: 1, explain: "ナイロンは吸水率が大きく (PA6 で飽和 9 % 程度)、寸法が伸び剛性が下がります。" },
      { q: "Ashby チャートで「決められた剛性の板を最も軽く」の指標は?", choices: ["E/ρ", "E^½/ρ", "E^⅓/ρ"], answer: 2, explain: "板厚を自由に変えられる板の曲げでは E^⅓/ρ を最大化します。" },
      { q: "A6061-T6 の「T6」が表すのは?", choices: ["溶体化処理後に人工時効した状態", "焼なましした状態", "6 % の銅を含む"], answer: 0, explain: "T6 は溶体化処理 + 人工時効硬化の質別記号です。H32 は加工硬化 + 安定化処理です。" },
    ],
    lessons: ["4-2"],
  },
  {
    id: "process-planning",
    part: "knowhow",
    title: "加工精度と工程設計 — 工程能力・基準・工程順序",
    minutes: 25,
    level: 3,
    lead: "図面通りの部品を安定して作れるかは、公差の大きさだけでなく、工程能力・基準 (データム) と治具・工程の順序で決まります。設計者が工程の側から図面を見直すための考え方を学びます。",
    body: `
<h2>工程能力 — その公差は量産で守れるか</h2>
<p>どんな工程でも寸法はばらつきます。ばらつきの標準偏差 σ と公差幅を比べたものが<b>工程能力指数</b>です。</p>
<div class="tb-formula">C<sub>p</sub> = (USL − LSL) / (6σ)　　C<sub>pk</sub> = min(USL − μ, μ − LSL) / (3σ)</div>
<table class="tb-table">
  <tr><th>C<sub>pk</sub></th><th>不良率の目安 (正規分布、片側)</th><th>評価</th></tr>
  <tr><td>0.67</td><td>約 2.3 %</td><td>不足 — 全数検査や工程の見直しが必要</td></tr>
  <tr><td>1.00</td><td>約 0.13 % (1350 ppm)</td><td>ぎりぎり</td></tr>
  <tr><td>1.33</td><td>約 32 ppm</td><td>一般的な合格基準</td></tr>
  <tr><td>1.67</td><td>約 0.3 ppm</td><td>重要特性・自動車の新規工程で要求されることが多い</td></tr>
</table>
<svg class="tb-chart" viewBox="0 0 520 204" role="img" aria-label="工程能力と分布">
  <rect x="110" y="30" width="300" height="140" style="fill:color-mix(in srgb, var(--tb-good) 8%, transparent)"/>
  <line class="axis" x1="30" y1="170" x2="490" y2="170"/>
  <path d="M150,170 C210,170 220,50 260,50 C300,50 310,170 370,170 Z" style="fill:color-mix(in srgb, var(--tb-good) 22%, transparent)"/>
  <path d="M230,170 C290,170 300,50 340,50 C380,50 390,170 450,170 Z" style="fill:color-mix(in srgb, var(--tb-warn) 14%, transparent)"/>
  <path d="M410,170 L410,140 C425,160 440,170 450,170 Z" style="fill:var(--tb-bad)" opacity="0.6"/>
  <path d="M150,170 C210,170 220,50 260,50 C300,50 310,170 370,170" fill="none" style="stroke:var(--tb-good)" stroke-width="2.6"/>
  <path d="M230,170 C290,170 300,50 340,50 C380,50 390,170 450,170" fill="none" style="stroke:var(--tb-warn)" stroke-width="2.6" stroke-dasharray="6 4"/>
  <line x1="110" y1="30" x2="110" y2="170" style="stroke:var(--tb-bad)" stroke-width="2"/><line x1="410" y1="30" x2="410" y2="170" style="stroke:var(--tb-bad)" stroke-width="2"/>
  <line class="k-center" x1="260" y1="30" x2="260" y2="176"/>
  <text class="mark-t" x="110" y="24" text-anchor="middle">LSL</text><text class="mark-t" x="410" y="24" text-anchor="middle">USL</text>
  <text class="lbl" x="260" y="44" text-anchor="end" style="fill:var(--tb-good)">中心が合う: Cp = Cpk</text>
  <line class="k-thin" x1="436" y1="164" x2="462" y2="140" style="stroke:var(--tb-bad)"/><text class="k-bad-t" x="464" y="136">不良</text>
  <text class="lbl" x="340" y="192" text-anchor="middle" style="fill:var(--tb-warn)">中心がずれる: Cp 同じでも Cpk 低下 → 不良</text>
</svg>
<p class="tb-caption">図: 公差 (LSL〜USL) と寸法の分布。ばらつき (幅) が同じでも、平均が公差の中心からずれると片側の裾が公差外にはみ出す。Cp はばらつきだけ、Cpk はずれも含めた能力を表す</p>
<p>設計者としては、<b>その工程の σ を知ったうえで公差を決める</b>のが理想です。例えば旋削で σ = 5 µm の工程なら、C<sub>p</sub> 1.33 に必要な公差幅は 8σ = 40 µm (±0.02) — これより狭い公差は工程の変更 (研削の追加など) を意味します。</p>
<h2>基準 (データム) と治具 — 3-2-1 の原則</h2>
<p>工作物を機械や治具に固定するとき、空間の自由度 6 つ (並進 3 + 回転 3) を拘束します。最も基本的な考え方が <b>3-2-1 の位置決め</b>です。</p>
<ul>
  <li>第 1 基準面を <b>3 点</b>で受ける (面の位置と 2 つの傾きを拘束)</li>
  <li>第 2 基準面を <b>2 点</b>で受ける (位置と残りの回転を拘束)</li>
  <li>第 3 基準面を <b>1 点</b>で受ける (残りの並進を拘束)</li>
</ul>
<svg class="tb-chart" viewBox="0 0 520 210" role="img" aria-label="3-2-1 位置決め">
  <g class="k-shadow">
    <path d="M150,80 L330,80 L400,40 L220,40 Z" style="fill:var(--k-steel-1);stroke:var(--k-line)" stroke-width="1.6"/>
    <path d="M150,80 L330,80 L330,150 L150,150 Z" style="fill:var(--k-steel-2);stroke:var(--k-line)" stroke-width="1.6"/>
    <path d="M330,80 L400,40 L400,110 L330,150 Z" style="fill:var(--k-steel-3);stroke:var(--k-line)" stroke-width="1.6"/>
  </g>
  <path d="M190,160 V176 M300,160 V176 M360,135 V176" style="stroke:var(--tb-accent)" stroke-width="3"/>
  <circle cx="190" cy="158" r="6" class="k-glow" style="fill:var(--tb-accent)"/><circle cx="300" cy="158" r="6" class="k-glow" style="fill:var(--tb-accent)"/><circle cx="360" cy="133" r="6" class="k-glow" style="fill:var(--tb-accent)"/>
  <rect class="k-ground" x="170" y="176" width="210" height="8"/><line x1="170" y1="176" x2="380" y2="176" style="stroke:var(--k-line-2)"/>
  <text class="lbl" x="275" y="200" text-anchor="middle" style="fill:var(--tb-accent)">第 1 基準: 下面を 3 点</text>
  <path d="M126,105 H140 M126,135 H140" style="stroke:var(--tb-good)" stroke-width="3"/>
  <circle cx="142" cy="105" r="6" class="k-glow" style="fill:var(--tb-good)"/><circle cx="142" cy="135" r="6" class="k-glow" style="fill:var(--tb-good)"/>
  <text class="lbl" x="118" y="124" text-anchor="end" style="fill:var(--tb-good)">第 2 基準: 2 点</text>
  <path d="M410,80 H426" style="stroke:var(--tb-warn)" stroke-width="3"/>
  <circle cx="408" cy="80" r="6" class="k-glow" style="fill:var(--tb-warn)"/>
  <text class="lbl" x="432" y="84" style="fill:var(--tb-warn)">第 3 基準: 1 点</text>
  <line class="k-force" x1="262" y1="8" x2="262" y2="54"/>
  <text class="lbl" x="272" y="20">クランプ (基準へ押し付ける)</text>
</svg>
<p class="tb-caption">図: 3-2-1 の位置決め。6 点で 6 自由度を過不足なく拘束し、クランプ力は基準点に向けて押し付ける。図面のデータム A・B・C の順序と一致させると、設計と加工・測定の基準がそろう</p>
<p><b>図面のデータム = 加工の基準 = 測定の基準</b> にそろえるのが理想です。基準が食い違うと、加工者は図面の寸法を自分の基準からの寸法に換算 (公差の再配分) することになり、公差が実質的に狭くなります。</p>
<h2>寸法の入れ方と誤差の累積</h2>
<ul>
  <li><b>直列寸法</b> (隣どうしを順に入れる): 各公差が累積する。4 区間 ±0.05 なら端から端は最悪 ±0.20</li>
  <li><b>並列寸法・累進寸法</b> (1 つの基準からそれぞれ入れる): 各位置は ±0.05 のまま。区間の長さは 2 つの公差の和 ±0.10</li>
  <li>機能上重要な寸法 (はめあう穴どうしのピッチなど) は<b>直接</b>入れ、計算で間接的に決まる寸法にしない</li>
</ul>
<h2>工程順序の組み立て方</h2>
<table class="tb-table">
  <tr><th>原則</th><th>理由・例</th></tr>
  <tr><td>最初に基準面を作る</td><td>黒皮 (素材面) の一面を削って第 1 基準にし、以後の工程はそこから</td></tr>
  <tr><td>荒加工 → 熱処理 / 応力除去 → 仕上げ</td><td>荒削りで内部応力が解放されて変形するので、仕上げは最後に</td></tr>
  <tr><td>関係の厳しい形状は同一段取りで</td><td>同軸度の要る 2 つの穴、平行度の要る面は、つかみ替えずに一度に加工 (つかみ替えると取付け誤差が入る)</td></tr>
  <tr><td>精度の高い穴は最後に</td><td>大きな除去加工の熱と変形の影響を受けないように</td></tr>
  <tr><td>熱処理後は研削</td><td>焼入れひずみを研削代で取る</td></tr>
  <tr><td>表面処理は寸法に効く</td><td>めっき・アルマイトの膜厚を見込み、処理前寸法を工程図に書く</td></tr>
</table>
<svg class="tb-chart" viewBox="0 0 520 150" role="img" aria-label="工程順序の例">
  <g class="k-shadow">
    <rect class="k-panel" x="10" y="44" width="80" height="54" rx="8"/>
    <rect class="k-panel" x="110" y="44" width="80" height="54" rx="8"/>
    <rect class="k-panel" x="210" y="44" width="80" height="54" rx="8" style="stroke:var(--tb-warn);stroke-width:1.6"/>
    <rect class="k-panel" x="310" y="44" width="80" height="54" rx="8"/>
    <rect class="k-panel" x="410" y="44" width="100" height="54" rx="8" style="stroke:var(--tb-good);stroke-width:1.6"/>
  </g>
  <circle class="k-badge" cx="22" cy="44" r="9"/><text class="k-badge-t" x="22" y="48" text-anchor="middle">1</text>
  <circle class="k-badge" cx="122" cy="44" r="9"/><text class="k-badge-t" x="122" y="48" text-anchor="middle">2</text>
  <circle class="k-badge" cx="222" cy="44" r="9" style="fill:var(--tb-warn)"/><text class="k-badge-t" x="222" y="48" text-anchor="middle">3</text>
  <circle class="k-badge" cx="322" cy="44" r="9"/><text class="k-badge-t" x="322" y="48" text-anchor="middle">4</text>
  <circle class="k-badge" cx="422" cy="44" r="9" style="fill:var(--tb-good)"/><text class="k-badge-t" x="422" y="48" text-anchor="middle">5</text>
  <text class="mark-t" x="50" y="76" text-anchor="middle">素材切断</text>
  <text class="mark-t" x="150" y="70" text-anchor="middle">荒旋削</text><text class="k-note" x="150" y="88" text-anchor="middle">(研削代残し)</text>
  <text class="mark-t" x="250" y="70" text-anchor="middle">焼入れ</text><text class="mark-t" x="250" y="88" text-anchor="middle">焼戻し</text>
  <text class="mark-t" x="350" y="70" text-anchor="middle">センタ穴</text><text class="mark-t" x="350" y="88" text-anchor="middle">修正</text>
  <text class="mark-t" x="460" y="70" text-anchor="middle">円筒研削</text><text class="k-note" x="460" y="88" text-anchor="middle">(同一センタで)</text>
  <line x1="92" y1="71" x2="108" y2="71" style="stroke:var(--k-line-2)" stroke-width="2" marker-end="url(#k-arrow)"/><line x1="192" y1="71" x2="208" y2="71" style="stroke:var(--k-line-2)" stroke-width="2" marker-end="url(#k-arrow)"/><line x1="292" y1="71" x2="308" y2="71" style="stroke:var(--k-line-2)" stroke-width="2" marker-end="url(#k-arrow)"/><line x1="392" y1="71" x2="408" y2="71" style="stroke:var(--k-line-2)" stroke-width="2" marker-end="url(#k-arrow)"/>
  <text class="lbl" x="260" y="128" text-anchor="middle">両センタ基準で研削すると、複数の軸受座の同軸度が自然にそろう</text>
</svg>
<p class="tb-caption">図: 焼入れ軸の工程例。センタ穴を基準として通しで使い、熱処理後にセンタ穴を修正してから研削する。基準を工程を通じて変えないことが精度の鍵</p>
<h2>設計者のチェックリスト</h2>
<ul>
  <li>データムは<b>加工で最初に作れ、治具で受けられる</b>大きく安定した面か</li>
  <li>厳しい幾何公差の形体どうしは<b>同一段取り</b>で加工できる配置か</li>
  <li>その公差は工程の σ に対して C<sub>pk</sub> 1.33 以上を確保できるか</li>
  <li>熱処理・表面処理・溶接による寸法変化を工程に織り込んだか</li>
  <li>測定できるか (測定器が届く、基準が当てられる)</li>
</ul>`,
    points: [
      "Cp = 公差幅/6σ、Cpk はずれも含む。量産の目安は Cpk ≥ 1.33",
      "3-2-1 の原則で 6 自由度を拘束。図面データム = 加工基準 = 測定基準にそろえる",
      "直列寸法は誤差が累積。機能寸法は直接入れる",
      "荒 → 熱処理/応力除去 → 仕上げ。関係の厳しい形状は同一段取りで",
      "基準 (センタ穴など) を工程を通じて変えない",
    ],
    exercises: [
      {
        q: "φ20 ±0.02 の軸を加工したところ、平均 20.004 mm、標準偏差 0.005 mm でした。Cp と Cpk を求め、評価してください。",
        a: "Cp = 0.04 / (6 × 0.005) = 0.04 / 0.03 ≈ <b>1.33</b>。Cpk = min(20.02 − 20.004, 20.004 − 19.98) / (3 × 0.005) = min(0.016, 0.024) / 0.015 ≈ <b>1.07</b>。ばらつきは十分小さいが中心がずれているので、刃先の補正で平均を 20.000 に寄せれば Cpk 1.33 になります。",
      },
      {
        q: "4 つの区間を直列寸法でそれぞれ 25 ±0.05 と入れました。全長 100 の最悪の誤差と、二乗和平方根 (統計的) の誤差を求めてください。",
        a: "最悪: 4 × 0.05 = <b>±0.20</b>。統計的: √(4 × 0.05²) = 0.05 × 2 = <b>±0.10</b>。全長が機能上重要なら、全長を直接寸法で入れ、どこか 1 区間を参考寸法にします。",
      },
    ],
    quiz: [
      { q: "Cp = 1.5 だが Cpk = 0.8 の工程で、まずすべきことは?", choices: ["機械を高精度なものに替える", "平均値を公差の中心に寄せる (刃先補正など)", "公差を広げるよう設計変更する"], answer: 1, explain: "ばらつき (Cp) は十分なので、平均のずれを直せば Cpk が改善します。" },
      { q: "3-2-1 の位置決めで、第 1 基準面を受ける点の数は?", choices: ["1 点", "2 点", "3 点"], answer: 2, explain: "第 1 基準面は 3 点で受け、面の位置と 2 方向の傾きを拘束します。" },
      { q: "同軸度の厳しい 2 つの軸受座を加工するときの原則は?", choices: ["別々の段取りで 1 つずつ加工する", "同じ基準・同じ段取りで続けて加工する", "先に表面処理をしてから加工する"], answer: 1, explain: "つかみ替えると取付け誤差が入るため、同一段取り (両センタなど) で加工します。" },
    ],
    lessons: ["6-4"],
  },
];
