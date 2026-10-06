import type { TocItem } from "@/lib/toc";

/**
 * 文章目录:mono 标签 + h2/h3 链接列表(h3 由 data-level 缩进)。
 * 当前项由 ScrollSpy 加 .is-active;没有标题时不渲染。
 */
export function Toc({ items, label }: { items: TocItem[]; label: string }) {
  if (items.length === 0) return null;
  return (
    <nav className="toc" aria-label={label}>
      <div className="label">{label}</div>
      {items.map((item) => (
        <a key={item.id} href={`#${item.id}`} data-level={item.level}>
          {item.text}
        </a>
      ))}
    </nav>
  );
}
