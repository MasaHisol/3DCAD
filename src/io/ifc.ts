// IFC (buildings) for display: web-ifc (MPL-2.0) tessellates the model; the
// triangles are merged per colour and shown as reference data. This module is
// loaded on demand (dynamic import) so web-ifc and its wasm stay out of the
// main bundle; everything is bundled locally, so it works offline.

import { IfcAPI } from "web-ifc";
import wasmUrl from "web-ifc/web-ifc.wasm?url";

export interface IfcDisplay {
  name: string;
  /** Merged triangles per colour, positions in mm (Z up). */
  parts: { positions: Float32Array; indices: Uint32Array; color: string; opacity: number }[];
  /** Number of building elements with geometry. */
  elements: number;
  schema: string;
}

let api: Promise<IfcAPI> | null = null;

function ifcApi(): Promise<IfcAPI> {
  api ??= (async () => {
    const a = new IfcAPI();
    await a.Init(() => wasmUrl, true);
    return a;
  })();
  return api;
}

const hex = (c: { x: number; y: number; z: number }) => `#${[c.x, c.y, c.z].map((v) => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, "0")).join("")}`;

export async function readIfc(bytes: Uint8Array, name: string): Promise<IfcDisplay> {
  const a = await ifcApi();
  const id = a.OpenModel(bytes, { COORDINATE_TO_ORIGIN: false });
  if (id < 0) throw new Error("IFC ファイルを開けませんでした");
  try {
    const schema = String(a.GetModelSchema(id) ?? "");
    const groups = new Map<string, { pos: number[]; idx: number[]; opacity: number }>();
    let elements = 0;
    a.StreamAllMeshes(id, (mesh) => {
      elements++;
      const gs = mesh.geometries;
      for (let i = 0; i < gs.size(); i++) {
        const pg = gs.get(i);
        const geo = a.GetGeometry(id, pg.geometryExpressID);
        const verts = a.GetVertexArray(geo.GetVertexData(), geo.GetVertexDataSize());
        const index = a.GetIndexArray(geo.GetIndexData(), geo.GetIndexDataSize());
        const m = pg.flatTransformation;
        const key = `${hex(pg.color)}|${pg.color.w.toFixed(2)}`;
        let g = groups.get(key);
        if (!g) groups.set(key, (g = { pos: [], idx: [], opacity: pg.color.w }));
        const base = g.pos.length / 3;
        // interleaved position + normal; web-ifc is Y-up in metres -> Z-up mm
        for (let k = 0; k < verts.length; k += 6) {
          const x = verts[k], y = verts[k + 1], z = verts[k + 2];
          const wx = m[0] * x + m[4] * y + m[8] * z + m[12];
          const wy = m[1] * x + m[5] * y + m[9] * z + m[13];
          const wz = m[2] * x + m[6] * y + m[10] * z + m[14];
          g.pos.push(wx * 1000, -wz * 1000, wy * 1000);
        }
        for (let k = 0; k < index.length; k++) g.idx.push(index[k] + base);
        (geo as { delete?: () => void }).delete?.();
      }
      (mesh as { delete?: () => void }).delete?.();
    });
    if (!elements) throw new Error("IFC に表示できる形状がありません");
    return {
      name,
      schema,
      elements,
      parts: [...groups.entries()].map(([k, g]) => ({ positions: Float32Array.from(g.pos), indices: Uint32Array.from(g.idx), color: k.split("|")[0], opacity: g.opacity })),
    };
  } finally {
    a.CloseModel(id);
  }
}
