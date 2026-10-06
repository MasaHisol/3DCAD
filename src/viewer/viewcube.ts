import * as THREE from "three";
import type { Vec3 } from "../core/types";
import { Viewport } from "./viewport";
import { icon } from "../ui/icons";

// Inventor-like ViewCube: click a face, edge or corner to snap the view,
// drag the cube to orbit, the house returns to the home (iso) view.

const FACE_LABELS: { dir: Vec3; label: string }[] = [
  { dir: [1, 0, 0], label: "右" },
  { dir: [-1, 0, 0], label: "左" },
  { dir: [0, 1, 0], label: "上" },
  { dir: [0, -1, 0], label: "下" },
  { dir: [0, 0, 1], label: "前" },
  { dir: [0, 0, -1], label: "後" },
];

export class ViewCube {
  readonly el: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.OrthographicCamera(-1.05, 1.05, 1.05, -1.05, -10, 10);
  private cube: THREE.Mesh;
  private hl: THREE.Mesh;
  private ring: THREE.Mesh;
  private ray = new THREE.Raycaster();
  private hoverDir: Vec3 | null = null;
  private dragging: { x: number; y: number; moved: boolean } | null = null;

  constructor(private vp: Viewport, parent: HTMLElement, onHome: () => void) {
    this.el = document.createElement("div");
    this.el.className = "viewcube";
    const home = document.createElement("button");
    home.className = "vc-home";
    home.title = "ホーム ビュー (F6)";
    home.innerHTML = icon("home");
    home.onclick = onHome;
    this.el.appendChild(home);
    parent.appendChild(this.el);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(120, 120);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.el.appendChild(this.renderer.domElement);

    const mats = [0, 1, 2, 3, 4, 5].map((i) => new THREE.MeshBasicMaterial({ map: this.faceTexture(FACE_LABELS[i].label) }));
    // BoxGeometry face order: +x, -x, +y, -y, +z, -z (matches FACE_LABELS)
    this.cube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), mats);
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(this.cube.geometry), new THREE.LineBasicMaterial({ color: 0x8a94a6 }));
    this.cube.add(edges);
    this.scene.add(this.cube);
    this.hl = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: 0x3b9cff, transparent: true, opacity: 0.55, depthTest: false }));
    this.hl.visible = false;
    this.scene.add(this.hl);
    // compass ring
    this.ring = new THREE.Mesh(
      new THREE.RingGeometry(0.78, 0.86, 48),
      new THREE.MeshBasicMaterial({ color: 0xaab3c2, transparent: true, opacity: 0.6, side: THREE.DoubleSide }),
    );
    this.ring.rotation.x = -Math.PI / 2;
    this.ring.position.y = -0.55;
    this.scene.add(this.ring);

    const c = this.renderer.domElement;
    c.addEventListener("pointermove", (e) => this.onMove(e));
    c.addEventListener("pointerleave", () => this.setHover(null));
    c.addEventListener("pointerdown", (e) => {
      c.setPointerCapture(e.pointerId);
      this.dragging = { x: e.clientX, y: e.clientY, moved: false };
    });
    c.addEventListener("pointerup", () => {
      const d = this.dragging;
      this.dragging = null;
      if (d && !d.moved && this.hoverDir) this.snapTo(this.hoverDir);
    });
    c.addEventListener("contextmenu", (e) => e.preventDefault());
    this.render();
  }

  private faceTexture(label: string): THREE.CanvasTexture {
    const cv = document.createElement("canvas");
    cv.width = cv.height = 128;
    const g = cv.getContext("2d")!;
    const grd = g.createLinearGradient(0, 0, 0, 128);
    grd.addColorStop(0, "#f7f8fa");
    grd.addColorStop(1, "#dfe3ea");
    g.fillStyle = grd;
    g.fillRect(0, 0, 128, 128);
    g.fillStyle = "#3d4553";
    g.font = "600 40px 'Noto Sans JP', system-ui, sans-serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText(label, 64, 66);
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }

  private dirAt(e: PointerEvent): Vec3 | null {
    const r = this.renderer.domElement.getBoundingClientRect();
    const n = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    this.ray.setFromCamera(n, this.camera);
    const hit = this.ray.intersectObject(this.cube, false)[0];
    if (!hit) return null;
    const p = hit.point;
    const k = 0.32; // size of edge / corner zones
    const comp = (v: number) => (v > 0.5 - k / 2 ? 1 : v < -0.5 + k / 2 ? -1 : 0);
    return [comp(p.x), comp(p.y), comp(p.z)];
  }

  private onMove(e: PointerEvent) {
    if (this.dragging) {
      const dx = e.clientX - this.dragging.x, dy = e.clientY - this.dragging.y;
      if (Math.abs(dx) + Math.abs(dy) > 2) this.dragging.moved = true;
      if (this.dragging.moved) {
        this.dragging.x = e.clientX;
        this.dragging.y = e.clientY;
        this.vp.orbit(dx, dy, this.vp.view.target.clone());
        this.setHover(null);
      }
      return;
    }
    this.setHover(this.dirAt(e));
  }

  private setHover(d: Vec3 | null) {
    this.hoverDir = d;
    if (!d) this.hl.visible = false;
    else {
      const size = d.map((c) => (c === 0 ? 1.02 : 0.34)) as Vec3;
      this.hl.scale.set(...size);
      this.hl.position.set(...(d.map((c) => c * 0.34) as Vec3));
      this.hl.visible = true;
    }
    this.renderer.domElement.style.cursor = d ? "pointer" : "grab";
    this.render();
  }

  snapTo(d: Vec3) {
    const up: Vec3 | undefined = d[1] !== 0 && d[0] === 0 && d[2] === 0 ? [0, 0, -d[1]] : undefined;
    this.vp.setStandardView(d, true, up);
  }

  /** Re-orient the cube to follow the main camera. */
  render() {
    const q = this.vp.view.quat;
    this.camera.quaternion.copy(q);
    this.camera.position.set(0, 0, 3).applyQuaternion(q);
    this.camera.updateMatrixWorld();
    this.renderer.render(this.scene, this.camera);
  }
}
