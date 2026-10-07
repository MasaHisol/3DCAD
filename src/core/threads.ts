// Standard thread and fastener-hole data (ISO 261/262 metric, ISO 273
// clearance holes, ISO 4762 counterbores, Unified UNC/UNF).
// Used by the hole / thread features, the drawing hole notes and the
// standard parts library.

export type ThreadFamily = "M" | "MF" | "UNC" | "UNF";

export interface ThreadSize {
  family: ThreadFamily;
  /** Designation as written on drawings: "M6", "M10x1.25", "1/4-20 UNC". */
  name: string;
  /** Nominal (major) diameter, mm. */
  d: number;
  /** Pitch, mm. */
  pitch: number;
}

export const FAMILY_LABEL: Record<ThreadFamily, string> = {
  M: "ISO メートル 並目",
  MF: "ISO メートル 細目",
  UNC: "ユニファイ 並目 (UNC)",
  UNF: "ユニファイ 細目 (UNF)",
};

const COARSE: [number, number][] = [
  [1.6, 0.35], [2, 0.4], [2.5, 0.45], [3, 0.5], [4, 0.7], [5, 0.8], [6, 1], [8, 1.25], [10, 1.5], [12, 1.75],
  [14, 2], [16, 2], [18, 2.5], [20, 2.5], [22, 2.5], [24, 3], [27, 3], [30, 3.5], [36, 4], [42, 4.5], [48, 5],
];
const FINE: [number, number][] = [
  [8, 1], [10, 1.25], [10, 1], [12, 1.5], [12, 1.25], [14, 1.5], [16, 1.5], [18, 1.5], [20, 1.5], [22, 1.5], [24, 2], [27, 2], [30, 2], [36, 3], [42, 3], [48, 3],
];
// [label, major inch, threads per inch]
const UNC: [string, number, number][] = [
  ["#4-40", 0.112, 40], ["#6-32", 0.138, 32], ["#8-32", 0.164, 32], ["#10-24", 0.19, 24], ["1/4-20", 0.25, 20], ["5/16-18", 0.3125, 18],
  ["3/8-16", 0.375, 16], ["7/16-14", 0.4375, 14], ["1/2-13", 0.5, 13], ["5/8-11", 0.625, 11], ["3/4-10", 0.75, 10], ["1-8", 1, 8],
];
const UNF: [string, number, number][] = [
  ["#4-48", 0.112, 48], ["#6-40", 0.138, 40], ["#8-36", 0.164, 36], ["#10-32", 0.19, 32], ["1/4-28", 0.25, 28], ["5/16-24", 0.3125, 24],
  ["3/8-24", 0.375, 24], ["7/16-20", 0.4375, 20], ["1/2-20", 0.5, 20], ["5/8-18", 0.625, 18], ["3/4-16", 0.75, 16], ["1-12", 1, 12],
];

const fmt = (n: number) => String(+n.toFixed(3));

export const THREADS: ThreadSize[] = [
  ...COARSE.map(([d, p]): ThreadSize => ({ family: "M", name: `M${fmt(d)}`, d, pitch: p })),
  ...FINE.map(([d, p]): ThreadSize => ({ family: "MF", name: `M${fmt(d)}×${fmt(p)}`, d, pitch: p })),
  ...UNC.map(([n, d, tpi]): ThreadSize => ({ family: "UNC", name: `${n} UNC`, d: d * 25.4, pitch: 25.4 / tpi })),
  ...UNF.map(([n, d, tpi]): ThreadSize => ({ family: "UNF", name: `${n} UNF`, d: d * 25.4, pitch: 25.4 / tpi })),
];

/** Look up a size by designation (accepts "M6", "M10x1.25", "M10×1.25", "1/4-20 UNC"). */
export function threadByName(name: string): ThreadSize | undefined {
  const n = name.trim().replace(/[xX*]/g, "×").replace(/\s+/g, " ");
  return THREADS.find((t) => t.name === n) ?? THREADS.find((t) => t.name.replace(" ", "") === n.replace(" ", ""));
}

export function threadsOf(family: ThreadFamily): ThreadSize[] {
  return THREADS.filter((t) => t.family === family);
}

/** Basic minor diameter of the external thread (ISO 68-1: d3 = d - 1.22687 P). */
export function minorDiameter(t: ThreadSize): number {
  return t.d - 1.22687 * t.pitch;
}

/** Recommended tap drill (≈ D1 = D - 1.0825 P, rounded to 0.05 mm like drill charts). */
export function tapDrill(t: ThreadSize): number {
  const raw = t.family === "M" || t.family === "MF" ? t.d - t.pitch : t.d - 1.0825 * t.pitch;
  return Math.round(raw * 20) / 20;
}

export type Fit = "close" | "normal" | "loose";
export const FIT_LABEL: Record<Fit, string> = { close: "精級 (1 級)", normal: "中級 (2 級)", loose: "粗級 (3 級)" };

// ISO 273 clearance holes [d, fine, medium, coarse]
const CLEARANCE: [number, number, number, number][] = [
  [1.6, 1.7, 1.8, 2], [2, 2.2, 2.4, 2.6], [2.5, 2.7, 2.9, 3.1], [3, 3.2, 3.4, 3.6], [4, 4.3, 4.5, 4.8], [5, 5.3, 5.5, 5.8],
  [6, 6.4, 6.6, 7], [8, 8.4, 9, 10], [10, 10.5, 11, 12], [12, 13, 13.5, 14.5], [14, 15, 15.5, 16.5], [16, 17, 17.5, 18.5],
  [18, 19, 20, 21], [20, 21, 22, 24], [22, 23, 24, 26], [24, 25, 26, 28], [27, 28, 30, 32], [30, 31, 33, 35], [36, 37, 39, 42],
  [42, 43, 45, 48], [48, 50, 52, 56],
];

/** Clearance hole for a bolt of nominal diameter d. */
export function clearanceHole(d: number, fit: Fit = "normal"): number {
  const row = CLEARANCE.find((r) => Math.abs(r[0] - d) < 1e-6);
  if (row) return row[fit === "close" ? 1 : fit === "normal" ? 2 : 3];
  return +(d * (fit === "close" ? 1.06 : fit === "normal" ? 1.1 : 1.2)).toFixed(1);
}

// ISO 4762 socket head cap screw counterbore (JIS B 1176 座ぐり): [d, cbDia, cbDepth]
const COUNTERBORE: [number, number, number][] = [
  [3, 6.5, 3.3], [4, 8, 4.4], [5, 9.5, 5.4], [6, 11, 6.5], [8, 14, 8.6], [10, 17.5, 10.8], [12, 20, 13],
  [14, 23, 15.2], [16, 26, 17.5], [20, 32, 21.5], [24, 39, 25.5], [30, 48, 32],
];

export function counterbore(d: number): { dia: number; depth: number } {
  const row = COUNTERBORE.find((r) => Math.abs(r[0] - d) < 1e-6);
  if (row) return { dia: row[1], depth: row[2] };
  return { dia: +(d * 1.75).toFixed(1), depth: +(d * 1.08).toFixed(1) };
}

/** Countersink for ISO 10642 flat head screws (90°). */
export function countersink(d: number): number {
  return +(d * 2.2).toFixed(1);
}

/** Text for hole notes / thread callouts: "M6×1 ↧12" style (JIS). */
export function threadNote(t: ThreadSize, length: number | null): string {
  const base = t.family === "M" ? `${t.name}` : t.name;
  return length ? `${base} 深さ ${fmt(length)}` : base;
}
