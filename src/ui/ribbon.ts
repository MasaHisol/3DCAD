import { h, iconEl } from "./dom";

export interface RibbonButton {
  id: string;
  label: string;
  icon: string;
  size?: "large" | "small";
  shortcut?: string;
  tip?: string;
  action: () => void;
  enabled?: () => boolean;
  active?: () => boolean;
}

export type RibbonItem = RibbonButton | { stack: RibbonButton[] } | { custom: () => HTMLElement };

export interface RibbonPanel {
  title: string;
  items: RibbonItem[];
}

export interface RibbonTab {
  id: string;
  label: string;
  contextual?: boolean;
  visible?: () => boolean;
  panels: RibbonPanel[];
}

export class Ribbon {
  readonly el: HTMLElement;
  private tabsEl: HTMLElement;
  private bodyEl: HTMLElement;
  private buttons: { def: RibbonButton; el: HTMLButtonElement }[] = [];
  private tip: HTMLElement;
  private tipTimer = 0;
  active: string;
  collapsed = false;

  constructor(
    parent: HTMLElement,
    private tabs: RibbonTab[],
    private fileMenu: (anchor: HTMLElement) => void,
  ) {
    this.tabsEl = h("div", { class: "rb-tabs", role: "tablist" });
    this.bodyEl = h("div", { class: "rb-body" });
    this.el = h("div", { class: "ribbon" }, this.tabsEl, this.bodyEl);
    parent.appendChild(this.el);
    this.tip = h("div", { class: "rb-tip", role: "tooltip" });
    document.body.appendChild(this.tip);
    this.active = tabs[0].id;
    this.render();
  }

  setActive(id: string) {
    this.active = id;
    if (this.collapsed) this.collapsed = false;
    this.render();
  }

  render() {
    this.tabsEl.innerHTML = "";
    const file = h("button", { class: "rb-tab file", onClick: () => this.fileMenu(file) }, "ファイル");
    this.tabsEl.appendChild(file);
    for (const t of this.tabs) {
      if (t.visible && !t.visible()) continue;
      const b = h(
        "button",
        {
          class: "rb-tab" + (t.id === this.active ? " on" : "") + (t.contextual ? " contextual" : ""),
          role: "tab",
          "aria-selected": String(t.id === this.active),
          onClick: () => this.setActive(t.id),
          onDblClick: () => {
            this.collapsed = !this.collapsed;
            this.render();
          },
        },
        t.label,
      );
      this.tabsEl.appendChild(b);
    }
    this.tabsEl.appendChild(h("span", { class: "spacer" }));
    this.tabsEl.appendChild(
      h(
        "button",
        {
          class: "rb-collapse icon-btn",
          title: this.collapsed ? "リボンを展開" : "リボンを最小化",
          onClick: () => {
            this.collapsed = !this.collapsed;
            this.render();
          },
        },
        iconEl(this.collapsed ? "chevronDown" : "chevronRight"),
      ),
    );

    this.bodyEl.innerHTML = "";
    this.buttons = [];
    this.el.classList.toggle("collapsed", this.collapsed);
    const tab = this.tabs.find((t) => t.id === this.active && (!t.visible || t.visible())) ?? this.tabs.find((t) => !t.visible || t.visible())!;
    if (tab.id !== this.active) this.active = tab.id;
    for (const p of tab.panels) {
      const items = h("div", { class: "rb-items" });
      for (const it of p.items) {
        if ("stack" in it) {
          const st = h("div", { class: "rb-stack" });
          for (const b of it.stack) st.appendChild(this.button({ ...b, size: "small" }));
          items.appendChild(st);
        } else if ("custom" in it) items.appendChild(it.custom());
        else items.appendChild(this.button(it));
      }
      this.bodyEl.appendChild(h("div", { class: "rb-panel" }, items, h("div", { class: "rb-panel-title" }, p.title)));
    }
    this.refresh();
  }

  private button(b: RibbonButton): HTMLButtonElement {
    const el = h(
      "button",
      {
        class: `rb-btn ${b.size ?? "large"}`,
        "data-cmd": b.id,
        "aria-label": b.label + (b.shortcut ? ` (${b.shortcut})` : ""),
        onClick: () => {
          this.hideTip();
          b.action();
        },
      },
      iconEl(b.icon),
      h("span", { class: "rb-label" }, b.label),
    );
    el.addEventListener("mouseenter", () => {
      clearTimeout(this.tipTimer);
      this.tipTimer = window.setTimeout(() => this.showTip(b, el), 450);
    });
    el.addEventListener("mouseleave", () => this.hideTip());
    this.buttons.push({ def: b, el });
    return el;
  }

  private showTip(b: RibbonButton, el: HTMLElement) {
    this.tip.innerHTML = "";
    this.tip.append(
      h("div", { class: "rb-tip-head" }, h("strong", {}, b.label), b.shortcut ? h("kbd", {}, b.shortcut) : null),
      b.tip ? h("p", {}, b.tip) : "",
    );
    const r = el.getBoundingClientRect();
    this.tip.style.left = `${Math.min(r.left, window.innerWidth - 300)}px`;
    this.tip.style.top = `${r.bottom + 6}px`;
    this.tip.classList.add("show");
  }

  private hideTip() {
    clearTimeout(this.tipTimer);
    this.tip.classList.remove("show");
  }

  /** Every command of the visible tabs (for the command search). */
  allCommands(): (RibbonButton & { tab: string })[] {
    const out: (RibbonButton & { tab: string })[] = [];
    for (const t of this.tabs) {
      if (t.visible && !t.visible()) continue;
      for (const p of t.panels)
        for (const it of p.items) {
          const btns = "stack" in it ? it.stack : "custom" in it ? [] : [it];
          for (const b of btns) if (!b.enabled || b.enabled()) out.push({ ...b, tab: `${t.label} › ${p.title}` });
        }
    }
    return out;
  }

  /** Update enabled / active state of every visible button. */
  refresh() {
    for (const { def, el } of this.buttons) {
      el.disabled = def.enabled ? !def.enabled() : false;
      el.classList.toggle("on", def.active ? def.active() : false);
    }
  }
}
