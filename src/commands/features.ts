import * as THREE from "three";
import type { App } from "../app";
import { featureSketchRefs, ORIGIN_PLANES, uid } from "../core/document";
import { formatNumber } from "../core/expr";
import { holeCenterPoints, worldToPlane } from "../core/resolve";
import { clearanceHole, counterbore, countersink, FAMILY_LABEL, FIT_LABEL, tapDrill, threadByName, threadsOf, type Fit, type ThreadFamily } from "../core/threads";
import type {
  AxisRef,
  BoolOp,
  ChamferFeature,
  ExtrudeFeature,
  Feature,
  FilletFeature,
  HoleFeature,
  ThreadFeature,
  LoftFeature,
  PushPullFeature,
  SweepFeature,
  MirrorFeature,
  MoveFeature,
  PatternFeature,
  PlaneDef,
  PrimitiveFeature,
  RevolveFeature,
  ShellFeature,
  SketchFeature,
  SkLine,
  SkPoint,
  Vec2,
  Vec3,
  WorkPlaneFeature,
} from "../core/types";
import { pointInRegion, type Region } from "../sketch/profiles";
import { h, iconEl, toast } from "../ui/dom";
import { PropertyPanel } from "../ui/panel";
import { pointMap } from "../viewer/sketchRender";
import { samePick, type Pick, type ToolHandler } from "../viewer/viewport";
import { FeatureCommand, type Command } from "./command";

export interface CommandInfo {
  id: string;
  label: string;
  icon: string;
}

export interface CommandRegistry {
  run(id: string): void;
  edit(f: Feature): void;
  get(id: string): CommandInfo | undefined;
}

const OPS = [
  { value: "join", icon: "join", title: "接合" },
  { value: "cut", icon: "cut", title: "切り取り" },
  { value: "intersect", icon: "intersect", title: "交差" },
  { value: "new", icon: "newSolid", title: "新しいソリッド" },
];

// ------------------------------------------------------------- helpers ---

/** An interior sample point of a region (centroid of its largest triangle). */
function regionSample(r: Region): Vec2 {
  const contour = r.outerPoly.map(([x, y]) => new THREE.Vector2(x, y));
  const holes = r.holePolys.map((hp) => hp.map(([x, y]) => new THREE.Vector2(x, y)));
  const all = [...contour, ...holes.flat()];
  const tris = THREE.ShapeUtils.triangulateShape(contour, holes);
  let best: Vec2 = r.outerPoly[0], ba = -1;
  for (const [a, b, c] of tris) {
    const A = all[a], B = all[b], C = all[c];
    const area = Math.abs((B.x - A.x) * (C.y - A.y) - (C.x - A.x) * (B.y - A.y));
    if (area > ba) (ba = area), (best = [(A.x + B.x + C.x) / 3, (A.y + B.y + C.y) / 3]);
  }
  return best;
}

/** Sketches whose profiles can be used (visible / unconsumed first). */
function profileSketches(app: App, current?: string): SketchFeature[] {
  const doc = app.store.doc;
  const consumed = new Set(doc.features.flatMap(featureSketchRefs));
  return doc.features.filter(
    (f, i): f is SketchFeature =>
      f.type === "sketch" && i < doc.endOfPart && (f.id === current || !consumed.has(f.id)) && (app.sketchState(f.id)?.regions.length ?? 0) > 0,
  );
}

/** Region picking over one or more sketches (used by extrude / revolve). */
class ProfilePicker {
  hover: { sketch: string; index: number } | null = null;
  active = true;
  constructor(
    private app: App,
    private getSketch: () => string,
    private candidates: () => SketchFeature[],
    private onToggle: (sketch: string, index: number, sample: Vec2) => void,
  ) {}

  hit(e: { clientX: number; clientY: number }): { sketch: string; index: number; uv: Vec2 } | null {
    const cur = this.getSketch();
    const list = cur ? this.candidates().filter((s) => s.id === cur) : this.candidates();
    let best: { sketch: string; index: number; uv: Vec2; area: number } | null = null;
    for (const sk of list) {
      const w = this.app.vp.rayPlane(e, sk.plane);
      if (!w) continue;
      const uv = worldToPlane(sk.plane, w.toArray() as Vec3);
      const st = this.app.sketchState(sk.id);
      st?.regions.forEach((r, i) => {
        if (pointInRegion(uv, r) && (!best || Math.abs(r.area) < best.area)) best = { sketch: sk.id, index: i, uv, area: Math.abs(r.area) };
      });
    }
    return best;
  }

  move(e: PointerEvent) {
    if (!this.active) return;
    const h0 = this.hit(e);
    const nh = h0 ? { sketch: h0.sketch, index: h0.index } : null;
    if (JSON.stringify(nh) !== JSON.stringify(this.hover)) {
      this.hover = nh;
      this.draw();
    }
  }

  click(e: PointerEvent): boolean {
    if (!this.active) return false;
    const h0 = this.hit(e);
    if (!h0) return false;
    const st = this.app.sketchState(h0.sketch)!;
    this.onToggle(h0.sketch, h0.index, regionSample(st.regions[h0.index]));
    return true;
  }

  draw(selected: number[] = this.selected) {
    const sk = this.getSketch() || this.hover?.sketch;
    if (!sk) {
      // show all candidate sketches so the user sees what can be picked
      this.app.renderSketches();
      return;
    }
    this.app.renderSketches({
      sketchId: sk,
      selected: new Set(selected),
      hover: this.hover && this.hover.sketch === sk ? this.hover.index : null,
    });
  }
  selected: number[] = [];
}

// ------------------------------------------------------------ extrude ---

class ExtrudeCommand extends FeatureCommand<ExtrudeFeature> {
  readonly id = "extrude";
  private picker: ProfilePicker;
  private profPick!: ReturnType<PropertyPanel["picker"]>;

  constructor(app: App, existing: ExtrudeFeature | null) {
    const sketches = profileSketches(app);
    const preSel = [...app.browserSelection].find((id) => sketches.some((s) => s.id === id));
    const auto = preSel ?? (sketches.length === 1 ? sketches[0].id : "");
    super(app, existing, () => {
      const id = uid("ex");
      const st = auto ? app.sketchState(auto) : undefined;
      const prof = st ? (st.regions.length === 1 ? [0] : st.regions.map((r, i) => (r.island ? -1 : i)).filter((i) => i >= 0)) : [];
      const hasBodies = app.hasBodies();
      return {
        id,
        type: "extrude",
        name: app.store.nextFeatureName("extrude"),
        sketch: auto,
        profiles: prof,
        profilePts: st ? prof.map((i) => regionSample(st.regions[i])) : [],
        op: hasBodies ? "join" : "new",
        extent: "distance",
        distance: app.store.addParam(app.store.doc, "10", "mm", id),
        flip: false,
      };
    });
    this.picker = new ProfilePicker(
      app,
      () => this.feature.sketch,
      () => profileSketches(app, this.feature.sketch),
      (sk, i, sample) => this.toggleProfile(sk, i, sample),
    );
    this.picker.selected = this.feature.profiles;
    this.handler = {
      cursor: "pointer",
      onPointerMove: (e) => this.picker.move(e),
      onPointerDown: (e) => {
        if (e.button === 0) this.picker.click(e);
      },
      onContextMenu: () => {
        this.app.finishCommand(this, true);
        return true;
      },
    };
    this.buildPanel();
    this.picker.draw();
    app.status(this.feature.profiles.length ? "プロファイルが選択されました — 距離を入力して OK" : "押し出すプロファイル (スケッチ領域) をクリックして選択");
  }

  private toggleProfile(sk: string, i: number, sample: Vec2) {
    this.update((f) => {
      if (f.sketch !== sk) {
        f.sketch = sk;
        f.profiles = [];
        f.profilePts = [];
      }
      const k = f.profiles.indexOf(i);
      const pts = f.profilePts ?? [];
      if (k >= 0) {
        f.profiles.splice(k, 1);
        pts.splice(k, 1);
      } else {
        f.profiles.push(i);
        pts.push(sample);
      }
      f.profilePts = pts;
    });
    this.picker.selected = this.feature.profiles;
    this.picker.draw();
    this.refreshCount();
  }

  private refreshCount() {
    this.profPick.setCount(this.feature.profiles.length, this.feature.profiles.length ? `${this.feature.profiles.length} 個のプロファイル` : "選択してください");
  }

