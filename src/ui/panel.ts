import { evaluate, formatNumber } from "../core/expr";
import { h, iconEl } from "./dom";

// Inventor-style property panel shown while a command is active.

export interface PanelCallbacks {
  onOk: () => void;
  onCancel: () => void;
  onApply?: () => void;
}

export interface ExprField {
  el: HTMLElement;
  input: HTMLInputElement;
  set(expr: string): void;
  value(): string;
}

export class PropertyPanel {
  readonly el: HTMLElement;
  private body: HTMLElement;
  private okBtn: HTMLButtonElement;
  private errorEl: HTMLElement;
  private onKey: (e: KeyboardEvent) => void;

  constructor(host: HTMLElement, title: string, iconName: string, cb: PanelCallbacks, private values: () => Map<string, number>) {
    this.body = h("div", { class: "pp-body" });
    this.errorEl = h("div", { class: "pp-error", role: "alert" });
    this.okBtn = h("button", { class: "btn primary pp-ok", title: "OK (Enter)", onClick: () => cb.onOk() }, iconEl("check"), "OK");
    const foot = h(
      "div",
      { class: "pp-foot" },
      cb.onApply ? h("button", { class: "btn pp-apply", title: "適用して続行", onClick: () => cb.onApply!() }, iconEl("plus")) : null,
      h("span", { class: "spacer" }),
      this.okBtn,
      h("button", { class: "btn", title: "キャンセル (Esc)", onClick: () => cb.onCancel() }, "キャンセル"),
    );
    const head = h(
      "div",
      { class: "pp-head" },
      iconEl(iconName),
      h("span", { class: "pp-title" }, title),
      h("button", { class: "icon-btn", title: "閉じる", onClick: () => cb.onCancel(), html: iconEl("close").outerHTML }),
    );
    this.el = h("div", { class: "prop-panel", role: "dialog", "aria-label": title }, head, this.body, this.errorEl, foot);
    host.appendChild(this.el);
    this.makeDraggable(head);
    this.onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === "Enter" && !(t instanceof HTMLSelectElement) && !t.closest(".sk-hud, .dim-edit")) {
        if (t instanceof HTMLInputElement) t.blur();
        e.preventDefault();
        e.stopPropagation();
        setTimeout(() => cb.onOk(), 0);
      }
    };
    this.el.addEventListener("keydown", this.onKey);
  }

  private makeDraggable(head: HTMLElement) {
    head.addEventListener("pointerdown", (e) => {
      if ((e.target as HTMLElement).closest("button")) return;
      const r = this.el.getBoundingClientRect();
      const pr = (this.el.offsetParent as HTMLElement).getBoundingClientRect();
      const ox = e.clientX - r.left, oy = e.clientY - r.top;
      const mv = (ev: PointerEvent) => {
        this.el.style.left = `${Math.max(0, ev.clientX - pr.left - ox)}px`;
        this.el.style.top = `${Math.max(0, ev.clientY - pr.top - oy)}px`;
      };
      const up = () => {
        window.removeEventListener("pointermove", mv);
        window.removeEventListener("pointerup", up);
      };
      window.addEventListener("pointermove", mv);
      window.addEventListener("pointerup", up);
    });
  }

  close() {
    this.el.remove();
  }

  setError(msg: string | null) {
    this.errorEl.textContent = msg ?? "";
    this.errorEl.style.display = msg ? "flex" : "none";
  }

  setOkEnabled(on: boolean) {
    this.okBtn.disabled = !on;
  }

  section(title: string, collapsed = false): HTMLElement {
    const content = h("div", { class: "pp-sec-body" });
    const sec = h(
      "section",
      { class: "pp-sec" + (collapsed ? " collapsed" : "") },
      h(
        "button",
        {
          class: "pp-sec-head",
          onClick: () => sec.classList.toggle("collapsed"),
        },
        iconEl("chevronDown", "chev"),
        title,
      ),
      content,
    );
    this.body.appendChild(sec);
    return content;
  }

  /** Expression input with live evaluation hint. */
  expr(parent: HTMLElement, label: string, value: string, unit: string, onChange: (expr: string) => void, paramName?: string): ExprField {
    const input = h("input", { class: "field-input expr", value, spellcheck: "false", "aria-label": label });
    const hint = h("span", { class: "expr-hint" });
    const update = () => {
      const v = input.value.trim();
      try {
        const n = evaluate(v, (k) => this.values().get(k));
        const plain = /^\s*[-+]?[0-9.]+\s*$/.test(v);
        hint.textContent = plain ? unit : `= ${formatNumber(n, 3)} ${unit}`;
        input.classList.remove("invalid");
        return true;
      } catch (e) {
        hint.textContent = "⚠";
        hint.title = (e as Error).message;
        input.classList.add("invalid");
        return false;
      }
    };
    let timer = 0;
    input.addEventListener("input", () => {
      if (!update()) return;
      clearTimeout(timer);
      timer = window.setTimeout(() => onChange(input.value.trim()), 250);
    });
    input.addEventListener("change", () => update() && onChange(input.value.trim()));
    input.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
      const n = Number(input.value);
      if (!Number.isFinite(n)) return;
      e.preventDefault();
      const step = (e.shiftKey ? 10 : e.altKey ? 0.1 : 1) * (e.key === "ArrowUp" ? 1 : -1);
      input.value = formatNumber(n + step, 4);
      update();
      onChange(input.value);
    });
    input.addEventListener("focus", () => input.select());
    update();
    const el = h(
      "label",
      { class: "field" },
      h("span", { class: "field-label" }, label, paramName ? h("small", { class: "param-name" }, paramName) : null),
      h("span", { class: "field-ctl" }, input, hint),
    );
    parent.appendChild(el);
    return {
      el,
      input,
      set: (e) => {
        input.value = e;
        update();
      },
      value: () => input.value.trim(),
    };
  }

  select(parent: HTMLElement, label: string, options: { value: string; label: string }[], value: string, onChange: (v: string) => void): HTMLSelectElement {
    const sel = h("select", { class: "field-input" });
    for (const o of options) sel.appendChild(h("option", { value: o.value, selected: o.value === value }, o.label));
    sel.addEventListener("change", () => onChange(sel.value));
    parent.appendChild(h("label", { class: "field" }, h("span", { class: "field-label" }, label), h("span", { class: "field-ctl" }, sel)));
    return sel;
  }

  toggles(parent: HTMLElement, label: string, options: { value: string; icon: string; title: string }[], value: string, onChange: (v: string) => void) {
    const group = h("div", { class: "toggle-group", role: "radiogroup", "aria-label": label });
    const btns = options.map((o) => {
      const b = h(
        "button",
        {
          class: "tg" + (o.value === value ? " on" : ""),
          title: o.title,
          role: "radio",
          "aria-checked": String(o.value === value),
          onClick: () => {
            btns.forEach((x) => (x.classList.remove("on"), x.setAttribute("aria-checked", "false")));
            b.classList.add("on");
            b.setAttribute("aria-checked", "true");
            onChange(o.value);
          },
        },
        iconEl(o.icon),
      );
      return b;
    });
    btns.forEach((b) => group.appendChild(b));
    parent.appendChild(h("div", { class: "field" }, h("span", { class: "field-label" }, label), h("span", { class: "field-ctl" }, group)));
    return {
      set: (v: string) => btns.forEach((b, i) => b.classList.toggle("on", options[i].value === v)),
    };
  }

  checkbox(parent: HTMLElement, label: string, value: boolean, onChange: (v: boolean) => void): HTMLInputElement {
    const cb = h("input", { type: "checkbox", checked: value });
    cb.addEventListener("change", () => onChange(cb.checked));
    parent.appendChild(h("label", { class: "field check" }, cb, h("span", {}, label)));
    return cb;
  }

  /** A selection box: shows count, activates picking when clicked. */
  picker(parent: HTMLElement, label: string, iconName: string, onActivate: () => void, onClear?: () => void) {
    const count = h("span", { class: "pick-count" });
    const btn = h("button", { class: "picker", onClick: () => onActivate() }, iconEl(iconName), h("span", { class: "pick-label" }, label), count);
    const clear = onClear ? h("button", { class: "icon-btn small", title: "選択をクリア", onClick: () => onClear(), html: iconEl("close").outerHTML }) : null;
    parent.appendChild(h("div", { class: "field picker-row" }, btn, clear));
    return {
      setCount: (n: number, text?: string) => {
        count.textContent = text ?? (n ? `${n} 個選択` : "選択してください");
        btn.classList.toggle("empty", n === 0);
      },
      setActive: (on: boolean) => btn.classList.toggle("active", on),
    };
  }

  note(parent: HTMLElement, text: string): HTMLElement {
    const n = h("p", { class: "pp-note" }, text);
    parent.appendChild(n);
    return n;
  }
}
