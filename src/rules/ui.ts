import type { App } from "../app";
import { uid } from "../core/document";
import type { FamilyTable } from "../core/types";
import { h, iconEl, modal, toast } from "../ui/dom";
import { RULE_SNIPPETS, TRIGGER_LABEL, type Rule, type RuleTrigger } from "./engine";

/** iLogic browser: list of rules with an editor, snippets and a run console. */
export function openRules(app: App) {
  if (app.env !== "part") return void toast("ルールはパーツ環境で使用します", "info");
  const rules: Rule[] = structuredClone(app.store.doc.rules ?? []);
  let cur = 0;
  const list = h("div", { class: "rl-list" });
  const name = h("input", { class: "field-input" }) as HTMLInputElement;
  const trig = h("select", { class: "field-input" }) as HTMLSelectElement;
  for (const [k, v] of Object.entries(TRIGGER_LABEL)) trig.appendChild(h("option", { value: k }, v));
  const enabled = h("input", { type: "checkbox" }) as HTMLInputElement;
  const code = h("textarea", { class: "rl-code", spellcheck: "false" }) as HTMLTextAreaElement;
  const out = h("div", { class: "rl-out" });
  const editor = h("div", { class: "rl-editor" });

  const insert = (text: string) => {
    const s = code.selectionStart, e = code.selectionEnd;
    code.value = code.value.slice(0, s) + text + code.value.slice(e);
    code.selectionStart = code.selectionEnd = s + text.length;
    code.focus();
    save();
  };
  const save = () => {
    const r = rules[cur];
    if (!r) return;
    r.name = name.value.trim() || r.name;
    r.trigger = trig.value as RuleTrigger;
    r.enabled = enabled.checked;
    r.code = code.value;
    renderList();
  };
  const renderList = () => {
    list.innerHTML = "";
    rules.forEach((r, i) =>
      list.appendChild(
        h(
          "button",
          { class: "lib-item" + (i === cur ? " on" : "") + (r.enabled ? "" : " dimmed"), onClick: () => ((cur = i), load()) },
          iconEl("rule"),
          h("span", {}, h("b", {}, r.name), h("small", {}, TRIGGER_LABEL[r.trigger] + (r.enabled ? "" : " (無効)"))),
        ),
      ),
    );
    list.appendChild(
      h(
        "button",
        {
          class: "btn",
          onClick: () => {
            rules.push({ id: uid("rl"), name: `ルール${rules.length + 1}`, code: "", trigger: "paramChange", enabled: true });
            cur = rules.length - 1;
            load();
          },
        },
        iconEl("plus"),
        "ルールを追加",
      ),
    );
  };
  const load = () => {
    const r = rules[cur];
    editor.style.display = r ? "" : "none";
    if (r) {
      name.value = r.name;
      trig.value = r.trigger;
      enabled.checked = r.enabled;
      code.value = r.code;
      out.textContent = "";
    }
    renderList();
  };
  for (const el of [name, code]) el.addEventListener("input", save);
  for (const el of [trig, enabled]) el.addEventListener("change", save);
  code.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      insert("  ");
    }
  });

  const params = app.store.doc.params.filter((p) => p.kind === "user" || !/^d\d+$/.test(p.name));
  const chips = h(
    "div",
    { class: "rl-chips" },
    h("span", { class: "muted" }, "パラメータ:"),
    ...(params.length ? params : app.store.doc.params.slice(0, 12)).map((p) => h("button", { class: "chip", title: `${p.expr} ${p.unit}`, onClick: () => insert(p.name) }, p.name)),
  );
  const snippets = h(
    "div",
    { class: "rl-chips" },
    h("span", { class: "muted" }, "スニペット:"),
    ...RULE_SNIPPETS.map((sn) => h("button", { class: "chip", onClick: () => insert((code.value && !code.value.endsWith("\n") ? "\n" : "") + sn.code + "\n") }, sn.label)),
  );
  editor.append(
    h("label", { class: "field" }, h("span", { class: "field-label" }, "名前"), h("span", { class: "field-ctl" }, name)),
    h("label", { class: "field" }, h("span", { class: "field-label" }, "実行タイミング"), h("span", { class: "field-ctl" }, trig)),
    h("label", { class: "field check" }, enabled, h("span", {}, "有効")),
    chips,
    snippets,
    code,
    h(
      "div",
      { class: "drive-btns" },
      h(
        "button",
        {
          class: "btn primary",
          onClick: async () => {
            save();
            app.markRulesTrusted();
            const res = await app.runRules([rules[cur]]);
            out.textContent = res.map((r) => (r.error ? `✗ ${r.error}` : `✓ ${describe(r.result!)}`)).join("\n");
          },
        },
        iconEl("play"),
        "このルールを実行",
      ),
      h(
        "button",
        {
          class: "btn",
          onClick: () => {
            rules.splice(cur, 1);
            cur = Math.max(0, cur - 1);
            load();
          },
        },
        iconEl("trash"),
        "削除",
      ),
    ),
    out,
    h("p", { class: "muted" }, "パラメータ名をそのまま変数として読み書きできます (ローカル変数は let / const)。関数: suppress(名前, true/false)、iprop(キー, 値)、material(名前)、message(…)、mass()、volume()、round(値, 単位)、clamp(値, 最小, 最大)。ルールは安全なサンドボックス (ネットワーク不可) で実行され、変更は 1 回の「元に戻す」で取り消せます。"),
  );
  load();
  modal({
    title: "ルール (iLogic)",
    icon: "rule",
    body: h("div", { class: "lib rl" }, list, editor),
    width: 860,
    buttons: [
      {
        label: "OK",
        primary: true,
        onClick: () => {
          save();
          app.markRulesTrusted();
          if (JSON.stringify(rules) !== JSON.stringify(app.store.doc.rules ?? [])) app.store.mutate("ルールを編集", (d) => (d.rules = structuredClone(rules)));
        },
      },
      { label: "キャンセル" },
    ],
  });
}

