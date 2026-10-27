import type { TextChapter } from "../types";

// 機械設計の統合編: 要素を組み合わせた設計手順 (減速機・コンベア・昇降・回転テーブル・締結・精度・計算書)
export const MDESIGN: TextChapter[] = [
  {
    id: "machine-design-flow",
    part: "elements",
    title: "機械設計の進め方 — 要求から計算書・図面まで",
    minutes: 30,
    level: 2,
    lead: "個々の機械要素の計算を知っていても、どの順番で何を決めるかが分からないと設計は進みません。要求仕様を荷重と運転条件に翻訳し、構想を立て、動力の流れに沿って要素を選び、計算書と図面にまとめるまでの流れを、小形コンベア駆動部を例にたどります。",
    body: `
<h2>設計は「動力の流れ」と「荷重の流れ」をたどる作業</h2>
<p>機械設計は、要求 (何を・どれだけ・どの速さで・何年) を<b>数値の仕様</b>に直すところから始まります。仕様が決まったら、動力は <b>モータ → 減速機 → 軸 → 負荷</b> と流れ、反力は <b>軸 → 軸受 → ハウジング → フレーム → 床</b> と流れます。要素はこの 2 本の流れに沿って、負荷側から順に決めていくのが基本です。負荷が決まらなければ減速比もモータも決まらないからです。</p>
<svg class="tb-chart" viewBox="0 0 520 250" role="img" aria-label="小形コンベア駆動部の構成と動力・荷重の流れ">
<text class="k-title" x="260" y="20" text-anchor="middle">小形コンベア駆動部 — 動力の流れと荷重の流れ</text>
<line class="k-ground" x1="20" y1="222" x2="500" y2="222"/>
<g class="k-shadow">
<rect class="k-alu" x="40" y="150" width="440" height="14" rx="2"/>
<rect class="k-alu" x="60" y="164" width="14" height="58"/><rect class="k-alu" x="446" y="164" width="14" height="58"/>
<rect class="k-part" x="40" y="74" width="62" height="40" rx="6"/>
<rect class="k-plastic" x="108" y="80" width="46" height="34" rx="4"/>
<rect class="k-part" x="206" y="96" width="22" height="30" rx="2"/><rect class="k-part" x="306" y="96" width="22" height="30" rx="2"/>
</g>
<rect class="k-part-h" x="154" y="92" width="196" height="8"/>
<circle class="k-part" cx="400" cy="96" r="26"/>
<rect class="k-rubber" x="400" y="68" width="90" height="6" rx="2"/>
<line class="k-center" x1="30" y1="96" x2="440" y2="96"/>
<rect class="k-part" x="196" y="126" width="140" height="24" rx="2"/>
<text class="lbl" x="71" y="98" text-anchor="middle">モータ</text>
<text class="lbl" x="131" y="70" text-anchor="middle">減速機</text>
<text class="tick" x="217" y="88" text-anchor="middle">軸受</text><text class="tick" x="317" y="88" text-anchor="middle">軸受</text>
<text class="lbl" x="266" y="142" text-anchor="middle" style="font-size:11px">軸受台</text>
<text class="lbl" x="400" y="140" text-anchor="middle">駆動プーリ</text>
<text class="tick" x="460" y="62" text-anchor="middle">ベルト</text>
<text class="tick" x="260" y="182" text-anchor="middle">フレーム</text>
<line class="k-move" x1="40" y1="44" x2="430" y2="44" style="marker-end:url(#k-arrow-blue)"/>
<text class="mark-t" x="235" y="38" text-anchor="middle" style="fill:var(--tb-accent)">動力: モータ → 減速機 → 軸 → プーリ → ベルト</text>
<line class="k-force" x1="280" y1="104" x2="280" y2="210"/>
<text class="k-bad-t" x="290" y="204">反力: 軸受 → 軸受台 → フレーム → 床</text>
</svg>
<p class="tb-caption">図: 動力は左から右へ、反力は上から下へ流れる。どちらの経路も途中の要素がすべて「設計対象」</p>
<h2>手順 1 — 要求を荷重と運転条件に直す</h2>
<p>最初に決めるのは<b>荷重条件</b>です。質量・速度・加速度・摩擦係数・傾斜から負荷力を求め、そこに運転のパターン (連続/間欠、1 日の稼働時間、起動頻度)、寿命 (例: 20 000 h)、環境 (温度・粉じん・水) を添えて<b>設計条件表</b>にします。荷重の見積もりの基本は「設計計算の進め方 — 荷重の見積もりから安全率の判定まで」の章で扱いました。本章は、それを装置 1 台分の流れにつなげます。</p>
<div class="tb-math">F = \\mu m g + m a \\qquad P = \\dfrac{F v}{\\eta} \\qquad T = F\\,\\dfrac{D}{2} \\qquad n = \\dfrac{60\\,v}{\\pi D}</div>
<h2>手順 2 — 構想: 方式と配置を決める</h2>
<p>同じ要求でも、ギヤードモータ直結か、ベルトで減速するか、サーボかで部品構成が変わります。構想段階では 2〜3 案を<b>評価表</b> (コスト・保守性・寸法・精度・安全) で比べ、1 案に絞ります。この段階で軸の支持方法 (両持ち/片持ち)、軸受の固定側・自由側、カバーと点検口の位置も決めておくと、後戻りが減ります。</p>
<h2>手順 3 — 寸法決めの順番</h2>
<ol>
<li><b>負荷側</b>: 負荷力・速度 → プーリ径・回転数・トルク</li>
<li><b>伝動</b>: 減速比 → 減速機の容量 (サービスファクタ込み)</li>
<li><b>モータ</b>: 定格トルク・起動トルク・慣性比・停止時の保持</li>
<li><b>軸</b>: 曲げ+ねじりの強度、たわみ、キー・止め輪の溝</li>
<li><b>軸受</b>: 反力から寿命、内径は軸径から</li>
<li><b>支持構造・フレーム</b>: 軸受台・フレームの剛性、締結ボルト</li>
</ol>
<p>後段で問題が出たら前段に戻ります (例: 軸受が大きくなりすぎる → 軸の支持スパンを変える)。<b>反復は失敗ではなく設計の一部</b>です。どの値を何回変えたかを記録しておくと、レビューで説明できます。</p>
<svg class="tb-chart" viewBox="0 0 520 210" role="img" aria-label="設計の反復ループ">
<text class="k-title" x="260" y="20" text-anchor="middle">設計の流れと戻りループ</text>
<g class="k-shadow">
<rect class="k-panel" x="14" y="44" width="88" height="48" rx="8"/><rect class="k-panel" x="114" y="44" width="88" height="48" rx="8"/>
<rect class="k-panel" x="214" y="44" width="88" height="48" rx="8"/><rect class="k-panel" x="314" y="44" width="88" height="48" rx="8"/>
<rect class="k-panel" x="414" y="44" width="92" height="48" rx="8"/>
</g>
<text class="lbl" x="58" y="65" text-anchor="middle">要求仕様</text><text class="tick" x="58" y="82" text-anchor="middle">荷重・寿命</text>
<text class="lbl" x="158" y="65" text-anchor="middle">構想</text><text class="tick" x="158" y="82" text-anchor="middle">方式・配置</text>
<text class="lbl" x="258" y="65" text-anchor="middle">寸法決め</text><text class="tick" x="258" y="82" text-anchor="middle">負荷側から</text>
<text class="lbl" x="358" y="65" text-anchor="middle">検証</text><text class="tick" x="358" y="82" text-anchor="middle">強度・剛性</text>
<text class="lbl" x="460" y="65" text-anchor="middle">計算書・図面</text><text class="tick" x="460" y="82" text-anchor="middle">レビュー</text>
<g class="k-move" style="marker-end:url(#k-arrow-blue)"><line x1="102" y1="68" x2="112" y2="68"/><line x1="202" y1="68" x2="212" y2="68"/><line x1="302" y1="68" x2="312" y2="68"/><line x1="402" y1="68" x2="412" y2="68"/></g>
<path d="M358,92 C358,140 258,140 258,96" style="fill:none;stroke:var(--tb-bad);marker-end:url(#k-arrow-red)" stroke-width="2"/>
<text class="k-bad-t" x="308" y="150" text-anchor="middle">NG → 寸法を見直す</text>
<path d="M440,92 C420,190 170,190 158,96" style="fill:none;stroke:var(--tb-bad);stroke-dasharray:5 4;marker-end:url(#k-arrow-red)" stroke-width="2"/>
<text class="k-bad-t" x="300" y="196" text-anchor="middle">レビュー指摘 → 構想から見直すこともある</text>
</svg>
<p class="tb-caption">図: 検証で NG なら寸法決めへ、レビューで方式に問題があれば構想まで戻る</p>
<h2>計算例 — 小形コンベア駆動部の全体像</h2>
<p>条件: 搬送物合計 50 kg、すべり床 (摩擦係数 μ = 0.3)、ベルト速度 0.3 m/s、駆動プーリ径 100 mm、減速機効率 0.85、4 極モータ (定格 1450 min<sup>−1</sup>)。</p>
<table class="tb-table">
<tr><th>段階</th><th>計算</th><th>結果</th></tr>
<tr><td>負荷力</td><td>μmg = 0.3 × 50 × 9.81</td><td>147 N</td></tr>
<tr><td>余裕込み</td><td>ベルト・プーリの抵抗分として × 1.5 (目安)</td><td>221 N</td></tr>
<tr><td>プーリトルク</td><td>221 × 0.05</td><td>11.0 N·m</td></tr>
<tr><td>プーリ回転数</td><td>60 × 0.3 / (π × 0.1)</td><td>57.3 min<sup>−1</sup></td></tr>
<tr><td>減速比</td><td>1450 / 57.3 = 25.3 → 系列から i = 25</td><td>実速度 0.304 m/s</td></tr>
<tr><td>モータトルク</td><td>11.0 / (25 × 0.85)</td><td>0.52 N·m (≈ 79 W)</td></tr>
<tr><td>モータ選定</td><td>0.1 kW (定格 0.66 N·m)</td><td>負荷率 79 %</td></tr>
<tr><td>軸径 (ねじりのみ)</td><td>τa = 25 MPa で d = (16T/πτa)<sup>1/3</sup></td><td>13.1 mm → 曲げ・軸受を考え φ20</td></tr>
</table>
<p>ここまでで、減速機の出力軸トルク (11 N·m × サービスファクタ)、プーリ軸の曲げ (ベルト張力から)、軸受反力と寿命、軸受台の締結ボルトへと計算が続きます。各段の結果を<b>次の段の入力</b>として計算書に引き継ぐのがポイントです。</p>
<h2>手順 4 — 計算書と図面にまとめる</h2>
<p>計算書には条件・仮定・式・結果・判定を、図面には計算で決めた寸法と公差・材料・熱処理を書きます。計算書の番号を図面の注記から参照できるようにすると、変更時の追跡が楽になります (書き方は「強度計算書の書き方」の章)。</p>
<h2>よくある失敗</h2>
<ul>
<li>モータを先に決めてしまい、後で減速比が系列に合わず全体を作り直す</li>
<li>定常の負荷力だけで選び、起動時の加速力・停止時の衝撃を忘れる</li>
<li>軸と軸受を計算したが、それを支える軸受台・フレームの剛性を確認しない</li>
<li>反復で値を変えたのに、計算書の前段の数値を更新しない</li>
</ul>
<h2>設計チェックリスト</h2>
<ul>
<li>設計条件表 (荷重・速度・寿命・環境・運転パターン) を最初に作ったか</li>
<li>構想で複数案を比較し、選んだ理由を残したか</li>
<li>動力の流れ・荷重の流れのすべての要素を確認したか</li>
<li>モータ・減速機の容量に、起動・停止・衝撃の余裕を入れたか</li>
<li>計算書と図面の数値が一致しているか</li>
</ul>
`,
    points: [
      "設計は要求を荷重・運転条件の数値に直すことから始まる",
      "寸法は負荷側から: 負荷 → 減速比 → モータ → 軸 → 軸受 → フレーム",
      "反力の流れ (軸受台・フレーム・床) も設計対象",
      "検証 NG やレビュー指摘で前段に戻る反復は設計の一部",
      "各段の結果を次段の入力として計算書に引き継ぐ",
    ],
    exercises: [
      {
        q: "本文の例で、ベルト速度を 0.5 m/s に上げます (プーリ径・負荷は同じ)。必要な減速比とモータ出力を求めてください。",
        a: "プーリ回転数 n = 60 × 0.5 / (π × 0.1) ≈ 95.5 min<sup>−1</sup>。減速比 1450 / 95.5 ≈ 15.2 → 系列から i = 15 (実速度 ≈ 0.506 m/s)。トルクは同じ 11.0 N·m なので、モータトルク 11.0 / (15 × 0.85) ≈ 0.865 N·m、出力 ≈ 0.865 × 1450 × 2π/60 ≈ <b>131 W</b> → 0.2 kW を選定します (0.1 kW では不足)。",
      },
      {
        q: "搬送物 50 kg を 0.5 s で 0 → 0.3 m/s まで加速するときの加速力を求め、本文の余裕込み負荷力 221 N と比べてください。",
        a: "加速度 a = 0.3 / 0.5 = 0.6 m/s²、加速力 ma = 50 × 0.6 = <b>30 N</b>。221 N に比べて小さく (約 14 %)、この例では定常の摩擦が支配的です。ただし、ベルトとプーリ・モータの回転部の慣性も加わるので、起動トルクはモータの起動トルク仕様と比べて確認します。",
      },
      {
        q: "プーリ軸 (φ20) が軸受間 200 mm の中央でベルト張力の合力 600 N を受けます。曲げ応力を求めてください (単純支持)。",
        a: "M = FL/4 = 600 × 200 / 4 = 30 000 N·mm。Z = πd³/32 = π × 20³ / 32 ≈ 785 mm³。σ = M/Z ≈ <b>38 MPa</b>。ねじり 11.0 N·m (τ = 16T/πd³ ≈ 7.0 MPa) と合成しても、キー溝・疲労を見込んだ許容応力 (例えば 60 MPa) 以下です。",
      },
    ],
    quiz: [
      {
        q: "寸法決めの基本的な順番として適切なものはどれか。",
        choices: ["モータ → 減速比 → 負荷", "負荷 → 減速比 → モータ → 軸 → 軸受", "軸受 → 軸 → 負荷 → モータ", "フレーム → モータ → 負荷"],
        answer: 1,
        explain: "負荷が決まらないと減速比もモータも決まりません。負荷側から順に決め、問題があれば戻ります。",
      },
      {
        q: "荷重の流れ (反力の経路) に含まれないものはどれか。",
        choices: ["軸受", "軸受台", "フレーム", "モータのエンコーダ"],
        answer: 3,
        explain: "反力は軸 → 軸受 → 軸受台 → フレーム → 床と流れます。エンコーダは信号の要素で荷重経路ではありません。",
      },
      {
        q: "検証で軸受寿命が不足した。設計の進め方として最も適切なのはどれか。",
        choices: ["計算書から軸受寿命の項目を削る", "寸法決めに戻り、軸受サイズや支持スパンを見直して再計算する", "安全率を 1 未満にする", "図面だけ直して計算書はそのままにする"],
        answer: 1,
        explain: "反復は設計の一部です。前段に戻って見直し、計算書も更新します。",
      },
    ],
  },
  {
    id: "gear-unit-design",
    part: "elements",
    title: "歯車減速装置の設計 — 歯数・モジュール・軸・軸受・ケース",
    minutes: 40,
    level: 3,
    lead: "2 段平歯車減速装置を例に、減速比の配分、歯数とモジュールの決定 (曲げ強さと歯面強さの概略チェック)、中心距離、歯車力から求める軸荷重、軸径、軸受寿命、ケースの設計までを一続きで行います。個々の歯車の理論は「歯車」の章を参照してください。",
    body: `
<h2>全体の流れ</h2>
<p>減速装置の設計は、<b>(1) 減速比の配分 → (2) 歯数・モジュール・歯幅 → (3) 中心距離 → (4) 歯車力から軸荷重 → (5) 軸径 → (6) 軸受選定 → (7) ケース・潤滑</b> の順に進めます。(4) 以降で寸法が収まらなければ (2) に戻ります。</p>
<svg class="tb-chart" viewBox="0 0 520 270" role="img" aria-label="2段平歯車減速装置の断面図">
<text class="k-title" x="260" y="20" text-anchor="middle">2 段平歯車減速装置 (展開図・インライン配置)</text>
<g class="k-shadow"><rect class="k-alu" x="60" y="36" width="400" height="214" rx="10"/></g>
<rect x="76" y="50" width="368" height="186" rx="6" style="fill:var(--tb-bg);opacity:0.85"/>
<rect class="k-part-h" x="20" y="68" width="190" height="10"/>
<rect class="k-part-h" x="76" y="133" width="368" height="12"/>
<rect class="k-part-h" x="310" y="198" width="190" height="14"/>
<line class="k-center" x1="14" y1="73" x2="220" y2="73"/><line class="k-center" x1="70" y1="139" x2="450" y2="139"/><line class="k-center" x1="300" y1="205" x2="506" y2="205"/>
<rect class="k-accent" x="140" y="58" width="20" height="30" rx="2"/>
<rect class="k-part" x="140" y="96" width="20" height="86" rx="2"/>
<rect class="k-accent" x="330" y="120" width="30" height="38" rx="2"/>
<rect class="k-part" x="330" y="166" width="30" height="78" rx="2"/>
<g class="k-part"><rect x="80" y="62" width="16" height="22"/><rect x="190" y="62" width="16" height="22"/><rect x="80" y="127" width="18" height="24"/><rect x="422" y="127" width="18" height="24"/><rect x="314" y="193" width="20" height="24"/><rect x="424" y="193" width="20" height="24"/></g>
<text class="lbl" x="34" y="62">入力軸</text><text class="lbl" x="456" y="232">出力軸</text>
<text class="tick" x="170" y="56">z1=18 (m2)</text><text class="tick" x="166" y="114">z2=99</text>
<text class="tick" x="366" y="118">z3=18 (m3)</text><text class="tick" x="366" y="180">z4=79</text>
<text class="tick" x="290" y="160" text-anchor="middle">中間軸</text>
<line class="k-dimline" x1="236" y1="73" x2="236" y2="139" style="marker-start:url(#k-arrow);marker-end:url(#k-arrow)"/><text class="k-dimtext" x="240" y="108">a1=117</text>
<line class="k-dimline" x1="290" y1="139" x2="290" y2="205" style="marker-start:url(#k-arrow);marker-end:url(#k-arrow)"/><text class="k-dimtext" x="248" y="178">a2=145.5</text>
<text class="tick" x="98" y="250">軸受 6 個・ケースは分割形 (アルミ鋳物など)</text>
</svg>
<p class="tb-caption">図: 1 段目 (m = 2) で 5.5、2 段目 (m = 3) で 4.39 減速。低速段ほどトルクが大きく、モジュールと歯幅も大きくする</p>
<h2>減速比の配分</h2>
<p>総減速比 i を 2 段に分けるとき、大歯車の直径をそろえる (ケースを小さく、両段の大歯車の油浸かりをそろえる) ために、<b>1 段目をやや大きく</b>するのが一般的です。目安として <span class="tb-m">i_1 \\approx (1.1\\text{〜}1.3)\\sqrt{i}</span> 程度とし、1 段の減速比は平歯車で 6〜7 程度までに抑えます (目安)。歯数は互いに素 (公約数をもたない) にすると摩耗が均一になります。</p>
<h2>モジュールの概略決定 — 曲げと歯面</h2>
<p>歯元の<b>曲げ強さ</b>はルイスの式、歯面の<b>ピッチング</b>は簡略化したヘルツ接触応力で確認します。正式な強度計算は JIS B 1759 (曲げ)・B 1760 (歯面) などの規格の手順に従いますが、構想段階はこれで十分です。</p>
<div class="tb-math">\\begin{aligned} F_t &amp;= \\dfrac{2T}{d}, \\qquad F_r = F_t \\tan\\alpha \\\\ \\sigma_F &amp;= \\dfrac{K_v F_t}{b\\,m\\,Y} \\qquad (Y:\\ \\text{歯形係数}) \\\\ \\sigma_H &amp;= Z_H Z_E \\sqrt{\\dfrac{K_v F_t}{b\\,d_1}\\cdot\\dfrac{u+1}{u}} \\end{aligned}</div>
<p>ここで u は歯数比、<span class="tb-m">Z_E \\approx 189.8\\,\\sqrt{\\mathrm{MPa}}</span> (鋼どうし)、<span class="tb-m">Z_H \\approx 2.49</span> (圧力角 20°、標準平歯車)、Y はモジュール基準の歯形係数 (z = 18 で約 0.31)、K<sub>v</sub> は動荷重係数 (ここでは 1.2) です。許容値は材料・熱処理で大きく変わり、調質鋼で曲げ 150〜250 MPa、歯面 500〜700 MPa 程度、浸炭焼入れ鋼ではその約 2 倍程度が目安です。</p>
<h2>計算例 — 2.2 kW、1450 → 約 60 min<sup>−1</sup></h2>
<p>総減速比 i = 24.2。i<sub>1</sub> = 5.5 (z1 = 18, z2 = 99)、i<sub>2</sub> = 79/18 = 4.39 (z3 = 18, z4 = 79)、総減速比 24.14、出力 60.1 min<sup>−1</sup>。1 段あたり効率 0.98。</p>
<table class="tb-table">
<tr><th>項目</th><th>1 段目</th><th>2 段目</th></tr>
<tr><td>小歯車トルク</td><td>T1 = 9550 × 2.2 / 1450 = 14.5 N·m</td><td>T2 = 14.5 × 5.5 × 0.98 = 78.1 N·m</td></tr>
<tr><td>モジュール・歯幅</td><td>m = 2, b = 20 mm</td><td>m = 3, b = 30 mm</td></tr>
<tr><td>ピッチ円直径</td><td>d1 = 36, d2 = 198 mm</td><td>d3 = 54, d4 = 237 mm</td></tr>
<tr><td>接線力 Ft</td><td>805 N</td><td>2893 N</td></tr>
<tr><td>曲げ応力 σF</td><td>1.2 × 805 / (20 × 2 × 0.31) = 78 MPa</td><td>1.2 × 2893 / (30 × 3 × 0.31) = 124 MPa</td></tr>
<tr><td>歯面応力 σH</td><td>595 MPa</td><td>767 MPa</td></tr>
<tr><td>中心距離 a = m(z+z')/2</td><td>117 mm</td><td>145.5 mm</td></tr>
</table>
<p>2 段目の歯面応力 767 MPa は調質鋼の目安を超えるので、<b>小歯車を高周波焼入れ・浸炭焼入れ</b>するか、歯幅を増やします (σH は <span class="tb-m">1/\\sqrt{b}</span> に比例: b = 40 mm で約 664 MPa)。出力トルクは 78.1 × 4.39 × 0.98 ≈ 336 N·m です。</p>
<h2>中間軸の荷重と軸径</h2>
<p>インライン配置では、大歯車 z2 は上側で、小歯車 z3 は下側でかみ合います。このとき<b>接線力は同じ向き</b> (足し合う)、<b>半径方向力は逆向き</b>になります。軸受 A を x = 0、z2 を 40 mm、z3 を 110 mm、軸受 B を 150 mm に置きます。</p>
<svg class="tb-chart" viewBox="0 0 520 220" role="img" aria-label="中間軸の荷重と曲げモーメント">
<text class="k-title" x="260" y="20" text-anchor="middle">中間軸 — 歯車力と軸受反力</text>
<rect class="k-part-h" x="60" y="72" width="400" height="16"/>
<line class="k-center" x1="40" y1="80" x2="480" y2="80"/>
<rect class="k-part" x="50" y="64" width="24" height="32"/><rect class="k-part" x="446" y="64" width="24" height="32"/>
<rect class="k-part" x="158" y="38" width="16" height="84" rx="2"/><rect class="k-accent" x="342" y="58" width="28" height="44" rx="2"/>
<line class="k-force" x1="166" y1="132" x2="166" y2="162"/><text class="k-bad-t" x="130" y="176">Ft2=789 N</text>
<line class="k-force" x1="356" y1="132" x2="356" y2="162"/><text class="k-bad-t" x="320" y="176">Ft3=2893 N</text>
<line class="k-move" x1="62" y1="160" x2="62" y2="104" style="marker-end:url(#k-arrow-blue)"/><text class="mark-t" x="36" y="176" style="fill:var(--tb-accent)">RA=1352 N</text>
<line class="k-move" x1="458" y1="160" x2="458" y2="104" style="marker-end:url(#k-arrow-blue)"/><text class="mark-t" x="420" y="190" style="fill:var(--tb-accent)">RB=2433 N</text>
<line class="k-dimline" x1="62" y1="200" x2="166" y2="200" style="marker-start:url(#k-arrow);marker-end:url(#k-arrow)"/><text class="k-dimtext" x="104" y="212">40</text>
<line class="k-dimline" x1="166" y1="200" x2="356" y2="200" style="marker-start:url(#k-arrow);marker-end:url(#k-arrow)"/><text class="k-dimtext" x="254" y="212">70</text>
<line class="k-dimline" x1="356" y1="200" x2="458" y2="200" style="marker-start:url(#k-arrow);marker-end:url(#k-arrow)"/><text class="k-dimtext" x="402" y="212">40</text>
<text class="tick" x="166" y="34" text-anchor="middle">z2 (d=198)</text><text class="tick" x="356" y="52" text-anchor="middle">z3 (d=54)</text>
</svg>
<p class="tb-caption">図: 接線方向の面の力を示す (半径方向力 Fr2 = 287 N、Fr3 = 1053 N は直交面で逆向き)。RA・RB は両面の合成値</p>
<ul>
<li>接線面: RA = 1350 N、RB = 2332 N。半径面: RA = 70 N、RB = 695 N。合成 RA = <b>1352 N</b>、RB = <b>2433 N</b></li>
<li>最大曲げは z3 位置: 接線面 93.3 N·m、半径面 27.8 N·m、合成 M = <b>97.3 N·m</b></li>
<li><span class="tb-m">T_e = \\sqrt{M^2+T^2} = 124.8\\,\\mathrm{N\\cdot m}</span> → τa = 40 MPa で d = 25.1 mm。<span class="tb-m">M_e = (M+T_e)/2 = 111.1\\,\\mathrm{N\\cdot m}</span> → σa = 60 MPa で d = 26.6 mm → キー溝を考え <b>φ30</b></li>
</ul>
<h2>軸受の選定</h2>
<p>中間軸回転数 n = 1450 / 5.5 = 264 min<sup>−1</sup>。荷重係数 1.2 を掛け P = 2433 × 1.2 = 2920 N。内径 30 mm の深溝玉軸受 (基本動定格荷重 C ≈ 19.5 kN の代表値) で</p>
<div class="tb-math">L_{10h} = \\dfrac{10^6}{60\\,n}\\left(\\dfrac{C}{P}\\right)^3 = \\dfrac{10^6}{60 \\times 264}\\left(\\dfrac{19500}{2920}\\right)^3 \\approx 1.88 \\times 10^4\\ \\mathrm{h}</div>
<p>目標 20 000 h にわずかに届かないので、C の大きい軸受 (幅広形・ころ軸受) にするか、z3 を軸受 B から離さない配置を見直します。<b>重い歯車ほど軸受の近くに置く</b>のが原則です。</p>
<h2>ケースと潤滑</h2>
<ul>
<li>軸受穴の同軸度・中心距離の公差は歯当たりを左右する (中心距離の許容差は歯車精度等級に合わせる)</li>
<li>軸受穴まわりはリブで補強し、分割面にボルトを均等に配置する</li>
<li>油浴潤滑では大歯車が歯たけの 1〜3 倍程度浸かる油面 (目安) とし、油面計・ブリーザ・ドレンを付ける</li>
<li>損失 (効率 0.98 × 2 段で約 4 %) は 2.2 kW で約 88 W。ケース表面から放熱できるか確認する</li>
</ul>
<h2>よくある失敗</h2>
<ul>
<li>1 段目と 2 段目に同じモジュールを使い、低速段の歯面が先に損傷する</li>
<li>接線力・半径方向力の向きを取り違え、軸受反力を過小評価する</li>
<li>歯車を軸の中央に置き、たわみによる片当たりが起きる</li>
<li>歯数比を整数にして同じ歯どうしが当たり続け、摩耗が偏る</li>
</ul>
<h2>設計チェックリスト</h2>
<ul>
<li>減速比の配分と歯数 (互いに素、アンダカットしない最小歯数) を確認したか</li>
<li>曲げ・歯面の両方を、熱処理を含めて確認したか</li>
<li>歯車力の向きを両平面で整理し、軸の合成モーメントを求めたか</li>
<li>軸受寿命が目標を満たし、軸受内径と軸径が整合しているか</li>
<li>ケースの剛性・中心距離公差・潤滑・放熱を確認したか</li>
</ul>
`,
    points: [
      "減速比は 1 段目をやや大きく配分し、1 段あたり 6〜7 程度まで (目安)",
      "曲げはルイスの式、歯面は簡略ヘルツ式で概略チェックし、正式には規格の手順で",
      "低速段ほどトルクが大きく、モジュール・歯幅・熱処理を強化する",
      "歯車力は接線・半径の 2 平面に分けて軸受反力と合成モーメントを求める",
      "重い歯車は軸受の近くに置き、たわみと軸受荷重を減らす",
    ],
    exercises: [
      {
        q: "本文の 2 段目で歯幅を 30 mm から 40 mm にしたときの曲げ応力と歯面応力を求めてください。",
        a: "σF ∝ 1/b なので 124 × 30/40 ≈ <b>93 MPa</b>。σH ∝ 1/√b なので 767 × √(30/40) ≈ <b>664 MPa</b>。歯面は調質鋼の目安上限付近まで下がりますが、余裕は小さいので小歯車の表面硬化も併せて検討します。",
      },
      {
        q: "1 段目の小歯車 (z1 = 18, m = 2, b = 20) について、入力軸トルクが起動時に定格の 2 倍になる場合の曲げ応力を求めてください。",
        a: "Ft = 2 × 805 = 1610 N。σF = 1.2 × 1610 / (20 × 2 × 0.31) ≈ <b>156 MPa</b>。調質鋼の目安 150〜250 MPa の範囲内ですが、起動頻度が高い場合は疲労を考え、表面硬化や m = 2.5 を検討します。",
      },
      {
        q: "中間軸の軸受 B に、C = 27 kN の軸受を使うと寿命はいくらになりますか (P = 2920 N、n = 264 min⁻¹)。",
        a: "L<sub>10h</sub> = 10⁶ / (60 × 264) × (27000 / 2920)³ ≈ 63.1 × 790.6 ≈ <b>4.99 × 10⁴ h</b>。寿命は C/P の 3 乗に比例するので、C を 1.38 倍にすると寿命は約 2.6 倍になります。",
      },
    ],
    quiz: [
      {
        q: "インライン配置の中間軸で、大歯車 (上側でかみ合う) と小歯車 (下側でかみ合う) の力について正しいものはどれか。",
        choices: ["接線力も半径方向力も同じ向き", "接線力は同じ向き、半径方向力は逆向き", "接線力は逆向き、半径方向力は同じ向き", "どちらも打ち消し合って軸受荷重は 0"],
        answer: 1,
        explain: "反対側でかみ合うと、回転方向の関係から接線力は足し合い、中心へ向かう半径方向力は逆向きになります。",
      },
      {
        q: "歯幅を 2 倍にすると、簡略ヘルツ式の歯面応力はどうなるか。",
        choices: ["1/2 になる", "約 0.71 倍になる", "変わらない", "2 倍になる"],
        answer: 1,
        explain: "σH は √(Ft/(b d)) に比例するので、b を 2 倍にすると 1/√2 ≈ 0.71 倍です。",
      },
      {
        q: "2 段減速で低速段のモジュールを大きくする主な理由はどれか。",
        choices: ["回転数が高いから", "伝えるトルクが大きく歯車力が大きいから", "騒音を大きくするため", "潤滑油を減らすため"],
        answer: 1,
        explain: "減速するほどトルクが増え、同じ寸法では歯元曲げ・歯面応力が大きくなるためです。",
      },
    ],
  },
  {
    id: "conveyor-design",
    part: "elements",
    title: "ベルトコンベアの設計 — 駆動力・ベルト張力・プーリ",
    minutes: 35,
    level: 2,
    lead: "ベルトコンベアは、走行抵抗から駆動力と動力を求め、プーリでベルトが滑らない張力と、たるみを抑える張力を確保し、その張力からプーリ軸と緊張装置 (テークアップ) を設計します。オイラーの式を中心に、ローラ支持の水平コンベアで計算します。",
    body: `
<h2>コンベアの構成と抵抗</h2>
<p>ベルトコンベアの駆動力は、ローラやすべり床の<b>走行抵抗</b>、傾斜の<b>持上げ抵抗</b>、プーリ・スクレーパなどの<b>付加抵抗</b>の合計です。ローラ支持の場合、走行抵抗は回転部・ベルト・搬送物の重さに<b>見かけの摩擦係数 f</b> (0.02〜0.03 程度、目安) を掛けて見積もります。</p>
<div class="tb-math">F_H = f\\,g\\,L\\,(2q_B + q_{RO} + q_{RU} + q_G) \\qquad F_{St} = q_G\\,g\\,H \\qquad P = \\dfrac{F_U\\,v}{\\eta}</div>
<p>q<sub>B</sub>: ベルト質量 [kg/m]、q<sub>RO</sub>・q<sub>RU</sub>: キャリア側・リターン側ローラの回転部質量 [kg/m]、q<sub>G</sub>: 搬送物 [kg/m]、L: 機長、H: 揚程。F<sub>U</sub> は付加抵抗を含めた周方向の駆動力です。すべり床式なら走行抵抗は <span class="tb-m">\\mu (q_B + q_G) g L</span> 程度で、ローラ式より大きくなります。</p>
<svg class="tb-chart" viewBox="0 0 520 240" role="img" aria-label="ベルトコンベアの構成と張力">
<text class="k-title" x="260" y="20" text-anchor="middle">ベルトコンベアの構成 — 張り側 T1・緩み側 T2</text>
<line class="k-ground" x1="20" y1="224" x2="500" y2="224"/>
<g class="k-shadow">
<rect class="k-alu" x="70" y="122" width="380" height="12" rx="2"/>
<rect class="k-alu" x="96" y="134" width="12" height="90"/><rect class="k-alu" x="414" y="134" width="12" height="90"/>
<rect class="k-plastic" x="190" y="70" width="60" height="34" rx="3"/><rect class="k-plastic" x="300" y="74" width="48" height="30" rx="3"/>
</g>
<path d="M70,104 L450,104 A30,30 0 0 1 450,164 L330,164 A14,14 0 0 0 330,192 L290,192 A14,14 0 0 0 290,164 L70,164 A30,30 0 0 1 70,104 Z" style="fill:none;stroke:var(--k-rubber,#333);stroke-width:5"/>
<circle class="k-part" cx="450" cy="134" r="27"/><circle class="k-part" cx="70" cy="134" r="27"/>
<circle class="k-part" cx="310" cy="192" r="12"/>
<g class="k-part"><circle cx="150" cy="112" r="6"/><circle cx="270" cy="112" r="6"/><circle cx="380" cy="112" r="6"/><circle cx="170" cy="156" r="6"/><circle cx="390" cy="156" r="6"/></g>
<line class="k-move" x1="200" y1="56" x2="320" y2="56" style="marker-end:url(#k-arrow-blue)"/><text class="mark-t" x="260" y="50" text-anchor="middle" style="fill:var(--tb-accent)">v</text>
<text class="lbl" x="490" y="214" text-anchor="end">駆動プーリ</text>
<text class="lbl" x="22" y="214">従動プーリ</text>
<text class="k-bad-t" x="400" y="98">T1</text><text class="k-bad-t" x="404" y="182">T2</text>
<line class="k-force" x1="310" y1="206" x2="310" y2="222"/>
<text class="tick" x="140" y="212">テークアップ (重錘 2T2) →</text>
<text class="tick" x="40" y="62">キャリアローラ (ピッチ a)</text><line class="k-thin" x1="100" y1="66" x2="148" y2="106"/>
<path d="M466,118 A20,20 0 0 1 466,150" style="fill:none;stroke:var(--tb-accent);marker-end:url(#k-arrow-blue)" stroke-width="2"/>
<text class="tick" x="440" y="98">θ=180°</text>
</svg>
<p class="tb-caption">図: 駆動プーリで張り側 T1 と緩み側 T2 の差が駆動力になる。テークアップで T2 を確保する</p>
<h2>張力 — 滑らない条件とたるみの条件</h2>
<p>駆動プーリでベルトが滑らない条件は<b>オイラーの式</b>で表されます。μ はベルトとプーリの摩擦係数 (ゴムライニングで 0.25〜0.35 程度、湿潤時は下がる)、θ は巻付け角です。</p>
<div class="tb-math">F_U = T_1 - T_2, \\qquad \\dfrac{T_1}{T_2} \\le e^{\\mu\\theta} \\quad\\Rightarrow\\quad T_{2,\\min} = \\dfrac{F_U}{e^{\\mu\\theta}-1}</div>
<p>もう一つの条件が<b>たるみ</b>です。ローラ間でベルトがたるみすぎると搬送物がこぼれ、走行抵抗も増えます。ローラピッチ a、許容たるみ率 h/a (0.5〜2 % 程度、目安) から、ベルトに必要な最小張力は</p>
<div class="tb-math">T_{\\min} \\ge \\dfrac{(q_B + q_G)\\,g\\,a}{8\\,(h/a)_{\\text{許容}}}</div>
<p>短いコンベアでは、滑り条件よりたるみ条件の方が厳しいことがよくあります。</p>
<h2>計算例 — 機長 10 m の水平ローラコンベア</h2>
<p>条件: L = 10 m、v = 0.5 m/s、q<sub>G</sub> = 20 kg/m、q<sub>B</sub> = 3 kg/m、q<sub>RO</sub> = 4 kg/m、q<sub>RU</sub> = 2 kg/m、f = 0.03、付加抵抗 20 % (目安)、駆動プーリ D = 200 mm、μ = 0.3、θ = 180°、η = 0.85、ローラピッチ 1.0 m、許容たるみ 2 %。</p>
<table class="tb-table">
<tr><th>項目</th><th>計算</th><th>結果</th></tr>
<tr><td>走行抵抗 F<sub>H</sub></td><td>0.03 × 9.81 × 10 × (6 + 4 + 2 + 20)</td><td>94.2 N</td></tr>
<tr><td>駆動力 F<sub>U</sub></td><td>94.2 × 1.2</td><td>113 N</td></tr>
<tr><td>所要動力</td><td>113 × 0.5 / 0.85</td><td>66.5 W → 0.1 kW</td></tr>
<tr><td>e<sup>μθ</sup></td><td>e<sup>0.3π</sup></td><td>2.57</td></tr>
<tr><td>滑り防止の T2</td><td>113 / (2.57 − 1)</td><td>72 N</td></tr>
<tr><td>たるみ防止の T2</td><td>(3 + 20) × 9.81 × 1.0 / (8 × 0.02)</td><td><b>1410 N (支配)</b></td></tr>
<tr><td>T1</td><td>1410 + 113</td><td>1523 N</td></tr>
<tr><td>プーリトルク・回転数</td><td>113 × 0.1、60 × 0.5 / (π × 0.2)</td><td>11.3 N·m、47.7 min<sup>−1</sup></td></tr>
<tr><td>プーリ軸荷重</td><td>T1 + T2 (巻付け 180°)</td><td>2933 N</td></tr>
<tr><td>重錘テークアップ</td><td>2 × T2</td><td>2820 N (約 288 kg)</td></tr>
</table>
<p>張力はたるみ条件で決まり、軸荷重は駆動力の約 26 倍になりました。<b>プーリ軸と軸受は、トルクではなく張力で決まる</b>ことが多いのです。ベルト幅 500 mm なら単位幅張力は約 3.0 N/mm で、ベルトの許容張力 (カタログ値) と比べます。重錘が大きすぎる場合は、ねじ式テークアップ (伸び・温度変化を定期調整) とし、張力計で管理します。</p>
<h2>プーリ軸の設計</h2>
<svg class="tb-chart" viewBox="0 0 520 200" role="img" aria-label="駆動プーリ軸の断面と荷重">
<text class="k-title" x="260" y="20" text-anchor="middle">駆動プーリ軸 — 張力合力による曲げ</text>
<rect class="k-part-h" x="40" y="94" width="440" height="16"/>
<line class="k-center" x1="30" y1="102" x2="490" y2="102"/>
<g class="k-shadow"><rect class="k-part" x="150" y="54" width="220" height="96" rx="6"/></g>
<rect class="k-rubber" x="150" y="50" width="220" height="6"/><rect class="k-rubber" x="150" y="148" width="220" height="6"/>
<rect class="k-part" x="80" y="84" width="30" height="36" rx="2"/><rect class="k-part" x="410" y="84" width="30" height="36" rx="2"/>
<rect class="k-plastic" x="440" y="88" width="40" height="28" rx="3"/>
<line class="k-force" x1="200" y1="160" x2="200" y2="186"/><line class="k-force" x1="320" y1="160" x2="320" y2="186"/>
<text class="k-bad-t" x="214" y="184">(T1+T2)/2 ずつ</text>
<text class="tick" x="95" y="78" text-anchor="middle">軸受</text><text class="tick" x="425" y="78" text-anchor="middle">軸受</text>
<text class="tick" x="460" y="80" text-anchor="middle">減速機</text>
<line class="k-dimline" x1="95" y1="40" x2="425" y2="40" style="marker-start:url(#k-arrow);marker-end:url(#k-arrow)"/><text class="k-dimtext" x="260" y="36" text-anchor="middle">軸受スパン 600</text>
</svg>
<p class="tb-caption">図: ベルト張力はプーリ面に分布し、軸にはハブ 2 か所から伝わる。片側に減速機を直結 (中空軸) すると軸受荷重の配分が変わる</p>
<p>軸受スパン 600 mm、プーリハブ位置を軸受から 105 mm とすると、各ハブ荷重 1467 N による曲げモーメントは M = 1467 × 105 ≈ 154 N·m です。これとトルク 11.3 N·m を合成して軸径を決めます (M が支配的)。プーリ面のクラウン (中高) はベルトの蛇行防止に効きます。</p>
<h2>よくある失敗</h2>
<ul>
<li>滑り条件だけで張力を決め、ベルトがローラ間で大きくたるむ</li>
<li>モータトルクだけでプーリ軸を設計し、張力による曲げで軸が折れる・たわむ</li>
<li>湿潤・油の付着で μ が下がることを考えず、起動時にスリップする</li>
<li>テークアップの調整代を取らず、ベルトの初期伸びを吸収できない</li>
</ul>
<h2>設計チェックリスト</h2>
<ul>
<li>走行・持上げ・付加抵抗を合計し、起動時の加速力も確認したか</li>
<li>滑り条件 (オイラーの式) とたるみ条件の両方で T2 を決めたか</li>
<li>プーリ軸・軸受を張力合力で設計したか</li>
<li>テークアップの方式・ストローク・張力管理方法を決めたか</li>
<li>ベルトの許容張力とプーリ最小径 (ベルト仕様) を確認したか</li>
</ul>
`,
    points: [
      "駆動力 = 走行抵抗 + 持上げ抵抗 + 付加抵抗",
      "オイラーの式 T1/T2 ≤ e^(μθ) で滑らない T2 を求める",
      "たるみ条件の T2 が支配することが多い (特に短いコンベア)",
      "プーリ軸・軸受はトルクではなく張力合力 T1+T2 で決まることが多い",
      "テークアップで T2 を確保し、伸びを吸収する",
    ],
    exercises: [
      {
        q: "本文の例で、巻付け角を 210° に増やす (スナブプーリ追加) と、滑り防止に必要な T2 はいくらになりますか。",
        a: "μθ = 0.3 × 210 × π / 180 ≈ 1.100、e<sup>1.100</sup> ≈ 3.00。T2 = 113 / (3.00 − 1) ≈ <b>56.5 N</b> (180° では 72 N)。ただしこの例ではたるみ条件 1410 N が支配するので、全体の張力は変わりません。",
      },
      {
        q: "本文の条件で 5 m の揚程 (傾斜コンベア、搬送物 20 kg/m) を追加します。持上げ抵抗と所要動力を求めてください。",
        a: "F<sub>St</sub> = q<sub>G</sub> g H = 20 × 9.81 × 5 = 981 N。F<sub>U</sub> ≈ 113 + 981 = 1094 N (走行抵抗は傾斜でもほぼ同じとみなす)。P = 1094 × 0.5 / 0.85 ≈ <b>644 W</b> → 0.75 kW。傾斜コンベアでは停電時の逆走防止 (バックストップ・ブレーキ) が必要です。",
      },
      {
        q: "ローラピッチを 1.0 m から 0.6 m に縮めると、たるみ条件の T2 はいくらになりますか。",
        a: "T<sub>min</sub> は a に比例: 1410 × 0.6 = <b>846 N</b>。軸荷重は 2 × 846 + 113 ≈ 1805 N に下がります。ローラ本数とのトレードオフです。",
      },
    ],
    quiz: [
      {
        q: "オイラーの式で、滑らずに伝えられる張力比を大きくする方法として正しいものはどれか。",
        choices: ["巻付け角を小さくする", "摩擦係数を大きくする (ライニング)", "ベルト速度を上げる", "プーリを細くする"],
        answer: 1,
        explain: "T1/T2 ≤ e^(μθ) なので、μ または θ を大きくすると張力比が大きくなります。",
      },
      {
        q: "短い水平ベルトコンベアで、緩み側張力を決める条件として支配的になりやすいのはどれか。",
        choices: ["ベルトの色", "ローラ間のたるみを抑える条件", "モータの極数", "フレームの塗装"],
        answer: 1,
        explain: "駆動力が小さいため滑り条件の T2 は小さく、たるみ条件の方が大きな T2 を要求することが多いです。",
      },
      {
        q: "巻付け角 180° の駆動プーリの軸に加わる張力合力はどれか。",
        choices: ["T1 − T2", "T1 + T2", "(T1 − T2)/2", "T1 × T2"],
        answer: 1,
        explain: "両側のベルトが同じ方向に引くので、合力は T1 + T2 です。T1 − T2 は駆動力です。",
      },
    ],
  },
  {
    id: "lifting-mechanism",
    part: "elements",
    title: "昇降機構の設計 — ボールねじ・ラック・チェーンと保持ブレーキ",
    minutes: 35,
    level: 3,
    lead: "垂直軸は、重力が常に作用し、停電やモータの故障で落下するおそれがある点が水平軸と根本的に違います。重力を含む駆動トルク、逆効率を使った保持トルク、ブレーキの安全率、落下防止とカウンタウエイトの考え方を、ボールねじ昇降軸を例に計算します。",
    body: `
<h2>垂直軸の特徴 — 重力は止まっていてもかかる</h2>
<p>水平軸では停止中のトルクはほぼ 0 ですが、垂直軸では<b>停止中も重力分の保持トルク</b>が必要です。上昇加速時は重力と慣性力が足し合い、下降減速時も同様に重力と慣性力が同じ向きになるため、最大トルクはこの 2 つの場面で生じます。</p>
<svg class="tb-chart" viewBox="0 0 520 284" role="img" aria-label="ボールねじ昇降軸と保持ブレーキの構成">
<text class="k-title" x="390" y="20" text-anchor="middle">ボールねじ昇降軸の構成</text>
<line class="k-ground" x1="40" y1="262" x2="300" y2="262"/>
<g class="k-shadow">
<rect class="k-alu" x="70" y="40" width="22" height="222"/>
<rect class="k-alu" x="218" y="40" width="22" height="222"/>
<rect class="k-part" x="60" y="40" width="190" height="16" rx="2"/>
<rect class="k-part" x="60" y="232" width="190" height="16" rx="2"/>
<rect class="k-accent" x="96" y="120" width="118" height="44" rx="4"/>
<rect class="k-part" x="130" y="248" width="50" height="14" rx="2"/>
</g>
<rect class="k-part-h" x="149" y="56" width="12" height="176"/>
<g class="k-thin"><line x1="149" y1="70" x2="161" y2="76"/><line x1="149" y1="90" x2="161" y2="96"/><line x1="149" y1="180" x2="161" y2="186"/><line x1="149" y1="200" x2="161" y2="206"/></g>
<rect class="k-part" x="140" y="132" width="30" height="20" rx="2"/>
<rect class="k-plastic" x="96" y="164" width="118" height="26" rx="3"/>
<text class="lbl" x="155" y="182" text-anchor="middle" style="font-size:11px">ワーク m</text>
<line class="k-force" x1="155" y1="194" x2="155" y2="226"/>
<text class="k-bad-t" x="164" y="222">mg</text>
<rect class="k-part" x="134" y="262" width="42" height="0"/>
<text class="tick" x="10" y="216">リニアガイド</text><line class="k-thin" x1="40" y1="206" x2="72" y2="190"/>
<text class="lbl" x="256" y="50">ボールねじ (リード l)</text>
<line class="k-thin" x1="158" y1="70" x2="254" y2="46"/>
<text class="tick" x="190" y="276">固定側軸受</text><line class="k-thin" x1="178" y1="258" x2="196" y2="266"/>
<rect class="k-part" x="330" y="60" width="80" height="60" rx="6"/>
<rect class="k-yellow" x="330" y="120" width="80" height="22" rx="3"/>
<text class="lbl" x="370" y="94" text-anchor="middle">モータ</text>
<text class="lbl" x="370" y="136" text-anchor="middle" style="font-size:11px">保持ブレーキ</text>
<text class="tick" x="420" y="160">無励磁作動形:</text><text class="tick" x="420" y="176">電源断で制動</text>
<line class="k-move" x1="330" y1="150" x2="250" y2="234" style="marker-end:url(#k-arrow-blue)"/>
<text class="tick" x="268" y="210">タイミングベルト</text>
<rect class="k-yellow" x="22" y="140" width="40" height="14" rx="2"/>
<text class="tick" x="10" y="134">落下防止</text>
<text class="tick" x="10" y="172">ストッパ</text>
</svg>
<p class="tb-caption">図: モータ直結または折返しベルトでねじを回す。ブレーキは電源断で働く無励磁作動形とし、機械的な落下防止も併用する</p>
<h2>駆動トルクと保持トルク</h2>
<p>ボールねじの正効率 η (ねじを回して荷重を動かす)、逆効率 η' (荷重がねじを回す) を使います。ボールねじは η' も大きい (0.8 程度以上) ので、<b>荷重だけでねじが回って落下します</b> (逆作動)。</p>
<div class="tb-math">\\begin{aligned} T_{\\text{上昇加速}} &amp;= \\dfrac{m\\,(g + a)\\,l}{2\\pi\\eta} \\qquad T_{\\text{定速上昇}} = \\dfrac{m g\\,l}{2\\pi\\eta} \\\\ T_{\\text{保持}} &amp;= \\dfrac{m g\\,l\\,\\eta'}{2\\pi} \\qquad T_B \\ge S_B\\,T_{\\text{保持}} \\end{aligned}</div>
<p>保持トルクは逆効率で計算します (荷重がねじを回そうとするトルク)。ブレーキの静摩擦トルク T<sub>B</sub> には安全率 S<sub>B</sub> を掛けます。S<sub>B</sub> = 2 程度以上が目安で、摩耗・油の付着・温度でブレーキトルクが下がることを見込みます。モータのトルク計算には、ここにモータ・ねじの回転慣性による加速トルクを加えます。</p>
<h2>計算例 — 50 kg を 0.5 m/s で上下</h2>
<p>条件: m = 50 kg (可動部全体)、リード 10 mm、η = 0.9、η' = 0.8、加減速度 2 m/s²、モータ直結。</p>
<table class="tb-table">
<tr><th>場面</th><th>計算</th><th>トルク</th></tr>
<tr><td>上昇加速</td><td>50 × (9.81 + 2) × 0.01 / (2π × 0.9)</td><td><b>1.04 N·m</b></td></tr>
<tr><td>定速上昇</td><td>50 × 9.81 × 0.01 / (2π × 0.9)</td><td>0.87 N·m</td></tr>
<tr><td>下降減速 (負荷が回す側)</td><td>50 × (9.81 + 2) × 0.01 × 0.8 / (2π)</td><td>0.75 N·m (回生)</td></tr>
<tr><td>停止保持</td><td>50 × 9.81 × 0.01 × 0.8 / (2π)</td><td>0.62 N·m</td></tr>
<tr><td>ブレーキ必要トルク</td><td>0.62 × 2</td><td><b>1.25 N·m 以上</b></td></tr>
<tr><td>モータ回転数</td><td>0.5 / 0.01 × 60</td><td>3000 min<sup>−1</sup></td></tr>
</table>
<p>下降減速では負荷側からエネルギーが戻る (回生) ので、サーボアンプの回生抵抗の容量も確認します。ベルト減速を挟む場合、ブレーキをモータ側に付けると<b>ベルトが切れたら保持できません</b>。ベルト切れを想定する場合は、ねじ軸側にブレーキを付けるか、別の落下防止を設けます。</p>
<h2>カウンタウエイト</h2>
<p>可動部と釣り合う重りをチェーンやワイヤで吊ると、重力分のトルクが小さくなります。上の例で 40 kg のカウンタウエイトを付けると、保持トルクは (50 − 40) × 9.81 × 0.01 × 0.8 / 2π ≈ <b>0.12 N·m</b> になります。一方、加速する質量は 90 kg に増えるので、上昇加速トルクは ((50 − 40) × 9.81 + 90 × 2) × 0.01 / (2π × 0.9) ≈ 0.49 N·m です。<b>重力は減るが慣性は増える</b>ことに注意します。チェーン・ワイヤが切れたときの挙動 (片側だけ落ちる) も設計に含めます。</p>
<svg class="tb-chart" viewBox="0 0 520 220" role="img" aria-label="昇降方式の比較">
<text class="k-title" x="260" y="20" text-anchor="middle">昇降方式の比較 — 逆作動と保持</text>
<rect class="k-panel" x="12" y="34" width="156" height="176" rx="8"/><rect class="k-panel" x="182" y="34" width="156" height="176" rx="8"/><rect class="k-panel" x="352" y="34" width="156" height="176" rx="8"/>
<rect class="k-part-h" x="84" y="56" width="10" height="100"/><rect class="k-accent" x="64" y="96" width="50" height="22" rx="3"/>
<text class="lbl" x="90" y="176" text-anchor="middle">ボールねじ</text><text class="tick" x="90" y="194" text-anchor="middle">逆作動する → ブレーキ必須</text>
<rect class="k-part" x="252" y="52" width="10" height="110"/><circle class="k-part" cx="276" cy="108" r="14"/><rect class="k-accent" x="216" y="96" width="30" height="24" rx="3"/>
<text class="lbl" x="260" y="176" text-anchor="middle">ラック・ピニオン</text><text class="tick" x="260" y="194" text-anchor="middle">長ストローク・逆作動する</text>
<circle class="k-part" cx="430" cy="62" r="14"/><line class="k-edge" x1="416" y1="62" x2="416" y2="140"/><line class="k-edge" x1="444" y1="62" x2="444" y2="104"/>
<rect class="k-accent" x="400" y="120" width="32" height="26" rx="3"/><rect class="k-part" x="434" y="104" width="22" height="30" rx="2"/>
<text class="tick" x="460" y="124">CW</text>
<text class="lbl" x="430" y="176" text-anchor="middle">チェーン+CW</text><text class="tick" x="430" y="194" text-anchor="middle">切断時の落下対策が要る</text>
</svg>
<p class="tb-caption">図: どの方式も「止まっていても落ちない」ための手段 (ブレーキ・自己保持・機械ロック) を別に用意する</p>
<h2>落下防止の考え方</h2>
<ul>
<li><b>無励磁作動形ブレーキ</b>: 電源断・非常停止で自動的に制動。保持専用か、制動 (動的) にも使えるかを仕様で確認する</li>
<li><b>機械的落下防止</b>: 保守作業時に差し込む安全ピン・ストッパ、ラチェット式の落下防止装置</li>
<li><b>二重化</b>: ブレーキの定期点検 (保持トルクの確認) と、人が下に入る作業では機械的ロックを必須にする</li>
<li>台形ねじ (リード角が小さく自己保持しやすい) でも、振動で緩み下がることがあるので、ブレーキを省略する根拠にはしない</li>
</ul>
<h2>よくある失敗</h2>
<ul>
<li>保持トルクを正効率で計算し、ブレーキ容量が不足する (逆効率の扱いの誤り)</li>
<li>ベルトの先 (モータ側) にだけブレーキを付け、ベルト切れで落下する</li>
<li>カウンタウエイトで重力を打ち消したが、慣性増加で加速トルクが不足する</li>
<li>下降時の回生エネルギーを考えず、アンプが過電圧で停止する</li>
</ul>
<h2>設計チェックリスト</h2>
<ul>
<li>上昇加速・下降減速・停止保持のすべての場面でトルクを確認したか</li>
<li>ブレーキトルクに安全率 (2 程度以上が目安) を見込んだか</li>
<li>伝動要素 (ベルト・カップリング) が破損しても保持できるか</li>
<li>保守時の機械的落下防止と、ブレーキの定期点検方法を決めたか</li>
<li>回生エネルギーとアンプの回生能力を確認したか</li>
</ul>
`,
    points: [
      "垂直軸は停止中も重力分の保持トルクが必要",
      "最大トルクは上昇加速時と下降減速時に生じる",
      "保持トルクは逆効率で計算し、ブレーキには安全率 2 程度以上 (目安)",
      "伝動要素の破損を想定し、ブレーキ位置と機械的落下防止を決める",
      "カウンタウエイトは重力を減らすが慣性を増やす",
    ],
    exercises: [
      {
        q: "本文の昇降軸で、リードを 5 mm に変えたときの保持トルクと必要ブレーキトルク、0.5 m/s でのモータ回転数を求めてください。",
        a: "T<sub>保持</sub> = 50 × 9.81 × 0.005 × 0.8 / (2π) ≈ 0.312 N·m、ブレーキ ≥ 2 × 0.312 ≈ <b>0.62 N·m</b>。回転数は 0.5 / 0.005 × 60 = <b>6000 min⁻¹</b> となり、一般的なサーボモータの最高回転数を超えやすいので、速度を下げるかリードを戻します。",
      },
      {
        q: "ラック・ピニオン (ピッチ円直径 40 mm、効率 0.95) で 50 kg を 2 m/s² で上昇加速させるときのピニオントルクと、減速比 10 (効率 0.9) の減速機を介したモータトルクを求めてください。",
        a: "T<sub>p</sub> = m(g + a) r / η = 50 × 11.81 × 0.02 / 0.95 ≈ <b>12.4 N·m</b>。モータトルク = 12.4 / (10 × 0.9) ≈ <b>1.38 N·m</b>。",
      },
      {
        q: "本文の例 (カウンタウエイトなし) で、ブレーキの静摩擦トルクが 1.25 N·m のとき、保持の安全率と、摩耗でトルクが 30 % 低下したときの安全率を求めてください。",
        a: "S = 1.25 / 0.62 ≈ <b>2.0</b>。30 % 低下後は 0.875 / 0.62 ≈ <b>1.4</b>。点検で保持トルクを測り、交換基準 (例えば初期の 70 %) を決めておきます。",
      },
    ],
    quiz: [
      {
        q: "ボールねじ垂直軸の停止保持トルクの計算に使う効率はどれか。",
        choices: ["正効率 η", "逆効率 η'", "モータ効率", "効率は使わない"],
        answer: 1,
        explain: "停止時は荷重がねじを回そうとするので、荷重からねじへの伝達である逆効率を使います。",
      },
      {
        q: "垂直軸で最大トルクが生じやすい場面の組合せはどれか。",
        choices: ["上昇減速と下降加速", "上昇加速と下降減速", "定速上昇と定速下降", "停止中のみ"],
        answer: 1,
        explain: "上昇加速と下降減速では重力と慣性力が同じ向きに足し合います。",
      },
      {
        q: "モータとねじの間にタイミングベルトがある垂直軸で、ベルト切れによる落下を防ぐ方法として適切なのはどれか。",
        choices: ["モータ側のブレーキ容量を 2 倍にする", "ねじ軸側にブレーキまたは落下防止装置を設ける", "ベルトの色を変える", "加速度を下げる"],
        answer: 1,
        explain: "ベルトが切れるとモータ側のブレーキは荷重から切り離されます。荷重側で保持する手段が必要です。",
      },
    ],
  },
  {
    id: "rotary-table-design",
    part: "elements",
    title: "回転テーブル・インデックス機構の設計 — 慣性・位置決め・剛性",
    minutes: 35,
    level: 3,
    lead: "回転テーブルやインデックス機構では、テーブルとワークの慣性モーメントが加速トルクを決め、減速機のバックラッシとねじり剛性が位置決め精度を決めます。慣性の計算、加速トルク、カムインデクサとサーボ+減速機の選び方、位置決め誤差と固有振動数の見積もりを行います。",
    body: `
<h2>回転テーブルの構成</h2>
<svg class="tb-chart" viewBox="0 0 520 260" role="img" aria-label="回転テーブルの断面図">
<text class="k-title" x="260" y="20" text-anchor="middle">回転テーブルの断面 (サーボ+減速機駆動)</text>
<line class="k-ground" x1="40" y1="244" x2="480" y2="244"/>
<g class="k-shadow">
<rect class="k-part" x="60" y="56" width="400" height="22" rx="3"/>
<rect class="k-alu" x="150" y="78" width="220" height="30" rx="2"/>
<rect class="k-part" x="190" y="108" width="140" height="70" rx="4"/>
<rect class="k-part" x="215" y="178" width="90" height="56" rx="6"/>
<rect class="k-alu" x="40" y="234" width="440" height="10"/>
</g>
<rect class="k-plastic" x="80" y="36" width="44" height="20" rx="3"/><rect class="k-plastic" x="396" y="36" width="44" height="20" rx="3"/>
<g class="k-sphere"><circle cx="164" cy="93" r="7"/><circle cx="356" cy="93" r="7"/></g>
<line class="k-center" x1="260" y1="30" x2="260" y2="240"/>
<text class="tick" x="102" y="32" text-anchor="middle">ワーク</text><text class="tick" x="418" y="32" text-anchor="middle">ワーク</text>
<text class="lbl" x="470" y="70">テーブル</text>
<text class="tick" x="380" y="98">クロスローラ軸受</text>
<text class="lbl" x="260" y="148" text-anchor="middle">減速機</text>
<text class="lbl" x="260" y="210" text-anchor="middle">サーボ</text>
<line class="k-dimline" x1="60" y1="46" x2="60" y2="46"/>
<line class="k-dimline" x1="260" y1="44" x2="418" y2="44" style="marker-end:url(#k-arrow)"/><text class="k-dimtext" x="300" y="40">r = 150</text>
<line class="k-dimline" x1="60" y1="88" x2="140" y2="88" style="marker-start:url(#k-arrow)"/><text class="k-dimtext" x="66" y="102">φ400 × t20</text>
<path d="M200,64 A70,14 0 0 0 320,64" style="fill:none;stroke:var(--tb-accent);marker-end:url(#k-arrow-blue)" stroke-width="2"/>
<text class="tick" x="340" y="160">減速比 i</text>
</svg>
<p class="tb-caption">図: テーブルはモーメント荷重に強いクロスローラ軸受で支え、減速機はトルクだけを伝えるようにする</p>
<h2>慣性モーメントと加速トルク</h2>
<p>円板の慣性モーメントは <span class="tb-m">J = \\tfrac{1}{2} m r^2</span>、半径 r の位置の小さなワークは点質量として <span class="tb-m">m r^2</span> で近似します (ワーク自身の重心まわりの慣性を加えるとより正確)。等加速度で角度 θ を時間 t で割り出すとき、加速・定速・減速を 1/3 ずつにする台形速度では</p>
<div class="tb-math">\\omega_{\\max} = \\dfrac{1.5\\,\\theta}{t}, \\qquad \\alpha = \\dfrac{4.5\\,\\theta}{t^2}, \\qquad T_M = \\left(J_M + J_G + \\dfrac{J_L}{i^2\\,\\eta}\\right) i\\,\\alpha</div>
<p>J<sub>M</sub>: モータ、J<sub>G</sub>: 減速機入力側、J<sub>L</sub>: テーブル+ワーク。負荷慣性をモータ軸に換算した値とモータ慣性の比 <span class="tb-m">J_L / (i^2 J_M)</span> を<b>慣性比</b>といい、サーボでは 10 倍程度以下 (高応答なら 5 倍以下) が目安です。</p>
<h2>計算例 — 4 ステーションの 90° 割出し</h2>
<p>鋼製テーブル φ400 × 20 mm、ワーク 2 kg × 4 個 (r = 150 mm)、90° を 0.5 s で割り出す。サーボ J<sub>M</sub> = 1.5 × 10<sup>−4</sup> kg·m²、減速機入力側 J<sub>G</sub> = 0.2 × 10<sup>−4</sup> kg·m²、効率 0.85。</p>
<table class="tb-table">
<tr><th>項目</th><th>計算</th><th>結果</th></tr>
<tr><td>テーブル質量</td><td>7850 × π × 0.4² / 4 × 0.02</td><td>19.7 kg</td></tr>
<tr><td>テーブル慣性</td><td>0.5 × 19.7 × 0.2²</td><td>0.395 kg·m²</td></tr>
<tr><td>ワーク慣性</td><td>4 × 2 × 0.15²</td><td>0.180 kg·m²</td></tr>
<tr><td>J<sub>L</sub></td><td>合計</td><td>0.575 kg·m²</td></tr>
<tr><td>角加速度</td><td>4.5 × (π/2) / 0.5²</td><td>28.3 rad/s²</td></tr>
<tr><td>最高回転数</td><td>1.5 × (π/2) / 0.5 = 4.71 rad/s</td><td>45 min<sup>−1</sup></td></tr>
<tr><td>i = 10 のとき</td><td>モータトルク / 慣性比</td><td>1.96 N·m / <b>38 倍 (過大)</b></td></tr>
<tr><td>i = 20 のとき</td><td>モータトルク / 慣性比</td><td><b>1.05 N·m / 9.6 倍</b>、900 min<sup>−1</sup></td></tr>
</table>
<p>i = 10 では慣性比が大きすぎ、整定に時間がかかり振動しやすくなります。i = 20 にすると慣性比 9.6 倍、モータトルクも半分程度になります。テーブル慣性の 7 割近くを占める円板を、肉抜きやアルミ化で軽くするのも有効です。</p>
<h2>カムインデクサかサーボ+減速機か</h2>
<table class="tb-table">
<tr><th>項目</th><th>カムインデクサ</th><th>サーボ+減速機</th></tr>
<tr><td>割出し数・角度</td><td>カムで固定 (変更は交換)</td><td>プログラムで自由</td></tr>
<tr><td>位置決め精度</td><td>高い (カムで機械的に拘束)</td><td>減速機のバックラッシ・剛性に依存</td></tr>
<tr><td>停止中の保持</td><td>ドウェル区間で機械的にロック</td><td>サーボロック (外乱で微小にずれる)</td></tr>
<tr><td>動き</td><td>カム曲線でなめらか、高速</td><td>速度パターンを調整できる</td></tr>
<tr><td>向く用途</td><td>割出し固定の量産機</td><td>品種切替・任意角度</td></tr>
</table>
<h2>位置決め誤差 — バックラッシとねじり剛性</h2>
<p>サーボ+減速機では、テーブル上の位置誤差は主に<b>バックラッシ</b> (方向反転でのガタ) と、外乱トルクによる<b>ねじれ</b>で決まります。</p>
<div class="tb-math">\\delta_{BL} = r\\,\\theta_{BL}, \\qquad \\Delta\\theta = \\dfrac{T_d}{K_t}, \\qquad f_n = \\dfrac{1}{2\\pi}\\sqrt{\\dfrac{K_t}{J_L}}</div>
<svg class="tb-chart" viewBox="0 0 520 200" role="img" aria-label="減速機のバックラッシとねじり剛性のヒステリシス">
<text class="k-title" x="260" y="20" text-anchor="middle">減速機のねじり特性 — バックラッシと剛性</text>
<line class="axis" x1="60" y1="110" x2="460" y2="110"/><line class="axis" x1="260" y1="34" x2="260" y2="186"/>
<path d="M90,176 L240,118 L240,100 L430,40" style="fill:none;stroke:var(--tb-accent)" stroke-width="2.5"/>
<path d="M430,40 L280,102 L280,120 L90,176" style="fill:none;stroke:var(--tb-bad)" stroke-width="2.5"/>
<line class="k-dimline" x1="240" y1="130" x2="280" y2="130" style="marker-start:url(#k-arrow);marker-end:url(#k-arrow)"/>
<text class="k-dimtext" x="260" y="146" text-anchor="middle">バックラッシ θBL</text>
<text class="tick" x="470" y="114">ねじれ角</text><text class="tick" x="268" y="40">トルク</text>
<text class="mark-t" x="70" y="104" style="fill:var(--tb-accent)">傾き = ねじり剛性 Kt</text>
<text class="tick" x="70" y="62">増加時と減少時で経路が違う</text>
<text class="tick" x="70" y="78">(ヒステリシス)</text>
</svg>
<p class="tb-caption">図: トルクの向きが変わると、まずバックラッシ分だけ自由に回り、その後は剛性 Kt で決まる傾きでねじれる</p>
<p>減速機のバックラッシ 3 arcmin、テーブル軸換算のねじり剛性 <span class="tb-m">K_t = 2.0 \\times 10^4\\,\\mathrm{N\\cdot m/rad}</span>、加工反力による外乱トルク 20 N·m とすると</p>
<ul>
<li>バックラッシ: 3 arcmin = 8.73 × 10<sup>−4</sup> rad → r = 150 mm で <b>0.131 mm</b></li>
<li>ねじれ: Δθ = 20 / 20000 = 1.0 × 10<sup>−3</sup> rad (3.4 arcmin) → <b>0.15 mm</b></li>
<li>固有振動数: <span class="tb-m">f_n = \\tfrac{1}{2\\pi}\\sqrt{20000/0.575} \\approx 29.7\\,\\mathrm{Hz}</span></li>
</ul>
<p>ワーク位置で ±0.05 mm が必要なら、この構成では足りません。対策は (1) 一方向からだけ位置決めしてバックラッシを効かせない、(2) 低バックラッシ・高剛性の減速機 (遊星・波動など) にする、(3) 停止中は<b>クランプやロケートピン</b>で機械的に位置決めする、(4) テーブル外周にエンコーダを付けて直接位置を測る、です。固有振動数が低いと割出し後の残留振動が長く続くので、整定時間も確認します。</p>
<h2>よくある失敗</h2>
<ul>
<li>テーブル円板の慣性を見落とし、ワークだけで慣性を計算する</li>
<li>減速比を小さく選び、慣性比が過大で整定しない</li>
<li>バックラッシだけ見て、加工反力によるねじれを考えない</li>
<li>テーブルの重量・モーメント荷重を減速機の出力軸に直接受けさせる</li>
</ul>
<h2>設計チェックリスト</h2>
<ul>
<li>テーブル・治具・ワークの慣性をすべて合計したか</li>
<li>加速トルク・最高回転数・慣性比をモータ仕様と比べたか</li>
<li>バックラッシ・ねじれによる位置誤差を、ワーク位置 (半径 r) で評価したか</li>
<li>固有振動数と整定時間を確認したか</li>
<li>テーブル荷重を軸受で受け、減速機にはトルクだけ伝えているか</li>
</ul>
`,
    points: [
      "円板 J = mr²/2、外周ワークは mr² で近似し、テーブル分を忘れない",
      "台形 1/3 パターンでは α = 4.5θ/t²",
      "慣性比 J_L/(i² J_M) は 10 倍程度以下 (目安) になるよう減速比を選ぶ",
      "位置誤差 = バックラッシ + 外乱トルク/ねじり剛性、半径 r で評価する",
      "高精度が要るならクランプ・ロケートピン・直接測定を検討する",
    ],
    exercises: [
      {
        q: "本文のテーブルをアルミ (密度 2700 kg/m³) にすると、J_L と i = 20 での慣性比はいくらになりますか。",
        a: "質量 2700 × π × 0.4²/4 × 0.02 ≈ 6.79 kg、J = 0.5 × 6.79 × 0.2² ≈ 0.136 kg·m²。J<sub>L</sub> = 0.136 + 0.180 = <b>0.316 kg·m²</b>。慣性比 0.316 / (20² × 1.5 × 10⁻⁴) ≈ <b>5.3 倍</b>。",
      },
      {
        q: "本文の条件 (J_L = 0.575 kg·m²) で、割出し時間を 0.5 s から 0.35 s に短縮すると、角加速度とテーブル軸の加速トルクはいくらになりますか。",
        a: "α = 4.5 × (π/2) / 0.35² ≈ <b>57.7 rad/s²</b>。テーブル軸トルク J<sub>L</sub> α = 0.575 × 57.7 ≈ <b>33.2 N·m</b> (0.5 s では 16.2 N·m)。時間を 0.7 倍にするとトルクは 1/0.7² ≈ 2.04 倍になります。",
      },
      {
        q: "ねじり剛性を 2 倍 (4.0 × 10⁴ N·m/rad) にしたときの、外乱 20 N·m でのワーク位置 (r = 150 mm) のずれと固有振動数を求めてください。",
        a: "Δθ = 20 / 40000 = 5.0 × 10⁻⁴ rad → 150 × 5.0 × 10⁻⁴ = <b>0.075 mm</b>。f<sub>n</sub> は √K に比例: 29.7 × √2 ≈ <b>42 Hz</b>。",
      },
    ],
    quiz: [
      {
        q: "加速・定速・減速を 1/3 ずつにした台形速度で、角度 θ を時間 t で動かすときの角加速度はどれか。",
        choices: ["θ/t²", "2θ/t²", "4θ/t²", "4.5θ/t²"],
        answer: 3,
        explain: "ω_max = 1.5θ/t、加速時間 t/3 なので α = 1.5θ/t ÷ (t/3) = 4.5θ/t² です。",
      },
      {
        q: "減速比を 2 倍にすると、モータ軸換算の負荷慣性はどうなるか。",
        choices: ["2 倍", "1/2", "1/4", "変わらない"],
        answer: 2,
        explain: "モータ軸換算慣性は J_L/i² なので、i を 2 倍にすると 1/4 になります。",
      },
      {
        q: "カムインデクサの特徴として正しいものはどれか。",
        choices: ["割出し数をプログラムで自由に変えられる", "ドウェル区間で機械的に位置が拘束される", "バックラッシが必ず大きい", "慣性の計算が不要"],
        answer: 1,
        explain: "カムのドウェル区間ではフォロアが拘束され、停止位置が機械的に保たれます。割出し数の変更にはカム交換が必要です。",
      },
    ],
  },
  {
    id: "bolted-joint-design",
    part: "elements",
    title: "ねじ締結体の設計 — 締付け力・内力係数・ゆるみ",
    minutes: 40,
    level: 3,
    lead: "ボルト締結は、締付け力 (初期締付け力) で部材を押し付け、外力の大部分を部材の圧縮の減少で受けることで成り立っています。締付け線図、ボルトと被締結部材のばね定数、内力係数、分離・すべりを防ぐ必要締付け力、締付けトルクのばらつき、ゆるみの原因と対策を、M10 の例で一続きに計算します。",
    body: `
<h2>この章の位置づけ</h2>
<p>ボルトの強度区分・応力断面積・疲労の基礎は「【上級】ボルト継手の詳細設計」と「締結」の章で扱いました。本章は、<b>外力を受ける締結体を設計する手順</b> (どれだけ締めれば分離・すべり・ゆるみが起きないか) に焦点を当てます。</p>
<h2>締付け線図と内力係数</h2>
<p>ボルトを締めると、ボルトは伸び、被締結部材は縮みます。このとき両者に同じ大きさの<b>締付け力 F<sub>f</sub></b> が生じます。外力 F<sub>A</sub> (軸方向の引張) が加わると、ボルトはさらに伸び、部材の圧縮は減ります。ばね定数をボルト k<sub>b</sub>、部材 k<sub>c</sub> とすると、外力のうちボルトに加わる割合が<b>内力係数 Φ</b> です。</p>
<div class="tb-math">\\begin{aligned} \\Phi &amp;= \\dfrac{k_b}{k_b + k_c}, \\qquad F_{b} = F_f + \\Phi F_A \\\\ F_{c} &amp;= F_f - (1-\\Phi)\\,F_A \\quad (\\text{残留締付け力}) \\end{aligned}</div>
<svg class="tb-chart" viewBox="0 0 520 260" role="img" aria-label="締付け線図">
<text class="k-title" x="260" y="20" text-anchor="middle">締付け線図 (ジョイントダイアグラム)</text>
<line class="axis" x1="50" y1="226" x2="490" y2="226"/><line class="axis" x1="50" y1="226" x2="50" y2="34"/>
<text class="tick" x="440" y="244">伸び・縮み</text><text class="tick" x="56" y="42">力</text>
<line x1="50" y1="226" x2="290" y2="100" style="stroke:var(--tb-accent)" stroke-width="2.5"/>
<line x1="290" y1="100" x2="420" y2="226" style="stroke:var(--tb-bad)" stroke-width="2.5"/>
<line x1="290" y1="100" x2="340" y2="74" style="stroke:var(--tb-accent);stroke-dasharray:5 4" stroke-width="2"/>
<line class="k-thin" x1="50" y1="100" x2="290" y2="100" style="stroke-dasharray:3 3"/>
<line class="k-thin" x1="340" y1="74" x2="340" y2="226" style="stroke-dasharray:3 3"/>
<line class="k-dimline" x1="350" y1="74" x2="350" y2="148" style="marker-start:url(#k-arrow);marker-end:url(#k-arrow)"/>
<text class="k-dimtext" x="356" y="118">外力 FA</text>
<line class="k-dimline" x1="330" y1="74" x2="330" y2="100" style="marker-start:url(#k-arrow);marker-end:url(#k-arrow)"/>
<text class="k-dimtext" x="250" y="88">ΦFA</text>
<line class="k-dimline" x1="310" y1="148" x2="310" y2="226" style="marker-start:url(#k-arrow);marker-end:url(#k-arrow)"/>
<text class="k-dimtext" x="300" y="196" text-anchor="end">残留締付け力 Fc</text>
<text class="k-dimtext" x="56" y="96">締付け力 Ff</text>
<text class="mark-t" x="120" y="150" style="fill:var(--tb-accent)">ボルト (傾き kb)</text>
<text class="mark-t" x="380" y="170" style="fill:var(--tb-bad)" text-anchor="end"></text>
<text class="k-bad-t" x="400" y="150">部材 (傾き kc)</text>
</svg>
<p class="tb-caption">図: 部材がボルトより硬い (kc &gt; kb) ほど Φ は小さく、外力の大部分は部材の圧縮の減少で受け止められる</p>
<p>ボルトのばね定数は <span class="tb-m">k_b = E A / l</span> (段付きなら各部の直列)、部材は<b>等価円筒</b> (ボルト穴を除いた外径 D<sub>eq</sub> の円筒) で近似します。ここでは簡易式 <span class="tb-m">D_{eq} \\approx d_w + l_K/2</span> (d<sub>w</sub>: 座面径、l<sub>K</sub>: 締付け長さ、目安) を使います。正確には VDI 2230 などの円すい台モデルや FEM で求めます。また外力の作用点が部材内部にある場合は、荷重導入係数 n (&lt; 1) を掛けて Φ<sub>n</sub> = nΦ とし、ボルトの負担はさらに小さくなります。本章では安全側に n = 1 とします。</p>
<h2>必要な締付け力 — 分離・すべり・へたり</h2>
<ul>
<li><b>分離防止</b>: 残留締付け力 F<sub>c</sub> &gt; 0 (シールが必要ならシール面圧分)</li>
<li><b>すべり防止</b>: 横荷重 F<sub>Q</sub> に対し <span class="tb-m">\\mu F_c \\ge F_Q</span> (μ: 接合面の摩擦係数)</li>
<li><b>へたり (なじみ) による低下</b>: 座面・ねじ面の微小な塑性変形 f<sub>Z</sub> で <span class="tb-m">F_Z = f_Z\\,k_b k_c/(k_b+k_c)</span> だけ締付け力が下がる</li>
</ul>
<div class="tb-math">F_{f,\\min} = F_{K,\\text{req}} + (1-\\Phi)F_A + F_Z, \\qquad F_{f,\\max} = \\alpha_A\\,F_{f,\\min}</div>
<p>α<sub>A</sub> は<b>締付け係数</b> (締付け力の最大/最小の比) で、トルク法では摩擦係数のばらつきのため 1.4〜1.6 程度 (トルクレンチ、目安)、インパクトレンチでは 2.5〜4 程度にもなります。最大値 F<sub>f,max</sub> でもボルトが降伏しないことを確認します。</p>
<h2>計算例 — M10、強度区分 10.9</h2>
<p>鋼板 2 枚の締付け長さ l<sub>K</sub> = 20 mm、座面径 d<sub>w</sub> = 16 mm、ボルト穴 11 mm。1 本あたり軸方向外力 F<sub>A</sub> = 5 kN と横荷重 F<sub>Q</sub> = 1.5 kN、接合面 μ = 0.15。へたり量 f<sub>Z</sub> = 0.008 mm (目安)、α<sub>A</sub> = 1.6。M10 の応力断面積 A<sub>s</sub> = 58.0 mm²、10.9 の耐力 940 MPa。</p>
<table class="tb-table">
<tr><th>項目</th><th>計算</th><th>結果</th></tr>
<tr><td>k<sub>b</sub> (簡易: A<sub>s</sub> で全長)</td><td>206 000 × 58.0 / 20</td><td>5.97 × 10<sup>5</sup> N/mm</td></tr>
<tr><td>等価円筒</td><td>D<sub>eq</sub> = 16 + 10 = 26、A = π/4 (26² − 11²)</td><td>436 mm²</td></tr>
<tr><td>k<sub>c</sub></td><td>206 000 × 436 / 20</td><td>4.49 × 10<sup>6</sup> N/mm</td></tr>
<tr><td>内力係数 Φ</td><td>5.97 / (5.97 + 44.9)</td><td><b>0.117</b></td></tr>
<tr><td>すべり防止の F<sub>K,req</sub></td><td>1500 / 0.15</td><td>10 000 N</td></tr>
<tr><td>外力による減少</td><td>(1 − 0.117) × 5000</td><td>4413 N</td></tr>
<tr><td>へたり F<sub>Z</sub></td><td>0.008 × (5.97 × 10<sup>5</sup> × 4.49 × 10<sup>6</sup>) / (5.09 × 10<sup>6</sup>)</td><td>4218 N</td></tr>
<tr><td>F<sub>f,min</sub></td><td>10 000 + 4413 + 4218</td><td><b>18.6 kN</b></td></tr>
<tr><td>F<sub>f,max</sub></td><td>1.6 × 18.6</td><td><b>29.8 kN</b></td></tr>
<tr><td>引張応力</td><td>29 810 / 58.0</td><td>514 MPa</td></tr>
<tr><td>ねじりせん断 (ねじ面 μ = 0.15)</td><td>τ = 16T<sub>G</sub> / (π d<sub>0</sub>³)</td><td>246 MPa</td></tr>
<tr><td>相当応力</td><td>√(514² + 3 × 246²)</td><td>668 MPa ≤ 0.9 × 940 = 846 MPa → <b>OK</b></td></tr>
<tr><td>外力によるボルト付加力</td><td>0.117 × 5000</td><td>587 N (10 MPa)</td></tr>
</table>
<p>締付けトルクは平均締付け力 F<sub>m</sub> = 18.6 × (1 + 1.6)/2 ≈ 24.2 kN を狙い、トルク係数 K = 0.2 (目安) で <span class="tb-m">T = K d F_m = 0.2 \\times 10 \\times 24.2 \\approx 48\\,\\mathrm{N\\cdot m}</span> とします。強度区分 8.8 (耐力 640 MPa) では許容 576 MPa に対し相当応力 668 MPa で不足するので、10.9 を選んだのです。外力によるボルト付加力が 10 MPa しかないことから、<b>十分に締めた継手ではボルトの疲労がほとんど問題にならない</b>ことも分かります。</p>
<h2>ゆるみの原因と対策</h2>
<svg class="tb-chart" viewBox="0 0 520 230" role="img" aria-label="ゆるみの原因の比較">
<text class="k-title" x="260" y="20" text-anchor="middle">ゆるみの 2 種類 — 回転ゆるみと非回転ゆるみ</text>
<rect class="k-panel" x="12" y="34" width="240" height="186" rx="8"/><rect class="k-panel" x="268" y="34" width="240" height="186" rx="8"/>
<rect class="k-part" x="40" y="100" width="180" height="20"/><rect class="k-alu" x="40" y="120" width="180" height="20"/>
<rect class="k-part-h" x="122" y="78" width="16" height="84"/><rect class="k-part" x="108" y="64" width="44" height="16" rx="2"/><rect class="k-part" x="110" y="160" width="40" height="14" rx="2"/>
<line class="k-force" x1="40" y1="110" x2="10" y2="110" style="marker-end:none"/>
<path d="M28,104 L58,104" class="k-move" style="marker-end:url(#k-arrow-blue)"/>
<path d="M232,128 L202,128" class="k-move" style="marker-end:url(#k-arrow-blue)"/>
<text class="k-bad-t" x="132" y="56" text-anchor="middle">回転ゆるみ</text>
<text class="tick" x="132" y="192" text-anchor="middle">横すべりの繰返しで</text><text class="tick" x="132" y="208" text-anchor="middle">ナットが戻り回転する</text>
<rect class="k-part" x="296" y="100" width="180" height="20"/><rect class="k-rubber" x="296" y="120" width="180" height="8"/><rect class="k-alu" x="296" y="128" width="180" height="16"/>
<rect class="k-part-h" x="378" y="78" width="16" height="84"/><rect class="k-part" x="364" y="64" width="44" height="16" rx="2"/><rect class="k-part" x="366" y="160" width="40" height="14" rx="2"/>
<text class="k-bad-t" x="388" y="56" text-anchor="middle">非回転ゆるみ</text>
<text class="tick" x="388" y="192" text-anchor="middle">へたり・塗装・ガスケット</text><text class="tick" x="388" y="208" text-anchor="middle">のクリープで力が減る</text>
<text class="tick" x="420" y="92">塗膜など</text><line class="k-thin" x1="440" y1="96" x2="440" y2="122"/>
</svg>
<p class="tb-caption">図: 回転ゆるみは横すべりを止めれば防げる。非回転ゆるみは軟らかい層をなくし、締付け長さを長くして影響を減らす</p>
<table class="tb-table">
<tr><th>原因</th><th>仕組み</th><th>主な対策</th></tr>
<tr><td>横すべりの繰返し</td><td>接合面がすべるたびにねじ面もすべり、戻り回転する</td><td>締付け力を上げてすべりを止める、ノックピン・段付きで横荷重を受ける</td></tr>
<tr><td>へたり (なじみ)</td><td>座面・ねじ面の粗さがつぶれる</td><td>締付け長さを長く (l<sub>K</sub>/d を大きく)、座面を平滑・硬く、再締付け</td></tr>
<tr><td>軟らかい層</td><td>塗装・ガスケット・樹脂のクリープ</td><td>座面の塗装を除く、金属タッチにする、カラーを入れる</td></tr>
<tr><td>温度変化</td><td>ボルトと部材の線膨張差</td><td>材料をそろえる、締付け長さを長くする</td></tr>
</table>
<p>ばね座金は、十分な締付け力がある継手では回転ゆるみの防止効果がほとんど期待できないことが試験で知られています。<b>まず締付け力でゆるみを防ぎ</b>、そのうえで接着剤 (嫌気性)、プリベリングトルク形ナット、ダブルナットなどを用途に応じて使います。</p>
<h2>よくある失敗</h2>
<ul>
<li>締付けトルクの公称値だけで設計し、ばらつき (α<sub>A</sub>) による最小・最大締付け力を確認しない</li>
<li>へたりを考えず、短い締付け長さで締付け力の大部分を失う</li>
<li>横荷重をボルトのせん断で受けようとし、すべりと回転ゆるみが起きる</li>
<li>座面に塗装・軟質材を挟み、クリープで締付け力が抜ける</li>
</ul>
<h2>設計チェックリスト</h2>
<ul>
<li>外力 (軸方向・横方向・モーメント) を 1 本あたりに分配したか</li>
<li>Φ を求め、分離・すべりに必要な残留締付け力を確保したか</li>
<li>へたり量と締付け係数 α<sub>A</sub> を見込んで F<sub>f,min</sub>・F<sub>f,max</sub> を求めたか</li>
<li>F<sub>f,max</sub> でボルトが降伏しないか (ねじりを含む相当応力)</li>
<li>座面圧・めねじのせん断 (はめあい長さ) を確認したか</li>
<li>締付けトルク・工具・管理方法 (マーキング・再締付け) を図面に指示したか</li>
</ul>
`,
    points: [
      "内力係数 Φ = kb/(kb+kc)、外力のうちボルトに加わるのは ΦFA だけ",
      "残留締付け力 = Ff − (1−Φ)FA で分離・すべりを判定する",
      "必要締付け力にはへたりによる低下 FZ を加える",
      "トルク法のばらつき αA を見込み、最大締付け力で降伏しないことを確認",
      "ゆるみ対策の基本は十分な締付け力と横すべりの防止",
    ],
    exercises: [
      {
        q: "本文の例で締付け長さを 40 mm に延ばすと (D_eq = 16 + 20 = 36 mm)、Φ とへたりによる低下 F_Z はいくらになりますか (f_Z は同じ 0.008 mm)。",
        a: "k<sub>b</sub> = 206000 × 58 / 40 ≈ 2.99 × 10⁵ N/mm。A = π/4 (36² − 11²) ≈ 923 mm²、k<sub>c</sub> = 206000 × 923 / 40 ≈ 4.75 × 10⁶ N/mm。Φ = 2.99 / (2.99 + 47.5) ≈ <b>0.059</b>。F<sub>Z</sub> = 0.008 × k<sub>b</sub>k<sub>c</sub>/(k<sub>b</sub>+k<sub>c</sub>) ≈ 0.008 × 2.81 × 10⁵ ≈ <b>2250 N</b> (20 mm では 4218 N)。締付け長さを長くすると、へたりによる低下が約半分になります。",
      },
      {
        q: "横荷重 1.5 kN を 2 本のノックピンで受け、ボルトは軸方向外力 5 kN だけを受けるとします (へたり 4218 N、残留締付け力は 0 より大きければよいとし、余裕 2000 N を確保)。F_f,min と F_f,max を求めてください。",
        a: "F<sub>f,min</sub> = 2000 + 0.883 × 5000 + 4218 ≈ <b>10.6 kN</b>。F<sub>f,max</sub> = 1.6 × 10.6 ≈ <b>17.0 kN</b>。引張応力 17000 / 58 ≈ 293 MPa で、強度区分 8.8 でも十分です。横荷重をピンで受けると必要締付け力が大きく下がります。",
      },
      {
        q: "本文の締付けをインパクトレンチ (α_A = 3) で行うと、F_f,max と引張応力はいくらになりますか。",
        a: "F<sub>f,max</sub> = 3 × 18.6 ≈ <b>55.9 kN</b>、σ = 55900 / 58 ≈ <b>964 MPa</b>。耐力 940 MPa を超えて降伏します。ばらつきの大きい工具では、最小値を確保しようとすると最大値が破損域に入るので、トルクレンチや角度法を使います。",
      },
    ],
    quiz: [
      {
        q: "内力係数 Φ = 0.1 のボルト締結体に 10 kN の軸方向外力が加わった。ボルトの軸力の増加はいくらか。",
        choices: ["0 kN", "1 kN", "9 kN", "10 kN"],
        answer: 1,
        explain: "ボルトの増加分は ΦFA = 0.1 × 10 = 1 kN です。残りの 9 kN は部材の圧縮の減少で受けます。",
      },
      {
        q: "ボルト締結体のへたりによる締付け力の低下を小さくする方法として適切なのはどれか。",
        choices: ["締付け長さを短くする", "締付け長さを長くし、座面を平滑にする", "座面に塗装を残す", "ばね座金を必ず入れる"],
        answer: 1,
        explain: "締付け長さを長くすると直列ばね定数が下がり、同じへたり量でも締付け力の低下が小さくなります。",
      },
      {
        q: "回転ゆるみの主な原因はどれか。",
        choices: ["接合面の横すべりの繰返し", "ボルトの色", "締付け力が大きすぎること", "ねじの呼び径が大きいこと"],
        answer: 0,
        explain: "接合面が繰り返しすべると、ねじ面もすべってナットが戻り回転します。締付け力を上げる・ピンで横荷重を受けるなどで防ぎます。",
      },
    ],
  },
  {
    id: "tolerance-assembly-design",
    part: "elements",
    title: "機構の精度設計 — 公差の積み上げとガタ・調整代",
    minutes: 35,
    level: 3,
    lead: "部品の寸法公差は組み立てると積み上がり、すきま・ガタ・位置ずれとして現れます。最悪値法と二乗和平方根 (RSS) 法、モンテカルロ法の考え方、機構のガタの予算配分、シムや偏心ピンによる調整代の設け方を、軸受まわりのすきまの例で学びます。公差設計の詳細な統計は「【上級】公差設計の実践」の章も参照してください。",
    body: `
<h2>寸法連鎖 — すきまは部品寸法の足し引き</h2>
<p>組立後のすきま (閉ループ寸法) は、<b>寸法連鎖</b>に沿って部品寸法を足し引きしたものです。すきまを大きくする寸法を「増加寸法」(+)、小さくする寸法を「減少寸法」(−) とします。</p>
<svg class="tb-chart" viewBox="0 0 520 250" role="img" aria-label="軸受まわりの寸法連鎖">
<text class="k-title" x="260" y="20" text-anchor="middle">寸法連鎖の例 — ハウジング内の部品とすきま G</text>
<g class="k-shadow">
<path class="k-alu" d="M50,50 L470,50 L470,70 L452,70 L452,150 L470,150 L470,170 L50,170 L50,150 L68,150 L68,70 L50,70 Z"/>
</g>
<rect class="k-part" x="68" y="78" width="160" height="64" rx="2"/>
<rect class="k-part" x="228" y="70" width="120" height="80" rx="2"/>
<rect class="k-accent" x="348" y="82" width="100" height="56" rx="2"/>
<rect x="448" y="82" width="4" height="56" style="fill:var(--tb-bad);opacity:0.5"/>
<text class="lbl" x="148" y="114" text-anchor="middle">B (20)</text>
<text class="lbl" x="288" y="114" text-anchor="middle">C (15)</text>
<text class="lbl" x="398" y="114" text-anchor="middle">D (12.5)</text>
<text class="k-bad-t" x="430" y="196">すきま G</text><line class="k-thin" x1="450" y1="140" x2="446" y2="184"/>
<line class="k-ext" x1="68" y1="170" x2="68" y2="226"/><line class="k-ext" x1="452" y1="150" x2="452" y2="226"/>
<line class="k-dimline" x1="68" y1="220" x2="452" y2="220" style="marker-start:url(#k-arrow);marker-end:url(#k-arrow)"/><text class="k-dimtext" x="260" y="240" text-anchor="middle">A = 47.80 ± 0.05 (増加寸法 +)</text>
<line class="k-dimline" x1="68" y1="36" x2="228" y2="36" style="marker-start:url(#k-arrow);marker-end:url(#k-arrow)"/><text class="k-dimtext" x="100" y="32">± 0.03 (−)</text>
<line class="k-dimline" x1="228" y1="36" x2="348" y2="36" style="marker-start:url(#k-arrow);marker-end:url(#k-arrow)"/><text class="k-dimtext" x="250" y="32">± 0.02 (−)</text>
<line class="k-dimline" x1="348" y1="36" x2="448" y2="36" style="marker-start:url(#k-arrow);marker-end:url(#k-arrow)"/><text class="k-dimtext" x="366" y="32">± 0.04 (−)</text>
</svg>
<p class="tb-caption">図: G = A − (B + C + D)。公称すきま 0.30 mm に、4 つの寸法の公差が積み上がる</p>
<div class="tb-math">G = \\sum_i s_i L_i \\quad (s_i = \\pm 1), \\qquad t_{WC} = \\sum_i t_i, \\qquad t_{RSS} = \\sqrt{\\sum_i t_i^{\\,2}}</div>
<p><b>最悪値法 (ワーストケース)</b> はすべての寸法が同時に最悪側に寄った場合で、必ず成立しますが公差が厳しくなります。<b>RSS 法</b>は、各寸法が独立な正規分布で、公差 ± t<sub>i</sub> が ±3σ に相当すると仮定した統計的な積み上げです。部品数が多いほど両者の差は大きくなります。</p>
<h2>計算例 — すきま 0.10〜0.40 mm を満たすか</h2>
<table class="tb-table">
<tr><th>寸法</th><th>公称</th><th>公差</th><th>向き</th></tr>
<tr><td>A ハウジング内幅</td><td>47.80</td><td>± 0.05</td><td>+</td></tr>
<tr><td>B スペーサ</td><td>20.00</td><td>± 0.03</td><td>−</td></tr>
<tr><td>C 軸受幅</td><td>15.00</td><td>± 0.02</td><td>−</td></tr>
<tr><td>D カラー</td><td>12.50</td><td>± 0.04</td><td>−</td></tr>
<tr><td><b>G すきま</b></td><td><b>0.30</b></td><td>最悪値 ± 0.14 / RSS ± 0.073</td><td></td></tr>
</table>
<ul>
<li>最悪値法: G = 0.16〜0.44 mm → 上限 0.40 を<b>超える</b>可能性がある</li>
<li>RSS 法: G = 0.227〜0.373 mm (±3σ) → 要求内に収まる</li>
<li>モンテカルロ (正規分布 σ = t/3、10 万回): 平均 0.300、標準偏差 0.0245 mm、範囲外 0 %</li>
<li>モンテカルロ (一様分布 ± t、10 万回): 標準偏差 0.0424 mm、範囲外 約 0.6 %</li>
</ul>
<p>RSS 法は<b>工程が安定し平均が公称値にある</b>ことを前提にしています。実際の工程は平均がずれたり、選別で一様分布に近くなったりします。分布の仮定で結果が大きく変わるので、量産では工程能力 (C<sub>pk</sub>) を確認し、平均のずれを見込んだ修正 RSS (係数 1.2〜1.5 程度を掛ける、目安) を使うこともあります。</p>
<h2>モンテカルロ法の考え方</h2>
<p>各寸法を想定した分布 (正規・一様・偏りのある分布) から乱数で発生させ、すきまを何万回も計算して分布を作ります。非線形な関係 (角度・てこ比・三角形の寸法) や、部品ごとに違う分布もそのまま扱えるのが利点です。結果は「不良率 ○ %」の形で得られるので、コストとの比較がしやすくなります。</p>
<h2>機構のガタの予算配分</h2>
<p>位置決め機構では、ガタ (バックラッシ・はめあいすきま) を<b>精度予算</b>として各要素に配分します。たとえば先端の位置ずれ許容 ±0.1 mm のアームで、てこ比 5 倍の位置にあるピンのすきまは、先端では 5 倍に拡大されます。</p>
<table class="tb-table">
<tr><th>要素</th><th>要素のガタ</th><th>先端への倍率</th><th>先端換算</th></tr>
<tr><td>減速機バックラッシ</td><td>3 arcmin</td><td>腕長 200 mm</td><td>0.175 mm</td></tr>
<tr><td>ピン・穴すきま (H7/g6 程度)</td><td>0.02 mm</td><td>× 5</td><td>0.10 mm</td></tr>
<tr><td>ガイドのすきま</td><td>0.01 mm</td><td>× 1</td><td>0.01 mm</td></tr>
</table>
<p>この例では減速機だけで予算を超えるので、ガタのない機構 (予圧・ばねでの片寄せ) か、調整を前提にします。<b>倍率の大きい箇所のガタを最優先でなくす</b>のが効率的です。</p>
<h2>調整代 — シム・偏心ピン・長穴</h2>
<svg class="tb-chart" viewBox="0 0 520 220" role="img" aria-label="調整手段の比較 シムと偏心ピン">
<text class="k-title" x="260" y="20" text-anchor="middle">調整代の設け方</text>
<rect class="k-panel" x="12" y="34" width="240" height="176" rx="8"/><rect class="k-panel" x="268" y="34" width="240" height="176" rx="8"/>
<rect class="k-alu" x="40" y="120" width="184" height="30" rx="2"/>
<g><rect class="k-copper" x="60" y="110" width="144" height="4"/><rect class="k-copper" x="60" y="114" width="144" height="3"/><rect class="k-copper" x="60" y="117" width="144" height="3"/></g>
<rect class="k-part" x="60" y="70" width="144" height="40" rx="3"/>
<text class="lbl" x="132" y="94" text-anchor="middle" style="font-size:11px">軸受ハウジング</text>
<text class="tick" x="132" y="56" text-anchor="middle">シム (0.05/0.1/0.2 mm を組合せ)</text>
<line class="k-thin" x1="132" y1="60" x2="132" y2="110"/>
<text class="tick" x="132" y="176" text-anchor="middle">段階的・確実・再現しやすい</text>
<text class="tick" x="132" y="194" text-anchor="middle">測定 → 厚さ選定 → 組込み</text>
<circle class="k-part" cx="388" cy="110" r="40"/>
<circle class="k-part-h" cx="400" cy="104" r="16"/>
<line class="k-center" x1="340" y1="110" x2="436" y2="110"/><line class="k-center" x1="388" y1="62" x2="388" y2="158"/>
<line class="k-dimline" x1="388" y1="110" x2="400" y2="104" style="marker-end:url(#k-arrow)"/>
<text class="k-dimtext" x="440" y="84">偏心量 e</text>
<text class="tick" x="388" y="176" text-anchor="middle">回すだけで連続調整 (±e)</text>
<text class="tick" x="388" y="194" text-anchor="middle">調整後はロック (止めねじ等)</text>
</svg>
<p class="tb-caption">図: シムは段階的な調整、偏心ピンは連続的な調整。どちらも調整後の固定方法まで設計する</p>
<p>本文の例で、A の公差を広げたまま D をシムで調整すると、D の公差の代わりにシム厚さの刻み (例えば 0.05 mm) が効くようになり、部品公差を緩めてコストを下げられます。調整代の量は「最悪値の変動幅 − 要求範囲」を目安に決め、<b>調整範囲が最悪値の組合せでも足りる</b>ことを確認します。</p>
<h2>よくある失敗</h2>
<ul>
<li>部品数が多い連鎖に最悪値法を使い、公差が厳しすぎてコストが上がる</li>
<li>逆に RSS 法を少量生産 (分布が不明) に使い、組立で入らない部品が出る</li>
<li>てこ比で拡大されるガタを見落とし、先端の精度が出ない</li>
<li>調整機構を付けたが、調整後の固定方法がなく運転中にずれる</li>
</ul>
<h2>設計チェックリスト</h2>
<ul>
<li>閉ループ寸法 (すきま・位置) と要求範囲を定義したか</li>
<li>寸法連鎖をたどり、増加・減少寸法を正しく分けたか</li>
<li>最悪値・RSS・モンテカルロのどれを使うか、生産数と工程の状態から選んだか</li>
<li>ガタの予算を、先端への倍率を含めて配分したか</li>
<li>調整代の量・刻み・固定方法・調整手順を決めたか</li>
</ul>
`,
    points: [
      "すきまは寸法連鎖の増加寸法と減少寸法の足し引き",
      "最悪値法は必ず成立、RSS 法は独立な正規分布・平均が公称値の前提",
      "モンテカルロ法は分布や非線形を扱え、不良率で評価できる",
      "ガタはてこ比で拡大される。倍率の大きい箇所を優先して対策",
      "シム・偏心ピンなどの調整代で部品公差を緩め、調整後の固定まで設計する",
    ],
    exercises: [
      {
        q: "本文の連鎖で、A の公差を ± 0.03 に厳しくすると、最悪値法と RSS 法の G の範囲はどうなりますか。",
        a: "最悪値: 0.03 + 0.03 + 0.02 + 0.04 = ± 0.12 → G = <b>0.18〜0.42 mm</b> (まだ上限超過)。RSS: √(0.03² + 0.03² + 0.02² + 0.04²) = √0.0038 ≈ ± 0.062 → <b>0.238〜0.362 mm</b>。最悪値法で満たすには、さらに D の公差を ± 0.02 にする (± 0.10 → 0.20〜0.40) などが必要です。",
      },
      {
        q: "公差 ± 0.02 mm の部品を 9 個直列に積み上げます。最悪値法と RSS 法の積み上げ公差を比べてください。",
        a: "最悪値: 9 × 0.02 = <b>± 0.18 mm</b>。RSS: √9 × 0.02 = <b>± 0.06 mm</b>。部品数 n が同じ公差なら、RSS は最悪値の 1/√n になります (n = 9 で 1/3)。",
      },
      {
        q: "てこ比 4 の位置にある回転ピンのすきまが 0.03 mm、減速機バックラッシが 2 arcmin (腕長 150 mm) のとき、先端の位置ずれ (最悪値) を求めてください。",
        a: "ピン: 0.03 × 4 = 0.12 mm。減速機: 150 × 2/60 × π/180 ≈ 0.087 mm。最悪値合計 ≈ <b>0.21 mm</b>。ピンの寄与が大きいので、まずピンのすきまをなくす (テーパピン・ばね片寄せ) のが効果的です。",
      },
    ],
    quiz: [
      {
        q: "公差 ± 0.05 の寸法 4 つの積み上げで、RSS 法の積み上げ公差はどれか。",
        choices: ["± 0.05", "± 0.10", "± 0.20", "± 0.025"],
        answer: 1,
        explain: "√(4 × 0.05²) = 2 × 0.05 = ± 0.10 です。最悪値法では ± 0.20 になります。",
      },
      {
        q: "RSS 法の前提として正しいものはどれか。",
        choices: ["すべての寸法が同時に最悪側になる", "各寸法が独立で、平均が公称値付近の分布である", "部品数が 1 個である", "公差がすべて 0 である"],
        answer: 1,
        explain: "RSS 法は寸法が独立にばらつき、平均が公称値にある (正規分布に近い) ことを前提とした統計的な積み上げです。",
      },
      {
        q: "シムによる調整の利点として最も適切なのはどれか。",
        choices: ["調整後の固定が不要になる", "関係する部品の公差を緩めてコストを下げられる", "必ず無段階で調整できる", "組立工数がゼロになる"],
        answer: 1,
        explain: "組立時に実測して厚さを選ぶことで、連鎖の公差をシムが吸収し、部品公差を緩められます。調整は段階的で、組立工数は増えます。",
      },
    ],
  },
  {
    id: "design-calc-sheet",
    part: "elements",
    title: "強度計算書の書き方 — 前提・荷重ケース・判定",
    minutes: 30,
    level: 2,
    lead: "強度計算書は、計算した本人以外が読んで、前提・荷重・式・結果・判定を追えるようにするための文書です。構成、前提条件の書き方、荷重ケース表、安全率の表、参考文献、レビューの観点を、ワーク保持ブラケットの計算書を例に示します。設計文書全般は「【中級】設計計算書と設計文書」の章を参照してください。",
    body: `
<h2>計算書は「他人が検算できる」ことが目的</h2>
<p>計算書の読み手は、レビュアー、数年後に改造する設計者、事故が起きたときの調査者です。結果の数字だけでは役に立たず、<b>どんな前提で、どの荷重に対して、どの式で、何と比べて OK としたか</b>が追えることが必要です。</p>
<svg class="tb-chart" viewBox="0 0 520 250" role="img" aria-label="強度計算書の構成">
<text class="k-title" x="260" y="20" text-anchor="middle">強度計算書の標準構成</text>
<g class="k-shadow"><rect class="k-panel" x="150" y="32" width="220" height="210" rx="6"/></g>
<rect class="k-accent" x="150" y="32" width="220" height="24" rx="6"/>
<text class="lbl" x="260" y="49" text-anchor="middle" style="fill:#fff">計算書 No. ○○-001 改 B</text>
<g class="tick">
<text x="166" y="76">1. 目的・対象 (図番・部品番号)</text>
<text x="166" y="98">2. 前提条件・仮定</text>
<text x="166" y="120">3. 材料と許容値</text>
<text x="166" y="142">4. 荷重ケース表</text>
<text x="166" y="164">5. 計算 (式・数値・単位)</text>
<text x="166" y="186">6. 判定表 (安全率)</text>
<text x="166" y="208">7. 結論・申し送り</text>
<text x="166" y="230">8. 参考文献・改訂履歴</text>
</g>
<line class="k-thin" x1="370" y1="98" x2="396" y2="98"/><text class="tick" x="400" y="94">書かない前提は</text><text class="tick" x="400" y="110">検証できない</text>
<line class="k-thin" x1="370" y1="142" x2="396" y2="142"/><text class="tick" x="400" y="146">場面ごとに整理</text>
<line class="k-thin" x1="150" y1="186" x2="124" y2="186"/><text class="tick" x="18" y="182">必要安全率と</text><text class="tick" x="18" y="198">実安全率を並べる</text>
<line class="k-thin" x1="150" y1="208" x2="124" y2="208"/><text class="tick" x="18" y="222">図面への反映事項</text>
</svg>
<p class="tb-caption">図: 8 項目の構成。番号と改訂記号を付け、図面の注記から参照できるようにする</p>
<h2>前提条件と仮定 — いちばん大事な項目</h2>
<p>前提条件には、質量・寸法・速度などの<b>入力値とその出所</b> (仕様書番号・実測・推定) を書きます。仮定には、モデル化で単純化した点を書きます (例: 「取付面は剛とみなす」「溶接部は母材と同等とみなす」「応力集中は係数 K<sub>t</sub> = 2.0 で考慮」)。仮定は、<b>実物がその仮定から外れたら計算が無効になる条件</b>でもあります。</p>
<h2>荷重ケースと安全率</h2>
<p>荷重は<b>場面ごとのケース</b>として整理します。通常運転、起動・停止、非常停止、地震、保守作業 (人が乗る・吊る)、輸送などです。ケースごとに判定基準 (降伏・疲労・座屈・たわみ) と必要安全率を決めます。必要安全率は社内基準や適用規格に従い、ない場合は根拠を書いたうえで設定します。</p>
<div class="tb-math">S = \\dfrac{\\text{基準強さ (降伏点・疲労限度など)}}{\\text{発生応力}} \\ \\ge\\ S_{\\text{req}}, \\qquad \\sigma = \\dfrac{M}{Z} = \\dfrac{W L}{Z}</div>
<h2>計算例 — ワーク保持ブラケット (片持ち)</h2>
<svg class="tb-chart" viewBox="0 0 520 230" role="img" aria-label="片持ちブラケットの寸法と荷重">
<text class="k-title" x="260" y="20" text-anchor="middle">対象: ワーク保持ブラケット (SS400、9 × 32)</text>
<rect class="k-ground" x="60" y="40" width="20" height="170"/>
<g class="k-shadow"><rect class="k-part" x="80" y="60" width="40" height="130" rx="2"/><rect class="k-part" x="120" y="96" width="260" height="32" rx="2"/></g>
<g class="k-part-h"><circle cx="100" cy="76" r="6"/><circle cx="100" cy="174" r="6"/></g>
<rect class="k-plastic" x="340" y="128" width="80" height="50" rx="4"/>
<text class="lbl" x="380" y="158" text-anchor="middle" style="font-size:11px">30 kg</text>
<line class="k-force" x1="370" y1="182" x2="370" y2="214"/><text class="k-bad-t" x="378" y="212">W (鉛直)</text>
<line class="k-force" x1="430" y1="150" x2="470" y2="150"/><text class="k-bad-t" x="440" y="140">地震 1G</text>
<line class="k-ext" x1="120" y1="92" x2="120" y2="44"/><line class="k-ext" x1="370" y1="92" x2="370" y2="44"/>
<line class="k-dimline" x1="120" y1="50" x2="370" y2="50" style="marker-start:url(#k-arrow);marker-end:url(#k-arrow)"/><text class="k-dimtext" x="245" y="46" text-anchor="middle">L = 150</text>
<line class="k-dimline" x1="396" y1="96" x2="396" y2="128" style="marker-start:url(#k-arrow);marker-end:url(#k-arrow)"/><text class="k-dimtext" x="402" y="116">h = 32</text>
<text class="tick" x="130" y="146">板厚 b = 9</text>
<text class="tick" x="20" y="226">M8 × 2 本 (縦ピッチ 98)</text>
<text class="mark-t" x="146" y="88" style="fill:var(--tb-bad)">危険断面 (根元)</text>
</svg>
<p class="tb-caption">図: 根元断面で曲げが最大。鉛直荷重は強軸 (Z = bh²/6)、地震の水平荷重は弱軸 (Z = hb²/6) で受ける</p>
<p><b>前提条件</b>: ワーク+治具 30 kg (仕様書 ○○ による)、重心はブラケット先端 150 mm、材料 SS400 (降伏点 245 MPa、板厚 16 mm 以下)、取付面は剛、ボルト穴による断面欠損は根元から離れているので無視。断面係数 Z<sub>強</sub> = 9 × 32² / 6 = 1536 mm³、Z<sub>弱</sub> = 32 × 9² / 6 = 432 mm³、W = 30 × 9.81 = 294 N。</p>
<table class="tb-table">
<tr><th>ケース</th><th>内容</th><th>荷重</th><th>判定基準</th><th>必要安全率 (例)</th></tr>
<tr><td>LC1</td><td>通常運転 (静止保持)</td><td>鉛直 1.0W</td><td>降伏 (疲労は別途)</td><td>3.0</td></tr>
<tr><td>LC2</td><td>非常停止の衝撃</td><td>鉛直 2.0W (衝撃係数、目安)</td><td>降伏</td><td>2.0</td></tr>
<tr><td>LC3</td><td>地震 (短期)</td><td>鉛直 1.0W + 水平 1.0W</td><td>降伏</td><td>1.5</td></tr>
</table>
<table class="tb-table">
<tr><th>ケース</th><th>強軸曲げ σ<sub>v</sub></th><th>弱軸曲げ σ<sub>h</sub></th><th>合計</th><th>安全率</th><th>判定</th></tr>
<tr><td>LC1</td><td>294 × 150 / 1536 = 28.7 MPa</td><td>—</td><td>28.7 MPa</td><td>8.5</td><td>OK (≥ 3.0)</td></tr>
<tr><td>LC2</td><td>57.5 MPa</td><td>—</td><td>57.5 MPa</td><td>4.3</td><td>OK (≥ 2.0)</td></tr>
<tr><td>LC3</td><td>28.7 MPa</td><td>294 × 150 / 432 = 102.1 MPa</td><td>130.9 MPa</td><td><b>1.9</b></td><td>OK (≥ 1.5)</td></tr>
</table>
<p>LC3 の合計は、断面の角で強軸・弱軸の曲げ応力が同符号で重なる値 (安全側) です。<b>支配ケースは LC3 (地震時の弱軸曲げ)</b> で、通常運転の LC1 だけを計算していたら見落としていました。たわみ (LC1) は δ = WL³/(3EI) = 0.065 mm で、位置精度の要求 (例えば 0.1 mm) と比べて別途判定します。</p>
<h2>結論と申し送り</h2>
<ul>
<li>結論: 全ケースで必要安全率を満足。支配ケースは LC3</li>
<li>図面への反映: 板厚 9 mm 以上・材料 SS400 以上を指定。締結ボルトは別計算書 (No. ○○-002) で確認</li>
<li>前提の管理: ワーク質量が 30 kg を超える場合は再計算が必要 (変更管理の対象)</li>
</ul>
<h2>参考文献とレビュー</h2>
<p>使った式・材料値・係数には出所 (規格番号、便覧、社内基準、カタログの版) を書きます。レビューでは次の観点で確認します。</p>
<table class="tb-table">
<tr><th>観点</th><th>確認すること</th></tr>
<tr><td>前提</td><td>入力値の出所は正しいか、仮定は実物と合っているか</td></tr>
<tr><td>荷重ケース</td><td>非常停止・地震・保守・輸送などの抜けはないか</td></tr>
<tr><td>計算</td><td>単位・桁・式の適用範囲は正しいか (検算・概算で確認)</td></tr>
<tr><td>判定</td><td>基準強さ (降伏・疲労) と必要安全率の選び方は妥当か</td></tr>
<tr><td>反映</td><td>図面・仕様に結果が反映されているか</td></tr>
</table>
<h2>よくある失敗</h2>
<ul>
<li>結果の数字だけを書き、前提・入力の出所がないため検算できない</li>
<li>通常運転のケースしか計算せず、地震・非常停止の支配ケースを見落とす</li>
<li>安全率の基準 (降伏か引張強さか疲労か) を書かず、数字の意味が分からない</li>
<li>設計変更後に計算書を改訂せず、図面と計算書が食い違う</li>
</ul>
<h2>設計チェックリスト</h2>
<ul>
<li>計算書番号・改訂記号・対象図番・作成者・確認者が書かれているか</li>
<li>前提条件と仮定を列挙し、出所を示したか</li>
<li>荷重ケース表で場面を網羅し、ケースごとに判定基準と必要安全率を決めたか</li>
<li>判定表で実安全率と必要安全率を並べ、支配ケースを明示したか</li>
<li>図面への反映事項と、再計算が必要になる条件を書いたか</li>
</ul>
`,
    points: [
      "計算書は他人が前提・荷重・式・結果・判定を検算できるように書く",
      "前提条件と仮定 (出所・単純化) が最も大事な項目",
      "荷重ケースを場面ごとに整理し、ケースごとに判定基準と必要安全率を決める",
      "判定表に実安全率と必要安全率を並べ、支配ケースを明示する",
      "図面への反映事項と再計算が必要な条件を申し送る",
    ],
    exercises: [
      {
        q: "本文のブラケットで、ワーク質量が 45 kg に増えました。LC3 の合計応力と安全率を求め、判定してください。",
        a: "応力は荷重に比例: 130.9 × 45/30 ≈ <b>196 MPa</b>。安全率 245 / 196 ≈ <b>1.25</b> &lt; 1.5 → <b>NG</b>。板厚を増やすと弱軸の Z = hb²/6 が b² に比例して増えるので効果的です。",
      },
      {
        q: "上の 45 kg の条件で、LC3 を満たす最小の板厚を 1 mm 単位で求めてください (h = 32 mm は同じ)。",
        a: "W = 441.5 N。b = 10 mm: Z<sub>強</sub> = 10 × 32²/6 ≈ 1707、Z<sub>弱</sub> = 32 × 10²/6 ≈ 533。σ = 441.5 × 150 × (1/1707 + 1/533) ≈ 38.8 + 124.2 = 163.0 MPa、S = 1.50 (ぎりぎり)。b = 11 mm: Z<sub>強</sub> ≈ 1877、Z<sub>弱</sub> ≈ 645、σ ≈ 35.3 + 102.6 = 137.9 MPa、S ≈ <b>1.78</b>。余裕を考え <b>b = 11 mm</b> 以上 (12 mm の規格板を使うのが実際的) とします。",
      },
      {
        q: "本文の LC2 で、2 本の M8 ボルト (縦ピッチ 98 mm) のうち上側のボルトに加わる引張力を概算してください (下側ボルトのあたりを支点とみなす簡易計算)。",
        a: "モーメント M = 2W × L = 2 × 294 × 150 ≈ 88 300 N·mm。支点を下側ボルト付近とすると上側ボルトの力 F ≈ M / 98 ≈ <b>901 N</b>。これをボルト締結の計算書 (必要締付け力・分離の判定) の入力として引き継ぎます。",
      },
    ],
    quiz: [
      {
        q: "強度計算書で最も重要とされる項目はどれか。",
        choices: ["表紙のデザイン", "前提条件と仮定 (入力値の出所と単純化)", "ページ数", "計算ソフトの名前だけ"],
        answer: 1,
        explain: "前提と仮定が書かれていないと、計算が正しいか、実物に当てはまるかを検証できません。",
      },
      {
        q: "本文の例で支配ケースとなったのはどれか。",
        choices: ["LC1 通常運転", "LC2 非常停止", "LC3 地震時の弱軸曲げ", "どれも同じ"],
        answer: 2,
        explain: "水平荷重を断面係数の小さい弱軸で受けるため、LC3 の応力が最大で安全率が最も小さくなりました。",
      },
      {
        q: "判定表に書くべき内容として適切なものはどれか。",
        choices: ["実安全率だけ", "必要安全率だけ", "ケースごとの発生応力・実安全率・必要安全率・判定", "計算者の感想"],
        answer: 2,
        explain: "実安全率と必要安全率を並べて OK/NG を明示し、支配ケースが分かるようにします。",
      },
    ],
  },
];
