// Assembly wire / pipe routing (配線・配管): display, kernel sweep, checks, BOM / cut list and the edit panel.
import * as THREE from "three";
import type { App } from "../app";
import type { AssemblyEnv } from "../assembly/env";
import { uid } from "../core/document";
import { evaluateParams } from "../core/params";
import { formatNumber } from "../core/expr";
import type { Vec3 } from "../core/types";
import type { BodyMesh } from "../kernel/protocol";
import type { RouteSolidSpec } from "../kernel/route";
import { download, h, iconEl, modal, toast } from "../ui/dom";
import { PropertyPanel } from "../ui/panel";
import { analyzeRoute, clearanceCheck, cutListCsv, cutRows, cutLength, sizeText, toLocal, toPathSegs, toWorld, type CompLookup, type CompMesh, type RouteSeg } from "./geom";
import { defaultBendRadius, newRoute, ROUTE_COLORS, ROUTE_KIND_LABEL, ruleMinRadius, sanitizeRoutes, type AsmRoute, type RouteKind, type RoutePoint } from "./types";

const fmt = (v: number, d = 1) => (Number.isFinite(v) ? formatNumber(v, d) : "—");

/** three.js curve over a filleted route (display fallback when the kernel sweep fails). */
class RouteCurve extends THREE.Curve<THREE.Vector3> {
  private total: number;
  constructor(private segs: RouteSeg[]) {
    super();
    this.total = segs.reduce((a, s) => a + s.length, 0);
  }
  getPoint(t: number, target = new THREE.Vector3()): THREE.Vector3 {
    let s = t * this.total;
    for (const seg of this.segs) {
      if (s <= seg.length || seg === this.segs[this.segs.length - 1]) {
        s = Math.min(s, seg.length);
        if (seg.t === "line") {
          const k = seg.length ? s / seg.length : 0;
          return target.set(seg.a[0] + (seg.b[0] - seg.a[0]) * k, seg.a[1] + (seg.b[1] - seg.a[1]) * k, seg.a[2] + (seg.b[2] - seg.a[2]) * k);
        }
        const c = new THREE.Vector3(...seg.c!), e1 = new THREE.Vector3(...seg.a).sub(c).normalize();
        const tb = new THREE.Vector3(...seg.b).sub(c);
        const e2 = tb.sub(e1.clone().multiplyScalar(tb.dot(e1))).normalize();
        const a = s / seg.r!;
        return target.copy(c).addScaledVector(e1, seg.r! * Math.cos(a)).addScaledVector(e2, seg.r! * Math.sin(a));
      }
      s -= seg.length;
    }
    return target.set(0, 0, 0);
  }
}

function meshGeometry(b: BodyMesh): THREE.BufferGeometry {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(b.positions, 3));
  g.setAttribute("normal", new THREE.BufferAttribute(b.normals, 3));
  g.setIndex(new THREE.BufferAttribute(b.indices, 1));
  return g;
}

interface KernelEntry {
  hash: string;
  mesh?: BodyMesh;
  error?: string;
}

export class RouteManager {
  readonly layer = new THREE.Group();
  private kernel = new Map<string, KernelEntry>();
  private buildTimer = 0;
  private building: Promise<void> | null = null;
  private builtHash = "";
  /** Route being edited (its control points are drawn). */
  editing: string | null = null;
  activePoint = -1;

  constructor(readonly env: AssemblyEnv) {
    this.layer.name = "routes";
  }

  private get app(): App {
    return this.env.app;
  }

  private install() {
    const vp = this.app.vp;
    if (this.layer.parent) return;
    vp.scene.add(this.layer);
    const prev = vp.scene.onBeforeRender;
    vp.scene.onBeforeRender = (...args) => {
      this.layer.visible = this.app.env === "assembly" && !this.env.editingPart;
      prev.apply(vp.scene, args);
    };
  }

  /** Routes of the document (repaired; older files have none). */
  list(): AsmRoute[] {
    return sanitizeRoutes(this.env.doc.routes);
  }

  readonly lookup: CompLookup = (id) => this.env.doc.components.find((c) => c.id === id);

  /** Hash of the sweep input of a route (geometry follows component moves). */
  private spec(r: AsmRoute): RouteSolidSpec | null {
    const a = analyzeRoute(r, this.lookup);
    if (a.fillet.segs.length === 0) return null;
    return { id: r.id, name: r.name, path: toPathSegs(a.fillet.segs), od: r.od, innerD: r.kind === "cable" ? 0 : Math.max(0, r.od - 2 * r.wall) };
  }

