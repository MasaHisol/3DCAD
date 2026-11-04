// glTF 2.0 read / write (.gltf with embedded buffers, .glb). No three.js
// dependency so the same code runs in tests. glTF is in metres; the model is in mm.

export interface GltfMesh {
  name: string;
  /** World positions in mm. */
  positions: Float32Array;
  indices: Uint32Array;
  normals?: Float32Array;
  /** sRGB hex colour of the material. */
  color?: string;
}

export interface GltfInput {
  name: string;
  /** Local positions in mm. */
  positions: Float32Array;
  normals?: Float32Array;
  indices: Uint32Array;
  color?: string;
  /** Column-major 4x4 placement (mm). */
  matrix?: number[];
}

const srgbToLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const linearToSrgb = (c: number) => (c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055);
const hex = (rgb: number[]) => `#${rgb.map((v) => Math.round(Math.min(1, Math.max(0, linearToSrgb(v))) * 255).toString(16).padStart(2, "0")).join("")}`;

function pad4(n: number) {
  return (n + 3) & ~3;
}

/** glTF document + binary buffer for the meshes. */
function build(meshes: GltfInput[]): { json: Record<string, unknown>; bin: Uint8Array } {
  const chunks: Uint8Array[] = [];
  let offset = 0;
  const bufferViews: Record<string, unknown>[] = [];
  const accessors: Record<string, unknown>[] = [];
  const push = (data: ArrayBufferView, target: number) => {
    const bytes = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
    const padded = new Uint8Array(pad4(bytes.length));
    padded.set(bytes);
    bufferViews.push({ buffer: 0, byteOffset: offset, byteLength: bytes.length, target });
    chunks.push(padded);
    offset += padded.length;
    return bufferViews.length - 1;
  };
  const materials: Record<string, unknown>[] = [];
  const matIndex = new Map<string, number>();
  const gmeshes: Record<string, unknown>[] = [];
  const nodes: Record<string, unknown>[] = [];
  for (const m of meshes) {
    // mm -> m
    const pos = new Float32Array(m.positions.length);
    for (let i = 0; i < pos.length; i++) pos[i] = m.positions[i] * 0.001;
    const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
    for (let i = 0; i < pos.length; i += 3) for (let k = 0; k < 3; k++) (lo[k] = Math.min(lo[k], pos[i + k])), (hi[k] = Math.max(hi[k], pos[i + k]));
    const attributes: Record<string, number> = {};
    accessors.push({ bufferView: push(pos, 34962), componentType: 5126, count: pos.length / 3, type: "VEC3", min: lo, max: hi });
    attributes.POSITION = accessors.length - 1;
    if (m.normals && m.normals.length === m.positions.length) {
      accessors.push({ bufferView: push(m.normals, 34962), componentType: 5126, count: m.normals.length / 3, type: "VEC3" });
      attributes.NORMAL = accessors.length - 1;
    }
    accessors.push({ bufferView: push(m.indices, 34963), componentType: 5125, count: m.indices.length, type: "SCALAR" });
    const indices = accessors.length - 1;
    const color = m.color ?? "#c9ced6";
    if (!matIndex.has(color)) {
      const h = color.replace("#", "");
      const rgb = [0, 2, 4].map((i) => srgbToLinear(parseInt(h.slice(i, i + 2), 16) / 255));
      materials.push({ name: color, pbrMetallicRoughness: { baseColorFactor: [...rgb, 1], metallicFactor: 0.1, roughnessFactor: 0.5 } });
      matIndex.set(color, materials.length - 1);
    }
    gmeshes.push({ name: m.name, primitives: [{ attributes, indices, material: matIndex.get(color), mode: 4 }] });
    const node: Record<string, unknown> = { name: m.name, mesh: gmeshes.length - 1 };
    if (m.matrix && m.matrix.some((v, i) => v !== [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1][i])) node.matrix = m.matrix.map((v, i) => (i >= 12 && i < 15 ? v * 0.001 : v));
    nodes.push(node);
  }
  const bin = new Uint8Array(offset);
  let o = 0;
  for (const c of chunks) {
    bin.set(c, o);
    o += c.length;
  }
  const json = {
    asset: { version: "2.0", generator: "3DCAD Studio" },
    scene: 0,
    scenes: [{ nodes: nodes.map((_, i) => i) }],
    nodes,
    meshes: gmeshes,
    materials,
    accessors,
    bufferViews,
    buffers: [{ byteLength: bin.length }] as Record<string, unknown>[],
  };
  return { json, bin };
}

