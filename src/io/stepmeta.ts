// STEP (ISO 10303-21) metadata reader: product names, assembly structure with
// placements, and colours (STYLED_ITEM -> COLOUR_RGB). The bundled kernel only
// has the plain STEPControl_Reader (no XCAF reader), so this parses the text
// itself and the kernel matches the solids it read to the entries here by
// their vertex bounding boxes.

export type Mat4 = number[]; // column-major 4x4

export interface StepSolidMeta {
  /** Entity id of the solid (MANIFOLD_SOLID_BREP, BREP_WITH_VOIDS, ...). */
  id: number;
  kind: string;
  /** Vertex bounding box in the product's own coordinates (mm). */
  bbox: [number[], number[]] | null;
  faces: number;
  color?: string;
  name?: string;
}

export interface StepNode {
  /** Instance name (NAUO) or product name for the roots. */
  name: string;
  product: string;
  /** Product definition entity id (shared by every instance of the product). */
  pd: number;
  /** Transform of this node relative to its parent (column-major). */
  matrix: Mat4;
  children: StepNode[];
  solids: StepSolidMeta[];
}

export interface StepMeta {
  /** File length unit -> mm. */
  unit: number;
  roots: StepNode[];
}

export interface StepLeaf {
  path: string[];
  product: string;
  pd: number;
  /** Placement of the product in the model (column-major, mm). */
  matrix: Mat4;
  solid: StepSolidMeta;
}

type Arg = number | string | { ref: number } | { enum: string } | null | Arg[] | { type: string; args: Arg[] };
interface Ent {
  type: string;
  args: Arg[];
  /** Complex (multi-type) entity parts. */
  parts?: { type: string; args: Arg[] }[];
}

/** Parses the DATA section into entities. */
export function parseStepEntities(text: string): Map<number, Ent> {
  const out = new Map<number, Ent>();
  const start = text.search(/\bDATA\s*(\([^)]*\))?\s*;/);
  if (start < 0) return out;
  let i = text.indexOf(";", start) + 1;
  const n = text.length;
  const ws = () => {
    for (;;) {
      while (i < n && /\s/.test(text[i])) i++;
      if (text[i] === "/" && text[i + 1] === "*") {
        const e = text.indexOf("*/", i + 2);
        i = e < 0 ? n : e + 2;
      } else break;
    }
  };
  const ident = () => {
    const s = i;
    while (i < n && /[A-Za-z0-9_\-]/.test(text[i])) i++;
    return text.slice(s, i).toUpperCase();
  };
  const value = (): Arg => {
    ws();
    const c = text[i];
    if (c === "'") {
      let s = "";
      i++;
      for (;;) {
        const j = text.indexOf("'", i);
        if (j < 0) {
          i = n;
          break;
        }
        s += text.slice(i, j);
        i = j + 1;
        if (text[i] === "'") {
          s += "'";
          i++;
        } else break;
      }
      return decodeStepString(s);
    }
    if (c === "#") {
      i++;
      const s = i;
      while (i < n && /\d/.test(text[i])) i++;
      return { ref: +text.slice(s, i) };
    }
    if (c === "(") {
      i++;
      const list: Arg[] = [];
      ws();
      if (text[i] === ")") {
        i++;
        return list;
      }
      for (;;) {
        list.push(value());
        ws();
        if (text[i] === ",") i++;
        else {
          i++; // ')'
          break;
        }
      }
      return list;
    }
    if (c === "$" || c === "*") {
      i++;
      return null;
    }
    if (c === ".") {
      const j = text.indexOf(".", i + 1);
      const e = text.slice(i + 1, j);
      i = j + 1;
      return { enum: e };
    }
    if (c === '"') {
      const j = text.indexOf('"', i + 1);
      i = j + 1;
      return null;
    }
    if (/[A-Za-z]/.test(c)) {
      // typed parameter, e.g. LENGTH_MEASURE(1.)
      const t = ident();
      ws();
      const v = value();
      return { type: t, args: Array.isArray(v) ? v : [v] };
    }
    const s = i;
    while (i < n && /[-+0-9.Ee]/.test(text[i])) i++;
    return parseFloat(text.slice(s, i));
  };
  for (;;) {
    ws();
    if (i >= n || text.startsWith("ENDSEC", i)) break;
    if (text[i] !== "#") {
      // skip anything unexpected up to the next statement
      const j = text.indexOf(";", i);
      if (j < 0) break;
      i = j + 1;
      continue;
    }
    i++;
    const s = i;
    while (i < n && /\d/.test(text[i])) i++;
    const id = +text.slice(s, i);
    ws();
    i++; // '='
    ws();
    if (text[i] === "(") {
      i++;
      const parts: { type: string; args: Arg[] }[] = [];
      for (;;) {
        ws();
        if (text[i] === ")") {
          i++;
          break;
        }
        const t = ident();
        const a = value();
        parts.push({ type: t, args: Array.isArray(a) ? a : [] });
      }
      out.set(id, { type: parts.map((p) => p.type).join("+"), args: [], parts });
    } else {
      const t = ident();
      const a = value();
      out.set(id, { type: t, args: Array.isArray(a) ? a : [] });
    }
    ws();
    if (text[i] === ";") i++;
  }
  return out;
}

