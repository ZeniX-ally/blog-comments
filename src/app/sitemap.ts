export const dynamic = "force-static";
import type { MetadataRoute } from "next";
import { getAllPosts, getAllTags, slugToHref } from "@/lib/posts";
import { getAllProjects } from "@/lib/projects";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts().map((post) => ({
    url: `${site.url}/blog/${slugToHref(post.slug)}`,
    lastModified: post.date,
  }));

  const projects = getAllProjects().map((p) => ({
    url: `${site.url}/projects/${slugToHref(p.slug)}`,
    // 项目 frontmatter 只有 year，用当年元旦作为合理 lastModified
    lastModified: `${p.year}-01-01`,
  }));

  const tags = getAllTags().map(({ tag }) => ({
    url: `${site.url}/tags/${slugToHref(tag)}`,
  }));

  return [
    { url: site.url },
    { url: `${site.url}/blog` },
    { url: `${site.url}/projects` },
    { url: `${site.url}/about` },
    { url: `${site.url}/tools` },
    { url: `${site.url}/tags` },
    ...posts,
    ...projects,
    ...tags,
  ];
}
