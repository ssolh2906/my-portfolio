import type { Metadata } from "next";
import Link from "next/link";

import ProjectTabs from "@/components/snp-summary/ProjectTabs";
import GitHubIcon from "@/components/icons/GitHubIcon";

export const metadata: Metadata = {
  title: "SNP summary - Solhee Tucker",
  description:
    "Turning an rs ID into a bioinformatics-ready summary, grounded in real NCBI, Ensembl, and PubMed data.",
};

export default function SnpSummaryPage() {
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
            <h1 className="text-balance text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Turning an rs ID into a bioinformatics summary
            </h1>
            <p className="mt-6 max-w-[52ch] text-base leading-relaxed text-slate-600 sm:text-lg">
              Give it an rs ID. It pulls NCBI and Ensembl data, then writes a
              summary grounded in real PubMed citations instead of whatever
              Gemini remembers.
            </p>
            <a
              href="https://github.com/ssolh2906/BIBI_Bioinformatics_hackathon"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/60 px-5 py-2.5 text-sm font-medium text-slate-700 backdrop-blur-sm transition-colors duration-300 hover:border-denim-300 hover:bg-white"
            >
              <GitHubIcon />
              View source on GitHub
            </a>
          </div>

          <div className="mt-16 sm:mt-20">
            <ProjectTabs />
          </div>
        </div>
      </section>
    </main>
  );
}
