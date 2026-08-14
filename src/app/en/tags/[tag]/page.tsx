import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { decodeSlug, getAllTags, getPostsByTag } from "@/lib/posts";
import { PostList } from "@/components/post-list";
import { PageHeader } from "@/components/page-header";

type Params = { tag: string };

export function generateStaticParams(): Params[] {
  const tags = getAllTags("en").map(({ tag }) => ({ tag }));
  return tags.length > 0 ? tags : [{ tag: "placeholder" }];
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
    <article className="mx-auto w-full max-w-3xl pb-32 pt-20 sm:pt-24">
      <PageHeader label="[0x00] TAG" title={`#${tag}`} sub={`${posts.length} ${posts.length === 1 ? "post" : "posts"}.`} />
      <div className="pb-4">
        <PostList posts={posts} basePath="/en" />
      </div>
    </article>
  );
}
