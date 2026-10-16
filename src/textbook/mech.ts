// Engineering formulas used by the textbook calculators. Units: mm, N, MPa
// (= N/mm²), N·mm unless noted. Pure functions, unit-tested.

// ------------------------------------------------------------- sections ---

export type SectionKind = "rect" | "round" | "pipe" | "box" | "hbeam";

export interface SectionDims {
  /** rect: b × h; box: B × H × t; round: d; pipe: D × t; hbeam: H × B × tw × tf */
  b?: number;
  h?: number;
  d?: number;
  D?: number;
  t?: number;
  tw?: number;
  tf?: number;
}

export interface SectionProps {
  /** Area (mm²). */
  A: number;
  /** Second moment of area about the horizontal axis (mm⁴). */
  I: number;
  /** Section modulus I / y_max (mm³). */
  Z: number;
  /** Distance from the neutral axis to the extreme fibre (mm). */
  c: number;
  /** Polar second moment / polar modulus (round sections only). */
  Ip?: number;
  Zp?: number;
  /** Radius of gyration sqrt(I / A) (mm). */
  r: number;
}

export function section(kind: SectionKind, s: SectionDims): SectionProps {
  let A: number, I: number, c: number, Ip: number | undefined;
  switch (kind) {
    case "rect": {
      const b = s.b!, h = s.h!;
      A = b * h;
      I = (b * h ** 3) / 12;
      c = h / 2;
      break;
    }
    case "round": {
      const d = s.d!;
      A = (Math.PI * d * d) / 4;
      I = (Math.PI * d ** 4) / 64;
      Ip = 2 * I;
      c = d / 2;
      break;
    }
    case "pipe": {
      const D = s.D!, d = D - 2 * s.t!;
      if (!(d >= 0)) throw new Error("肉厚が大きすぎます");
      A = (Math.PI * (D * D - d * d)) / 4;
      I = (Math.PI * (D ** 4 - d ** 4)) / 64;
      Ip = 2 * I;
      c = D / 2;
      break;
    }
    case "box": {
      const B = s.b!, H = s.h!, t = s.t!;
      if (!(2 * t < Math.min(B, H))) throw new Error("肉厚が大きすぎます");
      A = B * H - (B - 2 * t) * (H - 2 * t);
      I = (B * H ** 3 - (B - 2 * t) * (H - 2 * t) ** 3) / 12;
      c = H / 2;
      break;
    }
    case "hbeam": {
      const H = s.h!, B = s.b!, tw = s.tw!, tf = s.tf!;
      if (!(2 * tf < H && tw < B)) throw new Error("寸法が不正です");
      A = 2 * B * tf + (H - 2 * tf) * tw;
      I = (B * H ** 3 - (B - tw) * (H - 2 * tf) ** 3) / 12;
      c = H / 2;
      break;
    }
  }
  if (!(A > 0) || !(I > 0)) throw new Error("寸法を正の値で入力してください");
  return { A, I, Z: I / c, c, Ip, Zp: Ip !== undefined ? Ip / c : undefined, r: Math.sqrt(I / A) };
}

// ---------------------------------------------------------------- beams ---

export type BeamCase = "cantilever-point" | "cantilever-udl" | "simple-point" | "simple-udl";

export interface BeamInput {
  kind: BeamCase;
  /** Span (mm). */
  L: number;
  /** Point load (N) or, for UDL cases, load per length (N/mm). */
  P: number;
  /** Position of the point load from the left support (simple-point only, mm). Cantilever loads sit at the free end. */
  a?: number;
  /** Young's modulus (MPa) and second moment of area (mm⁴). */
  E: number;
  I: number;
}

export interface BeamResult {
  x: number[];
  /** Shear force (N), bending moment (N·mm), deflection (mm, positive down). */
  V: number[];
  M: number[];
  y: number[];
  /** Support reactions (N, upward) and fixed-end moment (N·mm) for cantilevers. */
  R1: number;
  R2: number;
  M0: number;
  Mmax: number;
  xMmax: number;
  ymax: number;
  xYmax: number;
}

/**
 * Shear, moment and deflection of a statically determinate beam. Sagging
 * moments are positive. Deflection integrates M / EI numerically (trapezoid
 * rule) and applies the support conditions, so every case uses one method.
 * Cantilever: fixed at x = 0, free at x = L.
 */
