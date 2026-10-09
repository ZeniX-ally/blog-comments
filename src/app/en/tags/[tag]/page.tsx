import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { decodeSlug, getPostsByTag, getTagStaticParams } from "@/lib/posts";
import { PageTransition } from "@/components/page-transition";
import { TagView } from "@/views/tags";

type Params = { tag: string };

export function generateStaticParams(): Params[] {
  return getTagStaticParams("en");
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { tag } = await params;
  if (getPostsByTag(tag, "en").length === 0) return {};
  const label = decodeSlug(tag);
  return {
    title: `#${label}`,
    description: `Posts tagged "${label}".`,
  };
}

export default async function TagPageEn({ params }: { params: Promise<Params> }) {
  const { tag: rawTag } = await params;
  const tag = decodeSlug(rawTag);
  const posts = getPostsByTag(tag, "en");
  if (posts.length === 0) notFound();

  return (
    <PageTransition>
      <TagView lang="en" tag={tag} posts={posts} />
    </PageTransition>
  );
}
