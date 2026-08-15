"use client";

import { useEffect, useState } from "react";

/**
 * 回到顶部:滚动超过 480px 后浮现(圆形 ↑ 按钮)。
 */
export function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const nearBottom =
        window.scrollY + window.innerHeight >= doc.scrollHeight - 200;
      setShow(window.scrollY > 480 && !nearBottom);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="回到顶部"
      className={`fixed bottom-6 right-6 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white/80 text-sm text-muted backdrop-blur-md transition-all duration-300 hover:border-accent hover:text-accent ${
        show
          ? "opacity-100"
          : "pointer-events-none translate-y-2 opacity-0"
      }`}
    >
      ↑
    </button>
  );
}
