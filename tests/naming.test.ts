// Regression suite for the persistent topological naming engine (stage 1.5, #2):
// upstream edits must not detach downstream references.
import { beforeAll, describe, expect, it } from "vitest";
import opencascade from "replicad-opencascadejs";
import { setOC } from "replicad";
import { GeometryEngine, drawView } from "../src/kernel/geometry";
import type { BodyMesh, RFeature, RRegion } from "../src/kernel/protocol";
import type { EdgeRef, FaceRef, PlaneDef, Vec3 } from "../src/core/types";
import { baseName, edgeFaces, resolveNamed } from "../src/core/naming";
import { resolveRef } from "../src/mbd/resolve";
import { geoFromRef } from "../src/assembly/toporef";
import { attachTopo, expectedRef } from "../src/drawing/toporef";
import { resnap } from "../src/drawing/geom";
import type { GRef } from "../src/drawing/types";

const XY: PlaneDef = { origin: [0, 0, 0], xDir: [1, 0, 0], normal: [0, 0, 1] };
type P2 = [number, number];
/** Rectangle with sketch entity ids L1..L4 (bottom, right, top, left). */
const rect = (w: number, h: number, x = 0, y = 0): RRegion => {
  const p: P2[] = [
    [x, y],
    [x + w, y],
    [x + w, y + h],
    [x, y + h],
  ];
  return { outer: p.map((a, i) => ({ t: "line" as const, a, b: p[(i + 1) % 4], src: `L${i + 1}` })), holes: [] };
};
const extrude = (id: string, region: RRegion, h: number, op: "new" | "join" | "cut" = "new", plane = XY): RFeature => ({
  id, type: "extrude", plane, regions: [region], op, from: 0, to: h, through: false, flip: false,
});
const hole = (id: string, z: number, pts: P2[], d = 4): RFeature => ({
  id, type: "hole", plane: { ...XY, origin: [0, 0, z] }, points: pts, holeType: "simple",
  diameter: d, depth: 0, through: true, cbDiameter: 0, cbDepth: 0, csDiameter: 0, csAngle: 90, flip: false,
});
const dist = (a: Vec3, b: Vec3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

/** Reference to the edge of body 0 whose mid point is nearest `p`, captured as the UI does. */
function edgeAt(b: BodyMesh, p: Vec3): EdgeRef {
  let bi = 0;
  b.edges.forEach((e, i) => dist(e.mid, p) < dist(b.edges[bi].mid, p) && (bi = i));
  const e = b.edges[bi];
  return { mid: e.mid, a: e.a, b: e.b, type: e.type, name: b.edgeNames![bi] };
}
function faceAt(b: BodyMesh, p: Vec3, n?: Vec3): FaceRef {
  let bi = -1, bd = Infinity;
  b.faces.forEach((f, i) => {
    const d = dist(f.center, p) + (n ? (1 - (f.normal[0] * n[0] + f.normal[1] * n[1] + f.normal[2] * n[2])) * 100 : 0);
    if (d < bd) (bd = d), (bi = i);
  });
  const f = b.faces[bi];
  return { center: f.center, normal: f.normal, type: f.type, name: b.faceNames![bi] };
}

beforeAll(async () => {
  const OC = await (opencascade as unknown as () => Promise<unknown>)();
  setOC(OC as never);
}, 60000);

describe("topology names", () => {
  it("names faces and edges from the feature history", async () => {
    const eng = new GeometryEngine();
    const r = await eng.rebuild([extrude("e1", rect(40, 20), 10)]);
    const b = r.bodies[0];
    expect([...b.faceNames!].sort()).toEqual(["e1:end", "e1:side:L1", "e1:side:L2", "e1:side:L3", "e1:side:L4", "e1:start"]);
    expect(new Set(b.edgeNames).size).toBe(12);
    expect(edgeAt(b, [40, 20, 5]).name).toBe("E[e1:side:L2 | e1:side:L3]");
    expect(edgeFaces("E[e1:side:L2 | e1:side:L3]")).toEqual(["e1:side:L2", "e1:side:L3"]);
    // holes and fillets get role names
    const r2 = await eng.rebuild([
      extrude("e1", rect(40, 20), 10),
      hole("h1", 10, [[10, 10]]),
      { id: "f1", type: "fillet", edges: [edgeAt(b, [40, 20, 5])], radius: 2 },
    ]);
    const n2 = r2.bodies[0].faceNames!;
    expect(n2).toContain("h1:wall:p0");
    expect(n2).toContain("f1:blend(E[e1:side:L2 | e1:side:L3])");
    expect(n2).toContain("e1:end");
  }, 60000);

  it("resolver: exact, suffix-less, partial and broken", () => {
    const c = (name: string, score: number, index = 0) => ({ body: 0, index, name, score });
    expect(resolveNamed("face", "a:x", [c("a:y", 0, 0), c("a:x", 50, 1)], 10)).toMatchObject({ ok: { index: 1, method: "name", confidence: 1 } });
    expect(resolveNamed("face", "a:x~2", [c("a:x~1", 3, 0), c("a:x~3", 1, 1)], 10)).toMatchObject({ ok: { index: 1, method: "name-base" } });
    expect(resolveNamed("edge", "E[a | b]", [c("E[a | c]", 1, 0), c("E[d | e]", 0.5, 1)], 10)).toMatchObject({ ok: { index: 0, method: "name-partial" } });
    const lost = resolveNamed("face", "z:q", [c("a:y", 99, 0)], 10);
    expect("broken" in lost && lost.broken.reason).toBe("lost");
    expect("broken" in lost && lost.broken.candidates.length).toBe(1);
    const amb = resolveNamed("face", "a:q", [c("a:y", 1, 0), c("a:z", 1, 1)], 10);
    expect("broken" in amb && amb.broken.reason).toBe("ambiguous");
    expect(baseName("x~12")).toBe("x");
  });

  it("change extrude sketch dimension -> fillet keeps the same edges", async () => {
    const eng = new GeometryEngine();
    const base = await eng.rebuild([extrude("e1", rect(40, 20), 10)]);
    const b = base.bodies[0];
    const edges = [edgeAt(b, [40, 20, 5]), edgeAt(b, [20, 0, 10])];
    const feats: RFeature[] = [extrude("e1", rect(40, 20), 10), { id: "f1", type: "fillet", edges, radius: 2 }];
    const r1 = await eng.rebuild(feats);
    expect(r1.errors).toEqual({});
    // much longer and taller: absolute positions no longer match, names do
    feats[0] = extrude("e1", rect(120, 20), 35);
    const r2 = await eng.rebuild(feats);
    expect(r2.errors).toEqual({});
    const up = r2.updatedRefs.f1.edges!;
    expect(up.map((e) => e.name)).toEqual(edges.map((e) => e.name));
    expect(up[0].mid[0]).toBeCloseTo(120, 6);
    expect(up[0].mid[2]).toBeCloseTo(17.5, 6);
    expect(up[1].mid[2]).toBeCloseTo(35, 6);
    expect(r2.bodies[0].faceNames!.filter((n) => n.startsWith("f1:blend")).length).toBe(2);
  }, 60000);

  it("insert a hole upstream -> downstream fillet / chamfer references stay valid", async () => {
    const eng = new GeometryEngine();
    const b = (await eng.rebuild([extrude("e1", rect(40, 20), 10)])).bodies[0];
    const fe = edgeAt(b, [40, 10, 10]); // top right edge
    const ce = edgeAt(b, [0, 0, 5]); // vertical left front edge
    const feats: RFeature[] = [extrude("e1", rect(40, 20), 10), { id: "f1", type: "fillet", edges: [fe], radius: 2 }, { id: "c1", type: "chamfer", edges: [ce], distance: 1.5 }];
    const r1 = await eng.rebuild(feats);
    expect(r1.errors).toEqual({});
    const v1 = eng.massProps().volume;
    // a hole right next to the filleted edge, inserted before the fillet
    feats.splice(1, 0, hole("h1", 10, [[34, 10]], 6));
    const r2 = await eng.rebuild(feats);
    expect(r2.errors).toEqual({});
    expect(r2.updatedRefs.f1.edges![0].name).toBe(fe.name);
    expect(r2.updatedRefs.c1.edges![0].name).toBe(ce.name);
    expect(eng.massProps().volume).toBeCloseTo(v1 - Math.PI * 9 * 10, 1);
  }, 60000);

  it("change pattern count -> references to pattern instances keep their instance", async () => {
    const eng = new GeometryEngine();
    const pat = (n: number, step: number): RFeature => ({ id: "p1", type: "pattern", sources: ["h1"], transforms: Array.from({ length: n - 1 }, (_, k) => ({ translate: [step * (k + 1), 0, 0] as Vec3 })) });
    const feats: RFeature[] = [extrude("e1", rect(100, 20), 10), hole("h1", 10, [[10, 10]]), pat(3, 20)];
    const r1 = await eng.rebuild(feats);
    const b = r1.bodies[0];
    // top rim of instance 2 (x = 50)
    const rim = edgeAt(b, [50, 12, 10]);
    expect(rim.name).toBe("E[e1:end | h1:wall:p0@p1.2]");
    const wall = faceAt(b, [50, 10, 5]);
    expect(wall.name).toBe("h1:wall:p0@p1.2");
    feats.push({ id: "c1", type: "chamfer", edges: [rim], distance: 0.5 });
    feats.push({ id: "s1", type: "shell", faces: [faceAt(b, [50, 10, 0], [0, 0, -1])], thickness: 1 });
    expect((await eng.rebuild(feats)).errors).toEqual({});
    // more instances, different spacing: instance 2 now sits at x = 10 + 2 * 15
    feats[2] = pat(5, 15);
    const r2 = await eng.rebuild(feats);
    expect(r2.errors).toEqual({});
    const up = r2.updatedRefs.c1.edges![0];
    expect(up.name).toBe(rim.name);
    expect(Math.abs(up.mid[0] - 40)).toBeLessThan(2.001);
    expect(r2.updatedRefs.s1.faces![0].name).toBe("e1:start");
  }, 60000);

  it("sketch-on-face plane follows the face after an upstream edit", async () => {
    const eng = new GeometryEngine();
    const b = (await eng.rebuild([extrude("e1", rect(40, 20), 10)])).bodies[0];
    const top = faceAt(b, [20, 10, 10], [0, 0, 1]);
    expect(top.name).toBe("e1:end");
    const skPlane: PlaneDef = { origin: [0, 0, 10], xDir: [1, 0, 0], normal: [0, 0, 1] };
    const boss = (h: number): RFeature => ({ ...extrude("e2", rect(10, 10, 5, 5), 5, "join", skPlane), planeFace: { sketch: "sk2", face: top } } as unknown as RFeature);
    const feats: RFeature[] = [extrude("e1", rect(40, 20), 10), boss(5)];
    const r1 = await eng.rebuild(feats);
    expect(r1.errors).toEqual({});
    expect(r1.bodies[0].bbox[1][2]).toBeCloseTo(15, 6);
    // the base gets taller: the boss (and its sketch plane) moves up with the top face
    feats[0] = extrude("e1", rect(40, 20), 25);
    const r2 = await eng.rebuild(feats);
    expect(r2.errors).toEqual({});
    expect(r2.updatedRefs.sk2.plane!.origin[2]).toBeCloseTo(25, 6);
    expect(r2.updatedRefs.sk2.faces![0].name).toBe("e1:end");
    expect(r2.bodies[0].bbox[1][2]).toBeCloseTo(30, 6);
  }, 60000);

  it("reports a lost reference with candidates instead of silently re-attaching", async () => {
    const eng = new GeometryEngine();
    const b = (await eng.rebuild([extrude("e1", rect(40, 20), 10), hole("h1", 10, [[10, 10]])])).bodies[0];
    const wall = faceAt(b, [10, 10, 5]);
    expect(wall.name).toBe("h1:wall:p0");
    const feats: RFeature[] = [extrude("e1", rect(40, 20), 10), { id: "t1", type: "shell", faces: [wall], thickness: 1 }];
    // the hole was deleted: its wall is gone
    const r = await eng.rebuild(feats);
    expect(r.errors.t1).toMatch(/h1:wall:p0/);
    const br = r.brokenRefs!.t1[0];
    expect(br.reason).toBe("lost");
    expect(br.candidates.length).toBeGreaterThan(0);
  }, 60000);

  it("migrates old geometric references (no name) on the first rebuild", async () => {
    const eng = new GeometryEngine();
    const feats: RFeature[] = [extrude("e1", rect(40, 20), 10), { id: "f1", type: "fillet", edges: [{ mid: [40, 20, 5] }], radius: 2 }];
    const r = await eng.rebuild(feats);
    expect(r.errors).toEqual({});
    expect(r.updatedRefs.f1.edges![0].name).toBe("E[e1:side:L2 | e1:side:L3]");
  }, 60000);

  it("assembly mate face and PMI references survive a part edit", async () => {
    const eng = new GeometryEngine();
    const b = (await eng.rebuild([extrude("e1", rect(40, 20), 10), hole("h1", 10, [[10, 10]])])).bodies[0];
    const top = faceAt(b, [20, 10, 10], [0, 0, 1]);
    const wall = faceAt(b, [10, 10, 5]);
    // part edit: taller, longer, hole moved
    const r2 = await eng.rebuild([extrude("e1", rect(80, 20), 30), hole("h1", 30, [[60, 10]])]);
    const geo = geoFromRef({ comp: "c", geom: "plane", point: top.center, dir: top.normal, face: top, label: "" }, r2.bodies);
    expect(geo).not.toBeNull();
    expect(geo!.point[2]).toBeCloseTo(30, 6);
    const ax = geoFromRef({ comp: "c", geom: "axis", point: [10, 10, 0], dir: [0, 0, 1], face: wall, label: "" }, r2.bodies);
    expect(ax!.point[0]).toBeCloseTo(60, 6);
    const pmi = resolveRef(r2.bodies, { kind: "face", ref: wall }, 100);
    expect(pmi).not.toBeNull();
    expect(r2.bodies[pmi!.body].faceNames![pmi!.index]).toBe("h1:wall:p0");
  }, 60000);

  it("drawing dimension stays attached after an edit", async () => {
    const eng = new GeometryEngine();
    const spec = { dir: [0, 0, -1] as Vec3, xAxis: [1, 0, 0] as Vec3 };
    const r1 = await eng.rebuild([extrude("e1", rect(40, 20), 10), hole("h1", 10, [[10, 10]])]);
    const g1 = drawView(eng.bodies.map((shape, i) => ({ shape, tag: i })), spec);
    // circle of the hole and the right edge in the top view
    const refs = [
      { kind: "circle" as const, p: [10, -10] as P2, r: 2 },
      { kind: "line" as const, p: [40, 0] as P2, p2: [40, -20] as P2 },
    ];
    const attached: GRef[] = refs.map((r) => attachTopo(r, r1.bodies, spec) ?? r);
    expect(attached.every((r) => r.topo)).toBe(true);
    // the part grows and the hole moves: plain proximity would lose or mis-snap
    const r2 = await eng.rebuild([extrude("e1", rect(90, 20), 10), hole("h1", 10, [[70, 10]])]);
    const g2 = drawView(eng.bodies.map((shape, i) => ({ shape, tag: i })), spec);
    const after = attached.map((r) => {
      const want = expectedRef(r, r2.bodies, spec) ?? r;
      return resnap(g2, want, 0.5);
    });
    expect(after[0]?.p[0]).toBeCloseTo(70, 4);
    expect(after[1]?.p[0]).toBeCloseTo(90, 4);
    expect(g1.visible.length).toBeGreaterThan(0);
  }, 60000);
});

describe("reference repair", () => {
  it("writes the picked reference into the broken slot", async () => {
    const { applyRepair } = await import("../src/commands/repairRef");
    const e: EdgeRef = { mid: [1, 2, 3], name: "E[a | b]" };
    const f: FaceRef = { center: [0, 0, 1], normal: [0, 0, 1], name: "e1:end" };
    const doc = {
      features: [
        { id: "f1", type: "fillet", edges: [{ mid: [0, 0, 0] }, { mid: [9, 9, 9] }], radius: "1" },
        { id: "d1", type: "draft", faces: [{ center: [0, 0, 0], normal: [1, 0, 0] }], neutral: null, angle: "3", flip: false },
        { id: "p1", type: "pushpull", face: null, distance: "1" },
      ],
    } as never;
    expect(applyRepair(doc, "f1", { kind: "edge", slot: 1 }, e)).toBe(true);
    expect(applyRepair(doc, "d1", { kind: "face", slot: 1 }, f)).toBe(true);
    expect(applyRepair(doc, "p1", { kind: "face", slot: 0 }, f)).toBe(true);
    const fs = (doc as { features: { edges?: EdgeRef[]; neutral?: FaceRef; face?: FaceRef }[] }).features;
    expect(fs[0].edges![1].name).toBe("E[a | b]");
    expect(fs[1].neutral!.name).toBe("e1:end");
    expect(fs[2].face!.name).toBe("e1:end");
  });
});
