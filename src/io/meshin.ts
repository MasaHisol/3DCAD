// Mesh formats in: 3MF (3D printing), GLB / glTF binary, PLY (ASCII and
// binary). Everything is converted to binary STL bytes, which the kernel
// sews into a solid like an STL import.

/** Triangles -> binary STL bytes. */
export function trisToStl(pos: ArrayLike<number>, tris: ArrayLike<number>): Uint8Array {
  const n = tris.length / 3;
  if (!n) throw new Error("三角形がありません");
  const buf = new ArrayBuffer(84 + n * 50);
  const dv = new DataView(buf);
  dv.setUint32(80, n, true);
  let o = 84;
  for (let t = 0; t < n; t++) {
    const a = tris[t * 3] * 3, b = tris[t * 3 + 1] * 3, c = tris[t * 3 + 2] * 3;
    const u = [pos[b] - pos[a], pos[b + 1] - pos[a + 1], pos[b + 2] - pos[a + 2]];
    const w = [pos[c] - pos[a], pos[c + 1] - pos[a + 1], pos[c + 2] - pos[a + 2]];
    const nn = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
    const l = Math.hypot(nn[0], nn[1], nn[2]) || 1;
    for (const x of [nn[0] / l, nn[1] / l, nn[2] / l, pos[a], pos[a + 1], pos[a + 2], pos[b], pos[b + 1], pos[b + 2], pos[c], pos[c + 1], pos[c + 2]]) {
      dv.setFloat32(o, x, true);
      o += 4;
    }
    o += 2;
  }
  return new Uint8Array(buf);
}

// ---------------------------------------------------------------- ZIP ---

/** Minimal ZIP reader (stored + deflate) using the platform DecompressionStream. */
export async function unzip(bytes: Uint8Array): Promise<Map<string, Uint8Array>> {
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let eocd = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--)
    if (dv.getUint32(i, true) === 0x06054b50) {
      eocd = i;
      break;
    }
  if (eocd < 0) throw new Error("ZIP 形式ではありません");
  const count = dv.getUint16(eocd + 10, true);
  let p = dv.getUint32(eocd + 16, true);
  const out = new Map<string, Uint8Array>();
  for (let k = 0; k < count; k++) {
    if (dv.getUint32(p, true) !== 0x02014b50) break;
    const method = dv.getUint16(p + 10, true);
    const csize = dv.getUint32(p + 20, true);
    const nlen = dv.getUint16(p + 28, true), xlen = dv.getUint16(p + 30, true), clen = dv.getUint16(p + 32, true);
    const local = dv.getUint32(p + 42, true);
    const name = new TextDecoder().decode(bytes.subarray(p + 46, p + 46 + nlen));
    p += 46 + nlen + xlen + clen;
    const lnlen = dv.getUint16(local + 26, true), lxlen = dv.getUint16(local + 28, true);
    const data = bytes.subarray(local + 30 + lnlen + lxlen, local + 30 + lnlen + lxlen + csize);
    if (method === 0) out.set(name, data);
    else if (method === 8) {
      const ds = new Blob([data as BlobPart]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
      out.set(name, new Uint8Array(await new Response(ds).arrayBuffer()));
    }
  }
  return out;
}

// ---------------------------------------------------------------- 3MF ---

/** 3MF: meshes of all objects placed by the build items (transforms applied, units -> mm). */
export async function read3mf(bytes: Uint8Array): Promise<Uint8Array> {
  const files = await unzip(bytes);
  const key = [...files.keys()].find((k) => /3dmodel\.model$/i.test(k)) ?? [...files.keys()].find((k) => k.endsWith(".model"));
  if (!key) throw new Error("3MF にモデルがありません");
  const xml = new TextDecoder().decode(files.get(key)!);
  const unit = /unit="(\w+)"/.exec(xml)?.[1] ?? "millimeter";
  const us = ({ micron: 0.001, millimeter: 1, centimeter: 10, inch: 25.4, foot: 304.8, meter: 1000 } as Record<string, number>)[unit] ?? 1;
  // objects: id -> mesh (or components)
  const objects = new Map<string, { pos: number[]; tri: number[]; comps: { id: string; m: number[] }[] }>();
  const objRe = /<object\b([^>]*)>([\s\S]*?)<\/object>/g;
  let m: RegExpExecArray | null;
  while ((m = objRe.exec(xml))) {
    const id = /\bid="([^"]+)"/.exec(m[1])?.[1] ?? "";
    const body = m[2];
    const pos: number[] = [], tri: number[] = [];
    for (const v of body.matchAll(/<vertex\b[^>]*x="([^"]+)"[^>]*y="([^"]+)"[^>]*z="([^"]+)"/g)) pos.push(+v[1], +v[2], +v[3]);
    for (const t of body.matchAll(/<triangle\b[^>]*v1="(\d+)"[^>]*v2="(\d+)"[^>]*v3="(\d+)"/g)) tri.push(+t[1], +t[2], +t[3]);
    const comps = [...body.matchAll(/<component\b[^>]*objectid="([^"]+)"([^>]*)\/?>/g)].map((c) => ({ id: c[1], m: parseXf(/transform="([^"]+)"/.exec(c[2])?.[1]) }));
    objects.set(id, { pos, tri, comps });
  }
  const P: number[] = [], T: number[] = [];
  const emit = (id: string, xf: number[], depth: number) => {
    const o = objects.get(id);
    if (!o || depth > 8) return;
    const base = P.length / 3;
    for (let i = 0; i < o.pos.length; i += 3) {
      const [x, y, z] = [o.pos[i], o.pos[i + 1], o.pos[i + 2]];
      P.push((xf[0] * x + xf[3] * y + xf[6] * z + xf[9]) * us, (xf[1] * x + xf[4] * y + xf[7] * z + xf[10]) * us, (xf[2] * x + xf[5] * y + xf[8] * z + xf[11]) * us);
    }
    for (const t of o.tri) T.push(t + base);
    for (const c of o.comps) emit(c.id, mul(xf, c.m), depth + 1);
  };
  const items = [...xml.matchAll(/<item\b[^>]*objectid="([^"]+)"([^>]*)\/?>/g)];
  if (items.length) for (const it of items) emit(it[1], parseXf(/transform="([^"]+)"/.exec(it[2])?.[1]), 0);
  else for (const id of objects.keys()) emit(id, parseXf(undefined), 0);
  return trisToStl(P, T);
}

