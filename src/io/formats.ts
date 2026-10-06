// Interchange formats beyond STEP / STL: DXF (AutoCAD 2D), OBJ, 3MF, GLB, PLY.

import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { OBJExporter } from "three/examples/jsm/exporters/OBJExporter.js";
import { PLYExporter } from "three/examples/jsm/exporters/PLYExporter.js";
import type { SkEntity, SketchFeature } from "../core/types";
import type { BodyMesh } from "../kernel/protocol";

// ------------------------------------------------------------------ DXF in ---

export interface DxfResult {
  entities: SkEntity[];
  skipped: Record<string, number>;
}

/**
 * Reads LINE / CIRCLE / ARC / LWPOLYLINE / POLYLINE (incl. bulges) from the
 * ENTITIES section of an ASCII DXF into sketch entities (shared end points).
 */
export function parseDxf(text: string): DxfResult {
  const lines = text.split(/\r?\n/);
  const pairs: [number, string][] = [];
  for (let i = 0; i + 1 < lines.length; i += 2) pairs.push([parseInt(lines[i].trim(), 10), lines[i + 1].trim()]);
  const ents: { type: string; codes: [number, string][] }[] = [];
  let inEntities = false;
  let cur: { type: string; codes: [number, string][] } | null = null;
  for (let i = 0; i < pairs.length; i++) {
    const [c, v] = pairs[i];
    if (c === 2 && (v === "ENTITIES" || v === "BLOCKS") && pairs[i - 1]?.[1] === "SECTION") inEntities = v === "ENTITIES";
    if (!inEntities) continue;
    if (c === 0) {
      if (cur) ents.push(cur);
      cur = v === "ENDSEC" ? null : { type: v, codes: [] };
      if (v === "ENDSEC") inEntities = false;
    } else cur?.codes.push([c, v]);
  }
  if (cur) ents.push(cur);

  const out: SkEntity[] = [];
  const skipped: Record<string, number> = {};
  let n = 0;
  const pts = new Map<string, string>();
  const P = (x: number, y: number): string => {
    const k = `${x.toFixed(6)},${y.toFixed(6)}`;
    let id = pts.get(k);
    if (!id) {
      id = `dp${n++}`;
      pts.set(k, id);
      out.push({ id, type: "point", x, y });
    }
    return id;
  };
  const num = (codes: [number, string][], c: number, d = 0) => {
    const f = codes.find((x) => x[0] === c);
    return f ? parseFloat(f[1]) : d;
  };
  const line = (x1: number, y1: number, x2: number, y2: number) => {
    if (Math.hypot(x2 - x1, y2 - y1) < 1e-9) return;
    out.push({ id: `dl${n++}`, type: "line", p1: P(x1, y1), p2: P(x2, y2) });
  };
  const arc = (cx: number, cy: number, r: number, a0: number, a1: number) => {
    // a0 -> a1 counter-clockwise (degrees)
    const c = P(cx, cy);
    const s: [number, number] = [cx + r * Math.cos((a0 * Math.PI) / 180), cy + r * Math.sin((a0 * Math.PI) / 180)];
    const e: [number, number] = [cx + r * Math.cos((a1 * Math.PI) / 180), cy + r * Math.sin((a1 * Math.PI) / 180)];
    out.push({ id: `da${n++}`, type: "arc", c, p1: P(...s), p2: P(...e) });
  };
  const bulgeSeg = (x1: number, y1: number, x2: number, y2: number, b: number) => {
    if (Math.abs(b) < 1e-9) return line(x1, y1, x2, y2);
    const theta = 4 * Math.atan(b);
    const d = Math.hypot(x2 - x1, y2 - y1);
    const r = d / (2 * Math.sin(Math.abs(theta) / 2));
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    const h = Math.sqrt(Math.max(0, r * r - (d / 2) ** 2)) * Math.sign(b) * (Math.abs(theta) > Math.PI ? -1 : 1);
    const ux = -(y2 - y1) / d, uy = (x2 - x1) / d;
    const cx = mx + ux * h, cy = my + uy * h;
    const a1 = (Math.atan2(y1 - cy, x1 - cx) * 180) / Math.PI, a2 = (Math.atan2(y2 - cy, x2 - cx) * 180) / Math.PI;
    if (b > 0) arc(cx, cy, r, a1, a2);
    else arc(cx, cy, r, a2, a1);
  };
  const polyline = (vs: { x: number; y: number; b: number }[], closed: boolean) => {
    for (let i = 0; i + 1 < vs.length; i++) bulgeSeg(vs[i].x, vs[i].y, vs[i + 1].x, vs[i + 1].y, vs[i].b);
    if (closed && vs.length > 2) bulgeSeg(vs[vs.length - 1].x, vs[vs.length - 1].y, vs[0].x, vs[0].y, vs[vs.length - 1].b);
  };

  for (let i = 0; i < ents.length; i++) {
    const e = ents[i];
    switch (e.type) {
      case "LINE":
        line(num(e.codes, 10), num(e.codes, 20), num(e.codes, 11), num(e.codes, 21));
        break;
      case "CIRCLE":
        out.push({ id: `dc${n++}`, type: "circle", c: P(num(e.codes, 10), num(e.codes, 20)), r: num(e.codes, 40) });
        break;
      case "ARC":
        arc(num(e.codes, 10), num(e.codes, 20), num(e.codes, 40), num(e.codes, 50), num(e.codes, 51));
        break;
      case "LWPOLYLINE": {
        const vs: { x: number; y: number; b: number }[] = [];
        for (const [c, v] of e.codes) {
          if (c === 10) vs.push({ x: parseFloat(v), y: 0, b: 0 });
          else if (c === 20 && vs.length) vs[vs.length - 1].y = parseFloat(v);
          else if (c === 42 && vs.length) vs[vs.length - 1].b = parseFloat(v);
        }
        polyline(vs, (num(e.codes, 70) & 1) === 1);
        break;
      }
      case "POLYLINE": {
        const closed = (num(e.codes, 70) & 1) === 1;
        const vs: { x: number; y: number; b: number }[] = [];
        while (ents[i + 1]?.type === "VERTEX") {
          i++;
          vs.push({ x: num(ents[i].codes, 10), y: num(ents[i].codes, 20), b: num(ents[i].codes, 42) });
        }
        if (ents[i + 1]?.type === "SEQEND") i++;
        polyline(vs, closed);
        break;
      }
      case "POINT":
        P(num(e.codes, 10), num(e.codes, 20));
        break;
      default:
        skipped[e.type] = (skipped[e.type] ?? 0) + 1;
    }
  }
  return { entities: out, skipped };
}

