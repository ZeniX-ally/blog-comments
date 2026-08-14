import type { Metadata } from "next";
import { getAllPosts, type PostMeta } from "@/lib/posts";
import { PostList } from "@/components/post-list";
import { PostSearch } from "@/components/post-search";
import { FadeIn } from "@/components/fade-in";
import { PageHeader } from "@/components/page-header";

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
    <article className="mx-auto w-full max-w-3xl pb-24 pt-16 sm:pt-20">
      <PageHeader label="[0x00] POSTS" title="Posts" sub="Notes on tech, design and life.">
        {/* 原左栏统计并入 PageHeader 下方:mono 小字 */}
        <div className="mt-6 flex gap-6 font-mono text-xs text-faint">
          <span>{allPosts.length} posts</span>
          <span>{tagCount} tags</span>
        </div>
      </PageHeader>

      {/* 原左栏终端行并入:mono 提示 */}
      <FadeIn>
        <div className="mb-14 font-mono text-xs text-accent">
          zenix@0xff:~/posts$ ls -lt
          <span className="cursor-blink ml-0.5">▍</span>
        </div>
      </FadeIn>

      <div className="min-w-0 pb-10">
        <PostSearch posts={allPosts} />

        {groups.map(([year, posts]) => (
          <section key={year} className="mb-12">
            <h2 className="mb-4 font-mono text-xs tracking-widest text-faint">
              {year}
              <span className="ml-2">· {posts.length} {posts.length === 1 ? "post" : "posts"}</span>
            </h2>
            <PostList posts={posts} basePath="/en" />
          </section>
        ))}
      </div>
    </article>
  );
}
