import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { pageMeta } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { getAllPosts, formatDate, slugToHref } from "@/lib/posts";
import { getFeaturedProjects } from "@/lib/projects";
import { FadeIn } from "@/components/fade-in";
import { InkParticles } from "@/components/ink-particles";
import { HighlightChars } from "@/components/highlight-chars";
import { BookTransition } from "@/components/book-transition";

export const metadata: Metadata = pageMeta({
  title: { absolute: site.title },
  description: site.description,
  path: "/",
});

export default function Home() {
  const posts = getAllPosts();
  const latestPosts = posts.slice(0, 4);
  const featuredProjects = getFeaturedProjects(3);
  const tagCount = new Set(posts.flatMap((p) => p.tags ?? [])).size;

  return (
    <BookTransition>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: site.name,
            url: site.url,
            description: site.description,
            inLanguage: "zh-CN",
          },
          {
            "@context": "https://schema.org",
            "@type": "Person",
            name: site.name,
            url: site.url,
            sameAs: site.links.github ? [site.links.github] : [],
          },
        ]}
      />
      <article className="content-shell pb-24 pt-5 sm:pt-8">
      <section className="flex flex-col lg:min-h-[calc(100vh-5.75rem)]">
        {/* ============ HERO ============ */}
        <div className="hero-scroll flex flex-col items-center pt-5 text-center lg:pt-7">
            <FadeIn>
            <div className="hero-frame relative mt-10 overflow-hidden px-8 sm:mt-12">
              <InkParticles />
              <div className="relative z-10">
                <h1 className="page-title page-title--hero">
                  <HighlightChars text={site.hero.greeting} />
                </h1>
              </div>
            </div>

            <p className="mx-auto mt-8 max-w-lg text-center text-body text-muted">
              {site.hero.bio.join(" ")}
            </p>

            <div className="mt-8 flex flex-wrap items-baseline justify-center gap-x-10 gap-y-2">
              {[
                { n: posts.length, label: "文章" },
                { n: featuredProjects.length, label: "精选" },
                { n: tagCount, label: "标签" },
              ].map((s) => (
                <div key={s.label}>
                  <span className="font-display text-2xl font-semibold tracking-tight">
                    {s.n}
                  </span>
                  <span className="ml-2 text-meta text-faint">{s.label}</span>
                </div>
              ))}
            </div>

            <div className="mt-2 flex justify-center" aria-hidden="true">
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

        {/* ============ 精选作品墙（视觉权重高于文章列表） ============ */}
        {featuredProjects.length > 0 && (
          <section className="mt-16 sm:mt-24">
            <FadeIn>
              <header className="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 sm:mb-10">
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
            <div
              className={`grid gap-5 sm:gap-6 ${
                featuredProjects.length === 1
                  ? "grid-cols-1"
                  : featuredProjects.length === 3
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2"
                    : "grid-cols-1 sm:grid-cols-2"
              }`}
            >
              {featuredProjects.map((p, i) => (
                <FadeIn
                  key={p.slug}
                  delay={i * 60}
                  className={
                    featuredProjects.length === 3 && i === 2
                      ? "sm:col-span-2 lg:col-span-2 lg:max-w-none"
                      : undefined
                  }
                >
                  <Link
                    href={`/projects/${slugToHref(p.slug)}`}
                    className="block h-full"
                  >
                    <div className="featured-card group flex h-full min-h-[14rem] flex-col gap-5 p-6 sm:p-7">
                      {p.cover ? (
                        <div className="featured-card-media">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p.cover} alt="" />
                        </div>
                      ) : (
                        <div className="featured-card-media flex items-center justify-center">
                          <span className="font-display text-3xl font-semibold text-faint/40">
                            {p.name.slice(0, 1)}
                          </span>
                        </div>
                      )}
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="project-name transition-colors group-hover:text-accent">
                          {p.name}
                        </h3>
                        <span className="shrink-0 text-meta text-faint">{p.year}</span>
                      </div>
                      <p className="line-clamp-2 text-body text-muted">
                        {p.description}
                      </p>
                      <div className="mt-auto flex flex-wrap items-center gap-2">
                        {p.tech.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="rounded-full bg-[var(--surface-soft)] px-2.5 py-1 text-meta text-muted"
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

        {/* ============ 最新文章：轻列表，弱于作品卡 ============ */}
        <section className="mt-16 sm:mt-24">
          <FadeIn>
            <header className="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-3 sm:mb-10">
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
          <div className="flex flex-col gap-1">
            {latestPosts.map((post, i) => (
              <FadeIn key={post.slug} delay={i * 40}>
                <Link
                  href={`/blog/${slugToHref(post.slug)}`}
                  className="post-link grid gap-x-6 gap-y-0.5 sm:grid-cols-[8rem_1fr]"
                >
                  <time className="post-link-date text-meta">{formatDate(post.date)}</time>
                  <span className="post-link-title">{post.title}</span>
                </Link>
              </FadeIn>
            ))}
          </div>
        </section>
      </section>
      </article>
    </BookTransition>
  );
}
