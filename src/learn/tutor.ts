import type { App } from "../app";
import { evaluateParams } from "../core/params";
import { confirmDialog, h, iconEl, toast } from "../ui/dom";
import { ALL_LESSONS, EXERCISES } from "./curriculum";
import { loadProgress, today, updateProgress } from "./progress";
import type { Exercise, LearnState, Lesson, LessonSetup } from "./types";

/** Read the running application into a LearnState snapshot. */
export function learnState(app: App): LearnState {
  const ed = app.sketchEditor;
  const cmd = app.command as (App["command"] & { hasResult?: boolean }) | null;
  return {
    env: app.env,
    mode: app.mode,
    part: app.store.doc,
    asm: app.asm.doc,
    values: evaluateParams(app.store.doc.params),
    command: cmd?.id ?? null,
    sketch: ed ? { id: ed.sketchId, tool: ed.tool, dof: ed.dof, ok: ed.solvedOk } : null,
    bodies: app.bodies.length,
    errors: Object.keys(app.featureErrors).length,
    style: app.vp.style,
    section: app.sectionActive,
    realistic: app.vp.realistic,
    analysisDone: !!cmd?.hasResult,
  };
}

/** Prepare the document a lesson starts from. Resolves false when the learner cancels. */
export async function applySetup(app: App, setup: LessonSetup): Promise<boolean> {
  document.querySelector(".welcome")?.remove();
  switch (setup.kind) {
    case "keep":
      return true;
    case "newPart": {
      const before = app.store.doc;
      await app.newDocument();
      return app.store.doc !== before;
    }
    case "part": {
      const doc = setup.make();
      await app.openPartDocument(doc);
      if (app.store.doc !== doc) return false;
      app.store.dirty = false;
      app.refreshUI();
      return true;
    }
    case "assembly": {
      if (!(await app.confirmDiscard())) return false;
      app.loadAssembly(setup.make());
      return true;
    }
  }
}

type Phase = "intro" | "steps" | "done" | "quiz" | "result";

/**
 * Floating coach panel: walks through a lesson step by step, checks the
 * learner's work by polling the app state, highlights the ribbon command to
 * use, then runs the lesson quiz. Also hosts free exercises with a live
 * requirement checklist.
 */
export class Tutor {
  private el: HTMLElement | null = null;
  private body!: HTMLElement;
  private timer = 0;
  private lesson: Lesson | null = null;
  private exercise: Exercise | null = null;
  private phase: Phase = "intro";
  private step = 0;
  private completed = new Set<number>();
  private hintOpen = false;
  private quizAt = 0;
  private quizCorrect = 0;
  private quizPicked: number | null = null;
  private lastReq = "";
  private glowing: Element[] = [];
  collapsed = false;

  constructor(
    private app: App,
    private openCenter: () => void,
  ) {}

  get active() {
    return !!this.el;
  }

  async startLesson(lesson: Lesson) {
    if (!(await this.confirmLeave())) return;
    if (!(await applySetup(this.app, lesson.setup))) return;
    this.reset();
    this.lesson = lesson;
    this.phase = "intro";
    updateProgress((p) => (p.last = lesson.id));
    this.mount();
  }

  async startExercise(ex: Exercise, fresh: boolean) {
    if (!(await this.confirmLeave())) return;
    if (fresh && !(await applySetup(this.app, { kind: "newPart" }))) return;
    this.reset();
    this.exercise = ex;
    this.mount();
  }

  close() {
    clearInterval(this.timer);
    this.clearGlow();
    this.el?.remove();
    this.el = null;
    this.lesson = null;
    this.exercise = null;
  }

  private async confirmLeave(): Promise<boolean> {
    if (!this.el || this.phase === "result" || (!this.lesson && !this.exercise)) return true;
    const name = this.lesson?.title ?? this.exercise?.title ?? "";
    return confirmDialog("レッスンの切り替え", `「${name}」を中断して新しいレッスンを始めますか?`, "切り替える");
  }

  private reset() {
    this.close();
    this.step = 0;
    this.completed.clear();
    this.hintOpen = false;
    this.quizAt = 0;
    this.quizCorrect = 0;
    this.quizPicked = null;
    this.lastReq = "";
    this.collapsed = false;
  }

