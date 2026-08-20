"use client";

import { useState } from "react";

import {
  FOLD_CHANGE_ROWS,
  MAX_ABS_LOG2,
  PROPORTIONS,
  shortCellTypeLabel,
  type Direction,
} from "@/lib/sc-covid";

// Same two condition colors as the cell map, so one color system covers the
// whole page. Neutral rows use the map's de-emphasis gray.
const BAR_COLOR: Record<Direction, string> = {
  COVID: "#eb6834",
  normal: "#2a78d6",
  neutral: "#c3c2b7",
};

// Ticks in plain fold-change terms. The log2 axis is what the bars are drawn
// on, but "4x fewer" reads to everyone and "-2" does not.
const TICKS = [
  { log2: -4, label: "16x fewer" },
  { log2: -2, label: "4x fewer" },
  { log2: 0, label: "same" },
  { log2: 2, label: "4x more" },
];

const EMPHASIS_COUNT = 3;

/** Half-track percentage for a log2 value. */
const halfWidth = (log2: number) => (Math.abs(log2) / MAX_ABS_LOG2) * 50;

function foldChangeText(fold: number): string {
  return fold >= 1
    ? `${fold.toFixed(1)}x more in COVID-19`
    : `${(1 / fold).toFixed(1)}x more in healthy`;
}

export default function FoldChangeChart() {
  const [hovered, setHovered] = useState<string | null>(null);

  const lastIndex = FOLD_CHANGE_ROWS.length - 1;

  return (
    <div>
      <div className="relative">
        {/* tick grid, drawn behind the bars. Mirrors a row's flex structure
            (label column + gap + track) so the lines land on the bar scale. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex gap-3"
        >
          <span className="w-32 shrink-0 sm:w-44" />
          <div className="relative flex-1">
            {TICKS.map((tick) => (
              <div
                key={tick.log2}
                className={`absolute inset-y-0 w-px ${
                  tick.log2 === 0 ? "bg-slate-300" : "bg-slate-200"
                }`}
                style={{ left: `${50 + (tick.log2 / MAX_ABS_LOG2) * 50}%` }}
              />
            ))}
          </div>
        </div>

        <ul className="relative">
          {FOLD_CHANGE_ROWS.map((row, i) => {
            const isEmphasis =
              i < EMPHASIS_COUNT || i > lastIndex - EMPHASIS_COUNT;
            const isHovered = hovered === row.cell_type;
            const showValue = isEmphasis || isHovered;
            const positive = row.log2 >= 0;

            return (
              <li
                key={row.cell_type}
                onPointerEnter={() => setHovered(row.cell_type)}
                onPointerLeave={() => setHovered(null)}
                className="flex items-center gap-3 py-[3px]"
              >
                <span
                  title={row.cell_type}
                  className={`w-32 shrink-0 truncate text-right text-[11px] leading-tight transition-colors sm:w-44 sm:text-xs ${
                    isHovered ? "text-slate-900" : "text-slate-500"
                  }`}
                >
                  {shortCellTypeLabel(row.cell_type)}
                </span>

                <span className="relative h-4 flex-1">
                  <span
                    className="absolute top-1/2 h-2.5 -translate-y-1/2 rounded-[2px] transition-opacity"
                    style={{
                      backgroundColor: BAR_COLOR[row.direction],
                      opacity: hovered && !isHovered ? 0.45 : 1,
                      left: positive ? "50%" : `${50 - halfWidth(row.log2)}%`,
                      width: `${halfWidth(row.log2)}%`,
                    }}
                  />
                  {showValue && (
                    <span
                      className="absolute top-1/2 -translate-y-1/2 text-[11px] whitespace-nowrap text-slate-500 tabular-nums"
                      style={{
                        left: positive
                          ? `calc(${50 + halfWidth(row.log2)}% + 6px)`
                          : undefined,
                        right: positive
                          ? undefined
                          : `calc(${50 + halfWidth(row.log2)}% + 6px)`,
                      }}
                    >
                      {row.fold_change.toFixed(2)}x
                    </span>
                  )}
                  <span className="sr-only">
                    {shortCellTypeLabel(row.cell_type)}:{" "}
                    {foldChangeText(row.fold_change)}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>

        <div className="mt-3 flex gap-3">
          <span aria-hidden className="w-32 shrink-0 sm:w-44" />
          <div className="relative h-4 flex-1">
            {TICKS.map((tick) => (
              <span
                key={tick.log2}
                className="absolute -translate-x-1/2 text-[11px] whitespace-nowrap text-slate-400"
                style={{ left: `${50 + (tick.log2 / MAX_ABS_LOG2) * 50}%` }}
              >
                {tick.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-8 max-w-[62ch] rounded-xl border border-slate-200/80 bg-white/70 p-4 text-sm leading-relaxed text-slate-600">
        Plasmablasts are too rare to chart on their own, so they sit inside
        Other. They are worth calling out anyway: {PROPORTIONS.plasmablast.covid}{" "}
        of the {PROPORTIONS.plasmablast.covid + PROPORTIONS.plasmablast.normal}{" "}
        found came from COVID-19 blood, roughly a 10x expansion. These are the
        cells that mass-produce antibodies.
      </p>
    </div>
  );
}
