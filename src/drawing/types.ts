// 2D drawing documents (Inventor .idw / SOLIDWORKS .slddrw equivalent).
// A drawing is stored inside the part / assembly it documents, so it always
// regenerates from the current model.

import type { Vec2, Vec3 } from "../core/types";

export type PaperSize = "A4" | "A3" | "A2" | "A1" | "A0";

export const PAPER: Record<PaperSize, [number, number]> = {
  A4: [297, 210],
  A3: [420, 297],
  A2: [594, 420],
  A1: [841, 594],
  A0: [1189, 841],
};

export type StdOrient = "front" | "back" | "top" | "bottom" | "right" | "left" | "iso";

export interface DView {
  id: string;
  /** Letter / name shown under the view ("A-A", "B", "正面図" ...). */
  label: string;
  kind: "base" | "projected" | "section" | "detail";
  /** Camera: direction from model towards the viewer, and the sheet-right axis. */
  dir: Vec3;
  xAxis: Vec3;
  parent?: string;
  scale: number;
  /** View origin (model 0,0 of the view frame) on the sheet, in mm, y down. */
  x: number;
  y: number;
  hidden: boolean;
  centerMarks: boolean;
  /** Section: cutting line in the parent view (view mm), viewing side flipped or not. */
  section?: {
    a: Vec2;
    b: Vec2;
    flip: boolean;
    /** Stepped section (階段断面): from `at` mm along a→b onwards the cut shifts `offset` mm deeper. */
    steps?: { at: number; offset: number }[];
  };
  /** Detail: circle in the parent view (view mm). */
  detail?: { c: Vec2; r: number };
  /** Broken view (破断図): ranges (view mm along the view x / y axis) removed from the display. */
  breaks?: { axis: "x" | "y"; a: number; b: number }[];
}

/** Reference to drawing geometry in view coordinates (re-snapped on update). */
export interface GRef {
  kind: "point" | "line" | "circle";
  p: Vec2;
  p2?: Vec2;
  r?: number;
}

export type Tolerance =
  | { kind: "none" }
  | { kind: "sym"; value: string }
  | { kind: "dev"; upper: string; lower: string }
  | { kind: "fit"; fit: string }
  | { kind: "basic" }
  | { kind: "ref" };

export type DimKind = "linear" | "horizontal" | "vertical" | "diameter" | "radius" | "angle" | "hole";

export interface DimAnno {
  id: string;
  type: "dim";
  view: string;
  kind: DimKind;
  refs: GRef[];
  /** Label position in view coordinates (moves with the view). */
  pos: Vec2;
  text?: string;
  prefix?: string;
  suffix?: string;
  tol?: Tolerance;
}

export interface NoteAnno {
  id: string;
  type: "note";
  /** Sheet mm. */
  x: number;
  y: number;
  text: string;
  /** Optional leader target: view + point (view coords). */
  leader?: { view: string; p: Vec2 };
  size?: number;
}

export interface SurfaceAnno {
  id: string;
  type: "surface";
  view: string;
  p: Vec2;
  /** Direction away from the surface, in view coords (unit). */
  ra: string;
  removal: "required" | "any" | "prohibited";
}

export interface GdtAnno {
  id: string;
  type: "gdt";
  x: number;
  y: number;
  symbol: string;
  value: string;
  datums: string;
  leader?: { view: string; p: Vec2 };
}

export interface DatumAnno {
  id: string;
  type: "datum";
  view: string;
  p: Vec2;
  pos: Vec2;
  letter: string;
}

export interface BalloonAnno {
  id: string;
  type: "balloon";
  view: string;
  p: Vec2;
  pos: Vec2;
  /** Assembly placement index the leader points at. */
  tag: number;
}

export interface CenterlineAnno {
  id: string;
  type: "centerline";
  view: string;
  a: Vec2;
  b: Vec2;
}

/** Welding symbol (JIS Z 3021 / ISO 2553): arrow, reference line, symbol, size. */
export interface WeldAnno {
  id: string;
  type: "weld";
  view: string;
  /** Arrow tip (view coords). */
  p: Vec2;
  /** Junction of arrow and reference line (view coords). */
  pos: Vec2;
  kind: "fillet" | "v" | "bevel" | "square" | "spot" | "plug";
  side: "arrow" | "other" | "both";
  size: string;
  length: string;
  allAround: boolean;
  field: boolean;
}

/** Hole table (Inventor 穴テーブル): tags at the holes + coordinate table. */
export interface HoleTableAnno {
  id: string;
  type: "holetable";
  view: string;
  /** Datum (X0, Y0) in view coordinates. */
  origin: Vec2;
  /** Table top-left, sheet mm. */
  x: number;
  y: number;
}

/** Ordinate (coordinate) dimensions along one axis from a datum. */
export interface OrdinateAnno {
  id: string;
  type: "ordinate";
  view: string;
  axis: "x" | "y";
  origin: Vec2;
  /** Feature points (view coordinates). */
  pts: Vec2[];
  /** Baseline coordinate (view): y for axis "x", x for axis "y". */
  pos: number;
}

export type Anno = DimAnno | NoteAnno | SurfaceAnno | GdtAnno | DatumAnno | BalloonAnno | CenterlineAnno | HoleTableAnno | OrdinateAnno | WeldAnno;

export interface TitleBlock {
  title: string;
  number: string;
  material: string;
  designer: string;
  checker: string;
  approver: string;
  date: string;
  company: string;
  revision: string;
  /** Free general tolerance / notes line. */
  generalTol: string;
  /** Company logo (image data URL), drawn above the title block. */
  logo?: string;
}

export interface Sheet {
  id: string;
  name: string;
  size: PaperSize;
  landscape: boolean;
  views: DView[];
  annos: Anno[];
  /** Parts list table position (assembly drawings), top-left in sheet mm. */
  partsList?: { x: number; y: number } | null;
  /** Detail drawing of one part of the assembly (part id): views show only that part, in its own coordinates. */
  part?: string;
  /** Title block entries overriding the drawing's (part number, name, material of a detail sheet). */
  title?: Partial<TitleBlock>;
}

export interface DrawingDoc {
  sheets: Sheet[];
  title: TitleBlock;
  /** Letters already used for section / detail views. */
  nextLetter: number;
}

export function sheetSize(s: Sheet): [number, number] {
  const [w, h] = PAPER[s.size];
  return s.landscape ? [w, h] : [h, w];
}

/** Standard view frames (Y-up model, third-angle projection like JIS / Inventor). */
export const ORIENTS: Record<StdOrient, { dir: Vec3; xAxis: Vec3; label: string }> = {
  front: { dir: [0, 0, 1], xAxis: [1, 0, 0], label: "正面図" },
  back: { dir: [0, 0, -1], xAxis: [-1, 0, 0], label: "背面図" },
  top: { dir: [0, 1, 0], xAxis: [1, 0, 0], label: "平面図" },
  bottom: { dir: [0, -1, 0], xAxis: [1, 0, 0], label: "下面図" },
  right: { dir: [1, 0, 0], xAxis: [0, 0, -1], label: "右側面図" },
  left: { dir: [-1, 0, 0], xAxis: [0, 0, 1], label: "左側面図" },
  iso: { dir: [1, 1, 1], xAxis: [1, 0, -1], label: "等角図" },
};

export const SCALES = [10, 5, 4, 2, 1, 0.5, 0.4, 0.2, 0.1, 0.05, 0.02, 0.01];

export function scaleText(s: number): string {
  if (s >= 1) return `${+s.toFixed(2)}:1`;
  return `1:${+(1 / s).toFixed(2)}`;
}
