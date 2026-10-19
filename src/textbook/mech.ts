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

// -------------------------------------------------------------- bearings ---

/** Deep groove ball bearings: bore d, outer D, width B (mm), basic dynamic / static load rating (kN). Representative catalogue values. */
export const BEARINGS: { name: string; d: number; D: number; B: number; Cr: number; C0r: number }[] = [
  { name: "6000", d: 10, D: 26, B: 8, Cr: 4.55, C0r: 1.96 },
  { name: "6001", d: 12, D: 28, B: 8, Cr: 5.1, C0r: 2.39 },
  { name: "6002", d: 15, D: 32, B: 9, Cr: 5.6, C0r: 2.84 },
  { name: "6003", d: 17, D: 35, B: 10, Cr: 6.0, C0r: 3.25 },
  { name: "6004", d: 20, D: 42, B: 12, Cr: 9.4, C0r: 5.05 },
  { name: "6005", d: 25, D: 47, B: 12, Cr: 10.1, C0r: 5.85 },
  { name: "6006", d: 30, D: 55, B: 13, Cr: 13.2, C0r: 8.3 },
  { name: "6200", d: 10, D: 30, B: 9, Cr: 5.1, C0r: 2.39 },
  { name: "6201", d: 12, D: 32, B: 10, Cr: 6.8, C0r: 3.05 },
  { name: "6202", d: 15, D: 35, B: 11, Cr: 7.65, C0r: 3.75 },
  { name: "6203", d: 17, D: 40, B: 12, Cr: 9.55, C0r: 4.8 },
  { name: "6204", d: 20, D: 47, B: 14, Cr: 12.8, C0r: 6.65 },
  { name: "6205", d: 25, D: 52, B: 15, Cr: 14.0, C0r: 7.85 },
  { name: "6206", d: 30, D: 62, B: 16, Cr: 19.5, C0r: 11.3 },
];

/**
 * Basic rating life of a rolling bearing (90 % reliability).
 * L10 = (C / P)^p × 10⁶ revolutions, p = 3 (ball) or 10/3 (roller); hours = L10 / (60 n).
 */
export function bearingLife(C: number, P: number, rpm: number, roller = false) {
  const p = roller ? 10 / 3 : 3;
  const L10 = (C / P) ** p * 1e6;
  return { L10, hours: L10 / (60 * rpm) };
}

/** Equivalent radial load of a deep groove ball bearing for a small axial share (X = 1, Y = 0 when Fa / Fr ≤ e ≈ 0.2…0.4). */
export const equivalentLoad = (Fr: number, Fa: number, X = 0.56, Y = 1.6, e = 0.3) => (Fa / Math.max(Fr, 1e-12) <= e ? Fr : X * Fr + Y * Fa);

// ----------------------------------------------------------------- gears ---

/** Pair of standard spur gears (pressure angle 20°). T1 in N·mm on the pinion. */
export function gearPair(m: number, z1: number, z2: number, rpm1: number, T1: number, eff = 0.98) {
  if (!(m > 0 && z1 >= 1 && z2 >= 1)) throw new Error("モジュールと歯数を正の値にしてください");
  const d1 = m * z1;
  const d2 = m * z2;
  const i = z2 / z1;
  return {
    d1,
    d2,
    da1: m * (z1 + 2),
    da2: m * (z2 + 2),
    a: (m * (z1 + z2)) / 2,
    ratio: i,
    rpm2: rpm1 / i,
    T2: T1 * i * eff,
    Ft: (2 * T1) / d1,
    v: (Math.PI * d1 * rpm1) / 60000, // m/s
    undercut: Math.min(z1, z2) < 17,
  };
}

// --------------------------------------------------------------- springs ---