// ----------------------------------------------------------------- DXF out ---

class DxfWriter {
  private body: string[] = [];
  private add(...kv: (string | number)[]) {
    for (let i = 0; i < kv.length; i += 2) this.body.push(String(kv[i]), typeof kv[i + 1] === "number" ? (kv[i + 1] as number).toFixed(6) : String(kv[i + 1]));
  }
  line(x1: number, y1: number, x2: number, y2: number, layer = "0") {
    this.add(0, "LINE", 8, layer, 10, x1, 20, y1, 30, 0, 11, x2, 21, y2, 31, 0);
  }
  circle(x: number, y: number, r: number, layer = "0") {
    this.add(0, "CIRCLE", 8, layer, 10, x, 20, y, 30, 0, 40, r);
  }
  arc(x: number, y: number, r: number, a0: number, a1: number, layer = "0") {
    this.add(0, "ARC", 8, layer, 10, x, 20, y, 30, 0, 40, r, 50, a0, 51, a1);
  }
  toString(): string {
    // R12 ASCII: readable by AutoCAD, Jw_cad, DraftSight, LibreCAD, Inventor, ...
    const head = ["0", "SECTION", "2", "HEADER", "9", "$ACADVER", "1", "AC1009", "9", "$INSUNITS", "70", "4", "0", "ENDSEC"];
    const tables = ["0", "SECTION", "2", "TABLES", "0", "TABLE", "2", "LAYER", "70", "3",
      ...layer("0", 7, "CONTINUOUS"), ...layer("VISIBLE", 7, "CONTINUOUS"), ...layer("HIDDEN", 8, "CONTINUOUS"), ...layer("CONSTRUCTION", 8, "CONTINUOUS"),
      "0", "ENDTAB", "0", "ENDSEC"];
    return [...head, ...tables, "0", "SECTION", "2", "ENTITIES", ...this.body, "0", "ENDSEC", "0", "EOF", ""].join("\r\n");
  }
}
function layer(name: string, color: number, ltype: string) {
  return ["0", "LAYER", "2", name, "70", "0", "62", String(color), "6", ltype];
}

