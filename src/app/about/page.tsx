import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { renderMarkdown } from "@/lib/posts";

export const metadata: Metadata = {
  title: "关于",
  description: "关于我和这个网站。",
};

/** 关于页内容来自 content/about.md,和写文章是同一套流程 */
export default async function AboutPage() {
  const file = path.join(process.cwd(), "content", "about.md");
  const markdown = fs.existsSync(file)
    ? fs.readFileSync(file, "utf8")
    : "# 关于\n\n还没有内容，去创建 `content/about.md` 吧。";
  const html = await renderMarkdown(markdown);

  return (
    <article className="mx-auto w-full max-w-3xl py-12 sm:py-16">
      <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}
