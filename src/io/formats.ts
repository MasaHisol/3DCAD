// Interchange formats beyond STEP / STL: DXF (AutoCAD 2D), OBJ, 3MF, GLB, PLY.

import * as THREE from "three";
import { OBJExporter } from "three/examples/jsm/exporters/OBJExporter.js";
import { PLYExporter } from "three/examples/jsm/exporters/PLYExporter.js";
import type { BodyMesh } from "../kernel/protocol";
import { writeGlb, writeGltf } from "./gltf";

export * from "./dxf";

// ----------------------------------------------------------------- OBJ in ---

/** OBJ (triangles / polygons) -> binary STL bytes for the solid importer. */
export function objToStl(text: string): Uint8Array {
  const v: number[][] = [];
  const tris: number[][] = [];
  for (const raw of text.split(/\r?\n/)) {
    const l = raw.trim();
    if (l.startsWith("v ")) v.push(l.slice(2).trim().split(/\s+/).map(Number));
    else if (l.startsWith("f ")) {
      const idx = l
        .slice(2)
        .trim()
        .split(/\s+/)
        .map((t) => {
          const k = parseInt(t.split("/")[0], 10);
          return k < 0 ? v.length + k : k - 1;
        });
      for (let i = 1; i + 1 < idx.length; i++) tris.push([idx[0], idx[i], idx[i + 1]]);
    }
  }
  if (!tris.length) throw new Error("OBJ に面がありません");
  const buf = new ArrayBuffer(84 + tris.length * 50);
  const dv = new DataView(buf);
  dv.setUint32(80, tris.length, true);
  let o = 84;
  for (const t of tris) {
    const [a, b, c] = t.map((i) => v[i]);
    const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], w = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    const n = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
    const l = Math.hypot(n[0], n[1], n[2]) || 1;
    for (const x of [n[0] / l, n[1] / l, n[2] / l, ...a, ...b, ...c]) {
      dv.setFloat32(o, x, true);
      o += 4;
    }
    o += 2;
  }
  return new Uint8Array(buf);
}

// ------------------------------------------------------------ mesh exports ---

function meshGroup(bodies: { mesh: BodyMesh; matrix?: THREE.Matrix4; color?: string; name: string }[]): THREE.Group {
  const g = new THREE.Group();
  for (const b of bodies) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(b.mesh.positions.slice(), 3));
    geo.setAttribute("normal", new THREE.BufferAttribute(b.mesh.normals.slice(), 3));
    geo.setIndex(new THREE.BufferAttribute(b.mesh.indices.slice(), 1));
    const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: b.color ?? "#c9ced6", metalness: 0.1, roughness: 0.5 }));
    m.name = b.name;
    if (b.matrix) m.applyMatrix4(b.matrix);
    g.add(m);
  }
  g.updateMatrixWorld(true);
  return g;
}

export type MeshFormat = "obj" | "3mf" | "glb" | "gltf" | "ply";

export async function exportMeshes(format: MeshFormat, bodies: { mesh: BodyMesh; matrix?: THREE.Matrix4; color?: string; name: string }[]): Promise<Blob> {
  if (format === "glb" || format === "gltf") {
    // names, colours and placements per body (glTF nodes), metres
    const items = bodies.map((b) => ({ name: b.name, positions: b.mesh.positions, normals: b.mesh.normals, indices: b.mesh.indices, color: b.color, matrix: b.matrix?.toArray() }));
    return format === "glb" ? new Blob([writeGlb(items) as BlobPart], { type: "model/gltf-binary" }) : new Blob([writeGltf(items)], { type: "model/gltf+json" });
  }
  const g = meshGroup(bodies);
  switch (format) {
    case "obj":
      return new Blob([new OBJExporter().parse(g)], { type: "text/plain" });
    case "ply":
      return new Blob([new PLYExporter().parse(g, () => {}, { binary: true }) as ArrayBuffer], { type: "application/octet-stream" });
    case "3mf":
      return new Blob([threeMf(g) as BlobPart], { type: "model/3mf" });
  }
}

