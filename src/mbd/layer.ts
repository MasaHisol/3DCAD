// 3D display of the part's PMI: leader / dimension lines in a THREE group added
// to the viewport scene and CSS2D labels (rendered by the viewport's existing
// CSS2DRenderer). Rebuilt only when the annotations, bodies or visibility change.

import * as THREE from "three";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import type { App } from "../app";
import type { Vec3 } from "../core/types";
import { dimParts, type PmiAnno } from "./pmi";
import { bodiesBox, pmiGeometry, vec, type PmiGeom } from "./resolve";

const COLOR = "#1565c0";
const HILITE = "#e8710a";

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/** Label HTML for an annotation (shared with the list dialog preview). */
export function pmiLabelHtml(a: PmiAnno): string {
  switch (a.type) {
    case "dim":
    case "diameter": {
      const t = dimParts(a);
      let main = esc(t.main);
      if (t.paren) main = `(${main})`;
      let out = `<span class="pmi-main${t.boxed ? " boxed" : ""}">${main}</span>`;
      if (t.upper !== undefined) out += `<span class="pmi-tol"><span>${esc(t.upper)}</span><span>${esc(t.lower ?? "")}</span></span>`;
      return out;
    }
    case "gdt": {
      const cells = [a.symbol, a.value, ...a.datums.split(/[\s,|]+/).filter(Boolean)];
      return `<span class="pmi-fcf">${cells.map((c, i) => `<span class="${i === 0 ? "sym" : ""}">${esc(c)}</span>`).join("")}</span>`;
    }
    case "datum":
      return `<span class="pmi-datum">${esc(a.letter)}</span>`;
    case "surface": {
      const bar = a.removal === "required" ? `<path d="M2 7h6"/>` : "";
      const circ = a.removal === "prohibited" ? `<circle cx="7" cy="9.5" r="2.4"/>` : "";
      return `<svg class="pmi-surf" viewBox="0 0 20 16" width="20" height="16"><path d="M2 7l5 7 6-13h7"/>${bar}${circ}</svg><span>Ra ${esc(a.ra)}</span>`;
    }
    case "note":
      return esc(a.text).replace(/\n/g, "<br>");
  }
}

export class PmiLayer {
  readonly group = new THREE.Group();
  visible = true;
  /** Annotation being created / edited (drawn on top of the stored ones). */
  preview: PmiAnno | null = null;
  highlight: string | null = null;
  /** Last resolved geometry per annotation id (null = reference lost). */
  readonly geoms = new Map<string, PmiGeom | null>();
  onLabelDblClick: ((id: string) => void) | null = null;
  private key = "";
  private lastBodies: unknown = null;
  private bodiesGen = 0;

  constructor(private app: App) {
    this.group.name = "pmi";
    this.group.renderOrder = 20;
    app.vp.scene.add(this.group);
  }

  get active(): boolean {
    return this.app.env === "part" && this.app.mode !== "sketch";
  }

  setVisible(on: boolean) {
    this.visible = on;
    this.refresh();
  }

  /** Geometry for an annotation against the current bodies (resolving its references). */
  geometry(a: PmiAnno): PmiGeom | null {
    return pmiGeometry(a, this.app.bodies);
  }

  /**
   * Re-resolve and redraw when something changed. Also writes re-captured
   * references and measured values back into the document (silently, like
   * the feature reference tracking) so they keep following the model.
   */
  refresh() {
    const bodies = this.app.bodies;
    if (bodies !== this.lastBodies) (this.lastBodies = bodies), this.bodiesGen++;
    const doc = this.app.store.doc;
    const show = this.active && (this.visible || !!this.preview);
    const key = show ? `${this.bodiesGen}|${this.visible}|${this.highlight}|${JSON.stringify(doc.pmi ?? [])}|${JSON.stringify(this.preview)}` : "off";
    if (key === this.key) return;
    this.key = key;
    this.clear();
    if (!show) return void this.app.vp.invalidate();
    const box = bodiesBox(bodies);
    const diag = box ? Math.max(1, vec.dist(box[0], box[1])) : 100;
    let changed = false;
    this.geoms.clear();
    for (const a of doc.pmi ?? []) {
      const g = this.geometry(a);
      this.geoms.set(a.id, g);
      if (g) {
        // keep references tracking the edited geometry
        g.refs.forEach((r, i) => {
          if (JSON.stringify(a.refs[i]) !== JSON.stringify(r.updated)) (a.refs[i] = r.updated), (changed = true);
        });
        if ((a.type === "dim" || a.type === "diameter") && g.value !== undefined && a.value !== g.value) (a.value = g.value), (changed = true);
      }
      if (!this.visible || a.hidden || a.id === this.preview?.id) continue;
      this.draw(a, g, diag, a.id === this.highlight ? HILITE : COLOR);
    }
    if (this.preview) {
      const g = this.geometry(this.preview);
      if (g && (this.preview.type === "dim" || this.preview.type === "diameter")) this.preview.value = g.value;
      this.draw(this.preview, g, diag, HILITE);
    }
    if (changed) this.key = `${this.bodiesGen}|${this.visible}|${this.highlight}|${JSON.stringify(doc.pmi ?? [])}|${JSON.stringify(this.preview)}`;
    this.app.vp.invalidate();
  }