  private mount() {
    this.body = h("div", { class: "ln-coach-body" });
    const title = this.lesson ? `レッスン ${this.lesson.id}` : "総合演習";
    const head = h(
      "div",
      { class: "ln-coach-head" },
      iconEl("learn"),
      h("span", { class: "ln-coach-title" }, title),
      h("span", { class: "spacer" }),
      h("button", { class: "icon-btn", title: "学習センター", onClick: () => this.openCenter() }, iconEl("menu")),
      h("button", { class: "icon-btn", title: "最小化 / 展開", onClick: () => ((this.collapsed = !this.collapsed), this.el!.classList.toggle("collapsed", this.collapsed)) }, iconEl("chevronDown")),
      h("button", { class: "icon-btn", title: "レッスンを閉じる", onClick: () => this.close() }, iconEl("close")),
    );
    this.el = h("aside", { class: "ln-coach", role: "complementary", "aria-label": "学習ガイド" }, head, this.body);
    this.makeDraggable(head);
    document.body.appendChild(this.el);
    this.render();
    this.timer = window.setInterval(() => this.tick(), 400);
  }

  private makeDraggable(head: HTMLElement) {
    head.addEventListener("pointerdown", (e) => {
      if ((e.target as HTMLElement).closest("button") || !this.el) return;
      const r = this.el.getBoundingClientRect();
      const dx = e.clientX - r.left;
      const dy = e.clientY - r.top;
      head.setPointerCapture(e.pointerId);
      const move = (ev: PointerEvent) => {
        if (!this.el) return;
        const x = Math.max(0, Math.min(window.innerWidth - r.width, ev.clientX - dx));
        const y = Math.max(0, Math.min(window.innerHeight - 40, ev.clientY - dy));
        Object.assign(this.el.style, { left: `${x}px`, top: `${y}px`, right: "auto", bottom: "auto" });
      };
      const up = () => {
        head.removeEventListener("pointermove", move);
        head.removeEventListener("pointerup", up);
      };
      head.addEventListener("pointermove", move);
      head.addEventListener("pointerup", up);
    });
  }

  // ---------------------------------------------------------------- tick ---

  private tick() {
    if (!this.el) return;
    let s: LearnState;
    try {
      s = learnState(this.app);
    } catch {
      return;
    }
    if (this.exercise) return this.tickExercise(s);
    const l = this.lesson;
    if (!l || this.phase !== "steps") return this.clearGlow();
    const st = l.steps[this.step];
    if (!st) return;
    this.glow(st.ui);
    let ok = false;
    try {
      ok = !!st.check?.(s);
    } catch {
      ok = false;
    }
    if (ok && !this.completed.has(this.step)) {
      this.completed.add(this.step);
      this.flash();
      window.setTimeout(() => this.advance(), 650);
    }
  }

  private tickExercise(s: LearnState) {
    const ex = this.exercise!;
    const res = ex.requirements.map((r) => {
      try {
        return r.check(s);
      } catch {
        return false;
      }
    });
    const key = res.map(Number).join("");
    if (key === this.lastReq) return;
    const first = this.lastReq === "";
    this.lastReq = key;
    this.render();
    if (!first && res.every(Boolean) && !loadProgress().exercises[ex.id]) {
      updateProgress((p) => (p.exercises[ex.id] = today()));
      toast(`🎉 ${ex.title} の要件をすべて満たしました!`, "ok", 5000);
      this.render();
    }
  }

