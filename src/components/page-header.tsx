import type { ReactNode } from "react";

/**
 * 页面大标题锚点(Antigravity 式):mono 标签 + 超大标题 + 简短副标题。
 * 每页只有一个;留白由调用方控制(外层 pt-16 pb-24 等)。
 */
export function PageHeader({
  label,
  title,
  sub,
  children,
}: {
  label?: string;
  title: string;
  sub?: string;
  children?: ReactNode;
}) {
  return (
    <header className="mb-14 sm:mb-20">
      {label && <div className="page-head-label mb-6">{label}</div>}
      <h1 className="page-title">{title}</h1>
      {sub && <p className="page-sub mt-5 max-w-xl">{sub}</p>}
      {children}
    </header>
  );
}