  private clear() {
    for (const c of [...this.group.children]) {
      this.group.remove(c);
      c.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose?.();
        (m.material as THREE.Material | undefined)?.dispose?.();
        if (o instanceof CSS2DObject) o.element.remove();
      });
    }
  }

  private draw(a: PmiAnno, g: PmiGeom | null, diag: number, color: string) {
    const obj = new THREE.Group();
    obj.userData.pmi = a.id;
    const segs: Vec3[] = [];
    const ah = diag * 0.012;
    const arrow = (tip: Vec3, from: Vec3) => {
      const d = vec.unit(vec.sub(from, tip));
      const side = vec.unit(vec.cross(d, this.viewDir()));
      const base = vec.add(tip, vec.mul(d, ah * 1.6));
      segs.push(tip, vec.add(base, vec.mul(side, ah * 0.5)), tip, vec.sub(base, vec.mul(side, ah * 0.5)));
    };
    let labelPos: Vec3;
    if (!g) {
      // reference lost: show the label at the stored location, flagged
      const r = a.refs[0];
      labelPos = r ? (r.kind === "face" ? r.ref.center : r.ref.mid) : [0, 0, 0];
    } else if (a.type === "dim" && g.p1 && g.p2) {
      const q1 = vec.add(g.p1, g.offset), q2 = vec.add(g.p2, g.offset);
      const ext = vec.mul(vec.unit(g.offset), ah);
      segs.push(g.p1, vec.add(q1, ext), g.p2, vec.add(q2, ext), q1, q2);
      if (vec.dist(q1, q2) > ah * 0.5) arrow(q1, q2), arrow(q2, q1);
      labelPos = vec.mul(vec.add(q1, q2), 0.5);
    } else {
      segs.push(g.anchor, g.label);
      if (a.type === "datum") {
        // filled datum triangle at the surface
        const d = vec.unit(g.offset);
        const side = vec.unit(vec.cross(d, this.viewDir()));
        const tri = new THREE.BufferGeometry().setFromPoints(
          [g.anchor, vec.add(vec.add(g.anchor, vec.mul(d, ah * 1.4)), vec.mul(side, ah * 0.8)), vec.sub(vec.add(g.anchor, vec.mul(d, ah * 1.4)), vec.mul(side, ah * 0.8))].map((p) => new THREE.Vector3(...p)),
        );
        const m = new THREE.Mesh(tri, new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, depthTest: false, transparent: true }));
        m.renderOrder = 21;
        obj.add(m);
      } else if (a.type !== "surface") arrow(g.anchor, g.label);
      labelPos = g.label;
    }
    if (segs.length) {
      const geo = new THREE.BufferGeometry().setFromPoints(segs.map((p) => new THREE.Vector3(...p)));
      const lines = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color, depthTest: false, transparent: true }));
      lines.renderOrder = 21;
      obj.add(lines);
    }
    const el = document.createElement("div");
    el.className = `pmi-label pmi-${a.type}${g ? "" : " lost"}${color === HILITE ? " hi" : ""}`;
    el.innerHTML = pmiLabelHtml(a);
    el.dataset.pmi = a.id;
    el.title = g ? "ダブルクリックで編集" : "参照先の面・エッジが見つかりません (再定義してください)";
    el.style.pointerEvents = "auto";
    el.addEventListener("dblclick", (e) => {
      e.stopPropagation();
      this.onLabelDblClick?.(a.id);
    });
    const lbl = new CSS2DObject(el);
    lbl.position.set(...labelPos);
    obj.add(lbl);
    this.group.add(obj);
  }

  private viewDir(): Vec3 {
    const d = new THREE.Vector3();
    this.app.vp.camera.getWorldDirection(d);
    return [d.x, d.y, d.z];
  }
}
