import Link from "next/link";
import { ViewTransition, type ReactNode } from "react";

type SandCardProps = {
  title: string;
  /** 共享元素名(如 `project-${slug}`);与详情页 h1 同名即可 morph */
  titleName?: string;
  href?: string;
  description?: string;
  rows?: { label: string; value: ReactNode }[];
  /** 底部 pill 文字;为空则不渲染 pill */
  action?: string;
  small?: boolean;
  external?: boolean;
};

/**
 * 沙色卡。有 href 时整卡可点;没有则是静态块,不导航。
 * 结构 h3 → serif 说明 → mono 标签行 → pill。
 * 样式见 components.css 的 .sand-card / .sand-card--sm / .sand-card-rows。
 */
export function SandCard({ title, titleName, href, description, rows, action, small, external }: SandCardProps) {
  const className = small ? "sand-card sand-card--sm" : "sand-card";
  const heading = <h3>{title}</h3>;
  const body = (
    <>
      {titleName ? (
        <ViewTransition name={titleName} share="morph" default="none">
          {heading}
        </ViewTransition>
      ) : (
        heading
      )}
      {description && <p>{description}</p>}
      {rows && rows.length > 0 && (
        <div className="sand-card-rows">
          {rows.map((row) => (
            <div key={row.label}>
              <span className="label">{row.label}</span>
              <span>{row.value}</span>
            </div>
          ))}
        </div>
      )}
      {action && (
        <span className="pill">
          {action} <span className="arrow">→</span>
        </span>
      )}
    </>
  );

  if (!href) {
    return <div className={className}>{body}</div>;
  }
  if (external) {
    return (
      <a className={className} href={href} target="_blank" rel="noreferrer">
        {body}
      </a>
    );
  }
  return (
    <Link className={className} href={href}>
      {body}
    </Link>
  );
}
