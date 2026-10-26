import type { TextChapter } from "../types";

export const IDESIGN3: TextChapter[] = [
  {
    id: "design-process-detail",
    part: "design",
    title: "【中級】工業デザインの実務プロセス — リサーチから量産立会いまで",
    minutes: 30,
    level: 2,
    lead: "工業デザインの仕事はスケッチを描くことだけではありません。リサーチで課題を見つけ、コンセプトを決め、形を詰め、設計と量産の制約の中で意匠を守り、最後は工場で初品を確認するまで続きます。各フェーズで「何を作り、誰が決め、どれくらいかかるか」を知ると、チームの中で自分の役割がはっきりします。",
    body: `
<h2>全体像 — 6 つのフェーズとゲート</h2>
<p>会社や製品によって呼び方は違いますが、量産される工業製品のデザインはおおむね次の流れで進みます。フェーズの境目には<b>デザインレビュー (ゲート)</b> があり、次へ進むか、戻るか、中止するかを決めます。</p>
<ol>
  <li><b>リサーチ・企画</b>: ユーザー観察、市場と競合の調査、技術動向。成果物はリサーチ報告とデザインブリーフ。</li>
  <li><b>コンセプト</b>: 方向性を複数案 (通常 3〜5 案) 出し、ムードボードとアイデアスケッチで比較。1〜2 案に絞る。</li>
  <li><b>デザイン展開</b>: レンダリング、ボリュームモデル、操作性モックで形を詰める。CMF (色・素材・仕上げ) の初案。</li>
  <li><b>デザイン確定 (フリーズ)</b>: 意匠 3D データ、外観仕様書、CMF 仕様、外観見本 (デザインモデル) を確定。</li>
  <li><b>設計協働・試作</b>: 機構設計と意匠データのすり合わせ、試作品 (外観・機能) で確認。金型発注へ。</li>
  <li><b>量産立会い</b>: 金型の初品 (T0/T1 などと呼ぶ試し打ち) や塗装・印刷の色合わせに立ち会い、限度見本を決める。</li>
</ol>
<svg class="tb-chart" viewBox="0 0 520 250" role="img" aria-label="デザインプロセスのフェーズと成果物のタイムライン">
<text class="k-title" x="16" y="18">フェーズと主な成果物 (家電の一例、期間は目安)</text>
<g>
<rect x="20" y="104" width="70" height="38" rx="6" style="fill:var(--tb-accent)" opacity="0.18"/><text class="lbl" x="55" y="127" text-anchor="middle">リサーチ</text>
<rect x="96" y="104" width="70" height="38" rx="6" style="fill:var(--tb-accent)" opacity="0.26"/><text class="lbl" x="131" y="127" text-anchor="middle">コンセプト</text>
<rect x="172" y="104" width="84" height="38" rx="6" style="fill:var(--tb-accent)" opacity="0.34"/><text class="lbl" x="214" y="127" text-anchor="middle">展開</text>
<rect x="262" y="104" width="60" height="38" rx="6" style="fill:var(--tb-accent)" opacity="0.42"/><text class="lbl" x="292" y="127" text-anchor="middle">確定</text>
<rect x="328" y="104" width="96" height="38" rx="6" style="fill:var(--tb-accent)" opacity="0.5"/><text class="lbl" x="376" y="127" text-anchor="middle">設計・試作</text>
<rect x="430" y="104" width="70" height="38" rx="6" style="fill:var(--tb-accent)" opacity="0.6"/><text class="lbl" x="465" y="127" text-anchor="middle">量産立会</text>
</g>
<path d="M93,100 L93,146 M169,100 L169,146 M259,100 L259,146 M325,100 L325,146 M427,100 L427,146" style="stroke:var(--tb-bad)" stroke-width="2" stroke-dasharray="3 3"/>
<text class="k-note" x="260" y="160" text-anchor="middle">破線 = デザインレビュー (ゲート)</text>
<rect x="34" y="40" width="42" height="52" rx="3" style="fill:var(--tb-surface);stroke:var(--k-line)"/><line class="k-thin" x1="40" y1="52" x2="70" y2="52"/><line class="k-thin" x1="40" y1="60" x2="70" y2="60"/><line class="k-thin" x1="40" y1="68" x2="62" y2="68"/><text class="k-note" x="55" y="36" text-anchor="middle">ブリーフ</text>
<rect x="104" y="44" width="54" height="44" rx="3" style="fill:var(--tb-surface);stroke:var(--k-line)"/><path d="M110,78 Q120,52 134,66 T152,56" fill="none" style="stroke:var(--tb-text-2)" stroke-width="1.4"/><path d="M112,82 Q130,70 150,80" fill="none" style="stroke:var(--tb-text-3)" stroke-width="1"/><text class="k-note" x="131" y="36" text-anchor="middle">スケッチ</text>
<g class="k-shadow"><path class="k-plastic" d="M186,88 L186,62 Q186,48 214,46 Q242,48 242,62 L242,88 Z"/></g><ellipse cx="206" cy="60" rx="10" ry="4" fill="#fff" opacity="0.45"/><text class="k-note" x="214" y="36" text-anchor="middle">ボリューム模型</text>
<rect x="268" y="46" width="48" height="42" rx="3" style="fill:var(--tb-surface);stroke:var(--k-line)"/><path d="M276,80 L284,56 L300,52 L308,76 Z" fill="none" style="stroke:var(--tb-accent)" stroke-width="1.4"/><text class="k-note" x="292" y="36" text-anchor="middle">3D データ</text>
<g class="k-shadow"><rect class="k-alu" x="344" y="56" width="64" height="32" rx="4"/></g><rect x="350" y="62" width="20" height="10" rx="2" class="k-screen"/><text class="k-note" x="376" y="36" text-anchor="middle">試作品</text>
<rect x="440" y="52" width="22" height="34" rx="3" class="k-plastic"/><rect x="468" y="52" width="22" height="34" rx="3" style="fill:var(--tb-accent)" opacity="0.7"/><text class="k-note" x="465" y="36" text-anchor="middle">限度見本</text>
<text class="tick" x="55" y="186" text-anchor="middle">1〜2 か月</text><text class="tick" x="131" y="186" text-anchor="middle">1〜2 か月</text><text class="tick" x="214" y="186" text-anchor="middle">2〜3 か月</text><text class="tick" x="292" y="186" text-anchor="middle">数週間</text><text class="tick" x="376" y="186" text-anchor="middle">3〜6 か月</text><text class="tick" x="465" y="186" text-anchor="middle">1〜2 か月</text>
<rect x="20" y="202" width="480" height="38" rx="8" style="fill:var(--tb-surface-2);stroke:var(--tb-border)"/>
<text class="k-note" x="260" y="218" text-anchor="middle">後のフェーズほど変更コストが急増: 3D 確定後の形状変更は金型修正・再試作に波及する</text>
<text class="k-note" x="260" y="233" text-anchor="middle">→ 迷いは「安い段階」 (スケッチ・模型) で出し切る</text>
</svg>
<p class="tb-caption">図: フェーズ・ゲート・成果物の関係。期間は中規模の家電を想定した目安で、製品により大きく変わる</p>
<svg class="tb-chart" viewBox="0 0 520 220" role="img" aria-label="フェーズが進むほど変更コストが増え、自由度が減るグラフ">
<text class="k-title" x="16" y="22">設計の自由度と変更コスト (概念図)</text>
<line class="axis" x1="60" y1="180" x2="490" y2="180"/><line class="axis" x1="60" y1="40" x2="60" y2="180"/>
<path d="M60,50 C180,60 300,130 490,170" fill="none" style="stroke:var(--tb-good)" stroke-width="3"/>
<path d="M60,172 C220,168 340,140 490,46" fill="none" style="stroke:var(--tb-bad)" stroke-width="3"/>
<text class="k-good-t" x="96" y="46">形を変えられる自由度</text><text class="k-bad-t" x="486" y="64" text-anchor="end">変更にかかるコスト</text>
<g class="tick" text-anchor="middle"><text x="90" y="196">リサーチ</text><text x="160" y="196">コンセプト</text><text x="235" y="196">展開</text><text x="300" y="196">確定</text><text x="375" y="196">設計・試作</text><text x="455" y="196">量産</text></g>
<line x1="300" y1="40" x2="300" y2="180" style="stroke:var(--tb-accent)" stroke-dasharray="4 3"/><text class="mark-t" x="306" y="150">デザインフリーズ</text>
<text class="k-note" x="54" y="114" text-anchor="end">大</text><text class="k-note" x="54" y="176" text-anchor="end">小</text>
<text class="k-note" x="260" y="214" text-anchor="middle">早い段階で多くを試し、フリーズ後は変更を厳しく管理する</text>
</svg>
<p class="tb-caption">図: 自由度とコストは逆向きに動く (概念図で、数値ではない)</p>
<h2>誰が何を決めるか</h2>
<p>デザイナーは「形を決める人」ですが、すべてを一人で決めるわけではありません。判断の責任を事前に決めておくと、レビューが「好き嫌いの投票」になるのを防げます。</p>
<table class="tb-table">
<tr><th>判断項目</th><th>主に決める人</th><th>デザイナーの役割</th></tr>
<tr><td>狙うユーザーと価格帯</td><td>商品企画・事業責任者</td><td>リサーチ結果で根拠を示す</td></tr>
<tr><td>コンセプト案の選定</td><td>デザイン責任者 + 事業責任者</td><td>案ごとの狙いとリスクを説明</td></tr>
<tr><td>寸法・内部構造の成立</td><td>機構設計</td><td>意匠上の譲れない点 (ハードポイント) を提示</td></tr>
<tr><td>コストと工法</td><td>設計・生産技術・調達</td><td>工法ごとの見え方の違いを示す</td></tr>
<tr><td>外観品質の合否</td><td>品質保証 + デザイン</td><td>限度見本の作成と立会い</td></tr>
</table>
<h2>量産立会いで見るもの</h2>
<p>金型の初品では、<b>ヒケ (表面のへこみ)、ウェルドライン、ゲート跡、パーティングのずれ、シボのむら、色差</b>などを確認します。塗装や印刷は、色見本と並べて決まった光源 (例: 標準光源のブース) の下で比べます。合格範囲を示す<b>限度見本</b> (良品の限界・不良の限界のサンプル) を関係者で合意しておくと、量産中の判断がぶれません。</p>
<h2>例題: スケジュールを逆算する</h2>
<p>発売日が 12 か月後と決まった炊飯器の場合を考えます。量産立会い 1.5 か月、金型製作と試作 4 か月、設計協働 1.5 か月が必要だとすると、デザイン確定は発売の 7 か月前、つまり開始から 5 か月目が期限です。リサーチ・コンセプト・展開に使えるのは約 5 か月で、そのうち展開に 2 か月を残すなら、リサーチとコンセプトは合計 3 か月以内に収める必要があります。このように<b>後ろから逆算</b>し、ゲートの日付を先に決めます。</p>
<h2>よくある失敗</h2>
<ul>
  <li>リサーチを省略して形から始め、コンセプトレビューで「誰のための製品か」に答えられない。</li>
  <li>デザイン確定後に「もう少し丸く」といった変更を入れ、金型修正と日程遅延を招く。</li>
  <li>立会いに行かず、色やシボが仕様と違うまま量産が始まる。</li>
  <li>決定事項を記録せず、同じ議論をレビューのたびに繰り返す (議事録とデザイン変更記録を残す)。</li>
</ul>
`,
    points: [
      "工程はリサーチ→コンセプト→展開→確定→設計・試作→量産立会いの順で、境目にゲートがある",
      "フェーズごとに成果物 (ブリーフ、スケッチ、模型、3D データ、試作、限度見本) が決まっている",
      "判断の責任分担を先に決め、デザイナーは根拠とハードポイントを示す",
      "後工程ほど変更コストが大きい。日程は発売日から逆算する",
      "量産立会いと限度見本で外観品質を守り切る",
    ],
    exercises: [
      { q: "発売 10 か月前に開始。量産立会い 1 か月、金型・試作 4 か月、設計協働 1 か月が必要なとき、デザイン確定の期限は開始から何か月目?", a: "後ろから 1 + 4 + 1 = 6 か月必要なので、確定は発売の 6 か月前 = 開始から 10 − 6 = <b>4 か月目</b>。リサーチから展開までを 4 か月で終える計画になります。" },
      { q: "金型初品で、平らな天面に浅いへこみが見つかった。何という不具合で、デザイン側でできる対策は?", a: "<b>ヒケ</b>です。裏側のリブやボスで肉厚が局所的に厚くなることが主因です。設計側の肉厚調整に加え、デザイン側では天面にわずかな曲率 (クラウン) やシボを付けて目立ちにくくする、光沢を下げる、といった対策を提案できます。" },
      { q: "コンセプト案を 1 案だけ持ってレビューに臨むことの問題点は?", a: "比較対象がないため「この案が良い理由」を説明できず、採否が好みで決まりがちです。また否決されると次の案が無く日程が遅れます。方向性の違う 3 案程度を、評価軸 (ブリーフの目標) と共に示すのが一般的です。" },
    ],
    quiz: [
      { q: "フェーズの境目で進む・戻る・中止を決める場は?", choices: ["デザインレビュー (ゲート)", "量産立会い", "ムードボード"], answer: 0, explain: "ゲートで成果物を評価し、次フェーズへ進むかを判断します。" },
      { q: "良品と不良の境界を示すサンプルを何と呼ぶ?", choices: ["ボリュームモデル", "限度見本", "ムードボード"], answer: 1, explain: "限度見本で外観の合否基準を関係者が共有します。" },
      { q: "変更コストが最も小さいのはどの段階?", choices: ["金型完成後", "試作品の段階", "スケッチ・模型の段階"], answer: 2, explain: "早い段階ほど作り直しが安く速いので、迷いはここで出し切ります。" },
    ],
  },
  {
    id: "form-development",
    part: "design",
    title: "【中級】形の展開 — サムネイルからボリュームスタディまで",
    minutes: 30,
    level: 2,
    lead: "良い形は一発で描けるものではなく、たくさんの案を出し、比べ、捨て、育てることで生まれます。小さなサムネイルで数を出し、シルエットで選び、発泡材の模型や 3D スケッチで立体として確かめる — 形を発散させ収束させる具体的な手順を学びます。",
    body: `
<h2>発散と収束</h2>
<p>形の展開は<b>発散</b> (案の数を増やす) と<b>収束</b> (評価して絞る) の繰り返しです。最初から完成度の高い 1 案を描こうとすると、最初の思いつきに縛られます。まずは短時間で多くの案を出し、評価軸で選び、選んだ案を次の解像度で描き直します。</p>
<svg class="tb-chart" viewBox="0 0 520 240" role="img" aria-label="ハンディ掃除機の形がサムネイルから模型、レンダリングへ進化する様子">
<text class="k-title" x="16" y="22">ハンディクリーナーの形の展開 (例)</text>
<rect class="k-panel" x="10" y="34" width="150" height="170" rx="8"/><rect class="k-panel" x="186" y="34" width="150" height="170" rx="8"/><rect class="k-panel" x="362" y="34" width="150" height="170" rx="8"/>
<text class="lbl" x="85" y="54" text-anchor="middle">① サムネイル (数十案)</text>
<g fill="none" style="stroke:var(--tb-text-2)" stroke-width="1.3">
<path d="M22,88 L52,72 L60,80 L34,98 Z M52,72 L62,64"/>
<path d="M76,96 Q86,66 108,70 L112,82 Q94,84 86,100 Z"/>
<path d="M124,74 L150,74 L150,86 L130,100 L124,96 Z"/>
<path d="M24,140 Q30,118 58,120 L60,132 L30,150 Z"/>
<path d="M76,144 L102,118 Q112,116 112,126 L88,152 Z"/>
<path d="M124,132 Q140,112 152,124 Q146,140 128,150 Z"/>
<path d="M28,182 L58,166 L62,176 L32,194 Z"/>
<path d="M80,186 Q94,162 110,170 L104,184 Z"/>
</g>
<circle cx="93" cy="133" r="22" fill="none" style="stroke:var(--tb-accent)" stroke-width="2"/><circle cx="138" cy="132" r="20" fill="none" style="stroke:var(--tb-accent)" stroke-width="2"/>
<text class="k-note" x="85" y="198" text-anchor="middle" style="fill:var(--tb-accent)">○ = 選んだ案</text>
<text class="lbl" x="261" y="54" text-anchor="middle">② 発泡材のボリューム模型</text>
<ellipse cx="261" cy="176" rx="58" ry="6" class="k-ground" style="fill:var(--tb-text-3)" opacity="0.25"/>
<g class="k-shadow"><path d="M206,160 L268,96 Q284,84 300,92 Q310,104 298,118 L232,176 Q214,182 206,160 Z" style="fill:#e8d9a8;stroke:var(--k-line)" stroke-width="1.2"/></g>
<path d="M268,96 Q284,84 300,92" fill="none" stroke="#fff" stroke-width="3" opacity="0.6"/>
<text class="k-note" x="261" y="194" text-anchor="middle">握り・重心・大きさを手で確認</text>
<text class="lbl" x="437" y="54" text-anchor="middle">③ 仕上げたデザイン案</text>
<ellipse cx="437" cy="176" rx="60" ry="6" style="fill:var(--tb-text-3)" opacity="0.25"/>
<g class="k-shadow"><path class="k-plastic" d="M384,160 L444,100 Q460,86 478,94 Q490,108 476,122 L410,178 Q390,184 384,160 Z"/></g>
<path class="k-glass" d="M444,100 Q460,86 478,94 Q490,108 476,122 L462,134 Q470,112 444,100 Z"/>
<path class="k-rubber" d="M404,150 L432,124 L440,132 L412,158 Z"/>
<circle class="k-led-g" cx="452" cy="126" r="3"/>
<path d="M392,158 L444,106" fill="none" stroke="#fff" stroke-width="2" opacity="0.5"/>
<text class="k-note" x="437" y="194" text-anchor="middle">透明ダストカップ+ゴムグリップ</text>
<path class="k-move" d="M162,120 L184,120" marker-end="url(#k-arrow)"/><path class="k-move" d="M338,120 L360,120" marker-end="url(#k-arrow)"/>
<text class="k-note" x="260" y="226" text-anchor="middle">解像度を上げるたびに案を絞る: 数十案 → 3〜5 案 → 1〜2 案</text>
</svg>
<p class="tb-caption">図: サムネイル→模型→仕上げ案。各段階で評価してから次の解像度へ進む</p>
<h2>サムネイル — 数を出す技術</h2>
<ul>
  <li><b>小さく速く</b>: 1 案 30 秒〜1 分、名刺大の枠に描く。細部を描けない大きさにすると全体の形に集中できる。</li>
  <li><b>変数を決めて振る</b>: 「グリップの角度」「本体の断面 (丸・角・涙形)」「部品の分割」など 1 つの変数を変えた列を作ると、思いつきに頼らず網羅できる (形態マトリクス)。</li>
  <li><b>評価は後で</b>: 描いている最中に良し悪しを判断しない。</li>
</ul>
<h2>シルエットで評価する</h2>
<p>案を黒く塗りつぶした<b>シルエット</b>にして並べると、細部や色に惑わされず輪郭の強さを比べられます。遠くから見ても何の製品か分かるか、重心が安定して見えるか、ブランドの他製品と並べて違和感がないかを確認します。評価はブリーフの目標 (例: 「片手で軽く見える」「壁に掛けて美しい」) を軸に、点数を付けて記録すると議論が具体的になります。</p>
<svg class="tb-chart" viewBox="0 0 520 220" role="img" aria-label="3 案のシルエット比較と評価点">
<text class="k-title" x="16" y="22">シルエット比較: 輪郭だけで評価する</text>
<rect class="k-panel" x="10" y="32" width="160" height="178" rx="8"/><rect class="k-panel" x="180" y="32" width="160" height="178" rx="8"/><rect class="k-panel" x="350" y="32" width="160" height="178" rx="8"/>
<text class="lbl" x="90" y="52" text-anchor="middle">案 A: 直線的</text><text class="lbl" x="260" y="52" text-anchor="middle">案 B: 涙形</text><text class="lbl" x="430" y="52" text-anchor="middle">案 C: ピストル形</text>
<path d="M40,140 L110,66 L136,80 L66,154 Z" style="fill:var(--tb-text)"/>
<path d="M206,150 Q200,128 230,104 L290,70 Q314,62 316,84 Q314,100 294,110 L240,150 Q216,166 206,150 Z" style="fill:var(--tb-text)"/>
<path d="M376,90 L486,74 L490,100 L430,108 L420,156 L398,156 L404,110 L380,112 Z" style="fill:var(--tb-text)"/>
<g class="tick"><text x="24" y="176">軽快さ ★★☆</text><text x="24" y="194">握り   ★☆☆</text><text x="194" y="176">軽快さ ★★★</text><text x="194" y="194">握り   ★★★</text><text x="364" y="176">軽快さ ★☆☆</text><text x="364" y="194">握り   ★★☆</text></g>
<rect x="182" y="34" width="156" height="174" rx="7" fill="none" style="stroke:var(--tb-accent)" stroke-width="2.5"/>
</svg>
<p class="tb-caption">図: 塗りつぶしたシルエットにブリーフの評価軸で点を付ける。枠の案 B を模型に進める (評価は説明用)</p>
<h2>立体で確かめる — 模型と 3D スケッチ</h2>
<p>紙の上の良い形が、立体で良いとは限りません。<b>発泡材 (スタイロフォームやケミカルウッドなど)</b> を削ったボリューム模型は数時間で作れ、大きさ・持ちやすさ・机に置いたときの存在感を確かめるのに最適です。手に持つ製品では、グリップ周長や重心位置を模型で何度も試します。</p>
<p>3D CAD の<b>サブディビジョンモデリング</b>や VR 内で描く <b>3D スケッチ</b>は、正確さより速さを優先した立体の下描きです。複数の視点から即座に確認でき、最後は意匠 CAD (NURBS) で正確な面に作り直します。</p>
<h2>例題: 形態マトリクスで案を数える</h2>
<p>変数を「断面形状 3 種 × グリップ角度 3 種 × ダストカップ位置 2 種」とすると、組み合わせは <span class="tb-m">3 \\times 3 \\times 2 = 18</span> 案です。全部をサムネイルにしても 1 案 1 分で 18 分。ここから評価軸 (握りやすさ、軽快さ、ゴミの見えやすさ) で 4 案に絞り、模型にします。網羅的に描くことで「試していない方向」が残りません。</p>
<h2>よくある失敗</h2>
<ul>
  <li>最初の 1 案を磨き続け、他の方向性を検討しない (アンカリング)。</li>
  <li>側面図だけで形を決め、上から・斜めから見ると破綻している。</li>
  <li>模型を作らずレンダリングだけで判断し、実物の大きさが想像と違う。</li>
  <li>評価軸を決めずに選び、選定理由を説明できない。</li>
</ul>
`,
    points: [
      "形の展開は発散 (数を出す) と収束 (評価して絞る) の繰り返し",
      "サムネイルは小さく速く、変数を決めて網羅的に振る (形態マトリクス)",
      "シルエットで輪郭の強さと製品らしさを比べる",
      "発泡材のボリューム模型で大きさ・握り・存在感を確かめる",
      "3D スケッチは速さ重視の下描き。最終面は意匠 CAD で作り直す",
    ],
    exercises: [
      { q: "変数「天面形状 4 種 × 脚の形 3 種 × 操作部位置 2 種」の形態マトリクスは何案? 1 案 40 秒で描くと何分かかる?", a: "<span class=\"tb-m\">4 \\times 3 \\times 2 = 24</span> 案。24 × 40 秒 = 960 秒 = <b>16 分</b>。短時間で全方向を試せます。" },
      { q: "シルエット評価で、色や細部を消す理由は?", a: "色・光沢・細部は印象を強く左右し、輪郭そのものの良し悪しを隠すためです。遠目や第一印象では輪郭が支配的なので、まず輪郭が強い案を選び、細部は後で詰めます。" },
      { q: "ハンディ製品のグリップ太さをレンダリングだけで決めてはいけない理由と、代わりの方法は?", a: "画面上では実寸感・重さ・指の掛かりが分からないためです。グリップ周長を変えた発泡材模型を数本作り、想定ユーザー (手の小さい人・大きい人) に握ってもらって比較します。" },
    ],
    quiz: [
      { q: "最初の案に引きずられて他の方向を検討できなくなる現象は?", choices: ["アンカリング", "シルエット", "フリーズ"], answer: 0, explain: "最初の情報が基準になってしまう認知の偏りです。数を出すことで防ぎます。" },
      { q: "輪郭の強さを比べるのに有効な方法は?", choices: ["高精細レンダリング", "塗りつぶしたシルエットを並べる", "CMF ボードを作る"], answer: 1, explain: "細部と色を消すことで輪郭だけを比較できます。" },
      { q: "発泡材のボリューム模型で主に確かめるのは?", choices: ["塗装の色差", "大きさ・持ちやすさ・存在感", "金型のコスト"], answer: 1, explain: "短時間で作れる立体で、実寸の感覚を確認します。" },
    ],
  },
  {
    id: "surface-quality-class-a",
    part: "design",
    title: "【上級】面品質とクラス A サーフェス — ハイライト・反射・パーティング",
    minutes: 35,
    level: 3,
    lead: "光沢のある製品では、面のわずかな歪みや曲率の段差が反射のゆがみとしてはっきり見えます。外観の主要面を高い面品質で作ることを「クラス A」と呼びます。ハイライト線、ゼブラ、曲率コームといった評価手段と、G1 と G2 の違い、部品の合わせ (隙間・段差) の考え方を学びます。",
    body: `
<h2>クラス A とは</h2>
<p><b>クラス A サーフェス</b>は、ユーザーの目に触れる主要外観面について、反射が滑らかに流れるよう連続性と曲率の流れを整えた面を指す実務用語です (自動車業界で生まれた言葉で、厳密な規格ではありません)。内側の見えない面はクラス B、C などと呼び、要求を下げます。一般にクラス A 面では、隣り合う面のつながりを<b>曲率連続 (G2) 以上</b>にし、曲率の分布が単調で、不要な変曲 (うねり) がないことが求められます。</p>
<h2>連続性の階段 — G0・G1・G2・G3</h2>
<ul>
  <li><b>G0 (位置連続)</b>: 面がつながっているだけ。境界に折れ目 (エッジ) が見える。</li>
  <li><b>G1 (接線連続)</b>: 接平面がそろう。フィレットの標準的な形 (円弧フィレット) はこれで、境界で曲率が急に変わるため、反射が<b>折れて</b>見える。</li>
  <li><b>G2 (曲率連続)</b>: 曲率もそろう。反射が境界を<b>滑らかに</b>流れる。</li>
  <li><b>G3</b>: 曲率の変化率までそろう。高級車の外板などで使われる。</li>
</ul>
<svg class="tb-chart" viewBox="0 0 520 260" role="img" aria-label="G1 と G2 のフィレットにおけるハイライト線と曲率コームの比較">
<text class="k-title" x="16" y="22">同じ角の丸め: G1 (円弧) と G2 (曲率連続)</text>
<rect class="k-panel" x="10" y="32" width="244" height="218" rx="8"/><rect class="k-panel" x="266" y="32" width="244" height="218" rx="8"/>
<text class="lbl" x="132" y="52" text-anchor="middle">G1 円弧フィレット</text><text class="lbl" x="388" y="52" text-anchor="middle">G2 フィレット</text>
<g class="k-shadow"><path d="M30,150 L30,72 Q30,62 40,62 L120,62 A40,40 0 0 1 160,102 L160,150 Z" style="fill:#2a2f38"/></g>
<path d="M36,70 L120,70" stroke="#fff" stroke-width="3" opacity="0.85"/><path d="M120,70 A32,32 0 0 1 152,102" fill="none" stroke="#fff" stroke-width="3" opacity="0.85"/>
<path d="M36,84 L118,84" stroke="#fff" stroke-width="2" opacity="0.5"/><path d="M124,82 A20,20 0 0 1 144,108" fill="none" stroke="#fff" stroke-width="2" opacity="0.5"/>
<path d="M152,102 L152,146" stroke="#fff" stroke-width="3" opacity="0.85"/>
<circle cx="120" cy="70" r="5" fill="none" style="stroke:var(--tb-bad)" stroke-width="2"/><circle cx="152" cy="102" r="5" fill="none" style="stroke:var(--tb-bad)" stroke-width="2"/>
<text class="k-bad-t" x="178" y="80">折れ</text>
<g class="k-shadow"><path d="M286,150 L286,72 Q286,62 296,62 L364,62 C392,62 416,78 416,108 L416,150 Z" style="fill:#2a2f38"/></g>
<path d="M292,70 L364,70 C388,70 408,84 408,108 L408,146" fill="none" stroke="#fff" stroke-width="3" opacity="0.85"/>
<path d="M292,84 L360,84 C380,84 396,96 398,116" fill="none" stroke="#fff" stroke-width="2" opacity="0.5"/>
<text class="k-good-t" x="432" y="80">流れる</text>
<line class="axis" x1="30" y1="230" x2="234" y2="230"/><line class="axis" x1="286" y1="230" x2="490" y2="230"/>
<path d="M30,230 L100,230 L100,192 L170,192 L170,230 L234,230" fill="none" style="stroke:var(--tb-bad)" stroke-width="2.2"/>
<path d="M286,230 L340,230 C360,230 366,188 388,188 C410,188 416,230 436,230 L490,230" fill="none" style="stroke:var(--tb-good)" stroke-width="2.2"/>
<text class="k-note" x="132" y="176" text-anchor="middle">曲率グラフ: 段差状に跳ぶ</text><text class="k-note" x="388" y="176" text-anchor="middle">曲率グラフ: 0 から滑らかに上がる</text>
<text class="tick" x="30" y="244">平面</text><text class="tick" x="234" y="244" text-anchor="end">平面</text><text class="tick" x="286" y="244">平面</text><text class="tick" x="490" y="244" text-anchor="end">平面</text>
</svg>
<p class="tb-caption">図: 黒い光沢面に映るハイライト。G1 では境界 (赤丸) で反射が折れ、G2 では途切れずに流れる</p>
<h2>評価の道具</h2>
<ul>
  <li><b>ハイライト線 / 反射線</b>: 面に平行な光源 (蛍光灯の列) が映ったときの線を計算表示する。線が折れる・波打つ所に問題がある。</li>
  <li><b>ゼブラ (縞模様)</b>: 境界で縞がずれれば G0、縞が折れれば G1、縞が滑らかにつながれば G2。</li>
  <li><b>曲率コーム</b>: 曲線に沿って曲率の大きさを「くし」の長さで表示する。くしの包絡線が滑らかで、不要な山や谷 (変曲) がないかを見る。</li>
  <li><b>曲率マップ (ガウス曲率など)</b>: 面全体の曲率分布を色で示し、局所的なへこみを見つける。</li>
</ul>
<p>実物では、光沢塗装した試作品を<b>蛍光灯の列の下</b>でゆっくり動かして映り込みを見ます。CAD の評価で良くても、成形のヒケや塗装の肌で反射が乱れることがあるためです。</p>
<h2>パーティングと合わせの品質</h2>
<p>部品の境目は<b>隙間 (ギャップ)</b> と<b>段差 (フラッシュ / 面違い)</b> で管理します。隙間が均一で、段差がない (または意図した方向にそろっている) と精密に見えます。量産では寸法ばらつきが必ずあるため、次の工夫をします。</p>
<ul>
  <li>段差が避けられないなら、<b>見る方向に対して奥側の部品を少し下げる</b> (手前が出っ張ると角が見えて目立つ)。</li>
  <li>完全な面一 (フラッシュ) を狙うより、<b>見切り溝</b> (小さな V 溝や段) にして影で誤差を隠す。</li>
  <li>隙間が場所によって変わると目立つため、隙間の公差と見え方をセットで仕様化する。</li>
</ul>
<svg class="tb-chart" viewBox="0 0 520 210" role="img" aria-label="部品の合わせの断面: 段差の向きと見切り溝">
<text class="k-title" x="16" y="22">合わせ部の断面: 段差の向きと見切り</text>
<rect class="k-panel" x="10" y="32" width="160" height="168" rx="8"/><rect class="k-panel" x="180" y="32" width="160" height="168" rx="8"/><rect class="k-panel" x="350" y="32" width="160" height="168" rx="8"/>
<text class="k-bad-t" x="90" y="52" text-anchor="middle">手前が出る</text><text class="k-good-t" x="260" y="52" text-anchor="middle">奥側を下げる</text><text class="k-good-t" x="430" y="52" text-anchor="middle">見切り溝</text>
<path class="k-plastic" d="M24,90 L84,90 L84,150 L24,150 Z"/><path class="k-alu" d="M88,98 L156,98 L156,150 L88,150 Z"/>
<path d="M84,90 L84,98" style="stroke:var(--tb-bad)" stroke-width="3"/>
<path class="k-alu" d="M194,90 L254,90 L254,150 L194,150 Z"/><path class="k-plastic" d="M258,94 L326,94 L326,150 L258,150 Z"/>
<path class="k-alu" d="M364,90 L420,90 Q424,90 424,96 L424,150 L364,150 Z"/><path class="k-plastic" d="M440,96 Q440,90 444,90 L496,90 L496,150 L440,150 Z"/>
<path d="M424,100 L432,112 L440,100" fill="none" style="stroke:var(--tb-text-3)" stroke-dasharray="2 2"/>
<path class="k-move" d="M60,74 L100,86" marker-end="url(#k-arrow)"/><path class="k-move" d="M230,74 L270,86" marker-end="url(#k-arrow)"/><path class="k-move" d="M400,74 L436,86" marker-end="url(#k-arrow)"/>
<text class="k-note" x="40" y="70">視線</text><text class="k-note" x="210" y="70">視線</text><text class="k-note" x="380" y="70">視線</text>
<text class="k-note" x="90" y="172" text-anchor="middle">角の断面が見え</text><text class="k-note" x="90" y="188" text-anchor="middle">ばらつきが目立つ</text>
<text class="k-note" x="260" y="172" text-anchor="middle">誤差が出ても</text><text class="k-note" x="260" y="188" text-anchor="middle">影に隠れる</text>
<text class="k-note" x="430" y="172" text-anchor="middle">溝の影で隙間の</text><text class="k-note" x="430" y="188" text-anchor="middle">変動が見えにくい</text>
</svg>
<p class="tb-caption">図: 面一を狙うより、ばらつきが見えない向き・形にそろえる</p>
<h2>例題: ゼブラで連続性を判定する</h2>
<p>ノート PC の天板と側面をつなぐ丸めをゼブラ表示したところ、境界で縞が途切れずにつながるが、角度がカクッと変わった。これは<b>G1</b>の特徴です。光沢黒の天板では折れたハイライトが目立つため、丸めを G2 (曲率連続の可変フィレット、またはブレンド面) に作り直し、曲率コームの包絡線が 0 から滑らかに立ち上がることを確認します。</p>
<h2>よくある失敗</h2>
<ul>
  <li>マット仕上げの試作で問題なく見えたのに、量産で光沢仕上げにしたら歪みが目立った。</li>
  <li>面を細かく分割しすぎ、パッチ境界ごとに反射が乱れる (面は少なく、構成を単純に)。</li>
  <li>曲率コームに小さな変曲が残り、大きな面がうねって見える。</li>
  <li>隙間ゼロ・段差ゼロを要求し、量産でばらつきが目立つ (見切りで逃がす設計が現実的)。</li>
</ul>
`,
    points: [
      "クラス A は主要外観面の反射品質を整えた面の実務用語で、通常 G2 以上の連続性を求める",
      "G1 (円弧フィレット) は境界で曲率が跳び、反射が折れて見える",
      "ハイライト線・ゼブラ・曲率コームで連続性と面のうねりを評価する",
      "光沢が高いほど面の欠点は目立つ。実物の映り込みでも確認する",
      "隙間と段差は見切りや段差の向きで、ばらつきが目立たないよう設計する",
    ],
    exercises: [
      { q: "ゼブラ表示で、(a) 縞が境界でずれる、(b) 縞はつながるが折れる、(c) 縞が滑らかにつながる。それぞれの連続性は?", a: "(a) <b>G0</b> (位置のみ連続)、(b) <b>G1</b> (接線連続)、(c) <b>G2</b> 以上 (曲率連続)。" },
      { q: "半径 R = 10 mm の円弧フィレットが平面につながるとき、境界での曲率の変化量は?", a: "平面の曲率は 0、円弧の曲率は <span class=\"tb-m\">1/R = 1/10 = 0.1\\,\\mathrm{mm^{-1}}</span>。境界で曲率が 0 から 0.1 へ<b>不連続に跳ぶ</b>ため G1 にとどまり、反射が折れて見えます。" },
      { q: "前面パネルと側面カバーの合わせで ±0.2 mm の段差ばらつきがある。正面から見られる製品でどう処理するか?", a: "正面から見て奥側になる側面カバーを、公称で 0.2〜0.3 mm 程度下げて設定し、ばらついても前面パネルが出っ張る向きにそろえます。さらに合わせ部に小さな見切り溝を入れれば、影で誤差が見えにくくなります。" },
    ],
    quiz: [
      { q: "標準的な円弧フィレットの連続性は?", choices: ["G0", "G1", "G2"], answer: 1, explain: "接線はそろいますが曲率は跳ぶため G1 です。" },
      { q: "曲線に沿った曲率の大きさを「くし」の長さで示す評価手段は?", choices: ["ゼブラ", "曲率コーム", "ドラフト解析"], answer: 1, explain: "曲率コームの包絡線の滑らかさで面の流れを見ます。" },
      { q: "面の歪みが最も目立ちやすい仕上げは?", choices: ["粗いシボ", "マット塗装", "高光沢の黒"], answer: 2, explain: "鏡面に近いほど反射像がゆがみを拡大して見せます。" },
    ],
  },
  {
    id: "ui-of-products",
    part: "design",
    title: "【中級】製品の操作部デザイン — ボタン・ダイヤル・表示の造形",
    minutes: 30,
    level: 2,
    lead: "電源ボタンを探して本体をなで回したり、どの表示がどのボタンのものか迷ったりした経験はないでしょうか。操作部は製品と人の接点で、形・配置・手触り・光・文字のすべてが「何ができるか」を伝えます。アフォーダンス、グルーピング、触覚の手がかり、表示灯の使い方を、家電の操作パネルを例に学びます。",
    body: `
<h2>形が操作を語る — アフォーダンスとシグニファイア</h2>
<p>ボタンが少し盛り上がっていれば「押せそう」、ダイヤルに刻みがあれば「回せそう」と感じます。このように形が行為の可能性を示すことを<b>アフォーダンス</b>、それを伝える手がかりを<b>シグニファイア</b>と呼びます (詳しくは「プロダクトセマンティクス」の章も参照)。操作部では次の原則が基本です。</p>
<ul>
  <li><b>押すもの</b>: 周囲と区別できる段差・凹凸・色。押す面はわずかに凹ませると指が中心に収まる。</li>
  <li><b>回すもの</b>: 円筒形、側面のローレットやリブ、回転方向が分かる指標 (ポインタ)。</li>
  <li><b>スライドするもの</b>: 溝 (トラック) と指を掛ける突起。</li>
  <li><b>触ってはいけないもの</b>: 平滑で操作部と区別された面、または凹んだ位置にして誤操作を防ぐ。</li>
</ul>
<h2>グルーピングと対応づけ</h2>
<p>機能の関係を<b>配置</b>で表すと、説明を読まなくても使えます。同じ目的のボタンは近くに集め、間隔や区切り線、面の段差でグループを分けます。表示とボタンは<b>空間的に対応</b> (マッピング) させ、表示の真下にそのボタンを置くなど、関係を一目で分かるようにします。使用頻度の高い操作ほど大きく、手前に、見つけやすく配置します。</p>
<svg class="tb-chart" viewBox="0 0 520 300" role="img" aria-label="電子レンジの操作パネルの悪い例と良い例の比較">
<text class="k-title" x="16" y="22">オーブンレンジの操作パネル: 同じ機能、2 つの配置</text>
<rect class="k-panel" x="10" y="32" width="244" height="260" rx="8"/><rect class="k-panel" x="266" y="32" width="244" height="260" rx="8"/>
<text class="k-bad-t" x="132" y="52" text-anchor="middle">改善前: 均一に並べただけ</text><text class="k-good-t" x="388" y="52" text-anchor="middle">改善後: 頻度と流れで整理</text>
<g class="k-shadow"><rect class="k-plastic" x="52" y="62" width="160" height="196" rx="10"/></g>
<rect class="k-screen" x="66" y="74" width="132" height="30" rx="4"/><text class="k-screen-t" x="132" y="94" text-anchor="middle">12:00</text>
<g style="fill:var(--tb-surface-2);stroke:var(--k-line)" stroke-width="1">
<rect x="66" y="116" width="40" height="22" rx="4"/><rect x="112" y="116" width="40" height="22" rx="4"/><rect x="158" y="116" width="40" height="22" rx="4"/>
<rect x="66" y="144" width="40" height="22" rx="4"/><rect x="112" y="144" width="40" height="22" rx="4"/><rect x="158" y="144" width="40" height="22" rx="4"/>
<rect x="66" y="172" width="40" height="22" rx="4"/><rect x="112" y="172" width="40" height="22" rx="4"/><rect x="158" y="172" width="40" height="22" rx="4"/>
<rect x="66" y="200" width="40" height="22" rx="4"/><rect x="112" y="200" width="40" height="22" rx="4"/><rect x="158" y="200" width="40" height="22" rx="4"/>
</g>
<g class="tick" text-anchor="middle" style="font-size:9px"><text x="86" y="131">解凍</text><text x="132" y="131">温め</text><text x="178" y="131">取消</text><text x="86" y="159">グリル</text><text x="132" y="159">時計</text><text x="178" y="159">スタート</text><text x="86" y="187">オーブン</text><text x="132" y="187">予熱</text><text x="178" y="187">+1分</text><text x="86" y="215">強</text><text x="132" y="215">弱</text><text x="178" y="215">メニュー</text></g>
<text class="k-note" x="132" y="280" text-anchor="middle">スタートと取消が埋もれている</text>
<g class="k-shadow"><rect class="k-plastic" x="308" y="62" width="160" height="196" rx="10"/></g>
<rect class="k-screen" x="322" y="74" width="132" height="30" rx="4"/><text class="k-screen-t" x="388" y="94" text-anchor="middle">温め  2:00</text>
<g style="fill:var(--tb-surface-2);stroke:var(--k-line)" stroke-width="1">
<rect x="322" y="112" width="40" height="18" rx="4"/><rect x="368" y="112" width="40" height="18" rx="4"/><rect x="414" y="112" width="40" height="18" rx="4"/>
</g>
<g class="tick" text-anchor="middle" style="font-size:9px"><text x="342" y="125">温め</text><text x="388" y="125">解凍</text><text x="434" y="125">オーブン</text></g>
<line class="k-thin" x1="322" y1="138" x2="454" y2="138"/>
<circle cx="388" cy="170" r="24" class="k-alu"/><circle cx="388" cy="170" r="17" fill="none" style="stroke:var(--k-line)" stroke-dasharray="2 2"/><line x1="388" y1="152" x2="388" y2="160" style="stroke:var(--tb-accent)" stroke-width="3"/>
<text class="tick" x="340" y="174" text-anchor="middle">時間</text>
<line class="k-thin" x1="322" y1="200" x2="454" y2="200"/>
<rect x="322" y="208" width="54" height="34" rx="8" style="fill:var(--tb-surface-2);stroke:var(--k-line)"/><text class="lbl" x="349" y="230" text-anchor="middle">取消</text>
<rect x="384" y="208" width="70" height="34" rx="8" class="k-accent"/><text class="lbl" x="419" y="230" text-anchor="middle" style="fill:#fff">スタート</text>
<circle class="k-led-g" cx="454" cy="150" r="3.5"/>
<text class="k-note" x="388" y="280" text-anchor="middle">選ぶ → 量 → 開始 を上から下へ</text>
</svg>
<p class="tb-caption">図: 改善後は操作の流れ (選ぶ→調整→開始) を上から下に配置し、最重要の「スタート」を大きく色で区別。取消は離して誤押しを防ぐ</p>
<h2>触覚の手がかり</h2>
<ul>
  <li><b>凸点</b>: 主要ボタン (スタートなど) に小さな凸点を付け、見なくても位置が分かるようにする。家電の凸点表示は日本産業規格 (JIS S 0011 など) に指針があり、視覚障害のある人にも役立つ。</li>
  <li><b>クリック感</b>: 押し込み量と荷重の変化 (タクトスイッチの節度) で「押せた」ことを伝える。</li>
  <li><b>ダイヤルのデテント</b>: 一段ごとのカチカチ感で操作量が分かる。</li>
  <li><b>形の違い</b>: 丸・四角・横長など形を変えると、手探りでも区別できる。</li>
</ul>
<svg class="tb-chart" viewBox="0 0 520 200" role="img" aria-label="触覚の手がかり: 凸点付きボタン、ローレット付きダイヤル、スライドスイッチ">
<text class="k-title" x="16" y="22">触って分かる操作部</text>
<rect class="k-panel" x="10" y="32" width="160" height="158" rx="8"/><rect class="k-panel" x="180" y="32" width="160" height="158" rx="8"/><rect class="k-panel" x="350" y="32" width="160" height="158" rx="8"/>
<ellipse cx="90" cy="132" rx="50" ry="8" style="fill:var(--tb-text-3)" opacity="0.3"/>
<g class="k-shadow"><rect class="k-plastic" x="44" y="84" width="92" height="46" rx="12"/></g>
<ellipse cx="90" cy="100" rx="30" ry="8" fill="#000" opacity="0.08"/><circle cx="90" cy="98" r="4" class="k-alu"/><path d="M54,90 L126,90" stroke="#fff" stroke-width="2" opacity="0.6"/>
<text class="lbl" x="90" y="158" text-anchor="middle">凹んだ押し面+凸点</text><text class="k-note" x="90" y="176" text-anchor="middle">指が中心に収まる</text>
<ellipse cx="260" cy="136" rx="44" ry="8" style="fill:var(--tb-text-3)" opacity="0.3"/>
<g class="k-shadow"><rect class="k-alu" x="222" y="74" width="76" height="60" rx="6"/></g>
<g style="stroke:var(--k-line)" stroke-width="1" opacity="0.7"><line x1="230" y1="76" x2="230" y2="132"/><line x1="238" y1="76" x2="238" y2="132"/><line x1="246" y1="76" x2="246" y2="132"/><line x1="254" y1="76" x2="254" y2="132"/><line x1="262" y1="76" x2="262" y2="132"/><line x1="270" y1="76" x2="270" y2="132"/><line x1="278" y1="76" x2="278" y2="132"/><line x1="286" y1="76" x2="286" y2="132"/><line x1="294" y1="76" x2="294" y2="132"/></g>
<ellipse cx="260" cy="74" rx="38" ry="8" class="k-alu"/><line x1="260" y1="68" x2="260" y2="76" style="stroke:var(--tb-accent)" stroke-width="3"/>
<text class="lbl" x="260" y="158" text-anchor="middle">ローレット+指標</text><text class="k-note" x="260" y="176" text-anchor="middle">回す・位置が分かる</text>
<rect x="374" y="96" width="112" height="22" rx="11" class="k-rubber"/>
<g class="k-shadow"><rect class="k-plastic" x="440" y="86" width="34" height="42" rx="6"/></g>
<line x1="450" y1="94" x2="450" y2="120" style="stroke:var(--k-line)"/><line x1="457" y1="94" x2="457" y2="120" style="stroke:var(--k-line)"/><line x1="464" y1="94" x2="464" y2="120" style="stroke:var(--k-line)"/>
<text class="k-note" x="384" y="86">OFF</text><text class="k-note" x="474" y="80" text-anchor="end">ON</text><circle class="k-led-g" cx="490" cy="76" r="3"/>
<text class="lbl" x="430" y="158" text-anchor="middle">溝+つまみのリブ</text><text class="k-note" x="430" y="176" text-anchor="middle">滑らせる方向が分かる</text>
</svg>
<p class="tb-caption">図: 押す・回す・滑らせるを形と触感で区別する</p>
<h2>表示灯と文字</h2>
<p>LED の表示灯は<b>意味を絞る</b>ことが大切です。点灯・点滅・消灯や色の意味を製品群で統一し、状態 (電源オン、充電中、異常) を一つずつ割り当てます。色だけに頼らず、位置・アイコン・点滅パターンを併用すると、色覚の多様性にも対応できます。文字表示 (ラベル) は、短く・動詞か名詞で統一し、十分な大きさとコントラストで、印刷が擦れにくい位置に置きます。高齢者を想定する製品では、文字を大きく、背景との明度差を大きくとるのが基本です。</p>
<h2>よくある失敗</h2>
<ul>
  <li>見た目の整列を優先して全ボタンを同じ形・大きさにし、重要な操作が見つからない。</li>
  <li>静電式のフラットパネルで触覚の手がかりがなく、手探りで操作できない。</li>
  <li>LED の色の意味が製品ごとに違い、赤が「通電」か「異常」か分からない。</li>
  <li>光沢の黒地に暗いグレーの印刷で、照明によって文字が読めない。</li>
</ul>
`,
    points: [
      "押す・回す・滑らせるといった行為は形 (シグニファイア) で伝える",
      "関係する操作は近くに集め、表示と操作を空間的に対応づける",
      "頻度の高い操作ほど大きく見つけやすく、危険・取消系は離して誤操作を防ぐ",
      "凸点・クリック感・デテント・形の違いで触覚の手がかりを与える",
      "表示灯は意味を絞って統一し、色だけに頼らない。ラベルは大きさとコントラストを確保",
    ],
    exercises: [
      { q: "電気ケトルに「沸騰」「保温」の 2 ボタンと、状態表示灯を付ける。誤操作を減らす配置と表示を考えよ。", a: "例: 頻度の高い「沸騰」を大きく手前 (取っ手の親指位置) に、保温は小さく離して配置。各ボタンのすぐ上に表示灯を置き (対応づけ)、沸騰中は点灯、保温中は別位置のランプが点灯するなど<b>位置</b>で区別し、色だけに頼らない。沸騰ボタンには凸点を付けると手探りでも分かります。" },
      { q: "静電タッチの平らなパネルを採用する場合に失われるものと、補う手段を 2 つ挙げよ。", a: "失われるのは触覚の手がかり (位置・押せた感覚) です。補う手段: (1) 表面に浅い凹み・凸線・印刷の質感差を付けて位置を触って分かるようにする、(2) 操作時の音や振動 (触覚フィードバック) と表示の変化で受付を知らせる。重要操作には物理ボタンを残す選択肢もあります。" },
      { q: "高さ 3 mm の文字を 60 cm の距離から読む場合、視角は約何分か (1 分 = 1/60 度)?", a: "視角 θ ≈ 3/600 rad = 0.005 rad ≈ 0.286° ≈ <b>17 分</b>。一般に読みやすい文字の視角は 20 分前後以上とされるので、高齢者向けならもう少し大きく (4 mm 程度以上) するのが目安です。" },
    ],
    quiz: [
      { q: "形が「何ができるか」を伝える手がかりを何と呼ぶ?", choices: ["シグニファイア", "デテント", "パーティング"], answer: 0, explain: "アフォーダンスを知覚させる手がかりがシグニファイアです。" },
      { q: "ダイヤルを回すときの一段ごとのカチカチ感を何という?", choices: ["ヒケ", "デテント (節度)", "ウェルド"], answer: 1, explain: "デテントで操作量が触覚で分かります。" },
      { q: "表示灯で状態を伝えるとき望ましいのは?", choices: ["色だけで区別する", "色に加え位置・アイコン・点滅も併用する", "全部同じ色で点滅させる"], answer: 1, explain: "色覚の多様性や照明条件に配慮し、複数の手がかりを使います。" },
    ],
  },
  {
    id: "design-for-manufacture-id",
    part: "design",
    title: "【中級】量産を見据えた意匠 — 抜き勾配・パーティング・加飾",
    minutes: 35,
    level: 2,
    lead: "射出成形品の外観は、金型から抜けること、型の合わせ目がどこに出るか、どんな加飾ができるかに大きく左右されます。デザイナーが抜き勾配・パーティングライン・シボ・加飾工法の基本を知っていれば、設計者と早い段階で話ができ、意匠を損なわずに量産へ渡せます。",
    body: `
<h2>抜き勾配 — 見える面にも傾きが要る</h2>
<p>成形品を金型から取り出すため、型の開く方向に平行な面には<b>抜き勾配 (ドラフト)</b> を付けます。勾配がないと、離型時に面がこすれて傷 (かじり) になったり、取り出せなかったりします。見た目で「真っすぐな側面」も、実際は 0.5〜2° 程度傾いていることが一般的です (値は材料・面の深さ・仕上げで変わる目安)。</p>
<p>デザイン上は、勾配で<b>側面がわずかに裾広がり</b>になること、勾配を付ける向きで上下の見え方が変わることを最初から織り込みます。勾配ゼロを要求する場合は、スライド型 (横から抜く型) など金型構造とコストの増加を伴います。</p>
<h2>シボと抜き勾配の関係</h2>
<p><b>シボ</b> (表面に付ける皮しぼ・梨地などの凹凸模様) は傷や指紋を目立たなくし、質感を与えます。ただし側面のシボは凹凸が型の抜き方向に引っかかるため、<b>シボが深いほど大きな勾配</b>が必要です。よく使われる経験則 (目安) は次のとおりです。</p>
<div class="tb-math">\\text{必要勾配}\\;[^\\circ] \\approx \\text{基本勾配 } (\\approx 1^\\circ) + 1.5^\\circ \\times \\dfrac{\\text{シボ深さ}}{0.025\\,\\mathrm{mm}}</div>
<p>(例: 深さ 0.025 mm ごとに 1〜1.5° 程度の追加。シボ加工業者が模様ごとに推奨勾配を出しているので、最終的にはその値に従います。)</p>
<svg class="tb-chart" viewBox="0 0 520 250" role="img" aria-label="金型と成形品の断面、パーティングラインと抜き勾配、シボの関係">
<text class="k-title" x="16" y="22">成形品の断面: パーティング・抜き勾配・シボ</text>
<rect class="k-part" x="40" y="40" width="260" height="70" rx="2"/><text class="lbl" x="56" y="58">固定側 (キャビティ)</text>
<rect class="k-part" x="40" y="146" width="260" height="70" rx="2"/><text class="lbl" x="56" y="208">可動側 (コア)</text>
<path class="k-plastic" d="M80,128 L92,76 L248,76 L260,128 Z"/>
<path d="M80,128 L92,76 L248,76 L260,128" fill="none" style="stroke:var(--k-line)" stroke-width="1.4"/>
<path d="M92,76 L248,76" fill="none" stroke="#fff" stroke-width="2" opacity="0.5"/>
<line x1="30" y1="128" x2="310" y2="128" style="stroke:var(--tb-bad)" stroke-width="2" stroke-dasharray="6 3"/>
<text class="k-bad-t" x="300" y="144">PL</text>
<path class="k-move" d="M318,120 L318,64" marker-end="url(#k-arrow)"/><text class="k-note" x="318" y="54" text-anchor="middle">型開き</text>
<line class="k-center" x1="80" y1="128" x2="80" y2="70"/>
<path d="M80,90 A38,38 0 0 1 89,91" fill="none" style="stroke:var(--tb-accent)" stroke-width="2"/>
<text class="mark-t" x="52" y="88">θ</text>
<path d="M260,128 l2,-6 l-3,-5 l3,-6 l-2,-6 l3,-6 l-2,-6 l3,-6 l-2,-5 l2,-6" fill="none" style="stroke:var(--tb-text)" stroke-width="1.2"/>
<text class="k-note" x="232" y="142">側面シボ</text>
<rect class="k-panel" x="340" y="40" width="170" height="176" rx="8"/>
<text class="lbl" x="352" y="60">勾配の目安 (例)</text>
<g class="tick"><text x="352" y="84">鏡面・光沢</text><text x="500" y="84" text-anchor="end">0.5〜1°</text>
<text x="352" y="106">細かい梨地</text><text x="500" y="106" text-anchor="end">1.5〜2°</text>
<text x="352" y="128">皮シボ 0.05 mm</text><text x="500" y="128" text-anchor="end">3〜4°</text>
<text x="352" y="150">粗いシボ 0.1 mm</text><text x="500" y="150" text-anchor="end">5〜7°</text></g>
<text class="k-note" x="352" y="178">業者の推奨値・材料で変わる</text>
<text class="k-note" x="352" y="194">ので、あくまで目安</text>
<text class="k-note" x="40" y="236">PL は製品の稜線や見切りに合わせると目立たない</text>
</svg>
<p class="tb-caption">図: 型の合わせ目がパーティングライン (PL)。側面の抜き勾配 θ はシボが深いほど大きくする</p>
<h2>パーティングラインの置き場所</h2>
<p>固定側と可動側の型が合う線が<b>パーティングライン (PL)</b> で、成形品には細い線やわずかな段 (バリ) が残ります。デザイン上は次の方針で位置を決めます。</p>
<ul>
  <li><b>稜線 (エッジ) に置く</b>: 面の折れ目に PL を合わせると線が目立たない。</li>
  <li><b>見えにくい面に置く</b>: 底面寄り、背面寄り。</li>
  <li><b>大きな曲面の途中は避ける</b>: ハイライトが通る面に線が出ると目立つ。</li>
  <li><b>PL を境に勾配の向きが変わる</b>: 断面形状 (最大幅の位置) と PL の位置は一体で考える。</li>
</ul>
<svg class="tb-chart" viewBox="0 0 520 200" role="img" aria-label="パーティングラインの位置の良い例と悪い例">
<text class="k-title" x="16" y="22">PL の位置: 曲面の途中か、稜線か</text>
<rect class="k-panel" x="10" y="32" width="244" height="158" rx="8"/><rect class="k-panel" x="266" y="32" width="244" height="158" rx="8"/>
<text class="k-bad-t" x="132" y="52" text-anchor="middle">曲面の中央を PL が横切る</text><text class="k-good-t" x="388" y="52" text-anchor="middle">底面寄りの稜線に PL</text>
<ellipse cx="132" cy="150" rx="80" ry="7" style="fill:var(--tb-text-3)" opacity="0.3"/>
<g class="k-shadow"><path class="k-plastic" d="M56,146 Q50,82 132,70 Q214,82 208,146 Z"/></g>
<path d="M76,92 Q132,72 188,92" fill="none" stroke="#fff" stroke-width="4" opacity="0.5"/>
<path d="M54,110 Q132,120 210,110" fill="none" style="stroke:var(--tb-bad)" stroke-width="1.8"/>
<text class="k-note" x="132" y="174" text-anchor="middle">ハイライトの上に線とバリが見える</text>
<ellipse cx="388" cy="150" rx="80" ry="7" style="fill:var(--tb-text-3)" opacity="0.3"/>
<g class="k-shadow"><path class="k-plastic" d="M312,138 Q306,82 388,70 Q470,82 464,138 Z"/></g>
<rect class="k-alu" x="310" y="136" width="156" height="10" rx="3"/>
<path d="M332,92 Q388,72 444,92" fill="none" stroke="#fff" stroke-width="4" opacity="0.5"/>
<line x1="310" y1="137" x2="466" y2="137" style="stroke:var(--tb-good)" stroke-width="1.8"/>
<text class="k-note" x="388" y="174" text-anchor="middle">段 (見切り) と一致し目立たない</text>
</svg>
<p class="tb-caption">図: PL は形の稜線や部品の見切りに合わせる</p>
<h2>加飾の工法 (概要)</h2>
<table class="tb-table">
<tr><th>工法</th><th>特徴</th><th>向く用途</th></tr>
<tr><td>原着 (着色樹脂そのまま)</td><td>最も安価。傷が付いても下地が同色</td><td>日用品・内装部品</td></tr>
<tr><td>塗装</td><td>色・光沢の自由度が高い。工程と塗装ブースが必要</td><td>高級感の要る外装</td></tr>
<tr><td>印刷 (パッド・シルク)</td><td>ロゴ・文字・目盛り</td><td>操作部ラベル</td></tr>
<tr><td>IMD / IML (インモールド加飾)</td><td>印刷したフィルムを型内に入れて一体成形。柄・文字が擦れにくい</td><td>表示窓・操作パネル</td></tr>
<tr><td>めっき・蒸着</td><td>金属調の光沢。樹脂グレードに制約あり</td><td>装飾トリム</td></tr>
<tr><td>二色成形</td><td>硬質と軟質、または 2 色を一体で成形</td><td>グリップ・ボタン</td></tr>
</table>
<h2>例題: シボ深さから勾配を見積もる</h2>
<p>深さ 0.05 mm の皮シボを、深さ 30 mm の側面に施したい。目安式で <span class="tb-m">1^\\circ + 1.5^\\circ \\times (0.05/0.025) = 1 + 3 = 4^\\circ</span>。勾配 4° では 30 mm の深さで片側 <span class="tb-m">30 \\times \\tan 4^\\circ \\approx 2.1\\,\\mathrm{mm}</span> 寸法が変わり、見た目にも裾広がりが分かります。意匠を優先するなら、側面は浅い梨地にして勾配を 1.5〜2° に抑え、天面だけ深いシボにする、といった使い分けを検討します。</p>
<h2>よくある失敗</h2>
<ul>
  <li>勾配ゼロの 3D データで意匠承認を取り、後で勾配を付けたら形の印象が変わった。</li>
  <li>深いシボを指定したのに勾配が足りず、離型時にシボがこすれて光る (かじり)。</li>
  <li>PL が大きな曲面の中央を横切り、ハイライトの上に線が見える。</li>
  <li>加飾工法を後から決め、めっき不可の樹脂を選んでいた。</li>
</ul>
`,
    points: [
      "型の開き方向に平行な面には抜き勾配が必要。見える面の印象にも影響する",
      "側面のシボは深いほど大きな勾配が要る (深さ 0.025 mm ごとに 1〜1.5° 追加が目安)",
      "パーティングラインは稜線や見えにくい面に置き、大きな曲面の途中は避ける",
      "加飾は原着・塗装・印刷・IMD/IML・めっき・二色成形などから用途とコストで選ぶ",
      "勾配・PL・加飾は意匠承認の前に織り込む",
    ],
    exercises: [
      { q: "深さ 0.1 mm の粗いシボを側面に入れる。目安式 (基本 1° + 深さ 0.025 mm ごとに 1.5°) で必要勾配は?", a: "<span class=\"tb-m\">1 + 1.5 \\times (0.1/0.025) = 1 + 6 = 7^\\circ</span>。かなり大きな勾配で形が変わるため、業者の推奨値を確認しつつ、浅いシボへの変更も検討します。" },
      { q: "高さ 40 mm の側面に勾配 2° を付けると、上下で片側何 mm 寸法が変わる?", a: "<span class=\"tb-m\">40 \\times \\tan 2^\\circ \\approx 40 \\times 0.0349 \\approx 1.4\\,\\mathrm{mm}</span>。両側では約 2.8 mm 幅が変わります。" },
      { q: "リモコンの操作ボタンの文字が使ううちに消えてしまう。工法の観点からの対策は?", a: "表面印刷は摩耗で消えやすいので、(1) 印刷の上に透明なハードコートを施す、(2) IMD/IML でフィルムの裏側に印刷し表面を樹脂やフィルムで保護する、(3) 二色成形で文字自体を別色樹脂として成形する、などがあります。" },
    ],
    quiz: [
      { q: "固定側と可動側の型が合う線を何と呼ぶ?", choices: ["パーティングライン", "ウェルドライン", "ハイライト線"], answer: 0, explain: "PL は成形品に細い線やバリとして現れます。" },
      { q: "側面のシボを深くすると、抜き勾配は?", choices: ["小さくてよい", "大きくする必要がある", "関係ない"], answer: 1, explain: "凹凸が離型時に引っかかるため、深いほど大きな勾配が要ります。" },
      { q: "印刷フィルムを金型内に入れて一体成形する加飾は?", choices: ["パッド印刷", "IMD / IML", "蒸着"], answer: 1, explain: "インモールド加飾で、柄が擦れにくくなります。" },
    ],
  },
  {
    id: "product-architecture",
    part: "design",
    title: "【上級】製品アーキテクチャとデザイン — 内部構造と外観の関係",
    minutes: 35,
    level: 3,
    lead: "外観は内部の部品をどう並べるかで大きく決まります。電池・基板・モーター・ファンの配置、熱の逃がし方、ケーブルの通り道、修理や分解のしやすさ — こうした「製品アーキテクチャ」をデザイナーが理解し、早い段階から設計者と一緒に検討すると、薄く・美しく・直しやすい製品が生まれます。",
    body: `
<h2>パッケージレイアウト — 外形は中身の包み方</h2>
<p><b>パッケージレイアウト</b>とは、主要部品 (電池、基板、モーター、表示器、スピーカーなど) の配置を決めることです。主要部品の寸法と必要なすき間で、外形の最小サイズとプロポーションはほぼ決まります。デザイナーはスケッチの段階から主要部品を簡単な箱 (ブロックモデル) として 3D 上に置き、その上に形をかぶせて検討します。</p>
<ul>
  <li><b>ハードポイント</b>: 動かせない寸法 (電池サイズ、画面サイズ、コネクタ位置、手の握り幅など)。</li>
  <li><b>重心</b>: 重い部品 (電池・モーター) の位置で、持ったときのバランスや置いたときの安定性が決まる。</li>
  <li><b>積み重ね方向</b>: 部品を縦に積むか横に並べるかで、薄型か小型かの方向性が決まる。</li>
</ul>
<svg class="tb-chart" viewBox="0 0 520 290" role="img" aria-label="卓上スピーカーの分解図: 上カバー、基板、スピーカーユニット、電池、下ケース">
<text class="k-title" x="16" y="22">分解図: ワイヤレススピーカーの内部構成 (例)</text>
<line class="k-center" x1="200" y1="34" x2="200" y2="272"/>
<g class="k-shadow"><path class="k-plastic" d="M110,62 Q110,44 130,44 L270,44 Q290,44 290,62 L290,68 L110,68 Z"/></g>
<path d="M126,50 L274,50" stroke="#fff" stroke-width="2" opacity="0.5"/>
<circle class="k-rubber" cx="160" cy="56" r="5"/><circle class="k-rubber" cx="200" cy="56" r="5"/><circle class="k-rubber" cx="240" cy="56" r="5"/>
<rect x="132" y="94" width="136" height="16" rx="2" style="fill:#2f7a4c;stroke:var(--k-line)"/>
<rect x="146" y="88" width="20" height="8" rx="1" class="k-part"/><rect x="190" y="90" width="12" height="6" class="k-part"/><rect x="232" y="88" width="16" height="8" rx="1" class="k-alu"/>
<g class="k-shadow"><ellipse cx="200" cy="146" rx="56" ry="14" class="k-rubber"/></g><ellipse cx="200" cy="144" rx="24" ry="6" class="k-alu"/>
<g class="k-shadow"><rect class="k-alu" x="150" y="180" width="100" height="22" rx="10"/></g>
<rect x="170" y="186" width="30" height="8" rx="2" style="fill:var(--tb-accent)" opacity="0.6"/>
<g class="k-shadow"><path class="k-plastic" d="M110,226 L110,250 Q110,264 130,264 L270,264 Q290,264 290,250 L290,226 Z"/></g>
<g style="stroke:var(--k-line)" stroke-width="1.2"><line x1="128" y1="240" x2="160" y2="240"/><line x1="128" y1="246" x2="160" y2="246"/><line x1="128" y1="252" x2="160" y2="252"/></g>
<rect x="250" y="238" width="18" height="10" rx="3" style="fill:var(--tb-surface-2);stroke:var(--k-line)"/>
<path d="M232,110 Q300,140 262,186" fill="none" class="k-copper" style="fill:none;stroke:#c8743a" stroke-width="2"/>
<g class="k-note">
<line class="k-thin" x1="290" y1="56" x2="330" y2="56"/><text x="334" y="60">① 上カバー + ボタン (二色成形)</text>
<line class="k-thin" x1="268" y1="100" x2="330" y2="100"/><text x="334" y="104">② 基板: 熱源は通気路の近くに</text>
<line class="k-thin" x1="256" y1="146" x2="330" y2="146"/><text x="334" y="150">③ スピーカーユニット (重心を低く)</text>
<line class="k-thin" x1="250" y1="191" x2="330" y2="191"/><text x="334" y="195">④ 電池: ねじ止めで交換可能</text>
<line class="k-thin" x1="290" y1="246" x2="330" y2="246"/><text x="334" y="250">⑤ 下ケース: 吸気スリット・USB 口</text>
</g>
<path class="k-move" d="M80,250 L80,70" marker-end="url(#k-arrow)"/><text class="k-note" x="74" y="160" text-anchor="end">空気</text><text class="k-note" x="74" y="174" text-anchor="end">下→上</text>
<text class="k-note" x="16" y="284">組立方向を 1 方向 (下から積む) にそろえると、外観の分割線も整理しやすい</text>
</svg>
<p class="tb-caption">図: 主要部品の積み重ねが外形を決める。通気は下から吸って上へ抜く煙突効果を利用</p>
<h2>熱と通気</h2>
<p>電子部品の発熱は外観に直接影響します。暖かい空気は上へ昇るので、<b>下で吸気し上で排気する</b>配置が自然対流を助けます。通気口は機能部品であると同時に強い意匠要素です。スリットの方向・ピッチ・面積をリズムとして扱い、指や異物が入らない幅 (安全規格で開口寸法が規定される場合がある) に収めます。手で触れる外装の表面温度にも上限の目安があるため、熱源を外装の直近に置かないことも重要です。</p>
<h2>ケーブルと配線</h2>
<p>内部のケーブルは曲げ半径が必要で、コネクタを挿す作業空間も要ります。外部のケーブル (電源コードなど) は、出口の位置で製品の置き方が決まります。背面下部から出すと壁際に置いたときにすっきりし、側面から出すと机上で邪魔になりがちです。出口には折れ止め (ブッシュ) が必要で、その形もデザインの一部です。</p>
<svg class="tb-chart" viewBox="0 0 520 200" role="img" aria-label="電池の配置による外形の違い: 縦一列と横並び">
<text class="k-title" x="16" y="22">同じ電池 2 本、配置で変わる外形</text>
<rect class="k-panel" x="10" y="32" width="300" height="158" rx="8"/><rect class="k-panel" x="320" y="32" width="190" height="158" rx="8"/>
<text class="lbl" x="160" y="52" text-anchor="middle">縦一列 → 細長い握り形</text><text class="lbl" x="415" y="52" text-anchor="middle">横並び → 平たい形</text>
<ellipse cx="160" cy="132" rx="130" ry="6" style="fill:var(--tb-text-3)" opacity="0.3"/>
<g class="k-shadow"><rect class="k-alu" x="30" y="92" width="250" height="34" rx="14"/></g>
<rect class="k-glass" x="260" y="94" width="22" height="30" rx="6"/>
<rect x="50" y="98" width="94" height="22" rx="10" style="fill:var(--tb-accent)" opacity="0.35"/><rect x="150" y="98" width="94" height="22" rx="10" style="fill:var(--tb-accent)" opacity="0.35"/>
<path d="M40,98 L270,98" stroke="#fff" stroke-width="2" opacity="0.5"/>
<text class="k-note" x="160" y="156" text-anchor="middle">φ 約 22 × 長さ 140 mm 超</text><text class="k-note" x="160" y="174" text-anchor="middle">ペンのように握る</text>
<ellipse cx="415" cy="148" rx="60" ry="6" style="fill:var(--tb-text-3)" opacity="0.3"/>
<g class="k-shadow"><rect class="k-plastic" x="368" y="64" width="94" height="80" rx="16"/></g>
<rect x="378" y="74" width="34" height="62" rx="12" style="fill:var(--tb-accent)" opacity="0.35"/><rect x="418" y="74" width="34" height="62" rx="12" style="fill:var(--tb-accent)" opacity="0.35"/>
<path d="M378,70 L452,70" stroke="#fff" stroke-width="2" opacity="0.5"/>
<text class="k-note" x="415" y="166" text-anchor="middle">幅約 40 × 長さ 70 mm 超</text><text class="k-note" x="415" y="182" text-anchor="middle">ポケットに入る</text>
</svg>
<p class="tb-caption">図: 色付きの部分が電池。外装の肉厚と保持部品の分を加えて外形が決まる</p>
<h2>サービス性と分解</h2>
<ul>
  <li><b>消耗部品へのアクセス</b>: 電池・フィルター・ブラシなど交換部品は、少ない手順で取り出せる位置に。</li>
  <li><b>ねじかスナップフィットか</b>: スナップは組立が速く見た目もすっきりするが、何度も外すと折れやすい。修理を前提にするなら標準的なねじを、見えにくい位置に。</li>
  <li><b>接着を避ける</b>: 接着は分解・リサイクルを難しくする。</li>
</ul>
<h2>例題: 電池の配置で外観が変わる</h2>
<p>同じ容量の電池 (直径 18 mm・長さ 65 mm の円筒形セル 2 本) を、ハンディライトに入れる場合を考えます。<b>直列に縦</b>に並べれば直径 約 22 mm・長さ 140 mm 超の細長い形、<b>横に 2 本並べれば</b>幅 約 40 mm・長さ 70 mm 超の扁平な形になります。前者はペンのように握る形、後者はポケットに入る平たい形と、デザインの方向性そのものが変わります。電池の配置はスケッチの前に検討すべき選択肢です。</p>
<h2>よくある失敗</h2>
<ul>
  <li>中身を無視して外形を描き、設計段階で大幅に厚くなる。</li>
  <li>通気口を見た目だけで配置し、熱がこもって性能が落ちる。</li>
  <li>電池交換に全分解が必要で、修理できない製品になる。</li>
  <li>ケーブル出口と置き方の関係を考えず、設置するとケーブルが正面に回ってくる。</li>
</ul>
`,
    points: [
      "主要部品の配置 (パッケージレイアウト) が外形の最小サイズとプロポーションを決める",
      "ハードポイントと重心を早期に押さえ、ブロックモデルの上に形を描く",
      "下で吸気・上で排気し、通気口は機能と意匠の両方として設計する",
      "ケーブルの出口と曲げ半径は置き方や使い勝手に直結する",
      "消耗部品へのアクセス、ねじ止め、接着回避でサービス性を高める",
    ],
    exercises: [
      { q: "円筒セル (直径 18 mm × 長さ 65 mm) 3 本を入れる製品で、考えられる配置を 2 つ挙げ、外形の印象を比べよ。", a: "(1) 横に 3 本並べる: 厚さ 約 20 mm、幅 約 56 mm 以上の扁平な板状 → 薄く置き型・手のひら型。(2) 三角形に束ねる: 断面 約 40 mm 角程度のコンパクトな棒状 → 握りやすい筒型。どちらにも外装肉厚と保持部品の余裕 (数 mm) を加えます。" },
      { q: "置き型の機器で、通気口を側面の低い位置だけに設けた場合の問題は?", a: "暖かい空気が上へ抜ける出口がなく、内部上方に熱がこもります。上面または側面上部に排気口を設け、下から吸って上へ抜く流れを作る必要があります (上面の開口は液体の浸入にも注意)。" },
      { q: "スナップフィットのみで組み立てたカバーを、修理時に開ける必要がある。どんな配慮ができるか?", a: "スナップの位置を外側から分かるようにし、工具を差し込む切り欠き (こじり口) を見えにくい場所に設ける、繰り返しの着脱に耐える形状・材料にする、または要所だけねじ止めに変える、などがあります。" },
    ],
    quiz: [
      { q: "設計上動かせない寸法や位置を何と呼ぶ?", choices: ["ハードポイント", "シボ", "限度見本"], answer: 0, explain: "電池サイズやコネクタ位置などがハードポイントです。" },
      { q: "自然対流を助ける通気口の配置は?", choices: ["上で吸気し下で排気", "下で吸気し上で排気", "側面の同じ高さだけ"], answer: 1, explain: "暖かい空気は上へ昇るため、下から吸って上へ抜くのが自然です。" },
      { q: "分解・修理・リサイクルを難しくする組立方法は?", choices: ["ねじ止め", "接着", "スナップフィット (着脱可能)"], answer: 1, explain: "接着は外すのが困難で、部品の分別も難しくなります。" },
    ],
  },
  {
    id: "design-presentation",
    part: "design",
    title: "【中級】デザインの伝え方 — ボード・レンダリング・ストーリー",
    minutes: 30,
    level: 2,
    lead: "どれほど良い案でも、相手に伝わらなければ採用されません。デザインのプレゼンテーションは「きれいな絵を見せる場」ではなく、課題・解決・根拠を筋道立てて示し、判断してもらう場です。ボードの構成、レンダリングの光の基本、ストーリーの組み立て、フィードバックの受け方を学びます。",
    body: `
<h2>何を判断してほしいかを先に決める</h2>
<p>プレゼンの前に「今日この場で決めてほしいこと」を 1 文で書きます。例: 「3 つのコンセプトから展開する 1 案を選んでほしい」。判断に必要な情報 (目標、各案の違い、リスク) だけを残し、それ以外は補足資料に回します。</p>
<h2>プレゼンテーションボードの構成</h2>
<p>1 枚のボードは、遠くから見ても<b>主役が一目で分かる</b>ようにします。視線は一般に左上から右下へ流れるので、その順に情報を置きます。</p>
<svg class="tb-chart" viewBox="0 0 520 300" role="img" aria-label="プレゼンテーションボードのレイアウト例">
<text class="k-title" x="16" y="22">コンセプトボードのレイアウト例</text>
<rect x="20" y="32" width="480" height="256" rx="6" style="fill:var(--tb-surface);stroke:var(--k-line)" stroke-width="1.4"/>
<rect x="36" y="44" width="200" height="14" rx="3" style="fill:var(--tb-text)" opacity="0.85"/>
<rect x="36" y="64" width="140" height="8" rx="3" style="fill:var(--tb-text-3)"/>
<text class="k-note" x="244" y="56">① タイトル+一行コンセプト</text>
<rect x="36" y="84" width="270" height="150" rx="4" style="fill:var(--tb-surface-2)"/>
<ellipse cx="170" cy="214" rx="80" ry="8" style="fill:var(--tb-text-3)" opacity="0.3"/>
<g class="k-shadow"><path class="k-plastic" d="M110,210 L120,120 Q124,100 150,98 L196,98 Q222,100 226,120 L236,210 Z"/></g>
<path class="k-glass" d="M130,118 Q132,108 150,108 L196,108 Q214,108 216,118 L218,150 L128,150 Z"/>
<path d="M118,206 L126,124" stroke="#fff" stroke-width="4" opacity="0.45"/>
<circle class="k-led-g" cx="173" cy="180" r="4"/><rect class="k-rubber" x="110" y="206" width="126" height="6" rx="2"/>
<text class="k-note" x="44" y="228">② 主役のレンダリング (最大)</text>
<rect x="318" y="84" width="84" height="70" rx="4" style="fill:var(--tb-surface-2)"/><rect x="408" y="84" width="80" height="70" rx="4" style="fill:var(--tb-surface-2)"/>
<circle class="k-skin" cx="346" cy="112" r="8"/><path class="k-person" d="M334,150 Q336,124 346,122 Q358,124 360,150 Z"/><rect class="k-plastic" x="364" y="124" width="16" height="26" rx="3"/>
<g fill="none" style="stroke:var(--tb-text-2)" stroke-width="1.2"><path d="M420,140 Q430,100 450,110 Q470,120 474,140"/><path d="M426,140 L470,140"/></g>
<text class="k-note" x="320" y="168">③ 使用シーン</text><text class="k-note" x="410" y="168">④ スケッチ</text>
<rect x="318" y="178" width="170" height="56" rx="4" style="fill:var(--tb-surface-2)"/>
<circle cx="340" cy="206" r="10" style="fill:#d8d4cc;stroke:var(--k-line)"/><circle cx="368" cy="206" r="10" style="fill:#3d4450;stroke:var(--k-line)"/><circle cx="396" cy="206" r="10" style="fill:var(--tb-accent)"/>
<text class="k-note" x="416" y="210">⑤ CMF</text>
<rect x="36" y="246" width="452" height="30" rx="4" style="fill:var(--tb-surface-2)"/>
<circle class="k-badge" cx="56" cy="261" r="9" style="fill:var(--tb-accent)"/><circle class="k-badge" cx="190" cy="261" r="9" style="fill:var(--tb-accent)"/><circle class="k-badge" cx="324" cy="261" r="9" style="fill:var(--tb-accent)"/>
<text class="k-note" x="70" y="265">課題</text><text class="k-note" x="204" y="265">解決のポイント</text><text class="k-note" x="338" y="265">⑥ 根拠・数値</text>
</svg>
<p class="tb-caption">図: 主役を大きく、補足を小さく。余白と整列 (グリッド) で情報の階層を示す</p>
<ul>
  <li><b>階層</b>: 主役のビジュアル 1 つを最大に。補足 (使用シーン、スケッチ、CMF、細部) は小さく。</li>
  <li><b>グリッドと余白</b>: 要素の端をそろえ、余白を均一にすると内容に集中できる。</li>
  <li><b>文字は少なく</b>: 見出しと短い説明。読ませるより見せる。</li>
</ul>
<h2>レンダリングの光の基本</h2>
<p>製品写真やレンダリングで基本となるのは<b>3 灯照明</b>の考え方です。</p>
<ul>
  <li><b>キーライト</b>: 主光源。斜め上前方から当て、形の陰影を作る。</li>
  <li><b>フィルライト</b>: 反対側からの弱い光で、影を真っ黒にしない。</li>
  <li><b>リムライト (バックライト)</b>: 後方から当て、輪郭を背景から浮かび上がらせる。</li>
</ul>
<p>光沢製品では、<b>大きく柔らかい光源</b> (ソフトボックス) の映り込みが面の形を伝えます。接地面には柔らかい影を落とし、製品が浮いて見えないようにします。カメラは人の目の高さに近い視点と、適度な望遠 (歪みの少ない焦点距離) を使うと、実物の印象に近くなります。過度な演出 (実際にない素材感や大きさの誇張) は、後で「実物と違う」という不信を招きます。</p>
<svg class="tb-chart" viewBox="0 0 520 220" role="img" aria-label="製品撮影の 3 灯照明の配置を上から見た図">
<text class="k-title" x="16" y="22">3 灯照明 (上から見た配置)</text>
<rect x="150" y="40" width="220" height="26" rx="4" style="fill:var(--tb-surface-2);stroke:var(--tb-border)"/><text class="k-note" x="260" y="58" text-anchor="middle">背景 (スイープ)</text>
<g class="k-shadow"><rect class="k-plastic" x="236" y="104" width="48" height="36" rx="10"/></g><text class="lbl" x="260" y="160" text-anchor="middle">製品</text>
<rect x="66" y="166" width="70" height="16" rx="3" style="fill:#fffbe8;stroke:var(--k-line)" transform="rotate(-35 101 174)"/><text class="lbl" x="70" y="206">キー (強)</text>
<rect x="394" y="150" width="54" height="12" rx="3" style="fill:#fffbe8;stroke:var(--k-line)" opacity="0.7" transform="rotate(30 421 156)"/><text class="lbl" x="400" y="190">フィル (弱)</text>
<circle cx="350" cy="84" r="10" style="fill:#fffbe8;stroke:var(--k-line)"/><text class="lbl" x="366" y="88">リム (後方)</text>
<rect x="246" y="190" width="28" height="18" rx="3" class="k-rubber"/><circle cx="260" cy="190" r="6" class="k-glass"/><text class="lbl" x="284" y="204">カメラ</text>
<path d="M130,160 L230,126" style="stroke:var(--tb-warn)" stroke-width="2" marker-end="url(#k-arrow)" stroke-dasharray="5 3"/>
<path d="M400,150 L290,128" style="stroke:var(--tb-warn)" stroke-width="1.2" marker-end="url(#k-arrow)" stroke-dasharray="5 3"/>
<path d="M342,90 L286,108" style="stroke:var(--tb-warn)" stroke-width="1.6" marker-end="url(#k-arrow)" stroke-dasharray="5 3"/>
</svg>
<p class="tb-caption">図: キーで陰影、フィルで影を和らげ、リムで輪郭を出す</p>
<h2>ストーリーで伝える</h2>
<ol>
  <li><b>誰の</b>: ユーザー像と使用場面 (写真や人物を入れたシーン)。</li>
  <li><b>何が問題か</b>: 観察で見つけた具体的な不便。</li>
  <li><b>どう解決したか</b>: デザインのポイントを 3 つ程度に絞る。</li>
  <li><b>なぜそう言えるか</b>: ユーザーテストや模型での検証結果、数値。</li>
  <li><b>何を決めてほしいか</b>: 選択肢と推奨案。</li>
</ol>
<h2>フィードバックの受け方</h2>
<p>指摘には「何が気になるか (症状)」と「どう直すか (処方)」が混ざっています。「もっと赤く」と言われたら、目的 (目立たせたい? 元気に見せたい?) を質問で確かめ、目的に合う別の解決も検討します。その場で反論や即答をせず、記録して持ち帰り、次回に検討結果を示すのが基本です。</p>
<h2>よくある失敗</h2>
<ul>
  <li>案を全部同じ大きさで並べ、どれが推奨か分からない。</li>
  <li>レンダリングを美しく見せようと実物と違う質感にし、試作品で失望される。</li>
  <li>説明が「形の工夫」の話に終始し、ユーザーの課題との関係が語られない。</li>
  <li>指摘をそのまま形に反映し、元の目的が失われる。</li>
</ul>
`,
    points: [
      "プレゼンの前に「この場で決めてほしいこと」を 1 文で決める",
      "ボードは主役を最大に、グリッドと余白で階層をつくり、文字は少なく",
      "レンダリングはキー・フィル・リムの 3 灯を基本に、接地影で実在感を出す",
      "誰の・何が問題・どう解決・なぜ言える・何を決める、の順でストーリーにする",
      "フィードバックは症状と処方を分け、目的を確かめて持ち帰る",
    ],
    exercises: [
      { q: "黒い光沢のスピーカーをレンダリングしたら、形が背景に溶けて輪郭が見えない。照明でどう改善する?", a: "後方からのリムライトで輪郭にハイライトを入れ、背景をやや明るいグレーにする。光沢面には大きなソフトボックスを映り込ませて面の形を見せます。フィルライトで暗部を少し持ち上げるのも有効です。" },
      { q: "役員から「もっと高級に見せて」と言われた。どう対応するか?", a: "まず目的と基準を質問で確かめます (例: 「どの価格帯・どの製品と並べたときに高級に見せたいか」)。そのうえで、色を落ち着かせる、分割線を減らす、金属調部品を一点に集中させる、など複数の手段を案として示し、次回に比較して選んでもらいます。" },
      { q: "A3 横のボードに主役レンダリング・使用シーン・CMF・タイトルを配置する。主役の面積比の目安と理由は?", a: "主役にボード面積の 4〜5 割程度を割り当てるのが一例です。遠目でも主役が一目で分かり、補足要素は主役の理解を助ける従属的な位置にとどまるためです (比率は目安で、構図による)。" },
    ],
    quiz: [
      { q: "輪郭を背景から浮かび上がらせる照明は?", choices: ["キーライト", "フィルライト", "リムライト"], answer: 2, explain: "後方から当てるリムライトが輪郭を際立たせます。" },
      { q: "プレゼンボードで最も重要な原則は?", choices: ["すべての要素を同じ大きさに", "主役を一目で分かるように階層をつける", "説明文を多く書く"], answer: 1, explain: "情報の階層で視線を主役へ導きます。" },
      { q: "フィードバックを受けたときの基本姿勢は?", choices: ["すぐに反論する", "指摘どおりにその場で直す", "目的を確かめ、記録して検討結果を次回示す"], answer: 2, explain: "症状と処方を分け、目的に合う解決を検討します。" },
    ],
  },
  {
    id: "design-trends-context",
    part: "design",
    title: "【上級】デザインと社会 — 文化・トレンド・倫理",
    minutes: 30,
    level: 3,
    lead: "製品は社会の中で使われ、文化によって意味が変わり、時代の気分とともに評価が移ろいます。そして製品の形は、使える人・使えない人を分け、環境や行動にも影響を与えます。トレンドを調べる方法、文化の違いへの配慮、インクルーシブで倫理的なデザイン、流行と長寿命の両立について考えます。",
    body: `
<h2>文化の文脈 — 同じ形が違う意味を持つ</h2>
<p>色・数字・ジェスチャー・素材の意味は文化によって異なります。例えば白は多くの地域で清潔さを表しますが、喪の色とされる地域もあります。台所の大きさ、靴を脱ぐ生活かどうか、片手で食べるか箸を使うかといった<b>生活様式</b>も、製品の寸法や操作に影響します。海外向けの製品では、現地での観察 (エスノグラフィ) と現地のパートナーによる確認が欠かせません。アイコンやジェスチャーの意味も地域で異なるため、文字に頼らない表示ほど慎重な確認が必要です。</p>
<h2>トレンドを調べる</h2>
<p>トレンドには時間の長さの違う層があります。</p>
<ul>
  <li><b>メガトレンド</b> (10 年以上): 高齢化、都市化、気候変動、デジタル化。</li>
  <li><b>トレンド</b> (数年): 在宅時間の増加、パーソナライズ、素材への関心。</li>
  <li><b>ファッド / 流行色</b> (1〜2 年): 特定の色や仕上げの人気。</li>
</ul>
<svg class="tb-chart" viewBox="0 0 520 280" role="img" aria-label="同じ製品の長寿命デザインと流行デザインの比較、トレンドの時間軸">
<text class="k-title" x="16" y="22">流行を追う形と、長く愛される形</text>
<rect class="k-panel" x="10" y="32" width="244" height="150" rx="8"/><rect class="k-panel" x="266" y="32" width="244" height="150" rx="8"/>
<text class="lbl" x="132" y="52" text-anchor="middle">A: 流行色・装飾が主役</text><text class="lbl" x="388" y="52" text-anchor="middle">B: 素直な形・交換できる外装</text>
<ellipse cx="132" cy="160" rx="66" ry="6" style="fill:var(--tb-text-3)" opacity="0.3"/>
<g class="k-shadow"><path d="M80,156 L84,86 Q86,70 104,68 L160,68 Q178,70 180,86 L184,156 Z" style="fill:#d65aa0;stroke:var(--k-line)"/></g>
<path d="M90,80 L174,140 M96,72 L180,132 M86,100 L150,148" style="stroke:#f3c84b" stroke-width="5" opacity="0.8"/>
<path d="M88,150 L92,88" stroke="#fff" stroke-width="3" opacity="0.4"/>
<text class="k-note" x="132" y="176" text-anchor="middle">発売時は新鮮、数年で古びやすい</text>
<ellipse cx="388" cy="160" rx="66" ry="6" style="fill:var(--tb-text-3)" opacity="0.3"/>
<g class="k-shadow"><path class="k-alu" d="M336,156 L340,86 Q342,70 360,68 L416,68 Q434,70 436,86 L440,156 Z"/></g>
<path class="k-plastic" d="M338,120 L438,120 L440,156 L336,156 Z"/>
<line x1="338" y1="120" x2="438" y2="120" style="stroke:var(--k-line)" stroke-dasharray="3 2"/>
<circle class="k-led-off" cx="388" cy="96" r="5"/>
<path d="M344,150 L348,88" stroke="#fff" stroke-width="3" opacity="0.4"/>
<text class="k-note" x="388" y="176" text-anchor="middle">色は下部カバーの交換で更新</text>
<rect x="30" y="206" width="460" height="10" rx="5" style="fill:var(--tb-accent)" opacity="0.25"/><text class="k-note" x="36" y="201">メガトレンド (10 年〜) → 骨格・機能・寸法</text>
<rect x="150" y="230" width="200" height="8" rx="4" style="fill:var(--tb-accent)" opacity="0.5"/><text class="k-note" x="356" y="238">トレンド (数年) → CMF の方向</text>
<rect x="250" y="252" width="60" height="6" rx="3" style="fill:var(--tb-accent)"/><text class="k-note" x="316" y="259">流行 (1〜2 年) → 交換部品</text>
</svg>
<p class="tb-caption">図: 骨格は長期トレンドに合わせ、短期の流行は交換・更新できる部分 (色・外装) に受け持たせる</p>
<p>調査方法には、文献・統計 (人口動態など)、展示会や街の観察、ソーシャルメディアの分析、先進ユーザー (リードユーザー) へのインタビュー、他業界 (ファッション・建築・自動車) の動向の比較などがあります。集めた兆し (シグナル) は、<b>STEEP</b> (社会・技術・経済・環境・政治) などの枠組みで整理し、「この製品のユーザーにとって何を意味するか」まで翻訳して初めて使える情報になります。</p>
<h2>インクルーシブデザインと倫理</h2>
<p><b>インクルーシブデザイン</b>は、高齢者・障害のある人・左利き・子どもなど、従来の「平均的なユーザー」から外れていた人々を最初から設計に参加させる考え方です。極端なユーザーにとって使いやすい解決は、多くの人にとっても使いやすいことがよくあります (例: 大きく握りやすいハンドル)。</p>
<p>倫理的な観点では、次のような問いを持つことが求められます。</p>
<ul>
  <li><b>安全</b>: 子どもの誤飲・指はさみ、誤使用まで想定しているか。</li>
  <li><b>誠実さ</b>: 実際より高機能・高品質に見せる形や表示になっていないか。</li>
  <li><b>依存と行動</b>: 必要以上の使用や買い替えを促す仕掛けになっていないか。</li>
  <li><b>プライバシー</b>: カメラやマイクの動作が外から分かるか (表示灯・物理シャッター)。</li>
  <li><b>環境</b>: 素材・修理性・寿命の選択が環境負荷にどう効くか。</li>
</ul>
<svg class="tb-chart" viewBox="0 0 520 210" role="img" aria-label="細いハンドルと太く握りやすいハンドルの比較">
<text class="k-title" x="16" y="22">インクルーシブな握り: 端のユーザーから考える</text>
<rect class="k-panel" x="10" y="32" width="244" height="168" rx="8"/><rect class="k-panel" x="266" y="32" width="244" height="168" rx="8"/>
<text class="k-bad-t" x="132" y="52" text-anchor="middle">細く硬いハンドル</text><text class="k-good-t" x="388" y="52" text-anchor="middle">太く柔らかいグリップ</text>
<g class="k-shadow"><rect class="k-alu" x="40" y="100" width="150" height="10" rx="5"/></g><path class="k-alu" d="M190,98 L226,90 L226,120 L190,112 Z"/>
<path class="k-skin" d="M70,96 Q80,80 100,84 Q130,86 140,96 L140,116 Q120,124 90,120 Q70,116 70,96 Z" opacity="0.85"/>
<text class="k-note" x="132" y="150" text-anchor="middle">握力の弱い人・関節に痛みのある</text><text class="k-note" x="132" y="166" text-anchor="middle">人には握り込めない</text>
<g class="k-shadow"><rect class="k-rubber" x="296" y="90" width="150" height="32" rx="16"/></g><path class="k-alu" d="M446,98 L482,90 L482,120 L446,114 Z"/>
<g style="stroke:#fff" opacity="0.25"><line x1="320" y1="92" x2="320" y2="120"/><line x1="340" y1="92" x2="340" y2="120"/><line x1="360" y1="92" x2="360" y2="120"/><line x1="380" y1="92" x2="380" y2="120"/><line x1="400" y1="92" x2="400" y2="120"/></g>
<path class="k-skin" d="M326,92 Q336,74 356,78 Q386,80 396,92 L396,122 Q376,132 346,128 Q326,124 326,92 Z" opacity="0.85"/>
<text class="k-note" x="388" y="150" text-anchor="middle">弱い力で握れ、滑りにくい</text><text class="k-note" x="388" y="166" text-anchor="middle">→ 多くの人にとっても快適</text>
<text class="k-note" x="260" y="192" text-anchor="middle">太さ・素材は説明用の模式図</text>
</svg>
<p class="tb-caption">図: 周縁のユーザーの困りごとを解くと、全体の使いやすさが上がる</p>
<h2>流行と長寿命 — 計画的陳腐化を超えて</h2>
<p>20 世紀には、毎年の外観変更で買い替えを促す<b>計画的陳腐化</b>が広く行われ、批判も受けてきました。現在は、長く使える<b>タイムレス</b>な骨格と、更新可能な部分を分ける考え方が重視されています。素直で機能に根ざした形、経年変化が味になる素材、交換できる外装やソフトウェア更新などが手段です。</p>
<h2>例題: トレンド情報を設計要件に翻訳する</h2>
<p>シグナル「単身高齢世帯の増加」(社会・メガトレンド) を電気ポットに翻訳すると、(1) 片手でも安定して注げる重心とハンドル、(2) 転倒時に湯がこぼれにくい構造、(3) 離れて暮らす家族に使用状況を知らせる機能 — ただしプライバシーへの配慮と本人の同意が前提、といった要件になります。トレンドは「形の流行」ではなく「要件の変化」として扱うのがポイントです。</p>
<h2>よくある失敗</h2>
<ul>
  <li>自国の生活習慣を前提に海外向け製品を設計し、現地で使いにくい。</li>
  <li>流行色を製品の骨格 (本体の成形色) に使い、1〜2 年で古びる。</li>
  <li>「平均的ユーザー」だけでテストし、手の小さい人や視力の弱い人が使えない。</li>
  <li>トレンド資料を集めるだけで、製品要件への翻訳をしない。</li>
</ul>
`,
    points: [
      "色・数字・生活様式の意味は文化で異なる。現地観察と確認が必要",
      "トレンドはメガトレンド・トレンド・流行の層で捉え、要件に翻訳して使う",
      "STEEP などの枠組みでシグナルを整理する",
      "インクルーシブデザインは周縁のユーザーを最初から設計に参加させる",
      "安全・誠実さ・プライバシー・環境の観点で倫理を問い、骨格は長寿命、流行は更新可能な部分に",
    ],
    exercises: [
      { q: "次のシグナルを STEEP に分類せよ: (a) 電池の規制強化、(b) 在宅勤務の定着、(c) 再生樹脂の価格低下、(d) 音声認識の普及。", a: "(a) 政治 (P)、(b) 社会 (S)、(c) 経済 (E、環境 E の側面も)、(d) 技術 (T)。" },
      { q: "スマートスピーカーのデザインで、プライバシーへの配慮を形で示す方法を 2 つ挙げよ。", a: "(1) マイクが音声を聞き取り中であることを示す表示灯を、どの角度からも見える位置に置く。(2) マイクを物理的に切るスイッチを、触って状態が分かる形 (色の見える位置・段差) で設ける。" },
      { q: "流行色を取り入れつつ製品寿命を長くするには、どのような構成が考えられるか?", a: "本体の骨格は落ち着いた色・素材にし、流行色は交換可能なカバー・ストラップ・付属品などに割り当てる。カバーを後から購入・交換できれば、本体を買い替えずに印象を更新できます。" },
    ],
    quiz: [
      { q: "10 年以上続く大きな社会変化を何と呼ぶ?", choices: ["ファッド", "メガトレンド", "限度見本"], answer: 1, explain: "高齢化・都市化などがメガトレンドの例です。" },
      { q: "周縁のユーザーを最初から設計に参加させる考え方は?", choices: ["インクルーシブデザイン", "計画的陳腐化", "スタイリング"], answer: 0, explain: "極端なユーザーの解決が多くの人の使いやすさにつながります。" },
      { q: "毎年の外観変更で買い替えを促す手法は?", choices: ["タイムレスデザイン", "計画的陳腐化", "サービス性設計"], answer: 1, explain: "20 世紀に広まり、環境面などから批判されてきました。" },
    ],
  },
];
