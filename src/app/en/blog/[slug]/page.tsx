import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPosts, getAdjacentPosts, getPost, decodeSlug, slugToHref } from "@/lib/posts";
import { getFeaturedProjects } from "@/lib/projects";
import { PageTransition } from "@/components/page-transition";
import { PostView } from "@/views/post";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  const posts = getAllPosts("en").map((post) => ({ slug: post.slug }));
  return posts;
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug, "en");
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      images: [`/og/${slugToHref(post.slug)}.png`],
    },
  };
}

export default async function PostPageEn({ params }: { params: Promise<Params> }) {
  const { slug: rawSlug } = await params;
  const slug = decodeSlug(rawSlug);
  const post = await getPost(slug, "en");
  if (!post) notFound();
  const adjacent = getAdjacentPosts(slug, "en");

  return (
    <PageTransition>
      <PostView lang="en" post={post} adjacent={adjacent} fallbackProjects={getFeaturedProjects(2)} />
    </PageTransition>
  );
}
