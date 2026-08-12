"use client";

import { useEffect } from "react";

/**
 * 章节联动(ScrollSpy):正文滚动时高亮当前章节。
 * - 扫描 .prose 内 h2/h3,滚动时给当前可见标题加 .is-spy(左侧竖条 + 强调色)
 * - rAF 节流,reduced-motion 时仅保留高亮不做平滑
 */
export function ScrollSpy() {
  useEffect(() => {
    const prose = document.querySelector<HTMLElement>(".prose");
    if (!prose) return;
    const heads = Array.from(
      prose.querySelectorAll<HTMLElement>("h2, h3"),
    );
    if (heads.length === 0) return;

    let ticking = false;
    const update = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const top = window.scrollY + 140;
        let current: HTMLElement | null = null;
        for (const h of heads) {
          if (h.offsetTop <= top) current = h;
          else break;
        }
        heads.forEach((h) => h.classList.remove("is-spy"));
        current?.classList.add("is-spy");
        ticking = false;
      });
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      heads.forEach((h) => h.classList.remove("is-spy"));
    };
  }, []);

  return null;
}
