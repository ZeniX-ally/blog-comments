import type { Metadata } from "next";
import Link from "next/link";
import { getAllTags, slugToHref } from "@/lib/posts";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Tags",
  description: "Browse all posts by tag.",
};

export default function TagsPageEn() {
  const tags = getAllTags("en");

  return (
    <>
      <article className="mx-auto w-full max-w-6xl pb-32 pt-20 sm:pt-24">
        <PageHeader label="[0x00] TAGS" title="Tags" sub="Browse all posts by topic." />
        <div className="pb-10">
          {tags.length === 0 ? (
            <p className="border-t border-line pt-10 text-muted">No tags yet — they'll show up once posts have tags.</p>
          ) : (
            <ul className="flex flex-wrap gap-x-8 gap-y-5 border-t border-line pt-10">
              {tags.map(({ tag, count }) => (
                <li key={tag}>
                  <Link
                    href={`/en/tags/${slugToHref(tag)}`}
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
