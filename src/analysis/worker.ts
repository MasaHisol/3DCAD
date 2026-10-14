/// <reference lib="webworker" />
// Analyses run off the UI thread.
import { buildGrid, solveFea, type FeaBoundary, type FeaMaterial, type FeaMesh, type FeaOptions } from "./fea";
import { solveTopology, type TopoOptions } from "./topo";
import { solvePlastic } from "./nonlinear";
import { solveDynamic, type DynamicOptions } from "./dynamic";
import { solveBuckling, solveModal, solveThermal, type ThermalBoundary, type ThermalMaterial } from "./advanced";

export type AnalysisKind = "static" | "modal" | "buckling" | "thermal" | "thermalStress" | "topology" | "plastic" | "dynamic";

export interface FeaRequest {
  kind?: AnalysisKind;
  mesh: FeaMesh;
  bc: FeaBoundary;
  mat: FeaMaterial;
  opt: FeaOptions;
  density?: number;
  modes?: number;
  thermal?: { bc: ThermalBoundary; mat: ThermalMaterial; Tref: number };
  topo?: TopoOptions;
  dynamic?: DynamicOptions;
}

const transfer = (o: unknown, out: Transferable[] = []): Transferable[] => {
  if (ArrayBuffer.isView(o)) out.push((o as Float32Array).buffer);
  else if (Array.isArray(o)) for (const v of o) transfer(v, out);
  else if (o && typeof o === "object") for (const v of Object.values(o)) transfer(v, out);
  return [...new Set(out)];
};

self.onmessage = (e: MessageEvent<FeaRequest>) => {
  const { kind = "static", mesh, bc, mat, opt } = e.data;
  const progress = (it: number, res: number) => self.postMessage({ progress: { it, res } });
  try {
    let result: unknown;
    if (kind === "static") result = solveFea(mesh, bc, mat, opt, progress);
    else if (kind === "modal") result = solveModal(mesh, bc.fixed, mat, e.data.density ?? 7.85, opt, e.data.modes ?? 6, progress);
    else if (kind === "buckling") result = solveBuckling(mesh, bc, mat, opt, progress);
    else if (kind === "plastic") {
      const pl = solvePlastic(mesh, bc, mat, opt, {}, (s, it) => progress(s * 100 + it, 0));
      const { result: r, ...meta } = pl;
      result = { ...r, gaussStress: undefined, plastic: meta };
    } else if (kind === "dynamic") {
      const d = solveDynamic(mesh, bc, mat, e.data.density ?? 7.85, opt, e.data.dynamic ?? { kind: "harmonic", damping: 0.02 }, progress);
      const { staticResult, ...meta } = d;
      result = { ...staticResult, dynamic: meta };
    } else if (kind === "topology") result = solveTopology(mesh, bc, mat, opt, e.data.topo ?? { volFrac: 0.4 }, progress);
    else {
      const th = e.data.thermal!;
      const t = solveThermal(mesh, th.bc, th.mat, opt, progress);
      if (kind === "thermal") result = t;
      else {
        // same mesh + options -> same grid, so the nodal temperatures line up
        void buildGrid;
        const st = solveFea(mesh, { ...bc, thermal: { T: t.T, Tref: th.Tref, alpha: th.mat.alpha } }, mat, opt, progress);
        result = { ...st, thermal: t };
      }
    }
    self.postMessage({ result }, transfer(result));
  } catch (err) {
    self.postMessage({ error: (err as Error).message });
  }
};
