// MBD (model based definition): 3D product manufacturing information stored in
// the part document. Annotations reference model faces / edges with the same
// persistent FaceRef / EdgeRef records the features use, are re-resolved after
// every rebuild and reuse the drawing formats (Tolerance, GD&T, Ra).
// This module is pure data (no DOM / THREE) so it can be unit-tested.

import { formatNumber } from "../core/expr";
import type { EdgeRef, FaceRef, PartDocument, Vec3 } from "../core/types";
import { dimText } from "../drawing/geom";
import type { Tolerance } from "../drawing/types";

export type PmiRef = { kind: "face"; ref: FaceRef } | { kind: "edge"; ref: EdgeRef };

interface PmiBase {
  id: string;
  /** Model references (faces / edges) the annotation is attached to. */
  refs: PmiRef[];
  /** Label position relative to the anchor point (world mm). Missing = automatic. */
  offset?: Vec3;
  hidden?: boolean;
}

/** Linear distance between two faces / edges. */
export interface PmiDim extends PmiBase {
  type: "dim";
  tol?: Tolerance;
  /** Overrides the measured value text. */
  text?: string;
  /** Last measured value (mm), cached for the list / CSV / drawing export. */
  value?: number;
}
/** Diameter / radius of a cylindrical face or circular edge. */
export interface PmiDiameter extends PmiBase {
  type: "diameter";
  radius?: boolean;
  tol?: Tolerance;
  text?: string;
  value?: number;
}
export interface PmiGdt extends PmiBase {
  type: "gdt";
  symbol: string;
  value: string;
  datums: string;
}
export interface PmiDatum extends PmiBase {
  type: "datum";
  letter: string;
}
export interface PmiSurface extends PmiBase {
  type: "surface";
  ra: string;
  removal: "required" | "any" | "prohibited";
}
export interface PmiNote extends PmiBase {
  type: "note";
  text: string;
}

export type PmiAnno = PmiDim | PmiDiameter | PmiGdt | PmiDatum | PmiSurface | PmiNote;
export type PmiType = PmiAnno["type"];

export const PMI_LABELS: Record<PmiType, string> = {
  dim: "寸法",
  diameter: "直径/半径",
  gdt: "幾何公差",
  datum: "データム",
  surface: "表面性状",
  note: "注記",
};

/** Number of references each annotation type needs. */
export const PMI_REF_COUNT: Record<PmiType, number> = { dim: 2, diameter: 1, gdt: 1, datum: 1, surface: 1, note: 1 };

export const GDT_SYMBOLS: [string, string][] = [
  ["⏤", "真直度"],
  ["⏥", "平面度"],
  ["○", "真円度"],
  ["⌭", "円筒度"],
  ["⌒", "線の輪郭度"],
  ["⌓", "面の輪郭度"],
  ["∥", "平行度"],
  ["⟂", "直角度"],
  ["∠", "傾斜度"],
  ["⌖", "位置度"],
  ["◎", "同軸度・同心度"],
  ["⌯", "対称度"],
  ["↗", "円周振れ"],
  ["⌰", "全振れ"],
];

let counter = 0;
export function pmiId(): string {
  counter++;
  return `pmi${Date.now().toString(36)}${counter.toString(36)}${Math.floor(Math.random() * 1296).toString(36)}`;
}

// ------------------------------------------------------------- editing ---

export function addPmi(doc: PartDocument, a: PmiAnno): PmiAnno {
  (doc.pmi ??= []).push(a);
  return a;
}

/** Replace an annotation by id (keeps its position in the list). Returns false when missing. */
export function updatePmi(doc: PartDocument, a: PmiAnno): boolean {
  const list = doc.pmi ?? [];
  const i = list.findIndex((x) => x.id === a.id);
  if (i < 0) return false;
  list[i] = a;
  return true;
}

export function removePmi(doc: PartDocument, ids: string[]): number {
  if (!doc.pmi) return 0;
  const set = new Set(ids);
  const n = doc.pmi.length;
  doc.pmi = doc.pmi.filter((a) => !set.has(a.id));
  const removed = n - doc.pmi.length;
  if (!doc.pmi.length) delete doc.pmi;
  return removed;
}

