import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdjacentPosts, getPost, getPostStaticParams, decodeSlug, slugToHref } from "@/lib/posts";
import { getFeaturedProjects } from "@/lib/projects";
import { pageMeta, canonicalUrl } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { site } from "@/lib/site";
import { PageTransition } from "@/components/page-transition";
import { PostView } from "@/views/post";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getPostStaticParams();
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  const path = `/blog/${slugToHref(post.slug)}`;
  const ogImage = `/og/${slugToHref(post.slug)}.png`;
  return pageMeta({
    title: post.title,
    description: post.excerpt || site.description,
    path,
    type: "article",
    images: [ogImage],
  });
}

export default async function PostPage({ params }: { params: Promise<Params> }) {
  const { slug: rawSlug } = await params;
  const slug = decodeSlug(rawSlug);
  const post = await getPost(slug);
  if (!post) notFound();
  const adjacent = getAdjacentPosts(slug);

  return (
    <PageTransition>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt || undefined,
          datePublished: post.date,
          dateModified: post.date,
          mainEntityOfPage: canonicalUrl(`/blog/${slugToHref(post.slug)}`),
          author: {
            "@type": "Person",
            name: site.name,
            url: site.url,
          },
          publisher: {
            "@type": "Person",
            name: site.name,
            url: site.url,
          },
          image: canonicalUrl(`/og/${slugToHref(post.slug)}.png`),
          inLanguage: "zh-CN",
        }}
      />
      <PostView lang="zh" post={post} adjacent={adjacent} fallbackProjects={getFeaturedProjects(2)} />
    </PageTransition>
  );
}
