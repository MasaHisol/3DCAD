import type { TextChapter } from "../types";

// Operator workability and UX of industrial equipment (装置使用者の作業性と UX).
// Goes deeper than the general ux chapters, with an equipment-design focus.

export const OPUX: TextChapter[] = [
  {
    id: "op-posture-zones",
    part: "ux",
    title: "【上級】装置の作業姿勢と作業域を設計する",
    minutes: 25,
    level: 3,
    lead: "装置の作業面の高さ、部品箱の位置、操作部の配置は、作業者が 1 日に何千回もとる姿勢を決めます。体格から作業高さを計算し、作業域をゾーンで割り付け、立位・座位を選び、RULA・OWAS で姿勢を点数化して改善する手順を、装置設計者の立場で学びます。",
    body: `
<h2>装置設計者が決めている「姿勢」</h2>
<p>作業者の姿勢は、本人の癖よりも<b>装置の寸法</b>で決まります。ワーク受けが低ければ前かがみに、部品箱が奥にあれば腕を伸ばし、操作盤が横にあれば体をねじります。
1 回の負担は小さくても、サイクルタイム 30 秒の装置なら 1 シフト約 900 回繰り返されます。設計段階で姿勢を決めておくことが、最も安く確実な対策です。</p>
<table class="tb-table">
  <tr><th>装置の寸法</th><th>決まる姿勢</th><th>悪いときの症状</th></tr>
  <tr><td>作業面・ワーク受けの高さ</td><td>体幹の前傾、肩の挙上</td><td>腰痛、肩こり</td></tr>
  <tr><td>部品・工具の位置 (奥行き・横)</td><td>腕の伸展、体幹のねじり</td><td>肩・肘の痛み、サイクルタイム増</td></tr>
  <tr><td>足元のすき間 (つま先・膝)</td><td>装置への近づきやすさ</td><td>前かがみ、腕の伸ばしすぎ</td></tr>
  <tr><td>視対象の高さ・角度</td><td>首の屈曲・伸展</td><td>首の痛み、見落とし</td></tr>
  <tr><td>操作具の位置と力</td><td>手首の曲げ、握り</td><td>腱鞘炎、手根管症候群</td></tr>
</table>

<h2>作業高さを体格から計算する</h2>
<p>立位の作業面高さは<b>肘高</b>を基準にし、作業の種類で上下させます。肘高は身長のおよそ 0.62 倍 (概略) です。</p>
<div class="tb-math">\\begin{aligned} &\\text{推奨作業面高さ} \\\\ &\\quad \\approx \\text{肘高} + \\text{作業による補正} \\end{aligned}</div>
<p>(肘高 ≈ 0.62 × 身長、靴の分 +20〜30 mm)</p>
<table class="tb-table">
  <tr><th>作業</th><th>肘高からの補正 (目安)</th><th>装置での例</th></tr>
  <tr><td>精密・目視検査</td><td>+50〜100 mm (肘を支える台を併用)</td><td>微小部品の組立、外観検査台</td></tr>
  <tr><td>軽作業</td><td>−100〜150 mm</td><td>ワークのセット、コネクタ挿入、梱包</td></tr>
  <tr><td>重作業 (下向きの力)</td><td>−150〜400 mm</td><td>圧入、重いワークの位置合わせ</td></tr>
</table>
<p><b>手の高さ</b>で考えるのがコツです。作業面ではなく、ワークの上面や治具のクランプ位置など「手が実際に動く高さ」を上の値に合わせます。高さ 150 mm の治具を載せるなら、台はその分低くします。</p>
<div data-widget="anim-workheight"></div>
<p>身長 1 450〜1 900 mm の作業者を 1 台でカバーするには、肘高の差だけで約 280 mm (0.62 × 450) あります。対策は次の順で検討します。</p>
<ol>
  <li><b>昇降機構</b>を付ける (電動・ガススプリング・ねじ式)。多品種や多人数シフトの装置で有効。</li>
  <li>高い側に合わせ、低い人は<b>足台</b> (滑り止め・段差の注意表示付き) を使う。足台は移動の妨げにならないこと。</li>
  <li>ワーク受けや治具だけを<b>傾ける・上下させる</b>。装置全体を動かすより安い。</li>
</ol>

<h2>作業域のゾーニング</h2>
<p>水平面の作業域は、肘を体に付けたまま前腕を回して届く<b>通常作業域</b> (肘から先、半径およそ 35〜45 cm) と、腕を伸ばして届く<b>最大作業域</b> (肩から、半径およそ 55〜65 cm) に分けて考えます (数値は小柄な作業者を基準にした概略)。</p>
<svg class="tb-chart" viewBox="0 0 520 272" role="img" aria-label="水平面の作業域">
<g class="k-shadow"><rect class="k-alu" x="14" y="14" width="492" height="216" rx="4"/></g>
<path d="M60,230 A200,200 0 0 1 460,230 Z" style="fill:var(--tb-accent);stroke:var(--k-line-2)" fill-opacity="0.07" stroke-dasharray="6 4"/>
<path d="M130,230 A130,130 0 0 1 390,230 Z" style="fill:var(--tb-accent);stroke:var(--tb-accent)" fill-opacity="0.12" stroke-width="2"/>
<path d="M200,230 A60,60 0 0 1 320,230 Z" style="fill:var(--tb-good);stroke:var(--tb-good)" fill-opacity="0.3" stroke-width="1.6"/>
<g class="k-shadow">
<rect class="k-part" x="236" y="172" width="48" height="16" rx="2"/>
<rect class="k-plastic" x="140" y="148" width="32" height="24" rx="2"/>
<path class="k-part" d="M342,158 L368,152 L370,158 L344,164 Z"/><rect class="k-plastic" x="336" y="154" width="12" height="16" rx="3"/>
</g>
<rect x="145" y="153" width="22" height="14" rx="1" style="fill:var(--k-plastic-2)" opacity="0.7"/>
<g class="k-shadow">
<path d="M238,246 L240,222 M282,246 L280,222" fill="none" style="stroke:var(--k-line)" stroke-width="10"/>
<path d="M238,246 L240,222 M282,246 L280,222" fill="none" style="stroke:var(--k-accent-2)" stroke-width="7.4"/>
<circle class="k-skin" cx="240" cy="218" r="5"/><circle class="k-skin" cx="280" cy="218" r="5"/>
<ellipse class="k-accent" cx="260" cy="252" rx="30" ry="11"/>
<circle class="k-skin" cx="260" cy="250" r="10"/>
</g>
<text class="tick" x="298" y="266">作業者</text>
<text class="mark-t" x="260" y="206" text-anchor="middle">ゾーン 1</text>
<text class="tick" x="260" y="128" text-anchor="middle">ゾーン 2 (通常作業域)</text>
<text class="tick" x="260" y="60" text-anchor="middle">ゾーン 3 (最大作業域)</text>
<text class="tick" x="136" y="166" text-anchor="end">部品箱</text><text class="tick" x="378" y="166">工具</text>
<text class="tick" x="500" y="32" text-anchor="end">ゾーン外: 歩く・体をねじる</text>
</svg>
<p class="tb-caption">図: 作業域のゾーン。ゾーン 1 (正面・手元) に主作業、ゾーン 2 に毎サイクル使う部品と工具、ゾーン 3 にはたまに使うものだけを置く。</p>
<table class="tb-table">
  <tr><th>ゾーン</th><th>置くもの</th><th>使用頻度の目安</th></tr>
  <tr><td>1 (正面・手元)</td><td>治具、ワークの作業位置</td><td>常時</td></tr>
  <tr><td>2 (通常作業域)</td><td>毎サイクル使う部品箱、ドライバ、起動ボタン</td><td>毎サイクル</td></tr>
  <tr><td>3 (最大作業域)</td><td>補充品、段取り工具、モード切替</td><td>1 時間に数回以下</td></tr>
  <tr><td>ゾーン外</td><td>予備品、書類</td><td>1 日に数回</td></tr>
</table>
<p>高さ方向も同様に、肩より上と膝より下は「たまに」だけにします。部品箱は<b>手前を低く傾けた棚</b>(フローラック) にすると、奥の部品まで手が届き、補充は裏側から行えます。</p>

<h2>立位か座位か</h2>
<table class="tb-table">
  <tr><th></th><th>座位が向く</th><th>立位が向く</th></tr>
  <tr><td>作業</td><td>精密作業、長時間の連続作業、足ペダル操作</td><td>重量物、大きな力、広い範囲を移動</td></tr>
  <tr><td>装置の条件</td><td>膝のすき間 (奥行き約 450 mm 以上が目安) と足置き</td><td>つま先のすき間 (高さ約 100 mm × 奥行き約 100 mm 以上が目安)</td></tr>
  <tr><td>注意点</td><td>手を伸ばす範囲が狭い。座面と作業面の高さを両方調整</td><td>静止立位が続くと脚の負担。足元マット、もたれ台</td></tr>
</table>
<p>中間として<b>立ち座り兼用</b> (高めの座面ともたれ台) もあります。どの姿勢でも、同じ姿勢を長く続けないことが大切です。複数工程のローテーションも装置配置で支援できます。</p>

<h2>姿勢を点数化する: RULA と OWAS</h2>
<p>改善の優先順位を決め、改善前後を比較するには、姿勢を<b>点数</b>にします。代表的な観察法が 2 つあります。</p>
<table class="tb-table">
  <tr><th></th><th>RULA (Rapid Upper Limb Assessment)</th><th>OWAS (Ovako Working posture Analysing System)</th></tr>
  <tr><td>対象</td><td>上肢中心の座り・立ち作業 (組立、操作)</td><td>全身の姿勢 (運搬、保全、建設)</td></tr>
  <tr><td>見るもの</td><td>上腕・前腕・手首の角度 (A 群)、首・体幹・脚 (B 群)、筋の使い方と力</td><td>背 (4 区分)・腕 (3)・脚 (7)・荷重 (3) の 4 桁コード</td></tr>
  <tr><td>結果</td><td>総合スコア 1〜7</td><td>改善の必要度 AC1〜AC4</td></tr>
  <tr><td>判定</td><td>1〜2 許容 / 3〜4 さらに調査 / 5〜6 早めに調査・改善 / 7 直ちに改善</td><td>AC1 対策不要 / AC2 近いうちに / AC3 できるだけ早く / AC4 直ちに</td></tr>
</table>
<svg class="tb-chart" viewBox="0 0 520 200" role="img" aria-label="改善前後の姿勢スコア">
<rect x="60" y="20" width="440" height="21" style="fill:var(--tb-bad)" opacity="0.12"/>
<rect x="60" y="41" width="440" height="43" style="fill:var(--tb-warn)" opacity="0.12"/>
<line class="grid" x1="60" y1="127" x2="500" y2="127"/><line class="grid" x1="60" y1="84" x2="500" y2="84"/>
<g class="k-shadow"><rect x="100" y="41" width="60" height="129" rx="3" style="fill:var(--tb-bad)" fill-opacity="1"/><rect x="180" y="127" width="60" height="43" rx="3" style="fill:var(--tb-good)" fill-opacity="1"/><rect x="290" y="62" width="60" height="108" rx="3" style="fill:var(--tb-warn)" fill-opacity="1"/><rect x="370" y="106" width="60" height="64" rx="3" style="fill:var(--tb-good)" fill-opacity="1"/></g>
<path d="M162,90 Q172,110 178,122" class="k-move"/><path d="M352,90 Q362,100 368,108" class="k-move"/>
<line class="axis" x1="60" y1="170" x2="500" y2="170"/><line class="axis" x1="60" y1="20" x2="60" y2="170"/>
<text class="tick" x="52" y="174" text-anchor="end">0</text><text class="tick" x="52" y="24" text-anchor="end">7</text>
<text class="mark-t" x="130" y="35" text-anchor="middle">6</text><text class="mark-t" x="210" y="121" text-anchor="middle">2</text>
<text class="mark-t" x="320" y="56" text-anchor="middle">5</text><text class="mark-t" x="400" y="100" text-anchor="middle">3</text>
<text class="tick" x="170" y="188" text-anchor="middle">ワーク投入 (前 → 後)</text>
<text class="tick" x="360" y="188" text-anchor="middle">ねじ締め (前 → 後)</text>
<text class="lbl" x="30" y="100" text-anchor="middle" transform="rotate(-90 30 100)">RULA</text>
</svg>
<p class="tb-caption">図: RULA スコアの改善例 (架空)。ワーク受けを 250 mm 上げて前傾をなくし、ドライバを吊り下げて手首の曲げを減らした。</p>
<div class="tb-note">RULA や OWAS は簡易なスクリーニング法です。点数は観察者で多少ばらつくため、同じ人が同じ方法で前後を比べ、写真・動画を残しておきます。持ち上げ作業は次々章の NIOSH 式、繰り返し作業は OCRA などの専用手法も検討します。</div>

<h2>3D モデルでの事前検討</h2>
<ul>
  <li>5 パーセンタイル女性・95 パーセンタイル男性の簡易マネキンを装置アセンブリに置く。</li>
  <li>手の作業点 (クランプ、ボタン、部品箱) にマーカーを付け、肩からの距離と高さを測る。</li>
  <li>視線 (眼高から作業点への線) が装置の部材に遮られないかを確認する。</li>
  <li>昇降範囲や足台の高さをパラメータにしておき、案を比べる。</li>
</ul>
<div class="tb-tip"><b>3DCAD Studio</b>: 作業面高さや部品棚の位置をユーザパラメータにし、身長を変えた簡易マネキンを組立拘束で配置すると、測定ツールで肩から作業点までの距離をすぐ比較できます。</div>`,
    points: [
      "姿勢は装置の寸法で決まる。繰り返し回数を掛けて負担を考える",
      "作業面は「手が実際に動く高さ」を肘高基準で決める (精密 +、軽作業 −、重作業 −−)",
      "体格差は昇降・足台・治具の傾斜で吸収する",
      "通常作業域に毎サイクル使うもの、最大作業域にはたまに使うものだけを置く",
      "立位はつま先のすき間、座位は膝のすき間と足置きを確保する",
      "RULA・OWAS で姿勢を点数化し、改善前後を同じ方法で比べる",
    ],
    exercises: [
      {
        q: "身長 1 580 mm の作業者が、立位でコネクタ挿入 (軽作業) を行う。肘高を身長の 0.62 倍、軽作業の補正を −100〜150 mm として、手の動く高さの推奨範囲を求めよ。治具の作業点が台上 120 mm のとき、台の高さはいくらにすればよいか。",
        a: "肘高 ≈ 0.62 × 1 580 ≈ 980 mm。推奨の手の高さ ≈ 980 − 150 〜 980 − 100 = <b>830〜880 mm</b>。台の高さは治具の分を引いて 830 − 120 〜 880 − 120 = <b>710〜760 mm</b>。(靴の高さを考えるとさらに 20〜30 mm 高くてよい。)",
      },
      {
        q: "身長 1 500 mm と 1 850 mm の作業者が同じ軽作業装置を使う。手の高さを肘高 −120 mm に合わせるとき、昇降機構に必要なストロークを求めよ (肘高 = 0.62 × 身長)。",
        a: "肘高はそれぞれ 0.62 × 1 500 = 930 mm、0.62 × 1 850 = 1 147 mm。手の高さは 810 mm と 1 027 mm。差 = 1 147 − 930 ≈ <b>217 mm</b>。余裕を見て 250 mm 程度のストロークを用意する。",
      },
    ],
    quiz: [
      {
        q: "立位の精密作業 (微小部品の組立) の作業面高さとして適切なのはどれか。",
        choices: ["肘高より 100〜150 mm 低く", "肘高よりやや高く (+50〜100 mm) し、肘を支える", "床から 700 mm に固定", "膝の高さ"],
        answer: 1,
        explain: "精密作業は目を近づけ、腕を支えるため肘高よりやや高くします。下向きの力を使う重作業は逆に低くします。",
      },
      {
        q: "毎サイクル使う部品箱を置く場所として最も適切なのはどれか。",
        choices: ["最大作業域の外 (歩いて取る)", "肩より上の棚", "通常作業域内で、手前を低く傾けた棚", "足元の床"],
        answer: 2,
        explain: "毎サイクル使うものは通常作業域に置きます。傾斜棚にすると奥の部品も取りやすく、裏側から補充できます。",
      },
      {
        q: "RULA の総合スコアが 7 だった。正しい判断はどれか。",
        choices: ["許容できる", "さらに調査する", "直ちに調査し改善する", "OWAS で再評価するまで何もしない"],
        answer: 2,
        explain: "RULA は 1〜2 許容、3〜4 さらに調査、5〜6 早めに改善、7 直ちに改善です。",
      },
    ],
    lessons: ["4-1", "5-1"],
  },

  {
    id: "op-changeover",
    part: "ux",
    title: "【上級】段取り替え・治具交換の作業性",
    minutes: 25,
    level: 3,
    lead: "多品種少量の生産では、装置が止まっている時間の多くが段取り替えです。SMED (シングル段取り) の考え方で内段取りと外段取りを分け、工具レス・ワンタッチ・ポカヨケの位置決めを装置側に設計して、誰がやっても速く正確に段取りできる装置にする方法を学びます。",
    body: `
<h2>段取り替えはなぜ装置設計の問題か</h2>
<p>段取り替えとは、品種を切り替えるために治具・金型・刃具・プログラム・条件を交換・調整する作業です。段取り時間が長いと、装置はロットをまとめて流すしかなくなり、在庫が増え、納期の自由度が下がります。
そして段取り時間の大半は、ボルトを回す・位置を合わせる・試し加工して調整するといった、<b>装置の構造で決まる作業</b>です。</p>
<svg class="tb-chart" viewBox="0 0 520 190" role="img" aria-label="段取り時間の内訳">
<line class="grid" x1="200" y1="58" x2="200" y2="160"/><line class="grid" x1="300" y1="58" x2="300" y2="160"/><line class="grid" x1="420" y1="58" x2="420" y2="160"/>
<g class="k-shadow">
<rect x="120" y="30" width="60" height="22" style="fill:var(--tb-text-3);stroke:var(--tb-surface)" stroke-width="1.5"/><rect x="180" y="30" width="80" height="22" style="fill:var(--tb-warn);stroke:var(--tb-surface)" stroke-width="1.5"/><rect x="260" y="30" width="100" height="22" style="fill:var(--tb-accent);stroke:var(--tb-surface)" stroke-width="1.5"/><rect x="360" y="30" width="120" height="22" style="fill:var(--tb-bad);stroke:var(--tb-surface)" stroke-width="1.5"/>
<rect x="120" y="80" width="80" height="22" style="fill:var(--tb-warn);stroke:var(--tb-surface)" stroke-width="1.5"/><rect x="200" y="80" width="100" height="22" style="fill:var(--tb-accent);stroke:var(--tb-surface)" stroke-width="1.5"/><rect x="300" y="80" width="120" height="22" style="fill:var(--tb-bad);stroke:var(--tb-surface)" stroke-width="1.5"/>
<rect x="120" y="130" width="20" height="22" style="fill:var(--tb-warn);stroke:var(--tb-surface)" stroke-width="1.5"/><rect x="140" y="130" width="30" height="22" style="fill:var(--tb-accent);stroke:var(--tb-surface)" stroke-width="1.5"/><rect x="170" y="130" width="20" height="22" style="fill:var(--tb-bad);stroke:var(--tb-surface)" stroke-width="1.5"/>
</g>
<line class="axis" x1="120" y1="20" x2="120" y2="160"/>
<line class="axis" x1="120" y1="160" x2="500" y2="160" marker-end="url(#k-arrow)"/>
<path d="M484,56 Q470,70 426,80" class="k-move"/><path d="M424,104 Q330,128 196,136" class="k-move"/>
<text class="tick" x="112" y="45" text-anchor="end">改善前</text><text class="tick" x="112" y="95" text-anchor="end">外段取り化</text><text class="tick" x="112" y="145" text-anchor="end">内段取り短縮</text>
<text class="tick" x="150" y="24" text-anchor="middle">準備・運搬</text><text class="tick" x="220" y="24" text-anchor="middle">取外し・取付</text><text class="tick" x="310" y="24" text-anchor="middle">位置決め</text><text class="tick" x="420" y="24" text-anchor="middle">試し加工・調整</text>
<text class="tick" x="500" y="180" text-anchor="end">装置停止時間 →</text>
</svg>
<p class="tb-caption">図: 段取り時間の内訳 (概念図)。準備を外段取りに出し、取付・位置決め・調整を構造で短くする。最も長いのは「調整」であることが多い。</p>

<h2>SMED の 4 段階</h2>
<p>SMED (Single-Minute Exchange of Die) は、段取りを 10 分未満 (1 桁の分) にすることを目標にした手法です。</p>
<div class="tb-flow"><span>① 現状を観察し作業を分解</span><span>② 内段取りと外段取りを分ける</span><span>③ 内段取りを外段取りに変える</span><span>④ 残りの内段取りと外段取りを短縮</span></div>
<table class="tb-table">
  <tr><th>区分</th><th>定義</th><th>例</th></tr>
  <tr><td><b>内段取り</b></td><td>装置を止めないとできない作業</td><td>治具の取外し・取付、原点合わせ</td></tr>
  <tr><td><b>外段取り</b></td><td>装置が動いている間にできる作業</td><td>次の治具・工具の準備、予熱、プリセット、プログラム転送</td></tr>
</table>
<p>装置設計者が貢献できるのは主に ③ と ④ です。たとえば金型を<b>予熱するステーション</b>、刃具の<b>機外プリセット</b>、治具を載せる<b>サブプレート</b>を用意すれば、装置停止中の作業を減らせます。</p>

<h2>取付・取外しを速くする: 工具レスとワンタッチ</h2>
<table class="tb-table">
  <tr><th>従来</th><th>改善案</th><th>ねらい</th></tr>
  <tr><td>ボルト 8 本で固定</td><td>クランプレバー、カムクランプ、トグルクランプ</td><td>回す回数をなくす</td></tr>
  <tr><td>ボルトを全部抜く</td><td>だるま穴 (U 溝) で緩めるだけで外せる</td><td>部品の脱落・紛失を防ぐ</td></tr>
  <tr><td>工具の種類が多い</td><td>全箇所を同じサイズの六角・ノブに統一</td><td>工具探しをなくす</td></tr>
  <tr><td>重い治具を手で持ち上げる</td><td>スライドレール、ローラコンベヤ、台車の高さを合わせる</td><td>持ち上げ・落下をなくす</td></tr>
  <tr><td>配管・配線を個別に外す</td><td>マルチカプラ、一括コネクタ</td><td>1 動作で接続、誤接続防止</td></tr>
</table>
<p>締結の考え方は「<b>1 回転以内</b>」「<b>1 動作</b>」「<b>脱落しない</b>」です。ねじで締める必要があるときも、ねじ山がかかる長さだけ回せばよい形 (だるま穴、U 字座金、分割ナット) にします。</p>

<h2>位置決めを構造で保証する</h2>
<p>段取りで最も時間がかかり、品質を左右するのが<b>位置合わせと調整</b>です。調整をなくすには、取り付けた瞬間に位置が決まる構造にします。</p>
<svg class="tb-chart" viewBox="0 0 520 202" role="img" aria-label="丸ピンと菱形ピンによる位置決め">
<line class="k-center" x1="148" y1="64" x2="148" y2="176"/><line class="k-center" x1="376" y1="64" x2="376" y2="176"/>
<g class="k-shadow">
<rect class="k-cut" x="60" y="122" width="400" height="42"/>
<path class="k-cut2" d="M100,66 L138,66 L138,100 L100,100 Z M158,66 L366,66 L366,100 L158,100 Z M386,66 L420,66 L420,100 L386,100 Z"/>
<path class="k-part-h" d="M140,122 L140,94 Q140,88 146,88 L150,88 Q156,88 156,94 L156,122 Z"/>
<path class="k-part-h" d="M372,122 L372,94 Q372,88 376,88 Q380,88 380,94 L380,122 Z"/>
</g>
<path class="k-move" d="M84,52 L84,96"/>
<text class="tick" x="260" y="58" text-anchor="middle">治具プレート (上から落とすだけで位置決め)</text>
<text class="mark-t" x="262" y="28" text-anchor="middle">丸ピン: X・Y を拘束 / 菱形ピン: 回転だけを拘束</text>
<text class="tick" x="260" y="190" text-anchor="middle">ベースプレート</text>
<text class="lbl" x="120" y="190" text-anchor="end">丸ピン</text>
<text class="lbl" x="404" y="190">菱形ピン</text>
<circle class="k-part" cx="134" cy="185" r="7"/><path class="k-part" d="M354,185 L362,177 L370,185 L362,193 Z"/>
<rect x="434" y="14" width="12" height="12" rx="2" style="fill:var(--tb-bad)"/><text class="tick" x="450" y="24">誤装着防止</text>
</svg>
<p class="tb-caption">図: 丸ピンと菱形ピン (削りピン) による位置決め。2 本とも丸ピンだと穴ピッチの誤差で入らなくなるため、片方を菱形にする。</p>
<ul>
  <li><b>2 ピン位置決め</b> (丸ピン + 菱形ピン) と基準面への押し当てで、取付後の調整をなくす。</li>
  <li><b>ポカヨケ</b>: ピン位置を非対称にする、品種ごとにピン径を変える、治具に識別 ID (RFID・近接センサの組合せ) を持たせ、選択中の品種と合わないと起動できなくする。</li>
  <li><b>目盛りではなくストッパ</b>: 品種ごとの位置をストッパブロック、割り出しピン、番号付き穴で決める。「目盛り 23.5 に合わせる」は誤差と迷いの元。</li>
  <li><b>レシピ連動</b>: サーボ軸の位置、温度、速度は品種選択で自動設定し、手入力をなくす。手で動かす軸には位置センサやデジタルカウンタを付けて確認する。</li>
</ul>
<div class="tb-note">位置決めピンは摩耗します。ブシュとピンを交換部品にし、焼入れ・材質を指定し、点検周期を保全情報に書いておきます。</div>

<h2>段取りの手順を装置に持たせる</h2>
<ul>
  <li>交換部品と保管場所に<b>同じ色・番号</b>を付ける (品種 A の治具・ガイド・カムはすべて青 A)。</li>
  <li>HMI に段取りモードを用意し、手順・写真・確認チェックを順に表示する。完了チェックがそろうまで自動運転に入れない。</li>
  <li>段取り台車に、外した治具と次の治具を<b>同じ高さ</b>で並べ、持ち替えを減らす。</li>
  <li>1 人で完結できる手順にする。2 人必要な作業は待ちが生まれる。</li>
</ul>
<div class="tb-tip"><b>3DCAD Studio</b>: 治具とベースのアセンブリで、ピン穴のピッチと公差を拘束で確認し、干渉解析で装着時に他の部品と当たらない着脱経路を確かめましょう。</div>`,
    points: [
      "段取り時間は装置構造で決まる部分が大きい。最も長いのは調整であることが多い",
      "SMED: 内段取りと外段取りを分け、内を外へ移し、残りを短縮する",
      "締結は 1 回転以内・1 動作・脱落しない形にする",
      "2 ピン (丸 + 菱形) と基準面で、取付後の調整をなくす",
      "ポカヨケ (非対称ピン・治具 ID) で誤った治具では起動できなくする",
      "目盛り合わせよりストッパ・割り出し・レシピ連動",
    ],
    exercises: [
      {
        q: "ある装置の段取りは装置停止中にすべて行われ 60 分かかる。内訳は、次の治具の準備・運搬 15 分、取外し・取付 15 分 (うちボルト 12 本の締緩めが 12 分)、位置合わせ 10 分、試し加工と調整 20 分である。(1) 準備・運搬を外段取りにし、(2) ボルトをクランプ 4 個 (計 2 分) に変え、(3) 2 ピン位置決めで位置合わせを 2 分、調整を 5 分にした。停止時間はいくらになるか。",
        a: "(1) 60 − 15 = 45 分。(2) 取外し・取付は 15 − 12 + 2 = 5 分 → 45 − 10 = 35 分。(3) 位置合わせ 10 → 2 (−8)、調整 20 → 5 (−15) → 35 − 23 = <b>12 分</b>。内訳: 取外し・取付 5 + 位置合わせ 2 + 調整 5 = 12 分。",
      },
      {
        q: "1 日の稼働時間 480 分、1 日 3 回の段取りがある。段取りが 60 分から 12 分になると、生産に使える時間は何 % 増えるか。",
        a: "改善前: 480 − 3 × 60 = 300 分。改善後: 480 − 3 × 12 = 444 分。増加率 = 444 / 300 − 1 = <b>48 %</b>。あるいは同じ生産時間のまま段取り回数を増やし、ロットを小さくできる。",
      },
    ],
    quiz: [
      {
        q: "外段取りに当たるものはどれか。",
        choices: ["装置を止めて治具を外す", "装置稼働中に次の金型を予熱しておく", "装置を止めて原点を合わせる", "停止中の試し加工"],
        answer: 1,
        explain: "外段取りは装置が動いている間にできる作業です。予熱やプリセット、準備は外段取りにできます。",
      },
      {
        q: "治具を 2 本のピンで位置決めするとき、片方を菱形ピンにする理由はどれか。",
        choices: ["見た目を区別するため", "穴ピッチの誤差を逃がしつつ回転を拘束するため", "ピンを安くするため", "重量を軽くするため"],
        answer: 1,
        explain: "丸ピン 2 本では穴ピッチの誤差で入らなくなります。菱形ピンはピッチ方向に逃げを持ち、回転だけを拘束します。",
      },
      {
        q: "段取りの「調整」をなくす方法として最も効果的なのはどれか。",
        choices: ["目盛りを細かくする", "熟練者だけに段取りさせる", "ストッパや割り出しピン、レシピ連動で位置を構造的に決める", "試し加工の回数を増やす"],
        answer: 2,
        explain: "目盛り合わせは誤差と迷いの元です。位置を構造やレシピで決めれば、誰でも 1 回で合います。",
      },
    ],
    lessons: ["5-1"],
  },

  {
    id: "op-handling",
    part: "ux",
    title: "【上級】ワーク投入・取り出しとハンドリング",
    minutes: 25,
    level: 3,
    lead: "装置へのワーク投入と取り出しは、作業者が最も多く体を使う場面です。NIOSH 持ち上げ式で持ち上げの限界を数値で評価し、投入口の高さ・奥行き・向きを設計し、バランサやリフタなどのアシスト装置をいつ使うかを判断できるようにします。",
    body: `
<h2>投入・取り出しで起きる問題</h2>
<p>ワークの投入口が低い・奥にある・扉の枠をまたぐ必要がある、といった装置では、作業者は前かがみ・腕の伸ばし・ねじりを毎サイクル繰り返します。腰痛の原因になるだけでなく、ワークをぶつけて傷つけたり、落としたりする品質問題にもつながります。</p>
<svg class="tb-chart" viewBox="0 0 520 240" role="img" aria-label="投入口の悪い例とよい例">
<rect class="k-panel" x="8" y="8" width="244" height="226" rx="8"/><rect class="k-panel" x="268" y="8" width="244" height="226" rx="8"/>
<circle class="k-badge" cx="28" cy="28" r="10" style="fill:var(--tb-bad)"/><text class="k-badge-t" x="28" y="32" text-anchor="middle">✕</text><text class="k-title" x="46" y="32">枠越しに前かがみ</text><circle class="k-badge" cx="288" cy="28" r="10" style="fill:var(--tb-good)"/><text class="k-badge-t" x="288" y="32" text-anchor="middle">✓</text><text class="k-title" x="306" y="32">手前に引き出す受け台</text>
<rect class="k-ground" x="16" y="206" width="228" height="8"/><rect class="k-ground" x="276" y="206" width="228" height="8"/>
<line class="k-edge" x1="16" y1="206" x2="244" y2="206"/><line class="k-edge" x1="276" y1="206" x2="504" y2="206"/>
<g class="k-shadow"><rect class="k-alu" x="120" y="70" width="120" height="136" rx="3"/></g><rect x="130" y="80" width="100" height="116" rx="2" style="fill:var(--tb-surface-2);stroke:var(--k-line-2)"/>
<rect class="k-part" x="120" y="112" width="12" height="94"/>
<rect x="150" y="174" width="74" height="10" rx="2" style="fill:var(--tb-bad)"/>
<g class="k-shadow" transform="translate(66 206) scale(1.0 1.0)"><path d="M-11,-72 L-12,-5 L-2,-5 L0,-48 L2,-5 L12,-5 L11,-72 Z" fill="#46505f" style="stroke:var(--k-line)" stroke-width="1.2"/><path d="M-14,-6 L-1,-6 L-1,0 L-14,0 Z M1,-6 L13,-6 Q19,-4 18,0 L1,0 Z" fill="#2a2f38"/><g transform="rotate(50 0 -70)"><path d="M2,-122 L26,-110 L62,-112" fill="none" style="stroke:var(--k-line)" stroke-width="10"/><path d="M26,-110 L62,-112" fill="none" style="stroke:var(--k-skin-2)" stroke-width="7.4"/><path d="M2,-122 L26,-110" fill="none" style="stroke:var(--k-accent-2)" stroke-width="7.6"/><circle class="k-skin" cx="62" cy="-112" r="4.8"/><rect class="k-accent" x="-13" y="-131" width="27" height="64" rx="9"/><rect x="-12" y="-76" width="25" height="5" fill="#2a2f38"/><rect class="k-skin" x="-1" y="-136" width="8" height="8"/><circle class="k-skin" cx="3" cy="-145" r="11"/><circle cx="10" cy="-146" r="1.3" style="fill:var(--k-line)"/><path d="M-9,-147 A12.5,12.5 0 0 1 15.5,-147 Z" fill="#f2c230" style="stroke:var(--k-line)" stroke-width="1.2"/><line x1="13" y1="-147" x2="20" y2="-147" style="stroke:var(--k-line)" stroke-width="2"/><path d="M2,-122 L30,-104 L68,-104" fill="none" style="stroke:var(--k-line)" stroke-width="10"/><path d="M30,-104 L68,-104" fill="none" style="stroke:var(--k-skin-2)" stroke-width="7.4"/><path d="M2,-122 L30,-104" fill="none" style="stroke:var(--k-accent-2)" stroke-width="7.6"/><circle class="k-skin" cx="68" cy="-104" r="4.8"/></g></g>
<text class="k-bad-t" x="200" y="226" text-anchor="middle">奥・低い</text>
<g class="k-shadow"><rect class="k-alu" x="380" y="70" width="120" height="136" rx="3"/></g><rect x="390" y="80" width="100" height="116" rx="2" style="fill:var(--tb-surface-2);stroke:var(--k-line-2)"/>
<g class="k-shadow"><rect class="k-part" x="330" y="118" width="96" height="8" rx="2"/>
<rect x="336" y="108" width="70" height="10" rx="2" style="fill:var(--tb-good)"/></g>
<line class="k-move" x1="414" y1="100" x2="450" y2="100"/>
<g class="k-shadow" transform="translate(296 206) scale(1.0 1.0)"><path d="M-11,-72 L-12,-5 L-2,-5 L0,-48 L2,-5 L12,-5 L11,-72 Z" fill="#46505f" style="stroke:var(--k-line)" stroke-width="1.2"/><path d="M-14,-6 L-1,-6 L-1,0 L-14,0 Z M1,-6 L13,-6 Q19,-4 18,0 L1,0 Z" fill="#2a2f38"/><g transform="rotate(0 0 -70)"><path d="M2,-122 L14,-98 L38,-100" fill="none" style="stroke:var(--k-line)" stroke-width="10"/><path d="M14,-98 L38,-100" fill="none" style="stroke:var(--k-skin-2)" stroke-width="7.4"/><path d="M2,-122 L14,-98" fill="none" style="stroke:var(--k-accent-2)" stroke-width="7.6"/><circle class="k-skin" cx="38" cy="-100" r="4.8"/><rect class="k-accent" x="-13" y="-131" width="27" height="64" rx="9"/><rect x="-12" y="-76" width="25" height="5" fill="#2a2f38"/><rect class="k-skin" x="-1" y="-136" width="8" height="8"/><circle class="k-skin" cx="3" cy="-145" r="11"/><circle cx="10" cy="-146" r="1.3" style="fill:var(--k-line)"/><path d="M-9,-147 A12.5,12.5 0 0 1 15.5,-147 Z" fill="#f2c230" style="stroke:var(--k-line)" stroke-width="1.2"/><line x1="13" y1="-147" x2="20" y2="-147" style="stroke:var(--k-line)" stroke-width="2"/><path d="M2,-122 L18,-96 L42,-96" fill="none" style="stroke:var(--k-line)" stroke-width="10"/><path d="M18,-96 L42,-96" fill="none" style="stroke:var(--k-skin-2)" stroke-width="7.4"/><path d="M2,-122 L18,-96" fill="none" style="stroke:var(--k-accent-2)" stroke-width="7.6"/><circle class="k-skin" cx="42" cy="-96" r="4.8"/></g></g>
<text class="tick" x="390" y="228" text-anchor="middle">手前・肘高付近・スライドで送る</text>
</svg>
<p class="tb-caption">図: 投入口。受け台を手前に引き出せる構造にすると、枠を越えずに肘高付近でワークを置ける。</p>

<h2>NIOSH 持ち上げ式 (改訂版)</h2>
<p>米国 NIOSH の改訂持ち上げ式は、両手で持ち上げる作業について、健康な作業者の大多数が腰を痛めずに扱える<b>推奨重量限界 RWL</b> を求めます。理想条件の 23 kg に、条件ごとの係数 (最大 1.0) を掛けていきます。</p>
<div class="tb-math">\\begin{aligned} \\mathrm{RWL} &= \\mathrm{LC}\\times\\mathrm{HM}\\times\\mathrm{VM}\\times\\mathrm{DM}\\times\\mathrm{AM} \\\\ &\\quad \\times\\mathrm{FM}\\times\\mathrm{CM} \\\\ \\mathrm{LC} &= 23\\,\\mathrm{kg} \\\\ \\mathrm{LI} &= \\dfrac{\\text{実際の重量}}{\\mathrm{RWL}} \\end{aligned}</div>
<p>LI は持ち上げ指数です。</p>
<table class="tb-table">
  <tr><th>係数</th><th>式 (SI 版)</th><th>意味</th></tr>
  <tr><td>HM 水平距離</td><td>25 / H (H: 25〜63 cm、25 未満は 25)</td><td>両足首の中点から手までの水平距離。遠いほど小さい</td></tr>
  <tr><td>VM 高さ</td><td>1 − 0.003 × |V − 75| (V: 0〜175 cm)</td><td>始点の手の高さ。75 cm (腰の高さ付近) が最良</td></tr>
  <tr><td>DM 移動距離</td><td>0.82 + 4.5 / D (D: 25〜175 cm、25 未満は 25)</td><td>垂直方向の移動量</td></tr>
  <tr><td>AM ねじり</td><td>1 − 0.0032 × A (A: 0〜135°)</td><td>正面からの体のねじり角</td></tr>
  <tr><td>FM 頻度</td><td>表 (回/分 と作業継続時間)</td><td>頻繁・長時間ほど小さい</td></tr>
  <tr><td>CM 持ち手</td><td>良 1.00 / 可 0.95 (V ≥ 75 cm では 1.00) / 不良 0.90</td><td>取っ手や手掛け穴の有無</td></tr>
</table>
<table class="tb-table">
  <tr><th>頻度 FM (抜粋)</th><th>1 時間以内</th><th>1〜2 時間</th><th>2〜8 時間</th></tr>
  <tr><td>0.2 回/分</td><td>1.00</td><td>0.95</td><td>0.85</td></tr>
  <tr><td>1 回/分</td><td>0.94</td><td>0.88</td><td>0.75</td></tr>
  <tr><td>2 回/分</td><td>0.91</td><td>0.84</td><td>0.65</td></tr>
  <tr><td>4 回/分</td><td>0.84</td><td>0.72</td><td>0.45</td></tr>
  <tr><td>6 回/分</td><td>0.75</td><td>0.50</td><td>0.27</td></tr>
</table>
<p>LI ≤ 1 なら大多数の作業者に許容でき、LI が 1 を超えるとリスクが増え、LI &gt; 3 では多くの作業者にとって高リスクとされます。始点と終点の両方で計算し、厳しいほうで評価します (終点で精密な位置合わせが必要な場合など)。</p>
<div data-widget="anim-niosh"></div>
<div class="tb-note">NIOSH 式は、両手・なめらかな持ち上げ・普通の温湿度・滑らない床などを前提とします。片手作業、押し引き、運搬 (歩行)、座ったままの持ち上げは別の評価法を使います。日本では厚生労働省の「職場における腰痛予防対策指針」も参照し、人力で扱う重量の目安 (男性は体重のおおむね 40 % 以下など) を確認します。</div>

<h2>係数から設計の打ち手を読む</h2>
<p>RWL が小さい原因の係数を見れば、何を変えればよいかが分かります。</p>
<table class="tb-table">
  <tr><th>小さい係数</th><th>装置側の対策</th></tr>
  <tr><td>HM (遠い)</td><td>受け台を手前に引き出す、扉の枠・カバーをなくす、つま先のすき間を作る</td></tr>
  <tr><td>VM (低い・高い)</td><td>投入口・パレット・コンベヤの高さを 75 cm 付近にそろえる、パレットリフタ</td></tr>
  <tr><td>DM (移動が大きい)</td><td>投入口と取り出し口と置き場の高さをそろえる (持ち上げではなくスライド)</td></tr>
  <tr><td>AM (ねじる)</td><td>投入口と部品置き場を正面に並べる、回転テーブル</td></tr>
  <tr><td>FM (頻繁)</td><td>マガジン・トレイでまとめて供給、自動化</td></tr>
  <tr><td>CM (持ちにくい)</td><td>ワークに取っ手を付ける治具、専用ハンドル、吸着ハンド</td></tr>
</table>

<h2>アシスト装置</h2>
<table class="tb-table">
  <tr><th>装置</th><th>向く作業</th><th>注意点</th></tr>
  <tr><td>バランサ (エア・スプリング)</td><td>重量がほぼ一定のワークの上下</td><td>重量が変わると調整が必要</td></tr>
  <tr><td>アシストアーム・マニピュレータ</td><td>重い・形の複雑なワーク、姿勢を変える</td><td>慣性で止めにくい。作業時間が延びないか</td></tr>
  <tr><td>真空リフタ</td><td>板・箱・袋</td><td>吸着面の状態、停電時の保持</td></tr>
  <tr><td>パレットリフタ・ターンテーブル</td><td>積み上げたワークの取り出し</td><td>常に一定の高さで取れるように自動で上昇</td></tr>
  <tr><td>ローラ・ボールトランスファ</td><td>水平移動</td><td>止める位置のストッパ</td></tr>
</table>
<p>アシスト装置は「使われない」ことが最大の失敗です。取りに行く距離が長い、遅い、つかむのに手間がかかると、作業者は手で持ち上げてしまいます。<b>素手より速く楽</b>になるよう、つかみ具をワークに合わせて設計し、使用位置に常設します。</p>

<h2>取り出しの UX</h2>
<ul>
  <li>完成品の向きをそろえて出す (次工程で持ち替えが不要)。</li>
  <li>取り出し口と投入口を近くに置き、1 回の歩行で両方を行う。</li>
  <li>熱い・鋭いワークは、手で触らずに取れるシュートや受け箱にする。</li>
  <li>不良品は別の口に排出し、良品に混ざらない (ポカヨケ)。</li>
</ul>
<div class="tb-tip"><b>3DCAD Studio</b>: ワークの質量特性 (重量・重心) を確認し、受け台の高さと足元のすき間をアセンブリで測って、H と V を NIOSH 式に入れてみましょう。</div>`,
    points: [
      "投入口は手前・肘高付近・枠を越えない形にする",
      "NIOSH 式: RWL = 23 kg × HM × VM × DM × AM × FM × CM、LI = 重量 ÷ RWL",
      "LI ≤ 1 を目標にし、小さい係数から装置側の対策を選ぶ",
      "高さをそろえてスライドさせれば、持ち上げそのものが不要になる",
      "アシスト装置は素手より速く楽でないと使われない",
      "取り出しはワークの向き・不良品の分離まで設計する",
    ],
    exercises: [
      {
        q: "重さ 12 kg のワーク (取っ手あり: 良) を、床上 30 cm の台車から持ち上げ、高さ 80 cm の装置受け台に置く (移動距離 D = 50 cm)。水平距離 H = 40 cm、ねじりなし、1 回/分で 1〜2 時間 (FM = 0.88)。始点の RWL と LI を求めよ。",
        a: "HM = 25 / 40 = 0.625。VM = 1 − 0.003 × |30 − 75| = 1 − 0.135 = 0.865。DM = 0.82 + 4.5 / 50 = 0.91。AM = 1.00、FM = 0.88、CM = 1.00。<br>RWL = 23 × 0.625 × 0.865 × 0.91 × 1.00 × 0.88 × 1.00 ≈ <b>9.96 kg (約 10.0 kg)</b>。LI = 12 / 9.96 ≈ <b>1.21</b> → 1 を超えるので改善が必要。",
      },
      {
        q: "前問で、台車をリフタ付きにして始点の手の高さを V = 75 cm にし、受け台を手前に引き出せるようにして H = 25 cm にした (D = 50 cm のまま)。RWL と LI はどうなるか。",
        a: "HM = 1.00、VM = 1.00、DM = 0.91、AM = 1.00、FM = 0.88、CM = 1.00。RWL = 23 × 0.91 × 0.88 ≈ <b>18.4 kg</b>。LI = 12 / 18.4 ≈ <b>0.65</b> → 1 以下になった。さらに受け台と台車の高さをそろえれば、持ち上げずにスライドできる。",
      },
    ],
    quiz: [
      {
        q: "NIOSH 持ち上げ式で、始点の手の高さ V が最良 (VM = 1.0) となるのはどれか。",
        choices: ["床面 (0 cm)", "約 75 cm", "約 150 cm", "肩の高さ"],
        answer: 1,
        explain: "VM = 1 − 0.003|V − 75| なので V = 75 cm で最大です。低すぎても高すぎても小さくなります。",
      },
      {
        q: "LI = 2.0 と評価された。適切な対応はどれか。",
        choices: ["問題ないのでそのまま", "リスクが高いので、小さい係数を改善するかアシスト装置を検討する", "作業者を体格の大きい人に限る", "作業時間を長くする"],
        answer: 1,
        explain: "LI が 1 を超えるとリスクが増えます。人を選ぶのではなく、作業と装置を変えるのが原則です。",
      },
      {
        q: "アシスト装置が現場で使われなくなる最大の原因はどれか。",
        choices: ["色が地味", "素手で持つより遅く手間がかかる", "重量が軽すぎる", "マニュアルが厚い"],
        answer: 1,
        explain: "取りに行く距離やつかむ手間が増えると、作業者は手で持ち上げてしまいます。素手より速く楽にする設計が必要です。",
      },
    ],
    lessons: ["5-1"],
  },

  {
    id: "op-hmi-alarm",
    part: "ux",
    title: "【上級】操作盤 HMI 画面とアラームの設計",
    minutes: 30,
    level: 3,
    lead: "異常のときに作業者を助けるはずのアラームが、大量に鳴り続けて原因を隠してしまうことがあります。ISA-18.2 や EEMUA 191 の考え方を装置に当てはめ、アラームの定義・優先度・抑制・対応手順を設計し、状態が一目で分かる画面階層と色の使い方を学びます。",
    body: `
<h2>アラームは「対応が必要なこと」だけ</h2>
<p>プロセス産業のアラーム管理規格 ISA-18.2 (IEC 62682) では、アラームを「異常、または機器の故障、プロセスの逸脱を<b>作業者に知らせ、対応を求める</b>もの」と定義します。
裏返せば、作業者が<b>何もしなくてよい</b>通知はアラームにしてはいけません。運転状態やイベントの記録は、ログやメッセージに分けます。</p>
<table class="tb-table">
  <tr><th>種類</th><th>例</th><th>扱い</th></tr>
  <tr><td>アラーム</td><td>エア圧低下、非常停止、サーボ異常、ワーク詰まり</td><td>音・点滅で通知し、確認と対応を求める</td></tr>
  <tr><td>警告 (予告)</td><td>消耗品の交換時期が近い、部品残量少</td><td>低優先度または画面のメッセージ</td></tr>
  <tr><td>イベント・情報</td><td>運転開始、段取り完了、品種変更</td><td>ログのみ。作業者に割り込まない</td></tr>
</table>

<h2>アラームフラッドの害</h2>
<p>1 つの原因から多数の結果アラームが連鎖して出る状態を<b>アラームフラッド</b>と呼びます。EEMUA 191 などでは、作業者 1 人あたり <b>10 分間に 10 件を超える</b>状態をフラッドの目安とし、平常時は 10 分に 1 件程度を許容できる水準の目安としています。
フラッドの中では、作業者は最初の原因を見つけられず、全部をリセットして再起動し、同じ異常を繰り返します。</p>
<div data-widget="anim-alarmflood"></div>
<table class="tb-table">
  <tr><th>対策</th><th>内容</th></tr>
  <tr><td>根本原因アラームの明示</td><td>最初に出たアラーム (ファーストアウト) を記録し、先頭に表示する</td></tr>
  <tr><td>状態に基づく抑制</td><td>エア圧低下中のシリンダタイムアウトや、扉が開いている間の動作不良は表示しない (ログには残す)</td></tr>
  <tr><td>グループ化</td><td>同じ原因の結果アラームを 1 行にまとめ、展開で詳細を見る</td></tr>
  <tr><td>チャタリング対策</td><td>不感帯 (ヒステリシス) と遅延時間で、境界付近での発報・復帰の繰り返しを防ぐ</td></tr>
  <tr><td>棚上げ (シェルブ)</td><td>故障したセンサのアラームを、期限と記録付きで一時的に保留する</td></tr>
</table>

<h2>アラーム設計の手順 (アラームフィロソフィー)</h2>
<div class="tb-flow"><span>方針 (フィロソフィー) を決める</span><span>候補を洗い出す</span><span>合理化 (要否・優先度・対応)</span><span>実装と画面</span><span>運用データで見直し</span></div>
<p><b>合理化</b>では、アラーム 1 件ごとに次をデータベースに記録します。これがそのまま取扱説明書やトラブルシューティング表になります。</p>
<table class="tb-table">
  <tr><th>項目</th><th>例 (エア圧低下)</th></tr>
  <tr><td>原因</td><td>元圧低下、フィルタ詰まり、エア漏れ</td></tr>
  <tr><td>放置した結果</td><td>クランプ力不足でワークが外れる</td></tr>
  <tr><td>作業者の対応</td><td>元圧バルブとフィルタを確認、圧力が回復したらリセット</td></tr>
  <tr><td>対応に使える時間</td><td>即時 (自動停止済み)</td></tr>
  <tr><td>優先度</td><td>高</td></tr>
  <tr><td>設定値・遅延</td><td>0.45 MPa 以下が 1 秒継続、復帰は 0.50 MPa</td></tr>
</table>
<p><b>優先度</b>は「放置したときの結果の重大さ」と「対応に使える時間」で決めます。優先度が多すぎると意味がなくなるため、3 段階程度にし、件数の比率の目安を <b>高 約 5 % / 中 約 15 % / 低 約 80 %</b> とします。ほとんどのアラームが「高」になっていたら、合理化が足りていません。</p>
<svg class="tb-chart" viewBox="0 0 520 170" role="img" aria-label="優先度の比率">
<g class="k-shadow">
<rect x="40" y="50" width="22" height="40" style="fill:var(--tb-bad)"/>
<rect x="62" y="50" width="66" height="40" style="fill:var(--tb-warn)"/>
<rect x="128" y="50" width="352" height="40" style="fill:var(--tb-accent)" fill-opacity="0.55"/>
</g>
<line class="k-thin" x1="51" y1="46" x2="51" y2="36"/><line class="k-thin" x1="95" y1="94" x2="95" y2="102"/>
<text class="k-bad-t" x="51" y="32" text-anchor="middle">高 5 %</text><text class="mark-t" x="95" y="116" text-anchor="middle">中 15 %</text><text class="mark-t" x="304" y="75" text-anchor="middle">低 80 %</text>
<text class="mark-t" x="40" y="146">設定されたアラームの件数比の目安 (EEMUA 191 などの考え方)</text>
</svg>
<p class="tb-caption">図: アラーム優先度の比率の目安。高優先度は本当に即時対応が必要なものだけに絞る。</p>

<h2>アラーム表示の書き方</h2>
<ul>
  <li><b>何が・どこで・どうなったか</b>を短く: 「ALM 312」ではなく「[高] 工程 3 クランプ 2 閉確認なし (SQ32)」。</li>
  <li><b>対応手順</b>をその場で表示する (原因候補の順、写真、該当箇所の位置図)。</li>
  <li>実測値と設定値を並べる: 「0.32 MPa (下限 0.45)」。</li>
  <li>復帰の条件を示す: 「圧力回復後、リセットボタン」。</li>
  <li>発生時刻・件数・確認者を履歴に残し、頻発アラームのランキングを保全に使う。</li>
</ul>

<h2>画面の階層と状態の見える化</h2>
<p>産業用 HMI の設計では、画面を階層に分け、上位ほど「全体の状態」、下位ほど「詳細と操作」にするのが一般的です (ISA-101 などの考え方)。</p>
<table class="tb-table">
  <tr><th>レベル</th><th>内容</th><th>例</th></tr>
  <tr><td>1 全体</td><td>装置全体の状態を 1 画面で</td><td>工程ごとの運転・停止・異常、生産数、稼働率</td></tr>
  <tr><td>2 ユニット</td><td>工程・ユニットの操作</td><td>工程 3 の運転モード、サイクル状態</td></tr>
  <tr><td>3 詳細</td><td>個々の機器</td><td>シリンダの前進端・後退端センサ、軸の位置</td></tr>
  <tr><td>4 診断</td><td>保全・調整</td><td>I/O モニタ、パラメータ、トレンド</td></tr>
</table>
<svg class="tb-chart" viewBox="0 0 520 262" role="img" aria-label="アラーム一覧画面">
<g class="k-shadow"><rect class="k-part" x="20" y="8" width="480" height="246" rx="10"/></g>
<rect class="k-screen" x="32" y="20" width="456" height="210" rx="3"/>
<rect x="32" y="20" width="456" height="24" fill="#2d3440"/>
<text class="k-screen-t" x="42" y="36" font-weight="700">アラーム一覧</text><text class="k-screen-t" x="200" y="36">未確認 1 / 発生中 2</text><text class="k-screen-t" x="478" y="36" text-anchor="end">14:32</text>
<rect x="38" y="52" width="444" height="28" rx="3" fill="#3a2226" stroke="#e53935" stroke-width="1.4"/>
<rect x="42" y="57" width="34" height="20" rx="3" fill="#c62828"/><text x="59" y="71" text-anchor="middle" fill="#fff" font-size="11" font-weight="700">高</text><text class="k-screen-t" x="84" y="71">14:31:05</text><text x="146" y="71" class="k-screen-t">工程3 エア圧低下 0.32 MPa (下限 0.45)</text><text x="478" y="71" text-anchor="end" fill="#ff8a80" font-size="11">未確認・最初</text>
<text x="146" y="100" fill="#8a94a3" font-size="10">└ 結果アラーム 3 件 (クランプ閉確認なし ほか) を抑制中</text>
<rect x="42" y="114" width="34" height="20" rx="3" fill="#b8860b"/><text x="59" y="128" text-anchor="middle" fill="#fff" font-size="11" font-weight="700">中</text><text class="k-screen-t" x="84" y="128">14:31:06</text><text x="146" y="128" class="k-screen-t">工程3 クランプ2 閉確認なし (SQ32)</text><text x="478" y="128" text-anchor="end" fill="#c5ccd6" font-size="11">確認済</text>
<rect x="42" y="142" width="34" height="20" rx="3" fill="#1e63c6"/><text x="59" y="156" text-anchor="middle" fill="#fff" font-size="11" font-weight="700">低</text><text class="k-screen-t" x="84" y="156">14:10:40</text><text x="146" y="156" class="k-screen-t">工程1 フィルタ交換時期 (残り 3 日)</text><text x="478" y="156" text-anchor="end" fill="#c5ccd6" font-size="11">確認済</text>
<line x1="42" y1="170" x2="478" y2="170" stroke="#5a6270"/>
<text class="k-screen-t" x="46" y="190">対処: ① 元圧バルブ ② フィルタ詰まり ③ 配管の漏れ を確認</text>
<g fill="#2d3440" stroke="#8a94a3"><rect x="42" y="200" width="100" height="24" rx="3"/><rect x="152" y="200" width="100" height="24" rx="3"/><rect x="262" y="200" width="100" height="24" rx="3"/><rect x="372" y="200" width="106" height="24" rx="3"/></g>
<text class="k-screen-t" x="92" y="216" text-anchor="middle">確認</text><text class="k-screen-t" x="202" y="216" text-anchor="middle">対処手順</text><text class="k-screen-t" x="312" y="216" text-anchor="middle">位置図</text><text class="k-screen-t" x="425" y="216" text-anchor="middle">履歴</text>
</svg>
<p class="tb-caption">図: タッチパネルのアラーム一覧。最初に出た原因アラーム (ファーストアウト) を先頭に枠で強調し、結果アラームはまとめて抑制。優先度は色と文字の両方で示し、選んだ行の対処をその場に出す。</p>
<p>概要画面では平常状態を灰色系で描き、異常だけを色 (と記号・文字) で示します (「HMI 画面の設計」の章を参照)。色は<b>意味を固定</b>して使います。表示灯の色の意味は IEC 60073 や IEC 60204-1 (JIS B 9960-1) で定められています (次章)。画面でも同じ意味に合わせ、赤 = 危険・異常、黄 = 注意、緑 = 正常・安全、青 = 指示・要対応とし、装飾目的の色は使いません。色覚の多様性に配慮し、<b>色だけで区別しない</b> (記号・文字・形・位置を併用) ことも必須です。</p>
<div class="tb-note">画面遷移、タッチボタンの大きさ、物理スイッチとの役割分担などの一般論は「機械の操作パネルと組込み画面の UX」の章を参照してください。この章ではアラームと状態表示を深掘りしました。</div>`,
    points: [
      "アラームは作業者の対応が必要なものだけ。情報やイベントはログへ",
      "10 分に 10 件を超えるとフラッド。平常時は 10 分に 1 件程度が目安",
      "ファーストアウト表示、状態に基づく抑制、グループ化、チャタリング対策",
      "合理化で原因・結果・対応・優先度・設定値を 1 件ずつ決める",
      "優先度は 3 段階程度、比率の目安は高 5 % / 中 15 % / 低 80 %",
      "平常は無彩色、異常だけ色。色の意味は規格に合わせ、色だけで区別しない",
    ],
    exercises: [
      {
        q: "ある装置のアラーム履歴では、8 時間のシフトで平均 240 件のアラームが発生していた。作業者は 1 人である。10 分あたりの件数を求め、目安と比べて評価せよ。",
        a: "240 件 / 8 時間 = 30 件/時 = <b>10 分あたり 5 件</b>。許容できる水準の目安 (10 分に 1 件程度) の約 5 倍で、作業者は常にアラームに追われている。頻発上位のアラームから、チャタリング・結果アラーム・不要なアラームを合理化する。",
      },
      {
        q: "合理化後のアラームを 500 件にしたい。優先度の比率の目安 (高 5 % / 中 15 % / 低 80 %) に従うと、それぞれ何件か。",
        a: "高 500 × 0.05 = <b>25 件</b>、中 500 × 0.15 = <b>75 件</b>、低 500 × 0.80 = <b>400 件</b>。比率は目安であり、件数を合わせることが目的ではない。",
      },
    ],
    quiz: [
      {
        q: "アラームにすべきでないものはどれか。",
        choices: ["サーボアンプ異常", "ワーク詰まりで停止", "段取り完了の通知", "安全扉が運転中に開いた"],
        answer: 2,
        explain: "段取り完了は作業者の対応を必要としないイベントです。ログやメッセージで扱います。",
      },
      {
        q: "エア圧低下のときに出るシリンダのタイムアウトアラームの扱いとして適切なのはどれか。",
        choices: ["すべて高優先度で表示する", "エア圧低下中は状態に基づいて抑制し、ログには残す", "ログからも消す", "音だけ鳴らす"],
        answer: 1,
        explain: "原因が分かっている結果アラームは抑制して原因を目立たせます。解析用にログには残します。",
      },
      {
        q: "HMI の色の使い方として適切なのはどれか。",
        choices: ["工程ごとに好きな色を付ける", "平常状態を鮮やかな緑で塗りつぶす", "平常は無彩色にし、異常を色と記号で示す", "赤を装飾に使う"],
        answer: 2,
        explain: "色の意味を固定し、異常にだけ色を使うと注意が向きます。色だけでなく記号や文字も併用します。",
      },
    ],
    lessons: ["9-1"],
  },

  {
    id: "op-signal-lights",
    part: "ux",
    title: "【中級】表示灯・シグナルタワー・音の設計",
    minutes: 20,
    level: 2,
    lead: "離れた場所から装置の状態を知らせる表示灯・シグナルタワー・ブザーは、工場全体の「共通言語」です。IEC 60204-1 / IEC 60073 の色の意味、点灯・点滅の使い分け、見える位置、音の大きさと種類を設計し、工場内でルールをそろえる方法を学びます。",
    body: `
<h2>色の意味は規格で決まっている</h2>
<p>機械の電気装置の規格 IEC 60204-1 (JIS B 9960-1) と、表示の色の基本規格 IEC 60073 は、表示灯の色に次の意味を割り当てています。</p>
<table class="tb-table">
  <tr><th>色</th><th>意味</th><th>説明</th><th>作業者の行動</th></tr>
  <tr><td>赤</td><td>非常</td><td>危険な状態</td><td>直ちに対応する (非常停止など)</td></tr>
  <tr><td>黄</td><td>異常</td><td>異常な状態、危険が迫っている</td><td>監視・介入する</td></tr>
  <tr><td>青</td><td>指示</td><td>作業者の操作が必要</td><td>指示された操作を行う</td></tr>
  <tr><td>緑</td><td>正常</td><td>正常な状態</td><td>任意</td></tr>
  <tr><td>白</td><td>中立</td><td>上記以外 (どれにも当てはまらないとき)</td><td>監視</td></tr>
</table>
<p>押しボタンの色にも規格の指定があり、たとえば非常停止は<b>赤 (背景黄)</b>、停止・切は黒・灰・白 (赤も可)、起動・入は白・灰・黒・緑が推奨されます。<b>赤を起動に使わない</b>こと、緑を危険な操作に使わないことが重要です。詳細は規格本文で確認してください。</p>

<h2>シグナルタワーの構成と運用ルール</h2>
<svg class="tb-chart" viewBox="0 0 520 244" role="img" aria-label="シグナルタワー">
<g class="k-shadow">
<path class="k-part" d="M84,14 Q100,6 116,14 L120,20 L80,20 Z"/>
<g class="k-glow"><rect x="80" y="20" width="40" height="36" style="fill:var(--tb-bad)"/><rect x="80" y="20" width="40" height="36" fill="url(#k-steel-h)" opacity="0.35"/><rect x="86" y="24" width="6" height="28" rx="3" fill="#ffffff" opacity="0.45"/></g><rect x="78" y="54" width="44" height="4" style="fill:var(--k-steel-3);stroke:var(--k-line)" stroke-width="0.8"/><g><rect x="80" y="58" width="40" height="36" style="fill:var(--tb-warn)"/><rect x="80" y="58" width="40" height="36" fill="url(#k-steel-h)" opacity="0.35"/><rect x="86" y="62" width="6" height="28" rx="3" fill="#ffffff" opacity="0.45"/></g><rect x="78" y="92" width="44" height="4" style="fill:var(--k-steel-3);stroke:var(--k-line)" stroke-width="0.8"/><g><rect x="80" y="96" width="40" height="36" style="fill:var(--tb-good)"/><rect x="80" y="96" width="40" height="36" fill="url(#k-steel-h)" opacity="0.35"/><rect x="86" y="100" width="6" height="28" rx="3" fill="#ffffff" opacity="0.45"/></g><rect x="78" y="130" width="44" height="4" style="fill:var(--k-steel-3);stroke:var(--k-line)" stroke-width="0.8"/><g><rect x="80" y="134" width="40" height="36" style="fill:var(--tb-accent)"/><rect x="80" y="134" width="40" height="36" fill="url(#k-steel-h)" opacity="0.35"/><rect x="86" y="138" width="6" height="28" rx="3" fill="#ffffff" opacity="0.45"/></g><rect x="78" y="168" width="44" height="4" style="fill:var(--k-steel-3);stroke:var(--k-line)" stroke-width="0.8"/>
<rect class="k-part" x="80" y="172" width="40" height="22" rx="2"/>
<rect class="k-part-h" x="94" y="194" width="12" height="36"/>
<rect class="k-part" x="70" y="228" width="60" height="8" rx="2"/>
</g>
<path class="k-thin" d="M84,178 L116,178 M84,183 L116,183 M84,188 L116,188"/>
<line class="k-thin" x1="122" y1="38" x2="132" y2="38"/><line class="k-thin" x1="122" y1="76" x2="132" y2="76"/><line class="k-thin" x1="122" y1="114" x2="132" y2="114"/><line class="k-thin" x1="122" y1="152" x2="132" y2="152"/><line class="k-thin" x1="122" y1="183" x2="132" y2="183"/>
<text class="lbl" x="138" y="42">赤: 異常停止 (点滅 = 未確認)</text>
<text class="lbl" x="138" y="80">黄: 警告・材料切れ予告・段取り中</text>
<text class="lbl" x="138" y="118">緑: 自動運転中</text>
<text class="lbl" x="138" y="156">青: 作業者の操作待ち (ワーク投入など)</text>
<text class="lbl" x="138" y="187">ブザー</text>
<text class="mark-t" x="330" y="222">上から 赤・黄・緑 の順が一般的</text>
</svg>
<p class="tb-caption">図: 4 段シグナルタワーの割り当て例。色の上下順は工場内で統一し、遠くからは位置でも判別できるようにする。</p>
<ul>
  <li>工場全体で<b>割り当て表</b>を統一する (装置メーカーごとに意味が違うと、夜勤の作業者が誤解する)。</li>
  <li><b>点滅</b>は注意を引き、確認や対応が必要なことを示す。確認したら点灯に変える (点滅 = 未確認、点灯 = 確認済み・継続中)。IEC 60073 は点滅の周期やデューティの推奨値も示している。</li>
  <li>すべてを点滅させると区別できなくなる。点滅はいちばん重要な状態だけ。</li>
  <li>同時に複数の色が点くときの意味 (例: 緑 + 黄 = 運転中だが予告あり) を定義する。</li>
  <li>停止理由を作業者が選べる装置では、IoT で稼働状態をログに取り、稼働率分析に使う。</li>
</ul>

<h2>見える位置</h2>
<p>シグナルタワーは、作業者が<b>次の装置へ移動しながら</b>、また<b>通路の端から</b>見えるように置きます。</p>
<ul>
  <li>装置上面の、背の高い部材に隠れない位置。複数台を受け持つ作業者の動線から見えるか、レイアウト図で確認する。</li>
  <li>点灯面の高さは、立った人の眼高より上 (ほかの作業者や台車に遮られない) が一般的。</li>
  <li>明るい工場や窓際では、LED の輝度とフードで日光下でも識別できるようにする。</li>
</ul>

<h2>音の設計</h2>
<p>音は、視線を向けていなくても気付かせることができます。一方で、うるさい音や意味の分からない音は、作業者がボリュームを下げたり止めたりする原因になります。</p>
<table class="tb-table">
  <tr><th>項目</th><th>目安・考え方</th></tr>
  <tr><td>音量</td><td>周囲騒音より十分大きく (危険信号の規格 ISO 7731 では A 特性で周囲より 15 dB 超などの基準)。大きすぎると驚愕・不快</td></tr>
  <tr><td>周波数</td><td>500〜3 000 Hz 程度が聞き取りやすい。騒音の主成分と重ならない帯域を選ぶ</td></tr>
  <tr><td>種類</td><td>連続音・断続音・メロディで区別するのは 3〜4 種類まで</td></tr>
  <tr><td>止め方</td><td>確認ボタンで音を止め、表示灯は状態が直るまで残す</td></tr>
  <tr><td>工場全体</td><td>隣の装置と同じ音にしない。音で装置を特定できるようにする</td></tr>
</table>
<p>同じ大きさの音源 2 つ:</p>
<div class="tb-math">L = L_1 + 10\\log_{10} 2 \\approx L_1 + 3\\,\\mathrm{dB}</div>
<p>聴覚保護具を着ける職場では、保護具越しに聞こえるかを確認し、聞こえにくい場合は<b>光 (回転灯・フラッシュ) や振動 (ウェアラブル)</b>を併用します。聴覚に障害のある作業者への配慮としても有効です。</p>
<div class="tb-tip"><b>3DCAD Studio</b>: 工場レイアウトのアセンブリに装置とシグナルタワーを配置し、作業者の眼高に置いたカメラ視点から各タワーが見えるかを確認しましょう。</div>`,
    points: [
      "表示灯の色: 赤 = 非常、黄 = 異常、青 = 指示、緑 = 正常、白 = 中立 (IEC 60204-1)",
      "赤を起動に使わない。非常停止は赤 (背景黄)",
      "点滅は未確認・要対応、確認後は点灯。点滅は重要な状態だけ",
      "割り当てと上下順は工場全体で統一する",
      "シグナルタワーは動線と通路の端から見える位置に",
      "音は周囲騒音より十分大きく、種類は少なく、光や振動も併用する",
    ],
    exercises: [
      {
        q: "周囲騒音が A 特性で 80 dB の職場に、周囲より 15 dB 大きいブザーを付けたい。必要な音圧レベルを求めよ。また 85 dB の同じブザーを 2 台並べたときのレベルを求めよ。",
        a: "必要レベル = 80 + 15 = <b>95 dB(A)</b> (この大きさでは耳の保護や驚愕にも注意し、光の併用を検討)。2 台: 85 + 10 log₁₀ 2 ≈ 85 + 3 = <b>88 dB</b>。2 倍の数でも 3 dB しか上がらない。",
      },
      {
        q: "ある工場では、A 社の装置は黄 = 運転中、B 社の装置は緑 = 運転中・黄 = 異常で運用している。起きうる問題と対策を述べよ。",
        a: "黄を見たときに、運転中か異常かを作業者が誤解し、異常の放置や不要な停止が起きる。対策: 規格 (IEC 60204-1: 緑 = 正常、黄 = 異常) に沿った工場共通の割り当て表を作り、装置の発注仕様に入れる。既存装置は配線または PLC の出力割り当てを変更し、変更後に表示を教育する。",
      },
    ],
    quiz: [
      {
        q: "IEC 60204-1 で、作業者の操作が必要なことを示す表示灯の色はどれか。",
        choices: ["赤", "黄", "青", "白"],
        answer: 2,
        explain: "青は「指示」で、作業者の操作が必要な状態を示します。赤は非常、黄は異常、緑は正常、白は中立です。",
      },
      {
        q: "表示灯の点滅の使い方として適切なのはどれか。",
        choices: ["すべての表示を点滅させる", "未確認・要対応の状態を点滅させ、確認後は点灯にする", "正常運転中を点滅させる", "装飾として交互に点滅させる"],
        answer: 1,
        explain: "点滅は注意を引くために、重要で未確認の状態に限って使います。",
      },
      {
        q: "同じ大きさのブザーを 2 台に増やしたときの音圧レベルの増加はおよそどれか。",
        choices: ["2 倍", "+3 dB", "+10 dB", "+20 dB"],
        answer: 1,
        explain: "エネルギーが 2 倍で 10 log₁₀ 2 ≈ 3 dB 増えます。",
      },
    ],
    lessons: ["9-1"],
  },

  {
    id: "op-daily-care",
    part: "ux",
    title: "【中級】日常保全を作業者ができる装置 — 見える化と点検ルート",
    minutes: 20,
    level: 2,
    lead: "自主保全では、清掃・給油・点検を設備の専門家ではなく、毎日使う作業者が行います。専門知識がなくても「正常か異常か」を数秒で判断できる目で見る管理、短い点検ルート、汚れにくい構造を、装置の設計に組み込む方法を学びます。",
    body: `
<h2>自主保全と装置設計</h2>
<p>TPM (全員参加の生産保全) の<b>自主保全</b>は、作業者が日常的に装置の清掃・給油・増し締め・点検を行い、劣化を早く見つける活動です。
これを続けられるかどうかは、作業者のやる気よりも<b>装置が点検しやすいか</b>で決まります。カバーを 4 本のねじで外さないと見えない油面計は、やがて誰も見なくなります。</p>
<p>点検口・給油口の集中化や清掃しやすい形など、構造面の基本は「点検・給油・清掃のしやすさ」の章で扱いました。この章では、作業者が<b>判断</b>しやすくする見える化と、日常保全の手順の設計を深掘りします。</p>

<h2>判断をなくす: 目で見る管理</h2>
<p>点検を「値を読んで基準と比べる」作業にすると、時間がかかり、判断を誤ります。<b>見ただけで正常・異常が分かる</b>表示にします。</p>
<svg class="tb-chart" viewBox="0 0 520 222" role="img" aria-label="圧力計のゾーン表示と合いマーク">
<g class="k-shadow"><circle class="k-part" cx="140" cy="120" r="78"/></g>
<circle cx="140" cy="120" r="68" style="fill:var(--tb-surface);stroke:var(--k-line)"/>
<path d="M88,150 A60,60 0 0 1 110,68" style="stroke:var(--tb-bad)" stroke-width="9" fill="none"/>
<path d="M110,68 A60,60 0 0 1 170,68" style="stroke:var(--tb-good)" stroke-width="9" fill="none"/>
<path d="M170,68 A60,60 0 0 1 192,150" style="stroke:var(--tb-bad)" stroke-width="9" fill="none"/>
<path class="k-thin" d="M84,152 L92,148 M80,120 L89,120 M88,90 L96,94 M110,66 L114,74 M140,58 L140,67 M170,66 L166,74 M192,90 L184,94 M200,120 L191,120 M196,152 L188,148" style="stroke:var(--k-line)" stroke-width="1.4"/>
<line x1="140" y1="120" x2="156" y2="70" style="stroke:var(--tb-bad)" stroke-width="3"/>
<circle cx="140" cy="120" r="6" style="fill:var(--k-line)"/>
<text class="k-note" x="140" y="160" text-anchor="middle">MPa</text>
<text class="tick" x="140" y="210" text-anchor="middle">0.4〜0.6 MPa を緑帯で表示</text>
<text class="mark-t" x="140" y="20" text-anchor="middle">針が緑にあれば正常</text>
<g class="k-shadow"><polygon class="k-part" points="356,110 343,132.5 317,132.5 304,110 317,87.5 343,87.5"/></g>
<circle cx="330" cy="110" r="9" style="fill:var(--k-steel-3);stroke:var(--k-line)"/>
<line x1="330" y1="64" x2="330" y2="156" style="stroke:var(--tb-warn)" stroke-width="3.4"/>
<text class="tick" x="330" y="180" text-anchor="middle">合いマーク</text>
<text class="mark-t" x="330" y="205" text-anchor="middle">線がずれたら緩み</text>
<g class="k-shadow"><rect class="k-part" x="420" y="46" width="50" height="118" rx="6"/></g>
<rect x="428" y="54" width="34" height="102" rx="3" style="fill:var(--tb-surface)"/>
<rect x="428" y="100" width="34" height="56" rx="3" style="fill:var(--tb-warn)" opacity="0.55"/>
<line x1="412" y1="80" x2="478" y2="80" style="stroke:var(--tb-good)" stroke-width="2"/><line x1="412" y1="130" x2="478" y2="130" style="stroke:var(--tb-bad)" stroke-width="2"/>
<text class="tick" x="482" y="84">上限</text><text class="tick" x="482" y="134">下限</text>
<text class="mark-t" x="445" y="205" text-anchor="middle">油面の上下限</text>
</svg>
<p class="tb-caption">図: 目で見る管理の例。ゾーン表示・合いマーク・上下限線で、数値を読まずに判断できる。</p>
<table class="tb-table">
  <tr><th>点検対象</th><th>見える化の方法</th></tr>
  <tr><td>圧力・温度・流量</td><td>計器に正常範囲の色帯 (ゾーンラベル)</td></tr>
  <tr><td>ボルトの緩み</td><td>合いマーク (締付後にボルトと座面にまたがる線)</td></tr>
  <tr><td>油面・液面</td><td>上下限線、のぞき窓、フロート式の液面計</td></tr>
  <tr><td>ベルトの張り</td><td>張り調整位置の基準線、たわみ量ゲージを装置に添付</td></tr>
  <tr><td>回転方向・流れ方向</td><td>矢印ラベル</td></tr>
  <tr><td>フィルタの詰まり</td><td>差圧インジケータ (色が変わる)、透明ケース</td></tr>
  <tr><td>カバー内部の動き</td><td>透明な点検窓 (ガードの安全性を保ったまま)</td></tr>
</table>
<p>ポイントは、<b>基準を装置そのものに書く</b>ことです。点検表に「0.4〜0.6 MPa」と書くより、計器に緑帯を貼るほうが確実です。</p>

<h2>点検ルートを設計する</h2>
<ul>
  <li>点検箇所に<b>番号タグ</b>を付け、番号順に装置を一周すれば全部回れるよう配置する。</li>
  <li>点検箇所を装置の<b>同じ面</b> (作業者側・通路側) に集める。裏側に回らないと見えない計器は表側に移すか、リモート表示を HMI に出す。</li>
  <li>点検表のレイアウトを、装置の写真・位置図と同じ順番にする。</li>
  <li>点検に必要な道具 (ウエス・グリースガン・ゲージ) の置き場を装置に作る (形跡管理: 道具の形の切り欠きに戻す)。</li>
  <li>点検時間の目標を決める (たとえば始業点検 5 分)。それを超える箇所は、見える化やセンサ化を検討する。</li>
</ul>
<svg class="tb-chart" viewBox="0 0 520 196" role="img" aria-label="点検ルート">
<rect x="20" y="152" width="480" height="22" style="fill:var(--tb-warn)" opacity="0.12"/>
<text class="k-note" x="30" y="168">通路</text>
<g class="k-shadow"><rect class="k-alu" x="140" y="40" width="240" height="104" rx="4"/></g>
<rect x="150" y="50" width="220" height="84" rx="2" style="fill:var(--tb-surface-2)" opacity="0.6"/>
<text class="mark-t" x="260" y="96" text-anchor="middle">装置</text>
<path d="M120,162 L390,162 Q400,162 400,150 L400,108" class="k-move" stroke-dasharray="6 4"/>
<rect x="140" y="30" width="240" height="10" style="fill:var(--tb-bad)" opacity="0.12"/>
<circle class="k-badge" cx="160" cy="162" r="10" style="fill:var(--tb-accent)"/><text class="k-badge-t" x="160" y="166" text-anchor="middle">1</text><circle class="k-badge" cx="230" cy="162" r="10" style="fill:var(--tb-accent)"/><text class="k-badge-t" x="230" y="166" text-anchor="middle">2</text><circle class="k-badge" cx="300" cy="162" r="10" style="fill:var(--tb-accent)"/><text class="k-badge-t" x="300" y="166" text-anchor="middle">3</text><circle class="k-badge" cx="370" cy="162" r="10" style="fill:var(--tb-accent)"/><text class="k-badge-t" x="370" y="166" text-anchor="middle">4</text><circle class="k-badge" cx="400" cy="95" r="10" style="fill:var(--tb-accent)"/><text class="k-badge-t" x="400" y="99" text-anchor="middle">5</text>
<text class="tick" x="260" y="190" text-anchor="middle">通路側 (作業者側) に 1〜4 を集約 → 側面の 5 で終わり</text>
<text class="tick" x="260" y="22" text-anchor="middle">裏側には点検箇所を置かない</text>
</svg>
<p class="tb-caption">図: 点検ルートの例。番号順に歩けば戻りなしで点検が終わる。</p>

<h2>汚れの発生源を断つ</h2>
<p>清掃が大変な装置は、まず<b>汚れの発生源</b>と<b>飛散範囲</b>を絞ります。切りくず・油・粉の飛散を局所カバーで囲う、受け皿で回収する、水平面を作らず傾斜させて溜まらないようにするなどです。清掃時間の短縮は、清掃道具より発生源対策のほうが効果的です。</p>

<h2>異常に気付ける仕組み</h2>
<ul>
  <li>五感点検 (音・におい・振動・熱) の基準を、動画や音声で教育に残す。</li>
  <li>給油の実施を記録できるよう、給油箇所ごとに<b>色と記号</b> (油の種類と周期) を付ける。</li>
  <li>点検で見つけた不具合に付ける<b>エフ (不具合札)</b> を下げる場所を、装置に用意する。</li>
  <li>センサで取れる値 (モータ電流、振動、温度) は HMI にトレンド表示し、日常点検の項目を減らす。</li>
</ul>
<div class="tb-tip"><b>3DCAD Studio</b>: 点検箇所の部品に色を付け、作業者側の視点から全部見えるかをビューで確認しましょう。点検窓の位置は断面図で、内部の確認したい部品が見えるかを確かめられます。</div>`,
    points: [
      "日常保全が続くかは装置の点検しやすさで決まる",
      "数値を読ませず、ゾーン表示・合いマーク・上下限線で見ただけで判断できるようにする",
      "基準は点検表ではなく装置そのものに書く",
      "点検箇所を作業者側に集め、番号順に一周できるルートにする",
      "清掃は道具より汚れの発生源・飛散範囲の対策が効く",
      "センサとトレンド表示で日常点検の項目を減らす",
    ],
    exercises: [
      {
        q: "始業点検の項目が 24 箇所あり、計器の値を読んで点検表の基準と比べるのに 1 箇所平均 25 秒かかる。ゾーン表示・合いマークで 1 箇所 8 秒に、また 6 箇所をセンサ監視 (HMI 表示) に置き換えると、点検時間はどうなるか。",
        a: "改善前: 24 × 25 = 600 秒 = <b>10 分</b>。改善後: (24 − 6) × 8 = 144 秒 ≈ <b>2.4 分</b>。HMI の確認に 30 秒かかるとしても約 3 分で、目標の 5 分以内に収まる。",
      },
      {
        q: "エア圧の正常範囲は 0.45〜0.60 MPa で、計器のフルスケールは 1.0 MPa、目盛の角度範囲は 270° である。緑帯を貼る角度範囲 (0 MPa の位置からの角度) を求めよ。",
        a: "1 MPa あたり 270°。0.45 MPa → 0.45 × 270 = <b>121.5°</b>、0.60 MPa → 0.60 × 270 = <b>162°</b>。この間 (幅 40.5°) に緑帯を貼る。",
      },
    ],
    quiz: [
      {
        q: "ボルトの緩みを作業者が数秒で見つけられる方法はどれか。",
        choices: ["トルクレンチで毎日全数確認", "合いマークを付けておく", "ボルトを塗装で隠す", "ボルトを増やす"],
        answer: 1,
        explain: "合いマークは、線がずれているかを見るだけで緩みを判断できます。",
      },
      {
        q: "点検の基準値を示す方法として最も確実なのはどれか。",
        choices: ["点検表にだけ書く", "ベテランが口頭で伝える", "計器そのものに正常範囲の色帯を付ける", "マニュアルの付録に書く"],
        answer: 2,
        explain: "基準を装置に書けば、点検者は見るだけで判断できます。",
      },
      {
        q: "清掃時間を減らす対策として最初に検討すべきものはどれか。",
        choices: ["清掃道具を高性能にする", "清掃の回数を減らす", "汚れの発生源と飛散範囲を絞る", "作業者を増やす"],
        answer: 2,
        explain: "発生源を断てば清掃そのものが減ります。局所カバー・受け皿・傾斜面などが有効です。",
      },
    ],
    lessons: ["6-1"],
  },

  {
    id: "op-learnability",
    part: "ux",
    title: "【中級】新人でも使える装置 — 学びやすさと標準作業",
    minutes: 25,
    level: 2,
    lead: "人手不足、派遣・外国人作業者の増加、ベテランの退職で、装置は「初めての人が短時間で正しく使える」ことを求められています。学習曲線で習熟を考え、標準作業を装置の構造と画面に組み込み、ガイダンスと制約で迷いや誤りを減らす方法を学びます。",
    body: `
<h2>学びやすさ (learnability) とは</h2>
<p>学びやすさとは、初めての人が<b>どれだけ早く</b>、<b>どれだけ誤りなく</b>一定の水準で作業できるようになるかです。装置では次の 3 つの場面で考えます。</p>
<table class="tb-table">
  <tr><th>場面</th><th>求められること</th><th>指標の例</th></tr>
  <tr><td>初回の使用</td><td>説明なしでも最初の一歩が分かる</td><td>初回成功率、迷った回数</td></tr>
  <tr><td>習熟期間</td><td>短期間で標準時間に到達する</td><td>標準時間到達までの日数・サイクル数</td></tr>
  <tr><td>たまにの作業</td><td>月 1 回の段取りや異常処置を忘れても再現できる</td><td>手順書なしでの成功率</td></tr>
</table>
<p>特に重要なのは 3 番目です。毎日の作業はすぐ覚えますが、<b>頻度の低い作業</b> (段取り、異常復帰、消耗品交換) は何度やっても忘れます。ここに装置側のガイダンスが最も効きます。</p>

<h2>学習曲線</h2>
<p>繰り返しで作業時間が短くなる様子は<b>学習曲線</b>で表せます。代表的な式では、累積回数が 2 倍になるごとに作業時間が一定の比率 (習熟率) になります。</p>
<div class="tb-math">T_n = T_1 \\times n^{b} \\qquad b = \\log_2(\\text{習熟率})</div>
<p>(習熟率 80 % なら <span class="tb-m">b = \log_2 0.8 \approx -0.322</span>)</p>
<svg class="tb-chart" viewBox="0 0 520 220" role="img" aria-label="学習曲線">
<line class="grid" x1="50" y1="100" x2="500" y2="100"/><line class="grid" x1="50" y1="60" x2="500" y2="60"/>
<path d="M60,40 C90,110 130,140 200,155 C280,168 380,174 490,178 L490,179 C380,176 280,172 200,162 C130,150 90,130 60,90 Z" style="fill:var(--tb-good)" opacity="0.12"/>
<line class="axis" x1="50" y1="190" x2="504" y2="190" marker-end="url(#k-arrow)"/><line class="axis" x1="50" y1="190" x2="50" y2="14" marker-end="url(#k-arrow)"/>
<line x1="50" y1="170" x2="500" y2="170" style="stroke:var(--tb-text-3)" stroke-dasharray="6 3"/><text class="tick" x="495" y="165" text-anchor="end">標準時間</text>
<path d="M60,40 C90,110 130,140 200,155 C280,168 380,174 490,178" fill="none" style="stroke:var(--tb-bad)" stroke-width="2.8"/>
<path d="M60,90 C90,130 130,150 200,162 C280,172 380,176 490,179" fill="none" style="stroke:var(--tb-good)" stroke-width="2.8"/>
<circle cx="60" cy="40" r="4" style="fill:var(--tb-bad)"/><circle cx="60" cy="90" r="4" style="fill:var(--tb-good)"/>
<text class="k-bad-t" x="100" y="45">ガイダンスなし</text><text class="k-good-t" x="120" y="110">ガイダンス・ポカヨケあり</text>
<text class="lbl" x="495" y="208" text-anchor="end">累積の作業回数</text>
<text class="lbl" x="36" y="105" text-anchor="middle" transform="rotate(-90 36 105)">作業時間</text>
</svg>
<p class="tb-caption">図: 装置にガイダンスと制約があると、初回の時間が短くなり、標準時間に早く届く (概念図)。</p>
<p>設計の目標は、曲線の<b>始点を下げる</b> (初回から迷わない) ことと、<b>早く平らにする</b> (覚えることを減らす) ことです。</p>

<h2>標準作業を装置に組み込む</h2>
<p>トヨタ生産方式の<b>標準作業</b>は、タクトタイム・作業順序・標準手持ち (工程内の仕掛り) の 3 要素で作業を定めたものです。標準作業票や作業要領書で教えますが、紙の手順は守られなくなることがあります。装置の構造と制御で、<b>標準どおりにしかできない</b>ようにします。</p>
<table class="tb-table">
  <tr><th>手段</th><th>例</th></tr>
  <tr><td>順序の強制</td><td>部品棚のピッキングランプ (取る順に点灯、取ると消灯)、締付順をナットランナが指示</td></tr>
  <tr><td>物理的な制約</td><td>向きを間違えると入らない治具、正しい部品しか入らない形状</td></tr>
  <tr><td>確認の自動化</td><td>ねじ本数カウント、トルク OK 信号、カメラでの部品有無検査</td></tr>
  <tr><td>手順の表示</td><td>HMI やタブレットに写真・動画の作業指示、現在のステップを強調</td></tr>
  <tr><td>アフォーダンス</td><td>つかむ場所の形と色、押す場所のくぼみ、引く方向の矢印</td></tr>
</table>
<svg class="tb-chart" viewBox="0 0 520 170" role="img" aria-label="ピッキングランプ">
<g class="k-shadow"><rect class="k-part" x="40" y="40" width="440" height="80" rx="3"/></g>
<rect x="50" y="48" width="420" height="6" rx="2" style="fill:var(--k-steel-3)"/>
<g class="k-shadow"><path class="k-plastic" d="M60,70 L130,70 L130,110 L60,110 Z"/><path d="M60,70 L130,70 L122,82 L68,82 Z" style="fill:var(--k-plastic-2)" opacity="0.6"/><path class="k-plastic" d="M150,70 L220,70 L220,110 L150,110 Z"/><path d="M150,70 L220,70 L212,82 L158,82 Z" style="fill:var(--k-plastic-2)" opacity="0.6"/><path class="k-plastic" d="M240,70 L310,70 L310,110 L240,110 Z"/><path d="M240,70 L310,70 L302,82 L248,82 Z" style="fill:var(--k-plastic-2)" opacity="0.6"/><path class="k-plastic" d="M330,70 L400,70 L400,110 L330,110 Z"/><path d="M330,70 L400,70 L392,82 L338,82 Z" style="fill:var(--k-plastic-2)" opacity="0.6"/></g>
<rect x="85" y="44" width="20" height="14" rx="3" fill="#2f333a"/><rect x="265" y="44" width="20" height="14" rx="3" fill="#2f333a"/><rect x="355" y="44" width="20" height="14" rx="3" fill="#2f333a"/>
<g class="k-glow"><rect x="175" y="44" width="20" height="14" rx="3" style="fill:var(--tb-good)"/></g>
<text x="185" y="55" text-anchor="middle" font-size="11" font-weight="700" fill="#ffffff">2</text>
<rect x="420" y="62" width="14" height="14" rx="2" fill="#2f333a"/><circle cx="427" cy="69" r="3" fill="#e53935"/>
<line x1="420" y1="69" x2="64" y2="69" style="stroke:#e53935" stroke-width="1.2" stroke-dasharray="3 3" opacity="0.8"/>
<text class="tick" x="95" y="140" text-anchor="middle">済</text><text class="mark-t" x="185" y="140" text-anchor="middle">次はここ (2 個)</text><text class="tick" x="275" y="140" text-anchor="middle">B</text><text class="tick" x="365" y="140" text-anchor="middle">C</text>
<text class="tick" x="452" y="140" text-anchor="middle">光電センサで</text><text class="tick" x="452" y="156" text-anchor="middle">取出しを検知</text>
</svg>
<p class="tb-caption">図: ピッキングランプ。取る棚だけを点灯させ、違う棚に手を入れたら警告する。品種が多いほど効果が大きい。</p>

<h2>装置上のガイダンス</h2>
<ul>
  <li><b>その場に情報</b>: 手順書を探しに行かせない。装置の該当箇所に、ラベル・QR コード (動画手順へ)・HMI の手順画面を置く。</li>
  <li><b>写真と矢印</b>: 文章より、実物の写真に動きの矢印を描いたほうが言語に依存しない。</li>
  <li><b>今どこか</b>: 段取りや異常復帰では、手順の全体と現在位置 (ステップ 3 / 7) を示す。</li>
  <li><b>やり直せる</b>: 誤操作しても前の状態に戻れる (原点復帰、ステップ戻し)。怖がらずに操作できる。</li>
  <li><b>多言語と用語</b>: 画面とラベルの用語を統一し (同じものを「治具」「ジグ」「固定具」と呼ばない)、翻訳しやすい短文にする。</li>
  <li><b>レベル別</b>: 作業者・リーダー・保全でログイン権限を分け、新人の画面には必要な操作だけを出す。</li>
</ul>
<div class="tb-note">ガイダンスは熟練者には邪魔になることもあります。慣れた人は表示を省略できる、ショートカットがある、などの<b>段階的な表示</b>を用意します。ただし安全に関わる確認は省略させません。</div>

<h2>教え方と装置: TWI-JI との対応</h2>
<p>現場の教え方として広く使われる TWI の仕事の教え方 (JI) は、作業を「主なステップ」「急所 (成否・安全・やりやすさを左右する点)」「急所の理由」に分けて教えます。装置設計ではこの<b>急所</b>を構造で解決できないかを考えます。「ここで指を挟みやすい」が急所なら、教えるより挟まれない形にするほうが確実です。</p>
<div class="tb-tip"><b>3DCAD Studio</b>: 治具の誤装着防止形状は、間違った向きのアセンブリを作って干渉解析で確実に当たることを確認しましょう。作業指示用の分解図や画像もアセンブリから作れます。</div>`,
    points: [
      "学びやすさは初回の使用・習熟期間・たまにの作業の 3 場面で考える",
      "頻度の低い作業 (段取り・異常復帰) にこそ装置上のガイダンスが効く",
      "学習曲線 Tₙ = T₁ × n^b。始点を下げ、早く平らにする",
      "標準作業は順序の強制・物理的制約・確認の自動化で装置に組み込む",
      "情報はその場に、写真と矢印で、現在位置とやり直しを示す",
      "教えている急所は、構造で解決できないかを考える",
    ],
    exercises: [
      {
        q: "ある組立作業の初回の時間が 10 分、習熟率 80 % の学習曲線に従うとする。8 回目の作業時間を求めよ。また標準時間が 3 分のとき、何回目でおおよそ到達するか。",
        a: "b = log₂ 0.8 ≈ −0.322。T₈ = 10 × 8^(−0.322) = 10 × 0.8³ = <b>5.12 分</b> (回数が 2 倍になるごとに 0.8 倍)。3 分に達するのは 10 × n^b = 3 → n = 0.3^(1/b) = 0.3^(−3.106) ≈ <b>約 42 回目</b> (log 0.3 / log 0.8 ≈ 5.40 回の倍増 → 2^5.40 ≈ 42)。",
      },
      {
        q: "前問で、ガイダンスと治具のポカヨケにより初回の時間が 6 分になった (習熟率は同じ)。標準時間 3 分に達するのは何回目か。",
        a: "6 × n^b = 3 → n^b = 0.5。回数が 2 倍になるごとに 0.8 倍なので、0.5 = 0.8^k → k = log 0.5 / log 0.8 ≈ 3.11 回の倍増 → n = 2^3.11 ≈ <b>約 9 回目</b>。習熟期間が約 42 回から約 9 回に短縮される。",
      },
    ],
    quiz: [
      {
        q: "装置上のガイダンスが最も効果を発揮する作業はどれか。",
        choices: ["毎サイクル繰り返す作業", "月に 1 回の段取りや異常復帰", "運転ボタンを押すだけの作業", "見学者の案内"],
        answer: 1,
        explain: "頻度の低い作業は何度やっても忘れやすく、その場のガイダンスが最も効きます。",
      },
      {
        q: "標準作業の 3 要素として正しい組み合わせはどれか。",
        choices: ["タクトタイム・作業順序・標準手持ち", "品質・コスト・納期", "整理・整頓・清掃", "計画・実行・評価"],
        answer: 0,
        explain: "標準作業はタクトタイム、作業順序、標準手持ちの 3 要素で定めます。",
      },
      {
        q: "「ここで指を挟みやすいので注意」という急所への対策として、装置設計者が最初に検討すべきものはどれか。",
        choices: ["注意ラベルを大きくする", "教育時間を倍にする", "挟まれない形状・すき間にする", "ベテランだけが作業する"],
        answer: 2,
        explain: "教えるより構造で危険そのものをなくすほうが確実です (本質的安全設計の考え方)。",
      },
    ],
    lessons: ["5-1", "6-1"],
  },

  {
    id: "op-ux-eval",
    part: "ux",
    title: "【上級】装置 UX の評価 — 作業分析・時間研究・作業者テスト",
    minutes: 30,
    level: 3,
    lead: "装置の作業性は、設計者の机上の想像では分かりません。作業を階層的に分解するタスク分析、動作と時間を測る時間研究、実際の作業者によるユーザビリティテスト、NASA-TLX による主観的負担の測定を組み合わせ、試作機や現行機を評価して改善につなげる方法を学びます。",
    body: `
<h2>何を、いつ評価するか</h2>
<table class="tb-table">
  <tr><th>段階</th><th>評価の対象</th><th>手法の例</th></tr>
  <tr><td>構想</td><td>現行機の作業、類似装置の不満</td><td>現場観察、タスク分析、作業者インタビュー</td></tr>
  <tr><td>設計</td><td>3D モデル・レイアウト</td><td>マネキンによる姿勢・リーチ確認、ウォークスルー</td></tr>
  <tr><td>試作</td><td>段ボール・3D プリントのモックアップ、試作機</td><td>作業者テスト、時間研究、NASA-TLX</td></tr>
  <tr><td>立上げ後</td><td>量産での使われ方</td><td>アラーム・停止ログ、チョコ停分析、再評価</td></tr>
</table>
<p>早い段階ほど変更が安く済みます。段ボールと木材で<b>原寸モックアップ</b>を作り、作業者にワークの投入や段取りを演じてもらうだけでも、高さやすき間の問題の多くが見つかります。</p>

<h2>階層的タスク分析 (HTA)</h2>
<p>作業を<b>目標 → サブ目標 → 操作</b>に分解し、各操作の順序や条件 (プラン) を書いたものが階層的タスク分析です。分解すると、手順の多い所、判断が必要な所、誤りが起きやすい所が見えてきます。</p>
<svg class="tb-chart" viewBox="0 0 520 214" role="img" aria-label="階層的タスク分析">
<g class="k-shadow">
<rect x="180" y="10" width="160" height="30" rx="5" style="fill:var(--tb-accent)"/>
<rect x="25" y="75" width="110" height="30" rx="5" style="fill:var(--tb-surface);stroke:var(--k-line-2)" stroke-width="1"/><text class="tick" x="80" y="94" text-anchor="middle">1 品種を選ぶ</text><rect x="145" y="75" width="110" height="30" rx="5" style="fill:var(--tb-surface);stroke:var(--k-line-2)" stroke-width="1"/><text class="tick" x="200" y="94" text-anchor="middle">2 治具を交換</text><rect x="265" y="75" width="110" height="30" rx="5" style="fill:var(--tb-surface);stroke:var(--tb-bad)" stroke-width="2"/><text class="tick" x="320" y="94" text-anchor="middle">3 原点を合わせる</text><rect x="385" y="75" width="110" height="30" rx="5" style="fill:var(--tb-surface);stroke:var(--k-line-2)" stroke-width="1"/><text class="tick" x="440" y="94" text-anchor="middle">4 初品を確認</text>
</g>
<text class="lbl" x="260" y="30" text-anchor="middle" style="fill:#fff">0 品種を切り替える</text>
<path class="k-thin" d="M260,40 L260,60 M80,60 L440,60 M80,60 L80,75 M200,60 L200,75 M320,60 L320,75 M440,60 L440,75 M320,105 L320,125 M310,125 L330,125"/>
<rect x="196" y="126" width="248" height="58" rx="5" style="fill:var(--tb-surface-2)"/>
<text class="tick" x="320" y="142" text-anchor="middle">3.1 手動モードにする</text>
<text class="k-bad-t" x="320" y="160" text-anchor="middle" style="font-size:11px">3.2 軸を目盛りに合わせる ← 誤りが多い</text>
<text class="tick" x="320" y="177" text-anchor="middle">3.3 原点を登録する</text>
<text class="mark-t" x="20" y="204">プラン 0: 1 → 2 → 3 → 4。4 で NG なら 3 に戻る</text>
</svg>
<p class="tb-caption">図: 段取り替えの HTA (抜粋)。誤りの多い操作 3.2 は、ストッパやレシピ連動で操作そのものをなくす候補になる。</p>
<p>各操作に「起こりうる誤り」「誤りの結果」「回復方法」を表で付けると、ヒューマンエラーの事前評価 (SHERPA などの手法) になります。</p>

<h2>時間研究と動作研究</h2>
<p>ビデオで作業を撮影し、要素作業に分けて時間を測ります。<b>主体作業</b> (付加価値を生む) と、<b>付随作業・ムダ</b> (歩行、持ち替え、探す、待つ) に分類すると、装置で減らせる部分が分かります。</p>
<div class="tb-math">\\begin{aligned} \\text{正味時間} &= \\text{観測時間} \\\\ &\\quad \\times \\text{レイティング係数} \\\\ \\text{標準時間} &= \\text{正味時間} \\\\ &\\quad \\times (1 + \\text{余裕率}) \\end{aligned}</div>
<p>レイティングは、観測した作業者の速さを標準的な速さに補正する係数です (速い人なら 1 より大きい)。余裕率は疲労や用達などの余裕を加えるものです。</p>
<table class="tb-table">
  <tr><th>要素作業</th><th>時間 (秒)</th><th>分類</th><th>装置での対策</th></tr>
  <tr><td>ワークを台車から取る</td><td>4</td><td>付随</td><td>台車と受け台の高さをそろえる</td></tr>
  <tr><td>扉を開ける</td><td>3</td><td>付随</td><td>自動扉・ライトカーテン</td></tr>
  <tr><td>治具にセット・向き確認</td><td>9</td><td>主体 + 判断</td><td>向きポカヨケ治具</td></tr>
  <tr><td>操作盤へ歩いて起動</td><td>5</td><td>ムダ</td><td>両手起動ボタンを治具の正面に</td></tr>
  <tr><td>加工待ち</td><td>20</td><td>待ち</td><td>2 台持ち、次ワークの準備</td></tr>
</table>
<p>動作研究では、ギルブレスのサーブリッグ (探す・選ぶ・つかむ・運ぶ・位置決め など 18 前後の基本動作) で手の動きを記録し、「探す」「選ぶ」「持ち直す」のような非効率な動作をなくします。MTM などの<b>既定時間標準法</b>を使えば、装置ができる前に動作から時間を見積もれます。</p>

<h2>作業者によるユーザビリティテスト</h2>
<ul>
  <li><b>参加者</b>: 実際に使う作業者 (新人と熟練者の両方、体格の小さい人と大きい人、手袋の着用者)。設計者や営業担当は代わりにならない。</li>
  <li><b>タスク</b>: 通常運転だけでなく、段取り、異常復帰、消耗品交換など頻度の低い作業を必ず含める。</li>
  <li><b>方法</b>: 手順書なしで実施してもらい、考えていることを声に出してもらう (思考発話法)。手を貸さず、詰まった場所と理由を記録する。</li>
  <li><b>測定</b>: 成功率、時間、誤り・やり直しの回数、ヘルプの要求回数、主観的負担 (NASA-TLX)。</li>
  <li><b>人数</b>: 主な問題を見つけるだけなら 5 人程度でも多くが見つかるとされる。数値の比較には人数を増やす。</li>
  <li><b>実環境</b>: 手袋、保護めがね、騒音、照明、作業服など実際の条件で行う。</li>
</ul>

<h2>NASA-TLX による主観的作業負担</h2>
<p>NASA-TLX は、作業負担を 6 つの尺度で 0〜100 に評定してもらう方法です。</p>
<table class="tb-table">
  <tr><th>尺度</th><th>問い</th></tr>
  <tr><td>知的・知覚的要求</td><td>考える・判断する・覚える・見ることがどれだけ必要だったか</td></tr>
  <tr><td>身体的要求</td><td>押す・引く・持ち上げるなど体の活動がどれだけ必要だったか</td></tr>
  <tr><td>タイムプレッシャー</td><td>時間に追われる感じがどれだけあったか</td></tr>
  <tr><td>作業成績</td><td>目標をどれだけ達成できたと思うか (うまくできたほど負担は低い側)</td></tr>
  <tr><td>努力</td><td>その成績のためにどれだけ頑張ったか</td></tr>
  <tr><td>フラストレーション</td><td>不安・いらいら・ストレスをどれだけ感じたか</td></tr>
</table>
<div class="tb-math">\\begin{aligned} \\text{重み付き TLX} &= \\dfrac{\\sum(\\text{評定} \\times \\text{重み})}{15} \\\\ \\text{Raw TLX} &= \\text{6 尺度の評定の平均} \\end{aligned}</div>
<p>(重みは 15 通りの一対比較で選ばれた回数、合計 15)</p>
<svg class="tb-chart" viewBox="0 0 520 200" role="img" aria-label="NASA-TLX の改善前後">
<line class="grid" x1="60" y1="130" x2="500" y2="130"/><line class="grid" x1="60" y1="90" x2="500" y2="90"/><line class="grid" x1="60" y1="50" x2="500" y2="50"/>
<g class="k-shadow"><rect x="88" y="65" width="16" height="105" rx="3" style="fill:var(--tb-bad)" fill-opacity="1"/><rect x="106" y="110" width="16" height="60" rx="3" style="fill:var(--tb-good)" fill-opacity="1"/><rect x="158" y="125" width="16" height="45" rx="3" style="fill:var(--tb-bad)" fill-opacity="1"/><rect x="176" y="133" width="16" height="37" rx="3" style="fill:var(--tb-good)" fill-opacity="1"/><rect x="228" y="50" width="16" height="120" rx="3" style="fill:var(--tb-bad)" fill-opacity="1"/><rect x="246" y="95" width="16" height="75" rx="3" style="fill:var(--tb-good)" fill-opacity="1"/><rect x="298" y="110" width="16" height="60" rx="3" style="fill:var(--tb-bad)" fill-opacity="1"/><rect x="316" y="133" width="16" height="37" rx="3" style="fill:var(--tb-good)" fill-opacity="1"/><rect x="368" y="80" width="16" height="90" rx="3" style="fill:var(--tb-bad)" fill-opacity="1"/><rect x="386" y="118" width="16" height="52" rx="3" style="fill:var(--tb-good)" fill-opacity="1"/><rect x="438" y="95" width="16" height="75" rx="3" style="fill:var(--tb-bad)" fill-opacity="1"/><rect x="456" y="140" width="16" height="30" rx="3" style="fill:var(--tb-good)" fill-opacity="1"/></g>
<line class="axis" x1="60" y1="170" x2="500" y2="170"/>
<text class="tick" x="105" y="186" text-anchor="middle">知的</text><text class="tick" x="175" y="186" text-anchor="middle">身体</text><text class="tick" x="245" y="186" text-anchor="middle">時間</text><text class="tick" x="315" y="186" text-anchor="middle">成績</text><text class="tick" x="385" y="186" text-anchor="middle">努力</text><text class="tick" x="455" y="186" text-anchor="middle">不満</text>
<rect x="70" y="14" width="12" height="12" rx="2" style="fill:var(--tb-bad)"/><text class="tick" x="86" y="24">改善前</text><rect x="150" y="14" width="12" height="12" rx="2" style="fill:var(--tb-good)"/><text class="tick" x="166" y="24">改善後 (段取りガイダンス導入)</text>
</svg>
<p class="tb-caption">図: 段取り作業の NASA-TLX 評定の比較 (架空のデータ)。知的要求とタイムプレッシャーが大きく下がった。</p>
<div class="tb-note">NASA-TLX は主観評価です。同じ作業者・同じタスクで改善前後を比べる使い方が向いています。人どうしの絶対値の比較には注意します。SUS などの満足度尺度や、成功率・時間の指標は「UX を数字で測る」の章も参照してください。</div>

<h2>評価から改善へ</h2>
<div class="tb-flow"><span>観察・測定</span><span>問題の一覧化 (頻度 × 重大度)</span><span>原因を装置の構造・画面に帰着</span><span>対策案と試作</span><span>同じ方法で再評価</span></div>
<p>見つかった問題は「作業者の不注意」で終わらせず、<b>装置のどの寸法・形・表示・手順が</b>その行動を引き起こしたかに帰着させます。改善後は<b>同じタスク・同じ指標</b>で再評価し、効果を数字で示します。</p>
<div class="tb-tip"><b>3DCAD Studio</b>: モックアップ用の部品は 3D プリントで試作し、作業者テストの指摘はパラメータを変えて素早く次の案に反映しましょう。</div>`,
    points: [
      "評価は早いほど安い。原寸モックアップでも多くの問題が見つかる",
      "HTA で作業を分解し、誤りの多い操作を構造でなくす候補にする",
      "時間研究で主体作業とムダ・待ちを分け、標準時間 = 正味時間 × (1 + 余裕率)",
      "作業者テストは実際の作業者・実環境で、頻度の低い作業も含める",
      "NASA-TLX は 6 尺度の主観負担。同じ人・同じタスクで前後比較に使う",
      "問題は装置の寸法・形・表示・手順に帰着させ、同じ指標で再評価する",
    ],
    exercises: [
      {
        q: "ある作業者の NASA-TLX 評定が、知的 70、身体 30、時間 80、成績 40、努力 60、不満 50 で、一対比較による重みが知的 4、身体 1、時間 5、成績 2、努力 2、不満 1 (合計 15) だった。重み付き TLX と Raw TLX を求めよ。",
        a: "重み付き: (70×4 + 30×1 + 80×5 + 40×2 + 60×2 + 50×1) / 15 = (280 + 30 + 400 + 80 + 120 + 50) / 15 = 960 / 15 = <b>64</b>。Raw: (70 + 30 + 80 + 40 + 60 + 50) / 6 = 330 / 6 = <b>55</b>。重みの大きい時間と知的要求が高いため、重み付きのほうが大きくなった。",
      },
      {
        q: "ワークのセット作業の観測時間の平均が 50 秒、レイティング係数 1.10、余裕率 15 % のとき、標準時間を求めよ。",
        a: "正味時間 = 50 × 1.10 = 55 秒。標準時間 = 55 × (1 + 0.15) = <b>63.25 秒 (約 63 秒)</b>。",
      },
      {
        q: "時間研究で、1 サイクル 41 秒のうち、主体作業 9 秒、付随作業 7 秒、歩行 5 秒、待ち 20 秒だった。作業者の手が付加価値を生んでいる比率を求め、装置側の対策を 2 つ挙げよ。",
        a: "9 / 41 ≈ <b>22 %</b>。対策例: 起動ボタンを治具の正面に置いて歩行 5 秒をなくす、台車と受け台の高さをそろえ自動扉にして付随作業を減らす、加工待ち 20 秒の間に別装置や次ワークの準備ができる配置にする。",
      },
    ],
    quiz: [
      {
        q: "装置の作業者テストの参加者として最も適切なのはどれか。",
        choices: ["装置の設計者", "営業担当者", "実際に装置を使う新人と熟練の作業者", "経営者"],
        answer: 2,
        explain: "設計者は構造を知っているため、迷う場所が分かりません。実際のユーザ、特に新人を含めることが重要です。",
      },
      {
        q: "NASA-TLX の尺度に含まれないものはどれか。",
        choices: ["身体的要求", "タイムプレッシャー", "フラストレーション", "装置の価格"],
        answer: 3,
        explain: "NASA-TLX は知的要求・身体的要求・タイムプレッシャー・作業成績・努力・フラストレーションの 6 尺度です。",
      },
      {
        q: "観測時間 40 秒、レイティング 0.9、余裕率 10 % の標準時間はどれか。",
        choices: ["36.0 秒", "39.6 秒", "44.0 秒", "48.4 秒"],
        answer: 1,
        explain: "正味時間 = 40 × 0.9 = 36 秒、標準時間 = 36 × 1.1 = 39.6 秒です。",
      },
    ],
    lessons: ["7-2", "9-1"],
  },
];
