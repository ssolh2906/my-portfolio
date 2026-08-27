import type { GutPilotBundle } from "@/lib/gut-pilot";
import { Card, GateNote, RecBadge, SectionHeading, fmt, pct } from "../shared";

const OPTION_COLOR: Record<string, string> = {
  rarefy: "bg-blue-500",
  css: "bg-teal-500",
  clr: "bg-violet-500",
};

export default function NormalizeStep({ bundle }: { bundle: GutPilotBundle }) {
  const g6 = bundle.normalizeStrategy;
  const suggested = bundle.rarefactionCurves.suggested_threshold;

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
          return (
            <Card key={o.option_id} className={o.option_id === g6.recommendation.option_id ? "ring-2 ring-blue-500" : ""}>
              <b className="text-sm text-slate-900">{o.label}</b>
              <p className="mt-1 text-xs text-slate-500">{o.summary}</p>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div className={`h-full ${OPTION_COLOR[o.option_id]}`} style={{ width: `${frac * 100}%` }} />
              </div>
              <p className="mt-1.5 text-xs text-slate-500">
                {fmt(r.retained)}/{fmt(r.total)} retained ({pct(frac)})
              </p>
            </Card>
          );
        })}
      </div>

      <GateNote html={g6.note.message} />

      <p className="text-xs text-slate-500">
        Depth threshold applied: <b>{fmt(bundle.rarefactionRetention.depth)}</b> reads · plateau-suggested depth from the
        rarefaction curves: <b>{fmt(suggested)}</b> reads.
      </p>

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
    </div>
  );
}
