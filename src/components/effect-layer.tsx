"use client";

import { useEffect, useRef } from "react";

/**
 * 全局光标光晕:鼠标位置驱动的柔光跟随,整站一层。
 * - rAF 平滑追赶(0.18 lerp),指针停止移动 700ms 后淡出
 * - 触屏(pointer: coarse)与 reduced-motion 直接禁用
 * - 纯 CSS 变量驱动,不触发重排;z-index 压在内容之下
 */
export function EffectLayer() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia?.("(pointer: coarse)").matches) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let tx = 50, ty = 50, cx = 50, cy = 50;
    let lastMove = 0;

    const step = () => {
      raf = 0;
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      el.style.setProperty("--glow-x", cx.toFixed(2) + "%");
      el.style.setProperty("--glow-y", cy.toFixed(2) + "%");
      el.classList.toggle("is-idle", performance.now() - lastMove > 700);
      if (performance.now() - lastMove <= 700) {
        raf = requestAnimationFrame(step);
      }
    };

    const onMove = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth) * 100;
      ty = (e.clientY / window.innerHeight) * 100;
      lastMove = performance.now();
      el.classList.remove("is-idle");
      if (!raf) raf = requestAnimationFrame(step);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <div ref={ref} aria-hidden="true" className="cursor-glow is-idle" />;
}
