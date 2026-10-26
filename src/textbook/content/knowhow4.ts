import type { TextChapter } from "../types";

// 設計ノウハウ 第 4 集: 設計計算の進め方・装置フレーム・設計 FMEA
export const KNOWHOW4: TextChapter[] = [
  {
    id: "design-calc-practice",
    part: "knowhow",
    title: "設計計算の進め方 — 荷重の見積もりから安全率の判定まで",
    minutes: 25,
    level: 2,
    lead: "公式を知っていても、どの荷重を、どのモデルで、どこまで計算すればよいかが分からなければ設計計算は進みません。荷重ケースの洗い出しから、簡単なモデルでの手計算、FEA による確認、前提条件の記録までの一連の流れを、ブラケットの例で通して学びます。",
    body: `
<h2>設計計算の 6 ステップ</h2>
<svg class="tb-chart" viewBox="0 0 520 150" role="img" aria-label="設計計算の流れ">
<g class="k-shadow">
<rect class="k-panel" x="8" y="30" width="76" height="56" rx="6"/><rect class="k-panel" x="94" y="30" width="76" height="56" rx="6"/><rect class="k-panel" x="180" y="30" width="76" height="56" rx="6"/><rect class="k-panel" x="266" y="30" width="76" height="56" rx="6"/><rect class="k-panel" x="352" y="30" width="76" height="56" rx="6"/><rect class="k-panel" x="438" y="30" width="76" height="56" rx="6"/>
</g>
<text class="k-title" x="46" y="54" text-anchor="middle">① 荷重</text><text class="k-note" x="46" y="72" text-anchor="middle">ケース洗出し</text>
<text class="k-title" x="132" y="54" text-anchor="middle">② 最悪</text><text class="k-note" x="132" y="72" text-anchor="middle">ケース選定</text>
<text class="k-title" x="218" y="54" text-anchor="middle">③ モデル</text><text class="k-note" x="218" y="72" text-anchor="middle">はり・ばね化</text>
<text class="k-title" x="304" y="54" text-anchor="middle">④ 手計算</text><text class="k-note" x="304" y="72" text-anchor="middle">σ・δ・SF</text>
<text class="k-title" x="390" y="54" text-anchor="middle">⑤ FEA</text><text class="k-note" x="390" y="72" text-anchor="middle">形状で確認</text>
<text class="k-title" x="476" y="54" text-anchor="middle">⑥ 記録</text><text class="k-note" x="476" y="72" text-anchor="middle">前提・結論</text>
<line class="k-move" x1="84" y1="58" x2="93" y2="58"/><line class="k-move" x1="170" y1="58" x2="179" y2="58"/><line class="k-move" x1="256" y1="58" x2="265" y2="58"/><line class="k-move" x1="342" y1="58" x2="351" y2="58"/><line class="k-move" x1="428" y1="58" x2="437" y2="58"/>
<path d="M390,88 L390,118 L218,118 L218,90" class="k-hidden" style="marker-end:url(#k-arrow)"/>
<text class="k-note" x="304" y="134" text-anchor="middle">手計算と合わなければ条件を見直す</text>
</svg>
<p class="tb-caption">図: 設計計算の流れ。FEA はいきなり使わず、手計算で桁を押さえてから形状の詳細を確認する道具として使う</p>
<h2>① 荷重ケースを洗い出す</h2>
<p>「重さを支える」だけでは不十分です。製品の一生で起こる荷重を表にします。</p>
<table class="tb-table">
  <tr><th>荷重ケース</th><th>例</th><th>見積もりの考え方</th></tr>
  <tr><td>静荷重</td><td>自重・搭載物の重さ</td><td>質量 × g</td></tr>
  <tr><td>動荷重</td><td>加減速・起動停止</td><td>質量 × 加速度、または係数 (動的係数) を掛ける</td></tr>
  <tr><td>衝撃</td><td>落下・ストッパ当たり</td><td>エネルギーと停止距離から見積もる</td></tr>
  <tr><td>繰り返し</td><td>往復運動・振動</td><td>応力振幅と回数 → 疲労で評価</td></tr>
  <tr><td>組立・輸送・誤使用</td><td>締付け力、吊り上げ、踏み台にされる</td><td>想定する人・状況を決めて仮定する</td></tr>
  <tr><td>熱</td><td>温度変化による伸びの拘束</td><td>α × ΔT × L を拘束したときの力</td></tr>
</table>
<h2>② 最悪ケースを選ぶ</h2>
<p>荷重が最大のケースが最悪とは限りません。<b>荷重の向き</b> (弱い軸に曲げがかかる)、<b>組合せ</b> (自重 + 加速度が同じ向き)、<b>回数</b> (小さくても繰り返しなら疲労) を考えて、評価すべきケースを 1〜3 個に絞ります。</p>
<h2>③ 単純なモデルに置き換える</h2>
<ul>
  <li>細長い部材 → <b>はり</b> (片持ち・両端支持)。接合部はまず固定とみなし、後で剛性を割り引く</li>
  <li>板・ブロック → 引張・圧縮・せん断の断面</li>
  <li>結合部・軸受 → ばね (直列・並列)</li>
</ul>
<p>モデルは「安全側」に単純化します。例えば支持が固定かピンか迷うなら、たわみの評価では<b>ピン (柔らかい側)</b> を選びます。</p>
<h2>④ 手計算 — 完全な例: モーター取付ブラケット</h2>
<svg class="tb-chart" viewBox="0 0 520 220" role="img" aria-label="片持ちブラケットの計算モデル">
<rect class="k-ground" x="40" y="40" width="20" height="150"/><line class="k-edge" x1="60" y1="40" x2="60" y2="190"/>
<g class="k-shadow"><rect class="k-part" x="60" y="100" width="300" height="16" rx="1"/><rect class="k-alu" x="320" y="62" width="80" height="38" rx="4"/></g>
<text class="lbl" x="360" y="86" text-anchor="middle">モーター 20 kg</text>
<line class="k-force" x1="360" y1="128" x2="360" y2="170"/><text class="mark-t" x="368" y="160" style="fill:var(--tb-bad)">F = 392 N</text>
<line class="k-ext" x1="60" y1="120" x2="60" y2="196"/><line class="k-ext" x1="360" y1="174" x2="360" y2="196"/>
<line class="k-dimline" x1="60" y1="192" x2="360" y2="192"/><text class="k-dimtext" x="210" y="188" text-anchor="middle">L = 150 (モデル上の腕の長さ)</text>
<text class="k-note" x="110" y="94">SS400 板 幅 60 × 厚さ t</text>
<line class="k-ext" x1="362" y1="100" x2="440" y2="100"/><line class="k-ext" x1="362" y1="116" x2="440" y2="116"/><line class="k-dimline" x1="432" y1="100" x2="432" y2="116"/><text class="k-dimtext" x="440" y="113">t</text>
<text class="k-note" x="210" y="28" text-anchor="middle">壁に固定した片持ちはりとしてモデル化</text>
</svg>
<p class="tb-caption">図: 質量 20 kg のモーターを、固定端から 150 mm の位置で支えるブラケット。板は薄い向きに曲げられる</p>
<p><b>前提条件</b>: 質量 20 kg、起動・停止の動的係数 2 (仮定)、材料 SS400 (降伏点 245 MPa、板厚 16 mm 以下)、E = 206 GPa、目標安全率 (降伏基準) 3 以上、先端たわみ 0.5 mm 以下。</p>
<div class="tb-math">\\begin{aligned} F &= 20\\times 9.81\\times 2 \\approx 392\\ \\mathrm{N} \\\\ M &= F\\times L = 392.4\\times 150 \\\\ &\\approx 58\\,900\\ \\mathrm{N\\cdot mm} \\end{aligned}</div>
<table class="tb-table">
  <tr><th>板厚 t</th><th>Z = bt²/6</th><th>σ = M/Z</th><th>安全率 245/σ</th><th>I = bt³/12</th><th>δ = FL³/3EI</th><th>判定</th></tr>
  <tr><td>8 mm</td><td>640 mm³</td><td>92 MPa</td><td>2.7</td><td>2 560 mm⁴</td><td>0.84 mm</td><td>NG (両方)</td></tr>
  <tr><td>10 mm</td><td>1 000 mm³</td><td>59 MPa</td><td>4.2</td><td>5 000 mm⁴</td><td>0.43 mm</td><td>OK</td></tr>
</table>
<p>t = 8 では安全率もたわみも不足し、t = 10 で両方を満たします。たわみは t³ に反比例するので、厚さ 1.25 倍でたわみは約 1/2 になりました。</p>
<h2>⑤ FEA で確認する</h2>
<p>手計算は単純なはりなので、取付穴・曲げ R・溶接端の<b>応力集中</b>や、固定部 (ボルト・壁) の柔らかさは入っていません。FEA では、①手計算と同じ条件で桁が合うことを確かめ、②実形状で応力集中部の値を見ます。
固定部の柔らかさが入るとたわみは手計算より大きくなるのが普通なので、たわみに余裕を残しておきます。</p>
<h2>⑥ 前提と結論を記録する</h2>
<ul>
  <li><b>前提</b>: 荷重の根拠 (質量・係数の出典)、材料値、モデル化 (固定とみなした等)</li>
  <li><b>計算</b>: 式・代入値・単位。第三者が電卓で追えること</li>
  <li><b>結論</b>: 判定基準と結果 (安全率 4.2 ≥ 3 → OK)、残った懸念 (疲労・ボルトは別途)</li>
</ul>
<div class="tb-warn"><b>よくある失敗</b>: 静荷重だけで計算して起動時の衝撃を忘れる / 単位の混在 (kgf と N、GPa と MPa) / 弱い向きの曲げを見落とす / 計算書に前提がなく、仕様変更時に再計算できない。</div>`,
    points: [
      "荷重ケースを表で洗い出し、向き・組合せ・回数を考えて最悪ケースを選ぶ",
      "はり・ばねなど単純で安全側のモデルにして手計算で桁を押さえる",
      "強度 (安全率) と剛性 (たわみ) を両方判定する",
      "FEA は手計算と条件をそろえて検証してから、応力集中など詳細の確認に使う",
      "前提・式・結論を記録し、仕様変更時に再計算できるようにする",
    ],
    exercises: [
      {
        q: "質量 20 kg、動的係数 2、腕の長さ 150 mm の片持ちブラケット (SS400、幅 60 mm、厚さ 8 mm、薄い向きに曲げ) の曲げ応力・安全率 (降伏点 245 MPa)・先端たわみを求めなさい。",
        a: "F = 20 × 9.81 × 2 ≈ 392 N、M ≈ 58 860 N·mm。Z = 60 × 8² / 6 = 640 mm³ → σ ≈ <b>92 MPa</b>、安全率 245 / 92 ≈ <b>2.7</b>。I = 60 × 8³ / 12 = 2 560 mm⁴ → δ = 392.4 × 150³ / (3 × 206 000 × 2 560) ≈ <b>0.84 mm</b>。",
      },
      {
        q: "上の板厚を 10 mm にすると、応力・安全率・たわみはどうなりますか? 目標 (安全率 3 以上、たわみ 0.5 mm 以下) を満たしますか?",
        a: "Z = 1 000 mm³ → σ ≈ <b>59 MPa</b>、安全率 ≈ <b>4.2</b>。I = 5 000 mm⁴ → δ ≈ <b>0.43 mm</b>。どちらも<b>満たします</b>。応力は t² に、たわみは t³ に反比例することも確認できます。",
      },
      {
        q: "同じ板を「強い向き」(幅 60 mm が高さ方向) に使った場合、t = 8 mm で曲げ応力はいくつになりますか?",
        a: "Z = t × b² / 6 = 8 × 60² / 6 = 4 800 mm³ → σ = 58 860 / 4 800 ≈ <b>12 MPa</b>。向きを変えるだけで応力は 1/7.5 になります。弱い向きの曲げを見落とさないことが重要です。",
      },
    ],
    quiz: [
      { q: "設計計算の最初に行うべきことは?", choices: ["FEA のメッシュを切る", "荷重ケースを洗い出す", "材料を最も強いものにする"], answer: 1, explain: "何に耐えるべきかが決まらないと、計算も判定もできません。" },
      { q: "たわみを評価するとき、支持条件が固定かピンか迷ったら?", choices: ["固定 (硬い側) を選ぶ", "ピン (柔らかい側) を選ぶ", "平均をとる"], answer: 1, explain: "たわみは柔らかい側で見積もると安全側になります。" },
      { q: "板厚を 2 倍にすると、薄い向きの曲げによるたわみはどうなる?", choices: ["1/2", "1/4", "1/8"], answer: 2, explain: "I ∝ t³ なので、たわみは 1/8 になります。" },
      { q: "計算書に必ず残すべきものは?", choices: ["前提条件 (荷重の根拠・材料値・モデル化)", "計算に使ったソフトの色設定", "最終結果の数値だけ"], answer: 0, explain: "前提がないと、第三者が検証できず、仕様変更時に再計算もできません。" },
    ],
  },
  {
    id: "frame-design",
    part: "knowhow",
    title: "装置フレームの設計 — アルミフレーム・角パイプ・溶接構造",
    minutes: 25,
    level: 2,
    lead: "装置の骨格となるフレームは、精度・振動・安全のすべての土台です。アルミフレーム・鋼の角パイプのボルト構造・溶接構造の選び方、接合部と三角形の効果、たわみの見積もり、据え付け (レベル出し・固定) までを学びます。",
    body: `
<h2>3 つの構造の選び方</h2>
<table class="tb-table">
  <tr><th></th><th>アルミフレーム (押出材)</th><th>角パイプのボルト構造</th><th>溶接構造 (鋼)</th></tr>
  <tr><td>剛性</td><td>E ≈ 70 GPa で鋼の約 1/3。接合部が柔らかい</td><td>中。接合部の設計しだい</td><td>高い。一体なので接合部のガタがない</td></tr>
  <tr><td>精度</td><td>切断・タップのみで組める。面精度は材料なり</td><td>取付面を加工すれば良好</td><td>溶接ひずみ → 取付面は溶接後に機械加工</td></tr>
  <tr><td>変更</td><td>非常に容易 (T 溝で後付け)</td><td>可能</td><td>困難</td></tr>
  <tr><td>コスト・納期</td><td>少量で有利、短納期</td><td>中</td><td>台数・サイズが大きいと有利。図面と製缶が必要</td></tr>
  <tr><td>向く用途</td><td>試作機・カバー枠・軽負荷の装置</td><td>中型装置・架台</td><td>工作機械・重量物・高速で振動の大きい装置</td></tr>
</table>
<h2>接合部と三角形</h2>
<svg class="tb-chart" viewBox="0 0 520 220" role="img" aria-label="フレームの筋かいの有無">
<rect class="k-panel" x="8" y="8" width="244" height="204" rx="8"/><rect class="k-panel" x="268" y="8" width="244" height="204" rx="8"/>
<circle class="k-badge" cx="28" cy="28" r="10" style="fill:var(--tb-bad)"/><text class="k-badge-t" x="28" y="32" text-anchor="middle">✕</text><text class="k-title" x="46" y="32">四角形だけ</text>
<circle class="k-badge" cx="288" cy="28" r="10" style="fill:var(--tb-good)"/><text class="k-badge-t" x="288" y="32" text-anchor="middle">✓</text><text class="k-title" x="306" y="32">筋かい・ガセットで三角形</text>
<rect class="k-ground" x="40" y="178" width="180" height="8"/><rect class="k-ground" x="300" y="178" width="180" height="8"/>
<g class="k-shadow"><path d="M70,178 L70,60 L190,60 L190,178" style="fill:none;stroke:var(--k-line)" stroke-width="10" stroke-linejoin="round"/></g>
<path d="M70,178 L96,62 L216,62 L190,178" class="k-hidden" style="stroke:var(--tb-bad)"/>
<path d="M70,60 L90,60 L70,80 Z" style="fill:var(--tb-bad)"/><path d="M190,60 L170,60 L190,80 Z" style="fill:var(--tb-bad)"/>
<line class="k-force" x1="20" y1="60" x2="62" y2="60"/>
<text class="k-bad-t" x="130" y="150" text-anchor="middle">接合部の回転で</text><text class="k-bad-t" x="130" y="166" text-anchor="middle">平行四辺形に揺れる</text>
<g class="k-shadow"><path d="M330,178 L330,60 L450,60 L450,178" style="fill:none;stroke:var(--k-line)" stroke-width="10" stroke-linejoin="round"/><line x1="330" y1="178" x2="450" y2="60" style="stroke:var(--k-line)" stroke-width="7"/></g>
<path d="M330,60 L356,60 L330,86 Z" style="fill:var(--tb-good)"/><path d="M450,60 L424,60 L450,86 Z" style="fill:var(--tb-good)"/>
<line class="k-force" x1="280" y1="60" x2="322" y2="60"/>
<text class="k-good-t" x="390" y="200" text-anchor="middle">力が軸力で流れて硬い</text>
</svg>
<p class="tb-caption">図: 横から押される門形フレーム。四角形は角の接合部が回ると平行四辺形に崩れる (破線は揺れの模式)。筋かいやガセット (三角板) で三角形を作ると、力が部材の軸力として流れ、剛性が大きく上がる</p>
<ul>
  <li>アルミフレームの<b>コーナーブラケットだけの接合は回転に弱い</b>。横方向の剛性が必要なら、筋かい・パネル (面材) を追加する</li>
  <li>角パイプのボルト接合は、パイプに直接ボルトを通すと管壁がつぶれる。<b>当て板・スリーブ・溶接ナット付きのプレート</b>で受ける</li>
  <li>溶接構造は<b>取付面を溶接後に機械加工</b>し、必要なら応力除去焼なまし</li>
</ul>
<h2>たわみの見積もり</h2>
<p>フレームの梁は、まず<b>両端支持はり</b>と<b>両端固定はり</b>で挟み込んで見積もります。実際の接合部は完全固定ではないので、ばらつきの範囲として扱います。</p>
<div class="tb-math">\\begin{gathered} \\text{両端支持: } \\delta = \\dfrac{FL^3}{48EI} \\\\ \\text{両端固定: } \\delta = \\dfrac{FL^3}{192EI} \\end{gathered}</div>
<p>中央集中荷重の場合。両端固定のたわみは両端支持の 1/4。</p>
<p>鋼の角パイプ □40 × 40 × 2 (I = (40⁴ − 36⁴) / 12 ≈ 73 400 mm⁴)、スパン 800 mm、中央に 500 N のとき:</p>
<table class="tb-table">
  <tr><th>材料・支持</th><th>たわみ</th></tr>
  <tr><td>鋼 (E = 206 GPa)・両端支持</td><td>0.35 mm</td></tr>
  <tr><td>鋼・両端固定</td><td>0.09 mm</td></tr>
  <tr><td>同じ断面のアルミ (E = 70 GPa)・両端支持</td><td>1.04 mm</td></tr>
</table>
<p>アルミで鋼と同じたわみにするには I を約 206/70 ≈ 2.9 倍にする必要があります。アルミフレームの I はメーカーのカタログ値を使います。</p>
<h2>据え付け — レベル出しと固定</h2>
<ul>
  <li><b>アジャスタ (レベリングフット)</b> で水平を出す。4 点支持は床の凹凸で 1 点が浮きやすいので、全点が接地するよう調整し、ロックナットで固定する</li>
  <li>精度の要る小型装置では<b>3 点支持</b>にすると、床がゆがんでもフレームをねじらない</li>
  <li>重心が高い・動く質量が大きい装置は、<b>転倒の検討</b> (重心と支持点の位置関係) と床へのアンカー固定を行う</li>
  <li>キャスター付きは移動用。運転時はアジャスタで床に荷重を移す</li>
</ul>
<div class="tb-warn"><b>よくある失敗</b>: アルミフレームで高速の可動部を支えて振動が止まらない / 溶接後に加工せず取付面が反っている / 角パイプにボルトを貫通させて管がつぶれる / 運搬時の吊り位置・フォークの差し込みを考えていない。</div>`,
    points: [
      "アルミフレームは変更に強く短納期、溶接構造は剛性と減衰に優れる",
      "四角形は接合部の回転で崩れる — 筋かい・ガセット・面材で三角形を作る",
      "梁のたわみは両端支持と両端固定で挟んで見積もる (固定は支持の 1/4)",
      "アルミは E が鋼の約 1/3 — 同じたわみには I を約 3 倍に",
      "アジャスタでレベル出し、精密装置は 3 点支持、転倒とアンカーも検討",
    ],
    exercises: [
      {
        q: "鋼の角パイプ □40 × 40 × 2 (外 40、内 36) の断面二次モーメントを求め、スパン 800 mm・中央荷重 500 N の両端支持はりとしてのたわみを求めなさい (E = 206 GPa)。",
        a: "I = (40⁴ − 36⁴) / 12 = (2 560 000 − 1 679 616) / 12 ≈ <b>73 400 mm⁴</b>。δ = 500 × 800³ / (48 × 206 000 × 73 365) ≈ <b>0.35 mm</b>。両端固定なら 1/4 の約 0.09 mm。",
      },
      {
        q: "同じ断面寸法をアルミ (E = 70 GPa) にするとたわみは? 鋼と同じ 0.35 mm にするには I をいくつにすればよいですか?",
        a: "δ = 0.35 × 206 / 70 ≈ <b>1.04 mm</b>。必要な I = 73 365 × 206 / 70 ≈ <b>216 000 mm⁴</b> (約 2.9 倍)。カタログで I がこれ以上のアルミフレームを選びます。",
      },
      {
        q: "□40 × 40 × 2 の鋼管 (密度 7.85 g/cm³) の 1 m あたりの質量と、800 × 600 × 700 mm の直方体フレーム (12 本の稜) の総質量を求めなさい (接合部は無視)。",
        a: "断面積 = 40² − 36² = 304 mm² → 304 × 1 000 × 7.85 × 10⁻³ g ≈ <b>2.39 kg/m</b>。総長 = 4 × (0.8 + 0.6 + 0.7) = 8.4 m → 約 <b>20 kg</b>。",
      },
    ],
    quiz: [
      { q: "門形のフレームの横方向の剛性を最も効果的に上げる方法は?", choices: ["部材の色を変える", "筋かいやガセットで三角形を作る", "コーナーのボルトを長くする"], answer: 1, explain: "三角形にすると力が軸力で流れ、接合部の回転に頼らなくなります。" },
      { q: "同じ断面の梁を鋼からアルミに替えると、たわみはおよそ?", choices: ["同じ", "約 3 倍", "約 1/3"], answer: 1, explain: "E が約 206 → 70 GPa になるので、たわみは約 2.9 倍です。" },
      { q: "中央集中荷重で、両端固定はりのたわみは両端支持はりの何倍?", choices: ["1/4", "1/2", "2 倍"], answer: 0, explain: "FL³/192EI と FL³/48EI の比で 1/4 です。" },
      { q: "床のゆがみでフレームをねじらないための支持方法は?", choices: ["6 点支持", "3 点支持", "全面接着"], answer: 1, explain: "3 点は必ず同一平面上にあるので、床の凹凸があっても無理な力がかかりません。" },
    ],
  },
  {
    id: "fmea-design",
    part: "knowhow",
    title: "設計 FMEA の実践 — 故障モードを先回りする",
    minutes: 25,
    level: 3,
    lead: "設計 FMEA (DFMEA) は、図面が固まる前に「どう壊れうるか」を洗い出し、影響の大きいものから手を打つための道具です。重大度・発生度・検出度の付け方、RPN と処置優先度 (AP)、ワークシートの書き方と対策の考え方を、搬送コンベヤの例で練習します。",
    body: `
<h2>FMEA の進め方</h2>
<ol class="tb-flow">
  <li><b>範囲と構造</b> — 対象のシステム・サブシステム・部品を構造ツリーにする</li>
  <li><b>機能</b> — 各要素が「何をするか」を動詞で書く (例: ベルトを駆動する)</li>
  <li><b>故障モード</b> — 機能が果たせない形 (しない・不十分・過剰・意図しない・断続的)</li>
  <li><b>影響と原因</b> — 上位 (顧客・安全) への影響、設計上の原因</li>
  <li><b>評価</b> — 重大度 S・発生度 O・検出度 D を付ける</li>
  <li><b>処置</b> — 優先度の高いものから対策し、責任者・期限を決めて再評価</li>
</ol>
<h2>S・O・D の付け方</h2>
<table class="tb-table">
  <tr><th>指標</th><th>意味</th><th>1 (低)</th><th>10 (高)</th></tr>
  <tr><td>重大度 S</td><td>影響のひどさ</td><td>気づかない程度</td><td>安全・法規に関わり予告なく起こる</td></tr>
  <tr><td>発生度 O</td><td>原因が起こる可能性 (設計上の予防策の効き具合)</td><td>実績のある設計で予防済み</td><td>新規設計で予防策なし</td></tr>
  <tr><td>検出度 D</td><td>出荷前の設計検証 (試験・解析) で見つけられるか</td><td>確実に検出できる</td><td>検出手段がない</td></tr>
</table>
<p>点数基準は会社や規格 (AIAG-VDA FMEA ハンドブックなど) で定めたものを使い、チーム内でそろえることが大切です。<b>D は「低いほど見つけやすい」</b>ので、検証を強化すると D が下がります。</p>
<h2>RPN と処置優先度 (AP)</h2>
<div class="tb-math">RPN = S\\times O\\times D</div>
<p>1〜1000</p>
<p>RPN は手軽ですが、S = 9 × O = 2 × D = 2 = 36 と、S = 3 × O = 6 × D = 2 = 36 が同じ値になってしまいます。そこで現在の AIAG-VDA 方式では、S を最も重視して S・O・D の組合せから<b>処置優先度 AP (高・中・低)</b> を表で決めます。
どちらの方式でも、<b>S が 9〜10 (安全・法規) の項目は RPN が小さくても必ず検討</b>します。</p>
<h2>ワークシートの例: ベルトコンベヤの駆動部</h2>
<table class="tb-table">
  <tr><th>部品・機能</th><th>故障モード</th><th>影響</th><th>原因</th><th>S</th><th>O</th><th>D</th><th>RPN</th></tr>
  <tr><td>プーリ: トルクを伝える</td><td>軸上で空転</td><td>搬送停止・ライン停止</td><td>止めねじのみで固定、振動で緩む</td><td>7</td><td>6</td><td>5</td><td>210</td></tr>
  <tr><td>軸受: 軸を支える</td><td>焼付き</td><td>停止・異音</td><td>潤滑不足、寿命計算の荷重過小</td><td>6</td><td>3</td><td>4</td><td>72</td></tr>
  <tr><td>モーター: 駆動する</td><td>過熱停止</td><td>停止</td><td>負荷トルクの見積もり不足</td><td>8</td><td>3</td><td>3</td><td>72</td></tr>
  <tr><td>カバー: 巻込みを防ぐ</td><td>開いたまま運転</td><td>指の巻込み (けが)</td><td>インターロックが 1 系統で故障を検知できない</td><td>9</td><td>2</td><td>6</td><td>108</td></tr>
</table>
<svg class="tb-chart" viewBox="0 0 520 210" role="img" aria-label="対策前後の RPN">
<line class="axis" x1="150" y1="20" x2="150" y2="170"/><line class="axis" x1="150" y1="170" x2="500" y2="170"/>
<line class="grid" x1="250" y1="20" x2="250" y2="170"/><line class="grid" x1="350" y1="20" x2="350" y2="170"/><line class="grid" x1="450" y1="20" x2="450" y2="170"/>
<text class="tick" x="150" y="186" text-anchor="middle">0</text><text class="tick" x="250" y="186" text-anchor="middle">70</text><text class="tick" x="350" y="186" text-anchor="middle">140</text><text class="tick" x="450" y="186" text-anchor="middle">210</text>
<text class="lbl" x="142" y="44" text-anchor="end">プーリ空転</text>
<rect x="150" y="30" width="300" height="12" style="fill:var(--tb-bad)"/><rect x="150" y="44" width="100" height="12" style="fill:var(--tb-good)"/>
<text class="mark-t" x="456" y="41">210</text><text class="mark-t" x="256" y="55">70</text>
<text class="lbl" x="142" y="84" text-anchor="end">カバー (S = 9)</text>
<rect x="150" y="70" width="154.3" height="12" style="fill:var(--tb-bad)"/><rect x="150" y="84" width="51.4" height="12" style="fill:var(--tb-good)"/>
<text class="mark-t" x="310" y="81">108</text><text class="mark-t" x="208" y="95">36</text>
<text class="lbl" x="142" y="124" text-anchor="end">軸受焼付き</text>
<rect x="150" y="114" width="102.9" height="12" style="fill:var(--tb-warn)"/><text class="mark-t" x="259" y="125">72 (現状維持)</text>
<text class="lbl" x="142" y="154" text-anchor="end">モーター過熱</text>
<rect x="150" y="144" width="102.9" height="12" style="fill:var(--tb-warn)"/><text class="mark-t" x="259" y="155">72 (現状維持)</text>
<rect x="160" y="196" width="10" height="10" style="fill:var(--tb-bad)"/><text class="k-note" x="174" y="205">対策前</text>
<rect x="230" y="196" width="10" height="10" style="fill:var(--tb-good)"/><text class="k-note" x="244" y="205">対策後</text>
</svg>
<p class="tb-caption">図: 対策前後の RPN。プーリはキー + 止めねじで O を 6 → 2、カバーはインターロックを 2 系統にして故障を検知する設計 + 検証試験で D を 6 → 2。S は設計の根本 (エネルギー・すき間) を変えない限り下がらない</p>
<h2>対策の考え方</h2>
<ul>
  <li><b>S を下げる</b>のは設計変更だけ: 危険源をなくす、エネルギーを下げる、故障しても安全側にする (フェールセーフ)</li>
  <li><b>O を下げる</b>: 原因をなくす設計 (キー・回り止め、余裕のある寿命計算、実績部品の採用)</li>
  <li><b>D を下げる</b>: 設計検証を追加 (耐久試験、解析、試作評価)。検査を増やすのは最後の手段</li>
  <li>対策後は必ず<b>再評価</b>し、ワークシートに結果と根拠を残す</li>
</ul>
<div class="tb-warn"><b>よくある失敗</b>: 完成した図面に後付けで FMEA を書く (書類作り) / 1 人で書く (製造・サービス・品証の視点が抜ける) / 故障モードと原因の混同 (「緩む」は原因、「空転する」はモード) / RPN の閾値以下を一律に無視する。</div>`,
    points: [
      "構造 → 機能 → 故障モード → 影響・原因 → S・O・D → 処置 の順に進める",
      "RPN = S × O × D。同じ値でも中身が違うので、S を重視する AP 方式も使われる",
      "S が 9〜10 (安全・法規) は RPN が小さくても必ず検討する",
      "S は設計変更でしか下がらない。O は原因の予防、D は設計検証で下げる",
      "図面が固まる前に、多部署のチームで行い、対策後に再評価する",
    ],
    exercises: [
      {
        q: "プーリの空転 (S = 7、O = 6、D = 5) の RPN を求めなさい。キー + 止めねじの固定に変えて O が 2 になったときの RPN と、低減率は?",
        a: "対策前 7 × 6 × 5 = <b>210</b>。対策後 7 × 2 × 5 = <b>70</b>。(210 − 70) / 210 ≈ <b>67 %</b> 低減。",
      },
      {
        q: "カバーのインターロック (S = 9、O = 2、D = 6、RPN 108) は、軸受の焼付き (RPN 72) より優先すべきでしょうか? また D を 2 にしたときの RPN は?",
        a: "RPN でも上ですが、それ以上に <b>S = 9 (人のけが)</b> なので最優先で検討すべきです。D = 2 なら 9 × 2 × 2 = <b>36</b>。ただし S = 9 は残るので、可能ならすき間・エネルギーの見直しで危険源そのものを減らします。",
      },
      {
        q: "「ボルトが緩む」「部品が脱落する」「振動」のうち、故障モード・原因・その上位の影響をそれぞれ分類しなさい (ブラケットを固定する機能について)。",
        a: "故障モード: <b>部品が脱落する</b> (固定する機能が果たせない)。原因: <b>ボルトが緩む</b>。緩みの原因の 1 つが<b>振動</b> (さらに下位の原因)。影響は「装置停止・落下による損傷」などです。",
      },
    ],
    quiz: [
      { q: "RPN の計算式は?", choices: ["S + O + D", "S × O × D", "S × O / D"], answer: 1, explain: "重大度・発生度・検出度の積で 1〜1000 になります。" },
      { q: "重大度 S を下げられる対策は?", choices: ["検査を増やす", "設計を変えて危険源・影響そのものを小さくする", "試験回数を増やす"], answer: 1, explain: "検査や試験は D を下げるだけで、影響のひどさは変わりません。" },
      { q: "検出度 D が「10」の意味は?", choices: ["確実に検出できる", "検出手段がほとんどない", "10 回に 1 回起こる"], answer: 1, explain: "D は数字が大きいほど見つけにくいことを表します。" },
      { q: "RPN が同じ 36 の項目が 2 つ。優先すべきは?", choices: ["S = 9, O = 2, D = 2", "S = 3, O = 6, D = 2", "どちらも同じ"], answer: 0, explain: "安全に関わる高い S の項目を優先します。AP 方式はこの考えを表にしたものです。" },
    ],
  },
];
