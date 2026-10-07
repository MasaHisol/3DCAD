// Standard parts library (Inventor Content Center / SOLIDWORKS Toolbox
// equivalent). Every part is generated as an ordinary parametric part
// document — head / nut / shank sizes are user parameters, threads are
// cosmetic thread features — so it can be edited like any other part.

import { MATERIALS, newDocument } from "../core/document";
import { tapDrill, threadByName } from "../core/threads";
import type { Feature, PartDocument, PlaneDef, SkEntity, SketchFeature } from "../core/types";

export interface LibItem {
  /** Size designation shown in the size list. */
  size: string;
  /** Length choices (mm), empty for parts without a length. */
  lengths: number[];
}

export interface LibFamily {
  id: string;
  category: string;
  name: string;
  standard: string;
  /** Short description for the dialog. */
  note: string;
  icon: string;
  items: LibItem[];
  build(size: string, length: number): PartDocument;
}

const STD_LENGTHS = [5, 6, 8, 10, 12, 16, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 80, 90, 100, 110, 120];
const fx = (n: number) => String(+n.toFixed(3));
const steel = () => ({ ...(MATERIALS.find((m) => m.name === "鋼") ?? MATERIALS[0]) });

/** Plane parallel to XZ at height y (normal +Y or -Y). */
const planeY = (y: number, down = false): PlaneDef => ({ origin: [0, y, 0], xDir: [1, 0, 0], normal: [0, down ? -1 : 1, 0] });

let seq = 0;
const nid = (p: string) => `${p}${++seq}`;

/** Regular hexagon sketch (across flats s), centred on the axis. */
function hexSketch(name: string, plane: PlaneDef, s: number): SketchFeature {
  const R = s / Math.sqrt(3);
  const pts: SkEntity[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    pts.push({ id: `h${i}`, type: "point", x: R * Math.cos(a), y: R * Math.sin(a) });
  }
  const lines: SkEntity[] = pts.map((_, i) => ({ id: `l${i}`, type: "line", p1: `h${i}`, p2: `h${(i + 1) % 6}` }));
  return { id: nid("sk"), type: "sketch", name, plane, planeLabel: "標準部品", entities: [...pts, ...lines], constraints: [], dimensions: [] };
}

function pointSketch(name: string, plane: PlaneDef): SketchFeature {
  return { id: nid("sk"), type: "sketch", name, plane, planeLabel: "標準部品", entities: [{ id: "c", type: "point", x: 0, y: 0 }], constraints: [], dimensions: [] };
}

interface Builder {
  doc: PartDocument;
  param(name: string, v: number, comment: string): string;
  add(...f: Feature[]): void;
}

function start(name: string, number: string, desc: string, standard: string): Builder {
  seq = 0;
  const doc = newDocument(name);
  doc.material = steel();
  doc.iprops["パーツ番号"] = number;
  doc.iprops["説明"] = desc;
  doc.iprops["規格"] = standard;
  doc.iprops["材質"] = doc.material.name;
  doc.iprops["標準部品"] = "はい";
  return {
    doc,
    param(n, v, comment) {
      doc.params.push({ name: n, expr: fx(v), unit: "mm", kind: "user", comment });
      return n;
    },
    add(...f) {
      doc.features.push(...f);
      doc.endOfPart = doc.features.length;
    },
  };
}

const cyl = (name: string, plane: PlaneDef, dia: string, h: string, op: "new" | "join" | "cut"): Feature => ({
  id: nid("cy"),
  type: "cylinder",
  name,
  plane,
  center: [0, 0],
  a: dia,
  b: "0",
  c: h,
  op,
});

/** Cosmetic thread on the shank (axis Y, from y=0 down to -L), starting at the tip. */
function shankThread(b: Builder, L: number, d: number, threadLen: string, full: boolean): Feature {
  return {
    id: nid("th"),
    type: "thread",
    name: "ねじ1",
    face: { center: [0, -L / 2, 0], normal: [0, 0, 1], type: "CYLINDRE" },
    size: `M${fx(d)}`,
    length: threadLen,
    full,
    offset: b.param("ねじオフセット", 0, "先端からのオフセット"),
    flip: true,
  };
}

// --------------------------------------------------------------- tables ---

