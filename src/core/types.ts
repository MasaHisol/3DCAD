// Document model. Everything here is plain JSON so documents can be saved,
// diffed and restored by undo/redo snapshots.

export type Vec2 = [number, number];
export type Vec3 = [number, number, number];

/** A coordinate frame for sketches and work planes. */
export interface PlaneDef {
  origin: Vec3;
  xDir: Vec3;
  normal: Vec3;
}

export type ParamUnit = "mm" | "deg" | "ul";

export interface Parameter {
  name: string;
  expr: string;
  unit: ParamUnit;
  comment?: string;
  /** "model" parameters are created by dimensions/features, "user" ones by hand. */
  kind: "model" | "user";
  /** Feature that owns a model parameter (deleted together with it). */
  owner?: string;
  /** Last evaluated value (cache, recomputed on every regen). */
  value?: number;
  error?: string;
}

// ---------------------------------------------------------------- sketch ---

export interface SkPoint {
  id: string;
  type: "point";
  x: number;
  y: number;
  /** Projected origin / reference geometry that cannot move. */
  fixed?: boolean;
  ref?: boolean;
  construction?: boolean;
}
export interface SkLine {
  id: string;
  type: "line";
  p1: string;
  p2: string;
  construction?: boolean;
  ref?: boolean;
}
export interface SkCircle {
  id: string;
  type: "circle";
  c: string;
  r: number;
  construction?: boolean;
  ref?: boolean;
}
/** Arc running counter-clockwise from p1 to p2 around centre c. */
export interface SkArc {
  id: string;
  type: "arc";
  c: string;
  p1: string;
  p2: string;
  construction?: boolean;
  ref?: boolean;
}
export type SkEntity = SkPoint | SkLine | SkCircle | SkArc;

export type ConstraintType =
  | "coincident"
  | "pointOnCurve"
  | "horizontal"
  | "vertical"
  | "parallel"
  | "perpendicular"
  | "collinear"
  | "equal"
  | "tangent"
  | "concentric"
  | "midpoint"
  | "fix"
  | "symmetric";

export interface SkConstraint {
  id: string;
  type: ConstraintType;
  refs: string[];
}

export type DimensionType = "distance" | "hdistance" | "vdistance" | "length" | "radius" | "diameter" | "angle";

export interface SkDimension {
  id: string;
  type: DimensionType;
  refs: string[];
  /** Parameter that drives this dimension. */
  param: string;
  /** Label position in sketch coordinates. */
  pos: Vec2;
  /** Driven (reference) dimensions only display the measured value. */
  driven?: boolean;
}

// -------------------------------------------------------------- features ---

export type BoolOp = "new" | "join" | "cut" | "intersect";

/** Persistent reference to model topology, resolved geometrically at regen. */
export interface EdgeRef {
  mid: Vec3;
  a?: Vec3;
  b?: Vec3;
  /** Mid point normalised to the owning body's bounding box (0..1). */
  n?: Vec3;
  type?: string;
}
export interface FaceRef {
  center: Vec3;
  normal: Vec3;
  n?: Vec3;
  type?: string;
}

export interface FeatureBase {
  id: string;
  name: string;
  suppressed?: boolean;
}

export interface SketchFeature extends FeatureBase {
  type: "sketch";
  plane: PlaneDef;
  /** Name of the plane / face it was created on, for display. */
  planeLabel: string;
  /** Work plane feature the sketch lives on (plane follows it). */
  planeRef?: string;
  entities: SkEntity[];
  constraints: SkConstraint[];
  dimensions: SkDimension[];
  visible?: boolean;
}

export interface ExtrudeFeature extends FeatureBase {
  type: "extrude";
  sketch: string;
  /** Selected profile regions (indices into the sketch's region list). */
  profiles: number[];
  /** Interior sample point of each selected region: keeps the selection stable when the sketch changes. */
  profilePts?: Vec2[];
  op: BoolOp;
  extent: "distance" | "symmetric" | "through";
  distance: string;
  flip: boolean;
}

