/// <reference types="node" />
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { readGltf, writeGlb, writeGltf } from "../src/io/gltf";
import { plyIsPointCloud, readPlyPoints, writePlyPoints } from "../src/io/pointcloud";
import { readE57, writeE57 } from "../src/io/e57";
import { readGlb } from "../src/io/meshin";

const fixture = (n: string) => new Uint8Array(readFileSync(new URL(`./fixtures/${n}`, import.meta.url)));

const cube = () => {
  const p = [0, 0, 0, 10, 0, 0, 10, 20, 0, 0, 20, 0, 0, 0, 30, 10, 0, 30, 10, 20, 30, 0, 20, 30];
  const t = [0, 2, 1, 0, 3, 2, 4, 5, 6, 4, 6, 7, 0, 1, 5, 0, 5, 4, 1, 2, 6, 1, 6, 5, 2, 3, 7, 2, 7, 6, 3, 0, 4, 3, 4, 7];
  return { positions: new Float32Array(p), indices: new Uint32Array(t) };
};

describe("glTF", () => {
  it("writes and reads back names, colours, placements and millimetres (glb and gltf)", () => {
    const c = cube();
    const items = [
      { name: "ブロック", ...c, color: "#ff8000" },
      { name: "moved", ...c, color: "#2080ff", matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 100, 0, 0, 1] },
    ];
    for (const data of [writeGlb(items), writeGltf(items)]) {
      const ms = readGltf(data);
      expect(ms.map((m) => m.name)).toEqual(["ブロック", "moved"]);
      expect(ms[0].color).toBe("#ff8000");
      expect(ms[1].color).toBe("#2080ff");
      expect(ms[0].indices.length).toBe(36);
      // metres in the file, millimetres back
      expect(Math.max(...ms[0].positions)).toBeCloseTo(30, 4);
      expect(Math.max(...ms[1].positions.filter((_, i) => i % 3 === 0))).toBeCloseTo(110, 4);
    }
    // the text form embeds its buffer
    expect(writeGltf(items)).toContain("data:application/octet-stream;base64,");
    // the existing mesh importer reads our GLB too
    const stl = readGlb(writeGlb(items));
    expect(new DataView(stl.buffer, stl.byteOffset).getUint32(80, true)).toBe(24);
  });

  it("reads the committed sample", () => {
    const ms = readGltf(new TextDecoder().decode(fixture("sample.gltf")));
    expect(ms.length).toBeGreaterThan(0);
  });
});

describe("point clouds", { timeout: 30000 }, () => {
  const grid = () => {
    const P: number[] = [], C: number[] = [];
    for (let i = 0; i <= 20; i++)
      for (let j = 0; j <= 10; j++) {
        P.push(i * 5, j * 5, 0);
        C.push(i / 20, j / 10, 0.5);
      }
    return { name: "grid", positions: new Float32Array(P), colors: new Float32Array(C) };
  };

  it("PLY without faces is a point cloud (binary and ascii)", () => {
    const g = grid();
    const bin = writePlyPoints(g);
    expect(plyIsPointCloud(bin)).toBe(true);
    const c = readPlyPoints(bin);
    expect(c.positions.length).toBe(231 * 3);
    expect([...c.positions.slice(-3)]).toEqual([100, 50, 0]);
    expect(c.colors![0 * 3 + 2]).toBeCloseTo(128 / 255, 5);
    const ascii = new TextEncoder().encode("ply\nformat ascii 1.0\nelement vertex 3\nproperty float x\nproperty float y\nproperty float z\nproperty uchar red\nproperty uchar green\nproperty uchar blue\nelement face 0\nproperty list uchar int vertex_indices\nend_header\n0 0 0 255 0 0\n1 2 3 0 255 0\n4 5 6 0 0 255\n");
    expect(plyIsPointCloud(ascii)).toBe(true);
    const a = readPlyPoints(ascii);
    expect([...a.positions]).toEqual([0, 0, 0, 1, 2, 3, 4, 5, 6]);
    expect([...a.colors!.slice(3, 6)]).toEqual([0, 1, 0]);
    // a PLY with faces stays a mesh
    const mesh = new TextEncoder().encode("ply\nformat ascii 1.0\nelement vertex 3\nproperty float x\nproperty float y\nproperty float z\nelement face 1\nproperty list uchar int vertex_indices\nend_header\n0 0 0\n1 0 0\n0 1 0\n3 0 1 2\n");
    expect(plyIsPointCloud(mesh)).toBe(false);
  });

  it("E57: minimal file written and read back (pages, CRC, packets, colours)", () => {
    // enough points to span several pages and packets
    const P: number[] = [], C: number[] = [];
    for (let i = 0; i < 9000; i++) {
      P.push((i % 100) * 2, Math.floor(i / 100) * 3, i % 7);
      C.push((i % 3) / 2, 0.5, 1);
    }
    const e57 = writeE57({ name: "scan", positions: new Float32Array(P), colors: new Float32Array(C) });
    expect(new TextDecoder().decode(e57.subarray(0, 8))).toBe("ASTM-E57");
    expect(e57.length % 1024).toBe(0);
    const c = readE57(e57);
    expect(c.positions.length).toBe(9000 * 3);
    for (const i of [0, 1, 4567, 8999]) for (let k = 0; k < 3; k++) expect(c.positions[i * 3 + k]).toBeCloseTo(P[i * 3 + k], 2);
    expect(c.colors![3]).toBeCloseTo(C[3], 2);
  });

  it("E57: scaled integer coordinates, intensity and a pose (hand-built XML)", () => {
    const c = readE57(fixture("cloud.e57"));
    expect(c.positions.length).toBe(231 * 3);
    // the committed sample is the 100 x 50 mm grid
    const xs = c.positions.filter((_, i) => i % 3 === 0);
    expect(Math.max(...xs) - Math.min(...xs)).toBeCloseTo(100, 2);
  });
});
