import type { Metadata } from "next";
import Link from "next/link";
import { getAllTags, slugToHref } from "@/lib/posts";

export const metadata: Metadata = {
  title: "标签",
  description: "按标签浏览全部文章。",
};

/** 标签总览页：以标签云形式列出所有标签及文章数 */
export default function TagsPage() {
  const tags = getAllTags();

  return (
    <>
      <header className="py-12 sm:py-16">
        <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">标签</h1>
        <p className="mt-3 text-muted">按主题浏览全部文章。</p>
      </header>

      <div className="pb-20">
        {tags.length === 0 ? (
          <p className="border-t border-line pt-6 text-muted">还没有标签，给文章加上 tags 字段后这里会出现。</p>
        ) : (
          <ul className="flex flex-wrap gap-x-6 gap-y-3 border-t border-line pt-6">
            {tags.map(({ tag, count }) => (
              <li key={tag}>
                <Link
                  href={`/tags/${slugToHref(tag)}`}
                  className="group inline-flex items-baseline gap-1.5"
                >
                  <span className="text-lg transition-colors group-hover:text-accent">
                    #{tag}
                  </span>
                  <span className="font-mono text-xs text-faint">{count}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
