# 座学テキストの図・アニメーション スタイルガイド

Every figure in the textbook (`src/textbook/content/*.ts`, `src/textbook/anim*.ts`) uses the shared **figure kit**:

- **Definitions** (`<defs>`) live in `src/textbook/figkit.ts`. They are installed once per page, so any inline SVG can reference them by id.
- **Classes** live in `src/textbook/textbook.css`, under the "figure kit" section.

Colours come from CSS variables, so the figures work in both light and dark themes.

> **Never** use `fill="var(...)"` or `stroke="var(...)"` as SVG *attributes*; that doesn't work. Use `style="fill:var(--tb-bad)"` or a kit class instead.
> `fill="none"` and plain hex colours as attributes are fine.

## Reference example
See the rib figure in `src/textbook/content/knowhow.ts` (`aria-label="リブの厚さとひけ"`), and copy its approach:
- side-by-side `k-panel` cards with ✕/✓ badges and `k-title` headers
- sectioned parts drawn with `k-cut` (hatched) inside `<g class="k-shadow">`
- real dimension lines (`k-ext` + `k-dimline` + `k-dimtext`)
- callout arrows

## Classes

| Purpose | Class / reference |
|---|---|
| Solid part (steel look, vertical gradient) | `class="k-part"` (`k-part-h` is a horizontal gradient for shafts and cylinders) |
| Aluminium / plastic / accent-coloured part | `k-alu` / `k-plastic` / `k-accent` |
| Cut section with hatching (JIS 45°) | `k-cut`, or `k-cut2` for an adjacent part hatched the other way |
| Ground / fixed support | `<rect class="k-ground">` under a base line |
| Human figure, skin tone | `k-skin`; sphere, ball, bearing ball: `k-sphere` |
| Soft drop shadow (wrap the solid parts) | `<g class="k-shadow">…</g>` |
| Glow highlight | `k-glow` |
| Outline only / thin line / hidden line / centre line | `k-edge` / `k-thin` / `k-hidden` / `k-center` |
| Dimension: extension lines, dimension line with arrows, text | `k-ext`, `k-dimline`, `k-dimtext` |
| Force arrow (red, arrowhead) | `class="k-force"` on a line or path |
| Motion arrow (blue, arrowhead) | `class="k-move"` |
| Plain arrowheads | `marker-end="url(#k-arrow)"`; coloured: `#k-arrow-red`, `#k-arrow-blue`, `#k-arrow-green` |
| Good / bad labels | `k-good-t` / `k-bad-t`; stroke colours `k-good` / `k-bad` |
| Panel cards, headings, notes | `k-panel` (rect, rx 8), `k-title`, `k-note` |
| Round badge with ✓ / ✕ / number | `<circle class="k-badge" style="fill:var(--tb-good)">` + `<text class="k-badge-t">` |
| Heat / contour colour bar | `fill="url(#k-heat)"` |
| Existing chart classes (still valid) | `grid`, `axis`, `tick`, `lbl`, `mark`, `mark-t`, `guide` |

Theme colours: `--tb-accent` (blue), `--tb-good`, `--tb-warn`, `--tb-bad`, `--tb-text`, `--tb-text-2`, `--tb-text-3`, `--tb-border`, `--tb-surface`, `--tb-surface-2`.

## Quality bar

1. **Show the real thing.** Parts look like parts: filled, with gradient shading and a shadow. Sections are hatched. People have proportionate bodies drawn with `k-skin` heads and hands, simple clothing fills and a clear posture. Machines show recognisable components.
2. **Compare side by side.** Use ✕ → ✓ or Before → After with panels and badges.
3. **Label directly.** Put labels next to the item, with leader lines where needed, rather than relying on a legend. Use dimension lines for sizes.
4. **Keep a hierarchy.** Draw the main subject strongly (1.6 px outlines, fills). Keep context thin and grey, and use colour only for meaning: red for danger or bad, green for good, blue for motion or dimensions.
5. **Leave room.** Text must not overlap anything. Keep at least 6 px of margin inside the viewBox. Use font size 11 px or more.
6. **Keep the meaning.** Keep each figure's content, the facts it shows and its caption. Improve only how it looks, adding detail where it helps understanding.
7. **Make it work in both themes.** Use only variables and kit classes for colours, except semantic hex values inside gradients you define yourself.
8. **Size.** Keep the `viewBox` width at 520; the height can grow if needed. Always include `role="img"` and an `aria-label`.

## Animations (`anim*.ts`)

- Use the kit classes inside animated SVGs too.
- Ease motion with smoothstep or ease-in-out, not linear jumps, and aim for about 60 fps through the existing `loop` helper.
- Give each figure a clear title, controls with units, and a live readout.
- Keep the existing behaviour:
  - a static first frame
  - the loop stops when the host is disconnected
  - respect `prefers-reduced-motion`
- Don't change the widget names.
