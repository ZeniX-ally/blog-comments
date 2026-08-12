#!/usr/bin/env node
/**
 * 生成 RSS 2.0 feed → out/feed.xml
 * 在 next build 之后运行（依赖 out/ 目录）。
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, "content", "posts");
const OUT_DIR = path.join(ROOT, "out");
const SITE_URL = "https://404-found.uk";
const SITE_NAME = "沧海";
const SITE_DESC = "测试工程师，记录生活与学习中的所思所想。";

function toRFC2822(isoDate) {
  const d = new Date(`${isoDate}T00:00:00Z`);
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
    return { ...data, slug: file.replace(/\.md$/, ""), content };
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
    const date = String(p.date || "1970-01-01").slice(0, 10);
    return `  <item>
    <title>${xmlEscape(p.title ?? p.slug)}</title>
    <link>${url}</link>
    <guid isPermaLink="true">${url}</guid>
    <pubDate>${toRFC2822(date)}</pubDate>
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