/** Helical compression spring: d wire, D mean coil diameter, n active coils, G shear modulus (MPa). */
export function coilSpring(d: number, D: number, n: number, G: number, deflection: number) {
  if (!(d > 0 && D > d && n > 0)) throw new Error("線径 < コイル平均径 にしてください");
  const k = (G * d ** 4) / (8 * D ** 3 * n);
  const c = D / d;
  const Kw = (4 * c - 1) / (4 * c - 4) + 0.615 / c; // Wahl
  const P = k * deflection;
  const tau = (Kw * 8 * P * D) / (Math.PI * d ** 3);
  return { k, c, Kw, P, tau };
}

// ------------------------------------------------------------------ keys ---

/** Parallel keys (JIS B 1301): shaft diameter range (over, up to] → b × h, shaft groove depth t1. */
export const KEYS: { over: number; upTo: number; b: number; h: number; t1: number }[] = [
  { over: 6, upTo: 8, b: 2, h: 2, t1: 1.2 },
  { over: 8, upTo: 10, b: 3, h: 3, t1: 1.8 },
  { over: 10, upTo: 12, b: 4, h: 4, t1: 2.5 },
  { over: 12, upTo: 17, b: 5, h: 5, t1: 3.0 },
  { over: 17, upTo: 22, b: 6, h: 6, t1: 3.5 },
  { over: 22, upTo: 30, b: 8, h: 7, t1: 4.0 },
  { over: 30, upTo: 38, b: 10, h: 8, t1: 5.0 },
  { over: 38, upTo: 44, b: 12, h: 8, t1: 5.0 },
  { over: 44, upTo: 50, b: 14, h: 9, t1: 5.5 },
  { over: 50, upTo: 58, b: 16, h: 10, t1: 6.0 },
];

/** Key stresses for torque T (N·mm) on a shaft d with key length l. */
export function keyCheck(d: number, T: number, l: number) {
  const k = KEYS.find((x) => d > x.over && d <= x.upTo);
  if (!k) throw new Error("軸径は 6〜58 mm の範囲で入力してください");
  const F = (2 * T) / d;
  return { ...k, F, shear: F / (k.b * l), pressure: F / ((k.h - k.t1) * l) };
}

// ----------------------------------------------------------------- belts ---

/** Open belt drive: pulley pitch diameters D1 (driver), D2, centre distance C (mm). */
export function beltDrive(D1: number, D2: number, C: number, rpm1: number) {
  if (!(C > Math.abs(D2 - D1) / 2)) throw new Error("軸間距離が小さすぎます");
  const L = 2 * C + (Math.PI * (D1 + D2)) / 2 + (D2 - D1) ** 2 / (4 * C);
  const wrap = 180 - 2 * Math.asin(Math.abs(D2 - D1) / (2 * C)) * (180 / Math.PI);
  return { ratio: D2 / D1, rpm2: (rpm1 * D1) / D2, L, wrap, v: (Math.PI * D1 * rpm1) / 60000 };
}

// ------------------------------------------------------------- linkages ---

/** Grashof classification of a four-bar linkage with crank a, coupler b, rocker c, ground d. */
export function grashof(a: number, b: number, c: number, d: number) {
  const s = [a, b, c, d].sort((x, y) => x - y);
  const ok = s[0] + s[3] <= s[1] + s[2];
  const shortest = Math.min(a, b, c, d);
  let kind: string;
  if (!ok) kind = "非グラスホフ — どのリンクも 1 回転できない (てこ-てこ機構)";
  else if (shortest === d) kind = "両クランク機構 (固定リンクが最短)";
  else if (shortest === a) kind = "てこクランク機構 (入力リンクが 1 回転、出力は揺動)";
  else if (shortest === b) kind = "両てこ機構 (中間リンクが最短)";
  else kind = "てこクランク機構 (出力リンクが 1 回転)";
  return { ok, kind };
}

