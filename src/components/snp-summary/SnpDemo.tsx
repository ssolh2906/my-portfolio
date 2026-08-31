"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import {
  EXAMPLE_RS_IDS,
  getVariant,
  pubmedUrl,
  sourceLinks,
} from "@/lib/snp-summary";

const LIVE_APP_URL = "https://huggingface.co/spaces/ssol2906/snp-summary";
const REPO_URL = "https://github.com/ssolh2906/BIBI_Bioinformatics_hackathon";

export default function SnpDemo() {
  const [rsId, setRsId] = useState(EXAMPLE_RS_IDS[0]);
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const reduceMotion = useReducedMotion();

  const variant = getVariant(rsId);
  if (!variant) return null;

  function selectExample(id: string) {
    setRsId(id);
    setStatus("idle");
  }

  function runDemo() {
    setStatus("loading");
    window.setTimeout(() => setStatus("done"), 700);
  }

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white/70 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-md sm:p-8">
      {/* demo framing: say what this is before anything else */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold tracking-wide text-blue-700 uppercase">
          Fixed demo
        </span>
        <p className="text-sm text-slate-500">
          Precomputed output for two example variants. No live API calls on
          this page.{" "}
          <a
            href={LIVE_APP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-blue-600 underline underline-offset-2 hover:text-blue-700"
          >
            Try any rs ID in the real app ↗
          </a>
        </p>
      </div>

      <p className="mt-6 text-sm font-medium text-slate-700">
        Get a summary of a SNP given its rs ID
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={rsId}
          disabled
          aria-label="rs ID (fixed to the two examples below)"
          className="w-40 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 disabled:cursor-not-allowed"
        />
        <div className="flex gap-2">
          {EXAMPLE_RS_IDS.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => selectExample(id)}
              aria-pressed={id === rsId}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                id === rsId
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900"
              }`}
            >
              {id}
            </button>
          ))}
        </div>
      </div>

      {/* real, working deep links — these don't depend on the demo's fixed output */}
      <div className="mt-5">
        <p className="text-xs font-medium tracking-wide text-slate-500">
          Shortcut links to the original record
        </p>
        <div className="mt-2 grid grid-cols-3 gap-2 sm:max-w-md">
          {sourceLinks(rsId).map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-slate-200 px-3 py-2 text-center text-sm font-medium text-slate-700 transition-colors duration-200 hover:border-blue-300 hover:text-blue-700"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <motion.button
          type="button"
          onClick={runDemo}
          disabled={status === "loading"}
          animate={
            status === "idle" && !reduceMotion
              ? { scale: [1, 1.02, 1] }
              : { scale: 1 }
          }
          transition={{ duration: 1.8, repeat: status === "idle" ? Infinity : 0 }}
          className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-blue-700 disabled:opacity-70"
        >
          {status === "loading"
            ? "Fetching SNP summary…"
            : "Click to see the summary →"}
        </motion.button>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {status === "done" && (
          <motion.div
            key={rsId}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 border-t border-slate-100 pt-8"
          >
            <p className="leading-relaxed text-slate-700">{variant.summary}</p>

            <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 rounded-2xl border border-slate-200/80 bg-white p-5 sm:grid-cols-3">
              <Fact label="Gene" value={`${variant.gene.symbol}`} />
              <Fact label="Chromosome" value={variant.location.chromosome} />
              <Fact
                label="GRCh38 position"
                value={variant.location.grch38Position.toLocaleString("en-US")}
              />
              <Fact label="Alleles" value={variant.location.alleles} />
              <Fact
                label="Clinical significance"
                value={
                  variant.clinicalSignificance.length > 0
                    ? variant.clinicalSignificance.join(", ")
                    : "Not classified"
                }
              />
              <Fact
                label="Allele frequency"
                value={variant.alleleFrequency.headline}
              />
            </dl>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              {variant.clinicalSignificanceNote}
            </p>

            <p className="mt-6 text-xs font-medium tracking-wide text-slate-500 uppercase">
              Cited in the literature
            </p>
            <ul className="mt-3 grid gap-2">
              {variant.citations.map((c) => (
                <li key={c.pmid}>
                  <a
                    href={pubmedUrl(c.pmid)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start justify-between gap-4 rounded-xl border border-slate-200 px-4 py-3 transition-colors duration-200 hover:border-blue-300 hover:bg-blue-50/40"
                  >
                    <span>
                      <span className="block text-sm font-medium text-slate-900">
                        {c.title}
                      </span>
                      <span className="mt-1 block text-xs text-slate-500">
                        {c.journal} · {c.year} · PMID {c.pmid}
                      </span>
                      {c.note && (
                        <span className="mt-1 block text-xs text-slate-400 italic">
                          {c.note}
                        </span>
                      )}
                    </span>
                    <span
                      aria-hidden
                      className="mt-0.5 shrink-0 text-slate-400 transition-colors duration-200 group-hover:text-blue-600"
                    >
                      ↗
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            <p className="mt-6 text-xs text-slate-400">
              Data sources: {variant.dataSources.join(", ")}. Full pipeline:{" "}
              <a
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-slate-600"
              >
                GitHub
              </a>{" "}
              ·{" "}
              <a
                href={LIVE_APP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-slate-600"
              >
                Live app
              </a>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-slate-900">{value}</dd>
    </div>
  );
}
