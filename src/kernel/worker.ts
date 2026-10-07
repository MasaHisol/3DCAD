/// <reference lib="webworker" />
// Geometry worker: owns the OpenCascade instance so modelling never blocks the UI.
import opencascade from "replicad-opencascadejs";
import wasmUrl from "replicad-opencascadejs/wasm?url";
import { setOC } from "replicad";
import { drawView, exportPlaced, GeometryEngine, interferences, placeShape } from "./geometry";
import type { BodyMesh, Placement, ThreadInfo, WorkerRequest, WorkerResponse } from "./protocol";
import type { Vec3 } from "../core/types";

/** Threads of a placed part, in assembly coordinates (column-major matrix). */
function placedThreads(ps: Placement[]): ThreadInfo[] {
  return ps.flatMap((p) => {
    const m = p.matrix;
    const pt = (v: Vec3, w: number): Vec3 => [0, 1, 2].map((i) => m[i] * v[0] + m[4 + i] * v[1] + m[8 + i] * v[2] + m[12 + i] * w) as Vec3;
    return engineFor(p.key).threads.map((t) => ({ ...t, origin: pt(t.origin, 1), dir: pt(t.dir, 0) }));
  });
}

const engines = new Map<string, GeometryEngine>();
let ready: Promise<void> | null = null;

function engineFor(key = "main"): GeometryEngine {
  let e = engines.get(key);
  if (!e) {
    e = new GeometryEngine();
    engines.set(key, e);
  }
  return e;
}

function placed(ps: Placement[]) {
  const out: { shape: ReturnType<typeof placeShape>; name: string; index: number }[] = [];
  ps.forEach((p, index) => {
    for (const b of engineFor(p.key).bodies) out.push({ shape: placeShape(b, p.matrix), name: p.name, index });
  });
  return out;
}

function init(): Promise<void> {
  if (!ready) {
    ready = (async () => {
      const OC = await (opencascade as unknown as (o: object) => Promise<unknown>)({ locateFile: () => wasmUrl });
      setOC(OC as never);
    })();
  }
  return ready;
}

async function handle(req: WorkerRequest): Promise<{ result: unknown; transfer: Transferable[] }> {
  await init();
  const eng = engineFor("key" in req ? req.key : undefined);
  switch (req.kind) {
    case "init":
      return { result: true, transfer: [] };
    case "dropEngine":
      engines.delete(req.key);
      return { result: true, transfer: [] };
    case "drawViews": {
      const items = req.placements
        ? placed(req.placements).map((x) => ({ shape: x.shape, tag: x.index }))
        : eng.bodies.map((shape, i) => ({ shape, tag: i }));
      const threads = req.placements ? placedThreads(req.placements) : eng.threads;
      return { result: req.views.map((v) => drawView(items, v, threads)), transfer: [] };
    }
    case "exportAssembly": {
      const buf = await exportPlaced(placed(req.placements), req.format).arrayBuffer();
      return { result: buf, transfer: [buf] };
    }
    case "interference": {
      const shapes = placed(req.placements);
      const hits = interferences(shapes.map((x) => x.shape)).map((h) => ({ a: shapes[h.a].index, b: shapes[h.b].index, volume: h.volume }));
      return { result: hits.filter((h) => h.a !== h.b), transfer: [] };
    }
    case "rebuild": {
      const res = await eng.rebuild(req.features, req.captureBefore);
      const transfer: Transferable[] = [];
      for (const b of [...res.bodies, ...(res.before ?? [])] as BodyMesh[])
        transfer.push(b.positions.buffer, b.normals.buffer, b.indices.buffer, b.faceRanges.buffer, b.edgePositions.buffer, b.edgeRanges.buffer);
      return { result: res, transfer };
    }
    case "export": {
      const blob = eng.exportFile(req.format, req.name);
      const buf = await blob.arrayBuffer();
      return { result: buf, transfer: [buf] };
    }
    case "massProps":
      return { result: eng.massProps(), transfer: [] };
    case "measure":
      return { result: eng.measure(req.a, req.b), transfer: [] };
    case "projection":
      return { result: req.placements ? eng.projection(req.views, placed(req.placements).map((x) => x.shape)) : eng.projection(req.views), transfer: [] };
  }
}

self.onmessage = async (ev: MessageEvent<{ id: number; req: WorkerRequest }>) => {
  const { id, req } = ev.data;
  try {
    const { result, transfer } = await handle(req);
    (self as unknown as Worker).postMessage({ id, ok: true, result } satisfies WorkerResponse, transfer);
  } catch (e) {
    const msg = e instanceof Error ? e.message : typeof e === "number" ? "OpenCascade 例外が発生しました" : String(e);
    (self as unknown as Worker).postMessage({ id, ok: false, error: msg } satisfies WorkerResponse);
  }
};
