import { icon } from "./icons";

type Attrs = Record<string, string | number | boolean | ((e: never) => void) | undefined | null>;

/** Tiny hyperscript helper. */
export function h<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Attrs = {}, ...children: (Node | string | null | undefined | false)[]): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null || v === false) continue;
    if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2).toLowerCase(), v as EventListener);
    else if (k === "html") el.innerHTML = String(v);
    else if (k === "class") el.className = String(v);
    else if (v === true) el.setAttribute(k, "");
    else el.setAttribute(k, String(v));
  }
  for (const c of children) if (c !== null && c !== undefined && c !== false) el.append(c instanceof Node ? c : document.createTextNode(c));
  return el;
}

export function iconEl(name: string, cls = ""): HTMLElement {
  const s = document.createElement("span");
  s.innerHTML = icon(name, cls);
  return s.firstElementChild as HTMLElement;
}

// ------------------------------------------------------------------ toasts ---

let toastHost: HTMLElement | null = null;
export function toast(msg: string, kind: "info" | "warn" | "error" | "ok" = "info", ms = 3800) {
  if (!toastHost) {
    toastHost = h("div", { class: "toasts", role: "status", "aria-live": "polite" });
    document.body.appendChild(toastHost);
  }
  const ic = kind === "error" ? "error" : kind === "warn" ? "warning" : kind === "ok" ? "check" : "info";
  const t = h("div", { class: `toast ${kind}` }, iconEl(ic), h("span", {}, msg));
  toastHost.appendChild(t);
  requestAnimationFrame(() => t.classList.add("show"));
  setTimeout(() => {
    t.classList.remove("show");
    setTimeout(() => t.remove(), 300);
  }, ms);
}

// ------------------------------------------------------------------ modals ---

export interface ModalOptions {
  title: string;
  icon?: string;
  body: HTMLElement;
  width?: number;
  buttons?: { label: string; primary?: boolean; onClick?: () => boolean | void | Promise<boolean | void> }[];
  onClose?: () => void;
  resizable?: boolean;
}

export function modal(o: ModalOptions): { close: () => void; el: HTMLElement } {
  const back = h("div", { class: "modal-back" });
  const close = () => {
    back.remove();
    document.removeEventListener("keydown", onKey, true);
    o.onClose?.();
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      close();
    }
  };
  document.addEventListener("keydown", onKey, true);
  const footer = h("div", { class: "modal-foot" });
  for (const b of o.buttons ?? [{ label: "閉じる", primary: true }]) {
    footer.appendChild(
      h(
        "button",
        {
          class: "btn" + (b.primary ? " primary" : ""),
          onClick: async () => {
            const r = await b.onClick?.();
            if (r !== false) close();
          },
        },
        b.label,
      ),
    );
  }
  const win = h(
    "div",
    { class: "modal" + (o.resizable ? " resizable" : ""), role: "dialog", "aria-modal": "true", style: `width:${o.width ?? 520}px` },
    h("div", { class: "modal-head" }, o.icon ? iconEl(o.icon) : null, h("h2", {}, o.title), h("button", { class: "icon-btn", title: "閉じる", onClick: close, html: icon("close") })),
    h("div", { class: "modal-body" }, o.body),
    footer,
  );
  back.appendChild(win);
  back.addEventListener("pointerdown", (e) => {
    if (e.target === back) close();
  });
  document.body.appendChild(back);
  // drag by header
  const head = win.querySelector(".modal-head") as HTMLElement;
  head.addEventListener("pointerdown", (e) => {
    if ((e.target as HTMLElement).closest("button")) return;
    const r = win.getBoundingClientRect();
    const ox = e.clientX - r.left, oy = e.clientY - r.top;
    win.style.position = "fixed";
    win.style.margin = "0";
    const mv = (ev: PointerEvent) => {
      win.style.left = `${ev.clientX - ox}px`;
      win.style.top = `${ev.clientY - oy}px`;
    };
    const up = () => {
      window.removeEventListener("pointermove", mv);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", mv);
    window.addEventListener("pointerup", up);
  });
  (win.querySelector("input, select, button.primary") as HTMLElement | null)?.focus();
  return { close, el: win };
}

export function confirmDialog(title: string, message: string, okLabel = "OK"): Promise<boolean> {
  return new Promise((resolve) => {
    let result = false;
    modal({
      title,
      icon: "warning",
      width: 420,
      body: h("p", { class: "confirm-msg" }, message),
      buttons: [
        { label: okLabel, primary: true, onClick: () => void (result = true) },
        { label: "キャンセル" },
      ],
      onClose: () => resolve(result),
    });
  });
}

export function promptDialog(title: string, label: string, value: string): Promise<string | null> {
  return new Promise((resolve) => {
    let result: string | null = null;
    const input = h("input", { class: "field-input", value });
    const m = modal({
      title,
      width: 400,
      body: h("label", { class: "field" }, h("span", {}, label), input),
      buttons: [
        { label: "OK", primary: true, onClick: () => void (result = input.value) },
        { label: "キャンセル" },
      ],
      onClose: () => resolve(result),
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        result = input.value;
        m.close();
      }
    });
    setTimeout(() => {
      input.focus();
      input.select();
    }, 0);
  });
}

