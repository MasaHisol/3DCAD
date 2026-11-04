// Tessellation policy (engine #5 テッセレーション・LOD), kernel independent.
//
// The display mesh is controlled by a chordal (linear) deflection and an
// angular deflection. Stage 1 used a linear tolerance relative to the whole
// model plus a tight fixed angle (0.25 rad), so the angle — not the display
// error — decided the triangle count of curved faces. Now the linear
// deflection is the guaranteed display error (relative to the model size, and
// never coarser than a fraction of the part's own size, so small parts keep
// their shape), and the angle is only a safety bound for shading; the result
// keeps the same display error with far fewer triangles. Three quality levels
// support progressive display (coarse first, refined in the background) and
// view-dependent refinement (zoomed-in parts get the fine level).

/**
 * Version of the tessellation: part of every display-mesh cache key, so cached
 * meshes made by an older policy or kernel build are never reused. Bump when
 * the parameters or the mesher change.
 */
export const TESS_VERSION = 2;
/** Kernel build tag (bump when the OpenCascade build changes its meshing). */
export const KERNEL_TAG = "rocc1";
/** Prefix of versioned display-mesh cache keys. */
export const MESH_CACHE_VERSION = `${KERNEL_TAG}.t${TESS_VERSION}`;

export type TessQuality = "coarse" | "normal" | "fine";
export const TESS_LEVELS: TessQuality[] = ["coarse", "normal", "fine"];

export interface TessParams {
  quality: TessQuality;
  /** Specified display error: maximum deviation of the mesh from the surface (mm). */
  tolerance: number;
  /**
   * Chordal deflection passed to the mesher (mm). BRepMesh controls the sag of
   * triangle edges; inside triangles of doubly curved faces the deviation can
   * reach about twice that, so the mesher gets MESHER_SAFETY × tolerance.
   */
  linear: number;
  /** Maximum angle between neighbouring normals of a curved face (rad). */
  angular: number;
}

/** Stage-1 parameters (kept for comparison in benchmarks / tests). */
export function legacyTessParams(modelDiag: number): TessParams {
  const linear = Math.max(0.002, modelDiag * 3e-4);
  return { quality: "normal", tolerance: linear / MESHER_SAFETY, linear, angular: 0.25 };
}

/** Mesher deflection / specified display error (measured: interior sag ≤ 2.1 × edge deflection). */
export const MESHER_SAFETY = 0.45;

const LEVEL = {
  // linear factor relative to the normal level, angular bound
  coarse: { k: 4, angular: 0.9 },
  normal: { k: 1, angular: 0.5 },
  fine: { k: 0.25, angular: 0.3 },
} as const;

/**
 * Tessellation parameters of a part of size `partDiag` in a model of size
 * `modelDiag` (bounding box diagonals, mm).
 */
export function tessParams(modelDiag: number, partDiag = modelDiag, quality: TessQuality = "normal"): TessParams {
  const L = LEVEL[quality];
  // ≈ 0.7 px at the fit-all view of a ~1000 px viewport
  const model = Math.max(0.0045, modelDiag * 6.7e-4) * L.k;
  // a part never gets coarser than 1/100 of its own size (1/400 when fine)
  const part = Math.max(2e-4, partDiag * 1e-2 * L.k);
  const tolerance = Math.min(model, part);
  return { quality, tolerance, linear: tolerance * MESHER_SAFETY, angular: L.angular };
}

/** Display error in screen pixels of a mesh with chordal deviation `linear` at `pixelSize` mm per pixel. */
export function errorPx(linear: number, pixelSize: number): number {
  return linear / Math.max(1e-12, pixelSize);
}

/**
 * View-dependent level: the coarsest level whose display error on screen is
 * below `maxErrPx` (the fine level when none is). `levels` are the linear
 * deflections per level.
 */
export function levelForView(levels: Record<TessQuality, number>, pixelSize: number, maxErrPx = 0.75): TessQuality {
  for (const q of TESS_LEVELS) if (errorPx(levels[q], pixelSize) <= maxErrPx) return q;
  return "fine";
}

/** Rough triangle budget: models above this many B-rep faces are shown coarse first (progressive). */
export const PROGRESSIVE_FACES = 600;
