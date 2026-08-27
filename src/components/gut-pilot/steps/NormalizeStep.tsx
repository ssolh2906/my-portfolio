"use client";

import { useMemo, useState } from "react";
import type { GutPilotBundle } from "@/lib/gut-pilot";
import { Card, GateNote, RecBadge, SectionHeading, fmt, pct } from "../shared";
import { useToast } from "../Toast";

const OPTION_COLOR: Record<string, string> = {
  rarefy: "bg-blue-500",
  css: "bg-teal-500",
  clr: "bg-violet-500",
};

const GROUP_PALETTE = ["#3b82f6", "#e4734f", "#009a9b", "#8b5cf6"];

// Same interpolation the source app uses to read a curve's richness at an
// arbitrary depth between its sampled points (RareChart's richnessAtDepth).
function richnessAtDepth(curve: [number, number][], depth: number): number {
  if (depth <= curve[0][0]) return curve[0][1];
  for (let i = 1; i < curve.length; i++) {
    if (depth <= curve[i][0]) {
      const [d0, r0] = curve[i - 1];
      const [d1, r1] = curve[i];
      return d1 === d0 ? r1 : r0 + ((r1 - r0) * (depth - d0)) / (d1 - d0);
    }
  }
  return curve[curve.length - 1][1];
}

