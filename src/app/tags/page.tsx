import type { Metadata } from "next";
import Link from "next/link";
import { getAllTags, slugToHref } from "@/lib/posts";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "标签",
  description: "按标签浏览全部文章。",
};

/** 标签总览页：以标签云形式列出所有标签及文章数 */
export default function TagsPage() {
  const tags = getAllTags();

  return (
    <>
      <article className="mx-auto w-full max-w-3xl pb-32 pt-20 sm:pt-24">
        <PageHeader label="[0x00] TAGS" title="标签" sub="按主题浏览全部文章。" />
        <div className="pb-10">
          {tags.length === 0 ? (
            <p className="border-t border-line pt-10 text-muted">还没有标签，给文章加上 tags 字段后这里会出现。</p>
          ) : (
            <ul className="flex flex-wrap gap-x-8 gap-y-5 border-t border-line pt-10">
              {tags.map(({ tag, count }) => (
                <li key={tag}>
                  <Link
                    href={`/tags/${slugToHref(tag)}`}
                    className="group inline-flex items-baseline gap-1.5"
                  >
                    <span
                      className={`${
                        count >= 4 ? "text-2xl" : count >= 2 ? "text-xl" : "text-base"
                      } transition-colors group-hover:text-accent`}
                    >
                      #{tag}
                    </span>
                    <span className="font-mono text-xs text-faint">{count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </article>
    </>
  );
}