export function beam(inp: BeamInput, n = 400): BeamResult {
  const { kind, L, P, E, I } = inp;
  if (!(L > 0 && E > 0 && I > 0)) throw new Error("スパン・ヤング率・断面二次モーメントは正の値にしてください");
  const x = Array.from({ length: n + 1 }, (_, i) => (L * i) / n);
  let R1 = 0, R2 = 0, M0 = 0;
  let Vf: (x: number) => number, Mf: (x: number) => number;
  switch (kind) {
    case "cantilever-point":
      R1 = P;
      M0 = -P * L;
      Vf = () => P;
      Mf = (s) => -P * (L - s);
      break;
    case "cantilever-udl":
      R1 = P * L;
      M0 = (-P * L * L) / 2;
      Vf = (s) => P * (L - s);
      Mf = (s) => (-P * (L - s) ** 2) / 2;
      break;
    case "simple-point": {
      const a = Math.min(Math.max(inp.a ?? L / 2, 0), L);
      R1 = (P * (L - a)) / L;
      R2 = (P * a) / L;
      Vf = (s) => (s < a ? R1 : R1 - P);
      Mf = (s) => (s <= a ? R1 * s : R2 * (L - s));
      break;
    }
    case "simple-udl":
      R1 = R2 = (P * L) / 2;
      Vf = (s) => R1 - P * s;
      Mf = (s) => R1 * s - (P * s * s) / 2;
      break;
  }
  const V = x.map(Vf);
  const M = x.map(Mf);
  // EI v'' = M with v upward (sagging bends the beam concave up); integrate twice
  const k = M.map((m) => m / (E * I));
  const th = [0];
  for (let i = 1; i <= n; i++) th.push(th[i - 1] + ((k[i] + k[i - 1]) / 2) * (x[i] - x[i - 1]));
  const up = [0];
  for (let i = 1; i <= n; i++) up.push(up[i - 1] + ((th[i] + th[i - 1]) / 2) * (x[i] - x[i - 1]));
  let y: number[];
  if (kind.startsWith("cantilever")) y = up.map((v) => -v);
  else {
    // add a rigid-body rotation so that y(L) = 0 as well as y(0) = 0
    const slope = up[n] / L;
    y = up.map((v, i) => -(v - slope * x[i]));
  }
  let iM = 0, iY = 0;
  for (let i = 0; i <= n; i++) {
    if (Math.abs(M[i]) > Math.abs(M[iM])) iM = i;
    if (Math.abs(y[i]) > Math.abs(y[iY])) iY = i;
  }
  return { x, V, M, y, R1, R2, M0, Mmax: M[iM], xMmax: x[iM], ymax: y[iY], xYmax: x[iY] };
}

/** Closed-form maximum deflection for the textbook table (mm). */
export function beamDeflectionFormula(kind: BeamCase, L: number, P: number, E: number, I: number): number {
  switch (kind) {
    case "cantilever-point":
      return (P * L ** 3) / (3 * E * I);
    case "cantilever-udl":
      return (P * L ** 4) / (8 * E * I);
    case "simple-point":
      return (P * L ** 3) / (48 * E * I);
    case "simple-udl":
      return (5 * P * L ** 4) / (384 * E * I);
  }
}

// ------------------------------------------------------------- buckling ---

/** Effective length factor K for Euler columns. */
export const END_CONDITIONS = [
  { id: "pinned", label: "両端ピン", K: 1 },
  { id: "fixed-free", label: "一端固定・他端自由", K: 2 },
  { id: "fixed-pinned", label: "一端固定・他端ピン", K: 0.7 },
  { id: "fixed", label: "両端固定", K: 0.5 },
] as const;

export function euler(E: number, I: number, L: number, K: number): number {
  return (Math.PI ** 2 * E * I) / (K * L) ** 2;
}

/** Slenderness ratio λ = KL / r and the limit slenderness where Euler stress equals yield. */
export function slenderness(K: number, L: number, r: number, E: number, sy: number) {
  return { lambda: (K * L) / r, lambdaLimit: Math.PI * Math.sqrt(E / sy) };
}

// -------------------------------------------------------------- torsion ---

/** Torque (N·mm) from power (kW) and speed (min⁻¹). */
export const torqueFromPower = (kW: number, rpm: number) => (kW * 1e6 * 60) / (2 * Math.PI * rpm);

/** Max shear stress in a solid round shaft (MPa). */
export const shaftShear = (T: number, d: number) => (16 * T) / (Math.PI * d ** 3);

/** Minimum solid shaft diameter for an allowable shear stress (mm). */
export const shaftDiameter = (T: number, tauAllow: number) => Math.cbrt((16 * T) / (Math.PI * tauAllow));

/** Twist angle of a solid shaft (deg). G in MPa. */
export const shaftTwist = (T: number, L: number, G: number, d: number) => ((T * L) / (G * ((Math.PI * d ** 4) / 32))) * (180 / Math.PI);

