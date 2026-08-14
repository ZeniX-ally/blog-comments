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
  // 防路径遍历（LFI）：先 resolve 再校验目标必须位于 content 目录内
  const contentRoot = path.resolve(process.cwd(), "content");
  const full = path.resolve(contentRoot, file);
  if (!full.startsWith(contentRoot + path.sep)) {
    return null;
  }
  const markdown = fs.existsSync(full)
    ? fs.readFileSync(full, "utf8")
    : `# ${title}\n\n还没有内容，去创建 \`content/${file}\` 吧。`;
  const html = await renderMarkdown(markdown);

  return (
    <article className="mx-auto w-full max-w-3xl pb-24 pt-14 sm:pt-20">
      <FadeIn>
        <header className="mb-12">
          <div className="page-head-label mb-6">0xFF / MD</div>
          <h1 className="page-title">{title}</h1>
          {description && <p className="page-sub mt-5">{description}</p>}
        </header>
        <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
      </FadeIn>
    </article>
  );
}
