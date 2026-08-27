"use client";

import { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import ScrollScrubArtwork from "./ScrollScrubArtwork";

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative overflow-hidden bg-denim-50"
    >
      {/* network artwork: sits behind the text as one background layer, not a boxed-off panel.
          Sized by aspect-ratio (not stretched to section height) and mask-faded into the
          background so it reads as part of the same composition as the copy. */}
      <motion.div
        aria-hidden
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        style={{
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 30%, black 85%, transparent)",
          maskImage:
            "linear-gradient(to right, transparent, black 30%, black 85%, transparent)",
        }}
        className="absolute right-[-8%] top-1/2 aspect-video w-[92%] -translate-y-1/2 sm:w-[80%] md:right-[-4%] md:w-[68%] lg:w-[58%]"
      >
        <ScrollScrubArtwork target={sectionRef} />
      </motion.div>

      {/* soft wash so text stays legible over the artwork on every viewport */}
      <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-denim-50 via-denim-50/55 to-transparent" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-16 pt-28 sm:px-8 sm:pb-20 sm:pt-32 lg:px-12">
        <motion.div
          variants={container}
          initial={reduceMotion ? "show" : "hidden"}
          animate="show"
          className="max-w-xl lg:max-w-2xl"
        >
          <motion.div variants={item}>
            <p className="text-sm font-medium text-slate-700">Solhee Tucker</p>
            <p className="mt-1 text-sm font-medium text-denim-600">
              ML / Bioinformatics Engineer
            </p>
          </motion.div>

          <motion.h1
            variants={item}
            className="mt-6 text-balance text-4xl font-semibold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl"
          >
            From biological complexity to scalable solutions.
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-6 max-w-[42ch] text-base leading-relaxed text-slate-600 sm:text-lg"
          >
            Machine learning built on real biological data, shipped as
            software people can actually rely on.
          </motion.p>

          <motion.div
            variants={item}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <a
              href="#projects"
              className="inline-flex h-12 items-center justify-center rounded-full bg-denim-600 px-7 text-sm font-medium text-white transition-transform duration-300 hover:-translate-y-0.5 hover:bg-denim-700 active:scale-[0.98]"
            >
              View projects
            </a>
            <a
              href="#contact"
              className="inline-flex h-12 items-center justify-center rounded-full border border-slate-200 bg-white/60 px-7 text-sm font-medium text-slate-700 backdrop-blur-sm transition-colors duration-300 hover:border-denim-300 hover:bg-white active:scale-[0.98]"
            >
              Get in touch
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
