"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { useUmapPoints } from "@/hooks/useUmapPoints";
import {
  CELL_TYPE_LABELS,
  SUMMARY,
  shortCellTypeLabel,
  type Disease,
  type MarkerKey,
  type UmapPoint,
} from "@/lib/sc-covid";

// Validated against the site's light background (#f6f8fb): CVD separation
// far above the ΔE 8 target, so this pair is safe even for colorblind readers.
const CONDITION_COLOR: Record<Disease, string> = {
  normal: "#2a78d6",
  "COVID-19": "#eb6834",
};

// Emphasis view (one cell type lit, the rest pushed back): accent + gray,
// not the condition colors, so the two questions ("which condition" vs
// "which cell type") never look like the same encoding.
const EMPHASIS_COLOR = "#2a78d6";
const DEEMPHASIS_COLOR = "#c3c2b7";

// Sequential blue ramp (palette.md, steps 100/250/400/550/700), for marker
// expression. Piecewise-lerped between these five stops.
const SEQUENTIAL_RAMP: [number, string][] = [
  [0, "#cde2fb"],
  [0.25, "#86b6ef"],
  [0.5, "#3987e5"],
  [0.75, "#1c5cab"],
  [1, "#0d366b"],
];

function lerpHex(a: string, b: string, t: number): string {
  const ah = parseInt(a.slice(1), 16);
  const bh = parseInt(b.slice(1), 16);
  const ar = (ah >> 16) & 255;
  const ag = (ah >> 8) & 255;
  const ab = ah & 255;
  const br = (bh >> 16) & 255;
  const bg = (bh >> 8) & 255;
  const bb = bh & 255;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const b2 = Math.round(ab + (bb - ab) * t);
  return `rgb(${r}, ${g}, ${b2})`;
}

function sequentialColor(t: number): string {
  const clamped = Math.min(1, Math.max(0, t));
  for (let i = 0; i < SEQUENTIAL_RAMP.length - 1; i++) {
    const [t0, c0] = SEQUENTIAL_RAMP[i];
    const [t1, c1] = SEQUENTIAL_RAMP[i + 1];
    if (clamped <= t1) return lerpHex(c0, c1, (clamped - t0) / (t1 - t0));
  }
  return SEQUENTIAL_RAMP[SEQUENTIAL_RAMP.length - 1][1];
}

const PADDING = 24;
const GRID_CELL = 10; // px bucket for hover hit-testing
const HOVER_RADIUS = 8; // px

const MARKERS: MarkerKey[] = ["CD14", "MKI67", "IGHG1"];
type ViewMode = "condition" | "celltype" | "marker";

type Projected = { xs: Float32Array; ys: Float32Array };

function projectPoints(points: UmapPoint[], size: number): Projected {
  let xMin = Infinity;
  let xMax = -Infinity;
  let yMin = Infinity;
  let yMax = -Infinity;
  for (const p of points) {
    if (p.x < xMin) xMin = p.x;
    if (p.x > xMax) xMax = p.x;
    if (p.y < yMin) yMin = p.y;
    if (p.y > yMax) yMax = p.y;
  }
  const plotSize = size - PADDING * 2;
  const scale = plotSize / Math.max(xMax - xMin, yMax - yMin);
  const xs = new Float32Array(points.length);
  const ys = new Float32Array(points.length);
  for (let i = 0; i < points.length; i++) {
    xs[i] = PADDING + (points[i].x - xMin) * scale;
    // flip y: UMAP's +y is up, canvas's +y is down
    ys[i] = size - PADDING - (points[i].y - yMin) * scale;
  }
  return { xs, ys };
}

type HoverGrid = { cols: number; buckets: Map<number, number[]> };

function buildHoverGrid(xs: Float32Array, ys: Float32Array, size: number): HoverGrid {
  const cols = Math.ceil(size / GRID_CELL);
  const buckets = new Map<number, number[]>();
  for (let i = 0; i < xs.length; i++) {
    const col = Math.floor(xs[i] / GRID_CELL);
    const row = Math.floor(ys[i] / GRID_CELL);
    const key = row * cols + col;
    const arr = buckets.get(key);
    if (arr) arr.push(i);
    else buckets.set(key, [i]);
  }
  return { cols, buckets };
}

function findNearest(
  mx: number,
  my: number,
  xs: Float32Array,
  ys: Float32Array,
  grid: HoverGrid,
): number | null {
  const col = Math.floor(mx / GRID_CELL);
  const row = Math.floor(my / GRID_CELL);
  let best = -1;
  let bestDist = HOVER_RADIUS * HOVER_RADIUS;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const arr = grid.buckets.get((row + dr) * grid.cols + (col + dc));
      if (!arr) continue;
      for (const i of arr) {
        const dx = xs[i] - mx;
        const dy = ys[i] - my;
        const d = dx * dx + dy * dy;
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      }
    }
  }
  return best === -1 ? null : best;
}

