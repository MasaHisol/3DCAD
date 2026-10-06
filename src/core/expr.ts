// Safe arithmetic expression evaluator used by the parameter table and every
// numeric input field (e.g. "d0 * 2 + 5 mm", "sqrt(Width^2 + 4)", "45 deg").
// Lengths evaluate in millimetres, angles in degrees.

export type Scope = (name: string) => number | undefined;

const UNITS: Record<string, number> = {
  mm: 1,
  cm: 10,
  m: 1000,
  in: 25.4,
  ft: 304.8,
  deg: 1,
  rad: 180 / Math.PI,
  ul: 1,
};

const FUNCS: Record<string, (...a: number[]) => number> = {
  sin: (x) => Math.sin((x * Math.PI) / 180),
  cos: (x) => Math.cos((x * Math.PI) / 180),
  tan: (x) => Math.tan((x * Math.PI) / 180),
  asin: (x) => (Math.asin(x) * 180) / Math.PI,
  acos: (x) => (Math.acos(x) * 180) / Math.PI,
  atan: (x) => (Math.atan(x) * 180) / Math.PI,
  sqrt: Math.sqrt,
  abs: Math.abs,
  round: Math.round,
  floor: Math.floor,
  ceil: Math.ceil,
  min: Math.min,
  max: Math.max,
  pow: Math.pow,
  ln: Math.log,
  log: Math.log10,
  exp: Math.exp,
};

const CONSTS: Record<string, number> = { PI: Math.PI, pi: Math.PI, E: Math.E };

type Tok = { t: "num" | "id" | "op"; v: string };

function tokenize(src: string): Tok[] {
  const out: Tok[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    if (/[0-9.]/.test(c)) {
      let j = i;
      while (j < src.length && /[0-9.]/.test(src[j])) j++;
      if (src[j] === "e" || src[j] === "E") {
        let k = j + 1;
        if (src[k] === "+" || src[k] === "-") k++;
        if (/[0-9]/.test(src[k] ?? "")) {
          j = k;
          while (j < src.length && /[0-9]/.test(src[j])) j++;
        }
      }
      out.push({ t: "num", v: src.slice(i, j) });
      i = j;
      continue;
    }
    if (/[A-Za-z_À-￿]/.test(c)) {
      let j = i;
      while (j < src.length && /[A-Za-z0-9_À-￿]/.test(src[j])) j++;
      out.push({ t: "id", v: src.slice(i, j) });
      i = j;
      continue;
    }
    if ("+-*/^(),".includes(c)) {
      out.push({ t: "op", v: c });
      i++;
      continue;
    }
    throw new Error(`不正な文字: '${c}'`);
  }
  return out;
}

export function evaluate(src: string, scope: Scope = () => undefined): number {
  const toks = tokenize(String(src));
  let p = 0;
  const peek = () => toks[p];
  const eat = (v?: string) => {
    const t = toks[p];
    if (!t || (v !== undefined && t.v !== v)) throw new Error(v ? `'${v}' が必要です` : "式が不完全です");
    p++;
    return t;
  };

  const expr = (): number => {
    let v = term();
    while (peek() && (peek().v === "+" || peek().v === "-")) {
      const op = eat().v;
      const r = term();
      v = op === "+" ? v + r : v - r;
    }
    return v;
  };
  const term = (): number => {
    let v = unary();
    for (;;) {
      const t = peek();
      if (t && (t.v === "*" || t.v === "/")) {
        eat();
        const r = unary();
        v = t.v === "*" ? v * r : v / r;
      } else if (t && (t.t === "num" || t.v === "(" || (t.t === "id" && !(t.v in UNITS)))) {
        // implicit multiplication: "2 PI", "2(3+4)"
        v = v * unary();
      } else break;
    }
    return v;
  };
  const unary = (): number => {
    const t = peek();
    if (t && t.v === "-") {
      eat();
      return -unary();
    }
    if (t && t.v === "+") {
      eat();
      return unary();
    }
    return power();
  };
  const power = (): number => {
    const b = postfix();
    if (peek() && peek().v === "^") {
      eat();
      return Math.pow(b, unary());
    }
    return b;
  };
  const postfix = (): number => {
    let v = primary();
    const t = peek();
    if (t && t.t === "id" && t.v in UNITS) {
      eat();
      v *= UNITS[t.v];
    }
    return v;
  };
  const primary = (): number => {
    const t = eat();
    if (t.t === "num") {
      const n = Number(t.v);
      if (!Number.isFinite(n)) throw new Error(`不正な数値: ${t.v}`);
      return n;
    }
    if (t.v === "(") {
      const v = expr();
      eat(")");
      return v;
    }
    if (t.t === "id") {
      if (peek() && peek().v === "(" && t.v in FUNCS) {
        eat("(");
        const args: number[] = [];
        if (peek() && peek().v !== ")") {
          args.push(expr());
          while (peek() && peek().v === ",") {
            eat();
            args.push(expr());
          }
        }
        eat(")");
        return FUNCS[t.v](...args);
      }
      if (t.v in CONSTS) return CONSTS[t.v];
      const s = scope(t.v);
      if (s === undefined) throw new Error(`未定義のパラメータ: ${t.v}`);
      return s;
    }
    throw new Error(`予期しないトークン: ${t.v}`);
  };

  if (toks.length === 0) throw new Error("式が空です");
  const v = expr();
  if (p < toks.length) throw new Error(`予期しないトークン: ${toks[p].v}`);
  if (!Number.isFinite(v)) throw new Error("結果が数値ではありません");
  return v;
}

/** Identifiers referenced by an expression (excluding functions, units, constants). */
export function references(src: string): string[] {
  let toks: Tok[];
  try {
    toks = tokenize(String(src));
  } catch {
    return [];
  }
  const out = new Set<string>();
  toks.forEach((t, i) => {
    if (t.t !== "id") return;
    if (t.v in UNITS || t.v in CONSTS) return;
    if (t.v in FUNCS && toks[i + 1]?.v === "(") return;
    out.add(t.v);
  });
  return [...out];
}

export function formatNumber(v: number, digits = 3): string {
  if (!Number.isFinite(v)) return "—";
  const r = Number(v.toFixed(digits));
  return String(Object.is(r, -0) ? 0 : r);
}
