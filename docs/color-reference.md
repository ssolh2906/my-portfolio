# Color Reference — Solhee Tucker Portfolio

Snapshot of every color code actually in use in `my-portfolio` as of 2026-08-20, before the hero redesign (dark hero video → generated hero image/video/webp). Written so a fresh session (or a design/image-gen tool prompt) has the real palette instead of guessing.

## Context / known issue

`CLAUDE.md` currently documents the seam as intentional: *"Hero is a full-viewport dark section (`#050912`)… About then paints its own top-edge gradient from `#050912` into the light body (`#f6f8fb`)."* In practice the jump from near-black to a very pale blue-gray reads as two different sites stitched together — that's the mismatch driving this redesign. Any new tone/color decision should update this file and `CLAUDE.md`'s "Design direction" section together.

## 1. Core UI palette (Hero / Nav / About / Projects)

| Token | Hex / value | Used for |
|---|---|---|
| Hero background | `#050912` | Full-viewport hero `<section>` bg, sc-covid page hero bg |
| Hero scrim gradient | `linear-gradient(to top, #050912 0%, rgba(5,9,18,0.72) 45%, rgba(5,9,18,0.18) 100%)` | Legibility layer over hero video |
| Hero radial glow | `rgba(56,124,255,0.30)` (sc-covid page uses `0.18`) | Ambient blue glow, bottom-left of hero |
| Circuit-grid lines | `rgba(96,165,250,0.7)` (≈ Tailwind `blue-400`) | 1px grid overlay, `opacity-[0.07]` on the layer |
| Body background | `#f6f8fb` | About, Projects, sc-covid page body |
| Seam gradient | `linear-gradient(to bottom, #050912 0%, #050912 10%, #f6f8fb 100%)` | Dark→light handoff strip at top of About |
| Accent blue | Tailwind `blue-400` / `blue-500` / `blue-600` | CTA button (`bg-blue-500`, hover `blue-400`), links, "About" eyebrow label, blockquote border |
| Heading text (light theme) | Tailwind `slate-900` | H1/H2 on light sections |
| Body text (light theme) | Tailwind `slate-600` / `slate-700` | Paragraphs |
| Muted text (light theme) | Tailwind `slate-400` / `slate-500` | Captions, stat labels |
| Card borders (light theme) | Tailwind `slate-200` (often `/80`) | Glass-card outlines |
| Text on dark theme | `white`, `white/70`, `white/75`, `white/90` | Hero/Nav copy |

### "Liquid glass" signature effect

| Surface | Recipe |
|---|---|
| Nav pill (on dark hero) | `bg-white/[0.06]` + `border-white/10` + `backdrop-blur-xl` + `shadow: inset 0 1px 0 rgba(255,255,255,0.16), 0 12px 40px rgba(0,0,0,0.35)` |
| About/Projects cards (on light body) | `bg-white/70` + `border-slate-200/80` + `backdrop-blur-md` + `shadow: inset 0 1px 0 rgba(255,255,255,0.7)` |

## 2. Data-viz palette (sc-covid charts) — **accessibility-validated, do not change**

Source: `CellMap.tsx` / `FoldChangeChart.tsx`, validated against the site's light background (`#f6f8fb`) for CVD (color-vision-deficiency) separation, "far above the ΔE 8 target." Treat these as locked — a new hero palette should coexist with them, not replace them.

| Role | Hex | Notes |
|---|---|---|
| Condition — normal | `#2a78d6` | Blue |
| Condition — COVID-19 | `#eb6834` | Orange |
| Emphasis accent | `#2a78d6` | Same as "normal" blue, reused intentionally |
| De-emphasis / gray-out | `#c3c2b7` | Warm gray, not a cool slate — keeps it from reading as "condition" |
| Sequential ramp (marker expression), 5 stops | `#cde2fb` → `#86b6ef` → `#3987e5` → `#1c5cab` → `#0d366b` | Piecewise-lerped blue ramp at t = 0, 0.25, 0.5, 0.75, 1 |

## 3. Unused Next.js defaults

`globals.css` still ships the untouched Next.js starter tokens — not part of the real palette, safe to delete or repurpose:

```css
--background: #ffffff;
--foreground: #171717;
```

## How to hand this off

Paste section 1 + 2 verbatim into any new session/prompt that needs to pick a new hero palette, generate hero image/video prompts, or extend the tone change sitewide. Section 2 (chart colors) should be treated as a hard constraint; section 1 (UI/hero) is exactly what's being reconsidered.
