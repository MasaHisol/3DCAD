// Repair of broken topology references (形状の参照名エンジン): the candidates
// proposed by the kernel are highlighted on the model as it was just before the
// feature; clicking a face / edge replaces the broken reference.

import type { App } from "../app";
import type { EdgeRef, FaceRef, Feature, PartDocument, SketchFeature } from "../core/types";
import { displayName, type BrokenRef } from "../core/naming";
import { toast } from "../ui/dom";
import type { Pick, ToolHandler } from "../viewer/viewport";
import type { Command } from "./command";

/** Write a picked reference into the slot of a feature (returns false when the slot does not exist). */
export function applyRepair(doc: PartDocument, featureId: string, br: Pick_<BrokenRef, "kind" | "slot">, ref: EdgeRef | FaceRef): boolean {
  const f = doc.features.find((x) => x.id === featureId) as (Feature & { edges?: EdgeRef[]; faces?: FaceRef[]; face?: FaceRef | null; neutral?: FaceRef | null; sketch?: string; tool?: { kind: string; face?: FaceRef } }) | undefined;
  if (!f) return false;
  if (br.kind === "edge") {
    if (!f.edges || br.slot >= f.edges.length) return false;
    f.edges[br.slot] = ref as EdgeRef;
    return true;
  }
  const face = ref as FaceRef;
  if (Array.isArray(f.faces)) {
    if (br.slot < f.faces.length) f.faces[br.slot] = face;
    else if ("neutral" in f) f.neutral = face;
    else return false;
    return true;
  }
  if ("face" in f) {
    f.face = face;
    return true;
  }
  if (f.tool?.kind === "face") {
    f.tool.face = face;
    return true;
  }
  // a feature on a sketch placed on a model face
  const sk = f.sketch ? (doc.features.find((x) => x.id === f.sketch) as SketchFeature | undefined) : undefined;
  if (sk?.faceRef) {
    sk.faceRef = face;
    if (face.normal && face.center) sk.plane = { ...sk.plane, origin: face.center, normal: face.normal };
    return true;
  }
  return false;
}
type Pick_<T, K extends keyof T> = { [P in K]: T[P] };

export class RepairRefCommand implements Command {
  readonly id = "repairRef";
  handler: ToolHandler;
  constructor(
    private app: App,
    private featureId: string,
  ) {
    this.handler = {
      cursor: "pointer",
      onPointerMove: (e, vp) => vp.setHover(vp.pick(e, new Set([this.current()?.kind ?? "face"]))),
      onPointerDown: (e, vp) => {
        if (e.button !== 0) return;
        const br = this.current();
        if (!br) return;
        const p = vp.pick(e, new Set([br.kind]));
        if (p) this.repair(br, p);
      },
    };
  }

  current(): BrokenRef | undefined {
    return this.app.brokenRefs[this.featureId]?.[0];
  }

  captureBefore() {
    return this.featureId;
  }

  /** Highlight the candidates of the first broken reference. */
  show() {
    const br = this.current();
    if (!br) {
      toast("参照はすべて修復されました", "info");
      this.app.finishCommand(this, true);
      return;
    }
    this.app.vp.pickKinds = new Set([br.kind]);
    const picks: Pick[] = br.candidates.map((c) => {
      const b = this.app.pickBodies[c.body];
      const point = br.kind === "face" ? b?.faces[c.index]?.center : b?.edges[c.index]?.mid;
      return { kind: br.kind, body: c.body, index: c.index, point: point ?? [0, 0, 0] };
    });
    this.app.vp.setSelection(picks);
    const names = br.candidates.slice(0, 3).map((c) => displayName(c.name)).join(" / ");
    this.app.status(`${br.message} — 候補 (ハイライト): ${names}。置き換える${br.kind === "face" ? "面" : "エッジ"}をクリック (Esc で中止)`);
  }

  private repair(br: BrokenRef, p: Pick) {
    const ref = br.kind === "face" ? this.app.faceRef(p) : this.app.edgeRef(p);
    if (!ref) return;
    let ok = false;
    this.app.store.mutate("参照の修復", (d) => (ok = applyRepair(d, this.featureId, br, ref)));
    if (!ok) toast("このフィーチャの参照は置き換えられません", "warn");
  }

  onRegen() {
    this.show();
  }
  ok() {}
  cancel() {}
}
