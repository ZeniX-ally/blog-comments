import type { Metadata } from "next";
import { TOOL_SECTIONS } from "@/lib/tools";
import { PageTransition } from "@/components/page-transition";
import { ToolsView } from "@/views/tools";

export const metadata: Metadata = {
  title: "Tools",
  description: "Self-hosted services and everyday tools.",
};

export default function ToolsPageEn() {
  return (
    <PageTransition>
      <ToolsView lang="en" sections={TOOL_SECTIONS.en} />
    </PageTransition>
  );
}
