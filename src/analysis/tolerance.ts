// Tolerance stack-up (1-D dimension chain): worst case, RSS (statistical)
// and Monte Carlo with normal distributions (±tol = ±3σ).

export interface StackRow {
  name: string;
  nominal: number;
  /** Upper / lower deviations (upper ≥ lower, e.g. +0.1 / -0.05). */
  upper: number;
  lower: number;
  /** +1 adds to the gap, -1 subtracts. */
  dir: 1 | -1;
}

export interface StackResult {
  nominal: number;
  worstMax: number;
  worstMin: number;
  /** Mean of the gap (asymmetric tolerances shift the mean). */
  mean: number;
  /** Statistical ± (3σ, RSS). */
  rss: number;
  /** Monte Carlo samples: min / max / σ and fraction inside the spec. */
  mc: { sigma: number; min: number; max: number; yield: number | null };
  /** Contribution of each row to the variance (%). */
  contrib: number[];
}

/** Deterministic PRNG (mulberry32) so results are reproducible. */
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function stackup(rows: StackRow[], spec?: { min?: number; max?: number }, samples = 20000): StackResult {
  let nominal = 0, wmax = 0, wmin = 0, mean = 0, varSum = 0;
  const vars: number[] = [];
  for (const r of rows) {
    nominal += r.dir * r.nominal;
    const hi = r.nominal + r.upper, lo = r.nominal + r.lower;
    wmax += r.dir > 0 ? hi : -lo;
    wmin += r.dir > 0 ? lo : -hi;
    mean += r.dir * (r.nominal + (r.upper + r.lower) / 2);
    const sigma = (r.upper - r.lower) / 6;
    vars.push(sigma * sigma);
    varSum += sigma * sigma;
  }
  const rand = rng(12345);
  const gauss = () => {
    const u = Math.max(rand(), 1e-12), v = rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  let mn = Infinity, mx = -Infinity, s1 = 0, s2 = 0, inside = 0;
  for (let i = 0; i < samples; i++) {
    let g = 0;
    for (const r of rows) g += r.dir * (r.nominal + (r.upper + r.lower) / 2 + gauss() * ((r.upper - r.lower) / 6));
    mn = Math.min(mn, g);
    mx = Math.max(mx, g);
    s1 += g;
    s2 += g * g;
    if (spec && (spec.min === undefined || g >= spec.min) && (spec.max === undefined || g <= spec.max)) inside++;
  }
  const m = s1 / samples;
  return {
    nominal,
    worstMax: wmax,
    worstMin: wmin,
    mean,
    rss: 3 * Math.sqrt(varSum),
    mc: { sigma: Math.sqrt(Math.max(0, s2 / samples - m * m)), min: mn, max: mx, yield: spec ? inside / samples : null },
    contrib: vars.map((v) => (varSum ? (100 * v) / varSum : 0)),
  };
}
