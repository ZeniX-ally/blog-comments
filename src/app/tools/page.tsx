import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { TOOL_SECTIONS } from "@/lib/tools";
import { PageTransition } from "@/components/page-transition";
import { ToolsView } from "@/views/tools";

export const metadata: Metadata = pageMeta({
  title: "工具清单",
  description: "自建服务与常用工具清单。",
  path: "/tools",
});

export default function ToolsPage() {
  return (
    <PageTransition>
      <ToolsView lang="zh" sections={TOOL_SECTIONS.zh} />
    </PageTransition>
  );
}
