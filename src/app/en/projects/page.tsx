import type { Metadata } from "next";
import { projects } from "@/lib/projects";
import { FadeIn } from "@/components/fade-in";
import { TiltCard } from "@/components/tilt-card";

export const metadata: Metadata = {
  title: "Projects",
  description: "Things I've built.",
};

export default function ProjectsPageEn() {
  return (
    <article className="mx-auto w-full max-w-3xl py-12 sm:py-16">
      <FadeIn>
        <div className="mb-10 font-mono text-sm">
          <span className="text-accent">zenix@0xff</span>
          <span className="text-faint">:~$</span>{" "}
          <span className="text-fg">ls ~/projects</span>
          <span className="cursor-blink ml-0.5 text-accent">▍</span>
        </div>
      </FadeIn>

      {projects.length === 0 ? (
        <div className="border-t border-line py-20 text-center">
          <p className="text-muted">Nothing here yet — projects will land here eventually.</p>
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
                      {p.description_en ?? p.description}
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
                          Visit ↗
                        </a>
                      )}
                      {p.repo && (
                        <a
                          href={p.repo}
                          target="_blank"
                          rel="noreferrer"
                          className="text-accent transition-colors hover:underline"
                        >
                          Repo
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
    </article>
  );
}
