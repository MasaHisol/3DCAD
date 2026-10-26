import "./textbook.css";
import { CHAPTERS, PARTS, TEXT_GLOSSARY } from "./content";
import type { TextChapter } from "./types";
import { mountWidgets } from "./widgets";
import { installFigKit } from "./figkit";
import { renderMath } from "./math";
import { ROADMAP } from "../learn/roadmap";

// ------------------------------------------------------------ progress ---

installFigKit();

const KEY = "3dcad.textbook.v1";
interface Progress {
  read: Record<string, string>;
  quiz: Record<string, [number, number]>;
}
function load(): Progress {
  try {
    return { read: {}, quiz: {}, ...(JSON.parse(localStorage.getItem(KEY) ?? "{}") as Partial<Progress>) };
  } catch {
    return { read: {}, quiz: {} };
  }
}
function save(p: Progress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* progress just isn't remembered */
  }
}
const today = () => new Date().toISOString().slice(0, 10);

// ------------------------------------------------------------- helpers ---

const $ = <T extends HTMLElement = HTMLElement>(sel: string) => document.querySelector(sel) as T;
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const stars = (n: number) => "★".repeat(n) + "☆".repeat(3 - n);
const plain = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
const partOf = (c: TextChapter) => PARTS.find((p) => p.id === c.part)!;

/** Ask a running 3DCAD Studio window (same origin) to start a lesson; fall back to opening the app. */
function startLesson(id: string) {
  let acked = false;
  try {
    const ch = new BroadcastChannel("3dcad-learn");
    ch.onmessage = (e) => {
      if (e.data?.type === "ack" && e.data.id === id) acked = true;
    };
    ch.postMessage({ type: "start-lesson", id });
    setTimeout(() => {
      ch.close();
      if (!acked) window.open(`index.html#lesson=${encodeURIComponent(id)}`, "_blank");
      else flash(`3DCAD Studio でレッスン ${id} を開きました`);
    }, 1500);
  } catch {
    window.open(`index.html#lesson=${encodeURIComponent(id)}`, "_blank");
  }
}

function flash(msg: string) {
  const t = document.createElement("div");
  t.className = "tb-toast";
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3200);
}

// --------------------------------------------------------------- shell ---

function shell() {
  document.getElementById("app")!.innerHTML = `
<header class="tb-top">
  <button class="tb-menu" aria-label="目次" title="目次">☰</button>
  <a class="tb-brand" href="#/"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M2 9l10-5 10 5-10 5z" fill="currentColor" fill-opacity=".25"/><path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5M22 9v6"/></svg><span>設計の座学テキスト</span></a>
  <input class="tb-search" type="search" placeholder="検索 (例: たわみ、はめあい、抜き勾配)" aria-label="テキストを検索">
  <span class="tb-spacer"></span>
  <a class="tb-link" href="#/glossary">用語集</a>
  <button class="tb-iconbtn" data-act="print" title="印刷 / PDF">印刷</button>
  <button class="tb-iconbtn" data-act="theme" title="ライト / ダーク表示を切り替え">表示テーマ</button>
</header>
<div class="tb-layout">
  <nav class="tb-side" aria-label="目次"></nav>
  <main class="tb-main" tabindex="-1"></main>
</div>`;
  $(".tb-menu").addEventListener("click", () => document.body.classList.toggle("nav-open"));
  $("[data-act=print]").addEventListener("click", () => window.print());
  $("[data-act=theme]").addEventListener("click", () => {
    const r = document.documentElement;
    const dark = r.dataset.theme !== "dark" && !(r.dataset.theme !== "light" && matchMedia("(prefers-color-scheme: dark)").matches);
    r.dataset.theme = dark ? "dark" : "light";
    try {
      localStorage.setItem("3dcad.theme", r.dataset.theme);
    } catch {
      /* ignore */
    }
  });
  const search = $<HTMLInputElement>(".tb-search");
  search.addEventListener("input", () => {
    const q = search.value.trim();
    location.hash = q ? `#/search/${encodeURIComponent(q)}` : "#/";
  });
}

