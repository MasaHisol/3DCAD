// Assembly interference check (干渉チェックの強化): bounding-box broad phase
// (sort and sweep), exact kernel boolean volume per candidate pair, touch vs
// interference, ignore list (press fits…), fastener filter, worker pool for
// large assemblies.
import type { Vec3 } from "../core/types";
import type { InterferenceExHit, InterferenceExOptions } from "../kernel/interferenceK";
import type { Placement } from "../kernel/protocol";

export interface CompBox {
  id: string;
  min: Vec3;
  max: Vec3;
}

export interface InterferenceResult {
  a: string;
  b: string;
  kind: "interfere" | "touch";
  volume: number;
  distance: number;
  center?: Vec3;
  mesh?: { positions: Float32Array; indices: Uint32Array };
  ignored: boolean;
}

export interface InterferenceOptions {
  /** Only pairs with at least one component in this set (all when absent). */
  subset?: Set<string>;
  /** Also test standard fasteners (bolts, nuts…). */
  includeFasteners: boolean;
  /** Report touching (contact) pairs. */
  touches: boolean;
  touchTol: number;
  /** Show ignored pairs in the result list (marked). */
  showIgnored: boolean;
}

export const DEFAULT_INTERFERENCE_OPTIONS: InterferenceOptions = { includeFasteners: false, touches: true, touchTol: 0.01, showIgnored: true };

/** Pair key independent of the order. */
export function pairKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

/**
 * Candidate pairs whose boxes (grown by `tol`) overlap: sort and sweep along
 * the longest extent axis, O(n log n + k).
 */
export function candidatePairs(boxes: CompBox[], tol = 0, subset?: Set<string>): [string, string][] {
  if (boxes.length < 2) return [];
  const ext = [0, 1, 2].map((k) => Math.max(...boxes.map((b) => b.max[k])) - Math.min(...boxes.map((b) => b.min[k])));
  const ax = ext.indexOf(Math.max(...ext));
  const order = [...boxes].sort((p, q) => p.min[ax] - q.min[ax]);
  const out: [string, string][] = [];
  const active: CompBox[] = [];
  for (const b of order) {
    for (let i = active.length - 1; i >= 0; i--) if (active[i].max[ax] + tol < b.min[ax]) active.splice(i, 1);
    for (const a of active) {
      if (subset && !subset.has(a.id) && !subset.has(b.id)) continue;
      let ok = true;
      for (let k = 0; k < 3 && ok; k++) ok = a.min[k] <= b.max[k] + tol && b.min[k] <= a.max[k] + tol;
      if (ok) out.push(a.id < b.id ? [a.id, b.id] : [b.id, a.id]);
    }
    active.push(b);
  }
  return out;
}

/** Marks ignored pairs and drops them unless shown; touches dropped unless wanted. Sorted: interferences by volume, then touches. */
export function finishResults(hits: Omit<InterferenceResult, "ignored">[], ignore: Iterable<string>, opts: Pick<InterferenceOptions, "touches" | "showIgnored">): InterferenceResult[] {
  const ig = new Set(ignore);
  return hits
    .map((h) => ({ ...h, ignored: ig.has(pairKey(h.a, h.b)) }))
    .filter((h) => (opts.showIgnored || !h.ignored) && (opts.touches || h.kind === "interfere"))
    .sort((p, q) => Number(p.ignored) - Number(q.ignored) || (p.kind === q.kind ? q.volume - p.volume : p.kind === "interfere" ? -1 : 1));
}

export function toggleIgnore(list: string[] | undefined, key: string): string[] {
  const s = new Set(list ?? []);
  if (s.has(key)) s.delete(key);
  else s.add(key);
  return [...s].sort();
}

/** Splits pairs into `n` chunks with few distinct components each (grouped by first component). */
export function chunkPairs<T extends [string, string]>(pairs: T[], n: number): T[][] {
  const chunks: T[][] = Array.from({ length: Math.max(1, n) }, () => []);
  const sorted = [...pairs].sort((p, q) => (p[0] < q[0] ? -1 : p[0] > q[0] ? 1 : 0));
  const per = Math.ceil(sorted.length / chunks.length);
  sorted.forEach((p, i) => chunks[Math.min(chunks.length - 1, Math.floor(i / per))].push(p));
  return chunks.filter((c) => c.length);
}

export interface InterferenceJob {
  placements: Placement[];
  opts: InterferenceExOptions;
}

/**
 * Runs the exact check on candidate pairs, split into `chunks` jobs (one per
 * kernel worker). `placementOf` maps component ids to placements; `run`
 * executes the jobs (main kernel, or the worker pool) and returns the hits
 * per job.
 */
export async function exactCheck(
  pairs: [string, string][],
  placementOf: Map<string, Placement>,
  chunks: number,
  run: (jobs: InterferenceJob[]) => Promise<InterferenceExHit[][]>,
  opts: { touchTol: number; mesh: boolean },
): Promise<Omit<InterferenceResult, "ignored">[]> {
  const groups = chunkPairs(pairs, chunks);
  const meta = groups.map((chunk) => {
    const ids = [...new Set(chunk.flat())];
    const index = new Map(ids.map((id, i) => [id, i]));
    return { ids, job: { placements: ids.map((id) => placementOf.get(id)!), opts: { pairs: chunk.map(([a, b]) => [index.get(a)!, index.get(b)!] as [number, number]), touchTol: opts.touchTol, mesh: opts.mesh } } };
  });
  const res = await run(meta.map((m) => m.job));
  return res.flatMap((hits, ci) => hits.map((h) => ({ a: meta[ci].ids[h.a], b: meta[ci].ids[h.b], kind: h.kind, volume: h.volume, distance: h.distance, center: h.center, mesh: h.mesh })));
}
