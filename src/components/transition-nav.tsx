"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * 翻书页转场导航(原生 View Transitions API 实现)。
 * - 全局拦截站内链接点击(左键/无修饰键/同源),startViewTransition 包住 Next 导航
 * - old 快照(当前页)向左翻起,new 快照(目标页)从左翻落——见 globals.css ::view-transition-*
 * - 用 MutationObserver 等待目标页 DOM 提交后再完成快照,保证 new 快照是新页面
 * - 不支持 VT 的浏览器 / 外部链接 / 新标签页:放行默认行为,直接切换
 */
export function TransitionNav() {
  const router = useRouter();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (typeof document === "undefined" || !document.startViewTransition) return;
      const target = e.target as HTMLElement | null;
      if (!target || !(target instanceof Element)) return;
      const link = target.closest<HTMLAnchorElement>("a[href]");
      if (!link || link.hasAttribute("download")) return;
      if (link.target === "_blank" || link.target === "_parent" || link.target === "_top") return;
      if (link.origin !== location.origin) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      const url = link.href;
      const pathname = link.pathname;
      // 同页锚点/同路径:不触发转场
      if (pathname === location.pathname) return;
      e.preventDefault();
      document.startViewTransition(async () => {
        router.push(url);
        await waitForNav(pathname);
      });
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [router]);

  return null;
}

/** 等待目标路由 DOM 提交:监听 body 变化,确认 pathname 到位后再等两帧 */
function waitForNav(pathname: string): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, 3000); // 兜底超时
    const obs = new MutationObserver(() => {
      if (location.pathname === pathname) {
        clearTimeout(timer);
        obs.disconnect();
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      }
    });
    obs.observe(document.body, { childList: true, subtree: true });
  });
}
