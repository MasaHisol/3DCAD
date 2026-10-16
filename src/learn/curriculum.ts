// 3D 設計の学習カリキュラム (アプリ内チュートリアル + 確認テスト + 総合演習)。
// 各ステップの check は LearnState の純関数で、操作が終わると自動で次へ進みます。
import type { ExtrudeFeature, FilletFeature, HoleFeature, PatternFeature, RevolveFeature, ShellFeature, ChamferFeature } from "../core/types";
import { sampleDocument } from "../samples";
import { constraintCount, count, dims, drawing, editing, has, hasDim, near, sketches, userParams, usesUserParam, val, views } from "./checks";
import { blockStarter, pinAssemblyStarter, plateStarter } from "./starters";
import type { Chapter, Exercise, GlossaryEntry, LearnState } from "./types";

const inSketch = (s: LearnState) => !!editing(s);
/** Two circles of the edited sketch share a centre point (by id or position). */
function concentricPair(s: LearnState): boolean {
  const sk = editing(s);
  if (!sk) return false;
  const pts = new Map(sk.entities.filter((e) => e.type === "point").map((p) => [p.id, p as { x: number; y: number }]));
  const cs = sk.entities.filter((e) => e.type === "circle" && !e.construction) as { c: string }[];
  for (let i = 0; i < cs.length; i++)
    for (let j = i + 1; j < cs.length; j++) {
      const a = pts.get(cs[i].c);
      const b = pts.get(cs[j].c);
      if (cs[i].c === cs[j].c || (a && b && Math.hypot(a.x - b.x, a.y - b.y) < 1e-4)) return true;
    }
  return false;
}
const firstExtrude = (s: LearnState) => s.part.features.find((f): f is ExtrudeFeature => f.type === "extrude");

