// Assembly constraint solver.
//
// Components are rigid bodies; grounded ones never move. Each constraint
// relates geometry on two components. We relax constraints iteratively:
// for every constraint the non-fixed component receives the minimal
// rotation + translation that satisfies it, and passes repeat until all
// residuals vanish. This converges quickly for the usual combinations
// (mate + mate + mate, insert + mate, axis + mate, ...).

import * as THREE from "three";
import type { AsmConstraintType, AsmGeom } from "./types";
import type { Vec3 } from "../core/types";

export interface SolverGeo {
  comp: string;
  geom: AsmGeom;
  point: Vec3;
  dir: Vec3;
}

export interface SolverConstraint {
  type: AsmConstraintType;
  a: SolverGeo;
  b: SolverGeo;
  value: number;
  flip?: boolean;
}

export interface SolveReport {
  iterations: number;
  error: number;
  ok: boolean;
}

const v3 = (a: Vec3) => new THREE.Vector3(a[0], a[1], a[2]);

function world(m: THREE.Matrix4, g: SolverGeo) {
  const p = v3(g.point).applyMatrix4(m);
  const d = v3(g.dir).transformDirection(m);
  return { p, d };
}

function rotateAbout(m: THREE.Matrix4, q: THREE.Quaternion, pivot: THREE.Vector3) {
  const r = new THREE.Matrix4().makeRotationFromQuaternion(q);
  const t1 = new THREE.Matrix4().makeTranslation(pivot.x, pivot.y, pivot.z);
  const t0 = new THREE.Matrix4().makeTranslation(-pivot.x, -pivot.y, -pivot.z);
  m.premultiply(t0).premultiply(r).premultiply(t1);
}

function translate(m: THREE.Matrix4, v: THREE.Vector3) {
  m.premultiply(new THREE.Matrix4().makeTranslation(v.x, v.y, v.z));
}

/** Minimal rotation taking unit vector `from` onto `to`. */
function align(from: THREE.Vector3, to: THREE.Vector3): THREE.Quaternion {
  const d = from.dot(to);
  if (d < -0.999999) {
    // 180 degrees: any perpendicular axis
    const axis = new THREE.Vector3(1, 0, 0).cross(from);
    if (axis.lengthSq() < 1e-8) axis.set(0, 1, 0).cross(from);
    return new THREE.Quaternion().setFromAxisAngle(axis.normalize(), Math.PI);
  }
  return new THREE.Quaternion().setFromUnitVectors(from, to);
}

/** Residual of one constraint (0 = satisfied). */
export function constraintError(ma: THREE.Matrix4, mb: THREE.Matrix4, c: SolverConstraint): number {
  const A = world(ma, c.a), B = world(mb, c.b);
  switch (c.type) {
    case "mate":
    case "flush": {
      const target = c.type === "mate" ? A.d.clone().negate() : A.d;
      const ang = 1 - B.d.dot(target);
      const dist = Math.abs(B.p.clone().sub(A.p).dot(A.d) - c.value);
      return ang * 100 + dist;
    }
    case "insert": {
      const target = c.flip ? A.d : A.d.clone().negate();
      const ang = 1 - B.d.dot(target);
      const v = B.p.clone().sub(A.p);
      const along = v.dot(A.d);
      const perp = v.clone().sub(A.d.clone().multiplyScalar(along)).length();
      return ang * 100 + perp + Math.abs(along - c.value);
    }
    case "axis": {
      const ang = 1 - Math.abs(B.d.dot(A.d));
      const v = B.p.clone().sub(A.p);
      const perp = v.clone().sub(A.d.clone().multiplyScalar(v.dot(A.d))).length();
      return ang * 100 + perp;
    }
    case "angle": {
      const cur = Math.acos(THREE.MathUtils.clamp(A.d.dot(B.d), -1, 1));
      return Math.abs(cur - THREE.MathUtils.degToRad(c.value)) * 50;
    }
  }
}