// ISO 4017 hex head screw: d -> [s, k]
const HEX_BOLT: Record<number, [number, number]> = { 3: [5.5, 2], 4: [7, 2.8], 5: [8, 3.5], 6: [10, 4], 8: [13, 5.3], 10: [16, 6.4], 12: [18, 7.5], 16: [24, 10], 20: [30, 12.5], 24: [36, 15] };
// ISO 4762 socket head cap screw: d -> [dk, k, s, t]
const SHCS: Record<number, [number, number, number, number]> = {
  3: [5.5, 3, 2.5, 1.3], 4: [7, 4, 3, 2], 5: [8.5, 5, 4, 2.5], 6: [10, 6, 5, 3], 8: [13, 8, 6, 4], 10: [16, 10, 8, 5], 12: [18, 12, 10, 6], 16: [24, 16, 14, 8], 20: [30, 20, 17, 10], 24: [36, 24, 19, 12],
};
// ISO 4032 hex nut: d -> [s, m]
const NUT: Record<number, [number, number]> = { 3: [5.5, 2.4], 4: [7, 3.2], 5: [8, 4.7], 6: [10, 5.2], 8: [13, 6.8], 10: [16, 8.4], 12: [18, 10.8], 16: [24, 14.8], 20: [30, 18], 24: [36, 21.5] };
// ISO 7089 plain washer: d -> [d1, d2, h]
const WASHER: Record<number, [number, number, number]> = {
  3: [3.2, 7, 0.5], 4: [4.3, 9, 0.8], 5: [5.3, 10, 1], 6: [6.4, 12, 1.6], 8: [8.4, 16, 1.6], 10: [10.5, 20, 2], 12: [13, 24, 2.5], 16: [17, 30, 3], 20: [21, 37, 3], 24: [25, 44, 4],
};
// ISO 2338 parallel pin diameters
const PINS = [2, 3, 4, 5, 6, 8, 10, 12, 16, 20];
// deep groove ball bearings: name -> [d, D, B]
const BEARINGS: Record<string, [number, number, number]> = {
  "6000": [10, 26, 8], "6001": [12, 28, 8], "6002": [15, 32, 9], "6003": [17, 35, 10], "6004": [20, 42, 12], "6005": [25, 47, 12], "6006": [30, 55, 13],
  "6200": [10, 30, 9], "6201": [12, 32, 10], "6202": [15, 35, 11], "6203": [17, 40, 12], "6204": [20, 47, 14], "6205": [25, 52, 15], "6206": [30, 62, 16],
};

const metric = (tbl: Record<number, unknown>) => Object.keys(tbl).map(Number).sort((a, b) => a - b);
const dOf = (size: string) => Number(size.replace(/^M/, ""));
const lengthsFor = (d: number, min: number, max: number) => STD_LENGTHS.filter((l) => l >= Math.max(min, d) && l <= max);

// ------------------------------------------------------------- families ---

