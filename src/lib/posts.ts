import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeHighlight from "rehype-highlight";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";

const contentRoot = path.join(process.cwd(), "content");

/** 站点语言:中文在 content/posts,英文在 content/en/posts */
export type Lang = "zh" | "en";

/** 语言对应的文章目录 */
export function postsDirFor(lang: Lang = "zh"): string {
  return lang === "en"
    ? path.join(contentRoot, "en", "posts")
    : path.join(contentRoot, "posts");
}

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
export function getAllPosts(lang: Lang = "zh"): PostMeta[] {
  const dir = postsDirFor(lang);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => parsePost(file, lang))
    .filter((post): post is PostMeta => post !== null)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

/** 读取单篇文章并渲染 Markdown 为 HTML */
export async function getPost(slug: string, lang: Lang = "zh"): Promise<Post | null> {
  const decoded = decodeSlug(slug);
  if (!isSafeSlug(decoded, lang)) return null;
  const file = path.join(postsDirFor(lang), `${decoded}.md`);
  if (!fs.existsSync(file)) return null;

  const meta = parsePost(`${decoded}.md`, lang);
  if (!meta) return null;

  const raw = fs.readFileSync(file, "utf8");
  const { content } = matter(raw);
  const html = await renderMarkdown(content);

  return { ...meta, html };
}

/**
 * 防路径遍历（LFI）：slug 解码后不得含路径分隔符或相对跳转段，
 * 且解析后的路径必须仍在 posts 目录内。
 * 2026-08-08 安全审计修复：此前 /blog/..%2Fabout 可读到 posts 目录外任意 .md 文件。
 * 导出供发布 API 复用（写入侧同样受此约束）。
 */
export function isSafeSlug(decoded: string, lang: Lang = "zh"): boolean {
  if (decoded.length === 0) return false;
  if (decoded.includes("/") || decoded.includes("\\")) return false;
  if (decoded === "." || decoded === "..") return false;
  if (decoded.startsWith(".")) return false; // 隐藏文件/点开头一律拒绝
  const dir = postsDirFor(lang);
  const file = path.resolve(dir, `${decoded}.md`);
  const base = path.resolve(dir) + path.sep;
  return file.startsWith(base);
}

/** 渲染 Markdown 文本(文章、关于页共用) */
export async function renderMarkdown(markdown: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeHighlight)
    // 2026-08-08 安全审计修复：默认 schema 阻止 javascript: 等危险 URI 与 on* 事件属性
    .use(rehypeSanitize)
    .use(rehypeStringify)
    .process(markdown);
  return result.toString();
}

function parsePost(filename: string, lang: Lang = "zh"): PostMeta | null {
  const raw = fs.readFileSync(path.join(postsDirFor(lang), filename), "utf8");
  const { data, content } = matter(raw);

  if (data.draft === true) return null;

  const slug = filename.replace(/\.md$/, "");
  const plainText = content.replace(/[#>*`\-[\]()!]/g, "").replace(/\s+/g, "");
  // 阅读时长:中文约 400 字/分钟,英文约 200 词/分钟
  const perMinute = lang === "en" ? 200 : 400;

  const date = toISODate(data.date);
  if (!date) {
    console.warn(`[posts] skip ${slug}: missing or invalid date (${JSON.stringify(data.date)})`);
    return null;
  }

  return {
    slug,
    title: data.title ?? slug,
    date,
    excerpt: data.excerpt ?? "",
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    readingTime: Math.max(1, Math.round(plainText.length / perMinute)),
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
export function getAllTags(lang: Lang = "zh"): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const post of getAllPosts(lang)) {
    for (const tag of post.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, "zh"));
}

/** 按标签筛选文章(返回结果已按日期倒序) */
export function getPostsByTag(tag: string, lang: Lang = "zh"): PostMeta[] {
  const decoded = decodeSlug(tag);
  return getAllPosts(lang).filter((post) => post.tags.includes(decoded));
}

/**
 * 取某篇文章的相邻文章，用于文末「上一篇 / 下一篇」导航。
 * getAllPosts 已按日期倒序(新在前)，所以 index+1 是更早的(上一篇)，
 * index-1 是更新的(下一篇)。
 */
export function getAdjacentPosts(slug: string, lang: Lang = "zh"): {
  prev: PostMeta | null;
  next: PostMeta | null;
} {
  const decoded = decodeSlug(slug);
  const posts = getAllPosts(lang);
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
function toISODate(value: unknown): string | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const y = value.getUTCFullYear();
    const m = String(value.getUTCMonth() + 1).padStart(2, "0");
    const d = String(value.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  if (value == null || value === "") return null;
  const s = String(value);
  const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : null;
}
