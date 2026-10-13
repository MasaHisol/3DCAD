import { describe, expect, it } from "vitest";
import { read3mf, readGlb, readPly } from "../src/io/meshin";
import { readNativeInfo } from "../src/io/ole";
import { zipStore } from "../src/io/formats";

const stlTris = (stl: Uint8Array) => new DataView(stl.buffer, stl.byteOffset).getUint32(80, true);
const stlVerts = (stl: Uint8Array) => {
  const dv = new DataView(stl.buffer, stl.byteOffset);
  const out: number[][] = [];
  for (let t = 0; t < stlTris(stl); t++) for (let v = 0; v < 3; v++) out.push([0, 1, 2].map((k) => dv.getFloat32(84 + t * 50 + 12 + v * 12 + k * 4, true)));
  return out;
};

describe("mesh import formats", () => {
  it("3MF with a build transform and unit", async () => {
    const xml = `<?xml version="1.0"?><model unit="centimeter" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02"><resources><object id="1" type="model"><mesh><vertices><vertex x="0" y="0" z="0"/><vertex x="1" y="0" z="0"/><vertex x="0" y="1" z="0"/></vertices><triangles><triangle v1="0" v2="1" v3="2"/></triangles></mesh></object></resources><build><item objectid="1" transform="1 0 0 0 1 0 0 0 1 5 0 0"/></build></model>`;
    const zip = zipStore([["3D/3dmodel.model", new TextEncoder().encode(xml)]]);
    const stl = await read3mf(zip);
    expect(stlTris(stl)).toBe(1);
    // translated 5 cm and scaled to mm
    expect(stlVerts(stl)[1]).toEqual([60, 0, 0]);
  });

  it("GLB with indices and a node translation (metres -> mm)", () => {
    const pos = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);
    const idx = new Uint16Array([0, 1, 2, 0]);
    const bin = new Uint8Array(pos.byteLength + idx.byteLength);
    bin.set(new Uint8Array(pos.buffer), 0);
    bin.set(new Uint8Array(idx.buffer), pos.byteLength);
    const json = JSON.stringify({
      asset: { version: "2.0" },
      scene: 0,
      scenes: [{ nodes: [0] }],
      nodes: [{ mesh: 0, translation: [0, 0, 0.002] }],
      meshes: [{ primitives: [{ attributes: { POSITION: 0 }, indices: 1 }] }],
      buffers: [{ byteLength: bin.length }],
      bufferViews: [{ buffer: 0, byteOffset: 0, byteLength: 36 }, { buffer: 0, byteOffset: 36, byteLength: 6 }],
      accessors: [{ bufferView: 0, componentType: 5126, count: 3, type: "VEC3" }, { bufferView: 1, componentType: 5123, count: 3, type: "SCALAR" }],
    });
    let jb = new TextEncoder().encode(json);
    const pad = (4 - (jb.length % 4)) % 4;
    jb = Uint8Array.from([...jb, ...Array(pad).fill(0x20)]);
    const total = 12 + 8 + jb.length + 8 + bin.length;
    const glb = new Uint8Array(total);
    const dv = new DataView(glb.buffer);
    dv.setUint32(0, 0x46546c67, true);
    dv.setUint32(4, 2, true);
    dv.setUint32(8, total, true);
    dv.setUint32(12, jb.length, true);
    dv.setUint32(16, 0x4e4f534a, true);
    glb.set(jb, 20);
    dv.setUint32(20 + jb.length, bin.length, true);
    dv.setUint32(24 + jb.length, 0x004e4942, true);
    glb.set(bin, 28 + jb.length);
    const stl = readGlb(glb);
    expect(stlTris(stl)).toBe(1);
    expect(stlVerts(stl)[1].map((v) => +v.toFixed(4))).toEqual([1000, 0, 2]);
  });

  it("PLY ascii and binary", () => {
    const ascii = "ply\nformat ascii 1.0\nelement vertex 4\nproperty float x\nproperty float y\nproperty float z\nelement face 1\nproperty list uchar int vertex_indices\nend_header\n0 0 0\n1 0 0\n1 1 0\n0 1 0\n4 0 1 2 3\n";
    expect(stlTris(readPly(new TextEncoder().encode(ascii)))).toBe(2);
    const head = new TextEncoder().encode("ply\nformat binary_little_endian 1.0\nelement vertex 3\nproperty float x\nproperty float y\nproperty float z\nelement face 1\nproperty list uchar int vertex_indices\nend_header\n");
    const body = new DataView(new ArrayBuffer(36 + 1 + 12));
    [0, 0, 0, 2, 0, 0, 0, 2, 0].forEach((v, i) => body.setFloat32(i * 4, v, true));
    body.setUint8(36, 3);
    [0, 1, 2].forEach((v, i) => body.setInt32(37 + i * 4, v, true));
    const bin = new Uint8Array(head.length + body.byteLength);
    bin.set(head);
    bin.set(new Uint8Array(body.buffer), head.length);
    const stl = readPly(bin);
    expect(stlVerts(stl)[1]).toEqual([2, 0, 0]);
  });
});

