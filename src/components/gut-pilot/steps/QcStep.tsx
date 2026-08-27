"use client";

import { useMemo, useState } from "react";
import type { GutPilotBundle } from "@/lib/gut-pilot";
import { Card, RecBadge, SectionHeading, Stat, fmt } from "../shared";

// Bottom-N by depth, with a draggable floor line — the shape that actually
// matters for this gate (is anyone near/under the floor), not a full
// 490-bar chart that would be unreadable at this size.
function DepthBars({ bars, floor }: { bars: { sample_id: string; depth: number }[]; floor: number }) {
  const sorted = [...bars].sort((a, b) => a.depth - b.depth).slice(0, 24);
  const max = Math.max(...sorted.map((b) => b.depth), floor) * 1.05;
  const W = 720;
  const H = 160;
  const bw = W / sorted.length;
  const yFor = (v: number) => H - (v / max) * H;

  return (
    <svg viewBox={`0 0 ${W} ${H + 16}`} className="w-full" role="img" aria-label="Lowest-depth samples">
      <line x1={0} x2={W} y1={yFor(floor)} y2={yFor(floor)} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="5 4" />
      <text x={2} y={yFor(floor) - 4} fontSize="9" fill="#b45309">
        floor {fmt(floor)}
      </text>
      {sorted.map((b, i) => (
        <rect
          key={b.sample_id}
          x={i * bw + bw * 0.15}
          y={yFor(b.depth)}
          width={bw * 0.7}
          height={H - yFor(b.depth)}
          rx={2}
          fill={b.depth < floor ? "#ef4444" : "#3b82f6"}
          fillOpacity={0.85}
        >
          <title>
            {b.sample_id}: {fmt(b.depth)} reads
          </title>
        </rect>
      ))}
      <line x1={0} x2={W} y1={H} y2={H} stroke="#e2e8f0" />
      <text x={0} y={H + 13} fontSize="9" fill="#94a3b8">
        24 lowest-depth samples of {bars.length}, ascending
      </text>
    </svg>
  );
}

export default function QcStep({ bundle }: { bundle: GutPilotBundle }) {
  const { stats, bars } = bundle.qcDepth;
  const defaultFloor = bundle.qcFloor.floor;
  const [floor, setFloor] = useState(defaultFloor);

  // Recomputed client-side against the real per-sample depths — same
  // numbers the backend's own qc/floor endpoint would return for this
  // floor, just done in the browser since we already have every depth.
  const flagged = useMemo(() => bars.filter((b) => b.depth < floor).map((b) => b.sample_id), [bars, floor]);
  const sliderMax = useMemo(() => {
    const depths = bars.map((b) => b.depth).sort((a, b) => a - b);
    const p90 = depths[Math.floor(0.9 * (depths.length - 1))] ?? 10000;
    return Math.max(2000, Math.ceil(p90 / 500) * 500);
  }, [bars]);

  return (
    <div className="flex flex-col gap-6">
      <SectionHeading
        title="Raw QC (G5)"
        lede="Flags under-sequenced samples against a depth floor — flags only, never excludes. Exclusion happens at Normalize (G7), if at all."
      />

      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-5 sm:grid-cols-4">
        <Stat label="Samples" value={fmt(stats.n_samples)} />
        <Stat label="Total reads" value={fmt(stats.total_reads)} />
        <Stat label="Mean depth" value={fmt(Math.round(stats.mean_depth))} />
        <Stat label="Depth range" value={`${fmt(stats.min_depth)}–${fmt(stats.max_depth)}`} />
      </dl>

      <Card>
        <DepthBars bars={bars} floor={floor} />
        <p className="mt-3 text-xs text-slate-500">
          Drag the floor — the flagged count below recomputes live against every real sample depth in this run.
        </p>
        <div className="mt-3 flex items-center gap-4">
          <input
            type="range"
            min={500}
            max={sliderMax}
            step={50}
            value={floor}
            aria-label="QC depth floor"
            onChange={(e) => setFloor(Number(e.target.value))}
            className="h-2 flex-1 cursor-pointer accent-blue-600"
          />
          <span className="w-24 shrink-0 text-right font-mono text-sm font-semibold text-slate-900">{fmt(floor)}</span>
        </div>
        <button
          type="button"
          onClick={() => setFloor(defaultFloor)}
          className="mt-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition-colors duration-200 hover:border-blue-300 hover:text-blue-700"
        >
          Reset to default ({fmt(defaultFloor)})
        </button>
      </Card>

      <div className="flex items-center justify-between">
        <b className="text-sm text-slate-900">Floor: {fmt(floor)} reads</b>
        <RecBadge label={`${flagged.length}/${bars.length} flagged`} />
      </div>
      {flagged.length > 0 && (
        <p className="text-xs text-slate-500">
          Flagged: {flagged.slice(0, 12).join(", ")}
          {flagged.length > 12 ? ` +${flagged.length - 12} more` : ""}
        </p>
      )}
    </div>
  );
}
