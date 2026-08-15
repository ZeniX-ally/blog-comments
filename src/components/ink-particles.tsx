"use client";

import { useEffect, useRef } from "react";

/**
 * 框内黑色粒子 + 力场排斥交互。
 * - 粒子缓慢漂移,密度按容器面积(40-140 个)
 * - 鼠标(pointer)所在处形成排斥力场:半径内的粒子被推开,
 *   离开时带一点动量,形成流体般的退让感
 * - ResizeObserver 自适应;prefers-reduced-motion 不启动;rAF 清理
 */
export function InkParticles() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    type P = {
      x: number;
      y: number;
      r: number;
      a: number;
      // 基础漂移:恒定速度,不衰减(粒子一直移动)
      bx: number;
      by: number;
      // 力场冲击:被鼠标推开后的附加速度,单独衰减
      ix: number;
      iy: number;
      ph: number;
    };
    let raf = 0;
    let parts: P[] = [];
    let w = 0;
    let h = 0;
    // 指针位置:null = 不在框内
    let pointer: { x: number; y: number; vx: number; vy: number } | null = null;
    let lastPointer = { x: 0, y: 0, t: 0 };

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.max(240, Math.min(780, Math.round((w * h) / 1500)));
      parts = Array.from({ length: count }, () => {
        // 恒定漂移速度:0.5-1.6 px/帧,方向随机,永不停止
        const speed = 0.5 + Math.random() * 1.1;
        const angle = Math.random() * Math.PI * 2;
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          r: 0.6 + Math.random() * 1.6,
          a: 0.14 + Math.random() * 0.28,
          bx: Math.cos(angle) * speed,
          by: Math.sin(angle) * speed,
          ix: 0,
          iy: 0,
          ph: Math.random() * Math.PI * 2,
        };
      });
    };

    // 排斥力场:指针速度越大,斥力越强(带惯性)
    const FORCE_RADIUS = 130;

    const frame = () => {
      ctx.clearRect(0, 0, w, h);
      const t = performance.now();
      for (const p of parts) {
        // 随机游走:每个粒子有独立的抖动方向,缓慢变化(走迷宫式游动)
        const wander = Math.sin(t / 2600 + p.ph);
        const wander2 = Math.cos(t / 3400 + p.ph * 1.7);

        // 指针排斥(冲击力,加到 ix/iy)
        if (pointer) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const dist = Math.hypot(dx, dy);
          if (dist < FORCE_RADIUS && dist > 0.01) {
            const falloff = 1 - dist / FORCE_RADIUS;
            const strength = falloff * falloff * 1.6;
            const nx = dx / dist;
            const ny = dy / dist;
            p.ix += nx * strength * 0.8 + pointer.vx * 0.02;
            p.iy += ny * strength * 0.8 + pointer.vy * 0.02;
          }
        }

        // 冲击力衰减(只衰减冲击,基础漂移保留)
        p.ix *= 0.9;
        p.iy *= 0.9;

        // 总位移 = 基础漂移 + 随机游走抖动 + 冲击
        p.x += p.bx + wander * 0.18;
        p.y += p.by + wander2 * 0.18 + p.iy;
        p.x += p.ix;

        // 漂移方向缓慢偏转(不走直线,更有生命感)
        p.bx += wander * 0.004;
        p.by += wander2 * 0.004;
        // 限速:基础速度保持 0.5-1.6 区间
        const baseSpeed = Math.hypot(p.bx, p.by);
        if (baseSpeed > 2.2) {
          p.bx = (p.bx / baseSpeed) * 2.2;
          p.by = (p.by / baseSpeed) * 2.2;
        }

        // 边界回绕
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

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      // 指针速度(用于动量)
      const dt = Math.max(16, performance.now() - lastPointer.t);
      const vx = ((x - lastPointer.x) / dt) * 60;
      const vy = ((y - lastPointer.y) / dt) * 60;
      lastPointer = { x, y, t: performance.now() };
      pointer = { x, y, vx, vy };
    };

    const onPointerLeave = () => {
      pointer = null;
    };

    canvas.addEventListener("pointermove", onPointerMove, { passive: true });
    canvas.addEventListener("pointerleave", onPointerLeave, { passive: true });

    build();
    raf = requestAnimationFrame(frame);
    const ro = new ResizeObserver(build);
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return (
    <canvas ref={ref} aria-hidden="true" className="absolute inset-0 h-full w-full" />
  );
}
