// 追加カリキュラム: プロジェクト型コース (小型搬送ユニット) と応用コース
// (モデリング応用・板金応用・検証と品質)。各ステップの check は LearnState の純関数です。
import { newDocument, ORIGIN_PLANES } from "../core/document";
import type { ChamferFeature, ExtrudeFeature, FlangeFeature, HoleFeature, Parameter, PartDocument, RevolveFeature, ShellFeature, SketchFeature } from "../core/types";
import type { AssemblyDocument } from "../assembly/types";
import { sampleDocument, samplePin } from "../samples";
import { ensureSheetStyle } from "../sheetmetal/sheet";
import { annos, count, dims, drawing, editing, features, has, near, sketches, tolDims, userParams, usesUserParam, val, views } from "./checks";
import { blockStarter, plateStarter } from "./starters";
import type { Chapter, Exercise, LearnState } from "./types";

// ---------------------------------------------------------------- starters ---

function builder(doc: PartDocument) {
  let n = 0;
  return (expr: string, owner: string, unit: Parameter["unit"] = "mm"): string => {
    const name = `d${n++}`;
    doc.params.push({ name, expr, unit, kind: "model", owner });
    return name;
  };
}

/** Centred, fully dimensioned rectangle on the XZ (floor) plane. */
function rectSketch(id: string, name: string, w: string, d: string, P: ReturnType<typeof builder>, W: number, D: number): SketchFeature {
  const sk: SketchFeature = {
    id,
    type: "sketch",
    name,
    plane: ORIGIN_PLANES.XZ,
    planeLabel: "XZ 平面",
    entities: [
      { id: "origin", type: "point", x: 0, y: 0, fixed: true, ref: true },
      { id: "a", type: "point", x: -W / 2, y: -D / 2 },
      { id: "b", type: "point", x: W / 2, y: -D / 2 },
      { id: "c", type: "point", x: W / 2, y: D / 2 },
      { id: "d", type: "point", x: -W / 2, y: D / 2 },
      { id: "l1", type: "line", p1: "a", p2: "b" },
      { id: "l2", type: "line", p1: "b", p2: "c" },
      { id: "l3", type: "line", p1: "c", p2: "d" },
      { id: "l4", type: "line", p1: "d", p2: "a" },
    ],
    constraints: [
      { id: "c1", type: "horizontal", refs: ["l1"] },
      { id: "c2", type: "vertical", refs: ["l2"] },
      { id: "c3", type: "horizontal", refs: ["l3"] },
      { id: "c4", type: "vertical", refs: ["l4"] },
    ],
    dimensions: [],
  };
  const pw = P(w, id);
  const pd = P(d, id);
  sk.dimensions.push(
    { id: "D1", type: "length", refs: ["l1"], param: pw, pos: [0, -D / 2 - 10] },
    { id: "D2", type: "length", refs: ["l2"], param: pd, pos: [W / 2 + 12, 0] },
    { id: "D3", type: "hdistance", refs: ["origin", "a"], param: P(`${pw} / 2`, id), pos: [-W / 4, -D / 2 - 20] },
    { id: "D4", type: "vdistance", refs: ["origin", "a"], param: P(`${pd} / 2`, id), pos: [-W / 2 - 14, -D / 4] },
  );
  return sk;
}

/**
 * Base plate of the conveyor unit: 220 × 120 × 10, four Ø9 mounting holes
 * 15 mm in from the edges. 幅 / 奥行 / 板厚 are user parameters that drive it.
 */
export function conveyorPlateStarter(): PartDocument {
  const doc = newDocument("ベースプレート");
  doc.iprops["パーツ番号"] = "CNV-101";
  doc.iprops["説明"] = "小型搬送ユニット ベースプレート";
  doc.material = { name: "鋼", density: 7.85, color: "#b9bec5" };
  doc.params.push(
    { name: "幅", expr: "220", unit: "mm", kind: "user", comment: "プレート幅" },
    { name: "奥行", expr: "120", unit: "mm", kind: "user", comment: "プレート奥行" },
    { name: "板厚", expr: "10", unit: "mm", kind: "user", comment: "プレート板厚" },
  );
  const P = builder(doc);
  doc.features.push(rectSketch("sk1", "スケッチ1", "幅", "奥行", P, 220, 120));
  doc.features.push({ id: "ex1", type: "extrude", name: "押し出し1", sketch: "sk1", profiles: [0], profilePts: [[0, 0]], op: "new", extent: "distance", distance: P("板厚", "ex1"), flip: false });
  const corners: [string, number, number][] = [
    ["h1", -95, -45],
    ["h2", 95, -45],
    ["h3", 95, 45],
    ["h4", -95, 45],
  ];
  const sk2: SketchFeature = {
    id: "sk2",
    type: "sketch",
    name: "スケッチ2",
    plane: ORIGIN_PLANES.XZ,
    planeLabel: "XZ 平面",
    entities: [{ id: "origin", type: "point", x: 0, y: 0, fixed: true, ref: true }, ...corners.map(([id, x, y]) => ({ id, type: "point" as const, x, y }))],
    constraints: [],
    dimensions: [],
  };
  corners.forEach(([id, x, y], i) => {
    sk2.dimensions.push(
      { id: `H${i}`, type: "hdistance", refs: ["origin", id], param: P("幅 / 2 - 15", "sk2"), pos: [x / 2, y + Math.sign(y) * 10] },
      { id: `V${i}`, type: "vdistance", refs: ["origin", id], param: P("奥行 / 2 - 15", "sk2"), pos: [x + Math.sign(x) * 12, y / 2] },
    );
  });
  doc.features.push(sk2);
  doc.features.push({
    id: "ho1",
    type: "hole",
    name: "穴1",
    sketch: "sk2",
    points: [],
    holeType: "simple",
    diameter: P("9", "ho1"),
    depth: P("板厚", "ho1"),
    through: true,
    cbDiameter: P("14", "ho1"),
    cbDepth: P("5", "ho1"),
    csDiameter: P("16", "ho1"),
    csAngle: P("90", "ho1", "deg"),
    flip: true,
  });
  doc.endOfPart = doc.features.length;
  return doc;
}

/** Bearing bracket of the unit (the sample bracket, renamed). */
export function conveyorBracketStarter(): PartDocument {
  const doc = sampleDocument();
  doc.name = "軸受ブラケット";
  doc.iprops["パーツ番号"] = "CNV-102";
  doc.iprops["説明"] = "小型搬送ユニット 軸受ブラケット";
  return doc;
}

/** Sheet-metal motor tray: 100 × 60 base face (t2) with flanges on the two long edges. */
export function sheetTrayStarter(): PartDocument {
  const doc = newDocument("モーター受け板金");
  doc.iprops["パーツ番号"] = "CNV-103";
  doc.iprops["説明"] = "小型搬送ユニット モーター受け";
  ensureSheetStyle(doc);
  const P = builder(doc);
  doc.features.push(rectSketch("sk1", "スケッチ1", "100", "60", P, 100, 60));
  doc.features.push({ id: "sf1", type: "sheetFace", name: "面1", sketch: "sk1", profiles: [0], profilePts: [[0, 0]], op: "new", flip: false });
  doc.features.push({ id: "fl1", type: "flange", name: "フランジ1", base: "sf1", edges: [[0, -30], [0, 30]], height: P("20", "fl1"), angle: P("90", "fl1", "deg"), down: false });
  doc.endOfPart = doc.features.length;
  return doc;
}

