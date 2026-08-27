"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { GutPilotBundle } from "@/lib/gut-pilot";
import { Card, GateNote, RecBadge, RunContextStrip, SectionHeading, Stat, fmt, pct } from "../shared";
import { useToast } from "../Toast";

const GROUP_COLOR = ["#3b82f6", "#e4734f", "#009a9b", "#8b5cf6"];
const METRICS = [
  { id: "bray", label: "Bray-Curtis" },
  { id: "jaccard", label: "Jaccard" },
  { id: "aitchison", label: "Aitchison" },
];

// Renders the real 490x490 (or however many samples are in the comparison)
// distance matrix as a heatmap. Canvas, not SVG — one <rect> per cell would
// be hundreds of thousands of DOM nodes for a run this size; a canvas draws
// the same data as one ImageData blob.
function DistanceHeatmap({ bundle }: { bundle: GutPilotBundle }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { samples, values } = bundle.beta.distance_matrix;
  const groups = bundle.beta.groups;
  const groupNames = Object.keys(groups);
  const groupOf = useMemo(() => {
    const m = new Map<string, string>();
    Object.entries(groups).forEach(([g, ids]) => ids.forEach((id) => m.set(id, g)));
    return m;
  }, [groups]);

  // Only the samples in the actual comparison (same filter PcoaScatter
  // uses), reordered so each group is a contiguous block — that's what
  // turns the matrix into a readable within/between-group pattern instead
  // of visual noise in whatever order the export happened to list samples.
  const order = useMemo(() => {
    const filtered = samples
      .map((id, i) => ({ id, i }))
      .filter((s) => groupOf.has(s.id))
      .sort((a, b) => groupNames.indexOf(groupOf.get(a.id)!) - groupNames.indexOf(groupOf.get(b.id)!));
    return filtered.map((s) => s.i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [samples, groupOf]);
  const n = order.length;

  const boundaries = useMemo(() => {
    const bounds: number[] = [];
    let prevGroup: string | null = null;
    order.forEach((origIdx, i) => {
      const g = groupOf.get(samples[origIdx])!;
      if (prevGroup !== null && g !== prevGroup) bounds.push(i / n);
      prevGroup = g;
    });
    return bounds;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order]);

  const [hover, setHover] = useState<{ a: string; b: string; v: number; x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || n === 0) return;
    canvas.width = n;
    canvas.height = n;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const v = values[order[i]][order[j]];
        if (v < min) min = v;
        if (v > max) max = v;
      }
    }
    const img = ctx.createImageData(n, n);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const v = values[order[i]][order[j]];
        const t = max > min ? (v - min) / (max - min) : 0;
        const r = Math.round(239 - t * (239 - 30));
        const g = Math.round(246 - t * (246 - 64));
        const b = Math.round(255 - t * (255 - 175));
        const idx = (i * n + j) * 4;
        img.data[idx] = r;
        img.data[idx + 1] = g;
        img.data[idx + 2] = b;
        img.data[idx + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }, [n, order, values]);

  function onMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas || n === 0) return;
    const rect = canvas.getBoundingClientRect();
    const i = Math.min(n - 1, Math.max(0, Math.floor(((e.clientY - rect.top) / rect.height) * n)));
    const j = Math.min(n - 1, Math.max(0, Math.floor(((e.clientX - rect.left) / rect.width) * n)));
    setHover({ a: samples[order[i]], b: samples[order[j]], v: values[order[i]][order[j]], x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  return (
    <Card>
      <div className="flex items-center justify-between">
        <b className="text-sm text-slate-900">Sample distance matrix</b>
        <span className="text-xs text-slate-500">
          {fmt(n)} × {fmt(n)} samples, {bundle.beta.metric}
        </span>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        Darker = more different. Rows/columns are grouped by cohort so within- vs between-group distance stands out
        as blocks. Hover a cell for the exact pair.
      </p>
      <div className="relative mt-3">
        <canvas
          ref={canvasRef}
          onMouseMove={onMove}
          onMouseLeave={() => setHover(null)}
          className="aspect-square w-full rounded-lg [image-rendering:pixelated]"
        />
        {boundaries.flatMap((f) => [
          <div key={`v-${f}`} className="pointer-events-none absolute top-0 h-full w-px bg-white/70" style={{ left: `${f * 100}%` }} />,
          <div key={`h-${f}`} className="pointer-events-none absolute left-0 w-full h-px bg-white/70" style={{ top: `${f * 100}%` }} />,
        ])}
        {hover && (
          <div
            className="pointer-events-none absolute z-10 rounded-md bg-slate-900 px-2 py-1 font-mono text-[10px] whitespace-nowrap text-white shadow-lg"
            style={{ left: hover.x + 10, top: hover.y + 10 }}
          >
            {hover.a} × {hover.b}: {hover.v.toFixed(3)}
          </div>
        )}
      </div>
      <div className="mt-3 flex items-center gap-3">
        <span className="text-[10px] text-slate-400">near</span>
        <div className="h-2 flex-1 rounded-full" style={{ background: "linear-gradient(to right, rgb(239,246,255), rgb(30,64,175))" }} />
        <span className="text-[10px] text-slate-400">far</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-3">
        {groupNames.map((g, i) => (
          <span key={g} className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="h-2 w-2 rounded-full" style={{ background: GROUP_COLOR[i % GROUP_COLOR.length] }} />
            {g}
          </span>
        ))}
      </div>
    </Card>
  );
}

function PcoaScatter({ bundle }: { bundle: GutPilotBundle }) {
  const { coords, proportion_explained } = bundle.beta.pcoa;
  const groups = bundle.beta.groups;
  const groupOf = new Map<string, string>();
  Object.entries(groups).forEach(([g, ids]) => ids.forEach((id) => groupOf.set(id, g)));
  const groupNames = Object.keys(groups);

  // Ordination is computed on every sample, but G1 may exclude some levels
  // from the actual comparison (e.g. Baxter's "nonCRC" group) — plot only
  // the samples in the comparison, so an unassigned sample doesn't render
  // as an unlabeled/misleadingly-colored dot.
  const plotted = Object.entries(coords).filter(([id]) => groupOf.has(id));
  const xs = plotted.map(([, c]) => c.PC1);
  const ys = plotted.map(([, c]) => c.PC2);
  const xMin = Math.min(...xs), xMax = Math.max(...xs);
  const yMin = Math.min(...ys), yMax = Math.max(...ys);
  const W = 420, H = 340, PAD = 24;
  const sx = (v: number) => PAD + ((v - xMin) / (xMax - xMin || 1)) * (W - 2 * PAD);
  const sy = (v: number) => H - PAD - ((v - yMin) / (yMax - yMin || 1)) * (H - 2 * PAD);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto w-full max-w-md" role="img" aria-label="PCoA ordination">
      <line x1={PAD} x2={W - PAD} y1={H / 2} y2={H / 2} stroke="#f1f5f9" />
      <line x1={W / 2} x2={W / 2} y1={PAD} y2={H - PAD} stroke="#f1f5f9" />
      {plotted.map(([id, c]) => {
        const idx = groupNames.indexOf(groupOf.get(id)!);
        return <circle key={id} cx={sx(c.PC1)} cy={sy(c.PC2)} r={3} fill={GROUP_COLOR[idx % GROUP_COLOR.length]} fillOpacity={0.75} />;
      })}
      <text x={W - PAD} y={H - 6} fontSize="9" textAnchor="end" fill="#94a3b8">
        PC1 ({pct(proportion_explained.PC1)})
      </text>
      <text x={6} y={PAD} fontSize="9" fill="#94a3b8">
        PC2 ({pct(proportion_explained.PC2)})
      </text>
    </svg>
  );
}

