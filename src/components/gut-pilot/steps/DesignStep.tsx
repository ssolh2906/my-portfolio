"use client";

import { useMemo, useState } from "react";
import type { GutPilotBundle } from "@/lib/gut-pilot";
import { Card, GateNote, Opt, OptRow, RecBadge, SectionHeading, Stat, fmt } from "../shared";

type G1 = {
  recommendation: { option_id: string; label: string };
  selected_column: string;
  comparison_levels: string[];
  excluded_levels: string[];
  exclusion_rationale: string | null;
  group_counts: Record<string, number>;
  note_message: string;
  human_confirmation_required: boolean;
};
type G2 = { recommendation: { option_id: string; label: string }; status: string; note_message: string };
type G3 = {
  recommendation: { option_id: string; label: string };
  subject_id_variable: string | null;
  n_subjects: number;
  n_samples: number;
  repeated_subjects: number;
  note_message: string;
};

const G2_LABEL: Record<string, string> = {
  covariate: "PERMANOVA models batch alongside group",
  stratify: "Permutes within batch only",
  none: "Results carry a confounding caveat",
};
const G2_TITLE: Record<string, string> = {
  covariate: "Include batch as a covariate",
  stratify: "Stratify permutations by batch",
  none: "Proceed and record the risk",
};

export default function DesignStep({ bundle, onAdvance }: { bundle: GutPilotBundle; onAdvance?: () => void }) {
  const g1 = bundle.studyDesign.g1 as unknown as G1;
  const g2 = bundle.studyDesign.g2 as unknown as G2;
  const g3 = bundle.studyDesign.g3 as unknown as G3;
  const g4 = bundle.designRank;

  const [groupSource, setGroupSource] = useState<"inferred" | "manual" | "none">("inferred");
  const [batchHandling, setBatchHandling] = useState(g2.recommendation.option_id);
  const pairedAvailable = !!g3.subject_id_variable && g3.repeated_subjects > 0;
  const [pairing, setPairing] = useState<"independent" | "paired">(
    g3.recommendation.option_id === "paired" ? "paired" : "independent",
  );
  const [selectedRank, setSelectedRank] = useState(g4?.rank);

  // Seeds the manual-assignment grid from the same real per-sample group
  // membership the rest of the run uses (bundle.alpha.groups), so toggling a
  // chip starts from the actual data rather than a blank slate. Samples not
  // present in either comparison level (e.g. an excluded metadata level)
  // default to the first level.
  const [levels] = useState(() => g1.comparison_levels.slice(0, 2));
  const initialManual = useMemo(() => {
    const map: Record<string, string> = {};
    const groups = bundle.alpha.groups;
    for (const id of bundle.session.sample_ids) {
      const hit = Object.entries(groups).find(([, ids]) => ids.includes(id));
      map[id] = hit ? hit[0] : levels[0];
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [manualGroups, setManualGroups] = useState(initialManual);
  const manualCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const g of Object.values(manualGroups)) counts[g] = (counts[g] ?? 0) + 1;
    return counts;
  }, [manualGroups]);

  function toggleSample(id: string) {
    setManualGroups((prev) => {
      const current = prev[id];
      const idx = levels.indexOf(current);
      const nextLevel = levels[(idx + 1) % levels.length] ?? levels[0];
      return { ...prev, [id]: nextLevel };
    });
  }

  const g1Note =
    groupSource === "none"
      ? "<b>Single-cohort mode.</b> Every group comparison is switched off: alpha diversity group tests, PERMANOVA, and differential abundance. The descriptive panels still run: depth, composition, per-sample alpha, and the distance matrix all stay available."
      : groupSource === "manual"
        ? `Manual assignment. Click any sample to move it between groups. Current split: ${Object.entries(manualCounts)
            .map(([k, v]) => `<b>${k} ${v}</b>`)
            .join(" and ")}.`
        : g1.note_message;

  return (
    <div className="flex flex-col gap-6">
      <SectionHeading
        title="Study design (G1–G4)"
        lede="Four gates decide what's being compared, before any diversity or abundance number is computed."
      />

      <div>
        <div className="mb-2 flex items-center justify-between">
          <b className="text-sm text-slate-900">G1 · Group definition</b>
          <RecBadge label={g1.recommendation.label} />
        </div>
        <OptRow>
          <Opt
            pressed={groupSource === "inferred"}
            recommended={g1.recommendation.option_id === "metadata"}
            onClick={() => setGroupSource("inferred")}
            title={g1.selected_column}
          >
            {Object.entries(g1.group_counts)
              .map(([k, v]) => `${k} ${fmt(v)}`)
              .join(" · ")}
          </Opt>
          <Opt pressed={groupSource === "manual"} onClick={() => setGroupSource("manual")} title="Assign groups manually">
            Edit the assignment sample by sample
          </Opt>
          <Opt pressed={groupSource === "none"} onClick={() => setGroupSource("none")} title="No grouping, single cohort">
            Descriptive panels only, all group comparisons disabled
          </Opt>
        </OptRow>

        {groupSource === "inferred" && (
          <Card className="mt-3">
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
        )}

        {groupSource === "manual" && (
          <div className="mt-3 flex max-h-56 flex-wrap gap-1.5 overflow-y-auto rounded-xl border border-slate-200/80 bg-slate-50/60 p-3">
            {bundle.session.sample_ids.map((id) => {
              const g = manualGroups[id];
              const idx = levels.indexOf(g);
              const color = idx === 0 ? "#3b82f6" : "#e4734f";
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleSample(id)}
                  title={`${id} — ${g} (click to switch)`}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 font-mono text-[10px] text-slate-600 transition-colors duration-150 hover:border-blue-300"
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
                  {id}
                </button>
              );
            })}
          </div>
        )}

        <GateNote html={g1Note} />
        {groupSource === "inferred" && g1.excluded_levels.length > 0 && (
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
        <OptRow>
          {(["covariate", "stratify", "none"] as const).map((opt) => (
            <Opt
              key={opt}
              pressed={batchHandling === opt}
              recommended={g2.recommendation.option_id === opt}
              onClick={() => setBatchHandling(opt)}
              title={G2_TITLE[opt]}
            >
              {G2_LABEL[opt]}
            </Opt>
          ))}
        </OptRow>
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
        <OptRow>
          <Opt pressed={pairing === "independent"} recommended={g3.recommendation.option_id === "independent"} onClick={() => setPairing("independent")} title="Independent samples">
            Wilcoxon rank-sum, unrestricted permutations
          </Opt>
          <Opt
            pressed={pairing === "paired"}
            recommended={g3.recommendation.option_id === "paired"}
            disabled={!pairedAvailable}
            onClick={() => setPairing("paired")}
            title="Paired or repeated measures"
          >
            {pairedAvailable
              ? "Wilcoxon signed-rank, subject-restricted permutations"
              : g3.subject_id_variable
                ? `${g3.subject_id_variable} shows no repeated subjects, so paired tests cannot be executed`
                : "No subject identifier column was found, so paired tests cannot be executed"}
          </Opt>
        </OptRow>
      </div>

      {g4 && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <b className="text-sm text-slate-900">G4 · Taxonomic rank</b>
            <RecBadge label={g4.recommendation.label} />
          </div>
          <OptRow>
            {g4.ranks.map((r) => (
              <Opt
                key={r.option_id}
                pressed={selectedRank === r.option_id}
                recommended={r.option_id === g4.recommendation.option_id}
                disabled={!r.available}
                onClick={() => setSelectedRank(r.option_id)}
                title={r.label}
              >
                {fmt(r.feature_count)} features
              </Opt>
            ))}
          </OptRow>
          <GateNote html={g4.recommendation.rationale} />
        </div>
      )}

      <button
        type="button"
        onClick={() => onAdvance?.()}
        className="self-start rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-700"
      >
        Confirm design
      </button>
    </div>
  );
}
