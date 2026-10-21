// MBD commands: create / edit 3D annotations by picking model faces and edges,
// the PMI list dialog and the CSV export.

import * as THREE from "three";
import type { App } from "../app";
import type { Command } from "../commands/command";
import type { Vec3 } from "../core/types";
import type { Tolerance } from "../drawing/types";
import { download, h, iconEl, modal, toast } from "../ui/dom";
import { PropertyPanel } from "../ui/panel";
import type { Pick, ToolHandler } from "../viewer/viewport";
import { pmiLabelHtml } from "./layer";
import { GDT_SYMBOLS, PMI_LABELS, PMI_REF_COUNT, nextDatumLetter, pmiCsv, pmiId, pmiText, type PmiAnno, type PmiRef, type PmiType } from "./pmi";
import { radiusOf, resolveRef, bodiesBox, vec } from "./resolve";

export const PMI_COMMANDS: Record<string, PmiType> = {
  "pmi-dim": "dim",
  "pmi-diameter": "diameter",
  "pmi-gdt": "gdt",
  "pmi-datum": "datum",
  "pmi-surface": "surface",
  "pmi-note": "note",
};

const ICONS: Record<PmiType, string> = { dim: "dimension", diameter: "hole", gdt: "iprops", datum: "fix", surface: "pushpull", note: "edit" };

function blank(type: PmiType, app: App): PmiAnno {
  const base = { id: pmiId(), refs: [] as PmiRef[] };
  switch (type) {
    case "dim":
      return { ...base, type, tol: { kind: "none" } };
    case "diameter":
      return { ...base, type, tol: { kind: "fit", fit: "H7" } };
    case "gdt":
      return { ...base, type, symbol: "⏥", value: "0.05", datums: "" };
    case "datum":
      return { ...base, type, letter: nextDatumLetter(app.store.doc) };
    case "surface":
      return { ...base, type, ra: "1.6", removal: "required" };
    case "note":
      return { ...base, type, text: "注記" };
  }
}

/** Creates or edits one PMI annotation. */
export class PmiCommand implements Command {
  readonly id: string;
  handler: ToolHandler;
  private panel: PropertyPanel;
  private anno: PmiAnno;
  private editing: boolean;
  private placing = false;
  private picker: ReturnType<PropertyPanel["picker"]>;

  constructor(
    private app: App,
    type: PmiType,
    existing?: PmiAnno,
  ) {
    this.id = `pmi-${type}`;
    this.editing = !!existing;
    this.anno = existing ? JSON.parse(JSON.stringify(existing)) : blank(type, app);
    const need = PMI_REF_COUNT[type];
    this.panel = new PropertyPanel(
      app.panelHost,
      `${PMI_LABELS[type]} (3D 注記)`,
      ICONS[type],
      { onOk: () => app.finishCommand(this, true), onCancel: () => app.finishCommand(this, false), onApply: existing ? undefined : () => app.finishCommand(this, true, true) },
      () => app.values(),
    );
    const s = this.panel.section("参照");
    const what = type === "dim" ? "面またはエッジ (2 つ)" : type === "diameter" ? "円筒面または円形エッジ" : type === "note" ? "面またはエッジ" : "面";
    this.picker = this.panel.picker(s, what, "select", () => this.restartPick(), () => this.restartPick());
    this.panel.note(s, "参照を選ぶとラベルがカーソルに付いて動きます。クリックで配置 (選ばずに OK で自動配置)。");
    s.appendChild(h("button", { class: "btn", onClick: () => this.setOffset(undefined) }, iconEl("zoomFit"), "自動配置に戻す"));
    this.buildFields(this.panel.section(PMI_LABELS[type]));
    this.updatePicker();

    app.vp.pickKinds = new Set(type === "dim" || type === "note" || type === "diameter" ? ["face", "edge"] : ["face"]);
    app.vp.pickFilter = (p) => {
      if (p.kind !== "face" && p.kind !== "edge") return false;
      if (type !== "diameter") return true;
      const b = app.pickBodies[p.body];
      const info = p.kind === "face" ? b?.faces[p.index] : b?.edges[p.index];
      return !!info && (info.type === "CYLINDRE" || info.type === "CIRCLE") && !!info.axis;
    };
    this.handler = {
      cursor: "crosshair",
      onPointerMove: (e, vp) => {
        if (this.placing) this.followCursor(e);
        else vp.setHover(vp.pick(e));
      },
      onPointerDown: (e, vp) => {
        if (e.button !== 0) return;
        if (this.placing) {
          this.followCursor(e);
          this.placing = false;
          app.status("配置しました。OK で確定します");
          return;
        }
        if (this.anno.refs.length >= need) return;
        const p = vp.pick(e);
        if (!p) return;
        const r = this.refOf(p);
        if (!r) return;
        this.anno.refs.push(r);
        if (this.anno.refs.length >= need) {
          vp.setHover(null);
          if (!this.anno.offset) this.placing = true;
          app.status("ラベルの位置をクリック (自動配置のままなら OK)");
        }
        this.updatePicker();
      },
    };
    app.pmi.highlight = existing?.id ?? null;
    app.status(`${PMI_LABELS[type]}: ${what}を選択`);
    this.updatePreview();
  }

