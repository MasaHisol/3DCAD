// Render backend selection (engine #4 描画エンジン): WebGPU when the browser /
// Electron provides a working adapter, WebGL 2 otherwise. The choice is a
// preference ("auto" | "webgpu" | "webgl", localStorage or ?renderer=); "auto"
// tries WebGPU and falls back to WebGL automatically when there is no
// adapter, the device cannot be created, initialisation throws, or the device
// is lost later. Features that need GLSL (zebra stripes, weighted blended OIT,
// the GPU ID buffer readback, which is synchronous only in WebGL) degrade to
// their portable variants under WebGPU.

export type BackendKind = "webgl" | "webgpu";
export type BackendPref = "auto" | BackendKind;

export interface BackendInfo {
  kind: BackendKind;
  /** Why this backend is used (fallback reason when WebGPU was wanted). */
  reason: string;
  /** Adapter description (WebGPU) or GL renderer string. */
  adapter?: string;
}

const KEY = "3dcad.renderer";

export function backendPref(): BackendPref {
  try {
    const q = new URLSearchParams(location.search).get("renderer");
    if (q === "webgpu" || q === "webgl" || q === "auto") return q;
    const v = localStorage.getItem(KEY);
    if (v === "webgpu" || v === "webgl" || v === "auto") return v;
  } catch {
    /* no storage */
  }
  return "auto";
}

export function setBackendPref(p: BackendPref) {
  try {
    localStorage.setItem(KEY, p);
  } catch {
    /* no storage */
  }
}

const keepAlive: unknown[] = [];

/** Whether a WebGPU adapter can be obtained (and a description of it). */
export async function probeWebGPU(): Promise<{ ok: boolean; reason: string; adapter?: string }> {
  const gpu = (globalThis.navigator as unknown as { gpu?: { requestAdapter(o?: object): Promise<unknown> } } | undefined)?.gpu;
  if (!gpu) return { ok: false, reason: "navigator.gpu がありません (WebGPU 非対応)" };
  try {
    const a = (await gpu.requestAdapter({ powerPreference: "high-performance" })) as { info?: { vendor?: string; architecture?: string; description?: string } } | null;
    if (!a) return { ok: false, reason: "WebGPU アダプタがありません" };
    // no device here: the renderer creates the only one (a second, destroyed
    // device can take the GPU instance down with it on some drivers)
    keepAlive.push(a);
    const i = a.info ?? {};
    return { ok: true, reason: "WebGPU", adapter: [i.vendor, i.architecture, i.description].filter(Boolean).join(" ") || "WebGPU" };
  } catch (e) {
    return { ok: false, reason: `WebGPU の初期化に失敗: ${e instanceof Error ? e.message : String(e)}` };
  }
}

/** Decides the backend to start with (the caller still falls back if creating the renderer fails). */
export async function chooseBackend(pref = backendPref()): Promise<BackendInfo & { probe?: string }> {
  if (pref === "webgl") return { kind: "webgl", reason: "設定で WebGL を選択" };
  const p = await probeWebGPU();
  if (p.ok) return { kind: "webgpu", reason: pref === "webgpu" ? "設定で WebGPU を選択" : "WebGPU を自動選択", adapter: p.adapter };
  return { kind: "webgl", reason: `WebGL に自動切替 (${p.reason})` };
}

/**
 * Compatibility shim: three.js r18x passes `swizzle: "rgba"` (identity) in
 * every texture view descriptor; Chromium builds that predate the
 * texture-component-swizzle feature reject the member's type. The identity
 * swizzle is the default, so it is dropped before calling the browser.
 */
export function installWebGPUShims() {
  const proto = (globalThis as unknown as { GPUTexture?: { prototype: { createView(d?: object): unknown; __cadShim?: boolean } } }).GPUTexture?.prototype;
  if (!proto || proto.__cadShim) return;
  const orig = proto.createView;
  proto.createView = function (this: unknown, d?: { swizzle?: unknown }) {
    if (d && d.swizzle === "rgba") {
      const { swizzle: _s, ...rest } = d;
      void _s;
      return orig.call(this, rest);
    }
    return orig.call(this, d);
  };
  proto.__cadShim = true;
}
