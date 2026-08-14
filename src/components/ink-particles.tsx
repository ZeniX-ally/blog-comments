"use client";

import { useEffect, useRef } from "react";

/**
 * 框内黑色粒子:浅色背景上的深色微粒缓慢上浮(简约装饰,无噪声)。
 * - 密度按容器面积(18-70 个),1-3px 深色圆点,低透明度
 * - ResizeObserver 自适应容器;prefers-reduced-motion 不启动;rAF 正常清理
 */
export function InkParticles() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    type P = { x: number; y: number; r: number; a: number; vx: number; vy: number; ph: number };
    let raf = 0;
    let parts: P[] = [];
    let w = 0;
    let h = 0;

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.max(18, Math.min(70, Math.round((w * h) / 16000)));
      parts = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.6 + Math.random() * 1.8,
        a: 0.12 + Math.random() * 0.3,
        vx: (Math.random() - 0.5) * 0.12,
        vy: -0.05 - Math.random() * 0.09,
        ph: Math.random() * Math.PI * 2,
      }));
    };

    const frame = () => {
      ctx.clearRect(0, 0, w, h);
      const t = performance.now();
      for (const p of parts) {
        p.x += p.vx;
        p.y += p.vy + Math.sin(t / 3000 + p.ph) * 0.02;
        if (p.y < -4) {
          p.y = h + 4;
          p.x = Math.random() * w;
        }
        if (p.x < -4) p.x = w + 4;
        else if (p.x > w + 4) p.x = -4;
        ctx.globalAlpha = p.a;
        ctx.fillStyle = "#111113";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    };

    build();
    raf = requestAnimationFrame(frame);
    const ro = new ResizeObserver(build);
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas ref={ref} aria-hidden="true" className="absolute inset-0 h-full w-full" />
  );
}
