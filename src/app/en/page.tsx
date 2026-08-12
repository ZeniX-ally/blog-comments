import Link from "next/link";
import { getAllPosts, formatDate, slugToHref } from "@/lib/posts";
import { projects } from "@/lib/projects";
import { FadeIn } from "@/components/fade-in";
import { TiltCard } from "@/components/tilt-card";
import { TypewriterText } from "@/components/typewriter-text";
import { CommandLine } from "@/components/command-line";

function SectionHeader({
  hex,
  title,
  en,
  moreHref,
}: {
  hex: string;
  title: string;
  en: string;
  moreHref?: string;
}) {
  return (
    <header className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-line pb-2">
      <span className="font-mono text-xs text-faint">[{hex}]</span>
      <h2 className="font-display text-xl font-medium">{title}</h2>
      <span className="font-mono text-[10px] tracking-[0.25em] text-accent">
        {en}
      </span>
      {moreHref && (
        <Link
          href={moreHref}
          className="group ml-auto font-mono text-xs text-muted transition-colors hover:text-accent"
        >
          All{" "}
          <span className="inline-block transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </Link>
      )}
    </header>
  );
}

/** 终端提示行(纯装饰) */
function TerminalHint() {
  return (
    <p className="font-mono text-sm leading-relaxed text-muted">
      <span className="text-accent">zenix@0xff</span>
      <span className="text-faint">:~$</span>{" "}
      <span className="text-fg">whoami</span>
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
    <div className="mx-auto w-full max-w-5xl py-12 sm:py-16">
      {/* ============ HERO ============ */}
      <section className="grid gap-14 lg:grid-cols-[1fr_1.15fr] lg:items-center">
        <FadeIn>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-mono text-xs text-faint">[0x00]</span>
            <span className="font-mono text-[10px] tracking-[0.25em] text-accent">
              HOME
            </span>
          </div>
          <h1 className="mt-4 font-display text-5xl font-normal leading-[1.08] tracking-tight sm:text-6xl">
            <TypewriterText text="I'm Ajiu." speed={120} startDelay={300} />
          </h1>
          <div className="mt-5 space-y-2 text-[15px] leading-relaxed text-muted">
            <p>Test engineer in test R&amp;D.</p>
            <p>Minimal design. Clean text. Perfectionist.</p>
          </div>
          <div className="mt-6">
            <TerminalHint />
          </div>
          <div className="mt-8 flex gap-10 border-t border-line pt-6">
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

        <FadeIn delay={150}>
          <CommandLine lang="en" />
        </FadeIn>
      </section>

      {/* ============ CONTENT ============ */}
      <div className="mt-20 grid gap-12 lg:grid-cols-2 lg:items-start">
        <section>
          <FadeIn>
            <SectionHeader
              hex="0x01"
              title="Latest Posts"
              en="LATEST POSTS"
              moreHref="/en/blog"
            />
          </FadeIn>
          <FadeIn delay={60}>
            <div className="grid grid-cols-1 gap-4">
              {latestPosts.map((post, i) => (
                <FadeIn key={post.slug} delay={i * 60}>
                  <TiltCard className="h-full">
                    <Link
                      href={`/en/blog/${slugToHref(post.slug)}`}
                      className="tool-card group flex min-h-[8.5rem] flex-col justify-between gap-2 rounded-lg p-4"
                    >
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="led led-lab" aria-hidden="true" />
                          <span className="font-medium leading-snug group-hover:text-accent">
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
                        {post.tags.length > 0 && (
                          <span className="truncate">
                            {post.tags.map((t) => `#${t}`).join(" ")}
                          </span>
                        )}
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
          </FadeIn>
        </section>

        {featuredProjects.length > 0 && (
          <section>
            <FadeIn>
              <SectionHeader
                hex="0x02"
                title="Featured"
                en="FEATURED"
                moreHref="/en/projects"
              />
            </FadeIn>
            <div className="grid grid-cols-1 gap-4">
              {featuredProjects.map((p, i) => (
                <FadeIn key={p.name} delay={i * 60}>
                  <TiltCard className="h-full">
                    <div className="tool-card flex min-h-[7.5rem] flex-col justify-between gap-2 rounded-lg p-4">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="led led-local" aria-hidden="true" />
                          <span className="font-medium">{p.name}</span>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-muted">
                          {p.description_en ?? p.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between border-t border-line/80 pt-2 font-mono text-[11px] text-faint">
                        <span>{p.year}</span>
                        {p.link && (
                          <a
                            href={p.link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-accent transition-colors hover:underline"
                          >
                            Visit ↗
                          </a>
                        )}
                      </div>
                    </div>
                  </TiltCard>
                </FadeIn>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
