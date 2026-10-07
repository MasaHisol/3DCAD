/// <reference lib="webworker" />
// Rules run here: no DOM, and network / script loading are removed before
// any rule code executes.
import { runRule, type RuleContext } from "./engine";

const g = self as unknown as Record<string, unknown>;
for (const k of ["fetch", "XMLHttpRequest", "WebSocket", "EventSource", "importScripts", "indexedDB", "caches", "Worker", "SharedWorker", "BroadcastChannel", "WebTransport"]) {
  try {
    Object.defineProperty(g, k, { value: undefined, writable: false, configurable: false });
  } catch {
    g[k] = undefined;
  }
}

self.onmessage = (e: MessageEvent<{ rules: { name: string; code: string }[]; ctx: RuleContext }>) => {
  const { rules, ctx } = e.data;
  const results = [];
  let cur = ctx;
  for (const r of rules) {
    try {
      const res = runRule(r.code, cur);
      results.push({ name: r.name, result: res });
      // later rules see the earlier rules' changes
      cur = {
        ...cur,
        params: { ...cur.params, ...res.params },
        features: { ...cur.features, ...res.suppress },
        iprops: { ...cur.iprops, ...res.iprops },
        material: res.material ?? cur.material,
      };
    } catch (err) {
      results.push({ name: r.name, error: (err as Error).message });
    }
  }
  self.postMessage(results);
};
