// 総合コース: 機械設計総合コース (ブラケット → 軸受ハウジング → 組立 → 組立図)、
// 製図総合演習 (部品図を 1 枚完成させる)、解析総合演習 (静解析・収束・固有値・座屈で安全を判定)。
// 各ステップの check は LearnState の純関数です。
import type { ChamferFeature, ExtrudeFeature, FilletFeature, HoleFeature, RevolveFeature } from "../core/types";
import type { AssemblyDocument } from "../assembly/types";
import { sampleDocument, samplePin } from "../samples";
import { annos, count, dims, drawing, editing, has, near, sketches, tolDims, userParams, usesUserParam, views } from "./checks";
import type { Chapter, LearnState } from "./types";

// ---------------------------------------------------------------- starters ---

/** Bearing bracket used by the analysis lessons (the sample bracket, aluminium, 1 000 N on the boss). */
export function analysisBracketStarter() {
  const doc = sampleDocument();
  doc.name = "軸受ブラケット (解析用)";
  doc.iprops["パーツ番号"] = "MU-201";
  doc.iprops["説明"] = "機械ユニット 軸受ブラケット";
  return doc;
}

/** Part to be drawn in the drafting exercise (the sample bracket, renamed). */
export function drawingBracketStarter() {
  const doc = sampleDocument();
  doc.name = "ブラケット (製図演習)";
  doc.iprops["パーツ番号"] = "DT-101";
  doc.iprops["説明"] = "製図総合演習 ブラケット";
  return doc;
}

/** Machine unit: grounded bracket and a loose shaft, no constraints. */
export function machineAssemblyStarter(): AssemblyDocument {
  const bracket = sampleDocument();
  bracket.name = "軸受ブラケット";
  bracket.iprops["パーツ番号"] = "MU-101";
  bracket.iprops["説明"] = "機械ユニット 軸受ブラケット";
  const shaft = samplePin();
  shaft.name = "段付き軸";
  shaft.iprops["パーツ番号"] = "MU-102";
  shaft.iprops["説明"] = "機械ユニット 段付き軸";
  const I = (x: number, y: number, z: number) => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1];
  return {
    format: "3dcad-assembly",
    version: 1,
    name: "機械ユニット",
    parts: [
      { id: "p-bracket", name: bracket.name, kind: "part", doc: bracket },
      { id: "p-shaft", name: shaft.name, kind: "part", doc: shaft },
    ],
    components: [
      { id: "c1", name: "軸受ブラケット:1", partId: "p-bracket", matrix: I(0, 0, 0), grounded: true },
      { id: "c2", name: "段付き軸:1", partId: "p-shaft", matrix: I(90, 50, 0), grounded: false },
    ],
    constraints: [],
    params: [],
    iprops: { パーツ番号: "MU-100", 説明: "機械ユニット", 設計者: "", 作成日: new Date().toISOString().slice(0, 10) },
  };
}

// ------------------------------------------------------------------ helpers ---

const inSketch = (s: LearnState) => !!editing(s);
const hasUser = (s: LearnState, name: string) => userParams(s).some((p) => p.name === name);
const paramExprHas = (s: LearnState, param: string | undefined, re: RegExp) => !!param && s.part.params.some((p) => p.name === param && re.test(p.expr));
const activeAsm = (s: LearnState, type: string) => s.asm.constraints.some((c) => c.type === type && !c.suppressed);
const titleFilled = (s: LearnState) => {
  const t = drawing(s)?.title;
  return !!t && [t.title, t.number, t.material, t.designer].every((x) => !!x?.trim());
};
const staticDone = (s: LearnState) => s.command === "stress" && s.analysisKind === "static" && s.analysisDone;

// --------------------------------------------------------------- curriculum ---

