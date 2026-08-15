"use client";

import { useEffect, useRef } from "react";

/**
 * 背景光尘粒子(deepseek harness 粒子层浅色适配)。
 * - 蓝/绿/淡紫小光点(1.5-3.5px,低饱和+微弱发光),缓慢漂浮+呼吸闪烁
 * - 密度按视口面积(60-140),DPR≤1.5,页面隐藏暂停 rAF,reduced-motion 不启动
 */
type P = {
  x: number;
  y: number;
  r: number;
  color: string;
  alpha: number;
  vx: number;
  vy: number;
  ph: number;
  tw: number; // 呼吸速度
};

const COLORS = [
  "74,138,196", // 蓝
  "0,168,118", // 绿
  "139,127,214", // 淡紫
  "160,180,220", // 冷白蓝
];

export function StarDust() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let parts: P[] = [];
    let w = 0;
    let h = 0;
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

      const count = Math.max(60, Math.min(140, Math.round((w * h) / 18000)));
      parts = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 1.2 + Math.random() * 2.2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: 0.2 + Math.random() * 0.35,
        vx: (Math.random() - 0.5) * 0.14,
        vy: (Math.random() - 0.5) * 0.14,
        ph: Math.random() * Math.PI * 2,
        tw: 0.4 + Math.random() * 0.8,
      }));
    };

    const frame = () => {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      const t = performance.now() / 1000;
      for (const p of parts) {
        p.x += p.vx;
        p.y += p.vy;
        // 边缘回绕
        if (p.x < -4) p.x = w + 4;
        else if (p.x > w + 4) p.x = -4;
        if (p.y < -4) p.y = h + 4;
        else if (p.y > h + 4) p.y = -4;
        // 呼吸闪烁
        const a = p.alpha * (0.55 + 0.45 * Math.sin(t * p.tw + p.ph));
        ctx.globalAlpha = Math.max(0.05, a);
        ctx.fillStyle = `rgb(${p.color})`;
        ctx.shadowColor = `rgba(${p.color}, 0.8)`;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
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
    const onResize = () => build();

    build();
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
