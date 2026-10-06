import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProjectBySlug, getProjectStaticParams, getAllProjects } from "@/lib/projects";
import { decodeSlug } from "@/lib/posts";
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
  return {
    title: project.name,
    description: project.description_en ?? project.description,
  };
}

/** 英文作品详情:作品正文只有一份(中文),英文版换导语、标签与壳 */
export default async function ProjectDetailPageEn({ params }: { params: Promise<Params> }) {
  const { slug: rawSlug } = await params;
  const slug = decodeSlug(rawSlug);
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const others = getAllProjects()
    .filter((p) => p.slug !== project.slug)
    .slice(0, 2);

  return (
    <PageTransition>
      <ProjectView lang="en" project={project} others={others} />
    </PageTransition>
  );
}
