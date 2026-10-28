// Persistent topological naming (形状の参照名) — kernel-independent part.
//
// Every face / edge of a rebuilt body carries a name derived from its history
// (see src/kernel/naming.ts for how names are generated):
//   face:  "<feature>:<role>"              e.g. "e1:side:L3", "e1:end", "h1:wall:p0"
//          "<face>@<pattern>.<k>"          copy k of a patterned face
//          "<feature>:blend(<edge>)"       fillet / chamfer face of an edge
//          "<feature>:gen(<a>,<b>,...)"    new face named by its inherited neighbours
//          suffix "~k"                     k-th of several faces with the same name
//   edge:  "E[<face> | <face>]"            the faces the edge separates (sorted)
//
// References (EdgeRef / FaceRef) store the name next to the old geometric
// signature. Resolution tries, in order: exact name, name without the "~k"
// suffix, partial name (edge sharing a face / face from the same feature),
// then the geometric signature alone. Only a lost or ambiguous reference is
// reported as broken, together with candidates the user can pick from.

export const NAME_SEP = " | ";

/** Name without the duplicate suffix "~k". */
export function baseName(n: string): string {
  return n.replace(/~\d+$/, "");
}

/** Split on `sep` at bracket depth 0. */
function splitTop(s: string, sep: string): string[] {
  const out: string[] = [];
  let depth = 0, start = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === "(" || c === "[") depth++;
    else if (c === ")" || c === "]") depth--;
    else if (depth === 0 && s.startsWith(sep, i)) {
      out.push(s.slice(start, i));
      start = i + sep.length;
      i += sep.length - 1;
    }
  }
  out.push(s.slice(start));
  return out;
}

export function edgeName(faceNames: string[]): string {
  return `E[${[...faceNames].sort().join(NAME_SEP)}]`;
}

/** Face names an edge name refers to (empty when not an edge name). */
export function edgeFaces(n: string): string[] {
  const b = baseName(n);
  if (!b.startsWith("E[") || !b.endsWith("]")) return [];
  return splitTop(b.slice(2, -1), NAME_SEP);
}

/** Feature id that created a face name ("e1:side:L3" -> "e1"). */
export function nameFeature(n: string): string {
  const i = n.indexOf(":");
  return i > 0 ? n.slice(0, i) : n;
}

export type ResolveMethod = "name" | "name-base" | "name-partial" | "geometry";

export interface RefCandidate {
  body: number;
  index: number;
  name?: string;
  /** Geometric distance to the stored signature (smaller = better, model units). */
  score: number;
}

export interface RefResolution {
  body: number;
  index: number;
  name?: string;
  method: ResolveMethod;
  /** 1 = exact name, lower for weaker evidence. */
  confidence: number;
}

export interface BrokenRef {
  kind: "face" | "edge";
  /** Index of the reference in the feature's list. */
  slot: number;
  name?: string;
  reason: "lost" | "ambiguous";
  message: string;
  /** Best candidates (at most 5), best first. */
  candidates: RefCandidate[];
}

export type ResolveOutcome = { ok: RefResolution } | { broken: Omit<BrokenRef, "slot"> };

/**
 * Resolve one stored reference among the current candidates.
 * `cands` must list every face (or edge) of every body with its geometric score.
 * `limit` is the largest acceptable geometric score; `taken` excludes elements
 * already used by earlier references of the same feature.
 */
export function resolveNamed(kind: "face" | "edge", refName: string | undefined, cands: RefCandidate[], limit: number, taken?: Set<string>): ResolveOutcome {
  const free = taken ? cands.filter((c) => !taken.has(`${c.body}:${c.index}`)) : cands;
  const best = (list: RefCandidate[]) => list.reduce<RefCandidate | null>((b, c) => (!b || c.score < b.score ? c : b), null);
  const top = (list: RefCandidate[]) => [...list].sort((a, b) => a.score - b.score).slice(0, 5);
  const label = kind === "face" ? "面" : "エッジ";
  const ok = (c: RefCandidate, method: ResolveMethod, confidence: number): ResolveOutcome => ({ ok: { body: c.body, index: c.index, name: c.name, method, confidence } });
  if (refName) {
    const exact = free.filter((c) => c.name === refName);
    if (exact.length === 1) return ok(exact[0], "name", 1);
    if (exact.length > 1) {
      // several bodies may carry the same history (e.g. split bodies): geometry decides
      const b = best(exact)!;
      return ok(b, "name", 0.9);
    }
    const base = baseName(refName);
    const sameBase = free.filter((c) => c.name && baseName(c.name) === base);
    if (sameBase.length) {
      const b = best(sameBase)!;
      if (b.score <= limit * 2) return ok(b, "name-base", sameBase.length === 1 ? 0.95 : 0.8);
    }
    // partial: an edge still separating one of its faces, a face from the same feature
    let partial: RefCandidate[] = [];
    if (kind === "edge") {
      const want = edgeFaces(refName).map(baseName);
      const overlap = (c: RefCandidate) => (c.name ? edgeFaces(c.name).map(baseName).filter((f) => want.includes(f)).length : 0);
      const two = free.filter((c) => overlap(c) >= 2);
      partial = two.length ? two : free.filter((c) => overlap(c) === 1);
    } else {
      const fid = nameFeature(refName);
      partial = free.filter((c) => c.name && nameFeature(c.name) === fid);
    }
    if (partial.length) {
      const sorted = top(partial);
      const b = sorted[0];
      if (b.score <= limit) {
        const second = sorted[1];
        if (second && Math.abs(second.score - b.score) < limit * 1e-4 && second.score <= limit)
          return {
            broken: { kind, name: refName, reason: "ambiguous", message: `参照${label} "${refName}" の候補が複数あります。候補から選択してください`, candidates: sorted },
          };
        return ok(b, "name-partial", 0.6);
      }
    }
  }
  const b = best(free);
  if (!b || b.score > limit)
    return {
      broken: {
        kind,
        name: refName,
        reason: "lost",
        message: refName ? `参照${label} "${refName}" が見つかりません (上流の編集で消えました)。候補から選択し直してください` : `参照${label}が見つかりません (形状が大きく変化しました)`,
        candidates: top(free),
      },
    };
  const conf = Math.max(0.1, 0.5 * (1 - b.score / (limit || 1)));
  return ok(b, "geometry", conf);
}

/** Error thrown by the kernel when a feature reference cannot be resolved. */
export class RefBrokenError extends Error {
  constructor(public broken: BrokenRef[]) {
    super(broken[0]?.message ?? "参照が見つかりません");
  }
}

/** Short, human-readable form of a topology name for the UI. */
export function displayName(n: string | undefined): string {
  if (!n) return "(名前なし)";
  return n.length > 60 ? n.slice(0, 57) + "…" : n;
}
