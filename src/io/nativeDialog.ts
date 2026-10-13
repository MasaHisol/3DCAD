import type { App } from "../app";
import { h, modal, toast } from "../ui/dom";
import { readNativeInfo } from "./ole";

/**
 * Inventor / SOLIDWORKS native files: the geometry is proprietary, so show
 * what can be read (preview and iProperties), offer to take the properties
 * over, and explain the STEP route for the shape.
 */
export function openNativeInfo(app: App, fileName: string, bytes: Uint8Array) {
  const ext = fileName.split(".").pop()!.toLowerCase();
  const inventor = ext.startsWith("i");
  let info;
  try {
    info = readNativeInfo(bytes);
  } catch (e) {
    toast(`${fileName}: ${(e as Error).message} (SOLIDWORKS 2015 以降の形式はプロパティも読み取れません) — STEP で書き出してください`, "warn", 9000);
    return;
  }
  const img = h("div", { class: "native-thumb" });
  if (info.thumbnail) {
    const url = URL.createObjectURL(info.thumbnail);
    img.appendChild(h("img", { src: url, alt: "プレビュー" }));
  } else img.appendChild(h("span", { class: "muted" }, "プレビューなし"));
  const table = h("table", { class: "lib-spec" }, ...info.props.map(([k, v]) => h("tr", {}, h("th", {}, k), h("td", {}, v))));
  const steps = inventor
    ? "Inventor で開き「ファイル → エクスポート → CAD 形式」で STEP (*.stp, AP214) を選ぶ"
    : "SOLIDWORKS で開き「名前を付けて保存」で STEP AP214 (*.step) を選ぶ";
  modal({
    title: `${fileName} (${inventor ? "Inventor" : "SOLIDWORKS"} ネイティブ形式)`,
    icon: "import",
    width: 640,
    body: h(
      "div",
      {},
      h("div", { class: "native-info" }, img, info.props.length ? table : h("p", { class: "muted" }, "iProperties は見つかりませんでした")),
      h("p", {}, "ネイティブ形式の形状データは非公開仕様のため読み込めません。形状は次の手順で STEP 経由で取り込めます (寸法・面は正確に保たれます):"),
      h("ol", {}, h("li", {}, steps), h("li", {}, "このアプリで「インポート」から .stp を選ぶ (アセンブリは .stp をアセンブリ環境で配置)")),
    ),
    buttons: [
      {
        label: "iProperties を現在のパーツに取り込む",
        primary: true,
        onClick: () => {
          if (!info.props.length || app.env !== "part") return void toast("取り込める iProperties がありません", "info");
          const map: Record<string, string> = { タイトル: "説明", パーツ番号: "パーツ番号", 説明: "説明", 作成者: "設計者", 設計者: "設計者", プロジェクト: "プロジェクト", 会社: "会社" };
          app.store.mutate("iProperties を取り込み", (d) => {
            for (const [k, v] of info.props) if (map[k]) d.iprops[map[k]] = v;
          });
          toast("iProperties を取り込みました", "ok");
        },
      },
      { label: "閉じる" },
    ],
  });
}
