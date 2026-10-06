import * as THREE from "three";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { formatNumber } from "../core/expr";
import type { SketchFeature, SkDimension, SkEntity, SkPoint, Vec2 } from "../core/types";
import { measureDimension } from "../sketch/solver";
import type { Region } from "../sketch/profiles";
import { planeMatrix } from "./viewport";

export interface SketchStyle {
  active: boolean;
  fullyConstrained: boolean;
  selected: Set<string>;
  hover: string | null;
  showConstraints: boolean;
  pixel: number;
  /** Parameter name + expression for dimension labels. */
  dimText: (d: SkDimension, value: number) => string;
  onDimDblClick?: (d: SkDimension, el: HTMLElement) => void;
  onDimPointerDown?: (d: SkDimension, e: PointerEvent) => void;
  onConstraintClick?: (id: string, e: MouseEvent) => void;
}

const C = {
  curve: new THREE.Color("#1565e0"),
  curveDone: new THREE.Color("#11161f"),
  construction: new THREE.Color("#7a8699"),
  ref: new THREE.Color("#c78a00"),
  select: new THREE.Color("#ff7a00"),
  hover: new THREE.Color("#f43f5e"),
  inactive: new THREE.Color("#4b5563"),
  dim: new THREE.Color("#0f5132"),
};

const GLYPH: Record<string, string> = {
  horizontal: "H",
  vertical: "V",
  parallel: "∥",
  perpendicular: "⊥",
  collinear: "⋯",
  equal: "=",
  tangent: "T",
  concentric: "◎",
  midpoint: "M",
  fix: "⚓",
  symmetric: "⇋",
};

export function pointMap(sk: SketchFeature): Map<string, SkPoint> {
  const m = new Map<string, SkPoint>();
  for (const e of sk.entities) if (e.type === "point") m.set(e.id, e);
  return m;
}

/** Sample points of a curve entity in sketch coordinates. */
export function entityPolyline(e: SkEntity, pts: Map<string, SkPoint>): Vec2[] {
  if (e.type === "line") {
    const a = pts.get(e.p1)!, b = pts.get(e.p2)!;
    return [
      [a.x, a.y],
      [b.x, b.y],
    ];
  }
  if (e.type === "circle") {
    const c = pts.get(e.c)!;
    const out: Vec2[] = [];
    for (let i = 0; i <= 96; i++) {
      const t = (i / 96) * Math.PI * 2;
      out.push([c.x + e.r * Math.cos(t), c.y + e.r * Math.sin(t)]);
    }
    return out;
  }
  if (e.type === "arc") {
    const c = pts.get(e.c)!, a = pts.get(e.p1)!, b = pts.get(e.p2)!;
    const r = Math.hypot(a.x - c.x, a.y - c.y);
    const t0 = Math.atan2(a.y - c.y, a.x - c.x);
    let t1 = Math.atan2(b.y - c.y, b.x - c.x);
    while (t1 <= t0 + 1e-9) t1 += Math.PI * 2;
    const n = Math.max(8, Math.ceil(((t1 - t0) / (Math.PI * 2)) * 96));
    const out: Vec2[] = [];
    for (let i = 0; i <= n; i++) {
      const t = t0 + ((t1 - t0) * i) / n;
      out.push([c.x + r * Math.cos(t), c.y + r * Math.sin(t)]);
    }
    return out;
  }
  return [];
}

export class SketchRenderer {
  readonly group = new THREE.Group();
  private labelObjs: CSS2DObject[] = [];

  constructor(parent: THREE.Object3D) {
    parent.add(this.group);
  }

