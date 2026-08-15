"use client";

import { useEffect, useRef } from "react";

/**
 * 粒子连线背景(visualization-collection MatchLine 风格,浅色适配)。
 * - 深灰粒子缓慢漂浮,距离阈值内自动连线(星座感)
 * - 线透明度随距离衰减,极淡克制;reduced-motion 停用;页面隐藏暂停
 */
type P = { x: number; y: number; vx: number; vy: number; r: number; a: number };

export function Constellation() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const LINK_DIST = 150;
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

      const count = Math.max(50, Math.min(110, Math.round((w * h) / 22000)));
      parts = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: 1.2 + Math.random() * 1.8,
        a: 0.15 + Math.random() * 0.3,
      }));
    };

    const frame = () => {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);

      // 移动 + 边缘回绕
      for (const p of parts) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -6) p.x = w + 6;
        else if (p.x > w + 6) p.x = -6;
        if (p.y < -6) p.y = h + 6;
        else if (p.y > h + 6) p.y = -6;
      }

      // 连线(O(n²),粒子数 ≤110 可接受)
      for (let i = 0; i < parts.length; i++) {
        const a = parts[i];
        for (let j = i + 1; j < parts.length; j++) {
          const b = parts[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK_DIST * LINK_DIST) {
            const alpha = (1 - Math.sqrt(d2) / LINK_DIST) * 0.1;
            ctx.strokeStyle = `rgba(58, 58, 64, ${alpha.toFixed(3)})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // 粒子
      for (const p of parts) {
        ctx.globalAlpha = p.a;
        ctx.fillStyle = "#3a3a40";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

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