const DEFAULT_CELL_TYPE = "B cell";

export default function CellMap() {
  const umap = useUmapPoints();
  const points = umap.status === "loaded" ? umap.points : null;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(0);

  const [mode, setMode] = useState<ViewMode>("condition");
  const [selectedCellType, setSelectedCellType] = useState(DEFAULT_CELL_TYPE);
  const [selectedMarker, setSelectedMarker] = useState<MarkerKey>("CD14");
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width) setSize(Math.round(width));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const projected = useMemo(
    () => (points && size > 0 ? projectPoints(points, size) : null),
    [points, size],
  );

  const hoverGrid = useMemo(
    () => (projected ? buildHoverGrid(projected.xs, projected.ys, size) : null),
    [projected, size],
  );

  // Cell types ordered by how many cells they cover, for the picker.
  const cellTypesByCount = useMemo(() => {
    if (!points) return [];
    const counts = new Map<string, number>();
    for (const p of points) counts.set(p.ct, (counts.get(p.ct) ?? 0) + 1);
    return [...counts.keys()].sort((a, b) => counts.get(b)! - counts.get(a)!);
  }, [points]);

  // One ascending-sorted index list per marker, precomputed once, so
  // switching markers redraws instantly instead of re-sorting on click.
  const markerSortedIndices = useMemo(() => {
    if (!points) return null;
    const result = {} as Record<MarkerKey, Int32Array>;
    for (const key of MARKERS) {
      const field = key.toLowerCase() as "cd14" | "mki67" | "ighg1";
      const idx = Int32Array.from(points.keys());
      idx.sort((a, b) => points[a][field] - points[b][field]);
      result[key] = idx;
    }
    return result;
  }, [points]);

  useEffect(() => {
    if (!points || !projected || !canvasRef.current || size === 0) return;

    const canvas = canvasRef.current;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size, size);

    const { xs, ys } = projected;
    const dot = (i: number, radius: number) => {
      ctx.beginPath();
      ctx.arc(xs[i], ys[i], radius, 0, Math.PI * 2);
      ctx.fill();
    };

    if (mode === "condition") {
      ctx.globalAlpha = 0.55;
      for (let i = 0; i < points.length; i++) {
        ctx.fillStyle = CONDITION_COLOR[points[i].d];
        dot(i, 1.6);
      }
    } else if (mode === "celltype") {
      ctx.globalAlpha = 0.28;
      ctx.fillStyle = DEEMPHASIS_COLOR;
      for (let i = 0; i < points.length; i++) {
        if (points[i].ct !== selectedCellType) dot(i, 1.3);
      }
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = EMPHASIS_COLOR;
      for (let i = 0; i < points.length; i++) {
        if (points[i].ct === selectedCellType) dot(i, 2.2);
      }
    } else {
      const field = selectedMarker.toLowerCase() as "cd14" | "mki67" | "ighg1";
      const vmax = SUMMARY.markers[selectedMarker].vmax_p99;
      const order = markerSortedIndices?.[selectedMarker];
      ctx.globalAlpha = 0.65;
      const indices = order ?? points.keys();
      for (const i of indices) {
        ctx.fillStyle = sequentialColor(points[i][field] / vmax);
        dot(i, 1.6);
      }
    }
    ctx.globalAlpha = 1;
  }, [points, projected, size, mode, selectedCellType, selectedMarker, markerSortedIndices]);

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!projected || !hoverGrid) return;
    const mx = e.nativeEvent.offsetX;
    const my = e.nativeEvent.offsetY;
    const idx = findNearest(mx, my, projected.xs, projected.ys, hoverGrid);
    setHoverIndex(idx);
    setHoverPos({ x: mx, y: my });
  };

  const hoverPoint = hoverIndex !== null && points ? points[hoverIndex] : null;

  return (
    <div>
      <ModeSwitch mode={mode} onChange={setMode} />

      <div className="mt-4">
        {mode === "celltype" && (
          <CellTypeControl
            options={cellTypesByCount}
            value={selectedCellType}
            onChange={setSelectedCellType}
          />
        )}
        {mode === "marker" && (
          <MarkerControl value={selectedMarker} onChange={setSelectedMarker} />
        )}
      </div>

      <div
        ref={containerRef}
        className="relative mt-4 aspect-square w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white"
      >
        {umap.status === "loading" && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-400">
            Loading {"~24,000"} cells...
          </div>
        )}
        {umap.status === "error" && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-rose-600">
            Could not load the cell data.
          </div>
        )}
        <canvas
          ref={canvasRef}
          style={{ width: size, height: size }}
          onPointerMove={onPointerMove}
          onPointerLeave={() => setHoverIndex(null)}
          role="img"
          aria-label="UMAP scatter plot of 24,000 blood cells. Switch views to color by condition, by a single cell type against the rest, or by marker gene expression."
        />
        {hoverPoint && (
          <Tooltip point={hoverPoint} x={hoverPos.x} y={hoverPos.y} size={size} />
        )}
      </div>

      <div className="mt-4">
        {mode === "condition" && (
          <div className="flex items-center gap-6 text-sm text-slate-600">
            <LegendSwatch color={CONDITION_COLOR["COVID-19"]} label="COVID-19" />
            <LegendSwatch color={CONDITION_COLOR.normal} label="Healthy" />
          </div>
        )}
        {mode === "celltype" && (
          <div className="flex items-center gap-6 text-sm text-slate-600">
            <LegendSwatch
              color={EMPHASIS_COLOR}
              label={shortCellTypeLabel(selectedCellType)}
            />
            <LegendSwatch color={DEEMPHASIS_COLOR} label="Other cells" />
          </div>
        )}
        {mode === "marker" && <MarkerScale marker={selectedMarker} />}
      </div>
    </div>
  );
}

