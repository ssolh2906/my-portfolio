"use client";

import { useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import SnpDemo from "@/components/snp-summary/SnpDemo";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "method", label: "Method" },
  { id: "caveats", label: "Caveats" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const REPO_URL = "https://github.com/ssolh2906/BIBI_Bioinformatics_hackathon";
const LIVE_APP_URL = "https://huggingface.co/spaces/ssol2906/snp-summary";

export default function ProjectTabs() {
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
        Enter an rs ID. The original app pulls variant data from NCBI and
        Ensembl, then asks Gemini to write a summary for bioinformaticians,
        grounded in real PubMed abstracts instead of the model&apos;s own
        recall. Below is that pipeline&apos;s real output for two example
        variants.
      </p>

      <SnpDemo />
    </div>
  );
}

function MethodPanel() {
  return (
    <div className="grid max-w-[68ch] gap-10">
      <Block title="Data">
        Variant facts come live from the NCBI Variation Services API and
        Ensembl&apos;s VEP/REST endpoints: gene, consequence, GRCh38 position,
        alleles, population frequencies, and ClinVar significance. Literature
        comes from PubMed. The rs ID is used to pull the publications dbSNP
        already links to that variant, and their abstracts (not just titles)
        are what the summary is grounded in.
      </Block>

      <Block title="Why this page is a fixed demo">
        The live app runs a Streamlit + Gemini backend that needs a server
        process and an API key, not something to expose on a static
        portfolio site. Rather than rebuild that backend as a Vercel function
        that calls paid APIs on every visitor, this page ships the same
        pipeline&apos;s real output for two rs IDs, precomputed once. The
        three source-database buttons above are still real, live links.
      </Block>

      <Block title="Grounding the citations">
        The original hackathon build asked Gemini to &quot;do deeper research&quot;
        on any citations it found. With no retrieval step, that&apos;s an
        open invitation to hallucinate a paper&apos;s findings. Here, the
        citation list is real PubMed metadata fetched directly, so every
        paper button links to an abstract that exists and mentions the
        variant.
      </Block>

      <Block title="Reproduce">
        Python, Streamlit, google-genai, NCBI/Ensembl REST, PubMed
        E-utilities. Full source at{" "}
        <a
          href={REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline underline-offset-2 hover:text-blue-700"
        >
          ssolh2906/BIBI_Bioinformatics_hackathon
        </a>
        , live app at{" "}
        <a
          href={LIVE_APP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline underline-offset-2 hover:text-blue-700"
        >
          huggingface.co/spaces/ssol2906/snp-summary
        </a>
        .
      </Block>
    </div>
  );
}

const CAVEATS = [
  {
    title: "Fixed inputs, not a live lookup",
    body: "This page only knows the two rs IDs shown above. Typing a different one does nothing here. The live app (linked above) runs the real pipeline for any rs ID.",
  },
  {
    title: "Not medical or clinical advice",
    body: "Clinical significance labels are pulled from ClinVar as-is and can be conflicting or provisional. This is a bioinformatics summary tool, not a diagnostic one.",
  },
];

function CaveatsPanel() {
  return (
    <div className="max-w-[68ch]">
      <p className="text-lg leading-relaxed text-slate-600">
        Two limits worth knowing before trusting the output above.
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
