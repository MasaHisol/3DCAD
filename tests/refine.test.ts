import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MeshRefiner } from "../src/viewer/render/refine";
import type { BodyMesh } from "../src/kernel/protocol";
import type { TessQuality } from "../src/kernel/tessellation";

const mesh = (quality: TessQuality, tolerance: number) => ({ tess: { quality, tolerance, linear: tolerance * 0.45, angular: 0.5, version: "v" } }) as unknown as BodyMesh;

describe("progressive / view-dependent refinement", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  const setup = () => {
    let ps = 1;
    let token = 1;
    const asked: TessQuality[] = [];
    const applied: TessQuality[] = [];
    const r = new MeshRefiner({
      remesh: async (q) => {
        asked.push(q);
        return { bodies: [mesh(q, q === "fine" ? 0.025 : 0.1)], surfaces: [] };
      },
      apply: (_r, q, t) => {
        if (t !== token) return false;
        applied.push(q);
        return true;
      },
      pixelSize: () => ps,
      token: () => token,
    });
    return { r, asked, applied, setPs: (v: number) => (ps = v), bump: () => token++ };
  };

  it("refines a coarse first display to the normal level in the background", async () => {
    const t = setup();
    t.r.afterRebuild(true, [mesh("coarse", 0.4)]);
    expect(t.r.level).toBe("coarse");
    await vi.advanceTimersByTimeAsync(100);
    expect(t.asked).toEqual(["normal"]);
    expect(t.r.level).toBe("normal");
  });

  it("requests the fine level when zoomed in and goes back when zoomed out", async () => {
    const t = setup();
    t.r.afterRebuild(false, [mesh("normal", 0.1)]);
    t.setPs(0.5); // 0.2 px error: normal is enough
    t.r.onView();
    await vi.advanceTimersByTimeAsync(500);
    expect(t.asked).toEqual([]);
    t.setPs(0.02); // 5 px error at the normal level
    t.r.onView();
    await vi.advanceTimersByTimeAsync(500);
    expect(t.r.level).toBe("fine");
    t.setPs(0.5);
    t.r.onView();
    await vi.advanceTimersByTimeAsync(500);
    expect(t.r.level).toBe("normal");
    expect(t.applied).toEqual(["fine", "normal"]);
  });

  it("drops refinements of an outdated model", async () => {
    const t = setup();
    t.r.afterRebuild(true, [mesh("coarse", 0.4)]);
    t.bump(); // a new rebuild started
    await vi.advanceTimersByTimeAsync(100);
    expect(t.applied).toEqual([]);
  });
});
