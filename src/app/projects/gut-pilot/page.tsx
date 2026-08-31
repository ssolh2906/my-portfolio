import type { Metadata } from "next";
import Link from "next/link";

import GutPilotProjectTabs from "@/components/gut-pilot/GutPilotProjectTabs";
import GitHubIcon from "@/components/icons/GitHubIcon";

export const metadata: Metadata = {
  title: "Gut Pilot: an AI reviewer for microbiome analysis - Solhee Tucker",
  description:
    "A 10-gate, human-in-the-loop pipeline that reviews microbiome analysis decisions against the literature. Fixed demo on two real datasets.",
};

const STATS = [
  { value: "10", label: "Reviewer gates", detail: "Points where the pipeline can't proceed on the model's judgement alone" },
  { value: "3", label: "Layers", detail: "Compute, Reasoning, and Evidence, kept strictly separate" },
  { value: "2", label: "Real datasets", detail: "Colorectal cancer and Parkinson's disease, run through the real backend" },
  { value: "638", label: "Samples analyzed", detail: "490 + 148 samples across both captured runs" },
];

export default function GutPilotPage() {
  return (
    <main className="flex-1">
      <section className="relative bg-denim-50">
        <div className="relative mx-auto w-full max-w-7xl px-6 py-5 sm:px-8 lg:px-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors duration-300 hover:text-denim-600"
          >
            <span aria-hidden>&larr;</span> Solhee Tucker
          </Link>
        </div>
      </section>

      <section className="relative bg-slate-50">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-linear-to-b from-denim-50 to-slate-50 sm:h-20 md:h-24"
        />

        <div className="relative mx-auto max-w-7xl px-6 pb-28 pt-14 sm:px-8 sm:pt-16 md:pb-36 lg:px-12">
          <div className="max-w-3xl">
            <span className="text-xs font-medium tracking-wide text-slate-500 uppercase">AI agent · Bioinformatics</span>
            <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Gut Pilot: an AI reviewer for microbiome analysis
            </h1>
            <p className="mt-6 max-w-[58ch] text-base leading-relaxed text-slate-600 sm:text-lg">
              An AI agent proposes every methodological call in a microbiome analysis: normalization, distance
              metric, significance level. Each one comes with a citation. I review it, confirm or override, and it
              lands in an audit trail.
            </p>
            <a
              href="https://github.com/ssolh2906/gut-pilot"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/60 px-5 py-2.5 text-sm font-medium text-slate-700 backdrop-blur-sm transition-colors duration-300 hover:border-denim-300 hover:bg-white"
            >
              <GitHubIcon />
              View source on GitHub
            </a>
          </div>

          <dl className="mt-16 grid grid-cols-1 divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-md sm:mt-20 sm:grid-cols-2 lg:grid-cols-4 lg:divide-y-0 lg:divide-x">
            {STATS.map((stat) => (
              <div key={stat.label} className="px-6 py-6">
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <span className="block text-3xl font-semibold tracking-tight text-slate-900">{stat.value}</span>
                  <span className="mt-1 block text-sm font-medium text-slate-700">{stat.label}</span>
                  <span className="mt-2 block text-xs leading-relaxed text-slate-500">{stat.detail}</span>
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-16 sm:mt-20">
            <GutPilotProjectTabs />
          </div>
        </div>
      </section>
    </main>
  );
}
