import * as THREE from "three";
import { evaluate, formatNumber } from "../core/expr";
import { DocumentStore, uid } from "../core/document";
import { createsCycle, evaluateParams } from "../core/params";
import { planeToWorld, solveSketch, worldToPlane } from "../core/resolve";
import type {
  ConstraintType,
  DimensionType,
  SketchFeature,
  SkArc,
  SkCircle,
  SkConstraint,
  SkDimension,
  SkEntity,
  SkLine,
  SkPoint,
  Vec2,
  Vec3,
} from "../core/types";
import { measureDimension } from "../sketch/solver";
import { dimLabel, entityPolyline, pointMap, SketchRenderer } from "./sketchRender";
import type { ToolHandler, Viewport } from "./viewport";

export type SketchTool =
  | "select"
  | "line"
  | "circle"
  | "arc"
  | "rect"
  | "polygon"
  | "slot"
  | "point"
  | "dimension"
  | "project"
  | "trim"
  | ConstraintType;

export interface SketchHost {
  status(msg: string): void;
  toast(msg: string, kind?: "info" | "warn" | "error"): void;
  dofChanged(dof: number, ok: boolean): void;
  toolChanged(tool: SketchTool): void;
  selectionChanged(): void;
  /** Model edges for "Project Geometry". */
  modelEdge(pick: { body: number; index: number }): { type: string; a: Vec3; b: Vec3; mid: Vec3; points: Vec3[] } | null;
}

const CONSTRAINT_TOOLS: ConstraintType[] = [
  "coincident",
  "horizontal",
  "vertical",
  "parallel",
  "perpendicular",
  "collinear",
  "tangent",
  "equal",
  "concentric",
  "midpoint",
  "fix",
  "symmetric",
];

const TOOL_PROMPTS: Record<string, string> = {
  select: "スケッチ ジオメトリを選択またはドラッグします",
  line: "線分の始点をクリック (連続線: 続けてクリック、Esc で終了)。数値入力で長さを指定できます",
  circle: "円の中心をクリック",
  arc: "円弧の始点をクリック",
  rect: "長方形の最初のコーナーをクリック",
  polygon: "ポリゴンの中心をクリック",
  slot: "長円の最初の中心をクリック",
  point: "点 (穴の中心) の位置をクリック",
  dimension: "寸法を記入するジオメトリを選択 (線分・円・円弧・2 点・2 線分)",
  project: "スケッチに投影するモデルのエッジを選択",
  trim: "トリムする曲線の部分をクリック",
  coincident: "一致させる点と点 (または点と曲線) を選択",
  horizontal: "水平にする線分 (または 2 点) を選択",
  vertical: "垂直にする線分 (または 2 点) を選択",
  parallel: "平行にする 2 本の線分を選択",
  perpendicular: "直交させる 2 本の線分を選択",
  collinear: "同一直線上に配置する 2 本の線分を選択",
  tangent: "接する線分と円/円弧 (または 2 つの円) を選択",
  equal: "等しくする 2 本の線分 (または 2 つの円/円弧) を選択",
  concentric: "同心にする 2 つの円/円弧を選択",
  midpoint: "点と、その中点に配置する線分を選択",
  fix: "固定する点を選択",
  symmetric: "対称にする 2 点と対称線を選択",
};

type Hit = { id: string; kind: "point" | "curve"; d: number };

interface Snap {
  uv: Vec2;
  pointId?: string;
  curveId?: string;
  /** Snapped to the midpoint of this line. */
  mid?: string;
  label?: string;
}

/** Interactive sketch editing (tools, snapping, dimensions, constraints). */
export class SketchEditor implements ToolHandler {
  tool: SketchTool = "select";
  selected = new Set<string>();
  hoverId: string | null = null;
  showConstraints = true;
  cursor = "crosshair";
  dof = 0;
  solvedOk = true;

  private renderer: SketchRenderer;
  private preview = new THREE.Group();
  private snapMarker: THREE.Points;
  private clicks: Snap[] = [];
  private chainStart: string | null = null;
  private lastPointId: string | null = null;
  private cursorUV: Vec2 = [0, 0];
  private drag: { ids: string[]; start: Vec2; orig: Map<string, Vec2>; snap: string; moved: boolean } | null = null;
  private dimDrag: { id: string } | null = null;
  private pendingDim: { type: DimensionType; refs: string[]; pos: Vec2 } | null = null;
  private consPicks: string[] = [];
  private hud: HTMLDivElement;
  private hudInput: HTMLInputElement;
  private hudLabel: HTMLSpanElement;
  private polygonSides = 6;
  private editBox: HTMLInputElement | null = null;

