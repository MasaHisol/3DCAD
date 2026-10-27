// Shared frame / controls / loop for the animated figures (anim*.ts).
// Every figure gets the same transport bar in its header: live clock,
// speed (¼× … 2×), single-step while paused, and reset (re-mounts the
// figure). The loop runs on requestAnimationFrame with a virtual clock,
// pauses while the figure is off-screen, and stops when the figure is
// re-mounted or removed from the page.

export const NS = "http://www.w3.org/2000/svg";

interface Transport {
  speed: number;
  stepReq: number;
  gen: number;
  clock: number;
  visible: boolean;
  timeEl: HTMLElement | null;
  bar: HTMLElement | null;
}

const STATE = new WeakMap<HTMLElement, Transport>();

function transport(host: HTMLElement): Transport {
  let s = STATE.get(host);
  if (!s) {
    s = { speed: 1, stepReq: 0, gen: 0, clock: 0, visible: true, timeEl: null, bar: null };
    STATE.set(host, s);
    if (typeof IntersectionObserver === "function") {
      const st = s;
      new IntersectionObserver((es) => {
        for (const e of es) st.visible = e.isIntersecting;
      }).observe(host);
    }
  }
  return s;
}

type Mountable = HTMLElement & { __tbMount?: () => void };

export function frame(host: HTMLElement, title: string, h = 220) {
  const st = transport(host);
  st.gen++;
  st.clock = 0;
  st.stepReq = 0;
  host.classList.add("tb-widget", "tb-anim");
  host.classList.remove("tb-anim-live");
  host.innerHTML = "";
  const head = document.createElement("div");
  head.className = "tb-widget-head";
  head.innerHTML = `<span class="tb-widget-badge anim">動く図</span><span class="tb-widget-title">${title}</span>`;
  const bar = document.createElement("span");
  bar.className = "tb-transport";
  bar.setAttribute("role", "group");
  bar.setAttribute("aria-label", "再生の操作");
  const time = document.createElement("span");
  time.className = "tb-tr-time tb-tr-live";
  time.setAttribute("aria-hidden", "true");
  time.textContent = "t = 0.0 s";
  const speed = document.createElement("select");
  speed.className = "tb-tr-speed tb-tr-live";
  speed.setAttribute("aria-label", "再生速度");
  speed.title = "再生速度";
  for (const v of [0.25, 0.5, 1, 2]) {
    const o = document.createElement("option");
    o.value = String(v);
    o.textContent = `${v === 0.25 ? "¼" : v === 0.5 ? "½" : v}×`;
    speed.appendChild(o);
  }
  speed.value = String(st.speed);
  speed.addEventListener("change", () => (st.speed = Number(speed.value)));
  const step = document.createElement("button");
  step.className = "tb-tr-btn tb-tr-live";
  step.type = "button";
  step.textContent = "+1 コマ";
  step.title = "1 コマ進める (停止中)";
  step.setAttribute("aria-label", "1 コマ進める");
  step.addEventListener("click", () => st.stepReq++);
  bar.append(time, speed, step);
  const mount = (host as Mountable).__tbMount;
  if (mount) {
    const reset = document.createElement("button");
    reset.className = "tb-tr-btn";
    reset.type = "button";
    reset.textContent = "↺";
    reset.title = "最初の状態に戻す";
    reset.setAttribute("aria-label", "最初の状態に戻す");
    reset.addEventListener("click", () => mount());
    bar.appendChild(reset);
  }
  head.appendChild(bar);
  st.timeEl = time;
  st.bar = bar;
  const ctl = document.createElement("div");
  ctl.className = "tb-anim-ctl";
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", `0 0 520 ${h}`);
  svg.setAttribute("class", "tb-chart");
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", title);
  svg.setAttribute("tabindex", "0");
  // Space / Enter on the figure toggles the figure's own play button
  svg.addEventListener("keydown", (e) => {
    if (e.key !== " " && e.key !== "Enter") return;
    const pb = ctl.querySelector<HTMLButtonElement>(".tb-play");
    if (pb) {
      e.preventDefault();
      pb.click();
    }
  });
  const out = document.createElement("div");
  out.className = "tb-widget-out";
  out.setAttribute("aria-live", "polite");
  host.append(head, ctl, svg, out);
  return { ctl, svg, out };
}

