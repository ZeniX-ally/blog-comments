import type { Metadata } from "next";
import { MdPage } from "@/components/md-page";

export const metadata: Metadata = {
  title: "工具清单",
  description: "自建服务与常用工具清单。",
};

export default async function ToolsPage() {
  return <MdPage file="tools.md" title="工具清单" description="自建服务与常用工具清单。" />;
}
