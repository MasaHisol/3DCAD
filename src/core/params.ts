import { evaluate, references } from "./expr";
import type { Parameter } from "./types";

export const PARAM_NAME_RE = /^[A-Za-z_À-￿][A-Za-z0-9_À-￿]*$/;

/**
 * Evaluates every parameter in dependency order, writing `value` / `error`
 * back onto each parameter. Cycles and unknown names are reported per param.
 */
export function evaluateParams(params: Parameter[]): Map<string, number> {
  const byName = new Map(params.map((p) => [p.name, p]));
  const values = new Map<string, number>();
  const state = new Map<string, "visiting" | "done">();

  const visit = (p: Parameter): number | undefined => {
    const st = state.get(p.name);
    if (st === "done") return values.get(p.name);
    if (st === "visiting") throw new Error(`循環参照: ${p.name}`);
    state.set(p.name, "visiting");
    try {
      const v = evaluate(p.expr, (n) => {
        const dep = byName.get(n);
        if (!dep) return undefined;
        const dv = visit(dep);
        if (dv === undefined) throw new Error(`${n} にエラーがあります`);
        return dv;
      });
      p.value = v;
      p.error = undefined;
      values.set(p.name, v);
      return v;
    } catch (e) {
      p.error = (e as Error).message;
      p.value = undefined;
      return undefined;
    } finally {
      state.set(p.name, "done");
    }
  };

  for (const p of params) visit(p);
  return values;
}

/** Next free auto name: d0, d1, ... (Inventor style). */
export function nextParamName(params: Parameter[], prefix = "d"): string {
  const used = new Set(params.map((p) => p.name));
  let i = 0;
  while (used.has(`${prefix}${i}`)) i++;
  return `${prefix}${i}`;
}

/** Would setting `name` to `expr` create a dependency cycle? */
export function createsCycle(params: Parameter[], name: string, expr: string): boolean {
  const byName = new Map(params.map((p) => [p.name, p]));
  const stack = [...references(expr)];
  const seen = new Set<string>();
  while (stack.length) {
    const n = stack.pop()!;
    if (n === name) return true;
    if (seen.has(n)) continue;
    seen.add(n);
    const p = byName.get(n);
    if (p) stack.push(...references(p.expr));
  }
  return false;
}

/** Evaluate an arbitrary expression against the current parameter values. */
export function evalWith(values: Map<string, number>, expr: string): number {
  return evaluate(expr, (n) => values.get(n));
}
