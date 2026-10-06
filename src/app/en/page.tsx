import { PageTransition } from "@/components/page-transition";
import { HomeView } from "@/views/home";
import { getAllPosts, getAllTags } from "@/lib/posts";
import { getAllProjects, getFeaturedProjects } from "@/lib/projects";
import { toolCount } from "@/lib/tools";

export default function HomeEn() {
  return (
    <PageTransition>
      <HomeView
        lang="en"
        posts={getAllPosts("en")}
        projects={getFeaturedProjects(2)}
        projectCount={getAllProjects().length}
        tagCount={getAllTags("en").length}
        toolCount={toolCount("en")}
      />
    </PageTransition>
  );
}
