"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * 滚动入场:hook 版 FadeIn。
 * - IntersectionObserver,进入视口即一次性显示并断开
 * - prefers-reduced-motion 时直接显示,不播动画
 * - 返回 [ref, visible],样式由调用方控制
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(options?: {
  threshold?: number;
  rootMargin?: string;
}): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      {
        threshold: options?.threshold ?? 0.12,
        rootMargin: options?.rootMargin ?? "0px 0px -48px 0px",
      },
    );
    io.observe(el);
    return () => io.disconnect();
    // 只观察一次;options 变化不重挂
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [ref, visible];
}
