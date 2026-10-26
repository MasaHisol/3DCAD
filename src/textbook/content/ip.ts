import type { TextChapter } from "../types";

// 知的財産 (特許・意匠) — 設計者のための実務入門
const NOTE = `<div class="tb-note">この章は日本の制度の基本をまとめた学習用の解説で、法的助言ではありません。法令や運用は改正されることがあります。最新の制度は特許庁の情報や弁理士に確認し、具体的な案件は専門家に相談してください。</div>`;

export const IP: TextChapter[] = [
  {
    id: "patent-basics",
    part: "knowhow",
    title: "特許の基礎 — 設計者が知っておくべき発明の守り方",
    minutes: 25,
    level: 2,
    lead: "設計の現場では、日々の工夫の中に特許になり得る発明が埋もれています。特許とは何を守る権利で、どんな要件を満たせば取れるのか、出願から登録までどう進むのかを学び、特許・実用新案・意匠・商標・ノウハウ秘匿をどう使い分けるかを考えます。",
    body: `
${NOTE}
<h2>特許で守られるもの — 発明</h2>
<p>特許法の<b>発明</b>は「自然法則を利用した技術的思想の創作のうち高度のもの」です。製品の形そのものではなく、<b>課題を解決する技術的なアイデア</b>を守ります。機械設計では、機構・構造、制御方法、製造方法などが対象になります。一方、計算方法そのもの、ゲームのルールのような人為的な取決め、自然法則そのもの (発見) は発明に当たりません。</p>
<p>特許権者は、特許発明を<b>業として実施する権利を専有</b>します。他人が無断で製造・販売・使用などをすれば、差止めや損害賠償を請求できます。権利は<b>国ごと</b>で、日本の特許は日本国内でしか効力がありません。</p>
<h2>特許を受けるための主な要件</h2>
<table class="tb-table">
  <tr><th>要件</th><th>内容</th><th>設計者の視点</th></tr>
  <tr><td>産業上の利用可能性</td><td>産業として利用できる</td><td>機械・装置の発明ならまず満たす</td></tr>
  <tr><td>新規性</td><td>出願前に公然知られた・実施された・刊行物や Web に載った発明でない</td><td>自分の展示会発表・論文・カタログ・Web 公開でも失われる</td></tr>
  <tr><td>進歩性</td><td>その分野の通常の知識を持つ者 (当業者) が公知技術から容易に考え出せない</td><td>公知技術の単なる寄せ集めや設計変更程度ではだめ。予想外の効果が鍵</td></tr>
  <tr><td>先願</td><td>同じ発明は最も先に出願した者だけが特許を受けられる (先願主義)</td><td>発明した日ではなく<b>出願日</b>の勝負</td></tr>
  <tr><td>その他</td><td>公序良俗に反しない、明細書の記載要件を満たす など</td><td>第三者が実施できる程度に具体的に書く</td></tr>
</table>
<div class="tb-note"><b>新規性喪失の例外</b>: 自ら公開した場合でも、公開日から <b>1 年以内</b>に出願し、所定の手続 (証明書の提出など) をすれば、その公開によって新規性を失わなかったものとみなされる制度があります。ただし、その間に他人が同じ発明を独自に出願・公開すると救済されないことがあり、外国では扱いが異なります。<b>公開前に出願</b>が原則です。</div>
<h2>出願から登録までの流れ</h2>
<svg class="tb-chart" viewBox="0 0 520 250" role="img" aria-label="特許出願から登録までの流れとタイムライン">
<text class="k-title" x="260" y="20" text-anchor="middle">特許出願から権利消滅まで (一例)</text>
<line class="k-edge" x1="30" y1="200" x2="500" y2="200"/>
<g class="k-thin"><line x1="30" y1="194" x2="30" y2="206"/><line x1="58" y1="194" x2="58" y2="206"/><line x1="114" y1="194" x2="114" y2="206"/><line x1="500" y1="194" x2="500" y2="206"/></g>
<g class="tick"><text x="30" y="220" text-anchor="middle">出願</text><text x="62" y="236" text-anchor="middle">1.5 年</text><text x="114" y="220" text-anchor="middle">3 年</text><text x="500" y="220" text-anchor="end">20 年</text></g>
<g class="k-shadow"><rect class="k-panel" x="14" y="36" width="88" height="46" rx="8"/><rect class="k-panel" x="114" y="36" width="88" height="46" rx="8"/><rect class="k-panel" x="214" y="36" width="88" height="46" rx="8"/><rect class="k-panel" x="314" y="36" width="88" height="46" rx="8"/><rect class="k-panel" x="414" y="36" width="92" height="46" rx="8" style="stroke:var(--tb-accent)" stroke-width="2"/></g>
<circle class="k-badge" cx="58" cy="36" r="9"/><text class="k-badge-t" x="58" y="40" text-anchor="middle">1</text><text class="lbl" x="58" y="64" text-anchor="middle">出願</text>
<circle class="k-badge" cx="158" cy="36" r="9"/><text class="k-badge-t" x="158" y="40" text-anchor="middle">2</text><text class="lbl" x="158" y="64" text-anchor="middle">審査請求</text>
<circle class="k-badge" cx="258" cy="36" r="9"/><text class="k-badge-t" x="258" y="40" text-anchor="middle">3</text><text class="lbl" x="258" y="64" text-anchor="middle">実体審査</text>
<circle class="k-badge" cx="358" cy="36" r="9"/><text class="k-badge-t" x="358" y="40" text-anchor="middle">4</text><text class="lbl" x="358" y="64" text-anchor="middle">特許査定</text>
<circle class="k-badge" cx="460" cy="36" r="9"/><text class="k-badge-t" x="460" y="40" text-anchor="middle">5</text><text class="lbl" x="460" y="58" text-anchor="middle">特許料納付</text><text class="lbl" x="460" y="74" text-anchor="middle">→ 設定登録</text>
<line class="k-move" x1="102" y1="59" x2="112" y2="59"/><line class="k-move" x1="202" y1="59" x2="212" y2="59"/><line class="k-move" x1="302" y1="59" x2="312" y2="59"/><line class="k-move" x1="402" y1="59" x2="412" y2="59"/>
<path class="k-hidden" d="M258,84 Q258,108 290,108 L330,108"/><text class="k-note" x="334" y="112">拒絶理由通知 → 意見書・補正書</text>
<text class="k-note" x="158" y="100" text-anchor="middle">出願から 3 年以内</text>
<rect x="30" y="160" width="28" height="16" rx="3" style="fill:var(--k-line-2)" fill-opacity="0.35"/>
<line x1="58" y1="152" x2="58" y2="182" style="stroke:var(--tb-bad)" stroke-width="2"/><text class="k-bad-t" x="64" y="150">出願公開</text>
<rect x="150" y="160" width="350" height="16" rx="3" style="fill:var(--tb-good)" fill-opacity="0.75"/>
<text class="k-badge-t" x="325" y="172" text-anchor="middle">権利期間 (設定登録 〜 出願日から 20 年)</text>
</svg>
<p class="tb-caption">図: 出願後 1 年 6 月で内容が公開され、審査請求をしたものだけが実体審査される。審査期間は案件によって異なる</p>
<ol class="tb-flow">
  <li><b>出願</b>: 願書・明細書・特許請求の範囲・図面・要約書を特許庁へ。この日が<b>出願日</b>で、先願の基準と存続期間の起点</li>
  <li><b>方式審査</b>: 書類の形式をチェック</li>
  <li><b>出願公開</b>: 出願 (優先日) から <b>1 年 6 月</b>経つと、審査の進み具合に関係なく内容が公報で公開される</li>
  <li><b>審査請求</b>: 出願から <b>3 年以内</b>に請求しないと、出願は取り下げたものとみなされる。請求したものだけが実体審査される</li>
  <li><b>実体審査</b>: 要件を満たさなければ<b>拒絶理由通知</b>。意見書や補正書で反論・修正できる</li>
  <li><b>特許査定 → 特許料の納付 → 設定登録</b>で権利が発生し、特許公報に掲載。拒絶査定には不服審判で争う道がある</li>
</ol>
<p>存続期間は<b>出願日から 20 年</b>です (医薬品などには延長の制度があります)。権利を維持するには毎年の特許料が必要で、納付しないと権利は消滅します。消滅した特許の技術は、原則として誰でも自由に使えます。</p>
<h2>職務発明 — 会社で生まれた発明は誰のもの?</h2>
<p>従業者が職務として行った発明を<b>職務発明</b>といいます。特許法では、勤務規則などであらかじめ定めておけば、特許を受ける権利を会社 (使用者) が取得できるとされ、その場合、発明者である従業者は<b>相当の利益</b> (金銭などの経済上の利益) を受ける権利を持ちます。具体的な扱いは会社の規程によるので、自社の職務発明規程と発明届の手順を確認しておきましょう。発明者として名前が載るのは、実際に技術的な創作に貢献した人です。</p>
<h2>どの手段で守るか — 使い分け</h2>
<svg class="tb-chart" viewBox="0 0 520 230" role="img" aria-label="守りたいものによる知的財産の使い分け">
<text class="k-title" x="260" y="20" text-anchor="middle">守りたいものから選ぶ (目安)</text>
<g class="k-shadow"><rect class="k-panel" x="186" y="34" width="148" height="40" rx="8" style="stroke:var(--tb-accent)" stroke-width="2"/></g>
<text class="lbl" x="260" y="59" text-anchor="middle">何を守りたい?</text>
<path class="k-thin" d="M260,74 L260,90 M56,90 L464,90 M56,90 L56,104 M158,90 L158,104 M260,90 L260,104 M362,90 L362,104 M464,90 L464,104"/>
<g class="k-shadow"><rect class="k-panel" x="10" y="104" width="92" height="104" rx="8"/><rect class="k-panel" x="112" y="104" width="92" height="104" rx="8"/><rect class="k-panel" x="214" y="104" width="92" height="104" rx="8"/><rect class="k-panel" x="316" y="104" width="92" height="104" rx="8"/><rect class="k-panel" x="418" y="104" width="92" height="104" rx="8"/></g>
<text class="lbl" x="56" y="124" text-anchor="middle">仕組み・方法</text><text class="k-good-t" x="56" y="148" text-anchor="middle">特許</text><text class="k-note" x="56" y="170" text-anchor="middle">審査あり</text><text class="k-note" x="56" y="186" text-anchor="middle">出願から 20 年</text>
<text class="lbl" x="158" y="124" text-anchor="middle">小さな構造</text><text class="k-good-t" x="158" y="148" text-anchor="middle">実用新案</text><text class="k-note" x="158" y="170" text-anchor="middle">実体審査なし</text><text class="k-note" x="158" y="186" text-anchor="middle">出願から 10 年</text>
<text class="lbl" x="260" y="124" text-anchor="middle">形・デザイン</text><text class="k-good-t" x="260" y="148" text-anchor="middle">意匠</text><text class="k-note" x="260" y="170" text-anchor="middle">審査あり</text><text class="k-note" x="260" y="186" text-anchor="middle">出願から 25 年</text>
<text class="lbl" x="362" y="124" text-anchor="middle">名前・マーク</text><text class="k-good-t" x="362" y="148" text-anchor="middle">商標</text><text class="k-note" x="362" y="170" text-anchor="middle">審査あり</text><text class="k-note" x="362" y="186" text-anchor="middle">10 年・更新可</text>
<text class="lbl" x="464" y="124" text-anchor="middle">見えない製法</text><text class="k-good-t" x="464" y="148" text-anchor="middle">ノウハウ</text><text class="k-note" x="464" y="170" text-anchor="middle">秘密管理</text><text class="k-note" x="464" y="186" text-anchor="middle">秘密の間ずっと</text>
</svg>
<p class="tb-caption">図: 知的財産の使い分け。1 つの製品に複数を重ねることも多い</p>
<ul>
  <li><b>特許</b>: 製品を分解・観察すれば分かる仕組みは、出願して権利で守るのが基本。代わりに内容は公開される</li>
  <li><b>実用新案</b>: 物品の形状・構造・組合せの考案が対象。実体審査なしで早く登録されるが、権利行使の際には<b>技術評価書</b>を示して警告する必要があるなど制約がある</li>
  <li><b>ノウハウ秘匿</b>: 製品から読み取れない製造条件などは、出願せず社内で秘密管理する選択肢がある。不正競争防止法の営業秘密として保護を受けるには、<b>秘密管理性・有用性・非公知性</b>が必要。他社が独自に同じ技術を開発・出願するリスクは残る</li>
</ul>`,
    points: [
      "特許は課題を解決する技術的アイデア (発明) を守る。権利は国ごと",
      "主な要件は産業上の利用可能性・新規性・進歩性・先願。自社公開でも新規性は失われるので公開前に出願",
      "出願から 1 年 6 月で公開、3 年以内に審査請求、存続期間は出願日から 20 年",
      "職務発明は社内規程に従って届け出る。発明者は相当の利益を受ける権利を持つ",
      "仕組みは特許、小さな構造は実用新案、形は意匠、マークは商標、見えない製法はノウハウ秘匿",
    ],
    exercises: [
      {
        q: "2026 年 4 月 1 日に特許出願しました。(a) 出願公開されるのはいつごろですか。(b) 審査請求の期限はいつですか。(c) 登録された場合、権利は最長でいつまで続きますか (延長制度は考えない)。",
        a: "(a) 出願から 1 年 6 月 → <b>2027 年 10 月 1 日ごろ</b> (優先権の主張がない場合)。(b) 出願から 3 年以内 → <b>2029 年 4 月 1 日まで</b>。過ぎると取り下げたものとみなされる。(c) 出願日から 20 年 → <b>2046 年 4 月 1 日ごろ</b>まで (特許料を納付し続けた場合)。登録日ではなく出願日が起点です。期限の正確な数え方は公式情報で確認します。",
      },
      {
        q: "新しいワーク位置決め機構を考案しました。来月の展示会で実機を展示したいのですが、まだ出願していません。どう動くべきですか。",
        a: "展示すると新規性が失われるため、<b>展示前に出願</b>するのが原則です。社内の知財部門・弁理士に早急に相談し、間に合わなければ展示内容から機構の要部を外すことも検討します。やむを得ず先に公開した場合は、新規性喪失の例外 (公開から 1 年以内の出願と所定の手続) を使える可能性がありますが、他人の先願や外国での扱いのリスクが残るので、あくまで救済策と考えます。",
      },
    ],
    quiz: [
      { q: "特許の存続期間の起点と長さ (原則) は?", choices: ["登録日から 20 年", "出願日から 20 年", "出願日から 25 年"], answer: 1, explain: "特許権の存続期間は原則として出願日から 20 年です。" },
      { q: "審査請求をしないまま出願から 3 年が過ぎると?", choices: ["自動的に審査が始まる", "出願は取り下げたものとみなされる", "実用新案に変わる"], answer: 1, explain: "審査請求は出願から 3 年以内。期間内に請求しないと取り下げたものとみなされます。" },
      { q: "製品を見ても分からない成形条件の守り方として有力なのは?", choices: ["意匠登録", "ノウハウとして秘密管理", "商標登録"], answer: 1, explain: "出願すると内容が公開されるため、外から分からない製法は秘匿も有力な選択肢です。" },
      { q: "自社が展示会で発表した発明の新規性は?", choices: ["自社の発表なので失われない", "失われる (例外制度の手続をしない限り)", "国内なら失われない"], answer: 1, explain: "自ら公開しても新規性は失われます。救済には新規性喪失の例外の手続が必要です。" },
    ],
  },
  {
    id: "patent-claims",
    part: "knowhow",
    title: "特許明細書と請求項の読み方 — 権利範囲を正しくつかむ",
    minutes: 25,
    level: 3,
    lead: "特許公報は分厚く見えますが、権利の範囲を決めるのは「特許請求の範囲」の請求項です。請求項を構成要件に分け、製品がすべての要件を満たすかを確かめる読み方を、簡単なクランプ機構の例で練習します。",
    body: `
${NOTE}
<h2>特許公報の構成</h2>
<table class="tb-table">
  <tr><th>部分</th><th>内容</th><th>読み方のポイント</th></tr>
  <tr><td>書誌事項</td><td>番号・出願日・権利者・分類など</td><td>出願日から存続期間を、経過情報で権利が生きているかを確認</td></tr>
  <tr><td><b>特許請求の範囲</b></td><td>請求項 1, 2, … の文章</td><td><b>権利範囲そのもの</b>。最初に、最も丁寧に読む</td></tr>
  <tr><td>明細書</td><td>技術分野・背景技術・課題・解決手段・効果・実施形態</td><td>請求項の用語の意味を理解するために読む</td></tr>
  <tr><td>図面・要約書</td><td>実施形態の図、概要</td><td>要約や図は理解の助け。図の製品＝権利範囲ではない</td></tr>
</table>
<p>特許発明の技術的範囲は、<b>特許請求の範囲の記載に基づいて</b>定められ、用語の意味は明細書や図面を考慮して解釈されます。図面に描かれた形と似ているかどうかで判断するのは誤りです。</p>
<h2>請求項は構成要件の集まり</h2>
<p>請求項を意味のまとまりで A, B, C … に分けたものを<b>構成要件</b>といいます。対象製品 (イ号製品) が請求項の<b>すべての構成要件を満たす</b>とき、文言上その特許の技術的範囲に属します (<b>構成要件充足</b>、all-elements rule)。1 つでも欠ければ、原則として文言上は範囲外です。逆に、要件をすべて満たしたうえで別の要素を<b>付け加えても</b>範囲外にはなりません。</p>
<svg class="tb-chart" viewBox="0 0 520 230" role="img" aria-label="トグルクランプの請求項と構成要件の対応">
<text class="k-title" x="260" y="20" text-anchor="middle">請求項 1 の構成要件と実施形態の対応</text>
<rect class="k-ground" x="20" y="186" width="240" height="10"/>
<rect class="k-part" x="30" y="150" width="200" height="36" rx="4"/>
<rect class="k-part" x="60" y="110" width="26" height="40" rx="3"/>
<circle class="k-part-h" cx="73" cy="112" r="7"/>
<path class="k-alu" d="M70,104 L210,76 L214,90 L76,120 Z"/>
<rect class="k-rubber" x="190" y="90" width="26" height="14" rx="4"/>
<path class="k-edge" d="M110,150 L114,140 L106,132 L118,124 L108,116 L116,110" style="stroke:var(--k-dim)"/>
<g><circle class="k-badge" cx="40" cy="168" r="9"/><text class="k-badge-t" x="40" y="172" text-anchor="middle">A</text>
<circle class="k-badge" cx="52" cy="98" r="9"/><text class="k-badge-t" x="52" y="102" text-anchor="middle">B</text>
<circle class="k-badge" cx="232" cy="80" r="9"/><text class="k-badge-t" x="232" y="84" text-anchor="middle">C</text>
<circle class="k-badge" cx="132" cy="126" r="9"/><text class="k-badge-t" x="132" y="130" text-anchor="middle">D</text></g>
<g class="k-shadow"><rect class="k-panel" x="270" y="36" width="242" height="170" rx="8"/></g>
<text class="lbl" x="282" y="58">【請求項 1】クランプ装置であって</text>
<text class="lbl" x="282" y="84">A 基台と、</text>
<text class="lbl" x="282" y="106">B 前記基台に軸で回動自在に支持さ</text><text class="lbl" x="298" y="122">れたレバーと、</text>
<text class="lbl" x="282" y="144">C 前記レバーの先端に設けた弾性体</text><text class="lbl" x="298" y="160">の押さえパッドと、</text>
<text class="lbl" x="282" y="182">D 前記レバーを開放方向に付勢する</text><text class="lbl" x="298" y="198">ばねと、を備える。</text>
</svg>
<p class="tb-caption">図: 請求項を構成要件 A〜D に分け、実施形態の部品と対応づける。架空の例</p>
<h2>独立項と従属項</h2>
<p>他の請求項を引用しない請求項を<b>独立項</b>、「請求項 1 に記載のクランプ装置であって、前記ばねは圧縮コイルばねである」のように他の請求項を引用して限定を加えるものを<b>従属項</b>といいます。従属項は独立項の要件をすべて含んだうえで要件が増えるので、<b>範囲は狭く</b>なります。侵害の検討では、通常いちばん広い<b>独立項</b>から確認します。一方、独立項が無効と判断されても従属項が生き残ることがあるので、従属項も読み飛ばさないようにします。</p>
<h2>均等論 — 文言が違っても範囲に入る場合</h2>
<p>文言上は構成要件の一部が異なっていても、一定の条件を満たすと、特許発明と<b>均等</b>なものとして技術的範囲に属するとされることがあります (均等論)。日本の判例では、おおむね次のような観点が示されています。</p>
<ul>
  <li>異なる部分が特許発明の<b>本質的部分</b>ではない</li>
  <li>置き換えても特許発明の目的を達し、<b>同じ作用効果</b>を奏する</li>
  <li>その置き換えを製造時点で当業者が<b>容易に思いつく</b></li>
  <li>対象製品が出願時の公知技術などから容易に推考できたものではない</li>
  <li>出願手続の中で<b>意識的に除外</b>されたものに当たらない、など</li>
</ul>
<p>つまり「材料を少し変えた」「部品を同等品に置き換えた」程度では範囲から外れない可能性があります。判断は専門的なので、設計者は「文言で外れていても均等の可能性がある」と認識し、弁理士に相談することが大切です。</p>
<h2>充足判断の手順 — クレームチャート</h2>
<svg class="tb-chart" viewBox="0 0 520 200" role="img" aria-label="クレームチャートによる構成要件の充足判断">
<text class="k-title" x="260" y="20" text-anchor="middle">クレームチャート (対象製品と構成要件の対比)</text>
<g class="k-shadow"><rect class="k-panel" x="10" y="32" width="500" height="156" rx="8"/></g>
<g class="lbl"><text x="24" y="54">構成要件</text><text x="190" y="54">製品 X</text><text x="300" y="54">製品 Y</text><text x="410" y="54">製品 Z</text></g>
<line class="k-thin" x1="18" y1="62" x2="502" y2="62"/>
<g class="lbl"><text x="24" y="84">A 基台</text><text x="24" y="108">B 回動するレバー</text><text x="24" y="132">C 弾性体のパッド</text><text x="24" y="156">D 開放方向のばね</text></g>
<g class="k-good-t"><text x="200" y="84">○</text><text x="200" y="108">○</text><text x="200" y="132">○</text><text x="200" y="156">○</text>
<text x="310" y="84">○</text><text x="310" y="108">○</text><text x="310" y="156">○</text>
<text x="420" y="84">○</text><text x="420" y="108">○</text><text x="420" y="132">○</text></g>
<text class="k-bad-t" x="310" y="132">×</text><text class="k-bad-t" x="420" y="156">×</text>
<line class="k-thin" x1="18" y1="164" x2="502" y2="164"/>
<text class="k-bad-t" x="172" y="182">範囲内</text><text class="k-good-t" x="282" y="182">文言上外</text><text class="k-good-t" x="392" y="182">文言上外</text>
<text class="k-note" x="226" y="132">+ロック追加</text><text class="k-note" x="330" y="132">金属パッド</text><text class="k-note" x="440" y="156">手動で戻す</text>
</svg>
<p class="tb-caption">図: 要件を 1 行ずつ対比する。付加要素があっても全要件を満たせば範囲内。× の製品も均等の検討は別途必要</p>
<ol>
  <li>請求項を構成要件に分ける (「〜と、」「〜であって」で区切る)</li>
  <li>あいまいな用語は明細書の定義・説明で意味を確かめる</li>
  <li>対象製品の対応部分を特定し、要件ごとに ○/× を記録する</li>
  <li>すべて ○ なら範囲内の可能性が高い。× がある場合も均等の可能性を検討する</li>
  <li>結論は弁理士の見解を得る。自己判断の記録も残す</li>
</ol>`,
    points: [
      "権利範囲は特許請求の範囲 (請求項) で決まる。図面の形と似ているかでは判断しない",
      "請求項を構成要件に分け、すべての要件を満たせば文言上範囲内 (構成要件充足)",
      "要件を 1 つでも欠けば原則として文言上範囲外。要素を付け加えても範囲外にはならない",
      "従属項は独立項より狭い。侵害検討は独立項から",
      "文言が違っても均等論で範囲に入ることがある。判断は弁理士へ",
    ],
    exercises: [
      {
        q: "図の請求項 1 (A 基台、B 回動自在のレバー、C 先端の弾性体パッド、D 開放方向に付勢するばね) について、次の製品が文言上範囲に入るか判断しなさい。(1) A〜D をすべて備え、さらにレバーを閉位置で固定するロック機構を追加した製品。(2) A・B・D を備え、パッドが硬質の金属ブロックである製品。",
        a: "(1) A〜D をすべて満たすので<b>文言上範囲内</b>。ロック機構の追加は関係ありません。(2) 要件 C の「弾性体」を満たさないので<b>文言上は範囲外</b>。ただし、明細書で弾性体が担う役割 (傷防止など) を金属パッドが別の手段で果たしているなら、均等の可能性も含め弁理士に確認します。",
      },
      {
        q: "請求項 2 が「請求項 1 に記載のクランプ装置であって、前記ばねは圧縮コイルばねである」のとき、ねじりコイルばねを使った製品 (A〜D は満たす) は請求項 1・2 のどちらの範囲に入りますか。",
        a: "請求項 1 は「ばね」とだけ規定しているので、ねじりコイルばねでも D を満たし<b>請求項 1 の範囲内</b>。請求項 2 は「圧縮コイルばね」に限定しているので<b>請求項 2 の文言上は範囲外</b>です。独立項に当たれば侵害の問題になるので、従属項に外れることは安心材料になりません。",
      },
    ],
    quiz: [
      { q: "特許発明の技術的範囲を定める基準になるのは?", choices: ["要約書", "特許請求の範囲の記載", "図面に描かれた形状"], answer: 1, explain: "技術的範囲は特許請求の範囲の記載に基づき、明細書・図面を考慮して解釈されます。" },
      { q: "請求項の構成要件 A・B・C をすべて備え、さらに D を付け加えた製品は?", choices: ["D があるので範囲外", "文言上範囲内", "必ず無効"], answer: 1, explain: "全要件を満たせば、要素の追加があっても範囲内です。" },
      { q: "従属項と独立項の範囲の関係として正しいのは?", choices: ["従属項のほうが広い", "従属項のほうが狭い", "同じ"], answer: 1, explain: "従属項は独立項に限定を加えるので、範囲は狭くなります。" },
      { q: "構成要件の一部が文言上異なる製品について正しいのは?", choices: ["絶対に侵害にならない", "均等として範囲に属する場合がある", "必ず侵害になる"], answer: 1, explain: "一定の条件を満たすと均等論により範囲に属するとされることがあります。" },
    ],
  },
  {
    id: "patent-search-clearance",
    part: "knowhow",
    title: "特許調査と侵害回避設計 — J-PlatPat と設計の工夫",
    minutes: 25,
    level: 3,
    lead: "せっかく開発した製品が他社の特許に触れていたら、発売直前に設計変更を迫られます。逆に、調査すれば既に公知の技術に開発費を使わずに済みます。調査の種類と目的、J-PlatPat での検索式の組み立て方、回避設計の考え方、そして自社の発明を見つけて提案する方法を学びます。",
    body: `
${NOTE}
<h2>調査の種類とタイミング</h2>
<table class="tb-table">
  <tr><th>調査</th><th>目的</th><th>対象</th><th>タイミング</th></tr>
  <tr><td>先行技術調査</td><td>自分のアイデアが新しいか、出願する価値があるか</td><td>特許・実用新案の公報、論文、カタログなどすべての公知資料 (権利の生死は問わない)</td><td>構想段階・出願前</td></tr>
  <tr><td>侵害予防調査 (クリアランス)</td><td>自社製品が他社の権利に触れないか</td><td>販売する国で<b>権利が存続中</b>の特許・実用新案、および審査中の出願</td><td>設計固定前・量産前</td></tr>
  <tr><td>技術動向調査</td><td>他社の開発動向、空白領域を知る</td><td>分野の出願全体</td><td>テーマ企画時</td></tr>
  <tr><td>無効資料調査</td><td>問題になる他社特許を無効にできる資料を探す</td><td>その特許の出願日より前の公知資料</td><td>問題特許の発見時</td></tr>
</table>
<p>侵害予防調査では<b>請求項</b>を読み、自社製品が構成要件をすべて満たすかを見ます (前章「<a href="#/c/patent-claims">特許明細書と請求項の読み方</a>」)。審査中の出願は今後権利になる可能性があるので、経過を見守る (ウォッチング) 対象にします。</p>
<h2>J-PlatPat で検索を組み立てる</h2>
<p><b>J-PlatPat</b> は特許庁の公報などを無料で検索できるサービスです。検索は「キーワード」と「分類」を組み合わせます。</p>
<ul>
  <li><b>キーワード</b>: 同じ概念を表す言い換え (同義語・上位語・表記ゆれ) を OR でまとめる。例: クランプ OR 把持 OR 挟持、ばね OR バネ OR 弾性部材</li>
  <li><b>IPC・FI</b>: 技術分野による分類。FI は国際特許分類 (IPC) を日本で細分化したもの。言葉の違いに左右されず漏れを減らせる</li>
  <li><b>F ターム</b>: 目的・構造・材料など複数の観点から付けられる日本独自の分類。「何のために」「どんな構造で」の観点で絞り込める</li>
</ul>
<svg class="tb-chart" viewBox="0 0 520 240" role="img" aria-label="概念ごとに OR でまとめ AND で掛け合わせる検索式">
<text class="k-title" x="300" y="20" text-anchor="middle">検索式の組み立て: 概念ごとに OR、概念間を AND</text>
<circle cx="230" cy="110" r="70" style="fill:var(--tb-accent);stroke:var(--tb-accent)" fill-opacity="0.12" stroke-width="1.5"/>
<circle cx="330" cy="110" r="70" style="fill:var(--tb-good);stroke:var(--tb-good)" fill-opacity="0.12" stroke-width="1.5"/>
<circle cx="280" cy="160" r="52" style="fill:var(--tb-bad);stroke:var(--tb-bad)" fill-opacity="0.12" stroke-width="1.5"/>
<text class="lbl" x="190" y="80" text-anchor="middle">概念 1: 対象</text><text class="k-note" x="190" y="96" text-anchor="middle">クランプ OR 把持</text>
<text class="lbl" x="370" y="80" text-anchor="middle">概念 2: 手段</text><text class="k-note" x="370" y="96" text-anchor="middle">レバー OR 揺動</text>
<text class="lbl" x="280" y="196" text-anchor="middle">概念 3: 分類 (FI など)</text>
<text class="k-title" x="280" y="140" text-anchor="middle">★</text>
<line class="k-thin" x1="288" y1="136" x2="420" y2="150"/><text class="lbl" x="424" y="146">3 つの重なり</text><text class="lbl" x="424" y="162">= 読む候補</text>
<text class="k-note" x="8" y="196">件数が多すぎる → 概念を足す</text><text class="k-note" x="8" y="212">少なすぎる → 言い換えを増やす</text><text class="k-note" x="8" y="228">または概念を外す</text>
</svg>
<p class="tb-caption">図: 同じ概念の言い換えは OR、異なる概念は AND。キーワード検索と分類検索を併用して漏れとノイズを調整する</p>
<p>手順の目安: (1) 自分のアイデアを「対象・課題・手段」の概念に分ける → (2) 概念ごとに言い換えを列挙 → (3) ヒットした関連性の高い公報に付いている分類を確認し、分類でも検索 → (4) 件数を数百件程度に調整して、要約・代表図・請求項でふるい分け → (5) 重要な公報は全文と経過情報 (権利が生きているか) を確認。完全な調査は難しいので、重要な判断は専門の調査者・弁理士と行います。具体的な画面操作や分類表は J-PlatPat と特許庁の案内で確認してください。</p>
<h2>侵害回避設計の考え方</h2>
<svg class="tb-chart" viewBox="0 0 520 200" role="img" aria-label="回避設計: 構成要件を一つ外す">
<text class="k-title" x="260" y="20" text-anchor="middle">回避設計: 構成要件の 1 つを満たさない構成を考える</text>
<g class="k-shadow"><rect class="k-panel" x="8" y="34" width="248" height="152" rx="8"/><rect class="k-panel" x="264" y="34" width="248" height="152" rx="8"/></g>
<text class="k-bad-t" x="132" y="56" text-anchor="middle">当初案: A・B・C・D すべて充足</text>
<text class="k-good-t" x="388" y="56" text-anchor="middle">回避案: D を別の原理に</text>
<rect class="k-part" x="36" y="140" width="190" height="26" rx="4"/><rect class="k-part" x="60" y="104" width="22" height="36" rx="3"/><path class="k-alu" d="M66,100 L200,80 L203,92 L72,114 Z"/><rect class="k-rubber" x="184" y="90" width="22" height="12" rx="3"/>
<path class="k-edge" d="M110,140 L114,132 L106,126 L116,120 L108,114" style="stroke:var(--tb-bad)"/><text class="k-bad-t" x="122" y="136">D ばね</text>
<g transform="translate(256,0)"><rect class="k-part" x="36" y="140" width="190" height="26" rx="4"/><rect class="k-part" x="60" y="104" width="22" height="36" rx="3"/><path class="k-alu" d="M66,100 L200,80 L203,92 L72,114 Z"/><rect class="k-rubber" x="184" y="90" width="22" height="12" rx="3"/>
<rect class="k-part" x="40" y="74" width="20" height="20" rx="3"/><line class="k-thin" x1="50" y1="94" x2="66" y2="102"/><text class="k-good-t" x="66" y="78">重り (自重で開く)</text></g>
<text class="k-note" x="260" y="198" text-anchor="middle">ただし均等の可能性・性能・コストも同時に評価する</text>
</svg>
<p class="tb-caption">図: 架空の例。問題特許の構成要件のどれを外せるかを考える。代替手段が「容易に置き換えられる同等品」だと均等とされるおそれがある</p>
<ul>
  <li><b>要件を外す</b>: 構成要件のうち、製品として不要なもの・別の原理で置き換えられるものを探す。作用効果まで同じ単純な置換は均等論のリスクがあるので、原理から変える案を優先する</li>
  <li><b>公知技術・期限切れ特許に寄せる</b>: 権利が消滅した技術や、出願前から公知の技術は原則として自由に使える</li>
  <li><b>権利の状態を確認</b>: 存続期間満了・特許料未納で消滅していないか、販売国で権利があるか</li>
  <li><b>記録を残す</b>: どの特許を検討し、どう判断したかを日付付きで残す。最終判断は弁理士の鑑定などを得る</li>
  <li>回避できない場合は、ライセンス交渉や無効資料調査などを知財部門と検討する</li>
</ul>
<h2>自社発明の発掘 — 発明提案書</h2>
<p>回避設計で生まれた新しい構成は、それ自体が発明になることがあります。「当たり前の工夫」と思っても、先行技術調査をしてみる価値があります。社内に提案するときは、次の項目をまとめると知財部門や弁理士に伝わりやすくなります。</p>
<table class="tb-table">
  <tr><th>項目</th><th>書く内容</th></tr>
  <tr><td>課題</td><td>従来技術の何が困るのか (定量的に)</td></tr>
  <tr><td>解決手段</td><td>構成要素とその関係。図を添える</td></tr>
  <tr><td>効果</td><td>なぜ課題が解決するのか、作用の説明</td></tr>
  <tr><td>変形例</td><td>材料・形状・配置を変えた別案 (権利を広げるヒント)</td></tr>
  <tr><td>先行技術</td><td>調べた公報と、それとの違い</td></tr>
  <tr><td>公開予定</td><td>展示会・出荷・論文などの予定日 (出願期限の判断に必要)</td></tr>
</table>`,
    points: [
      "先行技術調査は出願前、侵害予防調査は量産前。目的により対象と時期が違う",
      "侵害予防調査では販売国で存続中の権利と審査中の出願の請求項を読む",
      "検索は概念ごとに言い換えを OR、概念間を AND。キーワードと FI・F ターム等の分類を併用",
      "回避設計は構成要件の 1 つを満たさない構成を考える。単純な置換は均等のリスク",
      "回避案も発明になり得る。課題・手段・効果・変形例・公開予定を発明提案書にまとめる",
    ],
    exercises: [
      {
        q: "「ベルトコンベヤで搬送中の箱の向きを、ガイド板に当てて 90° 回転させる装置」の先行技術調査を行います。概念に分けて検索式を組み立てなさい。",
        a: "例: 概念 1 (対象) = コンベヤ OR 搬送 OR コンベア、概念 2 (目的) = 方向転換 OR 向き変更 OR 回転 OR 姿勢変更、概念 3 (手段) = ガイド OR 案内板 OR 当接 OR ストッパ。式は <b>(概念 1) AND (概念 2) AND (概念 3)</b>。ヒットした関連公報に付いた FI・F タームを確認し、分類 AND 概念 2 などでも検索して漏れを補います。件数が多ければ「箱 OR 物品 OR ワーク」を AND で追加します。",
      },
      {
        q: "侵害予防調査で、請求項 1 が「A 基台、B 回動するレバー、C 弾性体のパッド、D レバーを開放方向に付勢するばね」の存続中特許が見つかりました。自社案は A〜D をすべて備えます。回避案を 2 つ挙げ、注意点を述べなさい。",
        a: "回避案の例: (1) ばねを使わず、レバーの自重やカム形状で開く構造にして <b>D を外す</b>。(2) パッドを設けず、レバー先端を樹脂一体成形の硬い当て面とし、傷防止は別の方法 (ワーク側の保護シートなど) で行って <b>C を外す</b>。注意点: 「ばね → ゴムの弾性で付勢」のような同じ作用の単純置換は均等とされるおそれがある。性能・コストを評価し、判断の記録を残して弁理士の見解を得る。権利が満了間近なら発売時期との関係も確認する。",
      },
    ],
    quiz: [
      { q: "侵害予防調査で主に確認すべき対象は?", choices: ["権利の生死を問わずすべての公報", "販売国で存続中の権利や審査中の出願", "論文だけ"], answer: 1, explain: "侵害の問題になるのは販売国で有効な権利です。審査中の出願も将来権利化し得るので見守ります。" },
      { q: "同じ概念の言い換え (ばね、バネ、弾性部材) を検索式でつなぐ演算子は?", choices: ["AND", "OR", "NOT"], answer: 1, explain: "同じ概念の言い換えは OR でまとめ、異なる概念同士を AND で掛け合わせます。" },
      { q: "FI について正しいのは?", choices: ["国際特許分類 (IPC) を日本で細分化した分類", "商標の分類", "意匠専用の分類"], answer: 0, explain: "FI は IPC をベースに日本で細分化した特許分類です。" },
      { q: "回避設計として最もリスクが低い考え方は?", choices: ["材料を同等品に置き換える", "構成要件を原理から異なる手段で満たさないようにし、専門家に確認する", "図面の形を変える"], answer: 1, explain: "同じ作用の単純な置換は均等のリスクがあります。原理から変え、弁理士の見解を得ます。" },
    ],
  },
  {
    id: "design-registration",
    part: "design",
    title: "意匠登録の実務 — 図面・部分意匠・関連意匠",
    minutes: 25,
    level: 3,
    lead: "意匠権の範囲は、出願した図面に表された形で決まります。どの図を描くか、どこを実線にするかで権利の強さが変わります。意匠の登録要件、六面図などの図面の考え方、部分意匠・関連意匠・秘密意匠の使い方、2020 年改正で広がった保護対象を、実務の流れに沿って学びます。",
    body: `
${NOTE}
<p>意匠制度の全体像は「<a href="#/c/design-rights">意匠権と知的財産</a>」の章を先に読んでおくと理解しやすくなります。</p>
<h2>登録要件の確認</h2>
<table class="tb-table">
  <tr><th>要件</th><th>ポイント</th></tr>
  <tr><td>工業上利用可能性</td><td>量産できる物品などのデザインであること</td></tr>
  <tr><td>新規性</td><td>出願前に公知の意匠と同一・類似でないこと。自社の発表・販売でも失われる (公開から 1 年以内なら例外の手続あり)</td></tr>
  <tr><td>創作非容易性</td><td>公知の形状・ありふれた手法 (単純な置き換え・寄せ集め・配置変更など) で容易に創作できたものでないこと</td></tr>
  <tr><td>先願</td><td>同一・類似の意匠は最先の出願人のみ登録 (自分の類似意匠は関連意匠で)</td></tr>
  <tr><td>不登録事由</td><td>機能を確保するために不可欠な形状のみからなる意匠などは登録できない</td></tr>
</table>
<p>類否 (似ているかどうか) は、物品などの用途・機能が同一・類似かと、<b>需要者</b>から見た形状などの全体的な印象 (特に目につきやすい部分・特徴的な部分) で判断されます。</p>
<h2>図面 — 権利範囲を描く書類</h2>
<p>意匠登録出願には、願書と、意匠を表した<b>図面</b> (写真・CG なども可) を提出します。立体物の場合は、<b>正面図・背面図・左側面図・右側面図・平面図・底面図</b> (六面図) で形を特定するのが基本で、必要に応じて斜視図や断面図、使用状態を示す参考図を加えます。正面図と背面図が同一・対称など、一定の場合は一部の図を省略できる場合があります。</p>
<svg class="tb-chart" viewBox="0 0 520 276" role="img" aria-label="六面図の配置と斜視図">
<text class="k-title" x="260" y="20" text-anchor="middle">六面図の配置 (卓上スピーカーの例)</text>
<g class="k-shadow">
<rect class="k-panel" x="96" y="32" width="84" height="56" rx="6"/>
<rect class="k-panel" x="6" y="96" width="84" height="96" rx="6"/><rect class="k-panel" x="96" y="96" width="84" height="96" rx="6"/><rect class="k-panel" x="186" y="96" width="84" height="96" rx="6"/><rect class="k-panel" x="276" y="96" width="84" height="96" rx="6"/>
<rect class="k-panel" x="96" y="200" width="84" height="68" rx="6"/>
</g>
<rect class="k-plastic" x="114" y="42" width="48" height="26" rx="6"/>
<rect class="k-plastic" x="28" y="112" width="40" height="52" rx="6"/>
<rect class="k-plastic" x="114" y="112" width="48" height="52" rx="6"/><circle class="k-part" cx="138" cy="146" r="12"/><circle class="k-rubber" cx="138" cy="146" r="5"/><circle class="k-led-g" cx="138" cy="122" r="3"/>
<rect class="k-plastic" x="208" y="112" width="40" height="52" rx="6"/>
<rect class="k-plastic" x="294" y="112" width="48" height="52" rx="6"/><circle class="k-thin" cx="318" cy="154" r="4"/><rect class="k-rubber" x="306" y="120" width="24" height="8" rx="2"/>
<rect class="k-plastic" x="114" y="210" width="48" height="26" rx="6"/><circle class="k-rubber" cx="122" cy="223" r="3"/><circle class="k-rubber" cx="154" cy="223" r="3"/>
<g class="k-note"><text x="138" y="82" text-anchor="middle">平面図</text><text x="48" y="184" text-anchor="middle">左側面図</text><text x="138" y="184" text-anchor="middle">正面図</text><text x="228" y="184" text-anchor="middle">右側面図</text><text x="318" y="184" text-anchor="middle">背面図</text><text x="138" y="258" text-anchor="middle">底面図</text></g>
<g transform="translate(384,70)">
<path class="k-plastic" d="M20,40 L80,40 L80,110 L20,110 Z"/><path class="k-plastic" d="M20,40 L44,22 L104,22 L80,40 Z"/><path class="k-plastic" d="M80,40 L104,22 L104,92 L80,110 Z"/>
<circle class="k-part" cx="50" cy="80" r="14"/><circle class="k-rubber" cx="50" cy="80" r="6"/>
<rect class="k-ground" x="10" y="112" width="104" height="8"/>
<text class="k-note" x="62" y="140" text-anchor="middle">斜視図 (参考)</text>
</g>
</svg>
<p class="tb-caption">図: 正面図を中心に、各方向から見た図をそろえる。図の間で形が矛盾すると意匠が特定できず、拒絶の理由になり得る</p>
<ul>
  <li>図面に描かれた形が<b>そのまま権利範囲</b>の基礎になる。実際の製品にない細部まで描くと、範囲が不必要に狭くなることがある</li>
  <li>各図の形・寸法の比率をそろえ、陰影や中心線など、意匠を誤解させる線は描き方のルールに従う</li>
  <li>CAD の 3D モデルから正投影ビューを書き出すと、図間の矛盾を防ぎやすい</li>
  <li>図面の細かな様式 (線の種類、省略できる図の条件など) は特許庁の案内・審査基準で確認する</li>
</ul>
<h2>部分意匠 — どこを実線にするか</h2>
<p>物品の一部分について登録を受けるのが<b>部分意匠</b>です。図面では、登録を受けようとする部分を<b>実線</b>、その他の部分を<b>破線</b>などで描き分け、願書でどの部分かを説明するのが代表的な表し方です。</p>
<svg class="tb-chart" viewBox="0 0 520 220" role="img" aria-label="同じ製品の全体意匠と二通りの部分意匠">
<text class="k-title" x="260" y="20" text-anchor="middle">同じ製品でも実線の範囲で権利の性格が変わる</text>
<g class="k-shadow"><rect class="k-panel" x="6" y="32" width="164" height="176" rx="8"/><rect class="k-panel" x="178" y="32" width="164" height="176" rx="8"/><rect class="k-panel" x="350" y="32" width="164" height="176" rx="8"/></g>
<text class="lbl" x="88" y="52" text-anchor="middle">① 全体意匠</text><text class="lbl" x="260" y="52" text-anchor="middle">② 部分意匠: 正面パネル</text><text class="lbl" x="432" y="52" text-anchor="middle">③ 部分意匠: 取っ手</text>
<g><path class="k-edge" d="M48,88 L128,88 L128,180 L48,180 Z"/><path class="k-edge" d="M68,88 Q68,66 88,66 Q108,66 108,88"/><circle class="k-edge" cx="88" cy="140" r="22"/><circle class="k-edge" cx="88" cy="140" r="8"/></g>
<g transform="translate(172,0)"><path class="k-hidden" d="M48,88 L128,88 L128,180 L48,180 Z"/><path class="k-hidden" d="M68,88 Q68,66 88,66 Q108,66 108,88"/><rect x="54" y="100" width="68" height="74" rx="4" style="fill:var(--tb-accent);stroke:var(--tb-accent)" fill-opacity="0.15" stroke-width="2.4"/><circle cx="88" cy="140" r="22" fill="none" style="stroke:var(--tb-accent)" stroke-width="2.4"/><circle cx="88" cy="140" r="8" fill="none" style="stroke:var(--tb-accent)" stroke-width="2.4"/></g>
<g transform="translate(344,0)"><path class="k-hidden" d="M48,88 L128,88 L128,180 L48,180 Z"/><path d="M68,88 Q68,66 88,66 Q108,66 108,88" fill="none" style="stroke:var(--tb-accent)" stroke-width="3"/><circle class="k-hidden" cx="88" cy="140" r="22"/><circle class="k-hidden" cx="88" cy="140" r="8"/></g>
<text class="k-note" x="88" y="200" text-anchor="middle">全体の印象を保護</text><text class="k-note" x="260" y="200" text-anchor="middle">他の部分が違っても狙える</text><text class="k-note" x="432" y="200" text-anchor="middle">取っ手だけの模倣に対応</text>
</svg>
<p class="tb-caption">図: 実線 (色付き) が登録を受けようとする部分、破線がその他の部分 (表し方の一例)。特徴がどこにあるかで出願の組み合わせを決める</p>
<h2>関連意匠 — バリエーションと後継機を守る</h2>
<p>自分の<b>本意匠</b>に類似する意匠は、<b>関連意匠</b>として登録を受けられます。2020 年 4 月施行の改正で、本意匠の出願日から <b>10 年以内</b>まで関連意匠を出願できるようになり、関連意匠にだけ類似する意匠も関連意匠として登録できるようになりました。これにより、一貫したデザインコンセプトで展開するシリーズを、類似の連鎖で保護しやすくなっています。関連意匠の存続期間は、<b>本意匠の出願日から 25 年</b>で終わります。</p>
<h2>そのほかの制度と保護対象</h2>
<table class="tb-table">
  <tr><th>制度・対象</th><th>概要</th></tr>
  <tr><td>存続期間</td><td>2020 年 4 月 1 日以降の出願は<b>出願日から最長 25 年</b> (毎年の登録料が必要)</td></tr>
  <tr><td>秘密意匠</td><td>出願人の請求により、設定登録の日から<b>最長 3 年</b>、意匠の内容を秘密にできる。発売前に公報で形が知られるのを避けたいとき</td></tr>
  <tr><td>画像の意匠</td><td>2020 年改正で、物品に表示されない画像も対象に。機器の操作に使う画像や、機能を発揮した結果として表示される画像 (壁や路面への投影画像など)。壁紙のような装飾目的の画像などは対象外</td></tr>
  <tr><td>建築物・内装</td><td>2020 年改正で対象に。建築物の外観・内観、店舗などの内装 (家具・什器・壁などの組合せとしての統一的な美感)</td></tr>
  <tr><td>組物の意匠</td><td>同時に使用される物品のセット全体として統一感があるもの</td></tr>
</table>
<div class="tb-note">画像・建築物・内装の詳しい要件や、複数の意匠を 1 つの願書でまとめて出願できる制度などの手続の細部は改正・運用の変更があり得ます。最新の制度は特許庁の情報や弁理士に確認してください。</div>
<h2>出願前チェックリスト</h2>
<ol>
  <li>公開 (展示会・Web・販売) の予定日を確認し、その前に出願する</li>
  <li>J-PlatPat で先行意匠を調査し、特徴がどこにあるかを言葉にする</li>
  <li>全体意匠・部分意匠・関連意匠の組み合わせを弁理士と決める</li>
  <li>CAD から矛盾のない六面図などを作り、実線・破線の範囲を確認する</li>
  <li>発売時期によっては秘密意匠の請求も検討する</li>
</ol>`,
    points: [
      "主な登録要件は工業上利用可能性・新規性・創作非容易性・先願。類否は需要者から見た全体的な印象で判断",
      "権利範囲は図面に表された形が基礎。六面図などを矛盾なくそろえる",
      "部分意匠は登録を受けたい部分を実線、その他を破線などで描き分ける",
      "関連意匠は本意匠の出願日から 10 年以内に出願でき、期間は本意匠の出願日から 25 年まで",
      "存続期間は出願日から最長 25 年。秘密意匠は登録から最長 3 年。2020 年改正で画像・建築物・内装も対象",
    ],
    exercises: [
      {
        q: "本意匠を 2026 年 5 月 1 日に出願し、2031 年に後継機のデザイン (本意匠に類似) を関連意匠として出願して登録されました。(a) 関連意匠の出願は期限内ですか。(b) 関連意匠の権利は最長でいつまでですか。",
        a: "(a) 関連意匠は本意匠の出願日から 10 年以内 (2036 年 5 月 1 日ごろまで) に出願できるので、2031 年の出願は<b>期限内</b> (他の要件は別途審査されます)。(b) 関連意匠の存続期間は<b>本意匠の出願日から 25 年</b>で終わるため、2051 年 5 月 1 日ごろまで。後から出願しても本意匠より長くはなりません。期限の細部は公式情報で確認します。",
      },
      {
        q: "新しいハンディ掃除機の特徴は、(1) 本体と一体化した独特の形の吸込口と、(2) 操作画面のアイコン配置です。出願の組み合わせを考えなさい。",
        a: "例: 製品全体の<b>全体意匠</b>で全体の印象を守りつつ、吸込口を実線にした<b>部分意匠</b>で、他の部分を変えた模倣にも備える。操作画面は、画面部分を対象とする部分意匠や画像の意匠として保護できる可能性がある。色違い・形違いのバリエーションは<b>関連意匠</b>で。発売前に形を知られたくなければ<b>秘密意匠</b>も検討し、具体的な出願形態は弁理士と決めます。",
      },
    ],
    quiz: [
      { q: "部分意匠の図面で、登録を受けようとする部分の代表的な描き方は?", choices: ["破線で描く", "実線で描き、その他の部分を破線などで描く", "赤色で塗るだけ"], answer: 1, explain: "登録を受けようとする部分を実線、その他を破線などで描き分けるのが代表的な表し方です。" },
      { q: "関連意匠を出願できる期間 (2020 年改正後) は?", choices: ["本意匠の公報発行日まで", "本意匠の出願日から 10 年以内", "期限なし"], answer: 1, explain: "改正により本意匠の出願日から 10 年以内に拡大されました。" },
      { q: "秘密意匠で意匠を秘密にできる期間は?", choices: ["設定登録の日から最長 3 年", "出願から 1 年 6 月", "存続期間中ずっと"], answer: 0, explain: "出願人の請求により、設定登録の日から最長 3 年間秘密にできます。" },
      { q: "2020 年施行の改正で新たに意匠の保護対象に加わったものは?", choices: ["プログラムのソースコード", "建築物や内装", "製品名のロゴ"], answer: 1, explain: "物品に表示されない画像、建築物、内装が加わりました。ロゴは商標、ソースコードは著作権などの領域です。" },
    ],
  },
];
