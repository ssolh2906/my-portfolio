import type { GutPilotBundle } from "@/lib/gut-pilot";
import { Card, RecBadge, SectionHeading, Stat, fmt } from "../shared";

// Bottom-N by depth, with a dashed floor line — the shape that actually
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
      <line
        x1={0}
        x2={W}
        y1={yFor(floor)}
        y2={yFor(floor)}
        stroke="#f59e0b"
        strokeWidth={1.5}
        strokeDasharray="5 4"
      />
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
  const floor = bundle.qcFloor;

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
        <DepthBars bars={bars} floor={floor.floor} />
      </Card>

      <div className="flex items-center justify-between">
        <b className="text-sm text-slate-900">Floor: {fmt(floor.floor)} reads</b>
        <RecBadge label={`${floor.n_flagged}/${floor.n_total} flagged`} />
      </div>
      {floor.n_flagged > 0 && (
        <p className="text-xs text-slate-500">
          Flagged: {floor.flagged.slice(0, 12).join(", ")}
          {floor.flagged.length > 12 ? ` +${floor.flagged.length - 12} more` : ""}
        </p>
      )}
    </div>
  );
}
