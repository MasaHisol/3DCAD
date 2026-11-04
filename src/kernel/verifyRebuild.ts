// Debug / verify mode of the incremental rebuild (stage 1.5 engine #3):
// compares an incremental result with a full rebuild from scratch (volume,
// face / edge counts, topology naming tables, errors). Enabled by
// GeometryEngine.verify (worker: VITE_VERIFY_REBUILD=1) and used by the tests.
import type { RebuildResult, RFeature } from "./protocol";

interface EngineLike {
  bodies: unknown[];
  massProps(): { volume: number };
}

export interface RebuildSignature {
  volume: number;
  bodies: { faces: number; edges: number; faceNames: string[]; edgeNames: string[] }[];
  errors: string[];
}

export function signature(eng: EngineLike, r: RebuildResult): RebuildSignature {
  return {
    volume: eng.bodies.length ? eng.massProps().volume : 0,
    bodies: [...r.bodies, ...(r.surfaces ?? [])].map((b) => ({ faces: b.faces.length, edges: b.edges.length, faceNames: b.faceNames ?? [], edgeNames: b.edgeNames ?? [] })),
    errors: Object.keys(r.errors).sort(),
  };
}

/** Differences between two signatures (empty = identical). */
export function compareSignatures(a: RebuildSignature, b: RebuildSignature, tol = 1e-6): string[] {
  const out: string[] = [];
  if (Math.abs(a.volume - b.volume) > tol * Math.max(1, Math.abs(b.volume))) out.push(`volume ${a.volume} != ${b.volume}`);
  if (a.bodies.length !== b.bodies.length) out.push(`bodies ${a.bodies.length} != ${b.bodies.length}`);
  a.bodies.forEach((x, i) => {
    const y = b.bodies[i];
    if (!y) return;
    if (x.faces !== y.faces) out.push(`body ${i}: faces ${x.faces} != ${y.faces}`);
    if (x.edges !== y.edges) out.push(`body ${i}: edges ${x.edges} != ${y.edges}`);
    if (JSON.stringify(x.faceNames) !== JSON.stringify(y.faceNames)) out.push(`body ${i}: face names differ`);
    if (JSON.stringify(x.edgeNames) !== JSON.stringify(y.edgeNames)) out.push(`body ${i}: edge names differ`);
  });
  if (a.errors.join() !== b.errors.join()) out.push(`errors ${a.errors} != ${b.errors}`);
  return out;
}

/** Rebuild `features` from scratch in a fresh engine and compare with the incremental result. */
export async function verifyAgainstFull(eng: EngineLike & { constructor: unknown }, features: RFeature[], r: RebuildResult): Promise<void> {
  const Ctor = eng.constructor as { new (): EngineLike & { rebuild(f: RFeature[]): Promise<RebuildResult>; dispose(): void }; verify: boolean };
  const prev = Ctor.verify;
  Ctor.verify = false;
  const full = new Ctor();
  try {
    const fr = await full.rebuild(features);
    const diff = compareSignatures(signature(eng, r), signature(full, fr));
    if (diff.length) throw new Error(`incremental rebuild differs from a full rebuild: ${diff.join("; ")}`);
  } finally {
    full.dispose();
    Ctor.verify = prev;
  }
}