  // ------------------------------------------------------------ display ---

  render() {
    this.install();
    for (const c of [...this.layer.children]) {
      this.layer.remove(c);
      c.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        (m.material as THREE.Material | undefined)?.dispose?.();
      });
    }
    const specs: RouteSolidSpec[] = [];
    for (const r of this.list()) {
      const editing = this.editing === r.id;
      if (r.visible === false && !editing) continue;
      const a = analyzeRoute(r, this.lookup);
      const spec = this.spec(r);
      if (spec) specs.push(spec);
      const mat = new THREE.MeshStandardMaterial({ color: r.color, roughness: r.kind === "pipe" ? 0.35 : 0.7, metalness: r.kind === "pipe" ? 0.6 : 0.05, transparent: editing, opacity: editing ? 0.75 : 1 });
      const k = this.kernel.get(r.id);
      const hash = spec ? JSON.stringify(spec) : "";
      if (spec && k?.mesh && k.hash === hash) {
        const m = new THREE.Mesh(meshGeometry(k.mesh), mat);
        m.userData.kernel = true;
        this.layer.add(m);
      } else if (a.fillet.segs.length) {
        const total = a.length;
        const tube = new THREE.TubeGeometry(new RouteCurve(a.fillet.segs), Math.min(800, Math.max(16, Math.ceil(total / Math.max(1, r.od / 2)))), r.od / 2, 20, false);
        this.layer.add(new THREE.Mesh(tube, mat));
      }
      if (editing) {
        // centre line + control points
        const cl = new THREE.BufferGeometry().setFromPoints(a.polyline.map((p) => new THREE.Vector3(...p)));
        const line = new THREE.Line(cl, new THREE.LineDashedMaterial({ color: 0xff7a00, dashSize: 4, gapSize: 2, depthTest: false }));
        line.computeLineDistances();
        line.renderOrder = 10;
        this.layer.add(line);
        r.points.forEach((p, i) => {
          const w = p.comp && this.lookup(p.comp) ? toWorld(this.lookup(p.comp)!.matrix, p.local) : p.local;
          const s = new THREE.Mesh(new THREE.SphereGeometry(Math.max(1.2, r.od * 0.45), 12, 8), new THREE.MeshBasicMaterial({ color: i === this.activePoint ? 0x1f8fff : 0xff7a00, depthTest: false }));
          s.position.set(...w);
          s.renderOrder = 11;
          this.layer.add(s);
        });
      }
    }
    this.app.vp.invalidate();
    this.scheduleBuild(specs);
  }

  private scheduleBuild(specs: RouteSolidSpec[]) {
    const hash = JSON.stringify(specs);
    if (hash === this.builtHash) return;
    clearTimeout(this.buildTimer);
    this.buildTimer = window.setTimeout(() => void this.build(specs, hash), 400);
  }

  /** Sweeps the routes in the kernel; replaces the TubeGeometry previews when it succeeds. */
  private async build(specs: RouteSolidSpec[], hash: string) {
    if (this.building) await this.building;
    if (hash === this.builtHash) return;
    this.building = (async () => {
      try {
        const res = await this.app.kernel.buildRoutes(specs);
        this.builtHash = hash;
        for (const r of res) {
          const spec = specs.find((s) => s.id === r.id)!;
          this.kernel.set(r.id, { hash: JSON.stringify(spec), mesh: r.mesh, error: r.error });
          if (r.error) console.warn(`route sweep failed (${spec.name}): ${r.error}`);
        }
      } catch (e) {
        console.warn("route build failed", e);
        this.builtHash = hash;
      } finally {
        this.building = null;
      }
      if (this.app.env === "assembly") this.render();
    })();
    return this.building;
  }

  /** Builds the route solids now (before STEP export / kernel interference). */
  async ensureBuilt(): Promise<number> {
    clearTimeout(this.buildTimer);
    const specs = this.list()
      .filter((r) => r.visible !== false)
      .map((r) => this.spec(r))
      .filter((s): s is RouteSolidSpec => !!s);
    await this.build(specs, JSON.stringify(specs));
    return specs.filter((s) => this.kernel.get(s.id)?.mesh).length;
  }

  kernelError(id: string): string | undefined {
    return this.kernel.get(id)?.error;
  }

  // ------------------------------------------------------------- checks ---

  /** Component triangles in assembly coordinates. */
  compMeshes(): CompMesh[] {
    const out: CompMesh[] = [];
    for (const c of this.env.doc.components) {
      if (c.visible === false) continue;
      for (const b of this.env.parts.get(c.partId)?.bodies ?? []) {
        const P = new Float32Array(b.positions.length);
        const lo: Vec3 = [Infinity, Infinity, Infinity], hi: Vec3 = [-Infinity, -Infinity, -Infinity];
        for (let i = 0; i < P.length; i += 3) {
          const w = toWorld(c.matrix, [b.positions[i], b.positions[i + 1], b.positions[i + 2]]);
          P.set(w, i);
          for (let k = 0; k < 3; k++) (lo[k] = Math.min(lo[k], w[k])), (hi[k] = Math.max(hi[k], w[k]));
        }
        out.push({ comp: c.id, name: c.name, positions: P, indices: b.indices, bbox: [lo, hi] });
      }
    }
    return out;
  }

  /** Sampled clearance / interference of one route. */
  clearance(r: AsmRoute, meshes = this.compMeshes()) {
    const a = analyzeRoute(r, this.lookup);
    return clearanceCheck(a.fillet.segs, r.od / 2, r.clearance, meshes, r.od * 1.5 + 1);
  }

  async checkAll() {
    const routes = this.list().filter((r) => r.visible !== false);
    if (!routes.length) return void toast("配線・配管がありません", "info");
    this.app.status("配線・配管をチェック中…");
    const meshes = this.compMeshes();
    let kernelHits: { route: string; comp: number; volume: number }[] | null = null;
    try {
      await this.ensureBuilt();
      kernelHits = await this.app.kernel.routeInterference(this.env.placements());
    } catch {
      kernelHits = null;
    }
    const comps = this.env.doc.components.filter((c) => c.visible !== false);
    const rows: HTMLElement[] = [];
    for (const r of routes) {
      const a = analyzeRoute(r, this.lookup);
      const ends = new Set([r.points[0]?.comp, r.points[r.points.length - 1]?.comp].filter(Boolean));
      const hits = this.clearance(r, meshes);
      const msgs: string[] = [...a.warnings];
      for (const x of hits) msgs.push(x.gap < 0 ? `干渉: ${x.name} (食い込み ${fmt(-x.gap)} mm, 経路 ${fmt(x.s, 0)} mm 付近)` : `すき間不足: ${x.name} ${fmt(x.gap)} mm < ${fmt(r.clearance)} mm`);
      for (const k of kernelHits ?? [])
        if (k.route === r.id) {
          const c = comps[k.comp];
          if (c) msgs.push(`ソリッド干渉: ${c.name} ${fmt(k.volume, 2)} mm³${ends.has(c.id) ? " (接続先)" : ""}`);
        }
      if (this.kernelError(r.id)) msgs.push(`カーネル スイープ失敗 (表示は簡易チューブ): ${this.kernelError(r.id)}`);
      rows.push(
        h(
          "tr",
          {},
          h("td", {}, r.name),
          h("td", {}, `${ROUTE_KIND_LABEL[r.kind]} ${sizeText(r)}`),
          h("td", { class: "num" }, fmt(a.length)),
          h("td", { class: "num" }, String(a.bends)),
          h("td", { class: "num" }, `${fmt(a.minRadius)} / ${fmt(a.ruleMin)}`),
          h("td", { style: msgs.length ? "color:#c0392b" : "color:#2e8b57" }, msgs.length ? h("ul", { style: "margin:0;padding-left:16px" }, ...msgs.map((m) => h("li", {}, m))) : "✓ 問題なし"),
        ),
      );
    }
    this.app.status("準備完了");
    modal({
      title: "配線・配管チェック",
      icon: "intersect",
      width: 860,
      body: h(
        "div",
        {},
        h(
          "div",
          { class: "ptable-wrap" },
          h("table", { class: "ptable" }, h("thead", {}, h("tr", {}, h("th", {}, "名称"), h("th", {}, "種類・サイズ"), h("th", {}, "経路長 mm"), h("th", {}, "曲げ数"), h("th", {}, "最小R / 目安 mm"), h("th", {}, "警告"))), h("tbody", {}, ...rows)),
        ),
        h("p", { class: "muted" }, `最小曲げ半径の目安: ケーブル固定 4×D・可動 7.5×D、ホース 5×OD、パイプ 1.5×OD (メーカー値を優先)。干渉は中心線のサンプリング距離${kernelHits ? "とカーネルのソリッド干渉" : ""}で判定。`),
      ),
    });
  }

  // ------------------------------------------------------------- output ---

  /** BOM rows (配線/配管), numbered after the parts. */
  bomRows(start: number): HTMLElement[] {
    return cutRows(this.list(), this.lookup).map((c, i) =>
      h(
        "tr",
        {},
        h("td", { class: "num" }, String(start + i + 1)),
        h("td", {}, c.name),
        h("td", { class: "num" }, "1"),
        h("td", {}, `配線/配管: ${c.kind} ${c.size}`),
        h("td", { class: "num" }, "—"),
        h("td", {}, `切断長 ${Math.ceil(c.cut)} mm (経路 ${fmt(c.length)} + 余長 ${c.margin}%)`),
      ),
    );
  }

  exportCutList() {
    const rows = cutRows(this.list(), this.lookup);
    if (!rows.length) return void toast("配線・配管がありません", "info");
    download(`${this.env.doc.name}_切断リスト.csv`, "﻿" + cutListCsv(rows), "text/csv");
  }

  hasRoutes() {
    return this.list().some((r) => r.visible !== false && r.points.length > 1);
  }

  // ------------------------------------------------------------ editing ---

  mutate(label: string, fn: (routes: AsmRoute[]) => void) {
    this.env.store.mutate(label, (d) => {
      d.routes = sanitizeRoutes(d.routes);
      fn(d.routes);
    });
  }

  /** Model-browser rows. */
  renderBrowser(list: HTMLElement) {
    const routes = this.list();
    if (!routes.length) return;
    list.appendChild(h("div", { class: "br-row", style: "--depth:1" }, h("span", { class: "br-exp-sp" }), iconEl("folder"), h("span", { class: "br-label" }, `配線・配管 (${routes.length})`)));
    for (const r of routes) {
      const vis = r.visible !== false;
      const el = h(
        "div",
        { class: `br-row ${vis ? "" : "dimmed"}`, style: "--depth:2", "data-id": r.id, title: "ダブルクリックで編集" },
        h("span", { class: "br-exp-sp" }),
        iconEl("sweep"),
        h("span", { class: "br-label" }, `${r.name} ${sizeText(r)}`),
        h(
          "span",
          { class: "br-trail" },
          h(
            "button",
            { class: "br-vis icon-btn small", title: vis ? "非表示にする" : "表示する", onClick: (e: MouseEvent) => (e.stopPropagation(), this.mutate("表示切替", (rs) => (rs.find((x) => x.id === r.id)!.visible = !vis))) },
            iconEl(vis ? "eye" : "eyeOff"),
          ),
        ),
      );
      el.addEventListener("dblclick", () => this.edit(r.id));
      list.appendChild(el);
    }
  }

  /** The route list panel (ribbon 「配線・配管」). */
  open() {
    this.app.cancelAsmCommand();
    if (this.env.explode) {
      this.env.explode = 0;
      this.env.render();
    }
    this.env.command = new RouteListCommand(this);
    this.app.ribbon.refresh();
  }

  edit(id: string | null, kind: RouteKind = "cable") {
    this.app.cancelAsmCommand();
    this.env.command = new RouteCommand(this, id, kind);
    this.app.ribbon.refresh();
  }
}

