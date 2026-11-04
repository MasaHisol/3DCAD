// Fast sub-shape exploration (stage 1.5 engine #3).
//
// replicad's `shape.faces` / `shape.edges` de-duplicate the TopExp_Explorer
// output with a linear `IsSame` scan (O(n²) WebAssembly calls), and naming
// builds its edge -> face table through one wrapper per face edge. On a part
// with hundreds of faces this dominated the rebuild. Here the same
// exploration is de-duplicated through a hash on (TShape, location) — the
// hash replicad itself uses — with `IsSame` only on collisions: exactly the
// same sub-shapes in the same order (first occurrence), in O(n).
// Any failure (binding missing in a kernel build) falls back to replicad.

import * as R from "replicad";

type Kind = "face" | "edge";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

const HASH_MAX = 2147483647;

/** Set of TopoDS shapes with IsSame semantics, numbered in insertion order. */
class ShapeIndex {
  private buckets = new Map<number, { s: Any; i: number }[]>();
  size = 0;
  constructor(private oc: Any) {}
  private hash(s: Any): number {
    return this.oc.ReplicadShapeHasher.HashCode(s, HASH_MAX);
  }
  /** Index of `s`, or -1. */
  find(s: Any): number {
    const l = this.buckets.get(this.hash(s));
    if (!l) return -1;
    for (const x of l) if (x.s.IsSame(s)) return x.i;
    return -1;
  }
  /** [index, isNew] */
  add(s: Any): [number, boolean] {
    const h = this.hash(s);
    let l = this.buckets.get(h);
    if (!l) this.buckets.set(h, (l = []));
    for (const x of l) if (x.s.IsSame(s)) return [x.i, false];
    l.push({ s, i: this.size });
    return [this.size++, true];
  }
  dispose() {
    for (const l of this.buckets.values()) for (const x of l) x.s.delete?.();
    this.buckets.clear();
  }
}

function explore(oc: Any, shape: Any, kind: Kind, onNew: (item: Any, index: number) => void): ShapeIndex {
  const index = new ShapeIndex(oc);
  const E = oc.TopAbs_ShapeEnum;
  const ex = new oc.TopExp_Explorer(shape, kind === "face" ? E.TopAbs_FACE : E.TopAbs_EDGE, E.TopAbs_SHAPE);
  try {
    for (; ex.More(); ex.Next()) {
      const item = ex.Current();
      const [i, fresh] = index.add(item);
      if (fresh) onNew(item, i);
      else item.delete?.();
    }
  } catch (e) {
    index.dispose();
    throw e;
  } finally {
    ex.delete();
  }
  return index;
}

/** Sub-shapes of `shape` in replicad order, wrapped (faces / edges). */
function subShapes(shape: Any, kind: Kind): unknown[] {
  const oc: Any = R.getOC();
  const out: unknown[] = [];
  const W: Any = kind === "face" ? R.Face : R.Edge;
  explore(oc, shape, kind, (item) => out.push(new W(kind === "face" ? oc.TopoDS.Face(item) : oc.TopoDS.Edge(item)))).dispose();
  return out;
}

/**
 * For every edge of `shape` (in `shape.edges` order) the indices of the faces
 * (in `shape.faces` order, ascending) that contain it. Null when unavailable.
 */
export function edgeFaceTable(shape: R.Shape3D): number[][] | null {
  let edges: ShapeIndex | null = null, faces: ShapeIndex | null = null;
  try {
    const oc: Any = R.getOC();
    const E = oc.TopAbs_ShapeEnum;
    const ed = (edges = explore(oc, (shape as Any).wrapped, "edge", () => {}));
    const table: number[][] = Array.from({ length: ed.size }, () => []);
    faces = explore(oc, (shape as Any).wrapped, "face", (face, fi) => {
      const ee = new oc.TopExp_Explorer(face, E.TopAbs_EDGE, E.TopAbs_SHAPE);
      try {
        for (; ee.More(); ee.Next()) {
          const e = ee.Current();
          const ei = ed.find(e);
          e.delete?.();
          if (ei >= 0 && table[ei][table[ei].length - 1] !== fi) table[ei].push(fi);
        }
      } finally {
        ee.delete();
      }
    });
    return table;
  } catch {
    return null;
  } finally {
    edges?.dispose();
    faces?.dispose();
  }
}

let installed = false;

/** Replace `Shape.faces` / `Shape.edges` with the O(n) exploration (idempotent). */
export function installFastTopology(): void {
  if (installed) return;
  installed = true;
  const proto = (R as Any).Shape?.prototype;
  if (!proto) return;
  const orig = {
    faces: Object.getOwnPropertyDescriptor(proto, "faces")?.get,
    edges: Object.getOwnPropertyDescriptor(proto, "edges")?.get,
  };
  if (!orig.faces || !orig.edges) return;
  let broken = false;
  const def = (kind: Kind) =>
    Object.defineProperty(proto, kind === "face" ? "faces" : "edges", {
      configurable: true,
      get(this: Any) {
        if (!broken)
          try {
            return subShapes(this.wrapped, kind);
          } catch {
            broken = true; // binding missing in this kernel build: keep the original
          }
        return (kind === "face" ? orig.faces : orig.edges)!.call(this);
      },
    });
  def("face");
  def("edge");
}
