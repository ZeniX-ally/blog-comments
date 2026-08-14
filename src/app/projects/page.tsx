import type { Metadata } from "next";
import { projects } from "@/lib/projects";
import { FadeIn } from "@/components/fade-in";
import { BookTransition } from "@/components/book-transition";

export const metadata: Metadata = {
  title: "作品",
  description: "做过的一些项目。",
};

export default function ProjectsPage() {
  return (
    <BookTransition>
      <article className="mx-auto w-full max-w-6xl pb-32 pt-20 sm:pt-24">
      <div className="grid gap-14 lg:grid-cols-[300px_1fr] lg:gap-20">
        {/* 左栏:sticky 介绍牌 */}
        <FadeIn>
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="page-head-label mb-6">[0x00] PROJECTS</div>
            <h1 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
              作品
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-muted">
              做过的项目，大都源于自己的真实需求。
            </p>
            <div className="mt-8 flex gap-6 font-mono text-xs text-faint">
              <span>{projects.length} projects</span>
            </div>
            <div className="mt-6 font-mono text-xs text-accent">
              zenix@0xff:~/projects$ ls
              <span className="cursor-blink ml-0.5">▍</span>
            </div>
          </aside>
        </FadeIn>

        {/* 右栏:项目列表 */}
        <div className="min-w-0 pb-10">
          {projects.length === 0 ? (
            <div className="border-t border-line py-20 text-center">
              <p className="text-muted">还没有作品，之后有了会放在这里。</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {projects.map((p, i) => (
                <FadeIn key={p.name} delay={i * 60}>
                  <div className="light-card group p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="led led-local" aria-hidden="true" />
                        <span className="font-medium">{p.name}</span>
                      </div>
                      <span className="shrink-0 font-mono text-xs text-faint">
                        {p.year}
                      </span>
                    </div>
                    <p className="mt-2.5 text-sm leading-relaxed text-muted">
                      {p.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3">
                      <span className="min-w-0 truncate font-mono text-[11px] text-faint">
                        {p.tech.join(" · ")}
                      </span>
                      <span className="flex shrink-0 gap-4 font-mono text-xs">
                        {p.link && (
                          <a
                            href={p.link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-accent transition-colors hover:underline"
                          >
                            访问 ↗
                          </a>
                        )}
                        {p.repo && (
                          <a
                            href={p.repo}
                            target="_blank"
                            rel="noreferrer"
                            className="text-muted transition-colors hover:text-foreground"
                          >
                            源码 ↗
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
