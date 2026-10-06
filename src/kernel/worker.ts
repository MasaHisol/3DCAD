/// <reference lib="webworker" />
// Geometry worker: owns the OpenCascade instance so modelling never blocks the UI.
import opencascade from "replicad-opencascadejs";
import wasmUrl from "replicad-opencascadejs/wasm?url";
import { setOC } from "replicad";
import { GeometryEngine } from "./geometry";
import type { BodyMesh, WorkerRequest, WorkerResponse } from "./protocol";

let engine: GeometryEngine | null = null;
let ready: Promise<void> | null = null;

function init(): Promise<void> {
  if (!ready) {
    ready = (async () => {
      const OC = await (opencascade as unknown as (o: object) => Promise<unknown>)({ locateFile: () => wasmUrl });
      setOC(OC as never);
      engine = new GeometryEngine();
    })();
  }
  return ready;
}

async function handle(req: WorkerRequest): Promise<{ result: unknown; transfer: Transferable[] }> {
  await init();
  const eng = engine!;
  switch (req.kind) {
    case "init":
      return { result: true, transfer: [] };
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
      return { result: eng.projection(req.views), transfer: [] };
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