export const LIBRARY: LibFamily[] = [
  {
    id: "iso4762",
    category: "ボルト",
    name: "六角穴付きボルト",
    standard: "ISO 4762 / JIS B 1176",
    note: "キャップボルト。座ぐり穴 (穴コマンドの「キリ穴」+ 座ぐり) と組み合わせて使います。",
    icon: "thread",
    items: metric(SHCS).map((d) => ({ size: `M${d}`, lengths: lengthsFor(d, d * 1.5, d * 10) })),
    build(size, L) {
      const d = dOf(size);
      const [dk, k, s, t] = SHCS[d];
      const b = start(`六角穴付きボルト ${size}×${L}`, `ISO 4762 ${size}×${L}`, "六角穴付きボルト", "ISO 4762");
      const pd = b.param("d", d, "呼び径"), pL = b.param("L", L, "長さ");
      const pdk = b.param("dk", dk, "頭部径"), pk = b.param("k", k, "頭部高さ"), pt = b.param("t", t, "六角穴深さ");
      const bl = 2 * d + 12;
      const pb = b.param("b", bl, "ねじ長さ");
      const sock = hexSketch("六角穴", planeY(k), s);
      b.add(
        cyl("頭部", planeY(0), pdk, pk, "new"),
        cyl("軸部", planeY(0, true), pd, pL, "join"),
        sock,
        { id: nid("ex"), type: "extrude", name: "六角穴", sketch: sock.id, profiles: [0], profilePts: [[0, 0]], op: "cut", extent: "distance", distance: pt, flip: true },
        shankThread(b, L, d, pb, L <= bl),
      );
      return b.doc;
    },
  },
  {
    id: "iso4017",
    category: "ボルト",
    name: "六角ボルト (全ねじ)",
    standard: "ISO 4017 / JIS B 1180",
    note: "全ねじの六角ボルト。ナット・座金と組み合わせて使います。",
    icon: "thread",
    items: metric(HEX_BOLT).map((d) => ({ size: `M${d}`, lengths: lengthsFor(d, d * 2, d * 10) })),
    build(size, L) {
      const d = dOf(size);
      const [s, k] = HEX_BOLT[d];
      const b = start(`六角ボルト ${size}×${L}`, `ISO 4017 ${size}×${L}`, "六角ボルト (全ねじ)", "ISO 4017");
      const pd = b.param("d", d, "呼び径"), pL = b.param("L", L, "長さ"), pk = b.param("k", k, "頭部高さ");
      b.param("s", s, "二面幅");
      const head = hexSketch("頭部", planeY(0), s);
      b.add(
        head,
        { id: nid("ex"), type: "extrude", name: "頭部", sketch: head.id, profiles: [0], profilePts: [[0, 0]], op: "new", extent: "distance", distance: pk, flip: false },
        cyl("軸部", planeY(0, true), pd, pL, "join"),
        shankThread(b, L, d, pL, true),
      );
      return b.doc;
    },
  },
  {
    id: "iso4032",
    category: "ナット",
    name: "六角ナット (1 種)",
    standard: "ISO 4032 / JIS B 1181",
    note: "めねじはねじ穴 (タップ) として作成されます。",
    icon: "thread",
    items: metric(NUT).map((d) => ({ size: `M${d}`, lengths: [] })),
    build(size) {
      const d = dOf(size);
      const [s, m] = NUT[d];
      const b = start(`六角ナット ${size}`, `ISO 4032 ${size}`, "六角ナット", "ISO 4032");
      const pm = b.param("m", m, "高さ");
      b.param("s", s, "二面幅");
      const hex = hexSketch("ナット", planeY(0), s);
      const top = pointSketch("ねじ穴位置", planeY(m));
      const dia = b.param("下穴径", tapDrill(threadByName(size)!), "タップ下穴");
      b.add(
        hex,
        { id: nid("ex"), type: "extrude", name: "ナット", sketch: hex.id, profiles: [0], profilePts: [[0, 0]], op: "new", extent: "distance", distance: pm, flip: false },
        top,
        {
          id: nid("ho"), type: "hole", name: "ねじ穴", sketch: top.id, points: [], holeType: "simple", diameter: dia, depth: pm, through: true,
          cbDiameter: "0", cbDepth: "0", csDiameter: "0", csAngle: "90", flip: false, standard: "tapped", size, threadFull: true,
        },
      );
      return b.doc;
    },
  },
  {
    id: "iso7089",
    category: "座金",
    name: "平座金",
    standard: "ISO 7089 / JIS B 1256",
    note: "並形・面取りなし。",
    icon: "torus",
    items: metric(WASHER).map((d) => ({ size: `M${d}`, lengths: [] })),
    build(size) {
      const d = dOf(size);
      const [d1, d2, h] = WASHER[d];
      const b = start(`平座金 ${size}`, `ISO 7089 ${size}`, "平座金", "ISO 7089");
      const p1 = b.param("d1", d1, "内径"), p2 = b.param("d2", d2, "外径"), ph = b.param("h", h, "厚さ");
      b.add(cyl("座金", planeY(0), p2, ph, "new"), cyl("内径", planeY(0), p1, ph, "cut"));
      return b.doc;
    },
  },
  {
    id: "iso2338",
    category: "ピン",
    name: "平行ピン",
    standard: "ISO 2338 / JIS B 1354",
    note: "公差 m6。",
    icon: "cylinder",
    items: PINS.map((d) => ({ size: `φ${d}`, lengths: STD_LENGTHS.filter((l) => l >= d * 2 && l <= d * 10) })),
    build(size, L) {
      const d = Number(size.replace("φ", ""));
      const b = start(`平行ピン ${size}×${L}`, `ISO 2338 ${d} m6×${L}`, "平行ピン", "ISO 2338");
      const pd = b.param("d", d, "直径"), pL = b.param("L", L, "長さ");
      b.add(cyl("ピン", planeY(0, true), pd, pL, "new"));
      return b.doc;
    },
  },
  {
    id: "bearing",
    category: "軸受",
    name: "深溝玉軸受",
    standard: "ISO 15 / JIS B 1521",
    note: "外形 (内径・外径・幅) のみの簡略モデル。軸・ハウジングとの「挿入」拘束に使えます。",
    icon: "revolve",
    items: Object.keys(BEARINGS).map((n) => ({ size: n, lengths: [] })),
    build(size) {
      const [d, D, B] = BEARINGS[size];
      const b = start(`深溝玉軸受 ${size}`, `${size}`, `深溝玉軸受 ${size} (d${d}×D${D}×B${B})`, "ISO 15");
      const pd = b.param("d", d, "内径"), pD = b.param("D", D, "外径"), pB = b.param("B", B, "幅");
      // outer ring, inner ring and the gap between them (ball space)
      const mid1 = b.param("d_o", d + (D - d) * 0.32, "内輪外径"), mid2 = b.param("D_i", D - (D - d) * 0.32, "外輪内径");
      b.add(
        cyl("外輪", planeY(0), pD, pB, "new"),
        cyl("内径", planeY(0), pd, pB, "cut"),
        cyl("溝", planeY(B * 0.15), mid2, fx(B * 0.7), "cut"),
        cyl("内輪", planeY(B * 0.15), mid1, fx(B * 0.7), "join"),
        cyl("内径2", planeY(0), pd, pB, "cut"),
      );
      b.doc.material = { ...(MATERIALS.find((m) => m.name === "ステンレス鋼") ?? MATERIALS[0]) };
      b.doc.iprops["材質"] = "軸受鋼";
      return b.doc;
    },
  },
];

export function libFamily(id: string): LibFamily | undefined {
  return LIBRARY.find((f) => f.id === id);
}
