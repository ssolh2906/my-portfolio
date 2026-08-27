// Drives a locally-running gut-pilot FastAPI server (see
// C:\Users\10120\Workspace\gut-pilot\app\server, `uvicorn main:app --port 8000`)
// through every real pipeline endpoint for one dataset, and writes the
// consolidated response as one JSON bundle for the fixed-demo case study to
// read statically — no live backend on the deployed portfolio.
//
// Usage:
//   node scripts/export-gut-pilot-data.mjs crc_baxter
//   node scripts/export-gut-pilot-data.mjs par_scheperjans --file "C:\Users\10120\Workspace\gut-pilot\data\raw_data\par_scheperjans_results.tar.gz"
//
// The first form asks the server to load one of its own registered datasets
// (currently only "crc_baxter"); the second uploads a tarball the same way
// the app's own Upload page would, for any MicrobiomeHD-format dataset that
// isn't wired into the server's dataset registry.
//
// Endpoints that call live Claude (+ Paperclip, if installed) are slow and
// cost real tokens: normalize/strategy, design/study-design, design/rank,
// alpha/significance, beta/metric, da/prevalence, synthesis. Each call is
// independently wrapped so one failure (e.g. no ANTHROPIC_API_KEY set)
// doesn't stop the rest of the export — failures are recorded in the output
// bundle under `_errors` instead.

import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const API_BASE = process.env.GUT_PILOT_API_BASE ?? "http://localhost:8000/api";
// public/, not data/ — these bundles are fetched client-side (a few MB each),
// never imported as a JS module, so they must live somewhere Next.js serves
// as a static file rather than somewhere webpack would try to bundle.
const OUT_DIR = path.resolve(import.meta.dirname, "..", "public", "data", "gut-pilot");
const DA_THRESHOLDS = [0.05, 0.1, 0.15, 0.2];

function parseArgs(argv) {
  const [dataset, ...rest] = argv;
  if (!dataset) {
    console.error("Usage: node scripts/export-gut-pilot-data.mjs <dataset-id> [--file <tarball path>]");
    process.exit(1);
  }
  const fileIdx = rest.indexOf("--file");
  const filePath = fileIdx >= 0 ? rest[fileIdx + 1] : null;
  return { dataset, filePath };
}

async function createSession({ dataset, filePath }) {
  if (filePath) {
    const buf = await readFile(filePath);
    const form = new FormData();
    form.append("count_table", new Blob([buf]), path.basename(filePath));
    const res = await fetch(`${API_BASE}/session`, { method: "POST", body: form });
    if (!res.ok) throw new Error(`session upload failed: ${res.status} ${await res.text()}`);
    return res.json();
  }
  const res = await fetch(`${API_BASE}/session?dataset=${encodeURIComponent(dataset)}`, { method: "POST" });
  if (!res.ok) throw new Error(`session create failed: ${res.status} ${await res.text()}`);
  return res.json();
}

// Runs one GET and returns its JSON, or throws with the response body attached.
async function get(pathSuffix) {
  const res = await fetch(`${API_BASE}${pathSuffix}`);
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json();
}

// Calls `fn`, records the result under `key`, and on failure records the
// error under `_errors[key]` instead of throwing — so one broken gate call
// (usually a missing ANTHROPIC_API_KEY or missing `paperclip` CLI) doesn't
// take down the rest of the export.
async function tap(bundle, key, fn) {
  const label = key.padEnd(22);
  try {
    const start = Date.now();
    bundle[key] = await fn();
    console.log(`  ok    ${label} (${Date.now() - start}ms)`);
  } catch (err) {
    bundle._errors[key] = String(err.message ?? err);
    console.log(`  FAIL  ${label} ${bundle._errors[key]}`);
  }
}

async function exportDataset({ dataset, filePath }) {
  console.log(`\n=== ${dataset} ===`);
  const session = await createSession({ dataset, filePath });
  const sid = session.session_id;
  console.log(`session ${sid} — ${session.n_samples} samples, ${session.n_features} features`);

  const bundle = { session, _errors: {} };

  // Compute-only endpoints first (cheap, no model call, safe even with no API key).
  await tap(bundle, "qcDepth", () => get(`/session/${sid}/qc/depth`));
  await tap(bundle, "qcFloor", () => get(`/session/${sid}/qc/floor`));
  await tap(bundle, "rarefactionCurves", () => get(`/session/${sid}/rarefaction/curves`));
  await tap(bundle, "rarefactionRetention", () => get(`/session/${sid}/rarefaction/retention`));
  await tap(bundle, "alpha", () => get(`/session/${sid}/alpha`));
  await tap(bundle, "beta", () => get(`/session/${sid}/beta`));

  const daByThreshold = {};
  for (const t of DA_THRESHOLDS) {
    await tap(bundle, `daResults@${t}`, () => get(`/session/${sid}/da/results?threshold=${t}&correction=bh&alpha=0.05`));
    if (bundle[`daResults@${t}`]) daByThreshold[t] = bundle[`daResults@${t}`];
    delete bundle[`daResults@${t}`];
  }
  bundle.daResultsByThreshold = daByThreshold;

  // Reasoning-layer endpoints (live Claude, some also live Paperclip) — slow, costs tokens.
  await tap(bundle, "normalizeStrategy", () => get(`/session/${sid}/normalize/strategy`));
  await tap(bundle, "studyDesign", () => get(`/session/${sid}/design/study-design`));
  await tap(bundle, "designRank", () => get(`/session/${sid}/design/rank`));
  await tap(bundle, "alphaSignificance", () => get(`/session/${sid}/alpha/significance`));
  await tap(bundle, "betaMetric", () => get(`/session/${sid}/beta/metric`));
  await tap(bundle, "daPrevalence", () => get(`/session/${sid}/da/prevalence`));
  await tap(bundle, "synthesis", () => get(`/session/${sid}/synthesis`));

  return bundle;
}

async function main() {
  const { dataset, filePath } = parseArgs(process.argv.slice(2));
  const bundle = await exportDataset({ dataset, filePath });

  await mkdir(OUT_DIR, { recursive: true });
  const outPath = path.join(OUT_DIR, `${dataset}.json`);
  await writeFile(outPath, JSON.stringify(bundle, null, 2));

  const errCount = Object.keys(bundle._errors).length;
  console.log(`\nwrote ${outPath}`);
  if (errCount) {
    console.log(`${errCount} endpoint(s) failed — see bundle._errors. Re-run once fixed to fill them in.`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
