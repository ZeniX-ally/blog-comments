import type { Metadata } from "next";
import Link from "next/link";
import { getAllTags, slugToHref } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Tags",
  description: "Browse all posts by tag.",
};

export default function TagsPageEn() {
  const tags = getAllTags("en");

  return (
    <>
      <header className="py-12 sm:py-16">
        <h1 className="font-display text-3xl font-normal tracking-tight sm:text-4xl">Tags</h1>
        <p className="mt-3 text-muted">Browse all posts by topic.</p>
      </header>

      <div className="pb-20">
        {tags.length === 0 ? (
          <p className="border-t border-line pt-6 text-muted">No tags yet — they'll show up once posts have tags.</p>
        ) : (
          <ul className="flex flex-wrap gap-x-6 gap-y-3 border-t border-line pt-6">
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
    </>
  );
}
