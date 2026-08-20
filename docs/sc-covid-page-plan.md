# sc-covid page plan

Plan for the interactive project page. No code yet.

Scope agreed: two hero charts, layered depth via tabs, plus a Projects card on the main page.

---

## 1. What we can show off

The data is stronger than "I made a chart." Five things it proves:

| # | The flex | Where it shows up |
|---|---|---|
| 1 | **Scale handled in the browser.** 24,000 cells drawn at 60fps, no chart library. | The UMAP itself. Speed is the proof. |
| 2 | **A real finding, in one sentence.** COVID blood expands effector cells and drains naive/memory ones. | Headline + bar chart. |
| 3 | **Method judgment.** Used the pre-computed scVI embedding instead of a raw counts pipeline. Faster, and batch effects were already corrected. | Method tab. |
| 4 | **Scientific honesty.** Four caveats stated up front, including ones that weaken the result. | Caveats tab. |
| 5 | **End to end.** Census query, Python analysis, a written export contract, then the web app. | Method tab, one short diagram or list. |

Number 4 is the one to lean on. The About section already says *"I design leakage-safe evaluations and report honest results, including the negative ones."* This page is the receipt for that line. Most portfolio data pages hide their limitations. Showing them is the differentiator.

Number 1 is the engineering flex. Number 2 is what a recruiter remembers.

---

## 2. Design read

Reading this as: a developer/scientist project page for hiring managers and bioinformatics peers, with a scientific dark-tech language, matching the main page's dark-to-light device, built on Tailwind v4 + Motion + hand-rolled Canvas.

**Dials:** `DESIGN_VARIANCE 6` · `MOTION_INTENSITY 5` · `VISUAL_DENSITY 5`

Density is one notch above the portfolio default. This is a data page, so tighter is correct.

**Theme.** Short dark band at the top (`#050912`, same as Hero), then light body (`#f6f8fb`, same as About). This reuses the seam device the main page already established, so the page feels like the same site. All charts sit on the light body, per the readability rule.

**Motion budget.** Keep it small. Section fade-ins on scroll, tab crossfade, chart hover feedback. No parallax, no scroll hijack. The charts are the motion. Everything honors `prefers-reduced-motion`, same as Hero and About.

---

## 3. Page structure

Route: `/projects/sc-covid` (static, no SSR).

```
[dark band]  breadcrumb + title + one-line finding
[light]      stat row: 100,000 cells · 2,680 donors · 21 cell types · 24,000 plotted
[light]      tabs:  Overview  |  Method  |  Caveats
               Overview -> the two charts + short plain-English framing
               Method   -> how it was done, text only
               Caveats  -> the four limitations, text only
```

Tabs are how we layer the two audiences. Overview is plain English for recruiters. Method and Caveats hold the technical depth for peers. Nobody has to scroll past what they do not care about.

Only Overview has charts. Method and Caveats are short prose, so they cost almost nothing to build.

**Mobile.** Tabs become a horizontally scrollable strip. Charts go full width and the cell type list moves below the plot.

---

## 4. Chart 1: the interactive UMAP

A scatter of 24,000 cells. Each dot is one cell. Position comes from the analysis and never changes.

**The problem to solve first.** There are 21 cell types. Good practice caps categorical colors at about 8. Past that, colors stop being tellable apart, especially for colorblind readers. The original PNG uses 21 colors and is genuinely hard to read. We should not copy it.

**The fix: three view modes, one dropdown.**

| View | What it shows | Color approach |
|---|---|---|
| **Condition** (default) | COVID vs healthy | 2 colors. Clean and readable. |
| **Cell type** | One type at a time | Everything gray, the picked type lights up. |
| **Marker gene** | CD14 / MKI67 / IGHG1 | One blue ramp, light to dark. |

The Cell type view is the key idea. Instead of 21 colors fighting each other, the user picks a type from a list and it lights up against a gray background. It reads instantly, it is colorblind-safe, and it is more useful than the static PNG. This is a deliberate upgrade over the original figure, and worth saying so on the page.

Marker view uses `vmax_p99` from `summary.json` as the color ceiling, so it matches the original figures.

**Tech.** Canvas 2D, no library. 24,000 points is small for canvas. Draw the full set once into an offscreen canvas per view, then blit. For hover, bucket points into a grid and look up the nearest one. No chart dependency is needed, which keeps the bundle light.

**Hover tooltip.** Cell type (full name), condition, and the three marker values.

**Aspect.** Data spans about 23 wide by 20 tall, so a near-square plot. Roughly 1:1, capped by height on desktop.

