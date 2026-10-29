// Measurement annotations: capture of the references when a measurement is
// saved, re-resolution after a rebuild (through the persistent topology names,
// src/core/naming.ts via mbd/resolve.ts), the kernel request that re-measures
// a note and the update of its value. Pure (no DOM, no kernel).

import type { Vec3 } from "../core/types";
import type { BodyMesh, PickRef } from "../kernel/protocol";
import { bodiesBox, resolveRef, vec, type ResolvedRef } from "../mbd/resolve";
import type { PmiRef } from "../mbd/pmi";
import { fitPitchCircle } from "./pcd";
import type { DistanceResult, HoleInfo, MeasureNote, MeasureNoteKind, MeasureOp, PropsResult } from "./types";

export const NOTE_LABELS: Record<MeasureNoteKind, string> = {
  distance: "距離",
  clearance: "クリアランス",
  angle: "角度",
  diameter: "直径",
  hole: "穴",
  pcd: "ピッチ円",
  radius: "半径",
  length: "長さ",
  area: "面積",
  volume: "体積",
  thickness: "肉厚",
};

const normInBox = (p: Vec3, [lo, hi]: [Vec3, Vec3]): Vec3 => [0, 1, 2].map((i) => (hi[i] - lo[i] > 1e-9 ? (p[i] - lo[i]) / (hi[i] - lo[i]) : 0.5)) as Vec3;

/** Persistent reference (with topology name) to a face / edge of the current bodies. */
export function captureRef(bodies: BodyMesh[], p: { body: number; kind: "face" | "edge"; index: number }): PmiRef | null {
  const b = bodies[p.body];
  if (!b) return null;
  if (p.kind === "face") {
    const f = b.faces[p.index];
    if (!f) return null;
    const name = b.faceNames?.[p.index];
    return { kind: "face", ref: { center: f.center, normal: f.normal, n: normInBox(f.center, b.bbox), type: f.type, ...(name ? { name } : {}) } };
  }
  const e = b.edges[p.index];
  if (!e) return null;
  const name = b.edgeNames?.[p.index];
  return { kind: "edge", ref: { mid: e.mid, a: e.a, b: e.b, n: normInBox(e.mid, b.bbox), type: e.type, ...(name ? { name } : {}) } };
}

export interface NoteResolution {
  ok: boolean;
  refs: ResolvedRef[];
  /** Index of the first reference that could not be resolved. */
  lost?: number;
}

/** Re-attach a note's references to rebuilt bodies; updates `note.refs` (tracking) and `note.broken`. */
export function resolveNote(note: MeasureNote, bodies: BodyMesh[]): NoteResolution {
  const box = bodiesBox(bodies);
  const diag = box ? Math.max(1, vec.dist(box[0], box[1])) : 100;
  const refs: ResolvedRef[] = [];
  for (let i = 0; i < note.refs.length; i++) {
    const r = resolveRef(bodies, note.refs[i], diag);
    if (!r) {
      note.broken = true;
      return { ok: false, refs, lost: i };
    }
    refs.push(r);
  }
  if (note.bodies?.some((b) => !bodies[b])) {
    note.broken = true;
    return { ok: false, refs };
  }
  // thickness probe: move the point with its face
  if (note.kind === "thickness" && refs[0] && note.refs[0].kind === "face") {
    const d = vec.sub(refs[0].point, note.refs[0].ref.center);
    note.points = note.points.map((p, i) => (i === 0 ? vec.add(p, d) : p));
  }
  refs.forEach((r, i) => (note.refs[i] = r.updated));
  delete note.broken;
  return { ok: true, refs };
}

const pick = (r: ResolvedRef): PickRef => ({ body: r.body, kind: r.kind, index: r.index, point: r.point });

