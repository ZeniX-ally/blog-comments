import Link from "next/link";
import { getAllPosts, formatDate, slugToHref } from "@/lib/posts";
import { projects } from "@/lib/projects";
import { FadeIn } from "@/components/fade-in";
import { TypewriterText } from "@/components/typewriter-text";
import { CommandLine } from "@/components/command-line";

/** 终端提示行(纯装饰) */
function TerminalHint() {
  return (
    <p className="font-mono text-sm leading-relaxed text-muted">
      <span className="text-accent">zenix@0xff</span>
      <span className="text-faint">:~$</span>{" "}
      <span className="text-foreground">whoami</span>
      <span aria-hidden="true" className="cursor-blink ml-0.5 text-accent">
        ▍
      </span>
    </p>
  );
}

export default function HomeEn() {
  const posts = getAllPosts("en");
  const latestPosts = posts.slice(0, 5);
  const featuredProjects = projects.filter((p) => p.featured).slice(0, 3);
  const tagCount = new Set(posts.flatMap((p) => p.tags ?? [])).size;

  return (
    <article className="mx-auto w-full max-w-4xl pb-24 pt-16 sm:pt-20">
      {/* ============ HERO: 左对齐,大留白 ============ */}
      <section className="hero-scroll">
        <FadeIn>
          <div className="page-head-label mb-6">[0x00] HOME</div>
          <h1 className="page-title">
            <TypewriterText text="I'm Ajiu." speed={120} startDelay={300} />
          </h1>
          <div className="mt-6 max-w-xl space-y-2 text-base leading-relaxed text-muted">
            <p>Test engineer in test R&amp;D.</p>
            <p>Minimal design. Clean text. Perfectionist.</p>
          </div>
          {/* 胶囊操作行 */}
          <div className="mt-10 flex flex-wrap items-center gap-3">
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
          {/* 终端提示行(纯装饰) */}
          <div className="mt-10">
            <TerminalHint />
          </div>
          {/* 统计数字 */}
          <div className="mt-10 flex gap-12 border-t border-line pt-6">
            {[
              { n: posts.length, label: "posts" },
              { n: projects.length, label: "projects" },
              { n: tagCount, label: "tags" },
            ].map((s) => (
              <div key={s.label}>
                <div className="font-display text-3xl font-medium text-accent-strong">
                  {s.n}
                </div>
                <div className="mt-0.5 font-mono text-[11px] tracking-widest text-faint">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </FadeIn>
      </section>

      {/* ============ 命令彩蛋: hero 下方独立区块,单列 ============ */}
      <section className="mt-24 max-w-2xl">
        <FadeIn delay={120}>
          <CommandLine lang="en" />
        </FadeIn>
      </section>

      {/* ============ Latest Posts: 行式列表 ============ */}
      <section className="mt-24">
        <FadeIn>
          <header className="mb-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-mono text-xs text-faint">[0x01]</span>
            <h2 className="font-display text-2xl font-medium">
              Latest Posts
            </h2>
            <span className="font-mono text-[10px] tracking-[0.25em] text-accent">
              LATEST POSTS
            </span>
            <Link
              href="/en/blog"
              className="group ml-auto font-mono text-xs text-muted transition-colors hover:text-accent"
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
                className="post-row grid gap-x-6 gap-y-1.5 sm:grid-cols-[7.5rem_1fr]"
              >
                <time className="post-row-meta pt-[3px]">
                  {formatDate(post.date)}
                </time>
                <div className="min-w-0">
                  <div className="post-row-title">{post.title}</div>
                  {post.excerpt && (
                    <p className="mt-1 line-clamp-1 text-sm leading-relaxed text-muted">
                      {post.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            </FadeIn>
          ))}
        </FadeIn>
      </section>

      {/* ============ Featured: 行式 ============ */}
      {featuredProjects.length > 0 && (
        <section className="mt-20">
          <FadeIn>
            <header className="mb-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-mono text-xs text-faint">[0x02]</span>
              <h2 className="font-display text-2xl font-medium">Featured</h2>
              <span className="font-mono text-[10px] tracking-[0.25em] text-accent">
                FEATURED
              </span>
              <Link
                href="/en/projects"
                className="group ml-auto font-mono text-xs text-muted transition-colors hover:text-accent"
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
                <div className="post-row grid gap-x-6 gap-y-1.5 sm:grid-cols-[7.5rem_1fr]">
                  <div className="post-row-meta pt-[3px]">{p.year}</div>
                  <div className="min-w-0">
                    <div className="post-row-title flex flex-wrap items-center gap-x-2.5">
                      <span>{p.name}</span>
                      {p.link && (
                        <a
                          href={p.link}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-xs text-accent transition-colors hover:underline"
                        >
                          Visit ↗
                        </a>
                      )}
                    </div>
                    <p className="mt-1 line-clamp-1 text-sm leading-relaxed text-muted">
                      {p.description_en ?? p.description}
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </FadeIn>
        </section>
      )}
    </article>
  );
}
