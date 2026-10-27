import type { TextChapter } from "../types";

export const DESIGN3: TextChapter[] = [
  {
    id: "form-language",
    part: "design",
    title: "【初級】かたちの言葉 — 立体と見え方の基本",
    minutes: 20,
    level: 1,
    lead: "箱・円柱・球といった基本立体は、それぞれ固有の印象を持っています。角の処理 (面取りと R)、エッジの立て方、そして人がまとまりを見つける仕組み (ゲシュタルトの原則) を知ると、形で意図を伝えられるようになります。",
    body: `
<h2>基本立体が持つ印象</h2>
<p>多くの製品は、箱 (直方体)・円柱・球の組合せや変形でできています。まず基本立体そのものの印象をつかみましょう。</p>
<svg class="tb-chart" viewBox="0 0 520 186" role="img" aria-label="箱・円柱・球の印象">
<ellipse cx="92" cy="146" rx="62" ry="5" style="fill:var(--tb-text)" opacity="0.13"/><ellipse cx="260" cy="146" rx="50" ry="5" style="fill:var(--tb-text)" opacity="0.13"/><ellipse cx="420" cy="146" rx="44" ry="5" style="fill:var(--tb-text)" opacity="0.13"/><g class="k-shadow"><polygon points="40,70 65,48 145,48 120,70" style="fill:var(--k-steel-1);stroke:var(--k-line)" stroke-width="1.6" stroke-linejoin="round"/><polygon points="40,70 120,70 120,142 40,142" style="fill:var(--k-steel-2);stroke:var(--k-line)" stroke-width="1.6" stroke-linejoin="round"/><polygon points="120,70 145,48 145,120 120,142" style="fill:var(--k-steel-3);stroke:var(--k-line)" stroke-width="1.6" stroke-linejoin="round"/></g><g class="k-shadow"><path class="k-part-h" d="M220,52 L220,132 A40,12 0 0 0 300,132 L300,52 Z"/></g><ellipse cx="260" cy="52" rx="40" ry="12" style="fill:var(--k-steel-1);stroke:var(--k-line)" stroke-width="1.6"/><path d="M232,64 L232,136" fill="none" style="stroke:#ffffff" stroke-width="2.2" opacity="0.6"/><g class="k-shadow"><circle class="k-sphere" cx="420" cy="96" r="46"/></g><ellipse cx="404" cy="78" rx="12" ry="8" fill="#ffffff" opacity="0.7"/><text class="lbl" x="92" y="172" text-anchor="middle">箱: 安定・実直・収納</text><text class="lbl" x="260" y="172" text-anchor="middle">円柱: 方向性・回す・握る</text><text class="lbl" x="420" y="172" text-anchor="middle">球: 柔らかい・親しみ・転がる</text>
</svg>
<p class="tb-caption">図: 基本立体の印象。製品の役割に合った立体を骨格に選ぶ</p>
<table class="tb-table">
  <tr><th>立体</th><th>印象</th><th>製品例</th></tr>
  <tr><td>箱</td><td>安定、積める、きちんとした</td><td>電源装置、スピーカ、収納家電</td></tr>
  <tr><td>円柱</td><td>軸の方向を感じる、手になじむ</td><td>ボトル、ライト、つまみ</td></tr>
  <tr><td>球</td><td>やわらかい、かわいい、どこから見ても同じ</td><td>スマートスピーカ、玩具</td></tr>
</table>
<h2>面取りと R — 角の表情</h2>
<p>角の処理は印象を大きく左右します。<b>面取り (C)</b> は角を平面で落とし、<b>R (フィレット)</b> は円弧でつなぎます。</p>
<svg class="tb-chart" viewBox="0 0 520 172" role="img" aria-label="ピン角・面取り・小R・大R">
<g class="k-shadow"><path class="k-alu" d="M24,136 L24,40 L110,40 L110,136 Z"/></g><text class="lbl" x="67" y="160" text-anchor="middle">ピン角: 鋭い・危険</text><g class="k-shadow"><path class="k-alu" d="M150,136 L150,60 L170,40 L236,40 L236,136 Z"/></g><text class="lbl" x="193" y="160" text-anchor="middle">面取り: 硬質・精密</text><g class="k-shadow"><path class="k-alu" d="M274,136 L274,52 A12,12 0 0 1 286,40 L360,40 L360,136 Z"/></g><text class="lbl" x="317" y="160" text-anchor="middle">小 R: 端正</text><g class="k-shadow"><path class="k-accent" d="M394,136 L394,90 A50,50 0 0 1 444,40 L496,40 L496,136 Z"/></g><text class="lbl" x="445" y="160" text-anchor="middle">大 R: やさしい</text><path d="M150,60 L170,40" style="stroke:#ffffff" stroke-width="5" opacity="0.9"/><path d="M150,60 L170,40" style="stroke:var(--k-line)" stroke-width="1.6" fill="none"/><path d="M277,52 A9,9 0 0 1 286,43" fill="none" style="stroke:#ffffff" stroke-width="2.4" opacity="0.9"/><path d="M399,90 A45,45 0 0 1 444,45" fill="none" style="stroke:#ffffff" stroke-width="8" opacity="0.35"/><circle cx="24" cy="40" r="7" fill="none" style="stroke:var(--tb-bad)" stroke-width="1.6"/><path class="k-thin" d="M160,50 L200,24" marker-start="url(#k-dot)"/><text class="k-note" x="204" y="28">光る細い帯</text><path class="k-thin" d="M410,62 L380,24" marker-start="url(#k-dot)"/><text class="k-note" x="376" y="28" text-anchor="end">なだらかな光</text>
</svg>
<p class="tb-caption">図: 同じ角でも処理で性格が変わる。面取りには光る細い帯ができ、R は光がなだらかに変わる</p>
<ul>
  <li>面取りは光を受けて<b>細い明るい線</b>になり、輪郭を引き締める (金属製品・工具に多い)</li>
  <li>R は大きくするほど柔らかくなるが、大きすぎると「ぼってり」と鈍く見える</li>
  <li>手が触れる角は、ピン角を避けて最低でも小さな R や面取りを付けるのが安全面の基本</li>
</ul>
<h2>エッジの立て方</h2>
<p>同じ R でも、<b>どの面を主役にするか</b>でエッジの効き方が変わります。正面の大きな面に小さな R をつけて側面との境を立てると、正面が「顔」として際立ちます。</p>
<svg class="tb-chart" viewBox="0 0 520 158" role="img" aria-label="エッジを立てる・寝かせる">
<defs><linearGradient id="dz-soft" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2f5f9"/><stop offset="0.5" stop-color="#cfd6df"/><stop offset="1" stop-color="#a3adba"/></linearGradient></defs><ellipse cx="130" cy="126" rx="92" ry="4" style="fill:var(--tb-text)" opacity="0.13"/><ellipse cx="390" cy="126" rx="92" ry="4" style="fill:var(--tb-text)" opacity="0.13"/><g class="k-shadow"><rect class="k-alu" x="40" y="30" width="180" height="92" rx="4"/></g><g class="k-shadow"><rect x="300" y="30" width="180" height="92" rx="30" style="fill:url(#dz-soft);stroke:var(--k-line-2)" stroke-width="1"/></g><line x1="44" y1="33" x2="216" y2="33" style="stroke:var(--tb-accent)" stroke-width="2.4"><animate attributeName="opacity" values="1;0.2;1" dur="3s" repeatCount="indefinite"/></line><line x1="42.5" y1="36" x2="42.5" y2="118" style="stroke:#ffffff" stroke-width="1.6" opacity="0.8"/><rect x="312" y="38" width="156" height="30" rx="15" fill="#ffffff" opacity="0.35"/><text class="lbl" x="130" y="146" text-anchor="middle">エッジを立てる: シャープ・輪郭明快</text><text class="lbl" x="390" y="146" text-anchor="middle">エッジを寝かせる: 柔らか・輪郭があいまい</text>
</svg>
<p class="tb-caption">図: 小 R のエッジは光る線 (色の線) として輪郭を描く。大 R は輪郭がぼける</p>
<h2>ゲシュタルトの原則 — 人はまとまりを見つける</h2>
<p>人はバラバラの要素を、自動的に<b>グループ</b>として見ます。この性質を利用すると、ボタンの配置や分割線だけで「何と何が関係しているか」を伝えられます。</p>
<svg class="tb-chart" viewBox="0 0 520 192" role="img" aria-label="近接・類同・閉合・連続">
<rect class="k-panel" x="8" y="8" width="120" height="146" rx="8"/><rect class="k-panel" x="136" y="8" width="120" height="146" rx="8"/><rect class="k-panel" x="264" y="8" width="120" height="146" rx="8"/><rect class="k-panel" x="392" y="8" width="120" height="146" rx="8"/><circle cx="36" cy="46" r="7" style="fill:var(--k-line)"/><circle cx="56" cy="46" r="7" style="fill:var(--k-line)"/><circle cx="36" cy="66" r="7" style="fill:var(--k-line)"/><circle cx="56" cy="66" r="7" style="fill:var(--k-line)"/><circle cx="84" cy="46" r="7" style="fill:var(--k-line)"/><circle cx="104" cy="46" r="7" style="fill:var(--k-line)"/><circle cx="84" cy="66" r="7" style="fill:var(--k-line)"/><circle cx="104" cy="66" r="7" style="fill:var(--k-line)"/><circle cx="164" cy="46" r="7" style="fill:var(--k-line)"/><circle cx="164" cy="66" r="7" style="fill:var(--k-line)"/><circle cx="184" cy="46" r="7" style="fill:var(--tb-accent)"/><circle cx="184" cy="66" r="7" style="fill:var(--tb-accent)"/><circle cx="204" cy="46" r="7" style="fill:var(--k-line)"/><circle cx="204" cy="66" r="7" style="fill:var(--k-line)"/><circle cx="224" cy="46" r="7" style="fill:var(--tb-accent)"/><circle cx="224" cy="66" r="7" style="fill:var(--tb-accent)"/><g fill="none" style="stroke:var(--k-line)" stroke-width="3"><path d="M290,36 L330,36"/><path d="M340,42 L340,74"/><path d="M330,82 L290,82"/><path d="M280,74 L280,44"/></g><path d="M396,82 C420,20 450,100 492,40" fill="none" style="stroke:var(--k-line)" stroke-width="3"/><path d="M396,40 C432,56 460,66 492,84" fill="none" style="stroke:var(--tb-accent)" stroke-width="3"/><text class="lbl" x="68" y="120" text-anchor="middle">近接</text><text class="tick" x="68" y="138" text-anchor="middle">近いものは仲間</text><text class="lbl" x="196" y="120" text-anchor="middle">類同</text><text class="tick" x="196" y="138" text-anchor="middle">同じ色・形は仲間</text><text class="lbl" x="324" y="120" text-anchor="middle">閉合</text><text class="tick" x="324" y="138" text-anchor="middle">すき間があっても四角</text><text class="lbl" x="452" y="120" text-anchor="middle">連続</text><text class="tick" x="452" y="138" text-anchor="middle">なめらかな線は 1 本</text><text class="lbl" x="260" y="180" text-anchor="middle">製品では: ボタンの群・色分け・分割線の流れで関係を伝える</text>
</svg>
<p class="tb-caption">図: ゲシュタルトの 4 原則。左から近接・類同・閉合・連続</p>
<ul>
  <li><b>近接</b>: 音量 + と − は寄せ、電源は離す → 機能のグループが見える</li>
  <li><b>類同</b>: 同じ種類の操作は同じ形・色にする。違うものは違って見せる</li>
  <li><b>閉合</b>: 分割線が途中で切れていても、人は 1 つの面として補って見る</li>
  <li><b>連続</b>: 窓の縁・分割線・ボタン列を 1 本の流れに乗せると、全体が整う</li>
</ul>
<svg class="tb-chart" viewBox="0 0 520 214" role="img" aria-label="リモコンの配置の前後比較">
<defs><linearGradient id="dz-rm" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4a5260"/><stop offset="1" stop-color="#22272f"/></linearGradient></defs><rect class="k-panel" x="8" y="8" width="248" height="198" rx="8"/><rect class="k-panel" x="264" y="8" width="248" height="198" rx="8"/><circle class="k-badge" cx="28" cy="28" r="10" style="fill:var(--tb-bad)"/><text class="k-badge-t" x="28" y="32" text-anchor="middle">✕</text><text class="k-title" x="46" y="32">前: ばらばら</text><circle class="k-badge" cx="284" cy="28" r="10" style="fill:var(--tb-good)"/><text class="k-badge-t" x="284" y="32" text-anchor="middle">✓</text><text class="k-title" x="302" y="32">後: グループ化</text><g class="k-shadow"><rect x="77" y="42" width="110" height="138" rx="18" style="fill:url(#dz-rm);stroke:#11151a" stroke-width="1.4"/></g><path d="M95,46 L169,46" fill="none" style="stroke:#ffffff" stroke-width="1.4" opacity="0.5"/><g class="k-shadow"><rect x="333" y="42" width="110" height="138" rx="18" style="fill:url(#dz-rm);stroke:#11151a" stroke-width="1.4"/></g><path d="M351,46 L425,46" fill="none" style="stroke:#ffffff" stroke-width="1.4" opacity="0.5"/><circle cx="102" cy="67" r="8" style="fill:#9aa3b0;stroke:#11151a" stroke-width="1"/><circle cx="100" cy="64" r="3" fill="#ffffff" opacity="0.35"/><circle cx="137" cy="77" r="8" style="fill:#9aa3b0;stroke:#11151a" stroke-width="1"/><circle cx="135" cy="74" r="3" fill="#ffffff" opacity="0.35"/><circle cx="162" cy="62" r="8" style="fill:#9aa3b0;stroke:#11151a" stroke-width="1"/><circle cx="160" cy="59" r="3" fill="#ffffff" opacity="0.35"/><circle cx="107" cy="112" r="8" style="fill:#9aa3b0;stroke:#11151a" stroke-width="1"/><circle cx="105" cy="109" r="3" fill="#ffffff" opacity="0.35"/><circle cx="152" cy="107" r="8" style="fill:#9aa3b0;stroke:#11151a" stroke-width="1"/><circle cx="150" cy="104" r="3" fill="#ffffff" opacity="0.35"/><circle cx="127" cy="147" r="8" style="fill:#9aa3b0;stroke:#11151a" stroke-width="1"/><circle cx="125" cy="144" r="3" fill="#ffffff" opacity="0.35"/><circle cx="413" cy="64" r="8" style="fill:var(--tb-bad);stroke:#11151a" stroke-width="1"/><circle cx="411" cy="61" r="3" fill="#ffffff" opacity="0.35"/><rect x="349" y="86" width="40" height="60" rx="10" fill="none" style="stroke:var(--tb-accent)" stroke-width="1.2" stroke-dasharray="3 2"/><circle cx="369" cy="102" r="8" style="fill:var(--tb-accent);stroke:#11151a" stroke-width="1"/><circle cx="367" cy="99" r="3" fill="#ffffff" opacity="0.35"/><circle cx="369" cy="128" r="8" style="fill:var(--tb-accent);stroke:#11151a" stroke-width="1"/><circle cx="367" cy="125" r="3" fill="#ffffff" opacity="0.35"/><circle cx="411" cy="102" r="8" style="fill:#9aa3b0;stroke:#11151a" stroke-width="1"/><circle cx="409" cy="99" r="3" fill="#ffffff" opacity="0.35"/><circle cx="411" cy="128" r="8" style="fill:#9aa3b0;stroke:#11151a" stroke-width="1"/><circle cx="409" cy="125" r="3" fill="#ffffff" opacity="0.35"/><text class="k-note" x="456" y="68">電源</text><text class="k-note" x="388" y="202" text-anchor="middle">近接 + 類同でグループ化</text>
</svg>
<p class="tb-caption">図: 同じ 6 個 (後は 5 個) のボタンでも、配置と色で使い方が読み取れるようになる</p>
<div class="tb-tip"><b>3DCAD Studio</b>: 同じ箱にフィレットと面取りをそれぞれかけ、リアル表示で光の映り方を見比べてみましょう。R の値をパラメータにしておくと、印象の変化を素早く試せます。</div>`,
    points: [
      "箱は安定、円柱は方向性と握りやすさ、球は親しみ — 骨格になる立体を役割から選ぶ",
      "面取りは硬質で輪郭が締まり、R は大きいほど柔らかい。触れる角はピン角を避ける",
      "主役の面の境を小 R で立てると、その面が「顔」として際立つ",
      "近接・類同・閉合・連続を使うと、配置と色だけで要素の関係が伝わる",
    ],
    exercises: [
      {
        q: "電源・音量+・音量−・入力切替の 4 ボタンを持つ小型スピーカの上面配置を、ゲシュタルトの原則を使って考えてください。",
        a: "音量 + と − は<b>近接</b>させ、同じ形にそろえる (<b>類同</b>)。電源は誤操作を防ぐため離し、形 (丸) や色を変えて区別する。入力切替は音量群と電源の中間に置き、ボタンの中心を 1 本の線にそろえる (<b>連続</b>)。音量群をくぼみで囲むと、1 つのまとまりとして見える (<b>閉合</b>)。",
      },
    ],
    quiz: [
      { q: "角を平面で落とす処理は?", choices: ["R (フィレット)", "面取り (C)", "シェル"], answer: 1, explain: "面取りは角を平面で落とし、硬質で精密な印象を与えます。" },
      { q: "「近いものは同じグループに見える」原則は?", choices: ["類同", "近接", "閉合"], answer: 1, explain: "近接の原則です。関係の深いボタンを寄せて配置します。" },
      { q: "線が途中で切れていても 1 つの形として見えるのは?", choices: ["閉合", "連続", "対称"], answer: 0, explain: "人は欠けた部分を補って閉じた形として見ます (閉合)。" },
    ],
    lessons: ["3-4"],
  },
  {
    id: "proportion-grid",
    part: "design",
    title: "【中級】レイアウトと比率の実践",
    minutes: 20,
    level: 2,
    lead: "操作パネルや製品の正面は、見えない「グリッド」と整列線で整えると、要素が増えても落ち着いて見えます。余白、モジュール寸法、黄金比・白銀比の使いどころを、前後比較で学びます。",
    body: `
<h2>グリッドで考える</h2>
<p>グリッドは、要素を置く位置の「マス目」です。先に余白 (マージン) と列 (カラム) の幅を決め、ボタン・表示窓・ロゴをその線に合わせて置きます。</p>
<svg class="tb-chart" viewBox="0 0 520 210" role="img" aria-label="グリッドなしとグリッドありの操作パネル">
<defs><linearGradient id="dz-scr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2c3440"/><stop offset="1" stop-color="#141920"/></linearGradient></defs><rect class="k-panel" x="8" y="8" width="248" height="194" rx="8"/><rect class="k-panel" x="264" y="8" width="248" height="194" rx="8"/><circle class="k-badge" cx="28" cy="28" r="10" style="fill:var(--tb-bad)"/><text class="k-badge-t" x="28" y="32" text-anchor="middle">✕</text><text class="k-title" x="46" y="32">前: 位置がばらばら</text><circle class="k-badge" cx="284" cy="28" r="10" style="fill:var(--tb-good)"/><text class="k-badge-t" x="284" y="32" text-anchor="middle">✓</text><text class="k-title" x="302" y="32">後: 余白・列・行にそろえる</text><g class="k-shadow"><rect class="k-alu" x="22" y="42" width="220" height="140" rx="10"/></g><g class="k-shadow"><rect class="k-alu" x="278" y="42" width="220" height="140" rx="10"/></g><rect x="40" y="56" width="120" height="44" rx="3" style="fill:url(#dz-scr)"/><circle class="k-part-h" cx="202" cy="74" r="13"/><rect class="k-plastic" x="47" y="122" width="34" height="22" rx="3" stroke-width="1.2"/><rect class="k-plastic" x="97" y="116" width="34" height="22" rx="3" stroke-width="1.2"/><rect class="k-plastic" x="154" y="126" width="34" height="22" rx="3" stroke-width="1.2"/><text class="k-note" x="187" y="170">ロゴ</text><g style="stroke:var(--tb-accent)" stroke-width="0.8" stroke-dasharray="3 3" opacity="0.8"><line x1="298" y1="42" x2="298" y2="182"/><line x1="478" y1="42" x2="478" y2="182"/><line x1="358" y1="42" x2="358" y2="182"/><line x1="418" y1="42" x2="418" y2="182"/><line x1="278" y1="62" x2="498" y2="62"/><line x1="278" y1="162" x2="498" y2="162"/></g><rect x="298" y="62" width="120" height="44" rx="3" style="fill:url(#dz-scr)"/><circle class="k-part-h" cx="448" cy="84" r="13"/><rect class="k-plastic" x="298" y="126" width="48" height="22" rx="3" stroke-width="1.2"/><rect class="k-plastic" x="358" y="126" width="48" height="22" rx="3" stroke-width="1.2"/><rect class="k-plastic" x="418" y="126" width="48" height="22" rx="3" stroke-width="1.2"/><text class="k-note" x="478" y="176" text-anchor="end">ロゴ</text>
</svg>
<p class="tb-caption">図: 同じ要素でも、グリッド (点線) に合わせるだけで整然と見える</p>
<h2>余白と整列線</h2>
<ul>
  <li><b>外周の余白</b>は、内側の要素間のすき間より<b>広く</b>とるのが目安。窮屈さがなくなる</li>
  <li>関係の深い要素どうしのすき間は狭く、グループ間は広く (近接の原則)</li>
  <li>要素の<b>端</b>か<b>中心</b>のどちらかに整列線を通す。両者が混在すると落ち着かない</li>
  <li>表示窓・ボタン・分割線・ロゴの基準線を、製品の外形線とも関係づける</li>
</ul>
<h2>モジュール寸法</h2>
<p>すべての寸法を基本単位 (モジュール) の倍数にすると、要素どうしが自然にそろいます。例えば 4 mm モジュールなら、余白 8、ボタン 12、ボタン間隔 4 … のように決めます。</p>
<svg class="tb-chart" viewBox="0 0 520 134" role="img" aria-label="モジュール寸法">
<rect x="20" y="30" width="440" height="60" fill="url(#k-dots)" opacity="0.6"/><g style="stroke:var(--tb-border)" stroke-width="0.6"><line x1="20" y1="26" x2="20" y2="94"/><line x1="40" y1="26" x2="40" y2="94"/><line x1="60" y1="26" x2="60" y2="94"/><line x1="80" y1="26" x2="80" y2="94"/><line x1="100" y1="26" x2="100" y2="94"/><line x1="120" y1="26" x2="120" y2="94"/><line x1="140" y1="26" x2="140" y2="94"/><line x1="160" y1="26" x2="160" y2="94"/><line x1="180" y1="26" x2="180" y2="94"/><line x1="200" y1="26" x2="200" y2="94"/><line x1="220" y1="26" x2="220" y2="94"/><line x1="240" y1="26" x2="240" y2="94"/><line x1="260" y1="26" x2="260" y2="94"/><line x1="280" y1="26" x2="280" y2="94"/><line x1="300" y1="26" x2="300" y2="94"/><line x1="320" y1="26" x2="320" y2="94"/><line x1="340" y1="26" x2="340" y2="94"/><line x1="360" y1="26" x2="360" y2="94"/><line x1="380" y1="26" x2="380" y2="94"/><line x1="400" y1="26" x2="400" y2="94"/><line x1="420" y1="26" x2="420" y2="94"/><line x1="440" y1="26" x2="440" y2="94"/><line x1="460" y1="26" x2="460" y2="94"/></g><g class="k-shadow"><rect class="k-accent" x="60" y="34" width="120" height="52" rx="4" opacity="0.8"/></g><g class="k-shadow"><rect class="k-accent" x="220" y="34" width="120" height="52" rx="4" opacity="0.8"/></g><g class="k-shadow"><rect class="k-accent" x="380" y="34" width="80" height="52" rx="4"/></g><text class="k-title" x="120" y="64" text-anchor="middle" style="fill:#ffffff">部品</text><text class="k-title" x="280" y="64" text-anchor="middle" style="fill:#ffffff">部品</text><text class="k-title" x="420" y="64" text-anchor="middle" style="fill:#ffffff">部品</text><line class="k-dimline" x1="20" y1="106" x2="60" y2="106"/><text class="k-dimtext" x="40" y="124" text-anchor="middle">4</text><line class="k-dimline" x1="60" y1="106" x2="180" y2="106"/><text class="k-dimtext" x="120" y="124" text-anchor="middle">12</text><line class="k-dimline" x1="180" y1="106" x2="220" y2="106"/><text class="k-dimtext" x="200" y="124" text-anchor="middle">4</text><line class="k-dimline" x1="220" y1="106" x2="340" y2="106"/><text class="k-dimtext" x="280" y="124" text-anchor="middle">12</text><line class="k-dimline" x1="340" y1="106" x2="380" y2="106"/><text class="k-dimtext" x="360" y="124" text-anchor="middle">4</text><line class="k-dimline" x1="380" y1="106" x2="460" y2="106"/><text class="k-dimtext" x="420" y="124" text-anchor="middle">8</text><text class="lbl" x="500" y="64" text-anchor="end">mm</text><text class="k-note" x="20" y="18">1 マス = 4 mm</text>
</svg>
<p class="tb-caption">図: 4 mm モジュールでの寸法の並び (例)。余白・部品・すき間がすべて 4 の倍数</p>
<h2>黄金比・白銀比の実例</h2>
<p>比率は、外形だけでなく<b>内部の分割</b>にも使えます。例えば正面を上下に分割するとき、1 : 1 で真ん中を割ると単調ですが、黄金比 (約 0.382 : 0.618) で割ると主従がはっきりします。</p>
<svg class="tb-chart" viewBox="0 0 520 210" role="img" aria-label="中央分割と黄金比分割">
<rect class="k-panel" x="8" y="8" width="248" height="194" rx="8"/><rect class="k-panel" x="264" y="8" width="248" height="194" rx="8"/><circle class="k-badge" cx="28" cy="28" r="10" style="fill:var(--tb-bad)"/><text class="k-badge-t" x="28" y="32" text-anchor="middle">✕</text><text class="k-title" x="46" y="32">1 : 1</text><circle class="k-badge" cx="284" cy="28" r="10" style="fill:var(--tb-good)"/><text class="k-badge-t" x="284" y="32" text-anchor="middle">✓</text><text class="k-title" x="302" y="32">黄金比</text><g class="k-shadow"><rect class="k-alu" x="40" y="44" width="170" height="130" rx="10"/><rect class="k-alu" x="296" y="44" width="170" height="130" rx="10"/></g><line x1="40" y1="109" x2="210" y2="109" style="stroke:var(--tb-bad)" stroke-width="2.2"/><path d="M296,93.7 L466,93.7 L466,54 Q466,44 456,44 L306,44 Q296,44 296,54 Z" style="fill:var(--k-steel-3)" opacity="0.8"/><line x1="296" y1="93.7" x2="466" y2="93.7" style="stroke:var(--tb-good)" stroke-width="2.2"/><circle class="k-accent" cx="320" cy="69" r="7"/><rect x="336" y="64" width="50" height="10" rx="3" style="fill:#1f252e"/><line class="k-dimline" x1="482" y1="44" x2="482" y2="93.7"/><text class="k-dimtext" x="486" y="72.8" text-anchor="start">0.382</text><line class="k-dimline" x1="482" y1="93.7" x2="482" y2="174"/><text class="k-dimtext" x="486" y="137.8" text-anchor="start">0.618</text><line class="k-ext" x1="212" y1="44" x2="230" y2="44"/><line class="k-ext" x1="212" y1="109" x2="230" y2="109"/><line class="k-dimline" x1="226" y1="44" x2="226" y2="109"/><line class="k-ext" x1="212" y1="109" x2="230" y2="109"/><line class="k-ext" x1="212" y1="174" x2="230" y2="174"/><line class="k-dimline" x1="226" y1="109" x2="226" y2="174"/><text class="k-note" x="132" y="194" text-anchor="middle">どちらが主役かあいまい</text><text class="k-note" x="380" y="194" text-anchor="middle">上が操作部、下が本体</text>
</svg>
<p class="tb-caption">図: 同じ外形の正面分割の前後比較</p>
<table class="tb-table">
  <tr><th>比率</th><th>値</th><th>身近な例</th></tr>
  <tr><td>黄金比</td><td>1 : 1.618</td><td>名刺やクレジットカードに近い比率 (カードは約 1 : 1.59)</td></tr>
  <tr><td>白銀比</td><td>1 : 1.414 (√2)</td><td>A 判・B 判の用紙 (半分に折っても同じ比)</td></tr>
  <tr><td>白銀比 (もう一つの定義・白銀数)</td><td>1 : 2.414 (1 + √2)</td><td>「白銀比」はこの値を指すこともあるので、どちらの意味か確認する</td></tr>
  <tr><td>16 : 9</td><td>1 : 1.778</td><td>ディスプレイ</td></tr>
</table>
<div class="tb-note">黄金比が「最も美しい」という主張には、実験的な裏付けが弱いという指摘もあります。比率は<b>そろえるためのものさし</b>として使い、最後は実物大の模型やレンダリングで目で確かめるのが実務の目安です。</div>
<div class="tb-tip"><b>3DCAD Studio</b>: パラメータに「幅 W」を作り、高さを W / 1.618 や W / 1.414 の式にしておくと、比率を切り替えて比べられます。高解像度画像で並べて保存し、レビューで比較しましょう。</div>`,
    points: [
      "先に余白と列を決め、要素をグリッドの線に合わせて置く",
      "外周の余白は内部のすき間より広く。整列は端か中心かを統一する",
      "寸法をモジュールの倍数にすると、要素が自然にそろう",
      "黄金比・白銀比は分割にも使えるものさし。最後は目で確かめる",
    ],
    exercises: [
      {
        q: "幅 120 mm の操作パネルに、外周余白 8 mm、同じ幅のボタンを 4 個、ボタン間隔 4 mm で並べます。ボタン幅はいくつですか。4 mm モジュールに乗っていますか。",
        a: "ボタンに使える幅 = 120 − 8 × 2 − 4 × 3 = 120 − 16 − 12 = <b>92 mm</b>。1 個あたり 92 / 4 = <b>23 mm</b>。23 は 4 の倍数ではないので、外周余白を 10 mm にして 88 / 4 = 22 mm、またはボタン幅 24 mm として余白を 6 mm にするなど、モジュールに合わせて調整する (どちらが良いかは外周余白 > すき間 の原則で判断し、余白 6 mm でも間隔 4 mm より広いので可)。",
      },
    ],
    quiz: [
      { q: "A 判用紙の縦横比は?", choices: ["1 : 1.618", "1 : 1.414", "16 : 9"], answer: 1, explain: "A 判は白銀比 1 : √2 で、半分に切っても同じ比になります。" },
      { q: "外周の余白と要素間のすき間の関係として一般的な目安は?", choices: ["外周余白を広く", "同じにする", "外周余白を狭く"], answer: 0, explain: "外周を広くとると窮屈さがなく、まとまって見えます。" },
      { q: "モジュール寸法の利点は?", choices: ["材料費が下がる", "寸法どうしが自然にそろい、整って見える", "強度が上がる"], answer: 1, explain: "基本単位の倍数で決めると、要素の端や間隔がそろいます。" },
    ],
    lessons: ["8-1"],
  },
  {
    id: "materials-finish-design",
    part: "design",
    title: "【中級】素材と加工が生む表情",
    minutes: 20,
    level: 2,
    lead: "同じ形でも、シボの深さ、鏡面か梨地か、ヘアラインかブラストかで印象はまったく変わります。主な仕上げの仕組みを断面で理解し、量産で同じ表情を再現するための注意点を学びます。",
    body: `
<h2>樹脂の表面 — 金型の表面がそのまま写る</h2>
<p>射出成形品の表面は、<b>金型の表面の転写</b>です。金型を磨けば鏡面に、エッチングで凹凸をつければシボになります。</p>
<svg class="tb-chart" viewBox="0 0 520 176" role="img" aria-label="樹脂表面仕上げの断面模式図">
<text class="sec" x="20" y="22">断面 (拡大模式図)</text><g class="k-shadow"><rect class="k-cut" x="30" y="80" width="130" height="40"/></g><line x1="30" y1="80" x2="160" y2="80" style="stroke:var(--tb-accent)" stroke-width="2.4"/><path d="M60,40 L95,78 L130,40" fill="none" style="stroke:var(--tb-warn)" stroke-width="1.6" marker-end="url(#k-arrow)"/><g class="k-shadow"><path class="k-cut" d="M190,120 L190,82 l6,-5 l5,5 l7,-6 l5,6 l6,-4 l6,4 l5,-6 l7,6 l5,-5 l6,5 l6,-4 l6,4 l5,-6 l6,6 l5,-5 l6,5 l6,-4 l6,4 l4,-3 L320,120 Z"/></g><path d="M225,40 L255,76" fill="none" style="stroke:var(--tb-warn)" stroke-width="1.6"/><line x1="255" y1="76" x2="232.5" y2="63" style="stroke:var(--tb-warn)" stroke-width="1.1" marker-end="url(#k-arrow)"/><line x1="255" y1="76" x2="244" y2="52.4" style="stroke:var(--tb-warn)" stroke-width="1.1" marker-end="url(#k-arrow)"/><line x1="255" y1="76" x2="259.5" y2="50.4" style="stroke:var(--tb-warn)" stroke-width="1.1" marker-end="url(#k-arrow)"/><line x1="255" y1="76" x2="273.4" y2="57.6" style="stroke:var(--tb-warn)" stroke-width="1.1" marker-end="url(#k-arrow)"/><line x1="255" y1="76" x2="279.4" y2="67.1" style="stroke:var(--tb-warn)" stroke-width="1.1" marker-end="url(#k-arrow)"/><g class="k-shadow"><rect class="k-cut" x="350" y="86" width="140" height="34"/></g><rect x="350" y="76" width="140" height="10" style="fill:var(--tb-accent);stroke:var(--k-line)" stroke-width="1" opacity="0.85"/><rect x="350" y="71" width="140" height="5" style="fill:var(--tb-surface);stroke:var(--k-line)" stroke-width="1" opacity="0.8"/><text class="lbl" x="95" y="145" text-anchor="middle">鏡面</text><text class="tick" x="95" y="162" text-anchor="middle">金型を研磨</text><text class="lbl" x="255" y="145" text-anchor="middle">シボ</text><text class="tick" x="255" y="162" text-anchor="middle">金型をエッチング</text><text class="lbl" x="420" y="145" text-anchor="middle">塗装</text><text class="tick" x="420" y="162" text-anchor="middle">下塗り + 上塗り (クリア)</text><path class="k-thin" d="M470,73 L476,52" marker-start="url(#k-dot)"/><text class="tick" x="480" y="50" text-anchor="end">クリア層</text>
</svg>
<p class="tb-caption">図: 樹脂の主な仕上げの断面。シボの深さは数十 µm 程度が多い (柄により異なる)</p>
<table class="tb-table">
  <tr><th>仕上げ</th><th>表情</th><th>注意点</th></tr>
  <tr><td>シボ</td><td>落ち着いた梨地、革調など柄は多数</td><td>深いほど抜き勾配が必要。傷・指紋・ヒケが目立ちにくい</td></tr>
  <tr><td>鏡面</td><td>高級感・つや</td><td>傷・ヒケ・ウェルドが目立つ。金型の磨きに費用</td></tr>
  <tr><td>塗装</td><td>色・つやの自由度が高い、メタリックも可</td><td>工程とコストが増える。剥がれ・ブツ (異物) の管理</td></tr>
  <tr><td>インモールド (IMD/IML)</td><td>印刷したフィルムを型内で一体化。柄・文字が摩耗しにくい</td><td>深い曲面はフィルムが追従しにくい。初期費用</td></tr>
</table>
<h2>金属の表面 — 削る・打つ・染める</h2>
<svg class="tb-chart" viewBox="0 0 520 174" role="img" aria-label="金属表面仕上げの模式図">
<defs><linearGradient id="dz-hl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c3cad3"/><stop offset="0.5" stop-color="#eef1f5"/><stop offset="1" stop-color="#aab3bf"/></linearGradient><radialGradient id="dz-bl" cx="0.4" cy="0.35" r="0.9"><stop offset="0" stop-color="#d8dde3"/><stop offset="1" stop-color="#9aa3ae"/></radialGradient><linearGradient id="dz-an" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4f86e8"/><stop offset="1" stop-color="#2c5bb5"/></linearGradient><clipPath id="dz-hc"><rect x="30" y="30" width="140" height="90" rx="6"/></clipPath></defs><g class="k-shadow"><rect x="30" y="30" width="140" height="90" rx="6" style="fill:url(#dz-hl);stroke:var(--k-line)" stroke-width="1.4"/></g><g clip-path="url(#dz-hc)"><g style="stroke:#6b7480" stroke-width="0.6" opacity="0.6"><line x1="30" y1="33" x2="170" y2="33"/><line x1="30" y1="36.3" x2="170" y2="36.3"/><line x1="30" y1="39.6" x2="170" y2="39.6"/><line x1="30" y1="42.9" x2="170" y2="42.9"/><line x1="30" y1="46.2" x2="170" y2="46.2"/><line x1="30" y1="49.5" x2="170" y2="49.5"/><line x1="30" y1="52.8" x2="170" y2="52.8"/><line x1="30" y1="56.1" x2="170" y2="56.1"/><line x1="30" y1="59.4" x2="170" y2="59.4"/><line x1="30" y1="62.7" x2="170" y2="62.7"/><line x1="30" y1="66" x2="170" y2="66"/><line x1="30" y1="69.3" x2="170" y2="69.3"/><line x1="30" y1="72.6" x2="170" y2="72.6"/><line x1="30" y1="75.9" x2="170" y2="75.9"/><line x1="30" y1="79.2" x2="170" y2="79.2"/><line x1="30" y1="82.5" x2="170" y2="82.5"/><line x1="30" y1="85.8" x2="170" y2="85.8"/><line x1="30" y1="89.1" x2="170" y2="89.1"/><line x1="30" y1="92.4" x2="170" y2="92.4"/><line x1="30" y1="95.7" x2="170" y2="95.7"/><line x1="30" y1="99" x2="170" y2="99"/><line x1="30" y1="102.3" x2="170" y2="102.3"/><line x1="30" y1="105.6" x2="170" y2="105.6"/><line x1="30" y1="108.9" x2="170" y2="108.9"/><line x1="30" y1="112.2" x2="170" y2="112.2"/><line x1="30" y1="115.5" x2="170" y2="115.5"/><line x1="30" y1="118.8" x2="170" y2="118.8"/></g><rect x="30" y="30" width="20" height="90" fill="#ffffff" opacity="0.45"><animate attributeName="x" values="30;150;30" dur="5s" repeatCount="indefinite"/></rect></g><g class="k-shadow"><rect x="190" y="30" width="140" height="90" rx="6" style="fill:url(#dz-bl);stroke:var(--k-line)" stroke-width="1.4"/></g><g fill="#5d6672" opacity="0.55"><circle cx="276.2" cy="94.8" r="1.1"/><circle cx="318.4" cy="94.7" r="1.1"/><circle cx="197.8" cy="72.2" r="1.2"/><circle cx="279.7" cy="107.9" r="0.6"/><circle cx="255.9" cy="54.2" r="0.9"/><circle cx="269.8" cy="35.1" r="0.7"/><circle cx="230.9" cy="109.1" r="1"/><circle cx="215.1" cy="99.4" r="0.6"/><circle cx="275.5" cy="44.4" r="0.5"/><circle cx="309" cy="51.2" r="0.7"/><circle cx="323.7" cy="105.5" r="0.7"/><circle cx="320.9" cy="78.2" r="1"/><circle cx="221" cy="111.2" r="1"/><circle cx="321.6" cy="107.3" r="0.7"/><circle cx="241.7" cy="47.6" r="0.6"/><circle cx="202.6" cy="58.7" r="0.9"/><circle cx="194.4" cy="89.6" r="0.7"/><circle cx="234.9" cy="101.1" r="0.8"/><circle cx="235.7" cy="73.5" r="1"/><circle cx="201.5" cy="114" r="0.5"/><circle cx="293" cy="103.3" r="0.5"/><circle cx="298" cy="64" r="0.9"/><circle cx="195.2" cy="37.8" r="0.6"/><circle cx="320.1" cy="50.1" r="1"/><circle cx="316.7" cy="111.2" r="0.7"/><circle cx="240.8" cy="77" r="1"/><circle cx="208.3" cy="95.4" r="1.1"/><circle cx="307.5" cy="37" r="1.2"/><circle cx="206" cy="61.9" r="0.9"/><circle cx="315.2" cy="61.9" r="1.1"/><circle cx="266" cy="59.6" r="0.7"/><circle cx="217.4" cy="40.4" r="0.6"/><circle cx="285" cy="115.7" r="0.6"/><circle cx="200.4" cy="114.9" r="0.9"/><circle cx="247.6" cy="53.5" r="0.9"/><circle cx="303.1" cy="71.4" r="0.8"/><circle cx="201.4" cy="109.1" r="0.5"/><circle cx="259.2" cy="102.8" r="0.6"/><circle cx="290.6" cy="111.9" r="0.9"/><circle cx="298" cy="42.7" r="0.8"/><circle cx="213.7" cy="103.3" r="0.7"/><circle cx="253.8" cy="115.9" r="1.1"/><circle cx="322.8" cy="71.2" r="0.8"/><circle cx="290.3" cy="73.3" r="0.7"/><circle cx="247.3" cy="46" r="0.8"/><circle cx="324.5" cy="112.7" r="0.9"/><circle cx="259.9" cy="61.8" r="0.6"/><circle cx="229.9" cy="98.1" r="1.1"/><circle cx="241.7" cy="98.5" r="1"/><circle cx="285.7" cy="88.4" r="1"/><circle cx="242" cy="91.8" r="0.7"/><circle cx="258.1" cy="97.1" r="1"/><circle cx="232.8" cy="111.5" r="1"/><circle cx="270.6" cy="34.9" r="0.9"/><circle cx="227.1" cy="89.1" r="0.8"/><circle cx="301.8" cy="87.1" r="1.1"/><circle cx="239.9" cy="86.8" r="1"/><circle cx="303.3" cy="62.7" r="1.1"/><circle cx="308.8" cy="90.4" r="1.2"/><circle cx="320.3" cy="76.5" r="0.9"/><circle cx="215.9" cy="102.6" r="1.2"/><circle cx="257" cy="90.7" r="1"/><circle cx="290.4" cy="48.1" r="1"/><circle cx="270.7" cy="88.6" r="0.8"/><circle cx="276.3" cy="97.5" r="0.9"/><circle cx="289.1" cy="36.3" r="0.6"/><circle cx="252.2" cy="87.3" r="0.7"/><circle cx="284.5" cy="85.7" r="0.5"/><circle cx="256.2" cy="52.6" r="0.5"/><circle cx="211.6" cy="60" r="0.6"/><circle cx="219.5" cy="36.9" r="0.8"/><circle cx="244.2" cy="84.2" r="0.9"/><circle cx="225.4" cy="108.1" r="0.5"/><circle cx="247.5" cy="56.8" r="0.8"/><circle cx="209.2" cy="102.2" r="0.8"/><circle cx="198.8" cy="84.3" r="0.6"/><circle cx="266" cy="61.8" r="0.9"/><circle cx="320.5" cy="101.1" r="0.8"/><circle cx="301.3" cy="86.7" r="0.8"/><circle cx="212.8" cy="82.9" r="0.9"/><circle cx="320.4" cy="113.4" r="0.9"/><circle cx="240.3" cy="107.3" r="0.5"/><circle cx="208.2" cy="80.4" r="0.9"/><circle cx="212.6" cy="85.6" r="1.1"/><circle cx="243.6" cy="69.4" r="0.7"/><circle cx="232.5" cy="113.7" r="0.8"/><circle cx="320.9" cy="108.9" r="0.9"/><circle cx="228.3" cy="114.4" r="0.8"/><circle cx="248.8" cy="60.2" r="1.2"/><circle cx="258.9" cy="57.5" r="0.8"/><circle cx="210.1" cy="85" r="0.8"/><circle cx="232.7" cy="98.1" r="1.1"/><circle cx="195.7" cy="77.7" r="0.7"/><circle cx="317.5" cy="98.1" r="0.7"/><circle cx="229.3" cy="46.7" r="1.2"/><circle cx="232.7" cy="83.9" r="0.8"/><circle cx="279.1" cy="83.5" r="1"/><circle cx="209.6" cy="96.4" r="0.7"/><circle cx="264.4" cy="61.6" r="0.7"/><circle cx="263.9" cy="72.1" r="0.8"/><circle cx="292.3" cy="82.4" r="0.5"/><circle cx="227.3" cy="71.4" r="1.1"/><circle cx="311.2" cy="78.7" r="0.5"/><circle cx="296.7" cy="69.1" r="0.9"/><circle cx="287.5" cy="85.8" r="0.8"/><circle cx="314.3" cy="65.6" r="0.8"/><circle cx="306.5" cy="50.1" r="0.7"/><circle cx="303.6" cy="39.4" r="1.1"/><circle cx="285.7" cy="69.5" r="0.7"/><circle cx="297.1" cy="108.7" r="0.6"/><circle cx="257.2" cy="79" r="0.8"/><circle cx="237.7" cy="46.6" r="0.9"/><circle cx="301.2" cy="39.6" r="0.7"/><circle cx="302.2" cy="98.9" r="1"/><circle cx="197.4" cy="93.3" r="1.2"/><circle cx="325.8" cy="91.5" r="0.5"/><circle cx="305.2" cy="52" r="1"/><circle cx="319.7" cy="92.4" r="0.6"/><circle cx="232.6" cy="109.3" r="0.6"/><circle cx="274.6" cy="67.9" r="0.6"/><circle cx="276.2" cy="37.6" r="0.6"/><circle cx="244.1" cy="39.9" r="0.5"/><circle cx="269.9" cy="94.9" r="1.1"/><circle cx="211.7" cy="69.4" r="0.7"/><circle cx="273.2" cy="74.1" r="1.2"/><circle cx="243.4" cy="38.6" r="1"/><circle cx="213.9" cy="85.8" r="0.9"/><circle cx="314.2" cy="79.5" r="0.9"/><circle cx="228.7" cy="79.2" r="0.7"/><circle cx="293.1" cy="76.4" r="0.6"/><circle cx="224.9" cy="64.4" r="1"/><circle cx="217.7" cy="92.5" r="1"/><circle cx="205.3" cy="88.8" r="0.6"/><circle cx="210.5" cy="82.7" r="0.7"/><circle cx="309.8" cy="73.4" r="0.7"/><circle cx="299.1" cy="36.4" r="1"/><circle cx="201.1" cy="46.4" r="1.2"/><circle cx="283.9" cy="52.3" r="0.6"/><circle cx="322.4" cy="88.5" r="1.1"/><circle cx="212.4" cy="85.2" r="0.7"/><circle cx="225" cy="61.3" r="0.9"/><circle cx="240" cy="65.6" r="0.6"/><circle cx="303.7" cy="87.1" r="1.1"/><circle cx="251.2" cy="103.8" r="0.9"/><circle cx="272.2" cy="81" r="1"/><circle cx="246.2" cy="42" r="0.5"/><circle cx="220.7" cy="37.2" r="1.1"/><circle cx="257.5" cy="96.3" r="0.5"/><circle cx="256.1" cy="107" r="0.9"/><circle cx="250.6" cy="72.2" r="0.6"/><circle cx="214.4" cy="47" r="0.8"/><circle cx="244.9" cy="106.2" r="0.6"/><circle cx="227.5" cy="56.7" r="0.6"/><circle cx="231.9" cy="53.3" r="0.8"/><circle cx="198.2" cy="109.8" r="0.8"/><circle cx="317.8" cy="90.4" r="1"/><circle cx="256.3" cy="111.5" r="0.6"/><circle cx="282.3" cy="57.9" r="1"/><circle cx="290.3" cy="47.4" r="0.6"/><circle cx="197.3" cy="52.9" r="0.6"/></g><g class="k-shadow"><rect class="k-cut" x="350" y="74" width="140" height="46"/></g><rect x="350" y="58" width="140" height="16" style="fill:url(#dz-an);stroke:var(--k-line)" stroke-width="1"/><g style="stroke:#ffffff" stroke-width="1.6" opacity="0.7"><line x1="358" y1="59" x2="358" y2="70"/><line x1="368" y1="59" x2="368" y2="70"/><line x1="378" y1="59" x2="378" y2="70"/><line x1="388" y1="59" x2="388" y2="70"/><line x1="398" y1="59" x2="398" y2="70"/><line x1="408" y1="59" x2="408" y2="70"/><line x1="418" y1="59" x2="418" y2="70"/><line x1="428" y1="59" x2="428" y2="70"/><line x1="438" y1="59" x2="438" y2="70"/><line x1="448" y1="59" x2="448" y2="70"/><line x1="458" y1="59" x2="458" y2="70"/><line x1="468" y1="59" x2="468" y2="70"/><line x1="478" y1="59" x2="478" y2="70"/><line x1="488" y1="59" x2="488" y2="70"/></g><text class="tick" x="420" y="48" text-anchor="middle">多孔質の酸化皮膜に染料 → 封孔</text><text class="lbl" x="100" y="145" text-anchor="middle">ヘアライン</text><text class="tick" x="100" y="162" text-anchor="middle">一方向の研磨目。光が帯になる</text><text class="lbl" x="260" y="145" text-anchor="middle">ブラスト</text><text class="tick" x="260" y="162" text-anchor="middle">粒を吹き付け均一な梨地</text><text class="lbl" x="420" y="145" text-anchor="middle">アルマイト</text><text class="tick" x="420" y="162" text-anchor="middle">アルミの陽極酸化</text>
</svg>
<p class="tb-caption">図: 金属の仕上げ。ヘアラインは目の方向に光の帯が走る (帯が動くのは見る角度を変えた様子)</p>
<ul>
  <li><b>ヘアライン</b>: 目の方向を製品の長手方向にそろえるのが一般的。継ぎ目で目の向きが変わると目立つ</li>
  <li><b>ブラスト + アルマイト</b>: ノート PC などに多い組合せ。皮膜は薄いので、角は欠けやすい → 角に小さな面取り</li>
  <li><b>アルマイトの色</b>は、合金の種類やロットで色味がずれやすい。同じ製品の部品は同じ合金・同じ処理条件で</li>
</ul>
<h2>木・布 — 自然素材の扱い</h2>
<table class="tb-table">
  <tr><th>素材</th><th>魅力</th><th>量産での注意</th></tr>
  <tr><td>木 (突板・無垢)</td><td>温かみ、経年で味が出る</td><td>木目・色が 1 点ずつ違う。含水率による反り。限度見本で許容範囲を決める</td></tr>
  <tr><td>布 (ファブリック)</td><td>柔らかさ、音を通す (スピーカ前面)</td><td>張りのしわ・端末処理、汚れ、難燃性の要否</td></tr>
  <tr><td>革・合成皮革</td><td>高級感、手になじむ</td><td>合成皮革は加水分解で劣化するものがある。用途に合う種類を選ぶ</td></tr>
</table>
<h2>量産での再現性</h2>
<ul>
  <li>シボ・つやは<b>番号 (シボメーカーの柄番号、光沢度)</b>で指定し、実物の見本板で承認する</li>
  <li>同じシボでも、樹脂の種類・成形条件・金型温度で見え方が変わる → 量産材料で見本を作る</li>
  <li>複数の部品 (樹脂と金属、異なる成形メーカー) を並べたとき、色とつやがそろうかを確認</li>
  <li>手作業の工程 (研磨・ヘアライン) はばらつきやすい → 限度見本で「ここまで良し」を決める</li>
</ul>
<div class="tb-tip"><b>3DCAD Studio</b>: 材料と色で金属・樹脂を切り替え、リアル表示で映り込みの違いを確認できます。勾配を付けた後で、シボ面の勾配が足りているか断面図で確かめましょう。</div>`,
    points: [
      "樹脂の表面は金型の転写。鏡面は磨き、シボはエッチングでつくる",
      "シボは傷・ヒケを隠すが勾配が多く必要。鏡面は欠点がすべて見える",
      "ヘアラインは目の向き、アルマイトは合金と処理条件で見え方が変わる",
      "量産では番号と見本板で指定し、量産材料・条件で承認する",
    ],
    exercises: [
      {
        q: "黒い樹脂のリモコンで、成形品の表面にヒケと指紋が目立つという不満が出ました。外観仕上げの面からの対策を挙げてください。",
        a: "鏡面をやめて<b>シボ (梨地)</b> にする (光が拡散し、ヒケ・指紋・傷が目立ちにくい)。シボの深さに応じて<b>抜き勾配を増やす</b>。色を真っ黒から<b>濃いグレー</b>にすると、ほこりや指紋の白さが目立ちにくくなる。根本的には肉厚の見直し (ヒケ対策) も併せて行う。",
      },
    ],
    quiz: [
      { q: "射出成形品のシボは通常どうやってつくる?", choices: ["成形後に紙やすりで削る", "金型表面をエッチングして転写する", "樹脂に粉を混ぜる"], answer: 1, explain: "金型表面に凹凸 (シボ) を付け、成形で転写します。" },
      { q: "アルマイト処理ができる代表的な金属は?", choices: ["鉄", "アルミニウム", "銅"], answer: 1, explain: "アルマイトはアルミニウムの陽極酸化処理です。" },
      { q: "鏡面仕上げの短所として正しいのは?", choices: ["傷やヒケが目立ちやすい", "勾配が多く必要", "色が付けられない"], answer: 0, explain: "鏡面は映り込みが強く、わずかな欠点も目立ちます。" },
    ],
    lessons: ["8-2"],
  },
  {
    id: "molded-design",
    part: "design",
    title: "【中級】樹脂成形品の意匠設計",
    minutes: 25,
    level: 2,
    lead: "射出成形品には、パーティングライン・ゲート跡・エジェクタピン跡・ウェルドライン・ヒケといった「成形の痕跡」が必ず生まれます。それらを見えない所へ導き、合わせ目の段差やすき間を意図的に設計して、量産品を美しく見せる方法を学びます。",
    body: `
<h2>成形の痕跡を知る</h2>
<svg class="tb-chart" viewBox="0 0 520 214" role="img" aria-label="成形品に現れる痕跡">
<ellipse cx="210" cy="172" rx="152" ry="5" style="fill:var(--tb-text)" opacity="0.13"/><g class="k-shadow"><rect class="k-plastic" x="60" y="44" width="300" height="126" rx="18"/></g><path d="M80,49 L340,49" fill="none" style="stroke:#ffffff" stroke-width="1.8" opacity="0.8"/><line x1="56" y1="107" x2="364" y2="107" style="stroke:var(--tb-accent)" stroke-width="2" stroke-dasharray="6 3"/><circle cx="210" cy="44" r="5" style="fill:var(--tb-warn);stroke:var(--k-line)" stroke-width="1"/><path d="M290,85 C286,110 298,140 290,170" fill="none" style="stroke:var(--tb-bad)" stroke-width="1.6" stroke-dasharray="2 2"/><circle cx="110" cy="142" r="6" style="fill:var(--k-plastic-2);stroke:var(--k-line)" stroke-width="1.2"/><circle cx="160" cy="142" r="6" style="fill:var(--k-plastic-2);stroke:var(--k-line)" stroke-width="1.2"/><ellipse cx="226" cy="142" rx="18" ry="6" style="fill:var(--k-line)" opacity="0.25"/><circle cx="290" cy="74" r="10" style="fill:var(--tb-surface);stroke:var(--k-line)" stroke-width="1.4"/><path class="k-thin" d="M364,107 L376,107" marker-start="url(#k-dot)"/><text class="tick" x="380" y="111">パーティングライン</text><path class="k-thin" d="M210,39 L210,24" marker-start="url(#k-dot)"/><text class="tick" x="216" y="22">ゲート跡</text><path class="k-thin" d="M300,74 L376,66" marker-start="url(#k-dot)"/><text class="tick" x="380" y="70">穴 → 下流にウェルド</text><path class="k-thin" d="M292,158 L376,172" marker-start="url(#k-dot)"/><text class="tick" x="380" y="176">ウェルドライン</text><path class="k-thin" d="M110,148 L100,192" marker-start="url(#k-dot)"/><text class="tick" x="60" y="204">エジェクタピン跡</text><path class="k-thin" d="M226,148 L226,192" marker-start="url(#k-dot)"/><text class="tick" x="196" y="204">ヒケ (リブの裏)</text>
</svg>
<p class="tb-caption">図: 成形品に現れる主な痕跡 (模式図)。外観面にはできるだけ出さない</p>
<table class="tb-table">
  <tr><th>痕跡</th><th>原因</th><th>見せない工夫</th></tr>
  <tr><td>パーティングライン (PL)</td><td>金型の分割面</td><td>稜線・段差・溝に沿わせる。底面寄りに置く</td></tr>
  <tr><td>ゲート跡</td><td>樹脂の注入口</td><td>内側・底面・後で隠れる位置。サブマリンゲートで内側に</td></tr>
  <tr><td>エジェクタピン跡</td><td>成形品を押し出すピン</td><td>裏面 (非外観面) のリブやボス付近に配置</td></tr>
  <tr><td>ウェルドライン</td><td>流れが合流した所の細い線</td><td>ゲート位置を工夫して目立たない所で合流させる。シボ・濃色で目立ちにくく</td></tr>
  <tr><td>ヒケ</td><td>厚肉部の収縮でへこむ</td><td>肉厚を均一に、リブ厚は一般肉厚の 50〜60 % 程度を目安に</td></tr>
</table>
<h2>抜き勾配と離型</h2>
<p>型から取り出す方向の面に勾配がないと、成形品が型の壁にこすれて傷 (かじり) が付きます。下のアニメーションで、勾配の有無を切り替えて比べてみましょう。</p>
<div data-widget="anim-draft"></div>
<h2>合わせ目 (見切り) の段差とすき間</h2>
<p>上ケースと下ケースの合わせ目は、部品の寸法ばらつきや反りで、どうしても<b>ずれ</b>が生じます。ぴったり面一 (つらいち) を狙うと、0.05 mm のずれでも段差が目立ちます。そこで<b>あえて段差を付けて</b>、ずれを影の中に隠します。</p>
<svg class="tb-chart" viewBox="0 0 520 212" role="img" aria-label="面一と意図的な段差の比較">
<rect class="k-panel" x="8" y="8" width="248" height="196" rx="8"/><rect class="k-panel" x="264" y="8" width="248" height="196" rx="8"/><circle class="k-badge" cx="28" cy="28" r="10" style="fill:var(--tb-bad)"/><text class="k-badge-t" x="28" y="32" text-anchor="middle">✕</text><text class="k-title" x="46" y="32">面一</text><circle class="k-badge" cx="284" cy="28" r="10" style="fill:var(--tb-good)"/><text class="k-badge-t" x="284" y="32" text-anchor="middle">✓</text><text class="k-title" x="302" y="32">意図的な段差</text><g class="k-shadow"><rect class="k-cut" x="60" y="44" width="90" height="62"/></g><rect class="k-cut2" x="60" y="108" width="90" height="62"><animateTransform attributeName="transform" type="translate" values="0,0;3,0;-3,0;0,0" dur="3s" repeatCount="indefinite"/></rect><line x1="150" y1="40" x2="150" y2="176" style="stroke:var(--tb-bad)" stroke-width="1" stroke-dasharray="3 3"/><text class="k-bad-t" x="132" y="192" text-anchor="middle">ずれると逆段差が目立つ</text><g class="k-shadow"><rect class="k-cut" x="300" y="44" width="90" height="62"/></g><rect class="k-cut2" x="300" y="108" width="84" height="62"><animateTransform attributeName="transform" type="translate" values="0,0;2,0;-2,0;0,0" dur="3s" repeatCount="indefinite"/></rect><line class="k-ext" x1="384" y1="172" x2="384" y2="182"/><line class="k-ext" x1="390" y1="108" x2="390" y2="182"/><line class="k-dimline" x1="370" y1="178" x2="384" y2="178" style="marker-start:none"/><line class="k-dimline" x1="404" y1="178" x2="390" y2="178" style="marker-start:none"/><text class="k-dimtext" x="410" y="150">段差</text><text class="k-dimtext" x="410" y="165">0.1〜0.3 mm</text><path class="k-thin" d="M392,107 L410,92" marker-start="url(#k-dot)"/><text class="mark-t" x="414" y="96">すき間</text><text class="k-good-t" x="388" y="196" text-anchor="middle">ずれても常に同じ向きの段差</text>
</svg>
<p class="tb-caption">図: 合わせ目の断面。ばらつき (左右の揺れ) があっても、意図した段差なら見た目が安定する</p>
<ul>
  <li>段差は<b>0.1〜0.3 mm 程度</b>が一つの目安。部品のばらつき (公差) より大きくすれば、ずれても段差の向きが逆転しない</li>
  <li>引っ込める側は、<b>小さく作っても違和感のない側</b> (下ケース・付属部品側) にするのが一般的</li>
  <li>すき間 (見切りのすき) も目安として 0.1〜0.3 mm 程度で、全周で<b>均一</b>に見えることが重要。不均一なすき間はずれ以上に目立つ</li>
  <li>V 溝や R 付きの見切りにすると、影ができて合わせ目が 1 本の「線」として見え、ずれが分からなくなる</li>
</ul>
<div class="tb-note">段差・すき間の具体値は、材料・部品の大きさ・成形メーカーの実力で変わります。ここでの値は<b>目安</b>であり、試作 (T0, T1) で実測して決めます。</div>
<h2>ヒケを防ぐ外観面</h2>
<svg class="tb-chart" viewBox="0 0 520 194" role="img" aria-label="リブとヒケ">
<rect class="k-panel" x="8" y="8" width="248" height="180" rx="8"/><rect class="k-panel" x="264" y="8" width="248" height="180" rx="8"/><circle class="k-badge" cx="28" cy="28" r="10" style="fill:var(--tb-bad)"/><text class="k-badge-t" x="28" y="32" text-anchor="middle">✕</text><text class="k-title" x="46" y="32">リブが厚い</text><circle class="k-badge" cx="284" cy="28" r="10" style="fill:var(--tb-good)"/><text class="k-badge-t" x="284" y="32" text-anchor="middle">✓</text><text class="k-title" x="302" y="32">リブを薄く</text><g class="k-shadow"><path class="k-cut" d="M30,62 L110,62 Q130,72 150,62 L230,62 L230,82 L150,82 L150,150 L110,150 L110,82 L30,82 Z"/></g><path d="M110,62 Q130,72 150,62" fill="none" style="stroke:var(--tb-bad)" stroke-width="2.6"/><circle cx="130" cy="84" r="16" fill="none" style="stroke:var(--tb-bad)" stroke-width="1.4" stroke-dasharray="4 3"/><text class="k-bad-t" x="178" y="54">ヒケ</text><path class="k-thin" d="M146,66 L174,52" marker-start="url(#k-dot)"/><text class="k-note" x="132" y="176" text-anchor="middle">(肉厚と同じ)</text><g class="k-shadow"><path class="k-cut" d="M290,62 L490,62 L490,82 L400,82 L398,150 L382,150 L380,82 L290,82 Z"/></g><text class="k-good-t" x="390" y="52" text-anchor="middle">外観面が平ら</text><text class="k-note" x="390" y="176" text-anchor="middle">肉厚の 50〜60 % 目安</text>
</svg>
<p class="tb-caption">図: リブ根元の肉だまりがヒケの原因。外観面の裏ほどリブ・ボスを薄く</p>
<ul>
  <li>一般肉厚をそろえ、厚肉部は肉抜きする</li>
  <li>外観面の裏にボスを立てるときは、ボスの周りを薄くする、または外観面から離して補強リブでつなぐ</li>
  <li>どうしても消えないヒケは、シボ・わずかに張った面 (クラウン)・濃色で目立ちにくくする</li>
</ul>
<h2>スナップフィットの見せ方</h2>
<p>ねじを使わずに組み立てるスナップフィットは、外観にねじ穴が出ない利点があります。フックがたわんで引っかかる様子と、そのときのひずみを次のアニメーションで確認しましょう。</p>
<div data-widget="anim-snapfit"></div>
<p>フックのひずみが材料の許容値を超えると白化・破損するため、たわみ量とフックの長さを調整します。外観面には、フックの穴や<b>無理抜きのための逃げ</b>が出ないよう、内側から組み付ける構造にするのが基本です。</p>
<div class="tb-tip"><b>3DCAD Studio</b>: 勾配とシェルでケースを作り、合わせ目の段差は断面図で確認しましょう。3D プリントチェックで薄すぎる肉厚を見つけ、試作で段差の見え方を確かめると効果的です。</div>`,
    points: [
      "PL・ゲート・エジェクタピン・ウェルド・ヒケは必ず生まれる。見えない所へ導く",
      "合わせ目は面一を狙わず、0.1〜0.3 mm 程度 (目安) の意図的な段差でばらつきを隠す",
      "すき間は大きさより均一さが重要。V 溝や R の見切りで線として見せる",
      "ヒケはリブ・ボスを薄くして防ぎ、残るものはシボや張りで目立たなくする",
    ],
    exercises: [
      {
        q: "上下ケースの外形寸法のばらつきがそれぞれ ±0.08 mm です。面一で設計すると、合わせ目の段差は最悪いくらになりますか。段差を常に同じ向きにするには、下ケースをどれだけ引っ込めればよいですか。",
        a: "片側あたりの段差の最悪値は 0.08 + 0.08 = <b>0.16 mm</b> (上が大きく下が小さい場合と、その逆の両方向)。段差の向きを逆転させないためには、下ケースを<b>0.16 mm より大きく</b>引っ込める必要があり、例えば <b>0.2 mm</b> とする。これは 0.1〜0.3 mm の目安とも合う (実際には反りや組立ずれも加味し、試作で確認する)。",
      },
    ],
    quiz: [
      { q: "ウェルドラインができる場所は?", choices: ["樹脂の流れが合流する所", "ゲートの真上", "エジェクタピンの位置"], answer: 0, explain: "穴の下流など、分かれた流れが合流する所に細い線が出ます。" },
      { q: "合わせ目に 0.1〜0.3 mm の段差を意図的に付ける主な理由は?", choices: ["強度を上げる", "部品のばらつきによるずれを目立たなくする", "材料を節約する"], answer: 1, explain: "ばらつきより大きな段差にすれば、段差の向きが常に一定で、ずれが目立ちません。" },
      { q: "外観面にヒケを出さないためのリブ厚の目安は?", choices: ["一般肉厚の 50〜60 % 程度", "一般肉厚の 2 倍", "一般肉厚と同じ"], answer: 0, explain: "リブ根元の肉だまりを減らすため、肉厚より薄くします。" },
    ],
    lessons: ["7-2", "8-1"],
  },
  {
    id: "cmf-planning",
    part: "design",
    title: "【上級】CMF 企画と色の量産管理",
    minutes: 25,
    level: 3,
    lead: "カラーバリエーションは「色を何色か並べる」ことではなく、誰に・どの売り場で・何色を何台売るかという企画です。バリエーションの組み方、限度見本、色差 ΔE、光源とメタメリズム、トレンドの読み方まで、量産で色を守る実務を学びます。",
    body: `
<h2>カラーバリエーションの組み方</h2>
<p>バリエーションは、売れ筋を支える<b>ベース色</b>と、話題をつくる<b>アクセント色</b>で構成するのが定石です。色数が増えるほど在庫と管理の負担が増えるので、役割を決めて絞ります。</p>
<svg class="tb-chart" viewBox="0 0 520 172" role="img" aria-label="カラーバリエーションの構成">
<defs><linearGradient id="dz-cv0" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b4048"/><stop offset="1" stop-color="#1c1f24"/></linearGradient><linearGradient id="dz-cv1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7f7f5"/><stop offset="1" stop-color="#d9dbde"/></linearGradient><linearGradient id="dz-cv2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a7adb6"/><stop offset="1" stop-color="#7d848e"/></linearGradient><linearGradient id="dz-cv3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a8af0"/><stop offset="1" stop-color="#2557b8"/></linearGradient><linearGradient id="dz-cv4" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb547"/><stop offset="1" stop-color="#e2861a"/></linearGradient></defs><ellipse cx="75" cy="132" rx="34" ry="3" style="fill:var(--tb-text)" opacity="0.13"/><g class="k-shadow"><rect x="40" y="40" width="70" height="90" rx="14" style="fill:url(#dz-cv0);stroke:var(--k-line)" stroke-width="1.2"/></g><circle cx="75" cy="92" r="20" fill="url(#k-dots)" style="stroke:#00000033" stroke-width="1"/><path d="M52,44 L98,44" fill="none" style="stroke:#ffffff" stroke-width="1.4" opacity="0.7"/><ellipse cx="160" cy="132" rx="34" ry="3" style="fill:var(--tb-text)" opacity="0.13"/><g class="k-shadow"><rect x="125" y="40" width="70" height="90" rx="14" style="fill:url(#dz-cv1);stroke:var(--k-line)" stroke-width="1.2"/></g><circle cx="160" cy="92" r="20" fill="url(#k-dots)" style="stroke:#00000033" stroke-width="1"/><path d="M137,44 L183,44" fill="none" style="stroke:#ffffff" stroke-width="1.4" opacity="0.7"/><ellipse cx="245" cy="132" rx="34" ry="3" style="fill:var(--tb-text)" opacity="0.13"/><g class="k-shadow"><rect x="210" y="40" width="70" height="90" rx="14" style="fill:url(#dz-cv2);stroke:var(--k-line)" stroke-width="1.2"/></g><circle cx="245" cy="92" r="20" fill="url(#k-dots)" style="stroke:#00000033" stroke-width="1"/><path d="M222,44 L268,44" fill="none" style="stroke:#ffffff" stroke-width="1.4" opacity="0.7"/><ellipse cx="365" cy="132" rx="34" ry="3" style="fill:var(--tb-text)" opacity="0.13"/><g class="k-shadow"><rect x="330" y="40" width="70" height="90" rx="14" style="fill:url(#dz-cv3);stroke:var(--k-line)" stroke-width="1.2"/></g><circle cx="365" cy="92" r="20" fill="url(#k-dots)" style="stroke:#00000033" stroke-width="1"/><path d="M342,44 L388,44" fill="none" style="stroke:#ffffff" stroke-width="1.4" opacity="0.7"/><ellipse cx="450" cy="132" rx="34" ry="3" style="fill:var(--tb-text)" opacity="0.13"/><g class="k-shadow"><rect x="415" y="40" width="70" height="90" rx="14" style="fill:url(#dz-cv4);stroke:var(--k-line)" stroke-width="1.2"/></g><circle cx="450" cy="92" r="20" fill="url(#k-dots)" style="stroke:#00000033" stroke-width="1"/><path d="M427,44 L473,44" fill="none" style="stroke:#ffffff" stroke-width="1.4" opacity="0.7"/><line class="guide" x1="305" y1="30" x2="305" y2="150"/><text class="lbl" x="160" y="160" text-anchor="middle">ベース (無彩色・定番) 売上の大半</text><text class="lbl" x="408" y="160" text-anchor="middle">アクセント (限定・季節)</text><text class="tick" x="160" y="25" text-anchor="middle">長く売る</text><text class="tick" x="408" y="25" text-anchor="middle">話題・入れ替え</text>
</svg>
<p class="tb-caption">図: ベース色とアクセント色の組み方 (例)。売上構成は製品分野によって大きく異なる</p>
<ul>
  <li><b>部品単位で色を分ける</b>: 外装 1 部品だけ色を変え、内部部品は共通にすると、コストを抑えて色数を増やせる</li>
  <li><b>素材・仕上げの軸</b>も使う: 同じ色でも、つやとマットで別の価値になる</li>
  <li><b>色名</b>は印象を左右する。「グレー」より「ストーン」「フォグ」のように世界観を伝える</li>
</ul>
<h2>限度見本 — 「ここまで良し」を物で決める</h2>
<p>色・つや・シボは数値だけでは管理しきれません。<b>標準見本</b> (狙いの色) と、許容できる範囲の端を示す<b>限度見本</b> (明るい側・暗い側・赤み・青み など) を実物で用意し、関係者が同じものを持ちます。</p>
<svg class="tb-chart" viewBox="0 0 520 182" role="img" aria-label="標準見本と限度見本">
<g class="k-shadow"><rect x="52" y="46" width="106" height="80" rx="6" style="fill:var(--tb-surface);stroke:var(--tb-border)" stroke-width="1"/></g><rect x="58" y="52" width="94" height="54" rx="4" fill="#7ea6ef"/><text class="k-note" x="105" y="119" text-anchor="middle">L* +</text><g class="k-shadow"><rect x="200" y="34" width="120" height="100" rx="6" style="fill:var(--tb-surface);stroke:var(--tb-border)" stroke-width="1"/></g><rect x="206" y="40" width="108" height="74" rx="4" fill="#3d6fd6"/><text class="k-note" x="260" y="127" text-anchor="middle">No. 0001</text><g class="k-shadow"><rect x="362" y="46" width="106" height="80" rx="6" style="fill:var(--tb-surface);stroke:var(--tb-border)" stroke-width="1"/></g><rect x="368" y="52" width="94" height="54" rx="4" fill="#2a4e9c"/><text class="k-note" x="415" y="119" text-anchor="middle">L* −</text><path d="M105,146 L105,154 L415,154 L415,146" fill="none" style="stroke:var(--tb-good)" stroke-width="1.6"/><text class="lbl" x="260" y="150" text-anchor="middle">標準見本</text><text class="lbl" x="105" y="142" text-anchor="middle">限度 (明)</text><text class="lbl" x="415" y="142" text-anchor="middle">限度 (暗)</text><text class="k-good-t" x="260" y="172" text-anchor="middle">この間に入れば合格</text>
</svg>
<p class="tb-caption">図: 標準見本と上下の限度見本。見本は退色するので保管条件と更新時期を決める</p>
<h2>色差 ΔE</h2>
<p>色を数値で比べるときは、L*a*b* 色空間 (L* = 明度、a* = 赤−緑、b* = 黄−青) で測色し、2 色の距離を<b>色差 ΔE</b> で表します。</p>
<div class="tb-math">\\Delta E^{*}_{ab} = \\sqrt{(\\Delta L^{*})^2 + (\\Delta a^{*})^2 + (\\Delta b^{*})^2}</div>
<table class="tb-table">
  <tr><th>ΔE*ab の目安</th><th>見え方 (並べて比べたとき)</th></tr>
  <tr><td>〜0.5 程度</td><td>ほとんど区別できない</td></tr>
  <tr><td>〜1 程度</td><td>注意深く並べると分かる</td></tr>
  <tr><td>〜2〜3 程度</td><td>並べると分かる。離して置くと同じ色に見えることが多い</td></tr>
  <tr><td>それ以上</td><td>はっきり違う色</td></tr>
</table>
<div class="tb-note">許容値は<b>目安</b>で、業界・部位・色によって変わります。隣り合う部品は厳しく、離れた部品は緩くするのが一般的です。より人の感覚に近い式として ΔE00 (CIEDE2000) も広く使われるので、契約ではどの式で何以下かを明記します。</div>
<h2>光源とメタメリズム</h2>
<p>色の見え方は照明で変わります。測色や目視比較の基準光源として、昼光の <b>D65</b> (約 6500 K)、白熱電球の <b>A 光源</b> (約 2856 K) などが使われます。</p>
<svg class="tb-chart" viewBox="0 0 520 232" role="img" aria-label="メタメリズム">
<defs><linearGradient id="dz-spec" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5b3df5"/><stop offset="0.2" stop-color="#2f80ed"/><stop offset="0.4" stop-color="#27ae60"/><stop offset="0.6" stop-color="#f2c94c"/><stop offset="0.8" stop-color="#f2994a"/><stop offset="1" stop-color="#eb5757"/></linearGradient></defs><rect class="k-panel" x="8" y="8" width="248" height="104" rx="8"/><rect class="k-panel" x="264" y="8" width="248" height="104" rx="8"/><circle cx="28" cy="26" r="7" fill="#fff6d8" style="stroke:var(--k-line-2)"/><text class="k-title" x="42" y="30">D65 (昼光) の下</text><circle cx="284" cy="26" r="7" fill="#ffb547" style="stroke:var(--k-line-2)"/><text class="k-title" x="298" y="30">A 光源 (白熱灯) の下</text><g class="k-shadow"><rect x="36" y="42" width="88" height="44" rx="6" fill="#5aa36a"/></g><path d="M44,46 L116,46" fill="none" style="stroke:#ffffff" stroke-width="1.2" opacity="0.5"/><g class="k-shadow"><rect x="140" y="42" width="88" height="44" rx="6" fill="#5aa36a"/></g><path d="M148,46 L220,46" fill="none" style="stroke:#ffffff" stroke-width="1.2" opacity="0.5"/><g class="k-shadow"><rect x="292" y="42" width="88" height="44" rx="6" fill="#6f9a4a"/></g><path d="M300,46 L372,46" fill="none" style="stroke:#ffffff" stroke-width="1.2" opacity="0.5"/><g class="k-shadow"><rect x="396" y="42" width="88" height="44" rx="6" fill="#9a8f3f"/></g><path d="M404,46 L476,46" fill="none" style="stroke:#ffffff" stroke-width="1.2" opacity="0.5"/><text class="k-good-t" x="132" y="104" text-anchor="middle">同じ色に見える</text><text class="k-bad-t" x="388" y="104" text-anchor="middle">違って見える</text><text class="sec" x="20" y="134">分光反射率 (模式)</text><line class="axis" x1="40" y1="200" x2="500" y2="200"/><rect x="40" y="203" width="460" height="6" fill="url(#dz-spec)" rx="2"/><path d="M40,185 C120,180 180,140 260,140 C340,140 400,175 500,180" fill="none" style="stroke:var(--tb-text)" stroke-width="2"/><path d="M40,190 C100,165 180,155 230,140 C300,125 360,180 420,170 C460,163 480,150 500,155" fill="none" style="stroke:var(--tb-accent)" stroke-width="2"/><text class="tick" x="45" y="224">短波長 (青)</text><text class="tick" x="500" y="224" text-anchor="end">長波長 (赤)</text>
</svg>
<p class="tb-caption">図: メタメリズム (条件等色)。分光反射率の形が違う 2 つの色は、ある光源では一致しても別の光源ではずれる</p>
<ul>
  <li>樹脂部品と塗装部品など<b>材料や顔料が違う</b>部品を同色に見せると、メタメリズムが起きやすい</li>
  <li>色合わせは<b>複数の光源</b> (例: D65 と A、店舗照明に近い光源) で確認し、どの光源を基準にするかを取り決める</li>
  <li>目視比較は、規格に沿った色評価用のブース (標準光源装置) で、同じ角度・背景で行う</li>
</ul>
<h2>トレンドの読み方</h2>
<ul>
  <li>色のトレンドは、ファッション・インテリア・自動車などの動きが数年かけて家電・雑貨に広がることが多い</li>
  <li>色見本会社やトレンド予測機関の発表、展示会 (家具・素材) を<b>参考</b>にしつつ、自社の顧客と売り場で検証する</li>
  <li>製品寿命が長い物ほど、トレンド色は<b>交換できる部品・限定色</b>にとどめ、本体は定番色にするのが無難</li>
</ul>
<div class="tb-tip"><b>3DCAD Studio</b>: 材料と色で部品ごとの色を切り替え、リアル表示と高解像度画像でバリエーションを並べて比較できます。ただし画面の色は照明・モニタで変わるため、最終判断は実物見本で行いましょう。</div>`,
    points: [
      "バリエーションはベース色 + アクセント色で役割を決め、部品単位で色を分ける",
      "標準見本と限度見本を実物で共有し、保管と更新を管理する",
      "色差 ΔE は L*a*b* の距離。許容値は部位で変え、式 (ΔE*ab / ΔE00) を明記する",
      "メタメリズムに備え、D65・A など複数光源で色合わせを確認する",
    ],
    exercises: [
      {
        q: "標準見本 L* = 50.0, a* = 2.0, b* = −3.0、量産品 L* = 51.2, a* = 1.5, b* = −2.0 のとき、ΔE*ab を求め、許容値 ΔE ≤ 1.5 に対して合否を判定してください。",
        a: "ΔL* = 1.2, Δa* = −0.5, Δb* = 1.0。ΔE*ab = √(1.44 + 0.25 + 1.00) = √2.69 ≈ <b>1.64</b>。許容値 1.5 を超えるので<b>不合格</b>。明度 (ΔL* = +1.2、明るい側) のずれが最も大きいので、まず明るさを合わせる調色を依頼する。",
      },
    ],
    quiz: [
      { q: "昼光を代表する標準光源は?", choices: ["A 光源", "D65", "F2"], answer: 1, explain: "D65 は相関色温度約 6500 K の昼光を代表する標準イルミナントです。" },
      { q: "ある光源では同じ色、別の光源では違う色に見える現象は?", choices: ["メタメリズム (条件等色)", "色順応", "ハレーション"], answer: 0, explain: "分光反射率が異なる色どうしで起こります。" },
      { q: "L*a*b* で L* が表すのは?", choices: ["赤−緑", "明度", "黄−青"], answer: 1, explain: "L* は明度、a* は赤−緑、b* は黄−青の軸です。" },
    ],
    lessons: ["8-2"],
  },
  {
    id: "design-for-emotion",
    part: "design",
    title: "【上級】愛着とストーリー — 長く使われるデザイン",
    minutes: 20,
    level: 3,
    lead: "人が物に愛着を持つのは、見た目だけでなく、触れたときの感触、操作音、重さ、使い込んで変わっていく様子、そして背景にある物語があるからです。感性品質と経年変化を設計し、長く使われる製品をつくる考え方を学びます。",
    body: `
<h2>経年変化 — 劣化か、味わいか</h2>
<p>時間とともに物は必ず変化します。その変化が「汚れ・劣化」に見えるか「味わい (エイジング)」に見えるかは、素材と仕上げの選び方で決まります。</p>
<svg class="tb-chart" viewBox="0 0 520 190" role="img" aria-label="経年変化と魅力">
<line class="grid" x1="50" y1="90" x2="500" y2="90"/><path d="M55,70 C150,70 250,55 495,35 L495,140 C250,110 150,60 55,50 Z" style="fill:var(--tb-good)" opacity="0.08"/><line class="axis" x1="50" y1="160" x2="500" y2="160"/><line class="axis" x1="50" y1="160" x2="50" y2="20"/><text class="lbl" x="56" y="30">魅力</text><text class="lbl" x="495" y="180" text-anchor="end">使用年数 →</text><path d="M55,50 C150,60 250,110 495,140" fill="none" style="stroke:var(--tb-bad)" stroke-width="2.6"/><path d="M55,70 C150,70 250,55 495,35" fill="none" style="stroke:var(--tb-good)" stroke-width="2.6"/><text class="mark-t" x="300" y="150">塗装の剥げ・樹脂の黄変</text><text class="mark-t" x="330" y="26">革・真鍮・無垢材</text><circle r="6" style="fill:var(--tb-accent)" class="k-glow"><animateMotion dur="6s" repeatCount="indefinite" path="M55,70 C150,70 250,55 495,35"/></circle>
</svg>
<p class="tb-caption">図: 経年変化の 2 つの方向 (概念図)。新品が最も美しい物と、使うほど良くなる物</p>
<ul>
  <li><b>味わいになる素材</b>: 革 (つやが出る)、真鍮 (色が深まる)、無垢材 (色が濃くなる)、デニム (色落ち)</li>
  <li><b>劣化に見えやすい</b>: 薄い塗装の剥げ、印刷文字の摩耗、白い樹脂の黄変、光沢面の細かい傷</li>
  <li>対策: 素地と同色にする (剥げても目立たない)、文字は刻印・インモールドに、よく触れる所はシボやブラストに</li>
</ul>
<h2>感性品質 — 触感・音・重さ</h2>
<table class="tb-table">
  <tr><th>感覚</th><th>設計の要素</th><th>例</th></tr>
  <tr><td>触感</td><td>表面の粗さ、温度感 (熱伝導率)、R の大きさ、すき間・段差の少なさ</td><td>金属は冷たく硬質、木・布は温かい</td></tr>
  <tr><td>音</td><td>スイッチのクリック音、蓋が閉まる音、ファンの音質</td><td>自動車のドアの「閉まる音」は高級感の評価対象</td></tr>
  <tr><td>重さ</td><td>質量と重心の位置</td><td>適度な重さは安定感・信頼感。手持ち品は軽さが優先</td></tr>
  <tr><td>操作感</td><td>荷重とストロークの関係 (クリック感)、ダイヤルの節度</td><td>押し始めに抵抗が増え、ある点で急に抜けると「押した」感じが明確</td></tr>
</table>
<svg class="tb-chart" viewBox="0 0 520 190" role="img" aria-label="スイッチの荷重とストローク">
<line class="grid" x1="60" y1="60" x2="480" y2="60"/><line class="grid" x1="60" y1="110" x2="480" y2="110"/><path d="M60,160 L200,60 L260,120 L330,110 L400,30 L400,160 Z" style="fill:var(--tb-accent)" opacity="0.1"/><line class="axis" x1="60" y1="160" x2="480" y2="160"/><line class="axis" x1="60" y1="160" x2="60" y2="20"/><text class="lbl" x="66" y="30">荷重</text><text class="lbl" x="475" y="180" text-anchor="end">ストローク →</text><path d="M60,160 L200,60 L260,120 L330,110 L400,30" fill="none" style="stroke:var(--tb-accent)" stroke-width="2.6"/><line class="guide" x1="200" y1="60" x2="200" y2="160"/><line class="guide" x1="260" y1="120" x2="260" y2="160"/><circle cx="200" cy="60" r="4.5" style="fill:var(--tb-surface);stroke:var(--tb-text)" stroke-width="2"/><circle cx="260" cy="120" r="4.5" style="fill:var(--tb-surface);stroke:var(--tb-text)" stroke-width="2"/><line class="k-ext" x1="204" y1="60" x2="290" y2="60"/><line class="k-dimline" x1="284" y1="60" x2="284" y2="120"/><text class="mark-t" x="150" y="52" text-anchor="middle">ピーク荷重</text><text class="k-dimtext" x="290" y="92">落差</text><text class="mark-t" x="265" y="142">急に抜ける → クリック感</text><g class="k-shadow"><rect class="k-part" x="420" y="120" width="50" height="18" rx="2"/><rect class="k-plastic" x="432" y="104" width="26" height="16" rx="3"/></g><path class="k-force" d="M445,74 L445,100" stroke-width="2"/>
</svg>
<p class="tb-caption">図: タクトスイッチの荷重−ストローク特性 (模式図)。ピークから落ちる量が「クリック感」をつくる</p>
<div class="tb-note">感性品質は、言葉 (「しっとり」「カチッと」) と物理量 (荷重、音圧、周波数、表面粗さ) を<b>対応づけて</b>評価すると、設計目標にできます。複数の人に試作を比べてもらう官能評価で、好まれる範囲を探ります。</div>
<h2>ブランド体験 — 物を超えた接点</h2>
<ul>
  <li><b>開封体験</b>: 箱を開ける順序、最初に目に入る物、付属品の収まり</li>
  <li><b>使い始め</b>: 初回の設定が迷わず終わるか。最初の成功体験</li>
  <li><b>修理・サポート</b>: 部品が買える、直せる、相談できる — 長く付き合える安心感</li>
  <li><b>物語</b>: 産地・素材・作り手・開発の背景。ただし事実に基づくこと (誇張は信頼を失う)</li>
</ul>
<h2>長く使われるデザイン</h2>
<svg class="tb-chart" viewBox="0 0 520 170" role="img" aria-label="長寿命化の要素">
<circle cx="260" cy="85" r="40" class="k-accent k-shadow"/><text class="k-title" x="260" y="90" text-anchor="middle" style="fill:#ffffff">長く使う</text><g class="k-shadow"><rect class="k-panel" x="16" y="18" width="130" height="40" rx="8"/></g><text class="lbl" x="81" y="43" text-anchor="middle">飽きない形</text><g class="k-shadow"><rect class="k-panel" x="16" y="112" width="130" height="40" rx="8"/></g><text class="lbl" x="81" y="137" text-anchor="middle">直せる構造</text><g class="k-shadow"><rect class="k-panel" x="374" y="18" width="130" height="40" rx="8"/></g><text class="lbl" x="439" y="43" text-anchor="middle">美しく古びる素材</text><g class="k-shadow"><rect class="k-panel" x="374" y="112" width="130" height="40" rx="8"/></g><text class="lbl" x="439" y="137" text-anchor="middle">愛着 (物語・体験)</text><g style="stroke:var(--k-line-2)" stroke-width="1.4" fill="none"><path d="M224,70 L146,40"/><path d="M224,100 L146,130"/><path d="M296,70 L374,40"/><path d="M296,100 L374,130"/></g>
</svg>
<p class="tb-caption">図: 長く使われる製品を支える 4 つの要素</p>
<ul>
  <li><b>飽きない形</b>: 流行の装飾に頼らず、比率と面の質で勝負する</li>
  <li><b>直せる構造</b>: ねじで開けられる、消耗部品 (電池・ベルト・カバー) を交換できる</li>
  <li><b>美しく古びる素材</b>: 傷が味になる仕上げ、色あせしにくい顔料</li>
  <li><b>愛着</b>: 名前を刻める、カスタマイズできる、使い方の記憶が残る</li>
</ul>
<p>長く使われることは、資源の消費を減らすことにもつながります (サステナブルデザインの章も参照)。</p>
<div class="tb-tip"><b>3DCAD Studio</b>: 文字機能で名前やシリアルを刻印・エンボスしたモデルを作り、リアル表示で質感を確認してみましょう。材料と色で真鍮や木を選び、経年変化後の色をイメージした別バリエーションと並べるのも有効です。</div>`,
    points: [
      "変化が劣化に見えるか味わいに見えるかは素材と仕上げで決まる",
      "触感・音・重さ・操作感は物理量と対応づけて設計目標にする",
      "開封・使い始め・修理まで含めた体験がブランドへの信頼をつくる",
      "飽きない形・直せる構造・美しく古びる素材・愛着が長寿命を支える",
    ],
    exercises: [
      {
        q: "毎日持ち歩く金属製のペンケースを「10 年使える」コンセプトで企画します。仕上げと構造の工夫を 3 つ挙げてください。",
        a: "① 表面を<b>ブラストやヘアライン</b>にして小傷を目立ちにくくする、または真鍮など<b>経年で色が深まる素材</b>を選ぶ。② ロゴや名前は印刷ではなく<b>刻印</b>にし、摩耗で消えないようにする。③ 開閉のヒンジや内張りを<b>ねじ止めで交換可能</b>にし、消耗部品を販売する。角は大きめの R にして、落としたときの打痕も目立ちにくくする。",
      },
    ],
    quiz: [
      { q: "使うほど味わいが増す素材の例として適切なのは?", choices: ["薄い塗装の白い樹脂", "革や真鍮", "印刷フィルム"], answer: 1, explain: "革はつやが出て、真鍮は色が深まり、経年変化が魅力になります。" },
      { q: "タクトスイッチの「クリック感」を主に生むのは?", choices: ["ピーク荷重の後に荷重が急に下がること", "ストロークが長いこと", "表面のシボ"], answer: 0, explain: "荷重−ストローク特性で、ピーク後に荷重が落ちる量が感触を決めます。" },
      { q: "長く使われるための構造上の工夫は?", choices: ["接着で完全に一体化する", "消耗部品を交換できるようにする", "流行色を全面に使う"], answer: 1, explain: "直せる・交換できる構造は製品寿命を延ばします。" },
    ],
    lessons: ["1-1", "8-2"],
  },
];