/** Kernel request re-measuring a resolved note (null: nothing to re-measure). */
export function noteRequest(note: MeasureNote, res: NoteResolution): MeasureOp | null {
  if (!res.ok) return null;
  const r = res.refs;
  switch (note.kind) {
    case "hole":
    case "diameter":
      return r[0] ? { op: "hole", ref: pick(r[0]) } : null;
    case "pcd":
      return r.length >= 3 ? { op: "holes", refs: r.map(pick) } : null;
    case "distance":
    case "clearance":
      if (r.length === 2) return { op: "distance", a: pick(r[0]), b: pick(r[1]) };
      if (note.bodies?.length === 2) return { op: "distance", a: { kind: "body", body: note.bodies[0] }, b: { kind: "body", body: note.bodies[1] } };
      return null;
    case "angle":
      return r.length === 2 ? { op: "props", refs: [pick(r[0]), pick(r[1])] } : null;
    case "radius":
    case "length":
    case "area":
      return r[0] ? { op: "props", refs: [pick(r[0])] } : null;
    case "volume":
      return note.bodies?.length ? { op: "props", refs: [{ kind: "body", body: note.bodies[0] }] } : null;
    case "thickness": {
      const f = r[0];
      if (!f || !f.normal) return null;
      return { op: "thicknessAt", body: f.body, point: note.points[0], normal: f.normal };
    }
  }
}

/** Apply a kernel result to the note's value / drawn points. Returns true when something changed. */
export function applyNoteResult(note: MeasureNote, result: unknown): boolean {
  const before = JSON.stringify([note.value, note.points, note.extra]);
  switch (note.kind) {
    case "hole":
    case "diameter": {
      const h = result as HoleInfo;
      note.value = h.diameter;
      note.extra = { ...(note.extra ?? {}), depth: h.depth };
      if (h.counterbore) Object.assign(note.extra, { cbDiameter: h.counterbore.diameter, cbDepth: h.counterbore.depth });
      if (h.countersink) Object.assign(note.extra, { csDiameter: h.countersink.diameter, csAngle: h.countersink.angle });
      note.points = [h.center, vec.add(h.center, vec.mul(h.axis, h.through ? h.depth : Math.max(h.depth, 1e-3)))];
      break;
    }
    case "pcd": {
      const hs = result as HoleInfo[];
      const fit = fitPitchCircle(hs.map((h) => h.center), hs[0].axis);
      note.value = fit.diameter;
      note.extra = { holes: hs.length, angularDeviation: fit.angularDeviation, radialDeviation: fit.radialDeviation };
      note.points = [fit.center, ...hs.map((h) => h.center)];
      break;
    }
    case "distance":
    case "clearance": {
      const d = result as DistanceResult;
      note.value = d.distance;
      if (d.pa && d.pb) note.points = [d.pa, d.pb];
      break;
    }
    case "angle": {
      const p = result as PropsResult;
      if (p.angle !== undefined) note.value = p.angle;
      break;
    }
    case "radius":
    case "length":
    case "area": {
      const it = (result as PropsResult).items[0];
      const v = note.kind === "radius" ? it.radius : note.kind === "length" ? it.length : it.area;
      if (v !== undefined) note.value = v;
      if (it.point) note.points = [it.point];
      break;
    }
    case "volume": {
      const it = (result as PropsResult).items[0];
      if (it.volume !== undefined) note.value = it.volume;
      if (it.centroid) note.points = [it.centroid];
      break;
    }
    case "thickness":
      if (Number.isFinite(result as number)) note.value = result as number;
      break;
  }
  return before !== JSON.stringify([note.value, note.points, note.extra]);
}

/** Notes stored in a document (validated: malformed entries dropped). */
export function cleanNotes(raw: unknown): MeasureNote[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  return raw.filter(
    (x): x is MeasureNote =>
      !!x && typeof x === "object" && typeof (x as MeasureNote).id === "string" && typeof (x as MeasureNote).kind === "string" && (x as MeasureNote).kind in NOTE_LABELS && Array.isArray((x as MeasureNote).refs) && Array.isArray((x as MeasureNote).points),
  );
}
