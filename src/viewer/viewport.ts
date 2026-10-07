import * as THREE from "three";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import type { BodyMesh, ThreadInfo } from "../kernel/protocol";
import type { PlaneDef, Vec3 } from "../core/types";

export type PickKind = "face" | "edge" | "plane" | "axis" | "point";

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

export class Viewport {
  readonly el: HTMLElement;
  readonly renderer: THREE.WebGLRenderer;
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
  clipPlane: THREE.Plane | null = null;

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
  private raycaster = new THREE.Raycaster();
  private needsRender = true;
  private anim: { from: ViewState; to: ViewState; t0: number; dur: number } | null = null;
  private drag: { mode: "orbit" | "pan" | "zoom"; x: number; y: number; pivot: THREE.Vector3; button: number; moved: boolean } | null = null;
  /** Mouse mapping familiar from other CAD systems. */
  navPreset: NavPreset = "inventor";
  invertWheel = false;
  private keysDown = new Set<string>();
  private resizeObs: ResizeObserver;

  constructor(el: HTMLElement) {
    this.el = el;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.localClippingEnabled = true;
    this.renderer.toneMapping = THREE.NeutralToneMapping;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.autoClear = false;
    el.appendChild(this.renderer.domElement);
    this.renderer.domElement.classList.add("vp-canvas");

    this.labels = new CSS2DRenderer();
    this.labels.domElement.classList.add("vp-labels");
    el.appendChild(this.labels.domElement);

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environmentIntensity = 0.45;
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

    this.scene.add(this.model, this.threadLayer, this.trailLayer, this.refLayer, this.sketchLayer, this.overlay);
    this.overlay.add(this.hoverObj, this.selectObj);
    this.buildTriad();
    this.setStandardView([1, 1, 1], false);

    const c = this.renderer.domElement;
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
    const r = this.renderer;
    r.setScissorTest(false);
    r.clear();
    r.render(this.scene, this.camera);
    // axis triad (bottom-left)
    const s = 90 * r.getPixelRatio();
    const size = r.getDrawingBufferSize(new THREE.Vector2());
    r.clearDepth();
    r.setScissorTest(true);
    r.setScissor(0, 0, s, s);
    r.setViewport(0, 0, s, s);
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

  private materialFor(bi: number): THREE.MeshStandardMaterial {
    const color = this.bodyColors[bi];
    const hl = this.highlighted.has(bi);
    if (!color && !hl) return this.material;
    const key = `${color ?? "base"}|${hl ? 1 : 0}`;
    let m = this.colorMats.get(key);
    if (!m) {
      m = this.material.clone();
      if (color) m.color.set(color);
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
    this.invalidate();
  }

  private buildView(data: BodyMesh, bi: number, forPick: boolean): BodyView {
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(data.positions, 3));
    geom.setAttribute("normal", new THREE.BufferAttribute(data.normals, 3));
    geom.setIndex(new THREE.BufferAttribute(data.indices, 1));
    geom.computeBoundingSphere();
    const mesh = new THREE.Mesh(geom, forPick ? this.pickMaterial : this.materialFor(bi));
    mesh.userData.body = bi;
    const back = new THREE.Mesh(geom, this.backMaterial);
    back.visible = !forPick && !!this.clipPlane;
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
      b.mesh.geometry.dispose();
      b.edges.geometry.dispose();
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
    if (this.pickViews !== this.bodies && this.pickViews[i]) this.placeView(this.pickViews[i], m.clone());
    this.refreshHighlights();
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
    this.highlighted = new Set([...this.highlighted].filter((i) => i < bodies.length));
    const sharedPick = this.pickViews === this.bodies;
    this.disposeViews(this.bodies);
    if (!sharedPick) this.disposeViews(this.pickViews);
    this.model.clear();
    this.bodies = bodies.map((data, bi) => {
      const v = this.buildView(data, bi, false);
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
    this.applyStyle();
    this.applyClip();
    this.hover = null;
    this.refreshHighlights();
  }

  setMaterialColor(color: string) {
    this.material.color.set(color);
    this.invalidate();
  }

  /** Bodies' visibility (hidden assembly components). */
  setBodyVisible(i: number, on: boolean) {
    const b = this.bodies[i];
    if (!b) return;
    b.mesh.visible = on && this.style !== "wireframe";
    b.edges.visible = on && this.style !== "shaded";
    this.invalidate();
  }

  setStyle(s: VisualStyle) {
    this.style = s;
    this.applyStyle();
  }

  private applyStyle() {
    for (const b of this.bodies) {
      b.mesh.visible = this.style !== "wireframe";
      b.edges.visible = this.style !== "shaded";
      b.hidden.visible = this.style === "hiddenEdges" || this.style === "wireframe";
    }
    this.hiddenMaterial.depthTest = false;
    this.hiddenMaterial.opacity = this.style === "wireframe" ? 0.9 : 0.5;
    this.invalidate();
  }

  setSection(plane: THREE.Plane | null) {
    this.clipPlane = plane;
    this.applyClip();
  }

  private applyClip() {
    const planes = this.clipPlane ? [this.clipPlane] : [];
    this.material.clippingPlanes = planes;
    for (const m of this.colorMats.values()) m.clippingPlanes = planes;
    this.backMaterial.clippingPlanes = planes;
    this.edgeMaterial.clippingPlanes = planes;
    this.hiddenMaterial.clippingPlanes = planes;
    for (const b of this.bodies) b.back.visible = !!this.clipPlane;
    this.invalidate();
  }

  modelBounds(): THREE.Box3 {
    const box = new THREE.Box3();
    for (const b of this.bodies) box.expandByObject(b.mesh);
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

  setRefs(list: { key: string; kind: "plane" | "axis" | "point"; plane?: PlaneDef; dir?: Vec3; label: string; size?: number }[]) {
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
        const geo = new THREE.BufferGeometry().setFromPoints([d.clone().multiplyScalar(-size * 0.7), d.clone().multiplyScalar(size * 0.7)]);
        const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: "#c8a02c" }));
        g.add(line);
        pickMesh = line;
      } else {
        const sp = new THREE.Mesh(new THREE.SphereGeometry(size * 0.025, 12, 8), new THREE.MeshBasicMaterial({ color: "#c8a02c" }));
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
    const meshHits = this.raycaster.intersectObjects(meshes, false).filter((h) => !this.clipPlane || this.clipPlane.distanceToPoint(h.point) >= 0);
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
    const filtered = this.pickFilter ? cands.filter((c) => this.pickFilter!(c)) : cands;
    if (!filtered.length) return null;
    // edges win when the cursor is near them; otherwise the closest hit
    filtered.sort((a, b) => a.prio - b.prio || a.dist - b.dist);
    const edge = filtered.find((c) => c.kind === "edge" || c.kind === "axis" || c.kind === "point");
    const best = edge ?? filtered.sort((a, b) => a.dist - b.dist)[0];
    const { dist: _d, prio: _p, ...pick } = best;
    void _d;
    void _p;
    return pick;
  }

  /** World point on the model under the cursor (for zoom/orbit pivots). */
  surfacePoint(e: { clientX: number; clientY: number }): THREE.Vector3 | null {
    this.raycaster.setFromCamera(this.ndc(e), this.camera);
    const hit = this.raycaster.intersectObjects(
      this.bodies.map((b) => b.mesh),
      false,
    )[0];
    return hit ? hit.point : null;
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

  refreshHighlights() {
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
            clippingPlanes: this.clipPlane ? [this.clipPlane] : [],
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
      this.drag = { mode, x: e.clientX, y: e.clientY, pivot, button: e.button, moved: false };
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
  return a.kind === b.kind && a.body === b.body && a.index === b.index && a.key === b.key;
}
