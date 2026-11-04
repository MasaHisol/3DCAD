# OCC カーネルの拡張 (段階 1.5 #1)

## 結論

**機能の多い公開ビルド (opencascade.js 2.0.0-beta.b5ff984 = OCCT 7.6.2 の全機能ビルド) を、必要な操作のときだけ読み込む「拡張カーネル」として追加した。**
主カーネル (replicad-opencascadejs) はそのまま使い、IGES・XCAF STEP 読み込み・ShapeFix_Shape による修復だけを拡張カーネルで行う。
形状は OCCT のテキスト BRep (`CASCADE Topology V3`) で受け渡す。拡張カーネルが使えないとき (読み込み失敗など) は段階 1 の TypeScript 実装に自動で戻る。

| 項目 | 主カーネル | 拡張カーネル |
|---|---|---|
| パッケージ | replicad-opencascadejs 1.1.0 (OCCT 7.8 系の独自ビルド) | opencascade.js 2.0.0-beta.b5ff984 (OCCT 7.6.2、全クラス) |
| wasm | 22.98 MB (gzip 7.2 MB) | 50.31 MB (gzip 13.7 MB) |
| JS | 60 KB | 228 KB (遅延読み込みのチャンク) |
| 読み込み | 起動時 | IGES の読み書き・STEP 読み込み・修復が初めて必要になったとき |
| 初期化時間 | — | Node 22 で約 7 秒 (4 コア、初回コンパイル込み)。ブラウザはストリーミング コンパイルで短縮 |

## 調べた方法

### a. 自前のカスタムビルド (YAML で必要なクラスを指定)
- opencascade.js / replicad-opencascadejs のカスタムビルドは Docker イメージ (`ghcr.io/taucad/opencascade.js:*`) の `link` コマンドで行う。イメージに OCCT のコンパイル済みオブジェクトが入っており、リンクとバインディング生成だけで済む。
- この環境では `dockerd` は起動できた。イメージは圧縮で 2.37 GB (31 レイヤ、展開後はおよそ 3 倍)。ディスクの空きは約 29 GB。
- Emscripten と OCCT を一から自前でコンパイルする方法は、4 コアで数時間かかり、ccache を使っても初回は短縮できないため不採用。
- 不採用の理由:
  - replicad の YAML 設定 (build-source、ytt テンプレート) は npm パッケージに含まれず、replicad のリポジトリと同じ版のイメージを揃える必要がある。版が合わないと主カーネル全体の挙動が変わり、既存 260 余りのテストへの影響が大きい
  - 同じ引数の数のオーバーロードが衝突する問題 (後述) は、ビルドし直しても C++ の補助コードを書かないと解消しない
  - 拡張機能を主カーネルに入れると、使わない利用者も起動時に毎回大きい wasm を読み込む
- 将来の選択肢として残す: 主カーネルに必要なクラスを追加したビルドを作れば、BRep の受け渡しが不要になり、配布サイズも約 50 MB 減る (拡張カーネルを外せるため)。手順は「将来の作業」を参照。

### b. 公開済みの全機能ビルドを必要時に読み込む (採用)
- npm の `opencascade.js` の beta (2.0.0-beta.b5ff984、2023 年公開) は全クラス入り。必要なクラスがすべて JS から呼べることを確認した:
  `IGESControl_Reader/Writer`、`IGESCAFControl_Reader/Writer`、`STEPCAFControl_Reader`、`XCAFDoc_ShapeTool/ColorTool`、`TDataStd_Name`、`ShapeFix_Shape`、`ShapeFix_Shell`、`HLRBRep_Algo`、`HLRBRep_PolyAlgo`、`BRepBuilderAPI_MakeFace(Geom_Surface, TopoDS_Wire, Inside)` (`_21`)。
- このビルドはオーバーロードに `_1`、`_2` … の番号付きの名前があり、主カーネルで呼べなかったものも呼べる。
- 1.1.1 (latest タグ) は 2020 年公開の旧版で、オーバーロードの命名規則も古いため不採用。
- ライセンス: opencascade.js は LGPL-2.1-only、OCCT は LGPL-2.1 (例外条項付き)。改変せずに別ファイルの wasm として同梱し、利用者が差し替え可能なので LGPL の条件を満たす。ライセンス文を `licenses/opencascade.js_LGPL-2.1.txt` として配布物に含め、README に出典を記載した。
- マルチスレッド版 (`opencascade.full` の multi) は SharedArrayBuffer が必要で、全体が大きいため使わない。

