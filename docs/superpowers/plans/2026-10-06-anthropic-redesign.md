# Anthropic 风改版 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 404-found.uk 的全站视觉换成 Anthropic 风（象牙白 / 墨黑 / 沙色卡 / 陶土红，Sans 标题 + Serif 正文 + Mono 标签），配出场编排、滚动跟手、悬停微动、View Transitions 四类动效，保留全部功能。

**Architecture:** `src/styles/*.css` 四个文件承载全部视觉 token 与动效；`src/views/*.tsx` 承载每个页面的 UI 并接受 `lang`，`src/app/**/page.tsx` 与 `src/app/en/**/page.tsx` 退化为取数据的壳；共享构件在 `src/components/`。动效全部用 CSS（keyframes、scroll-driven）和 React `<ViewTransition>`，不引库。

**Tech Stack:** Next 16（App Router，`output: "export"`，Turbopack）、React 19、Tailwind 4（`@import "tailwindcss"` + `@theme inline`）、TypeScript 5.9、`node:test`。

**Spec:** `docs/superpowers/specs/2026-10-06-anthropic-redesign-design.md`（以下简称 spec；页面结构、字号、token 的权威值都在那里，本计划只重复实现所需的精确值）。样稿：`docs/superpowers/mockups/2026-10-06/*.html`。

## Global Constraints

- **Next 16 有破坏性变更。** 写任何 App Router 代码前先读 `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`、`11-css.md`、`13-fonts.md`，用到 View Transitions 时读 `02-guides/view-transitions.md`。`import { ViewTransition } from "react"` 在 App Router 里可用（Next 捆绑 React canary）。
- 分支 `redesign/anthropic`，工作目录 `F:\Programe\Blog`。不碰 `master`，不 push。
- 不改 `content/**`、`lib/posts.ts`（除 `renderMarkdown` 加 `rehype-slug`）、`lib/projects.ts`、`lib/about.ts`、`lib/seo.ts`、`lib/site-core.json`、`scripts/generate-feed.mjs`、`app/sitemap.ts`、`app/robots.ts`、`next.config.ts`、`deploy.sh`。
- 不引任何动画库、UI 库。新依赖只允许 `rehype-slug`。
- 颜色只能用 spec「颜色 token」表里的值，通过 CSS 变量引用，不在组件里写十六进制。
- 字体栈、字号阶梯、构件尺寸按 spec 原文。
- 动效只动 `transform`、`opacity`、`clip-path`、`background-size`、颜色；缓动出场 `cubic-bezier(0.22, 1, 0.36, 1)`。
- `@media (prefers-reduced-motion: reduce)` 下：取消位移/缩放/clip-path 动画，只留 ≤200ms 透明度；View Transitions 时长 0；文字必须最终可见。
- `@media (hover: none)` 下不应用悬停态。
- 四个 CSS 文件合计 ≤ 600 行。
- 每个页面 `metadata` / `generateMetadata` 保持原有输出不变。
- 所有用户可见文案走 `lib/i18n.ts` 的 `dict[lang]` 或 `lib/site.ts`，不在 view 里硬编码中文或英文。
- 每个任务结束：`npx tsc --noEmit` 零错误；`npm test` 通过；`git commit`。提交信息用 Conventional Commits，英文。
- `AGENTS.md`、`CLAUDE.md` 是 `next dev` 自动生成的，可以一并提交，不要删。
- 删除旧组件前 `rg` 确认无引用。

## File Structure

| 文件 | 职责 |
| --- | --- |
| `src/styles/tokens.css` | 颜色/字体/间距变量，`:root` 浅色，`.dark` 暗色，`@theme inline` |
| `src/styles/base.css` | `@font-face`、重置、排版阶梯、`.prose`、代码高亮配色 |
| `src/styles/components.css` | `.site-header`、`.wordmark`、`.pill`、`.sand-card`、`.hair-row`、`.toc`、`.site-footer`、`.search`、`.mobile-menu`、`.back-to-top` |
| `src/styles/motion.css` | keyframes、`.mask`/`.reveal`/`.underline-draw`/`.rise`、scroll-driven、View Transitions、`.theme-switching`、reduced-motion |
| `src/app/globals.css` | 五行 `@import` |
| `src/lib/i18n.ts` | `Lang`、`getLangFromPath`、`switchPath`、`dict`（全站文案） |
| `src/lib/site.ts` | 加 `home` 文案 |
| `src/lib/toc.ts` | `extractToc(html): TocItem[]` |
| `src/lib/tools.ts` | 工具页数据 `TOOL_SECTIONS[lang]`、`toolCount(lang)`（从两个 tools 页面搬出） |
| `src/components/page-transition.tsx` | `<PageTransition>` |
| `src/components/stagger.tsx` | `<Stagger>` 给子元素写 `--i` |
| `src/components/site-header.tsx` | 顶栏（client） |
| `src/components/mobile-menu.tsx` | 窄屏菜单（client） |
| `src/components/site-footer.tsx` | 页脚 |
| `src/components/sand-card.tsx` | 沙色卡 |
| `src/components/hair-row.tsx` | 细线行 |
| `src/components/toc.tsx` | 目录 |
| `src/components/{theme-toggle,language-toggle,nav-link,back-to-top,scroll-spy,post-search,comments}.tsx` | 改样式/行为 |
| `src/views/{home,post-list,post,projects,project,tags,tools,about,not-found}.tsx` | 页面 UI |
| `src/app/**/page.tsx`、`src/app/en/**/page.tsx`、`src/app/not-found.tsx`、`src/app/layout.tsx` | 壳 |
| `tests/toc.test.mjs`、`tests/i18n.test.mjs` | 纯函数测试 |
| `scripts/generate-og.mjs` | 配色 |

---

### Task 1: 样式系统、字典、目录函数