/** \X2\...\X0\ (UTF-16 hex) and \X\hh escapes of STEP strings. */
export function decodeStepString(s: string): string {
  return s
    .replace(/\\X2\\([0-9A-Fa-f]+)\\X0\\/g, (_, h: string) => {
      let r = "";
      for (let k = 0; k + 4 <= h.length; k += 4) r += String.fromCharCode(parseInt(h.slice(k, k + 4), 16));
      return r;
    })
    .replace(/\\X4\\([0-9A-Fa-f]+)\\X0\\/g, (_, h: string) => {
      let r = "";
      for (let k = 0; k + 8 <= h.length; k += 8) r += String.fromCodePoint(parseInt(h.slice(k, k + 8), 16));
      return r;
    })
    .replace(/\\X\\([0-9A-Fa-f]{2})/g, (_, h: string) => String.fromCharCode(parseInt(h, 16)))
    .replace(/\\S\\(.)/g, (_, c: string) => String.fromCharCode(c.charCodeAt(0) + 128))
    .replace(/\\\\/g, "\\");
}

const isRef = (a: Arg): a is { ref: number } => !!a && typeof a === "object" && "ref" in a;
const ref = (a: Arg | undefined) => (a && isRef(a) ? a.ref : 0);
const refs = (a: Arg | undefined): number[] => (Array.isArray(a) ? a.filter(isRef).map((x) => x.ref) : []);
const str = (a: Arg | undefined) => (typeof a === "string" ? a : "");

const SOLID_TYPES = new Set(["MANIFOLD_SOLID_BREP", "BREP_WITH_VOIDS", "FACETED_BREP", "SHELL_BASED_SURFACE_MODEL"]);
const TOPO_TYPES = new Set([
  "MANIFOLD_SOLID_BREP", "BREP_WITH_VOIDS", "FACETED_BREP", "SHELL_BASED_SURFACE_MODEL", "CLOSED_SHELL", "OPEN_SHELL", "ORIENTED_CLOSED_SHELL", "ORIENTED_OPEN_SHELL",
  "CONNECTED_FACE_SET", "FACE_BOUND", "FACE_OUTER_BOUND", "EDGE_LOOP", "ORIENTED_EDGE", "EDGE_CURVE", "VERTEX_LOOP",
]);
const IDENTITY: Mat4 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

export function mul4(a: Mat4, b: Mat4): Mat4 {
  const r = new Array(16).fill(0);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) for (let k = 0; k < 4; k++) r[j * 4 + i] += a[k * 4 + i] * b[j * 4 + k];
  return r;
}
/** Inverse of a rigid transform. */
export function invRigid(m: Mat4): Mat4 {
  const r = [m[0], m[4], m[8], 0, m[1], m[5], m[9], 0, m[2], m[6], m[10], 0, 0, 0, 0, 1];
  const t = [m[12], m[13], m[14]];
  r[12] = -(r[0] * t[0] + r[4] * t[1] + r[8] * t[2]);
  r[13] = -(r[1] * t[0] + r[5] * t[1] + r[9] * t[2]);
  r[14] = -(r[2] * t[0] + r[6] * t[1] + r[10] * t[2]);
  return r;
}
export function applyMat(m: Mat4, p: number[]): number[] {
  return [m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12], m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13], m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14]];
}

