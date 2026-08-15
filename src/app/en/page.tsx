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
      <article className="mx-auto w-full max-w-6xl pb-24 pt-8 sm:pt-12">
      <section className="flex flex-col lg:min-h-[calc(100vh-5.75rem)]">
        {/* ============ HERO: vertically centered single column ============ */}
        <div className="hero-scroll flex flex-col items-center pt-8 text-center lg:pt-14">
            <FadeIn>
            {/* title frame: glass material with ink particles, static title */}
            <div className="hero-frame relative mt-8 overflow-hidden px-8">
              <InkParticles />
              <div className="relative z-10">
                <h1 className="page-title page-title--hero">I&apos;m Ajiu.</h1>
              </div>
            </div>

            <p className="mt-8 max-w-lg text-base leading-relaxed text-muted">
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

        {/* ============ Two-column compact lists ============ */}
        <div className="mt-14 grid gap-10 lg:mt-16 lg:grid-cols-2 lg:gap-16">
          {/* Latest Posts */}
          <section>
            <FadeIn>
              <header className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h2 className="font-display text-xl font-medium">
                  Latest Posts
                </h2>
                <Link
                  href="/en/blog"
                  className="group ml-auto text-xs text-muted transition-colors hover:text-accent"
                >
                  All{" "}
                  <span className="inline-block transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </Link>
              </header>
            </FadeIn>
            <FadeIn delay={60}>
              {latestPosts.map((post, i) => (
                <FadeIn key={post.slug} delay={i * 40}>
                  <Link
                    href={`/en/blog/${slugToHref(post.slug)}`}
                    className="post-row post-row--tight grid gap-x-5 gap-y-0.5 sm:grid-cols-[6rem_1fr]"
                  >
                    <time className="post-row-meta pt-[3px]">
                      {formatDate(post.date)}
                    </time>
                    <div className="min-w-0">
                      <div className="post-row-title">{post.title}</div>
                    </div>
                  </Link>
                </FadeIn>
              ))}
            </FadeIn>
          </section>

          {/* Featured */}
          {featuredProjects.length > 0 && (
            <section>
              <FadeIn>
                <header className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h2 className="font-display text-xl font-medium">Featured</h2>
                  <Link
                    href="/en/projects"
                    className="group ml-auto text-xs text-muted transition-colors hover:text-accent"
                  >
                    All{" "}
                    <span className="inline-block transition-transform group-hover:translate-x-0.5">
                      →
                    </span>
                  </Link>
                </header>
              </FadeIn>
              <FadeIn delay={60}>
                {featuredProjects.map((p, i) => (
                  <FadeIn key={p.name} delay={i * 40}>
                    <div className="post-row post-row--tight grid gap-x-5 gap-y-0.5 sm:grid-cols-[6rem_1fr]">
                      <div className="post-row-meta pt-[3px]">{p.year}</div>
                      <div className="min-w-0">
                        <div className="post-row-title flex flex-wrap items-center gap-x-2">
                          <span>{p.name}</span>
                          {p.link && (
                            <a
                              href={p.link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-accent transition-colors hover:underline"
                            >
                              Visit ↗
                            </a>
                          )}
                        </div>
                        <p className="mt-0.5 line-clamp-1 text-[13px] leading-relaxed text-muted">
                          {p.description_en ?? p.description}
                        </p>
                      </div>
                    </div>
                  </FadeIn>
                ))}
              </FadeIn>
            </section>
          )}
        </div>
      </section>
      </article>
    </BookTransition>
  );
}