// ---------------------------------------------------------- list panel ---

class RouteListCommand {
  readonly id = "routes";
  private panel: PropertyPanel;
  private body: HTMLElement;
  private off: () => void;

  constructor(private mgr: RouteManager) {
    const app = mgr.env.app;
    this.panel = new PropertyPanel(app.panelHost, "配線・配管", "sweep", { onOk: () => this.close(), onCancel: () => this.close() }, () => evaluateParams(mgr.env.doc.params));
    const sec = this.panel.section("新規");
    sec.appendChild(
      h(
        "div",
        { style: "display:flex;gap:4px;flex-wrap:wrap" },
        ...(Object.keys(ROUTE_KIND_LABEL) as RouteKind[]).map((k) => h("button", { class: "btn", "data-route-new": k, onClick: () => mgr.edit(null, k) }, iconEl("plus"), ROUTE_KIND_LABEL[k])),
      ),
    );
    this.body = this.panel.section("経路の一覧");
    const tools = this.panel.section("検査・出力");
    tools.appendChild(
      h(
        "div",
        { style: "display:flex;gap:4px;flex-wrap:wrap" },
        h("button", { class: "btn", onClick: () => void mgr.checkAll() }, "チェック"),
        h("button", { class: "btn", onClick: () => mgr.exportCutList() }, "切断リスト CSV"),
        h("button", { class: "btn", onClick: () => void mgr.env.openBom() }, "部品表"),
        h("button", { class: "btn", onClick: () => void mgr.env.exportStep() }, "STEP (配管含む)"),
      ),
    );
    this.off = mgr.env.store.on(() => this.refresh());
    this.refresh();
    app.status("配線・配管: 「新規」で経路を作成し、部品の面・円形エッジ・コネクタ点を順にクリックします");
  }

