"use client";

import { useRef, type ReactNode } from "react";

/**
 * Hero 光晕跟随鼠标:radial 渐变随指针移动(官方站同款语言)。
 * CSS 变量 --mx/--my 驱动,零重绘(只改变量,渐变由合成器处理);
 * prefers-reduced-motion 时不跟随。
 */
export function Spotlight({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <div ref={ref} onPointerMove={onMove} className={`spotlight ${className}`}>
      {children}
    </div>
  );
}
