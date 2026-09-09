#!/usr/bin/env node
/**
 * 生成 RSS 2.0 feed 到 out/feed.xml
 * 在 next build 之后运行，写入 out/ 目录。
 *
 * 由于静态导出(output: export)，feed.xml 是唯一分发路径；
 * App Router 的 route handler 在 export 下不可靠/会双写，已移除。
 *
 * 站点 name/description/url 来自 src/lib/site-core.json（与 site.ts 共用）。
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, "content", "posts");
const OUT_DIR = path.join(ROOT, "out");
const SITE_CORE = path.join(ROOT, "src", "lib", "site-core.json");

const site = JSON.parse(fs.readFileSync(SITE_CORE, "utf8"));
const SITE_URL = String(site.url).replace(/\/$/, "");
const SITE_NAME = String(site.name);
const SITE_DESC = String(site.description);

/**
 * frontmatter 的 date 会被 YAML 解析成 Date 对象(UTC 零点)。
 * 成功则返回 YYYY-MM-DD；无法解析则返回 null（调用方跳过并 warn）。
 */
function toISODate(value) {
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

const posts = [];
for (const file of fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"))) {
  const { data, content } = matter(fs.readFileSync(path.join(POSTS_DIR, file), "utf8"));
  if (data.draft === true) continue;

  const slug = file.replace(/\.md$/, "");
  const date = toISODate(data.date);
  if (!date) {
    console.warn(`[feed] skip ${slug}: missing or invalid date (${JSON.stringify(data.date)})`);
    continue;
  }

  posts.push({
    ...data,
    slug,
    content,
    date,
  });
}

// newest-first
posts.sort((a, b) => String(b.date).localeCompare(String(a.date)));

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
    <title>${xmlEscape(SITE_NAME)}</title>
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
console.log(`✓ feed.xml 生成: ${posts.length} 篇文章 (newest-first, site=${SITE_NAME})`);
