// Motion study dynamics (Inventor ダイナミック シミュレーション light).
//
// The motion itself stays kinematic: the drive constraint is swept along a
// speed profile and the assembly is re-solved at every time step. From the
// recorded poses we compute what the motor has to deliver, two ways:
//
//   * inverse dynamics by virtual work (d'Alembert): the generalized drive
//     effort Q = Σ (m·a_c − F)·∂c/∂q + (I·α + ω×Iω − M)·∂φ/∂q + ∂V_spring/∂q + damper
//   * energy balance: P = d(T + V)/dt + P_damper − P_external, Q = P / q̇
//
// Everything is SI internally (m, kg, s, N); the CAD works in mm, so poses
// and points are converted at the boundary. Pure functions, unit tested.

import * as THREE from "three";

export type V3 = [number, number, number];

/** Mass properties of one rigid component (component-local, mm based input). */
export interface BodyMass {
  id: string;
  /** kg */
  mass: number;
  /** centre of gravity, component-local mm */
  com: V3;
  /** inertia tensor about the COG in component axes, kg·mm² (row-major 3x3) */
  inertia: number[];
}

export interface PointRef {
  comp: string;
  /** component-local mm */
  point: V3;
}

export interface ExtLoad extends PointRef {
  kind: "force" | "torque";
  /** world vector: N for a force, N·m for a torque */
  vec: V3;
}

export interface SpringDef {
  a: PointRef;
  b: PointRef;
  /** N/mm */
  k: number;
  /** N·s/mm */
  c: number;
  /** free length mm */
  free: number;
}

export interface Frame {
  t: number;
  /** drive value: rad for an angle, mm for a linear drive */
  q: number;
  /** column-major 4x4 world matrices (mm) per component id */
  mats: Map<string, number[]>;
}

export interface DynInput {
  frames: Frame[];
  bodies: BodyMass[];
  /** m/s² */
  gravity: V3;
  loads: ExtLoad[];
  springs: SpringDef[];
  /** true when q is an angle (rad): the effort is a torque in N·m, else a force in N (q in mm) */
  angular: boolean;
}

export interface DynResult {
  t: number[];
  /** drive speed: rad/s or mm/s */
  qdot: number[];
  /** required drive torque N·m (angular) or force N (linear), inverse dynamics */
  effort: number[];
  /** same effort from the energy balance (NaN where q̇ ≈ 0) */
  effortEnergy: number[];
  /** mechanical power W */
  power: number[];
  /** kinetic, potential (gravity + springs) energy J */
  kinetic: number[];
  potential: number[];
  /** spring forces N (positive = tension), one series per spring */
  springForce: number[][];
}

// ------------------------------------------------------------------ speed profiles

/**
 * Drive value at time t for a sweep a → b over T seconds. "trapezoid" ramps
 * the speed up during the first `accFrac` of T, cruises, and ramps down
 * during the last `accFrac` (0 < accFrac ≤ 0.5).
 */
export function profileValue(kind: "constant" | "trapezoid", a: number, b: number, T: number, t: number, accFrac = 0.25): number {
  const s = Math.max(0, Math.min(1, t / T));
  if (kind === "constant") return a + (b - a) * s;
  const f = Math.max(1e-6, Math.min(0.5, accFrac));
  // normalized: peak speed v so that area = 1: v·(1 − f) = 1
  const v = 1 / (1 - f);
  let u: number;
  if (s < f) u = (0.5 * v * s * s) / f;
  else if (s <= 1 - f) u = 0.5 * v * f + v * (s - f);
  else {
    const r = 1 - s;
    u = 1 - (0.5 * v * r * r) / f;
  }
  return a + (b - a) * u;
}

// ------------------------------------------------------------------ mass properties

/**
 * Volume, centroid and inertia (about the centroid) of a closed triangle
 * mesh by signed tetrahedra from the origin. Positions in mm, density in
 * g/cm³; returns mass kg, com mm, inertia kg·mm².
 */