function renderNav(current: string) {
  const p = load();
  const nav = $(".tb-side");
  nav.innerHTML =
    `<a class="tb-nav-home${current === "" ? " on" : ""}" href="#/">はじめに・進捗</a>` +
    PARTS.map((part) => {
      const chs = CHAPTERS.filter((c) => c.part === part.id);
      const n = chs.filter((c) => p.read[c.id]).length;
      return `<div class="tb-nav-part" style="--part:${part.color}"><div class="tb-nav-title">${part.title}<small>${n}/${chs.length}</small></div>${chs
        .map((c) => `<a href="#/c/${c.id}" class="${c.id === current ? "on" : ""}${p.read[c.id] ? " read" : ""}"><span class="dot"></span>${c.title}</a>`)
        .join("")}</div>`;
    }).join("") +
    `<a class="tb-nav-home${current === "glossary" ? " on" : ""}" href="#/glossary">用語集 (${TEXT_GLOSSARY.length} 語)</a>`;
}

// --------------------------------------------------------------- pages ---

function home() {
  const p = load();
  const read = CHAPTERS.filter((c) => p.read[c.id]).length;
  const total = CHAPTERS.reduce((s, c) => s + c.minutes, 0);
  const next = CHAPTERS.find((c) => !p.read[c.id]);
  return `
<section class="tb-hero">
  <h1>3D 設計のための座学テキスト</h1>
  <p>3D CAD の操作を覚えるだけでは、良い設計はできません。このテキストでは、設計の進め方・製図・公差・材料から、
  部品の強さを見積もる<b>構造力学</b>、作りやすく使いやすい製品にする<b>設計ノウハウ</b>と<b>プロダクトデザイン</b>までを、
  計算ツールと例題で学びます。3DCAD Studio の学習センター (実習) と合わせて使うと効果的です。</p>
  <div class="tb-progress-row"><div class="tb-progress"><div style="width:${(read / CHAPTERS.length) * 100}%"></div></div><span>${read} / ${CHAPTERS.length} 章 読了 (全体で約 ${Math.round(total / 60)} 時間)</span></div>
  ${next ? `<a class="tb-btn primary" href="#/c/${next.id}">${read ? "続きから読む" : "最初から読む"}: ${next.title} →</a>` : `<p class="tb-good">全章読了です。用語集と計算ツールで復習しましょう。</p>`}
</section>
<section class="tb-road">
  <h2>学習ロードマップ — 2D から 3D、設計へ</h2>
  <ol>${ROADMAP.map((st) => {
    const chs = CHAPTERS.filter((c) => st.textbook.includes(c.part));
    const n = chs.filter((c) => p.read[c.id]).length;
    return `<li class="${n === chs.length ? "done" : ""}"><b>STEP ${st.step} ${st.title}</b><span>${st.goal}</span><small>テキスト: ${st.textbook.map((id) => PARTS.find((x) => x.id === id)?.title.replace(/^第 \d+ 部 /, "") ?? id).join("・")} (${n}/${chs.length} 章)${chs[0] ? ` — <a href="#/c/${(chs.find((c) => !p.read[c.id]) ?? chs[0]).id}">読む</a>` : ""}</small></li>`;
  }).join("")}</ol>
  <p class="tb-note">アプリの学習センターでは、同じ順番で実習レッスン (第 0 章 2D 作図 → 第 1〜8 章) を進められます。</p>
</section>
<div class="tb-parts">
${PARTS.map((part) => {
  const chs = CHAPTERS.filter((c) => c.part === part.id);
  return `<section class="tb-part" style="--part:${part.color}"><h2>${part.title}</h2><p>${part.desc}</p><ol>${chs
    .map((c) => {
      const q = p.quiz[c.id];
      return `<li class="${p.read[c.id] ? "read" : ""}"><a href="#/c/${c.id}">${c.title}</a><span class="meta">${stars(c.level)} · ${c.minutes} 分${q ? ` · テスト ${q[0]}/${q[1]}` : ""}</span></li>`;
    })
    .join("")}</ol></section>`;
}).join("")}
</div>
<section class="tb-howto">
  <h2>このテキストの使い方</h2>
  <ul>
    <li>各章は <b>本文 → 計算ツール → 要点 → 計算練習 → 確認テスト</b> の順に進みます</li>
    <li><span class="tb-widget-badge">計算ツール</span> は数値を変えるとすぐに結果が更新されます。自分の設計の概算にも使えます</li>
    <li>計算練習は、まず自分で解いてから「解答を見る」で確かめましょう</li>
    <li>確認テストを全問解くと、その章は読了になります。進捗はこのコンピュータに保存されます</li>
    <li>「印刷」で章を紙や PDF にできます (授業の配布資料に)</li>
  </ul>
  <p class="tb-note">数値は教育用の代表値・簡略化した式です。実際の製品設計では、規格・材料メーカーのデータ・専門書で確認してください。</p>
</section>`;
}