/** Joint positions of a four-bar: ground pivots O2 (0,0) and O4 (d,0); crank angle θ (deg). Null when it cannot close. */
export function fourBar(a: number, b: number, c: number, d: number, thetaDeg: number, open = true) {
  const t = (thetaDeg * Math.PI) / 180;
  const A = [a * Math.cos(t), a * Math.sin(t)];
  const dx = d - A[0], dy = -A[1];
  const r = Math.hypot(dx, dy);
  if (r > b + c || r < Math.abs(b - c) || r === 0) return null;
  // intersection of circle(A, b) and circle(O4, c)
  const x = (b * b - c * c + r * r) / (2 * r);
  const y = Math.sqrt(Math.max(0, b * b - x * x));
  const ux = dx / r, uy = dy / r;
  const s = open ? 1 : -1;
  const B = [A[0] + ux * x - uy * y * s, A[1] + uy * x + ux * y * s];
  const out = (Math.atan2(B[1], B[0] - d) * 180) / Math.PI;
  return { A, B, rockerAngle: out };
}

/** Degrees of freedom of a planar mechanism (Grübler): F = 3(n − 1) − 2 j1 − j2. */
export const grubler = (links: number, fullJoints: number, halfJoints = 0) => 3 * (links - 1) - 2 * fullJoints - halfJoints;

// ------------------------------------------------------------- vibration ---

/** Natural frequency of a spring–mass system (Hz). k in N/mm, m in kg. */
export const naturalFrequency = (k: number, m: number) => Math.sqrt((k * 1000) / m) / (2 * Math.PI);

/** Dynamic magnification and force transmissibility of a damped single degree of freedom system. */
export function response(r: number, zeta: number) {
  const den = Math.sqrt((1 - r * r) ** 2 + (2 * zeta * r) ** 2);
  return { magnification: 1 / den, transmissibility: Math.sqrt(1 + (2 * zeta * r) ** 2) / den };
}

/** First bending natural frequency of a uniform cantilever (Hz). E MPa, I mm⁴, A mm², ρ g/cm³, L mm. */
export function cantileverFrequency(E: number, I: number, A: number, rho: number, L: number) {
  const EI = E * 1e6 * I * 1e-12; // N·m²
  const mu = rho * 1000 * A * 1e-6; // kg/m
  return ((1.8751 ** 2) / (2 * Math.PI)) * Math.sqrt(EI / (mu * (L / 1000) ** 4));
}

// ------------------------------------------------------------------ heat ---

/** Thermal properties: expansion α (10⁻⁶/K) and conductivity λ (W/(m·K)). Representative values. */
export const THERMAL: { name: string; alpha: number; k: number }[] = [
  { name: "鋼", alpha: 11.7, k: 50 },
  { name: "ステンレス鋼 SUS304", alpha: 17.3, k: 16 },
  { name: "アルミニウム合金", alpha: 23.6, k: 167 },
  { name: "銅", alpha: 16.8, k: 390 },
  { name: "ABS 樹脂", alpha: 80, k: 0.17 },
  { name: "ガラス", alpha: 9, k: 1.0 },
];

/** Steady conduction through a plate: heat flow Q (W) for area A (mm²), thickness t (mm), temperature difference ΔT. */
export const conduction = (k: number, A: number, t: number, dT: number) => (k * (A * 1e-6) * dT) / (t / 1000);

// ------------------------------------------------------------------ cost ---

/**
 * Unit cost of a part for a lot size: material + (setup / lot) + cycle time × rate
 * + tooling / quantity. Prices in yen, times in minutes, rate in yen per hour.
 */
export function unitCost(o: { material: number; setupMin: number; cycleMin: number; rate: number; tooling: number; lot: number; quantity: number }) {
  const setup = (o.setupMin / 60) * o.rate / o.lot;
  const machining = (o.cycleMin / 60) * o.rate;
  const tooling = o.tooling / o.quantity;
  return { material: o.material, setup, machining, tooling, total: o.material + setup + machining + tooling };
}

// ---------------------------------------------------------- coordinates ---

/** End point of 2D CAD input from a start point: absolute (x, y), relative (@dx, dy) or polar (@r < angle°, CCW from +X). */
export function cadPoint(start: [number, number], mode: "abs" | "rel" | "polar", a: number, b: number): [number, number] {
  if (mode === "abs") return [a, b];
  if (mode === "rel") return [start[0] + a, start[1] + b];
  const t = (b * Math.PI) / 180;
  return [start[0] + a * Math.cos(t), start[1] + a * Math.sin(t)];
}

