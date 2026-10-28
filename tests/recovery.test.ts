import { describe, expect, it } from "vitest";
import { hasContent, OpLog, parseSession, parseSnapshots, pushSnapshot, recoveryDecision, type Snapshot } from "../src/core/recovery";

const part = (n: number) => ({ format: "3dcad-part", features: Array.from({ length: n }, (_, i) => ({ id: `f${i}` })) });
const snap = (t: number, o: Partial<Snapshot> = {}): Snapshot => ({ t, env: "part", part: part(1), asm: null, dirty: true, fileName: null, name: "Part1", session: "a", ...o });

describe("snapshot history", () => {
  it("replaces the newest entry within the interval, starts a new one after it", () => {
    let l: Snapshot[] = [];
    l = pushSnapshot(l, snap(0), 3, 1000);
    l = pushSnapshot(l, snap(500), 3, 1000);
    expect(l.map((s) => s.t)).toEqual([500]);
    l = pushSnapshot(l, snap(2000), 3, 1000);
    l = pushSnapshot(l, snap(4000), 3, 1000);
    l = pushSnapshot(l, snap(6000), 3, 1000);
    expect(l.map((s) => s.t)).toEqual([6000, 4000, 2000]);
  });

  it("never replaces a snapshot of another session (the crashed one)", () => {
    let l = pushSnapshot([], snap(0, { session: "old" }), 3, 60_000);
    l = pushSnapshot(l, snap(10, { session: "new" }), 3, 60_000);
    expect(l.map((s) => s.session)).toEqual(["new", "old"]);
  });

  it("starts a new entry when another file or environment is open", () => {
    let l = pushSnapshot([], snap(0), 3, 60_000);
    l = pushSnapshot(l, snap(10, { env: "assembly", asm: { components: [1] }, part: null }), 3, 60_000);
    l = pushSnapshot(l, snap(20, { env: "assembly", asm: { components: [1] }, part: null, fileName: "a.3dca" }), 3, 60_000);
    expect(l).toHaveLength(3);
  });

  it("detects content for parts and assemblies", () => {
    expect(hasContent(snap(0))).toBe(true);
    expect(hasContent(snap(0, { part: part(0) }))).toBe(false);
    expect(hasContent(snap(0, { env: "assembly", part: null, asm: { components: [] } }))).toBe(false);
    expect(hasContent(snap(0, { env: "assembly", part: null, asm: { components: [{}] } }))).toBe(true);
  });

  it("parses stored history and the legacy single autosave", () => {
    expect(parseSnapshots(JSON.stringify([snap(1), snap(5)])).map((s) => s.t)).toEqual([5, 1]);
    const legacy = parseSnapshots({ env: "part", part: part(2), asm: null, t: 7 });
    expect(legacy).toHaveLength(1);
    expect(legacy[0].dirty).toBe(false);
    expect(parseSnapshots("not json")).toEqual([]);
    expect(parseSnapshots([null, { env: "x" }])).toEqual([]);
  });
});

describe("recovery decision", () => {
  it("asks after an abnormal exit", () => {
    expect(recoveryDecision({ running: true, t: 0 }, [snap(1, { dirty: false })])).toBe("ask");
  });
  it("asks when the snapshot holds unsaved changes", () => {
    expect(recoveryDecision({ running: false, t: 0 }, [snap(1, { dirty: true })])).toBe("ask");
  });
  it("continues silently after a clean exit with everything saved", () => {
    expect(recoveryDecision({ running: false, t: 0 }, [snap(1, { dirty: false })])).toBe("silent");
    expect(recoveryDecision(null, [snap(1, { dirty: false })])).toBe("silent");
  });
  it("does nothing without restorable content, asks for postponed snapshots", () => {
    expect(recoveryDecision({ running: true, t: 0 }, [])).toBe("none");
    expect(recoveryDecision({ running: true, t: 0 }, [snap(1, { part: part(0) })])).toBe("none");
    expect(recoveryDecision(null, [], [snap(1)])).toBe("ask");
  });
  it("parses the session flag defensively", () => {
    expect(parseSession(JSON.stringify({ running: true, t: 3 }))).toEqual({ running: true, t: 3 });
    expect(parseSession("{bad")).toBeNull();
    expect(parseSession(null)).toBeNull();
  });
});

describe("operation log", () => {
  it("is bounded and keeps the newest entries", () => {
    const log = new OpLog(3);
    for (let i = 0; i < 5; i++) log.add({ kind: "command", id: `c${i}`, t: i });
    expect(log.entries().map((e) => e.id)).toEqual(["c2", "c3", "c4"]);
  });
  it("collapses repeats and clips long parameters", () => {
    const log = new OpLog(10);
    log.add({ kind: "edit", id: "preview", t: 1 });
    log.add({ kind: "edit", id: "preview", t: 2 });
    log.add({ kind: "error", id: "rebuild", result: "x".repeat(500), t: 3 });
    const e = log.entries();
    expect(e).toHaveLength(2);
    expect(e[0].count).toBe(2);
    expect(e[1].result!.length).toBeLessThanOrEqual(201);
  });
  it("round-trips through load and formats a report", () => {
    const a = new OpLog(10);
    a.add({ kind: "command", id: "extrude", params: "part", t: 0 });
    a.add({ kind: "error", id: "rebuild", result: "boom", t: 1000 });
    const b = new OpLog(10);
    b.load(JSON.parse(JSON.stringify(a.entries())));
    b.load("garbage");
    const txt = b.format({ app: "3DCAD" });
    expect(txt).toContain("app: 3DCAD");
    expect(txt).toContain("command extrude (part)");
    expect(txt).toContain("rebuild -> boom");
  });
});
