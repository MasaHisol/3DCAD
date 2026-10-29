import * as THREE from "three";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type { BodyMesh, ThreadInfo } from "../kernel/protocol";
import type { PlaneDef, Vec3 } from "../core/types";
import { DEFAULT_LOD, batchGroups, boxMatrix, edgeVisibleAtZoom, lodLevel, projectedDiameter, spatialChunks, type LodOptions } from "../assembly/largeAsm";
import { TriangleBVH } from "./bvh";
import { clusterSimplify, decimateEdges } from "./simplify";
import { GpuPicker } from "./render/gpuPick";
import { TransparencyPass, type TransparentItem } from "./render/oit";
import { SectionCaps } from "./render/caps";
import { backendPref, chooseBackend, installWebGPUShims, type BackendInfo, type BackendPref } from "./render/backend";
import { keptByPlanes, sectionPlanes, type SectionState } from "./section";

export type PickKind = "face" | "edge" | "plane" | "axis" | "point" | "ref";

/** Display-only reference data (point clouds, IFC buildings, large meshes): drawn, measured, never modelled. */
export interface RefModel {
  id: string;
  name: string;
  kind: "points" | "mesh";
  object: THREE.Object3D;
  /** Points or triangles. */
  count: number;
  pointSize: number;
  /** Uniform colour; null = the file's own colours. */
  color: string | null;
  visible: boolean;
}

export interface Pick {
  kind: PickKind;
  body: number;
  index: number;
  point: Vec3;
  /** For origin / work geometry: an identifier such as "XY" or a feature id. */
  key?: string;
}

export type NavPreset = "inventor" | "fusion" | "solidworks" | "creo" | "onshape";

export const NAV_PRESETS: { id: NavPreset; label: string; help: string }[] = [
  { id: "inventor", label: "Inventor", help: "中ボタン: 画面移動 / Shift+中ボタン: オービット" },
  { id: "fusion", label: "Fusion 360", help: "中ボタン: 画面移動 / Shift+中ボタン: オービット" },
  { id: "solidworks", label: "SOLIDWORKS", help: "中ボタン: 回転 / Ctrl+中ボタン: 画面移動 / Shift+中ボタン: ズーム" },
  { id: "creo", label: "Creo", help: "中ボタン: 回転 / Shift+中ボタン: 画面移動 / Ctrl+中ボタン: ズーム" },
  { id: "onshape", label: "Onshape", help: "右ドラッグ: 回転 / 中ボタン・Ctrl+右ドラッグ: 画面移動" },
];

export type VisualStyle = "shadedEdges" | "shaded" | "wireframe" | "hiddenEdges";

export interface ViewState {
  target: THREE.Vector3;
  quat: THREE.Quaternion;
  height: number; // visible height (ortho) — also drives perspective distance
}

export interface ToolHandler {
  cursor?: string;
  onPointerDown?(e: PointerEvent, vp: Viewport): boolean | void;
  onPointerMove?(e: PointerEvent, vp: Viewport): void;
  onPointerUp?(e: PointerEvent, vp: Viewport): void;
  onDblClick?(e: MouseEvent, vp: Viewport): void;
  onContextMenu?(e: MouseEvent, vp: Viewport): boolean;
}

interface BodyView {
  data: BodyMesh;
  /** Placement of the body (assembly components); identity when absent. */
  matrix?: THREE.Matrix4;
  mesh: THREE.Mesh;
  back: THREE.Mesh;
  edges: THREE.LineSegments;
  hidden: THREE.LineSegments;
  segEdge: Uint32Array;
  faceGeoms: Map<number, THREE.BufferGeometry>;
  edgeGeoms: Map<number, THREE.BufferGeometry>;
  /** Mesh / edge geometry is shared with other views of the same BodyMesh (assembly instances). */
  shared?: boolean;
}

/** GPU geometry shared by every view of one BodyMesh (e.g. all instances of a bolt). */
interface SharedGeom {
  geom: THREE.BufferGeometry;
  edges: THREE.BufferGeometry;
  segEdge: Uint32Array;
}

interface RefGeom {
  key: string;
  kind: "plane" | "axis" | "point";
  object: THREE.Object3D;
  pickMesh: THREE.Object3D;
  plane?: PlaneDef;
  label: string;
}

const COLORS = {
  hover: new THREE.Color("#ff9d2e"),
  select: new THREE.Color("#1f8fff"),
  edge: new THREE.Color("#1d1f24"),
};

/** Surface bodies (open shells) are drawn in this colour, both sides visible. */
export const SURFACE_COLOR = "#e9a23b";

/** Zebra stripes from the reflected view direction (continuity / curvature check). */
function zebraMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
    uniforms: { stripes: { value: 14 } },
    vertexShader: `varying vec3 vN; varying vec3 vV;
      void main() { vec4 mv = modelViewMatrix * vec4(position, 1.0); vV = mv.xyz; vN = normalMatrix * normal; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform float stripes; varying vec3 vN; varying vec3 vV;
      void main() {
        vec3 n = normalize(vN); if (!gl_FrontFacing) n = -n;
        vec3 r = reflect(normalize(vV), n);
        float s = smoothstep(-0.08, 0.08, sin(r.y * stripes));
        float shade = 0.55 + 0.45 * abs(n.z);
        gl_FragColor = vec4(vec3(mix(0.08, 1.0, s) * shade), 1.0);
      }`,
  });
}

export class Viewport {
  readonly el: HTMLElement;
  /**
   * The renderer: a WebGLRenderer, or a WebGPURenderer after initBackend()
   * chose WebGPU (it offers the same drawing API used here; WebGL-only paths
   * check `backend.kind`).
   */
  renderer: THREE.WebGLRenderer;
  /** Render backend in use and why (WebGPU / WebGL fallback). */
  backend: BackendInfo = { kind: "webgl", reason: "WebGL" };
  onBackendChange: ((b: BackendInfo) => void) | null = null;
  /** Called on every camera change (in addition to onViewChange). */
  readonly viewListeners = new Set<() => void>();
  readonly labels: CSS2DRenderer;
  readonly scene = new THREE.Scene();
  readonly ortho = new THREE.OrthographicCamera(-1, 1, 1, -1, -1e5, 1e5);
  readonly persp = new THREE.PerspectiveCamera(35, 1, 0.1, 1e6);
  camera: THREE.Camera = this.ortho;
  perspective = false;

  readonly model = new THREE.Group();
  readonly overlay = new THREE.Group();
  readonly sketchLayer = new THREE.Group();
  /** Cosmetic threads drawn as helices on their cylinders. */
  readonly threadLayer = new THREE.Group();
  readonly trailLayer = new THREE.Group();
  readonly refLayer = new THREE.Group();
  /** Reference data (point clouds, IFC, display-only meshes). */
  readonly refModelLayer = new THREE.Group();
  refModels: RefModel[] = [];
  readonly triadScene = new THREE.Scene();
  readonly triadCam = new THREE.OrthographicCamera(-1.6, 1.6, 1.6, -1.6, -10, 10);

  view: ViewState = { target: new THREE.Vector3(), quat: new THREE.Quaternion(), height: 200 };
  bodies: BodyView[] = [];
  refs: RefGeom[] = [];
  style: VisualStyle = "shadedEdges";
  material: THREE.MeshStandardMaterial;
  backMaterial: THREE.MeshBasicMaterial;
  edgeMaterial = new THREE.LineBasicMaterial({ color: COLORS.edge });
  hiddenMaterial = new THREE.LineDashedMaterial({ color: 0x6b7280, dashSize: 1.5, gapSize: 1.2, depthTest: false, transparent: true, opacity: 0.6 });
  /** Active section (clipping) planes; material is kept where every plane's distance is ≥ 0. */
  clipPlanes: THREE.Plane[] = [];
  /** First clipping plane (single-section API of stage 1). */
  get clipPlane(): THREE.Plane | null {
    return this.clipPlanes[0] ?? null;
  }
  /** Fill the cut faces of section planes (stencil caps) and hatch them. */
  sectionCaps = false;
  sectionHatch = true;
  /** Hatch pattern key per displayed body (part id / material); default: the body index. */
  sectionPatternOf: ((body: number) => number | string | undefined) | null = null;
  readonly caps = new SectionCaps();
  /**
   * Parent of the clipped content (bodies, batches, transparent proxies). With
   * WebGPU it is a ClippingGroup: that renderer clips per group, not per material.
   */
  private clipGroup: THREE.Group = new THREE.Group();
  private ClippingGroup: (new () => THREE.Group & { clippingPlanes: THREE.Plane[] }) | null = null;
  private capsDirty = false;
  /** GPU ID-buffer picking (WebGL); falls back to the BVH ray test. */
  gpuPicking = true;
  private gpuPicker: GpuPicker | null = null;
  private pickVersion = 0;
  /** Transparency (X-ray / per-body opacity) with order-independent blending. */
  transparency!: TransparencyPass;
  xray = false;
  xrayOpacity = 0.28;
  private bodyOpacity = new Map<number, number>();
  private transparentBodies = new Set<number>();

  hover: Pick | null = null;
  selection: Pick[] = [];
  pickKinds = new Set<PickKind>(["face", "edge"]);
  pickFilter: ((p: Pick) => boolean) | null = null;
  tool: ToolHandler | null = null;
  navMode: "none" | "pan" | "zoom" | "orbit" = "none";
  onHoverChange: ((p: Pick | null) => void) | null = null;
  onViewChange: (() => void) | null = null;
  onCursorWorld: ((p: Vec3 | null) => void) | null = null;

  private hoverObj = new THREE.Group();
  private selectObj = new THREE.Group();
  private tagObj = new THREE.Group();
  private tags: { picks: Pick[]; color: string; opacity: number }[] = [];
  private raycaster = (() => {
    const r = new THREE.Raycaster();
    r.layers.enable(Viewport.OFFSCREEN); // batched bodies are still picked through their own meshes
    return r;
  })();
  private needsRender = true;
  private anim: { from: ViewState; to: ViewState; t0: number; dur: number } | null = null;
  private drag: { mode: "orbit" | "pan" | "zoom"; x: number; y: number; pivot: THREE.Vector3; button: number; moved: boolean; down: PointerEvent } | null = null;
  /** Mouse mapping familiar from other CAD systems. */
  navPreset: NavPreset = "inventor";
  invertWheel = false;
  private keysDown = new Set<string>();
  private resizeObs: ResizeObserver;

  constructor(el: HTMLElement) {
    this.el = el;
    this.renderer = this.createWebGL();
    el.appendChild(this.renderer.domElement);

    this.labels = new CSS2DRenderer();
    this.labels.domElement.classList.add("vp-labels");
    el.appendChild(this.labels.domElement);

    this.scene.environment = this.environmentFor(this.renderer);
    this.scene.environmentIntensity = 0.45;
    this.gpuPicker = new GpuPicker(this.renderer);
    this.transparency = new TransparencyPass(this.renderer, "webgl");
    this.scene.add(new THREE.HemisphereLight(0xf4f7ff, 0x5c6470, 0.55));
    // camera-attached lights: key from upper left, soft fill from the right
    for (const cam of [this.ortho, this.persp]) {
      const key = new THREE.DirectionalLight(0xffffff, 1.9);
      key.position.set(-0.6, 0.9, 1);
      const fill = new THREE.DirectionalLight(0xdfe8ff, 0.5);
      fill.position.set(1, -0.2, 0.6);
      cam.add(key, key.target, fill, fill.target);
    }
    this.scene.add(this.ortho, this.persp);

    this.material = new THREE.MeshStandardMaterial({
      color: "#c9ced6",
      metalness: 0.08,
      roughness: 0.48,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
      side: THREE.FrontSide,
    });
    this.backMaterial = new THREE.MeshBasicMaterial({ color: "#e0a458", side: THREE.BackSide });

    this.clipGroup.add(this.model, this.transparency.sortedGroup);
    this.scene.add(this.clipGroup, this.threadLayer, this.trailLayer, this.refLayer, this.refModelLayer, this.sketchLayer, this.overlay, this.caps.group);
    this.overlay.add(this.tagObj, this.hoverObj, this.selectObj);
    this.buildTriad();
    this.setStandardView([1, 1, 1], false);

    this.bindCanvas(this.renderer.domElement);
    window.addEventListener("keydown", (e) => this.keysDown.add(e.key));
    window.addEventListener("keyup", (e) => this.keysDown.delete(e.key));
    window.addEventListener("blur", () => this.keysDown.clear());

    this.resizeObs = new ResizeObserver(() => this.resize());
    this.resizeObs.observe(el);
    this.resize();
    const loop = (t: number) => {
      this.tick(t);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  // ------------------------------------------------------------ backends ---

  private createWebGL(): THREE.WebGLRenderer {
    // stencil: section caps
    const r = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true, stencil: true });
    this.configureRenderer(r);
    return r;
  }

