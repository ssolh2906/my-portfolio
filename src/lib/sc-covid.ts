// Single access point for the sc-covid data the app ships.
// Source of truth is the untracked raw export in data/sc-export/; the small
// files are copied under src/data so a fresh clone can build without it.
import summary from "@/data/sc-covid/summary.json";

export type MarkerKey = "CD14" | "MKI67" | "IGHG1";

export type Marker = {
  meaning: string;
  /** 99th percentile of log1p expression. Use as the color-scale ceiling. */
  vmax_p99: number;
  pct_detected: number;
};

export type ScCovidSummary = {
  n_cells_total: number;
  n_covid: number;
  n_normal: number;
  n_cell_types_raw: number;
  n_major_types: number;
  n_donors: number;
  n_donors_covid: number;
  n_donors_normal: number;
  census_version: string;
  downsample_n: number;
  markers: Record<MarkerKey, Marker>;
  note: string;
};

export const SUMMARY = summary as ScCovidSummary;

const n = (v: number) => v.toLocaleString("en-US");

export type Stat = { value: string; label: string; detail: string };

export const STATS: Stat[] = [
  {
    value: n(SUMMARY.n_cells_total),
    label: "cells analyzed",
    detail: `${n(SUMMARY.n_covid)} COVID-19, ${n(SUMMARY.n_normal)} healthy`,
  },
  {
    value: n(SUMMARY.n_donors),
    label: "blood donors",
    detail: `${n(SUMMARY.n_donors_covid)} COVID-19, ${n(SUMMARY.n_donors_normal)} healthy`,
  },
  {
    // 20 major types plus the grouped "Other" bucket.
    value: String(SUMMARY.n_major_types + 1),
    label: "cell type groups",
    detail: `grouped from ${SUMMARY.n_cell_types_raw} raw labels`,
  },
  {
    value: n(SUMMARY.downsample_n),
    label: "cells plotted here",
    detail: "downsampled evenly per condition",
  },
];

export type Disease = "COVID-19" | "normal";

/** One plotted cell: UMAP coordinates, cell type, condition, marker expression. */
export type UmapPoint = {
  x: number;
  y: number;
  ct: string;
  d: Disease;
  cd14: number;
  mki67: number;
  ighg1: number;
};

export const UMAP_POINTS_URL = "/data/sc-covid/umap-points.json";

// The export's cell_type_grouped labels are full ontology terms and don't fit
// on a chart. Map each of the 21 to a short label for axes/legends/points;
// the tooltip always shows the full name from CELL_TYPE_LABELS's key.
export const CELL_TYPE_LABELS: Record<string, string> = {
  Other: "Other",
  "naive thymus-derived CD4-positive, alpha-beta T cell": "naive CD4 T",
  "B cell": "B cell",
  "CD8-positive, alpha-beta T cell": "CD8 T",
  "CD14-positive, CD16-negative classical monocyte":
    "classical monocyte (CD14+CD16-)",
  "classical monocyte": "classical monocyte",
  "CD4-positive, alpha-beta T cell": "CD4 T",
  "central memory CD4-positive, alpha-beta T cell": "central memory CD4 T",
  "CD16-positive, CD56-dim natural killer cell, human": "CD16+ NK cell",
  "natural killer cell": "NK cell",
  "CD14-positive monocyte": "CD14+ monocyte",
  "naive B cell": "naive B cell",
  "naive thymus-derived CD8-positive, alpha-beta T cell": "naive CD8 T",
  "mature alpha-beta T cell": "mature T cell",
  "effector memory CD8-positive, alpha-beta T cell": "effector memory CD8 T",
  "effector memory CD4-positive, alpha-beta T cell": "effector memory CD4 T",
  "memory B cell": "memory B cell",
  "mucosal invariant T cell": "MAIT cell",
  "CD4-positive, alpha-beta memory T cell": "memory CD4 T",
  "CD14-low, CD16-positive monocyte": "non-classical monocyte",
  monocyte: "monocyte",
};

export function shortCellTypeLabel(fullName: string): string {
  return CELL_TYPE_LABELS[fullName] ?? fullName;
}