  private refOf(p: Pick): PmiRef | null {
    if (p.kind === "face") {
      const r = this.app.faceRef(p);
      return r ? { kind: "face", ref: r } : null;
    }
    if (p.kind === "edge") {
      const r = this.app.edgeRef(p);
      return r ? { kind: "edge", ref: r } : null;
    }
    return null;
  }

  private restartPick() {
    this.anno.refs = [];
    this.placing = false;
    this.updatePicker();
  }

  private updatePicker() {
    const need = PMI_REF_COUNT[this.anno.type];
    this.picker.setCount(this.anno.refs.length, this.anno.refs.length ? `${this.anno.refs.length} / ${need}` : undefined);
    this.picker.setActive(this.anno.refs.length < need);
    // highlight the picked faces / edges
    const box = bodiesBox(this.app.pickBodies);
    const diag = box ? Math.max(1, vec.dist(box[0], box[1])) : 100;
    const picks: Pick[] = [];
    for (const r of this.anno.refs) {
      const res = resolveRef(this.app.pickBodies, r, diag);
      if (res) picks.push({ kind: res.kind, body: res.body, index: res.index, point: res.point });
    }
    this.app.vp.setSelection(picks);
    this.updatePreview();
  }

  private setOffset(o: Vec3 | undefined) {
    if (o) this.anno.offset = o;
    else delete this.anno.offset;
    this.placing = false;
    this.updatePreview();
  }

  private followCursor(e: PointerEvent) {
    const g = this.app.pmi.geometry({ ...this.anno, offset: undefined } as PmiAnno);
    if (!g) return;
    const vp = this.app.vp;
    const n = new THREE.Vector3();
    vp.camera.getWorldDirection(n);
    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(n, new THREE.Vector3(...g.anchor));
    const hit = vp.ray(e).intersectPlane(plane, new THREE.Vector3());
    if (!hit) return;
    this.anno.offset = [hit.x - g.anchor[0], hit.y - g.anchor[1], hit.z - g.anchor[2]];
    if (this.anno.type === "dim" && g.dir) {
      // a linear dimension's line stays perpendicular to the measured direction
      const off = this.anno.offset;
      this.anno.offset = vec.sub(off, vec.mul(g.dir, vec.dot(off, g.dir)));
    }
    this.updatePreview();
  }

  private updatePreview() {
    this.app.pmi.preview = this.anno.refs.length >= PMI_REF_COUNT[this.anno.type] ? this.anno : null;
    this.app.pmi.refresh();
  }

  private input(parent: HTMLElement, label: string, value: string, set: (v: string) => void, multiline = false) {
    const el = multiline ? h("textarea", { class: "field-input", rows: 3 }) : h("input", { class: "field-input", value });
    if (multiline) (el as HTMLTextAreaElement).value = value;
    el.addEventListener("input", () => {
      set((el as HTMLInputElement).value);
      this.updatePreview();
    });
    parent.appendChild(h("label", { class: "field" }, h("span", { class: "field-label" }, label), h("span", { class: "field-ctl" }, el)));
    return el;
  }