  private refresh() {
    const mgr = this.mgr;
    this.body.innerHTML = "";
    const routes = mgr.list();
    if (!routes.length) this.body.appendChild(h("p", { class: "pp-note" }, "経路はまだありません"));
    for (const r of routes) {
      const a = analyzeRoute(r, mgr.lookup);
      const vis = r.visible !== false;
      this.body.appendChild(
        h(
          "div",
          { class: "field", style: "display:flex;align-items:center;gap:4px" },
          h("span", { style: `width:10px;height:10px;border-radius:50%;background:${r.color};flex:none` }),
          h("span", { style: "flex:1;min-width:0", title: a.warnings.join("\n") }, `${r.name} ${sizeText(r)} — ${fmt(a.length, 0)} mm, 曲げ ${a.bends}${a.warnings.length ? " ⚠" : ""}`),
          h("button", { class: "icon-btn small", title: vis ? "非表示" : "表示", onClick: () => mgr.mutate("表示切替", (rs) => (rs.find((x) => x.id === r.id)!.visible = !vis)) }, iconEl(vis ? "eye" : "eyeOff")),
          h("button", { class: "icon-btn small", title: "編集", onClick: () => mgr.edit(r.id) }, iconEl("edit")),
          h("button", { class: "icon-btn small", title: "削除", onClick: () => mgr.mutate("配線を削除", (rs) => rs.splice(rs.findIndex((x) => x.id === r.id), 1)) }, iconEl("close")),
        ),
      );
    }
  }