export const CURRICULUM: Chapter[] = [
  // ------------------------------------------------------------------ 1 ---
  {
    id: "basics",
    title: "第 1 章 はじめの一歩",
    desc: "3D CAD の考え方、画面の見方と視点の操作、フィーチャ履歴とパラメトリック設計の基本を体験します。",
    lessons: [
      {
        id: "1-1",
        title: "3D CAD の世界へ — 画面と視点の操作",
        minutes: 10,
        level: 1,
        goals: ["画面の各部 (リボン・ブラウザ・ビュー・ViewCube) の役割がわかる", "マウスで視点を自由に動かせる", "表示スタイルと断面表示を切り替えられる"],
        theory: `
<p><b>3D CAD</b> (Computer-Aided Design) は、部品の形をコンピュータ上に<b>ソリッド (中身の詰まった立体)</b> として作る道具です。
紙の図面と違い、体積・質量・重心を正確に計算でき、そのまま図面化・強度解析・3D プリント・NC 加工へつなげられます。</p>
<p>このアプリは <b>パラメトリック フィーチャ ベース</b> の CAD です。形は「スケッチ → 押し出し → 穴 → フィレット…」という
<b>フィーチャ (作業) の積み重ね</b>で記録され、寸法 (パラメータ) を変えるといつでも形を作り直せます。</p>
<div class="ln-figure">
  <div><b>リボン</b>(上) — コマンドのボタン。タブで切り替え</div>
  <div><b>モデル ブラウザ</b>(左) — フィーチャの履歴 (作った順)</div>
  <div><b>グラフィックス ビュー</b>(中央) — 3D モデル</div>
  <div><b>ViewCube</b>(右上) — 視点の向きを切り替え</div>
  <div><b>タイムライン</b>(下) — 履歴をアイコンで表示</div>
  <div><b>ステータスバー</b>(最下段) — 次に何をすればよいかの案内</div>
</div>
<p class="ln-note">このレッスンではサンプルの「ブラケット」を開いて操作します。</p>`,
        setup: { kind: "part", make: sampleDocument },
        steps: [
          { text: "<b>オービット (回転)</b>: <kbd>Shift</kbd>+マウス中ボタン ドラッグ (または <kbd>Alt</kbd>+左ドラッグ) でモデルを回してみましょう。", hint: "マウス操作はオプション (歯車アイコン) で SOLIDWORKS / Fusion 360 などと同じ割り当てに変更できます。" },
          { text: "<b>画面移動</b>: 中ボタン ドラッグ、<b>ズーム</b>: ホイール。カーソル位置を中心に拡大されます。" },
          { text: "右上の <b>ViewCube</b> の「上」の面をクリックして真上から見てみましょう。角をクリックすると斜めから見られます。", hint: "家のアイコン (ホーム) または <kbd>F6</kbd> で最初の向きに戻ります。" },
          { text: "<b>表示</b>タブの <b>ワイヤフレーム</b> を押して、エッジだけの表示にしてみましょう。", tab: "view", ui: "st-w", check: (s) => s.style === "wireframe" },
          { text: "<b>エッジ付き</b> を押して通常の表示に戻します。", tab: "view", ui: "st-se", check: (s) => s.style === "shadedEdges" },
          { text: "<b>断面図</b> を押して、モデルを切った断面を見てみましょう。中の穴の形がよくわかります。", tab: "view", ui: "section", check: (s) => s.section },
          { text: "もう一度 <b>断面図</b> を押して断面表示を解除します。", tab: "view", ui: "section", check: (s) => !s.section },
          { text: "<kbd>F6</kbd> (ホーム ビュー) を押して最初の視点に戻りましょう。これでレッスン完了です。", tab: "view", ui: "home" },
        ],
        summary: ["回転 = Shift+中ボタン、移動 = 中ボタン、ズーム = ホイール", "ViewCube で正面・上面・等角などの標準の向きに素早く切り替えられる", "ワイヤフレームや断面図で、見えない内部の形も確認できる"],
        quiz: [
          { q: "パラメトリック CAD の特徴として正しいものはどれ?", choices: ["寸法を変えると形が作り直される", "一度作った形は変更できない", "形は点の集まり (メッシュ) で記録される"], answer: 0, explain: "フィーチャの履歴とパラメータで形を記録しているため、寸法を変えると履歴をたどって形が再計算されます。" },
          { q: "モデルを真上から見たいときに便利なのは?", choices: ["タイムライン", "ViewCube", "ステータスバー"], answer: 1, explain: "ViewCube の面・エッジ・角をクリックすると、その方向からの視点に切り替わります。" },
          { q: "内部の穴の形を確認するのに適した表示は?", choices: ["リアル表示", "断面図", "透視投影"], answer: 1, explain: "断面図はモデルを平面で切断して表示するので、内部の形状がわかります。" },
        ],
      },
      {
        id: "1-2",
        title: "フィーチャ履歴とパラメトリック設計",
        minutes: 12,
        level: 1,
        goals: ["モデル ブラウザから形の作り方 (設計手順) を読み取れる", "パラメータを変更して形を変えられる", "パーツの終わり (ロールバック) で途中の状態を確認できる"],
        theory: `
<p>モデル ブラウザには、形を作った<b>手順 (フィーチャ)</b> が上から順に並んでいます。CAD はこの手順を毎回上から実行して形を作ります。</p>
<ol>
  <li><b>スケッチ</b> — 平面上に描いた 2D の輪郭 (寸法付き)</li>
  <li><b>押し出し・回転</b> — スケッチから立体を作る</li>
  <li><b>穴・フィレット・パターン</b> — 立体を加工・修正する</li>
</ol>
<p>すべての寸法は <code>d0, d1 …</code> や <code>幅</code> のような <b>パラメータ</b> になっていて、<b>式</b> (<code>幅 / 2 + 5</code>) でつなげられます。
「この穴は常に板の中央」のような<b>設計意図</b>を式で表現しておくと、寸法変更に強いモデルになります。</p>
<p>ブラウザの一番下にある <b>パーツの終わり</b> マーカーを上にドラッグすると、その時点まで<b>巻き戻した (ロールバック)</b> 状態を見られます。</p>`,
        setup: { kind: "part", make: sampleDocument },
        steps: [
          { text: "左の<b>モデル ブラウザ</b>を上から読んでみましょう。スケッチ1 → 押し出し1 (板) → 作業平面1 → スケッチ2 → 押し出し2 (ボス) … と、形を作った順番が並んでいます。" },
          { text: "<b>3D モデル</b>タブの <b>パラメータ</b> (fx) を開き、ユーザ パラメータ <b>幅</b> の式を <code>100</code> に変更しましょう。板が伸び、穴の位置も追従します。", tab: "model", ui: "params", check: (s) => near(s.values.get("幅"), 100) },
          { text: "続けて <b>板厚</b> を <code>15</code> に変更しましょう。ボスの位置 (作業平面) も板の上面に追従します。", tab: "model", ui: "params", check: (s) => near(s.values.get("板厚"), 15), hint: "作業平面1 のオフセットが「板厚」という式になっているため、板が厚くなってもボスは板の上に乗ったままです。これが設計意図です。" },
          { text: "パラメータ ダイアログを閉じ、ブラウザ下端の <b>パーツの終わり</b> (赤い線) を <b>押し出し2</b> の下までドラッグしてロールバックしてみましょう。", check: (s) => s.part.endOfPart < s.part.features.length && s.command === null, hint: "下のタイムラインのマーカーをドラッグしても同じです。" },
          { text: "<b>パーツの終わり</b> を一番下までドラッグして戻します。すべてのフィーチャが再び有効になります。", check: (s) => s.part.endOfPart === s.part.features.length },
          { text: "ブラウザの <b>フィレット1</b> をダブルクリックすると、そのフィーチャを後から編集できます (確認したら キャンセル)。これでレッスン完了です。" },
        ],
        summary: ["形は「フィーチャの履歴」として記録され、上から順に再計算される", "寸法はパラメータ。式でつなぐと設計意図を保ったまま寸法を変えられる", "パーツの終わりで途中の状態に戻して確認・挿入ができる"],
        quiz: [
          { q: "「穴をいつも板の中央に置きたい」とき、穴の位置寸法の式として適切なのは?", choices: ["40", "幅 / 2", "d3 + 10"], answer: 1, explain: "板の幅パラメータを使って「幅 / 2」とすると、幅が変わっても常に中央になります。" },
          { q: "フィーチャ履歴で、フィレットはふつう どの段階で作るのがよい?", choices: ["最初 (スケッチより前)", "主要な形ができた後の最後のほう", "どこでも同じ"], answer: 1, explain: "フィレットや面取りは仕上げのフィーチャ。後のフィーチャがフィレットのエッジに依存すると変更に弱くなるため、最後のほうに置くのが定石です。" },
        ],
      },
    ],
  },
  // ------------------------------------------------------------------ 2 ---
  {
    id: "sketch",
    title: "第 2 章 スケッチ — 形の設計図を描く",
    desc: "すべての立体の元になる 2D スケッチの描き方と、拘束・寸法で形を確定させる方法を学びます。",
    lessons: [
      {
        id: "2-1",
        title: "はじめてのスケッチ — 長方形を描く",
        minutes: 8,
        level: 1,
        goals: ["スケッチ平面を選んでスケッチを開始できる", "長方形を描き、スケッチを終了できる"],
        theory: `
<p>立体を作る最初の一歩は <b>2D スケッチ</b> です。スケッチは<b>平面の上に描く輪郭</b>で、あとで押し出したり回転したりして立体にします。</p>
<p>スケッチを描く平面は、原点にある 3 つの<b>基準平面</b> (XY・YZ・XZ) か、すでにある立体の<b>平らな面</b>から選びます。
このアプリは Y 軸が上向きなので、床に置く板などは <b>XZ 平面</b> (水平) に描くのが自然です。</p>
<p class="ln-note">コツ: 寸法は後から正確に入れられるので、最初は「だいたいの形」で描いて大丈夫です。</p>`,
        setup: { kind: "newPart" },
        steps: [
          { text: "<b>2D スケッチ</b> (<kbd>S</kbd>) を押し、表示された基準平面のうち水平な <b>XZ 平面</b> をクリックします。", tab: "model", ui: "sketch", check: inSketch, hint: "平面は半透明の四角で表示されます。左のブラウザの「原点」から平面を選ぶこともできます。" },
          { text: "<b>長方形</b> (<kbd>R</kbd>) を選び、1 点目と対角の 2 点目をクリックして長方形を描きます。", tab: "sketch", ui: "sk-rect", check: (s) => count(editing(s), "line") >= 4, hint: "2 点目の前に <kbd>60</kbd> <kbd>Tab</kbd> <kbd>40</kbd> <kbd>Enter</kbd> と入力すると、幅と高さを数値で指定できます。" },
          { text: "<kbd>Esc</kbd> でツールを終え、<b>スケッチを終了</b> (<kbd>Ctrl</kbd>+<kbd>Enter</kbd>) を押して 3D に戻ります。", tab: "sketch", ui: "sk-finish", check: (s) => s.mode === "model" && sketches(s).some((k) => count(k, "line") >= 4) },
          { text: "ブラウザに <b>スケッチ1</b> が追加されました。ダブルクリックするとスケッチを再編集できます。これでレッスン完了です。" },
        ],
        summary: ["立体はスケッチ (2D の輪郭) から作る", "スケッチ平面は基準平面か、平らな面を選ぶ", "長方形は数値入力 (幅 Tab 高さ) で正確に描ける"],
        quiz: [
          { q: "水平な板の輪郭を描くのに適した基準平面は? (このアプリは Y 軸が上)", choices: ["XY 平面", "XZ 平面", "YZ 平面"], answer: 1, explain: "Y 軸が上向きなので、水平面は X と Z を含む XZ 平面です。" },
          { q: "スケッチを終了するショートカットは?", choices: ["Ctrl+Enter", "Ctrl+S", "F6"], answer: 0, explain: "Ctrl+Enter でスケッチ環境を終了し、3D モデルに戻ります。" },
        ],
      },
      {
        id: "2-2",
        title: "拘束と寸法 — 完全拘束を目指す",
        minutes: 12,
        level: 1,
        goals: ["幾何拘束 (水平・垂直など) の役割がわかる", "寸法を記入して大きさを決められる", "完全拘束の状態にできる"],
        theory: `
<p>スケッチの形は <b>拘束</b> と <b>寸法</b> で決まります。</p>
<ul>
  <li><b>幾何拘束</b> — 形の関係: 水平・垂直・平行・直交・一致・正接・等値・同心 など</li>
  <li><b>寸法拘束</b> — 大きさと位置: 長さ・距離・直径・角度</li>
</ul>
<p>長方形は 4 本の線と 4 つの点でできていて、1 点につき X・Y の 2 つの<b>自由度</b>があります。
水平・垂直拘束と寸法でこの自由度を 1 つずつ消していき、<b>残り自由度 0 = 完全拘束</b> になると、形も位置も一意に決まります。</p>
<p>完全拘束にしておくと、後で寸法を変えたときに形が予想外に崩れません。ステータスバー右側に「<b>✓ 完全拘束</b>」または「あと何個の寸法/拘束が必要か」が表示されます。</p>`,
        setup: { kind: "newPart" },
        steps: [
          { text: "<b>2D スケッチ</b> (<kbd>S</kbd>) を開始して <b>XZ 平面</b> を選びます。", tab: "model", ui: "sketch", check: inSketch },
          { text: "<b>長方形</b> (<kbd>R</kbd>) で、原点から少し離れた位置に長方形を描きます。水平・垂直拘束が自動で付きます。", tab: "sketch", ui: "sk-rect", check: (s) => count(editing(s), "line") >= 4 && constraintCount(editing(s), "horizontal") + constraintCount(editing(s), "vertical") >= 2 },
          { text: "<b>寸法</b> (<kbd>D</kbd>) を選び、下の辺をクリック → 置き場所をクリック → 値に <code>80</code> を入力して <kbd>Enter</kbd>。", tab: "sketch", ui: "sk-dimension", check: (s) => hasDim(s, editing(s), 80) },
          { text: "同じように縦の辺に <code>50</code> の寸法を記入します。", tab: "sketch", ui: "sk-dimension", check: (s) => hasDim(s, editing(s), 50) },
          { text: "最後に位置を決めます。原点と長方形の角の点を順にクリックして水平・垂直の距離寸法を付け、ステータスバーが <b>✓ 完全拘束</b> になるまで続けましょう。", tab: "sketch", ui: "sk-dimension", check: (s) => !!s.sketch && s.sketch.ok && s.sketch.dof === 0, hint: "角の点を原点に重ねる (一致拘束) 方法もあります。中心を原点にしたいときは、対角線をコンストラクション線で引いてその中点を原点に一致させます。" },
          { text: "<b>スケッチを終了</b> (<kbd>Ctrl</kbd>+<kbd>Enter</kbd>) します。これでレッスン完了です。", tab: "sketch", ui: "sk-finish", check: (s) => s.mode === "model" },
        ],
        summary: ["拘束 = 形の関係、寸法 = 大きさと位置", "自由度が 0 になると完全拘束 — 形と位置が一意に決まる", "完全拘束にしておくと寸法変更で形が崩れない"],
        quiz: [
          { q: "平面上の 1 つの点が持つ自由度はいくつ?", choices: ["1", "2", "3"], answer: 1, explain: "平面上の点は X と Y の 2 方向に動けるので自由度は 2 です。" },
          { q: "完全拘束の状態とは?", choices: ["寸法が 1 つ以上ある", "残りの自由度が 0", "線がすべて水平か垂直"], answer: 1, explain: "すべての自由度が拘束・寸法で消された状態が完全拘束です。" },
          { q: "2 本の線を常に同じ長さにしたいときの拘束は?", choices: ["平行", "等値", "一致"], answer: 1, explain: "等値拘束で 2 つの線分の長さ (円なら半径) を等しく保てます。" },
        ],
      },
      {
        id: "2-3",
        title: "円・同心・コンストラクション線",
        minutes: 10,
        level: 1,
        goals: ["円を描き直径寸法を付けられる", "同心拘束の意味がわかる", "コンストラクション (補助) 線を使える"],
        theory: `
<p>円は<b>中心点と半径</b>で決まります。軸や穴、パイプなど丸い形の多くは円のスケッチから作ります。</p>
<p><b>同心拘束</b>は 2 つの円 (円弧) の中心を一致させます。パイプの外径と内径のように、中心がずれてはいけない形に使います。
円を描くとき中心を既存の中心点に合わせると、自動的に一致します。</p>
<p><b>コンストラクション線</b> (補助線) は立体の輪郭にならない線です。回転の軸や対称の基準、寸法の基準として使います。破線で表示されます。</p>`,
        setup: { kind: "newPart" },
        steps: [
          { text: "<b>2D スケッチ</b> を <b>XZ 平面</b> に開始します。", tab: "model", ui: "sketch", check: inSketch },
          { text: "<b>円</b> (<kbd>C</kbd>) で、<b>原点</b>をクリックして中心にし、円を描きます。続けて同じ中心から小さい円をもう 1 つ描きます。", tab: "sketch", ui: "sk-circle", check: (s) => count(editing(s), "circle") >= 2 },
          { text: "2 つの円の中心がそろっていることを確認します (そろっていなければ <b>同心</b> 拘束で 2 つの円をクリック)。", tab: "sketch", ui: "sk-concentric", check: concentricPair },
          { text: "<b>寸法</b> (<kbd>D</kbd>) で外側の円に <code>40</code>、内側の円に <code>20</code> の直径寸法を記入します。", tab: "sketch", ui: "sk-dimension", check: (s) => hasDim(s, editing(s), 40, ["diameter"]) && hasDim(s, editing(s), 20, ["diameter"]), hint: "円をクリックすると直径寸法になります。" },
          { text: "<b>線分</b> (<kbd>L</kbd>) で円を横切る線を 1 本描き、選択して <b>コンストラクション</b> に切り替えます (破線になります)。", tab: "sketch", ui: ["sk-line", "sk-construction"], check: (s) => count(editing(s), "line", true) >= 1, hint: "線を描いたら Esc → 線をクリックで選択 → リボンの「コンストラクション」。" },
          { text: "<b>スケッチを終了</b> します。これでリング形状 (ワッシャ) の輪郭ができました。レッスン完了です。", tab: "sketch", ui: "sk-finish", check: (s) => s.mode === "model" },
        ],
        summary: ["円は中心と直径 (半径) で決まる", "同心拘束で中心をそろえる — 原点や既存の中心にスナップすると自動で一致", "コンストラクション線は輪郭にならない補助線 (軸・対称・寸法基準)"],
        quiz: [
          { q: "回転フィーチャの軸として使う線は、ふつう何にする?", choices: ["コンストラクション線", "太い線", "寸法線"], answer: 0, explain: "コンストラクション線は立体の輪郭に含まれないため、回転軸や対称軸として使えます。" },
          { q: "2 つの円の中心を常に一致させる拘束は?", choices: ["正接", "同心", "等値"], answer: 1, explain: "同心拘束は円・円弧の中心を一致させます。" },
        ],
      },
    ],
  },
  // ------------------------------------------------------------------ 3 ---
  {
    id: "features",
    title: "第 3 章 立体を作る — 基本フィーチャ",
    desc: "押し出し・切り取り・穴・回転で立体を作り、フィレット・面取り・シェル・パターンで仕上げます。",
    lessons: [
      {
        id: "3-1",
        title: "押し出し — 平面から立体へ",
        minutes: 10,
        level: 1,
        goals: ["スケッチを押し出してソリッドを作れる", "フィーチャを後から編集できる"],
        theory: `
<p><b>押し出し</b>はスケッチの閉じた輪郭 (<b>プロファイル</b>) を、平面に垂直な方向へ伸ばして立体にする、最もよく使うフィーチャです。</p>
<ul>
  <li><b>範囲</b>: 距離 / 対称 (両側に半分ずつ) / 貫通 (すべて)</li>
  <li><b>演算</b>: 新規ソリッド・<b>接合</b> (足す)・<b>切り取り</b> (削る)・交差 (共通部分)</li>
</ul>
<p>この「足す・削る」の考え方を <b>ブール演算</b> と呼びます。多くの部品は「ベースの形を押し出し → 切り取りで削る → 接合で足す」で作れます。</p>`,
        setup: { kind: "newPart" },
        steps: [
          { text: "<b>2D スケッチ</b> を <b>XZ 平面</b> に開始します。", tab: "model", ui: "sketch", check: inSketch },
          { text: "長方形を描き、<b>寸法</b>で幅 <code>60</code>、奥行 <code>40</code> にします。", tab: "sketch", ui: ["sk-rect", "sk-dimension"], check: (s) => hasDim(s, editing(s), 60) && hasDim(s, editing(s), 40), hint: "長方形の数値入力 (60 Tab 40 Enter) でも寸法が自動で付きます。" },
          { text: "<b>スケッチを終了</b> します。", tab: "sketch", ui: "sk-finish", check: (s) => s.mode === "model" },
          { text: "<b>押し出し</b> (<kbd>E</kbd>) を押し、距離を <code>20</code> にして <b>OK</b> (<kbd>Enter</kbd>)。", tab: "model", ui: "extrude", check: (s) => has<ExtrudeFeature>(s, "extrude", (f) => near(val(s, f.distance), 20)) && s.bodies > 0, hint: "プロファイルが 1 つだけなら自動で選択されます。複数あるときは押し出したい領域をクリックします。" },
          { text: "ブラウザの <b>押し出し1</b> をダブルクリックして編集し、距離を <code>30</code> に変えて OK。", check: (s) => has<ExtrudeFeature>(s, "extrude", (f) => near(val(s, f.distance), 30)) },
          { text: "直方体ができました。<b>ViewCube</b> で回して確認しましょう。レッスン完了です。" },
        ],
        summary: ["押し出し = プロファイルを平面に垂直に伸ばす", "演算 (新規・接合・切り取り・交差) で形を足したり削ったりする", "フィーチャはダブルクリックでいつでも編集できる"],
        quiz: [
          { q: "板に貫通した四角い穴をあける押し出しの設定は?", choices: ["接合 + 距離", "切り取り + 貫通", "交差 + 対称"], answer: 1, explain: "切り取りで材料を削り、範囲を「貫通」にすると板厚が変わっても必ず貫通します。" },
          { q: "スケッチ平面の両側に同じ量だけ押し出す範囲は?", choices: ["対称", "反転", "貫通"], answer: 0, explain: "対称は指定距離をスケッチ平面の両側に半分ずつ押し出します。" },
        ],
      },
      {
        id: "3-2",
        title: "切り取りと穴あけ",
        minutes: 12,
        level: 1,
        goals: ["立体の面の上にスケッチできる", "切り取りの押し出しで材料を削れる", "穴フィーチャでボルト用の穴をあけられる"],
        theory: `
<p>立体ができたら、その<b>平らな面</b>を選んで新しいスケッチを描けます。面に描いたスケッチは、元の立体の寸法が変わっても面に追従します。</p>
<p>円を描いて<b>切り取り</b>で押し出すと穴になりますが、実際の設計では <b>穴フィーチャ</b> を使うのが一般的です。</p>
<ul>
  <li>座ぐり・皿穴、ボルト用の<b>キリ穴</b> (ISO 273)、<b>ねじ穴</b> (タップ) を規格どおりの寸法で作れる</li>
  <li>図面では「4×M6 深さ12」のような<b>穴注記</b>が自動で入る</li>
</ul>
<p class="ln-note">このレッスンは 60 × 40 × 15 の練習ブロックから始まります。</p>`,
        setup: { kind: "part", make: blockStarter },
        steps: [
          { text: "<b>2D スケッチ</b> (<kbd>S</kbd>) を押し、ブロックの<b>上面</b>をクリックしてスケッチを開始します。", tab: "model", ui: "sketch", check: (s) => inSketch(s) && sketches(s).length >= 2 },
          { text: "上面の中央付近に <b>円</b> を描き、直径 <code>20</code> の寸法を付けます。", tab: "sketch", ui: ["sk-circle", "sk-dimension"], check: (s) => hasDim(s, editing(s), 20, ["diameter", "radius"]) || hasDim(s, editing(s), 10, ["radius"]) },
          { text: "<b>スケッチを終了</b> します。", tab: "sketch", ui: "sk-finish", check: (s) => s.mode === "model" },
          { text: "<b>押し出し</b> で円の内側をプロファイルに選び、演算を <b>切り取り</b>、範囲を <b>貫通</b> にして OK。", tab: "model", ui: "extrude", check: (s) => has<ExtrudeFeature>(s, "extrude", (f) => f.op === "cut"), hint: "プロパティ パネルの演算アイコン (接合 / 切り取り / 交差) で切り替えます。向きが逆なら「反転」。" },
          { text: "次は <b>穴</b> (<kbd>H</kbd>) コマンドです。上面の角の近くをクリックし、種類 <b>座ぐり</b> やボルト用キリ穴を試してから OK。", tab: "model", ui: "hole", check: (s) => has<HoleFeature>(s, "hole") },
          { text: "<b>表示 → 断面図</b> で穴の断面を確認しましょう (確認したら解除)。レッスン完了です。", tab: "view", ui: "section" },
        ],
        summary: ["立体の平らな面にもスケッチできる (面の位置に追従)", "切り取りの押し出しで材料を削る", "ボルト穴・ねじ穴は穴フィーチャで規格寸法どおりに作る"],
        quiz: [
          { q: "M6 のボルトを通す穴 (キリ穴) の直径として適切なのは?", choices: ["5.0 mm", "6.6 mm", "12 mm"], answer: 1, explain: "ISO 273 / JIS の 2 級 (中) で M6 のキリ穴は 6.6 mm。ボルトが通るように呼び径より少し大きくします。" },
          { q: "ボルトの頭を沈めるための段付きの穴は?", choices: ["皿穴", "座ぐり穴", "ねじ穴"], answer: 1, explain: "座ぐり穴は六角穴付きボルトの頭が面から出ないように段を付けた穴です。皿穴は皿ねじ用の円すい形です。" },
        ],
      },
      {
        id: "3-3",
        title: "回転 — 軸対称の部品を作る",
        minutes: 12,
        level: 2,
        goals: ["回転軸と断面形状のスケッチが描ける", "回転フィーチャで軸対称の部品を作れる"],
        theory: `
<p><b>回転</b>は、断面の形を<b>軸のまわりに 1 回転</b>させて立体を作ります。シャフト・プーリー・ノブ・ボトルなど、
<b>旋盤で削るような軸対称の部品</b>に使います。</p>
<p>ポイントは 2 つです。</p>
<ol>
  <li>断面は<b>軸の片側だけ</b>に描く (軸をまたぐと形が自己交差します)</li>
  <li>軸は<b>コンストラクション線</b>で描く — このアプリは自動で回転軸として認識します</li>
</ol>
<p>正面から見た形を描くので、<b>XY 平面</b> にスケッチします。</p>`,
        setup: { kind: "newPart" },
        steps: [
          { text: "<b>2D スケッチ</b> を <b>XY 平面</b> (正面) に開始します。", tab: "model", ui: "sketch", check: inSketch },
          { text: "<b>線分</b>で原点を通る縦の線を描き、<b>コンストラクション</b>に切り替えます。これが回転軸です。", tab: "sketch", ui: ["sk-line", "sk-construction"], check: (s) => count(editing(s), "line", true) >= 1 },
          { text: "軸の右側に、段付きの軸の半分の断面 (閉じた多角形) を<b>線分</b>で描きます。最初と最後の点は軸の上に置きます。", tab: "sketch", ui: "sk-line", check: (s) => count(editing(s), "line") >= 4, hint: "例: (0,0) → (15,0) → (15,20) → (8,20) → (8,60) → (0,60) → 軸へ戻る。寸法はあとで付けられます。" },
          { text: "<b>スケッチを終了</b> します。", tab: "sketch", ui: "sk-finish", check: (s) => s.mode === "model" },
          { text: "<b>回転</b> (<kbd>R</kbd>) を押し、範囲 <b>全周</b> のまま OK。", tab: "model", ui: "revolve", check: (s) => has<RevolveFeature>(s, "revolve") && s.bodies > 0, hint: "軸が認識されないときは、パネルの「軸」でコンストラクション線を選びます。" },
          { text: "断面図で中身が詰まった軸になっていることを確認しましょう。レッスン完了です。", tab: "view", ui: "section" },
        ],
        summary: ["回転 = 断面を軸のまわりに回す (軸対称の部品向け)", "断面は軸の片側に閉じた形で描く", "軸はコンストラクション線で描く"],
        quiz: [
          { q: "回転フィーチャに向いている部品は?", choices: ["L 形のブラケット", "段付きシャフト", "板金の箱"], answer: 1, explain: "シャフトは軸対称なので、断面を 1 つ描いて回転させるのが最も簡単です。" },
          { q: "回転の断面が軸をまたいでいると どうなる?", choices: ["自動で修正される", "形が自己交差してエラーになりやすい", "2 倍の太さになる"], answer: 1, explain: "軸をまたぐ断面は回転させると自分自身と重なるため、正しいソリッドになりません。" },
        ],
      },
      {
        id: "3-4",
        title: "フィレット・面取り・シェル",
        minutes: 12,
        level: 2,
        goals: ["エッジを丸め (フィレット)・面取りできる", "シェルで中空の形状を作れる", "仕上げフィーチャの順番の考え方がわかる"],
        theory: `
<p>角が鋭いままの部品は、手を切りやすく、<b>応力集中</b>で割れやすく、成形もしにくくなります。そこで仕上げに次のフィーチャを使います。</p>
<ul>
  <li><b>フィレット</b> — エッジを半径 R で丸める (応力集中の緩和・安全・見た目)</li>
  <li><b>面取り</b> — エッジを斜めに削る (C1, C2 など。組立のガイド・バリ取り)</li>
  <li><b>シェル</b> — 面を取り除いて一定の肉厚の中空形状にする (ケース・カバー・成形品)</li>
</ul>
<p class="ln-note">シェルはフィレットの<b>後</b>に行うと、内側にも丸みの付いたきれいな肉厚になります。フィーチャの順番で結果が変わります。</p>`,
        setup: { kind: "part", make: blockStarter },
        steps: [
          { text: "<b>フィレット</b> (<kbd>F</kbd>) を押し、ブロックの<b>縦の 4 本のエッジ</b>をクリックして、半径 <code>5</code> で OK。", tab: "model", ui: "fillet", check: (s) => has<FilletFeature>(s, "fillet", (f) => f.edges.length >= 1), hint: "エッジにカーソルを合わせると強調表示されます。ビューを回して裏側のエッジも選びましょう。" },
          { text: "<b>面取り</b> (<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>K</kbd>) で上面の外周のエッジを選び、距離 <code>1</code> で OK。", tab: "model", ui: "chamfer", check: (s) => has<ChamferFeature>(s, "chamfer") },
          { text: "<b>シェル</b> で<b>底面</b> (取り除く面) をクリックし、厚さ <code>2</code> で OK。底の開いた箱 (カバー) になります。", tab: "model", ui: "shell", check: (s) => has<ShellFeature>(s, "shell", (f) => f.faces.length >= 1), hint: "底面はビューを回すか、ViewCube の「下」から選びます。" },
          { text: "<b>断面図</b> で肉厚が一定になっていることを確認しましょう。" , tab: "view", ui: "section" },
          { text: "試しにブラウザで <b>シェル1</b> を <b>パーツの終わり</b> の下へロールバックしてみると、フィレットだけの状態に戻せます。最後に戻してレッスン完了です。" },
        ],
        summary: ["フィレット = 丸め、面取り = 斜めに削る (C 面取り)", "シェル = 面を取り除いて一定肉厚の中空にする", "仕上げフィーチャは順番で結果が変わる — フィレット → シェルが基本"],
        quiz: [
          { q: "内側の角 (入隅) にフィレットを付ける主な目的は?", choices: ["軽量化", "応力集中を和らげる", "色を変える"], answer: 1, explain: "鋭い入隅には応力が集中して割れの起点になります。丸めると応力が分散します。" },
          { q: "「C2」と指示された面取りの意味は?", choices: ["45° で 2 mm の面取り", "半径 2 mm の丸め", "2 か所の面取り"], answer: 0, explain: "JIS では 45° の面取りを C と寸法で表します。C2 = 2 mm × 45°。" },
        ],
      },
      {
        id: "3-5",
        title: "パターンとミラー — 繰り返しと対称",
        minutes: 10,
        level: 2,
        goals: ["矩形状パターンでフィーチャを 1 方向・2 方向に並べられる", "元フィーチャの変更がコピーに伝わることがわかる", "ミラー・円形状パターンの使いどころがわかる"],
        theory: `
<p>同じ形を何度もスケッチするのは手間がかかり、修正も大変です。<b>パターン</b>と<b>ミラー</b>を使えば、1 つ作ったフィーチャを
<b>コピーとして並べ</b>、元を直すとコピーもすべて更新されます。</p>
<ul>
  <li><b>矩形状パターン</b> — 1 方向 / 2 方向に個数と間隔で並べる (取付穴、放熱フィン)</li>
  <li><b>円形状パターン</b> — 軸まわりに等間隔に並べる (フランジのボルト穴、歯)</li>
  <li><b>ミラー</b> — 平面に関して対称にコピーする (左右対称の部品は半分作ってミラー)</li>
</ul>
<p>パターン・ミラーの対象にできるのは 押し出し・回転・穴・プリミティブ です。</p>
<p class="ln-note">このレッスンは 100 × 60 × 8 の取付プレート (左手前の角に Ø9 の穴が 1 つ) から始まります。</p>`,
        setup: { kind: "part", make: plateStarter },
        steps: [
          { text: "<b>矩形状</b> パターンを押し、ブラウザの <b>穴1</b> をクリックして選択。方向 <b>X</b>、個数 <code>2</code>、間隔 <code>80</code> にして OK。手前に 2 つの穴が並びます。", tab: "model", ui: "rectPattern", check: (s) => has<PatternFeature>(s, "rectPattern", (f) => (val(s, f.count) ?? 0) >= 2), hint: "穴が板の外に出たら「反転」で向きを変えます。" },
          { text: "ブラウザの <b>矩形状パターン1</b> をダブルクリックして編集し、<b>2 方向目</b>を <b>Z</b>、個数 <code>2</code>、間隔 <code>40</code> にして OK。4 隅に穴がそろいます。", tab: "model", ui: "rectPattern", check: (s) => has<PatternFeature>(s, "rectPattern", (f) => !!f.axis2 && (val(s, f.count2) ?? 0) >= 2), hint: "2 方向目の向きが逆なら、間隔を <code>-40</code> にします。" },
          { text: "<b>パラメータ</b>表で穴1 の直径 (値 9) を <code>11</code> に変えてみましょう。パターンのコピーもすべて変わります。", tab: "model", ui: "params", check: (s) => s.part.features.some((f) => f.type === "hole" && near(val(s, (f as HoleFeature).diameter), 11)) },
          { text: "<b>ミラー</b> の使い方も見ておきましょう。ミラーを開き、<b>穴1</b> を選んで対称面 (YZ / XY / XZ) を切り替えると、プレビューで対称の位置にコピーが表示されます。確認したら <b>キャンセル</b>。", tab: "model", ui: "mirror" },
          { text: "1 つの元フィーチャから 4 つの穴ができました。レッスン完了です。" },
        ],
        summary: ["パターン・ミラーは元フィーチャのコピー — 元を直すと全部変わる", "矩形状 = 格子状、円形状 = 軸まわり、ミラー = 対称", "繰り返しや対称を使うと、作業が速く設計意図も明確になる"],
        quiz: [
          { q: "フランジの円周上に 6 個のボルト穴を等間隔に並べるのに最適なのは?", choices: ["矩形状パターン", "円形状パターン", "ミラー"], answer: 1, explain: "円形状パターンで個数 6、角度 360° にすると 60° 間隔で並びます。" },
          { q: "パターンでコピーした穴の直径を変えるには?", choices: ["コピーを 1 つずつ編集", "元のフィーチャを編集", "パターンを削除して作り直す"], answer: 1, explain: "コピーは元フィーチャに連動しているので、元を変えればすべて更新されます。" },
        ],
      },
    ],
  },
  // ------------------------------------------------------------------ 4 ---
  {
    id: "param",
    title: "第 4 章 パラメトリック設計と検証",
    desc: "ユーザ パラメータと式で設計意図を表し、材料・質量・測定で設計を確かめます。",
    lessons: [
      {
        id: "4-1",
        title: "ユーザ パラメータと式 — 設計意図を形にする",
        minutes: 12,
        level: 2,
        goals: ["ユーザ パラメータを作成できる", "寸法を式でパラメータに関連付けられる", "パラメータ変更でモデル全体を更新できる"],
        theory: `
<p>寸法を記入すると <code>d0, d1 …</code> という<b>モデル パラメータ</b>が自動で作られます。これとは別に、
<code>幅</code>・<code>板厚</code> のように意味のある名前の<b>ユーザ パラメータ</b>を作り、寸法の式から参照できます。</p>
<pre>幅 = 60 mm
高さ = 幅 / 4        ← 幅を変えると高さも比例して変わる
穴ピッチ = 幅 - 20</pre>
<p>製品のバリエーション (サイズ違い) をパラメータだけで作れるので、<b>設計の再利用</b>に欠かせない考え方です。
さらに「ファミリー表」でサイズ違いを表にまとめたり、「ルール」で条件分岐させたりもできます。</p>`,
        setup: { kind: "part", make: blockStarter },
        steps: [
          { text: "<b>パラメータ</b> (fx) を開き、<b>ユーザ パラメータを追加</b> で名前 <code>幅</code>、式 <code>60</code> のパラメータを作ります。", tab: "model", ui: "params", check: (s) => userParams(s).some((p) => p.name === "幅") },
          { text: "スケッチ1 の幅の寸法 (<code>d0</code>、値 60) の式を <code>幅</code> に書き換えます。", tab: "model", ui: "params", check: usesUserParam },
          { text: "押し出し1 の距離 (<code>d4</code>、値 15) の式を <code>幅 / 4</code> にします。", tab: "model", ui: "params", check: (s) => { const f = firstExtrude(s); const p = f && s.part.params.find((q) => q.name === f.distance); return !!p && /幅/.test(p.expr); } },
          { text: "最後に <b>幅</b> を <code>100</code> に変更します。幅と高さが一緒に変わることを確認しましょう。", tab: "model", ui: "params", check: (s) => near(s.values.get("幅"), 100) && (() => { const f = firstExtrude(s); return !!f && near(val(s, f.distance), 25); })() },
          { text: "パラメータは <b>CSV 書き出し</b> で Excel で編集することもできます。レッスン完了です。" },
        ],
        summary: ["ユーザ パラメータ = 意味のある名前の設計変数", "寸法を式でつなぐと設計意図 (比例・中央・ピッチ) を保てる", "サイズ違いはパラメータの値を変えるだけで作れる"],
        quiz: [
          { q: "幅 = 100 のとき、式「幅 / 4」の値は?", choices: ["4", "25", "400"], answer: 1, explain: "100 ÷ 4 = 25 です。幅を変えると自動で再計算されます。" },
          { q: "ユーザ パラメータを使う一番の利点は?", choices: ["ファイルが小さくなる", "寸法の関係 (設計意図) を残して変更に強くできる", "描画が速くなる"], answer: 1, explain: "関連する寸法を 1 つのパラメータから式で決めることで、変更時の修正漏れを防げます。" },
        ],
      },
      {
        id: "4-2",
        title: "材料・質量・測定",
        minutes: 8,
        level: 1,
        goals: ["材料を設定して質量を確認できる", "測定コマンドで距離や面積を測れる"],
        theory: `
<p>3D モデルは<b>体積が正確</b>なので、材料 (密度) を設定すれば <b>質量・重心</b> がすぐにわかります。
部品の重さは、輸送コスト・モーターの選定・持ち運びやすさなどを決める大切な設計値です。</p>
<pre>質量 [g] = 体積 [cm³] × 密度 [g/cm³]
例: 60 × 40 × 15 mm = 36 cm³ → 鋼 (7.85) なら 約 283 g、アルミ (2.7) なら 約 97 g</pre>
<p><b>測定</b>コマンドでは、2 つの要素の距離・角度、エッジの長さ、面の面積、円の半径を測れます。設計の確認や、他の部品とのすき間のチェックに使います。</p>`,
        setup: { kind: "part", make: blockStarter },
        steps: [
          { text: "画面左上の <b>材料</b> のリストから <b>鋼</b> を選びます。", ui: ".qat-field", check: (s) => s.part.material.name === "鋼" },
          { text: "<b>検査</b>タブの <b>iProperties</b> を開き、「物理」で質量 (約 283 g) と体積・重心を確認して閉じます。", tab: "inspect", ui: "iprops" },
          { text: "材料を <b>アルミニウム 6061</b> に変えます。同じ形でも質量が約 1/3 になります。", ui: ".qat-field", check: (s) => s.part.material.name.startsWith("アルミ") },
          { text: "<b>測定</b> (<kbd>M</kbd>) を開始し、上面をクリックして面積を、2 つの面をクリックして距離を測ってみましょう。", tab: "inspect", ui: "measure", check: (s) => s.command === "measure" },
          { text: "<kbd>Esc</kbd> で測定を終了します。レッスン完了です。", check: (s) => s.command === null },
        ],
        summary: ["材料 (密度) を設定すると質量・重心がわかる", "同じ形でも材料で質量は大きく変わる (鋼 7.85、アルミ 2.7 g/cm³)", "測定で距離・角度・面積・半径を確認できる"],
        quiz: [
          { q: "体積 10 cm³ の部品を鋼 (密度 7.85 g/cm³) で作ると質量は?", choices: ["約 7.9 g", "約 78.5 g", "約 785 g"], answer: 1, explain: "10 × 7.85 = 78.5 g です。" },
          { q: "同じ形で最も軽くなる材料は?", choices: ["鋼", "黄銅", "アルミニウム"], answer: 2, explain: "密度は アルミ 2.7 < 鋼 7.85 < 黄銅 8.47 g/cm³ です。" },
        ],
      },
    ],
  },
  // ------------------------------------------------------------------ 5 ---
  {
    id: "assembly",
    title: "第 5 章 アセンブリ — 部品を組み立てる",
    desc: "複数の部品を配置し、拘束で位置関係を決め、部品表と干渉を確認します。",
    lessons: [
      {
        id: "5-1",
        title: "組立拘束と自由度",
        minutes: 15,
        level: 2,
        goals: ["コンポーネントの自由度 (6 自由度) がわかる", "挿入拘束で軸と穴を組み付けられる", "標準部品を配置し、部品表を確認できる"],
        theory: `
<p><b>アセンブリ</b>は、部品 (パーツ) を<b>コンポーネント</b>として配置し、<b>拘束</b>で互いの位置関係を決めたものです。</p>
<p>空間に浮いた部品は <b>X・Y・Z 方向の移動 3 つ + 各軸まわりの回転 3 つ = 6 自由度</b> を持っています。拘束はこれを減らします。</p>
<table class="ln-table">
  <tr><th>拘束</th><th>意味</th><th>主な用途</th></tr>
  <tr><td>メイト</td><td>面と面を向かい合わせて接触</td><td>部品を載せる</td></tr>
  <tr><td>フラッシュ</td><td>面をそろえる (同じ向き)</td><td>端面をそろえる</td></tr>
  <tr><td>挿入</td><td>軸をそろえ + 面を接触</td><td>ボルト・ピン・軸受</td></tr>
  <tr><td>軸合わせ</td><td>円筒の軸を一致</td><td>回転する軸</td></tr>
  <tr><td>角度</td><td>面の角度を指定</td><td>ヒンジ・リンク</td></tr>
</table>
<p>動くべき部品 (回転する軸など) は自由度を <b>わざと残し</b>、動かない部品は完全に拘束します。最初の部品は<b>接地</b> (固定) されます。</p>`,
        setup: { kind: "assembly", make: pinAssemblyStarter },
        steps: [
          { text: "<b>自由移動</b> (<kbd>V</kbd>) を選び、ピンをドラッグしてみましょう。ブラケットは接地されているので動きません。", tab: "assemble", ui: "asm-move" },
          { text: "<b>挿入</b> 拘束を選び、ブラケットのボス上面の<b>穴の円形エッジ</b>と、ピンの<b>頭の下側の円形エッジ</b>をクリックして OK。ピンが穴に入ります。", tab: "assemble", ui: "asm-insert", check: (s) => s.asm.constraints.some((c) => c.type === "insert" && !c.suppressed), hint: "円形のエッジにカーソルを合わせ、軸 (破線) が表示される位置でクリックします。向きが逆なら「反転」。" },
          { text: "ステータスバーの<b>自由度</b>を確認しましょう。ピンは挿入拘束の後も<b>軸まわりの回転</b>だけ自由に残っています (自由回転 <kbd>G</kbd> で回してみましょう)。", tab: "assemble", ui: "asm-rotate" },
          { text: "<b>標準部品</b> から <b>六角ナット</b> や <b>平座金</b> を選んで配置します。", tab: "assemble", ui: "asm-library", check: (s) => s.asm.components.length >= 3 },
          { text: "<b>部品表</b> を開き、部品ごとの数量・材質を確認します。", tab: "assemble", ui: "asm-bom" },
          { text: "<b>干渉解析</b> で部品同士が重なっていないか確認しましょう。レッスン完了です。", tab: "assemble", ui: "asm-interf" },
        ],
        summary: ["自由な部品は 6 自由度 (移動 3 + 回転 3)", "挿入拘束 = 軸合わせ + 面の接触 (ボルト・ピンの組付けに最適)", "動く部品は自由度を残す。部品表と干渉解析で組立を検証する"],
        quiz: [
          { q: "空間に浮いた剛体の自由度はいくつ?", choices: ["3", "6", "12"], answer: 1, explain: "3 方向の移動と 3 軸まわりの回転で 6 自由度です。" },
          { q: "ピンを穴に差し込んで頭を面に当てる拘束は?", choices: ["フラッシュ", "挿入", "角度"], answer: 1, explain: "挿入拘束は軸の一致と面の接触を同時に指定します。" },
          { q: "挿入拘束の後、ピンに残る自由度は?", choices: ["なし", "軸まわりの回転", "上下の移動"], answer: 1, explain: "軸がそろい面が接触しても、軸まわりの回転 1 自由度は残ります。" },
        ],
      },
    ],
  },
  // ------------------------------------------------------------------ 6 ---
  {
    id: "drawing",
    title: "第 6 章 図面 — ものづくりへの伝達",
    desc: "3D モデルから JIS に沿った 2D 図面 (三面図・断面図・寸法・表題欄) を作成します。",
    lessons: [
      {
        id: "6-1",
        title: "3D モデルから 2D 図面を作る",
        minutes: 15,
        level: 2,
        goals: ["第三角法の投影図 (正面図・平面図・側面図) がわかる", "自動寸法・断面図で図面を仕上げられる", "表題欄を記入し PDF に出力できる"],
        theory: `
<p>製造現場では今でも <b>2D 図面</b> が正式な指示書です。3D モデルから図面を作ると、形状の変更が自動で図面に反映されます。</p>
<p>日本 (JIS) の機械製図は <b>第三角法</b>: 正面図を中心に、<b>上から見た図 (平面図) を上</b>に、<b>右から見た図 (右側面図) を右</b>に配置します。</p>
<div class="ln-third"><span></span><span>平面図</span><span></span><span></span><span class="main">正面図</span><span>右側面図</span></div>
<ul>
  <li><b>寸法</b>: 加工・検査に必要な寸法を、重複なく・読みやすく</li>
  <li><b>断面図</b>: 内部の形を切断して示す (切断面にハッチング)</li>
  <li><b>表題欄</b>: 図名・図番・材料・尺度・設計者・日付</li>
</ul>
<p class="ln-note">このレッスンはサンプルの「ブラケット」を使います。</p>`,
        setup: { kind: "part", make: sampleDocument },
        steps: [
          { text: "<b>管理</b>タブの <b>図面ビュー</b> を押して図面環境を開きます。正面・平面・側面・等角ビューが自動で配置されます。", tab: "manage", ui: "drawing", check: (s) => s.env === "drawing" && views(s).length >= 1 },
          { text: "<b>自動寸法</b> を押して、外形・穴の位置・径の寸法を一括で記入します。", tab: "drawing", ui: "dw-autodim", check: (s) => s.env === "drawing" && dims(s).length >= 1 },
          { text: "<b>断面</b> を選び、正面図の上で切断線の始点と終点をクリックして、断面図 (A-A) を配置します。", tab: "drawing", ui: "dw-section", check: (s) => views(s, "section").length >= 1, hint: "穴の中心を通るように水平に切断線を引くと、穴の内部がよくわかります。" },
          { text: "<b>シート設定</b> を開き、表題欄の<b>設計者</b>にあなたの名前を入力します。", tab: "drawing", ui: "dw-sheet", check: (s) => !!drawing(s)?.title.designer.trim() },
          { text: "<b>PDF</b> で図面を出力してみましょう (保存先を選ぶだけです)。", tab: "drawing", ui: "dw-pdf" },
          { text: "<b>モデルに戻る</b> を押して 3D に戻ります。図面はモデルと一緒に保存されます。レッスン完了です。", tab: "drawing", ui: "dw-close", check: (s) => s.env === "part" },
        ],
        summary: ["JIS は第三角法 — 平面図は上、右側面図は右", "寸法は加工・検査に必要なものを重複なく", "モデルを変えると図面も自動で更新される"],
        quiz: [
          { q: "第三角法で、右側面図は正面図のどこに置く?", choices: ["左", "右", "下"], answer: 1, explain: "第三角法は見る方向の側に図を置きます。右から見た図は右に配置します。" },
          { q: "断面図の切断面に描く斜線を何という?", choices: ["ハッチング", "中心線", "破断線"], answer: 0, explain: "切断面にはハッチング (一般に 45° の細い実線) を施します。" },
        ],
      },
    ],
  },
  // ------------------------------------------------------------------ 7 ---
  {
    id: "verify",
    title: "第 7 章 解析と製造 — 作る前に確かめる",
    desc: "応力解析で強度を確認し、3D プリントのチェックと STEP / STL 書き出しで製造につなげます。",
    lessons: [
      {
        id: "7-1",
        title: "応力解析入門 — 壊れないかを確かめる",
        minutes: 15,
        level: 3,
        goals: ["固定条件と荷重を設定して応力解析ができる", "ミーゼス応力・変位・安全率を読み取れる"],
        theory: `
<p><b>応力解析 (FEA: 有限要素法)</b> は、部品を小さな要素に分割し、力を加えたときの<b>変形と応力</b>をコンピュータで計算する方法です。
試作する前に「壊れないか」「たわみすぎないか」を確認できます。</p>
<ol>
  <li><b>固定</b>: どこが動かないか (ボルトで止める面など)</li>
  <li><b>荷重</b>: どこにどれだけの力 (N) や圧力 (MPa) がかかるか</li>
  <li><b>結果</b>: ミーゼス応力 (MPa)・変位 (mm)・<b>安全率</b></li>
</ol>
<pre>安全率 = 材料の降伏応力 ÷ 発生する最大応力
1 未満 → 永久変形 (降伏) する。一般に 2〜3 以上を目安にする</pre>
<p class="ln-note">鋭い角や固定面の縁では応力が理論上無限大になるため、値がメッシュの細かさに依存します。フィレットで角を丸めると改善します。</p>`,
        setup: { kind: "part", make: sampleDocument },
        steps: [
          { text: "<b>検査</b>タブの <b>応力解析</b> を開きます。", tab: "inspect", ui: "stress", check: (s) => s.command === "stress" },
          { text: "パネルの<b>固定</b>でプレートの<b>底面</b>を、<b>荷重</b>でボスの<b>上面</b>を選び、力 1000 N のまま <b>解析を実行</b> します。", tab: "inspect", ui: "stress", check: (s) => s.analysisDone, hint: "選択欄をクリックしてアクティブにしてから面をクリックします。計算には数秒〜数十秒かかります。" },
          { text: "コンターの色 (青 = 低い → 赤 = 高い) で応力の大きい場所を確認し、<b>安全率</b>と<b>変位</b>の表示に切り替えてみましょう。" },
          { text: "パネルを閉じて解析を終了します。レッスン完了です。", check: (s) => s.command === null },
        ],
        summary: ["応力解析 = 固定 + 荷重 → 応力・変位・安全率", "安全率 = 降伏応力 ÷ 最大応力 (目安 2〜3 以上)", "鋭い角は応力集中 — フィレットで改善"],
        quiz: [
          { q: "降伏応力 270 MPa の材料で、最大応力 90 MPa のとき安全率は?", choices: ["0.33", "3", "180"], answer: 1, explain: "270 ÷ 90 = 3 です。" },
          { q: "応力解析で必ず指定しなければならない条件は?", choices: ["色と材質感", "固定と荷重", "図面の尺度"], answer: 1, explain: "どこが固定され、どこにどんな力がかかるかがわからないと計算できません。" },
        ],
      },
      {
        id: "7-2",
        title: "製造へ渡す — 3D プリントと書き出し",
        minutes: 10,
        level: 2,
        goals: ["3D プリントでサポートが必要な部分がわかる", "STEP と STL の違いを理解して書き出せる"],
        theory: `
<p>設計したモデルは、作り方に合わせた形式で書き出します。</p>
<table class="ln-table">
  <tr><th>形式</th><th>中身</th><th>用途</th></tr>
  <tr><td>STEP</td><td>正確な曲面のソリッド (B-rep)</td><td>他の CAD とのやり取り、切削加工 (CAM)、外注</td></tr>
  <tr><td>STL / 3MF</td><td>三角形の集まり (メッシュ)</td><td>3D プリンタ (スライサ)</td></tr>
  <tr><td>DXF / PDF</td><td>2D の線</td><td>図面、レーザー加工・板金</td></tr>
</table>
<p><b>3D プリント</b>では、真下を向いた面 (<b>オーバーハング</b>) は空中に造形することになるため、一般に 45° より寝た面にはサポート材が必要です。
<b>3D プリント チェック</b>で造形方向を変えてサポート量を減らす向きを探しましょう。</p>`,
        setup: { kind: "part", make: sampleDocument },
        steps: [
          { text: "<b>検査</b>タブの <b>3D プリント</b> を開き、サポートが必要な面 (赤) を確認します。造形方向を変えて赤い面が減る向きを探してみましょう。", tab: "inspect", ui: "printcheck", check: (s) => s.command === "printcheck" },
          { text: "パネルを閉じます。", check: (s) => s.command === null },
          { text: "<b>管理</b>タブの <b>STEP 書き出し</b> で STEP ファイルを保存してみましょう (Inventor・SOLIDWORKS・Fusion 360 で開けます)。", tab: "manage", ui: "export-step" },
          { text: "<b>その他の形式</b> から STL または 3MF を書き出すと、3D プリンタのスライサで使えます。これで全レッスン修了です。おつかれさまでした!", tab: "manage", ui: "export-more" },
        ],
        summary: ["STEP = 正確なソリッド (CAD・CAM 用)、STL/3MF = メッシュ (3D プリント用)", "オーバーハング (約 45° 以上) にはサポートが必要 — 造形方向を工夫する", "作り方に合わせて形式を選ぶ"],
        quiz: [
          { q: "他社の CAD で形状を編集してもらうときに渡す形式は?", choices: ["STL", "STEP", "PNG"], answer: 1, explain: "STEP は正確な曲面を持つソリッドなので、他の CAD で読み込んで加工・編集できます。STL は三角形の近似です。" },
          { q: "3D プリントでサポート材が必要になりやすいのは?", choices: ["垂直な壁", "下向きの水平な面 (オーバーハング)", "上向きの面"], answer: 1, explain: "下向きの面は空中に造形することになるため、支えるサポートが必要です。" },
        ],
      },
    ],
  },
];

