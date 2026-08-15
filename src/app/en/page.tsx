import Link from "next/link";
import { site } from "@/lib/site";
import { getAllPosts, formatDate, slugToHref } from "@/lib/posts";
import { projects } from "@/lib/projects";
import { FadeIn } from "@/components/fade-in";
import { InkParticles } from "@/components/ink-particles";
import { BookTransition } from "@/components/book-transition";

export default function HomeEn() {
  const posts = getAllPosts("en");
  const latestPosts = posts.slice(0, 4);
  const featuredProjects = projects.filter((p) => p.featured).slice(0, 3);
  const tagCount = new Set(posts.flatMap((p) => p.tags ?? [])).size;

  return (
    <BookTransition>
      <article className="mx-auto w-full max-w-6xl pb-24 pt-5 sm:pt-7">
      <section className="flex flex-col lg:min-h-[calc(100vh-5.75rem)]">
        {/* ============ HERO: vertically centered single column ============ */}
        <div className="hero-scroll flex flex-col items-center pt-5 text-center lg:pt-7">
            <FadeIn>
            {/* title frame: glass material with ink particles, static title */}
            <div className="hero-frame relative mt-8 overflow-hidden px-8">
              <InkParticles />
              <div className="relative z-10">
                <h1 className="page-title page-title--hero">I&apos;m Ajiu.</h1>
              </div>
            </div>

            <p className="mx-auto mt-8 max-w-lg text-center text-base leading-relaxed text-muted">
              Test engineer in test R&amp;D. Minimal design. Clean text.
              Perfectionist.
            </p>
            {/* dual CTA pills */}
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <a
                href="https://github.com/ZeniX-ally"
                target="_blank"
                rel="noreferrer"
                className="btn-pill btn-primary"
              >
                GitHub ↗
              </a>
              <Link href="/en/about" className="btn-pill btn-ghost">
                About
              </Link>
            </div>
            {/* stats */}
            <div className="mt-8 flex flex-wrap items-baseline justify-center gap-x-10 gap-y-2">
              {[
                { n: posts.length, label: "posts" },
                { n: projects.length, label: "projects" },
                { n: tagCount, label: "tags" },
              ].map((s) => (
                <div key={s.label}>
                  <span className="font-display text-2xl font-medium tracking-tight">
                    {s.n}
                  </span>
                  <span className="ml-2 text-xs text-faint">{s.label}</span>
                </div>
              ))}
            </div>
            </FadeIn>
        </div>

        {/* ============ Latest writing: Apple-style light list ============ */}
        <section className="mt-24 sm:mt-28">
          <FadeIn>
            <header className="mb-9 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
              <div>
                <div className="page-head-label mb-3">Latest Writing</div>
                <h2 className="section-title">Latest Posts</h2>
              </div>
              <Link
                href="/en/blog"
                className="group text-sm text-muted transition-colors hover:text-accent"
              >
                All{" "}
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
                  href={`/en/blog/${slugToHref(post.slug)}`}
                  className="post-link grid gap-x-6 gap-y-0.5 sm:grid-cols-[8rem_1fr]"
                >
                  <time className="post-link-date">{formatDate(post.date)}</time>
                  <span className="post-link-title">{post.title}</span>
                </Link>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* ============ Selected work: light card wall ============ */}
        {featuredProjects.length > 0 && (
          <section className="mt-20 sm:mt-24">
            <FadeIn>
              <header className="mb-9 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
                <div>
                  <div className="page-head-label mb-3">Selected Work</div>
                  <h2 className="section-title">Featured</h2>
                </div>
                <Link
                  href="/en/projects"
                  className="group text-sm text-muted transition-colors hover:text-accent"
                >
                  All{" "}
                  <span className="inline-block transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </Link>
              </header>
            </FadeIn>
            <div className="grid gap-5 sm:grid-cols-2">
              {featuredProjects.map((p, i) => {
                const card = (
                  <div className="light-card group flex h-full min-h-[11rem] flex-col gap-4 p-6">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-display text-xl font-medium tracking-tight">
                        {p.name}
                      </h3>
                      <span className="shrink-0 text-xs text-faint">{p.year}</span>
                    </div>
                    <p className="line-clamp-2 text-sm leading-relaxed text-muted">
                      {p.description_en ?? p.description}
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
                      {p.link && (
                        <a
                          href={p.link}
                          target="_blank"
                          rel="noreferrer"
                          className="ml-auto inline-flex items-center gap-1 text-sm font-medium text-accent transition-colors group-hover:text-accent-strong"
                        >
                          Visit{" "}
                          <span className="transition-transform group-hover:translate-x-0.5">
                            ↗
                          </span>
                        </a>
                      )}
                    </div>
                  </div>
                );
                return <FadeIn key={p.name} delay={i * 60}>{card}</FadeIn>;
              })}
            </div>
          </section>
        )}
      </section>
      </article>
    </BookTransition>
  );
}
