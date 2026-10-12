import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { getGongyiContent } from "@/lib/gongyi-content";
import { PageTransition } from "@/components/page-transition";
import { GongyiView } from "@/views/gongyi";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getGongyiContent("zh");
  return pageMeta({
    title: content.title,
    description: content.description,
    path: "/gongyi",
  });
}

export default async function GongyiPage() {
  const content = await getGongyiContent("zh");
  return (
    <PageTransition>
      <GongyiView lang="zh" content={content} />
    </PageTransition>
  );
}
