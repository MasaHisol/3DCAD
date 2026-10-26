import type { TextChapter } from "../types";

// Part 12 (equipment): mechanical / hardware design detail of semiconductor
// manufacturing equipment and analytical instruments — what the mechanical
// designer actually draws. Process topics live in semi.ts, metrology loops in
// instrument.ts, fixtures in fixtures.ts.

export const SEMI_HW: TextChapter[] = [
  // ------------------------------------------------------------------ 1
  {
    id: "chamber-mechanical",
    part: "equipment",
    title: "真空チャンバの機械設計 — 構造・溶接・シール面・加工",
    minutes: 22,
    level: 3,
    lead: "真空チャンバは「大気圧に耐える圧力容器」であり、同時に「ガスを溜め込まない入れ物」でもあります。この章では、ブロックからの削り出しと溶接構造の選び方、1 気圧に対する板厚の確認、仮想リークを生まない溶接とねじ穴、シール面と O リング溝の寸法、ポート配置と吊り点まで、機械設計者が図面に描く内容を順に見ていきます。",
    body: `
<h2>構造の選択 — 削り出しか、溶接か</h2>
<p>チャンバ本体の作り方は大きく 2 つです。<b>ブロック削り出し</b> (アルミ合金やステンレスの塊から 5 軸加工) は、溶接ひずみがなく、内面が滑らかで、ポートの位置精度も出しやすい反面、材料と加工時間のコストが大きくなります。<b>溶接構造</b> (板・パイプ・フランジを溶接) は大型化しやすく材料も少なくて済みますが、溶接ひずみの矯正と、溶接後の仕上げ加工 (シール面・基準面) が必要です。</p>
<table class="tb-table">
<tr><th>項目</th><th>ブロック削り出し</th><th>溶接構造</th></tr>
<tr><td>向く大きさ</td><td>中小型 (搬送室・プロセス室)</td><td>大型・複雑な形状</td></tr>
<tr><td>寸法精度</td><td>高い (一体加工)</td><td>溶接後に基準面・シール面を仕上げ加工</td></tr>
<tr><td>リークの可能性</td><td>材料内部の欠陥 (鋳巣・介在物) に注意</td><td>溶接部の欠陥・仮想リークに注意</td></tr>
<tr><td>コスト</td><td>材料・加工時間が大きい</td><td>溶接・矯正・検査の工数</td></tr>
</table>
<p>削り出しでも、圧延板や鍛造材の<b>板厚方向 (鍛流線の方向)</b> に薄い壁を作ると、介在物がつながってリーク経路になることがあります。材料メーカー・加工先と材料形態を確認します。</p>

<svg class="tb-chart" viewBox="0 0 520 300" role="img" aria-label="溶接構造の真空チャンバ断面。蓋、O リング、壁、ポート、底板">
<text class="k-title" x="260" y="20" text-anchor="middle">溶接チャンバの断面 (概略)</text>
<rect class="k-ground" x="40" y="262" width="440" height="10"/><line class="k-edge" x1="40" y1="262" x2="480" y2="262"/>
<!-- legs -->
<rect class="k-part" x="90" y="232" width="24" height="30"/>
<rect class="k-part" x="406" y="232" width="24" height="30"/>
<!-- bottom plate -->
<rect class="k-cut" x="80" y="214" width="360" height="18"/>
<!-- walls -->
<rect class="k-cut" x="80" y="80" width="18" height="134"/>
<rect class="k-cut" x="422" y="80" width="18" height="134"/>
<!-- top flange ring -->
<rect class="k-cut" x="70" y="68" width="40" height="14"/>
<rect class="k-cut" x="410" y="68" width="40" height="14"/>
<!-- lid -->
<rect class="k-cut2" x="66" y="44" width="388" height="22"/>
<!-- o-ring -->
<circle class="k-rubber" cx="92" cy="68" r="4"/>
<circle class="k-rubber" cx="428" cy="68" r="4"/>
<!-- side port tube -->
<rect class="k-cut" x="440" y="130" width="40" height="8"/>
<rect class="k-cut" x="440" y="166" width="40" height="8"/>
<rect class="k-cut" x="480" y="120" width="12" height="64"/>
<!-- inside volume -->
<rect x="98" y="82" width="324" height="132" style="fill:var(--tb-accent)" opacity="0.06"/>
<!-- stage -->
<rect class="k-alu" x="200" y="170" width="120" height="16" rx="2"/>
<rect class="k-part-h" x="252" y="186" width="16" height="28"/>
<!-- callouts -->
<line class="k-thin" x1="380" y1="44" x2="396" y2="34"/><text class="lbl" x="400" y="36">蓋 (天板)</text>
<line class="k-thin" x1="428" y1="68" x2="470" y2="56"/><text class="lbl" x="474" y="52" text-anchor="start">O</text>
<text class="tick" x="474" y="64">リング</text>
<line class="k-thin" x1="89" y1="140" x2="40" y2="130"/><text class="lbl" x="38" y="124" text-anchor="end">側壁</text>
<line class="k-thin" x1="486" y1="184" x2="486" y2="205"/><text class="lbl" x="486" y="218" text-anchor="middle">ポート</text>
<line class="k-thin" x1="200" y1="225" x2="160" y2="250"/><text class="lbl" x="156" y="254" text-anchor="end">底板</text>
<text class="tick" x="260" y="120" text-anchor="middle">真空 (内側)</text>
<text class="tick" x="260" y="136" text-anchor="middle">外側は 1 気圧が全面に作用</text>
<!-- dims -->
<line class="k-ext" x1="98" y1="214" x2="98" y2="290"/><line class="k-ext" x1="422" y1="214" x2="422" y2="290"/>
<line class="k-dimline" x1="98" y1="284" x2="422" y2="284"/>
<text class="k-dimtext" x="260" y="280" text-anchor="middle">内寸 (板の支持スパン)</text>
</svg>
<p class="tb-caption">図: 蓋・壁・底板はどれも「外から 1 気圧で押される板」。O リングは蓋とフランジ面の間で潰されて気密を保つ</p>

<h2>1 気圧に対する板厚の確認</h2>
<p>大気圧 p ≈ 0.101 MPa は小さく見えますが、Ø400 mm の蓋なら全荷重は p × π × 200² ≈ <b>12.7 kN</b> (約 1.3 トン重) です。板は平板公式でたわみと応力を確認します (r: 半径、t: 板厚、E: 縦弾性係数、ν: ポアソン比、D = E t³ / 12(1 − ν²))。</p>
<table class="tb-table">
<tr><th>支持条件 (円板・等分布圧力)</th><th>最大応力</th><th>最大たわみ (中央)</th></tr>
<tr><td>周辺単純支持 (O リングで載っているだけの蓋)</td><td>σ = 3(3 + ν) p r² / 8t² (中央)</td><td>w = (5 + ν) p r⁴ / 64 D (1 + ν)</td></tr>
<tr><td>周辺固定 (全周溶接・厚いフランジに一体)</td><td>σ = 3 p r² / 4t² (周辺)</td><td>w = p r⁴ / 64 D</td></tr>
</table>
<p>長方形の板は辺の比 a/b で係数が変わり、σ = β p b² / t²、w = α p b⁴ / E t³ (b は短辺) の形になります。β・α は材料力学の便覧の表から読みます (例: a/b = 2 で周辺固定 β ≈ 0.497、α ≈ 0.0277、周辺単純支持 β ≈ 0.610、α ≈ 0.111、ν = 0.3)。</p>

<h3>計算例 — Ø400 mm のステンレス蓋</h3>
<div class="tb-example">
<p>条件: 支持径 Ø400 mm (r = 200 mm)、SUS304 (E = 193 GPa、ν = 0.3)、p = 0.101 MPa、O リング面に載る蓋なので<b>周辺単純支持</b>で評価。</p>
<table class="tb-table">
<tr><th>板厚 t</th><th>最大応力 σ</th><th>中央たわみ w</th><th>(参考) 周辺固定のたわみ</th></tr>
<tr><td>16 mm</td><td>19.6 MPa</td><td>0.143 mm</td><td>0.035 mm</td></tr>
<tr><td>20 mm</td><td>12.5 MPa</td><td>0.073 mm</td><td>0.018 mm</td></tr>
<tr><td>25 mm</td><td>8.0 MPa</td><td>0.037 mm</td><td>0.009 mm</td></tr>
</table>
<p>応力は SUS304 の耐力 (規格最小値 205 MPa) に対して十分に低く、<b>強度ではなくたわみで板厚が決まる</b>のが真空チャンバの典型です。蓋に覗き窓・センサ・電極が付く場合や、蓋の上に部品を載せて位置を合わせる場合は、たわみ 0.1 mm でも問題になります。t = 20 mm でたわみ 0.07 mm を目標に置き、O リングのつぶし量の余裕 (後述) に比べて十分小さいことを確認します。</p>
<p>長方形の側壁 600 × 300 mm・周辺固定・t = 12 mm なら、σ = 0.497 × 0.101 × 300² / 12² ≈ 31.5 MPa、w = 0.0277 × 0.101 × 300⁴ / (193000 × 12³) ≈ 0.068 mm です。</p>
</div>
<p>公式は「平らな一様板・小たわみ」の仮定です。ポート穴・リブ・溶接の境界があれば FEM で確認し、さらに<b>圧力容器としての法規・社内基準</b> (加圧ベントや冷却水の圧力がかかる場合) を確認します。また、薄肉の円筒・球殻には外圧による<b>座屈</b>という別の破壊形態があり、応力が小さくても潰れることがあるので、専用の座屈評価を行います。</p>

<h2>溶接 — 内側溶接と仮想リーク</h2>
<p>真空の溶接は<b>真空側 (内側) を溶接する</b>のが原則です。外側だけを溶接すると、内側に母材同士が接しているだけの細いすき間が残り、そこに溜まった空気や洗浄液が少しずつ漏れ出し続けます。これが<b>仮想リーク</b> (外部とはつながっていないのに、リークのように圧力が下がりきらない現象) です。両側から溶接して閉じた空間を作るのも同じ理由で不可です。</p>
<svg class="tb-chart" viewBox="0 0 520 240" role="img" aria-label="溶接継手の良い例と悪い例。外側溶接はすき間に気体が閉じ込められる">
<text class="k-title" x="260" y="20" text-anchor="middle">真空容器の溶接継手</text>
<rect class="k-panel" x="12" y="32" width="240" height="196" rx="8"/>
<rect class="k-panel" x="268" y="32" width="240" height="196" rx="8"/>
<text class="k-bad-t" x="132" y="52" text-anchor="middle">悪い例: 外側だけ溶接</text>
<text class="k-good-t" x="388" y="52" text-anchor="middle">良い例: 内側溶接 (完全溶込み)</text>
<!-- bad: plate L joint -->
<rect class="k-cut" x="40" y="150" width="190" height="16"/>
<rect class="k-cut" x="40" y="66" width="16" height="84"/>
<path class="k-accent" d="M30 150 L40 150 L40 140 Z"/>
<line x1="56" y1="150" x2="230" y2="150" stroke="var(--tb-bad)" stroke-width="2"/>
<text class="tick" x="140" y="100" text-anchor="middle">真空側</text>
<text class="tick" x="64" y="190">大気側</text>
<line class="k-thin" x1="120" y1="151" x2="150" y2="200"/>
<text class="k-bad-t" x="150" y="212" text-anchor="middle">閉じたすき間 → 仮想リーク</text>
<line class="k-thin" x1="35" y1="146" x2="24" y2="120"/><text class="tick" x="22" y="114">溶接</text>
<!-- good -->
<rect class="k-cut" x="296" y="150" width="190" height="16"/>
<rect class="k-cut" x="296" y="66" width="16" height="84"/>
<path class="k-accent" d="M312 150 L324 150 L312 138 Z"/>
<text class="tick" x="400" y="100" text-anchor="middle">真空側</text>
<text class="tick" x="320" y="190">大気側</text>
<line class="k-thin" x1="316" y1="146" x2="350" y2="124"/><text class="tick" x="354" y="124">内側の溶接ビード</text>
<text class="k-good-t" x="388" y="212" text-anchor="middle">すき間は大気側に開放</text>
</svg>
<p class="tb-caption">図: 仮想リークは「真空側から見て出口の細い閉空間」。すき間は大気側に開くか、なくす</p>
<p>外側に補強の溶接が必要な場合は<b>断続溶接</b>にして、すき間を大気に通じさせます。溶接は TIG で、内面のビードは酸化 (焼け) を抑えるためにバックシールドガスを使います。溶接後は<b>ヘリウムリーク試験</b>で確認します。</p>

<h2>ねじ穴とガス抜き穴</h2>
<p>真空側の<b>止まり穴にボルトを締めると、穴の底に空気が閉じ込められます</b>。これも仮想リークの代表です。対策は次のどれかです。</p>
<ul>
<li>ボルト軸に<b>ガス抜き穴</b> (中心に貫通穴) があるベント付きボルト、またはねじ部にスリット (溝) のあるボルトを使う</li>
<li>止まり穴の底から横穴を開けて逃がす / 貫通穴にする</li>
<li>座面の下にもすき間が残らないよう、座金の重ね使いを避ける</li>
</ul>
<p>同じ理由で、真空中の部品どうしの<b>面と面の重ね合わせ</b> (広い面積の密着) もガスを溜めます。合わせ面に逃げ溝を彫るか、接触を小さな座で受けます。</p>

<h2>シール面と O リング溝</h2>
<p>O リング (エラストマ) のシールでは、O リングを溝の深さで潰し、その反発力で面に押し付けて気密を作ります。主な寸法は次の 2 つです。</p>
<ul>
<li><b>つぶし率</b> = (線径 d − 溝深さ h) / d。静的シールの目安は 15〜30% 程度</li>
<li><b>溝充填率</b> = O リング断面積 / 溝断面積。熱膨張と膨潤の逃げのため、目安は 85% 程度以下</li>
</ul>
<svg class="tb-chart" viewBox="0 0 520 250" role="img" aria-label="O リング溝の断面。角溝とあり溝">
<text class="k-title" x="260" y="20" text-anchor="middle">O リング溝の断面</text>
<!-- rectangular groove -->
<text class="lbl" x="130" y="44" text-anchor="middle">角溝 (フランジ面)</text>
<path class="k-cut" d="M30 120 L100 120 L100 160 L160 160 L160 120 L230 120 L230 200 L30 200 Z"/>
<rect class="k-cut2" x="30" y="84" width="200" height="36"/>
<ellipse class="k-rubber" cx="130" cy="140" rx="24" ry="20"/>
<line class="k-ext" x1="232" y1="120" x2="250" y2="120"/><line class="k-ext" x1="162" y1="160" x2="250" y2="160"/>
<line class="k-dimline" x1="246" y1="120" x2="246" y2="160"/>
<text class="k-dimtext" x="252" y="144">h</text>
<line class="k-ext" x1="100" y1="160" x2="100" y2="226"/><line class="k-ext" x1="160" y1="160" x2="160" y2="226"/>
<line class="k-dimline" x1="100" y1="220" x2="160" y2="220"/>
<text class="k-dimtext" x="130" y="216" text-anchor="middle">溝幅 w</text>
<text class="tick" x="130" y="100" text-anchor="middle">相手面 (蓋)</text>
<!-- dovetail -->
<text class="lbl" x="400" y="44" text-anchor="middle">あり溝 (蓋側・脱落防止)</text>
<path class="k-cut" d="M290 70 L376 70 L370 110 L430 110 L424 70 L510 70 L510 130 L290 130 Z"/>
<ellipse class="k-rubber" cx="400" cy="128" rx="20" ry="22"/>
<rect class="k-cut2" x="290" y="148" width="220" height="30"/>
<text class="tick" x="400" y="198" text-anchor="middle">相手面 (本体フランジ)</text>
<text class="tick" x="400" y="226" text-anchor="middle">上下逆さでも O リングが落ちない</text>
<text class="tick" x="296" y="143">開口幅 &lt; 線径</text>
</svg>
<p class="tb-caption">図: 角溝は最も一般的。開閉する蓋側に O リングを付けるときは、あり溝で脱落を防ぐ (溝の加工は専用工具が要る)</p>
<div class="tb-example">
<p><b>計算例:</b> 線径 d = 4.0 mm、溝深さ h = 3.0 mm、溝幅 w = 5.2 mm。<br>
つぶし率 = (4.0 − 3.0) / 4.0 = <b>25%</b>、溝充填率 = (π/4 × 4.0²) / (3.0 × 5.2) = 12.57 / 15.6 = <b>80.6%</b>。どちらも目安の範囲です。蓋のたわみ 0.07 mm はつぶし量 1.0 mm の 7% 程度で、気密への影響は小さいと判断できます。</p>
<p>実際の寸法は O リングメーカーの溝寸法表と材料 (FKM・FFKM など) の推奨値で確認してください。</p>
</div>
<p><b>シール面の仕上げ</b>は、エラストマシールで Ra 0.8 µm 程度以下・<b>同心円状の加工目</b> (旋削目) が目安です。<b>半径方向の傷</b> (シール面を横切る傷) は 1 本でもリーク経路になるので、図面に「シール面に半径方向の傷のないこと」と書き、梱包でも保護します。金属ガスケット (ナイフエッジ) のフランジはさらに厳しい管理が必要で、規格品の寸法に従います。平面度は「O リングのつぶし量に対して十分小さい」ことを基準に決めます (目安として 0.05 mm 程度から検討し、メーカー推奨を確認)。</p>

<h2>ポート配置・吊り点</h2>
<ul>
<li><b>ポート</b>: 排気口は大きく短く (コンダクタンス)、ゲージは排気口の真正面を避ける、覗き窓は作業者の目線に合わせる。将来の追加用に盲フランジのポートを残すと改造が楽になる</li>
<li><b>ポートの向きと工具</b>: フランジボルトにレンチが入るか、隣のポートと干渉しないかを 3D で確認</li>
<li><b>吊り点</b>: アイボルト用のねじ穴は大気側に設け、重心を囲む位置に配置。吊り角度で荷重が増える点と、アイボルトの定格を確認</li>
<li><b>基準面</b>: 溶接チャンバは、内部機構を取り付ける基準面と、架台への取付面を溶接後に仕上げ加工する</li>
</ul>

<h3>よくある失敗</h3>
<ul>
<li>強度だけで板厚を決め、たわみで内部機構の位置や窓のシールがずれる</li>
<li>外側だけ溶接・止まり穴に通常ボルトで、到達圧力がなかなか下がらない (仮想リーク)</li>
<li>シール面に半径方向の傷、梱包で当て傷。O リング溝の角に面取りがなく O リングを切る</li>
<li>ポートのフランジボルトに工具が入らない、吊り点が重心からずれて吊ると傾く</li>
</ul>

<h3>設計チェックリスト</h3>
<ul>
<li>蓋・壁・底板のたわみと応力を、支持条件を明記して計算したか (大きな穴は FEM)</li>
<li>真空側に閉じたすき間・止まり穴・面の重ね合わせが残っていないか</li>
<li>O リングのつぶし率・充填率、シール面の粗さ・加工目の方向・傷の禁止を図面に書いたか</li>
<li>リーク試験の方法と判定基準を決めたか</li>
<li>ポートの工具スペース、吊り点、基準面の仕上げ加工を指示したか</li>
</ul>`,
    points: [
      "真空チャンバの板厚は、強度よりたわみで決まることが多い",
      "円板: 単純支持 σ = 3(3 + ν) p r² / 8t²、固定 σ = 3 p r² / 4t²",
      "真空側を溶接し、閉じたすき間・止まり穴を作らない (仮想リーク)",
      "O リングはつぶし率と溝充填率で溝を決め、シール面の加工目は同心円状",
      "ポートの工具スペース・吊り点・溶接後の基準面加工を忘れない",
    ],
    exercises: [
      {
        q: "Ø300 mm (r = 150 mm) のアルミ合金 (E = 70 GPa、ν = 0.33) の蓋を O リング面に載せて使います (周辺単純支持)。大気圧 0.101 MPa で、中央たわみを 0.05 mm 以下にしたい。板厚 20 mm は満足しますか。",
        a: "D = E t³ / 12(1 − ν²) = 70000 × 20³ / (12 × (1 − 0.33²)) = 5.60 × 10⁸ / 10.69 ≈ 5.24 × 10⁷ N·mm。<br>w = (5 + ν) p r⁴ / 64 D (1 + ν) = 5.33 × 0.101 × 150⁴ / (64 × 5.24 × 10⁷ × 1.33) ≈ 2.73 × 10⁸ / 4.46 × 10⁹ ≈ <b>0.061 mm</b>。<br>0.05 mm を超えるので<b>満足しません</b>。たわみは t³ に反比例するので、t = 20 × (0.061 / 0.05)^(1/3) ≈ 21.4 mm → <b>22 mm</b> にするか、リブを付けます。応力 σ = 3 × 3.33 × 0.101 × 150² / (8 × 20²) ≈ 7.1 MPa で強度は十分です。",
      },
      {
        q: "線径 5.0 mm の O リングを、つぶし率 20%・溝充填率 80% 程度にする角溝の深さと幅を求めてください。",
        a: "深さ h = 5.0 × (1 − 0.20) = <b>4.0 mm</b>。O リング断面積 = π/4 × 5.0² ≈ 19.6 mm²。溝断面積 = 19.6 / 0.80 ≈ 24.5 mm² → 幅 w = 24.5 / 4.0 ≈ <b>6.1 mm</b>。最終寸法はメーカーの溝寸法表で確認します。",
      },
    ],
    quiz: [
      { q: "真空チャンバの溶接で原則となるのは?", choices: ["大気側だけを溶接する", "真空側 (内側) を溶接し、閉じたすき間を作らない", "両側を全周溶接して完全に密閉する"], answer: 1, explain: "大気側溶接や両側全周溶接は、閉じたすき間 (仮想リーク) を生みます。" },
      { q: "止まり穴にボルトを締めるときの対策として適切なのは?", choices: ["ねじ部にグリースを多めに塗る", "ガス抜き穴付きのボルトを使う", "座金を 2 枚重ねる"], answer: 1, explain: "穴底の空気を逃がす経路を作ります。座金の重ね使いは逆にすき間を増やします。" },
      { q: "板厚を 2 倍にすると、平板のたわみはおよそ何倍になる?", choices: ["1/2", "1/4", "1/8"], answer: 2, explain: "たわみは t³ に反比例 (D ∝ t³) するので 1/8 になります。" },
      { q: "O リングのシール面で特に避けるべき傷は?", choices: ["同心円状の加工目", "半径方向 (シールを横切る方向) の傷", "面取り"], answer: 1, explain: "シールを横切る傷は 1 本でもリーク経路になります。" },
    ],
  },

  // ------------------------------------------------------------------ 2
  {
    id: "vacuum-mechanisms",
    part: "equipment",
    title: "真空中の機構設計 — 導入機・ベローズ・磁気カップリング・潤滑",
    minutes: 20,
    level: 3,
    lead: "真空の中で「動かす」ことは、大気中の機構設計の常識がいくつも通用しない世界です。壁を貫いて動きを伝える導入機、伸び縮みしながら気密を保つベローズ、磁力でトルクを伝えるカップリング、油が使いにくい環境での潤滑、そして空気がないため熱が逃げないモータ。この章ではそれぞれの設計の要点と計算を学びます。",
    body: `
<h2>動きを真空に入れる 3 つの方法</h2>
<table class="tb-table">
<tr><th>方式</th><th>しくみ</th><th>長所</th><th>注意点</th></tr>
<tr><td>しゅう動シール (O リング・リップシール)</td><td>回転軸・直動軸をエラストマでシール</td><td>安価・コンパクト</td><td>動くたびに微量のリークと発じん。高真空・高清浄には不向き</td></tr>
<tr><td>ベローズ</td><td>金属の蛇腹が伸縮して直動 (や揺動) を伝える</td><td>しゅう動部なしで完全に気密</td><td>ストロークと寿命に限界、圧力による力が発生</td></tr>
<tr><td>磁気カップリング</td><td>隔壁越しに磁石の吸引で回転・直動を伝える</td><td>隔壁が静止で完全に気密</td><td>伝達トルクに上限 (超えると滑る)、剛性が低い</td></tr>
</table>
<p>差動排気付きのしゅう動シール (2 段のシールの間を別に排気) で、リークを小さくする方法もあります。</p>

<h2>ベローズ — 成形ベローズと溶接ベローズ</h2>
<svg class="tb-chart" viewBox="0 0 520 270" role="img" aria-label="成形ベローズと溶接ベローズの断面の比較">
<text class="k-title" x="260" y="20" text-anchor="middle">ベローズの断面 (半断面)</text>
<rect class="k-panel" x="12" y="32" width="240" height="226" rx="8"/>
<rect class="k-panel" x="268" y="32" width="240" height="226" rx="8"/>
<text class="lbl" x="132" y="52" text-anchor="middle">成形ベローズ (液圧成形)</text>
<text class="lbl" x="388" y="52" text-anchor="middle">溶接ベローズ (エッジウェルド)</text>
<!-- formed: wavy wall -->
<rect class="k-cut" x="40" y="66" width="80" height="12"/>
<rect class="k-cut" x="40" y="206" width="80" height="12"/>
<path class="k-edge" d="M60 78 C 40 86, 40 94, 60 102 C 80 110, 80 118, 60 126 C 40 134, 40 142, 60 150 C 80 158, 80 166, 60 174 C 40 182, 40 190, 60 206" style="stroke-width:3"/>
<line class="k-center" x1="160" y1="60" x2="160" y2="226"/>
<text class="tick" x="132" y="240" text-anchor="middle">山が丸く、ピッチが大きい</text>
<line class="k-thin" x1="72" y1="140" x2="100" y2="140"/><text class="tick" x="104" y="144">1 枚の管を成形</text>
<!-- welded: diaphragms -->
<rect class="k-cut" x="296" y="66" width="80" height="12"/>
<rect class="k-cut" x="296" y="206" width="80" height="12"/>
<path class="k-edge" d="M330 78 L300 84 L330 90 L300 96 L330 102 L300 108 L330 114 L300 120 L330 126 L300 132 L330 138 L300 144 L330 150 L300 156 L330 162 L300 168 L330 174 L300 180 L330 186 L300 192 L330 198 L320 206" style="stroke-width:2"/>
<circle cx="300" cy="84" r="2.2" style="fill:var(--tb-accent)"/><circle cx="300" cy="108" r="2.2" style="fill:var(--tb-accent)"/>
<circle cx="330" cy="102" r="2.2" style="fill:var(--tb-accent)"/>
<line class="k-center" x1="416" y1="60" x2="416" y2="226"/>
<line class="k-thin" x1="332" y1="102" x2="360" y2="110"/><text class="tick" x="364" y="114">内外周を溶接</text>
<text class="tick" x="388" y="240" text-anchor="middle">薄板の積み重ね、縮むと密着</text>
</svg>
<p class="tb-caption">図: 溶接ベローズは環状の薄板 (ダイアフラム) を内周・外周で交互に溶接したもの。縮めると薄板が密着するので、自由長に対するストロークが大きい</p>
<ul>
<li><b>成形ベローズ</b>: 1 本の薄肉管を成形。安価で丈夫。自由長に対するストロークは小さい</li>
<li><b>溶接ベローズ</b>: 短い長さで長いストロークが取れる。ばね定数が小さい。溶接部が多く高価で、内部の谷に洗浄液や粒子が残りやすい</li>
<li><b>寿命</b>: 使うストロークの範囲 (伸び・縮み) と繰返し数で決まる。<b>許容ストロークより少なく使うほど寿命は大きく延びる</b>ので、メーカーの寿命線図で、必要回数に余裕を持たせて選定する</li>
<li><b>座屈</b>: 内外の圧力差で長いベローズは横に座屈 (スクワーム) する。ガイドで軸を拘束し、ねじれ (トルク) を加えない</li>
</ul>
<p>ベローズには<b>圧力による力</b>が働きます。内側が真空・外側が大気なら、可動端は F = Δp × A<sub>eff</sub> (A<sub>eff</sub> = π/4 × 有効径²、有効径 ≈ (内径 + 外径)/2) で真空側に引き込まれます。これに<b>ばね力</b> (ばね定数 × 変位) が加わります。計算は「ウェーハ受け渡し機構の設計」の章で行います。</p>

<h2>磁気カップリング</h2>
<svg class="tb-chart" viewBox="0 0 520 220" role="img" aria-label="磁気カップリング式回転導入機の断面">
<text class="k-title" x="260" y="20" text-anchor="middle">磁気カップリング式回転導入機 (断面)</text>
<line class="k-center" x1="40" y1="120" x2="490" y2="120"/>
<!-- flange -->
<rect class="k-cut" x="240" y="48" width="18" height="144"/>
<!-- isolation can -->
<path class="k-cut2" d="M258 82 L410 82 L410 158 L258 158 L258 152 L404 152 L404 88 L258 88 Z"/>
<!-- outer magnet ring -->
<rect class="k-part" x="300" y="56" width="90" height="24" rx="2"/>
<rect class="k-part" x="300" y="160" width="90" height="24" rx="2"/>
<rect class="k-accent" x="306" y="74" width="78" height="6"/><rect class="k-accent" x="306" y="160" width="78" height="6"/>
<!-- inner magnet hub -->
<rect class="k-accent" x="306" y="92" width="78" height="6"/><rect class="k-accent" x="306" y="142" width="78" height="6"/>
<rect class="k-part" x="300" y="98" width="90" height="44"/>
<!-- inner shaft into vacuum -->
<rect class="k-part-h" x="60" y="110" width="240" height="20"/>
<rect class="k-alu" x="150" y="100" width="14" height="40"/><rect class="k-alu" x="200" y="100" width="14" height="40"/>
<!-- motor -->
<rect class="k-alu" x="420" y="90" width="70" height="60" rx="5"/>
<rect class="k-part-h" x="390" y="114" width="30" height="12"/>
<text class="tick" x="455" y="124" text-anchor="middle">モータ</text>
<text class="lbl" x="120" y="70" text-anchor="middle">真空側</text>
<text class="lbl" x="455" y="70" text-anchor="middle">大気側</text>
<line class="k-thin" x1="330" y1="155" x2="300" y2="205"/><text class="tick" x="296" y="210" text-anchor="end">隔壁 (薄肉キャン、非磁性)</text>
<line class="k-thin" x1="360" y1="62" x2="380" y2="40"/><text class="tick" x="384" y="40">外側磁石</text>
<line class="k-thin" x1="380" y1="96" x2="460" y2="190"/><text class="tick" x="440" y="204">内側磁石</text>
<line class="k-thin" x1="157" y1="140" x2="130" y2="170"/><text class="tick" x="126" y="176" text-anchor="end">真空用軸受</text>
</svg>
<p class="tb-caption">図: 磁石の間に非磁性の薄い隔壁 (キャン) があり、隔壁は動かない。磁気ギャップが大きいほど伝達トルクは小さくなる</p>
<p>磁気カップリングは<b>最大トルクを超えると滑り</b>、極の数だけずれた位置で再び結合します。位置決め機構では、滑りで原点がずれるのでエンコーダを真空側に置くか、滑り検出を設けます。選定は、負荷トルク (軸受摩擦 + 加速トルク J α) に<b>安全率 2〜3 程度 (目安)</b> を掛けた値以上の定格を選びます。ねじり剛性が低いので、停止時の振動 (ねじれ振動) にも注意します。</p>

<h2>真空中の軸受と潤滑</h2>
<p>真空では一般的な潤滑油・グリースが<b>蒸発して</b>チャンバを汚染します。また、清浄な金属どうしは表面の酸化膜が削れると<b>凝着 (コールドウェルディング)</b> しやすく、同種のステンレス同士のしゅう動やねじでは<b>かじり</b>が起きやすくなります。</p>
<ul>
<li><b>固体潤滑</b>: 二硫化モリブデン (MoS₂)、二硫化タングステン (WS₂) の被膜、PTFE 系材料の保持器や被膜。MoS₂ は湿った大気中で性能が落ちるなど、雰囲気による違いがある</li>
<li><b>低蒸気圧グリース</b>: フッ素系などの真空用グリース。使用温度での蒸気圧と量の管理が必要</li>
<li><b>軸受</b>: 真空用に脱脂・固体潤滑した軸受、セラミック球 (異種材料で凝着を防ぐ) を使ったもの</li>
<li><b>ねじ</b>: 異種材料の組合せ、銀めっきなどの表面処理、焼付き防止剤 (真空用) でかじりを防ぐ</li>
</ul>
<p>どの潤滑剤も寿命・温度範囲・アウトガスが製品で大きく異なります。<b>メーカーのデータで、使う真空度と温度での実績を確認</b>してください。</p>

<h2>真空中のモータは冷えない</h2>
<p>大気中ではモータの熱は対流で逃げますが、真空では<b>放射と、取付面からの伝導</b>だけです。放射で逃げる熱は Q = ε σ A (T⁴ − T<sub>s</sub>⁴) (σ = 5.67 × 10⁻⁸ W/m²K⁴) です。</p>
<div class="tb-example">
<p><b>計算例:</b> 損失 5 W のモータ、表面積 A = 0.012 m²、周囲 T<sub>s</sub> = 298 K。放射だけで逃がすとき、平衡温度は T = (Q / εσA + T<sub>s</sub>⁴)<sup>1/4</sup> です。</p>
<p>・放射率 ε = 0.3 (金属地肌に近い) → T ≈ <b>151 °C</b><br>
・ε = 0.8 (黒色処理) → T ≈ <b>88 °C</b></p>
<p>どちらもモータの許容温度を超えるおそれがあります。そこで取付ブラケットで伝導させます。断面 20 × 5 mm、長さ 50 mm、熱伝導率 150 W/mK のアルミブラケットの熱コンダクタンスは G = kA/L = 150 × 1.0 × 10⁻⁴ / 0.05 = 0.3 W/K。全損失 5 W を流すには温度差 5 / 0.3 ≈ <b>17 K</b> で済みます (接触熱抵抗は別途加算)。真空中の接触熱抵抗は大きいので、面圧を上げる・熱伝導シート (真空対応品) を挟むなどの工夫が要ります。</p>
</div>
<p>モータの定格は大気中の値です。真空で使う場合は<b>デューティ (通電時間) を下げる、真空用モータを選ぶ、大気側にモータを置いて導入機で入れる</b>のいずれかを検討します。</p>

<h2>閉じた空間を作らない</h2>
<p>軸受のハウジング、カバー内部、中空シャフトなど、機構には閉じた空間が多くあります。真空引きのときに空気が抜ける<b>ベント穴 (逃げ穴)</b> を設け、ベントでの急な圧力差で薄いカバーや軸受シールが変形・破損しないようにします。</p>

<h3>よくある失敗</h3>
<ul>
<li>大気用のグリース入り軸受をそのまま入れ、チャンバが汚染される</li>
<li>ステンレス同士のねじが真空中のベーキング後にかじって外れない</li>
<li>モータが真空中で過熱して停止、または減磁・絶縁劣化</li>
<li>ベローズをカタログの最大ストロークいっぱいで使い、短期間で割れる。ねじりを加えて割れる</li>
<li>磁気カップリングが滑って原点がずれたことに気付かない</li>
</ul>

<h3>設計チェックリスト</h3>
<ul>
<li>動きの導入方式 (しゅう動シール/ベローズ/磁気) を真空度・清浄度から選んだか</li>
<li>ベローズのストローク余裕・寿命・座屈・圧力による力を確認したか</li>
<li>潤滑剤と軸受の真空適合性・温度範囲をメーカーデータで確認したか</li>
<li>真空中の発熱部品の放熱経路 (放射 + 伝導) を計算したか</li>
<li>閉じた空間にベント穴があるか</li>
</ul>`,
    points: [
      "動きの導入: しゅう動シール・ベローズ・磁気カップリング。気密と発じんで選ぶ",
      "溶接ベローズは長ストローク、成形ベローズは安価で丈夫。ストローク余裕で寿命が延びる",
      "ベローズには圧力による力 F = Δp × A_eff が働く",
      "真空中では油が蒸発し、金属が凝着しやすい — 固体潤滑・低蒸気圧グリース・異種材料",
      "真空中のモータは放射と伝導だけで冷える。放熱経路を設計する",
    ],
    exercises: [
      {
        q: "表面積 0.02 m²、損失 8 W の機器を真空中に置きます。放射率 0.8、周囲 298 K で、放射だけのときの平衡温度を求めてください。",
        a: "T = (Q / εσA + T<sub>s</sub>⁴)^(1/4) = (8 / (0.8 × 5.67 × 10⁻⁸ × 0.02) + 298⁴)^(1/4) = (8.82 × 10⁹ + 7.89 × 10⁹)^(1/4) = (1.671 × 10¹⁰)^(1/4) ≈ 359.5 K ≈ <b>86 °C</b>。",
      },
      {
        q: "真空側の回転軸の負荷トルクが軸受摩擦 0.05 N·m、慣性モーメント 2 × 10⁻⁴ kg·m² を 0.1 s で 0 → 30 rpm に加速します。安全率 2.5 とすると、磁気カップリングの必要トルクはいくらですか。",
        a: "ω = 30 × 2π / 60 = 3.14 rad/s、α = 3.14 / 0.1 = 31.4 rad/s²。加速トルク = 2 × 10⁻⁴ × 31.4 = 0.0063 N·m。合計 0.0563 N·m × 2.5 ≈ <b>0.14 N·m 以上</b>の定格を選びます。",
      },
    ],
    quiz: [
      { q: "しゅう動部がなく完全に気密な直動導入の方法は?", choices: ["O リングのしゅう動シール", "ベローズ", "リップシール"], answer: 1, explain: "ベローズは自らが伸縮するので、しゅう動するシール面がありません。" },
      { q: "真空中でモータが過熱しやすい主な理由は?", choices: ["電圧が上がるから", "対流による放熱がないから", "磁石が強くなるから"], answer: 1, explain: "真空では対流がなく、放射と伝導だけで熱が逃げます。" },
      { q: "同種のステンレス同士のねじが真空中でかじりやすい対策として適切なのは?", choices: ["一般用の潤滑油を塗る", "異種材料の組合せや表面処理 (めっき) を使う", "締付けトルクを 2 倍にする"], answer: 1, explain: "凝着しにくい組合せや真空用の焼付き防止処理を使います。一般用の油は蒸発して汚染します。" },
    ],
  },

  // ------------------------------------------------------------------ 3
  {
    id: "lift-pin-gate-valve",
    part: "equipment",
    title: "ウェーハ受け渡し機構の設計 — リフトピン・ゲートバルブ・シャッタ",
    minutes: 20,
    level: 3,
    lead: "搬送ロボットとステージの間でウェーハを受け渡すのがリフトピン、チャンバ間を仕切るのがゲートバルブです。どちらも 1 日に何千回も動き、ウェーハに直接・間接に触れるため、発じん・ずれ・割れの原因になりやすい機構です。この章では構造・材料・動作タイミングとインターロック、そしてベローズの圧力を含むアクチュエータ力の計算を学びます。",
    body: `
<h2>リフトピン機構の構造</h2>
<p>ステージ (ヒータや静電チャック) を貫通する 3 本のピンが上昇してウェーハを持ち上げ、ロボットのハンドがその下に入って受け取ります。3 本のピンは真空中の<b>共通のリフト板</b>に立て、1 本の軸をベローズで大気側に導いて 1 つのアクチュエータで駆動するのが基本形です。共通のリフト板にすることで 3 本の<b>同期</b> (高さの一致) が機構的に保証されます。</p>
<svg class="tb-chart" viewBox="0 0 520 320" role="img" aria-label="ベローズで封止したリフトピン機構の断面">
<text class="k-title" x="260" y="20" text-anchor="middle">リフトピン機構 (断面)</text>
<!-- wafer -->
<rect class="k-accent" x="120" y="46" width="250" height="4" rx="1"/>
<text class="tick" x="380" y="52">ウェーハ</text>
<!-- stage -->
<path class="k-cut" d="M110 70 L160 70 L160 120 L168 120 L168 70 L322 70 L322 120 L330 120 L330 70 L380 70 L380 100 L110 100 Z"/>
<text class="tick" x="386" y="90">ステージ</text>
<!-- pins -->
<rect class="k-plastic" x="161" y="52" width="6" height="108"/>
<rect class="k-plastic" x="323" y="52" width="6" height="108"/>
<path class="k-plastic" d="M161 52 Q164 46 167 52 Z"/><path class="k-plastic" d="M323 52 Q326 46 329 52 Z"/>
<!-- lift plate -->
<rect class="k-alu" x="150" y="160" width="190" height="12" rx="2"/>
<!-- chamber bottom -->
<rect class="k-cut" x="60" y="210" width="168" height="18"/><rect class="k-cut" x="262" y="210" width="198" height="18"/>
<text class="tick" x="110" y="204">チャンバ底板</text>
<!-- shaft -->
<rect class="k-part-h" x="238" y="172" width="14" height="128"/>
<!-- bellows -->
<rect class="k-cut" x="216" y="228" width="58" height="8"/>
<path class="k-edge" d="M226 236 L218 240 L226 244 L218 248 L226 252 L218 256 L226 260 L218 264 L226 268 L218 272 L226 276" />
<path class="k-edge" d="M264 236 L272 240 L264 244 L272 248 L264 252 L272 256 L264 260 L272 264 L264 268 L272 272 L264 276" />
<rect class="k-part" x="210" y="276" width="70" height="10"/>
<!-- actuator -->
<rect class="k-alu" x="380" y="250" width="100" height="40" rx="4"/>
<rect class="k-part-h" x="280" y="278" width="100" height="6"/>
<text class="lbl" x="430" y="274" text-anchor="middle">アクチュエータ</text>
<text class="tick" x="430" y="304" text-anchor="middle">(大気側)</text>
<!-- callouts -->
<line class="k-thin" x1="273" y1="256" x2="320" y2="246"/><text class="tick" x="324" y="244">溶接ベローズ</text>
<line class="k-thin" x1="200" y1="166" x2="100" y2="150"/><text class="tick" x="96" y="146" text-anchor="end">リフト板</text>
<line class="k-thin" x1="164" y1="130" x2="100" y2="120"/><text class="tick" x="96" y="118" text-anchor="end">ピン</text>
<text class="lbl" x="420" y="150" text-anchor="middle">真空</text>
<text class="lbl" x="120" y="296" text-anchor="middle">大気</text>
<path class="k-move" d="M490 170 L490 120" marker-end="url(#k-arrow)"/>
<text class="tick" x="484" y="190" text-anchor="end">上昇</text>
</svg>
<p class="tb-caption">図: 3 本のピンを 1 枚のリフト板に立て、1 本の軸をベローズで大気側に出す。ステージの穴とピンのすき間は、ピンが擦れない程度に確保する</p>

<h3>ピンの材料と先端形状</h3>
<ul>
<li><b>材料</b>: ウェーハに金属汚染を与えないことが第一。セラミックス (アルミナ等)、石英、耐熱樹脂 (PEEK・ポリイミド系など、温度に応じて) が使われる。ヒータ温度とプラズマへの耐性で選ぶ</li>
<li><b>先端</b>: 球面 (R 形状) にして接触を点にし、傷とパーティクルを減らす。先端の高さ (3 本の段差) を図面で厳しく管理</li>
<li><b>配置</b>: 3 本をウェーハ重心を囲む三角形 (ピッチ円) に置き、ロボットハンドの指と干渉しない位置にする</li>
<li><b>ステージ穴</b>: ピンとのすき間は熱膨張を見込み、穴の縁に面取り。穴がプロセス (温度分布・放電) に影響することがあるので径は最小限に</li>
</ul>

<h3>ウェーハが滑らない加速度</h3>
<p>ピンに載ったウェーハは<b>摩擦だけで保持</b>されています。水平の加速度 a が μg (μ: 摩擦係数) を超えると滑ります。μ = 0.1 と仮定すると a < 0.1 × 9.81 ≈ <b>0.98 m/s²</b>。上下動でも、急停止の振動で一瞬浮けばずれるので、上下動は<b>S 字加減速</b>で滑らかにし、着地 (ステージに載せる) 直前は減速します。μ は材料・表面・温度・真空度で大きく変わるため、実機で確認します。</p>

<h2>計算例 — アクチュエータの必要力</h2>
<div class="tb-example">
<p>条件: 溶接ベローズ 内径 20 mm・外径 36 mm、ばね定数 5 N/mm、ピン下降位置で自由長、上昇ストローク 20 mm (ベローズは上昇で縮む)。可動部質量 1.5 kg (重量 14.7 N)、ウェーハ 300 mm 約 128 g (1.26 N、ピン 1 本あたり 0.42 N)。</p>
<p>① ベローズ有効径 ≈ (20 + 36) / 2 = 28 mm、A<sub>eff</sub> = π/4 × 28² ≈ 616 mm²<br>
② 圧力による力 F<sub>p</sub> = Δp × A<sub>eff</sub> = 0.101 × 616 ≈ <b>62.4 N</b> (チャンバが真空のとき、可動部をチャンバ側 = 上向きに押す)<br>
③ ばね力 (上昇端) = 5 × 20 = <b>100 N</b> (下向き)</p>
<table class="tb-table">
<tr><th>状態</th><th>力のつり合い</th><th>アクチュエータに必要な力</th></tr>
<tr><td>真空・下降端</td><td>62.4 (上) − 14.7 (下)</td><td>下向きに <b>47.7 N</b> で保持</td></tr>
<tr><td>真空・上昇端</td><td>100 + 14.7 (下) − 62.4 (上)</td><td>上向きに <b>52.3 N</b></td></tr>
<tr><td>大気 (メンテ時)・上昇端</td><td>100 + 14.7 (下)</td><td>上向きに <b>114.7 N</b></td></tr>
</table>
<p>最大 114.7 N に余裕 1.5 倍を見て 172 N。エアシリンダ (供給 0.4 MPa) なら必要断面積 172 / 0.4 = 435 mm² → 内径 23.5 mm → <b>内径 25 mm (約 196 N)</b> を選びます。<b>真空では下降端を保持する力が要る</b>点が見落としやすく、空気圧が抜けたとき (停電) にピンが勝手に上がる方向の力が働くことに注意します。ウェーハの重量はアクチュエータ力に対しては無視できるほど小さく、支配的なのはベローズの力です。</p>
</div>

<h2>ゲートバルブ・スリットバルブ</h2>
<p>チャンバとチャンバ (または搬送室) をつなぐ開口を開閉する弁です。ウェーハが通る細長い開口用のものをスリットバルブとも呼びます。</p>
<svg class="tb-chart" viewBox="0 0 520 250" role="img" aria-label="スリットバルブの弁体の動き。上昇してから押し付ける 2 段動作">
<text class="k-title" x="260" y="20" text-anchor="middle">弁体の動き — 擦らずに押し付ける</text>
<!-- wall with slit -->
<rect class="k-cut" x="300" y="40" width="30" height="70"/>
<rect class="k-cut" x="300" y="150" width="30" height="80"/>
<text class="tick" x="340" y="134">スリット開口 (ウェーハ通路)</text>
<!-- valve plate positions -->
<rect class="k-part" x="260" y="190" width="30" height="40" rx="3" opacity="0.45"/>
<rect class="k-part" x="260" y="104" width="30" height="52" rx="3" opacity="0.6"/>
<rect class="k-part" x="270" y="104" width="30" height="52" rx="3"/>
<circle class="k-rubber" cx="300" cy="110" r="3.5"/><circle class="k-rubber" cx="300" cy="150" r="3.5"/>
<path class="k-move" d="M250 222 L250 140" marker-end="url(#k-arrow)"/>
<path class="k-move" d="M230 96 L262 96" marker-end="url(#k-arrow)"/>
<text class="tick" x="160" y="186">① 上昇 (非接触)</text>
<text class="tick" x="130" y="90">② 水平に押し付け</text>
<rect class="k-part-h" x="270" y="156" width="10" height="70"/>
<line class="k-thin" x1="300" y1="150" x2="380" y2="180"/><text class="tick" x="384" y="184">O リング (弁体側)</text>
<!-- timing -->
<text class="tick" x="20" y="224">開 ⇄ 閉 は 2 段</text>
<text class="tick" x="20" y="240">シール面を横に擦らない</text>
</svg>
<p class="tb-caption">図: 弁体は開口と平行に移動してから、垂直に押し付けて O リングを潰す。O リングが面上を横滑りすると摩耗粉 (パーティクル) が出る</p>
<ul>
<li><b>発じん対策</b>: O リングを擦らない 2 段動作 (または傾斜カムによる L 字動作)、閉じる直前の減速、O リングを焼き付け (加硫接着) して脱落を防ぐ</li>
<li><b>圧力差</b>: 弁体に圧力差がかかる向きを決めておく (圧力で押し付けられる向きなら気密が助けられる。逆向きは開いてしまう方向)。開口 300 × 40 mm でも 1 気圧差なら約 1.2 kN の力がかかる</li>
<li><b>交換性</b>: O リングと弁体は消耗品。チャンバを大気開放せずに交換できる構造が望ましい</li>
</ul>

<h2>インターロックとタイミング</h2>
<svg class="tb-chart" viewBox="0 0 520 220" role="img" aria-label="ロボット・ゲートバルブ・リフトピンのタイミング図">
<text class="k-title" x="260" y="20" text-anchor="middle">ウェーハ搬入のタイミング</text>
<text class="lbl" x="110" y="58" text-anchor="end">ゲートバルブ</text>
<text class="lbl" x="110" y="98" text-anchor="end">ロボット (挿入)</text>
<text class="lbl" x="110" y="138" text-anchor="end">リフトピン</text>
<text class="lbl" x="110" y="178" text-anchor="end">ウェーハ有無</text>
<path class="k-edge" d="M120 62 L150 62 L160 44 L420 44 L430 62 L500 62" style="stroke:var(--tb-accent);stroke-width:2"/>
<path class="k-edge" d="M120 102 L180 102 L200 84 L240 84 L240 84 L300 84 L300 84 L360 84 L380 102 L500 102" style="stroke:var(--tb-accent);stroke-width:2"/>
<path class="k-edge" d="M120 142 L240 142 L255 124 L330 124 L345 142 L500 142" style="stroke:var(--tb-accent);stroke-width:2"/>
<path class="k-edge" d="M120 182 L262 182 L262 164 L500 164" style="stroke:var(--tb-accent);stroke-width:2"/>
<line class="k-hidden" x1="160" y1="36" x2="160" y2="196"/>
<line class="k-hidden" x1="255" y1="36" x2="255" y2="196"/>
<line class="k-hidden" x1="360" y1="36" x2="360" y2="196"/>
<line class="k-hidden" x1="430" y1="36" x2="430" y2="196"/>
<text class="tick" x="160" y="210" text-anchor="middle">開確認</text>
<text class="tick" x="255" y="210" text-anchor="middle">ピン上昇</text>
<text class="tick" x="360" y="210" text-anchor="middle">退避確認</text>
<text class="tick" x="430" y="210" text-anchor="middle">閉</text>
</svg>
<p class="tb-caption">図: 「開いたことをセンサで確認してから挿入」「ハンドの退避を確認してから閉じる・ピンを下げる」。時間待ちでなく状態確認で進める</p>
<ul>
<li>ゲートバルブの<b>開センサ ON</b> を確認するまでロボットを挿入しない</li>
<li>ロボットの<b>退避位置センサ ON</b> を確認するまでゲートバルブを閉じない (ハンドを挟まない)</li>
<li>ロボットのハンドがピンの間にある間は、ピンを動かさない (干渉・ウェーハ落下)</li>
<li>リフトピンの上下端にもセンサを付け、両方 OFF (中間停止) をエラーにする</li>
</ul>

<h3>よくある失敗</h3>
<ul>
<li>ベローズの圧力による力を忘れ、真空引きでピンが上がってしまう、または上がりきらない</li>
<li>ピン 3 本の先端高さがそろっておらず、ウェーハが傾いて受け渡し時にずれる</li>
<li>ピンとステージ穴のすき間が熱膨張で詰まり、擦れて発じん・固着</li>
<li>弁体の O リングを横に擦る動作で、閉じるたびにパーティクルが出る</li>
<li>タイマ待ちでシーケンスを組み、エア圧低下時にハンドとバルブが衝突</li>
</ul>

<h3>設計チェックリスト</h3>
<ul>
<li>ピンの材料・先端 R・高さ公差・ハンドとの干渉を確認したか</li>
<li>アクチュエータ力を真空/大気・上端/下端の全状態で計算したか (ベローズの圧力力・ばね力)</li>
<li>加減速がウェーハの滑り限界 (μg) より十分小さいか</li>
<li>弁体の動作が O リングを擦らないか、圧力差の向きを決めたか</li>
<li>インターロックを状態センサで組み、エア・電源喪失時の挙動を決めたか</li>
</ul>`,
    points: [
      "3 本のリフトピンは共通のリフト板で同期させ、1 本のベローズ封止軸で駆動",
      "ベローズの圧力による力 F = Δp × A_eff とばね力を、全状態で計算する",
      "ウェーハは摩擦だけで保持 — 加速度は μg より十分小さく",
      "ゲートバルブは O リングを擦らない 2 段動作で発じんを抑える",
      "インターロックはタイマでなく、開・退避などの状態センサで組む",
    ],
    exercises: [
      {
        q: "内径 30 mm・外径 50 mm の溶接ベローズで真空中に直動を導入します。内側が真空・外側が大気のとき、圧力による力はいくらですか。",
        a: "有効径 ≈ (30 + 50) / 2 = 40 mm、A<sub>eff</sub> = π/4 × 40² ≈ 1257 mm²。F = 0.101 × 1257 ≈ <b>127 N</b> (約 13 kgf) で、可動端をチャンバ側に引き込む向きです。",
      },
      {
        q: "スリットバルブの開口 320 × 50 mm に 1 気圧の圧力差がかかります。弁体にかかる力を求めてください。",
        a: "面積 = 320 × 50 = 16,000 mm²。F = 0.101 × 16,000 ≈ <b>1,620 N</b> (約 165 kgf)。実際にはシール線 (O リングの中心線) で囲まれた面積で計算するので、さらに少し大きくなります。",
      },
    ],
    quiz: [
      { q: "3 本のリフトピンの高さを機構的にそろえる基本的な方法は?", choices: ["3 本を別々のアクチュエータで同時に動かす", "共通のリフト板に立てて 1 つのアクチュエータで動かす", "ピンをばねで浮かせる"], answer: 1, explain: "共通のリフト板により、3 本の相対高さが構造で決まります。" },
      { q: "チャンバを真空にすると、ベローズ封止した軸の可動端にはどの向きの力が働く?", choices: ["チャンバ側 (真空側) に引き込まれる", "大気側に押し出される", "力は働かない"], answer: 0, explain: "外側の大気圧が有効面積に作用し、真空側へ押し込みます。" },
      { q: "ゲートバルブの発じんを抑える動作は?", choices: ["O リングを面に沿って滑らせながら閉じる", "平行移動してから垂直に押し付ける", "高速で衝突させて閉じる"], answer: 1, explain: "O リングを擦らないことが発じん対策の基本です。" },
    ],
  },

  // ------------------------------------------------------------------ 4
  {
    id: "equipment-frame-cover",
    part: "equipment",
    title: "装置フレーム・外装・耐震の設計 — 剛性・レベル出し・保守性",
    minutes: 20,
    level: 3,
    lead: "半導体製造装置や分析装置は、重いチャンバと精密な機構をフレームに載せ、クリーンルームの床に固定して使います。フレームは「重さを支える」だけでなく、レベル出し・搬入・地震・保守まで装置の一生を支える部品です。この章ではフレーム構造の選び方、脚と固定、耐震の転倒計算、カバーと保守スペースを学びます。",
    body: `
<h2>フレーム構造 — 溶接鋼構造とアルミ押出材</h2>
<table class="tb-table">
<tr><th>項目</th><th>溶接鋼フレーム (角パイプ・形鋼)</th><th>アルミ押出材フレーム</th></tr>
<tr><td>剛性・重量</td><td>剛性が高い (E ≈ 206 GPa)、重い</td><td>軽い。E ≈ 70 GPa で同形状なら剛性は約 1/3</td></tr>
<tr><td>精度</td><td>溶接ひずみ → 取付面は溶接後に機械加工</td><td>組立精度は継手しだい。加工面は少ない</td></tr>
<tr><td>変更のしやすさ</td><td>設計変更は再製作</td><td>部材の追加・移動が容易</td></tr>
<tr><td>向く用途</td><td>重いチャンバ・ロボットの土台、主構造</td><td>カバー・制御盤・軽量ユニットの支持</td></tr>
</table>
<p>重いチャンバや搬送ロボットを載せる<b>主フレームは溶接鋼構造</b>、外装や軽量部品の<b>副フレームは押出材</b>、と使い分けるのが一般的です。溶接フレームは、塗装 (またはめっき) の前に取付面を加工し、クリーンルームでの発じんを抑える塗装・表面処理を指定します。</p>

<svg class="tb-chart" viewBox="0 0 520 300" role="img" aria-label="装置フレームの斜視図。主フレーム、チャンバ、レベリングフット、キャスタ、耐震金具">
<text class="k-title" x="260" y="20" text-anchor="middle">装置フレームの構成 (概略)</text>
<rect class="k-ground" x="20" y="262" width="480" height="10"/><line class="k-edge" x1="20" y1="262" x2="500" y2="262"/>
<!-- frame: front face + depth -->
<path class="k-part" d="M90 120 L330 120 L380 90 L140 90 Z"/>
<rect class="k-part" x="90" y="120" width="12" height="122"/>
<rect class="k-part" x="318" y="120" width="12" height="122"/>
<path class="k-part" d="M330 120 L380 90 L380 212 L330 242 Z" opacity="0.85"/>
<rect class="k-part" x="90" y="230" width="240" height="12"/>
<rect class="k-part" x="90" y="170" width="240" height="10"/>
<!-- chamber -->
<path class="k-alu" d="M150 120 L150 70 Q150 60 160 60 L270 60 Q280 60 280 70 L280 120 Z"/>
<rect class="k-glass" x="190" y="72" width="50" height="30" rx="4"/>
<!-- feet -->
<rect class="k-part-h" x="98" y="242" width="6" height="12"/><rect class="k-part" x="90" y="254" width="22" height="8" rx="2"/>
<rect class="k-part-h" x="316" y="242" width="6" height="12"/><rect class="k-part" x="308" y="254" width="22" height="8" rx="2"/>
<!-- caster -->
<circle class="k-rubber" cx="140" cy="254" r="8"/><rect class="k-part" x="132" y="242" width="16" height="6"/>
<circle class="k-rubber" cx="280" cy="254" r="8"/><rect class="k-part" x="272" y="242" width="16" height="6"/>
<!-- seismic bracket -->
<path class="k-yellow" d="M330 236 L360 236 L360 262 L352 262 L352 244 L330 244 Z"/>
<rect class="k-part-h" x="352" y="250" width="8" height="12"/>
<!-- person -->
<circle class="k-skin" cx="450" cy="120" r="12"/>
<path class="k-person" d="M432 262 L434 180 Q434 136 450 136 Q466 136 466 180 L468 262 L456 262 L452 200 L448 200 L444 262 Z"/>
<!-- callouts -->
<line class="k-thin" x1="96" y1="262" x2="80" y2="278"/><text class="tick" x="14" y="290">レベリングフット</text>
<line class="k-thin" x1="134" y1="248" x2="84" y2="200"/><text class="tick" x="80" y="196" text-anchor="end">キャスタ</text><text class="tick" x="80" y="210" text-anchor="end">(搬入用)</text>
<line class="k-thin" x1="354" y1="262" x2="330" y2="280"/><text class="tick" x="326" y="290" text-anchor="end">耐震金具</text>
<line class="k-thin" x1="215" y1="60" x2="215" y2="40"/><text class="tick" x="219" y="40">チャンバ (重量物)</text>
<line class="k-thin" x1="200" y1="175" x2="200" y2="210"/><text class="tick" x="204" y="212">溶接鋼の主フレーム</text>
<text class="tick" x="450" y="282" text-anchor="middle">身長 1.7 m の目安</text>
</svg>
<p class="tb-caption">図: キャスタで搬入し、レベリングフットで荷重を受けて水平を出し、耐震金具で床に固定する</p>

<h2>重量物の取付けとレベル出し</h2>
<ul>
<li><b>荷重経路</b>: チャンバの荷重は、フレームの柱の真上で受ける (梁の中央に載せない)。梁のたわみが内部機構の位置ずれになる</li>
<li><b>3 点支持</b>: 精密なユニットはフレームに 3 点で載せ、フレームのねじれを伝えない (4 点目以降は調整式で軽く受ける)</li>
<li><b>レベリングフット</b>: 床の凹凸を吸収し、全荷重を受ける。キャスタは搬入専用で、設置後は床から浮かせる。フット 1 個の荷重 = 総重量 / 実際に接地している個数で、4 点支持でも床の傾きで 3 点に偏ることを考えて定格を選ぶ</li>
<li><b>床荷重</b>: クリーンルームのフリーアクセス床 (二重床) や梁の許容荷重を、建屋側と確認する。必要なら架台 (床下の支持台) を設ける</li>
</ul>

<h2>耐震 — 地震の水平力と転倒</h2>
<p>地震時、装置には重心に<b>水平力 F<sub>H</sub> = k<sub>H</sub> × W</b> (k<sub>H</sub>: 設計用水平震度、W: 重量) と鉛直力 F<sub>V</sub> が作用すると考えて、床へのアンカーボルトを設計します。設計用震度は、建築設備の耐震設計の指針・建屋の階・顧客の基準によって決まるので、<b>以下の値は計算の練習用の例</b>です。</p>
<svg class="tb-chart" viewBox="0 0 520 260" role="img" aria-label="地震の水平力による転倒モーメントとアンカーボルトの引抜き力">
<text class="k-title" x="260" y="20" text-anchor="middle">転倒の力のつり合い</text>
<rect class="k-ground" x="60" y="210" width="380" height="10"/><line class="k-edge" x1="60" y1="210" x2="440" y2="210"/>
<rect class="k-alu" x="150" y="60" width="200" height="150" rx="4"/>
<circle class="k-badge" cx="250" cy="120" r="6"/>
<text class="tick" x="262" y="114">G (重心)</text>
<path class="k-force" d="M250 120 L330 120" marker-end="url(#k-arrow-r)"/>
<text class="k-bad-t" x="335" y="116">F<tspan dy="3" font-size="9">H</tspan></text>
<path class="k-force" d="M250 120 L250 180" marker-end="url(#k-arrow-r)"/>
<text class="tick" x="256" y="176">W − F<tspan dy="3" font-size="9">V</tspan></text>
<!-- anchors -->
<rect class="k-part-h" x="156" y="200" width="8" height="30"/><rect class="k-part-h" x="336" y="200" width="8" height="30"/>
<path class="k-move" d="M160 240 L160 252"/>
<path class="k-force" d="M160 230 L160 250" marker-end="url(#k-arrow-r)"/>
<text class="tick" x="150" y="248" text-anchor="end">引抜き R<tspan dy="3" font-size="9">b</tspan></text>
<circle class="k-edge" cx="340" cy="210" r="4"/>
<text class="tick" x="348" y="248">転倒の支点</text>
<!-- dims -->
<line class="k-ext" x1="150" y1="120" x2="110" y2="120"/>
<line class="k-dimline" x1="116" y1="120" x2="116" y2="210"/>
<text class="k-dimtext" x="110" y="170" text-anchor="end">h<tspan dy="3" font-size="9">G</tspan></text>
<line class="k-dimline" x1="160" y1="40" x2="340" y2="40"/>
<line class="k-ext" x1="160" y1="36" x2="160" y2="60"/><line class="k-ext" x1="340" y1="36" x2="340" y2="60"/>
<text class="k-dimtext" x="250" y="36" text-anchor="middle">ℓ (ボルトスパン)</text>
<line class="k-dimline" x1="250" y1="196" x2="340" y2="196"/>
<text class="k-dimtext" x="295" y="192" text-anchor="middle">ℓ<tspan dy="3" font-size="9">G</tspan></text>
</svg>
<p class="tb-caption">図: 水平力が重心を押し、反対側のボルト列を支点に転倒しようとする。引抜き側のボルトがこれに抵抗する</p>
<div class="tb-example">
<p><b>計算例</b> (震度は例): 質量 2000 kg (W = 19.6 kN)、k<sub>H</sub> = 1.0、F<sub>V</sub> = F<sub>H</sub>/2、重心高さ h<sub>G</sub> = 0.9 m、転倒方向のボルトスパン ℓ = 0.7 m、支点から重心までの水平距離 ℓ<sub>G</sub> = 0.35 m、ボルト総数 n = 4 本、片側 n<sub>t</sub> = 2 本。</p>
<p>F<sub>H</sub> = 1.0 × 19.6 = <b>19.6 kN</b>、F<sub>V</sub> = 9.81 kN<br>
転倒モーメント = F<sub>H</sub> × h<sub>G</sub> = 19.6 × 0.9 = <b>17.7 kN·m</b><br>
抵抗モーメント = (W − F<sub>V</sub>) × ℓ<sub>G</sub> = 9.81 × 0.35 = <b>3.43 kN·m</b><br>
→ 転倒モーメントの方が大きいので、<b>固定しなければ転倒</b>します。<br>
ボルト 1 本の引抜き力 R<sub>b</sub> = (F<sub>H</sub> h<sub>G</sub> − (W − F<sub>V</sub>) ℓ<sub>G</sub>) / (ℓ × n<sub>t</sub>) = (17.66 − 3.43) / (0.7 × 2) ≈ <b>10.2 kN</b><br>
ボルト 1 本のせん断力 = F<sub>H</sub> / n = 19.6 / 4 ≈ <b>4.9 kN</b></p>
<p>k<sub>H</sub> = 0.6 なら転倒モーメント 10.6 kN·m、R<sub>b</sub> ≈ 4.1 kN、せん断 2.9 kN です。アンカーボルトとその床側 (コンクリート・二重床の架台) の許容値を確認し、<b>フレーム側の耐震金具・溶接・ボルトにも同じ力</b>が流れることを確認します。</p>
</div>
<p>背の高い装置ほど h<sub>G</sub> が大きく不利です。<b>重いもの (ポンプ・電源・チャンバ) を低く置く</b>、ボルトスパンを広げる、が基本です。耐震金具はレベリングフットでの高さ調整後に固定するので、長穴やシムで高さを吸収できるようにします。</p>

<h2>外装カバーとパネル</h2>
<ul>
<li><b>開け方</b>: よく開ける面はヒンジ扉、まれに開ける面は取り外しパネル。扉には開き止め (ステー)、パネルには落下防止の引っ掛けを付ける</li>
<li><b>インターロック</b>: 危険源 (高電圧・可動部・高温) に通じる扉は、開くと停止するインターロックスイッチ、または工具がないと開かない固定にする (「安全」の章の考え方)</li>
<li><b>大きさと重さ</b>: 1 人で扱えるパネル重量と大きさにする。取っ手を付ける</li>
<li><b>気流</b>: クリーンルームの気流と装置内の排気の流れを妨げない開口・ルーバ</li>
</ul>

<h2>保守スペースとスルーザウォール</h2>
<svg class="tb-chart" viewBox="0 0 520 220" role="img" aria-label="クリーンルームと保守エリアの壁を貫通して設置する装置の平面図">
<text class="k-title" x="260" y="20" text-anchor="middle">スルーザウォール設置 (平面図)</text>
<rect x="20" y="40" width="220" height="160" style="fill:var(--tb-accent)" opacity="0.07"/>
<text class="lbl" x="130" y="60" text-anchor="middle">クリーンルーム (清浄側)</text>
<text class="lbl" x="390" y="60" text-anchor="middle">保守エリア (グレー側)</text>
<rect class="k-cut" x="236" y="36" width="10" height="70"/><rect class="k-cut" x="236" y="160" width="10" height="44"/>
<rect class="k-alu" x="180" y="106" width="220" height="54" rx="4"/>
<rect class="k-part" x="150" y="112" width="30" height="42" rx="3"/>
<text class="tick" x="165" y="176" text-anchor="middle">搬入口</text>
<text class="tick" x="320" y="138" text-anchor="middle">装置本体</text>
<rect x="400" y="96" width="90" height="74" style="fill:none;stroke:var(--tb-warn);stroke-dasharray:5 3;stroke-width:1.5"/>
<text class="tick" x="445" y="188" text-anchor="middle">保守スペース</text>
<text class="tick" x="445" y="136" text-anchor="middle">ユーティリティ</text>
<text class="tick" x="445" y="150" text-anchor="middle">接続 (背面)</text>
</svg>
<p class="tb-caption">図: 操作と搬入は清浄側、保守と配管接続はグレー側。壁の貫通部は隙間をシールする</p>
<p>装置の前面 (ウェーハの搬入とオペレータ操作) だけをクリーンルームに出し、本体と保守作業を壁の裏の保守エリアに置く方式が<b>スルーザウォール</b>です。清浄度の高い空間を小さくでき、保守作業の発じんがクリーンルームに入りません。ユーティリティ (電源・冷却水・ガス・排気) は<b>背面にまとめて接続</b>し、設置図に接続位置・サイズ・必要量を明記します。保守スペースは、部品 (チャンバの蓋、ポンプ) を外して置く場所と人の作業姿勢を含めて確保します。</p>

<h3>よくある失敗</h3>
<ul>
<li>チャンバを梁の中央に載せ、梁のたわみで搬送位置がずれる</li>
<li>キャスタに荷重をかけたまま運用し、振動・ずれ・キャスタの破損</li>
<li>耐震固定をボルトの強度だけで確認し、床側 (アンカー・二重床) が先に壊れる計算になっていない</li>
<li>保守で外す部品の置き場・吊り具の空間がなく、隣の装置との間隔が足りない</li>
</ul>

<h3>設計チェックリスト</h3>
<ul>
<li>重量物の荷重経路が柱で受けられ、精密ユニットは 3 点支持か</li>
<li>レベリングフットの定格を偏荷重 (3 点接地) で確認したか</li>
<li>設計用震度を顧客・建屋基準で確認し、転倒・引抜き・せん断を計算したか</li>
<li>扉のインターロック、パネルの重さ・落下防止を考えたか</li>
<li>保守スペース・ユーティリティ接続位置を設置図に示したか</li>
</ul>`,
    points: [
      "主フレームは溶接鋼 (剛性・重量物)、副フレームはアルミ押出材 (軽量・変更容易)",
      "重量物は柱の上で受け、精密ユニットは 3 点支持でフレームのねじれを伝えない",
      "地震の水平力 F_H = k_H × W。転倒モーメント F_H × h_G と抵抗モーメントを比べる",
      "アンカーの引抜き力 R_b = (F_H h_G − (W − F_V) ℓ_G) / (ℓ n_t)",
      "スルーザウォールで清浄側と保守側を分け、ユーティリティは背面にまとめる",
    ],
    exercises: [
      {
        q: "質量 800 kg の装置 (W = 7.85 kN)、k<sub>H</sub> = 0.6 (例)、F<sub>V</sub> = F<sub>H</sub>/2、h<sub>G</sub> = 1.2 m、ℓ = 0.6 m、ℓ<sub>G</sub> = 0.3 m、片側 2 本・計 4 本のとき、ボルト 1 本の引抜き力とせん断力を求めてください。",
        a: "F<sub>H</sub> = 0.6 × 7.85 = 4.71 kN、F<sub>V</sub> = 2.35 kN。<br>転倒モーメント = 4.71 × 1.2 = 5.65 kN·m、抵抗モーメント = (7.85 − 2.35) × 0.3 = 1.65 kN·m。<br>R<sub>b</sub> = (5.65 − 1.65) / (0.6 × 2) ≈ <b>3.3 kN</b>、せん断 = 4.71 / 4 ≈ <b>1.2 kN</b>。背が高く細い装置は軽くても引抜き力が大きくなります。",
      },
      {
        q: "総重量 2000 kg の装置を 4 個のレベリングフットで支えます。床の傾きで 3 点だけで支える場合も考えると、フット 1 個に必要な定格荷重の目安はいくらですか。",
        a: "4 点均等なら 2000 × 9.81 / 4 ≈ 4.9 kN。3 点で支えると、重心の位置によっては 1 個に半分近い荷重がかかります (例えば対角の 2 点に近いと各 50%)。安全側に<b>総重量の 1/2 ≈ 9.8 kN 以上</b>を目安に選び、重心位置から実際の配分を計算して確認します。",
      },
    ],
    quiz: [
      { q: "装置を地震から守る固定で、背の高い装置が不利な理由は?", choices: ["重量が増えるから", "重心が高く、転倒モーメント F_H × h_G が大きいから", "水平力が小さくなるから"], answer: 1, explain: "転倒モーメントは重心高さに比例します。" },
      { q: "設置後のキャスタの扱いとして適切なのは?", choices: ["キャスタで荷重を受けて移動しやすくしておく", "レベリングフットで荷重を受け、キャスタは床から浮かせる", "キャスタを外して捨てる"], answer: 1, explain: "キャスタは搬入用。運用中はフットで支持します (再移設に備えて残すことが多い)。" },
      { q: "スルーザウォール設置の主な利点は?", choices: ["装置が軽くなる", "高清浄の空間を小さくし、保守作業をクリーンルームの外で行える", "耐震固定が不要になる"], answer: 1, explain: "前面だけを清浄側に出し、本体と保守はグレー側に置きます。" },
    ],
  },

  // ------------------------------------------------------------------ 5
  {
    id: "piping-cable-layout",
    part: "equipment",
    title: "装置内の配管・配線のレイアウト設計 — ユーティリティ・可動部・分離",
    minutes: 18,
    level: 3,
    lead: "装置の中には、圧縮空気・冷却水・窒素・排気・電源・信号と、何十本もの配管と配線が走ります。設計の終盤に「空いている所を通す」と、漏れた水が電源にかかる、可動部でケーブルが切れる、保守で外せない、といった問題が出ます。この章ではユーティリティの種類、配置の優先順位、分離と漏れ対策、可動部の配線、3D CAD でのルーティングの進め方を学びます。",
    body: `
<h2>工場から来るユーティリティ</h2>
<table class="tb-table">
<tr><th>ユーティリティ</th><th>用途</th><th>設計上の注意</th></tr>
<tr><td>CDA (清浄乾燥空気)</td><td>空気圧機器 (弁・シリンダ)</td><td>入口にレギュレータ・フィルタ・圧力スイッチ。圧力低下時の挙動を決める</td></tr>
<tr><td>PCW (プロセス冷却水)</td><td>チャンバ・電源・ポンプの冷却</td><td>流量・温度・圧力の監視。漏水対策と凍結・結露</td></tr>
<tr><td>N₂ (窒素)</td><td>ベント・パージ</td><td>純度と圧力。大量放出時の酸欠に注意</td></tr>
<tr><td>排気 (一般・酸・熱)</td><td>筐体内の換気、ガスボックスの排気</td><td>必要な風量・静圧を設置図に明記。排気の種類を混ぜない</td></tr>
<tr><td>電源</td><td>装置全体</td><td>主ブレーカ、容量、接地。電源ケーブルの入口を 1 か所に</td></tr>
</table>
<p>プロセスガス (可燃性・毒性ガス) の配管とガスボックスは、ガス供給の章で扱う専用の設計・安全基準に従います。</p>

<h3>計算例 — 冷却水の流量と配管</h3>
<div class="tb-example">
<p>発熱 3 kW の電源を、入口と出口の温度差 ΔT = 5 K の冷却水で冷やします。<br>
質量流量 ṁ = Q / (c ΔT) = 3000 / (4180 × 5) ≈ 0.144 kg/s → 体積流量 ≈ <b>8.6 L/min</b>。<br>
内径 10 mm のチューブなら流速 v = 0.144 / 998 / (π/4 × 0.010²) ≈ <b>1.8 m/s</b>。</p>
<p>流速が大きいと圧力損失と騒音・浸食が増えるので、許容流速は管材と継手のメーカー推奨で確認します。並列に複数の負荷をつなぐときは、<b>各枝の流量が配管抵抗で偏る</b>ので、流量計 (または流量スイッチ) と絞り弁を各枝に付けます。</p>
</div>

<h2>配置の優先順位</h2>
<p>ルーティングは、<b>曲げにくく太いものから先に</b>通します。</p>
<ol>
<li>排気ダクト (太い・曲げにくい・経路が限られる)</li>
<li>真空配管・ガス配管 (溶接・継手の位置が決まる)</li>
<li>冷却水の配管・ホース</li>
<li>電源ケーブル</li>
<li>空気圧チューブ、信号ケーブル (細く柔らかい)</li>
</ol>
<p>3D CAD では、まず<b>配管・配線の通り道 (ルートの空間)</b> を「予約」のボリュームとしてモデルに置き、機構設計者と取り合いを決めてから、個々の配管・配線を詳細化します。</p>

<h2>分離と漏れ対策 — 水と電気を混ぜない</h2>
<svg class="tb-chart" viewBox="0 0 520 280" role="img" aria-label="装置の断面で、電気は上、水は下に分け、ドリップパンと漏水センサを置く">
<text class="k-title" x="260" y="20" text-anchor="middle">上下の分離 — 電気は上、液体は下</text>
<rect class="k-ground" x="30" y="252" width="460" height="10"/><line class="k-edge" x1="30" y1="252" x2="490" y2="252"/>
<rect class="k-panel" x="40" y="36" width="440" height="216" rx="6"/>
<!-- electrical tray -->
<rect class="k-part" x="60" y="56" width="400" height="10" rx="2"/>
<path class="k-copper" d="M66 52 Q200 46 454 52" style="fill:none;stroke-width:4"/>
<path class="k-edge" d="M66 58 Q250 54 454 58" style="stroke:var(--tb-accent);stroke-width:2.5;fill:none"/>
<text class="lbl" x="70" y="84">ケーブルトレイ (電源・信号)</text>
<!-- electrical boxes -->
<rect class="k-alu" x="340" y="90" width="110" height="60" rx="4"/>
<rect class="k-led-g" x="350" y="98" width="10" height="6" rx="1"/>
<text class="tick" x="395" y="132" text-anchor="middle">電源ユニット</text>
<!-- pipes below -->
<rect class="k-part-h" x="60" y="196" width="400" height="8" rx="4"/>
<rect class="k-part-h" x="60" y="210" width="400" height="8" rx="4"/>
<text class="tick" x="70" y="190">冷却水 (供給 / 戻り)</text>
<!-- drip pan -->
<path class="k-alu" d="M50 228 L54 240 L466 240 L470 228 L462 228 L460 236 L60 236 L58 228 Z"/>
<rect class="k-led-r" x="420" y="230" width="18" height="6" rx="1"/>
<line class="k-thin" x1="429" y1="230" x2="440" y2="170"/><text class="tick" x="444" y="168" text-anchor="start">漏水</text>
<text class="tick" x="444" y="182" text-anchor="start">センサ</text>
<line class="k-thin" x1="150" y1="238" x2="130" y2="160"/><text class="tick" x="80" y="152">ドリップパン</text>
<!-- drop -->
<path d="M260 222 Q256 228 260 232 Q264 228 260 222 Z" style="fill:var(--tb-accent)"/>
</svg>
<p class="tb-caption">図: 液体は電気の下を通し、継手の下にはドリップパンと漏水センサ。漏れを検知したら給水弁を閉じて装置を止める</p>
<ul>
<li><b>上下の分離</b>: 液体配管を電気品の上に通さない。どうしても交差する場合は継手を置かず、カバーで覆う</li>
<li><b>継手の位置</b>: 漏れは継手から起きる。継手はドリップパンの上にまとめ、点検できる位置に</li>
<li><b>漏水センサ</b>: ドリップパンの低い所に置き、検知で給水遮断弁を閉じる。センサが濡れたら自動で装置停止</li>
<li><b>電気の分離</b>: 電源 (動力) と信号ケーブルを別ダクトにするか距離を取り、ノイズの結合を避ける</li>
<li><b>ガスの分離</b>: 可燃性・支燃性・毒性などガスの種類ごとに区画と排気を分ける (ガス供給の章)</li>
</ul>

<h2>ホースとケーブルの曲げ</h2>
<p>ホースもケーブルも<b>最小曲げ半径</b>が決まっています。固定配線と可動配線で値が違い、可動配線ではより大きな半径が必要です (ケーブルの可動用途では外径の 7〜10 倍程度が例として多いが、<b>製品の仕様を必ず確認</b>)。継手の直後で急に曲げると継手部に応力が集中するので、継手から直線部を取ってから曲げます。</p>
<svg class="tb-chart" viewBox="0 0 520 240" role="img" aria-label="ケーブルキャリアによる可動配線と、悪い曲げの比較">
<text class="k-title" x="260" y="20" text-anchor="middle">可動部の配線 — ケーブルキャリア</text>
<rect class="k-panel" x="12" y="32" width="320" height="196" rx="8"/>
<rect class="k-panel" x="344" y="32" width="164" height="196" rx="8"/>
<text class="k-good-t" x="172" y="52" text-anchor="middle">良い例: 曲げ半径を一定に保つ</text>
<text class="k-bad-t" x="426" y="52" text-anchor="middle">悪い例</text>
<!-- carrier -->
<rect class="k-part" x="30" y="190" width="290" height="8"/>
<path class="k-rubber" d="M40 182 L210 182 A 40 40 0 0 0 210 102 L120 102 L120 110 L210 110 A 32 32 0 0 1 210 174 L40 174 Z"/>
<g class="k-thin"><line x1="60" y1="174" x2="60" y2="182"/><line x1="90" y1="174" x2="90" y2="182"/><line x1="120" y1="174" x2="120" y2="182"/><line x1="150" y1="174" x2="150" y2="182"/><line x1="180" y1="174" x2="180" y2="182"/><line x1="160" y1="102" x2="160" y2="110"/><line x1="190" y1="102" x2="190" y2="110"/></g>
<rect class="k-alu" x="96" y="84" width="60" height="18" rx="3"/>
<text class="tick" x="126" y="78" text-anchor="middle">可動ステージ</text>
<path class="k-move" d="M100 70 L60 70" marker-end="url(#k-arrow)"/>
<line class="k-ext" x1="210" y1="142" x2="290" y2="142"/><line class="k-ext" x1="250" y1="182" x2="290" y2="182"/>
<line class="k-dimline" x1="280" y1="142" x2="280" y2="182"/>
<text class="k-dimtext" x="286" y="166">R</text>
<text class="tick" x="172" y="216" text-anchor="middle">端部をしっかり固定、中では動ける</text>
<!-- bad -->
<path d="M370 190 C 420 190, 420 120, 380 130 C 350 140, 440 90, 480 80" style="fill:none;stroke:var(--tb-bad);stroke-width:4"/>
<text class="tick" x="426" y="210" text-anchor="middle">ねじれ・急曲げ</text>
</svg>
<p class="tb-caption">図: ケーブルキャリア (ケーブルベア) は曲げ半径を一定に保ち、ねじれを防ぐ。キャリア内のケーブルは詰め込みすぎない</p>
<ul>
<li>可動用 (高屈曲) のケーブルを選び、ケーブルキャリアの中では<b>両端で固定・中間は拘束しない</b></li>
<li>真空中の可動配線は、アウトガスの少ない被覆の製品を選び、擦れによる発じんを避ける。真空中を動かさず、ベローズや導入機で大気側に出せないか先に検討する</li>
<li>クリーンエリアの可動配線は、発じんの少ないキャリア・ケーブルを使い、配線の真下にウェーハが来ない配置にする</li>
</ul>

<h2>ラベル・色・図面</h2>
<ul>
<li>配管には<b>流体名と流れの向き</b>を表示、ケーブルには両端に同じ番号 (配線図と一致)</li>
<li>供給・戻りの取り違えを防ぐため、継手のサイズや種類を変える (誤接続しにくい設計)</li>
<li>配管系統図 (P&amp;ID) と配線図を正とし、3D モデルの名前・番号を図面とそろえる</li>
</ul>

<h2>3D CAD でのルーティングの実務</h2>
<p>配管・配線は 3D モデルに入れてはじめて干渉が分かります。最低限、<b>太い配管・ダクト・ケーブル束の外形</b>と、<b>継手・コネクタを外すための手と工具の空間</b>をモデルに入れます。ケーブル束は曲げ半径を守ったスイープ形状で表し、可動部は両端の位置 (ストロークの両端) で干渉チェックします。部品表には配管・ケーブルの長さを余裕込みで出し、現物合わせになる部分は図面に「現合」と明記します。</p>

<h3>よくある失敗</h3>
<ul>
<li>配管を最後に考え、継手が電源ユニットの真上に来る</li>
<li>並列の冷却水回路で流量が偏り、末端のチャンバだけ冷えない</li>
<li>可動ケーブルに固定用ケーブルを使い、数か月で断線</li>
<li>ホースを継手の直後で曲げて漏れる、保守で継手に手が入らない</li>
</ul>

<h3>設計チェックリスト</h3>
<ul>
<li>ユーティリティの種類・接続位置・必要量 (流量・圧力・風量・電力) を設置図に書いたか</li>
<li>太い・曲げにくいものから通路を予約したか</li>
<li>液体と電気の上下分離、ドリップパン・漏水センサ・遮断弁があるか</li>
<li>最小曲げ半径 (固定/可動) を製品仕様で確認し、可動部の両端で干渉を見たか</li>
<li>ラベル・番号を系統図・配線図とそろえたか</li>
</ul>`,
    points: [
      "ユーティリティ: CDA・PCW・N₂・排気・電源。接続位置と必要量を設置図に",
      "冷却水量 ṁ = Q / (c ΔT)。並列回路は流量計と絞りで偏りを防ぐ",
      "太く曲げにくいもの (ダクト・配管) から通路を予約する",
      "液体は電気の下。継手の下にドリップパンと漏水センサ",
      "可動配線は高屈曲ケーブルとキャリアで曲げ半径を保つ",
    ],
    exercises: [
      {
        q: "発熱 1.5 kW のチャンバを、温度上昇 3 K の冷却水で冷やすのに必要な流量 (L/min) を求めてください (c = 4180 J/kgK、ρ = 998 kg/m³)。",
        a: "ṁ = 1500 / (4180 × 3) ≈ 0.120 kg/s。体積流量 = 0.120 / 998 × 60000 ≈ <b>7.2 L/min</b>。",
      },
      {
        q: "外径 12 mm のケーブルをケーブルキャリアで動かします。製品仕様の可動時最小曲げ半径が「外径の 10 倍」のとき、キャリアの曲げ半径はいくら以上にしますか。また、同じキャリアに外径 8 mm のケーブル (仕様: 7.5 倍) を入れる場合は?",
        a: "12 × 10 = <b>120 mm 以上</b>。8 mm のケーブルは 8 × 7.5 = 60 mm で足りますが、キャリアの曲げ半径は 1 つなので、<b>最も厳しいケーブルに合わせて 120 mm 以上</b>にします。",
      },
    ],
    quiz: [
      { q: "配管・配線のルーティングで最初に通路を決めるべきものは?", choices: ["信号ケーブル", "排気ダクトのような太く曲げにくいもの", "空気圧チューブ"], answer: 1, explain: "曲げにくく太いものほど経路の自由度が小さいので先に決めます。" },
      { q: "冷却水配管と電源ユニットの配置として適切なのは?", choices: ["配管を電源ユニットの上に通す", "配管を電源ユニットの下に通し、継手の下にドリップパン", "配管と電源ユニットを同じダクトに入れる"], answer: 1, explain: "液体は電気の下に。漏れは継手から起きるのでドリップパンで受けます。" },
      { q: "ケーブルキャリア内の可動ケーブルの固定方法は?", choices: ["全長を結束バンドで固く締める", "両端を固定し、中間は拘束しない", "どこも固定しない"], answer: 1, explain: "中間を拘束するとケーブルが曲げに追従できず、断線の原因になります。" },
    ],
  },

  // ------------------------------------------------------------------ 6
  {
    id: "instrument-hardware",
    part: "equipment",
    title: "分析装置のハードウェア設計 — 鏡筒・試料室・ステージ周り",
    minutes: 20,
    level: 3,
    lead: "電子顕微鏡や表面分析装置のような分析装置では、ビームを作る鏡筒 (カラム)、試料を入れる試料室、試料を動かすステージ、信号を受ける検出器が、ナノメートルの精度で関係を保たなければなりません。この章では、それぞれを「どう取り付けるか」という機械設計の視点で、材料の選び方、試料交換、遮光、熱の流れ、そして試料と鏡筒の相対ドリフトの見積りを学びます。",
    body: `
<h2>全体構成 — 鏡筒と試料室を 1 つの剛体に</h2>
<p>分析装置で大切なのは、<b>ビームの出口 (鏡筒の先端) と試料の相対位置</b>です。鏡筒・試料室・ステージを剛な一体構造にまとめ、その全体を除振台の上に載せます。床の振動は除振台で切り、構造の内部では相対位置がずれないようにします (計測ループの考え方は「計測ループ」の章)。</p>
<svg class="tb-chart" viewBox="0 0 520 330" role="img" aria-label="分析装置の断面。鏡筒、試料室、ロードロック、ステージ、検出器、除振台">
<text class="k-title" x="260" y="20" text-anchor="middle">分析装置の構成 (断面の概略)</text>
<rect class="k-ground" x="30" y="300" width="460" height="10"/><line class="k-edge" x1="30" y1="300" x2="490" y2="300"/>
<!-- isolators -->
<rect class="k-rubber" x="110" y="270" width="40" height="30" rx="8"/>
<rect class="k-rubber" x="330" y="270" width="40" height="30" rx="8"/>
<!-- base plate -->
<rect class="k-cut" x="80" y="252" width="320" height="18"/>
<!-- chamber -->
<rect class="k-cut" x="120" y="150" width="14" height="102"/>
<rect class="k-cut" x="346" y="150" width="14" height="102"/>
<rect class="k-cut" x="120" y="138" width="240" height="14"/>
<!-- column -->
<path class="k-alu" d="M210 138 L210 70 Q210 52 228 52 L252 52 Q270 52 270 70 L270 138 Z"/>
<rect class="k-copper" x="214" y="80" width="52" height="14" rx="3"/>
<rect class="k-copper" x="214" y="104" width="52" height="14" rx="3"/>
<path class="k-alu" d="M222 152 L258 152 L248 170 L232 170 Z"/>
<line class="k-center" x1="240" y1="40" x2="240" y2="230"/>
<!-- stage -->
<rect class="k-part" x="170" y="230" width="140" height="22"/>
<rect class="k-alu" x="186" y="212" width="108" height="18" rx="2"/>
<rect class="k-accent" x="220" y="204" width="40" height="8" rx="1"/>
<!-- detector -->
<path class="k-part" d="M300 168 L340 180 L340 196 L296 186 Z"/>
<rect class="k-part-h" x="340" y="182" width="40" height="10"/>
<!-- load lock -->
<rect class="k-cut" x="40" y="190" width="80" height="10"/><rect class="k-cut" x="40" y="236" width="80" height="10"/>
<rect class="k-cut" x="30" y="190" width="10" height="56"/>
<rect class="k-part" x="114" y="200" width="8" height="36"/>
<rect class="k-part-h" x="0" y="214" width="30" height="8"/>
<!-- callouts -->
<line class="k-thin" x1="270" y1="66" x2="320" y2="56"/><text class="tick" x="324" y="58">鏡筒 (カラム)</text>
<line class="k-thin" x1="266" y1="88" x2="320" y2="86"/><text class="tick" x="324" y="88">レンズ (コイル)</text>
<line class="k-thin" x1="360" y1="188" x2="410" y2="168"/><text class="tick" x="414" y="166">検出器</text>
<line class="k-thin" x1="240" y1="207" x2="410" y2="214"/><text class="tick" x="414" y="216">試料</text>
<line class="k-thin" x1="300" y1="242" x2="410" y2="242"/><text class="tick" x="414" y="244">ステージ</text>
<line class="k-thin" x1="70" y1="190" x2="60" y2="172"/><text class="tick" x="40" y="168">ロードロック</text>
<line class="k-thin" x1="350" y1="285" x2="410" y2="285"/><text class="tick" x="414" y="288">除振マウント</text>
<line class="k-thin" x1="122" y1="218" x2="96" y2="268"/><text class="tick" x="20" y="285">仕切弁</text>
</svg>
<p class="tb-caption">図: 鏡筒は試料室の天板に、ステージは試料室の底板に取り付ける。天板と底板を結ぶ壁がドリフトの経路になる</p>

<h2>鏡筒の取付け</h2>
<ul>
<li><b>剛な台座に、短い片持ちで</b>: 鏡筒は細長い片持ちの構造で、固有振動数が低くなりがち。根元の取付面を広く・剛にし、高さを抑える</li>
<li><b>位置合わせ</b>: 鏡筒の軸と試料室の基準を合わせるため、はめあい (インロー) やピンで位置決めし、調整が必要なら調整ねじで動かした後に固定する</li>
<li><b>真空シール</b>: 鏡筒と試料室の間のシールは、O リングのつぶしで鏡筒が傾かないよう、金属同士の当たり面 (メタルタッチ) で位置を決め、O リングは溝の中で潰す</li>
</ul>

<h2>試料室とロードロック・試料交換</h2>
<p>試料を交換するたびに試料室全体を大気にすると、真空の回復に時間がかかり、汚染も増えます。そこで小さな<b>ロードロック室</b>を仕切弁で隔てて設け、試料はロードロックだけを大気にして出し入れします。</p>
<ul>
<li><b>試料ホルダの受け渡し</b>: トランスファロッド (磁気カップリング式やベローズ式) でホルダを押し込み、ステージの受け (あり溝・ばね押さえ) にはめる。受けは「入れる方向に案内があり、最後に確実に固定される」形状にする</li>
<li><b>ステージのはめあい</b>: ホルダの固定は、ドリフトの原因になる「緩い保持」にしない。ばね押さえの力と、熱で緩まない材料の組合せを選ぶ</li>
<li><b>インターロック</b>: ロッドが挿入中は仕切弁を閉じない、ステージは交換位置にいるときだけ受け渡しを許可</li>
</ul>

<svg class="tb-chart" viewBox="0 0 520 250" role="img" aria-label="試料ホルダの受けの断面。あり溝のガイドとばね押さえで固定">
<text class="k-title" x="260" y="20" text-anchor="middle">試料ホルダの受け渡し (断面)</text>
<rect class="k-cut" x="60" y="170" width="300" height="20"/>
<path class="k-cut" d="M120 170 L120 150 L130 140 L136 140 L136 170 Z"/>
<path class="k-cut" d="M300 170 L300 150 L290 140 L284 140 L284 170 Z"/>
<path class="k-alu" d="M140 168 L280 168 L280 150 L286 142 L134 142 L140 150 Z"/>
<rect class="k-accent" x="180" y="134" width="60" height="8" rx="1"/>
<path class="k-edge" d="M296 120 L320 120 L320 140 L306 140 Q300 134 292 140" style="stroke-width:2;fill:none"/>
<rect class="k-part" x="300" y="112" width="40" height="10" rx="2"/>
<path class="k-force" d="M296 112 L296 136" marker-end="url(#k-arrow-r)"/>
<rect class="k-part-h" x="380" y="148" width="120" height="10"/>
<rect class="k-alu" x="360" y="142" width="22" height="22" rx="3"/>
<path class="k-move" d="M470 132 L400 132" marker-end="url(#k-arrow)"/>
<line class="k-center" x1="210" y1="100" x2="210" y2="210"/>
<line class="k-thin" x1="210" y1="134" x2="160" y2="100"/><text class="tick" x="156" y="96" text-anchor="end">試料</text>
<line class="k-thin" x1="250" y1="160" x2="230" y2="222"/><text class="tick" x="226" y="232" text-anchor="end">ホルダ (あり形)</text>
<line class="k-thin" x1="128" y1="160" x2="80" y2="130"/><text class="tick" x="76" y="126" text-anchor="end">ガイド</text>
<line class="k-thin" x1="330" y1="112" x2="360" y2="90"/><text class="tick" x="364" y="88">ばね押さえ</text>
<text class="tick" x="440" y="182" text-anchor="middle">トランスファロッド</text>
<text class="tick" x="300" y="232">ステージ上板</text>
</svg>
<p class="tb-caption">図: あり形のガイドで高さと傾きを決め、ばねで基準面に押し付ける。押し付け力の方向が基準面に向いていることが確実な固定の条件</p>

<h2>材料の選び方 — 磁性と非磁性</h2>
<p>電子ビームやイオンビームは磁場で曲がります。ビームの近く (鏡筒の先端・試料周り) の部品は<b>非磁性材料</b>を使います。</p>
<table class="tb-table">
<tr><th>材料</th><th>磁性</th><th>注意</th></tr>
<tr><td>オーステナイト系ステンレス (SUS304・SUS316L など)</td><td>基本は非磁性</td><td>冷間加工・溶接で一部が磁性を帯びることがある。SUS316L の方が安定しやすい。重要部は透磁率を測定・指定</td></tr>
<tr><td>アルミ合金・銅合金・チタン</td><td>非磁性</td><td>アルミは軽くて熱を伝えやすいが、熱膨張が大きい</td></tr>
<tr><td>炭素鋼・フェライト系ステンレス・ニッケルめっき</td><td>磁性</td><td>ビームの近くでは使わない。ねじ・ばね・めっきも見落としやすい</td></tr>
</table>
<p>逆に、外部磁場 (地磁気・近くの機器) を遮るための<b>磁気シールド</b>には高透磁率の材料を使います。ねじ・ばね・ベアリングのような購入部品の材料も、図面と部品表で指定します。</p>

<h2>検出器の取付けと調整</h2>
<p>検出器は試料に対する<b>距離と角度</b>で信号が変わります。取付けは、ポートのフランジに対して 1〜2 軸の調整 (挿入量の直動、角度) ができるようにし、調整後はロックする構造にします。挿入式の検出器はステージと衝突しやすいので、<b>退避位置センサ</b>とステージ移動のインターロックを設けます。</p>

<h2>遮光と熱の通り道</h2>
<ul>
<li><b>遮光</b>: 光を検出する装置では、覗き窓に蓋、継手のすき間にラビリンス、内面は黒色処理。真空用の黒色処理はアウトガスを確認する</li>
<li><b>熱</b>: レンズのコイル・ステージのモータ・検出器の冷却は熱源。熱を<b>試料室に流さない</b>経路 (冷却水で持ち去る、断熱スペーサ) を設計し、通電を一定にして熱を安定させる</li>
</ul>

<h2>計算例 — ステージと鏡筒の相対ドリフト</h2>
<div class="tb-example">
<p>試料室の底板を基準に、鏡筒の先端までは<b>SUS 製の壁と鏡筒 (高さ 200 mm、α = 17.3 × 10⁻⁶ /K)</b>、試料面までは<b>アルミ製のステージ (高さ 80 mm、α = 23 × 10⁻⁶ /K)</b> とします。装置全体が一様に ΔT = 0.05 K 変化したとき、鏡筒先端と試料面の高さ方向の相対変化は</p>
<p>δ = (α<sub>1</sub> L<sub>1</sub> − α<sub>2</sub> L<sub>2</sub>) ΔT = (17.3 × 200 − 23 × 80) × 10⁻⁶ mm/K × 0.05 K = (3.46 − 1.84) × 10⁻³ mm/K × 0.05 = 8.1 × 10⁻⁵ mm = <b>81 nm</b>。</p>
<p>ステージの熱膨張を鏡筒側と<b>打ち消す</b>には α<sub>2</sub> L<sub>2</sub> = α<sub>1</sub> L<sub>1</sub>、つまりアルミの高さを 17.3 × 200 / 23 ≈ <b>150 mm</b> にすれば一様な温度変化では相対ドリフトが 0 になります (熱補償設計)。ただし実際には温度は一様でなく、時定数も部品で違うので、打ち消しは一部にとどまります。</p>
<table class="tb-table">
<tr><th>ドリフト要因 (例)</th><th>量</th></tr>
<tr><td>熱膨張 (上の計算、補償なし)</td><td>81 nm</td></tr>
<tr><td>ステージの機械的ドリフト (ねじ・ガイドの緩和)</td><td>30 nm</td></tr>
<tr><td>試料ホルダの保持の緩み</td><td>20 nm</td></tr>
<tr><td>鏡筒取付け部のクリープ</td><td>15 nm</td></tr>
<tr><td><b>合計 (二乗和平方根)</b></td><td><b>約 90 nm</b></td></tr>
</table>
<p>独立な要因は二乗和平方根で見積もります (単純和では 146 nm)。熱膨張が支配的なので、まず材料の組合せと温度安定化 (「熱的安定性」の章) に手を打ちます。</p>
</div>

<h3>よくある失敗</h3>
<ul>
<li>ビーム近くに磁性のねじやニッケルめっき部品を使い、像がずれる・ゆがむ</li>
<li>溶接・曲げ加工した SUS304 部品が磁性を帯びていた</li>
<li>試料ホルダの保持が弱く、観察中に試料が少しずつ動く</li>
<li>挿入式検出器とステージが衝突する</li>
<li>コイルやモータの熱が試料室に流れ、通電パターンの変化でドリフトする</li>
</ul>

<h3>設計チェックリスト</h3>
<ul>
<li>鏡筒・試料室・ステージが剛な一体構造で、除振台の上にあるか</li>
<li>ビーム近傍の全部品 (ねじ・ばね・めっき・購入品) が非磁性か</li>
<li>ロードロックと試料交換のインターロック、ホルダの確実な固定</li>
<li>検出器の調整機構・ロック・退避インターロック</li>
<li>熱源の熱の逃げ道と、相対ドリフトの見積り</li>
</ul>`,
    points: [
      "ビーム出口と試料の相対位置が命。鏡筒・試料室・ステージを剛な一体構造に",
      "ロードロックで試料室を大気にせず交換し、ホルダは確実に固定する",
      "ビーム近傍は非磁性材料。オーステナイト系ステンレスも加工で磁性を帯びることがある",
      "相対ドリフト δ = (α₁L₁ − α₂L₂) ΔT。材料と長さの組合せで熱補償できる",
      "独立なドリフト要因は二乗和平方根で見積もる",
    ],
    exercises: [
      {
        q: "鏡筒側の経路が SUS (α = 17.3 × 10⁻⁶ /K) 250 mm、試料側がチタン合金 (α = 8.6 × 10⁻⁶ /K) 100 mm のとき、一様に 0.1 K 変化したときの相対ドリフトを求めてください。",
        a: "δ = (17.3 × 250 − 8.6 × 100) × 10⁻⁶ × 0.1 mm = (4325 − 860) × 10⁻⁷ mm = 3.47 × 10⁻⁴ mm ≈ <b>347 nm</b>。チタンは膨張が小さいため、鏡筒側の膨張を打ち消しにくい組合せです。",
      },
      {
        q: "ドリフト要因が 50 nm、40 nm、20 nm (互いに独立) のとき、合計を二乗和平方根と単純和で求めてください。",
        a: "二乗和平方根 = √(50² + 40² + 20²) = √4500 ≈ <b>67 nm</b>。単純和 = <b>110 nm</b>。最大要因 (50 nm) を減らすのが最も効果的です。",
      },
    ],
    quiz: [
      { q: "電子ビームの近くに使う部品として避けるべきものは?", choices: ["アルミ合金", "無酸素銅", "ニッケルめっきした鋼のねじ"], answer: 2, explain: "鋼もニッケルも磁性があり、ビームを曲げます。" },
      { q: "ロードロック室を設ける主な目的は?", choices: ["ステージを冷やすため", "試料室を大気にせず試料を交換するため", "鏡筒を軽くするため"], answer: 1, explain: "試料室の真空を保ったまま、小さな部屋だけを大気にして交換します。" },
      { q: "SUS 200 mm とアルミ 80 mm の経路で、一様な温度変化での相対ドリフトを 0 にするには、アルミの長さをどうする?", choices: ["短くする (約 60 mm)", "長くする (約 150 mm)", "長さは関係ない"], answer: 1, explain: "α₂L₂ = α₁L₁ より L₂ = 17.3 × 200 / 23 ≈ 150 mm。" },
    ],
  },

  // ------------------------------------------------------------------ 7
  {
    id: "precision-part-drawing",
    part: "equipment",
    title: "精密部品の図面と加工指示 — 公差・表面・洗浄・梱包の指示",
    minutes: 20,
    level: 3,
    lead: "半導体製造装置や分析装置の部品図には、寸法と公差だけでなく、シール面の性状、バリの扱い、電解研磨や不動態化、精密洗浄、クリーン梱包、材料証明、刻印の制限など、一般機械部品にはない指示が並びます。この章では、それらを図面と注記にどう書くかを、データムの決め方と公差の積上げ計算とあわせて学びます。",
    body: `
<h2>データムの決め方 — 機能から決める</h2>
<p>データムは「その部品が<b>組み付けられたときに何で位置が決まるか</b>」から選びます。真空フランジ付きの部品なら、相手に当たるシール面 (フランジ面) が第 1 データム、位置決めのインロー (はめあい径) が第 2 データム、回り止めのピン穴が第 3 データム、というのが典型です。加工の都合で選んだ面をデータムにすると、加工はしやすくても組立てで機能が保証されません (データムと幾何公差の基本は「幾何公差の詳細 — データムと位置度」の章)。</p>
<svg class="tb-chart" viewBox="0 0 520 300" role="img" aria-label="真空フランジ付き部品の図面例。データム、平面度、表面性状、注記">
<text class="k-title" x="260" y="20" text-anchor="middle">シール面を持つ部品の図示例 (断面)</text>
<!-- part section: flange + tube -->
<path class="k-cut" d="M60 80 L140 80 L140 120 L320 120 L320 140 L140 140 L140 180 L60 180 L60 146 L80 146 L80 114 L60 114 Z"/>
<!-- o-ring groove -->
<rect x="60" y="96" width="8" height="10" style="fill:var(--tb-surface);stroke:var(--k-line);stroke-width:1.2"/>
<line class="k-center" x1="40" y1="130" x2="340" y2="130"/>
<!-- datum A on flange face -->
<line class="k-ext" x1="60" y1="80" x2="60" y2="60"/>
<path d="M54 196 L66 196 L60 186 Z" style="fill:var(--tb-text)"/>
<line class="k-thin" x1="60" y1="196" x2="60" y2="210"/>
<rect class="k-edge" x="50" y="210" width="20" height="18" style="fill:none"/>
<text class="lbl" x="60" y="224" text-anchor="middle">A</text>
<line class="k-ext" x1="60" y1="180" x2="60" y2="186"/>
<!-- flatness frame -->
<line class="k-thin" x1="60" y1="70" x2="100" y2="50"/>
<rect class="k-edge" x="100" y="40" width="70" height="20" style="fill:none"/>
<line class="k-edge" x1="122" y1="40" x2="122" y2="60"/>
<text class="lbl" x="111" y="55" text-anchor="middle">⏥</text>
<text class="lbl" x="146" y="55" text-anchor="middle">0.02</text>
<!-- surface texture symbol -->
<path class="k-edge" d="M14 150 L20 160 L30 136 L52 136" style="fill:none"/>
<text class="tick" x="16" y="130">Ra 0.4</text>
<line class="k-thin" x1="40" y1="136" x2="60" y2="160"/>
<!-- parallelism on other face -->
<line class="k-thin" x1="140" y1="88" x2="200" y2="74"/>
<rect class="k-edge" x="200" y="64" width="110" height="20" style="fill:none"/>
<line class="k-edge" x1="222" y1="64" x2="222" y2="84"/><line class="k-edge" x1="276" y1="64" x2="276" y2="84"/>
<text class="lbl" x="211" y="79" text-anchor="middle">∥</text>
<text class="lbl" x="249" y="79" text-anchor="middle">0.05</text>
<text class="lbl" x="293" y="79" text-anchor="middle">A</text>
<!-- dims -->
<line class="k-ext" x1="140" y1="180" x2="140" y2="250"/><line class="k-ext" x1="60" y1="228" x2="60" y2="250"/>
<line class="k-dimline" x1="60" y1="244" x2="140" y2="244"/>
<text class="k-dimtext" x="100" y="240" text-anchor="middle">20 ±0.05</text>
<!-- notes -->
<rect class="k-panel" x="350" y="150" width="160" height="136" rx="6"/>
<text class="lbl" x="360" y="170">注記</text>
<text class="tick" x="360" y="190">1. 指示なきエッジは C0.2</text>
<text class="tick" x="370" y="204">以下の糸面取り、バリなし</text>
<text class="tick" x="360" y="222">2. A 面に半径方向の</text>
<text class="tick" x="370" y="236">傷のないこと</text>
<text class="tick" x="360" y="254">3. 電解研磨 (接液・真空面)</text>
<text class="tick" x="360" y="272">4. 精密洗浄・二重袋梱包</text>
<text class="tick" x="120" y="102">O リング溝</text>
</svg>
<p class="tb-caption">図: シール面を第 1 データム A とし、平面度と表面性状を直接指示。工程の指示は注記にまとめる (数値は例)</p>

<h2>シール面の幾何公差と表面性状</h2>
<ul>
<li><b>平面度</b>: シール面そのものに平面度を指示。O リングのつぶし量に対して十分小さい値にする</li>
<li><b>平行度・直角度</b>: 部品の反対側の取付面や、ポートの向きをデータム A に対して指示</li>
<li><b>表面性状</b>: シール面は Ra の上限値と<b>加工目の方向</b> (同心円: 図示記号 C) を指示 (記号の書き方は「表面性状の図示 — Ra・Rz と加工法」の章)。真空側の内面は、表面積とガス放出を減らすため、必要な範囲で粗さを指定</li>
<li><b>傷の禁止</b>: 「シール面に半径方向の傷のないこと」を注記。寸法で書けない要求は文章で明確に書く</li>
</ul>
<p>数値はいずれも<b>シールの種類とメーカー推奨で決まる</b>もので、Ra 0.4〜0.8 µm 程度・平面度は数十 µm 以下が O リングシールでよく見られる例です。過剰に厳しくするとコストが急に上がるので、<b>機能面にだけ厳しく、他は普通公差</b>にします (「普通公差と寸法の決め方 — JIS B 0405・B 0419」の章)。</p>

<h2>エッジ・バリ・表面処理</h2>
<table class="tb-table">
<tr><th>指示</th><th>目的</th><th>図面での書き方の例</th></tr>
<tr><td>バリなし・糸面取り</td><td>バリは脱落してパーティクルになり、O リングも切る</td><td>「指示なきエッジは C0.2 以下の糸面取り、バリなし」</td></tr>
<tr><td>電解研磨</td><td>表面の凹凸を減らし、ガス放出・付着・汚れを減らす (ステンレス)</td><td>適用面を指定 (「接ガス面」など)。ねじ部・はめあい部は寸法が変わるので除外またはマスク</td></tr>
<tr><td>不動態化処理</td><td>ステンレス表面の不動態皮膜を整え、鉄の汚染を除く</td><td>処理の種類と適用規格を指示</td></tr>
<tr><td>表面処理の禁止</td><td>めっき・塗装が真空や薬液と合わない</td><td>「めっき・塗装不可」</td></tr>
</table>
<p>電解研磨は数 µm 単位で寸法が減るので、<b>処理前寸法か処理後寸法か</b>を図面ではっきりさせます。</p>

<h2>精密洗浄・クリーン梱包・材料証明・刻印</h2>
<ul>
<li><b>精密洗浄</b>: 加工油・切粉・指紋を除く洗浄 (脱脂、超音波洗浄、純水リンス、乾燥) を、社内の洗浄仕様書番号で指定。洗浄後は素手で触らない</li>
<li><b>クリーン梱包</b>: 洗浄後に清浄なクリーンルーム用の袋で<b>二重袋</b>に入れて封止 (外袋はクリーンルームの入口で外す)。シール面は保護カバーで覆う</li>
<li><b>材料証明</b>: 材料の成分と機械的性質を示す<b>ミルシート</b> (材料証明書) の提出を指示。真空・接ガス部品はトレーサビリティのため特に重要</li>
<li><b>刻印の制限</b>: 部品番号の刻印は、真空側・シール面・接ガス面には禁止。位置と方法 (レーザマーキング等) を指定し、インクやラベルは真空側に貼らない</li>
<li><b>検査</b>: ヘリウムリーク試験、寸法検査成績書、粗さ測定などの提出物を注記で明示</li>
</ul>

<h2>計算例 — 公差の積上げ</h2>
<svg class="tb-chart" viewBox="0 0 520 210" role="img" aria-label="4 部品の積上げで決まるすき間">
<text class="k-title" x="260" y="20" text-anchor="middle">4 部品の積上げで決まる高さ</text>
<rect class="k-ground" x="40" y="160" width="440" height="10"/><line class="k-edge" x1="40" y1="160" x2="480" y2="160"/>
<rect class="k-cut" x="80" y="130" width="100" height="30"/>
<rect class="k-cut2" x="80" y="110" width="100" height="20"/>
<rect class="k-cut" x="80" y="95" width="100" height="15"/>
<rect class="k-cut2" x="80" y="50" width="100" height="45"/>
<text class="tick" x="190" y="149">① ベース 30 ±0.05</text>
<text class="tick" x="190" y="124">② スペーサ 20 ±0.03</text>
<text class="tick" x="190" y="106">③ シム 15 ±0.02</text>
<text class="tick" x="190" y="76">④ ホルダ 45 ±0.10</text>
<line class="k-ext" x1="80" y1="50" x2="56" y2="50"/><line class="k-ext" x1="80" y1="160" x2="56" y2="160"/>
<line class="k-dimline" x1="62" y1="50" x2="62" y2="160"/>
<text class="k-dimtext" x="56" y="110" text-anchor="end">H</text>
<text class="lbl" x="360" y="60">最悪値: ±0.200</text>
<text class="lbl" x="360" y="80">二乗和: ±0.117</text>
</svg>
<p class="tb-caption">図: 4 個の部品を積み上げた高さ H のばらつき。最大の公差 (④) が全体を支配する</p>
<div class="tb-example">
<p>H = 30 + 20 + 15 + 45 = 110 mm。<br>
<b>最悪値 (極値) 法</b>: ±(0.05 + 0.03 + 0.02 + 0.10) = <b>±0.200 mm</b><br>
<b>二乗和平方根 (統計) 法</b>: ±√(0.05² + 0.03² + 0.02² + 0.10²) = ±√0.0138 ≈ <b>±0.117 mm</b></p>
<p>要求が H = 110 ±0.10 mm なら、どちらの方法でも満たしません。二乗和の中で 0.10² = 0.0100 が 0.0138 の 72% を占めるので、④の公差を ±0.05 にすれば二乗和は ±√0.0063 ≈ ±0.079 mm、最悪値は ±0.150 mm です。全数互換が必要なら最悪値で判断し、満たせなければ<b>シムで調整する</b> (③を選択式・現合にする) ことも設計の選択肢です。統計法は、各寸法が独立に公差中心付近でばらつくという前提が成り立つときに使います。</p>
</div>

<h3>よくある失敗</h3>
<ul>
<li>加工の都合でデータムを選び、シール面の平面度・位置が保証されない</li>
<li>全面に厳しい粗さ・公差を入れて、価格と納期が膨らむ</li>
<li>電解研磨後にはめあいが緩くなる (処理による寸法変化を見込んでいない)</li>
<li>部品番号をシール面の近くに刻印、ラベルを真空側に貼って納品される</li>
<li>洗浄・梱包の指示がなく、加工油の付いたまま届く</li>
</ul>

<h3>設計チェックリスト</h3>
<ul>
<li>データムが組付けの機能 (シール面・インロー・ピン) から選ばれているか</li>
<li>シール面の平面度・粗さ・加工目の方向・傷の禁止を指示したか</li>
<li>エッジ・バリ、電解研磨・不動態化の範囲と寸法の扱いを書いたか</li>
<li>洗浄仕様・二重袋梱包・保護カバー・材料証明・検査成績書を指示したか</li>
<li>刻印の位置と方法を制限したか</li>
<li>重要な積上げ寸法を最悪値と統計の両方で確認したか</li>
</ul>`,
    points: [
      "データムは組付けの機能 (シール面 → インロー → 回り止め) から選ぶ",
      "シール面には平面度・粗さ・加工目の方向・傷の禁止を直接指示",
      "電解研磨・不動態化は範囲と、処理前後どちらの寸法かを明示",
      "精密洗浄・二重袋梱包・材料証明・刻印制限を注記で指示",
      "公差の積上げは最悪値 Σt と統計 √Σt² で確認し、最大の公差から手を打つ",
    ],
    exercises: [
      {
        q: "5 部品の積上げで、公差が ±0.02、±0.02、±0.03、±0.04、±0.08 mm です。最悪値と二乗和平方根を求め、要求 ±0.10 mm を満たすか判断してください。",
        a: "最悪値 = ±(0.02 + 0.02 + 0.03 + 0.04 + 0.08) = <b>±0.19 mm</b> → 満たさない。<br>二乗和 = ±√(0.0004 + 0.0004 + 0.0009 + 0.0016 + 0.0064) = ±√0.0097 ≈ <b>±0.098 mm</b> → 統計的にはぎりぎり満たす。全数互換が必要なら ±0.08 の部品を厳しくするか、調整シムを設けます。",
      },
      {
        q: "外径 Ø30.000 mm に仕上げたステンレスのはめあい部に、片側 3 µm 減る電解研磨をかけると、外径はいくらになりますか。図面ではどう指示すべきですか。",
        a: "直径では 2 × 3 = 6 µm 減り <b>Ø29.994 mm</b>。はめあい公差が数 µm〜十数 µm なら影響が大きいので、はめあい部を<b>電解研磨の範囲から除外 (マスク)</b> するか、「寸法は処理後に適用」と明記して加工側で見込ませます。",
      },
    ],
    quiz: [
      { q: "真空フランジ付き部品の第 1 データムとして適切なのは?", choices: ["加工で最初に削る面", "相手に当たるシール面 (フランジ面)", "部品番号を刻印する面"], answer: 1, explain: "組み付けたときに位置を決める機能面をデータムにします。" },
      { q: "クリーン梱包の「二重袋」の外袋を外すのは一般にどこ?", choices: ["出荷前の工場", "クリーンルームの入口", "装置に取り付けた後"], answer: 1, explain: "外袋の表面の汚れをクリーンルームに持ち込まないためです。" },
      { q: "公差 ±0.05、±0.03、±0.02、±0.10 の積上げの最悪値は?", choices: ["±0.117", "±0.200", "±0.100"], answer: 1, explain: "最悪値は公差の単純和で ±0.200 mm です。二乗和では ±0.117 mm。" },
    ],
  },
];
