# Hero Redesign Plan — DNA → Circuit Helix (Light Theme)

Decided 2026-08-20. This is the creative + technical brief for the hero replacement: generated image → looping video → animated WebP, scroll-reactive. Companion file: `docs/color-reference.md` (full current palette).

## Decisions locked in

| Question | Decision |
|---|---|
| Tone/color strategy | **Unified light theme.** No full-viewport dark hero block. "Darkness" is carried entirely by the generated visual's own content, not the section background. |
| Hero concept | **DNA → Circuit Helix.** A bioluminescent DNA double helix that resolves mid-strand into a circuit-board / neural-net lattice. Literal read of the site's own line: *"I teach machines to read biology."* |
| Pipeline | AI image generation → AI image-to-video → local WebP/scroll build (this session handles the last step once footage exists). |

Current code has **not** been changed yet — `Hero.tsx` still has the `#050912` dark section, scrim, and circuit-grid overlay from the old plan. Treat this doc as the target state; implementation starts once you bring back a chosen image (and later, video).

## 1. Updated color plan for the light-unified hero

| Token | Old (dark-hero plan) | New (light-unified plan) |
|---|---|---|
| Hero section bg | `#050912` | `#f6f8fb` (same as body — no seam needed) |
| Hero scrim / radial glow | `linear-gradient(...#050912...)`, `rgba(56,124,255,0.30)` | Drop the dark scrim entirely; optional very light accent glow `rgba(56,124,255,0.08)` behind the helix only |
| Circuit-grid overlay | `rgba(96,165,250,0.7)` @ 7% opacity on black | Retire as a page-background layer — the "circuit" idea now lives inside the generated image itself |
| Hero headline text | `white` / `white/70` | `slate-900` / `slate-600` (match About's type color) |
| Nav glass (currently dark-glass variant) | `bg-white/[0.06]` `border-white/10`, shadow `rgba(0,0,0,0.35)` | Switch to the light-glass recipe already used in About/Projects cards: `bg-white/70` `border-slate-200/80`, inset `rgba(255,255,255,0.7)` |
| Secondary CTA ("Get in touch") | `border-white/20` outline, `hover:bg-white/5` | `border-slate-300` outline, `hover:bg-slate-50`, `text-slate-900` |
| Primary CTA ("View projects") | `bg-blue-500` / hover `blue-400` | Unchanged — works on light or dark |
| Accent blue | `blue-400`/`500`/`600` | Unchanged |

Data-viz chart colors (`#2a78d6`, `#eb6834`, sequential ramp) are untouched by any of this — see `color-reference.md` section 2.

## 2. Art direction for the helix visual

- **Palette to request from the image tool**: blue family only — primary `#2a78d6`, brighter accent near `#3987e5`/`#60a5fa`, deep shadow blue `#0d366b` for depth. **No purple** (house rule, carried over from `CLAUDE.md`). Background must render as light/near-white or fully transparent so it drops into the unified light theme without a color seam.
- **Composition**: helix runs diagonally or vertically, weighted toward the right ~55–60% of the frame. Reserve clean negative space on the left ~40–45% — that's where the existing `lg:col-span-7` headline/CTA block sits in `Hero.tsx`. Don't center the subject.
- **Style**: bioluminescent line-art / glass-wireframe render — thin glowing strands with soft bloom, not a filled photorealistic render, not a sci-fi movie-poster treatment. Should read closer to premium data-product hero art (think: genomics/AI SaaS site) than concept art.
- **The transition point**: somewhere along the strand, base-pair rungs stop looking organic and start looking like PCB traces / small glowing neural-net nodes-and-edges. This is the single most important detail — it's the whole "machines reading biology" idea in one image. Keep it to one clear transition, not a muddled mix throughout.
- **Negative constraints**: no text/typography baked into the image, no purple/magenta, no dark vignette or black background, no human figures, no DNA-helix clichés with a green Matrix-code look (overused, reads generic rather than "bio").

## 3. Ready-to-paste prompts

**Midjourney** (v7-style flags, adjust `--ar`/`--v` to whatever's current when you generate):

```
bioluminescent DNA double helix dissolving into a glowing circuit-board and neural network lattice, thin luminous strands, soft blue bloom, gradient from organic to technological along the strand, floating on a clean near-white background, premium data-product hero illustration, asymmetric composition weighted right, generous negative space on the left, wireframe glass aesthetic, color palette deep blue #0d366b to bright accent blue #3987e5, no purple, no text, minimalist, high detail on the transition point, editorial tech illustration --ar 16:9 --style raw
```

**FLUX** (via Freepik / fal.ai / your preferred front-end — FLUX tends to want more literal, less "vibe-word" prompts):

```
A bioluminescent DNA double helix that transforms midway into a circuit-board and neural-network lattice of glowing nodes and connecting lines. Thin glowing blue strands (#2a78d6, #3987e5, #0d366b), soft bloom, floating against a clean near-white / transparent background. Asymmetric composition, subject occupies the right 55% of frame, left side kept empty. Wireframe / glass-render style, not photorealistic. No text, no purple or magenta tones, no dark background.
```

Generate 4–6 variants, pick the strongest transition point and best negative-space composition — don't settle for the first pass.

## 4. Video (image-to-video) direction

**Recommended tools**: Runway (latest Gen-4.x) as the primary pick — best hands-on motion control and inpainting/extend tools if a clip needs cleanup. Kling as the alternative, particularly if Runway's output feels too "camera-move-y" — Kling tends to read as more fluid/organic for glow and particle-style motion, which suits a bioluminescent subject. FLUX-generated stills feed into either fine. (Landscape check: as of this search the major names in image-to-video are still Runway, Kling, Luma, Pika, plus Sora/Veo for text-to-video — worth a quick current-pricing check before committing, this space moves fast.)

**Motion brief**:
- Slow continuous rotation of the helix on its own axis, or a slow drift/pulse — no camera pans, no cuts, no zoom.
- 4–6 second source clip, designed to loop (`Hero.tsx`'s `<video>` already has `loop` set).
- A subtle "breathing" glow pulse right at the DNA→circuit transition point ties the concept together in motion, not just in the still.
- **Looping**: either use the tool's native loop/seamless-loop mode if it has one, or generate a few extra seconds of buffer so the first and last frames can be cross-faded in post (I can do that cross-fade locally with ffmpeg once you send the raw clip).

## 5. WebP + scroll pipeline (handled locally once footage exists)

Once you have the video file, send it back and I'll do this in the workspace here — no external tool needed:

1. `ffmpeg` extracts frames / trims to a clean loop point.
2. `cwebp` / `img2webp` builds a lightweight animated WebP as the primary asset (smaller than `.mp4`, autoplay-safe on mobile without the video-element quirks).
3. `Hero.tsx` already wires `useScroll` + `useTransform` into a `parallaxY` on the media layer — the new asset drops into that same slot, so the existing scroll-parallax carries over for free.
4. Optional stretch goal: extract N frames as a sprite sequence and map `scrollYProgress` to frame index on a `<canvas>` (Apple-product-page style scroll-scrubbing) instead of a simple parallax offset — worth doing only if the looping animation alone feels too passive once it's live.

## 6. Next steps

1. Generate 4–6 helix variants in Midjourney and/or FLUX using section 3's prompts.
2. Pick the strongest one and send it back here — I'll sanity-check contrast/legibility against the light body before you spend video-gen credits on it.
3. Feed the approved still into Runway or Kling per section 4.
4. Send the resulting clip back — I'll build the WebP, wire it into `Hero.tsx`, and update the color tokens per section 1.
5. Once implemented, `CLAUDE.md`'s "Design direction" section gets rewritten to match the shipped state (it currently still describes the dark-hero plan, now marked as superseded — see the note added there).
