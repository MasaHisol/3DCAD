# 形式の調査結果 (段階 1「要調査」)

段階 1 の「要調査」項目 (JT、DWG、独自形式) について、実装の可否と方針をまとめる。あわせて、段階 1 で実装した形式について、同梱カーネル (replicad-opencascadejs) で確認した事実を記録する。

- 調査日: 2026-10
- ライセンスと価格は変わることがある。採用を決める前に、各社の最新の条件を必ず確認すること。

## 結論 (要約)

| 形式 | 結論 | 理由 |
|---|---|---|
| JT | **実装しない (保留)** | 無償で使えて B-rep まで読めるライブラリがない。B-rep 部分は Parasolid (XT) で、メッシュ部分も独自の圧縮が多く、自作の負担が大きい |
| DWG | **DXF 経由とする。LibreDWG は同梱しない** | LibreDWG は GPLv3 で、商用配布と両立しない。ODA の SDK は有償の会員制。当面は DXF 読み込みを強化し、デスクトップ版では利用者の PC に入っている変換ツールを呼び出す |
| Parasolid、SOLIDWORKS、Inventor、CATIA、Creo、NX の独自形式 | **対象外 (確認済み)** | 形状を読むには各社のカーネルか有償 SDK が要る。現在のとおり、プレビューとプロパティだけを読み、STEP 経由を案内する |

## JT (Siemens JT、ISO 14306)

### 形式の中身
- JT は「セグメント」の集まりで、主に次の 2 種類の形状を持つ。
  - **三角形メッシュ (LOD)**: 表示用。頂点・法線は量子化され、整数の圧縮 (Int32 CDP、算術符号、ハフマン符号など) と ZLIB / LZMA で圧縮される。
  - **B-rep**: JT 独自の B-rep か、**Parasolid XT B-rep** (多くの NX 由来ファイルはこちら)。XT B-rep を正しく形状にするには Parasolid 相当のカーネルが要る。
- 仕様は ISO 14306 として公開されている (有償で購入できる)。Siemens も過去の版の仕様書を公開している。

### 使えるライブラリ
| 候補 | ライセンス | 評価 |
|---|---|---|
| Siemens JT Open Toolkit | 有償 (JT Open プログラムの会員) | 公式。C++ のみで、Web / Electron への組み込みは重い |
| Open Cascade 社の JT 読み込みモジュール | 有償の追加モジュール | 同梱している OpenCascade とは別売りで、WebAssembly 版はない |
| CAD Exchanger SDK など商用の変換 SDK | 有償 | JT の読み込みに対応し、WebAssembly 版がある製品もある |
| オープンソースの読み込み試作 | さまざま | メッシュ (LOD) の一部だけを読む試作的なものに限られる。XT B-rep と新しい版の圧縮に完全に対応したものは見つからない |

### 判断
- 無償で、B-rep まで、商用配布と両立する形で読めるライブラリはない。計画の見立てどおり**現時点では実装しない**。
- 仕様は公開されているので、**表示用メッシュ (LOD) だけを読む自作**は理論上は可能だが、圧縮方式の種類が多く、版ごとの差も大きい。工数に見合わない。
- 代わりの手順: 送り手に **STEP AP242** (形状と PMI) か **glTF** (表示用) で書き出してもらう。どちらも本アプリで開ける。
- 見直す条件: 利用者から JT の需要がはっきり出た場合に、WebAssembly 版のある商用 SDK (例: CAD Exchanger) の採用を、費用と配布条件を確認したうえで検討する。

## DWG

### 選択肢
| 方式 | ライセンス・費用 | 品質 | 本アプリとの相性 |
|---|---|---|---|
| **LibreDWG** (GNU) | **GPLv3 以降** | R13〜2018 程度の読み込みに対応。開発途上 (ベータ) と明記されている。書き込みは限定的 | GPL のライブラリをアプリに組み込む (WebAssembly 化してバンドルするのも含む) と、アプリ全体を GPLv3 で公開する義務が生じる。商用配布と両立しない。別プロセスのコマンドとして同梱する方法もあるが、ソースの提供義務などが残り、解釈が分かれる |
| **ODA Drawings SDK** (旧 Teigha) | 有償の会員制 (年額。用途と会員区分で異なる) | 全版の DWG に対応し、実績が多い | WebAssembly 版がある。会員費と配布条件の確認が必要 |
| Autodesk RealDWG | 有償 (Autodesk とのライセンス契約) | 純正 | Windows 向けの C++ / .NET のみで、Electron / Web では使いにくい |
| **DXF 経由** | 無償 | DXF は公開仕様。本アプリはすでに DXF を読める (`src/io/dxf.ts`) | 利用者が DWG を DXF に変換する手間がかかる |