export function meshMass(pos: ArrayLike<number>, idx: ArrayLike<number>, density: number): { volume: number; mass: number; com: V3; inertia: number[] } {
  let vol = 0;
  const c = [0, 0, 0];
  // second moments ∫ x_i x_j dV
  const S = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  for (let t = 0; t < idx.length; t += 3) {
    const a = idx[t] * 3, b = idx[t + 1] * 3, d = idx[t + 2] * 3;
    const A = [pos[a], pos[a + 1], pos[a + 2]], B = [pos[b], pos[b + 1], pos[b + 2]], C = [pos[d], pos[d + 1], pos[d + 2]];
    const v = (A[0] * (B[1] * C[2] - B[2] * C[1]) - A[1] * (B[0] * C[2] - B[2] * C[0]) + A[2] * (B[0] * C[1] - B[1] * C[0])) / 6;
    vol += v;
    for (let k = 0; k < 3; k++) c[k] += (v * (A[k] + B[k] + C[k])) / 4;
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++) {
        // ∫ over tetra (0, A, B, C) of x_i x_j = v/20 · (Σ_p p_i p_j + (ΣA)_i (ΣA)_j)
        const sum = A[i] * A[j] + B[i] * B[j] + C[i] * C[j] + (A[i] + B[i] + C[i]) * (A[j] + B[j] + C[j]);
        S[i * 3 + j] += (v / 20) * sum;
      }
  }
  if (Math.abs(vol) < 1e-12) return { volume: 0, mass: 0, com: [0, 0, 0], inertia: [0, 0, 0, 0, 0, 0, 0, 0, 0] };
  const com: V3 = [c[0] / vol, c[1] / vol, c[2] / vol];
  const rho = density * 1e-6; // g/cm³ → kg/mm³
  const mass = rho * Math.abs(vol);
  const sg = Math.sign(vol);
  // central second moments
  const M = S.map((x, k) => rho * sg * x - mass * com[Math.floor(k / 3)] * com[k % 3]);
  const tr = M[0] + M[4] + M[8];
  const inertia = M.map((x, k) => (k % 4 === 0 ? tr - x : -x));
  return { volume: Math.abs(vol), mass, com, inertia };
}

// ------------------------------------------------------------------ helpers

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const addv = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a: V3) => Math.hypot(a[0], a[1], a[2]);

/** World point (m) of a component-local point (mm). */
function worldPt(m: number[], p: V3): V3 {
  return [(m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12]) / 1000, (m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13]) / 1000, (m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14]) / 1000];
}

/** Rotation part (row-major 3x3, unit-free) of a column-major 4x4 matrix. */
function rot(m: number[]): number[] {
  return [m[0], m[4], m[8], m[1], m[5], m[9], m[2], m[6], m[10]];
}
const mmul = (A: number[], B: number[]) => {
  const o = new Array(9).fill(0);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) for (let k = 0; k < 3; k++) o[i * 3 + j] += A[i * 3 + k] * B[k * 3 + j];
  return o;
};
const tr3 = (A: number[]) => [A[0], A[3], A[6], A[1], A[4], A[7], A[2], A[5], A[8]];
const mv = (A: number[], v: V3): V3 => [A[0] * v[0] + A[1] * v[1] + A[2] * v[2], A[3] * v[0] + A[4] * v[1] + A[5] * v[2], A[6] * v[0] + A[7] * v[1] + A[8] * v[2]];

/** Rotation vector (axis·angle) of a rotation matrix. */
function rotVec(R: number[]): V3 {
  const c = Math.max(-1, Math.min(1, (R[0] + R[4] + R[8] - 1) / 2));
  const th = Math.acos(c);
  const w: V3 = [R[7] - R[5], R[2] - R[6], R[3] - R[1]];
  if (th < 1e-9) return mul(w, 0.5);
  const s = Math.sin(th);
  if (s < 1e-6) {
    // ~π: axis from the diagonal
    const q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().set(R[0], R[1], R[2], 0, R[3], R[4], R[5], 0, R[6], R[7], R[8], 0, 0, 0, 0, 1));
    const ax = new THREE.Vector3(q.x, q.y, q.z).normalize();
    return [ax.x * th, ax.y * th, ax.z * th];
  }
  return mul(w, th / (2 * s));
}

