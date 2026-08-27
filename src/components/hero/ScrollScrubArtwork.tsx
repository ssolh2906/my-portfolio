"use client";

import { useCallback, useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
// Scroll-scrubbed version — disabled in favor of a simple auto-loop below.
// The artwork sits in a section shorter than the viewport, so it scrolled
// out of view before the more interesting frames near the end ever got a
// chance to show. Kept here in case scroll-scrubbing is worth revisiting
// (e.g. with a taller hero section).
// import { useMotionValueEvent, useScroll, useTransform } from "framer-motion";

const FRAME_COUNT = 72;
const FRAME_INTERVAL_MS = 60;
const framePath = (index: number) =>
  `/hero-frames/f${String(index).padStart(3, "0")}.webp`;

type Props = {
  target: React.RefObject<HTMLElement | null>;
};

export default function ScrollScrubArtwork({ target }: Props) {
  void target; // unused while scroll-scrubbing is disabled, see above

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(0);
  const reduceMotion = useReducedMotion();

  // const { scrollYProgress } = useScroll({
  //   target,
  //   offset: ["start start", "end start"],
  // });
  // const frameIndex = useTransform(scrollYProgress, [0, 0.5], [0, FRAME_COUNT - 1]);

  const draw = useCallback((index: number) => {
    const canvas = canvasRef.current;
    const img = imagesRef.current[index];
    const ctx = canvas?.getContext("2d");
    if (!canvas || !img || !ctx || !img.complete) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }, []);

  useEffect(() => {
    const images = Array.from({ length: FRAME_COUNT }, (_, i) => {
      const img = new Image();
      img.src = framePath(i);
      return img;
    });
    imagesRef.current = images;
    images[0].onload = () => draw(0);

    function resize() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      draw(currentFrameRef.current);
    }
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [draw]);

  // useMotionValueEvent(frameIndex, "change", (latest) => {
  //   if (reduceMotion) return;
  //   const index = Math.min(FRAME_COUNT - 1, Math.max(0, Math.round(latest)));
  //   if (index === currentFrameRef.current) return;
  //   currentFrameRef.current = index;
  //
  //   const img = imagesRef.current[index];
  //   if (img && !img.complete) {
  //     img.onload = () => draw(index);
  //     return;
  //   }
  //   draw(index);
  // });

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => {
      const next = (currentFrameRef.current + 1) % FRAME_COUNT;
      currentFrameRef.current = next;
      const img = imagesRef.current[next];
      if (img && !img.complete) {
        img.onload = () => draw(next);
        return;
      }
      draw(next);
    }, FRAME_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [draw, reduceMotion]);

  return <canvas ref={canvasRef} aria-hidden className="h-full w-full" />;
}
