"use client";

import { useEffect } from "react";

/**
 * 全站点击特效(交互按钮统一反馈)。
 * - 事件委托:点击 .btn-pill / button / a[href] / .post-row / .light-card 时触发
 * - 效果:点击位置扩散一枚绿色涟漪环 + 8 颗粒子四散爆裂淡出
 * - 命令彩蛋终端(input 区域)与触屏(pointer: coarse)只保留涟漪,不爆粒子
 * - prefers-reduced-motion 时仅保留涟漪(低动效),动画结束自动清理 DOM
 * - 零依赖,WAAPI 驱动,不触发布局
 */

const PARTICLE_COUNT = 10;
const COLORS = ["#00ff9c", "#4dffb3", "#7fd4ff", "#c4b5fd"];
const TRIGGER_SELECTOR = ".btn-pill, button, a[href], .post-row, .light-card";
const QUIET_SELECTOR = ".terminal-box, input, textarea";

export function ClickFx() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia?.("(pointer: coarse)").matches;

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target || !(target instanceof Element)) return;
      // 终端输入区等安静区域不触发
      if (target.closest(QUIET_SELECTOR)) return;
      const trigger = target.closest<HTMLElement>(TRIGGER_SELECTOR);
      if (!trigger) return;

      const cx = e.clientX;
      const cy = e.clientY;
      const host = document.createElement("div");
      host.style.cssText =
        "position:fixed;left:0;top:0;width:0;height:0;z-index:9999;pointer-events:none;";
      document.body.appendChild(host);

      // 涟漪环
      const ring = document.createElement("div");
      ring.style.cssText = `position:absolute;left:${cx}px;top:${cy}px;width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:50%;border:1.5px solid rgba(0,255,156,0.75);`;
      host.appendChild(ring);
      const ringAnim = ring.animate(
        [
          { transform: "scale(0.4)", opacity: 0.9 },
          { transform: "scale(10)", opacity: 0 },
        ],
        { duration: 600, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
      );
      ringAnim.onfinish = () => ring.remove();

      // reduced-motion / 触屏:到此为止
      if (reduced || coarse) {
        setTimeout(() => host.remove(), 650);
        return;
      }

      // 粒子爆裂
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = document.createElement("div");
        const size = 2.5 + Math.random() * 3.5;
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        const ang = (i / PARTICLE_COUNT) * Math.PI * 2 + Math.random() * 0.6;
        const dist = 30 + Math.random() * 38;
        p.style.cssText = `position:absolute;left:${cx}px;top:${cy}px;width:${size}px;height:${size}px;border-radius:50%;background:${color};box-shadow:0 0 8px ${color};`;
        host.appendChild(p);
        const dx = Math.cos(ang) * dist;
        const dy = Math.sin(ang) * dist;
        const pa = p.animate(
          [
            { transform: "translate(0,0) scale(1)", opacity: 1 },
            {
              transform: `translate(${dx}px,${dy}px) scale(0.15)`,
              opacity: 0,
            },
          ],
          {
            duration: 450 + Math.random() * 250,
            easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          },
        );
        pa.onfinish = () => p.remove();
      }
      setTimeout(() => host.remove(), 850);
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  return null;
}
