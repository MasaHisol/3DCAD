// Revision management (Inventor 改訂表 / Vault light): named snapshots of
// the model definition stored in the part file, with change lists between
// revisions and restore.

import type { Feature, Material, Parameter, PartDocument } from "./types";

export interface RevisionSnapshot {
  params: Parameter[];
  features: Feature[];
  endOfPart: number;
  material: Material;
}

export interface Revision {
  rev: string;
  date: string;
  author: string;
  note: string;
  snapshot: RevisionSnapshot;
}

/** A → B … Z → AA → AB (I and O skipped as in JIS / ASME practice). */
export function nextRev(prev?: string): string {
  const L = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  if (!prev) return "A";
  const digits = [...prev].map((c) => L.indexOf(c));
  if (digits.some((d) => d < 0)) return "A";
  let i = digits.length - 1;
  while (i >= 0 && digits[i] === L.length - 1) digits[i--] = 0;
  if (i < 0) digits.unshift(0);
  else digits[i]++;
  return digits.map((d) => L[d]).join("");
}

export function snapshotOf(doc: PartDocument): RevisionSnapshot {
  return JSON.parse(JSON.stringify({ params: doc.params, features: doc.features, endOfPart: doc.endOfPart, material: doc.material }));
}

/** Human-readable change list from `a` to `b`. */
export function diffSnapshots(a: RevisionSnapshot, b: RevisionSnapshot): string[] {
  const out: string[] = [];
  const fa = new Map(a.features.map((f) => [f.id, f])), fb = new Map(b.features.map((f) => [f.id, f]));
  // parameters owned by a feature are reported with it
  const pa = new Map(a.params.map((p) => [p.name, p])), pb = new Map(b.params.map((p) => [p.name, p]));
  for (const [n, p] of pb) {
    const o = pa.get(n);
    if (!o) {
      if (!p.owner) out.push(`パラメータ追加: ${n} = ${p.expr}`);
    } else if (o.expr !== p.expr) out.push(`寸法変更: ${n} ${o.expr} → ${p.expr}`);
  }
  for (const [n, p] of pa) if (!pb.has(n) && !p.owner) out.push(`パラメータ削除: ${n}`);
  for (const [id, f] of fb) {
    const o = fa.get(id);
    if (!o) out.push(`フィーチャ追加: ${f.name}`);
    else {
      if (o.name !== f.name) out.push(`名前変更: ${o.name} → ${f.name}`);
      const strip = (x: Feature) => JSON.stringify({ ...x, name: "" });
      if (strip(o) !== strip(f)) out.push(`フィーチャ変更: ${f.name}`);
    }
  }
  for (const [id, f] of fa) if (!fb.has(id)) out.push(`フィーチャ削除: ${f.name}`);
  const order = (s: RevisionSnapshot) => s.features.map((f) => f.id).filter((id) => fa.has(id) && fb.has(id)).join();
  if (order(a) !== order(b)) out.push("フィーチャの順序を変更");
  if (a.endOfPart !== b.endOfPart) out.push("パーツの終わりを移動");
  if (a.material.name !== b.material.name) out.push(`材料変更: ${a.material.name} → ${b.material.name}`);
  return out;
}
