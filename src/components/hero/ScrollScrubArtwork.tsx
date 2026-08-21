"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";

const FRAME_COUNT = 72;
const framePath = (index: number) =>
  `/hero-frames/f${String(index).padStart(3, "0")}.webp`;

type Props = {
  target: React.RefObject<HTMLElement | null>;
};

export default function ScrollScrubArtwork({ target }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(0);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target,
    offset: ["start start", "end start"],
  });
  const frameIndex = useTransform(scrollYProgress, [0, 1], [0, FRAME_COUNT - 1]);

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

  useMotionValueEvent(frameIndex, "change", (latest) => {
    if (reduceMotion) return;
    const index = Math.min(FRAME_COUNT - 1, Math.max(0, Math.round(latest)));
    if (index === currentFrameRef.current) return;
    currentFrameRef.current = index;

    const img = imagesRef.current[index];
    if (img && !img.complete) {
      img.onload = () => draw(index);
      return;
    }
    draw(index);
  });

  return <canvas ref={canvasRef} aria-hidden className="h-full w-full" />;
}
