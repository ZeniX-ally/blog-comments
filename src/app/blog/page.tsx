import type { Metadata } from "next";
import { getAllPosts } from "@/lib/posts";
import { pageMeta } from "@/lib/seo";
import { PageTransition } from "@/components/page-transition";
import { PostListView } from "@/views/post-list";

export const metadata: Metadata = pageMeta({
  title: "文章",
  description: "全部文章列表。",
  path: "/blog",
});

export default function BlogPage() {
  return (
    <PageTransition>
      <PostListView lang="zh" posts={getAllPosts()} />
    </PageTransition>
  );
}
