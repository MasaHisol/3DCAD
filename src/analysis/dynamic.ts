// Linear dynamics by modal superposition (with the mode-acceleration static
// correction for the truncated modes): frequency response to a harmonic load
// and time history for step / half-sine pulse / sine loads, Rayleigh-free
// modal damping ζ.

import { solveModal } from "./advanced";
import { assembleLoads, buildGrid, solveFea, type FeaBoundary, type FeaMaterial, type FeaMesh, type FeaOptions, type FeaResult } from "./fea";

export interface DynamicOptions {
  nModes?: number;
  /** Modal damping ratio (e.g. 0.02). */
  damping: number;
  kind: "harmonic" | "transient";
  /** Harmonic: frequency sweep (Hz). */
  fMin?: number;
  fMax?: number;
  points?: number;
  /** Transient: load time function and duration (s). */
  pulse?: "step" | "halfsine" | "sine";
  /** Half-sine duration / sine frequency (s / Hz). */
  td?: number;
  freq?: number;
  duration?: number;
}

export interface DynamicResult {
  kind: "harmonic" | "transient";
  freqs: number[];
  /** Observed DOF: node position and direction (the largest static displacement). */
  probe: { pos: [number, number, number]; dir: [number, number, number] };
  staticDisp: number;
  /** Harmonic: amplitude (mm) per frequency; transient: displacement (mm) per time. */
  x: number[];
  y: number[];
  /** Peak |response| / static response. */
  amplification: number;
  /** Peak von Mises estimate = static peak × amplification (MPa). */
  peakVm: number;
  /** Frequency / time of the peak. */
  peakAt: number;
  staticResult: FeaResult;
}

export function solveDynamic(mesh: FeaMesh, bc: FeaBoundary, mat: FeaMaterial, density: number, opt: FeaOptions, dopt: DynamicOptions, progress?: (it: number, res: number) => void): DynamicResult {
  const nm = dopt.nModes ?? 8;
  const st = solveFea(mesh, bc, mat, opt);
  const modal = solveModal(mesh, bc.fixed, mat, density, opt, nm, progress);
  const G = buildGrid(mesh, opt);
  const { F } = assembleLoads(G, bc, mat, opt);
  // probe: node of the largest static displacement, in its direction
  let pn = 0, pm = 0;
  for (let n = 0; n < G.nNodes; n++) {
    const d = Math.hypot(st.disp[n * 3], st.disp[n * 3 + 1], st.disp[n * 3 + 2]);
    if (d > pm) (pm = d), (pn = n);
  }
  const dir = [0, 1, 2].map((k) => st.disp[pn * 3 + k] / (pm || 1)) as [number, number, number];
  const ust = pm;
  // lumped mass (same as the modal solver), modal mass / force / probe value
  const M = new Float64Array(G.nNodes * 3);
  const cell = G.h ** 3 * density * 1e-9;
  for (let e = 0; e < G.ne; e++) {
    const m = (cell * G.solid[e] * (Number.isNaN(G.rho[e]) ? 1 : G.rho[e] / density)) / 8;
    for (let n = 0; n < 8; n++) for (let k = 0; k < 3; k++) M[G.conn[e * 8 + n] * 3 + k] += m;
  }
  const modes = modal.freqs.map((f, i) => {
    const phi = modal.modes[i];
    let mm = 0, p = 0;
    for (let j = 0; j < phi.length; j++) {
      mm += phi[j] * M[j] * phi[j];
      p += phi[j] * F[j];
    }
    const at = phi[pn * 3] * dir[0] + phi[pn * 3 + 1] * dir[1] + phi[pn * 3 + 2] * dir[2];
    const w = 2 * Math.PI * f;
    return { w, gain: (at * p) / (mm || 1e-300) }; // u_probe = Σ gain·q_i, q̈+2ζωq̇+ω²q = f(t)
  });
  const wmax0 = Math.max(...modes.map((m) => m.w));
  if (!modes.length || modes.some((m) => !(m.w > 1e-6 * wmax0) || !Number.isFinite(m.gain))) throw new Error("固定が不足しています (剛体モードがあります)。固定拘束を追加してください");
  // static part not represented by the modes (mode-acceleration correction)
  const modalStatic = modes.reduce((s, m) => s + m.gain / (m.w * m.w), 0);
  const residual = ust - modalStatic;
  const z = dopt.damping;
  const x: number[] = [], y: number[] = [];
  if (dopt.kind === "harmonic") {
    const f0 = dopt.fMin ?? 0, f1 = dopt.fMax ?? Math.max(1, modal.freqs[modal.freqs.length - 1] * 1.2);
    const np = dopt.points ?? 400;
    for (let i = 0; i <= np; i++) {
      const f = f0 + ((f1 - f0) * i) / np;
      const w = 2 * Math.PI * f;
      let re = residual, im = 0;
      for (const m of modes) {
        const a = m.w * m.w - w * w, b = 2 * z * m.w * w;
        const d = a * a + b * b;
        re += (m.gain * a) / d;
        im -= (m.gain * b) / d;
      }
      x.push(f);
      y.push(Math.hypot(re, im));
    }
  } else {
    const wmax = Math.max(...modes.map((m) => m.w));
    const T1 = (2 * Math.PI) / Math.min(...modes.map((m) => m.w));
    const dur = dopt.duration ?? 5 * T1;
    const td = dopt.td ?? T1 / 2, fs = dopt.freq ?? 1 / T1;
    const load = (t: number) =>
      dopt.pulse === "halfsine" ? (t <= td ? Math.sin((Math.PI * t) / td) : 0) : dopt.pulse === "sine" ? Math.sin(2 * Math.PI * fs * t) : 1;
    // Newmark average acceleration (unconditionally stable), ~20 steps per period of the highest mode
    const dt = Math.min((2 * Math.PI) / wmax / 20, dur / 400);
    const n = Math.ceil(dur / dt);
    const q = modes.map(() => 0), v = modes.map(() => 0), acc = modes.map(() => load(0));
    const out = Math.max(1, Math.floor(n / 600));
    for (let s = 0; s <= n; s++) {
      const t = s * dt;
      if (s > 0) {
        const f = load(t);
        modes.forEach((m, i) => {
          const c = 2 * z * m.w, k = m.w * m.w;
          const keff = k + (2 * c) / dt + 4 / (dt * dt);
          const feff = f + q[i] * (4 / (dt * dt)) + v[i] * (4 / dt) + acc[i] + c * ((2 / dt) * q[i] + v[i]);
          const qn = feff / keff;
          const vn = (2 / dt) * (qn - q[i]) - v[i];
          const an = (4 / (dt * dt)) * (qn - q[i]) - (4 / dt) * v[i] - acc[i];
          q[i] = qn;
          v[i] = vn;
          acc[i] = an;
        });
      }
      if (s % out === 0) {
        x.push(t);
        y.push(modes.reduce((sum, m, i) => sum + m.gain * q[i], residual * load(t)));
      }
    }
  }
  let peak = 0, at = 0;
  y.forEach((v, i) => {
    if (Math.abs(v) > peak) (peak = Math.abs(v)), (at = x[i]);
  });
  const amp = ust > 0 ? peak / ust : 0;
  return { kind: dopt.kind, freqs: modal.freqs, probe: { pos: [...G.nodePos(pn)] as [number, number, number], dir }, staticDisp: ust, x, y, amplification: amp, peakVm: st.maxVm * amp, peakAt: at, staticResult: st };
}
