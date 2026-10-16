// Small predicates the lesson steps are written with. All take a LearnState
// snapshot so they can be unit-tested without the UI.
import type { Feature, FeatureType, SketchFeature } from "../core/types";
import type { DrawingDoc } from "../drawing/types";
import type { LearnState } from "./types";

export const near = (a: number | undefined, b: number, tol = 1e-3) => a !== undefined && Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));

/** Value of a feature expression field (a parameter name or a literal). */
export function val(s: LearnState, expr: string | undefined): number | undefined {
  if (expr === undefined) return undefined;
  if (s.values.has(expr)) return s.values.get(expr);
  const n = Number(expr);
  return Number.isFinite(n) ? n : undefined;
}

/** Active (not suppressed, not rolled back) features of the part. */
export function activeFeatures(s: LearnState): Feature[] {
  return s.part.features.slice(0, s.part.endOfPart).filter((f) => !f.suppressed);
}

/**
 * Committed features of a type. While the command of that type is still open
 * the newest one is only a live preview, so it does not count yet.
 */
export function features<T extends Feature = Feature>(s: LearnState, type: FeatureType, pred: (f: T) => boolean = () => true): T[] {
  const list = activeFeatures(s).filter((f) => f.type === type) as T[];
  const open = s.command === type || (type === "extrude" && s.command === "sm-cut");
  const committed = open ? list.slice(0, -1) : list;
  return committed.filter(pred);
}

export const has = <T extends Feature = Feature>(s: LearnState, type: FeatureType, pred?: (f: T) => boolean, n = 1) => features<T>(s, type, pred).length >= n;

export const sketches = (s: LearnState) => s.part.features.filter((f): f is SketchFeature => f.type === "sketch");

/** The sketch being edited (sketch mode), else undefined. */
export function editing(s: LearnState): SketchFeature | undefined {
  if (s.mode !== "sketch" || !s.sketch) return undefined;
  return s.part.features.find((f): f is SketchFeature => f.id === s.sketch!.id && f.type === "sketch");
}

export function count(sk: SketchFeature | undefined, type: "line" | "circle" | "arc" | "point", construction = false): number {
  if (!sk) return 0;
  return sk.entities.filter((e) => e.type === type && !e.ref && !!e.construction === construction && !(type === "point" && e.id === "origin")).length;
}

/** Driving dimension of the sketch whose value is close to v. */
export function hasDim(s: LearnState, sk: SketchFeature | undefined, v: number, types?: string[]): boolean {
  if (!sk) return false;
  return sk.dimensions.some((d) => !d.driven && (!types || types.includes(d.type)) && near(s.values.get(d.param), v, 1e-3));
}

export const constraintCount = (sk: SketchFeature | undefined, type: string) => (sk ? sk.constraints.filter((c) => c.type === type).length : 0);

export const idle = (s: LearnState) => s.command === null && s.mode === "model";

/** The drawing currently open (part or assembly). */
export function drawing(s: LearnState): DrawingDoc | undefined {
  return s.env === "drawing" ? (s.part.drawing ?? s.asm.drawing) : (s.part.drawing ?? s.asm.drawing);
}

export const views = (s: LearnState, kind?: string) => (drawing(s)?.sheets ?? []).flatMap((sh) => sh.views).filter((v) => !kind || v.kind === kind);
export const dims = (s: LearnState) => (drawing(s)?.sheets ?? []).flatMap((sh) => sh.annos).filter((a) => a.type === "dim");

export const userParams = (s: LearnState) => s.part.params.filter((p) => p.kind === "user");

/** Some model parameter expression refers to a user parameter (design intent). */
export function usesUserParam(s: LearnState): boolean {
  const names = userParams(s).map((p) => p.name);
  if (!names.length) return false;
  return s.part.params.some((p) => p.kind === "model" && names.some((n) => new RegExp(`(^|[^\\p{L}\\p{N}_])${n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|[^\\p{L}\\p{N}_])`, "u").test(p.expr)));
}
