"use client";

import type { GutPilotBundle } from "@/lib/gut-pilot";
import { Card, GateNote, RecBadge, SectionHeading, Stat, fmt } from "../shared";
import { useToast } from "../Toast";

type G1 = {
  recommendation: { label: string };
  selected_column: string;
  comparison_levels: string[];
  excluded_levels: string[];
  exclusion_rationale: string | null;
  group_counts: Record<string, number>;
  note_message: string;
  human_confirmation_required: boolean;
};
type G2 = { recommendation: { label: string }; status: string; note_message: string };
type G3 = {
  recommendation: { label: string };
  subject_id_variable: string | null;
  n_subjects: number;
  n_samples: number;
  repeated_subjects: number;
  note_message: string;
};

export default function DesignStep({ bundle }: { bundle: GutPilotBundle }) {
  const notify = useToast();
  const g1 = bundle.studyDesign.g1 as unknown as G1;
  const g2 = bundle.studyDesign.g2 as unknown as G2;
  const g3 = bundle.studyDesign.g3 as unknown as G3;
  const g4 = bundle.designRank;

  return (
    <div className="flex flex-col gap-6">
      <SectionHeading
        title="Study design (G1–G4)"
        lede="Four gates decide what's actually being compared, before any diversity or abundance number is computed."
      />

      <div>
        <div className="mb-2 flex items-center justify-between">
          <b className="text-sm text-slate-900">G1 · Group definition</b>
          <RecBadge label={g1.recommendation.label} />
        </div>
        <Card>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
            <Stat label="Grouping column" value={g1.selected_column} />
            <Stat label="Comparison" value={g1.comparison_levels.join(" vs. ")} />
            <Stat
              label="Group counts"
              value={Object.entries(g1.group_counts)
                .map(([k, v]) => `${k} ${fmt(v)}`)
                .join(" · ")}
            />
          </dl>
        </Card>
        <GateNote html={g1.note_message} />
        {g1.excluded_levels.length > 0 && (
          <p className="mt-2 text-xs text-slate-500">
            Excluded from the comparison: <b>{g1.excluded_levels.join(", ")}</b>. {g1.exclusion_rationale}
          </p>
        )}
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <b className="text-sm text-slate-900">G2 · Batch confounding</b>
          <RecBadge label={g2.recommendation.label} />
        </div>
        <GateNote html={g2.note_message} />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <b className="text-sm text-slate-900">G3 · Sample independence</b>
          <RecBadge label={g3.recommendation.label} />
        </div>
        <Card>
          <dl className="grid grid-cols-3 gap-4">
            <Stat label="Subjects" value={fmt(g3.n_subjects)} />
            <Stat label="Samples" value={fmt(g3.n_samples)} />
            <Stat label="Repeated subjects" value={fmt(g3.repeated_subjects)} />
          </dl>
        </Card>
        <GateNote html={g3.note_message} />
      </div>

      {g4 && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <b className="text-sm text-slate-900">G4 · Taxonomic rank</b>
            <RecBadge label={g4.recommendation.label} />
          </div>
          <div className="flex gap-2">
            {g4.ranks.map((r) => (
              <button
                key={r.option_id}
                type="button"
                onClick={() => notify()}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors duration-200 hover:border-blue-300 ${
                  r.option_id === g4.rank ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-500"
                }`}
              >
                {r.label} · {fmt(r.feature_count)} features
              </button>
            ))}
          </div>
          <GateNote html={g4.recommendation.rationale} />
        </div>
      )}

      <button
        type="button"
        onClick={() => notify()}
        className="self-start rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-700"
      >
        Confirm design
      </button>
    </div>
  );
}