// ------------------------------------------------------- plane stress ---

/** Principal stresses, max shear, principal angle (deg) and von Mises of a plane stress state (MPa). */
export function planeStress(sx: number, sy: number, txy: number) {
  const c = (sx + sy) / 2;
  const R = Math.hypot((sx - sy) / 2, txy);
  return {
    s1: c + R,
    s2: c - R,
    center: c,
    R,
    tmax: R,
    theta: (0.5 * Math.atan2(2 * txy, sx - sy) * 180) / Math.PI,
    mises: Math.sqrt(sx * sx - sx * sy + sy * sy + 3 * txy * txy),
    tresca: Math.max(Math.abs(c + R - (c - R)), Math.abs(c + R), Math.abs(c - R)),
  };
}

// ---------------------------------------------------- pressure vessels ---

/** Thin-walled cylinder: hoop and axial stress (MPa) for pressure p (MPa), inner diameter D, wall t (mm). */
export function thinCylinder(p: number, D: number, t: number) {
  if (!(t > 0 && D > 0)) throw new Error("内径と板厚を正の値にしてください");
  return { hoop: (p * D) / (2 * t), axial: (p * D) / (4 * t), sphere: (p * D) / (4 * t), thin: t / D < 0.1, lidForce: (p * Math.PI * D * D) / 4 };
}

/** Wall thickness for a cylinder so that the hoop stress equals σy / S. */
export const cylinderThickness = (p: number, D: number, sy: number, S: number) => (p * D * S) / (2 * sy);

// ---------------------------------------------------------- motor sizing ---

export interface MotorInput {
  drive: "screw" | "belt";
  /** Load mass (kg), screw lead (mm) or pulley diameter (mm), friction coefficient, max speed (mm/s), acceleration time (s), efficiency (0–1), motor rotor inertia (kg·m²). */
  mass: number;
  lead: number;
  mu: number;
  speed: number;
  tacc: number;
  eff: number;
  rotor: number;
}

/** Horizontal axis sizing: rpm, load inertia, acceleration / constant / peak torque (N·m), power (W), inertia ratio. */
export function motorSizing(o: MotorInput) {
  const g = 9.81;
  // distance per motor revolution (m)
  const perRev = o.drive === "screw" ? o.lead / 1000 : (Math.PI * o.lead) / 1000;
  const rpm = ((o.speed / 1000) / perRev) * 60;
  const JL = o.mass * (perRev / (2 * Math.PI)) ** 2;
  const omega = (2 * Math.PI * rpm) / 60;
  const alpha = omega / o.tacc;
  const Tf = (o.mu * o.mass * g * perRev) / (2 * Math.PI * o.eff);
  const Ta = ((o.rotor + JL / o.eff) * alpha);
  const peak = Ta + Tf;
  return { rpm, JL, alpha, Tconst: Tf, Tacc: Ta, peak, power: peak * omega, ratio: o.rotor > 0 ? JL / o.rotor : Infinity };
}

// ----------------------------------------------------------- pneumatics ---

/** Air cylinder forces (N) and free air consumption per double stroke (L, atmospheric). D, d, stroke in mm, p in MPa (gauge). */
export function airCylinder(D: number, d: number, p: number, loadRatio: number, stroke: number) {
  if (!(D > d && d >= 0)) throw new Error("ロッド径 < チューブ内径 にしてください");
  const A1 = (Math.PI * D * D) / 4;
  const A2 = (Math.PI * (D * D - d * d)) / 4;
  const vol = ((A1 + A2) * stroke) / 1e6; // L of compressed volume per double stroke
  return { push: p * A1, pull: p * A2, pushUse: p * A1 * loadRatio, pullUse: p * A2 * loadRatio, air: vol * ((p + 0.101) / 0.101) };
}
