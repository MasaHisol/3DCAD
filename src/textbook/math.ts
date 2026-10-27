// Math typesetting for the textbook. Chapters write TeX in
//   <div class="tb-math">…</div>  (display)   and   <span class="tb-m">…</span>  (inline);
// Japanese words go inside \text{…}. Rendered once per chapter with KaTeX (bundled, offline).
import katex from "katex";
import "katex/dist/katex.min.css";

export function renderMath(root: HTMLElement) {
  for (const el of root.querySelectorAll<HTMLElement>(".tb-math, .tb-m")) {
    if (el.dataset.tex !== undefined) continue;
    const tex = el.textContent ?? "";
    el.dataset.tex = tex;
    try {
      katex.render(tex, el, { displayMode: el.classList.contains("tb-math"), throwOnError: false, strict: "ignore", output: "html" });
    } catch {
      el.textContent = tex;
    }
  }
}
