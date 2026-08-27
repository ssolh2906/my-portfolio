"use client";

import { MODEL_ROWS } from "@/lib/gene-expression";

// Same blue used for the sc-covid charts, so the two project pages share one accent.
const BAR_COLOR = "#2a78d6";
const BAR_COLOR_MUTED = "#9cbee4";

// Headroom above the best score so its bar doesn't touch the row's right edge.
const AXIS_MAX = 0.65;

export default function ModelComparisonChart() {
  return (
    <div>
      <ul className="grid gap-3">
        {MODEL_ROWS.map((row, i) => {
          const isBest = i === 0;
          const widthPct = (row.r2 / AXIS_MAX) * 100;
          return (
            <li key={row.id} className="flex items-center gap-3">
              <span
                className={`w-36 shrink-0 text-right text-sm sm:w-44 ${
                  isBest ? "font-medium text-slate-900" : "text-slate-500"
                }`}
              >
                {row.label}
              </span>

              <span className="relative h-6 flex-1">
                <span className="absolute inset-y-0 left-0 w-full rounded-[4px] bg-slate-100" />
                <span
                  className="absolute inset-y-0 left-0 rounded-[4px] transition-[width]"
                  style={{
                    width: `${widthPct}%`,
                    backgroundColor: isBest ? BAR_COLOR : BAR_COLOR_MUTED,
                  }}
                />
                <span className="absolute inset-y-0 left-2 flex items-center text-xs font-medium tabular-nums text-white mix-blend-difference">
                  {row.r2.toFixed(3)}
                </span>
              </span>

              <span className="hidden w-32 shrink-0 text-xs text-slate-400 tabular-nums sm:block">
                MAE {row.mae.toFixed(3)} &middot; r {row.pearson.toFixed(3)}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-xs text-slate-400">
        R&sup2; on the held-out test set (higher is better). MAE and Pearson r
        shown alongside for reference.
      </p>
    </div>
  );
}
