"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

import { FOLD_CHANGE_ROWS, SUMMARY, shortCellTypeLabel } from "@/lib/sc-covid";

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

const TAGS = ["Python", "scanpy", "single-cell RNA-seq", "Next.js"];

// Biggest COVID-19 expansion in the dataset (rows are sorted descending by
// log2 fold change), used as the card's headline stat.
const TOP_ROW = FOLD_CHANGE_ROWS[0];

export default function Projects() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="projects" className="relative bg-[#f6f8fb]">
      <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-4 sm:px-8 md:pb-32 lg:px-12">
        <motion.div
          variants={container}
          initial={reduceMotion ? "show" : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.h2
            variants={item}
            className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl"
          >
            Projects
          </motion.h2>

          <motion.div variants={item} className="mt-10 sm:mt-14">
            <Link
              href="/projects/sc-covid"
              className="group block rounded-3xl border border-slate-200/80 bg-white/70 p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-md transition-all duration-300 hover:border-slate-300 hover:shadow-lg sm:p-10"
            >
              <div className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-12">
                <div className="lg:col-span-7">
                  <span className="text-xs font-medium text-slate-500">
                    Featured project
                  </span>
                  <h3 className="mt-3 text-2xl font-semibold tracking-tight text-balance text-slate-900 sm:text-3xl">
                    Reading COVID-19 in {SUMMARY.n_cells_total.toLocaleString("en-US")}{" "}
                    blood cells
                  </h3>
                  <p className="mt-4 max-w-[52ch] leading-relaxed text-slate-600">
                    COVID-19 blood expands activated effector cells and drains
                    the resting naive and memory pool. An interactive
                    single-cell analysis, from CELLxGENE Census data to a
                    browser-native chart.
                  </p>
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {TAGS.map((tag) => (
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
                      {TOP_ROW.fold_change.toFixed(1)}x
                    </span>
                    <span className="mt-2 block text-sm leading-relaxed text-slate-500">
                      more {shortCellTypeLabel(TOP_ROW.cell_type)} in COVID-19
                      blood
                    </span>
                    <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-100 pt-6">
                      <div>
                        <span className="block text-lg font-semibold text-slate-900">
                          {SUMMARY.n_cells_total.toLocaleString("en-US")}
                        </span>
                        <span className="text-sm text-slate-500">
                          cells analyzed
                        </span>
                      </div>
                      <div>
                        <span className="block text-lg font-semibold text-slate-900">
                          {SUMMARY.n_donors.toLocaleString("en-US")}
                        </span>
                        <span className="text-sm text-slate-500">donors</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
