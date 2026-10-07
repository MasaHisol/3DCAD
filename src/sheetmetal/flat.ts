// Flat pattern of a sheet metal part, and its DXF / SVG output.

import { pointInRegion } from "../sketch/profiles";
import type { Resolved } from "../core/resolve";
import type { FlangeFeature, PartDocument, SheetFaceFeature, SketchFeature, Vec2 } from "../core/types";
import { evalWith } from "../core/params";
import { flatPattern, legLength, matchEdge, outerEdges, sheetStyle, type FlatPattern, type SheetEdge } from "./sheet";

/** Flat pattern of the (first) sheet metal face and its flanges, or null. */
export function sheetFlat(doc: PartDocument, res: Resolved): FlatPattern | null {
  if (!doc.sheetMetal) return null;
  const active = doc.features.slice(0, doc.endOfPart).filter((f) => !f.suppressed);
  const face = active.find((f): f is SheetFaceFeature => f.type === "sheetFace");
  if (!face) return null;
  const sk = doc.features.find((f) => f.id === face.sketch) as SketchFeature | undefined;
  const st = res.sketches.get(face.sketch);
  if (!sk || !st) return null;
  const sample = face.profilePts?.[0];
  const region = (sample && st.regions.find((r) => pointInRegion(sample, r))) ?? st.regions[face.profiles[0]];
  if (!region) return null;
  const s = sheetStyle(doc, res.values);
  const edges = outerEdges(region.outer);
  const flanges: { edge: SheetEdge; angle: number; length: number; down: boolean }[] = [];
  for (const f of active) {
    if (f.type !== "flange" || (f as FlangeFeature).base !== face.id || res.errors[f.id]) continue;
    const fl = f as FlangeFeature;
    const angle = evalWith(res.values, fl.angle);
    const leg = legLength(evalWith(res.values, fl.height), angle, s);
    for (const p of fl.edges) {
      const e = matchEdge(edges, p, Math.max(1e-3, s.thickness));
      if (e) flanges.push({ edge: e, angle, length: leg, down: fl.down });
    }
  }
  return flatPattern({ outerPoly: region.outerPoly, holePolys: region.holePolys, flanges }, s);
}

const f3 = (n: number) => (+n.toFixed(4)).toString();

/** DXF (R12): outlines on layer OUTER, bend lines on BEND_UP / BEND_DOWN (laser / punch friendly). */
export function flatToDxf(fp: FlatPattern): string {
  const out: string[] = ["0", "SECTION", "2", "ENTITIES"];
  const line = (a: Vec2, b: Vec2, layer: string) => out.push("0", "LINE", "8", layer, "10", f3(a[0]), "20", f3(a[1]), "30", "0", "11", f3(b[0]), "21", f3(b[1]), "31", "0");
  for (const pl of fp.outlines) for (let i = 0; i < pl.length; i++) line(pl[i], pl[(i + 1) % pl.length], "OUTER");
  for (const b of fp.bends) line(b.a, b.b, b.up ? "BEND_UP" : "BEND_DOWN");
  out.push("0", "ENDSEC", "0", "EOF");
  return out.join("\n");
}

export function flatToSvg(fp: FlatPattern, margin = 10): string {
  const [x0, y0, x1, y1] = fp.bounds;
  const w = x1 - x0 + margin * 2, h = y1 - y0 + margin * 2;
  // y up in the model -> flip for SVG
  const P = (p: Vec2) => `${f3(p[0] - x0 + margin)} ${f3(y1 - p[1] + margin)}`;
  const outline = fp.outlines.map((pl) => "M" + pl.map(P).join("L") + "Z").join("");
  const bends = fp.bends.map((b) => `M${P(b.a)}L${P(b.b)}`).join("");
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f3(w)} ${f3(h)}" width="${f3(w)}mm" height="${f3(h)}mm">` +
    `<path d="${outline}" fill="#e9eef5" fill-rule="nonzero" stroke="#000" stroke-width="0.35"/>` +
    `<path d="${bends}" stroke="#d33" stroke-width="0.25" stroke-dasharray="4 1 1 1" fill="none"/>` +
    `</svg>`
  );
}