function chapter(c: TextChapter) {
  const p = load();
  const i = CHAPTERS.indexOf(c);
  const prev = CHAPTERS[i - 1];
  const next = CHAPTERS[i + 1];
  const part = partOf(c);
  return `
<article class="tb-article" style="--part:${part.color}">
  <div class="tb-crumb">${part.title}</div>
  <h1>${c.title}</h1>
  <div class="tb-meta">${stars(c.level)}<span>約 ${c.minutes} 分</span>${p.read[c.id] ? `<span class="tb-good">✓ 読了 ${p.read[c.id]}</span>` : ""}</div>
  <p class="tb-lead">${c.lead}</p>
  <div class="tb-body">${c.body}</div>
  <section class="tb-points"><h2>この章の要点</h2><ul>${c.points.map((x) => `<li>${x}</li>`).join("")}</ul></section>
  ${
    c.lessons?.length
      ? `<section class="tb-practice"><h2>3DCAD Studio で実習する</h2><p>この章の内容は、アプリの学習センターのレッスンで実際に操作して確かめられます。</p>${c.lessons.map((l) => `<button class="tb-btn" data-lesson="${l}">レッスン ${l} を開く</button>`).join(" ")}</section>`
      : ""
  }
  ${
    c.exercises.length
      ? `<section class="tb-exercises"><h2>計算練習・考えてみよう</h2>${c.exercises.map((e, k) => `<div class="tb-ex"><p><b>問 ${k + 1}</b> ${e.q}</p><details><summary>解答を見る</summary><div>${e.a}</div></details></div>`).join("")}</section>`
      : ""
  }
  <section class="tb-quiz"><h2>確認テスト</h2>${c.quiz
    .map(
      (q, k) =>
        `<div class="tb-q" data-q="${k}"><p><b>Q${k + 1}.</b> ${q.q}</p><div class="tb-choices">${q.choices.map((ch, j) => `<button data-c="${j}">${"ABCD"[j]}. ${esc(ch)}</button>`).join("")}</div><div class="tb-explain"></div></div>`,
    )
    .join("")}<div class="tb-score"></div></section>
  <nav class="tb-pager">${prev ? `<a href="#/c/${prev.id}">← ${prev.title}</a>` : "<span></span>"}<button class="tb-btn" data-act="read">${p.read[c.id] ? "未読に戻す" : "読了にする"}</button>${next ? `<a href="#/c/${next.id}">${next.title} →</a>` : `<a href="#/">目次へ</a>`}</nav>
</article>`;
}

function wireChapter(c: TextChapter, main: HTMLElement) {
  renderMath(main);
  mountWidgets(main);
  const answered = new Map<number, boolean>();
  for (const box of main.querySelectorAll<HTMLElement>(".tb-q")) {
    const k = Number(box.dataset.q);
    const q = c.quiz[k];
    box.querySelectorAll<HTMLButtonElement>("button").forEach((b) =>
      b.addEventListener("click", () => {
        if (answered.has(k)) return;
        const j = Number(b.dataset.c);
        answered.set(k, j === q.answer);
        box.querySelectorAll<HTMLButtonElement>("button").forEach((x) => {
          x.disabled = true;
          if (Number(x.dataset.c) === q.answer) x.classList.add("right");
        });
        if (j !== q.answer) b.classList.add("wrong");
        box.querySelector(".tb-explain")!.innerHTML = `<b>${j === q.answer ? "正解!" : "不正解"}</b> ${q.explain}`;
        box.querySelector(".tb-explain")!.classList.add(j === q.answer ? "right" : "wrong");
        if (answered.size === c.quiz.length) {
          const n = [...answered.values()].filter(Boolean).length;
          const p = load();
          const prev = p.quiz[c.id];
          if (!prev || prev[0] < n) p.quiz[c.id] = [n, c.quiz.length];
          p.read[c.id] ??= today();
          save(p);
          main.querySelector(".tb-score")!.innerHTML = `<div class="${n === c.quiz.length ? "tb-good" : ""}">${n} / ${c.quiz.length} 問正解 — ${n === c.quiz.length ? "よくできました!" : "解説を読んで、本文を見直しましょう。"} この章を読了にしました。</div>`;
          renderNav(c.id);
        }
      }),
    );
  }
  main.querySelector("[data-act=read]")?.addEventListener("click", () => {
    const p = load();
    if (p.read[c.id]) delete p.read[c.id];
    else p.read[c.id] = today();
    save(p);
    route();
  });
  main.querySelectorAll<HTMLButtonElement>("[data-lesson]").forEach((b) => b.addEventListener("click", () => startLesson(b.dataset.lesson!)));
}

