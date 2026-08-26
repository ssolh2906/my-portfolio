"use client";

import { motion, useReducedMotion } from "framer-motion";

const STATS = [
  "GPA 3.94",
  "2× Hackathon Champion",
  "Production app · 100K+ users",
  "MS Bioinformatics",
];

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

export default function About() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="about" className="relative bg-slate-50">
      {/* hero's denim-50 bleeding into the slightly cooler body, so the seam reads as one page */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-linear-to-b from-denim-50 to-slate-50 sm:h-20 md:h-24"
      />

      <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-16 sm:px-8 sm:pt-20 md:pb-32 md:pt-24 lg:px-12">
        <motion.div
          variants={container}
          initial={reduceMotion ? "show" : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.span
            variants={item}
            className="block font-mono text-xs uppercase tracking-[0.22em] text-denim-600"
          >
            About
          </motion.span>

          <motion.p
            variants={item}
            className="mt-8 max-w-[60ch] text-lg leading-relaxed text-slate-600"
          >
            My background is bioinformatics. I focus on machine learning
            and production software &mdash; turning a model in a notebook
            into a system people can rely on.
          </motion.p>

          <motion.ul
            variants={item}
            className="mt-16 grid grid-cols-1 divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-md sm:mt-20 lg:grid-cols-4 lg:divide-x lg:divide-y-0"
          >
            {STATS.map((stat) => (
              <li
                key={stat}
                className="px-6 py-5 text-center text-sm font-medium text-slate-700 sm:text-[0.95rem]"
              >
                {stat}
              </li>
            ))}
          </motion.ul>
        </motion.div>
      </div>
    </section>
  );
}
