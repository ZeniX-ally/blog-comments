import type { Metadata } from "next";
import { getAboutContent } from "@/lib/about";
import { getFeaturedProjects } from "@/lib/projects";
import { PageTransition } from "@/components/page-transition";
import { AboutView } from "@/views/about";

export const metadata: Metadata = {
  title: "About",
  description: "About me and this site.",
};

export default async function AboutPageEn() {
  const about = await getAboutContent("en");

  return (
    <PageTransition>
      <AboutView lang="en" about={about} featured={getFeaturedProjects()} />
    </PageTransition>
  );
}
