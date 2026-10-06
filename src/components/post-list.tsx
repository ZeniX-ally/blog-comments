import Link from "next/link";
import { formatDate, slugToHref, type PostMeta } from "@/lib/posts";

/**
 * 文章列表 —— 苹果式轻列表(无分隔线,间距分组,hover 淡灰底)。
 * 每行:日期 | 标题 + 摘要 + 阅读时长/tags,hover 标题变绿。
 */
export function PostList({ posts, basePath = "" }: { posts: PostMeta[]; basePath?: string }) {
  if (posts.length === 0) {
    return <p className="py-12 text-muted">还没有文章，去 content/posts 里写第一篇吧。</p>;
  }

  return (
    <div className="post-list-grid grid gap-x-8 sm:grid-cols-2">
      {posts.map((post) => (
        <Link
          key={post.slug}
          href={`${basePath}/blog/${slugToHref(post.slug)}`}
          className="post-link grid gap-x-6 gap-y-1.5 sm:grid-cols-[7.5rem_1fr]"
        >
          <time className="post-link-date pt-[3px]">{formatDate(post.date)}</time>
          <div className="min-w-0">
            <div className="post-link-title">{post.title}</div>
            {post.excerpt && (
              <p className="mt-1 line-clamp-1 text-sm leading-relaxed text-muted">
                {post.excerpt}
              </p>
            )}
            <div className="post-link-date mt-1.5 opacity-80">
              {post.readingTime} min
              {post.tags.length > 0 && (
                <span className="ml-2">{post.tags.map((t) => `#${t}`).join(" ")}</span>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
