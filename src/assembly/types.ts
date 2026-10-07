import type { EdgeRef, FaceRef, Parameter, PartDocument, Vec3 } from "../core/types";

/** A part definition embedded in an assembly (native part or imported STEP). */
export interface AsmPart {
  id: string;
  name: string;
  kind: "part" | "step";
  doc?: PartDocument;
  /** STEP text for imported parts. */
  step?: string;
  fileName?: string;
}

export interface AsmComponent {
  id: string;
  name: string;
  partId: string;
  /** Column-major rigid 4x4 transform (part -> assembly). */
  matrix: number[];
  grounded: boolean;
  visible?: boolean;
}

export type AsmGeom = "plane" | "axis";

/** Geometry picked on a component, stored in part-local coordinates. */
export interface GeoRef {
  comp: string;
  geom: AsmGeom;
  point: Vec3;
  dir: Vec3;
  /** Topology reference used to re-resolve the geometry after part edits. */
  face?: FaceRef;
  edge?: EdgeRef;
  label: string;
}

export type AsmConstraintType = "mate" | "flush" | "insert" | "axis" | "angle";

export interface AsmConstraint {
  id: string;
  name: string;
  type: AsmConstraintType;
  a: GeoRef;
  b: GeoRef;
  /** Offset (mm) or angle (deg) expression. */
  offset: string;
  /** Insert: aligned instead of opposed. Axis: opposed direction. */
  flip?: boolean;
  suppressed?: boolean;
}

export interface AssemblyDocument {
  format: "3dcad-assembly";
  version: 1;
  name: string;
  parts: AsmPart[];
  components: AsmComponent[];
  constraints: AsmConstraint[];
  params: Parameter[];
  iprops: Record<string, string>;
  drawing?: import("../drawing/types").DrawingDoc;
}

export function newAssembly(name = "アセンブリ1"): AssemblyDocument {
  return {
    format: "3dcad-assembly",
    version: 1,
    name,
    parts: [],
    components: [],
    constraints: [],
    params: [],
    iprops: { パーツ番号: name, 説明: "", 設計者: "", 作成日: new Date().toISOString().slice(0, 10) },
  };
}

export const IDENTITY = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