// ------------------------------------------------------------ context menu ---

export interface MenuItem {
  label: string;
  icon?: string;
  shortcut?: string;
  disabled?: boolean;
  checked?: boolean;
  danger?: boolean;
  action?: () => void;
  separator?: boolean;
}

let openMenu: HTMLElement | null = null;
export function closeMenus() {
  openMenu?.remove();
  openMenu = null;
}

export function contextMenu(x: number, y: number, items: MenuItem[]) {
  closeMenus();
  const m = h("div", { class: "ctx-menu", role: "menu" });
  for (const it of items) {
    if (it.separator) {
      m.appendChild(h("div", { class: "ctx-sep" }));
      continue;
    }
    m.appendChild(
      h(
        "button",
        {
          class: "ctx-item" + (it.danger ? " danger" : ""),
          role: "menuitem",
          disabled: !!it.disabled,
          onClick: () => {
            closeMenus();
            it.action?.();
          },
        },
        it.icon ? iconEl(it.icon) : h("span", { class: "ico" }, it.checked ? "✓" : ""),
        h("span", { class: "ctx-label" }, it.label),
        it.shortcut ? h("kbd", {}, it.shortcut) : null,
      ),
    );
  }
  document.body.appendChild(m);
  const r = m.getBoundingClientRect();
  m.style.left = `${Math.min(x, window.innerWidth - r.width - 6)}px`;
  m.style.top = `${Math.min(y, window.innerHeight - r.height - 6)}px`;
  openMenu = m;
  setTimeout(() => {
    const off = (e: PointerEvent) => {
      if (!m.contains(e.target as Node)) {
        closeMenus();
        window.removeEventListener("pointerdown", off, true);
      }
    };
    window.addEventListener("pointerdown", off, true);
  }, 0);
}

// ------------------------------------------------------------ marking menu ---

export interface MarkingItem {
  label: string;
  icon: string;
  action: () => void;
}

/**
 * Inventor-style radial marking menu: up to 8 items placed on compass
 * directions plus an optional overflow list below.
 */
export function markingMenu(x: number, y: number, ring: (MarkingItem | null)[], overflow: MenuItem[] = []) {
  closeMenus();
  const root = h("div", { class: "marking", style: `left:${x}px;top:${y}px` });
  const R = 92;
  const dirs = [
    [0, -1],
    [0.72, -0.72],
    [1, 0],
    [0.72, 0.72],
    [0, 1],
    [-0.72, 0.72],
    [-1, 0],
    [-0.72, -0.72],
  ];
  ring.forEach((it, i) => {
    if (!it) return;
    const [dx, dy] = dirs[i];
    const b = h(
      "button",
      {
        class: "mk-item",
        style: `left:${dx * R}px;top:${dy * R}px`,
        onClick: () => {
          closeMenus();
          it.action();
        },
      },
      iconEl(it.icon),
      h("span", {}, it.label),
    );
    root.appendChild(b);
  });
  root.appendChild(h("div", { class: "mk-center" }));
  if (overflow.length) {
    const list = h("div", { class: "mk-overflow", style: `top:${R + 40}px` });
    for (const it of overflow) {
      if (it.separator) {
        list.appendChild(h("div", { class: "ctx-sep" }));
        continue;
      }
      list.appendChild(
        h(
          "button",
          {
            class: "ctx-item",
            disabled: !!it.disabled,
            onClick: () => {
              closeMenus();
              it.action?.();
            },
          },
          it.icon ? iconEl(it.icon) : h("span", { class: "ico" }),
          h("span", { class: "ctx-label" }, it.label),
          it.shortcut ? h("kbd", {}, it.shortcut) : null,
        ),
      );
    }
    root.appendChild(list);
  }
  document.body.appendChild(root);
  openMenu = root;
  // gesture: releasing over an item picks it (flick)
  setTimeout(() => {
    const off = (e: PointerEvent) => {
      if (!root.contains(e.target as Node)) {
        closeMenus();
        window.removeEventListener("pointerdown", off, true);
      }
    };
    window.addEventListener("pointerdown", off, true);
  }, 0);
}

export function download(name: string, data: BlobPart, type = "application/octet-stream") {
  const blob = new Blob([data], { type });
  const a = h("a", { href: URL.createObjectURL(blob), download: name });
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(a.href);
    a.remove();
  }, 1000);
}

export function pickFile(accept: string): Promise<File | null> {
  return new Promise((resolve) => {
    const inp = h("input", { type: "file", accept, style: "display:none" });
    inp.addEventListener("change", () => {
      resolve(inp.files?.[0] ?? null);
      inp.remove();
    });
    document.body.appendChild(inp);
    inp.click();
  });
}
