import type { TextChapter } from "../types";

export const DESIGN2: TextChapter[] = [
  {
    id: "design-process",
    part: "design",
    title: "【初級】プロダクトデザインの進め方",
    minutes: 18,
    level: 1,
    lead: "製品のデザインは、いきなり形を描くところから始まるわけではありません。調べ、考え、描き、作って確かめ、量産できるデータに仕上げるまでの流れと、デザイナーと設計者がどこで協力するのかを学びます。",
    body: `
<h2>全体の流れ</h2>
<ol class="tb-flow">
  <li><b>リサーチ</b>: 使う人・使う場面・競合製品・技術や価格の制約を調べる</li>
  <li><b>コンセプト</b>: 「誰の・どんな問題を・どう解くか」を一文で言える形にまとめる</li>
  <li><b>アイデアスケッチ</b>: 短時間で多くの案を描き、方向性を広げる</li>
  <li><b>レンダリング</b>: 有望な案を、色・素材・光まで含めて具体的に描く</li>
  <li><b>モックアップ</b>: 発泡材や 3D プリントで実寸の模型を作り、手に持って確かめる</li>
  <li><b>3D データ</b>: 意匠を守りながら、構造・成形・組立を満たす 3D CAD データにする</li>
  <li><b>量産</b>: 金型・試作 (T0, T1 …)・色見本の承認を経て生産へ</li>
</ol>
<p>流れは一方通行ではありません。モックアップで持ちにくいとわかればスケッチに戻る、といった<b>行き来 (反復)</b> が前提です。後の工程ほど変更のコストは大きくなるので、問題は早く見つけるほど得です。</p>
<svg class="tb-chart" viewBox="0 0 520 190" role="img" aria-label="工程と変更コスト">
<line class="grid" x1="60" y1="60" x2="500" y2="60"/><line class="grid" x1="60" y1="110" x2="500" y2="110"/><rect x="356" y="18" width="150" height="142" style="fill:var(--tb-bad)" opacity="0.07"/><path d="M70,155 C200,152 320,140 380,110 C430,85 470,50 495,25 L495,160 L70,160 Z" style="fill:var(--tb-accent)" opacity="0.14"/><path d="M70,155 C200,152 320,140 380,110 C430,85 470,50 495,25" fill="none" style="stroke:var(--tb-accent)" stroke-width="3"/><line class="axis" x1="60" y1="160" x2="500" y2="160"/><line class="axis" x1="60" y1="160" x2="60" y2="18"/><text class="lbl" x="66" y="30">変更のコスト</text><circle cx="90" cy="155" r="4.5" style="fill:var(--tb-surface);stroke:var(--tb-accent)" stroke-width="2"/><text class="tick" x="90" y="178" text-anchor="middle">リサーチ</text><circle cx="170" cy="152.5" r="4.5" style="fill:var(--tb-surface);stroke:var(--tb-accent)" stroke-width="2"/><text class="tick" x="170" y="178" text-anchor="middle">スケッチ</text><circle cx="245" cy="148" r="4.5" style="fill:var(--tb-surface);stroke:var(--tb-accent)" stroke-width="2"/><text class="tick" x="245" y="178" text-anchor="middle">模型</text><circle cx="320" cy="135" r="4.5" style="fill:var(--tb-surface);stroke:var(--tb-accent)" stroke-width="2"/><text class="tick" x="320" y="178" text-anchor="middle">3D データ</text><circle cx="390" cy="104" r="4.5" style="fill:var(--tb-surface);stroke:var(--tb-accent)" stroke-width="2"/><text class="tick" x="390" y="178" text-anchor="middle" style="fill:var(--tb-bad);font-weight:700">金型</text><circle cx="465" cy="62" r="4.5" style="fill:var(--tb-surface);stroke:var(--tb-accent)" stroke-width="2"/><text class="tick" x="465" y="178" text-anchor="middle">量産後</text><text class="mark-t" x="250" y="84" text-anchor="middle">金型を作った後の変更は高くつく</text><path class="k-force" d="M352,90 C368,92 378,98 384,102" stroke-width="1.8"/><text class="k-bad-t" x="431" y="152" text-anchor="middle">変更が高価</text>
</svg>
<h2>デザインブリーフ</h2>
<p>プロジェクトの最初に、関係者で合意する短い文書が<b>デザインブリーフ</b>です。後で判断に迷ったときの拠り所になります。</p>
<table class="tb-table">
  <tr><th>項目</th><th>例 (卓上 LED ライト)</th></tr>
  <tr><td>目的・背景</td><td>在宅ワークの机上で、目が疲れにくい照明を提供する</td></tr>
  <tr><td>対象ユーザ</td><td>狭い机で作業する 20〜40 代</td></tr>
  <tr><td>必須要件</td><td>設置面積 A5 以内、USB 給電、無段階調光</td></tr>
  <tr><td>ブランド・印象</td><td>静か・軽やか・既存シリーズと調和</td></tr>
  <tr><td>制約</td><td>目標売価、材料 (ABS + アルミ)、発売時期</td></tr>
  <tr><td>評価方法</td><td>ユーザテスト、コスト見積、デザインレビューで判定</td></tr>
</table>
<svg class="tb-chart" viewBox="0 0 520 186" role="img" aria-label="発散と収束">
<defs><linearGradient id="dz-dd1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eef2f6"/><stop offset="1" stop-color="#c9d3de"/></linearGradient></defs><g class="k-shadow"><path class="k-alu" d="M30,85 L140,25 L250,85 L140,145 Z"/><path class="k-accent" d="M270,85 L380,25 L490,85 L380,145 Z" opacity="0.85"/></g><circle cx="40" cy="82.9" r="3" style="fill:var(--k-line-2)" opacity="0.75"/><circle cx="55.4" cy="85.9" r="3" style="fill:var(--k-line-2)" opacity="0.75"/><circle cx="70.8" cy="80.7" r="3" style="fill:var(--k-line-2)" opacity="0.75"/><circle cx="116.9" cy="54.7" r="3" style="fill:var(--k-line-2)" opacity="0.75"/><circle cx="132.3" cy="45" r="3" style="fill:var(--k-line-2)" opacity="0.75"/><circle cx="147.7" cy="112.7" r="3" style="fill:var(--k-line-2)" opacity="0.75"/><circle cx="209.2" cy="84" r="3" style="fill:var(--k-line-2)" opacity="0.75"/><circle cx="224.6" cy="91.9" r="3" style="fill:var(--k-line-2)" opacity="0.75"/><circle cx="240" cy="84.8" r="3" style="fill:var(--k-line-2)" opacity="0.75"/><circle cx="280" cy="86.1" r="3" style="fill:#ffffff" opacity="0.75"/><circle cx="295.4" cy="77.9" r="3" style="fill:#ffffff" opacity="0.75"/><circle cx="310.8" cy="89.4" r="3" style="fill:#ffffff" opacity="0.75"/><circle cx="387.7" cy="49.2" r="3" style="fill:#ffffff" opacity="0.75"/><circle cx="449.2" cy="69.6" r="3" style="fill:#ffffff" opacity="0.75"/><circle cx="464.6" cy="92.5" r="3" style="fill:#ffffff" opacity="0.75"/><circle cx="480" cy="84.8" r="3" style="fill:#ffffff" opacity="0.75"/><circle cx="260" cy="85" r="7" style="fill:var(--tb-warn);stroke:var(--tb-surface)" stroke-width="2"/><text class="k-note" x="260" y="160" text-anchor="middle">ブリーフ</text><path class="k-thin" d="M260,94 L260,148"/><text class="lbl" x="140" y="80" text-anchor="middle">課題を探る</text><text class="tick" x="140" y="98" text-anchor="middle">リサーチ → ブリーフ</text><text class="lbl" x="380" y="80" text-anchor="middle" style="fill:#ffffff">解を探る</text><text class="tick" x="380" y="98" text-anchor="middle" style="fill:#eef4ff">スケッチ → 決定案</text><path class="k-move" d="M44,162 L118,162" style="stroke:var(--tb-text-3);marker-end:url(#k-arrow)" stroke-width="1.4"/><text class="tick" x="85" y="178" text-anchor="middle">発散</text><text class="tick" x="195" y="178" text-anchor="middle">収束</text><text class="tick" x="325" y="178" text-anchor="middle">発散</text><text class="tick" x="435" y="178" text-anchor="middle">収束</text>
</svg>
<p class="tb-caption">図: 「広げてから絞る」を課題と解決策の 2 回くり返す考え方 (ダブルダイヤモンド)</p>
<h2>デザイナーと設計者の協働</h2>
<table class="tb-table">
  <tr><th>段階</th><th>デザイナーの主な役割</th><th>設計者の主な役割</th></tr>
  <tr><td>リサーチ・コンセプト</td><td>ユーザ理解、体験の提案</td><td>技術的な実現性、部品レイアウトの制約を共有</td></tr>
  <tr><td>スケッチ・模型</td><td>形・比率・操作性の検討</td><td>内部部品の寸法 (基板・電池) を「箱」で示す</td></tr>
  <tr><td>3D データ</td><td>外観面 (意匠面) の品質を確認</td><td>肉厚・勾配・リブ・ボス・組立を作り込む</td></tr>
  <tr><td>量産</td><td>色・質感・外観品質の承認</td><td>金型・公差・検査の詰め</td></tr>
</table>
<div class="tb-note">うまくいくコツは、設計者が早い段階で<b>内部レイアウトの最小寸法 (パッケージ)</b> を示し、デザイナーが<b>譲れない意匠ポイント</b>を明確にすることです。互いの「譲れない」と「調整できる」を言葉にしておくと、後工程の対立が減ります。</div>
<div class="tb-tip"><b>3DCAD Studio</b>: 内部部品を簡単な箱でモデル化し、その外側に外観をロフトやフィレットで作ると、「中身が入るか」を確かめながら形を検討できます。モックアップは 3D プリントチェックの後、STL/3MF 書き出しで出力しましょう。</div>`,
    points: ["リサーチ → コンセプト → スケッチ → レンダリング → モックアップ → 3D データ → 量産、ただし反復が前提", "後工程ほど変更コストが大きいので、問題は早く見つける", "デザインブリーフで目的・ユーザ・要件・制約・評価方法を合意する", "設計者は内部パッケージを早く示し、デザイナーは譲れない意匠点を明確にする"],
    exercises: [
      {
        q: "電動歯ブラシの新製品について、デザインブリーフの「必須要件」と「制約」を 2 つずつ挙げてください。",
        a: "例: 必須要件 — 防水 (IPX7 相当)、片手で握れる太さ (直径 25〜30 mm 程度)。制約 — 既存の充電台と互換、目標原価以内。<br>必須要件は<b>製品が満たすべき性能・体験</b>、制約は<b>コスト・時期・既存資産など外から決まる条件</b>と分けて書くと整理しやすくなります。",
      },
    ],
    quiz: [
      { q: "デザインブリーフの主な目的は?", choices: ["最終の外観図を決める", "目的・ユーザ・要件・制約を関係者で合意する", "金型の発注書を作る"], answer: 1, explain: "ブリーフはプロジェクトの判断の拠り所となる合意文書です。" },
      { q: "変更のコストが最も大きくなりやすいのは?", choices: ["アイデアスケッチの段階", "モックアップの段階", "金型製作後"], answer: 2, explain: "金型ができた後の形状変更は、金型修正や作り直しが必要で高くつきます。" },
      { q: "デザイナーと設計者の協働で、設計者が早い段階に示すとよいものは?", choices: ["内部部品の最小寸法 (パッケージ)", "製品の色見本", "広告のコピー"], answer: 0, explain: "中身の最小寸法がわかると、デザイナーは無理のない外形を検討できます。" },
    ],
    lessons: ["1-1"],
  },
  {
    id: "sketching",
    part: "design",
    title: "【初級】アイデアスケッチとレンダリング",
    minutes: 20,
    level: 1,
    lead: "スケッチは、頭の中の形を素早く外に出し、人と共有するための道具です。透視図法・楕円・陰影の基本を押さえれば、立体らしいスケッチが描けるようになります。3D CAD からのレンダリングまで含めて学びます。",
    body: `
<h2>透視図法 — 1 点透視と 2 点透視</h2>
<p>遠くのものほど小さく見え、平行な線は<b>消失点</b>に集まります。消失点は目の高さの水平線 (<b>アイレベル</b>) の上にあります。</p>
<svg class="tb-chart" viewBox="0 0 520 230" role="img" aria-label="1点透視と2点透視">
<rect class="k-panel" x="8" y="8" width="248" height="214" rx="8"/><rect class="k-panel" x="264" y="8" width="248" height="214" rx="8"/><line class="guide" x1="16" y1="62" x2="248" y2="62"/><text class="tick" x="20" y="56">アイレベル</text><line class="guide" x1="272" y1="112" x2="504" y2="112"/><path class="k-thin" d="M70,110 L130,62 L150,110 M70,180 L130,62 M150,180 L130,62"/><g class="k-shadow"><polygon points="70,110 150,110 142.4,91.8 92.8,91.8" style="fill:var(--k-steel-1);stroke:var(--k-line)" stroke-width="1.6" stroke-linejoin="round"/><polygon points="70,110 150,110 150,180 70,180" style="fill:var(--k-steel-2);stroke:var(--k-line)" stroke-width="1.6" stroke-linejoin="round"/></g><circle class="mark" cx="130" cy="62" r="4.5"/><text class="mark-t" x="140" y="48">消失点</text><text class="lbl" x="132" y="208" text-anchor="middle">1 点透視 (正面が見える)</text><path class="k-thin" d="M338.7,86.7 L276,112 L338.7,147.2 M437.9,85.3 L504,112 L437.9,149.1"/><g class="k-shadow"><polygon points="390,66 338.7,86.7 338.7,147.2 390,176" style="fill:var(--k-steel-2);stroke:var(--k-line)" stroke-width="1.6" stroke-linejoin="round"/><polygon points="390,66 437.9,85.3 437.9,149.1 390,176" style="fill:var(--k-steel-3);stroke:var(--k-line)" stroke-width="1.6" stroke-linejoin="round"/></g><path d="M390,68 L390,174" fill="none" style="stroke:#ffffff" stroke-width="1.4" opacity="0.7"/><circle class="mark" cx="276" cy="112" r="4.5"/><circle class="mark" cx="504" cy="112" r="4.5"/><text class="tick" x="278" y="100">VP1</text><text class="tick" x="502" y="100" text-anchor="end">VP2</text><text class="lbl" x="390" y="208" text-anchor="middle">2 点透視 (角が手前)</text>
</svg>
<table class="tb-table">
  <tr><th>図法</th><th>特徴</th><th>向いている対象</th></tr>
  <tr><td>1 点透視</td><td>正面が歪まず、奥行き方向だけ 1 点に集まる</td><td>正面に操作部がある機器、室内</td></tr>
  <tr><td>2 点透視</td><td>縦線は垂直のまま、左右 2 方向が 2 点に集まる</td><td>製品の外観全体 (最も多用)</td></tr>
  <tr><td>3 点透視</td><td>縦線も集まる。迫力があるが歪みやすい</td><td>大きな物を見上げ/見下ろす表現</td></tr>
</table>
<div class="tb-note">消失点どうしを近づけすぎると形が強く歪みます。製品スケッチでは消失点を紙の外に置くくらい離すと自然に見えます。</div>
<h2>楕円の描き方</h2>
<p>円柱・ボタン・ダイヤルなど、円は透視では<b>楕円</b>になります。描くときのポイントは次のとおりです。</p>
<ul>
  <li>楕円の<b>短軸</b>は、円柱の中心軸 (回転軸) と一直線に重なる</li>
  <li>アイレベルから離れるほど楕円は丸く (短軸が長く) なる</li>
  <li>端がとがった「レモン形」や、角ばった形にならないよう、腕全体で何度かなぞってから線を決める</li>
</ul>
<svg class="tb-chart" viewBox="0 0 520 192" role="img" aria-label="円柱の楕円と短軸">
<line class="guide" x1="20" y1="22" x2="250" y2="22"/><text class="tick" x="24" y="16">アイレベル</text><g class="k-shadow"><path class="k-part-h" d="M80,50 L80,130 A70,24 0 0 0 220,130 L220,50 Z"/></g><ellipse cx="150" cy="50" rx="70" ry="14" style="fill:var(--k-steel-1);stroke:var(--k-line)" stroke-width="1.6"/><path class="k-hidden" d="M80,130 A70,24 0 0 1 220,130"/><path class="k-center" d="M150,14 L150,172"/><path class="k-thin" d="M80,50 L220,50 M80,130 L220,130" style="stroke:var(--k-dim)"/><path d="M100,62 L100,140" fill="none" style="stroke:#ffffff" stroke-width="2.4" opacity="0.55"/><text class="k-dimtext" x="156" y="182">中心軸 = 短軸の方向</text><path class="k-thin" d="M212,54 L240,54" marker-start="url(#k-dot)"/><text class="lbl" x="246" y="58">上の楕円は細い (アイレベルに近い)</text><path class="k-thin" d="M212,146 L240,140" marker-start="url(#k-dot)"/><text class="lbl" x="246" y="144">下の楕円はより丸い (アイレベルから遠い)</text><text class="k-note" x="246" y="100">長軸 ⟂ 中心軸</text>
</svg>
<h2>陰影と光源</h2>
<p>光源を 1 つ決め (多くは左上奥)、面の向きに応じて明暗を 3 段階に塗り分けると立体感が出ます。</p>
<table class="tb-table">
  <tr><th>要素</th><th>説明</th></tr>
  <tr><td>明部 (上面など)</td><td>光に向いた面。最も明るく、紙の白を残すこともある</td></tr>
  <tr><td>中間 (側面)</td><td>中間の明るさ</td></tr>
  <tr><td>暗部 (光の反対側)</td><td>最も暗い面</td></tr>
  <tr><td>ハイライト</td><td>R やエッジに入る鋭い明るい線。面のつながりを伝える</td></tr>
  <tr><td>キャストシャドウ (落ち影)</td><td>床に落ちる影。製品を接地させ、重さを感じさせる</td></tr>
</table>
<h2>マーカーとデジタル</h2>
<ul>
  <li><b>マーカー</b>: アルコールマーカーのグレー階調で明暗を置き、パステルで面のグラデーション、白ペンでハイライト。素早く、迷いのない線が魅力</li>
  <li><b>デジタル</b> (タブレット + ペイントソフト): レイヤーで線画と陰影を分け、やり直しや色違いが容易。下絵に 3D データの画面を敷く使い方も多い</li>
</ul>
<h2>3D CAD からのレンダリング</h2>
<p>形が固まってきたら、3D データから写実的な画像を作ります。スケッチでは曖昧だった<b>面の映り込み・R の大きさ・比率</b>が正直に出るため、形の検証にもなります。</p>
<ul>
  <li>カメラ: 人の目に近い焦点距離 (35 mm 換算 50〜85 mm 程度) で歪みを抑える</li>
  <li>光: キーライト + 補助光、あるいは環境マップで映り込みを作る</li>
  <li>材質: 色だけでなく光沢 (つや) と粗さを設定する</li>
  <li>背景: 製品の色が引き立つ無彩色、接地影を入れる</li>
</ul>
<div class="tb-tip"><b>3DCAD Studio</b>: 「材料と色」で材質を設定し、リアル表示 (影・映り込み・質感) に切り替えて、角度を変えながら見え方を確認しましょう。提案用には高解像度画像の保存が使えます。</div>`,
    points: ["平行線は消失点に集まり、消失点はアイレベル上にある。製品は 2 点透視が基本", "楕円の短軸は円柱の中心軸と一直線になる", "光源を 1 つ決め、明部・中間・暗部・ハイライト・落ち影で立体感を出す", "3D からのレンダリングは比率や映り込みの検証にもなる"],
    exercises: [
      {
        q: "机の上に置いたマグカップを斜め上から見た 2 点透視のスケッチで、上の口の楕円と底の楕円ではどちらが丸く見えますか? 理由も答えてください。",
        a: "<b>底の楕円のほうが丸く</b>見えます。見下ろしている場合、底のほうがアイレベル (目の高さ) から遠いため、円を真上に近い角度から見ることになり、楕円の短軸が長くなります。",
      },
    ],
    quiz: [
      { q: "透視図で消失点が置かれるのは?", choices: ["アイレベル (目の高さの水平線) 上", "画面の四隅", "製品の重心"], answer: 0, explain: "水平な平行線の消失点はアイレベル上に集まります。" },
      { q: "円柱を描くとき、楕円の短軸はどの方向に合わせる?", choices: ["画面の水平方向", "円柱の中心軸の方向", "光源の方向"], answer: 1, explain: "楕円の短軸は回転軸 (中心軸) と一直線になります。" },
      { q: "製品の下に落ち影 (キャストシャドウ) を描く主な効果は?", choices: ["色を明るく見せる", "製品が接地して見え、重さや存在感が出る", "寸法がわかる"], answer: 1, explain: "落ち影があると製品が浮かずに置かれているように見えます。" },
    ],
    lessons: ["8-2"],
  },
  {
    id: "form-surfaces",
    part: "design",
    title: "【中級】造形 — 面とハイライト",
    minutes: 25,
    level: 2,
    lead: "同じ寸法の製品でも、面の張りやハイライトの流れ方で「上質」にも「安っぽく」にも見えます。面の張り、R の連続性 (G0/G1/G2)、パーティングラインと見切り、ドラフトとの両立など、造形の質を左右する要素を学びます。",
    body: `
<h2>面の張り</h2>
<p>完全な平面は、成形時のヒケや光の反射のわずかな乱れで<b>へこんで</b>見えやすくなります。そこで、ごくわずかに外へふくらませた面 (<b>張りのある面</b>、クラウン) にすることがよくあります。</p>
<svg class="tb-chart" viewBox="0 0 520 172" role="img" aria-label="平面と張りのある面">
<rect class="k-panel" x="8" y="8" width="248" height="156" rx="8"/><rect class="k-panel" x="264" y="8" width="248" height="156" rx="8"/><circle class="k-badge" cx="28" cy="28" r="10" style="fill:var(--tb-bad)"/><text class="k-badge-t" x="28" y="32" text-anchor="middle">✕</text><text class="k-title" x="46" y="32">平面</text><circle class="k-badge" cx="284" cy="28" r="10" style="fill:var(--tb-good)"/><text class="k-badge-t" x="284" y="32" text-anchor="middle">✓</text><text class="k-title" x="302" y="32">張りのある面</text><g class="k-shadow"><path class="k-cut" d="M36,72 L228,72 L228,96 L36,96 Z"/></g><path d="M36,72 Q132,84 228,72" fill="none" style="stroke:var(--tb-bad)" stroke-width="2" stroke-dasharray="5 3"/><path class="k-thin" d="M150,79 L176,112" marker-start="url(#k-dot)"/><text class="k-bad-t" x="178" y="118">へこんで見える</text><text class="k-note" x="132" y="148" text-anchor="middle">平面 → ヒケでへこんで見えやすい</text><g class="k-shadow"><path class="k-cut" d="M292,80 Q388,58 484,80 L484,100 Q388,82 292,100 Z"/></g><line class="guide" x1="292" y1="80" x2="484" y2="80"/><path d="M330,70 Q388,60 446,70" fill="none" style="stroke:#ffffff" stroke-width="2" opacity="0.9"/><line class="k-dimline" x1="400" y1="80" x2="400" y2="69"/><text class="mark-t" x="406" y="58">わずかなふくらみ</text><text class="k-note" x="388" y="148" text-anchor="middle">張りのある面 → 緊張感・上質感</text>
</svg>
<h2>ハイライトライン</h2>
<p>光沢のある面には、照明や周囲の映り込みが帯状の<b>ハイライト</b>として現れます。ハイライトは面の曲率 (曲がり具合) の変化を拡大して見せる「検査道具」です。</p>
<ul>
  <li>ハイライトが<b>途切れず、滑らかに流れる</b> → 面がきれいにつながっている</li>
  <li>ハイライトが<b>折れる・段がつく・波打つ</b> → 面のつながりや面の質に問題がある</li>
  <li>自動車のデザインでは、平行な蛍光灯を映す「ゼブラ」で面を評価する</li>
</ul>
<svg class="tb-chart" viewBox="0 0 520 168" role="img" aria-label="ゼブラ縞の流れ">
<defs><linearGradient id="dz-zb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eef1f5"/><stop offset="1" stop-color="#b9c2ce"/></linearGradient><clipPath id="dz-zc"><rect x="40" y="26" width="440" height="96" rx="12"/></clipPath></defs><g class="k-shadow"><rect x="40" y="26" width="440" height="96" rx="12" style="fill:url(#dz-zb);stroke:var(--k-line)" stroke-width="1.6"/></g><g clip-path="url(#dz-zc)"><rect x="40" y="30" width="220" height="9" fill="#1f2530"/><path d="M260,39 C300,39 320,36 480,34 L480,43 C320,45 300,48 260,48 Z" fill="#1f2530"/><rect x="40" y="50" width="220" height="9" fill="#1f2530"/><path d="M260,59 C300,59 320,56 480,54 L480,63 C320,65 300,68 260,68 Z" fill="#1f2530"/><rect x="40" y="70" width="220" height="9" fill="#1f2530"/><path d="M260,79 C300,79 320,76 480,74 L480,83 C320,85 300,88 260,88 Z" fill="#1f2530"/><rect x="40" y="90" width="220" height="9" fill="#1f2530"/><path d="M260,99 C300,99 320,96 480,94 L480,103 C320,105 300,108 260,108 Z" fill="#1f2530"/><rect x="40" y="110" width="220" height="9" fill="#1f2530"/><path d="M260,119 C300,119 320,116 480,114 L480,123 C320,125 300,128 260,128 Z" fill="#1f2530"/><rect x="40" y="26" width="18" height="96" style="fill:var(--tb-accent)" opacity="0.35"><animate attributeName="x" values="40;462;40" dur="6s" repeatCount="indefinite"/></rect></g><line x1="260" y1="20" x2="260" y2="128" style="stroke:var(--tb-bad)" stroke-width="1.8" stroke-dasharray="5 3"/><text class="mark-t" x="268" y="16">面の境目で縞がずれる = G0 (段差・折れ)</text><text class="k-good-t" x="150" y="140" text-anchor="middle">縞がまっすぐ連続</text><text class="k-bad-t" x="372" y="140" text-anchor="middle">ずれ・折れ</text><text class="lbl" x="260" y="160" text-anchor="middle">平行な光の縞を映すと、面のつながりの乱れが見える</text>
</svg>
<p class="tb-caption">図: ゼブラ表示の模式図。縞がずれる・折れる所は面のつながりに問題がある</p>
<p>下のアニメーションでは、G0 (角)・G1 (正接)・G2 (曲率連続) の 3 種類のつなぎ目に映り込みの線を横切らせています。線が境目でどう振る舞うかを見比べてください。</p>
<div data-widget="anim-highlight"></div>
<h2>R の連続性 — G0・G1・G2</h2>
<table class="tb-table">
  <tr><th>連続性</th><th>意味</th><th>見え方</th></tr>
  <tr><td>G0 (位置連続)</td><td>面がつながっているだけ。角度は折れている</td><td>はっきりした稜線 (エッジ)</td></tr>
  <tr><td>G1 (正接連続)</td><td>接線の向きがそろう。普通の円弧フィレット</td><td>なめらかだが、境目でハイライトが<b>折れる・段がつく</b>。R の始まりが「線」として見える</td></tr>
  <tr><td>G2 (曲率連続)</td><td>曲がり具合 (曲率) もゼロから徐々に変わる</td><td>ハイライトが途切れず<b>流れる</b>。R の始まりがわからず、やわらかく上質</td></tr>
</table>
<svg class="tb-chart" viewBox="0 0 520 252" role="img" aria-label="G1とG2の断面と曲率">
<rect class="k-panel" x="8" y="8" width="248" height="236" rx="8"/><rect class="k-panel" x="264" y="8" width="248" height="236" rx="8"/><circle class="k-badge" cx="28" cy="28" r="10" style="fill:var(--tb-bad)"/><text class="k-badge-t" x="28" y="32" text-anchor="middle">✕</text><text class="k-title" x="46" y="32">G1: 直線 + 円弧</text><circle class="k-badge" cx="284" cy="28" r="10" style="fill:var(--tb-good)"/><text class="k-badge-t" x="284" y="32" text-anchor="middle">✓</text><text class="k-title" x="302" y="32">G2: 曲率が徐々に増える</text><g transform="translate(0,16)"><g class="k-shadow"><path class="k-alu" d="M30,52 L110,52 A50,50 0 0 1 160,102 L160,126 L30,126 Z"/></g><path d="M30,52 L110,52 A50,50 0 0 1 160,102 L160,126" fill="none" style="stroke:var(--k-line)" stroke-width="2.4"/><path d="M110,52 L110,38 M116.5,52.4 L118.4,38.5 M122.9,53.7 L126.6,40.2 M129.1,55.8 L134.5,42.9 M135,58.7 L142,46.6 M140.4,62.3 L149,51.2 M145.4,66.6 L155.3,56.7 M149.7,71.6 L160.8,63 M153.3,77 L165.4,70 M156.2,82.9 L169.1,77.5 M158.3,89.1 L171.8,85.4 M159.6,95.5 L173.5,93.6 M160,102 L174,102 " fill="none" style="stroke:var(--tb-bad)" stroke-width="0.9"/><path d="M110,38 L118.4,38.5 L126.6,40.2 L134.5,42.9 L142,46.6 L149,51.2 L155.3,56.7 L160.8,63 L165.4,70 L169.1,77.5 L171.8,85.4 L173.5,93.6 L174,102" fill="none" style="stroke:var(--tb-bad)" stroke-width="1.4"/><g class="k-shadow"><path class="k-alu" d="M290,52 C380,52 416,62 416,126 L290,126 Z"/></g><path d="M290,52 C380,52 416,62 416,126" fill="none" style="stroke:var(--k-line)" stroke-width="2.4"/><path d="M290,52 L290,51.4 M301,52.1 L301,51.3 M311.4,52.2 L311.4,51.2 M321.3,52.6 L321.3,51.2 M330.6,53 L330.7,51.2 M339.4,53.7 L339.6,51.4 M347.7,54.6 L348,51.6 M355.4,55.6 L356,51.9 M362.7,57 L363.6,52.2 M369.4,58.5 L371,52.7 M375.7,60.4 L378.1,53.2 M381.5,62.5 L385,54 M386.8,65 L391.8,55.2 M391.6,67.8 L398.5,57.1 M395.9,70.9 L404.9,59.9 M399.9,74.5 L410.6,63.8 M403.3,78.4 L415.3,68.9 M406.4,82.7 L418.7,75 M409,87.4 L420.9,81.7 M411.1,92.6 L422,88.7 M412.9,98.3 L422.3,95.8 M414.3,104.4 L422.1,103 M415.2,111.1 L421.7,110.4 M415.8,118.3 L421,118 M416,126 L420.1,126 " fill="none" style="stroke:var(--tb-good)" stroke-width="0.9"/><path d="M290,51.4 L301,51.3 L311.4,51.2 L321.3,51.2 L330.7,51.2 L339.6,51.4 L348,51.6 L356,51.9 L363.6,52.2 L371,52.7 L378.1,53.2 L385,54 L391.8,55.2 L398.5,57.1 L404.9,59.9 L410.6,63.8 L415.3,68.9 L418.7,75 L420.9,81.7 L422,88.7 L422.3,95.8 L422.1,103 L421.7,110.4 L421,118 L420.1,126" fill="none" style="stroke:var(--tb-good)" stroke-width="1.4"/></g><text class="sec" x="22" y="154">曲率の変化 (コーム)</text><line class="axis" x1="30" y1="222" x2="236" y2="222"/><polyline points="30,222 100,222 100,182 170,182 170,222 236,222" fill="none" style="stroke:var(--tb-bad)" stroke-width="2.2"/><text class="tick" x="102" y="176">段差 → ハイライトが折れる</text><line class="axis" x1="286" y1="222" x2="492" y2="222"/><path d="M286,222 L330,222 C362,222 372,182 394,182 C416,182 426,222 458,222 L492,222" fill="none" style="stroke:var(--tb-good)" stroke-width="2.2"/><text class="tick" x="372" y="176">連続 → 流れる</text>
</svg>
<div class="tb-note">普通のフィレット (円弧) は G1 です。大きな外観 R で G1 の「R の始まりの線」が目立つときは、可変 R や円錐断面 (コニック) フィレット、ロフト面などで G2 に近づけます。ただし G2 は面が複雑になり、金型や検査の手間も増えるので、<b>よく見える場所</b>に絞って使います。</div>
<h2>パーティングラインと見切り</h2>
<p><b>パーティングライン (PL)</b> は、金型の分割位置や、部品どうしの合わせ目に現れる線です。見えてしまう線を、意図して「デザインの線」にする工夫を<b>見切り</b>と言います。</p>
<svg class="tb-chart" viewBox="0 0 520 192" role="img" aria-label="パーティングラインの位置">
<rect class="k-panel" x="8" y="8" width="248" height="176" rx="8"/><rect class="k-panel" x="264" y="8" width="248" height="176" rx="8"/><circle class="k-badge" cx="28" cy="28" r="10" style="fill:var(--tb-bad)"/><text class="k-badge-t" x="28" y="32" text-anchor="middle">✕</text><text class="k-title" x="46" y="32">R の途中に PL</text><circle class="k-badge" cx="284" cy="28" r="10" style="fill:var(--tb-good)"/><text class="k-badge-t" x="284" y="32" text-anchor="middle">✓</text><text class="k-title" x="302" y="32">平らな面の角に PL</text><g class="k-shadow"><path class="k-plastic" d="M34,95 L34,72 Q34,50 56,50 L206,50 Q228,50 228,72 L228,95 Z"/><path class="k-plastic" d="M37,95 L231,95 L231,118 Q231,140 209,140 L59,140 Q37,140 37,118 Z"/></g><line x1="28" y1="95" x2="236" y2="95" style="stroke:var(--tb-bad)" stroke-width="1.8" stroke-dasharray="6 3"/><circle cx="230" cy="95" r="12" fill="none" style="stroke:var(--tb-bad)" stroke-width="1.4"/><text class="k-bad-t" x="196" y="82" text-anchor="end">段差</text><path d="M56,54 L206,54" fill="none" style="stroke:#ffffff" stroke-width="1.6" opacity="0.8"/><text class="k-note" x="132" y="172" text-anchor="middle">R の途中に PL → 段差・ずれが目立つ</text><g class="k-shadow"><path class="k-plastic" d="M296,72 L296,114 Q296,136 318,136 L458,136 Q480,136 480,114 L480,72 Z"/><path class="k-plastic" d="M292,74 Q292,52 314,52 L462,52 Q484,52 484,74 Z"/></g><line x1="288" y1="74" x2="488" y2="74" style="stroke:var(--k-line)" stroke-width="2.4"/><line x1="288" y1="74" x2="488" y2="74" style="stroke:var(--tb-accent)" stroke-width="1.2"/><path d="M314,56 L462,56" fill="none" style="stroke:#ffffff" stroke-width="1.6" opacity="0.8"/><path class="k-thin" d="M470,76 L470,100" marker-start="url(#k-dot)"/><text class="k-note" x="462" y="104" text-anchor="end">見切り溝</text><text class="mark-t" x="388" y="154" text-anchor="middle">上ケースを一回り大きく + 溝</text><text class="k-note" x="388" y="172" text-anchor="middle">→ ずれが目立たない</text>
</svg>
<ul>
  <li>PL は<b>R の途中</b>より、面の折れ目 (稜線) や平らな部分に置くとずれが目立ちにくい</li>
  <li>合わせ目に<b>V 溝・段差 (わざと片側を引っ込める)</b> を設けると、成形のばらつきで生じるずれを影に隠せる</li>
  <li>PL・ボタン穴・窓の縁を<b>同じ高さ・同じ線</b>にそろえると整って見える</li>
</ul>
<h2>面の分割</h2>
<p>大きな 1 枚の面は、わずかなひずみも目立ちます。キャラクターライン (稜線) や素材・色の切り替えで面を分割すると、面ごとの役割がはっきりし、ひずみも目立ちにくくなります。分割線は<b>少なく、意味のある位置</b>に置くのが原則です。</p>
<h2>ドラフト (抜き勾配) と意匠の両立</h2>
<table class="tb-table">
  <tr><th>課題</th><th>対処の例</th></tr>
  <tr><td>勾配で側面が台形に見える</td><td>PL を高さの中央に置き、上下に勾配を振り分ける (ただし PL の見切りが必要)</td></tr>
  <tr><td>シボ (しぼ模様) 面は勾配を多く要する</td><td>シボの深さに応じて 1°/0.025 mm 程度を目安に増やす (金型メーカーと確認)</td></tr>
  <tr><td>直角に見せたい</td><td>勾配 0.5〜1° でも見た目はほぼ直角。R を小さくしてエッジを効かせる</td></tr>
  <tr><td>勾配と R の順序</td><td>勾配を先に付け、外観 R は後から付けると面がきれいにつながる</td></tr>
</table>
<svg class="tb-chart" viewBox="0 0 520 212" role="img" aria-label="抜き勾配と離型">
<rect class="k-panel" x="8" y="8" width="248" height="196" rx="8"/><rect class="k-panel" x="264" y="8" width="248" height="196" rx="8"/><circle class="k-badge" cx="28" cy="28" r="10" style="fill:var(--tb-bad)"/><text class="k-badge-t" x="28" y="32" text-anchor="middle">✕</text><text class="k-title" x="46" y="32">勾配なし</text><circle class="k-badge" cx="284" cy="28" r="10" style="fill:var(--tb-good)"/><text class="k-badge-t" x="284" y="32" text-anchor="middle">✓</text><text class="k-title" x="302" y="32">勾配あり</text><g class="k-shadow"><rect class="k-cut" x="40" y="40" width="180" height="26"/></g><rect class="k-plastic" x="80" y="66" width="100" height="70"><animateTransform attributeName="transform" type="translate" values="0,0;0,0;0,-26;0,0" dur="4s" repeatCount="indefinite"/></rect><g class="k-shadow"><path class="k-cut2" d="M40,66 L80,66 L80,136 L180,136 L180,66 L220,66 L220,156 L40,156 Z"/></g><path d="M80,72 L80,132 M180,72 L180,132" style="stroke:var(--tb-bad)" stroke-width="3" stroke-dasharray="3 3"/><text class="k-bad-t" x="130" y="180" text-anchor="middle">壁面がこすれる</text><g class="k-shadow"><rect class="k-cut" x="296" y="40" width="184" height="26"/></g><path class="k-plastic" d="M336,66 L346,136 L430,136 L440,66 Z"><animateTransform attributeName="transform" type="translate" values="0,0;0,0;0,-26;0,0" dur="4s" repeatCount="indefinite"/></path><g class="k-shadow"><path class="k-cut2" d="M296,66 L336,66 L346,136 L430,136 L440,66 L480,66 L480,156 L296,156 Z"/></g><path class="k-ext" d="M440,66 L440,104"/><path class="k-dimline" d="M440,96 A30,30 0 0 0 436,97" style="marker-start:none"/><text class="k-dimtext" x="448" y="102">勾配</text><text class="k-good-t" x="388" y="180" text-anchor="middle">離れた瞬間にすき間</text>
</svg>
<p class="tb-caption">図: 型 (灰色) から成形品 (色) を取り出すとき、勾配があればすぐ壁面から離れる</p>
<p>次のアニメーションで、勾配の有無による離型の違いを切り替えて確認できます。</p>
<div data-widget="anim-draft"></div>
<div class="tb-tip"><b>3DCAD Studio</b>: 勾配を付けてからフィレットをかけると、R が勾配面に沿ってきれいにつながります。滑らかな曲面にはロフトやスイープ、ハイライトの流れの確認にはリアル表示 (映り込み) が役立ちます。断面図で R の形状を確かめましょう。</div>`,
    points: ["わずかに張った面は、ヒケに強く上質に見える", "ハイライトは面のつながりを拡大して見せる検査道具", "G1 (正接) はハイライトが折れ、G2 (曲率連続) は流れる。G2 は見える場所に絞る", "PL は R の途中を避け、見切り溝や段差でずれを隠す。勾配は R より先に付ける"],
    exercises: [
      {
        q: "スマートフォンケースの外周に R10 の円弧フィレット (G1) を付けたところ、光沢塗装のレンダリングで R の始まりに線が見えました。改善策を 2 つ挙げてください。",
        a: "① R を<b>曲率連続 (G2) に近い形</b> — 可変 R、コニック断面、ロフト面など — にして、曲率がゼロから徐々に増えるようにする。② 面の分割位置を見直し、R の始まりを意図した<b>キャラクターライン</b>として扱う、またはその部分を<b>つや消し・シボ</b>にしてハイライトを弱める。",
      },
    ],
    quiz: [
      { q: "普通の円弧フィレットの連続性は?", choices: ["G0", "G1 (正接連続)", "G2 (曲率連続)"], answer: 1, explain: "円弧は接線は連続しますが、つなぎ目で曲率が急に変わるため G1 です。" },
      { q: "G2 の面でハイライトはどう見える?", choices: ["境目で折れる", "途切れず滑らかに流れる", "消える"], answer: 1, explain: "曲率まで連続するため、ハイライトが途切れず流れます。" },
      { q: "パーティングラインの位置として一般に好ましいのは?", choices: ["大きな R の途中", "面の折れ目や平らな部分に置き、見切りを付ける", "最も目立つ正面の中央"], answer: 1, explain: "R の途中に PL があると、わずかなずれや段差が目立ちます。" },
    ],
    lessons: ["3-4", "7-2"],
  },
  {
    id: "color-theory",
    part: "design",
    title: "【中級】色彩の基礎と配色",
    minutes: 22,
    level: 2,
    lead: "色は製品の印象を最も速く伝える要素です。色の三属性と表色系、配色の基本、心理的効果、色覚の多様性への配慮、そして量産で色をそろえる方法までを学びます。",
    body: `
<h2>色の三属性</h2>
<table class="tb-table">
  <tr><th>属性</th><th>意味</th><th>例</th></tr>
  <tr><td>色相 (Hue)</td><td>赤・黄・緑・青などの色み</td><td>赤と青の違い</td></tr>
  <tr><td>明度 (Value / Lightness)</td><td>明るさ。白が最も高く黒が最も低い</td><td>水色と紺</td></tr>
  <tr><td>彩度 (Chroma / Saturation)</td><td>色みの強さ (あざやかさ)。無彩色は 0</td><td>真っ赤とくすんだ赤</td></tr>
</table>
<p>白・灰・黒のように色相を持たない色を<b>無彩色</b>、それ以外を<b>有彩色</b>と呼びます。</p>
<h2>マンセル表色系と PCCS</h2>
<ul>
  <li><b>マンセル表色系</b>: 色相 (H)・明度 (V)・彩度 (C) で「5R 4/14」のように表す。JIS (JIS Z 8721) にも採用され、工業分野の色指定で広く使われる</li>
  <li><b>PCCS</b> (日本色研配色体系): 色相を 24 色相環に、明度と彩度をまとめた<b>トーン</b> (ビビッド・ペール・ダークなど) で整理する。配色を考えるのに便利</li>
</ul>
<svg class="tb-chart" viewBox="0 0 520 230" role="img" aria-label="色相環と補色・類似色">
<g class="k-shadow"><path d="M94.8,30 A92,92 0 0 1 165.2,30 L149.9,67 A52,52 0 0 0 110.1,67 Z" fill="#e53935" style="stroke:var(--tb-surface)" stroke-width="2"/><path d="M165.2,30 A92,92 0 0 1 215,79.8 L178,95.1 A52,52 0 0 0 149.9,67 Z" fill="#fb8c00" style="stroke:var(--tb-surface)" stroke-width="2"/><path d="M215,79.8 A92,92 0 0 1 215,150.2 L178,134.9 A52,52 0 0 0 178,95.1 Z" fill="#fdd835" style="stroke:var(--tb-surface)" stroke-width="2"/><path d="M215,150.2 A92,92 0 0 1 165.2,200 L149.9,163 A52,52 0 0 0 178,134.9 Z" fill="#7cb342" style="stroke:var(--tb-surface)" stroke-width="2"/><path d="M165.2,200 A92,92 0 0 1 94.8,200 L110.1,163 A52,52 0 0 0 149.9,163 Z" fill="#00897b" style="stroke:var(--tb-surface)" stroke-width="2"/><path d="M94.8,200 A92,92 0 0 1 45,150.2 L82,134.9 A52,52 0 0 0 110.1,163 Z" fill="#1e88e5" style="stroke:var(--tb-surface)" stroke-width="2"/><path d="M45,150.2 A92,92 0 0 1 45,79.8 L82,95.1 A52,52 0 0 0 82,134.9 Z" fill="#5e35b1" style="stroke:var(--tb-surface)" stroke-width="2"/><path d="M45,79.8 A92,92 0 0 1 94.8,30 L110.1,67 A52,52 0 0 0 82,95.1 Z" fill="#d81b60" style="stroke:var(--tb-surface)" stroke-width="2"/></g><circle cx="130" cy="115" r="48" style="fill:var(--tb-surface)" opacity="0.6"/><line x1="130" y1="23" x2="130" y2="207" style="stroke:var(--tb-text)" stroke-width="2" stroke-dasharray="6 3"/><circle cx="130" cy="44" r="5" style="fill:var(--tb-surface);stroke:var(--tb-text)" stroke-width="2"/><circle cx="130" cy="186" r="5" style="fill:var(--tb-surface);stroke:var(--tb-text)" stroke-width="2"/><path d="M56.6,44.1 A102,102 0 0 1 203.4,44.1" fill="none" style="stroke:var(--tb-accent)" stroke-width="3.5" marker-start="url(#k-arrow-blue)" marker-end="url(#k-arrow-blue)"/><text class="k-title" x="130" y="120" text-anchor="middle">補色</text><line x1="248" y1="56" x2="264" y2="56" style="stroke:var(--tb-text)" stroke-width="2" stroke-dasharray="6 3"/><text class="lbl" x="270" y="60">向かい合う色 = 補色 (対比が強い)</text><line x1="248" y1="88" x2="264" y2="88" style="stroke:var(--tb-accent)" stroke-width="3.5"/><text class="lbl" x="270" y="92">隣り合う色 = 類似色 (調和しやすい)</text><text class="tick" x="270" y="128">※ 図は模式的な 8 色相。補色の正確な組合せは</text><text class="tick" x="270" y="145">　 表色系 (マンセル・PCCS など) によって異なる</text>
</svg>
<h2>配色の基本</h2>
<table class="tb-table">
  <tr><th>配色</th><th>考え方</th><th>印象</th></tr>
  <tr><td>同一色相・類似色相</td><td>色相をそろえ、明度・彩度で変化</td><td>まとまり・落ち着き</td></tr>
  <tr><td>補色・対照色相</td><td>色相環で離れた色を組み合わせる</td><td>活発・目立つ (面積差を付けないとぶつかる)</td></tr>
  <tr><td>トーン統一</td><td>色相は違ってもトーンをそろえる</td><td>多色でも調和</td></tr>
  <tr><td>無彩色 + アクセント</td><td>白・灰・黒に 1 色だけ差す</td><td>工業製品で最も多い。上品・機能的</td></tr>
</table>
<h3>配色の比率 70 : 25 : 5</h3>
<p>面積の配分の目安として、<b>ベースカラー 70 %・アソートカラー (メイン) 25 %・アクセントカラー 5 %</b> がよく使われます。厳密な規則ではありませんが、主従をはっきりさせるのに役立ちます。</p>
<svg class="tb-chart" viewBox="0 0 520 180" role="img" aria-label="配色比率">
<defs><linearGradient id="dz-base" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6f3ee"/><stop offset="1" stop-color="#dcd6cc"/></linearGradient><linearGradient id="dz-asrt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6d7684"/><stop offset="1" stop-color="#3f4651"/></linearGradient><linearGradient id="dz-acc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff8a5c"/><stop offset="1" stop-color="#d9481c"/></linearGradient></defs><rect x="20" y="20" width="336" height="30" rx="3" style="fill:url(#dz-base);stroke:var(--k-line)" stroke-width="1"/><rect x="356" y="20" width="120" height="30" style="fill:url(#dz-asrt);stroke:var(--k-line)" stroke-width="1"/><rect x="476" y="20" width="24" height="30" rx="3" style="fill:url(#dz-acc);stroke:var(--k-line)" stroke-width="1"/><text class="lbl" x="188" y="68" text-anchor="middle">ベース 70 % (筐体)</text><text class="lbl" x="416" y="68" text-anchor="middle">アソート 25 %</text><text class="lbl" x="488" y="14" text-anchor="middle">5 %</text><ellipse cx="260" cy="166" rx="120" ry="5" style="fill:var(--tb-text)" opacity="0.13"/><g class="k-shadow"><rect x="150" y="88" width="220" height="76" rx="22" style="fill:url(#dz-base);stroke:var(--k-line)" stroke-width="1.6"/><path d="M150,140 L370,140 L370,142 Q370,164 348,164 L172,164 Q150,164 150,142 Z" style="fill:url(#dz-asrt);stroke:var(--k-line)" stroke-width="1.6"/><rect x="300" y="100" width="56" height="30" rx="8" style="fill:url(#dz-asrt);stroke:var(--k-line)" stroke-width="1.4"/></g><circle cx="328" cy="115" r="8" style="fill:url(#dz-acc);stroke:var(--k-line)" stroke-width="1.2"/><path d="M172,93 L348,93" fill="none" style="stroke:#ffffff" stroke-width="1.8" opacity="0.9"/><path class="k-thin" d="M200,112 L120,112" marker-start="url(#k-dot)"/><text class="k-note" x="114" y="116" text-anchor="end">ベース</text><path class="k-thin" d="M240,152 L120,150" marker-start="url(#k-dot)"/><text class="k-note" x="114" y="154" text-anchor="end">アソート</text><path class="k-thin" d="M336,115 L400,115" marker-start="url(#k-dot)"/><text class="k-note" x="406" y="119">アクセント</text>
</svg>
<p>製品では、アクセントカラーを<b>操作の要所</b> (電源ボタン、つかむ部分) に置くと、色が機能を示す手がかりになります。</p>
<h2>色の心理的効果</h2>
<table class="tb-table">
  <tr><th>効果</th><th>傾向</th></tr>
  <tr><td>暖色・寒色</td><td>赤・橙・黄は暖かく、青系は冷たく感じる</td></tr>
  <tr><td>重さ</td><td>明度が低い色ほど重く見える (底を暗くすると安定)</td></tr>
  <tr><td>大きさ (膨張・収縮)</td><td>明るい色・暖色は大きく、暗い色・寒色は小さく見えやすい</td></tr>
  <tr><td>進出・後退</td><td>暖色は手前に、寒色は奥に見えやすい</td></tr>
  <tr><td>文化的な意味</td><td>色の連想は地域・文化・業界で異なる (輸出品は要確認)</td></tr>
</table>
<h2>色覚の多様性への配慮 — 色だけに頼らない</h2>
<p>色の見え方は人によって異なり、日本では男性の約 5 %、女性の約 0.2 % が赤と緑などを区別しにくい色覚特性を持つとされます。</p>
<ul>
  <li>状態表示を「赤 = 異常 / 緑 = 正常」の<b>色だけ</b>で示さない — 形・記号・文字・点滅を併用する</li>
  <li>色を変えるなら<b>明度差</b>も大きく付ける (グレースケールにしても区別できるか確認)</li>
  <li>色名をラベルに書く (ケーブルの色分けなど)</li>
</ul>
<div class="tb-note">確認方法: 画像をグレースケールにする、色覚シミュレーションツールで見るなど。安全色 (JIS Z 9103) も、形や記号と組み合わせて使う前提で規定されています。</div>
<h2>量産での色管理</h2>
<ul>
  <li><b>色見本 (カラーチップ)</b> と<b>限度見本</b> (許容範囲の上下限) を作り、承認する</li>
  <li><b>測色計</b>で L*a*b* 値を測り、色差 <b>ΔE*ab</b> で管理する (許容値は製品・部位ごとに取り決め。目安として 1 前後なら並べて見てもほぼ同じに感じる)</li>
  <li>同じ色番号でも<b>材料 (ABS と PC など)・表面 (光沢/シボ)・ロット</b>で見え方が変わる。異なる部品が隣り合う場所は特に注意</li>
  <li>光源で色が変わって見える現象 (<b>メタメリズム</b>) に注意し、標準光源 (D65 など) で比較する</li>
</ul>
<div class="tb-tip"><b>3DCAD Studio</b>: 「材料と色」で部品ごとに色を変え、リアル表示で配色案を比べてみましょう。複数案を高解像度画像の保存で並べると比較しやすくなります。</div>`,
    points: ["色相・明度・彩度が色の三属性。マンセルは工業の色指定、PCCS はトーンで配色を考えやすい", "ベース 70・アソート 25・アクセント 5 % が配色比率の目安", "状態表示は色だけに頼らず、形・記号・明度差を併用する", "量産は色見本・限度見本と測色 (ΔE) で管理し、材料・表面・光源の違いに注意"],
    exercises: [
      {
        q: "白い筐体の家電に、エラー時「赤」、正常時「緑」に光る LED を付ける案があります。色覚の多様性の観点から改善案を示してください。",
        a: "例: ① エラー時は<b>点滅</b>、正常時は点灯にする。② LED の横に<b>記号</b> (✓ / !) や文字を印刷する。③ 色を使うなら明度差の大きい組合せにする。<br>ポイントは「色が見分けられなくても状態がわかる」ことです。",
      },
      {
        q: "ある部品の色を測ったら、見本との色差が ΔE*ab = 3.5 でした。取り決めた許容値が ΔE ≤ 1.5 のとき、判定と次の対応は?",
        a: "許容値を超えているので<b>不合格</b>。材料ロット・着色剤の配合・成形温度 (樹脂の変色) などの原因を調べ、色合わせをやり直します。限度見本と標準光源の下で目視確認も行います。",
      },
    ],
    quiz: [
      { q: "色の三属性に含まれないのは?", choices: ["色相", "明度", "光沢"], answer: 2, explain: "三属性は色相・明度・彩度です。光沢は表面の性質です。" },
      { q: "配色比率の目安「70 : 25 : 5」の 5 % にあたるのは?", choices: ["ベースカラー", "アソートカラー", "アクセントカラー"], answer: 2, explain: "小面積のアクセントカラーで全体を引き締め、要所を示します。" },
      { q: "状態表示を色覚の多様性に配慮して設計する方法は?", choices: ["赤と緑の彩度を上げる", "形・記号・点滅など色以外の手がかりを併用する", "LED を大きくする"], answer: 1, explain: "色だけに頼らない表示が基本です。" },
    ],
    lessons: ["7-2"],
  },
  {
    id: "design-language",
    part: "design",
    title: "【上級】デザイン言語とブランド",
    minutes: 20,
    level: 3,
    lead: "店頭やカタログで、ロゴを見なくても「あのメーカーの製品だ」とわかることがあります。製品シリーズに共通する形や色の「文法」をデザイン言語と呼びます。共通要素の決め方、ガイドライン化、モデルチェンジでの継承を学びます。",
    body: `
<h2>デザイン言語とは</h2>
<p><b>デザイン言語</b>は、ブランドの価値 (例: 信頼・精密・親しみ) を、形・R・色・素材・操作部の扱いといった<b>具体的な造形のルール</b>に翻訳したものです。ルールがあると、別のデザイナーが担当しても、異なる製品カテゴリでも一貫した印象を保てます。</p>
<ol class="tb-flow">
  <li><b>ブランドの価値</b>を言葉で定義する (3 語程度)</li>
  <li>価値を<b>造形のキーワード</b>に翻訳する (「精密」→ 小さく一定の R、細い分割線)</li>
  <li><b>共通要素</b>を決める (形・R・色・ロゴ位置・操作部)</li>
  <li><b>ガイドライン</b>にまとめ、製品ごとに適用・評価する</li>
</ol>
<h2>シリーズの共通要素</h2>
<table class="tb-table">
  <tr><th>要素</th><th>ルールの例</th></tr>
  <tr><td>形 (シルエット)</td><td>正面は横長の角丸長方形、上面はわずかに傾斜</td></tr>
  <tr><td>R</td><td>外観 R は「板厚 × 2」または 3 段階 (R1 / R4 / R12) のみ使用</td></tr>
  <tr><td>色</td><td>ベースはライトグレー、アクセントは電源部のみブランドカラー</td></tr>
  <tr><td>ロゴ位置</td><td>正面右下、底辺から 8 mm、高さは製品幅の 1/20</td></tr>
  <tr><td>操作部</td><td>電源は必ず右上の丸ボタン、ダイヤルは同じローレット形状</td></tr>
  <tr><td>分割線・素材</td><td>上下 2 分割、上はつや、下はシボ</td></tr>
</table>
<svg class="tb-chart" viewBox="0 0 520 188" role="img" aria-label="シリーズの共通要素">
<line class="axis" x1="10" y1="152" x2="510" y2="152"/><ellipse cx="85" cy="152" rx="71" ry="3" style="fill:var(--tb-text)" opacity="0.13"/><g class="k-shadow"><rect class="k-alu" x="20" y="70" width="130" height="82" rx="12"/></g><path d="M20,110 L150,110 L150,140 Q150,152 138,152 L32,152 Q20,152 20,140 Z" style="fill:var(--k-steel-3);stroke:var(--k-line)" stroke-width="1.6"/><path d="M32,74 L138,74" fill="none" style="stroke:#ffffff" stroke-width="1.6" opacity="0.8"/><circle cx="132" cy="86" r="7" class="k-accent"/><rect x="118" y="138" width="24" height="4" rx="2" style="fill:#ffffff" opacity="0.85"/><ellipse cx="255" cy="152" rx="81" ry="3" style="fill:var(--tb-text)" opacity="0.13"/><g class="k-shadow"><rect class="k-alu" x="180" y="50" width="150" height="102" rx="12"/></g><path d="M180,110 L330,110 L330,140 Q330,152 318,152 L192,152 Q180,152 180,140 Z" style="fill:var(--k-steel-3);stroke:var(--k-line)" stroke-width="1.6"/><path d="M192,54 L318,54" fill="none" style="stroke:#ffffff" stroke-width="1.6" opacity="0.8"/><circle cx="312" cy="66" r="7" class="k-accent"/><rect x="298" y="138" width="24" height="4" rx="2" style="fill:#ffffff" opacity="0.85"/><ellipse cx="430" cy="152" rx="76" ry="3" style="fill:var(--tb-text)" opacity="0.13"/><g class="k-shadow"><rect class="k-alu" x="360" y="30" width="140" height="122" rx="12"/></g><path d="M360,110 L500,110 L500,140 Q500,152 488,152 L372,152 Q360,152 360,140 Z" style="fill:var(--k-steel-3);stroke:var(--k-line)" stroke-width="1.6"/><path d="M372,34 L488,34" fill="none" style="stroke:#ffffff" stroke-width="1.6" opacity="0.8"/><circle cx="482" cy="46" r="7" class="k-accent"/><rect x="468" y="138" width="24" height="4" rx="2" style="fill:#ffffff" opacity="0.85"/><line x1="6" y1="110" x2="514" y2="110" style="stroke:var(--tb-accent)" stroke-width="1" stroke-dasharray="6 4"/><text class="k-dimtext" x="8" y="60">分割線の高さ</text><text class="lbl" x="260" y="178" text-anchor="middle">大きさは違っても、R・分割線の高さ・電源ボタン・ロゴ位置が共通</text>
</svg>
<h2>デザインガイドライン</h2>
<p>ルールは文書 (ガイドライン) にまとめて共有します。よいガイドラインは「禁止事項の羅列」ではなく、<b>なぜそうするのか</b>と<b>自由にしてよい範囲</b>も示します。</p>
<ul>
  <li><b>原則</b>: ブランドの価値と造形キーワード</li>
  <li><b>必須ルール</b>: ロゴの位置・大きさ・余白、ブランドカラーの色値 (マンセル値・色差の許容値)</li>
  <li><b>推奨ルール</b>: R の段階、分割線の考え方、素材の組合せ</li>
  <li><b>良い例 / 悪い例</b>: 図で示す</li>
  <li><b>自由領域</b>: 製品カテゴリごとに変えてよい部分 (サイズ、機能に固有の形)</li>
</ul>
<div class="tb-note">ルールを細かくしすぎると、製品ごとの最適解を妨げます。「シリーズらしさ」を生むのに<b>効いている要素</b>に絞り、それ以外は自由にしておくのが長続きするコツです。</div>
<svg class="tb-chart" viewBox="0 0 520 172" role="img" aria-label="モデルチェンジでの継承">
<ellipse cx="90" cy="126" rx="60" ry="3" style="fill:var(--tb-text)" opacity="0.13"/><g class="k-shadow"><rect class="k-plastic" x="30" y="50" width="120" height="70" rx="6"/></g><path d="M36,54 L144,54" fill="none" style="stroke:#ffffff" stroke-width="1.6" opacity="0.8"/><circle cx="128" cy="70" r="8" class="k-accent k-glow"/><ellipse cx="265" cy="124" rx="65" ry="3" style="fill:var(--tb-text)" opacity="0.13"/><g class="k-shadow"><rect class="k-plastic" x="200" y="52" width="130" height="66" rx="14"/></g><path d="M214,56 L316,56" fill="none" style="stroke:#ffffff" stroke-width="1.6" opacity="0.8"/><circle cx="308" cy="72" r="8" class="k-accent k-glow"/><ellipse cx="440" cy="122" rx="60" ry="3" style="fill:var(--tb-text)" opacity="0.13"/><g class="k-shadow"><rect class="k-plastic" x="380" y="56" width="120" height="60" rx="24"/></g><path d="M404,60 L476,60" fill="none" style="stroke:#ffffff" stroke-width="1.6" opacity="0.8"/><circle cx="478" cy="76" r="8" class="k-accent k-glow"/><path class="k-move" d="M158,85 L192,85"/><path class="k-move" d="M338,85 L372,85"/><text class="lbl" x="90" y="145" text-anchor="middle">初代</text><text class="lbl" x="265" y="145" text-anchor="middle">2 代目</text><text class="lbl" x="440" y="145" text-anchor="middle">3 代目</text><text class="k-note" x="90" y="162" text-anchor="middle">R 6</text><text class="k-note" x="265" y="162" text-anchor="middle">R 14</text><text class="k-note" x="440" y="162" text-anchor="middle">R 24</text><text class="mark-t" x="260" y="28" text-anchor="middle">象徴 (丸い電源ボタン) は残し、比率と R を磨く</text>
</svg>
<p class="tb-caption">図: エボリューション型のモデルチェンジ。変える所と残す所をはっきりさせる</p>
<h2>モデルチェンジでの継承</h2>
<table class="tb-table">
  <tr><th>方針</th><th>内容</th><th>向いている場面</th></tr>
  <tr><td>継承 (エボリューション)</td><td>象徴的な要素を残し、比率や細部を磨く</td><td>認知度の高い定番品。既存ユーザを大切にしたい</td></tr>
  <tr><td>刷新 (レボリューション)</td><td>デザイン言語そのものを作り直す</td><td>ブランドの方向転換、技術の大きな変化</td></tr>
</table>
<p>継承する場合は、まず現行品の要素を「<b>変えてはいけないもの (アイコン)</b>」と「<b>変えてよいもの</b>」に仕分けます。アイコンはユーザの記憶に残っている要素 (特徴的なシルエットや操作部など) で、ユーザ調査で確かめると確実です。</p>
<div class="tb-tip"><b>3DCAD Studio</b>: R の段階やロゴ位置をパラメータ (式) で定義しておくと (例: ロゴ高さ = 幅 / 20)、サイズ違いの製品でもルールを保ったまま展開できます。ロゴは文字 (刻印/エンボス) で表現できます。</div>`,
    points: ["デザイン言語 = ブランドの価値を具体的な造形ルールに翻訳したもの", "共通要素は形・R・色・ロゴ位置・操作部・分割線など", "ガイドラインは理由と自由領域も示し、効いている要素に絞る", "モデルチェンジでは「変えてはいけないアイコン」と「変えてよいもの」を仕分ける"],
    exercises: [
      {
        q: "「やさしい・清潔・確か」をブランド価値とする家電メーカーの、R と色のルールを考えてください。",
        a: "例: R — やさしさを表すため外観 R は大きめ (最小 R3、外周は R15 程度) に統一し、エッジの立った形は操作部の見切りだけに使う。色 — 清潔さを表す白〜明るいグレーをベースに、確かさを示すため操作部のみ濃紺のアクセント (面積 5 % 程度)。<br>価値の言葉 → 造形のキーワード → 数値ルール、と段階的に翻訳するのがポイントです。",
      },
    ],
    quiz: [
      { q: "デザイン言語の役割として正しいのは?", choices: ["製品ごとに毎回まったく違う形にする", "ブランドの価値を共通の造形ルールで表し、一貫性を保つ", "ロゴを大きくする"], answer: 1, explain: "共通のルールにより、担当者や製品が変わっても一貫した印象になります。" },
      { q: "よいデザインガイドラインの特徴は?", choices: ["すべての寸法を細かく固定する", "理由と自由にしてよい範囲も示す", "文章だけで図を使わない"], answer: 1, explain: "理由がわかると応用がききます。自由領域があると製品ごとに最適化できます。" },
      { q: "定番品のモデルチェンジで「継承」を選ぶ主な理由は?", choices: ["既存ユーザの認知や愛着を生かすため", "金型を流用するため", "色を減らすため"], answer: 0, explain: "象徴的な要素を残すことで、ブランドの認知を保ちながら改良できます。" },
    ],
    lessons: ["8-2"],
  },
  {
    id: "design-rights",
    part: "design",
    title: "【上級】意匠権と知的財産",
    minutes: 22,
    level: 3,
    lead: "苦労して生み出したデザインも、守る手段がなければすぐに模倣されます。逆に、他社の権利を知らずに侵害してしまうこともあります。日本の意匠法の基本、ほかの知的財産権との違い、調査の方法を学びます。",
    body: `
<div class="tb-note">この章は日本の制度の基本をまとめた学習用の解説で、法的助言ではありません。法令や運用は改正されることがあるため、実務では必ず特許庁などの公式情報を確認し、具体的な案件は<b>弁理士</b>などの専門家に相談してください。</div>
<h2>意匠法で守られるもの</h2>
<p><b>意匠</b>とは、物品 (またはその部分) の形状・模様・色彩などで、視覚を通じて美感を起こさせるものです。2020 年 4 月施行の改正で、物品に記録・表示されない<b>画像</b>や、<b>建築物</b>、<b>内装</b>も保護の対象に加わりました。</p>
<table class="tb-table">
  <tr><th>主な登録要件</th><th>内容</th></tr>
  <tr><td>工業上利用できる</td><td>量産できる (一品物の美術品は対象外)</td></tr>
  <tr><td>新規性</td><td>出願前に公知の意匠と同一・類似でない</td></tr>
  <tr><td>創作非容易性</td><td>公知の形状などから容易に創作できたものでない</td></tr>
  <tr><td>先願</td><td>同一・類似の意匠について最も先に出願した者が登録を受けられる</td></tr>
  <tr><td>不登録事由に当たらない</td><td>機能を確保するために不可欠な形状のみからなる意匠などは登録できない</td></tr>
</table>
<div class="tb-note">自分で展示会や Web に公開しても新規性は失われます。一定の期間内 (現行は公開から 1 年以内) に手続をすれば例外の適用を受けられる制度 (新規性喪失の例外) がありますが、要件があるため、<b>公開前に出願</b>するのが原則です。</div>
<h2>出願から登録まで</h2>
<ol class="tb-flow">
  <li><b>先行意匠の調査</b> (J-PlatPat など)</li>
  <li><b>出願</b>: 願書と図面 (正面・背面・左右側面・平面・底面の六面図など、または写真・3D の図) を特許庁へ</li>
  <li><b>審査</b>: 審査官が登録要件を審査 (意匠は実体審査あり。審査請求は不要)</li>
  <li><b>登録査定 → 登録料の納付 → 設定登録</b>で権利が発生し、意匠公報に掲載</li>
</ol>
<p>存続期間は、2020 年 4 月 1 日以降の出願について<b>出願日から最長 25 年</b>です (それ以前の出願は、登録日から 20 年)。権利を維持するには登録料を毎年納付します。また、出願人の請求により登録後最長 3 年間、意匠を秘密にできる<b>秘密意匠</b>の制度もあります。</p>
<svg class="tb-chart" viewBox="0 0 520 120" role="img" aria-label="意匠登録の流れ">
<g class="k-shadow"><rect class="k-panel" x="8" y="30" width="92" height="50" rx="8"/></g><circle class="k-badge" cx="54" cy="30" r="10" style="fill:var(--tb-accent)"/><text class="k-badge-t" x="54" y="34" text-anchor="middle">1</text><text class="lbl" x="54" y="62" text-anchor="middle">調査</text><line x1="102" y1="55" x2="118" y2="55" style="stroke:var(--k-line)" stroke-width="1.6" marker-end="url(#k-arrow)"/><g class="k-shadow"><rect class="k-panel" x="112" y="30" width="92" height="50" rx="8"/></g><circle class="k-badge" cx="158" cy="30" r="10" style="fill:var(--tb-accent)"/><text class="k-badge-t" x="158" y="34" text-anchor="middle">2</text><text class="lbl" x="158" y="62" text-anchor="middle">出願</text><line x1="206" y1="55" x2="222" y2="55" style="stroke:var(--k-line)" stroke-width="1.6" marker-end="url(#k-arrow)"/><g class="k-shadow"><rect class="k-panel" x="216" y="30" width="92" height="50" rx="8"/></g><circle class="k-badge" cx="262" cy="30" r="10" style="fill:var(--tb-accent)"/><text class="k-badge-t" x="262" y="34" text-anchor="middle">3</text><text class="lbl" x="262" y="62" text-anchor="middle">実体審査</text><line x1="310" y1="55" x2="326" y2="55" style="stroke:var(--k-line)" stroke-width="1.6" marker-end="url(#k-arrow)"/><g class="k-shadow"><rect class="k-panel" x="320" y="30" width="92" height="50" rx="8"/></g><circle class="k-badge" cx="366" cy="30" r="10" style="fill:var(--tb-accent)"/><text class="k-badge-t" x="366" y="34" text-anchor="middle">4</text><text class="lbl" x="366" y="62" text-anchor="middle">登録査定</text><line x1="414" y1="55" x2="430" y2="55" style="stroke:var(--k-line)" stroke-width="1.6" marker-end="url(#k-arrow)"/><g class="k-shadow"><rect class="k-panel" x="424" y="30" width="92" height="50" rx="8" style="stroke:var(--tb-accent)" stroke-width="2"/></g><circle class="k-badge" cx="470" cy="30" r="10" style="fill:var(--tb-accent)"/><text class="k-badge-t" x="470" y="34" text-anchor="middle">5</text><text class="lbl" x="470" y="62" text-anchor="middle" style="fill:var(--tb-accent)">登録料→登録</text><text class="lbl" x="260" y="108" text-anchor="middle">登録で権利発生 (出願日から最長 25 年)</text>
</svg>
<p class="tb-caption">図: 意匠登録までの主な流れ。意匠は審査請求なしで実体審査が行われる</p>
<h2>さまざまな意匠の制度</h2>
<table class="tb-table">
  <tr><th>制度</th><th>内容</th><th>使いどころ</th></tr>
  <tr><td>部分意匠</td><td>物品の一部分 (グリップ形状など) について登録</td><td>特徴的な部分だけを模倣されるのを防ぐ</td></tr>
  <tr><td>関連意匠</td><td>自分の本意匠に類似する意匠も登録できる。2020 年改正で、本意匠の出願日から 10 年以内まで出願可能に</td><td>バリエーションや、デザイン言語を継承した後継機を守る</td></tr>
  <tr><td>画像意匠</td><td>操作画面や、機器の機能を発揮した結果として表示される画像</td><td>GUI、投影画像</td></tr>
  <tr><td>建築物・内装</td><td>建物の外観や、店舗などの内装</td><td>店舗デザインのブランド保護</td></tr>
  <tr><td>組物の意匠</td><td>セットで使う物品の全体 (食器セットなど)</td><td>シリーズ全体の統一感を保護</td></tr>
</table>
<svg class="tb-chart" viewBox="0 0 520 188" role="img" aria-label="部分意匠の図面表現">
<path d="M60,48 L60,140 Q60,156 76,156 L114,156 Q130,156 130,140 L130,48" fill="none" style="stroke:var(--k-line-2)" stroke-width="1.5" stroke-dasharray="5 4"/><ellipse cx="95" cy="48" rx="35" ry="8" fill="none" style="stroke:var(--k-line-2)" stroke-width="1.5" stroke-dasharray="5 4"/><path d="M130,64 C182,60 182,136 130,132 L130,118 C162,120 162,76 130,78 Z" style="fill:var(--tb-accent);stroke:var(--tb-accent)" fill-opacity="0.18" stroke-width="2.6"/><text class="lbl" x="105" y="178" text-anchor="middle">マグカップの取っ手</text><line x1="240" y1="60" x2="290" y2="60" style="stroke:var(--tb-accent)" stroke-width="3"/><text class="lbl" x="300" y="64">実線: 登録を受けたい部分</text><line x1="240" y1="100" x2="290" y2="100" style="stroke:var(--k-line-2)" stroke-width="1.5" stroke-dasharray="5 4"/><text class="lbl" x="300" y="104">破線: その他の部分</text><text class="tick" x="240" y="140">特徴的な部分だけの模倣も防げる</text>
</svg>
<p class="tb-caption">図: 部分意匠では、権利を求める部分を実線、それ以外を破線などで描き分ける (表し方の一例)</p>
<h2>ほかの知的財産権との違い</h2>
<table class="tb-table">
  <tr><th>権利</th><th>保護対象</th><th>審査</th><th>存続期間 (原則)</th></tr>
  <tr><td>意匠権</td><td>物品・画像・建築物・内装のデザイン</td><td>実体審査あり</td><td>出願日から最長 25 年</td></tr>
  <tr><td>特許権</td><td>技術的なアイデア (発明)</td><td>審査請求により実体審査</td><td>出願日から 20 年 (一部延長制度あり)</td></tr>
  <tr><td>実用新案権</td><td>物品の形状・構造・組合せに関する考案 (小発明)</td><td>実体審査なし (基礎的要件のみ)</td><td>出願日から 10 年</td></tr>
  <tr><td>商標権</td><td>商品・サービスに使うマーク (文字・図形・立体形状など)</td><td>実体審査あり</td><td>登録日から 10 年、更新可能</td></tr>
  <tr><td>著作権</td><td>思想・感情の創作的表現</td><td>登録不要 (創作で発生)</td><td>原則として著作者の死後 70 年</td></tr>
</table>
<p>1 つの製品を複数の権利で重ねて守ることもあります (形は意匠、内部機構は特許、ロゴは商標)。量産される工業製品の形は、著作権では保護されにくいとされるため、意匠登録が重要になります。</p>
<h2>他社意匠の調査 — J-PlatPat</h2>
<p><b>J-PlatPat</b> (特許情報プラットフォーム) は、特許庁の公報を無料で検索できるサービスです。意匠は<b>日本意匠分類</b>や物品名、意匠に係る物品の説明などで検索し、図面を見て類似性を確認します。</p>
<ul>
  <li>開発の<b>初期</b> (コンセプト段階) と、<b>形が固まった段階</b>の両方で調査する</li>
  <li>類否 (似ているかどうか) の判断は、物品の同一・類似と、形状などの全体的な印象で行われ、専門的な判断が必要</li>
  <li>類似が疑われる意匠を見つけたら、自己判断で進めず弁理士に相談する</li>
  <li>海外で販売する場合は、その国・地域ごとに権利が必要 (権利は国ごと)</li>
</ul>
<div class="tb-tip"><b>3DCAD Studio</b>: 出願図面の検討には、正面・側面などの視点から高解像度画像の保存が便利です (正式な図面の要件は特許庁の案内に従ってください)。</div>`,
    points: ["意匠は物品などの形状・模様・色彩で美感を起こさせるもの。2020 年改正で画像・建築物・内装も対象", "主な登録要件は工業上利用可能性・新規性・創作非容易性。公開前に出願が原則", "存続期間は 2020 年 4 月以降の出願で出願日から最長 25 年。部分意匠・関連意匠で戦略的に守る", "J-PlatPat で他社意匠を調査し、判断は弁理士に相談。法令は改正されるので公式情報を確認"],
    exercises: [
      {
        q: "2024 年 6 月 1 日に出願し、2025 年 3 月 1 日に設定登録された意匠権は、最長でいつまで存続しますか? (年金をすべて納付したとする)",
        a: "2020 年 4 月以降の出願なので、<b>出願日から 25 年</b>。2024 年 6 月 1 日から 25 年 → <b>2049 年 6 月 1 日</b>まで (満了日の扱いの細部は公式情報で確認)。登録日ではなく出願日が起点である点に注意します。",
      },
      {
        q: "新しい電動ドライバーで、グリップ部の形だけが特に独創的です。全体意匠と部分意匠のどちらで出願を検討すべきですか?",
        a: "<b>部分意匠</b>の出願を検討します。全体意匠だけだと、他社がグリップの形だけをまねて他の部分を変えた場合に、全体として類似しないと判断されるおそれがあります。必要に応じて全体意匠と組み合わせ、弁理士と出願戦略を相談します。",
      },
    ],
    quiz: [
      { q: "日本の意匠権の存続期間 (2020 年 4 月以降の出願) は?", choices: ["登録日から 20 年", "出願日から最長 25 年", "出願日から 10 年"], answer: 1, explain: "2019 年改正法 (2020 年 4 月施行) により、出願日から最長 25 年になりました。" },
      { q: "実体審査を行わずに登録されるのは?", choices: ["意匠権", "商標権", "実用新案権"], answer: 2, explain: "実用新案は方式と基礎的要件のみで登録されます。" },
      { q: "製品の特徴的な一部分だけの模倣を防ぎたいときに有効な制度は?", choices: ["部分意匠", "秘密意匠", "組物の意匠"], answer: 0, explain: "部分意匠は物品の一部分の形状などを保護します。" },
    ],
  },
  {
    id: "design-review",
    part: "design",
    title: "【中級】デザインレビューとプレゼンテーション",
    minutes: 18,
    level: 2,
    lead: "デザインは、関係者に伝わり、選ばれて初めて製品になります。評価軸の決め方、ムードボード、比較案の見せ方、試作の使い分け、そして決めたことを記録する方法を学びます。",
    body: `
<h2>評価軸を先に決める</h2>
<p>「どれが好きか」で選ぶと、声の大きい人や上位者の好みで決まりがちです。レビューの<b>前に</b>、デザインブリーフに沿った評価軸を合意しておきます。</p>
<table class="tb-table">
  <tr><th>評価軸</th><th>重み</th><th>A 案</th><th>B 案</th><th>C 案</th></tr>
  <tr><td>コンセプトとの一致</td><td>3</td><td>4</td><td>5</td><td>3</td></tr>
  <tr><td>使いやすさ</td><td>3</td><td>4</td><td>3</td><td>5</td></tr>
  <tr><td>ブランドらしさ</td><td>2</td><td>3</td><td>5</td><td>3</td></tr>
  <tr><td>製造性・コスト</td><td>2</td><td>5</td><td>2</td><td>4</td></tr>
  <tr><td><b>合計 (重み × 点)</b></td><td></td><td><b>40</b></td><td><b>38</b></td><td><b>40</b></td></tr>
</table>
<p class="tb-formula">合計 = Σ (重み × 評点)</p>
<p>点数はあくまで議論の材料です。同点や僅差のときは、<b>どの軸で差がついたか</b>を話し合い、弱点を改善した案を作ることもあります。</p>
<h2>ムードボード</h2>
<p><b>ムードボード</b>は、目指す雰囲気を写真・素材・色見本・言葉で 1 枚に集めたものです。形を描く前に「方向性」を共有できます。</p>
<ul>
  <li>製品写真だけでなく、建築・家具・自然・ファッションなど<b>他分野</b>からも集める</li>
  <li>キーワード (例: 静か・軽い・誠実) を添えて、なぜその画像かを説明できるようにする</li>
  <li>「目指さない方向」のボードを作ると、ずれがはっきりする</li>
</ul>
<h2>比較案の見せ方</h2>
<ul>
  <li><b>条件をそろえる</b>: 同じ角度・同じ光・同じ背景・同じ縮尺で並べる (片方だけ美しいレンダリングにしない)</li>
  <li><b>案の数</b>は 3 案程度。違いがはっきりした方向性で出す</li>
  <li>各案に<b>一言のコンセプト名</b>と、長所・短所を添える</li>
  <li>使用シーン (手に持った状態、設置した状態) を見せる</li>
</ul>
<svg class="tb-chart" viewBox="0 0 520 168" role="img" aria-label="比較案は条件をそろえて並べる">
<text class="tick" x="260" y="20" text-anchor="middle">同じ角度・光・縮尺・接地線</text><rect class="k-panel" x="20" y="30" width="152" height="108" rx="8"/><rect class="k-ground" x="30" y="112" width="132" height="8"/><ellipse cx="96" cy="112" rx="40" ry="3" style="fill:var(--tb-text)" opacity="0.13"/><text class="lbl" x="96" y="158" text-anchor="middle">A: 端正</text><path d="M152,46 L144,52" style="stroke:var(--tb-warn)" stroke-width="2" marker-end="url(#k-arrow)"/><rect class="k-panel" x="184" y="30" width="152" height="108" rx="8"/><rect class="k-ground" x="194" y="112" width="132" height="8"/><ellipse cx="260" cy="112" rx="40" ry="3" style="fill:var(--tb-text)" opacity="0.13"/><text class="lbl" x="260" y="158" text-anchor="middle">B: やわらか</text><path d="M316,46 L308,52" style="stroke:var(--tb-warn)" stroke-width="2" marker-end="url(#k-arrow)"/><rect class="k-panel" x="348" y="30" width="152" height="108" rx="8"/><rect class="k-ground" x="358" y="112" width="132" height="8"/><ellipse cx="424" cy="112" rx="40" ry="3" style="fill:var(--tb-text)" opacity="0.13"/><text class="lbl" x="424" y="158" text-anchor="middle">C: 有機的</text><path d="M480,46 L472,52" style="stroke:var(--tb-warn)" stroke-width="2" marker-end="url(#k-arrow)"/><g class="k-shadow"><rect class="k-alu" x="70" y="62" width="64" height="50" rx="4"/><rect class="k-alu" x="234" y="62" width="64" height="50" rx="16"/><ellipse class="k-alu" cx="430" cy="87" rx="34" ry="25"/></g><path d="M76,66 L128,66" fill="none" style="stroke:#ffffff" stroke-width="1.6" opacity="0.8"/><path d="M248,66 L284,66" fill="none" style="stroke:#ffffff" stroke-width="1.6" opacity="0.8"/><path d="M410.3,79.8 A21,21 0 0 1 426.4,66.3" fill="none" style="stroke:#ffffff" stroke-width="2" opacity="0.9"/><line class="guide" x1="20" y1="112" x2="500" y2="112"/>
</svg>
<h2>レンダリング・模型・3D プリント試作の使い分け</h2>
<table class="tb-table">
  <tr><th>手段</th><th>確かめられること</th><th>注意点</th></tr>
  <tr><td>レンダリング</td><td>全体の印象、色・素材の組合せ、多案の比較</td><td>実物より美しく見えやすい。大きさ・重さ・手触りはわからない</td></tr>
  <tr><td>ボリュームモデル (発泡材など)</td><td>実寸の大きさ感、持ちやすさ、置いたときの存在感</td><td>細部や質感は再現しにくい</td></tr>
  <tr><td>3D プリント試作</td><td>正確な形状、R やハイライトの見え方、組立・操作部の感触</td><td>積層痕や材質の違い。塗装・研磨で外観を近づける</td></tr>
  <tr><td>デザインモック (外観模型)</td><td>量産品に近い色・つや・質感</td><td>費用と時間がかかる。最終確認向け</td></tr>
</table>
<svg class="tb-chart" viewBox="0 0 520 162" role="img" aria-label="評価軸ごとの得点の比較">
<line class="grid" x1="246" y1="24" x2="246" y2="150"/><line class="axis" x1="150" y1="20" x2="150" y2="152"/><text class="lbl" x="140" y="45" text-anchor="end">コンセプト</text><rect x="150" y="32" width="96" height="10" rx="2" style="fill:var(--k-line-2)"/><rect class="k-accent" x="150" y="43" width="120" height="10" rx="2" stroke-width="0.6"/><text class="k-note" x="251" y="41">12</text><text class="k-note" x="275" y="52" style="fill:var(--tb-accent)">15</text><text class="lbl" x="140" y="75" text-anchor="end">使いやすさ</text><rect x="150" y="62" width="96" height="10" rx="2" style="fill:var(--k-line-2)"/><rect class="k-accent" x="150" y="73" width="72" height="10" rx="2" stroke-width="0.6"/><text class="k-note" x="251" y="71">12</text><text class="k-note" x="227" y="82" style="fill:var(--tb-accent)">9</text><text class="lbl" x="140" y="105" text-anchor="end">ブランド</text><rect x="150" y="92" width="48" height="10" rx="2" style="fill:var(--k-line-2)"/><rect class="k-accent" x="150" y="103" width="80" height="10" rx="2" stroke-width="0.6"/><text class="k-note" x="203" y="101">6</text><text class="k-note" x="235" y="112" style="fill:var(--tb-accent)">10</text><text class="lbl" x="140" y="135" text-anchor="end">製造性</text><rect x="150" y="122" width="80" height="10" rx="2" style="fill:var(--k-line-2)"/><rect class="k-accent" x="150" y="133" width="32" height="10" rx="2" stroke-width="0.6"/><text class="k-note" x="235" y="131">10</text><text class="k-note" x="187" y="142" style="fill:var(--tb-accent)">4</text><rect x="372" y="34" width="14" height="10" rx="2" style="fill:var(--k-line-2)"/><text class="tick" x="392" y="43">A 案 (計 40)</text><rect class="k-accent" x="372" y="56" width="14" height="10" rx="2" stroke-width="0.6"/><text class="tick" x="392" y="65">B 案 (計 38)</text><text class="tick" x="372" y="104">合計が近くても</text><text class="tick" x="372" y="120">差のつく軸が違う</text>
</svg>
<p class="tb-caption">図: 上の表の A 案と B 案を、重み × 評点で軸ごとに並べたもの。どこで差がついたかが一目でわかる</p>
<h2>意思決定の記録</h2>
<p>レビューで決めたことは、すぐに記録して共有します。後で「なぜこの形になったのか」を説明でき、同じ議論の蒸し返しを防げます。</p>
<pre class="tb-pre">デザインレビュー記録 (例)
日付 / 参加者 : 2026-10-19 / 企画・デザイン・設計・製造
対象          : 卓上ライト 2 次案 (A・B・C)
決定          : B 案で進める
理由          : コンセプト一致とブランドらしさが最高点
条件・宿題    : 製造性の課題 (アンダーカット) を設計が対策案 → 11/2 まで
不採用案の扱い: C 案の操作ダイヤル形状は B 案に取り込む検討
次回          : 3D プリント試作で操作感を確認</pre>
<div class="tb-tip"><b>3DCAD Studio</b>: 比較案は同じ視点・リアル表示の設定で高解像度画像の保存をすると、条件をそろえやすくなります。断面図で内部の収まりを示し、3D プリントチェックの後に STL/3MF 書き出しで試作しましょう。</div>`,
    points: ["評価軸と重みはレビューの前に合意し、好みだけで決めない", "ムードボードで形を描く前に方向性を共有する", "比較案は角度・光・縮尺をそろえ、3 案程度の明確な方向性で見せる", "レンダリング・模型・3D プリントを目的で使い分け、決定と理由を記録する"],
    exercises: [
      {
        q: "本文の評価表で、「製造性・コスト」の重みを 2 から 4 に上げると、各案の合計点と順位はどうなりますか?",
        a: "製造性の点 × 追加の重み 2 を加えます。A: 40 + 5×2 = <b>50</b>、B: 38 + 2×2 = <b>42</b>、C: 40 + 4×2 = <b>48</b>。順位は <b>A → C → B</b>。重みの設定で結論が変わるため、重みは事前に合意しておくことが重要です。",
      },
    ],
    quiz: [
      { q: "比較案を見せるときに適切なのは?", choices: ["推したい案だけ美しく仕上げる", "角度・光・縮尺をそろえて並べる", "できるだけ多く (10 案以上) 見せる"], answer: 1, explain: "条件をそろえないと、案そのものではなく見せ方の差で選ばれてしまいます。" },
      { q: "実寸の大きさ感や持ちやすさを確かめるのに適した手段は?", choices: ["レンダリング", "ボリュームモデル (発泡材など)", "ムードボード"], answer: 1, explain: "大きさ・持ちやすさは実寸の立体で確かめるのが確実です。" },
      { q: "意思決定の記録に必ず残すべきものは?", choices: ["決定内容と理由、宿題", "参加者の好きな色", "レンダリングのファイル容量"], answer: 0, explain: "決定・理由・条件を残すと、後で説明でき、議論の蒸し返しを防げます。" },
    ],
    lessons: ["8-2", "1-1"],
  },
];
