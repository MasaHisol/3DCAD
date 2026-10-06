import type { App } from "../app";
import type { Feature } from "../core/types";
import { PropertyPanel } from "../ui/panel";
import type { ToolHandler } from "../viewer/viewport";

export interface Command {
  readonly id: string;
  handler?: ToolHandler;
  ok(): void;
  cancel(): void;
  /** A feature was clicked in the browser while the command runs. Return true if consumed. */
  onBrowserSelect?(id: string): boolean;
  /** Called after every rebuild while active. */
  onRegen?(): void;
  /** Escape pressed: return true if handled internally (e.g. stop picking). */
  onEscape?(): boolean;
  /** Feature id whose input state should be used for picking (rolled-back picking). */
  captureBefore?(): string | undefined;
}

/**
 * Base for commands that create or edit one feature with live preview:
 * the feature is written into the document immediately (without history)
 * so the real rebuild acts as the preview; OK records one undo step,
 * Cancel restores the snapshot.
 */
export abstract class FeatureCommand<F extends Feature> implements Command {
  abstract readonly id: string;
  handler?: ToolHandler;
  protected panel!: PropertyPanel;
  protected snapshot: string;
  protected featureId: string;
  protected editing: boolean;
  private closed = false;

  constructor(
    protected app: App,
    existing: F | null,
    create: () => F,
  ) {
    this.snapshot = app.store.snapshot();
    this.editing = !!existing;
    if (existing) this.featureId = existing.id;
    else {
      const f = create();
      this.featureId = f.id;
      app.store.patch((doc) => app.store.insertFeature(doc, f), "preview");
    }
  }

  get feature(): F {
    return this.app.store.feature<F>(this.featureId)!;
  }

  /** Update the feature (live preview, no undo step). */
  protected update(fn: (f: F) => void) {
    this.app.store.patch((doc) => {
      const f = doc.features.find((x) => x.id === this.featureId) as F | undefined;
      if (f) fn(f);
    }, "preview");
  }

  /** Update a parameter expression owned by this feature. */
  protected setParam(name: string, expr: string) {
    this.app.store.patch((doc) => {
      const p = doc.params.find((x) => x.name === name);
      if (p) p.expr = expr;
    }, "preview");
  }

  protected expr(name: string): string {
    return this.app.store.param(name)?.expr ?? name;
  }

  protected openPanel(title: string, icon: string, withApply = false) {
    this.panel = new PropertyPanel(
      this.app.panelHost,
      title,
      icon,
      {
        onOk: () => this.app.finishCommand(this, true),
        onCancel: () => this.app.finishCommand(this, false),
        onApply: withApply ? () => this.apply() : undefined,
      },
      () => this.app.values(),
    );
  }

  /** Validate before OK. Return an error message to block. */
  protected validate(): string | null {
    const err = this.app.featureErrors[this.featureId];
    return err ?? null;
  }

  ok() {
    if (this.closed) return;
    const err = this.validate();
    if (err) {
      this.panel.setError(err);
      throw new Error(err);
    }
    this.closed = true;
    this.panel.close();
    this.app.store.pushHistory(this.snapshot);
    this.app.store.emit("commit");
  }

  cancel() {
    if (this.closed) return;
    this.closed = true;
    this.panel?.close();
    this.app.store.restore(this.snapshot, "cancel");
  }

  /** Commit and immediately start a new instance of the same command. */
  protected apply() {
    this.app.finishCommand(this, true, true);
  }

  onRegen() {
    this.panel?.setError(this.app.featureErrors[this.featureId] ?? null);
  }
}
