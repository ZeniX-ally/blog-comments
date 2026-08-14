import Link from "next/link";
import { formatDate, slugToHref, type PostMeta } from "@/lib/posts";
import { FadeIn } from "./fade-in";

/**
 * 文章列表 —— 行式分隔线列表(Antigravity 式克制结构)。
 * 每行:mono 日期 | 标题 + 摘要 + 阅读时长/tags,hover 标题变绿。
 * 滚动进入视口时逐项淡入;basePath 用于英文站链接前缀(/en),中文站不传。
 */
export function PostList({ posts, basePath = "" }: { posts: PostMeta[]; basePath?: string }) {
  if (posts.length === 0) {
    return <p className="py-12 text-muted">还没有文章，去 content/posts 里写第一篇吧。</p>;
  }

  return (
    <div className="post-list-grid grid gap-x-12 sm:grid-cols-2">
      {posts.map((post, i) => (
        <FadeIn key={post.slug} delay={Math.min(i, 6) * 50}>
          <Link
            href={`${basePath}/blog/${slugToHref(post.slug)}`}
            className="post-row grid gap-x-6 gap-y-1.5 sm:grid-cols-[7.5rem_1fr]"
          >
            <time className="post-row-meta pt-[3px]">{formatDate(post.date)}</time>
            <div className="min-w-0">
              <div className="post-row-title">{post.title}</div>
              {post.excerpt && (
                <p className="mt-1 line-clamp-1 text-sm leading-relaxed text-muted">
                  {post.excerpt}
                </p>
              )}
              <div className="post-row-meta mt-1.5 opacity-80">
                {post.readingTime} min
                {post.tags.length > 0 && (
                  <span className="ml-2">{post.tags.map((t) => `#${t}`).join(" ")}</span>
                )}
              </div>
            </div>
          </Link>
        </FadeIn>
      ))}
    </div>
  );
}
