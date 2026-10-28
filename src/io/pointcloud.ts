// Point clouds: PLY (vertices without faces). E57 is in ./e57 (loaded on
// demand). Positions are in mm.

export interface PointCloud {
  name: string;
  /** xyz triples in mm. */
  positions: Float32Array;
  /** rgb triples 0..1 (optional). */
  colors?: Float32Array;
}

// ---------------------------------------------------------------- PLY ---

interface PlyHeader {
  format: string;
  dataStart: number;
  elems: { name: string; count: number; props: { name: string; type: string; list?: [string, string] }[] }[];
}

export function plyHeader(bytes: Uint8Array): PlyHeader {
  const head = new TextDecoder("latin1").decode(bytes.subarray(0, Math.min(bytes.length, 16384)));
  const end = head.indexOf("end_header");
  if (!head.startsWith("ply") || end < 0) throw new Error("PLY ヘッダーがありません");
  let dataStart = end + "end_header".length;
  if (bytes[dataStart] === 13) dataStart++;
  if (bytes[dataStart] === 10) dataStart++;
  const format = /format (\w+)/.exec(head)?.[1] ?? "ascii";
  const elems: PlyHeader["elems"] = [];
  for (const l of head.slice(0, end).split(/\r?\n/)) {
    const t = l.trim().split(/\s+/);
    if (t[0] === "element") elems.push({ name: t[1], count: +t[2], props: [] });
    else if (t[0] === "property" && elems.length) elems[elems.length - 1].props.push(t[1] === "list" ? { name: t[4], type: t[3], list: [t[2], t[3]] } : { name: t[2], type: t[1] });
  }
  return { format, dataStart, elems };
}

/** True when the PLY has vertices but no faces (a scan / point cloud). */
export function plyIsPointCloud(bytes: Uint8Array): boolean {
  const h = plyHeader(bytes);
  const faces = h.elems.find((e) => e.name === "face");
  return !faces || faces.count === 0;
}

const SIZE: Record<string, number> = { char: 1, uchar: 1, int8: 1, uint8: 1, short: 2, ushort: 2, int16: 2, uint16: 2, int: 4, uint: 4, int32: 4, uint32: 4, float: 4, float32: 4, double: 8, float64: 8 };

export function readPlyPoints(bytes: Uint8Array, name = "点群"): PointCloud {
  const h = plyHeader(bytes);
  const vi = h.elems.findIndex((e) => e.name === "vertex");
  if (vi < 0) throw new Error("PLY に頂点がありません");
  const v = h.elems[vi];
  const n = v.count;
  const pos = new Float32Array(n * 3);
  const names = v.props.map((p) => p.name);
  const ci = ["red", "green", "blue"].map((c) => names.indexOf(c));
  const di = ["diffuse_red", "diffuse_green", "diffuse_blue"].map((c) => names.indexOf(c));
  const cidx = ci.every((i) => i >= 0) ? ci : di.every((i) => i >= 0) ? di : null;
  const cmax = cidx ? (/float|double/.test(v.props[cidx[0]].type) ? 1 : v.props[cidx[0]].type.includes("16") || v.props[cidx[0]].type.includes("short") ? 65535 : 255) : 1;
  const colors = cidx ? new Float32Array(n * 3) : undefined;
  const xi = names.indexOf("x"), yi = names.indexOf("y"), zi = names.indexOf("z");
  const vals = new Float64Array(v.props.length);
  const take = (k: number) => {
    pos[k * 3] = vals[xi];
    pos[k * 3 + 1] = vals[yi];
    pos[k * 3 + 2] = vals[zi];
    if (colors && cidx) for (let c = 0; c < 3; c++) colors[k * 3 + c] = vals[cidx[c]] / cmax;
  };
  if (h.format === "ascii") {
    const text = new TextDecoder().decode(bytes.subarray(h.dataStart));
    let p = 0;
    const next = () => {
      while (p < text.length && text.charCodeAt(p) <= 32) p++;
      const s = p;
      while (p < text.length && text.charCodeAt(p) > 32) p++;
      return +text.slice(s, p);
    };
    for (let e = 0; e < h.elems.length; e++) {
      const el = h.elems[e];
      for (let i = 0; i < el.count; i++) {
        el.props.forEach((pr, k) => {
          if (pr.list) {
            const m = next();
            for (let j = 0; j < m; j++) next();
          } else vals[k] = next();
        });
        if (e === vi) take(i);
      }
      if (e === vi) break;
    }
  } else {
    const le = h.format === "binary_little_endian";
    const dv = new DataView(bytes.buffer, bytes.byteOffset + h.dataStart, bytes.byteLength - h.dataStart);
    let o = 0;
    const rd = (t: string): number => {
      let x: number;
      switch (t) {
        case "char": case "int8": x = dv.getInt8(o); break;
        case "uchar": case "uint8": x = dv.getUint8(o); break;
        case "short": case "int16": x = dv.getInt16(o, le); break;
        case "ushort": case "uint16": x = dv.getUint16(o, le); break;
        case "int": case "int32": x = dv.getInt32(o, le); break;
        case "uint": case "uint32": x = dv.getUint32(o, le); break;
        case "double": case "float64": x = dv.getFloat64(o, le); break;
        default: x = dv.getFloat32(o, le);
      }
      o += SIZE[t] ?? 4;
      return x;
    };
    for (let e = 0; e < h.elems.length; e++) {
      const el = h.elems[e];
      for (let i = 0; i < el.count; i++) {
        el.props.forEach((pr, k) => {
          if (pr.list) {
            const m = rd(pr.list[0]);
            for (let j = 0; j < m; j++) rd(pr.list[1]);
          } else vals[k] = rd(pr.type);
        });
        if (e === vi) take(i);
      }
      if (e === vi) break;
    }
  }
  return { name, positions: pos, colors };
}

/** Binary little-endian PLY of points (with colours when present). */
export function writePlyPoints(c: PointCloud): Uint8Array {
  const n = c.positions.length / 3;
  const head = `ply\nformat binary_little_endian 1.0\ncomment 3DCAD Studio point cloud (mm)\nelement vertex ${n}\nproperty float x\nproperty float y\nproperty float z\n${c.colors ? "property uchar red\nproperty uchar green\nproperty uchar blue\n" : ""}end_header\n`;
  const hb = new TextEncoder().encode(head);
  const rec = 12 + (c.colors ? 3 : 0);
  const out = new Uint8Array(hb.length + n * rec);
  out.set(hb);
  const dv = new DataView(out.buffer, hb.length);
  for (let i = 0; i < n; i++) {
    for (let k = 0; k < 3; k++) dv.setFloat32(i * rec + k * 4, c.positions[i * 3 + k], true);
    if (c.colors) for (let k = 0; k < 3; k++) dv.setUint8(i * rec + 12 + k, Math.round(Math.min(1, Math.max(0, c.colors[i * 3 + k])) * 255));
  }
  return out;
}
