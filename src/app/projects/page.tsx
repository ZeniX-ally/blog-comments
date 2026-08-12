import type { Metadata } from "next";
import { projects } from "@/lib/projects";
import { FadeIn } from "@/components/fade-in";
import { TiltCard } from "@/components/tilt-card";

export const metadata: Metadata = {
  title: "作品",
  description: "做过的一些项目。",
};

export default function ProjectsPage() {
  return (
    <article className="mx-auto w-full max-w-4xl py-12 sm:py-16">
      <div className="grid gap-12 lg:grid-cols-[250px_1fr]">
        {/* 左栏:sticky 信息牌 */}
        <FadeIn>
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-mono text-xs text-faint">[0x00]</span>
              <h1 className="font-display text-2xl font-medium">作品</h1>
              <span className="font-mono text-[10px] tracking-[0.25em] text-accent">
                PROJECTS
              </span>
            </div>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">
              做过的项目，大都源于自己的真实需求。
            </p>
            <div className="mt-5 font-mono text-xs text-accent">
              zenix@0xff:~/projects$ ls
              <span className="cursor-blink ml-0.5">▍</span>
            </div>
            <div className="mt-6 space-y-1 border-t border-line pt-4 font-mono text-xs text-faint">
              <div>{projects.length} projects</div>
            </div>
          </aside>
        </FadeIn>

        {/* 右栏:作品列表 */}
        <div className="min-w-0">
          {projects.length === 0 ? (
            <div className="border-t border-line py-20 text-center">
              <p className="text-muted">还没有作品，之后有了会放在这里。</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {projects.map((p, i) => (
                <FadeIn key={p.name} delay={i * 60}>
                  <TiltCard className="h-full">
                    <div className="tool-card flex min-h-[9rem] flex-col justify-between gap-2 rounded-lg p-4">
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <span className="led led-local" aria-hidden="true" />
                            <span className="font-medium leading-snug">
                              {p.name}
                            </span>
                          </div>
                          <span className="shrink-0 font-mono text-xs text-faint">
                            {p.year}
                          </span>
                        </div>
                        <p className="mt-2.5 text-sm leading-relaxed text-muted">
                          {p.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-3 border-t border-line/80 pt-2">
                        <span className="min-w-0 truncate font-mono text-[11px] text-faint">
                          {p.tech.join(" · ")}
                        </span>
                        <span className="flex shrink-0 gap-3 font-mono text-xs">
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
                  </TiltCard>
                </FadeIn>
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
