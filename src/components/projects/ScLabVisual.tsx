"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

// A simplified Quality Control screen from the Single-cell Lab. When the card
// plays (hover on desktop, scrolled into view on touch screens), a cursor
// drags the cutoff line, a guide bubble explains the step, the broken cells
// fade out, and the cursor clicks "Next step". The chart is only a sketch.

// Seeded so server and client render the same dots.
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

type Dot = { x: number; y: number; junk: boolean };

const DOTS: Dot[] = (() => {
  const rand = seeded(11);
  return Array.from({ length: 46 }, (_, i) => {
    const junk = i % 6 === 0;
    return {
      x: Math.round((junk ? 40 : 44) + rand() * 230),
      y: Math.round(junk ? 40 + rand() * 30 : 90 + rand() * 54),
      junk,
    };
  });
})();

const JUNK_COUNT = DOTS.filter((d) => d.junk).length;

// Time (ms after play starts) at which each phase begins.
const TIMELINE = [0, 500, 1500, 2700, 3100, 3900, 4200, 5400, 6300, 7300];
const LAST = TIMELINE.length - 1;

// Phases: 0 rest · 1 cursor to handle · 2 guide shows · 3 drag line down ·
// 4 broken cells turn coral · 5 they fade · 6 guide confirms · 7 cursor to
// button · 8 button pressed · 9 cursor fades out (end state).

const EASE = "cubic-bezier(.45,0,.2,1)";

export default function ScLabVisual() {
  const ref = useRef<SVGSVGElement>(null);
  const [played, setPlayed] = useState(0);
  // Reduced motion: no animation, show the finished step.
  const reduced = useReducedMotion() ?? false;
  const phase = reduced ? LAST : played;

  useEffect(() => {
    const card = ref.current?.closest("a");
    if (!card || reduced) return;
    const setPhase = setPlayed;

    let timers: ReturnType<typeof setTimeout>[] = [];
    const clear = () => {
      timers.forEach(clearTimeout);
      timers = [];
    };
    const play = () => {
      clear();
      setPhase(0);
      timers = TIMELINE.slice(1).map((ms, i) =>
        setTimeout(() => setPhase(i + 1), ms),
      );
    };
    const reset = () => {
      clear();
      setPhase(0);
    };

    card.addEventListener("mouseenter", play);
    card.addEventListener("mouseleave", reset);
    card.addEventListener("cardplay", play);
    card.addEventListener("cardstop", reset);
    return () => {
      clear();
      card.removeEventListener("mouseenter", play);
      card.removeEventListener("mouseleave", reset);
      card.removeEventListener("cardplay", play);
      card.removeEventListener("cardstop", reset);
    };
  }, [reduced]);

  const cursor =
    phase >= 7 ? [262, 180] : phase >= 3 ? [280, 76] : phase >= 1 ? [280, 30] : [150, 182];
  const lineDrop = phase >= 3 ? 46 : 0;
  const tipVisible = phase >= 2 && phase < 7;
  const tipText =
    phase >= 6
      ? `${JUNK_COUNT} broken cells removed`
      : "Drag the line to drop broken cells";
  const pressed = phase >= 8;

  const move = reduced
    ? undefined
    : `transform 900ms ${EASE}, opacity 400ms`;

  return (
    <div>
      <div className="flex justify-between text-xs text-slate-500">
        <span>
          <b className="font-medium text-teal-600">Step 01</b> · Quality
          control
        </span>
        <span>2 of 13</span>
      </div>
      <div className="mt-1.5 mb-3 h-1 rounded-full bg-slate-100">
        <div className="h-1 w-[15%] rounded-full bg-teal-500" />
      </div>

      <svg
        ref={ref}
        viewBox="0 0 300 194"
        className="w-full"
        role="img"
        aria-label="A guided quality control step: a cutoff line is dragged down and the broken cells above it are removed"
      >
        <path d="M24 30V150H292" fill="none" className="stroke-slate-200" />
        <text x="292" y="164" textAnchor="end" fontSize="11" className="fill-slate-400">
          genes per cell
        </text>
        <text x="28" y="164" fontSize="11" className="fill-slate-400">
          mito %
        </text>

        {DOTS.map((d, i) => (
          <circle
            key={i}
            cx={d.x}
            cy={d.y}
            r="3.6"
            style={{
              transition: reduced ? undefined : "fill 400ms, opacity 600ms",
              opacity: d.junk && phase >= 5 ? 0.12 : 1,
            }}
            className={d.junk && phase >= 4 ? "fill-coral-500" : "fill-teal-300"}
          />
        ))}

        <g style={{ transform: `translate(0px, ${lineDrop}px)`, transition: move }}>
          <line
            x1="24"
            y1="32"
            x2="276"
            y2="32"
            strokeWidth="1.5"
            strokeDasharray="5 4"
            className="stroke-coral-500"
          />
          <circle cx="282" cy="32" r="6" strokeWidth="2" className="fill-white stroke-coral-500" />
        </g>

        <g style={{ opacity: tipVisible ? 1 : 0, transition: move }}>
          <rect x="92" y="2" width="178" height="22" rx="6" className="fill-teal-700" />
          <path d="M262 24l6 5 2-5z" className="fill-teal-700" />
          <text x="181" y="17" textAnchor="middle" fontSize="11" className="fill-white">
            {tipText}
          </text>
        </g>

        <rect
          x="206"
          y="172"
          width="86"
          height="22"
          rx="11"
          style={{ transition: reduced ? undefined : "fill 300ms" }}
          className={`stroke-teal-500 ${pressed ? "fill-teal-500" : "fill-white"}`}
        />
        <text
          x="249"
          y="187"
          textAnchor="middle"
          fontSize="11"
          style={{ transition: reduced ? undefined : "fill 300ms" }}
          className={pressed ? "fill-white" : "fill-teal-600"}
        >
          Next step →
        </text>

        <g
          style={{
            transform: `translate(${cursor[0]}px, ${cursor[1]}px)`,
            opacity: phase >= LAST ? 0 : 1,
            transition: move,
          }}
        >
          <path
            d="M0 0V15L4 11L7.5 17.5L10 16.3L6.7 10H12Z"
            strokeWidth="1.2"
            strokeLinejoin="round"
            className="fill-slate-900 stroke-white"
          />
        </g>
      </svg>
    </div>
  );
}
