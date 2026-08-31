import type { Metadata } from "next";
import Link from "next/link";

import ProjectTabs from "@/components/sc-covid/ProjectTabs";
import GitHubIcon from "@/components/icons/GitHubIcon";
import { STATS } from "@/lib/sc-covid";

export const metadata: Metadata = {
  title: "COVID-19 in 100,000 blood cells - Solhee Tucker",
  description:
    "An interactive single-cell RNA-seq analysis of COVID-19 and healthy blood, built from CELLxGENE Census data.",
};

export default function ScCovidPage() {
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
        {/* denim-50 bleeding into the slightly cooler body, same device as the About section */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-linear-to-b from-denim-50 to-slate-50 sm:h-20 md:h-24"
        />

        <div className="relative mx-auto max-w-7xl px-6 pb-28 pt-14 sm:px-8 sm:pt-16 md:pb-36 lg:px-12">
          <div className="max-w-3xl">
            <h1 className="text-balance text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Reading COVID-19 in 100,000 blood cells
            </h1>
            <p className="mt-6 max-w-[52ch] text-base leading-relaxed text-slate-600 sm:text-lg">
              In COVID-19 blood, activated effector cells expand and the
              resting naive and memory pool drains out. I mapped 100,000
              blood cells to show it.
            </p>
            <a
              href="https://github.com/ssolh2906/sc-covid"
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
                  <span className="block text-3xl font-semibold tracking-tight text-slate-900">
                    {stat.value}
                  </span>
                  <span className="mt-1 block text-sm font-medium text-slate-700">
                    {stat.label}
                  </span>
                  <span className="mt-2 block text-xs leading-relaxed text-slate-500">
                    {stat.detail}
                  </span>
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-16 sm:mt-20">
            <ProjectTabs />
          </div>
        </div>
      </section>
    </main>
  );
}
