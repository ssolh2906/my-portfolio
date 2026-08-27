import type { GutPilotBundle } from "@/lib/gut-pilot";
import { Stat } from "../shared";

type ParseReport = {
  status: string;
  n_samples: number;
  n_features: number;
  count_range: { min: number; max: number };
  library_depth_range: { min: number; max: number };
  taxonomy: { format: string; deepest_rank_observed: string; n_otus_unassigned_at_genus: number };
  metadata: { supplied: boolean; matched_samples: number; n_rows: number };
  summary: string;
};

export default function UploadStep({ bundle }: { bundle: GutPilotBundle }) {
  const pr = bundle.session.parse_report as unknown as ParseReport | null;
  if (!pr) return null;

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
