import type { CSSProperties } from "react";

import sample from "@/data/gene-expression/scatter-sample.json";
import { BEST_MODEL, SUMMARY } from "@/lib/gene-expression";

// ~200 held-out genes (every `stride`-th test gene) from the best model, so
// the home page doesn't have to fetch the full predictions file.
const POINTS = sample.points as [number, number][];

const SIZE = 140;
const PAD = 6;

// Square domain shared by both axes so the y = x line is a true 45 degrees.
const DOMAIN_MIN = Math.min(...POINTS.flat());
const DOMAIN_MAX = Math.max(...POINTS.flat());
const SCALE = (SIZE - PAD * 2) / (DOMAIN_MAX - DOMAIN_MIN);

const px = (v: number) => PAD + (v - DOMAIN_MIN) * SCALE;
// Flip y so a higher predicted value sits higher on screen.
const py = (v: number) => SIZE - PAD - (v - DOMAIN_MIN) * SCALE;

export default function GeneExpressionVisual() {
  return (
    <div className="flex items-center gap-5">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="w-36 shrink-0"
        role="img"
        aria-label="Predicted versus actual gene expression for a sample of held-out genes, clustered around the perfect-prediction line"
      >
        <path
          d={`M${PAD} ${PAD}V${SIZE - PAD}H${SIZE - PAD}`}
          fill="none"
          strokeWidth="1"
          className="stroke-slate-200"
        />
        {/* Faint resting state; on hover the dots darken in a scattered order,
            then a coral y = x line draws over the faint dashed one. */}
        <line
          x1={PAD}
          y1={SIZE - PAD}
          x2={SIZE - PAD}
          y2={PAD}
          strokeWidth="1.5"
          strokeDasharray="4 3"
          className="stroke-slate-200"
        />
        {POINTS.map(([actual, predicted], i) => (
          <circle
            key={i}
            cx={px(actual)}
            cy={py(predicted)}
            r="2.2"
            style={{ "--d": `${((i * 37) % POINTS.length) * 5}ms` } as CSSProperties}
            className="origin-center fill-denim-300 opacity-75 transition-[fill,scale] duration-300 [transform-box:fill-box] group-hover:scale-125 group-hover:fill-denim-500 group-hover:[transition-delay:var(--d)] motion-reduce:transition-none"
          />
        ))}
        <line
          x1={PAD}
          y1={SIZE - PAD}
          x2={SIZE - PAD}
          y2={PAD}
          pathLength="1"
          strokeWidth="1.5"
          strokeDasharray="1"
          className="stroke-coral-500 transition-[stroke-dashoffset] duration-700 [stroke-dashoffset:1] group-hover:[stroke-dashoffset:0] group-hover:delay-[1100ms] motion-reduce:transition-none"
        />
      </svg>
      <dl className="min-w-0 text-sm text-slate-500">
        <dt className="text-xs">Held-out genes</dt>
        <dd className="mb-3 font-medium text-slate-900 tabular-nums">
          {SUMMARY.n_test.toLocaleString("en-US")}
        </dd>
        <dt className="text-xs">Model</dt>
        <dd className="mb-3 font-medium text-slate-900">{BEST_MODEL.label}</dd>
        <dt className="text-xs">Coral line</dt>
        <dd>perfect prediction</dd>
      </dl>
    </div>
  );
}