export function button(ctl: HTMLElement, label: string, on: () => void, cls = "") {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "tb-btn" + (cls ? ` ${cls}` : "");
  b.textContent = label;
  b.addEventListener("click", on);
  if (/^[▶■]/.test(label)) {
    // play / pause buttons: styled consistently and announced as toggles
    b.classList.add("tb-play");
    const sync = () => {
      const on = (b.textContent ?? "").startsWith("■");
      b.setAttribute("aria-pressed", String(on));
      b.classList.toggle("is-on", on);
    };
    sync();
    if (typeof MutationObserver === "function") new MutationObserver(sync).observe(b, { childList: true, characterData: true, subtree: true });
  }
  ctl.appendChild(b);
  return b;
}

const UNIT_RE = /^(.*?)\s*(?:\(([^)]*(?:mm|cm|kg|rev|s|N|Hz|°|%)[^)]*)\)|(mm|cm|kg|°|%|s|N|Hz))$/;

/** Range slider with a separate name, live numeric readout and unit. */
export function slider(ctl: HTMLElement, label: string, min: number, max: number, value: number, step: number, on: (v: number) => void, unit?: string) {
  let name = label;
  let u = unit ?? "";
  if (unit === undefined) {
    const m = label.match(UNIT_RE);
    if (m && m[1]) (name = m[1]), (u = m[2] ?? m[3] ?? "");
  }
  const dec = Math.max(0, Math.min(4, -Math.floor(Math.log10(step > 0 ? step : 1) + 1e-9)));
  const l = document.createElement("label");
  l.className = "tb-anim-slider";
  const span = document.createElement("span");
  span.className = "tb-sl-name";
  span.textContent = name;
  const i = document.createElement("input");
  i.type = "range";
  Object.assign(i, { min: String(min), max: String(max), step: String(step), value: String(value) });
  const o = document.createElement("output");
  o.className = "tb-sl-val";
  const show = () => {
    const txt = `${Number(i.value).toFixed(dec)}${u ? (/^[°%]/.test(u) ? "" : " ") + u : ""}`;
    o.textContent = txt;
    i.setAttribute("aria-valuetext", txt);
    const p = ((Number(i.value) - min) / (max - min || 1)) * 100;
    i.style.setProperty("--p", `${p}%`);
  };
  i.setAttribute("aria-label", name + (u ? ` (${u})` : ""));
  i.addEventListener("input", () => (show(), on(Number(i.value))));
  // programmatic `.value = …` updates stay in sync too
  const desc = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
  if (desc?.set && desc.get) {
    Object.defineProperty(i, "value", {
      get: () => desc.get!.call(i),
      set: (v: string) => (desc.set!.call(i, v), show()),
    });
  }
  show();
  l.append(span, i, o);
  ctl.appendChild(l);
  return i;
}

export function select(ctl: HTMLElement, options: [string, string][], value: string, on: (v: string) => void) {
  const s = document.createElement("select");
  for (const [v, t] of options) {
    const o = document.createElement("option");
    o.value = v;
    o.textContent = t;
    s.appendChild(o);
  }
  s.value = value;
  s.addEventListener("change", () => on(s.value));
  ctl.appendChild(s);
  return s;
}

/**
 * Run `step(t, dt)` every frame while the host is on the page, visible and
 * `playing()` is true. `t` / `dt` follow the transport's virtual clock (speed
 * control); the step button advances paused figures by single frames.
 */
export function loop(host: HTMLElement, step: (t: number, dt: number) => void, playing: () => boolean = () => true) {
  const st = transport(host);
  const gen = st.gen;
  host.classList.add("tb-anim-live");
  let last = performance.now();
  let t = performance.now() / 1000;
  let shown = -1;
  let seenStep = st.stepReq;
  const tick = (now: number) => {
    if (!host.isConnected || st.gen !== gen) return;
    const real = Math.min(0.1, (now - last) / 1000);
    last = now;
    const run = playing();
    const stepping = !run && st.stepReq !== seenStep;
    seenStep = st.stepReq;
    if (st.visible && (run || stepping)) {
      const dt = run ? real * st.speed : 1 / 30;
      t += dt;
      st.clock += dt;
      step(t, dt);
      if (st.timeEl && Math.abs(st.clock - shown) >= 0.1) {
        shown = st.clock;
        st.timeEl.textContent = `t = ${st.clock.toFixed(1)} s`;
      }
    }
    st.bar?.classList.toggle("paused", !run);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

export const reduced = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
