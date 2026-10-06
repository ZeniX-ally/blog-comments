"use client";

import { useMemo, useState, type ReactNode } from "react";
import { HairRow } from "@/components/hair-row";
import { dict, type Lang } from "@/lib/i18n";

type SearchPost = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
};

/**
 * 文章本地搜索:按标题 / 摘要 / 标签 过滤,纯前端无请求。
 * 输入为空时渲染 children(列表页的年份分组);有输入时只显示结果行(细线行,无共享元素名)。
 * 这里不能 import lib/posts(含 node:fs),日期与链接自行格式化。
 */
export function PostSearch({ posts, lang, children }: { posts: SearchPost[]; lang: Lang; children?: ReactNode }) {
  const d = dict[lang];
  const p = lang === "en" ? "/en" : "";
  const [query, setQuery] = useState("");
  const q = query.trim();

  const results = useMemo(() => {
    const needle = q.toLowerCase();
    if (!needle) return [];
    return posts.filter((post) => {
      const title = post.title.toLowerCase();
      const excerpt = post.excerpt.toLowerCase();
      const tags = post.tags.join(" ").toLowerCase();
      return title.includes(needle) || excerpt.includes(needle) || tags.includes(needle);
    });
  }, [q, posts]);

  return (
    <>
      <div className="search-wrap">
        <input
          type="search"
          className="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={d.blog.search}
          aria-label={d.blog.search}
        />
        {!query && (
          <span className="label search-hint" aria-hidden="true">
            ⌘K
          </span>
        )}
      </div>

      {!q ? (
        children
      ) : results.length === 0 ? (
        <p className="lede search-results">{d.blog.noResult(q)}</p>
      ) : (
        <div className="hair-list search-results">
          {results.map((post) => (
            <HairRow
              key={post.slug}
              href={`${p}/blog/${encodeURIComponent(post.slug)}/`}
              meta={post.date.replaceAll("-", ".")}
              title={post.title}
              sub={post.excerpt}
              trailing={post.tags.join(" · ")}
            />
          ))}
        </div>
      )}
    </>
  );
}
