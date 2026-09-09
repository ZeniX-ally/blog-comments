import Link from "next/link";
import { site } from "@/lib/site";
import { getAllPosts, formatDate, slugToHref } from "@/lib/posts";
import { getAllProjects, getFeaturedProjects } from "@/lib/projects";
import { FadeIn } from "@/components/fade-in";
import { InkParticles } from "@/components/ink-particles";
import { HighlightChars } from "@/components/highlight-chars";
import { BookTransition } from "@/components/book-transition";

export default function Home() {
  const posts = getAllPosts();
  const latestPosts = posts.slice(0, 4);
  const projects = getAllProjects();
  const featuredProjects = getFeaturedProjects(4);
  const tagCount = new Set(posts.flatMap((p) => p.tags ?? [])).size;

  return (
    <BookTransition>
      <article className="mx-auto w-full max-w-6xl pb-24 pt-5 sm:pt-8">
      <section className="flex flex-col lg:min-h-[calc(100vh-5.75rem)]">
        {/* ============ HERO:垂直居中单栏,克制高级 ============ */}
        <div className="hero-scroll flex flex-col items-center pt-5 text-center lg:pt-7">
            <FadeIn>
            {/* 大标题框:玻璃材质,粒子漂浮,静态标题 */}
            <div className="hero-frame relative mt-[59px] overflow-hidden px-8">
              <InkParticles />
              <div className="relative z-10">
                <h1 className="page-title page-title--hero">
                  <HighlightChars text={site.hero.greeting} />
                </h1>
              </div>
            </div>

            {/* 副标题 */}
            <p className="mx-auto mt-8 max-w-lg text-center text-base leading-relaxed text-muted">
              {site.hero.bio.join(" ")}
            </p>

            {/* 统计:克制数字排版 */}
            <div className="mt-8 flex flex-wrap items-baseline justify-center gap-x-10 gap-y-2">
              {[
                { n: posts.length, label: "文章" },
                { n: projects.length, label: "作品" },
                { n: tagCount, label: "标签" },
              ].map((s) => (
                <div key={s.label}>
                  <span className="font-display text-2xl font-medium tracking-tight">
                    {s.n}
                  </span>
                  <span className="ml-2 text-xs text-faint">{s.label}</span>
                </div>
              ))}
            </div>

            {/* 向下指引箭头:缓慢下沉-回弹,提示下方内容 */}
            <div className="mt-[7px] flex justify-center" aria-hidden="true">
              <svg
                className="scroll-hint h-5 w-5 text-faint"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 4v16" />
                <path d="m6 14 6 6 6-6" />
              </svg>
            </div>
            </FadeIn>
        </div>

        {/* ============ 最新文章:苹果式轻列表(无分隔线,间距分组) ============ */}
        <section className="mt-24 sm:mt-28">
          <FadeIn>
            <header className="mb-9 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
              <div>
                <div className="page-head-label mb-3">Latest Writing</div>
                <h2 className="section-title">最新文章</h2>
              </div>
              <Link
                href="/blog"
                className="group text-sm text-muted transition-colors hover:text-accent"
              >
                全部{" "}
                <span className="inline-block transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
            </header>
          </FadeIn>
          <div className="flex flex-col">
            {latestPosts.map((post, i) => (
              <FadeIn key={post.slug} delay={i * 40}>
                <Link
                  href={`/blog/${slugToHref(post.slug)}`}
                  className="post-link grid gap-x-6 gap-y-0.5 sm:grid-cols-[8rem_1fr]"
                >
                  <time className="post-link-date">{formatDate(post.date)}</time>
                  <span className="post-link-title">{post.title}</span>
                </Link>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* ============ 精选项目:浅灰卡片墙(视觉重收尾) ============ */}
        {featuredProjects.length > 0 && (
          <section className="mt-20 sm:mt-24">
            <FadeIn>
              <header className="mb-9 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
                <div>
                  <div className="page-head-label mb-3">Selected Work</div>
                  <h2 className="section-title">精选项目</h2>
                </div>
                <Link
                  href="/projects"
                  className="group text-sm text-muted transition-colors hover:text-accent"
                >
                  全部{" "}
                  <span className="inline-block transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </Link>
              </header>
            </FadeIn>
            <div className="grid gap-5 sm:grid-cols-2">
              {featuredProjects.map((p, i) => (
                <FadeIn key={p.slug} delay={i * 60}>
                  <Link
                    href={`/projects/${slugToHref(p.slug)}`}
                    className="block h-full"
                  >
                    <div className="light-card group flex h-full min-h-[11rem] flex-col gap-4 p-6">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="font-display text-xl font-medium tracking-tight transition-colors group-hover:text-accent">
                          {p.name}
                        </h3>
                        <span className="shrink-0 text-xs text-faint">{p.year}</span>
                      </div>
                      <p className="line-clamp-2 text-sm leading-relaxed text-muted">
                        {p.description}
                      </p>
                      <div className="mt-auto flex flex-wrap items-center gap-2">
                        {p.tech.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="rounded-full bg-[var(--surface-soft)] px-2.5 py-1 text-xs text-muted"
                          >
                            {t}
                          </span>
                        ))}
                        <span className="ml-auto inline-flex items-center gap-1 text-sm font-medium text-accent transition-colors group-hover:text-accent-strong">
                          详情{" "}
                          <span className="transition-transform group-hover:translate-x-0.5">
                            →
                          </span>
                        </span>
                      </div>
                    </div>
                  </Link>
                </FadeIn>
              ))}
            </div>
          </section>
        )}
      </section>
      </article>
    </BookTransition>
  );
}
