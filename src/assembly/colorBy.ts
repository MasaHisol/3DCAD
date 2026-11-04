// Colour assignment for the assembly display (部品ごとの色分け). The result is a
// colour per component; the viewport turns colours into materials, and
// instances sharing a colour stay in the same instanced batch.
import type { AssemblyDocument } from "./types";

export type ColorMode = "default" | "component" | "part" | "material" | "random" | "level";

export const COLOR_MODES: { id: ColorMode; label: string }[] = [
  { id: "default", label: "標準 (部品の色)" },
  { id: "component", label: "コンポーネントごと" },
  { id: "part", label: "部品ごと" },
  { id: "material", label: "材質ごと" },
  { id: "random", label: "ランダム (識別しやすい色)" },
  { id: "level", label: "サブアセンブリ階層" },
];

export interface ColorAssignment {
  colors: Map<string, string>;
  legend: { label: string; color: string; compIds: string[] }[];
}

/** i-th of a sequence of well separated colours (golden-angle hue, alternating lightness). */
export function distinctColor(i: number): string {
  const hue = (i * 137.508) % 360;
  const light = [52, 40, 64][i % 3];
  const sat = [70, 62, 78][Math.floor(i / 3) % 3];
  return hslHex(hue, sat, light);
}

export function hslHex(hh: number, ss: number, ll: number): string {
  const s = ss / 100, l = ll / 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + hh / 30) % 12;
    const c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(255 * c).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/** Deterministic shuffle (mulberry32). */
function shuffled<T>(a: T[], seed: number): T[] {
  let t = seed >>> 0;
  const rnd = () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
  const out = [...a];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Subassembly level of a component (0 = top level; pattern instances are one level down). */
export function componentLevel(c: { patternOf?: unknown }): number {
  return c.patternOf ? 1 : 0;
}

/**
 * Colours per component for a mode. `partColor` is the normal colour of a part
 * (used by "default"). Empty map for "default" means: use the normal colours.
 */
export function assignColors(doc: AssemblyDocument, mode: ColorMode, partColor: (partId: string) => string, seed = 1): ColorAssignment {
  const colors = new Map<string, string>();
  const legend: ColorAssignment["legend"] = [];
  const group = (keyOf: (c: AssemblyDocument["components"][number]) => string, labelOf: (k: string) => string, colorOf: (k: string, i: number) => string) => {
    const keys: string[] = [];
    const members = new Map<string, string[]>();
    for (const c of doc.components) {
      const k = keyOf(c);
      if (!members.has(k)) (members.set(k, []), keys.push(k));
      members.get(k)!.push(c.id);
    }
    keys.forEach((k, i) => {
      const color = colorOf(k, i);
      for (const id of members.get(k)!) colors.set(id, color);
      legend.push({ label: labelOf(k), color, compIds: members.get(k)! });
    });
  };
  const partName = (id: string) => doc.parts.find((p) => p.id === id)?.name ?? id;
  switch (mode) {
    case "default":
      group((c) => c.partId, partName, (k) => partColor(k));
      colors.clear();
      break;
    case "component":
      group((c) => c.id, (k) => doc.components.find((c) => c.id === k)?.name ?? k, (_k, i) => distinctColor(i));
      break;
    case "part":
      group((c) => c.partId, partName, (_k, i) => distinctColor(i));
      break;
    case "material": {
      const mat = (partId: string) => {
        const p = doc.parts.find((x) => x.id === partId);
        return p?.doc?.material?.name ?? (p?.kind === "step" ? "(STEP)" : "(未設定)");
      };
      group((c) => mat(c.partId), (k) => k, (k, i) => {
        const p = doc.parts.find((x) => mat(x.id) === k);
        const mc = p?.doc?.material && (p.doc.material as { color?: string }).color;
        // material colours often coincide (greys): only use them when unique
        return mc && !doc.parts.some((x) => mat(x.id) !== k && (x.doc?.material as { color?: string } | undefined)?.color === mc) ? mc : distinctColor(i);
      });
      break;
    }
    case "random": {
      const order = shuffled(doc.components.map((c) => c.id), seed);
      const rank = new Map(order.map((id, i) => [id, i]));
      group((c) => c.id, (k) => doc.components.find((c) => c.id === k)?.name ?? k, (k) => distinctColor(rank.get(k)!));
      break;
    }
    case "level": {
      const shades = ["#3b82c4", "#e38b2c", "#4fa35a", "#b0549a"];
      group((c) => String(componentLevel(c)), (k) => (k === "0" ? "最上位" : `階層 ${k}`), (k) => shades[Number(k) % shades.length]);
      break;
    }
  }
  return { colors, legend };
}
