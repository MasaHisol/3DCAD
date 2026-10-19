import type { App } from "../app";
import { confirmDialog, h, iconEl, modal } from "../ui/dom";
import { ALL_LESSONS, CURRICULUM, EXERCISES, GLOSSARY } from "./curriculum";
import { loadProgress, resetProgress } from "./progress";
import { ROADMAP } from "./roadmap";
import { openTextbook } from "./textbookLink";
import { Tutor } from "./tutor";
import type { Lesson } from "./types";

let tutor: Tutor | null = null;
let lastTab: "course" | "exercise" | "glossary" | "guide" = "course";

/** Start a lesson by id (from the textbook window). */
export function startLessonById(app: App, id: string): boolean {
  const l = ALL_LESSONS.find((x) => x.id === id);
  if (!l) return false;
  document.querySelector(".ln-center")?.closest(".modal-back")?.remove();
  void getTutor(app).startLesson(l);
  return true;
}

/** The coach panel singleton (created on first use). */
export function getTutor(app: App): Tutor {
  if (!tutor) tutor = new Tutor(app, () => openLearningCenter(app));
  return tutor;
}

const stars = (n: number) => "★".repeat(n) + "☆".repeat(3 - n);

/** 学習センター: course overview with progress, exercises and glossary. */
export function openLearningCenter(app: App) {
  document.querySelector(".ln-center")?.closest(".modal-back")?.remove();
  const t = getTutor(app);
  const tabs = h("div", { class: "ln-tabs", role: "tablist" });
  const pane = h("div", { class: "ln-pane" });
  const body = h("div", { class: "ln-center" }, tabs, pane);
  let dlg: { close: () => void } | null = null;

  const start = (l: Lesson) => {
    dlg?.close();
    void t.startLesson(l);
  };

  const course = () => {
    const p = loadProgress();
    const done = ALL_LESSONS.filter((l) => p.done[l.id]).length;
    const next = ALL_LESSONS.find((l) => !p.done[l.id]);
    pane.append(
      h(
        "div",
        { class: "ln-overview" },
        h(
          "div",
          { class: "ln-overview-text" },
          h("strong", {}, `${done} / ${ALL_LESSONS.length} レッスン完了`),
          h("div", { class: "ln-progress big" }, h("div", { class: "ln-progress-bar", style: `width:${(done / ALL_LESSONS.length) * 100}%` })),
          h("span", {}, next ? `次のおすすめ: ${next.id} ${next.title}` : "全レッスン修了! 総合演習に挑戦しましょう"),
        ),
        h("button", { class: "btn", title: "設計の基礎・構造力学・設計ノウハウ・デザインの座学テキストを別ウィンドウで開きます", onClick: () => openTextbook() }, iconEl("open"), "座学テキスト"),
        next ? h("button", { class: "btn primary", onClick: () => start(next) }, iconEl("play"), done ? "続きから" : "最初から始める") : null,
      ),
    );
    // learning path: 2D → 3D → assembly / drawing → verification → applied design
    const road = h("div", { class: "ln-road" });
    for (const st of ROADMAP) {
      const lessons = CURRICULUM.filter((c) => st.chapters.includes(c.id)).flatMap((c) => c.lessons);
      const n = lessons.filter((l) => p.done[l.id]).length;
      const first = lessons.find((l) => !p.done[l.id]) ?? lessons[0];
      road.appendChild(
        h(
          "button",
          { class: "ln-road-step" + (n === lessons.length ? " done" : n ? " doing" : ""), title: `${st.goal} — クリックで開始`, onClick: () => first && start(first) },
          h("span", { class: "ln-road-no" }, n === lessons.length ? "✓" : String(st.step)),
          h("b", {}, st.title),
          h("small", {}, `${n} / ${lessons.length} レッスン`),
        ),
      );
    }
    pane.append(h("div", { class: "ln-road-title" }, "学習ロードマップ — 2D から 3D、設計へ"), road);
    for (const ch of CURRICULUM) {
      const n = ch.lessons.filter((l) => p.done[l.id]).length;
      const sec = h(
        "section",
        { class: "ln-chapter" },
        h("div", { class: "ln-chapter-head" }, h("h3", {}, ch.title), h("span", { class: "ln-chapter-count" + (n === ch.lessons.length ? " full" : "") }, `${n} / ${ch.lessons.length}`)),
        h("p", { class: "ln-chapter-desc" }, ch.desc),
      );
      for (const l of ch.lessons) {
        const q = p.quiz[l.id];
        sec.appendChild(
          h(
            "div",
            { class: "ln-lesson" + (p.done[l.id] ? " done" : "") },
            h("span", { class: "ln-lesson-mark" }, p.done[l.id] ? "✓" : l.id),
            h(
              "div",
              { class: "ln-lesson-main" },
              h("b", {}, l.title),
              h("small", {}, l.goals.join(" / ")),
            ),
            h("span", { class: "ln-lesson-meta" }, h("span", { title: "難易度" }, stars(l.level)), h("span", {}, `${l.minutes} 分`), q ? h("span", { class: "ln-quiz-score" + (q[0] === q[1] ? " perfect" : "") }, `テスト ${q[0]}/${q[1]}`) : null),
            h("button", { class: "btn" + (p.done[l.id] ? "" : " primary"), onClick: () => start(l) }, p.done[l.id] ? "復習" : "開始"),
          ),
        );
      }
      pane.appendChild(sec);
    }
    pane.appendChild(
      h(
        "div",
        { class: "ln-reset" },
        h(
          "button",
          {
            class: "ln-link",
            onClick: async () => {
              if (!(await confirmDialog("進捗のリセット", "レッスンの完了状況とテストの点数をすべて消去しますか?", "リセット"))) return;
              resetProgress();
              render();
            },
          },
          "進捗をリセット",
        ),
      ),
    );
  };

  const exercises = () => {
    const p = loadProgress();
    pane.appendChild(h("p", { class: "ln-intro" }, "レッスンで学んだことを組み合わせて、自分で考えて設計する課題です。要件はモデルを見て自動でチェックされます (形や寸法の正解は 1 つではありません)。"));
    for (const ex of EXERCISES) {
      pane.appendChild(
        h(
          "section",
          { class: "ln-ex" + (p.exercises[ex.id] ? " done" : "") },
          h("div", { class: "ln-chapter-head" }, h("h3", {}, ex.title), h("span", { class: "ln-lesson-meta" }, stars(ex.level), p.exercises[ex.id] ? h("span", { class: "ln-quiz-score perfect" }, "達成") : null)),
          h("p", { class: "ln-chapter-desc" }, ex.brief),
          h("table", { class: "ln-spec" }, ...ex.spec.map(([k, v]) => h("tr", {}, h("th", {}, k), h("td", {}, v)))),
          h(
            "div",
            { class: "ln-actions" },
            h("span", { class: "spacer" }),
            h("button", { class: "btn", title: "今開いているモデルで要件をチェックします", onClick: () => (dlg?.close(), void t.startExercise(ex, false)) }, "今のモデルでチェック"),
            h("button", { class: "btn primary", onClick: () => (dlg?.close(), void t.startExercise(ex, true)) }, iconEl("new"), "新規パーツで挑戦"),
          ),
        ),
      );
    }
  };

  const glossary = () => {
    const input = h("input", { class: "field-input ln-search", placeholder: "用語を検索 (例: 拘束、fillet)…", spellcheck: "false" });
    const list = h("dl", { class: "ln-glossary" });
    const fill = () => {
      const q = input.value.trim().toLowerCase();
      list.innerHTML = "";
      for (const g of GLOSSARY) {
        if (q && !`${g.term} ${g.en ?? ""} ${g.desc}`.toLowerCase().includes(q)) continue;
        list.append(h("dt", {}, g.term, g.en ? h("small", {}, g.en) : null), h("dd", {}, g.desc));
      }
      if (!list.children.length) list.appendChild(h("p", { class: "ln-intro" }, "該当する用語がありません"));
    };
    input.addEventListener("input", fill);
    input.addEventListener("keydown", (e) => e.stopPropagation());
    pane.append(input, list);
    fill();
  };

  const guide = () => {
    pane.innerHTML = `
<div class="ln-theory">
<h3>この学習コースについて</h3>
<p>3DCAD Studio の中で、実際に手を動かしながら <b>3D 設計を基礎から</b> 学べるコースです。各レッスンは次の流れで進みます。</p>
<ol>
  <li><b>解説</b> — その回で学ぶ考え方 (なぜそうするのか) を読む</li>
  <li><b>操作</b> — 右下のガイドの指示どおりに操作する。使うボタンは<span class="ln-glow-demo">光って</span>表示され、操作が終わると<b>自動で判定</b>されて次へ進みます</li>
  <li><b>ふりかえり</b> — 大切なポイントを確認</li>
  <li><b>確認テスト</b> — 2〜3 問のクイズで理解度をチェック</li>
</ol>
<h3>おすすめの進め方</h3>
<table class="ln-table">
  <tr><th>段階</th><th>レッスン</th><th>身につくこと</th></tr>
  <tr><td>2D 作図 (約 1 時間)</td><td>第 0 章 + テキスト「2D CAD 入門」</td><td>座標・基本図形・トリム・拘束・寸法・DXF・図面への記入 — 3D の土台</td></tr>
  <tr><td>入門 (約 1 時間)</td><td>第 1〜2 章</td><td>画面操作、パラメトリックの考え方、スケッチと拘束</td></tr>
  <tr><td>基礎 (約 1 時間)</td><td>第 3〜4 章</td><td>押し出し・回転・穴・フィレット・パターン、パラメータ設計</td></tr>
  <tr><td>応用 (約 1 時間)</td><td>第 5〜7 章</td><td>アセンブリ、図面、解析、製造データ</td></tr>
  <tr><td>発展 (約 45 分)</td><td>第 8 章</td><td>スイープ・ロフト・板金</td></tr>
  <tr><td>総合演習</td><td>演習 0〜8</td><td>要件から自分で設計する力 (板金カバー・ダクト・リンク機構を含む)</td></tr>
</table>
<h3>困ったときは</h3>
<ul>
  <li>操作を間違えたら <kbd>Ctrl</kbd>+<kbd>Z</kbd> (元に戻す)。コマンドの途中なら <kbd>Esc</kbd></li>
  <li>ステップが進まないときは「ヒントを見る」、どうしても進めないときは「スキップ」</li>
  <li>ガイドはヘッダーをドラッグして移動、<b>∨</b> で最小化できます</li>
  <li>レッスンは毎回、専用の練習モデルから始まります。作業中のモデルは先に保存しておきましょう</li>
</ul>
<h3>座学テキスト</h3>
<p>操作の実習とは別に、<b>設計の基礎・構造力学 (材料力学)・設計ノウハウ・プロダクトデザイン</b> を学ぶ座学テキストがあります (11 部 120 章、機械要素・振動・熱・コスト・安全設計を含む。計算ツール・計算練習・確認テスト付き)。
「コース」タブの <b>座学テキスト</b> ボタン、または各レッスンの解説にあるリンクから別ウィンドウで開けます。テキストからレッスンを開くこともできます。</p>
<p class="ln-note">進捗はこのコンピュータ (ブラウザ / アプリ) に保存されます。紙の教材として使える解説は <code>docs/learning/</code> にもあります。</p>
</div>`;
  };

  const TABS: [typeof lastTab, string, () => void][] = [
    ["course", "コース", course],
    ["exercise", "総合演習", exercises],
    ["glossary", "用語集", glossary],
    ["guide", "使い方", guide],
  ];
  const render = () => {
    tabs.innerHTML = "";
    pane.innerHTML = "";
    for (const [id, label] of TABS)
      tabs.appendChild(h("button", { class: "ln-tab" + (id === lastTab ? " on" : ""), role: "tab", "aria-selected": String(id === lastTab), onClick: () => ((lastTab = id), render()) }, label));
    TABS.find(([id]) => id === lastTab)![2]();
    pane.scrollTop = 0;
  };
  render();
  dlg = modal({ title: "学習センター — 3D 設計を基礎から学ぶ", icon: "learn", body, width: 820, buttons: [{ label: "閉じる", primary: true }] });
}
