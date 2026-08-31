"use client";

import { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import ScrollScrubArtwork from "./ScrollScrubArtwork";

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5 fill-current">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.4 7.86 10.93.58.1.79-.25.79-.56 0-.27-.01-1.16-.02-2.11-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.72.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.75 2.69 1.25 3.34.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.74.8 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.08.78 2.18 0 1.57-.01 2.83-.01 3.22 0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12c0-6.35-5.15-11.5-11.5-11.5Z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5 fill-current">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.03-1.85-3.03-1.86 0-2.15 1.45-2.15 2.94v5.66H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.61 0 4.28 2.38 4.28 5.47v6.27ZM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45Z" />
    </svg>
  );
}

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

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-10 pt-28 sm:px-8 sm:pb-12 sm:pt-32 lg:px-12">
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
              href="https://github.com/ssolh2906?tab=repositories"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white/60 text-slate-700 backdrop-blur-sm transition-colors duration-300 hover:border-denim-300 hover:bg-white active:scale-[0.98]"
            >
              <GitHubIcon />
            </a>
            <a
              // TODO(Solhee): drop in your real LinkedIn profile URL here
              href="https://www.linkedin.com/in/YOUR-LINKEDIN-HANDLE"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white/60 text-slate-700 backdrop-blur-sm transition-colors duration-300 hover:border-denim-300 hover:bg-white active:scale-[0.98]"
            >
              <LinkedInIcon />
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
