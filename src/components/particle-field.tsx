"use client";

import { useEffect, useRef } from "react";

/**
 * 全站背景粒子场(Antigravity 式装饰层)。
 * - 大量 1-3px 圆点 + 短划,沿椭圆轨道缓慢漂移,形成弧线/光环/波浪
 * - 绿为主色,点缀蓝/紫/黄;透明度极低,视觉独立于阅读层、不遮挡交互
 * - 性能:DPR 上限 1.5、密度按视口面积、页面隐藏时暂停 rAF、resize 防抖重建
 * - prefers-reduced-motion 时完全不启动
 */
type Particle = {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  theta: number;
  omega: number;
  phase: number;
  size: number;
  len: number;
  alpha: number;
  color: string;
  drift: number;
  wave: number;
};

/** 颜色权重:绿主色 60%,蓝/紫 15%,黄 10% */
const COLORS: [string, number][] = [
  ["0,255,156", 0.6],
  ["125,211,255", 0.15],
  ["196,181,253", 0.15],
  ["255,209,102", 0.1],
];

function pickColor(): string {
  let acc = Math.random();
  for (const [c, w] of COLORS) {
    if (acc < w) return c;
    acc -= w;
  }
  return COLORS[0][0];
}

export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let resizeTimer = 0;
    let particles: Particle[] = [];
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

      const area = w * h;
      const count = Math.max(90, Math.min(220, Math.round(area / 9000)));
      particles = Array.from({ length: count }, () => {
        const ring = Math.random() < 0.72; // 多数沿弧线轨道
        return {
          cx: w * (0.12 + Math.random() * 0.76),
          cy: h * (0.12 + Math.random() * 0.76),
          rx: ring ? (0.02 + Math.random() * 0.13) * w : 0,
          ry: ring ? (0.02 + Math.random() * 0.15) * h : 0,
          theta: Math.random() * Math.PI * 2,
          omega: (0.0004 + Math.random() * 0.0016) * (Math.random() < 0.5 ? 1 : -1),
          phase: Math.random() * Math.PI * 2,
          size: 0.7 + Math.random() * 2.1,
          len: Math.random() < 0.32 ? 5 + Math.random() * 10 : 0,
          alpha: 0.1 + Math.random() * 0.28,
          color: pickColor(),
          drift: (Math.random() - 0.5) * 0.05,
          wave: 3 + Math.random() * 9,
        };
      });
    };

    const frame = () => {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      t += 1;
      for (const p of particles) {
        p.theta += p.omega;
        const x = p.cx + p.rx * Math.cos(p.theta) + p.drift * t;
        const y =
          p.cy +
          p.ry * Math.sin(p.theta) +
          Math.sin(p.theta * 2 + p.phase) * p.wave * 0.35;
        ctx.globalAlpha = p.alpha;
        if (p.len > 0) {
          const dx = -p.ry * Math.sin(p.theta);
          const dy = p.rx * Math.cos(p.theta);
          const d = Math.hypot(dx, dy) || 1;
          ctx.strokeStyle = `rgba(${p.color},${p.alpha})`;
          ctx.lineWidth = p.size;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + (dx / d) * p.len, y + (dy / d) * p.len);
          ctx.stroke();
        } else {
          const s = p.size;
          ctx.fillStyle = `rgba(${p.color},1)`;
          ctx.fillRect(x - s / 2, y - s / 2, s, s);
        }
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
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(build, 200);
    };

    build();
    start();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("resize", onResize);

    return () => {
      stop();
      window.clearTimeout(resizeTimer);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="particle-canvas" />;
}
