"use client";

import { useEffect, useRef } from "react";

/**
 * 全屏背景 3D 波浪:斜上方俯视的立体波浪网格(黑色)。
 * - 地平线在屏幕顶部,波浪行从远(浅/密)到近(深/疏)辐射展开
 * - 横向波浪线 + 纵向网格线组成波浪面,黑色线条明显
 * - 性能:DPR≤1.5、页面隐藏暂停 rAF、resize 重建;reduced-motion 不启动
 */
export function WaveField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const ROWS = 16;
    let raf = 0;
    let w = 0;
    let h = 0;
    let t = 0;
    let running = true;

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    /** 某深度(0远-1近)处波浪的 y 基线与振幅 */
    const depthY = (depth: number) =>
      horizon + (h - horizon) * Math.pow(depth, 1.9);
    const depthAmp = (depth: number) => (16 + depth * 48) * (h / 900);
    const depthPhase = (depth: number, x: number) =>
      t * 0.018 + depth * 0.7 + (x / w) * Math.PI * 2 * 1.1;

    let horizon = 0;

    const frame = () => {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      t += 1;

      // ---------- 横向波浪线(透视辐射) ----------
      for (let i = 0; i < ROWS; i++) {
        const depth = i / (ROWS - 1);
        const yBase = depthY(depth);
        const amp = depthAmp(depth);
        const alpha = 0.2 + depth * 0.45;
        ctx.strokeStyle = `rgba(17, 17, 19, ${alpha.toFixed(3)})`;
        ctx.lineWidth = depth > 0.75 ? 2 : 1.2;
        ctx.beginPath();
        for (let x = 0; x <= w; x += 8) {
          const phase = depthPhase(depth, x);
          const y =
            yBase +
            Math.sin(phase) * amp +
            Math.sin(phase * 0.5 + depth * 2.1) * amp * 0.4;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // ---------- 纵向网格线(深度方向,随波浪摆动,增强立体感) ----------
      const STEP = 56;
      for (let gx = 0; gx <= w; gx += STEP) {
        ctx.strokeStyle = `rgba(17, 17, 19, 0.1)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        const steps = ROWS * 2;
        for (let i = 0; i <= steps; i++) {
          const depth = i / steps;
          const amp = depthAmp(depth);
          const phase = t * 0.018 + depth * 0.7;
          const y = depthY(depth);
          const x = gx + Math.sin(phase) * amp * 0.55;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      running = true;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };
    const onResize = () => {
      build();
      horizon = h * 0.06;
    };

    build();
    horizon = h * 0.06; // 地平线贴近顶部,波浪覆盖顶栏区域
    start();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("resize", onResize);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas ref={ref} aria-hidden="true" className="absolute inset-0 h-full w-full" />
  );
}
