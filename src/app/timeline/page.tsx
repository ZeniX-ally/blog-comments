import type { Metadata } from "next";
import { MdPage } from "@/components/md-page";

export const metadata: Metadata = {
  title: "时间线",
  description: "折腾与成长的记录。",
};

export default async function TimelinePage() {
  return <MdPage file="timeline.md" title="时间线" description="折腾与成长的记录。" />;
}
