import type { TextChapter } from "../types";

/** 押しボタン (ベゼル + 色付きボタン + ハイライト) */
function btn(cx: number, cy: number, r: number, fill: string, stroke = "#00000055"): string {
  return `<circle class="k-part" cx="${cx}" cy="${cy}" r="${r + 5}"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="1.2"/><ellipse cx="${cx - r * 0.35}" cy="${cy - r * 0.4}" rx="${r * 0.4}" ry="${r * 0.22}" fill="#fff" opacity="0.35"/>`;
}

const PANEL_FRONT = `<svg class="tb-chart" viewBox="0 0 520 262" role="img" aria-label="操作盤の正面配置例">
<text class="k-title lbl" x="260" y="18" text-anchor="middle">操作盤の配置例 (正面)</text>
<g class="k-shadow"><rect class="k-part" x="20" y="28" width="480" height="222" rx="10"/></g>
<rect class="k-alu" x="30" y="38" width="460" height="202" rx="6"/>
<circle class="k-led-g" cx="62" cy="62" r="9"/><circle class="k-led-off" cx="122" cy="62" r="9"/><circle class="k-led-off" cx="182" cy="62" r="9"/>
<text class="tick" x="62" y="88" text-anchor="middle">運転中</text><text class="tick" x="122" y="88" text-anchor="middle">準備完了</text><text class="tick" x="182" y="88" text-anchor="middle">異常</text>
<circle class="k-part" cx="280" cy="62" r="15"/><rect x="277" y="48" width="6" height="28" rx="2" fill="#2b2f36" transform="rotate(40 280 62)"/>
<text class="tick" x="246" y="58" text-anchor="end">手動</text><text class="tick" x="314" y="58">自動</text><text class="tick" x="280" y="92" text-anchor="middle">モード (キー)</text>
<rect x="40" y="100" width="140" height="130" rx="5" fill="none" class="k-thin" stroke-dasharray="4 3"/>
<rect x="190" y="100" width="150" height="130" rx="5" fill="none" class="k-thin" stroke-dasharray="4 3"/>
<text class="tick" x="110" y="116" text-anchor="middle">準備・リセット</text><text class="tick" x="265" y="116" text-anchor="middle">運転</text>
${btn(78, 160, 13, "#f2f2f2")}${btn(144, 160, 13, "#1e63c6")}
<circle cx="225" cy="160" r="21" class="k-rubber"/>${btn(225, 160, 11, "#2e9e4a")}
${btn(300, 160, 16, "#2b2f36")}
<text class="tick" x="78" y="198" text-anchor="middle">運転準備</text><text class="tick" x="144" y="198" text-anchor="middle">リセット</text>
<text class="tick" x="225" y="198" text-anchor="middle">起動</text><text class="tick" x="225" y="214" text-anchor="middle">(ガード付)</text>
<text class="tick" x="300" y="198" text-anchor="middle">停止</text><text class="tick" x="300" y="214" text-anchor="middle">(突出形)</text>
<circle class="k-yellow" cx="420" cy="140" r="40"/><circle class="k-part" cx="420" cy="140" r="27"/><circle class="k-estop" cx="420" cy="140" r="23"/>
<text class="tick" x="420" y="200" text-anchor="middle">非常停止</text><text class="tick" x="420" y="216" text-anchor="middle">(赤・黄色背景)</text>
</svg>
<p class="tb-caption">図: 機能と操作順でグループに分け (準備 → 運転)、起動は誤って押されにくいガード付き、停止は押しやすい突出形、非常停止は他と離して黄色の背景に置く。</p>`;

const PANEL_SIDE = `<svg class="tb-chart" viewBox="0 0 520 262" role="img" aria-label="操作盤の取付高さ (側面)">
<text class="k-title lbl" x="260" y="18" text-anchor="middle">取付高さの考え方 (側面)</text>
<rect x="240" y="110" width="110" height="40" style="fill:var(--tb-accent)" opacity="0.15"/>
<line class="k-thin" x1="60" y1="240" x2="60" y2="70"/>
<g class="tick"><text x="54" y="244" text-anchor="end">0</text><text x="54" y="194" text-anchor="end">0.5</text><text x="54" y="144" text-anchor="end">1.0</text><text x="54" y="94" text-anchor="end">1.5 m</text></g>
<path class="k-thin" d="M56,240 H64 M56,190 H64 M56,140 H64 M56,90 H64"/>
<g class="k-shadow"><rect class="k-part" x="272" y="138" width="56" height="102"/><path class="k-part" d="M262,138 L332,138 L332,104 L262,128 Z"/></g>
<circle class="k-yellow" cx="312" cy="114" r="6"/><circle class="k-estop" cx="312" cy="114" r="4"/><circle cx="286" cy="124" r="3" fill="#2e9e4a"/><circle cx="296" cy="121" r="3" fill="#2b2f36"/>
<circle class="k-person" cx="196" cy="82" r="12"/>
<path class="k-person" d="M184,98 Q196,92 208,98 L212,150 L206,240 L198,240 L196,166 L194,240 L186,240 L180,150 Z"/>
<path class="k-person" d="M203,102 Q211,98 214,104 L262,126 Q264,132 259,134 L206,116 Z"/>
<circle class="k-skin" cx="263" cy="129" r="4"/>
<rect class="k-ground" x="40" y="240" width="460" height="8"/>
<line class="k-hidden" x1="240" y1="180" x2="350" y2="180"/>
<text class="lbl" x="356" y="126">主な操作域の目安</text><text class="lbl" x="356" y="142">床から 0.9〜1.3 m</text>
<text class="lbl" x="356" y="178">0.6 m: 操作具の下限</text><text class="tick" x="356" y="194">(IEC 60204-1)</text>
</svg>
<p class="tb-caption">図: 頻繁に使う操作具はひじ高さ付近の帯に集め、床上 0.6 m より低い位置には置かない。非常停止は通常の作業位置から手を伸ばせば届く位置に。</p>`;