function RarefactionCurves({ bundle }: { bundle: GutPilotBundle }) {
  const samples = bundle.rarefactionCurves.samples;
  const suggested = bundle.rarefactionCurves.suggested_threshold;
  const [threshold, setThreshold] = useState(suggested);

  const groupNames = useMemo(() => [...new Set(samples.map((s) => s.group))].sort(), [samples]);
  const groupColor = (g: string) => GROUP_PALETTE[groupNames.indexOf(g) % GROUP_PALETTE.length];

  // Slider range follows this run's real depth distribution (90th
  // percentile, same reasoning as the source app) rather than a fixed
  // band, so one long-tail outlier doesn't compress every other curve.
  const sliderMax = useMemo(() => {
    const depths = samples.map((s) => s.depth).sort((a, b) => a - b);
    const p90 = depths[Math.floor(0.9 * (depths.length - 1))] ?? 10000;
    return Math.max(2000, Math.ceil(p90 / 500) * 500);
  }, [samples]);

  const kept = samples.filter((s) => s.depth >= threshold);

  const W = 640, H = 260, L = 46, R = 12, T = 10, B = 24;
  const pw = W - L - R, ph = H - T - B;
  const maxR =
    Math.max(...samples.map((s) => Math.max(...s.curve.filter((p) => p[0] <= sliderMax).map((p) => p[1])))) * 1.05 || 1;
  const x = (v: number) => L + (v / sliderMax) * pw;
  const y = (v: number) => T + ph - (v / maxR) * ph;

  return (
    <Card>
      <div className="flex items-center justify-between">
        <b className="text-sm text-slate-900">Rarefaction curves (G7)</b>
        <span className="text-xs text-slate-500">{fmt(samples.length)} samples, real per-sample curves</span>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        Drag the threshold — dimmed curves fall below it and would be excluded at that depth. This recomputes live
        against the real per-sample data, no different from the source app.
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 w-full" role="img" aria-label="Rarefaction curves">
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <line key={f} x1={L} x2={W - R} y1={T + ph - f * ph} y2={T + ph - f * ph} stroke="#f1f5f9" />
        ))}
        {samples.map((s) => {
          const out = s.depth < threshold;
          const d = s.curve
            .filter((p) => p[0] <= sliderMax)
            .map(([dd, rr], i) => (i ? "L" : "M") + x(dd).toFixed(1) + " " + y(rr).toFixed(1))
            .join(" ");
          return (
            <path
              key={s.id}
              d={d}
              fill="none"
              stroke={groupColor(s.group)}
              strokeWidth={1.2}
              strokeOpacity={out ? 0.15 : 0.75}
            >
              <title>
                {s.id} ({s.group}) — {fmt(s.depth)} reads max, richness at {fmt(threshold)} ≈{" "}
                {richnessAtDepth(s.curve, Math.min(threshold, s.depth)).toFixed(1)}
                {out ? " — excluded at current threshold" : ""}
              </title>
            </path>
          );
        })}
        <line x1={x(threshold)} x2={x(threshold)} y1={T} y2={H - B} stroke="#0f172a" strokeWidth={1.4} strokeDasharray="5 3" />
        <line x1={L} x2={L} y1={T} y2={H - B} stroke="#cbd5e1" />
        <line x1={L} x2={W - R} y1={H - B} y2={H - B} stroke="#cbd5e1" />
        <text x={W - R} y={H - 6} fontSize="9" textAnchor="end" fill="#94a3b8">
          reads sampled →
        </text>
      </svg>

      <div className="mt-4 flex items-center gap-4">
        {groupNames.map((g) => (
          <span key={g} className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="h-2 w-2 rounded-full" style={{ background: groupColor(g) }} />
            {g}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-4">
        <input
          type="range"
          min={500}
          max={sliderMax}
          step={50}
          value={threshold}
          aria-label="Rarefaction depth threshold"
          onChange={(e) => setThreshold(Number(e.target.value))}
          className="h-2 flex-1 cursor-pointer accent-blue-600"
        />
        <span className="w-28 shrink-0 text-right font-mono text-sm font-semibold text-slate-900">{fmt(threshold)} reads</span>
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
        <span>
          <b className="text-slate-900">{fmt(kept.length)}</b> of {fmt(samples.length)} samples retained
        </span>
        <button
          type="button"
          onClick={() => setThreshold(suggested)}
          className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition-colors duration-200 hover:border-blue-300 hover:text-blue-700"
        >
          Reset to proposal ({fmt(suggested)})
        </button>
      </div>
    </Card>
  );
}

export default function NormalizeStep({ bundle }: { bundle: GutPilotBundle }) {
  const g6 = bundle.normalizeStrategy;
  const notify = useToast();

  return (
    <div className="flex flex-col gap-6">
      <SectionHeading
        title="Normalization strategy (G6)"
        lede="The least methodologically settled step in the pipeline — rarefaction, CSS, and CLR each trade off differently, and the literature genuinely disagrees."
      />

      <div className="flex items-center justify-between">
        <b className="text-sm text-slate-900">Applied: {g6.strategy}</b>
        <RecBadge label={g6.recommendation.label} />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {g6.options.map((o) => {
          const r = o.retention_preview;
          const frac = r.total ? r.retained / r.total : 0;
          const applied = o.option_id === g6.strategy;
          return (
            <button
              key={o.option_id}
              type="button"
              onClick={() => notify()}
              className={`rounded-2xl border p-5 text-left transition-colors duration-200 hover:border-blue-300 ${
                o.option_id === g6.recommendation.option_id ? "border-blue-500 ring-1 ring-blue-500" : "border-slate-200/80"
              } bg-slate-50/60`}
            >
              <div className="flex items-center justify-between">
                <b className="text-sm text-slate-900">{o.label}</b>
                {applied && <span className="text-[10px] font-semibold tracking-wide text-blue-600 uppercase">Applied</span>}
              </div>
              <p className="mt-1 text-xs text-slate-500">{o.summary}</p>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div className={`h-full ${OPTION_COLOR[o.option_id]}`} style={{ width: `${frac * 100}%` }} />
              </div>
              <p className="mt-1.5 text-xs text-slate-500">
                {fmt(r.retained)}/{fmt(r.total)} retained ({pct(frac)})
              </p>
            </button>
          );
        })}
      </div>

      <GateNote html={g6.note.message} />

      <RarefactionCurves bundle={bundle} />

      <div>
        <b className="text-sm text-slate-900">The three-way debate</b>
        <div className="mt-2 flex flex-col gap-2">
          {g6.positions.map((p) => (
            <div key={p.side} className="rounded-xl border border-slate-200 p-3">
              <span className="text-[10px] font-semibold tracking-wide text-slate-400 uppercase">{p.side}</span>
              <p className="mt-1 text-xs leading-relaxed text-slate-700">{p.claim}</p>
              {p.quote ? (
                <p className="mt-1.5 border-l-2 border-blue-200 pl-2 text-xs text-slate-500 italic">
                  &ldquo;{p.quote}&rdquo; ({p.line_ref})
                </p>
              ) : (
                <p className="mt-1.5 text-[11px] text-slate-400">No verified excerpt (Paperclip unavailable at export time).</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => notify()}
        className="self-start rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-700"
      >
        Confirm strategy
      </button>
    </div>
  );
}
