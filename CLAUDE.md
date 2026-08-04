# Portfolio — Project Guide

## Workflow
- Do NOT launch headless browsers or take automated screenshots to self-verify.
  The human runs `npm run dev` and reviews in their own browser.

## Context
Personal portfolio for a developer in the microbiome / bio-data space
(Android background, now building AI-assisted microbiome analysis tools).
Graph- and data-heavy. Should feel techy, scientific, atmospheric — not templated.

## Direction (constraints, not final values — let the design skill choose specifics)
- **Dark atmospheric HERO → light, readable BODY.**
  Hero: cinematic deep-navy, atmospheric haze, circuit/grid depth; holds a looping
  bio/DNA video later (poster image until then).
  Body: light theme for data legibility.
- Accent: **blue** family (teal ok as secondary). **No purple.**
- Signature effect: **liquid glass** (frosted translucent panels).
- Asymmetric, grid-based, generous whitespace. No centered-hero cliché.

## Data-viz rule (this portfolio is graph-heavy)
- Charts live on the light theme; readability over decoration.
- Gradients are for the FRAME (hero, cards), not for chart data itself.
- Keep axes/legends high-contrast (WCAG AA).

## Stack
- Next.js (App Router) + TypeScript + Tailwind + Framer Motion.
- Keep static-export friendly (no SSR needed).
- Verify 3rd-party libs in package.json before importing.

## Build order
Hero → About → Projects (charts) → Skills/Experience → Contact.
One section at a time.