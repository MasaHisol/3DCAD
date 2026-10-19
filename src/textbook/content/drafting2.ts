import type { TextChapter } from "../types";

// Advanced drafting chapters (JIS B 0001 and related standards).
export const DRAFTING2: TextChapter[] = [
  {
    id: "drawing-format",
    part: "drafting",
    title: "線と図面様式 — 太さ・用紙・輪郭・表題欄・尺度",
    minutes: 20,
    level: 1,
    lead: "図面は誰が見ても同じように読めなければなりません。そのために JIS では線の太さの比率、用紙の大きさ、輪郭線や中心マーク、表題欄の位置、尺度や文字の大きさまで決められています。CAD のテンプレートの中身を一つずつ理解し、自分で正しく設定・確認できるようになりましょう。",
    body: `
<h2>線の太さと優先順位</h2>
<p>線の太さは 0.13 / 0.18 / 0.25 / 0.35 / 0.5 / 0.7 / 1 / 1.4 / 2 mm の系列から選び、<b>細線 : 太線 : 極太線 = 1 : 2 : 4</b> の比にします。A3〜A4 の機械図面では「細線 0.25 mm・太線 0.5 mm」または「0.35 / 0.7 mm」の組合せがよく使われます。同じ図面の中では線の太さをそろえることが大切です。</p>
<table class="tb-table">
  <tr><th>線の種類</th><th>名称</th><th>主な用途</th></tr>
  <tr><td>太い実線</td><td>外形線</td><td>見える部分の形</td></tr>
  <tr><td>細い実線</td><td>寸法線・寸法補助線・引出線・ハッチング・回転断面線・中心線 (短いもの)・水準面線</td><td>寸法と注記の記入</td></tr>
  <tr><td>細い破線 (または太い破線)</td><td>かくれ線</td><td>見えない部分の形</td></tr>
  <tr><td>細い一点鎖線</td><td>中心線・基準線・ピッチ線</td><td>図形の中心、ピッチ円</td></tr>
  <tr><td>太い一点鎖線</td><td>特殊指定線</td><td>熱処理・めっきなど特殊な加工を施す範囲</td></tr>
  <tr><td>細い二点鎖線</td><td>想像線・重心線</td><td>隣接部分、可動位置、加工前後の形</td></tr>
  <tr><td>不規則な細い波形の実線 / ジグザグ線</td><td>破断線</td><td>一部を破った境界、中間省略</td></tr>
  <tr><td>細い実線で規則的に並べた線</td><td>ハッチング</td><td>断面の切り口</td></tr>
</table>
<p>2 種類以上の線が同じ場所に重なるときは、次の順に<b>優先する線</b>を描きます。</p>
<div class="tb-formula">外形線 → かくれ線 → 切断線 → 中心線 → 重心線 → 寸法補助線</div>
<svg class="tb-chart" viewBox="0 0 520 170" aria-label="線の種類の見本">
  <line x1="30" y1="25" x2="230" y2="25" stroke="var(--tb-text)" stroke-width="2.4"/><text class="tick" x="250" y="29">太い実線 (外形線)</text>
  <line x1="30" y1="50" x2="230" y2="50" stroke="var(--tb-text-2)" stroke-width="1"/><text class="tick" x="250" y="54">細い実線 (寸法線・ハッチングなど)</text>
  <line x1="30" y1="75" x2="230" y2="75" stroke="var(--tb-text-2)" stroke-width="1" stroke-dasharray="6 3"/><text class="tick" x="250" y="79">細い破線 (かくれ線)</text>
  <line x1="30" y1="100" x2="230" y2="100" stroke="var(--tb-accent)" stroke-width="1" stroke-dasharray="16 3 2 3"/><text class="tick" x="250" y="104">細い一点鎖線 (中心線)</text>
  <line x1="30" y1="125" x2="230" y2="125" stroke="var(--tb-text)" stroke-width="2.4" stroke-dasharray="16 3 2 3"/><text class="tick" x="250" y="129">太い一点鎖線 (特殊指定線)</text>
  <line x1="30" y1="150" x2="230" y2="150" stroke="var(--tb-text-2)" stroke-width="1" stroke-dasharray="16 3 2 3 2 3"/><text class="tick" x="250" y="154">細い二点鎖線 (想像線)</text>
</svg>
<p class="tb-caption">図: 主な線の種類。一点鎖線・二点鎖線は長い線で始まり長い線で終わるように描き、中心線どうしは長い線の部分で交差させる。</p>
<h2>用紙の大きさと輪郭線</h2>
<p>製図用紙は A 列 (A0〜A4) を使います。A0 は面積 1 m² で、番号が一つ増えるごとに長辺を半分に折った大きさになります (縦横比 1 : √2)。</p>
<table class="tb-table">
  <tr><th>呼び</th><th>寸法 (mm)</th><th>輪郭の最小幅 c</th><th>とじる場合の d (左側)</th></tr>
  <tr><td>A0</td><td>841 × 1189</td><td>20</td><td rowspan="5">20</td></tr>
  <tr><td>A1</td><td>594 × 841</td><td>20</td></tr>
  <tr><td>A2</td><td>420 × 594</td><td>10</td></tr>
  <tr><td>A3</td><td>297 × 420</td><td>10</td></tr>
  <tr><td>A4</td><td>210 × 297</td><td>10</td></tr>
</table>
<ul>
  <li><b>輪郭線</b>: 図を描く領域の境界。0.5 mm 以上の太い実線で描きます</li>
  <li><b>中心マーク</b>: 用紙の 4 辺の中央に、用紙の縁から輪郭線の内側約 5 mm まで太い実線を引きます。複写・マイクロフィルム撮影の位置合わせに使います</li>
  <li><b>区域区分 (格子参照方式)</b>: 輪郭に沿って数字 (横) と英大文字 (縦) を振り、「C-4 の穴」のように図中の位置を示せるようにします</li>
  <li><b>表題欄</b>: 輪郭の内側の<b>右下</b>。表題欄の向きが図面を読む向きになります</li>
</ul>
<svg class="tb-chart" viewBox="0 0 520 260" aria-label="A3 用紙の図面様式">
  <rect x="40" y="20" width="420" height="230" fill="none" stroke="var(--tb-text-3)" stroke-width="1"/>
  <rect x="60" y="32" width="388" height="206" fill="none" stroke="var(--tb-text)" stroke-width="2.4"/>
  <line x1="250" y1="20" x2="250" y2="38" stroke="var(--tb-text)" stroke-width="2.4"/>
  <line x1="250" y1="232" x2="250" y2="250" stroke="var(--tb-text)" stroke-width="2.4"/>
  <line x1="40" y1="135" x2="66" y2="135" stroke="var(--tb-text)" stroke-width="2.4"/>
  <line x1="442" y1="135" x2="460" y2="135" stroke="var(--tb-text)" stroke-width="2.4"/>
  <rect x="318" y="190" width="130" height="48" fill="color-mix(in srgb, var(--tb-accent) 15%, transparent)" stroke="var(--tb-text)" stroke-width="1.5"/>
  <line x1="318" y1="206" x2="448" y2="206" stroke="var(--tb-text-2)"/><line x1="318" y1="222" x2="448" y2="222" stroke="var(--tb-text-2)"/>
  <line x1="378" y1="190" x2="378" y2="238" stroke="var(--tb-text-2)"/>
  <text class="tick" x="322" y="202">図名</text><text class="tick" x="322" y="218">図番</text><text class="tick" x="322" y="234">尺度</text>
  <text class="tick" x="382" y="202">投影法</text><text class="tick" x="382" y="218">作成・検図</text><text class="tick" x="382" y="234">日付・材料</text>
  <path d="M190,110 l60,0 l0,30 l-60,0 Z" fill="none" stroke="var(--tb-text-2)" stroke-dasharray="4 3"/>
  <text class="mark-t" x="220" y="129" text-anchor="middle">図</text>
  <text class="tick" x="10" y="80">とじ代 d</text>
  <text class="lbl" x="250" y="14" text-anchor="middle">中心マーク</text>
  <text class="mark-t" x="383" y="182" text-anchor="middle">表題欄 (右下)</text>
</svg>
<p class="tb-caption">図: 図面様式の要素。細線は用紙の縁、太線は輪郭線と中心マーク。表題欄は輪郭の内側右下に置く。</p>
<h2>尺度と文字</h2>
<table class="tb-table">
  <tr><th>種類</th><th>推奨尺度 (JIS Z 8314)</th></tr>
  <tr><td>現尺</td><td>1 : 1</td></tr>
  <tr><td>倍尺</td><td>2 : 1、5 : 1、10 : 1、20 : 1、50 : 1</td></tr>
  <tr><td>縮尺</td><td>1 : 2、1 : 5、1 : 10、1 : 20、1 : 50、1 : 100、1 : 200 …</td></tr>
</table>
<ul>
  <li>尺度は表題欄に書きます。一枚の図面で複数の尺度を使う場合は、主となる尺度を表題欄に、ほかは該当する図の近く (例: 「A 部 5 : 1」) に書きます</li>
  <li>図形が寸法数値に比例しない部分 (修正で寸法だけ変えた場合など) は、<b>寸法数値の下に太い実線</b>を引いて示します</li>
  <li>文字の高さは 2.5 / 3.5 / 5 / 7 / 10 mm から選びます (JIS Z 8313)。寸法数値は A3 以下なら 3.5 mm が標準的です</li>
  <li>寸法の単位は mm で、<b>単位記号は書きません</b>。角度は度 (°) を付けます</li>
</ul>
<div class="tb-tip">CAD では「現尺でモデル (図形) を描き、用紙側で尺度を掛ける」のが基本です。図形を縮めて描くと、寸法の自動計測値が狂う原因になります。</div>
`,
    points: ["線の太さは 細 : 太 : 極太 = 1 : 2 : 4。同じ図面では太さをそろえる", "重なる線の優先順位は 外形線 → かくれ線 → 切断線 → 中心線 → 重心線 → 寸法補助線", "A0・A1 は輪郭幅 20 mm、A2〜A4 は 10 mm、とじ代は 20 mm", "表題欄は右下、尺度は推奨値 (1:2, 1:5, 2:1 …) から選ぶ"],
    exercises: [
      {
        q: "A3 横の図面に、主となる尺度 1 : 2 で全体を描き、小さな溝部だけを拡大して描きたい。尺度はどこにどう書きますか?",
        a: "表題欄の尺度欄に主尺度 <b>1 : 2</b> を書きます。溝部は細い実線の円で囲んで英大文字 (例: A) を付け、拡大図の近くに <b>「A 部 5 : 1」</b> のように記入します。推奨尺度の中から選ぶのが原則で、5 : 1 や 2 : 1 などが使えます。",
      },
      {
        q: "かくれ線と中心線が同じ位置に重なりました。どちらを描きますか?",
        a: "線の優先順位は 外形線 → かくれ線 → 切断線 → 中心線 … の順なので、<b>かくれ線</b>を描きます。中心線は、かくれ線からはみ出す部分だけを描けば中心の位置が読み取れます。",
      },
    ],
    quiz: [
      { q: "JIS で定める細線・太線・極太線の太さの比は?", choices: ["1 : 1.5 : 2", "1 : 2 : 4", "1 : 3 : 6"], answer: 1, explain: "細線 : 太線 : 極太線 = 1 : 2 : 4 です。例えば 0.25 / 0.5 / 1 mm。" },
      { q: "熱処理する範囲を図に示す線は?", choices: ["太い一点鎖線", "細い二点鎖線", "太い破線"], answer: 0, explain: "特殊な加工を施す範囲は特殊指定線 (太い一点鎖線) で示します。" },
      { q: "A2 用紙で綴じない場合の輪郭線の最小幅は?", choices: ["5 mm", "10 mm", "20 mm"], answer: 1, explain: "A2〜A4 は 10 mm、A0・A1 は 20 mm です。" },
    ],
    lessons: ["0-6", "6-1"],
  },
  {
    id: "projection-practice",
    part: "drafting",
    title: "投影法の実際 — 第一角法と第三角法、図の配置と特殊な図示",
    minutes: 25,
    level: 2,
    lead: "JIS B 0001 では第三角法を原則としつつ、必要なら第一角法も使えます。海外の図面 (欧州は第一角法が主流) を読むときにも、二つの投影法の違いを確実に理解しておく必要があります。投影図の展開の仕組みから、図の配置、矢示法、相貫部や丸みの表し方まで、実際の図面で迷いやすい点を掘り下げます。",
    body: `
<h2>投影図の展開の仕組み</h2>
<p>品物を透明な箱に入れて各面に投影し、箱を開いて平面に広げたものが投影図です。<b>第三角法</b>では投影面が品物と観察者の間にあり、<b>第一角法</b>では品物が観察者と投影面の間にあります。この違いが図の置き場所の違いになります。</p>
<div data-widget="anim-projection"></div>
<table class="tb-table">
  <tr><th>図</th><th>第三角法での位置</th><th>第一角法での位置</th></tr>
  <tr><td>平面図 (上から見た図)</td><td>正面図の<b>上</b></td><td>正面図の<b>下</b></td></tr>
  <tr><td>右側面図</td><td>正面図の<b>右</b></td><td>正面図の<b>左</b></td></tr>
  <tr><td>左側面図</td><td>正面図の<b>左</b></td><td>正面図の<b>右</b></td></tr>
  <tr><td>下面図</td><td>正面図の<b>下</b></td><td>正面図の<b>上</b></td></tr>
  <tr><td>背面図</td><td colspan="2">左右どちらかの側面図のさらに外側 (都合のよい側)</td></tr>
</table>
<p>どちらの投影法かは、表題欄またはその近くに<b>投影法の記号</b>を描いて示します。記号は円すい台を正面と側面から見た図で、第三角法では側面形 (台形) が左・円が右、第一角法では円が左・台形が右です。</p>
<svg class="tb-chart" viewBox="0 0 520 120" aria-label="投影法の記号">
  <g transform="translate(70,55)">
    <path d="M0,-12 L30,-22 L30,22 L0,12 Z" fill="none" stroke="var(--tb-text)" stroke-width="2"/>
    <line x1="-8" y1="0" x2="38" y2="0" stroke="var(--tb-accent)" stroke-dasharray="10 3 2 3"/>
    <g transform="translate(80,0)"><circle r="22" fill="none" stroke="var(--tb-text)" stroke-width="2"/><circle r="12" fill="none" stroke="var(--tb-text)" stroke-width="2"/></g>
  </g>
  <text class="mark-t" x="120" y="110" text-anchor="middle">第三角法</text>
  <g transform="translate(330,55)">
    <circle r="22" fill="none" stroke="var(--tb-text)" stroke-width="2"/><circle r="12" fill="none" stroke="var(--tb-text)" stroke-width="2"/>
    <g transform="translate(45,0)"><path d="M0,-12 L30,-22 L30,22 L0,12 Z" fill="none" stroke="var(--tb-text)" stroke-width="2"/><line x1="-8" y1="0" x2="38" y2="0" stroke="var(--tb-accent)" stroke-dasharray="10 3 2 3"/></g>
  </g>
  <text class="mark-t" x="355" y="110" text-anchor="middle">第一角法</text>
</svg>
<p class="tb-caption">図: 投影法の記号。台形の小径側が円の側を向いていると覚えるより、「台形を右から見た図 (円) が右にある = 第三角法」と考えると間違えない。</p>
<h2>矢示法 — 決まった位置に置けないとき</h2>
<p>紙面の都合で投影図を正規の位置に置けない場合や、投影法に関係なく図を配置したい場合は、<b>矢示法</b>を使います。見る方向を矢印で示して英大文字を付け、その図の近く (原則として上側) に同じ英大文字を書きます。矢示法で描いた図は、投影法の約束に縛られずにどこにでも置けます。</p>
<h2>見える形を正しく描く細則</h2>
<ul>
  <li><b>相貫線</b>: 円筒どうしなど曲面が交わる線は、正しく投影すると曲線になります。直径の差が十分あるときなど、形の理解を妨げなければ<b>直線や円弧で近似</b>してよいとされています</li>
  <li><b>丸みのある交わり部</b>: 鋳物の隅の丸みなどで稜線が実際には存在しない場合でも、対応する図で必要なら、丸みがないとしたときの交わり線の位置に線を描いて形を示します (JIS は太い実線、ISO 128 は外形線に届かない細い実線と、規格によって扱いが異なるので社内規定を確認します)</li>
  <li><b>平面であることの表示</b>: 軸の一部が平らに削られている場合など、図形の一部が平面であることを示すには、その部分に<b>細い実線で対角線</b>を描きます</li>
  <li><b>特殊な加工部</b>: 一部分だけ焼入れするなどの範囲は、外形線に平行に少し離して<b>太い一点鎖線</b>を描き、加工の内容を注記します</li>
  <li><b>加工・処理範囲の想像線</b>: 加工前の形や組立後に加工する部分は細い二点鎖線で示します</li>
</ul>
<svg class="tb-chart" viewBox="0 0 520 170" aria-label="平面の表示と特殊指定線">
  <line x1="20" y1="80" x2="240" y2="80" stroke="var(--tb-accent)" stroke-dasharray="14 3 2 3"/>
  <path d="M30,50 L130,50 L130,45 L220,45 L220,115 L130,115 L130,110 L30,110 Z" fill="none" stroke="var(--tb-text)" stroke-width="2.4"/>
  <rect x="150" y="45" width="50" height="70" fill="none" stroke="var(--tb-text)" stroke-width="2.4"/>
  <line x1="150" y1="45" x2="200" y2="115" stroke="var(--tb-text-2)"/><line x1="200" y1="45" x2="150" y2="115" stroke="var(--tb-text-2)"/>
  <text class="tick" x="175" y="140" text-anchor="middle">平面部 = 細線の対角線</text>
  <path d="M290,60 L490,60 L490,110 L290,110 Z" fill="none" stroke="var(--tb-text)" stroke-width="2.4"/>
  <line x1="280" y1="85" x2="500" y2="85" stroke="var(--tb-accent)" stroke-dasharray="14 3 2 3"/>
  <line x1="420" y1="52" x2="490" y2="52" stroke="var(--tb-text)" stroke-width="2.4" stroke-dasharray="14 3 2 3"/>
  <line x1="420" y1="40" x2="420" y2="58" stroke="var(--tb-text-2)"/>
  <text class="mark-t" x="455" y="34" text-anchor="middle">高周波焼入れ</text>
  <text class="tick" x="390" y="140" text-anchor="middle">特殊指定線 = 太い一点鎖線</text>
</svg>
<p class="tb-caption">図: 左は軸の平取り部 (対角線で平面を示す)。右は部分焼入れの範囲を太い一点鎖線で示した例。範囲の寸法も記入する。</p>
<h2>読み違えやすいケース</h2>
<table class="tb-table">
  <tr><th>状況</th><th>注意点</th></tr>
  <tr><td>海外図面 (特に欧州)</td><td>第一角法が多い。記号を必ず確認する。平面図が正面図の下にあれば第一角法を疑う</td></tr>
  <tr><td>側面図が 1 つしかない</td><td>右側面図か左側面図かは配置で決まる。第三角法で正面図の左にあれば左側面図</td></tr>
  <tr><td>矢示法の図</td><td>投影法の位置関係は当てはまらない。矢印の向きで判断する</td></tr>
  <tr><td>回転投影図・展開図</td><td>投影の規則どおりではないので、注記や作図線を確認する</td></tr>
</table>
<div class="tb-note">JIS B 0001 は第三角法を原則とし、紙面の都合などで必要な場合に第一角法や矢示法を使えるとしています。一枚の図面で投影法を混在させてはいけません (矢示法を併用するのは可)。</div>
`,
    points: ["第三角法は見た側に図を置く、第一角法は反対側に置く", "投影法の記号を表題欄付近に必ず示す", "正規の位置に置けない図は矢示法 (矢印 + 英大文字) で", "平面部は細線の対角線、部分的な特殊加工は太い一点鎖線", "相貫線は形の理解を妨げなければ直線・円弧で近似してよい"],
    exercises: [
      {
        q: "ドイツから届いた図面で、正面図の下に上から見た図、正面図の左に右から見た図が描かれていました。投影法は何で、日本式に描き直すと各図はどこに移りますか?",
        a: "平面図が下・右側面図が左なので<b>第一角法</b>です。第三角法に直すと、平面図は正面図の<b>上</b>、右側面図は正面図の<b>右</b>に移ります。図の形そのものは同じで、配置だけが入れ替わります (ただし各図で正面図に隣接する面は、手前側と奥側が入れ替わる点に注意)。",
      },
      {
        q: "大きなフランジの裏側にある刻印面を示したいが、背面図を正規の位置に置くと用紙からはみ出す。どうしますか?",
        a: "<b>矢示法</b>を使います。正面図などに見る方向の矢印と英大文字 (例: A) を描き、空いている場所に描いた図の上に同じく「A」と書きます。必要なら部分投影図にして刻印面の周辺だけを描けば、さらに小さくできます。",
      },
    ],
    quiz: [
      { q: "第三角法で、左側面図はどこに置く?", choices: ["正面図の左", "正面図の右", "正面図の下"], answer: 0, explain: "第三角法は見た側に置くので、左から見た図は正面図の左です。" },
      { q: "第一角法の記号で、円の図は台形の図のどちら側にある?", choices: ["左", "右", "上"], answer: 0, explain: "第一角法は円 (右から見た図) を台形の左に置きます。第三角法は右。" },
      { q: "軸の平らに削った部分を示す方法は?", choices: ["細い実線で対角線を描く", "太い一点鎖線で囲む", "ハッチングを施す"], answer: 0, explain: "図形の一部が平面であることは、細い実線の対角線で示します。" },
    ],
    lessons: ["6-1", "6-2"],
  },
  {
    id: "element-drawing-adv",
    part: "drafting",
    title: "ねじ・歯車・ばねの図示の実際 — 組立状態・止まり穴・要目表",
    minutes: 25,
    level: 2,
    lead: "略画法の基本 (太線と細線の使い分け) を覚えたら、次は実際の図面でよく出る場面です。止まり穴のめねじ、ボルトがねじ込まれた組立状態、歯車のかみあい、ばねや歯車の要目表など、部品図・組立図で迷いやすいところを図とともに整理します。",
    body: `
<h2>描き方を一手ずつ</h2>
<div data-widget="anim-threaddraw"></div>
<h2>止まり穴のめねじ</h2>
<p>止まり穴のめねじでは、<b>ねじ部の深さ</b>と<b>下穴の深さ</b>の 2 つを区別します。下穴はねじ部より深くあけ (切りくずの逃げと不完全ねじ部の分)、ドリルの先端形状 (約 118°) は図では<b>120° の円すい</b>で描きます。下穴深さに円すい部は含めません。</p>
<table class="tb-table">
  <tr><th>呼び (並目)</th><th>M3</th><th>M4</th><th>M5</th><th>M6</th><th>M8</th><th>M10</th><th>M12</th></tr>
  <tr><td>ピッチ (mm)</td><td>0.5</td><td>0.7</td><td>0.8</td><td>1</td><td>1.25</td><td>1.5</td><td>1.75</td></tr>
  <tr><td>下穴径の目安 (mm)</td><td>2.5</td><td>3.3</td><td>4.2</td><td>5</td><td>6.8</td><td>8.5</td><td>10.2</td></tr>
</table>
<p>下穴径の目安は「呼び径 − ピッチ」です。指示は「M8 ↧12 / 下穴 φ6.8 ↧16」のように深さ記号 ↧ を使うか、「M8 深さ 12」のように文字で書きます。下穴径はタップメーカーの推奨値や社内標準に従い、図面に書かず工程に任せることもあります。</p>
<h2>ねじが組み合った状態</h2>
<p>組立図でボルトがめねじにねじ込まれている部分は、<b>おねじを優先</b>して描きます。つまり、ねじ込まれた範囲ではおねじの外径 (太線) と谷径 (細線) が見え、めねじはおねじに隠れた部分だけ描きません。断面図でもボルト自体は切断せず外形で描きます。</p>
<svg class="tb-chart" viewBox="0 0 520 220" aria-label="ボルト締結部の断面">
  <defs><clipPath id="tbd2-hatch"><path d="M120,60 L400,60 L400,110 L120,110 Z M120,110 L400,110 L400,180 L120,180 Z"/></clipPath></defs>
  <g clip-path="url(#tbd2-hatch)">
    <path d="M100,200 L240,60 M115,200 L255,60 M130,200 L270,60 M145,200 L285,60 M100,170 L210,60 M100,155 L195,60 M100,140 L180,60" stroke="var(--tb-text-3)" stroke-width="0.8"/>
    <path d="M280,200 L420,60 M295,200 L435,60 M310,200 L450,60 M265,200 L405,60" stroke="var(--tb-text-3)" stroke-width="0.8"/>
  </g>
  <rect x="235" y="40" width="50" height="160" fill="var(--tb-bg)"/>
  <rect x="120" y="60" width="280" height="50" fill="none" stroke="var(--tb-text)" stroke-width="2.4"/>
  <rect x="120" y="110" width="280" height="70" fill="none" stroke="var(--tb-text)" stroke-width="2.4"/>
  <path d="M220,30 L300,30 L300,60 L220,60 Z" fill="none" stroke="var(--tb-text)" stroke-width="2.4"/>
  <path d="M241,60 L241,166 L245,170 L275,170 L279,166 L279,60" fill="none" stroke="var(--tb-text)" stroke-width="2.4"/>
  <line x1="236" y1="60" x2="236" y2="110" stroke="var(--tb-text)" stroke-width="2.4"/><line x1="284" y1="60" x2="284" y2="110" stroke="var(--tb-text)" stroke-width="2.4"/>
  <line x1="245" y1="100" x2="245" y2="170" stroke="var(--tb-text-2)"/><line x1="275" y1="100" x2="275" y2="170" stroke="var(--tb-text-2)"/>
  <line x1="241" y1="100" x2="279" y2="100" stroke="var(--tb-text)" stroke-width="2.4"/>
  <line x1="241" y1="170" x2="241" y2="178" stroke="var(--tb-text-2)"/><line x1="279" y1="170" x2="279" y2="178" stroke="var(--tb-text-2)"/>
  <path d="M245,170 L245,178 M275,170 L275,178" stroke="var(--tb-text)" stroke-width="2.4"/>
  <line x1="260" y1="20" x2="260" y2="195" stroke="var(--tb-accent)" stroke-dasharray="14 3 2 3"/>
  <text class="tick" x="410" y="88">上の部品 (ばか穴)</text>
  <text class="tick" x="410" y="150">下の部品 (めねじ)</text>
  <text class="mark-t" x="20" y="150">ボルトは切断しない</text>
</svg>
<p class="tb-caption">図: ボルト締結部の断面 (模式図)。ボルトは切断せず外形で描き、ねじ込まれた範囲はおねじの線 (外径 = 太線、谷径 = 細線) を優先する。隣接する 2 部品のハッチングは向き・間隔を変える。</p>
<ul>
  <li>ボルトとばか穴 (通し穴) の間にはすき間があるので、穴の輪郭とボルトの外形は別の線として描きます</li>
  <li>めねじの下穴がボルト先端より深い部分は、めねじの描き方 (内径 = 太線、谷径 = 細線) が見えます</li>
  <li>組立図では六角ボルト・ナット・座金は簡略図示でよく、呼び (例: M10×40) は部品表に書きます</li>
</ul>
<h2>歯車のかみあいと要目表</h2>
<p>かみあう一対の歯車を軸方向から見た図では、<b>両方の歯先円を太い実線</b>で描き、ピッチ円 (細い一点鎖線) どうしが接するように配置します。軸を含む断面で描く場合、かみあい部では<b>一方の歯先をかくれ線</b> (細い破線) にします。歯の形そのものは描かず、加工・検査に必要な値は<b>要目表</b>にまとめます。</p>
<table class="tb-table">
  <tr><th colspan="2">平歯車 要目表 (例)</th></tr>
  <tr><td>歯形</td><td>標準 (並歯)</td></tr>
  <tr><td>モジュール</td><td>2</td></tr>
  <tr><td>圧力角</td><td>20°</td></tr>
  <tr><td>歯数</td><td>30</td></tr>
  <tr><td>基準円直径</td><td>60</td></tr>
  <tr><td>転位係数</td><td>0</td></tr>
  <tr><td>歯厚 (またぎ歯厚)</td><td>またぎ歯数と寸法・許容差を記入</td></tr>
  <tr><td>精度</td><td>JIS B 1702-1 の等級</td></tr>
  <tr><td>相手歯車歯数・中心距離</td><td>参考値として記入</td></tr>
</table>
<p>部品図の図形には、歯先円直径 (例: φ64、m(z+2) = 2 × 32) と歯幅、ボスやキー溝の寸法を記入します。ピッチ円直径は要目表に書くのが一般的です。</p>
<h2>ばねの要目表</h2>
<p>コイルばねは無荷重 (自由長) の状態で描き、図には外形の主要寸法だけを入れます。性能は要目表で指定します。</p>
<table class="tb-table">
  <tr><th>項目 (圧縮コイルばね)</th><th>記入例</th></tr>
  <tr><td>材料</td><td>SWP-B (ピアノ線)</td></tr>
  <tr><td>線径 / コイル平均径</td><td>2 / 16</td></tr>
  <tr><td>総巻数 / 有効巻数</td><td>10 / 8</td></tr>
  <tr><td>巻方向</td><td>右</td></tr>
  <tr><td>自由長</td><td>(50)</td></tr>
  <tr><td>指定長さ時の荷重</td><td>長さ 40 のとき 〇〇 N ± 10 %</td></tr>
  <tr><td>端部形状 / 表面処理</td><td>クローズドエンド (研削) / 防錆油</td></tr>
</table>
<div class="tb-tip">ばねは「荷重を保証するか、寸法を保証するか」を決めて、保証しない側は参考値 ( ) にします。全部を厳しい値で指定すると製造できないばねになります。</div>
`,
    points: ["止まり穴はねじ深さと下穴深さを区別、先端は 120° で描く", "下穴径の目安は 呼び径 − ピッチ (M10 → 8.5)", "組み合ったねじはおねじ優先。ボルトは断面でも切断しない", "かみあう歯車は両歯先円を太線、断面では一方の歯先をかくれ線", "歯車・ばねの性能値は要目表にまとめる"],
    exercises: [
      {
        q: "厚さ 30 mm の板に M8 の止まり穴めねじ (有効ねじ深さ 12 mm) を加工します。図面の指示例を書きなさい。",
        a: "M8 並目のピッチは 1.25 なので下穴径の目安は 8 − 1.25 = <b>6.8 mm</b>。下穴はねじ深さより数ピッチ深くし、例えば <b>M8 ↧12 / 下穴 φ6.8 ↧16</b> と指示します。下穴深さ 16 は円すい部を含まない円筒部の深さです。板厚 30 に対して十分残肉があります。",
      },
      {
        q: "モジュール 2、歯数 30 と 45 の標準平歯車がかみあっています。中心距離と各歯先円直径を求めなさい。",
        a: "基準円直径は 2×30 = 60、2×45 = 90。中心距離 = (60 + 90) / 2 = <b>75 mm</b>。歯先円直径は m(z+2) から <b>64 mm</b> と <b>94 mm</b> です。",
      },
    ],
    quiz: [
      { q: "ボルトがねじ込まれた範囲の描き方は?", choices: ["めねじを優先する", "おねじを優先する", "両方を重ねて描く"], answer: 1, explain: "組み合ったねじは、おねじを優先して描きます。" },
      { q: "止まり穴の下穴先端の円すいは図で何度に描く?", choices: ["90°", "120°", "150°"], answer: 1, explain: "ドリル先端角 (約 118°) を図では 120° で描きます。" },
      { q: "歯車の歯数やモジュールを指示する場所は?", choices: ["図形の中に歯を描いて示す", "要目表", "表題欄の材料欄"], answer: 1, explain: "歯形は描かず、要目表にまとめて指示します。" },
    ],
    lessons: ["6-2", "6-3"],
  },
  {
    id: "dimension-applied",
    part: "drafting",
    title: "寸法記入の応用 — 加工基準・キー溝・穴記号の実践",
    minutes: 25,
    level: 2,
    lead: "寸法補助記号を知っているだけでは良い図面にはなりません。どの面を基準に、どの寸法を直接指示し、どれを書かないか — 機能と加工・検査の手順を考えて寸法を選ぶことが応用です。キー溝や段付き穴など典型的な形を題材に、実践的な寸法の入れ方を学びます。",
    body: `
<h2>寸法を選ぶ 3 つの原則</h2>
<ol>
  <li><b>機能寸法を直接指示する</b>: はめあい・位置決め・組立に効く寸法は、計算しなくても読めるように直接書く。他の寸法の足し引きで求める形にしない</li>
  <li><b>加工・検査の基準から入れる</b>: 旋削品なら加工の基準となる端面から、フライス加工品なら基準面 (データム) から寸法を出す</li>
  <li><b>重複させない・閉じない</b>: 同じ寸法を 2 つの図に書かない。直列寸法の輪を閉じず、重要でない 1 区間は書かないか参考寸法 ( ) にする</li>
</ol>
<svg class="tb-chart" viewBox="0 0 520 190" aria-label="段付き軸の寸法の入れ方">
  <path d="M60,70 L160,70 L160,55 L330,55 L330,75 L430,75 L430,125 L330,125 L330,145 L160,145 L160,130 L60,130 Z" fill="none" stroke="var(--tb-text)" stroke-width="2.4"/>
  <line x1="45" y1="100" x2="445" y2="100" stroke="var(--tb-accent)" stroke-dasharray="14 3 2 3"/>
  <line x1="60" y1="135" x2="60" y2="180" stroke="var(--tb-text-2)"/>
  <line x1="160" y1="150" x2="160" y2="165" stroke="var(--tb-text-2)"/><line x1="330" y1="150" x2="330" y2="172" stroke="var(--tb-text-2)"/><line x1="430" y1="130" x2="430" y2="180" stroke="var(--tb-text-2)"/>
  <line x1="60" y1="160" x2="160" y2="160" stroke="var(--tb-text-2)"/><text class="tick" x="110" y="156" text-anchor="middle">40</text>
  <line x1="60" y1="168" x2="330" y2="168" stroke="var(--tb-text-2)"/><text class="tick" x="250" y="165" text-anchor="middle">110</text>
  <line x1="60" y1="177" x2="430" y2="177" stroke="var(--tb-text-2)"/><text class="tick" x="250" y="188" text-anchor="middle">150</text>
  <text class="mark-t" x="60" y="40">基準端面</text><path d="M75,44 L62,66" stroke="var(--tb-text-2)" fill="none"/>
  <text class="tick" x="245" y="48" text-anchor="middle">φ35 h6</text><text class="tick" x="380" y="70" text-anchor="middle">φ25</text><text class="tick" x="110" y="64" text-anchor="middle">φ30</text>
</svg>
<p class="tb-caption">図: 段付き軸を基準端面からの並列寸法で指示した例。各段の位置の公差が累積しない。軸受がはまる φ35 には公差域クラスを直接記入する。</p>
<h2>キー溝の寸法 (平行キー JIS B 1301)</h2>
<p>キー溝の深さは、溝の底から<b>反対側の面までの寸法</b>で指示するのが一般的です。溝の底から中心までや、外周から溝底まで (t₁ そのもの) では、測定しにくく誤差も大きくなるためです。</p>
<table class="tb-table">
  <tr><th>軸径の目安</th><th>キー b × h</th><th>軸の溝深さ t₁</th><th>穴の溝深さ t₂</th></tr>
  <tr><td>17 を超え 22 以下</td><td>6 × 6</td><td>3.5</td><td>2.8</td></tr>
  <tr><td>22 を超え 30 以下</td><td>8 × 7</td><td>4.0</td><td>3.3</td></tr>
  <tr><td>30 を超え 38 以下</td><td>10 × 8</td><td>5.0</td><td>3.3</td></tr>
</table>
<p>例: 軸径 φ25、キー 8 × 7 → 軸側は溝幅 <b>8 N9</b> (普通形)、深さは反対側から <b>25 − 4.0 = 21</b>。穴 (ハブ) 側は溝幅 <b>8 Js9</b>、深さは反対側の穴面から <b>25 + 3.3 = 28.3</b>。軸径との対応は目安なので、伝達トルクに応じてキーの強度を確認します。</p>
<svg class="tb-chart" viewBox="0 0 520 190" aria-label="キー溝の寸法">
  <circle cx="130" cy="100" r="60" fill="none" stroke="var(--tb-text)" stroke-width="2.4"/>
  <rect x="114" y="38" width="32" height="26" fill="var(--tb-bg)" stroke="none"/>
  <path d="M114,41 L114,64 L146,64 L146,41" fill="none" stroke="var(--tb-text)" stroke-width="2.4"/>
  <line x1="60" y1="100" x2="200" y2="100" stroke="var(--tb-accent)" stroke-dasharray="14 3 2 3"/><line x1="130" y1="30" x2="130" y2="170" stroke="var(--tb-accent)" stroke-dasharray="14 3 2 3"/>
  <line x1="146" y1="64" x2="225" y2="64" stroke="var(--tb-text-2)"/><line x1="130" y1="160" x2="225" y2="160" stroke="var(--tb-text-2)"/>
  <line x1="218" y1="64" x2="218" y2="160" stroke="var(--tb-text-2)"/><text class="mark-t" x="224" y="116">21</text>
  <line x1="114" y1="38" x2="114" y2="22" stroke="var(--tb-text-2)"/><line x1="146" y1="38" x2="146" y2="22" stroke="var(--tb-text-2)"/>
  <line x1="114" y1="26" x2="146" y2="26" stroke="var(--tb-text-2)"/><text class="mark-t" x="130" y="18" text-anchor="middle">8 N9</text>
  <circle cx="380" cy="100" r="40" fill="none" stroke="var(--tb-text)" stroke-width="2.4"/>
  <rect x="364" y="52" width="32" height="12" fill="var(--tb-bg)"/>
  <path d="M364,62 L364,52 L396,52 L396,62" fill="none" stroke="var(--tb-text)" stroke-width="2.4"/>
  <line x1="300" y1="100" x2="460" y2="100" stroke="var(--tb-accent)" stroke-dasharray="14 3 2 3"/>
  <line x1="396" y1="52" x2="475" y2="52" stroke="var(--tb-text-2)"/><line x1="380" y1="140" x2="475" y2="140" stroke="var(--tb-text-2)"/>
  <line x1="468" y1="52" x2="468" y2="140" stroke="var(--tb-text-2)"/><text class="mark-t" x="474" y="100">28.3</text>
  <text class="tick" x="130" y="185" text-anchor="middle">軸 φ25 (キー溝)</text><text class="tick" x="380" y="185" text-anchor="middle">穴 φ25 (ハブのキー溝)</text>
</svg>
<p class="tb-caption">図: 平行キー 8 × 7 のキー溝。深さは溝底から反対側の面 (軸の外周・穴の内面) までで指示する。</p>
<h2>穴記号の実践 (JIS B 0001:2010 以降)</h2>
<table class="tb-table">
  <tr><th>記号</th><th>意味</th><th>指示例</th></tr>
  <tr><td>↧</td><td>深さ</td><td>φ8 ↧12 (止まり穴)</td></tr>
  <tr><td>⌴</td><td>ざぐり・深ざぐり</td><td>φ9 キリ ⌴φ14 ↧8.6 (M8 六角穴付きボルト用)</td></tr>
  <tr><td>⌵</td><td>皿ざぐり</td><td>φ6.6 キリ ⌵φ13 (または 皿ざぐり角度を併記)</td></tr>
</table>
<ul>
  <li>同じ穴が複数あるときは個数を前に付けて「4×φ9 キリ ⌴φ14 ↧8.6」と書き、引出線は穴の<b>円が見える図</b>から出します</li>
  <li>「キリ」「リーマ」「打ち抜き」などの加工方法は、必要なときだけ書きます。加工方法を限定するとコストに影響します</li>
  <li>座ぐり (黒皮をわずかに削る程度) は深さを指定しないこともありますが、深ざぐりは必ず深さを指示します</li>
  <li>文字による指示 (「深さ」「ざぐり」) も有効です。社内で記号か文字かを統一しましょう</li>
</ul>
<h2>面取り・角の丸みの細則</h2>
<ul>
  <li><b>C</b> は 45° の面取りだけに使います (C2 = 2 × 45°)。30° などは「2 × 30°」または長さと角度で指示します</li>
  <li>図に描かない小さな面取り・丸みは、「指示なき角は C0.5」「指示なき隅の丸みは R0.5 以下」などの<b>一括注記</b>にまとめます</li>
  <li>エッジの状態をきちんと指定したい場合は JIS B 0051 (部品のエッジの状態) の記号を使う方法もあります</li>
</ul>
<div class="tb-note">寸法の数値は図面の下辺または右辺から読める向きに書き、寸法線の上側 (縦の寸法線では左側) に寄せます。図形の外に出し、外形線と交差させないのが原則です。</div>
`,
    points: ["機能寸法は直接指示、加工基準から入れ、重複・閉ループを避ける", "キー溝の深さは溝底から反対側の面までで指示 (例 φ25 → 21 / 28.3)", "穴は ↧ 深さ、⌴ ざぐり、⌵ 皿ざぐりで簡潔に、引出線は円が見える図から", "C は 45° の面取り専用。小さな面取り・丸みは一括注記"],
    exercises: [
      {
        q: "M8 六角穴付きボルトの頭を沈める穴が 4 か所あります。通し穴 φ9、ざぐり径 φ14、ざぐり深さ 8.6 のとき、指示を書きなさい。",
        a: "<b>4×φ9 キリ ⌴φ14 ↧8.6</b>。引出線は穴の円が見える図 (平面図) から出し、1 か所にまとめて書きます。ざぐり深さはボルト頭の高さ 8 に余裕を持たせた値です。",
      },
      {
        q: "軸径 φ20 に平行キー 6 × 6 を使います。軸側の溝深さ (反対側から) と、ハブ側の溝深さ (反対側の穴面から) を求めなさい。",
        a: "t₁ = 3.5、t₂ = 2.8 なので、軸側 = 20 − 3.5 = <b>16.5</b>、ハブ側 = 20 + 2.8 = <b>22.8</b> です。溝幅は軸側 6 N9、ハブ側 6 Js9 (普通形)。",
      },
    ],
    quiz: [
      { q: "記号 ⌴ の意味は?", choices: ["皿ざぐり", "ざぐり・深ざぐり", "深さ"], answer: 1, explain: "⌴ はざぐり・深ざぐり、⌵ は皿ざぐり、↧ は深さです。" },
      { q: "軸のキー溝の深さの一般的な指示方法は?", choices: ["外周から溝底まで", "溝底から反対側の外周まで", "中心から溝底まで"], answer: 1, explain: "測定しやすい「溝底から反対側の面まで」で指示します。" },
      { q: "30° の面取りを C で指示してよい?", choices: ["よい", "いけない", "C30 と書けばよい"], answer: 1, explain: "C は 45° の面取り専用です。" },
    ],
    lessons: ["6-3", "6-6", "0-6"],
  },
  {
    id: "fit-drawing",
    part: "drafting",
    title: "はめあいと寸法公差の図示 — 表の引き方から積み上げまで",
    minutes: 25,
    level: 3,
    lead: "公差域クラス H7 や g6 は、記号を書くだけでなく、その数値を表から正しく読み、図面に誤解のない形で書く必要があります。ISO 286 (JIS B 0401) の表の引き方、図面への記入形式、組立図での表し方、そして図面上での公差の積み上げの確認方法までを扱います。",
    body: `
<h2>公差域クラスの読み方</h2>
<p>公差域クラスは<b>基礎となる寸法許容差 (英字)</b>と<b>公差等級 (数字)</b>の組合せです。英大文字は穴、英小文字は軸。英字は公差域の位置を、数字は公差の大きさ (IT 等級) を表します。</p>
<table class="tb-table">
  <tr><th>基準寸法の区分 (mm)</th><th>IT6 (μm)</th><th>IT7 (μm)</th><th>IT8 (μm)</th></tr>
  <tr><td>10 を超え 18 以下</td><td>11</td><td>18</td><td>27</td></tr>
  <tr><td>18 を超え 30 以下</td><td>13</td><td>21</td><td>33</td></tr>
  <tr><td>30 を超え 50 以下</td><td>16</td><td>25</td><td>39</td></tr>
</table>
<p>穴の H は下の寸法許容差が 0、軸の h は上の寸法許容差が 0 です。H7 の φ20 なら 0 〜 +0.021、h6 の φ20 なら −0.013 〜 0 になります。そのほかの英字は表から位置を読みます。</p>
<table class="tb-table">
  <tr><th>φ20 (18〜30 の区分)</th><th>上の許容差</th><th>下の許容差</th><th>H7 穴との組合せ</th></tr>
  <tr><td>H7 (穴)</td><td>+0.021</td><td>0</td><td>—</td></tr>
  <tr><td>g6</td><td>−0.007</td><td>−0.020</td><td>すきまばめ (しゅう動)</td></tr>
  <tr><td>h6</td><td>0</td><td>−0.013</td><td>すきまばめ (すきま最小 0)</td></tr>
  <tr><td>js6</td><td>+0.0065</td><td>−0.0065</td><td>中間ばめ</td></tr>
  <tr><td>k6</td><td>+0.015</td><td>+0.002</td><td>中間ばめ</td></tr>
  <tr><td>m6</td><td>+0.021</td><td>+0.008</td><td>中間ばめ</td></tr>
  <tr><td>n6</td><td>+0.028</td><td>+0.015</td><td>中間ばめ (しまりばめ寄り)</td></tr>
  <tr><td>p6</td><td>+0.035</td><td>+0.022</td><td>しまりばめ</td></tr>
</table>
<div data-widget="fit"></div>
<h2>図面への記入形式</h2>
<p>部品図では次のいずれかで記入します。現場が表を引かずに読めるよう、公差域クラスに数値を<b>括弧で併記</b>する書き方がよく使われます。</p>
<svg class="tb-chart" viewBox="0 0 520 150" aria-label="寸法公差の記入形式">
  <text class="mark-t" x="30" y="40">① 公差域クラスのみ</text><text class="lbl" x="250" y="40" font-size="16">φ20 H7</text>
  <text class="mark-t" x="30" y="80">② クラス + 数値を併記</text><text class="lbl" x="250" y="80" font-size="16">φ20 H7 (</text><text class="tick" x="330" y="72">+0.021</text><text class="tick" x="330" y="86">0</text><text class="lbl" x="372" y="80" font-size="16">)</text>
  <text class="mark-t" x="30" y="125">③ 寸法許容差のみ</text><text class="lbl" x="250" y="125" font-size="16">φ20</text><text class="tick" x="288" y="117">+0.021</text><text class="tick" x="288" y="131">0</text>
</svg>
<p class="tb-caption">図: 部品図での 3 つの記入形式。上の許容差を上段、下の許容差を下段に書き、0 の側は「0」とだけ書く (符号を付けない)。</p>
<ul>
  <li>上下の許容差が同じ大きさなら「20 ± 0.1」のようにまとめます</li>
  <li>許容差の数字の桁 (小数点以下の桁数) は上下でそろえるのが通例です (例: +0.10 / −0.05)</li>
  <li>最大・最小で「φ20.021 / φ20.000」と書く方法 (許容限界寸法) もあります</li>
  <li><b>組立図</b>では穴と軸を並べて「φ20 H7/g6」または「φ20 H7-g6」と書きます</li>
</ul>
<h2>はめあいの選び方の目安</h2>
<table class="tb-table">
  <tr><th>用途</th><th>穴基準での例</th></tr>
  <tr><td>すべり軸受・しゅう動部 (よく動く)</td><td>H7/f7、H7/g6</td></tr>
  <tr><td>位置決めピン・手で組み外しする部品</td><td>H7/h6、H7/js6</td></tr>
  <tr><td>キー併用で回り止めする歯車・プーリ</td><td>H7/js6、H7/k6</td></tr>
  <tr><td>圧入して動かない (ブッシュ・ピン)</td><td>H7/p6 など (締め代と材質を確認)</td></tr>
  <tr><td>転がり軸受</td><td>軸受メーカーの推奨 (内輪回転荷重なら軸 k5〜m6、ハウジング H7 など)</td></tr>
</table>
<div class="tb-note">原則は<b>穴基準</b>です。穴はリーマ・ボーリングなど工具で寸法が決まるため、穴を H に固定し、軸 (外径の加工・測定が容易) の公差を変えてはめあいを作るほうが工具と検査具の種類を減らせます。</div>
<h2>図面上での積み上げチェック</h2>
<p>組立後のすき間などは、関係する寸法をループでたどって確認します。最悪値 (ワーストケース) は公差の単純和、統計的な見積もり (RSS) は二乗和の平方根です。</p>
<svg class="tb-chart" viewBox="0 0 520 170" aria-label="寸法の積み上げループ">
  <rect x="40" y="40" width="440" height="80" fill="none" stroke="var(--tb-text)" stroke-width="2.4"/>
  <rect x="50" y="55" width="120" height="50" class="sec"/><rect x="170" y="55" width="120" height="50" class="sec"/><rect x="290" y="55" width="160" height="50" class="sec"/>
  <text class="tick" x="110" y="85" text-anchor="middle">A 30±0.1</text><text class="tick" x="230" y="85" text-anchor="middle">B 30±0.1</text><text class="tick" x="370" y="85" text-anchor="middle">C 40±0.15</text>
  <line x1="40" y1="140" x2="480" y2="140" stroke="var(--tb-text-2)"/><text class="tick" x="260" y="158" text-anchor="middle">ハウジング内のり L = 110 +0.2 / 0</text>
  <text class="mark-t" x="465" y="32" text-anchor="end">すき間 G = L − (A + B + C)</text>
</svg>
<p class="tb-caption">図: 3 部品をハウジングに並べたときのすき間。図面に書いた寸法と公差だけで、組立後のすき間の範囲が決まる。</p>
<p>上の例では、G の公称値 = 110 − 100 = 0 に対し、ワーストケースで G の最大 = 110.2 − 99.65 = 0.55、最小 = 110 − 100.35 = −0.35 となり、<b>干渉する可能性</b>があります。L の基準寸法を大きくするか、部品の公差を小さくするか、どこか 1 か所 (例: C) を現物合わせ・調整部品にして解決します。</p>
`,
    points: ["公差域クラス = 英字 (位置) + 数字 (IT 等級)。大文字は穴、小文字は軸", "φ20 H7 = 0〜+0.021、g6 = −0.007〜−0.020", "部品図はクラスに数値を併記すると読み違いが減る。組立図は H7/g6", "原則は穴基準。転がり軸受はメーカー推奨に従う", "組立後のすき間は寸法ループで最悪値と RSS を確認"],
    exercises: [
      {
        q: "φ20 H7/g6 のはめあいの最大すきまと最小すきまを求めなさい。",
        a: "穴 20.000〜20.021、軸 19.980〜19.993。最大すきま = 20.021 − 19.980 = <b>0.041 mm</b>、最小すきま = 20.000 − 19.993 = <b>0.007 mm</b>。常にすきまがあるすきまばめです。",
      },
      {
        q: "本文の積み上げ例を RSS で見積もると、すき間 G の公差幅はおよそいくらですか? (各公差を ± の片側で扱い、L は ±0.1 として中央値 110.1 で考える)",
        a: "片側公差は L 0.1、A 0.1、B 0.1、C 0.15。RSS = √(0.1² + 0.1² + 0.1² + 0.15²) = √0.0525 ≈ <b>±0.23</b>。G の中央値は 110.1 − 100 = 0.1 なので、G ≈ 0.1 ± 0.23 → −0.13〜0.33 となり、統計的に見ても干渉の可能性が残ります。",
      },
    ],
    quiz: [
      { q: "φ20 h6 の寸法許容差は?", choices: ["0 / −0.013", "+0.013 / 0", "±0.0065"], answer: 0, explain: "h は上の許容差が 0。IT6 (18〜30) は 13 μm なので 0 / −0.013 です。" },
      { q: "組立図ではめあいを示す書き方は?", choices: ["φ20 H7/g6", "φ20 ±H7g6", "φ20 (H7)(g6) を別々の図に"], answer: 0, explain: "穴の公差域クラスを先に、軸を後に「H7/g6」と書きます。" },
      { q: "H7 穴と組み合わせてしまりばめになる軸は?", choices: ["g6", "js6", "p6"], answer: 2, explain: "p6 (φ20 で +0.022〜+0.035) は H7 の上限 +0.021 より常に大きく、しまりばめです。" },
    ],
    lessons: ["6-3", "6-4"],
  },
  {
    id: "fabrication-drawings",
    part: "drafting",
    title: "板金・溶接構造物・樹脂部品の図面 — 工法に合わせた描き方",
    minutes: 25,
    level: 2,
    lead: "削り出し部品の図面と同じ書き方を板金や樹脂成形品にそのまま当てはめると、作れない・測れない図面になりがちです。工法ごとに図面で指示すべきこと、指示してはいけないことが違います。板金の展開と曲げ、溶接構造物の部材と溶接後加工、樹脂成形品の抜き勾配やパーティングラインの指示を学びます。",
    body: `
<h2>板金部品の図面</h2>
<ul>
  <li><b>板厚 t と材料</b>を必ず書きます (例: SPCC t1.6)。板厚は図形ではなく注記で示すと図が 1 つで済みます</li>
  <li><b>曲げの内 R</b>: 曲げ部の内側の半径を指示。特に必要がなければ「指示なき曲げ R は板厚程度」などの一括注記にします</li>
  <li><b>寸法は外側か内側かを統一</b>: 板金は曲げで寸法がばらつくため、機能上重要な面 (相手部品と当たる面) から寸法を入れます</li>
  <li><b>展開図</b>: 必要なら図の上に「展開図」と書いて描きます。曲げ線は細い実線で示し、曲げ方向 (山・谷) を注記することが多いですが、表し方は社内規定に従います。展開寸法は板金加工側が自社の曲げ条件で決めることも多く、その場合は製品形状だけを指示します</li>
  <li><b>穴と曲げ線の距離</b>: 曲げ線に近い穴は曲げで変形します。目安として板厚の 2 倍 + 曲げ R 程度以上離すか、曲げ後に加工する指示を入れます</li>
</ul>
<svg class="tb-chart" viewBox="0 0 520 200" aria-label="板金部品の正面図と展開図">
  <path d="M40,150 L40,60 L46,54 L150,54 L150,60 L52,60 L52,150 Z" fill="none" stroke="var(--tb-text)" stroke-width="2.4"/>
  <text class="lbl" x="90" y="30" text-anchor="middle">L 曲げ (正面図)</text>
  <text class="tick" x="60" y="110">t1.6</text>
  <line x1="40" y1="165" x2="40" y2="180" stroke="var(--tb-text-2)"/><line x1="150" y1="40" x2="150" y2="50" stroke="var(--tb-text-2)"/>
  <text class="tick" x="80" y="185">外側基準で寸法</text>
  <text class="lbl" x="350" y="30" text-anchor="middle">展開図</text>
  <rect x="230" y="50" width="240" height="110" fill="none" stroke="var(--tb-text)" stroke-width="2.4"/>
  <line x1="320" y1="50" x2="320" y2="160" stroke="var(--tb-text-2)"/>
  <text class="tick" x="326" y="66">曲げ線 (谷 90°)</text>
  <circle cx="400" cy="105" r="8" fill="none" stroke="var(--tb-text)" stroke-width="2"/>
  <circle cx="270" cy="105" r="6" fill="none" stroke="var(--tb-text)" stroke-width="2"/>
  <text class="tick" x="350" y="185" text-anchor="middle">展開寸法は曲げ条件 (K 値など) に依存</text>
</svg>
<p class="tb-caption">図: L 曲げ板金。製品図では曲げ後の形状と内 R・板厚を指示し、展開図を描く場合は曲げ線と曲げ方向を示す。</p>
<h2>溶接構造物の図面</h2>
<ul>
  <li>部材ごとに<b>照合番号</b>を付け、部品表に材料・寸法 (形鋼なら呼び) ・数量を書きます。小さな溶接構造物は一枚の図面で部材と溶接を同時に指示するのが一般的です</li>
  <li>溶接は<b>溶接記号</b> (JIS Z 3021) で指示します。全周溶接や現場溶接の補助記号も忘れずに</li>
  <li><b>溶接後に機械加工する面</b>は、仕上げ代を見込んだ素材寸法か、加工後寸法かを明確にし、「溶接後加工」と注記します</li>
  <li>溶接ひずみを取るための<b>焼なまし</b> (応力除去) や、矯正の要否も注記で指示します</li>
  <li>寸法公差は、溶接したままの部分には普通公差 (溶接構造物用の JIS B 0417 など) を、加工面には機械加工の公差を当てはめます</li>
</ul>
<svg class="tb-chart" viewBox="0 0 520 190" aria-label="溶接構造物の例">
  <rect x="80" y="130" width="260" height="20" fill="none" stroke="var(--tb-text)" stroke-width="2.4"/>
  <rect x="190" y="40" width="20" height="90" fill="none" stroke="var(--tb-text)" stroke-width="2.4"/>
  <path d="M210,130 L222,130 L210,118 Z" fill="var(--tb-text-2)"/>
  <path d="M190,130 L178,130 L190,118 Z" fill="var(--tb-text-2)"/>
  <circle cx="110" cy="80" r="12" fill="none" stroke="var(--tb-text-2)"/><text class="mark-t" x="110" y="85" text-anchor="middle">1</text><line x1="118" y1="90" x2="140" y2="135" stroke="var(--tb-text-2)"/>
  <circle cx="270" cy="60" r="12" fill="none" stroke="var(--tb-text-2)"/><text class="mark-t" x="270" y="65" text-anchor="middle">2</text><line x1="260" y1="68" x2="208" y2="80" stroke="var(--tb-text-2)"/>
  <line x1="224" y1="126" x2="300" y2="100" stroke="var(--tb-text-2)"/><line x1="300" y1="100" x2="380" y2="100" stroke="var(--tb-text-2)"/>
  <path d="M325,100 L325,90 L335,100" fill="none" stroke="var(--tb-text)" stroke-width="1.5"/><path d="M325,100 L325,110 L335,100" fill="none" stroke="var(--tb-text)" stroke-width="1.5"/>
  <text class="tick" x="340" y="95">5</text><text class="tick" x="340" y="115">5</text>
  <line x1="80" y1="155" x2="340" y2="155" stroke="var(--tb-text)" stroke-width="2.4" stroke-dasharray="14 3 2 3"/>
  <text class="tick" x="400" y="160">底面: 溶接後加工</text>
</svg>
<p class="tb-caption">図: ベース板 (1) とリブ (2) の両側すみ肉溶接 (脚長 5)。底面は溶接ひずみを取るため溶接後に機械加工する。</p>
<h2>樹脂成形品の図面</h2>
<table class="tb-table">
  <tr><th>項目</th><th>図面での指示例</th></tr>
  <tr><td>材料</td><td>樹脂名・グレード・色 (例: PC/ABS グレード名、色番号)。代替品の可否</td></tr>
  <tr><td>抜き勾配</td><td>「指示なき抜き勾配 1°」など一括注記。勾配をどちら側に付けるか (寸法の基準が根元か先端か) を明示</td></tr>
  <tr><td>パーティングライン (PL)</td><td>位置を想像線などで示し「PL」と記入。外観上許されるバリの量を注記</td></tr>
  <tr><td>ゲート・エジェクタピン</td><td>位置の指定または「外観面に設けないこと」などの禁止範囲</td></tr>
  <tr><td>外観面</td><td>シボ (テクスチャ) の番号、ひけ・ウェルドを許さない面の指定</td></tr>
  <tr><td>寸法公差</td><td>成形収縮のばらつきを考え、金属加工より緩い公差を。重要寸法を絞り込む</td></tr>
</table>
<div class="tb-tip">成形収縮率は図面に書かず、金型メーカーが材料に合わせて金型寸法に織り込むのが一般的です。図面は「成形品の寸法」を指示するものだと覚えておきましょう。</div>
<div class="tb-note">肉厚が均一でないと、ひけ・そり・ボイドが出ます。図面を描く前のモデリング段階で、肉厚・抜き勾配・リブの厚さ (一般に一般肉厚の 50〜60 % 程度) を検討しておくのが基本です。</div>
`,
    points: ["板金は材料と板厚 t、曲げ内 R、寸法基準 (外側/内側) を明確に", "展開寸法は曲げ条件に依存。製品形状だけ指示して加工側に任せる方法もある", "溶接構造物は照合番号・部品表・溶接記号、溶接後加工と応力除去を注記", "樹脂成形品は材料グレード、抜き勾配、PL、ゲート・エジェクタ位置、外観面を指示", "成形収縮率は図面ではなく金型側で織り込む"],
    exercises: [
      {
        q: "t2 の板金で、曲げ線から 2 mm の位置に φ5 の穴があります。どんな問題が起きますか? どう対策しますか?",
        a: "曲げ線に近すぎるため、曲げ加工で穴が<b>楕円に変形</b>したり穴縁が引っ張られたりします。対策は (1) 穴を曲げ線から板厚の 2 倍 + 曲げ R 程度以上離す、(2) 穴を長穴やにげの切欠きにする、(3)「曲げ後穴あけ」と指示する、のいずれかです。",
      },
      {
        q: "樹脂のケースで、相手部品が入る内側の幅 50 が機能上重要です。抜き勾配 1° がある場合、図面でどう指示しますか?",
        a: "内幅は根元と開口部で寸法が変わるので、<b>どの位置での寸法か</b>を指定します。例えば「開口部 (先端) で 50 +0.2/0」と寸法の位置を明示し、勾配はその寸法を基準に<b>内側が狭くなる方向</b>に付けると注記します。相手部品が入る位置での寸法を保証するのが要点です。",
      },
    ],
    quiz: [
      { q: "樹脂成形品の成形収縮率は通常どこで考慮する?", choices: ["図面の寸法を収縮分大きく書く", "金型メーカーが金型寸法に織り込む", "考慮しない"], answer: 1, explain: "図面は成形品の寸法を指示し、収縮は金型側で織り込むのが一般的です。" },
      { q: "溶接後に機械加工する面の注記で重要なことは?", choices: ["溶接記号を省略する", "加工後寸法か素材寸法かを明確にする", "普通公差を適用する"], answer: 1, explain: "仕上げ代を見込んだ素材寸法か、加工後寸法かをはっきりさせます。" },
      { q: "板金部品の板厚を示す簡潔な方法は?", choices: ["側面図を追加する", "t の記号で注記する", "断面図を描く"], answer: 1, explain: "「t1.6」などと注記すれば図を追加せずに済みます。" },
    ],
    lessons: ["6-1", "6-5"],
  },
  {
    id: "assembly-bom",
    part: "drafting",
    title: "組立図・部品表・図番体系 — 図面を束ねて管理する",
    minutes: 20,
    level: 2,
    lead: "製品は何十枚・何百枚もの図面で成り立っています。それらを組立図と部品表で束ね、図番と改訂で管理する仕組みがないと、誤った版の部品が作られる事故が起きます。照合番号の付け方、部品表の項目、図番の付け方、改訂 (訂正・変更) の記録方法を学びます。",
    body: `
<h2>組立図の役割と描き方</h2>
<ul>
  <li>組立図は<b>部品の位置関係と組立の要領</b>を示します。部品の詳細形状は部品図に任せ、組立に必要な寸法 (全体寸法、取付寸法、調整寸法、はめあい) だけを記入します</li>
  <li>断面図を多用して内部の組み合わせを見せます。ボルト・軸・キーなどは長手方向に切断しません</li>
  <li>可動部の動く範囲や相手装置は<b>細い二点鎖線 (想像線)</b> で示します</li>
  <li>締付けトルク、グリース封入、接着剤などの組立条件は注記にまとめます</li>
</ul>
<h2>照合番号 (バルーン)</h2>
<svg class="tb-chart" viewBox="0 0 520 210" aria-label="照合番号の付け方">
  <rect x="80" y="70" width="220" height="70" fill="none" stroke="var(--tb-text)" stroke-width="2.4"/>
  <rect x="150" y="40" width="80" height="30" fill="none" stroke="var(--tb-text)" stroke-width="2.4"/>
  <rect x="180" y="140" width="20" height="40" fill="none" stroke="var(--tb-text)" stroke-width="2.4"/>
  <circle cx="120" cy="110" r="3" fill="var(--tb-text)"/><line x1="120" y1="110" x2="370" y2="60" stroke="var(--tb-text-2)"/>
  <circle cx="190" cy="55" r="3" fill="var(--tb-text)"/><line x1="190" y1="55" x2="370" y2="30" stroke="var(--tb-text-2)"/>
  <circle cx="190" cy="165" r="3" fill="var(--tb-text)"/><line x1="190" y1="165" x2="370" y2="90" stroke="var(--tb-text-2)"/>
  <circle cx="385" cy="30" r="13" fill="none" stroke="var(--tb-text)" stroke-width="1.5"/><text class="mark-t" x="385" y="35" text-anchor="middle">1</text>
  <circle cx="385" cy="60" r="13" fill="none" stroke="var(--tb-text)" stroke-width="1.5"/><text class="mark-t" x="385" y="65" text-anchor="middle">2</text>
  <circle cx="385" cy="90" r="13" fill="none" stroke="var(--tb-text)" stroke-width="1.5"/><text class="mark-t" x="385" y="95" text-anchor="middle">3</text>
  <text class="tick" x="410" y="64">縦一列にそろえる</text>
  <text class="tick" x="80" y="200">引出線の部品側は黒丸 (外形線上なら矢印)</text>
</svg>
<p class="tb-caption">図: 照合番号は円の中に番号を書き、引出線を部品へ。番号は縦または横に整列させ、引出線どうしは交差させない。</p>
<ul>
  <li>円の直径は 10〜16 mm 程度。同じ図面内では大きさをそろえます</li>
  <li>引出線は部品の内側から黒丸で、外形線を指すときは矢印で引き出します。寸法線や他の引出線と交差しないようにし、水平・垂直を避けて斜めに引くと見分けやすくなります</li>
  <li>番号の順は組立順、または大きい部品から。同じ部品が複数あっても番号は 1 つで、個数は部品表に書きます</li>
</ul>
<h2>部品表 (BOM)</h2>
<table class="tb-table">
  <tr><th>照合番号</th><th>品名</th><th>図番 / 規格</th><th>材料</th><th>個数</th><th>備考</th></tr>
  <tr><td>3</td><td>六角穴付きボルト</td><td>JIS B 1176 M6×20</td><td>SCM435</td><td>4</td><td>強度区分 12.9</td></tr>
  <tr><td>2</td><td>カバー</td><td>A-1002-02</td><td>A5052</td><td>1</td><td>白アルマイト</td></tr>
  <tr><td>1</td><td>ベース</td><td>A-1002-01</td><td>S45C</td><td>1</td><td></td></tr>
</table>
<p>部品表を表題欄の上に付ける場合は、<b>下から上へ</b>番号順に書くと後から行を追加しやすくなります。別紙の部品表にする場合は上から下へ書きます。購入品は品名・規格・メーカー型式を正確に書き、社内の品目コードと一致させます。</p>
<h2>図番体系</h2>
<table class="tb-table">
  <tr><th>方式</th><th>例</th><th>長所 / 短所</th></tr>
  <tr><td>有意番号 (意味を持たせる)</td><td>A-1002-01 = 用紙/製品番号/部品番号</td><td>番号から所属がわかる / 体系変更や流用に弱い</td></tr>
  <tr><td>無意番号 (連番)</td><td>100231</td><td>流用・管理が簡単、桁があふれにくい / 番号だけでは中身がわからない</td></tr>
</table>
<p>最近は PDM/PLM で属性 (製品・種類) を管理し、図番自体は無意番号とする企業も増えています。どちらの場合も「<b>1 つの形状に 1 つの図番</b>」、形状が変わって互換性がなくなったら新しい図番 (または枝番) を取るのが原則です。</p>
<h2>改訂 (訂正・変更) の記録</h2>
<ol>
  <li>変更した箇所の近くに<b>改訂記号</b> (三角形の中に記号 Δ1, ΔA など) を付ける</li>
  <li>変更前の寸法・形状は、読めるように<b>二重線などで消して</b>残すか、改訂欄に旧値を記録する</li>
  <li><b>改訂欄</b> (表題欄の近く) に、記号・日付・変更内容・理由・担当者・承認者を書く</li>
  <li>図番の末尾などで<b>版数</b>を上げ、旧版の図面を回収・無効化する</li>
</ol>
<svg class="tb-chart" viewBox="0 0 520 130" aria-label="改訂欄の例">
  <rect x="30" y="20" width="460" height="90" fill="none" stroke="var(--tb-text)" stroke-width="1.5"/>
  <line x1="30" y1="45" x2="490" y2="45" stroke="var(--tb-text-2)"/><line x1="30" y1="78" x2="490" y2="78" stroke="var(--tb-text-2)"/>
  <line x1="80" y1="20" x2="80" y2="110" stroke="var(--tb-text-2)"/><line x1="170" y1="20" x2="170" y2="110" stroke="var(--tb-text-2)"/><line x1="410" y1="20" x2="410" y2="110" stroke="var(--tb-text-2)"/>
  <text class="lbl" x="40" y="37">記号</text><text class="lbl" x="95" y="37">日付</text><text class="lbl" x="180" y="37">内容</text><text class="lbl" x="420" y="37">承認</text>
  <path d="M55,52 L66,70 L44,70 Z" fill="none" stroke="var(--tb-accent)" stroke-width="1.5"/><text class="tick" x="52" y="68">1</text>
  <text class="tick" x="88" y="66">2026-05-10</text><text class="tick" x="180" y="66">穴位置 40 → 42 (相手部品変更のため)</text><text class="tick" x="420" y="66">山田</text>
  <path d="M55,85 L66,103 L44,103 Z" fill="none" stroke="var(--tb-accent)" stroke-width="1.5"/><text class="tick" x="52" y="101">2</text>
  <text class="tick" x="88" y="99">2026-08-02</text><text class="tick" x="180" y="99">表面処理 追加</text><text class="tick" x="420" y="99">佐藤</text>
</svg>
<p class="tb-caption">図: 改訂欄の例。図中の変更箇所にも同じ改訂記号を付けて、どこが変わったかを追跡できるようにする。</p>
<div class="tb-tip">互換性のある変更 (公差を広げるなど) は版数を上げるだけでよいことが多いですが、互換性がない変更 (取付穴の位置変更など) を同じ図番のまま行うと、在庫部品と新部品が混ざって組めなくなります。変更の前に「互換性はあるか」を必ず判断しましょう。</div>
`,
    points: ["組立図には組立に必要な寸法・はめあい・組立条件だけを記入", "照合番号は整列させ、引出線は交差させない。個数は部品表に", "表題欄上の部品表は下から上へ番号順", "1 形状 1 図番。互換性がなくなる変更は新図番", "改訂は記号・旧値・改訂欄・版数でたどれるように"],
    exercises: [
      {
        q: "ブラケットの取付穴ピッチを 40 から 42 に変更します。既に在庫が 200 個あります。図面上でどう処理しますか?",
        a: "相手部品と組めなくなる<b>互換性のない変更</b>なので、原則として<b>新しい図番 (または枝番)</b> を取ります。同じ図番で版を上げるだけにすると、旧在庫と新部品が区別できず誤組付けが起きます。改訂欄に理由を記録し、旧図番の部品の処置 (使い切り・廃却・追加工) を関係部署と決めます。",
      },
      {
        q: "組立図に同じ M6 ボルトが 8 本あります。照合番号と部品表はどう書きますか?",
        a: "照合番号は<b>1 つだけ</b> (代表の 1 本に引出線) で、部品表の個数欄に <b>8</b> と書きます。規格欄には「JIS B 1176 M6×20」のように呼びと長さを、材料・強度区分も記入します。",
      },
    ],
    quiz: [
      { q: "表題欄の上に付けた部品表の番号の並べ方は?", choices: ["上から下へ", "下から上へ", "順不同"], answer: 1, explain: "下から上へ書くと、行を追加しても表題欄にぶつかりません。" },
      { q: "組立図で可動部の動く範囲を示す線は?", choices: ["細い破線", "細い二点鎖線", "太い一点鎖線"], answer: 1, explain: "想像線 (細い二点鎖線) で示します。" },
      { q: "変更前の寸法の扱いとして適切なのは?", choices: ["完全に消して新しい値だけ書く", "読めるように消して残すか改訂欄に記録する", "変更しない"], answer: 1, explain: "旧値を読める形で残すか記録し、変更の履歴をたどれるようにします。" },
    ],
    lessons: ["6-7", "6-1"],
  },
  {
    id: "drawing-check",
    part: "drafting",
    title: "検図 — チェックリストと間違い探し",
    minutes: 25,
    level: 3,
    lead: "図面の誤りは、加工や組立の段階で見つかるほど手戻りのコストが大きくなります。検図は描いた本人以外の目で図面を確認し、誤りを出図前に取り除く工程です。検図の進め方、項目別のチェックリスト、よくある誤りを整理し、最後に間違い探しで実践します。",
    body: `
<h2>検図の進め方</h2>
<ol class="tb-flow">
  <li><b>自己検図</b>: 描いた人がチェックリストで確認</li>
  <li><b>検図</b>: 検図者が観点別に確認</li>
  <li><b>修正・再確認</b>: 指摘を直し、直した箇所を再確認</li>
  <li><b>承認・出図</b>: 承認者のサインを経て出図</li>
</ol>
<ul>
  <li><b>一度に全部を見ない</b>: 「形状」「寸法」「公差・表面性状」「注記・表題欄」のように観点を分けて、何周かに分けて見ます</li>
  <li><b>色ペンで印を付ける</b>: 確認した寸法に印を付けながら進めると、見落とした寸法が残らない (紙でも PDF の注釈でも可)</li>
  <li><b>モデルや相手部品と突き合わせる</b>: 図面単体ではなく、組立図・相手部品の図面・3D モデルと照合します</li>
  <li><b>加工者・検査者の立場で読む</b>: 「この寸法は何で測るか」「どの面を基準にくわえるか」を考えると、指示の不足に気づきます</li>
</ul>
<h2>チェックリスト</h2>
<table class="tb-table">
  <tr><th>観点</th><th>確認項目</th></tr>
  <tr><td>形状・投影</td><td>投影法の記号と図の配置が合っているか / 必要な図・断面図がそろっているか / 外形線・かくれ線・中心線の抜け</td></tr>
  <tr><td>寸法</td><td>形を決める寸法の過不足 (計算しないと出ない寸法がないか、重複がないか) / 機能寸法を直接指示しているか / 寸法数値と図形の一致</td></tr>
  <tr><td>公差</td><td>はめあい部に公差があるか / 公差が厳しすぎないか / 普通公差の等級を表題欄などに指示しているか / データムの指定</td></tr>
  <tr><td>表面性状</td><td>しゅう動面・シール面の指示 / 一括指示と個別指示の整合</td></tr>
  <tr><td>穴・ねじ</td><td>呼び・深さ・個数 / 相手部品と穴位置・ピッチが合っているか / 下穴深さの残肉</td></tr>
  <tr><td>材料・処理</td><td>材料記号 / 熱処理・表面処理とその範囲 / 処理後の寸法か処理前か</td></tr>
  <tr><td>表題欄・管理</td><td>図番・図名・尺度・版数 / 部品表の個数と照合番号 / 改訂欄の記入</td></tr>
  <tr><td>製造性</td><td>工具が入るか (内角の R、深い溝) / 測定できるか / 標準の工具・ねじ・穴径を使っているか</td></tr>
</table>
<h2>よくある誤り</h2>
<ul>
  <li>寸法の<b>二重記入</b> (正面図と側面図の両方に同じ寸法) — 修正時に片方だけ直して矛盾する</li>
  <li><b>寸法の閉ループ</b> — 直列寸法と全長がすべて書かれていて、どれを守るかわからない</li>
  <li><b>公差の付け忘れ</b> — 軸受やピンのはめあい部が普通公差のまま</li>
  <li><b>過剰な公差</b> — 機能に関係ない面まで ±0.01 にしてコストが上がる</li>
  <li><b>相手部品との不一致</b> — 穴ピッチ、ねじの呼び、面取りと隅 R の干渉 (相手の C より自分の R が大きい)</li>
  <li><b>加工できない形状</b> — エンドミルで削る内側の角が R0 (ピン角) になっている</li>
  <li><b>CAD の自動寸法の丸め</b> — 表示桁の設定で 12.45 が 12.5 と表示されている</li>
  <li><b>古い版の流用</b> — 流用元の図番・注記・材料が残ったまま</li>
</ul>
<h2>間違い探し</h2>
<p>次の部品図 (第三角法、普通公差 JIS B 0405-m を表題欄で指示済み) には、意図的に誤りを 5 つ入れてあります。番号の位置に注目して、何がいけないかを考えてみましょう。</p>
<svg class="tb-chart" viewBox="0 0 520 260" aria-label="誤りを含む部品図">
  <rect x="60" y="120" width="200" height="80" fill="none" stroke="var(--tb-text)" stroke-width="2.4"/>
  <line x1="110" y1="120" x2="110" y2="200" stroke="var(--tb-text-2)" stroke-dasharray="6 3"/><line x1="130" y1="120" x2="130" y2="200" stroke="var(--tb-text-2)" stroke-dasharray="6 3"/>
  <line x1="60" y1="215" x2="260" y2="215" stroke="var(--tb-text-2)"/><text class="tick" x="160" y="230" text-anchor="middle">100</text>
  <line x1="60" y1="240" x2="120" y2="240" stroke="var(--tb-text-2)"/><text class="tick" x="90" y="252" text-anchor="middle">30</text>
  <line x1="120" y1="240" x2="260" y2="240" stroke="var(--tb-text-2)"/><text class="tick" x="190" y="252" text-anchor="middle">70</text>
  <line x1="270" y1="120" x2="270" y2="200" stroke="var(--tb-text-2)"/><text class="tick" x="276" y="164">40</text>
  <rect x="60" y="20" width="200" height="60" fill="none" stroke="var(--tb-text)" stroke-width="2.4"/>
  <circle cx="120" cy="50" r="10" fill="none" stroke="var(--tb-text)" stroke-width="2"/>
  <line x1="128" y1="44" x2="170" y2="10" stroke="var(--tb-text-2)"/><text class="tick" x="172" y="14">φ20 (軸受 6204 外輪がはまる)</text>
  <line x1="268" y1="20" x2="268" y2="80" stroke="var(--tb-text-2)"/><text class="tick" x="274" y="54">60</text>
  <rect x="330" y="120" width="60" height="80" fill="none" stroke="var(--tb-text)" stroke-width="2.4"/>
  <line x1="400" y1="120" x2="400" y2="200" stroke="var(--tb-text-2)"/><text class="tick" x="406" y="164">40</text>
  <text class="tick" x="330" y="230">材料: (前の図面のまま)</text>
  <text class="tick" x="330" y="250">指示なき角 C0.5 / 全面 ±0.01</text>
  <circle cx="155" cy="232" r="9" fill="none" stroke="var(--tb-bad)" stroke-width="1.5"/><text class="mark-t" x="155" y="236" text-anchor="middle" fill="var(--tb-bad)">1</text>
  <circle cx="100" cy="35" r="9" fill="none" stroke="var(--tb-bad)" stroke-width="1.5"/><text class="mark-t" x="100" y="39" text-anchor="middle">2</text>
  <circle cx="420" cy="164" r="9" fill="none" stroke="var(--tb-bad)" stroke-width="1.5"/><text class="mark-t" x="420" y="168" text-anchor="middle">3</text>
  <circle cx="460" cy="226" r="9" fill="none" stroke="var(--tb-bad)" stroke-width="1.5"/><text class="mark-t" x="460" y="230" text-anchor="middle">4</text>
  <circle cx="485" cy="246" r="9" fill="none" stroke="var(--tb-bad)" stroke-width="1.5"/><text class="mark-t" x="485" y="250" text-anchor="middle">5</text>
</svg>
<p class="tb-caption">図: 誤りを含む部品図 (正面図・平面図・右側面図)。①〜⑤の箇所を検図してみよう。答えは下の練習問題で確認できる。</p>
<div class="tb-note">検図者が見つけた誤りは、修正するだけでなく「なぜ起きたか」をチェックリストやテンプレートに反映させると、同じ誤りが繰り返されなくなります。</div>
`,
    points: ["観点を分けて何周かで見る。確認した寸法に印を付ける", "相手部品・組立図・3D モデルと突き合わせる", "二重記入・閉ループ・公差の付け忘れ・過剰公差・相手との不一致が定番の誤り", "加工者・検査者の立場で「測れるか・作れるか」を確認", "見つけた誤りはチェックリストに反映して再発を防ぐ"],
    exercises: [
      {
        q: "本文の「間違い探し」の図にある誤り ①〜⑤ を指摘し、直し方を答えなさい。",
        a: "<b>①</b> 全長 100 と直列寸法 30 + 70 がすべて書かれた<b>閉ループ</b>。重要でない一方を消すか参考寸法 (70) にする。<br><b>②</b> 軸受がはまる穴が φ20 だけで<b>公差がない</b>。しかも 6204 の外径は 47 mm (内径 20 mm) なので、外輪がはまる穴なら<b>φ47 で、公差域クラス (例: H7 などメーカー推奨) を指示</b>する必要がある。図の値と相手部品が合っていない。<br><b>③</b> 高さ 40 が正面図と右側面図に<b>二重記入</b>されている。片方 (通常は正面図) だけにする。<br><b>④</b> 材料が流用元のまま — <b>材料記号を正しく記入</b>する。<br><b>⑤</b>「全面 ±0.01」は<b>過剰な公差</b>で、表題欄の普通公差 (m 級) とも矛盾する。一括の厳しい公差は削除し、機能上必要な寸法だけに個別の公差を付ける。",
      },
      {
        q: "相手部品の穴の入口に C0.5 の面取りがあり、そこに差し込む自部品の根元の隅に R1 を付けました。何が問題ですか?",
        a: "隅の R1 が相手の面取り C0.5 より大きいため、<b>R の部分が穴の縁に当たって奥まで入らない</b> (肩が密着しない) おそれがあります。相手の面取りを C1.5 程度に大きくするか、自部品の隅 R を小さくする (または逃げ溝を設ける) 必要があります。",
      },
    ],
    quiz: [
      { q: "検図で寸法の過不足を確かめる効果的な方法は?", choices: ["図面を一度だけ通読する", "確認した寸法に印を付けながら観点別に見る", "CAD の自動寸法を信用する"], answer: 1, explain: "印を付けながら観点を分けて見ると、見落としと重複を見つけやすくなります。" },
      { q: "同じ寸法を正面図と側面図の両方に書くと何が問題?", choices: ["問題ない", "修正時に片方だけ直して矛盾が生じやすい", "尺度が変わる"], answer: 1, explain: "寸法の重複は修正漏れによる矛盾の原因になるので、1 か所に書きます。" },
      { q: "エンドミル加工の内側の角を R0 で指示すると?", choices: ["問題ない", "工具半径の R が残るので指示どおり加工できない", "表面粗さが良くなる"], answer: 1, explain: "回転工具では内角に工具半径の R が残ります。許容できる R を指示します。" },
    ],
    lessons: ["6-3", "6-4", "6-7"],
  },
];
