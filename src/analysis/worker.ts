/// <reference lib="webworker" />
// Stress analysis runs off the UI thread.
import { solveFea, type FeaBoundary, type FeaMaterial, type FeaMesh, type FeaOptions } from "./fea";

export interface FeaRequest {
  mesh: FeaMesh;
  bc: FeaBoundary;
  mat: FeaMaterial;
  opt: FeaOptions;
}

self.onmessage = (e: MessageEvent<FeaRequest>) => {
  const { mesh, bc, mat, opt } = e.data;
  try {
    const r = solveFea(mesh, bc, mat, opt, (it, res) => self.postMessage({ progress: { it, res } }));
    self.postMessage({ result: r }, [r.vm.buffer, r.disp.buffer, r.active.buffer, r.used.buffer]);
  } catch (err) {
    self.postMessage({ error: (err as Error).message });
  }
};
