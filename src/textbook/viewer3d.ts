// Interactive 3D figures for the textbook (<div data-widget="3d-...">).
// One small shared viewer: lazy-loaded three.js, a hand-written orbit
// controller (drag / touch / wheel / pinch), a white-grey studio look that
// follows the textbook's light / dark theme, and render-on-demand (renders
// only while the reader interacts or an animation runs, pauses off-screen,
// and frees the WebGL context once the figure leaves the page).
import type * as T3 from "three";

type THREE = typeof T3;

interface Fig {
  /** Advance the animation; return false to stop the loop. */
  tick?: (dt: number) => boolean | void;
}

interface Kit {
  T: THREE;
  scene: T3.Scene;
  root: T3.Group;
  ctl: HTMLElement;
  out: HTMLElement;
  reduced: boolean;
  dark: () => boolean;
  /** Request one redraw. */
  invalidate: () => void;
  /** Start / stop the animation loop (calls fig.tick every frame). */
  play: (on: boolean) => void;
  playing: () => boolean;
  mat: (color: number, o?: T3.MeshStandardMaterialParameters) => T3.MeshStandardMaterial;
  /** Mesh with crisp outline edges (EdgesGeometry). */
  mesh: (geo: T3.BufferGeometry, mat: T3.Material, o?: { edges?: boolean; threshold?: number; clip?: T3.Plane[] }) => T3.Mesh;
  /** Re-outline a mesh after its geometry changed. */
  reEdge: (m: T3.Mesh, threshold?: number) => void;
  label: (text: string, color?: string, scale?: number) => T3.Sprite;
  onTheme: (fn: () => void) => void;
  button: (label: string, on: () => void) => HTMLButtonElement;
  toggle: (label: string, init: boolean, on: (v: boolean) => void) => HTMLButtonElement;
  slider: (label: string, min: number, max: number, value: number, step: number, unit: string, on: (v: number) => void) => HTMLInputElement;
  select: (options: [string, string][], value: string, on: (v: string) => void) => HTMLSelectElement;
  setView: (v: ViewName, animate?: boolean) => void;
}

type ViewName = "iso" | "front" | "top" | "right";
const VIEWS: Record<ViewName, [number, number, string]> = {
  iso: [Math.PI / 4, Math.atan(1 / Math.SQRT2), "等角"],
  front: [0, 0, "正面"],
  top: [0, Math.PI / 2 - 1e-4, "上面"],
  right: [Math.PI / 2, 0, "右側面"],
};

interface Opts {
  /** Orbit target. */
  target: [number, number, number];
  /** Radius of the part's bounding sphere (sets the camera distance). */
  radius: number;
  /** Initial camera angles [azimuth, elevation] in degrees. */
  start?: [number, number];
  /** Grid: size, y position. Omit to hide. */
  grid?: [number, number];
}

const reducedMotion = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

function cssVar(name: string, fb: string) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fb;
}

function frame3d(host: HTMLElement, title: string) {
  host.classList.add("tb-widget", "tb-anim", "tb-v3d");
  host.innerHTML = "";
  const head = document.createElement("div");
  head.className = "tb-widget-head";
  head.innerHTML = `<span class="tb-widget-badge v3d">3D 図</span>${title}`;
  const ctl = document.createElement("div");
  ctl.className = "tb-anim-ctl";
  const stage = document.createElement("div");
  stage.className = "tb-v3d-stage";
  stage.setAttribute("role", "img");
  stage.setAttribute("aria-label", title);
  stage.innerHTML = `<div class="tb-v3d-msg">3D 図を読み込み中…</div>`;
  const out = document.createElement("div");
  out.className = "tb-widget-out";
  host.append(head, ctl, stage, out);
  return { ctl, stage, out };
}

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

function fallback(stage: HTMLElement, ctl: HTMLElement) {
  ctl.innerHTML = "";
  stage.innerHTML = `<div class="tb-v3d-msg">この環境では WebGL が使えないため、3D 図を表示できません。<br>下の説明文と本文の図を参照してください。</div>`;
}

