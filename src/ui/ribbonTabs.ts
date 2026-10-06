import type { App } from "../app";
import type { SketchTool } from "../viewer/sketchEditor";
import { openDrawing, openIProperties, openParameters, openShortcuts } from "./dialogs";
import type { RibbonButton, RibbonTab } from "./ribbon";

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

  return [
    {
      id: "model",
      label: "3D モデル",
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
                cmd("torus", "トーラス", "torus", undefined, "トーラス プリミティブを配置します。", "small"),
              ],
            },
          ],
        },
        {
          title: "修正",
          items: [
            cmd("hole", "穴", "hole", "H", "単純穴・座ぐり・皿穴を平面上またはスケッチ点に作成します。"),
            cmd("fillet", "フィレット", "fillet", "F", "選択したエッジを丸めます。"),
            {
              stack: [
                cmd("chamfer", "面取り", "chamfer", "Ctrl+Shift+K", "選択したエッジを面取りします。", "small"),
                cmd("shell", "シェル", "shell", undefined, "選択した面を除去して肉厚一定の中空形状にします。", "small"),
                cmd("move", "ボディを移動", "move", undefined, "ソリッド ボディを移動・回転します。", "small"),
              ],
            },
          ],
        },
        {
          title: "作業フィーチャ",
          items: [cmd("workplane", "平面", "workplane", undefined, "既存の平面または面からオフセットした作業平面を作成します。")],
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
      id: "inspect",
      label: "検査",
      panels: [
        {
          title: "測定",
          items: [cmd("measure", "測定", "measure", "M", "距離・角度・長さ・面積を測定します。")],
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
      panels: [
        {
          title: "パラメータ",
          items: [{ id: "params2", label: "パラメータ", icon: "params", tip: "パラメータ テーブルを開きます。", action: () => openParameters(app) }],
        },
        {
          title: "読み込み/書き出し",
          items: [
            { id: "import", label: "インポート", icon: "import", tip: "STEP / STL を読み込んでベース フィーチャにします (Inventor から STEP で書き出したデータを利用できます)。", action: () => app.importFile() },
            { id: "export-step", label: "STEP 書き出し", icon: "export", tip: "STEP AP214 で書き出します。Inventor で開くことができます。", action: () => app.exportFile("step") },
            { id: "export-stl", label: "STL 書き出し", icon: "export", size: "large", tip: "3D プリント用の STL を書き出します。", action: () => app.exportFile("stl") },
          ],
        },
        {
          title: "図面",
          items: [{ id: "drawing", label: "図面ビュー", icon: "drawing", tip: "正面・平面・側面・等角ビューの 2D 図面 (隠れ線付き) を作成します。", action: () => openDrawing(app) }],
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