/** Conveyor sub-assembly: grounded base plate, loose bearing bracket and roller shaft, no constraints. */
export function conveyorAssemblyStarter(): AssemblyDocument {
  const plate = conveyorPlateStarter();
  const bracket = conveyorBracketStarter();
  const shaft = samplePin();
  shaft.name = "ローラ軸";
  shaft.iprops["パーツ番号"] = "CNV-104";
  shaft.iprops["説明"] = "小型搬送ユニット ローラ軸";
  const I = (x: number, y: number, z: number) => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1];
  return {
    format: "3dcad-assembly",
    version: 1,
    name: "小型搬送ユニット",
    parts: [
      { id: "p-plate", name: plate.name, kind: "part", doc: plate },
      { id: "p-bracket", name: bracket.name, kind: "part", doc: bracket },
      { id: "p-shaft", name: shaft.name, kind: "part", doc: shaft },
    ],
    components: [
      { id: "c1", name: "ベースプレート:1", partId: "p-plate", matrix: I(0, 0, 0), grounded: true },
      { id: "c2", name: "軸受ブラケット:1", partId: "p-bracket", matrix: I(0, 60, 0), grounded: false },
      { id: "c3", name: "ローラ軸:1", partId: "p-shaft", matrix: I(140, 90, 0), grounded: false },
    ],
    constraints: [],
    params: [],
    iprops: { パーツ番号: "CNV-100", 説明: "小型搬送ユニット", 設計者: "", 作成日: new Date().toISOString().slice(0, 10) },
  };
}

// ------------------------------------------------------------------ helpers ---

const inSketch = (s: LearnState) => !!editing(s);
const hasUser = (s: LearnState, name: string) => userParams(s).some((p) => p.name === name);
const paramExprHas = (s: LearnState, param: string | undefined, re: RegExp) => !!param && s.part.params.some((p) => p.name === param && re.test(p.expr));
const titleFilled = (s: LearnState) => {
  const t = drawing(s)?.title;
  return !!t && [t.title, t.number, t.material, t.designer].every((x) => !!x?.trim());
};
const activeAsm = (s: LearnState, type: string) => s.asm.constraints.some((c) => c.type === type && !c.suppressed);
const anyPartHas = (s: LearnState, type: string) => s.part.features.some((f) => f.type === type) || s.asm.parts.some((p) => p.doc?.features.some((f) => f.type === type));

// --------------------------------------------------------------- curriculum ---

