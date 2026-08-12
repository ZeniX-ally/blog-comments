#!/usr/bin/env node
/**
 * 生成文章 OG 分享卡片 PNG → out/og/<slug>.png + out/og/default.png
 * 0xff 极客风格：深底 #191919 + 右上 0xFF 水印 + mono 信息行。
 * 在 next build 之后运行。
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import satori from "satori";
import { createElement as h } from "satori/jsx";
import { Resvg } from "@resvg/resvg-js";

const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, "content", "posts");
const OUT_OG_DIR = path.join(ROOT, "out", "og");
const SITE_URL = "https://404-found.uk";
const SITE_NAME = "沧海";

const FONT_DIR = path.join(ROOT, "scripts", "fonts");
const fonts = [
  {
    name: "Noto Sans SC",
    data: fs.readFileSync(path.join(FONT_DIR, "noto-sans-sc-bold.otf")),
    weight: 700,
  },
  {
    name: "Noto Sans SC",
    data: fs.readFileSync(path.join(FONT_DIR, "noto-sans-sc-regular.otf")),
    weight: 400,
  },
  {
    name: "Styrene A",
    data: fs.readFileSync(path.join(FONT_DIR, "styrene-a-regular.ttf")),
    weight: 400,
  },
];

const ACCENT = "#D4A27F"; // Tan 强调色（与站点一致）
const FG = "#F5F2EA";
const FAINT = "#8A857C";
const BG = "#191919";

const div = (props, ...children) => h("div", props, ...children);
const span = (props, ...children) => h("span", props, ...children);

/** 0xff 装饰行：确定性伪随机 0/1，像内存转储 */
function bits(row = 0) {
  const seed = 0xff + row * 7;
  let out = "";
  for (let i = 0; i < 40; i++) out += (seed * (i + 3) + i * 13) % 3 === 0 ? "1" : "0";
  return out;
}

/** 按字符宽度换行，最多 maxLines 行，超出加省略号 */
function wrap(text, perLine = 22, maxLines = 2) {
  const chars = [...String(text)];
  const lines = [];
  for (let i = 0; i < chars.length && lines.length < maxLines; i += perLine) {
    lines.push(chars.slice(i, i + perLine).join(""));
  }
  if (lines.length === maxLines && chars.length > perLine * maxLines) {
    lines[maxLines - 1] = lines[maxLines - 1].slice(0, -1) + "…";
  }
  return lines;
}

async function renderCard({ title, date, tags, isDefault }) {
  const titleLines = wrap(title || "沧海", 24, 2);
  const tagText = (tags && tags.length ? tags.map((t) => `#${t}`).join(" ") : "404-found.uk").slice(
    0,
    40
  );
  const meta = [
    "zenix@0xff: ~",
    date ? date.replaceAll("-", ".") : "",
    isDefault ? "" : tagText,
  ]
    .filter(Boolean)
    .join("  ·  ");

  const element = div(
    {
      style: {
        width: 1200,
        height: 630,
        background: BG,
        color: FG,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
        fontFamily: "Noto Sans SC",
      },
    },
    // 顶部信息行
    div(
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: "Styrene A",
          fontSize: 24,
          color: FAINT,
        },
      },
      span({}, meta),
      span({ style: { color: ACCENT } }, "0xFF")
    ),
    // 大标题
    div(
      {
        style: {
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          fontSize: 68,
          fontWeight: 700,
          lineHeight: 1.2,
          letterSpacing: "0.01em",
        },
      },
      titleLines.map((line) => span({ key: line }, line))
    ),
    // 底部：站点名 + 二进制装饰
    div(
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        },
      },
      div(
        {
          style: {
            fontFamily: "Styrene A",
            fontSize: 26,
            color: FAINT,
            display: "flex",
            gap: 16,
            alignItems: "center",
          },
        },
        span({ style: { color: FG } }, SITE_NAME),
        span({}, SITE_URL.replace("https://", ""))
      ),
      div(
        {
          style: {
            fontFamily: "Styrene A",
            fontSize: 20,
            color: FAINT,
            letterSpacing: 2,
            display: "flex",
          },
        },
        `${bits(0)} ${bits(1)}`
      )
    )
  );

  const svg = await satori(element, { width: 1200, height: 630, fonts });
  const png = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng();
  return png;
}

// —— 主流程 ——
const posts = fs
  .readdirSync(POSTS_DIR)
  .filter((f) => f.endsWith(".md"))
  .map((file) => {
    const { data } = matter(fs.readFileSync(path.join(POSTS_DIR, file), "utf8"));
    return { ...data, slug: file.replace(/\.md$/, "") };
  })
  .filter((p) => p.draft !== true);

fs.mkdirSync(OUT_OG_DIR, { recursive: true });

for (const p of posts) {
  const png = await renderCard({
    title: p.title,
    date: String(p.date || "").slice(0, 10),
    tags: Array.isArray(p.tags) ? p.tags : [],
    isDefault: false,
  });
  fs.writeFileSync(path.join(OUT_OG_DIR, `${encodeURIComponent(p.slug)}.png`), png);
  console.log(`✅ og/${encodeURIComponent(p.slug)}.png`);
}

const defPng = await renderCard({ title: "沧海", date: "", tags: [], isDefault: true });
fs.writeFileSync(path.join(OUT_OG_DIR, "default.png"), defPng);
console.log("✅ og/default.png");