  private configureRenderer(r: THREE.WebGLRenderer) {
    r.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    r.localClippingEnabled = true;
    r.toneMapping = THREE.NeutralToneMapping;
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.autoClear = false;
    r.domElement.classList.add("vp-canvas");
  }

  private environmentFor(r: THREE.WebGLRenderer, PM: typeof THREE.PMREMGenerator = THREE.PMREMGenerator): THREE.Texture {
    const pmrem = new PM(r);
    const t = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    return t;
  }

  private bindCanvas(c: HTMLCanvasElement) {
    c.addEventListener("pointerdown", (e) => this.onPointerDown(e));
    c.addEventListener("pointermove", (e) => this.onPointerMove(e));
    c.addEventListener("pointerup", (e) => this.onPointerUp(e));
    c.addEventListener("pointerleave", () => {
      this.setHover(null);
      this.onCursorWorld?.(null);
    });
    c.addEventListener("wheel", (e) => this.onWheel(e), { passive: false });
    c.addEventListener("dblclick", (e) => this.tool?.onDblClick?.(e, this));
    c.addEventListener("contextmenu", (e) => e.preventDefault());
    c.addEventListener("auxclick", (e) => e.preventDefault());
  }

  /** Replaces the renderer (backend switch): canvas, events, environment, GPU helpers. */
  private installRenderer(r: THREE.WebGLRenderer, kind: "webgl" | "webgpu", env: THREE.Texture) {
    const old = this.renderer;
    const style = old.domElement.style.cssText;
    this.renderer = r;
    r.domElement.style.cssText = style;
    old.domElement.replaceWith(r.domElement);
    this.bindCanvas(r.domElement);
    const oldEnv = this.scene.environment;
    this.scene.environment = env;
    oldEnv?.dispose();
    this.gpuPicker?.dispose();
    this.gpuPicker = kind === "webgl" ? new GpuPicker(r) : null;
    this.clipGroup.remove(this.transparency.sortedGroup);
    this.transparency.dispose();
    this.transparency = new TransparencyPass(r, kind);
    // clipping per group (WebGPU) or per material (WebGL)
    const g = kind === "webgpu" && this.ClippingGroup ? new this.ClippingGroup() : new THREE.Group();
    g.add(...this.clipGroup.children, this.transparency.sortedGroup);
    this.scene.remove(this.clipGroup);
    this.scene.add(g);
    this.clipGroup = g;
    this.caps.makeClipGroup = kind === "webgpu" && this.ClippingGroup ? this.clipGroupFactory(this.ClippingGroup) : null;
    this.applyTransparency();
    if (this.zebra) this.setZebra(true);
    try {
      // no forceContextLoss(): losing a WebGL context can reset the GPU
      // process channel and take the new WebGPU device down with it
      old.dispose();
    } catch {
      /* already gone */
    }
    this.resize();
    this.capsDirty = true;
    this.pickVersion++;
    this.markBatches();
  }

  /**
   * Chooses the render backend (preference "auto" | "webgpu" | "webgl"):
   * WebGPU when an adapter / device is available and the renderer initialises,
   * otherwise (or when the GPU device is lost later) WebGL.
   */
  /** Resolves once initBackend() settled (tests / benchmarks). */
  backendReady: Promise<BackendInfo> = Promise.resolve(this.backend);

  async initBackend(pref: BackendPref = backendPref()): Promise<BackendInfo> {
    return (this.backendReady = this.initBackendNow(pref));
  }

  private async initBackendNow(pref: BackendPref): Promise<BackendInfo> {
    const choice = await chooseBackend(pref);
    if (choice.kind === "webgpu") {
      try {
        await this.switchToWebGPU();
        this.backend = choice;
      } catch (e) {
        if (this.backend.kind === "webgpu") this.fallbackToWebGL("");
        this.backend = { kind: "webgl", reason: `WebGL に自動切替 (WebGPU の初期化に失敗: ${e instanceof Error ? e.message : String(e)})` };
      }
    } else if (this.backend.kind === "webgpu") this.fallbackToWebGL(choice.reason);
    else this.backend = choice;
    this.onBackendChange?.(this.backend);
    return this.backend;
  }

  private async switchToWebGPU() {
    installWebGPUShims();
    const W = await import("three/webgpu");
    const r = new W.WebGPURenderer({ antialias: true, alpha: true, stencil: true });
    await r.init();
    const be = r.backend as unknown as { isWebGPUBackend?: boolean; device?: { lost?: Promise<{ message?: string }>; addEventListener?(t: string, f: (e: { error?: { message?: string } }) => void): void } };
    if (!be.isWebGPUBackend) {
      r.dispose();
      throw new Error("WebGPU バックエンドを使用できません");
    }
    const gr = r as unknown as THREE.WebGLRenderer;
    this.ClippingGroup = W.ClippingGroup as unknown as new () => THREE.Group & { clippingPlanes: THREE.Plane[] };
    this.configureRenderer(gr);
    const env = this.environmentFor(gr, W.PMREMGenerator as unknown as typeof THREE.PMREMGenerator);
    this.installRenderer(gr, "webgpu", env);
    // a lost device (driver reset, GPU process crash) falls back to WebGL
    void be.device?.lost?.then((info) => {
      if (this.renderer === gr) {
        this.fallbackToWebGL(`GPU デバイスが失われました${info?.message ? `: ${info.message}` : ""}`);
        this.onBackendChange?.(this.backend);
      }
    });
    // repeated validation errors (unsupported material / driver bug): back to WebGL
    let errors = 0;
    be.device?.addEventListener?.("uncapturederror", (ev) => {
      if (this.renderer === gr && ++errors === 3) {
        this.fallbackToWebGL(`WebGPU のエラー: ${ev.error?.message ?? ""}`.slice(0, 200));
        this.onBackendChange?.(this.backend);
      }
    });
    // one frame now: errors surface here, not in the render loop
    this.needsRender = true;
    this.tick(performance.now());
  }

  private clipGroupFactory(C: new () => THREE.Group & { clippingPlanes: THREE.Plane[] }) {
    return (planes: THREE.Plane[]) => {
      const g = new C();
      g.clippingPlanes = planes;
      return g;
    };
  }

  /** Back to WebGL (WebGPU unavailable, failed or lost). */
  fallbackToWebGL(reason: string) {
    const r = this.createWebGL();
    this.installRenderer(r, "webgl", this.environmentFor(r));
    this.backend = { kind: "webgl", reason: reason ? `WebGL に自動切替 (${reason})` : "WebGL" };
  }

  // ------------------------------------------------------------ rendering ---

  invalidate() {
    this.needsRender = true;
  }

  private resize() {
    const w = this.el.clientWidth, h = this.el.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.renderer.domElement.style.width = w + "px";
    this.renderer.domElement.style.height = h + "px";
    this.labels.setSize(w, h);
    this.updateCamera();
  }

  get aspect() {
    return Math.max(1e-3, this.el.clientWidth / Math.max(1, this.el.clientHeight));
  }

  /** World units per screen pixel at the target depth. */
  get pixelSize() {
    return this.view.height / Math.max(1, this.el.clientHeight);
  }

  updateCamera() {
    const v = this.view;
    const dir = new THREE.Vector3(0, 0, 1).applyQuaternion(v.quat);
    const up = new THREE.Vector3(0, 1, 0).applyQuaternion(v.quat);
    const a = this.aspect;
    const o = this.ortho;
    o.left = (-v.height * a) / 2;
    o.right = (v.height * a) / 2;
    o.top = v.height / 2;
    o.bottom = -v.height / 2;
    const far = Math.max(5000, v.height * 50);
    o.near = -far;
    o.far = far;
    o.position.copy(v.target).addScaledVector(dir, far * 0.25);
    o.up.copy(up);
    o.lookAt(v.target);
    o.updateProjectionMatrix();
    const p = this.persp;
    p.aspect = a;
    const dist = v.height / 2 / Math.tan(THREE.MathUtils.degToRad(p.fov / 2));
    p.position.copy(v.target).addScaledVector(dir, dist);
    p.near = Math.max(0.01, dist / 1000);
    p.far = dist * 100 + 1e4;
    p.up.copy(up);
    p.lookAt(v.target);
    p.updateProjectionMatrix();
    this.camera = this.perspective ? p : o;
    this.camera.updateMatrixWorld();
    this.hiddenMaterial.dashSize = this.pixelSize * 5;
    this.hiddenMaterial.gapSize = this.pixelSize * 4;
    this.invalidate();
    this.onViewChange?.();
    for (const f of this.viewListeners) f();
  }

  private tick(t: number) {
    if (this.anim) {
      const k = Math.min(1, (t - this.anim.t0) / this.anim.dur);
      const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      const { from, to } = this.anim;
      this.view.target.lerpVectors(from.target, to.target, e);
      this.view.quat.slerpQuaternions(from.quat, to.quat, e);
      this.view.height = from.height + (to.height - from.height) * e;
      this.updateCamera();
      if (k >= 1) this.anim = null;
    }
    if (!this.needsRender) return;
    this.needsRender = false;
    this.cullEdges();
    if (this.meshBatchDirty || this.edgeBatchDirty) this.rebuildBatches();
    this.updateLod();
    if (this.capsDirty) this.rebuildCaps();
    this.transparency.prepare();
    const r = this.renderer;
    r.setScissorTest(false);
    r.clear();
    r.render(this.scene, this.camera);
    let calls = r.info.render.calls, triangles = r.info.render.triangles;
    if (this.transparency.active && this.transparency.mode === "oit") {
      this.renderOIT();
      calls += r.info.render.calls;
      triangles += r.info.render.triangles;
    }
    this.frameInfo = { calls, triangles };
    if (this.capturing) return;
    // axis triad (bottom-left)
    const s = 90 * r.getPixelRatio();
    const size = r.getDrawingBufferSize(new THREE.Vector2());
    r.clearDepth();
    r.setScissorTest(true);
    // WebGPU viewports count from the top
    const ty = this.backend.kind === "webgpu" ? size.y / r.getPixelRatio() - s : 0;
    r.setScissor(0, ty, s, s);
    r.setViewport(0, ty, s, s);
    this.triadCam.quaternion.copy(this.view.quat);
    this.triadCam.position.set(0, 0, 5).applyQuaternion(this.view.quat);
    this.triadCam.updateMatrixWorld();
    r.render(this.triadScene, this.triadCam);
    r.setScissorTest(false);
    r.setViewport(0, 0, size.x / r.getPixelRatio(), size.y / r.getPixelRatio());
    this.labels.render(this.scene, this.camera);
  }

