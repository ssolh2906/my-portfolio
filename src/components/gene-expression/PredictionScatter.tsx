"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { usePredictions } from "@/hooks/usePredictions";
import { MODEL_ROWS, type ModelId } from "@/lib/gene-expression";

const POINT_COLOR = "#2a78d6";
const DIAGONAL_COLOR = "#c3c2b7";
const AXIS_COLOR = "#dadee3";
const TICK_COLOR = "#9ea5ad";

const PADDING = 36;
const GRID_CELL = 10; // px bucket for hover hit-testing
const HOVER_RADIUS = 8; // px

/** Round, evenly-spaced tick values covering [min, max] - not just the raw domain edges. */
function niceTicks(min: number, max: number, targetCount = 4): number[] {
  const range = max - min || 1;
  const rawStep = range / targetCount;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const normalized = rawStep / magnitude;
  const step = (normalized < 1.5 ? 1 : normalized < 3 ? 2 : normalized < 7 ? 5 : 10) * magnitude;

  const ticks: number[] = [];
  for (let v = Math.ceil(min / step) * step; v <= max + step * 1e-6; v += step) {
    ticks.push(Math.round(v / step) * step);
  }
  return ticks;
}

// Same domain for every model so toggling doesn't rescale the axes underneath you.
function fillProjection(
  actual: number[],
  predicted: number[],
  size: number,
  domainMin: number,
  domainMax: number,
  xs: Float32Array,
  ys: Float32Array,
) {
  const plotSize = size - PADDING * 2;
  const scale = plotSize / (domainMax - domainMin);
  for (let i = 0; i < actual.length; i++) {
    xs[i] = PADDING + (actual[i] - domainMin) * scale;
    // flip y: higher predicted value should sit higher on screen
    ys[i] = size - PADDING - (predicted[i] - domainMin) * scale;
  }
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

export default function PredictionScatter() {
  const predictions = usePredictions();
  const data = predictions.status === "loaded" ? predictions.data : null;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(0);
  const [model, setModel] = useState<ModelId>(MODEL_ROWS[0].id);
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

  const domain = useMemo(() => {
    if (!data) return null;
    let min = Infinity;
    let max = -Infinity;
    for (const v of data.actual) {
      if (v < min) min = v;
      if (v > max) max = v;
    }
    for (const arr of Object.values(data.predicted)) {
      for (const v of arr) {
        if (v < min) min = v;
        if (v > max) max = v;
      }
    }
    return { min, max };
  }, [data]);

  const projected = useMemo(() => {
    if (!data || !domain || size === 0) return null;
    const n = data.actual.length;
    const xs = new Float32Array(n);
    const ys = new Float32Array(n);
    fillProjection(data.actual, data.predicted[model], size, domain.min, domain.max, xs, ys);
    return { xs, ys };
  }, [data, domain, model, size]);

  const hoverGrid = useMemo(
    () => (projected ? buildHoverGrid(projected.xs, projected.ys, size) : null),
    [projected, size],
  );

  useEffect(() => {
    if (!projected || !domain || !canvasRef.current || size === 0) return;

    const canvas = canvasRef.current;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size, size);

    // axes
    ctx.strokeStyle = AXIS_COLOR;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PADDING, size - PADDING);
    ctx.lineTo(size - PADDING, size - PADDING);
    ctx.moveTo(PADDING, PADDING);
    ctx.lineTo(PADDING, size - PADDING);
    ctx.stroke();

    // tick marks + numbers, so the plot has some sense of scale
    const plotSize = size - PADDING * 2;
    const scale = plotSize / (domain.max - domain.min);
    const ticks = niceTicks(domain.min, domain.max);
    ctx.strokeStyle = TICK_COLOR;
    ctx.fillStyle = TICK_COLOR;
    ctx.font = "10px system-ui, sans-serif";
    for (const t of ticks) {
      const tx = PADDING + (t - domain.min) * scale;
      const ty = size - PADDING - (t - domain.min) * scale;

      ctx.beginPath();
      ctx.moveTo(tx, size - PADDING);
      ctx.lineTo(tx, size - PADDING + 4);
      ctx.stroke();
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(String(t), tx, size - PADDING + 6);

      ctx.beginPath();
      ctx.moveTo(PADDING - 4, ty);
      ctx.lineTo(PADDING, ty);
      ctx.stroke();
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(String(t), PADDING - 7, ty);
    }

    // y = x reference (perfect prediction)
    ctx.strokeStyle = DIAGONAL_COLOR;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(PADDING, size - PADDING);
    ctx.lineTo(size - PADDING, PADDING);
    ctx.stroke();
    ctx.setLineDash([]);

    // points
    const { xs, ys } = projected;
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = POINT_COLOR;
    for (let i = 0; i < xs.length; i++) {
      ctx.beginPath();
      ctx.arc(xs[i], ys[i], 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }, [projected, domain, size]);

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!projected || !hoverGrid) return;
    const mx = e.nativeEvent.offsetX;
    const my = e.nativeEvent.offsetY;
    const idx = findNearest(mx, my, projected.xs, projected.ys, hoverGrid);
    setHoverIndex(idx);
    setHoverPos({ x: mx, y: my });
  };

  const hoverPoint =
    hoverIndex !== null && data
      ? { actual: data.actual[hoverIndex], predicted: data.predicted[model][hoverIndex] }
      : null;

  const activeRow = MODEL_ROWS.find((r) => r.id === model)!;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ModelSwitch model={model} onChange={setModel} />
        <span className="text-sm text-slate-500">
          R&sup2; <span className="font-medium text-slate-900 tabular-nums">{activeRow.r2.toFixed(3)}</span>
        </span>
      </div>

      <div
        ref={containerRef}
        className="relative mt-4 aspect-square w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white"
      >
        <span className="pointer-events-none absolute left-2 top-2 text-[10px] text-slate-400">
          &uarr; Predicted
        </span>
        {predictions.status === "loading" && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-400">
            Loading predictions...
          </div>
        )}
        {predictions.status === "error" && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-rose-600">
            Could not load prediction data.
          </div>
        )}
        <canvas
          ref={canvasRef}
          style={{ width: size, height: size }}
          onPointerMove={onPointerMove}
          onPointerLeave={() => setHoverIndex(null)}
          role="img"
          aria-label={`Scatter plot of actual vs. predicted gene expression for the ${activeRow.label} model, ${data?.actual.length ?? ""} test genes. Dashed line marks a perfect prediction.`}
        />
        {hoverPoint && (
          <div
            className="pointer-events-none absolute z-10 rounded-lg border border-slate-200 bg-white/95 px-3 py-2 text-xs shadow-lg backdrop-blur-sm"
            style={{
              left: hoverPos.x > size - 140 ? hoverPos.x - 12 : hoverPos.x + 12,
              top: hoverPos.y > size - 70 ? hoverPos.y - 12 : hoverPos.y + 12,
              transform: `translate(${hoverPos.x > size - 140 ? "-100%" : "0"}, ${
                hoverPos.y > size - 70 ? "-100%" : "0"
              })`,
            }}
          >
            <p className="text-slate-500">
              actual <span className="font-medium text-slate-900 tabular-nums">{hoverPoint.actual.toFixed(2)}</span>
            </p>
            <p className="mt-0.5 text-slate-500">
              predicted{" "}
              <span className="font-medium text-slate-900 tabular-nums">{hoverPoint.predicted.toFixed(2)}</span>
            </p>
          </div>
        )}
      </div>

      <p className="mt-3 text-center text-xs text-slate-400">
        Actual (z-scored log expression) &rarr;
      </p>
    </div>
  );
}

function ModelSwitch({
  model,
  onChange,
}: {
  model: ModelId;
  onChange: (m: ModelId) => void;
}) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-full border border-slate-200/80 bg-white/70 p-1">
      {MODEL_ROWS.map((row) => (
        <button
          key={row.id}
          onClick={() => onChange(row.id)}
          aria-pressed={model === row.id}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-200 ${
            model === row.id
              ? "bg-slate-900 text-white"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          {row.label}
        </button>
      ))}
    </div>
  );
}
