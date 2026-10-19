"use client";

import { useState } from "react";

// Short titles of the 10 reviewer gates, in run order. Mirrors GATES in
// GutPilotProjectTabs.tsx (not exported there), keep the two in sync.
const GATE_TITLES = [
  "Comparison groups",
  "Batch handling",
  "Pairing",
  "Taxonomic rank",
  "Depth floor",
  "Normalization strategy",
  "Rarefaction depth",
  "Significance",
  "Distance metric",
  "Prevalence filter",
];

const DEFAULT_CAPTION = "Each gate: a cited proposal you confirm or override";

const X0 = 16;
const STEP = 29.8;
const R = 12;

export default function GutPilotVisual() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <div>
      <svg
        viewBox="0 0 300 40"
        className="w-full"
        role="img"
        aria-label="Ten decision gates in run order"
      >
        <line
          x1={X0}
          y1="20"
          x2={X0 + STEP * 9}
          y2="20"
          className="stroke-denim-200"
          strokeWidth="2"
        />
        {GATE_TITLES.map((title, i) => {
          const cx = X0 + i * STEP;
          return (
            <g
              key={title}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
            >
              {/* Card hover fills the gates left to right; the delay is the
                  stagger. Hovering one gate outlines it in coral. */}
              <circle
                cx={cx}
                cy="20"
                r={R}
                strokeWidth={active === i ? 2.5 : 1.5}
                style={{ transitionDelay: `${i * 70}ms` }}
                className={`fill-white transition-[fill,stroke] duration-300 group-hover:fill-denim-600 motion-reduce:transition-none ${
                  active === i ? "stroke-coral-500" : "stroke-denim-500"
                }`}
              />
              <text
                x={cx}
                y="24"
                textAnchor="middle"
                fontSize="11"
                style={{ transitionDelay: `${i * 70}ms` }}
                className="pointer-events-none fill-denim-600 transition-[fill] duration-300 group-hover:fill-white motion-reduce:transition-none"
              >
                {i + 1}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="mt-3 h-5 text-sm text-slate-500">
        {active === null ? (
          DEFAULT_CAPTION
        ) : (
          <>
            <b className="font-medium text-slate-900">G{active + 1}</b> ·{" "}
            {GATE_TITLES[active]}
          </>
        )}
      </p>
    </div>
  );
}
