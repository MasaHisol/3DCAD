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

/** Rigid transform: optional mirror, rotation (deg about axis through origin) then translation. */
export interface Transform {
  mirror?: { origin: Vec3; normal: Vec3 };
  rotate?: { angle: number; origin: Vec3; axis: Vec3 };
  translate?: Vec3;
}

export interface FaceInfo {
  center: Vec3;
  normal: Vec3;
  type: string;
  /** For planar faces: a frame to sketch on. */
  plane?: PlaneDef;
}

export interface EdgeInfo {
  mid: Vec3;
  a: Vec3;
  b: Vec3;
  type: string;
  length: number;
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

export interface ProjectionView {
  name: string;
  visible: string[];
  hidden: string[];
  /** 2D bounding box in projection coordinates [minx, miny, maxx, maxy]. */
  bounds: [number, number, number, number];
}

export type WorkerRequest =
  | { kind: "init" }
  | { kind: "rebuild"; features: RFeature[]; captureBefore?: string }
  | { kind: "export"; format: "step" | "stl"; name: string }
  | { kind: "massProps" }
  | { kind: "measure"; a: PickRef; b?: PickRef }
  | { kind: "projection"; views: { name: string; dir: Vec3; xAxis: Vec3 }[] };

export type WorkerResponse = { id: number; ok: true; result: unknown } | { id: number; ok: false; error: string };
