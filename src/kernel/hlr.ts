// Hidden-line removal for drawings (exact HLRBRep_Algo of the main kernel).
//
// Returns the projected edges as 2D polylines, split by visibility and kind:
// sharp edges, smooth (G1) edges between faces, sewn (G2+) edges and
// outlines (silhouettes). Coordinates are in the view plane: x along `xAxis`,
// y along dir × xAxis, the viewer looks against `dir` (as in drawView).
/* eslint-disable @typescript-eslint/no-explicit-any */

import * as R from "replicad";
import type { Vec3 } from "../core/types";

export type Polyline2 = [number, number][];

export interface HlrLines {
  sharp: Polyline2[];
  smooth: Polyline2[];
  sewn: Polyline2[];
  outline: Polyline2[];
}

export interface HlrResult {
  visible: HlrLines;
  hidden: HlrLines;
  /** [minx, miny, maxx, maxy] of the visible lines. */
  bounds: [number, number, number, number];
}

export interface HlrView {
  dir: Vec3;
  xAxis: Vec3;
  /** Also compute the hidden lines (default true). */
  hidden?: boolean;
  /** Chordal deflection of curved edges (default 0.1 % of the model size). */
  deflection?: number;
}

const oc = () => R.getOC() as any;

function edgesOf(shape: any): any[] {
  if (!shape || shape.IsNull()) return [];
  return [...R.iterTopo(shape, "edge")];
}

function polyline(edge: any, deflection: number): Polyline2 {
  const O = oc();
  const e = O.TopoDS.Edge(edge);
  O.BRepLib.BuildCurves3d(e);
  const c = new O.BRepAdaptor_Curve(e);
  const out: Polyline2 = [];
  try {
    if (c.GetType() === O.GeomAbs_CurveType.GeomAbs_Line) {
      for (const u of [c.FirstParameter(), c.LastParameter()]) {
        const p = c.Value(u);
        out.push([p.X(), p.Y()]);
      }
    } else {
      const d = new O.GCPnts_TangentialDeflection(c, 0.1, deflection, 2, 1e-9, 1e-7);
      for (let i = 1; i <= d.NbPoints(); i++) {
        const p = d.Value(i);
        out.push([p.X(), p.Y()]);
      }
      d.delete();
    }
  } finally {
    c.delete();
  }
  // reversed edges keep their direction of travel
  if (e.Orientation() === O.TopAbs_Orientation.TopAbs_REVERSED) out.reverse();
  return out;
}

/** Projects shapes with exact hidden-line removal. */
export function hlrProject(shapes: R.AnyShape[], view: HlrView): HlrResult {
  const O = oc();
  const empty = (): HlrLines => ({ sharp: [], smooth: [], sewn: [], outline: [] });
  if (!shapes.length) return { visible: empty(), hidden: empty(), bounds: [0, 0, 0, 0] };
  const shape = shapes.length === 1 ? shapes[0] : (R.makeCompound(shapes as never) as unknown as R.AnyShape);
  const raw = (shape as any).wrapped;
  // model size -> default deflection
  const bb = (shape as any).boundingBox?.bounds as [Vec3, Vec3] | undefined;
  const diag = bb ? Math.hypot(bb[1][0] - bb[0][0], bb[1][1] - bb[0][1], bb[1][2] - bb[0][2]) : 100;
  const defl = view.deflection ?? Math.max(1e-4, diag * 1e-3);

  const algo = new O.HLRBRep_Algo();
  algo.Add(raw, 0);
  const ax = new O.gp_Ax2(new O.gp_Pnt(0, 0, 0), new O.gp_Dir(...view.dir), new O.gp_Dir(...view.xAxis));
  algo.Projector(new O.HLRAlgo_Projector(ax));
  algo.Update();
  algo.Hide();
  const h = new O.HLRBRep_HLRToShape(algo);
  const lines = (pick: Record<keyof HlrLines, () => any>): HlrLines => {
    const out = empty();
    for (const k of Object.keys(pick) as (keyof HlrLines)[]) {
      let s: any = null;
      try {
        s = pick[k]();
      } catch {
        s = null;
      }
      for (const e of edgesOf(s)) {
        const pl = polyline(e, defl);
        if (pl.length >= 2) out[k].push(pl);
      }
    }
    return out;
  };
  const visible = lines({ sharp: () => h.VCompound(), smooth: () => h.Rg1LineVCompound(), sewn: () => h.RgNLineVCompound(), outline: () => h.OutLineVCompound() });
  const hidden = view.hidden === false ? empty() : lines({ sharp: () => h.HCompound(), smooth: () => h.Rg1LineHCompound(), sewn: () => h.RgNLineHCompound(), outline: () => h.OutLineHCompound() });
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const k of Object.keys(visible) as (keyof HlrLines)[])
    for (const pl of visible[k]) for (const [x, y] of pl) (x0 = Math.min(x0, x)), (y0 = Math.min(y0, y)), (x1 = Math.max(x1, x)), (y1 = Math.max(y1, y));
  return { visible, hidden, bounds: Number.isFinite(x0) ? [x0, y0, x1, y1] : [0, 0, 0, 0] };
}
