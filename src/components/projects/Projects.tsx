"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

import GutPilotVisual from "./GutPilotVisual";
import GeneExpressionVisual from "./GeneExpressionVisual";
import SnpVisual from "./SnpVisual";
import CountUp from "./CountUp";
import CovidVisual from "./CovidVisual";
import ScLabVisual from "./ScLabVisual";

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
  // When set, replaces the number box with a small diagram + headline caption.
  visual?: ReactNode;
  // Count the (numeric) headline up from 0 while the card is hovered.
  countUpHeadline?: boolean;
  // External URL. When set, the card opens it in a new tab instead of
  // linking to /projects/[slug].
  href?: string;
  // CTA text. Defaults to "View case study".
  cta?: string;
  // Small print under the description.
  note?: string;
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
      "An AI agent proposes every analysis decision and backs it with a citation. I review each one, confirm or override it. Fixed demo on two real datasets: colorectal cancer and Parkinson's disease.",
    tags: ["Python", "FastAPI", "Claude", "React", "16S rRNA"],
    stat: {
      headlineValue: "10",
      headlineLabel: "reviewer gates across a 3-layer pipeline",
      subStats: [
        { value: "2", label: "real datasets" },
        { value: "638", label: "samples analyzed" },
      ],
    },
    visual: <GutPilotVisual />,
  },

  {
    slug: "gene-expression",
    eyebrow: "Regulatory genomics · ML",
    title: "Predicting gene expression from histone marks",
    description:
      "Histone marks near a gene's TSS predict how much it's expressed, mostly from one feature. I checked it against four regression models to rule out a modeling artifact.",
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
    visual: <GeneExpressionVisual />,
  },

  {
    slug: "snp-summary",
    eyebrow: "Bioinformatics · LLM summaries",
    title: "Turning an rs ID into a bioinformatics summary",
    description:
      "Pulls NCBI and Ensembl data and grounds the summary in real PubMed citations instead of model recall. Fixed demo from a bioinformatics hackathon.",
    tags: ["NCBI", "Ensembl", "PubMed", "Next.js"],
    stat: {
      headlineValue: String(RS6311.dbsnpCitationCount),
      headlineLabel: "studies linked to rs6311 in dbSNP",
      subStats: [
        { value: String(Object.keys(SNP_VARIANTS).length), label: "example variants" },
        { value: String(SNP_PAPERS_CITED), label: "papers cited" },
      ],
    },
    visual: <SnpVisual />,
    countUpHeadline: true,
  },

  {
    slug: "sc-covid",
    eyebrow: "Single-cell genomics",
    title: `Reading COVID-19 in ${SUMMARY.n_cells_total.toLocaleString("en-US")} blood cells`,
    description:
      "COVID-19 blood has more activated effector cells and fewer resting naive and memory cells. Built from CELLxGENE Census data into an interactive chart.",
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
    visual: <CovidVisual />,
  },

  {
    slug: "sc-lab",
    eyebrow: "Interactive tool · Built and shared",
    title: "Single-cell Lab: learn scRNA-seq analysis by running it",
    description:
      "I designed, built, and shipped a 13-step lab that runs a full single-cell analysis in the browser, from quality control to a trajectory. Then I opened it up so anyone can learn by doing.",
    note: "Synthetic data, modeled on a published COVID-19 blood study.",
    tags: ["Next.js", "single-cell RNA-seq", "Teaching", "GitHub Pages"],
    stat: {
      headlineValue: "13",
      headlineLabel: "guided steps, from raw cells to a conclusion",
      subStats: [],
    },
    visual: <ScLabVisual />,
    href: "https://ssolh2906.github.io/sc-simulator/",
    cta: "Open the lab",
  },
];

