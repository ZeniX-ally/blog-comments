"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * 页面切换过渡动画。
 *
 * Next.js 的 template.tsx 会在每次路由导航时重新挂载，是做切页动效的正确位置。
 * 这里用 Web Animations API（`element.animate()`）而不是 CSS class：
 * 命令式，useEffect 每跑一次就必定播一次，与 DOM 是否复用无关。
 *
 * 【踩坑记录】此前 CSS keyframes / transition / 内联 style 三种方案
 * 「都不生效」的真正原因不是 React 复用 DOM，而是开发机 Windows 关闭了
 * 「动画效果」(SPI_GETCLIENTAREAANIMATION=False)，浏览器一律上报
 * prefers-reduced-motion: reduce，把降级规则全部命中（其中 !important
 * 的降级规则连内联 style 都能覆盖）。所以下面 reduce 时只做降级不做静默跳过。
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const host = ref.current;
    if (!host) return;

    // 支持 View Transitions 的浏览器:翻书页转场由 BookTransition 接管,
    // 这里不再播放入场动画,避免双重动画
    if (typeof document !== "undefined" && "startViewTransition" in document) {
      return;
    }

    if (typeof host.animate !== "function") return;

    // 无障碍：系统开启"减少动态效果"时降级为纯淡入(去掉位移与交错)，
    // 而不是完全不播——否则 Windows「动画效果」关闭的机器上会看起来像动画失效。
    // 注意 Windows 上该媒体查询由 SPI_GETCLIENTAREAANIMATION 决定，
    // 设置 → 辅助功能 → 视觉效果 → 动画效果 关闭时即为 reduce。
    const reduced = !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    // 逐个区块交错入场；没有子元素时退化为整体入场
    const targets: Element[] =
      host.children.length > 0 ? Array.from(host.children) : [host];

    const animations = targets.map((el, i) =>
      el.animate(
        reduced
          ? [{ opacity: 0 }, { opacity: 1 }]
          : [
              { opacity: 0, transform: "translateY(32px) scale(0.985)" },
              { opacity: 1, transform: "translateY(0) scale(1)" },
            ],
        {
          duration: reduced ? 200 : 500,
          delay: reduced ? 0 : Math.min(i, 4) * 100,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
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