function describe(r: { params: Record<string, number>; suppress: Record<string, boolean>; iprops: Record<string, string>; material?: string; messages: string[] }): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(r.params)) parts.push(`${k} = ${v}`);
  for (const [k, v] of Object.entries(r.suppress)) parts.push(`${k} を${v ? "抑制" : "抑制解除"}`);
  for (const [k, v] of Object.entries(r.iprops)) parts.push(`iProperty ${k} = ${v}`);
  if (r.material) parts.push(`マテリアル = ${r.material}`);
  for (const m of r.messages) parts.push(`メッセージ: ${m}`);
  return parts.length ? parts.join(" / ") : "変更なし";
}

/** Family table (iPart / SOLIDWORKS design table): named configurations of parameter values. */
export function openFamily(app: App) {
  if (app.env !== "part") return void toast("ファミリー表はパーツ環境で使用します", "info");
  const doc = app.store.doc;
  const fam: FamilyTable = structuredClone(doc.family ?? { columns: doc.params.filter((p) => p.kind === "user").map((p) => p.name).slice(0, 4), rows: [], active: 0 });
  if (!fam.rows.length) fam.rows.push({ name: "標準", values: fam.columns.map((c) => app.store.param(c)?.expr ?? "") });
  const table = h("table", { class: "fam-table" });
  const colPick = h("div", { class: "rl-chips" });
  const render = () => {
    table.innerHTML = "";
    table.appendChild(h("tr", {}, h("th", {}, ""), h("th", {}, "構成名"), ...fam.columns.map((c) => h("th", {}, c)), h("th", {}, "")));
    fam.rows.forEach((r, i) => {
      const radio = h("input", { type: "radio", name: "fam-active", checked: i === fam.active }) as HTMLInputElement;
      radio.addEventListener("change", () => (fam.active = i));
      const cell = (v: string, set: (s: string) => void) => {
        const inp = h("input", { class: "field-input", value: v }) as HTMLInputElement;
        inp.addEventListener("input", () => set(inp.value));
        return h("td", {}, inp);
      };
      table.appendChild(
        h(
          "tr",
          {},
          h("td", {}, radio),
          cell(r.name, (s) => (r.name = s)),
          ...fam.columns.map((_, k) => cell(r.values[k] ?? "", (s) => (r.values[k] = s))),
          h("td", {}, h("button", { class: "icon-btn small", title: "行を削除", onClick: () => (fam.rows.splice(i, 1), (fam.active = Math.min(fam.active, fam.rows.length - 1)), render()) }, iconEl("trash"))),
        ),
      );
    });
    colPick.innerHTML = "";
    colPick.appendChild(h("span", { class: "muted" }, "列にするパラメータ:"));
    for (const p of doc.params) {
      const on = fam.columns.includes(p.name);
      colPick.appendChild(
        h(
          "button",
          {
            class: "chip" + (on ? " on" : ""),
            onClick: () => {
              if (on) {
                const k = fam.columns.indexOf(p.name);
                fam.columns.splice(k, 1);
                for (const r of fam.rows) r.values.splice(k, 1);
              } else {
                fam.columns.push(p.name);
                for (const r of fam.rows) r.values.push(app.store.param(p.name)?.expr ?? "");
              }
              render();
            },
          },
          p.name,
        ),
      );
    }
  };
  render();
  const apply = () => {
    const row = fam.rows[fam.active];
    app.store.mutate(`構成「${row?.name ?? ""}」`, (d) => {
      d.family = structuredClone(fam);
      if (!row) return;
      fam.columns.forEach((c, k) => {
        const p = d.params.find((x) => x.name === c);
        if (p && row.values[k]?.trim()) p.expr = row.values[k].trim();
      });
      if (row.name) d.iprops["構成"] = row.name;
    });
  };
  modal({
    title: "ファミリー表 (iPart / デザイン テーブル)",
    icon: "rectPattern",
    body: h(
      "div",
      {},
      colPick,
      h("div", { class: "fam-wrap" }, table),
      h(
        "div",
        { class: "drive-btns" },
        h("button", { class: "btn", onClick: () => (fam.rows.push({ name: `構成${fam.rows.length + 1}`, values: fam.columns.map((c) => app.store.param(c)?.expr ?? "") }), render()) }, iconEl("plus"), "行を追加"),
      ),
      h("p", { class: "muted" }, "選択した行 (●) の値がパラメータに設定されます。値には式も使えます。構成名は iProperty「構成」に入ります。"),
    ),
    width: 760,
    buttons: [{ label: "選択した構成を適用", primary: true, onClick: apply }, { label: "キャンセル" }],
  });
}
