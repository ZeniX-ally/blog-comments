import type { Metadata } from "next";
import { getAllPosts, type PostMeta } from "@/lib/posts";
import { PostList } from "@/components/post-list";

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
  const groups = groupByYear(getAllPosts());

  return (
    <>
      <header className="py-12 sm:py-16">
        <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">文章</h1>
        <p className="mt-3 text-muted">关于技术、设计与生活的一切记录。</p>
      </header>

      <div className="pb-20">
        {groups.map(([year, posts]) => (
          <section key={year} className="mb-12">
            <h2 className="font-mono text-xs tracking-widest text-faint">{year}</h2>
            <div className="mt-3 border-t border-line">
              <PostList posts={posts} />
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
