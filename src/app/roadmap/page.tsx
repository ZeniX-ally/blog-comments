import type { Metadata } from "next";
import { MdPage } from "@/components/md-page";

export const metadata: Metadata = {
  title: "学习路线",
  description: "测试研发方向的学习路线与进度。",
};

export default async function RoadmapPage() {
  return <MdPage file="roadmap.md" title="学习路线" description="测试研发方向的学习路线与进度。" />;
}
