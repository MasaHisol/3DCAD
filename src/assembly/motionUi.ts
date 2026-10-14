import { formatNumber } from "../core/expr";
import { evalWith, evaluateParams } from "../core/params";
import { toast } from "../ui/dom";
import { PropertyPanel } from "../ui/panel";
import type { AssemblyEnv } from "./env";
import { download } from "../ui/dom";
import * as THREE from "three";
import { kinematics, minDistance, triSet, type MotionSample, type TriSet } from "./kinematics";

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

  // ---- motion study: sweep the drive over a time span, record kinematics and clearance
  const ms = panel.section("モーション解析");
  const movable = env.doc.components.filter((c) => !c.grounded);
  const st2 = { comp: [target.a.comp, target.b.comp].find((id) => movable.some((c) => c.id === id)) ?? movable[0]?.id ?? "", time: "1" };
  panel.select(ms, "追跡するコンポーネント", movable.map((c) => ({ value: c.id, label: c.name })), st2.comp, (v) => (st2.comp = v));
  panel.expr(ms, "所要時間", st2.time, "s", (e) => (st2.time = e));
  const out = document.createElement("div");
  out.className = "motion-out";
  const runBtn = document.createElement("button");
  runBtn.className = "btn";
  runBtn.dataset.k = "motion-run";
  runBtn.textContent = "解析を実行";
  runBtn.addEventListener("click", () => void study());
  ms.append(runBtn, out);
  panel.note(ms, "開始→終了を等速で駆動し、追跡コンポーネント中心の変位・速度・加速度と、他コンポーネントとの最小すき間を計算します (運動学解析。質量・力は考慮しません)。");

  const localTris = (partId: string): TriSet[] => (env.parts.get(partId)?.bodies ?? []).map((b) => triSet(b.positions, b.indices));
  const worldTris = (sets: TriSet[], matrix: number[]): TriSet[] => {
    const m = new THREE.Matrix4().fromArray(matrix), v = new THREE.Vector3();
    return sets.map((s) => {
      const pos = new Float32Array(s.pos.length);
      for (let i = 0; i < pos.length; i += 3) {
        v.set(s.pos[i], s.pos[i + 1], s.pos[i + 2]).applyMatrix4(m);
        pos[i] = v.x;
        pos[i + 1] = v.y;
        pos[i + 2] = v.z;
      }
      return triSet(pos, s.idx);
    });
  };
  const study = async () => {
    if (running) return;
    const v = values();
    let a: number, b: number, n: number, T: number;
    try {
      a = evalWith(v, st.from);
      b = evalWith(v, st.to);
      n = Math.max(2, Math.min(2000, Math.round(evalWith(v, st.steps))));
      T = evalWith(v, st2.time);
      if (!(T > 0)) throw new Error("所要時間は正の値にしてください");
    } catch (e) {
      panel.setError((e as Error).message);
      return;
    }
    const comp = env.doc.components.find((c) => c.id === st2.comp);
    if (!comp) return;
    panel.setError(null);
    running = true;
    const others = env.doc.components.filter((c) => c.id !== comp.id && c.visible !== false).map((c) => ({ c, local: localTris(c.partId) }));
    const mine = localTris(comp.partId);
    const samples: MotionSample[] = [], clear: number[] = [];
    let minC = Infinity, minAt = a;
    for (let i = 0; i <= n && running; i++) {
      const val = a + ((b - a) * i) / n;
      setValue(val);
      const cur = env.doc.components.find((c) => c.id === comp.id)!;
      samples.push({ t: (T * i) / n, p: env.compBox(cur).center as [number, number, number] });
      const A = worldTris(mine, cur.matrix);
      let d = Infinity;
      for (const o of others) {
        const om = env.doc.components.find((c) => c.id === o.c.id)!.matrix;
        for (const B of worldTris(o.local, om)) for (const s of A) d = Math.min(d, minDistance(s, B, 600));
      }
      clear.push(d);
      if (d < minC) {
        minC = d;
        minAt = val;
      }
      if (i % 5 === 0) {
        app.status(`モーション解析 ${i}/${n}`);
        await new Promise((r) => setTimeout(r, 0));
      }
    }
    stop();
    const k = kinematics(samples);
    const unitS = unit === "deg" ? "°" : "mm";
    const vmax = Math.max(...k.vel), amax = Math.max(...k.acc);
    out.innerHTML = "";
    const sum = document.createElement("div");
    sum.className = "motion-sum";
    sum.innerHTML = `<div>最大速度: <b data-k="vmax">${formatNumber(vmax, 2)}</b> mm/s</div><div>最大加速度: <b>${formatNumber(amax, 1)}</b> mm/s²</div>` +
      (others.length ? `<div>最小すき間: <b data-k="minclear">${isFinite(minC) ? formatNumber(minC, 3) : "-"}</b> mm (${formatNumber(minAt, 2)} ${unitS})${minC < 1e-3 ? " ⚠ 接触" : ""}</div>` : "");
    out.appendChild(sum);
    out.appendChild(chart("変位 mm", k.t, k.disp));
    out.appendChild(chart("速度 mm/s", k.t, k.vel));
    out.appendChild(chart("加速度 mm/s²", k.t, k.acc));
    if (others.length) out.appendChild(chart("最小すき間 mm", k.t, clear));
    const csv = document.createElement("button");
    csv.className = "btn";
    csv.textContent = "CSV 書き出し";
    csv.addEventListener("click", () => {
      const rows = ["time_s,drive,x,y,z,disp_mm,speed_mm_s,accel_mm_s2,clearance_mm"];
      samples.forEach((s, i) => rows.push([s.t, a + ((b - a) * i) / n, ...s.p, k.disp[i], k.vel[i], k.acc[i], clear[i]].map((x) => (isFinite(x) ? +x.toFixed(5) : "")).join(",")));
      download(`${env.doc.name}_モーション.csv`, rows.join("\n"), "text/csv");
    });
    out.appendChild(csv);
    app.status("モーション解析 完了");
  };
  env.command = { id: "drive", cancel: () => finish(false), ok: () => finish(false) };
  app.ribbon.refresh();
}

/** Small SVG line chart. */
function chart(title: string, x: number[], y: number[]): HTMLElement {
  const W = 260, H = 90, L = 4, R = 4, T = 14, B = 4;
  const fin = y.filter((v) => isFinite(v));
  const lo = Math.min(0, ...fin), hi = Math.max(...fin, lo + 1e-9);
  const x0 = x[0], x1 = x[x.length - 1] || 1;
  const px = (v: number) => L + ((v - x0) / (x1 - x0 || 1)) * (W - L - R);
  const py = (v: number) => H - B - ((v - lo) / (hi - lo)) * (H - T - B);
  const d = y.map((v, i) => (isFinite(v) ? `${i ? "L" : "M"}${px(x[i]).toFixed(1)},${py(v).toFixed(1)}` : "")).join("");
  const wrap = document.createElement("div");
  wrap.className = "motion-chart";
  wrap.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="100%"><rect x="0" y="0" width="${W}" height="${H}" class="mc-bg"/><text x="4" y="11" class="mc-t">${title} (最大 ${formatNumber(hi, 2)})</text><path d="${d}" class="mc-l"/></svg>`;
  return wrap;
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
