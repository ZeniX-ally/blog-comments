import Link from "next/link";
import { formatDate, slugToHref, type PostMeta } from "@/lib/posts";
import { FadeIn } from "./fade-in";

/**
 * 文章列表 —— 无卡片、无阴影，只有标题、日期与一道细分隔线。
 * 极简站点的核心组件，首页与文章列表页共用。
 * hover 时标题变 Tan + 右侧 → 箭头滑入;滚动进入视口时逐项淡入。
 */
export function PostList({ posts }: { posts: PostMeta[] }) {
  if (posts.length === 0) {
    return <p className="py-8 text-muted">还没有文章，去 content/posts 里写第一篇吧。</p>;
  }

  return (
    <ul>
      {posts.map((post, i) => (
        <li key={post.slug} className="-mx-3 border-b border-line px-3 transition-colors duration-300 last:border-b-0 hover:bg-[rgba(212,162,127,0.04)]">
          <FadeIn delay={Math.min(i, 6) * 50}>
            <Link href={`/blog/${slugToHref(post.slug)}`} className="group block py-5">
              <div className="flex items-baseline justify-between gap-6">
                <h3 className="text-lg font-normal leading-snug transition-colors group-hover:text-accent">
                  {post.title}
                </h3>
                <span className="flex shrink-0 items-center gap-3">
                  <time className="font-mono text-xs text-faint transition-colors group-hover:text-muted">
                    {formatDate(post.date)}
                  </time>
                  <span
                    aria-hidden="true"
                    className="font-mono text-xs text-accent opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 -translate-x-1"
                  >
                    →
                  </span>
                </span>
              </div>
              {post.excerpt && (
                <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">
                  {post.excerpt}
                </p>
              )}
              {post.tags.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 font-mono text-xs text-faint">
                  {post.tags.map((tag) => (
                    <span key={tag}>#{tag}</span>
                  ))}
                </div>
              )}
            </Link>
          </FadeIn>
        </li>
      ))}
    </ul>
  );
}
