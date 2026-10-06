import type { Metadata } from "next";
import { getAllPosts } from "@/lib/posts";
import { PageTransition } from "@/components/page-transition";
import { PostListView } from "@/views/post-list";

export const metadata: Metadata = {
  title: "Posts",
  description: "All posts.",
};

export default function BlogPageEn() {
  return (
    <PageTransition>
      <PostListView lang="en" posts={getAllPosts("en")} />
    </PageTransition>
  );
}
