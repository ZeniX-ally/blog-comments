import type { Metadata } from "next";
import { site } from "@/lib/site";
import { pageMeta } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { PageTransition } from "@/components/page-transition";
import { HomeView } from "@/views/home";
import { getAllPosts, getAllTags } from "@/lib/posts";
import { getAllProjects, getFeaturedProjects } from "@/lib/projects";
import { toolCount } from "@/lib/tools";

export const metadata: Metadata = pageMeta({
  title: { absolute: site.title },
  description: site.description,
  path: "/",
});

export default function Home() {
  return (
    <PageTransition>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: site.name,
            url: site.url,
            description: site.description,
            inLanguage: "zh-CN",
          },
          {
            "@context": "https://schema.org",
            "@type": "Person",
            name: site.name,
            url: site.url,
            sameAs: site.links.github ? [site.links.github] : [],
          },
        ]}
      />
      <HomeView
        lang="zh"
        posts={getAllPosts()}
        projects={getFeaturedProjects(2)}
        projectCount={getAllProjects().length}
        tagCount={getAllTags().length}
        toolCount={toolCount("zh")}
      />
    </PageTransition>
  );
}
