"use client";

import { useEffect, useRef, useState } from "react";

// Holds at 0 for a beat (while the first source lights up), then climbs.
const HOLD_MS = 500;
const DURATION_MS = 1900;

// Shows `to` at rest. While the surrounding card link is hovered it counts up
// from 0, so it can sit anywhere inside the card without extra state wiring.
export default function CountUp({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(to);

  useEffect(() => {
    const card = ref.current?.closest("a");
    if (!card) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const stop = () => cancelAnimationFrame(frame);

    const start = () => {
      stop();
      const t0 = performance.now();
      setValue(0);
      const tick = (now: number) => {
        const p = Math.min(Math.max((now - t0 - HOLD_MS) / DURATION_MS, 0), 1);
        const eased = p * (2 - p); // gentle ease-out, settles on `to`
        setValue(Math.round(to * eased));
        if (p < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };

    const reset = () => {
      stop();
      setValue(to);
    };

    card.addEventListener("mouseenter", start);
    card.addEventListener("mouseleave", reset);
    return () => {
      stop();
      card.removeEventListener("mouseenter", start);
      card.removeEventListener("mouseleave", reset);
    };
  }, [to]);

  return (
    <span ref={ref} className="tabular-nums">
      {value}
    </span>
  );
}
