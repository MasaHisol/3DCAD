/// <reference lib="webworker" />
// Helper thread of the analysis: computes K·x for a range of elements.
// The page starts it and hands over a MessagePort to the analysis worker.
import { kxRange, type KxJob } from "./par";

let ctrl: Int32Array | null = null;
let job: KxJob | null = null;

type Msg = { type: string; ctrl?: Int32Array; job?: KxJob; id?: number; slot?: number; e0?: number; e1?: number };

function handle(m: Msg) {
  if (m.type === "ctrl") ctrl = m.ctrl!;
  else if (m.type === "job") job = m.job!;
  else if (m.type === "run" && ctrl) {
    if (job && job.id === m.id) {
      const off = m.slot! * job.n3;
      job.y.fill(0, off, off + job.n3);
      kxRange(job.conn, job.phi, job.KE, job.x, job.y, off, m.e0!, m.e1!);
    }
    Atomics.add(ctrl, 0, 1);
    Atomics.notify(ctrl, 0);
  }
}

self.onmessage = (e: MessageEvent<{ type: string; port?: MessagePort }>) => {
  if (e.data.type !== "port") return;
  const port = e.data.port!;
  port.onmessage = (ev: MessageEvent<Msg>) => handle(ev.data);
  port.postMessage("ready");
};
