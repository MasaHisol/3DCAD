import { formatNumber } from "../core/expr";
import { evalWith, evaluateParams } from "../core/params";
import { toast } from "../ui/dom";
import { PropertyPanel } from "../ui/panel";
import type { AssemblyEnv } from "./env";
import { download } from "../ui/dom";
import * as THREE from "three";
import { kinematics, minDistance, triSet, type MotionSample, type TriSet } from "./kinematics";
import { MATERIALS } from "../core/document";
import { meshMass, minMax, peakRms, profileValue, sizingHint, solveDynamics, toCsv, worldPointMm, type BodyMass, type DynResult, type ExtLoad, type Frame, type SpringDef, type V3 } from "./dynamics";

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
        await env.ensureBrep();
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
      // restore the original value and positions first, so the undo snapshot is consistent
      c.offset = original;
      env.solve();
      if (keep && end !== original) {
        env.store.mutate("拘束を駆動", (d) => (d.constraints.find((x) => x.id === target.id)!.offset = end));
        env.solve();
      }
      env.render();
    }
    if (env.motionTrace) {
      env.motionTrace = null;
      env.render();
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
  const allComps = env.doc.components.map((c) => ({ value: c.id, label: c.name }));
  const st2 = { comp: [target.a.comp, target.b.comp].find((id) => movable.some((c) => c.id === id)) ?? movable[0]?.id ?? "", time: "1" };
  panel.select(ms, "追跡するコンポーネント", movable.map((c) => ({ value: c.id, label: c.name })), st2.comp, (v) => (st2.comp = v));
  panel.expr(ms, "所要時間", st2.time, "s", (e) => (st2.time = e));

  // ---- motor / loads (dynamics)
  const dyn = {
    on: true,
    profile: "constant" as "constant" | "trapezoid",
    acc: "25",
    gravity: "-z",
    loads: [] as { comp: string; kind: "force" | "torque"; point: string; vec: string }[],
    springs: [] as { a: string; pa: string; b: string; pb: string; k: string; c: string; free: string }[],
  };
  const ds = panel.section("モーター・荷重 (動力学)");
  panel.checkbox(ds, "必要トルク・動力を計算", dyn.on, (v) => (dyn.on = v));
  panel.select(ds, "速度プロファイル", [{ value: "constant", label: "等速" }, { value: "trapezoid", label: "台形 (加速-定速-減速)" }], dyn.profile, (v) => (dyn.profile = v as typeof dyn.profile)).dataset.k = "motion-profile";
  panel.expr(ds, "加減速時間の割合", dyn.acc, "%", (e) => (dyn.acc = e));
  panel.select(ds, "重力", [{ value: "none", label: "なし" }, { value: "-z", label: "−Z 方向 9.81 m/s²" }, { value: "-y", label: "−Y 方向 9.81 m/s²" }, { value: "-x", label: "−X 方向 9.81 m/s²" }], dyn.gravity, (v) => (dyn.gravity = v)).dataset.k = "motion-gravity";
  const text = (parent: HTMLElement, label: string, value: string, onChange: (v: string) => void, key?: string) => {
    const input = document.createElement("input");
    input.className = "field-input";
    input.value = value;
    input.placeholder = "x, y, z";
    if (key) input.dataset.k = key;
    input.addEventListener("input", () => onChange(input.value));
    const lab = document.createElement("label");
    lab.className = "field";
    lab.innerHTML = `<span class="field-label">${label}</span>`;
    const ctl = document.createElement("span");
    ctl.className = "field-ctl";
    ctl.appendChild(input);
    lab.appendChild(ctl);
    parent.appendChild(lab);
    return input;
  };
  const listBox = (parent: HTMLElement) => {
    const d = document.createElement("div");
    d.className = "motion-list";
    parent.appendChild(d);
    return d;
  };
  const smallBtn = (parent: HTMLElement, label: string, key: string, fn: () => void) => {
    const b = document.createElement("button");
    b.className = "btn";
    b.textContent = label;
    b.dataset.k = key;
    b.addEventListener("click", fn);
    parent.appendChild(b);
    return b;
  };
  const loadBox = listBox(ds);
  smallBtn(ds, "＋ 外部荷重 (力・トルク)", "motion-add-load", () => {
    const L = { comp: movable[0]?.id ?? "", kind: "force" as "force" | "torque", point: "", vec: "0, 0, -10" };
    dyn.loads.push(L);
    const g = document.createElement("div");
    g.className = "motion-item";
    g.innerHTML = `<div class="motion-item-h">荷重 ${dyn.loads.length}</div>`;
    panel.select(g, "コンポーネント", movable.map((c) => ({ value: c.id, label: c.name })), L.comp, (v) => (L.comp = v));
    panel.select(g, "種類", [{ value: "force", label: "力 (N)" }, { value: "torque", label: "トルク (N·m)" }], L.kind, (v) => (L.kind = v as typeof L.kind));
    text(g, "作用点 (ローカル mm)", L.point, (v) => (L.point = v));
    text(g, "ベクトル (全体座標)", L.vec, (v) => (L.vec = v), "motion-load-vec");
    smallBtn(g, "削除", "motion-del", () => {
      dyn.loads.splice(dyn.loads.indexOf(L), 1);
      g.remove();
    });
    loadBox.appendChild(g);
  });
  const springBox = listBox(ds);
  smallBtn(ds, "＋ ばね・ダンパー", "motion-add-spring", () => {
    const other = env.doc.components.find((c) => c.id !== st2.comp);
    const S = { a: other?.id ?? "", pa: "", b: st2.comp, pb: "", k: "1", c: "0", free: "" };
    dyn.springs.push(S);
    const g = document.createElement("div");
    g.className = "motion-item";
    g.innerHTML = `<div class="motion-item-h">ばね ${dyn.springs.length}</div>`;
    panel.select(g, "端点 A", allComps, S.a, (v) => (S.a = v));
    text(g, "A 点 (ローカル mm)", S.pa, (v) => (S.pa = v));
    panel.select(g, "端点 B", allComps, S.b, (v) => (S.b = v));
    text(g, "B 点 (ローカル mm)", S.pb, (v) => (S.pb = v));
    panel.expr(g, "ばね定数 k", S.k, "N/mm", (e) => (S.k = e));
    panel.expr(g, "減衰係数 c", S.c, "N·s/mm", (e) => (S.c = e));
    const fl = text(g, "自由長 (空欄=初期長)", S.free, (v) => (S.free = v), "motion-spring-free");
    fl.placeholder = "mm";
    smallBtn(g, "削除", "motion-del", () => {
      dyn.springs.splice(dyn.springs.indexOf(S), 1);
      g.remove();
    });
    springBox.appendChild(g);
  });
  panel.note(ds, "点の座標を空欄にするとコンポーネントの重心を使います。質量・重心・慣性はパーツの形状と材質の密度から計算します。");

  // ---- result tools
  const rs = panel.section("結果ツール");
  const tools = { trace: true, traceComp: st2.comp, tracePt: "", distA: st2.comp, distB: env.doc.components.find((c) => c.id !== st2.comp)?.id ?? "" };
  panel.checkbox(rs, "点の軌跡を表示", tools.trace, (v) => {
    tools.trace = v;
    if (!v) {
      env.motionTrace = null;
      env.render();
    }
  });
  panel.select(rs, "軌跡のコンポーネント", allComps, tools.traceComp, (v) => (tools.traceComp = v));
  text(rs, "軌跡の点 (ローカル mm)", tools.tracePt, (v) => (tools.tracePt = v));
  panel.select(rs, "距離測定 A", [{ value: "", label: "(なし)" }, ...allComps], tools.distA, (v) => (tools.distA = v));
  panel.select(rs, "距離測定 B", [{ value: "", label: "(なし)" }, ...allComps], tools.distB, (v) => (tools.distB = v));

  const out = document.createElement("div");
  out.className = "motion-out";
  const runBtn = document.createElement("button");
  runBtn.className = "btn";
  runBtn.dataset.k = "motion-run";
  runBtn.textContent = "解析を実行";
  runBtn.addEventListener("click", () => void study());
  ms.append(runBtn, out);
  panel.note(ms, "開始→終了を指定の速度プロファイルで駆動し、追跡コンポーネント中心の変位・速度・加速度、他コンポーネントとの最小すき間、モーターに必要なトルク (力) と動力を計算します。運動は拘束で決まる運動学で、動力学は逆動力学 (仮想仕事) とエネルギー収支で評価します。");

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
  /** Mass properties per component (from the part meshes and material density). */
  const massOf = (compId: string): BodyMass => {
    const c = env.doc.components.find((x) => x.id === compId)!;
    const part = env.doc.parts.find((p) => p.id === c.partId);
    const density = part?.doc?.material?.density ?? MATERIALS[0].density;
    let mass = 0;
    const com: V3 = [0, 0, 0];
    const I = new Array(9).fill(0);
    const parts = (env.parts.get(c.partId)?.bodies ?? []).map((b) => meshMass(b.positions, b.indices, density));
    for (const p of parts) {
      mass += p.mass;
      for (let k = 0; k < 3; k++) com[k] += p.mass * p.com[k];
    }
    if (mass > 0) for (let k = 0; k < 3; k++) com[k] /= mass;
    // parallel axis to the common COG
    for (const p of parts) {
      const d = [p.com[0] - com[0], p.com[1] - com[1], p.com[2] - com[2]], dd = d[0] ** 2 + d[1] ** 2 + d[2] ** 2;
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) I[i * 3 + j] += p.inertia[i * 3 + j] + p.mass * ((i === j ? dd : 0) - d[i] * d[j]);
    }
    return { id: compId, mass, com, inertia: I };
  };
  const vec3 = (s: string, fallback: V3, what: string): V3 => {
    if (!s.trim()) return fallback;
    const v = values();
    const parts = s.split(",").map((x) => evalWith(v, x.trim()));
    if (parts.length !== 3 || parts.some((x) => !isFinite(x))) throw new Error(`${what} は "x, y, z" で入力してください`);
    return parts as V3;
  };
  const study = async () => {
    if (running) return;
    const v = values();
    let a: number, b: number, n: number, T: number, accF = 0.25;
    try {
      a = evalWith(v, st.from);
      b = evalWith(v, st.to);
      n = Math.max(2, Math.min(2000, Math.round(evalWith(v, st.steps))));
      T = evalWith(v, st2.time);
      if (!(T > 0)) throw new Error("所要時間は正の値にしてください");
      accF = evalWith(v, dyn.acc) / 100;
      if (dyn.profile === "trapezoid" && !(accF > 0 && accF <= 0.5)) throw new Error("加減速時間の割合は 0〜50 % にしてください");
    } catch (e) {
      panel.setError((e as Error).message);
      return;
    }
    const comp = env.doc.components.find((c) => c.id === st2.comp);
    if (!comp) return;
    // masses / loads / springs (resolved before the sweep so input errors stop early)
    const bodies = dyn.on ? env.doc.components.filter((c) => !c.grounded).map((c) => massOf(c.id)) : [];
    const comOf = (id: string): V3 => bodies.find((x) => x.id === id)?.com ?? massOf(id).com;
    let loads: ExtLoad[] = [], springs: SpringDef[] = [];
    let tracePt: V3 = [0, 0, 0];
    try {
      loads = dyn.loads.filter((L) => L.comp).map((L) => ({ kind: L.kind, comp: L.comp, point: vec3(L.point, comOf(L.comp), "作用点"), vec: vec3(L.vec, [0, 0, 0], "荷重ベクトル") }));
      springs = dyn.springs
        .filter((S) => S.a && S.b && S.a !== S.b)
        .map((S) => ({ a: { comp: S.a, point: vec3(S.pa, comOf(S.a), "A 点") }, b: { comp: S.b, point: vec3(S.pb, comOf(S.b), "B 点") }, k: evalWith(v, S.k || "0"), c: evalWith(v, S.c || "0"), free: S.free.trim() ? evalWith(v, S.free) : NaN }));
      if (tools.traceComp) tracePt = vec3(tools.tracePt, comOf(tools.traceComp), "軌跡の点");
    } catch (e) {
      panel.setError((e as Error).message);
      return;
    }
    panel.setError(null);
    running = true;
    const others = env.doc.components.filter((c) => c.id !== comp.id && c.visible !== false).map((c) => ({ c, local: localTris(c.partId) }));
    const mine = localTris(comp.partId);
    const pairA = tools.distA && tools.distB && tools.distA !== tools.distB ? localTris(env.doc.components.find((c) => c.id === tools.distA)!.partId) : null;
    const pairB = pairA ? localTris(env.doc.components.find((c) => c.id === tools.distB)!.partId) : null;
    const samples: MotionSample[] = [], clear: number[] = [], pairD: number[] = [], drive: number[] = [], trace: V3[] = [];
    const frames: Frame[] = [];
    let minC = Infinity, minAt = a;
    const matOf = (id: string) => env.doc.components.find((c) => c.id === id)!.matrix;
    for (let i = 0; i <= n && running; i++) {
      const t = (T * i) / n;
      const val = profileValue(dyn.profile, a, b, T, t, accF);
      setValue(val);
      drive.push(val);
      const cur = env.doc.components.find((c) => c.id === comp.id)!;
      samples.push({ t, p: env.compBox(cur).center as [number, number, number] });
      frames.push({ t, q: unit === "deg" ? THREE.MathUtils.degToRad(val) : val, mats: new Map(env.doc.components.map((c) => [c.id, [...c.matrix]])) });
      if (tools.traceComp) trace.push(worldPointMm(matOf(tools.traceComp), tracePt));
      const A = worldTris(mine, cur.matrix);
      let d = Infinity;
      for (const o of others) {
        const om = matOf(o.c.id);
        for (const B of worldTris(o.local, om)) for (const s of A) d = Math.min(d, minDistance(s, B, 600));
      }
      clear.push(d);
      if (d < minC) {
        minC = d;
        minAt = val;
      }
      if (pairA && pairB) {
        let dp = Infinity;
        const WA = worldTris(pairA, matOf(tools.distA));
        for (const B of worldTris(pairB, matOf(tools.distB))) for (const s of WA) dp = Math.min(dp, minDistance(s, B, 600));
        pairD.push(dp);
      }
      if (i % 5 === 0) {
        app.status(`モーション解析 ${i}/${n}`);
        await new Promise((r) => setTimeout(r, 0));
      }
    }
    stop();
    // free length blank → length at the first frame
    for (const S of springs)
      if (!isFinite(S.free)) {
        const f0 = frames[0];
        const pa = worldPointMm(f0.mats.get(S.a.comp)!, S.a.point), pb = worldPointMm(f0.mats.get(S.b.comp)!, S.b.point);
        S.free = Math.hypot(pb[0] - pa[0], pb[1] - pa[1], pb[2] - pa[2]);
      }
    const k = kinematics(samples);
    const unitS = unit === "deg" ? "°" : "mm";
    const vmax = Math.max(...k.vel), amax = Math.max(...k.acc);
    out.innerHTML = "";
    const sum = document.createElement("div");
    sum.className = "motion-sum";
    sum.innerHTML = `<div>最大速度: <b data-k="vmax">${formatNumber(vmax, 2)}</b> mm/s</div><div>最大加速度: <b>${formatNumber(amax, 1)}</b> mm/s²</div>` +
      (others.length ? `<div>最小すき間: <b data-k="minclear">${isFinite(minC) ? formatNumber(minC, 3) : "-"}</b> mm (${formatNumber(minAt, 2)} ${unitS})${minC < 1e-3 ? " ⚠ 接触" : ""}</div>` : "");
    if (pairD.length) {
      const mm = minMax(pairD);
      const nm = (id: string) => env.doc.components.find((c) => c.id === id)?.name ?? id;
      sum.innerHTML += `<div>距離 ${nm(tools.distA)} ↔ ${nm(tools.distB)}: 最小 <b data-k="pairmin">${formatNumber(mm.min, 3)}</b> mm (t=${formatNumber(k.t[mm.minAt], 3)} s) / 最大 <b data-k="pairmax">${formatNumber(mm.max, 3)}</b> mm (t=${formatNumber(k.t[mm.maxAt], 3)} s)</div>`;
    }
    out.appendChild(sum);
    out.appendChild(chart("変位 mm", k.t, k.disp));
    out.appendChild(chart("速度 mm/s", k.t, k.vel));
    out.appendChild(chart("加速度 mm/s²", k.t, k.acc));
    if (others.length) out.appendChild(chart("最小すき間 mm", k.t, clear));
    if (pairD.length) out.appendChild(chart("距離 A↔B mm", k.t, pairD));

    let dr: DynResult | null = null;
    const effU = unit === "deg" ? "N·m" : "N", effName = unit === "deg" ? "トルク" : "駆動力";
    if (dyn.on) {
      const gv: V3 = dyn.gravity === "none" ? [0, 0, 0] : dyn.gravity === "-x" ? [-9.81, 0, 0] : dyn.gravity === "-y" ? [0, -9.81, 0] : [0, 0, -9.81];
      dr = solveDynamics({ frames, bodies, gravity: gv, loads, springs, angular: unit === "deg" });
      const e = peakRms(dr.t, dr.effort), p = peakRms(dr.t, dr.power);
      const totalMass = bodies.reduce((s, x) => s + x.mass, 0);
      const speedMax = Math.max(...dr.qdot.map(Math.abs)) * (unit === "deg" ? 1 : 1000);
      const ds2 = document.createElement("div");
      ds2.className = "motion-sum motion-dyn";
      ds2.innerHTML =
        `<div>可動部質量: <b>${formatNumber(totalMass, 3)}</b> kg</div>` +
        `<div>必要${effName}: 最大 <b data-k="tpeak">${formatNumber(e.peak, 4)}</b> ${effU} / 実効値 (RMS) <b data-k="trms">${formatNumber(e.rms, 4)}</b> ${effU}</div>` +
        `<div>動力: 最大 <b data-k="ppeak">${formatNumber(p.peak, 3)}</b> W / 実効値 <b>${formatNumber(p.rms, 3)}</b> W</div>` +
        `<div class="motion-hint" data-k="sizing">選定の目安: ${sizingHint(unit === "deg", e.peak, e.rms, p.peak, speedMax)}</div>`;
      out.appendChild(ds2);
      out.appendChild(chart(`${effName} ${effU}`, dr.t, dr.effort));
      out.appendChild(chart("動力 W", dr.t, dr.power));
      dr.springForce.forEach((f, i) => out.appendChild(chart(`ばね ${i + 1} の力 N`, dr!.t, f)));
    }
    if (tools.trace && trace.length > 1) {
      env.motionTrace = trace;
      env.render();
    }
    const csv = document.createElement("button");
    csv.className = "btn";
    csv.dataset.k = "motion-csv";
    csv.textContent = "CSV 書き出し";
    csv.addEventListener("click", () => {
      const cols = [
        { name: "time_s", data: k.t },
        { name: `drive_${unit}`, data: drive },
        { name: "x", data: samples.map((s) => s.p[0]) },
        { name: "y", data: samples.map((s) => s.p[1]) },
        { name: "z", data: samples.map((s) => s.p[2]) },
        { name: "disp_mm", data: k.disp },
        { name: "speed_mm_s", data: k.vel },
        { name: "accel_mm_s2", data: k.acc },
        { name: "clearance_mm", data: clear },
      ];
      if (pairD.length) cols.push({ name: "distance_AB_mm", data: pairD });
      if (trace.length) cols.push({ name: "trace_x", data: trace.map((p) => p[0]) }, { name: "trace_y", data: trace.map((p) => p[1]) }, { name: "trace_z", data: trace.map((p) => p[2]) });
      if (dr) {
        cols.push(
          { name: unit === "deg" ? "drive_speed_rad_s" : "drive_speed_m_s", data: dr.qdot },
          { name: unit === "deg" ? "torque_Nm" : "force_N", data: dr.effort },
          { name: unit === "deg" ? "torque_energy_Nm" : "force_energy_N", data: dr.effortEnergy },
          { name: "power_W", data: dr.power },
          { name: "kinetic_J", data: dr.kinetic },
          { name: "potential_J", data: dr.potential },
        );
        dr.springForce.forEach((f, i) => cols.push({ name: `spring${i + 1}_N`, data: f }));
      }
      download(`${env.doc.name}_モーション.csv`, toCsv(cols), "text/csv");
    });
    out.appendChild(csv);
    app.status("モーション解析 完了");
  };
  env.command = { id: "drive", cancel: () => finish(false), ok: () => finish(false) };
  app.ribbon.refresh();
}

/** Small SVG line chart. */
export function chart(title: string, x: number[], y: number[]): HTMLElement {
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
