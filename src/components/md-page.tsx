import fs from "node:fs";
import path from "node:path";
import { renderMarkdown } from "@/lib/posts";
import { FadeIn } from "@/components/fade-in";

/** 通用 Markdown 内容页:读 content/<file>.md 渲染,和 about 同一套流程 */
export async function MdPage({
  file,
  title,
  description,
}: {
  file: string;
  title: string;
  description: string;
}) {
  const full = path.join(process.cwd(), "content", file);
  const markdown = fs.existsSync(full)
    ? fs.readFileSync(full, "utf8")
    : `# ${title}\n\n还没有内容，去创建 \`content/${file}\` 吧。`;
  const html = await renderMarkdown(markdown);

  return (
    <article className="mx-auto w-full max-w-3xl py-12 sm:py-16">
      <FadeIn>
        <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
      </FadeIn>
    </article>
  );
}
