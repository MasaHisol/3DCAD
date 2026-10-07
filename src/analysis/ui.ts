import * as THREE from "three";
import type { App } from "../app";
import type { Command } from "../commands/command";
import { formatNumber } from "../core/expr";
import { evalWith } from "../core/params";
import { download, h, iconEl, toast } from "../ui/dom";
import { PropertyPanel } from "../ui/panel";
import type { Pick, ToolHandler } from "../viewer/viewport";
import { FEA_MATERIALS, sampleDisp, sampleVm, type FeaBoundary, type FeaMesh, type FeaResult } from "./fea";
import type { FeaRequest } from "./worker";

type Dir = "push" | "pull" | "+X" | "-X" | "+Y" | "-Y" | "+Z" | "-Z";
const DIRS: { value: Dir; label: string }[] = [
  { value: "push", label: "面に垂直 (押す)" },
  { value: "pull", label: "面に垂直 (引く)" },
  { value: "+X", label: "+X" },
  { value: "-X", label: "-X" },
  { value: "+Y", label: "+Y" },
  { value: "-Y", label: "-Y" },
  { value: "+Z", label: "+Z" },
  { value: "-Z", label: "-Z" },
];

/** Blue → cyan → green → yellow → red (Inventor style result legend). */
export function colormap(t: number): [number, number, number] {
  const x = Math.max(0, Math.min(1, t)) * 4;
  const stops: [number, number, number][] = [
    [0.1, 0.25, 0.9],
    [0.1, 0.8, 0.95],
    [0.2, 0.85, 0.3],
    [0.98, 0.85, 0.15],
    [0.9, 0.15, 0.1],
  ];
  const i = Math.min(3, Math.floor(x)), f = x - i;
  const a = stops[i], b = stops[i + 1];
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
}

/** Stress analysis (Inventor 応力解析): fixed faces, face loads, von Mises / displacement / safety factor. */
export class StressCommand implements Command {
  readonly id = "stress";
  handler: ToolHandler;
  private panel: PropertyPanel;
  private fixed: Pick[] = [];
  private loaded: Pick[] = [];
  private mode: "fixed" | "load" = "fixed";
  private force = "1000";
  private dir: Dir = "push";
  private res = 40;
  private result: FeaResult | null = null;
  private show: "vm" | "disp" | "sf" = "vm";
  private deform = 0;
  private worker: Worker | null = null;
  private fixPick: ReturnType<PropertyPanel["picker"]>;
  private loadPick: ReturnType<PropertyPanel["picker"]>;
  private out: HTMLElement;
  private legend: HTMLElement;
  private runBtn: HTMLButtonElement;