  private buildPanel() {
    const f = this.feature;
    this.openPanel(this.editing ? `押し出し: ${f.name}` : "押し出し", "extrude", true);
    const p = this.panel;
    const inp = p.section("入力ジオメトリ");
    this.profPick = p.picker(inp, "プロファイル", "sketch", () => {
      this.picker.active = true;
      this.profPick.setActive(true);
    }, () => {
      this.update((x) => ((x.profiles = []), (x.profilePts = [])));
      this.picker.selected = [];
      this.picker.draw();
      this.refreshCount();
    });
    this.profPick.setActive(true);
    this.refreshCount();
    const beh = p.section("動作");
    p.toggles(
      beh,
      "範囲",
      [
        { value: "distance", icon: "distance", title: "距離" },
        { value: "through", icon: "through", title: "貫通 (すべて)" },
      ],
      f.extent === "through" ? "through" : "distance",
      (v) => {
        this.update((x) => (x.extent = v === "through" ? (x.extent === "symmetric" ? "symmetric" : "through") : x.extent === "through" ? "distance" : x.extent));
        dist.el.style.display = v === "through" ? "none" : "";
      },
    );
    let dirTouched = this.editing;
    const dirToggle = p.toggles(
      beh,
      "方向",
      [
        { value: "default", icon: "dirDefault", title: "既定の方向" },
        { value: "flip", icon: "dirFlip", title: "反転" },
        { value: "sym", icon: "dirSym", title: "対称" },
      ],
      f.extent === "symmetric" ? "sym" : f.flip ? "flip" : "default",
      (v) => {
        dirTouched = true;
        this.update((x) => {
          x.flip = v === "flip";
          if (v === "sym") x.extent = "symmetric";
          else if (x.extent === "symmetric") x.extent = "distance";
        });
      },
    );
    const dist = p.expr(beh, "距離 A", this.expr(f.distance), "mm", (e) => this.setParam(this.feature.distance, e), f.distance);
    if (f.extent === "through") dist.el.style.display = "none";
    setTimeout(() => dist.input.focus(), 50);
    const out = p.section("出力");
    p.toggles(out, "ブール演算", OPS, f.op, (v) => {
      this.update((x) => (x.op = v as BoolOp));
      // sketches on model faces: cut into the material, add away from it (Inventor behaviour)
      const sk = this.app.store.feature<SketchFeature>(this.feature.sketch);
      if (!dirTouched && sk?.planeLabel === "面" && this.feature.extent !== "symmetric") {
        const flip = v === "cut" || v === "intersect";
        this.update((x) => (x.flip = flip));
        dirToggle.set(flip ? "flip" : "default");
      }
    });
  }

  cancel() {
    super.cancel();
  }
}

// ------------------------------------------------------------- revolve ---

class RevolveCommand extends FeatureCommand<RevolveFeature> {
  readonly id = "revolve";
  private picker: ProfilePicker;
  private mode: "profile" | "axis" = "profile";
  private profPick!: ReturnType<PropertyPanel["picker"]>;
  private axisPick!: ReturnType<PropertyPanel["picker"]>;

  constructor(app: App, existing: RevolveFeature | null) {
    const sketches = profileSketches(app);
    const preSel = [...app.browserSelection].find((id) => sketches.some((s) => s.id === id));
    const auto = preSel ?? (sketches.length === 1 ? sketches[0].id : "");
    super(app, existing, () => {
      const id = uid("rv");
      const st = auto ? app.sketchState(auto) : undefined;
      const sk = auto ? app.store.feature<SketchFeature>(auto) : undefined;
      const prof = st ? (st.regions.length === 1 ? [0] : st.regions.map((r, i) => (r.island ? -1 : i)).filter((i) => i >= 0)) : [];
      // a single construction line is taken as the axis (Inventor centerline)
      const cl = sk?.entities.filter((e) => e.type === "line" && e.construction) ?? [];
      return {
        id,
        type: "revolve",
        name: app.store.nextFeatureName("revolve"),
        sketch: auto,
        profiles: prof,
        profilePts: st ? prof.map((i) => regionSample(st.regions[i])) : [],
        axis: cl.length === 1 ? cl[0].id : "",
        op: app.hasBodies() ? "join" : "new",
        extent: "full",
        angle: app.store.addParam(app.store.doc, "360", "deg", id),
        flip: false,
      };
    });
    this.picker = new ProfilePicker(
      app,
      () => this.feature.sketch,
      () => profileSketches(app, this.feature.sketch),
      (sk, i, sample) => {
        this.update((f) => {
          if (f.sketch !== sk) (f.sketch = sk), (f.profiles = []), (f.profilePts = []);
          const k = f.profiles.indexOf(i);
          const pts = f.profilePts ?? [];
          if (k >= 0) f.profiles.splice(k, 1), pts.splice(k, 1);
          else f.profiles.push(i), pts.push(sample);
          f.profilePts = pts;
        });
        this.picker.selected = this.feature.profiles;
        this.picker.draw();
        this.refresh();
        if (!this.feature.axis && this.feature.profiles.length) this.setMode("axis");
      },
    );
    this.picker.selected = this.feature.profiles;
    this.handler = {
      cursor: "pointer",
      onPointerMove: (e) => (this.mode === "profile" ? this.picker.move(e) : undefined),
      onPointerDown: (e) => {
        if (e.button !== 0) return;
        if (this.mode === "profile") this.picker.click(e);
        else this.pickAxis(e);
      },
    };
    this.buildPanel();
    this.picker.draw();
    this.setMode(this.feature.profiles.length ? (this.feature.axis ? "profile" : "axis") : "profile");
  }

  private setMode(m: "profile" | "axis") {
    this.mode = m;
    this.picker.active = m === "profile";
    this.profPick.setActive(m === "profile");
    this.axisPick.setActive(m === "axis");
    this.app.status(m === "profile" ? "回転するプロファイルを選択" : "回転軸にするスケッチ線分をクリック");
  }

  private pickAxis(e: PointerEvent) {
    const sk = this.app.store.feature<SketchFeature>(this.feature.sketch);
    if (!sk) return;
    const w = this.app.vp.rayPlane(e, sk.plane);
    if (!w) return;
    const uv = worldToPlane(sk.plane, w.toArray() as Vec3);
    const pts = pointMap(sk);
    let best: string | null = null, bd = this.app.vp.pixelSize * 10;
    for (const l of sk.entities) {
      if (l.type !== "line") continue;
      const a = pts.get((l as SkLine).p1)!, b = pts.get((l as SkLine).p2)!;
      const d = segDist(uv, [a.x, a.y], [b.x, b.y]);
      if (d < bd) (bd = d), (best = l.id);
    }
    if (best) {
      this.update((f) => (f.axis = best!));
      this.refresh();
      this.setMode("profile");
    }
  }

  private refresh() {
    const f = this.feature;
    this.profPick.setCount(f.profiles.length, f.profiles.length ? `${f.profiles.length} 個のプロファイル` : "選択してください");
    this.axisPick.setCount(f.axis ? 1 : 0, f.axis === "X" ? "スケッチ X 軸" : f.axis === "Y" ? "スケッチ Y 軸" : f.axis ? "線分" : "選択してください");
  }

  private buildPanel() {
    const f = this.feature;
    this.openPanel(this.editing ? `回転: ${f.name}` : "回転", "revolve", true);
    const p = this.panel;
    const inp = p.section("入力ジオメトリ");
    this.profPick = p.picker(inp, "プロファイル", "sketch", () => this.setMode("profile"));
    this.axisPick = p.picker(inp, "軸", "workaxis", () => this.setMode("axis"));
    p.select(
      inp,
      "軸の指定",
      [
        { value: "", label: "スケッチの線分を選択" },
        { value: "X", label: "スケッチ X 軸" },
        { value: "Y", label: "スケッチ Y 軸" },
      ],
      f.axis === "X" || f.axis === "Y" ? f.axis : "",
      (v) => {
        if (v) this.update((x) => (x.axis = v));
        else this.setMode("axis");
        this.refresh();
      },
    );
    this.refresh();
    const beh = p.section("動作");
    p.toggles(
      beh,
      "範囲",
      [
        { value: "full", icon: "revolve", title: "全周" },
        { value: "angle", icon: "angle", title: "角度" },
      ],
      f.extent,
      (v) => {
        this.update((x) => (x.extent = v as "full" | "angle"));
        ang.el.style.display = v === "full" ? "none" : "";
      },
    );
    const ang = p.expr(beh, "角度", this.expr(f.angle), "deg", (e) => this.setParam(this.feature.angle, e), f.angle);
    if (f.extent === "full") ang.el.style.display = "none";
    p.toggles(
      beh,
      "方向",
      [
        { value: "default", icon: "dirDefault", title: "既定の方向" },
        { value: "flip", icon: "dirFlip", title: "反転" },
      ],
      f.flip ? "flip" : "default",
      (v) => this.update((x) => (x.flip = v === "flip")),
    );
    const out = p.section("出力");
    p.toggles(out, "ブール演算", OPS, f.op, (v) => this.update((x) => (x.op = v as BoolOp)));
  }
}

function segDist(p: Vec2, a: Vec2, b: Vec2): number {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const l2 = dx * dx + dy * dy || 1;
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2));
  return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
}

// ---------------------------------------------------------------- loft ---

class LoftCommand extends FeatureCommand<LoftFeature> {
  readonly id = "loft";
  private picker: ProfilePicker;
  private secPick!: ReturnType<PropertyPanel["picker"]>;
  private list!: HTMLElement;