/** Derivative of a sampled series on an uneven grid (central inside, one-sided at the ends). */
function deriv<T>(x: number[], y: T[], diff: (a: T, b: T) => T, scale: (a: T, s: number) => T): T[] {
  const n = y.length;
  return y.map((_, i) => {
    const lo = i === 0 ? 0 : i === n - 1 ? n - 2 : i - 1;
    const hi = i === 0 ? 1 : i === n - 1 ? n - 1 : i + 1;
    const dx = x[hi] - x[lo];
    return scale(diff(y[hi], y[lo]), Math.abs(dx) < 1e-15 ? 0 : 1 / dx);
  });
}
const dV = (x: number[], y: V3[]) => deriv(x, y, sub, mul);
const dS = (x: number[], y: number[]) => deriv(x, y, (a, b) => a - b, (a, s) => a * s);

/** Angular velocity series (world, rad/s) from rotation matrices. */
function angVel(t: number[], R: number[][]): V3[] {
  const n = R.length;
  return R.map((_, i) => {
    const lo = i === 0 ? 0 : i === n - 1 ? n - 2 : i - 1;
    const hi = i === 0 ? 1 : i === n - 1 ? n - 1 : i + 1;
    const dt = t[hi] - t[lo];
    return dt ? mul(rotVec(mmul(R[hi], tr3(R[lo]))), 1 / dt) : [0, 0, 0];
  });
}
/** ∂φ/∂q (world rotation per unit drive). */
function angJac(q: number[], R: number[][]): V3[] {
  return angVel(q, R);
}

// ------------------------------------------------------------------ solver

export function solveDynamics(inp: DynInput): DynResult {
  const { frames, bodies, gravity: g, loads, springs } = inp;
  const n = frames.length;
  const t = frames.map((f) => f.t);
  // q in SI: rad stays rad, mm → m for a linear drive (effort in N)
  const q = frames.map((f) => (inp.angular ? f.q : f.q / 1000));
  const qdot = dS(t, q);
  const effort = new Array(n).fill(0);
  const P_kin = new Array(n).fill(0), P_pot = new Array(n).fill(0), P_ext = new Array(n).fill(0), P_damp = new Array(n).fill(0);
  const kinetic = new Array(n).fill(0), potential = new Array(n).fill(0);

  for (const b of bodies) {
    if (!(b.mass > 0) || !frames.every((f) => f.mats.has(b.id))) continue;
    const M = frames.map((f) => f.mats.get(b.id)!);
    const c = M.map((m) => worldPt(m, b.com));
    const R = M.map(rot);
    const v = dV(t, c), a = dV(t, v);
    const Jc = dV(q, c);
    const w = angVel(t, R), al = dV(t, w), Jw = angJac(q, R);
    const I0 = b.inertia.map((x) => x * 1e-6); // kg·m²
    for (let i = 0; i < n; i++) {
      const Iw = mmul(mmul(R[i], I0), tr3(R[i]));
      const lin = mul(sub(a[i], g), b.mass);
      const Lw = mv(Iw, w[i]);
      const ang = addv(mv(Iw, al[i]), cross(w[i], Lw));
      effort[i] += dot(lin, Jc[i]) + dot(ang, Jw[i]);
      kinetic[i] += 0.5 * b.mass * dot(v[i], v[i]) + 0.5 * dot(w[i], Lw);
      potential[i] += -b.mass * dot(g, c[i]);
    }
  }
  for (const L of loads) {
    if (!frames.every((f) => f.mats.has(L.comp))) continue;
    const M = frames.map((f) => f.mats.get(L.comp)!);
    if (L.kind === "force") {
      const p = M.map((m) => worldPt(m, L.point));
      const J = dV(q, p), vp = dV(t, p);
      for (let i = 0; i < n; i++) {
        effort[i] -= dot(L.vec, J[i]);
        P_ext[i] += dot(L.vec, vp[i]);
      }
    } else {
      const R = M.map(rot);
      const J = angJac(q, R), w = angVel(t, R);
      for (let i = 0; i < n; i++) {
        effort[i] -= dot(L.vec, J[i]);
        P_ext[i] += dot(L.vec, w[i]);
      }
    }
  }
  const springForce: number[][] = [];
  for (const s of springs) {
    const ok = frames.every((f) => f.mats.has(s.a.comp) && f.mats.has(s.b.comp));
    const len = frames.map((f) => (ok ? norm(sub(worldPt(f.mats.get(s.b.comp)!, s.b.point), worldPt(f.mats.get(s.a.comp)!, s.a.point))) : s.free / 1000));
    const k = s.k * 1000, c = s.c * 1000, L0 = s.free / 1000; // N/m, N·s/m, m
    const dLdq = dS(q, len), Ldot = dS(t, len);
    const F: number[] = [];
    for (let i = 0; i < n; i++) {
      const fs = k * (len[i] - L0), fd = c * Ldot[i];
      F.push(fs + fd);
      // generalized: drive must supply ∂V/∂q + c·L̇·∂L/∂q
      effort[i] += (fs + fd) * dLdq[i];
      potential[i] += 0.5 * k * (len[i] - L0) ** 2;
      P_damp[i] += fd * Ldot[i];
    }
    springForce.push(F);
  }
  const dT = dS(t, kinetic), dVp = dS(t, potential);
  const power: number[] = [], effortEnergy: number[] = [];
  const qmax = Math.max(...qdot.map(Math.abs), 1e-15);
  for (let i = 0; i < n; i++) {
    P_kin[i] = dT[i];
    P_pot[i] = dVp[i];
    const P = P_kin[i] + P_pot[i] + P_damp[i] - P_ext[i];
    effortEnergy.push(Math.abs(qdot[i]) > 1e-3 * qmax ? P / qdot[i] : NaN);
    power.push(effort[i] * qdot[i]);
  }
  return { t, qdot, effort, effortEnergy, power, kinetic, potential, springForce };
}