/** Next unused datum letter (A, B, C …; I, O, Q skipped as in ISO 5459). */
export function nextDatumLetter(doc: PartDocument): string {
  const used = new Set((doc.pmi ?? []).filter((a): a is PmiDatum => a.type === "datum").map((a) => a.letter));
  for (const c of "ABCDEFGHJKLMNPRSTUVWXYZ") if (!used.has(c)) return c;
  return "Z";
}

// ---------------------------------------------------------------- text ---

/** Display text of an annotation (single line, used by the list, CSV and labels). */
export function pmiText(a: PmiAnno): string {
  switch (a.type) {
    case "dim":
    case "diameter": {
      const t = dimParts(a);
      return t.main + (t.upper !== undefined ? ` (${t.upper} / ${t.lower})` : "");
    }
    case "gdt":
      return `${a.symbol} ${a.value}${a.datums.trim() ? " | " + a.datums.split(/[\s,|]+/).filter(Boolean).join(" | ") : ""}`;
    case "datum":
      return `データム ${a.letter}`;
    case "surface":
      return `Ra ${a.ra}`;
    case "note":
      return a.text;
  }
}

/** Main / stacked tolerance text for a dimension (drawing JIS style, via the drawing formatter). */
export function dimParts(a: PmiDim | PmiDiameter): { main: string; upper?: string; lower?: string; boxed?: boolean; paren?: boolean } {
  const v = a.value;
  let main = a.text?.trim() || "";
  if (!main) {
    if (v === undefined || !Number.isFinite(v)) main = "?";
    else if (a.type === "diameter") main = a.radius ? `R${formatNumber(v / 2, 2)}` : `φ${formatNumber(v, 2)}`;
    else main = formatNumber(v, 2);
  }
  return dimText({ id: a.id, type: "dim", view: "", kind: "linear", refs: [], pos: [0, 0], text: main, tol: a.tol });
}

export function tolText(t: Tolerance | undefined): string {
  if (!t) return "";
  switch (t.kind) {
    case "sym":
      return `±${t.value}`;
    case "dev":
      return `${t.upper} / ${t.lower}`;
    case "fit":
      return t.fit;
    case "basic":
      return "理論的に正確な寸法";
    case "ref":
      return "参考寸法";
  }
  return "";
}

// ----------------------------------------------------------------- CSV ---

const csvCell = (s: string) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);

/** "PMI 一覧 CSV": one row per annotation. */
export function pmiCsv(doc: PartDocument): string {
  const rows: string[][] = [["No", "ID", "種類", "表記", "公称値 (mm)", "公差", "記号", "公差値", "データム", "参照", "表示"]];
  (doc.pmi ?? []).forEach((a, i) => {
    const refs = a.refs.map((r) => `${r.kind === "face" ? "面" : "エッジ"}${r.ref.type ? `(${r.ref.type})` : ""}`).join(" + ");
    const nominal = a.type === "dim" || a.type === "diameter" ? (a.value !== undefined ? formatNumber(a.type === "diameter" && a.radius ? a.value / 2 : a.value, 4) : "") : "";
    const tol = a.type === "dim" || a.type === "diameter" ? tolText(a.tol) : a.type === "surface" ? a.removal : "";
    rows.push([
      String(i + 1),
      a.id,
      PMI_LABELS[a.type],
      pmiText(a),
      nominal,
      tol,
      a.type === "gdt" ? a.symbol : a.type === "datum" ? a.letter : "",
      a.type === "gdt" ? a.value : a.type === "surface" ? a.ra : "",
      a.type === "gdt" ? a.datums : "",
      refs,
      a.hidden ? "非表示" : "表示",
    ]);
  });
  return "﻿" + rows.map((r) => r.map(csvCell).join(",")).join("\r\n") + "\r\n";
}

// ---------------------------------------------------------- validation ---

const isObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === "object" && !Array.isArray(x);
const vec3 = (a: unknown): a is Vec3 => Array.isArray(a) && a.length === 3 && a.every((x) => typeof x === "number" && Number.isFinite(x));
const str = (x: unknown, d = "") => (typeof x === "string" ? x : d);

