// Units (mm / inch) and precision of displayed measurements, CSV export of notes.

import type { MeasureNote, MeasureNoteKind } from "./types";
import { NOTE_LABELS } from "./notes";

export type MeasureDim = "length" | "area" | "volume" | "angle" | "mass" | "count";
export interface MeasureFormat {
  unit: "mm" | "inch";
  precision: number;
}

export const DEFAULT_FORMAT: MeasureFormat = { unit: "mm", precision: 3 };

const KEY = "3dcad.measureFormat";
export function loadFormat(): MeasureFormat {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "null") as MeasureFormat | null;
    if (v && (v.unit === "mm" || v.unit === "inch") && Number.isInteger(v.precision)) return v;
  } catch {
    /* storage unavailable */
  }
  return { ...DEFAULT_FORMAT };
}
export function saveFormat(f: MeasureFormat) {
  try {
    localStorage.setItem(KEY, JSON.stringify(f));
  } catch {
    /* storage unavailable */
  }
}

export function unitLabel(dim: MeasureDim, unit: MeasureFormat["unit"]): string {
  const u = unit === "inch" ? "in" : "mm";
  switch (dim) {
    case "length":
      return u;
    case "area":
      return `${u}²`;
    case "volume":
      return `${u}³`;
    case "angle":
      return "°";
    case "mass":
      return unit === "inch" ? "lb" : "g";
    case "count":
      return "";
  }
}

/** Value in mm-based units converted to the display unit. */
export function convert(v: number, dim: MeasureDim, unit: MeasureFormat["unit"]): number {
  if (unit === "mm") return v;
  switch (dim) {
    case "length":
      return v / 25.4;
    case "area":
      return v / 645.16;
    case "volume":
      return v / 16387.064;
    case "mass":
      return v / 453.59237;
    default:
      return v;
  }
}

export function formatValue(v: number, dim: MeasureDim, f: MeasureFormat): string {
  if (!Number.isFinite(v)) return "—";
  const p = dim === "count" ? 0 : Math.max(0, Math.min(8, f.precision));
  return convert(v, dim, f.unit).toFixed(p);
}

export function formatMeasure(v: number, dim: MeasureDim, f: MeasureFormat): string {
  const u = unitLabel(dim, f.unit);
  const s = formatValue(v, dim, f);
  return u === "°" ? `${s}°` : u ? `${s} ${u}` : s;
}

export function noteDim(kind: MeasureNoteKind): MeasureDim {
  return kind === "angle" ? "angle" : kind === "area" ? "area" : kind === "volume" ? "volume" : "length";
}

/** Short label text of a note (e.g. "Ø10.000", "R5.000", "PCD Ø100.000"). */
export function noteText(n: MeasureNote, f: MeasureFormat): string {
  const v = formatMeasure(n.value, noteDim(n.kind), f);
  switch (n.kind) {
    case "diameter":
    case "hole": {
      let s = `Ø${v}`;
      if (n.extra?.cbDiameter) s += ` ⌴Ø${formatValue(n.extra.cbDiameter, "length", f)}`;
      if (n.extra?.csDiameter) s += ` ⌵Ø${formatValue(n.extra.csDiameter, "length", f)}`;
      return s;
    }
    case "pcd":
      return `PCD Ø${v}`;
    case "radius":
      return `R${v}`;
    case "thickness":
      return `t = ${v}`;
    default:
      return v;
  }
}

const q = (s: string) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);

export function notesCsv(notes: MeasureNote[], f: MeasureFormat): string {
  const rows = [["名前", "種類", "値", "単位", "状態"].join(",")];
  for (const n of notes) {
    const dim = noteDim(n.kind);
    rows.push([q(n.name), NOTE_LABELS[n.kind], formatValue(n.value, dim, f), unitLabel(dim, f.unit), n.broken ? "参照切れ" : "OK"].join(","));
  }
  return rows.join("\n");
}