export const CURRICULUM2: Chapter[] = [
  // ------------------------------------------------------------ project ---
  {
    id: "project-conveyor",
    title: "プロジェクト: 小型搬送ユニットを設計する",
    desc: "ローラ 1 本で小物を送る小型搬送ユニットを、要求仕様 → 構想 → 部品設計 → 組立 → 強度確認 → 図面 → 製造データまで一気通貫で設計します。実務の設計の流れを体験するプロジェクト型コースです。",
    lessons: [
      {
        id: "P-1",
        title: "要求仕様と構想レイアウト",
        minutes: 15,
        level: 2,
        goals: ["要求仕様を数値で書ける", "主要寸法をユーザ パラメータにできる", "構想レイアウトをスケッチで描ける"],
        theory: `
<p>設計は<b>要求仕様</b>から始まります。「何を・どれだけ・どんな条件で」を<b>数値</b>で決めておかないと、後で良し悪しを判断できません。</p>
<table class="ln-table">
  <tr><th>項目</th><th>要求</th></tr>
  <tr><td>搬送物</td><td>幅 80 mm 以下の小箱、1 個 2 kg まで</td></tr>
  <tr><td>搬送幅</td><td>100 mm (ローラ有効長)</td></tr>
  <tr><td>ローラ</td><td>直径 30 mm、両端を玉軸受で支持</td></tr>
  <tr><td>設置</td><td>ベースプレートを M8 ボルト 4 本で架台に固定</td></tr>
  <tr><td>駆動</td><td>小型ギヤードモーターを板金ブラケットで取付</td></tr>
</table>
<p><b>構想</b>では、部品の配置と主要寸法を 1 枚のレイアウト スケッチにまとめます。主要寸法は<b>ユーザ パラメータ</b>にしておくと、後で仕様が変わっても全体が追従します (トップダウン設計)。</p>`,
        setup: { kind: "newPart" },
        steps: [
          { text: "<b>パラメータ</b> (fx) を開き、<b>ユーザ パラメータを追加</b> で <code>搬送幅</code> = <code>100</code> を作ります。", tab: "model", ui: "params", check: (s) => hasUser(s, "搬送幅") },
          { text: "同じように <code>ローラ径</code> = <code>30</code> を追加してダイアログを閉じます。", tab: "model", ui: "params", check: (s) => hasUser(s, "ローラ径") },
          { text: "<b>2D スケッチ</b> を <b>XZ 平面</b> (床) に開始します。上から見たレイアウトを描きます。", tab: "model", ui: "sketch", check: inSketch },
          { text: "<b>長方形</b>でベースプレートの外形を、<b>円</b>でローラ軸の位置を描きます (軸を真上から見た位置の目印)。", tab: "sketch", ui: ["sk-rect", "sk-circle"], check: (s) => count(editing(s), "line") >= 4 && count(editing(s), "circle") >= 1 },
          { text: "<b>寸法</b>を付け、長方形の 1 辺の値に式 <code>搬送幅 + 120</code> を、円の直径に <code>ローラ径</code> を入力します。", tab: "sketch", ui: "sk-dimension", check: usesUserParam, hint: "寸法の値の欄には数値だけでなく、パラメータ名を使った式を入力できます。" },
          { text: "<b>スケッチを終了</b> します。仕様を変えたいときは、パラメータを変えるだけでレイアウトが追従します。レッスン完了です。", tab: "sketch", ui: "sk-finish", check: (s) => s.mode === "model" && sketches(s).length >= 1 },
        ],
        summary: ["要求仕様は数値で書く — 判断の基準になる", "主要寸法はユーザ パラメータにまとめる", "構想レイアウトで配置と干渉を先に確認する"],
        quiz: [
          { q: "要求仕様を数値で書く一番の理由は?", choices: ["見栄えがよい", "設計の良し悪しを客観的に判定できる", "CAD が数値しか受け付けない"], answer: 1, explain: "「十分に強い」ではなく「2 kg で安全率 3 以上」と書けば、検証で合否を判定できます。" },
          { q: "主要寸法をユーザ パラメータにする利点は?", choices: ["ファイルが軽くなる", "仕様変更が 1 か所の修正で全体に反映される", "図面が不要になる"], answer: 1, explain: "設計意図をパラメータに集めておくと、変更に強いモデルになります。" },
        ],
        see: ["design-process", "concept", "layout-design", "3d-topdown"],
      },
      {
        id: "P-2",
        title: "ベースプレート — パラメトリックな部品",
        minutes: 20,
        level: 2,
        goals: ["ユーザ パラメータで駆動するプレートを作れる", "取付穴をパターンで配置できる", "仕様変更でモデルが追従することを確かめられる"],
        theory: `
<p>ベースプレートはユニット全体の基準です。<b>幅・奥行・板厚</b>をユーザ パラメータにし、スケッチ寸法と押し出し距離をパラメータの式で決めます。</p>
<ul>
  <li>外形: 幅 220 × 奥行 120 × 板厚 10 (鋼)</li>
  <li>取付穴: M8 用キリ穴 Ø9 を 4 隅に (縁から 15 mm)</li>
</ul>
<p class="ln-note">穴は 1 つ作って<b>矩形状パターン</b>または<b>ミラー</b>で並べると、穴径の変更が 1 か所で済みます。</p>`,
        setup: { kind: "newPart" },
        steps: [
          { text: "<b>パラメータ</b> で、ユーザ パラメータ <code>幅</code> = <code>220</code>、<code>奥行</code> = <code>120</code>、<code>板厚</code> = <code>10</code> を作ります。", tab: "model", ui: "params", check: (s) => ["幅", "奥行", "板厚"].every((n) => hasUser(s, n)) },
          { text: "<b>XZ 平面</b>に<b>長方形</b>を描き、寸法の値を <code>幅</code> と <code>奥行</code> にしてスケッチを終了します。", tab: "model", ui: ["sketch", "sk-rect", "sk-dimension", "sk-finish"], check: (s) => s.mode === "model" && usesUserParam(s) && sketches(s).some((k) => count(k, "line") >= 4) },
          { text: "<b>押し出し</b>で、距離に <code>板厚</code> と入力して OK。", tab: "model", ui: "extrude", check: (s) => has<ExtrudeFeature>(s, "extrude", (f) => f.op !== "cut" && paramExprHas(s, f.distance, /板厚/)), hint: "距離の欄にパラメータ名を入力すると式になります。" },
          { text: "<b>穴</b> で上面の角の近くに Ø<code>9</code> の貫通穴を 1 つあけます。", tab: "model", ui: "hole", check: (s) => has<HoleFeature>(s, "hole") },
          { text: "<b>矩形状</b>パターン (2 × 2) または <b>ミラー</b> で、穴を 4 隅にそろえます。", tab: "model", ui: ["rectPattern", "mirror"], check: (s) => has(s, "rectPattern") || has(s, "mirror", undefined, 1) },
          { text: "画面左上の<b>材料</b>で <b>鋼</b> を選びます。", ui: ".qat-field", check: (s) => s.part.material.name === "鋼" },
          { text: "仕様変更です: <b>パラメータ</b> で <code>幅</code> を <code>260</code> に変えます。プレートが伸びることを確かめましょう。レッスン完了です。", tab: "model", ui: "params", check: (s) => near(s.values.get("幅"), 260) },
        ],
        summary: ["基準部品は寸法をユーザ パラメータで駆動する", "穴は 1 つ作ってパターン・ミラーで並べる", "仕様変更をパラメータで試し、モデルが壊れないか確かめる"],
        quiz: [
          { q: "取付穴を 1 つ作って矩形状パターンで並べる利点は?", choices: ["穴が深くなる", "穴径を変えるとき 1 か所の修正で済む", "質量が軽くなる"], answer: 1, explain: "元の穴を変えるとパターンのコピーもすべて変わります。" },
          { q: "押し出し距離に <code>板厚</code> と入力したら?", choices: ["板厚パラメータに追従する", "エラーになる", "10 に固定される"], answer: 0, explain: "式として保存され、板厚を変えると押し出し距離も変わります。" },
        ],
        see: ["3d-robust", "dfm-machining", "fastening"],
      },
      {
        id: "P-3",
        title: "モーターブラケット — 板金で作る",
        minutes: 20,
        level: 2,
        goals: ["板金の面とフランジでブラケットを作れる", "モーター軸の穴を切り抜ける", "展開パターンを確認できる"],
        theory: `
<p>モーターは薄い<b>板金ブラケット</b>で支えます。切削よりも安く、軽く作れます。</p>
<ul>
  <li><b>面</b>: 板厚一定の平板 (ここでは 100 × 60、t2)</li>
  <li><b>フランジ</b>: 縁を 90° 曲げて剛性を上げ、取付面を作る</li>
  <li><b>切り抜き</b>: モーター軸と取付ねじの穴</li>
</ul>
<p class="ln-note">板金の穴は曲げ線から<b>板厚の 2 倍以上</b>離します。近すぎると曲げで穴が変形します。</p>`,
        setup: { kind: "newPart" },
        steps: [
          { text: "<b>XZ 平面</b>に原点中心の 100 × 60 の<b>長方形</b>を描いて終了します。", tab: "model", ui: ["sketch", "sk-rect", "sk-finish"], check: (s) => s.mode === "model" && sketches(s).some((k) => count(k, "line") >= 4) },
          { text: "<b>板金</b>タブの <b>面</b> で長方形を選んで OK。板厚 2 の板ができます。", tab: "sheetmetal", ui: "sheetFace", check: (s) => has(s, "sheetFace") && s.bodies > 0 },
          { text: "<b>フランジ</b> で長い 1 辺を選び、高さ <code>40</code> で OK。モーターを取り付ける立ち上がり面になります。", tab: "sheetmetal", ui: "flange", check: (s) => has<FlangeFeature>(s, "flange", (f) => f.edges.length >= 1) },
          { text: "フランジの外側の面に<b>2D スケッチ</b>を開始し、Ø<code>22</code> 程度の<b>円</b> (モーターのインロー) を描いて終了します。", tab: "model", ui: ["sketch", "sk-circle", "sk-finish"], check: (s) => s.mode === "model" && sketches(s).some((k) => count(k, "circle") >= 1) },
          { text: "<b>板金</b>タブの <b>切り抜き</b> で円の内側を選び、板を貫通させて OK。", tab: "sheetmetal", ui: "sm-cut", check: (s) => has<ExtrudeFeature>(s, "extrude", (f) => f.op === "cut"), hint: "距離を板厚以上 (または「すべて」) にすると確実に抜けます。" },
          { text: "<b>展開パターン</b> を開き、曲げる前の形と展開寸法を確認します。レッスン完了です。", tab: "sheetmetal", ui: "sm-flat" },
        ],
        summary: ["板金は 面 → フランジ → 切り抜き の順で作る", "穴は曲げ線から離す", "展開パターンがレーザー加工のデータになる"],
        quiz: [
          { q: "板金の穴を曲げ線のすぐ近くに置くと?", choices: ["強くなる", "曲げで穴が変形する", "展開できなくなる"], answer: 1, explain: "曲げの変形域にかかると穴がつぶれたり伸びたりします。板厚の 2 倍以上離すのが目安です。" },
          { q: "モーターブラケットに板金を選ぶ主な理由は?", choices: ["軽く安く作れる", "必ず切削より高精度", "溶接が不要になるから"], answer: 0, explain: "薄板の曲げ加工は材料・加工時間ともに少なく、量産に向きます。" },
        ],
        see: ["dfm-sheet", "press-sheet-detail", "motors"],
      },
      {
        id: "P-4",
        title: "ローラ軸 — 回転で作る旋削部品",
        minutes: 18,
        level: 2,
        goals: ["回転フィーチャで段付き軸を作れる", "面取り・ねじで旋削部品を仕上げられる"],
        theory: `
<p>ローラや軸のような<b>回転体</b>は、半断面をスケッチして<b>回転</b>で作ります。旋盤で削る形と同じ考え方です。</p>
<ul>
  <li>中央: ローラ部 Ø30 × 100 (搬送幅)</li>
  <li>両端: 軸受 (6000 番台) をはめる段 Ø10</li>
  <li>端部: 面取り C0.5、片側にモーター連結用のねじ</li>
</ul>
<p class="ln-note">段の角 (入隅) には応力集中を避けるため小さな R を付け、軸受の当たる面は直角に保ちます。</p>`,
        setup: { kind: "newPart" },
        steps: [
          { text: "<b>2D スケッチ</b>を <b>XY 平面</b>に開始し、X 軸を中心線として段付き軸の<b>上半分の断面</b>を<b>線分</b>で閉じた形に描きます。", tab: "model", ui: ["sketch", "sk-line"], check: (s) => count(editing(s), "line") >= 6, hint: "中心線 (X 軸上の線) も輪郭の一部として描きます。段が 2 つ以上ある形にしましょう。" },
          { text: "<b>寸法</b>で直径 (半径) と長さを決め、<b>スケッチを終了</b>します。", tab: "sketch", ui: ["sk-dimension", "sk-finish"], check: (s) => s.mode === "model" && sketches(s).some((k) => count(k, "line") >= 6) },
          { text: "<b>回転</b>で断面を選び、軸に中心線 (X 軸上の辺) を選んで 360° 回転します。", tab: "model", ui: "revolve", check: (s) => has<RevolveFeature>(s, "revolve") },
          { text: "<b>面取り</b>で両端の外周エッジに C<code>0.5</code> を付けます。", tab: "model", ui: "chamfer", check: (s) => has<ChamferFeature>(s, "chamfer") },
          { text: "<b>ねじ</b>で片側の細い円筒面を選び、おねじ (例 M10) を設定します。", tab: "model", ui: "thread", check: (s) => has(s, "thread") },
          { text: "材料を <b>鋼</b> にします。レッスン完了です。", ui: ".qat-field", check: (s) => s.part.material.name === "鋼" },
        ],
        summary: ["回転体は半断面 + 回転で作る", "段の入隅は R、軸受の当たり面は直角", "ねじ・面取りで旋削部品として仕上げる"],
        quiz: [
          { q: "段付き軸をモデリングする最も自然な方法は?", choices: ["直方体を削る", "半断面を回転する", "円を何度も押し出して接合する"], answer: 1, explain: "旋盤加工と同じく、半断面を軸まわりに回転させるのが簡単で修正もしやすい方法です。" },
          { q: "軸の段の入隅に小さな R を付ける理由は?", choices: ["見た目", "応力集中を下げる", "軽量化"], answer: 1, explain: "鋭い入隅は応力集中の原因になり、疲労破壊の起点になります。" },
        ],
        see: ["bearings", "dfm-machining", "keys"],
      },
      {
        id: "P-5",
        title: "ユニットの組立 — 拘束と標準部品",
        minutes: 20,
        level: 2,
        goals: ["部品を拘束で組み付けられる", "標準部品 (ボルト・軸受) を追加できる", "干渉と部品表を確認できる"],
        theory: `
<p>ここまでの部品を<b>アセンブリ</b>にまとめます。ベースプレートは<b>接地</b>済み、軸受ブラケットとローラ軸は自由に動く状態です。</p>
<ul>
  <li><b>メイト / フラッシュ</b>: ブラケットの底面をプレートの上面に合わせる</li>
  <li><b>挿入</b>: 軸をブラケットの穴に入れる (軸まわりの回転は残す)</li>
  <li><b>標準部品</b>: 固定ボルト・軸受を規格サイズで配置</li>
</ul>
<p class="ln-note">回転するローラ軸は回転の自由度を<b>わざと残す</b>のがポイントです。</p>`,
        setup: { kind: "assembly", make: conveyorAssemblyStarter },
        steps: [
          { text: "<b>メイト</b> 拘束で、ブラケットの<b>底面</b>とプレートの<b>上面</b>を順にクリックして OK。ブラケットがプレートに載ります。", tab: "assemble", ui: "asm-mate", check: (s) => activeAsm(s, "mate") || activeAsm(s, "flush"), hint: "ビューを回して、ブラケットの底面を選びます。" },
          { text: "<b>挿入</b> 拘束で、ブラケットのボスの穴の円形エッジと、ローラ軸の段の円形エッジを選んで OK。", tab: "assemble", ui: "asm-insert", check: (s) => activeAsm(s, "insert") },
          { text: "<b>標準部品</b> から <b>六角穴付きボルト</b> M8 や <b>軸受</b> を選んで、2 個以上配置します。", tab: "assemble", ui: "asm-library", check: (s) => s.asm.components.length >= 5, hint: "種類と呼び径を選んで「配置」を押します。" },
          { text: "<b>干渉解析</b> で、部品同士がめり込んでいないか確認します。", tab: "assemble", ui: "asm-interf" },
          { text: "<b>部品表</b> を開き、部品番号 (CNV-…) と数量を確認します。レッスン完了です。", tab: "assemble", ui: "asm-bom" },
        ],
        summary: ["基準部品を接地し、ほかは拘束で位置決め", "回転する部品は回転の自由度を残す", "ボルト・軸受は標準部品を使い、干渉と部品表で確認"],
        quiz: [
          { q: "軸を穴に組み付けて、軸まわりの回転だけ残す拘束は?", choices: ["挿入", "剛体", "角度"], answer: 0, explain: "挿入は軸の一致 + 面の一致で、軸まわりの回転が残ります。" },
          { q: "ボルトや軸受をモデリングせずに標準部品を使う利点は?", choices: ["寸法が規格どおりで、部品表に正しく載る", "質量がゼロになる", "干渉しなくなる"], answer: 0, explain: "規格品は形状・呼びが正確で、購入品として部品表に載せられます。" },
        ],
        see: ["bearings", "bolt-joint", "assembly-bom", "dfa"],
      },
      {
        id: "P-6",
        title: "強度確認 — 軸受ブラケットの応力解析",
        minutes: 15,
        level: 3,
        goals: ["固定と荷重を設定して応力解析を実行できる", "安全率から寸法を見直せる"],
        theory: `
<p>搬送物 2 kg と衝撃を見込んで、ブラケット 1 個あたり <b>1000 N</b> の荷重で確認します (余裕を大きく見た値)。</p>
<pre>安全率 = 降伏応力 ÷ 最大応力   目安: 2〜3 以上</pre>
<p>安全率が足りなければ<b>板厚</b>を上げる・<b>フィレット</b>で角を丸める・リブで補強する、などで対策し、<b>再解析</b>します。設計 → 検証 → 修正のループです。</p>`,
        setup: { kind: "part", make: conveyorBracketStarter },
        steps: [
          { text: "<b>検査</b>タブの <b>応力解析</b> を開きます。", tab: "inspect", ui: "stress", check: (s) => s.command === "stress" },
          { text: "<b>固定拘束</b>で <b>底面を追加</b>、<b>荷重面</b>を押して <b>上面を追加</b> (ボスの上面) し、力 1000 N で <b>解析を実行</b> します。", tab: "inspect", ui: "stress", check: (s) => s.analysisDone, hint: "条件のボタンを押してアクティブにしてから、クイック選択ボタンを押します。" },
          { text: "<b>安全率</b>の表示に切り替えて最小値を記録し、パネルを閉じます。", tab: "inspect", check: (s) => s.command === null },
          { text: "<b>パラメータ</b> で <code>板厚</code> を <code>12</code> に上げます。", tab: "model", ui: "params", check: (s) => near(s.values.get("板厚"), 12) },
          { text: "もう一度 <b>応力解析</b> を同じ条件で実行し、安全率が上がったことを確かめます。レッスン完了です。", tab: "inspect", ui: "stress", check: (s) => s.analysisDone && near(s.values.get("板厚"), 12) },
        ],
        summary: ["荷重は余裕を見て設定する", "安全率で合否を判断する", "パラメータで寸法を変えて再解析 — 設計と検証のループ"],
        quiz: [
          { q: "降伏応力 240 MPa、最大応力 60 MPa のときの安全率は?", choices: ["0.25", "4", "180"], answer: 1, explain: "240 ÷ 60 = 4 です。" },
          { q: "安全率が不足したときの対策として適切でないのは?", choices: ["板厚を上げる", "入隅にフィレットを付ける", "荷重条件を小さく書き換える"], answer: 2, explain: "条件を都合よく変えても実物は強くなりません。形状・材料で対策します。" },
        ],
        see: ["stress", "fea-practice", "safety", "bending"],
      },
      {
        id: "P-7",
        title: "ベースプレートの図面 — 寸法・公差・表題欄",
        minutes: 18,
        level: 2,
        goals: ["部品図に寸法と公差を記入できる", "表題欄を埋めて出図できる状態にする"],
        theory: `
<p>製作を依頼するには<b>部品図</b>が必要です。図面には、形 (投影図)・大きさ (寸法)・ばらつきの許容 (公差)・材料と管理情報 (表題欄) を書きます。</p>
<ul>
  <li>取付穴の位置は架台の穴と合うよう <b>±0.1</b> 程度の公差を指示</li>
  <li>個別に書かない寸法は<b>普通公差</b> (JIS B 0405-m) で一括指示</li>
  <li>表題欄: 名称・図番 (CNV-101)・材料 (SS400)・設計者</li>
</ul>`,
        setup: { kind: "part", make: conveyorPlateStarter },
        steps: [
          { text: "<b>管理</b>タブの <b>図面ビュー</b> で図面環境を開きます。", tab: "manage", ui: "drawing", check: (s) => s.env === "drawing" && views(s).length >= 1 },
          { text: "<b>自動寸法</b> で外形と穴位置の寸法を記入し、足りない寸法は <b>寸法</b> で追加します (3 個以上)。", tab: "drawing", ui: ["dw-autodim", "dw-dim"], check: (s) => s.env === "drawing" && dims(s).length >= 3 },
          { text: "穴の位置寸法をダブルクリックし、公差の種類を <b>±</b> にして <code>0.1</code> を入力します。", tab: "drawing", check: (s) => tolDims(s).length >= 1, hint: "寸法の文字をダブルクリックすると編集画面が開きます。" },
          { text: "<b>シート設定</b> で表題欄の<b>名称</b>・<b>図番</b>・<b>材料</b>・<b>設計者</b>と<b>普通公差</b>を埋めます。", tab: "drawing", ui: "dw-sheet", check: (s) => titleFilled(s) && !!drawing(s)?.title.generalTol.trim() },
          { text: "<b>モデルに戻る</b> で 3D に戻ります。レッスン完了です。", tab: "drawing", ui: "dw-close", check: (s) => s.env === "part" },
        ],
        summary: ["部品図 = 投影図 + 寸法 + 公差 + 表題欄", "はまり合い・位置が大事な寸法だけ個別公差", "それ以外は普通公差で一括指示"],
        quiz: [
          { q: "すべての寸法に個別の公差を書く代わりに使う指示は?", choices: ["普通公差", "参考寸法", "仕上げ記号"], answer: 0, explain: "表題欄などに普通公差 (例: JIS B 0405-m) を書けば、個別指示のない寸法に適用されます。" },
          { q: "表題欄の図番の役割は?", choices: ["図面と部品を一意に識別する", "印刷の順番", "設計者の社員番号"], answer: 0, explain: "図番で図面・部品・部品表・改訂が結びつきます。" },
        ],
        see: ["dimensioning", "tolerance", "drawing-format"],
      },
      {
        id: "P-8",
        title: "製造データの出力と版管理",
        minutes: 12,
        level: 2,
        goals: ["出図する版を記録できる", "STEP・DXF・PDF を用途に合わせて書き出せる"],
        theory: `
<p>設計の最後は<b>製造データ</b>の出力です。外注先には<b>PDF の図面 (正式な指示) + STEP (3D 形状)</b>、レーザー加工には <b>DXF</b> を渡します。</p>
<p>出図した時点の状態を<b>版 (改訂記号)</b>として記録しておくと、後で変更したときに「どの版で作ったか」を追跡できます。</p>`,
        setup: { kind: "part", make: conveyorPlateStarter },
        steps: [
          { text: "<b>管理</b>タブの <b>改訂履歴</b> を開き、出図版 <b>A</b> として記録します。", tab: "manage", ui: "revisions", check: (s) => (s.part.revisions?.length ?? 0) >= 1 },
          { text: "<b>STEP 書き出し</b> で 3D データを保存します (外注先の CAM・検査用)。", tab: "manage", ui: "export-step" },
          { text: "<b>図面ビュー</b> を開き、<b>シート設定</b> で表題欄 (名称・図番・材料・設計者) を埋めます。", tab: "manage", ui: ["drawing", "dw-sheet"], check: (s) => s.env === "drawing" && titleFilled(s) },
          { text: "<b>DXF</b> (外形のレーザー切断用) と <b>PDF</b> (正式図面) を書き出します。", tab: "drawing", ui: ["dw-dxf", "dw-pdf"] },
          { text: "<b>モデルに戻る</b> で 3D に戻ります。小型搬送ユニットのプロジェクト修了です。おつかれさまでした!", tab: "drawing", ui: "dw-close", check: (s) => s.env === "part" },
        ],
        summary: ["外注は PDF 図面 + STEP が基本", "板の外形は DXF でレーザー加工へ", "出図した状態は版として記録する"],
        quiz: [
          { q: "外注先に渡す正式な指示書として基本になるのは?", choices: ["PDF の図面", "STL", "スクリーンショット"], answer: 0, explain: "公差・材料・処理などの指示は図面に書かれます。3D は STEP で補足します。" },
          { q: "出図時に版を記録する理由は?", choices: ["ファイルを圧縮するため", "どの版で製作したかを追跡するため", "図面を自動で描くため"], answer: 1, explain: "設計変更後も、現品がどの版に基づくかがわかります。" },
        ],
        see: ["2d-data", "3d-data-management", "design-change"],
      },
    ],
  },
  // ------------------------------------------------------- modeling-plus ---
  {
    id: "modeling-plus",
    title: "応用: モデリングの技を増やす",
    desc: "シェル・勾配・リブ・穴の種類・ねじ・ミラーを組み合わせて、成形品や機械部品らしい形を効率よく作ります。",
    lessons: [
      {
        id: "M-1",
        title: "シェルと抜き勾配 — 成形品の基本",
        minutes: 12,
        level: 2,
        goals: ["シェルで一定肉厚のケースを作れる", "勾配で側面に抜き勾配を付けられる"],
        theory: `
<p>樹脂成形品は<b>一定の肉厚</b>で作り、型から抜けるよう側面に<b>抜き勾配</b> (0.5〜2°) を付けます。</p>
<ul>
  <li><b>シェル</b>: 開口面を取り除き、内側を指定の肉厚でくり抜く</li>
  <li><b>勾配</b>: 固定面 (中立面) を基準に、選んだ面を指定角度だけ傾ける</li>
</ul>`,
        setup: { kind: "part", make: blockStarter },
        steps: [
          { text: "<b>勾配</b> を開き、固定面に<b>底面</b>、傾ける面に<b>側面 4 つ</b>を選んで角度 <code>2</code>° で OK。", tab: "model", ui: "draft", check: (s) => has(s, "draft"), hint: "固定面の位置では寸法が変わらず、そこから離れるほど面が傾きます。" },
          { text: "<b>シェル</b> で<b>上面</b>を開口面に選び、厚さ <code>2</code> で OK。", tab: "model", ui: "shell", check: (s) => has<ShellFeature>(s, "shell", (f) => f.faces.length >= 1) },
          { text: "<b>断面図</b> で肉厚が一定で、側面が傾いていることを確認します。レッスン完了です。", tab: "view", ui: "section", check: (s) => s.section },
        ],
        summary: ["成形品は一定肉厚 — シェルで作る", "側面には抜き勾配 (0.5〜2°)", "勾配 → シェルの順だと内面にも勾配が付く"],
        quiz: [
          { q: "樹脂成形品の側面に抜き勾配を付ける理由は?", choices: ["型から製品を抜きやすくする", "強度を上げる", "色をきれいにする"], answer: 0, explain: "勾配がないと型との摩擦で抜けにくく、傷や変形の原因になります。" },
          { q: "肉厚を一定にする主な理由は?", choices: ["ひけ・そりを防ぐ", "重くするため", "CAD の制約"], answer: 0, explain: "肉厚が不均一だと冷却差でひけ・そりが出ます。" },
        ],
        see: ["molded-design", "dfm-molding"],
      },
      {
        id: "M-2",
        title: "リブで補強する",
        minutes: 12,
        level: 2,
        goals: ["スケッチの線分からリブを作れる", "リブの厚さの目安がわかる"],
        theory: `
<p>薄肉のケースは<b>リブ</b>で剛性を上げます。肉厚を増やすより軽く、ひけも出にくい方法です。</p>
<ul>
  <li>リブの厚さは本体肉厚の <b>50〜70 %</b> (ひけ防止)</li>
  <li>高さは肉厚の 3 倍程度まで、根元には小さな R</li>
</ul>`,
        setup: { kind: "part", make: blockStarter },
        steps: [
          { text: "<b>シェル</b> で<b>上面</b>を開口面にし、厚さ <code>2</code> で箱にします。", tab: "model", ui: "shell", check: (s) => has<ShellFeature>(s, "shell", (f) => f.faces.length >= 1) },
          { text: "<b>2D スケッチ</b>を箱の中央を通る <b>XY 平面</b>に開始し、内側の壁から壁へ<b>線分</b>を 1 本描いて終了します。", tab: "model", ui: ["sketch", "sk-line", "sk-finish"], check: (s) => s.mode === "model" && sketches(s).length >= 2 },
          { text: "<b>リブ</b> で線分を選び、厚さ <code>1.2</code> で OK。線分とボディの間が埋まります。", tab: "model", ui: "rib", check: (s) => has(s, "rib"), hint: "向きが逆なら「反転」を押します。" },
          { text: "<b>断面図</b> でリブが底と壁につながっていることを確認します。レッスン完了です。", tab: "view", ui: "section", check: (s) => s.section },
        ],
        summary: ["剛性は肉厚よりリブで上げる", "リブ厚は肉厚の 50〜70 %", "根元の R で応力集中とひけを抑える"],
        quiz: [
          { q: "肉厚 2 mm のケースのリブの厚さとして適切なのは?", choices: ["1.2 mm", "2 mm", "4 mm"], answer: 0, explain: "肉厚の 50〜70 % が目安です。厚すぎると表面にひけが出ます。" },
          { q: "リブで補強する利点は?", choices: ["軽く剛性を上げられる", "必ず安くなる", "勾配が不要になる"], answer: 0, explain: "断面二次モーメントを効率よく増やせます。" },
        ],
        see: ["molded-design", "stiffness-shape"],
      },
      {
        id: "M-3",
        title: "穴の種類・ねじ・ミラー",
        minutes: 15,
        level: 2,
        goals: ["座ぐり穴に変更できる", "ミラーで対称にコピーできる", "めねじを設定できる"],
        theory: `
<table class="ln-table">
  <tr><th>穴の種類</th><th>用途</th></tr>
  <tr><td>キリ穴 (単純穴)</td><td>ボルトを通すだけ</td></tr>
  <tr><td>座ぐり穴</td><td>六角穴付きボルトの頭を沈める</td></tr>
  <tr><td>皿穴</td><td>皿ねじの頭を面一にする</td></tr>
  <tr><td>ねじ穴 (タップ)</td><td>相手部品のボルトを受ける</td></tr>
</table>
<p>対称な形は<b>ミラー</b>で作ると、元を直すだけで両方が変わります。</p>`,
        setup: { kind: "part", make: plateStarter },
        steps: [
          { text: "ブラウザの <b>穴1</b> をダブルクリックして編集し、種類を <b>座ぐり</b> に変えて OK。", tab: "model", ui: "hole", check: (s) => has<HoleFeature>(s, "hole", (f) => f.holeType === "counterbore") },
          { text: "<b>ミラー</b> で <b>穴1</b> を選び、対称面 <b>YZ</b> で OK。反対側に同じ座ぐり穴ができます。", tab: "model", ui: "mirror", check: (s) => has(s, "mirror") },
          { text: "<b>ねじ</b> で穴の内側の円筒面を選び、めねじを設定します (座ぐり穴をねじ穴として使う練習)。", tab: "model", ui: "thread", check: (s) => has(s, "thread") },
          { text: "<b>パラメータ</b> で穴1 の直径を変えると、ミラーのコピーも変わることを確認しましょう。レッスン完了です。", tab: "model", ui: "params", check: (s) => s.part.features.some((f) => f.type === "hole" && !near(val(s, (f as HoleFeature).diameter), 9)) },
        ],
        summary: ["穴は用途で種類を選ぶ", "対称形状はミラーで作り修正を 1 か所に", "ねじはねじ山を作らず「ねじ」属性で表現する"],
        quiz: [
          { q: "六角穴付きボルトの頭を面より下に沈めたい。穴の種類は?", choices: ["座ぐり穴", "皿穴", "単純穴"], answer: 0, explain: "円筒形の座ぐりに頭を沈めます。皿穴は皿ねじ用です。" },
          { q: "ミラーで作る利点は?", choices: ["元を修正すると対称側も変わる", "質量が半分になる", "穴が深くなる"], answer: 0, explain: "元フィーチャとの関連が保たれます。" },
        ],
        see: ["fastening", "3d-feature-choice"],
      },
    ],
  },
  // ------------------------------------------------------ sheetmetal-plus ---
  {
    id: "sheetmetal-plus",
    title: "応用: 板金設計",
    desc: "フランジと逃げ、板厚と曲げ半径、切り抜きと展開、板金部品の図面までを一通り練習します。",
    lessons: [
      {
        id: "S-1",
        title: "トレーを作る — フランジと曲げ逃げ",
        minutes: 15,
        level: 2,
        goals: ["板金スタイルで板厚を設定できる", "4 辺のフランジで箱形にできる", "曲げ逃げの役割がわかる"],
        theory: `
<p>板金の 4 辺を曲げて箱 (トレー) にすると、角で隣のフランジとぶつかります。そこで角に<b>曲げ逃げ (リリーフ)</b> と呼ばれる切り欠きを入れ、材料が裂けたり重なったりしないようにします。</p>
<ul>
  <li>逃げの幅は板厚以上、深さは曲げ半径 + 板厚以上が目安</li>
  <li>このアプリでは隣り合うフランジの角に自動で逃げが入ります</li>
</ul>`,
        setup: { kind: "newPart" },
        steps: [
          { text: "<b>XZ 平面</b>に 120 × 80 の<b>長方形</b>を描いて終了します。", tab: "model", ui: ["sketch", "sk-rect", "sk-finish"], check: (s) => s.mode === "model" && sketches(s).some((k) => count(k, "line") >= 4) },
          { text: "<b>板金</b>タブの <b>面</b> で板にします。", tab: "sheetmetal", ui: "sheetFace", check: (s) => has(s, "sheetFace") && s.bodies > 0 },
          { text: "<b>板金スタイル</b> を開き、板厚を <code>1.6</code> にします (曲げ半径は板厚に追従)。", tab: "sheetmetal", ui: "sm-style", check: (s) => near(s.values.get("板厚"), 1.6) },
          { text: "<b>フランジ</b> で<b>4 辺すべて</b>のエッジを選び、高さ <code>15</code> で OK。角に逃げが入ったトレーになります。", tab: "sheetmetal", ui: "flange", check: (s) => has<FlangeFeature>(s, "flange", (f) => f.edges.length >= 4) || features<FlangeFeature>(s, "flange").reduce((n, f) => n + f.edges.length, 0) >= 4 },
          { text: "角を拡大して、逃げの形を確認します。レッスン完了です。", tab: "view", ui: "home" },
        ],
        summary: ["板厚・曲げ半径は板金スタイルで一括管理", "隣り合うフランジの角には逃げが必要", "逃げは板厚・曲げ半径を目安に決める"],
        quiz: [
          { q: "曲げ逃げ (リリーフ) の目的は?", choices: ["角で材料が裂けたり重なったりするのを防ぐ", "見た目を良くする", "板厚を減らす"], answer: 0, explain: "隣り合う曲げが干渉する角に逃げを入れます。" },
          { q: "板厚を変えると曲げ半径も変わる設定の利点は?", choices: ["板厚に合った曲げ型を選べる", "展開が不要になる", "強度が上がる"], answer: 0, explain: "曲げ半径は板厚に応じた型で決まるため、式でつないでおくと整合します。" },
        ],
        see: ["dfm-sheet", "press-sheet-detail"],
      },
      {
        id: "S-2",
        title: "切り抜きと展開パターン",
        minutes: 12,
        level: 2,
        goals: ["板金に穴を切り抜ける", "フランジ高さを変えて展開寸法の変化を確認できる"],
        theory: `
<p>展開長さは曲げの<b>K 係数</b>で計算されます: 曲げ代 = 角度 × (曲げ半径 + K × 板厚)。フランジ高さを変えると展開形状も変わります。</p>
<p class="ln-note">練習用の板金 (100 × 60、両長辺にフランジ) から始めます。</p>`,
        setup: { kind: "part", make: sheetTrayStarter },
        steps: [
          { text: "板の上面に<b>2D スケッチ</b>を開始し、<b>円</b>を 1 つ描いて終了します。", tab: "model", ui: ["sketch", "sk-circle", "sk-finish"], check: (s) => s.mode === "model" && sketches(s).some((k) => count(k, "circle") >= 1) },
          { text: "<b>板金</b>タブの <b>切り抜き</b> で円の内側を選び、貫通させて OK。", tab: "sheetmetal", ui: "sm-cut", check: (s) => has<ExtrudeFeature>(s, "extrude", (f) => f.op === "cut") },
          { text: "<b>パラメータ</b> で フランジ1 の高さ (値 20) を <code>25</code> にします。", tab: "model", ui: "params", check: (s) => has<FlangeFeature>(s, "flange", (f) => near(val(s, f.height), 25)) },
          { text: "<b>展開パターン</b> を開き、穴と曲げ線の位置、展開寸法を確認します。DXF にも書き出せます。レッスン完了です。", tab: "sheetmetal", ui: "sm-flat" },
        ],
        summary: ["板金の穴は「切り抜き」で", "展開長さは K 係数で決まる", "展開パターンを DXF でレーザー加工へ"],
        quiz: [
          { q: "展開長さの計算に使う係数は?", choices: ["K 係数", "安全率", "ポアソン比"], answer: 0, explain: "K 係数は板厚のうち中立軸の位置 (0〜1) です。" },
          { q: "フランジ高さを上げると展開形状は?", choices: ["大きくなる", "変わらない", "小さくなる"], answer: 0, explain: "曲げた先の長さが増えるので、展開の外形も大きくなります。" },
        ],
        see: ["dfm-sheet", "press-sheet-detail"],
      },
      {
        id: "S-3",
        title: "板金部品の図面",
        minutes: 12,
        level: 2,
        goals: ["板金部品の図面に寸法と曲げの注記を書ける", "表題欄に材料と板厚を書ける"],
        theory: `
<p>板金図面では、外形寸法のほかに<b>曲げ方向・角度・内 R</b> を注記し、材料欄に<b>材質と板厚</b> (例: SPCC t2.0) を書きます。展開図は DXF で別に渡すことが多いです。</p>`,
        setup: { kind: "part", make: sheetTrayStarter },
        steps: [
          { text: "<b>管理</b>タブの <b>図面ビュー</b> で図面環境を開きます。", tab: "manage", ui: "drawing", check: (s) => s.env === "drawing" && views(s).length >= 1 },
          { text: "<b>自動寸法</b> で寸法を記入します。", tab: "drawing", ui: "dw-autodim", check: (s) => s.env === "drawing" && dims(s).length >= 1 },
          { text: "<b>注記</b> で「曲げ 90° 内R2 2 か所」と書き込みます。", tab: "drawing", ui: "dw-note", check: (s) => annos(s, "note").length >= 1 },
          { text: "<b>シート設定</b> で材料欄に「SPCC t2.0」など、名称・図番・設計者も入力します。", tab: "drawing", ui: "dw-sheet", check: titleFilled },
          { text: "<b>DXF</b> を書き出してから <b>モデルに戻る</b> で 3D に戻ります。レッスン完了です。", tab: "drawing", ui: ["dw-dxf", "dw-close"], check: (s) => s.env === "part" },
        ],
        summary: ["曲げは方向・角度・内 R を注記", "材料欄には材質と板厚", "展開図は DXF で渡す"],
        quiz: [
          { q: "板金図面の材料欄に書くべきものは?", choices: ["材質と板厚", "質量だけ", "色だけ"], answer: 0, explain: "SPCC t2.0 のように材質と板厚をセットで指示します。" },
          { q: "曲げ部で指示すべき情報として不要なのは?", choices: ["曲げ角度", "内 R", "CAD のファイル名"], answer: 2, explain: "製作に必要なのは角度・方向・内 R です。" },
        ],
        see: ["fabrication-drawings", "dfm-sheet"],
      },
    ],
  },
  // ------------------------------------------------------- review-quality ---
  {
    id: "review-quality",
    title: "応用: 検証と品質管理",
    desc: "測定・質量特性・干渉・3D プリント適性・公差累積・改訂履歴を使って、出図前に設計を確かめる習慣を身につけます。",
    lessons: [
      {
        id: "Q-1",
        title: "測定と質量特性",
        minutes: 10,
        level: 1,
        goals: ["材料を設定して質量を確認できる", "測定で距離・面積を確かめられる"],
        theory: `
<p>出図前に、<b>質量</b> (運搬・モーター選定) と<b>主要寸法</b>を確かめます。質量は 体積 × 密度 で、材料の設定が正しくないと意味がありません。</p>`,
        setup: { kind: "part", make: conveyorPlateStarter },
        steps: [
          { text: "材料を <b>アルミニウム 6061</b> に変えます (軽量化の検討)。", ui: ".qat-field", check: (s) => s.part.material.name.startsWith("アルミ") },
          { text: "<b>検査</b>タブの <b>iProperties</b> で質量と重心を確認して閉じます。", tab: "inspect", ui: "iprops" },
          { text: "<b>測定</b> を開始し、取付穴の中心間距離や上面の面積を測ります。", tab: "inspect", ui: "measure", check: (s) => s.command === "measure" },
          { text: "<kbd>Esc</kbd> で測定を終了します。レッスン完了です。", check: (s) => s.command === null },
        ],
        summary: ["質量は材料設定が前提", "重心は取付・運搬の検討に使う", "測定で主要寸法を確認してから出図"],
        quiz: [
          { q: "同じ形で鋼 (7.85) からアルミ (2.7) に変えると質量はおよそ?", choices: ["約 1/3", "約 1/2", "変わらない"], answer: 0, explain: "2.7 ÷ 7.85 ≒ 0.34 です。" },
          { q: "質量特性を正しく出すために必須なのは?", choices: ["材料 (密度) の設定", "表示スタイル", "図面"], answer: 0, explain: "質量 = 体積 × 密度 なので材料が必要です。" },
        ],
        see: ["measurement", "materials"],
      },
      {
        id: "Q-2",
        title: "干渉チェックと部品表",
        minutes: 12,
        level: 2,
        goals: ["組立後に干渉を確認できる", "部品表で構成を確認できる"],
        theory: `
<p>部品単体では正しくても、組み合わせると<b>干渉</b> (めり込み) が起きることがあります。拘束で組み付けた後に<b>干渉解析</b>で確かめ、<b>部品表</b>で数量・部品番号の抜けを確認します。</p>`,
        setup: { kind: "assembly", make: conveyorAssemblyStarter },
        steps: [
          { text: "<b>メイト</b> でブラケットの底面をプレートの上面に合わせます。", tab: "assemble", ui: "asm-mate", check: (s) => activeAsm(s, "mate") || activeAsm(s, "flush") },
          { text: "<b>挿入</b> でローラ軸をブラケットの穴に組み付けます。", tab: "assemble", ui: "asm-insert", check: (s) => activeAsm(s, "insert") },
          { text: "<b>干渉解析</b> を実行し、干渉があれば位置や寸法を見直します。", tab: "assemble", ui: "asm-interf" },
          { text: "<b>部品表</b> で部品番号と数量を確認します。レッスン完了です。", tab: "assemble", ui: "asm-bom" },
        ],
        summary: ["組立後は必ず干渉チェック", "はめあい部の意図した重なりと誤りを区別する", "部品表で部品番号・数量の抜けを確認"],
        quiz: [
          { q: "干渉チェックはいつ行う?", choices: ["組み付けた後・出図前", "図面を出した後", "不要"], answer: 0, explain: "出図前に見つければ修正コストが小さく済みます。" },
          { q: "部品表で確認すべきでないのは?", choices: ["部品番号", "数量", "画面の背景色"], answer: 2, explain: "部品番号・数量・材質が調達に必要な情報です。" },
        ],
        see: ["review-checklist", "assembly-bom", "design-review"],
      },
      {
        id: "Q-3",
        title: "3D プリント適性・公差累積・改訂",
        minutes: 15,
        level: 3,
        goals: ["3D プリントのオーバーハングを確認できる", "公差累積でワーストケースを見積もれる", "設計変更を版で記録できる"],
        theory: `
<p>試作を 3D プリントするなら<b>オーバーハング</b>と<b>薄肉</b>を確認します。組立のすき間は<b>公差累積</b>で、ワーストケース (全部が最悪側) と統計的 (RSS) の両方を見積もります。</p>
<pre>ワーストケース = Σ 公差     RSS = √(Σ 公差²)</pre>
<p>変更したら<b>改訂履歴</b>で版を上げて記録します。</p>`,
        setup: { kind: "part", make: conveyorPlateStarter },
        steps: [
          { text: "<b>検査</b>タブの <b>3D プリント</b> を開き、サポートが必要な面を確認します。", tab: "inspect", ui: "printcheck", check: (s) => s.command === "printcheck" },
          { text: "パネルを閉じます。", check: (s) => s.command === null },
          { text: "<b>公差累積</b> を開き、すき間の寸法連鎖 (例: 10 ±0.1、20 ±0.1、−29.5 ±0.2) を入力してワーストケースと RSS を比べます。", tab: "inspect", ui: "tolstack" },
          { text: "<b>改訂履歴</b> で現在の状態を版 <b>A</b> として記録します。", tab: "manage", ui: "revisions", check: (s) => (s.part.revisions?.length ?? 0) >= 1 },
          { text: "<b>パラメータ</b> で <code>板厚</code> を <code>12</code> に変えます。", tab: "model", ui: "params", check: (s) => near(s.values.get("板厚"), 12) },
          { text: "<b>改訂履歴</b> で変更点を確認し、版 <b>B</b> として記録します。レッスン完了です。", tab: "manage", ui: "revisions", check: (s) => (s.part.revisions?.length ?? 0) >= 2 },
        ],
        summary: ["3D プリント前にオーバーハングと薄肉を確認", "すき間はワーストケースと RSS で見積もる", "変更は版を上げて記録"],
        quiz: [
          { q: "公差 ±0.1 が 4 つ連なるとき、ワーストケースの累積は?", choices: ["±0.4", "±0.2", "±0.1"], answer: 0, explain: "ワーストケースは単純和で 0.1 × 4 = 0.4 です (RSS なら ±0.2)。" },
          { q: "改訂履歴に記録する目的は?", choices: ["何を・いつ・なぜ変えたかを残す", "モデルを軽くする", "図面を消す"], answer: 0, explain: "製造・調達との食い違いを防ぎます。" },
        ],
        see: ["tolerance-design", "dfm-3dp", "design-change"],
      },
    ],
  },
];

