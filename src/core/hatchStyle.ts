// Hatch patterns of cut faces, shared by the 3D section caps and the DXF /
// drawing output so a part looks the same everywhere. Follows the drawing
// convention (JIS B 0001 / ISO 128-50): thin lines at 45°, adjacent parts
// distinguished by direction and pitch.

export interface HatchPattern {
  /** Line direction in degrees (counter-clockwise from the plane's x axis). */
  angle: number;
  /** Line pitch on paper (mm); the 3D caps scale it with the model. */
  spacing: number;
  /** Second family of lines at angle + 90° (cross hatch). */
  cross: boolean;
}

/** Default drawing hatch (the same as the drawing sheets' section views). */
export const DRAWING_HATCH: HatchPattern = { angle: 45, spacing: 2.5, cross: false };

const PATTERNS: HatchPattern[] = [
  DRAWING_HATCH,
  { angle: 135, spacing: 2.5, cross: false },
  { angle: 45, spacing: 4, cross: false },
  { angle: 135, spacing: 4, cross: false },
  { angle: 30, spacing: 3, cross: false },
  { angle: 60, spacing: 3, cross: false },
  { angle: 45, spacing: 3, cross: true },
  { angle: 0, spacing: 3, cross: true },
];

export const HATCH_PATTERN_COUNT = PATTERNS.length;

/** Stable small hash of a key (part id, material name). */
function hashKey(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Index of the pattern of a part: by index (neighbours differ) or by a stable key (part id / material). */
export function hatchPatternIndex(k: number | string | undefined): number {
  if (k === undefined) return 0;
  return (typeof k === "number" ? k : hashKey(k)) % PATTERNS.length;
}

export function hatchPatternFor(k: number | string | undefined): HatchPattern {
  return PATTERNS[hatchPatternIndex(k)];
}
