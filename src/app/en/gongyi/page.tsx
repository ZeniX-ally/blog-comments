import type { Metadata } from "next";
import { getGongyiContent } from "@/lib/gongyi-content";
import { PageTransition } from "@/components/page-transition";
import { GongyiView } from "@/views/gongyi";

export const metadata: Metadata = {
  title: "Free API",
  description: "Invite-only free AI API: how it works and how to request an invite.",
};

export default async function GongyiPageEn() {
  const content = await getGongyiContent("en");
  return (
    <PageTransition>
      <GongyiView lang="en" content={content} />
    </PageTransition>
  );
}
