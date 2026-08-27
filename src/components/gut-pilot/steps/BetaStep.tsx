"use client";

import type { GutPilotBundle } from "@/lib/gut-pilot";
import { Card, GateNote, RecBadge, SectionHeading, Stat, pct } from "../shared";
import { useToast } from "../Toast";

const GROUP_COLOR = ["#3b82f6", "#e4734f", "#009a9b", "#8b5cf6"];
const METRICS = [
  { id: "bray", label: "Bray-Curtis" },
  { id: "jaccard", label: "Jaccard" },
  { id: "aitchison", label: "Aitchison" },
];

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
