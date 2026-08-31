"use client";

import { useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import CellMap from "@/components/sc-covid/CellMap";
import FoldChangeChart from "@/components/sc-covid/FoldChangeChart";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "method", label: "Method" },
  { id: "caveats", label: "Caveats" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function ProjectTabs() {
  const [active, setActive] = useState<TabId>("overview");
  const reduceMotion = useReducedMotion();
  const baseId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Roving focus: arrow keys move between tabs, Home/End jump to the ends.
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
              className={`relative shrink-0 rounded-full px-5 py-2.5 text-sm font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
                selected
                  ? "text-slate-900"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {selected && (
                <motion.span
                  layoutId={reduceMotion ? undefined : `${baseId}-pill`}
                  aria-hidden
                  className="absolute inset-0 rounded-full border border-slate-200/80 bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_1px_2px_rgba(15,23,42,0.06)]"
                  transition={{ type: "spring", stiffness: 320, damping: 30 }}
                />
              )}
              <span className="relative">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-10">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active}
            role="tabpanel"
            id={`${baseId}-panel-${active}`}
            aria-labelledby={`${baseId}-tab-${active}`}
            tabIndex={0}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
          >
            {active === "overview" && <OverviewPanel />}
            {active === "method" && <MethodPanel />}
            {active === "caveats" && <CaveatsPanel />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function OverviewPanel() {
  return (
    <div className="grid gap-10">
      <p className="max-w-[62ch] text-lg leading-relaxed text-slate-600">
        Every dot below is one blood cell. Cells that behave alike sit near each
        other, so the clusters are immune cell populations. Comparing COVID-19
        blood against healthy blood shows which populations grow and which ones
        empty out.
      </p>

      <CellMap />

      <div className="mt-6">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
          Which populations changed
        </h2>
        <p className="mt-4 max-w-[62ch] leading-relaxed text-slate-600">
          Each bar compares how common a cell type is in COVID-19 blood against
          healthy blood. Activated cells that fight infection sit at the top.
          The resting naive and memory cells they came from sit at the bottom.
        </p>
        <div className="mt-8">
          <FoldChangeChart />
        </div>
      </div>
    </div>
  );
}

function MethodPanel() {
  return (
    <div className="grid max-w-[68ch] gap-10">
      <Block title="Data">
        Cells come from CELLxGENE Census (stable release 2025-11-08, CC-BY 4.0),
        filtered to blood tissue with duplicates removed. From that pool, 50,000
        COVID-19 cells and 50,000 healthy cells were drawn at random in equal
        numbers (seed 42), for 100,000 total.
      </Block>

      <Block title="Approach">
        Census ships a pre-computed scVI embedding for every cell: 50
        dimensions, already corrected for sequencing batch and assay. Rather
        than running the usual raw counts to normalize to PCA pipeline, the
        UMAP here is built directly on that embedding. It is faster, and the
        batch correction is handled before this analysis ever touches the
        data, not patched in afterward.
      </Block>

      <Block title="Steps">
        Neighbors and UMAP: <code className="text-slate-700">sc.pp.neighbors</code>{" "}
        on the scVI embedding (15 neighbors), then{" "}
        <code className="text-slate-700">sc.tl.umap</code> (min_dist 0.3, seed
        42). Three marker genes, CD14, MKI67, and IGHG1, were pulled alongside
        the embedding and log1p-transformed.
      </Block>

      <Block title="Quality check">
        The embedding had no missing values across all 100,000 cells. Cells
        came from 18 different sequencing assays, but the UMAP structures by
        cell identity rather than by assay, which confirms the batch
        correction held.
      </Block>

      <Block title="Reproduce">
        Python, cellxgene-census, scanpy, numpy, pandas. Full source at{" "}
        <a
          href="https://github.com/ssolh2906/sc-covid"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline underline-offset-2 hover:text-blue-700"
        >
          ssolh2906/sc-covid
        </a>
        .
      </Block>
    </div>
  );
}

const CAVEATS = [
  {
    title: "Annotation resolution varies between datasets",
    body: "Some COVID-19 samples are labeled broadly (\"B cell\"), while healthy samples are labeled more specifically (\"naive B cell\"). That mismatch can inflate the fold change measured for the broader categories.",
  },
  {
    title: "No severity data",
    body: "COVID-19 samples are not split by mild, moderate, or severe illness, so it is possible that a smaller number of severe cases are driving the shift shown here.",
  },
  {
    title: "A snapshot, not a timeline",
    body: "This is cross-sectional data: one blood draw per donor. It can show that naive and memory cells are depleted during infection, but not whether that pool recovers afterward.",
  },
  {
    title: "Single-diagnosis cells only",
    body: "Cells with compound diagnoses, such as COVID-19 alongside diabetes, were excluded on purpose. This reflects single-diagnosis cases, not the full range of real patients.",
  },
];

function CaveatsPanel() {
  return (
    <div className="max-w-[68ch]">
      <p className="text-lg leading-relaxed text-slate-600">
        Four limits worth knowing before trusting the numbers above.
      </p>
      <ol className="mt-8 grid gap-8">
        {CAVEATS.map((c, i) => (
          <li key={c.title} className="flex gap-4">
            <span className="mt-1 shrink-0 font-mono text-sm text-slate-400 tabular-nums">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <h3 className="font-medium text-slate-900">{c.title}</h3>
              <p className="mt-1.5 leading-relaxed text-slate-600">{c.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-medium tracking-wide text-slate-900">
        {title}
      </h3>
      <p className="mt-2 leading-relaxed text-slate-600">{children}</p>
    </div>
  );
}

