import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { decodeSlug, getAllTags, getPostsByTag } from "@/lib/posts";
import { PostList } from "@/components/post-list";
import { PageHeader } from "@/components/page-header";
import { BookTransition } from "@/components/book-transition";

type Params = { tag: string };

export function generateStaticParams(): Params[] {
  const tags = getAllTags("en").map(({ tag }) => ({ tag }));
  return tags;
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
    <BookTransition>
      <article className="mx-auto w-full max-w-6xl pb-32 pt-20 sm:pt-24">
      <PageHeader label="Tags" title={`#${tag}`} sub={`${posts.length} ${posts.length === 1 ? "post" : "posts"}.`} />
      <div className="pb-4">
        <PostList posts={posts} basePath="/en" />
        </div>
      </article>
    </BookTransition>
  );
}
