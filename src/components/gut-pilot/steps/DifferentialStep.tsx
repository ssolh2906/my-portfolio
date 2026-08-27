"use client";

import { useState } from "react";
import type { GutPilotBundle } from "@/lib/gut-pilot";
import { GateNote, RecBadge, SectionHeading, Stat, fmt } from "../shared";

const STATUS_STYLE: Record<string, string> = {
  confirmed: "bg-emerald-50 text-emerald-700",
  missing: "bg-amber-50 text-amber-700",
  novel: "bg-violet-50 text-violet-700",
  not_significant: "bg-slate-100 text-slate-500",
};

export default function DifferentialStep({ bundle }: { bundle: GutPilotBundle }) {
  const g10 = bundle.daPrevalence;
  const thresholds = Object.keys(bundle.daResultsByThreshold);
  const [threshold, setThreshold] = useState(g10.recommendation.value != null ? String(g10.recommendation.value) : thresholds[1]);
  const da = bundle.daResultsByThreshold[threshold] ?? bundle.daResultsByThreshold[thresholds[0]];

  const topGenera = Object.entries(da.genera)
    .filter(([, v]) => v.significant)
    .sort((a, b) => a[1].q - b[1].q)
    .slice(0, 10);

  return (
    <div className="flex flex-col gap-6">
      <SectionHeading
        title="Differential abundance (G10)"
        lede="Prevalence filter decides how many features are tested — and therefore how strict the multiple-testing correction has to be."
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1.5 rounded-full border border-slate-200 bg-white p-1">
          {thresholds.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setThreshold(t)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors duration-200 ${
                t === threshold ? "bg-blue-600 text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {Number(t) * 100}%
            </button>
          ))}
        </div>
        <RecBadge label={g10.recommendation.label} />
      </div>

      <GateNote html={g10.note.message} />

      <dl className="grid grid-cols-3 gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-5">
        <Stat label="Features tested" value={`${fmt(da.n_tested)} / ${fmt(da.n_total)}`} />
        <Stat label="Significant" value={fmt(da.n_significant)} />
        <Stat label="Groups" value={Object.entries(da.group_counts).map(([k, v]) => `${k} ${v}`).join(" · ")} />
      </dl>

      {da.known_taxa.length > 0 && (
        <div>
          <b className="text-sm text-slate-900">Known-taxa cross-check</b>
          <p className="mt-0.5 text-xs text-slate-500">Does this run reproduce genera the literature already expects?</p>
          <div className="mt-2 overflow-x-auto rounded-2xl border border-slate-200/80">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Genus</th>
                  <th className="px-4 py-2.5 font-medium">Literature</th>
                  <th className="px-4 py-2.5 font-medium">This run</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {da.known_taxa.map((k) => (
                  <tr key={k.taxon_genus}>
                    <td className="px-4 py-2.5 font-medium text-slate-900 italic">{k.taxon_genus}</td>
                    <td className="px-4 py-2.5 text-slate-600">{k.literature_direction}</td>
                    <td className="px-4 py-2.5 text-slate-600">{k.this_run_direction}</td>
                    <td className="px-4 py-2.5">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[k.status] ?? "bg-slate-100 text-slate-600"}`}>
                        {k.status.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {topGenera.length > 0 && (
        <div>
          <b className="text-sm text-slate-900">Top significant genera (by q-value)</b>
          <ul className="mt-2 flex flex-col gap-1.5">
            {topGenera.map(([name, v]) => (
              <li key={name} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-1.5 text-xs">
                <span className="font-medium text-slate-900 italic">{name}</span>
                <span className="text-slate-500">
                  log2FC {v.lfc.toFixed(2)} · q {v.q.toExponential(2)} · higher in {v.direction}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
