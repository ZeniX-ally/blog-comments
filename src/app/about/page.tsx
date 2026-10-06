import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { site } from "@/lib/site";
import { getAboutContent } from "@/lib/about";
import { getFeaturedProjects } from "@/lib/projects";
import { PageTransition } from "@/components/page-transition";
import { AboutView } from "@/views/about";

export async function generateMetadata(): Promise<Metadata> {
  const about = await getAboutContent();
  return pageMeta({
    title: about.title,
    description: about.description,
    path: "/about",
  });
}

export default async function AboutPage() {
  const about = await getAboutContent();
  const github = site.links.github;

  return (
    <PageTransition>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: site.name,
          url: site.url,
          sameAs: github ? [github] : [],
          jobTitle: "Test Engineer",
        }}
      />
      <AboutView lang="zh" about={about} featured={getFeaturedProjects()} />
    </PageTransition>
  );
}
