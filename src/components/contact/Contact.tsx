"use client";

import { motion, useReducedMotion } from "framer-motion";

const CONTACT_ITEMS = [
  { label: "Personal email", value: "solheetucker@gmail.com", href: "mailto:solheetucker@gmail.com" },
  { label: "School email", value: "solhee.tucker@gmail.com", href: "mailto:solhee.tucker@gmail.com" },
  { label: "Location", value: "San Jose, California, USA", href: null },
];

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function Contact() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="contact" className="relative bg-[#f6f8fb]">
      <div className="mx-auto max-w-7xl px-6 pb-24 pt-4 sm:px-8 md:pb-28 lg:px-12">
        <motion.div
          variants={container}
          initial={reduceMotion ? "show" : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
        >
          <motion.span
            variants={item}
            className="block font-mono text-xs uppercase tracking-[0.22em] text-denim-600"
          >
            Contact
          </motion.span>


          <motion.dl
            variants={item}
            className="mt-10 grid grid-cols-1 divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-md sm:grid-cols-3 sm:divide-y-0 sm:divide-x"
          >
            {CONTACT_ITEMS.map((c) => (
              <div key={c.label} className="px-6 py-6">
                <dt className="text-xs font-medium text-slate-500">{c.label}</dt>
                <dd className="mt-1.5">
                  {c.href ? (
                    <a
                      href={c.href}
                      className="text-sm font-medium text-slate-900 transition-colors duration-300 hover:text-denim-600"
                    >
                      {c.value}
                    </a>
                  ) : (
                    <span className="text-sm font-medium text-slate-900">{c.value}</span>
                  )}
                </dd>
              </div>
            ))}
          </motion.dl>
        </motion.div>
      </div>
    </section>
  );
}
