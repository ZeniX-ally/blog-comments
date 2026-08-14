import type { Metadata } from "next";
import { projects } from "@/lib/projects";
import { FadeIn } from "@/components/fade-in";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
  title: "Projects",
  description: "Things I've built.",
};

export default function ProjectsPageEn() {
  return (
    <article className="mx-auto w-full max-w-6xl pb-32 pt-20 sm:pt-24">
      <PageHeader
        label="[0x00] PROJECTS"
        title="Projects"
        sub="Things I&apos;ve built, mostly born from my own real needs."
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
                  <div className="flex items-center gap-2.5">
                    <span className="led led-local" aria-hidden="true" />
                    <span className="font-medium">{p.name}</span>
                  </div>
                  <span className="shrink-0 font-mono text-xs text-faint">
                    {p.year}
                  </span>
                </div>
                <p className="mt-2.5 text-sm leading-relaxed text-muted">
                  {p.description_en ?? p.description}
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
    </article>
  );
}
