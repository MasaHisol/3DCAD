// Crash recovery and operation log (pure logic: storage lives in the app).
//
// Autosave keeps a short history of snapshots; a session flag in localStorage tells
// whether the previous run ended cleanly. After an abnormal exit (or when the newest
// snapshot holds unsaved changes) the app asks before restoring.

export interface Snapshot {
  /** Time the snapshot was taken (ms since epoch). */
  t: number;
  env: "part" | "assembly";
  part: unknown | null;
  asm: unknown | null;
  /** The document had changes that were not saved to a file. */
  dirty: boolean;
  /** File name of the explicit save, if any. */
  fileName: string | null;
  /** Short label for the dialog (document name). */
  name: string;
  /** Session that wrote it: only snapshots of the running session are replaced. */
  session?: string;
}

export interface SessionState {
  /** True while a session runs; cleared on a clean exit. */
  running: boolean;
  /** Last start / clean exit time. */
  t: number;
}

export const MAX_SNAPSHOTS = 3;
/** A new history entry is started when the newest one is older than this. */
export const SNAPSHOT_INTERVAL_MS = 60_000;

/**
 * Add a snapshot to the history (newest first). Autosave runs after every edit, so
 * consecutive saves within `interval` replace the newest entry; older entries are kept
 * as fallbacks (e.g. when the newest state is the one that crashed the app).
 */
export function pushSnapshot(list: Snapshot[], snap: Snapshot, max = MAX_SNAPSHOTS, interval = SNAPSHOT_INTERVAL_MS): Snapshot[] {
  const out = list.filter((s) => s && typeof s.t === "number").sort((a, b) => b.t - a.t);
  if (out.length && snap.t - out[0].t < interval && out[0].session === snap.session && out[0].fileName === snap.fileName && out[0].env === snap.env) out[0] = snap;
  else out.unshift(snap);
  return out.slice(0, Math.max(1, max));
}

/** Whether a snapshot holds a non-empty document worth restoring. */
export function hasContent(s: Snapshot | undefined): boolean {
  if (!s) return false;
  if (s.env === "assembly") return !!(s.asm as { components?: unknown[] } | null)?.components?.length;
  return !!(s.part as { features?: unknown[] } | null)?.features?.length;
}

export type RecoveryDecision = "none" | "silent" | "ask";

/**
 * What to do at start-up: nothing (no snapshot), restore silently (clean exit and the
 * snapshot matches what was saved: the old "continue where you left off"), or ask
 * (abnormal exit, or unsaved changes that a restore would bring back).
 */
export function recoveryDecision(prev: SessionState | null, snaps: Snapshot[], postponed: Snapshot[] = []): RecoveryDecision {
  if (postponed.some(hasContent)) return "ask";
  const latest = snaps.find(hasContent);
  if (!latest) return "none";
  const crashed = !!prev?.running;
  return crashed || latest.dirty ? "ask" : "silent";
}

export function parseSession(s: string | null): SessionState | null {
  if (!s) return null;
  try {
    const v = JSON.parse(s) as SessionState;
    return typeof v?.running === "boolean" ? v : null;
  } catch {
    return null;
  }
}

/** Parse a stored history; tolerates the legacy single-snapshot autosave format. */
export function parseSnapshots(raw: unknown): Snapshot[] {
  try {
    const v = typeof raw === "string" ? JSON.parse(raw) : raw;
    const arr = Array.isArray(v) ? v : v ? [v] : [];
    return arr
      .filter((s): s is Snapshot => !!s && typeof s === "object" && (s.env === "part" || s.env === "assembly"))
      .map((s) => ({ ...s, t: s.t ?? 0, dirty: s.dirty ?? false, fileName: s.fileName ?? null, name: s.name ?? "" }))
      .sort((a, b) => b.t - a.t);
  } catch {
    return [];
  }
}

// ------------------------------------------------------------ operation log ---

export interface LogEntry {
  t: number;
  kind: "command" | "edit" | "error" | "info";
  /** Command id or edit label. */
  id: string;
  /** Short parameter summary (no file contents). */
  params?: string;
  result?: string;
  /** Collapsed repeats of the same entry. */
  count?: number;
}

/** Bounded ring buffer of user operations and errors (attached to bug reports). */
export class OpLog {
  private buf: LogEntry[] = [];
  constructor(readonly capacity = 500) {}

  add(e: Omit<LogEntry, "t"> & { t?: number }) {
    const entry: LogEntry = { ...e, t: e.t ?? Date.now(), params: clip(e.params), result: clip(e.result) };
    const last = this.buf[this.buf.length - 1];
    // live previews emit the same edit many times: keep one line
    if (last && last.kind === entry.kind && last.id === entry.id && last.params === entry.params && last.result === entry.result) {
      last.count = (last.count ?? 1) + 1;
      last.t = entry.t;
      return;
    }
    this.buf.push(entry);
    if (this.buf.length > this.capacity) this.buf.splice(0, this.buf.length - this.capacity);
  }

  entries(): LogEntry[] {
    return this.buf.slice();
  }

  load(entries: unknown) {
    if (!Array.isArray(entries)) return;
    this.buf = entries.filter((e): e is LogEntry => !!e && typeof e === "object" && typeof (e as LogEntry).id === "string").slice(-this.capacity);
  }

  clear() {
    this.buf = [];
  }

  /** Plain-text report, oldest first. */
  format(header: Record<string, string> = {}): string {
    const head = Object.entries(header).map(([k, v]) => `${k}: ${v}`);
    const lines = this.buf.map((e) => {
      const parts = [new Date(e.t).toISOString(), e.kind.padEnd(7), e.id];
      if (e.params) parts.push(`(${e.params})`);
      if (e.result) parts.push(`-> ${e.result}`);
      if (e.count && e.count > 1) parts.push(`x${e.count}`);
      return parts.join(" ");
    });
    return [...head, ...(head.length ? [""] : []), ...lines].join("\n") + "\n";
  }
}

function clip(s: string | undefined, n = 200): string | undefined {
  if (s === undefined) return undefined;
  const one = s.replace(/\s+/g, " ");
  return one.length > n ? one.slice(0, n) + "…" : one;
}