  constructor(app: App, existing: LoftFeature | null) {
    const candidates = profileSketches(app);
    const pre = [...app.browserSelection].filter((id) => candidates.some((s) => s.id === id));
    super(app, existing, () => ({
      id: uid("lf"),
      type: "loft",
      name: app.store.nextFeatureName("loft"),
      sketches: pre,
      op: app.hasBodies() ? "join" : "new",
      ruled: false,
    }));
    this.picker = new ProfilePicker(
      app,
      () => "",
      () => profileSketches(app).concat(this.feature.sketches.map((id) => app.store.feature<SketchFeature>(id)!).filter(Boolean)),
      (sk) => this.toggle(sk),
    );
    this.handler = {
      cursor: "pointer",
      onPointerMove: (e) => {
        this.picker.move(e);
        this.draw();
      },
      onPointerDown: (e) => {
        if (e.button === 0) this.picker.click(e);
      },
    };
    this.openPanel(this.editing ? `ロフト: ${this.feature.name}` : "ロフト", "loft");
    const p = this.panel;
    const sec = p.section("断面");
    this.secPick = p.picker(sec, "断面", "sketch", () => {}, () => this.update((f) => (f.sketches = [])));
    this.secPick.setActive(true);
    this.list = h("ol", { class: "pp-list" });
    sec.appendChild(this.list);
    p.note(sec, "断面のスケッチを順番にクリック (またはブラウザで選択) します。各スケッチの外側の輪郭が使われます。");
    const opt = p.section("オプション");
    p.checkbox(opt, "ルールド (直線で接続)", this.feature.ruled, (v) => this.update((f) => (f.ruled = v)));
    const out = p.section("出力");
    p.toggles(out, "ブール演算", OPS, this.feature.op, (v) => this.update((x) => (x.op = v as BoolOp)));
    this.refresh();
    app.status("ロフトの断面にするスケッチを順にクリック");
  }

  onBrowserSelect(id: string): boolean {
    if (this.app.store.feature(id)?.type === "sketch") this.toggle(id);
    return true;
  }

  private toggle(sk: string) {
    this.update((f) => {
      const k = f.sketches.indexOf(sk);
      if (k >= 0) f.sketches.splice(k, 1);
      else f.sketches.push(sk);
    });
    this.refresh();
  }

  private draw() {
    const hov = this.picker.hover;
    const ids = new Set([...this.feature.sketches, ...(hov ? [hov.sketch] : [])]);
    this.app.renderSketches(
      [...ids].map((id) => {
        const st = this.app.sketchState(id);
        const idx = st ? st.regions.findIndex((r) => !r.island) : -1;
        return { sketchId: id, selected: new Set(this.feature.sketches.includes(id) && idx >= 0 ? [idx] : []), hover: hov?.sketch === id ? hov.index : null };
      }),
    );
  }

  private refresh() {
    const names = this.feature.sketches.map((id) => this.app.store.feature(id)?.name ?? "?");
    this.secPick.setCount(names.length, names.length ? `${names.length} 断面` : "選択してください");
    this.list.innerHTML = "";
    names.forEach((n) => this.list.appendChild(h("li", {}, n)));
    this.draw();
  }
}

// --------------------------------------------------------------- sweep ---

class SweepCommand extends FeatureCommand<SweepFeature> {
  readonly id = "sweep";
  private picker: ProfilePicker;
  private profPick!: ReturnType<PropertyPanel["picker"]>;

  constructor(app: App, existing: SweepFeature | null) {
    const sketches = profileSketches(app);
    const doc = app.store.doc;
    const consumed = new Set(doc.features.flatMap(featureSketchRefs));
    const openSketches = doc.features.filter(
      (f): f is SketchFeature => f.type === "sketch" && !consumed.has(f.id) && (app.sketchState(f.id)?.regions.length ?? 0) === 0 && f.entities.some((e) => (e.type === "line" || e.type === "arc") && !e.construction),
    );
    const auto = sketches.length === 1 ? sketches[0].id : "";
    super(app, existing, () => {
      const st = auto ? app.sketchState(auto) : undefined;
      const prof = st ? [st.regions.findIndex((r) => !r.island)].filter((i) => i >= 0) : [];
      return {
        id: uid("sw"),
        type: "sweep",
        name: app.store.nextFeatureName("sweep"),
        sketch: auto,
        profiles: prof,
        profilePts: st ? prof.map((i) => regionSample(st.regions[i])) : [],
        path: openSketches.length === 1 ? openSketches[0].id : "",
        op: app.hasBodies() ? "join" : "new",
      };
    });
    this.picker = new ProfilePicker(
      app,
      () => this.feature.sketch,
      () => profileSketches(app, this.feature.sketch),
      (sk, i, sample) => {
        this.update((f) => {
          if (f.sketch !== sk) (f.sketch = sk), (f.profiles = []), (f.profilePts = []);
          const k = f.profiles.indexOf(i);
          const pts = f.profilePts ?? [];
          if (k >= 0) f.profiles.splice(k, 1), pts.splice(k, 1);
          else f.profiles.push(i), pts.push(sample);
          f.profilePts = pts;
        });
        this.picker.selected = this.feature.profiles;
        this.picker.draw();
        this.profPick.setCount(this.feature.profiles.length);
      },
    );
    this.picker.selected = this.feature.profiles;
    this.handler = {
      cursor: "pointer",
      onPointerMove: (e) => this.picker.move(e),
      onPointerDown: (e) => {
        if (e.button === 0) this.picker.click(e);
      },
    };
    this.openPanel(this.editing ? `スイープ: ${this.feature.name}` : "スイープ", "sweep");
    const p = this.panel;
    const inp = p.section("入力ジオメトリ");
    this.profPick = p.picker(inp, "プロファイル", "sketch", () => {});
    this.profPick.setActive(true);
    this.profPick.setCount(this.feature.profiles.length);
    const allSketches = doc.features.filter((f): f is SketchFeature => f.type === "sketch" && f.id !== this.featureId);
    p.select(
      inp,
      "パス",
      [{ value: "", label: "パスのスケッチを選択…" }, ...allSketches.map((s) => ({ value: s.id, label: s.name }))],
      this.feature.path,
      (v) => this.update((f) => (f.path = v)),
    );
    p.note(inp, "パスは線分・円弧をつなげた 1 本の曲線です (別のスケッチに作成し、プロファイルと交差させます)。");
    const out = p.section("出力");
    p.toggles(out, "ブール演算", OPS, this.feature.op, (v) => this.update((x) => (x.op = v as BoolOp)));
    this.picker.draw();
    app.status("スイープするプロファイルを選択し、パスのスケッチを指定");
  }
}

// ------------------------------------------------- fillet / chamfer / shell ---

abstract class TopoCommand<F extends FilletFeature | ChamferFeature | ShellFeature> extends FeatureCommand<F> {
  protected pick!: ReturnType<PropertyPanel["picker"]>;
  protected abstract kind: "edge" | "face";

  protected setup() {
    this.handler = {
      cursor: "pointer",
      onPointerMove: (e, vp) => vp.setHover(vp.pick(e)),
      onPointerDown: (e, vp) => {
        if (e.button !== 0) return;
        const p = vp.pick(e);
        if (p) this.toggle(p);
      },
      onContextMenu: () => {
        this.app.finishCommand(this, true);
        return true;
      },
    };
    this.app.vp.pickKinds = new Set([this.kind]);
    this.app.vp.pickFilter = null;
    // seed with the current model selection
    const pre = this.app.vp.selection.filter((p) => p.kind === this.kind);
    if (pre.length && !this.editing) for (const p of pre) this.toggle(p);
    this.app.vp.setSelection([]);
    this.app.scheduleRegen(0);
  }

  captureBefore() {
    return this.featureId;
  }

  protected refs(): { mid?: Vec3; center?: Vec3 }[] {
    const f = this.feature as unknown as { edges?: { mid: Vec3 }[]; faces?: { center: Vec3 }[] };
    return (this.kind === "edge" ? f.edges : f.faces) ?? [];
  }

  private toggle(p: Pick) {
    if (this.kind === "edge") {
      const r = this.app.edgeRef(p);
      if (!r) return;
      this.update((f) => {
        const ff = f as unknown as FilletFeature;
        const k = ff.edges.findIndex((x) => dist3(x.mid, r.mid) < 1e-6);
        if (k >= 0) ff.edges.splice(k, 1);
        else ff.edges.push(r);
      });
    } else {
      const r = this.app.faceRef(p);
      if (!r) return;
      this.update((f) => {
        const ff = f as unknown as ShellFeature;
        const k = ff.faces.findIndex((x) => dist3(x.center, r.center) < 1e-6);
        if (k >= 0) ff.faces.splice(k, 1);
        else ff.faces.push(r);
      });
    }
    this.syncHighlight();
  }

  /** Highlight the referenced topology on the pick model. */
  protected syncHighlight() {
    const refs = this.refs();
    const sel: Pick[] = [];
    this.app.pickBodies.forEach((b, bi) => {
      if (this.kind === "edge")
        b.edges.forEach((e, ei) => {
          if (refs.some((r) => r.mid && dist3(r.mid, e.mid) < 1e-4)) sel.push({ kind: "edge", body: bi, index: ei, point: e.mid });
        });
      else
        b.faces.forEach((f, fi) => {
          if (refs.some((r) => r.center && dist3(r.center, f.center) < 1e-4)) sel.push({ kind: "face", body: bi, index: fi, point: f.center });
        });
    });
    this.app.vp.setSelection(sel);
    this.pick.setCount(refs.length);
  }

