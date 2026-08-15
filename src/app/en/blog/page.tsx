import type { Metadata } from "next";
import { getAllPosts, type PostMeta } from "@/lib/posts";
import { PostList } from "@/components/post-list";
import { PostSearch } from "@/components/post-search";
import { FadeIn } from "@/components/fade-in";
import { BookTransition } from "@/components/book-transition";

export const metadata: Metadata = {
  title: "Posts",
  description: "All posts.",
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

export default function BlogPageEn() {
  const allPosts = getAllPosts("en");
  const groups = groupByYear(allPosts);
  const tagCount = new Set(allPosts.flatMap((p) => p.tags ?? [])).size;

  return (
    <BookTransition>
      <article className="mx-auto w-full max-w-6xl pb-32 pt-20 sm:pt-24">
      <div className="grid gap-14 lg:grid-cols-[300px_1fr] lg:gap-20">
        {/* 左栏:sticky 介绍牌 */}
        <FadeIn>
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="page-head-label mb-6">Posts</div>
            <h1 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
              Posts
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-muted">
              Notes on tech, design and life.
            </p>
            <div className="mt-8 text-xs text-faint">
              {allPosts.length} posts · {tagCount} tags
            </div>
          </aside>
        </FadeIn>

        {/* 右栏:搜索 + 年份文章列表 */}
        <div className="min-w-0 pb-10">
          <PostSearch posts={allPosts} />

          {groups.map(([year, posts]) => (
            <section key={year} className="mb-16">
              <h2 className="mb-6 text-xs font-semibold tracking-widest text-faint">
                {year}
                <span className="ml-2">
                  · {posts.length} {posts.length === 1 ? "post" : "posts"}
                </span>
              </h2>
              <PostList posts={posts} basePath="/en" />
            </section>
          ))}
        </div>
      </div>
      </article>
    </BookTransition>
  );
}