**Files:**
- Create: `src/styles/tokens.css`、`src/styles/base.css`、`src/styles/components.css`、`src/styles/motion.css`
- Create: `src/lib/toc.ts`、`tests/toc.test.mjs`、`tests/i18n.test.mjs`
- Modify: `src/app/globals.css`（整文件替换）、`src/lib/i18n.ts`、`src/lib/site.ts`、`src/lib/posts.ts:85-96`（`renderMarkdown`）、`package.json`
- Modify: `src/app/layout.tsx`（字体预载、theme-color）

**Interfaces:**
- Consumes: 无
- Produces:
  - CSS 类名（后续任务直接使用）：`.content`、`.wordmark`、`.pill`、`.pill-light`、`.sand-card`、`.sand-card-rows`、`.hair-row`、`.hair-list`、`.label`（mono 标签）、`.lede`、`.prose`、`.mask`、`.reveal`、`.underline-draw`、`.rise`、`.site-header`、`.site-header-progress`、`.toc`、`.search`、`.site-footer`、`.back-to-top`、`.mobile-menu`
  - `export type TocItem = { id: string; text: string; level: 2 | 3 }`
  - `export function extractToc(html: string): TocItem[]`
  - `dict[lang]` 的 key 见 Step 4
  - `site.home[lang]` 见 Step 4

- [ ] **Step 1: 测试先行——`tests/toc.test.mjs` 与 `tests/i18n.test.mjs`**

```javascript
// tests/toc.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { extractToc } from "../src/lib/toc.ts";

test("extracts h2 and h3 with ids and levels", () => {
  const html = `<p>x</p><h2 id="user-content-a">我是谁</h2><p>y</p><h3 id="user-content-b">细节 <code>c</code></h3><h2 id="user-content-c">为什么</h2>`;
  assert.deepEqual(extractToc(html), [
    { id: "user-content-a", text: "我是谁", level: 2 },
    { id: "user-content-b", text: "细节 c", level: 3 },
    { id: "user-content-c", text: "为什么", level: 2 },
  ]);
});

test("returns empty array when there are no headings", () => {
  assert.deepEqual(extractToc("<p>only text</p>"), []);
});

test("skips headings without id", () => {
  assert.deepEqual(extractToc("<h2>no id</h2>"), []);
});
```

```javascript
// tests/i18n.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { switchPath, getLangFromPath, dict } from "../src/lib/i18n.ts";

test("switchPath", () => {
  assert.equal(switchPath("/", "en"), "/en/");
  assert.equal(switchPath("/blog/a/", "en"), "/en/blog/a/");
  assert.equal(switchPath("/en/blog/a/", "zh"), "/blog/a/");
  assert.equal(switchPath("/en/", "zh"), "/");
});

test("getLangFromPath", () => {
  assert.equal(getLangFromPath("/en/about/"), "en");
  assert.equal(getLangFromPath("/about/"), "zh");
});

function keys(obj, prefix = "") {
  return Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === "object" && !Array.isArray(v) ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`],
  );
}

test("zh and en dictionaries have identical key sets", () => {
  assert.deepEqual(keys(dict.zh).sort(), keys(dict.en).sort());
});
```

`package.json` 加 `"test": "node --experimental-strip-types --test tests/"`（Node 24 原生支持直接 import `.ts`；若 `--experimental-strip-types` 报「已默认开启」警告，去掉该参数）。`src/lib/i18n.ts` 与 `src/lib/toc.ts` 不得 import 任何带 JSX 或 Next 的模块，保证能被 node 直接加载。

- [ ] **Step 2: 跑测试确认失败**

Run: `npm test`
Expected: FAIL——`toc.ts` 不存在；`switchPath("/", "en")` 现在返回 `/en/`？（现实现返回 `"/en" + "/"` = `/en/`，通过）；`dict` key 对比失败（尚未扩字典）。

- [ ] **Step 3: `src/lib/toc.ts`**

```ts
export type TocItem = { id: string; text: string; level: 2 | 3 };