  clear() {
    for (const l of this.labelObjs) l.element.remove();
    this.labelObjs = [];
    this.group.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose?.();
      const mat = m.material as THREE.Material | undefined;
      mat?.dispose?.();
    });
    this.group.clear();
  }

  render(sk: SketchFeature, style: SketchStyle, regions?: { list: Region[]; selected: Set<number>; hover: number | null }) {
    this.clear();
    const g = new THREE.Group();
    g.applyMatrix4(planeMatrix(sk.plane));
    // lift slightly off the plane to avoid z-fighting with coplanar faces
    g.position.add(new THREE.Vector3(...sk.plane.normal).multiplyScalar(style.pixel * 0.5));
    this.group.add(g);
    const pts = pointMap(sk);
    const depthTest = !style.active;

    // profile regions (when picking profiles)
    if (regions) {
      regions.list.forEach((r, i) => {
        const sel = regions.selected.has(i), hov = regions.hover === i;
        if (!sel && !hov) return;
        const shape = new THREE.Shape(r.outerPoly.map(([x, y]) => new THREE.Vector2(x, y)));
        for (const h of r.holePolys) shape.holes.push(new THREE.Path(h.map(([x, y]) => new THREE.Vector2(x, y))));
        const m = new THREE.Mesh(
          new THREE.ShapeGeometry(shape),
          new THREE.MeshBasicMaterial({
            color: sel ? "#2f8cff" : "#ffa94d",
            transparent: true,
            opacity: sel && hov ? 0.55 : 0.38,
            side: THREE.DoubleSide,
            depthWrite: false,
            depthTest: false,
          }),
        );
        m.renderOrder = 5;
        g.add(m);
      });
    }

    for (const e of sk.entities) {
      if (e.type === "point") continue;
      const poly = entityPolyline(e, pts);
      const geo = new THREE.BufferGeometry().setFromPoints(poly.map(([x, y]) => new THREE.Vector3(x, y, 0)));
      let color = style.active ? (style.fullyConstrained ? C.curveDone : C.curve) : C.inactive;
      if (e.ref) color = C.ref;
      else if (e.construction) color = C.construction;
      if (style.selected.has(e.id)) color = C.select;
      if (style.hover === e.id) color = C.hover;
      let mat: THREE.LineBasicMaterial;
      if (e.construction) {
        mat = new THREE.LineDashedMaterial({ color, dashSize: style.pixel * 6, gapSize: style.pixel * 4, depthTest });
      } else mat = new THREE.LineBasicMaterial({ color, depthTest });
      const line = new THREE.Line(geo, mat);
      if (e.construction) line.computeLineDistances();
      line.renderOrder = 6;
      g.add(line);
    }

    if (style.active) {
      // points: endpoints / centres / standalone points
      const ptsList = sk.entities.filter((e): e is SkPoint => e.type === "point");
      const pos: number[] = [];
      const cols: number[] = [];
      for (const p of ptsList) {
        pos.push(p.x, p.y, 0);
        let c = p.fixed || p.ref ? C.ref : style.fullyConstrained ? C.curveDone : C.curve;
        if (style.selected.has(p.id)) c = C.select;
        if (style.hover === p.id) c = C.hover;
        cols.push(c.r, c.g, c.b);
      }
      const pg = new THREE.BufferGeometry();
      pg.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      pg.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3));
      const pm = new THREE.Points(pg, new THREE.PointsMaterial({ size: 6, sizeAttenuation: false, vertexColors: true, depthTest: false }));
      pm.renderOrder = 8;
      g.add(pm);

      // dimensions
      const ents = new Map(sk.entities.map((e) => [e.id, e]));
      for (const d of sk.dimensions) this.renderDimension(g, d, ents, pts, style);

      if (style.showConstraints) this.renderGlyphs(g, sk, pts, style);
    }
  }

  private renderDimension(g: THREE.Group, d: SkDimension, ents: Map<string, SkEntity>, pts: Map<string, SkPoint>, style: SketchStyle) {
    const value = measureDimension(d, ents);
    const segs: Vec2[] = [];
    const geo = dimensionGeometry(d, ents, pts, style.pixel);
    if (geo) segs.push(...geo);
    if (segs.length) {
      const bg = new THREE.BufferGeometry().setFromPoints(segs.map(([x, y]) => new THREE.Vector3(x, y, 0)));
      const col = style.selected.has(d.id) ? C.select : d.driven ? C.construction : C.dim;
      const ls = new THREE.LineSegments(bg, new THREE.LineBasicMaterial({ color: col, depthTest: false }));
      ls.renderOrder = 7;
      g.add(ls);
    }
    const el = document.createElement("div");
    el.className = "dim-label" + (d.driven ? " driven" : "") + (style.selected.has(d.id) ? " selected" : "");
    el.textContent = style.dimText(d, value);
    el.title = d.driven ? "従属寸法 (参照)" : "ダブルクリックで編集";
    el.addEventListener("dblclick", (e) => {
      e.stopPropagation();
      style.onDimDblClick?.(d, el);
    });
    el.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      e.stopPropagation();
      style.onDimPointerDown?.(d, e);
    });
    const obj = new CSS2DObject(el);
    obj.position.set(d.pos[0], d.pos[1], 0);
    g.add(obj);
    this.labelObjs.push(obj);
  }

  private renderGlyphs(g: THREE.Group, sk: SketchFeature, pts: Map<string, SkPoint>, style: SketchStyle) {
    const ents = new Map(sk.entities.map((e) => [e.id, e]));
    const count = new Map<string, number>();
    for (const c of sk.constraints) {
      const glyph = GLYPH[c.type];
      if (!glyph) continue;
      const anchorId = c.refs[0];
      const e = ents.get(anchorId);
      if (!e) continue;
      let p: Vec2;
      if (e.type === "point") p = [e.x, e.y];
      else if (e.type === "line") {
        const a = pts.get(e.p1)!, b = pts.get(e.p2)!;
        p = [(a.x + b.x) / 2, (a.y + b.y) / 2];
      } else if (e.type === "circle") {
        const c0 = pts.get(e.c)!;
        p = [c0.x + e.r * 0.7071, c0.y + e.r * 0.7071];
      } else {
        const c0 = pts.get(e.c)!;
        p = [c0.x, c0.y];
      }
      const k = count.get(anchorId) ?? 0;
      count.set(anchorId, k + 1);
      const el = document.createElement("div");
      el.className = "cons-glyph" + (style.selected.has(c.id) ? " selected" : "");
      el.textContent = glyph;
      el.title = c.type;
      el.addEventListener("pointerdown", (ev) => {
        ev.stopPropagation();
        style.onConstraintClick?.(c.id, ev);
      });
      const obj = new CSS2DObject(el);
      obj.position.set(p[0] + style.pixel * (10 + k * 16), p[1] + style.pixel * 10, 0);
      g.add(obj);
      this.labelObjs.push(obj);
    }
  }
}