const OVERVIEW = `<svg class="tb-chart" viewBox="0 0 520 262" role="img" aria-label="概要画面 (ハイパフォーマンス HMI)">
<g class="k-shadow"><rect class="k-part" x="20" y="8" width="480" height="246" rx="10"/></g>
<rect class="k-screen" x="32" y="20" width="456" height="210" rx="3"/>
<rect x="32" y="20" width="456" height="24" fill="#2d3440"/>
<text class="k-screen-t" x="42" y="36" font-weight="700">概要</text><text class="k-screen-t" x="104" y="36">自動運転</text><text class="k-screen-t" x="200" y="36">山田 (オペレータ)</text><text class="k-screen-t" x="478" y="36" text-anchor="end">14:32</text>
<rect x="60" y="108" width="400" height="8" fill="#5a6270"/>
<g fill="#3a414c" stroke="#8a94a3"><rect x="70" y="60" width="70" height="44" rx="3"/><rect x="170" y="60" width="70" height="44" rx="3"/><rect x="370" y="60" width="70" height="44" rx="3"/></g>
<rect x="270" y="60" width="70" height="44" rx="3" fill="#3a414c" stroke="#e53935" stroke-width="2.4"/>
<text class="k-screen-t" x="105" y="86" text-anchor="middle">工程1</text><text class="k-screen-t" x="205" y="86" text-anchor="middle">工程2</text><text class="k-screen-t" x="305" y="86" text-anchor="middle">工程3</text><text class="k-screen-t" x="405" y="86" text-anchor="middle">工程4</text>
<path d="M330,52 L342,72 L318,72 Z" fill="#e53935"/><text x="330" y="70" text-anchor="middle" fill="#fff" font-size="11" font-weight="700">!</text>
<g fill="#9aa3b0"><rect x="120" y="102" width="10" height="6"/><rect x="220" y="102" width="10" height="6"/><rect x="420" y="102" width="10" height="6"/></g>
<text x="305" y="132" text-anchor="middle" fill="#ff8a80" font-size="11">エア圧低下</text>
<text class="k-screen-t" x="46" y="160">生産数 1 248 / 1 500</text><text class="k-screen-t" x="46" y="182">稼働率 87 %</text>
<line x1="250" y1="154" x2="470" y2="154" stroke="#8a94a3" stroke-dasharray="3 3"/>
<polyline points="250,182 270,178 290,184 310,176 330,180 350,174 370,179 390,172 410,177 430,170 450,166 470,160" fill="none" stroke="#c5ccd6" stroke-width="1.6"/>
<text class="k-screen-t" x="470" y="196" text-anchor="end" font-size="10">エア圧トレンド (破線 = 下限)</text>
<g fill="#2d3440" stroke="#5a6270"><rect x="40" y="204" width="100" height="22" rx="3" stroke="#c5ccd6"/><rect x="152" y="204" width="100" height="22" rx="3"/><rect x="264" y="204" width="100" height="22" rx="3"/><rect x="376" y="204" width="100" height="22" rx="3"/></g>
<text class="k-screen-t" x="90" y="219" text-anchor="middle">概要</text><text class="k-screen-t" x="202" y="219" text-anchor="middle">ユニット</text><text class="k-screen-t" x="314" y="219" text-anchor="middle">アラーム</text><text class="k-screen-t" x="426" y="219" text-anchor="middle">設定</text>
<circle cx="354" cy="208" r="8" fill="#e53935"/><text x="354" y="212" text-anchor="middle" fill="#fff" font-size="10">1</text>
</svg>
<p class="tb-caption">図: ハイパフォーマンス HMI の考え方による概要画面。背景と正常な機器は灰色系で描き、異常な工程 3 だけを赤い枠と記号・文字で示す。下段のナビゲーションはどの画面でも同じ位置。</p>`;

