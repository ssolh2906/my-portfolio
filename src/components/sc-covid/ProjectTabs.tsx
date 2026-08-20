"use client";

import { useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { useUmapPoints } from "@/hooks/useUmapPoints";
import { shortCellTypeLabel } from "@/lib/sc-covid";

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
            {active === "method" && <Placeholder label="Method" />}
            {active === "caveats" && <Placeholder label="Caveats" />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function OverviewPanel() {
  const umap = useUmapPoints();

  // Temporary proof that the fetch + label map work end to end.
  // Replaced by the real canvas chart in the next chunk.
  const preview = useMemo(() => {
    if (umap.status !== "loaded") return null;
    const counts = new Map<string, number>();
    for (const p of umap.points) counts.set(p.ct, (counts.get(p.ct) ?? 0) + 1);
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([ct, count]) => ({ label: shortCellTypeLabel(ct), count }));
  }, [umap]);

  return (
    <div className="grid gap-10">
      <p className="max-w-[62ch] text-lg leading-relaxed text-slate-600">
        Every dot below is one blood cell. Cells that behave alike sit near each
        other, so the clusters are immune cell populations. Comparing COVID-19
        blood against healthy blood shows which populations grow and which ones
        empty out.
      </p>

      <div className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white/50 p-8 text-sm text-slate-500">
        {umap.status === "loading" && <span>Loading {"~24,000"} cells...</span>}
        {umap.status === "error" && (
          <span className="text-rose-600">Could not load the cell data.</span>
        )}
        {umap.status === "loaded" && (
          <>
            <span className="text-slate-400">
              {umap.points.length.toLocaleString("en-US")} cells loaded. Top 5
              types (unstyled, chart lands next chunk):
            </span>
            <ul className="text-slate-700">
              {preview?.map((row) => (
                <li key={row.label}>
                  {row.label} - {row.count.toLocaleString("en-US")}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <Placeholder label="Which populations changed" />
    </div>
  );
}

function Placeholder({ label }: { label: string }) {
  return (
    <div className="flex min-h-56 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/50 p-8">
      <p className="text-sm text-slate-400">{label} lands in a later chunk.</p>
    </div>
  );
}