  private tolFields(parent: HTMLElement, a: { tol?: Tolerance }) {
    const box = h("div", {});
    const render = () => {
      box.innerHTML = "";
      const t = a.tol ?? { kind: "none" };
      if (t.kind === "sym") this.input(box, "± 公差", t.value, (v) => (t.value = v));
      if (t.kind === "dev") {
        this.input(box, "上の許容差", t.upper, (v) => (t.upper = v));
        this.input(box, "下の許容差", t.lower, (v) => (t.lower = v));
      }
      if (t.kind === "fit") this.input(box, "はめあい", t.fit, (v) => (t.fit = v));
    };
    this.panel.select(
      parent,
      "公差",
      [
        { value: "none", label: "なし" },
        { value: "sym", label: "± 対称" },
        { value: "dev", label: "上下の許容差" },
        { value: "fit", label: "はめあい (H7 など)" },
        { value: "basic", label: "理論的に正確な寸法 (枠)" },
        { value: "ref", label: "参考寸法 ( )" },
      ],
      a.tol?.kind ?? "none",
      (k) => {
        const map: Record<string, Tolerance> = { none: { kind: "none" }, sym: { kind: "sym", value: "0.1" }, dev: { kind: "dev", upper: "+0.1", lower: "0" }, fit: { kind: "fit", fit: "H7" }, basic: { kind: "basic" }, ref: { kind: "ref" } };
        a.tol = map[k];
        render();
        this.updatePreview();
      },
    );
    parent.appendChild(box);
    render();
  }

  private buildFields(s: HTMLElement) {
    const a = this.anno;
    switch (a.type) {
      case "dim":
        this.tolFields(s, a);
        this.input(s, "文字 (上書き)", a.text ?? "", (v) => (v ? (a.text = v) : delete a.text));
        break;
      case "diameter":
        this.panel.select(s, "表記", [{ value: "d", label: "直径 φ" }, { value: "r", label: "半径 R" }], a.radius ? "r" : "d", (v) => {
          if (v === "r") a.radius = true;
          else delete a.radius;
          this.updatePreview();
        });
        this.tolFields(s, a);
        this.input(s, "文字 (上書き)", a.text ?? "", (v) => (v ? (a.text = v) : delete a.text));
        break;
      case "gdt":
        this.panel.select(s, "記号", GDT_SYMBOLS.map(([v, l]) => ({ value: v, label: `${v}  ${l}` })), a.symbol, (v) => ((a.symbol = v), this.updatePreview()));
        this.input(s, "公差値", a.value, (v) => (a.value = v));
        this.input(s, "データム", a.datums, (v) => (a.datums = v));
        this.panel.note(s, "データムは「A B」「A|B|C」のように区切って入力します。");
        break;
      case "datum":
        this.input(s, "文字", a.letter, (v) => (a.letter = v.trim().slice(0, 3) || "A"));
        break;
      case "surface":
        this.input(s, "Ra (μm)", a.ra, (v) => (a.ra = v));
        this.panel.select(
          s,
          "除去加工",
          [
            { value: "required", label: "除去加工をする" },
            { value: "any", label: "指示しない" },
            { value: "prohibited", label: "除去加工をしない" },
          ],
          a.removal,
          (v) => ((a.removal = v as typeof a.removal), this.updatePreview()),
        );
        break;
      case "note":
        this.input(s, "テキスト", a.text, (v) => (a.text = v), true);
        break;
    }
  }

  ok() {
    const need = PMI_REF_COUNT[this.anno.type];
    if (this.anno.refs.length < need) {
      const msg = `参照を ${need} つ選択してください`;
      this.panel.setError(msg);
      throw new Error(msg);
    }
    if (this.anno.type === "diameter") {
      const box = bodiesBox(this.app.pickBodies);
      const r = box && resolveRef(this.app.pickBodies, this.anno.refs[0], Math.max(1, vec.dist(box[0], box[1])));
      if (!r || radiusOf(r) === null) {
        this.panel.setError("円筒面または円形エッジを選択してください");
        throw new Error("円筒面または円形エッジを選択してください");
      }
    }
    const a = this.anno;
    const g = this.app.pmi.geometry(a);
    if (g && (a.type === "dim" || a.type === "diameter")) a.value = g.value;
    this.close();
    this.app.store.mutate(this.editing ? "PMI 編集" : "PMI 追加", (doc) => {
      const list = (doc.pmi ??= []);
      const i = list.findIndex((x) => x.id === a.id);
      if (i >= 0) list[i] = a;
      else list.push(a);
    });
  }

  cancel() {
    this.close();
  }

  onEscape() {
    if (this.placing) {
      this.placing = false;
      return true;
    }
    return false;
  }

  onRegen() {
    this.updatePicker();
  }

  private close() {
    this.panel.close();
    this.app.pmi.preview = null;
    this.app.pmi.highlight = null;
    this.app.pmi.refresh();
  }
}

