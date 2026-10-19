import type { CSSProperties } from "react";

import {
  FOLD_CHANGE_ROWS,
  MAX_ABS_LOG2,
  shortCellTypeLabel,
} from "@/lib/sc-covid";

const WIDTH = 300;
const CENTER = WIDTH / 2;
const HALF = CENTER - 8;
const ROW_H = 6;
const BAR_H = 4.5;
const TOP = 2;
const AXIS_BOTTOM = TOP + FOLD_CHANGE_ROWS.length * ROW_H;

// Pale at rest; on card hover the bars regrow from the axis, top to bottom,
// in saturated tones. The tone is the cell type's direction: coral = more in
// COVID-19, teal = more in healthy, grey = neutral.
const TONE = {
  COVID: "fill-coral-300 group-hover:fill-coral-500",
  normal: "fill-teal-300 group-hover:fill-teal-500",
  neutral: "fill-slate-200 group-hover:fill-slate-400",
} as const;

// One bar per cell type group, same log2 scale as the case-study chart.
export default function CovidVisual() {
  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${AXIS_BOTTOM + 18}`}
      className="w-full"
      role="img"
      aria-label="Change in each cell type's share, COVID-19 versus healthy blood: T cells, B cells and monocytes up, naive and memory cells down"
    >
      {FOLD_CHANGE_ROWS.map((row, i) => {
        const w = (Math.abs(row.log2) / MAX_ABS_LOG2) * HALF;
        return (
          <rect
            key={row.cell_type}
            x={row.log2 >= 0 ? CENTER : CENTER - w}
            y={TOP + i * ROW_H + (ROW_H - BAR_H) / 2}
            width={w}
            height={BAR_H}
            rx="1.5"
            style={
              {
                "--d": `${i * 45}ms`,
                animationDelay: `${i * 45}ms`,
                transformOrigin: `${CENTER}px 0px`,
              } as CSSProperties
            }
            className={`[transform-box:view-box] transition-[fill] duration-500 group-hover:animate-bar-grow group-hover:[transition-delay:var(--d)] motion-reduce:animate-none motion-reduce:transition-none ${TONE[row.direction]}`}
          >
            <title>
              {shortCellTypeLabel(row.cell_type)}: {row.fold_change}x
            </title>
          </rect>
        );
      })}
      <line
        x1={CENTER}
        y1="0"
        x2={CENTER}
        y2={AXIS_BOTTOM}
        className="stroke-slate-400"
      />
      <text
        x={CENTER - 6}
        y={AXIS_BOTTOM + 14}
        textAnchor="end"
        fontSize="11"
        className="fill-teal-600"
      >
        fewer in COVID-19
      </text>
      <text
        x={CENTER + 6}
        y={AXIS_BOTTOM + 14}
        fontSize="11"
        className="fill-coral-600"
      >
        more
      </text>
    </svg>
  );
}
