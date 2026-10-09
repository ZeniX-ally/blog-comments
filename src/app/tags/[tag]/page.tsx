import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { decodeSlug, getPostsByTag, getTagStaticParams, slugToHref } from "@/lib/posts";
import { pageMeta } from "@/lib/seo";
import { PageTransition } from "@/components/page-transition";
import { TagView } from "@/views/tags";

type Params = { tag: string };

export function generateStaticParams(): Params[] {
  // 静态导出要求至少生成一个路由;无标签时由 getTagStaticParams 占位兜底,页面 notFound
  return getTagStaticParams();
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

/** 单个标签下的文章列表,复用文章列表页的行 */
export default async function TagPage({ params }: { params: Promise<Params> }) {
  const { tag: rawTag } = await params;
  const tag = decodeSlug(rawTag);
  const posts = getPostsByTag(tag);
  if (posts.length === 0) notFound();

  return (
    <PageTransition>
      <TagView lang="zh" tag={tag} posts={posts} />
    </PageTransition>
  );
}