  private glow(ui: string | string[] | undefined) {
    const list = ui === undefined ? [] : Array.isArray(ui) ? ui : [ui];
    const els = list.flatMap((u) => [...document.querySelectorAll(/^[.#[]/.test(u) ? u : `[data-cmd="${u}"]`)]);
    for (const e of this.glowing) if (!els.includes(e)) e.classList.remove("ln-glow");
    for (const e of els) e.classList.add("ln-glow");
    this.glowing = els;
  }

  private clearGlow() {
    for (const e of this.glowing) e.classList.remove("ln-glow");
    this.glowing = [];
  }

  private flash() {
    this.body.querySelector(".ln-step.current")?.classList.add("ok");
  }

  private advance() {
    const l = this.lesson;
    if (!l || this.phase !== "steps") return;
    this.step++;
    this.hintOpen = false;
    if (this.step >= l.steps.length) return this.finishSteps();
    this.enterStep();
    this.render();
  }

  private enterStep() {
    const st = this.lesson?.steps[this.step];
    // only bring the tab forward when it exists in the current environment
    if (st?.tab && this.app.ribbon.active !== st.tab && this.app.ribbon.isVisible(st.tab)) this.app.ribbon.setActive(st.tab);
  }

  private finishSteps() {
    const l = this.lesson!;
    this.clearGlow();
    this.phase = "done";
    updateProgress((p) => (p.done[l.id] = today()));
    this.render();
  }

  // -------------------------------------------------------------- render ---

  private render() {
    if (!this.el) return;
    this.body.innerHTML = "";
    if (this.exercise) return this.renderExercise();
    const l = this.lesson!;
    if (this.phase === "intro") this.renderIntro(l);
    else if (this.phase === "steps") this.renderSteps(l);
    else if (this.phase === "done") this.renderDone(l);
    else if (this.phase === "quiz") this.renderQuiz(l);
    else this.renderResult(l);
  }

  private renderIntro(l: Lesson) {
    this.body.append(
      h("h3", { class: "ln-h" }, l.title),
      h("div", { class: "ln-meta" }, h("span", {}, "★".repeat(l.level) + "☆".repeat(3 - l.level)), h("span", {}, `約 ${l.minutes} 分`), h("span", {}, `${l.steps.length} ステップ`)),
      h("div", { class: "ln-goals" }, h("b", {}, "このレッスンの目標"), h("ul", {}, ...l.goals.map((g) => h("li", {}, g)))),
      h("div", { class: "ln-theory", html: l.theory }),
      h(
        "div",
        { class: "ln-actions" },
        h("button", { class: "btn", onClick: () => this.openCenter() }, "一覧へ"),
        h("span", { class: "spacer" }),
        h(
          "button",
          {
            class: "btn primary",
            onClick: () => {
              this.phase = "steps";
              this.step = 0;
              this.enterStep();
              this.render();
            },
          },
          iconEl("play"),
          "操作をはじめる",
        ),
      ),
    );
  }

  private renderSteps(l: Lesson) {
    const st = l.steps[this.step];
    const progress = h("div", { class: "ln-progress" }, h("div", { class: "ln-progress-bar", style: `width:${(this.step / l.steps.length) * 100}%` }));
    const list = h("ol", { class: "ln-steps" });
    l.steps.forEach((s, i) => {
      const cls = i < this.step ? "done" : i === this.step ? "current" : "todo";
      const li = h("li", { class: `ln-step ${cls}` }, h("span", { class: "ln-step-no" }, i < this.step ? "✓" : String(i + 1)), h("div", { class: "ln-step-text", html: s.text }));
      if (i === this.step) {
        if (s.hint)
          li.appendChild(
            this.hintOpen
              ? h("div", { class: "ln-hint", html: s.hint })
              : h("button", { class: "ln-link", onClick: () => ((this.hintOpen = true), this.render()) }, "ヒントを見る"),
          );
        li.appendChild(h("div", { class: "ln-auto" }, s.check ? "● 操作が終わると自動で次に進みます" : "確認できたら「次へ」を押してください"));
      }
      list.appendChild(li);
    });
    this.body.append(
      h("h3", { class: "ln-h" }, l.title),
      progress,
      list,
      h(
        "div",
        { class: "ln-actions" },
        h("button", { class: "btn", disabled: this.step === 0, onClick: () => ((this.step = Math.max(0, this.step - 1)), this.completed.delete(this.step), this.enterStep(), this.render()) }, "戻る"),
        h("button", { class: "btn", onClick: () => ((this.phase = "intro"), this.render()) }, "解説"),
        h("span", { class: "spacer" }),
        st.check
          ? h("button", { class: "btn", title: "このステップを確認せずに進みます", onClick: () => (this.completed.add(this.step), this.advance()) }, "スキップ")
          : h("button", { class: "btn primary", onClick: () => (this.completed.add(this.step), this.advance()) }, "次へ"),
      ),
    );
    // keep the current step in view
    requestAnimationFrame(() => this.body.querySelector(".ln-step.current")?.scrollIntoView({ block: "nearest" }));
  }

  private renderDone(l: Lesson) {
    const next = ALL_LESSONS[ALL_LESSONS.indexOf(l) + 1];
    this.body.append(
      h("div", { class: "ln-done-badge" }, iconEl("check"), "レッスン完了!"),
      h("h3", { class: "ln-h" }, l.title),
      h("div", { class: "ln-goals" }, h("b", {}, "ふりかえり — 大切なポイント"), h("ul", {}, ...l.summary.map((g) => h("li", {}, g)))),
      h(
        "div",
        { class: "ln-actions" },
        next ? h("button", { class: "btn", onClick: () => void this.startLesson(next) }, "次のレッスンへ") : h("button", { class: "btn", onClick: () => this.openCenter() }, "学習センター"),
        h("span", { class: "spacer" }),
        l.quiz.length
          ? h(
              "button",
              {
                class: "btn primary",
                onClick: () => {
                  this.phase = "quiz";
                  this.quizAt = 0;
                  this.quizCorrect = 0;
                  this.quizPicked = null;
                  this.render();
                },
              },
              `確認テスト (${l.quiz.length} 問)`,
            )
          : null,
      ),
    );
  }

  private renderQuiz(l: Lesson) {
    const q = l.quiz[this.quizAt];
    const picked = this.quizPicked;
    const choices = h("div", { class: "ln-choices" });
    q.choices.forEach((c, i) => {
      const cls = picked === null ? "" : i === q.answer ? " right" : i === picked ? " wrong" : "";
      choices.appendChild(
        h(
          "button",
          {
            class: "ln-choice" + cls,
            disabled: picked !== null,
            onClick: () => {
              this.quizPicked = i;
              if (i === q.answer) this.quizCorrect++;
              this.render();
            },
          },
          h("span", { class: "ln-choice-key" }, "ABCD"[i]),
          c,
        ),
      );
    });
    const last = this.quizAt === l.quiz.length - 1;
    this.body.append(
      h("div", { class: "ln-meta" }, h("span", {}, `確認テスト ${this.quizAt + 1} / ${l.quiz.length}`)),
      h("p", { class: "ln-q" }, q.q),
      choices,
      picked !== null ? h("div", { class: "ln-explain " + (picked === q.answer ? "right" : "wrong") }, h("b", {}, picked === q.answer ? "正解! " : "残念… "), q.explain) : "",
      h(
        "div",
        { class: "ln-actions" },
        h("span", { class: "spacer" }),
        h(
          "button",
          {
            class: "btn primary",
            disabled: picked === null,
            onClick: () => {
              if (last) {
                this.phase = "result";
                const score: [number, number] = [this.quizCorrect, l.quiz.length];
                updateProgress((p) => {
                  const prev = p.quiz[l.id];
                  if (!prev || prev[0] < score[0]) p.quiz[l.id] = score;
                });
              } else {
                this.quizAt++;
                this.quizPicked = null;
              }
              this.render();
            },
          },
          last ? "結果を見る" : "次の問題",
        ),
      ),
    );
  }

  private renderResult(l: Lesson) {
    const n = l.quiz.length;
    const perfect = this.quizCorrect === n;
    const next = ALL_LESSONS[ALL_LESSONS.indexOf(l) + 1];
    this.body.append(
      h("div", { class: "ln-score" + (perfect ? " perfect" : "") }, h("strong", {}, `${this.quizCorrect} / ${n}`), h("span", {}, perfect ? "全問正解です!" : "解説を読み直して、もう一度挑戦してみましょう")),
      h(
        "div",
        { class: "ln-actions" },
        h(
          "button",
          {
            class: "btn",
            onClick: () => {
              this.phase = "quiz";
              this.quizAt = 0;
              this.quizCorrect = 0;
              this.quizPicked = null;
              this.render();
            },
          },
          "もう一度",
        ),
        h("button", { class: "btn", onClick: () => this.openCenter() }, "学習センター"),
        h("span", { class: "spacer" }),
        next ? h("button", { class: "btn primary", onClick: () => void this.startLesson(next) }, `次へ: ${next.id}`) : h("button", { class: "btn primary", onClick: () => this.close() }, "閉じる"),
      ),
    );
  }

  private renderExercise() {
    const ex = this.exercise!;
    const s = learnState(this.app);
    const res = ex.requirements.map((r) => {
      try {
        return r.check(s);
      } catch {
        return false;
      }
    });
    const n = res.filter(Boolean).length;
    this.body.append(
      h("h3", { class: "ln-h" }, ex.title),
      h("p", { class: "ln-brief" }, ex.brief),
      h("table", { class: "ln-spec" }, ...ex.spec.map(([k, v]) => h("tr", {}, h("th", {}, k), h("td", {}, v)))),
      h("div", { class: "ln-progress" }, h("div", { class: "ln-progress-bar", style: `width:${(n / res.length) * 100}%` })),
      h(
        "ul",
        { class: "ln-reqs" },
        ...ex.requirements.map((r, i) => h("li", { class: res[i] ? "ok" : "" }, h("span", { class: "ln-req-mark" }, res[i] ? "✓" : "○"), r.text)),
      ),
      h("details", { class: "ln-tips" }, h("summary", {}, "ヒント"), h("ul", {}, ...ex.tips.map((t) => h("li", {}, t)))),
      n === res.length ? h("div", { class: "ln-done-badge" }, iconEl("check"), "すべての要件を満たしました!") : "",
    );
  }
}

/** Look up helpers used by the learning center. */
export function lessonStatus(id: string): "done" | "started" | "new" {
  const p = loadProgress();
  if (p.done[id]) return "done";
  return p.last === id ? "started" : "new";
}

export { ALL_LESSONS, EXERCISES };
