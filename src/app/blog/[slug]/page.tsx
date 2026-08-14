import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate, getAllPosts, getAdjacentPosts, getPost, decodeSlug, slugToHref } from "@/lib/posts";
import { ReadingProgress } from "@/components/reading-progress";
import { FadeIn } from "@/components/fade-in";
import { Comments } from "@/components/comments";
import { ScrollSpy } from "@/components/scroll-spy";
import { ProseTilt } from "@/components/prose-tilt";
import { BookTransition } from "@/components/book-transition";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  const posts = getAllPosts().map((post) => ({ slug: post.slug }));
  // 静态导出要求至少生成一个路由；暂无文章时用占位 slug(页面会 404)
  return posts.length > 0 ? posts : [{ slug: "placeholder" }];
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

export default async function PostPage({ params }: { params: Promise<Params> }) {
  const { slug: rawSlug } = await params;
  const slug = decodeSlug(rawSlug);
  const post = await getPost(slug);
  if (!post) notFound();
  const adjacent = getAdjacentPosts(slug);

  return (
    <BookTransition>
      <article className="mx-auto w-full max-w-6xl pb-32 pt-20 sm:pt-24">
      {/* 阅读进度条:Tan 细线 */}
      <ReadingProgress />
      {/* 章节联动:正文滚动高亮当前标题 */}
      <ScrollSpy />
      {/* 文章头部 */}
      <FadeIn>
      <header className="border-b border-line pb-12">
        <h1 className="page-title text-balance">{post.title}</h1>
        <div className="mt-6 flex flex-wrap items-center gap-4 font-mono text-xs text-faint">
          <time>{formatDate(post.date)}</time>
          <span>约 {post.readingTime} 分钟</span>
          {post.tags.map((tag) => (
            <Link
              key={tag}
              href={`/tags/${slugToHref(tag)}`}
              className="transition-colors hover:text-accent"
            >
              #{tag}
            </Link>
          ))}
        </div>
      </header>
      </FadeIn>

      {/* 正文 */}
      <FadeIn delay={100}>
      <ProseTilt>
      <div
        className="prose mt-14"
        dangerouslySetInnerHTML={{ __html: post.html }}
      />
      </ProseTilt>
      </FadeIn>

      {/* 上一篇 / 下一篇 */}
      {(adjacent.prev || adjacent.next) && (
        <nav className="mt-24 grid gap-4 border-t border-line pt-8 sm:grid-cols-2 sm:gap-8">
          {adjacent.prev ? (
            <Link href={`/blog/${slugToHref(adjacent.prev.slug)}`} className="group block">
              <span className="font-mono text-xs text-faint">← 上一篇</span>
              <span className="mt-2 block leading-snug transition-colors group-hover:text-accent">
                {adjacent.prev.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {adjacent.next ? (
            <Link href={`/blog/${slugToHref(adjacent.next.slug)}`} className="group block sm:text-right">
              <span className="font-mono text-xs text-faint">下一篇 →</span>
              <span className="mt-2 block leading-snug transition-colors group-hover:text-accent">
                {adjacent.next.title}
              </span>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}

      {/* 返回 */}
      <footer className="mt-16 border-t border-line pt-8">
        <Link href="/blog" className="text-sm text-muted transition-colors hover:text-accent">
          ← 返回文章列表
        </Link>
      </footer>

      {/* 评论区 */}
      <Comments />
      </article>
    </BookTransition>
  );
}
