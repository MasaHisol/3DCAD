// Display state of viewed items (part bodies or assembly components): hidden,
// see-through and colour overrides. Pure helpers; every operation returns a new
// state so the before / after pair can go on the view undo stack (viewUndo.ts).

export interface ViewSt {
  hidden: string[];
  transparent: string[];
  /** Colour overrides (#rrggbb) by item id. */
  colors: Record<string, string>;
}

export const emptyView = (): ViewSt => ({ hidden: [], transparent: [], colors: {} });

const uniq = (a: Iterable<string>) => [...new Set(a)].sort();

export function cloneView(s: ViewSt): ViewSt {
  return { hidden: [...s.hidden], transparent: [...s.transparent], colors: { ...s.colors } };
}

export function sameView(a: ViewSt, b: ViewSt): boolean {
  const eq = (x: string[], y: string[]) => {
    const u = uniq(x), v = uniq(y);
    return u.length === v.length && u.every((s, i) => s === v[i]);
  };
  const ka = Object.keys(a.colors).sort(), kb = Object.keys(b.colors).sort();
  return eq(a.hidden, b.hidden) && eq(a.transparent, b.transparent) && ka.length === kb.length && ka.every((k, i) => k === kb[i] && a.colors[k] === b.colors[k]);
}

export function hideItems(s: ViewSt, ids: string[]): ViewSt {
  return { ...cloneView(s), hidden: uniq([...s.hidden, ...ids]) };
}

export function showItems(s: ViewSt, ids: string[]): ViewSt {
  const del = new Set(ids);
  return { ...cloneView(s), hidden: s.hidden.filter((x) => !del.has(x)) };
}

/** Hides the items, or shows them when all of them are hidden already (eye icon / bulk toggle). */
export function toggleItems(s: ViewSt, ids: string[]): ViewSt {
  const h = new Set(s.hidden);
  return ids.length && ids.every((id) => h.has(id)) ? showItems(s, ids) : hideItems(s, ids);
}

/** Only `ids` stay visible (and opaque). */
export function isolateItems(s: ViewSt, all: string[], ids: string[]): ViewSt {
  const keep = new Set(ids);
  return { hidden: uniq(all.filter((x) => !keep.has(x))), transparent: [], colors: { ...s.colors } };
}

/** Everything visible and opaque (colour overrides are kept: reset them with the colour menu). */
export function showAllItems(s: ViewSt): ViewSt {
  return { hidden: [], transparent: [], colors: { ...s.colors } };
}

export function transparentOthers(s: ViewSt, all: string[], ids: string[]): ViewSt {
  const keep = new Set(ids);
  return { ...cloneView(s), transparent: uniq(all.filter((x) => !keep.has(x))) };
}

export function setTransparentItems(s: ViewSt, ids: string[], on: boolean): ViewSt {
  const t = new Set(s.transparent);
  ids.forEach((id) => (on ? t.add(id) : t.delete(id)));
  return { ...cloneView(s), transparent: uniq(t) };
}

/** Sets (or with null resets) the colour of the items. */
export function colorItems(s: ViewSt, ids: string[], color: string | null): ViewSt {
  const c = { ...s.colors };
  ids.forEach((id) => (color ? (c[id] = color) : delete c[id]));
  return { ...cloneView(s), colors: c };
}

/** Drops ids that no longer exist. */
export function pruneView(s: ViewSt, all: string[]): ViewSt {
  const live = new Set(all);
  return { hidden: s.hidden.filter((x) => live.has(x)), transparent: s.transparent.filter((x) => live.has(x)), colors: Object.fromEntries(Object.entries(s.colors).filter(([k]) => live.has(k))) };
}

/** Hidden items in the given display order (hidden-items panel). */
export function hiddenList<T extends { id: string }>(s: ViewSt, items: T[]): T[] {
  const h = new Set(s.hidden);
  return items.filter((i) => h.has(i.id));
}

/** Colour palette of the 「色を変える」 menu. */
export const VIEW_PALETTE = ["#d9534f", "#f0ad4e", "#f7e463", "#5cb85c", "#2bb3a3", "#5bc0de", "#337ab7", "#8e6bd6", "#d36fb4", "#8b5a2b", "#7f8c8d", "#2c3e50"];

// ------------------------------------------------- saved views (parts) ---

/** Saved display state of a part (表示状態): camera, body visibility / transparency / colours, sections, style. */
export interface PartView {
  id: string;
  name: string;
  camera: { target: [number, number, number]; quat: [number, number, number, number]; height: number; perspective: boolean };
  hidden: string[];
  transparent: string[];
  colors: Record<string, string>;
  sections: { normal: [number, number, number]; constant: number }[];
  style: string;
  saved: string;
}

/** The body state stored in a saved view. */
export function partViewState(v: PartView): ViewSt {
  return { hidden: [...(v.hidden ?? [])], transparent: [...(v.transparent ?? [])], colors: { ...(v.colors ?? {}) } };
}

export function nextPartViewName(views: { name: string }[]): string {
  const used = new Set(views.map((v) => v.name));
  for (let i = 1; ; i++) if (!used.has(`ビュー${i}`)) return `ビュー${i}`;
}