### c. その他
- 別のワーカーで拡張カーネルを動かす案: 形状は BRep 文字列で渡すので可能だが、今回は同じジオメトリ ワーカーの中で遅延読み込みした (メッセージ往復とコピーが 1 回少なく、ワーカーの監視・再起動の仕組みをそのまま使える)。`src/kernel/ext.ts` は文字列と数値だけを入出力にしているので、後で別ワーカーへ移すときも API は変わらない。
- HLR (隠線処理): 主カーネルに `HLRBRep_Algo` と `HLRBRep_HLRToShape` が入っていたため、厳密な隠線処理は拡張カーネルを読み込まずに主カーネルで行う (`src/kernel/hlr.ts`)。拡張カーネルにはポリゴン版の高速な `HLRBRep_PolyAlgo` もあるので、段階 4 の図面エンジン (#6) で大きな部品の高速表示に使える。

## 実装

| 機能 | 経路 | 予備 (拡張カーネルなし) |
|---|---|---|
| STEP 読み込み (部品) | `STEPCAFControl_Reader` → XCAF の木から名前・色・配置を取得 (`importStepWithMeta`) | replicad の読み込み + 文字列の解析 (`src/io/stepmeta.ts`) |
| STEP 読み込み (アセンブリ) | 同上。サブアセンブリを含む木 (`tree`) と、各インスタンスの合成した配置と経路 (`comps[].path`) を返す (`importStepAssembly`) | 同上 (1 段の構造) |
| STEP 書き出し (サブアセンブリ付き) | `exportStepTree` (主カーネルの `STEPCAFControl_Writer`) | — |
| IGES 読み込み | `src/io/iges.ts` で全要素を読めた場合はその結果 (平面・円筒・球を解析曲面に戻すので穴径などを測定できる)。未対応の要素 (MSBO ソリッド 186 など) や作れない面があれば `IGESCAFControl_Reader` (全エンティティ、単位を mm に変換、名前・色) → 修復 | 拡張カーネルなしでは NURBS 変換のみ |
| IGES 書き出し | `IGESCAFControl_Writer` (トリム面 144、名前・色)。日本語の名前は `&#xHHHH;` で表して往復 | `src/io/iges.ts` |
| 形状の修復 | 微小面の削除 → 縫合 → `ShapeFix_Shape` → `ShapeFix_Solid` → 同一面の統合 (`healShapeNative`) | TypeScript の手順 (`healShape`) |
| トリム面の作成 | `BRepBuilderAPI_MakeFace(Geom_Surface, Wire, Inside)` + `ShapeFix_Face` (`ExtKernel.trimmedFace`) | 空の面に `TopoDS_Builder` で輪郭を追加 |
| 隠線処理 | 主カーネルの `HLRBRep_Algo` (`hlrProject`、プロトコル `hlr`) | — |
| 質量特性 | 誤差制御つきの適応積分 (`preciseProps`) を標準にした | 固定のガウス積分 (旧) |

- 読み込み設定はワーカー (`src/kernel/worker.ts`) の `setExtLoader`。Vite の別名 `occt-full` で `node_modules/opencascade.js/dist` を指し、JS は動的 import、wasm は `?url` でアセットとして同梱する (オフラインで動く)。
- 状態はプロトコル `extKernel` (`KernelClient.extKernel(load)`) で確認できる。
- テスト (Node) は `opencascade.js/dist/node.js` を読み込む (`tests/kernelext.test.ts`)。他のテストは拡張カーネルなしで予備の経路を検証する。

### 呼べないオーバーロード
主カーネルのバインディングは引数の数でオーバーロードを選ぶため、`BRepBuilderAPI_MakeFace(Geom_Surface, Wire, Inside)` は `(gp_Pln, Wire, Inside)` と衝突し、トリムされない面が作られていた。
拡張カーネルでは番号付きの名前 (`BRepBuilderAPI_MakeFace_21`) で正しく呼べる。IGES の読み込みは拡張カーネル側で完結するため、この問題を通らなくなった。主カーネル側の予備経路は段階 1 の回避策 (空の面に輪郭を追加して `ShapeFix_Face`) のまま。

### 質量特性の精度
有理 B スプライン面 (NURBS に変換した球・トーラス) で比較した (OCCT 7.8 の主カーネル、7.6 の拡張カーネルとも同じ結果):

| 方法 | 球の体積 | トーラスの体積 | 球の面積 |
|---|---|---|---|
| 固定のガウス積分 (旧、`measureShapeVolumeProperties`) | -4.4e-4 | +1.6e-3 | +3.7e-3 |
| Gauss-Kronrod (`VolumePropertiesGK`) | 2e-15 | 1e-14 | — |
| 誤差制御つき (`VolumeProperties(eps)` / `SurfaceProperties(eps)`) | -2.1e-7 | -2.1e-7 | -2.1e-7 |

カーネルの版の違いではなく、積分方法の違いだった。重心も必要なため、誤差制御つきの積分 (eps = 1e-7) を標準にした。`VolumePropertiesGK` で重心まで求めると (CGFlag) 1 形状で数十秒かかるため使わない。テストでは相対誤差 1e-5 以内を確認している。

## 配布サイズ
- `dist` は 39 MB → 89 MB (+50.3 MB の wasm、+0.23 MB の JS チャンク)。gzip では +13.7 MB。
- インストーラは electron-builder の最大圧縮 (7z/LZMA) で圧縮されるため、増加は 10〜14 MB 程度の見込み。
- 起動時に読み込む量は変わらない (主カーネルのみ)。拡張カーネルは IGES の読み書き、STEP の読み込み、修復のときに初めて読み込む (ブラウザのキャッシュ、Electron では asar 内のファイル)。
- Electron: `app://` のプロトコルは `.wasm` を `application/wasm` で返す (既存)。wasm は asar の中から読み込める。

## 残る制限
- 2 つのカーネルの間は BRep 文字列のコピーになる。非常に大きなアセンブリでは読み込み時間とメモリが増える (両方のヒープに同じ形状が一時的に存在する)。
- 拡張カーネルの初回読み込みに数秒かかる (wasm 50 MB のコンパイル)。ワーカー内で行うので UI は止まらない。
- 拡張カーネルは OCCT 7.6.2、主カーネルは 7.8 系。BRep V3 形式は両方で読み書きできることを確認済み。
- IGES の名前は ASCII のみの形式のため、日本語名は `&#xHHHH;` 形式になる (本アプリ同士では往復する。他の CAD ではこの表記のまま表示される)。
- サブアセンブリは読み込み・書き出しとも木の構造を保つが、アセンブリ画面は 1 段の構造のため、部品名に経路 (`サブアセンブリ / 部品:1`) を付けて配置する。木の編集は段階 5 以降。
- カーネルの IGES 変換器は面を B スプライン曲面のまま返す (OCCT 7.6 には形状全体を解析曲面に戻す機能がない)。そのため IGES は TypeScript 側で完全に読めるときはそちらを優先している。
- PMI (GD&T) は XCAF で読めるが、表示・編集は段階 4 (AP242) で扱う。

## 将来の作業 (主カーネルの再ビルド)
1. replicad リポジトリの `packages/replicad-opencascadejs/build-source` を、npm の 1.1.0 と同じコミットで取得する
2. `custom_build_single.yml` に `IGESControl`、`IGESCAFControl`、`STEPCAFControl_Reader`、`XCAFDoc`、`ShapeFix_Shape`、`ShapeFix_Shell`、`HLRBRep_PolyAlgo` を追加し、衝突するオーバーロードは `additionalCppCode` で別名の関数として公開する
3. `docker run ghcr.io/taucad/opencascade.js:<同じ版> link custom_build_single.yml` でリンク (コンパイル済みオブジェクトを使うため数十分の見込み)
4. 既存テストと `tests/kernelext.test.ts` が通れば、拡張カーネルを外して配布サイズを戻す
