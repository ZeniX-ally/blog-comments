import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getProjectBySlug,
  getProjectStaticParams,
  getAllProjects,
} from "@/lib/projects";
import { decodeSlug, slugToHref } from "@/lib/posts";
import { FadeIn } from "@/components/fade-in";
import { ProseTilt } from "@/components/prose-tilt";
import { BookTransition } from "@/components/book-transition";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getProjectStaticParams();
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};
  return {
    title: project.name,
    description: project.description,
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug: rawSlug } = await params;
  const slug = decodeSlug(rawSlug);
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const others = getAllProjects()
    .filter((p) => p.slug !== project.slug)
    .slice(0, 2);

  return (
    <BookTransition>
      <article className="content-shell pb-32 pt-20 sm:pt-24">
        {/* 1. back */}
        <FadeIn>
          <Link
            href="/projects"
            className="inline-flex text-sm text-muted transition-colors hover:text-accent"
          >
            ← 返回作品
          </Link>
        </FadeIn>

        {/* 2. title: name / year / one-liner */}
        <FadeIn delay={40}>
          <header className="project-detail-block max-w-3xl">
            <div className="page-head-label mb-5">作品</div>
            <h1 className="page-title text-balance">{project.name}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-meta text-faint">
              <span>{project.year}</span>
            </div>
            <p className="mt-4 max-w-2xl text-body text-muted">{project.description}</p>
          </header>
        </FadeIn>

        {/* 3. CTA pills */}
        {(project.link || project.repo) && (
          <FadeIn delay={60}>
            <div className="mt-8 flex flex-wrap gap-3">
              {project.link && (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-pill btn-primary"
                >
                  访问站点 ↗
                </a>
              )}
              {project.repo && (
                <a
                  href={project.repo}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-pill btn-ghost"
                >
                  查看源码 ↗
                </a>
              )}
            </div>
          </FadeIn>
        )}

        {/* 4. optional cover */}
        {project.cover && (
          <FadeIn delay={80}>
            <div className="project-detail-block overflow-hidden rounded-2xl border border-line">
              <div className="featured-card-media rounded-none border-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={project.cover} alt={`${project.name} 封面`} />
              </div>
            </div>
          </FadeIn>
        )}

        {/* 5–8. narrative body: 背景 → 我做了什么 → 技术栈 → 结果/现状 */}
        <FadeIn delay={100}>
          <ProseTilt>
            <div
              className="prose project-detail-block"
              dangerouslySetInnerHTML={{ __html: project.html }}
            />
          </ProseTilt>
        </FadeIn>

        {/* 9. 相关作品 1–2 */}
        {others.length > 0 && (
          <section className="project-detail-block border-t border-line pt-10">
            <h2 className="mb-6 section-title text-[1.375rem]">相关作品</h2>
            <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
              {others.map((p) => (
                <Link
                  key={p.slug}
                  href={`/projects/${slugToHref(p.slug)}`}
                  className="light-card group block p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="project-name text-[1.25rem] transition-colors group-hover:text-accent">
                      {p.name}
                    </span>
                    <span className="text-meta text-faint">{p.year}</span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-muted">
                    {p.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </BookTransition>
  );
}
