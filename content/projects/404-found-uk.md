---
slug: 404-found-uk
name: 404-found.uk
year: 2026
tech:
  - Next.js
  - React
  - Tailwind
  - Cloudflare Pages
link: https://404-found.uk
featured: true
description: 这个博客：Next.js 16 静态站点，部署在 Cloudflare Pages，带评论、统计、搜索。
description_en: "This blog: a Next.js 16 static site on Cloudflare Pages, with comments, analytics and search."
---

## 背景

404-found.uk 是我的个人站与作品集载体。名字是个双关：404 通常意味着「找不到」，但在这里，它找到了你。选择静态站点，是为了部署简单、CDN 友好、没有运行时运维负担。

## 我做了什么

- **静态博客**：Markdown 写作，gray-matter 解析 frontmatter，构建期渲染 HTML
- **作品与关于**：项目列表、关于页、工具页，统一视觉语言
- **互动与增长**：Giscus 评论、Umami 统计、站内搜索与标签体系
- **双语雏形**：中文为主路由，`/en` 前缀承载英文页
- **分享基建**：RSS、sitemap、OG 图生成脚本

## 技术栈

**Next.js 16** 完全静态导出，部署在 **Cloudflare Pages**。样式用 Tailwind，内容用 Markdown——改文案不需要碰组件。液态玻璃顶栏、墨迹粒子 Hero、书本翻页过渡尽量克制，让内容本身说话。

## 结果/现状

这既是对外展示的门面，也是练习前端工程与品牌表达的练兵场。持续迭代排版与作品叙事，保持极简而不空洞。
