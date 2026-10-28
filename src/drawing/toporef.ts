// Drawing dimension attachments by persistent topology name.
// A dimension reference (GRef, 2D view coordinates) is linked to the 3D edge
// it was drawn on; after a model edit the named edge is projected again and the
// reference re-snaps to the segment at that position, instead of to whatever
// happens to lie near the old coordinates.

import type { Vec3 } from "../core/types";
import type { BodyMesh, ViewSpec } from "../kernel/protocol";
import { resolveNamed, type RefCandidate } from "../core/naming";
import type { GRef } from "./types";

type P2 = [number, number];
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const unit = (a: Vec3): Vec3 => {
  const l = Math.hypot(...a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const d2 = (a: P2, b: P2) => Math.hypot(a[0] - b[0], a[1] - b[1]);

function projector(spec: Pick<ViewSpec, "dir" | "xAxis">) {
  const dir = unit(spec.dir), x = unit(spec.xAxis), y = cross(dir, x);
  return { dir, to2: (p: Vec3): P2 => [dot(p, x), dot(p, y)] };
}

/** 2D reference an edge projects to, for the stored attachment kind. */
function projectEdge(b: BodyMesh, i: number, at: NonNullable<GRef["topo"]>["at"], spec: Pick<ViewSpec, "dir" | "xAxis">): GRef | null {
  const { dir, to2 } = projector(spec);
  const e = b.edges[i];
  if (at === "line") return e.type === "LINE" ? { kind: "line", p: to2(e.a), p2: to2(e.b) } : null;
  if (at === "center" || at === "circle") {
    if (!e.axis || Math.abs(Math.abs(dot(unit(e.axis.dir), dir)) - 1) > 1e-6) return null;
    return at === "circle" ? { kind: "circle", p: to2(e.axis.origin), r: e.axis.radius } : { kind: "point", p: to2(e.axis.origin) };
  }
  return { kind: "point", p: to2(at === "a" ? e.a : e.b) };
}

/**
 * Find the 3D edge a 2D reference was taken from (current geometry) and return
 * the reference with its topology attachment, or null when nothing matches.
 */
export function attachTopo(r: GRef, bodies: BodyMesh[], spec: Pick<ViewSpec, "dir" | "xAxis">, tol = 1e-3): GRef | null {
  const { dir } = projector(spec);
  let best: { topo: NonNullable<GRef["topo"]>; depth: number } | null = null;
  const ats: NonNullable<GRef["topo"]>["at"][] = r.kind === "line" ? ["line"] : r.kind === "circle" ? ["circle"] : ["center", "a", "b"];
  bodies.forEach((b, bi) => {
    const names = b.edgeNames;
    if (!names) return;
    b.edges.forEach((e, i) => {
      for (const at of ats) {
        const q = projectEdge(b, i, at, spec);
        if (!q) continue;
        let ok = d2(q.p, r.p) < tol;
        if (r.kind === "line") ok = (ok && d2(q.p2!, r.p2!) < tol) || (d2(q.p, r.p2!) < tol && d2(q.p2!, r.p) < tol);
        if (r.kind === "circle") ok = ok && Math.abs((q.r ?? 0) - (r.r ?? 0)) < tol;
        if (!ok) continue;
        // nearest to the viewer wins (the visible one of coincident projections)
        const depth = -dot(e.mid, dir);
        if (!best || depth > best.depth + 1e-9) best = { topo: { name: names[i], at, body: bi }, depth };
      }
    });
  });
  const f = best as { topo: NonNullable<GRef["topo"]> } | null;
  return f ? { ...r, topo: f.topo } : null;
}

/** Where an attached reference lies on the current geometry (null: not attached or edge lost). */
export function expectedRef(r: GRef, bodies: BodyMesh[], spec: Pick<ViewSpec, "dir" | "xAxis">): GRef | null {
  if (!r.topo) return null;
  const cands: RefCandidate[] = [];
  const proj: (GRef | null)[][] = bodies.map((b) => b.edges.map((_e, i) => projectEdge(b, i, r.topo!.at, spec)));
  bodies.forEach((b, bi) =>
    b.edges.forEach((_e, index) => {
      const q = proj[bi][index];
      cands.push({ body: bi, index, name: b.edgeNames?.[index], score: q ? d2(q.p, r.p) : 1e9 });
    }),
  );
  const res = resolveNamed("edge", r.topo.name, cands, 1e8);
  if ("broken" in res || res.ok.method === "geometry") return null;
  const q = proj[res.ok.body][res.ok.index];
  if (!q) return null;
  if (r.kind === "line" && q.kind === "line" && d2(q.p, r.p) + d2(q.p2!, r.p2!) > d2(q.p, r.p2!) + d2(q.p2!, r.p)) [q.p, q.p2] = [q.p2!, q.p];
  return { ...r, p: q.p, ...(q.p2 ? { p2: q.p2 } : {}), ...(q.r !== undefined ? { r: q.r } : {}), topo: { ...r.topo, name: res.ok.name ?? r.topo.name } };
}
