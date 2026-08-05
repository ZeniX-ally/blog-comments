"use client";

import { useEffect, useState } from "react";

/**
 * 文章页顶部阅读进度条。
 * 极简:1.5px Tan 细线,随滚动伸缩。rAF 节流避免过度重绘。
 * 纯 transform scaleX 合成器动画,不触发布局。
 */
export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let ticking = false;
    const update = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const doc = document.documentElement;
        const total = doc.scrollHeight - doc.clientHeight;
        setProgress(total > 0 ? Math.min(1, doc.scrollTop / total) : 0);
        ticking = false;
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[1.5px] bg-transparent"
    >
      <div
        className="h-full origin-left bg-accent"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}
