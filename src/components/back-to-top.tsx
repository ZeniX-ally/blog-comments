"use client";

import { useEffect, useState } from "react";

/**
 * 回到顶部:滚动超过 480px 后浮现(mono ↑,方角细边框,极简)。
 * smooth 滚动交由浏览器(html 已有 scroll-behavior: smooth)。
 */
export function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      // 接近页面底部(剩余 < 200px)时隐藏,避免遮挡 footer 内容(如 RSS 链接)
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
      onClick={() => window.scrollTo({ top: 0 })}
      aria-label="回到顶部"
      className={`fixed bottom-6 right-6 z-40 flex h-9 w-9 items-center justify-center border border-line bg-background font-mono text-sm text-muted transition-all duration-300 hover:border-accent hover:text-accent ${
        show
          ? "opacity-100"
          : "pointer-events-none translate-y-2 opacity-0"
      }`}
    >
      ↑
    </button>
  );
}
