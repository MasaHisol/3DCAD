// Exact (kernel based) measurement requests / results shared by the geometry
// worker (src/measure/kernel.ts) and the UI (src/measure/ui.ts), plus the
// measurement annotations stored in part / assembly documents.

import type { Vec3 } from "../core/types";
import type { PickRef, Placement } from "../kernel/protocol";
import type { PmiRef } from "../mbd/pmi";

/** A body of the part, a face/edge/vertex, or a placed component (index into `placements`). */
export type MeasureTarget = PickRef | { body: number; kind: "body" } | { comp: number; kind: "comp" };

export type MeasureOp =
  | { op: "hole"; ref: PickRef }
  | { op: "holes"; refs: PickRef[] }
  | { op: "thickness"; body: number; samples?: number; maxDepth?: number }
  | { op: "thicknessAt"; body: number; point: Vec3; normal: Vec3; maxDepth?: number }
  | { op: "distance"; a: MeasureTarget; b: MeasureTarget; placements?: Placement[] }
  | { op: "clearance"; threshold: number; placements?: Placement[] }
  | { op: "props"; refs: MeasureTarget[]; density?: number; placements?: Placement[] };

export interface HoleInfo {
  kind: "hole" | "boss";
  /** Entry point on the axis (hole) / one end (boss). */
  center: Vec3;
  /** Axis direction from the entry into the material. */
  axis: Vec3;
  diameter: number;
  /** Depth of the drilled cylinder measured from the entry (excludes a drill point). */
  depth: number;
  through: boolean;
  counterbore?: { diameter: number; depth: number };
  countersink?: { diameter: number; angle: number };
  /** Cone at the bottom of a blind hole. */
  drillPoint?: { angle: number };
  thread?: { major: number; minor: number; pitch: number; length: number; designation: string };
  /** Indices of the faces making up the hole (same body as the picked face). */
  faces: number[];
  body: number;
}

export interface ThicknessResult {
  body: number;
  /** Sample points on the surface, their outward normals and the wall thickness there (NaN = no opposite wall). */
  points: Vec3[];
  normals: Vec3[];
  values: number[];
  min: number;
  max: number;
  /** Where the minimum occurs. */
  minAt?: Vec3;
  timeMs: number;
}

export interface DistanceResult {
  distance: number;
  /** Closest points on a and b (absent when the shapes touch / overlap). */
  pa?: Vec3;
  pb?: Vec3;
  overlap: boolean;
}

export interface ClearancePair extends DistanceResult {
  a: number;
  b: number;
}

export interface PropsResult {
  items: {
    kind: "face" | "edge" | "vertex" | "body" | "comp";
    type?: string;
    area?: number;
    perimeter?: number;
    length?: number;
    radius?: number;
    /** Arc sweep (deg) for circular edges. */
    arc?: number;
    volume?: number;
    mass?: number;
    centroid?: Vec3;
    point?: Vec3;
    normal?: Vec3;
  }[];
  /** Two items: angle between faces / edges (deg) and their minimum distance. */
  angle?: number;
  distance?: DistanceResult;
}

// ------------------------------------------------------------- annotations ---

export type MeasureNoteKind = "distance" | "clearance" | "angle" | "diameter" | "hole" | "pcd" | "radius" | "length" | "area" | "volume" | "thickness";

/** A measurement saved as an annotation (persisted in the document). */
export interface MeasureNote {
  id: string;
  name: string;
  kind: MeasureNoteKind;
  /** Model references (part documents), tracked through the topology names. */
  refs: PmiRef[];
  /** Body-level measurements (volume, clearance between bodies) of a part. */
  bodies?: number[];
  /** Assembly: component ids; `points` are then in each component's own frame. */
  comps?: string[];
  /** Main value in mm (mm², mm³, deg). */
  value: number;
  /** Extra values (e.g. hole depth, PCD deviation). */
  extra?: Record<string, number>;
  /** Points drawn (closest points, centre, ...), world (part) coordinates. */
  points: Vec3[];
  /** Component index per point (assembly notes). */
  pointComps?: number[];
  /** Label offset from the first point. */
  offset?: Vec3;
  hidden?: boolean;
  /** Set by re-resolution: references lost after an edit (shown flagged until repaired). */
  broken?: boolean;
  created?: string;
}
