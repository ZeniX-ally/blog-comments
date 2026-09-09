#!/usr/bin/env node
/**
 * 生成 RSS 2.0 feed → out/feed.xml
 * 在 next build 之后运行（依赖 out/ 目录）。
 *
 * 这是静态导出(output: export)下 feed.xml 的唯一生成路径。
 * App Router 的 route handler 在 export 下不可靠/会双写，已移除。
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, "content", "posts");
const OUT_DIR = path.join(ROOT, "out");
const SITE_URL = "https://404-found.uk";
const SITE_NAME = "阿九";
const SITE_DESC = "测试工程师，记录生活与学习中的所思所想。";

/**
 * frontmatter 的 date 会被 YAML 解析成 Date 对象(UTC 零点)，
 * 统一归一化为 YYYY-MM-DD。切勿对 Date 直接 String().slice(0,10)。
 */
function toISODate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const y = value.getUTCFullYear();
    const m = String(value.getUTCMonth() + 1).padStart(2, "0");
    const d = String(value.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  const s = value ? String(value) : "1970-01-01";
  // 已是 ISO 或可 slice 的字符串
  const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : "1970-01-01";
}

function toRFC2822(isoDate) {
  const d = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) {
    throw new Error(`Invalid feed date: ${isoDate}`);
  }
  return d.toUTCString();
}

function xmlEscape(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

const posts = fs
  .readdirSync(POSTS_DIR)
  .filter((f) => f.endsWith(".md"))
  .map((file) => {
    const { data, content } = matter(fs.readFileSync(path.join(POSTS_DIR, file), "utf8"));
    return {
      ...data,
      slug: file.replace(/\.md$/, ""),
      content,
      date: toISODate(data.date),
    };
  })
  .filter((p) => p.draft !== true)
  .sort((a, b) => String(a.date).localeCompare(String(b.date)));

const items = posts
  .map((p) => {
    const url = `${SITE_URL}/blog/${encodeURIComponent(p.slug)}`;
    const excerpt =
      p.excerpt ||
      p.content.replace(/[#>*`\-[\]()!]/g, "").replace(/\s+/g, "").slice(0, 200);
    const cats = (Array.isArray(p.tags) ? p.tags : [])
      .map((t) => `    <category>${xmlEscape(t)}</category>`)
      .join("\n");
    return `  <item>
    <title>${xmlEscape(p.title ?? p.slug)}</title>
    <link>${url}</link>
    <guid isPermaLink="true">${url}</guid>
    <pubDate>${toRFC2822(p.date)}</pubDate>
    <description>${xmlEscape(excerpt)}</description>
${cats}  </item>`;
  })
  .join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xmlEscape(SITE_NAME)} · 个人站</title>
    <link>${SITE_URL}</link>
    <description>${xmlEscape(SITE_DESC)}</description>
    <language>zh-CN</language>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, "feed.xml"), xml);
console.log(`✅ feed.xml 生成: ${posts.length} 篇文章`);
