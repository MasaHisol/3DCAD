// 使い方ヘルプの画面: 左に検索できる索引、右にコマンドのページ (目的・手順・図解・ヒント・関連)。
import "./help.css";
import type { App } from "../app";
import { h, iconEl } from "../ui/dom";
import { HELP_PAGES, LESSON_TITLES, type HelpPage } from "./content";
import { figure } from "./figures";
import { searchHelp } from "./search";
import { TEXTBOOK_TITLES, openTextbook } from "../learn/textbookLink";
import { startLessonById } from "../learn/lazy";

const byId = new Map(HELP_PAGES.map((p) => [p.id, p]));

/** Help page for an id; ribbon commands added later without a page get one from their tooltip. */
export function pageFor(app: App, id: string): HelpPage | null {
  const p = byId.get(id);
  if (p) return p;
  const loc = app.ribbon?.locate(id);
  if (!loc) return null;
  return { id, title: loc.def.label, cat: loc.tab, purpose: loc.def.tip ?? `${loc.def.label} を実行します。`, steps: [`「${loc.tab}」タブの「${loc.def.label}」をクリックします。`] };
}

export function showHelp(app: App, id: string | null) {
  document.querySelector(".help-back")?.remove();
  const input = h("input", { class: "help-search", type: "search", placeholder: "ヘルプを検索 (例: 押し出し、測定、断面、bom)…", spellcheck: "false", "aria-label": "ヘルプを検索" });
  const list = h("nav", { class: "help-index", "aria-label": "ヘルプの索引" });
  const body = h("article", { class: "help-page" });
  const close = () => back.remove();
  const win = h(
    "div",
    { class: "help-win", role: "dialog", "aria-label": "使い方ヘルプ" },
    h("header", { class: "help-head" }, iconEl("help"), h("strong", {}, "使い方ヘルプ"), input, h("button", { class: "icon-btn", title: "閉じる (Esc)", onClick: close }, iconEl("close"))),
    h("div", { class: "help-main" }, list, body),
  );
  const back = h("div", { class: "help-back" }, win);
  let current: string | null = null;

  const renderIndex = () => {
    const shown = searchHelp(HELP_PAGES, input.value);
    list.innerHTML = "";
    if (!shown.length) list.appendChild(h("div", { class: "help-empty" }, "一致するヘルプがありません"));
    const q = input.value.trim();
    const groups = new Map<string, HelpPage[]>();
    for (const p of shown) {
      const k = q ? "検索結果" : p.cat;
      groups.set(k, [...(groups.get(k) ?? []), p]);
    }
    for (const [cat, ps] of groups) {
      list.appendChild(h("div", { class: "help-cat" }, cat));
      for (const p of ps)
        list.appendChild(h("button", { class: "help-item" + (p.id === current ? " on" : ""), "data-help": p.id, onClick: () => show(p.id) }, p.title));
    }
  };

  const link = (text: string, fn: () => void, cls = "help-link") => h("button", { class: cls, onClick: fn }, text);
  const show = (pid: string | null) => {
    const p = pid ? pageFor(app, pid) : null;
    current = p?.id ?? null;
    body.innerHTML = "";
    body.scrollTop = 0;
    if (!p) {
      body.append(
        h("h1", {}, "使い方ヘルプ"),
        h("p", {}, "左の索引からコマンドを選ぶか、上の検索欄に名前を入力してください。"),
        h("ul", {}, h("li", {}, "リボンのボタンにカーソルを合わせて F1 (または ?) を押すと、そのコマンドのページが開きます。"), h("li", {}, "ツールチップの「ヘルプ」からも開けます。"), h("li", {}, `全 ${HELP_PAGES.length} ページ`)),
        h("div", { html: figure("viewer") }),
      );
      renderIndex();
      return;
    }
    const loc = app.ribbon?.locate(p.id);
    const def = loc?.def;
    body.append(
      h("div", { class: "help-crumb" }, p.cat, loc ? ` — リボン: ${loc.tab} › ${loc.panel}` : ""),
      h("h1", {}, def ? iconEl(def.icon) : null, p.title, def?.shortcut ? h("kbd", {}, def.shortcut) : null),
      h("p", { class: "help-purpose" }, p.purpose),
    );
    if (p.fig) body.appendChild(h("div", { html: figure(p.fig) }));
    body.append(h("h2", {}, "操作手順"), h("ol", { class: "help-steps" }, ...p.steps.map((s) => h("li", {}, s))));
    if (p.tips?.length) body.append(h("h2", {}, "ヒント"), h("ul", { class: "help-tips" }, ...p.tips.map((s) => h("li", {}, s))));
    const rel = (p.related ?? []).map((r) => pageFor(app, r)).filter((x): x is HelpPage => !!x);
    if (rel.length) body.append(h("h2", {}, "関連するコマンド"), h("div", { class: "help-chips" }, ...rel.map((r) => link(r.title, () => show(r.id), "help-chip"))));
    const learn: HTMLElement[] = [];
    for (const l of p.lessons ?? [])
      if (LESSON_TITLES[l])
        learn.push(h("li", {}, link(`レッスン ${l}: ${LESSON_TITLES[l]}`, () => (close(), void startLessonById(app, l)))));
    for (const c of p.chapters ?? []) if (TEXTBOOK_TITLES[c]) learn.push(h("li", {}, link(`座学テキスト: ${TEXTBOOK_TITLES[c]}`, () => openTextbook(c))));
    if (learn.length) body.append(h("h2", {}, "学習センター・座学テキスト"), h("ul", { class: "help-learn" }, ...learn));
    if (def && app.ribbon.isAvailable(p.id)) body.append(h("div", { class: "help-run" }, h("button", { class: "btn primary", onClick: () => (close(), def.action()) }, iconEl(def.icon), `「${p.title}」を実行`)));
    renderIndex();
    list.querySelector(".help-item.on")?.scrollIntoView({ block: "nearest" });
  };

  input.addEventListener("input", renderIndex);
  input.addEventListener("keydown", (e) => {
    e.stopPropagation();
    if (e.key === "Escape") close();
    if (e.key === "Enter") {
      const first = list.querySelector<HTMLElement>(".help-item");
      if (first) show(first.dataset.help!);
    }
  });
  back.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
  back.addEventListener("pointerdown", (e) => e.target === back && close());
  document.body.appendChild(back);
  show(id);
  input.focus();
}
