// PMI -> 2D drawing: projects compatible 3D annotations into a drawing view
// as regular (associative where possible) drawing annotations. Annotations
// that do not read in that view are collected into a "PMI 一覧" note table.

import { formatNumber } from "../core/expr";
import type { Vec2, Vec3 } from "../core/types";
import { toSheet, yAxisOf } from "../drawing/geom";
import type { Anno, DimAnno, DimKind, DView } from "../drawing/types";
import { PMI_LABELS, pmiText, type PmiAnno } from "./pmi";
import type { PmiGeom } from "./resolve";
import { vec } from "./resolve";

const PREFIX = "pmi-";

/** Drawing annotation id for a PMI annotation in a view (lets a re-import skip what is already there). */
export function pmiDrawingId(pmi: string, view: string) {
  return `${PREFIX}${pmi}-${view}`;
}

export interface PmiImport {
  annos: Anno[];
  /** PMI that could not be shown in this view (listed in the table note). */
  skipped: PmiAnno[];
}

/**
 * Convert annotations (with their resolved geometry) for view `v`.
 * `existing` = ids already on the sheet (not imported again).
 */
export function pmiToDrawing(items: { anno: PmiAnno; geom: PmiGeom | null }[], v: DView, existing: Set<string>, tablePos: Vec2 = [12, 14]): PmiImport {
  const xa = vec.unit(v.xAxis), ya = yAxisOf(v), d = vec.unit(v.dir);
  const P = (p: Vec3): Vec2 => [vec.dot(p, xa), vec.dot(p, ya)];
  const inPlane = (u: Vec3) => Math.abs(vec.dot(vec.unit(u), d)) < 0.05;
  const annos: Anno[] = [];
  const skipped: PmiAnno[] = [];
  for (const { anno: a, geom: g } of items) {
    if (a.hidden) continue;
    const id = pmiDrawingId(a.id, v.id);
    if (existing.has(id)) continue;
    if (!g) {
      skipped.push(a);
      continue;
    }
    const r0 = g.refs[0];
    // faces seen edge-on (normal in the view plane) or non-planar refs read well with a leader
    const faceVisible = !(r0.kind === "face" && r0.type === "PLANE" && r0.normal && !inPlane(r0.normal));
    const pos = P(g.label);
    switch (a.type) {
      case "dim": {
        if (!g.p1 || !g.p2 || !g.dir || !inPlane(g.dir) || (g.value ?? 0) < 1e-6) {
          skipped.push(a);
          break;
        }
        const u = [vec.dot(g.dir, xa), vec.dot(g.dir, ya)];
        const kind: DimKind = Math.abs(u[1]) < 1e-3 ? "horizontal" : Math.abs(u[0]) < 1e-3 ? "vertical" : "linear";
        const dim: DimAnno = { id, type: "dim", view: v.id, kind, refs: [{ kind: "point", p: P(g.p1) }, { kind: "point", p: P(g.p2) }], pos };
        if (a.tol && a.tol.kind !== "none") dim.tol = a.tol;
        if (a.text) dim.text = a.text;
        annos.push(dim);
        break;
      }
      case "diameter": {
        const ax = r0.axis;
        const rad = (g.value ?? 0) / 2;
        if (!ax || rad <= 0) {
          skipped.push(a);
          break;
        }
        const axd = vec.unit(ax.dir);
        let dim: DimAnno;
        if (Math.abs(vec.dot(axd, d)) > 0.99) {
          // seen end-on: a circle in the view
          dim = { id, type: "dim", view: v.id, kind: a.radius ? "radius" : "diameter", refs: [{ kind: "circle", p: P(ax.origin), r: rad }], pos };
        } else if (inPlane(axd)) {
          // seen from the side: dimension across the two silhouette lines
          const across = vec.unit(vec.cross(axd, d));
          const c = vec.add(ax.origin, vec.mul(axd, vec.dot(vec.sub(g.anchor, ax.origin), axd)));
          const p1 = vec.add(c, vec.mul(across, rad)), p2 = vec.sub(c, vec.mul(across, rad));
          const u = [vec.dot(across, xa), vec.dot(across, ya)];
          const kind: DimKind = Math.abs(u[1]) < 1e-3 ? "horizontal" : Math.abs(u[0]) < 1e-3 ? "vertical" : "linear";
          dim = { id, type: "dim", view: v.id, kind, refs: [{ kind: "point", p: P(p1) }, { kind: "point", p: P(p2) }], pos, prefix: a.radius ? "" : "φ" };
          if (a.radius) dim.text = `R${formatNumber(rad, 2)}`;
        } else {
          skipped.push(a);
          break;
        }
        if (a.tol && a.tol.kind !== "none") dim.tol = a.tol;
        if (a.text) dim.text = a.text;
        annos.push(dim);
        break;
      }
      case "gdt": {
        if (!faceVisible) {
          skipped.push(a);
          break;
        }
        const s = toSheet(v, pos);
        annos.push({ id, type: "gdt", x: s[0], y: s[1], symbol: a.symbol, value: a.value, datums: a.datums, leader: { view: v.id, p: P(g.anchor) } });
        break;
      }
      case "datum":
        if (!faceVisible) {
          skipped.push(a);
          break;
        }
        annos.push({ id, type: "datum", view: v.id, p: P(g.anchor), pos, letter: a.letter });
        break;
      case "surface":
        if (!faceVisible) {
          skipped.push(a);
          break;
        }
        annos.push({ id, type: "surface", view: v.id, p: P(g.anchor), ra: a.ra, removal: a.removal });
        break;
      case "note": {
        const s = toSheet(v, pos);
        annos.push({ id, type: "note", x: s[0], y: s[1], text: a.text, leader: { view: v.id, p: P(g.anchor) } });
        break;
      }
    }
  }
  const tableId = `${PREFIX}table-${v.id}`;
  if (skipped.length && !existing.has(tableId)) {
    const lines = ["PMI 一覧 (このビューに表示できない 3D 注記)", ...skipped.map((a, i) => `${i + 1}. ${PMI_LABELS[a.type]}: ${pmiText(a)}`)];
    annos.push({ id: tableId, type: "note", x: tablePos[0], y: tablePos[1], text: lines.join("\n"), size: 3 });
  }
  return { annos, skipped };
}
