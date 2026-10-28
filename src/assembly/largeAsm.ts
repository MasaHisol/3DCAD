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

// ------------------------------------------------ display performance ---

/** Level of detail of one instance: full mesh, simplified mesh, bounding box, or not drawn. */
export type Lod = "full" | "coarse" | "box" | "none";

export interface LodOptions {
  /** Below this projected diameter (px) an instance is drawn with its simplified mesh (0 = never). */
  coarsePx: number;
  /** Below this projected diameter (px) an instance is drawn as its bounding box (0 = never). */
  boxPx: number;
  /** Below this projected diameter (px) an instance is not drawn at all (0 = never). */
  cullPx: number;
}

export const DEFAULT_LOD: LodOptions = { coarsePx: 60, boxPx: 6, cullPx: 0.75 };

/** Level of detail for an instance whose bounding sphere spans `diameterPx` pixels on screen. */
export function lodLevel(diameterPx: number, o: LodOptions = DEFAULT_LOD): Lod {
  if (o.cullPx > 0 && diameterPx < o.cullPx) return "none";
  if (o.boxPx > 0 && diameterPx < o.boxPx) return "box";
  if (o.coarsePx > 0 && diameterPx < o.coarsePx) return "coarse";
  return "full";
}

/**
 * Projected diameter (px) of a sphere of `radius`. Orthographic views use the
 * constant `pixelSize` (world units per pixel); perspective views pass the
 * camera distance and the world size of a pixel at unit distance.
 */
export function projectedDiameter(radius: number, pixelSize: number, perspective?: { distance: number; pixelAtUnit: number }): number {
  if (perspective) {
    const d = perspective.distance;
    if (d <= radius) return Infinity; // camera inside the sphere
    return (2 * radius) / Math.max(1e-12, d * perspective.pixelAtUnit);
  }
  return (2 * radius) / Math.max(1e-12, pixelSize);
}

/**
 * Draw batches: items sharing a key (geometry + material) with at least
 * `minCount` members are drawn together (one instanced draw call); the rest
 * stay individual. `null` keys are never batched. Keys keep first-appearance order.
 */
export function batchGroups<K>(keys: (K | null)[], minCount = 2): { batches: { key: K; items: number[] }[]; singles: number[] } {
  const g = new Map<K, number[]>();
  const singles: number[] = [];
  keys.forEach((k, i) => {
    if (k === null) return;
    const l = g.get(k);
    if (l) l.push(i);
    else g.set(k, [i]);
  });
  const batches: { key: K; items: number[] }[] = [];
  for (const [key, items] of g) {
    if (items.length >= minCount) batches.push({ key, items });
    else singles.push(...items);
  }
  singles.sort((a, b) => a - b);
  return { batches, singles };
}

/**
 * Splits items into spatially compact chunks of at most `size` (recursive
 * median split on the widest axis of their centres), so each chunk has a tight
 * bounding sphere for frustum culling and zoom-dependent edge hiding.
 */
export function spatialChunks(centers: Vec3[], size: number): number[][] {
  const out: number[][] = [];
  const rec = (ids: number[]) => {
    if (ids.length <= size) {
      if (ids.length) out.push(ids);
      return;
    }
    const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
    for (const i of ids)
      for (let k = 0; k < 3; k++) {
        lo[k] = Math.min(lo[k], centers[i][k]);
        hi[k] = Math.max(hi[k], centers[i][k]);
      }
    const ax = [0, 1, 2].reduce((a, k) => (hi[k] - lo[k] > hi[a] - lo[a] ? k : a), 0);
    const s = [...ids].sort((a, b) => centers[a][ax] - centers[b][ax] || a - b);
    const m = s.length >> 1;
    rec(s.slice(0, m));
    rec(s.slice(m));
  };
  rec(centers.map((_, i) => i));
  return out;
}

/** Assemblies with at least this many components open in lightweight mode (cached display meshes, B-rep on demand). */
export const LIGHT_OPEN_COMPONENTS = 200;

/** Whether an assembly opens in lightweight mode. */
export function shouldOpenLight(componentCount: number, pref: "auto" | "on" | "off" = "auto"): boolean {
  return pref === "on" || (pref === "auto" && componentCount >= LIGHT_OPEN_COMPONENTS);
}

/** Short stable hash (cyrb53 + length) of a part's rebuild key, used to key cached display meshes. */
export function hashKey(s: string): string {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 2654435761);
    h2 = Math.imul(h2 ^ c, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0).toString(16).padStart(8, "0") + (h1 >>> 0).toString(16).padStart(8, "0") + s.length.toString(16);
}
