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
        A 3-layer pipeline over a real 16S rRNA count table: <b className="text-slate-900">Compute</b> (pandas/numpy/scipy/scikit-bio)
        produces every number, <b className="text-slate-900">Reasoning</b> (Claude) selects and explains without
        inventing numbers, and <b className="text-slate-900">Evidence</b> supplies the citations behind each choice.
        Ten decision gates sit across the eight pages above — the reviewer proposes an option with a rationale, a
        human confirms or overrides it, and every decision lands in the Decision Log.
      </p>
      <p>
        This page is a <b className="text-slate-900">fixed demo</b>: both datasets were run once through the real
        backend and the output captured as static JSON — nothing is live or recomputed in your browser.
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
