// Inventor (.ipt / .iam / .idw / .ipn) and older SOLIDWORKS / Office files are
// OLE compound documents. Their geometry is proprietary, but the standard
// property-set streams (iProperties) and the preview thumbnail can be read.

export interface CfbFile {
  streams: Map<string, Uint8Array>;
}

/** Microsoft Compound File Binary reader (v3 / v4). */
export function readCfb(bytes: Uint8Array): CfbFile {
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const sig = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];
  if (!sig.every((b, i) => bytes[i] === b)) throw new Error("OLE 複合ドキュメントではありません");
  const secSize = 1 << dv.getUint16(0x1e, true);
  const miniSize = 1 << dv.getUint16(0x20, true);
  const firstDir = dv.getUint32(0x30, true);
  const cutoff = dv.getUint32(0x38, true);
  const firstMiniFat = dv.getUint32(0x3c, true);
  let difatSector = dv.getUint32(0x44, true);
  const sector = (n: number) => 512 + n * secSize;
  // DIFAT -> FAT sector list
  const fatSectors: number[] = [];
  for (let i = 0; i < 109; i++) {
    const s = dv.getUint32(0x4c + i * 4, true);
    if (s < 0xfffffffa) fatSectors.push(s);
  }
  let guard = 0;
  while (difatSector < 0xfffffffa && guard++ < 10000) {
    const off = sector(difatSector);
    for (let i = 0; i < secSize / 4 - 1; i++) {
      const s = dv.getUint32(off + i * 4, true);
      if (s < 0xfffffffa) fatSectors.push(s);
    }
    difatSector = dv.getUint32(off + secSize - 4, true);
  }
  const fat: number[] = [];
  for (const s of fatSectors) for (let i = 0; i < secSize / 4; i++) fat.push(dv.getUint32(sector(s) + i * 4, true));
  const chain = (start: number, table: number[]) => {
    const out: number[] = [];
    let s = start;
    while (s < 0xfffffffa && out.length < table.length + 1) {
      out.push(s);
      s = table[s];
    }
    return out;
  };
  const readChain = (start: number, size?: number) => {
    const secs = chain(start, fat);
    const out = new Uint8Array(secs.length * secSize);
    secs.forEach((s, i) => out.set(bytes.subarray(sector(s), sector(s) + secSize), i * secSize));
    return size === undefined ? out : out.subarray(0, size);
  };
  const dir = readChain(firstDir);
  const ddv = new DataView(dir.buffer, dir.byteOffset, dir.byteLength);
  type Entry = { name: string; type: number; start: number; size: number };
  const entries: Entry[] = [];
  for (let o = 0; o + 128 <= dir.length; o += 128) {
    const nlen = ddv.getUint16(o + 0x40, true);
    let name = "";
    for (let i = 0; i + 2 < nlen; i += 2) name += String.fromCharCode(ddv.getUint16(o + i, true));
    entries.push({ name, type: dir[o + 0x42], start: ddv.getUint32(o + 0x74, true), size: ddv.getUint32(o + 0x78, true) });
  }
  const root = entries[0];
  const miniStream = root ? readChain(root.start, root.size) : new Uint8Array();
  const miniFat: number[] = [];
  if (firstMiniFat < 0xfffffffa) {
    const mf = readChain(firstMiniFat);
    const mdv = new DataView(mf.buffer, mf.byteOffset, mf.byteLength);
    for (let i = 0; i < mf.length / 4; i++) miniFat.push(mdv.getUint32(i * 4, true));
  }
  const streams = new Map<string, Uint8Array>();
  for (const e of entries) {
    if (e.type !== 2) continue;
    if (e.size < cutoff) {
      const secs = chain(e.start, miniFat);
      const out = new Uint8Array(secs.length * miniSize);
      secs.forEach((s, i) => out.set(miniStream.subarray(s * miniSize, s * miniSize + miniSize), i * miniSize));
      streams.set(e.name, out.subarray(0, e.size));
    } else streams.set(e.name, readChain(e.start, e.size));
  }
  return { streams };
}

// ------------------------------------------------------ property sets ---

export interface PropertySet {
  fmtid: string;
  props: Map<number, unknown>;
  /** Custom property names (dictionary). */
  names: Map<number, string>;
}