---

## 5. Chart 2: the fold change bars

Horizontal bars, 21 rows, centered on a zero line. Left means depleted in COVID, right means expanded.

**Scale: log2 of fold change.** Raw fold change runs from 0.03 to 12.94. On a linear axis, everything below 1 squashes into nothing. log2 puts them on fair footing: +3.7 at the top, -5.1 at the bottom.

**Color.** Same two condition colors from chart 1. Bars pointing right use the COVID color, bars pointing left use the healthy color. One color system across the whole page.

**Name shortening.** The real labels are unusable. "naive thymus-derived CD4-positive, alpha-beta T cell" will not fit. We need a display-name map, roughly:

| Full name | Short label |
|---|---|
| naive thymus-derived CD4-positive, alpha-beta T cell | naive CD4 T |
| CD16-positive, CD56-dim natural killer cell, human | CD16+ NK |
| CD14-positive, CD16-negative classical monocyte | classical mono (CD14+CD16-) |

Full name stays in the tooltip. This map is a small task but it must be done by hand and checked, so it gets its own step.

**Emphasis.** Direct-label only the extremes (top 3 expanded, top 3 depleted). The rest get labels on hover. Otherwise 21 numbers on screen is noise.

**Plasmablast note.** It is rare and folded into "Other", but it expands about 10x. That is one of the better bits of the story. Show it as a single callout line under the chart, not as a bar.

---

## 6. Colors (validated, not guessed)

Ran the palette validator against the site's light background `#f6f8fb`:

| Role | Hex | Note |
|---|---|---|
| Healthy / normal | `#2a78d6` | site blue, stays the anchor |
| COVID-19 | `#eb6834` | orange |
| De-emphasis gray | `#c3c2b7` | for the Cell type view |
| Marker ramp | blue `#cde2fb` to `#0d366b` | single hue, light to dark |

Result: all checks pass. Colorblind separation is ΔE 24.7 against a target of 8, so this pair is safe with a lot of margin.

Why orange and not red for COVID: blue against orange is the most reliably distinguishable pair, and it avoids the alarm-red cliché. The original analysis used red `#E63946`, which we are deliberately changing to fit the site and to pass the check.

No purple anywhere, per the site rule.

---

## 7. Projects card on the main page

New `Projects` section on the main page, light theme, `id="projects"`. The Hero already links to `#projects`, so this fixes a dead anchor.

**One project means one card, not a three-column grid.** A 3-col grid with two empty slots looks broken. Build a single wide feature card now: a still image of the UMAP on one side, title, the one-line finding, and small tags (`Python`, `scanpy`, `single-cell`, `Next.js`) on the other. When project two arrives, the layout changes to a real grid.

The card links through to `/projects/sc-covid`.

---

## 8. Data loading

`umap_points.json` is 2.6 MB. Two things to handle:

1. **Move it to `public/data/sc-covid/`** and fetch it on the client. Do not import it as a module, or it gets bundled into the JS. Show a skeleton in the chart area while it loads.
2. **It is currently untracked in git.** It has to be committed for a deploy to work. Worth confirming that is fine.

The small files (`summary.json`, `celltype_proportions.json`) are a few KB and can be imported directly.

If the 2.6 MB feels slow after we measure it, the fallback is packing coordinates into a binary `Float32Array`, which should get it near 500 KB. Do not do this up front. Measure first.

---

## 9. Build order

One chunk at a time, review after each.

| # | Chunk | Output |
|---|---|---|
| 1 | Route, dark-to-light shell, stat row, tab skeleton | Page exists, no charts yet |
| 2 | Data loading + display-name map | Data on screen, unstyled proof |
| 3 | UMAP canvas, Condition view only | The main flex, working |
| 4 | UMAP: Cell type and Marker views | Full chart |
| 5 | Fold change bar chart | Second chart |
| 6 | Method + Caveats tab copy | Page complete |
| 7 | Projects section + card on main page | Link wired up |
commit through the steps. edit git ignore by needs

Polish saved for later, not in the first pass:

- Cross-chart linking (hover a bar, the cell type lights up in the UMAP)
- Dark mode for the charts
- Binary data packing
- A table view of the bar chart data, for accessibility

---

## 10. Open questions

1. **Copy language.** The docs are Korean, the site is English. Assuming English page copy. Say if you want both.
2. **Committing the 2.6 MB data file.** Fine, or should we shrink it first?
3. **Link to the source repo.** Put a visible link to `ssolh2906/sc-covid` on the page, or leave it off?

None of these block chunk 1.
