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
      // 相对路径导航(绝对 URL 会被 Next 当作外部导航,导致整页硬跳转)
      const to = pathname + link.search + link.hash;
      e.preventDefault();
      document.startViewTransition(async () => {
        router.push(to);
        await waitForNav(pathname);
      });
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [router]);

  return null;
}

/** 等待目标路由切换完成:轮询 pathname + 标题更新(渲染提交信号)。
 *  注意:View Transition 的 update 阶段渲染被冻结,rAF 不触发,
 *  必须用 setTimeout 轮询(定时器在冻结期间仍正常执行)。 */
function waitForNav(pathname: string): Promise<void> {
  return new Promise((resolve) => {
    const start = performance.now();
    const prevTitle = document.title;
    const check = () => {
      const elapsed = performance.now() - start;
      const committed =
        location.pathname === pathname &&
        (document.title !== prevTitle || elapsed > 400);
      if (committed) {
        // 再等两拍(定时器)让新页面 DOM 提交完成
        setTimeout(() => setTimeout(() => resolve(), 16), 16);
      } else if (elapsed > 3000) {
        // 兜底:3s 内导航未完成(异常情况),硬跳转保证到达目标页
        if (location.pathname !== pathname) {
          window.location.assign(location.origin + pathname + location.search);
        }
        resolve();
      } else {
        setTimeout(check, 16);
      }
    };
    check();
  });
}