/** Peak |x| and RMS over time (trapezoidal time average). */
export function peakRms(t: number[], x: number[]): { peak: number; rms: number } {
  let peak = 0, s = 0, T = 0;
  for (let i = 0; i < x.length; i++) if (isFinite(x[i])) peak = Math.max(peak, Math.abs(x[i]));
  for (let i = 1; i < x.length; i++) {
    const dt = t[i] - t[i - 1];
    if (!isFinite(x[i]) || !isFinite(x[i - 1])) continue;
    s += (dt * (x[i] * x[i] + x[i - 1] * x[i - 1])) / 2;
    T += dt;
  }
  return { peak, rms: T > 0 ? Math.sqrt(s / T) : peak };
}

/** Motor sizing hint (Japanese UI text). */
export function sizingHint(angular: boolean, effPeak: number, effRms: number, powPeak: number, speedMax: number, safety = 1.5): string {
  if (angular) {
    const rpm = (speedMax * 60) / (2 * Math.PI);
    return `定格トルク ≥ ${(effRms * safety).toFixed(3)} N·m、瞬時最大トルク ≥ ${(effPeak * safety).toFixed(3)} N·m、回転数 ≥ ${rpm.toFixed(1)} rpm、出力 ≥ ${(powPeak * safety).toFixed(2)} W のモーターを選定してください (安全率 ${safety})。減速機を使う場合はモーター側トルク = 負荷トルク ÷ (減速比 × 効率)。`;
  }
  return `推力 (定格) ≥ ${(effRms * safety).toFixed(2)} N、最大推力 ≥ ${(effPeak * safety).toFixed(2)} N、速度 ≥ ${(speedMax).toFixed(1)} mm/s、出力 ≥ ${(powPeak * safety).toFixed(2)} W のアクチュエーターを選定してください (安全率 ${safety})。`;
}

/** Min / max of a series with the index where they occur. */
export function minMax(x: number[]): { min: number; minAt: number; max: number; maxAt: number } {
  let min = Infinity, max = -Infinity, minAt = -1, maxAt = -1;
  x.forEach((v, i) => {
    if (!isFinite(v)) return;
    if (v < min) (min = v), (minAt = i);
    if (v > max) (max = v), (maxAt = i);
  });
  return { min, minAt, max, maxAt };
}

/** CSV text from named columns (equal length). */
export function toCsv(cols: { name: string; data: number[] }[]): string {
  const n = Math.max(0, ...cols.map((c) => c.data.length));
  const rows = [cols.map((c) => c.name).join(",")];
  for (let i = 0; i < n; i++) rows.push(cols.map((c) => (isFinite(c.data[i]) ? String(+c.data[i].toPrecision(8)) : "")).join(","));
  return rows.join("\n");
}

/** World point (mm) of a component-local point (mm). */
export function worldPointMm(m: number[], p: V3): V3 {
  return mul(worldPt(m, p), 1000);
}
