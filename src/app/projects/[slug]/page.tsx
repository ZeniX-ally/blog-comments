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

  const others = getAllProjects().filter((p) => p.slug !== project.slug).slice(0, 2);

  return (
    <BookTransition>
      <article className="mx-auto w-full max-w-6xl pb-32 pt-20 sm:pt-24">
        <FadeIn>
          <header className="border-b border-line pb-12">
            <div className="page-head-label mb-6">作品</div>
            <h1 className="page-title text-balance">{project.name}</h1>
            <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-muted">
              {project.description}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-faint">
              <span>{project.year}</span>
              {project.tech.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-[var(--surface-soft)] px-2.5 py-1 text-xs text-muted"
                >
                  {t}
                </span>
              ))}
            </div>
            {(project.link || project.repo) && (
              <div className="mt-8 flex flex-wrap gap-3">
                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-pill btn-primary btn-pill-sm text-xs"
                  >
                    访问站点 ↗
                  </a>
                )}
                {project.repo && (
                  <a
                    href={project.repo}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-pill btn-ghost btn-pill-sm text-xs"
                  >
                    查看源码 ↗
                  </a>
                )}
              </div>
            )}
          </header>
        </FadeIn>

        <FadeIn delay={100}>
          <ProseTilt>
            <div
              className="prose mt-14"
              dangerouslySetInnerHTML={{ __html: project.html }}
            />
          </ProseTilt>
        </FadeIn>

        {others.length > 0 && (
          <section className="mt-24 border-t border-line pt-10">
            <h2 className="mb-6 text-sm text-faint">其他作品</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {others.map((p) => (
                <Link
                  key={p.slug}
                  href={`/projects/${slugToHref(p.slug)}`}
                  className="light-card group block p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-medium transition-colors group-hover:text-accent">
                      {p.name}
                    </span>
                    <span className="text-xs text-faint">{p.year}</span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-muted">
                    {p.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <footer className="mt-16 border-t border-line pt-8">
          <Link
            href="/projects"
            className="text-sm text-muted transition-colors hover:text-accent"
          >
            ← 返回作品列表
          </Link>
        </footer>
      </article>
    </BookTransition>
  );
}
