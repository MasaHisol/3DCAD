import type { TextChapter } from "../types";

// Machine safety design, part 3: maintenance safety (LOTO) and conformity process.
export const SAFETY3: TextChapter[] = [
  {
    id: "loto-maintenance-safety",
    part: "knowhow",
    title: "保守作業の安全 — ロックアウト・タグアウトと非定常作業",
    minutes: 20,
    level: 2,
    lead: "機械災害の多くは、通常の自動運転ではなく、保全・清掃・詰まり除去・段取りといった非定常作業で起きます。ロックアウト・タグアウト (LOTO) の手順と、それを確実にする設計、遮断できない作業の扱い方を学びます。",
    body: `
<h2>なぜ非定常作業で事故が起きるのか</h2>
<p>自動運転中はガードが閉じ、人は危険区域の外にいます。ところが保全や詰まり除去では、<b>ガードを開けて中に入る</b>必要があります。しかも作業は不定期で手順が定まりにくく、「すぐ終わるから」と止めずに手を入れたり、別の人が事情を知らずに起動したりします。典型的なパターンは次のとおりです。</p>
<ul>
  <li>止めたつもりが<b>制御の停止</b>だけで、動力は生きていた (センサが反応して自動で再開)</li>
  <li>主電源は切ったが、<b>空圧・重力・ばね</b>のエネルギーが残っていた</li>
  <li>作業中に<b>別の人が電源を入れた</b> (誰が中にいるか分からない)</li>
  <li>交代勤務で引継ぎがなく、前の班の錠が外された</li>
</ul>
<h2>LOTO の手順</h2>
<p><b>ロックアウト</b>は遮断装置を錠で「切」の位置に固定すること、<b>タグアウト</b>は誰がなぜ遮断しているかを札で示すことです。札だけ (タグアウトのみ) では物理的に入れられてしまうので、錠と組み合わせるのが原則です。</p>
<svg class="tb-chart" viewBox="0 0 520 216" role="img" aria-label="ロックアウト・タグアウトの 7 ステップ">
<text class="k-title" x="14" y="22">LOTO の手順 (例)</text>
<g class="k-shadow"><rect class="k-panel" x="10" y="36" width="118" height="70" rx="7"/><circle class="k-badge" cx="28" cy="56" r="10"/><text class="k-badge-t" x="28" y="60" text-anchor="middle">1</text><text class="lbl" x="44" y="61">準備</text><text class="k-note" x="20" y="88">エネルギー源を確認</text><rect class="k-panel" x="137" y="36" width="118" height="70" rx="7"/><circle class="k-badge" cx="155" cy="56" r="10"/><text class="k-badge-t" x="155" y="60" text-anchor="middle">2</text><text class="lbl" x="171" y="61">通知</text><text class="k-note" x="147" y="88">関係者に知らせる</text><rect class="k-panel" x="264" y="36" width="118" height="70" rx="7"/><circle class="k-badge" cx="282" cy="56" r="10"/><text class="k-badge-t" x="282" y="60" text-anchor="middle">3</text><text class="lbl" x="298" y="61">停止</text><text class="k-note" x="274" y="88">通常の手順で止める</text><rect class="k-panel" x="391" y="36" width="118" height="70" rx="7"/><circle class="k-badge" cx="409" cy="56" r="10"/><text class="k-badge-t" x="409" y="60" text-anchor="middle">4</text><text class="lbl" x="425" y="61">遮断</text><text class="k-note" x="401" y="88">断路器・元弁を切る</text><rect class="k-panel" x="10" y="120" width="118" height="70" rx="7"/><circle class="k-badge" cx="28" cy="140" r="10"/><text class="k-badge-t" x="28" y="144" text-anchor="middle">5</text><text class="lbl" x="44" y="145">ロック・札</text><text class="k-note" x="20" y="172">各自の錠と札</text><rect class="k-panel" x="137" y="120" width="118" height="70" rx="7"/><circle class="k-badge" cx="155" cy="140" r="10"/><text class="k-badge-t" x="155" y="144" text-anchor="middle">6</text><text class="lbl" x="171" y="145">解放</text><text class="k-note" x="147" y="172">残圧・電荷を抜く</text><rect class="k-panel" x="264" y="120" width="118" height="70" rx="7"/><circle class="k-badge" cx="282" cy="140" r="10"/><text class="k-badge-t" x="282" y="144" text-anchor="middle">7</text><text class="lbl" x="298" y="145">確認</text><text class="k-note" x="274" y="172">起動を試し 0 を確認</text></g>
<rect x="391" y="120" width="118" height="70" rx="7" style="fill:var(--tb-good)" fill-opacity="0.14" stroke="none"/>
<text class="k-good-t" x="450" y="150" text-anchor="middle">作業開始</text><text class="k-note" x="450" y="172" text-anchor="middle">解除は逆の手順</text>
<text class="k-note" x="14" y="208">遮断 (4) と確認 (7) を省くと、LOTO は形だけになる</text>
</svg>
<p class="tb-caption">図: LOTO の 7 ステップの例。会社ごとに手順書を定め、機械ごとの遮断点一覧 (どこを、何で、どう確認するか) を用意する</p>
<ol class="tb-flow">
  <li><b>準備</b>: その機械のエネルギー源 (電気・空圧・油圧・重力・ばね・熱) と遮断点を一覧で確認する</li>
  <li><b>通知</b>: 運転者や関係者に、停止して保全に入ることを知らせる</li>
  <li><b>停止</b>: 通常の停止操作で止める (いきなり主電源を切ると、ワークの落下などが起きることがある)</li>
  <li><b>遮断</b>: 断路器・元弁など<b>動力源そのもの</b>を切る。非常停止や制御の停止は遮断ではない</li>
  <li><b>ロック・札</b>: 作業者一人ひとりが自分の錠と札を掛ける。鍵は本人が持つ</li>
  <li><b>解放</b>: 残圧を排気し、コンデンサの放電を待ち、上がっている部分を下げるか機械式に保持する</li>
  <li><b>確認</b>: 起動ボタンを押して動かないことを試し (トライアウト)、圧力計・検電器で 0 を確かめる。試した後は起動操作を元に戻す</li>
</ol>
<h2>複数人での作業 — グループロックアウト</h2>
<svg class="tb-chart" viewBox="0 0 520 232" role="img" aria-label="グループロックアウト用の多連ハスプ">
<rect class="k-panel" x="8" y="8" width="504" height="216" rx="8"/>
<text class="k-title" x="22" y="30">複数人の作業 — 多連ハスプで「全員が外すまで入らない」</text>
<g class="k-shadow"><rect class="k-alu" x="30" y="44" width="120" height="170" rx="4"/></g>
<rect class="k-yellow" x="56" y="70" width="68" height="68" rx="6"/><circle class="k-part" cx="90" cy="104" r="15"/>
<rect x="84" y="94" width="50" height="12" rx="4" fill="#d32f2f" style="stroke:#5a0a0a" transform="rotate(90 90 100)"/>
<rect class="k-part" x="104" y="146" width="26" height="8" rx="2"/>
<path d="M118,154 L118,170 M170,166 L330,166 L330,186 L170,186 Z" fill="none" style="stroke:var(--k-line)" stroke-width="3"/>
<path d="M118,170 Q130,176 170,176" fill="none" style="stroke:var(--k-line)" stroke-width="3"/>
<g class="k-shadow"><path d="M189,186 L189,176 A7,7 0 0 1 203,176 L203,186" fill="none" style="stroke:var(--k-line)" stroke-width="3.2"/><rect x="185" y="186" width="22" height="20" rx="3" fill="#d32f2f" style="stroke:var(--k-line)" stroke-width="1.2"/><circle cx="196" cy="195" r="2.2" fill="#1f2328"/><path d="M229,186 L229,176 A7,7 0 0 1 243,176 L243,186" fill="none" style="stroke:var(--k-line)" stroke-width="3.2"/><rect x="225" y="186" width="22" height="20" rx="3" fill="#1565c0" style="stroke:var(--k-line)" stroke-width="1.2"/><circle cx="236" cy="195" r="2.2" fill="#1f2328"/><path d="M269,186 L269,176 A7,7 0 0 1 283,176 L283,186" fill="none" style="stroke:var(--k-line)" stroke-width="3.2"/><rect x="265" y="186" width="22" height="20" rx="3" fill="#2e7d32" style="stroke:var(--k-line)" stroke-width="1.2"/><circle cx="276" cy="195" r="2.2" fill="#1f2328"/><path d="M309,186 L309,176 A7,7 0 0 1 323,176 L323,186" fill="none" style="stroke:var(--k-line)" stroke-width="3.2"/><rect x="305" y="186" width="22" height="20" rx="3" fill="#f57c00" style="stroke:var(--k-line)" stroke-width="1.2"/><circle cx="316" cy="195" r="2.2" fill="#1f2328"/></g>
<text class="k-note" x="196" y="220" text-anchor="middle">保全A</text><text class="k-note" x="236" y="220" text-anchor="middle">保全B</text><text class="k-note" x="276" y="220" text-anchor="middle">電気</text><text class="k-note" x="316" y="220" text-anchor="middle">業者</text>
<g class="k-shadow"><rect class="k-yellow" x="360" y="56" width="140" height="96" rx="6"/></g>
<rect class="k-screen" x="370" y="66" width="120" height="76" rx="4"/>
<text class="k-screen-t" x="380" y="86">ロックボックス</text><text class="k-screen-t" x="380" y="106">遮断点の鍵 3 本</text><text class="k-screen-t" x="380" y="126">在室者 4 名</text>
<text class="k-note" x="360" y="172">遮断点が多いときは</text><text class="k-note" x="360" y="188">鍵を箱に入れ、箱に</text><text class="k-note" x="360" y="204">各自が錠を掛ける</text>
<text class="k-note" x="176" y="70">1 人 1 錠 1 鍵。</text><text class="k-note" x="176" y="88">鍵は本人だけが持つ</text>
<text class="k-note" x="176" y="120">最後の 1 人が外すまで</text><text class="k-note" x="176" y="138">断路器は入らない</text>
</svg>
<p class="tb-caption">図: 多連ハスプやロックボックスを使えば、全員の錠が外れるまで遮断点を戻せない。業者や応援者も自分の錠を掛ける</p>
<h2>LOTO を確実にする設計</h2>
<table class="tb-table">
  <tr><th>設計の工夫</th><th>理由</th></tr>
  <tr><td>ロック可能な断路器・元弁 (切位置でだけ錠が掛かる)</td><td>入位置でロックされる誤りを防ぐ</td></tr>
  <tr><td>遮断点を少なく、まとめて、表示する</td><td>遮断点が多いほど漏れが起きる</td></tr>
  <tr><td>ゼロエネルギーの確認手段 (圧力計、充電表示、検電端子)</td><td>「切ったつもり」をなくす</td></tr>
  <tr><td>機械式の落下防止 (安全ブロック、ロックピン)</td><td>重力のエネルギーは遮断できない</td></tr>
  <tr><td>危険区域外から行える保全 (外部給油、引出し式ユニット)</td><td>LOTO が必要な作業そのものを減らす</td></tr>
</table>
<h2>遮断できない作業 — 調整・トラブルシュート</h2>
<p>動きを見ながらの調整や、通電した状態での故障診断は LOTO できません。この場合は ISO 12100 の考え方どおり、<b>リスクアセスメントで作業ごとに対策を決め</b>、設計側で次のような手段を用意します。</p>
<ul>
  <li>監視付き低速・寸動 (ホールド・トゥ・ラン) とイネーブル装置を組み合わせた保全モード</li>
  <li>モード選択スイッチは鍵付きにし、選んだモード以外の動作を禁止する</li>
  <li>ガードの外から見える窓・照明・カメラ、外部から読める診断表示</li>
  <li>作業許可 (パーミット) 制度で、誰が・いつ・どんな条件で行うかを管理する</li>
</ul>
<h3>よくある間違い</h3>
<ul>
  <li>非常停止ボタンを押しただけで中に入る — 誰かがリセットすれば動く</li>
  <li>錠を 1 個だけ掛け、班長が全員分の鍵を持つ — 作業者が自分を守れない</li>
  <li>トライアウトで押した起動ボタンを戻し忘れ、LOTO 解除の瞬間に機械が動く</li>
  <li>「1 分で終わる」詰まり除去を LOTO の対象外にする — それこそ事故の多い作業</li>
</ul>
<div class="tb-tip"><b>規格・法令について</b>: この章は学習用の要約です。規格・法令は改訂されます (例: EU では機械指令 2006/42/EC が機械規則 (EU) 2023/1230 に置き換わり、2027 年 1 月から適用予定)。実務では必ず最新の原文、官報、所管当局・専門機関の情報を確認してください。</div>`,
    points: [
      "事故は保全・清掃・詰まり除去などの非定常作業に集中する",
      "LOTO = 動力源の遮断 + 錠 + 札 + 残留エネルギーの解放 + ゼロの確認",
      "1 人 1 錠 1 鍵。複数人なら多連ハスプやロックボックスで全員分を掛ける",
      "遮断できない調整作業は、低速・イネーブル・鍵付きモード選択などを設計で用意する",
    ],
    exercises: [
      {
        q: "空圧で昇降するリフタ (昇降部 40 kg、上昇端 0.8 m) のベルト交換の LOTO 手順を、本文の 7 ステップに沿って作ってください。",
        a: "① 準備: エネルギー源 = 電気 (主電源)、空圧 (元弁)、重力 (昇降部 40 kg × 9.8 × 0.8 m ≈ 314 J)。② 通知: 運転者へ連絡。③ 停止: 昇降部を<b>下降端</b>まで下げてから通常停止。④ 遮断: 主電源断路器を切、エア元弁 (残圧排気付き) を閉。⑤ 作業者全員が錠と札を掛ける。⑥ 解放: 残圧を排気し、下降端で止まらない構造なら安全ブロックを入れる。⑦ 確認: 起動ボタン・手動弁で動かないこと、圧力計 0 を確認し、操作を元に戻してから作業。",
      },
      {
        q: "4 人の保全員と 1 人の外部業者が、遮断点 3 か所 (主電源・エア元弁・油圧ユニット) の機械を整備します。錠の掛け方を提案してください。",
        a: "3 か所の遮断点を、責任者がそれぞれ専用の錠でロックし、その鍵 3 本を<b>ロックボックス</b>に入れます。作業者 5 人 (業者を含む) が全員、ボックスに自分の錠を掛けます。最後の 1 人が錠を外すまで鍵は取り出せず、遮断点を戻せません。作業者が交代するときは、新しい人が錠を掛けてから前の人が外します。",
      },
    ],
    quiz: [
      { q: "LOTO の遮断として適切なものは?", choices: ["非常停止ボタンを押す", "主電源断路器を切にして錠を掛ける", "タッチパネルで停止を選ぶ"], answer: 1, explain: "制御による停止は遮断ではありません。動力源そのものを切って錠で固定します。" },
      { q: "タグアウト (札) だけの運用の弱点は?", choices: ["札が高価", "物理的には誰でも操作できてしまう", "電源が切れない"], answer: 1, explain: "札は情報を伝えるだけなので、錠と組み合わせるのが原則です。" },
      { q: "遮断後の「確認」で行うことは?", choices: ["起動操作を試して動かないこと、圧力・電圧が 0 であることを確かめる", "ラベルの枚数を数える", "非常停止をリセットする"], answer: 0, explain: "トライアウトと計器での確認で、切ったつもりをなくします。試した操作は元に戻します。" },
    ],
  },
  {
    id: "safety-compliance",
    part: "knowhow",
    title: "安全規格への適合の進め方 — 機械指令/機械規則・CE マーキング・技術文書",
    minutes: 20,
    level: 3,
    lead: "輸出する機械では、安全設計の内容を法令の要求に照らして「適合している」と示す必要があります。EU の機械指令・機械規則を例に、適用法令の特定から技術文書、適合宣言、CE マーキングまでの一般的な流れと、設計者が日頃から残すべき記録を学びます。",
    body: `
<h2>法令と規格の関係</h2>
<p>法令 (EU では指令・規則) は<b>何を達成するか</b> (必須の健康・安全要求事項) を定め、規格は<b>どう達成するか</b>の具体的な方法を示します。EU では、官報に公示された<b>整合規格</b> (例: ISO 12100、ISO 13849-1、IEC 60204-1 などの EN 版) に従うと、その規格が扱う要求事項について<b>適合の推定</b>が得られます。規格の使用は原則として任意ですが、使わない場合は別の方法で同等の安全性を示す必要があり、説明の負担が大きくなります。</p>
<table class="tb-table">
  <tr><th>A 規格 (基本安全規格)</th><td>すべての機械に共通 (ISO 12100: リスクアセスメント)</td></tr>
  <tr><th>B 規格 (グループ安全規格)</th><td>多くの機械に共通の安全面・装置 (ISO 13849-1、ISO 13855、ISO 13857、ISO 14119、ISO 13850、IEC 60204-1 など)</td></tr>
  <tr><th>C 規格 (個別機械安全規格)</th><td>特定の機械 (産業用ロボット ISO 10218 など)。C 規格があればそれを優先し、足りない部分を A・B 規格で補う</td></tr>
</table>
<h2>機械指令から機械規則へ</h2>
<p>EU では長く<b>機械指令 2006/42/EC</b> が使われてきましたが、<b>機械規則 (EU) 2023/1230</b> に置き換わり、2027 年 1 月 20 日から適用される予定です。規則は加盟国の国内法を介さず直接適用され、デジタル形式の取扱説明書、ソフトウェアやネットワーク接続に関わる要求、高リスク機械の扱いなどが見直されています。移行期の案件では<b>どちらが適用されるか</b>を必ず確認してください (上市の時点で判断します)。また、電磁両立性 (EMC) や無線機器など、機械以外の法令が同時に適用されることもあります。</p>
<h2>適合の流れ</h2>
<svg class="tb-chart" viewBox="0 0 520 210" role="img" aria-label="CE マーキングまでの流れ">
<text class="k-title" x="14" y="24">機械を EU 市場に出すまでの流れ (概略)</text>
<g class="k-shadow"><rect class="k-panel" x="10" y="40" width="112" height="56" rx="7"/><circle class="k-badge" cx="26" cy="58" r="9"/><text class="k-badge-t" x="26" y="62" text-anchor="middle">1</text><text class="lbl" x="66" y="84" text-anchor="middle">適用法令の特定</text><line class="k-move" x1="123" y1="68" x2="136" y2="68"/><rect class="k-panel" x="137" y="40" width="112" height="56" rx="7"/><circle class="k-badge" cx="153" cy="58" r="9"/><text class="k-badge-t" x="153" y="62" text-anchor="middle">2</text><text class="lbl" x="193" y="84" text-anchor="middle">必須要求事項</text><line class="k-move" x1="250" y1="68" x2="263" y2="68"/><rect class="k-panel" x="264" y="40" width="112" height="56" rx="7"/><circle class="k-badge" cx="280" cy="58" r="9"/><text class="k-badge-t" x="280" y="62" text-anchor="middle">3</text><text class="lbl" x="320" y="84" text-anchor="middle">リスクアセスメント</text><line class="k-move" x1="377" y1="68" x2="390" y2="68"/><rect class="k-panel" x="391" y="40" width="112" height="56" rx="7"/><circle class="k-badge" cx="407" cy="58" r="9"/><text class="k-badge-t" x="407" y="62" text-anchor="middle">4</text><text class="lbl" x="447" y="84" text-anchor="middle">整合規格の適用</text><rect class="k-panel" x="10" y="130" width="112" height="56" rx="7"/><circle class="k-badge" cx="26" cy="148" r="9"/><text class="k-badge-t" x="26" y="152" text-anchor="middle">5</text><text class="lbl" x="66" y="174" text-anchor="middle">技術文書の作成</text><line class="k-move" x1="123" y1="158" x2="136" y2="158"/><rect class="k-panel" x="137" y="130" width="112" height="56" rx="7" style="stroke:var(--tb-accent)"/><circle class="k-badge" cx="153" cy="148" r="9"/><text class="k-badge-t" x="153" y="152" text-anchor="middle">6</text><text class="lbl" x="193" y="174" text-anchor="middle">適合性評価</text><line class="k-move" x1="250" y1="158" x2="263" y2="158"/><rect class="k-panel" x="264" y="130" width="112" height="56" rx="7"/><circle class="k-badge" cx="280" cy="148" r="9"/><text class="k-badge-t" x="280" y="152" text-anchor="middle">7</text><text class="lbl" x="320" y="174" text-anchor="middle">適合宣言書</text><line class="k-move" x1="377" y1="158" x2="390" y2="158"/><rect class="k-panel" x="391" y="130" width="112" height="56" rx="7"/><circle class="k-badge" cx="407" cy="148" r="9"/><text class="k-badge-t" x="407" y="152" text-anchor="middle">8</text><text class="lbl" x="447" y="174" text-anchor="middle">CE マーキング</text></g>
<path d="M447,97 L447,112 L66,112 L66,128" fill="none" style="stroke:var(--tb-accent)" stroke-width="2" marker-end="url(#k-arrow-blue)"/>
<text class="k-note" x="14" y="200">6: 多くの機械は製造者の自己宣言。特定の高リスク機械は第三者 (ノーティファイドボディ) が関与</text>
</svg>
<p class="tb-caption">図: CE マーキングまでの一般的な流れ (概略)。適合性評価の手続きは機械の種類で異なるので、適用法令の附属書で確認する</p>
<ol class="tb-flow">
  <li><b>適用法令の特定</b>: 機械か、半完成機械か、ほかの法令 (EMC など) も適用されるか</li>
  <li><b>必須要求事項</b>: 附属書の健康・安全要求事項から、この機械に該当する項目を表にする</li>
  <li><b>リスクアセスメント</b>: ISO 12100 に沿って実施 (「リスクアセスメントの進め方」の章)</li>
  <li><b>整合規格の適用</b>: 使う規格と版の一覧を作り、各要求事項をどの規格・設計で満たすかを対応づける</li>
  <li><b>技術文書</b>: 設計の根拠一式をまとめる</li>
  <li><b>適合性評価</b>: 多くは製造者の自己宣言 (内部製造管理)。特定の機械は第三者機関の関与が必要</li>
  <li><b>適合宣言書</b>: 製造者が署名し、適用した法令・規格を記載する</li>
  <li><b>CE マーキング</b>: 機械に表示し、上市後も事故・苦情の情報を設計に反映する</li>
</ol>
<h2>技術文書に入れるもの</h2>
<svg class="tb-chart" viewBox="0 0 520 236" role="img" aria-label="技術文書と銘板">
<text class="k-title" x="14" y="24">技術文書 (社内保管) と、機械に付ける表示</text>
<rect class="k-ground" x="14" y="210" width="260" height="8"/><line class="k-edge" x1="14" y1="210" x2="274" y2="210"/>
<g class="k-shadow"><rect class="k-accent" x="24" y="60" width="36" height="150" rx="3"/><rect x="30" y="76" width="24" height="110" rx="2" style="fill:var(--tb-surface)" opacity="0.85"/><text x="42" y="104" font-size="11" text-anchor="middle" style="fill:var(--tb-text)">図面</text><circle cx="42" cy="196" r="4" style="fill:var(--tb-surface);stroke:var(--k-line)"/><rect class="k-yellow" x="66" y="60" width="36" height="150" rx="3"/><rect x="72" y="76" width="24" height="110" rx="2" style="fill:var(--tb-surface)" opacity="0.85"/><text x="84" y="104" font-size="11" text-anchor="middle" style="fill:var(--tb-text)">RA</text><circle cx="84" cy="196" r="4" style="fill:var(--tb-surface);stroke:var(--k-line)"/><rect class="k-alu" x="108" y="60" width="36" height="150" rx="3"/><rect x="114" y="76" width="24" height="110" rx="2" style="fill:var(--tb-surface)" opacity="0.85"/><text x="126" y="104" font-size="11" text-anchor="middle" style="fill:var(--tb-text)">規格</text><circle cx="126" cy="196" r="4" style="fill:var(--tb-surface);stroke:var(--k-line)"/><rect class="k-plastic" x="150" y="60" width="36" height="150" rx="3"/><rect x="156" y="76" width="24" height="110" rx="2" style="fill:var(--tb-surface)" opacity="0.85"/><text x="168" y="104" font-size="11" text-anchor="middle" style="fill:var(--tb-text)">回路</text><circle cx="168" cy="196" r="4" style="fill:var(--tb-surface);stroke:var(--k-line)"/><rect class="k-accent" x="192" y="60" width="36" height="150" rx="3"/><rect x="198" y="76" width="24" height="110" rx="2" style="fill:var(--tb-surface)" opacity="0.85"/><text x="210" y="104" font-size="11" text-anchor="middle" style="fill:var(--tb-text)">試験</text><circle cx="210" cy="196" r="4" style="fill:var(--tb-surface);stroke:var(--k-line)"/><rect class="k-alu" x="234" y="60" width="36" height="150" rx="3"/><rect x="240" y="76" width="24" height="110" rx="2" style="fill:var(--tb-surface)" opacity="0.85"/><text x="252" y="104" font-size="11" text-anchor="middle" style="fill:var(--tb-text)">取説</text><circle cx="252" cy="196" r="4" style="fill:var(--tb-surface);stroke:var(--k-line)"/></g>
<text class="k-note" x="150" y="48" text-anchor="middle">当局の求めに応じて提出できるように保管</text>
<g class="k-shadow"><rect class="k-alu" x="300" y="60" width="206" height="130" rx="6"/></g>
<circle class="k-part" cx="312" cy="72" r="3"/><circle class="k-part" cx="494" cy="72" r="3"/><circle class="k-part" cx="312" cy="178" r="3"/><circle class="k-part" cx="494" cy="178" r="3"/>
<text x="320" y="88" font-size="12" font-weight="700" fill="#1f2328">製造者名・住所</text>
<text x="320" y="108" font-size="11" fill="#1f2328">機械の名称・型式</text><text x="320" y="126" font-size="11" fill="#1f2328">製造番号</text><text x="320" y="144" font-size="11" fill="#1f2328">製造年</text>
<text x="470" y="160" text-anchor="middle" font-size="30" font-weight="700" fill="#1f2328">CE</text>
<text class="k-note" x="403" y="210" text-anchor="middle">銘板 (表示事項は適用法令で確認)</text>
</svg>
<p class="tb-caption">図: 技術文書は社内で保管し、当局から求められたら提出する。保管期間 (機械指令では上市後 10 年) なども適用法令で確認する</p>
<ul>
  <li>機械の全体図、制御回路図、安全関連部の詳細図と計算 (PL の計算書、安全距離の計算)</li>
  <li>リスクアセスメントの記録 (危険源、低減策、残留リスク)</li>
  <li>適用した規格の一覧と、要求事項ごとの対応表</li>
  <li>試験報告 (停止時間の実測、安全機能の妥当性確認、電気の試験)</li>
  <li>取扱説明書、適合宣言書の写し</li>
</ul>
<p><b>半完成機械</b> (それだけでは用途を果たさず、他の機械に組み込まれるもの) では、CE マーキングではなく<b>組込宣言書</b>と組立説明書を用意し、最終的な機械の製造者が全体の適合を確認します。複数の機械を組み合わせたラインも、全体として 1 つの機械として扱われることがあります。</p>
<h3>よくある間違い</h3>
<ul>
  <li>部品が CE 適合なので機械も適合と考える — 組み合わせた機械全体の評価が必要</li>
  <li>規格の版を確認しない — 公示から外れた古い版では適合の推定が得られないことがある</li>
  <li>出荷直前に書類を作る — 設計の根拠は設計中に記録しないと再現できない</li>
  <li>改造後に評価をやり直さない — 大きな改造は新しい機械の上市とみなされる場合がある</li>
</ul>
<p>日本国内では、厚生労働省の「機械の包括的な安全基準に関する指針」が ISO 12100 と同じ考え方 (リスクアセスメントと 3 ステップ) を示しています。</p>
<div class="tb-tip"><b>規格・法令について</b>: この章は学習用の要約です。規格・法令は改訂されます (例: EU では機械指令 2006/42/EC が機械規則 (EU) 2023/1230 に置き換わり、2027 年 1 月から適用予定)。実務では必ず最新の原文、官報、所管当局・専門機関の情報を確認してください。</div>`,
    points: [
      "法令は「何を」、整合規格は「どう」を示す。整合規格の適用で適合の推定が得られる",
      "EU では機械指令 2006/42/EC から機械規則 (EU) 2023/1230 へ移行 — 適用版を必ず確認",
      "流れ: 法令特定 → 要求事項 → RA → 規格 → 技術文書 → 適合性評価 → 宣言 → CE",
      "技術文書は設計の根拠そのもの。設計中に記録し、改造時は再評価する",
    ],
    exercises: [
      {
        q: "ロボットセル (ロボット・ライトカーテン・インターロック扉・安全 PLC) を EU に出荷します。要求事項と規格の対応表を作るとき、次の 4 項目に使う規格を本書の章から挙げてください: (a) リスクアセスメント、(b) 安全制御の PL、(c) ライトカーテンの位置、(d) 非常停止。",
        a: "(a) ISO 12100、(b) ISO 13849-1 (または IEC 62061)、(c) ISO 13855、(d) ISO 13850 と IEC 60204-1 (停止カテゴリ)。ロボット自体とセルには C 規格の ISO 10218 が関係し、C 規格の要求を優先します。各規格の版が整合規格として公示されているかも確認します。",
      },
      {
        q: "出荷 1 か月前に「技術文書を作って」と頼まれました。設計中に残しておくべきだった記録を 4 つ挙げ、今からできる対応を述べてください。",
        a: "例: リスクアセスメントの記録と更新履歴、PL の計算書 (部品の MTTFD・DC の根拠)、安全距離の計算と停止時間の実測値、安全機能の試験記録、設計審査の議事録。今からは、実機で停止時間・安全機能を試験して記録し、リスクアセスメントを見直して残留リスクを取説と照合します。次の案件からは、設計審査ごとに技術文書のフォルダを更新する運用にします。",
      },
    ],
    quiz: [
      { q: "整合規格に従って設計する効果は?", choices: ["法令が適用されなくなる", "その規格が扱う要求事項について適合の推定が得られる", "第三者の審査が必ず不要になる"], answer: 1, explain: "整合規格への適合は、対応する要求事項への適合の推定を与えます。" },
      { q: "A・B・C 規格のうち、特定の機械向けで優先して使うのは?", choices: ["A 規格", "B 規格", "C 規格"], answer: 2, explain: "C 規格があればそれを優先し、不足を A・B 規格で補います。" },
      { q: "半完成機械に用意するものは?", choices: ["CE マーキングだけ", "組込宣言書と組立説明書", "何も要らない"], answer: 1, explain: "半完成機械は組込宣言書と組立説明書を用意し、最終製造者が全体の適合を確認します。" },
    ],
  },
];
