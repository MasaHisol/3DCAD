// Wire / cable, hose and pipe routes of an assembly (配線・配管).
import type { Vec3 } from "../core/types";

export type RouteKind = "cable" | "hose" | "pipe";

export const ROUTE_KIND_LABEL: Record<RouteKind, string> = { cable: "電線/ケーブル", hose: "ホース", pipe: "パイプ" };

/** How a route point was obtained. "port" = connector point (face / circle centre with an exit direction). */
export type RouteSnap = "face" | "circle" | "port" | "offset" | "free";

/**
 * A route point. With `comp` it is stored in that component's local coordinates and
 * follows the component when it moves; without `comp` it is fixed in assembly space.
 */
export interface RoutePoint {
  id: string;
  comp?: string;
  local: Vec3;
  snap: RouteSnap;
  /** Connector exit direction (component-local, unit) — the route leaves / enters straight along it. */
  dir?: Vec3;
  /** Straight lead length along `dir` (mm) before the first bend (strain relief). */
  lead?: number;
  label: string;
}

export interface AsmRoute {
  id: string;
  name: string;
  kind: RouteKind;
  /** Outside diameter (mm): cable / hose OD, pipe OD. */
  od: number;
  /** Pipe / hose wall thickness (mm); 0 = solid (cable). */
  wall: number;
  /** Centre-line bend radius (mm). */
  bendRadius: number;
  /** Cable in a moving section (larger minimum bend radius). */
  moving?: boolean;
  color: string;
  /** Cut-length margin (%). */
  margin: number;
  /** Required clearance to other components (mm). */
  clearance: number;
  visible?: boolean;
  points: RoutePoint[];
}

/** Rule-of-thumb minimum bend radius (centre line) by type — catalogue values take priority. */
export function ruleMinRadius(kind: RouteKind, od: number, moving = false): number {
  if (kind === "cable") return od * (moving ? 7.5 : 4);
  if (kind === "hose") return od * 5;
  return od * 1.5;
}

/** Default design bend radius: cable 6×D (moving 10×D), hose 8×OD, pipe 3×OD. */
export function defaultBendRadius(kind: RouteKind, od: number, moving = false): number {
  if (kind === "cable") return od * (moving ? 10 : 6);
  if (kind === "hose") return od * 8;
  return od * 3;
}

export const ROUTE_COLORS: Record<RouteKind, string> = { cable: "#2a2d33", hose: "#2f6fd6", pipe: "#b0b6bf" };

export function newRoute(id: string, n: number, kind: RouteKind = "cable"): AsmRoute {
  const od = kind === "cable" ? 8 : kind === "hose" ? 10 : 12.7;
  return {
    id,
    name: `${ROUTE_KIND_LABEL[kind]}:${n}`,
    kind,
    od,
    wall: kind === "cable" ? 0 : kind === "hose" ? 2 : 1,
    bendRadius: defaultBendRadius(kind, od),
    color: ROUTE_COLORS[kind],
    margin: kind === "cable" ? 10 : 5,
    clearance: 2,
    points: [],
  };
}

/** Repairs routes read from a file (older files have none). */
export function sanitizeRoutes(raw: unknown): AsmRoute[] {
  if (!Array.isArray(raw)) return [];
  const fin = (v: unknown, d: number) => (typeof v === "number" && Number.isFinite(v) ? v : d);
  const vec = (v: unknown): Vec3 | null => (Array.isArray(v) && v.length === 3 && v.every((x) => Number.isFinite(x)) ? (v as Vec3) : null);
  return raw
    .filter((r) => r && typeof r === "object" && typeof r.id === "string")
    .map((r) => {
      const kind: RouteKind = r.kind === "hose" || r.kind === "pipe" ? r.kind : "cable";
      const od = Math.max(0.1, fin(r.od, 8));
      return {
        ...r,
        kind,
        od,
        name: typeof r.name === "string" ? r.name : r.id,
        wall: Math.max(0, Math.min(od / 2 - 0.01, fin(r.wall, 0))),
        bendRadius: Math.max(0, fin(r.bendRadius, defaultBendRadius(kind, od))),
        color: typeof r.color === "string" ? r.color : ROUTE_COLORS[kind],
        margin: fin(r.margin, 5),
        clearance: fin(r.clearance, 2),
        points: (Array.isArray(r.points) ? r.points : [])
          .filter((p: RoutePoint) => p && vec(p.local))
          .map((p: RoutePoint, i: number) => ({ ...p, id: typeof p.id === "string" ? p.id : `rp${i}`, label: p.label ?? "点", snap: p.snap ?? "free", dir: vec(p.dir) ?? undefined })),
      } as AsmRoute;
    });
}