/** 3MF affine "m00 m01 m02 m10 ... m32" (row vectors) as [r0 r1 r2 t]. */
function parseXf(s?: string): number[] {
  if (!s) return [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0];
  const v = s.trim().split(/\s+/).map(Number);
  return v.length === 12 ? v : [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0];
}
/** Compose 3MF affines: apply b first, then a. */
function mul(a: number[], b: number[]): number[] {
  const r = (i: number, j: number, m: number[]) => m[i * 3 + j];
  const out = new Array(12).fill(0);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) out[i * 3 + j] = r(i, 0, b) * r(0, j, a) + r(i, 1, b) * r(1, j, a) + r(i, 2, b) * r(2, j, a);
  for (let j = 0; j < 3; j++) out[9 + j] = b[9] * a[j] + b[10] * a[3 + j] + b[11] * a[6 + j] + a[9 + j];
  return out;
}

// ---------------------------------------------------------------- GLB ---

/** glTF 2.0 binary: all mesh primitives (triangles) with node transforms; metres -> mm. */
export function readGlb(bytes: Uint8Array): Uint8Array {
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (dv.getUint32(0, true) !== 0x46546c67) throw new Error("GLB 形式ではありません");
  let o = 12;
  let json: { [k: string]: never } | null = null;
  let bin: Uint8Array | null = null;
  while (o < bytes.length) {
    const len = dv.getUint32(o, true), type = dv.getUint32(o + 4, true);
    const chunk = bytes.subarray(o + 8, o + 8 + len);
    if (type === 0x4e4f534a) json = JSON.parse(new TextDecoder().decode(chunk));
    else if (type === 0x004e4942) bin = chunk;
    o += 8 + len;
  }
  if (!json || !bin) throw new Error("GLB のデータが不完全です");
  type G = { nodes?: { mesh?: number; children?: number[]; matrix?: number[]; translation?: number[]; rotation?: number[]; scale?: number[] }[]; meshes: { primitives: { attributes: { POSITION: number }; indices?: number; mode?: number }[] }[]; accessors: { bufferView: number; byteOffset?: number; componentType: number; count: number; type: string }[]; bufferViews: { byteOffset?: number; byteStride?: number }[]; scenes?: { nodes: number[] }[]; scene?: number };
  const g = json as unknown as G;
  const read = (ai: number): number[] => {
    const a = g.accessors[ai], bv = g.bufferViews[a.bufferView];
    const comps = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 }[a.type as "VEC3"] ?? 1;
    const size = { 5126: 4, 5125: 4, 5123: 2, 5121: 1 }[a.componentType as 5126] ?? 4;
    const stride = bv.byteStride || comps * size;
    const base = (bv.byteOffset ?? 0) + (a.byteOffset ?? 0);
    const d = new DataView(bin!.buffer, bin!.byteOffset, bin!.byteLength);
    const out: number[] = [];
    for (let i = 0; i < a.count; i++)
      for (let c = 0; c < comps; c++) {
        const p = base + i * stride + c * size;
        out.push(a.componentType === 5126 ? d.getFloat32(p, true) : a.componentType === 5125 ? d.getUint32(p, true) : a.componentType === 5123 ? d.getUint16(p, true) : d.getUint8(p));
      }
    return out;
  };
  const P: number[] = [], T: number[] = [];
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
  const visit = (ni: number, parent: number[], depth: number) => {
    const n = g.nodes![ni];
    const m = m4(parent, local(n));
    if (n.mesh !== undefined)
      for (const prim of g.meshes[n.mesh].primitives) {
        if (prim.mode !== undefined && prim.mode !== 4) continue;
        const pos = read(prim.attributes.POSITION);
        const base = P.length / 3;
        for (let i = 0; i < pos.length; i += 3) {
          const [x, y, z] = [pos[i], pos[i + 1], pos[i + 2]];
          // glTF is in metres
          P.push((m[0] * x + m[4] * y + m[8] * z + m[12]) * 1000, (m[1] * x + m[5] * y + m[9] * z + m[13]) * 1000, (m[2] * x + m[6] * y + m[10] * z + m[14]) * 1000);
        }
        const idx = prim.indices !== undefined ? read(prim.indices) : [...Array(pos.length / 3).keys()];
        for (const i of idx) T.push(i + base);
      }
    if (depth < 32) for (const c of n.children ?? []) visit(c, m, depth + 1);
  };
  const I = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  if (!g.nodes?.length) g.nodes = g.meshes.map((_, mi) => ({ mesh: mi }));
  const roots = g.scenes?.[g.scene ?? 0]?.nodes ?? g.nodes.map((_, i) => i);
  for (const r of roots) visit(r, I, 0);
  return trisToStl(P, T);
}

