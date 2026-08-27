"use client";

// GutPilotEmbed — the fixed-demo pipeline viewer, restyled in the
// portfolio's own Tailwind design language (matching Projects.tsx /
// SnpDemo.tsx) rather than porting gut-pilot's own CSS. Structure, gate
// logic, and every number shown come from the real exported bundles
// (see src/lib/gut-pilot.ts) — only the visual skin is different from the
// source app.
import { useEffect, useMemo, useState } from "react";
import { DATASET_IDS, DATASET_LABELS, loadDataset, type DatasetId, type GutPilotBundle } from "@/lib/gut-pilot";
import { buildDecisionLog } from "./decisionLog";
import DecisionLogPanel from "./DecisionLogPanel";
import FloatingChat from "./FloatingChat";
import { ToastProvider } from "./Toast";
import UploadStep from "./steps/UploadStep";
import DesignStep from "./steps/DesignStep";
import QcStep from "./steps/QcStep";
import NormalizeStep from "./steps/NormalizeStep";
import AlphaStep from "./steps/AlphaStep";
import BetaStep from "./steps/BetaStep";
import DifferentialStep from "./steps/DifferentialStep";
import SummaryStep from "./steps/SummaryStep";

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

type StepProps = { bundle: GutPilotBundle; onAdvance?: () => void };

const STEP_COMPONENT: Record<StepId, (props: StepProps) => React.JSX.Element | null> = {
  upload: UploadStep,
  design: DesignStep,
  qc: QcStep,
  rarefy: NormalizeStep,
  alpha: AlphaStep,
  beta: BetaStep,
  da: DifferentialStep,
  refs: SummaryStep,
};

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

  const log = useMemo(() => (bundle ? buildDecisionLog(bundle) : []), [bundle]);
  const StepComponent = STEP_COMPONENT[step];
  const stepIndex = STEPS.findIndex((s) => s.id === step);
  const nextStep = STEPS[stepIndex + 1]?.id;

  return (
    <>
      {/* Dense 8-tab data app — not worth a cramped mobile layout. Shown
          below lg; the real embed is lg:block only. */}
      <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-8 text-center lg:hidden">
        <p className="text-sm font-medium text-slate-600">This interactive demo is built for a larger screen.</p>
        <p className="mt-1.5 text-xs text-slate-500">Open this page on a laptop or desktop to explore all 8 pipeline steps.</p>
      </div>
      <div className="relative hidden overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm lg:block">
      <ToastProvider>
      {/* header */}
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-200/80 bg-slate-50/60 px-5 py-3.5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold tracking-wide text-blue-700 uppercase">
          Fixed demo
        </span>
        <div className="flex gap-1.5 rounded-full border border-slate-200 bg-white p-1">
          {DATASET_IDS.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setDataset(id);
                setStep("upload");
              }}
              aria-pressed={id === dataset}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors duration-200 ${
                id === dataset ? "bg-blue-600 text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {DATASET_LABELS[id]}
            </button>
          ))}
        </div>
        {!loading && bundle && (
          <div className="ml-auto">
            <DecisionLogPanel log={log} />
          </div>
        )}
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
        ) : (
          <StepComponent bundle={bundle} onAdvance={nextStep ? () => setStep(nextStep) : undefined} />
        )}
      </div>

      {!loading && bundle && <FloatingChat />}
      </ToastProvider>
      </div>
    </>
  );
}
