"use client";

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";

/**
 * 正文块交互动效:鼠标经过段落/标题/列表项时,块级元素出现
 * 跟随鼠标的暖光斑 + 轻微 3D 倾斜,与首页 TiltCard 手感统一。
 * - 事件委托:块是 dangerouslySetInnerHTML 渲染的静态 HTML,不逐个包裹;
 * - h2/pre/blockquote/img/table 已有 scroll-driven 动画占用 transform,
 *   只加光斑不倾斜;p/h3/h4/li 无动画,额外加微倾斜(±2°);
 * - 光斑与倾斜全部由 CSS 变量驱动,不触发布局;
 * - prefers-reduced-motion 时完全禁用,退回普通正文。
 */
const BLOCK_SELECTOR = "h2, h3, h4, p, pre, blockquote, li, img, table";
// 无 scroll 动画、可安全加 transform 的块
const TILT_SELECTOR = "h3, h4, p, li";

export function ProseTilt({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const activeEl = useRef<HTMLElement | null>(null);
  const [motionOK, setMotionOK] = useState(false);

  useEffect(() => {
    setMotionOK(!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
    return () => {
      if (activeEl.current) {
        activeEl.current.classList.remove("pt-active");
        activeEl.current = null;
      }
    };
  }, []);

  const clear = () => {
    if (activeEl.current) {
      activeEl.current.classList.remove("pt-active");
      activeEl.current = null;
    }
  };

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!motionOK) return;
    const host = ref.current;
    if (!host) return;
    const el = e.target as HTMLElement;
    if (!(el instanceof Element)) return;
    const block = el.closest(BLOCK_SELECTOR) as HTMLElement | null;
    if (!block || !host.contains(block)) {
      clear();
      return;
    }
    if (activeEl.current !== block) {
      clear();
      activeEl.current = block;
      block.classList.add("pt-active");
    }
    const rect = block.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    block.style.setProperty("--pt-x", (px * 100).toFixed(2) + "%");
    block.style.setProperty("--pt-y", (py * 100).toFixed(2) + "%");
    if (block.matches(TILT_SELECTOR)) {
      block.style.setProperty("--pt-tilt-x", ((0.5 - py) * 4).toFixed(2) + "deg");
      block.style.setProperty("--pt-tilt-y", ((px - 0.5) * 4).toFixed(2) + "deg");
    }
  };

  return (
    <div ref={ref} className="pt-host" onPointerMove={onMove} onPointerLeave={clear}>
      {children}
    </div>
  );
}