export function startPmiCommand(app: App, id: string): Command | null {
  const type = PMI_COMMANDS[id];
  if (!type) return null;
  if (app.env !== "part") return null;
  if (!app.hasBodies()) {
    toast("3D 注記にはソリッド ボディが必要です", "warn");
    return null;
  }
  if (!app.pmi.visible) app.pmi.setVisible(true);
  return new PmiCommand(app, type);
}

export function editPmi(app: App, id: string) {
  const a = app.store.doc.pmi?.find((x) => x.id === id);
  if (!a) return;
  if (app.command) app.finishCommand(app.command, false);
  app.startCommand(new PmiCommand(app, a.type, a));
}

export function togglePmi(app: App) {
  app.pmi.setVisible(!app.pmi.visible);
  toast(app.pmi.visible ? "3D 注記を表示しました" : "3D 注記を非表示にしました", "info", 1600);
  app.ribbon.refresh();
}

export function exportPmiCsv(app: App) {
  const doc = app.store.doc;
  if (!doc.pmi?.length) return void toast("3D 注記 (PMI) がありません", "info");
  download(`${doc.name}_PMI.csv`, pmiCsv(doc), "text/csv;charset=utf-8");
}

/** PMI 一覧: all annotations with show / edit / delete. */
export function openPmiList(app: App) {
  const body = h("div", { class: "pmi-list" });
  let dlg: { close: () => void } | null = null;
  const render = () => {
    body.innerHTML = "";
    const list = app.store.doc.pmi ?? [];
    if (!list.length) {
      body.appendChild(h("p", { class: "pp-note" }, "3D 注記はまだありません。リボンの「MBD」タブから寸法・幾何公差などを追加してください。"));
      return;
    }
    const table = h("table", { class: "kv pmi-table" }, h("tr", {}, h("th", {}, "No"), h("th", {}, "種類"), h("th", {}, "表記"), h("th", {}, "参照"), h("th", {}, "")));
    list.forEach((a, i) => {
      const g = app.pmi.geoms.get(a.id);
      const state = g === null ? "⚠ 参照なし" : `${a.refs.map((r) => (r.kind === "face" ? "面" : "エッジ")).join("+")}`;
      const preview = h("span", { class: "pmi-label inline", html: pmiLabelHtml(a), title: pmiText(a) });
      const btn = (icon: string, title: string, fn: () => void) => h("button", { class: "icon-btn small", title, onClick: fn }, iconEl(icon));
      const row = h(
        "tr",
        {
          onPointerenter: () => ((app.pmi.highlight = a.id), app.pmi.refresh()),
          onPointerleave: () => ((app.pmi.highlight = null), app.pmi.refresh()),
        },
        h("td", {}, String(i + 1)),
        h("td", {}, PMI_LABELS[a.type]),
        h("td", {}, preview),
        h("td", {}, state),
        h(
          "td",
          {},
          btn(a.hidden ? "eyeOff" : "eye", a.hidden ? "表示する" : "非表示にする", () => {
            app.store.mutate("PMI 表示", (doc) => {
              const x = doc.pmi?.find((y) => y.id === a.id);
              if (x?.hidden) delete x.hidden;
              else if (x) x.hidden = true;
            });
            render();
          }),
          btn("edit", "編集", () => {
            dlg?.close();
            editPmi(app, a.id);
          }),
          btn("trash", "削除", () => {
            app.store.mutate("PMI 削除", (doc) => {
              doc.pmi = (doc.pmi ?? []).filter((x) => x.id !== a.id);
              if (!doc.pmi.length) delete doc.pmi;
            });
            render();
          }),
        ),
      );
      table.appendChild(row);
    });
    body.appendChild(table);
    const dims = list.filter((a) => (a.type === "dim" || a.type === "diameter") && a.value !== undefined).length;
    body.appendChild(h("p", { class: "pp-note" }, `${list.length} 個の注記 (寸法 ${dims} 個)。値はモデルの再計算に追従します。`));
  };
  render();
  dlg = modal({
    title: "PMI 一覧 (3D 注記)",
    icon: "iprops",
    width: 640,
    body,
    buttons: [{ label: "CSV 書き出し", onClick: () => (exportPmiCsv(app), false) }, { label: "閉じる", primary: true }],
    onClose: () => {
      app.pmi.highlight = null;
      app.pmi.refresh();
    },
  });
}
