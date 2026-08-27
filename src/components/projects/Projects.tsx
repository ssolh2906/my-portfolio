"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

import { FOLD_CHANGE_ROWS, SUMMARY, shortCellTypeLabel } from "@/lib/sc-covid";
import { VARIANTS as SNP_VARIANTS } from "@/lib/snp-summary";
import {
  SUMMARY as GE_SUMMARY,
  BEST_MODEL,
  TOP_FEATURE,
} from "@/lib/gene-expression";

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

type ProjectCardData = {
  slug: string;
  eyebrow: string;
  title: string;
  description: string;
  tags: string[];
  stat: {
    headlineValue: string;
    headlineLabel: string;
    subStats: { value: string; label: string }[];
  };
};

// Biggest COVID-19 expansion in the dataset (rows are sorted descending by
// log2 fold change), used as the card's headline stat.
const TOP_ROW = FOLD_CHANGE_ROWS[0];

const RS6311 = SNP_VARIANTS["rs6311"];
const SNP_PAPERS_CITED = Object.values(SNP_VARIANTS).reduce(
  (sum, v) => sum + v.citations.length,
  0,
);

const PROJECTS: ProjectCardData[] = [
  {
    slug: "gut-pilot",
    eyebrow: "AI agent · Bioinformatics",
    title: "Gut Pilot: an AI reviewer for microbiome analysis",
    description:
      "A 10-gate, human-in-the-loop pipeline where an AI agent proposes every analysis decision with a citation-backed rationale, and a reviewer confirms or overrides it. Fixed demo on two real datasets — colorectal cancer and Parkinson's disease.",
    tags: ["Python", "FastAPI", "Claude", "React", "16S rRNA"],
    stat: {
      headlineValue: "10",
      headlineLabel: "reviewer gates across a 3-layer pipeline",
      subStats: [
        { value: "2", label: "real datasets" },
        { value: "638", label: "samples analyzed" },
      ],
    },
  },
  {
    slug: "sc-covid",
    eyebrow: "Single-cell genomics",
    title: `Reading COVID-19 in ${SUMMARY.n_cells_total.toLocaleString("en-US")} blood cells`,
    description:
      "COVID-19 blood expands activated effector cells and drains the resting naive and memory pool. An interactive single-cell analysis, from CELLxGENE Census data to a browser-native chart.",
    tags: ["Python", "scanpy", "single-cell RNA-seq", "Next.js"],
    stat: {
      headlineValue: `${TOP_ROW.fold_change.toFixed(1)}x`,
      headlineLabel: `more ${shortCellTypeLabel(TOP_ROW.cell_type)} in COVID-19 blood`,
      subStats: [
        {
          value: SUMMARY.n_cells_total.toLocaleString("en-US"),
          label: "cells analyzed",
        },
        {
          value: SUMMARY.n_donors.toLocaleString("en-US"),
          label: "donors",
        },
      ],
    },
  },
  {
    slug: "snp-summary",
    eyebrow: "Bioinformatics · LLM summaries",
    title: "Turning an rs ID into a bioinformatics summary",
    description:
      "NCBI and Ensembl data, summarized and grounded in real PubMed citations rather than model recall. A fixed demo of a bioinformatics-hackathon pipeline.",
    tags: ["NCBI", "Ensembl", "PubMed", "Next.js"],
    stat: {
      headlineValue: String(RS6311.dbsnpCitationCount),
      headlineLabel: "studies linked to rs6311 in dbSNP",
      subStats: [
        { value: String(Object.keys(SNP_VARIANTS).length), label: "example variants" },
        { value: String(SNP_PAPERS_CITED), label: "papers cited" },
      ],
    },
  },
  {
    slug: "gene-expression",
    eyebrow: "Regulatory genomics · ML",
    title: "Predicting gene expression from histone marks",
    description:
      "Histone marks near a gene's TSS carry real signal about how much it's expressed — mostly from one feature. Checked against four regression models to make sure the pattern wasn't a modeling artifact.",
    tags: ["Python", "scikit-learn", "gene regulation", "ChIP-seq"],
    stat: {
      headlineValue: BEST_MODEL.pearson.toFixed(2),
      headlineLabel: "correlation between predicted and actual expression",
      subStats: [
        {
          value: `${(TOP_FEATURE.importance * 100).toFixed(0)}%`,
          label: "of the signal from one feature",
        },
        { value: GE_SUMMARY.n_features.toLocaleString("en-US"), label: "features per gene" },
      ],
    },
  },
];

