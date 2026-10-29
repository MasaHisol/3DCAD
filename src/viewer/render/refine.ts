// Progressive and view-dependent mesh refinement (#5 段階的な詳細表示).
// After a rebuild that came back coarse (large model), the normal level is
// requested in the background; when the user zooms in so far that the
// tessellation error would show (> maxErrPx on screen), the fine level is
// requested, and dropped again when zoomed back out.
import { levelForView, type TessQuality } from "../../kernel/tessellation";
import type { BodyMesh } from "../../kernel/protocol";

export interface RefineHost {
  remesh(q: TessQuality): Promise<{ bodies: BodyMesh[]; surfaces: BodyMesh[] }>;
  /** Shows refined meshes; return false when they are stale (model changed meanwhile). */
  apply(r: { bodies: BodyMesh[]; surfaces: BodyMesh[] }, q: TessQuality, token: number): boolean;
  /** World units per screen pixel. */
  pixelSize(): number;
  /** Token of the current model version (e.g. the regen sequence number). */
  token(): number;
}

export class MeshRefiner {
  /** Level of the meshes on screen. */
  level: TessQuality = "normal";
  /** Display error of the normal level (mm). */
  private tol = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private pending: TessQuality | null = null;
  enabled = true;
  /** Fine meshes are requested when the normal level's error exceeds this on screen. */
  maxErrPx = 1.5;
  /** Statistics: refinements applied per level. */
  stats = { normal: 0, fine: 0 };

  constructor(private host: RefineHost) {}

  /** After a rebuild: `coarse` when the result is the coarse first display. */
  afterRebuild(coarse: boolean, meshes: BodyMesh[]) {
    this.cancel();
    const t = meshes.find((m) => m.tess)?.tess;
    this.level = t?.quality ?? "normal";
    // tolerance of the normal level, whatever level came back
    this.tol = t ? t.tolerance / (t.quality === "coarse" ? 4 : t.quality === "fine" ? 0.25 : 1) : 0;
    if (!this.enabled || !t) return;
    if (coarse) this.schedule("normal", 30);
    else this.onView();
  }

  /** On camera change: fine level when zoomed in, normal again when zoomed out. */
  onView() {
    if (!this.enabled || !this.tol || this.level === "coarse") return;
    const ps = this.host.pixelSize();
    const need = levelForView({ coarse: this.tol * 4, normal: this.tol, fine: this.tol / 4 }, ps, this.maxErrPx);
    const want: TessQuality = need === "fine" ? "fine" : this.level === "fine" && this.tol / ps > this.maxErrPx / 3 ? "fine" : "normal";
    if (want !== this.level && want !== this.pending) this.schedule(want, 350);
    else if (want === this.level && this.pending) this.cancel();
  }

  private cancel() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.pending = null;
  }

  private schedule(q: TessQuality, delay: number) {
    this.cancel();
    this.pending = q;
    const token = this.host.token();
    this.timer = setTimeout(async () => {
      this.timer = null;
      try {
        const r = await this.host.remesh(q);
        if (this.pending !== q || this.host.token() !== token) return;
        this.pending = null;
        if (this.host.apply(r, q, token)) {
          this.level = q;
          if (q !== "coarse") this.stats[q]++;
          // the view may have changed while meshing
          this.onView();
        }
      } catch {
        this.pending = null;
      }
    }, delay);
  }
}
