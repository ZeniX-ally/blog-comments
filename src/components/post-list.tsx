import Link from "next/link";
import { formatDate, slugToHref, type PostMeta } from "@/lib/posts";
import { FadeIn } from "./fade-in";
import { TiltCard } from "./tilt-card";

/**
 * 文章列表 —— 卡片网格,与首页精选项目/最新文章统一(TiltCard 3D 倾斜+光斑)。
 * LED 状态灯 + 标题 + 摘要 + 底部日期/阅读时长/tags 信息行。
 * 滚动进入视口时逐项淡入;basePath 用于英文站链接前缀(/en),中文站不传。
 */
export function PostList({ posts, basePath = "" }: { posts: PostMeta[]; basePath?: string }) {
  if (posts.length === 0) {
    return <p className="py-8 text-muted">还没有文章，去 content/posts 里写第一篇吧。</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {posts.map((post, i) => (
        <FadeIn key={post.slug} delay={Math.min(i, 6) * 50}>
          <TiltCard className="h-full">
            <Link
              href={`${basePath}/blog/${slugToHref(post.slug)}`}
              className="tool-card group flex min-h-[8.5rem] flex-col justify-between gap-2 rounded-lg p-4"
            >
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="led" aria-hidden="true" />
                  <span className="font-medium leading-snug transition-colors group-hover:text-accent">
                    {post.title}
                  </span>
                </div>
                {post.excerpt && (
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
                    {post.excerpt}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between border-t border-line/80 pt-2 font-mono text-[11px] text-faint">
                <time>{formatDate(post.date)}</time>
                <span className="truncate">
                  约 {post.readingTime} 分钟
                  {post.tags.length > 0 && (
                    <span className="ml-1.5">{post.tags.map((t) => `#${t}`).join(" ")}</span>
                  )}
                </span>
                <span
                  aria-hidden="true"
                  className="text-accent opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100"
                >
                  →
                </span>
              </div>
            </Link>
          </TiltCard>
        </FadeIn>
      ))}
    </div>
  );
}
