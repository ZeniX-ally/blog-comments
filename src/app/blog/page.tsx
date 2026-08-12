import type { Metadata } from "next";
import { getAllPosts, type PostMeta } from "@/lib/posts";
import { PostList } from "@/components/post-list";
import { PostSearch } from "@/components/post-search";
import { FadeIn } from "@/components/fade-in";

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
    <article className="mx-auto w-full max-w-4xl py-12 sm:py-16">
      <div className="grid gap-12 lg:grid-cols-[250px_1fr]">
        {/* 左栏:sticky 信息牌 */}
        <FadeIn>
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-mono text-xs text-faint">[0x00]</span>
              <h1 className="font-display text-2xl font-medium">文章</h1>
              <span className="font-mono text-[10px] tracking-[0.25em] text-accent">
                POSTS
              </span>
            </div>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">
              关于技术、设计与生活的一切记录。
            </p>
            <div className="mt-5 font-mono text-xs text-accent">
              zenix@0xff:~/posts$ ls -lt
              <span className="cursor-blink ml-0.5">▍</span>
            </div>
            <div className="mt-6 space-y-1 border-t border-line pt-4 font-mono text-xs text-faint">
              <div>{allPosts.length} posts</div>
              <div>{tagCount} tags</div>
            </div>
          </aside>
        </FadeIn>

        {/* 右栏:搜索 + 年份列表 */}
        <div className="min-w-0 pb-20">
          <PostSearch posts={allPosts} />

          {groups.map(([year, posts]) => (
            <section key={year} className="mb-12">
              <h2 className="font-mono text-xs tracking-widest text-faint">
                {year}
                <span className="ml-2">· {posts.length} 篇</span>
              </h2>
              <div className="mt-3 border-t border-line">
                <PostList posts={posts} />
              </div>
            </section>
          ))}
        </div>
      </div>
    </article>
  );
}