  private close() {
    this.off();
    this.panel.close();
    const env = this.mgr.env;
    if (env.command === this) env.command = null;
    env.app.status("準備完了");
    env.app.ribbon.refresh();
  }
  ok() {
    this.close();
  }
  cancel() {
    this.close();
  }
}

// ---------------------------------------------------------- edit panel ---

type SnapMode = "face" | "circle" | "port";

class RouteCommand {
  readonly id = "route";
  private panel: PropertyPanel;
  private snap: string;
  private rid: string;
  private mode: SnapMode = "circle";
  private lead = 10;
  private pointsEl: HTMLElement;
  private infoEl: HTMLElement;
  private checkTimer = 0;
  private fieldEls: Record<string, HTMLInputElement> = {};

  constructor(
    private mgr: RouteManager,
    id: string | null,
    kind: RouteKind,
  ) {
    const env = mgr.env, app = env.app;
    this.snap = env.store.snapshot();
    const existing = id ? mgr.list().find((r) => r.id === id) : undefined;
    this.rid = existing?.id ?? uid("rt");
    if (!existing) {
      const n = mgr.list().filter((r) => r.kind === kind).length + 1;
      env.store.patch((d) => {
        d.routes = sanitizeRoutes(d.routes);
        d.routes.push(newRoute(this.rid, n, kind));
      }, "solve");
    }
    mgr.editing = this.rid;
    mgr.activePoint = (this.route?.points.length ?? 0) - 1;
    const r = this.route!;
    this.lead = Math.max(5, r.od * 1.5);
    const p = new PropertyPanel(app.panelHost, existing ? `配線・配管を編集: ${r.name}` : `${ROUTE_KIND_LABEL[kind]}を作成`, "sweep", { onOk: () => this.finish(true), onCancel: () => this.finish(false) }, () => evaluateParams(env.doc.params));
    this.panel = p;
    // ---- definition
    const def = p.section("種類・サイズ");
    def.appendChild(this.row("名称", this.input("name", "text", r.name, (v) => this.set((x) => (x.name = v)))));
    p.select(def, "種類", (Object.keys(ROUTE_KIND_LABEL) as RouteKind[]).map((k) => ({ value: k, label: ROUTE_KIND_LABEL[k] })), r.kind, (v) =>
      this.set((x) => {
        x.kind = v as RouteKind;
        if (x.kind === "cable") x.wall = 0;
        else if (!x.wall) x.wall = x.kind === "hose" ? 2 : 1;
        x.color = ROUTE_COLORS[x.kind];
        x.bendRadius = defaultBendRadius(x.kind, x.od, x.moving);
        this.syncFields();
      }),
    );
    def.appendChild(this.row("外径 OD (mm)", this.input("od", "number", String(r.od), (v) => this.set((x) => (x.od = Math.max(0.1, Number(v) || x.od))))));
    def.appendChild(this.row("肉厚 (mm, パイプ/ホース)", this.input("wall", "number", String(r.wall), (v) => this.set((x) => (x.wall = Math.max(0, Number(v) || 0))))));
    def.appendChild(
      this.row(
        "曲げ半径 R (mm)",
        this.input("bend", "number", String(r.bendRadius), (v) => this.set((x) => (x.bendRadius = Math.max(0, Number(v) || 0)))),
        h("button", { class: "btn", title: "種類と外径から標準の曲げ半径を設定", onClick: () => (this.set((x) => (x.bendRadius = defaultBendRadius(x.kind, x.od, x.moving))), this.syncFields()) }, "標準"),
      ),
    );
    p.checkbox(def, "可動部の配線 (ケーブル: 大きい曲げ半径)", !!r.moving, (v) => this.set((x) => (x.moving = v)));
    def.appendChild(this.row("色", this.input("color", "color", r.color, (v) => this.set((x) => (x.color = v)))));
    def.appendChild(this.row("切断余長 (%)", this.input("margin", "number", String(r.margin), (v) => this.set((x) => (x.margin = Number(v) || 0)))));
    def.appendChild(this.row("必要すき間 (mm)", this.input("clr", "number", String(r.clearance), (v) => this.set((x) => (x.clearance = Math.max(0, Number(v) || 0))))));
    // ---- points
    const pts = p.section("経路の点");
    p.toggles(
      pts,
      "スナップ",
      [
        { value: "face", icon: "plane", title: "面上の点" },
        { value: "circle", icon: "circle", title: "円形エッジ / 円筒の中心" },
        { value: "port", icon: "point", title: "コネクタ点 (面・円の中心から法線方向へ引き出し)" },
      ],
      this.mode,
      (v) => (this.mode = v as SnapMode),
    );
    pts.appendChild(this.row("コネクタ引き出し長 (mm)", this.input("lead", "number", String(this.lead), (v) => (this.lead = Math.max(0, Number(v) || 0)))));
    this.pointsEl = h("div", { class: "route-points" });
    pts.appendChild(this.pointsEl);
    const dx = this.input("dx", "number", "0", () => {}), dy = this.input("dy", "number", "0", () => {}), dz = this.input("dz", "number", "50", () => {});
    for (const e of [dx, dy, dz]) e.style.width = "56px";
    pts.appendChild(
      h(
        "div",
        { class: "field", style: "display:flex;gap:4px;align-items:center;flex-wrap:wrap" },
        h("span", {}, "オフセット点 ΔX ΔY ΔZ"),
        dx,
        dy,
        dz,
        h("button", { class: "btn", "data-route-offset": "1", onClick: () => this.addOffset([Number(dx.value) || 0, Number(dy.value) || 0, Number(dz.value) || 0]) }, iconEl("plus"), "追加"),
      ),
    );
    p.note(pts, "部品をクリックして点を追加 (選択中の点の後ろに挿入)。オフセット点は選択中の点からの移動量 (アセンブリ座標) で、その点の部品に付随します。");
    this.infoEl = h("div", { class: "route-info" });
    p.section("チェック").appendChild(this.infoEl);
    // ---- picking
    app.vp.pickKinds = new Set(["face", "edge"]);
    app.vp.pickFilter = null;
    app.vp.tool = {
      cursor: "crosshair",
      onPointerMove: (e, vp) => vp.setHover(vp.pick(e)),
      onPointerDown: (e, vp) => {
        if (e.button !== 0) return;
        const pk = vp.pick(e);
        if (!pk) return;
        const pt = this.pointFromPick(pk);
        if (pt) this.insert(pt);
      },
      onContextMenu: () => (this.finish(true), true),
    };
    this.refresh();
    app.status("配線・配管: 部品の面・円形エッジをクリックして経路の点を順に追加します (右クリック / Enter で確定)");
  }

