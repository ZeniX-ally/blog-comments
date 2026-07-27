"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * 页面切换过渡动画。
 *
 * Next.js 的 template.tsx 会在每次路由导航时重新挂载，是做切页动效的正确位置。
 * 这里刻意**不用 CSS class / @keyframes / CSS transition**：
 * 之前三次尝试都失败，原因是 React 复用 DOM 节点时 CSS 动画不会重新触发，
 * 到底触发与否取决于 reconciliation，不可控。
 *
 * 改用 Web Animations API（`element.animate()`）——它是命令式的：
 * useEffect 每次执行就一定播放一次动画，与 DOM 是否复用、class 是否变化无关。
 * 直接子元素依次加 delay，形成轻微的交错入场。
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const host = ref.current;
    if (!host) return;

    // 无障碍：系统开启"减少动态效果"时不播放
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    if (typeof host.animate !== "function") return;

    // 逐个区块交错入场；没有子元素时退化为整体入场
    const targets: Element[] =
      host.children.length > 0 ? Array.from(host.children) : [host];

    const animations = targets.map((el, i) =>
      el.animate(
        [
          { opacity: 0, transform: "translateY(10px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        {
          duration: 420,
          delay: Math.min(i, 4) * 70,
          easing: "cubic-bezier(0.22, 0.61, 0.36, 1)",
          fill: "backwards", // delay 期间保持起始态，避免先闪一下再动
        },
      ),
    );

    return () => {
      for (const a of animations) a.cancel();
    };
  }, [pathname]);

  return <div ref={ref}>{children}</div>;
}