export default function BetaStep({ bundle, onAdvance }: { bundle: GutPilotBundle; onAdvance?: () => void }) {
  const notify = useToast();
  const g9 = bundle.betaMetric;
  const pn = bundle.beta.permanova;
  const groupNames = Object.keys(bundle.beta.groups);

  return (
    <div className="flex flex-col gap-6">
      <SectionHeading
        title="Beta diversity distance metric (G9)"
        lede="What 'different' means between two samples — the metric choice, PERMANOVA test, and the ordination it produces."
      />

      <RunContextStrip bundle={bundle} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          {METRICS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => notify()}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors duration-200 hover:border-blue-300 ${
                m.id === bundle.beta.metric ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-500"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <RecBadge label={g9.recommendation.label} />
      </div>

      <GateNote html={g9.note.message} />

      <div className="grid gap-4 sm:grid-cols-[1fr_260px]">
        <Card>
          <PcoaScatter bundle={bundle} />
          <div className="mt-3 flex justify-center gap-4">
            {groupNames.map((g, i) => (
              <span key={g} className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="h-2 w-2 rounded-full" style={{ background: GROUP_COLOR[i % GROUP_COLOR.length] }} />
                {g}
              </span>
            ))}
          </div>
        </Card>
        <Card>
          <dl className="flex flex-col gap-3">
            <Stat label="PERMANOVA R²" value={pn.r2.toFixed(4)} />
            <Stat label="PERMANOVA p" value={pn.p.toFixed(3)} />
            <Stat label="Permutations" value={pn.permutations} />
            <Stat label="Dispersion p" value={pn.dispersion_p.toFixed(3)} />
            <Stat label="Sparsity" value={pct(g9.sparsity)} />
          </dl>
        </Card>
      </div>

      <DistanceHeatmap bundle={bundle} />

      {bundle.beta.metric_mismatch_warning && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          {bundle.beta.metric_mismatch_warning}
        </p>
      )}

      <button
        type="button"
        onClick={() => onAdvance?.()}
        className="self-start rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-700"
      >
        Approve and compute
      </button>
    </div>
  );
}
