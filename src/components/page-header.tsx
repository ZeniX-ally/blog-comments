import type { ReactNode } from "react";

/**
 * 页面大标题锚点:克制小标签 + 超大标题 + 简短副标题。
 * 每页只有一个;留白由调用方控制。
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
    <header className="mb-20 sm:mb-24">
      {label && <div className="page-head-label mb-6">{label}</div>}
      <h1 className="page-title">{title}</h1>
      {sub && <p className="page-sub mt-5 max-w-2xl">{sub}</p>}
      {children}
    </header>
  );
}