  constructor(private app: App) {
    app.vp.pickKinds = new Set(["face"]);
    app.vp.pickFilter = null;
    this.panel = new PropertyPanel(app.panelHost, "応力解析", "stress", { onOk: () => app.finishCommand(this, true), onCancel: () => app.finishCommand(this, false) }, () => app.values());
    const p = this.panel;
    const mat = this.material();
    const ms = p.section("材料");
    p.note(ms, `${app.store.doc.material.name}: ヤング率 ${formatNumber(mat.E, 0)} MPa / ポアソン比 ${mat.nu} / 降伏応力 ${formatNumber(mat.yield, 0)} MPa (マテリアルは画面上部で変更)`);
    const bc = p.section("拘束と荷重");
    this.fixPick = p.picker(bc, "固定拘束", "fix", () => this.setMode("fixed"), () => ((this.fixed = []), this.sync()));
    this.loadPick = p.picker(bc, "荷重", "pushpull", () => this.setMode("load"), () => ((this.loaded = []), this.sync()));
    p.expr(bc, "力", this.force, "N", (e) => (this.force = e));
    p.select(bc, "方向", DIRS, this.dir, (v) => (this.dir = v as Dir));
    const mesh = p.section("メッシュ");
    p.select(
      mesh,
      "要素サイズ",
      [
        { value: "25", label: "粗い (高速)" },
        { value: "40", label: "標準" },
        { value: "65", label: "細かい" },
        { value: "90", label: "非常に細かい (低速)" },
      ],
      String(this.res),
      (v) => (this.res = Number(v)),
    );
    this.runBtn = h("button", { class: "btn primary", onClick: () => void this.run() }, iconEl("play"), "解析を実行") as HTMLButtonElement;
    mesh.appendChild(h("div", { class: "drive-btns" }, this.runBtn));
    const rs = p.section("結果");
    this.out = h("div", { class: "measure-out" }, "固定する面と荷重をかける面を選び、「解析を実行」をクリックしてください。");
    rs.appendChild(this.out);
    p.select(
      rs,
      "表示",
      [
        { value: "vm", label: "ミーゼス応力" },
        { value: "disp", label: "変位" },
        { value: "sf", label: "安全率" },
      ],
      this.show,
      (v) => ((this.show = v as "vm"), this.display()),
    );
    p.select(
      rs,
      "変形表示",
      [
        { value: "0", label: "なし" },
        { value: "auto", label: "自動倍率" },
        { value: "1", label: "実寸 (1 倍)" },
      ],
      "0",
      (v) => ((this.deform = v === "auto" ? -1 : Number(v)), this.display()),
    );
    rs.appendChild(h("button", { class: "btn", onClick: () => this.report() }, iconEl("export"), "レポートを書き出し"));
    this.legend = h("div", { class: "fea-legend" });
    app.vp.el.appendChild(this.legend);
    this.handler = {
      cursor: "pointer",
      onPointerMove: (e, vp) => vp.setHover(vp.pick(e)),
      onPointerDown: (e, vp) => {
        if (e.button !== 0) return;
        const pk = vp.pick(e);
        if (!pk || pk.kind !== "face") return;
        const list = this.mode === "fixed" ? this.fixed : this.loaded;
        const k = list.findIndex((x) => x.body === pk.body && x.index === pk.index);
        if (k >= 0) list.splice(k, 1);
        else list.push(pk);
        this.sync();
      },
    };
    this.setMode("fixed");
  }

  private material() {
    return FEA_MATERIALS[this.app.store.doc.material.name] ?? FEA_MATERIALS["汎用"];
  }

  private setMode(m: "fixed" | "load") {
    this.mode = m;
    this.fixPick.setActive(m === "fixed");
    this.loadPick.setActive(m === "load");
    this.app.status(m === "fixed" ? "固定する面をクリック (もう一度クリックで解除)" : "荷重をかける面をクリック");
    this.sync();
  }

  private sync() {
    this.fixPick.setCount(this.fixed.length, this.fixed.length ? `${this.fixed.length} 面` : "面を選択");
    this.loadPick.setCount(this.loaded.length, this.loaded.length ? `${this.loaded.length} 面` : "面を選択");
    this.app.vp.setSelection(this.mode === "fixed" ? this.fixed : this.loaded);
  }

  /** All bodies as one triangle soup; face picks -> triangle ids. */
  private buildMesh(): { mesh: FeaMesh; tris: (p: Pick) => number[]; offsets: number[] } {
    const bodies = this.app.bodies;
    let nv = 0, nt = 0;
    for (const b of bodies) (nv += b.positions.length / 3), (nt += b.indices.length / 3);
    const positions = new Float32Array(nv * 3), indices = new Uint32Array(nt * 3);
    const vOff: number[] = [], tOff: number[] = [];
    let v = 0, t = 0;
    for (const b of bodies) {
      vOff.push(v);
      tOff.push(t);
      positions.set(b.positions, v * 3);
      for (let i = 0; i < b.indices.length; i++) indices[t * 3 + i] = b.indices[i] + v;
      v += b.positions.length / 3;
      t += b.indices.length / 3;
    }
    const tris = (p: Pick) => {
      const b = bodies[p.body];
      const s = b.faceRanges[p.index * 2], n = b.faceRanges[p.index * 2 + 1];
      const out: number[] = [];
      for (let k = 0; k < n; k += 3) out.push(tOff[p.body] + (s + k) / 3);
      return out;
    };
    return { mesh: { positions, indices }, tris, offsets: vOff };
  }

