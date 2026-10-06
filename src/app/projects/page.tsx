import type { Metadata } from "next";
import { getAllProjects } from "@/lib/projects";
import { pageMeta } from "@/lib/seo";
import { PageTransition } from "@/components/page-transition";
import { ProjectsView } from "@/views/projects";

export const metadata: Metadata = pageMeta({
  title: "作品",
  description: "做过的一些项目。",
  path: "/projects",
});

export default function ProjectsPage() {
  return (
    <PageTransition>
      <ProjectsView lang="zh" projects={getAllProjects()} />
    </PageTransition>
  );
}