// ---------------------------------------------------------------- PLY ---

/** PLY (ascii / binary_little_endian / binary_big_endian), vertices + polygon faces. */
export function readPly(bytes: Uint8Array): Uint8Array {
  const headEnd = new TextDecoder("latin1").decode(bytes.subarray(0, Math.min(bytes.length, 8192))).indexOf("end_header");
  if (headEnd < 0) throw new Error("PLY ヘッダーがありません");
  const header = new TextDecoder("latin1").decode(bytes.subarray(0, headEnd));
  let dataStart = headEnd + "end_header".length;
  while (bytes[dataStart] === 13 || bytes[dataStart] === 10) dataStart++;
  const format = /format (\w+)/.exec(header)?.[1] ?? "ascii";
  type Elem = { name: string; count: number; props: { name: string; type: string; list?: [string, string] }[] };
  const elems: Elem[] = [];
  for (const l of header.split(/\r?\n/)) {
    const t = l.trim().split(/\s+/);
    if (t[0] === "element") elems.push({ name: t[1], count: +t[2], props: [] });
    else if (t[0] === "property" && elems.length) elems[elems.length - 1].props.push(t[1] === "list" ? { name: t[4], type: t[3], list: [t[2], t[3]] } : { name: t[2], type: t[1] });
  }
  const P: number[] = [], T: number[] = [];
  const size: Record<string, number> = { char: 1, uchar: 1, int8: 1, uint8: 1, short: 2, ushort: 2, int16: 2, uint16: 2, int: 4, uint: 4, int32: 4, uint32: 4, float: 4, float32: 4, double: 8, float64: 8 };
  if (format === "ascii") {
    const toks = new TextDecoder().decode(bytes.subarray(dataStart)).trim().split(/\s+/).map(Number);
    let k = 0;
    for (const e of elems)
      for (let i = 0; i < e.count; i++) {
        const vals: Record<string, number | number[]> = {};
        for (const p of e.props) {
          if (p.list) {
            const n = toks[k++];
            vals[p.name] = toks.slice(k, k + n);
            k += n;
          } else vals[p.name] = toks[k++];
        }
        if (e.name === "vertex") P.push(vals.x as number, vals.y as number, vals.z as number);
        if (e.name === "face") {
          const f = (vals.vertex_indices ?? vals.vertex_index) as number[];
          for (let j = 1; j + 1 < f.length; j++) T.push(f[0], f[j], f[j + 1]);
        }
      }
  } else {
    const le = format === "binary_little_endian";
    const dv = new DataView(bytes.buffer, bytes.byteOffset + dataStart, bytes.byteLength - dataStart);
    let o = 0;
    const rd = (t: string): number => {
      let v: number;
      switch (t) {
        case "char": case "int8": v = dv.getInt8(o); break;
        case "uchar": case "uint8": v = dv.getUint8(o); break;
        case "short": case "int16": v = dv.getInt16(o, le); break;
        case "ushort": case "uint16": v = dv.getUint16(o, le); break;
        case "int": case "int32": v = dv.getInt32(o, le); break;
        case "uint": case "uint32": v = dv.getUint32(o, le); break;
        case "double": case "float64": v = dv.getFloat64(o, le); break;
        default: v = dv.getFloat32(o, le);
      }
      o += size[t] ?? 4;
      return v;
    };
    for (const e of elems)
      for (let i = 0; i < e.count; i++) {
        const vals: Record<string, number | number[]> = {};
        for (const p of e.props) {
          if (p.list) {
            const n = rd(p.list[0]);
            const arr: number[] = [];
            for (let j = 0; j < n; j++) arr.push(rd(p.list[1]));
            vals[p.name] = arr;
          } else vals[p.name] = rd(p.type);
        }
        if (e.name === "vertex") P.push(vals.x as number, vals.y as number, vals.z as number);
        if (e.name === "face") {
          const f = (vals.vertex_indices ?? vals.vertex_index) as number[];
          for (let j = 1; j + 1 < f.length; j++) T.push(f[0], f[j], f[j + 1]);
        }
      }
  }
  return trisToStl(P, T);
}