// ---------------------------------------------------------- exercises ---

const anyHoles = (s: LearnState) => has(s, "hole") || has<ExtrudeFeature>(s, "extrude", (f) => f.op === "cut");
const healthy = (s: LearnState) => s.bodies === 1 && s.errors === 0;

export const EXERCISES: Exercise[] = [
  {
    id: "ex-bracket",
    title: "演習 1: 取付ブラケット",
    level: 1,
    brief: "モーターを机の天板に固定する L 形の取付ブラケットを設計します。寸法は自由に工夫してかまいません。",
    spec: [
      ["外形", "幅 80 × 奥行 50、板厚 6 程度の L 字形"],
      ["取付穴", "底板に 4 か所 (M5 用キリ穴 Ø5.5)"],
      ["仕上げ", "外側の角に R5 程度のフィレット"],
      ["材料", "アルミニウム 6061"],
      ["管理", "幅・板厚をユーザ パラメータにする"],
    ],
    requirements: [
      { text: "押し出しでベースの形がある", check: (s) => has<ExtrudeFeature>(s, "extrude", (f) => f.op !== "cut") },
      { text: "穴 (穴フィーチャまたは切り取り) がある", check: anyHoles },
      { text: "パターンまたはミラーで穴を並べている", check: (s) => has(s, "rectPattern") || has(s, "circPattern") || has(s, "mirror") },
      { text: "フィレットで角を丸めている", check: (s) => has(s, "fillet") },
      { text: "ユーザ パラメータを寸法の式で使っている", check: usesUserParam },
      { text: "材料を設定している (汎用以外)", check: (s) => s.part.material.name !== "汎用" },
      { text: "ソリッドが 1 つで、エラーのフィーチャがない", check: healthy },
    ],
    tips: ["底板と立ち上がりを別々のスケッチで押し出すか、L 字の断面を 1 回で押し出すと簡単です", "穴は 1 つ作って矩形状パターン (2 × 2) で並べましょう", "入隅 (内側の角) にもフィレットを付けると強度が上がります"],
  },
  {
    id: "ex-flange",
    title: "演習 2: フランジ継手",
    level: 2,
    brief: "2 本の軸をつなぐフランジ継手の片側を設計します。回転と円形状パターンを使います。",
    spec: [
      ["外径", "Ø100、フランジ厚さ 12"],
      ["ハブ", "外径 Ø50 × 長さ 30、軸穴 Ø20"],
      ["ボルト穴", "P.C.D. 75 に Ø9 × 6 か所 (等配)"],
      ["仕上げ", "外周の角に C1 の面取り"],
      ["材料", "鋼"],
    ],
    requirements: [
      { text: "回転フィーチャで本体を作っている", check: (s) => has(s, "revolve") },
      { text: "ボルト穴がある", check: anyHoles },
      { text: "円形状パターンで 4 個以上並べている", check: (s) => has<PatternFeature>(s, "circPattern", (f) => (val(s, f.count) ?? 0) >= 4) },
      { text: "面取りがある", check: (s) => has(s, "chamfer") },
      { text: "材料が鋼", check: (s) => s.part.material.name === "鋼" },
      { text: "ソリッドが 1 つで、エラーのフィーチャがない", check: healthy },
    ],
    tips: ["XY 平面に軸の片側の断面 (フランジ + ハブ) を描いて回転します", "P.C.D. (ピッチ円直径) 75 → 穴の中心は軸から 37.5 mm", "穴を 1 つ作り、円形状パターンで個数 6・角度 360° にします"],
  },
  {
    id: "ex-case",
    title: "演習 3: 小物ケースの組立と図面",
    level: 3,
    brief: "ふた付きの小物ケースを設計し、組立と図面まで仕上げる総合演習です。",
    spec: [
      ["本体", "80 × 60 × 30、肉厚 2 のシェル、角 R5"],
      ["ふた", "本体にかぶさる 82 × 62 × 8 程度"],
      ["組立", "本体とふたをメイト / フラッシュ拘束で組み立てる"],
      ["図面", "本体の三面図に寸法を記入し、表題欄を記入"],
    ],
    requirements: [
      { text: "シェルで中空にしている", check: (s) => has(s, "shell") || s.asm.parts.some((p) => p.doc?.features.some((f) => f.type === "shell")) },
      { text: "フィレットで角を丸めている", check: (s) => has(s, "fillet") || s.asm.parts.some((p) => p.doc?.features.some((f) => f.type === "fillet")) },
      { text: "アセンブリに 2 個以上のコンポーネントがある", check: (s) => s.asm.components.length >= 2 },
      { text: "アセンブリ拘束が 2 個以上ある", check: (s) => s.asm.constraints.filter((c) => !c.suppressed).length >= 2 },
      { text: "図面に寸法が記入されている", check: (s) => dims(s).length >= 1 || s.asm.parts.some((p) => (p.doc?.drawing?.sheets ?? []).some((sh) => sh.annos.some((a) => a.type === "dim"))) },
    ],
    tips: ["本体パーツ → ふたパーツ を作ってそれぞれ保存し、新規アセンブリに「ファイルから配置」します", "アセンブリの「作成」でアセンブリ内に直接パーツを作ることもできます", "図面は本体のパーツで「図面ビュー」→「自動寸法」が速いです"],
  },
];

