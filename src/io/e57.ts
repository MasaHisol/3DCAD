// ASTM E57 point clouds: XML + paged binary (1024-byte pages with CRC-32C),
// CompressedVector of Float / ScaledInteger / Integer fields, bit-packed,
// uncompressed codec. Positions are returned in mm. Loaded on demand.

import type { PointCloud } from "./pointcloud";


const PAGE = 1024;
const PAGE_DATA = 1020;

/** Physical file -> logical byte stream (the CRC at the end of every page is dropped). */
function logical(bytes: Uint8Array, physStart: number, logicalLength: number): Uint8Array {
  const out = new Uint8Array(logicalLength);
  let phys = physStart, o = 0;
  while (o < logicalLength) {
    const inPage = phys % PAGE;
    if (inPage >= PAGE_DATA) {
      phys += PAGE - inPage;
      continue;
    }
    const n = Math.min(PAGE_DATA - inPage, logicalLength - o, bytes.length - phys);
    if (n <= 0) throw new Error("E57 ファイルが途中で切れています");
    out.set(bytes.subarray(phys, phys + n), o);
    o += n;
    phys += n;
  }
  return out;
}

interface E57Field {
  name: string;
  type: "Float" | "ScaledInteger" | "Integer";
  double: boolean;
  min: number;
  max: number;
  scale: number;
  offset: number;
  bits: number;
}

const attr = (s: string, a: string) => new RegExp(`\\b${a}="([^"]*)"`).exec(s)?.[1];
const num = (s: string | undefined, d = 0) => (s === undefined || s === "" ? d : +s);

