import { describe, expect, it } from "vitest";
import * as THREE from "three";
import { clipPlaneOf, defaultSection, keptByPlanes, planeDefOf, sectionPlanes, sweepValue } from "../src/viewer/section";
import { faceIdAttribute } from "../src/viewer/render/gpuPick";
import { planeFrame } from "../src/kernel/section";
import { hatchPatternFor, hatchPatternIndex, DRAWING_HATCH } from "../src/core/hatchStyle";

describe("section state", () => {
  const box = new THREE.Box3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(40, 20, 10));

  it("three planes: clipping keeps the intersection of the kept half spaces", () => {
    const s = defaultSection(box);
    expect(sectionPlanes(s).length).toBe(1); // Z on by default
    s.planes.forEach((p) => (p.enabled = true));
    const planes = sectionPlanes(s);
    expect(planes.length).toBe(3);
    // centre (20, 10, 5): points below every value are kept
    expect(keptByPlanes(planes, new THREE.Vector3(10, 5, 2))).toBe(true);
    expect(keptByPlanes(planes, new THREE.Vector3(30, 5, 2))).toBe(false);
    expect(keptByPlanes(planes, new THREE.Vector3(10, 15, 2))).toBe(false);
    expect(keptByPlanes(planes, new THREE.Vector3(10, 5, 8))).toBe(false);
    // flip keeps the other side
    s.planes[0].flip = true;
    expect(keptByPlanes(sectionPlanes(s), new THREE.Vector3(30, 5, 2))).toBe(true);
    expect(clipPlaneOf({ axis: "Y", enabled: true, value: 3, flip: false }).distanceToPoint(new THREE.Vector3(0, 2, 0))).toBeCloseTo(1, 12);
  });

  it("kernel planes have right-handed 2D frames viewed from + axis", () => {
    for (const a of ["X", "Y", "Z"] as const) {
      const p = planeDefOf(a, 7);
      const f = planeFrame(p);
      const n = new THREE.Vector3(...f.n), x = new THREE.Vector3(...f.x), y = new THREE.Vector3(...f.y);
      expect(x.clone().cross(y).dot(n)).toBeCloseTo(1, 12);
      expect(p.origin[{ X: 0, Y: 1, Z: 2 }[a]]).toBe(7);
    }
    // Z section: plain x / y coordinates
    expect(planeFrame(planeDefOf("Z", 5)).to2([3, 4, 5])).toEqual([3, 4]);
  });

  it("sweep goes back and forth between the bounds", () => {
    expect(sweepValue(0, 0, 10)).toBeCloseTo(0, 9);
    expect(sweepValue(2000, 0, 10)).toBeCloseTo(10, 9);
    expect(sweepValue(4000, 0, 10)).toBeCloseTo(0, 9);
    const mid = sweepValue(1000, 0, 10);
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThan(10);
  });
});

describe("GPU pick ID buffer", () => {
  it("per-vertex face ids from face ranges", () => {
    // two faces: triangles 0 (verts 0..2) and 1 (verts 3..5)
    const ids = faceIdAttribute(6, [0, 1, 2, 3, 4, 5], [0, 3, 3, 3]);
    expect([...ids]).toEqual([0, 0, 0, 1, 1, 1]);
  });
});

describe("hatch patterns", () => {
  it("drawing hatch by default, stable per key, neighbours differ", () => {
    expect(hatchPatternFor(undefined)).toBe(DRAWING_HATCH);
    expect(hatchPatternIndex("p-bracket")).toBe(hatchPatternIndex("p-bracket"));
    const a = hatchPatternFor(0), b = hatchPatternFor(1);
    expect(a.angle !== b.angle || a.spacing !== b.spacing).toBe(true);
  });
});
