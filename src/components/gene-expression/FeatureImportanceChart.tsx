"use client";

import { FEATURE_IMPORTANCE } from "@/lib/gene-expression";

const BAR_COLOR = "#2a78d6";
const TOP_N = 10;

export default function FeatureImportanceChart() {
  const rows = FEATURE_IMPORTANCE.slice(0, TOP_N);
  const maxImportance = rows[0]?.importance ?? 1;

  return (
    <div>
      <ul className="grid gap-2.5">
        {rows.map((row) => {
          const widthPct = (row.importance / maxImportance) * 100;
          return (
            <li key={row.feature} className="flex items-center gap-3">
              <span className="w-36 shrink-0 truncate text-right text-xs text-slate-500 sm:w-52 sm:text-sm">
                {row.feature}
              </span>
              <span className="relative h-4 flex-1">
                <span className="absolute inset-y-0 left-0 w-full rounded-[3px] bg-slate-100" />
                <span
                  className="absolute inset-y-0 left-0 rounded-[3px]"
                  style={{ width: `${widthPct}%`, backgroundColor: BAR_COLOR }}
                />
              </span>
              <span className="w-14 shrink-0 text-xs text-slate-400 tabular-nums">
                {(row.importance * 100).toFixed(1)}%
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-xs text-slate-400">
        Random Forest feature importance, top {TOP_N} of {FEATURE_IMPORTANCE.length}{" "}
        ranked features. Offsets are bp from the TSS (+ = downstream).
      </p>
    </div>
  );
}
