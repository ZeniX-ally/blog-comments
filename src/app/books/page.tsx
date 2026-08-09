import type { Metadata } from "next";
import { MdPage } from "@/components/md-page";

export const metadata: Metadata = {
  title: "书单",
  description: "读过与在读的书和资源。",
};

export default async function BooksPage() {
  return <MdPage file="books.md" title="书单" description="读过与在读的书和资源。" />;
}