// ------------------------------------------------- stress concentration ---

/** Heywood: finite-width plate with a central hole under tension (Kt on net section). */
export const ktPlateHole = (d: number, W: number) => 2 + (1 - d / W) ** 3;

// ---------------------------------------------------------------- bolts ---

/** Metric coarse threads: pitch and tensile stress area (ISO 898-1). */
export const BOLTS: { size: string; d: number; p: number; As: number }[] = [
  { size: "M3", d: 3, p: 0.5, As: 5.03 },
  { size: "M4", d: 4, p: 0.7, As: 8.78 },
  { size: "M5", d: 5, p: 0.8, As: 14.2 },
  { size: "M6", d: 6, p: 1, As: 20.1 },
  { size: "M8", d: 8, p: 1.25, As: 36.6 },
  { size: "M10", d: 10, p: 1.5, As: 58 },
  { size: "M12", d: 12, p: 1.75, As: 84.3 },
  { size: "M16", d: 16, p: 2, As: 157 },
  { size: "M20", d: 20, p: 2.5, As: 245 },
  { size: "M24", d: 24, p: 3, As: 353 },
];

/** Property classes: nominal tensile strength, yield (0.2 % proof) and proof stress (MPa). */
export const BOLT_CLASSES: { cls: string; Rm: number; Re: number; Sp: number }[] = [
  { cls: "4.8", Rm: 400, Re: 320, Sp: 310 },
  { cls: "8.8", Rm: 800, Re: 640, Sp: 600 },
  { cls: "10.9", Rm: 1000, Re: 900, Sp: 830 },
  { cls: "12.9", Rm: 1200, Re: 1080, Sp: 970 },
];

/** Stress area from the thread geometry: As = π/4 · ((d2 + d3) / 2)². */
export function stressArea(d: number, p: number): number {
  const d2 = d - 0.649519 * p;
  const d3 = d - 1.226869 * p;
  return (Math.PI / 4) * ((d2 + d3) / 2) ** 2;
}

/**
 * Bolt strength summary. Preload is taken as `ratio` of the proof load
 * (0.7 is a common target), tightening torque T = K · F · d.
 */
export function boltCalc(size: string, cls: string, K = 0.2, ratio = 0.7) {
  const b = BOLTS.find((x) => x.size === size);
  const c = BOLT_CLASSES.find((x) => x.cls === cls);
  if (!b || !c) throw new Error("規格が見つかりません");
  const yieldLoad = b.As * c.Re;
  const proofLoad = b.As * c.Sp;
  const preload = proofLoad * ratio;
  const torque = (K * preload * b.d) / 1000; // N·m
  return { ...b, ...c, yieldLoad, proofLoad, preload, torque };
}

// ----------------------------------------------------------------- fits ---

const RANGES = [3, 6, 10, 18, 30, 50, 80, 120];
/** Standard tolerance grades (µm) per size range (ISO 286-1). */
const IT: Record<number, number[]> = {
  6: [6, 8, 9, 11, 13, 16, 19, 22],
  7: [10, 12, 15, 18, 21, 25, 30, 35],
  8: [14, 18, 22, 27, 33, 39, 46, 54],
  9: [25, 30, 36, 43, 52, 62, 74, 87],
};
/** Shaft fundamental deviations (µm): es for f, g, h; ei for k, m, n, p. */
const SHAFT_FD: Record<string, number[]> = {
  f: [-6, -10, -13, -16, -20, -25, -30, -36],
  g: [-2, -4, -5, -6, -7, -9, -10, -12],
  h: [0, 0, 0, 0, 0, 0, 0, 0],
  k: [0, 1, 1, 1, 2, 2, 2, 3],
  m: [2, 4, 6, 7, 8, 9, 11, 13],
  n: [4, 8, 10, 12, 15, 17, 20, 23],
  p: [6, 12, 15, 18, 22, 26, 32, 37],
};

export const SHAFT_CLASSES = ["f7", "g6", "h6", "h7", "js6", "k6", "m6", "n6", "p6"];
export const HOLE_CLASSES = ["H6", "H7", "H8", "H9"];

function rangeIndex(size: number): number {
  if (!(size > 0 && size <= 120)) throw new Error("基準寸法は 120 mm 以下にしてください");
  return RANGES.findIndex((r) => size <= r);
}

export const itGrade = (size: number, grade: number) => IT[grade][rangeIndex(size)];