function ModeSwitch({
  mode,
  onChange,
}: {
  mode: ViewMode;
  onChange: (m: ViewMode) => void;
}) {
  const options: { id: ViewMode; label: string }[] = [
    { id: "condition", label: "Condition" },
    { id: "celltype", label: "Cell type" },
    { id: "marker", label: "Marker gene" },
  ];
  return (
    <div className="inline-flex gap-1 rounded-full border border-slate-200/80 bg-white/70 p-1">
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          aria-pressed={mode === opt.id}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-200 ${
            mode === opt.id
              ? "bg-slate-900 text-white"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function CellTypeControl({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex items-center gap-3 text-sm text-slate-600">
      Highlight
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800"
      >
        {options.map((ct) => (
          <option key={ct} value={ct}>
            {CELL_TYPE_LABELS[ct] ?? ct}
          </option>
        ))}
      </select>
    </label>
  );
}

function MarkerControl({
  value,
  onChange,
}: {
  value: MarkerKey;
  onChange: (v: MarkerKey) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {MARKERS.map((key) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          aria-pressed={value === key}
          className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors duration-200 ${
            value === key
              ? "border-slate-900 bg-slate-900 text-white"
              : "border-slate-200 text-slate-600 hover:border-slate-300"
          }`}
        >
          {key}
        </button>
      ))}
      <span className="text-sm text-slate-500">{SUMMARY.markers[value].meaning}</span>
    </div>
  );
}

function LegendSwatch({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}

function MarkerScale({ marker }: { marker: MarkerKey }) {
  const gradient = SEQUENTIAL_RAMP.map(([t, c]) => `${c} ${t * 100}%`).join(", ");
  return (
    <div className="flex items-center gap-3 text-xs text-slate-500">
      <span>0</span>
      <span
        aria-hidden
        className="h-2 w-32 rounded-full"
        style={{ background: `linear-gradient(to right, ${gradient})` }}
      />
      <span>{SUMMARY.markers[marker].vmax_p99} (p99)</span>
    </div>
  );
}

function Tooltip({
  point,
  x,
  y,
  size,
}: {
  point: UmapPoint;
  x: number;
  y: number;
  size: number;
}) {
  // Flip to the left/above once the cursor is past the far edge, so the
  // card never gets clipped by the chart's own rounded corners.
  const flipX = x > size - 160;
  const flipY = y > size - 110;
  return (
    <div
      className="pointer-events-none absolute z-10 w-44 rounded-lg border border-slate-200 bg-white/95 p-3 text-xs shadow-lg backdrop-blur-sm"
      style={{
        left: flipX ? x - 12 : x + 12,
        top: flipY ? y - 12 : y + 12,
        transform: `translate(${flipX ? "-100%" : "0"}, ${flipY ? "-100%" : "0"})`,
      }}
    >
      <p className="font-medium text-slate-900">{point.ct}</p>
      <p className="mt-1 text-slate-500">
        {point.d === "COVID-19" ? "COVID-19" : "Healthy"}
      </p>
      <dl className="mt-2 grid grid-cols-3 gap-1 text-slate-600">
        <div>
          <dt className="text-slate-400">CD14</dt>
          <dd>{point.cd14.toFixed(2)}</dd>
        </div>
        <div>
          <dt className="text-slate-400">MKI67</dt>
          <dd>{point.mki67.toFixed(2)}</dd>
        </div>
        <div>
          <dt className="text-slate-400">IGHG1</dt>
          <dd>{point.ighg1.toFixed(2)}</dd>
        </div>
      </dl>
    </div>
  );
}
