"use client";

import { useEffect, useRef } from "react";

/**
 * 全屏背景大波浪:多层正弦波缓慢翻涌(装饰层)。
 * - 3 层波线横贯全屏,基位 45%/60%/75%,大振幅缓慢起伏(相位驱动)
 * - 极淡配色:品牌绿 + 深灰,不抢内容;下方极淡填充增加层次
 * - 性能:DPR≤1.5、页面隐藏暂停 rAF、resize 重建;reduced-motion 不启动
 * - 与液态玻璃顶栏配合:滚动时波浪穿过玻璃,磨砂感清晰可见
 */
type Layer = {
  base: number;
  amp: number;
  len: number;
  speed: number;
  color: string;
  alpha: number;
  width: number;
  fill: boolean;
  phase: number;
};

const LAYERS: Layer[] = [
  { base: 0.24, amp: 80, len: 1500, speed: 0.022, color: "0,168,118", alpha: 0.09, width: 2, fill: true, phase: 0 },
  { base: 0.5, amp: 130, len: 2100, speed: 0.016, color: "29,29,31", alpha: 0.055, width: 1.5, fill: true, phase: 2.1 },
  { base: 0.76, amp: 70, len: 1150, speed: 0.03, color: "29,29,31", alpha: 0.04, width: 1, fill: false, phase: 4.2 },
];

export function WaveField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

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

    const frame = () => {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      t += 1;
      for (const L of LAYERS) {
        const baseY = L.base * h;
        const phase = t * L.speed + L.phase;
        ctx.beginPath();
        ctx.moveTo(0, baseY + Math.sin(phase) * L.amp * 0.2);
        for (let x = 0; x <= w; x += 20) {
          const y =
            baseY +
            Math.sin((x / L.len) * Math.PI * 2 + phase) * L.amp +
            Math.sin((x / (L.len * 0.45)) * Math.PI * 2 + phase * 1.7) * L.amp * 0.35;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w, baseY + Math.sin(phase + 1) * L.amp * 0.2);
        if (L.fill) {
          ctx.lineTo(w, h);
          ctx.lineTo(0, h);
          ctx.closePath();
          ctx.fillStyle = `rgba(${L.color}, ${(L.alpha * 0.5).toFixed(3)})`;
          ctx.fill();
        }
        ctx.strokeStyle = `rgba(${L.color}, ${L.alpha.toFixed(3)})`;
        ctx.lineWidth = L.width;
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

    build();
    start();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("resize", build);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", build);
    };
  }, []);

  return (
    <canvas ref={ref} aria-hidden="true" className="absolute inset-0 h-full w-full" />
  );
}