function cleanRef(r: unknown): PmiRef | null {
  if (!isObj(r) || !isObj(r.ref)) return null;
  const x = r.ref;
  const type = typeof x.type === "string" ? x.type : undefined;
  const n = vec3(x.n) ? x.n : undefined;
  if (r.kind === "face") {
    if (!vec3(x.center) || !vec3(x.normal)) return null;
    return { kind: "face", ref: { center: x.center, normal: x.normal, ...(n ? { n } : {}), ...(type ? { type } : {}) } };
  }
  if (r.kind === "edge") {
    if (!vec3(x.mid)) return null;
    return { kind: "edge", ref: { mid: x.mid, ...(vec3(x.a) ? { a: x.a } : {}), ...(vec3(x.b) ? { b: x.b } : {}), ...(n ? { n } : {}), ...(type ? { type } : {}) } };
  }
  return null;
}

function cleanTol(t: unknown): Tolerance | undefined {
  if (!isObj(t)) return undefined;
  switch (t.kind) {
    case "none":
    case "basic":
    case "ref":
      return { kind: t.kind };
    case "sym":
      return { kind: "sym", value: str(t.value, "0.1") };
    case "dev":
      return { kind: "dev", upper: str(t.upper, "0"), lower: str(t.lower, "0") };
    case "fit":
      return { kind: "fit", fit: str(t.fit, "H7") };
  }
  return undefined;
}

/** Normalise `doc.pmi` loaded from a file: drops broken entries, repairs ids. Returns repair messages. */
export function cleanPmi(doc: PartDocument): string[] {
  const raw = (doc as unknown as { pmi?: unknown }).pmi;
  if (raw === undefined) return [];
  if (!Array.isArray(raw)) {
    delete doc.pmi;
    return ["3D 注記 (PMI) の形式が不正だったため削除しました"];
  }
  const warnings: string[] = [];
  const out: PmiAnno[] = [];
  const ids = new Set<string>();
  let dropped = 0;
  for (const x of raw as unknown[]) {
    if (!isObj(x) || !(typeof x.type === "string" && x.type in PMI_LABELS) || !Array.isArray(x.refs)) {
      dropped++;
      continue;
    }
    const type = x.type as PmiType;
    const refs = (x.refs as unknown[]).map(cleanRef).filter((r): r is PmiRef => !!r);
    if (refs.length < PMI_REF_COUNT[type]) {
      dropped++;
      continue;
    }
    let id = typeof x.id === "string" && x.id ? x.id : "";
    if (!id || ids.has(id)) id = pmiId();
    ids.add(id);
    const base: PmiBase = { id, refs: refs.slice(0, PMI_REF_COUNT[type]) };
    if (vec3(x.offset)) base.offset = x.offset;
    if (x.hidden === true) base.hidden = true;
    const num = typeof x.value === "number" && Number.isFinite(x.value) ? x.value : undefined;
    let a: PmiAnno;
    switch (type) {
      case "dim":
      case "diameter": {
        const d = { ...base, type } as PmiDim | PmiDiameter;
        const tol = cleanTol(x.tol);
        if (tol) d.tol = tol;
        if (typeof x.text === "string" && x.text) d.text = x.text;
        if (num !== undefined) d.value = num;
        if (type === "diameter" && x.radius === true) (d as PmiDiameter).radius = true;
        a = d;
        break;
      }
      case "gdt":
        a = { ...base, type, symbol: str(x.symbol, "⌖"), value: str(x.value), datums: str(x.datums) };
        break;
      case "datum":
        a = { ...base, type, letter: str(x.letter, "A").slice(0, 3) || "A" };
        break;
      case "surface":
        a = { ...base, type, ra: str(x.ra, "1.6"), removal: x.removal === "any" || x.removal === "prohibited" ? x.removal : "required" };
        break;
      case "note":
        a = { ...base, type, text: str(x.text) };
        break;
    }
    out.push(a);
  }
  if (dropped) warnings.push(`不正な 3D 注記 (PMI) ${dropped} 個を削除しました`);
  if (out.length) doc.pmi = out;
  else delete doc.pmi;
  return warnings;
}
