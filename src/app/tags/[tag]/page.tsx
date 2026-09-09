import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { decodeSlug, getAllTags, getPostsByTag, slugToHref } from "@/lib/posts";
import { pageMeta } from "@/lib/seo";
import { PostList } from "@/components/post-list";
import { PageHeader } from "@/components/page-header";
import { BookTransition } from "@/components/book-transition";

type Params = { tag: string };

export function generateStaticParams(): Params[] {
  const tags = getAllTags().map(({ tag }) => ({ tag }));
  // 静态导出要求至少生成一个路由；暂无文章时用占位标签(页面会 404)
  return tags;
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { tag } = await params;
  if (getPostsByTag(tag).length === 0) return {};
  const label = decodeSlug(tag);
  return pageMeta({
    title: `#${label}`,
    description: `标签「${label}」下的文章。`,
    path: `/tags/${slugToHref(label)}`,
  });
}

/** 单个标签下的文章列表，复用 PostList 保持与首页/文章列表一致的极简风格 */
export default async function TagPage({ params }: { params: Promise<Params> }) {
  const { tag: rawTag } = await params;
  const tag = decodeSlug(rawTag);
  const posts = getPostsByTag(tag);
  if (posts.length === 0) notFound();

  return (
    <BookTransition>
      <article className="mx-auto w-full max-w-6xl pb-32 pt-20 sm:pt-24">
      <PageHeader label="标签" title={`#${tag}`} sub={`共 ${posts.length} 篇文章。`} />
      <div className="pb-4">
        <PostList posts={posts} />
      </div>
      </article>
    </BookTransition>
  );
}
