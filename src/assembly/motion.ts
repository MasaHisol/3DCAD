// Assembly analysis helpers: degrees of freedom (Inventor "自由度の表示"),
// constraint driving and exploded views (presentations).

import * as THREE from "three";
import type { Vec3 } from "../core/types";
import type { SolverConstraint } from "./solver";

const v3 = (a: Vec3) => new THREE.Vector3(a[0], a[1], a[2]);

/** Vector residual of a constraint: one entry per scalar condition. */
export function residualVec(ma: THREE.Matrix4, mb: THREE.Matrix4, c: SolverConstraint): number[] {
  const Ap = v3(c.a.point).applyMatrix4(ma), Ad = v3(c.a.dir).transformDirection(ma);
  const Bp = v3(c.b.point).applyMatrix4(mb), Bd = v3(c.b.dir).transformDirection(mb);
  const v = Bp.clone().sub(Ap);
  switch (c.type) {
    case "mate":
    case "flush": {
      const t = c.type === "mate" ? Ad.clone().negate() : Ad;
      const x = Bd.clone().cross(t);
      return [x.x, x.y, x.z, v.dot(Ad) - c.value];
    }
    case "insert": {
      const t = c.flip ? Ad : Ad.clone().negate();
      const x = Bd.clone().cross(t);
      const along = v.dot(Ad);
      const perp = v.clone().sub(Ad.clone().multiplyScalar(along));
      return [x.x, x.y, x.z, perp.x, perp.y, perp.z, along - c.value];
    }
    case "axis": {
      const x = Bd.clone().cross(Ad);
      const perp = v.clone().sub(Ad.clone().multiplyScalar(v.dot(Ad)));
      return [x.x, x.y, x.z, perp.x, perp.y, perp.z];
    }
    case "angle":
      return [Ad.dot(Bd) - Math.cos(THREE.MathUtils.degToRad(c.value))];
  }
}

/** Rigid perturbation k (0-2 translate, 3-5 rotate about `pivot`) of size eps. */
function perturb(m: THREE.Matrix4, k: number, eps: number, pivot: THREE.Vector3): THREE.Matrix4 {
  const out = m.clone();
  if (k < 3) {
    const t = [0, 0, 0];
    t[k] = eps;
    return out.premultiply(new THREE.Matrix4().makeTranslation(t[0], t[1], t[2]));
  }
  const axis = new THREE.Vector3(k === 3 ? 1 : 0, k === 4 ? 1 : 0, k === 5 ? 1 : 0);
  const r = new THREE.Matrix4().makeRotationAxis(axis, eps);
  return out
    .premultiply(new THREE.Matrix4().makeTranslation(-pivot.x, -pivot.y, -pivot.z))
    .premultiply(r)
    .premultiply(new THREE.Matrix4().makeTranslation(pivot.x, pivot.y, pivot.z));
}

/** Numerical rank of a column set (modified Gram-Schmidt with relative tolerance). */
function rank(cols: number[][], tol = 1e-6): number {
  const basis: number[][] = [];
  for (const c0 of cols) {
    const c = [...c0];
    for (const b of basis) {
      let d = 0;
      for (let i = 0; i < c.length; i++) d += c[i] * b[i];
      for (let i = 0; i < c.length; i++) c[i] -= d * b[i];
    }
    const n = Math.hypot(...c);
    if (n > tol) basis.push(c.map((x) => x / n));
  }
  return basis.length;
}

export interface DofReport {
  /** Remaining DOF per component (0 = fully constrained, grounded = 0). */
  perComp: Map<string, { dof: number; trans: number; rot: number }>;
  total: number;
}

/**
 * Degrees of freedom left by the constraints. For each free component the
 * constraint Jacobian w.r.t. its 6 rigid motions is evaluated (others held
 * where they are): dof = 6 - rank.
 */
export function analyzeDof(comps: { id: string; matrix: number[]; grounded: boolean }[], cons: SolverConstraint[]): DofReport {
  const mats = new Map(comps.map((c) => [c.id, new THREE.Matrix4().fromArray(c.matrix)]));
  const perComp: DofReport["perComp"] = new Map();
  let total = 0;
  const eps = 1e-6;
  for (const c of comps) {
    if (c.grounded) {
      perComp.set(c.id, { dof: 0, trans: 0, rot: 0 });
      continue;
    }
    const m = mats.get(c.id)!;
    const pivot = new THREE.Vector3().setFromMatrixPosition(m);
    const mine = cons.filter((k) => (k.a.comp === c.id) !== (k.b.comp === c.id) && mats.has(k.a.comp) && mats.has(k.b.comp));
    const base = mine.flatMap((k) => residualVec(mats.get(k.a.comp)!, mats.get(k.b.comp)!, k));
    const col = (k: number) => {
      const pm = perturb(m, k, eps, pivot);
      const r = mine.flatMap((cn) => residualVec(cn.a.comp === c.id ? pm : mats.get(cn.a.comp)!, cn.b.comp === c.id ? pm : mats.get(cn.b.comp)!, cn));
      return r.map((x, i) => (x - base[i]) / eps);
    };
    const cols = [0, 1, 2, 3, 4, 5].map(col);
    const r = base.length ? rank(cols, 1e-4) : 0;
    const rt = base.length ? rank(cols.slice(0, 3), 1e-4) : 0;
    const dof = 6 - r;
    const trans = 3 - rt;
    perComp.set(c.id, { dof, trans, rot: dof - trans });
    total += dof;
  }
  return { perComp, total };
}

/**
 * Exploded view offsets: components slide out along the axis of their insert
 * / axis constraint (away from the partner), others radially from the
 * assembly centre. `factor` scales the distance (0 = assembled).
 */
export function explodeOffsets(
  comps: { id: string; matrix: number[]; grounded: boolean; center: Vec3; size: number }[],
  cons: SolverConstraint[],
  factor: number,
): Map<string, Vec3> {
  const out = new Map<string, Vec3>();
  if (!comps.length) return out;
  const centre = comps.reduce((s, c) => s.add(v3(c.center)), new THREE.Vector3()).multiplyScalar(1 / comps.length);
  const span = Math.max(...comps.map((c) => c.size), 1);
  const mats = new Map(comps.map((c) => [c.id, new THREE.Matrix4().fromArray(c.matrix)]));
  for (const c of comps) {
    if (c.grounded) {
      out.set(c.id, [0, 0, 0]);
      continue;
    }
    let dir: THREE.Vector3 | null = null;
    for (const k of cons) {
      if (k.type !== "insert" && k.type !== "axis") continue;
      if (k.a.comp !== c.id && k.b.comp !== c.id) continue;
      const other = k.a.comp === c.id ? k.b : k.a;
      const om = mats.get(other.comp);
      if (!om) continue;
      const axis = v3(other.dir).transformDirection(om);
      if (k.type === "insert") {
        // the partner's edge normal points out of its face: pull out along it
        dir = axis;
      } else {
        const rel = v3(c.center).sub(v3(other.point).applyMatrix4(om));
        dir = rel.dot(axis) >= 0 ? axis : axis.negate();
      }
      break;
    }
    if (!dir) {
      dir = v3(c.center).sub(centre);
      if (dir.lengthSq() < 1e-9) dir.set(0, 1, 0);
      dir.normalize();
    }
    const d = dir.multiplyScalar(span * 0.6 * factor);
    out.set(c.id, [d.x, d.y, d.z]);
  }
  return out;
}
