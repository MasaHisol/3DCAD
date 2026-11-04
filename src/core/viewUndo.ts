// Lightweight undo stack for display operations (hide / isolate / transparency /
// colour). It never touches the document history, so the viewer mode can undo
// view changes without marking the file modified. In the editing mode the
// entries interleave with the document's undo stack: each entry remembers the
// document history depth when it was made, and Ctrl+Z undoes whichever is newer.

export interface ViewUndoEntry<T> {
  label: string;
  before: T;
  after: T;
  /** Document undo depth when the view step was made. */
  depth: number;
}

export class ViewUndo<T> {
  private undoS: ViewUndoEntry<T>[] = [];
  private redoS: ViewUndoEntry<T>[] = [];

  constructor(
    private apply: (s: T) => void,
    readonly limit = 200,
  ) {}

  push(label: string, before: T, after: T, depth = 0) {
    this.undoS.push({ label, before, after, depth });
    if (this.undoS.length > this.limit) this.undoS.shift();
    this.redoS = [];
  }

  canUndo() {
    return this.undoS.length > 0;
  }
  canRedo() {
    return this.redoS.length > 0;
  }
  get size() {
    return this.undoS.length;
  }

  /** True when Ctrl+Z should undo a view step (viewer mode: always; editing mode: when no document edit came after it). */
  wantsUndo(docDepth: number, viewOnly: boolean): boolean {
    const top = this.undoS[this.undoS.length - 1];
    return !!top && (viewOnly || top.depth >= docDepth);
  }

  wantsRedo(docDepth: number, viewOnly: boolean): boolean {
    const top = this.redoS[this.redoS.length - 1];
    return !!top && (viewOnly || top.depth <= docDepth);
  }

  undo(): string | null {
    const e = this.undoS.pop();
    if (!e) return null;
    this.redoS.push(e);
    this.apply(e.before);
    return e.label;
  }

  redo(): string | null {
    const e = this.redoS.pop();
    if (!e) return null;
    this.undoS.push(e);
    this.apply(e.after);
    return e.label;
  }

  clear() {
    this.undoS = [];
    this.redoS = [];
  }
}