const NUM_ENTRY = `<svg class="tb-chart" viewBox="0 0 520 230" role="img" aria-label="数値入力ダイアログ">
<g class="k-shadow"><rect class="k-part" x="14" y="10" width="316" height="210" rx="8"/></g>
<rect class="k-screen" x="24" y="20" width="296" height="190" rx="3"/>
<text class="k-screen-t" x="40" y="42" font-weight="700">パラメータ変更 — 工程3 送り速度</text>
<text class="k-screen-t" x="40" y="70">現在値</text><text class="k-screen-t" x="140" y="70">120 mm/s</text>
<text class="k-screen-t" x="40" y="98">新しい値</text><rect x="136" y="82" width="96" height="24" rx="2" fill="#1b2027" stroke="#e53935" stroke-width="1.6"/><text class="k-screen-t" x="146" y="99">1500</text><text class="k-screen-t" x="240" y="99">mm/s</text>
<text class="k-screen-t" x="40" y="126">範囲 10 〜 500 mm/s</text>
<text x="40" y="150" fill="#ff8a80" font-size="11">× 上限 500 を超えています</text>
<rect x="52" y="168" width="96" height="28" rx="3" fill="#3a3f47"/><text x="100" y="187" text-anchor="middle" fill="#7d8592" font-size="11">確定</text>
<rect x="170" y="168" width="110" height="28" rx="3" fill="#2d3440" stroke="#8a94a3"/><text class="k-screen-t" x="225" y="187" text-anchor="middle">キャンセル</text>
<g class="k-thin"><line x1="300" y1="38" x2="350" y2="38"/><line x1="200" y1="70" x2="350" y2="76"/><line x1="236" y1="126" x2="350" y2="114"/><line x1="148" y1="182" x2="350" y2="152"/></g>
<text class="lbl" x="356" y="42">① 名称・単位を表示</text><text class="lbl" x="356" y="80">② 現在値と並べる</text><text class="lbl" x="356" y="118">③ 入力範囲を示す</text><text class="lbl" x="356" y="156">④ 範囲外は確定不可</text><text class="lbl" x="356" y="194">⑤ 変更者と値を記録</text>
</svg>
<p class="tb-caption">図: 数値入力のダイアログ。桁の打ち間違い (150 → 1500) を範囲チェックで止め、確定ボタンを無効にして理由を文字で示す。</p>`;

function cond(y: number, ok: boolean, name: string, state: string): string {
  const c = ok ? "#2e7d32" : "#c62828";
  const m = ok ? "✓" : "×";
  return `<circle cx="52" cy="${y - 4}" r="8" fill="${c}"/><text x="52" y="${y}" text-anchor="middle" fill="#fff" font-size="11" font-weight="700">${m}</text><text class="k-screen-t" x="68" y="${y}">${name}</text><text x="230" y="${y}" font-size="11" fill="${ok ? "#c5ccd6" : "#ff8a80"}">${state}</text>`;
}

const START_COND = `<svg class="tb-chart" viewBox="0 0 520 250" role="img" aria-label="起動条件の一覧画面">
<g class="k-shadow"><rect class="k-part" x="20" y="8" width="480" height="234" rx="10"/></g>
<rect class="k-screen" x="32" y="20" width="456" height="210" rx="3"/>
<rect x="32" y="20" width="456" height="24" fill="#2d3440"/>
<text class="k-screen-t" x="42" y="36" font-weight="700">起動条件</text><text class="k-screen-t" x="478" y="36" text-anchor="end">モード: 自動</text>
${cond(68, true, "非常停止 解除", "正常")}
${cond(94, false, "安全扉 閉", "扉 2 (右側) が開いている")}
${cond(120, true, "エア元圧", "0.52 MPa (下限 0.45)")}
${cond(146, false, "原点復帰 完了", "Y 軸が未完了")}
${cond(172, true, "ワーク残りなし", "正常")}
<rect x="386" y="132" width="92" height="22" rx="3" fill="#1e63c6"/><text x="432" y="147" text-anchor="middle" fill="#fff" font-size="11">原点復帰へ</text>
<line x1="42" y1="186" x2="478" y2="186" stroke="#5a6270"/>
<text x="46" y="212" fill="#ff8a80" font-size="12" font-weight="700">起動できません: 未成立 2 件</text>
<rect x="370" y="196" width="108" height="26" rx="3" fill="#3a3f47"/><text x="424" y="214" text-anchor="middle" fill="#7d8592" font-size="11">起動</text>
</svg>
<p class="tb-caption">図: 「なぜ起動しないか」を示す起動条件の一覧。未成立の項目を上から読めば次の行動が分かり、該当画面へ直接移れる。</p>`;