### 推奨
1. **LibreDWG はアプリに同梱しない** (GPLv3 のため)。
2. **当面は DXF 経由**とする (段階 4 の「DWG・PDF 図面の表示」もこれに従う)。
   - DXF 読み込みを強化する: ブロック (INSERT)、寸法、ハッチ、文字、レイヤーの色と表示。
   - 利用者向けの変換手順を案内する: 無償の **ODA File Converter** (ODA 配布の単体ソフト) か **DWG TrueView** (Autodesk の無償ビューア) で DXF に保存する。
   - デスクトップ版では、利用者の PC に ODA File Converter が入っていれば、DWG を開いたときに自動で DXF に変換して読み込む。ツールは**同梱せず**、インストール済みのものを別プロセスで呼ぶだけにする (再配布しないので配布条件の問題が起きにくい。利用条件は事前に確認する)。
3. DWG を直接開く需要が大きくなったら、**ODA の会員になり Drawings SDK (WebAssembly 版)** を採用する。費用と配布条件 (Web 版で使えるか、端末数の制限など) を確認して判断する。

## 独自形式 (対象外の確認)

| 形式 | 形状データの中身 | 読むために必要なもの | 本アプリでの扱い |
|---|---|---|---|
| Parasolid (.x_t / .x_b) | Parasolid の B-rep | Parasolid カーネル (Siemens の有償ライセンス) か商用 SDK | 対象外 |
| SOLIDWORKS (.sldprt / .sldasm) | 独自のコンテナに Parasolid の B-rep | 同上。公開仕様なし | プレビュー画像とプロパティだけ表示し、STEP 経由を案内 (既存) |
| Inventor (.ipt / .iam) | Autodesk ShapeManager の B-rep | Autodesk のライブラリ。公開仕様なし | プレビュー画像と iProperties だけ表示し、STEP 経由を案内 (既存) |
| CATIA V5、Creo、NX | 各社のカーネルの B-rep | 商用の変換 SDK (CAD Exchanger、HOOPS Exchange など) | 対象外 |

- どの形式も、形状を読むにはカーネル (または有償 SDK) が要り、無償で商用配布と両立する手段はない。**計画どおり対象外とする。**
- 送り手には STEP (AP214 / AP242) での書き出しを案内する。本アプリは STEP の名前・色・アセンブリ構造を読み込める (段階 1 で対応)。

## 参考: 同梱カーネルで確認したこと (段階 1 の実装の前提)

同梱の `replicad-opencascadejs` (OpenCascade の WebAssembly 版) が公開しているクラスを確認した。

| 機能 | 同梱カーネル | 本アプリでの対応 |
|---|---|---|
| STEP の読み込み | `STEPControl_Reader` のみ (XCAF の `STEPCAFControl_Reader` はない) | 形状はカーネルで読み、名前・色・構造・配置は STEP の本文を自前で解析して対応づける (`src/io/stepmeta.ts`) |
| STEP の書き出し (名前・色・構造) | `STEPCAFControl_Writer`、`XCAFDoc_ShapeTool`、`XCAFDoc_ColorTool` がある | XCAF 文書を組み立てて書き出す (`src/kernel/exchange.ts`) |
| IGES | **なし** (`IGESControl_Reader` / `Writer` とも含まれない) | IGES 5.3 のトリム サーフェス (144) を自前で読み書きし、面はカーネルで作る (`src/io/iges.ts`、`src/kernel/exchange.ts`) |
| 形状の修復 | `ShapeFix_Face`、`ShapeFix_Wire`、`ShapeFix_Solid`、`BRepBuilderAPI_Sewing`、`ShapeUpgrade_UnifySameDomain`、`BRepCheck_Analyzer` がある (`ShapeFix_Shape` と `ShapeFix_Shell` はない) | 微小面の削除、面ごとの修復、隙間の縫合、ソリッド化と向きの修正、同一面の統合を組み合わせる |
| glTF | `RWGltf_CafWriter` はない | 自前で読み書きする (`src/io/gltf.ts`) |
| IFC | なし | web-ifc (MPL-2.0) を使い、IFC を開いたときだけ読み込む |
| E57 | なし | 自前の読み込み (`src/io/e57.ts`、非圧縮の bitPackCodec) |
