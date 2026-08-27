// Derives the Decision Log entries straight from the real bundle — every
// entry here is the actual reviewer recommendation/note captured at export
// time (see scripts/export-gut-pilot-data.mjs), not scripted copy. This is
// what makes the fixed demo's log a genuine audit trail rather than a prop.
import type { GutPilotBundle } from "@/lib/gut-pilot";

export type LogEntry = {
  step: string; // matches STEPS ids in GutPilotEmbed
  gate: string | null; // "G1".."G10", or null for a non-gate system entry
  text: string;
  conf: number | null; // reviewer confidence-ish label shown, if any (we don't have a real % — see note below)
};

// gut-pilot's real backend doesn't emit a numeric confidence score (its
// gates are "recommend + explain", not a probability) — the source app's
// log entries that DO show a percentage are for a different, narrower
// notion (didn't apply to most gates either). Entries here just carry the
// recommendation label instead of inventing a number.
function note(gate: Record<string, unknown> | null | undefined): string | null {
  if (!gate) return null;
  const n = gate.note as { message?: string } | undefined;
  return n?.message ?? (gate.note_message as string | undefined) ?? null;
}

export function buildDecisionLog(bundle: GutPilotBundle): LogEntry[] {
  const entries: LogEntry[] = [];
  const pr = bundle.session.parse_report as { status: string; n_samples: number; n_features: number } | null;

  if (pr) {
    entries.push({
      step: "upload",
      gate: null,
      text: `Ingested ${pr.n_samples.toLocaleString("en-US")} samples, ${pr.n_features.toLocaleString("en-US")} raw OTU features. Validation: ${pr.status}.`,
      conf: null,
    });
  }

  const g1 = bundle.studyDesign?.g1 as { recommendation?: { label?: string }; note_message?: string } | undefined;
  if (g1) entries.push({ step: "design", gate: "G1", text: note(g1) ?? g1.recommendation?.label ?? "", conf: null });

  const g2 = bundle.studyDesign?.g2 as { note_message?: string } | undefined;
  if (g2) entries.push({ step: "design", gate: "G2", text: note(g2) ?? "", conf: null });

  const g3 = bundle.studyDesign?.g3 as { note_message?: string } | undefined;
  if (g3) entries.push({ step: "design", gate: "G3", text: note(g3) ?? "", conf: null });

  if (bundle.designRank) {
    entries.push({
      step: "design",
      gate: "G4",
      text: bundle.designRank.recommendation?.rationale ?? "",
      conf: null,
    });
  }

  if (bundle.qcFloor) {
    entries.push({
      step: "qc",
      gate: "G5",
      text: `QC depth floor set at ${bundle.qcFloor.floor.toLocaleString("en-US")} reads — ${bundle.qcFloor.n_flagged}/${bundle.qcFloor.n_total} samples flagged below it.`,
      conf: null,
    });
  }

  if (bundle.normalizeStrategy) {
    entries.push({ step: "rarefy", gate: "G6", text: note(bundle.normalizeStrategy) ?? "", conf: null });
  }

  if (bundle.alphaSignificance) {
    entries.push({ step: "alpha", gate: "G8", text: note(bundle.alphaSignificance) ?? "", conf: null });
  }

  if (bundle.betaMetric) {
    entries.push({ step: "beta", gate: "G9", text: note(bundle.betaMetric) ?? "", conf: null });
  }

  if (bundle.daPrevalence) {
    entries.push({ step: "da", gate: "G10", text: note(bundle.daPrevalence) ?? "", conf: null });
  }

  if (bundle.synthesis) {
    entries.push({ step: "refs", gate: null, text: bundle.synthesis.hero_finding, conf: null });
  }

  return entries;
}
