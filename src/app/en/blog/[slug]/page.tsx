import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate, getAllPosts, getAdjacentPosts, getPost, decodeSlug, slugToHref } from "@/lib/posts";
import { ReadingProgress } from "@/components/reading-progress";
import { FadeIn } from "@/components/fade-in";
import { Comments } from "@/components/comments";
import { ScrollSpy } from "@/components/scroll-spy";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  const posts = getAllPosts("en").map((post) => ({ slug: post.slug }));
  return posts.length > 0 ? posts : [{ slug: "placeholder" }];
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
    <article className="mx-auto w-full max-w-3xl py-12 sm:py-16">
      <ReadingProgress />
      <ScrollSpy />
      <FadeIn>
        <header className="border-b border-line pb-6">
          <h1 className="font-serif text-4xl font-normal leading-tight tracking-tight sm:text-5xl">
            {post.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-4 font-mono text-xs text-faint">
            <time>{formatDate(post.date)}</time>
            <span>~{post.readingTime} min</span>
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/en/tags/${slugToHref(tag)}`}
                className="transition-colors hover:text-accent"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </header>
      </FadeIn>

      <FadeIn delay={100}>
        <div
          className="prose mt-10"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />
      </FadeIn>

      {(adjacent.prev || adjacent.next) && (
        <nav className="mt-16 grid gap-4 border-t border-line pt-6 sm:grid-cols-2 sm:gap-8">
          {adjacent.prev ? (
            <Link href={`/en/blog/${slugToHref(adjacent.prev.slug)}`} className="group block">
              <span className="font-mono text-xs text-faint">← Previous</span>
              <span className="mt-1 block leading-snug transition-colors group-hover:text-accent">
                {adjacent.prev.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {adjacent.next ? (
            <Link href={`/en/blog/${slugToHref(adjacent.next.slug)}`} className="group block sm:text-right">
              <span className="font-mono text-xs text-faint">Next →</span>
              <span className="mt-1 block leading-snug transition-colors group-hover:text-accent">
                {adjacent.next.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}

      <footer className="mt-10 border-t border-line pt-6">
        <Link href="/en/blog" className="text-sm text-muted transition-colors hover:text-accent">
          ← Back to posts
        </Link>
      </footer>

      <Comments />
    </article>
  );
}
