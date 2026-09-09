import type { ReactNode } from "react";

/**
 * 页面标题锚点:克制小标签 + 大标题 + 闲谈副标题。
 * 每页只用一次;子节点可追加操作区。
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
    <header className="mb-16 sm:mb-20">
      {label && <div className="page-head-label mb-6">{label}</div>}
      <h1 className="page-title">{title}</h1>
      {sub && <p className="page-sub mt-5 max-w-2xl">{sub}</p>}
      {children}
    </header>
  );
}
