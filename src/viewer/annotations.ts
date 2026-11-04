// Display of measurements in the viewport: saved measurement annotations
// (re-resolved and re-measured after every rebuild, broken ones flagged),
// temporary overlays of the running measure command (closest points, axes,
// pitch circle) and the wall thickness colour map with its legend.

import * as THREE from "three";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import type { App } from "../app";
import type { Vec3 } from "../core/types";
import type { MeasureNote, ThicknessResult } from "../measure/types";
import { applyNoteResult, NOTE_LABELS, noteRequest, resolveNote } from "../measure/notes";
import { formatMeasure, loadFormat, noteText, type MeasureFormat } from "../measure/format";

const COLOR = "#00897b";
const TEMP = "#e8710a";
const LOST = "#d32f2f";

export interface TempItem {
  segs?: Vec3[];
  points?: Vec3[];
  /** Closed polyline (e.g. pitch circle). */
  loop?: Vec3[];
  label?: { at: Vec3; text: string };
}

const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a: Vec3, s: number): Vec3 => [a[0] * s, a[1] * s, a[2] * s];
const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = (a: Vec3): Vec3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};

/** Circle polyline through `center` with radius r in the plane of normal n. */
export function circlePoints(center: Vec3, n: Vec3, r: number, segs = 96): Vec3[] {
  const a: Vec3 = Math.abs(n[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
  const u = unit(cross(n, a)), v = cross(unit(n), u);
  const out: Vec3[] = [];
  for (let i = 0; i < segs; i++) {
    const t = (i / segs) * Math.PI * 2;
    out.push(add(center, add(mul(u, r * Math.cos(t)), mul(v, r * Math.sin(t)))));
  }
  return out;
}

/** Colour scale for the thickness map: red (thin) -> green -> blue (thick). */
export function thicknessColor(v: number, min: number, max: number, threshold?: number): [number, number, number] {
  if (!Number.isFinite(v)) return [0.62, 0.62, 0.62];
  if (threshold !== undefined && v < threshold) return [0.85, 0.05, 0.75];
  const t = max > min ? Math.max(0, Math.min(1, (v - min) / (max - min))) : 0.5;
  const c = new THREE.Color().setHSL(t * 0.66, 0.85, 0.5);
  return [c.r, c.g, c.b];
}

export class MeasureLayer {
  readonly group = new THREE.Group();
  private temp = new THREE.Group();
  visible = true;
  fmt: MeasureFormat = loadFormat();
  highlight: string | null = null;
  private key = "";
  private lastBodies: unknown = null;
  private gen = 0;
  private resolvedGen = -1;
  private pending = 0;
  private legend: HTMLElement | null = null;
  /** Thickness map currently shown (body index) — kept until cleared. */
  thickness: { res: ThicknessResult; threshold?: number } | null = null;

  constructor(private app: App) {
    this.group.name = "measure-notes";
    this.group.renderOrder = 22;
    this.temp.renderOrder = 23;
    app.vp.scene.add(this.group, this.temp);
  }

  /** Notes of the document shown in the current environment. */
  notes(): MeasureNote[] {
    if (this.app.env === "assembly") return (this.app.asm.doc.measureNotes ??= []);
    return (this.app.store.doc.measureNotes ??= []);
  }

  get active(): boolean {
    return (this.app.env === "part" && this.app.mode !== "sketch") || this.app.env === "assembly";
  }

  setFormat(f: MeasureFormat) {
    this.fmt = f;
    this.key = "";
    this.refresh();
  }

  /** Re-resolve (after a rebuild) and redraw when something changed. */
  refresh() {
    const bodies = this.app.env === "assembly" ? this.app.pickBodies : this.app.bodies;
    if (bodies !== this.lastBodies) (this.lastBodies = bodies), this.gen++;
    const notes = this.active ? this.notes() : [];
    if (this.active && this.app.env === "part" && this.resolvedGen !== this.gen && bodies.length) {
      this.resolvedGen = this.gen;
      void this.reresolve(notes);
    }
    const key = this.active ? `${this.gen}|${this.visible}|${this.highlight}|${JSON.stringify(notes)}|${JSON.stringify(this.fmt)}|${this.app.env}` : "off";
    if (key === this.key) return;
    this.key = key;
    this.clear(this.group);
    if (this.active && this.visible) for (const n of notes) if (!n.hidden) this.draw(n);
    this.app.vp.invalidate();
  }

  /** Resolve every part note against the rebuilt bodies and re-measure it in the kernel. */
  async reresolve(notes = this.notes()): Promise<void> {
    const id = ++this.pending;
    const bodies = this.app.bodies;
    let changed = false;
    for (const n of notes) {
      const wasBroken = !!n.broken;
      const before = JSON.stringify(n.refs);
      const res = resolveNote(n, bodies);
      if (wasBroken !== !!n.broken || before !== JSON.stringify(n.refs)) changed = true;
      const op = noteRequest(n, res);
      if (!op) continue;
      try {
        const r = await this.app.kernel.measureX(op);
        if (id !== this.pending) return; // a newer rebuild took over
        if (applyNoteResult(n, r)) changed = true;
      } catch {
        n.broken = true;
        changed = true;
      }
    }
    if (id !== this.pending) return;
    this.reresolved++;
    if (changed) this.key = "";
    this.refresh();
    this.app.browser?.render?.();
    this.onChange?.();
  }
  /** Number of completed re-resolutions (e2e / tests wait on it). */
  reresolved = 0;
  onChange: (() => void) | null = null;

  /** World position of a note point (assembly notes store component-local points). */
  private world(n: MeasureNote, i: number): Vec3 {
    const p = n.points[i];
    const ci = n.pointComps?.[i];
    if (ci === undefined || !n.comps) return p;
    const comp = this.app.asm.doc.components.find((c) => c.id === n.comps![ci]);
    if (!comp) return p;
    const m = comp.matrix;
    return [0, 1, 2].map((k) => m[k] * p[0] + m[4 + k] * p[1] + m[8 + k] * p[2] + m[12 + k]) as Vec3;
  }

  private draw(n: MeasureNote) {
    const color = n.broken ? LOST : n.id === this.highlight ? TEMP : COLOR;
    const pts = n.points.map((_, i) => this.world(n, i));
    const item: TempItem = { points: [] };
    switch (n.kind) {
      case "distance":
      case "clearance":
        if (pts.length >= 2) (item.segs = [pts[0], pts[1]]), (item.points = [pts[0], pts[1]]);
        break;
      case "hole":
      case "diameter":
        if (pts.length >= 2) item.segs = [pts[0], pts[1]];
        break;
      case "pcd":
        if (pts.length >= 3) {
          const c = pts[0];
          const nrm = unit(cross(sub(pts[1], c), sub(pts[2], c)));
          item.loop = circlePoints(c, nrm, n.value / 2);
          item.points = pts;
        }
        break;
      default:
        item.points = pts.slice(0, 1);
    }
    const at = n.kind === "distance" || n.kind === "clearance" ? (pts.length >= 2 ? mul(add(pts[0], pts[1]), 0.5) : pts[0]) : n.kind === "pcd" && pts.length >= 2 ? pts[1] : pts[0];
    if (!at) return;
    const obj = this.build(item, color);
    obj.userData.note = n.id;
    const el = document.createElement("div");
    el.className = `measure-note${n.broken ? " lost" : ""}${n.id === this.highlight ? " hi" : ""}`;
    el.dataset.note = n.id;
    el.textContent = `${n.name ? `${n.name}: ` : ""}${noteText(n, this.fmt)}`;
    el.title = n.broken ? "参照先が見つかりません (測定注記パネルで修復してください)" : `${NOTE_LABELS[n.kind]} の測定注記`;
    const lbl = new CSS2DObject(el);
    lbl.position.set(...add(at, n.offset ?? [0, 0, 0]));
    obj.add(lbl);
    this.group.add(obj);
  }

  private build(it: TempItem, color: string): THREE.Group {
    const obj = new THREE.Group();
    const segs: Vec3[] = [...(it.segs ?? [])];
    if (it.loop) it.loop.forEach((p, i) => segs.push(p, it.loop![(i + 1) % it.loop!.length]));
    if (segs.length) {
      const geo = new THREE.BufferGeometry().setFromPoints(segs.map((p) => new THREE.Vector3(...p)));
      const l = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color, depthTest: false, transparent: true }));
      l.renderOrder = 23;
      obj.add(l);
    }
    if (it.points?.length) {
      const geo = new THREE.BufferGeometry().setFromPoints(it.points.map((p) => new THREE.Vector3(...p)));
      const m = new THREE.Points(geo, new THREE.PointsMaterial({ color, size: 7, sizeAttenuation: false, depthTest: false, transparent: true }));
      m.renderOrder = 24;
      obj.add(m);
    }
    if (it.label) {
      const el = document.createElement("div");
      el.className = "measure-note temp";
      el.textContent = it.label.text;
      const lbl = new CSS2DObject(el);
      lbl.position.set(...it.label.at);
      obj.add(lbl);
    }
    return obj;
  }

  /** Overlay of the running measurement (replaces the previous one). */
  setTemp(items: TempItem[]) {
    this.clear(this.temp);
    for (const it of items) this.temp.add(this.build(it, TEMP));
    this.app.vp.invalidate();
  }

  private clear(g: THREE.Group) {
    for (const c of [...g.children]) {
      g.remove(c);
      c.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose?.();
        (m.material as THREE.Material | undefined)?.dispose?.();
        if (o instanceof CSS2DObject) o.element.remove();
      });
    }
  }

  // ----------------------------------------------------- thickness map ---

  /** Colour the body by wall thickness (nearest sample per display vertex); null restores. */
  showThickness(res: ThicknessResult | null, threshold?: number) {
    this.thickness = res ? { res, threshold } : null;
    this.legend?.remove();
    this.legend = null;
    if (!res) {
      this.app.vp.setResult(null);
      return;
    }
    const per = this.app.vp.bodies.map((b, bi) => {
      if (bi !== res.body) return null;
      const pos = b.data.positions;
      const nv = pos.length / 3;
      const colors = new Float32Array(nv * 3);
      const P = res.points, V = res.values;
      for (let i = 0; i < nv; i++) {
        const x = pos[i * 3], y = pos[i * 3 + 1], z = pos[i * 3 + 2];
        let best = -1, bd = Infinity;
        for (let k = 0; k < P.length; k++) {
          if (!Number.isFinite(V[k])) continue;
          const d = (P[k][0] - x) ** 2 + (P[k][1] - y) ** 2 + (P[k][2] - z) ** 2;
          if (d < bd) (bd = d), (best = k);
        }
        const c = thicknessColor(best >= 0 ? V[best] : NaN, res.min, res.max, threshold);
        colors.set(c, i * 3);
      }
      return { colors };
    });
    this.app.vp.setResult(per);
    // legend
    const steps = 6;
    const rows: string[] = [];
    for (let i = steps; i >= 0; i--) {
      const v = res.min + ((res.max - res.min) * i) / steps;
      const [r, g, b] = thicknessColor(v, res.min, res.max);
      rows.push(`<div class="ml-row"><span class="ml-sw" style="background:rgb(${(r * 255) | 0},${(g * 255) | 0},${(b * 255) | 0})"></span>${formatMeasure(v, "length", this.fmt)}</div>`);
    }
    if (threshold !== undefined) rows.push(`<div class="ml-row"><span class="ml-sw" style="background:rgb(217,13,191)"></span>&lt; ${formatMeasure(threshold, "length", this.fmt)} (薄肉)</div>`);
    const el = document.createElement("div");
    el.className = "measure-legend";
    el.innerHTML = `<div class="ml-title">肉厚</div>${rows.join("")}<div class="ml-foot">最小 ${formatMeasure(res.min, "length", this.fmt)} / 最大 ${formatMeasure(res.max, "length", this.fmt)}</div>`;
    this.app.vp.el.appendChild(el);
    this.legend = el;
  }
}