const HEADING = /<h([23])\b[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g;

/** 从渲染后的 HTML 抽 h2/h3。无 id 的标题跳过；标题内的标签剥掉。 */
export function extractToc(html: string): TocItem[] {
  const items: TocItem[] = [];
  for (const m of html.matchAll(HEADING)) {
    const level = Number(m[1]) as 2 | 3;
    const text = m[3].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    if (!text) continue;
    items.push({ id: m[2], text, level });
  }
  return items;
}
```

`src/lib/posts.ts` 的 `renderMarkdown`：`npm i rehype-slug`，在 `.use(rehypeHighlight)` 之前加 `.use(rehypeSlug)`。`rehype-sanitize` 默认 schema 会给 id 加 `user-content-` 前缀并保留，不改 schema。

- [ ] **Step 4: `src/lib/i18n.ts` 与 `src/lib/site.ts`**

`i18n.ts` 保留 `Lang`、`getLangFromPath`、`switchPath`、`t`。`dict` 扩成（zh 值如下，en 自行给出等价英文，key 必须一一对应）：

```ts
export const dict = {
  zh: {
    nav: [
      { href: "/projects", label: "作品" },
      { href: "/about", label: "关于" },
      { href: "/blog", label: "文章" },
      { href: "/tools", label: "工具" },
    ],
    header: { github: "GitHub", menu: "菜单", close: "关闭", home: "返回首页", themeToDark: "切换为暗色模式", themeToLight: "切换为浅色模式", lang: "Switch to English" },
    footer: { rss: "RSS", github: "GitHub" },
    home: { work: "作品与文章", all: "全部", stats: (posts: number, projects: number, tags: number) => `${posts} 文章 · ${projects} 精选 · ${tags} 标签`,
            entries: { posts: "文章", projects: "作品", tools: "工具", about: "关于", rss: "RSS" },
            counts: { posts: (n: number) => `${n} 篇`, projects: (n: number) => `${n} 个`, tools: (n: number) => `${n} 项` } },
    card: { date: "Date", category: "Category", details: "Details", year: "Year", stack: "Stack", reading: "Reading", tags: "Tags",
            view: "查看项目", read: "阅读", open: "打开", post: "文章", project: "作品" },
    blog: { label: (n: number) => `Writing · ${n} 篇`, title: "文章", search: "搜索标题、摘要或标签…", noResult: (q: string) => `没有找到与「${q}」相关的文章。`, empty: "还没有文章。", year: (y: string, n: number) => `${y} · ${n} 篇`, back: "文章", minutes: (n: number) => `约 ${n} 分钟`, more: "继续阅读", comments: "Comments · Giscus" },
    projects: { label: (n: number) => `Selected Work · ${n}`, title: "作品", empty: "还没有作品。", back: "作品", visit: "访问站点", source: "查看源码", related: "相关作品" },
    tags: { label: "Tags", title: "标签", count: (n: number) => `${n} 篇`, tagLabel: (n: number) => `共 ${n} 篇文章` },
    tools: { label: "Tools", title: "工具清单", sub: "自建服务与常用工具。", total: (n: number) => `${n} 项` },
    about: { who: "我是谁", works: "代表作", allProjects: "全部项目", now: "我在做什么", site: "这个站", contact: "联系" },
    notFound: { title: "404", text: "这一页没找到，但你找到了这个站。", home: "回到首页" },
  },
  en: { /* 同构 */ },
} as const;
```

`site.ts` 加：

```ts
home: {
  zh: {
    headline: ["I'm {Zenix}.", "Test engineer who", "cares about {clean text}."],
    lede: ["你好，我是阿九，一名测试工程师。在产线测试这条路上摸爬滚打，目前的方向是测试研发——FCT / IGBT 测试、上位机自动化。", "这里记录工作与学习中的踩坑、对测试和自动化的思考，和偶尔的生活碎片。"],
    statement: "想清楚一件事和写清楚一件事是两回事。我写不了多快，但每一篇都想明白了再落笔。",
  },
  en: {
    headline: ["I'm {Zenix}.", "Test engineer who", "cares about {clean text}."],
    lede: ["Hi, I'm Zenix, a test engineer working on FCT / IGBT test systems and host-side automation.", "This site keeps notes from work and study, thoughts on testing and automation, and the occasional slice of life."],
    statement: "Understanding something and writing it down clearly are two different things. I don't write fast, but nothing goes out before I've thought it through.",
  },
},
```

- [ ] **Step 5: 四个 CSS 文件**

`src/app/globals.css` 整文件替换为：

```css
@import "tailwindcss";
@import "../styles/tokens.css";
@import "../styles/base.css";
@import "../styles/components.css";
@import "../styles/motion.css";
```

`src/styles/tokens.css`：

```css
@custom-variant dark (&:where(.dark, .dark *));

:root {
  --bg: #faf9f5; --fg: #141413; --muted: #5f5e5a;
  --card: #e3dacc; --card-fg: #141413; --card-hover: #d9cfbf; --cover: #d6cbb8;
  --hair: rgba(20, 20, 19, 0.18); --accent: #c6613f;
  --pill-bg: #141413; --pill-fg: #faf9f5;
  --code-bg: #141413; --code-fg: #faf9f5;
  --header-bg: rgba(250, 249, 245, 0.85);
  --font-sans: "Anthropic Sans", "PingFang SC", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif;
  --font-serif: "Anthropic Serif", "Noto Serif SC", "Songti SC", "SimSun", Georgia, serif;
  --font-mono: "Anthropic Mono", ui-monospace, Consolas, monospace;
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --content-max: 1120px; --pad-x: 48px;
  color-scheme: light;
}
.dark {
  --bg: #000000; --fg: #f5f4f0; --muted: #9b9892;
  --card: #161614; --card-fg: #ecebe6; --card-hover: #1f1f1c; --cover: #1f1f1c;
  --hair: rgba(245, 244, 240, 0.16); --accent: #e07e5c;
  --pill-bg: #f5f4f0; --pill-fg: #000000;
  --code-bg: #161614; --code-fg: #f5f4f0;
  --header-bg: rgba(0, 0, 0, 0.8);
  color-scheme: dark;
}
@media (max-width: 760px) { :root { --pad-x: 22px; } }

@theme inline {
  --color-bg: var(--bg); --color-fg: var(--fg); --color-muted: var(--muted);
  --color-card: var(--card); --color-card-fg: var(--card-fg); --color-hair: var(--hair); --color-accent: var(--accent);
  --font-sans: var(--font-sans); --font-serif: var(--font-serif); --font-mono: var(--font-mono);
}
```

`src/styles/base.css` 必须包含：三个 `@font-face`（`/fonts/anthropic-{sans,serif,mono}-roman.woff2`，`font-weight: 100 900`，`font-display: swap`）；`html { background: var(--bg); color: var(--fg); }`；`body { font-family: var(--font-serif); font-size: 19px; line-height: 1.7; -webkit-font-smoothing: antialiased; }`；`h1,h2,h3 { font-family: var(--font-sans); letter-spacing: -0.015em; }`；`.content { max-width: var(--content-max); margin-inline: auto; padding-inline: var(--pad-x); }`；`.label { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); }`；`.lede { font-size: 22px; line-height: 1.5; }`（≤760px 18px）；`.prose` 规则按 spec「正文 .prose」段（最大宽 680px、h2 28px、h3 22px、链接下划线、引用左 2px accent 线、`pre` 用 `--code-bg/--code-fg` mono 14px 圆角 8px、行内 `code` 用 `--card` 底、`img` 圆角 8px、表格细线）；`.hljs` 配色覆盖：`.hljs { background: transparent; color: var(--code-fg) }`，`.hljs-keyword,.hljs-built_in { color: #e07e5c }`、`.hljs-string { color: #c9b89a }`、`.hljs-comment { color: #8a8780 }`、`.hljs-number,.hljs-literal { color: #d9c7a3 }`、`.hljs-title,.hljs-attr { color: #f0eee6 }`（这是代码块内的固定配色，两种主题都用深底，允许写死）。`:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }`。

`src/styles/components.css` 必须包含（尺寸按 spec「基本构件」）：

- `.site-header { position: sticky; top: 0; z-index: 40; }`，内层 `.site-header-bar { display: flex; justify-content: space-between; align-items: center; padding: 22px var(--pad-x); }`，`.site-header-progress { position: absolute; top: 0; left: 0; height: 2px; width: 100%; background: var(--fg); transform-origin: left; transform: scaleX(0); }`。
- `.wordmark { font-family: var(--font-sans); font-weight: 700; font-size: 17px; }`，`.wordmark b { color: var(--accent); font-weight: 700; display: inline-block; transition: transform 250ms var(--ease-out); }`，`.wordmark span { display: inline-block; overflow: hidden; white-space: nowrap; max-width: 12em; vertical-align: bottom; }`（滚动后 `max-width: 0`，见 motion.css）。
- `.site-nav { display: flex; gap: 26px; align-items: center; font-size: 14px; }`，`.nav-link` 当前项 `border-bottom: 1.5px solid var(--fg)`。
- `.pill`、`.pill-light`、`.pill .arrow`（悬停 `translateX(3px)`）。
- `.sand-card`（`background: var(--card); color: var(--card-fg); border-radius: 12px; padding: 24px 22px 22px; display: flex; flex-direction: column;` 悬停 `--card-hover` + `translateY(-2px)` 200ms）、`.sand-card h3 { font-size: 22px; font-weight: 600 }`、`.sand-card p { font-size: 15px; margin-bottom: auto }`、`.sand-card-rows > div { display: flex; justify-content: space-between; padding: 8px 0; border-top: 1px solid var(--hair); }` 左 `.label`、右 serif 13px。
- `.hair-list` / `.hair-row { display: grid; grid-template-columns: 96px 1fr auto; gap: 14px; align-items: baseline; padding: 14px 0; border-top: 1px solid var(--hair); }` 最后一行 `border-bottom`；`.hair-row-title { font-family: var(--font-sans); font-weight: 600; background-image: linear-gradient(currentColor, currentColor); background-size: 0 1px; background-repeat: no-repeat; background-position: 0 100%; transition: background-size 220ms var(--ease-out); }`，`.hair-row:hover .hair-row-title { background-size: 100% 1px }`。
- `.toc`（`.label` 标题 + 列表项 `padding: 4px 0 4px 10px; border-left: 1.5px solid transparent; color: var(--muted); font-family: var(--font-sans); font-size: 13px;`，`.is-active { border-left-color: var(--fg); color: var(--fg) }`，h3 项 `padding-left: 22px`）。
- `.search { border: 0; border-bottom: 1px solid var(--fg); background: transparent; font: 16px var(--font-serif); padding: 8px 0; width: 100%; color: var(--fg) }`。
- `.site-footer { border-top: 1px solid var(--hair); padding: 26px var(--pad-x); display: flex; justify-content: space-between; }` 内文字 `.label`。
- `.back-to-top { position: fixed; right: 24px; bottom: 24px; width: 36px; height: 36px; border: 1px solid var(--hair); background: var(--bg); font-family: var(--font-mono); }`。
- `.mobile-menu { border-top: 1px solid var(--hair); background: var(--bg); }` 项 `padding: 14px var(--pad-x); border-bottom: 1px solid var(--hair); font-family: var(--font-sans); font-size: 16px;`。
- `@media (max-width: 640px) { .site-nav, .site-header .pill { display: none } }`，`@media (min-width: 641px) { .mobile-menu, .mobile-menu-button { display: none } }`。
- `@media (hover: none)` 下取消上述悬停规则。

`src/styles/motion.css`：

```css
@keyframes rise { from { transform: translateY(112%) } to { transform: translateY(0) } }
@keyframes fade-up { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: translateY(0) } }
@keyframes draw { from { transform: scaleX(0) } to { transform: scaleX(1) } }
@keyframes view-rise { from { opacity: 0; transform: translateY(22px) } to { opacity: 1; transform: translateY(0) } }

.mask { overflow: hidden; }
.mask > * { animation: rise 900ms var(--ease-out) both; animation-delay: calc(var(--i, 0) * 120ms); }
.reveal { animation: fade-up 900ms var(--ease-out) both; animation-delay: calc(var(--i, 0) * 120ms); }
.underline-draw { position: relative; display: inline-block; }
.underline-draw::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0.04em; height: 3px; background: currentColor; transform-origin: left; animation: draw 700ms var(--ease-out) 500ms both; }

@supports (animation-timeline: scroll()) {
  .site-header-bar { animation: header-solid linear both; animation-timeline: scroll(root); animation-range: 0 24px; }
  .wordmark span { animation: wordmark-collapse linear both; animation-timeline: scroll(root); animation-range: 0 24px; }
  .site-header-progress { animation: draw linear both; animation-timeline: scroll(root); }
  .rise { animation: view-rise 700ms var(--ease-out) both; animation-timeline: view(); animation-range: entry 0% entry 40%; }
}
@supports not (animation-timeline: scroll()) {
  .site-header-bar { background: var(--header-bg); backdrop-filter: blur(8px); border-bottom: 1px solid var(--hair); }
  .site-header-progress { display: none; }
}
@keyframes header-solid { to { background: var(--header-bg); backdrop-filter: blur(8px); border-bottom-color: var(--hair); } }
@keyframes wordmark-collapse { to { max-width: 0; } }
.site-header-bar { border-bottom: 1px solid transparent; }

/* View Transitions */
::view-transition { pointer-events: none; }
::view-transition-old(.page-out) { animation: 150ms ease-in both fade-up reverse; }
::view-transition-new(.page-in) { animation: 260ms var(--ease-out) 150ms both fade-up; }
::view-transition-group(.morph) { animation-duration: 400ms; }
::view-transition-group(site-header) { animation: none; z-index: 100; }
::view-transition-old(site-header) { display: none; }
::view-transition-new(site-header) { animation: none; }

/* 主题切换 */
.theme-switching, .theme-switching * { transition: color 400ms ease, background-color 400ms ease, border-color 400ms ease, fill 400ms ease, stroke 400ms ease !important; }
.theme-icon { display: grid; }
.theme-icon > svg { grid-area: 1 / 1; transition: opacity 300ms ease, transform 300ms ease; }
.theme-icon > svg[data-hidden="true"] { opacity: 0; transform: rotate(-30deg) scale(0.8); }

@media (prefers-reduced-motion: reduce) {
  .mask > *, .reveal, .rise { animation: fade-up 200ms ease both; transform: none !important; }
  .underline-draw::after { animation: none; transform: none; }
  ::view-transition-old(*), ::view-transition-new(*), ::view-transition-group(*) { animation-duration: 0s !important; animation-delay: 0s !important; }
  .theme-switching, .theme-switching * { transition-duration: 0s !important; }
  .pill .arrow, .sand-card, .hair-row-title, .wordmark b { transition: none !important; }
}
```

`src/app/layout.tsx`：预载改为 `anthropic-sans-roman.woff2` 与 `anthropic-serif-roman.woff2`；`<meta name="theme-color" media="(prefers-color-scheme: light)" content="#faf9f5">` 与 `media="(prefers-color-scheme: dark)" content="#000000"`；其余（Umami、内联主题脚本、favicon）不动。此任务不删组件引用——`AmbientBackdrop`/`EffectLayer` 在 `master` 上：`EffectLayer` 有、`AmbientBackdrop` 没有；本任务先保留 `EffectLayer` 的引用（Task 2 删）。

- [ ] **Step 6: 跑测试与类型检查**

Run: `npm test && npx tsc --noEmit`
Expected: 测试全过；tsc 零错误（旧组件仍引用旧类名无妨，CSS 类不参与类型检查）。
Run: `node -e "const fs=require('fs');let n=0;for(const f of ['tokens','base','components','motion'])n+=fs.readFileSync('src/styles/'+f+'.css','utf8').split('\n').length;console.log(n)"`
Expected: ≤ 600。

- [ ] **Step 7: Commit**

```bash
git add src/styles src/app/globals.css src/app/layout.tsx src/lib/i18n.ts src/lib/site.ts src/lib/toc.ts src/lib/posts.ts tests package.json package-lock.json AGENTS.md CLAUDE.md
git commit -m "feat(ui): design tokens, base styles, motion system, i18n dictionary, toc"
```

---

### Task 2: 页面外壳——顶栏、页脚、切换器、过渡、通用构件

**Files:**
- Create: `src/components/page-transition.tsx`、`src/components/stagger.tsx`、`src/components/mobile-menu.tsx`、`src/components/sand-card.tsx`、`src/components/hair-row.tsx`、`src/components/toc.tsx`
- Modify（重写）: `src/components/site-header.tsx`、`src/components/site-footer.tsx`、`src/components/theme-toggle.tsx`、`src/components/language-toggle.tsx`、`src/components/nav-link.tsx`、`src/components/back-to-top.tsx`、`src/components/scroll-spy.tsx`、`src/components/comments.tsx`
- Modify: `src/app/layout.tsx`（去掉 `EffectLayer`、`BackButton`）
- Delete: `src/app/template.tsx`

**Interfaces:**
- Consumes: Task 1 的 CSS 类、`dict`、`getLangFromPath`、`switchPath`、`TocItem`
- Produces:
  - `PageTransition({ children })`：`<ViewTransition enter="page-in" exit="page-out" default="none">`
  - `Stagger({ children, as = "div", className, start = 0 })`：克隆直接子元素注入 `style={{ "--i": start + index }}`
  - `SandCard({ title, titleName?, href, description, rows: { label: string; value: ReactNode }[], action: string, lang })`：`titleName` 非空时 h3 包 `<ViewTransition name={titleName} share="morph" default="none">`
  - `HairRow({ href, meta, title, titleName?, sub?, trailing })`
  - `Toc({ items: TocItem[], label: string })`
  - `SiteHeader({ progress?: boolean })`：`progress` 为真时渲染 `.site-header-progress`
  - `MobileMenu({ items, lang })`

- [ ] **Step 1: 读 Next 16 文档**

读 `node_modules/next/dist/docs/01-app/02-guides/view-transitions.md` 与 `03-api-reference/02-components/link.md` 中 `transitionTypes` 段。

- [ ] **Step 2: `page-transition.tsx` 与 `stagger.tsx`**

```tsx
// src/components/page-transition.tsx
import { ViewTransition } from "react";
export function PageTransition({ children }: { children: React.ReactNode }) {
  return <ViewTransition enter="page-in" exit="page-out" default="none">{children}</ViewTransition>;
}
```

```tsx
// src/components/stagger.tsx
import { Children, cloneElement, isValidElement, type CSSProperties, type ReactNode } from "react";
export function Stagger({ children, className, start = 0 }: { children: ReactNode; className?: string; start?: number }) {
  let i = start;
  return (
    <div className={className}>
      {Children.map(children, (child) => {
        if (!isValidElement<{ style?: CSSProperties }>(child)) return child;
        const style = { ...(child.props.style ?? {}), ["--i" as string]: i++ } as CSSProperties;
        return cloneElement(child, { style });
      })}
    </div>
  );
}
```

- [ ] **Step 3: `site-header.tsx`（client）**

结构：

```tsx
<header className="site-header" style={{ viewTransitionName: "site-header" }}>
  <div className="site-header-bar">
    {progress && <div className="site-header-progress" aria-hidden="true" />}
    <Link href={lang === "en" ? "/en/" : "/"} className="wordmark" aria-label={d.header.home}>阿九<b>\</b><span>404-found.uk</span></Link>
    <div className="site-header-right">
      <nav className="site-nav" aria-label="主导航">{d.nav.map(item => <NavLink key={item.href} href={item.href}>{item.label}</NavLink>)}</nav>
      <span className="site-header-divider" aria-hidden="true" />
      <LanguageToggle />
      <ThemeToggle />
      <a className="pill" href={site.links.github} target="_blank" rel="noreferrer">{d.header.github} <span className="arrow">→</span></a>
      <MobileMenu items={d.nav} lang={lang} />
    </div>
  </div>
</header>
```

`site-header-right { display: flex; gap: 18px; align-items: center }`、`site-header-divider { width: 1px; height: 16px; background: var(--hair) }` 放进 `components.css`（Task 1 若未写则此处补，仍受 600 行上限约束）。

`MobileMenu`：一个 `.mobile-menu-button`（文字 `d.header.menu` / `d.header.close`，mono）和展开时渲染在 `<header>` 下方的 `.mobile-menu` 列表；`usePathname()` 变化时关闭；`aria-expanded`。

`LanguageToggle`：渲染 `<Link className="label lang-toggle" href={switchPath(pathname, other)}>` 内容 `<b data-on={lang==="zh"}>ZH</b> / <b data-on={lang==="en"}>EN</b>`，`data-on="true"` 为 `--fg`，否则 `--muted`（规则进 components.css）。

`ThemeToggle`：保留现有 localStorage/`.dark` 逻辑；切换前 `document.documentElement.classList.add("theme-switching")`，`setTimeout` 400ms 后移除；两枚 SVG（月亮 / 太阳，`stroke-width: 1.6`，16px）叠放在 `.theme-icon` 里，用 `data-hidden` 控制。`aria-label` 用 `d.header.themeToDark/Light`（组件内用 `usePathname` 取 lang）。

`NavLink`：当前路径以 `href` 开头时加 `aria-current="page"` 与 `.is-current`。

- [ ] **Step 4: `site-footer.tsx`、`back-to-top.tsx`、`scroll-spy.tsx`、`comments.tsx`、`sand-card.tsx`、`hair-row.tsx`、`toc.tsx`**

- 页脚：`<footer className="site-footer"><span className="label">© {year} {site.name}</span><span className="label">GitHub — RSS — <LanguageToggle/></span></footer>`（链接用 `<a>`，`—` 为分隔文本）。页脚是 server component，`LanguageToggle` 是 client，可直接嵌。
- 回到顶部：保留滚动 480px 显示逻辑，样式换 `.back-to-top`，内容 `↑`。
- ScrollSpy：改为接受 `{ ids: string[] }`，用 IntersectionObserver 观察 `document.getElementById(id)`，把 `.toc a[href="#id"]` 的父 `li` 置 `.is-active`（同一时刻只一个：取最后一个进入视口上半区的标题）。
- Comments：外层 `<section className="comments"><div className="label">{label}</div>…giscus…</section>`，接受 `label` prop；Giscus `data-theme` 按 `.dark` 取 `dark_dimmed` / `light`，并监听 `<html>` class 变化用 `postMessage` 给 iframe 切主题（giscus 文档的 `setConfig` 消息）。
- `SandCard`、`HairRow`、`Toc` 按 Interfaces 签名实现，类名用 Task 1 的。

- [ ] **Step 5: `layout.tsx` 去掉 `EffectLayer`、`BackButton`；删除 `src/app/template.tsx`**

- [ ] **Step 6: 验证**

Run: `npx tsc --noEmit && npm test`
Expected: 零错误（页面仍在引用旧组件，但旧组件文件还在，编译通过）。
Run: `npm run dev -- --port 3777`，浏览器打开 `http://localhost:3777/`，确认顶栏新样式出现、`ZH / EN` 与主题图标工作、滚动后顶栏出现底色底线、≤640px 出现「菜单」。截一张 1440 宽的首页顶栏截图到 `docs/superpowers/screens/2026-10-06/task2-header.png`。

- [ ] **Step 7: Commit**

```bash
git add -A src/components src/app/layout.tsx src/app/template.tsx docs/superpowers/screens
git commit -m "feat(ui): new site shell: header, footer, toggles, page transition, shared cards"
```

---

### Task 3: 首页

**Files:**
- Create: `src/views/home.tsx`
- Modify: `src/app/page.tsx`、`src/app/en/page.tsx`

**Interfaces:**
- Consumes: `PageTransition`、`Stagger`、`SandCard`、`HairRow`、`dict`、`site.home`、`getAllPosts(lang)`、`getFeaturedProjects(2)`、`getAllTags(lang)`、`formatDate`、`slugToHref`
- Produces: `HomeView({ lang, posts, projects, tagCount, toolCount })`

- [ ] **Step 1: `views/home.tsx`**

结构按 spec「首页」四段。要点：

- `headline` 渲染：每行一个 `<div className="mask"><span>…</span></div>`，`{word}` 替换为 `<span className="underline-draw">word</span>`；解析用 `/\{([^}]+)\}/g`。
- 右栏 `<Stagger start={3}>` 包两段 `<p className="lede reveal">` 和 `<p className="label reveal">{d.home.stats(...)}</p>`。
- 三卡：`cards = [...projects.slice(0,2).map(toProjectCard), ...posts.map(toPostCard)].slice(0, 3)`；全空则不渲染该区块。项目卡 rows：Date=year、Category=`d.card.project`、Details=tech 前三个（下划线）；文章卡 rows：Date=`formatDate`、Category=`d.card.post`、Details=tags 前两个。卡标题 `titleName` 为 `project-${slug}` / `post-${slug}`。区块外层 `className="rise"`。
- 陈述 + 清单：左 `<h2>{site.home[lang].statement}</h2>`，右 `.hair-list` 五行 `HairRow`（meta 留空列用 `grid-template-columns: 1fr auto` 的变体 `.hair-row--2`），trailing 为 `d.home.counts.posts(posts.length)` 等，RSS 行 trailing `feed.xml`。
- 链接前缀：`const p = lang === "en" ? "/en" : ""`。

- [ ] **Step 2: 壳**

先建 `src/lib/tools.ts`：把 `src/app/tools/page.tsx` 与 `src/app/en/tools/page.tsx` 里的 `ToolStatus`、`Tool`、`ToolSection` 类型和两份 `SECTIONS` 数据原样搬进去，导出 `TOOL_SECTIONS: Record<Lang, ToolSection[]>` 与 `toolCount(lang: Lang): number`；两个 tools 页面改为从 `@/lib/tools` 取数据（页面文件不能有 `default`/`metadata` 之外的导出，否则 `next build` 类型检查会报错）。

`src/app/page.tsx` 保留 `metadata` 与 `JsonLd`，主体改为 `<HomeView lang="zh" posts={getAllPosts()} projects={getFeaturedProjects(2)} tagCount={getAllTags().length} toolCount={toolCount("zh")} />`。`en/page.tsx` 用 `lang="en"`、`getAllPosts("en")`、`getAllTags("en")`、`toolCount("en")`。两页都用 `PageTransition` 包根。

- [ ] **Step 3: 验证**

Run: `npx tsc --noEmit`，`npm run dev -- --port 3777`。浏览器 1440 与 390 宽、浅与暗、`/` 与 `/en/` 各截图存 `docs/superpowers/screens/2026-10-06/home-{1440,390}-{light,dark}-{zh,en}.png`。对照 `docs/superpowers/mockups/2026-10-06/home.html`。

- [ ] **Step 4: Commit**

```bash
git add src/views/home.tsx src/lib/tools.ts src/app/page.tsx src/app/en/page.tsx src/app/tools/page.tsx src/app/en/tools/page.tsx docs/superpowers/screens
git commit -m "feat(home): anthropic-style home view for zh and en"
```

---

### Task 4: 文章列表、文章页、标签页

**Files:**
- Create: `src/views/post-list.tsx`、`src/views/post.tsx`、`src/views/tags.tsx`
- Modify: `src/components/post-search.tsx`、`src/app/blog/page.tsx`、`src/app/blog/[slug]/page.tsx`、`src/app/tags/page.tsx`、`src/app/tags/[tag]/page.tsx` 与 `src/app/en/` 下对应四个文件

**Interfaces:**
- Consumes: Task 1–2 全部；`extractToc`、`Toc`、`ScrollSpy({ ids })`、`Comments({ label })`、`getPost`、`getAdjacentPosts`、`getPostsByTag`、`getAllTags`
- Produces: `PostListView({ lang, posts })`、`PostView({ lang, post, adjacent, fallbackProjects })`、`TagsView({ lang, tags })`、`TagView({ lang, tag, posts })`

- [ ] **Step 1: `views/post-list.tsx`**

`.label` → `<h1>` → `<PostSearch posts lang />`（搜索框样式 `.search`，结果用 `HairRow`）→ 按年分组：年份 `.label`（`d.blog.year(y, n)`）+ `.hair-list` 的 `HairRow`（meta=`formatDate`，title=标题 `titleName={`post-${slug}`}`，sub=excerpt，trailing=tags 的 `.label`）。首屏 `Stagger`，分组 `.rise`。

- [ ] **Step 2: `views/post.tsx`**

`<Link className="label" href={`${p}/blog/`} transitionTypes={["nav-back"]}>← {d.blog.back}</Link>` → `<h1>` 包 `<ViewTransition name={`post-${slug}`} share="morph" default="none">` → excerpt 为 `.lede`（空则不渲染）→ 两栏 `.post-grid { display: grid; grid-template-columns: 220px 1fr; gap: 56px }`（≤900px 单栏；规则进 components.css）：左 `.sand-card-rows` 风格的元数据（无卡底，直接 `.meta-rows`）+ `<Toc items label="目录" />`（无 items 不渲染）；右 `<div className="prose" dangerouslySetInnerHTML>`。正文后 `d.blog.more` 两张 `SandCard`（prev/next，缺则用 `fallbackProjects` 补）→ `<Comments label={d.blog.comments} />`。`<ScrollSpy ids={toc.map(t => t.id)} />`。`SiteHeader` 的进度线：由 `layout.tsx` 统一渲染 `SiteHeader`，它在 client 用 `usePathname()` 判断 `/blog/<slug>/`（路径段数 ≥ 2 且第一段为 blog）时渲染进度线。

- [ ] **Step 3: `views/tags.tsx`**

`TagsView`：`.label` + `<h1>` + `.hair-list`，每行 tag 名 + trailing `d.tags.count(n)`，链接到 `${p}/tags/${slugToHref(tag)}/`。`TagView`：`.label` `#tag` + `<h1>` + `d.tags.tagLabel(n)` + 与列表页相同的 `HairRow` 列表。

- [ ] **Step 4: 壳**

八个 page.tsx 都退化为：保留 `generateStaticParams`、`dynamicParams`、`metadata`/`generateMetadata`、`JsonLd`；主体 `<PageTransition><XView … /></PageTransition>`。en 版传 `lang="en"` 与 `lang` 参数的数据函数。删除对 `PageHeader`、`FadeIn`、`BookTransition`、`ProseTilt`、`ReadingProgress` 的 import。

- [ ] **Step 5: 验证**

`npx tsc --noEmit && npm test`。开发服务器截图：`/blog/`、`/blog/hello-im-ajiu/`、`/tags/`，1440/390 × 浅/暗 × zh/en，存 `docs/superpowers/screens/2026-10-06/`。在 Chrome 里从列表点进文章，确认标题 morph、顶栏不动、目录随滚动高亮、进度线增长。

- [ ] **Step 6: Commit**

```bash
git add src/views src/components/post-search.tsx src/app/blog src/app/tags src/app/en/blog src/app/en/tags docs/superpowers/screens
git commit -m "feat(blog): post list, post page with toc, tag pages in new design"
```

---

### Task 5: 作品、工具、关于、404

**Files:**
- Create: `src/views/projects.tsx`、`src/views/project.tsx`、`src/views/tools.tsx`、`src/views/about.tsx`、`src/views/not-found.tsx`
- Modify: `src/app/projects/page.tsx`、`src/app/projects/[slug]/page.tsx`、`src/app/tools/page.tsx`、`src/app/about/page.tsx`、`src/app/not-found.tsx` 与 `src/app/en/` 下对应文件

**Interfaces:**
- Consumes: Task 1–2；`getAllProjects`、`getProjectBySlug`、`getAboutContent`、`SECTIONS`（tools）
- Produces: `ProjectsView({ lang, projects })`、`ProjectView({ lang, project, others })`、`ToolsView({ lang, sections })`、`AboutView({ lang, about, featured })`、`NotFoundView({ lang })`

- [ ] **Step 1: 五个 view**

- `ProjectsView`：`.label` `d.projects.label(n)` → `<h1>` → `.project-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px }`（≤760px 单栏）。卡用 `.sand-card` 变体 `.project-card`：顶部 `.cover { aspect-ratio: 16/9; background: var(--cover); border-radius: 12px 12px 0 0; overflow: hidden }`（有 `cover` 放 `<img>`，否则 serif 首字母 48px，颜色 `var(--muted)`），悬停 `img { transform: scale(1.02) }` 600ms；下方 h3（`titleName={`project-${slug}`}`）、说明、rows Year / Stack。
- `ProjectView`：`← d.projects.back`（`transitionTypes={["nav-back"]}`）→ h1（morph）→ `.lede` description → pill 组 → cover → `.prose` → `d.projects.related` 两张 `SandCard`。
- `ToolsView`：`.label` `d.tools.label` → h1 → `d.tools.sub` lede → 每个 section：`.label` 英文名 + h2 中文名 + `.hair-list`（meta 列放 `.label` 状态词 `RUNNING/LOCAL/LAB/DAILY`，title 名称，sub 说明，trailing `.label` tag）。数据来自 Task 3 建的 `@/lib/tools`（`TOOL_SECTIONS[lang]`），由壳传入。去掉 `STATUS_META` 与圆点。
- `AboutView`：头像 88px（`https://github.com/ZeniX-ally.png?size=256`）+ h1 `site.name` + `.lede` `about.subtitle` → 各节：`.label` 节名 + 内容；「代表作」`SandCard`；「我在做什么」三张 `SandCard`（title=item.title，description=item.desc，无 rows，无 action）；「联系」`HairRow` GitHub。
- `NotFoundView`：`<h1 style={{fontSize:120}}>404</h1>` + `.lede` + `.pill` 回首页。

- [ ] **Step 2: 壳**

同 Task 4 的做法。`src/app/not-found.tsx` 用 `lang="zh"`（静态导出只有一个 404）。

- [ ] **Step 3: 验证**

`npx tsc --noEmit && npm test`。截图 `/projects/`、`/projects/404-found-uk/`、`/tools/`、`/about/`、任一不存在路径，1440/390 × 浅/暗 × zh/en。

- [ ] **Step 4: Commit**

```bash
git add src/views src/app/projects src/app/tools src/app/about src/app/not-found.tsx src/app/en docs/superpowers/screens
git commit -m "feat(pages): projects, tools, about, 404 in new design"
```

---

### Task 6: 清理、OG 配色、构建验证

**Files:**
- Delete: `src/components/{ink-particles,ripple-fx,prose-tilt,effect-layer,highlight-chars,book-transition,fade-in,reading-progress,back-button,page-header,md-page}.tsx`、`src/hooks/use-in-view.ts`
- Modify: `scripts/generate-og.mjs:40-43`（配色）

**Interfaces:**
- Consumes: 全部前置任务
- Produces: 无

- [ ] **Step 1: 确认无引用后删除**

Run: `rg -n "ink-particles|ripple-fx|prose-tilt|effect-layer|highlight-chars|book-transition|fade-in|reading-progress|back-button|page-header|md-page|use-in-view" src`
Expected: 无输出。然后 `git rm` 上述文件。

- [ ] **Step 2: OG 配色**

`generate-og.mjs` 常量改为 `ACCENT = "#c6613f"`、`FG = "#141413"`、`FAINT = "#5f5e5a"`、`BG = "#faf9f5"`；若模板里有水印/装饰色引用旧绿色，一并改为 `ACCENT`。字体不动。

- [ ] **Step 3: 全量验证**

Run: `npx tsc --noEmit && npm test`
Run: `npm run build`
Expected: 成功；`out/index.html`、`out/en/index.html`、`out/blog/hello-im-ajiu/index.html`、`out/projects/404-found-uk/index.html`、`out/feed.xml`、`out/og/default.png` 存在。若 NTFS 上 `next build` 因文件锁失败，记录到报告，构建验证改在 ext4 `blog-build` 做（见 `deploy.sh`）。
Run: 四个 CSS 文件行数合计 ≤ 600。
Run: `rg -n "#[0-9a-fA-F]{6}" src/views src/components`
Expected: 无输出（颜色全部走变量）。

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore(ui): remove legacy effect components, recolor og images"
```