const RECOVERY = `<svg class="tb-chart" viewBox="0 0 520 240" role="img" aria-label="復旧ガイダンス画面">
<g class="k-shadow"><rect class="k-part" x="20" y="8" width="480" height="224" rx="10"/></g>
<rect class="k-screen" x="32" y="20" width="456" height="200" rx="3"/>
<rect x="32" y="20" width="456" height="24" fill="#2d3440"/>
<text class="k-screen-t" x="42" y="36" font-weight="700">復旧ガイダンス</text><text x="478" y="36" text-anchor="end" fill="#ff8a80" font-size="11">ワーク詰まり (工程2)</text>
<text x="46" y="70" fill="#7d8592" font-size="11">✓ 1  扉 2 を開ける</text>
<rect x="40" y="80" width="214" height="28" rx="3" fill="#24364f" stroke="#4d8fe0" stroke-width="1.6"/>
<text class="k-screen-t" x="46" y="99" font-weight="700">2  詰まったワークを除く</text>
<text class="k-screen-t" x="46" y="128">3  扉を閉めてリセット</text>
<text class="k-screen-t" x="46" y="152">4  原点復帰 → 起動</text>
<rect x="276" y="56" width="196" height="120" rx="4" fill="#2a3038" stroke="#8a94a3"/>
<rect x="290" y="108" width="168" height="10" fill="#5a6270"/>
<rect x="306" y="96" width="26" height="22" rx="2" fill="#3a414c" stroke="#8a94a3"/><rect x="400" y="96" width="26" height="22" rx="2" fill="#3a414c" stroke="#8a94a3"/>
<rect x="356" y="102" width="14" height="10" fill="#e57373" transform="rotate(25 363 107)"/>
<rect x="440" y="62" width="28" height="108" fill="none" stroke="#fbc02d" stroke-width="2.4" stroke-dasharray="5 3"/>
<text x="434" y="74" text-anchor="end" fill="#fbc02d" font-size="11">扉 2</text>
<path d="M363,146 L363,122" stroke="#ff8a80" stroke-width="2" marker-end="url(#k-arrow)"/><text x="363" y="162" text-anchor="middle" fill="#ff8a80" font-size="11">詰まり位置</text>
<text class="k-screen-t" x="46" y="208">手順 2 / 4</text>
<rect x="276" y="190" width="90" height="24" rx="3" fill="#2d3440" stroke="#8a94a3"/><text class="k-screen-t" x="321" y="206" text-anchor="middle">戻る</text>
<rect x="382" y="190" width="90" height="24" rx="3" fill="#1e63c6"/><text x="427" y="206" text-anchor="middle" fill="#fff" font-size="11">完了 → 次へ</text>
</svg>
<p class="tb-caption">図: アラーム後の復旧ガイダンス。手順を 1 つずつ示し、装置の上面図で作業する場所 (扉 2・詰まり位置) を指す。</p>`;

