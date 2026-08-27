// Single access point for the gut-pilot fixed-demo data. Both bundles are
// genuine pipeline exports (see scripts/export-gut-pilot-data.mjs) — every
// field here is real Compute output or a real Claude reasoning-layer call
// captured from a live gut-pilot server run, not hand-written.
//
// Unlike sc-covid/snp-summary's small JSON, each bundle here is a few MB
// (per-sample distance matrices, PCoA coordinates, per-taxon DA tables), so
// it lives in public/data/gut-pilot/ and is fetched client-side rather than
// imported as a JS module — importing would bundle it into the page's JS.

export const DATASET_IDS = ["crc_baxter", "par_scheperjans"] as const;
export type DatasetId = (typeof DATASET_IDS)[number];

export const DATASET_LABELS: Record<DatasetId, string> = {
  crc_baxter: "Colorectal cancer (Baxter 2016)",
  par_scheperjans: "Parkinson's disease (Scheperjans 2015)",
};

export type ParseReport = Record<string, unknown> | null;

export type Session = {
  session_id: string;
  n_samples: number;
  n_features: number;
  sample_ids: string[];
  parse_report: ParseReport;
};

export type QcDepth = {
  gate_id: string;
  stats: { n_samples: number; total_reads: number; mean_depth: number; min_depth: number; max_depth: number };
  bars: { sample_id: string; depth: number }[];
};

export type QcFloor = {
  gate_id: string;
  floor: number;
  flagged: string[];
  n_flagged: number;
  n_total: number;
};

export type RarefactionCurves = {
  gate_id: string;
  samples: { id: string; group: string; depth: number; curve: [number, number][] }[];
  suggested_threshold: number;
};

export type RarefactionRetention = {
  gate_id: string;
  depth: number;
  retained: string[];
  excluded: string[];
};

export type AlphaCompute = {
  depth: number;
  n_iterations: number;
  metrics: Record<string, Record<string, number>>;
  groups: Record<string, string>;
  group_tests: Record<string, unknown>;
};

export type BetaCompute = {
  metric: string;
  metric_mismatch_warning: string | null;
  distance_matrix: { samples: string[]; values: number[][] };
  pcoa: { coords: number[][]; proportion_explained: number[] };
  groups: Record<string, string>;
  permanova: Record<string, unknown>;
};

export type Citation = {
  ref_key: string;
  doi: string;
  quote: string | null;
  line_ref: string | null;
};

export type GateNote = { severity: string; message: string };

export type GateRecommendation = { option_id: string; label: string };

export type NormalizeStrategy = {
  gate_id: string;
  strategy: string;
  recommendation: GateRecommendation;
  options: {
    option_id: string;
    label: string;
    summary: string;
    retention_preview: { retained: number; total: number; excluded: string[] };
    permitted_beta_metrics: string[];
  }[];
  note: GateNote;
  positions: { side: string; claim: string; ref_key: string; doi: string; quote: string | null; line_ref: string | null }[];
  cascades: unknown[];
};

export type StudyDesign = {
  g1: Record<string, unknown>;
  g2: Record<string, unknown>;
  g3: Record<string, unknown>;
};

export type DesignRank = {
  gate_id: string;
  rank: string;
  ranks: { option_id: string; label: string; feature_count: number; available: boolean; default: boolean }[];
  recommendation: { option_id: string; label: string; rationale: string; citations: unknown[] };
  warning: string | null;
};

export type AlphaSignificance = {
  gate_id: string;
  group_summary: Record<string, unknown> | null;
  pairing: string;
  retention_preview: { retained: number; total: number; excluded: string[] };
  recommendation: { alpha_level: number; correction: string };
  note: GateNote;
  citation: Citation;
};

export type BetaMetric = {
  gate_id: string;
  norm_strategy: string;
  sparsity: number;
  group_summary: Record<string, unknown> | null;
  pairing: string;
  tree_available: boolean;
  recommendation: GateRecommendation;
  note: GateNote;
  citation: Citation;
};

export type DaPrevalence = {
  gate_id: string;
  recommendation: { value: number; label: string };
  options: { value: number; label: string; n_tested: number }[];
  note: GateNote;
  citation: Citation;
};

export type KnownTaxon = {
  taxon_genus: string;
  literature_direction: string;
  this_run_direction: string;
  q: number;
  status: string;
  citation_key: string;
  note: string;
};

export type DaResults = {
  n_total: number;
  n_tested: number;
  prevalence_options: Record<string, number>;
  labels: string[];
  genera: Record<
    string,
    {
      lfc: number;
      p: number;
      q: number;
      direction: string;
      prevalence: number;
      prevalence_a: number;
      prevalence_b: number;
      significant: boolean;
      artifact: string | null;
    }
  >;
  n_significant: number;
  known_taxa: KnownTaxon[];
  dropped_named_taxa: string[];
  group_counts: Record<string, number>;
};

export type Synthesis = {
  hero_finding: string;
  summary_text: string;
  literature_validation_text: string;
  limitations: string[];
  next_steps: { title: string; hypothesis: string; experiment: string; citation: string | null }[];
};

export type GutPilotBundle = {
  session: Session;
  qcDepth: QcDepth;
  qcFloor: QcFloor;
  rarefactionCurves: RarefactionCurves;
  rarefactionRetention: RarefactionRetention;
  alpha: AlphaCompute;
  beta: BetaCompute;
  daResultsByThreshold: Record<string, DaResults>;
  normalizeStrategy: NormalizeStrategy;
  studyDesign: StudyDesign;
  designRank: DesignRank;
  alphaSignificance: AlphaSignificance;
  betaMetric: BetaMetric;
  daPrevalence: DaPrevalence;
  synthesis: Synthesis;
};

const _cache = new Map<DatasetId, Promise<GutPilotBundle>>();

// Fetched, not imported — see the module comment above. Cached in memory so
// toggling back to a dataset already viewed this session doesn't re-fetch.
export function loadDataset(id: DatasetId): Promise<GutPilotBundle> {
  let pending = _cache.get(id);
  if (!pending) {
    pending = fetch(`/data/gut-pilot/${id}.json`).then((res) => {
      if (!res.ok) throw new Error(`failed to load ${id}: ${res.status}`);
      return res.json();
    });
    _cache.set(id, pending);
  }
  return pending;
}
