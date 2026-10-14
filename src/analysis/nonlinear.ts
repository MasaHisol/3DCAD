// Material nonlinearity: elastic – perfectly plastic (von Mises) with the
// secant-modulus method (Hencky deformation theory, proportional loading).
// Each element's stiffness is scaled by s = σy / σvm,trial until the stress
// field is consistent; the load is applied in increments, and a load the
// structure cannot carry (plastic collapse) shows up as non-convergence.

import { solveFea, vonMises, type FeaBoundary, type FeaMaterial, type FeaMesh, type FeaOptions, type FeaResult } from "./fea";

export interface PlasticOptions {
  /** Load increments as fractions of the full load (ascending, last = 1). */
  steps?: number[];
  maxIter?: number;
  /** Convergence: max change of the element factors. */
  tol?: number;
}

export interface PlasticResult {
  /** Result at the last converged load level (stresses capped at yield). */
  result: FeaResult;
  /** Load fraction reached (1 = full load carried). */
  loadFactor: number;
  collapsed: boolean;
  /** Load–displacement curve: load fraction, max displacement (mm). */
  curve: { load: number; disp: number }[];
  /** Linear-elastic max displacement at full load (for comparison). */
  linearDisp: number;
  /** Fraction of the volume that has yielded at the last converged step. */
  plasticFraction: number;
  /** Max equivalent plastic strain estimate (ε_trial − σy/E). */
  maxPlasticStrain: number;
  iterations: number;
}

export function solvePlastic(mesh: FeaMesh, bc: FeaBoundary, mat: FeaMaterial, opt: FeaOptions, popt: PlasticOptions = {}, progress?: (step: number, it: number) => void): PlasticResult {
  const steps = popt.steps ?? [0.5, 0.7, 0.8, 0.9, 0.95, 1];
  const maxIter = popt.maxIter ?? 40, tol = popt.tol ?? 2e-3;
  const sy = mat.yield;
  const scaleBc = (f: number): FeaBoundary => ({
    ...bc,
    loads: bc.loads.map((l) => ({ ...l, force: l.force ? (l.force.map((x) => x * f) as [number, number, number]) : l.force, pressure: l.pressure !== undefined ? l.pressure * f : l.pressure })),
    gravity: bc.gravity,
  });
  const lin = solveFea(mesh, bc, mat, { ...opt, keepGauss: true });
  const ne = lin.elements;
  let s = new Float32Array(ne).fill(1);
  const curve: { load: number; disp: number }[] = [{ load: 0, disp: 0 }];
  let last: FeaResult | null = null, lastS = s, loadFactor = 0, collapsed = false, iters = 0;
  for (let si = 0; si < steps.length && !collapsed; si++) {
    const lf = steps[si];
    const b = scaleBc(lf);
    let r: FeaResult | null = null, ok = false;
    for (let it = 0; it < maxIter; it++) {
      iters++;
      r = solveFea(mesh, b, mat, { ...opt, keepGauss: true, elementScale: s });
      progress?.(si, it);
      // trial elastic stress = current stress / s (stresses are scaled by the factor)
      const ns = new Float32Array(ne);
      let change = 0;
      for (let e = 0; e < ne; e++) {
        let vm = 0;
        // element mean of the Gauss points (the secant factor is per element)
        for (let g = 0; g < 8; g++) vm += vonMises(r.gaussStress!.subarray((e * 8 + g) * 6, (e * 8 + g) * 6 + 6)) / 8;
        const trial = vm / Math.max(s[e], 1e-6);
        const target = trial > sy ? Math.max(1e-4, sy / trial) : 1;
        // damped update for stability near the limit load
        ns[e] = 0.5 * s[e] + 0.5 * target;
        change = Math.max(change, Math.abs(ns[e] - s[e]));
      }
      s = ns;
      if (r.maxDisp > 50 * lin.maxDisp * Math.max(lf, 1e-6) + 1e-9) break;
      if (change < tol) {
        ok = true;
        break;
      }
    }
    if (!ok || !r) {
      collapsed = true;
      break;
    }
    last = r;
    lastS = s;
    loadFactor = lf;
    curve.push({ load: lf, disp: r.maxDisp });
  }
  if (!last) last = lin;
  else {
    // perfectly plastic: the stress state lies on or inside the yield surface; nodal values
    // extrapolated from the Gauss points can overshoot, so scale them back onto it
    let maxVm = 0, maxS1 = -Infinity, minS3 = Infinity;
    for (let n = 0; n < last.vm.length; n++) {
      if (last.vm[n] > sy) {
        const f = sy / last.vm[n];
        for (let k = 0; k < 6; k++) last.stress[n * 6 + k] *= f;
        last.vm[n] = sy;
        last.s1[n] *= f;
        last.s3[n] *= f;
      }
      if (last.vm[n] > 0 || last.s1[n] || last.s3[n]) {
        maxVm = Math.max(maxVm, last.vm[n]);
        maxS1 = Math.max(maxS1, last.s1[n]);
        minS3 = Math.min(minS3, last.s3[n]);
      }
    }
    last = { ...last, maxVm, maxS1, minS3 };
  }
  let yielded = 0, total = 0, peps = 0;
  const E = mat.E;
  for (let e = 0; e < ne; e++) {
    total += 1;
    if (lastS[e] < 0.999) {
      yielded += 1;
      // ε_trial = σtrial / E with σtrial = σy / s
      peps = Math.max(peps, sy / lastS[e] / E - sy / E);
    }
  }
  return { result: last, loadFactor, collapsed, curve, linearDisp: lin.maxDisp, plasticFraction: yielded / total, maxPlasticStrain: peps, iterations: iters };
}
