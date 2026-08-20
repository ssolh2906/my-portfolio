// Single access point for the sc-covid export. Only this file knows where the
// raw export lives, so the ugly relative path stays in one place.
import summary from "../../data/sc-export/summary.json";

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
