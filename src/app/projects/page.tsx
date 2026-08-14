import type { Metadata } from "next";
import { projects } from "@/lib/projects";
import { FadeIn } from "@/components/fade-in";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "作品",
  description: "做过的一些项目。",
};

export default function ProjectsPage() {
  return (
    <article className="mx-auto w-full max-w-3xl pb-24 pt-16 sm:pt-20">
      <PageHeader
        label="[0x00] PROJECTS"
        title="作品"
        sub="做过的项目，大都源于自己的真实需求。"
      />
      {/* 原左栏的终端行与统计并入这里 */}
      <FadeIn>
        <div className="mb-14 flex flex-wrap items-baseline gap-x-6 gap-y-2 font-mono text-xs">
          <span className="text-accent">zenix@0xff:~/projects$ ls</span>
          <span className="cursor-blink text-accent">▍</span>
          <span className="text-faint">{projects.length} projects</span>
        </div>
      </FadeIn>
      {projects.length === 0 ? (
        <div className="border-t border-line py-20 text-center">
          <p className="text-muted">还没有作品，之后有了会放在这里。</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {projects.map((p, i) => (
            <FadeIn key={p.name} delay={i * 60}>
              <div className="light-card group p-5">
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
    </article>
  );
}
