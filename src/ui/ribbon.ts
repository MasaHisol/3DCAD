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
  /** Extra filter on the tabs shown (the viewer mode shows only its own tab). */
  tabFilter: ((t: RibbonTab) => boolean) | null = null;
  /** Opens the help page of a command (tooltip "ヘルプ" link). */
  onHelp: ((id: string) => void) | null = null;

  constructor(
    parent: HTMLElement,
    readonly tabs: RibbonTab[],
    private fileMenu: (anchor: HTMLElement) => void,
  ) {
    this.tabsEl = h("div", { class: "rb-tabs", role: "tablist" });
    this.bodyEl = h("div", { class: "rb-body" });
    this.el = h("div", { class: "ribbon" }, this.tabsEl, this.bodyEl);
    parent.appendChild(this.el);
    this.tip = h("div", { class: "rb-tip", role: "tooltip" });
    // the tooltip stays while the mouse is on it (for its "ヘルプ" link)
    this.tip.addEventListener("mouseenter", () => clearTimeout(this.tipTimer));
    this.tip.addEventListener("mouseleave", () => this.hideTip());
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
      if (!this.shown(t)) continue;
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
    const tab = this.tabs.find((t) => t.id === this.active && this.shown(t)) ?? this.tabs.find((t) => this.shown(t)) ?? this.tabs[0];
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
    el.addEventListener("mouseleave", () => {
      clearTimeout(this.tipTimer);
      if (this.tip.classList.contains("show")) this.tipTimer = window.setTimeout(() => this.hideTip(), 250);
    });
    this.buttons.push({ def: b, el });
    return el;
  }

  private showTip(b: RibbonButton, el: HTMLElement) {
    this.tip.innerHTML = "";
    this.tip.append(
      h("div", { class: "rb-tip-head" }, h("strong", {}, b.label), b.shortcut ? h("kbd", {}, b.shortcut) : null),
      b.tip ? h("p", {}, b.tip) : "",
      this.onHelp ? h("button", { class: "rb-tip-help", onClick: () => (this.hideTip(), this.onHelp!(b.id)) }, "ヘルプ", h("span", { class: "rb-tip-key" }, " (F1)")) : "",
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

  private shown(t: RibbonTab): boolean {
    return (!t.visible || t.visible()) && (!this.tabFilter || this.tabFilter(t));
  }

  /** The tab exists and is shown in the current environment. */
  isVisible(id: string): boolean {
    const t = this.tabs.find((x) => x.id === id);
    return !!t && this.shown(t);
  }

  /** Adds a tab (e.g. the viewer mode tab) and redraws. */
  addTab(tab: RibbonTab, first = false) {
    if (this.tabs.some((t) => t.id === tab.id)) return;
    if (first) this.tabs.unshift(tab);
    else this.tabs.push(tab);
    this.render();
  }

  private static buttonsOf(t: RibbonTab) {
    const out: [RibbonButton, string][] = [];
    for (const p of t.panels)
      for (const it of p.items) for (const b of "stack" in it ? it.stack : "custom" in it ? [] : [it]) out.push([b, p.title]);
    return out;
  }

  /** A command's definition and where it is (tab › panel), in any tab, shown or not. */
  locate(id: string): { def: RibbonButton; tab: string; panel: string; tabId: string } | null {
    for (const t of this.tabs) for (const [b, panel] of Ribbon.buttonsOf(t)) if (b.id === id) return { def: b, tab: t.label, panel, tabId: t.id };
    return null;
  }

  /** The command can run now: it is in a tab of the current environment and enabled. */
  isAvailable(id: string): boolean {
    for (const t of this.tabs) {
      if (t.visible && !t.visible()) continue;
      for (const [b] of Ribbon.buttonsOf(t)) if (b.id === id) return !b.enabled || b.enabled();
    }
    return false;
  }

  /** Every command of the visible tabs (for the command search). */
  allCommands(): (RibbonButton & { tab: string })[] {
    const out: (RibbonButton & { tab: string })[] = [];
    for (const t of this.tabs) {
      if (!this.shown(t)) continue;
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