  private get route(): AsmRoute | undefined {
    return this.mgr.list().find((r) => r.id === this.rid);
  }

  private row(label: string, ...ctl: HTMLElement[]) {
    return h("label", { class: "field" }, h("span", { class: "field-label" }, label), h("span", { class: "field-ctl", style: "display:flex;gap:4px" }, ...ctl));
  }
  private input(key: string, type: string, value: string, onChange: (v: string) => void) {
    const el = h("input", { type, value, step: type === "number" ? "any" : undefined, "data-route-field": key }) as HTMLInputElement;
    el.addEventListener("change", () => onChange(el.value));
    this.fieldEls[key] = el;
    return el;
  }
  private syncFields() {
    const r = this.route;
    if (!r) return;
    this.fieldEls.bend.value = String(Math.round(r.bendRadius * 100) / 100);
    this.fieldEls.wall.value = String(r.wall);
    this.fieldEls.color.value = r.color;
  }

  /** Edits the route in place (no undo step until OK). */
  private set(fn: (r: AsmRoute) => void) {
    this.mgr.env.store.patch((d) => {
      d.routes = sanitizeRoutes(d.routes);
      const r = d.routes.find((x) => x.id === this.rid);
      if (r) fn(r);
    }, "solve");
    this.refresh();
  }