type GithubProjectData = {
  title: string;
  description: string;
  tags: string[];
  url: string;
};

const GITHUB_PROJECTS: GithubProjectData[] = [
  {
    title: "AD-oral-microbiome-pipeline",
    description:
      "Snakemake pipeline for oral microbiome sequencing data, from SRA download to processing.",
    tags: ["Python", "Snakemake"],
    url: "https://github.com/ssolh2906/AD-oral-microbiome-pipeline",
  },
];

export default function Projects() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="projects" className="relative bg-[#f6f8fb]">
      <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-4 sm:px-8 md:pb-32 lg:px-12">
        <motion.div
          variants={container}
          initial={reduceMotion ? "show" : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
        >
          <motion.h2
            variants={item}
            className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl"
          >
            Projects
          </motion.h2>

          <div className="mt-10 grid gap-6 sm:mt-14">
            {PROJECTS.map((project) => (
              <motion.div key={project.slug} variants={item}>
                <Link
                  href={`/projects/${project.slug}`}
                  className="group block rounded-3xl border border-slate-200/80 bg-white/70 p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-md transition-all duration-300 hover:border-slate-300 hover:shadow-lg sm:p-10"
                >
                  <div className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-12">
                    <div className="lg:col-span-7">
                      <span className="text-xs font-medium text-slate-500">
                        {project.eyebrow}
                      </span>
                      <h3 className="mt-3 text-2xl font-semibold tracking-tight text-balance text-slate-900 sm:text-3xl">
                        {project.title}
                      </h3>
                      <p className="mt-4 max-w-[52ch] leading-relaxed text-slate-600">
                        {project.description}
                      </p>
                      <ul className="mt-6 flex flex-wrap gap-2">
                        {project.tags.map((tag) => (
                          <li
                            key={tag}
                            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600"
                          >
                            {tag}
                          </li>
                        ))}
                      </ul>
                      <span className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-blue-600 transition-all duration-300 group-hover:gap-3">
                        View case study
                        <span aria-hidden>&rarr;</span>
                      </span>
                    </div>

                    <div className="lg:col-span-5">
                      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8">
                        <span className="block text-5xl font-semibold tracking-tight text-slate-900">
                          {project.stat.headlineValue}
                        </span>
                        <span className="mt-2 block text-sm leading-relaxed text-slate-500">
                          {project.stat.headlineLabel}
                        </span>
                        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-100 pt-6">
                          {project.stat.subStats.map((sub) => (
                            <div key={sub.label}>
                              <span className="block text-lg font-semibold text-slate-900">
                                {sub.value}
                              </span>
                              <span className="text-sm text-slate-500">
                                {sub.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.h3
            variants={item}
            className="mt-16 text-sm font-medium uppercase tracking-[0.14em] text-slate-500 sm:mt-20"
          >
            More on GitHub
          </motion.h3>

          <motion.div
            variants={item}
            className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {GITHUB_PROJECTS.map((repo) => (
              <a
                key={repo.url}
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-2xl border border-slate-200/80 bg-white/70 p-5 backdrop-blur-md transition-colors duration-300 hover:border-slate-300"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-medium text-slate-900">
                    {repo.title}
                  </span>
                  <span
                    aria-hidden
                    className="shrink-0 text-slate-400 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  >
                    ↗
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {repo.description}
                </p>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {repo.tags.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-full border border-slate-200 px-2 py-0.5 text-xs text-slate-500"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              </a>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
