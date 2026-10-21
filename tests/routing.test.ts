import { describe, expect, it } from "vitest";
import type { Vec3 } from "../src/core/types";
import { analyzeRoute, clearanceCheck, cutLength, cutListCsv, cutRows, filletPolyline, routePolyline, samplePath, toLocal, toWorld } from "../src/routing/geom";
import { defaultBendRadius, newRoute, ruleMinRadius, sanitizeRoutes, type AsmRoute } from "../src/routing/types";

const close = (a: number, b: number, eps = 1e-6) => expect(Math.abs(a - b)).toBeLessThan(eps);

describe("polyline filleting", () => {
  it("90° corner: length = legs − 2R + πR/2, one bend", () => {
    const R = 10;
    const f = filletPolyline([[0, 0, 0], [100, 0, 0], [100, 50, 0]], R);
    expect(f.bends).toBe(1);
    close(f.length, 150 - 2 * R + (Math.PI * R) / 2);
    expect(f.short).toEqual([]);
    expect(f.segs.map((s) => s.t)).toEqual(["line", "arc", "line"]);
    const arc = f.segs[1];
    close(arc.r!, R);
    // arc tangent points and mid point lie on the circle centred at (90, 10)
    expect(arc.a).toEqual([90, 0, 0]);
    close(arc.b[0], 100);
    close(arc.b[1], 10);
    close(Math.hypot(arc.m![0] - 90, arc.m![1] - 10), R);
  });

  it("general angle and 3D: tangent length R·tan(θ/2)", () => {
    const R = 7;
    const pts: Vec3[] = [[0, 0, 0], [50, 0, 0], [50 + 40 * Math.cos(Math.PI / 3), 40 * Math.sin(Math.PI / 3), 0], [80, 40, 60]];
    const f = filletPolyline(pts, R);
    expect(f.bends).toBe(2);
    let expected = 0;
    for (let i = 1; i < pts.length; i++) expected += Math.hypot(...([0, 1, 2].map((k) => pts[i][k] - pts[i - 1][k]) as Vec3));
    for (const th of f.angles.map((a) => (a * Math.PI) / 180)) expected += R * th - 2 * R * Math.tan(th / 2);
    close(f.length, expected);
    close(f.angles[0], 60);
  });

  it("collinear points add no bend; straight route length is exact", () => {
    const f = filletPolyline([[0, 0, 0], [30, 0, 0], [70, 0, 0]], 20);
    expect(f.bends).toBe(0);
    close(f.length, 70);
  });

  it("detects segments too short for the bends and reduces the radius", () => {
    // U-turn: middle segment 10 mm, two 90° bends of R10 need 20 mm
    const f = filletPolyline([[0, 0, 0], [50, 0, 0], [50, 10, 0], [0, 10, 0]], 10);
    expect(f.short).toEqual([1]);
    expect(f.bends).toBe(2);
    f.radii.forEach((r) => close(r, 5));
    // two quarter circles of R5 = half circle; straights 45 + 45
    close(f.length, 90 + Math.PI * 5);
    const a = analyzeRoute({ ...newRoute("r", 1, "cable"), od: 2, bendRadius: 10, points: [[0, 0, 0], [50, 0, 0], [50, 10, 0], [0, 10, 0]].map((p, i) => ({ id: `p${i}`, local: p as Vec3, snap: "free", label: "" })) }, () => undefined);
    expect(a.warnings.some((w) => w.includes("短すぎ"))).toBe(true);
    // R5 < cable 4×D=8 rule
    expect(a.warnings.some((w) => w.includes("目安"))).toBe(true);
  });

  it("flags reversals", () => {
    const f = filletPolyline([[0, 0, 0], [10, 0, 0], [0, 0, 0]], 5);
    expect(f.reversals).toEqual([1]);
  });
});

