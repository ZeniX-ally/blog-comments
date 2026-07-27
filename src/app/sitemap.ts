import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts().map((post) => ({
    url: `${site.url}/blog/${post.slug}`,
    lastModified: post.date,
  }));

  return [
    { url: site.url },
    { url: `${site.url}/blog` },
    { url: `${site.url}/projects` },
    { url: `${site.url}/about` },
    ...posts,
  ];
}
