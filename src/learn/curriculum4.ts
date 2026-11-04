// 応用コース: サーフェス設計、MBD (3D 注記)、機構・配線・大規模アセンブリ、
// 総合コース: 装置設計 (架台フレーム → ステージ → 組立と検証 → 図面一式)。
// 各ステップの check は LearnState の純関数です。
import type { ExtrudeFeature, FrameFeature, HoleFeature, PartDocument, ThickenFeature } from "../core/types";
import type { AssemblyDocument } from "../assembly/types";
import { newDocument } from "../core/document";
import { sampleAssembly, sampleDocument } from "../samples";
import { annos, asmConstraints, count, drawing, editing, has, pmi, routes, sheetCount, sketches, userParams, usesUserParam, views } from "./checks";
import { builder, rectSketch } from "./starters";
import type { Chapter, LearnState } from "./types";

// ---------------------------------------------------------------- starters ---

/** Sample bracket used by the MBD lessons. */
export function mbdBracketStarter(): PartDocument {
  const doc = sampleDocument();
  doc.name = "ブラケット (MBD)";
  doc.iprops["パーツ番号"] = "MB-101";
  doc.iprops["説明"] = "MBD 練習用ブラケット";
  return doc;
}

/** Pin assembly with its insert constraint (mechanism, routing and large-assembly lessons). */
export function mechanismAssemblyStarter(): AssemblyDocument {
  const asm = sampleAssembly();
  asm.name = "ピン組立 (機構)";
  return asm;
}

/** Equipment base frame: □40 square tube along a 400 × 300 rectangle (EQ-3 / EQ-4). */
export function equipmentFramePart(): PartDocument {
  const doc = newDocument("架台フレーム");
  doc.iprops["パーツ番号"] = "EQ-101";
  doc.iprops["説明"] = "検査装置 架台フレーム";
  doc.material = { name: "鋼", density: 7.85, color: "#b9bec5" };
  const P = builder(doc);
  doc.features.push(rectSketch("sk1", "スケッチ1", "400", "300", P, 400, 300));
  const f: FrameFeature = { id: "fr1", type: "frame", name: "フレーム1", sketches: ["sk1"], section: "sqtube", size: "□40×40×2.3", miter: true, rotate: P("0", "fr1", "deg") };
  doc.features.push(f);
  doc.endOfPart = doc.features.length;
  return doc;
}

/** Stage plate 420 × 320 × 12, resting on the frame members (EQ-3 / EQ-4). */
export function stagePlatePart(): PartDocument {
  const doc = newDocument("ステージプレート");
  doc.iprops["パーツ番号"] = "EQ-102";
  doc.iprops["説明"] = "検査装置 ステージプレート";
  doc.material = { name: "アルミニウム 6061", density: 2.7, color: "#d6dae0" };
  const P = builder(doc);
  doc.features.push(rectSketch("sk1", "スケッチ1", "420", "320", P, 420, 320));
  const ex: ExtrudeFeature = { id: "ex1", type: "extrude", name: "押し出し1", sketch: "sk1", profiles: [0], profilePts: [[0, 0]], op: "new", extent: "distance", distance: P("12", "ex1"), flip: false };
  doc.features.push(ex);
  doc.endOfPart = doc.features.length;
  return doc;
}

/** Inspection unit: grounded frame, loose stage plate and loose bracket. */
export function equipmentAssemblyStarter(): AssemblyDocument {
  const frame = equipmentFramePart();
  const stage = stagePlatePart();
  const bracket = sampleDocument();
  bracket.name = "センサブラケット";
  bracket.iprops["パーツ番号"] = "EQ-103";
  bracket.iprops["説明"] = "検査装置 センサブラケット";
  const T = (x: number, y: number, z: number) => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1];
  return {
    format: "3dcad-assembly",
    version: 1,
    name: "検査ユニット",
    parts: [
      { id: "p-frame", name: frame.name, kind: "part", doc: frame },
      { id: "p-stage", name: stage.name, kind: "part", doc: stage },
      { id: "p-bracket", name: bracket.name, kind: "part", doc: bracket },
    ],
    components: [
      { id: "c1", name: "架台フレーム:1", partId: "p-frame", matrix: T(0, 0, 0), grounded: true },
      { id: "c2", name: "ステージプレート:1", partId: "p-stage", matrix: T(0, 120, 0), grounded: false },
      { id: "c3", name: "センサブラケット:1", partId: "p-bracket", matrix: T(60, 220, 0), grounded: false },
    ],
    constraints: [],
    params: [],
    iprops: { パーツ番号: "EQ-100", 説明: "検査ユニット", 設計者: "", 作成日: new Date().toISOString().slice(0, 10) },
  };
}

// ------------------------------------------------------------------ helpers ---

const inSketch = (s: LearnState) => !!editing(s);
const finishedSketch = (s: LearnState, min: number) => s.mode === "model" && sketches(s).some((k) => count(k, "line") + count(k, "arc") >= min);
const titleFilled = (s: LearnState) => {
  const t = drawing(s)?.title;
  return !!t && [t.title, t.number, t.material, t.designer].every((x) => !!x?.trim());
};
const asmStaticDone = (s: LearnState) => s.env === "assembly" && s.command === "stress" && s.analysisKind === "static" && s.analysisDone;
const patternCopies = (s: LearnState) => s.asm.components.filter((c) => !!(c as { patternOf?: string }).patternOf).length;

// --------------------------------------------------------------- curriculum ---

