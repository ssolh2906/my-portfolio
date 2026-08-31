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
          {active === "overview" && <OverviewPanel />}
          {active === "method" && <MethodPanel />}
          {active === "caveats" && <CaveatsPanel />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function OverviewPanel() {
  return (
    <div className="flex flex-col gap-6">
      <p className="max-w-[68ch] text-sm leading-relaxed text-slate-600">
        For this portfolio, I ran both datasets through the real pipeline and built this demo from the actual output.
      </p>
      <GutPilotEmbed />
    </div>
  );
}

type Gate = { id: string; stage: string; title: string; desc: string };

// The 10 reviewer gates, in run order. Titles/descriptions are the short
// form of what each gate's own SectionHeading + lede say in the pipeline
// steps above (DesignStep, QcStep, NormalizeStep, AlphaStep, BetaStep,
// DifferentialStep) — this is the same 10-gate structure, just laid out so
// it can be read at a glance instead of clicked through one page at a time.
const GATES: Gate[] = [
  { id: "G1", stage: "Design", title: "Comparison groups", desc: "Which metadata column and levels define what's being compared" },
  { id: "G2", stage: "Design", title: "Batch handling", desc: "Model batch as a covariate, stratify by it, or proceed and flag the risk" },
  { id: "G3", stage: "Design", title: "Pairing", desc: "Independent samples, or paired / repeated measures" },
  { id: "G4", stage: "Design", title: "Taxonomic rank", desc: "Which taxonomic rank the run is computed at, and how many features that gives you" },
  { id: "G5", stage: "Raw QC", title: "Depth floor", desc: "Flags under-sequenced samples against a minimum read depth (flags only, never excludes)" },
  { id: "G6", stage: "Normalize", title: "Normalization strategy", desc: "Rarefaction, CSS, or CLR. The least settled step in the pipeline" },
  { id: "G7", stage: "Normalize", title: "Rarefaction depth", desc: "The depth threshold that decides which samples get excluded" },
  { id: "G8", stage: "Alpha diversity", title: "Significance", desc: "Alpha level and multiple-testing correction for every diversity test" },
  { id: "G9", stage: "Beta diversity", title: "Distance metric", desc: "Bray-Curtis, Jaccard, or Aitchison. What \"different\" means between two samples" },
  { id: "G10", stage: "Differential abundance", title: "Prevalence filter", desc: "How many features get tested, and how strict the correction has to be" },
];

// Adjacent gates that share a stage get grouped under one stage label, in
// place of repeating it per-gate — same idea as "Study design (G1–G4)" in
// DesignStep's own heading.
const GATE_GROUPS: { stage: string; gates: Gate[] }[] = (() => {
  const groups: { stage: string; gates: Gate[] }[] = [];
  for (const gate of GATES) {
    const last = groups[groups.length - 1];
    if (last && last.stage === gate.stage) last.gates.push(gate);
    else groups.push({ stage: gate.stage, gates: [gate] });
  }
  return groups;
})();

function GatesDiagram() {
  return (
    <ol className="flex flex-col">
      {GATE_GROUPS.map((group, gi) => (
        <li key={group.stage} className="relative flex gap-4 pb-6 last:pb-0">
          {gi < GATE_GROUPS.length - 1 && (
            <span aria-hidden className="absolute top-7 left-[15px] h-full w-px bg-slate-200" />
          )}
          <div className="flex w-8 shrink-0 flex-col items-center pt-0.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-blue-200 bg-blue-50 font-mono text-[11px] font-bold text-blue-700">
              {group.gates.length > 1 ? `${group.gates[0].id}–${group.gates[group.gates.length - 1].id}` : group.gates[0].id}
            </span>
          </div>
          <div className="flex-1 pb-1">
            <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">{group.stage}</span>
            <div className="mt-2 grid gap-2.5 sm:grid-cols-2">
              {group.gates.map((gate) => (
                <div key={gate.id} className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] font-bold text-blue-700">{gate.id}</span>
                    <span className="text-sm font-medium text-slate-900">{gate.title}</span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">{gate.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

function MethodPanel() {
  return (
    <div className="flex max-w-[68ch] flex-col gap-6 text-sm leading-relaxed text-slate-600">
      <p>
        A 3-layer pipeline over a real 16S rRNA count table: <b className="text-slate-900">Compute</b> (pandas/numpy/scipy/scikit-bio)
        produces every number, <b className="text-slate-900">Reasoning</b> (Claude) selects and explains without
        inventing numbers, and <b className="text-slate-900">Evidence</b> supplies the citations behind each choice.
      </p>

      <div>
        <p className="mb-5">
          Ten decision gates sit across those pages. At each one, the reviewer proposes an option with a
          citation-backed rationale, then a human confirms or overrides it. Either way, the call lands in the
          Decision Log. Here&rsquo;s what each gate decides:
        </p>
        <GatesDiagram />
      </div>

      <p>
        This page is a <b className="text-slate-900">fixed demo</b>. Both datasets were run once through the real
        backend, and the output was captured as static JSON. Nothing is live or recomputed in your browser.
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
      body: "To keep this portfolio site light, there's no “try it live” version embedded here. Just the two captured runs above, built from real backend output, plus the full source on GitHub.",
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
