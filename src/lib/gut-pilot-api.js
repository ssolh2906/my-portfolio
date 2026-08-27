// Drop-in replacement for gut-pilot's own app/client/src/lib/api.js.
// Same exported function names/signatures the ported pages already call —
// only the implementation changes: resolve from the static per-dataset
// bundle (see lib/gut-pilot.ts) instead of `fetch`-ing a live backend.
//
// `sessionId` here IS the dataset id ("crc_baxter" | "par_scheperjans") —
// createSession(dataset) below returns it as session_id, exactly like the
// real backend's response shape, so ported code that stashes
// state.sessionId and threads it through every other call needs no change.
//
// Kept async (a microtask tick, not a real delay) so the ported pages' own
// loading-spinner states still get a render frame to show, matching how
// they behave against the real backend.

import { loadDataset } from "./gut-pilot";

export async function createSession(dataset) {
  const bundle = await loadDataset(dataset);
  return { ...bundle.session, session_id: dataset };
}

export async function getNormalizeStrategy(sessionId) {
  return (await loadDataset(sessionId)).normalizeStrategy;
}

// No live backend to persist a choice against — the ported UI still lets a
// reviewer pick a different option and see the log update (client state),
// it just can't get a freshly-reasoned response back for the alternate
// choice. Re-returns the baked recommendation, same shape as a real POST.
export async function setNormalizeStrategy(sessionId) {
  return (await loadDataset(sessionId)).normalizeStrategy;
}

export async function getRarefactionCurves(sessionId) {
  return (await loadDataset(sessionId)).rarefactionCurves;
}

export async function getStudyDesign(sessionId) {
  return (await loadDataset(sessionId)).studyDesign;
}

export async function getRank(sessionId) {
  return (await loadDataset(sessionId)).designRank;
}

export async function setRank(sessionId) {
  return (await loadDataset(sessionId)).designRank;
}

export async function getAlphaSignificance(sessionId) {
  return (await loadDataset(sessionId)).alphaSignificance;
}

export async function getBetaMetric(sessionId) {
  return (await loadDataset(sessionId)).betaMetric;
}

export async function getDaPrevalence(sessionId) {
  return (await loadDataset(sessionId)).daPrevalence;
}

// The real endpoint takes a continuous threshold; the bundle only has the
// four presets the export script asked for (0.05/0.1/0.15/0.2). Snap to the
// nearest preset rather than exposing arbitrary thresholds the fixed demo
// has no baked answer for.
export async function getDaResults(sessionId, { threshold = 0.1 } = {}) {
  const bundle = await loadDataset(sessionId);
  const presets = Object.keys(bundle.daResultsByThreshold).map(Number);
  const nearest = presets.reduce((a, b) => (Math.abs(b - threshold) < Math.abs(a - threshold) ? b : a));
  return bundle.daResultsByThreshold[String(nearest)];
}

export async function getSynthesis(sessionId) {
  return (await loadDataset(sessionId)).synthesis;
}

// Real per-sample compute the original app's own api.js never calls (its
// AlphaPage/BetaPage still read from the static mock lib/data.js instead of
// a live endpoint, even in the real app) — added here because the ported
// Alpha/Beta pages will be wired to use real data instead.
export async function getAlpha(sessionId) {
  return (await loadDataset(sessionId)).alpha;
}

export async function getBeta(sessionId) {
  return (await loadDataset(sessionId)).beta;
}

// FloatingChat has no live backend in the fixed demo — see
// components/gut-pilot/app/components/FloatingChat.jsx, which shows a
// static explanatory line instead of calling this.
export async function sendChatMessage() {
  throw new Error("sendChatMessage is not available in the fixed demo");
}
