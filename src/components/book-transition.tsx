import { ViewTransition } from "react";

/**
 * 全站"翻书页"转场包装。
 * 说明:React 稳定版(19.2.x)未导出 ViewTransition 组件,此组件降级为普通容器;
 * 实际翻页转场由 transition-nav.tsx(原生 View Transitions API)+ root 快照动画实现。
 */
export function BookTransition({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
