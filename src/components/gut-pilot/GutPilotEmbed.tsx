"use client";

// GutPilotEmbed — the fixed-demo pipeline viewer, restyled in the
// portfolio's own Tailwind design language (matching Projects.tsx /
// SnpDemo.tsx) rather than porting gut-pilot's own CSS. Structure, gate
// logic, and every number shown come from the real exported bundles
// (see src/lib/gut-pilot.ts) — only the visual skin is different from the
// source app.
import { useEffect, useState } from "react";
import {
  DATASET_IDS,
  DATASET_LABELS,
  loadDataset,
  type DatasetId,
  type GutPilotBundle,
} from "@/lib/gut-pilot";

const STEPS = [
  { id: "upload", n: 1, label: "Upload" },
  { id: "design", n: 2, label: "Design" },
  { id: "qc", n: 3, label: "Raw QC" },
  { id: "rarefy", n: 4, label: "Normalize" },
  { id: "alpha", n: 5, label: "Alpha" },
  { id: "beta", n: 6, label: "Beta" },
  { id: "da", n: 7, label: "Differential" },
  { id: "refs", n: 8, label: "Summary" },
] as const;
type StepId = (typeof STEPS)[number]["id"];

export default function GutPilotEmbed() {
  const [dataset, setDataset] = useState<DatasetId>("crc_baxter");
  const [step, setStep] = useState<StepId>("upload");
  const [bundle, setBundle] = useState<GutPilotBundle | null>(null);
  const [loading, setLoading] = useState(true);

  // Resetting loading/bundle synchronously here (not just in the .then) is
  // what makes switching datasets show a loading state immediately instead
  // of briefly flashing the previous dataset's numbers under the new label.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setBundle(null);
    loadDataset(dataset).then((b) => {
      if (!cancelled) {
        setBundle(b);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [dataset]);
  /* eslint-enable react-hooks/set-state-in-effect */

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
      {/* header */}
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-200/80 bg-slate-50/60 px-5 py-3.5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold tracking-wide text-blue-700 uppercase">
          Fixed demo
        </span>
        <div className="ml-auto flex gap-1.5 rounded-full border border-slate-200 bg-white p-1">
          {DATASET_IDS.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setDataset(id)}
              aria-pressed={id === dataset}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors duration-200 ${
                id === dataset ? "bg-blue-600 text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {DATASET_LABELS[id]}
            </button>
          ))}
        </div>
      </div>

      {/* tab bar */}
      <nav className="flex gap-0.5 overflow-x-auto border-b border-slate-200/80 px-5" aria-label="Analysis pages">
        {STEPS.map((s) => {
          const isCurrent = s.id === step;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setStep(s.id)}
              aria-current={isCurrent ? "page" : undefined}
              className={`flex flex-none items-center gap-2 border-b-2 px-3 py-3 text-xs font-semibold whitespace-nowrap transition-colors duration-200 ${
                isCurrent ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <span
                className={`flex h-[19px] w-[19px] items-center justify-center rounded-full border font-mono text-[10px] font-bold ${
                  isCurrent ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 text-slate-500"
                }`}
              >
                {s.n}
              </span>
              {s.label}
            </button>
          );
        })}
      </nav>

      {/* body */}
      <div className="min-h-[420px] p-6 sm:p-8">
        {loading || !bundle ? (
          <div className="flex h-64 items-center justify-center text-sm text-slate-400">Loading run…</div>
        ) : step === "upload" ? (
          <UploadStep bundle={bundle} />
        ) : (
          <ComingSoonStep label={STEPS.find((s) => s.id === step)!.label} />
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-slate-900">{value}</dd>
    </div>
  );
}

function UploadStep({ bundle }: { bundle: GutPilotBundle }) {
  const pr = bundle.session.parse_report as {
    status: string;
    n_samples: number;
    n_features: number;
    count_range: { min: number; max: number };
    library_depth_range: { min: number; max: number };
    taxonomy: { format: string; deepest_rank_observed: string; n_otus_unassigned_at_genus: number };
    metadata: { supplied: boolean; matched_samples: number; n_rows: number };
    summary: string;
  } | null;

  if (!pr) return <ComingSoonStep label="Upload" />;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-lg font-semibold tracking-tight text-slate-900">Real ingestion, not simulated</h3>
        <p className="mt-1 max-w-[65ch] text-sm text-slate-600">
          A genuine MicrobiomeHD-format count table was parsed server-side for this run — the numbers below are
          gut-pilot&rsquo;s own validation report, not placeholder text.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          {pr.status}
        </span>
        <span className="text-sm text-slate-600">{pr.summary}</span>
      </div>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-5 sm:grid-cols-4">
        <Stat label="Samples" value={pr.n_samples.toLocaleString("en-US")} />
        <Stat label="Raw OTU features" value={pr.n_features.toLocaleString("en-US")} />
        <Stat label="Count range" value={`${pr.count_range.min}–${pr.count_range.max.toLocaleString("en-US")}`} />
        <Stat
          label="Library depth range"
          value={`${pr.library_depth_range.min.toLocaleString("en-US")}–${pr.library_depth_range.max.toLocaleString("en-US")}`}
        />
        <Stat label="Taxonomy" value={pr.taxonomy.deepest_rank_observed + " (deepest observed)"} />
        <Stat label="Unassigned at genus" value={pr.taxonomy.n_otus_unassigned_at_genus.toLocaleString("en-US")} />
        <Stat
          label="Metadata"
          value={pr.metadata.supplied ? `${pr.metadata.matched_samples}/${pr.metadata.n_rows} samples joined` : "not supplied"}
        />
        <Stat label="Session" value={bundle.session.session_id} />
      </dl>

      <p className="text-xs leading-relaxed text-slate-400">{pr.taxonomy.format}</p>
    </div>
  );
}

function ComingSoonStep({ label }: { label: string }) {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-2 text-center">
      <p className="text-sm font-medium text-slate-500">{label} step — being ported next.</p>
      <p className="max-w-[40ch] text-xs text-slate-400">
        The real data for this step is already in the bundle; this panel just isn&rsquo;t built yet.
      </p>
    </div>
  );
}
