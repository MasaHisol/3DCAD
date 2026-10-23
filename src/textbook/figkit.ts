// Shared figure kit: one hidden <svg> with gradients, hatch patterns, arrow
// markers and filters that every inline figure can reference by id
// (fill="url(#k-steel)", marker-end="url(#k-arrow)", class="k-part" ...).
// Colours come from CSS variables so light / dark themes both work.

export const FIGKIT_DEFS = `
<linearGradient id="k-steel" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" style="stop-color:var(--k-steel-1)"/><stop offset="0.12" style="stop-color:var(--k-steel-0)"/><stop offset="0.5" style="stop-color:var(--k-steel-2)"/><stop offset="0.86" style="stop-color:var(--k-steel-3)"/><stop offset="1" style="stop-color:var(--k-steel-2)"/>
</linearGradient>
<linearGradient id="k-steel-h" x1="0" y1="0" x2="1" y2="0">
  <stop offset="0" style="stop-color:var(--k-steel-3)"/><stop offset="0.35" style="stop-color:var(--k-steel-1)"/><stop offset="1" style="stop-color:var(--k-steel-3)"/>
</linearGradient>
<linearGradient id="k-alu" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" style="stop-color:var(--k-alu-1)"/><stop offset="0.15" style="stop-color:var(--k-steel-0)"/><stop offset="0.6" style="stop-color:var(--k-alu-1)"/><stop offset="1" style="stop-color:var(--k-alu-2)"/>
</linearGradient>
<linearGradient id="k-plastic" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" style="stop-color:var(--k-plastic-1)"/><stop offset="0.7" style="stop-color:var(--k-plastic-2)"/><stop offset="1" style="stop-color:var(--k-plastic-3)"/>
</linearGradient>
<linearGradient id="k-accent" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" style="stop-color:var(--k-accent-1)"/><stop offset="1" style="stop-color:var(--k-accent-2)"/>
</linearGradient>
<linearGradient id="k-skin" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" style="stop-color:var(--k-skin-1)"/><stop offset="1" style="stop-color:var(--k-skin-2)"/>
</linearGradient>
<radialGradient id="k-sphere" cx="0.35" cy="0.3" r="0.75">
  <stop offset="0" style="stop-color:var(--k-steel-0)"/><stop offset="0.3" style="stop-color:var(--k-steel-1)"/><stop offset="1" style="stop-color:var(--k-steel-3)"/>
</radialGradient>
<linearGradient id="k-heat" x1="0" y1="0" x2="1" y2="0">
  <stop offset="0" stop-color="#2563eb"/><stop offset="0.25" stop-color="#06b6d4"/><stop offset="0.5" stop-color="#22c55e"/><stop offset="0.75" stop-color="#eab308"/><stop offset="1" stop-color="#dc2626"/>
</linearGradient>
<linearGradient id="k-rubber" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" style="stop-color:var(--k-rubber-1)"/><stop offset="1" style="stop-color:var(--k-rubber-2)"/>
</linearGradient>
<linearGradient id="k-copper" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#f3c39a"/><stop offset="0.45" stop-color="#d98b52"/><stop offset="1" stop-color="#a65a2a"/>
</linearGradient>
<linearGradient id="k-glass" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" style="stop-color:var(--k-glass-1)"/><stop offset="1" style="stop-color:var(--k-glass-2)"/>
</linearGradient>
<linearGradient id="k-screen" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#1e2a3a"/><stop offset="1" stop-color="#0d141d"/>
</linearGradient>
<linearGradient id="k-yellow" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#ffd84d"/><stop offset="1" stop-color="#f2b705"/>
</linearGradient>
<linearGradient id="k-person" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" style="stop-color:var(--k-person-1)"/><stop offset="1" style="stop-color:var(--k-person-2)"/>
</linearGradient>
<radialGradient id="k-led-g" cx="0.4" cy="0.35" r="0.7"><stop offset="0" stop-color="#d9ffe6"/><stop offset="0.45" stop-color="#22c55e"/><stop offset="1" stop-color="#11793a"/></radialGradient>
<radialGradient id="k-led-r" cx="0.4" cy="0.35" r="0.7"><stop offset="0" stop-color="#ffe0e0"/><stop offset="0.45" stop-color="#ef4444"/><stop offset="1" stop-color="#991b1b"/></radialGradient>
<radialGradient id="k-led-y" cx="0.4" cy="0.35" r="0.7"><stop offset="0" stop-color="#fff6cc"/><stop offset="0.45" stop-color="#f5b400"/><stop offset="1" stop-color="#a16207"/></radialGradient>
<radialGradient id="k-estop" cx="0.4" cy="0.35" r="0.7"><stop offset="0" stop-color="#ff8a8a"/><stop offset="0.5" stop-color="#e11d1d"/><stop offset="1" stop-color="#8b0f0f"/></radialGradient>
<pattern id="k-hazard" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
  <rect width="14" height="14" fill="#f5c400"/><rect width="7" height="14" fill="#1f2328"/>
</pattern>
<filter id="k-soft" x="-10%" y="-10%" width="120%" height="135%">
  <feDropShadow dx="0" dy="1.6" stdDeviation="1.4" flood-color="#0b1220" flood-opacity="0.18"/>
</filter>
<filter id="k-card" x="-5%" y="-5%" width="110%" height="120%">
  <feDropShadow dx="0" dy="1" stdDeviation="1.6" flood-color="#0b1220" flood-opacity="0.10"/>
</filter>
<pattern id="k-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
  <rect width="7" height="7" style="fill:var(--k-hatch-bg)"/><line x1="0" y1="0" x2="0" y2="7" style="stroke:var(--k-line)" stroke-width="1"/>
</pattern>
<pattern id="k-hatch2" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
  <rect width="7" height="7" style="fill:var(--k-hatch-bg)"/><line x1="0" y1="0" x2="0" y2="7" style="stroke:var(--k-line)" stroke-width="1"/>
</pattern>
<pattern id="k-ground" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
  <line x1="0" y1="0" x2="0" y2="8" style="stroke:var(--k-line-2)" stroke-width="1.2"/>
</pattern>
<pattern id="k-dots" width="6" height="6" patternUnits="userSpaceOnUse">
  <circle cx="3" cy="3" r="0.9" style="fill:var(--k-line-2)"/>
</pattern>
<marker id="k-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
  <path d="M0 1 L10 5 L0 9 Z" style="fill:var(--k-line)"/>
</marker>
<marker id="k-arrow-red" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
  <path d="M0 1 L10 5 L0 9 Z" style="fill:var(--tb-bad)"/>
</marker>
<marker id="k-arrow-blue" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
  <path d="M0 1 L10 5 L0 9 Z" style="fill:var(--tb-accent)"/>
</marker>
<marker id="k-arrow-green" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
  <path d="M0 1 L10 5 L0 9 Z" style="fill:var(--tb-good)"/>
</marker>
<marker id="k-dim" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="9" markerHeight="9" orient="auto-start-reverse">
  <path d="M0 2.5 L10 5 L0 7.5 Z" style="fill:var(--k-dim)"/>
</marker>
<marker id="k-dot" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5">
  <circle cx="5" cy="5" r="4" style="fill:var(--k-line)"/>
</marker>
<filter id="k-shadow" x="-20%" y="-20%" width="140%" height="150%">
  <feDropShadow dx="0" dy="2" stdDeviation="2.2" flood-color="#0b1220" flood-opacity="0.22"/>
</filter>
<filter id="k-glow" x="-30%" y="-30%" width="160%" height="160%">
  <feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
</filter>`;

/** Insert the kit once per document (idempotent). */
export function installFigKit(doc: Document = document) {
  if (doc.getElementById("tb-figkit")) return;
  const host = doc.createElementNS("http://www.w3.org/2000/svg", "svg");
  host.id = "tb-figkit";
  host.setAttribute("aria-hidden", "true");
  host.setAttribute("width", "0");
  host.setAttribute("height", "0");
  host.style.position = "absolute";
  host.innerHTML = `<defs>${FIGKIT_DEFS}</defs>`;
  doc.body.prepend(host);
}
