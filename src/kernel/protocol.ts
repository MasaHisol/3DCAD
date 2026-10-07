// Messages exchanged between the UI thread and the geometry worker.
// Features arrive fully resolved: expressions are numbers, sketches are loops.

import type { BoolOp, EdgeRef, FaceRef, PlaneDef, Vec2, Vec3 } from "../core/types";
import type { LoopSeg } from "../sketch/profiles";

export interface RRegion {
  outer: LoopSeg[];
  holes: LoopSeg[][];
}

export type RFeature =
  | {
      id: string;
      type: "extrude";
      plane: PlaneDef;
      regions: RRegion[];
      op: BoolOp;
      /** Start / end offsets along the plane normal. */
      from: number;
      to: number;
      through: boolean;
      flip: boolean;
    }
  | {
      id: string;
      type: "revolve";
      plane: PlaneDef;
      regions: RRegion[];
      axisOrigin: Vec2;
      axisDir: Vec2;
      angle: number;
      op: BoolOp;
    }
  | { id: string; type: "loft"; sections: { plane: PlaneDef; outer: LoopSeg[] }[]; ruled: boolean; op: BoolOp }
  | { id: string; type: "sweep"; plane: PlaneDef; regions: RRegion[]; path: PathSeg[]; op: BoolOp }
  | { id: string; type: "pushpull"; face: FaceRef; distance: number }
  | { id: string; type: "fillet"; edges: EdgeRef[]; radius: number }
  | { id: string; type: "chamfer"; edges: EdgeRef[]; distance: number }
  | { id: string; type: "shell"; faces: FaceRef[]; thickness: number; outside?: boolean }
  | {
      id: string;
      type: "hole";
      plane: PlaneDef;
      points: Vec2[];
      holeType: "simple" | "counterbore" | "countersink";
      diameter: number;
      depth: number;
      through: boolean;
      cbDiameter: number;
      cbDepth: number;
      csDiameter: number;
      csAngle: number;
      flip: boolean;
    }
  | {
      id: string;
      type: "pattern";
      sources: string[];
      transforms: Transform[];
    }
  | { id: string; type: "primitive"; shape: "box" | "cylinder" | "sphere" | "torus"; plane: PlaneDef; center: Vec2; a: number; b: number; c: number; op: BoolOp }
  | { id: string; type: "import"; format: "step" | "stl"; data: string }
  | { id: string; type: "move"; transform: Transform };

export type PathSeg = { t: "line"; a: Vec3; b: Vec3 } | { t: "arc"; a: Vec3; m: Vec3; b: Vec3 };

/** Rigid transform: optional mirror, rotation (deg about axis through origin) then translation. */
export interface Transform {
  mirror?: { origin: Vec3; normal: Vec3 };
  rotate?: { angle: number; origin: Vec3; axis: Vec3 };
  translate?: Vec3;
}

export interface AxisInfo {
  origin: Vec3;
  dir: Vec3;
  radius: number;
}

export interface FaceInfo {
  center: Vec3;
  normal: Vec3;
  type: string;
  /** Cylindrical faces: their axis. */
  axis?: AxisInfo;
  /** For planar faces: a frame to sketch on. */
  plane?: PlaneDef;
}

export interface EdgeInfo {
  mid: Vec3;
  a: Vec3;
  b: Vec3;
  type: string;
  length: number;
  /** Circular edges: centre, plane normal and radius. */
  axis?: AxisInfo;
}

export interface BodyMesh {
  name: string;
  bbox: [Vec3, Vec3];
  positions: Float32Array;
  normals: Float32Array;
  indices: Uint32Array;
  /** Pairs (start, count) into `indices` for each face. */
  faceRanges: Int32Array;
  faces: FaceInfo[];
  edgePositions: Float32Array;
  /** Pairs (start, count) of vertices into `edgePositions` for each edge. */
  edgeRanges: Int32Array;
  edges: EdgeInfo[];
}

export interface RebuildResult {
  bodies: BodyMesh[];
  /** Bodies just before the feature named in `captureBefore` (for picking while editing it). */
  before?: BodyMesh[];
  errors: Record<string, string>;
  /** References re-resolved during the rebuild (keeps them tracking edits). */
  updatedRefs: Record<string, { edges?: EdgeRef[]; faces?: FaceRef[] }>;
  timeMs: number;
}

export interface MassProps {
  volume: number;
  area: number;
  centerOfMass: Vec3;
  bbox: [Vec3, Vec3];
  bodies: number;
}

export type PickRef = { body: number; kind: "face" | "edge" | "vertex"; index: number; point?: Vec3 };

export interface MeasureResult {
  distance?: number;
  length?: number;
  area?: number;
  angle?: number;
  radius?: number;
}

/** 2D drawing geometry in view coordinates (mm at 1:1, y up). `tag` = source body/placement. */
export type Seg2 =
  | { t: "line"; a: [number, number]; b: [number, number]; tag: number }
  | { t: "circle"; c: [number, number]; r: number; tag: number }
  | { t: "arc"; c: [number, number]; r: number; a0: number; a1: number; tag: number }
  | { t: "poly"; pts: [number, number][]; tag: number };

export interface ViewSpec {
  dir: Vec3;
  xAxis: Vec3;
  /** Section: keep the material behind the plane (opposite `normal`), hatch the cut faces. */
  section?: { origin: Vec3; normal: Vec3 };
  hidden?: boolean;
}

export interface ViewGeometry {
  visible: Seg2[];
  hidden: Seg2[];
  /** Cut faces of a section view: rings (outer + holes) per face. */
  hatch: [number, number][][][];
  bounds: [number, number, number, number];
}

export interface ProjectionView {
  name: string;
  visible: string[];
  hidden: string[];
  /** 2D bounding box in projection coordinates [minx, miny, maxx, maxy]. */
  bounds: [number, number, number, number];
}

/** A placed instance of a part (column-major 4x4 rigid transform). */
export interface Placement {
  key: string;
  matrix: number[];
  name: string;
}

export interface Interference {
  a: number;
  b: number;
  volume: number;
}

/** `key` selects a geometry engine: "main" for the edited part, otherwise an assembly part id. */
export type WorkerRequest =
  | { kind: "init" }
  | { kind: "rebuild"; features: RFeature[]; captureBefore?: string; key?: string }
  | { kind: "export"; format: "step" | "stl"; name: string; key?: string }
  | { kind: "massProps"; key?: string }
  | { kind: "measure"; a: PickRef; b?: PickRef; key?: string }
  | { kind: "projection"; views: { name: string; dir: Vec3; xAxis: Vec3 }[]; key?: string; placements?: Placement[] }
  | { kind: "exportAssembly"; format: "step" | "stl"; placements: Placement[] }
  | { kind: "interference"; placements: Placement[] }
  | { kind: "dropEngine"; key: string }
  | { kind: "drawViews"; key?: string; placements?: Placement[]; views: ViewSpec[] };

export type WorkerResponse = { id: number; ok: true; result: unknown } | { id: number; ok: false; error: string };