  private buildTriad() {
    const mk = (dir: THREE.Vector3, color: string, label: string) => {
      const g = new THREE.Group();
      const arrow = new THREE.ArrowHelper(dir, new THREE.Vector3(), 1.1, color, 0.3, 0.16);
      g.add(arrow);
      const cv = document.createElement("canvas");
      cv.width = cv.height = 64;
      const ctx = cv.getContext("2d")!;
      ctx.fillStyle = color;
      ctx.font = "bold 44px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, 32, 34);
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), depthTest: false }));
      sp.position.copy(dir.clone().multiplyScalar(1.38));
      sp.scale.setScalar(0.5);
      g.add(sp);
      this.triadScene.add(g);
    };
    mk(new THREE.Vector3(1, 0, 0), "#e5484d", "X");
    mk(new THREE.Vector3(0, 1, 0), "#30a46c", "Y");
    mk(new THREE.Vector3(0, 0, 1), "#3e63dd", "Z");
  }

  // --------------------------------------------------------------- bodies ---

  /** Bodies used for picking (may differ from the displayed ones while editing a feature). */
  pickViews: BodyView[] = [];
  private pickMaterial = new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide });
  // pick-set edges are only raycast, never drawn
  private pickEdgeMaterial = new THREE.LineBasicMaterial({ visible: false });

  private colorMats = new Map<string, THREE.MeshStandardMaterial>();
  bodyColors: (string | undefined)[] = [];
  highlighted = new Set<number>();

  /** Indices of displayed bodies that are surface bodies (open shells). */
  surfaceBodies = new Set<number>();
  /** Zebra-stripe display (surface continuity check). */
  zebra = false;
  private zebraMat: THREE.Material | null = null;
  private zebraGpuMat: THREE.Material | null = null;
  private surfaceMats = new Map<string, THREE.MeshStandardMaterial>();

  private materialFor(bi: number): THREE.MeshStandardMaterial {
    if (this.zebra) {
      // the zebra shader is GLSL: WebGPU shows a normal-shaded fallback
      if (this.backend.kind === "webgpu") return (this.zebraGpuMat ??= new THREE.MeshNormalMaterial({ side: THREE.DoubleSide })) as unknown as THREE.MeshStandardMaterial;
      return (this.zebraMat ??= zebraMaterial()) as unknown as THREE.MeshStandardMaterial;
    }
    if (this.surfaceBodies.has(bi)) {
      // surfaces: own colour, both sides lit and pickable
      const hl = this.highlighted.has(bi);
      const key = hl ? "hl" : "n";
      let m = this.surfaceMats.get(key);
      if (!m) {
        m = new THREE.MeshStandardMaterial({ color: SURFACE_COLOR, metalness: 0.05, roughness: 0.5, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
        if (hl) (m.emissive.set("#1f6feb"), (m.emissiveIntensity = 0.35));
        this.surfaceMats.set(key, m);
      }
      m.clippingPlanes = this.material.clippingPlanes;
      return m;
    }
    const color = this.bodyColors[bi];
    const hl = this.highlighted.has(bi);
    if (!color && !hl) return this.material;
    const key = `${color ?? "base"}|${hl ? 1 : 0}`;
    let m = this.colorMats.get(key);
    if (!m) {
      m = this.material.clone();
      if (color) m.color.set(color);
      m.metalness = this.material.metalness;
      m.roughness = this.material.roughness;
      if (hl) {
        m.emissive.set("#1f6feb");
        m.emissiveIntensity = 0.35;
      }
      m.clippingPlanes = this.material.clippingPlanes;
      this.colorMats.set(key, m);
    }
    return m;
  }

  /** Tint whole bodies (e.g. the selected assembly component). */
  setBodyHighlight(indices: Set<number>) {
    this.highlighted = indices;
    this.bodies.forEach((b, i) => (b.mesh.material = this.materialFor(i)));
    this.markBatches(false);
  }

  /** Shared geometries keyed by the BodyMesh object (assembly part cache bodies are reused per instance). */
  private geomCache = new Map<BodyMesh, SharedGeom>();
  /** Share GPU geometry between instances (false = one geometry per body, for comparison). */
  shareGeometry = true;

  private sharedGeom(data: BodyMesh): SharedGeom {
    let s = this.geomCache.get(data);
    if (!s) {
      const v = this.buildView(data, 0, true, false);
      s = { geom: v.mesh.geometry, edges: v.edges.geometry, segEdge: v.segEdge };
      this.geomCache.set(data, s);
    }
    return s;
  }

  private buildView(data: BodyMesh, bi: number, forPick: boolean, share = false): BodyView {
    if (share) {
      const s = this.sharedGeom(data);
      const mesh = new THREE.Mesh(s.geom, this.materialFor(bi));
      mesh.userData.body = bi;
      const back = new THREE.Mesh(s.geom, this.backMaterial);
      back.visible = this.clipPlanes.length > 0 && !this.sectionCaps;
      const edges = new THREE.LineSegments(s.edges, this.edgeMaterial);
      const hidden = new THREE.LineSegments(s.edges, this.hiddenMaterial);
      hidden.renderOrder = -1;
      hidden.visible = false;
      return { data, mesh, back, edges, hidden, segEdge: s.segEdge, faceGeoms: new Map(), edgeGeoms: new Map(), shared: true };
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(data.positions, 3));
    geom.setAttribute("normal", new THREE.BufferAttribute(data.normals, 3));
    geom.setIndex(new THREE.BufferAttribute(data.indices, 1));
    geom.computeBoundingSphere();
    const mesh = new THREE.Mesh(geom, forPick ? this.pickMaterial : this.materialFor(bi));
    mesh.userData.body = bi;
    const back = new THREE.Mesh(geom, this.backMaterial);
    back.visible = !forPick && this.clipPlanes.length > 0 && !this.sectionCaps;
    // convert edge polylines into segments, remembering which edge each belongs to
    const segs: number[] = [];
    const segEdge: number[] = [];
    const P = data.edgePositions;
    for (let ei = 0; ei < data.edges.length; ei++) {
      const s = data.edgeRanges[ei * 2], n = data.edgeRanges[ei * 2 + 1];
      for (let k = 0; k + 1 < n; k++) {
        const i0 = (s + k) * 3, i1 = (s + k + 1) * 3;
        segs.push(P[i0], P[i0 + 1], P[i0 + 2], P[i1], P[i1 + 1], P[i1 + 2]);
        segEdge.push(ei);
      }
    }
    const eg = new THREE.BufferGeometry();
    eg.setAttribute("position", new THREE.Float32BufferAttribute(segs, 3));
    eg.computeBoundingSphere();
    const edges = new THREE.LineSegments(eg, forPick ? this.pickEdgeMaterial : this.edgeMaterial);
    const hidden = new THREE.LineSegments(eg, this.hiddenMaterial);
    hidden.computeLineDistances();
    hidden.renderOrder = -1;
    hidden.visible = false;
    return { data, mesh, back, edges, hidden, segEdge: Uint32Array.from(segEdge), faceGeoms: new Map(), edgeGeoms: new Map() };
  }

  private disposeViews(views: BodyView[]) {
    for (const b of views) {
      if (!b.shared) {
        b.mesh.geometry.dispose();
        b.edges.geometry.dispose();
      }
      b.faceGeoms.forEach((g) => g.dispose());
      b.edgeGeoms.forEach((g) => g.dispose());
    }
  }

  private placeView(v: BodyView, m?: THREE.Matrix4) {
    v.matrix = m;
    for (const o of [v.mesh, v.back, v.edges, v.hidden]) {
      if (m) {
        o.matrixAutoUpdate = false;
        o.matrix.copy(m);
        o.matrixWorldNeedsUpdate = true;
      } else o.matrixAutoUpdate = true;
    }
  }

  /** Move one body (fast path while dragging assembly components). */
  setBodyMatrix(i: number, m: THREE.Matrix4) {
    const v = this.bodies[i];
    if (!v) return;
    this.placeView(v, m.clone());
    if (!this.unbatched.has(i)) {
      this.unbatched.add(i);
      this.markBatches();
    }
    if (this.pickViews !== this.bodies && this.pickViews[i]) this.placeView(this.pickViews[i], m.clone());
    this.pickVersion++;
    if (this.clipPlanes.length && this.sectionCaps) this.capsDirty = true;
    if (this.transparentBodies.has(i)) this.applyTransparency();
    this.refreshHighlights();
  }

  // ------------------------------------------------- large assemblies ---

  /** Bodies drawn as bounding-box proxies (lightweight display); their meshes stay pickable. */
  proxied = new Set<number>();
  /** Hide the edges of bodies smaller than this many pixels on screen (0 = off). */
  edgeCullPx = 0;
  private edgeCullState = "";
  readonly proxyLayer = new THREE.Group();
  private proxyMat = new THREE.MeshStandardMaterial({ color: "#ffffff", metalness: 0.05, roughness: 0.6, transparent: true, opacity: 0.55, depthWrite: false });
  private proxyGeom = new THREE.BoxGeometry(1, 1, 1);

  /** Show the given bodies as proxies (their meshes and edges are hidden but still picked). */
  setBodyProxied(indices: Set<number>) {
    this.proxied = indices;
    this.applyStyle();
  }

  /**
   * Bounding-box proxies (lightweight display / load placeholders) drawn as one
   * InstancedMesh. `matrix` maps the unit cube to the box (column-major).
   */
  setProxyBoxes(items: { matrix: number[]; color?: string }[]) {
    for (const c of [...this.proxyLayer.children]) {
      this.proxyLayer.remove(c);
      (c as THREE.InstancedMesh).dispose();
    }
    if (!this.proxyLayer.parent) this.scene.add(this.proxyLayer);
    if (items.length) {
      const im = new THREE.InstancedMesh(this.proxyGeom, this.proxyMat, items.length);
      const m = new THREE.Matrix4(), col = new THREE.Color();
      items.forEach((it, i) => {
        im.setMatrixAt(i, m.fromArray(it.matrix));
        im.setColorAt(i, col.set(it.color ?? "#9aa4b2"));
      });
      im.instanceMatrix.needsUpdate = true;
      if (im.instanceColor) im.instanceColor.needsUpdate = true;
      im.computeBoundingSphere();
      this.proxyLayer.add(im);
    }
    this.invalidate();
  }

  /** Edges of small bodies are hidden when zoomed out (edgeCullPx > 0). */
  private cullEdges() {
    if (this.style === "shaded") return;
    const ps = this.pixelSize;
    const key = this.edgeCullPx > 0 ? `${this.edgeCullPx}|${ps.toPrecision(3)}|${this.bodies.length}` : "off";
    if (key === this.edgeCullState) return;
    const was = this.edgeCullState;
    this.edgeCullState = key;
    if (key === "off" && was === "") return;
    this.bodies.forEach((b, i) => {
      if (this.proxied.has(i) || !b.mesh.visible && this.style !== "wireframe") return;
      const r = b.mesh.geometry.boundingSphere?.radius ?? Infinity;
      b.edges.visible = edgeVisibleAtZoom(r, ps, this.edgeCullPx);
    });
  }

  /** Renderer statistics (geometries / textures in GPU memory, last frame draw calls / triangles). */
  stats() {
    const i = this.renderer.info;
    return {
      geometries: i.memory.geometries,
      textures: i.memory.textures,
      calls: this.frameInfo.calls,
      triangles: this.frameInfo.triangles,
      bodies: this.bodies.length,
      sharedGeometries: this.geomCache.size,
      batches: this.batches.length,
      batchedBodies: this.batches.reduce((n, b) => n + b.items.length, 0),
      edgeChunks: this.edgeChunks.length,
      lod: { ...this.lodCounts },
    };
  }

  /** Draw calls / triangles of the last model render (excluding the axis triad). */
  private frameInfo = { calls: 0, triangles: 0 };

  // ------------------------------------------- batching / LOD (instancing) ---

  /**
   * Draw repeated assembly bodies (same shared geometry and material) as one
   * InstancedMesh each, and merge their edges into a few spatial chunks.
   * The per-body meshes stay in the scene on a layer the camera does not draw,
   * so picking, highlighting and bounds keep working unchanged.
   */
  batching = true;
  /** Level of detail of batched instances (projected size thresholds in px). */
  lod: LodOptions = { ...DEFAULT_LOD };
  private batchLayer = new THREE.Group();
  private batches: { items: number[]; mesh: THREE.InstancedMesh; coarse: THREE.InstancedMesh; box: THREE.InstancedMesh; mats: THREE.Matrix4[]; boxMats: THREE.Matrix4[]; centers: THREE.Vector3[]; radius: number }[] = [];
  private edgeChunks: { full: THREE.LineSegments; coarse: THREE.LineSegments; maxR: number }[] = [];
  private coarseEdgeCache = new WeakMap<BodyMesh, Float32Array>();

  private coarseEdges(d: BodyMesh): Float32Array {
    let e = this.coarseEdgeCache.get(d);
    if (!e) this.coarseEdgeCache.set(d, (e = decimateEdges(d.edgePositions, d.edgeRanges, 6)));
    return e;
  }
  private meshBatchDirty = true;
  private edgeBatchDirty = true;
  private lodKey = "";
  private lodCounts = { full: 0, coarse: 0, box: 0, none: 0 };
  /** Bodies moved individually (dragging) stay out of the batches until the next setBodies. */
  private unbatched = new Set<number>();
  /** Component visibility per body (setBodyVisible). */
  private bodyOn: boolean[] = [];
  private static readonly OFFSCREEN = 1;

  /** Simplified geometry per shared geometry (coarse LOD); the geometry itself when simplifying does not pay. */
  private coarseGeoms = new WeakMap<THREE.BufferGeometry, THREE.BufferGeometry>();

  private coarseGeom(g: THREE.BufferGeometry): THREE.BufferGeometry {
    let c = this.coarseGeoms.get(g);
    if (c) return c;
    c = g;
    const pos = g.getAttribute("position"), nor = g.getAttribute("normal");
    if (g.index && pos && nor && g.index.count >= 3 * 400) {
      const s = clusterSimplify(pos.array, nor.array, g.index.array, 8);
      if (s.indices.length * 2 < g.index.count && s.indices.length) {
        c = new THREE.BufferGeometry();
        c.setAttribute("position", new THREE.BufferAttribute(s.positions, 3));
        c.setAttribute("normal", new THREE.BufferAttribute(s.normals, 3));
        c.setIndex(new THREE.BufferAttribute(s.indices, 1));
        g.addEventListener("dispose", () => c!.dispose());
      }
    }
    this.coarseGeoms.set(g, c);
    return c;
  }

  private markBatches(edges = true) {
    this.meshBatchDirty = true;
    if (edges) this.edgeBatchDirty = true;
    this.invalidate();
  }

  private batchable(i: number): boolean {
    const b = this.bodies[i];
    return !!b?.shared && this.batching && !this.zebra && this.bodyOn[i] !== false && !this.proxied.has(i) && !this.unbatched.has(i) && !this.transparentBodies.has(i);
  }

  private rebuildBatches() {
    if (!this.batchLayer.parent) this.clipGroup.add(this.batchLayer);
    const L = Viewport.OFFSCREEN;
    if (this.meshBatchDirty) {
      this.meshBatchDirty = false;
      for (const b of this.batches) {
        this.batchLayer.remove(b.mesh, b.coarse, b.box);
        b.mesh.dispose();
        b.coarse.dispose();
        b.box.dispose();
      }
      this.batches = [];
      this.bodies.forEach((b) => b.mesh.layers.set(0));
      const keys = this.bodies.map((b, i) => (this.style !== "wireframe" && this.batchable(i) && b.mesh.material instanceof THREE.MeshStandardMaterial ? `${b.mesh.geometry.uuid}|${b.mesh.material.uuid}` : null));
      const { batches } = batchGroups(keys, 2);
      for (const { items } of batches) {
        const first = this.bodies[items[0]].mesh;
        const geom = first.geometry;
        if (!geom.boundingBox) geom.computeBoundingBox();
        if (!geom.boundingSphere) geom.computeBoundingSphere();
        const mat = first.material as THREE.MeshStandardMaterial;
        const mesh = new THREE.InstancedMesh(geom, mat, items.length);
        const coarse = new THREE.InstancedMesh(this.coarseGeom(geom), mat, items.length);
        const box = new THREE.InstancedMesh(this.proxyGeom, mat, items.length);
        const bb = geom.boundingBox!;
        const unitBox = new THREE.Matrix4().fromArray(boxMatrix(bb.min.toArray() as Vec3, bb.max.toArray() as Vec3));
        const sph = geom.boundingSphere!;
        const mats: THREE.Matrix4[] = [], boxMats: THREE.Matrix4[] = [], centers: THREE.Vector3[] = [];
        let radius = 0;
        for (const i of items) {
          const v = this.bodies[i];
          const m = v.matrix ? v.matrix.clone() : new THREE.Matrix4();
          mats.push(m);
          boxMats.push(m.clone().multiply(unitBox));
          centers.push(sph.center.clone().applyMatrix4(m));
          radius = Math.max(radius, sph.radius * m.getMaxScaleOnAxis());
          v.mesh.layers.set(L);
        }
        for (const im of [mesh, coarse, box]) {
          im.frustumCulled = false; // culled per instance in updateLod
          im.castShadow = this.realistic;
          im.count = 0;
          this.batchLayer.add(im);
        }
        this.batches.push({ items, mesh, coarse, box, mats, boxMats, centers, radius });
      }
      this.hideTransparentMeshes();
    }
    if (this.edgeBatchDirty) {
      this.edgeBatchDirty = false;
      for (const c of this.edgeChunks) {
        this.batchLayer.remove(c.full, c.coarse);
        c.full.geometry.dispose();
        c.coarse.geometry.dispose();
      }
      this.edgeChunks = [];
      this.bodies.forEach((b) => b.edges.layers.set(0));
      const ids = this.style === "shaded" ? [] : this.bodies.flatMap((_, i) => (this.batchable(i) ? [i] : []));
      if (ids.length >= 2) {
        const sph = ids.map((i) => {
          const v = this.bodies[i], g = v.mesh.geometry;
          if (!g.boundingSphere) g.computeBoundingSphere();
          const s = g.boundingSphere!.clone();
          if (v.matrix) s.applyMatrix4(v.matrix);
          return s;
        });
        const v3 = new THREE.Vector3();
        // segments of the chunk's bodies in assembly coordinates
        const merge = (chunk: number[], src: (v: BodyView) => ArrayLike<number>) => {
          let n = 0;
          for (const k of chunk) n += src(this.bodies[ids[k]]).length;
          const out = new Float32Array(n);
          let o = 0;
          for (const k of chunk) {
            const v = this.bodies[ids[k]], a = src(v);
            for (let j = 0; j + 2 < a.length; j += 3, o += 3) {
              v3.set(a[j], a[j + 1], a[j + 2]);
              if (v.matrix) v3.applyMatrix4(v.matrix);
              out[o] = v3.x;
              out[o + 1] = v3.y;
              out[o + 2] = v3.z;
            }
          }
          const g = new THREE.BufferGeometry();
          g.setAttribute("position", new THREE.BufferAttribute(out, 3));
          g.computeBoundingSphere();
          const lines = new THREE.LineSegments(g, this.edgeMaterial);
          this.batchLayer.add(lines);
          return lines;
        };
        for (const chunk of spatialChunks(sph.map((s) => s.center.toArray() as Vec3), 64)) {
          const full = merge(chunk, (v) => v.edges.geometry.getAttribute("position").array);
          const coarse = merge(chunk, (v) => this.coarseEdges(v.data));
          let maxR = 0;
          for (const k of chunk) {
            maxR = Math.max(maxR, sph[k].radius);
            this.bodies[ids[k]].edges.layers.set(L);
          }
          this.edgeChunks.push({ full, coarse, maxR });
        }
      }
    }
    this.lodKey = "";
  }

  /** Per-instance frustum culling and level of detail of the batches (when the view changed). */
  private updateLod() {
    const cam = this.camera;
    const persp = this.perspective;
    const ps = this.pixelSize;
    const key = `${cam.matrixWorld.elements.map((x) => x.toPrecision(6)).join()}|${ps}|${persp}|${this.lod.coarsePx}|${this.lod.boxPx}|${this.lod.cullPx}|${this.edgeCullPx}|${this.el.clientWidth}`;
    if (key === this.lodKey) return;
    this.lodKey = key;
    const frustum = new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    const camPos = cam.getWorldPosition(new THREE.Vector3());
    const pixelAtUnit = persp ? (2 * Math.tan(THREE.MathUtils.degToRad(this.persp.fov / 2))) / Math.max(1, this.el.clientHeight) : 0;
    const diam = (c: THREE.Vector3, r: number) => projectedDiameter(r, ps, persp ? { distance: c.distanceTo(camPos), pixelAtUnit } : undefined);
    const s = new THREE.Sphere();
    const counts = { full: 0, coarse: 0, box: 0, none: 0 };
    for (const b of this.batches) {
      const same = b.coarse.geometry === b.mesh.geometry;
      let nf = 0, nc = 0, nb = 0;
      b.items.forEach((_, k) => {
        if (!frustum.intersectsSphere(s.set(b.centers[k], b.radius))) return void counts.none++;
        const lv = lodLevel(diam(b.centers[k], b.radius), this.lod);
        counts[lv]++;
        if (lv === "full" || (lv === "coarse" && same)) b.mesh.setMatrixAt(nf++, b.mats[k]);
        else if (lv === "coarse") b.coarse.setMatrixAt(nc++, b.mats[k]);
        else if (lv === "box") b.box.setMatrixAt(nb++, b.boxMats[k]);
      });
      for (const [im, c] of [[b.mesh, nf], [b.coarse, nc], [b.box, nb]] as const) {
        im.count = c;
        im.visible = c > 0;
        im.instanceMatrix.needsUpdate = true;
      }
    }
    this.lodCounts = counts;
    // edges: full detail near, decimated polylines further away, none for tiny parts
    const minPx = Math.max(this.edgeCullPx, 3 * this.lod.boxPx);
    for (const c of this.edgeChunks) {
      const bs = c.full.geometry.boundingSphere!;
      const d = frustum.intersectsSphere(bs) ? diam(bs.center, c.maxR) : 0;
      c.full.visible = d >= Math.max(minPx, this.lod.coarsePx);
      c.coarse.visible = !c.full.visible && d >= minPx;
    }
  }

  // ------------------------------------------------------- realistic ---
  realistic = false;
  private realMetal = true;
  private capturing = false;
  private sun = new THREE.DirectionalLight(0xffffff, 1.5);
  private ground: THREE.Mesh | null = null;

  /** Studio rendering: shadows on a ground plane, stronger reflections, metal / plastic look. */
  setRealistic(on: boolean, metal = this.realMetal) {
    this.realistic = on;
    this.realMetal = metal;
    const r = this.renderer;
    r.shadowMap.enabled = on;
    r.shadowMap.type = THREE.PCFSoftShadowMap;
    this.scene.environmentIntensity = on ? 1.0 : 0.45;
    for (const m of [this.material, ...this.colorMats.values()]) {
      m.metalness = on ? (metal ? 0.85 : 0.05) : 0.08;
      m.roughness = on ? (metal ? 0.42 : 0.4) : 0.48;
      m.needsUpdate = true;
    }
    this.updateRealism();
  }

  private updateRealism() {
    if (this.ground) {
      this.scene.remove(this.ground);
      this.ground.geometry.dispose();
      this.ground = null;
    }
    this.scene.remove(this.sun, this.sun.target);
    // bodies only cast: self shadowing on coarse tessellation shows acne
    for (const b of this.bodies) b.mesh.castShadow = this.realistic;
    for (const b of this.batches) b.mesh.castShadow = b.coarse.castShadow = b.box.castShadow = this.realistic;
    if (this.realistic) {
      const box = this.modelBounds();
      if (!box.isEmpty()) {
        const c = box.getCenter(new THREE.Vector3()), size = box.getSize(new THREE.Vector3()).length() || 100;
        const g = new THREE.Mesh(new THREE.PlaneGeometry(size * 6, size * 6), new THREE.ShadowMaterial({ opacity: 0.22 }));
        g.rotation.x = -Math.PI / 2;
        g.position.set(c.x, box.min.y - size * 0.002, c.z);
        g.receiveShadow = true;
        this.ground = g;
        this.scene.add(g);
        this.sun.position.set(c.x + size * 0.6, c.y + size * 1.4, c.z + size * 0.8);
        this.sun.target.position.copy(c);
        this.sun.castShadow = true;
        this.sun.shadow.mapSize.set(2048, 2048);
        const sc = this.sun.shadow.camera;
        sc.left = sc.bottom = -size;
        sc.right = sc.top = size;
        sc.near = 0.1;
        sc.far = size * 5;
        sc.updateProjectionMatrix();
        this.sun.shadow.bias = -0.0002;
        this.sun.shadow.normalBias = size * 0.004;
        this.sun.shadow.radius = 4;
        this.scene.add(this.sun, this.sun.target);
      }
    }
    this.invalidate();
  }

  /** PNG of the current view at `scale` × screen resolution (no triad / labels). */
  capture(scale = 2): string {
    const r = this.renderer;
    const pr = r.getPixelRatio();
    r.setPixelRatio(pr * scale);
    this.capturing = true;
    this.needsRender = true;
    this.tick(performance.now());
    const url = r.domElement.toDataURL("image/png");
    this.capturing = false;
    r.setPixelRatio(pr);
    this.invalidate();
    return url;
  }

  private resultMaterial = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.65, metalness: 0, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });

  /**
   * Analysis result display: per-vertex colours and optionally displaced
   * vertex positions for each body. `null` restores the normal display.
   */
  setResult(per: ({ colors: Float32Array; positions?: Float32Array } | null)[] | null) {
    this.bodies.forEach((b, bi) => {
      const r = per?.[bi] ?? null;
      if (r && b.shared) {
        // results differ per instance: give this body its own geometry
        const own = b.mesh.geometry.clone();
        b.mesh.geometry = own;
        b.back.geometry = own;
        b.edges.geometry = b.edges.geometry.clone();
        b.hidden.geometry = b.edges.geometry;
        b.shared = false;
      }
      const g = b.mesh.geometry;
      if (r) {
        g.setAttribute("color", new THREE.BufferAttribute(r.colors, 3));
        g.setAttribute("position", new THREE.BufferAttribute(r.positions ?? b.data.positions, 3));
        if (r.positions) g.computeVertexNormals();
        else g.setAttribute("normal", new THREE.BufferAttribute(b.data.normals, 3));
        b.mesh.material = this.resultMaterial;
        b.edges.visible = !r.positions && this.style !== "shaded";
      } else {
        g.deleteAttribute("color");
        g.setAttribute("position", new THREE.BufferAttribute(b.data.positions, 3));
        g.setAttribute("normal", new THREE.BufferAttribute(b.data.normals, 3));
        b.mesh.material = this.materialFor(bi);
        b.edges.visible = this.style !== "shaded";
      }
      g.computeBoundingSphere();
    });
    this.markBatches();
  }

  private preview: THREE.Mesh | null = null;

  /** Show a separate mesh (e.g. an optimised shape) instead of the bodies; null restores. */
  setPreviewMesh(m: { positions: Float32Array; indices: Uint32Array } | null, color = "#6aa7e8") {
    if (this.preview) {
      this.scene.remove(this.preview);
      this.preview.geometry.dispose();
      (this.preview.material as THREE.Material).dispose();
      this.preview = null;
    }
    for (const b of this.bodies) {
      b.mesh.visible = !m && this.style !== "wireframe";
      b.edges.visible = !m && this.style !== "shaded";
    }
    if (m) {
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(m.positions, 3));
      g.setIndex(new THREE.BufferAttribute(m.indices, 1));
      g.computeVertexNormals();
      this.preview = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.05, side: THREE.DoubleSide }));
      this.scene.add(this.preview);
    }
    this.invalidate();
  }

  private toolpath: THREE.Group | null = null;

  /** Toolpath overlay: cutting (solid) and rapid (dashed) line segments in world mm; null clears. */
  setToolpath(cut: Float32Array | null, rapid?: Float32Array) {
    if (this.toolpath) {
      this.scene.remove(this.toolpath);
      for (const c of this.toolpath.children as THREE.LineSegments[]) {
        c.geometry.dispose();
        (c.material as THREE.Material).dispose();
      }
      this.toolpath = null;
    }
    if (cut) {
      this.toolpath = new THREE.Group();
      const mk = (pos: Float32Array, mat: THREE.LineBasicMaterial | THREE.LineDashedMaterial) => {
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        const l = new THREE.LineSegments(g, mat);
        l.computeLineDistances();
        l.renderOrder = 10;
        this.toolpath!.add(l);
      };
      mk(cut, new THREE.LineBasicMaterial({ color: 0x1f6fe0, depthTest: false, transparent: true, opacity: 0.9 }));
      if (rapid?.length) mk(rapid, new THREE.LineDashedMaterial({ color: 0xd04040, dashSize: 2, gapSize: 1.5, depthTest: false, transparent: true, opacity: 0.7 }));
      this.scene.add(this.toolpath);
    }
    this.invalidate();
  }

  /** Dashed trail lines (exploded views). */
  setTrails(segs: [Vec3, Vec3][]) {
    for (const c of [...this.trailLayer.children]) {
      this.trailLayer.remove(c);
      (c as THREE.LineSegments).geometry.dispose();
    }
    if (segs.length) {
      const g = new THREE.BufferGeometry().setFromPoints(segs.flat().map((p) => new THREE.Vector3(...p)));
      const l = new THREE.LineSegments(g, new THREE.LineDashedMaterial({ color: 0x2b7de9, dashSize: 3, gapSize: 2 }));
      l.computeLineDistances();
      this.trailLayer.add(l);
    }
    this.invalidate();
  }

  setThreads(threads: ThreadInfo[]) {
    for (const c of [...this.threadLayer.children]) {
      this.threadLayer.remove(c);
      (c as THREE.Line).geometry.dispose();
    }
    const mat = new THREE.LineBasicMaterial({ color: 0x3d4652, transparent: true, opacity: 0.75 });
    for (const t of threads) {
      const dir = new THREE.Vector3(...t.dir).normalize();
      const u = new THREE.Vector3(Math.abs(dir.x) < 0.9 ? 1 : 0, Math.abs(dir.x) < 0.9 ? 0 : 1, 0).cross(dir).normalize();
      const v = dir.clone().cross(u);
      // the visible wall: drilled wall of a tapped hole, crest of a bolt
      const r = t.internal ? (t.minor / 2) * 0.997 : (t.major / 2) * 1.003;
      let pitch = t.pitch;
      while (t.length / pitch > 300) pitch *= 2;
      const turns = t.length / pitch, steps = Math.max(24, Math.ceil(turns * 36));
      const pts: THREE.Vector3[] = [];
      const o = new THREE.Vector3(...t.origin);
      for (let i = 0; i <= steps; i++) {
        const k = i / steps, a = k * turns * Math.PI * 2;
        pts.push(o.clone().addScaledVector(dir, k * t.length).addScaledVector(u, Math.cos(a) * r).addScaledVector(v, Math.sin(a) * r));
      }
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat);
      line.renderOrder = 2;
      this.threadLayer.add(line);
    }
    this.invalidate();
  }

  setBodies(bodies: BodyMesh[], pickBodies?: BodyMesh[], colors?: (string | undefined)[], matrices?: THREE.Matrix4[]) {
    this.bodyColors = colors ?? [];
    this.surfaceBodies = new Set(bodies.flatMap((b, i) => (b.surface ? [i] : [])));
    this.highlighted = new Set([...this.highlighted].filter((i) => i < bodies.length));
    const sharedPick = this.pickViews === this.bodies;
    this.disposeViews(this.bodies);
    if (!sharedPick) this.disposeViews(this.pickViews);
    this.model.clear();
    // assembly instances (placed by matrices) share geometry per BodyMesh
    const share = this.shareGeometry && !!matrices && !pickBodies;
    this.bodies = bodies.map((data, bi) => {
      const v = this.buildView(data, bi, false, share);
      this.placeView(v, matrices?.[bi]);
      this.model.add(v.mesh, v.back, v.edges, v.hidden);
      return v;
    });
    if (pickBodies) {
      this.pickViews = pickBodies.map((data, bi) => {
        const v = this.buildView(data, bi, true);
        this.model.add(v.mesh, v.edges);
        return v;
      });
    } else this.pickViews = this.bodies;
    // drop shared geometries no longer shown
    const used = new Set(this.bodies.filter((b) => b.shared).map((b) => b.data));
    for (const [d, s] of this.geomCache)
      if (!used.has(d)) {
        s.geom.dispose();
        s.edges.dispose();
        this.geomCache.delete(d);
      }
    this.proxied = new Set([...this.proxied].filter((i) => i < this.bodies.length));
    this.bodyOn = [];
    this.unbatched.clear();
    this.bodyOpacity = new Map([...this.bodyOpacity].filter(([i]) => i < this.bodies.length));
    this.applyStyle();
    this.applyClip();
    this.hover = null;
    this.refreshHighlights();
    if (this.realistic) this.updateRealism();
  }

  /** Zebra stripes on all bodies (on) or the normal materials (off). */
  setZebra(on: boolean) {
    this.zebra = on;
    this.bodies.forEach((b, i) => (b.mesh.material = this.materialFor(i)));
    this.markBatches();
  }

  setMaterialColor(color: string) {
    this.material.color.set(color);
    this.invalidate();
  }

  /** Bodies' visibility (hidden assembly components). */
  setBodyVisible(i: number, on: boolean) {
    const b = this.bodies[i];
    if (!b) return;
    const px = this.proxied.has(i);
    b.mesh.visible = on && !px && this.style !== "wireframe";
    b.edges.visible = on && !px && this.style !== "shaded";
    if (this.bodyOn[i] !== on) {
      this.bodyOn[i] = on;
      this.markBatches();
      this.capsDirty = true;
      if (this.xray || this.bodyOpacity.has(i)) this.applyTransparency();
    }
  }

  setStyle(s: VisualStyle) {
    this.style = s;
    this.applyStyle();
  }

  private applyStyle() {
    this.bodies.forEach((b, i) => {
      const px = this.proxied.has(i);
      b.mesh.visible = !px && this.style !== "wireframe";
      b.edges.visible = !px && this.style !== "shaded";
      b.hidden.visible = !px && (this.style === "hiddenEdges" || this.style === "wireframe");
    });
    this.edgeCullState = "";
    this.hiddenMaterial.depthTest = false;
    this.hiddenMaterial.opacity = this.style === "wireframe" ? 0.9 : 0.5;
    this.pickVersion++;
    this.capsDirty = true;
    this.applyTransparency();
    this.markBatches();
  }

  /** Single section plane (stage 1 API: back faces shown inside, no caps). */
  setSection(plane: THREE.Plane | null) {
    this.setSections(plane ? [plane] : [], { caps: false });
  }

  /**
   * Section planes (up to three; material kept where all distances are ≥ 0)
   * with optional filled, hatched caps.
   */
  setSections(planes: THREE.Plane[], opts: { caps?: boolean; hatch?: boolean } = {}) {
    this.clipPlanes = planes;
    if (opts.caps !== undefined) this.sectionCaps = opts.caps;
    if (opts.hatch !== undefined) this.sectionHatch = opts.hatch;
    this.applyClip();
  }

  private applyClip() {
    const planes = this.clipPlanes;
    if ("clippingPlanes" in this.clipGroup) (this.clipGroup as THREE.Group & { clippingPlanes: THREE.Plane[] }).clippingPlanes = planes;
    this.material.clippingPlanes = planes;
    for (const m of this.colorMats.values()) m.clippingPlanes = planes;
    for (const m of this.surfaceMats.values()) m.clippingPlanes = planes;
    this.backMaterial.clippingPlanes = planes;
    this.edgeMaterial.clippingPlanes = planes;
    this.hiddenMaterial.clippingPlanes = planes;
    this.resultMaterial.clippingPlanes = planes;
    const back = planes.length > 0 && !this.sectionCaps;
    for (const b of this.bodies) b.back.visible = back;
    this.capsDirty = true;
    this.pickVersion++;
    this.applyTransparency();
    this.refreshHighlights();
    this.refreshTags();
    this.invalidate();
  }

  /** Section planes from the X / Y / Z section state (on/off, offset, flip, caps, hatch). */
  setSectionState(s: SectionState) {
    this.setSections(sectionPlanes(s), { caps: s.caps, hatch: s.hatch });
  }

  /** Whether a world point is kept by the section planes. */
  keptBySection(p: THREE.Vector3): boolean {
    return keptByPlanes(this.clipPlanes, p);
  }

  private rebuildCaps() {
    this.capsDirty = false;
    if (!this.sectionCaps || !this.clipPlanes.length) {
      this.caps.clear();
      return;
    }
    this.model.updateMatrixWorld(true);
    const items = this.bodies.flatMap((b, i) =>
      this.bodyOn[i] === false || this.proxied.has(i) || this.surfaceBodies.has(i) ? [] : [{ mesh: b.mesh, pattern: this.sectionPatternOf?.(i) ?? i, color: this.bodyColors[i] }],
    );
    this.caps.update(this.clipPlanes, items, this.modelBounds(), this.sectionHatch);
  }

  // ------------------------------------------------------- transparency ---

  /** X-ray: every body drawn transparent with order-independent blending. */
  setXRay(on: boolean, opacity = this.xrayOpacity) {
    this.xray = on;
    this.xrayOpacity = opacity;
    this.applyTransparency();
  }

  /** Per-body opacity (null = opaque again). */
  setBodyOpacity(i: number, opacity: number | null) {
    if (opacity === null || opacity >= 1) this.bodyOpacity.delete(i);
    else this.bodyOpacity.set(i, Math.max(0.02, opacity));
    this.applyTransparency();
  }

  /** Transparency method in use: weighted blended OIT, sorted fallback, or none. */
  get transparencyMode(): "oit" | "sorted" | "off" {
    return this.transparency.active ? this.transparency.mode : "off";
  }

  private applyTransparency() {
    if (!this.transparency) return;
    const items: TransparentItem[] = [];
    const set = new Set<number>();
    this.model.updateMatrixWorld(true);
    if (this.style !== "wireframe")
      this.bodies.forEach((b, i) => {
        const op = this.xray ? Math.min(this.xrayOpacity, this.bodyOpacity.get(i) ?? 1) : this.bodyOpacity.get(i);
        if (op === undefined || this.bodyOn[i] === false || this.proxied.has(i)) return;
        set.add(i);
        items.push({ mesh: b.mesh, color: this.bodyColors[i] ?? (this.surfaceBodies.has(i) ? SURFACE_COLOR : `#${this.material.color.getHexString()}`), opacity: op });
      });
    const changed = set.size !== this.transparentBodies.size || [...set].some((i) => !this.transparentBodies.has(i));
    this.transparentBodies = set;
    this.transparency.setItems(items, this.clipPlanes);
    if (changed) this.markBatches(false);
    this.hideTransparentMeshes();
    this.invalidate();
  }

  /** Transparent bodies are drawn by the transparency pass, not by the main render. */
  private hideTransparentMeshes() {
    const L = Viewport.OFFSCREEN;
    this.bodies.forEach((b, i) => {
      const t = this.transparentBodies.has(i);
      if (t) {
        b.mesh.layers.set(L);
        b.back.layers.set(L);
      } else if (b.back.layers.mask !== 1) b.back.layers.set(0);
    });
  }

  private renderOIT() {
    const cam = this.camera;
    const opaque = this.bodies.flatMap((b, i) => (!this.transparentBodies.has(i) && b.mesh.visible && this.bodyOn[i] !== false && !this.proxied.has(i) ? [b.mesh] : []));
    const box = this.modelBounds();
    let range: [number, number] = [0, 1];
    if (!box.isEmpty()) {
      const s = box.getBoundingSphere(new THREE.Sphere());
      const camPos = cam.getWorldPosition(new THREE.Vector3());
      const dir = cam.getWorldDirection(new THREE.Vector3());
      const d = s.center.clone().sub(camPos).dot(dir);
      range = [d - s.radius, d + s.radius];
    }
    this.transparency.render(cam, opaque, range);
  }

  // ----------------------------------------------------- reference data ---

  /** Adds a point cloud (positions in mm, optional rgb 0..1). */
  addPointCloud(id: string, name: string, positions: Float32Array, colors?: Float32Array, pointSize = 2): RefModel {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    if (colors) g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    g.computeBoundingBox();
    g.computeBoundingSphere();
    const mat = new THREE.PointsMaterial({ size: pointSize, sizeAttenuation: false, vertexColors: !!colors, color: colors ? 0xffffff : 0x5b8bd9 });
    const pts = new THREE.Points(g, mat);
    const r: RefModel = { id, name, kind: "points", object: pts, count: positions.length / 3, pointSize, color: colors ? null : "#5b8bd9", visible: true };
    this.refModels.push(r);
    this.refModelLayer.add(pts);
    this.invalidate();
    return r;
  }

  /** Adds display-only meshes (e.g. an IFC building), one per colour. */
  addRefMeshes(id: string, name: string, parts: { positions: Float32Array; indices: Uint32Array; color: string; opacity?: number }[]): RefModel {
    const grp = new THREE.Group();
    let tris = 0;
    for (const p of parts) {
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(p.positions, 3));
      g.setIndex(new THREE.BufferAttribute(p.indices, 1));
      g.computeVertexNormals();
      g.computeBoundingBox();
      g.computeBoundingSphere();
      const op = p.opacity ?? 1;
      const m = new THREE.MeshStandardMaterial({ color: p.color, metalness: 0.02, roughness: 0.75, side: THREE.DoubleSide, transparent: op < 1, opacity: op, depthWrite: op >= 1 });
      grp.add(new THREE.Mesh(g, m));
      tris += p.indices.length / 3;
    }
    const r: RefModel = { id, name, kind: "mesh", object: grp, count: tris, pointSize: 0, color: null, visible: true };
    this.refModels.push(r);
    this.refModelLayer.add(grp);
    this.invalidate();
    return r;
  }

  removeRefModel(id: string) {
    const i = this.refModels.findIndex((r) => r.id === id);
    if (i < 0) return;
    const r = this.refModels[i];
    r.object.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose();
      (m.material as THREE.Material | undefined)?.dispose?.();
    });
    this.refModelLayer.remove(r.object);
    this.refModels.splice(i, 1);
    this.invalidate();
  }

  setRefModelStyle(id: string, opts: { pointSize?: number; color?: string | null; visible?: boolean }) {
    const r = this.refModels.find((x) => x.id === id);
    if (!r) return;
    if (opts.visible !== undefined) (r.visible = opts.visible), (r.object.visible = opts.visible);
    if (r.kind === "points") {
      const m = (r.object as THREE.Points).material as THREE.PointsMaterial;
      if (opts.pointSize !== undefined) (r.pointSize = opts.pointSize), (m.size = opts.pointSize);
      if (opts.color !== undefined) {
        const hasColors = !!(r.object as THREE.Points).geometry.getAttribute("color");
        r.color = opts.color ?? (hasColors ? null : "#5b8bd9");
        m.vertexColors = r.color === null;
        m.color.set(r.color ?? "#ffffff");
        m.needsUpdate = true;
      }
    } else if (opts.color !== undefined) {
      r.color = opts.color;
      r.object.traverse((o) => {
        const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
        if (!m) return;
        m.userData.orig ??= m.color.getHexString();
        m.color.set(opts.color ?? `#${m.userData.orig}`);
      });
    }
    this.invalidate();
  }

  /** Screen position (CSS pixels, page coordinates) of a world point. */
  worldToScreen(p: Vec3): { x: number; y: number } {
    const v = new THREE.Vector3(...p).project(this.camera);
    const r = this.renderer.domElement.getBoundingClientRect();
    return { x: r.left + ((v.x + 1) / 2) * r.width, y: r.top + ((1 - v.y) / 2) * r.height };
  }

  modelBounds(): THREE.Box3 {
    const box = new THREE.Box3();
    for (const b of this.bodies) box.expandByObject(b.mesh);
    for (const r of this.refModels) if (r.visible) box.expandByObject(r.object);
    this.sketchLayer.traverse((o) => {
      if ((o as THREE.Line).isLine && o.visible) box.expandByObject(o);
    });
    return box;
  }

  faceGeometry(bi: number, fi: number): THREE.BufferGeometry | null {
    const b = this.pickViews[bi];
    if (!b) return null;
    let g = b.faceGeoms.get(fi);
    if (!g) {
      const s = b.data.faceRanges[fi * 2], n = b.data.faceRanges[fi * 2 + 1];
      g = new THREE.BufferGeometry();
      g.setAttribute("position", b.mesh.geometry.getAttribute("position"));
      g.setAttribute("normal", b.mesh.geometry.getAttribute("normal"));
      g.setIndex(new THREE.BufferAttribute(b.data.indices.slice(s, s + n), 1));
      b.faceGeoms.set(fi, g);
    }
    return g;
  }

  edgeGeometry(bi: number, ei: number): THREE.BufferGeometry | null {
    const b = this.pickViews[bi];
    if (!b) return null;
    let g = b.edgeGeoms.get(ei);
    if (!g) {
      const s = b.data.edgeRanges[ei * 2], n = b.data.edgeRanges[ei * 2 + 1];
      g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(b.data.edgePositions.slice(s * 3, (s + n) * 3), 3));
      b.edgeGeoms.set(ei, g);
    }
    return g;
  }

  // ------------------------------------------------------------ reference ---

  setRefs(list: { key: string; kind: "plane" | "axis" | "point"; plane?: PlaneDef; dir?: Vec3; origin?: Vec3; label: string; size?: number }[]) {
    this.refLayer.clear();
    this.refs = [];
    const size = list[0]?.size ?? 50;
    for (const r of list) {
      const g = new THREE.Group();
      let pickMesh: THREE.Object3D;
      if (r.kind === "plane" && r.plane) {
        const geo = new THREE.PlaneGeometry(size, size);
        const fill = new THREE.Mesh(
          geo,
          new THREE.MeshBasicMaterial({ color: "#f2c94c", transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false }),
        );
        const border = new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: "#c8a02c" }));
        g.add(fill, border);
        const m = planeMatrix(r.plane);
        g.applyMatrix4(m);
        pickMesh = fill;
      } else if (r.kind === "axis" && r.dir) {
        const d = new THREE.Vector3(...r.dir);
        const o = new THREE.Vector3(...(r.origin ?? [0, 0, 0]));
        const geo = new THREE.BufferGeometry().setFromPoints([d.clone().multiplyScalar(-size * 0.7).add(o), d.clone().multiplyScalar(size * 0.7).add(o)]);
        const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: "#c8a02c" }));
        g.add(line);
        pickMesh = line;
      } else {
        const sp = new THREE.Mesh(new THREE.SphereGeometry(size * 0.025, 12, 8), new THREE.MeshBasicMaterial({ color: "#c8a02c" }));
        if (r.origin) sp.position.set(...r.origin);
        g.add(sp);
        pickMesh = sp;
      }
      pickMesh.userData.refKey = r.key;
      this.refLayer.add(g);
      this.refs.push({ key: r.key, kind: r.kind, object: g, pickMesh, plane: r.plane, label: r.label });
    }
    this.invalidate();
  }

  // -------------------------------------------------------------- picking ---

  ndc(e: { clientX: number; clientY: number }): THREE.Vector2 {
    const r = this.renderer.domElement.getBoundingClientRect();
    return new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  }

  ray(e: { clientX: number; clientY: number }): THREE.Ray {
    this.raycaster.setFromCamera(this.ndc(e), this.camera);
    return this.raycaster.ray.clone();
  }

  /** Intersection of the cursor ray with a plane, in world coordinates. */
  rayPlane(e: { clientX: number; clientY: number }, p: PlaneDef): THREE.Vector3 | null {
    const ray = this.ray(e);
    const pl = new THREE.Plane().setFromNormalAndCoplanarPoint(new THREE.Vector3(...p.normal), new THREE.Vector3(...p.origin));
    return ray.intersectPlane(pl, new THREE.Vector3());
  }

  pick(e: { clientX: number; clientY: number }, kinds = this.pickKinds): Pick | null {
    this.raycaster.setFromCamera(this.ndc(e), this.camera);
    const ps = this.pixelSize;
    this.raycaster.params.Line = { threshold: ps * 6 };
    const cands: (Pick & { dist: number; prio: number })[] = [];
    const views = this.pickViews;
    const meshes = views.map((b) => b.mesh);
    const kept = (h: THREE.Intersection) => keptByPlanes(this.clipPlanes, h.point);
    let meshHits: THREE.Intersection[];
    const gpu = this.style === "wireframe" ? undefined : this.gpuPick(e);
    if (gpu === null) meshHits = []; // background under the cursor
    else if (gpu) {
      // the ID buffer names the body: exact point from that body's BVH only
      meshHits = this.intersectMeshes([meshes[gpu.body]]).filter(kept);
      if (!meshHits.length) meshHits = this.intersectMeshes(meshes).filter(kept);
    } else meshHits = this.intersectMeshes(meshes).filter(kept);
    const firstMesh = this.style === "wireframe" ? undefined : meshHits[0];
    const occl = firstMesh ? firstMesh.distance + ps * 2 : Infinity;
    if (kinds.has("face") && firstMesh) {
      const bi = firstMesh.object.userData.body as number;
      const fi = this.faceOfTriangle(bi, firstMesh.faceIndex!);
      if (fi >= 0) cands.push({ kind: "face", body: bi, index: fi, point: firstMesh.point.toArray() as Vec3, dist: firstMesh.distance, prio: 2 });
    }
    if (kinds.has("edge")) {
      const lines = views.map((b) => b.edges);
      for (const h of this.raycaster.intersectObjects(lines, false)) {
        if (h.distance > occl) continue;
        const bi = views.findIndex((b) => b.edges === h.object);
        const seg = Math.floor((h.index ?? 0) / 2);
        const ei = views[bi].segEdge[seg];
        const pt = (h.pointOnLine ?? h.point).toArray() as Vec3;
        cands.push({ kind: "edge", body: bi, index: ei, point: pt, dist: h.distance - ps * 4, prio: 1 });
        break;
      }
    }
    if (kinds.has("plane") || kinds.has("axis") || kinds.has("point")) {
      const objs = this.refs.filter((r) => kinds.has(r.kind) && r.object.visible).map((r) => r.pickMesh);
      for (const h of this.raycaster.intersectObjects(objs, false)) {
        const ref = this.refs.find((r) => r.pickMesh === h.object)!;
        if (ref.kind === "plane" && h.distance > occl) continue;
        cands.push({ kind: ref.kind, body: -1, index: -1, key: ref.key, point: h.point.toArray() as Vec3, dist: h.distance, prio: ref.kind === "plane" ? 3 : 0 });
        break;
      }
    }
    if (kinds.has("ref") && this.refModels.some((r) => r.visible)) {
      for (const r of this.refModels) {
        if (!r.visible) continue;
        if (r.kind === "points") {
          // screen-space tolerance: a few pixels around the drawn point
          this.raycaster.params.Points = { threshold: ps * Math.max(4, r.pointSize) };
          const hits = this.raycaster.intersectObject(r.object, true).filter((h) => h.distance <= occl);
          // nearest to the ray, then nearest to the eye
          hits.sort((a, b) => (a.distanceToRay ?? 0) - (b.distanceToRay ?? 0) || a.distance - b.distance);
          const h = hits[0];
          if (h && h.index !== undefined) {
            const pos = (h.object as THREE.Points).geometry.getAttribute("position") as THREE.BufferAttribute;
            const pt = new THREE.Vector3(pos.getX(h.index), pos.getY(h.index), pos.getZ(h.index)).applyMatrix4(h.object.matrixWorld);
            cands.push({ kind: "ref", body: -1, index: h.index, key: r.id, point: pt.toArray() as Vec3, dist: h.distance - ps * 6, prio: 0 });
          }
        } else {
          const h = this.raycaster.intersectObject(r.object, true).filter((x) => keptByPlanes(this.clipPlanes, x.point))[0];
          if (h && h.distance <= occl + ps * 2) cands.push({ kind: "ref", body: -1, index: -1, key: r.id, point: h.point.toArray() as Vec3, dist: h.distance, prio: 2 });
        }
      }
    }
    const filtered = this.pickFilter ? cands.filter((c) => this.pickFilter!(c)) : cands;
    if (!filtered.length) return null;
    // edges win when the cursor is near them; otherwise the closest hit
    filtered.sort((a, b) => a.prio - b.prio || a.dist - b.dist);
    const edge = filtered.find((c) => c.kind === "edge" || c.kind === "axis" || c.kind === "point" || (c.kind === "ref" && c.index >= 0));
    const best = edge ?? filtered.sort((a, b) => a.dist - b.dist)[0];
    const { dist: _d, prio: _p, ...pick } = best;
    void _d;
    void _p;
    return pick;
  }

  /** Picks answered by the GPU ID buffer / ray-BVH fallback. */
  pickStats = { gpu: 0, fallback: 0 };

  /**
   * Body and face under the cursor from the GPU ID buffer: null for
   * background, undefined when unavailable (WebGPU, no float buffers).
   */
  gpuPick(e: { clientX: number; clientY: number }): { body: number; face: number; depth: number } | null | undefined {
    if (!this.gpuPicking || !this.gpuPicker?.supported || this.backend.kind !== "webgl") {
      this.pickStats.fallback++;
      return undefined;
    }
    const rect = this.renderer.domElement.getBoundingClientRect();
    const cam = this.camera;
    cam.updateMatrixWorld();
    const key = `${this.pickVersion}|${cam.matrixWorld.elements.join(",")}|${(cam as THREE.OrthographicCamera).projectionMatrix.elements.join(",")}`;
    this.model.updateMatrixWorld(true);
    const views = this.pickViews;
    const res = this.gpuPicker.pick(
      views.map((v) => v.mesh),
      (i) => views[i]?.data.faceRanges,
      cam,
      rect.width,
      rect.height,
      e.clientX - rect.left,
      e.clientY - rect.top,
      this.clipPlanes,
      key,
    );
    if (res === undefined) this.pickStats.fallback++;
    else this.pickStats.gpu++;
    return res;
  }

  /** World point on the model under the cursor (for zoom/orbit pivots). */
  surfacePoint(e: { clientX: number; clientY: number }): THREE.Vector3 | null {
    this.raycaster.setFromCamera(this.ndc(e), this.camera);
    const hit = this.intersectMeshes(this.bodies.map((b) => b.mesh))[0];
    return hit ? hit.point : null;
  }

  /** Triangle BVHs per position / index buffer (built on first pick). */
  private bvhs = new WeakMap<ArrayLike<number>, { index: ArrayLike<number>; bvh: TriangleBVH }>();

  /**
   * Ray hits on body meshes (sorted by distance) like Raycaster.intersectObjects,
   * but each mesh is tested through its bounding sphere and a triangle BVH.
   */
  private intersectMeshes(meshes: THREE.Mesh[]): THREE.Intersection[] {
    const ray = this.raycaster.ray, near = this.raycaster.near, far = this.raycaster.far;
    const out: THREE.Intersection[] = [];
    const sph = new THREE.Sphere(), inv = new THREE.Matrix4(), lr = new THREE.Ray();
    for (const mesh of meshes) {
      const g = mesh.geometry;
      const pos = g.getAttribute("position") as THREE.BufferAttribute | undefined;
      if (!pos || !g.index || Array.isArray(mesh.material)) {
        out.push(...this.raycaster.intersectObject(mesh, false));
        continue;
      }
      if (!g.boundingSphere) g.computeBoundingSphere();
      if (!ray.intersectsSphere(sph.copy(g.boundingSphere!).applyMatrix4(mesh.matrixWorld))) continue;
      let e = this.bvhs.get(pos.array);
      if (!e || e.index !== g.index.array) {
        e = { index: g.index.array, bvh: new TriangleBVH(pos.array, g.index.array) };
        this.bvhs.set(pos.array, e);
      }
      lr.copy(ray).applyMatrix4(inv.copy(mesh.matrixWorld).invert());
      lr.direction.normalize();
      const cull = (mesh.material as THREE.Material).side === THREE.FrontSide;
      for (const h of e.bvh.raycast(lr.origin.toArray(), lr.direction.toArray(), 0, Infinity, cull)) {
        const point = lr.at(h.t, new THREE.Vector3()).applyMatrix4(mesh.matrixWorld);
        const distance = ray.origin.distanceTo(point);
        if (distance < near || distance > far) continue;
        out.push({ distance, point, object: mesh, faceIndex: h.tri, face: null });
      }
    }
    return out.sort((a, b) => a.distance - b.distance);
  }

  private faceOfTriangle(bi: number, tri: number): number {
    const r = this.pickViews[bi].data.faceRanges;
    const idx = tri * 3;
    for (let i = 0; i < r.length / 2; i++) if (idx >= r[i * 2] && idx < r[i * 2] + r[i * 2 + 1]) return i;
    return -1;
  }

  setHover(p: Pick | null) {
    if (samePick(p, this.hover)) return;
    this.hover = p;
    this.refreshHighlight(this.hoverObj, p ? [p] : [], COLORS.hover, true);
    this.onHoverChange?.(p);
  }

  setSelection(list: Pick[]) {
    this.selection = list;
    this.refreshHighlights();
  }

  /**
   * Persistent coloured face groups (e.g. analysis boundary sets), drawn under
   * the hover/selection highlights so every set stays visible at once.
   */
  setTagged(tags: { picks: Pick[]; color: string; opacity?: number }[]) {
    this.tags = tags.map((t) => ({ picks: t.picks, color: t.color, opacity: t.opacity ?? 0.6 }));
    this.refreshTags();
  }

  private refreshTags() {
    this.tagObj.children.forEach((c) => ((c as THREE.Mesh).material as THREE.Material)?.dispose?.());
    this.tagObj.clear();
    for (const t of this.tags)
      for (const p of t.picks) {
        if (p.kind !== "face") continue;
        const g = this.faceGeometry(p.body, p.index);
        if (!g) continue;
        const m = new THREE.Mesh(
          g,
          new THREE.MeshBasicMaterial({
            color: t.color,
            transparent: true,
            opacity: t.opacity,
            side: THREE.DoubleSide,
            depthWrite: false,
            polygonOffset: true,
            polygonOffsetFactor: -1,
            polygonOffsetUnits: -1,
            clippingPlanes: this.clipPlanes,
          }),
        );
        this.applyBodyMatrix(m, p.body);
        this.tagObj.add(m);
      }
    this.invalidate();
  }

  refreshHighlights() {
    this.refreshTags();
    this.refreshHighlight(this.selectObj, this.selection, COLORS.select, false);
    this.refreshHighlight(this.hoverObj, this.hover ? [this.hover] : [], COLORS.hover, true);
  }

  private refreshHighlight(group: THREE.Group, picks: Pick[], color: THREE.Color, isHover: boolean) {
    group.children.forEach((c) => {
      const m = (c as THREE.Mesh).material as THREE.Material;
      m?.dispose?.();
    });
    group.clear();
    for (const p of picks) {
      if (p.kind === "face") {
        const g = this.faceGeometry(p.body, p.index);
        if (!g) continue;
        const m = new THREE.Mesh(
          g,
          new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: isHover ? 0.35 : 0.45,
            side: THREE.DoubleSide,
            depthWrite: false,
            polygonOffset: true,
            polygonOffsetFactor: -1,
            polygonOffsetUnits: -2,
            clippingPlanes: this.clipPlanes,
          }),
        );
        this.applyBodyMatrix(m, p.body);
        group.add(m);
      } else if (p.kind === "edge") {
        const g = this.edgeGeometry(p.body, p.index);
        if (!g) continue;
        const l = new THREE.Line(g, new THREE.LineBasicMaterial({ color, linewidth: 2, depthTest: false }));
        l.renderOrder = 10;
        this.applyBodyMatrix(l, p.body);
        group.add(l);
        // thick look: a few offset copies are not portable; draw end markers instead
      } else if (p.kind === "ref") {
        // a marker at the picked point (constant screen size)
        const r = this.pixelSize * (isHover ? 5 : 6);
        const m = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 8), new THREE.MeshBasicMaterial({ color, depthTest: false, transparent: true, opacity: 0.9 }));
        m.position.set(...p.point);
        m.renderOrder = 12;
        group.add(m);
      } else if (p.key) {
        const ref = this.refs.find((r) => r.key === p.key);
        if (!ref) continue;
        const clone = ref.pickMesh.clone() as THREE.Mesh;
        clone.material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.4, side: THREE.DoubleSide, depthWrite: false });
        if ((clone as unknown as THREE.Line).isLine) clone.material = new THREE.LineBasicMaterial({ color });
        clone.applyMatrix4(ref.object.matrixWorld);
        group.add(clone);
      }
    }
    this.invalidate();
  }

  private applyBodyMatrix(o: THREE.Object3D, bi: number) {
    const m = this.pickViews[bi]?.matrix;
    if (!m) return;
    o.matrixAutoUpdate = false;
    o.matrix.copy(m);
  }

  // ----------------------------------------------------------- navigation ---

  private onPointerDown(e: PointerEvent) {
    this.renderer.domElement.setPointerCapture(e.pointerId);
    const orbitKey = this.keysDown.has("F4");
    const panKey = this.keysDown.has("F2");
    const zoomKey = this.keysDown.has("F3");
    let mode: "orbit" | "pan" | "zoom" | null = null;
    const p = this.navPreset;
    if (e.button === 1) {
      if (p === "solidworks") mode = e.ctrlKey ? "pan" : e.shiftKey ? "zoom" : "orbit";
      else if (p === "creo") mode = e.shiftKey ? "pan" : e.ctrlKey ? "zoom" : "orbit";
      else mode = e.shiftKey ? "orbit" : "pan"; // Inventor / Fusion 360 / Onshape
    } else if (e.button === 2 && p === "onshape") mode = e.ctrlKey ? "pan" : "orbit";
    else if (e.button === 0 && (orbitKey || e.altKey || this.navMode === "orbit")) mode = "orbit";
    else if (e.button === 0 && (panKey || this.navMode === "pan")) mode = "pan";
    else if (e.button === 0 && (zoomKey || this.navMode === "zoom")) mode = "zoom";
    else if (e.button === 2 && e.shiftKey) mode = "orbit";
    if (mode) {
      const pivot = mode === "orbit" ? (this.surfacePoint(e) ?? this.view.target.clone()) : this.view.target.clone();
      this.drag = { mode, x: e.clientX, y: e.clientY, pivot, button: e.button, moved: false, down: e };
      this.renderer.domElement.style.cursor = mode === "orbit" ? "grabbing" : mode === "pan" ? "move" : "ns-resize";
      this.anim = null;
      return;
    }
    this.tool?.onPointerDown?.(e, this);
  }

  private onPointerMove(e: PointerEvent) {
    if (this.drag) {
      const dx = e.clientX - this.drag.x, dy = e.clientY - this.drag.y;
      if (!this.drag.moved && Math.abs(dx) + Math.abs(dy) < 3) return;
      this.drag.moved = true;
      this.drag.x = e.clientX;
      this.drag.y = e.clientY;
      if (this.drag.mode === "orbit") this.orbit(dx, dy, this.drag.pivot);
      else if (this.drag.mode === "pan") this.pan(dx, dy);
      else this.zoomBy(Math.exp(dy * 0.01));
      return;
    }
    const w = this.surfacePoint(e);
    this.onCursorWorld?.(w ? (w.toArray() as Vec3) : null);
    this.tool?.onPointerMove?.(e, this);
  }

  private onPointerUp(e: PointerEvent) {
    if (this.drag) {
      const d = this.drag;
      this.drag = null;
      this.renderer.domElement.style.cursor = this.tool?.cursor ?? "";
      // a right click without dragging still opens the menu (Onshape style)
      if (!d.moved && d.button === 2) this.tool?.onContextMenu?.(e, this);
      // a left click without dragging still selects, even while an orbit / pan / zoom mode
      // (navigation bar, F2-F4, Alt) is on: only a drag navigates
      if (!d.moved && d.button === 0) {
        this.tool?.onPointerDown?.(d.down, this);
        this.tool?.onPointerUp?.(e, this);
      }
      return;
    }
    if (e.button === 2) {
      if (this.tool?.onContextMenu?.(e, this)) return;
    }
    this.tool?.onPointerUp?.(e, this);
  }

  private onWheel(e: WheelEvent) {
    e.preventDefault();
    this.anim = null;
    const f = Math.exp((e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY) * 0.0012 * (this.invertWheel ? -1 : 1));
    this.zoomBy(f, e);
  }

  zoomBy(f: number, at?: { clientX: number; clientY: number }) {
    const v = this.view;
    const newH = THREE.MathUtils.clamp(v.height * f, 1e-3, 1e6);
    if (at) {
      // keep the point under the cursor fixed
      const n = this.ndc(at);
      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(v.quat);
      const up = new THREE.Vector3(0, 1, 0).applyQuaternion(v.quat);
      const a = this.aspect;
      const k = v.height - newH;
      v.target.addScaledVector(right, (n.x * k * a) / 2).addScaledVector(up, (n.y * k) / 2);
    }
    v.height = newH;
    this.updateCamera();
  }

  pan(dx: number, dy: number) {
    const v = this.view;
    const ps = this.pixelSize;
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(v.quat);
    const up = new THREE.Vector3(0, 1, 0).applyQuaternion(v.quat);
    v.target.addScaledVector(right, -dx * ps).addScaledVector(up, dy * ps);
    this.updateCamera();
  }

  orbit(dx: number, dy: number, pivot: THREE.Vector3) {
    const v = this.view;
    const up = new THREE.Vector3(0, 1, 0).applyQuaternion(v.quat);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(v.quat);
    const q = new THREE.Quaternion()
      .setFromAxisAngle(up, -dx * 0.008)
      .multiply(new THREE.Quaternion().setFromAxisAngle(right, -dy * 0.008));
    v.quat.premultiply(q).normalize();
    v.target.sub(pivot).applyQuaternion(q).add(pivot);
    this.updateCamera();
  }

  animateTo(to: ViewState, dur = 380) {
    this.anim = {
      from: { target: this.view.target.clone(), quat: this.view.quat.clone(), height: this.view.height },
      to,
      t0: performance.now(),
      dur,
    };
  }

  /** Orientation looking from direction `dir` (eye = target + dir). */
  static quatFor(dir: Vec3, upHint?: Vec3): THREE.Quaternion {
    const z = new THREE.Vector3(...dir).normalize();
    let up = upHint ? new THREE.Vector3(...upHint) : new THREE.Vector3(0, 1, 0);
    if (Math.abs(z.dot(up)) > 0.999) up = new THREE.Vector3(0, 0, z.y > 0 ? -1 : 1);
    const x = new THREE.Vector3().crossVectors(up, z).normalize();
    const y = new THREE.Vector3().crossVectors(z, x);
    return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
  }

  setStandardView(dir: Vec3, animate = true, upHint?: Vec3) {
    const to: ViewState = { target: this.view.target.clone(), quat: Viewport.quatFor(dir, upHint), height: this.view.height };
    const fitted = this.fitState(to.quat);
    if (fitted) {
      to.target.copy(fitted.target);
      to.height = fitted.height;
    }
    if (animate) this.animateTo(to);
    else {
      this.view = to;
      this.updateCamera();
    }
  }

  /** Look straight at a plane (Inventor "Look At"). */
  lookAtPlane(p: PlaneDef, animate = true) {
    const z = new THREE.Vector3(...p.normal);
    const x = new THREE.Vector3(...p.xDir);
    const y = new THREE.Vector3().crossVectors(z, x);
    const quat = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
    const fitted = this.fitState(quat);
    const to: ViewState = { target: fitted?.target ?? new THREE.Vector3(...p.origin), quat, height: fitted?.height ?? this.view.height };
    if (animate) this.animateTo(to);
    else {
      this.view = to;
      this.updateCamera();
    }
  }

  fitState(quat = this.view.quat): { target: THREE.Vector3; height: number } | null {
    const box = this.modelBounds();
    if (box.isEmpty()) return { target: new THREE.Vector3(), height: 160 };
    // fit the box projected onto the view plane
    const inv = quat.clone().invert();
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < 8; i++)
      pts.push(new THREE.Vector3(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z).applyQuaternion(inv));
    const lo = new THREE.Vector3(Infinity, Infinity, Infinity), hi = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
    pts.forEach((p) => (lo.min(p), hi.max(p)));
    const c = lo.clone().add(hi).multiplyScalar(0.5).applyQuaternion(quat);
    const h = Math.max(hi.y - lo.y, (hi.x - lo.x) / this.aspect) * 1.35;
    // never zoom in so far that a sketch has no room to grow
    return { target: c, height: Math.max(h, 60) };
  }

  fitAll(animate = true) {
    const f = this.fitState();
    if (!f) return;
    const to = { target: f.target, quat: this.view.quat.clone(), height: f.height };
    if (animate) this.animateTo(to);
    else {
      this.view = to;
      this.updateCamera();
    }
  }

  setPerspective(on: boolean) {
    this.perspective = on;
    this.updateCamera();
  }

  screenshot(): string {
    this.needsRender = true;
    this.tick(performance.now());
    return this.renderer.domElement.toDataURL("image/png");
  }

  /** Project a world point to client pixel coordinates. */
  toScreen(p: THREE.Vector3): { x: number; y: number } {
    const v = p.clone().project(this.camera);
    const r = this.renderer.domElement.getBoundingClientRect();
    return { x: r.left + ((v.x + 1) / 2) * r.width, y: r.top + ((1 - v.y) / 2) * r.height };
  }
}

export function planeMatrix(p: PlaneDef): THREE.Matrix4 {
  const x = new THREE.Vector3(...p.xDir).normalize();
  const z = new THREE.Vector3(...p.normal).normalize();
  const y = new THREE.Vector3().crossVectors(z, x);
  const m = new THREE.Matrix4().makeBasis(x, y, z);
  m.setPosition(new THREE.Vector3(...p.origin));
  return m;
}

export function samePick(a: Pick | null, b: Pick | null): boolean {
  if (!a || !b) return a === b;
  return a.kind === b.kind && a.body === b.body && a.index === b.index && a.key === b.key && (a.kind !== "ref" || a.index >= 0 || a.point.every((v, i) => v === b.point[i]));
}
