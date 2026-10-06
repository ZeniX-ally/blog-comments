import type { Metadata } from "next";
import { getAllTags } from "@/lib/posts";
import { PageTransition } from "@/components/page-transition";
import { TagsView } from "@/views/tags";

export const metadata: Metadata = {
  title: "Tags",
  description: "Browse all posts by tag.",
};

export default function TagsPageEn() {
  return (
    <PageTransition>
      <TagsView lang="en" tags={getAllTags("en")} />
    </PageTransition>
  );
}
