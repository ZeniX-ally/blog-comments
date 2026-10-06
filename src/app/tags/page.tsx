import type { Metadata } from "next";
import { getAllTags } from "@/lib/posts";
import { pageMeta } from "@/lib/seo";
import { PageTransition } from "@/components/page-transition";
import { TagsView } from "@/views/tags";

export const metadata: Metadata = pageMeta({
  title: "标签",
  description: "按标签浏览全部文章。",
  path: "/tags",
});

/** 标签总览页:列出所有标签及文章数 */
export default function TagsPage() {
  return (
    <PageTransition>
      <TagsView lang="zh" tags={getAllTags()} />
    </PageTransition>
  );
}
