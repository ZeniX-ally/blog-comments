import Link from "next/link";
import { formatDate, slugToHref, type PostMeta } from "@/lib/posts";

/**
 * 文章列表 —— 无卡片、无阴影，只有标题、日期与一道细分隔线。
 * 极简站点的核心组件，首页与文章列表页共用。
 */
export function PostList({ posts }: { posts: PostMeta[] }) {
  if (posts.length === 0) {
    return <p className="py-8 text-muted">还没有文章，去 content/posts 里写第一篇吧。</p>;
  }

  return (
    <ul>
      {posts.map((post) => (
        <li key={post.slug} className="border-b border-line last:border-b-0">
          <Link href={`/blog/${slugToHref(post.slug)}`} className="group block py-5">
            <div className="flex items-baseline justify-between gap-6">
              <h3 className="text-lg font-medium leading-snug transition-colors group-hover:text-accent">
                {post.title}
              </h3>
              <time className="shrink-0 font-mono text-xs text-faint">
                {formatDate(post.date)}
              </time>
            </div>
            {post.excerpt && (
              <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">
                {post.excerpt}
              </p>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
