import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate, getAllPosts, getAdjacentPosts, getPost } from "@/lib/posts";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function PostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  const adjacent = getAdjacentPosts(slug);

  return (
    <article className="py-12 sm:py-16">
      {/* 文章头部 */}
      <header>
        <h1 className="font-serif text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
          {post.title}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-4 font-mono text-xs text-faint">
          <time>{formatDate(post.date)}</time>
          <span>约 {post.readingTime} 分钟</span>
          {post.tags.map((tag) => (
            <Link
              key={tag}
              href={`/tags/${tag}`}
              className="transition-colors hover:text-accent"
            >
              #{tag}
            </Link>
          ))}
        </div>
      </header>

      {/* 正文 */}
      <div
        className="prose mt-10"
        dangerouslySetInnerHTML={{ __html: post.html }}
      />

      {/* 上一篇 / 下一篇 */}
      {(adjacent.prev || adjacent.next) && (
        <nav className="mt-16 grid gap-4 border-t border-line pt-6 sm:grid-cols-2 sm:gap-8">
          {adjacent.prev ? (
            <Link href={`/blog/${adjacent.prev.slug}`} className="group block">
              <span className="font-mono text-xs text-faint">← 上一篇</span>
              <span className="mt-1 block leading-snug transition-colors group-hover:text-accent">
                {adjacent.prev.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {adjacent.next ? (
            <Link href={`/blog/${adjacent.next.slug}`} className="group block sm:text-right">
              <span className="font-mono text-xs text-faint">下一篇 →</span>
              <span className="mt-1 block leading-snug transition-colors group-hover:text-accent">
                {adjacent.next.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}

      {/* 返回 */}
      <footer className="mt-10 border-t border-line pt-6">
        <Link href="/blog" className="text-sm text-muted transition-colors hover:text-accent">
          ← 返回文章列表
        </Link>
      </footer>
    </article>
  );
}
