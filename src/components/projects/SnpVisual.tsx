import type { CSSProperties } from "react";

import { VARIANTS } from "@/lib/snp-summary";

const VARIANT = VARIANTS["rs6311"];

// The three sources the summary is grounded in (same set for every variant).
const SOURCES = ["NCBI", "Ensembl", "PubMed"];
const CHIP_W = [52, 66, 62];

// Hover timeline: the headline count (CountUp) holds at 0 first, then each
// source lights up in turn while the number climbs.
const CHIP_START_MS = 400;
const CHIP_GAP_MS = 500;

const LINE_Y = 74;
const GENE_X = 168;
const SNP_X = 138;

// Schematic, not to scale: only the "~290 bp upstream of the TSS" is real data.
export default function SnpVisual() {
  let chipX = 16;

  return (
    <svg
      viewBox="0 0 300 110"
      className="w-full"
      role="img"
      aria-label={`${VARIANT.rsId} sits upstream of the ${VARIANT.gene.symbol} gene; the summary cites NCBI, Ensembl and PubMed`}
    >
      <line
        x1="8"
        y1={LINE_Y}
        x2="292"
        y2={LINE_Y}
        strokeWidth="2"
        className="stroke-slate-200"
      />
      <rect
        x={GENE_X}
        y={LINE_Y - 10}
        width={124}
        height="20"
        rx="3"
        className="fill-denim-100"
      />
      <text
        x={GENE_X + 62}
        y={LINE_Y + 4}
        textAnchor="middle"
        fontSize="11"
        className="fill-denim-700"
      >
        {VARIANT.gene.symbol}
      </text>

      <line
        x1={SNP_X}
        y1={LINE_Y - 6}
        x2={SNP_X}
        y2={LINE_Y - 22}
        className="stroke-coral-500"
      />
      <text
        x={SNP_X}
        y={LINE_Y - 28}
        textAnchor="middle"
        fontSize="11"
        className="fill-coral-600"
      >
        {VARIANT.rsId}
      </text>
      <circle
        cx={SNP_X}
        cy={LINE_Y}
        r="5"
        className="origin-center fill-coral-500 opacity-0 [transform-box:fill-box] group-hover:animate-ping group-hover:opacity-60 motion-reduce:animate-none"
      />
      <circle cx={SNP_X} cy={LINE_Y} r="5" className="fill-coral-500" />
      <text
        x={(SNP_X + GENE_X) / 2}
        y={LINE_Y + 26}
        textAnchor="middle"
        fontSize="11"
        className="fill-slate-500"
      >
        ~290 bp upstream
      </text>

      {/* Source chips are greyed out at rest and light up one after another on
          card hover, as if each source were being queried. */}
      {SOURCES.map((name, i) => {
        const x = chipX;
        chipX += CHIP_W[i] + 6;
        return (
          <g
            key={name}
            style={
              {
                "--d": `${CHIP_START_MS + i * CHIP_GAP_MS}ms`,
                animationDelay: `${CHIP_START_MS + i * CHIP_GAP_MS}ms`,
              } as CSSProperties
            }
            className="origin-center [transform-box:fill-box] group-hover:animate-chip-pop motion-reduce:animate-none"
          >
            <rect
              x={x}
              y="6"
              width={CHIP_W[i]}
              height="18"
              rx="9"
              className="fill-slate-100 transition-[fill] duration-500 group-hover:fill-teal-100 group-hover:[transition-delay:var(--d)] motion-reduce:transition-none"
            />
            <text
              x={x + CHIP_W[i] / 2}
              y="19"
              textAnchor="middle"
              fontSize="11"
              className="fill-slate-400 transition-[fill] duration-500 group-hover:fill-teal-700 group-hover:[transition-delay:var(--d)] motion-reduce:transition-none"
            >
              {name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
