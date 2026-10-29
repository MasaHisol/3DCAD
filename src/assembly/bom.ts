// Bill of materials of an assembly (部品表): flat (quantity per part) and
// tree (component structure, patterns as sub-groups) views, search and CSV.
import type { AsmPart, AssemblyDocument } from "./types";

export type BomMode = "flat" | "tree";

export interface BomRow {
  /** Item number ("1", "2" / tree: "1", "1.1"). */
  no: string;
  /** Row key: part id (flat), component id or "pattern:<id>" (tree). */
  key: string;
  partId?: string;
  name: string;
  partNo: string;
  material: string;
  qty: number;
  /** Unit mass (g), undefined when unknown. */
  mass?: number;
  /** Components the row stands for (selection sync). */
  compIds: string[];
  depth: number;
  children?: BomRow[];
  fastener?: boolean;
}

const FASTENER_RE = /ボルト|ナット|座金|ワッシャ|ねじ|ネジ|ビス|リベット|\bbolt|\bnut\b|washer|screw|rivet|^(ISO|JIS|DIN) |^M\d+\s*[x×]/i;

/** Standard / purchased fasteners (library parts, or named like one). */
export function isFastener(p: AsmPart | undefined): boolean {
  if (!p) return false;
  const ip = p.doc?.iprops ?? {};
  if (ip["標準部品"] === "はい") return true;
  return FASTENER_RE.test(ip["パーツ番号"] ?? "") || FASTENER_RE.test(p.name);
}

export function partNumber(p: AsmPart): string {
  return p.doc?.iprops?.["パーツ番号"] || p.name;
}

export function partMaterial(p: AsmPart): string {
  if (p.kind === "step") return p.doc?.material?.name ?? "(STEP)";
  return p.doc?.material?.name ?? "";
}

/**
 * Builds the BOM. `massOf` gives a part's unit mass in grams (or undefined).
 */
export function buildBom(doc: AssemblyDocument, mode: BomMode, massOf: (partId: string) => number | undefined = () => undefined): BomRow[] {
  const parts = new Map(doc.parts.map((p) => [p.id, p]));
  if (mode === "flat") {
    const rows: BomRow[] = [];
    for (const p of doc.parts) {
      const comps = doc.components.filter((c) => c.partId === p.id);
      if (!comps.length) continue;
      rows.push({
        no: String(rows.length + 1),
        key: p.id,
        partId: p.id,
        name: p.name,
        partNo: partNumber(p),
        material: partMaterial(p),
        qty: comps.length,
        mass: massOf(p.id),
        compIds: comps.map((c) => c.id),
        depth: 0,
        fastener: isFastener(p),
      });
    }
    return rows;
  }
  // tree: components in order; pattern instances grouped under their pattern
  const rows: BomRow[] = [];
  const groups = new Map<string, BomRow>();
  const compRow = (cId: string, no: string, depth: number): BomRow | null => {
    const c = doc.components.find((x) => x.id === cId)!;
    const p = parts.get(c.partId);
    if (!p) return null;
    return { no, key: c.id, partId: p.id, name: c.name, partNo: partNumber(p), material: partMaterial(p), qty: 1, mass: massOf(p.id), compIds: [c.id], depth, fastener: isFastener(p) };
  };
  for (const c of doc.components) {
    if (c.patternOf) {
      let g = groups.get(c.patternOf.pattern);
      if (!g) {
        const pat = doc.patterns?.find((x) => x.id === c.patternOf!.pattern);
        g = { no: String(rows.length + 1), key: `pattern:${c.patternOf.pattern}`, name: pat?.name ?? "パターン", partNo: "", material: "", qty: 0, compIds: [], depth: 0, children: [] };
        groups.set(c.patternOf.pattern, g);
        rows.push(g);
      }
      const r = compRow(c.id, `${g.no}.${g.children!.length + 1}`, 1);
      if (r) {
        g.children!.push(r);
        g.compIds.push(c.id);
        g.qty++;
        if (r.mass !== undefined) g.mass = (g.mass ?? 0) + r.mass;
      }
      continue;
    }
    const r = compRow(c.id, String(rows.length + 1), 0);
    if (r) rows.push(r);
  }
  return rows;
}

/** Depth-first list of rows (tree children after their parent). */
export function flattenRows(rows: BomRow[]): BomRow[] {
  return rows.flatMap((r) => [r, ...flattenRows(r.children ?? [])]);
}

/** Rows matching a text query (any column); a group stays when a child matches. */
export function filterBom(rows: BomRow[], query: string): BomRow[] {
  const q = query.trim().toLowerCase();
  if (!q) return rows;
  const hit = (r: BomRow) => [r.no, r.name, r.partNo, r.material].some((s) => s.toLowerCase().includes(q));
  const out: BomRow[] = [];
  for (const r of rows) {
    const kids = r.children ? filterBom(r.children, q) : undefined;
    if (hit(r)) out.push(r);
    else if (kids?.length) out.push({ ...r, children: kids });
  }
  return out;
}

export function totalMass(rows: BomRow[]): number {
  return flattenRows(rows).reduce((s, r) => s + (r.children ? 0 : (r.mass ?? 0) * r.qty), 0);
}

const cell = (s: string) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);

/** CSV (UTF-8 with BOM for Excel). */
export function bomCsv(rows: BomRow[]): string {
  const lines = [["項目", "名前", "パーツ番号", "材質", "数量", "単体質量(g)", "合計質量(g)"].join(",")];
  for (const r of flattenRows(rows)) {
    const m = r.mass !== undefined && !r.children ? r.mass : undefined;
    lines.push([r.no, r.name, r.partNo, r.material, String(r.qty), m !== undefined ? m.toFixed(2) : "", m !== undefined ? (m * r.qty).toFixed(2) : ""].map(cell).join(","));
  }
  return "﻿" + lines.join("\r\n") + "\r\n";
}

/** Rows whose components are all selected / partially selected. */
export function rowSelection(r: BomRow, selected: Set<string>): "all" | "some" | "none" {
  const n = r.compIds.filter((id) => selected.has(id)).length;
  return n === 0 ? "none" : n === r.compIds.length ? "all" : "some";
}
