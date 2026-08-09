"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type SearchPost = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
};

/**
 * 文章本地搜索:按标题 / 摘要 / 标签 过滤,纯前端无请求。
 * 输入为空时折叠,只显示一个搜索框。
 */
export function PostSearch({ posts }: { posts: SearchPost[] }) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return posts.filter((post) => {
      const title = post.title.toLowerCase();
      const excerpt = post.excerpt.toLowerCase();
      const tags = post.tags.join(" ").toLowerCase();
      return title.includes(q) || excerpt.includes(q) || tags.includes(q);
    });
  }, [query, posts]);

  return (
    <div className="mb-10">
      <div className="relative max-w-md">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索文章标题、摘要或标签…"
          aria-label="搜索文章"
          className="w-full border-b border-line bg-transparent py-2 pr-8 font-mono text-sm text-foreground placeholder:text-faint focus:border-accent focus:outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="清空搜索"
            className="absolute right-0 top-1/2 -translate-y-1/2 font-mono text-xs text-faint transition-colors hover:text-accent"
          >
            ✕
          </button>
        )}
      </div>

      {query.trim() && (
        <div className="mt-6">
          {results.length === 0 ? (
            <p className="py-4 text-sm text-muted">
              没有找到与「{query.trim()}」相关的文章。
            </p>
          ) : (
            <ul>
              {results.map((post) => (
                <li key={post.slug} className="border-b border-line last:border-b-0">
                  <Link
                    href={`/blog/${encodeURIComponent(post.slug)}`}
                    className="group flex items-baseline justify-between gap-6 py-4"
                  >
                    <span className="text-base leading-snug transition-colors group-hover:text-accent">
                      {post.title}
                    </span>
                    <time className="shrink-0 font-mono text-xs text-faint">
                      {post.date.replaceAll("-", ".")}
                    </time>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
