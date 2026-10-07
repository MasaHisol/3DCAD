import type { App } from "../app";
import { h, iconEl, modal, toast } from "../ui/dom";
import { LIBRARY, type LibFamily } from "./standard";

let last = { family: "iso4762", size: "M6", length: 20 };

/** Content Center style browser for standard parts. */
export function openLibrary(app: App) {
  const inAsm = app.env === "assembly";
  let fam: LibFamily = LIBRARY.find((f) => f.id === last.family) ?? LIBRARY[0];
  const list = h("div", { class: "lib-list" });
  const sizeSel = h("select", { class: "field-input" });
  const lenSel = h("select", { class: "field-input" });
  const lenRow = h("label", { class: "field" }, h("span", { class: "field-label" }, "長さ L"), h("span", { class: "field-ctl" }, lenSel));
  const info = h("div", { class: "lib-info" });
  const spec = h("table", { class: "lib-spec" });

  const renderList = () => {
    list.innerHTML = "";
    let cat = "";
    for (const f of LIBRARY) {
      if (f.category !== cat) {
        cat = f.category;
        list.appendChild(h("div", { class: "lib-cat" }, cat));
      }
      list.appendChild(
        h(
          "button",
          {
            class: "lib-item" + (f === fam ? " on" : ""),
            onClick: () => {
              fam = f;
              renderList();
              fillSizes();
            },
          },
          iconEl(f.icon),
          h("span", {}, h("b", {}, f.name), h("small", {}, f.standard)),
        ),
      );
    }
  };
  const fillSizes = () => {
    sizeSel.innerHTML = "";
    for (const it of fam.items) sizeSel.appendChild(h("option", { value: it.size, selected: it.size === last.size }, it.size));
    if (!fam.items.some((it) => it.size === last.size)) sizeSel.value = fam.items[Math.min(3, fam.items.length - 1)].size;
    fillLengths();
  };
  const fillLengths = () => {
    const item = fam.items.find((it) => it.size === sizeSel.value)!;
    lenSel.innerHTML = "";
    for (const l of item.lengths) lenSel.appendChild(h("option", { value: String(l), selected: l === last.length }, `${l} mm`));
    if (item.lengths.length && !item.lengths.includes(last.length)) lenSel.value = String(item.lengths[Math.floor(item.lengths.length / 3)]);
    lenRow.style.display = item.lengths.length ? "" : "none";
    renderInfo();
  };
  const current = () => fam.build(sizeSel.value, Number(lenSel.value) || 0);
  const renderInfo = () => {
    const doc = current();
    info.innerHTML = "";
    info.append(h("div", { class: "lib-title" }, doc.iprops["パーツ番号"]), h("div", { class: "muted" }, fam.note));
    spec.innerHTML = "";
    for (const p of doc.params) spec.appendChild(h("tr", {}, h("th", {}, p.name), h("td", {}, `${p.expr} mm`), h("td", { class: "muted" }, p.comment ?? "")));
    spec.appendChild(h("tr", {}, h("th", {}, "材質"), h("td", { colspan: "2" }, doc.material.name)));
  };
  sizeSel.addEventListener("change", fillLengths);
  lenSel.addEventListener("change", renderInfo);
  renderList();
  fillSizes();

  const body = h(
    "div",
    { class: "lib" },
    list,
    h(
      "div",
      { class: "lib-detail" },
      h("label", { class: "field" }, h("span", { class: "field-label" }, "呼び"), h("span", { class: "field-ctl" }, sizeSel)),
      lenRow,
      info,
      spec,
    ),
  );
  const remember = () => (last = { family: fam.id, size: sizeSel.value, length: Number(lenSel.value) || last.length });
  modal({
    title: "標準部品ライブラリ (コンテンツ センター)",
    icon: "library",
    body,
    width: 720,
    buttons: [
      ...(inAsm
        ? [
            {
              label: "アセンブリに配置",
              primary: true,
              onClick: () => {
                remember();
                const doc = current();
                const num = doc.iprops["パーツ番号"];
                const existing = app.asm.doc.parts.find((p) => p.doc?.iprops?.["パーツ番号"] === num);
                if (existing) void app.asm.placeInstance(existing.id);
                else app.asm.placeDocument(doc);
                toast(`${num} を配置しました — 「拘束」(C) の「挿入」で穴に組み付けます`, "ok");
              },
            },
          ]
        : []),
      {
        label: "パーツとして開く",
        primary: !inAsm,
        onClick: async () => {
          remember();
          await app.openPartDocument(current());
        },
      },
      { label: "キャンセル" },
    ],
  });
}