function guid(b: Uint8Array, o: number): string {
  const h = (i: number) => b[o + i].toString(16).padStart(2, "0");
  return `${h(3)}${h(2)}${h(1)}${h(0)}-${h(5)}${h(4)}-${h(7)}${h(6)}-${h(8)}${h(9)}-${h(10)}${h(11)}${h(12)}${h(13)}${h(14)}${h(15)}`.toUpperCase();
}

/** Parses a \x05…Information property-set stream. */
export function readPropertySets(data: Uint8Array): PropertySet[] {
  const dv = new DataView(data.buffer, data.byteOffset, data.byteLength);
  if (dv.getUint16(0, true) !== 0xfffe) return [];
  const nsets = dv.getUint32(24, true);
  const out: PropertySet[] = [];
  for (let s = 0; s < nsets && s < 4; s++) {
    const fmtid = guid(data, 28 + s * 20);
    const off = dv.getUint32(28 + s * 20 + 16, true);
    const n = dv.getUint32(off + 4, true);
    const props = new Map<number, unknown>(), names = new Map<number, string>();
    let codepage = 1252;
    const ents: [number, number][] = [];
    for (let i = 0; i < n && i < 4096; i++) ents.push([dv.getUint32(off + 8 + i * 8, true), dv.getUint32(off + 12 + i * 8, true)]);
    const cp = ents.find((e) => e[0] === 1);
    if (cp) codepage = dv.getInt16(off + cp[1] + 4, true) & 0xffff;
    const decode = (b: Uint8Array) => {
      const enc = codepage === 65001 ? "utf-8" : codepage === 932 ? "shift_jis" : codepage === 1200 ? "utf-16le" : "windows-1252";
      try {
        return new TextDecoder(enc).decode(b).replace(/\0+$/, "");
      } catch {
        return new TextDecoder().decode(b).replace(/\0+$/, "");
      }
    };
    for (const [pid, po] of ents) {
      const p = off + po;
      if (pid === 0) {
        // dictionary: count, then (id, len, name)
        const cnt = dv.getUint32(p, true);
        let q = p + 4;
        for (let i = 0; i < cnt && i < 4096; i++) {
          const id = dv.getUint32(q, true), len = dv.getUint32(q + 4, true);
          q += 8;
          if (codepage === 1200) {
            names.set(id, new TextDecoder("utf-16le").decode(data.subarray(q, q + len * 2)).replace(/\0+$/, ""));
            q += len * 2;
            q = (q + 3) & ~3;
          } else {
            names.set(id, decode(data.subarray(q, q + len)));
            q += len;
          }
        }
        continue;
      }
      const type = dv.getUint16(p, true);
      try {
        switch (type) {
          case 2:
            props.set(pid, dv.getInt16(p + 4, true));
            break;
          case 3:
          case 22:
            props.set(pid, dv.getInt32(p + 4, true));
            break;
          case 5:
            props.set(pid, dv.getFloat64(p + 4, true));
            break;
          case 11:
            props.set(pid, dv.getInt16(p + 4, true) !== 0);
            break;
          case 30: {
            const len = dv.getUint32(p + 4, true);
            props.set(pid, decode(data.subarray(p + 8, p + 8 + len)));
            break;
          }
          case 31: {
            const len = dv.getUint32(p + 4, true);
            props.set(pid, new TextDecoder("utf-16le").decode(data.subarray(p + 8, p + 8 + len * 2)).replace(/\0+$/, ""));
            break;
          }
          case 64: {
            // FILETIME: 100 ns since 1601
            const lo = dv.getUint32(p + 4, true), hi = dv.getUint32(p + 8, true);
            const ms = (hi * 4294967296 + lo) / 10000 - 11644473600000;
            if (ms > 0) props.set(pid, new Date(ms));
            break;
          }
          case 71: {
            const len = dv.getUint32(p + 4, true);
            props.set(pid, data.subarray(p + 8, p + 8 + len));
            break;
          }
        }
      } catch {
        /* truncated value */
      }
    }
    out.push({ fmtid, props, names });
  }
  return out;
}