/** Mount a 3D figure. `build` creates the scene and returns optional animation hooks. */
function view3d(host: HTMLElement, title: string, opts: Opts, build: (k: Kit) => Fig | void) {
  const { ctl, stage, out } = frame3d(host, title);
  if (typeof window === "undefined" || !hasWebGL()) return fallback(stage, ctl);
  import("three")
    .then((T) => {
      if (host.isConnected || document.contains(host) || !host.parentNode) start(T);
    })
    .catch(() => fallback(stage, ctl));

  function start(T: THREE) {
    let renderer: T3.WebGLRenderer;
    try {
      renderer = new T.WebGLRenderer({ antialias: true, alpha: false });
    } catch {
      return fallback(stage, ctl);
    }
    renderer.localClippingEnabled = true;
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    const canvas = renderer.domElement;
    canvas.className = "tb-v3d-canvas";
    stage.innerHTML = "";
    stage.appendChild(canvas);
    const hint = document.createElement("div");
    hint.className = "tb-v3d-hint";
    hint.textContent = "ドラッグで回転 ・ ホイール / ピンチで拡大 ・ ダブルクリックで戻す";
    stage.appendChild(hint);

    const reduced = reducedMotion();
    const scene = new T.Scene();
    const root = new T.Group();
    scene.add(root);
    const camera = new T.PerspectiveCamera(30, 16 / 10, opts.radius / 50, opts.radius * 40);
    const target = new T.Vector3(...opts.target);
    const fitDist = (opts.radius / Math.sin(((30 / 2) * Math.PI) / 180)) * 1.05;
    const st0 = opts.start ?? [35, 24];
    const orbit = { th: (st0[0] * Math.PI) / 180, ph: (st0[1] * Math.PI) / 180, d: fitDist };
    const home = { ...orbit };

    // studio lighting
    const hemi = new T.HemisphereLight(0xffffff, 0x8a9099, 2.1);
    const sun = new T.DirectionalLight(0xffffff, 2.0);
    sun.position.set(0.6, 1.6, 1.1).multiplyScalar(opts.radius * 4);
    const fill = new T.DirectionalLight(0xffffff, 0.6);
    fill.position.set(-1.2, 0.4, -0.8).multiplyScalar(opts.radius * 4);
    scene.add(hemi, sun, fill);

    let grid: T3.GridHelper | null = null;
    if (opts.grid) {
      grid = new T.GridHelper(opts.grid[0], 16);
      grid.position.y = opts.grid[1];
      const gm = grid.material as T3.Material;
      gm.transparent = true;
      gm.depthWrite = false;
      scene.add(grid);
    }

    const edgeMat = new T.LineBasicMaterial({ color: 0x222831 });
    const themeFns: (() => void)[] = [];
    let isDark = false;
    const applyTheme = () => {
      const bg = cssVar("--tb-bg", "#f5f6f8");
      const c = new T.Color(bg);
      isDark = c.getHSL({ h: 0, s: 0, l: 0 }).l < 0.4;
      scene.background = new T.Color(isDark ? 0x2a3038 : 0xf4f5f7);
      hemi.groundColor.set(isDark ? 0x4a525e : 0x8a9099);
      hemi.intensity = isDark ? 1.7 : 2.1;
      edgeMat.color.set(isDark ? 0x0c0f13 : 0x2a313b);
      if (grid) {
        const gm = grid.material as T3.LineBasicMaterial;
        gm.vertexColors = false;
        gm.color.set(isDark ? 0x5a6472 : 0xb9c0ca);
        gm.opacity = isDark ? 0.5 : 0.6;
        gm.needsUpdate = true;
      }
      for (const f of themeFns) f();
      invalidate();
    };

    // --------------------------------------------------- render scheduling
    let visible = true;
    let animating = false;
    let tween: { from: typeof orbit; to: typeof orbit; t: number } | null = null;
    let raf = 0;
    let last = 0;
    let disposed = false;
    let fig: Fig = {};

    function invalidate() {
      if (!raf && !disposed) raf = requestAnimationFrame(frameFn);
    }
    function frameFn(now: number) {
      raf = 0;
      if (disposed) return;
      if (!host.isConnected) return dispose();
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      let more = false;
      if (tween) {
        tween.t = Math.min(1, tween.t + dt / 0.6);
        const e = tween.t * tween.t * (3 - 2 * tween.t);
        orbit.th = tween.from.th + (tween.to.th - tween.from.th) * e;
        orbit.ph = tween.from.ph + (tween.to.ph - tween.from.ph) * e;
        orbit.d = tween.from.d + (tween.to.d - tween.from.d) * e;
        if (tween.t >= 1) tween = null;
        else more = true;
      }
      if (animating && visible && fig.tick) {
        if (fig.tick(dt) === false) animating = false;
        else more = true;
      }
      draw();
      if (more && visible) raf ||= requestAnimationFrame(frameFn);
      else last = 0;
    }
    function draw() {
      const cp = Math.cos(orbit.ph);
      camera.position.set(
        target.x + orbit.d * cp * Math.sin(orbit.th),
        target.y + orbit.d * Math.sin(orbit.ph),
        target.z + orbit.d * cp * Math.cos(orbit.th),
      );
      camera.up.set(0, 1, 0);
      if (orbit.ph > 1.55) camera.up.set(-Math.sin(orbit.th), 0, -Math.cos(orbit.th));
      camera.lookAt(target);
      renderer.render(scene, camera);
    }

    const resize = () => {
      const w = Math.max(200, stage.clientWidth || 520);
      const h = Math.round((w * 10) / 16);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      invalidate();
    };

    // ------------------------------------------------------ orbit control
    const ptrs = new Map<number, { x: number; y: number }>();
    let pinch0 = 0;
    let d0 = orbit.d;
    const clampPh = (p: number) => Math.max(-Math.PI / 2 + 1e-3, Math.min(Math.PI / 2 - 1e-4, p));
    const clampD = (d: number) => Math.max(fitDist * 0.3, Math.min(fitDist * 3, d));
    const onDown = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId);
      ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      tween = null;
      hint.classList.add("off");
      if (ptrs.size === 2) {
        const [a, b] = [...ptrs.values()];
        pinch0 = Math.hypot(a.x - b.x, a.y - b.y);
        d0 = orbit.d;
      }
    };
    const onMove = (e: PointerEvent) => {
      const p = ptrs.get(e.pointerId);
      if (!p) return;
      const dx = e.clientX - p.x;
      const dy = e.clientY - p.y;
      p.x = e.clientX;
      p.y = e.clientY;
      if (ptrs.size === 1) {
        orbit.th -= dx * 0.008;
        orbit.ph = clampPh(orbit.ph + dy * 0.008);
      } else if (ptrs.size === 2 && pinch0 > 0) {
        const [a, b] = [...ptrs.values()];
        orbit.d = clampD((d0 * pinch0) / Math.max(10, Math.hypot(a.x - b.x, a.y - b.y)));
      }
      invalidate();
    };
    const onUp = (e: PointerEvent) => {
      ptrs.delete(e.pointerId);
      pinch0 = 0;
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      tween = null;
      orbit.d = clampD(orbit.d * Math.exp(e.deltaY * 0.0012));
      invalidate();
    };
    const onDbl = () => goTo({ ...home });
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("dblclick", onDbl);

    function goTo(to: typeof orbit, animate = true) {
      // shortest way round in azimuth
      const tw = Math.PI * 2;
      to.th = orbit.th + ((((to.th - orbit.th) % tw) + tw * 1.5) % tw) - Math.PI;
      if (!animate || reduced) {
        Object.assign(orbit, to);
        tween = null;
      } else tween = { from: { ...orbit }, to, t: 0 };
      invalidate();
    }

    // ------------------------------------------------------------ UI kit
    const mkBtn = (label: string, on: () => void, cls = "") => {
      const b = document.createElement("button");
      b.className = "tb-btn" + (cls ? ` ${cls}` : "");
      b.textContent = label;
      b.addEventListener("click", on);
      ctl.appendChild(b);
      return b;
    };
    ctl.innerHTML = "";
    const views = document.createElement("span");
    views.className = "tb-v3d-views";
    ctl.appendChild(views);
    for (const k of Object.keys(VIEWS) as ViewName[]) {
      const b = document.createElement("button");
      b.className = "tb-btn tb-v3d-view";
      b.textContent = VIEWS[k][2];
      b.addEventListener("click", () => setView(k));
      views.appendChild(b);
    }
    function setView(k: ViewName, animate = true) {
      goTo({ th: VIEWS[k][0], ph: VIEWS[k][1], d: fitDist }, animate);
    }

    const textures: T3.Texture[] = [];
    const kit: Kit = {
      T,
      scene,
      root,
      ctl,
      out,
      reduced,
      dark: () => isDark,
      invalidate,
      play(on) {
        animating = on;
        if (on) invalidate();
      },
      playing: () => animating,
      mat: (color, o = {}) => new T.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.05, ...o }),
      mesh(geo, mat, o = {}) {
        const m = new T.Mesh(geo, mat);
        if (o.edges !== false) {
          const em = o.clip ? edgeMat.clone() : edgeMat;
          if (o.clip) {
            em.clippingPlanes = o.clip;
            themeFns.push(() => em.color.copy(edgeMat.color));
          }
          const l = new T.LineSegments(new T.EdgesGeometry(geo, o.threshold ?? 25), em);
          l.name = "edges";
          l.userData.threshold = o.threshold ?? 25;
          m.add(l);
        }
        return m;
      },
      reEdge(m, threshold) {
        const l = m.getObjectByName("edges") as T3.LineSegments | undefined;
        if (!l) return;
        l.geometry.dispose();
        l.geometry = new T.EdgesGeometry(m.geometry, threshold ?? l.userData.threshold ?? 25);
      },
      label(text, color = "#1f6feb", scale = 1) {
        const c = document.createElement("canvas");
        const fs = 44;
        const ctx = c.getContext("2d")!;
        ctx.font = `600 ${fs}px ${cssVar("--tb-font", "sans-serif")}`;
        const w = Math.ceil(ctx.measureText(text).width) + 36;
        c.width = w;
        c.height = fs + 26;
        ctx.font = `600 ${fs}px ${cssVar("--tb-font", "sans-serif")}`;
        ctx.fillStyle = color;
        const r = c.height / 2;
        ctx.beginPath();
        ctx.roundRect(0, 0, w, c.height, r);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.textBaseline = "middle";
        ctx.fillText(text, 18, c.height / 2 + 2);
        const tex = new T.CanvasTexture(c);
        tex.colorSpace = T.SRGBColorSpace;
        textures.push(tex);
        const s = new T.Sprite(new T.SpriteMaterial({ map: tex, depthTest: false, transparent: true }));
        s.renderOrder = 10;
        const h = opts.radius * 0.09 * scale;
        s.scale.set((h * w) / c.height, h, 1);
        return s;
      },
      onTheme: (fn) => themeFns.push(fn),
      button: (label, on) => mkBtn(label, on),
      toggle(label, init, on) {
        let v = init;
        const b = mkBtn(label, () => {
          v = !v;
          b.classList.toggle("primary", v);
          b.setAttribute("aria-pressed", String(v));
          on(v);
        });
        b.classList.toggle("primary", v);
        b.setAttribute("aria-pressed", String(v));
        return b;
      },
      slider(label, min, max, value, step, unit, on) {
        const l = document.createElement("label");
        l.className = "tb-anim-slider";
        const span = document.createElement("span");
        const i = document.createElement("input");
        i.type = "range";
        Object.assign(i, { min: String(min), max: String(max), step: String(step), value: String(value) });
        const show = () => (span.textContent = `${label} ${i.value}${unit}`);
        i.addEventListener("input", () => (show(), on(Number(i.value))));
        show();
        l.append(span, i);
        ctl.appendChild(l);
        return i;
      },
      select(options, value, on) {
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
      },
      setView,
    };

    // theme first so materials built in `build` can read kit.dark()
    applyTheme();
    fig = build(kit) || {};
    applyTheme();
    resize();

    const ro = typeof ResizeObserver === "function" ? new ResizeObserver(resize) : null;
    ro?.observe(stage);
    const io =
      typeof IntersectionObserver === "function"
        ? new IntersectionObserver((es) => {
            for (const e of es) {
              visible = e.isIntersecting;
              if (!host.isConnected) dispose();
              else if (visible) invalidate();
            }
          })
        : null;
    io?.observe(host);
    const mo = new MutationObserver(applyTheme);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class"] });
    const mq = typeof matchMedia === "function" ? matchMedia("(prefers-color-scheme: dark)") : null;
    mq?.addEventListener("change", applyTheme);
    const poll = window.setInterval(() => !host.isConnected && dispose(), 3000);

    function dispose() {
      if (disposed) return;
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      ro?.disconnect();
      io?.disconnect();
      mo.disconnect();
      mq?.removeEventListener("change", applyTheme);
      clearInterval(poll);
      canvas.removeEventListener("wheel", onWheel);
      scene.traverse((o) => {
        const m = o as T3.Mesh;
        m.geometry?.dispose();
        const mats = m.material ? (Array.isArray(m.material) ? m.material : [m.material]) : [];
        for (const x of mats) {
          (x as T3.MeshStandardMaterial).map?.dispose();
          x.dispose();
        }
      });
      for (const t of textures) t.dispose();
      edgeMat.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    }
  }
}

