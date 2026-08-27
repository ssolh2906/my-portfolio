import type { GutPilotBundle } from "@/lib/gut-pilot";
import { Card, SectionHeading } from "../shared";

// summary_text/literature_validation_text/next_steps[].title carry inline
// <b>/<i> markup from the reviewer (same convention as GateNote's
// note.message) — rendered as HTML, not escaped, for the same reason.
function Html({ html, className }: { html: string; className?: string }) {
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function SummaryStep({ bundle }: { bundle: GutPilotBundle }) {
  const s = bundle.synthesis;

  return (
    <div className="flex flex-col gap-6">
      <SectionHeading title="Summary" lede="The reviewer's synthesis across every gate decision made in this run." />

      <Card className="border-blue-100 bg-blue-50/50">
        <p className="text-sm leading-relaxed font-medium text-slate-900">{s.hero_finding}</p>
      </Card>

      <div>
        <b className="text-sm text-slate-900">What this run found</b>
        <Html html={s.summary_text} className="mt-1.5 block text-sm leading-relaxed text-slate-600" />
      </div>

      <div>
        <b className="text-sm text-slate-900">Literature validation</b>
        <Html html={s.literature_validation_text} className="mt-1.5 block text-sm leading-relaxed text-slate-600" />
      </div>

      {s.limitations.length > 0 && (
        <div>
          <b className="text-sm text-slate-900">Limitations</b>
          <ul className="mt-1.5 flex flex-col gap-2.5">
            {s.limitations.map((l, i) => (
              <li key={i} className="text-sm text-slate-600">
                <b className="text-slate-900">{l.title}.</b> {l.body}
              </li>
            ))}
          </ul>
        </div>
      )}

      {s.next_steps.length > 0 && (
        <div>
          <b className="text-sm text-slate-900">Next steps</b>
          <div className="mt-2 flex flex-col gap-3">
            {s.next_steps.map((step, i) => (
              <Card key={i}>
                <Html html={step.title} className="block text-sm font-semibold text-slate-900" />
                <p className="mt-1 text-xs text-slate-600">{step.hypothesis}</p>
                <p className="mt-1 text-xs text-slate-500">Experiment: {step.experiment}</p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