const SUMMARY: Record<number, string> = { 2: "タイトル", 3: "件名", 4: "作成者", 5: "キーワード", 6: "コメント", 8: "最終保存者", 9: "リビジョン", 12: "作成日時", 13: "更新日時", 18: "アプリケーション" };
const DOCSUM: Record<number, string> = { 2: "分類", 14: "マネージャー", 15: "会社" };
// Inventor "Design Tracking Properties"
const DESIGN: Record<number, string> = { 5: "パーツ番号", 7: "プロジェクト", 9: "コストセンター", 10: "検図者", 29: "説明", 41: "設計者", 20: "材質" };

export interface NativeFileInfo {
  app: string;
  props: [string, string][];
  /** Preview image (PNG / BMP) as an object URL source. */
  thumbnail: Blob | null;
}

/** iProperties and preview of an Inventor / SOLIDWORKS (OLE) file. */
export function readNativeInfo(bytes: Uint8Array): NativeFileInfo {
  const cfb = readCfb(bytes);
  const props: [string, string][] = [];
  let thumbnail: Blob | null = null;
  let app = "";
  const fmt = (v: unknown) => (v instanceof Date ? v.toLocaleString("ja-JP") : typeof v === "string" ? v : typeof v === "number" || typeof v === "boolean" ? String(v) : "");
  for (const [name, data] of cfb.streams) {
    if (!name.startsWith("\u0005")) continue;
    for (const set of readPropertySets(data)) {
      const isSummary = set.fmtid === "F29F85E0-4FF9-1068-AB91-08002B27B3D9";
      const isDoc = set.fmtid === "D5CDD502-2E9C-101B-9397-08002B2CF9AE";
      const isDesign = set.fmtid === "32853F0F-3444-11D1-9E93-0060B03C1CA6";
      for (const [pid, v] of set.props) {
        if (pid === 1) continue;
        if (isSummary && pid === 17 && v instanceof Uint8Array) {
          thumbnail ??= clipboardImage(v);
          continue;
        }
        if (isSummary && pid === 18) app = fmt(v);
        const label = isSummary ? SUMMARY[pid] : isDoc ? DOCSUM[pid] : isDesign ? DESIGN[pid] : set.names.get(pid);
        const text = fmt(v);
        if (label && text.trim() && !props.some(([k]) => k === label)) props.push([label, text]);
      }
    }
  }
  // newer Inventor versions keep a PNG preview in their own streams
  if (!thumbnail)
    for (const data of cfb.streams.values()) {
      const i = findBytes(data, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
      if (i >= 0) {
        thumbnail = new Blob([data.slice(i) as BlobPart], { type: "image/png" });
        break;
      }
    }
  return { app, props, thumbnail };
}

function findBytes(d: Uint8Array, sig: number[]): number {
  outer: for (let i = 0; i + sig.length <= d.length; i++) {
    for (let k = 0; k < sig.length; k++) if (d[i + k] !== sig[k]) continue outer;
    return i;
  }
  return -1;
}

/** VT_CF thumbnail: CF_DIB -> BMP, embedded PNG passed through. */
function clipboardImage(cf: Uint8Array): Blob | null {
  const png = findBytes(cf, [0x89, 0x50, 0x4e, 0x47]);
  if (png >= 0) return new Blob([cf.slice(png) as BlobPart], { type: "image/png" });
  if (cf.length < 12) return null;
  const dv = new DataView(cf.buffer, cf.byteOffset, cf.byteLength);
  if (dv.getInt32(0, true) !== -1 || dv.getUint32(4, true) !== 8) return null; // CF_DIB only
  const dib = cf.subarray(8);
  const ddv = new DataView(dib.buffer, dib.byteOffset, dib.byteLength);
  const hdr = ddv.getUint32(0, true), bpp = ddv.getUint16(14, true), clr = ddv.getUint32(32, true);
  const palette = bpp <= 8 ? (clr || 1 << bpp) * 4 : 0;
  const file = new Uint8Array(14 + dib.length);
  const fdv = new DataView(file.buffer);
  file[0] = 0x42;
  file[1] = 0x4d;
  fdv.setUint32(2, file.length, true);
  fdv.setUint32(10, 14 + hdr + palette, true);
  file.set(dib, 14);
  return new Blob([file], { type: "image/bmp" });
}
