import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";

const postsDir = path.join(process.cwd(), "content", "posts");

export type PostMeta = {
  slug: string;
  title: string;
  /** ISO 日期字符串，如 2026-07-27 */
  date: string;
  excerpt: string;
  tags: string[];
  /** 估算阅读时长(分钟)，按中文约 400 字/分钟 */
  readingTime: number;
};

export type Post = PostMeta & {
  html: string;
};

/** 读取全部文章元信息，按日期倒序(draft: true 的文章会被忽略) */
export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(postsDir)) return [];

  return fs
    .readdirSync(postsDir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => parsePost(file))
    .filter((post): post is PostMeta => post !== null)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

/** 读取单篇文章并渲染 Markdown 为 HTML */
export async function getPost(slug: string): Promise<Post | null> {
  const decoded = decodeSlug(slug);
  const file = path.join(postsDir, `${decoded}.md`);
  if (!fs.existsSync(file)) return null;

  const meta = parsePost(`${decoded}.md`);
  if (!meta) return null;

  const raw = fs.readFileSync(file, "utf8");
  const { content } = matter(raw);
  const html = await renderMarkdown(content);

  return { ...meta, html };
}

/** 渲染 Markdown 文本(文章、关于页共用) */
export async function renderMarkdown(markdown: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeHighlight)
    .use(rehypeStringify)
    .process(markdown);
  return result.toString();
}

function parsePost(filename: string): PostMeta | null {
  const raw = fs.readFileSync(path.join(postsDir, filename), "utf8");
  const { data, content } = matter(raw);

  if (data.draft === true) return null;

  const slug = filename.replace(/\.md$/, "");
  const plainText = content.replace(/[#>*`\-[\]()!]/g, "").replace(/\s+/g, "");

  return {
    slug,
    title: data.title ?? slug,
    date: toISODate(data.date),
    excerpt: data.excerpt ?? "",
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    readingTime: Math.max(1, Math.round(plainText.length / 400)),
  };
}

/** 把 ISO 日期格式化为 2026.07.27 这样的展示形式 */
export function formatDate(iso: string): string {
  return iso.replaceAll("-", ".");
}

/**
 * 路由参数解码。
 * Next.js 的动态路由 params 保持 URL 原始(编码)形式，中文 slug/标签会拿到
 * `%E6%B5%8B...`，直接拼文件名会找不到文件 → 404 白屏。这里统一安全解码。
 * 解码失败(非法百分号序列)时原样返回，避免抛异常导致 500。
 */
export function decodeSlug(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

/** 生成文章/标签链接用的 URL 片段(中文与空格需编码) */
export function slugToHref(value: string): string {
  return encodeURIComponent(value);
}

/** 获取全部标签及各自的文章数，按文章数倒序、标签名正序排列 */
export function getAllTags(): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const post of getAllPosts()) {
    for (const tag of post.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, "zh"));
}

/** 按标签筛选文章(返回结果已按日期倒序) */
export function getPostsByTag(tag: string): PostMeta[] {
  const decoded = decodeSlug(tag);
  return getAllPosts().filter((post) => post.tags.includes(decoded));
}

/**
 * 取某篇文章的相邻文章，用于文末「上一篇 / 下一篇」导航。
 * getAllPosts 已按日期倒序(新在前)，所以 index+1 是更早的(上一篇)，
 * index-1 是更新的(下一篇)。
 */
export function getAdjacentPosts(slug: string): {
  prev: PostMeta | null;
  next: PostMeta | null;
} {
  const decoded = decodeSlug(slug);
  const posts = getAllPosts();
  const i = posts.findIndex((p) => p.slug === decoded);
  if (i === -1) return { prev: null, next: null };
  return {
    prev: posts[i + 1] ?? null,
    next: posts[i - 1] ?? null,
  };
}

/**
 * frontmatter 里的 date 会被 YAML 解析成 Date 对象(UTC 零点),
 * 这里统一归一化为 YYYY-MM-DD 字符串。
 */
function toISODate(value: unknown): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const y = value.getUTCFullYear();
    const m = String(value.getUTCMonth() + 1).padStart(2, "0");
    const d = String(value.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  return value ? String(value) : "1970-01-01";
}
