// Saved display states of an assembly (表示状態 / ビュー): camera, visibility,
// transparency, explode factor, section planes, display style and colour mode.
// Stored in AssemblyDocument.views; pure helpers here, UI in viewsUi.ts.
import type { Vec3 } from "../core/types";
import type { ColorMode } from "./colorBy";
import type { AssemblyDocument } from "./types";

export const HOME_VIEW_ID = "home";

export interface SavedCamera {
  target: Vec3;
  /** Orientation quaternion (x, y, z, w). */
  quat: [number, number, number, number];
  height: number;
  perspective: boolean;
}

export interface SavedSection {
  normal: Vec3;
  constant: number;
}

export interface SavedView {
  id: string;
  name: string;
  camera: SavedCamera;
  /** Hidden components (all others visible). */
  hidden: string[];
  /** Components drawn transparent. */
  transparent: string[];
  explode: number;
  /** Section planes (empty = no section). */
  sections: SavedSection[];
  style: string;
  colorMode: ColorMode;
  /** ISO date of the last save. */
  saved: string;
}

/** The live display state a view is captured from / applied to. */
export interface DisplayState {
  camera: SavedCamera;
  hidden: Set<string>;
  transparent: Set<string>;
  explode: number;
  sections: SavedSection[];
  style: string;
  colorMode: ColorMode;
}

const num = (v: unknown, d = 0) => (typeof v === "number" && Number.isFinite(v) ? v : d);
const vec = (v: unknown, d: Vec3 = [0, 0, 0]): Vec3 => (Array.isArray(v) && v.length === 3 ? (v.map((x, i) => num(x, d[i])) as Vec3) : d);

export function captureView(id: string, name: string, s: DisplayState, compIds?: string[]): SavedView {
  const keep = compIds ? new Set(compIds) : null;
  const ids = (set: Set<string>) => [...set].filter((x) => !keep || keep.has(x)).sort();
  return {
    id,
    name,
    camera: { target: [...s.camera.target] as Vec3, quat: [...s.camera.quat] as SavedCamera["quat"], height: s.camera.height, perspective: s.camera.perspective },
    hidden: ids(s.hidden),
    transparent: ids(s.transparent),
    explode: s.explode,
    sections: s.sections.map((p) => ({ normal: [...p.normal] as Vec3, constant: p.constant })),
    style: s.style,
    colorMode: s.colorMode,
    saved: new Date().toISOString(),
  };
}

/** Display state of a saved view for the current components (unknown ids dropped). */
export function viewState(v: SavedView, compIds: string[]): DisplayState {
  const live = new Set(compIds);
  return {
    camera: { ...v.camera, target: [...v.camera.target] as Vec3, quat: [...v.camera.quat] as SavedCamera["quat"] },
    hidden: new Set(v.hidden.filter((x) => live.has(x))),
    transparent: new Set(v.transparent.filter((x) => live.has(x))),
    explode: v.explode,
    sections: v.sections.map((p) => ({ ...p })),
    style: v.style,
    colorMode: v.colorMode,
  };
}

/** Validates / normalises a view read from a file. Returns null when unusable. */
export function parseView(raw: unknown): SavedView | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== "string" || !r.camera || typeof r.camera !== "object") return null;
  const c = r.camera as Record<string, unknown>;
  const q = Array.isArray(c.quat) && c.quat.length === 4 ? (c.quat.map((x) => num(x)) as SavedCamera["quat"]) : ([0, 0, 0, 1] as SavedCamera["quat"]);
  const strs = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);
  return {
    id: r.id,
    name: typeof r.name === "string" ? r.name : r.id,
    camera: { target: vec(c.target), quat: q, height: Math.max(1e-6, num(c.height, 100)), perspective: c.perspective === true },
    hidden: strs(r.hidden),
    transparent: strs(r.transparent),
    explode: Math.max(0, num(r.explode)),
    sections: Array.isArray(r.sections) ? r.sections.map((s) => ({ normal: vec((s as SavedSection).normal, [0, 0, 1]), constant: num((s as SavedSection).constant) })) : [],
    style: typeof r.style === "string" ? r.style : "shadedEdges",
    colorMode: (typeof r.colorMode === "string" ? r.colorMode : "default") as ColorMode,
    saved: typeof r.saved === "string" ? r.saved : "",
  };
}

export function serializeViews(views: SavedView[]): string {
  return JSON.stringify(views);
}

export function parseViews(text: string | unknown): SavedView[] {
  const raw = typeof text === "string" ? JSON.parse(text) : text;
  return Array.isArray(raw) ? raw.map(parseView).filter((v): v is SavedView => !!v) : [];
}

/** True when two display states are the same (camera within tolerance). */
export function sameState(a: DisplayState, b: DisplayState, tol = 1e-6): boolean {
  const eqSet = (x: Set<string>, y: Set<string>) => x.size === y.size && [...x].every((v) => y.has(v));
  const close = (x: number[], y: number[], t = tol) => x.length === y.length && x.every((v, i) => Math.abs(v - y[i]) <= t * Math.max(1, Math.abs(v)));
  // q and -q are the same rotation
  const qa = a.camera.quat, qb = b.camera.quat;
  const sgn = qa.reduce((s, v, i) => s + v * qb[i], 0) < 0 ? -1 : 1;
  return (
    close(a.camera.target, b.camera.target) &&
    close(qa, qb.map((v) => v * sgn)) &&
    close([a.camera.height], [b.camera.height]) &&
    a.camera.perspective === b.camera.perspective &&
    eqSet(a.hidden, b.hidden) &&
    eqSet(a.transparent, b.transparent) &&
    Math.abs(a.explode - b.explode) <= tol &&
    a.sections.length === b.sections.length &&
    a.sections.every((s, i) => close([...s.normal, s.constant], [...b.sections[i].normal, b.sections[i].constant])) &&
    a.style === b.style &&
    a.colorMode === b.colorMode
  );
}

// ----------------------------------------------------- document edits ---

export function listViews(doc: AssemblyDocument): SavedView[] {
  return doc.views ?? [];
}

export function upsertView(doc: AssemblyDocument, v: SavedView) {
  const list = (doc.views ??= []);
  const i = list.findIndex((x) => x.id === v.id);
  if (i >= 0) list[i] = v;
  else list.push(v);
}

export function renameView(doc: AssemblyDocument, id: string, name: string) {
  const v = doc.views?.find((x) => x.id === id);
  if (v) v.name = name;
}

export function deleteView(doc: AssemblyDocument, id: string) {
  if (doc.views) doc.views = doc.views.filter((x) => x.id !== id);
}

/** A name not used by another view ("ビュー1", "ビュー2", …). */
export function nextViewName(doc: AssemblyDocument, base = "ビュー"): string {
  const used = new Set((doc.views ?? []).map((v) => v.name));
  for (let i = 1; ; i++) if (!used.has(`${base}${i}`)) return `${base}${i}`;
}
