// 3D 設計の学習カリキュラム (アプリ内チュートリアル + 確認テスト + 総合演習)。
// 各ステップの check は LearnState の純関数で、操作が終わると自動で次へ進みます。
import type { ExtrudeFeature, FilletFeature, FlangeFeature, HoleFeature, LoftFeature, PatternFeature, RevolveFeature, ShellFeature, ChamferFeature, SweepFeature } from "../core/types";
import { sampleDocument } from "../samples";
import { annos, constraintCount, count, dims, drawing, editing, features, has, hasDim, near, sketches, tolDims, userParams, usesUserParam, val, views } from "./checks";
import { CURRICULUM2, EXERCISES2 } from "./curriculum2";
import { CURRICULUM3 } from "./curriculum3";
import { CURRICULUM4 } from "./curriculum4";
import { blockStarter, pinAssemblyStarter, plateStarter } from "./starters";
import type { Chapter, Exercise, LearnState } from "./types";
export { GLOSSARY } from "./glossary";

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
  // ------------------------------------------------------------------ 0 ---
  {
    id: "drafting2d",
    title: "第 0 章 2D 作図の基礎 — 3D の前に",
    desc: "3D CAD の土台は 2D の作図です。座標・基本図形・トリム・拘束・寸法・図面の書き方を、スケッチと図面環境で身につけます。",
    lessons: [
      {
        id: "0-1",
        title: "線分と座標入力 — 正確に描く",
        minutes: 10,
        level: 1,
        goals: ["スケッチ (2D 作図画面) を開ける", "線分を連続して描き、長さを数値で指定できる", "寸法で大きさを確かめ、直せる"],
        theory: `
<p>CAD の作図は、手描きと違って<b>数値で正確に</b>描くのが基本です。2D CAD の考え方は 3D CAD のスケッチでもそのまま使います。</p>
<ul>
  <li><b>原点</b> (0, 0) を基準に、右が X、上が Y</li>
  <li>線分は<b>始点 → 終点</b>とクリックし、続けてクリックすると連続線になる</li>
  <li>描いている途中で<b>数値を入力</b>すると、その長さの線になる (寸法も自動で付く)</li>
  <li>水平・垂直に近い線には、自動で<b>水平・垂直拘束</b>が付く</li>
</ul>
<p class="ln-note">ここでは L 字形 (幅 60・高さ 40・板の厚さ 15) の輪郭を描きます。座学テキスト「2D CAD 入門」の「座標と入力」も参考にしてください。</p>`,
        setup: { kind: "newPart" },
        steps: [
          { text: "<b>2D スケッチ</b> (<kbd>S</kbd>) を押し、正面の <b>XY 平面</b> を選びます。画面が真正面からの 2D 作図画面になります。", tab: "model", ui: "sketch", check: inSketch },
          { text: "<b>線分</b> (<kbd>L</kbd>) を選び、<b>原点</b>をクリックして始めます。右へ動かして <kbd>6</kbd><kbd>0</kbd> <kbd>Enter</kbd> で長さ 60 の線になります。", tab: "sketch", ui: "sk-line", check: (s) => count(editing(s), "line") >= 1, hint: "数値を入力すると、カーソルの方向にその長さの線が引かれます。" },
          { text: "続けて 上へ 15 → 左へ 45 → 上へ 25 → 左へ 15 と描き、最後に<b>原点</b>をクリックして L 字を閉じます。<kbd>Esc</kbd> で線分ツールを終了します。", tab: "sketch", ui: "sk-line", check: (s) => count(editing(s), "line") >= 6, hint: "閉じるときは最初の点 (原点) に吸着させます。点が重なると一致拘束が付きます。" },
          { text: "<b>寸法</b> (<kbd>D</kbd>) で、自動で付かなかった辺に寸法を付けましょう。寸法をダブルクリックすると値を変えられます。", tab: "sketch", ui: "sk-dimension", check: (s) => (editing(s)?.dimensions.length ?? 0) >= 4 },
          { text: "<b>スケッチを終了</b> します。2D で正確に描けたら、3D では押し出すだけで立体になります。レッスン完了です。", tab: "sketch", ui: "sk-finish", check: (s) => s.mode === "model" },
        ],
        summary: ["原点を基準に、右が X・上が Y", "描きながら数値入力で正確な長さに", "水平・垂直は自動拘束、閉じた形は始点に吸着"],
        quiz: [
          { q: "原点 (0, 0) から右へ 60、上へ 40 の点の座標は?", choices: ["(40, 60)", "(60, 40)", "(−60, 40)"], answer: 1, explain: "X (右) が 60、Y (上) が 40 なので (60, 40) です。" },
          { q: "CAD で正確な長さの線を描く方法は?", choices: ["グリッドを目で数える", "描きながら数値を入力する", "拡大して慎重にクリックする"], answer: 1, explain: "数値入力すれば誤差なく描けます。あとから寸法で直すこともできます。" },
        ],
        see: ["2d-coords", "2d-draw"],
      },
      {
        id: "0-2",
        title: "円・円弧・トリム — 不要な線を切る",
        minutes: 10,
        level: 1,
        goals: ["円を描ける", "トリムで交点の間の線を消せる", "円がトリムで円弧になることがわかる"],
        theory: `
<p>2D 作図では、まず<b>大まかに図形を重ねて描き</b>、<b>トリム</b> (交点で区切られた部分を消す) で形を整える方法がよく使われます。
円をトリムすると<b>円弧</b>になります。</p>
<p>ここでは、2 つの円を重ねて描き、重なった内側をトリムして「ひょうたん形 (8 の字)」の輪郭を作ります。</p>`,
        setup: { kind: "newPart" },
        steps: [
          { text: "<b>2D スケッチ</b> を <b>XY 平面</b> に開始します。", tab: "model", ui: "sketch", check: inSketch },
          { text: "<b>円</b> (<kbd>C</kbd>) で原点を中心に直径 40 程度の円、その右に少し重なるように同じくらいの円を描きます。", tab: "sketch", ui: "sk-circle", check: (s) => count(editing(s), "circle") + count(editing(s), "arc") >= 2, hint: "中心をクリック → 半径の位置をクリック。数値入力で直径を指定することもできます。" },
          { text: "<b>トリム</b> (<kbd>X</kbd>) を選び、2 つの円が重なっている内側の弧をクリックして消します。両方の円の内側を消すと、外形だけが残ります。", tab: "sketch", ui: "sk-trim", check: (s) => count(editing(s), "arc") >= 2, hint: "交点と交点の間の部分が 1 回のクリックで消えます。消しすぎたら Ctrl+Z。" },
          { text: "<b>スケッチを終了</b> します。トリムで作った閉じた輪郭は、そのまま押し出せます。レッスン完了です。", tab: "sketch", ui: "sk-finish", check: (s) => s.mode === "model" },
        ],
        summary: ["重ねて描いてトリムで整えるのが 2D 作図の定石", "円をトリムすると円弧になる", "閉じた輪郭は 3D で押し出せる"],
        quiz: [
          { q: "トリムの働きは?", choices: ["線を延ばす", "交点で区切られた部分を消す", "線を平行に複写する"], answer: 1, explain: "トリムは、交点で区切られた曲線の一部を削除します。延長は別のコマンドです。" },
          { q: "円の一部をトリムすると何になる?", choices: ["線分", "円弧", "点"], answer: 1, explain: "円の一部を消すと、残りは円弧になります。" },
        ],
        see: ["2d-edit"],
      },
      {
        id: "0-3",
        title: "拘束と寸法で形を決める — 長円 (スロット)",
        minutes: 12,
        level: 1,
        goals: ["長円 (スロット) を描ける", "寸法と拘束で完全拘束にできる"],
        theory: `
<p>パラメトリック CAD の 2D 図形は、<b>拘束</b> (形の関係) と<b>寸法</b> (大きさ・位置) で決まります。
自由度 (まだ動ける量) を 0 にすると<b>完全拘束</b>になり、寸法を変えても形が崩れません。</p>
<p><b>長円 (スロット)</b> は、2 本の平行な線と両端の半円でできた形で、長穴などに使います。描くと正接拘束などが自動で付きます。</p>`,
        setup: { kind: "newPart" },
        steps: [
          { text: "<b>2D スケッチ</b> を <b>XY 平面</b> に開始します。", tab: "model", ui: "sketch", check: inSketch },
          { text: "<b>長円</b> を選び、<b>原点</b>を最初の中心に、右に 2 つ目の中心をクリックし、幅の位置をクリックして長円を描きます。", tab: "sketch", ui: "sk-slot", check: (s) => count(editing(s), "arc") >= 2 && count(editing(s), "line") >= 2 },
          { text: "<b>寸法</b>で、中心間の距離 <code>50</code> と、半円の半径 (または直径) を付けます。", tab: "sketch", ui: "sk-dimension", check: (s) => hasDim(s, editing(s), 50) },
          { text: "ステータスバーが <b>✓ 完全拘束</b> になるまで、必要な拘束・寸法を足しましょう。", tab: "sketch", ui: ["sk-dimension", "sk-horizontal"], check: (s) => !!s.sketch && s.sketch.ok && s.sketch.dof === 0, hint: "中心を結ぶ線を水平にする (水平拘束) か、2 つ目の中心の高さを寸法で決めます。" },
          { text: "<b>スケッチを終了</b> します。レッスン完了です。", tab: "sketch", ui: "sk-finish", check: (s) => s.mode === "model" },
        ],
        summary: ["拘束 = 形の関係、寸法 = 大きさと位置", "完全拘束にすると寸法変更で形が崩れない", "長円は長穴・取付穴の調整に使う"],
        quiz: [
          { q: "長円 (スロット) の両端の円弧と直線の関係に付く拘束は?", choices: ["正接", "直交", "同一直線上"], answer: 0, explain: "直線と円弧がなめらかにつながるよう、正接拘束が付きます。" },
          { q: "完全拘束にする利点は?", choices: ["ファイルが小さくなる", "寸法を変えたときに形が予想どおりに変わる", "表示が速くなる"], answer: 1, explain: "動ける自由度が残っていないので、変更しても形が崩れません。" },
        ],
        see: ["2d-constraints"],
      },
      {
        id: "0-4",
        title: "補助線と対称形状",
        minutes: 12,
        level: 2,
        goals: ["コンストラクション (補助) 線を使える", "対称・等値拘束で左右対称の形を作れる"],
        theory: `
<p>機械部品の多くは<b>左右対称</b>です。製図では中心線を先に引き、それを基準に対称に描きます。
CAD では<b>補助線 (コンストラクション)</b> を中心線にして、<b>対称拘束</b>で両側の点を対称に保ちます。</p>
<ul>
  <li><b>対称拘束</b>: 2 つの点 (または線) を、指定した線に対して対称にする</li>
  <li><b>等値拘束</b>: 2 本の線の長さ (円なら半径) を同じにする</li>
</ul>`,
        setup: { kind: "newPart" },
        steps: [
          { text: "<b>2D スケッチ</b> を <b>XY 平面</b> に開始します。", tab: "model", ui: "sketch", check: inSketch },
          { text: "<b>線分</b>で原点を通る縦の線を引き、選択して <b>コンストラクション</b> に切り替えます (中心線)。", tab: "sketch", ui: ["sk-line", "sk-construction"], check: (s) => count(editing(s), "line", true) >= 1 },
          { text: "中心線の両側にまたがる台形 (上辺が短い 4 辺の形) を<b>線分</b>で描きます。", tab: "sketch", ui: "sk-line", check: (s) => count(editing(s), "line") >= 4 },
          { text: "<b>対称</b> 拘束を選び、左右の対応する 2 点と中心線をクリックして対称にします (上の 2 点、下の 2 点)。", tab: "sketch", ui: "sk-symmetric", check: (s) => constraintCount(editing(s), "symmetric") >= 1, hint: "点 → 点 → 対称の基準線 の順にクリックします。" },
          { text: "<b>等値</b> 拘束で左右の斜めの辺を同じ長さにし、寸法を付けて形を決めます。", tab: "sketch", ui: ["sk-equal", "sk-dimension"], check: (s) => constraintCount(editing(s), "symmetric") >= 2 || constraintCount(editing(s), "equal") >= 1 },
          { text: "<b>スケッチを終了</b> します。片側の寸法を変えると、もう片側も対称に動きます。レッスン完了です。", tab: "sketch", ui: "sk-finish", check: (s) => s.mode === "model" },
        ],
        summary: ["中心線 (補助線) を先に引くのが製図の基本", "対称拘束で左右を連動させる", "等値拘束で同じ長さ・半径に"],
        quiz: [
          { q: "補助線 (コンストラクション) について正しいのは?", choices: ["立体の輪郭になる", "立体の輪郭にならず、基準や対称軸に使う", "印刷すると太線になる"], answer: 1, explain: "補助線は形の基準に使う線で、押し出しなどの輪郭には含まれません。" },
          { q: "左右の穴の大きさを常に同じにしたい。使う拘束は?", choices: ["等値", "平行", "一致"], answer: 0, explain: "等値拘束で円の半径を等しく保てます。" },
        ],
        see: ["2d-constraints", "2d-draw"],
      },
      {
        id: "0-5",
        title: "2D 部品図形の完成と DXF 書き出し — ガスケット",
        minutes: 15,
        level: 2,
        goals: ["外形と穴を組み合わせた部品の 2D 図形を描ける", "完全拘束にできる", "DXF に書き出して他の 2D CAD やレーザー加工に渡せる"],
        theory: `
<p>ここまでの技を使って、フランジ用の<b>ガスケット</b> (薄い板のシール部品) の形を描きます。
ガスケットや板金の切り抜き部品は、2D の形 (<b>DXF</b>) だけでレーザー・ウォータージェットで加工できます。</p>
<ul>
  <li>外形: 直径 80 の円</li>
  <li>中央の穴: 直径 40</li>
  <li>ボルト穴: 直径 9 を、中心から 30 の位置に 2 か所 (左右対称)</li>
</ul>`,
        setup: { kind: "newPart" },
        steps: [
          { text: "<b>2D スケッチ</b> を <b>XY 平面</b> に開始し、原点を中心に直径 <code>80</code> と <code>40</code> の円を描いて寸法を付けます。", tab: "model", ui: ["sketch", "sk-circle", "sk-dimension"], check: (s) => hasDim(s, editing(s), 80, ["diameter"]) && hasDim(s, editing(s), 40, ["diameter"]) },
          { text: "ボルト穴を 2 つ描きます。左右に直径 <code>9</code> の円を描き、中心を X 軸上 (原点から水平距離 30) に置きます。", tab: "sketch", ui: ["sk-circle", "sk-dimension"], check: (s) => count(editing(s), "circle") >= 4 && hasDim(s, editing(s), 9, ["diameter"]), hint: "2 つ目の穴は等値拘束で 1 つ目と同じ直径にすると、寸法が 1 つで済みます。" },
          { text: "ステータスバーが <b>✓ 完全拘束</b> になるまで拘束と寸法を足します。", tab: "sketch", ui: ["sk-dimension", "sk-equal", "sk-symmetric"], check: (s) => !!s.sketch && s.sketch.ok && s.sketch.dof === 0, hint: "穴の中心を水平拘束で原点とそろえる、対称拘束で左右対称にする、などが使えます。" },
          { text: "<b>スケッチを終了</b> します。", tab: "sketch", ui: "sk-finish", check: (s) => s.mode === "model" },
          { text: "ブラウザの <b>スケッチ1</b> を右クリックして <b>DXF に書き出し</b> を選びます。AutoCAD・Jw_cad で開いたり、レーザー加工業者に渡したりできます。", hint: "書き出したくない場合は、メニューを確認するだけでも構いません。" },
          { text: "押し出し (距離 2) で、厚さ 2 mm のガスケットにしてみましょう (任意)。2D の図形がそのまま 3D の形になります。レッスン完了です。", tab: "model", ui: "extrude" },
        ],
        summary: ["外形 → 穴 → 拘束・寸法 の順で描く", "完全拘束にしてから使う", "2D の形は DXF で他の CAD や加工機へ渡せる"],
        quiz: [
          { q: "レーザー加工業者に板の切り抜き形状を渡すのに一般的な形式は?", choices: ["DXF", "STL", "PNG"], answer: 0, explain: "DXF は 2D CAD の標準的な交換形式で、レーザー・タレパンの加工データに使われます。" },
          { q: "左右 2 つの穴を同じ大きさに保つ最も簡単な方法は?", choices: ["両方に同じ数値の寸法を付ける", "等値拘束を付ける", "目で合わせる"], answer: 1, explain: "等値拘束なら 1 つの寸法を変えるだけで両方が変わり、修正漏れがありません。" },
        ],
        see: ["2d-drawing-workflow", "2d-to-3d"],
      },
      {
        id: "0-6",
        title: "図面環境で寸法と注記を書く",
        minutes: 12,
        level: 1,
        goals: ["図面環境でビューを確認できる", "寸法を手で記入できる", "注記を書ける"],
        theory: `
<p>2D 図面は、製作者に形・寸法・公差・材料を伝える書類です。3D CAD では、モデルから<b>投影図を自動で作り</b>、寸法や注記を書き加えます。</p>
<ul>
  <li><b>寸法</b>: 線・円・2 点をクリックして記入。加工・検査に必要な寸法を、重複なく</li>
  <li><b>注記</b>: 「指示なき角は C0.5」「材料 SS400」など、図だけで表せない指示</li>
</ul>
<p class="ln-note">サンプルの「ブラケット」で練習します。</p>`,
        setup: { kind: "part", make: sampleDocument },
        steps: [
          { text: "<b>管理</b>タブの <b>図面ビュー</b> で図面環境を開きます。", tab: "manage", ui: "drawing", check: (s) => s.env === "drawing" && views(s).length >= 1 },
          { text: "<b>寸法</b> を選び、正面図の外形の線 (または 2 点) をクリックして、置き場所をクリックします。2 つ以上記入しましょう。", tab: "drawing", ui: "dw-dim", check: (s) => s.env === "drawing" && dims(s).length >= 2 },
          { text: "<b>注記</b> を選び、図面の空いている所をクリックして「指示なき角は C0.5」と入力します。", tab: "drawing", ui: "dw-note", check: (s) => (drawing(s)?.sheets ?? []).some((sh) => sh.annos.some((a) => a.type === "note")) },
          { text: "<b>モデルに戻る</b> を押します。図面はモデルと一緒に保存され、モデルを変えると図面も更新されます。レッスン完了です。", tab: "drawing", ui: "dw-close", check: (s) => s.env === "part" },
        ],
        summary: ["3D モデルから投影図を作り、寸法・注記を書き加える", "寸法は加工・検査に必要なものを重複なく", "図で表せない指示は注記で"],
        quiz: [
          { q: "図で表せない指示 (材料・処理・一般的な面取り) はどう伝える?", choices: ["注記に書く", "口頭で伝える", "書かなくてよい"], answer: 0, explain: "図面に書いたことだけが確実に伝わります。図で表せない指示は注記に書きます。" },
          { q: "同じ寸法を 2 つの図に重ねて書くと?", choices: ["わかりやすくなる", "改訂時に矛盾の原因になる", "公差が厳しくなる"], answer: 1, explain: "寸法の重複は、片方だけ直して矛盾する原因になるため避けます。" },
        ],
        see: ["2d-drawing-workflow", "dimensioning"],
      },
    ],
  },
  // ----------------------------------------------------------- 0 (mid) ---
  {
    id: "drafting2d-mid",
    title: "第 0 章 B 2D 作図 中級 — 正確な形と再利用",
    desc: "正多角形と正接、既存の形状の投影、式で関係付けた寸法など、実務で使う 2D 作図の技を練習します。",
    lessons: [
      {
        id: "0-7",
        title: "【中級】正多角形と正接 — 六角ボスとアーム",
        minutes: 12,
        level: 2,
        goals: ["ポリゴンで正六角形を描ける", "正接拘束で線と円弧をなめらかにつなげられる"],
        theory: `
<p>ナットの形 (六角) や、軸からアームが伸びる形は、<b>正多角形</b>と<b>正接 (接線)</b> の作図が基本です。</p>
<ul>
  <li>正六角形は<b>二面幅</b> (向かい合う辺の距離) で大きさを指定することが多い。対角距離 = 二面幅 ÷ cos30° ≈ 1.155 倍</li>
  <li>円と線を<b>正接</b>拘束すると、角のないなめらかなつながりになる (応力集中・見た目の両方に有利)</li>
</ul>`,
        setup: { kind: "newPart" },
        steps: [
          { text: "<b>2D スケッチ</b> を <b>XY 平面</b> に開始します。", tab: "model", ui: "sketch", check: inSketch },
          { text: "<b>ポリゴン</b> (<kbd>G</kbd>) で、原点を中心に正六角形を描きます。", tab: "sketch", ui: "sk-polygon", check: (s) => count(editing(s), "line") >= 6, hint: "中心 → 頂点の位置の順にクリックします。辺の数はパネルで指定できます。" },
          { text: "六角形の右に<b>円</b>を描き、六角形の頂点付近から円に向かって<b>線分</b>を 1 本引きます。", tab: "sketch", ui: ["sk-circle", "sk-line"], check: (s) => count(editing(s), "circle") + count(editing(s), "arc") >= 1 && count(editing(s), "line") >= 7 },
          { text: "<b>正接</b> 拘束を選び、線分と円をクリックして、線が円に接するようにします。", tab: "sketch", ui: "sk-tangent", check: (s) => constraintCount(editing(s), "tangent") >= 1 },
          { text: "<b>寸法</b>で六角形の二面幅 (向かい合う辺の距離) を <code>17</code> にし、<b>スケッチを終了</b> します。レッスン完了です。", tab: "sketch", ui: ["sk-dimension", "sk-finish"], check: (s) => s.mode === "model" },
        ],
        summary: ["正六角形は二面幅で指定 (対角 ≈ 1.155 倍)", "正接拘束でなめらかにつなぐ", "ポリゴンは等値拘束付きで描かれる"],
        quiz: [
          { q: "二面幅 17 mm の正六角形の対角距離はおよそ?", choices: ["14.7 mm", "19.6 mm", "34 mm"], answer: 1, explain: "17 ÷ cos30° = 17 ÷ 0.866 ≈ 19.6 mm です。" },
          { q: "線分と円弧を角なくつなぐ拘束は?", choices: ["一致", "正接", "直交"], answer: 1, explain: "正接拘束で接線方向がそろい、なめらかにつながります。" },
        ],
        see: ["2d-geometry", "2d-tangent"],
      },
      {
        id: "0-8",
        title: "【中級】ジオメトリを投影 — 既存の形に合わせて描く",
        minutes: 12,
        level: 2,
        goals: ["面の上にスケッチし、モデルのエッジを投影できる", "投影した線を基準に新しい形を描ける"],
        theory: `
<p>部品に追加工をするとき、既存の外形に合わせて描く必要があります。<b>ジオメトリを投影</b>すると、モデルのエッジがスケッチに<b>参照線</b>として写り、
寸法や拘束の基準にできます。元の形が変わると、投影した線も追従します。</p>
<p class="ln-note">60 × 40 × 15 の練習ブロックから始めます。</p>`,
        setup: { kind: "part", make: blockStarter },
        steps: [
          { text: "<b>2D スケッチ</b> を押し、ブロックの<b>上面</b>をクリックします。", tab: "model", ui: "sketch", check: (s) => inSketch(s) && sketches(s).length >= 2 },
          { text: "<b>ジオメトリを投影</b> を選び、上面の外周のエッジをクリックして投影します。", tab: "sketch", ui: "sk-project", check: (s) => (editing(s)?.entities ?? []).some((e) => e.ref && e.type !== "point") },
          { text: "投影した線の内側に<b>長方形</b>を描き、各辺と投影線の距離に寸法 <code>5</code> を付けます (一定幅の溝の輪郭)。", tab: "sketch", ui: ["sk-rect", "sk-dimension"], check: (s) => hasDim(s, editing(s), 5) },
          { text: "<b>スケッチを終了</b> し、<b>押し出し</b>の<b>切り取り</b>・距離 <code>3</code> で浅いポケットにします。レッスン完了です。", tab: "model", ui: ["sk-finish", "extrude"], check: (s) => has<ExtrudeFeature>(s, "extrude", (f) => f.op === "cut") },
        ],
        summary: ["面の上にスケッチすると面に追従する", "ジオメトリを投影で既存のエッジを基準にできる", "元の形が変わっても関係が保たれる"],
        quiz: [
          { q: "投影したジオメトリの特徴は?", choices: ["自由に動かせる", "元のモデルのエッジに追従する参照線", "押し出すと 2 倍になる"], answer: 1, explain: "投影線はモデルのエッジへの参照で、元の形の変更に追従します。" },
          { q: "ブロックの外形から一定幅 5 mm 内側に溝を作りたい。確実な描き方は?", choices: ["目分量で描く", "投影した外形線から寸法 5 を付ける", "数値を暗算して座標で描く"], answer: 1, explain: "投影線を基準に寸法を付けると、外形が変わっても幅 5 mm が保たれます。" },
        ],
        see: ["2d-constraints", "3d-robust"],
      },
      {
        id: "0-9",
        title: "【上級】式で関係付けた寸法 — 比率を保つ図形",
        minutes: 12,
        level: 3,
        goals: ["寸法に式を入れられる", "1 つの寸法を変えるだけで全体が比率を保って変わる図形を作れる"],
        theory: `
<p>寸法の値には<b>式</b>を書けます。寸法を記入すると <code>d0, d1 …</code> のパラメータ名が付くので、別の寸法から参照できます。</p>
<pre>d0 = 100         (全幅)
d1 = d0 / 2      (高さは幅の半分)
d2 = d0 * 0.2    (穴の直径は幅の 20 %)</pre>
<p>こうしておくと、<b>全幅を変えるだけで</b>全体が相似に変わります。上級者は、どの寸法を「親」にするかを最初に決めてから描きます。</p>`,
        setup: { kind: "newPart" },
        steps: [
          { text: "<b>2D スケッチ</b> を <b>XY 平面</b> に開始し、<b>長方形</b>とその中に<b>円</b>を描きます。", tab: "model", ui: ["sketch", "sk-rect", "sk-circle"], check: (s) => count(editing(s), "line") >= 4 && count(editing(s), "circle") >= 1 },
          { text: "長方形の幅に寸法 <code>100</code> を付けます。寸法の名前 (例: <code>d0</code>) を確認しておきます。", tab: "sketch", ui: "sk-dimension", check: (s) => hasDim(s, editing(s), 100) },
          { text: "高さの寸法の値に、幅の寸法名を使った式 (例: <code>d0 / 2</code>) を入力します。", tab: "sketch", ui: "sk-dimension", check: (s) => { const sk = editing(s); return !!sk && sk.dimensions.some((d) => { const p = s.part.params.find((q) => q.name === d.param); return !!p && /[A-Za-z\u3040-\u9fff]/.test(p.expr); }); }, hint: "寸法をダブルクリックして値の欄に d0 / 2 と入力します (d0 は幅の寸法の名前)。" },
          { text: "幅の寸法を <code>160</code> に変えて、高さも一緒に変わることを確認し、<b>スケッチを終了</b> します。レッスン完了です。", tab: "sketch", ui: ["sk-dimension", "sk-finish"], check: (s) => s.mode === "model" && sketches(s).some((k) => hasDim(s, k, 160)) },
        ],
        summary: ["寸法には式を書ける (d0 / 2 など)", "親になる寸法を決め、他を式で関係付ける", "1 か所の変更で全体が相似に変わる"],
        quiz: [
          { q: "幅 d0 = 120 のとき、高さの式 d0 / 2 + 10 の値は?", choices: ["60", "70", "130"], answer: 1, explain: "120 / 2 + 10 = 70 です。" },
          { q: "式で寸法を関係付ける一番の利点は?", choices: ["描くのが速い", "設計変更のとき関係が保たれ、修正漏れがない", "ファイルが軽い"], answer: 1, explain: "親の寸法を変えるだけで、関係付けた寸法がすべて追従します。" },
        ],
        see: ["2d-constraints", "3d-automation"],
      },
    ],
  },
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
        see: ["process"],
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
        see: ["cad-practice"],
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
        see: ["drawing"],
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
        see: ["cad-practice", "drawing"],
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
        see: ["drawing"],
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
        see: ["cad-practice"],
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
        see: ["fastening", "dfm-machining"],
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
        see: ["torsion", "bearings"],
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
        see: ["fatigue", "dfm-molding"],
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
        see: ["dfa"],
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
        see: ["cad-practice"],
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
        see: ["materials"],
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
        see: ["dfa", "fastening", "bearings", "mechanisms"],
      },
      {
        id: "5-2",
        title: "締結部品とパターン — ボルトを並べる",
        minutes: 12,
        level: 2,
        goals: ["標準部品 (ボルト・座金) を規格寸法で配置できる", "コンポーネントをパターンで並べ、元に追従させられる", "部品表で数量を確認できる"],
        theory: `
<p>ボルト・ナット・座金などの<b>標準部品</b>は自分でモデリングせず、規格寸法のライブラリから配置します。部品表に正しい呼び (M6×20 など) が載り、購入品として扱えます。</p>
<p>同じ部品を複数並べるときは、1 つを拘束してから<b>コンポーネント パターン</b>で並べます。元の部品を動かす・変えるとコピーも追従するので、穴の数や間隔の変更に強くなります。</p>
<ul>
  <li>ボルトの長さ = 締結する板厚 + ナット (または有効ねじ込み長さ) + ねじ山 2〜3 山の余裕</li>
  <li>めねじへのねじ込み長さは、鋼で径の 1 倍以上、アルミで 1.5〜2 倍程度が目安</li>
</ul>`,
        setup: { kind: "assembly", make: pinAssemblyStarter },
        steps: [
          { text: "<b>標準部品</b> を開き、<b>六角穴付きボルト</b> (または六角ボルト) の M8 前後を選んで配置します。", tab: "assemble", ui: "asm-library", check: (s) => s.asm.components.length >= 3, hint: "種類と呼び径・長さを選んで「配置」を押します。" },
          { text: "<b>挿入</b> 拘束で、ボルトの頭の下の円形エッジと、ブラケットの取付穴の上側の円形エッジを順にクリックして OK を押します。", tab: "assemble", ui: "asm-insert", check: (s) => s.asm.constraints.some((c) => c.type === "insert" && !c.suppressed) },
          { text: "ボルトをクリックして選択し、<b>パターン</b> を押します。方向・個数・間隔を取付穴に合わせて (例: X 方向 2 個) OK を押します。", tab: "assemble", ui: "asm-pattern", check: (s) => (s.asm.patterns?.length ?? 0) >= 1, hint: "取付穴の間隔は、ブラケットのモデルの穴位置 (パターンの間隔) と同じ値にします。" },
          { text: "<b>部品表</b> を開き、ボルトの数量がパターンの個数になっていることを確認します。レッスン完了です。", tab: "assemble", ui: "asm-bom" },
        ],
        summary: ["締結部品は標準部品ライブラリから — 部品表に呼びが載る", "同じ部品はパターンで並べると変更に強い", "ボルト長さ・ねじ込み長さは材料に応じて決める"],
        quiz: [
          { q: "アルミのめねじに鋼のボルトをねじ込むときのねじ込み長さの目安は?", choices: ["径の 0.5 倍", "径の 1.5〜2 倍", "径の 5 倍"], answer: 1, explain: "アルミはめねじ側が弱いので、鋼 (1 倍程度) より長いねじ込み長さを確保します。" },
          { q: "コンポーネント パターンの利点は?", choices: ["元の部品の変更にコピーが追従する", "部品表から消える", "拘束が不要になる"], answer: 0, explain: "パターンは元に連動するので、個数や間隔の変更が一度で済みます。" },
        ],
        see: ["fastening", "bolt-joint", "dfa"],
      },
      {
        id: "5-3",
        title: "分解図と干渉チェック — 組立を確かめて伝える",
        minutes: 10,
        level: 2,
        goals: ["分解図で組立順序をわかりやすく示せる", "干渉解析で部品の重なりを見つけられる"],
        theory: `
<p><b>分解図</b>は部品を組立の向きに引き離して描いた図で、組立手順書・取扱説明書・サービスマニュアルで使います。拘束の軸方向に分解すると、「どの順で、どの向きに組むか」が一目でわかります。</p>
<p><b>干渉解析</b>は部品同士の重なり (体積) を計算します。試作の前に見つければ、修正は CAD 上の数分で済みます。</p>
<ul>
  <li>ねじ部 (ボルトとめねじ) は、モデル上は意図した重なりとして扱われることがある</li>
  <li>動く部品は、動きの範囲全体で干渉を確認する (拘束を駆動)</li>
  <li>工具やレンチが入るすき間 (作業空間) も干渉と同じように確認する</li>
</ul>`,
        setup: { kind: "assembly", make: pinAssemblyStarter },
        steps: [
          { text: "<b>挿入</b> 拘束でピンをブラケットの穴に組み付けます (レッスン 5-1 と同じ手順)。", tab: "assemble", ui: "asm-insert", check: (s) => s.asm.constraints.some((c) => c.type === "insert" && !c.suppressed) },
          { text: "<b>干渉解析</b> を押して、部品同士が重なっていないか確認します。", tab: "assemble", ui: "asm-interf" },
          { text: "<b>分解</b> を押して、部品を組立方向に引き離した分解図を表示します。距離のスライダーを動かしてみましょう。", tab: "assemble", ui: "asm-explode", check: (s) => !!s.exploded },
          { text: "パネルの OK で分解表示を確定します (このまま図面ビューに使えます)。レッスン完了です。", tab: "assemble", check: (s) => !s.asmCommand },
        ],
        summary: ["分解図は組立順序と向きを伝える", "干渉は試作前に CAD で見つける", "工具の入るすき間も確認する"],
        quiz: [
          { q: "分解図がよく使われる資料は?", choices: ["組立手順書・サービスマニュアル", "応力解析レポート", "見積書"], answer: 0, explain: "部品の組む順序と向きを伝えるのに最適です。" },
          { q: "干渉解析で見落としやすいのは?", choices: ["動く部品の動作範囲全体での干渉", "静止部品の重なり", "部品の色"], answer: 0, explain: "1 つの姿勢で問題がなくても、動かすとぶつかることがあります。拘束を駆動して確認します。" },
        ],
        see: ["dfa", "maintainability", "mechanisms"],
      },
      {
        id: "5-4",
        title: "アセンブリの構造解析 — 組んだ状態で強度を見る",
        minutes: 15,
        level: 3,
        goals: ["アセンブリ全体に固定と荷重を設定して解析できる", "部品ごとの材料が反映されることを理解する", "結果から弱い部品を見つけられる"],
        theory: `
<p>部品単体の解析では、相手部品から受ける力を推定して荷重にする必要があります。アセンブリ解析では、部品どうしを<b>接着した 1 つの構造</b>として計算するので、力の伝わり方を含めて確認できます。</p>
<ul>
  <li>固定: 床や架台に取り付く面 (底面を追加ボタンが便利)</li>
  <li>荷重: 実際に力がかかる面</li>
  <li>部品ごとの材料 (アルミ・鋼など) が自動で反映される</li>
</ul>
<p class="ln-note">ボルト締結や接触 (すべり・離れ) は「接着」として近似されます。締結部の詳細は、座学テキストの「ボルト締結の強度」で手計算と組み合わせて評価しましょう。</p>`,
        setup: { kind: "assembly", make: pinAssemblyStarter },
        steps: [
          { text: "<b>挿入</b> 拘束でピンをブラケットの穴に組み付けます。", tab: "assemble", ui: "asm-insert", check: (s) => s.asm.constraints.some((c) => c.type === "insert" && !c.suppressed) },
          { text: "<b>構造解析</b> を開きます。", tab: "assemble", ui: "asm-analysis", check: (s) => s.command === "stress" },
          { text: "<b>固定拘束</b>が選ばれた状態で <b>底面を追加</b> を押し、次に <b>荷重面</b> を押して <b>上面を追加</b> (ピンの頭の上面) を押します。<b>解析を実行</b> します。", tab: "assemble", ui: "asm-analysis", check: (s) => s.analysisDone, hint: "選んだ面は固定 = 緑、荷重 = 赤で表示されます。面を直接クリックして選ぶこともできます。" },
          { text: "表示を<b>変位</b>や<b>安全率</b>に切り替え、どの部品のどこが弱いか確認します。パネルを閉じて終了します。レッスン完了です。", check: (s) => s.command === null },
        ],
        summary: ["アセンブリ解析は部品を接着した構造として計算", "部品ごとの材料が反映される", "締結・接触の詳細は手計算と組み合わせる"],
        quiz: [
          { q: "このアプリのアセンブリ解析で部品どうしの境界はどう扱われる?", choices: ["接着 (一体)", "摩擦接触", "すき間あり"], answer: 0, explain: "部品同士は接着として近似します。すべりや離れは表現できないので、締結部は別途評価します。" },
          { q: "アセンブリで解析する利点は?", choices: ["相手部品を通した力の伝わり方まで含めて確認できる", "計算が必ず速い", "固定条件が不要"], answer: 0, explain: "部品単体では推定が必要な荷重の伝達を、組んだ状態で確認できます。" },
        ],
        see: ["fea-practice", "bolt-joint", "stiffness-design"],
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
        see: ["drawing", "tolerance"],
      },
    ],
  },
  // ---------------------------------------------------------------- 6+ ---
  {
    id: "drawing-pro",
    title: "第 6 章 (続) CAD 製図を極める — 伝わる図面の描き方",
    desc: "詳細図・中心線・穴注記、寸法の公差とはめあい、データムと幾何公差、表面性状、部分断面と破断、穴テーブル、組立図と部品表まで。JIS 製図のルールを CAD で実践します。",
    lessons: [
      {
        id: "6-2",
        title: "詳細図・中心線・穴注記 — 図形を正しく見せる",
        minutes: 15,
        level: 2,
        goals: ["小さな部分を詳細図で拡大して示せる", "穴や対称形に中心線を引ける", "同じ穴をまとめた穴注記 (4×φ9 など) を記入できる"],
        theory: `
<p>図面は「形を正しく読み取れること」が第一です。投影図だけでは読み取りにくい部分を補う道具を使い分けます。</p>
<table class="ln-table">
  <tr><th>道具</th><th>使う場面</th><th>JIS のきまり</th></tr>
  <tr><td><b>詳細図</b></td><td>小さな溝・R・面取りなど、尺度が小さくて読めない部分</td><td>元の図に細い実線の円と文字 (A) を描き、拡大図に「A (2:1)」のように尺度を添える</td></tr>
  <tr><td><b>中心線</b></td><td>穴・軸・対称形の中心</td><td>細い一点鎖線。外形から少しはみ出させる</td></tr>
  <tr><td><b>穴注記</b></td><td>同じ径の穴が複数あるとき</td><td>「4×φ9」のように個数と径をまとめ、引出線で 1 か所に記入</td></tr>
</table>
<p class="ln-note">このレッスンはサンプルの「ブラケット」(取付穴 4 個とボス) を使います。</p>`,
        setup: { kind: "part", make: sampleDocument },
        steps: [
          { text: "<b>管理</b>タブの <b>図面ビュー</b> で図面環境を開きます。", tab: "manage", ui: "drawing", check: (s) => s.env === "drawing" && views(s).length >= 1 },
          { text: "<b>詳細</b> を選び、平面図の取付穴の 1 つをクリック (円の中心) → 少し離れた点をクリック (半径) → 用紙の空いた場所をクリックして詳細図を配置します。", tab: "drawing", ui: "dw-detail", check: (s) => views(s, "detail").length >= 1, hint: "1 回目のクリックが詳細図の中心、2 回目までの距離が半径になります。尺度は元のビューの 2 倍で作られます。" },
          { text: "<b>中心線</b> を選び、平面図で向かい合う 2 つの取付穴の円を順にクリックして、穴の中心を結ぶ中心線を引きます。", tab: "drawing", ui: "dw-centerline", check: (s) => annos(s, "centerline").length >= 1, hint: "円の縁 (輪郭) をクリックすると円として認識されます。平行な 2 本の線分を選ぶと、その中間に中心線が引かれます。" },
          { text: "<b>穴注記</b> を選び、取付穴の円をクリック → 注記を置く位置をクリックします。同じ径の穴の数が自動で数えられ「4×φ…」と記入されます。", tab: "drawing", ui: "dw-hole", check: (s) => dims(s).some((d) => d.type === "dim" && d.kind === "hole"), hint: "穴の円の輪郭をクリックしてから、外側の空いた位置をクリックします。" },
          { text: "<b>モデルに戻る</b> で 3D に戻ります。レッスン完了です。", tab: "drawing", ui: "dw-close", check: (s) => s.env === "part" },
        ],
        summary: ["読みにくい小さな部分は詳細図で拡大 (尺度を明記)", "穴・軸・対称形には細い一点鎖線の中心線", "同じ穴は「4×φ9」とまとめて 1 か所に"],
        quiz: [
          { q: "中心線に使う線の種類は?", choices: ["太い実線", "細い一点鎖線", "細い破線"], answer: 1, explain: "中心線は細い一点鎖線です。破線はかくれ線に使います。" },
          { q: "φ9 の穴が 4 個あるとき、JIS の一般的な記入は?", choices: ["4 か所それぞれに φ9", "4×φ9 と 1 か所にまとめる", "穴径は書かない"], answer: 1, explain: "同じ寸法の穴は個数×径でまとめて記入し、図面をすっきりさせます。" },
          { q: "詳細図に必ず添えるものは?", choices: ["識別文字と尺度", "材料名", "設計者名"], answer: 0, explain: "元の図の円に付けた文字 (A など) と、拡大した尺度 (2:1 など) を添えます。" },
        ],
        see: ["views", "dimensioning", "drawing"],
      },
      {
        id: "6-3",
        title: "寸法と公差・はめあい — 加工できる寸法を入れる",
        minutes: 15,
        level: 2,
        goals: ["機能に必要な寸法を手で記入できる", "寸法に公差 (±) やはめあい記号 (H7 など) を付けられる", "普通公差を表題欄に記入できる"],
        theory: `
<p>図面の寸法は「加工者が測って確かめられる」ことが大切です。すべての寸法に厳しい公差を付けるとコストが跳ね上がるため、</p>
<ul>
  <li><b>機能に効く寸法</b> (はめあい・位置決め・組立に関わる) だけに個別の公差を付ける</li>
  <li>それ以外は <b>普通公差</b> (JIS B 0405 の中級 m など) を表題欄付近にまとめて指示する</li>
</ul>
<table class="ln-table">
  <tr><th>表し方</th><th>例</th><th>意味</th></tr>
  <tr><td>両側公差</td><td>50 ±0.1</td><td>49.9〜50.1</td></tr>
  <tr><td>片側公差</td><td>20 <sup>+0.1</sup><sub>0</sub></td><td>20.0〜20.1</td></tr>
  <tr><td>はめあい記号</td><td>φ20 H7</td><td>穴基準のはめあい。H7 は φ20 で 0〜+0.021</td></tr>
</table>
<p>寸法の記入方法には、基準面からそろえる<b>並列寸法</b>、隣どうしをつなぐ<b>直列寸法</b>、原点からの値を書く<b>累進 (座標) 寸法</b>があり、誤差が積み重ならないのは並列・累進です。</p>`,
        setup: { kind: "part", make: sampleDocument },
        steps: [
          { text: "<b>管理</b>タブの <b>図面ビュー</b> で図面環境を開きます。", tab: "manage", ui: "drawing", check: (s) => s.env === "drawing" && views(s).length >= 1 },
          { text: "<b>寸法</b> (<kbd>D</kbd>) を選び、正面図のプレートの上下 2 本の水平線を順にクリック → 外側をクリックして<b>板厚</b>の寸法を記入します。", tab: "drawing", ui: "dw-dim", check: (s) => dims(s).length >= 1, hint: "1 本の線分を選んでそのまま外側をクリックすると、その線分の長さが記入されます。" },
          { text: "次に平面図でボスの穴 (中央の円) をクリック → 外側をクリックして<b>直径 (φ)</b> 寸法を記入します。", tab: "drawing", ui: "dw-dim", check: (s) => dims(s).some((d) => d.type === "dim" && (d.kind === "diameter" || d.kind === "radius")), hint: "円をクリックすると直径寸法、円弧なら半径寸法になります。" },
          { text: "<b>Esc</b> で選択モードに戻り、いま記入した直径寸法を<b>ダブルクリック</b>します。公差の種類を<b>はめあい</b>にして <b>H7</b> と入力し、OK を押します。", tab: "drawing", check: (s) => tolDims(s, "fit").length >= 1, hint: "寸法の文字をダブルクリックすると編集画面が開きます。公差は「±」「上下の許容差」「はめあい」から選べます。" },
          { text: "もう 1 つの寸法 (板厚など) をダブルクリックし、公差の種類を <b>±</b> にして <b>0.1</b> を入力します。", tab: "drawing", check: (s) => tolDims(s, "sym").length + tolDims(s, "dev").length >= 1 },
          { text: "<b>シート設定</b> を開き、表題欄の<b>普通公差</b>に「JIS B 0405-m」と入力します。", tab: "drawing", ui: "dw-sheet", check: (s) => !!drawing(s)?.title.generalTol.trim(), hint: "普通公差は、個別に公差を書かない寸法すべてに適用される約束です。" },
          { text: "<b>モデルに戻る</b> で 3D に戻ります。レッスン完了です。", tab: "drawing", ui: "dw-close", check: (s) => s.env === "part" },
        ],
        summary: ["公差は機能に効く寸法にだけ — 他は普通公差でまとめる", "はめあいは記号 (H7/g6 など) で指示すると加工者に伝わる", "並列・累進寸法は誤差が積み重ならない"],
        quiz: [
          { q: "すべての寸法に ±0.01 の公差を付けると?", choices: ["品質が上がり安くなる", "加工・検査コストが大きく上がる", "何も変わらない"], answer: 1, explain: "厳しい公差は加工時間・検査・不良率を増やします。機能に必要な寸法だけに付けます。" },
          { q: "個別の公差がない寸法の許容差を決めるのは?", choices: ["普通公差", "加工者の判断", "尺度"], answer: 0, explain: "JIS B 0405 などの普通公差を図面に指示しておくと、公差のない寸法にも許容範囲が決まります。" },
          { q: "誤差が積み重なりやすい寸法の入れ方は?", choices: ["並列寸法", "累進寸法", "直列寸法"], answer: 2, explain: "直列寸法は各寸法の誤差が足し算されて端の位置がずれます。重要な位置は基準からの並列・累進で入れます。" },
        ],
        see: ["dimensioning", "tolerance", "tolerance-design"],
      },
      {
        id: "6-4",
        title: "データム・幾何公差・表面性状 — 形と仕上げを指示する",
        minutes: 15,
        level: 3,
        goals: ["データム (基準) を図面に指示できる", "幾何公差 (平面度・平行度・位置度) の枠を記入できる", "表面性状 (Ra) を指示できる"],
        theory: `
<p>寸法公差は「大きさ」しか決めません。<b>平らさ・傾き・位置のずれ</b> は<b>幾何公差</b>で指示します。</p>
<ol>
  <li><b>データム</b>: 測定の基準になる面や軸。三角の記号と文字 (A, B …) で示す</li>
  <li><b>幾何公差の枠</b>: [記号 | 公差値 | データム]。例 <code>⫽ 0.05 A</code> は「データム A に対して平行度 0.05 以内」</li>
  <li><b>表面性状</b>: 面の粗さ。Ra 3.2 (一般的な切削面)、Ra 1.6 (はめあい面)、Ra 0.8 (摺動面) など</li>
</ol>
<table class="ln-table">
  <tr><th>記号</th><th>名称</th><th>データム</th><th>使いどころ</th></tr>
  <tr><td>⏥</td><td>平面度</td><td>不要</td><td>取付面・シール面</td></tr>
  <tr><td>⫽</td><td>平行度</td><td>必要</td><td>上下の面の関係</td></tr>
  <tr><td>⟂</td><td>直角度</td><td>必要</td><td>穴の軸と取付面</td></tr>
  <tr><td>⌖</td><td>位置度</td><td>必要</td><td>ボルト穴の位置</td></tr>
</table>
<p class="ln-note">表面を細かくするほど加工は高くなります。機能のある面だけに指示しましょう。</p>`,
        setup: { kind: "part", make: sampleDocument },
        steps: [
          { text: "<b>管理</b>タブの <b>図面ビュー</b> で図面環境を開きます。", tab: "manage", ui: "drawing", check: (s) => s.env === "drawing" && views(s).length >= 1 },
          { text: "<b>データム</b> を選び、正面図のプレート<b>底面</b> (下の水平線) をクリック → 少し下をクリックして、データム <b>A</b> を記入します。", tab: "drawing", ui: "dw-datum", check: (s) => annos(s, "datum").length >= 1, hint: "取付面 (相手部品に当たる面) を基準にするのが基本です。" },
          { text: "<b>幾何公差</b> を選び、正面図のボスの<b>上面</b> (上の水平線) をクリック → 枠を置く位置をクリックします。特性を <b>⫽ 平行度</b>、公差値 0.05、データム A にして OK を押します。", tab: "drawing", ui: "dw-gdt", check: (s) => annos(s, "gdt").length >= 1 },
          { text: "<b>表面性状</b> を選び、正面図のプレート底面をクリックして <b>Ra 1.6</b> と入力します。", tab: "drawing", ui: "dw-surface", check: (s) => annos(s, "surface").length >= 1, hint: "取付面のように機能のある面は細かく、それ以外は Ra 6.3〜12.5 程度で十分です。" },
          { text: "<b>引出線注記</b> を選び、面取りや角をクリック → 位置をクリックして「指示なき角は C0.5」などの注記を入れてみましょう。", tab: "drawing", ui: "dw-leader", check: (s) => annos(s, "note").length >= 1 },
          { text: "<b>モデルに戻る</b> で 3D に戻ります。レッスン完了です。", tab: "drawing", ui: "dw-close", check: (s) => s.env === "part" },
        ],
        summary: ["寸法公差 = 大きさ、幾何公差 = 形・姿勢・位置", "幾何公差の多くはデータム (基準) と組で使う", "表面性状は機能のある面にだけ細かく指示する"],
        quiz: [
          { q: "平面度の指示にデータムは必要?", choices: ["必要", "不要", "2 つ必要"], answer: 1, explain: "平面度は面そのものの平らさなので、基準 (データム) を必要としない単独形体の公差です。" },
          { q: "幾何公差の枠「⌖ φ0.1 A B」の意味は?", choices: ["データム A, B を基準に位置度 φ0.1 以内", "平面度 0.1", "直径 0.1 の穴"], answer: 0, explain: "位置度は基準 (A, B) からの理論的に正確な位置に対して、軸線が φ0.1 の円筒内にあることを求めます。" },
          { q: "一般的な切削仕上げ面の表面粗さの目安は?", choices: ["Ra 0.05", "Ra 3.2", "Ra 100"], answer: 1, explain: "Ra 3.2 は一般的な旋削・フライス加工面、Ra 1.6 ははめあい面、Ra 0.8 以下は研削など高コストになります。" },
        ],
        see: ["gdt", "symbols", "tolerance-design"],
      },
      {
        id: "6-5",
        title: "断面のいろいろ — 部分断面と破断図",
        minutes: 12,
        level: 2,
        goals: ["全断面・部分断面・破断図を使い分けられる", "部分断面で穴の内部を見せられる", "長い部品を破断図で短く表せる"],
        theory: `
<p>かくれ線 (破線) が多い図は読みにくくなります。内部の形は<b>断面</b>で見せるのが原則です。</p>
<table class="ln-table">
  <tr><th>種類</th><th>使う場面</th></tr>
  <tr><td><b>全断面</b></td><td>部品全体を 1 つの平面で切る (第 6 章で作成)</td></tr>
  <tr><td><b>片側断面</b></td><td>対称な部品の半分だけを切り、外形と内部を同時に見せる</td></tr>
  <tr><td><b>部分断面</b></td><td>見せたい部分 (穴・ねじ) だけを破断線で囲んで切る</td></tr>
  <tr><td><b>階段断面</b></td><td>一直線上にない複数の穴を、折れ曲がった切断線でまとめて見せる</td></tr>
  <tr><td><b>破断図</b></td><td>長い軸・形材の中間を省略して用紙に収める (寸法は実寸で書く)</td></tr>
</table>
<p class="ln-note">ボルト・軸・ピン・リブなどは、長手方向に切っても断面にしない (ハッチングしない) のが JIS のきまりです。</p>`,
        setup: { kind: "part", make: sampleDocument },
        steps: [
          { text: "<b>管理</b>タブの <b>図面ビュー</b> で図面環境を開きます。", tab: "manage", ui: "drawing", check: (s) => s.env === "drawing" && views(s).length >= 1 },
          { text: "正面図をクリックして選択し、<b>部分断面</b> を押します。範囲はそのまま、深さを <b>25</b> (部品の奥行の中央付近) にして OK を押すと、ボスの穴の内部が見えます。", tab: "drawing", ui: "dw-breakout", check: (s) => views(s).some((v) => !!v.breakout), hint: "深さは手前の面から切り取る距離です。穴の中心まで切ると内部の形がよくわかります。" },
          { text: "次に平面図をクリックして選択し、<b>破断</b> を押して、そのまま OK を押します。中央が省略された破断図になります (寸法は実寸のまま)。", tab: "drawing", ui: "dw-break", check: (s) => views(s).some((v) => !!v.breaks?.length) },
          { text: "<b>断面</b> を選び、平面図で 2 つの取付穴の中心を通る切断線を引いて断面図を配置します。", tab: "drawing", ui: "dw-section", check: (s) => views(s, "section").length >= 1, hint: "穴の円をクリックすると中心にスナップします。" },
          { text: "<b>モデルに戻る</b> で 3D に戻ります。レッスン完了です。", tab: "drawing", ui: "dw-close", check: (s) => s.env === "part" },
        ],
        summary: ["内部の形はかくれ線より断面で見せる", "部分断面は見せたい所だけ、破断図は長い部品を短く", "軸・ボルト・リブは長手方向に切っても断面にしない"],
        quiz: [
          { q: "長さ 1500 mm の丸棒を A4 に収めて描くには?", choices: ["尺度を 1:20 にする", "破断図で中間を省略する", "描かない"], answer: 1, explain: "破断図なら細部を読める尺度のまま中間を省略できます。寸法は実寸 (1500) で記入します。" },
          { q: "長手方向に切っても断面にしないものは?", choices: ["ハウジング", "軸・ボルト", "フランジ"], answer: 1, explain: "軸・ボルト・ピン・キー・リブなどは切ると誤解を招くため、断面にしません。" },
        ],
        see: ["sections", "views"],
      },
      {
        id: "6-6",
        title: "穴テーブルと座標寸法 — 穴の多い部品の図面",
        minutes: 10,
        level: 2,
        goals: ["座標 (累進) 寸法で穴位置を記入できる", "穴テーブルで穴の位置と径を表にできる", "寸法を整列して読みやすくできる"],
        theory: `
<p>穴の多い板金・プレートでは、寸法線を何十本も描くと図面が埋もれてしまいます。NC 加工では原点からの座標で穴を加工するため、</p>
<ul>
  <li><b>座標 (累進) 寸法</b>: 原点 0 からの距離を 1 本の寸法線上に並べて書く</li>
  <li><b>穴テーブル</b>: 穴に記号 (A1, A2 …) を付け、X・Y 座標と径を表にまとめる</li>
</ul>
<p>どちらも<b>基準 (原点) を 1 つに決める</b>ので、誤差が積み重ならず、検査でも測りやすくなります。原点は通常、加工や組立の基準になる角や穴に置きます。</p>`,
        setup: { kind: "part", make: sampleDocument },
        steps: [
          { text: "<b>管理</b>タブの <b>図面ビュー</b> で図面環境を開きます。", tab: "manage", ui: "drawing", check: (s) => s.env === "drawing" && views(s).length >= 1 },
          { text: "自動化パネルの <b>座標寸法</b> を選んでから <b>自動寸法</b> を押します。穴の位置が原点からの座標寸法で記入されます。", tab: "drawing", ui: "dw-style-ord", check: (s) => annos(s, "ordinate").length >= 1, hint: "先に「座標寸法」を押して方式を選び、そのあと「自動寸法」を押します。" },
          { text: "<b>寸法を整列</b> を押して、重なった寸法を段に並べ替えます。", tab: "drawing", ui: "dw-arrange" },
          { text: "<b>穴テーブル</b> を押します。穴に記号が付き、座標と径の表が用紙の右上に配置されます。", tab: "drawing", ui: "dw-holetable", check: (s) => annos(s, "holetable").length >= 1 },
          { text: "<b>モデルに戻る</b> で 3D に戻ります。レッスン完了です。", tab: "drawing", ui: "dw-close", check: (s) => s.env === "part" },
        ],
        summary: ["穴の多い部品は座標寸法か穴テーブルで", "原点 (基準) を 1 つに決めると誤差が積み重ならない", "NC 加工のプログラムとも対応がとりやすい"],
        quiz: [
          { q: "座標 (累進) 寸法の利点は?", choices: ["誤差が積み重ならず NC 加工と対応しやすい", "寸法の数が増える", "公差が不要になる"], answer: 0, explain: "すべて共通の原点から測るので、直列寸法のような誤差の累積がありません。" },
          { q: "穴テーブルに書かれるものは?", choices: ["穴の記号・座標・径", "材料と重量", "加工時間"], answer: 0, explain: "記号 (A1 など) ごとに X・Y 座標と径 (と数) をまとめます。" },
        ],
        see: ["dimensioning", "dfm-sheet"],
      },
      {
        id: "6-7",
        title: "組立図と部品表 — アセンブリの図面",
        minutes: 12,
        level: 2,
        goals: ["アセンブリから組立図を作れる", "部品表 (品番・品名・数量・材質) と風船を付けられる", "部品図をまとめて作る図面セットを使える"],
        theory: `
<p>製品は<b>組立図</b> (全体の組み方) と<b>部品図</b> (1 部品ごとの加工図) の組で図面化します。</p>
<ul>
  <li><b>部品表</b>: 品番・品名・数量・材質・備考の表。購入品 (ボルトなど) は規格と呼び (M6×20 など) を書く</li>
  <li><b>風船 (バルーン)</b>: 組立図の各部品から引出線を出し、丸の中に部品表の品番を書く</li>
  <li><b>組立図の寸法</b>: 外形・取付寸法・動く範囲など、組立と据付けに必要な寸法だけにする</li>
</ul>
<p class="ln-note">このレッスンはブラケットとピンの小さなアセンブリを使います。</p>`,
        setup: { kind: "assembly", make: pinAssemblyStarter },
        steps: [
          { text: "<b>組立</b>タブの <b>図面ビュー</b> で組立図の図面環境を開きます。", tab: "assemble", ui: "asm-drawing", check: (s) => s.env === "drawing" && views(s).length >= 1 },
          { text: "<b>部品表</b> を押して、部品表を表示します (もう一度押すと非表示)。", tab: "drawing", ui: "dw-parts", check: (s) => (drawing(s)?.sheets ?? []).some((sh) => !!sh.partsList) },
          { text: "<b>自動風船</b> を押して、部品表の品番に合わせた風船を配置します。", tab: "drawing", ui: "dw-autoballoon", check: (s) => annos(s, "balloon").length >= 1 },
          { text: "<b>図面セット</b> を押して、部品ごとの部品図シートを一括で作ります。シートが増えたことを確認しましょう。", tab: "drawing", ui: "dw-set", check: (s) => (drawing(s)?.sheets.length ?? 0) >= 2, hint: "画面下のシートのタブで、組立図と部品図を切り替えられます。" },
          { text: "<b>モデルに戻る</b> でアセンブリに戻ります。レッスン完了です。", tab: "drawing", ui: "dw-close", check: (s) => s.env === "assembly" },
        ],
        summary: ["組立図 + 部品図 + 部品表 がひとそろいの図面", "風船の番号と部品表の品番を一致させる", "組立図の寸法は組立・据付けに必要なものだけ"],
        quiz: [
          { q: "風船 (バルーン) の中に書くものは?", choices: ["部品の重さ", "部品表の品番", "寸法"], answer: 1, explain: "風船の番号で部品表の行を引けるようにします。" },
          { q: "購入品のボルトについて部品表に書くべきことは?", choices: ["規格と呼び (例 JIS B 1176 M6×20)", "加工方法", "何も書かない"], answer: 0, explain: "購入品は図面を描かない代わりに、規格と呼び寸法・材質・数量で特定します。" },
        ],
        see: ["drawing", "reading"],
      },
    ],
  },
  // ---------------------------------------------------------------- 6++ ---
  {
    id: "drawing-practice",
    title: "第 6 章 (実践) 図面を一から組み立てる",
    desc: "白紙のシートにビューを配置する、尺度とかくれ線を整える、階段断面・溶接記号を描く、モデル変更を図面に反映する、図番・版を管理して出力する — 実務の図面づくりの流れを一通り体験します。",
    lessons: [
      {
        id: "6-8",
        title: "白紙から図面を組み立てる — 用紙・基準ビュー・投影ビュー",
        minutes: 15,
        level: 2,
        goals: ["用紙サイズと向きを選べる", "正面図を選んで基準ビューを配置できる", "投影ビューで平面図・側面図・等角図を追加し、尺度を変えられる"],
        theory: `
<p>自動配置に頼らず、<b>どの向きを正面図にするか</b>から自分で決めると、図面の質が大きく変わります。</p>
<ul>
  <li><b>正面図</b>は「その品物の形・機能を最もよく表す向き」。加工時の向き (旋盤なら軸を横) にそろえると現場で読みやすい</li>
  <li>投影図は<b>必要最小限</b>に。正面図だけで形がわかれば 1 面図でもよい (板物は正面図 + 板厚 t の記入など)</li>
  <li>かくれ線はなるべく使わず、必要なら断面で見せる</li>
  <li>尺度は JIS の推奨値 (1:1, 1:2, 1:5, 2:1, 5:1 …) から選ぶ</li>
</ul>
<table class="ln-table">
  <tr><th>用紙</th><th>大きさ (mm)</th><th>主な用途</th></tr>
  <tr><td>A4</td><td>297 × 210</td><td>小物の部品図 (縦置きも多い)</td></tr>
  <tr><td>A3</td><td>420 × 297</td><td>一般的な部品図・小さな組立図</td></tr>
  <tr><td>A2〜A0</td><td>594 × 420 〜</td><td>組立図・配置図</td></tr>
</table>`,
        setup: { kind: "part", make: sampleDocument },
        steps: [
          { text: "<b>管理</b>タブの <b>図面ビュー</b> で図面環境を開きます。", tab: "manage", ui: "drawing", check: (s) => s.env === "drawing" && views(s).length >= 1 },
          { text: "<b>シートを追加</b> を押して、白紙のシートを追加します。", tab: "drawing", ui: "dw-addsheet", check: (s) => (drawing(s)?.sheets.length ?? 0) >= 2 },
          { text: "<b>シート設定</b> を開き、用紙サイズを <b>A4</b>、向きを<b>縦</b>にして OK を押します。", tab: "drawing", ui: "dw-sheet", check: (s) => !!drawing(s)?.sheets.some((sh, i) => i > 0 && sh.size === "A4" && !sh.landscape), hint: "追加したシート (シート2) が開いた状態で設定します。" },
          { text: "<b>基準</b> を押して向きに <b>正面図</b> を選び、用紙の左上寄りをクリックして基準ビューを配置します。", tab: "drawing", ui: "dw-base", check: (s) => (drawing(s)?.sheets.slice(1).some((sh) => sh.views.length >= 1) ?? false) },
          { text: "<b>投影</b> を選び、正面図をクリック → その<b>上</b>・<b>右</b>・<b>右上 (斜め)</b> をクリックして、平面図・右側面図・等角図を配置します。右クリックで終了します。", tab: "drawing", ui: "dw-projected", check: (s) => (drawing(s)?.sheets.slice(1).some((sh) => sh.views.filter((v) => v.kind === "projected").length >= 2) ?? false), hint: "第三角法なので、上をクリックすると平面図、右をクリックすると右側面図になります。斜めの位置では等角図になります。" },
          { text: "左のブラウザで<b>正面図</b>をダブルクリックし、尺度を <b>1:2</b> に変えて OK を押します。投影ビューも一緒に縮小されます。", tab: "drawing", check: (s) => (drawing(s)?.sheets.slice(1).some((sh) => sh.views.some((v) => v.kind === "base" && Math.abs(v.scale - 0.5) < 1e-9)) ?? false), hint: "図面ブラウザのビューの行をダブルクリックすると「ビューを編集」が開きます。" },
          { text: "<b>モデルに戻る</b> で 3D に戻ります。レッスン完了です。", tab: "drawing", ui: "dw-close", check: (s) => s.env === "part" },
        ],
        summary: ["正面図は形と機能を最もよく表す向き (加工の向きにそろえる)", "投影図は必要最小限 — 第三角法で上に平面図・右に右側面図", "尺度は推奨値から選び、表題欄に明記"],
        quiz: [
          { q: "正面図に選ぶべき向きは?", choices: ["いちばん小さく見える向き", "形・機能を最もよく表す向き", "必ず上から見た向き"], answer: 1, explain: "正面図は品物の特徴を最もよく表す向きを選びます。旋削部品は軸を水平に置くのが一般的です。" },
          { q: "JIS の推奨尺度でないものは?", choices: ["1:2", "1:3", "1:5"], answer: 1, explain: "推奨尺度は 1, 2, 5 の系列 (1:2, 1:5, 1:10 …) です。1:3 などは許容尺度で、なるべく使いません。" },
        ],
        see: ["views", "drawing", "reading"],
      },
      {
        id: "6-9",
        title: "階段断面とビューの編集 — かくれ線を減らす",
        minutes: 12,
        level: 3,
        goals: ["断面図を階段断面に変えられる", "ビューのかくれ線・中心マークの表示を切り替えられる", "読みやすい図の見せ方を選べる"],
        theory: `
<p>一直線上にない複数の穴を 1 枚の断面で見せたいときは、切断線を途中で折り曲げた<b>階段断面</b>を使います。切断線の折れ目には太い線を、両端には矢印と記号 (A) を付けます。</p>
<p>ビューごとに次の表示を整えます。</p>
<ul>
  <li><b>かくれ線</b>: 外形だけで形がわかるなら消す。内部は断面で示す</li>
  <li><b>中心マーク</b>: 穴・円筒には必ず。等角図には付けない</li>
  <li><b>ラベル</b>: 断面 A-A・詳細 B などは図と記号を対応させる</li>
</ul>`,
        setup: { kind: "part", make: sampleDocument },
        steps: [
          { text: "<b>管理</b>タブの <b>図面ビュー</b> で図面環境を開きます。", tab: "manage", ui: "drawing", check: (s) => s.env === "drawing" && views(s).length >= 1 },
          { text: "<b>断面</b> を選び、平面図を横切る水平な切断線を引いて、断面図を配置します。", tab: "drawing", ui: "dw-section", check: (s) => views(s, "section").length >= 1 },
          { text: "ブラウザの<b>断面 A</b> をダブルクリックし、<b>階段断面</b>の欄に「<code>40, 15</code>」(切断線の始点から 40 mm の位置で 15 mm 奥へずらす) と入力して OK を押します。", tab: "drawing", check: (s) => views(s, "section").some((v) => !!v.section?.steps?.length), hint: "数値は「切断線の始点からの距離, 奥へのずらし量」です。穴の位置に合わせて変えてみましょう。" },
          { text: "次に<b>平面図</b>のビューをダブルクリックし、<b>隠れ線を表示</b>のチェックを外して OK を押します。", tab: "drawing", check: (s) => views(s).some((v) => (v.kind === "base" || v.kind === "projected") && v.label !== "等角図" && !v.hidden && !v.breakout) },
          { text: "<b>モデルに戻る</b> で 3D に戻ります。レッスン完了です。", tab: "drawing", ui: "dw-close", check: (s) => s.env === "part" },
        ],
        summary: ["一直線上にない形体は階段断面でまとめて見せる", "かくれ線は最小限 — 内部は断面で", "等角図には中心マーク・かくれ線を付けない"],
        quiz: [
          { q: "階段断面を使う場面は?", choices: ["一直線上にない複数の穴を 1 つの断面で見せたい", "部品が長すぎる", "対称な部品の半分を見せたい"], answer: 0, explain: "切断線を折り曲げて、離れた位置の穴やみぞを 1 つの断面図にまとめます。" },
          { q: "かくれ線を多用するとどうなる?", choices: ["図が読みにくくなる", "加工が安くなる", "寸法が不要になる"], answer: 0, explain: "破線が重なると形が読み取りにくくなります。内部形状は断面図で示すのが原則です。" },
        ],
        see: ["sections", "views"],
      },
      {
        id: "6-10",
        title: "溶接記号 — 溶接構造物の図面",
        minutes: 12,
        level: 3,
        goals: ["隅肉溶接の記号を記入できる", "矢の側・反対側の意味がわかる", "全周溶接・現場溶接の補助記号を使える"],
        theory: `
<p>フレームや架台などの溶接構造物では、どこを・どの形で・どれだけ溶接するかを<b>溶接記号</b> (JIS Z 3021) で指示します。</p>
<ul>
  <li><b>矢</b>が溶接する継手を指し、<b>基線</b>の上に記号を書く</li>
  <li>記号が基線の<b>下</b> (矢の側) にあれば矢の指す側、<b>上</b>にあれば反対側を溶接 (JIS の基線 1 本の場合)</li>
  <li>隅肉溶接は三角形の記号に<b>脚長</b> (例 6) と<b>長さ</b>を添える</li>
  <li>旗の記号は<b>現場溶接</b>、矢と基線の交点の丸は<b>全周溶接</b></li>
</ul>
<p class="ln-note">脚長は薄いほうの板厚の 0.7 倍程度が目安。溶接しすぎはひずみとコストのもとです。</p>`,
        setup: { kind: "part", make: sampleDocument },
        steps: [
          { text: "<b>管理</b>タブの <b>図面ビュー</b> で図面環境を開きます。", tab: "manage", ui: "drawing", check: (s) => s.env === "drawing" && views(s).length >= 1 },
          { text: "<b>溶接記号</b> を選び、正面図のボスと板の角 (つなぎ目) をクリック → 基線の位置をクリックします。種類 <b>隅肉</b>、脚長 <b>6</b> にして OK を押します。", tab: "drawing", ui: "dw-weld", check: (s) => annos(s, "weld").length >= 1, hint: "ボスと板が別部品の溶接構造だと考えて記入してみましょう。" },
          { text: "もう一度 <b>溶接記号</b> で別の角に記入し、今度は <b>全周溶接</b> にチェックを入れます (ボスの周りを 1 周溶接する指示)。", tab: "drawing", ui: "dw-weld", check: (s) => annos(s, "weld").some((a) => a.type === "weld" && a.allAround) },
          { text: "<b>モデルに戻る</b> で 3D に戻ります。レッスン完了です。", tab: "drawing", ui: "dw-close", check: (s) => s.env === "part" },
        ],
        summary: ["溶接記号 = 矢 + 基線 + 記号 + 寸法", "矢の側か反対側かは記号の位置で区別", "全周 (○) と現場溶接 (旗) の補助記号"],
        quiz: [
          { q: "隅肉溶接の記号の形は?", choices: ["直角三角形", "円", "V 字"], answer: 0, explain: "隅肉溶接は直角三角形の記号です。V 字は V 形開先溶接です。" },
          { q: "矢と基線の交点に描く小さな丸の意味は?", choices: ["現場溶接", "全周溶接", "スポット溶接"], answer: 1, explain: "交点の丸は全周溶接、旗は現場溶接を表します。" },
        ],
        see: ["weld-symbols", "symbols"],
      },
      {
        id: "6-11",
        title: "モデル変更と図面の連動 — 設計変更に強い図面",
        minutes: 12,
        level: 2,
        goals: ["モデルを変えると図面が自動で更新されることを確かめる", "設計変更のあとに図面で確認すべき点がわかる", "版 (リビジョン) を上げて変更を記録できる"],
        theory: `
<p>3D CAD の図面は<b>モデルから生成</b>されているので、モデルを変えるとビューも寸法の値も追従します。ただし自動で済まないこともあります。</p>
<ul>
  <li>寸法が<b>消えた形状</b>を参照していないか (穴を消したら穴の寸法も消える)</li>
  <li>寸法・注記が<b>重なっていないか</b> (寸法を整列で整える)</li>
  <li>図番はそのまま、<b>版 (リビジョン)</b> を上げて変更内容を記録する</li>
</ul>
<p>改訂の記録 (いつ・誰が・何を・なぜ) は、現場の古い図面との取り違えを防ぐ大切な情報です。</p>`,
        setup: { kind: "part", make: sampleDocument },
        steps: [
          { text: "<b>管理</b>タブの <b>図面ビュー</b> で図面環境を開き、<b>自動寸法</b> で寸法を入れます。", tab: "manage", ui: "drawing", check: (s) => s.env === "drawing" && dims(s).length >= 1 },
          { text: "<b>モデルに戻る</b> で 3D に戻ります。", tab: "drawing", ui: "dw-close", check: (s) => s.env === "part" },
          { text: "<b>3D モデル</b>タブの <b>パラメータ</b> (fx) で、ユーザ パラメータ <b>幅</b> を <code>100</code> に変更します。", tab: "model", ui: "params", check: (s) => near(s.values.get("幅"), 100) },
          { text: "パラメータを閉じて、もう一度 <b>管理</b> → <b>図面ビュー</b> を開きます。ビューと寸法の値が新しい幅に更新されていることを確認しましょう。", tab: "manage", ui: "drawing", check: (s) => s.env === "drawing" && s.command === null },
          { text: "<b>シート設定</b> を開き、表題欄の<b>版</b>に「B」、<b>図番</b>に「BR-001」を入力して OK を押します。", tab: "drawing", ui: "dw-sheet", check: (s) => !!drawing(s)?.title.revision.trim() && !!drawing(s)?.title.number.trim() },
          { text: "<b>寸法を整列</b> を押して寸法の重なりを整え、<b>モデルに戻る</b> で終了します。レッスン完了です。", tab: "drawing", ui: "dw-close", check: (s) => s.env === "part" },
        ],
        summary: ["図面はモデルから生成 — 形状変更は自動で反映", "変更後は寸法の欠落・重なりを確認", "図番は変えず版を上げて改訂を記録"],
        quiz: [
          { q: "部品の寸法を変更したとき、図面で行うことは?", choices: ["図番を新しくする", "版を上げて変更を記録する", "何もしない"], answer: 1, explain: "互換性のある変更なら図番はそのまま、版 (A→B) を上げて改訂欄に内容を記録します。互換性がなくなる変更は図番を変えるのが一般的です。" },
          { q: "モデルの穴を削除すると、その穴の寸法は?", choices: ["参照先がなくなるので確認が必要", "自動で別の穴に付け替わる", "そのまま残る"], answer: 0, explain: "参照していた形状が消えると寸法も消えたり外れたりします。変更後は必ず図面を見直します。" },
        ],
        see: ["design-change", "3d-data-management", "drawing"],
      },
      {
        id: "6-12",
        title: "図面の出力と受け渡し — PDF・DXF・SVG",
        minutes: 8,
        level: 1,
        goals: ["表題欄を完成させられる", "用途に合わせて PDF・DXF・SVG を使い分けられる"],
        theory: `
<table class="ln-table">
  <tr><th>形式</th><th>中身</th><th>使い道</th></tr>
  <tr><td><b>PDF</b></td><td>ベクター図面 (見る・印刷する)</td><td>見積・発注・承認・保管。相手の CAD を問わない</td></tr>
  <tr><td><b>DXF</b></td><td>2D CAD データ (線・円・文字)</td><td>2D CAD での修正、レーザー・ワイヤ加工の外形データ</td></tr>
  <tr><td><b>SVG</b></td><td>Web 用のベクター画像</td><td>マニュアル・Web ページ・プレゼン資料</td></tr>
</table>
<p>外注に出すときは <b>PDF (正式な指示) + STEP (3D 形状)</b> の組が基本です。データと図面の版が一致していることを必ず確認しましょう。</p>`,
        setup: { kind: "part", make: sampleDocument },
        steps: [
          { text: "<b>管理</b>タブの <b>図面ビュー</b> で図面環境を開きます。", tab: "manage", ui: "drawing", check: (s) => s.env === "drawing" && views(s).length >= 1 },
          { text: "<b>シート設定</b> で表題欄の<b>名称</b>・<b>図番</b>・<b>材料</b>・<b>設計者</b>を埋めます。", tab: "drawing", ui: "dw-sheet", check: (s) => { const t = drawing(s)?.title; return !!t && [t.title, t.number, t.material, t.designer].every((x) => !!x?.trim()); } },
          { text: "<b>DXF</b> で書き出してみましょう (2D CAD やレーザー加工の外形データ用)。", tab: "drawing", ui: "dw-dxf" },
          { text: "<b>PDF</b> で全シートを書き出します。", tab: "drawing", ui: "dw-pdf" },
          { text: "<b>モデルに戻る</b> で 3D に戻ります。レッスン完了です。", tab: "drawing", ui: "dw-close", check: (s) => s.env === "part" },
        ],
        summary: ["PDF = 正式な指示書、DXF = 2D CAD・加工データ、SVG = 資料用", "外注は PDF 図面 + STEP の組で", "図面とデータの版を一致させる"],
        quiz: [
          { q: "レーザー切断業者に外形データを渡すのに適した形式は?", choices: ["DXF", "JPEG", "Word"], answer: 0, explain: "DXF は線と円弧の正確な 2D データなので、加工機の CAM に取り込めます。" },
          { q: "外注で正式な指示として扱われるのは?", choices: ["図面 (PDF)", "口頭の説明", "画面のスクリーンショット"], answer: 0, explain: "寸法・公差・材料・仕上げは図面が正式な指示書です。3D データは形状の参考として添えるのが一般的です。" },
        ],
        see: ["design-docs", "2d-data", "drawing"],
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
          { text: "パネルの<b>固定拘束</b>が選ばれた状態で <b>底面を追加</b> を押し、プレートの (見えない) 底面を固定にします。次に<b>荷重面</b>をクリックしてからボスの<b>上面</b>をクリックし、力 1000 N のまま <b>解析を実行</b> します。", tab: "inspect", ui: "stress", check: (s) => s.analysisDone, hint: "条件のボタン (固定拘束 / 荷重面) を押してアクティブにしてから面をクリックします。選んだ面はボタン左の四角と同じ色 (固定 = 緑、荷重 = 赤) で表示されます。裏側の面はモデルを回転させて選ぶこともできます。計算には数秒〜数十秒かかります。" },
          { text: "コンターの色 (青 = 低い → 赤 = 高い) で応力の大きい場所を確認し、<b>安全率</b>と<b>変位</b>の表示に切り替えてみましょう。" },
          { text: "パネルを閉じて解析を終了します。レッスン完了です。", check: (s) => s.command === null },
        ],
        summary: ["応力解析 = 固定 + 荷重 → 応力・変位・安全率", "安全率 = 降伏応力 ÷ 最大応力 (目安 2〜3 以上)", "鋭い角は応力集中 — フィレットで改善"],
        quiz: [
          { q: "降伏応力 270 MPa の材料で、最大応力 90 MPa のとき安全率は?", choices: ["0.33", "3", "180"], answer: 1, explain: "270 ÷ 90 = 3 です。" },
          { q: "応力解析で必ず指定しなければならない条件は?", choices: ["色と材質感", "固定と荷重", "図面の尺度"], answer: 1, explain: "どこが固定され、どこにどんな力がかかるかがわからないと計算できません。" },
        ],
        see: ["stress", "bending", "safety", "fea-practice"],
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
        see: ["dfm-3dp"],
      },
      {
        id: "7-3",
        title: "固有振動数解析 — 共振しない形を考える",
        minutes: 12,
        level: 3,
        goals: ["固有値解析で 1 次〜数次の固有振動数を求められる", "モード形状のアニメーションから弱い方向を読み取れる", "共振を避ける設計の考え方がわかる"],
        theory: `
<p>部品には揺れやすい振動数 (<b>固有振動数</b>) と揺れ方 (<b>モード形状</b>) があります。モーターの回転数やファンなどの加振振動数が固有振動数に近いと<b>共振</b>し、小さな力でも大きく揺れて騒音・破損の原因になります。</p>
<ul>
  <li>目安: 1 次固有振動数を加振振動数の <b>√2 倍以上 (できれば 2〜3 倍以上)</b> に離す</li>
  <li>固有振動数 ∝ √(剛性 / 質量) — 剛性を上げる (リブ・閉断面) か、軽くする</li>
  <li>モード形状で「どこが一番動くか」を見て、そこを補強する</li>
</ul>`,
        setup: { kind: "part", make: sampleDocument },
        steps: [
          { text: "<b>検査</b>タブの <b>応力解析</b> を開き、種類を <b>固有値解析</b> にします。", tab: "inspect", ui: "stress", check: (s) => s.command === "stress" && s.analysisKind === "modal" },
          { text: "<b>底面を追加</b> で底面を固定し、<b>解析を実行</b> します。", tab: "inspect", ui: "stress", check: (s) => s.analysisDone && s.analysisKind === "modal", hint: "固有値解析では荷重は不要です。固定条件だけで計算します。" },
          { text: "結果の 1 次〜3 次の固有振動数を確認し、<b>モード形状をアニメーション</b>で揺れ方を見ましょう。パネルを閉じて終了します。", check: (s) => s.command === null },
        ],
        summary: ["加振振動数と固有振動数を離す (2〜3 倍以上が目安)", "固有振動数は √(剛性/質量) に比例", "モード形状の大きく動く所を補強する"],
        quiz: [
          { q: "固有振動数を上げるには?", choices: ["剛性を上げるか質量を減らす", "質量を増やす", "材料を柔らかくする"], answer: 0, explain: "f ∝ √(k/m) なので、剛性を上げるか軽くします。" },
          { q: "モーター回転数 25 Hz で回る装置のフレームの 1 次固有振動数として望ましいのは?", choices: ["24 Hz", "26 Hz", "75 Hz"], answer: 2, explain: "加振振動数の近くは共振します。2〜3 倍以上離した 75 Hz が安全側です。" },
        ],
        see: ["vibration", "vibration-modes", "stiffness-vibration-practice"],
      },
      {
        id: "7-4",
        title: "熱解析 — 熱を逃がす形を考える",
        minutes: 12,
        level: 3,
        goals: ["温度固定・入熱・対流の境界条件を設定できる", "温度分布から熱のこもる場所を見つけられる"],
        theory: `
<p>モーター・電源・LED などの発熱部品のまわりでは、<b>熱の通り道</b>を設計します。熱は高温から低温へ、<b>伝導</b> (部品の中)・<b>対流</b> (空気へ)・<b>放射</b> で移動します。</p>
<table class="ln-table">
  <tr><th>境界条件</th><th>意味</th><th>例</th></tr>
  <tr><td>温度固定面</td><td>温度が決まっている面</td><td>水冷板・大きな架台に接する面</td></tr>
  <tr><td>入熱面</td><td>熱が入る面 (W)</td><td>発熱部品の取付面</td></tr>
  <tr><td>対流面</td><td>空気へ熱を逃がす面</td><td>放熱フィン・外装 (自然対流 5〜10 W/m²K 程度)</td></tr>
</table>`,
        setup: { kind: "part", make: sampleDocument },
        steps: [
          { text: "<b>検査</b>タブの <b>応力解析</b> を開き、種類を <b>熱解析</b> にします。", tab: "inspect", ui: "stress", check: (s) => s.command === "stress" && s.analysisKind === "thermal" },
          { text: "<b>温度固定面</b>が選ばれた状態で <b>底面を追加</b> (架台で冷やされる面)、<b>入熱面</b>を押して <b>上面を追加</b> (発熱部品の取付面) とし、<b>解析を実行</b> します。", tab: "inspect", ui: "stress", check: (s) => s.analysisDone && s.analysisKind === "thermal" },
          { text: "温度分布で熱がこもる場所を確認し、パネルを閉じて終了します。レッスン完了です。", check: (s) => s.command === null },
        ],
        summary: ["熱は伝導・対流・放射で逃げる", "発熱源から冷却面までの熱の通り道を太く短く", "解析で熱のこもる場所を見つけて形状を改善"],
        quiz: [
          { q: "アルミの放熱板で熱を逃がしやすくする工夫は?", choices: ["フィンで表面積を増やす", "塗装を厚くする", "板を細くする"], answer: 0, explain: "対流で逃げる熱量は表面積に比例するので、フィンで面積を増やします。" },
          { q: "発熱部品から冷却面までの熱の流れを良くするには?", choices: ["通り道を太く短くする", "通り道を長くする", "断熱材を挟む"], answer: 0, explain: "伝導の熱抵抗は 長さ / (熱伝導率 × 断面積) なので、太く短くします。" },
        ],
        see: ["heat", "enclosure"],
      },
    ],
  },
  // ------------------------------------------------------------------ 8 ---
  {
    id: "advanced",
    title: "第 8 章 応用モデリング — スイープ・ロフト・板金",
    desc: "パイプや取っ手のような曲がった形、断面が変わる形、板を曲げて作る部品のモデリングを学びます。",
    lessons: [
      {
        id: "8-1",
        title: "スイープ — 経路に沿った形 (パイプ・取っ手)",
        minutes: 15,
        level: 2,
        goals: ["経路 (パス) とプロファイルの 2 つのスケッチを使い分けられる", "スイープでパイプや取っ手の形を作れる"],
        theory: `
<p><b>スイープ</b>は、断面 (<b>プロファイル</b>) を<b>経路 (パス)</b> に沿って動かした軌跡を立体にします。配管・手すり・ワイヤー・取っ手・ばねのような形に使います。</p>
<ol>
  <li><b>パス</b>: 開いた (または閉じた) 線分・円弧のつながり。立体の中心線になる</li>
  <li><b>プロファイル</b>: パスの<b>始点で、パスに垂直な平面</b>に描いた閉じた形</li>
</ol>
<p>押し出しは「まっすぐなパス」のスイープ、回転は「円のパス」のスイープと考えることもできます。</p>
<p class="ln-note">ここでは、正面 (XY 平面) に L 字のパスを描き、原点で垂直な XZ 平面に円のプロファイルを描きます。</p>`,
        setup: { kind: "newPart" },
        steps: [
          { text: "<b>2D スケッチ</b> を <b>XY 平面</b> (正面) に開始します。", tab: "model", ui: "sketch", check: inSketch },
          { text: "<b>線分</b> (<kbd>L</kbd>) で、<b>原点</b>から真上に 60 mm、続けて右へ 80 mm の L 字の線を描きます (閉じない)。", tab: "sketch", ui: "sk-line", check: (s) => count(editing(s), "line") >= 2, hint: "原点をクリック → 上の点 → 右の点 → <kbd>Esc</kbd>。寸法 (D) で 60 と 80 を付けると正確になります。" },
          { text: "<b>スケッチを終了</b> します。これがパスです。", tab: "sketch", ui: "sk-finish", check: (s) => s.mode === "model" },
          { text: "もう一度 <b>2D スケッチ</b> を押し、今度は水平な <b>XZ 平面</b> を選びます (パスの始点で、パスに垂直な平面)。", tab: "model", ui: "sketch", check: (s) => inSketch(s) && sketches(s).length >= 2 },
          { text: "<b>円</b> で原点を中心に直径 <code>12</code> の円を描き、<b>スケッチを終了</b> します。", tab: "sketch", ui: ["sk-circle", "sk-finish"], check: (s) => s.mode === "model" && sketches(s).some((k) => count(k, "circle") >= 1) },
          { text: "<b>スイープ</b> を押し、プロファイルに円の内側、パスに L 字のスケッチを選んで OK。曲がったパイプができます。", tab: "model", ui: "sweep", check: (s) => has<SweepFeature>(s, "sweep") && s.bodies > 0, hint: "パスの候補が 1 つだけなら自動で選ばれます。" },
          { text: "<b>シェル</b> でパイプの両端の面を取り除き、厚さ <code>1</code> の中空のパイプにしてみましょう (任意)。ブラウザでパスのスケッチを編集すると、パイプの形も変わります。レッスン完了です。", tab: "model", ui: "shell" },
        ],
        summary: ["スイープ = プロファイルをパスに沿って動かす", "プロファイルはパスの始点で、パスに垂直な平面に描く", "パスを編集すると形全体が追従する"],
        quiz: [
          { q: "スイープのプロファイルを描く平面として正しいのは?", choices: ["パスと同じ平面", "パスの始点でパスに垂直な平面", "どこでもよい"], answer: 1, explain: "プロファイルはパスの始点で、パスの向きに垂直な平面に描きます。" },
          { q: "スイープが特に向いている形は?", choices: ["直方体", "曲がった配管や手すり", "穴あきの板"], answer: 1, explain: "経路に沿って断面が一定の形 (配管・手すり・取っ手) に向いています。" },
        ],
        see: ["cad-practice"],
      },
      {
        id: "8-2",
        title: "ロフト — 断面が変わる形 (ノズル・ボトル)",
        minutes: 15,
        level: 2,
        goals: ["作業平面をオフセットして作れる", "複数の断面をロフトでつなげられる", "シェルで中空にできる"],
        theory: `
<p><b>ロフト</b>は、離れた平面に描いた<b>複数の断面</b>をなめらかにつないだ立体を作ります。四角から丸へ変わるダクト、ボトル、ノズル、船の船体などに使います。</p>
<ul>
  <li>断面は別々のスケッチに描く。高さの違う断面には<b>作業平面</b> (基準平面からオフセットした平面) を使う</li>
  <li>断面の順番どおりにつながる。断面の向き・点の数が大きく違うとねじれることがある</li>
  <li>「直線状 (ルールド)」にすると、断面の間を平面的につなぐ</li>
</ul>
<p class="ln-note">ここでは、床 (XZ 平面) の 60 × 40 の長方形と、高さ 40 の位置の直径 30 の円をつなぎます。</p>`,
        setup: { kind: "newPart" },
        steps: [
          { text: "<b>作業フィーチャ → 平面</b> を押し、<b>XZ 平面</b> を選んでオフセット <code>40</code> の作業平面を作ります。", tab: "model", ui: "workplane", check: (s) => has(s, "workplane"), hint: "ブラウザの「原点」から XZ 平面を選ぶこともできます。" },
          { text: "<b>2D スケッチ</b> を <b>XZ 平面</b> に開始し、原点を中心に 60 × 40 の<b>長方形</b>を描いて終了します。", tab: "model", ui: "sketch", check: (s) => s.mode === "model" && sketches(s).some((k) => count(k, "line") >= 4) },
          { text: "<b>2D スケッチ</b> を押し、今度は<b>作業平面1</b> を選びます。原点を中心に直径 <code>30</code> の<b>円</b>を描いて終了します。", tab: "model", ui: "sketch", check: (s) => s.mode === "model" && sketches(s).some((k) => !!k.planeRef && count(k, "circle") >= 1), hint: "作業平面はモデルの上に半透明で表示されています。ブラウザの「作業平面1」を右クリックしてもスケッチを作れます。" },
          { text: "<b>ロフト</b> を押し、2 つのスケッチを下から順に選んで OK。四角から丸へ変わる形ができます。", tab: "model", ui: "loft", check: (s) => has<LoftFeature>(s, "loft") && s.bodies > 0 },
          { text: "<b>シェル</b> で上と下の面を取り除き、厚さ <code>2</code> のダクトにします。", tab: "model", ui: "shell", check: (s) => has<ShellFeature>(s, "shell", (f) => f.faces.length >= 1) },
          { text: "パラメータ表で作業平面のオフセット (40) や円の直径を変えて、形がなめらかに変わることを確かめましょう。レッスン完了です。", tab: "model", ui: "params" },
        ],
        summary: ["ロフト = 複数の断面をなめらかにつなぐ", "高さの違う断面には作業平面を使う", "シェルと組み合わせてダクト・容器を作る"],
        quiz: [
          { q: "四角い吸込口から丸い出口へ変わるダクトを作るのに最適なのは?", choices: ["押し出し", "ロフト", "パターン"], answer: 1, explain: "異なる断面をなめらかにつなぐのはロフトです。" },
          { q: "床から 40 mm 上に断面を描くには、何を作る?", choices: ["作業平面 (オフセット)", "コンストラクション線", "パターン"], answer: 0, explain: "基準平面からオフセットした作業平面を作り、その上にスケッチします。" },
        ],
        see: ["dfm-molding", "form"],
      },
      {
        id: "8-3",
        title: "板金 — 板を曲げて作る",
        minutes: 15,
        level: 2,
        goals: ["板金の面とフランジで曲げ部品を作れる", "板厚・曲げ半径・K 係数の意味がわかる", "展開パターンを確認できる"],
        theory: `
<p><b>板金</b>部品は、平らな板を切り抜いて曲げて作ります。軽く・安く・少量でも作れるため、カバー・ブラケット・筐体に広く使われます。</p>
<ul>
  <li><b>面</b>: スケッチの輪郭を板厚一定の板にする</li>
  <li><b>フランジ</b>: 板の縁を曲げて立ち上げる (曲げ半径付き)</li>
  <li><b>展開パターン</b>: 曲げる前の平らな形。レーザー加工の DXF になる</li>
</ul>
<p>展開長さは<b>K 係数</b> (曲げたとき伸び縮みしない面の位置) で計算されます: 曲げ代 = 角度 × (曲げ半径 + K × 板厚)。</p>`,
        setup: { kind: "newPart" },
        steps: [
          { text: "<b>2D スケッチ</b> を <b>XZ 平面</b> に開始し、原点を中心に 100 × 60 の<b>長方形</b>を描いて終了します。", tab: "model", ui: "sketch", check: (s) => s.mode === "model" && sketches(s).some((k) => count(k, "line") >= 4) },
          { text: "<b>板金</b>タブの <b>面</b> を押し、長方形の内側を選んで OK。板厚 2 mm の板ができます。", tab: "sheetmetal", ui: "sheetFace", check: (s) => has(s, "sheetFace") && s.bodies > 0 },
          { text: "<b>フランジ</b> を押し、長い 2 辺の縁 (エッジ) をクリックして、高さ <code>20</code>・角度 90° で OK。", tab: "sheetmetal", ui: "flange", check: (s) => has<FlangeFeature>(s, "flange", (f) => f.edges.length >= 1), hint: "上面の外周のエッジをクリックします。4 辺すべて選ぶと箱 (トレー) になり、角には逃げが入ります。" },
          { text: "<b>板金スタイル</b> を開き、板厚・曲げ半径・K 係数を確認します (板厚を 1.6 に変えてみてもよい)。", tab: "sheetmetal", ui: "sm-style" },
          { text: "<b>展開パターン</b> を開き、展開寸法と曲げ線を確認します。DXF に書き出すとレーザー加工に使えます。レッスン完了です。", tab: "sheetmetal", ui: "sm-flat" },
        ],
        summary: ["板金 = 面 + フランジで曲げ部品を作る", "曲げ半径は板厚以上、フランジ高さは板厚の 3〜4 倍以上", "展開長さは K 係数で計算 — 展開パターンを DXF で加工へ"],
        quiz: [
          { q: "板金の展開長さの計算に使う、中立面の位置を表す値は?", choices: ["安全率", "K 係数", "モジュール"], answer: 1, explain: "K 係数は板厚に対する中立面の位置の比で、曲げ代の計算に使います。" },
          { q: "板厚 2 mm の板金で、内側曲げ半径の目安は?", choices: ["0.2 mm", "2 mm 程度以上", "20 mm 以上"], answer: 1, explain: "曲げ半径は板厚程度以上が目安。小さすぎると外側が割れます。" },
        ],
        see: ["dfm-sheet"],
      },
    ],
  },

  // ------------------------------------------------------------------ 9 ---
  {
    id: "expert",
    title: "第 9 章 上級 — 設計の自動化と製造連携",
    desc: "ファミリー表・ルールで設計を自動化し、改訂管理・コイル・トポロジー最適化・CAM まで、実務の上級機能を使いこなします。",
    lessons: [
      {
        id: "9-1",
        title: "【上級】ファミリー表 — サイズ違いを一括管理",
        minutes: 12,
        level: 3,
        goals: ["ファミリー表でサイズ違いの構成を作れる", "行を切り替えてモデルを変更できる"],
        theory: `
<p>同じ形でサイズだけ違う部品 (ボルト・ブラケットのシリーズなど) は、<b>ファミリー表</b> (iPart / デザインテーブル) で管理します。
列がパラメータ、行が構成 (品番) で、行を選ぶとそのサイズにモデルが変わります。</p>
<p class="ln-note">サンプルの「ブラケット」(ユーザ パラメータ 幅・奥行・板厚・ボス径) を使います。</p>`,
        setup: { kind: "part", make: sampleDocument },
        steps: [
          { text: "<b>管理</b>タブの <b>ファミリー表</b> を開き、列に <b>幅</b> と <b>板厚</b> を加えます。", tab: "manage", ui: "family", check: (s) => (s.part.family?.columns.length ?? 0) >= 1 },
          { text: "行を 2 つ以上作ります (例: BRK-080 = 幅 80 / 板厚 10、BRK-120 = 幅 120 / 板厚 12)。", tab: "manage", ui: "family", check: (s) => (s.part.family?.rows.length ?? 0) >= 2 },
          { text: "2 つ目の行を<b>適用</b>して、モデルがそのサイズに変わることを確認します。レッスン完了です。", tab: "manage", ui: "family", check: (s) => (s.part.family?.active ?? 0) >= 1 },
        ],
        summary: ["ファミリー表 = パラメータ (列) × 構成 (行)", "行を選ぶだけでサイズ違いのモデルに", "シリーズ部品・標準部品の管理に使う"],
        quiz: [
          { q: "ファミリー表の列と行の関係は?", choices: ["列 = 構成、行 = パラメータ", "列 = パラメータ、行 = 構成 (品番)", "どちらもパラメータ"], answer: 1, explain: "列にパラメータ、行にサイズ違いの構成を並べます。" },
          { q: "ファミリー表に向いているのは?", choices: ["形が全く違う部品", "同じ形でサイズだけ違うシリーズ部品", "アセンブリの拘束"], answer: 1, explain: "形が同じでサイズが違う部品をまとめて管理するのに向いています。" },
        ],
        see: ["3d-automation", "standardization"],
      },
      {
        id: "9-2",
        title: "【上級】ルール — 条件で設計を自動調整",
        minutes: 12,
        level: 3,
        goals: ["パラメータ名を使ったルールを書ける", "条件によって寸法を自動で変えられる"],
        theory: `
<p><b>ルール</b>は、パラメータの値に応じて他の寸法・抑制・材料を自動で決める仕組みです (iLogic 相当)。例:</p>
<pre>if (幅 > 100) 板厚 = 12;
else 板厚 = 10;</pre>
<p>「幅が大きいときは板を厚くする」といった<b>設計ルール (ノウハウ)</b> をモデルに組み込めるので、誰が変更しても同じ判断になります。</p>`,
        setup: { kind: "part", make: sampleDocument },
        steps: [
          { text: "<b>管理</b>タブの <b>ルール</b> を開き、新しいルールを作ります。本文に <code>if (幅 &gt; 100) 板厚 = 12; else 板厚 = 10;</code> と入力して保存します。", tab: "manage", ui: "rules", check: (s) => (s.part.rules?.length ?? 0) >= 1 },
          { text: "<b>パラメータ</b>表で <b>幅</b> を <code>120</code> にします。ルールが動いて<b>板厚</b>が 12 になることを確認します。", tab: "model", ui: "params", check: (s) => near(s.values.get("幅"), 120) && near(s.values.get("板厚"), 12), hint: "ルールの実行タイミングが「パラメータ変更時」になっているか確認します。手動実行は「ルールを実行」。" },
          { text: "幅を <code>80</code> に戻すと、板厚が 10 に戻ります。レッスン完了です。", tab: "model", ui: "params", check: (s) => near(s.values.get("幅"), 80) && near(s.values.get("板厚"), 10) },
        ],
        summary: ["ルールで設計ノウハウ (条件分岐) をモデルに組み込む", "パラメータ名をそのまま変数として書ける", "誰が変更しても同じ判断になる"],
        quiz: [
          { q: "ルールの用途として適切なのは?", choices: ["画面の色を変える", "幅が大きいとき板厚を厚くするなどの設計判断を自動化する", "ファイルを圧縮する"], answer: 1, explain: "条件に応じた寸法・抑制・材料の自動調整に使います。" },
          { q: "ルールを使う利点は?", choices: ["設計判断が人によってばらつかない", "解析が速くなる", "図面が不要になる"], answer: 0, explain: "判断基準がモデルに組み込まれるので、変更時の判断が統一されます。" },
        ],
        see: ["3d-automation", "design-docs"],
      },
      {
        id: "9-3",
        title: "【上級】改訂管理 — 版を記録して変更を追う",
        minutes: 10,
        level: 3,
        goals: ["版 (A, B …) を記録できる", "版ごとの変更点を確認できる"],
        theory: `
<p>出図した後の設計変更は、<b>版 (改訂記号)</b> を上げて記録します。いつ・何を・なぜ変えたかを残すことで、製造・調達との食い違いを防ぎます。</p>
<p>3DCAD Studio の<b>改訂履歴</b>は、版ごとにモデルの定義を保存し、寸法変更・フィーチャの追加削除などの<b>変更点を自動で一覧</b>にします。図面の表題欄と改訂表にも反映されます。</p>`,
        setup: { kind: "part", make: sampleDocument },
        steps: [
          { text: "<b>管理</b>タブの <b>改訂履歴</b> を開き、現在の状態を版 <b>A</b> (初版) として記録します。", tab: "manage", ui: "revisions", check: (s) => (s.part.revisions?.length ?? 0) >= 1 },
          { text: "<b>パラメータ</b>表で <b>ボス径</b> を <code>34</code> に変更します (設計変更)。", tab: "model", ui: "params", check: (s) => near(s.values.get("ボス径"), 34) },
          { text: "改訂履歴を開き、未記録の変更点に「ボス径 30 → 34」が出ていることを確認して、版 <b>B</b> として記録します。レッスン完了です。", tab: "manage", ui: "revisions", check: (s) => (s.part.revisions?.length ?? 0) >= 2 },
        ],
        summary: ["出図後の変更は版を上げて記録", "変更点 (何を・なぜ) を残す", "版は図面の表題欄・改訂表に反映"],
        quiz: [
          { q: "版を記録する主な目的は?", choices: ["ファイルを小さくする", "どの図面・モデルで作られたかを追跡し、食い違いを防ぐ", "描画を速くする"], answer: 1, explain: "製造・調達が正しい版を使えるよう、変更の履歴を残します。" },
          { q: "改訂記号に I や O を使わないことが多い理由は?", choices: ["数字の 1・0 と紛らわしいから", "規格で禁止されているから必ず", "発音しにくいから"], answer: 0, explain: "I・O は 1・0 と見間違えやすいため、避ける慣習があります。" },
        ],
        see: ["2d-management", "3d-data-management"],
      },
      {
        id: "9-4",
        title: "【上級】コイル — ばね・らせん形状",
        minutes: 12,
        level: 3,
        goals: ["軸とプロファイルからコイル (らせん) を作れる", "ピッチ・巻数の意味がわかる"],
        theory: `
<p><b>コイル</b>は、プロファイルを軸のまわりにらせん状に動かして、ばね・ねじ山・らせんの溝を作るフィーチャです。</p>
<ul>
  <li><b>ピッチ</b>: 1 回転で進む距離。<b>巻数</b> × ピッチ = 全長</li>
  <li>プロファイル (線の断面) は軸から離れた位置に描く。軸からの距離がコイルの半径</li>
  <li>軸はコンストラクション線・作業軸・原点の軸を使う</li>
</ul>`,
        setup: { kind: "newPart" },
        steps: [
          { text: "<b>2D スケッチ</b> を <b>XY 平面</b> に開始し、原点を通る縦の線を引いて <b>コンストラクション</b> にします (コイルの軸)。", tab: "model", ui: ["sketch", "sk-line", "sk-construction"], check: (s) => count(editing(s), "line", true) >= 1 },
          { text: "軸から右へ 15 mm の位置に直径 <code>3</code> の<b>円</b>を描き (ばねの線径)、<b>スケッチを終了</b> します。", tab: "sketch", ui: ["sk-circle", "sk-finish"], check: (s) => s.mode === "model" && sketches(s).some((k) => count(k, "circle") >= 1) },
          { text: "<b>コイル</b> を押し、プロファイルに円、軸にコンストラクション線を選び、ピッチ <code>8</code>・巻数 <code>6</code> 程度で OK。", tab: "model", ui: "coil", check: (s) => has(s, "coil") && s.bodies > 0, hint: "軸が自動で選ばれない場合は、パネルで軸を指定します。" },
          { text: "<b>iProperties</b> で質量を確認し、ピッチや巻数を変えてみましょう。レッスン完了です。", tab: "inspect", ui: "iprops" },
        ],
        summary: ["コイル = プロファイルを軸まわりにらせん状に動かす", "全長 = ピッチ × 巻数", "ばね・ねじ・らせん溝に使う"],
        quiz: [
          { q: "ピッチ 8 mm で 6 巻きのコイルの全長 (中心線) は?", choices: ["14 mm", "48 mm", "8 mm"], answer: 1, explain: "8 × 6 = 48 mm です。" },
          { q: "コイルばねの平均径を決めるのは?", choices: ["プロファイルの円の直径", "軸からプロファイル中心までの距離の 2 倍", "ピッチ"], answer: 1, explain: "軸からの距離が半径なので、その 2 倍が平均径です。線径はプロファイルの円の直径です。" },
        ],
        see: ["springs", "3d-feature-choice"],
      },
      {
        id: "9-5",
        title: "【上級】トポロジー最適化 — 軽くて強い形を探す",
        minutes: 15,
        level: 3,
        goals: ["固定・荷重・残す体積から最適な形を計算できる", "結果を設計に生かす考え方がわかる"],
        theory: `
<p><b>トポロジー最適化</b>は、固定と荷重を与え、「材料を何 % 残すか」を指定すると、最も剛性の高い材料の配置を計算します。
結果はそのまま部品にするのではなく、<b>形のアイデア</b>として、作れる形 (リブ・肉抜き) に描き直すのが一般的です。</p>`,
        setup: { kind: "part", make: sampleDocument },
        steps: [
          { text: "<b>検査</b>タブの <b>応力解析</b> を開きます。", tab: "inspect", ui: "stress", check: (s) => s.command === "stress" },
          { text: "解析の種類を <b>トポロジー最適化</b> にし、固定 (底面)・荷重 (ボスの上面)・残す体積 (例 40 %) を指定して実行します。", tab: "inspect", ui: "stress", check: (s) => s.analysisDone, hint: "計算には少し時間がかかります。" },
          { text: "残った材料の形 (力の流れ) を観察し、リブや肉抜きの位置を考えます。パネルを閉じてレッスン完了です。", check: (s) => s.command === null },
        ],
        summary: ["固定・荷重・残す体積から最適な材料配置を計算", "結果は形のアイデア — 作れる形に描き直す", "力の流れを見る道具として使う"],
        quiz: [
          { q: "トポロジー最適化の結果の使い方として適切なのは?", choices: ["そのまま量産図面にする", "力の流れを参考に、作れる形に描き直す", "使わない"], answer: 1, explain: "結果は加工しにくい形が多いので、リブ・肉抜きなど作れる形に置き換えます。" },
          { q: "トポロジー最適化で指定するものは?", choices: ["色と質感", "固定・荷重・残す体積の割合", "図面の尺度"], answer: 1, explain: "境界条件と体積の制約から材料配置を求めます。" },
        ],
        see: ["fea-practice", "3d-mbd"],
      },
      {
        id: "9-6",
        title: "【上級】CAM — 工具経路と G コード",
        minutes: 12,
        level: 3,
        goals: ["スケッチのプロファイルから工具経路を作れる", "加工時間の目安と G コードの役割がわかる"],
        theory: `
<p><b>CAM</b> は、形状データから工作機械の動き (<b>工具経路</b>) を作り、<b>G コード</b> (NC プログラム) にします。</p>
<ul>
  <li><b>ポケット</b>: 内側をくり抜く、<b>輪郭</b>: 外形・内形をなぞる、<b>穴あけ</b>: ドリルで穴</li>
  <li>工具径・切込み・送り速度・回転数を決める</li>
  <li>内角は工具半径以上の R が残る (設計で R を指示しておく)</li>
</ul>
<p class="ln-note">練習用の取付プレート (穴付き) を使います。</p>`,
        setup: { kind: "part", make: plateStarter },
        steps: [
          { text: "<b>検査</b>タブの <b>CAM</b> を開きます。", tab: "inspect", ui: "cam", check: (s) => s.command === "cam" },
          { text: "加工方法 (輪郭・ポケット・穴あけ) と工具を選び、工具経路を作成して 3D で確認します (青: 切削、赤破線: 早送り)。加工時間の目安も見てみましょう。" },
          { text: "G コード (.nc) の書き出しを確認し、パネルを閉じます。レッスン完了です。", check: (s) => s.command === null },
        ],
        summary: ["CAM = 形状 → 工具経路 → G コード", "工具径で内角の R が決まる", "加工時間を見て形状・公差を見直す"],
        quiz: [
          { q: "G コードとは?", choices: ["3D プリンタ専用の画像形式", "工作機械の動きを指示する NC プログラム", "図面の寸法記号"], answer: 1, explain: "G コードは工具の移動・送り・回転などを指示する NC プログラムです。" },
          { q: "φ10 のエンドミルでポケットを加工すると、内角に残る R の最小値は?", choices: ["R2", "R5", "R10"], answer: 1, explain: "工具半径 5 mm の R が残ります。" },
        ],
        see: ["dfm-machining", "3d-mbd"],
      },
    ],
  },
];