export const HMI: TextChapter[] = [
  {
    id: "operator-panel-design",
    part: "ux",
    title: "【中級】操作盤の設計 — スイッチの配置・色・ガード",
    minutes: 25,
    level: 2,
    lead: "操作盤は作業者が毎日何百回も触る、装置の「顔」です。押しボタンの色と形、機能と操作順に沿ったグループ分け、誤操作を防ぐガード、非常停止の位置、取付高さ、表示ラベルの言葉までを、IEC 60204-1 などの考え方に沿って設計します。",
    body: `
<h2>配置の基本: 機能と操作順でまとめる</h2>
<p>押しボタンを部品表の順や配線の都合で並べると、作業者は毎回探すことになります。配置は次の順で決めます。</p>
<ul>
  <li><b>機能でグループ化</b>: 「運転準備・リセット」「運転 (起動・停止)」「モード選択」「手動操作 (寸動)」のように枠や間隔で区切る。</li>
  <li><b>操作順に左から右・上から下</b>: 制御電源入 → 運転準備 → 起動 の順に並べると、手順書を見なくても流れが分かる。</li>
  <li><b>表示灯は対応する操作具の真上</b>: 「起動」ボタンの上に「運転中」の灯。</li>
  <li><b>反対の機能は対にする</b>: 起動の右に停止、前進の右に後退。位置関係は全装置で統一する。</li>
  <li><b>間隔</b>: 手袋をした指で隣を押さないよう、ボタン中心間隔を十分にとる (ボタン径 22 mm 級なら中心間 50 mm 程度以上を目安に、試作で確認)。</li>
</ul>
${PANEL_FRONT}

<h2>色と形 (IEC 60204-1 の考え方)</h2>
<table class="tb-table">
  <tr><th>操作具</th><th>色</th><th>形・構造の工夫</th></tr>
  <tr><td>非常停止</td><td>赤 (背景は黄)</td><td>きのこ形、押すとロック、引く/回して復帰 (ISO 13850)</td></tr>
  <tr><td>起動・入</td><td>白が推奨 (灰・黒・緑も可)</td><td>埋込形やガード付きで不意の作動を防ぐ</td></tr>
  <tr><td>停止・切</td><td>黒が推奨 (灰・白も可)</td><td>突出形で素早く押せる</td></tr>
  <tr><td>リセット</td><td>青・白・灰・黒</td><td>押しボタン。表示灯の青 (要操作) と組み合わせる</td></tr>
</table>
<p>赤は非常停止に、緑は安全な起動側にだけ使い、<b>赤い起動ボタン</b>や<b>緑の停止ボタン</b>は作りません。色だけに頼らず、記号 (IEC 60417 の I / O など) と文字ラベルを併用します。規格の細部 (許容色の組合せなど) は採用する版の本文で確認してください。</p>

<h2>誤操作を防ぐガード</h2>
<ul>
  <li><b>埋込形 (フラッシュ)</b>: 起動ボタン。体や工具が触れても押されにくい。</li>
  <li><b>ガードリング・カバー</b>: 「全データ消去」など頻度が低く結果が大きい操作。カバーを開ける動作が 2 段目になる。</li>
  <li><b>キースイッチ</b>: モード切替や保全モード。鍵を持つ人だけが操作できる。</li>
  <li><b>両手押しボタン</b>: プレスなど手を危険区域から離させる用途。安全機能として規格に沿って設計する。</li>
</ul>

<h2>取付高さと非常停止の位置</h2>
${PANEL_SIDE}
<p>IEC 60204-1 は手動操作具を作業床から <b>0.6 m 以上</b>の高さに置き、通常の作業位置から容易に届くことを求めています。頻繁に使う操作具はひじ高さ付近 (立位でおよそ 0.9〜1.3 m) に集め、表示は眼の高さより少し下に置くと、首と肩の負担が少なくなります。<b>非常停止</b>は各操作位置と、危険が生じうる場所から素早く届く位置に置き、周りに物を置いて隠さないようにします。長い装置では複数か所に設けます。</p>

<h2>設計例: 組立セルの操作盤</h2>
<p>ワークを手で投入する組立セルを考えます。作業者は投入口の正面に立ち、左手でワークを置き、右手で起動します。そこで操作盤は投入口の<b>右側</b>、ひじ高さ付近に置き、左から「運転準備 → リセット → 起動 → 停止」と操作順に並べます。モード切替のキースイッチは頻度が低いので上段に、非常停止は盤の右端に黄色の背景で置き、さらに装置の反対側の保全扉付近にも 1 個設けます。表示灯「運転中 (緑)」は起動ボタンの真上、「異常 (黄・赤)」は画面とシグナルタワーでも示します。最後に段ボールの試作盤に原寸の印刷を貼り、実際の作業者に手袋をはめて一連の操作をしてもらい、迷った箇所・押し間違えた箇所を記録して直します。</p>
<h2>ラベルの言葉</h2>
<ul>
  <li>機能を動詞か状態で短く: 「起動」「停止」「原点復帰」。社内略語 (「SQ リセ」) は使わない。</li>
  <li>ラベルは操作具の<b>上</b>に置く (押す指で隠れない)。</li>
  <li>多言語の装置は文字が長くなる余白を残すか、記号 + 文字にする。</li>
</ul>
<div class="tb-note">よくある失敗: 起動と非常停止の形が似ていて隣り合っている / 停止ボタンが盤の下の方にある / 試運転用の仮ボタンがそのまま残る / 表示灯の色がメーカーごとに違う。</div>`,
    points: [
      "機能でグループ化し、操作順に左→右・上→下。表示灯は操作具の真上",
      "非常停止は赤 + 黄背景、起動は白推奨、停止は黒推奨。赤い起動・緑の停止は作らない",
      "起動は埋込・ガード付き、停止は突出形、重大操作はカバー・キー",
      "操作具は床上 0.6 m 以上 (IEC 60204-1)、主操作域はひじ高さ付近",
      "非常停止は各操作位置から素早く届き、隠れない場所に",
      "ラベルは操作具の上に、略語を避けて短く",
    ],
    exercises: [
      {
        q: "ある装置の操作盤には左から「停止 (緑)」「起動 (赤)」「非常停止 (赤のきのこ形、背景なし)」「リセット」が等間隔に並んでいる。問題点と改善案を挙げよ。",
        a: "① 色の意味が逆: 起動は白 (または緑)、停止は黒 (または白・灰) にする。② 非常停止は黄色の背景を付け、他のボタンと離して盤の端など目立つ位置に。③ 操作順 (リセット → 起動) とグループ (準備 / 運転) で並べ替え、起動の右に停止を対で置く。④ 起動は埋込形またはガード付き、停止は突出形にして形でも区別する。",
      },
      {
        q: "作業床が通路より 0.15 m 高い作業台の上で操作する装置がある。操作盤の主な操作域を床 (作業床) から 0.9〜1.3 m にしたい。通路の床から測るとボタン中心は何 m から何 m の範囲になるか。また IEC 60204-1 の下限 0.6 m は、どちらの床から測るべきか。",
        a: "0.9 + 0.15 = <b>1.05 m</b> 〜 1.3 + 0.15 = <b>1.45 m</b> (通路床から)。高さの基準は作業者が立つ<b>作業床 (サービスレベル)</b>なので、下限 0.6 m も作業台の上面から測る。図面では基準面を明記しておく。",
      },
    ],
    quiz: [
      { q: "起動ボタンの構造として適切なのはどれか。", choices: ["大きな突出形", "埋込形またはガード付き", "赤いきのこ形", "足踏み式"], answer: 1, explain: "起動は不意に押されると危険なので、埋込形やガードで誤作動を防ぎます。" },
      { q: "IEC 60204-1 で手動操作具の取付高さの下限として示される値はどれか (作業床から)。", choices: ["0.2 m", "0.4 m", "0.6 m", "1.0 m"], answer: 2, explain: "作業床から 0.6 m 以上で、通常の作業位置から容易に届くことが求められます。" },
      { q: "操作盤のラベルを置く位置として望ましいのはどれか。", choices: ["操作具の上", "操作具の下", "盤の裏", "取扱説明書だけ"], answer: 0, explain: "下に置くと押す指や手で隠れます。上に置けば操作中も読めます。" },
    ],
  },

  {
    id: "hmi-screen-design",
    part: "ux",
    title: "【上級】HMI 画面の設計 — 画面構成・遷移・ユーザ権限",
    minutes: 30,
    level: 3,
    lead: "タッチパネルの HMI 画面は、作り手が思いつくままに画面を足していくと、色だらけで迷路のようになります。画面の階層と共通レイアウト、色を異常だけに使う「ハイパフォーマンス HMI」の考え方、範囲チェック付きの数値入力、作業者・保全・技術者のユーザ権限を設計します。",
    body: `
<h2>画面の階層と遷移</h2>
<p>画面は「全体 → ユニット → 詳細 → 診断」の階層にまとめ、上位ほど状態を一望でき、下位ほど細かい操作ができるようにします (ISA-101 などの考え方)。</p>
<table class="tb-table">
  <tr><th>階層</th><th>目的</th><th>主な利用者</th></tr>
  <tr><td>1 概要</td><td>全工程の状態、生産数、異常の有無</td><td>全員</td></tr>
  <tr><td>2 ユニット</td><td>工程ごとの運転・モード・サイクル</td><td>オペレータ</td></tr>
  <tr><td>3 詳細</td><td>個々のシリンダ・軸・センサ</td><td>オペレータ・保全</td></tr>
  <tr><td>4 診断</td><td>I/O モニタ、パラメータ、トレンド</td><td>保全・技術者</td></tr>
</table>
<ul>
  <li>よく使う画面はどこからでも <b>2 タッチ以内</b>で届くようにする。</li>
  <li>画面タイトル (現在地) と「戻る」「ホーム」を<b>常に同じ位置</b>に置く。</li>
  <li>画面遷移図を作り、行き止まりや、同じ画面への複数の別名を無くす。</li>
</ul>

<h2>共通レイアウトとグリッド</h2>
<p>全画面で、上段 = 状態バー (画面名・モード・ログイン者・時刻・アラーム件数)、中央 = 内容、下段 = ナビゲーション と領域を固定します。ボタンの大きさと間隔もグリッドで統一すると、作業者は位置で覚えられます。手袋で押すタッチボタンは大きめに (一辺 15〜20 mm 程度を目安に試作で確認)。</p>
${OVERVIEW}

<h2>色は「異常」のために取っておく</h2>
<p>ハイパフォーマンス HMI の考え方では、背景と正常な機器を<b>灰色系</b>で描き、彩度の高い色は異常・注意にだけ使います。正常なポンプを緑、モータを青…と塗り分けると、本当の異常の赤が埋もれます。</p>
<ul>
  <li>色の意味は表示灯 (IEC 60073) と合わせて固定する: 赤 = 異常・危険、黄 = 注意、青 = 要操作。</li>
  <li>色だけで区別しない。記号 (▲!)・文字・枠線を併用する。</li>
  <li>数値は単位と一緒に、可能なら正常範囲を示す (トレンドに上下限の線)。</li>
  <li>3D 風の装飾や写真のような背景は情報の邪魔になる。機械の模式図 (ミミック) は簡潔な線で。</li>
</ul>

<h2>数値入力は範囲と確認を</h2>
${NUM_ENTRY}
<p>数値入力では、名称・単位・現在値・入力範囲を表示し、範囲外は確定させません。影響の大きい値 (速度・圧力・温度の上限) は「変更前 → 変更後」を並べて確認させ、変更者・時刻・値をログに残します。増減ボタン (+ / −) で 1 ステップずつ変える方式は桁間違いが起きにくく、微調整に向きます。</p>

<h2>設計例: 品種切替の画面フロー</h2>
<p>作業者が品種を切り替える場面を、悪い例と良い例で比べます。悪い例では「メニュー → 設定 → レシピ → 一覧 → 選択 → 保存」と 6 画面をたどり、最後に「保存しますか?」とだけ聞かれます。良い例では、概要画面の「品種」ボタンから一覧を開き (1 タッチ)、品種を選ぶと<b>変更前後の主な条件 (サイクル時間・治具番号・使う部品)</b>を並べた確認画面が出て、「切替」で反映します (3 タッチ)。治具の交換が必要な品種なら、確認画面に段取り手順への案内を出し、治具の識別センサが正しい治具を検出するまで起動条件を未成立にしておきます。</p>
<h2>ユーザ権限</h2>
<table class="tb-table">
  <tr><th>レベル</th><th>できること</th><th>例</th></tr>
  <tr><td>オペレータ</td><td>運転・停止・品種選択・アラーム確認</td><td>生産担当</td></tr>
  <tr><td>保全</td><td>+ 手動操作、I/O モニタ、タイマ調整</td><td>保全担当</td></tr>
  <tr><td>技術者</td><td>+ パラメータ・レシピ編集、ユーザ管理</td><td>生産技術・メーカー</td></tr>
</table>
<p>ログインは個人ごとにし (共有パスワードは誰が変えたか分からない)、一定時間操作がなければ自動ログアウトします。権限がなくて押せないボタンは隠すより<b>グレー表示 + 理由</b>にすると、「どの権限が必要か」が分かります。なお、安全機能の無効化を画面の権限だけで許してはいけません。安全機能は安全関連制御系の側で守ります。</p>
<div class="tb-note">よくある失敗: 画面ごとに「戻る」の位置が違う / 正常を緑で塗りつぶす / 単位のない数値 / 全員が技術者権限でログインしたまま。</div>`,
    points: [
      "概要 → ユニット → 詳細 → 診断の階層。よく使う画面は 2 タッチ以内",
      "状態バー・内容・ナビゲーションの領域を全画面で固定",
      "背景と正常は灰色系、色は異常・注意のために取っておく",
      "数値入力は名称・単位・現在値・範囲を表示し、範囲外は確定不可",
      "オペレータ / 保全 / 技術者の権限を個人ログインで分け、変更を記録",
    ],
    exercises: [
      {
        q: "送り速度の入力範囲が 10〜500 mm/s の装置で、作業者が 150 と打つつもりで 1500 と入力した。範囲チェックがない場合とある場合で何が起こるか。また上限の 3 倍の値が入ったことになるが、何倍か計算せよ。",
        a: "1500 / 500 = <b>3 倍</b> (意図した 150 の 10 倍)。チェックがないと、そのまま軸が想定の 10 倍の速度で動き、衝突や品質不良につながる。範囲チェックがあれば「上限 500 を超えています」と表示して確定させず、作業者は打ち直せる。",
      },
      {
        q: "ある画面設計ではアラーム一覧に行くのに「メニュー → 保全 → 履歴 → アラーム」の 4 タッチが必要だった。改善案を示せ。",
        a: "状態バーにアラーム件数のボタンを常に置き、どの画面からも 1 タッチでアラーム一覧へ移れるようにする。未確認のアラームがあるときは件数を赤い記号で示す。履歴 (過去分) は一覧からタブで切り替える。",
      },
    ],
    quiz: [
      { q: "ハイパフォーマンス HMI の色の使い方として適切なのはどれか。", choices: ["正常な機器を緑で塗る", "背景を灰色系にし、彩度の高い色は異常に使う", "工程ごとに色を変える", "背景を写真にする"], answer: 1, explain: "色を異常のために取っておくと、異常がすぐ目に入ります。" },
      { q: "権限がない操作のボタンの扱いとして望ましいのはどれか。", choices: ["押せるが何も起きない", "グレー表示にして必要な権限を示す", "共有パスワードを画面に表示する", "押すとエラー音だけ鳴る"], answer: 1, explain: "理由が分かれば、作業者は誰に依頼すればよいか判断できます。" },
      { q: "数値入力で桁間違いを防ぐ対策として最も効果的なのはどれか。", choices: ["入力欄を小さくする", "範囲チェックと変更前後の確認表示", "単位を省略する", "入力後すぐに反映する"], answer: 1, explain: "範囲外を確定させず、変更前後を並べて確認させます。" },
    ],
  },

  {
    id: "machine-feedback-states",
    part: "ux",
    title: "【中級】機械の状態を伝える — モード・インタロック表示・ガイダンス",
    minutes: 25,
    level: 2,
    lead: "「起動ボタンを押しても動かない」「いまどのモードか分からない」「アラームのあと何をすればよいか分からない」。こうした問い合わせの多くは、機械が自分の状態を伝えていないことが原因です。モード表示、起動条件の一覧、ステップガイダンス、音、アラーム後の復旧手順を設計します。",
    body: `
<h2>運転モードをはっきり見せる</h2>
<table class="tb-table">
  <tr><th>モード</th><th>内容</th><th>表示の工夫</th></tr>
  <tr><td>自動</td><td>サイクルを連続で実行</td><td>状態バーに「自動」、シグナルタワー緑</td></tr>
  <tr><td>手動 (寸動)</td><td>軸・シリンダを 1 動作ずつ</td><td>画面の枠色や背景の帯を変え、どの軸を動かすか明示</td></tr>
  <tr><td>段取り・保全</td><td>扉を開けた状態などでの調整</td><td>「段取り: 速度制限中」など条件を文字で</td></tr>
</table>
<p>モードの切替は<b>キースイッチ</b>など意図的な操作にし、切替後は画面の状態バーにモード名を常時表示します。段取り・保全モードでガード扉を開けて動かす場合は、速度制限やホールド・トゥ・ラン (押している間だけ動く) などの安全方策をリスクアセスメントに基づいて安全関連制御系で実現します (IEC 60204-1 の考え方)。画面表示はそれを<b>知らせる</b>役割です。</p>

<h2>「なぜ動かないか」を表示する</h2>
<p>起動ボタンを押しても何も起きない機械は、作業者に「壊れた」と思わせます。起動に必要な条件 (インタロック) を一覧にし、成立・未成立を表示します。</p>
${START_COND}
<ul>
  <li>起動を押したのに条件が未成立なら、<b>未成立の項目を 1 行目に</b>出す (無反応にしない)。</li>
  <li>未成立の項目から、対処する画面 (原点復帰・扉の位置図) へ直接移れるようにする。</li>
  <li>扉スイッチなどは「扉 2 (右側)」のように<b>場所</b>で示す。I/O 番号だけにしない。</li>
</ul>

<h2>ステップガイダンス</h2>
<p>自動サイクルの途中で止まったとき、「工程 3 / ステップ 12: クランプ閉待ち (8.2 s 経過、通常 1.0 s)」のように、<b>いまどの段階で何を待っているか</b>を表示すると、保全担当者は I/O を追わなくても原因を絞り込めます。待ち時間が通常値を大きく超えたら注意を出すと、故障前の兆候にも気付けます。</p>

<h2>設計例: モード切替時の表示</h2>
<p>キースイッチを「自動」から「段取り」に回したとき、表示は 3 か所で一斉に変わるようにします。① 画面の状態バーが「段取り: 速度制限中」に変わり、画面の枠に黄色の帯が出る。② シグナルタワーは段取り中を示す黄 (工場の割り当て表に従う)。③ 起動条件の一覧が段取りモード用 (扉開でも可、寸動のみ) に切り替わる。自動に戻すときは、原点復帰とワーク残りなしを条件とし、未成立なら一覧で知らせます。こうして「いまのモード」と「そのモードでできること」を、盤・画面・タワーのどこを見ても同じ意味で伝えます。</p>
<h2>音の使い分け</h2>
<ul>
  <li>音は「画面を見ていない人を呼ぶ」ためのもの。種類は 2〜3 種類に絞る (例: 異常停止 = 断続音、要操作 = 短い 2 音)。</li>
  <li>周囲の騒音より十分大きく、しかし耳障りにならない音量にし、確認操作で止められるようにする (止めても表示は残す)。</li>
  <li>操作の受付音 (タッチの短い音) はアラーム音と明確に違う音にする。</li>
</ul>

<h2>アラーム後の復旧ガイダンス</h2>
${RECOVERY}
<p>停止の原因を取り除いても、「リセット → 原点復帰 → 起動」のどこから始めればよいか分からなければ再開できません。アラームごとに<b>復旧手順</b>を用意し、画面で 1 手順ずつ示します。作業する場所は上面図や写真で示し、完了した手順にはチェックを付けます。復旧後は途中のワークの扱い (再投入・不良として排出) も指示します。</p>
<div class="tb-note">よくある失敗: 起動を押しても無反応 / モードが盤のスイッチ位置でしか分からない / 「異常です」とだけ出る / 全部のアラームが同じ音。</div>`,
    points: [
      "モードはキースイッチなど意図的な操作で切替え、常時表示する",
      "起動条件 (インタロック) の一覧で「なぜ動かないか」を示す",
      "未成立項目は場所で示し、対処画面へ直接移れるようにする",
      "ステップと待ち条件・経過時間を表示し、異常の兆候にも使う",
      "音は 2〜3 種類に絞り、止めても表示は残す",
      "アラームごとに復旧手順を 1 ステップずつ示す",
    ],
    exercises: [
      {
        q: "ある装置のクランプ閉の通常時間は 1.0 s である。ステップガイダンスで「通常の 3 倍を超えたら注意、8 倍を超えたら異常停止」とする。それぞれ何秒か。また図の例 (8.2 s 経過) はどちらに当たるか。",
        a: "注意 1.0 × 3 = <b>3.0 s</b>、異常停止 1.0 × 8 = <b>8.0 s</b>。8.2 s は 8.0 s を超えているので<b>異常停止</b>の段階。画面には「クランプ閉待ち 8.2 s (通常 1.0 s)」と実測値を並べて表示し、エア圧やセンサ位置の確認を促す。",
      },
      {
        q: "「起動ボタンを押しても動かない」という問い合わせが月に 20 件あり、1 件あたり保全担当の対応に平均 15 分かかっている。起動条件一覧の画面を追加して 8 割を作業者自身で解決できるようになると、月に何時間の削減になるか。",
        a: "解決できる件数 20 × 0.8 = 16 件。16 × 15 分 = 240 分 = <b>4 時間/月</b>。加えて、作業者が保全担当を待つ停止時間も減る。",
      },
    ],
    quiz: [
      { q: "起動条件が成立していないときに起動ボタンが押された場合の望ましい挙動はどれか。", choices: ["何もしない", "未成立の条件を表示する", "条件を無視して起動する", "非常停止をかける"], answer: 1, explain: "無反応は故障と誤解されます。未成立の条件を示して次の行動を案内します。" },
      { q: "段取りモードの安全方策 (速度制限など) について正しいのはどれか。", choices: ["画面表示だけで実現すればよい", "安全関連制御系で実現し、画面はそれを知らせる", "作業者の注意に任せる", "音で代用する"], answer: 1, explain: "安全機能は画面ソフトに依存させず、安全関連制御系で実現します。" },
      { q: "アラーム音の設計として適切なのはどれか。", choices: ["全アラームに同じ大音量の連続音", "種類を 2〜3 に絞り、確認で止めても表示は残す", "操作音とアラーム音を同じにする", "音を止められないようにする"], answer: 1, explain: "意味の分かる少数の音にし、止めても状態は画面と表示灯で残します。" },
    ],
  },
];