  private forceVec(p: Pick, F: number): [number, number, number] {
    const f = this.app.bodies[p.body].faces[p.index];
    const d = this.dir;
    if (d === "push" || d === "pull") {
      const s = d === "push" ? -1 : 1;
      return [f.normal[0] * F * s, f.normal[1] * F * s, f.normal[2] * F * s];
    }
    const axis = { X: 0, Y: 1, Z: 2 }[d[1] as "X"];
    const v: [number, number, number] = [0, 0, 0];
    v[axis] = d[0] === "-" ? -F : F;
    return v;
  }

  private async run() {
    if (!this.fixed.length) return void toast("固定拘束の面を選択してください", "warn");
    if (!this.loaded.length) return void toast("荷重をかける面を選択してください", "warn");
    let F: number;
    try {
      F = evalWith(this.app.values(), this.force);
    } catch (e) {
      return void toast(`力: ${(e as Error).message}`, "error");
    }
    const { mesh, tris } = this.buildMesh();
    // a total force per loaded face, shared by its area
    const areas = this.loaded.map((p) => this.faceArea(p));
    const total = areas.reduce((a, b) => a + b, 0) || 1;
    const bc: FeaBoundary = {
      fixed: this.fixed.map(tris),
      loads: this.loaded.map((p, i) => ({ tris: tris(p), force: this.forceVec(p, (F * areas[i]) / total) })),
    };
    const req: FeaRequest = { mesh, bc, mat: this.material(), opt: { resolution: this.res } };
    this.worker?.terminate();
    const w = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });
    this.worker = w;
    this.runBtn.disabled = true;
    this.out.textContent = "メッシュ作成・求解中…";
    const t0 = performance.now();
    try {
      this.result = await new Promise<FeaResult>((resolve, reject) => {
        w.onmessage = (e) => {
          const d = e.data as { progress?: { it: number; res: number }; result?: FeaResult; error?: string };
          if (d.progress) this.out.textContent = `求解中… 反復 ${d.progress.it} (残差 ${d.progress.res.toExponential(1)})`;
          else if (d.result) resolve(d.result);
          else reject(new Error(d.error));
        };
        w.onerror = (e) => reject(new Error(e.message));
        w.postMessage(req);
      });
    } catch (e) {
      this.out.textContent = `解析できませんでした: ${(e as Error).message}`;
      return;
    } finally {
      this.runBtn.disabled = false;
      w.terminate();
      if (this.worker === w) this.worker = null;
    }
    const r = this.result;
    const mat = this.material();
    const sf = r.maxVm > 0 ? mat.yield / r.maxVm : Infinity;
    this.out.innerHTML = "";
    const row = (k: string, v: string, cls = "") => this.out.appendChild(h("div", { class: "mo-row " + cls }, h("span", {}, k), h("b", {}, v)));
    row("最大ミーゼス応力", `${formatNumber(r.maxVm, 2)} MPa`);
    row("最大変位", `${formatNumber(r.maxDisp, 4)} mm`);
    row("最小安全率", Number.isFinite(sf) ? formatNumber(sf, 2) : "∞", sf < 1 ? "bad" : sf < 2 ? "warn" : "ok");
    row("要素数", `${r.elements.toLocaleString()} (要素サイズ ${formatNumber(r.h, 2)} mm)`);
    row("計算", `${r.iterations} 反復 / ${formatNumber((performance.now() - t0) / 1000, 1)} 秒${r.converged ? "" : " (未収束)"}`);
    if (sf < 1) toast("降伏応力を超えています (安全率 < 1)", "warn");
    this.display();
  }

  private faceArea(p: Pick): number {
    const b = this.app.bodies[p.body];
    const s = b.faceRanges[p.index * 2], n = b.faceRanges[p.index * 2 + 1];
    let a = 0;
    const P = b.positions, I = b.indices;
    for (let k = s; k < s + n; k += 3) {
      const i = I[k] * 3, j = I[k + 1] * 3, l = I[k + 2] * 3;
      const ux = P[j] - P[i], uy = P[j + 1] - P[i + 1], uz = P[j + 2] - P[i + 2];
      const vx = P[l] - P[i], vy = P[l + 1] - P[i + 1], vz = P[l + 2] - P[i + 2];
      a += Math.hypot(uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx) / 2;
    }
    return a;
  }

  private display() {
    const r = this.result;
    if (!r) return;
    const mat = this.material();
    const bodies = this.app.bodies;
    const size = this.app.vp.modelBounds().getSize(new THREE.Vector3());
    const scale = this.deform < 0 ? (r.maxDisp > 0 ? (size.length() * 0.08) / r.maxDisp : 0) : this.deform;
    const maxV = this.show === "vm" ? r.maxVm : this.show === "disp" ? r.maxDisp : 15;
    const per = bodies.map((b) => {
      const n = b.positions.length / 3;
      const colors = new Float32Array(n * 3);
      const pos = scale ? new Float32Array(b.positions) : undefined;
      for (let i = 0; i < n; i++) {
        const p = b.positions.subarray(i * 3, i * 3 + 3);
        let t: number;
        if (this.show === "disp") {
          const d = sampleDisp(r, p);
          t = maxV ? Math.hypot(...d) / maxV : 0;
        } else if (this.show === "sf") {
          const v = sampleVm(r, p);
          t = 1 - Math.min(15, v > 0 ? mat.yield / v : 15) / 15;
        } else t = maxV ? sampleVm(r, p) / maxV : 0;
        const c = colormap(t);
        colors.set(c, i * 3);
        if (pos) {
          const d = sampleDisp(r, p);
          pos[i * 3] += d[0] * scale;
          pos[i * 3 + 1] += d[1] * scale;
          pos[i * 3 + 2] += d[2] * scale;
        }
      }
      return { colors, positions: pos };
    });
    this.app.vp.setResult(per);
    // legend
    const title = this.show === "vm" ? "ミーゼス応力 [MPa]" : this.show === "disp" ? "変位 [mm]" : "安全率";
    const stops = [1, 0.75, 0.5, 0.25, 0].map((t) => {
      const c = colormap(t).map((x) => Math.round(x * 255)).join(",");
      const v = this.show === "sf" ? formatNumber(15 * (1 - t), 1) : formatNumber(maxV * t, this.show === "disp" ? 4 : 2);
      return h("div", { class: "fl-row" }, h("span", { class: "fl-sw", style: `background:rgb(${c})` }), h("span", {}, (this.show === "sf" && t === 0 ? "≥ " : "") + v));
    });
    this.legend.innerHTML = "";
    this.legend.append(h("div", { class: "fl-title" }, title), ...stops, scale ? h("div", { class: "muted" }, `変形倍率 ×${formatNumber(scale, 1)}`) : "");
    this.legend.classList.add("show");
  }

  private report() {
    const r = this.result;
    if (!r) return void toast("先に解析を実行してください", "warn");
    const doc = this.app.store.doc;
    const mat = this.material();
    const lines = [
      `# 応力解析レポート — ${doc.name}`,
      ``,
      `| 項目 | 値 |`,
      `|---|---|`,
      `| 材料 | ${doc.material.name} (E=${mat.E} MPa, ν=${mat.nu}, 降伏 ${mat.yield} MPa) |`,
      `| 荷重 | ${this.force} N (${DIRS.find((d) => d.value === this.dir)!.label}), ${this.loaded.length} 面 |`,
      `| 固定拘束 | ${this.fixed.length} 面 |`,
      `| 要素 | ${r.elements} 個 (六面体, サイズ ${formatNumber(r.h, 3)} mm) |`,
      `| 最大ミーゼス応力 | ${formatNumber(r.maxVm, 3)} MPa |`,
      `| 最大変位 | ${formatNumber(r.maxDisp, 5)} mm |`,
      `| 最小安全率 | ${r.maxVm > 0 ? formatNumber(mat.yield / r.maxVm, 3) : "∞"} |`,
      ``,
      `線形静解析 (微小変形・線形弾性)。ボクセル メッシュによる簡易解析のため、応力集中部の値は要素サイズに依存します。`,
    ];
    download(`${doc.name}_応力解析.md`, lines.join("\n"), "text/markdown");
  }

  private close() {
    this.worker?.terminate();
    this.app.vp.setResult(null);
    this.legend.remove();
    this.panel.close();
  }

  ok() {
    this.close();
  }
  cancel() {
    this.close();
  }
}