// ---------------------------------------------------------- exercises ---

const anyHoles = (s: LearnState) => has(s, "hole") || has<ExtrudeFeature>(s, "extrude", (f) => f.op === "cut");
const healthy = (s: LearnState) => s.bodies === 1 && s.errors === 0;

export const EXERCISES: Exercise[] = [
  {
    id: "ex-2d",
    title: "演習 0: 2D 作図 — 取付プレートの外形",
    level: 1,
    brief: "3D に進む前の 2D 作図の総仕上げです。長穴付きの取付プレートの形を、1 つのスケッチで完全に描きます。",
    spec: [
      ["外形", "120 × 60 の長方形、四隅は R10 の円弧 (円を描いてトリム)"],
      ["穴", "中央に φ20、左右に 長さ 20 × 幅 9 の長円 (長穴) 2 個 (左右対称)"],
      ["拘束", "中心線を補助線で引き、対称・等値拘束を使う"],
      ["出力", "DXF に書き出す"],
    ],
    requirements: [
      { text: "スケッチに円弧 (トリムまたは長円) がある", check: (s) => sketches(s).some((k) => count(k, "arc") >= 2) },
      { text: "円が 1 つ以上ある", check: (s) => sketches(s).some((k) => count(k, "circle") >= 1) },
      { text: "補助線 (コンストラクション) を使っている", check: (s) => sketches(s).some((k) => count(k, "line", true) >= 1) },
      { text: "対称または等値拘束を使っている", check: (s) => sketches(s).some((k) => constraintCount(k, "symmetric") + constraintCount(k, "equal") >= 1) },
      { text: "寸法が 6 個以上ある", check: (s) => sketches(s).some((k) => k.dimensions.length >= 6) },
    ],
    tips: ["中心線 (縦・横) を補助線で先に引くと、対称拘束が使いやすくなります", "角の R は、角に円を置いて線と円をトリムするか、長方形の角を残したまま 3D のフィレットで丸める方法もあります", "完全拘束になったか、スケッチを開いてステータスバーで確認しましょう"],
  },
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
  },  {
    id: "ex-panel",
    title: "演習 7: 操作パネル (人間工学・UX)",
    level: 2,
    brief: "卓上機械の操作パネルを設計します。押しボタンの大きさ・間隔、表示の文字、誤操作防止を考えましょう。",
    spec: [
      ["外形", "150 × 90、厚さ 3 の板 (樹脂または板金)"],
      ["ボタン穴", "φ16 程度を 3 個以上、中心間隔 25 以上"],
      ["表示", "各ボタンの機能名を文字 (刻印 / エンボス) で入れる"],
      ["非常停止", "他より大きい穴 (φ22 程度) を離れた位置に 1 個"],
    ],
    requirements: [
      { text: "板の外形がある (押し出しまたは板金)", check: (s) => has<ExtrudeFeature>(s, "extrude", (f) => f.op !== "cut") || has(s, "sheetFace") },
      { text: "ボタン用の穴が 3 個以上 (パターンまたは複数の穴)", check: (s) => has(s, "rectPattern") || has(s, "circPattern") || features<HoleFeature>(s, "hole").length >= 3 || features<ExtrudeFeature>(s, "extrude", (f) => f.op === "cut").length >= 2 },
      { text: "文字 (刻印 / エンボス) で表示を入れている", check: (s) => has(s, "emboss") },
      { text: "角を丸めている (フィレット)", check: (s) => has(s, "fillet") },
      { text: "ソリッドが 1 つで、エラーのフィーチャがない", check: healthy },
    ],
    tips: ["座学テキスト「人間工学・UX」の「操作具の設計」「表示とサインの見やすさ」を先に読みましょう", "機能ごとにボタンをまとめ、使う順に左から右へ並べます", "文字の高さは見る距離から計算ツールで決めましょう"],
  },
  {
    id: "ex-service",
    title: "演習 8: 保守しやすい電装ボックス (配線・メンテナンス)",
    level: 3,
    brief: "機械の横に付ける電装ボックスを、配線のしやすさと保守性を考えて設計します。",
    spec: [
      ["本体", "板金の箱 200 × 150 × 80、板厚 1.2"],
      ["ふた", "工具なし (または 1 本のねじ) で開けられる構造"],
      ["配線口", "底面にケーブルグランド用の穴 (φ20 程度) を複数"],
      ["その他", "放熱用のスリット、内部の取付穴"],
    ],
    requirements: [
      { text: "板金の面がある", check: (s) => has(s, "sheetFace") },
      { text: "フランジが 3 辺以上ある", check: (s) => features<FlangeFeature>(s, "flange").reduce((n, f) => n + f.edges.length, 0) >= 3 },
      { text: "配線・取付用の穴がある", check: anyHoles },
      { text: "穴・スリットをパターンで並べている", check: (s) => has(s, "rectPattern") || has(s, "circPattern") || has(s, "mirror") },
      { text: "ソリッドが 1 つで、エラーのフィーチャがない", check: healthy },
    ],
    tips: ["座学テキスト「配線・メンテナンスを考えた設計」を先に読みましょう", "配線口は下向きにすると水が入りにくくなります", "ふたを外したときに手と工具が入るすき間を、アセンブリで確認しましょう"],
  },
  {
    id: "ex-sheet",
    title: "演習 4: 板金の電装カバー",
    level: 2,
    brief: "制御基板を覆う板金カバーを設計します。曲げの制約と放熱を考えましょう。",
    spec: [
      ["外形", "幅 120 × 奥行 80 × 高さ 30 程度のコの字 / 箱形"],
      ["板厚", "1.2〜1.6 (SPCC または A5052)"],
      ["穴", "取付穴 4 か所、放熱用の穴またはスリット"],
      ["注意", "穴は曲げ線から 板厚×2 + R 以上離す"],
    ],
    requirements: [
      { text: "板金の面がある", check: (s) => has(s, "sheetFace") },
      { text: "フランジが 2 辺以上ある", check: (s) => features<FlangeFeature>(s, "flange").reduce((n, f) => n + f.edges.length, 0) >= 2 },
      { text: "穴 (切り取り・穴フィーチャ) がある", check: anyHoles },
      { text: "穴をパターンで並べている", check: (s) => has(s, "rectPattern") || has(s, "circPattern") || has(s, "mirror") },
      { text: "ソリッドが 1 つで、エラーのフィーチャがない", check: healthy },
    ],
    tips: ["面 → フランジ (2〜4 辺) → 押し出し (切り取り・貫通) で穴を作ります", "放熱スリットは長円 (スロット) を 1 つ作って矩形状パターンで並べると速いです", "板金タブの「展開パターン」で、穴が曲げ線に近すぎないか確認しましょう"],
  },
  {
    id: "ex-duct",
    title: "演習 5: 吸気ダクト",
    level: 2,
    brief: "四角い吸込口から丸い出口へ変わる、樹脂成形の吸気ダクトを設計します。",
    spec: [
      ["吸込口", "80 × 50 の長方形 (角 R5)"],
      ["出口", "φ40、吸込口から高さ 60"],
      ["肉厚", "2 (樹脂成形品として均一に)"],
      ["取付", "吸込口の周りにフランジ (つば) と取付穴"],
    ],
    requirements: [
      { text: "作業平面を使っている", check: (s) => has(s, "workplane") },
      { text: "ロフトで断面をつないでいる", check: (s) => has(s, "loft") },
      { text: "シェルで一定の肉厚にしている", check: (s) => has(s, "shell") },
      { text: "穴がある", check: anyHoles },
      { text: "ソリッドが 1 つで、エラーのフィーチャがない", check: healthy },
    ],
    tips: ["フランジ (つば) は吸込口の平面に押し出し (接合) で付けます", "シェルは上下の開口面を取り除きます。ロフトの後、フランジの前に行うと簡単です", "座学テキスト「樹脂成形品の設計」で肉厚・抜き勾配を確認しましょう"],
  },
  {
    id: "ex-linkage",
    title: "演習 6: てこクランク機構の組立",
    level: 3,
    brief: "モーターの回転をワイパーのような揺動に変える四節リンク機構を、アセンブリで組み立てて動かします。",
    spec: [
      ["リンク長さ", "クランク 20、連結 70、てこ 50、固定 60 (グラスホフの条件を満たす)"],
      ["リンク", "厚さ 5 の板、両端に φ6 の穴、端は R (半円)"],
      ["組立", "穴どうしを挿入 / 軸合わせ拘束でつなぎ、ベースを接地"],
      ["確認", "拘束を駆動してクランクを回し、干渉がないことを確認"],
    ],
    requirements: [
      { text: "アセンブリに 4 個以上のコンポーネントがある", check: (s) => s.asm.components.length >= 4 },
      { text: "挿入または軸合わせの拘束が 4 個以上ある", check: (s) => s.asm.constraints.filter((c) => !c.suppressed && (c.type === "insert" || c.type === "axis")).length >= 4 },
      { text: "角度拘束がある (駆動用)", check: (s) => s.asm.constraints.some((c) => !c.suppressed && c.type === "angle") },
    ],
    tips: ["リンク 1 本をパラメトリックに作り (長さをユーザ パラメータに)、長さ違いをファミリー表で作ると効率的です", "座学テキスト「機構 — リンクとカム」の計算ツールで、動きを先に確認しましょう", "クランクとベースの間に角度拘束を付け、「拘束を駆動」で 0〜360° 回します"],
  },
  {
    id: "ex-drawing",
    title: "演習 9: 製図 — ブラケットの部品図を仕上げる",
    level: 2,
    brief: "サンプルのブラケット (ファイル → サンプルを開く) の部品図を、加工者がそのまま作れるレベルまで仕上げます。「今のモデルでチェック」で図面の要件を確認します。",
    spec: [
      ["投影", "第三角法で正面図・平面図・側面図 + 断面図 1 つ以上"],
      ["寸法", "外形・穴位置・穴径。ボスの穴にはめあい (H7 など)、機能寸法に ± 公差"],
      ["幾何公差", "取付面をデータム A とし、平行度または直角度を 1 つ以上"],
      ["仕上げ", "取付面に表面性状 (Ra)、普通公差を表題欄に"],
      ["表題欄", "名称・図番・材料・設計者を記入"],
    ],
    requirements: [
      { text: "投影ビューが 3 つ以上ある", check: (s) => views(s).filter((v) => v.kind !== "detail").length >= 3 },
      { text: "断面図がある", check: (s) => views(s, "section").length >= 1 || views(s).some((v) => !!v.breakout) },
      { text: "寸法が 8 個以上ある", check: (s) => dims(s).length + annos(s, "ordinate").length * 3 >= 8 },
      { text: "はめあい公差の寸法がある", check: (s) => tolDims(s, "fit").length >= 1 },
      { text: "± または上下の許容差付きの寸法がある", check: (s) => tolDims(s, "sym").length + tolDims(s, "dev").length >= 1 },
      { text: "データムと幾何公差がある", check: (s) => annos(s, "datum").length >= 1 && annos(s, "gdt").length >= 1 },
      { text: "表面性状の指示がある", check: (s) => annos(s, "surface").length >= 1 },
      { text: "表題欄 (名称・図番・材料・設計者・普通公差) が記入されている", check: (s) => { const t = drawing(s)?.title; return !!t && [t.title, t.number, t.material, t.designer, t.generalTol].every((x) => !!x?.trim()); } },
    ],
    tips: ["まず自動寸法で骨組みを入れ、不要な寸法を消してから機能寸法に公差を付けると早く仕上がります", "データムは相手部品と接する取付面に置くのが基本です", "第 6 章 (続) のレッスン 6-2〜6-6 で各道具の使い方を復習できます"],
  },
  {
    id: "ex-asmdrawing",
    title: "演習 10: 製図 — 組立図と部品図のセット",
    level: 2,
    brief: "アセンブリ (演習 3 の小物ケースや、レッスン 5-1 のピン組立など) の図面一式を仕上げます。アセンブリを開いた状態で「今のモデルでチェック」を押します。",
    spec: [
      ["組立図", "正面・側面などの投影ビュー + 部品表 + 風船"],
      ["部品図", "図面セットで部品ごとのシートを作り、それぞれに寸法"],
      ["表題欄", "名称・図番・設計者・日付"],
    ],
    requirements: [
      { text: "アセンブリの図面である", check: (s) => s.drawingSource === "assembly" || (!!s.asm.drawing && !s.part.drawing) },
      { text: "部品表を表示している", check: (s) => (drawing(s)?.sheets ?? []).some((sh) => !!sh.partsList) },
      { text: "風船が部品数以上ある", check: (s) => annos(s, "balloon").length >= 2 },
      { text: "シートが 2 枚以上 (組立図 + 部品図)", check: (s) => (drawing(s)?.sheets.length ?? 0) >= 2 },
      { text: "寸法が 6 個以上ある", check: (s) => dims(s).length >= 6 },
      { text: "表題欄 (名称・図番・設計者・日付) が記入されている", check: (s) => { const t = drawing(s)?.title; return !!t && [t.title, t.number, t.designer, t.date].every((x) => !!x?.trim()); } },
    ],
    tips: ["「図面セット」で部品図を一括作成すると、各シートに寸法も自動で入ります", "組立図の寸法は外形・取付寸法など組立に必要なものだけにします", "レッスン 6-7 で手順を復習できます"],
  },
  {
    id: "ex-plate-drawing",
    title: "演習 11: 製図 — 穴の多いプレートの NC 加工用図面",
    level: 2,
    brief: "穴の多い取付プレートを設計し、NC 加工に渡す図面を作ります。穴位置は 1 つの原点からの座標で指示します。",
    spec: [
      ["形状", "100 × 80 程度の板、板厚 6〜10、穴 6 個以上 (2 種類以上の径)"],
      ["寸法", "座標寸法 または 穴テーブル で穴位置を指示"],
      ["公差", "位置決め穴 1 つにはめあい (H7)"],
      ["幾何公差", "データム A (取付面) と位置度または平行度"],
      ["表題欄", "名称・図番・材料・普通公差"],
    ],
    requirements: [
      { text: "穴フィーチャが 2 つ以上ある", check: (s) => features(s, "hole").length >= 2 },
      { text: "図面に座標寸法または穴テーブルがある", check: (s) => annos(s, "ordinate").length + annos(s, "holetable").length >= 1 },
      { text: "はめあい公差の寸法がある", check: (s) => tolDims(s, "fit").length >= 1 },
      { text: "データムと幾何公差がある", check: (s) => annos(s, "datum").length >= 1 && annos(s, "gdt").length >= 1 },
      { text: "表題欄 (名称・図番・材料・普通公差) が記入されている", check: (s) => { const t = drawing(s)?.title; return !!t && [t.title, t.number, t.material, t.generalTol].every((x) => !!x?.trim()); } },
    ],
    tips: ["穴は矩形状パターンで並べると、変更にも強くなります", "原点は加工の基準になる角に置きます", "レッスン 6-3・6-4・6-6 を復習しましょう"],
  },
];

/** Every lesson in curriculum order. */
CURRICULUM.push(...CURRICULUM2, ...CURRICULUM3, ...CURRICULUM4);
EXERCISES.push(...EXERCISES2);

export const ALL_LESSONS = CURRICULUM.flatMap((c) => c.lessons);

export function findLesson(id: string) {
  return ALL_LESSONS.find((l) => l.id === id);
}