  onRegen() {
    super.onRegen();
    this.syncHighlight();
  }
}

function dist3(a: Vec3, b: Vec3) {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

class FilletCommand extends TopoCommand<FilletFeature> {
  readonly id = "fillet";
  protected kind = "edge" as const;
  constructor(app: App, existing: FilletFeature | null) {
    super(app, existing, () => {
      const id = uid("fl");
      return { id, type: "fillet", name: app.store.nextFeatureName("fillet"), edges: [], radius: app.store.addParam(app.store.doc, "2", "mm", id) };
    });
    this.openPanel(this.editing ? `フィレット: ${this.feature.name}` : "フィレット", "fillet", true);
    const sec = this.panel.section("エッジ");
    this.pick = this.panel.picker(sec, "エッジ", "fillet", () => {}, () => this.update((f) => (f.edges = [])));
    this.pick.setActive(true);
    const r = this.panel.expr(sec, "半径", this.expr(this.feature.radius), "mm", (e) => this.setParam(this.feature.radius, e), this.feature.radius);
    setTimeout(() => r.input.focus(), 50);
    this.panel.note(sec, "クリックでエッジを追加/除外します (Shift 不要)");
    this.setup();
    app.status("フィレットするエッジを選択");
  }
}

class ChamferCommand extends TopoCommand<ChamferFeature> {
  readonly id = "chamfer";
  protected kind = "edge" as const;
  constructor(app: App, existing: ChamferFeature | null) {
    super(app, existing, () => {
      const id = uid("ch");
      return { id, type: "chamfer", name: app.store.nextFeatureName("chamfer"), edges: [], distance: app.store.addParam(app.store.doc, "1", "mm", id) };
    });
    this.openPanel(this.editing ? `面取り: ${this.feature.name}` : "面取り", "chamfer", true);
    const sec = this.panel.section("エッジ");
    this.pick = this.panel.picker(sec, "エッジ", "chamfer", () => {}, () => this.update((f) => (f.edges = [])));
    this.pick.setActive(true);
    const d = this.panel.expr(sec, "距離", this.expr(this.feature.distance), "mm", (e) => this.setParam(this.feature.distance, e), this.feature.distance);
    setTimeout(() => d.input.focus(), 50);
    this.setup();
    app.status("面取りするエッジを選択");
  }
}

class ShellCommand extends TopoCommand<ShellFeature> {
  readonly id = "shell";
  protected kind = "face" as const;
  constructor(app: App, existing: ShellFeature | null) {
    super(app, existing, () => {
      const id = uid("sh");
      return { id, type: "shell", name: app.store.nextFeatureName("shell"), faces: [], thickness: app.store.addParam(app.store.doc, "2", "mm", id) };
    });
    this.openPanel(this.editing ? `シェル: ${this.feature.name}` : "シェル", "shell");
    const sec = this.panel.section("入力");
    this.pick = this.panel.picker(sec, "除去する面", "shell", () => {}, () => this.update((f) => (f.faces = [])));
    this.pick.setActive(true);
    this.panel.toggles(
      sec,
      "方向",
      [
        { value: "inside", icon: "shell", title: "内側" },
        { value: "outside", icon: "box", title: "外側" },
      ],
      this.feature.outside ? "outside" : "inside",
      (v) => this.update((f) => (f.outside = v === "outside")),
    );
    this.panel.expr(sec, "厚さ", this.expr(this.feature.thickness), "mm", (e) => this.setParam(this.feature.thickness, e), this.feature.thickness);
    this.setup();
    app.status("除去する (開口する) 面を選択");
  }
}

// ------------------------------------------------------------ press/pull ---

class PushPullCommand extends FeatureCommand<PushPullFeature> {
  readonly id = "pushpull";
  private pick: ReturnType<PropertyPanel["picker"]>;
  private dist: ReturnType<PropertyPanel["expr"]>;
  private drag: { y: number; start: number } | null = null;

  constructor(app: App, existing: PushPullFeature | null) {
    super(app, existing, () => {
      const id = uid("pp");
      return { id, type: "pushpull", name: app.store.nextFeatureName("pushpull"), face: null, distance: app.store.addParam(app.store.doc, "5", "mm", id) };
    });
    this.openPanel(this.editing ? `プレス/プル: ${this.feature.name}` : "プレス/プル", "pushpull", true);
    const sec = this.panel.section("面");
    this.pick = this.panel.picker(sec, "面", "pushpull", () => {});
    this.pick.setActive(true);
    this.pick.setCount(this.feature.face ? 1 : 0, this.feature.face ? "平面" : "平面を選択");
    this.dist = this.panel.expr(sec, "距離", this.expr(this.feature.distance), "mm", (e) => this.setParam(this.feature.distance, e), this.feature.distance);
    this.panel.note(sec, "正の値で押し出し (追加)、負の値で押し込み (除去)。面を選んだ後、ビュー上で上下にドラッグしても変更できます。");
    app.vp.pickKinds = new Set(["face"]);
    app.vp.pickFilter = (p) => app.pickBodies[p.body]?.faces[p.index]?.type === "PLANE";
    this.handler = {
      cursor: "pointer",
      onPointerMove: (e, vp) => {
        if (this.drag) {
          const v = this.drag.start + (this.drag.y - e.clientY) * vp.pixelSize * (e.shiftKey ? 0.1 : 1);
          const t = formatNumber(Math.round(v * 10) / 10, 2);
          this.dist.set(t);
          this.setParam(this.feature.distance, t);
          return;
        }
        vp.setHover(vp.pick(e));
      },
      onPointerDown: (e, vp) => {
        if (e.button !== 0) return;
        const p = vp.pick(e);
        if (p && !this.sameFace(p)) {
          const r = app.faceRef(p);
          if (!r) return;
          this.update((f) => (f.face = r));
          this.pick.setCount(1, "平面");
          vp.setSelection([p]);
        }
        if (this.feature.face) this.drag = { y: e.clientY, start: Number(app.values().get(this.feature.distance) ?? 0) };
      },
      onPointerUp: () => (this.drag = null),
    };
    app.status("押し出す/押し込む平面をクリック (選択後ドラッグで距離を変更)");
  }

  private sameFace(p: Pick): boolean {
    const f = this.app.pickBodies[p.body]?.faces[p.index];
    return !!f && !!this.feature.face && dist3(f.center, this.feature.face.center) < 1e-6;
  }

  captureBefore() {
    return this.featureId;
  }
}

// -------------------------------------------------------------- thread ---

class ThreadCommand extends FeatureCommand<ThreadFeature> {
  readonly id = "thread";
  private pick: ReturnType<PropertyPanel["picker"]>;

  constructor(app: App, existing: ThreadFeature | null) {
    super(app, existing, () => {
      const id = uid("th");
      const P = (e: string) => app.store.addParam(app.store.doc, e, "mm", id);
      return { id, type: "thread", name: app.store.nextFeatureName("thread"), face: null, size: "", length: P("10"), full: true, offset: P("0"), flip: false };
    });
    const f = this.feature;
    this.openPanel(this.editing ? `ねじ: ${f.name}` : "ねじ", "thread");
    const p = this.panel;
    const sec = p.section("配置");
    this.pick = p.picker(sec, "面", "thread", () => {});
    this.pick.setActive(true);
    this.pick.setCount(f.face ? 1 : 0, f.face ? "円筒面" : "円筒面を選択");
    p.checkbox(sec, "方向を反転", f.flip, (v) => this.update((x) => (x.flip = v)));
    const spec = p.section("仕様");
    const cur = threadByName(f.size);
    const fam = p.select(
      spec,
      "規格",
      (Object.keys(FAMILY_LABEL) as ThreadFamily[]).map((k) => ({ value: k, label: FAMILY_LABEL[k] })),
      cur?.family ?? "M",
      () => fillSizes(),
    );
    const size = p.select(spec, "呼び", [], f.size, (v) => this.update((x) => (x.size = v)));
    const fillSizes = () => {
      size.innerHTML = "";
      size.appendChild(h("option", { value: "" }, "自動 (面の直径から)"));
      for (const t of threadsOf(fam.value as ThreadFamily)) size.appendChild(h("option", { value: t.name, selected: t.name === this.feature.size }, `${t.name}  (P${formatNumber(t.pitch, 3)})`));
      if (!threadsOf(fam.value as ThreadFamily).some((t) => t.name === this.feature.size)) {
        size.value = "";
        if (this.feature.size) this.update((x) => (x.size = ""));
      }
    };
    fillSizes();
    const len = p.section("長さ");
    const lenF = p.expr(len, "長さ", this.expr(f.length), "mm", (e) => this.setParam(this.feature.length, e), f.length);
    lenF.el.style.display = f.full ? "none" : "";
    p.checkbox(len, "全長", f.full, (v) => {
      this.update((x) => (x.full = v));
      lenF.el.style.display = v ? "none" : "";
    });
    p.expr(len, "オフセット", this.expr(f.offset), "mm", (e) => this.setParam(this.feature.offset, e), f.offset);
    p.note(len, "ねじは外観表示 (コスメティック) です。図面では JIS B 0002 の略画法 (谷径の細線・3/4 円) で描かれ、穴注記に呼びが入ります。");
    app.vp.pickKinds = new Set(["face"]);
    app.vp.pickFilter = (pk) => app.pickBodies[pk.body]?.faces[pk.index]?.type === "CYLINDRE";
    this.handler = {
      cursor: "pointer",
      onPointerMove: (e, vp) => vp.setHover(vp.pick(e)),
      onPointerDown: (e, vp) => {
        if (e.button !== 0) return;
        const pk = vp.pick(e);
        if (!pk) return;
        const r = app.faceRef(pk);
        if (!r) return;
        this.update((x) => (x.face = r));
        this.pick.setCount(1, "円筒面");
        vp.setSelection([pk]);
      },
    };
    app.status("ねじを付ける円筒面 (軸・穴) をクリック");
  }

  captureBefore() {
    return this.featureId;
  }
}

// ---------------------------------------------------------------- hole ---

class HoleCommand extends FeatureCommand<HoleFeature> {
  readonly id = "hole";
  private placement!: ReturnType<PropertyPanel["picker"]>;
  private ownSketch = false;

  constructor(app: App, existing: HoleFeature | null) {
    // use a selected / single unconsumed sketch with points, otherwise click faces
    const doc = app.store.doc;
    const consumed = new Set(doc.features.flatMap(featureSketchRefs));
    const withPts = doc.features.filter((f): f is SketchFeature => f.type === "sketch" && !consumed.has(f.id) && holeCenterPoints(f).length > 0);
    const pre = [...app.browserSelection].find((id) => withPts.some((s) => s.id === id)) ?? (withPts.length === 1 ? withPts[0].id : "");
    super(app, existing, () => {
      const id = uid("ho");
      const P = (e: string, u: "mm" | "deg" = "mm") => app.store.addParam(app.store.doc, e, u, id);
      return {
        id,
        type: "hole",
        name: app.store.nextFeatureName("hole"),
        sketch: pre,
        points: [],
        holeType: "simple",
        diameter: P("6"),
        depth: P("10"),
        through: true,
        cbDiameter: P("11"),
        cbDepth: P("6.5"),
        csDiameter: P("12"),
        csAngle: P("90", "deg"),
        flip: false,
      };
    });
    this.handler = {
      cursor: "crosshair",
      onPointerMove: (e, vp) => vp.setHover(vp.pick(e, new Set(["face"]))),
      onPointerDown: (e, vp) => {
        if (e.button !== 0) return;
        const p = vp.pick(e, new Set(["face"]));
        if (p) this.placeOnFace(p);
      },
    };
    app.vp.pickKinds = new Set(["face"]);
    this.buildPanel();
    app.status(this.feature.sketch ? "スケッチの点に穴を配置しました — 面をクリックすると点を追加できます" : "穴を配置する平面をクリック");
  }

  captureBefore() {
    return this.featureId;
  }

  private placeOnFace(p: Pick) {
    const pl = this.app.planeOf(p);
    if (!pl) {
      toast("穴は平面上に配置してください", "warn");
      return;
    }
    const f = this.feature;
    const sk = f.sketch ? this.app.store.feature<SketchFeature>(f.sketch) : undefined;
    if (sk && !this.ownSketch) {
      toast("スケッチの点から穴を作成中です。面に配置する場合は新しい穴コマンドを使用してください", "info");
      return;
    }
    if (sk) {
      const n = sk.plane.normal, m = pl.plane.normal;
      const coplanar = Math.abs(n[0] * m[0] + n[1] * m[1] + n[2] * m[2]) > 0.9999 && Math.abs(worldToPlaneDist(sk.plane, pl.plane.origin)) < 1e-4;
      if (!coplanar) {
        toast("同じ平面上に配置してください", "warn");
        return;
      }
      const uv = worldToPlane(sk.plane, p.point);
      this.app.store.patch((doc) => {
        const s = doc.features.find((x) => x.id === sk.id) as SketchFeature;
        s.entities.push({ id: uid("p"), type: "point", x: uv[0], y: uv[1] });
      }, "preview");
    } else {
      const skId = uid("sk");
      const origin = worldToPlane(pl.plane, [0, 0, 0]);
      const uv = worldToPlane(pl.plane, p.point);
      this.ownSketch = true;
      this.app.store.patch((doc) => {
        const idx = doc.features.findIndex((x) => x.id === this.featureId);
        doc.features.splice(idx, 0, {
          id: skId,
          type: "sketch",
          name: this.app.store.nextFeatureName("sketch"),
          plane: pl.plane,
          planeLabel: pl.label,
          entities: [
            { id: "origin", type: "point", x: origin[0], y: origin[1], fixed: true, ref: true },
            { id: uid("p"), type: "point", x: uv[0], y: uv[1] },
          ],
          constraints: [],
          dimensions: [],
        });
        doc.endOfPart++;
        (doc.features.find((x) => x.id === this.featureId) as HoleFeature).sketch = skId;
      }, "preview");
    }
    this.refreshCount();
  }

  private refreshCount() {
    const sk = this.app.store.feature<SketchFeature>(this.feature.sketch);
    const n = sk ? holeCenterPoints(sk).length : 0;
    this.placement.setCount(n, n ? `${n} 個の中心` : "面をクリック");
  }

  private buildPanel() {
    const f = this.feature;
    this.openPanel(this.editing ? `穴: ${f.name}` : "穴", "hole");
    const p = this.panel;
    const pos = p.section("配置");
    this.placement = p.picker(pos, "位置", "point", () => {});
    this.placement.setActive(true);
    this.refreshCount();
    p.note(pos, "平面をクリックして穴の中心を追加。位置はスケッチを編集して寸法で調整できます。");
    const typ = p.section("タイプ");
    const update = () => {
      cb1.el.style.display = cb2.el.style.display = this.feature.holeType === "counterbore" ? "" : "none";
      cs1.el.style.display = cs2.el.style.display = this.feature.holeType === "countersink" ? "" : "none";
      depth.el.style.display = this.feature.through ? "none" : "";
    };
    p.toggles(
      typ,
      "シート",
      [
        { value: "simple", icon: "hole", title: "なし (単純穴)" },
        { value: "counterbore", icon: "cylinder", title: "座ぐり" },
        { value: "countersink", icon: "chamfer", title: "皿穴" },
      ],
      f.holeType,
      (v) => {
        this.update((x) => (x.holeType = v as HoleFeature["holeType"]));
        update();
      },
    );
    // standard holes (Inventor: drilled / clearance / tapped)
    if (!f.threadLength) this.update((x) => (x.threadLength = this.app.store.addParam(this.app.store.doc, "10", "mm", x.id)));
    const stdSec = p.section("規格");
    const kind = p.select(
      stdSec,
      "穴の種類",
      [
        { value: "custom", label: "単純穴 (直径指定)" },
        { value: "clearance", label: "キリ穴 (ボルト用, ISO 273)" },
        { value: "tapped", label: "ねじ穴 (タップ)" },
      ],
      f.standard ?? "custom",
      (v) => {
        this.update((x) => (x.standard = v as HoleFeature["standard"]));
        if (v !== "custom" && !this.feature.size) this.update((x) => (x.size = "M6"));
        stdUpdate();
        applyStd();
      },
    );
    const famSel = p.select(
      stdSec,
      "規格",
      (Object.keys(FAMILY_LABEL) as ThreadFamily[]).map((k) => ({ value: k, label: FAMILY_LABEL[k] })),
      threadByName(f.size ?? "")?.family ?? "M",
      () => {
        fillSizes();
        applyStd();
      },
    );
    const sizeSel = p.select(stdSec, "呼び", [], f.size ?? "M6", (v) => {
      this.update((x) => (x.size = v));
      applyStd();
    });
    const fillSizes = () => {
      sizeSel.innerHTML = "";
      const list = threadsOf(famSel.value as ThreadFamily);
      for (const t of list) sizeSel.appendChild(h("option", { value: t.name, selected: t.name === this.feature.size }, t.name));
      if (!list.some((t) => t.name === this.feature.size)) {
        sizeSel.value = list[0].name;
        if ((this.feature.standard ?? "custom") !== "custom") this.update((x) => (x.size = list[0].name));
      }
    };
    const fitSel = p.select(
      stdSec,
      "はめあい",
      (Object.keys(FIT_LABEL) as Fit[]).map((k) => ({ value: k, label: FIT_LABEL[k] })),
      f.fit ?? "normal",
      (v) => {
        this.update((x) => (x.fit = v as Fit));
        applyStd();
      },
    );
    const thrLen = p.expr(stdSec, "ねじ深さ", this.expr(f.threadLength ?? "10"), "mm", (e) => this.setParam(this.feature.threadLength!, e), f.threadLength);
    const thrFull = p.checkbox(stdSec, "全長ねじ", f.threadFull !== false, (v) => {
      this.update((x) => (x.threadFull = v));
      stdUpdate();
    });
    const stdNote = p.note(stdSec, "");
    const row = (el: HTMLElement) => (el.closest(".field") as HTMLElement) ?? el;
    const stdUpdate = () => {
      const k = this.feature.standard ?? "custom";
      row(famSel).style.display = row(sizeSel).style.display = k === "custom" ? "none" : "";
      row(fitSel).style.display = k === "clearance" ? "" : "none";
      row(thrFull).style.display = k === "tapped" ? "" : "none";
      thrLen.el.style.display = k === "tapped" && this.feature.threadFull === false ? "" : "none";
      const t = threadByName(this.feature.size ?? "");
      stdNote.textContent =
        k === "tapped" && t ? `下穴径 φ${formatNumber(tapDrill(t), 2)} / ピッチ ${formatNumber(t.pitch, 3)}` : k === "clearance" && t ? `キリ穴径 φ${formatNumber(clearanceHole(t.d, this.feature.fit ?? "normal"), 2)}` : "";
      stdNote.style.display = stdNote.textContent ? "" : "none";
    };
    /** Drive diameter / counterbore from the standard tables. */
    const applyStd = () => {
      const x = this.feature;
      const t = threadByName(x.size ?? "");
      if (!t || (x.standard ?? "custom") === "custom") return stdUpdate();
      const dia = x.standard === "tapped" ? tapDrill(t) : clearanceHole(t.d, x.fit ?? "normal");
      const fx = (n: number) => formatNumber(n, 3);
      this.setParam(x.diameter, fx(dia));
      diaF.set(fx(dia));
      if (x.standard === "clearance") {
        const cb = counterbore(t.d);
        this.setParam(x.cbDiameter, fx(cb.dia));
        this.setParam(x.cbDepth, fx(cb.depth));
        cb1.set(fx(cb.dia));
        cb2.set(fx(cb.depth));
        this.setParam(x.csDiameter, fx(countersink(t.d)));
        cs1.set(fx(countersink(t.d)));
      }
      stdUpdate();
    };
    const dims = p.section("寸法");
    const diaF = p.expr(dims, "直径", this.expr(f.diameter), "mm", (e) => this.setParam(this.feature.diameter, e), f.diameter);
    const cb1 = p.expr(dims, "座ぐり径", this.expr(f.cbDiameter), "mm", (e) => this.setParam(this.feature.cbDiameter, e), f.cbDiameter);
    const cb2 = p.expr(dims, "座ぐり深さ", this.expr(f.cbDepth), "mm", (e) => this.setParam(this.feature.cbDepth, e), f.cbDepth);
    const cs1 = p.expr(dims, "皿径", this.expr(f.csDiameter), "mm", (e) => this.setParam(this.feature.csDiameter, e), f.csDiameter);
    const cs2 = p.expr(dims, "皿角度", this.expr(f.csAngle), "deg", (e) => this.setParam(this.feature.csAngle, e), f.csAngle);
    p.toggles(
      dims,
      "終端",
      [
        { value: "through", icon: "through", title: "貫通" },
        { value: "distance", icon: "distance", title: "距離" },
      ],
      f.through ? "through" : "distance",
      (v) => {
        this.update((x) => (x.through = v === "through"));
        update();
      },
    );
    const depth = p.expr(dims, "深さ", this.expr(f.depth), "mm", (e) => this.setParam(this.feature.depth, e), f.depth);
    p.checkbox(dims, "方向を反転", f.flip, (v) => this.update((x) => (x.flip = v)));
    update();
    fillSizes();
    stdUpdate();
    void kind;
  }
}

function worldToPlaneDist(p: PlaneDef, w: Vec3): number {
  return (w[0] - p.origin[0]) * p.normal[0] + (w[1] - p.origin[1]) * p.normal[1] + (w[2] - p.origin[2]) * p.normal[2];
}

// ------------------------------------------------------ pattern / mirror ---

const AXIS_OPTS = [
  { value: "X", label: "X 軸" },
  { value: "Y", label: "Y 軸" },
  { value: "Z", label: "Z 軸" },
];

abstract class FeatureListCommand<F extends PatternFeature | MirrorFeature> extends FeatureCommand<F> {
  protected featPick!: ReturnType<PropertyPanel["picker"]>;

  onBrowserSelect(id: string): boolean {
    const f = this.app.store.feature(id);
    if (!f || id === this.featureId) return true;
    if (!["extrude", "revolve", "hole", "box", "cylinder", "sphere", "torus"].includes(f.type)) {
      toast("押し出し・回転・穴・プリミティブのフィーチャを選択してください", "info");
      return true;
    }
    this.update((x) => {
      const k = x.features.indexOf(id);
      if (k >= 0) x.features.splice(k, 1);
      else x.features.push(id);
    });
    this.app.browserSelection = new Set(this.feature.features);
    this.app.browser.render();
    this.refreshCount();
    return true;
  }

  protected refreshCount() {
    const names = this.feature.features.map((id) => this.app.store.feature(id)?.name).filter(Boolean);
    this.featPick.setCount(names.length, names.length ? names.join(", ") : "ブラウザで選択");
  }

  protected initialFeatures(): string[] {
    const doc = this.app.store.doc;
    return [...this.app.browserSelection].filter((id) => {
      const f = doc.features.find((x) => x.id === id);
      return f && ["extrude", "revolve", "hole", "box", "cylinder", "sphere", "torus"].includes(f.type);
    });
  }

  protected setupFeatures(sec: HTMLElement) {
    this.featPick = this.panel.picker(sec, "フィーチャ", "part", () => {});
    this.featPick.setActive(true);
    this.refreshCount();
    this.app.browserSelection = new Set(this.feature.features);
    this.app.browser.render();
    this.app.status("パターン化するフィーチャをモデル ブラウザでクリック");
  }

  cancel() {
    super.cancel();
    this.app.browserSelection.clear();
  }
  ok() {
    super.ok();
    this.app.browserSelection.clear();
  }
}

class RectPatternCommand extends FeatureListCommand<PatternFeature> {
  readonly id = "rectPattern";
  constructor(app: App, existing: PatternFeature | null) {
    super(app, existing, () => {
      const id = uid("rp");
      const P = (e: string) => app.store.addParam(app.store.doc, e, "ul", id);
      const M = (e: string) => app.store.addParam(app.store.doc, e, "mm", id);
      return {
        id,
        type: "rectPattern",
        name: app.store.nextFeatureName("rectPattern"),
        features: [],
        axis: "X",
        count: P("3"),
        spacing: M("20"),
        axis2: "",
        count2: P("2"),
        spacing2: M("20"),
        flip: false,
      };
    });
    if (!this.editing) this.update((f) => (f.features = this.initialFeatures()));
    const f = this.feature;
    this.openPanel(this.editing ? `矩形状パターン: ${f.name}` : "矩形状パターン", "rectPattern");
    const p = this.panel;
    this.setupFeatures(p.section("フィーチャ"));
    const d1 = p.section("方向 1");
    p.select(d1, "方向", AXIS_OPTS, f.axis, (v) => this.update((x) => (x.axis = v as AxisRef)));
    p.checkbox(d1, "反転", f.flip, (v) => this.update((x) => (x.flip = v)));
    p.expr(d1, "数", this.expr(f.count), "個", (e) => this.setParam(this.feature.count, e), f.count);
    p.expr(d1, "間隔", this.expr(f.spacing), "mm", (e) => this.setParam(this.feature.spacing, e), f.spacing);
    const d2 = p.section("方向 2", !f.axis2);
    p.select(d2, "方向", [{ value: "", label: "なし" }, ...AXIS_OPTS], f.axis2 ?? "", (v) => this.update((x) => (x.axis2 = v as AxisRef | "")));
    p.expr(d2, "数", this.expr(f.count2), "個", (e) => this.setParam(this.feature.count2, e), f.count2);
    p.expr(d2, "間隔", this.expr(f.spacing2), "mm", (e) => this.setParam(this.feature.spacing2, e), f.spacing2);
  }
}

class CircPatternCommand extends FeatureListCommand<PatternFeature> {
  readonly id = "circPattern";
  constructor(app: App, existing: PatternFeature | null) {
    super(app, existing, () => {
      const id = uid("cp");
      return {
        id,
        type: "circPattern",
        name: app.store.nextFeatureName("circPattern"),
        features: [],
        axis: "Y",
        count: app.store.addParam(app.store.doc, "6", "ul", id),
        spacing: app.store.addParam(app.store.doc, "360", "deg", id),
        count2: "1",
        spacing2: "0",
        flip: false,
      };
    });
    if (!this.editing) this.update((f) => (f.features = this.initialFeatures()));
    const f = this.feature;
    this.openPanel(this.editing ? `円形状パターン: ${f.name}` : "円形状パターン", "circPattern");
    const p = this.panel;
    this.setupFeatures(p.section("フィーチャ"));
    const s = p.section("配置");
    p.select(s, "回転軸", AXIS_OPTS, f.axis, (v) => this.update((x) => (x.axis = v as AxisRef)));
    p.checkbox(s, "反転", f.flip, (v) => this.update((x) => (x.flip = v)));
    p.expr(s, "数", this.expr(f.count), "個", (e) => this.setParam(this.feature.count, e), f.count);
    p.expr(s, "角度", this.expr(f.spacing), "deg", (e) => this.setParam(this.feature.spacing, e), f.spacing);
  }
}

class MirrorCommand extends FeatureListCommand<MirrorFeature> {
  readonly id = "mirror";
  constructor(app: App, existing: MirrorFeature | null) {
    super(app, existing, () => {
      const id = uid("mi");
      return { id, type: "mirror", name: app.store.nextFeatureName("mirror"), features: [], plane: "YZ", offset: app.store.addParam(app.store.doc, "0", "mm", id) };
    });
    if (!this.editing) this.update((f) => (f.features = this.initialFeatures()));
    const f = this.feature;
    this.openPanel(this.editing ? `ミラー: ${f.name}` : "ミラー", "mirror");
    const p = this.panel;
    this.setupFeatures(p.section("フィーチャ"));
    const s = p.section("ミラー平面");
    p.select(
      s,
      "平面",
      [
        { value: "YZ", label: "YZ 平面" },
        { value: "XZ", label: "XZ 平面" },
        { value: "XY", label: "XY 平面" },
      ],
      f.plane,
      (v) => this.update((x) => (x.plane = v as MirrorFeature["plane"])),
    );
    p.expr(s, "オフセット", this.expr(f.offset), "mm", (e) => this.setParam(this.feature.offset, e), f.offset);
  }
}

// ---------------------------------------------------------- primitives ---

class PrimitiveCommand extends FeatureCommand<PrimitiveFeature> {
  readonly id: string;
  private planePick!: ReturnType<PropertyPanel["picker"]>;
  constructor(app: App, existing: PrimitiveFeature | null, kind: PrimitiveFeature["type"] = existing?.type ?? "box") {
    const pre = app.vp.selection[0] ? app.planeOf(app.vp.selection[0]) : null;
    super(app, existing, () => {
      const id = uid("pr");
      const M = (e: string) => app.store.addParam(app.store.doc, e, "mm", id);
      const plane = pre?.plane ?? ORIGIN_PLANES.XZ;
      const c = worldToPlane(plane, pre ? (app.vp.selection[0].point as Vec3) : [0, 0, 0]);
      const defaults: Record<string, [string, string, string]> = { box: ["40", "30", "20"], cylinder: ["30", "0", "40"], sphere: ["40", "0", "0"], torus: ["60", "12", "0"] };
      const [a, b, cc] = defaults[kind];
      return {
        id,
        type: kind,
        name: app.store.nextFeatureName(kind),
        plane,
        center: pre ? c : [0, 0],
        a: M(a),
        b: M(b),
        c: M(cc),
        op: app.hasBodies() ? "join" : "new",
      };
    });
    this.id = kind;
    this.handler = {
      cursor: "crosshair",
      onPointerMove: (e, vp) => vp.setHover(vp.pick(e)),
      onPointerDown: (e, vp) => {
        if (e.button !== 0) return;
        const p = vp.pick(e);
        if (!p) return;
        const pl = app.planeOf(p);
        if (!pl) return;
        const c = worldToPlane(pl.plane, p.point);
        this.update((f) => ((f.plane = pl.plane), (f.center = c)));
        this.planePick.setCount(1, pl.label);
      },
    };
    app.showPlanePicker = true;
    app.updateRefs();
    app.vp.pickKinds = new Set(["face", "plane"]);
    app.vp.pickFilter = (p) => p.kind === "plane" || !!app.planeOf(p);
    const f = this.feature;
    const labels: Record<string, string> = { box: "直方体", cylinder: "円柱", sphere: "球", torus: "トーラス" };
    this.openPanel(`${labels[kind]}${this.editing ? `: ${f.name}` : ""}`, kind);
    const p = this.panel;
    const s = p.section("配置");
    this.planePick = p.picker(s, "スケッチ平面", "plane", () => {});
    this.planePick.setActive(true);
    this.planePick.setCount(1, pre?.label ?? "XZ 平面");
    p.note(s, "平面または平らな面をクリックすると、その位置に配置されます");
    const d = p.section("寸法");
    if (kind === "box") {
      p.expr(d, "長さ", this.expr(f.a), "mm", (e) => this.setParam(this.feature.a, e), f.a);
      p.expr(d, "幅", this.expr(f.b), "mm", (e) => this.setParam(this.feature.b, e), f.b);
      p.expr(d, "高さ", this.expr(f.c), "mm", (e) => this.setParam(this.feature.c, e), f.c);
    } else if (kind === "cylinder") {
      p.expr(d, "直径", this.expr(f.a), "mm", (e) => this.setParam(this.feature.a, e), f.a);
      p.expr(d, "高さ", this.expr(f.c), "mm", (e) => this.setParam(this.feature.c, e), f.c);
    } else if (kind === "sphere") {
      p.expr(d, "直径", this.expr(f.a), "mm", (e) => this.setParam(this.feature.a, e), f.a);
    } else {
      p.expr(d, "中心円直径", this.expr(f.a), "mm", (e) => this.setParam(this.feature.a, e), f.a);
      p.expr(d, "断面直径", this.expr(f.b), "mm", (e) => this.setParam(this.feature.b, e), f.b);
    }
    const out = p.section("出力");
    p.toggles(out, "ブール演算", OPS, f.op, (v) => this.update((x) => (x.op = v as BoolOp)));
    app.status("配置する平面をクリック、または寸法を入力して OK");
  }
}

// ----------------------------------------------------------- work plane ---

class WorkPlaneCommand extends FeatureCommand<WorkPlaneFeature> {
  readonly id = "workplane";
  private basePick!: ReturnType<PropertyPanel["picker"]>;
  constructor(app: App, existing: WorkPlaneFeature | null) {
    const pre = app.vp.selection[0] ? app.planeOf(app.vp.selection[0]) : null;
    super(app, existing, () => {
      const id = uid("wp");
      const base = pre?.plane ?? ORIGIN_PLANES.XY;
      return {
        id,
        type: "workplane",
        name: app.store.nextFeatureName("workplane"),
        base,
        baseLabel: pre?.label ?? "XY 平面",
        offset: app.store.addParam(app.store.doc, "20", "mm", id),
      };
    });
    this.handler = {
      cursor: "pointer",
      onPointerMove: (e, vp) => vp.setHover(vp.pick(e)),
      onPointerDown: (e, vp) => {
        if (e.button !== 0) return;
        const p = vp.pick(e);
        const pl = p ? app.planeOf(p) : null;
        if (!pl || p?.key === this.featureId) return;
        this.update((f) => ((f.base = pl.plane), (f.baseLabel = pl.label)));
        this.basePick.setCount(1, pl.label);
      },
    };
    app.showPlanePicker = true;
    app.updateRefs();
    app.vp.pickKinds = new Set(["face", "plane"]);
    app.vp.pickFilter = (p) => p.key !== this.featureId && !!app.planeOf(p);
    const f = this.feature;
    this.openPanel(this.editing ? `作業平面: ${f.name}` : "作業平面 (平面からオフセット)", "workplane");
    const s = this.panel.section("入力");
    this.basePick = this.panel.picker(s, "基準平面", "plane", () => {});
    this.basePick.setActive(true);
    this.basePick.setCount(1, f.baseLabel);
    this.panel.expr(s, "オフセット", this.expr(f.offset), "mm", (e) => this.setParam(this.feature.offset, e), f.offset);
    app.status("基準にする平面または平らな面を選択");
  }
}

// ----------------------------------------------------------------- move ---

class MoveCommand extends FeatureCommand<MoveFeature> {
  readonly id = "move";
  constructor(app: App, existing: MoveFeature | null) {
    super(app, existing, () => {
      const id = uid("mv");
      const M = (e: string, u: "mm" | "deg" = "mm") => app.store.addParam(app.store.doc, e, u, id);
      return { id, type: "move", name: app.store.nextFeatureName("move"), dx: M("0"), dy: M("0"), dz: M("0"), rx: M("0", "deg"), ry: M("0", "deg"), rz: M("0", "deg") };
    });
    const f = this.feature;
    this.openPanel(this.editing ? `ボディを移動: ${f.name}` : "ボディを移動", "move");
    const t = this.panel.section("移動");
    const k = ["dx", "dy", "dz"] as const;
    ["X", "Y", "Z"].forEach((a, i) => this.panel.expr(t, `${a} 方向`, this.expr(f[k[i]]), "mm", (e) => this.setParam(this.feature[k[i]], e), f[k[i]]));
    const r = this.panel.section("回転 (原点まわり)");
    const rk = ["rx", "ry", "rz"] as const;
    ["X", "Y", "Z"].forEach((a, i) => this.panel.expr(r, `${a} 軸`, this.expr(f[rk[i]]), "deg", (e) => this.setParam(this.feature[rk[i]], e), f[rk[i]]));
  }
}

// ---------------------------------------------------------------- sketch ---

class SketchCommand implements Command {
  readonly id = "sketch";
  handler: ToolHandler;
  constructor(private app: App) {
    app.showPlanePicker = true;
    app.updateRefs();
    app.vp.pickKinds = new Set(["face", "plane"]);
    app.vp.pickFilter = (p) => !!app.planeOf(p);
    app.vp.setSelection([]);
    this.handler = {
      cursor: "pointer",
      onPointerMove: (e, vp) => vp.setHover(vp.pick(e)),
      onPointerDown: (e, vp) => {
        if (e.button !== 0) return;
        const p = vp.pick(e);
        const pl = p ? app.planeOf(p) : null;
        if (!pl) return;
        app.finishCommand(this, false);
        app.createSketch(pl.plane, pl.label, pl.ref);
      },
    };
    app.status("スケッチ平面 (原点平面、作業平面、またはモデルの平らな面) を選択");
  }
  ok() {}
  cancel() {
    this.app.showPlanePicker = false;
    this.app.updateRefs();
  }
}

// --------------------------------------------------------------- measure ---

class MeasureCommand implements Command {
  readonly id = "measure";
  handler: ToolHandler;
  private picks: Pick[] = [];
  private out: HTMLElement;
  private panel: PropertyPanel;
  constructor(private app: App) {
    app.vp.pickKinds = new Set(["face", "edge"]);
    this.panel = new PropertyPanel(app.panelHost, "測定", "measure", { onOk: () => app.finishCommand(this, true), onCancel: () => app.finishCommand(this, false) }, () => app.values());
    const s = this.panel.section("結果");
    this.out = h("div", { class: "measure-out" }, "面またはエッジを選択してください (2 つ選ぶと距離・角度)");
    s.appendChild(this.out);
    s.appendChild(h("button", { class: "btn", onClick: () => this.reset() }, iconEl("trash"), "クリア"));
    this.handler = {
      cursor: "crosshair",
      onPointerMove: (e, vp) => vp.setHover(vp.pick(e)),
      onPointerDown: (e, vp) => {
        if (e.button !== 0) return;
        const p = vp.pick(e);
        if (!p) return;
        if (this.picks.length >= 2 || this.picks.some((x) => samePick(x, p))) this.picks = [];
        this.picks.push(p);
        vp.setSelection([...this.picks]);
        void this.compute();
      },
    };
    app.status("測定する面・エッジをクリック");
  }
  private reset() {
    this.picks = [];
    this.app.vp.setSelection([]);
    this.out.textContent = "面またはエッジを選択してください";
  }
  private async compute() {
    const [a, b] = this.picks;
    try {
      const r = await this.app.kernel.measure(
        { body: a.body, kind: a.kind as "face", index: a.index },
        b ? { body: b.body, kind: b.kind as "face", index: b.index } : undefined,
      );
      const rows: [string, string][] = [];
      if (r.length !== undefined) rows.push(["長さ", `${formatNumber(r.length, 4)} mm`]);
      if (r.radius) rows.push(["半径", `${formatNumber(r.radius, 4)} mm`], ["直径", `${formatNumber(r.radius * 2, 4)} mm`]);
      if (r.area !== undefined) rows.push(["面積", `${formatNumber(r.area, 4)} mm²`]);
      if (r.distance !== undefined) rows.push(["最小距離", `${formatNumber(r.distance, 4)} mm`]);
      if (r.angle !== undefined) rows.push(["角度", `${formatNumber(r.angle, 3)}°`]);
      if (a.kind === "face" && !b) {
        const f = this.app.pickBodies[a.body].faces[a.index];
        rows.push(["法線", f.normal.map((v) => formatNumber(v, 3)).join(", ")]);
      }
      this.out.innerHTML = "";
      this.out.appendChild(h("table", { class: "kv" }, ...rows.map(([k, v]) => h("tr", {}, h("th", {}, k), h("td", {}, v)))));
    } catch (e) {
      this.out.textContent = (e as Error).message;
    }
  }
  ok() {
    this.panel.close();
  }
  cancel() {
    this.panel.close();
  }
}

// -------------------------------------------------------------- registry ---

export function buildCommands(app: App): CommandRegistry {
  const info: Record<string, CommandInfo> = {
    sketch: { id: "sketch", label: "2D スケッチ", icon: "sketch" },
    extrude: { id: "extrude", label: "押し出し", icon: "extrude" },
    revolve: { id: "revolve", label: "回転", icon: "revolve" },
    loft: { id: "loft", label: "ロフト", icon: "loft" },
    sweep: { id: "sweep", label: "スイープ", icon: "sweep" },
    pushpull: { id: "pushpull", label: "プレス/プル", icon: "pushpull" },
    fillet: { id: "fillet", label: "フィレット", icon: "fillet" },
    chamfer: { id: "chamfer", label: "面取り", icon: "chamfer" },
    shell: { id: "shell", label: "シェル", icon: "shell" },
    hole: { id: "hole", label: "穴", icon: "hole" },
    thread: { id: "thread", label: "ねじ", icon: "thread" },
    rectPattern: { id: "rectPattern", label: "矩形状パターン", icon: "rectPattern" },
    circPattern: { id: "circPattern", label: "円形状パターン", icon: "circPattern" },
    mirror: { id: "mirror", label: "ミラー", icon: "mirror" },
    box: { id: "box", label: "直方体", icon: "box" },
    cylinder: { id: "cylinder", label: "円柱", icon: "cylinder" },
    sphere: { id: "sphere", label: "球", icon: "sphere" },
    torus: { id: "torus", label: "トーラス", icon: "torus" },
    workplane: { id: "workplane", label: "作業平面", icon: "workplane" },
    move: { id: "move", label: "ボディを移動", icon: "move" },
    measure: { id: "measure", label: "測定", icon: "measure" },
  };
  const make = (id: string, f: Feature | null): Command | null => {
    switch (id) {
      case "sketch":
        return new SketchCommand(app);
      case "extrude":
        return new ExtrudeCommand(app, f as ExtrudeFeature | null);
      case "revolve":
        return new RevolveCommand(app, f as RevolveFeature | null);
      case "loft":
        return new LoftCommand(app, f as LoftFeature | null);
      case "pushpull":
        return new PushPullCommand(app, f as PushPullFeature | null);
      case "sweep":
        return new SweepCommand(app, f as SweepFeature | null);
      case "fillet":
        return new FilletCommand(app, f as FilletFeature | null);
      case "chamfer":
        return new ChamferCommand(app, f as ChamferFeature | null);
      case "shell":
        return new ShellCommand(app, f as ShellFeature | null);
      case "hole":
        return new HoleCommand(app, f as HoleFeature | null);
      case "thread":
        return new ThreadCommand(app, f as ThreadFeature | null);
      case "rectPattern":
        return new RectPatternCommand(app, f as PatternFeature | null);
      case "circPattern":
        return new CircPatternCommand(app, f as PatternFeature | null);
      case "mirror":
        return new MirrorCommand(app, f as MirrorFeature | null);
      case "box":
      case "cylinder":
      case "sphere":
      case "torus":
        return new PrimitiveCommand(app, f as PrimitiveFeature | null, id);
      case "workplane":
        return new WorkPlaneCommand(app, f as WorkPlaneFeature | null);
      case "move":
        return new MoveCommand(app, f as MoveFeature | null);
      case "measure":
        return new MeasureCommand(app);
    }
    return null;
  };
  const needsProfile = new Set(["extrude", "revolve", "loft", "sweep"]);
  const needsBody = new Set(["fillet", "chamfer", "shell", "hole", "move", "pushpull", "thread"]);
  return {
    get: (id) => info[id],
    run: (id) => {
      if (app.mode === "sketch") app.exitSketch(true);
      if (app.command) app.finishCommand(app.command, false);
      if (needsProfile.has(id) && profileSketches(app).length === 0) {
        toast("閉じたプロファイルを持つスケッチがありません。先に 2D スケッチを作成してください", "warn");
        return;
      }
      if (needsBody.has(id) && !app.hasBodies()) {
        toast("このコマンドにはソリッド ボディが必要です", "warn");
        return;
      }
      const cmd = make(id, null);
      if (!cmd) return;
      if (id !== "measure" && id !== "sketch") app.lastCommand = id;
      app.startCommand(cmd);
    },
    edit: (f) => {
      if (app.mode === "sketch") app.exitSketch(true);
      if (app.command) app.finishCommand(app.command, false);
      const id = f.type;
      if (f.type === "import") {
        toast("インポートされたベース フィーチャは編集できません", "info");
        return;
      }
      const cmd = make(id, f);
      if (cmd) app.startCommand(cmd);
    },
  };
}

// keep helper exports referenced by other modules
export { regionSample };
export type { SkPoint };