// ================================================================ helpers

/** Hatch texture for cut faces. */
function hatchTexture(T: THREE, fg: string, bg: string) {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  g.fillStyle = bg;
  g.fillRect(0, 0, 64, 64);
  g.strokeStyle = fg;
  g.lineWidth = 5;
  for (let k = -64; k <= 128; k += 16) {
    g.beginPath();
    g.moveTo(k, 64);
    g.lineTo(k + 64, 0);
    g.stroke();
  }
  const t = new T.CanvasTexture(c);
  t.wrapS = t.wrapT = T.RepeatWrapping;
  t.colorSpace = T.SRGBColorSpace;
  return t;
}

/** The stepped block with a through hole (mm): base 60×20×40, step 30×20×40, hole φ14. */
function steppedBlock(k: Kit, mat: T3.Material, clip?: T3.Plane[]) {
  const { T } = k;
  const g = new T.Group();
  const s = new T.Shape();
  s.moveTo(-30, -20);
  s.lineTo(30, -20);
  s.lineTo(30, 20);
  s.lineTo(-30, 20);
  s.closePath();
  const hole = new T.Path();
  hole.absarc(15, 0, 7, 0, Math.PI * 2, true);
  s.holes.push(hole);
  const baseGeo = new T.ExtrudeGeometry(s, { depth: 20, bevelEnabled: false, curveSegments: 40 });
  baseGeo.rotateX(-Math.PI / 2);
  const base = k.mesh(baseGeo, mat, { clip });
  const stepGeo = new T.BoxGeometry(30, 20, 40);
  stepGeo.translate(-15, 30, 0);
  const step = k.mesh(stepGeo, mat, { clip });
  g.add(base, step);
  return g;
}

const line = (T: THREE, pts: number[][], mat: T3.LineBasicMaterial | T3.LineDashedMaterial, closed = false) => {
  const v = pts.map((p) => new T.Vector3(p[0], p[1], p[2] ?? 0));
  if (closed) v.push(v[0].clone());
  const geo = new T.BufferGeometry().setFromPoints(v);
  const l = new T.Line(geo, mat);
  l.computeLineDistances();
  return l;
};
const circlePts = (cx: number, cy: number, r: number, n = 48) =>
  Array.from({ length: n + 1 }, (_, i) => [cx + r * Math.cos((i / n) * Math.PI * 2), cy + r * Math.sin((i / n) * Math.PI * 2)]);

// ================================================================ figures

