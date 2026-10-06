type Listener = (reason: string) => void;

/**
 * JSON document with snapshot-based undo/redo. Mutations go through
 * `mutate()` so each user action becomes exactly one undo step.
 */
export class Store<T> {
  doc: T;
  private undoStack: string[] = [];
  private redoStack: string[] = [];
  private listeners = new Set<Listener>();
  dirty = false;
  fileHandleName: string | null = null;

  constructor(doc: T) {
    this.doc = doc;
  }

  on(l: Listener): () => void {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  }

  emit(reason: string) {
    for (const l of this.listeners) l(reason);
  }

  snapshot(): string {
    return JSON.stringify(this.doc);
  }

  /** Apply a change as a single undoable step. */
  mutate(label: string, fn: (doc: T) => void, silent = false) {
    this.undoStack.push(this.snapshot());
    if (this.undoStack.length > 200) this.undoStack.shift();
    this.redoStack = [];
    fn(this.doc);
    this.dirty = true;
    if (!silent) this.emit(label);
  }

  /** Change without creating an undo step (used for live previews and ref tracking). */
  patch(fn: (doc: T) => void, reason = "patch") {
    fn(this.doc);
    this.emit(reason);
  }

  /** Restore a snapshot without touching history (used by cancel). */
  restore(snap: string, reason = "restore") {
    this.doc = JSON.parse(snap);
    this.emit(reason);
  }

  /** Push an explicit history entry captured earlier (used when committing a command). */
  pushHistory(snap: string) {
    this.undoStack.push(snap);
    this.redoStack = [];
    this.dirty = true;
  }

  canUndo() {
    return this.undoStack.length > 0;
  }
  canRedo() {
    return this.redoStack.length > 0;
  }

  undo() {
    const s = this.undoStack.pop();
    if (!s) return;
    this.redoStack.push(this.snapshot());
    this.doc = JSON.parse(s);
    this.emit("undo");
  }

  redo() {
    const s = this.redoStack.pop();
    if (!s) return;
    this.undoStack.push(this.snapshot());
    this.doc = JSON.parse(s);
    this.emit("redo");
  }

  /** Replace the document and clear history. */
  reset(doc: T, reason = "load") {
    this.doc = doc;
    this.undoStack = [];
    this.redoStack = [];
    this.dirty = false;
    this.emit(reason);
  }
}
