import { ViewTransition, type ReactNode } from "react";

/**
 * 页面根部包装:切页时旧内容走 page-out、新内容走 page-in(动画在 motion.css)。
 * default="none" 使它不参与其他无关的过渡(如共享元素 morph)。
 * 放在每个 page / view 的根部,不要放 layout(layout 跨导航持久,enter/exit 不触发)。
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter="page-in" exit="page-out" default="none">
      {children}
    </ViewTransition>
  );
}