  private pointFromPick(pk: { kind: string; body: number; index: number; point: Vec3 }): RoutePoint | null {
    const env = this.mgr.env;
    const map = env.bodyMap[pk.body];
    if (!map) return null;
    const comp = env.doc.components.find((c) => c.id === map.comp);
    const body = comp && env.parts.get(comp.partId)?.bodies[map.local];
    if (!comp || !body) return null;
    const base = { id: uid("rp"), comp: comp.id };
    const centre: Vec3 = [(body.bbox[0][0] + body.bbox[1][0]) / 2, (body.bbox[0][1] + body.bbox[1][1]) / 2, (body.bbox[0][2] + body.bbox[1][2]) / 2];
    const outward = (o: Vec3, d: Vec3): Vec3 => ((o[0] - centre[0]) * d[0] + (o[1] - centre[1]) * d[1] + (o[2] - centre[2]) * d[2] < 0 ? [-d[0], -d[1], -d[2]] : d);
    if (this.mode === "face" || (pk.kind === "face" && this.mode === "circle" && !body.faces[pk.index]?.axis)) {
      return { ...base, local: toLocal(comp.matrix, pk.point), snap: "face", label: `${comp.name} 面上の点` };
    }
    if (pk.kind === "edge") {
      const e = body.edges[pk.index];
      if (e?.axis) {
        const pt: RoutePoint = { ...base, local: e.axis.origin, snap: this.mode === "port" ? "port" : "circle", label: `${comp.name} 円の中心${this.mode === "port" ? " (コネクタ)" : ""}` };
        if (this.mode === "port") (pt.dir = outward(e.axis.origin, e.axis.dir)), (pt.lead = this.lead);
        return pt;
      }
      return { ...base, local: toLocal(comp.matrix, pk.point), snap: "face", label: `${comp.name} エッジ上の点` };
    }
    const f = body.faces[pk.index];
    if (!f) return null;
    if (this.mode === "port") {
      const o = f.axis && f.type !== "PLANE" ? f.axis.origin : f.center;
      return { ...base, local: o, snap: "port", dir: f.type === "PLANE" ? f.normal : outward(o, f.axis?.dir ?? f.normal), lead: this.lead, label: `${comp.name} コネクタ点` };
    }
    // circle mode on a cylinder: nearest point on its axis
    const ax = f.axis!;
    const lp = toLocal(comp.matrix, pk.point);
    const t = (lp[0] - ax.origin[0]) * ax.dir[0] + (lp[1] - ax.origin[1]) * ax.dir[1] + (lp[2] - ax.origin[2]) * ax.dir[2];
    return { ...base, local: [ax.origin[0] + ax.dir[0] * t, ax.origin[1] + ax.dir[1] * t, ax.origin[2] + ax.dir[2] * t], snap: "circle", label: `${comp.name} 円筒の軸` };
  }

  private insert(pt: RoutePoint) {
    const at = this.mgr.activePoint + 1;
    this.set((r) => r.points.splice(Math.min(at, r.points.length), 0, pt));
    this.mgr.activePoint = at;
    this.refresh();
  }

  /** Point at an offset (assembly axes) from the selected point, attached to the same component. */
  private addOffset(d: Vec3) {
    const r = this.route!;
    const ref = r.points[this.mgr.activePoint] ?? r.points[r.points.length - 1];
    const comp = ref?.comp ? this.mgr.lookup(ref.comp) : undefined;
    const w0 = ref ? (comp ? toWorld(comp.matrix, ref.local) : ref.local) : ([0, 0, 0] as Vec3);
    const w: Vec3 = [w0[0] + d[0], w0[1] + d[1], w0[2] + d[2]];
    const compName = comp ? this.mgr.env.doc.components.find((c) => c.id === ref!.comp)?.name : "";
    this.insert({ id: uid("rp"), comp: ref?.comp, local: comp ? toLocal(comp.matrix, w) : w, snap: "offset", label: `${compName ? compName + " " : ""}オフセット (${d.map((v) => fmt(v, 1)).join(", ")})` });
  }