describe("route length vs analytic", () => {
  it("rectangular loop with bends; samples follow the path", () => {
    const R = 15;
    const pts: Vec3[] = [[0, 0, 0], [200, 0, 0], [200, 100, 0], [200, 100, 80]];
    const f = filletPolyline(pts, R);
    close(f.length, 380 - 4 * R + 2 * ((Math.PI / 2) * R), 1e-6);
    const s = samplePath(f.segs, 2);
    close(s[s.length - 1].s, f.length, 1e-6);
    // sample points stay on the curve: consecutive spacing ≤ step
    for (let i = 1; i < s.length; i++) expect(Math.hypot(...([0, 1, 2].map((k) => s[i].p[k] - s[i - 1].p[k]) as Vec3))).toBeLessThanOrEqual(2 + 1e-9);
    expect(s[s.length - 1].p[2]).toBeCloseTo(80, 6);
  });

  it("cut length and CSV", () => {
    close(cutLength(200, 10), 220);
    const r: AsmRoute = { ...newRoute("r", 1, "pipe"), points: [[0, 0, 0], [100, 0, 0]].map((p, i) => ({ id: `p${i}`, local: p as Vec3, snap: "free", label: "" })) };
    const rows = cutRows([r], () => undefined);
    close(rows[0].length, 100);
    close(rows[0].cut, 105);
    const csv = cutListCsv(rows);
    expect(csv.split("\n")[1]).toContain('"105"');
    expect(csv).toContain("パイプ");
  });

  it("bend radius rules by type", () => {
    expect(defaultBendRadius("cable", 8)).toBe(48);
    expect(defaultBendRadius("cable", 8, true)).toBe(80);
    expect(ruleMinRadius("pipe", 10)).toBe(15);
    expect(defaultBendRadius("pipe", 10)).toBeGreaterThanOrEqual(ruleMinRadius("pipe", 10));
  });
});

describe("attachment to components", () => {
  const rot90z = (t: Vec3) => [0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1, 0, t[0], t[1], t[2], 1];

  it("local <-> world round trip", () => {
    const m = rot90z([10, 20, 30]);
    const w = toWorld(m, [1, 2, 3]);
    expect(w).toEqual([10 - 2, 20 + 1, 33]);
    const l = toLocal(m, w);
    l.forEach((v, i) => close(v, [1, 2, 3][i]));
  });

  it("points follow their component when it moves; connector lead goes along the moved direction", () => {
    const comps: Record<string, { matrix: number[] }> = {
      a: { matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] },
      b: { matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 100, 0, 0, 1] },
    };
    const r: AsmRoute = {
      ...newRoute("r", 1),
      points: [
        { id: "1", comp: "a", local: [0, 0, 0], snap: "port", dir: [0, 0, 1], lead: 20, label: "" },
        { id: "2", comp: "b", local: [0, 0, 0], snap: "circle", label: "" },
      ],
    };
    const look = (id: string) => comps[id];
    expect(routePolyline(r, look)).toEqual([[0, 0, 0], [0, 0, 20], [100, 0, 0]]);
    comps.b.matrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 100, 50, 0, 1];
    comps.a.matrix = [1, 0, 0, 0, 0, 0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1]; // rotate a about X: local z -> world -y
    const pl = routePolyline(r, look);
    pl[1].forEach((v, i) => close(v, [0, -20, 0][i]));
    expect(pl[2]).toEqual([100, 50, 0]);
  });

  it("sanitizes missing / old route data", () => {
    expect(sanitizeRoutes(undefined)).toEqual([]);
    const r = sanitizeRoutes([{ id: "x", points: [{ local: [1, 2, 3] }, { local: "bad" }] }]);
    expect(r[0].kind).toBe("cable");
    expect(r[0].points.length).toBe(1);
  });
});

describe("clearance check", () => {
  // unit box 0..10 as 12 triangles
  const P = [0, 0, 0, 10, 0, 0, 10, 10, 0, 0, 10, 0, 0, 0, 10, 10, 0, 10, 10, 10, 10, 0, 10, 10];
  const I = [0, 2, 1, 0, 3, 2, 4, 5, 6, 4, 6, 7, 0, 1, 5, 0, 5, 4, 1, 2, 6, 1, 6, 5, 2, 3, 7, 2, 7, 6, 3, 0, 4, 3, 4, 7];
  const box = { comp: "c", name: "箱", positions: P, indices: I, bbox: [[0, 0, 0], [10, 10, 10]] as [Vec3, Vec3] };
  it("reports interference through the box and clearance near it", () => {
    const through = filletPolyline([[-50, 5, 5], [60, 5, 5]], 5);
    const hit = clearanceCheck(through.segs, 2, 1, [box], 3);
    expect(hit[0].gap).toBeLessThan(0);
    const near = filletPolyline([[-50, 5, 12.5], [60, 5, 12.5]], 5);
    const n = clearanceCheck(near.segs, 2, 1, [box], 3);
    close(n[0].gap, 0.5, 1e-6);
    const far = filletPolyline([[-50, 5, 20], [60, 5, 20]], 5);
    expect(clearanceCheck(far.segs, 2, 1, [box], 3)).toEqual([]);
  });
});
