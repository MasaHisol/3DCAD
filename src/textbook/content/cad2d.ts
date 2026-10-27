import type { TextChapter } from "../types";

export const CAD2D: TextChapter[] = [
  {
    id: "2d-intro",
    part: "cad2d",
    title: "2D CAD とは — 手描き製図から 3D CAD への入り口",
    minutes: 12,
    level: 1,
    lead: "2D CAD はコンピュータで正確な平面図形と図面を描く道具です。3D CAD のスケッチも 2D 作図そのものなので、ここから始めるのが近道です。",
    body: `
<h2>手描き製図と 2D CAD の違い</h2>
<p>手描き製図では、定規・コンパス・三角定規で紙に線を引き、縮尺に合わせて長さを測りながら描きます。2D CAD では、図形を<b>実寸 (1:1)</b> の数値で作成し、印刷するときに尺度を決めます。</p>
<table class="tb-table">
  <tr><th>項目</th><th>手描き製図</th><th>2D CAD</th></tr>
  <tr><td>精度</td><td>鉛筆の線幅・目盛の読み取りで決まる</td><td>数値入力で正確 (小数点以下も保持)</td></tr>
  <tr><td>修正</td><td>消して描き直す</td><td>移動・トリム・寸法変更ですぐ直せる</td></tr>
  <tr><td>尺度</td><td>描く前に決める</td><td>実寸で描き、印刷時に尺度を選ぶ</td></tr>
  <tr><td>再利用</td><td>コピー機で複写</td><td>部品図形の複写、データの共有 (DXF など)</td></tr>
</table>
<h2>2D CAD と 3D CAD の役割分担</h2>
<ul>
  <li><b>2D CAD</b>: 図面 (製作図・配置図・電気回路図・建築図)、板金やレーザー加工の外形データ、簡単な部品の検討</li>
  <li><b>3D CAD</b>: 立体形状の設計、組立 (アセンブリ) と干渉確認、質量計算、解析、3D プリント。図面は 3D モデルから作成する</li>
</ul>
<p>3D CAD が主流になっても、製造現場では今も 2D 図面が「正式な指示書」として使われることが多く、2D の作図と読図の力は欠かせません。</p>
<h2>代表的な 2D CAD と DXF</h2>
<p>汎用 2D CAD には AutoCAD (Autodesk)、Jw_cad (日本で建築を中心に普及しているフリーソフト)、DraftSight などがあります。
ソフトが違ってもデータをやり取りできるよう、<b>DXF</b> (Drawing Exchange Format、Autodesk が仕様を公開) という形式が広く使われます。レーザー加工機やカッティングマシンも DXF を読めるものが多くあります。</p>
<h2>学習ロードマップ</h2>
<ol class="tb-flow">
  <li><b>2D 作図</b> — 座標入力、線・円・円弧、トリムなどの編集で正確な図形を描く</li>
  <li><b>拘束付きスケッチ</b> — 寸法と幾何拘束で形を決め、数値を変えると形が変わるパラメトリックな作図</li>
  <li><b>3D フィーチャ</b> — スケッチを押し出し・回転して立体にし、フィレットや穴を追加する</li>
  <li><b>図面化</b> — 3D モデルから投影図・寸法・注記を作る</li>
</ol>
<svg class="tb-chart" viewBox="0 0 520 200" role="img" aria-label="2D スケッチから 3D モデル、図面までの流れ">
<rect class="k-panel" x="8" y="8" width="160" height="184" rx="8"/><rect class="k-panel" x="180" y="8" width="160" height="184" rx="8"/><rect class="k-panel" x="352" y="8" width="160" height="184" rx="8"/>
<circle class="k-badge" cx="28" cy="28" r="10" style="fill:var(--tb-accent)"/><text class="k-badge-t" x="28" y="32" text-anchor="middle">1</text><text class="k-title" x="46" y="32">2D スケッチ</text>
<circle class="k-badge" cx="200" cy="28" r="10" style="fill:var(--tb-accent)"/><text class="k-badge-t" x="200" y="32" text-anchor="middle">2</text><text class="k-title" x="218" y="32">押し出して 3D</text>
<circle class="k-badge" cx="372" cy="28" r="10" style="fill:var(--tb-accent)"/><text class="k-badge-t" x="372" y="32" text-anchor="middle">3</text><text class="k-title" x="390" y="32">図面にする</text>
<rect class="k-edge" x="34" y="72" width="108" height="64" stroke-width="2.2" style="fill:none"/>
<circle class="k-edge" cx="88" cy="104" r="14" stroke-width="2" style="fill:none"/>
<line class="k-center" x1="68" y1="104" x2="108" y2="104"/><line class="k-center" x1="88" y1="84" x2="88" y2="124"/>
<line class="k-ext" x1="34" y1="140" x2="34" y2="160"/><line class="k-ext" x1="142" y1="140" x2="142" y2="160"/>
<line class="k-dimline" x1="34" y1="155" x2="142" y2="155"/><text class="k-dimtext" x="88" y="150" text-anchor="middle">60</text>
<line class="k-ext" x1="146" y1="72" x2="160" y2="72"/><line class="k-ext" x1="146" y1="136" x2="160" y2="136"/>
<line class="k-dimline" x1="155" y1="72" x2="155" y2="136"/><text class="k-dimtext" x="152" y="66" text-anchor="end">40</text>
<text class="k-note" x="88" y="182" text-anchor="middle">閉じた輪郭 + 寸法</text>
<path class="k-move" d="M166,104 L184,104" stroke-width="2.4"/>
<g class="k-shadow">
<polygon class="k-part" points="210,90 290,90 314,72 234,72" style="fill:var(--k-steel-1)"/>
<polygon class="k-part" points="290,90 314,72 314,124 290,142" style="fill:var(--k-steel-3)"/>
<polygon class="k-part" points="210,90 290,90 290,142 210,142" style="fill:var(--k-steel-2)"/>
</g>
<ellipse cx="262" cy="81" rx="12" ry="6" style="fill:var(--tb-surface);stroke:var(--k-line)" stroke-width="1.4"/>
<text class="k-note" x="260" y="170" text-anchor="middle">厚さ 10 で押し出し</text>
<path class="k-move" d="M338,104 L356,104" stroke-width="2.4"/>
<rect class="k-edge" x="376" y="56" width="84" height="56" stroke-width="2" style="fill:none"/>
<circle class="k-edge" cx="418" cy="84" r="11" stroke-width="1.6" style="fill:none"/>
<line class="k-center" x1="402" y1="84" x2="434" y2="84"/><line class="k-center" x1="418" y1="68" x2="418" y2="100"/>
<rect class="k-edge" x="376" y="124" width="84" height="16" stroke-width="2" style="fill:none"/>
<line class="k-hidden" x1="409" y1="124" x2="409" y2="140"/><line class="k-hidden" x1="427" y1="124" x2="427" y2="140"/>
<text class="tick" x="468" y="88">平面図</text><text class="tick" x="468" y="136">正面図</text>
<text class="k-note" x="432" y="170" text-anchor="middle">投影図 + 寸法</text>
</svg>
<p class="tb-caption">図: 60 × 40 の板に穴 1 つ。2D の輪郭 (スケッチ) を押し出すと立体になり、立体から図面のビューが作られる</p>
<h2>はじめての作図 — 手順の例</h2>
<p>どの 2D CAD でも、最初の 1 枚はおおむね次の手順で描きます。順番を守ると、後で「線がつながっていない」「尺度が合わない」といった手戻りが減ります。</p>
<ol class="tb-flow">
  <li><b>単位と用紙を確認</b> — 単位は mm、図形は 1:1 で描く。用紙 (A4・A3) と印刷尺度は後で決める</li>
  <li><b>基準を決める</b> — 原点を部品の左下の角か穴の中心など、寸法の基準になる点に置く</li>
  <li><b>外形を描く</b> — 長方形や連続線で輪郭を描き、座標・長さを数値で入力する</li>
  <li><b>穴・切り欠きを描く</b> — 中心の位置を基準からの寸法で決める</li>
  <li><b>確認する</b> — 寸法を測り直し、輪郭が閉じているかを確かめて保存する</li>
</ol>
<div class="tb-note"><b>練習課題</b>: 60 × 40 mm の板の中央に φ20 の穴がある図形 (上図) を描いてみましょう。原点を左下の角に置くと、穴の中心は (30, 20) です。描けたら、穴の位置を (20, 20) に変えるにはどの操作が必要かも考えてみてください。</div>
<h2>初心者がつまずきやすい点</h2>
<table class="tb-table">
  <tr><th>よくある失敗</th><th>何が起きるか</th><th>防ぎ方</th></tr>
  <tr><td>印刷尺度に合わせて縮めて描く</td><td>寸法の数値が実物と合わず、加工データとして使えない</td><td>常に実寸 1:1 で描き、尺度は印刷時に決める</td></tr>
  <tr><td>マウスのクリックだけで描く</td><td>端点が少しずれ、輪郭が閉じない</td><td>数値入力とスナップ (自動拘束) を使う</td></tr>
  <tr><td>単位を確認しない</td><td>インチの DXF を読むと 25.4 倍ずれる</td><td>読み込み後に既知の寸法を測って確認する</td></tr>
  <tr><td>寸法や文字も外形と同じ線で描く</td><td>レーザー加工機が文字まで切断する</td><td>加工用の DXF には外形だけを書き出す</td></tr>
</table>
<div class="tb-tip"><b>3DCAD Studio では</b>: スケッチ (線分 L・円 C・円弧 A・長方形 R など) が 2D 作図の場です。スケッチを右クリックして DXF 書き出し、DXF をインポートしてスケッチにすることもできます。</div>`,
    points: ["2D CAD は実寸で描き、印刷時に尺度を決める", "図面・加工外形は 2D、立体設計・組立は 3D が得意", "DXF はソフト間で 2D データを交換する標準的な形式", "2D 作図 → 拘束付きスケッチ → 3D フィーチャ の順に学ぶ"],
    exercises: [
      {
        q: "長さ 2000 mm の部品を A4 用紙に 1:10 で印刷します。2D CAD ではこの部品を何 mm で描きますか? また印刷上の長さは?",
        a: "CAD 上では実寸の <b>2000 mm</b> で描きます。印刷上の長さは 2000 / 10 = <b>200 mm</b> (A4 の長辺 297 mm に収まる)。",
      },
      {
        q: "60 × 40 mm の板の中央に φ20 の穴がある図形を描きます。原点を板の左下の角に置いたとき、外形の 4 つの角と穴の中心の座標、穴の半径を答えてください。",
        a: "角は <b>(0, 0)・(60, 0)・(60, 40)・(0, 40)</b>。穴の中心は幅・高さの半分で <b>(30, 20)</b>、半径は 20 / 2 = <b>10 mm</b>。基準 (原点) を角に置くと、図面の寸法と座標がそのまま一致します。",
      },
      {
        q: "インチ単位で作られた DXF を mm として読み込んだら、長さ 2 の線がありました。本来の長さは何 mm ですか? どう確認すればよいですか?",
        a: "1 in = 25.4 mm なので 2 × 25.4 = <b>50.8 mm</b>。読み込み後に寸法のわかっている部分を測り、数値が 25.4 倍 (または 1/25.4) ずれていないかを確認します。",
      },
    ],
    quiz: [
      { q: "2D CAD で図形を描くときの基本は?", choices: ["印刷尺度に合わせて縮めて描く", "実寸 (1:1) で描く", "画面の大きさに合わせて描く"], answer: 1, explain: "CAD では実寸で描き、尺度は印刷 (または図面のビュー) で設定します。" },
      { q: "異なる CAD ソフト間で 2D データを交換するのによく使われる形式は?", choices: ["DXF", "MP3", "STL"], answer: 0, explain: "DXF は 2D 図形の交換に広く使われます。STL は 3D の三角形メッシュ形式です。" },
      { q: "3D CAD のスケッチと最も関係が深いのは?", choices: ["2D 作図", "画像編集", "表計算"], answer: 0, explain: "スケッチは平面上の 2D 作図で、それを押し出し・回転して立体にします。" },
      { q: "マウスのクリックだけで輪郭を描いたときに起こりやすい問題は?", choices: ["端点がわずかにずれて輪郭が閉じない", "線が自動で太くなる", "ファイルが開けなくなる"], answer: 0, explain: "見た目でつながっていても端点がずれていると、押し出しや加工ができません。数値入力とスナップを使います。" },
    ],
    lessons: ["0-1", "2-1"],
  },
  {
    id: "2d-coords",
    part: "cad2d",
    title: "座標と入力 — 正確に点を決める",
    minutes: 18,
    level: 1,
    lead: "CAD の図形は点の座標で決まります。絶対座標・相対座標・極座標の 3 つの入力方法と、スナップ・直交モードを身につけましょう。",
    body: `
<h2>原点と絶対座標</h2>
<p>作図平面には<b>原点 (0, 0)</b> があり、右向きが X の正、上向きが Y の正です。原点からの位置で点を指定する方法を<b>絶対座標</b>といい、「X, Y」で入力します (例: 50,30)。単位は機械製図では通常 <b>mm</b> です。</p>
<h2>相対座標と極座標</h2>
<p>多くの 2D CAD (AutoCAD 形式) では、直前の点を基準にした入力ができます。</p>
<table class="tb-table">
  <tr><th>方式</th><th>入力例</th><th>意味</th></tr>
  <tr><td>絶対座標</td><td>50,30</td><td>原点から X=50, Y=30 の点</td></tr>
  <tr><td>相対座標</td><td>@40,0</td><td>直前の点から X 方向に 40、Y 方向に 0</td></tr>
  <tr><td>極座標 (相対)</td><td>@50&lt;30</td><td>直前の点から距離 50、角度 30° の方向</td></tr>
</table>
<div class="tb-math">\\text{極座標} \\to \\text{増分:}\\ dx = L\\cos\\theta \\qquad dy = L\\sin\\theta</div>
<p>角度は <b>X 軸の正の向き (右) を 0°</b> とし、<b>反時計回りが正</b>です。上が 90°、左が 180°、下が 270° (= −90°) です。</p>
<svg class="tb-chart" viewBox="0 0 520 220" role="img" aria-label="絶対座標と相対座標">
<rect class="k-panel" x="8" y="8" width="318" height="204" rx="8"/><rect class="k-panel" x="338" y="8" width="174" height="204" rx="8"/>
<line class="grid" x1="85" y1="40" x2="85" y2="190"/><line class="grid" x1="110" y1="40" x2="110" y2="190"/><line class="grid" x1="135" y1="40" x2="135" y2="190"/><line class="grid" x1="160" y1="40" x2="160" y2="190"/><line class="grid" x1="185" y1="40" x2="185" y2="190"/><line class="grid" x1="210" y1="40" x2="210" y2="190"/><line class="grid" x1="235" y1="40" x2="235" y2="190"/><line class="grid" x1="260" y1="40" x2="260" y2="190"/><line class="grid" x1="285" y1="40" x2="285" y2="190"/><line class="grid" x1="310" y1="40" x2="310" y2="190"/>
<line class="grid" x1="60" y1="165" x2="310" y2="165"/><line class="grid" x1="60" y1="140" x2="310" y2="140"/><line class="grid" x1="60" y1="115" x2="310" y2="115"/><line class="grid" x1="60" y1="90" x2="310" y2="90"/><line class="grid" x1="60" y1="65" x2="310" y2="65"/><line class="grid" x1="60" y1="40" x2="310" y2="40"/>
<line class="k-edge" x1="40" y1="190" x2="312" y2="190" style="marker-end:url(#k-arrow)"/><line class="k-edge" x1="60" y1="202" x2="60" y2="30" style="marker-end:url(#k-arrow)"/>
<text class="lbl" x="312" y="205" text-anchor="end">X</text><text class="lbl" x="68" y="34">Y</text>
<circle cx="60" cy="190" r="4" style="fill:var(--tb-text)"/><text class="tick" x="26" y="206">原点</text>
<line class="guide" x1="60" y1="190" x2="110" y2="140"/>
<line class="k-ext" x1="110" y1="134" x2="110" y2="108"/><line class="k-ext" x1="230" y1="134" x2="230" y2="108"/>
<line class="k-dimline" x1="110" y1="113" x2="230" y2="113"/><text class="k-dimtext" x="170" y="108" text-anchor="middle">120</text>
<line class="k-thin" x1="230" y1="140" x2="296" y2="140" stroke-dasharray="4 3"/>
<line x1="110" y1="140" x2="226" y2="140" style="stroke:var(--tb-accent);marker-end:url(#k-arrow-blue)" stroke-width="2.6"/>
<line x1="230" y1="140" x2="268" y2="74.5" style="stroke:var(--tb-accent);marker-end:url(#k-arrow-blue)" stroke-width="2.6"/>
<path d="M258,140 A28,28 0 0 0 244,115.8" class="k-edge" style="stroke:var(--k-dim)" stroke-width="1.2"/><text class="k-dimtext" x="262" y="128">60°</text>
<text class="k-dimtext" x="243" y="98" text-anchor="end">80</text>
<circle class="mark" cx="110" cy="140" r="4.5"/><text class="mark-t" x="102" y="134" text-anchor="end">P1 (50,50)</text>
<circle class="mark" cx="230" cy="140" r="4.5"/><text class="mark-t" x="230" y="160" text-anchor="middle">P2 = @120,0</text>
<circle class="mark" cx="270" cy="71" r="4.5"/><text class="mark-t" x="262" y="66" text-anchor="end">P3 = @80&lt;60</text>
<text class="k-title" x="352" y="32">反時計回りが正</text>
<line class="k-thin" x1="356" y1="132" x2="496" y2="132"/><line class="k-thin" x1="426" y1="56" x2="426" y2="196"/>
<path class="k-move" d="M478,132 A52,52 0 0 0 426,80" stroke-width="2.4"/>
<path class="k-edge" d="M461,132 A35,35 0 0 0 443.5,101.7" style="stroke:var(--k-dim)" stroke-width="1.2"/>
<line class="k-edge" x1="426" y1="132" x2="458" y2="76.6" style="stroke:var(--tb-accent)" stroke-width="1.6"/><text class="k-dimtext" x="464" y="80">+60°</text>
<circle cx="426" cy="132" r="3.5" style="fill:var(--tb-text)"/>
<text class="tick" x="500" y="128" text-anchor="end">0°</text><text class="tick" x="432" y="66">90°</text>
<text class="tick" x="358" y="126">180°</text><text class="tick" x="432" y="194">270° (= −90°)</text>
</svg>
<p>(図は目安の縮尺。P3 は P2 から距離 80、60° の方向: dx = 40, dy ≈ 69.3)</p>
<div data-widget="coords"></div>
<h2>スナップと直交モード</h2>
<p>マウスでクリックした位置は小数点以下がずれた座標になりがちです。既存の図形の特徴点に吸着させる<b>スナップ</b>を使えば、正確につながった図形になります。</p>
<ul>
  <li><b>端点</b>: 線分・円弧の端</li>
  <li><b>中点</b>: 線分の真ん中</li>
  <li><b>中心</b>: 円・円弧の中心</li>
  <li><b>交点</b>: 2 つの図形が交わる点</li>
</ul>
<p><b>直交モード</b>をオンにすると、カーソルの動きが水平・垂直に限定されます。水平・垂直の線を引くときに便利です。</p>
<h2>手順例 — 相対座標で L 形の輪郭を一筆で描く</h2>
<p>幅 80・高さ 50、右下が高さ 20 まで、左上が幅 30 まで残る L 形を、原点から連続線で描きます。すべて<b>直前の点からの増分</b>で考えると、外形寸法をそのまま入力できます。</p>
<table class="tb-table">
  <tr><th>順</th><th>入力</th><th>到達点 (絶対座標)</th><th>意味</th></tr>
  <tr><td>1</td><td>0,0</td><td>(0, 0)</td><td>始点 = 原点</td></tr>
  <tr><td>2</td><td>@80,0</td><td>(80, 0)</td><td>底辺 80 を右へ</td></tr>
  <tr><td>3</td><td>@0,20</td><td>(80, 20)</td><td>右辺 20 を上へ</td></tr>
  <tr><td>4</td><td>@−50,0</td><td>(30, 20)</td><td>段差の上面 50 を左へ</td></tr>
  <tr><td>5</td><td>@0,30</td><td>(30, 50)</td><td>立ち上がり 30 を上へ</td></tr>
  <tr><td>6</td><td>@−30,0</td><td>(0, 50)</td><td>上面 30 を左へ</td></tr>
  <tr><td>7</td><td>閉じる (始点をクリック)</td><td>(0, 0)</td><td>左辺 50 で輪郭を閉じる</td></tr>
</table>
<p>チェック: X 方向の増分の合計 80 − 50 − 30 = 0、Y 方向の合計 20 + 30 = 50 (最後の閉じる線で −50) となり、始点に戻ることが確かめられます。<b>増分の合計が 0 になる</b>ことは、閉じた輪郭の簡単な検算になります。</p>
<div class="tb-note"><b>練習課題</b>: 原点から @60,0 → @0,40 → @−60,0 → 閉じる で長方形を描き、次に左下の角から極座標 @50&lt;30 で斜めの線を 1 本引いてみましょう。終点の座標 (43.30, 25.00) にスナップで点を置き、座標表示と一致するか確かめます。</div>
<h2>初心者がつまずきやすい点</h2>
<ul>
  <li><b>@ を付け忘れる</b>: 「40,0」と打つと相対ではなく原点基準の (40, 0) になり、線が原点の方へ戻ってしまう。入力後の線の向きを必ず目で確認する</li>
  <li><b>角度の基準を取り違える</b>: 右向き 0°・反時計回り正。「上から 30°」は 60° (または 120°) のことが多いので、図面の角度がどこから測られているかを確認する</li>
  <li><b>負の増分の符号</b>: 左・下へ進むときは −。L 形の 4 番目のように、戻る方向は符号を忘れやすい</li>
  <li><b>スナップの誤吸着</b>: 近くの別の端点や中点に吸着していないか、拡大して確かめる</li>
</ul>
<div class="tb-note"><b>なぜ正確な数値入力が大切か</b>: 見た目でつながっていても、端点が 0.001 mm ずれていると輪郭が閉じず、3D CAD では押し出しができない、加工機では切断経路が途切れる、といった問題が起きます。</div>
<div class="tb-tip"><b>3DCAD Studio では</b>: 線分を描くときに長さを数値入力でき、長方形は 幅 → Tab → 高さ と入力します。端点は自動拘束で既存の点に一致させられます。</div>`,
    points: ["絶対座標 X,Y は原点基準、相対座標 @dx,dy は直前の点基準", "極座標 @L<θ: dx = L cos θ, dy = L sin θ", "角度は右向き 0°、反時計回りが正", "スナップ (端点・中点・中心・交点) で図形を正確につなぐ"],
    exercises: [
      {
        q: "点 (20, 10) から @50&lt;30 と入力しました。終点の絶対座標を求めてください (小数第 2 位まで)。",
        a: "dx = 50 × cos 30° = 50 × 0.8660 = 43.30、dy = 50 × sin 30° = 50 × 0.5 = 25.00。終点 = (20 + 43.30, 10 + 25.00) = <b>(63.30, 35.00)</b>。",
      },
      {
        q: "点 (100, 0) から @40&lt;120 と入力すると、終点はどこですか?",
        a: "cos 120° = −0.5、sin 120° = 0.8660。dx = −20.00、dy = 34.64。終点 = <b>(80.00, 34.64)</b>。120° は左上方向なので X は減ります。",
      },
      {
        q: "点 (0, 0) から点 (60, 80) へ線を引くとき、相対座標と極座標 (相対) ではそれぞれどう入力しますか? 角度は小数第 2 位まで。",
        a: "相対座標は <b>@60,80</b>。長さ = √(60² + 80²) = 100、角度 = tan⁻¹(80 / 60) ≈ 53.13° なので極座標は <b>@100&lt;53.13</b>。",
      },
    ],
    quiz: [
      { q: "直前の点 (10, 10) から「@30,−20」と入力した終点は?", choices: ["(30, −20)", "(40, −10)", "(−20, 30)"], answer: 1, explain: "相対座標なので (10 + 30, 10 − 20) = (40, −10)。" },
      { q: "極座標で角度 90° の方向は?", choices: ["右", "上", "下"], answer: 1, explain: "右が 0° で反時計回りが正なので、90° は上です。" },
      { q: "円の中心にぴったり線をつなげたいときに使う機能は?", choices: ["直交モード", "中心スナップ", "画層"], answer: 1, explain: "中心スナップで円・円弧の中心に吸着できます。" },
      { q: "連続線で描いた閉じた輪郭について、すべての相対増分 (dx, dy) を合計するとどうなる?", choices: ["(0, 0) になる", "外形の幅と高さになる", "周長になる"], answer: 0, explain: "始点に戻るので増分の合計は 0 です。描いた輪郭の簡単な検算に使えます。" },
    ],
    lessons: ["0-1", "2-1"],
  },
  {
    id: "2d-draw",
    part: "cad2d",
    title: "基本図形の作図 — 線・円・円弧・長方形",
    minutes: 15,
    level: 1,
    lead: "部品の輪郭は、線分・円・円弧などの基本図形の組み合わせです。各図形の決め方と、基準線から描く作図の順序を学びます。",
    body: `
<h2>基本図形と指定方法</h2>
<table class="tb-table">
  <tr><th>図形</th><th>主な指定方法</th><th>使いどころ</th></tr>
  <tr><td>線分</td><td>始点 + 終点 (座標・長さと角度)</td><td>輪郭の直線部分</td></tr>
  <tr><td>連続線 (ポリライン)</td><td>点を次々に指定</td><td>つながった輪郭を一気に描く</td></tr>
  <tr><td>円</td><td>中心 + 半径 / 中心 + 直径</td><td>穴、軸の断面</td></tr>
  <tr><td>円弧</td><td>3 点 (始点・通過点・終点)、中心 + 始点 + 終点</td><td>角の丸み、R 形状</td></tr>
  <tr><td>長方形</td><td>対角の 2 点、または幅と高さ</td><td>板・ブロックの外形</td></tr>
  <tr><td>正多角形</td><td>中心 + 辺の数 + 内接 / 外接の円の半径</td><td>六角ナット・六角穴</td></tr>
  <tr><td>長円 (スロット)</td><td>2 つの中心 + 幅 (半径)</td><td>長穴 (位置調整用の穴)</td></tr>
  <tr><td>点</td><td>座標</td><td>穴位置などの目印</td></tr>
</table>
<h2>正多角形の内接と外接</h2>
<p>正多角形の大きさは補助の円で決めます。<b>内接</b>は頂点が円の上にある (多角形が円の内側)、<b>外接</b>は辺の中点が円に接する (多角形が円の外側) 指定です。
六角ナットの「二面幅 (対辺の距離)」で決めたいときは、二面幅の半分を半径とする<b>外接</b>指定が便利です。</p>
<svg class="tb-chart" viewBox="0 0 520 214" role="img" aria-label="正六角形の内接と外接">
<rect class="k-panel" x="8" y="8" width="244" height="198" rx="8"/><rect class="k-panel" x="268" y="8" width="244" height="198" rx="8"/>
<circle class="k-badge" cx="28" cy="28" r="10" style="fill:var(--tb-accent)"/><text class="k-badge-t" x="28" y="32" text-anchor="middle">1</text><text class="k-title" x="46" y="32">内接 (頂点が円上)</text>
<circle class="k-badge" cx="288" cy="28" r="10" style="fill:var(--tb-accent)"/><text class="k-badge-t" x="288" y="32" text-anchor="middle">2</text><text class="k-title" x="306" y="32">外接 (辺が円に接する)</text>
<g class="k-shadow"><polygon class="k-part" points="190,106 160,54 100,54 70,106 100,158 160,158"/></g>
<circle cx="130" cy="106" r="60" fill="none" style="stroke:var(--tb-accent)" stroke-width="1.4" stroke-dasharray="6 4"/>
<line class="k-center" x1="62" y1="106" x2="198" y2="106"/><line class="k-center" x1="130" y1="40" x2="130" y2="172"/>
<circle cx="190" cy="106" r="3.4" style="fill:var(--tb-bad)"/><circle cx="160" cy="54" r="3.4" style="fill:var(--tb-bad)"/><circle cx="100" cy="54" r="3.4" style="fill:var(--tb-bad)"/><circle cx="70" cy="106" r="3.4" style="fill:var(--tb-bad)"/><circle cx="100" cy="158" r="3.4" style="fill:var(--tb-bad)"/><circle cx="160" cy="158" r="3.4" style="fill:var(--tb-bad)"/>
<line class="k-ext" x1="70" y1="112" x2="70" y2="188"/><line class="k-ext" x1="190" y1="112" x2="190" y2="188"/>
<line class="k-dimline" x1="70" y1="182" x2="190" y2="182"/><text class="k-dimtext" x="130" y="198" text-anchor="middle">対角距離 = 円の直径</text>
<g class="k-shadow"><polygon class="k-part" points="440,106 410,54 350,54 320,106 350,158 410,158"/></g>
<circle cx="380" cy="106" r="52" fill="none" style="stroke:var(--tb-accent)" stroke-width="1.4" stroke-dasharray="6 4"/>
<line class="k-center" x1="312" y1="106" x2="448" y2="106"/><line class="k-center" x1="380" y1="40" x2="380" y2="172"/>
<circle cx="380" cy="54" r="3.4" style="fill:var(--tb-good)"/><circle cx="380" cy="158" r="3.4" style="fill:var(--tb-good)"/>
<line class="k-ext" x1="414" y1="54" x2="470" y2="54"/><line class="k-ext" x1="414" y1="158" x2="470" y2="158"/>
<line class="k-dimline" x1="464" y1="54" x2="464" y2="158"/><text class="k-dimtext" x="470" y="110">二面幅</text>
<text class="k-note" x="380" y="190" text-anchor="middle">緑の点で辺が円に接する</text>
</svg>
<p>同じ半径 r なら、外接の六角形の頂点までの距離は r / cos 30° ≈ 1.155 r になります。</p>
<h2>作図の順序 — 基準線から</h2>
<ol class="tb-flow">
  <li><b>中心線・基準線</b>を描く (対称軸、穴の中心、加工の基準面)</li>
  <li>基準線から寸法をとって<b>主要な輪郭</b> (外形の線・大きな円) を描く</li>
  <li><b>穴・溝</b>など細部を描く</li>
  <li>トリムで不要部分を削り、<b>角の丸み</b>などを仕上げる</li>
</ol>
<p>基準から描くと、図面に記入する寸法と作図の手順がそろい、後で寸法を変えるときも迷いません。</p>
<h2>手順例 — 丸フランジを描く</h2>
<p>外径 φ100、中央穴 φ30、ピッチ円直径 (PCD) 70 上に φ9 のボルト穴 4 個 (45° の位置) のフランジを描きます。</p>
<ol class="tb-flow">
  <li><b>中心線</b>: 原点を通る水平・垂直の線を描く (補助線)</li>
  <li><b>ピッチ円</b>: 原点中心に直径 70 の円を描き、補助線にする (一点鎖線で表す円)</li>
  <li><b>外形と中央穴</b>: 原点中心に φ100 と φ30 の円</li>
  <li><b>ボルト穴</b>: 中心は半径 35 で 45° の方向 → (35 cos 45°, 35 sin 45°) ≈ (24.75, 24.75)。4 象限に φ9 の円を描く</li>
  <li><b>確認</b>: 穴の中心がピッチ円の上にあるか (中心スナップ・交点スナップで描いたか) を確かめる</li>
</ol>
<svg class="tb-chart" viewBox="0 0 520 210" role="img" aria-label="丸フランジの作図手順">
<rect class="k-panel" x="8" y="8" width="504" height="194" rx="8"/>
<circle class="k-edge" cx="140" cy="106" r="80" stroke-width="2.4" style="fill:none"/>
<circle class="k-edge" cx="140" cy="106" r="24" stroke-width="2.2" style="fill:none"/>
<circle cx="140" cy="106" r="56" fill="none" style="stroke:var(--tb-accent)" stroke-width="1.2" stroke-dasharray="14 3 2 3"/>
<line class="k-center" x1="48" y1="106" x2="232" y2="106"/><line class="k-center" x1="140" y1="16" x2="140" y2="196"/>
<line class="guide" x1="140" y1="106" x2="179.6" y2="66.4"/>
<circle class="k-edge" cx="179.6" cy="66.4" r="7.2" stroke-width="2" style="fill:none"/><circle class="k-edge" cx="100.4" cy="66.4" r="7.2" stroke-width="2" style="fill:none"/>
<circle class="k-edge" cx="100.4" cy="145.6" r="7.2" stroke-width="2" style="fill:none"/><circle class="k-edge" cx="179.6" cy="145.6" r="7.2" stroke-width="2" style="fill:none"/>
<text class="k-dimtext" x="166" y="96">R35</text>
<text class="mark-t" x="262" y="40">① 中心線 (補助線)</text>
<text class="mark-t" x="262" y="66" style="fill:var(--tb-accent)">② ピッチ円 PCD 70 (補助線)</text>
<text class="mark-t" x="262" y="92">③ 外形 φ100・中央穴 φ30</text>
<text class="mark-t" x="262" y="118">④ φ9 × 4 (45° の位置)</text>
<text class="k-note" x="262" y="146">穴の中心 ≈ (±24.75, ±24.75)</text>
<text class="k-note" x="262" y="168">ピッチ円と 45° の補助線の交点に置く</text>
</svg>
<div class="tb-note"><b>練習課題</b>: 中心間距離 20・幅 8 の長円 (長穴) を描き、全長が 20 + 8 = 28 mm になることを測定で確かめましょう。次に二面幅 10 の六角形を外接指定で描き、対角距離を測ってください (約 11.55 mm)。</div>
<h2>初心者がつまずきやすい点</h2>
<ul>
  <li><b>半径と直径の取り違え</b>: 図面の φ は直径。円を「中心 + 半径」で描くときは半分の値を入れる</li>
  <li><b>円弧の向き</b>: 3 点指定では通過点の位置で凸の向きが決まる。中心 + 始点 + 終点では反時計回りが既定のソフトが多い</li>
  <li><b>内接 / 外接の取り違え</b>: 六角ナットを内接で描くと二面幅が小さくなり、スパナが合わない寸法になる</li>
  <li><b>補助線を外形にしたまま</b>: 中心線やピッチ円が輪郭として残ると、閉じた領域が増えて押し出しや加工で誤動作する</li>
</ul>
<div class="tb-tip"><b>3DCAD Studio では</b>: 線分 L・円 C・円弧 A・長方形 R・ポリゴン・長円・点がスケッチで使えます。中心線のような補助線は「コンストラクション」に切り替えると、立体の輪郭に含まれない補助線になります。</div>`,
    points: ["円は中心 + 半径 (直径)、円弧は 3 点などで決める", "正多角形は内接 / 外接の円で大きさを指定 (二面幅は外接)", "長円 (スロット) は長穴の作図に使う", "中心線・基準線 → 主要輪郭 → 細部 の順に描く"],
    exercises: [
      {
        q: "二面幅 17 mm の六角形を外接指定で描きます。円の半径と、頂点間の距離 (対角距離) を求めてください。",
        a: "外接円の半径 = 17 / 2 = <b>8.5 mm</b>。中心から頂点までは 8.5 / cos 30° = 8.5 / 0.8660 ≈ 9.81 mm なので、対角距離 ≈ <b>19.63 mm</b>。",
      },
      {
        q: "PCD 70 の円周上に φ9 の穴を 4 個、45°・135°・225°・315° の位置に描きます。原点を中心としたとき、各穴の中心座標を小数第 2 位まで求めてください。",
        a: "半径 r = 35。35 × cos 45° = 35 × 0.7071 ≈ 24.75 なので、<b>(24.75, 24.75)・(−24.75, 24.75)・(−24.75, −24.75)・(24.75, −24.75)</b>。",
      },
    ],
    quiz: [
      { q: "六角ナットを二面幅で描くのに便利な正多角形の指定は?", choices: ["内接", "外接", "どちらでも同じ"], answer: 1, explain: "外接は辺が円に接するので、円の直径 = 二面幅になります。" },
      { q: "長穴 (位置調整用の穴) を描くのに適した図形は?", choices: ["長円 (スロット)", "正多角形", "点"], answer: 0, explain: "長円は 2 つの半円を直線でつないだ形で、長穴そのものです。" },
      { q: "作図で最初に描くのがよいものは?", choices: ["角の丸み", "中心線・基準線", "寸法の文字"], answer: 1, explain: "基準線を先に描き、そこから寸法をとって輪郭を描きます。" },
      { q: "図面に「φ12」とある穴を「中心 + 半径」で描くとき、入力する値は?", choices: ["12", "6", "24"], answer: 1, explain: "φ は直径を表すので、半径は 12 / 2 = 6 mm です。" },
    ],
    lessons: ["0-1", "0-2", "2-1"],
  },
  {
    id: "2d-edit",
    part: "cad2d",
    title: "編集コマンド — トリム・オフセット・フィレットほか",
    minutes: 16,
    level: 1,
    lead: "CAD の作図は「描く」より「編集する」時間のほうが長いと言われます。代表的な編集コマンドと、3DCAD Studio での対応を整理します。",
    body: `
<h2>一般的な 2D CAD の編集コマンド</h2>
<table class="tb-table">
  <tr><th>コマンド</th><th>はたらき</th><th>例</th></tr>
  <tr><td>トリム</td><td>交点で図形の一部を切り取る</td><td>交差した線のはみ出しを消す</td></tr>
  <tr><td>延長</td><td>線を他の図形まで伸ばす</td><td>届いていない線を境界までつなぐ</td></tr>
  <tr><td>オフセット</td><td>一定距離だけ平行に複製する</td><td>板厚 3 mm の内側の線を作る</td></tr>
  <tr><td>フィレット</td><td>2 本の線の角を指定半径の円弧でつなぐ</td><td>角に R5 の丸み</td></tr>
  <tr><td>面取り</td><td>角を斜めに切る</td><td>C1 の面取り</td></tr>
  <tr><td>移動 / 複写</td><td>基点から目標点へ移す / 複製する</td><td>同じ穴を別の位置に</td></tr>
  <tr><td>回転</td><td>基点まわりに角度だけ回す</td><td>部品を 30° 傾ける</td></tr>
  <tr><td>ミラー</td><td>対称軸で鏡像を作る</td><td>左右対称形状の半分を描いて反転</td></tr>
  <tr><td>配列</td><td>矩形状・円形状に並べて複製</td><td>PCD 上に 6 個の穴</td></tr>
  <tr><td>尺度</td><td>基点を中心に拡大・縮小</td><td>図形を 2 倍に</td></tr>
</table>
<h2>トリムのイメージ</h2>
<svg class="tb-chart" viewBox="0 0 520 188" role="img" aria-label="トリム前後">
<rect class="k-panel" x="8" y="8" width="226" height="172" rx="8"/><rect class="k-panel" x="286" y="8" width="226" height="172" rx="8"/>
<circle class="k-badge" cx="28" cy="28" r="10" style="fill:var(--tb-bad)"/><text class="k-badge-t" x="28" y="32" text-anchor="middle">✕</text><text class="k-title" x="46" y="32">トリム前 (線がはみ出す)</text>
<circle class="k-badge" cx="306" cy="28" r="10" style="fill:var(--tb-good)"/><text class="k-badge-t" x="306" y="32" text-anchor="middle">✓</text><text class="k-title" x="324" y="32">トリム後 (閉じた輪郭)</text>
<g style="stroke:var(--tb-bad)" stroke-width="2" stroke-dasharray="5 3">
<line x1="34" y1="62" x2="60" y2="62"/><line x1="180" y1="62" x2="206" y2="62"/><line x1="34" y1="142" x2="60" y2="142"/><line x1="180" y1="142" x2="206" y2="142"/>
<line x1="60" y1="44" x2="60" y2="62"/><line x1="180" y1="44" x2="180" y2="62"/><line x1="60" y1="142" x2="60" y2="160"/><line x1="180" y1="142" x2="180" y2="160"/>
</g>
<rect class="k-edge" x="60" y="62" width="120" height="80" stroke-width="2.2" style="stroke-linejoin:miter"/>
<circle cx="60" cy="62" r="3" style="fill:var(--tb-text)"/><circle cx="180" cy="62" r="3" style="fill:var(--tb-text)"/><circle cx="60" cy="142" r="3" style="fill:var(--tb-text)"/><circle cx="180" cy="142" r="3" style="fill:var(--tb-text)"/>
<text class="k-note" x="120" y="106" text-anchor="middle">赤い部分を消す</text>
<path class="k-move" d="M242,102 L278,102" stroke-width="2.6"/>
<g class="k-shadow"><rect class="k-accent" x="338" y="62" width="120" height="80" style="fill-opacity:0.35" stroke-width="2.6"/></g>
<text class="k-note" x="398" y="106" text-anchor="middle">1 つの領域</text>
</svg>
<h2>3DCAD Studio のスケッチでは</h2>
<p>3DCAD Studio のスケッチにある編集機能は<b>トリム (X)・コンストラクション (補助線への切替)・削除</b>です。オフセット・フィレット・ミラー・配列などはスケッチの編集コマンドとしてはありません。同じ目的は次のように達成します。</p>
<table class="tb-table">
  <tr><th>目的</th><th>一般的な 2D CAD</th><th>3DCAD Studio での考え方</th></tr>
  <tr><td>角を丸める</td><td>2D フィレット</td><td>立体にしてから 3D のフィレット (または円弧 + 正接拘束で描く)</td></tr>
  <tr><td>左右対称</td><td>ミラー</td><td>中心線をコンストラクションにして<b>対称拘束</b>、または 3D のミラー</td></tr>
  <tr><td>同じ穴を並べる</td><td>配列</td><td>3D のパターン、または円を描いて<b>等値拘束</b>で同じ大きさに</td></tr>
  <tr><td>平行な線</td><td>オフセット</td><td>線を描き<b>平行拘束</b> + 距離寸法</td></tr>
</table>
<h2>手順例 — 3DCAD Studio でトリムを使って「かぎ穴」形を作る</h2>
<ol class="tb-flow">
  <li><b>円 (C)</b> で原点中心に直径 20 の円を描く</li>
  <li><b>長方形 (R)</b> で、円の下側に重なるように幅 8 × 高さ 25 の長方形を描く (中心を Y 軸にそろえる)</li>
  <li><b>トリム (X)</b> で、円の内側に入り込んだ長方形の上辺と、長方形の内側にある円の弧をクリックして消す</li>
  <li>残った線の端点がつながり、<b>1 つの閉じた輪郭</b>になったことを確認する (押し出しのプロファイルとして選べる)</li>
  <li>寸法 (D) と対称拘束で形を決め、<b>スケッチを終了</b>する</li>
</ol>
<p>トリムは「交点で区切られた区間」単位で消します。消したい区間をクリックするだけで、交点が新しい端点になります。</p>
<h2>フィレットと面取りの寸法感覚</h2>
<p>直角の角に R5 のフィレットを付けると、円弧は各辺に<b>角から 5 mm の位置</b>で接します。C1 の面取りは、角から各辺に 1 mm の位置を結ぶ 45° の斜線です。どちらも辺が短すぎると付けられない (辺の長さ &lt; R) ので、小さな段差に大きな R を指定しないよう注意します。</p>
<div class="tb-note"><b>練習課題</b>: 100 × 60 の長方形と、その右上の角を中心とする半径 20 の円を描き、トリムで「角を 1/4 円でくり抜いた形」を作ってください。輪郭の線が何本 (線分・円弧) で構成されるか数えましょう (線分 4 本 + 円弧 1 本)。</div>
<h2>初心者がつまずきやすい点</h2>
<ul>
  <li><b>トリムで消しすぎる</b>: 交点がないと線全体が消える。消えたら元に戻す (Ctrl+Z) で直し、先に交わる線を描いておく</li>
  <li><b>重なった線</b>: 同じ位置に線が 2 本重なっていると輪郭が閉じない・領域が分かれる原因になる。複写や DXF 読み込みの後に起きやすい</li>
  <li><b>オフセットの向き</b>: 内側と外側のどちらに複製するかで寸法が 2 × 距離 だけ変わる</li>
  <li><b>削除と非表示の混同</b>: 補助として残したい線は消さずにコンストラクションに切り替える</li>
</ul>
<div class="tb-tip"><b>ポイント</b>: パラメトリックな 3D CAD では、スケッチは単純に保ち、丸みや繰り返しは 3D フィーチャで付けるほうが後から変更しやすくなります。</div>`,
    points: ["トリム・延長で輪郭を閉じる", "オフセット・フィレット・面取り・ミラー・配列は一般的な 2D CAD の代表機能", "3DCAD Studio のスケッチ編集はトリム・コンストラクション・削除", "丸み・対称・繰り返しは 3D フィーチャや拘束 (対称・等値・平行) で実現"],
    exercises: [
      {
        q: "幅 100 mm × 高さ 60 mm の長方形を内側に 5 mm オフセットしました。内側の長方形の寸法は?",
        a: "各辺が 5 mm ずつ内側に寄るので、幅 100 − 2 × 5 = <b>90 mm</b>、高さ 60 − 2 × 5 = <b>50 mm</b>。",
      },
      {
        q: "100 × 60 の長方形の 4 つの角すべてに R10 のフィレットを付けました。直線部分の長さ (長辺・短辺それぞれ) と、外周の長さを求めてください (小数第 1 位まで)。",
        a: "長辺の直線部 = 100 − 2 × 10 = <b>80 mm</b>、短辺の直線部 = 60 − 2 × 10 = <b>40 mm</b>。4 つの 1/4 円弧で 1 周分の円になるので弧の長さ = 2π × 10 ≈ 62.8 mm。外周 = 2 × (80 + 40) + 62.8 ≈ <b>302.8 mm</b> (角が直角なら 320 mm)。",
      },
    ],
    quiz: [
      { q: "左右対称の形状を半分だけ描いて反転させる 2D CAD のコマンドは?", choices: ["ミラー", "尺度", "延長"], answer: 0, explain: "ミラーは対称軸に対する鏡像を作ります。" },
      { q: "3DCAD Studio のスケッチで、はみ出した線を切り取るには?", choices: ["トリム (X)", "オフセット", "配列"], answer: 0, explain: "スケッチの編集機能はトリム・コンストラクション・削除です。" },
      { q: "3DCAD Studio で同じ大きさの穴を複数並べるのに適したのは?", choices: ["スケッチのミラーコマンド", "3D のパターン、または等値拘束", "画層"], answer: 1, explain: "繰り返しは 3D のパターン、大きさをそろえるには等値拘束を使います。" },
      { q: "直角の角に R5 のフィレットを付けたとき、円弧が辺に接する位置は?", choices: ["角から各辺に 5 mm の位置", "角から各辺に 2.5 mm の位置", "角から各辺に 10 mm の位置"], answer: 0, explain: "直角の角では、円弧の中心は両辺から R の距離にあり、接点は角から R の位置になります。" },
    ],
    lessons: ["0-2", "0-4", "3-1"],
  },
  {
    id: "2d-constraints",
    part: "cad2d",
    title: "拘束と寸法でかたちを決める",
    minutes: 20,
    level: 2,
    lead: "パラメトリックなスケッチでは、図形を正確に描くのではなく、拘束と寸法で「決める」ことで形が定まります。自由度を数えて完全拘束を目指しましょう。",
    body: `
<h2>パラメトリック 2D とは</h2>
<p>従来の 2D CAD は描いた座標そのものが形でした。パラメトリックなスケッチでは、おおよその形を描き、<b>幾何拘束</b> (関係) と<b>寸法拘束</b> (数値) を付けると形が確定します。寸法の数値を変えれば形が自動で更新されます。</p>
<h2>幾何拘束の一覧</h2>
<table class="tb-table">
  <tr><th>拘束</th><th>意味</th></tr>
  <tr><td>一致</td><td>2 つの点を同じ位置に (点を線上に)</td></tr>
  <tr><td>水平 / 垂直</td><td>線を X 軸 / Y 軸に平行に</td></tr>
  <tr><td>平行 / 直交</td><td>2 本の線を平行 / 90° に</td></tr>
  <tr><td>正接</td><td>線と円弧 (円弧と円弧) をなめらかに接する</td></tr>
  <tr><td>等値</td><td>長さ・半径を等しく</td></tr>
  <tr><td>同心</td><td>円・円弧の中心を一致</td></tr>
  <tr><td>同一直線上</td><td>2 本の線を同じ直線上に</td></tr>
  <tr><td>中点</td><td>点を線分の中点に</td></tr>
  <tr><td>対称</td><td>2 点 (2 図形) を線に対して対称に</td></tr>
  <tr><td>固定</td><td>位置を動かないように固定</td></tr>
</table>
<h2>自由度 (DOF) の数え方</h2>
<p>平面上で図形が独立に動ける量を<b>自由度</b>といいます。</p>
<table class="tb-table">
  <tr><th>図形</th><th>自由度</th><th>内訳</th></tr>
  <tr><td>点</td><td>2</td><td>x, y</td></tr>
  <tr><td>線分</td><td>4</td><td>両端点 2 × 2</td></tr>
  <tr><td>円</td><td>3</td><td>中心 x, y + 半径</td></tr>
  <tr><td>円弧</td><td>5</td><td>中心 x, y + 半径 + 始点角 + 終点角</td></tr>
</table>
<p>拘束はそれぞれ自由度を減らします (点の一致 −2、水平 −1、寸法 1 つ −1 など)。自由度が 0 になった状態が<b>完全拘束</b>です。</p>
<div class="tb-math">\\begin{aligned} \\text{長方形} &= \\text{線分 4 本}\\ (16) - \\text{角の一致 4}\\ (8) \\\\ &\\quad - \\text{水平 2} - \\text{垂直 2} = \\text{残り 4} \\end{aligned}</div><p>(位置 x, y・幅・高さ)</p>
<p>残り 4 は、幅と高さの寸法、そして 1 つの角を原点に一致させる (−2) ことで 0 になります。</p>
<svg class="tb-chart" viewBox="0 0 520 210" role="img" aria-label="長方形が完全拘束になるまで">
<rect class="k-panel" x="8" y="8" width="246" height="194" rx="8"/><rect class="k-panel" x="266" y="8" width="246" height="194" rx="8"/>
<circle class="k-badge" cx="28" cy="28" r="10" style="fill:var(--tb-warn)"/><text class="k-badge-t" x="28" y="32" text-anchor="middle">4</text><text class="k-title" x="46" y="32">水平・垂直だけ (残り 4)</text>
<circle class="k-badge" cx="286" cy="28" r="10" style="fill:var(--tb-good)"/><text class="k-badge-t" x="286" y="32" text-anchor="middle">0</text><text class="k-title" x="304" y="32">寸法 + 原点一致 (完全拘束)</text>
<rect x="74" y="86" width="110" height="64" style="fill:none;stroke:var(--tb-warn)" stroke-width="2.2" stroke-dasharray="7 4"/>
<rect class="k-edge" x="58" y="74" width="140" height="80" stroke-width="2.2" style="fill:none"/>
<path class="k-move" d="M198,114 L232,114" stroke-width="1.8"/><path class="k-move" d="M128,74 L128,48" stroke-width="1.8"/>
<path class="k-move" d="M58,154 L40,172" stroke-width="1.8"/>
<text class="k-note" x="128" y="186" text-anchor="middle">ドラッグで幅・高さ・位置が変わる</text>
<text class="tick" x="128" y="70" text-anchor="middle">─ 水平</text><text class="tick" x="62" y="118">│ 垂直</text>
<line class="k-thin" x1="300" y1="160" x2="496" y2="160"/><line class="k-thin" x1="320" y1="182" x2="320" y2="48"/>
<rect class="k-edge" x="320" y="80" width="140" height="80" stroke-width="2.6" style="fill:none"/>
<circle cx="320" cy="160" r="4.5" style="fill:var(--tb-good)"/><text class="tick" x="326" y="178">原点に一致 (−2)</text>
<line class="k-ext" x1="320" y1="76" x2="320" y2="54"/><line class="k-ext" x1="460" y1="76" x2="460" y2="54"/>
<line class="k-dimline" x1="320" y1="60" x2="460" y2="60"/><text class="k-dimtext" x="390" y="55" text-anchor="middle">100 (−1)</text>
<line class="k-ext" x1="464" y1="80" x2="490" y2="80"/><line class="k-ext" x1="464" y1="160" x2="490" y2="160"/>
<line class="k-dimline" x1="484" y1="80" x2="484" y2="160"/><text class="k-dimtext" x="480" y="124" text-anchor="end">50 (−1)</text>
<text class="k-good-t" x="390" y="126" text-anchor="middle">✓ 完全拘束</text>
</svg>
<p class="tb-caption">図: 左は形の種類 (長方形) だけ決まり、大きさと位置が自由なまま。右は幅・高さの寸法と角の原点一致で自由度 0 になった状態</p>
<h2>過拘束と従属寸法</h2>
<p>すでに決まっている量にさらに拘束を付けると<b>過拘束</b> (冗長・矛盾) になります。例えば幅 100 の長方形で、左半分 40 と右半分 60 と全幅 100 をすべて寸法拘束にすると 1 つ余計です。
参考として表示したい寸法は<b>従属寸法 (参考寸法)</b> にして、形を決める働きを持たせないようにします。図面では参考寸法を (100) のように括弧で示します。</p>
<h2>式による寸法</h2>
<p>多くのパラメトリック CAD では、寸法に式や変数を使えます (例: 穴の位置 = 幅 / 2)。設計意図を式で表すと、幅を変えても穴が中央に残ります。</p>
<h2>手順例 — 穴付きプレートを完全拘束する</h2>
<ol class="tb-flow">
  <li><b>長方形 (R)</b> を原点から描く。始点を原点にスナップさせると一致拘束が付き、辺には水平・垂直拘束が付く</li>
  <li><b>寸法 (D)</b> で幅 100・高さ 50 を記入する。ここで長方形は自由度 0</li>
  <li><b>円 (C)</b> を内側に描き、寸法で直径 10 を記入する (残り 2: 中心の x, y)</li>
  <li>中心から左辺まで 25、下辺まで 25 の寸法を記入する (または中心と長方形の対角線の中点…のように関係で決める)</li>
  <li>画面下のステータスに「<b>✓ 完全拘束</b>」と出れば完成。「○ 個の寸法/拘束が必要」と出たら、図形をドラッグして動く所を探す</li>
</ol>
<div class="tb-note"><b>練習課題</b>: 上のプレートの左右に穴を 2 つ (中心間 50、高さ方向は中央) 配置し、2 つの円に<b>等値</b>拘束、中心を通る縦の中心線 (コンストラクション。両端を上下の辺の<b>中点</b>に拘束) に対して<b>対称</b>拘束を付けて完全拘束にしてみましょう。寸法は何個で済むか数えてください (幅・高さ・直径・中心間・穴の高さ の 5 個)。</div>
<h2>初心者がつまずきやすい点</h2>
<ul>
  <li><b>寸法を先に全部付ける</b>: 形が大きく崩れることがある。まず幾何拘束で形の性格を決め、大きい寸法から順に入れる</li>
  <li><b>原点に固定しない</b>: 寸法を全部付けても位置の 2 自由度が残る。基準となる点を原点に一致させる</li>
  <li><b>固定拘束の乱用</b>: 固定で自由度を消すと完全拘束に見えるが、設計意図が残らず後で寸法変更ができない</li>
  <li><b>自動拘束の付きすぎ</b>: 意図しない水平・正接が付くと過拘束の原因になる。「拘束を表示」(F8) で確認し、不要なものは削除する</li>
</ul>
<div class="tb-tip"><b>3DCAD Studio では</b>: 寸法 D と拘束 (一致・水平・垂直・平行・直交・正接・等値・同心・同一直線上・中点・対称・固定) が使え、自動拘束で描きながら拘束が付きます。完全拘束になったかどうかが表示されるので、自由度が残っていないか確認しましょう。</div>`,
    points: ["幾何拘束で関係、寸法拘束で大きさを決める", "自由度: 点 2・線分 4・円 3・円弧 5", "自由度 0 = 完全拘束。意図しない変形を防ぐ", "余分な寸法は過拘束。参考寸法 (従属) にする"],
    exercises: [
      {
        q: "円 1 つ (中心は未拘束) を、原点に中心を一致させ、直径寸法 20 を付けました。残りの自由度は?",
        a: "円の自由度 3 − 中心の一致 2 − 直径寸法 1 = <b>0</b>。完全拘束です。",
      },
      {
        q: "線分 1 本に「水平」拘束と長さ寸法 50 を付けました。残りの自由度は? 完全拘束にするには何を追加しますか?",
        a: "4 − 1 (水平) − 1 (長さ) = <b>2</b>。残りは線分全体の位置 (x, y) なので、片方の端点を原点に一致させれば (−2) 完全拘束になります。",
      },
      {
        q: "大きさの違う 2 つの円 (どちらも未拘束) に「同心」拘束を付け、内側の円の直径 20・外側の円の直径 40 を寸法で決めました。残りの自由度はいくつで、何が決まっていませんか?",
        a: "円 2 つで 3 × 2 = 6。同心 −2、直径寸法 2 つで −2 → 残り <b>2</b>。共通の中心の位置 (x, y) が決まっていないので、中心を原点に一致させれば完全拘束です。",
      },
    ],
    quiz: [
      { q: "平面上の円の自由度は?", choices: ["2", "3", "4"], answer: 1, explain: "中心 x, y と半径の 3 つです。" },
      { q: "線と円弧をなめらかにつなぐ拘束は?", choices: ["同心", "正接", "中点"], answer: 1, explain: "正接拘束で接線方向がそろい、なめらかにつながります。" },
      { q: "全幅・左側・右側の 3 つの寸法をすべて付けると起こるのは?", choices: ["完全拘束", "過拘束", "自由度が増える"], answer: 1, explain: "どれか 1 つは他の 2 つから決まるので余分です。参考寸法にします。" },
      { q: "すべての寸法を記入したのに完全拘束にならない。最も考えられる原因は?", choices: ["スケッチ全体の位置 (原点との関係) が決まっていない", "線の色が違う", "寸法の文字が小さい"], answer: 0, explain: "大きさが決まっても位置の自由度 2 が残ることがよくあります。基準点を原点に一致させます。" },
    ],
    lessons: ["0-3", "0-4", "2-2", "2-3"],
  },
  {
    id: "2d-layers",
    part: "cad2d",
    title: "線種・線の太さ・画層 (レイヤ)",
    minutes: 14,
    level: 1,
    lead: "図面の線は種類と太さで意味を伝えます。JIS の線の使い分けと、CAD で線を整理する画層 (レイヤ) の使い方を学びます。",
    body: `
<h2>線の種類と用途 (JIS B 0001 の考え方)</h2>
<svg class="tb-chart" viewBox="0 0 520 202" role="img" aria-label="線種">
<rect class="k-panel" x="8" y="8" width="504" height="186" rx="8"/>
<line x1="26" y1="30" x2="186" y2="30" style="stroke:var(--k-line);stroke-linecap:butt" stroke-width="3.2"/><text class="mark-t" x="202" y="34">太い実線</text><text class="lbl" x="500" y="34" text-anchor="end">外形線</text>
<rect x="14" y="50" width="492" height="30" rx="4" style="fill:var(--tb-surface-2)"/><line x1="26" y1="65" x2="186" y2="65" style="stroke:var(--k-line);stroke-linecap:butt" stroke-width="1.3" stroke-dasharray="9 4"/><text class="mark-t" x="202" y="69">細い破線 (または太い破線)</text><text class="lbl" x="500" y="69" text-anchor="end">かくれ線</text>
<line x1="26" y1="100" x2="186" y2="100" style="stroke:var(--k-line);stroke-linecap:butt" stroke-width="1.3" stroke-dasharray="22 4 3 4"/><text class="mark-t" x="202" y="104">細い一点鎖線</text><text class="lbl" x="500" y="104" text-anchor="end">中心線</text>
<rect x="14" y="120" width="492" height="30" rx="4" style="fill:var(--tb-surface-2)"/><line x1="26" y1="135" x2="186" y2="135" style="stroke:var(--k-line);stroke-linecap:butt" stroke-width="1.3"/><text class="mark-t" x="202" y="139">細い実線</text><text class="lbl" x="500" y="139" text-anchor="end">寸法線・寸法補助線・引出線</text>
<line x1="26" y1="170" x2="186" y2="170" style="stroke:var(--tb-accent);stroke-linecap:butt" stroke-width="1.3" stroke-dasharray="22 4 3 4 3 4"/><text class="mark-t" x="202" y="174">細い二点鎖線</text><text class="lbl" x="500" y="174" text-anchor="end">想像線</text>
</svg>
<table class="tb-table">
  <tr><th>線</th><th>用途</th></tr>
  <tr><td>太い実線</td><td>外形線 (見える部分の形)</td></tr>
  <tr><td>破線</td><td>かくれ線 (見えない部分の形)</td></tr>
  <tr><td>細い一点鎖線</td><td>中心線、基準線、ピッチ線</td></tr>
  <tr><td>細い実線</td><td>寸法線、寸法補助線、引出線、ハッチング</td></tr>
  <tr><td>細い二点鎖線</td><td>想像線 (隣接部品・可動範囲)</td></tr>
</table>
<h2>線の太さ</h2>
<p>太線と細線の太さの比は <b>2 : 1 程度</b>にします。例えば A3・A4 の機械図面では太線 0.5 mm・細線 0.25 mm (または 0.35 / 0.18 mm) がよく使われます。</p>
<h2>画層 (レイヤ) の分け方</h2>
<p>画層は透明なシートを重ねるイメージで、図形を種類ごとに分けて管理する機能です。画層ごとに表示 / 非表示、線種・色・太さを設定できます。</p>
<table class="tb-table">
  <tr><th>画層名 (例)</th><th>内容</th><th>線種</th><th>色 (例)</th></tr>
  <tr><td>外形</td><td>外形線</td><td>実線 (太)</td><td>白 / 黒</td></tr>
  <tr><td>かくれ</td><td>かくれ線</td><td>破線</td><td>黄</td></tr>
  <tr><td>中心</td><td>中心線</td><td>一点鎖線 (細)</td><td>赤</td></tr>
  <tr><td>寸法</td><td>寸法・公差</td><td>実線 (細)</td><td>緑</td></tr>
  <tr><td>文字</td><td>注記・表題欄の文字</td><td>—</td><td>シアン</td></tr>
</table>
<p>画面の色は見分けやすさのためのもので、印刷では黒一色にするのが一般的です。社内でルールを決めてそろえることが大切です。</p>
<h2>印刷尺度と文字高さ</h2>
<p>実寸で描いた図形を 1:2 で印刷すると、文字も半分になります。印刷後に文字高さ 3.5 mm にしたければ、CAD 上では 3.5 × 2 = 7 mm で書く (または注釈尺度の機能を使う) 必要があります。</p>
<table class="tb-table">
  <tr><th>印刷尺度</th><th>印刷後の文字 3.5 mm</th><th>印刷後の文字 5 mm</th><th>印刷後の線の太さ</th></tr>
  <tr><td>1:1</td><td>3.5 mm</td><td>5 mm</td><td>線の太さは印刷設定で指定するので尺度によらない</td></tr>
  <tr><td>1:2</td><td>7 mm</td><td>10 mm</td><td>同上</td></tr>
  <tr><td>1:5</td><td>17.5 mm</td><td>25 mm</td><td>同上</td></tr>
  <tr><td>2:1 (倍尺)</td><td>1.75 mm</td><td>2.5 mm</td><td>同上</td></tr>
</table>
<h2>手順例 — 画層を準備してから描く</h2>
<ol class="tb-flow">
  <li><b>画層を作る</b>: 外形・かくれ・中心・寸法・文字 の 5 つを作り、線種と色を設定する (テンプレートとして保存しておくと毎回の設定が不要)</li>
  <li><b>現在の画層を切り替えて描く</b>: 中心線を描くときは「中心」、外形は「外形」を現在の画層にする</li>
  <li><b>描いた後に確認</b>: 画層を 1 つずつ非表示にして、別の画層に紛れた線がないか確かめる</li>
  <li><b>印刷設定</b>: 色ごと (または画層ごと) に印刷の線の太さを割り当て、黒で印刷する</li>
</ol>
<div class="tb-note"><b>練習課題</b>: φ40 の円と、その中心線 2 本、直径寸法を描き、それぞれ「外形」「中心」「寸法」画層に分けてください。「寸法」画層を非表示にしたときに円と中心線だけが残れば正解です。中心線は円から 3〜5 mm ほどはみ出させます。</div>
<h2>初心者がつまずきやすい点</h2>
<ul>
  <li><b>すべてを 0 画層 (既定) に描く</b>: 後から線種を変えるとき 1 本ずつ選ぶことになる。最初に画層を切り替える習慣をつける</li>
  <li><b>図形ごとに線種・色を直接設定する</b>: 画層の設定と食い違い、印刷で太さがばらばらになる。線種・色は「画層に従う (ByLayer)」にする</li>
  <li><b>破線・一点鎖線が実線に見える</b>: 線種の尺度 (ピッチ) が図形の大きさに合っていない。線種尺度を印刷尺度に合わせる</li>
  <li><b>中心線の扱い</b>: 中心線は外形線から少しはみ出させ、交点は鎖線の長い線分どうしで交わるようにする</li>
</ul>
<div class="tb-tip"><b>3DCAD Studio では</b>: 図面環境で投影ビューを作ると外形線・かくれ線が自動で描き分けられ、円には中心マークが付きます。中心線は「中心線」ツールで追加します。スケッチでは「コンストラクション」で補助線を区別します。</div>`,
    points: ["外形 = 太い実線、かくれ = 破線、中心 = 細い一点鎖線、寸法 = 細い実線", "太線 : 細線 = 2 : 1 程度 (例 0.5 / 0.25 mm)", "画層で外形・かくれ・中心・寸法・文字を分ける", "印刷尺度を考えて文字高さを決める"],
    exercises: [
      {
        q: "1:5 で印刷する図面で、印刷後の文字高さを 5 mm にしたい。CAD 上 (実寸空間) での文字高さは?",
        a: "5 × 5 = <b>25 mm</b>。尺度 1:5 では実寸空間のものが 1/5 に縮んで印刷されるためです。",
      },
      {
        q: "小さな部品を 2:1 (倍尺) で印刷します。印刷後に文字高さ 3.5 mm にするには、CAD 上の文字高さを何 mm にしますか? また太線を 0.5 mm にしたとき、細線は何 mm が目安ですか?",
        a: "倍尺では 2 倍に拡大して印刷されるので 3.5 / 2 = <b>1.75 mm</b>。細線は太線の半分程度で <b>0.25 mm</b> (線の太さは印刷設定で決まり、尺度には関係しません)。",
      },
    ],
    quiz: [
      { q: "中心線に使う線は?", choices: ["太い実線", "細い一点鎖線", "細い二点鎖線"], answer: 1, explain: "中心線は細い一点鎖線です。二点鎖線は想像線に使います。" },
      { q: "太線 0.5 mm に対して細線として適切なのは?", choices: ["0.25 mm", "0.5 mm", "1.0 mm"], answer: 0, explain: "太線と細線の比は 2:1 程度です。" },
      { q: "画層を使う主な目的は?", choices: ["図形を種類ごとに管理し、表示や線種を一括で設定する", "ファイルを圧縮する", "3D 形状を作る"], answer: 0, explain: "画層で表示 / 非表示、線種、色などをまとめて管理できます。" },
      { q: "隣接する部品や可動範囲を示す「想像線」に使う線は?", choices: ["細い二点鎖線", "細い破線", "太い実線"], answer: 0, explain: "想像線は細い二点鎖線です。破線はかくれ線、太い実線は外形線に使います。" },
    ],
    lessons: ["0-4", "0-6"],
  },
  {
    id: "2d-drawing-workflow",
    part: "cad2d",
    title: "2D 図面の作図手順 — 三面図を描く",
    minutes: 20,
    level: 2,
    lead: "図面は決まった順序で描くと、投影のずれや寸法の記入もれを防げます。第三角法の三面図の対応関係と、L 形ブロックの例題で手順を確認します。",
    body: `
<h2>作図の手順</h2>
<ol class="tb-flow">
  <li><b>図枠・表題欄</b> — 用紙サイズ (A4・A3)、尺度、図番、品名、材料、投影法</li>
  <li><b>中心線・基準線</b> — 各ビューの配置を決める</li>
  <li><b>正面図の外形</b> — 形の特徴が最もよく表れる方向を正面にする</li>
  <li><b>投影</b> — 正面図から作図線 (補助線) を延ばして平面図・側面図を対応させて描く</li>
  <li><b>かくれ線</b> — 見えない穴・段差を破線で描く (必要なものだけ)</li>
  <li><b>寸法</b> — 加工・検査に必要な寸法を重複なく</li>
  <li><b>注記・表面性状</b> — 面取り指示、表面性状、公差、一般公差</li>
  <li><b>チェック</b> — 投影の対応、寸法もれ・重複、表題欄</li>
</ol>
<h2>第三角法の三面図</h2>
<p>日本の機械製図 (JIS) では主に<b>第三角法</b>を使います。正面図の<b>上に平面図</b>、<b>右に右側面図</b>を置きます。</p>
<svg class="tb-chart" viewBox="0 0 520 254" role="img" aria-label="第三角法の三面図の対応">
<line class="k-thin" x1="60" y1="86" x2="60" y2="106" stroke-dasharray="4 3"/><line class="k-thin" x1="120" y1="86" x2="120" y2="106" stroke-dasharray="4 3"/><line class="k-thin" x1="240" y1="86" x2="240" y2="181" stroke-dasharray="4 3"/>
<line class="k-thin" x1="120" y1="106" x2="300" y2="106" stroke-dasharray="4 3"/><line class="k-thin" x1="240" y1="181" x2="300" y2="181" stroke-dasharray="4 3"/><line class="k-thin" x1="240" y1="226" x2="300" y2="226" stroke-dasharray="4 3"/>
<line class="k-thin" x1="240" y1="26" x2="360" y2="26" stroke-dasharray="4 3"/><line class="k-thin" x1="240" y1="86" x2="300" y2="86" stroke-dasharray="4 3"/>
<line class="k-thin" x1="300" y1="86" x2="300" y2="106" stroke-dasharray="4 3"/><line class="k-thin" x1="360" y1="26" x2="360" y2="106" stroke-dasharray="4 3"/>
<line class="k-center" x1="292" y1="94" x2="368" y2="18"/><text class="k-note" x="336" y="72">45°</text>
<g class="k-shadow">
<rect class="k-alu" x="60" y="26" width="180" height="60" stroke-width="2.4"/>
<path class="k-alu" d="M60,226 L240,226 L240,181 L120,181 L120,106 L60,106 Z" stroke-width="2.4"/>
<rect class="k-alu" x="300" y="106" width="60" height="120" stroke-width="2.4"/>
</g>
<line class="k-edge" x1="120" y1="26" x2="120" y2="86" stroke-width="2.4"/><line class="k-edge" x1="300" y1="181" x2="360" y2="181" stroke-width="2.4"/>
<text class="lbl" x="150" y="19" text-anchor="middle">平面図 (上から)</text>
<text class="lbl" x="150" y="244" text-anchor="middle">正面図</text>
<text class="lbl" x="330" y="244" text-anchor="middle">右側面図</text>
<g class="k-shadow">
<polygon class="k-part" points="427.4,89.2 474.1,116.2 497.5,102.8 450.8,75.8" style="fill:var(--k-steel-1)"/><polygon class="k-part" points="404,42 427.4,55.5 450.8,42 427.4,28.5" style="fill:var(--k-steel-1)"/>
<polygon class="k-part" points="427.4,89.2 450.8,75.8 450.8,42 427.4,55.5" style="fill:var(--k-steel-3)"/><polygon class="k-part" points="474.1,136.5 497.5,123 497.5,102.8 474.1,116.2" style="fill:var(--k-steel-3)"/>
<polygon class="k-part" points="404,96 474.1,136.5 474.1,116.2 427.4,89.2 427.4,55.5 404,42" style="fill:var(--k-steel-2)"/>
</g>
<text class="k-note" x="450.8" y="152" text-anchor="middle">立体 (見取図)</text>
<text class="mark-t" x="376" y="178" style="font-size:11.5px">長さ: 正面図 = 平面図</text>
<text class="mark-t" x="376" y="200" style="font-size:11.5px">高さ: 正面図 = 側面図</text>
<text class="mark-t" x="376" y="222" style="font-size:11.5px">幅 (奥行): 平面図 = 側面図</text>
</svg>
<table class="tb-table">
  <tr><th>そろう寸法</th><th>ビューの組</th><th>並び方</th></tr>
  <tr><td>長さ (左右)</td><td>正面図と平面図</td><td>上下に並び、左右の位置が一致</td></tr>
  <tr><td>高さ</td><td>正面図と側面図</td><td>左右に並び、高さの位置が一致</td></tr>
  <tr><td>幅 (奥行)</td><td>平面図と側面図</td><td>45° の作図線などで受け渡す</td></tr>
</table>
<h2>例題: L 形ブロック</h2>
<p>長さ 60 × 高さ 40 × 奥行 30 mm。左側に厚さ 20 mm の立ち上がり、底部の厚さ 15 mm の L 形ブロック (上図)。</p>
<ul>
  <li><b>正面図</b>: L 形の輪郭。外形 60 × 40、段差の角は (20, 15) の位置</li>
  <li><b>平面図</b>: 60 × 30 の長方形。上から見ると立ち上がりの上面と底部の上面の境目 (左から 20 mm) に線が見える</li>
  <li><b>右側面図</b>: 30 × 40 の長方形。右から見ると底部の上面 (高さ 15 mm) の稜線が見えるので実線で描く</li>
</ul>
<h2>用紙と尺度の決め方</h2>
<p>三面図を並べたときの全体の大きさを先に見積もります。横幅 ≈ 正面図の長さ + 間隔 + 側面図の奥行、縦 ≈ 平面図の奥行 + 間隔 + 正面図の高さ です。これが用紙の図枠の内側 (A4 横で約 277 × 190 mm、A3 横で約 400 × 277 mm) に、寸法を書く余白を残して収まる尺度を選びます。尺度は JIS の推奨尺度 (1:1、1:2、1:5、1:10、2:1、5:1 など) から選びます。</p>
<div class="tb-note"><b>練習課題</b>: 上の L 形ブロックの奥行側に、上から φ10 の貫通穴 (立ち上がりの中央、平面図で左から 10・奥から 15 の位置) を追加し、三面図を描き直してください。平面図には円、正面図と側面図には<b>かくれ線 2 本と中心線</b>が増えます。</div>
<h2>提出前のチェックリスト</h2>
<table class="tb-table">
  <tr><th>項目</th><th>確認すること</th></tr>
  <tr><td>投影</td><td>長さ・高さ・奥行の対応がずれていないか。第三角法の記号を表題欄に示したか</td></tr>
  <tr><td>寸法</td><td>加工・検査に必要な寸法がそろっているか。同じ寸法を 2 か所に書いていないか</td></tr>
  <tr><td>線</td><td>外形は太線、寸法・中心は細線。不要なかくれ線を描き込みすぎていないか</td></tr>
  <tr><td>表題欄</td><td>図番・品名・材料・尺度・作成者・日付</td></tr>
  <tr><td>注記</td><td>指示のない面取り、普通公差 (JIS B 0405 の等級)、表面処理</td></tr>
</table>
<h2>初心者がつまずきやすい点</h2>
<ul>
  <li><b>第一角法と混同する</b>: 平面図を正面図の下に置くと第一角法になり、読み手が逆に解釈する</li>
  <li><b>ビューごとにばらばらに描く</b>: 作図線で投影しないと、高さや奥行が少しずつずれる</li>
  <li><b>寸法を 1 つのビューに集めすぎる / 散らばらせすぎる</b>: 形の特徴が表れるビューに、関係する寸法をまとめて書く</li>
  <li><b>かくれ線への寸法</b>: 原則として避ける。必要なら断面図にして外形線に寸法を入れる</li>
</ul>
<div class="tb-tip"><b>3DCAD Studio では</b>: 3D モデルを作ってから図面環境で基準ビューと投影ビューを配置すると、三面図の対応は自動で保たれます。寸法・注記・表面性状・表題欄を加え、PDF / DXF / SVG で出力できます。</div>`,
    points: ["図枠 → 中心線 → 正面図 → 投影 → かくれ線 → 寸法 → 注記 → チェック", "第三角法: 正面図の上に平面図、右に右側面図", "長さ・高さ・幅の 3 つの対応を作図線で守る", "正面図は形の特徴が最もよく表れる方向を選ぶ"],
    exercises: [
      {
        q: "上の L 形ブロックの右側面図で、底部上面を表す稜線は下端から何 mm の高さに描きますか? また実線と破線のどちらですか?",
        a: "底部の厚さ = <b>15 mm</b> の高さ。右側から見ると底部の上面と立ち上がり部の面の境目は手前に見えている稜線なので<b>実線</b>で描きます (立ち上がりは左側にあり、底部上面が右から見える)。",
      },
      {
        q: "長さ 240 × 高さ 80 × 奥行 120 mm のブロックの三面図 (正面図・平面図・右側面図、ビューの間隔 20 mm) を描きます。1:1 で描いたときに必要な範囲 (横 × 縦) を求め、A4 横 (図枠内 約 277 × 190 mm) と A3 横 (約 400 × 277 mm) のどちらに収まるか答えてください。",
        a: "横 = 240 + 20 + 120 = <b>380 mm</b>、縦 = 120 + 20 + 80 = <b>220 mm</b>。A4 には入らないので <b>A3 横 (1:1)</b>。A4 に収めたいなら 1:2 にして 190 × 110 mm とします。",
      },
    ],
    quiz: [
      { q: "第三角法で平面図を置く位置は?", choices: ["正面図の上", "正面図の下", "正面図の左"], answer: 0, explain: "第三角法では上から見た図を正面図の上に置きます (第一角法では下)。" },
      { q: "正面図と右側面図でそろうのは?", choices: ["長さ", "高さ", "奥行"], answer: 1, explain: "左右に並ぶ正面図と側面図は高さがそろいます。" },
      { q: "寸法を記入するのはどの段階?", choices: ["図枠より前", "投影・かくれ線を描いた後", "表題欄を書く前の最初"], answer: 1, explain: "形を描き終えてから、加工に必要な寸法を記入します。" },
      { q: "平面図と右側面図でそろう寸法は?", choices: ["高さ", "長さ", "奥行 (幅)"], answer: 2, explain: "平面図と側面図は奥行が対応し、45° の作図線などで受け渡します。" },
    ],
    lessons: ["0-6", "6-1"],
  },
  {
    id: "2d-to-3d",
    part: "cad2d",
    title: "2D から 3D へ — スケッチ・読図・図面化",
    minutes: 15,
    level: 1,
    lead: "2D で描いた図形は 3D CAD のスケッチになり、押し出しや回転で立体になります。三面図から立体を想像する読図と、3D から図面を作る流れを学びます。",
    body: `
<h2>2D の図形 = 3D のスケッチ</h2>
<p>3D CAD のほとんどの立体は、平面に描いた<b>スケッチ</b> (閉じた輪郭) から作られます。2D CAD で学んだ座標・作図・拘束は、そのままスケッチで使えます。</p>
<table class="tb-table">
  <tr><th>スケッチ</th><th>3D 操作</th><th>できる立体</th></tr>
  <tr><td>長方形</td><td>押し出し</td><td>直方体 (板・ブロック)</td></tr>
  <tr><td>円</td><td>押し出し</td><td>円柱 (軸・ピン)</td></tr>
  <tr><td>L 形の輪郭</td><td>押し出し</td><td>L 形ブロック・アングル</td></tr>
  <tr><td>軸の半断面 + 中心線</td><td>回転</td><td>段付き軸・プーリー</td></tr>
</table>
<p>押し出しは<b>どの方向から見ても同じ断面</b>の形、回転は<b>軸対称</b>の形に向いています。三面図を見て、断面が一定の方向があれば押し出し、円が並んでいれば回転と考えるとよいでしょう。</p>
<svg class="tb-chart" viewBox="0 0 520 206" role="img" aria-label="押し出しと回転のスケッチ">
<rect class="k-panel" x="8" y="8" width="246" height="190" rx="8"/><rect class="k-panel" x="266" y="8" width="246" height="190" rx="8"/>
<circle class="k-badge" cx="28" cy="28" r="10" style="fill:var(--tb-accent)"/><text class="k-badge-t" x="28" y="32" text-anchor="middle">1</text><text class="k-title" x="46" y="32">押し出し: L 形の輪郭</text>
<circle class="k-badge" cx="286" cy="28" r="10" style="fill:var(--tb-accent)"/><text class="k-badge-t" x="286" y="32" text-anchor="middle">2</text><text class="k-title" x="304" y="32">回転: 段付き軸の半断面</text>
<path d="M30,170 L110,170 L110,150 L60,150 L60,110 L30,110 Z" style="fill:var(--tb-accent);fill-opacity:0.18;stroke:var(--tb-accent)" stroke-width="2.2"/>
<path class="k-move" d="M120,140 L146,122" stroke-width="2"/>
<g class="k-shadow">
<polygon class="k-part" points="150,104 180,104 200,90 170,90" style="fill:var(--k-steel-1)"/>
<polygon class="k-part" points="180,144 230,144 250,130 200,130" style="fill:var(--k-steel-1)"/>
<polygon class="k-part" points="180,104 200,90 200,130 180,144" style="fill:var(--k-steel-3)"/>
<polygon class="k-part" points="230,164 250,150 250,130 230,144" style="fill:var(--k-steel-3)"/>
<polygon class="k-part" points="150,164 230,164 230,144 180,144 180,104 150,104" style="fill:var(--k-steel-2)"/>
</g>
<text class="k-note" x="130" y="190" text-anchor="middle">断面が一定 → 押し出し</text>
<line class="k-center" x1="284" y1="140" x2="402" y2="140"/>
<path d="M290,140 L290,108 L326,108 L326,124 L392,124 L392,140 Z" style="fill:var(--tb-accent);fill-opacity:0.18;stroke:var(--tb-accent)" stroke-width="2.2"/>
<text class="tick" x="290" y="158">回転軸 (中心線)</text>
<path class="k-move" d="M402,112 A14,14 0 1 1 402,134" stroke-width="1.8"/>
<g class="k-shadow">
<rect class="k-part" x="420" y="72" width="22" height="64" rx="2" style="fill:var(--k-steel-2)"/>
<rect class="k-part" x="442" y="88" width="54" height="32" rx="2" style="fill:var(--k-steel-2)"/>
<ellipse cx="420" cy="104" rx="6" ry="32" style="fill:var(--k-steel-1);stroke:var(--k-line)" stroke-width="1.4"/>
</g>
<line class="k-center" x1="410" y1="104" x2="504" y2="104"/>
<text class="k-note" x="390" y="190" text-anchor="middle">軸対称 → 半断面を 360° 回転</text>
</svg>
<p class="tb-caption">図: 押し出しは「どこで切っても同じ断面」、回転は「軸を含む断面 (半断面) が 1 つ」で形が決まる。回転の輪郭は軸をまたがない</p>
<h2>手順例 — 3DCAD Studio でスケッチから立体へ</h2>
<ol class="tb-flow">
  <li><b>2D スケッチ (S)</b> を選び、XY 平面などの平面 (または立体の平らな面) をクリックしてスケッチを開始する</li>
  <li>線分・長方形・円などで<b>閉じた輪郭</b>を描き、寸法と拘束で完全拘束にする</li>
  <li><b>スケッチを終了</b> (Ctrl+Enter) して 3D モデルに戻る</li>
  <li><b>押し出し (E)</b> で輪郭を選び、深さを入力する。軸対称なら中心線を軸にして<b>回転</b>を使う</li>
  <li>穴・フィレット・面取りなどのフィーチャを追加し、最後に図面ビューを作る</li>
</ol>
<div class="tb-note"><b>練習課題</b>: 「2D CAD とは」の章で描いた 60 × 40 の板 (φ20 の穴) を、スケッチで描いて厚さ 10 で押し出してください。体積は 60 × 40 × 10 − π × 10² × 10 ≈ 24 000 − 3 142 ≈ 20 858 mm³ です。iProperties で鋼の質量 (約 164 g) と比べてみましょう。</div>
<h2>初心者がつまずきやすい点</h2>
<table class="tb-table">
  <tr><th>症状</th><th>原因</th><th>対策</th></tr>
  <tr><td>押し出しで輪郭を選べない</td><td>輪郭が閉じていない (端点のずれ・すき間)</td><td>端点を一致拘束でつなぐ。トリムで余分な線を消す</td></tr>
  <tr><td>思った部分が押し出されない</td><td>線が交差して領域が分かれている</td><td>交差部をトリムし、1 つの領域にする</td></tr>
  <tr><td>回転でエラーになる</td><td>輪郭が回転軸をまたいでいる</td><td>軸の片側だけに半断面を描く</td></tr>
  <tr><td>中心線まで立体になる</td><td>補助線がコンストラクションになっていない</td><td>中心線をコンストラクションに切り替える</td></tr>
</table>
<h2>読図の練習 — 三面図から立体を想像する</h2>
<ol class="tb-flow">
  <li>正面図で全体の形 (外形) をつかむ</li>
  <li>平面図・側面図の同じ位置の線を対応させ、段差や穴の奥行を確かめる</li>
  <li>破線 (かくれ線) から内部の穴や溝を読む</li>
  <li>頭の中で立体を組み立て、もう一度各ビューに戻して矛盾がないか確かめる</li>
</ol>
<div class="tb-note">例: 正面図が円、平面図と側面図が長方形 → 円柱を横向きに置いた形 (正面に端面が見える)。正面図が L 形、平面図と側面図が長方形に線 1 本 → L 形ブロック。</div>
<h2>3D から図面を自動作成する</h2>
<p>3D CAD では、モデルから投影図を自動で作れます。形を変えると図面のビューも更新されるので、2D で一から描くより修正に強くなります。寸法や注記は、製作に必要なものを設計者が選んで記入します (自動寸法は出発点として使い、必ず確認します)。</p>
<h2>DXF をスケッチとして読み込む</h2>
<p>既存の 2D 図面 (DXF) を 3D のスケッチに取り込み、押し出せば立体化できます。読み込んだ図形の端点が一致しているか、不要な線 (寸法・文字) が混ざっていないかを確認しましょう。</p>
<div class="tb-tip"><b>3DCAD Studio では</b>: DXF をインポートしてスケッチにし、押し出し・回転で立体にできます。逆にスケッチを右クリックして DXF 書き出しすれば、レーザー加工用の外形データになります。図面環境では基準・投影・断面・詳細ビューと自動寸法が使えます。</div>`,
    points: ["2D の閉じた輪郭が 3D のスケッチになる", "断面一定なら押し出し、軸対称なら回転", "読図は正面図 → 対応する線 → かくれ線 の順に確かめる", "3D から図面を作ると形状変更に図面が追従する"],
    exercises: [
      {
        q: "直径 40 mm・長さ 30 mm の部分と、直径 20 mm・長さ 50 mm の部分からなる段付き軸を回転で作ります。半断面スケッチの輪郭の外形寸法 (軸方向 × 半径方向) は?",
        a: "軸方向の長さ = 30 + 50 = <b>80 mm</b>。半径方向の最大値 = 40 / 2 = <b>20 mm</b>。中心線を回転軸にして、半径 20 (長さ 30) と半径 10 (長さ 50) の段の付いた輪郭を描き、360° 回転させます。",
      },
      {
        q: "60 × 40 mm の長方形の中央に φ20 の円がある 2D 輪郭を、厚さ 10 mm で押し出しました。体積 (mm³) と、鋼 (密度 7.85 g/cm³) としたときの質量を求めてください。",
        a: "体積 = 60 × 40 × 10 − π × 10² × 10 = 24 000 − 3 141.6 ≈ <b>20 858 mm³</b> (= 20.86 cm³)。質量 = 20.86 × 7.85 ≈ <b>164 g</b>。円が穴として抜けるのは、長方形と円で囲まれた領域を選んで押し出したためです。",
      },
    ],
    quiz: [
      { q: "段付き軸のような軸対称形状に向いた 3D 操作は?", choices: ["押し出し", "回転", "トリム"], answer: 1, explain: "軸対称な形は半断面を中心線まわりに回転させて作ります。" },
      { q: "正面図が円、平面図と側面図が長方形の立体は?", choices: ["球", "円柱", "円すい"], answer: 1, explain: "一方向から円、他方向から長方形に見えるのは円柱です。" },
      { q: "3D モデルから図面を作る利点は?", choices: ["形状を変えると図面のビューも更新される", "寸法を一切確認しなくてよい", "表題欄が不要になる"], answer: 0, explain: "ビューはモデルと連動します。ただし寸法・注記の確認は設計者の責任です。" },
      { q: "スケッチを押し出そうとしたら輪郭が選べなかった。最も考えられる原因は?", choices: ["輪郭が閉じていない (端点がずれている)", "寸法の数値が大きすぎる", "スケッチ平面が XY 平面だった"], answer: 0, explain: "押し出しには閉じた輪郭が必要です。端点を一致拘束でつなぎ、余分な線をトリムします。" },
    ],
    lessons: ["0-5", "0-6", "2-1", "3-1", "6-1"],
  },
];
