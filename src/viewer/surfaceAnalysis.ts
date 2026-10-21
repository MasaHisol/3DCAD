// Curvature display (曲率表示) estimated from the display mesh: for every
// mesh edge, the change of the vertex normals over its length approximates the
// normal curvature along it. Each vertex takes the largest value of its edges.
// Meshes are split per B-rep face, so crease edges between faces don't count.

import type { BodyMesh } from "../kernel/protocol";

/** Per-vertex curvature (1/mm) of one body mesh. */
export function vertexCurvature(b: BodyMesh): Float32Array {
  const P = b.positions, N = b.normals, I = b.indices;
  const k = new Float32Array(P.length / 3);
  const edge = (i: number, j: number) => {
    const dx = P[i * 3] - P[j * 3], dy = P[i * 3 + 1] - P[j * 3 + 1], dz = P[i * 3 + 2] - P[j * 3 + 2];
    const l = Math.hypot(dx, dy, dz);
    if (l < 1e-9) return;
    const nx = N[i * 3] - N[j * 3], ny = N[i * 3 + 1] - N[j * 3 + 1], nz = N[i * 3 + 2] - N[j * 3 + 2];
    const c = Math.hypot(nx, ny, nz) / l;
    if (c > k[i]) k[i] = c;
    if (c > k[j]) k[j] = c;
  };
  for (let t = 0; t + 2 < I.length; t += 3) {
    edge(I[t], I[t + 1]);
    edge(I[t + 1], I[t + 2]);
    edge(I[t + 2], I[t]);
  }
  return k;
}

/** Blue (flat) → cyan → green → yellow → red (≥ max). */
export function curvatureColor(t: number): [number, number, number] {
  const x = Math.max(0, Math.min(1, t)) * 4;
  const stops: [number, number, number][] = [
    [0.15, 0.3, 0.85],
    [0.1, 0.75, 0.9],
    [0.2, 0.8, 0.3],
    [0.95, 0.85, 0.15],
    [0.9, 0.2, 0.15],
  ];
  const i = Math.min(3, Math.floor(x)), f = x - i;
  return [0, 1, 2].map((c) => stops[i][c] + (stops[i + 1][c] - stops[i][c]) * f) as [number, number, number];
}

/** Colours for all bodies, scaled to the 95th percentile of curvature over the model. */
export function curvatureColors(bodies: BodyMesh[]): { per: { colors: Float32Array }[]; max: number } {
  const ks = bodies.map(vertexCurvature);
  const all = ks.flatMap((k) => Array.from(k)).filter((x) => x > 1e-6).sort((a, b) => a - b);
  const max = all.length ? all[Math.min(all.length - 1, Math.floor(all.length * 0.95))] : 0;
  const per = ks.map((k) => {
    const colors = new Float32Array(k.length * 3);
    k.forEach((v, i) => colors.set(curvatureColor(max > 0 ? v / max : 0), i * 3));
    return { colors };
  });
  return { per, max };
}
