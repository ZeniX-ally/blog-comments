import type { Metadata } from "next";
import Link from "next/link";
import { getAllProjects } from "@/lib/projects";
import { pageMeta } from "@/lib/seo";
import { slugToHref } from "@/lib/posts";
import { FadeIn } from "@/components/fade-in";
import { BookTransition } from "@/components/book-transition";

export const metadata: Metadata = pageMeta({
  title: "作品",
  description: "做过的一些项目。",
  path: "/projects",
});

export default function ProjectsPage() {
  const projects = getAllProjects();

  return (
    <BookTransition>
      <article className="content-shell pb-32 pt-20 sm:pt-24">
        <FadeIn>
          <header className="mb-12 max-w-2xl sm:mb-16">
            <div className="page-head-label mb-6">作品</div>
            <h1 className="page-title">作品</h1>
            <p className="page-sub mt-5">
              做过的项目，大都源于自己的真实需求。
            </p>
            <div className="mt-6 text-meta text-faint">{projects.length} 个项目</div>
          </header>
        </FadeIn>

        {projects.length === 0 ? (
          <div className="border-t border-line py-20 text-center">
            <p className="text-muted">还没有作品，之后有了会放在这里。</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {projects.map((p, i) => (
              <FadeIn key={p.slug} delay={i * 50}>
                <Link
                  href={`/projects/${slugToHref(p.slug)}`}
                  className="light-card group block h-full p-5 sm:p-6"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="project-name text-[1.25rem] transition-colors group-hover:text-accent sm:text-[1.375rem]">
                      {p.name}
                    </h2>
                    <span className="shrink-0 text-meta text-faint">{p.year}</span>
                  </div>
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted sm:text-[0.9375rem]">
                    {p.description}
                  </p>
                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-3">
                    <span className="min-w-0 truncate text-meta text-faint">
                      {p.tech.join(" · ")}
                    </span>
                    <span className="shrink-0 text-meta text-accent opacity-0 transition-opacity group-hover:opacity-100">
                      详情 →
                    </span>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        )}
      </article>
    </BookTransition>
  );
}
