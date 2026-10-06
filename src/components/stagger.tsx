import {
  Children,
  cloneElement,
  isValidElement,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";

/**
 * 出场交错:给每个直接子元素写 style="--i: n"(n 从 start 起递增),
 * CSS 侧用 animation-delay: calc(var(--i) * 120ms) 错开(.mask / .reveal)。
 * 非元素子节点(文本、null)原样返回且不占序号。
 */
export function Stagger({
  children,
  as = "div",
  className,
  start = 0,
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  start?: number;
}) {
  const Tag = as;
  let i = start;
  return (
    <Tag className={className}>
      {Children.map(children, (child) => {
        if (!isValidElement<{ style?: CSSProperties }>(child)) return child;
        const style = { ...(child.props.style ?? {}), ["--i" as string]: i++ } as CSSProperties;
        return cloneElement(child, { style });
      })}
    </Tag>
  );
}
