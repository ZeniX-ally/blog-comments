import Link from "next/link";
import { ViewTransition, type ReactNode } from "react";

type HairRowProps = {
  href: string;
  /** 左侧 mono 元数据(如日期);省略时退化为两栏 .hair-row--2 */
  meta?: ReactNode;
  title: ReactNode;
  /** 共享元素名(如 `post-${slug}`);与文章页 h1 同名即可 morph */
  titleName?: string;
  sub?: ReactNode;
  /** 右侧 mono 标签(计数、tag、→) */
  trailing?: ReactNode;
  external?: boolean;
};

/**
 * 细线行:上边 1px --hair,列表最后一行由 .hair-list > :last-child 补下边。
 * 三栏 meta / 标题(+摘要) / trailing;无 meta 时两栏。
 */
export function HairRow({ href, meta, title, titleName, sub, trailing, external }: HairRowProps) {
  const className = meta === undefined ? "hair-row hair-row--2" : "hair-row";
  const titleEl = <span className="hair-row-title">{title}</span>;
  const body = (
    <>
      {meta !== undefined && <span className="label">{meta}</span>}
      <span>
        {titleName ? (
          <ViewTransition name={titleName} share="morph" default="none">
            {titleEl}
          </ViewTransition>
        ) : (
          titleEl
        )}
        {sub && <span className="hair-row-sub">{sub}</span>}
      </span>
      <span className="label">{trailing}</span>
    </>
  );

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
