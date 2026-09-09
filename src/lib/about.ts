import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { renderMarkdown } from "@/lib/posts";

export type AboutNowItem = {
  title: string;
  desc: string;
  /** CSS dot class，如 dot-running */
  dot: string;
};

export type AboutContent = {
  title: string;
  subtitle: string;
  description: string;
  now: AboutNowItem[];
  /** 按二级标题切分后的 HTML，key 为标题原文 */
  sectionsHtml: Record<string, string>;
};

const aboutPath = path.join(process.cwd(), "content", "about.md");

const DEFAULT_DOTS = ["dot-running", "dot-local", "dot-daily"] as const;
const ALLOWED_DOTS = new Set(["dot-running", "dot-local", "dot-lab", "dot-daily"]);

function splitMarkdownSections(markdown: string): Map<string, string> {
  const map = new Map<string, string>();
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  let current: string | null = null;
  const buf: string[] = [];

  const flush = () => {
    if (current) map.set(current, buf.join("\n").trim());
  };

  for (const line of lines) {
    const m = line.match(/^##\s+(.+?)\s*$/);
    if (m) {
      flush();
      current = m[1].trim();
      buf.length = 0;
    } else if (current) {
      buf.push(line);
    }
  }
  flush();
  return map;
}

function parseNow(value: unknown): AboutNowItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item, i) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const title = row.title != null ? String(row.title).trim() : "";
      const desc = row.desc != null ? String(row.desc).trim() : "";
      if (!title || !desc) return null;
      const rawDot =
        row.dot != null && String(row.dot).trim()
          ? String(row.dot).trim()
          : "";
      const dot = ALLOWED_DOTS.has(rawDot)
        ? rawDot
        : DEFAULT_DOTS[i] ?? "dot-daily";
      return { title, desc, dot };
    })
    .filter((x): x is AboutNowItem => x !== null);
}

/** 从 content/about.md 加载关于页文案（gray-matter + 按 ## 分节） */
export async function getAboutContent(): Promise<AboutContent> {
  const raw = fs.existsSync(aboutPath)
    ? fs.readFileSync(aboutPath, "utf8")
    : [
        "---",
        "title: 关于",
        "subtitle: 测试研发 · 做能上线的东西",
        "description: 关于我和这个网站。",
        "---",
        "",
      ].join("\n");

  const { data, content } = matter(raw);
  const sections = splitMarkdownSections(content);
  const sectionsHtml: Record<string, string> = {};

  for (const [heading, body] of sections) {
    sectionsHtml[heading] = body ? await renderMarkdown(body) : "";
  }

  return {
    title: data.title ? String(data.title) : "关于",
    subtitle: data.subtitle
      ? String(data.subtitle)
      : "测试研发 · 做能上线的东西",
    description: data.description
      ? String(data.description)
      : "关于我和这个网站。",
    now: parseNow(data.now),
    sectionsHtml,
  };
}