/** Minimal 3MF (core spec): one <object> per body, millimetre units, zip (store). */
function threeMf(g: THREE.Group): Uint8Array {
  const objs: string[] = [];
  const items: string[] = [];
  let id = 1;
  g.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    const geo = m.geometry.clone().applyMatrix4(m.matrixWorld);
    const p = geo.getAttribute("position");
    const idx = geo.getIndex()!;
    const vs: string[] = [];
    for (let i = 0; i < p.count; i++) vs.push(`<vertex x="${p.getX(i)}" y="${p.getY(i)}" z="${p.getZ(i)}"/>`);
    const ts: string[] = [];
    for (let i = 0; i < idx.count; i += 3) ts.push(`<triangle v1="${idx.getX(i)}" v2="${idx.getX(i + 1)}" v3="${idx.getX(i + 2)}"/>`);
    objs.push(`<object id="${id}" name="${escapeXml(m.name)}" type="model"><mesh><vertices>${vs.join("")}</vertices><triangles>${ts.join("")}</triangles></mesh></object>`);
    items.push(`<item objectid="${id}"/>`);
    id++;
  });
  const model = `<?xml version="1.0" encoding="UTF-8"?>\n<model unit="millimeter" xml:lang="ja-JP" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02"><resources>${objs.join("")}</resources><build>${items.join("")}</build></model>`;
  const types = `<?xml version="1.0" encoding="UTF-8"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/></Types>`;
  const rels = `<?xml version="1.0" encoding="UTF-8"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/></Relationships>`;
  const enc = new TextEncoder();
  return zipStore([
    ["[Content_Types].xml", enc.encode(types)],
    ["_rels/.rels", enc.encode(rels)],
    ["3D/3dmodel.model", enc.encode(model)],
  ]);
}

function escapeXml(s: string) {
  return s.replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" })[c]!);
}

const CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(d: Uint8Array) {
  let c = 0xffffffff;
  for (let i = 0; i < d.length; i++) c = CRC[(c ^ d[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/** Uncompressed ZIP writer (enough for 3MF / OPC packages). */
export function zipStore(files: [string, Uint8Array][]): Uint8Array {
  const enc = new TextEncoder();
  const parts: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;
  for (const [name, data] of files) {
    const nb = enc.encode(name);
    const crc = crc32(data);
    const lh = new DataView(new ArrayBuffer(30));
    lh.setUint32(0, 0x04034b50, true);
    lh.setUint16(4, 20, true);
    lh.setUint32(14, crc, true);
    lh.setUint32(18, data.length, true);
    lh.setUint32(22, data.length, true);
    lh.setUint16(26, nb.length, true);
    parts.push(new Uint8Array(lh.buffer), nb, data);
    const ch = new DataView(new ArrayBuffer(46));
    ch.setUint32(0, 0x02014b50, true);
    ch.setUint16(4, 20, true);
    ch.setUint16(6, 20, true);
    ch.setUint32(16, crc, true);
    ch.setUint32(20, data.length, true);
    ch.setUint32(24, data.length, true);
    ch.setUint16(28, nb.length, true);
    ch.setUint32(42, offset, true);
    central.push(new Uint8Array(ch.buffer), nb);
    offset += 30 + nb.length + data.length;
  }
  const cdSize = central.reduce((s, x) => s + x.length, 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true);
  end.setUint16(8, files.length, true);
  end.setUint16(10, files.length, true);
  end.setUint32(12, cdSize, true);
  end.setUint32(16, offset, true);
  const all = [...parts, ...central, new Uint8Array(end.buffer)];
  const out = new Uint8Array(all.reduce((s, x) => s + x.length, 0));
  let p = 0;
  for (const a of all) {
    out.set(a, p);
    p += a.length;
  }
  return out;
}

// ---------------------------------------------------------- design table ---

/** Parameters <-> CSV (Excel friendly, UTF-8 BOM). */
export function paramsToCsv(params: { name: string; expr: string; unit: string; value?: number; comment?: string }[]): string {
  const q = (s: string) => `"${String(s).replace(/"/g, '""')}"`;
  return "﻿" + ["名前,式,単位,値,コメント", ...params.map((p) => [q(p.name), q(p.expr), q(p.unit), p.value ?? "", q(p.comment ?? "")].join(","))].join("\r\n");
}

export function csvToParams(text: string): { name: string; expr: string }[] {
  const rows: string[][] = [];
  let row: string[] = [], cell = "", inQ = false;
  const s = text.replace(/^﻿/, "");
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inQ) {
      if (c === '"' && s[i + 1] === '"') (cell += '"'), i++;
      else if (c === '"') inQ = false;
      else cell += c;
    } else if (c === '"') inQ = true;
    else if (c === "," || c === "\t") row.push(cell), (cell = "");
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && s[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      (row = []), (cell = "");
    } else cell += c;
  }
  if (cell || row.length) row.push(cell), rows.push(row);
  const out: { name: string; expr: string }[] = [];
  for (const r of rows) {
    if (r.length < 2 || !r[0].trim() || r[0].trim() === "名前" || r[0].trim().toLowerCase() === "name") continue;
    out.push({ name: r[0].trim(), expr: r[1].trim() });
  }
  return out;
}
