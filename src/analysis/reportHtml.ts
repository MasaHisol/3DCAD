// Minimal Markdown (headings, pipe tables, paragraphs) → printable HTML for
// analysis reports, with an optional result image.

const esc = (s: string) => s.replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" })[c]!);

export function markdownToHtml(md: string): string {
  const out: string[] = [];
  const lines = md.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (/^#{1,6} /.test(l)) {
      const n = l.match(/^#+/)![0].length;
      out.push(`<h${n}>${esc(l.slice(n + 1))}</h${n}>`);
    } else if (l.startsWith("|")) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        const cells = lines[i].slice(1, lines[i].endsWith("|") ? -1 : undefined).split("|").map((c) => c.trim());
        if (!cells.every((c) => /^:?-+:?$/.test(c))) rows.push(cells);
        i++;
      }
      i--;
      out.push(`<table>${rows.map((r, ri) => `<tr>${r.map((c) => (ri === 0 ? `<th>${esc(c)}</th>` : `<td>${esc(c)}</td>`)).join("")}</tr>`).join("")}</table>`);
    } else if (l.trim()) out.push(`<p>${esc(l)}</p>`);
  }
  return out.join("\n");
}

export function reportHtml(title: string, md: string, image?: string, legend?: string): string {
  const date = new Date().toLocaleString("ja-JP");
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>
@page{size:A4;margin:15mm}body{font-family:'Yu Gothic UI','Hiragino Sans','Noto Sans CJK JP',sans-serif;font-size:10.5pt;color:#111}
h1{font-size:16pt;border-bottom:2px solid #333;padding-bottom:4px}h2{font-size:12.5pt;margin-top:14px;border-left:4px solid #4a7bd0;padding-left:6px}
table{border-collapse:collapse;width:100%;margin:6px 0}th,td{border:1px solid #999;padding:3px 6px;text-align:left}th{background:#eef1f6}
img{max-width:100%;border:1px solid #ccc}.meta{color:#555;font-size:9pt}.legend{font-size:9pt;color:#333}
</style></head><body><div class="meta">作成日時: ${esc(date)}</div>${markdownToHtml(md)}${image ? `<h2>結果図</h2><img src="${image}"/>${legend ? `<div class="legend">${esc(legend)}</div>` : ""}` : ""}</body></html>`;
}