  constructor(
    private store: DocumentStore,
    readonly sketchId: string,
    private vp: Viewport,
    private host: SketchHost,
  ) {
    this.renderer = new SketchRenderer(vp.sketchLayer);
    vp.sketchLayer.add(this.preview);
    const sg = new THREE.BufferGeometry();
    sg.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, 0], 3));
    this.snapMarker = new THREE.Points(sg, new THREE.PointsMaterial({ color: "#16a34a", size: 11, sizeAttenuation: false, depthTest: false }));
    this.snapMarker.visible = false;
    this.snapMarker.renderOrder = 20;
    vp.sketchLayer.add(this.snapMarker);

    this.hud = document.createElement("div");
    this.hud.className = "sk-hud";
    this.hudLabel = document.createElement("span");
    this.hudInput = document.createElement("input");
    this.hudInput.spellcheck = false;
    this.hud.append(this.hudLabel, this.hudInput);
    this.hud.style.display = "none";
    vp.el.appendChild(this.hud);
    this.hudInput.addEventListener("keydown", (e) => this.onHudKey(e));
  }

  get sk(): SketchFeature {
    return this.store.feature<SketchFeature>(this.sketchId)!;
  }

  dispose() {
    this.renderer.clear();
    this.vp.sketchLayer.remove(this.renderer.group, this.preview, this.snapMarker);
    this.hud.remove();
    this.editBox?.remove();
    this.vp.invalidate();
  }

  // ------------------------------------------------------------- helpers ---

  private values(): Map<string, number> {
    return evaluateParams(this.store.doc.params);
  }

  /** Re-solve and redraw. Called after every document change. */
  refresh() {
    const sk = this.sk;
    if (!sk) return;
    const res = solveSketch(sk, this.values());
    this.dof = res.dof;
    this.solvedOk = res.ok;
    this.host.dofChanged(res.dof, res.ok);
    // drop stale selection
    const ids = new Set([...sk.entities.map((e) => e.id), ...sk.dimensions.map((d) => d.id), ...sk.constraints.map((c) => c.id)]);
    for (const s of [...this.selected]) if (!ids.has(s)) this.selected.delete(s);
    this.redraw();
  }

  redraw() {
    const sk = this.sk;
    if (!sk) return;
    this.renderer.render(sk, {
      active: true,
      fullyConstrained: this.dof === 0 && this.solvedOk,
      selected: this.selected,
      hover: this.hoverId,
      showConstraints: this.showConstraints,
      pixel: this.vp.pixelSize,
      dimText: (d, v) => {
        const p = this.store.param(d.param);
        return dimLabel(v, d, p?.expr ?? "");
      },
      onDimDblClick: (d, el) => this.editDimension(d, el),
      onDimPointerDown: (d, e) => {
        if (e.shiftKey || e.ctrlKey) this.toggleSel(d.id);
        else {
          this.selected = new Set([d.id]);
          this.dimDrag = { id: d.id };
          this.vp.renderer.domElement.setPointerCapture?.(e.pointerId);
        }
        this.host.selectionChanged();
        this.redraw();
      },
      onConstraintClick: (id, e) => {
        if (e.shiftKey || e.ctrlKey) this.toggleSel(id);
        else this.selected = new Set([id]);
        this.host.selectionChanged();
        this.redraw();
      },
    });
    this.vp.invalidate();
  }

  private toggleSel(id: string) {
    if (this.selected.has(id)) this.selected.delete(id);
    else this.selected.add(id);
  }

  private commit(label: string, fn: (sk: SketchFeature) => void) {
    this.store.mutate(label, (doc) => {
      const sk = doc.features.find((f) => f.id === this.sketchId) as SketchFeature;
      fn(sk);
    });
  }

  private uvOf(e: { clientX: number; clientY: number }): Vec2 | null {
    const w = this.vp.rayPlane(e, this.sk.plane);
    if (!w) return null;
    return worldToPlane(this.sk.plane, w.toArray() as Vec3);
  }

  private tol(): number {
    return this.vp.pixelSize * 8;
  }

  private hitTest(uv: Vec2, filter?: (e: SkEntity) => boolean): Hit | null {
    const sk = this.sk;
    const pts = pointMap(sk);
    const tol = this.tol();
    let best: Hit | null = null;
    for (const e of sk.entities) {
      if (filter && !filter(e)) continue;
      let d = Infinity;
      if (e.type === "point") d = Math.hypot(e.x - uv[0], e.y - uv[1]) - tol * 0.5; // points win
      else d = distToPolyline(uv, entityPolyline(e, pts));
      if (d < tol && (!best || d < best.d)) best = { id: e.id, kind: e.type === "point" ? "point" : "curve", d };
    }
    return best;
  }

  /** Snap the cursor to existing points / curves / axis alignment. */
  private snap(uv: Vec2, exclude: Set<string> = new Set(), from?: Vec2): Snap {
    const sk = this.sk;
    const pts = pointMap(sk);
    const tol = this.tol();
    let best: Snap | null = null;
    let bd = tol;
    for (const p of pts.values()) {
      if (exclude.has(p.id)) continue;
      const d = Math.hypot(p.x - uv[0], p.y - uv[1]);
      if (d < bd) (bd = d), (best = { uv: [p.x, p.y], pointId: p.id, label: "一致" });
    }
    if (best) return best;
    // midpoints of lines
    for (const e of sk.entities) {
      if (e.type !== "line" || exclude.has(e.id)) continue;
      const a = pts.get(e.p1)!, b = pts.get(e.p2)!;
      const m: Vec2 = [(a.x + b.x) / 2, (a.y + b.y) / 2];
      const d = Math.hypot(m[0] - uv[0], m[1] - uv[1]);
      if (d < bd * 0.8) (bd = d), (best = { uv: m, mid: e.id, label: "中点" });
    }
    if (best) return best;
    // on curve
    for (const e of sk.entities) {
      if (e.type === "point" || exclude.has(e.id)) continue;
      const proj = projectOnEntity(uv, e, pts);
      if (!proj) continue;
      const d = Math.hypot(proj[0] - uv[0], proj[1] - uv[1]);
      if (d < bd * 0.7) (bd = d), (best = { uv: proj, curveId: e.id, label: "曲線上" });
    }
    if (best) return best;
    // horizontal / vertical alignment with the previous point
    if (from) {
      const dx = uv[0] - from[0], dy = uv[1] - from[1];
      if (Math.abs(dy) < tol * 0.6 && Math.abs(dx) > tol) return { uv: [uv[0], from[1]], label: "水平" };
      if (Math.abs(dx) < tol * 0.6 && Math.abs(dy) > tol) return { uv: [from[0], uv[1]], label: "垂直" };
    }
    return { uv };
  }

  // ---------------------------------------------------------- tool switch ---

  setTool(t: SketchTool) {
    this.finishChain();
    this.tool = t;
    this.clicks = [];
    this.consPicks = [];
    this.pendingDim = null;
    this.chainStart = null;
    this.lastPointId = null;
    this.clearPreview();
    this.hideHud();
    this.cursor = t === "select" ? "default" : "crosshair";
    this.vp.renderer.domElement.style.cursor = this.cursor;
    this.vp.pickKinds = new Set(t === "project" ? ["edge"] : []);
    this.host.status(TOOL_PROMPTS[t] ?? "");
    this.host.toolChanged(t);
    // constraint tools act immediately on a matching selection (Inventor style)
    if (CONSTRAINT_TOOLS.includes(t as ConstraintType) && this.selected.size) {
      const ids = [...this.selected].filter((id) => this.sk.entities.some((e) => e.id === id));
      if (ids.length && this.tryConstraint(t as ConstraintType, ids, true)) {
        this.selected.clear();
        this.setTool("select");
      }
    }
    this.redraw();
  }

  escape(): boolean {
    if (this.editBox) {
      this.editBox.remove();
      this.editBox = null;
      return true;
    }
    if (this.tool !== "select") {
      if (this.clicks.length || this.pendingDim || this.consPicks.length) {
        this.finishChain();
        this.clicks = [];
        this.pendingDim = null;
        this.consPicks = [];
        this.chainStart = null;
        this.lastPointId = null;
        this.clearPreview();
        this.hideHud();
        this.host.status(TOOL_PROMPTS[this.tool] ?? "");
        return true;
      }
      this.setTool("select");
      return true;
    }
    if (this.selected.size) {
      this.selected.clear();
      this.host.selectionChanged();
      this.redraw();
      return true;
    }
    return false;
  }

  private finishChain() {
    this.chainStart = null;
    this.lastPointId = null;
  }

  // --------------------------------------------------------------- events ---

  onPointerDown(e: PointerEvent): boolean | void {
    if (e.button !== 0) return;
    const uv = this.uvOf(e);
    if (!uv) return;
    if (this.tool === "select") {
      const hit = this.hitTest(uv);
      if (!hit) {
        if (!e.shiftKey && !e.ctrlKey) this.selected.clear();
        this.host.selectionChanged();
        this.redraw();
        return;
      }
      if (e.shiftKey || e.ctrlKey) this.toggleSel(hit.id);
      else if (!this.selected.has(hit.id)) this.selected = new Set([hit.id]);
      this.host.selectionChanged();
      // start drag
      const sk = this.sk;
      const ent = sk.entities.find((x) => x.id === hit.id)!;
      const pids = entityPoints(ent);
      const pts = pointMap(sk);
      const orig = new Map<string, Vec2>();
      for (const id of pids) {
        const p = pts.get(id);
        if (p && !p.fixed && !p.ref) orig.set(id, [p.x, p.y]);
      }
      if (ent.type === "circle") orig.set(ent.id + ":r", [ent.r, 0]);
      if (orig.size) this.drag = { ids: pids, start: uv, orig, snap: this.store.snapshot(), moved: false };
      this.redraw();
      return;
    }
    this.handleToolClick(uv, e);
  }

  onPointerMove(e: PointerEvent) {
    const uv = this.uvOf(e);
    if (!uv) return;
    this.cursorUV = uv;
    if (this.dimDrag) {
      const d = this.sk.dimensions.find((x) => x.id === this.dimDrag!.id);
      if (d) {
        d.pos = uv;
        this.redraw();
      }
      return;
    }
    if (this.drag) {
      this.dragTo(uv, e);
      return;
    }
    if (this.tool === "select" || CONSTRAINT_TOOLS.includes(this.tool as ConstraintType) || this.tool === "dimension" || this.tool === "trim") {
      const hit = this.hitTest(uv, this.tool === "trim" ? (x) => x.type !== "point" : undefined);
      const id = hit?.id ?? null;
      if (id !== this.hoverId) {
        this.hoverId = id;
        this.redraw();
      }
    }
    if (this.tool === "project") {
      this.vp.setHover(this.vp.pick(e, new Set(["edge"])));
    }
    this.updatePreview(uv);
  }

  onPointerUp(e: PointerEvent) {
    if (this.dimDrag) {
      const id = this.dimDrag.id;
      this.dimDrag = null;
      const d = this.sk.dimensions.find((x) => x.id === id);
      if (d) {
        const pos = d.pos;
        this.commit("寸法を移動", (sk) => {
          const dd = sk.dimensions.find((x) => x.id === id);
          if (dd) dd.pos = pos;
        });
      }
      return;
    }
    if (this.drag) {
      const drag = this.drag;
      this.drag = null;
      if (drag.moved) {
        const cur = this.store.snapshot();
        this.store.restore(drag.snap, "drag-restore");
        this.store.pushHistory(drag.snap);
        this.store.restore(cur, "スケッチをドラッグ");
      }
    }
    void e;
  }

  onDblClick(e: MouseEvent) {
    if (this.tool !== "select") return;
    const uv = this.uvOf(e);
    if (!uv) return;
    const hit = this.hitTest(uv);
    if (!hit) return;
    // double-click a curve: add a dimension right away
    this.tool = "dimension";
    this.dimensionPick(hit.id, uv);
  }

  onContextMenu(): boolean {
    return false;
  }

  private dragTo(uv: Vec2, e: PointerEvent) {
    const drag = this.drag!;
    const dx = uv[0] - drag.start[0], dy = uv[1] - drag.start[1];
    if (!drag.moved && Math.hypot(dx, dy) < this.vp.pixelSize * 3) return;
    drag.moved = true;
    const sk = this.sk;
    const pts = pointMap(sk);
    const hold = new Set<string>();
    for (const [id, o] of drag.orig) {
      if (id.endsWith(":r")) {
        const circ = sk.entities.find((x) => x.id === id.slice(0, -2)) as SkCircle;
        const c = pts.get(circ.c)!;
        circ.r = Math.max(1e-3, Math.hypot(uv[0] - c.x, uv[1] - c.y));
        continue;
      }
      const p = pts.get(id)!;
      p.x = o[0] + dx;
      p.y = o[1] + dy;
      hold.add(id);
    }
    // a circle dragged on its rim changes radius only
    if ([...drag.orig.keys()].some((k) => k.endsWith(":r"))) hold.clear();
    let res = solveSketch(sk, this.values(), hold);
    if (!res.ok) res = solveSketch(sk, this.values());
    this.dof = res.dof;
    this.redraw();
    void e;
  }

  // -------------------------------------------------------- tool clicking ---

  private handleToolClick(uv: Vec2, e: PointerEvent) {
    const t = this.tool;
    if (t === "dimension") {
      if (this.pendingDim) {
        this.placeDimension(uv);
        return;
      }
      const hit = this.hitTest(uv);
      if (!hit) return;
      this.dimensionPick(hit.id, uv);
      return;
    }
    if (CONSTRAINT_TOOLS.includes(t as ConstraintType)) {
      const hit = this.hitTest(uv);
      if (!hit) return;
      this.consPicks.push(hit.id);
      this.selected = new Set(this.consPicks);
      const r = this.tryConstraint(t as ConstraintType, this.consPicks, false);
      if (r === true || r === "invalid") {
        this.consPicks = [];
        this.selected.clear();
      }
      this.redraw();
      return;
    }
    if (t === "project") {
      const p = this.vp.pick(e, new Set(["edge"]));
      if (p) this.projectEdge(p.body, p.index);
      return;
    }
    if (t === "trim") {
      const hit = this.hitTest(uv, (x) => x.type !== "point");
      if (hit) this.trimAt(hit.id, uv);
      return;
    }
    const prev = this.clicks[this.clicks.length - 1]?.uv;
    const s = this.snap(uv, new Set(), prev ?? (this.lastPointId ? ptUV(this.sk, this.lastPointId) : undefined));
    this.clicks.push(s);
    switch (t) {
      case "point":
        this.createPoint(s);
        this.clicks = [];
        break;
      case "line":
        if (this.lastPointId) {
          this.createLineFrom(this.lastPointId, s);
          this.clicks = [];
        } else if (this.clicks.length === 1) {
          this.host.status("線分の終点をクリック (Esc で終了)");
          this.showHud("長さ");
        } else {
          let start = "";
          const first = this.clicks[0];
          this.commit("点", (sk) => (start = this.pointFor(sk, first)));
          this.chainStart = start;
          this.createLineFrom(start, s);
          this.clicks = [];
        }
        break;
      case "circle":
        if (this.clicks.length === 2) {
          const [c, r] = this.clicks;
          this.createCircle(c, Math.hypot(r.uv[0] - c.uv[0], r.uv[1] - c.uv[1]));
          this.clicks = [];
          this.hideHud();
        } else {
          this.host.status("円周上の点をクリック (数値入力で直径を指定)");
          this.showHud("直径");
        }
        break;
      case "arc":
        if (this.clicks.length === 1) this.host.status("円弧の終点をクリック");
        else if (this.clicks.length === 2) this.host.status("円弧上の通過点をクリック");
        else {
          this.createArc3(this.clicks[0], this.clicks[1], this.clicks[2]);
          this.clicks = [];
        }
        break;
      case "rect":
        if (this.clicks.length === 2) {
          this.createRect(this.clicks[0], this.clicks[1]);
          this.clicks = [];
          this.hideHud();
        } else {
          this.host.status("反対側のコーナーをクリック (数値入力: 幅 Tab 高さ)");
          this.showHud("幅, 高さ");
        }
        break;
      case "polygon":
        if (this.clicks.length === 2) {
          this.createPolygon(this.clicks[0], this.clicks[1]);
          this.clicks = [];
          this.hideHud();
        } else {
          this.host.status(`頂点の位置をクリック (辺の数: ${this.polygonSides} — 数値入力で変更)`);
          this.showHud("辺の数");
        }
        break;
      case "slot":
        if (this.clicks.length === 1) this.host.status("2 つ目の中心をクリック");
        else if (this.clicks.length === 2) this.host.status("長円の幅を指定するクリック");
        else {
          this.createSlot(this.clicks[0], this.clicks[1], this.clicks[2]);
          this.clicks = [];
        }
        break;
    }
    this.updatePreview(uv);
  }

  // ------------------------------------------------------------- creation ---

  /** Returns id of a point at the snap (reusing snapped points). Mutates sk. */
  private pointFor(sk: SketchFeature, s: Snap, construction = false): string {
    if (s.pointId) return s.pointId;
    const id = uid("p");
    sk.entities.push({ id, type: "point", x: s.uv[0], y: s.uv[1], construction });
    if (s.mid) sk.constraints.push({ id: uid("c"), type: "midpoint", refs: [id, s.mid] });
    else if (s.curveId) sk.constraints.push({ id: uid("c"), type: "pointOnCurve", refs: [id, s.curveId] });
    return id;
  }

  private createPoint(s: Snap) {
    this.commit("点", (sk) => {
      const id = uid("p");
      sk.entities.push({ id, type: "point", x: s.uv[0], y: s.uv[1] });
      if (s.pointId) sk.constraints.push({ id: uid("c"), type: "coincident", refs: [id, s.pointId] });
      else if (s.curveId) sk.constraints.push({ id: uid("c"), type: "pointOnCurve", refs: [id, s.curveId] });
    });
  }

  private createLineFrom(fromId: string, s: Snap, length?: number) {
    let endId = "";
    this.commit("線分", (sk) => {
      const a = sk.entities.find((x) => x.id === fromId) as SkPoint;
      let target = s;
      if (length !== undefined) {
        const dx = s.uv[0] - a.x, dy = s.uv[1] - a.y;
        const l = Math.hypot(dx, dy) || 1;
        target = { uv: [a.x + (dx / l) * length, a.y + (dy / l) * length] };
      }
      if (target.pointId === fromId) return;
      endId = this.pointFor(sk, target);
      const lid = uid("l");
      sk.entities.push({ id: lid, type: "line", p1: fromId, p2: endId });
      const b = sk.entities.find((x) => x.id === endId) as SkPoint;
      const dx = b.x - a.x, dy = b.y - a.y;
      const ang = Math.abs(Math.atan2(dy, dx) * (180 / Math.PI));
      if (Math.abs(dy) < 1e-9 || ang < 2 || ang > 178) sk.constraints.push({ id: uid("c"), type: "horizontal", refs: [lid] });
      else if (Math.abs(dx) < 1e-9 || Math.abs(ang - 90) < 2) sk.constraints.push({ id: uid("c"), type: "vertical", refs: [lid] });
      if (length !== undefined) this.addDimRecord(sk, "length", [lid], String(formatNumber(length, 4)), [(a.x + b.x) / 2 - dy * 0.15, (a.y + b.y) / 2 + dx * 0.15]);
    });
    if (!endId) return;
    // close the loop: end chain when returning to the start point
    if (endId === this.chainStart) {
      this.finishChain();
      this.host.status(TOOL_PROMPTS.line);
      this.hideHud();
    } else {
      this.lastPointId = endId;
      this.hudInput.value = "";
    }
  }

  private createCircle(c: Snap, r: number, diameterExpr?: string) {
    if (r < 1e-6) return;
    this.commit("円", (sk) => {
      const cid = this.pointFor(sk, c);
      const id = uid("ci");
      sk.entities.push({ id, type: "circle", c: cid, r });
      if (diameterExpr) this.addDimRecord(sk, "diameter", [id], diameterExpr, [c.uv[0] + r * 0.9, c.uv[1] + r * 0.9]);
    });
  }

  private createArc3(a: Snap, b: Snap, m: Snap) {
    const cc = circumcenter(a.uv, m.uv, b.uv);
    if (!cc) return;
    this.commit("円弧", (sk) => {
      const pa = this.pointFor(sk, a);
      const pb = this.pointFor(sk, b);
      const c = uid("p");
      sk.entities.push({ id: c, type: "point", x: cc[0], y: cc[1] });
      // orientation: is m on the CCW path from a to b?
      const ang = (p: Vec2) => Math.atan2(p[1] - cc[1], p[0] - cc[0]);
      const norm = (x: number) => ((x % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      const ccw = norm(ang(m.uv) - ang(a.uv)) < norm(ang(b.uv) - ang(a.uv));
      sk.entities.push({ id: uid("a"), type: "arc", c, p1: ccw ? pa : pb, p2: ccw ? pb : pa });
    });
  }

  private createRect(a: Snap, b: Snap, dims?: [string, string]) {
    if (Math.abs(a.uv[0] - b.uv[0]) < 1e-6 || Math.abs(a.uv[1] - b.uv[1]) < 1e-6) return;
    this.commit("長方形", (sk) => {
      const p1 = this.pointFor(sk, a);
      const p3 = this.pointFor(sk, b);
      const p2 = uid("p"), p4 = uid("p");
      sk.entities.push({ id: p2, type: "point", x: b.uv[0], y: a.uv[1] }, { id: p4, type: "point", x: a.uv[0], y: b.uv[1] });
      const L = [uid("l"), uid("l"), uid("l"), uid("l")];
      sk.entities.push(
        { id: L[0], type: "line", p1, p2 },
        { id: L[1], type: "line", p1: p2, p2: p3 },
        { id: L[2], type: "line", p1: p3, p2: p4 },
        { id: L[3], type: "line", p1: p4, p2: p1 },
      );
      sk.constraints.push(
        { id: uid("c"), type: "horizontal", refs: [L[0]] },
        { id: uid("c"), type: "vertical", refs: [L[1]] },
        { id: uid("c"), type: "horizontal", refs: [L[2]] },
        { id: uid("c"), type: "vertical", refs: [L[3]] },
      );
      if (dims) {
        const pad = this.vp.pixelSize * 28;
        const yb = Math.min(a.uv[1], b.uv[1]) - pad, xl = Math.min(a.uv[0], b.uv[0]) - pad;
        this.addDimRecord(sk, "length", [L[0]], dims[0], [(a.uv[0] + b.uv[0]) / 2, yb]);
        this.addDimRecord(sk, "length", [L[3]], dims[1], [xl, (a.uv[1] + b.uv[1]) / 2]);
      }
    });
  }

  private createPolygon(c: Snap, v: Snap) {
    const n = Math.max(3, Math.min(64, this.polygonSides));
    const r = Math.hypot(v.uv[0] - c.uv[0], v.uv[1] - c.uv[1]);
    if (r < 1e-6) return;
    const a0 = Math.atan2(v.uv[1] - c.uv[1], v.uv[0] - c.uv[0]);
    this.commit("ポリゴン", (sk) => {
      const cid = this.pointFor(sk, c);
      const circ = uid("ci");
      sk.entities.push({ id: circ, type: "circle", c: cid, r, construction: true });
      const ids: string[] = [];
      for (let i = 0; i < n; i++) {
        const t = a0 + (i * 2 * Math.PI) / n;
        const id = uid("p");
        sk.entities.push({ id, type: "point", x: c.uv[0] + r * Math.cos(t), y: c.uv[1] + r * Math.sin(t) });
        sk.constraints.push({ id: uid("c"), type: "pointOnCurve", refs: [id, circ] });
        ids.push(id);
      }
      const lines: string[] = [];
      for (let i = 0; i < n; i++) {
        const id = uid("l");
        sk.entities.push({ id, type: "line", p1: ids[i], p2: ids[(i + 1) % n] });
        lines.push(id);
      }
      for (let i = 1; i < n; i++) sk.constraints.push({ id: uid("c"), type: "equal", refs: [lines[0], lines[i]] });
    });
  }

  private createSlot(c1: Snap, c2: Snap, w: Snap) {
    const [x1, y1] = c1.uv, [x2, y2] = c2.uv;
    const L = Math.hypot(x2 - x1, y2 - y1);
    if (L < 1e-6) return;
    const ux = (x2 - x1) / L, uy = (y2 - y1) / L;
    const nx = -uy, ny = ux;
    const r = Math.max(1e-3, Math.abs((w.uv[0] - x1) * nx + (w.uv[1] - y1) * ny));
    this.commit("長円", (sk) => {
      const a = this.pointFor(sk, c1);
      const b = this.pointFor(sk, c2);
      const P = (x: number, y: number) => {
        const id = uid("p");
        sk.entities.push({ id, type: "point", x, y });
        return id;
      };
      const q1 = P(x1 + nx * r, y1 + ny * r), q2 = P(x2 + nx * r, y2 + ny * r), q3 = P(x2 - nx * r, y2 - ny * r), q4 = P(x1 - nx * r, y1 - ny * r);
      const l1 = uid("l"), l2 = uid("l"), a1 = uid("a"), a2 = uid("a"), cl = uid("l");
      sk.entities.push(
        { id: cl, type: "line", p1: a, p2: b, construction: true },
        { id: l1, type: "line", p1: q4, p2: q3 },
        { id: a2, type: "arc", c: b, p1: q3, p2: q2 },
        { id: l2, type: "line", p1: q2, p2: q1 },
        { id: a1, type: "arc", c: a, p1: q1, p2: q4 },
      );
      sk.constraints.push(
        { id: uid("c"), type: "tangent", refs: [l1, a1] },
        { id: uid("c"), type: "tangent", refs: [l1, a2] },
        { id: uid("c"), type: "tangent", refs: [l2, a1] },
        { id: uid("c"), type: "tangent", refs: [l2, a2] },
        { id: uid("c"), type: "equal", refs: [a1, a2] },
        { id: uid("c"), type: "parallel", refs: [l1, cl] },
      );
    });
  }

  // ------------------------------------------------------------ preview ---

  private clearPreview() {
    this.preview.traverse((o) => {
      (o as THREE.Mesh).geometry?.dispose?.();
    });
    this.preview.clear();
    this.snapMarker.visible = false;
    this.vp.invalidate();
  }

  private updatePreview(uv: Vec2) {
    this.clearPreview();
    const sk = this.sk;
    const t = this.tool;
    const drawing = ["line", "circle", "arc", "rect", "polygon", "slot", "point"].includes(t);
    if (!drawing && !this.pendingDim) return;
    const from = this.lastPointId ? ptUV(sk, this.lastPointId) : this.clicks[this.clicks.length - 1]?.uv;
    const s = drawing ? this.snap(uv, new Set(), from) : { uv };
    if (s.pointId || s.curveId || s.label) {
      const w = planeToWorld(sk.plane, s.uv);
      (this.snapMarker.geometry.getAttribute("position") as THREE.BufferAttribute).setXYZ(0, ...w);
      this.snapMarker.geometry.getAttribute("position").needsUpdate = true;
      this.snapMarker.visible = true;
      (this.snapMarker.material as THREE.PointsMaterial).color.set(s.pointId ? "#16a34a" : "#f59e0b");
    }
    const lines: Vec2[][] = [];
    const p = s.uv;
    let hudText = "";
    if (t === "line" && from) {
      lines.push([from, p]);
      const len = Math.hypot(p[0] - from[0], p[1] - from[1]);
      const ang = (Math.atan2(p[1] - from[1], p[0] - from[0]) * 180) / Math.PI;
      hudText = `${formatNumber(len, 2)} mm  ∠${formatNumber(ang, 1)}°`;
    }
    if (t === "circle" && this.clicks.length === 1) {
      const c = this.clicks[0].uv;
      const r = Math.hypot(p[0] - c[0], p[1] - c[1]);
      lines.push(circlePts(c, r));
      hudText = `⌀${formatNumber(2 * r, 2)} mm`;
    }
    if (t === "arc") {
      if (this.clicks.length === 1) lines.push([this.clicks[0].uv, p]);
      if (this.clicks.length === 2) {
        const cc = circumcenter(this.clicks[0].uv, p, this.clicks[1].uv);
        if (cc) lines.push(arcPts(cc, this.clicks[0].uv, this.clicks[1].uv, p));
      }
    }
    if (t === "rect" && this.clicks.length === 1) {
      const a = this.clicks[0].uv;
      lines.push([a, [p[0], a[1]], p, [a[0], p[1]], a]);
      hudText = `${formatNumber(Math.abs(p[0] - a[0]), 2)} × ${formatNumber(Math.abs(p[1] - a[1]), 2)} mm`;
    }
    if (t === "polygon" && this.clicks.length === 1) {
      const c = this.clicks[0].uv;
      const r = Math.hypot(p[0] - c[0], p[1] - c[1]);
      const a0 = Math.atan2(p[1] - c[1], p[0] - c[0]);
      const n = this.polygonSides;
      const poly: Vec2[] = [];
      for (let i = 0; i <= n; i++) poly.push([c[0] + r * Math.cos(a0 + (i * 2 * Math.PI) / n), c[1] + r * Math.sin(a0 + (i * 2 * Math.PI) / n)]);
      lines.push(poly, circlePts(c, r));
      hudText = `${n} 辺`;
    }
    if (t === "slot" && this.clicks.length >= 1) {
      const c1 = this.clicks[0].uv;
      if (this.clicks.length === 1) lines.push([c1, p]);
      else {
        const c2 = this.clicks[1].uv;
        const L = Math.hypot(c2[0] - c1[0], c2[1] - c1[1]) || 1;
        const n: Vec2 = [-(c2[1] - c1[1]) / L, (c2[0] - c1[0]) / L];
        const r = Math.abs((p[0] - c1[0]) * n[0] + (p[1] - c1[1]) * n[1]);
        const poly: Vec2[] = [];
        const a0 = Math.atan2(n[1], n[0]);
        for (let i = 0; i <= 24; i++) {
          const t2 = a0 + (Math.PI * i) / 24;
          poly.push([c1[0] + r * Math.cos(t2), c1[1] + r * Math.sin(t2)]);
        }
        for (let i = 0; i <= 24; i++) {
          const t2 = a0 + Math.PI + (Math.PI * i) / 24;
          poly.push([c2[0] + r * Math.cos(t2), c2[1] + r * Math.sin(t2)]);
        }
        poly.push(poly[0]);
        lines.push(poly);
      }
    }
    if (this.pendingDim) {
      const d: SkDimension = { id: "_", type: this.autoDimType(this.pendingDim, uv), refs: this.pendingDim.refs, param: "", pos: uv };
      const ents = new Map(sk.entities.map((x) => [x.id, x]));
      const v = measureDimension(d, ents);
      hudText = `${formatNumber(v, 2)}${d.type === "angle" ? "°" : " mm"}`;
      this.pendingDim.pos = uv;
    }
    for (const l of lines) {
      const g = new THREE.BufferGeometry().setFromPoints(l.map((q) => new THREE.Vector3(...planeToWorld(sk.plane, q))));
      const line = new THREE.Line(g, new THREE.LineDashedMaterial({ color: "#1565e0", dashSize: this.vp.pixelSize * 5, gapSize: this.vp.pixelSize * 3, depthTest: false }));
      line.computeLineDistances();
      line.renderOrder = 9;
      this.preview.add(line);
    }
    if (hudText && this.hud.style.display !== "none") this.hudLabel.textContent = hudText;
    if (this.hud.style.display !== "none") this.positionHud(s.uv);
    this.vp.invalidate();
  }

  // ----------------------------------------------------- dynamic input HUD ---

  private showHud(label: string) {
    this.hud.style.display = "flex";
    this.hudLabel.textContent = label;
    this.hudInput.placeholder = label;
    this.hudInput.value = "";
  }

  private hideHud() {
    this.hud.style.display = "none";
    if (document.activeElement === this.hudInput) this.hudInput.blur();
  }

  private positionHud(uv: Vec2) {
    const w = planeToWorld(this.sk.plane, uv);
    const s = this.vp.toScreen(new THREE.Vector3(...w));
    const r = this.vp.el.getBoundingClientRect();
    this.hud.style.left = `${s.x - r.left + 18}px`;
    this.hud.style.top = `${s.y - r.top + 18}px`;
  }

  /** Typing while a drawing tool is active goes to the HUD input. */
  captureKey(e: KeyboardEvent): boolean {
    if (this.hud.style.display === "none") return false;
    if (/^[0-9.\-+*/()a-zA-Z_ ]$/.test(e.key) && !e.ctrlKey && !e.metaKey) {
      if (document.activeElement !== this.hudInput) {
        this.hudInput.focus();
        this.hudInput.value = "";
      }
      return false; // let the input receive it
    }
    return false;
  }

  private onHudKey(e: KeyboardEvent) {
    e.stopPropagation();
    if (e.key === "Escape") {
      this.hudInput.blur();
      this.escape();
      return;
    }
    if (e.key === "Tab") {
      // Tab separates width / height (Inventor dynamic input)
      e.preventDefault();
      if (this.hudInput.value.trim() && !this.hudInput.value.includes(",")) this.hudInput.value = this.hudInput.value.trim() + ", ";
      return;
    }
    if (e.key !== "Enter") return;
    e.preventDefault();
    const raw = this.hudInput.value.trim();
    if (!raw) return;
    const values = this.values();
    const parts = raw.split(/[,;\t]| x /);
    try {
      const nums = parts.map((p) => evaluate(p, (n) => values.get(n)));
      const t = this.tool;
      const uv = this.cursorUV;
      if (t === "line" && this.lastPointId) {
        this.createLineFrom(this.lastPointId, { uv }, nums[0]);
      } else if (t === "line" && this.clicks.length === 1) {
        // first point was a click; create the start point then the line
        let start = "";
        this.commit("点", (sk) => (start = this.pointFor(sk, this.clicks[0])));
        this.chainStart = start;
        this.clicks = [];
        this.createLineFrom(start, { uv }, nums[0]);
      } else if (t === "circle" && this.clicks.length === 1) {
        this.createCircle(this.clicks[0], nums[0] / 2, parts[0].trim());
        this.clicks = [];
        this.hideHud();
      } else if (t === "rect" && this.clicks.length === 1) {
        const a = this.clicks[0].uv;
        const w = nums[0], h = nums[1] ?? nums[0];
        const sx = Math.sign(uv[0] - a[0]) || 1, sy = Math.sign(uv[1] - a[1]) || 1;
        this.createRect(this.clicks[0], { uv: [a[0] + sx * w, a[1] + sy * h] }, [parts[0].trim(), (parts[1] ?? parts[0]).trim()]);
        this.clicks = [];
        this.hideHud();
      } else if (t === "polygon") {
        this.polygonSides = Math.max(3, Math.min(64, Math.round(nums[0])));
        this.hudInput.value = "";
        this.updatePreview(uv);
      }
      this.hudInput.value = "";
      this.hudInput.blur();
    } catch (err) {
      this.host.toast((err as Error).message, "error");
    }
  }

  // ----------------------------------------------------------- dimensions ---

  private autoDimType(p: { type: DimensionType; refs: string[] }, pos: Vec2): DimensionType {
    if (p.type !== "distance") return p.type;
    const sk = this.sk;
    const ents = new Map(sk.entities.map((e) => [e.id, e]));
    const e0 = ents.get(p.refs[0]), e1 = p.refs[1] ? ents.get(p.refs[1]) : undefined;
    let A: Vec2 | null = null, B: Vec2 | null = null;
    const pts = pointMap(sk);
    const anchor = (e?: SkEntity): Vec2 | null =>
      !e ? null : e.type === "point" ? [e.x, e.y] : e.type === "circle" || e.type === "arc" ? [pts.get(e.c)!.x, pts.get(e.c)!.y] : null;
    if (e0?.type === "line" && !e1) {
      A = [pts.get(e0.p1)!.x, pts.get(e0.p1)!.y];
      B = [pts.get(e0.p2)!.x, pts.get(e0.p2)!.y];
    } else {
      A = anchor(e0);
      B = anchor(e1);
    }
    if (!A || !B) return "distance";
    const minX = Math.min(A[0], B[0]), maxX = Math.max(A[0], B[0]), minY = Math.min(A[1], B[1]), maxY = Math.max(A[1], B[1]);
    const inX = pos[0] > minX && pos[0] < maxX, inY = pos[1] > minY && pos[1] < maxY;
    if (inX && !inY) return "hdistance";
    if (inY && !inX) return "vdistance";
    return "distance";
  }

  private dimensionPick(id: string, uv: Vec2) {
    const sk = this.sk;
    const e = sk.entities.find((x) => x.id === id)!;
    if (!this.pendingDim && this.consPicks.length === 0) {
      if (e.type === "circle") {
        this.pendingDim = { type: "diameter", refs: [id], pos: uv };
      } else if (e.type === "arc") {
        this.pendingDim = { type: "radius", refs: [id], pos: uv };
      } else {
        // wait for a possible second pick; a line alone becomes a length
        this.consPicks = [id];
        this.selected = new Set([id]);
        if (e.type === "line") this.pendingDim = { type: "distance", refs: [id], pos: uv };
        this.host.status("寸法の位置をクリック、または 2 つ目のジオメトリを選択");
      }
      this.redraw();
      return;
    }
    // second pick
    const first = this.consPicks[0] ?? this.pendingDim?.refs[0];
    if (first && first !== id) {
      const e0 = sk.entities.find((x) => x.id === first)!;
      if (e0.type === "line" && e.type === "line") {
        const parallel = isParallel(sk, e0, e);
        this.pendingDim = { type: parallel ? "distance" : "angle", refs: [first, id], pos: uv };
      } else this.pendingDim = { type: "distance", refs: [first, id], pos: uv };
      this.consPicks = [];
      this.selected = new Set([first, id]);
      this.host.status("寸法の位置をクリック");
      this.redraw();
    }
  }

  private placeDimension(uv: Vec2) {
    const pd = this.pendingDim!;
    // a click on another entity while waiting = second reference
    const hit = this.hitTest(uv);
    if (hit && pd.refs.length === 1 && hit.id !== pd.refs[0] && this.sk.entities.find((e) => e.id === pd.refs[0])?.type !== "circle") {
      this.consPicks = [pd.refs[0]];
      this.dimensionPick(hit.id, uv);
      return;
    }
    const type = this.autoDimType(pd, uv);
    const sk = this.sk;
    const ents = new Map(sk.entities.map((x) => [x.id, x]));
    const value = measureDimension({ id: "_", type, refs: pd.refs, param: "", pos: uv }, ents);
    this.pendingDim = null;
    this.consPicks = [];
    this.selected.clear();
    if (!Number.isFinite(value)) return;
    let dimId = "";
    const snap = this.store.snapshot();
    this.commit("寸法", (s) => (dimId = this.addDimRecord(s, type, pd.refs, formatNumber(value, 3), uv)));
    // check over-constraint: if the solve fails, make it a driven dimension
    const res = solveSketch(this.sk, this.values());
    if (!res.ok) {
      this.store.restore(snap, "overconstrained");
      this.commit("従属寸法", (s) => {
        const id = this.addDimRecord(s, type, pd.refs, formatNumber(value, 3), uv);
        s.dimensions.find((d) => d.id === id)!.driven = true;
      });
      this.host.toast("この寸法を追加するとスケッチが過剰拘束になるため、従属寸法として配置しました", "warn");
    } else {
      // edit immediately (Inventor "Edit dimension when created")
      requestAnimationFrame(() => {
        const d = this.sk.dimensions.find((x) => x.id === dimId);
        const el = [...this.vp.labels.domElement.querySelectorAll<HTMLElement>(".dim-label")].pop();
        if (d && el) this.editDimension(d, el);
      });
    }
    this.host.status(TOOL_PROMPTS.dimension);
  }

  /** Adds a dimension + its model parameter. Returns dimension id. */
  private addDimRecord(sk: SketchFeature, type: DimensionType, refs: string[], expr: string, pos: Vec2): string {
    const name = this.store.addParam(this.store.doc, expr, type === "angle" ? "deg" : "mm", sk.id);
    const id = uid("d");
    sk.dimensions.push({ id, type, refs, param: name, pos });
    return id;
  }

  editDimension(d: SkDimension, anchor: HTMLElement) {
    if (d.driven) {
      this.host.toast("従属寸法は編集できません", "info");
      return;
    }
    this.editBox?.remove();
    const p = this.store.param(d.param);
    if (!p) return;
    const box = document.createElement("input");
    box.className = "dim-edit";
    box.value = p.expr;
    box.title = `${d.param} — 数値・式・パラメータ名を入力 (Enter で確定)`;
    const r = anchor.getBoundingClientRect();
    const vr = this.vp.el.getBoundingClientRect();
    box.style.left = `${r.left - vr.left - 10}px`;
    box.style.top = `${r.top - vr.top - 4}px`;
    const label = document.createElement("span");
    label.className = "dim-edit-name";
    label.textContent = d.param;
    this.vp.el.appendChild(box);
    this.editBox = box;
    box.focus();
    box.select();
    const close = () => {
      box.remove();
      if (this.editBox === box) this.editBox = null;
    };
    box.addEventListener("keydown", (e) => {
      e.stopPropagation();
      if (e.key === "Escape") close();
      if (e.key !== "Enter") return;
      const expr = box.value.trim();
      try {
        const values = this.values();
        const v = evaluate(expr, (n) => values.get(n));
        if (createsCycle(this.store.doc.params, d.param, expr)) throw new Error("循環参照になります");
        if (d.type !== "angle" && !(v > 0)) throw new Error("寸法値は正の数である必要があります");
        const snap = this.store.snapshot();
        this.store.mutate("寸法を編集", (doc) => {
          const pp = doc.params.find((x) => x.name === d.param);
          if (pp) pp.expr = expr;
        });
        const res = solveSketch(this.sk, this.values());
        if (!res.ok) {
          this.store.restore(snap, "dim-fail");
          throw new Error("この値ではスケッチを解けません");
        }
        close();
      } catch (err) {
        box.classList.add("error");
        this.host.toast((err as Error).message, "error");
      }
    });
    box.addEventListener("blur", () => setTimeout(close, 150));
  }

  // ---------------------------------------------------------- constraints ---

  /** Returns true when created, false when more picks are needed, "invalid" when the picks do not fit. */
  tryConstraint(type: ConstraintType, ids: string[], fromSelection: boolean): boolean | "invalid" {
    const sk = this.sk;
    const E = (id: string) => sk.entities.find((e) => e.id === id)!;
    const kinds = ids.map((id) => E(id)?.type);
    const isCurve = (k?: string) => k === "circle" || k === "arc";
    let refs: string[] | null = null;
    let need = 2;
    let ctype: ConstraintType = type;
    switch (type) {
      case "coincident":
        if (kinds.length >= 2) {
          if (kinds[0] === "point" && kinds[1] === "point") refs = [ids[0], ids[1]];
          else if (kinds[0] === "point") (refs = [ids[0], ids[1]]), (ctype = "pointOnCurve");
          else if (kinds[1] === "point") (refs = [ids[1], ids[0]]), (ctype = "pointOnCurve");
          else return "invalid";
        }
        break;
      case "horizontal":
      case "vertical":
        need = kinds[0] === "line" ? 1 : 2;
        if (kinds[0] === "line") refs = [ids[0]];
        else if (kinds.length >= 2 && kinds[0] === "point" && kinds[1] === "point") refs = [ids[0], ids[1]];
        else if (kinds.length >= 1 && kinds[0] !== "point") return "invalid";
        break;
      case "parallel":
      case "perpendicular":
      case "collinear":
        if (kinds.some((k) => k !== "line")) return "invalid";
        if (kinds.length >= 2) refs = [ids[0], ids[1]];
        break;
      case "tangent":
        if (kinds.length >= 2) {
          if ((kinds[0] === "line" && isCurve(kinds[1])) || (isCurve(kinds[0]) && (kinds[1] === "line" || isCurve(kinds[1])))) refs = [ids[0], ids[1]];
          else return "invalid";
        }
        break;
      case "equal":
        if (kinds.length >= 2) {
          if ((kinds[0] === "line" && kinds[1] === "line") || (isCurve(kinds[0]) && isCurve(kinds[1]))) refs = [ids[0], ids[1]];
          else return "invalid";
        }
        break;
      case "concentric":
        if (kinds.some((k) => !isCurve(k))) return "invalid";
        if (kinds.length >= 2) refs = [ids[0], ids[1]];
        break;
      case "midpoint":
        if (kinds.length >= 2) {
          if (kinds[0] === "point" && kinds[1] === "line") refs = [ids[0], ids[1]];
          else if (kinds[1] === "point" && kinds[0] === "line") refs = [ids[1], ids[0]];
          else return "invalid";
        }
        break;
      case "fix":
        need = 1;
        if (kinds[0] === "point") refs = [ids[0]];
        else if (kinds[0] === "line") {
          const l = E(ids[0]) as SkLine;
          this.addConstraintChecked([
            { id: uid("c"), type: "fix", refs: [l.p1] },
            { id: uid("c"), type: "fix", refs: [l.p2] },
          ]);
          return true;
        } else if (isCurve(kinds[0])) refs = [(E(ids[0]) as SkCircle | SkArc).c];
        break;
      case "symmetric":
        need = 3;
        if (kinds.length >= 3) {
          if (kinds[0] === "point" && kinds[1] === "point" && kinds[2] === "line") refs = [ids[0], ids[1], ids[2]];
          else if (kinds[0] === "line" && kinds[1] === "line" && kinds[2] === "line") {
            // two lines symmetric about a third: endpoints pairwise
            const a = E(ids[0]) as SkLine, b = E(ids[1]) as SkLine;
            this.addConstraintChecked([
              { id: uid("c"), type: "symmetric", refs: [a.p1, b.p1, ids[2]] },
              { id: uid("c"), type: "symmetric", refs: [a.p2, b.p2, ids[2]] },
            ]);
            return true;
          } else return "invalid";
        }
        break;
    }
    if (!refs) {
      if (fromSelection) return "invalid";
      if (ids.length >= need) return "invalid";
      return false;
    }
    this.addConstraintChecked([{ id: uid("c"), type: ctype, refs }]);
    return true;
  }

  private addConstraintChecked(cs: SkConstraint[]) {
    const snap = this.store.snapshot();
    this.commit("拘束", (sk) => sk.constraints.push(...cs));
    const res = solveSketch(this.sk, this.values());
    if (!res.ok) {
      this.store.restore(snap, "constraint-fail");
      this.host.toast("この拘束を追加するとスケッチが過剰拘束になる、または矛盾します", "warn");
    }
  }

  // ------------------------------------------------------------- editing ---

  deleteSelection(): boolean {
    if (!this.selected.size) return false;
    const sel = new Set(this.selected);
    this.commit("削除", (sk) => deleteFromSketch(sk, sel, this.store.doc.params));
    // remove parameters of deleted dimensions
    this.store.patch((doc) => {
      const used = new Set(doc.features.flatMap((f) => (f.type === "sketch" ? f.dimensions.map((d) => d.param) : [])));
      doc.params = doc.params.filter((p) => !(p.owner === this.sketchId && !used.has(p.name)));
    }, "params-clean");
    this.selected.clear();
    this.host.selectionChanged();
    return true;
  }

  toggleConstruction() {
    const sel = [...this.selected];
    if (!sel.length) {
      this.host.toast("コンストラクションに切り替えるジオメトリを選択してください", "info");
      return;
    }
    this.commit("コンストラクション", (sk) => {
      for (const e of sk.entities) if (sel.includes(e.id) && !e.ref) e.construction = !e.construction;
    });
  }

  private projectEdge(body: number, index: number) {
    const info = this.host.modelEdge({ body, index });
    if (!info) return;
    const sk = this.sk;
    const uvs = info.points.map((p) => worldToPlane(sk.plane, p));
    this.commit("ジオメトリを投影", (s) => {
      const P = (uv: Vec2) => {
        // reuse coincident reference points
        const ex = s.entities.find((e) => e.type === "point" && e.ref && Math.hypot(e.x - uv[0], e.y - uv[1]) < 1e-6);
        if (ex) return ex.id;
        const id = uid("p");
        s.entities.push({ id, type: "point", x: uv[0], y: uv[1], ref: true, fixed: true });
        return id;
      };
      if (info.type === "LINE") {
        const a = worldToPlane(sk.plane, info.a), b = worldToPlane(sk.plane, info.b);
        if (Math.hypot(a[0] - b[0], a[1] - b[1]) < 1e-6) return;
        s.entities.push({ id: uid("l"), type: "line", p1: P(a), p2: P(b), ref: true });
      } else if (info.type === "CIRCLE" && uvs.length >= 3) {
        const a = uvs[0], m = uvs[Math.floor(uvs.length / 3)], b = uvs[Math.floor((2 * uvs.length) / 3)];
        const cc = circumcenter(a, m, b);
        if (!cc) return;
        const r = Math.hypot(a[0] - cc[0], a[1] - cc[1]);
        const closed = Math.hypot(uvs[0][0] - uvs[uvs.length - 1][0], uvs[0][1] - uvs[uvs.length - 1][1]) < 1e-4;
        if (closed) s.entities.push({ id: uid("ci"), type: "circle", c: P(cc), r, ref: true });
        else {
          const start = uvs[0], end = uvs[uvs.length - 1], mid = uvs[Math.floor(uvs.length / 2)];
          const ang = (p: Vec2) => Math.atan2(p[1] - cc[1], p[0] - cc[0]);
          const norm = (x: number) => ((x % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
          const ccw = norm(ang(mid) - ang(start)) < norm(ang(end) - ang(start));
          s.entities.push({ id: uid("a"), type: "arc", c: P(cc), p1: P(ccw ? start : end), p2: P(ccw ? end : start), ref: true });
        }
      } else {
        // generic curve: polyline approximation
        for (let i = 0; i + 1 < uvs.length; i += Math.max(1, Math.floor(uvs.length / 24))) {
          const j = Math.min(uvs.length - 1, i + Math.max(1, Math.floor(uvs.length / 24)));
          s.entities.push({ id: uid("l"), type: "line", p1: P(uvs[i]), p2: P(uvs[j]), ref: true });
        }
      }
    });
  }

  /** Trim the clicked portion of a line or circle between its nearest intersections. */
  private trimAt(id: string, uv: Vec2) {
    const sk = this.sk;
    const pts = pointMap(sk);
    const e = sk.entities.find((x) => x.id === id)!;
    const others = sk.entities.filter((x) => x.id !== id && x.type !== "point" && !x.construction);
    if (e.type === "line") {
      const a = pts.get(e.p1)!, b = pts.get(e.p2)!;
      const A: Vec2 = [a.x, a.y], B: Vec2 = [b.x, b.y];
      const dx = B[0] - A[0], dy = B[1] - A[1];
      const L2 = dx * dx + dy * dy;
      const tc = ((uv[0] - A[0]) * dx + (uv[1] - A[1]) * dy) / L2;
      const ts: number[] = [];
      for (const o of others) for (const p of intersectEntity(A, B, o, pts)) ts.push(((p[0] - A[0]) * dx + (p[1] - A[1]) * dy) / L2);
      const inner = ts.filter((t) => t > 1e-6 && t < 1 - 1e-6);
      const lo = Math.max(0, ...inner.filter((t) => t < tc));
      const hi = Math.min(1, ...inner.filter((t) => t > tc));
      this.commit("トリム", (s) => {
        const pieces: [number, number][] = [];
        if (lo > 1e-6) pieces.push([0, lo]);
        if (hi < 1 - 1e-6) pieces.push([hi, 1]);
        const keepIds = new Set<string>();
        const P = (t: number) => {
          if (t <= 1e-9) return e.p1;
          if (t >= 1 - 1e-9) return e.p2;
          const id2 = uid("p");
          s.entities.push({ id: id2, type: "point", x: A[0] + dx * t, y: A[1] + dy * t });
          return id2;
        };
        for (const [t0, t1] of pieces) {
          const lid = uid("l");
          s.entities.push({ id: lid, type: "line", p1: P(t0), p2: P(t1) });
          keepIds.add(lid);
        }
        // preserve orientation constraints on the remaining pieces
        const orient = s.constraints.filter((c) => (c.type === "horizontal" || c.type === "vertical") && c.refs[0] === id);
        for (const k of keepIds) for (const c of orient) s.constraints.push({ id: uid("c"), type: c.type, refs: [k] });
        deleteFromSketch(s, new Set([id]), this.store.doc.params);
      });
    } else if (e.type === "circle" || e.type === "arc") {
      const c = pts.get(e.c)!;
      const C: Vec2 = [c.x, c.y];
      const r = e.type === "circle" ? e.r : Math.hypot(pts.get(e.p1)!.x - c.x, pts.get(e.p1)!.y - c.y);
      const ang = (p: Vec2) => Math.atan2(p[1] - C[1], p[0] - C[0]);
      const t0 = e.type === "arc" ? ang([pts.get(e.p1)!.x, pts.get(e.p1)!.y]) : 0;
      const norm = (x: number) => ((x - t0) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
      const span = e.type === "arc" ? norm(ang([pts.get(e.p2)!.x, pts.get(e.p2)!.y])) || 2 * Math.PI : 2 * Math.PI;
      const cuts: number[] = [];
      for (const o of others) for (const p of intersectCircle(C, r, o, pts)) cuts.push(norm(ang(p)));
      const tc = norm(ang(uv));
      const inner = cuts.filter((t) => t > 1e-6 && t < span - 1e-6).sort((a, b) => a - b);
      if (e.type === "circle" && inner.length < 2) {
        this.host.toast("トリムするには 2 つ以上の交点が必要です", "info");
        return;
      }
      let lo: number, hi: number;
      if (e.type === "circle") {
        // the remaining arc goes from hi to lo (CCW) around the clicked gap
        const before = inner.filter((t) => t < tc), after = inner.filter((t) => t > tc);
        lo = before.length ? before[before.length - 1] : inner[inner.length - 1] - 2 * Math.PI;
        hi = after.length ? after[0] : inner[0] + 2 * Math.PI;
      } else {
        lo = Math.max(0, ...inner.filter((t) => t < tc));
        hi = Math.min(span, ...inner.filter((t) => t > tc));
      }
      this.commit("トリム", (s) => {
        const P = (t: number) => {
          const id2 = uid("p");
          s.entities.push({ id: id2, type: "point", x: C[0] + r * Math.cos(t0 + t), y: C[1] + r * Math.sin(t0 + t) });
          return id2;
        };
        if (e.type === "circle") {
          s.entities.push({ id: uid("a"), type: "arc", c: e.c, p1: P(hi), p2: P(lo + 2 * Math.PI) });
        } else {
          if (lo > 1e-6) s.entities.push({ id: uid("a"), type: "arc", c: e.c, p1: e.p1, p2: P(lo) });
          if (hi < span - 1e-6) s.entities.push({ id: uid("a"), type: "arc", c: e.c, p1: P(hi), p2: e.p2 });
        }
        deleteFromSketch(s, new Set([id]), this.store.doc.params, new Set([e.c, ...(e.type === "arc" ? [e.p1, e.p2] : [])]));
      });
    }
  }
}

// ------------------------------------------------------------- utilities ---

function entityPoints(e: SkEntity): string[] {
  if (e.type === "point") return [e.id];
  if (e.type === "line") return [e.p1, e.p2];
  if (e.type === "circle") return [e.c];
  return [e.c, e.p1, e.p2];
}

function ptUV(sk: SketchFeature, id: string): Vec2 | undefined {
  const p = sk.entities.find((e) => e.id === id) as SkPoint | undefined;
  return p ? [p.x, p.y] : undefined;
}

export function deleteFromSketch(sk: SketchFeature, ids: Set<string>, _params: unknown, keepPoints: Set<string> = new Set()) {
  void _params;
  // delete curves and the points only they used
  const del = new Set(ids);
  for (const e of sk.entities) if (del.has(e.id) && e.type === "point" && e.fixed && !e.ref) del.delete(e.id); // origin
  const removedCurves = sk.entities.filter((e) => del.has(e.id) && e.type !== "point");
  const usage = new Map<string, number>();
  for (const e of sk.entities) {
    if (del.has(e.id)) continue;
    for (const p of entityPoints(e)) if (e.type !== "point") usage.set(p, (usage.get(p) ?? 0) + 1);
  }
  for (const c of removedCurves)
    for (const p of entityPoints(c)) {
      const pe = sk.entities.find((x) => x.id === p) as SkPoint | undefined;
      if (!usage.get(p) && !keepPoints.has(p) && pe && !(pe.fixed && !pe.ref)) del.add(p);
    }
  // deleting a point used by a curve deletes that curve
  for (const e of sk.entities) if (e.type !== "point" && entityPoints(e).some((p) => del.has(p))) del.add(e.id);
  sk.entities = sk.entities.filter((e) => !del.has(e.id));
  sk.constraints = sk.constraints.filter((c) => !del.has(c.id) && !c.refs.some((r) => del.has(r)));
  sk.dimensions = sk.dimensions.filter((d) => !del.has(d.id) && !d.refs.some((r) => del.has(r)));
}

function distToPolyline(p: Vec2, poly: Vec2[]): number {
  let best = Infinity;
  for (let i = 0; i + 1 < poly.length; i++) {
    const a = poly[i], b = poly[i + 1];
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const l2 = dx * dx + dy * dy;
    let t = l2 ? ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2 : 0;
    t = Math.max(0, Math.min(1, t));
    best = Math.min(best, Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy));
  }
  return best;
}

function projectOnEntity(p: Vec2, e: SkEntity, pts: Map<string, SkPoint>): Vec2 | null {
  if (e.type === "line") {
    const a = pts.get(e.p1)!, b = pts.get(e.p2)!;
    const dx = b.x - a.x, dy = b.y - a.y;
    const l2 = dx * dx + dy * dy;
    if (!l2) return null;
    const t = ((p[0] - a.x) * dx + (p[1] - a.y) * dy) / l2;
    if (t < 0 || t > 1) return null;
    return [a.x + t * dx, a.y + t * dy];
  }
  if (e.type === "circle" || e.type === "arc") {
    const c = pts.get(e.c)!;
    const r = e.type === "circle" ? e.r : Math.hypot(pts.get(e.p1)!.x - c.x, pts.get(e.p1)!.y - c.y);
    const d = Math.hypot(p[0] - c.x, p[1] - c.y) || 1;
    return [c.x + ((p[0] - c.x) / d) * r, c.y + ((p[1] - c.y) / d) * r];
  }
  return null;
}

export function circumcenter(a: Vec2, b: Vec2, c: Vec2): Vec2 | null {
  const d = 2 * (a[0] * (b[1] - c[1]) + b[0] * (c[1] - a[1]) + c[0] * (a[1] - b[1]));
  if (Math.abs(d) < 1e-12) return null;
  const a2 = a[0] ** 2 + a[1] ** 2, b2 = b[0] ** 2 + b[1] ** 2, c2 = c[0] ** 2 + c[1] ** 2;
  return [(a2 * (b[1] - c[1]) + b2 * (c[1] - a[1]) + c2 * (a[1] - b[1])) / d, (a2 * (c[0] - b[0]) + b2 * (a[0] - c[0]) + c2 * (b[0] - a[0])) / d];
}

function circlePts(c: Vec2, r: number): Vec2[] {
  const out: Vec2[] = [];
  for (let i = 0; i <= 64; i++) out.push([c[0] + r * Math.cos((i / 64) * Math.PI * 2), c[1] + r * Math.sin((i / 64) * Math.PI * 2)]);
  return out;
}

function arcPts(c: Vec2, a: Vec2, b: Vec2, m: Vec2): Vec2[] {
  const r = Math.hypot(a[0] - c[0], a[1] - c[1]);
  const ang = (p: Vec2) => Math.atan2(p[1] - c[1], p[0] - c[0]);
  const norm = (x: number) => ((x % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  const ccw = norm(ang(m) - ang(a)) < norm(ang(b) - ang(a));
  const s = ccw ? ang(a) : ang(b);
  const span = ccw ? norm(ang(b) - ang(a)) : norm(ang(a) - ang(b));
  const out: Vec2[] = [];
  for (let i = 0; i <= 48; i++) out.push([c[0] + r * Math.cos(s + (span * i) / 48), c[1] + r * Math.sin(s + (span * i) / 48)]);
  return out;
}

function isParallel(sk: SketchFeature, a: SkLine, b: SkLine): boolean {
  const pts = pointMap(sk);
  const da = [pts.get(a.p2)!.x - pts.get(a.p1)!.x, pts.get(a.p2)!.y - pts.get(a.p1)!.y];
  const db = [pts.get(b.p2)!.x - pts.get(b.p1)!.x, pts.get(b.p2)!.y - pts.get(b.p1)!.y];
  const cr = Math.abs(da[0] * db[1] - da[1] * db[0]) / (Math.hypot(da[0], da[1]) * Math.hypot(db[0], db[1]) || 1);
  return cr < 0.02;
}

function intersectEntity(A: Vec2, B: Vec2, o: SkEntity, pts: Map<string, SkPoint>): Vec2[] {
  if (o.type === "line") {
    const c = pts.get(o.p1)!, d = pts.get(o.p2)!;
    const den = (A[0] - B[0]) * (c.y - d.y) - (A[1] - B[1]) * (c.x - d.x);
    if (Math.abs(den) < 1e-12) return [];
    const t = ((A[0] - c.x) * (c.y - d.y) - (A[1] - c.y) * (c.x - d.x)) / den;
    const u = -((A[0] - B[0]) * (A[1] - c.y) - (A[1] - B[1]) * (A[0] - c.x)) / den;
    if (u < -1e-9 || u > 1 + 1e-9) return [];
    return [[A[0] + t * (B[0] - A[0]), A[1] + t * (B[1] - A[1])]];
  }
  if (o.type === "circle" || o.type === "arc") {
    const c = pts.get(o.c)!;
    const r = o.type === "circle" ? o.r : Math.hypot(pts.get(o.p1)!.x - c.x, pts.get(o.p1)!.y - c.y);
    const dx = B[0] - A[0], dy = B[1] - A[1];
    const fx = A[0] - c.x, fy = A[1] - c.y;
    const a = dx * dx + dy * dy, b = 2 * (fx * dx + fy * dy), cc = fx * fx + fy * fy - r * r;
    const disc = b * b - 4 * a * cc;
    if (disc < 0) return [];
    const s = Math.sqrt(disc);
    const res: Vec2[] = [];
    for (const t of [(-b - s) / (2 * a), (-b + s) / (2 * a)]) {
      const p: Vec2 = [A[0] + t * dx, A[1] + t * dy];
      if (o.type === "arc" && !onArc(p, o, pts)) continue;
      res.push(p);
    }
    return res;
  }
  return [];
}

function intersectCircle(C: Vec2, r: number, o: SkEntity, pts: Map<string, SkPoint>): Vec2[] {
  if (o.type === "line") {
    const a = pts.get(o.p1)!, b = pts.get(o.p2)!;
    const dx = b.x - a.x, dy = b.y - a.y;
    const fx = a.x - C[0], fy = a.y - C[1];
    const A = dx * dx + dy * dy, B = 2 * (fx * dx + fy * dy), CC = fx * fx + fy * fy - r * r;
    const disc = B * B - 4 * A * CC;
    if (disc < 0) return [];
    const s = Math.sqrt(disc);
    return [(-B - s) / (2 * A), (-B + s) / (2 * A)].filter((t) => t >= -1e-9 && t <= 1 + 1e-9).map((t) => [a.x + t * dx, a.y + t * dy] as Vec2);
  }
  if (o.type === "circle" || o.type === "arc") {
    const c = pts.get(o.c)!;
    const r1 = o.type === "circle" ? o.r : Math.hypot(pts.get(o.p1)!.x - c.x, pts.get(o.p1)!.y - c.y);
    const d = Math.hypot(c.x - C[0], c.y - C[1]);
    if (d < 1e-12 || d > r + r1 || d < Math.abs(r - r1)) return [];
    const a = (r * r - r1 * r1 + d * d) / (2 * d);
    const h = Math.sqrt(Math.max(0, r * r - a * a));
    const mx = C[0] + (a * (c.x - C[0])) / d, my = C[1] + (a * (c.y - C[1])) / d;
    const res: Vec2[] = [
      [mx + (h * (c.y - C[1])) / d, my - (h * (c.x - C[0])) / d],
      [mx - (h * (c.y - C[1])) / d, my + (h * (c.x - C[0])) / d],
    ];
    return o.type === "arc" ? res.filter((p) => onArc(p, o, pts)) : res;
  }
  return [];
}

function onArc(p: Vec2, o: SkArc, pts: Map<string, SkPoint>): boolean {
  const c = pts.get(o.c)!, a = pts.get(o.p1)!, b = pts.get(o.p2)!;
  const t0 = Math.atan2(a.y - c.y, a.x - c.x);
  const norm = (x: number) => (((x - t0) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  return norm(Math.atan2(p[1] - c.y, p[0] - c.x)) <= norm(Math.atan2(b.y - c.y, b.x - c.x)) + 1e-9;
}
