"use client";

// Shared toast for controls the source app makes async (backend) calls
// from, which have nothing to call here — e.g. picking a different gate
// option, or "Confirm strategy". Clicking still works and still feels like
// a button, it just surfaces an honest "fixed demo" note instead of
// silently doing nothing or faking a recompute.
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

const DEFAULT_MESSAGE = "Fixed demo — this control isn't wired to a live backend here.";

const ToastCtx = createContext<((message?: string) => void) | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notify = useCallback((msg?: string) => {
    setMessage(msg ?? DEFAULT_MESSAGE);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setMessage(null), 2200);
  }, []);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  return (
    <ToastCtx.Provider value={notify}>
      {children}
      <div
        aria-live="polite"
        className={`pointer-events-none fixed bottom-24 left-1/2 z-30 -translate-x-1/2 transition-all duration-300 ${
          message ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
      >
        {message && (
          <div className="rounded-full border border-slate-200 bg-slate-900 px-4 py-2 text-xs font-medium text-white shadow-lg">
            {message}
          </div>
        )}
      </div>
    </ToastCtx.Provider>
  );
}

// Falls back to a no-op outside the provider so a step can use this even
// if it's ever previewed standalone, rather than crashing.
export function useToast() {
  const ctx = useContext(ToastCtx);
  return ctx ?? (() => {});
}
