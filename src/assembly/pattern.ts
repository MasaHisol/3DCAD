// Component patterns (Inventor コンポーネント パターン): rectangular and
// circular copies of a component that follow the source's position.

import * as THREE from "three";
import type { Vec3 } from "../core/types";

export interface AsmPattern {
  id: string;
  name: string;
  /** Source component id. */
  source: string;
  kind: "rect" | "circ";
  /** Rectangular: two directions (assembly axes), counts and spacings. */
  dir1: Vec3;
  count1: number;
  spacing1: number;
  dir2?: Vec3;
  count2?: number;
  spacing2?: number;
  /** Circular: axis through `axisPoint` along `axisDir`, count over `angle` degrees (360 = full). */
  axisPoint?: Vec3;
  axisDir?: Vec3;
  count?: number;
  angle?: number;
}

/** Instance transforms (assembly frame) applied to the source matrix, excluding the source itself. */
export function patternTransforms(p: AsmPattern): THREE.Matrix4[] {
  const out: THREE.Matrix4[] = [];
  if (p.kind === "rect") {
    const d1 = new THREE.Vector3(...p.dir1).normalize(), d2 = new THREE.Vector3(...(p.dir2 ?? [0, 1, 0])).normalize();
    const n2 = Math.max(1, p.count2 ?? 1);
    for (let j = 0; j < n2; j++)
      for (let i = 0; i < Math.max(1, p.count1); i++) {
        if (!i && !j) continue;
        const t = d1.clone().multiplyScalar(i * p.spacing1).add(d2.clone().multiplyScalar(j * (p.spacing2 ?? 0)));
        out.push(new THREE.Matrix4().makeTranslation(t.x, t.y, t.z));
      }
  } else {
    const n = Math.max(1, p.count ?? 1);
    const full = Math.abs((p.angle ?? 360) - 360) < 1e-9;
    const step = (((p.angle ?? 360) * Math.PI) / 180) / (full ? n : Math.max(n - 1, 1));
    const c = new THREE.Vector3(...(p.axisPoint ?? [0, 0, 0])), ax = new THREE.Vector3(...(p.axisDir ?? [0, 0, 1])).normalize();
    for (let i = 1; i < n; i++) {
      const r = new THREE.Matrix4().makeRotationAxis(ax, step * i);
      out.push(new THREE.Matrix4().makeTranslation(c.x, c.y, c.z).multiply(r).multiply(new THREE.Matrix4().makeTranslation(-c.x, -c.y, -c.z)));
    }
  }
  return out;
}

/** Matrices (column-major arrays) of the instances for a source matrix. */
export function patternMatrices(p: AsmPattern, source: number[]): number[][] {
  const m = new THREE.Matrix4().fromArray(source);
  return patternTransforms(p).map((t) => t.clone().multiply(m).toArray());
}
