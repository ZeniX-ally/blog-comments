import type { Metadata } from "next";
import { projects } from "@/lib/projects";
import { FadeIn } from "@/components/fade-in";
import { BookTransition } from "@/components/book-transition";

export const metadata: Metadata = {
  title: "Projects",
  description: "Things I've built.",
};

export default function ProjectsPageEn() {
  return (
    <BookTransition>
      <article className="mx-auto w-full max-w-6xl pb-32 pt-20 sm:pt-24">
      <div className="grid gap-14 lg:grid-cols-[300px_1fr] lg:gap-20">
        {/* 左栏:sticky 介绍牌 */}
        <FadeIn>
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="page-head-label mb-6">作品</div>
            <h1 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
              Projects
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-muted">
              Things I&apos;ve built, mostly born from my own real needs.
            </p>
            <div className="mt-8 text-xs text-faint">
              {projects.length} projects
            </div>
          </aside>
        </FadeIn>

        {/* 右栏:项目列表 */}
        <div className="min-w-0 pb-10">
          {projects.length === 0 ? (
            <div className="border-t border-line py-20 text-center">
              <p className="text-muted">
                Nothing here yet — projects will land here eventually.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {projects.map((p, i) => (
                <FadeIn key={p.name} delay={i * 60}>
                  <div className="light-card group p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <span className="mt-0.5 block text-xs text-faint">
                          {p.year}
                        </span>
                      </div>
                    </div>
                    <p className="mt-2.5 text-sm leading-relaxed text-muted">
                      {p.description_en ?? p.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3">
                      <span className="min-w-0 truncate text-[11px] text-faint">
                        {p.tech.join(" · ")}
                      </span>
                      <span className="flex shrink-0 gap-4 text-xs">
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
                        {p.repo && (
                          <a
                            href={p.repo}
                            target="_blank"
                            rel="noreferrer"
                            className="text-muted transition-colors hover:text-foreground"
                          >
                            Repo ↗
                          </a>
                        )}
                      </span>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          )}
        </div>
      </div>
      </article>
    </BookTransition>
  );
}
