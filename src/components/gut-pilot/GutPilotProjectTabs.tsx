"use client";

import { useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import GutPilotEmbed from "./GutPilotEmbed";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "method", label: "Method" },
  { id: "caveats", label: "Caveats" },
] as const;
type TabId = (typeof TABS)[number]["id"];

export default function GutPilotProjectTabs() {
  const [active, setActive] = useState<TabId>("overview");
  const reduceMotion = useReducedMotion();
  const baseId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const current = TABS.findIndex((t) => t.id === active);
    let next = current;
    if (e.key === "ArrowRight") next = (current + 1) % TABS.length;
    else if (e.key === "ArrowLeft") next = (current - 1 + TABS.length) % TABS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = TABS.length - 1;
    else return;
    e.preventDefault();
    setActive(TABS[next].id);
    tabRefs.current[next]?.focus();
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label="Project sections"
        onKeyDown={onKeyDown}
        className="-mx-6 flex gap-1 overflow-x-auto px-6 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {TABS.map((tab, i) => {
          const selected = tab.id === active;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              role="tab"
              id={`${baseId}-tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${tab.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(tab.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                selected ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={active}
          id={`${baseId}-panel-${active}`}
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-${active}`}
          initial={reduceMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -6 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6"
        >
          {active === "overview" && <GutPilotEmbed />}
          {active === "method" && <MethodPanel />}
          {active === "caveats" && <CaveatsPanel />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function MethodPanel() {
  return (
    <div className="flex max-w-[68ch] flex-col gap-4 text-sm leading-relaxed text-slate-600">
      <p>
        gut-pilot runs a 3-layer pipeline over a real 16S rRNA count table: <b className="text-slate-900">Compute</b>{" "}
        (pure Python — pandas/numpy/scipy/scikit-bio, no LLM) produces every number; <b className="text-slate-900">Reasoning</b>{" "}
        (Claude, via the Anthropic SDK&rsquo;s tool-calling loop) selects and explains, never inventing a number Compute
        didn&rsquo;t hand it; <b className="text-slate-900">Evidence</b> supplies the thresholds and citations behind
        each choice, either from a curated table or a live literature search (Paperclip).
      </p>
      <p>
        Ten decision points (&ldquo;gates&rdquo;) sit across eight pages — Upload, Design, Raw QC, Normalize, Alpha,
        Beta, Differential, Summary — each one a point where the pipeline can&rsquo;t proceed on the model&rsquo;s
        judgement alone. The reviewer proposes an option with a citation-backed rationale; a human confirms or
        overrides it. Every decision, human or AI, lands in the Decision Log on the right.
      </p>
      <p>
        This page is a <b className="text-slate-900">fixed demo</b>: both datasets below were run once through the
        real backend (real ingestion, real statistics, real Claude calls) and the full output was captured as static
        JSON — nothing here is live or synthetic. Switching datasets swaps which captured run is on screen; nothing is
        recomputed in your browser.
      </p>
      <p className="text-xs text-slate-400">
        Source:{" "}
        <a
          href="https://github.com/ssolh2906/gut-pilot"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-slate-600"
        >
          github.com/ssolh2906/gut-pilot
        </a>
        . Built at GXL Hackathon 2026 with Alexander Schubert and Darren He.
      </p>
    </div>
  );
}

function CaveatsPanel() {
  const items = [
    {
      title: "This is a fixed demo, not a live app.",
      body: "gut-pilot's own hosted app isn't in a shareable state yet, so there's no “try the real app” link on this page — only the two captured runs below and the source on GitHub.",
    },
    {
      title: "The chat is real UI, not a real backend.",
      body: "The “Ask the reviewer” launcher is kept because it's one of the source app's two headline features (alongside the Decision Log), but there's no live model behind it here — opening it explains what it does in the real app instead of answering a question.",
    },
    {
      title: "One bug fixed, one left as a known gap.",
      body: "While building this demo, I found and fixed a real bug in gut-pilot's normalization gate (its “recommended” badge was hardcoded regardless of the reviewer's actual reasoning — visible on the Parkinson's dataset's Normalize step, where a naive default would have wrongly recommended rarefaction despite losing 94% of samples). A related gap — the rarefaction depth default isn't yet dataset-aware — is left as a documented TODO in the source repo rather than fixed here.",
    },
    {
      title: "The known-taxa cross-check is CRC-specific.",
      body: "gut-pilot's literature cross-check table was curated for colorectal cancer. Running it against the Parkinson's dataset correctly shows those CRC markers as “not detected” — that's the tool being honest about a reference table that doesn't cover this disease yet, not a bug.",
    },
    {
      title: "Desktop only.",
      body: "The embedded pipeline is a dense, 8-tab data app — it wasn't worth a cramped mobile layout for a fixed demo, so it's gated to larger screens.",
    },
  ];
  return (
    <ul className="flex max-w-[68ch] flex-col gap-4">
      {items.map((it) => (
        <li key={it.title} className="text-sm leading-relaxed text-slate-600">
          <b className="text-slate-900">{it.title}</b> {it.body}
        </li>
      ))}
    </ul>
  );
}