/** Upper / lower deviation (µm) of a hole (H only) or shaft tolerance class. */
export function deviations(size: number, cls: string): { upper: number; lower: number } {
  const m = /^([A-Za-z]{1,2})(\d+)$/.exec(cls);
  if (!m) throw new Error(`公差クラス ${cls} を解釈できません`);
  const [, letter, g] = m;
  const it = itGrade(size, Number(g));
  const i = rangeIndex(size);
  if (letter === "H") return { upper: it, lower: 0 };
  if (letter === "js") return { upper: it / 2, lower: -it / 2 };
  const fd = SHAFT_FD[letter];
  if (!fd) throw new Error(`公差クラス ${cls} は未対応です`);
  if (letter === "f" || letter === "g" || letter === "h") return { upper: fd[i], lower: fd[i] - it };
  return { upper: fd[i] + it, lower: fd[i] };
}

/** Fit between a hole and a shaft class: clearance (+) / interference (−) in µm. */
export function fit(size: number, hole: string, shaft: string) {
  const H = deviations(size, hole);
  const S = deviations(size, shaft);
  const maxClear = H.upper - S.lower;
  const minClear = H.lower - S.upper;
  const kind = minClear >= 0 ? "すきまばめ" : maxClear <= 0 ? "しまりばめ" : "中間ばめ";
  return { hole: H, shaft: S, maxClear, minClear, kind };
}

// ------------------------------------------------------------ materials ---

export interface MaterialData {
  name: string;
  group: "鉄鋼" | "非鉄" | "樹脂";
  /** Young's modulus (GPa), yield / tensile strength (MPa), density (g/cm³), relative price per kg (SS400 = 1). */
  E: number;
  sy: number;
  su: number;
  rho: number;
  cost: number;
  use: string;
}

/** Representative values for teaching (check suppliers' data for real designs). */
export const MATERIAL_DATA: MaterialData[] = [
  { name: "SS400 (一般構造用圧延鋼)", group: "鉄鋼", E: 206, sy: 245, su: 400, rho: 7.85, cost: 1, use: "フレーム・ブラケット・溶接構造" },
  { name: "S45C (機械構造用炭素鋼・調質)", group: "鉄鋼", E: 205, sy: 490, su: 690, rho: 7.85, cost: 1.5, use: "軸・歯車・ピン" },
  { name: "SUS304 (ステンレス鋼)", group: "鉄鋼", E: 193, sy: 205, su: 520, rho: 7.93, cost: 5, use: "食品・医療・屋外・耐食部品" },
  { name: "FC250 (ねずみ鋳鉄)", group: "鉄鋼", E: 110, sy: 0, su: 250, rho: 7.2, cost: 1.5, use: "ベッド・ケース (振動減衰が良い)" },
  { name: "A5052-H32 (アルミ合金)", group: "非鉄", E: 70, sy: 195, su: 230, rho: 2.68, cost: 4, use: "板金・カバー (曲げ加工しやすい)" },
  { name: "A6061-T6 (アルミ合金)", group: "非鉄", E: 69, sy: 275, su: 310, rho: 2.7, cost: 4, use: "切削部品・フレーム" },
  { name: "A7075-T6 (超々ジュラルミン)", group: "非鉄", E: 72, sy: 505, su: 570, rho: 2.8, cost: 8, use: "航空機・高強度軽量部品" },
  { name: "C3604 (快削黄銅)", group: "非鉄", E: 95, sy: 250, su: 335, rho: 8.5, cost: 6, use: "小物切削部品・継手" },
  { name: "Ti-6Al-4V (チタン合金)", group: "非鉄", E: 114, sy: 880, su: 950, rho: 4.43, cost: 40, use: "航空・医療・高比強度" },
  { name: "ABS", group: "樹脂", E: 2.3, sy: 40, su: 40, rho: 1.05, cost: 2, use: "家電の外装・ケース" },
  { name: "PC (ポリカーボネート)", group: "樹脂", E: 2.4, sy: 60, su: 65, rho: 1.2, cost: 3, use: "透明カバー・耐衝撃部品" },
  { name: "POM (ポリアセタール)", group: "樹脂", E: 2.8, sy: 65, su: 65, rho: 1.41, cost: 3, use: "歯車・軸受・摺動部品" },
  { name: "PA66 (ナイロン)", group: "樹脂", E: 2.8, sy: 80, su: 80, rho: 1.14, cost: 3, use: "機構部品 (吸水で寸法変化)" },
  { name: "PLA (3D プリント)", group: "樹脂", E: 3.5, sy: 50, su: 50, rho: 1.24, cost: 3, use: "試作・治具 (熱に弱い)" },
];

/** Factor of safety against yield (or tensile strength for brittle materials). */
export const safetyFactor = (strength: number, stress: number) => (stress > 0 ? strength / stress : Infinity);
