// Feature dependency graph (stage 1.5 engine #3).
//
// Nodes are parameters ("p:<name>") and features ("f:<id>"). Edges point from
// an input to its consumer:
//   parameter -> parameter     (expression references)
//   parameter -> feature       (any expression / dimension in the feature)
//   feature   -> feature       (id references: sketch -> extrude, work plane ->
//                               sketch, pattern sources, surfaces, named face /
//                               edge references "<feature>:…")
//   body feature -> next body feature (the solid flows down the tree; a sketch
//                               placed on a model face depends on the body too)
// affectedSet() is the closure of a change; the kernel resumes at the first
// affected body feature (its prefix cache keys encode the same thing, the
// graph explains *why* and is checked against the kernel in tests).

import { references } from "./expr";
import { edgeFaces, nameFeature } from "./naming";
import type { Feature, PartDocument } from "./types";

const CONSTRUCTION = new Set(["sketch", "workplane", "workaxis", "workpoint"]);

export const pNode = (name: string) => `p:${name}`;
export const fNode = (id: string) => `f:${id}`;

export interface DepGraph {
  /** node -> nodes that consume it */
  out: Map<string, Set<string>>;
  /** node -> nodes it consumes */
  in: Map<string, Set<string>>;
  /** feature id -> index in the tree */
  order: Map<string, number>;
}

function strings(v: unknown, acc: string[] = []): string[] {
  if (typeof v === "string") acc.push(v);
  else if (Array.isArray(v)) for (const x of v) strings(x, acc);
  else if (v && typeof v === "object") for (const x of Object.values(v)) strings(x, acc);
  return acc;
}

function exprRefs(s: string): string[] {
  try {
    return references(s);
  } catch {
    return [];
  }
}

/** Is a feature part of the solid / surface chain (not construction geometry)? */
export function isBodyFeature(f: Feature): boolean {
  return !CONSTRUCTION.has(f.type);
}

export function buildDepGraph(doc: PartDocument): DepGraph {
  const g: DepGraph = { out: new Map(), in: new Map(), order: new Map() };
  const edge = (a: string, b: string) => {
    if (a === b) return;
    if (!g.out.has(a)) g.out.set(a, new Set());
    if (!g.in.has(b)) g.in.set(b, new Set());
    g.out.get(a)!.add(b);
    g.in.get(b)!.add(a);
  };
  const params = new Set(doc.params.map((p) => p.name));
  for (const p of doc.params) for (const r of exprRefs(p.expr)) if (params.has(r)) edge(pNode(r), pNode(p.name));
  const ids = new Set(doc.features.map((f) => f.id));
  doc.features.forEach((f, i) => g.order.set(f.id, i));
  let lastBody: string | null = null;
  doc.features.forEach((f) => {
    const me = fNode(f.id);
    for (const s of strings({ ...f, id: undefined, name: undefined })) {
      if (params.has(s)) edge(pNode(s), me);
      else if (ids.has(s)) edge(fNode(s), me);
      else {
        // pattern copies "<id>#n", topology names "<feature>:role", edge names "E[a | b]"
        const head = s.split("#")[0];
        if (ids.has(head)) edge(fNode(head), me);
        for (const n of [s, ...edgeFaces(s)]) {
          const fid = nameFeature(n);
          if (fid !== n && ids.has(fid)) edge(fNode(fid), me);
        }
        if (/[A-Za-z_]/.test(s) && s.length < 200) for (const r of exprRefs(s)) if (params.has(r)) edge(pNode(r), me);
      }
    }
    const onBody = f.type === "sketch" && !!(f as { faceRef?: unknown }).faceRef;
    if (lastBody && (isBodyFeature(f) || onBody)) edge(fNode(lastBody), me);
    // suppressed features stay in the chain: (un)suppressing one affects what follows
    if (isBodyFeature(f)) lastBody = f.id;
  });
  return g;
}

/** Every node reachable from `changed` (inclusive). */
export function affectedSet(g: DepGraph, changed: Iterable<string>): Set<string> {
  const seen = new Set<string>();
  const stack = [...changed];
  while (stack.length) {
    const n = stack.pop()!;
    if (seen.has(n)) continue;
    seen.add(n);
    for (const m of g.out.get(n) ?? []) stack.push(m);
  }
  return seen;
}

/**
 * Nodes changed between two versions of a document: edited / added parameters
 * and features, features that moved (reorder) or crossed the rollback bar.
 * Removed features count as a change of the next feature that remains.
 */
export function changedNodes(prev: PartDocument, next: PartDocument): Set<string> {
  const out = new Set<string>();
  const pp = new Map(prev.params.map((p) => [p.name, p.expr]));
  for (const p of next.params) if (pp.get(p.name) !== p.expr) out.add(pNode(p.name));
  const pf = new Map(prev.features.map((f, i) => [f.id, { j: JSON.stringify(f), i, active: i < prev.endOfPart }]));
  const nextIds = new Set(next.features.map((f) => f.id));
  // order among features present in both versions
  const common = prev.features.filter((f) => nextIds.has(f.id)).map((f) => f.id);
  const commonNext = next.features.filter((f) => pf.has(f.id)).map((f) => f.id);
  let k = 0;
  next.features.forEach((f, i) => {
    const o = pf.get(f.id);
    const active = i < next.endOfPart;
    if (!o || o.j !== JSON.stringify(f) || o.active !== active) out.add(fNode(f.id));
    if (o) {
      if (common[k] !== commonNext[k]) out.add(fNode(f.id));
      k++;
    }
  });
  // a removed feature: the feature now in its place changes
  prev.features.forEach((f, i) => {
    if (nextIds.has(f.id)) return;
    const after = prev.features.slice(i + 1).find((x) => nextIds.has(x.id));
    if (after) out.add(fNode(after.id));
  });
  return out;
}

/** Feature ids affected by going from `prev` to `next`, in tree order. */
export function affectedFeatures(prev: PartDocument, next: PartDocument): string[] {
  const g = buildDepGraph(next);
  const set = affectedSet(g, changedNodes(prev, next));
  return next.features.filter((f) => set.has(fNode(f.id))).map((f) => f.id);
}

/**
 * Index (among the active, unsuppressed body features — the features the
 * kernel evaluates) of the first one affected; equals their count when none is.
 */
export function firstAffectedBodyIndex(doc: PartDocument, affected: Iterable<string>): number {
  const set = new Set(affected);
  const body = doc.features.slice(0, doc.endOfPart).filter((f) => isBodyFeature(f) && !f.suppressed);
  const i = body.findIndex((f) => set.has(f.id));
  return i < 0 ? body.length : i;
}
