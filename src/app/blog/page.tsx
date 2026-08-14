import type { Metadata } from "next";
import { getAllPosts, type PostMeta } from "@/lib/posts";
import { PostList } from "@/components/post-list";
import { PostSearch } from "@/components/post-search";
import { FadeIn } from "@/components/fade-in";
import { BookTransition } from "@/components/book-transition";

export const metadata: Metadata = {
  title: "文章",
  description: "全部文章列表。",
};

/** 按年份分组,年份新的在前 */
function groupByYear(posts: PostMeta[]): [string, PostMeta[]][] {
  const groups = new Map<string, PostMeta[]>();
  for (const post of posts) {
    const year = post.date.slice(0, 4);
    groups.set(year, [...(groups.get(year) ?? []), post]);
  }
  return [...groups.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
}

export default function BlogPage() {
  const allPosts = getAllPosts();
  const groups = groupByYear(allPosts);
  const tagCount = new Set(allPosts.flatMap((p) => p.tags ?? [])).size;

  return (
    <BookTransition>
      <article className="mx-auto w-full max-w-6xl pb-32 pt-20 sm:pt-24">
      <div className="grid gap-14 lg:grid-cols-[300px_1fr] lg:gap-20">
        {/* 左栏:sticky 介绍牌 */}
        <FadeIn>
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="page-head-label mb-6">[0x00] POSTS</div>
            <h1 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
              文章
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-muted">
              关于技术、设计与生活的一切记录。
            </p>
            <div className="mt-8 flex gap-6 font-mono text-xs text-faint">
              <span>{allPosts.length} posts</span>
              <span>{tagCount} tags</span>
            </div>
            <div className="mt-6 font-mono text-xs text-accent">
              zenix@0xff:~/posts$ ls -lt
              <span className="cursor-blink ml-0.5">▍</span>
            </div>
          </aside>
        </FadeIn>

        {/* 右栏:搜索 + 年份文章列表 */}
        <div className="min-w-0 pb-10">
          <PostSearch posts={allPosts} />

          {groups.map(([year, posts]) => (
            <section key={year} className="mb-16">
              <h2 className="mb-6 font-mono text-xs tracking-widest text-faint">
                {year}
                <span className="ml-2">· {posts.length} 篇</span>
              </h2>
              <PostList posts={posts} />
            </section>
          ))}
        </div>
      </div>
      </article>
    </BookTransition>
  );
}