export const CURRICULUM3: Chapter[] = [
  // ------------------------------------------------------ project-machine ---
  {
    id: "project-machine",
    capstone: true,
    title: "総合コース: 機械設計 — ブラケットから組立図まで",
    desc: "回転軸を支える小さな機械ユニットを題材に、ブラケットの設計 → 軸受ハウジング → 組立と動作確認 → 組立図・部品表まで、機械設計の一連の流れを 4 レッスンで通して練習します。",
    lessons: [
      {
        id: "MD-1",
        title: "ブラケットを設計する — 仕様からパラメトリック部品へ",
        minutes: 20,
        level: 2,
        goals: ["仕様の主要寸法をユーザ パラメータにできる", "押し出し・穴・フィレットで取付ブラケットを作れる", "材料を決めて質量を確かめられる"],
        theory: `
<p>軸を支える<b>取付ブラケット</b>を設計します。仕様は次のとおりです。</p>
<table class="ln-table">
  <tr><th>項目</th><th>仕様</th></tr>
  <tr><td>ベース</td><td>幅 100 × 奥行 60 × 板厚 12</td></tr>
  <tr><td>取付</td><td>M8 ボルト用キリ穴 Ø9 × 4 (縁から 12)</td></tr>
  <tr><td>入隅</td><td>応力集中を避けるため R3 以上</td></tr>
  <tr><td>材料</td><td>鋼 (SS400 相当)</td></tr>
</table>
<p>寸法はまず<b>ユーザ パラメータ</b>に書き出し、スケッチや押し出しの値をその式で決めます。後で仕様が変わっても、パラメータを直すだけで形が追従します。</p>
<p class="ln-note">取付穴は 1 つ作ってパターンで並べると、穴径の変更が 1 か所で済みます。</p>`,
        setup: { kind: "newPart" },
        steps: [
          { text: "<b>パラメータ</b> (fx) で、ユーザ パラメータ <code>幅</code> = <code>100</code>、<code>奥行</code> = <code>60</code>、<code>板厚</code> = <code>12</code> を作ります。", tab: "model", ui: "params", check: (s) => ["幅", "奥行", "板厚"].every((n) => hasUser(s, n)) },
          { text: "<b>XZ 平面</b>に<b>長方形</b>を描き、寸法の値を <code>幅</code> と <code>奥行</code> にしてスケッチを終了します。", tab: "model", ui: ["sketch", "sk-rect", "sk-dimension", "sk-finish"], check: (s) => s.mode === "model" && usesUserParam(s) && sketches(s).some((k) => count(k, "line") >= 4), hint: "寸法の値の欄にパラメータ名を入力すると式になります。" },
          { text: "<b>押し出し</b>で、距離に <code>板厚</code> と入力して OK。", tab: "model", ui: "extrude", check: (s) => has<ExtrudeFeature>(s, "extrude", (f) => f.op !== "cut" && paramExprHas(s, f.distance, /板厚/)) },
          { text: "<b>穴</b> で上面の角の近くに Ø<code>9</code> の貫通穴を 1 つあけます。", tab: "model", ui: "hole", check: (s) => has<HoleFeature>(s, "hole") },
          { text: "<b>矩形状</b>パターン (2 × 2) または <b>ミラー</b> で、穴を 4 隅にそろえます。", tab: "model", ui: ["rectPattern", "mirror"], check: (s) => has(s, "rectPattern") || has(s, "mirror") },
          { text: "<b>フィレット</b> で外形の縦の角 4 か所に R<code>5</code> を付けます (手が切れない・応力集中を下げる)。", tab: "model", ui: "fillet", check: (s) => has<FilletFeature>(s, "fillet") },
          { text: "画面左上の<b>材料</b>で <b>鋼</b> を選び、<b>検査</b>タブの <b>iProperties</b> で質量を確認します。レッスン完了です。", ui: [".qat-field", "iprops"], check: (s) => s.part.material.name === "鋼", hint: "100 × 60 × 12 の鋼板なら約 0.56 kg (穴を引くと少し軽くなる) が目安です。" },
        ],
        summary: ["仕様の主要寸法はユーザ パラメータに集める", "穴は 1 つ作ってパターンで並べる", "角と入隅には R — 安全と強度のため", "材料を決めて質量を確認する"],
        quiz: [
          { q: "100 × 60 × 12 mm の鋼板 (密度 7.85 g/cm³) の質量はおよそ?", choices: ["約 0.57 kg", "約 5.7 kg", "約 57 g"], answer: 0, explain: "体積 72 000 mm³ = 72 cm³、72 × 7.85 ≒ 565 g です。" },
          { q: "入隅に R を付ける主な理由は?", choices: ["応力集中を下げる", "質量を増やす", "図面を簡単にする"], answer: 0, explain: "鋭い入隅は応力が集中し、疲労き裂の起点になります。" },
        ],
        see: ["3d-robust", "fastening", "materials"],
      },
      {
        id: "MD-2",
        title: "軸受ハウジング — 回転体とボルト穴の円形配置",
        minutes: 20,
        level: 2,
        goals: ["半断面の回転で中空のハウジングを作れる", "フランジのボルト穴を円形状パターンで配置できる", "はめあい部に面取りを付けられる"],
        theory: `
<p>軸受 (例 6201: 内径 12・外径 32・幅 10) を収める<b>軸受ハウジング</b>を作ります。回転体なので、<b>半断面をスケッチして回転</b>します。</p>
<ul>
  <li>軸受の入る穴: Ø32 (はめあいは H7 などを図面で指示)</li>
  <li>フランジ: Ø70 × 厚さ 8、ボルト穴 Ø6.6 を <b>PCD 54 上に 4 等配</b></li>
  <li>入口の角: 軸受を入れやすいよう C0.5 の面取り</li>
</ul>
<p class="ln-note">回転軸から離れた位置に断面を描くと、中空 (穴のあいた) 回転体になります。</p>`,
        setup: { kind: "newPart" },
        steps: [
          { text: "<b>2D スケッチ</b>を <b>XY 平面</b>に開始します。", tab: "model", ui: "sketch", check: inSketch },
          { text: "<b>線分</b>で、Y 軸から 16 (軸受外径の半分) 離れた位置に、フランジ付きの L 字形の半断面を閉じた形で描きます (6 本以上の線)。", tab: "sketch", ui: "sk-line", check: (s) => count(editing(s), "line") >= 6, hint: "内側の縦線が軸受の穴の面、外側の段がフランジになります。" },
          { text: "<b>寸法</b>で穴の半径 16・フランジ半径 35・高さなどを決めて、<b>スケッチを終了</b>します。", tab: "sketch", ui: ["sk-dimension", "sk-finish"], check: (s) => s.mode === "model" && sketches(s).some((k) => count(k, "line") >= 6) },
          { text: "<b>回転</b>で断面を選び、軸に <b>Y 軸</b> を選んで 360° 回転します。中空のハウジングができます。", tab: "model", ui: "revolve", check: (s) => has<RevolveFeature>(s, "revolve") },
          { text: "<b>穴</b> でフランジ上面に Ø<code>6.6</code> の貫通穴を 1 つあけます (中心から 27 の位置)。", tab: "model", ui: "hole", check: (s) => has<HoleFeature>(s, "hole") },
          { text: "<b>円形状</b>パターンで穴を Y 軸まわりに <code>4</code> 個並べます。", tab: "model", ui: "circPattern", check: (s) => has(s, "circPattern") },
          { text: "<b>面取り</b>で軸受の入口のエッジに C<code>0.5</code> を付け、材料を <b>鋼</b> にします。レッスン完了です。", tab: "model", ui: ["chamfer", ".qat-field"], check: (s) => has<ChamferFeature>(s, "chamfer") && s.part.material.name === "鋼" },
        ],
        summary: ["回転体は半断面 + 回転、軸から離せば中空になる", "フランジのボルト穴は PCD 上に円形状パターン", "はめあい部の入口には面取り"],
        quiz: [
          { q: "PCD 54 上に 4 等配した穴の、隣り合う穴の中心間距離は?", choices: ["約 38.2 mm", "54 mm", "27 mm"], answer: 0, explain: "54 × sin 45° ≒ 38.2 mm です。" },
          { q: "軸受を圧入する穴の入口に面取りを付ける理由は?", choices: ["軸受を傷つけずに案内するため", "見た目のため", "質量を減らすため"], answer: 0, explain: "角があると軸受の外輪が引っかかり、斜めに入ったり傷ついたりします。" },
        ],
        see: ["bearings", "shaft-design", "dfm-machining"],
      },
      {
        id: "MD-3",
        title: "組立と動作確認 — 拘束・標準部品・干渉・分解",
        minutes: 18,
        level: 2,
        goals: ["ブラケットに軸を拘束で組み付けられる", "標準部品のボルトを配置できる", "干渉と部品表を確認し、分解図を作れる"],
        theory: `
<p>ブラケット (接地済み) に段付き軸を組み付け、ユニットとして成り立つかを確かめます。</p>
<ul>
  <li><b>挿入</b>: 軸をブラケットのボス穴に入れる (回転の自由度は残す)</li>
  <li><b>標準部品</b>: 取付ボルトを規格品で配置し、部品表に購入品として載せる</li>
  <li><b>干渉解析</b>: めり込みがないか — 動く部品は動きの範囲で確認</li>
  <li><b>分解図</b>: 組立手順書やサービスマニュアルに使う</li>
</ul>`,
        setup: { kind: "assembly", make: machineAssemblyStarter },
        steps: [
          { text: "<b>挿入</b> 拘束で、ブラケットのボス穴の円形エッジと軸の段の円形エッジを選んで OK。", tab: "assemble", ui: "asm-insert", check: (s) => activeAsm(s, "insert"), hint: "ビューを回して、穴の縁と軸の段の縁を選びます。" },
          { text: "<b>標準部品</b> から <b>六角穴付きボルト</b> M8 を選んで 2 個以上配置します。", tab: "assemble", ui: "asm-library", check: (s) => s.asm.components.length >= 4 },
          { text: "<b>干渉解析</b> で、部品同士がめり込んでいないか確認します。", tab: "assemble", ui: "asm-interference" },
          { text: "<b>部品表</b> で部品番号 (MU-…) と数量、購入品のボルトを確認します。", tab: "assemble", ui: "asm-bom" },
          { text: "<b>分解</b> を押して、部品を組立方向に引き離した分解図を表示します。", tab: "assemble", ui: "asm-explode", check: (s) => !!s.exploded },
          { text: "パネルの OK で分解表示を確定します。レッスン完了です。", tab: "assemble", check: (s) => !s.asmCommand },
        ],
        summary: ["回転部品は回転の自由度を残して拘束する", "ボルトは標準部品 — 部品表に規格と呼びで載る", "干渉・部品表・分解図で組立性を確かめる"],
        quiz: [
          { q: "挿入拘束を付けた軸に残る自由度は?", choices: ["軸まわりの回転", "なし", "3 方向の移動"], answer: 0, explain: "軸の一致と面の一致で、軸まわりの回転 1 つが残ります。" },
          { q: "干渉解析を行う最適なタイミングは?", choices: ["組み付けた後、試作・出図の前", "製品を出荷した後", "部品を作る前の構想段階だけ"], answer: 0, explain: "CAD 上で見つければ修正は数分、試作後だと作り直しになります。" },
        ],
        see: ["assembly-bom", "dfa", "3d-assembly-adv"],
      },
      {
        id: "MD-4",
        title: "組立図と部品表 — ユニットを図面にまとめる",
        minutes: 15,
        level: 2,
        goals: ["アセンブリから組立図を作れる", "部品表と風船を付けられる", "表題欄を埋めて出図できる"],
        theory: `
<p>機械ユニットを<b>組立図</b>にまとめます。組立図には全体の組み方、部品表、組立と据付けに必要な寸法 (外形・取付穴ピッチなど) を書きます。部品ごとの加工寸法は<b>部品図</b>に任せます。</p>
<ul>
  <li><b>部品表</b>: 品番・品名・数量・材質。購入品は規格と呼び (例 JIS B 1176 M8×20)</li>
  <li><b>風船</b>: 部品表の品番と一致させる</li>
  <li><b>表題欄</b>: 図名・図番 (MU-100)・設計者</li>
</ul>`,
        setup: { kind: "assembly", make: machineAssemblyStarter },
        steps: [
          { text: "<b>組立</b>タブの <b>図面ビュー</b> で組立図の図面環境を開きます。", tab: "assemble", ui: "asm-drawing", check: (s) => s.env === "drawing" && views(s).length >= 1 },
          { text: "組立図には<b>部品表</b>が自動で配置されます。品番・品名・数量・材質を確認します (表示されていなければ <b>部品表</b> ボタンで表示)。確認できたら「次へ」。", tab: "drawing", ui: "dw-parts" },
          { text: "<b>自動風船</b> で品番の風船を配置します。", tab: "drawing", ui: "dw-autoballoon", check: (s) => annos(s, "balloon").length >= 1 },
          { text: "<b>寸法</b> で全体の外形寸法 (幅・高さ) を 2 つ以上記入します。", tab: "drawing", ui: "dw-dim", check: (s) => dims(s).length >= 2 },
          { text: "<b>シート設定</b> で表題欄の<b>名称</b>・<b>図番</b>・<b>材質</b>・<b>設計</b>を埋めます (材質欄は「組立品」など)。", tab: "drawing", ui: "dw-sheet", check: titleFilled },
          { text: "<b>モデルに戻る</b> でアセンブリに戻ります。機械設計総合コース修了です!", tab: "drawing", ui: "dw-close", check: (s) => s.env === "assembly" },
        ],
        summary: ["組立図 = 組み方 + 部品表 + 組立・据付け寸法", "風船の番号 = 部品表の品番", "加工寸法は部品図に書く"],
        quiz: [
          { q: "組立図に書く寸法として適切なのは?", choices: ["外形・取付穴ピッチなど組立と据付けに必要な寸法", "全部品のすべての加工寸法", "寸法は書かない"], answer: 0, explain: "加工寸法は部品図に書き、組立図は組立・据付けに必要な寸法に絞ります。" },
          { q: "風船の中の番号は何と一致させる?", choices: ["部品表の品番", "寸法の値", "シート番号"], answer: 0, explain: "風船から部品表の行を引けるようにします。" },
        ],
        see: ["assembly-bom", "drawing-format", "reading"],
      },
    ],
  },
  // -------------------------------------------------------- drawing-total ---
  {
    id: "drawing-total",
    capstone: true,
    title: "総合演習: 製図 — 部品図を 1 枚完成させる",
    desc: "ブラケットの部品図を、投影図と断面 → 寸法 → 公差・幾何公差・表面性状 → 表題欄と検図・出図の順に仕上げます。製図の各レッスンで学んだことを 1 枚の図面にまとめる総合演習です。",
    lessons: [
      {
        id: "DT-1",
        title: "投影図・断面図・寸法 — 形と大きさを伝える",
        minutes: 18,
        level: 2,
        goals: ["必要な投影図と断面図を配置できる", "中心線を引き、寸法を過不足なく記入できる"],
        theory: `
<p>部品図の第一歩は、<b>形</b>を誤解なく伝える投影図の選択と、<b>大きさ</b>を伝える寸法です。</p>
<ul>
  <li>正面図には形の特徴が最もよく表れる向きを選ぶ</li>
  <li>穴や内部は<b>断面図</b>で見せる (かくれ線を減らす)</li>
  <li>穴・対称形には<b>中心線</b></li>
  <li>寸法は加工の基準面から、重複なく、1 つの図にまとめて</li>
</ul>`,
        setup: { kind: "part", make: drawingBracketStarter },
        steps: [
          { text: "<b>管理</b>タブの <b>図面ビュー</b> で図面環境を開きます。", tab: "manage", ui: "drawing", check: (s) => s.env === "drawing" && views(s).length >= 1 },
          { text: "<b>断面</b> を選び、平面図でボスの穴の中心を通る切断線を引いて断面図を配置します。", tab: "drawing", ui: "dw-section", check: (s) => views(s, "section").length >= 1, hint: "穴の円をクリックすると中心にスナップします。" },
          { text: "<b>中心線</b> で、向かい合う取付穴の円を順にクリックして中心線を引きます。", tab: "drawing", ui: "dw-centerline", check: (s) => annos(s, "centerline").length >= 1 },
          { text: "<b>自動寸法</b> で外形と穴の寸法を記入し、足りない寸法を <b>寸法</b> で追加して 8 個以上にします。", tab: "drawing", ui: ["dw-autodim", "dw-dim"], check: (s) => dims(s).length + annos(s, "ordinate").length * 3 >= 8 },
          { text: "図を見直し、重複した寸法があれば選んで <kbd>Delete</kbd> で消します。確認できたら「次へ」。", tab: "drawing" },
          { text: "<b>モデルに戻る</b> で 3D に戻ります (図面はモデルと一緒に保存されます)。レッスン完了です。", tab: "drawing", ui: "dw-close", check: (s) => s.env === "part" },
        ],
        summary: ["正面図は特徴が最もよく表れる向き", "内部は断面図で — かくれ線に頼らない", "寸法は基準から、重複なく"],
        quiz: [
          { q: "同じ寸法を 2 つの図に重複して記入すると?", choices: ["変更時に食い違いの原因になる", "精度が上がる", "加工が速くなる"], answer: 0, explain: "重複寸法は片方だけ直されて矛盾しやすく、JIS でも避けるべきとされます。" },
          { q: "内部の穴の形を最もわかりやすく示す方法は?", choices: ["断面図", "かくれ線を増やす", "等角図だけ"], answer: 0, explain: "切断して実線とハッチングで示すと読み違いが減ります。" },
        ],
        see: ["sections", "dimensioning", "views"],
      },
      {
        id: "DT-2",
        title: "公差・幾何公差・表面性状 — ばらつきの許容を指示する",
        minutes: 20,
        level: 3,
        goals: ["はめあい公差と ± 公差を使い分けられる", "データムと幾何公差を記入できる", "機能面に表面性状を指示できる"],
        theory: `
<p>寸法だけでは「どこまでずれてよいか」が伝わりません。機能に効く部分だけ<b>公差</b>を指示します。</p>
<table class="ln-table">
  <tr><th>指示</th><th>使いどころ</th></tr>
  <tr><td>はめあい (H7 など)</td><td>軸受・ピンがはまる穴</td></tr>
  <tr><td>± 公差</td><td>取付穴の位置・高さなど</td></tr>
  <tr><td>データム + 幾何公差</td><td>取付面に対する平行度・直角度・位置度</td></tr>
  <tr><td>表面性状 (Ra)</td><td>はまり合い面・摺動面・取付面</td></tr>
</table>
<p class="ln-note">個別に指示しない寸法は表題欄の<b>普通公差</b>に任せます。全部に厳しい公差を付けると加工費が跳ね上がります。</p>`,
        setup: { kind: "part", make: drawingBracketStarter },
        steps: [
          { text: "<b>図面ビュー</b> で図面環境を開き、<b>自動寸法</b> で寸法を記入します。", tab: "manage", ui: ["drawing", "dw-autodim"], check: (s) => s.env === "drawing" && dims(s).length >= 1 },
          { text: "ボス穴の直径寸法をダブルクリックし、公差の種類を<b>はめあい</b>にして <b>H7</b> と入力します。", tab: "drawing", check: (s) => tolDims(s, "fit").some((a) => a.type === "dim" && ["diameter", "hole", "radius"].includes(a.kind)), hint: "直径寸法がなければ <b>寸法</b> で穴の円をクリックして記入します。" },
          { text: "板厚などの寸法をダブルクリックし、公差の種類を <b>±</b> にして <code>0.1</code> を入力します。", tab: "drawing", check: (s) => tolDims(s, "sym").length + tolDims(s, "dev").length >= 1 },
          { text: "<b>データム</b> で正面図の底面にデータム <b>A</b> を記入します。", tab: "drawing", ui: "dw-datum", check: (s) => annos(s, "datum").length >= 1 },
          { text: "<b>幾何公差</b> でボスの上面に <b>平行度 0.05 / A</b> を記入します。", tab: "drawing", ui: "dw-gdt", check: (s) => annos(s, "gdt").length >= 1 },
          { text: "<b>表面性状</b> で底面 (取付面) に <b>Ra 1.6</b> を指示します。", tab: "drawing", ui: "dw-surface", check: (s) => annos(s, "surface").length >= 1 },
          { text: "<b>引出線注記</b> で「指示なき角は C0.5」などの注記を入れ、<b>モデルに戻る</b> で 3D に戻ります。レッスン完了です。", tab: "drawing", ui: ["dw-leader", "dw-close"], check: (s) => s.env === "part" && (s.part.drawing?.sheets ?? []).some((sh) => sh.annos.some((a) => a.type === "note")) },
        ],
        summary: ["公差は機能に効く部分だけ — ほかは普通公差", "はまる穴ははめあい、位置は ± や位置度", "幾何公差はデータム (基準) とセットで", "機能面には表面性状"],
        quiz: [
          { q: "Ø32 H7 の穴の許容差は (JIS: H7 は 30 超 50 以下で 0〜+25 µm)?", choices: ["32.000〜32.025", "31.975〜32.000", "31.988〜32.013"], answer: 0, explain: "H は下の許容差が 0、IT7 の公差幅 25 µm が上側に付きます。" },
          { q: "平行度の幾何公差に必ず必要なのは?", choices: ["基準となるデータム", "表面性状", "参考寸法"], answer: 0, explain: "平行度は「何に対して」平行かを示す関連形体の公差なので、データムが必要です。" },
        ],
        see: ["tolerance", "gdt", "surface-texture", "fit-drawing"],
      },
      {
        id: "DT-3",
        title: "表題欄・検図・出図 — 図面を正式な指示書にする",
        minutes: 15,
        level: 2,
        goals: ["表題欄と普通公差を正しく埋められる", "チェックリストで検図できる", "版を記録して PDF で出図できる"],
        theory: `
<p>図面は<b>表題欄</b>が埋まり、<b>検図</b>を通り、<b>版</b>が記録されて初めて正式な指示書になります。</p>
<ul>
  <li>表題欄: 名称・図番 (DT-101)・材料 (A6061-T6)・尺度・設計者・普通公差 (JIS B 0405-m)</li>
  <li>検図: 寸法の抜け・重複、公差の妥当性、加工できるか、材料・表面処理の指示</li>
  <li>出図: 版 (A, B …) を記録し、PDF で配布</li>
</ul>`,
        setup: { kind: "part", make: drawingBracketStarter },
        steps: [
          { text: "<b>図面ビュー</b> で図面環境を開きます。", tab: "manage", ui: "drawing", check: (s) => s.env === "drawing" && views(s).length >= 1 },
          { text: "<b>シート設定</b> で表題欄の<b>名称</b>・<b>図番</b>・<b>材質</b>・<b>設計</b>と<b>普通公差</b>を埋めます。", tab: "drawing", ui: "dw-sheet", check: (s) => titleFilled(s) && !!drawing(s)?.title.generalTol.trim() },
          { text: "検図: <b>自動寸法</b> で寸法を入れ、寸法の抜け・材料の指示・普通公差を自分で確かめたら「次へ」。", tab: "drawing", ui: "dw-autodim", hint: "テキストの「図面チェック」の章のチェックリストが参考になります。" },
          { text: "<b>PDF</b> で図面を書き出します。", tab: "drawing", ui: "dw-pdf" },
          { text: "<b>モデルに戻る</b> で 3D に戻ります。", tab: "drawing", ui: "dw-close", check: (s) => s.env === "part" },
          { text: "<b>管理</b>タブの <b>改訂履歴</b> で出図版 <b>A</b> を記録します。製図総合演習の修了です!", tab: "manage", ui: "revisions", check: (s) => (s.part.revisions?.length ?? 0) >= 1 },
        ],
        summary: ["表題欄と普通公差が埋まって初めて正式な図面", "検図はチェックリストで抜けを防ぐ", "出図した状態は版で記録"],
        quiz: [
          { q: "普通公差 (JIS B 0405-m) が適用されるのは?", choices: ["個別に公差を指示していない寸法", "はめあい寸法", "幾何公差"], answer: 0, explain: "個別指示のない長さ・角度寸法に一括で適用されます。" },
          { q: "検図で確認すべきでないのは?", choices: ["画面の配色", "寸法の抜けと重複", "材料と表面処理の指示"], answer: 0, explain: "検図は製作に必要な情報の正しさと過不足を確かめる作業です。" },
        ],
        see: ["drawing-check", "general-tolerance", "drawing-format", "design-change"],
      },
    ],
  },
  // ------------------------------------------------------- analysis-total ---
  {
    id: "analysis-total",
    capstone: true,
    title: "総合演習: 解析 — ブラケットの安全を判定する",
    desc: "軸受ブラケットを題材に、手計算の見積もり → 静解析と安全率 → メッシュ収束と寸法の見直し → 固有振動数と座屈まで、解析結果から設計の合否を判断する力を身につけます。",
    lessons: [
      {
        id: "AN-1",
        title: "静解析と安全率 — 手計算と比べて判定する",
        minutes: 15,
        level: 3,
        goals: ["固定と荷重を設定して静解析を実行できる", "最小安全率で合否を判定できる", "手計算の概算と比べて結果の妥当性を確かめられる"],
        theory: `
<p>解析の前に<b>手計算で概算</b>しておくと、解析結果の桁違いや条件の誤りに気づけます。ボスに 1000 N がかかるブラケットを片持ちはりと見なすと:</p>
<pre>σ = M / Z = F·L / (b·h²/6)</pre>
<p>例: F = 1000 N、L = 30 mm、b = 50 mm、h = 10 mm → σ = 30 000 / 833 ≒ 36 MPa。アルミ (降伏 約 275 MPa) なら安全率 約 7.6 です。解析結果が数倍以上ずれたら、境界条件・荷重・単位を疑います。</p>
<p class="ln-note">判定の目安: 静荷重で安全率 2 以上、衝撃や繰返しがあれば 3 以上。</p>`,
        setup: { kind: "part", make: analysisBracketStarter },
        steps: [
          { text: "<b>検査</b>タブの <b>応力解析</b> を開き、種類が <b>静解析</b> になっていることを確かめます。", tab: "inspect", ui: "stress", check: (s) => s.command === "stress" && s.analysisKind === "static" },
          { text: "<b>固定拘束</b>で <b>底面を追加</b>、<b>荷重面</b>で <b>上面を追加</b> し、力 <code>1000</code> N で <b>解析を実行</b> します。", tab: "inspect", ui: "stress", check: staticDone, hint: "条件のボタンを押してアクティブにしてから、クイック選択ボタンを押します。" },
          { text: "表示を <b>安全率</b> に切り替え、最小安全率と最大応力の位置を確認します。手計算 (約 36 MPa) と比べて桁が合っているか確かめたら「次へ」。", tab: "inspect" },
          { text: "パネルを閉じます。レッスン完了です。", check: (s) => s.command === null },
        ],
        summary: ["解析の前に手計算で桁を見積もる", "最小安全率で合否を判定する", "結果が大きくずれたら条件・単位を疑う"],
        quiz: [
          { q: "降伏応力 275 MPa、最大応力 55 MPa のとき安全率は?", choices: ["5", "0.2", "220"], answer: 0, explain: "275 ÷ 55 = 5 です。" },
          { q: "解析結果が手計算の 100 倍になった。まず疑うべきは?", choices: ["荷重・固定条件・単位の設定", "解析ソフトの故障", "材料の色"], answer: 0, explain: "桁違いの多くは入力ミス (単位・荷重面・固定面) が原因です。" },
        ],
        see: ["fea-practice", "safety", "bending", "estimation"],
      },
      {
        id: "AN-2",
        title: "メッシュ収束と設計変更 — 結果を信じてよいか",
        minutes: 18,
        level: 3,
        goals: ["メッシュ収束を確認できる", "応力集中部を詳細解析できる", "寸法を変えて再解析し、改善を数値で示せる"],
        theory: `
<p>有限要素解析の応力は<b>メッシュの細かさ</b>で変わります。要素を細かくしても値がほとんど変わらなければ (目安: 変化 5% 以下) <b>収束</b>していて信頼できます。</p>
<ul>
  <li>固定面の縁の鋭い角は<b>特異点</b>で、細かくするほど応力が上がり続ける — 実際の評価からは除く</li>
  <li>入隅の応力集中は<b>フィレット</b>や<b>板厚</b>で下げる</li>
  <li>変更前後を同じ条件で比べ、改善を数値で記録する</li>
</ul>`,
        setup: { kind: "part", make: analysisBracketStarter },
        steps: [
          { text: "<b>応力解析</b> (静解析) で底面を固定、上面に 1000 N をかけて <b>解析を実行</b> します。", tab: "inspect", ui: "stress", check: staticDone },
          { text: "<b>収束確認</b> を押し、メッシュを細かくしたときの応力の変化率を確認します。続けて <b>最大応力部を詳細解析</b> も試したら「次へ」。", tab: "inspect", hint: "変化が大きいときは要素数を増やすか、最大応力が特異点 (固定面の縁) でないか確かめます。" },
          { text: "最小安全率を記録してパネルを閉じます。", check: (s) => s.command === null },
          { text: "設計変更: <b>パラメータ</b> で <code>板厚</code> を <code>14</code> に上げます。", tab: "model", ui: "params", check: (s) => near(s.values.get("板厚"), 14) },
          { text: "同じ条件でもう一度 <b>解析を実行</b> し、安全率が上がったことを確かめます。レッスン完了です。", tab: "inspect", ui: "stress", check: (s) => staticDone(s) && near(s.values.get("板厚"), 14), hint: "曲げ応力は板厚の 2 乗に反比例するので、10 → 14 でおよそ半分になるはずです。" },
        ],
        summary: ["メッシュ収束を確かめてから結果を使う", "固定面の縁の特異点は評価から除く", "設計変更は同じ条件で再解析して比べる"],
        quiz: [
          { q: "曲げを受ける板の板厚を 10 → 14 mm にすると、曲げ応力はおよそ何倍?", choices: ["約 0.51 倍", "約 0.71 倍", "約 1.4 倍"], answer: 0, explain: "σ ∝ 1/h² なので (10/14)² ≒ 0.51 倍です。" },
          { q: "メッシュを細かくするほど応力が上がり続ける点は?", choices: ["特異点 (鋭い角の拘束端など)", "収束した点", "重心"], answer: 0, explain: "理論上無限大になる点で、評価は少し離れた位置か形状の改善で行います。" },
        ],
        see: ["fea-practice", "fem", "stress"],
      },
      {
        id: "AN-3",
        title: "固有振動数と座屈 — 静的強度以外のチェック",
        minutes: 15,
        level: 3,
        goals: ["固有値解析で 1 次固有振動数を求め、共振を判定できる", "座屈解析で座屈荷重係数を確認できる", "複数の解析結果から総合判定できる"],
        theory: `
<p>静的強度が十分でも、<b>共振</b>や<b>座屈</b>で壊れることがあります。総合判定では次を確認します。</p>
<table class="ln-table">
  <tr><th>項目</th><th>判定の目安</th></tr>
  <tr><td>静的強度</td><td>安全率 2〜3 以上</td></tr>
  <tr><td>共振</td><td>1 次固有振動数 ≥ 加振振動数 × √2 (できれば 2〜3 倍)</td></tr>
  <tr><td>座屈</td><td>座屈荷重係数 3 以上 (薄肉・細長い部材で重要)</td></tr>
</table>
<p>例: 1500 min⁻¹ のモーター (25 Hz) を載せるなら、1 次固有振動数は 50〜75 Hz 以上が望ましい。</p>`,
        setup: { kind: "part", make: analysisBracketStarter },
        steps: [
          { text: "<b>応力解析</b> を開き、種類を <b>固有値解析</b> にします。", tab: "inspect", ui: "stress", check: (s) => s.command === "stress" && s.analysisKind === "modal" },
          { text: "<b>底面を追加</b> で底面を固定し、<b>解析を実行</b> します。1 次固有振動数を記録します。", tab: "inspect", ui: "stress", check: (s) => s.analysisDone && s.analysisKind === "modal" },
          { text: "種類を <b>座屈解析</b> に切り替えます。", tab: "inspect", ui: "stress", check: (s) => s.command === "stress" && s.analysisKind === "buckling" },
          { text: "底面を固定、上面に 1000 N の荷重をかけて <b>解析を実行</b> し、座屈荷重係数を確認します。", tab: "inspect", ui: "stress", check: (s) => s.analysisDone && s.analysisKind === "buckling", hint: "座屈荷重係数 = 座屈する荷重 ÷ かけた荷重。厚いブラケットでは非常に大きな値になります。" },
          { text: "パネルを閉じます。静的強度・共振・座屈の 3 点で合否を判定できたら、解析総合演習の修了です!", check: (s) => s.command === null },
        ],
        summary: ["静的強度・共振・座屈を分けて確認する", "1 次固有振動数は加振振動数から十分離す", "座屈は薄肉・細長い部材で特に重要"],
        quiz: [
          { q: "1800 min⁻¹ のモーターの回転による加振振動数は?", choices: ["30 Hz", "1800 Hz", "3 Hz"], answer: 0, explain: "1800 ÷ 60 = 30 Hz です。" },
          { q: "座屈荷重係数 5 の意味は?", choices: ["かけた荷重の 5 倍で座屈する", "安全率 0.2", "5 N で座屈する"], answer: 0, explain: "座屈荷重係数は座屈荷重とかけた荷重の比です。" },
        ],
        see: ["vibration-modes", "buckling", "vibration", "fea-practice"],
      },
    ],
  },
];