export function sketchToDxf(sk: SketchFeature): string {
  const w = new DxfWriter();
  const pts = new Map(sk.entities.filter((e) => e.type === "point").map((p) => [p.id, p as Extract<SkEntity, { type: "point" }>]));
  for (const e of sk.entities) {
    const lay = e.construction ? "CONSTRUCTION" : "0";
    if (e.type === "line") {
      const a = pts.get(e.p1)!, b = pts.get(e.p2)!;
      w.line(a.x, a.y, b.x, b.y, lay);
    } else if (e.type === "circle") {
      const c = pts.get(e.c)!;
      w.circle(c.x, c.y, e.r, lay);
    } else if (e.type === "arc") {
      const c = pts.get(e.c)!, a = pts.get(e.p1)!, b = pts.get(e.p2)!;
      const r = Math.hypot(a.x - c.x, a.y - c.y);
      w.arc(c.x, c.y, r, (Math.atan2(a.y - c.y, a.x - c.x) * 180) / Math.PI, (Math.atan2(b.y - c.y, b.x - c.x) * 180) / Math.PI, lay);
    }
  }
  return w.toString();
}

/**
 * Converts an SVG drawing (paths in mm, y down) into DXF (y up). Straight
 * segments become LINEs, curves are sampled into short LINEs.
 */
export function svgToDxf(svg: SVGSVGElement, heightMm: number): string {
  const w = new DxfWriter();
  const paths = svg.querySelectorAll("path, rect, line");
  paths.forEach((el) => {
    const hidden = !!el.closest("[stroke-dasharray]");
    const lay = hidden ? "HIDDEN" : "VISIBLE";
    const ctm = (el as SVGGraphicsElement).getCTM();
    const root = svg.getCTM();
    const m = ctm && root ? root.inverse().multiply(ctm) : null;
    const tp = (x: number, y: number): [number, number] => {
      if (!m) return [x, heightMm - y];
      return [m.a * x + m.c * y + m.e, heightMm - (m.b * x + m.d * y + m.f)];
    };
    if (el instanceof SVGRectElement) {
      const x = el.x.baseVal.value, y = el.y.baseVal.value, ww = el.width.baseVal.value, hh = el.height.baseVal.value;
      const c = [tp(x, y), tp(x + ww, y), tp(x + ww, y + hh), tp(x, y + hh)];
      for (let i = 0; i < 4; i++) w.line(...c[i], ...c[(i + 1) % 4], lay);
      return;
    }
    if (!(el instanceof SVGPathElement)) return;
    const d = el.getAttribute("d") ?? "";
    if (/^[MLZ0-9.\s,eE+-]+$/i.test(d)) {
      // polyline path
      const toks = d.match(/[MLZ]|-?[0-9.]+(?:e[-+]?\d+)?/gi) ?? [];
      let cmd = "M", start: [number, number] | null = null, last: [number, number] | null = null;
      for (let i = 0; i < toks.length; ) {
        const t = toks[i];
        if (/[MLZ]/i.test(t)) {
          cmd = t.toUpperCase();
          i++;
          if (cmd === "Z" && last && start) {
            w.line(...tp(...last), ...tp(...start), lay);
            last = start;
          }
          continue;
        }
        const p: [number, number] = [parseFloat(toks[i]), parseFloat(toks[i + 1])];
        i += 2;
        if (cmd === "M") {
          start = last = p;
          cmd = "L";
        } else if (last) {
          w.line(...tp(...last), ...tp(...p), lay);
          last = p;
        }
      }
      return;
    }
    // curves: sample
    const len = el.getTotalLength();
    const steps = Math.max(8, Math.ceil(len / 0.5));
    let prev = el.getPointAtLength(0);
    for (let i = 1; i <= steps; i++) {
      const q = el.getPointAtLength((len * i) / steps);
      w.line(...tp(prev.x, prev.y), ...tp(q.x, q.y), lay);
      prev = q;
    }
  });
  return w.toString();
}

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

export type MeshFormat = "obj" | "3mf" | "glb" | "ply";

export async function exportMeshes(format: MeshFormat, bodies: { mesh: BodyMesh; matrix?: THREE.Matrix4; color?: string; name: string }[]): Promise<Blob> {
  const g = meshGroup(bodies);
  switch (format) {
    case "obj":
      return new Blob([new OBJExporter().parse(g)], { type: "text/plain" });
    case "ply":
      return new Blob([new PLYExporter().parse(g, () => {}, { binary: true }) as ArrayBuffer], { type: "application/octet-stream" });
    case "glb": {
      const res = await new GLTFExporter().parseAsync(g, { binary: true });
      return new Blob([res as ArrayBuffer], { type: "model/gltf-binary" });
    }
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
