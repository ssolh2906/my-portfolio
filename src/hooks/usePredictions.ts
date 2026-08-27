"use client";

import { useEffect, useState } from "react";

import { PREDICTIONS_URL, type PredictionsPayload } from "@/lib/gene-expression";

type PredictionsState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "loaded"; data: PredictionsPayload };

/** Fetches the ~260KB actual/predicted arrays client-side; kept out of the JS bundle. */
export function usePredictions(): PredictionsState {
  const [state, setState] = useState<PredictionsState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();

    fetch(PREDICTIONS_URL, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        return res.json();
      })
      .then((data: PredictionsPayload) => setState({ status: "loaded", data }))
      .catch((err) => {
        if (err.name === "AbortError") return;
        setState({ status: "error" });
      });

    return () => controller.abort();
  }, []);

  return state;
}