/** Binary glTF (.glb). */
export function writeGlb(meshes: GltfInput[]): Uint8Array {
  const { json, bin } = build(meshes);
  const jb = new TextEncoder().encode(JSON.stringify(json));
  const jlen = pad4(jb.length), blen = pad4(bin.length);
  const out = new Uint8Array(12 + 8 + jlen + 8 + blen);
  const dv = new DataView(out.buffer);
  dv.setUint32(0, 0x46546c67, true);
  dv.setUint32(4, 2, true);
  dv.setUint32(8, out.length, true);
  dv.setUint32(12, jlen, true);
  dv.setUint32(16, 0x4e4f534a, true);
  out.set(jb, 20);
  for (let i = jb.length; i < jlen; i++) out[20 + i] = 0x20;
  dv.setUint32(20 + jlen, blen, true);
  dv.setUint32(24 + jlen, 0x004e4942, true);
  out.set(bin, 28 + jlen);
  return out;
}

/** Text glTF (.gltf) with the buffer embedded as a data URI. */
export function writeGltf(meshes: GltfInput[]): string {
  const { json, bin } = build(meshes);
  let s = "";
  for (let i = 0; i < bin.length; i += 0x8000) s += String.fromCharCode(...bin.subarray(i, i + 0x8000));
  (json.buffers as Record<string, unknown>[])[0].uri = `data:application/octet-stream;base64,${btoa(s)}`;
  return JSON.stringify(json, null, 1);
}

type G = {
  nodes?: { name?: string; mesh?: number; children?: number[]; matrix?: number[]; translation?: number[]; rotation?: number[]; scale?: number[] }[];
  meshes?: { name?: string; primitives: { attributes: Record<string, number>; indices?: number; mode?: number; material?: number }[] }[];
  materials?: { pbrMetallicRoughness?: { baseColorFactor?: number[] } }[];
  accessors?: { bufferView?: number; byteOffset?: number; componentType: number; count: number; type: string; normalized?: boolean }[];
  bufferViews?: { buffer?: number; byteOffset?: number; byteStride?: number; byteLength: number }[];
  buffers?: { uri?: string; byteLength: number }[];
  scenes?: { nodes: number[] }[];
  scene?: number;
};

function decodeDataUri(uri: string): Uint8Array {
  const m = /^data:[^,]*;base64,(.*)$/s.exec(uri);
  if (!m) throw new Error("glTF の外部バッファ (.bin) は読み込めません。GLB または埋め込み形式で書き出してください");
  const s = atob(m[1]);
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}