/** Reads every scan of an E57 file (pose applied, metres -> mm). */
export function readE57(bytes: Uint8Array, name = "E57"): PointCloud {
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (new TextDecoder("latin1").decode(bytes.subarray(0, 8)) !== "ASTM-E57") throw new Error("E57 形式ではありません");
  const u64 = (o: number) => Number(dv.getBigUint64(o, true));
  const xmlPhys = u64(24), xmlLen = u64(32);
  const pageSize = u64(40);
  if (pageSize !== PAGE) throw new Error(`E57 のページサイズ ${pageSize} は未対応です`);
  const xml = new TextDecoder().decode(logical(bytes, xmlPhys, xmlLen));
  const d3 = /<data3D\b[^>]*>([\s\S]*?)<\/data3D>/.exec(xml)?.[1] ?? "";
  // split the data3D vector into its vectorChild scans (they do not nest)
  const scans = d3.split(/<vectorChild\b[^>]*>/).slice(1);
  const P: number[] = [], C: number[] = [];
  let anyColor = false;
  for (const scan of scans) {
    const pts = /<points\b([^>]*)>([\s\S]*?)<\/points>/.exec(scan);
    if (!pts) continue;
    const fileOffset = num(attr(pts[1], "fileOffset"));
    const count = num(attr(pts[1], "recordCount"));
    const proto = /<prototype\b[^>]*>([\s\S]*?)<\/prototype>/.exec(pts[2])?.[1] ?? "";
    if (/<codecs\b[^>]*>\s*<vectorChild/.test(pts[2])) throw new Error("E57 の圧縮コーデックは未対応です (bitPackCodec のみ)");
    const fields: E57Field[] = [];
    for (const m of proto.matchAll(/<(\w+)\b([^>]*?)(\/>|>([^<]*)<\/\1>)/g)) {
      const type = attr(m[2], "type") as E57Field["type"];
      if (type !== "Float" && type !== "ScaledInteger" && type !== "Integer") throw new Error(`E57 のフィールド型 ${type} は未対応です`);
      const min = num(attr(m[2], "minimum"), type === "Float" ? 0 : -(2 ** 63));
      const max = num(attr(m[2], "maximum"), type === "Float" ? 0 : 2 ** 63 - 1);
      fields.push({
        name: m[1],
        type,
        double: type === "Float" && attr(m[2], "precision") !== "single",
        min,
        max,
        scale: num(attr(m[2], "scale"), 1),
        offset: num(attr(m[2], "offset"), 0),
        bits: type === "Float" ? 0 : Math.ceil(Math.log2(max - min + 1)),
      });
    }
    const values = readCompressedVector(bytes, fileOffset, count, fields);
    const get = (n: string) => values[fields.findIndex((f) => f.name === n)];
    // pose
    const pose = /<pose\b[^>]*>([\s\S]*?)<\/pose>/.exec(scan)?.[1] ?? "";
    const v = (tag: string, k: string, d: number) => {
      const block = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`).exec(pose)?.[1] ?? "";
      const m = new RegExp(`<${k}\\b[^>]*>([^<]*)</${k}>`).exec(block);
      return m ? +m[1] : d;
    };
    const [qw, qx, qy, qz] = [v("rotation", "w", 1), v("rotation", "x", 0), v("rotation", "y", 0), v("rotation", "z", 0)];
    const t = [v("translation", "x", 0), v("translation", "y", 0), v("translation", "z", 0)];
    const R = [
      1 - 2 * (qy * qy + qz * qz), 2 * (qx * qy - qz * qw), 2 * (qx * qz + qy * qw),
      2 * (qx * qy + qz * qw), 1 - 2 * (qx * qx + qz * qz), 2 * (qy * qz - qx * qw),
      2 * (qx * qz - qy * qw), 2 * (qy * qz + qx * qw), 1 - 2 * (qx * qx + qy * qy),
    ];
    let X = get("cartesianX"), Y = get("cartesianY"), Z = get("cartesianZ");
    if (!X) {
      const r = get("sphericalRange"), az = get("sphericalAzimuth"), el = get("sphericalElevation");
      if (!r || !az || !el) throw new Error("E57 に座標 (cartesianX/Y/Z または spherical) がありません");
      X = new Float64Array(count);
      Y = new Float64Array(count);
      Z = new Float64Array(count);
      for (let i = 0; i < count; i++) {
        X[i] = r[i] * Math.cos(el[i]) * Math.cos(az[i]);
        Y[i] = r[i] * Math.cos(el[i]) * Math.sin(az[i]);
        Z[i] = r[i] * Math.sin(el[i]);
      }
    }
    const invalid = get("cartesianInvalidState") ?? get("sphericalInvalidState");
    const red = get("colorRed"), green = get("colorGreen"), blue = get("colorBlue"), inten = get("intensity");
    const fr = fields.find((f) => f.name === "colorRed"), fi = fields.find((f) => f.name === "intensity");
    const cn = (x: number, f?: E57Field) => (f && f.max > f.min ? (x - f.min) / (f.max - f.min) : x);
    if (red && green && blue) anyColor = true;
    for (let i = 0; i < count; i++) {
      if (invalid && invalid[i] === 2) continue;
      const x = X[i], y = Y[i], z = Z[i];
      P.push((R[0] * x + R[1] * y + R[2] * z + t[0]) * 1000, (R[3] * x + R[4] * y + R[5] * z + t[1]) * 1000, (R[6] * x + R[7] * y + R[8] * z + t[2]) * 1000);
      if (red && green && blue) C.push(cn(red[i], fr), cn(green[i], fr), cn(blue[i], fr));
      else if (inten) {
        const g = cn(inten[i], fi);
        C.push(g, g, g);
      } else C.push(0.75, 0.75, 0.78);
    }
  }
  if (!P.length) throw new Error("E57 に点がありません");
  return { name, positions: Float32Array.from(P), colors: anyColor || C.some((c) => c !== 0.75 && c !== 0.78) ? Float32Array.from(C) : undefined };
}

/** Decodes the bytestreams of a CompressedVector binary section. */
function readCompressedVector(bytes: Uint8Array, sectionPhys: number, count: number, fields: E57Field[]): Float64Array[] {
  const head = logical(bytes, sectionPhys, 32);
  const hv = new DataView(head.buffer);
  if (head[0] !== 1) throw new Error("E57 の点データ セクションが見つかりません");
  const sectionLen = Number(hv.getBigUint64(8, true));
  const dataPhys = Number(hv.getBigUint64(16, true));
  // the whole section as one logical stream starting at the first data packet
  const dataLen = sectionLen - (logicalDistance(sectionPhys, dataPhys));
  const data = logical(bytes, dataPhys, Math.max(0, dataLen));
  const dv = new DataView(data.buffer);
  const streams: Uint8Array[][] = fields.map(() => []);
  let o = 0;
  while (o + 4 <= data.length) {
    const type = data[o];
    const len = dv.getUint16(o + 2, true) + 1;
    if (type === 1) {
      const n = dv.getUint16(o + 4, true);
      let p = o + 6 + n * 2;
      for (let s = 0; s < n; s++) {
        const bl = dv.getUint16(o + 6 + s * 2, true);
        if (s < streams.length) streams[s].push(data.subarray(p, p + bl));
        p += bl;
      }
    } else if (type !== 0 && type !== 2) break;
    o += len;
  }
  return fields.map((f, k) => {
    const total = streams[k].reduce((s, b) => s + b.length, 0);
    const buf = new Uint8Array(total);
    let q = 0;
    for (const b of streams[k]) (buf.set(b, q), (q += b.length));
    const out = new Float64Array(count);
    const bd = new DataView(buf.buffer);
    if (f.type === "Float") {
      const w = f.double ? 8 : 4;
      for (let i = 0; i < count && (i + 1) * w <= buf.length; i++) out[i] = f.double ? bd.getFloat64(i * w, true) : bd.getFloat32(i * w, true);
      return out;
    }
    const bits = f.bits;
    if (bits === 0) {
      out.fill(f.type === "ScaledInteger" ? f.min * f.scale + f.offset : f.min);
      return out;
    }
    let bitPos = 0;
    for (let i = 0; i < count; i++) {
      let v = 0, got = 0;
      while (got < bits) {
        const byte = buf[(bitPos >> 3)] ?? 0;
        const off = bitPos & 7;
        const take = Math.min(8 - off, bits - got);
        v += ((byte >> off) & ((1 << take) - 1)) * 2 ** got;
        got += take;
        bitPos += take;
      }
      const raw = v + f.min;
      out[i] = f.type === "ScaledInteger" ? raw * f.scale + f.offset : raw;
    }
    return out;
  });
}

function logicalDistance(physA: number, physB: number): number {
  const lg = (p: number) => Math.floor(p / PAGE) * PAGE_DATA + Math.min(p % PAGE, PAGE_DATA);
  return lg(physB) - lg(physA);
}

// CRC-32C (Castagnoli) of each page, stored big-endian in its last 4 bytes
const CRC32C = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0x82f63b78 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32c(d: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < d.length; i++) c = CRC32C[(c ^ d[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/**
 * Small E57 writer: one scan, uncompressed bitPackCodec. Coordinates as
 * single-precision floats (default) or scaled integers (`scale` in metres),
 * 8-bit colours or an intensity channel, optional pose. Used for samples and
 * tests (the app itself only reads E57).
 */
export function writeE57(
  c: PointCloud,
  opts: { scale?: number; intensity?: Float32Array; pose?: { rotation?: [number, number, number, number]; translation?: [number, number, number] } } = {},
): Uint8Array {
  const n = c.positions.length / 3;
  const fields: { xml: string; stream: Uint8Array }[] = [];
  const floatStream = (get: (i: number) => number) => {
    const b = new Uint8Array(n * 4);
    const dv = new DataView(b.buffer);
    for (let i = 0; i < n; i++) dv.setFloat32(i * 4, get(i), true);
    return b;
  };
  /** Integers (min..max) packed least significant bit first. */
  const packStream = (raw: number[], min: number, max: number) => {
    const bits = Math.ceil(Math.log2(max - min + 1));
    const b = new Uint8Array(Math.ceil((bits * raw.length) / 8));
    let pos = 0;
    for (const r of raw) {
      let v = r - min;
      for (let k = 0; k < bits; k++, pos++) {
        if (v % 2) b[pos >> 3] |= 1 << (pos & 7);
        v = Math.floor(v / 2);
      }
    }
    return b;
  };
  for (const [k, axis] of ["X", "Y", "Z"].entries()) {
    const m = (i: number) => c.positions[i * 3 + k] / 1000;
    if (opts.scale) {
      const raw: number[] = [];
      for (let i = 0; i < n; i++) raw.push(Math.round(m(i) / opts.scale));
      const lo = Math.min(...raw), hi = Math.max(...raw, lo + 1);
      fields.push({ xml: `<cartesian${axis} type="ScaledInteger" minimum="${lo}" maximum="${hi}" scale="${opts.scale}" offset="0"/>`, stream: packStream(raw, lo, hi) });
    } else {
      let lo = Infinity, hi = -Infinity;
      for (let i = 0; i < n; i++) (lo = Math.min(lo, m(i))), (hi = Math.max(hi, m(i)));
      fields.push({ xml: `<cartesian${axis} type="Float" precision="single" minimum="${lo}" maximum="${hi}"/>`, stream: floatStream(m) });
    }
  }
  if (c.colors)
    for (const [k, col] of ["Red", "Green", "Blue"].entries()) {
      const raw: number[] = [];
      for (let i = 0; i < n; i++) raw.push(Math.round(Math.min(1, Math.max(0, c.colors[i * 3 + k])) * 255));
      fields.push({ xml: `<color${col} type="Integer" minimum="0" maximum="255"/>`, stream: packStream(raw, 0, 255) });
    }
  if (opts.intensity) {
    const raw = [...opts.intensity].map((v) => Math.round(Math.min(1, Math.max(0, v)) * 4095));
    fields.push({ xml: `<intensity type="Integer" minimum="0" maximum="4095"/>`, stream: packStream(raw, 0, 4095) });
  }
  // data packets: every bytestream is cut into the same number of slices (packets stay below 64 KiB)
  const total = fields.reduce((s, f) => s + f.stream.length, 0);
  const count = Math.max(1, Math.ceil(total / 48000));
  const packets: Uint8Array[] = [];
  for (let k = 0; k < count; k++) {
    const slices = fields.map((f) => f.stream.subarray(Math.floor((f.stream.length * k) / count), Math.floor((f.stream.length * (k + 1)) / count)));
    const body = 6 + fields.length * 2 + slices.reduce((s, x) => s + x.length, 0);
    const len = (body + 3) & ~3;
    const p = new Uint8Array(len);
    const dv = new DataView(p.buffer);
    p[0] = 1;
    dv.setUint16(2, len - 1, true);
    dv.setUint16(4, fields.length, true);
    let o = 6 + fields.length * 2;
    slices.forEach((x, s) => {
      dv.setUint16(6 + s * 2, x.length, true);
      p.set(x, o);
      o += x.length;
    });
    packets.push(p);
  }
  // logical layout: header (48) | section header (32) | packets | xml
  const sectionLogical = 48;
  const dataLogical = sectionLogical + 32;
  const packetsLen = packets.reduce((s, p) => s + p.length, 0);
  const xmlLogical = dataLogical + packetsLen;
  const phys = (lg: number) => Math.floor(lg / PAGE_DATA) * PAGE + (lg % PAGE_DATA);
  const guid = () => `{${"xxxxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx".replace(/x/g, () => Math.floor(Math.random() * 16).toString(16))}}`;
  const [qw, qx, qy, qz] = opts.pose?.rotation ?? [1, 0, 0, 0];
  const [tx, ty, tz] = opts.pose?.translation ?? [0, 0, 0];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<e57Root type="Structure" xmlns="http://www.astm.org/COMMIT/E57/2010-e57-v1.0">
<formatName type="String"><![CDATA[ASTM E57 3D Imaging Data File]]></formatName>
<guid type="String"><![CDATA[${guid()}]]></guid>
<versionMajor type="Integer">1</versionMajor>
<versionMinor type="Integer">0</versionMinor>
<coordinateMetadata type="String"></coordinateMetadata>
<data3D type="Vector" allowHeterogeneousChildren="1">
<vectorChild type="Structure">
<guid type="String"><![CDATA[${guid()}]]></guid>
<name type="String"><![CDATA[${c.name}]]></name>
<pose type="Structure"><rotation type="Structure"><w type="Float">${qw}</w><x type="Float">${qx}</x><y type="Float">${qy}</y><z type="Float">${qz}</z></rotation><translation type="Structure"><x type="Float">${tx}</x><y type="Float">${ty}</y><z type="Float">${tz}</z></translation></pose>
<points type="CompressedVector" fileOffset="${phys(sectionLogical)}" recordCount="${n}">
<prototype type="Structure">${fields.map((f) => f.xml).join("")}</prototype>
<codecs type="Vector" allowHeterogeneousChildren="1"></codecs>
</points>
</vectorChild>
</data3D>
<images2D type="Vector" allowHeterogeneousChildren="1"></images2D>
</e57Root>
`;
  const xb = new TextEncoder().encode(xml);
  const totalLogical = xmlLogical + xb.length;
  const lg = new Uint8Array(totalLogical);
  const ld = new DataView(lg.buffer);
  const physLen = Math.ceil(totalLogical / PAGE_DATA) * PAGE;
  lg.set(new TextEncoder().encode("ASTM-E57"), 0);
  ld.setUint32(8, 1, true);
  ld.setUint32(12, 0, true);
  ld.setBigUint64(16, BigInt(physLen), true);
  ld.setBigUint64(24, BigInt(phys(xmlLogical)), true);
  ld.setBigUint64(32, BigInt(xb.length), true);
  ld.setBigUint64(40, BigInt(PAGE), true);
  lg[sectionLogical] = 1;
  ld.setBigUint64(sectionLogical + 8, BigInt(32 + packetsLen), true);
  ld.setBigUint64(sectionLogical + 16, BigInt(phys(dataLogical)), true);
  ld.setBigUint64(sectionLogical + 24, 0n, true);
  let o = dataLogical;
  for (const p of packets) (lg.set(p, o), (o += p.length));
  lg.set(xb, xmlLogical);
  // pages with their CRC-32C (big-endian) in the last 4 bytes
  const out = new Uint8Array(physLen);
  const odv = new DataView(out.buffer);
  for (let pg = 0; pg * PAGE_DATA < totalLogical; pg++) {
    const page = new Uint8Array(PAGE_DATA);
    page.set(lg.subarray(pg * PAGE_DATA, Math.min(totalLogical, (pg + 1) * PAGE_DATA)));
    out.set(page, pg * PAGE);
    odv.setUint32(pg * PAGE + PAGE_DATA, crc32c(page), false);
  }
  return out;
}
