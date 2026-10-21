import type { TextChapter } from "../types";

export const ELEMENTS: TextChapter[] = [
  {
    id: "bearings",
    part: "elements",
    title: "軸受 — 回転を支える",
    minutes: 20,
    level: 2,
    lead: "回転する軸を支え、摩擦を小さくするのが軸受です。種類の選び方、寿命の計算、取付けの基本 (固定側と自由側、はめあい) を学びます。",
    body: `
<h2>転がり軸受とすべり軸受</h2>
<table class="tb-table">
  <tr><th></th><th>転がり軸受 (玉・ころ)</th><th>すべり軸受 (ブシュ)</th></tr>
  <tr><td>摩擦</td><td>起動時から小さい</td><td>起動時は大きいが、油膜ができると小さい</td></tr>
  <tr><td>長所</td><td>規格品で入手しやすく、交換が簡単、精度が高い</td><td>小さい・安い・静か・衝撃に強い</td></tr>
  <tr><td>用途</td><td>モーター、減速機、一般機械の回転軸</td><td>低速の揺動部、ヒンジ、エンジンのクランク軸</td></tr>
</table>
<h2>主な転がり軸受</h2>
<ul>
  <li><b>深溝玉軸受 (60xx, 62xx)</b>: 最もよく使う。ラジアル荷重と、ある程度のアキシアル荷重を受けられる。番号の下 2 桁 × 5 が内径 (04 → 20 mm、00〜03 は 10, 12, 15, 17 mm)</li>
  <li><b>アンギュラ玉軸受</b>: 大きなアキシアル荷重。2 個を向かい合わせて使う (工作機械の主軸)</li>
  <li><b>円すいころ軸受</b>: 大きなラジアル + アキシアル荷重 (自動車の車輪)</li>
  <li><b>円筒ころ軸受</b>: 大きなラジアル荷重、軸方向に動ける (自由側に向く)</li>
  <li><b>スラスト軸受</b>: アキシアル荷重専用</li>
</ul>
<svg class="tb-chart" viewBox="0 0 520 208" role="img" aria-label="転がり軸受の種類と荷重の向き">
<rect class="k-panel" x="8" y="8" width="120" height="192" rx="8"/><line class="k-center" x1="20" y1="150" x2="116" y2="150"/><g class="k-shadow"><rect class="k-part" x="24" y="120" width="88" height="22" rx="2"/></g><g class="k-shadow"><rect class="k-cut" x="38" y="54" width="60" height="16"/><rect class="k-cut2" x="38" y="104" width="60" height="16"/><circle class="k-sphere" cx="68" cy="87" r="15"/></g><line class="k-force" x1="68" y1="18" x2="68" y2="50" stroke-width="2.4"/><text class="tick" x="74" y="32" style="fill:var(--tb-bad)">R</text><line class="k-force" x1="10" y1="87" x2="35" y2="87" stroke-width="1.6"/><text class="tick" x="16" y="80" style="fill:var(--tb-bad)">A</text><text class="k-title" x="68" y="172" text-anchor="middle">深溝玉</text><text class="k-note" x="68" y="190" text-anchor="middle">最も一般的</text>
<rect class="k-panel" x="136" y="8" width="120" height="192" rx="8"/><line class="k-center" x1="148" y1="150" x2="244" y2="150"/><g class="k-shadow"><rect class="k-part" x="152" y="120" width="88" height="22" rx="2"/></g><g class="k-shadow"><path class="k-cut" d="M166,54 H226 V74 H208 Q196,70 178,70 H166 Z"/><path class="k-cut2" d="M166,120 V100 H184 Q196,104 214,104 H226 V120 Z"/><circle class="k-sphere" cx="196" cy="87" r="15"/></g><line class="k-center" x1="206" y1="66" x2="186" y2="108"/><line class="k-force" x1="196" y1="18" x2="196" y2="50" stroke-width="2.4"/><text class="tick" x="202" y="32" style="fill:var(--tb-bad)">R</text><line class="k-force" x1="138" y1="87" x2="163" y2="87" stroke-width="3.4"/><text class="tick" x="144" y="80" style="fill:var(--tb-bad)">A</text><text class="k-title" x="196" y="172" text-anchor="middle">アンギュラ玉</text><text class="k-note" x="196" y="190" text-anchor="middle">対で使う (主軸)</text>
<rect class="k-panel" x="264" y="8" width="120" height="192" rx="8"/><line class="k-center" x1="276" y1="150" x2="372" y2="150"/><g class="k-shadow"><rect class="k-part" x="280" y="120" width="88" height="22" rx="2"/></g><g class="k-shadow"><path class="k-cut" d="M294,54 H354 V64 L294,76 Z"/><path class="k-cut2" d="M294,120 V104 L354,92 V120 Z"/><path class="k-part" d="M302,78 L346,68 L348,90 L304,100 Z"/></g><line class="k-force" x1="324" y1="18" x2="324" y2="50" stroke-width="3.4"/><text class="tick" x="330" y="32" style="fill:var(--tb-bad)">R</text><line class="k-force" x1="266" y1="87" x2="291" y2="87" stroke-width="3.0"/><text class="tick" x="272" y="80" style="fill:var(--tb-bad)">A</text><text class="k-title" x="324" y="172" text-anchor="middle">円すいころ</text><text class="k-note" x="324" y="190" text-anchor="middle">車輪など</text>
<rect class="k-panel" x="392" y="8" width="120" height="192" rx="8"/><line class="k-center" x1="404" y1="150" x2="500" y2="150"/><g class="k-shadow"><rect class="k-part" x="408" y="120" width="88" height="22" rx="2"/></g><g class="k-shadow"><rect class="k-cut" x="422" y="54" width="60" height="16"/><rect class="k-cut2" x="422" y="104" width="60" height="16"/><rect class="k-part" x="432" y="72" width="40" height="30" rx="3"/></g><line class="k-force" x1="452" y1="18" x2="452" y2="50" stroke-width="3.6"/><text class="tick" x="458" y="32" style="fill:var(--tb-bad)">R</text><text class="k-title" x="452" y="172" text-anchor="middle">円筒ころ</text><text class="k-note" x="452" y="190" text-anchor="middle">自由側に向く</text>
</svg>
<p class="tb-caption">図: 軸受の上半分の断面。矢印 R はラジアル荷重、A はアキシアル荷重で、太さは受けられる大きさの目安。円筒ころは軸方向に動ける</p>
<div data-widget="3d-bearing"></div>
<p class="tb-caption">3D 図: 深溝玉軸受を分解すると、外輪・内輪・玉・保持器の 4 部品からなることがわかります。</p>
<h2>寿命の計算</h2>
<div class="tb-formula">L10 = (C / P)ᵖ × 10⁶ 回転　　(玉軸受 p = 3、ころ軸受 p = 10/3)<br>寿命時間 L10h = L10 / (60 n)</div>
<p>C は<b>基本動定格荷重</b> (カタログ値)、P は<b>動等価荷重</b>です。L10 は、同じ条件で使った軸受の 90 % が転がり疲れで壊れずに回れる回転数です。
<b>荷重を半分にすると寿命は 8 倍</b>になります。荷重の変動や衝撃は荷重係数 fw (1.0〜1.5 程度) を掛けて見込みます。</p>
<div data-widget="bearing"></div>
<h2>取付けの基本</h2>
<ul>
  <li><b>固定側と自由側</b>: 軸を 2 個の軸受で支えるとき、1 つは軸方向に固定、もう 1 つは軸方向に動けるようにする。両方固定すると熱膨張で軸受に無理な力がかかる</li>
  <li><b>はめあい</b>: 回転する側の輪はしまりばめ (内輪回転なら軸を k5〜m6)、静止側はすきまばめ〜中間ばめ (ハウジング H7 など)</li>
  <li><b>肩の高さ</b>: 軸・ハウジングの段は、軸受の取外しができる高さに (カタログの推奨寸法)</li>
  <li><b>潤滑と密封</b>: シール付き (DDU, ZZ) はグリース封入済みで手間が少ない</li>
</ul>
<svg class="tb-chart" viewBox="0 0 520 230" role="img" aria-label="固定側と自由側">
<g class="k-shadow"><path class="k-cut" d="M60,36 H460 V88 H420 V64 H380 V88 H134 V64 H106 V88 H60 Z"/><path class="k-cut" d="M60,174 H460 V122 H420 V146 H380 V122 H134 V146 H106 V122 H60 Z"/></g>
<g class="k-shadow"><rect class="k-part" x="30" y="92" width="460" height="26" rx="2"/></g>
<line class="k-center" x1="22" y1="105" x2="498" y2="105"/>
<rect class="k-alu" x="106" y="64" width="28" height="28" rx="1"/><circle class="k-sphere" cx="120" cy="78" r="8"/>
<rect class="k-alu" x="106" y="118" width="28" height="28" rx="1"/><circle class="k-sphere" cx="120" cy="132" r="8"/>
<rect class="k-alu" x="386" y="64" width="28" height="28" rx="1"/><circle class="k-sphere" cx="400" cy="78" r="8"/>
<rect class="k-alu" x="386" y="118" width="28" height="28" rx="1"/><circle class="k-sphere" cx="400" cy="132" r="8"/>
<rect class="" x="100" y="87" width="5" height="6" rx="1" style="fill:var(--k-line)"/>
<rect class="" x="135" y="87" width="5" height="6" rx="1" style="fill:var(--k-line)"/>
<rect class="" x="100" y="117" width="5" height="6" rx="1" style="fill:var(--k-line)"/>
<rect class="" x="135" y="117" width="5" height="6" rx="1" style="fill:var(--k-line)"/>
<text class="k-title" x="120" y="24" text-anchor="middle">固定側</text>
<text class="k-title" x="400" y="24" text-anchor="middle">自由側</text>
<line class="k-move" x1="374" y1="56" x2="426" y2="56" style="marker-start:url(#k-arrow-blue)"/>
<text class="k-note" x="400" y="196" text-anchor="middle">外輪が軸方向に動ける</text>
<text class="k-note" x="120" y="196" text-anchor="middle">内輪・外輪とも軸方向に固定</text>
<line class="k-move" x1="210" y1="105" x2="310" y2="105" style="stroke:var(--tb-bad);marker-end:url(#k-arrow-red)" stroke-width="2.4"/>
<text class="tick" x="260" y="216" text-anchor="middle">熱膨張で軸が伸びても、自由側が逃げるので無理な力がかからない</text>
<text class="k-note" x="260" y="188" text-anchor="middle">ハウジング (断面)</text>
<text class="k-note" x="260" y="100" text-anchor="middle" style="fill:var(--tb-text)">軸</text>
</svg>
<p class="tb-caption">図: 軸を 2 個の軸受で支えるときの基本。片側を軸方向に固定し、もう片側は軸方向に動けるようにする</p>
<div class="tb-tip"><b>3DCAD Studio</b>: 「標準部品」に深溝玉軸受 (60xx / 62xx) があります。アセンブリで軸と挿入拘束で組み、軸受の肩寸法と干渉を確認しましょう。</div>`,
    points: ["回転部は転がり軸受、低速・揺動・小形はすべり軸受", "6204 = 深溝玉軸受、内径 04 × 5 = 20 mm", "L10 = (C/P)³ × 10⁶ 回転 — 荷重半分で寿命 8 倍", "固定側と自由側を分け、回転輪はしまりばめ"],
    exercises: [
      {
        q: "深溝玉軸受 6204 (Cr = 12.8 kN) にラジアル荷重 1.5 kN をかけ、1450 min⁻¹ で回します。寿命時間 L10h を求めてください。",
        a: "L10 = (12.8 / 1.5)³ × 10⁶ = 8.53³ × 10⁶ ≈ 621 × 10⁶ 回転。L10h = 621 × 10⁶ / (60 × 1450) ≈ <b>7 100 時間</b>。一般機械の目安 (2 万時間) に足りないので、6205 や 6304 など大きい軸受にするか、荷重を下げます。",
      },
    ],
    quiz: [
      { q: "軸受番号 6205 の内径は?", choices: ["5 mm", "25 mm", "52 mm"], answer: 1, explain: "下 2 桁 05 × 5 = 25 mm です (52 mm は外径)。" },
      { q: "玉軸受の荷重を 1/2 にすると、寿命はおよそ何倍?", choices: ["2 倍", "4 倍", "8 倍"], answer: 2, explain: "寿命は (C/P)³ に比例するので 2³ = 8 倍です。" },
      { q: "2 個の軸受で軸を支えるとき、片側を軸方向に自由にする理由は?", choices: ["組立を速くするため", "熱膨張による伸びを逃がすため", "回転を速くするため"], answer: 1, explain: "両方固定すると、温度変化による軸の伸び縮みで軸受に大きな力がかかります。" },
    ],
    lessons: ["5-1"],
  },
  {
    id: "gears",
    part: "elements",
    title: "歯車 — 回転と力を伝える",
    minutes: 20,
    level: 2,
    lead: "歯車は、回転数とトルクを正確な比で変えて伝えます。モジュール・歯数・中心距離の関係と、歯車の種類の選び方を学びます。",
    body: `
<h2>歯車の大きさ — モジュール</h2>
<div class="tb-formula">ピッチ円直径 d = m × z　　歯先円直径 da = m (z + 2)　　中心距離 a = m (z₁ + z₂) / 2</div>
<p><b>モジュール m</b> は歯の大きさで、かみ合う歯車は必ず同じモジュールです (JIS の標準値: 0.5, 0.8, 1, 1.25, 1.5, 2, 2.5, 3, 4 …)。
圧力角は 20° が標準です。</p>
<svg class="tb-chart" viewBox="0 0 520 240" role="img" aria-label="歯車のかみ合いとピッチ円">
<g class="k-shadow"><path class="k-part" d="M182.1,109.4 L182.9,113.1 L198.9,114.4 L198.9,121.6 L182.9,122.9 L182.1,126.6 L180.9,130.2 L194.1,139.3 L190.5,145.5 L176.1,138.7 L173.5,141.5 L170.7,144.1 L177.5,158.5 L171.3,162.1 L162.2,148.9 L158.6,150.1 L154.9,150.9 L153.6,166.9 L146.4,166.9 L145.1,150.9 L141.4,150.1 L137.8,148.9 L128.7,162.1 L122.5,158.5 L129.3,144.1 L126.5,141.5 L123.9,138.7 L109.5,145.5 L105.9,139.3 L119.1,130.2 L117.9,126.6 L117.1,122.9 L101.1,121.6 L101.1,114.4 L117.1,113.1 L117.9,109.4 L119.1,105.8 L105.9,96.7 L109.5,90.5 L123.9,97.3 L126.5,94.5 L129.3,91.9 L122.5,77.5 L128.7,73.9 L137.8,87.1 L141.4,85.9 L145.1,85.1 L146.4,69.1 L153.6,69.1 L154.9,85.1 L158.6,85.9 L162.2,87.1 L171.3,73.9 L177.5,77.5 L170.7,91.9 L173.5,94.5 L176.1,97.3 L190.5,90.5 L194.1,96.7 L180.9,105.8 Z"/><path class="k-alu" d="M200.8,118 L200.9,113.8 L185.5,109.3 L186.6,102.6 L202.6,103.1 L203.7,99.1 L205.2,95.1 L191.9,86.1 L195,80.1 L210.1,85.5 L212.4,82 L215.1,78.7 L205.2,66 L210,61.2 L222.7,71.1 L226,68.4 L229.5,66.1 L224.1,51 L230.1,47.9 L239.1,61.2 L243.1,59.7 L247.1,58.6 L246.6,42.6 L253.3,41.5 L257.8,56.9 L262,56.8 L266.2,56.9 L270.7,41.5 L277.4,42.6 L276.9,58.6 L280.9,59.7 L284.9,61.2 L293.9,47.9 L299.9,51 L294.5,66.1 L298,68.4 L301.3,71.1 L314,61.2 L318.8,66 L308.9,78.7 L311.6,82 L313.9,85.5 L329,80.1 L332.1,86.1 L318.8,95.1 L320.3,99.1 L321.4,103.1 L337.4,102.6 L338.5,109.3 L323.1,113.8 L323.2,118 L323.1,122.2 L338.5,126.7 L337.4,133.4 L321.4,132.9 L320.3,136.9 L318.8,140.9 L332.1,149.9 L329,155.9 L313.9,150.5 L311.6,154 L308.9,157.3 L318.8,170 L314,174.8 L301.3,164.9 L298,167.6 L294.5,169.9 L299.9,185 L293.9,188.1 L284.9,174.8 L280.9,176.3 L276.9,177.4 L277.4,193.4 L270.7,194.5 L266.2,179.1 L262,179.2 L257.8,179.1 L253.3,194.5 L246.6,193.4 L247.1,177.4 L243.1,176.3 L239.1,174.8 L230.1,188.1 L224.1,185 L229.5,169.9 L226,167.6 L222.7,164.9 L210,174.8 L205.2,170 L215.1,157.3 L212.4,154 L210.1,150.5 L195,155.9 L191.9,149.9 L205.2,140.9 L203.7,136.9 L202.6,132.9 L186.6,133.4 L185.5,126.7 L200.9,122.2 Z"/></g>
<circle class="k-edge" cx="150" cy="118" r="12" style="fill:var(--tb-surface)"/>
<circle class="k-edge" cx="262" cy="118" r="16" style="fill:var(--tb-surface)"/>
<circle class="k-center" cx="150" cy="118" r="42"/>
<circle class="k-center" cx="262" cy="118" r="70"/>
<line class="k-ext" x1="150" y1="118" x2="150" y2="220"/>
<line class="k-ext" x1="262" y1="118" x2="262" y2="220"/>
<line class="k-dimline" x1="150" y1="214" x2="262" y2="214"/>
<text class="k-dimtext" x="206" y="232" text-anchor="middle">中心距離 a = m (z₁ + z₂) / 2</text>
<path class="k-move" d="M120,56 A64,64 0 0 1 170,52"/>
<path class="k-move" d="M302.0,32 A94,94 0 0 0 252.0,22"/>
<text class="lbl" x="130" y="30" text-anchor="middle">ピニオン z₁ (速い)</text>
<text class="lbl" x="346" y="44">大歯車 z₂</text>
<text class="k-note" x="346" y="60">(遅い・大トルク)</text>
<text class="k-dimtext" x="14" y="206">ピッチ円 d = m·z</text>
<line class="k-thin" x1="60" y1="194" x2="121" y2="148" style="stroke:var(--k-dim)"/>
<rect class="k-panel" x="372" y="120" width="140" height="64" rx="8"/>
<text class="k-note" x="382" y="144">かみ合う歯車は</text>
<text class="k-title" x="382" y="160">同じモジュール m</text>
<text class="k-note" x="382" y="176">圧力角 20°</text>
</svg>
<p class="tb-caption">図: 2 つの歯車はピッチ円 (一点鎖線) が接するようにかみ合う。中心距離はピッチ円半径の和</p>
<h2>速比とトルク</h2>
<div class="tb-formula">速比 i = z₂ / z₁ = n₁ / n₂　　出力トルク T₂ = T₁ × i × 効率</div>
<p>小歯車 (ピニオン) で大歯車を回すと、回転は遅くなり、トルクは大きくなります (減速)。動力 (トルク × 回転数) は効率の分だけ減ってそのまま伝わります。</p>
<div data-widget="gear"></div>
<div data-widget="3d-gears"></div>
<p class="tb-caption">3D 図: 赤い印で回転数を数えると、速度比 i = z₂ / z₁ が確かめられます。歯数の組合せを変えてみましょう。</p>
<h2>歯車の種類</h2>
<table class="tb-table">
  <tr><th>種類</th><th>軸の配置</th><th>特徴</th></tr>
  <tr><td>平歯車</td><td>平行</td><td>作りやすく安い。効率 98 % 前後。高速では騒音</td></tr>
  <tr><td>はすば歯車</td><td>平行</td><td>歯が斜めで静か・強い。アキシアル荷重が生じる</td></tr>
  <tr><td>かさ歯車</td><td>交わる (90° など)</td><td>回転の向きを変える</td></tr>
  <tr><td>ウォームギヤ</td><td>直交 (交わらない)</td><td>1 段で大きな減速比 (10〜100)。効率は低め。逆転しにくい (セルフロック)</td></tr>
  <tr><td>ラック・ピニオン</td><td>—</td><td>回転を直線運動に変える</td></tr>
</table>
<svg class="tb-chart" viewBox="0 0 520 168" role="img" aria-label="歯車の種類">
<rect class="k-panel" x="8.0" y="8" width="96" height="152" rx="8"/>
<text class="k-title" x="56" y="132" text-anchor="middle">平歯車</text>
<text class="k-note" x="56" y="150" text-anchor="middle">平行軸</text>
<rect class="k-panel" x="110.4" y="8" width="96" height="152" rx="8"/>
<text class="k-title" x="158.4" y="132" text-anchor="middle">はすば歯車</text>
<text class="k-note" x="158.4" y="150" text-anchor="middle">平行軸・静か</text>
<rect class="k-panel" x="212.8" y="8" width="96" height="152" rx="8"/>
<text class="k-title" x="260.8" y="132" text-anchor="middle">かさ歯車</text>
<text class="k-note" x="260.8" y="150" text-anchor="middle">交わる軸</text>
<rect class="k-panel" x="315.2" y="8" width="96" height="152" rx="8"/>
<text class="k-title" x="363.2" y="132" text-anchor="middle">ウォーム</text>
<text class="k-note" x="363.2" y="150" text-anchor="middle">直交・大減速</text>
<rect class="k-panel" x="417.6" y="8" width="96" height="152" rx="8"/>
<text class="lbl" x="465.6" y="132" text-anchor="middle" style="font-size:11px">ラック・ピニオン</text>
<text class="k-note" x="465.6" y="150" text-anchor="middle">回転 → 直線</text>
<g class="k-shadow"><rect class="k-part-h" x="30" y="40" width="52" height="64" rx="4"/></g>
<line class="k-thin" x1="34" y1="42" x2="34" y2="102"/><line class="k-thin" x1="40" y1="42" x2="40" y2="102"/><line class="k-thin" x1="46" y1="42" x2="46" y2="102"/><line class="k-thin" x1="52" y1="42" x2="52" y2="102"/><line class="k-thin" x1="58" y1="42" x2="58" y2="102"/><line class="k-thin" x1="64" y1="42" x2="64" y2="102"/><line class="k-thin" x1="70" y1="42" x2="70" y2="102"/><line class="k-thin" x1="76" y1="42" x2="76" y2="102"/>
<g class="k-shadow"><rect class="k-part-h" x="132" y="40" width="52" height="64" rx="4"/></g>
<line class="k-thin" x1="136" y1="102" x2="150" y2="42"/><line class="k-thin" x1="142" y1="102" x2="156" y2="42"/><line class="k-thin" x1="148" y1="102" x2="162" y2="42"/><line class="k-thin" x1="154" y1="102" x2="168" y2="42"/><line class="k-thin" x1="160" y1="102" x2="174" y2="42"/><line class="k-thin" x1="166" y1="102" x2="180" y2="42"/><line class="k-thin" x1="172" y1="102" x2="186" y2="42"/>
<g class="k-shadow"><path class="k-part" d="M228,104 L268,104 L258,70 L238,70 Z"/><path class="k-alu" d="M262,40 L262,80 L288,68 L288,52 Z"/></g>
<line class="k-center" x1="248" y1="112" x2="248" y2="30"/>
<line class="k-center" x1="240" y1="60" x2="300" y2="60"/>
<g class="k-shadow"><circle class="k-alu" cx="359" cy="62" r="26"/><rect class="k-part-h" x="334" y="88" width="50" height="18" rx="8"/></g>
<line class="k-thin" x1="340" y1="106" x2="346" y2="88"/><line class="k-thin" x1="347" y1="106" x2="353" y2="88"/><line class="k-thin" x1="354" y1="106" x2="360" y2="88"/><line class="k-thin" x1="361" y1="106" x2="367" y2="88"/><line class="k-thin" x1="368" y1="106" x2="374" y2="88"/><line class="k-thin" x1="375" y1="106" x2="381" y2="88"/>
<g class="k-shadow"><path class="k-part" d="M425.6,100 L427.6,100 L429.6,92 L435.6,92 L437.6,100 L439.6,100 L441.6,92 L447.6,92 L449.6,100 L451.6,100 L453.6,92 L459.6,92 L461.6,100 L463.6,100 L465.6,92 L471.6,92 L473.6,100 L475.6,100 L477.6,92 L483.6,92 L485.6,100 L487.6,100 L489.6,92 L495.6,92 L497.6,100 L499.6,100 L501.6,92 L507.6,92 L509.6,100 L507.6,100 L507.6,110 L425.6,110 Z"/><path class="k-alu" d="M465.6,47.2 L468.2,47.4 L472.3,36.8 L477.3,38.4 L474.4,49.5 L476.6,50.8 L478.6,52.5 L488.2,46.3 L491.3,50.6 L482.5,57.8 L483.4,60.2 L484.1,62.7 L495.5,63.4 L495.5,68.6 L484.1,69.3 L483.4,71.8 L482.5,74.2 L491.3,81.4 L488.2,85.7 L478.6,79.5 L476.6,81.2 L474.4,82.5 L477.3,93.6 L472.3,95.2 L468.2,84.6 L465.6,84.8 L463,84.6 L458.9,95.2 L453.9,93.6 L456.8,82.5 L454.6,81.2 L452.6,79.5 L443,85.7 L439.9,81.4 L448.7,74.2 L447.8,71.8 L447.1,69.3 L435.7,68.6 L435.7,63.4 L447.1,62.7 L447.8,60.2 L448.7,57.8 L439.9,50.6 L443,46.3 L452.6,52.5 L454.6,50.8 L456.8,49.5 L453.9,38.4 L458.9,36.8 L463,47.4 Z"/></g>
<circle class="k-edge" cx="465.6" cy="66" r="5" style="fill:var(--tb-surface)"/>
<line class="k-move" x1="437.6" y1="118" x2="493.6" y2="118" style="marker-start:url(#k-arrow-blue)"/>
</svg>
<p class="tb-caption">図: 代表的な歯車。軸の配置 (平行・交わる・直交) と必要な減速比で選ぶ</p>
<h2>設計の注意</h2>
<ul>
  <li><b>歯数 17 未満</b>の標準歯車は根元が削られる<b>切下げ</b>が起きる → 転位歯車にするか歯数を増やす</li>
  <li>互いに素な歯数の組み合わせ (例 20 と 61) にすると、同じ歯同士ばかりかみ合わず摩耗が均一になる</li>
  <li>適度な<b>バックラッシ</b> (歯のすきま) が必要。位置決め精度が重要なら、バックラッシの小さい減速機を選ぶ</li>
  <li>強度 (歯の曲げ・歯面の面圧) は JIS B 1759 などの計算式で確認する。まずは市販の歯車のカタログで許容トルクを確認するのが実用的</li>
</ul>`,
    points: ["d = m·z、中心距離 a = m(z₁ + z₂)/2、かみ合う歯車は同じモジュール", "速比 i = z₂/z₁ — 減速するとトルクは増える", "平歯車・はすば・かさ・ウォーム・ラックを用途で選ぶ", "歯数 17 未満は切下げ、バックラッシを考慮"],
    exercises: [
      {
        q: "モジュール 2、歯数 20 と 50 の平歯車があります。ピッチ円直径、中心距離、速比を求め、入力 1500 min⁻¹・10 N·m のときの出力回転数とトルクを求めてください (効率は無視)。",
        a: "d₁ = 40 mm、d₂ = 100 mm、a = 2 × 70 / 2 = <b>70 mm</b>、i = <b>2.5</b>。出力 1500 / 2.5 = <b>600 min⁻¹</b>、トルク 10 × 2.5 = <b>25 N·m</b>。",
      },
    ],
    quiz: [
      { q: "かみ合う 2 つの歯車で必ず同じにするのは?", choices: ["歯数", "モジュール", "歯幅"], answer: 1, explain: "歯の大きさ (モジュール) と圧力角が同じでないとかみ合いません。" },
      { q: "1 段で大きな減速比が得られ、逆転しにくい歯車は?", choices: ["平歯車", "ウォームギヤ", "かさ歯車"], answer: 1, explain: "ウォームギヤは 1 段で 10〜100 程度の減速比が得られ、条件によってセルフロックします。" },
    ],
  },
  {
    id: "springs",
    part: "elements",
    title: "ばね — 力をためる・押し付ける",
    minutes: 15,
    level: 2,
    lead: "ばねは、部品を押し付ける、衝撃を吸収する、元に戻す、力を測るなど、多くの機構で使われます。コイルばねのばね定数と応力の計算を学びます。",
    body: `
<h2>ばね定数とつなぎ方</h2>
<div class="tb-formula">P = k × δ　　直列: 1/k = 1/k₁ + 1/k₂　　並列: k = k₁ + k₂</div>
<p>直列につなぐと柔らかく (k が小さく)、並列につなぐと硬く (k が大きく) なります。</p>
<svg class="tb-chart" viewBox="0 0 520 180" role="img" aria-label="ばねの直列と並列">
<rect class="k-panel" x="8" y="8" width="244" height="164" rx="8"/>
<rect class="k-panel" x="268" y="8" width="244" height="164" rx="8"/>
<text class="k-title" x="130" y="32" text-anchor="middle">直列</text>
<text class="k-title" x="390" y="32" text-anchor="middle">並列</text>
<rect class="k-ground" x="18" y="60" width="12" height="60"/><line class="k-edge" x1="30" y1="60" x2="30" y2="120"/>
<path class="k-edge" d="M30,90 L38,90 L42,99 L50,81 L58,99 L66,81 L74,99 L82,81 L90,99 L98,81 L102,90 L110,90" style="stroke:var(--tb-accent)" stroke-width="2"/>
<circle class="k-sphere" cx="115" cy="90" r="5"/>
<path class="k-edge" d="M120,90 L128,90 L131.8,99 L139.2,81 L146.8,99 L154.2,81 L161.8,99 L169.2,81 L176.8,99 L184.2,81 L188,90 L196,90" style="stroke:var(--tb-accent)" stroke-width="2"/>
<rect class="k-part" x="196" y="78" width="10" height="24" rx="2"/>
<line class="k-force" x1="208" y1="90" x2="238" y2="90"/>
<text class="lbl" x="70" y="72" text-anchor="middle">k₁</text>
<text class="lbl" x="158" y="72" text-anchor="middle">k₂</text>
<text class="mark-t" x="130" y="140" text-anchor="middle">1/k = 1/k₁ + 1/k₂</text>
<text class="k-note" x="130" y="160" text-anchor="middle">柔らかくなる (k が小さく)</text>
<rect class="k-ground" x="278" y="52" width="12" height="76"/><line class="k-edge" x1="290" y1="52" x2="290" y2="128"/>
<path class="k-edge" d="M290,70 L300,70 L306,78 L318,62 L330,78 L342,62 L354,78 L366,62 L378,78 L390,62 L402,78 L414,62 L420,70 L430,70" style="stroke:var(--tb-accent)" stroke-width="2"/>
<path class="k-edge" d="M290,110 L300,110 L306,118 L318,102 L330,118 L342,102 L354,118 L366,102 L378,118 L390,102 L402,118 L414,102 L420,110 L430,110" style="stroke:var(--tb-accent)" stroke-width="2"/>
<rect class="k-part" x="430" y="58" width="10" height="64" rx="2"/>
<line class="k-force" x1="442" y1="90" x2="476" y2="90"/>
<text class="lbl" x="360" y="56" text-anchor="middle">k₁</text>
<text class="lbl" x="360" y="96" text-anchor="middle">k₂</text>
<text class="mark-t" x="390" y="140" text-anchor="middle">k = k₁ + k₂</text>
<text class="k-note" x="390" y="160" text-anchor="middle">硬くなる (k が大きく)</text>
</svg>
<p class="tb-caption">図: ばねのつなぎ方。直列は同じ力で両方が伸び、並列は同じ伸びで力を分け合う</p>
<h2>圧縮コイルばね</h2>
<div class="tb-formula">k = G d⁴ / (8 D³ n)　　τ = κ · 8 P D / (π d³)</div>
<p>d: 線径、D: コイル平均径、n: 有効巻数、G: 横弾性係数 (ばね鋼 78.5 GPa)。κ は曲がった線の内側で応力が大きくなることを補正する<b>応力修正係数</b> (ワールの式)。</p>
<svg class="tb-chart" viewBox="0 0 520 220" role="img" aria-label="圧縮コイルばねの各部">
<line class="" x1="85.7" y1="64" x2="101.4" y2="136" style="stroke:var(--k-line-2)" stroke-width="5"/>
<line class="" x1="117.1" y1="64" x2="132.9" y2="136" style="stroke:var(--k-line-2)" stroke-width="5"/>
<line class="" x1="148.6" y1="64" x2="164.3" y2="136" style="stroke:var(--k-line-2)" stroke-width="5"/>
<line class="" x1="180" y1="64" x2="195.7" y2="136" style="stroke:var(--k-line-2)" stroke-width="5"/>
<line class="" x1="211.4" y1="64" x2="227.1" y2="136" style="stroke:var(--k-line-2)" stroke-width="5"/>
<line class="" x1="242.9" y1="64" x2="258.6" y2="136" style="stroke:var(--k-line-2)" stroke-width="5"/>
<line class="" x1="274.3" y1="64" x2="290" y2="136" style="stroke:var(--k-line-2)" stroke-width="5"/>
<line class="" x1="70" y1="136" x2="85.7" y2="64" style="stroke:var(--k-line)" stroke-width="7.5" stroke-linecap="round"/>
<line class="" x1="70" y1="136" x2="85.7" y2="64" style="stroke:var(--k-steel-2)" stroke-width="4.5" stroke-linecap="round"/>
<line class="" x1="101.4" y1="136" x2="117.1" y2="64" style="stroke:var(--k-line)" stroke-width="7.5" stroke-linecap="round"/>
<line class="" x1="101.4" y1="136" x2="117.1" y2="64" style="stroke:var(--k-steel-2)" stroke-width="4.5" stroke-linecap="round"/>
<line class="" x1="132.9" y1="136" x2="148.6" y2="64" style="stroke:var(--k-line)" stroke-width="7.5" stroke-linecap="round"/>
<line class="" x1="132.9" y1="136" x2="148.6" y2="64" style="stroke:var(--k-steel-2)" stroke-width="4.5" stroke-linecap="round"/>
<line class="" x1="164.3" y1="136" x2="180" y2="64" style="stroke:var(--k-line)" stroke-width="7.5" stroke-linecap="round"/>
<line class="" x1="164.3" y1="136" x2="180" y2="64" style="stroke:var(--k-steel-2)" stroke-width="4.5" stroke-linecap="round"/>
<line class="" x1="195.7" y1="136" x2="211.4" y2="64" style="stroke:var(--k-line)" stroke-width="7.5" stroke-linecap="round"/>
<line class="" x1="195.7" y1="136" x2="211.4" y2="64" style="stroke:var(--k-steel-2)" stroke-width="4.5" stroke-linecap="round"/>
<line class="" x1="227.1" y1="136" x2="242.9" y2="64" style="stroke:var(--k-line)" stroke-width="7.5" stroke-linecap="round"/>
<line class="" x1="227.1" y1="136" x2="242.9" y2="64" style="stroke:var(--k-steel-2)" stroke-width="4.5" stroke-linecap="round"/>
<line class="" x1="258.6" y1="136" x2="274.3" y2="64" style="stroke:var(--k-line)" stroke-width="7.5" stroke-linecap="round"/>
<line class="" x1="258.6" y1="136" x2="274.3" y2="64" style="stroke:var(--k-steel-2)" stroke-width="4.5" stroke-linecap="round"/>
<rect class="k-part" x="56" y="56" width="8" height="88" rx="2"/>
<rect class="k-part" x="296" y="56" width="8" height="88" rx="2"/>
<line class="k-force" x1="20" y1="100" x2="54" y2="100"/>
<line class="k-force" x1="340" y1="100" x2="306" y2="100"/>
<text class="mark-t" x="22" y="92" style="fill:var(--tb-bad)">P</text>
<text class="mark-t" x="314" y="90" style="fill:var(--tb-bad)">P</text>
<line class="k-center" x1="60" y1="100" x2="300" y2="100"/>
<line class="k-ext" x1="64" y1="150" x2="64" y2="182"/>
<line class="k-ext" x1="296" y1="150" x2="296" y2="182"/>
<line class="k-dimline" x1="64" y1="176" x2="296" y2="176"/>
<text class="k-dimtext" x="180" y="171" text-anchor="middle">自由長さ</text>
<line class="k-ext" x1="306" y1="64" x2="350" y2="64"/>
<line class="k-ext" x1="306" y1="136" x2="350" y2="136"/>
<line class="k-dimline" x1="344" y1="64" x2="344" y2="136"/>
<text class="k-dimtext" x="350" y="104">D</text>
<text class="k-dimtext" x="118" y="40">線径 d</text>
<line class="k-thin" x1="140" y1="44" x2="157" y2="62" style="stroke:var(--k-dim)"/>
<rect class="k-panel" x="366" y="30" width="146" height="112" rx="8"/>
<text class="mark-t" x="374" y="54">k = G d⁴ / (8 D³ n)</text>
<text class="lbl" x="374" y="78">ばね指数 c = D / d</text>
<text class="k-note" x="374" y="96">→ 4〜10 が作りやすい</text>
<text class="lbl" x="374" y="118">自由長さ > 外径 × 4</text>
<text class="k-note" x="374" y="134">→ 座屈しやすい</text>
<text class="k-note" x="180" y="206" text-anchor="middle">D: コイル平均径、n: 有効巻数 (両端の座巻を除く)</text>
</svg>
<p class="tb-caption">図: 圧縮コイルばね。線径の 4 乗に比例して硬く、平均径の 3 乗に反比例して柔らかくなる</p>
<ul>
  <li><b>線径の 4 乗</b>に比例して硬くなる (線径 1.2 倍 → 約 2 倍)</li>
  <li>巻数を増やすと柔らかくなり、たわみの余裕が増える</li>
  <li><b>ばね指数 c = D/d</b> は 4〜10 が作りやすい。小さいと巻きにくく、大きいと形が不安定</li>
  <li>自由長さが外径の 4 倍を超えると<b>座屈</b>しやすい → ガイド棒・ガイド穴を付ける</li>
</ul>
<div data-widget="spring"></div>
<h2>ばねの種類</h2>
<ul>
  <li><b>引張ばね</b>: 両端のフックで引く。フックの根元が折れやすい</li>
  <li><b>ねじりばね</b>: 腕を回す (洗濯ばさみ、ふたのヒンジ)</li>
  <li><b>板ばね・薄板ばね</b>: 樹脂のスナップフィットや接点</li>
  <li><b>皿ばね</b>: 小さなたわみで大きな力 (ボルトの緩み止め、予圧)</li>
  <li><b>ガススプリング</b>: ふたや扉を支える (ほぼ一定の力)</li>
</ul>
<div class="tb-tip"><b>設計のコツ</b>: ばねはまず市販品カタログから選びましょう。最大たわみで密着しないこと、使用範囲がばねのたわみの 20〜80 % に入ることを確認します。</div>`,
    points: ["P = k·δ、直列で柔らかく・並列で硬く", "k = Gd⁴ / 8D³n — 線径の 4 乗が効く", "ばね指数 4〜10、長いばねは座屈に注意", "まず市販品から選び、密着しない範囲で使う"],
    exercises: [
      {
        q: "線径 2 mm、コイル平均径 16 mm、有効巻数 8、ピアノ線 (G = 78.5 GPa) のばねを 10 mm 縮めます。ばね定数、荷重、ねじり応力 (κ = 1.18) を求めてください。",
        a: "k = 78 500 × 2⁴ / (8 × 16³ × 8) ≈ <b>4.79 N/mm</b>。P = 4.79 × 10 ≈ <b>47.9 N</b>。τ = 1.18 × 8 × 47.9 × 16 / (π × 2³) ≈ <b>289 MPa</b>。",
      },
    ],
    quiz: [
      { q: "同じばねを 2 本並列にすると、ばね定数は?", choices: ["1/2", "同じ", "2 倍"], answer: 2, explain: "並列では k = k₁ + k₂ なので 2 倍になります。" },
      { q: "コイルばねの線径を 2 倍にすると、ばね定数は (他は同じ)?", choices: ["2 倍", "8 倍", "16 倍"], answer: 2, explain: "k は d⁴ に比例するので 16 倍です。" },
    ],
  },
  {
    id: "keys",
    part: "elements",
    title: "キー・ピン・止め輪・軸継手",
    minutes: 15,
    level: 2,
    lead: "歯車やプーリーを軸に固定してトルクを伝える、部品を位置決めする、抜け止めする — 小さな部品ですが、選び方を誤ると大きなトラブルになります。",
    body: `
<h2>平行キー</h2>
<p>軸とボスの両方にキー溝を彫り、キーを入れてトルクを伝えます。キーの寸法 b × h は<b>軸径から決まります</b> (JIS B 1301)。</p>
<div class="tb-formula">接線力 F = 2T / d　　せん断応力 τ = F / (b·l)　　面圧 p = F / ((h − t₁)·l)</div>
<p>多くの場合、せん断より<b>側面の面圧</b>で長さが決まります。必要なら長さを伸ばすか、キーを 2 本 (180° 対向) にします。</p>
<svg class="tb-chart" viewBox="0 0 520 230" role="img" aria-label="平行キーの断面">
<rect class="k-panel" x="8" y="8" width="244" height="214" rx="8"/>
<text class="k-title" x="130" y="30" text-anchor="middle">軸とボスの断面</text>
<g class="k-shadow"><path class="k-cut2" d="M130,38 A82,82 0 1 1 129.9,38 Z M130,72 A48,48 0 1 0 130.1,72 Z" fill-rule="evenodd"/><circle class="k-cut" cx="130" cy="120" r="48"/><rect class="k-part" x="118" y="62" width="24" height="22" rx="1"/></g>
<line class="" x1="118" y1="72" x2="142" y2="72" style="stroke:var(--tb-bad);stroke-dasharray:3 2" stroke-width="2"/>
<path class="k-move" d="M100,138 A32,32 0 0 0 158,140" stroke-width="2.4"/>
<text class="mark-t" x="130" y="164" text-anchor="middle" style="fill:var(--tb-accent)">T</text>
<text class="k-note" x="130" y="214" text-anchor="middle">F = 2T / d (キー側面に加わる力)</text>
<rect class="k-panel" x="268" y="8" width="244" height="214" rx="8"/>
<text class="k-title" x="390" y="30" text-anchor="middle">キー部の拡大</text>
<rect class="k-cut2" x="290" y="92" width="180" height="48"/>
<rect class="k-cut" x="290" y="140" width="180" height="52"/>
<g class="k-shadow"><rect class="k-part" x="349" y="98" width="72" height="72" rx="2"/></g>
<line class="" x1="349" y1="140" x2="421" y2="140" style="stroke:var(--tb-bad);stroke-dasharray:4 3" stroke-width="2"/>
<line class="" x1="434" y1="108" x2="423" y2="108" style="stroke:var(--tb-bad);marker-end:url(#k-arrow-red)" stroke-width="1.6"/><line class="" x1="434" y1="122" x2="423" y2="122" style="stroke:var(--tb-bad);marker-end:url(#k-arrow-red)" stroke-width="1.6"/><line class="" x1="434" y1="134" x2="423" y2="134" style="stroke:var(--tb-bad);marker-end:url(#k-arrow-red)" stroke-width="1.6"/>
<line class="" x1="336" y1="148" x2="347" y2="148" style="stroke:var(--tb-bad);marker-end:url(#k-arrow-red)" stroke-width="1.6"/><line class="" x1="336" y1="162" x2="347" y2="162" style="stroke:var(--tb-bad);marker-end:url(#k-arrow-red)" stroke-width="1.6"/>
<line class="k-ext" x1="349" y1="96" x2="349" y2="72"/>
<line class="k-ext" x1="421" y1="96" x2="421" y2="72"/>
<line class="k-dimline" x1="349" y1="78" x2="421" y2="78"/>
<text class="k-dimtext" x="385" y="72" text-anchor="middle">b</text>
<line class="k-ext" x1="423" y1="98" x2="490" y2="98"/>
<line class="k-ext" x1="423" y1="170" x2="490" y2="170"/>
<line class="k-dimline" x1="484" y1="98" x2="484" y2="170"/>
<text class="k-dimtext" x="490" y="128">h</text>
<line class="k-ext" x1="472" y1="140" x2="506" y2="140"/>
<line class="k-dimline" x1="500" y1="140" x2="500" y2="170"/>
<text class="k-dimtext" x="494" y="186">t₁</text>
<text class="k-note" x="300" y="108">ボス</text>
<text class="k-note" x="300" y="186">軸</text>
<text class="k-note" x="385" y="208" text-anchor="middle">せん断面 (破線) と側面の面圧</text>
</svg>
<p class="tb-caption">図: 平行キーの断面。せん断は破線の面 b × l で、面圧はボス側の接触高さ (h − t₁) × l で受ける</p>
<div data-widget="key"></div>
<h2>その他の締結・位置決め要素</h2>
<table class="tb-table">
  <tr><th>部品</th><th>用途・特徴</th></tr>
  <tr><td>平行ピン (リーマ穴)</td><td>2 部品の<b>位置決め</b>。2 本使い、1 本は長穴にすると組みやすい</td></tr>
  <tr><td>スプリングピン</td><td>下穴に打ち込むだけで固定。精度は低いが安い</td></tr>
  <tr><td>止めねじ (イモねじ)</td><td>軸にボスを固定。軽負荷向け。軸に D カット (平面) を付けると滑りにくい</td></tr>
  <tr><td>止め輪 (C 形・E 形)</td><td>軸・穴の溝にはめて<b>軸方向の抜け止め</b>。E 形は横から入る</td></tr>
  <tr><td>スプライン</td><td>大きなトルク、ボスが軸方向に滑る (変速機)</td></tr>
  <tr><td>摩擦締結具 (パワーロック)</td><td>キー溝なしで締結。位相を自由に調整でき、ガタがない</td></tr>
</table>
<h2>軸継手 (カップリング)</h2>
<p>モーター軸と機械の軸をつなぎます。2 本の軸の<b>芯ずれ</b> (平行・角度・軸方向) は必ず生じるので、たわみ継手でずれを吸収します。</p>
<svg class="tb-chart" viewBox="0 0 520 156" role="img" aria-label="軸の芯ずれ 3 種類">
<rect class="k-panel" x="8.0" y="8" width="164" height="140" rx="8"/><text class="k-title" x="90" y="32" text-anchor="middle">平行</text><g class="k-shadow"><rect class="k-part" x="20" y="74" width="64" height="20" rx="3"/></g><g class="k-shadow"><rect class="k-part" x="96" y="88" width="64" height="20" rx="3"/></g><line class="k-center" x1="92" y1="98" x2="168" y2="98"/><line class="k-center" x1="16" y1="84" x2="92" y2="84"/><line class="k-dimline" x1="156" y1="84" x2="156" y2="98"/><text class="k-dimtext" x="136" y="126" text-anchor="middle">平行ずれ</text>
<rect class="k-panel" x="179.3" y="8" width="164" height="140" rx="8"/><text class="k-title" x="261.3" y="32" text-anchor="middle">角度</text><g class="k-shadow"><rect class="k-part" x="191.3" y="74" width="64" height="20" rx="3"/></g><g transform="rotate(-9 267.3 84)"><g class="k-shadow"><rect class="k-part" x="267.3" y="74" width="64" height="20" rx="3"/></g><line class="k-center" x1="267.3" y1="84" x2="341.3" y2="84"/></g><text class="k-dimtext" x="303.3" y="126" text-anchor="middle">角度ずれ</text><line class="k-center" x1="187.3" y1="84" x2="263.3" y2="84"/>
<rect class="k-panel" x="350.6" y="8" width="164" height="140" rx="8"/><text class="k-title" x="432.6" y="32" text-anchor="middle">軸方向</text><g class="k-shadow"><rect class="k-part" x="362.6" y="74" width="64" height="20" rx="3"/></g><g class="k-shadow"><rect class="k-part" x="448.6" y="74" width="54" height="20" rx="3"/></g><line class="k-dimline" x1="426.6" y1="108" x2="448.6" y2="108"/><line class="k-ext" x1="426.6" y1="96" x2="426.6" y2="112"/><line class="k-ext" x1="448.6" y1="96" x2="448.6" y2="112"/><text class="k-dimtext" x="437.6" y="126" text-anchor="middle">軸方向</text><line class="k-center" x1="358.6" y1="84" x2="434.6" y2="84"/>
</svg>
<p class="tb-caption">図: 2 本の軸の芯ずれ (誇張して描いた)。継手の種類ごとに許容できるずれの量が決まっている</p>
<ul>
  <li><b>リジッド</b>: ずれを許さない。芯出しが必要</li>
  <li><b>ジョー (ゴム爪)</b>: 安価で振動吸収。一般用</li>
  <li><b>ディスク・ベローズ</b>: ねじれ剛性が高くバックラッシがない — サーボモーター・位置決め用</li>
  <li><b>オルダム</b>: 平行ずれを大きく許容</li>
</ul>`,
    points: ["キーの断面は軸径で決まり、長さは面圧で決める", "位置決めはピン、抜け止めは止め輪", "軸継手で芯ずれを吸収 — サーボにはディスク・ベローズ", "大トルク・ガタなしなら摩擦締結具"],
    exercises: [
      {
        q: "φ20 の軸に 50 N·m のトルクを伝えます。平行キー (6 × 6、t₁ = 3.5) の長さを 25 mm とすると、せん断応力と面圧はいくらですか?",
        a: "F = 2 × 50 000 / 20 = 5 000 N。τ = 5 000 / (6 × 25) ≈ <b>33 MPa</b>。p = 5 000 / ((6 − 3.5) × 25) = <b>80 MPa</b>。面圧が許容値 (約 100 MPa) に近いので、ボスが鋳鉄なら長さを伸ばします。",
      },
    ],
    quiz: [
      { q: "2 つの部品を正確に位置決めするのに使うのは?", choices: ["ボルト (キリ穴)", "平行ピン (リーマ穴)", "止め輪"], answer: 1, explain: "ボルトのキリ穴にはすきまがあるため、位置決めはピンで行います。" },
      { q: "サーボモーターの位置決め軸に適した軸継手は?", choices: ["ジョー (ゴム爪)", "ディスク / ベローズ", "リジッド"], answer: 1, explain: "ねじれ剛性が高くバックラッシのないディスク・ベローズ形が適しています。" },
    ],
  },
  {
    id: "belts",
    part: "elements",
    title: "ベルト・チェーン・ねじ送り",
    minutes: 15,
    level: 2,
    lead: "離れた軸に回転を伝えるベルト・チェーンと、回転を直線運動に変えるねじ送り (ボールねじ) の選び方と計算を学びます。",
    body: `
<h2>巻き掛け伝動の比較</h2>
<table class="tb-table">
  <tr><th>種類</th><th>特徴</th><th>用途</th></tr>
  <tr><td>V ベルト</td><td>安価・静か・衝撃吸収。わずかに滑る</td><td>ポンプ・ファン・一般機械</td></tr>
  <tr><td>タイミングベルト (歯付き)</td><td>滑らず同期。軽く静か</td><td>位置決め・プリンタ・3D プリンタ・エンジン</td></tr>
  <tr><td>ローラーチェーン</td><td>大きな力・高温に強い。潤滑が必要、騒音</td><td>自転車・コンベヤ・低速大トルク</td></tr>
</table>
<h2>ベルトの長さと巻き掛け角</h2>
<div class="tb-formula">L = 2C + π(D₁ + D₂)/2 + (D₂ − D₁)² / (4C)　　巻き掛け角 θ = 180° − 2 sin⁻¹((D₂ − D₁) / 2C)</div>
<p>小さいプーリの<b>巻き掛け角</b>が小さいと滑りやすくなります (120° 以上、できれば 150° 以上)。軸間距離は小さいプーリ径の数倍程度に。
ベルトの張りを調整できるよう、<b>モーター台を長穴でスライド</b>させるかテンショナを設けます。</p>
<svg class="tb-chart" viewBox="0 0 520 236" role="img" aria-label="ベルト伝動の各部">
<g class="k-shadow"><circle class="k-alu" cx="130" cy="112" r="37"/><circle class="k-alu" cx="370" cy="112" r="69"/></g>
<circle class="k-part" cx="130" cy="112" r="10"/>
<circle class="k-part" cx="370" cy="112" r="14"/>
<circle class="k-thin" cx="130" cy="112" r="28"/>
<circle class="k-thin" cx="370" cy="112" r="58"/>
<path d="M124.7,72.4 L360.4,40.6 A72,72 0 1 1 360.4,183.4 L124.7,151.6 A40,40 0 0 1 124.7,72.4 Z" style="fill:none;stroke:var(--k-line)" stroke-width="6"/>
<path class="k-dimline" d="M122.8,58.5 A54,54 0 0 0 122.8,165.5"/>
<text class="k-dimtext" x="62" y="116" text-anchor="end">θ</text>
<text class="k-note" x="14" y="152">巻き掛け角</text>
<path class="k-move" d="M116,88 A28,28 0 0 1 154,98"/>
<text class="k-note" x="262" y="94" text-anchor="middle">緩み側</text>
<text class="k-bad-t" x="262" y="150" text-anchor="middle">張り側</text>
<line class="k-center" x1="130" y1="64" x2="130" y2="160"/>
<line class="k-center" x1="370" y1="32" x2="370" y2="192"/>
<text class="lbl" x="60" y="52">D₁ (駆動)</text>
<text class="lbl" x="400" y="30">D₂</text>
<line class="k-ext" x1="130" y1="196" x2="130" y2="214"/>
<line class="k-ext" x1="370" y1="196" x2="370" y2="214"/>
<line class="k-dimline" x1="130" y1="208" x2="370" y2="208"/>
<text class="k-dimtext" x="250" y="203" text-anchor="middle">軸間距離 C</text>
<rect class="" x="76" y="180" width="108" height="12" rx="6" style="fill:none;stroke:var(--k-line-2);stroke-width:1.4"/>
<line class="k-move" x1="150" y1="186" x2="108" y2="186" style="marker-start:url(#k-arrow-blue)"/>
<text class="k-note" x="14" y="228">モーター台の長穴で張りを調整</text>
<text class="k-dimtext" x="400" y="228">θ ≈ 165° (この例)</text>
</svg>
<p class="tb-caption">図: ベルト伝動。小プーリの巻き掛け角 θ が小さいと滑りやすい。駆動プーリに引き込まれる側が張り側</p>
<div data-widget="belt"></div>
<h2>ねじ送り — 回転を直線に</h2>
<div class="tb-formula">送り速度 v = リード × 回転数　　推力 F = 2π η T / リード</div>
<ul>
  <li><b>台形ねじ</b>: 安価。効率 30〜50 % で、止めると逆に回りにくい (保持に便利)</li>
  <li><b>ボールねじ</b>: 効率 90 % 以上で精密・高速。逆に回されやすいので、上下軸ではブレーキが必要</li>
  <li>長いねじ軸は<b>危険速度</b>(共振) と<b>座屈</b>に注意 — 支持方法とねじ径で確認</li>
</ul>
<svg class="tb-chart" viewBox="0 0 520 210" role="img" aria-label="ボールねじによる送り">
<rect class="k-ground" x="10" y="160" width="500" height="10"/><line class="k-edge" x1="10" y1="160" x2="510" y2="160"/>
<g class="k-shadow"><rect class="k-part" x="110" y="120" width="28" height="40" rx="2"/><rect class="k-part" x="452" y="120" width="24" height="40" rx="2"/></g>
<g class="k-shadow"><rect class="k-part" x="20" y="82" width="64" height="50" rx="4"/></g>
<line class="k-thin" x1="28" y1="88" x2="76" y2="88"/><line class="k-thin" x1="28" y1="96" x2="76" y2="96"/><line class="k-thin" x1="28" y1="104" x2="76" y2="104"/><line class="k-thin" x1="28" y1="112" x2="76" y2="112"/><line class="k-thin" x1="28" y1="120" x2="76" y2="120"/><line class="k-thin" x1="28" y1="128" x2="76" y2="128"/>
<rect class="k-accent" x="84" y="98" width="22" height="18" rx="3"/>
<g class="k-shadow"><rect class="k-part-h" x="104" y="99" width="380" height="14" rx="3"/></g>
<line class="k-thin" x1="118" y1="112" x2="124" y2="100"/><line class="k-thin" x1="130" y1="112" x2="136" y2="100"/><line class="k-thin" x1="142" y1="112" x2="148" y2="100"/><line class="k-thin" x1="154" y1="112" x2="160" y2="100"/><line class="k-thin" x1="166" y1="112" x2="172" y2="100"/><line class="k-thin" x1="178" y1="112" x2="184" y2="100"/><line class="k-thin" x1="190" y1="112" x2="196" y2="100"/><line class="k-thin" x1="202" y1="112" x2="208" y2="100"/><line class="k-thin" x1="214" y1="112" x2="220" y2="100"/><line class="k-thin" x1="226" y1="112" x2="232" y2="100"/><line class="k-thin" x1="238" y1="112" x2="244" y2="100"/><line class="k-thin" x1="250" y1="112" x2="256" y2="100"/><line class="k-thin" x1="262" y1="112" x2="268" y2="100"/><line class="k-thin" x1="274" y1="112" x2="280" y2="100"/><line class="k-thin" x1="286" y1="112" x2="292" y2="100"/><line class="k-thin" x1="298" y1="112" x2="304" y2="100"/><line class="k-thin" x1="310" y1="112" x2="316" y2="100"/><line class="k-thin" x1="322" y1="112" x2="328" y2="100"/><line class="k-thin" x1="334" y1="112" x2="340" y2="100"/><line class="k-thin" x1="346" y1="112" x2="352" y2="100"/><line class="k-thin" x1="358" y1="112" x2="364" y2="100"/><line class="k-thin" x1="370" y1="112" x2="376" y2="100"/><line class="k-thin" x1="382" y1="112" x2="388" y2="100"/><line class="k-thin" x1="394" y1="112" x2="400" y2="100"/><line class="k-thin" x1="406" y1="112" x2="412" y2="100"/><line class="k-thin" x1="418" y1="112" x2="424" y2="100"/><line class="k-thin" x1="430" y1="112" x2="436" y2="100"/><line class="k-thin" x1="442" y1="112" x2="448" y2="100"/><line class="k-thin" x1="454" y1="112" x2="460" y2="100"/><line class="k-thin" x1="466" y1="112" x2="472" y2="100"/>
<g class="k-shadow"><rect class="k-part" x="240" y="84" width="56" height="44" rx="4"/><rect class="k-alu" x="204" y="56" width="128" height="28" rx="3"/></g>
<line class="k-move" x1="236" y1="44" x2="300" y2="44"/>
<text class="mark-t" x="306" y="48">v = リード × 回転数</text>
<line class="k-ext" x1="358" y1="96" x2="358" y2="84"/>
<line class="k-ext" x1="370" y1="96" x2="370" y2="84"/>
<line class="k-dimline" x1="358" y1="88" x2="370" y2="88" style="marker-start:none"/>
<text class="k-dimtext" x="376" y="84">リード</text>
<text class="lbl" x="52" y="74" text-anchor="middle">モーター</text>
<text class="k-note" x="95" y="140" text-anchor="middle">継手</text>
<text class="k-note" x="124" y="180" text-anchor="middle">固定側</text>
<text class="k-note" x="464" y="180" text-anchor="middle">支持側</text>
<text class="k-note" x="268" y="146" text-anchor="middle">ナット</text>
<text class="lbl" x="268" y="74" text-anchor="middle">テーブル</text>
<text class="lbl" x="300" y="200" text-anchor="middle">推力 F = 2π η T / リード</text>
</svg>
<p class="tb-caption">図: ボールねじ送り。モーターの回転をナットの直線運動に変える。1 回転でリード分だけ進む</p>`,
    points: ["V ベルト (安価・滑る)、タイミングベルト (同期)、チェーン (大トルク)", "ベルト長さの式と巻き掛け角 120° 以上", "張り調整の機構を必ず設ける", "ボールねじは高効率だが逆転しやすい — 縦軸はブレーキ"],
    exercises: [
      {
        q: "プーリ径 100 mm と 250 mm、軸間距離 400 mm のベルト伝動で、ベルト長さと小プーリの巻き掛け角を求めてください。",
        a: "L = 800 + π × 350 / 2 + 150² / 1600 ≈ 800 + 549.8 + 14.1 ≈ <b>1 364 mm</b>。θ = 180 − 2 sin⁻¹(150 / 800) ≈ 180 − 21.6 ≈ <b>158°</b>。",
      },
      {
        q: "リード 10 mm のボールねじを 3000 min⁻¹ で回すと、テーブルの送り速度は?",
        a: "10 mm × 3000 / 60 s = <b>500 mm/s</b> (30 m/min)。",
      },
    ],
    quiz: [
      { q: "位置決めのために、滑らずに同期して回転を伝えたい。適しているのは?", choices: ["V ベルト", "タイミングベルト", "平ベルト"], answer: 1, explain: "歯付きのタイミングベルトは滑らないので、位置決めに使えます。" },
      { q: "縦に置いたボールねじで注意すべきことは?", choices: ["電源を切るとテーブルが落ちることがある", "回転が遅くなる", "効率が低い"], answer: 0, explain: "ボールねじは効率が高く逆転しやすいため、ブレーキ付きモーターなどで保持します。" },
    ],
  },
  {
    id: "mechanisms",
    part: "elements",
    title: "機構 — リンクとカム",
    minutes: 20,
    level: 3,
    lead: "モーターの一方向の回転を、往復・揺動・間欠など必要な動きに変えるのが機構です。リンク機構の自由度とグラスホフの条件、カムの使いどころを学びます。",
    body: `
<h2>機構の自由度</h2>
<div class="tb-formula">F = 3 (n − 1) − 2 j₁ − j₂　　(平面機構のグリューブラーの式)</div>
<p>n: リンクの数 (固定リンクを含む)、j₁: 1 自由度の対偶 (ピン・すべり)、j₂: 2 自由度の対偶 (カムと接触点など)。
F = 1 なら入力 1 つで動きが決まる<b>限定連鎖</b>、F = 0 なら動かない構造です。</p>
<h2>四節リンク機構</h2>
<p>4 本のリンクを 4 つのピンでつないだ最も基本の機構です (F = 3 × 3 − 2 × 4 = 1)。
最短リンク s と最長リンク l について <b>s + l ≤ p + q</b> (残り 2 本) を満たすとき、どれかのリンクが 1 回転できます (<b>グラスホフの条件</b>)。</p>
<ul>
  <li>最短リンクを入力 (クランク) にすると <b>てこクランク機構</b> — 回転を揺動に変える (ワイパー、足踏みミシン)</li>
  <li>最短リンクを固定すると <b>両クランク機構</b></li>
  <li>4 本のうち 1 本をすべり子に替えると <b>スライダクランク機構</b> — エンジン、往復ポンプ</li>
</ul>
<svg class="tb-chart" viewBox="0 0 520 252" role="img" aria-label="てこクランク機構">
<circle class="k-hidden" cx="150" cy="176" r="66.7"/>
<path d="M405.6,18.9 A166.7,166.7 0 0 0 250.0,42.7" style="fill:none;stroke:var(--tb-accent);stroke-dasharray:6 4;marker-start:url(#k-arrow-blue);marker-end:url(#k-arrow-blue)" stroke-width="1.8"/>
<line class="" x1="150" y1="176" x2="350" y2="176" style="stroke:var(--k-line-2);stroke-dasharray:8 4" stroke-width="2"/>
<path class="k-part" d="M150,176 L140,191 L160,191 Z"/><circle class="k-edge" cx="150" cy="176" r="2.6" style="fill:var(--tb-surface)"/><rect class="k-ground" x="134" y="191" width="32" height="7"/><line class="k-edge" x1="134" y1="191" x2="166" y2="191"/>
<path class="k-part" d="M350,176 L340,191 L360,191 Z"/><circle class="k-edge" cx="350" cy="176" r="2.6" style="fill:var(--tb-surface)"/><rect class="k-ground" x="334" y="191" width="32" height="7"/><line class="k-edge" x1="334" y1="191" x2="366" y2="191"/>
<g class="k-shadow"><line class="" x1="150" y1="176" x2="172.8" y2="113.4" style="stroke:var(--k-line)" stroke-width="15" stroke-linecap="round"/><line class="" x1="150" y1="176" x2="172.8" y2="113.4" style="stroke:var(--k-accent-1)" stroke-width="12" stroke-linecap="round"/><line class="" x1="172.8" y1="113.4" x2="383.3" y2="12.7" style="stroke:var(--k-line)" stroke-width="16" stroke-linecap="round"/><line class="" x1="172.8" y1="113.4" x2="383.3" y2="12.7" style="stroke:var(--k-alu-2)" stroke-width="13" stroke-linecap="round"/><line class="" x1="350" y1="176" x2="383.3" y2="12.7" style="stroke:var(--k-line)" stroke-width="16" stroke-linecap="round"/><line class="" x1="350" y1="176" x2="383.3" y2="12.7" style="stroke:var(--k-alu-2)" stroke-width="13" stroke-linecap="round"/></g>
<circle class="k-sphere" cx="150" cy="176" r="5"/>
<circle class="k-sphere" cx="172.8" cy="113.4" r="5"/>
<circle class="k-sphere" cx="383.3" cy="12.7" r="5"/>
<circle class="k-sphere" cx="350" cy="176" r="5"/>
<text class="lbl" x="16" y="100" style="fill:var(--tb-accent)">a: クランク</text>
<text class="k-note" x="16" y="116">(最短・入力、1 回転)</text>
<text class="lbl" x="292.1" y="91" text-anchor="middle">b: 連結棒</text>
<text class="lbl" x="400" y="104.3">c: てこ (揺動)</text>
<text class="lbl" x="270" y="210" text-anchor="middle">d: 固定リンク</text>
<rect class="k-panel" x="370" y="150" width="142" height="58" rx="8"/>
<text class="k-title" x="380" y="172">グラスホフの条件</text>
<text class="mark-t" x="380" y="194">s + l ≤ p + q</text>
</svg>
<p class="tb-caption">図: てこクランク機構 (a = 20, b = 70, c = 50, d = 60 の比で作図)。最短リンク a が 1 回転すると、てこ c が破線の範囲で揺動する</p>
<div data-widget="linkage"></div>
<h2>カム機構</h2>
<p>カムの輪郭の形で、従動節に<b>自由な動き</b> (上昇・停留・下降の時間配分) を与えられます。自動機の間欠動作に多く使われます。</p>
<ul>
  <li>変位曲線は、速度・加速度が急変しない曲線 (変形正弦など) を選ぶ — 急変すると衝撃・騒音</li>
  <li>圧力角 (カムが従動節を押す角度) は 30° 程度以下に</li>
  <li>従動節をばねでカムに押し付け、離れないようにする (高速では溝カム)</li>
</ul>
<svg class="tb-chart" viewBox="0 0 520 240" role="img" aria-label="カムと変位線図">
<g class="k-shadow"><path class="k-alu" d="M110,119 L111.9,118 L113.8,117.1 L115.9,116.3 L117.9,115.6 L120.1,115 L122.2,114.5 L124.4,114.1 L126.7,113.8 L129,113.6 L131.3,113.6 L133.5,113.7 L135.8,114 L138.1,114.3 L140.4,114.8 L142.6,115.5 L144.8,116.2 L147,117.1 L149.1,118.2 L151.2,119.3 L153.2,120.6 L155.1,121.9 L156.9,123.4 L158.7,125 L160.4,126.6 L162,128.4 L163.5,130.2 L165,132 L166.4,134 L167.7,136 L168.9,138 L170,140.1 L171.1,142.2 L172.1,144.3 L173,146.5 L173.9,148.7 L174.7,151 L175.4,153.3 L176,155.5 L176.5,157.9 L177,160.2 L177.3,162.5 L177.6,164.9 L177.8,167.3 L178,169.6 L178,172 L178,174.4 L177.8,176.7 L177.6,179.1 L177.3,181.5 L177,183.8 L176.5,186.1 L176,188.5 L175.4,190.7 L174.7,193 L173.9,195.3 L173,197.5 L172.1,199.7 L171.1,201.8 L170,203.9 L168.9,206 L167.7,208 L166.4,210 L165,212 L163.5,213.8 L162,215.6 L160.4,217.4 L158.7,219 L156.9,220.6 L155.1,222.1 L153.2,223.4 L151.2,224.7 L149.1,225.8 L147,226.9 L144.8,227.8 L142.6,228.5 L140.4,229.2 L138.1,229.7 L135.8,230 L133.5,230.3 L131.3,230.4 L129,230.4 L126.7,230.2 L124.4,229.9 L122.2,229.5 L120.1,229 L117.9,228.4 L115.9,227.7 L113.8,226.9 L111.9,226 L110,225 L108.2,224 L106.4,222.9 L104.8,221.8 L103.2,220.6 L101.6,219.4 L100.2,218.2 L98.8,216.9 L97.5,215.7 L96.2,214.5 L95,213.2 L93.8,212 L92.7,210.8 L91.7,209.6 L90.6,208.4 L89.6,207.3 L88.7,206.1 L87.7,205 L86.8,203.9 L85.9,202.8 L85,201.8 L84.1,200.7 L83.3,199.7 L82.4,198.6 L81.6,197.6 L80.8,196.5 L80,195.4 L79.2,194.4 L78.5,193.3 L77.8,192.1 L77.1,191 L76.4,189.8 L75.8,188.7 L75.3,187.5 L74.8,186.2 L74.3,185 L73.9,183.7 L73.5,182.5 L73.1,181.2 L72.8,179.9 L72.6,178.6 L72.4,177.3 L72.2,176 L72.1,174.7 L72,173.3 L72,172 L72,170.7 L72.1,169.3 L72.2,168 L72.4,166.7 L72.6,165.4 L72.8,164.1 L73.1,162.8 L73.5,161.5 L73.9,160.3 L74.3,159 L74.8,157.8 L75.3,156.5 L75.8,155.3 L76.4,154.2 L77.1,153 L77.8,151.9 L78.5,150.7 L79.2,149.6 L80,148.6 L80.8,147.5 L81.6,146.4 L82.4,145.4 L83.3,144.3 L84.1,143.3 L85,142.2 L85.9,141.2 L86.8,140.1 L87.7,139 L88.7,137.9 L89.6,136.7 L90.6,135.6 L91.7,134.4 L92.7,133.2 L93.8,132 L95,130.8 L96.2,129.5 L97.5,128.3 L98.8,127.1 L100.2,125.8 L101.6,124.6 L103.2,123.4 L104.8,122.2 L106.4,121.1 L108.2,120 Z"/></g>
<circle class="k-part" cx="110" cy="172" r="6"/>
<circle class="" cx="110" cy="172" r="2" style="fill:var(--k-line)"/>
<path class="k-move" d="M90,222 A54,54 0 0 0 154,202"/>
<text class="mark-t" x="162" y="218" style="fill:var(--tb-accent)">ω</text>
<g class="k-shadow"><rect class="k-part-h" x="105" y="12" width="10" height="98" rx="2"/><circle class="k-sphere" cx="110" cy="110" r="9"/></g>
<rect class="k-cut" x="90" y="22" width="12" height="22"/>
<rect class="k-cut" x="118" y="22" width="12" height="22"/>
<path class="k-edge" d="M110,46 L110,48 L98,50.9 L122,56.6 L98,62.4 L122,68.1 L98,73.9 L122,79.6 L98,85.4 L122,91.1 L110,94 L110,96" style="stroke:var(--tb-accent)"/>
<rect class="k-part" x="96" y="94" width="28" height="4" rx="1"/>
<text class="k-note" x="134" y="38">ガイド</text>
<text class="k-note" x="134" y="72" style="fill:var(--tb-accent)">ばね</text>
<text class="k-note" x="94" y="114" text-anchor="end">従動節</text>
<text class="lbl" x="50" y="176" text-anchor="end">カム</text>
<line class="axis" x1="270" y1="182" x2="505" y2="182"/>
<line class="axis" x1="270" y1="186" x2="270" y2="90"/>
<path d="M270,182 L272.6,182 L275.1,181.9 L277.7,181.5 L280.2,180.9 L282.8,179.8 L285.3,178.3 L287.9,176.3 L290.4,173.8 L293,170.7 L295.6,167.1 L298.1,163.1 L300.7,158.7 L303.2,154 L305.8,149 L308.3,144 L310.9,139 L313.4,134 L316,129.3 L318.6,124.9 L321.1,120.9 L323.7,117.3 L326.2,114.2 L328.8,111.7 L331.3,109.7 L333.9,108.2 L336.4,107.1 L339,106.5 L341.6,106.1 L344.1,106 L346.7,106 L349.2,106 L351.8,106 L354.3,106 L356.9,106 L359.4,106 L362,106 L364.6,106 L367.1,106 L369.7,106 L372.2,106 L374.8,106 L377.3,106 L379.9,106 L382.4,106 L385,106 L387.6,106 L390.1,106.1 L392.7,106.5 L395.2,107.1 L397.8,108.2 L400.3,109.7 L402.9,111.7 L405.4,114.2 L408,117.3 L410.6,120.9 L413.1,124.9 L415.7,129.3 L418.2,134 L420.8,139 L423.3,144 L425.9,149 L428.4,154 L431,158.7 L433.6,163.1 L436.1,167.1 L438.7,170.7 L441.2,173.8 L443.8,176.3 L446.3,178.3 L448.9,179.8 L451.4,180.9 L454,181.5 L456.6,181.9 L459.1,182 L461.7,182 L464.2,182 L466.8,182 L469.3,182 L471.9,182 L474.4,182 L477,182 L479.6,182 L482.1,182 L484.7,182 L487.2,182 L489.8,182 L492.3,182 L494.9,182 L497.4,182 L500,182" style="fill:none;stroke:var(--tb-accent)" stroke-width="2.6"/>
<line class="guide" x1="346.7" y1="106" x2="346.7" y2="186"/>
<line class="guide" x1="385" y1="106" x2="385" y2="186"/>
<line class="guide" x1="461.7" y1="106" x2="461.7" y2="186"/>
<text class="tick" x="308" y="176" text-anchor="middle">上昇</text>
<text class="tick" x="374" y="100" text-anchor="middle">停留</text>
<text class="tick" x="423" y="176" text-anchor="middle">下降</text>
<text class="tick" x="483" y="176" text-anchor="middle">停留</text>
<text class="lbl" x="505" y="200" text-anchor="end">カムの回転角 (1 回転)</text>
<text class="lbl" x="276" y="86">従動節の変位</text>
<text class="k-note" x="390" y="30" text-anchor="middle">速度・加速度が急変しない</text>
<text class="k-note" x="390" y="46" text-anchor="middle">なめらかな曲線を選ぶ</text>
</svg>
<p class="tb-caption">図: 板カムとローラ従動節。カムの輪郭で、上昇・停留・下降の時間配分 (右の変位線図) を自由に決められる</p>
<div class="tb-tip"><b>3DCAD Studio</b>: アセンブリでリンクをピン (挿入・軸合わせ拘束) でつなぎ、「拘束を駆動」で角度を変えると機構の動きと干渉を確認できます。「モーション解析」で変位・速度・加速度のグラフも出せます。</div>`,
    points: ["自由度 F = 3(n−1) − 2j₁ − j₂、F = 1 で入力 1 つで動きが決まる", "グラスホフ: 最短 + 最長 ≤ 他の 2 本 で 1 回転できるリンクがある", "てこクランク (回転 → 揺動)、スライダクランク (回転 ↔ 往復)", "カムは自由な動きを作れる — 加速度の急変を避ける"],
    exercises: [
      {
        q: "スライダクランク機構 (固定リンク・クランク・連結棒・スライダの 4 リンク、ピン 3 つとすべり 1 つ) の自由度を求めてください。",
        a: "F = 3 × (4 − 1) − 2 × 4 = <b>1</b>。クランクの角度を決めればスライダの位置が決まります。",
      },
      {
        q: "リンク長さ a = 20 (入力)、b = 70、c = 50、d = 60 (固定) の四節リンクはどんな機構ですか?",
        a: "最短 20 + 最長 70 = 90 ≤ 50 + 60 = 110 でグラスホフの条件を満たし、最短リンクが入力なので<b>てこクランク機構</b>です (入力が 1 回転し、出力が揺動)。",
      },
    ],
    quiz: [
      { q: "四節リンク機構の自由度は?", choices: ["0", "1", "2"], answer: 1, explain: "F = 3(4−1) − 2×4 = 1 です。" },
      { q: "回転運動を往復直線運動に変える代表的な機構は?", choices: ["スライダクランク機構", "両クランク機構", "歯車列"], answer: 0, explain: "エンジンのピストンとクランク軸の関係がスライダクランク機構です。" },
    ],
    lessons: ["5-1"],
  },
];