export interface RevolveFeature extends FeatureBase {
  type: "revolve";
  sketch: string;
  profiles: number[];
  profilePts?: Vec2[];
  /** Sketch line id used as axis, or "X"/"Y" sketch axis. */
  axis: string;
  op: BoolOp;
  extent: "angle" | "full";
  angle: string;
  flip: boolean;
}

export interface LoftFeature extends FeatureBase {
  type: "loft";
  /** Section sketches in order (outer loop of their first region). */
  sketches: string[];
  op: BoolOp;
  ruled: boolean;
}

export interface SweepFeature extends FeatureBase {
  type: "sweep";
  sketch: string;
  profiles: number[];
  profilePts?: Vec2[];
  /** Sketch holding the path (open or closed chain of lines / arcs). */
  path: string;
  op: BoolOp;
}

/** Direct edit: offset a planar face along its normal (Press/Pull). */
export interface PushPullFeature extends FeatureBase {
  type: "pushpull";
  face: FaceRef | null;
  distance: string;
}

export interface FilletFeature extends FeatureBase {
  type: "fillet";
  edges: EdgeRef[];
  radius: string;
}

export interface ChamferFeature extends FeatureBase {
  type: "chamfer";
  edges: EdgeRef[];
  distance: string;
}

export interface ShellFeature extends FeatureBase {
  type: "shell";
  faces: FaceRef[];
  thickness: string;
  /** Grow the wall outward instead of hollowing inward. */
  outside?: boolean;
}

export interface HoleFeature extends FeatureBase {
  type: "hole";
  sketch: string;
  /** Sketch point ids that locate the holes (empty = all non-construction points). */
  points: string[];
  holeType: "simple" | "counterbore" | "countersink";
  diameter: string;
  depth: string;
  through: boolean;
  cbDiameter: string;
  cbDepth: string;
  csDiameter: string;
  csAngle: string;
  flip: boolean;
}

export type AxisRef = "X" | "Y" | "Z";

export interface PatternFeature extends FeatureBase {
  type: "rectPattern" | "circPattern";
  features: string[];
  axis: AxisRef;
  count: string;
  /** Spacing (rect) or total angle (circular). */
  spacing: string;
  axis2?: AxisRef | "";
  count2: string;
  spacing2: string;
  flip: boolean;
}

export interface MirrorFeature extends FeatureBase {
  type: "mirror";
  features: string[];
  plane: "XY" | "YZ" | "XZ";
  offset: string;
}

export interface PrimitiveFeature extends FeatureBase {
  type: "box" | "cylinder" | "sphere" | "torus";
  plane: PlaneDef;
  center: Vec2;
  a: string;
  b: string;
  c: string;
  op: BoolOp;
}

export interface WorkPlaneFeature extends FeatureBase {
  type: "workplane";
  base: PlaneDef;
  baseLabel: string;
  offset: string;
  visible?: boolean;
  /** Resolved plane (cache). */
  plane?: PlaneDef;
}

export interface ImportFeature extends FeatureBase {
  type: "import";
  format: "step" | "stl";
  fileName: string;
  /** File contents (STEP text, or base64 for binary STL). */
  data: string;
}

export interface MoveFeature extends FeatureBase {
  type: "move";
  dx: string;
  dy: string;
  dz: string;
  rx: string;
  ry: string;
  rz: string;
}

export type Feature =
  | SketchFeature
  | ExtrudeFeature
  | RevolveFeature
  | LoftFeature
  | SweepFeature
  | PushPullFeature
  | FilletFeature
  | ChamferFeature
  | ShellFeature
  | HoleFeature
  | PatternFeature
  | MirrorFeature
  | PrimitiveFeature
  | WorkPlaneFeature
  | ImportFeature
  | MoveFeature;

export type FeatureType = Feature["type"];

export interface Material {
  name: string;
  density: number; // g/cm^3
  color: string;
}

export interface PartDocument {
  format: "3dcad-part";
  version: 1;
  name: string;
  units: "mm";
  params: Parameter[];
  features: Feature[];
  /** Index of the End-of-Part marker (features at >= index are rolled back). */
  endOfPart: number;
  material: Material;
  iprops: Record<string, string>;
  /** 2D drawing sheets documenting this part. */
  drawing?: import("../drawing/types").DrawingDoc;
}
