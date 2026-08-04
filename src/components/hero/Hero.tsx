"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

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

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, 120]);

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative flex min-h-[100dvh] items-end overflow-hidden bg-[#050912]"
    >
      <motion.div
        style={{ y: reduceMotion ? 0 : parallaxY }}
        className="absolute inset-0 scale-110"
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/hero-poster.png"
          className="h-full w-full object-cover"
        >
          {/* TODO: add <source src="/hero-loop.mp4" type="video/mp4" /> once the ambient bio/DNA loop is ready */}
        </video>
      </motion.div>

      {/* legibility scrim */}
      <div className="pointer-events-none absolute inset-0 [background:linear-gradient(to_top,#050912_0%,rgba(5,9,18,0.72)_45%,rgba(5,9,18,0.18)_100%)]" />
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(ellipse_60%_55%_at_18%_100%,rgba(56,124,255,0.30),transparent_70%)]" />

      {/* circuit grid depth */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(96,165,250,0.7)_1px,transparent_1px),linear-gradient(90deg,rgba(96,165,250,0.7)_1px,transparent_1px)] [background-size:56px_56px]"
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-20 pt-24 sm:px-8 md:pb-28 lg:px-12">
        <motion.div
          variants={container}
          initial={reduceMotion ? "show" : "hidden"}
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-12"
        >
          <div className="lg:col-span-7">
            <motion.h1 variants={item} className="text-balance">
              <span className="block text-2xl font-medium text-white/70 sm:text-3xl">
                Solhee Tucker
              </span>
              <span className="mt-2 block text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                I teach machines to read biology
                <span className="text-blue-400">.</span>
              </span>
            </motion.h1>

            <motion.p
              variants={item}
              className="mt-6 max-w-[46ch] text-base leading-relaxed text-white/70 sm:text-lg"
            >
            MS Bioinformatics, Former Software Engineer · PyTorch, LLMs, NGS pipelines · from model to deployment.
            </motion.p>

            <motion.div
              variants={item}
              className="mt-9 flex flex-wrap items-center gap-5"
            >
              <a
                href="#projects"
                className="inline-flex h-12 items-center justify-center rounded-full bg-blue-500 px-7 text-sm font-medium text-white transition-transform duration-300 hover:-translate-y-0.5 hover:bg-blue-400 active:scale-[0.98]"
              >
                View projects
              </a>
              <a
                href="#contact"
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/20 px-7 text-sm font-medium text-white/90 transition-colors duration-300 hover:border-white/40 hover:bg-white/5 active:scale-[0.98]"
              >
                Get in touch
              </a>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
