import type { App } from "../app";
import type { SketchTool } from "../viewer/sketchEditor";
import { openFamily, openFlatPattern, openLibrary, openRules, openSheetStyle, openToleranceStack } from "./lazyUi";
import { openIProperties, openParameters, openShortcuts } from "./dialogs";
import { openRevisions } from "./revisionsUi";
import { exportPmiCsv, openPmiList, togglePmi } from "../mbd/commands";
import type { RibbonButton, RibbonTab } from "./ribbon";
import { curvatureActive, toggleCurvature, toggleZebra } from "../commands/surface";

export function buildRibbonTabs(app: App): RibbonTab[] {
  const cmd = (id: string, label: string, icon: string, shortcut?: string, tip?: string, size: "large" | "small" = "large"): RibbonButton => ({
    id,
    label,
    icon,
    shortcut,
    tip,
    size,
    action: () => app.commands.run(id),
    active: () => app.command?.id === id,
    enabled: () => app.mode === "model" || true,
  });
  const sk = (tool: SketchTool, label: string, icon: string, shortcut?: string, tip?: string, size: "large" | "small" = "large"): RibbonButton => ({
    id: `sk-${tool}`,
    label,
    icon,
    shortcut,
    tip,
    size,
    action: () => app.sketchTool_(tool),
    active: () => app.sketchEditor?.tool === tool,
    enabled: () => !!app.sketchEditor,
  });
  const inSketch = () => app.mode === "sketch";

  const isPart = () => app.env === "part";
  return [
    app.asm.ribbonTab(),
    {
      id: "model",
      label: "3D モデル",
      visible: isPart,
      panels: [
        {
          title: "スケッチ",
          items: [cmd("sketch", "2D スケッチ", "sketch", "S", "平面、作業平面、または平らな面を選択してスケッチを開始します。")],
        },
        {
          title: "作成",
          items: [
            cmd("extrude", "押し出し", "extrude", "E", "スケッチのプロファイルに深さを付けてソリッドを作成・切り取りします。"),
            cmd("revolve", "回転", "revolve", "R", "プロファイルを軸まわりに回転してソリッドを作成します。"),
            {
              stack: [
                cmd("box", "直方体", "box", undefined, "平面上に直方体プリミティブを配置します。", "small"),
                cmd("cylinder", "円柱", "cylinder", undefined, "平面上に円柱プリミティブを配置します。", "small"),
                cmd("sphere", "球", "sphere", undefined, "球プリミティブを配置します。", "small"),
              ],
            },
            {
              stack: [
                cmd("loft", "ロフト", "loft", undefined, "複数の断面スケッチの間を滑らかにつないだソリッドを作成します。", "small"),
                cmd("sweep", "スイープ", "sweep", undefined, "プロファイルをパスに沿って掃引してソリッドを作成します。", "small"),
                cmd("coil", "コイル", "coil", undefined, "プロファイルを軸の周りにらせん状に掃引します (ばね・ねじ山)。", "small"),
                cmd("torus", "トーラス", "torus", undefined, "トーラス プリミティブを配置します。", "small"),
              ],
            },
          ],
        },
        {
          title: "修正",
          items: [
            cmd("hole", "穴", "hole", "H", "単純穴・座ぐり・皿穴、ボルト用キリ穴 (ISO 273)、ねじ穴 (タップ) を平面上またはスケッチ点に作成します。"),
            cmd("thread", "ねじ", "thread", "T", "円筒面にねじ (おねじ / めねじ) を設定します。3D ではねじ山、図面では JIS の略画法で表示されます。"),
            cmd("fillet", "フィレット", "fillet", "F", "選択したエッジを丸めます。"),
            {
              stack: [
                cmd("chamfer", "面取り", "chamfer", "Ctrl+Shift+K", "選択したエッジを面取りします。", "small"),
                cmd("shell", "シェル", "shell", undefined, "選択した面を除去して肉厚一定の中空形状にします。", "small"),
                cmd("pushpull", "プレス/プル", "pushpull", "Q", "平面を押し出し / 押し込みしてダイレクトに形状を変更します (Fusion 360 / SketchUp 方式)。", "small"),
                cmd("move", "ボディを移動", "move", undefined, "ソリッド ボディを移動・回転します。", "small"),
              ],
            },
          ],
        },
        {
          title: "形状編集",
          items: [
            cmd("emboss", "文字", "emboss", undefined, "スケッチ平面に文字 (日本語可) を刻印 / エンボスします。"),
            cmd("rib", "リブ", "rib", undefined, "スケッチした線分とボディの間を埋める補強リブを作成します。"),
            {
              stack: [
                cmd("frame", "フレーム", "frame", undefined, "スケッチの線分に沿って規格鋼材 (角パイプ・H 形鋼・山形鋼 など) を配置し、部材表を作成します。", "small"),
                cmd("weld", "溶接", "weld", undefined, "選択したエッジに隅肉溶接ビードを作成します。", "small"),
              ],
            },
            {
              stack: [
                cmd("draft", "勾配", "draft", undefined, "成形品の抜き勾配: 固定面を基準に面を傾けます。", "small"),
                cmd("split", "分割", "split", undefined, "平面でボディを分割し、片側または両方を残します。", "small"),
                cmd("thicken", "厚み付け", "thicken", undefined, "平面に厚みをつけて板を追加 / 切り取りします。", "small"),
              ],
            },
          ],
        },
        {
          title: "作業フィーチャ",
          items: [
            cmd("workplane", "平面", "workplane", undefined, "既存の平面または面からオフセットした作業平面を作成します。"),
            { stack: [cmd("workaxis", "軸", "workaxis", undefined, "エッジ・円筒面の軸や原点の軸から作業軸を作成します (回転・コイルの軸に使用)。", "small"), cmd("workpoint", "点", "workpoint", undefined, "座標またはモデル上の点から作業点を作成します。", "small")] },
          ],
        },
        {
          title: "パターン",
          items: [
            cmd("rectPattern", "矩形状", "rectPattern", "Ctrl+Shift+R", "フィーチャを 1 方向または 2 方向に並べます。"),
            cmd("circPattern", "円形状", "circPattern", "Ctrl+Shift+O", "フィーチャを軸まわりに円形に並べます。"),
            cmd("mirror", "ミラー", "mirror", "Ctrl+Shift+M", "フィーチャを平面に関して対称コピーします。"),
          ],
        },
        {
          title: "パラメータ",
          items: [{ id: "params", label: "パラメータ", icon: "params", tip: "モデル パラメータとユーザ パラメータを表示・編集します (式・単位付き)。", action: () => openParameters(app) }],
        },
      ],
    },
    {
      id: "surface",
      label: "サーフェス",
      visible: isPart,
      panels: [
        {
          title: "スケッチ",
          items: [cmd("sketch", "2D スケッチ", "sketch", undefined, "サーフェスの輪郭・断面にするスケッチを作成します。")],
        },
        {
          title: "作成",
          items: [
            cmd("surfExtrude", "押し出し", "surfExtrude", undefined, "スケッチの曲線 (開いた曲線・閉じた輪郭) を押し出してサーフェスを作成します。"),
            cmd("surfRevolve", "回転", "surfRevolve", undefined, "スケッチの曲線を軸まわりに回転してサーフェスを作成します。"),
            cmd("surfLoft", "ロフト", "surfLoft", undefined, "2 つ以上の断面スケッチを通るサーフェスを作成します。"),
            cmd("surfPatch", "境界パッチ", "surfPatch", undefined, "閉じたエッジのループ、またはスケッチの閉じた輪郭を面で埋めます (平らでないループは N 辺フィリング)。"),
          ],
        },
        {
          title: "編集",
          items: [
            cmd("surfTrim", "トリム", "surfTrim", undefined, "サーフェスを平面・スケッチの輪郭・別のサーフェスで切り取ります。"),
            cmd("surfStitch", "ステッチ", "surfStitch", undefined, "サーフェスを縫合 (縫い合わせ) します。すき間なく閉じるとソリッドになります。"),
            {
              stack: [
                cmd("surfOffset", "オフセット", "surfOffset", undefined, "サーフェスを法線方向に一定距離オフセットした新しいサーフェスを作成します。", "small"),
                { ...cmd("thicken", "厚み付け", "thicken", undefined, "サーフェスに厚みをつけてソリッドにします (厚み付けコマンドで「対象」にサーフェスを選択)。", "small"), id: "surf-thicken", active: () => app.command?.id === "thicken" },
              ],
            },
          ],
        },
        {
          title: "解析",
          items: [
            { id: "zebra", label: "ゼブラ", icon: "zebra", tip: "縞模様の映り込みで面のつながり (G0 / G1 / G2 連続) を確認します。", action: () => toggleZebra(app), active: () => app.vp.zebra },
            { id: "curvature", label: "曲率", icon: "curvature", tip: "表示メッシュから推定した曲率を色分け表示します (青 = 平ら → 赤 = 曲率大)。", action: () => toggleCurvature(app), active: () => curvatureActive() },
          ],
        },
      ],
    },
    {
      id: "sketch",
      label: "スケッチ",
      contextual: true,
      visible: inSketch,
      panels: [
        {
          title: "作成",
          items: [
            sk("line", "線分", "line", "L", "連続した線分を作成します。数値を入力すると長さを指定できます。"),
            sk("circle", "円", "circle", "C", "中心と半径で円を作成します。"),
            sk("arc", "円弧", "arc", "A", "3 点 (始点・終点・通過点) で円弧を作成します。"),
            sk("rect", "長方形", "rect", "R", "2 点で長方形を作成します (水平・垂直拘束付き)。数値入力: 幅, 高さ"),
            { stack: [sk("polygon", "ポリゴン", "polygon", "G", "正多角形を作成します。", "small"), sk("slot", "長円", "slot", undefined, "中心間距離と幅で長円 (スロット) を作成します。", "small"), sk("point", "点", "point", "P", "穴の中心などに使う点を作成します。", "small")] },
            { stack: [sk("project", "ジオメトリを投影", "project", undefined, "モデルのエッジをスケッチに投影して参照ジオメトリにします。", "small")] },
          ],
        },
        {
          title: "修正",
          items: [
            sk("trim", "トリム", "trim", "X", "交点で区切られた曲線の一部を削除します。"),
            {
              stack: [
                { id: "sk-construction", label: "コンストラクション", icon: "construction", size: "small", tip: "選択したジオメトリをコンストラクション (補助線) に切り替えます。", action: () => app.sketchEditor?.toggleConstruction(), enabled: () => !!app.sketchEditor?.selected.size },
                { id: "sk-delete", label: "削除", icon: "delete", size: "small", shortcut: "Delete", action: () => app.sketchEditor?.deleteSelection(), enabled: () => !!app.sketchEditor?.selected.size },
              ],
            },
          ],
        },
        {
          title: "拘束",
          items: [
            sk("dimension", "寸法", "dimension", "D", "寸法を記入します。値には式やパラメータ名を使用できます。"),
            { stack: [sk("coincident", "一致", "coincident", undefined, undefined, "small"), sk("horizontal", "水平", "horizontal", undefined, undefined, "small"), sk("vertical", "垂直", "vertical", undefined, undefined, "small")] },
            { stack: [sk("parallel", "平行", "parallel", undefined, undefined, "small"), sk("perpendicular", "直交", "perpendicular", undefined, undefined, "small"), sk("tangent", "正接", "tangent", undefined, undefined, "small")] },
            { stack: [sk("equal", "等値", "equal", undefined, undefined, "small"), sk("concentric", "同心", "concentric", undefined, undefined, "small"), sk("collinear", "同一直線上", "collinear", undefined, undefined, "small")] },
            { stack: [sk("midpoint", "中点", "midpoint", undefined, undefined, "small"), sk("symmetric", "対称", "symmetric", undefined, undefined, "small"), sk("fix", "固定", "fix", undefined, undefined, "small")] },
            {
              stack: [
                { id: "sk-glyphs", label: "拘束を表示", icon: "eye", size: "small", shortcut: "F8", action: () => app.toggleConstraintGlyphs(), active: () => !!app.sketchEditor?.showConstraints },
              ],
            },
          ],
        },
        {
          title: "表示",
          items: [
            { id: "sk-slice", label: "スライス表示", icon: "section", shortcut: "F7", tip: "スケッチ平面より手前のモデルを切り取って表示します。", action: () => app.toggleSlice(), active: () => app.sliceGraphics },
            { id: "sk-look", label: "注視", icon: "lookAt", shortcut: "PageUp", action: () => app.lookAtSelection() },
          ],
        },
        {
          title: "終了",
          items: [{ id: "sk-finish", label: "スケッチを終了", icon: "finish", shortcut: "Ctrl+Enter", tip: "スケッチ環境を終了して 3D モデルに戻ります。", action: () => app.exitSketch(true) }],
        },
      ],
    },
    {
      id: "sheetmetal",
      label: "板金",
      visible: isPart,
      panels: [
        {
          title: "セットアップ",
          items: [{ id: "sm-style", label: "板金スタイル", icon: "smStyle", tip: "板厚・曲げ半径・K係数を設定します (パーツを板金として扱います)。", action: () => openSheetStyle(app) }],
        },
        {
          title: "作成",
          items: [
            cmd("sheetFace", "面", "smFace", undefined, "閉じたスケッチ プロファイルから板厚一定の板金の面を作成します。"),
            cmd("flange", "フランジ", "flange", undefined, "面の外周エッジに曲げ (内 R = 曲げ半径) 付きのフランジを付けます。複数エッジで箱形状を作れます。"),
          ],
        },
        {
          title: "修正",
          items: [{ ...cmd("extrude", "切り抜き", "extrude", undefined, "スケッチを「切り取り」で押し出して穴・切り欠きを作成します (押し出しコマンド)。"), id: "sm-cut" }],
        },
        {
          title: "展開",
          items: [{ id: "sm-flat", label: "展開パターン", icon: "unfold", tip: "K係数から展開形状を計算し、展開寸法・曲げ線を表示します。DXF (レーザー加工・タレパン用) に書き出せます。", action: () => openFlatPattern(app) }],
        },
      ],
    },
    {
      id: "inspect",
      label: "検査",
      visible: isPart,
      panels: [
        {
          title: "測定",
          items: [cmd("measure", "測定", "measure", "M", "距離・角度・長さ・面積を測定します。")],
        },
        {
          title: "解析",
          items: [
            cmd("stress", "応力解析", "stress", undefined, "固定面と荷重を指定して線形静解析を行い、ミーゼス応力・変位・安全率を色分け表示します。"),
            { id: "tolstack", label: "公差累積", icon: "measure", tip: "寸法の連鎖からすき間のワーストケース・統計的 (RSS)・モンテカルロのばらつきを計算します。", action: () => openToleranceStack(app.store.doc.name, app.values()) },
            cmd("cam", "CAM", "cam", undefined, "スケッチのプロファイルからポケット・輪郭・穴あけの工具経路を作成し、G コードを書き出します (2.5 軸)。"),
            cmd("printcheck", "3D プリント", "printcheck", undefined, "オーバーハング・薄肉・開いたエッジを色分けし、材料・造形時間の目安を表示します。"),
          ],
        },
        {
          title: "プロパティ",
          items: [{ id: "iprops", label: "iProperties", icon: "iprops", tip: "質量、体積、表面積、重心などの物理プロパティと概要情報。", action: () => openIProperties(app) }],
        },
      ],
    },
    {
      id: "manage",
      label: "管理",
      visible: isPart,
      panels: [
        {
          title: "パラメータ",
          items: [
            { id: "params2", label: "パラメータ", icon: "params", tip: "パラメータ テーブルを開きます。", action: () => openParameters(app) },
            { id: "revisions", label: "改訂履歴", icon: "iprops", tip: "版 (A, B, C …) を記録し、変更点の一覧・比較・復元を行います。図面の表題欄と改訂表に反映されます。", action: () => openRevisions(app) },
          ],
        },
        {
          title: "iLogic",
          items: [
            { id: "rules", label: "ルール", icon: "rule", tip: "パラメータに応じて寸法・抑制・iProperty・マテリアルを自動で変えるルールを作成します (iLogic 相当)。", action: () => openRules(app) },
            {
              stack: [
                { id: "rules-run", label: "ルールを実行", icon: "play", size: "small", tip: "有効なルールをすべて実行します。", action: () => void app.runRules((app.store.doc.rules ?? []).filter((r) => r.enabled)) },
                { id: "family", label: "ファミリー表", icon: "rectPattern", size: "small", tip: "サイズ違いの構成をパラメータ表で管理します (iPart / デザイン テーブル)。", action: () => openFamily(app) },
              ],
            },
          ],
        },
        {
          title: "コンテンツ",
          items: [{ id: "library", label: "標準部品", icon: "library", tip: "ボルト・ナット・座金・ピン・軸受を規格寸法のパラメトリック パーツとして開きます (コンテンツ センター)。", action: () => openLibrary(app) }],
        },
        {
          title: "読み込み/書き出し",
          items: [
            { id: "import", label: "インポート", icon: "import", tip: "STEP / STL を読み込んでベース フィーチャにします (Inventor から STEP で書き出したデータを利用できます)。", action: () => app.importFile() },
            { id: "export-step", label: "STEP 書き出し", icon: "export", tip: "STEP AP214 で書き出します。Inventor で開くことができます。", action: () => app.exportFile("step") },
            {
              id: "export-more",
              label: "その他の形式",
              icon: "export",
              tip: "STL / 3MF / OBJ / GLB / PLY / DXF に書き出します。",
              action: () => {
                const b = document.querySelector('[data-cmd="export-more"]')!.getBoundingClientRect();
                app.exportMenu(b.left, b.bottom + 2);
              },
            },
          ],
        },
        {
          title: "図面",
          items: [{ id: "drawing", label: "図面ビュー", icon: "drawing", tip: "正面・平面・側面・等角ビューの 2D 図面 (隠れ線付き) を作成します。", action: () => app.openDrawingEnv() }],
        },
      ],
    },
    {
      id: "mbd",
      label: "MBD",
      visible: isPart,
      panels: [
        {
          title: "MBD (3D 注記)",
          items: [
            cmd("pmi-dim", "寸法", "dimension", undefined, "2 つの面・エッジ間の距離を 3D 寸法として記入します (± 公差・はめあい)。モデルの変更に追従します。"),
            cmd("pmi-diameter", "直径", "hole", undefined, "円筒面・円形エッジの直径 / 半径を記入します (H7 などのはめあい)。"),
            {
              stack: [
                cmd("pmi-gdt", "幾何公差", "iprops", undefined, "面に幾何公差の枠 (記号・公差値・データム) を付けます。", "small"),
                cmd("pmi-datum", "データム", "fix", undefined, "面にデータム記号 (A, B, C …) を付けます。", "small"),
                cmd("pmi-surface", "表面性状", "pushpull", undefined, "面に表面性状 (Ra) を指示します。", "small"),
              ],
            },
            cmd("pmi-note", "注記", "edit", undefined, "面・エッジに引出線付きのテキスト注記を付けます。"),
          ],
        },
        {
          title: "管理",
          items: [
            { id: "pmi-toggle", label: "表示切替", icon: "eye", tip: "3D 注記 (PMI) の表示 / 非表示を切り替えます。", action: () => togglePmi(app), active: () => app.pmi.visible },
            {
              stack: [
                { id: "pmi-list", label: "一覧", icon: "iprops", size: "small", tip: "すべての 3D 注記を一覧表示し、編集・削除・表示切替を行います。", action: () => openPmiList(app) },
                { id: "pmi-csv", label: "PMI 一覧 CSV", icon: "export", size: "small", tip: "3D 注記の一覧を CSV (Excel 対応) で書き出します。", action: () => exportPmiCsv(app) },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "view",
      label: "表示",
      panels: [
        {
          title: "表示スタイル",
          items: [
            { id: "st-se", label: "エッジ付き", icon: "shadedEdges", action: () => app.setStyle("shadedEdges"), active: () => app.vp.style === "shadedEdges" },
            {
              stack: [
                { id: "st-s", label: "シェーディング", icon: "shaded", size: "small", action: () => app.setStyle("shaded"), active: () => app.vp.style === "shaded" },
                { id: "st-h", label: "隠れ線付き", icon: "hiddenEdges", size: "small", action: () => app.setStyle("hiddenEdges"), active: () => app.vp.style === "hiddenEdges" },
                { id: "st-w", label: "ワイヤフレーム", icon: "wireframe", size: "small", action: () => app.setStyle("wireframe"), active: () => app.vp.style === "wireframe" },
              ],
            },
          ],
        },
        {
          title: "外観",
          items: [
            { id: "section", label: "断面図", icon: "section", tip: "X/Y/Z 方向の断面でモデルを切断表示します。", action: () => app.toggleSectionView(), active: () => app.sectionActive },
            {
              stack: [
                { id: "ortho", label: "平行投影", icon: "ortho", size: "small", action: () => app.vp.setPerspective(false), active: () => !app.vp.perspective },
                { id: "persp", label: "透視投影", icon: "perspective", size: "small", action: () => app.vp.setPerspective(true), active: () => app.vp.perspective },
              ],
            },
          ],
        },
        {
          title: "レンダリング",
          items: [
            { id: "realistic", label: "リアル表示", icon: "render", tip: "影・映り込み・金属/樹脂の質感でフォトリアルに表示します (KeyShot / Inventor Studio 相当の簡易版)。", action: () => app.toggleRealistic(), active: () => app.vp.realistic },
            { id: "save-image", label: "高解像度画像", icon: "image", tip: "現在のビューを 2 倍解像度の PNG で保存します (レンダリング用)。", action: () => app.saveImage(2) },
          ],
        },
        {
          title: "ナビゲート",
          items: [
            { id: "home", label: "ホーム ビュー", icon: "home", shortcut: "F6", action: () => app.homeView() },
            {
              stack: [
                { id: "fit", label: "全体表示", icon: "zoomFit", size: "small", shortcut: "Home", action: () => app.vp.fitAll() },
                { id: "look", label: "注視", icon: "lookAt", size: "small", shortcut: "PageUp", action: () => app.lookAtSelection() },
                { id: "shot", label: "画像を保存", icon: "screenshot", size: "small", action: () => app.screenshot() },
              ],
            },
          ],
        },
        {
          title: "ヘルプ",
          items: [{ id: "keys", label: "ショートカット", icon: "keyboard", action: () => openShortcuts() }],
        },
      ],
    },
  ];
}