// ---------------------------------------------------------------- exercises ---

export const EXERCISES2: Exercise[] = [
  {
    id: "ex-conv-plate",
    title: "プロジェクト演習 A: 搬送ユニットのベースプレート (幅違い)",
    level: 2,
    brief: "搬送幅 150 mm の派生機種用に、ベースプレートを新規に設計します。主要寸法はユーザ パラメータで管理してください。",
    spec: [
      ["外形", "幅 270 × 奥行 120 × 板厚 10"],
      ["取付穴", "M8 用キリ穴 Ø9 を 4 隅 (縁から 15)"],
      ["材料", "鋼"],
      ["管理", "幅・奥行・板厚をユーザ パラメータに"],
    ],
    requirements: [
      { text: "ユーザ パラメータ 幅・奥行・板厚 がある", check: (s) => ["幅", "奥行", "板厚"].every((n) => hasUser(s, n)) },
      { text: "幅が 270 になっている", check: (s) => near(s.values.get("幅"), 270) },
      { text: "寸法の式でユーザ パラメータを使っている", check: usesUserParam },
      { text: "穴フィーチャがある", check: (s) => has(s, "hole") },
      { text: "パターンまたはミラーで穴を並べている (または 4 点の穴)", check: (s) => has(s, "rectPattern") || has(s, "mirror") || s.part.features.some((f) => f.type === "hole" && (f as HoleFeature).points.length >= 4) },
      { text: "材料が鋼", check: (s) => s.part.material.name === "鋼" },
    ],
    tips: ["P-2 の手順を思い出しましょう", "穴位置も 幅 / 2 - 15 のような式にすると幅を変えても縁からの距離が保たれます"],
  },
  {
    id: "ex-conv-roller",
    title: "プロジェクト演習 B: 駆動ローラ",
    level: 2,
    brief: "モーター側の駆動ローラを設計します。段付き軸の両端に軸受用の段、片側にねじを設けます。",
    spec: [
      ["ローラ部", "Ø30 × 100"],
      ["軸受部", "Ø10 × 10 (両端)"],
      ["ねじ", "片側 M8"],
      ["仕上げ", "端部 C0.5"],
      ["材料", "鋼"],
    ],
    requirements: [
      { text: "回転フィーチャがある", check: (s) => has(s, "revolve") },
      { text: "面取りがある", check: (s) => has(s, "chamfer") },
      { text: "ねじが設定されている", check: (s) => has(s, "thread") },
      { text: "材料が鋼", check: (s) => s.part.material.name === "鋼" },
      { text: "エラーのフィーチャがなく、ソリッドが 1 つ", check: (s) => s.errors === 0 && s.bodies === 1 },
    ],
    tips: ["半断面を 1 つのスケッチで描いて回転するのが最短です", "ねじは「ねじ」コマンドで円筒面に属性として付けます"],
  },
  {
    id: "ex-conv-asm",
    title: "プロジェクト演習 C: 搬送ユニットの組立図",
    level: 3,
    brief: "ベースプレート・軸受ブラケット・ローラ軸に標準部品を加えて組み立て、組立図を作成します。",
    spec: [
      ["構成", "プレート + ブラケット + 軸 + 標準部品 2 点以上"],
      ["拘束", "メイト (またはフラッシュ) と挿入を使う"],
      ["図面", "アセンブリの図面に寸法または部品欄"],
    ],
    requirements: [
      { text: "コンポーネントが 5 個以上ある", check: (s) => s.asm.components.length >= 5 },
      { text: "メイトまたはフラッシュ拘束がある", check: (s) => activeAsm(s, "mate") || activeAsm(s, "flush") },
      { text: "挿入拘束がある", check: (s) => activeAsm(s, "insert") },
      { text: "アセンブリの図面にビューがある", check: (s) => !!s.asm.drawing && s.asm.drawing.sheets.some((sh) => sh.views.length >= 1) },
      { text: "部品のどれかにフィレットまたは面取りがある", check: (s) => anyPartHas(s, "fillet") || anyPartHas(s, "chamfer") },
    ],
    tips: ["P-5 の組立から始めると早いです", "組立図は「アセンブリ」タブの図面ビューから作れます"],
  },
];