/** Line segments (pairs) drawing a dimension in sketch coordinates. */
export function dimensionGeometry(d: SkDimension, ents: Map<string, SkEntity>, pts: Map<string, SkPoint>, px: number): Vec2[] | null {
  const P = (id: string): Vec2 => {
    const p = pts.get(id)!;
    return [p.x, p.y];
  };
  const e0 = ents.get(d.refs[0]);
  const e1 = d.refs[1] ? ents.get(d.refs[1]) : undefined;
  if (!e0) return null;
  const arrow = (tip: Vec2, dir: Vec2): Vec2[] => {
    const s = px * 9, w = px * 3;
    const l = Math.hypot(dir[0], dir[1]) || 1;
    const ux = dir[0] / l, uy = dir[1] / l;
    const b: Vec2 = [tip[0] - ux * s, tip[1] - uy * s];
    return [tip, [b[0] - uy * w, b[1] + ux * w], tip, [b[0] + uy * w, b[1] - ux * w]];
  };
  const out: Vec2[] = [];
  if (d.type === "radius" || d.type === "diameter") {
    if (e0.type !== "circle" && e0.type !== "arc") return null;
    const c = P(e0.c);
    const r = e0.type === "circle" ? e0.r : Math.hypot(P(e0.p1)[0] - c[0], P(e0.p1)[1] - c[1]);
    const dx = d.pos[0] - c[0], dy = d.pos[1] - c[1];
    const l = Math.hypot(dx, dy) || 1;
    const u: Vec2 = [dx / l, dy / l];
    const edge: Vec2 = [c[0] + u[0] * r, c[1] + u[1] * r];
    const start: Vec2 = d.type === "diameter" ? [c[0] - u[0] * r, c[1] - u[1] * r] : c;
    out.push(start, d.pos, ...arrow(edge, u));
    if (d.type === "diameter") out.push(...arrow([c[0] - u[0] * r, c[1] - u[1] * r], [-u[0], -u[1]]));
    return out;
  }
  if (d.type === "angle") {
    if (!e1 || e0.type !== "line" || e1.type !== "line") return null;
    const a1 = P(e0.p1), b1 = P(e0.p2), a2 = P(e1.p1), b2 = P(e1.p2);
    const den = (a1[0] - b1[0]) * (a2[1] - b2[1]) - (a1[1] - b1[1]) * (a2[0] - b2[0]);
    if (Math.abs(den) < 1e-12) return null;
    const t = ((a1[0] - a2[0]) * (a2[1] - b2[1]) - (a1[1] - a2[1]) * (a2[0] - b2[0])) / den;
    const X: Vec2 = [a1[0] + t * (b1[0] - a1[0]), a1[1] + t * (b1[1] - a1[1])];
    const r = Math.hypot(d.pos[0] - X[0], d.pos[1] - X[1]);
    const ang = (v: Vec2) => Math.atan2(v[1] - X[1], v[0] - X[0]);
    // pick the directions of each line that bracket the label
    const la = ang(d.pos);
    const dirsOf = (a: Vec2, b: Vec2) => [Math.atan2(b[1] - a[1], b[0] - a[0]), Math.atan2(a[1] - b[1], a[0] - b[0])];
    const norm = (x: number) => ((x % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI) - Math.PI;
    const best = (dirs: number[]) => dirs.reduce((p, c) => (Math.abs(norm(c - la)) < Math.abs(norm(p - la)) ? c : p));
    let s = best(dirsOf(a1, b1)), e = best(dirsOf(a2, b2));
    if (norm(e - s) < 0) [s, e] = [e, s];
    const span = norm(e - s);
    const n = 24;
    for (let i = 0; i < n; i++) {
      const t0 = s + (span * i) / n, t1 = s + (span * (i + 1)) / n;
      out.push([X[0] + r * Math.cos(t0), X[1] + r * Math.sin(t0)], [X[0] + r * Math.cos(t1), X[1] + r * Math.sin(t1)]);
    }
    return out;
  }
  // linear dimensions
  let A: Vec2, B: Vec2;
  if (!e1) {
    if (e0.type !== "line") return null;
    A = P(e0.p1);
    B = P(e0.p2);
  } else {
    const anchor = (e: SkEntity): Vec2 | null => (e.type === "point" ? [e.x, e.y] : e.type === "circle" || e.type === "arc" ? P(e.c) : null);
    const pa = anchor(e0), pb = anchor(e1);
    if (pa && pb) (A = pa), (B = pb);
    else {
      // point to line: foot of perpendicular
      const pt = pa ?? (e0.type === "line" && e1.type === "line" ? P(e1.p1) : pb)!;
      const ln = (pa ? e1 : e0) as Extract<SkEntity, { type: "line" }>;
      const la = P(ln.p1), lb = P(ln.p2);
      const dx = lb[0] - la[0], dy = lb[1] - la[1];
      const t = ((pt[0] - la[0]) * dx + (pt[1] - la[1]) * dy) / (dx * dx + dy * dy || 1);
      A = pt;
      B = [la[0] + t * dx, la[1] + t * dy];
    }
  }
  let dir: Vec2;
  if (d.type === "hdistance") dir = [1, 0];
  else if (d.type === "vdistance") dir = [0, 1];
  else {
    const l = Math.hypot(B[0] - A[0], B[1] - A[1]) || 1;
    dir = [(B[0] - A[0]) / l, (B[1] - A[1]) / l];
  }
  const nrm: Vec2 = [-dir[1], dir[0]];
  const off = (p: Vec2) => (d.pos[0] - p[0]) * nrm[0] + (d.pos[1] - p[1]) * nrm[1];
  const A2: Vec2 = [A[0] + nrm[0] * off(A), A[1] + nrm[1] * off(A)];
  const B2: Vec2 = [B[0] + nrm[0] * off(B), B[1] + nrm[1] * off(B)];
  const ext = (p: Vec2, q: Vec2): Vec2[] => {
    const dx = q[0] - p[0], dy = q[1] - p[1];
    const l = Math.hypot(dx, dy);
    if (l < 1e-9) return [];
    const k = (l + px * 4) / l;
    return [p, [p[0] + dx * k, p[1] + dy * k]];
  };
  out.push(...ext(A, A2), ...ext(B, B2), A2, B2);
  const along: Vec2 = [B2[0] - A2[0], B2[1] - A2[1]];
  out.push(...arrow(B2, along), ...arrow(A2, [-along[0], -along[1]]));
  // leader to label if it is outside the dimension line
  const proj = (d.pos[0] - A2[0]) * dir[0] + (d.pos[1] - A2[1]) * dir[1];
  const len = (B2[0] - A2[0]) * dir[0] + (B2[1] - A2[1]) * dir[1];
  const lo = Math.min(0, len), hi = Math.max(0, len);
  if (proj < lo || proj > hi) out.push(proj < lo ? (len >= 0 ? A2 : B2) : len >= 0 ? B2 : A2, d.pos);
  return out;
}

export function dimLabel(value: number, d: SkDimension, expr: string): string {
  const prefix = d.type === "diameter" ? "⌀" : d.type === "radius" ? "R" : "";
  const unit = d.type === "angle" ? "°" : "";
  const v = `${prefix}${formatNumber(value, 2)}${unit}`;
  if (d.driven) return `(${v})`;
  const isPlain = /^\s*[-+]?[0-9.]+\s*(mm|deg)?\s*$/.test(expr);
  return isPlain ? v : `fx: ${v}`;
}
