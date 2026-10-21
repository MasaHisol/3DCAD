// Pure helpers for large assemblies (no THREE / DOM): instance grouping,
// browser filtering, visibility (isolate), lightweight display decisions.
import type { Vec3 } from "../core/types";

/** Groups display slots by the shared mesh object they show (same part body = shared GPU geometry). */
export function groupInstances<T>(items: T[]): Map<T, number[]> {
  const g = new Map<T, number[]>();
  items.forEach((it, i) => {
    const l = g.get(it);
    if (l) l.push(i);
    else g.set(it, [i]);
  });
  return g;
}

/** Case-insensitive match of a component row against the browser search text (name or part name). */
export function matchesFilter(query: string, ...labels: (string | undefined)[]): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return labels.some((l) => !!l && l.toLowerCase().includes(q));
}

/** Visibility after isolate (selected visible, every other component hidden). */
export function isolateVisibility(ids: string[], selected: Set<string>): Map<string, boolean> {
  return new Map(ids.map((id) => [id, selected.has(id)]));
}

export interface LightOptions {
  /** Lightweight display on: components not being edited (not selected) are shown as boxes. */
  light: boolean;
  /** Pattern instances shown as boxes (simplified) even in normal display. */
  simplifyPatterns: boolean;
}

/** Whether a component is drawn as a bounding box proxy instead of its mesh. */
export function useProxy(o: LightOptions, comp: { id: string; patternOf?: unknown }, selected: Set<string>): boolean {
  if (selected.has(comp.id)) return false;
  return o.light || (o.simplifyPatterns && !!comp.patternOf);
}

/** Edges of a body are hidden when its projected diameter is below `minPx` pixels. */
export function edgeVisibleAtZoom(radius: number, pixelSize: number, minPx: number): boolean {
  if (minPx <= 0) return true;
  return (2 * radius) / Math.max(1e-12, pixelSize) >= minPx;
}

/** Column-major matrix mapping a unit cube centred at the origin onto the box [min, max]. */
export function boxMatrix(min: Vec3, max: Vec3): number[] {
  const s = [0, 1, 2].map((i) => Math.max(1e-6, max[i] - min[i]));
  const c = [0, 1, 2].map((i) => (max[i] + min[i]) / 2);
  return [s[0], 0, 0, 0, 0, s[1], 0, 0, 0, 0, s[2], 0, c[0], c[1], c[2], 1];
}

/** Rebuild order: parts with the most instances first (the bulk of the scene appears soonest). */
export function rebuildOrder(partIds: string[], components: { partId: string }[]): string[] {
  const n = new Map<string, number>();
  for (const c of components) n.set(c.partId, (n.get(c.partId) ?? 0) + 1);
  return partIds.map((id, i) => ({ id, i, k: n.get(id) ?? 0 })).sort((a, b) => b.k - a.k || a.i - b.i).map((x) => x.id);
}
