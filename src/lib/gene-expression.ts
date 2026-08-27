// Single access point for the gene-expression data the app ships.
// Source of truth is the untracked raw export in data/gene-expression-export/; the
// small files are copied under src/data so a fresh clone can build without it.
import summary from "@/data/gene-expression/summary.json";
import featureImportance from "@/data/gene-expression/feature-importance.json";

export type ModelId = "svm" | "ridge" | "rf" | "gbr";

export type ModelRow = {
  id: ModelId;
  label: string;
  mae: number;
  r2: number;
  pearson: number;
};

export type GeneExpressionSummary = {
  n_test: number;
  n_features: number;
  best_model: ModelId;
  models: ModelRow[];
};

export const SUMMARY = summary as GeneExpressionSummary;

// Already sorted by r2 descending in export_for_web.py, but re-sort defensively.
export const MODEL_ROWS: ModelRow[] = [...SUMMARY.models].sort(
  (a, b) => b.r2 - a.r2,
);

export const BEST_MODEL = MODEL_ROWS[0];

const n = (v: number) => v.toLocaleString("en-US");

export type FeatureImportanceRow = { feature: string; importance: number };

// Already sorted by importance descending in export_for_web.py.
export const FEATURE_IMPORTANCE = featureImportance as FeatureImportanceRow[];
export const TOP_FEATURE = FEATURE_IMPORTANCE[0];

export type Stat = { value: string; label: string; detail: string };

// Leads with evidence that the relationship exists (correlation, sample size,
// where the signal concentrates) - the model comparison is a secondary check,
// not the headline, so it doesn't get a stat slot here.
export const STATS: Stat[] = [
  {
    value: BEST_MODEL.pearson.toFixed(2),
    label: "correlation, predicted vs. actual",
    detail: `Pearson r, held-out genes (${BEST_MODEL.label})`,
  },
  {
    value: n(SUMMARY.n_test),
    label: "genes tested",
    detail: "held out by chromosome, never seen in training",
  },
  {
    value: n(SUMMARY.n_features),
    label: "histone features per gene",
    detail: "320 signal bins + 6 engineered",
  },
  {
    value: `${(TOP_FEATURE.importance * 100).toFixed(0)}%`,
    label: "of the signal is one feature",
    detail: TOP_FEATURE.feature,
  },
];

export const PREDICTIONS_URL = "/data/gene-expression/predictions.json";

export type PredictionsPayload = {
  actual: number[];
  predicted: Record<ModelId, number[]>;
};
