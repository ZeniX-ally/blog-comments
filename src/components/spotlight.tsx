"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * 局部照亮:鼠标在容器内移动时,一个径向光斑跟随指针。
 * - 复刻 TiltCard 的光斑逻辑,抽出来给文章行/卡片复用
 * - 触屏与 reduced-motion 时静默(overlay 恒透明)
 * - 纯 CSS 变量 --sx/--sy 驱动,pointer-events: none
 */
export function Spotlight({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia?.("(pointer: coarse)").matches) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      el.style.setProperty("--sx", x.toFixed(2) + "%");
      el.style.setProperty("--sy", y.toFixed(2) + "%");
    };

    el.addEventListener("pointermove", onMove, { passive: true });
    return () => el.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div ref={ref} className={`spotlight ${className}`}>
      {children}
      <div aria-hidden="true" className="spotlight-overlay" />
    </div>
  );
}
