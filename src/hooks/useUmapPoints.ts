"use client";

import { useEffect, useState } from "react";

import { UMAP_POINTS_URL, type UmapPoint } from "@/lib/sc-covid";

type UmapPointsState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "loaded"; points: UmapPoint[] };

/** Fetches the ~2.6MB point cloud client-side; kept out of the JS bundle. */
export function useUmapPoints(): UmapPointsState {
  const [state, setState] = useState<UmapPointsState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();

    fetch(UMAP_POINTS_URL, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        return res.json();
      })
      .then((points: UmapPoint[]) => setState({ status: "loaded", points }))
      .catch((err) => {
        if (err.name === "AbortError") return;
        setState({ status: "error" });
      });

    return () => controller.abort();
  }, []);

  return state;
}