export const CURRICULUM4: Chapter[] = [
  // ------------------------------------------------------- surface-design ---
  {
    id: "surface-design",
    title: "応用: サーフェス設計 — 曲面で形を作る",
    desc: "ソリッドでは作りにくい薄肉の曲面形状を、サーフェス (厚みのない面) で作ってから厚み付けでソリッドにします。押し出し・回転・トリム・オフセットと、ゼブラ表示による面品質の確認を練習します。",
    lessons: [
      {
        id: "SF-1",
        title: "開いた曲線からサーフェス — 厚み付けで薄肉部品に",
        minutes: 12,
        level: 2,
        goals: ["開いた曲線を押し出してサーフェスを作れる", "サーフェスに厚みを付けてソリッドにできる", "ソリッドとサーフェスの違いを説明できる"],
        theory: `
<p><b>サーフェス</b>は厚みのない「面」だけのボディです。ソリッドは閉じた輪郭しか押し出せませんが、サーフェスは<b>開いた曲線</b> (波形・円弧・自由曲線) からも作れます。</p>
<ul>
  <li>カバー・ダクト・外装など、<b>板厚一定の曲面部品</b>はサーフェス + 厚み付けが近道</li>
  <li>サーフェスには体積がない — 質量・解析・3D プリントにはソリッドにしてから使う</li>
  <li>厚み付けは「どちら側に」厚くするかで外形寸法が変わる (内側 / 外側)</li>
</ul>`,
        setup: { kind: "newPart" },
        steps: [
          { text: "<b>サーフェス</b>タブの <b>2D スケッチ</b> で <b>XY 平面</b>にスケッチを開始します。", tab: "surface", ui: "sketch", check: inSketch },
          { text: "<b>線分</b> (または <b>円弧</b>) で、閉じていない折れ線 / 波形を 3 本以上つないで描きます (例: 0,0 → 30,10 → 60,0 → 90,10)。", tab: "sketch", ui: ["sk-line", "sk-arc"], check: (s) => count(editing(s), "line") + count(editing(s), "arc") >= 3, hint: "最後の点で <kbd>Esc</kbd> を押すと、閉じずに線を終えられます。" },
          { text: "<b>スケッチを終了</b>します。", tab: "sketch", ui: "sk-finish", check: (s) => finishedSketch(s, 3) },
          { text: "<b>サーフェス</b>タブの <b>押し出し</b> で、曲線を 40 mm 押し出して OK。波形の面 (サーフェス) ができます。", tab: "surface", ui: "surfExtrude", check: (s) => has(s, "surfExtrude") },
          { text: "<b>厚み付け</b> で対象に作ったサーフェスを選び、厚さ <code>2</code> で OK。板厚 2 mm の波板 (ソリッド) になります。レッスン完了です。", tab: "surface", ui: "surf-thicken", check: (s) => has<ThickenFeature>(s, "thicken", (f) => !!f.surface) && s.bodies >= 1, hint: "パネルの「対象」でサーフェスを選ぶか、ビューでサーフェスをクリックします。" },
        ],
        summary: ["サーフェスは開いた曲線からも作れる", "板厚一定の曲面部品はサーフェス + 厚み付け", "質量・解析にはソリッドにしてから"],
        quiz: [
          { q: "ソリッドの押し出しでは作れず、サーフェスの押し出しなら作れるのは?", choices: ["閉じていない曲線からの面", "直方体", "円柱"], answer: 0, explain: "ソリッドの押し出しには閉じた輪郭が必要です。サーフェスは開いた曲線から作れます。" },
          { q: "サーフェスのままでは求められないのは?", choices: ["質量 (体積)", "面積", "形状の表示"], answer: 0, explain: "サーフェスには厚み (体積) がないので、質量は厚み付けしたソリッドで求めます。" },
        ],
        see: ["3d-surfaces", "form-surfaces", "dfm-sheet"],
      },
      {
        id: "SF-2",
        title: "回転サーフェスと面品質 — ゼブラで滑らかさを見る",
        minutes: 12,
        level: 2,
        goals: ["断面曲線を回転してサーフェスを作れる", "ゼブラ表示で面のつながり (G0/G1/G2) を確認できる"],
        theory: `
<p>外装部品の美しさは<b>面のつながり方</b>で決まります。</p>
<table class="ln-table">
  <tr><th>連続性</th><th>意味</th><th>ゼブラの見え方</th></tr>
  <tr><td>G0 (位置)</td><td>面がつながっているだけ (角がある)</td><td>縞がずれる</td></tr>
  <tr><td>G1 (接線)</td><td>折れ目なく接する (フィレット)</td><td>縞はつながるが折れる</td></tr>
  <tr><td>G2 (曲率)</td><td>曲がり具合も連続 (クラス A)</td><td>縞が滑らかに流れる</td></tr>
</table>
<p>折れ線の断面を回転すると、折れ目ごとに G0 の稜線ができます。ゼブラ表示で確かめましょう。</p>`,
        setup: { kind: "newPart" },
        steps: [
          { text: "<b>サーフェス</b>タブの <b>2D スケッチ</b> で <b>XY 平面</b>にスケッチを開始します。", tab: "surface", ui: "sketch", check: inSketch },
          { text: "Y 軸の右側に、ボトルの肩のような開いた断面を <b>線分</b> 3 本以上で描き (例: 20,0 → 20,40 → 10,55 → 10,70)、<b>スケッチを終了</b>します。", tab: "sketch", ui: ["sk-line", "sk-finish"], check: (s) => finishedSketch(s, 3) },
          { text: "<b>サーフェス</b>タブの <b>回転</b> で、軸を <b>Y 軸</b>にして 360° 回転して OK。", tab: "surface", ui: "surfRevolve", check: (s) => has(s, "surfRevolve") },
          { text: "<b>ゼブラ</b> を押して縞模様を表示し、折れ目で縞がずれる (G0) ことを確かめます。", tab: "surface", ui: "zebra", check: (s) => !!s.zebra },
          { text: "<b>曲率</b> を押すと、ゼブラに代わって曲がり具合が色で表示されます (青 = 平ら → 赤 = 曲率大)。見比べたらもう一度 <b>曲率</b> を押して表示を戻し、「次へ」。レッスン完了です。", tab: "surface", ui: "curvature" },
        ],
        summary: ["回転サーフェスは断面曲線 + 軸", "ゼブラの縞のずれ・折れで G0 / G1 を見分ける", "外装の見える面は G2 (曲率連続) を目指す"],
        quiz: [
          { q: "ゼブラの縞が境界で「つながっているが折れている」のは?", choices: ["G1 (接線連続)", "G0 (位置連続のみ)", "G2 (曲率連続)"], answer: 0, explain: "縞が途切れずつながり、向きだけ折れるのは接線連続 (G1) です。" },
          { q: "フィレット (円弧) と平面のつなぎ目の連続性は?", choices: ["G1", "G2", "G3"], answer: 0, explain: "円弧と直線は接するが曲率が急変するため G1 です。G2 にはカーブ (曲率が徐々に変わる面) を使います。" },
        ],
        see: ["surface-quality-class-a", "form-surfaces", "3d-surfaces"],
      },
      {
        id: "SF-3",
        title: "トリムとオフセット — 面を切って重ねる",
        minutes: 12,
        level: 3,
        goals: ["サーフェスを平面でトリムできる", "サーフェスをオフセットして平行な面を作れる", "トリム・オフセットの使いどころがわかる"],
        theory: `
<p>サーフェス設計では、大きめに作った面を<b>トリム (切り取り)</b> で必要な範囲に整え、<b>オフセット</b>で内面・型の面・クリアランス面を作ります。</p>
<ul>
  <li><b>トリム</b>: 平面・スケッチ・別のサーフェスで面を切る (残す側を選ぶ)</li>
  <li><b>オフセット</b>: 面を法線方向に一定距離ずらした新しい面 (板厚の内側面、すき間の確認)</li>
  <li><b>ステッチ</b>: 複数の面を縫い合わせ、閉じればソリッドになる</li>
</ul>`,
        setup: { kind: "newPart" },
        steps: [
          { text: "<b>XY 平面</b>にスケッチを開始し、原点をまたぐ開いた折れ線 (例: -50,0 → 0,20 → 50,0) を描いて <b>スケッチを終了</b>します。", tab: "surface", ui: ["sketch", "sk-line", "sk-finish"], check: (s) => finishedSketch(s, 2) },
          { text: "<b>サーフェス</b>の <b>押し出し</b> で 60 mm 押し出します。", tab: "surface", ui: "surfExtrude", check: (s) => has(s, "surfExtrude") },
          { text: "<b>トリム</b> で、ツールに <b>YZ 平面</b> を選んで面の片側 (x &lt; 0 側など) を切り取ります。", tab: "surface", ui: "surfTrim", check: (s) => has(s, "surfTrim"), hint: "「反転」で残す側を切り替えられます。" },
          { text: "<b>オフセット</b> で、トリムした面を <code>3</code> mm オフセットします。2 枚の平行な面ができます。レッスン完了です。", tab: "surface", ui: "surfOffset", check: (s) => has(s, "surfOffset") },
        ],
        summary: ["大きめに作ってトリムで整える", "オフセットで内面・すき間の面を作る", "面を縫い合わせて閉じればソリッド"],
        quiz: [
          { q: "外装の内面 (板厚 2 mm の裏側) を作るのに向く操作は?", choices: ["外面を 2 mm オフセット", "トリム", "ゼブラ表示"], answer: 0, explain: "外面を法線方向に板厚分オフセットすると内面になります。" },
          { q: "サーフェスがすき間なく閉じたとき、ステッチで得られるのは?", choices: ["ソリッド", "スケッチ", "図面"], answer: 0, explain: "閉じたシェルを縫い合わせるとソリッドにできます。" },
        ],
        see: ["3d-surfaces", "form-development", "dfm-molding"],
      },
    ],
  },
  // ------------------------------------------------------------------ mbd ---
  {
    id: "mbd",
    title: "応用: MBD — 3D モデルに公差と仕上げを書き込む",
    desc: "図面の代わりに 3D モデルへ直接、寸法・公差・データム・幾何公差・表面性状を記入する MBD (モデル ベース定義) を練習します。3D 注記は一覧・CSV に出力でき、図面にも取り込めます。",
    lessons: [
      {
        id: "MB-1",
        title: "データムと 3D 寸法 — はめあい穴を指示する",
        minutes: 12,
        level: 2,
        goals: ["取付面にデータムを付けられる", "2 面間の 3D 寸法と穴のはめあいを記入できる"],
        theory: `
<p><b>MBD</b> (Model Based Definition) は、製造に必要な情報 (PMI: 寸法・公差・表面性状など) を 3D モデルに直接持たせる方法です。</p>
<ul>
  <li>3D 注記は<b>面やエッジに結び付く</b>ので、モデルを変更すると値が追従する</li>
  <li>まず加工・測定の基準になる面に<b>データム</b>を付ける</li>
  <li>機能に効く寸法 (はめあい穴・取付ピッチ) だけに公差を付け、ほかは普通公差</li>
</ul>`,
        setup: { kind: "part", make: mbdBracketStarter },
        steps: [
          { text: "<b>MBD</b> タブの <b>データム</b> で、ブラケットの底面 (取付面) をクリックしてデータム <b>A</b> を付け、OK。", tab: "mbd", ui: "pmi-datum", check: (s) => pmi(s, "datum").length >= 1, hint: "底面はモデルを回転させると選べます。" },
          { text: "<b>寸法</b> で、底面とボスの上面など平行な 2 面を順にクリックして高さの 3D 寸法を記入し、OK。", tab: "mbd", ui: "pmi-dim", check: (s) => pmi(s, "dim").length >= 1 },
          { text: "<b>直径</b> でボスの穴の円筒面をクリックします。はめあい (既定 <b>H7</b>) のまま OK。", tab: "mbd", ui: "pmi-diameter", check: (s) => pmi(s, "diameter").length >= 1 },
          { text: "<b>一覧</b> で記入した 3D 注記を確認します (値はモデルから測った実寸)。確認できたら「次へ」。レッスン完了です。", tab: "mbd", ui: "pmi-list" },
        ],
        summary: ["MBD = 製造情報を 3D モデルに持たせる", "データム → 機能寸法 → はめあいの順に", "3D 注記はモデル変更に追従する"],
        quiz: [
          { q: "MBD の 3D 注記がモデル変更に追従できる理由は?", choices: ["面・エッジに結び付いているから", "画像として貼っているから", "図面にしか存在しないから"], answer: 0, explain: "注記は面・エッジの参照を持ち、再計算のたびに値を測り直します。" },
          { q: "最初にデータムを付けるべき面は?", choices: ["加工・測定・取付の基準になる面", "一番小さい面", "見た目が良い面"], answer: 0, explain: "データムは公差を測る基準なので、機能上の基準面に付けます。" },
        ],
        see: ["3d-mbd", "gdt", "tolerance", "fit-drawing"],
      },
      {
        id: "MB-2",
        title: "幾何公差・表面性状と図面への取り込み",
        minutes: 15,
        level: 3,
        goals: ["面に幾何公差と表面性状を指示できる", "PMI 一覧を CSV で出力できる", "3D 注記を図面に取り込める"],
        theory: `
<p>形の精度は<b>幾何公差</b>、仕上げは<b>表面性状</b>で指示します。MBD では、これらを 3D の面に付けておけば、検査表 (CSV) や 2D 図面へ再利用できます。</p>
<ul>
  <li>平面度 (⏥) は単独形体 — データム不要</li>
  <li>平行度・直角度・位置度は関連形体 — データムが必要</li>
  <li>表面性状 Ra はすべり面・はめあい面・シール面などに</li>
</ul>`,
        setup: { kind: "part", make: mbdBracketStarter },
        steps: [
          { text: "<b>MBD</b> タブの <b>データム</b> で底面にデータム <b>A</b> を付けます。", tab: "mbd", ui: "pmi-datum", check: (s) => pmi(s, "datum").length >= 1 },
          { text: "<b>幾何公差</b> でボスの上面をクリックし、特性を<b>平行度</b>、公差値 <code>0.05</code>、データム <code>A</code> にして OK。", tab: "mbd", ui: "pmi-gdt", check: (s) => pmi(s, "gdt").length >= 1 },
          { text: "<b>表面性状</b> で底面に <b>Ra 1.6</b> を指示します。", tab: "mbd", ui: "pmi-surface", check: (s) => pmi(s, "surface").length >= 1 },
          { text: "<b>注記</b> で任意の面に「指示なき角は C0.5」などの注記を付けます。", tab: "mbd", ui: "pmi-note", check: (s) => pmi(s, "note").length >= 1 },
          { text: "<b>PMI 一覧 CSV</b> で検査表用の一覧を書き出したら「次へ」。", tab: "mbd", ui: "pmi-csv" },
          { text: "<b>管理</b>タブの <b>図面ビュー</b> で図面を開き、<b>PMI 取り込み</b> で 3D 注記を図面に取り込みます。", tab: "manage", ui: ["drawing", "dw-pmi"], check: (s) => s.env === "drawing" && annos(s, "gdt").length + annos(s, "datum").length + annos(s, "surface").length >= 1 },
          { text: "<b>モデルに戻る</b> で 3D に戻ります。MBD コース修了です!", tab: "drawing", ui: "dw-close", check: (s) => s.env === "part" },
        ],
        summary: ["平面度はデータム不要、平行度・位置度はデータムとセット", "表面性状は機能面だけに", "3D 注記は CSV (検査表) と図面に再利用できる"],
        quiz: [
          { q: "データムが不要な幾何公差は?", choices: ["平面度", "平行度", "位置度"], answer: 0, explain: "平面度は単独形体の公差で、基準を必要としません。" },
          { q: "PMI 一覧 CSV の主な使い道は?", choices: ["検査項目表・測定記録の作成", "3D プリント", "レンダリング"], answer: 0, explain: "指示された寸法・公差を一覧にすると、検査表の作成や測定値の記録に使えます。" },
        ],
        see: ["3d-mbd", "gdt", "surface-texture", "inspection-design"],
      },
    ],
  },
  // ----------------------------------------------------------- asm-motion ---
  {
    id: "asm-motion",
    title: "応用: 機構・配線・大規模アセンブリ",
    desc: "組み立てたアセンブリを動かして確かめる (拘束の駆動・モーション解析)、ケーブル・ホースの経路を引く (配線・配管)、部品が多いアセンブリを軽く扱う (パターン・軽量表示) — 装置設計で必要になるアセンブリの技を練習します。",
    lessons: [
      {
        id: "AX-1",
        title: "拘束を駆動する — 動きと速度を確かめる",
        minutes: 12,
        level: 2,
        goals: ["拘束の値を連続的に変えて機構を動かせる", "モーション解析で速度・すき間を確認できる"],
        theory: `
<p>機構は「動かして」初めて問題が見つかります。<b>拘束を駆動</b>すると、角度やオフセットの値を少しずつ変えながら位置を解き直し、動きを再生できます。</p>
<ul>
  <li>干渉で止める設定にすると、ぶつかる位置がわかる</li>
  <li><b>モーション解析</b>は時間あたりの変位から速度・加速度を求め、最小すき間も報告する</li>
  <li>速度・加速度がわかれば、慣性力やモーターのトルクを見積もれる</li>
</ul>`,
        setup: { kind: "assembly", make: mechanismAssemblyStarter },
        steps: [
          { text: "<b>組立</b>タブの <b>拘束を駆動</b> を押します (ピンの挿入拘束のオフセットが駆動されます)。", tab: "assemble", ui: "asm-drive", check: (s) => s.asmCommand === "drive" },
          { text: "パネルの再生ボタン (▶▶) でピンが抜ける動きを再生し、動きを確かめたら「次へ」。", tab: "assemble" },
          { text: "<b>モーション解析</b> を実行し、最大速度と最小すき間のグラフを確認したら「次へ」。", tab: "assemble", hint: "1 秒で 20 mm 動くなら平均 20 mm/s です。" },
          { text: "<b>Esc</b> またはパネルのキャンセルで駆動を終了します (位置は元に戻ります)。レッスン完了です。", tab: "assemble", check: (s) => !s.asmCommand },
        ],
        summary: ["機構は駆動して動きと干渉を確かめる", "モーション解析で速度・加速度・すき間を数値で", "駆動を終えると位置は元に戻る"],
        quiz: [
          { q: "0.5 秒で 30 mm 動くスライダの平均速度は?", choices: ["60 mm/s", "15 mm/s", "30 mm/s"], answer: 0, explain: "30 ÷ 0.5 = 60 mm/s です。" },
          { q: "駆動中の干渉チェックで見つけられるのは?", choices: ["動きの途中でぶつかる位置", "部品の材料", "図面の寸法漏れ"], answer: 0, explain: "静止状態では干渉しなくても、動きの途中でぶつかることがあります。" },
        ],
        see: ["kinematics", "mechanisms", "lagrange-mechanics", "rigid-body-dynamics"],
      },
      {
        id: "AX-2",
        title: "配線・配管 — ケーブルの経路と長さ",
        minutes: 15,
        level: 2,
        goals: ["部品の面・円の中心を通るケーブル経路を作れる", "曲げ半径・長さ・干渉をチェックできる", "切断リストを出力できる"],
        theory: `
<p>装置の不具合の多くは<b>配線・配管</b>から起きます (曲げすぎによる断線、可動部での擦れ、長さ不足)。3D で経路を引いておくと、長さと曲げ半径を事前に確かめられます。</p>
<table class="ln-table">
  <tr><th>種類</th><th>最小曲げ半径の目安 (中心線)</th></tr>
  <tr><td>ケーブル (固定)</td><td>外径 × 4〜6</td></tr>
  <tr><td>ケーブル (可動)</td><td>外径 × 7.5〜10</td></tr>
  <tr><td>ホース</td><td>外径 × 5〜8</td></tr>
</table>`,
        setup: { kind: "assembly", make: mechanismAssemblyStarter },
        steps: [
          { text: "<b>組立</b>タブの <b>配線・配管</b> を押して一覧パネルを開きます。", tab: "assemble", ui: "asm-route", check: (s) => s.asmCommand === "routes" || s.asmCommand === "route" },
          { text: "<b>電線/ケーブル</b> で新しい経路を作り、ブラケットの穴の縁 → ピンの頭の縁など、2 点以上をクリックして OK。", tab: "assemble", check: (s) => routes(s).length >= 1, hint: "円形エッジをクリックすると円の中心に点が置かれます。" },
          { text: "一覧の <b>チェック</b> で曲げ半径・干渉を確認し、<b>切断リスト CSV</b> で長さを書き出したら「次へ」。", tab: "assemble" },
          { text: "パネルを閉じます。レッスン完了です。", tab: "assemble", check: (s) => !s.asmCommand },
        ],
        summary: ["配線は 3D で経路・長さ・曲げ半径を確かめる", "可動部のケーブルは曲げ半径を大きく", "切断リストで製作・手配の長さを渡す"],
        quiz: [
          { q: "外径 8 mm の可動ケーブルの曲げ半径として適切なのは?", choices: ["80 mm 程度", "8 mm", "16 mm"], answer: 0, explain: "可動部では外径の 7.5〜10 倍が目安です。" },
          { q: "配線を 3D で引いておく利点でないのは?", choices: ["電気抵抗がゼロになる", "長さを事前に決められる", "可動部との干渉がわかる"], answer: 0, explain: "3D の経路は長さ・曲げ・干渉の確認に使います。" },
        ],
        see: ["wiring-design", "piping-cable-layout", "cable-carrier", "case-cable-carrier"],
      },
      {
        id: "AX-3",
        title: "大規模アセンブリ — パターンと軽量表示",
        minutes: 10,
        level: 2,
        goals: ["コンポーネント パターンで部品を並べられる", "軽量表示・簡略表示で大きなアセンブリを軽く扱える"],
        theory: `
<p>装置は数百〜数千の部品になります。同じ部品は<b>パターン</b>で並べ (元に追従)、表示は<b>軽量化</b>して操作を軽く保ちます。</p>
<ul>
  <li><b>コンポーネント パターン</b>: 元を直せば全コピーが追従、部品表の数量も自動</li>
  <li><b>軽量表示</b>: 編集中でない部品を境界ボックスで表示</li>
  <li><b>パターンの簡略表示</b>: パターンのコピーを箱で表示</li>
  <li><b>分離</b>: 作業中の部品だけを表示</li>
</ul>`,
        setup: { kind: "assembly", make: mechanismAssemblyStarter },
        steps: [
          { text: "ブラウザまたはビューで、まだ拘束されていないピン (<b>ピン:2</b>) を選択します。確認できたら「次へ」。", tab: "assemble" },
          { text: "<b>パターン</b> を押し、矩形状で 3 個並べて OK。", tab: "assemble", ui: "asm-pattern", check: (s) => patternCopies(s) >= 2 },
          { text: "<b>軽量表示</b> をオンにします。", tab: "assemble", ui: "asm-light", check: (s) => !!s.asmLight },
          { text: "<b>パターンの簡略表示</b> をオンにし、パターンのコピーが箱で表示されることを確かめます。", tab: "assemble", ui: "asm-simplify", check: (s) => !!s.asmSimplify },
          { text: "<b>部品表</b> でピンの数量が自動で増えていることを確認したら「次へ」。レッスン完了です。", tab: "assemble", ui: "asm-bom" },
        ],
        summary: ["同じ部品はパターンで — 元に追従、数量も自動", "大きなアセンブリは軽量表示・簡略表示で軽く", "作業する部品は分離して見る"],
        quiz: [
          { q: "コンポーネント パターンの利点は?", choices: ["元を直すとコピーも追従し、部品表の数量も合う", "部品が軽くなる", "干渉しなくなる"], answer: 0, explain: "パターンは元の部品と関連を保つので、変更と数量管理が楽になります。" },
          { q: "軽量表示で変わるのは?", choices: ["画面の表示だけ (形状データは変わらない)", "部品の質量", "拘束の数"], answer: 0, explain: "表示を簡略にするだけで、モデルや部品表は変わりません。" },
        ],
        see: ["3d-assembly-adv", "3d-data-management", "assembly-bom"],
      },
    ],
  },
  // ---------------------------------------------------- project-equipment ---
  {
    id: "project-equipment",
    title: "総合コース: 装置設計 — 検査装置の架台からステージ・図面一式まで",
    desc: "小型検査装置を題材に、角パイプの架台フレーム → MBD 付きステージプレート → 組立と干渉・強度の検証 → 組立図と部品図のセットまでを通して設計します。フレーム・MBD・アセンブリ解析・図面セットを 1 つの装置にまとめる総合演習です。",
    capstone: true,
    lessons: [
      {
        id: "EQ-1",
        title: "架台フレーム — 角パイプで骨組みを作る",
        minutes: 15,
        level: 2,
        goals: ["骨組みの寸法をユーザ パラメータで決められる", "フレーム ジェネレータで規格鋼材を配置できる", "部材表 (切断リスト) と質量を確認できる"],
        theory: `
<p>装置の土台になる<b>架台</b>を、角形鋼管 (STKR) で作ります。仕様: 外形 400 × 300、□40×40×2.3、留め継ぎ (マイター)、鋼。</p>
<ul>
  <li>骨組みは<b>スケッチの線分 = 部材の中心線</b>。寸法はパラメータにしておくと装置サイズの変更に強い</li>
  <li>フレーム ジェネレータは<b>部材表</b> (長さ・端部角度・本数・質量) を作るので、そのまま切断・手配に使える</li>
  <li>架台の剛性は<b>断面二次モーメント</b>と<b>接合部</b>で決まる — 細い部材を増やすより断面を上げる</li>
</ul>`,
        setup: { kind: "newPart" },
        steps: [
          { text: "<b>パラメータ</b> で、ユーザ パラメータ <code>架台幅</code> = <code>400</code>、<code>架台奥行</code> = <code>300</code> を作ります。", tab: "model", ui: "params", check: (s) => ["架台幅", "架台奥行"].every((n) => userParams(s).some((p) => p.name === n)) },
          { text: "<b>XZ 平面</b>に<b>長方形</b>を描き、寸法の値を <code>架台幅</code> と <code>架台奥行</code> にしてスケッチを終了します。", tab: "model", ui: ["sketch", "sk-rect", "sk-dimension", "sk-finish"], check: (s) => s.mode === "model" && usesUserParam(s) && sketches(s).some((k) => count(k, "line") >= 4) },
          { text: "<b>3D モデル</b>タブの <b>フレーム</b> で、規格 <b>角形鋼管</b>・サイズ <b>□40×40×2.3</b>、留め継ぎを確認して OK。", tab: "model", ui: "frame", check: (s) => has<FrameFeature>(s, "frame", (f) => f.section === "sqtube" && f.size === "□40×40×2.3") && s.errors === 0, hint: "サイズの既定は □50×50×2.3 です。一覧から □40×40×2.3 を選びます。パネル下の部材表に 4 本・総延長 1400 mm と表示されます。" },
          { text: "材料を <b>鋼</b> にし、<b>検査</b>タブの <b>iProperties</b> で質量を確認します (約 3.8 kg)。", ui: [".qat-field", "iprops"], check: (s) => s.part.material.name === "鋼" },
          { text: "設計変更: <code>架台幅</code> を <code>500</code> にして、フレームが追従することを確かめます。レッスン完了です。", tab: "model", ui: "params", check: (s) => s.values.get("架台幅") === 500 && s.errors === 0 },
        ],
        summary: ["骨組みはスケッチの線 = 部材の中心線", "フレームは部材表で切断・手配まで", "装置サイズはパラメータで変更に強く"],
        quiz: [
          { q: "□40×40×2.3 (単位質量 約 2.7 kg/m) を 1.4 m 使うと質量はおよそ?", choices: ["約 3.8 kg", "約 38 kg", "約 0.38 kg"], answer: 0, explain: "2.7 × 1.4 ≒ 3.8 kg です (マイターの継ぎ目でわずかに変わります)。" },
          { q: "架台のたわみを減らすのに最も効くのは?", choices: ["部材の断面 (せい) を大きくする", "塗装を厚くする", "部材を細くして本数を増やす"], answer: 0, explain: "曲げ剛性は断面二次モーメントに比例し、せいの 3 乗で効きます。" },
        ],
        see: ["equipment-frame-cover", "frame-design", "truss-frame", "stiffness-design"],
      },
      {
        id: "EQ-2",
        title: "ステージプレート — 取付穴と MBD の精度指示",
        minutes: 18,
        level: 2,
        goals: ["パラメトリックなステージプレートを作れる", "取付穴をパターンで配置できる", "上面の平面度と取付面のデータムを 3D 注記で指示できる"],
        theory: `
<p>検査対象を載せる<b>ステージプレート</b> (A6061、420 × 320 × 12) を作ります。架台 (400 × 300、□40) の上に載り、外周が角パイプに 30 mm ずつ掛かる大きさです。測定精度は上面の<b>平面度</b>で決まるので、MBD で指示しておきます。</p>
<ul>
  <li>架台への取付穴: Ø9 キリ × 4 (M8)、角パイプの中心 (縁から 10、ピッチ 400 × 300)</li>
  <li>データム A: 下面 (架台への取付面)</li>
  <li>上面: 平面度 0.02、表面性状 Ra 1.6</li>
</ul>
<p class="ln-note">精密ステージでは、加工後の反りを減らすため素材の残留応力が少ない板 (調質材・応力除去材) を選びます。</p>`,
        setup: { kind: "newPart" },
        steps: [
          { text: "<b>XZ 平面</b>に 420 × 320 の<b>長方形</b>を描いて<b>スケッチを終了</b>します。", tab: "model", ui: ["sketch", "sk-rect", "sk-finish"], check: (s) => s.mode === "model" && sketches(s).some((k) => count(k, "line") >= 4) },
          { text: "<b>押し出し</b>で <code>12</code> mm の板にします。", tab: "model", ui: "extrude", check: (s) => has(s, "extrude") },
          { text: "<b>穴</b> で上面の角から 10 mm の位置に Ø<code>9</code> の貫通穴を 1 つあけます。", tab: "model", ui: "hole", check: (s) => has<HoleFeature>(s, "hole", (f) => s.values.get(f.diameter) === 9) },
          { text: "<b>矩形状</b>パターン (2 × 2、間隔 400 と 300) で穴を 4 隅にそろえます。", tab: "model", ui: "rectPattern", check: (s) => has(s, "rectPattern") },
          { text: "<b>MBD</b> タブの <b>データム</b> で下面にデータム <b>A</b> を付けます。", tab: "mbd", ui: "pmi-datum", check: (s) => pmi(s, "datum").length >= 1 },
          { text: "<b>幾何公差</b> で上面に<b>平面度</b> <code>0.02</code> を指示し、材料を <b>アルミニウム 6061</b> にします。レッスン完了です。", tab: "mbd", ui: ["pmi-gdt", ".qat-field"], check: (s) => pmi(s, "gdt").length >= 1 && s.part.material.name.startsWith("アルミ") },
        ],
        summary: ["ステージの精度は上面の平面度で指示する", "取付面をデータムにして基準を明確に", "取付穴は 1 つ作ってパターン"],
        quiz: [
          { q: "平面度 0.02 の意味は?", choices: ["面全体が 0.02 mm 離れた平行 2 平面の間に入る", "面の粗さが Ra 0.02", "板厚の公差が ±0.02"], answer: 0, explain: "平面度は面の凹凸の許容幅 (平行 2 平面の間隔) です。" },
          { q: "精密ステージの素材に応力除去材を選ぶ理由は?", choices: ["加工後の反り (変形) を減らすため", "色をそろえるため", "重くするため"], answer: 0, explain: "残留応力が大きいと、切削で応力のつり合いが崩れて反ります。" },
        ],
        see: ["precision-stage", "precision-fixture", "3d-mbd", "fixture-materials"],
      },
      {
        id: "EQ-3",
        title: "組立と検証 — メイト・干渉・アセンブリ解析",
        minutes: 20,
        level: 3,
        goals: ["架台・ステージ・ブラケットをメイト拘束で組み付けられる", "干渉と部品表を確認できる", "組んだ状態で強度を確かめられる"],
        theory: `
<p>部品が揃ったら、<b>組んだ状態</b>で成り立つかを確かめます。</p>
<ul>
  <li><b>メイト</b>: 面と面を向かい合わせて接触させる (ステージ下面 ↔ 架台上面)</li>
  <li><b>干渉解析</b>: 部品同士のめり込み (ボルト・ブラケットと架台など)</li>
  <li><b>アセンブリの構造解析</b>: 部品同士を接着として、部品ごとの材料で応力を見る</li>
</ul>
<p class="ln-note">架台は鋼、ステージはアルミ — 材料が違う部品の剛性の差も解析に反映されます。</p>`,
        setup: { kind: "assembly", make: equipmentAssemblyStarter },
        steps: [
          { text: "<b>メイト</b> 拘束で、ステージプレートの下面と架台フレームの上面を選んで OK。", tab: "assemble", ui: "asm-mate", check: (s) => asmConstraints(s, "mate").length + asmConstraints(s, "flush").length >= 1 && !s.asmCommand },
          { text: "もう一度 <b>メイト</b> で、センサブラケットの底面とステージプレートの上面を選んで OK。", tab: "assemble", ui: "asm-mate", check: (s) => asmConstraints(s, "mate").length + asmConstraints(s, "flush").length >= 2 && !s.asmCommand },
          { text: "<b>干渉解析</b> と <b>部品表</b> で、めり込みがないこと・品番 (EQ-…) と数量を確認したら「次へ」。", tab: "assemble", ui: ["asm-interference", "asm-bom"] },
          { text: "<b>構造解析</b> で架台の底面を固定、ブラケットの上面に荷重をかけて <b>解析を実行</b> します。", tab: "assemble", ui: "asm-analysis", check: asmStaticDone, hint: "条件のボタンを押してアクティブにしてから、モデルの面をクリックします。" },
          { text: "最大応力の位置と安全率を確認してパネルを閉じます。レッスン完了です。", tab: "assemble", check: (s) => s.command === null },
        ],
        summary: ["組立はメイトで面どうしを合わせる", "干渉と部品表で組立性と手配を確認", "組んだ状態の解析で弱い部品を見つける"],
        quiz: [
          { q: "メイト拘束 1 つ (面と面) で残る自由度は?", choices: ["3 (面内の移動 2 + 法線まわりの回転 1)", "0", "6"], answer: 0, explain: "面の一致で法線方向の移動と 2 軸まわりの回転が拘束され、3 つが残ります。" },
          { q: "アセンブリ解析で部品ごとの材料を反映すると分かることは?", choices: ["柔らかい部品に変形・応力が集中する様子", "部品の色", "図面の尺度"], answer: 0, explain: "剛性の違う部品の組合せでは、荷重の分担と変形が材料で変わります。" },
        ],
        see: ["machine-design-flow", "bolted-joint-design", "fea-practice", "3d-assembly-adv"],
      },
      {
        id: "EQ-4",
        title: "図面一式 — 組立図と部品図のセットで出図する",
        minutes: 15,
        level: 2,
        goals: ["組立図に風船と部品表を付けられる", "図面セットで部品図を一括作成できる", "表題欄を埋めて出図できる"],
        theory: `
<p>装置の出図は<b>組立図 + 部品図のセット</b>です。</p>
<ul>
  <li>組立図: 全体の組み方、部品表 (品番・品名・数量・材質)、風船、据付け寸法</li>
  <li>部品図: 部品ごとの加工寸法・公差 (架台は溶接・切断、ステージは平面度)</li>
  <li>図番体系: EQ-100 (組立) / EQ-101〜 (部品) — 部品表の品番と一致させる</li>
</ul>`,
        setup: { kind: "assembly", make: equipmentAssemblyStarter },
        steps: [
          { text: "<b>組立</b>タブの <b>図面ビュー</b> で組立図を開きます。", tab: "assemble", ui: "asm-drawing", check: (s) => s.env === "drawing" && views(s).length >= 1 },
          { text: "<b>自動風船</b> で部品表の品番どおりに風船を配置します。", tab: "drawing", ui: "dw-autoballoon", check: (s) => annos(s, "balloon").length >= 1 },
          { text: "<b>図面セット</b> で、部品ごとの部品図シート (寸法付き) を一括作成します。", tab: "drawing", ui: "dw-set", check: (s) => sheetCount(s) >= 3, hint: "部品の数だけシートが追加されます (少し時間がかかります)。" },
          { text: "<b>シート設定</b> で表題欄の<b>名称</b>・<b>図番</b> (EQ-100)・<b>材質</b>・<b>設計</b>を埋めます。", tab: "drawing", ui: "dw-sheet", check: titleFilled },
          { text: "<b>モデルに戻る</b> でアセンブリに戻ります。装置設計総合コース修了です!", tab: "drawing", ui: "dw-close", check: (s) => s.env === "assembly" },
        ],
        summary: ["出図は組立図 + 部品図のセット", "風船・部品表・図番を一致させる", "図面セットで部品図を一括作成し、各部品図を仕上げる"],
        quiz: [
          { q: "組立図の部品表の品番と一致させるものは?", choices: ["風船の番号と部品図の図番", "寸法の値", "シートの色"], answer: 0, explain: "風船 → 部品表 → 部品図と、品番でたどれるようにします。" },
          { q: "組立図に書かないのが普通なのは?", choices: ["各部品の加工寸法すべて", "部品表", "据付け寸法"], answer: 0, explain: "加工寸法は部品図に書きます。" },
        ],
        see: ["project-equipment", "assembly-bom", "drawing-check", "equip-spec"],
      },
    ],
  },
];
