// Rule engine (Inventor iLogic equivalent).
//
// Rules are short JavaScript snippets in which the document parameters are
// plain variables:
//
//   if (幅 > 100) 穴数 = 6; else 穴数 = 4;
//   suppress("フィレット1", 厚さ < 3);
//   iprop("説明", `ブラケット W${幅}`);
//
// A rule never touches the document directly: it returns a list of changes
// that the application applies as one undo step. Rules run inside a worker
// without network access (see worker.ts).

export type RuleTrigger = "manual" | "paramChange" | "beforeSave";

export interface Rule {
  id: string;
  name: string;
  code: string;
  trigger: RuleTrigger;
  enabled: boolean;
}

export const TRIGGER_LABEL: Record<RuleTrigger, string> = {
  paramChange: "パラメータ変更時",
  manual: "手動",
  beforeSave: "保存前",
};

export interface RuleContext {
  params: Record<string, number>;
  /** Feature names and their current suppression. */
  features: Record<string, boolean>;
  iprops: Record<string, string>;
  material: string;
  materials: string[];
  mass?: number;
  volume?: number;
}

export interface RuleResult {
  params: Record<string, number>;
  suppress: Record<string, boolean>;
  iprops: Record<string, string>;
  material?: string;
  messages: string[];
}

const fmt = (v: unknown) => (typeof v === "number" ? String(+v.toFixed(6)) : String(v));

export function runRule(code: string, ctx: RuleContext): RuleResult {
  const out: RuleResult = { params: {}, suppress: {}, iprops: {}, messages: [] };
  const vals: Record<string, number> = { ...ctx.params };
  const feature = (name: string) => {
    if (!(name in ctx.features)) throw new Error(`フィーチャ「${name}」がありません`);
  };
  const api: Record<string, unknown> = {
    /** suppress(name, on = true) */
    suppress(name: string, on = true) {
      feature(name);
      out.suppress[name] = !!on;
    },
    unsuppress(name: string) {
      feature(name);
      out.suppress[name] = false;
    },
    isSuppressed(name: string) {
      feature(name);
      return name in out.suppress ? out.suppress[name] : ctx.features[name];
    },
    /** iprop(key) reads, iprop(key, value) writes an iProperty. */
    iprop(key: string, value?: unknown) {
      if (value === undefined) return out.iprops[key] ?? ctx.iprops[key] ?? "";
      out.iprops[key] = fmt(value);
      return undefined;
    },
    material(name?: string) {
      if (name === undefined) return out.material ?? ctx.material;
      if (!ctx.materials.includes(name)) throw new Error(`マテリアル「${name}」がありません`);
      out.material = name;
      return undefined;
    },
    message(...a: unknown[]) {
      out.messages.push(a.map(fmt).join(" "));
    },
    mass: () => ctx.mass ?? 0,
    volume: () => ctx.volume ?? 0,
    round: (v: number, step = 1) => Math.round(v / step) * step,
    ceil: (v: number, step = 1) => Math.ceil(v / step) * step,
    floor: (v: number, step = 1) => Math.floor(v / step) * step,
    clamp: (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v)),
    Math,
  };
  const scope = new Proxy(
    {},
    {
      // unknown names are captured too, so that a typo is an error instead of a new global
      // (local variables: use let / const)
      has: (_, k) => typeof k === "string" && (k in vals || k in api || !(k in globalThis)),
      get: (_, k) => {
        if (k === Symbol.unscopables) return undefined;
        if (typeof k !== "string") return undefined;
        if (k in api) return api[k];
        if (k in vals) return vals[k];
        throw new Error(`「${k}」は定義されていません`);
      },
      set: (_, k, v) => {
        if (typeof k !== "string" || !(k in vals)) throw new Error(`パラメータ「${String(k)}」がありません`);
        if (typeof v !== "number" || !Number.isFinite(v)) throw new Error(`パラメータ「${k}」には数値を設定してください`);
        vals[k] = v;
        out.params[k] = v;
        return true;
      },
    },
  );
  // sloppy-mode function so that `with` can expose the parameters as variables
  const fn = new Function("__scope", `with (__scope) {\n${code}\n}`) as (s: object) => void;
  fn(scope);
  // only report real changes
  for (const [k, v] of Object.entries(out.params)) if (Math.abs(v - ctx.params[k]) < 1e-12) delete out.params[k];
  for (const [k, v] of Object.entries(out.suppress)) if (v === ctx.features[k]) delete out.suppress[k];
  for (const [k, v] of Object.entries(out.iprops)) if (v === ctx.iprops[k]) delete out.iprops[k];
  if (out.material === ctx.material) delete out.material;
  return out;
}

export const RULE_SNIPPETS: { label: string; code: string }[] = [
  { label: "条件分岐", code: "if (幅 > 100) {\n  厚さ = 8;\n} else {\n  厚さ = 5;\n}" },
  { label: "フィーチャの抑制", code: 'suppress("フィレット1", 厚さ < 3);' },
  { label: "値の丸め", code: "長さ = round(長さ, 5); // 5 mm 単位" },
  { label: "範囲の制限", code: "幅 = clamp(幅, 50, 300);" },
  { label: "iProperty の設定", code: 'iprop("説明", `ブラケット ${幅}×${奥行}`);' },
  { label: "マテリアルの切替", code: 'if (厚さ > 10) material("鋼"); else material("アルミニウム 6061");' },
  { label: "メッセージ", code: 'if (mass() > 500) message("質量が 500 g を超えています:", round(mass(), 0.1), "g");' },
];
