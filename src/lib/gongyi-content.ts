import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { renderMarkdown } from "@/lib/posts";
import { splitMarkdownSections } from "./markdown-sections";
import type { Lang } from "@/lib/i18n";

export type GongyiContent = {
  title: string;
  subtitle: string;
  description: string;
  /** 按二级标题切分后的 HTML，key 为标题原文 */
  sectionsHtml: Record<string, string>;
};

/** 中文在 content/gongyi.md，英文在 content/en/gongyi.md（与 about 的目录约定一致） */
const contentPaths: Record<Lang, string> = {
  zh: path.join(process.cwd(), "content", "gongyi.md"),
  en: path.join(process.cwd(), "content", "en", "gongyi.md"),
};

/** 从 content/gongyi.md 加载公益页文案（gray-matter + 按 ## 分节渲染） */
export async function getGongyiContent(lang: Lang = "zh"): Promise<GongyiContent> {
  const file = contentPaths[lang];
  const raw = fs.existsSync(file)
    ? fs.readFileSync(file, "utf8")
    : ["---", "title: Gongyi", "---", ""].join("\n");

  const { data, content } = matter(raw);
  const sectionsHtml: Record<string, string> = {};
  for (const [heading, body] of splitMarkdownSections(content)) {
    sectionsHtml[heading] = body ? await renderMarkdown(body) : "";
  }

  return {
    title: data.title ? String(data.title) : "Gongyi",
    subtitle: data.subtitle ? String(data.subtitle) : "",
    description: data.description ? String(data.description) : "",
    sectionsHtml,
  };
}
