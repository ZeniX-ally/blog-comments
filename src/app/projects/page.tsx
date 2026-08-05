import type { Metadata } from "next";
import { projects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "作品",
  description: "做过的一些项目。",
};

export default function ProjectsPage() {
  return (
    <>
      <header className="py-12 sm:py-16">
        <h1 className="font-display text-3xl font-normal tracking-tight sm:text-4xl">作品</h1>
        <p className="mt-3 text-muted">做过的项目，大都源于自己的真实需求。</p>
      </header>

      {projects.length === 0 ? (
        <div className="border-t border-line py-20 text-center">
          <p className="text-muted">还没有作品，之后有了会放在这里。</p>
        </div>
      ) : (
        <ul className="border-t border-line pb-20">
          {projects.map((project) => (
          <li key={project.name} className="border-b border-line py-7">
            <div className="flex items-baseline justify-between gap-6">
              <h2 className="text-xl font-normal">{project.name}</h2>
              <span className="shrink-0 font-mono text-xs text-faint">{project.year}</span>
            </div>

            <p className="mt-2 leading-relaxed text-muted">{project.description}</p>

            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              <span className="font-mono text-xs text-faint">{project.tech.join(" · ")}</span>
              <span className="flex gap-4">
                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent underline decoration-faint underline-offset-4 transition-colors hover:decoration-accent"
                  >
                    访问 ↗
                  </a>
                )}
                {project.repo && (
                  <a
                    href={project.repo}
                    target="_blank"
                    rel="noreferrer"
                    className="text-muted underline decoration-faint underline-offset-4 transition-colors hover:text-foreground"
                  >
                    源码 ↗
                  </a>
                )}
              </span>
            </div>
          </li>
          ))}
        </ul>
      )}
    </>
  );
}