/** Applies the correction for constraint `c` to the moving matrix `mb` (a is fixed). */
function correct(ma: THREE.Matrix4, mb: THREE.Matrix4, c: SolverConstraint) {
  const A = world(ma, c.a);
  let B = world(mb, c.b);
  switch (c.type) {
    case "mate":
    case "flush":
    case "insert": {
      const opposed = c.type === "mate" || (c.type === "insert" && !c.flip);
      const target = opposed ? A.d.clone().negate() : A.d.clone();
      rotateAbout(mb, align(B.d, target), B.p);
      B = world(mb, c.b);
      const v = B.p.clone().sub(A.p);
      const along = v.dot(A.d);
      const move = A.d.clone().multiplyScalar(c.value - along);
      if (c.type === "insert") move.sub(v.clone().sub(A.d.clone().multiplyScalar(along)));
      translate(mb, move);
      break;
    }
    case "axis": {
      const target = (c.flip ? -1 : 1) * B.d.dot(A.d) >= 0 ? A.d.clone() : A.d.clone().negate();
      rotateAbout(mb, align(B.d, target), B.p);
      B = world(mb, c.b);
      const v = B.p.clone().sub(A.p);
      translate(mb, v.sub(A.d.clone().multiplyScalar(v.dot(A.d))).negate());
      break;
    }
    case "angle": {
      const cur = Math.acos(THREE.MathUtils.clamp(A.d.dot(B.d), -1, 1));
      const want = THREE.MathUtils.degToRad(c.value);
      let axis = new THREE.Vector3().crossVectors(A.d, B.d);
      if (axis.lengthSq() < 1e-10) axis = new THREE.Vector3(1, 0, 0).cross(A.d);
      if (axis.lengthSq() < 1e-10) axis = new THREE.Vector3(0, 1, 0).cross(A.d);
      rotateAbout(mb, new THREE.Quaternion().setFromAxisAngle(axis.normalize(), want - cur), B.p);
      break;
    }
  }
}

/**
 * Solves component placements in place. `fixed` components never move.
 * Returns the remaining residual.
 */
export function solveAssembly(matrices: Map<string, THREE.Matrix4>, fixed: Set<string>, cons: SolverConstraint[], maxIter = 200): SolveReport {
  // components reachable from a fixed one are "anchored": prefer moving the other side
  let err = 0;
  let it = 0;
  for (; it < maxIter; it++) {
    err = 0;
    const anchored = new Set(fixed);
    for (const c of cons) {
      const ma = matrices.get(c.a.comp), mb = matrices.get(c.b.comp);
      if (!ma || !mb || c.a.comp === c.b.comp) continue;
      const e = constraintError(ma, mb, c);
      err = Math.max(err, e);
      if (e < 1e-9) {
        if (anchored.has(c.a.comp)) anchored.add(c.b.comp);
        if (anchored.has(c.b.comp)) anchored.add(c.a.comp);
        continue;
      }
      const aFixed = fixed.has(c.a.comp), bFixed = fixed.has(c.b.comp);
      if (aFixed && bFixed) continue;
      // move the side that is not fixed; if both free, move the less anchored one
      const moveA = bFixed || (!aFixed && anchored.has(c.b.comp) && !anchored.has(c.a.comp));
      // swapping sides flips the sign of offsets measured along an aligned normal
      const negate = c.type === "flush" || (c.type === "insert" && c.flip);
      if (moveA) correct(mb, ma, { ...c, a: c.b, b: c.a, value: negate ? -c.value : c.value });
      else correct(ma, mb, c);
      if (anchored.has(c.a.comp)) anchored.add(c.b.comp);
      if (anchored.has(c.b.comp)) anchored.add(c.a.comp);
    }
    if (err < 1e-7) break;
  }
  return { iterations: it, error: err, ok: err < 1e-4 };
}