export function readStepMeta(text: string): StepMeta {
  const E = parseStepEntities(text);
  const byType = new Map<string, number[]>();
  for (const [id, e] of E) {
    const types = e.parts ? e.parts.map((p) => p.type) : [e.type];
    for (const t of types) {
      if (!byType.has(t)) byType.set(t, []);
      byType.get(t)!.push(id);
    }
  }
  const all = (t: string) => byType.get(t) ?? [];
  const part = (id: number, t: string) => {
    const e = E.get(id);
    if (!e) return null;
    if (e.parts) return e.parts.find((p) => p.type === t) ?? null;
    return e.type === t ? e : null;
  };

  // ---- units
  let unit = 1;
  for (const id of all("LENGTH_UNIT")) {
    const si = part(id, "SI_UNIT");
    const cb = part(id, "CONVERSION_BASED_UNIT");
    if (si) {
      const pre = (si.args[0] as { enum: string } | null)?.enum ?? "";
      unit = ({ MILLI: 1, CENTI: 10, DECI: 100, KILO: 1e6, MICRO: 1e-3 } as Record<string, number>)[pre] ?? (pre ? 1 : 1000);
    } else if (cb) {
      const nm = str(cb.args[0]).toUpperCase();
      unit = nm.includes("INCH") ? 25.4 : nm.includes("FOOT") ? 304.8 : nm.includes("METRE") || nm.includes("METER") ? 1000 : 1;
    }
    break;
  }

  // ---- geometry helpers
  const point = (id: number): number[] => {
    const e = E.get(id);
    const c = e?.args[1];
    return Array.isArray(c) ? (c as number[]).map((x) => +x * unit) : [0, 0, 0];
  };
  const dir = (id: number): number[] => {
    const e = E.get(id);
    const c = e?.args[1];
    const v = Array.isArray(c) ? (c as number[]).map(Number) : [0, 0, 1];
    const l = Math.hypot(v[0], v[1], v[2] ?? 0) || 1;
    return [v[0] / l, v[1] / l, (v[2] ?? 0) / l];
  };
  const axis = (id: number): Mat4 => {
    const e = E.get(id);
    if (!e || e.type !== "AXIS2_PLACEMENT_3D") return IDENTITY;
    const o = point(ref(e.args[1]));
    const z = e.args[2] ? dir(ref(e.args[2])) : [0, 0, 1];
    let x = e.args[3] ? dir(ref(e.args[3])) : Math.abs(z[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
    // orthogonalise x against z
    const d = x[0] * z[0] + x[1] * z[1] + x[2] * z[2];
    x = [x[0] - d * z[0], x[1] - d * z[1], x[2] - d * z[2]];
    const l = Math.hypot(x[0], x[1], x[2]) || 1;
    x = x.map((v) => v / l);
    const y = [z[1] * x[2] - z[2] * x[1], z[2] * x[0] - z[0] * x[2], z[0] * x[1] - z[1] * x[0]];
    return [...x, 0, ...y, 0, ...z, 0, ...o, 1];
  };

  // ---- colours: styled item target -> colour
  const colorOfStyle = (root: Arg, depth = 0): string | undefined => {
    if (depth > 12) return undefined;
    const ids = Array.isArray(root) ? root.flatMap((a) => (isRef(a) ? [a.ref] : Array.isArray(a) ? [] : [])) : isRef(root) ? [root.ref] : [];
    if (Array.isArray(root)) for (const a of root) if (Array.isArray(a)) {
      const c = colorOfStyle(a, depth + 1);
      if (c) return c;
    }
    for (const id of ids) {
      const e = E.get(id);
      if (!e) continue;
      if (e.type === "COLOUR_RGB") {
        const [r, g, b] = [e.args[1], e.args[2], e.args[3]].map((v) => Math.round(Math.min(1, Math.max(0, +(v as number))) * 255));
        return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
      }
      if (e.type === "DRAUGHTING_PRE_DEFINED_COLOUR") {
        const named: Record<string, string> = { red: "#ff0000", green: "#00ff00", blue: "#0000ff", yellow: "#ffff00", magenta: "#ff00ff", cyan: "#00ffff", black: "#000000", white: "#ffffff" };
        const c = named[str(e.args[0]).toLowerCase()];
        if (c) return c;
      }
      // curve styles carry colours of edges only: skip them
      if (e.type === "CURVE_STYLE") continue;
      const c = colorOfStyle(e.args, depth + 1);
      if (c) return c;
    }
    return undefined;
  };
  const itemColor = new Map<number, string>();
  for (const id of [...all("STYLED_ITEM"), ...all("OVER_RIDING_STYLED_ITEM")]) {
    const e = E.get(id)!;
    const target = ref(e.args[2]);
    if (!target || itemColor.has(target)) continue;
    const c = colorOfStyle(e.args[1]);
    if (c) itemColor.set(target, c);
  }

  // ---- solids: vertex bbox and face count (memoised walk of the topology)
  const solidMeta = (id: number): StepSolidMeta => {
    const e = E.get(id)!;
    const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
    const faceIds = new Set<number>();
    const seen = new Set<number>();
    const stack = [id];
    const faceColors = new Map<string, number>();
    while (stack.length) {
      const k = stack.pop()!;
      if (seen.has(k)) continue;
      seen.add(k);
      const x = E.get(k);
      if (!x) continue;
      if (x.type === "VERTEX_POINT") {
        const p = point(ref(x.args[1]));
        for (let a = 0; a < 3; a++) (lo[a] = Math.min(lo[a], p[a])), (hi[a] = Math.max(hi[a], p[a]));
        continue;
      }
      if (x.type === "ADVANCED_FACE" || x.type === "FACE_SURFACE" || x.type === "FACE") {
        faceIds.add(k);
        const fc = itemColor.get(k);
        if (fc) faceColors.set(fc, (faceColors.get(fc) ?? 0) + 1);
        // bounds (loops) only: skip the surface geometry
        for (const b of refs(x.args[1])) stack.push(b);
        continue;
      }
      if (x.type === "POLY_LOOP") {
        for (const p of refs(x.args[1])) {
          const q = point(p);
          for (let a = 0; a < 3; a++) (lo[a] = Math.min(lo[a], q[a])), (hi[a] = Math.max(hi[a], q[a]));
        }
        continue;
      }
      if (!TOPO_TYPES.has(x.type)) continue;
      const visit = (a: Arg) => {
        if (isRef(a)) stack.push(a.ref);
        else if (Array.isArray(a)) a.forEach(visit);
      };
      x.args.forEach(visit);
    }
    let color = itemColor.get(id);
    if (!color && faceColors.size) color = [...faceColors.entries()].sort((a, b) => b[1] - a[1])[0][0];
    return { id, kind: e.type, bbox: lo[0] <= hi[0] ? [lo, hi] : null, faces: faceIds.size, color, name: str(e.args[0]) || undefined };
  };

  // ---- representations: shape rep -> solid items (following rep relationships and mapped items)
  const repSolids = new Map<number, number[]>();
  const repLinks = new Map<number, number[]>();
  const link = (a: number, b: number) => {
    if (!repLinks.has(a)) repLinks.set(a, []);
    repLinks.get(a)!.push(b);
  };
  for (const id of all("SHAPE_REPRESENTATION_RELATIONSHIP")) {
    const e = E.get(id)!;
    if (e.parts) continue; // with transformation: assembly placement, handled below
    const [r1, r2] = [ref(e.args[2]), ref(e.args[3])];
    link(r1, r2);
    link(r2, r1);
  }
  const directSolids = (rep: number): number[] => {
    const e = E.get(rep);
    if (!e) return [];
    const items = refs(e.parts ? e.parts.find((p) => p.args.length >= 2)?.args[1] : e.args[1]);
    return items.filter((it) => SOLID_TYPES.has(E.get(it)?.type ?? ""));
  };
  const solidsOfRep = (rep: number): number[] => {
    if (repSolids.has(rep)) return repSolids.get(rep)!;
    const out = new Set<number>();
    const seen = new Set<number>([rep]);
    const q = [rep];
    while (q.length) {
      const r = q.shift()!;
      for (const s of directSolids(r)) out.add(s);
      for (const n of repLinks.get(r) ?? []) if (!seen.has(n)) (seen.add(n), q.push(n));
    }
    repSolids.set(rep, [...out]);
    return repSolids.get(rep)!;
  };

  // ---- products
  const productOfPd = new Map<number, string>();
  for (const id of all("PRODUCT_DEFINITION")) {
    const pdf = E.get(ref(E.get(id)!.args[2]));
    const prod = pdf ? E.get(ref(pdf.args[2])) : undefined;
    productOfPd.set(id, prod ? str(prod.args[1]) || str(prod.args[0]) : `#${id}`);
  }
  // PD -> shape representation (via PRODUCT_DEFINITION_SHAPE + SHAPE_DEFINITION_REPRESENTATION)
  const pdsTarget = new Map<number, number>(); // PDS -> PD or NAUO
  for (const id of all("PRODUCT_DEFINITION_SHAPE")) pdsTarget.set(id, ref(E.get(id)!.args[2]));
  const repOfPd = new Map<number, number>();
  for (const id of all("SHAPE_DEFINITION_REPRESENTATION")) {
    const e = E.get(id)!;
    const target = pdsTarget.get(ref(e.args[0]));
    if (target && E.get(target)?.type === "PRODUCT_DEFINITION") repOfPd.set(target, ref(e.args[1]));
  }
  // NAUO with its placement
  interface Occ {
    id: number;
    name: string;
    parent: number;
    child: number;
    matrix: Mat4;
  }
  const occs: Occ[] = [];
  const nauoPlacement = new Map<number, Mat4>();
  for (const id of all("CONTEXT_DEPENDENT_SHAPE_REPRESENTATION")) {
    const e = E.get(id)!;
    const rr = E.get(ref(e.args[0]));
    const nauo = pdsTarget.get(ref(e.args[1]));
    if (!rr?.parts || !nauo) continue;
    const base = rr.parts.find((p) => p.type === "REPRESENTATION_RELATIONSHIP");
    const wt = rr.parts.find((p) => p.type === "REPRESENTATION_RELATIONSHIP_WITH_TRANSFORMATION");
    if (!base || !wt) continue;
    const idt = E.get(ref(wt.args[0]));
    if (!idt) continue;
    const a1 = axis(ref(idt.args[2])), a2 = axis(ref(idt.args[3]));
    // rep_1 is the child's representation for the usual writers; flip if not
    const rep1 = ref(base.args[2]);
    const nauoEnt = E.get(nauo);
    const childPd = nauoEnt ? ref(nauoEnt.args[4]) : 0;
    const childRep = repOfPd.get(childPd);
    const m = childRep === undefined || childRep === rep1 || solidsOfRep(rep1).some((s) => solidsOfRep(childRep).includes(s)) ? mul4(a2, invRigid(a1)) : mul4(a1, invRigid(a2));
    nauoPlacement.set(nauo, m);
  }
  for (const id of all("NEXT_ASSEMBLY_USAGE_OCCURRENCE")) {
    const e = E.get(id)!;
    occs.push({ id, name: str(e.args[1]) || str(e.args[0]), parent: ref(e.args[3]), child: ref(e.args[4]), matrix: nauoPlacement.get(id) ?? IDENTITY });
  }
  const solidCache = new Map<number, StepSolidMeta>();
  const solidsOfPd = (pd: number): StepSolidMeta[] => {
    const rep = repOfPd.get(pd);
    if (rep === undefined) return [];
    // an assembly's own representation lists only placements: skip solids that belong to children
    return solidsOfRep(rep).map((s) => {
      if (!solidCache.has(s)) solidCache.set(s, solidMeta(s));
      return solidCache.get(s)!;
    });
  };
  const childrenOf = (pd: number) => occs.filter((o) => o.parent === pd).sort((a, b) => a.id - b.id);
  const build = (pd: number, name: string, matrix: Mat4, depth: number): StepNode => {
    const kids = depth < 32 ? childrenOf(pd).map((o) => build(o.child, o.name || productOfPd.get(o.child) || "", o.matrix, depth + 1)) : [];
    // solids reachable from an assembly representation through its children's links are the children's
    const childSolids = new Set(kids.flatMap((k) => collect(k).map((s) => s.id)));
    const own = solidsOfPd(pd).filter((s) => !childSolids.has(s.id));
    return { name, product: productOfPd.get(pd) ?? "", pd, matrix, children: kids, solids: own };
  };
  const childPds = new Set(occs.map((o) => o.child));
  const rootPds = [...productOfPd.keys()].filter((pd) => !childPds.has(pd));
  const roots = rootPds.map((pd) => build(pd, productOfPd.get(pd) ?? "", IDENTITY, 0));
  // solids not reached through any product (rare): one anonymous root
  const reached = new Set(roots.flatMap((r) => collectDeep(r).map((s) => s.id)));
  const orphan = [...SOLID_TYPES].flatMap((t) => all(t)).filter((id) => !reached.has(id));
  if (orphan.length) roots.push({ name: "", product: "", pd: 0, matrix: IDENTITY, children: [], solids: orphan.map(solidMeta) });
  return { unit, roots };
}

function collect(n: StepNode): StepSolidMeta[] {
  return [...n.solids, ...n.children.flatMap(collect)];
}
const collectDeep = collect;

/** Every solid instance with its full path and model placement. */
export function stepLeaves(meta: StepMeta): StepLeaf[] {
  const out: StepLeaf[] = [];
  const walk = (n: StepNode, path: string[], m: Mat4) => {
    const mm = mul4(m, n.matrix);
    const p = n.name ? [...path, n.name] : path;
    for (const s of n.solids) out.push({ path: p, product: n.product, pd: n.pd, matrix: mm, solid: s });
    for (const c of n.children) walk(c, p, mm);
  };
  for (const r of meta.roots) walk(r, [], IDENTITY);
  return out;
}

/** World-space vertex bounding box of a leaf. */
export function leafBox(l: StepLeaf): [number[], number[]] | null {
  if (!l.solid.bbox) return null;
  const [a, b] = l.solid.bbox;
  const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  for (const x of [a[0], b[0]]) for (const y of [a[1], b[1]]) for (const z of [a[2], b[2]]) {
    const p = applyMat(l.matrix, [x, y, z]);
    for (let k = 0; k < 3; k++) (lo[k] = Math.min(lo[k], p[k])), (hi[k] = Math.max(hi[k], p[k]));
  }
  return [lo, hi];
}

/**
 * Matches solids read by the kernel (vertex bounding boxes + face counts, in
 * reading order) to the STEP leaves. Returns the leaf index for each solid
 * (or -1).
 */
export function matchSolids(leaves: StepLeaf[], solids: { bbox: [number[], number[]]; faces: number }[]): number[] {
  const boxes = leaves.map(leafBox);
  const used = new Set<number>();
  return solids.map((s, si) => {
    const diag = Math.hypot(...s.bbox[1].map((v, k) => v - s.bbox[0][k])) || 1;
    let best = -1, bestScore = Infinity;
    // prefer the leaf at the same position in reading order when it fits
    const order = [si, ...leaves.keys()];
    for (const li of order) {
      if (li >= leaves.length || used.has(li) || !boxes[li]) continue;
      const b = boxes[li]!;
      let d = 0;
      for (let k = 0; k < 3; k++) d = Math.max(d, Math.abs(b[0][k] - s.bbox[0][k]), Math.abs(b[1][k] - s.bbox[1][k]));
      const score = d / diag + (leaves[li].solid.faces && leaves[li].solid.faces !== s.faces ? 0.05 : 0);
      if (score < bestScore - 1e-12) (bestScore = score), (best = li);
    }
    if (best >= 0 && bestScore < 0.02) {
      used.add(best);
      return best;
    }
    return -1;
  });
}
