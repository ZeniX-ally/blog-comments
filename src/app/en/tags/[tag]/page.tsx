import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { decodeSlug, getAllTags, getPostsByTag } from "@/lib/posts";
import { PostList } from "@/components/post-list";

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
    <>
      <header className="py-12 sm:py-16">
        <h1 className="font-display text-3xl font-normal tracking-tight sm:text-4xl">
          <span className="text-faint">#</span>
          {tag}
        </h1>
        <p className="mt-3 text-muted">{posts.length} {posts.length === 1 ? "post" : "posts"}.</p>
      </header>

      <div className="pb-20">
        <PostList posts={posts} basePath="/en" />
      </div>
    </>
  );
}