// ----------------------------------------------------------- glossary ---

export const GLOSSARY: GlossaryEntry[] = [
  { term: "ソリッド", en: "Solid", desc: "中身の詰まった立体。体積・質量・重心が計算できる。3D CAD の基本となる形状。" },
  { term: "B-rep (境界表現)", en: "Boundary representation", desc: "立体を面・エッジ・頂点のつながりで正確に表す方式。曲面も近似せずに表せる。STEP はこの形式。" },
  { term: "メッシュ", en: "Mesh", desc: "形を小さな三角形の集まりで近似したもの。STL / OBJ / 3MF。3D プリントや表示に使う。" },
  { term: "パラメトリック", en: "Parametric", desc: "寸法 (パラメータ) と手順で形を定義し、寸法を変えると形が再計算される設計方式。" },
  { term: "フィーチャ", en: "Feature", desc: "押し出し・穴・フィレットなど、形を作る 1 つ 1 つの作業。モデルはフィーチャの積み重ね。" },
  { term: "スケッチ", en: "Sketch", desc: "平面上に描く 2D の輪郭。押し出し・回転などの元になる。" },
  { term: "プロファイル", en: "Profile", desc: "スケッチ内の閉じた領域。押し出し・回転で立体になる部分。" },
  { term: "拘束 (幾何拘束)", en: "Constraint", desc: "水平・垂直・平行・一致・正接など、スケッチ要素どうしの形の関係。" },
  { term: "寸法拘束", en: "Dimension", desc: "長さ・距離・直径・角度など、大きさと位置を数値で決める拘束。値は式にできる。" },
  { term: "自由度", en: "Degrees of freedom", desc: "まだ決まっていない動きの数。スケッチの点は 2、空間の剛体は 6 (移動 3 + 回転 3)。" },
  { term: "完全拘束", en: "Fully constrained", desc: "自由度が 0 で、形と位置が一意に決まった状態。" },
  { term: "コンストラクション線", en: "Construction geometry", desc: "立体の輪郭にならない補助線。軸・対称の基準・寸法の基準に使う。" },
  { term: "押し出し", en: "Extrude", desc: "プロファイルを平面に垂直な方向に伸ばして立体を作るフィーチャ。" },
  { term: "回転", en: "Revolve", desc: "プロファイルを軸のまわりに回して軸対称の立体を作るフィーチャ。" },
  { term: "ブール演算", en: "Boolean", desc: "立体どうしの 和 (接合)・差 (切り取り)・積 (交差)。" },
  { term: "フィレット", en: "Fillet", desc: "エッジを指定した半径で丸めること。応力集中の緩和や安全のため。" },
  { term: "面取り (C 面取り)", en: "Chamfer", desc: "エッジを斜めに削ること。C2 = 2 mm × 45°。" },
  { term: "シェル", en: "Shell", desc: "面を取り除き、一定の肉厚の中空形状にするフィーチャ。" },
  { term: "パターン", en: "Pattern", desc: "フィーチャを格子状 (矩形状) や円周上 (円形状) に並べてコピーすること。" },
  { term: "設計意図", en: "Design intent", desc: "「穴は常に中央」「高さは幅の 1/4」など、寸法変更後も守りたい形の関係。式と拘束で表す。" },
  { term: "ユーザ パラメータ", en: "User parameter", desc: "幅・板厚など、設計者が名前を付けて作る設計変数。寸法の式から参照できる。" },
  { term: "作業平面", en: "Work plane", desc: "基準平面や面からオフセット・回転して作る補助の平面。スケッチや分割の基準に使う。" },
  { term: "アセンブリ", en: "Assembly", desc: "複数の部品 (コンポーネント) を拘束で組み立てたモデル。" },
  { term: "接地", en: "Grounded", desc: "アセンブリで位置を固定したコンポーネント。普通は最初の部品。" },
  { term: "挿入拘束", en: "Insert", desc: "円形エッジどうしの軸をそろえ、面を接触させるアセンブリ拘束。ボルト・ピンに使う。" },
  { term: "部品表 (BOM)", en: "Bill of materials", desc: "アセンブリを構成する部品の一覧 (品番・品名・数量・材質)。" },
  { term: "第三角法", en: "Third-angle projection", desc: "JIS の投影法。平面図を正面図の上、右側面図を右に配置する。" },
  { term: "キリ穴", en: "Clearance hole", desc: "ボルトを通すための、ねじの呼び径より少し大きい穴。M6 なら Ø6.6 (2 級)。" },
  { term: "座ぐり", en: "Counterbore", desc: "ボルトの頭を沈めるための段付きの穴。" },
  { term: "応力集中", en: "Stress concentration", desc: "穴や鋭い角のまわりで局所的に応力が大きくなる現象。" },
  { term: "安全率", en: "Factor of safety", desc: "材料の強さ (降伏応力) ÷ 発生応力。1 未満で降伏する。" },
  { term: "STEP", en: "ISO 10303", desc: "CAD 間で正確なソリッドをやり取りする国際標準形式 (.stp / .step)。" },
  { term: "オーバーハング", en: "Overhang", desc: "3D プリントで下向きに張り出した部分。約 45° を超えるとサポートが必要。" },
];

/** Every lesson in curriculum order. */
export const ALL_LESSONS = CURRICULUM.flatMap((c) => c.lessons);

export function findLesson(id: string) {
  return ALL_LESSONS.find((l) => l.id === id);
}