function CardBody({ project }: { project: ProjectCardData }) {
  return (
    <div className="grid gap-10 md:grid-cols-12 md:items-center md:gap-8 lg:gap-12">
      <div className="md:col-span-6">
        <span className="text-xs font-medium text-slate-500">
          {project.eyebrow}
        </span>
        <h3 className="mt-3 text-2xl font-semibold tracking-tight text-balance text-slate-900 sm:text-3xl">
          {project.title}
        </h3>
        <p className="mt-4 max-w-[52ch] leading-relaxed text-slate-600">
          {project.description}
        </p>
        {project.note && (
          <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-slate-500">
            {project.note}
          </p>
        )}
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
          {project.cta ?? "View case study"}
          <span aria-hidden>{project.href ? "\u2197" : "\u2192"}</span>
        </span>
      </div>

      <div className="md:col-span-6">
        <div
          data-card-visual
          className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8"
        >
          {project.visual ? (
            <>
              {project.visual}
              <div className="mt-6 flex items-baseline gap-3 border-t border-slate-100 pt-5">
                <span className="text-3xl font-semibold tracking-tight text-slate-900">
                  {project.countUpHeadline ? (
                    <CountUp to={Number(project.stat.headlineValue)} />
                  ) : (
                    project.stat.headlineValue
                  )}
                </span>
                <span className="text-sm leading-snug text-slate-500">
                  {project.stat.headlineLabel}
                </span>
              </div>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}

type GithubProjectData = {
  title: string;
  description: string;
  tags: string[];
  url: string;
};

// Not pushed yet - push the repo, then move this back into the array to
// bring the "More on GitHub" section back.
const GITHUB_PROJECTS: GithubProjectData[] = [
  // {
  //   title: "AD-oral-microbiome-pipeline",
  //   description:
  //     "Snakemake pipeline for oral microbiome sequencing data, from SRA download to processing.",
  //   tags: ["Python", "Snakemake"],
  //   url: "https://github.com/ssolh2906/AD-oral-microbiome-pipeline",
  // },
];

const CARD_CLASS =
  "group block rounded-3xl border border-slate-200/80 bg-white/70 p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-md transition-all duration-300 hover:border-slate-300 hover:shadow-lg sm:p-10";

// Touch screens have no hover, so the card visuals would never animate.
// There, a card "plays" when most of its visual box is on screen: the card
// gets data-play (which the custom `hover` variant in globals.css treats
// like a hover) and a "cardplay" event for visuals driven by JS. It resets
// once the visual has left the screen, so it plays again on the next pass.
// We watch the visual box, not the whole card, because on a phone a card is
// taller than the screen and its visual sits at the bottom.
function useAutoPlayOnTouch() {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || !window.matchMedia("(hover: none)").matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const card = entry.target.closest<HTMLElement>("[data-card]");
          if (!card) continue;
          if (entry.intersectionRatio >= 0.6 && card.dataset.play === undefined) {
            card.dataset.play = "";
            card.dispatchEvent(new Event("cardplay"));
          } else if (!entry.isIntersecting && card.dataset.play !== undefined) {
            delete card.dataset.play;
            card.dispatchEvent(new Event("cardstop"));
          }
        }
      },
      { threshold: [0, 0.6] },
    );
    grid
      .querySelectorAll("[data-card-visual]")
      .forEach((visual) => observer.observe(visual));
    return () => observer.disconnect();
  }, []);

  return gridRef;
}

export default function Projects() {
  const reduceMotion = useReducedMotion();
  const gridRef = useAutoPlayOnTouch();

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

          <div ref={gridRef} className="mt-10 grid gap-6 sm:mt-14">
            {PROJECTS.map((project) => (
              <motion.div key={project.slug} variants={item}>
                {project.href ? (
                  <a
                    href={project.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-card
                    className={CARD_CLASS}
                  >
                    <CardBody project={project} />
                  </a>
                ) : (
                  <Link
                    href={`/projects/${project.slug}`}
                    data-card
                    className={CARD_CLASS}
                  >
                    <CardBody project={project} />
                  </Link>
                )}
              </motion.div>
            ))}
          </div>

          {GITHUB_PROJECTS.length > 0 && (
          <>
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
          </>
          )}
        </motion.div>
      </div>
    </section>
  );
}
