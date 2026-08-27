"use client";

// The Decision Log — gut-pilot's real differentiator: an audit trail of
// every reviewer recommendation for this run. Scoped to the embed's own
// container (position: absolute, not fixed-to-viewport) so it reads as
// part of this card, not a viewport-wide overlay on top of the rest of the
// portfolio page.
import { useState } from "react";
import type { LogEntry } from "./decisionLog";
import { SparkleIcon } from "./shared";

const STEP_LABEL: Record<string, string> = {
  upload: "Upload",
  design: "Design",
  qc: "Raw QC",
  rarefy: "Normalize",
  alpha: "Alpha",
  beta: "Beta",
  da: "Differential",
  refs: "Summary",
};

export default function DecisionLogPanel({ log }: { log: LogEntry[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={`Open decision log (${log.length} entries)`}
        className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition-colors duration-200 hover:border-blue-300 hover:text-blue-700"
      >
        <SparkleIcon />
        Decision log
        <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">{log.length}</span>
      </button>

      {open && (
        <div className="absolute top-10 right-0 z-10 max-h-[70vh] w-[min(360px,80vw)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-lg">
          <div className="mb-2 flex items-center justify-between">
            <b className="text-sm text-slate-900">Decision log</b>
            <button type="button" onClick={() => setOpen(false)} className="text-xs text-slate-400 hover:text-slate-700">
              close
            </button>
          </div>
          <ol className="flex flex-col gap-3">
            {log.map((e, i) => (
              <li key={i} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wide text-blue-600 uppercase">
                  <SparkleIcon />
                  {STEP_LABEL[e.step]}
                  {e.gate && <span className="text-slate-400">· {e.gate}</span>}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">{e.text}</p>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
