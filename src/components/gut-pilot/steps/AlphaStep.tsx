import type { GutPilotBundle } from "@/lib/gut-pilot";
import { Card, GateNote, RecBadge, SectionHeading, Stat } from "../shared";

const METRICS = ["Observed_taxa", "Shannon", "Simpson", "Chao1", "Pielou_evenness"];

function groupMean(bundle: GutPilotBundle, metric: string, group: string): number | null {
  const ids = bundle.alpha.groups[group] ?? [];
  const vals = ids.map((id) => bundle.alpha.metrics[id]?.[metric]).filter((v): v is number => v != null);
  if (!vals.length) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export default function AlphaStep({ bundle }: { bundle: GutPilotBundle }) {
  const g8 = bundle.alphaSignificance;
  const groupNames = Object.keys(bundle.alpha.groups);
  const alphaLevel = Number(g8.recommendation.alpha_level.option_id);

  return (
    <div className="flex flex-col gap-6">
      <SectionHeading
        title="Alpha diversity significance (G8)"
        lede="Within-sample diversity, compared between groups — significance level and multiple-testing correction for every test on this page."
      />

      <div className="flex items-center justify-between">
        <b className="text-sm text-slate-900">
          α = {g8.recommendation.alpha_level.option_id}, {g8.recommendation.correction.label}
        </b>
        <RecBadge label={`${g8.retention_preview.retained}/${g8.retention_preview.total} retained`} />
      </div>

      <GateNote html={g8.note.message} />

      <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
        <table className="w-full min-w-[420px] text-left text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-4 py-2.5 font-medium">Metric</th>
              {groupNames.map((g) => (
                <th key={g} className="px-4 py-2.5 font-medium">
                  {g} mean
                </th>
              ))}
              <th className="px-4 py-2.5 font-medium">p-value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {METRICS.map((m) => {
              const test = bundle.alpha.group_tests[m];
              const sig = test && test.p_value < alphaLevel;
              return (
                <tr key={m}>
                  <td className="px-4 py-2.5 font-medium text-slate-900">{m.replace("_", " ")}</td>
                  {groupNames.map((g) => {
                    const mean = groupMean(bundle, m, g);
                    return (
                      <td key={g} className="px-4 py-2.5 text-slate-600">
                        {mean == null ? "—" : mean.toFixed(2)}
                      </td>
                    );
                  })}
                  <td className={`px-4 py-2.5 font-mono text-xs ${sig ? "font-semibold text-blue-700" : "text-slate-500"}`}>
                    {test ? test.p_value.toExponential(2) : "—"}
                    {sig ? " *" : ""}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {g8.group_summary && (
        <Card>
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Object.entries(g8.group_summary).map(([k, v]) => (
              <Stat key={k} label={k} value={typeof v === "object" ? JSON.stringify(v) : String(v)} />
            ))}
          </dl>
        </Card>
      )}
    </div>
  );
}