describe("Inventor / OLE iProperties", () => {
  it("reads the summary information of a compound file", () => {
    // property set: code page UTF-8, title, author
    const enc = new TextEncoder();
    const title = enc.encode("ブラケット\0"), author = enc.encode("山田\0");
    const pad4 = (n: number) => (n + 3) & ~3;
    const props: [number, Uint8Array][] = [];
    const i2 = new Uint8Array(8);
    new DataView(i2.buffer).setUint16(0, 2, true);
    new DataView(i2.buffer).setInt16(4, -536, true); // 65000-ish? use 65001 below
    new DataView(i2.buffer).setUint16(4, 65001, true);
    props.push([1, i2]);
    for (const [pid, s] of [[2, title], [4, author]] as [number, Uint8Array][]) {
      const v = new Uint8Array(8 + pad4(s.length));
      const d = new DataView(v.buffer);
      d.setUint32(0, 30, true);
      d.setUint32(4, s.length, true);
      v.set(s, 8);
      props.push([pid, v]);
    }
    const secHead = 8 + props.length * 8;
    const secSize = secHead + props.reduce((s, [, v]) => s + v.length, 0);
    const ps = new Uint8Array(48 + secSize);
    const pd = new DataView(ps.buffer);
    pd.setUint16(0, 0xfffe, true);
    pd.setUint32(24, 1, true);
    ps.set([0xe0, 0x85, 0x9f, 0xf2, 0xf9, 0x4f, 0x68, 0x10, 0xab, 0x91, 0x08, 0x00, 0x2b, 0x27, 0xb3, 0xd9], 28);
    pd.setUint32(44, 48, true);
    pd.setUint32(48, secSize, true);
    pd.setUint32(52, props.length, true);
    let off = secHead;
    props.forEach(([pid, v], i) => {
      pd.setUint32(56 + i * 8, pid, true);
      pd.setUint32(60 + i * 8, off, true);
      ps.set(v, 48 + off);
      off += v.length;
    });
    // compound file: header, FAT (sector 0), directory (sector 1), stream (sector 2..)
    const S = 512, nData = Math.ceil(ps.length / S);
    const file = new Uint8Array(512 + S * (2 + nData));
    const fd = new DataView(file.buffer);
    file.set([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
    fd.setUint16(0x1a, 3, true);
    fd.setUint16(0x1c, 0xfffe, true);
    fd.setUint16(0x1e, 9, true);
    fd.setUint16(0x20, 6, true);
    fd.setUint32(0x2c, 1, true);
    fd.setUint32(0x30, 1, true);
    fd.setUint32(0x38, 0, true); // cutoff 0: every stream in regular sectors
    fd.setUint32(0x3c, 0xfffffffe, true);
    fd.setUint32(0x44, 0xfffffffe, true);
    for (let i = 0; i < 109; i++) fd.setUint32(0x4c + i * 4, i === 0 ? 0 : 0xffffffff, true);
    const fat = 512;
    for (let i = 0; i < 128; i++) fd.setUint32(fat + i * 4, 0xffffffff, true);
    fd.setUint32(fat, 0xfffffffd, true);
    fd.setUint32(fat + 4, 0xfffffffe, true);
    for (let k = 0; k < nData; k++) fd.setUint32(fat + (2 + k) * 4, k === nData - 1 ? 0xfffffffe : 3 + k, true);
    const dir = 512 + S;
    const entry = (o: number, name: string, type: number, start: number, size: number) => {
      for (let i = 0; i < name.length; i++) fd.setUint16(dir + o + i * 2, name.charCodeAt(i), true);
      fd.setUint16(dir + o + 0x40, (name.length + 1) * 2, true);
      file[dir + o + 0x42] = type;
      fd.setUint32(dir + o + 0x74, start, true);
      fd.setUint32(dir + o + 0x78, size, true);
    };
    entry(0, "Root Entry", 5, 0xfffffffe, 0);
    entry(128, "\u0005SummaryInformation", 2, 2, ps.length);
    file.set(ps, 512 + S * 2);
    const info = readNativeInfo(file);
    expect(info.props).toEqual([["タイトル", "ブラケット"], ["作成者", "山田"]]);
  });
});