export const VIEW3D: Record<string, (host: HTMLElement) => void> = {
  // ---------------------------------------------------------- projection
  "3d-projection": (host) =>
    view3d(host, "ガラス箱と第三角法の三面図", { target: [0, 22, 0], radius: 62, start: [32, 22], grid: [160, -6] }, (k) => {
      const { T, root } = k;
      const part = steppedBlock(k, k.mat(0xc7ccd4));
      root.add(part);
      const vis = new T.LineBasicMaterial({ color: 0x1f6feb });
      const hid = new T.LineDashedMaterial({ color: 0x1f6feb, dashSize: 2.2, gapSize: 1.6 });
      const ctr = new T.LineDashedMaterial({ color: 0xd9480f, dashSize: 5, gapSize: 1.5 });
      const glassMat = new T.MeshBasicMaterial({ color: 0x7fb2ff, transparent: true, opacity: 0.13, side: T.DoubleSide, depthWrite: false });
      const gEdge = new T.LineBasicMaterial({ color: 0x5b8fd9, transparent: true, opacity: 0.7 });
      // glass box x[-42,42] y[-4,52] z[-30,30]
      const X = 42, Y0 = -4, Y1 = 52, Z = 30;
      const box = new T.Group();
      const boxGeo = new T.BoxGeometry(2 * X, Y1 - Y0, 2 * Z);
      boxGeo.translate(0, (Y0 + Y1) / 2, 0);
      box.add(new T.LineSegments(new T.EdgesGeometry(boxGeo), gEdge));
      boxGeo.dispose();
      root.add(box);
      const pane = (w: number, h: number) => new T.Mesh(new T.PlaneGeometry(w, h), glassMat);
      // front face (z = Z): drawing coords (x, y)
      const front = new T.Group();
      front.position.z = Z + 0.05;
      const pf = pane(2 * X, Y1 - Y0);
      pf.position.y = (Y0 + Y1) / 2;
      front.add(
        pf,
        line(T, [[-30, 0], [30, 0], [30, 20], [0, 20], [0, 40], [-30, 40]], vis, true),
        line(T, [[8, 0], [8, 20]], hid),
        line(T, [[22, 0], [22, 20]], hid),
        line(T, [[15, -3], [15, 23]], ctr),
      );
      // top face (y = Y1), hinged on the front-top edge
      const topHinge = new T.Group();
      topHinge.position.set(0, Y1 + 0.05, Z);
      const top = new T.Group();
      top.position.set(0, 0, -Z);
      const pt = pane(2 * X, 2 * Z);
      pt.rotation.x = -Math.PI / 2;
      const xz = (p: number[][]) => p.map(([x, z]) => [x, 0, z]);
      top.add(
        pt,
        line(T, xz([[-30, -20], [30, -20], [30, 20], [-30, 20]]), vis, true),
        line(T, xz([[0, -20], [0, 20]]), vis),
        line(T, xz(circlePts(15, 0, 7)), vis),
        line(T, xz([[15, -10], [15, 10]]), ctr),
        line(T, xz([[5, 0], [25, 0]]), ctr),
      );
      topHinge.add(top);
      // right face (x = X), hinged on the front-right edge
      const rightHinge = new T.Group();
      rightHinge.position.set(X + 0.05, 0, Z);
      const right = new T.Group();
      right.position.set(0, 0, -Z);
      const pr = pane(2 * Z, Y1 - Y0);
      pr.rotation.y = Math.PI / 2;
      pr.position.y = (Y0 + Y1) / 2;
      const zy = (p: number[][]) => p.map(([z, y]) => [0, y, -z]);
      right.add(
        pr,
        line(T, zy([[-20, 0], [20, 0], [20, 40], [-20, 40]]), vis, true),
        line(T, zy([[-20, 20], [20, 20]]), vis),
        line(T, zy([[-7, 0], [-7, 20]]), hid),
        line(T, zy([[7, 0], [7, 20]]), hid),
        line(T, zy([[0, -3], [0, 23]]), ctr),
      );
      rightHinge.add(right);
      const lf = k.label("正面図");
      lf.position.set(-30, Y0 + 4, 0);
      front.add(lf);
      const lt = k.label("平面図");
      lt.position.set(-30, 0, -Z + 4);
      top.add(lt);
      const lr = k.label("右側面図");
      lr.position.set(0, Y0 + 4, -Z - 6);
      right.add(lr);
      const views = new T.Group();
      views.add(front, topHinge, rightHinge);
      root.add(views);

      let showBox = true;
      let unfold = 0;
      let goal = 0;
      const apply = () => {
        box.visible = showBox && unfold < 0.02;
        views.visible = showBox;
        topHinge.rotation.x = (Math.PI / 2) * unfold;
        rightHinge.rotation.y = (-Math.PI / 2) * unfold;
        part.traverse((o) => {
          const m = (o as T3.Mesh).material as T3.MeshStandardMaterial | undefined;
          if (m && "roughness" in m) {
            m.transparent = unfold > 0.5;
            m.opacity = unfold > 0.5 ? 0.25 : 1;
          }
        });
        k.out.innerHTML =
          unfold > 0.98
            ? "展開完了: <b>平面図は正面図の上</b>、<b>右側面図は正面図の右</b>。見る側の面に描くので、見たとおりの位置に並ぶのが第三角法です。"
            : showBox
              ? "品物をガラスの箱に入れ、<b>手前のガラス面</b>に見たとおりの形を写し取ります (第三角法)。破線はかくれ線、一点鎖線は穴の中心線。「展開」でガラス面を開きます。"
              : "段付きブロック (φ14 の貫通穴)。ドラッグで回して、正面・上・右から見た形を確かめましょう。";
      };
      k.toggle("ガラス箱", true, (v) => ((showBox = v), apply(), k.invalidate()));
      const ub = k.toggle("展開", false, (v) => {
        goal = v ? 1 : 0;
        if (v) {
          showBox = true;
          k.setView("front");
        }
        if (k.reduced) {
          unfold = goal;
          apply();
          k.invalidate();
        } else k.play(true);
      });
      ub.title = "ガラス面を正面図の平面へ開く";
      apply();
      return {
        tick(dt) {
          const s = Math.sign(goal - unfold);
          unfold = Math.max(0, Math.min(1, unfold + s * dt * 0.8));
          apply();
          return unfold !== goal;
        },
      };
    }),

  // ------------------------------------------------------------- section
  "3d-section": (host) =>
    view3d(host, "切断面とハッチング (全断面図)", { target: [0, 18, 0], radius: 48, start: [30, 22], grid: [140, -0.5] }, (k) => {
      const { T, root } = k;
      const plane = new T.Plane(new T.Vector3(0, 0, -1), 0);
      const clip = [plane];
      const mat = k.mat(0xc7ccd4, { clippingPlanes: clip, side: T.DoubleSide });
      root.add(steppedBlock(k, mat, clip));
      const hatch = hatchTexture(T, "#c2410c", "#fde7d6");
      hatch.repeat.set(1 / 8, 1 / 8);
      const capMat = new T.MeshStandardMaterial({ map: hatch, roughness: 0.8, side: T.DoubleSide, polygonOffset: true, polygonOffsetFactor: -1 });
      const cap = new T.Mesh(new T.BufferGeometry(), capMat);
      const capEdge = new T.LineSegments(new T.BufferGeometry(), new T.LineBasicMaterial({ color: 0x9a3412 }));
      cap.add(capEdge);
      root.add(cap);
      const ghostMat = new T.MeshBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0.08, side: T.DoubleSide, depthWrite: false });
      const ghost = new T.Mesh(new T.PlaneGeometry(90, 60), ghostMat);
      ghost.position.y = 20;
      ghost.add(new T.LineSegments(new T.EdgesGeometry(ghost.geometry), new T.LineBasicMaterial({ color: 0xf97316 })));
      root.add(ghost);
      let c = 0;
      let on = true;
      const regions = (z: number): number[][][] => {
        if (Math.abs(z) >= 20) return [];
        if (Math.abs(z) < 7) {
          const w = Math.sqrt(49 - z * z);
          return [
            [[-30, 0], [15 - w, 0], [15 - w, 20], [0, 20], [0, 40], [-30, 40]],
            [[15 + w, 0], [30, 0], [30, 20], [15 + w, 20]],
          ];
        }
        return [[[-30, 0], [30, 0], [30, 20], [0, 20], [0, 40], [-30, 40]]];
      };
      const update = () => {
        plane.constant = on ? c : 100;
        cap.visible = ghost.visible = on;
        const rs = regions(c);
        const shapes = rs.map((r) => new T.Shape(r.map(([x, y]) => new T.Vector2(x, y))));
        cap.geometry.dispose();
        cap.geometry = new T.ShapeGeometry(shapes);
        cap.position.z = c;
        capEdge.geometry.dispose();
        const seg: T3.Vector3[] = [];
        for (const r of rs) for (let i = 0; i < r.length; i++) {
          const a = r[i], b = r[(i + 1) % r.length];
          seg.push(new T.Vector3(a[0], a[1], 0.02), new T.Vector3(b[0], b[1], 0.02));
        }
        capEdge.geometry = new T.BufferGeometry().setFromPoints(seg);
        ghost.position.z = c;
        const thruHole = Math.abs(c) < 7;
        k.out.innerHTML = on
          ? `切断位置 z = ${c} mm。切り口 (材料のある所) だけに<b>ハッチング</b>を入れます。${
              thruHole ? "穴の位置で切ると、穴は<b>空間なのでハッチングしない</b> — 左右に分かれた切り口になります。" : "穴を外れた位置で切ると、穴は断面に現れません。中心線 (z = 0) で切るのが基本です。"
            }`
          : "切断を外した状態。外から見えない穴は、通常の投影図ではかくれ線 (破線) になります。";
        k.invalidate();
      };
      k.slider("切断位置 z", -18, 18, 0, 1, " mm", (v) => ((c = v), update()));
      k.toggle("切断", true, (v) => ((on = v), update()));
      update();
    }),

  // ------------------------------------------------------------- bearing
  "3d-bearing": (host) =>
    view3d(host, "深溝玉軸受の構造", { target: [0, 0, 0], radius: 46, start: [28, 28] }, (k) => {
      const { T, root } = k;
      const steel = k.mat(0xb8c0ca, { metalness: 0.55, roughness: 0.3, side: T.DoubleSide });
      const ballMat = k.mat(0xdde3ea, { metalness: 0.7, roughness: 0.18 });
      const cageMat = k.mat(0xc98a3a, { metalness: 0.45, roughness: 0.4 });
      const pcr = 27, br = 5.5, B = 7;
      const arc = (from: number, to: number, cx: number, r: number, n = 14) =>
        Array.from({ length: n + 1 }, (_, i) => {
          const a = from + ((to - from) * i) / n;
          return new T.Vector2(cx + r * Math.cos(a), r * Math.sin(a));
        });
      const gr = br * 1.04;
      const a0 = Math.asin(4.06 / gr);
      // outer ring profile (r, y)
      const outerP = [new T.Vector2(38, -B), new T.Vector2(38, B), new T.Vector2(31, B), ...arc(a0, -a0, pcr, gr), new T.Vector2(31, -B), new T.Vector2(38, -B)];
      const innerP = [new T.Vector2(16, B), new T.Vector2(16, -B), new T.Vector2(23, -B), ...arc(Math.PI + a0, Math.PI - a0, pcr, gr), new T.Vector2(23, B), new T.Vector2(16, B)];
      const outer = k.mesh(new T.LatheGeometry(outerP, 96), steel, { threshold: 40 });
      const inner = k.mesh(new T.LatheGeometry(innerP, 96), steel, { threshold: 40 });
      const N = 9;
      const balls = new T.Group();
      const ballGeo = new T.SphereGeometry(br, 32, 20);
      for (let i = 0; i < N; i++) {
        const a = (i / N) * Math.PI * 2;
        const b = new T.Mesh(ballGeo, ballMat);
        b.position.set(pcr * Math.cos(a), 0, pcr * Math.sin(a));
        balls.add(b);
      }
      // pressed-steel cage: two rings + bridges between the balls
      const cage = new T.Group();
      for (const y of [-4.6, 4.6]) {
        const t = k.mesh(new T.TorusGeometry(pcr, 0.9, 10, 96), cageMat, { edges: false });
        t.rotation.x = Math.PI / 2;
        t.position.y = y;
        cage.add(t);
      }
      for (let i = 0; i < N; i++) {
        const a = ((i + 0.5) / N) * Math.PI * 2;
        const br2 = k.mesh(new T.BoxGeometry(2.2, 10, 4.2), cageMat, { threshold: 30 });
        br2.position.set(pcr * Math.cos(a), 0, pcr * Math.sin(a));
        br2.rotation.y = -a;
        cage.add(br2);
      }
      const asm = new T.Group();
      asm.add(outer, inner, balls, cage);
      asm.rotation.x = Math.PI / 2; // axis toward the viewer
      root.add(asm);
      let ex = 0, exGoal = 0, spin = false, ang = 0;
      const ratio = (1 - (2 * br) / (2 * pcr)) / 2; // cage speed / inner-ring speed
      const apply = () => {
        const e = ex * ex * (3 - 2 * ex);
        outer.position.y = 26 * e;
        inner.position.y = -26 * e;
        cage.position.y = 13 * e;
        inner.rotation.y = -ang;
        cage.rotation.y = -ang * ratio;
        balls.rotation.y = -ang * ratio;
        k.out.innerHTML =
          `<b>外輪・内輪・転動体 (玉 ${N} 個)・保持器</b>の 4 部品。玉は軌道溝に沿って転がり、保持器が玉どうしの間隔を保ちます。` +
          (spin ? ` 内輪を回すと、玉と保持器は内輪の約 <b>${ratio.toFixed(2)} 倍</b>の速さで公転します。` : "");
      };
      k.toggle("分解", false, (v) => {
        exGoal = v ? 1 : 0;
        if (k.reduced) ((ex = exGoal), apply(), k.invalidate());
        else k.play(true);
      });
      k.toggle("回転", false, (v) => {
        spin = v;
        apply();
        k.play(true);
      });
      apply();
      return {
        tick(dt) {
          ex = Math.max(0, Math.min(1, ex + Math.sign(exGoal - ex) * dt * 1.2));
          if (spin) ang += dt * (k.reduced ? 0.4 : 1.6);
          apply();
          return spin || ex !== exGoal;
        },
      };
    }),

  // --------------------------------------------------------------- gears
  "3d-gears": (host) =>
    view3d(host, "平歯車のかみ合いと速度比", { target: [0, 0, 0], radius: 62, start: [18, 30] }, (k) => {
      const { T, root } = k;
      const m = 4;
      const inv = (a: number) => Math.tan(a) - a;
      const alpha = (20 * Math.PI) / 180;
      const gearShape = (z: number) => {
        const rp = (m * z) / 2, rb = rp * Math.cos(alpha), ra = rp + m, rf = rp - 1.25 * m;
        const beta = Math.PI / (2 * z) + inv(alpha);
        const s = new T.Shape();
        const pts: T3.Vector2[] = [];
        const P = (r: number, a: number) => pts.push(new T.Vector2(r * Math.cos(a), r * Math.sin(a)));
        const r0 = Math.max(rf, rb);
        const n = 8;
        for (let i = 0; i < z; i++) {
          const c = (i / z) * Math.PI * 2;
          P(rf, c - beta);
          for (let j = 0; j <= n; j++) {
            const r = r0 + ((ra - r0) * j) / n;
            P(r, c - (beta - inv(Math.acos(rb / r))));
          }
          for (let j = n; j >= 0; j--) {
            const r = r0 + ((ra - r0) * j) / n;
            P(r, c + (beta - inv(Math.acos(rb / r))));
          }
          P(rf, c + beta);
          const next = ((i + 1) / z) * Math.PI * 2 - beta;
          for (let j = 1; j < 4; j++) P(rf, c + beta + ((next - c - beta) * j) / 4);
        }
        s.setFromPoints(pts);
        const h = new T.Path();
        h.absarc(0, 0, Math.min(8, rf * 0.35), 0, Math.PI * 2, true);
        s.holes.push(h);
        return s;
      };
      const g1Mat = k.mat(0x9fb3c8, { metalness: 0.4, roughness: 0.35 });
      const g2Mat = k.mat(0xc9ced6, { metalness: 0.4, roughness: 0.35 });
      const mk = new T.MeshStandardMaterial({ color: 0xe03131 });
      let z1 = 12, z2 = 24;
      const g1 = new T.Group(), g2 = new T.Group();
      root.add(g1, g2);
      const make = (g: T3.Group, z: number, mat: T3.Material) => {
        g.clear();
        const geo = new T.ExtrudeGeometry(gearShape(z), { depth: 12, bevelEnabled: false, curveSegments: 24 });
        geo.translate(0, 0, -6);
        g.add(k.mesh(geo, mat, { threshold: 30 }));
        const dot = new T.Mesh(new T.CylinderGeometry(1.6, 1.6, 12.4, 16), mk);
        dot.rotation.x = Math.PI / 2;
        dot.position.x = (m * z) / 2 - 3;
        g.add(dot);
        const sr = Math.min(8, ((m * z) / 2 - 1.25 * m) * 0.35) - 0.2;
        const shaft = k.mesh(new T.CylinderGeometry(sr, sr, 40, 32), k.mat(0x7b8594), { threshold: 40 });
        shaft.rotation.x = Math.PI / 2;
        g.add(shaft);
      };
      let th = 0;
      const layout = () => {
        make(g1, z1, g1Mat);
        make(g2, z2, g2Mat);
        const a = (m * (z1 + z2)) / 2;
        g1.position.x = -a * (z2 / (z1 + z2));
        g2.position.x = a * (z1 / (z1 + z2));
        apply();
      };
      const apply = () => {
        g1.rotation.z = th;
        g2.rotation.z = Math.PI + Math.PI / z2 - (th * z1) / z2;
        const i = z2 / z1;
        k.out.innerHTML = `z₁ = ${z1}, z₂ = ${z2}、モジュール m = ${m}。速度比 i = z₂ / z₁ = <b>${i.toFixed(2)}</b> — 小歯車が ${i.toFixed(i % 1 ? 1 : 0)} 回転すると大歯車は 1 回転 (赤い印で数えられます)。回転方向は逆、トルクは i 倍。中心距離 a = m(z₁+z₂)/2 = ${(m * (z1 + z2)) / 2} mm。`;
      };
      k.select(
        [["12-24", "z 12 : 24"], ["12-36", "z 12 : 36"], ["16-24", "z 16 : 24"], ["18-18", "z 18 : 18"]],
        "12-24",
        (v) => {
          [z1, z2] = v.split("-").map(Number);
          th = 0;
          layout();
          k.invalidate();
        },
      );
      const playing = !k.reduced;
      k.toggle("回転", playing, (v) => k.play(v));
      layout();
      k.play(playing);
      return {
        tick(dt) {
          th += dt * 0.9;
          apply();
        },
      };
    }),

  // --------------------------------------------------------------- ibeam
  "3d-ibeam": (host) =>
    view3d(host, "同じ断面積の I 形と長方形 — 曲げ剛性の差", { target: [70, 0, 0], radius: 95, start: [38, 20], grid: [260, -60] }, (k) => {
      const { T, root } = k;
      const L = 160;
      // I: H40, B30, tf5, tw4 → A = 420 ; rect: 21 × 20 → A = 420
      const ish = new T.Shape([[-15, -20], [15, -20], [15, -15], [2, -15], [2, 15], [15, 15], [15, 20], [-15, 20], [-15, 15], [-2, 15], [-2, -15], [-15, -15]].map(([x, y]) => new T.Vector2(x, y)));
      const rsh = new T.Shape([[-10.5, -10], [10.5, -10], [10.5, 10], [-10.5, 10]].map(([x, y]) => new T.Vector2(x, y)));
      const II = (30 * 40 ** 3 - 26 * 30 ** 3) / 12;
      const IR = (21 * 20 ** 3) / 12;
      const beam = (s: T3.Shape, color: number, zOff: number) => {
        const geo = new T.ExtrudeGeometry(s, { depth: L, steps: 40, bevelEnabled: false });
        const m = k.mesh(geo, k.mat(color), { threshold: 20 });
        m.rotation.y = Math.PI / 2; // extrusion (local z) → world +x ; section x → world -z
        m.position.z = zOff;
        root.add(m);
        return { m, base: Float32Array.from(geo.attributes.position.array as Float32Array) };
      };
      const bi = beam(ish, 0x8fb0d6, -32);
      const br = beam(rsh, 0xd6b38f, 32);
      const wall = k.mesh(new T.BoxGeometry(8, 110, 130), k.mat(0x9aa3ae));
      wall.position.set(-4, -5, 0);
      root.add(wall);
      const arrows = [bi, br].map((b) => {
        const a = new T.ArrowHelper(new T.Vector3(0, -1, 0), new T.Vector3(L, 50, b.m.position.z), 26, 0xe03131, 9, 6);
        root.add(a);
        return a;
      });
      const li = k.label("I 形  I = " + Math.round(II / 1000) + "×10³ mm⁴", "#2563eb", 0.8);
      const lr = k.label("長方形  I = " + Math.round(IR / 1000) + "×10³ mm⁴", "#b45309", 0.8);
      root.add(li, lr);
      let load = 60;
      const apply = () => {
        const tipR = (40 * load) / 100; // exaggerated tip deflection of the rectangle
        for (const [b, I] of [[bi, II], [br, IR]] as const) {
          const tip = (tipR * IR) / I;
          const pos = b.m.geometry.attributes.position as T3.BufferAttribute;
          for (let i = 0; i < pos.count; i++) {
            const x = b.base[i * 3 + 2] / L; // 0 at wall .. 1 at tip
            pos.setY(i, b.base[i * 3 + 1] - (tip * x * x * (3 - x)) / 2);
          }
          pos.needsUpdate = true;
          b.m.geometry.computeVertexNormals();
          k.reEdge(b.m);
          const ar = arrows[b === bi ? 0 : 1];
          ar.position.y = 52 - tip + (b === bi ? 0 : -10);
          ar.visible = load > 0;
          (b === bi ? li : lr).position.set(L / 2, (b === bi ? 34 : 24) - tip * 0.3, b.m.position.z);
        }
        const ratio = II / IR;
        k.out.innerHTML = `断面積はどちらも <b>420 mm²</b> (同じ重さ)。断面二次モーメントは I 形が長方形の <b>${ratio.toFixed(1)} 倍</b>なので、同じ荷重でのたわみは <b>1/${ratio.toFixed(1)}</b>。材料を中立軸から遠い<b>フランジ</b>に置くほど曲げに強くなります (たわみは誇張表示)。`;
        k.invalidate();
      };
      k.slider("先端荷重", 0, 100, load, 5, " %", (v) => ((load = v), apply()));
      apply();
    }),

  // ------------------------------------------------------------- snapfit
  "3d-snapfit": (host) =>
    view3d(host, "スナップフィット: 組立中のフックのたわみ", { target: [4, 22, 0], radius: 32, start: [24, 14], grid: [100, -6] }, (k) => {
      const { T, root } = k;
      const L = 30, t = 3, hd = 2.6, hl = 6, W = 10, gap = 3.15;
      // hook profile in XY: arm x[0,t], y[0,L]; head ramp on +x side
      const N = 24;
      const pts: number[][] = [];
      for (let i = 0; i <= N; i++) pts.push([0, (L * i) / N]);
      pts.push([0, L + hl]);
      pts.push([t, L + hl]);
      pts.push([t + hd, L]);
      for (let i = N; i >= 0; i--) pts.push([t, (L * i) / N]);
      pts.pop();
      pts.push([t, 0]);
      const shape = new T.Shape(pts.map(([x, y]) => new T.Vector2(x, y)));
      const hookGeo = new T.ExtrudeGeometry(shape, { depth: W, bevelEnabled: false });
      hookGeo.translate(0, 0, -W / 2);
      const base0 = Float32Array.from(hookGeo.attributes.position.array as Float32Array);
      const hookMat = k.mat(0x7aa6d8);
      const hook = k.mesh(hookGeo, hookMat, { threshold: 30 });
      root.add(hook);
      const baseA = k.mesh(new T.BoxGeometry(34, 6, 22), k.mat(0x9fb6cf));
      baseA.position.set(-6, -3, 0);
      root.add(baseA);
      // mating part B: a lid with an edge at x = gap
      const lid = new T.Group();
      const lidMat = k.mat(0xd8c7a8, { transparent: true, opacity: 0.92 });
      const plate = k.mesh(new T.BoxGeometry(22, 3, 22), lidMat);
      plate.position.set(gap + 11, 1.5, 0);
      const wallB = k.mesh(new T.BoxGeometry(3, 18, 22), lidMat);
      wallB.position.set(gap + 22 - 1.5, -6, 0);
      lid.add(plate, wallB);
      root.add(lid);
      let s = 0; // 0..1 assembly progress
      let auto = !k.reduced;
      let hold = 0;
      const yStart = L + 14, yEnd = L - 3;
      const apply = () => {
        const yB = yStart + (yEnd - yStart) * Math.min(1, s);
        lid.position.y = yB;
        const xr = (y: number) => t + hd - (hd * (y - L)) / hl;
        let d = 0;
        if (yB >= L && yB <= L + hl) d = Math.max(0, xr(yB) - gap);
        else if (yB < L && yB + 3 > L) d = t + hd - gap;
        const pos = hook.geometry.attributes.position as T3.BufferAttribute;
        for (let i = 0; i < pos.count; i++) {
          const y = base0[i * 3 + 1];
          const u = Math.min(1, y / L);
          const slope = (1.5 * d) / L; // tip slope of a tip-loaded cantilever
          const dx = y <= L ? (d * u * u * (3 - u)) / 2 : d + slope * (y - L);
          pos.setX(i, base0[i * 3] - dx);
        }
        pos.needsUpdate = true;
        hook.geometry.computeVertexNormals();
        k.reEdge(hook);
        const eps = (1.5 * t * d) / (L * L);
        hookMat.color.setHSL(0.58 - Math.min(1, eps / 0.012) * 0.58, 0.55, k.dark() ? 0.55 : 0.62);
        const snapped = yB + 3 <= L + 0.01;
        k.out.innerHTML = `たわみ δ = <b>${d.toFixed(2)} mm</b>、根元のひずみ ε ≈ 1.5·t·δ / L² = <b>${(eps * 100).toFixed(2)} %</b> (L = ${L}, t = ${t} mm)。` +
          (d === 0 && !snapped ? " ふたを押し下げていきます。縁が斜面に当たるとフックがたわみ始めます。" : snapped ? " <b>カチッ</b> — ふたの縁がかえしの下に入り、フックは元に戻ります。保持中はひずみ 0 にするのが基本。" : " ふたの縁が斜面を押して、フックを根元から曲げています。色はひずみの大きさ。");
        k.invalidate();
      };
      const sl = k.slider("押し込み", 0, 100, 0, 1, " %", (v) => {
        if (Math.round(s * 100) !== v) s = v / 100;
        apply();
      });
      k.toggle("自動再生", auto, (v) => ((auto = v), k.play(v)));
      apply();
      k.play(auto);
      return {
        tick(dt) {
          if (!auto) return false;
          if (s >= 1) {
            hold += dt;
            if (hold > 1.4) ((hold = 0), (s = 0));
          } else s = Math.min(1, s + dt * 0.28);
          sl.value = String(Math.round(s * 100));
          sl.dispatchEvent(new Event("input"));
          return true;
        },
      };
    }),

  // ---------------------------------------------------------- ergonomic
  "3d-ergonomic": (host) =>
    view3d(host, "作業台の高さと肘の高さ (立ち作業)", { target: [25, 90, 0], radius: 105, start: [24, 10], grid: [300, 0] }, (k) => {
      const { T, root } = k;
      const skin = k.mat(0xe8c4a2, { roughness: 0.7 });
      const cloth = k.mat(0x5b7db1, { roughness: 0.75 });
      const pants = k.mat(0x3f4a5a, { roughness: 0.8 });
      const limb = (r: number, mat: T3.Material) => {
        const m = new T.Mesh(new T.CapsuleGeometry(r, 1, 6, 16), mat);
        root.add(m);
        return { m, r };
      };
      const setLimb = (L: { m: T3.Mesh; r: number }, a: T3.Vector3, b: T3.Vector3) => {
        const d = b.clone().sub(a);
        L.m.geometry.dispose();
        L.m.geometry = new T.CapsuleGeometry(L.r, Math.max(0.1, d.length()), 6, 16);
        L.m.position.copy(a).addScaledVector(d, 0.5);
        L.m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), d.normalize());
      };
      const legs = [limb(6.2, pants), limb(6.2, pants)];
      const torso = limb(13, cloth);
      const neck = limb(4.5, skin);
      const head = new T.Mesh(new T.SphereGeometry(10.5, 24, 16), skin);
      root.add(head);
      const upper = [limb(4.6, cloth), limb(4.6, cloth)];
      const fore = [limb(3.8, skin), limb(3.8, skin)];
      // workbench
      const benchMat = k.mat(0xc9a77c, { roughness: 0.8 });
      const top = k.mesh(new T.BoxGeometry(70, 4, 110), benchMat);
      root.add(top);
      const legsB = [0, 1, 2, 3].map(() => {
        const m = k.mesh(new T.BoxGeometry(5, 1, 5), k.mat(0x7b8594));
        root.add(m);
        return m;
      });
      const elbowMark = new T.Mesh(new T.PlaneGeometry(150, 110), new T.MeshBasicMaterial({ color: 0x15803d, transparent: true, opacity: 0.14, side: T.DoubleSide, depthWrite: false }));
      elbowMark.rotation.x = -Math.PI / 2;
      elbowMark.add(new T.LineSegments(new T.EdgesGeometry(elbowMark.geometry), new T.LineBasicMaterial({ color: 0x15803d })));
      root.add(elbowMark);
      const elbowLab = k.label("肘の高さ", "#15803d", 0.8);
      root.add(elbowLab);
      let H = 171, T0 = 90;
      const bx = 34; // bench front edge (person faces +x)
      const apply = () => {
        const hip = 0.53 * H, sh = 0.818 * H, E = 0.63 * H;
        const U = sh - E, F = 0.255 * H; // shoulder→elbow, elbow→fingertips (approx)
        const target = new T.Vector3(bx + 12, T0 + 3, 0);
        // trunk flexion needed so the hand reaches the bench
        let flex = 0;
        const shoulderAt = (f: number, z: number) => new T.Vector3((sh - hip) * Math.sin(f), hip + (sh - hip) * Math.cos(f), z);
        while (flex < 1.1 && shoulderAt(flex, 0).distanceTo(target) > (U + F) * 0.97) flex += 0.01;
        for (const s of [-1, 1]) {
          const z = 9 * s;
          setLimb(legs[s < 0 ? 0 : 1], new T.Vector3(0, hip, z * 0.6), new T.Vector3(0, 6, z * 0.75));
          const S = shoulderAt(flex, z * 1.9);
          const tg = target.clone().setZ(z * 1.4);
          // two-link IK in the plane containing S, tg and "down"
          const d = Math.min(S.distanceTo(tg), U + F - 0.01);
          const a = Math.acos(Math.max(-1, Math.min(1, (U * U + d * d - F * F) / (2 * U * d))));
          const dir = tg.clone().sub(S).normalize();
          const side = new T.Vector3(0, 0, 1);
          const El = S.clone().addScaledVector(dir.clone().applyAxisAngle(side, -a), U);
          setLimb(upper[s < 0 ? 0 : 1], S, El);
          setLimb(fore[s < 0 ? 0 : 1], El, S.clone().addScaledVector(dir, d));
        }
        const Sc = shoulderAt(flex, 0);
        setLimb(torso, new T.Vector3(0, hip + 4, 0), Sc.clone().add(new T.Vector3(0, -6, 0)));
        const nk = shoulderAt(flex, 0).add(new T.Vector3(Math.sin(flex) * 8, Math.cos(flex) * 8, 0));
        setLimb(neck, Sc, nk);
        head.position.copy(nk).add(new T.Vector3(Math.sin(flex) * 9 + 2, Math.cos(flex) * 9, 0));
        top.position.set(bx + 35, T0 - 2, 0);
        legsB.forEach((m, i) => {
          m.scale.y = T0 - 4;
          m.position.set(bx + 4 + (i % 2) * 62, (T0 - 4) / 2, i < 2 ? -50 : 50);
        });
        elbowMark.position.set(10, E, 0);
        elbowLab.position.set(-50, E + 6, 0);
        const diff = T0 - E;
        const judge =
          diff > 5
            ? "<b>高すぎ</b> — 肩と腕が持ち上がり、肩こりの原因に。精密作業でも肘 +5〜10 cm まで"
            : diff >= -15
              ? "<b>適正</b> — 軽作業は肘高さ −5〜−15 cm が目安 (精密作業はやや高く)"
              : diff >= -40
                ? "<b>重作業向き</b> — 力を掛ける作業は肘 −15〜−40 cm。軽作業には低すぎ"
                : "<b>低すぎ</b> — 前かがみが続き、腰を痛めます";
        k.out.innerHTML = `身長 ${H} cm の肘高さ ≈ <b>${E.toFixed(0)} cm</b>、作業面 ${T0} cm (差 ${diff >= 0 ? "+" : ""}${diff.toFixed(0)} cm)。体幹の前傾 ${Math.round((flex * 180) / Math.PI)}°。${judge}。`;
        k.invalidate();
      };
      k.slider("作業面の高さ", 60, 120, T0, 1, " cm", (v) => ((T0 = v), apply()));
      k.select(
        [["153", "女性 5%ile (153 cm)"], ["171", "男性 50%ile (171 cm)"], ["183", "男性 95%ile (183 cm)"]],
        "171",
        (v) => ((H = Number(v)), apply()),
      );
      apply();
    }),

  // --------------------------------------------------------------- guard
  "3d-guard": (host) =>
    view3d(host, "インターロック付き可動ガード", { target: [0, 40, 0], radius: 70, start: [30, 18], grid: [220, 0] }, (k) => {
      const { T, root } = k;
      const body = k.mat(0xd5dae1);
      const dark = k.mat(0x56606d);
      const base = k.mesh(new T.BoxGeometry(100, 30, 60), body);
      base.position.y = 15;
      root.add(base);
      // enclosure frame (fixed guard): posts + roof, open front
      const frameMat = k.mat(0xf2c94c, { roughness: 0.5 });
      for (const [x, z] of [[-48, -28], [48, -28], [-48, 28], [48, 28]]) {
        const p = k.mesh(new T.BoxGeometry(4, 50, 4), frameMat);
        p.position.set(x, 55, z);
        root.add(p);
      }
      const roof = k.mesh(new T.BoxGeometry(100, 4, 60), frameMat);
      roof.position.y = 82;
      root.add(roof);
      const panelMat = new T.MeshStandardMaterial({ color: 0x9cc3e6, transparent: true, opacity: 0.22, roughness: 0.1, side: T.DoubleSide, depthWrite: false });
      for (const [x, z, ry, w] of [[-48, 0, Math.PI / 2, 56], [48, 0, Math.PI / 2, 56], [0, -28, 0, 92]] as const) {
        const p = new T.Mesh(new T.PlaneGeometry(w, 48), panelMat);
        p.position.set(x, 55, z);
        p.rotation.y = ry;
        root.add(p);
      }
      // spindle + cutter
      const spindle = new T.Group();
      const head = k.mesh(new T.BoxGeometry(18, 22, 18), dark);
      head.position.set(0, 69, 0);
      root.add(head);
      const sh = k.mesh(new T.CylinderGeometry(2.5, 2.5, 18, 20), dark, { threshold: 40 });
      sh.position.y = 50;
      const cutterGeo = new T.CylinderGeometry(9, 9, 5, 12);
      const cutter = k.mesh(cutterGeo, k.mat(0xb8c0ca, { metalness: 0.6, roughness: 0.3 }), { threshold: 20 });
      cutter.position.y = 42;
      const mark = new T.Mesh(new T.BoxGeometry(9, 5.4, 1.5), new T.MeshStandardMaterial({ color: 0xe03131 }));
      mark.position.set(4.5, 42, 0);
      spindle.add(sh, cutter, mark);
      root.add(spindle);
      const work = k.mesh(new T.BoxGeometry(40, 8, 26), k.mat(0x9fb6cf));
      work.position.y = 34;
      root.add(work);
      // hinged front door (hinge on the left post)
      const hinge = new T.Group();
      hinge.position.set(-46, 55, 30);
      const door = new T.Group();
      const bars = [[0, 22, 92, 4], [0, -22, 92, 4], [-44, 0, 4, 48], [44, 0, 4, 48]].map(([x, y, w, h]) => {
        const b = k.mesh(new T.BoxGeometry(w, h, 2.5), frameMat);
        b.position.set(x, y, 0);
        return b;
      });
      const pane = new T.Mesh(new T.PlaneGeometry(84, 40), panelMat);
      const handle = k.mesh(new T.BoxGeometry(3, 14, 3), dark);
      handle.position.set(40, 0, 3);
      door.add(...bars, pane, handle);
      door.position.x = 46;
      hinge.add(door);
      root.add(hinge);
      // interlock switch on the right post + actuator on the door
      const sw = k.mesh(new T.BoxGeometry(5, 10, 4), k.mat(0x2b2f36));
      sw.position.set(50.5, 66, 28);
      root.add(sw);
      const lampMat = new T.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x22c55e, emissiveIntensity: 0.8 });
      const lamp = new T.Mesh(new T.SphereGeometry(3, 16, 12), lampMat);
      lamp.position.set(40, 90, 0);
      root.add(lamp);
      const pole = k.mesh(new T.CylinderGeometry(1, 1, 6, 10), dark);
      pole.position.set(40, 86, 0);
      root.add(pole);

      let speed = 1; // 0..1 of full speed
      let doorA = 0; // 0 closed .. 1 open
      let wantOpen = false;
      let lockMode = false;
      let ang = 0;
      const stopTime = 2.4; // s, coast-down
      const status = () => {
        const closed = doorA < 0.01;
        lampMat.color.set(speed > 0.01 ? 0x22c55e : closed ? 0xf59e0b : 0xef4444);
        lampMat.emissive.copy(lampMat.color);
        let msg: string;
        if (closed && !wantOpen) msg = "ガードが閉じているときだけ主軸が回ります (インターロック)。";
        else if (lockMode && speed > 0.01) msg = `<b>ガードロック</b>: 停止指令後も慣性で回転中 (残り ${(speed * stopTime).toFixed(1)} s)。止まるまで扉は開きません。`;
        else if (!lockMode && speed > 0.01) msg = `<b>危険</b>: 扉を開けた瞬間に停止指令は出ますが、刃物は惰性で ${(speed * stopTime).toFixed(1)} s 回り続けます。停止時間が長い機械にはガードロックが必要です。`;
        else msg = "回転停止。扉を閉じるまで再起動しません (閉じただけでは動かず、起動操作が要るのが原則)。";
        k.out.innerHTML = `主軸 ${Math.round(speed * 3000)} min⁻¹ ・ 扉 ${doorA < 0.01 ? "閉" : "開"} — ${msg}`;
      };
      const apply = () => {
        hinge.rotation.y = -doorA * 1.75;
        spindle.rotation.y = ang;
        status();
      };
      k.toggle("ガードを開く", false, (v) => {
        wantOpen = v;
        k.play(true);
      });
      k.toggle("ガードロック", false, (v) => {
        lockMode = v;
        status();
      });
      apply();
      k.play(!k.reduced);
      return {
        tick(dt) {
          const run = !wantOpen && doorA < 0.01;
          speed = run ? Math.min(1, speed + dt / 1.2) : Math.max(0, speed - dt / stopTime);
          const canOpen = !lockMode || speed <= 0.01;
          if (wantOpen && canOpen) doorA = Math.min(1, doorA + dt * 0.9);
          if (!wantOpen) doorA = Math.max(0, doorA - dt * 0.9);
          ang += dt * speed * (k.reduced ? 2 : 14);
          apply();
          return speed > 0 || (wantOpen ? doorA < 1 : doorA > 0);
        },
      };
    }),
};
