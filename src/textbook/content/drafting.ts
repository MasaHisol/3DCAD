import type { TextChapter } from "../types";

export const DRAFTING: TextChapter[] = [
  {
    id: "views",
    part: "drafting",
    title: "投影図の選び方 — 少ない図で形を伝える",
    minutes: 20,
    level: 1,
    lead: "同じ部品でも、どの向きを正面図にするか、どの図を追加するかで図面の読みやすさは大きく変わります。JIS B 0001 にある補助投影図・部分投影図・局部投影図・回転投影図や、対称図示・省略の技法を使い分けて、必要最小限の図で形を正確に伝える方法を学びます。",
    body: `
<h2>正面図の選定</h2>
<p>正面図 (主投影図) は図面の中心です。次の順に考えて向きを決めます。</p>
<ol>
  <li>部品の<b>形・機能の特徴が最もよく表れる</b>向き</li>
  <li><b>加工時の置き方</b>に合わせる (旋削部品は軸を水平に、板金は展開しやすい向き)</li>
  <li>組立図などでは<b>使用時の姿勢</b>に合わせる</li>
  <li>かくれ線が<b>できるだけ少なくなる</b>向き</li>
</ol>
<p>正面図が決まったら、形を確定させるのに<b>本当に必要な図だけ</b>を追加します。三面図は「いつも 3 つ描く」という意味ではありません。円筒部品は φ を使えば正面図 1 つ、板金部品は正面図 + 板厚 t の注記で足りることがよくあります。</p>
<table class="tb-table">
  <tr><th>部品</th><th>正面図の向きの例</th><th>必要な図の数の目安</th></tr>
  <tr><td>軸・ピン (旋削品)</td><td>軸線を水平に、加工の多い側を右</td><td>1 (+ キー溝などの断面)</td></tr>
  <tr><td>板金・プレート</td><td>板の面を正面に</td><td>1〜2 (+ 板厚 t)</td></tr>
  <tr><td>ブラケット・ブロック</td><td>特徴的な輪郭が見える向き</td><td>2〜3</td></tr>
  <tr><td>ハウジング・鋳物</td><td>主軸線を水平に</td><td>3 以上 + 断面図</td></tr>
</table>
<h2>特殊な投影図</h2>
<table class="tb-table">
  <tr><th>名称</th><th>使う場面</th><th>描き方</th></tr>
  <tr><td>補助投影図</td><td>斜面の実形を示したい</td><td>斜面に<b>垂直な方向</b>から見た図を、斜面に対向する位置に描く。置けない場合は矢示法 (矢印と文字) で別の場所に</td></tr>
  <tr><td>部分投影図</td><td>図の一部だけで足りる</td><td>必要な部分だけを描き、省いた境界は破断線で示す</td></tr>
  <tr><td>局部投影図</td><td>穴・溝など局所的な形だけ示したい</td><td>その部分だけを描き、主投影図と<b>中心線・基準線・寸法補助線などで結ぶ</b></td></tr>
  <tr><td>回転投影図</td><td>アームなどが斜めに出ていて実形が出ない</td><td>その部分を投影面に平行な位置まで<b>回転させて</b>描く。必要なら作図線を残す</td></tr>
  <tr><td>部分拡大図</td><td>細部が小さくて寸法が入らない</td><td>細い実線の円で囲み英大文字を付け、別の場所に尺度を添えて拡大して描く (例: A 部 5:1)</td></tr>
</table>
<svg class="tb-chart" viewBox="0 0 520 262" role="img" aria-label="補助投影図の例">
  <line class="k-thin" x1="140" y1="110" x2="157" y2="93"/><line class="k-thin" x1="200" y1="170" x2="217" y2="153"/>
  <path d="M40,230 L200,230 L200,170 L140,110 L40,110 Z" style="stroke-width:2.2;fill:var(--tb-surface)" class="k-edge"/>
  <path class="k-hidden" d="M161.5,131.5 L143.8,149.2 L160.8,166.2 L178.5,148.5"/>
  <line class="k-center" x1="152" y1="158" x2="242" y2="68"/>
  <g transform="translate(161.2,88.8) rotate(45)">
    <rect x="0" y="-60" width="84.85" height="60" style="fill:var(--tb-surface);stroke:var(--k-line)" stroke-width="2.2"/>
    <circle cx="42.4" cy="-30" r="12" fill="none" style="stroke:var(--k-line)" stroke-width="2.2"/>
    <line class="k-center" x1="24" y1="-30" x2="61" y2="-30"/>
  </g>
  <text class="k-title" x="120" y="252" text-anchor="middle">正面図</text>
  <text class="k-note" x="52" y="214">斜面は線に見える</text>
  <path d="M262,40 L238,58" fill="none" style="stroke:var(--tb-accent)" stroke-width="1" marker-end="url(#k-arrow-blue)"/>
  <text class="mark-t" x="266" y="36" style="fill:var(--tb-accent)">補助投影図 (斜面の実形)</text>
  <text class="k-note" x="266" y="52">斜面に垂直な方向から見た図</text>
  <rect x="320" y="120" width="160" height="60" style="stroke-width:2.2;fill:var(--tb-surface)" class="k-edge"/>
  <line class="k-edge" x1="420" y1="120" x2="420" y2="180" style="stroke-width:2.2"/>
  <ellipse cx="450" cy="150" rx="8.5" ry="12" fill="none" style="stroke:var(--k-line)" stroke-width="2.2"/>
  <line class="k-center" x1="436" y1="150" x2="464" y2="150"/><line class="k-center" x1="450" y1="132" x2="450" y2="168"/>
  <text class="k-title" x="400" y="204" text-anchor="middle">(参考) 平面図</text>
  <text class="k-bad-t" x="400" y="222" text-anchor="middle">斜面は縮み、穴は楕円に見える</text>
</svg>
<h2>対称図示記号と省略</h2>
<ul>
  <li><b>対称図示記号</b>: 対称な図は中心線の片側だけを描き、中心線の両端に<b>短い 2 本の平行細線</b>を付けます。中心線を少し越えて描いた場合は記号を省略できます</li>
  <li><b>繰返し図形の省略</b>: 同じ穴が並ぶときは、両端 (または要所) だけを描き、他は中心線の交点で位置を示して「12×φ6」のように個数を書きます</li>
  <li><b>中間部の省略 (破断)</b>: 長い軸・形鋼・管など同じ断面が続く部品は、中間を切り取って短く描けます。破断線はフリーハンドの細い実線 (またはジグザグ線)。寸法は<b>実際の長さ</b>を記入します</li>
  <li><b>かくれ線の省略</b>: 理解を妨げない範囲でかくれ線は省略してよく、むしろ多すぎる破線は誤読のもとです</li>
</ul>
<div class="tb-note">対称図示記号の形は「中心線の両端に短い平行 2 本線」です。JIS と ISO 128 でほぼ共通ですが、古い図面では記号なしで中心線を延長しているものもあります。</div>
<div class="tb-tip"><b>3DCAD Studio では</b>: 図面環境で<b>基準ビュー</b>を置いてから<b>投影ビュー</b>で必要な方向だけを追加します。細部は<b>詳細ビュー</b>、長い部品は<b>破断ビュー</b>で中間を省略でき、寸法はモデルの実寸のまま表示されます。</div>`,
    points: ["正面図は特徴・加工姿勢・かくれ線の少なさで選ぶ", "図は必要最小限。φ・t・断面図で図の数を減らす", "斜面は補助投影図、局所は局部投影図、斜めのアームは回転投影図", "対称図示記号・繰返し省略・破断で図を簡潔にし、寸法は実長で書く"],
    exercises: [
      {
        q: "長さ 1200 mm、直径 φ40 の丸棒の両端に同じ面取り C1 がある部品を、A4 横の用紙に描きます。どのような図にすればよいですか?",
        a: "軸線を水平にした<b>正面図 1 つ</b>で十分です (φ40 で円形とわかる)。全長が用紙に収まらないので<b>中間を破断線で省略</b>し、寸法は実長の <b>1200</b> を記入します。両端の面取りは同じなので「C1」を 1 か所に書き、「両端」と注記するか両端に記入します。",
      },
    ],
    quiz: [
      { q: "斜面上の穴の実形を示すのに適した図は?", choices: ["回転投影図", "補助投影図", "部分断面図"], answer: 1, explain: "斜面に垂直な方向から見た補助投影図で実形が描けます。" },
      { q: "破断して短く描いた軸の全長寸法は?", choices: ["図上の長さを書く", "実際の長さを書く", "省略する"], answer: 1, explain: "破断で図を縮めても、寸法は常に実際の長さを記入します。" },
      { q: "対称図示記号の形は?", choices: ["中心線の両端に短い平行 2 本線", "中心線の中央に × 印", "中心線を二点鎖線にする"], answer: 0, explain: "中心線の両端に短い平行細線を 2 本付けて、片側を省略したことを示します。" },
    ],
    lessons: ["6-1", "0-6"],
  },
  {
    id: "sections",
    part: "drafting",
    title: "断面図の種類 — 内部を見せる",
    minutes: 20,
    level: 2,
    lead: "かくれ線だらけの図は読み間違いのもとです。部品を仮想的に切って内部を見せる断面図には、全断面・片側断面・部分断面・回転図示断面・組合せ断面など多くの種類があります。使い分けと、ハッチングや「切断しないもの」のルールを学びます。",
    body: `
<h2>断面図の種類</h2>
<table class="tb-table">
  <tr><th>種類</th><th>切り方</th><th>向いている部品</th></tr>
  <tr><td>全断面図</td><td>基本中心線を通る 1 平面で全体を切る。切断位置が明らかなら切断線は省略可</td><td>内部形状が主体の部品</td></tr>
  <tr><td>片側断面図</td><td>対称形の<b>半分だけ</b>を断面にし、外形と内部を 1 図で示す</td><td>対称な軸受ハウジング・フランジ</td></tr>
  <tr><td>部分断面図</td><td>必要な部分だけを切り、境界を<b>フリーハンドの破断線</b>で示す</td><td>軸のキー溝・止まり穴</td></tr>
  <tr><td>回転図示断面図</td><td>アーム・リブ・形鋼の断面を 90° 回して図中または切断線の延長上に描く</td><td>ハンドルのアーム、車輪のスポーク</td></tr>
  <tr><td>組合せ断面図</td><td>2 つ以上の平面で切る。平行な平面 = <b>階段断面</b>、交わる平面 = 鋭角 (角度をもつ) 断面</td><td>位置のずれた穴、放射状の穴</td></tr>
  <tr><td>多数の断面図</td><td>形が連続的に変わる部品を、複数の位置の断面で示す (切断線の延長上や順に並べる)</td><td>フック、タービン翼、段付き軸</td></tr>
</table>
<svg class="tb-chart" viewBox="0 0 520 212" role="img" aria-label="全断面と片側断面">
  <rect class="k-panel" x="8" y="8" width="244" height="196" rx="8"/><rect class="k-panel" x="268" y="8" width="244" height="196" rx="8"/>
  <circle class="k-badge" cx="28" cy="28" r="10"/><text class="k-badge-t" x="28" y="32" text-anchor="middle">1</text><text class="k-title" x="46" y="32">全断面</text>
  <circle class="k-badge" cx="288" cy="28" r="10"/><text class="k-badge-t" x="288" y="32" text-anchor="middle">2</text><text class="k-title" x="306" y="32">片側断面</text>
  <path class="k-cut" d="M50,50 L105,50 L105,170 L75,170 L75,80 L50,80 Z" style="stroke-width:2.2"/>
  <path class="k-cut" d="M155,50 L210,50 L210,80 L185,80 L185,170 L155,170 Z" style="stroke-width:2.2"/>
  <line class="k-edge" x1="105" y1="50" x2="155" y2="50" style="stroke-width:2.2"/><line class="k-edge" x1="105" y1="170" x2="155" y2="170" style="stroke-width:2.2"/>
  <line class="k-center" x1="130" y1="42" x2="130" y2="180"/>
  <text class="k-note" x="130" y="196" text-anchor="middle">中心を通る 1 平面で全体を切る</text>
  <path d="M390,50 L310,50 L310,80 L335,80 L335,170 L390,170" style="stroke-width:2.2;fill:var(--tb-surface)" class="k-edge"/>
  <path class="k-cut" d="M415,50 L470,50 L470,80 L445,80 L445,170 L415,170 Z" style="stroke-width:2.2"/>
  <line class="k-edge" x1="390" y1="50" x2="415" y2="50" style="stroke-width:2.2"/><line class="k-edge" x1="390" y1="170" x2="415" y2="170" style="stroke-width:2.2"/>
  <line class="k-center" x1="390" y1="42" x2="390" y2="180"/>
  <text class="lbl" x="350" y="64" text-anchor="middle">外形</text><text class="lbl" x="458" y="190" text-anchor="middle">断面</text>
  <text class="k-note" x="326" y="196" text-anchor="middle">かくれ線なし</text>
</svg>
<p>片側断面図では、外形側に<b>かくれ線を描かない</b>のが原則です (内部は断面側でわかるため)。外形と断面の境界は中心線です。</p>
<h2>切断線と矢示</h2>
<p>切断位置は<b>細い一点鎖線で、端部と曲がり角を太く</b>した切断線で示し、見る方向を矢印で、断面を英大文字 (A–A など) で対応させます。階段断面では、断面図の上で<b>切断面の折れ目の線は描きません</b>。</p>
<h2>ハッチング</h2>
<ul>
  <li>細い実線で、主な中心線または外形線に対して<b>45°</b>の等間隔の線を引くのが基本</li>
  <li>同じ部品の断面は、離れていても<b>同じ角度・間隔</b>にする</li>
  <li>隣接する部品は<b>向きか間隔を変えて</b>区別する</li>
  <li>断面が広いときは外形線に沿った周辺部だけにしてよい。薄い部品 (ガスケット・薄板) は<b>極太線 1 本</b>で表せる</li>
  <li>ハッチング内に文字や寸法を入れるときは、その部分のハッチングを中断する</li>
</ul>
<div class="tb-note">現行の JIS B 0001 では、断面であることが明らかな場合<b>ハッチングを省略してよい</b>とされています。一方、社内規格や教育現場では常にハッチングを施す運用も多いので、所属先の規定に従ってください。</div>
<h2>長手方向に切断しないもの</h2>
<p>切っても情報が増えない、またはかえって誤解を招く部品は、切断面上にあっても<b>長手方向には切断しない</b> (外形のまま描く) 決まりです。</p>
<table class="tb-table">
  <tr><th>区分</th><th>例</th></tr>
  <tr><td>中実の機械要素</td><td>軸、ピン、ボルト、ナット、座金、小ねじ、止めねじ、リベット、キー、コッタ</td></tr>
  <tr><td>転動体</td><td>玉軸受の鋼球、円筒ころ</td></tr>
  <tr><td>部品の一部分</td><td>リブ、アーム、車のスポーク、歯車の歯</td></tr>
</table>
<p>例えばリブを縦に切ってハッチングすると、厚い壁に見えてしまいます。リブを切らずに描くことで「薄い補強板」であることが伝わります。</p>
<div class="tb-tip"><b>3DCAD Studio では</b>: 図面環境の<b>断面ビュー</b>で切断線を引くと A–A 断面とハッチングが自動で作られます。キー溝など局所だけ見せたいときは<b>部分断面 (ブレークアウト) ビュー</b>を使います。</div>`,
    points: ["全断面・片側断面・部分断面・回転図示断面・組合せ断面・多数の断面を使い分ける", "切断線は細い一点鎖線 (端部・曲がり角を太く) + 矢印 + 記号", "ハッチングは 45° 細線、同一部品は同じ向き・間隔、隣接部品は変える", "軸・ピン・ボルト・キー・リブ・歯車の歯などは長手方向に切断しない"],
    exercises: [
      {
        q: "フランジ付きの円筒ハウジング (上下左右対称) で、外側のボルト穴配置と内側の段付き穴を 1 つの図で示したいとき、どの断面図が適していますか? また外形側のかくれ線はどうしますか?",
        a: "<b>片側断面図</b>が適しています。中心線の片側を外形、もう片側を断面として、外形と内部を同時に示します。内部は断面側で読めるので、外形側の<b>かくれ線は原則として描きません</b>。",
      },
    ],
    quiz: [
      { q: "断面図で長手方向に切断しないものは?", choices: ["ハウジングの壁", "リブ", "パイプ"], answer: 1, explain: "リブ・アーム・歯車の歯・軸・ボルトなどは切断せずに描きます。" },
      { q: "隣り合う 2 部品の断面のハッチングは?", choices: ["同じ向き・間隔にする", "向きか間隔を変える", "片方だけハッチングする"], answer: 1, explain: "隣接部品は向きや間隔を変えて区別します。" },
      { q: "平行な 2 つの平面で切る組合せ断面を何という?", choices: ["階段断面", "回転図示断面", "部分断面"], answer: 0, explain: "平行な切断面を階段状につないだものを階段断面と呼びます。" },
    ],
    lessons: ["6-1"],
  },
  {
    id: "dimensioning",
    part: "drafting",
    title: "寸法記入の詳細 — 記号と穴と配置",
    minutes: 25,
    level: 2,
    lead: "基礎編の原則 (必要な寸法を、基準から、重複なく) を実際の図面に落とし込むには、寸法補助記号・配置のスタイル・穴の加工指示・テーパや参考寸法など、細かい決まりを知る必要があります。",
    body: `
<h2>寸法補助記号</h2>
<table class="tb-table">
  <tr><th>記号</th><th>意味</th><th>記入例</th><th>補足</th></tr>
  <tr><td>φ</td><td>直径</td><td>φ20</td><td>円形の図に直径寸法線を引く場合でも、JIS では φ を付けて記入するのが一般的</td></tr>
  <tr><td>R</td><td>半径</td><td>R5</td><td>寸法線は円弧の中心側から片側矢印</td></tr>
  <tr><td>Sφ / SR</td><td>球の直径 / 半径</td><td>SR10</td><td></td></tr>
  <tr><td>□</td><td>正方形の辺</td><td>□12</td><td>正方形の断面を 1 方向の寸法だけで示す</td></tr>
  <tr><td>C</td><td>45° 面取り</td><td>C2</td><td>45° 以外の面取りは「2×30°」のように書く</td></tr>
  <tr><td>t</td><td>板の厚さ</td><td>t3</td><td>図の付近または図中に</td></tr>
  <tr><td>⌒</td><td>円弧の長さ</td><td>⌒40</td><td>JIS B 0001:2010 以降は数値の<b>前</b>に置く。旧 JIS では数値の上に付けていた</td></tr>
</table>
<h2>寸法の配置スタイル</h2>
<table class="tb-table">
  <tr><th>スタイル</th><th>特徴</th><th>誤差の累積</th></tr>
  <tr><td>直列寸法</td><td>隣どうしを鎖のようにつなぐ</td><td>各寸法の公差が<b>累積</b>する。個々の間隔が重要なとき</td></tr>
  <tr><td>並列寸法</td><td>共通の基準から平行に並べる</td><td>累積しない。寸法線が増える</td></tr>
  <tr><td>累進寸法</td><td>基準を起点記号 (小さな白丸) とし、1 本の寸法線上に基準からの距離を書く</td><td>並列寸法と同じ意味で、場所をとらない</td></tr>
  <tr><td>座標寸法</td><td>穴の位置を X・Y の表にする</td><td>累積しない。穴の多い板に</td></tr>
</table>
<svg class="tb-chart" viewBox="0 0 520 196" role="img" aria-label="直列寸法と累進寸法">
  <rect class="k-panel" x="8" y="8" width="244" height="180" rx="8"/><rect class="k-panel" x="268" y="8" width="244" height="180" rx="8"/>
  <circle class="k-badge" cx="28" cy="28" r="10" style="fill:var(--tb-warn)"/><text class="k-badge-t" x="28" y="32" text-anchor="middle">!</text><text class="k-title" x="46" y="32">直列寸法</text>
  <circle class="k-badge" cx="288" cy="28" r="10" style="fill:var(--tb-good)"/><text class="k-badge-t" x="288" y="32" text-anchor="middle">✓</text><text class="k-title" x="306" y="32">累進寸法</text>
  <g class="k-shadow"><rect x="30" y="86" width="200" height="50" class="k-alu"/></g>
  <circle cx="90" cy="111" r="8" style="fill:var(--tb-surface)" class="k-edge"/><circle cx="160" cy="111" r="8" style="fill:var(--tb-surface)" class="k-edge"/>
  <line class="k-center" x1="90" y1="78" x2="90" y2="144"/><line class="k-center" x1="160" y1="78" x2="160" y2="144"/>
  <line class="k-ext" x1="30" y1="84" x2="30" y2="54"/><line class="k-ext" x1="230" y1="84" x2="230" y2="54"/>
  <line class="k-ext" x1="90" y1="76" x2="90" y2="54"/><line class="k-ext" x1="160" y1="76" x2="160" y2="54"/>
  <line class="k-dimline" x1="30" y1="60" x2="90" y2="60"/><line class="k-dimline" x1="90" y1="60" x2="160" y2="60"/><line class="k-dimline" x1="160" y1="60" x2="230" y2="60"/>
  <text class="k-dimtext" x="60" y="55" text-anchor="middle">30</text><text class="k-dimtext" x="125" y="55" text-anchor="middle">35</text><text class="k-dimtext" x="195" y="55" text-anchor="middle">35</text>
  <text class="k-note" x="130" y="162" text-anchor="middle" style="fill:var(--tb-bad)">各 ±0.2 なら全長は最大 ±0.6 ずれる</text>
  <text class="k-note" x="130" y="178" text-anchor="middle">誤差が順に積み重なる</text>
  <g class="k-shadow"><rect x="290" y="86" width="200" height="50" class="k-alu"/></g>
  <circle cx="350" cy="111" r="8" style="fill:var(--tb-surface)" class="k-edge"/><circle cx="420" cy="111" r="8" style="fill:var(--tb-surface)" class="k-edge"/>
  <line class="k-center" x1="350" y1="78" x2="350" y2="144"/><line class="k-center" x1="420" y1="78" x2="420" y2="144"/>
  <line class="k-ext" x1="290" y1="84" x2="290" y2="54"/><line class="k-ext" x1="490" y1="84" x2="490" y2="54"/>
  <line class="k-ext" x1="350" y1="76" x2="350" y2="54"/><line class="k-ext" x1="420" y1="76" x2="420" y2="54"/>
  <line class="k-dimline" x1="290" y1="62" x2="490" y2="62" style="marker-start:none"/>
  <line class="k-dimline" x1="290" y1="62" x2="350" y2="62" style="marker-start:none"/><line class="k-dimline" x1="290" y1="62" x2="420" y2="62" style="marker-start:none"/>
  <circle cx="290" cy="62" r="3.5" style="fill:var(--tb-surface);stroke:var(--k-dim)" stroke-width="1.2"/>
  <text class="k-dimtext" x="296" y="76">0</text>
  <text class="k-dimtext" x="346" y="56" text-anchor="end">30</text><text class="k-dimtext" x="416" y="56" text-anchor="end">65</text><text class="k-dimtext" x="486" y="56" text-anchor="end">100</text>
  <text class="k-note" x="390" y="162" text-anchor="middle" style="fill:var(--tb-good)">基準から直接 → 各位置は ±0.2</text>
  <text class="k-note" x="390" y="178" text-anchor="middle">起点は小さな白丸で示す</text>
</svg>
<h2>穴の寸法記入</h2>
<p>穴は直径だけでなく<b>加工方法</b>を指示できます。引出線で「個数 × 直径 + 加工法」を書きます。</p>
<table class="tb-table">
  <tr><th>加工</th><th>旧来の文字表記の例</th><th>JIS B 0001:2019 の記号表記の例</th></tr>
  <tr><td>きり穴</td><td>4×φ9 キリ</td><td>4×φ9</td></tr>
  <tr><td>リーマ穴</td><td>2×φ8H7 リーマ</td><td>2×φ8H7 (リーマは文字で添える)</td></tr>
  <tr><td>止まり穴</td><td>φ6 キリ 深さ 10</td><td>φ6 ↧10</td></tr>
  <tr><td>座ぐり</td><td>φ9 キリ φ15 深さ 1 ザグリ</td><td>φ9 ⌴φ15 ↧1</td></tr>
  <tr><td>深ざぐり (六角穴付きボルト M8 用の例)</td><td>φ9 キリ φ14 深さ 8.6 深ザグリ</td><td>φ9 ⌴φ14 ↧8.6</td></tr>
  <tr><td>皿ざぐり</td><td>φ9 キリ 90° 皿ザグリ φ18</td><td>φ9 ⌵φ18×90°</td></tr>
</table>
<div class="tb-note">座ぐり ⌴・皿ざぐり ⌵・深さ ↧ の記号は ISO に合わせて JIS B 0001 に取り入れられたものです。現場では文字表記 (キリ・ザグリ) もまだ広く使われており、どちらも誤りではありません。会社の図面規定に合わせて統一してください。座ぐりの径・深さはボルトの頭寸法から決めます (ここでの数値は例)。</div>
<h2>角度・弦・弧</h2>
<ul>
  <li><b>角度</b>: 寸法線は角の頂点を中心とする円弧で描く</li>
  <li><b>弦の長さ</b>: 弦に平行な直線の寸法線</li>
  <li><b>弧の長さ</b>: 弧と同心の円弧の寸法線 + 記号 ⌒</li>
</ul>
<h2>テーパとこう配</h2>
<div class="tb-formula">テーパ = (D − d) / L　　こう配 = (a − b) / L</div>
<p><b>テーパ</b>は軸線に対して両側が対称に傾く (円すいなど) もの、<b>こう配</b>は片側だけが傾くもので、比率 (例: 1:10) で示します。テーパは中心線上に、こう配は傾斜面から引出線で、向きを示す図記号とともに記入します。</p>
<h2>参考寸法と理論的に正確な寸法</h2>
<table class="tb-table">
  <tr><th>表記</th><th>意味</th></tr>
  <tr><td>(50)</td><td><b>参考寸法</b>: 他の寸法から計算できる、情報として示すだけの寸法。公差は適用せず検査対象外</td></tr>
  <tr><td>[50] (枠囲み)</td><td><b>理論的に正確な寸法 (TED)</b>: 位置度などの幾何公差の基準となる公差のない寸法。ばらつきは幾何公差で規制する</td></tr>
  <tr><td>50 (下線)</td><td>尺度どおりに描かれていない寸法 (非比例寸法)</td></tr>
</table>
<div class="tb-tip"><b>3DCAD Studio では</b>: <b>並列/直列/座標寸法スタイル</b>を切り替えられ、穴は<b>穴注記</b>でキリ・座ぐり・深さを一括記入、穴の多い板は<b>穴テーブル</b>で座標を表にできます。<b>自動寸法</b>で下書きしてから、機能に合わせて基準を整えましょう。</div>`,
    points: ["φ R SR □ C t ⌒ などの寸法補助記号で図を減らす", "直列寸法は公差が累積、並列・累進・座標寸法は累積しない", "穴は個数・径・加工法 (キリ・リーマ・座ぐり・深ざぐり・皿) を指示", "参考寸法 ( ) は検査外、理論的に正確な寸法 [ ] は幾何公差の基準"],
    exercises: [
      {
        q: "大径 D = 30 mm、小径 d = 25 mm、長さ L = 50 mm の円すい部のテーパ比を求めてください。",
        a: "テーパ = (D − d) / L = (30 − 25) / 50 = 5 / 50 = <b>1:10</b> です。",
      },
      {
        q: "穴の間隔 30・35・35 mm を直列寸法で記入し、各寸法に ±0.1 の公差を付けました。両端の穴の距離 (100 mm) は最大でどれだけずれる可能性がありますか? 並列寸法ならどうなりますか?",
        a: "直列では公差が累積し、最大 ±0.1 × 3 = <b>±0.3 mm</b>。並列寸法で左端から 100 ± 0.1 と記入すれば <b>±0.1 mm</b> に収まります。両端の距離が機能上重要なら並列 (または累進) 寸法にします。",
      },
    ],
    quiz: [
      { q: "「(50)」と括弧付きで書かれた寸法の意味は?", choices: ["理論的に正確な寸法", "参考寸法", "重要寸法"], answer: 1, explain: "括弧付きは参考寸法で、公差は適用せず検査対象にもなりません。" },
      { q: "公差が累積しやすい寸法記入のスタイルは?", choices: ["直列寸法", "並列寸法", "累進寸法"], answer: 0, explain: "直列寸法では各寸法の公差が足し合わさります。" },
      { q: "「C2」の意味は?", choices: ["半径 2 mm の丸み", "2 mm × 45° の面取り", "板厚 2 mm"], answer: 1, explain: "C は 45° 面取りで、C2 は面取り長さ 2 mm です。" },
    ],
    lessons: ["0-6", "6-1"],
  },
  {
    id: "symbols",
    part: "drafting",
    title: "機械要素の略画法 — ねじ・歯車・ばね・軸受",
    minutes: 25,
    level: 2,
    lead: "ねじ山や歯車の歯を一つずつ描くのは手間がかかるうえ、かえって読みにくくなります。JIS では機械要素ごとに略画法が決められています。ねじ (JIS B 0002)、歯車 (JIS B 0003)、ばね (JIS B 0004)、転がり軸受 (JIS B 0005)、センタ穴 (JIS B 0041) の描き方と呼び方を学びます。",
    body: `
<h2>ねじの略画法 (JIS B 0002)</h2>
<table class="tb-table">
  <tr><th>部分</th><th>おねじ</th><th>めねじ</th></tr>
  <tr><td>山の頂 (外から見える輪郭)</td><td>外径 = <b>太い実線</b></td><td>内径 (下穴) = <b>太い実線</b></td></tr>
  <tr><td>谷底</td><td>谷径 = <b>細い実線</b></td><td>谷径 (呼び径) = <b>細い実線</b></td></tr>
  <tr><td>端面から見た図の谷径</td><td colspan="2">細い実線の<b>約 3/4 の円</b> (一部を欠く)。面取り円は描かない</td></tr>
  <tr><td>完全ねじ部の境界</td><td colspan="2">太い実線</td></tr>
  <tr><td>断面のハッチング</td><td colspan="2">山の頂の線 (おねじは外径、めねじは内径) まで引く</td></tr>
</table>
<svg class="tb-chart" viewBox="0 0 520 214" role="img" aria-label="おねじとめねじの略画法">
  <rect class="k-panel" x="8" y="8" width="244" height="198" rx="8"/><rect class="k-panel" x="268" y="8" width="244" height="198" rx="8"/>
  <text class="k-title" x="22" y="32">おねじ</text><text class="k-title" x="282" y="32">めねじ (断面)</text>
  <path d="M170,75 L32,75 L26,81 L26,119 L32,125 L170,125" style="stroke-width:2.2;fill:var(--tb-surface)" class="k-edge"/>
  <path class="k-thin" d="M170,75 q6,12 0,25 q-6,13 0,25"/>
  <line class="k-thin" x1="26" y1="81" x2="130" y2="81"/><line class="k-thin" x1="26" y1="119" x2="130" y2="119"/>
  <line class="k-edge" x1="130" y1="75" x2="130" y2="125" style="stroke-width:2.2"/>
  <line class="k-center" x1="18" y1="100" x2="180" y2="100"/>
  <circle cx="215" cy="100" r="25" fill="none" style="stroke:var(--k-line)" stroke-width="2.2"/>
  <path class="k-thin" d="M234,100 A19,19 0 1 1 215,81" style="stroke:var(--k-line)"/>
  <line class="k-center" x1="184" y1="100" x2="246" y2="100"/><line class="k-center" x1="215" y1="69" x2="215" y2="131"/>
  <line class="k-thin" x1="60" y1="81" x2="52" y2="56"/><text class="k-note" x="30" y="52">谷径 = 細線</text>
  <line class="k-thin" x1="130" y1="126" x2="112" y2="176"/><text class="k-note" x="22" y="190">完全ねじ部の境界 = 太線</text>
  <text class="k-note" x="244" y="152" text-anchor="end">端面: 谷径は</text><text class="k-note" x="244" y="166" text-anchor="end">細線で約 3/4 円</text>
  <path class="k-cut" d="M284,70 L333,70 L333,130 L284,130 Z" style="stroke-width:2.2"/>
  <path class="k-cut" d="M367,70 L416,70 L416,130 L367,130 Z" style="stroke-width:2.2"/>
  <line class="k-thin" x1="328" y1="70" x2="328" y2="130" style="stroke:var(--k-line)"/><line class="k-thin" x1="372" y1="70" x2="372" y2="130" style="stroke:var(--k-line)"/>
  <line class="k-center" x1="350" y1="58" x2="350" y2="142"/>
  <circle cx="465" cy="100" r="17" fill="none" style="stroke:var(--k-line)" stroke-width="2.2"/>
  <path class="k-thin" d="M487,100 A22,22 0 1 1 465,78" style="stroke:var(--k-line)"/>
  <line class="k-center" x1="436" y1="100" x2="494" y2="100"/><line class="k-center" x1="465" y1="71" x2="465" y2="129"/>
  <text class="k-note" x="282" y="152">内径 (下穴) = 太線、谷径 = 細線</text>
  <text class="k-note" x="282" y="168">ハッチングは太線 (内径) まで</text>
  <text class="k-note" x="282" y="184">端面: 谷径の細線は約 3/4 円</text>
</svg>
<h2>ねじの呼び方</h2>
<div class="tb-formula">M10 × 1.25 − 6H　=　メートル細目ねじ・呼び径 10 mm・ピッチ 1.25 mm・めねじの公差域クラス 6H</div>
<ul>
  <li><b>M</b>: メートルねじ。並目ねじは<b>ピッチを省略</b> (M10 = M10×1.5)。細目ねじはピッチを必ず書く</li>
  <li>公差域クラスは<b>大文字 = めねじ</b> (6H)、<b>小文字 = おねじ</b> (6g)。はめあいとして「6H/6g」と書くこともある</li>
  <li>左ねじは <b>LH</b> を付ける (例: M10-LH)。多条ねじはリードとピッチを併記</li>
  <li>管用ねじ: <b>R</b> (テーパおねじ)、<b>Rc</b> (テーパめねじ)、<b>G</b> (平行ねじ)。例: Rc 1/4</li>
</ul>
<h2>歯車 (JIS B 0003)</h2>
<table class="tb-table">
  <tr><th>円</th><th>線</th><th>計算 (標準平歯車)</th></tr>
  <tr><td>歯先円</td><td><b>太い実線</b></td><td>da = m (z + 2)</td></tr>
  <tr><td>ピッチ円 (基準円)</td><td><b>細い一点鎖線</b></td><td>d = m z</td></tr>
  <tr><td>歯底円</td><td><b>細い実線</b> (省略可。断面図では太い実線)</td><td>df = m (z − 2.5)</td></tr>
</table>
<p>歯の形は描かず、モジュール・歯数・圧力角・歯形などは<b>要目表</b>にまとめます。断面図では歯を切断しません。</p>
<h2>ばね (JIS B 0004) と転がり軸受 (JIS B 0005)</h2>
<ul>
  <li><b>コイルばね</b>: 原則として<b>無荷重の状態</b>で描き、図示しない場合は右巻き。中間部は省略して細い一点鎖線 (線径中心線) でつなげてよい。簡略図ではばねの中心線を太い実線 1 本で描く。自由長・巻数・ばね定数などは要目表に</li>
  <li><b>転がり軸受</b>: 一般的に表すときは外形の四角の中に<b>直立した十字</b> (外形線に接しない) を描く簡略図示。玉・ころの種類を示したい場合は個別簡略図示を使う。軸受は呼び番号 (例: 6204) で指定する</li>
</ul>
<h2>センタ穴 (JIS B 0041)</h2>
<table class="tb-table">
  <tr><th>指示</th><th>意味</th></tr>
  <tr><td>センタ穴を<b>残す</b></td><td>引出線の先に残す記号 + 呼び (例: JIS B 1011 A 2/4.25 — 規格と形式・寸法)</td></tr>
  <tr><td>残しても<b>よい</b></td><td>記号なしで呼びだけ</td></tr>
  <tr><td>残しては<b>ならない</b></td><td>× 付きの記号</td></tr>
</table>
<div class="tb-note">センタ穴の図示記号の細かな形は JIS B 0041 (ISO 6411 対応) を参照してください。古い図面では「センタ穴 両端」などの文字指示も見られます。</div>
<div class="tb-tip"><b>3DCAD Studio では</b>: <b>ねじフィーチャ</b>で作ったねじ穴・おねじは、図面上で JIS B 0002 の略画法 (谷径の細線・約 3/4 円) で自動的に描かれ、<b>穴注記</b>で M10×1.25-6H のような呼びを記入できます。</div>`,
    points: ["ねじは山の頂を太線、谷を細線、端面の谷径は約 3/4 円", "M10×1.25-6H: 細目ピッチは必須、大文字はめねじ・小文字はおねじ", "歯車: 歯先円 太線、ピッチ円 一点鎖線、歯底円 細線。詳細は要目表", "ばねは無荷重状態、軸受は簡略図示 + 呼び番号、センタ穴は残す/可/不可を指示"],
    exercises: [
      {
        q: "モジュール m = 2、歯数 z = 30 の標準平歯車の、ピッチ円直径・歯先円直径・歯底円直径を求め、それぞれの線の種類を答えてください。",
        a: "ピッチ円 d = 2 × 30 = <b>60 mm</b> (細い一点鎖線)。歯先円 da = 2 × (30 + 2) = <b>64 mm</b> (太い実線)。歯底円 df = 2 × (30 − 2.5) = <b>55 mm</b> (細い実線)。",
      },
    ],
    quiz: [
      { q: "おねじの谷径を表す線は?", choices: ["太い実線", "細い実線", "細い破線"], answer: 1, explain: "谷径は細い実線、山の頂 (外径) は太い実線です。" },
      { q: "「M12」と書かれたねじのピッチは?", choices: ["並目のピッチ (1.75 mm)", "細目のピッチ (1.25 mm)", "指定なし (任意)"], answer: 0, explain: "並目ねじはピッチを省略します。M12 並目のピッチは 1.75 mm です。" },
      { q: "歯車のピッチ円の線は?", choices: ["太い実線", "細い一点鎖線", "細い二点鎖線"], answer: 1, explain: "ピッチ円は細い一点鎖線で描きます。" },
    ],
    lessons: ["6-1", "3-2"],
  },
  {
    id: "weld-symbols",
    part: "drafting",
    title: "溶接記号 — 基線・矢・尾の読み方",
    minutes: 20,
    level: 2,
    lead: "溶接構造物の図面では、どこを・どんな形で・どれだけ溶接するかを溶接記号 (JIS Z 3021) で指示します。基線の上下で意味が変わるなど独特のルールがあり、読み違えると溶接位置が逆になります。",
    body: `
<h2>溶接記号の構成</h2>
<svg class="tb-chart" viewBox="0 0 520 222" role="img" aria-label="溶接記号の構成">
  <g class="k-shadow">
    <rect class="k-cut" x="16" y="180" width="124" height="16"/>
    <rect class="k-cut2" x="78" y="112" width="14" height="68"/>
  </g>
  <path d="M92,180 L106,180 L92,166 Z" style="fill:var(--tb-accent);stroke:var(--k-line)" stroke-width="1.2"/>
  <text class="k-note" x="20" y="174">T 継手</text>
  <path d="M160,100 L101,173" fill="none" style="stroke:var(--k-line)" stroke-width="1.6" marker-end="url(#k-arrow)"/>
  <line x1="160" y1="100" x2="400" y2="100" style="stroke:var(--k-line)" stroke-width="1.6"/>
  <path d="M400,100 L426,76 M400,100 L426,124" fill="none" style="stroke:var(--k-line)" stroke-width="1.6"/>
  <circle cx="160" cy="100" r="7" fill="none" style="stroke:var(--tb-accent)" stroke-width="1.8"/>
  <line x1="160" y1="93" x2="160" y2="60" style="stroke:var(--tb-accent)" stroke-width="1.6"/><path d="M160,60 L184,67 L160,74 Z" style="fill:var(--tb-accent)"/>
  <path d="M250,102 L250,126 L274,102 Z" fill="none" style="stroke:var(--tb-accent)" stroke-width="2"/>
  <text class="k-dimtext" x="244" y="120" text-anchor="end">6</text><text class="k-dimtext" x="280" y="120">50</text>
  <text class="lbl" x="320" y="92">基線</text>
  <text class="lbl" x="432" y="104">尾</text>
  <text class="lbl" x="190" y="66">現場溶接 (旗)</text>
  <text class="lbl" x="174" y="128">全周 (円)</text>
  <text class="lbl" x="134" y="156">矢 (溶接部を指す)</text>
  <text class="k-note" x="262" y="142" text-anchor="middle">隅肉記号</text>
  <text class="k-note" x="300" y="200">基線の下 = 矢の側の隅肉</text>
  <text class="k-note" x="300" y="215">脚長 6・長さ 50</text>
</svg>
<ul>
  <li><b>矢</b>: 溶接する継手の位置を指す。レ形・J 形など開先を片側だけにとる場合は、<b>開先をとる部材の側</b>に矢を向ける (必要なら矢を折る)</li>
  <li><b>基線</b>: 水平に引き、ここに溶接記号と寸法を書く</li>
  <li><b>尾</b>: 溶接方法・工程などの補足を書く。不要なら省略</li>
</ul>
<h2>基線の上か下か</h2>
<table class="tb-table">
  <tr><th>記号の位置</th><th>意味</th></tr>
  <tr><td>基線の<b>下側</b></td><td><b>矢の側</b> (矢が指している面) を溶接</td></tr>
  <tr><td>基線の<b>上側</b></td><td><b>矢の反対側</b>を溶接</td></tr>
  <tr><td>上下両方</td><td>両側溶接 (両面隅肉、X 形開先など)</td></tr>
</table>
<div class="tb-note">JIS Z 3021 は「下 = 矢の側、上 = 反対側」です (AWS も同じ)。ISO 2553 には破線の識別線を基線と平行に引く方式 (システム A) があり、記号が実線側か破線側かで判断するため、海外図面では表記が異なる場合があります。JIS Z 3021:2016 は ISO 2553 との整合が図られているので、図面の準拠規格を確認してください。</div>
<h2>基本記号</h2>
<table class="tb-table">
  <tr><th>名称</th><th>記号の形</th><th>用途</th></tr>
  <tr><td>隅肉溶接</td><td>直角三角形 (縦辺が左)</td><td>T 継手・重ね継手。最も多い</td></tr>
  <tr><td>I 形開先</td><td>平行な 2 本の縦線 ‖</td><td>薄板の突合せ (開先加工なし)</td></tr>
  <tr><td>V 形開先</td><td>V</td><td>両方の部材に開先をとる突合せ</td></tr>
  <tr><td>レ形開先</td><td>縦線 + 斜線 (片側だけ傾斜)</td><td>片方の部材だけに開先をとる突合せ・T 継手</td></tr>
</table>
<h2>寸法の書き方</h2>
<ul>
  <li><b>隅肉溶接</b>: 記号の<b>左</b>に脚長 (例: 6)、のど厚で指示する場合は a を付ける (例: a4)。等脚の隅肉ではのど厚 ≈ 0.7 × 脚長。記号の<b>右</b>に溶接長さ</li>
  <li><b>開先溶接</b>: 開先深さ・ルート間隔・開先角度を記号の周囲に記入</li>
  <li><b>断続溶接</b>: 長さとピッチ (またはすき間) を記入</li>
</ul>
<div class="tb-note">断続溶接の表し方は改正で変わっています。旧 JIS では「長さ − ピッチ」(例: 50−150)、JIS Z 3021:2016 では ISO に合わせて「個数 × 長さ (すき間)」(例: 3×50(100)) の形が用いられます。どちらの版に従った図面かを確認して読んでください。</div>
<h2>補助記号</h2>
<ul>
  <li><b>全周溶接</b>: 矢と基線の交点に<b>円</b></li>
  <li><b>現場溶接</b>: 矢と基線の交点に<b>旗</b> (工場ではなく据付現場で溶接)</li>
  <li>表面形状 (平ら・凸・へこみ) や仕上げ方法 (グラインダなど) も補助記号で指示できる</li>
</ul>
<div class="tb-tip"><b>3DCAD Studio では</b>: 図面環境の<b>溶接記号</b>で基線・矢・尾、基本記号、脚長・長さ、全周・現場溶接の補助記号を配置できます。上下の位置で意味が変わるので、配置後に矢の側を必ず確認しましょう。</div>`,
    points: ["溶接記号は矢・基線・尾で構成", "JIS では基線の下 = 矢の側、上 = 反対側", "隅肉は左に脚長 (のど厚は a)、右に長さ。のど厚 ≈ 0.7 × 脚長", "全周は円、現場溶接は旗。断続溶接の表記は JIS の版で異なる"],
    exercises: [
      {
        q: "脚長 8 mm の等脚隅肉溶接を長さ 100 mm 施工します。理論のど厚と、のど断面積 (強度計算に使う面積) を求めてください。",
        a: "のど厚 a = 8 × cos45° ≈ 8 × 0.707 ≈ <b>5.66 mm</b>。のど断面積 = 5.66 × 100 ≈ <b>566 mm²</b> です。",
      },
    ],
    quiz: [
      { q: "JIS Z 3021 で、隅肉記号が基線の上側に書かれていたら?", choices: ["矢の側を溶接", "矢の反対側を溶接", "両側を溶接"], answer: 1, explain: "基線の上側は矢の反対側、下側は矢の側です。" },
      { q: "矢と基線の交点に旗が付いている意味は?", choices: ["全周溶接", "現場溶接", "仕上げ指示"], answer: 1, explain: "旗は現場溶接、円は全周溶接です。" },
      { q: "隅肉記号の左側に書く数値は?", choices: ["溶接長さ", "脚長", "ピッチ"], answer: 1, explain: "左に脚長 (またはのど厚)、右に長さを書きます。" },
    ],
    lessons: ["0-6"],
  },
  {
    id: "gdt",
    part: "drafting",
    title: "幾何公差の詳細 — データムと位置度",
    minutes: 25,
    level: 2,
    lead: "基礎編では幾何公差の種類と記入枠を紹介しました。ここではデータムの決め方 (三平面体系)、公差域の形、最大実体公差方式 Ⓜ の考え方、ボルト穴の位置度の計算、そして実際の検査方法まで踏み込みます。",
    body: `
<h2>データムとデータム三平面体系</h2>
<p><b>データム</b>は幾何公差を測るための基準です。実際の部品の面 (データム形体) は完全な平面ではないので、それに接する理想的な平面・直線 (実用データム形体: 定盤や検査治具) を基準にします。</p>
<ol>
  <li><b>第 1 次データム (A)</b>: 部品を最も安定に置ける大きな面。3 点で接して 3 自由度を拘束</li>
  <li><b>第 2 次データム (B)</b>: A に直角な面。2 点で接して 2 自由度を拘束</li>
  <li><b>第 3 次データム (C)</b>: A・B に直角な面。1 点で接して残り 1 自由度を拘束</li>
</ol>
<p>記入枠の <code>[⌖ | φ0.2 | A | B | C]</code> は、A → B → C の<b>順番</b>で部品を固定して測るという意味です。順番を変えると測定結果が変わるので、組立時の当たり面の順に合わせて決めます。</p>
<svg class="tb-chart" viewBox="0 0 520 196" role="img" aria-label="幾何公差の記入枠とデータム記号">
  <rect x="30" y="34" width="300" height="36" style="fill:var(--tb-surface);stroke:var(--k-line)" stroke-width="1.6"/>
  <path d="M80,34 V70 M180,34 V70 M230,34 V70 M280,34 V70" style="stroke:var(--k-line)" stroke-width="1.4"/>
  <circle cx="55" cy="52" r="8" fill="none" style="stroke:var(--k-line)" stroke-width="1.6"/><path d="M42,52 H68 M55,39 V65" style="stroke:var(--k-line)" stroke-width="1.6"/>
  <text class="mark-t" x="112" y="58" text-anchor="middle" style="font-size:14px">φ0.2</text>
  <circle cx="152" cy="52" r="8" fill="none" style="stroke:var(--k-line)" stroke-width="1.2"/><text class="mark-t" x="152" y="56" text-anchor="middle" style="font-size:10px">M</text>
  <text class="mark-t" x="205" y="58" text-anchor="middle" style="font-size:14px">A</text><text class="mark-t" x="255" y="58" text-anchor="middle" style="font-size:14px">B</text><text class="mark-t" x="305" y="58" text-anchor="middle" style="font-size:14px">C</text>
  <path class="k-thin" d="M55,72 V82 M130,72 V82 M205,72 V82 M255,72 V82 M305,72 V82"/>
  <text class="k-note" x="55" y="96" text-anchor="middle">記号</text>
  <text class="k-note" x="130" y="96" text-anchor="middle">公差域</text><text class="k-note" x="130" y="110" text-anchor="middle">(φ = 円筒)</text>
  <text class="k-note" x="205" y="96" text-anchor="middle">第 1 次</text><text class="k-note" x="255" y="96" text-anchor="middle">第 2 次</text><text class="k-note" x="305" y="96" text-anchor="middle">第 3 次</text>
  <text class="k-note" x="255" y="110" text-anchor="middle">データム</text>
  <text class="k-note" x="30" y="140">位置度の例: 穴の軸線は、データム A・B・C から</text>
  <text class="k-note" x="30" y="155">決まる理論位置を中心に φ0.2 の円筒内にあること</text>
  <g class="k-shadow"><rect class="k-part" x="380" y="130" width="120" height="36"/></g>
  <path d="M430,130 L450,130 L440,117 Z" style="fill:var(--k-line)"/>
  <line x1="440" y1="117" x2="440" y2="70" style="stroke:var(--k-line)" stroke-width="1.4"/>
  <rect x="424" y="38" width="32" height="32" style="fill:var(--tb-surface);stroke:var(--k-line)" stroke-width="1.6"/>
  <text class="mark-t" x="440" y="59" text-anchor="middle" style="font-size:14px">A</text>
  <text class="k-note" x="508" y="186" text-anchor="end">データム記号 (塗りつぶし三角)</text>
</svg>
<h2>公差域の形</h2>
<table class="tb-table">
  <tr><th>公差域</th><th>例</th></tr>
  <tr><td>2 平行平面の間</td><td>平面度・平行度 (面)・直角度 (面)</td></tr>
  <tr><td>同一平面上の 2 平行直線の間</td><td>真直度 (面上の線)</td></tr>
  <tr><td>円筒の内部 (公差値に φ)</td><td>軸線の真直度・穴の位置度・同軸度</td></tr>
  <tr><td>同心 2 円の間</td><td>真円度</td></tr>
  <tr><td>同軸 2 円筒の間</td><td>円筒度</td></tr>
</table>
<p>公差値の前に <b>φ</b> が付くと公差域は円筒 (円)、付かなければ平行 2 平面 (2 直線) です。穴の位置度に φ を付けると、四角い ±公差よりも約 57 % 広い面積の公差域になります (円の直径を正方形の対角線にとった場合)。</p>
<h2>最大実体公差方式 Ⓜ</h2>
<p><b>最大実体状態 (MMC)</b> は材料が最も多い状態 = 穴なら<b>最小径</b>、軸なら<b>最大径</b>です。公差値の後に Ⓜ を付けると、「位置度 φ0.2 は MMC のときの値で、形体が MMC から離れた分 (穴が大きくなった分) だけ位置度を<b>追加で許す (ボーナス公差)</b>」という意味になります。</p>
<div class="tb-formula">許容される位置度 = 指示値 + (実際の穴径 − 穴の最小径)</div>
<p>組み付けられるかどうか (はめあいの成立) だけが重要な形体に使うと、合格品が増えてコストが下がります。逆に、位置そのものが機能に効く場合 (歯車の軸間距離など) には使いません。</p>
<h2>ボルト穴の位置度 — 浮動締結</h2>
<p>2 枚の板の<b>両方にきり穴</b>をあけ、ボルトとナットで締める形を<b>浮動締結</b>と呼びます。ボルトはどちらの穴の中でも動けるので、各板の穴に許せる位置度 T は次の式で求まります。</p>
<div class="tb-formula">T = H − F　　H: 穴の最小径 (MMC)、F: ボルトの最大径 (MMC)</div>
<p>穴が理想位置から T/2 ずれても、ボルトとの間に (H − F)/2 のすき間があるので干渉しない、という関係です。両方の板に同じ T を指示すれば、最悪の場合 (両方が逆向きにずれる) でも組み付けられます。</p>
<p>例: M8 ボルト (F = 8.0 mm) に φ9 の穴 (公差 +0.2/0、H = 9.0 mm)。</p>
<ul>
  <li>T = 9.0 − 8.0 = <b>φ1.0</b> → 記入枠は <code>[⌖ | φ1 Ⓜ | A | B]</code> のように指示</li>
  <li>実際の穴が φ9.2 に仕上がれば、ボーナスで φ1.0 + 0.2 = <b>φ1.2</b> まで許される</li>
</ul>
<div class="tb-note">片方の板がめねじ (またはスタッド) の<b>固定締結</b>では、ボルトが一方で固定されて動けないため T = (H − F)/2 が各部品の目安となり、さらにねじ部の傾きを考える突出公差域 Ⓟ を使うこともあります。</div>
<h2>検査方法</h2>
<table class="tb-table">
  <tr><th>方法</th><th>測れるもの</th><th>ポイント</th></tr>
  <tr><td>定盤 + ダイヤルゲージ</td><td>平面度・平行度・高さ</td><td>データム面を定盤に置き、ゲージを走らせて振れ幅を読む。平面度は 3 点支持で傾きを調整</td></tr>
  <tr><td>定盤 + 直角定規・ブロック</td><td>直角度</td><td>直角な基準に当てて、すき間やゲージの差を測る</td></tr>
  <tr><td>Vブロック・センタ + ダイヤルゲージ</td><td>円周振れ・全振れ</td><td>データム軸で回転させ、振れの最大値 − 最小値</td></tr>
  <tr><td>三次元測定機 (CMM)</td><td>位置度・輪郭度などほぼすべて</td><td>点群からデータム系を数学的に構築し、公差域と比較。プログラムで繰返し測定</td></tr>
  <tr><td>機能ゲージ</td><td>Ⓜ 付きの位置度</td><td>MMC の仮想サイズのピンを並べたゲージに入れば合格</td></tr>
</table>
<div class="tb-tip"><b>3DCAD Studio では</b>: 図面環境の<b>データム</b>で A・B・C を指定し、<b>幾何公差</b>で記号・公差値・Ⓜ・データム参照を入力します。位置度の基準寸法は理論的に正確な寸法 (枠囲み) にしましょう。</div>`,
    points: ["データム三平面体系: 第 1 次 3 点、第 2 次 2 点、第 3 次 1 点で 6 自由度を拘束", "公差値に φ → 円筒の公差域、なし → 平行 2 平面", "Ⓜ: 穴が MMC (最小径) から大きくなった分だけ位置度にボーナス", "浮動締結の穴の位置度 T = H − F (穴最小径 − ボルト最大径)"],
    exercises: [
      {
        q: "M10 ボルト (最大径 F = 10.0 mm) で 2 枚の板を浮動締結します。穴を φ11 +0.2/0 としたとき、各板に指示する位置度はいくらですか? 穴が φ11.15 に仕上がったときに許される位置度は? (Ⓜ を適用)",
        a: "T = H − F = 11.0 − 10.0 = <b>φ1.0</b>。穴が φ11.15 ならボーナスは 11.15 − 11.0 = 0.15 なので、許される位置度は <b>φ1.15</b> です。",
      },
      {
        q: "位置度 φ0.4 (円形公差域) と、X・Y それぞれ ±0.2 (正方形公差域) では、どちらの公差域が広いですか? また、正方形の対角線と同じ直径の円の面積は正方形の何倍ですか?",
        a: "±0.2 の正方形は 1 辺 0.4 で面積 0.16 mm²、φ0.4 の円は π × 0.2² ≈ <b>0.126 mm²</b> で、正方形の方が広い (ただし角の方向には中心から最大 0.283 ずれる)。正方形の対角線 0.566 を直径とする円は π × 0.283² ≈ 0.251 mm² で、<b>約 1.57 倍</b>です。組立機能 (どの方向にも同じすき間) に合うのは円形公差域です。",
      },
    ],
    quiz: [
      { q: "穴の最大実体状態 (MMC) は?", choices: ["穴径が最大のとき", "穴径が最小のとき", "穴が理想位置にあるとき"], answer: 1, explain: "材料が最も多い = 穴が最も小さい状態が穴の MMC です。" },
      { q: "第 1 次データム面は何点で接触して支える?", choices: ["1 点", "2 点", "3 点"], answer: 2, explain: "第 1 次は 3 点、第 2 次は 2 点、第 3 次は 1 点です。" },
      { q: "穴最小径 φ6.6、ボルト最大径 φ6.0 の浮動締結で、各穴の位置度は?", choices: ["φ0.3", "φ0.6", "φ1.2"], answer: 1, explain: "T = H − F = 6.6 − 6.0 = φ0.6 です。" },
    ],
    lessons: ["6-1", "0-6"],
  },
  {
    id: "reading",
    part: "drafting",
    title: "図面を読む — 手順と練習",
    minutes: 20,
    level: 1,
    lead: "図面を描く力と同じくらい、他人の図面を正しく読む力が大切です。決まった順番で読めば、見落としや読み違いはぐっと減ります。最後に三面図から立体を当てる練習問題に挑戦しましょう。",
    body: `
<h2>読図の手順</h2>
<ol class="tb-flow">
  <li><b>表題欄</b>: 品名・図番・材料・数量・尺度・普通公差・改訂記号を確認</li>
  <li><b>投影法</b>: 第三角法か第一角法かを記号で確認 (海外図面は第一角法が多い)</li>
  <li><b>図の配置</b>: 正面図はどれか、断面図・詳細図・補助投影図の対応 (A–A など) を把握</li>
  <li><b>形を想像</b>: 外形 → 大きな穴・段 → 細部の順に立体を組み立てる</li>
  <li><b>寸法</b>: 全体寸法 → 基準 (データム) → 各部寸法。単位は特記なければ mm</li>
  <li><b>公差・表面性状</b>: 公差付き寸法・はめあい記号・幾何公差・Ra から重要な面を見つける</li>
  <li><b>注記</b>: 熱処理・表面処理・バリ取り・指示なき面取りなどの一般注記</li>
</ol>
<h2>よくある読み違い</h2>
<table class="tb-table">
  <tr><th>読み違い</th><th>防ぐには</th></tr>
  <tr><td>第一角法の図を第三角法で読み、左右や上下を逆に解釈</td><td>まず投影法記号を見る</td></tr>
  <tr><td>破断して短く描いた部品を、図から測って長さを判断</td><td>寸法は書かれた数値だけを読む。図から測らない</td></tr>
  <tr><td>片側断面の外形側にかくれ線がないので、内部がないと思う</td><td>断面側で内部形状を確認する</td></tr>
  <tr><td>参考寸法 ( ) を検査寸法と誤解</td><td>括弧・枠・下線の意味を確認</td></tr>
  <tr><td>溶接記号の上下を逆に読み、反対側を溶接</td><td>JIS は基線の下 = 矢の側</td></tr>
  <tr><td>改訂前の図面で作業</td><td>改訂欄と図番の版を確認</td></tr>
</table>
<h2>練習問題 1</h2>
<p>次の三面図 (第三角法) が表す立体を答えてください。</p>
<svg class="tb-chart" viewBox="0 0 520 262" role="img" aria-label="練習問題1の三面図">
  <path class="k-thin" d="M40,104 V136 M100,104 V136 M200,104 V136 M204,140 H246 M204,190 H246 M204,240 H246" stroke-dasharray="3 3"/>
  <rect x="40" y="30" width="160" height="70" style="stroke-width:2.2;fill:var(--tb-surface)" class="k-edge"/>
  <line class="k-edge" x1="100" y1="30" x2="100" y2="100" style="stroke-width:2.2"/>
  <path d="M40,240 L200,240 L200,190 L100,190 L100,140 L40,140 Z" style="stroke-width:2.2;fill:var(--tb-surface)" class="k-edge"/>
  <rect x="250" y="140" width="70" height="100" style="stroke-width:2.2;fill:var(--tb-surface)" class="k-edge"/>
  <line class="k-edge" x1="250" y1="190" x2="320" y2="190" style="stroke-width:2.2"/>
  <text class="k-title" x="40" y="22">平面図</text><text class="k-title" x="40" y="258">正面図</text><text class="k-title" x="250" y="258">右側面図</text>
  <text class="k-note" x="360" y="40">第三角法</text>
  <text class="k-note" x="360" y="56">平面図は正面図の上、</text><text class="k-note" x="360" y="72">右側面図は右に置く</text>
  <text class="k-note" x="360" y="88">細い点線 = 投影の対応</text>
</svg>
<h2>練習問題 2</h2>
<p>次の三面図 (第三角法) が表す立体を答えてください。破線はかくれ線です。</p>
<svg class="tb-chart" viewBox="0 0 520 262" role="img" aria-label="練習問題2の三面図">
  <path class="k-thin" d="M40,114 V146 M100,114 V146 M140,114 V146 M200,114 V146 M204,150 H246 M204,210 H246" stroke-dasharray="3 3"/>
  <rect x="40" y="30" width="160" height="80" style="stroke-width:2.2;fill:var(--tb-surface)" class="k-edge"/>
  <circle cx="120" cy="70" r="20" fill="none" style="stroke:var(--k-line)" stroke-width="2.2"/>
  <line class="k-center" x1="120" y1="42" x2="120" y2="98"/><line class="k-center" x1="92" y1="70" x2="148" y2="70"/>
  <rect x="40" y="150" width="160" height="60" style="stroke-width:2.2;fill:var(--tb-surface)" class="k-edge"/>
  <line class="k-hidden" x1="100" y1="150" x2="100" y2="210"/><line class="k-hidden" x1="140" y1="150" x2="140" y2="210"/>
  <line class="k-center" x1="120" y1="142" x2="120" y2="218"/>
  <rect x="250" y="150" width="80" height="60" style="stroke-width:2.2;fill:var(--tb-surface)" class="k-edge"/>
  <line class="k-hidden" x1="270" y1="150" x2="270" y2="210"/><line class="k-hidden" x1="310" y1="150" x2="310" y2="210"/>
  <line class="k-center" x1="290" y1="142" x2="290" y2="218"/>
  <text class="k-title" x="40" y="22">平面図</text><text class="k-title" x="40" y="236">正面図</text><text class="k-title" x="250" y="236">右側面図</text>
  <line class="k-hidden" x1="370" y1="40" x2="410" y2="40"/><text class="k-note" x="418" y="44">かくれ線</text>
  <line class="k-center" x1="370" y1="62" x2="410" y2="62"/><text class="k-note" x="418" y="66">中心線</text>
</svg>
<div class="tb-tip"><b>3DCAD Studio では</b>: 練習として、自分で立体をモデリングし、図面環境で<b>基準ビュー</b>と<b>投影ビュー</b>を配置して三面図と比べてみましょう。完成した図面は<b>表題欄・改訂表</b>を入れて <b>PDF/DXF/SVG 出力</b>できます。</div>`,
    points: ["表題欄 → 投影法 → 図の配置 → 形 → 寸法 → 公差・表面性状 → 注記の順に読む", "最初に投影法記号を確認する (第三角法 / 第一角法)", "寸法は書かれた数値だけを読み、図から測らない", "改訂欄・参考寸法・溶接記号の上下など読み違いやすい点を意識する"],
    exercises: [
      {
        q: "練習問題 1 の三面図はどのような立体ですか?",
        a: "<b>L 字形 (段付き) のブロック</b>です。正面図が L 字形で、左側 (幅 60) が高く、右側 (幅 100) が低い段になっています。平面図の縦線は段の境目、右側面図の横線は低い段の上面の高さを表します。奥行きは全体で一定です。",
      },
      {
        q: "練習問題 2 の三面図はどのような立体ですか?",
        a: "<b>上下に貫通する丸穴のある直方体</b>です。平面図の円が穴 (中心線付き)、正面図と右側面図の上から下まで通るかくれ線が穴の側面を表し、穴が底まで貫通していることがわかります。止まり穴なら破線は途中で止まり、底に横の破線が現れます。",
      },
    ],
    quiz: [
      { q: "読図で最初に確認すべきものは?", choices: ["細部の寸法", "表題欄と投影法", "表面性状"], answer: 1, explain: "表題欄 (材料・尺度・普通公差など) と投影法を確認してから図を読みます。" },
      { q: "第三角法で平面図が置かれる位置は?", choices: ["正面図の上", "正面図の下", "正面図の右"], answer: 0, explain: "第三角法では平面図は正面図の上、右側面図は右に置きます。" },
      { q: "貫通穴を正面から見たときのかくれ線は?", choices: ["上面から底面まで通る", "途中で止まる", "描かれない"], answer: 0, explain: "貫通穴の側面は上から下まで通る破線になります。" },
    ],
    lessons: ["6-1", "0-6"],
  },
];
