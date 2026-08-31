"use client";

import { useMemo, useState } from "react";
import type { DaResults, GutPilotBundle } from "@/lib/gut-pilot";
import { Card, GateNote, RecBadge, RunContextStrip, SectionHeading, Stat, fmt } from "../shared";

const STATUS_STYLE: Record<string, string> = {
  confirmed: "bg-emerald-50 text-emerald-700",
  missing: "bg-amber-50 text-amber-700",
  novel: "bg-violet-50 text-violet-700",
  not_significant: "bg-slate-100 text-slate-500",
};

const DIR_COLOR = ["#3b82f6", "#e4734f"];

// log2FC vs -log10(q) — the standard view for "how many features moved,
// how far, and how confidently", which the stat grid and tables alone
// don't show at a glance.
function VolcanoPlot({ da }: { da: DaResults }) {
  const entries = Object.entries(da.genera);
  const directions = useMemo(() => [...new Set(entries.map(([, v]) => v.direction))].sort(), [entries]);
  const dirColor = (d: string) => DIR_COLOR[directions.indexOf(d) % DIR_COLOR.length];

  const W = 640, H = 300, L = 44, R = 12, T = 12, B = 30;
  const pw = W - L - R, ph = H - T - B;
  const xMax = Math.max(...entries.map(([, v]) => Math.abs(v.lfc)), 1) * 1.1;
  const negLogQ = (q: number) => -Math.log10(Math.max(q, 1e-12));
  const yMax = Math.max(...entries.map(([, v]) => negLogQ(v.q)), 1) * 1.1;
  const x = (v: number) => L + ((v + xMax) / (2 * xMax)) * pw;
  const y = (v: number) => T + ph - (Math.min(v, yMax) / yMax) * ph;
  const sigLine = negLogQ(0.05);

  return (
    <Card>
      <div className="flex items-center justify-between">
        <b className="text-sm text-slate-900">Volcano plot</b>
        <span className="text-xs text-slate-500">{fmt(entries.length)} genera at this prevalence filter</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 w-full" role="img" aria-label="Volcano plot of differential abundance">
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <line key={f} x1={L} x2={W - R} y1={T + ph - f * ph} y2={T + ph - f * ph} stroke="#f1f5f9" />
        ))}
        <line x1={x(0)} x2={x(0)} y1={T} y2={T + ph} stroke="#e2e8f0" />
        {sigLine <= yMax && (
          <>
            <line x1={L} x2={W - R} y1={y(sigLine)} y2={y(sigLine)} stroke="#94a3b8" strokeWidth={1} strokeDasharray="4 3" />
            <text x={W - R} y={y(sigLine) - 3} fontSize="9" textAnchor="end" fill="#94a3b8">
              q = 0.05
            </text>
          </>
        )}
        {entries.map(([name, v]) => (
          <circle
            key={name}
            cx={x(v.lfc)}
            cy={y(negLogQ(v.q))}
            r={v.significant ? 3.2 : 2.2}
            fill={v.significant ? dirColor(v.direction) : "#cbd5e1"}
            fillOpacity={v.significant ? 0.85 : 0.5}
          >
            <title>
              {name}: log2FC {v.lfc.toFixed(2)}, q {v.q.toExponential(2)}, higher in {v.direction}
              {v.significant ? " — significant" : ""}
            </title>
          </circle>
        ))}
        <line x1={L} x2={L} y1={T} y2={T + ph} stroke="#cbd5e1" />
        <line x1={L} x2={W - R} y1={T + ph} y2={T + ph} stroke="#cbd5e1" />
        <text x={W - R} y={H - 6} fontSize="9" textAnchor="end" fill="#94a3b8">
          log2 fold change →
        </text>
      </svg>
      <div className="mt-3 flex flex-wrap items-center gap-4">
        {directions.map((d) => (
          <span key={d} className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: dirColor(d) }} />
            higher in {d}
          </span>
        ))}
        <span className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="h-2 w-2 rounded-full bg-slate-300" />
          not significant
        </span>
      </div>
    </Card>
  );
}

export default function DifferentialStep({ bundle, onAdvance }: { bundle: GutPilotBundle; onAdvance?: () => void }) {
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
        lede="Prevalence filter decides how many features are tested, and therefore how strict the multiple-testing correction has to be."
      />

      <RunContextStrip bundle={bundle} />

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

      <VolcanoPlot da={da} />

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
                  log2FC {v.lfc.toFixed(2)} · q {v.q.toExponential(2)} · higher in {v.direction} · prevalence{" "}
                  {(v.prevalence_a * 100).toFixed(0)}% vs {(v.prevalence_b * 100).toFixed(0)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="button"
        onClick={() => onAdvance?.()}
        className="self-start rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-700"
      >
        Approve and view summary
      </button>
    </div>
  );
}
