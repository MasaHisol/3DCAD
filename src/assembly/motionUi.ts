import { formatNumber } from "../core/expr";
import { evalWith, evaluateParams } from "../core/params";
import { toast } from "../ui/dom";
import { PropertyPanel } from "../ui/panel";
import type { AssemblyEnv } from "./env";

/**
 * Drive constraint (Inventor 拘束を駆動): step an angle / offset constraint
 * from a start to an end value, re-solving every frame. Optionally stops on
 * the first collision. The constraint value is restored when closed.
 */
export function startDrive(env: AssemblyEnv, constraintId?: string) {
  const app = env.app;
  const cons = env.doc.constraints.filter((c) => !c.suppressed);
  const target = cons.find((c) => c.id === constraintId) ?? cons.find((c) => c.type === "angle") ?? cons.find((c) => c.type !== "axis");
  if (!target) {
    toast("駆動できる拘束がありません (角度・メイト・フラッシュ・挿入のオフセットを駆動します)", "warn");
    return;
  }
  if (target.type === "axis") {
    toast("軸合わせ拘束には駆動する値がありません", "warn");
    return;
  }
  app.cancelAsmCommand();
  const values = () => evaluateParams(env.doc.params);
  let original = target.offset;
  let cur = 0;
  try {
    cur = evalWith(values(), target.offset);
  } catch {
    /* 0 */
  }
  const unit = target.type === "angle" ? "deg" : "mm";
  const st = { from: String(cur), to: String(target.type === "angle" ? cur + 90 : cur + 20), steps: "60", collide: false, reverse: false };
  let timer = 0;
  let running = false;

  const setValue = (v: number) => {
    const c = env.doc.constraints.find((x) => x.id === target.id);
    if (!c) return;
    c.offset = formatNumber(v, 4);
    env.solve();
    env.render();
  };
  const stop = () => {
    running = false;
    clearTimeout(timer);
    app.ribbon.refresh();
  };
  const run = async (dir: 1 | -1) => {
    if (running) return stop();
    const v = values();
    let a: number, b: number, n: number;
    try {
      a = evalWith(v, st.from);
      b = evalWith(v, st.to);
      n = Math.max(1, Math.min(2000, Math.round(evalWith(v, st.steps))));
    } catch (e) {
      panel.setError((e as Error).message);
      return;
    }
    panel.setError(null);
    if (dir < 0) [a, b] = [b, a];
    running = true;
    for (let i = 0; i <= n && running; i++) {
      const val = a + ((b - a) * i) / n;
      setValue(val);
      app.status(`${target.name}: ${formatNumber(val, 2)} ${unit === "deg" ? "°" : "mm"}  (${i}/${n})`);
      if (st.collide) {
        const hits = await app.kernel.interference(env.placements());
        if (hits.length) {
          toast(`${formatNumber(val, 2)} で干渉を検出したため停止しました`, "warn");
          break;
        }
      } else await new Promise<void>((r) => (timer = window.setTimeout(r, 16)));
    }
    stop();
  };

  const finish = (keep: boolean) => {
    stop();
    const c = env.doc.constraints.find((x) => x.id === target.id);
    if (c) {
      const end = c.offset;
      c.offset = original;
      if (keep && end !== original) env.store.mutate("拘束を駆動", (d) => (d.constraints.find((x) => x.id === target.id)!.offset = end));
      else {
        env.solve();
        env.render();
      }
    }
    panel.close();
    env.command = null;
    app.ribbon.refresh();
    app.status("準備完了");
  };

  const panel = new PropertyPanel(app.panelHost, `拘束を駆動: ${target.name}`, "play", { onOk: () => finish(false), onCancel: () => finish(false) }, values);
  const sec = panel.section("範囲");
  panel.expr(sec, "開始", st.from, unit, (e) => (st.from = e));
  panel.expr(sec, "終了", st.to, unit, (e) => (st.to = e));
  panel.expr(sec, "ステップ数", st.steps, "", (e) => (st.steps = e));
  panel.checkbox(sec, "干渉を検出したら停止", st.collide, (v) => (st.collide = v));
  const play = panel.section("再生");
  const row = document.createElement("div");
  row.className = "drive-btns";
  const btn = (label: string, title: string, fn: () => void) => {
    const b = document.createElement("button");
    b.className = "btn";
    b.textContent = label;
    b.title = title;
    b.addEventListener("click", fn);
    row.appendChild(b);
  };
  btn("◀◀", "逆方向に再生", () => void run(-1));
  btn("■", "停止", stop);
  btn("▶▶", "順方向に再生", () => void run(1));
  btn("この位置を保持", "現在の値を拘束に設定して閉じます", () => {
    original = env.doc.constraints.find((x) => x.id === target.id)?.offset ?? original;
    finish(false);
  });
  play.appendChild(row);
  panel.note(play, "閉じると拘束の値は元に戻ります (「この位置を保持」で現在値を確定)。");
  env.command = { id: "drive", cancel: () => finish(false), ok: () => finish(false) };
  app.ribbon.refresh();
}

/** Exploded view (presentation): slider for the explode distance, trails. */
export function startExplode(env: AssemblyEnv) {
  const app = env.app;
  if (env.doc.components.length < 2) {
    toast("分解するコンポーネントがありません", "warn");
    return;
  }
  app.cancelAsmCommand();
  const values = () => evaluateParams(env.doc.params);
  if (!env.explode) env.explode = 1;
  env.render();
  const finish = (keep: boolean) => {
    if (!keep) env.explode = 0;
    env.render();
    panel.close();
    env.command = null;
    app.ribbon.refresh();
  };
  const panel = new PropertyPanel(app.panelHost, "分解", "explode", { onOk: () => finish(true), onCancel: () => finish(false) }, values);
  const sec = panel.section("分解");
  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = "0";
  slider.max = "3";
  slider.step = "0.05";
  slider.value = String(env.explode);
  slider.className = "explode-slider";
  slider.addEventListener("input", () => {
    env.explode = Number(slider.value);
    env.render();
  });
  const lab = document.createElement("label");
  lab.className = "field";
  lab.innerHTML = `<span class="field-label">距離</span>`;
  const ctl = document.createElement("span");
  ctl.className = "field-ctl";
  ctl.appendChild(slider);
  lab.appendChild(ctl);
  sec.appendChild(lab);
  panel.checkbox(sec, "軌跡線を表示", env.trails, (v) => {
    env.trails = v;
    env.render();
  });
  panel.note(sec, "挿入・軸合わせ拘束のあるコンポーネントは軸方向に、その他は中心から放射状に分解されます。OK で分解表示を維持 (距離を 0 に戻すと解除)、キャンセルで組立状態に戻ります。");
  env.command = { id: "explode", cancel: () => finish(false), ok: () => finish(true) };
  app.ribbon.refresh();
}