/** .gltf text or .glb bytes -> meshes in world coordinates (mm). */
export function readGltf(data: Uint8Array | string, external?: Map<string, Uint8Array>): GltfMesh[] {
  let g: G;
  const bufs: Uint8Array[] = [];
  if (typeof data !== "string" && new DataView(data.buffer, data.byteOffset, data.byteLength).getUint32(0, true) === 0x46546c67) {
    const dv = new DataView(data.buffer, data.byteOffset, data.byteLength);
    let o = 12;
    let json: G | null = null;
    let bin: Uint8Array | null = null;
    while (o + 8 <= data.length) {
      const len = dv.getUint32(o, true), type = dv.getUint32(o + 4, true);
      const chunk = data.subarray(o + 8, o + 8 + len);
      if (type === 0x4e4f534a) json = JSON.parse(new TextDecoder().decode(chunk));
      else if (type === 0x004e4942) bin = chunk;
      o += 8 + pad4(len);
    }
    if (!json) throw new Error("GLB のデータが不完全です");
    g = json;
    (g.buffers ?? []).forEach((b, i) => bufs.push(b.uri ? (external?.get(b.uri) ?? decodeDataUri(b.uri)) : i === 0 && bin ? bin : new Uint8Array(0)));
  } else {
    g = JSON.parse(typeof data === "string" ? data : new TextDecoder().decode(data)) as G;
    for (const b of g.buffers ?? []) bufs.push(b.uri ? (external?.get(b.uri) ?? decodeDataUri(b.uri)) : new Uint8Array(0));
  }
  const read = (ai: number): number[] => {
    const a = g.accessors![ai];
    const comps = ({ SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 } as Record<string, number>)[a.type] ?? 1;
    const size = ({ 5126: 4, 5125: 4, 5123: 2, 5122: 2, 5121: 1, 5120: 1 } as Record<number, number>)[a.componentType] ?? 4;
    if (a.bufferView === undefined) return new Array(a.count * comps).fill(0);
    const bv = g.bufferViews![a.bufferView];
    const buf = bufs[bv.buffer ?? 0];
    const stride = bv.byteStride || comps * size;
    const base = (bv.byteOffset ?? 0) + (a.byteOffset ?? 0);
    const d = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    const out: number[] = [];
    for (let i = 0; i < a.count; i++)
      for (let c = 0; c < comps; c++) {
        const p = base + i * stride + c * size;
        switch (a.componentType) {
          case 5126: out.push(d.getFloat32(p, true)); break;
          case 5125: out.push(d.getUint32(p, true)); break;
          case 5123: out.push(d.getUint16(p, true)); break;
          case 5122: out.push(d.getInt16(p, true)); break;
          case 5121: out.push(d.getUint8(p)); break;
          default: out.push(d.getInt8(p));
        }
      }
    return out;
  };
  const local = (n: NonNullable<G["nodes"]>[number]): number[] => {
    if (n.matrix) return n.matrix;
    const [tx, ty, tz] = n.translation ?? [0, 0, 0];
    const [x, y, z, w] = n.rotation ?? [0, 0, 0, 1];
    const [sx, sy, sz] = n.scale ?? [1, 1, 1];
    return [
      (1 - 2 * (y * y + z * z)) * sx, 2 * (x * y + z * w) * sx, 2 * (x * z - y * w) * sx, 0,
      2 * (x * y - z * w) * sy, (1 - 2 * (x * x + z * z)) * sy, 2 * (y * z + x * w) * sy, 0,
      2 * (x * z + y * w) * sz, 2 * (y * z - x * w) * sz, (1 - 2 * (x * x + y * y)) * sz, 0,
      tx, ty, tz, 1,
    ];
  };
  const m4 = (a: number[], b: number[]) => {
    const r = new Array(16).fill(0);
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) for (let k = 0; k < 4; k++) r[j * 4 + i] += a[k * 4 + i] * b[j * 4 + k];
    return r;
  };
  const out: GltfMesh[] = [];
  const visit = (ni: number, parent: number[], depth: number) => {
    const n = g.nodes![ni];
    const m = m4(parent, local(n));
    if (n.mesh !== undefined && g.meshes?.[n.mesh]) {
      const mesh = g.meshes[n.mesh];
      mesh.primitives.forEach((prim, pi) => {
        if (prim.mode !== undefined && prim.mode !== 4) return;
        if (prim.attributes.POSITION === undefined) return;
        const pos = read(prim.attributes.POSITION);
        const P = new Float32Array(pos.length);
        for (let i = 0; i < pos.length; i += 3) {
          const [x, y, z] = [pos[i], pos[i + 1], pos[i + 2]];
          P[i] = (m[0] * x + m[4] * y + m[8] * z + m[12]) * 1000;
          P[i + 1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) * 1000;
          P[i + 2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) * 1000;
        }
        const idx = prim.indices !== undefined ? read(prim.indices) : [...Array(pos.length / 3).keys()];
        const f = prim.material !== undefined ? g.materials?.[prim.material]?.pbrMetallicRoughness?.baseColorFactor : undefined;
        const name = n.name || mesh.name || `mesh${out.length + 1}`;
        out.push({ name: mesh.primitives.length > 1 ? `${name}_${pi + 1}` : name, positions: P, indices: Uint32Array.from(idx), color: f ? hex(f.slice(0, 3)) : undefined });
      });
    }
    if (depth < 32) for (const c of n.children ?? []) visit(c, m, depth + 1);
  };
  const I = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  if (!g.nodes?.length) g.nodes = (g.meshes ?? []).map((_, mi) => ({ mesh: mi }));
  const roots = g.scenes?.[g.scene ?? 0]?.nodes ?? g.nodes.map((_, i) => i);
  for (const r of roots) visit(r, I, 0);
  if (!out.length) throw new Error("glTF に三角形メッシュがありません");
  return out;
}
