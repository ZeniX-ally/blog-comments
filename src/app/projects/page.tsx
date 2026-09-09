import type { Metadata } from "next";
import Link from "next/link";
import { getAllProjects } from "@/lib/projects";
import { slugToHref } from "@/lib/posts";
import { FadeIn } from "@/components/fade-in";
import { BookTransition } from "@/components/book-transition";

export const metadata: Metadata = {
  title: "作品",
  description: "做过的一些项目。",
};

export default function ProjectsPage() {
  const projects = getAllProjects();

  return (
    <BookTransition>
      <article className="mx-auto w-full max-w-6xl pb-32 pt-20 sm:pt-24">
      <div className="grid gap-14 lg:grid-cols-[300px_1fr] lg:gap-20">
        {/* 左栏:sticky 介绍牌 */}
        <FadeIn>
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="page-head-label mb-6">作品</div>
            <h1 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
              作品
            </h1>
            <p className="mt-4 text-[15px] leading-relaxed text-muted">
              做过的项目，大都源于自己的真实需求。
            </p>
            <div className="mt-8 text-xs text-faint">
              {projects.length} 个项目
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
                <FadeIn key={p.slug} delay={i * 60}>
                  <Link
                    href={`/projects/${slugToHref(p.slug)}`}
                    className="light-card group block h-full p-6"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium transition-colors group-hover:text-accent">
                          {p.name}
                        </div>
                        <span className="mt-0.5 block text-xs text-faint">
                          {p.year}
                        </span>
                      </div>
                    </div>
                    <p className="mt-2.5 text-sm leading-relaxed text-muted">
                      {p.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3">
                      <span className="min-w-0 truncate text-[11px] text-faint">
                        {p.tech.join(" · ")}
                      </span>
                      <span className="shrink-0 text-xs text-accent opacity-0 transition-opacity group-hover:opacity-100">
                        详情 →
                      </span>
                    </div>
                  </Link>
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