function glossary() {
  return `<article class="tb-article"><h1>用語集</h1><p class="tb-lead">設計・構造力学・製造・デザインの用語 ${TEXT_GLOSSARY.length} 語。上の検索欄からも探せます。</p><dl class="tb-gloss">${TEXT_GLOSSARY.map(
    (g) => `<dt>${g.term}${g.en ? `<small>${g.en}</small>` : ""}</dt><dd>${g.desc}</dd>`,
  ).join("")}</dl></article>`;
}

function searchPage(q: string) {
  const ql = q.toLowerCase();
  const hits = CHAPTERS.map((c) => {
    const text = plain(`${c.title} ${c.lead} ${c.body} ${c.points.join(" ")}`);
    const i = text.toLowerCase().indexOf(ql);
    return i < 0 ? null : { c, snip: text.slice(Math.max(0, i - 40), i + 80) };
  }).filter((x): x is { c: TextChapter; snip: string } => !!x);
  const terms = TEXT_GLOSSARY.filter((g) => `${g.term} ${g.en ?? ""} ${g.desc}`.toLowerCase().includes(ql));
  const mark = (s: string) => esc(s).replace(new RegExp(esc(q).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), (m) => `<mark>${m}</mark>`);
  return `<article class="tb-article"><h1>「${esc(q)}」の検索結果</h1>
${hits.length ? `<ul class="tb-hits">${hits.map((h) => `<li><a href="#/c/${h.c.id}">${h.c.title}</a><small>${partOf(h.c).title}</small><p>…${mark(h.snip)}…</p></li>`).join("")}</ul>` : "<p>本文に一致する章はありません。</p>"}
${terms.length ? `<h2>用語</h2><dl class="tb-gloss">${terms.map((g) => `<dt>${g.term}${g.en ? `<small>${g.en}</small>` : ""}</dt><dd>${mark(g.desc)}</dd>`).join("")}</dl>` : ""}</article>`;
}

// --------------------------------------------------------------- route ---

function route() {
  const main = $(".tb-main");
  const h = decodeURIComponent(location.hash.replace(/^#\/?/, ""));
  document.body.classList.remove("nav-open");
  let cur = "";
  if (h.startsWith("c/")) {
    const c = CHAPTERS.find((x) => x.id === h.slice(2));
    if (c) {
      main.innerHTML = chapter(c);
      wireChapter(c, main);
      cur = c.id;
      document.title = `${c.title} — 設計の座学テキスト`;
    } else main.innerHTML = home();
  } else if (h === "glossary") {
    main.innerHTML = glossary();
    cur = "glossary";
    document.title = "用語集 — 設計の座学テキスト";
  } else if (h.startsWith("search/")) {
    main.innerHTML = searchPage(h.slice(7));
    cur = "search";
  } else {
    main.innerHTML = home();
    document.title = "設計の座学テキスト — 3DCAD Studio";
  }
  if (!h.startsWith("search/")) $<HTMLInputElement>(".tb-search").value = "";
  renderNav(cur);
  if (!h.startsWith("search/")) main.scrollTo(0, 0);
}

shell();
window.addEventListener("hashchange", route);
route();
