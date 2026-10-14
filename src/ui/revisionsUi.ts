import type { App } from "../app";
import { diffSnapshots, nextRev, snapshotOf } from "../core/revisions";
import { confirmDialog, h, modal, promptDialog, toast } from "./dom";

/** 改訂履歴: record a revision, list changes, compare and restore. */
export function openRevisions(app: App) {
  const body = h("div", { class: "rev-dialog" });
  const render = () => {
    const doc = app.store.doc;
    const revs = doc.revisions ?? [];
    body.innerHTML = "";
    const last = revs.at(-1);
    const pending = last ? diffSnapshots(last.snapshot, snapshotOf(doc)) : null;
    body.appendChild(h("h4", {}, last ? `現在の版: ${last.rev}` : "改訂はまだ記録されていません"));
    if (pending) body.appendChild(h("div", { class: "rev-pending", "data-k": "rev-pending" }, pending.length ? `${last!.rev} 以降の変更 (${pending.length}): ` + pending.join(" / ") : `${last!.rev} から変更はありません`));
    const tbl = h("table", { class: "rev-table" }, h("tr", {}, ...["版", "日付", "担当", "内容", "変更点", ""].map((t) => h("th", {}, t))));
    revs.forEach((r, i) => {
      const changes = i ? diffSnapshots(revs[i - 1].snapshot, r.snapshot) : ["初版"];
      tbl.appendChild(
        h(
          "tr",
          {},
          h("td", {}, r.rev),
          h("td", {}, r.date),
          h("td", {}, r.author),
          h("td", {}, r.note),
          h("td", { class: "rev-changes" }, changes.slice(0, 6).join(" / ") + (changes.length > 6 ? ` 他 ${changes.length - 6} 件` : "")),
          h(
            "td",
            {},
            h(
              "button",
              {
                class: "btn",
                onClick: async () => {
                  if (!(await confirmDialog("版を復元", `版 ${r.rev} の形状・パラメータに戻します (元に戻す で取り消せます)。`, "復元"))) return;
                  app.store.mutate(`版 ${r.rev} を復元`, (d) => {
                    const s = JSON.parse(JSON.stringify(r.snapshot));
                    d.params = s.params;
                    d.features = s.features;
                    d.endOfPart = s.endOfPart;
                    d.material = s.material;
                  });
                  toast(`版 ${r.rev} を復元しました`, "ok");
                  render();
                },
              },
              "復元",
            ),
          ),
        ),
      );
    });
    if (revs.length) body.appendChild(tbl);
  };
  render();
  modal({
    title: "改訂履歴",
    icon: "iprops",
    body,
    width: 760,
    buttons: [
      {
        label: "改訂を記録…",
        primary: true,
        onClick: async () => {
          const doc = app.store.doc;
          const rev = nextRev(doc.revisions?.at(-1)?.rev);
          const note = await promptDialog(`版 ${rev} を記録`, "改訂内容", doc.revisions?.length ? "" : "初版");
          if (note === null) return false;
          const date = new Date().toISOString().slice(0, 10);
          app.store.mutate(`版 ${rev} を記録`, (d) => {
            (d.revisions ??= []).push({ rev, date, author: d.iprops["設計者"] ?? "", note, snapshot: snapshotOf(d) });
            if (d.drawing) d.drawing.title.revision = rev;
          });
          toast(`版 ${rev} を記録しました`, "ok");
          render();
          return false;
        },
      },
      { label: "閉じる" },
    ],
  });
}
