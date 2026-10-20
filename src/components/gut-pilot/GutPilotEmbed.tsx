"use client";

// GutPilotEmbed — the fixed-demo pipeline viewer, restyled in the
// portfolio's own Tailwind design language (matching Projects.tsx /
// SnpDemo.tsx) rather than porting gut-pilot's own CSS. Structure, gate
// logic, and every number shown come from the real exported bundles
// (see src/lib/gut-pilot.ts) — only the visual skin is different from the
// source app.
import { useEffect, useMemo, useRef, useState } from "react";
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
  // Furthest tab the reader has reached; later tabs stay locked so the run
  // reads as a sequence of gates rather than 8 independent pages.
  const [unlocked, setUnlocked] = useState(0);
  const [fastForwarding, setFastForwarding] = useState(false);
  const stepIndex = STEPS.findIndex((s) => s.id === step);
  const ffTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopFastForward = () => {
    if (ffTimer.current) clearInterval(ffTimer.current);
    ffTimer.current = null;
    setFastForwarding(false);
  };
  useEffect(() => stopFastForward, []);

  const goTo = (i: number) => {
    setStep(STEPS[i].id);
    setUnlocked((u) => Math.max(u, i));
  };

  // Every step's default picks are already the agent's recommendations, so
  // fast-forwarding is just unlocking each tab in turn and landing on Summary.
  const fastForward = () => {
    if (ffTimer.current) return;
    setFastForwarding(true);
    let i = Math.max(unlocked, stepIndex);
    ffTimer.current = setInterval(() => {
      i += 1;
      goTo(i);
      if (i >= STEPS.length - 1) stopFastForward();
    }, 220);
  };

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
  const hasNext = stepIndex < STEPS.length - 1;
  const atEnd = unlocked >= STEPS.length - 1;

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
                stopFastForward();
                setDataset(id);
                setStep("upload");
                setUnlocked(0);
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
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={fastForward}
              disabled={fastForwarding || atEnd}
              className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-blue-700 transition-colors duration-200 hover:border-blue-400 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-blue-200 disabled:hover:bg-white"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
                <path d="M3 6.5v11l8-5.5-8-5.5Zm9 0v11l8-5.5-8-5.5Z" />
              </svg>
              Fast-forward with agent picks
            </button>
            <DecisionLogPanel log={log} />
          </div>
        )}
      </div>

      {/* tab bar */}
      <nav className="flex gap-0.5 overflow-x-auto border-b border-slate-200/80 px-5" aria-label="Analysis pages">
        {STEPS.map((s, i) => {
          const isCurrent = s.id === step;
          const isLocked = i > unlocked;
          const isDone = i < unlocked && !isCurrent;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setStep(s.id)}
              disabled={isLocked}
              aria-current={isCurrent ? "page" : undefined}
              className={`flex flex-none items-center gap-2 border-b-2 px-3 py-3 text-xs font-semibold whitespace-nowrap transition-colors duration-500 ${
                isCurrent
                  ? "border-blue-600 text-blue-700"
                  : isLocked
                    ? "cursor-not-allowed border-transparent text-slate-300"
                    : "border-transparent text-slate-700 hover:text-slate-900"
              }`}
            >
              <span
                className={`flex h-[19px] w-[19px] items-center justify-center rounded-full border font-mono text-[10px] font-bold transition-colors duration-500 ${
                  isCurrent
                    ? "border-blue-600 bg-blue-600 text-white"
                    : isDone
                      ? "border-blue-200 bg-blue-50 text-blue-700"
                      : isLocked
                        ? "border-slate-200 text-slate-300"
                        : "border-slate-400 text-slate-600"
                }`}
              >
                {isDone ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-2.5 w-2.5" aria-hidden>
                    <path d="M5 12.5 9.5 17 19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  s.n
                )}
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
          <StepComponent bundle={bundle} onAdvance={hasNext ? () => goTo(stepIndex + 1) : undefined} />
        )}
      </div>

      {!loading && bundle && <FloatingChat />}
      </ToastProvider>
      </div>
    </>
  );
}
