import type { Metadata } from "next";
import { getAllProjects } from "@/lib/projects";
import { PageTransition } from "@/components/page-transition";
import { ProjectsView } from "@/views/projects";

export const metadata: Metadata = {
  title: "Projects",
  description: "Things I've built.",
};

export default function ProjectsPageEn() {
  return (
    <PageTransition>
      <ProjectsView lang="en" projects={getAllProjects()} />
    </PageTransition>
  );
}
