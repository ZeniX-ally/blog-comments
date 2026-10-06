import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pageMeta, canonicalUrl } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { site } from "@/lib/site";
import {
  getProjectBySlug,
  getProjectStaticParams,
  getAllProjects,
} from "@/lib/projects";
import { decodeSlug, slugToHref } from "@/lib/posts";
import { PageTransition } from "@/components/page-transition";
import { ProjectView } from "@/views/project";

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
  const path = `/projects/${slugToHref(project.slug)}`;
  return pageMeta({
    title: project.name,
    description: project.description || site.description,
    path,
    images: project.cover ? [project.cover] : ["/og/default.png"],
  });
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
    <PageTransition>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: project.name,
          description: project.description || undefined,
          dateCreated: /^\d{4}$/.test(String(project.year))
            ? `${project.year}-01-01`
            : String(project.year),
          url: canonicalUrl(`/projects/${slugToHref(project.slug)}`),
          author: {
            "@type": "Person",
            name: site.name,
            url: site.url,
          },
          keywords: project.tech.join(", "),
          inLanguage: "zh-CN",
        }}
      />
      <ProjectView lang="zh" project={project} others={others} />
    </PageTransition>
  );
}