  private refresh() {
    const r = this.route;
    if (!r) return;
    const mgr = this.mgr;
    this.pointsEl.innerHTML = "";
    r.points.forEach((pt, i) => {
      const move = (k: number) =>
        this.set((x) => {
          const j = i + k;
          if (j < 0 || j >= x.points.length) return;
          [x.points[i], x.points[j]] = [x.points[j], x.points[i]];
          mgr.activePoint = j;
        });
      const el = h(
        "div",
        { class: `field route-pt${i === mgr.activePoint ? " active" : ""}`, style: `display:flex;align-items:center;gap:2px;cursor:pointer;${i === mgr.activePoint ? "background:rgba(31,143,255,.15);" : ""}` },
        h("span", { style: "flex:1;min-width:0;font-size:12px" }, `${i + 1}. ${pt.label}`),
        h("button", { class: "icon-btn small", title: "上へ", onClick: (e: MouseEvent) => (e.stopPropagation(), move(-1)) }, "↑"),
        h("button", { class: "icon-btn small", title: "下へ", onClick: (e: MouseEvent) => (e.stopPropagation(), move(1)) }, "↓"),
        h(
          "button",
          {
            class: "icon-btn small",
            title: "削除",
            onClick: (e: MouseEvent) => {
              e.stopPropagation();
              this.set((x) => x.points.splice(i, 1));
              mgr.activePoint = Math.min(mgr.activePoint, r.points.length - 2);
              this.refresh();
            },
          },
          iconEl("close"),
        ),
      );
      el.addEventListener("click", () => ((mgr.activePoint = i), this.refresh()));
      this.pointsEl.appendChild(el);
    });
    if (!r.points.length) this.pointsEl.appendChild(h("p", { class: "pp-note" }, "点がありません — 部品をクリックしてください"));
    const a = analyzeRoute(r, mgr.lookup);
    const kv = (k: string, v: string) => h("tr", {}, h("th", {}, k), h("td", {}, v));
    this.infoEl.innerHTML = "";
    this.infoEl.appendChild(
      h(
        "table",
        { class: "kv" },
        kv("経路長", `${fmt(a.length)} mm`),
        kv("切断長", `${fmt(cutLength(a.length, r.margin), 0)} mm (+${r.margin}%)`),
        kv("曲げ数", String(a.bends)),
        kv("最小曲げ半径", `${fmt(a.minRadius)} mm (目安 ≥ ${fmt(ruleMinRadius(r.kind, r.od, r.moving))})`),
      ),
    );
    const warn = h("ul", { class: "route-warn", style: "margin:4px 0;padding-left:16px;color:#c0392b;font-size:12px" }, ...a.warnings.map((w) => h("li", {}, w)));
    this.infoEl.appendChild(warn);
    this.panel.setOkEnabled(r.points.length >= 2);
    mgr.render();
    // sampled interference / clearance (debounced: meshes can be large)
    clearTimeout(this.checkTimer);
    this.checkTimer = window.setTimeout(() => {
      const cur = this.route;
      if (!cur || cur.points.length < 2) return;
      for (const x of mgr.clearance(cur)) warn.appendChild(h("li", {}, x.gap < 0 ? `干渉: ${x.name} (食い込み ${fmt(-x.gap)} mm)` : `すき間不足: ${x.name} ${fmt(x.gap)} mm`));
    }, 250);
  }

  private finish(ok: boolean) {
    const mgr = this.mgr, env = mgr.env, app = env.app;
    clearTimeout(this.checkTimer);
    if (ok && (this.route?.points.length ?? 0) < 2) {
      this.panel.setError("点を 2 つ以上指定してください");
      return;
    }
    this.panel.close();
    mgr.editing = null;
    env.command = null;
    app.vp.pickFilter = null;
    app.vp.tool = env.tool;
    if (ok) {
      const cur = env.store.snapshot();
      env.store.restore(this.snap, "solve");
      env.store.pushHistory(this.snap);
      env.store.restore(cur, "commit");
    } else env.store.restore(this.snap, "cancel");
    app.status("準備完了");
    mgr.open();
  }
  ok() {
    this.finish(true);
  }
  cancel() {
    this.finish(false);
  }
}
