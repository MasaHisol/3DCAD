// File validation and repair on open (parts .3dcp, assemblies .3dca, autosave).
// Damaged or older files are normalised where it is safe (missing optional
// fields, dangling references) and refused with a clear message where it is
// not (wrong format, unknown feature types from a newer version).

import type { AssemblyDocument } from "../assembly/types";
import { FEATURE_LABELS, MATERIALS } from "./document";
import type { PartDocument } from "./types";
import { cleanPmi } from "../mbd/pmi";

export const FILE_VERSION = 1;

export interface Checked<T> {
  doc: T;
  /** Repairs that were applied (shown to the user). */
  warnings: string[];
}

const isObj = (x: unknown): x is Record<string, unknown> => !!x && typeof x === "object" && !Array.isArray(x);
const finite = (a: unknown, n: number) => Array.isArray(a) && a.length === n && a.every((x) => typeof x === "number" && Number.isFinite(x));

export function validatePart(raw: unknown, where = "パーツ"): Checked<PartDocument> {
  if (!isObj(raw) || raw.format !== "3dcad-part") throw new Error(`${where}: 3DCAD のパーツ ファイルではありません`);
  const warnings: string[] = [];
  if (typeof raw.version === "number" && raw.version > FILE_VERSION) warnings.push(`新しいバージョン (形式 ${raw.version}) で保存されたファイルです。一部の情報が失われる可能性があります`);
  const doc = raw as unknown as PartDocument;
  if (typeof doc.name !== "string" || !doc.name) doc.name = "パーツ";
  if (!Array.isArray(doc.features)) throw new Error(`${where}: フィーチャの一覧がありません (ファイルが壊れています)`);
  if (!Array.isArray(doc.params)) (doc.params = []), warnings.push("パラメータ一覧がなかったため空にしました");
  if (!isObj(doc.iprops)) doc.iprops = {};
  if (!isObj(doc.material) || typeof doc.material.density !== "number") (doc.material = { ...MATERIALS[0] }), warnings.push("材料が不正だったため既定の材料にしました");
  doc.units = "mm";
  // features: known types, unique ids
  const known = new Set(Object.keys(FEATURE_LABELS));
  const unknown = doc.features.filter((f) => !isObj(f) || !known.has(String((f as { type?: unknown }).type)));
  if (unknown.length) {
    const types = [...new Set(unknown.map((f) => String((f as { type?: unknown })?.type)))].join(", ");
    throw new Error(`${where}: このバージョンでは開けないフィーチャがあります (${types})。アプリを更新してください`);
  }
  const seen = new Set<string>();
  for (const f of doc.features) {
    if (typeof f.id !== "string" || !f.id || seen.has(f.id)) {
      const old = f.id;
      f.id = `fx${Math.random().toString(36).slice(2, 10)}`;
      warnings.push(`フィーチャ ID の重複を修復しました (${old || "なし"} → ${f.id})`);
    }
    seen.add(f.id);
    if (typeof f.name !== "string" || !f.name) f.name = FEATURE_LABELS[f.type];
  }
  if (typeof doc.endOfPart !== "number" || !Number.isInteger(doc.endOfPart) || doc.endOfPart < 0 || doc.endOfPart > doc.features.length) {
    doc.endOfPart = doc.features.length;
    warnings.push("「パーツの終わり」の位置を修復しました");
  }
  // parameters: names and expressions are strings, names unique
  const names = new Set<string>();
  doc.params = doc.params.filter((p) => {
    if (!isObj(p) || typeof p.name !== "string" || typeof p.expr !== "string") return (warnings.push("不正なパラメータを削除しました"), false);
    if (names.has(p.name)) return (warnings.push(`重複したパラメータ ${p.name} を削除しました`), false);
    names.add(p.name);
    if (p.kind !== "model" && p.kind !== "user") p.kind = "user";
    return true;
  });
  // features that reference sketches / other features that do not exist
  const ids = new Set(doc.features.map((f) => f.id));
  for (const f of doc.features) {
    const r = f as unknown as { sketch?: string; path?: string; sketches?: string[] };
    const missing = [r.sketch, r.path && r.path !== "3d" ? r.path : undefined, ...(r.sketches ?? [])].filter((x): x is string => !!x && !ids.has(x));
    if (missing.length) warnings.push(`${f.name}: 参照先のスケッチが見つかりません (再定義が必要です)`);
  }
  if (!Array.isArray(doc.revisions)) delete doc.revisions;
  warnings.push(...cleanPmi(doc));
  return { doc, warnings };
}

export function validateAssembly(raw: unknown): Checked<AssemblyDocument> {
  if (!isObj(raw) || raw.format !== "3dcad-assembly") throw new Error("3DCAD のアセンブリ ファイルではありません");
  const warnings: string[] = [];
  if (typeof raw.version === "number" && raw.version > FILE_VERSION) warnings.push(`新しいバージョン (形式 ${raw.version}) で保存されたファイルです`);
  const doc = raw as unknown as AssemblyDocument;
  if (!Array.isArray(doc.parts) || !Array.isArray(doc.components)) throw new Error("アセンブリ: 部品の一覧がありません (ファイルが壊れています)");
  if (!Array.isArray(doc.constraints)) doc.constraints = [];
  if (!Array.isArray(doc.params)) doc.params = [];
  if (!isObj(doc.iprops)) doc.iprops = {};
  if (typeof doc.name !== "string" || !doc.name) doc.name = "アセンブリ";
  // embedded parts
  doc.parts = doc.parts.filter((p) => {
    if (!isObj(p) || typeof p.id !== "string") return (warnings.push("不正な部品定義を削除しました"), false);
    if (p.kind === "part") {
      try {
        const r = validatePart(p.doc, `部品 ${p.name}`);
        p.doc = r.doc;
        warnings.push(...r.warnings.map((w) => `${p.name}: ${w}`));
      } catch (e) {
        warnings.push((e as Error).message);
        return false;
      }
    } else if (p.kind === "step" && typeof p.step !== "string") return (warnings.push(`${p.name}: STEP データがないため削除しました`), false);
    return true;
  });
  const partIds = new Set(doc.parts.map((p) => p.id));
  const IDENT = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  doc.components = doc.components.filter((c) => {
    if (!isObj(c) || !partIds.has(c.partId)) return (warnings.push(`部品が見つからないコンポーネント ${isObj(c) ? c.name : "?"} を削除しました`), false);
    if (!finite(c.matrix, 16)) (c.matrix = IDENT.slice()), warnings.push(`${c.name}: 位置が不正だったため原点に戻しました`);
    return true;
  });
  const compIds = new Set(doc.components.map((c) => c.id));
  const nCons = doc.constraints.length;
  doc.constraints = doc.constraints.filter((c) => isObj(c) && compIds.has(c.a?.comp) && compIds.has(c.b?.comp) && finite(c.a.point, 3) && finite(c.b.point, 3));
  if (doc.constraints.length < nCons) warnings.push(`参照先のない拘束 ${nCons - doc.constraints.length} 個を削除しました`);
  if (doc.patterns) {
    doc.patterns = doc.patterns.filter((p) => compIds.has(p.source));
    const pids = new Set(doc.patterns.map((p) => p.id));
    for (const c of doc.components) if (c.patternOf && !pids.has(c.patternOf.pattern)) delete c.patternOf;
  }
  if (doc.components.length && !doc.components.some((c) => c.grounded)) {
    doc.components[0].grounded = true;
    warnings.push("接地されたコンポーネントがなかったため、最初のコンポーネントを接地しました");
  }
  return { doc, warnings };
}
