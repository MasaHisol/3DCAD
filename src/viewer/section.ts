// Section view state (断面の強化): up to three simultaneous axis planes
// (X / Y / Z, each with on/off, offset and flip), the clipping planes they
// produce, the kernel plane definitions for exact section curves (DXF), and
// the animated sweep of a plane through the model.
import * as THREE from "three";
import type { PlaneDef, Vec3 } from "../core/types";

export type SectionAxis = "X" | "Y" | "Z";
export const SECTION_AXES: SectionAxis[] = ["X", "Y", "Z"];

export interface SectionPlaneState {
  axis: SectionAxis;
  enabled: boolean;
  /** Position along the axis (model coordinates, mm). */
  value: number;
  /** Keep the material on the + side of the plane instead of the − side. */
  flip: boolean;
}

export interface SectionState {
  planes: SectionPlaneState[];
  /** Fill the cut faces (stencil caps). */
  caps: boolean;
  /** Hatch the caps (pattern per part). */
  hatch: boolean;
}

const AX = { X: 0, Y: 1, Z: 2 } as const;

export function axisIndex(a: SectionAxis): 0 | 1 | 2 {
  return AX[a];
}

/** Initial state: Z plane through the middle of the box, X / Y off. */
export function defaultSection(box: THREE.Box3): SectionState {
  const c = box.isEmpty() ? new THREE.Vector3() : box.getCenter(new THREE.Vector3());
  return {
    planes: SECTION_AXES.map((axis) => ({ axis, enabled: axis === "Z", value: c.getComponent(AX[axis]), flip: false })),
    caps: true,
    hatch: true,
  };
}

/**
 * Clipping plane of one section plane (three.js keeps the side where the
 * signed distance is ≥ 0): without flip the material at coordinates ≤ value
 * stays, as in the stage-1 single section.
 */
export function clipPlaneOf(p: SectionPlaneState): THREE.Plane {
  const i = AX[p.axis];
  const n = new THREE.Vector3().setComponent(i, p.flip ? 1 : -1);
  return new THREE.Plane(n, p.flip ? -p.value : p.value);
}

/** Clipping planes of the enabled section planes. */
export function sectionPlanes(s: SectionState): THREE.Plane[] {
  return s.planes.filter((p) => p.enabled).map(clipPlaneOf);
}

/**
 * Kernel plane of a section plane for exact section curves: viewed from the
 * + side of the axis with a right-handed 2D frame (X: y–z, Y: z–x mirrored to
 * keep z up, Z: x–y).
 */
export function planeDefOf(axis: SectionAxis, value: number): PlaneDef {
  const origin: Vec3 = [0, 0, 0];
  origin[AX[axis]] = value;
  if (axis === "X") return { origin, normal: [1, 0, 0], xDir: [0, 1, 0] };
  if (axis === "Y") return { origin, normal: [0, 1, 0], xDir: [-1, 0, 0] };
  return { origin, normal: [0, 0, 1], xDir: [1, 0, 0] };
}

/** Whether a world point survives all clipping planes. */
export function keptByPlanes(planes: readonly THREE.Plane[], p: THREE.Vector3, eps = 0): boolean {
  for (const pl of planes) if (pl.distanceToPoint(p) < -eps) return false;
  return true;
}

/** Ping-pong position of a sweep at time t (ms) with a period (ms) between lo and hi. */
export function sweepValue(t: number, lo: number, hi: number, period = 4000): number {
  const ph = (t % period) / period;
  const k = ph < 0.5 ? ph * 2 : 2 - ph * 2;
  // ease in-out so the plane slows down at the ends
  const e = k * k * (3 - 2 * k);
  return lo + (hi - lo) * e;
}

/** Animated sweep of one plane between the model bounds (requestAnimationFrame). */
export class SectionSweep {
  private raf = 0;
  private t0 = 0;
  running = false;

  constructor(private onValue: (v: number) => void) {}

  start(lo: number, hi: number, period = 4000, from?: number) {
    this.stop();
    this.running = true;
    // start where the plane is now
    let phase = 0;
    if (from !== undefined && hi > lo) phase = (Math.acos(1 - 2 * Math.min(1, Math.max(0, (from - lo) / (hi - lo)))) / Math.PI) * 0.5;
    this.t0 = performance.now() - phase * period;
    const step = (t: number) => {
      if (!this.running) return;
      this.onValue(sweepValue(t - this.t0, lo, hi, period));
      this.raf = requestAnimationFrame(step);
    };
    this.raf = requestAnimationFrame(step);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }
}
