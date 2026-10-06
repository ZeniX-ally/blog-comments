# 全站改版：Anthropic 风 + 动效

日期：2026-10-06
状态：已批准，待实施
分支：`redesign/anthropic`（从 `master` `af5e0cf` 开出；9 月 10 日的未提交改动已存为 `wip/lux-hero` `d769e38`，本次不使用）

## 目标

把 404-found.uk 的视觉系统整个换掉，照 anthropic.com 的气质重做：象牙白纸底、墨黑字、沙色信息卡、一点陶土红；粗无衬线标题 + 衬线正文 + 等宽小标签；大留白；几乎没有装饰。再配一套克制但讲究的动效：出场编排、滚动跟手、悬停微动、页面切换。

保留全部功能：中英双语、明暗切换（暗色为 OLED 纯黑）、文章搜索、阅读进度、目录联动、回到顶部、Giscus 评论、RSS、Umami、SEO / OG / JSON-LD、静态导出到 Cloudflare Pages。

样稿（最终认可版，用浏览器直接打开即可看，字体从 `/files/` 加载不到时会回退系统字体）：

- `docs/superpowers/mockups/2026-10-06/home.html` — 首页浅色，带出场动效循环
- `docs/superpowers/mockups/2026-10-06/dark-mode.html` — 两种暗色对比，选 B（OLED 纯黑）
- `docs/superpowers/mockups/2026-10-06/inner-pages.html` — 文章页、文章列表、作品列表

## 不做什么

- 不动内容层：`content/**`、`lib/posts.ts`、`lib/projects.ts`、`lib/about.ts`、`lib/seo.ts`、`lib/site-core.json`、feed、sitemap、robots 不改（`renderMarkdown` 加一个 rehype 插件除外）。
- 不动部署：`deploy.sh`、`next.config.ts`、Cloudflare 配置不改。
- 不引第三方动画库、不引 UI 库。
- 不自托管中文字体。
- 不做 hero 视频（`src/remotion/**` 与 `render:hero` 脚本保留但不使用，后续另议是否删除）。
- 不做评论、搜索、统计的功能改动，只换样式。

## 视觉系统

### 颜色 token

| token | 浅色 | 暗色（`.dark`） | 用途 |
| --- | --- | --- | --- |
| `--bg` | `#faf9f5` | `#000000` | 页面底 |
| `--fg` | `#141413` | `#f5f4f0` | 正文、标题 |
| `--muted` | `#5f5e5a` | `#9b9892` | 次级文字、元数据 |
| `--card` | `#e3dacc` | `#161614` | 沙色卡 |
| `--card-fg` | `#141413` | `#ecebe6` | 卡内文字 |
| `--card-hover` | `#d9cfbf` | `#1f1f1c` | 卡悬停 |
| `--hair` | `rgba(20,20,19,0.18)` | `rgba(245,244,240,0.16)` | 细线 |
| `--accent` | `#c6613f` | `#e07e5c` | 陶土红：字标的 `\`、引用左线、焦点环 |
| `--pill-bg` / `--pill-fg` | `#141413` / `#faf9f5` | `#f5f4f0` / `#000000` | 实心小按钮 |
| `--code-bg` / `--code-fg` | `#141413` / `#faf9f5` | `#161614` / `#f5f4f0` | 代码块 |
| `--header-bg` | `rgba(250,249,245,0.85)` | `rgba(0,0,0,0.8)` | 滚动后的顶栏底 |

浅色是默认；`.dark` 挂在 `<html>` 上，由现有 `<head>` 内联脚本在首屏前写入，逻辑不变（localStorage `theme`，缺省跟随系统）。`<meta name="theme-color">` 跟随主题：浅 `#faf9f5`，暗 `#000000`。

### 字体

| 角色 | 字体栈 | 文件 |
| --- | --- | --- |
| 标题 `--font-sans` | `"Anthropic Sans", "PingFang SC", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif` | `public/fonts/anthropic-sans-roman.woff2` |
| 正文 `--font-serif` | `"Anthropic Serif", "Noto Serif SC", "Songti SC", "SimSun", Georgia, serif` | `public/fonts/anthropic-serif-roman.woff2` |
| 标签 `--font-mono` | `"Anthropic Mono", ui-monospace, Consolas, monospace` | `public/fonts/anthropic-mono-roman.woff2` |

三个 `@font-face` 都 `font-display: swap`，`font-weight: 100 900`。`layout.tsx` 预载 Sans 和 Serif，不再预载 Styrene A（文件保留给 OG 脚本用）。中文回退系统字体，Android 上正文会落到黑体，接受。

### 字号阶梯（桌面 / 窄屏）

| 角色 | 桌面 | ≤760px | 字体 |
| --- | --- | --- | --- |
| 首页 h1 | 58px / 1.06 | 40px | sans 700，字距 -0.015em |
| 页面 h1（列表、文章、作品、关于） | 44px / 1.1 | 32px | sans 700 |
| 区块 h2 | 30px | 24px | sans 700 |
| 卡片 h3 | 22px | 20px | sans 600 |
| 导语 | 22px / 1.5 | 18px | serif |
| 正文 | 19px / 1.7 | 17px | serif |
| 卡片说明 | 15px / 1.5 | 15px | serif |
| 等宽标签 | 11px，字距 0.08em，全大写 | 同 | mono |

### 基本构件

- **顶栏**：`position: sticky; top: 0`。左字标 `阿九\404-found.uk`，sans 700，`\` 用 `--accent`。右侧依次：导航四项（serif 14px）、细竖线、`ZH / EN`（mono 11px，当前语言 `--fg`、另一个 `--muted`）、☾/☀ 一笔线描图标 16px、实心 pill「GitHub →」。初始无底色无线；滚动超过 24px 后：底 `--header-bg` + `backdrop-filter: blur(8px)`、底边 1px `--hair`、字标收成 `阿九\`。≤640px：隐藏导航四项和 GitHub pill，出现「菜单」文字按钮，点开在顶栏下方展开一列导航（全宽，细线分隔），再点或路由变化后收起。
- **pill**：`--pill-bg`/`--pill-fg`，serif 14px，`padding: 8px 14px`，圆角 8px，右侧箭头 `→`。悬停箭头 `translateX(3px)`。
- **沙色卡**：`--card` 底，圆角 12px，内边距 24px 22px。结构：h3、serif 说明、`.rows`（mono 标签行，每行上边 1px `--hair`，左标签右值）、底部 pill。悬停：底变 `--card-hover`、`translateY(-2px)`，200ms。
- **细线行**：`padding: 14px 0`，上边 1px `--hair`，最后一行加下边。左标题 sans 600、中间 serif 摘要（可选）、右侧 mono 标签。悬停：标题下划线从左长出（`background-size` 0→100%，220ms）。
- **等宽标签**：`--font-mono` 11px 全大写字距 0.08em，颜色 `--muted`。
- **页脚**：上边 1px `--hair`，左 `© 2026 阿九`，右 `GitHub — RSS — ZH / EN`，全部 mono 标签样式。语言开关在顶栏和页脚都写作 `ZH / EN`，不随当前语言改字。
- **搜索框**：无边框，仅 1px `--fg` 下边线，serif 16px，右侧 mono `⌘K` 提示（纯提示，不做快捷键）。
- **正文 `.prose`**：serif 19px/1.7，最大宽 680px；h2 sans 600 28px；h3 sans 600 22px；链接 `--fg` 加 1px 下划线，悬停变 `--accent`；引用左 2px `--accent` 线、`--muted` 斜体；代码块 `--code-bg`/`--code-fg` mono 14px 圆角 8px；行内代码 `--card` 底；表格细线；图片圆角 8px。代码高亮沿用 `rehype-highlight`，配色改为与 `--code-bg` 协调的低饱和方案（在 `base.css` 覆盖 `.hljs-*`）。

### 页面

所有页面：顶栏 → `<main>` → 页脚。内容栏最大宽 1120px，左右内边距 48px（≤760px 为 22px）。首屏以上的元素用出场编排，首屏以下用滚动浮现。

**首页 `/`、`/en/`**

1. Hero：两栏 `1.15fr 1fr`，间距 56px，上下内边距 86px / 92px。左 h1 三行，关键词带 3px 下划线（画线动效）；右导语两段 serif 22px + mono 统计行 `N 文章 · N 精选 · N 标签`。≤760px 单栏。
2. 作品与文章：区块头（h2 + 右侧「全部 →」）；三张沙色卡，取 `getFeaturedProjects(2)` + 最新文章补足到 3 张；卡的 `.rows` 为 DATE / CATEGORY / DETAILS（DETAILS 放技术栈或标签，带下划线）。≤760px 单栏。
3. 陈述 + 入口清单：两栏 `1fr 1.6fr`。左 h2 sans 600 26px 的陈述句；右细线行五条：文章、作品、工具、关于、RSS，每行右侧 mono 计数或说明（`N 篇`、`N 个`、`N 项`、`→`、`feed.xml`）。
4. 页脚。

**文章列表 `/blog`、`/en/blog`**：mono 标签 `Writing · N 篇` → h1「文章」→ 搜索框 → 按年分组，每组年份 mono 标签 + 细线行（左 mono 日期 `YYYY.MM.DD`，中 sans 标题 + serif 一句摘要，右 mono 标签）。搜索有输入时只显示结果行，样式同列表行。

**文章页 `/blog/[slug]`**：「← 文章」mono 返回链接 → h1 → serif 导语（`excerpt`，没有则不渲染）→ 两栏 `220px 1fr`（≤900px 单栏，元数据在正文前、目录不显示）：左列 `.rows` DATE / CATEGORY（第一个 tag，没有则省略该行）/ READING / TAGS，下方目录（mono 标签「目录」+ h2/h3 列表，h3 缩进，当前项左竖线 1.5px `--fg`）；右列 `.prose`。正文后：「继续阅读」细线上边 + 两张沙色小卡（上一篇 / 下一篇，缺则用最新作品补）→ 评论区（mono 标签 `Comments · Giscus` + Giscus）。阅读进度：顶栏上沿 2px `--fg` 线，宽度随滚动 0→100%。

**作品列表 `/projects`**：mono 标签 `Selected Work · N` → h1 → 两栏卡网格（≤760px 单栏）。卡：顶部封面 16:9（有 `cover` 显示图片，`object-fit: cover`；没有则 `#d6cbb8`（暗色 `#1f1f1c`）底 + 大号 serif 首字母）→ h3 → 说明 → `.rows` YEAR / STACK。悬停封面 `scale(1.02)` 600ms。

**作品详情 `/projects/[slug]`**：「← 作品」→ h1 → 导语（`description`）→ pill 组（访问站点 / 查看源码，有则显示）→ 封面（有则显示，圆角 12px）→ `.prose` → 「相关作品」两张沙色小卡。

**标签页 `/tags`、`/tags/[tag]`**：`/tags` 为细线行列表，每行标签名（sans）+ 右侧 mono 计数；`/tags/[tag]` 复用文章列表的行。

**工具页 `/tools`**：h1 → 四个分区，每区 mono 标签（英文名）+ h2 中文名 + 细线行（左 sans 名称 + serif 说明，右 mono 状态 `RUNNING / LOCAL / LAB / DAILY` 和 tag）。去掉彩色圆点和卡片。

**关于页 `/about`**：头像 88px 圆形 + 右侧 h1 + serif 副标题 → 「我是谁」`.prose` → 「代表作」沙色小卡 → 「我在做什么」三张沙色卡（`about.now`，去掉圆点）→ 「这个站」`.prose` → 「联系」细线行（GitHub + 可选 `contactHtml`）。各节之间用 mono 标签 + 细线分隔。

**404**：h1 sans 700 120px「404」→ serif 一句话 → pill「回到首页 →」。

### 文案配置

页面级文案不再硬编码在页面里，统一进 `lib/i18n.ts` 的 `dict`，按 `zh` / `en` 两份：导航、页面标题与副标题、区块标题、按钮文字、空状态、404 文案、页脚。首页专属文案进 `lib/site.ts`：

```ts
home: {
  zh: {
    headline: ["I'm {Zenix}.", "Test engineer who", "cares about {clean text}."],
    lede: ["你好，我是阿九，一名测试工程师。……", "这里记录……"],
    statement: "想清楚一件事和写清楚一件事是两回事。我写不了多快，但每一篇都想明白了再落笔。",
  },
  en: {
    headline: ["I'm {Zenix}.", "Test engineer who", "cares about {clean text}."],
    lede: ["Hi, I'm Zenix, a test engineer working on FCT / IGBT test systems and host-side automation.", "This site keeps notes from work and study, thoughts on testing and automation, and the occasional slice of life."],
    statement: "Understanding something and writing it down clearly are two different things. I don't write fast, but nothing goes out before I've thought it through.",
  },
}
```

`headline` 每个元素一行，`{...}` 包住的词渲染为下划线词。

## 动效

缓动统一：出场 `cubic-bezier(0.22, 1, 0.36, 1)`（expo-out），悬停 `ease`，切页见下。所有动效只用 `transform`、`opacity`、`clip-path`、`background-size`，不动布局属性。

### 出场编排（首屏）

- `.mask`：`overflow: hidden`，子元素 `translateY(112%) → 0`，900ms。
- `.reveal`：`opacity 0 → 1` + `translateY(12px) → 0`，900ms。
- `.underline-draw`：伪元素 3px 下划线 `scaleX(0) → 1`，`transform-origin: left`，700ms，延迟 500ms。
- 交错：父级 `Stagger` 组件给每个直接子元素写 `style="--i: n"`，CSS `animation-delay: calc(var(--i) * 120ms)`。
- 只在每页首屏（顶栏、h1、导语、元数据、首个区块头）使用；进入页面播一次，之后不再播。

### 滚动跟手（CSS scroll-driven，无 JS）

全部包在 `@supports (animation-timeline: scroll())` 里；不支持时元素直接处于最终态。

- 顶栏：`animation-timeline: scroll(root)`，`animation-range: 0 24px`，补间底色、底线、字标宽度。
- 阅读进度：`.progress` 绝对定位在顶栏上沿，`scaleX` 0→1，`animation-timeline: scroll(root)`，只在文章页渲染。
- 区块浮现：首屏以下的区块加 `.rise`，`animation-timeline: view()`，`animation-range: entry 0% entry 40%`，`opacity 0→1` + `translateY(22px) → 0`。

### 悬停微动（CSS transition，150–250ms）

pill 箭头 `translateX(3px)`；沙色卡 `--card-hover` + `translateY(-2px)`；链接下划线 `background-size` 0→100%；字标 `\` `rotate(12deg)`；封面 `scale(1.02)`。`@media (hover: none)` 下不应用。

### 页面切换（React `<ViewTransition>`）

- 每个页面组件根部包 `<PageTransition>`：内部是 `<ViewTransition enter="page-in" exit="page-out" default="none">`。CSS：旧内容 `opacity 1→0` + `translateY(0 → -12px)` 150ms；新内容延迟 150ms `opacity 0→1` + `translateY(12px → 0)` 260ms。
- 共享元素：文章列表行的标题和文章页 h1 用同一个 `name={`post-${slug}`}`，`share="morph"`，`default="none"`；作品卡 h3 与作品详情 h1 同理 `project-${slug}`。
- 顶栏 `style={{ viewTransitionName: "site-header" }}`，CSS 里 `::view-transition-group(site-header) { animation: none }`，旧快照 `display: none`。
- `::view-transition { pointer-events: none }`。
- 删除 `app/template.tsx`；删除 `book-transition.tsx`。

### 主题切换

点击时给 `<html>` 加 `.theme-switching` 400ms，期间 `color`、`background-color`、`border-color`、`fill`、`stroke` 全部 `transition: 400ms ease`；图标 ☾/☀ 用两层叠放交叉淡入 300ms。切换结束移除类，平时不带 transition，避免滚动时抖动。

### 无障碍降级

`@media (prefers-reduced-motion: reduce)`：所有 `transform`、`clip-path`、`background-size` 动画取消，只保留 `opacity` 且时长 ≤ 200ms；`::view-transition-old/new/group(*)` 时长 0；scroll-driven 区块浮现直接显示；`.theme-switching` 时长 0。不静默跳过——文字必须最终可见。

## 程序怎么分

### 新增

| 路径 | 职责 |
| --- | --- |
| `src/styles/tokens.css` | 颜色、字体、间距 token；`:root` 与 `.dark`；`@theme inline` |
| `src/styles/base.css` | `@font-face`、重置、排版阶梯、`.prose`、代码高亮配色 |
| `src/styles/components.css` | 顶栏、字标、pill、沙色卡、细线行、目录、页脚、搜索框、移动菜单 |
| `src/styles/motion.css` | keyframes、出场类、scroll-driven、View Transitions、主题切换、reduced-motion |
| `src/views/home.tsx` | 首页 UI，`({ lang, posts, projects, tagCount })` |
| `src/views/post-list.tsx` | 文章列表页 UI |
| `src/views/post.tsx` | 文章页 UI，含目录、继续阅读、评论 |
| `src/views/projects.tsx` | 作品列表页 UI |
| `src/views/project.tsx` | 作品详情页 UI |
| `src/views/tags.tsx` | `/tags` 与 `/tags/[tag]` UI |
| `src/views/tools.tsx` | 工具页 UI（数据仍在页面文件里，中英各一份） |
| `src/views/about.tsx` | 关于页 UI |
| `src/views/not-found.tsx` | 404 UI |
| `src/components/page-transition.tsx` | `<ViewTransition>` 包装 |
| `src/components/stagger.tsx` | 给子元素写 `--i` |
| `src/components/site-header.tsx` | 重写：字标、导航、`ZH / EN`、主题、GitHub、移动菜单、进度线 |
| `src/components/mobile-menu.tsx` | ≤640px 的导航展开（client） |
| `src/components/sand-card.tsx` | 沙色卡（h3 / 说明 / rows / pill） |
| `src/components/hair-row.tsx` | 细线行 |
| `src/components/toc.tsx` | 目录渲染 |
| `src/lib/toc.ts` | 从 HTML 抽 h2/h3 → `{ id, text, level }[]`，纯函数 |
| `tests/toc.test.mjs`、`tests/i18n.test.mjs` | `node:test` |

### 改动

| 路径 | 改什么 |
| --- | --- |
| `src/app/globals.css` | 只剩 `@import "tailwindcss"` 和四个 `@import "../styles/*.css"` |
| `src/app/layout.tsx` | 字体预载换成 Sans + Serif；`theme-color` 双值；去掉 `AmbientBackdrop`/`EffectLayer`/`BackButton` |
| `src/app/**/page.tsx`、`src/app/en/**/page.tsx` | 退化为壳：取数据 → 调 `views/*`；`metadata` 保留 |
| `src/app/not-found.tsx` | 调 `views/not-found` |
| `src/lib/i18n.ts` | 字典扩成全站页面文案 |
| `src/lib/site.ts` | 加 `home` 文案 |
| `src/lib/posts.ts` | `renderMarkdown` 加 `rehype-slug`（在 `rehypeSanitize` 之前） |
| `src/components/theme-toggle.tsx` | 换图标与过渡，加 `.theme-switching` |
| `src/components/language-toggle.tsx` | 改为 `ZH / EN` 双字样式 |
| `src/components/nav-link.tsx` | 当前项样式改为底部 1.5px `--fg` 线 |
| `src/components/scroll-spy.tsx` | 目标改为目录项 `.is-active` |
| `src/components/post-search.tsx` | 结果行样式改为细线行 |
| `src/components/site-footer.tsx` | 新样式 |
| `src/components/back-to-top.tsx` | 新样式：右下 36px 方形，`--hair` 边、`↑` mono |
| `src/components/comments.tsx` | 外包一层 mono 标签头；Giscus 主题跟随 `.dark`（`light` / `dark_dimmed`） |
| `scripts/generate-og.mjs` | 配色换成 `#faf9f5` 底、`#141413` 字、`#c6613f` 点缀；字体不变 |
| `package.json` | 加 `rehype-slug`；加 `"test": "node --test tests/"` |
| `.gitignore` | 加 `.superpowers/`（已加） |

### 删除

`src/app/template.tsx`、`src/components/{ink-particles,ripple-fx,prose-tilt,effect-layer,highlight-chars,book-transition,fade-in,reading-progress,back-button,page-header,md-page}.tsx`、`src/hooks/use-in-view.ts`。（`ambient-backdrop`、`hero-entrance`、`theme-transition.ts` 只在 `wip/lux-hero` 分支上有，`master` 上不存在，无需处理。）`md-page` 当前已无引用；`page-header` 由 `views/tags.tsx` 取代后删除。删除前 `rg` 确认无引用。

## 坏状态

- 浏览器不支持 View Transitions：切页直接替换，不报错（React 自行退化）。
- 不支持 scroll-driven animations：顶栏始终带底色和底线，进度线不显示，区块直接可见。
- 字体文件 404：回退系统字体，布局不变（行高用无单位值）。
- 文章没有 h2/h3：目录不渲染，左列只有元数据。
- 项目没有 `cover`：首字母占位。
- 作品不足 2 个或文章为 0：首页三卡按「先精选作品、后最新文章」取到几张算几张，区块最少显示 1 张；都没有则整个区块不渲染。
- `prefers-reduced-motion`：见上，文字必须最终可见。
- JS 未加载：页面静态可读，顶栏滚动态与进度线由 CSS 负责；移动菜单不可展开（可接受，导航在页脚有入口清单）。

## 怎么知道做对了

自动：

- `npx tsc --noEmit` 零错误。
- `npm test`：`tests/toc.test.mjs` 覆盖「h2/h3 抽取、无标题返回空、id 带 `user-content-` 前缀、h3 层级为 3」；`tests/i18n.test.mjs` 覆盖「`switchPath` 四种路径、`dict.zh` 与 `dict.en` key 集合相同」。
- `npm run build` 静态导出成功，`out/` 里存在 `index.html`、`en/index.html`、`blog/hello-im-ajiu/index.html`、`projects/404-found-uk/index.html`、`feed.xml`、`og/default.png`。本机 NTFS 先试；失败则按既定流程在 ext4 `blog-build` 验证。
- `rg -n "ink-particles|ripple-fx|prose-tilt|effect-layer|highlight-chars|book-transition|fade-in|reading-progress|back-button|use-in-view" src` 无结果。
- `wc -l src/styles/*.css` 合计 ≤ 600。

截图回归（存 `docs/superpowers/screens/2026-10-06/`，文件名 `<页面>-<宽度>-<主题>-<语言>.png`）：首页、文章列表、文章页、作品列表、作品详情、工具、关于、404，各 1440 / 390 宽 × 浅 / 暗 × zh / en。对照样稿检查版式、字体、配色。

人工：

- Chrome：列表 → 文章切页时标题从行位移到页首，顶栏不动，切页期间可以点击。
- 滚动：顶栏在 24px 后收成字标并出现底线；文章页进度线随滚动增长；首屏以下区块进入视口浮现。
- 悬停：pill 箭头前移、卡片上浮、链接下划线从左长出。
- 系统开启「减少动态效果」后刷新：无位移、无遮罩升起，所有文字最终可见。
- 主题切换：无闪白，400ms 颜色过渡，图标交叉淡入；刷新后保持。
- `ZH / EN`：在任一页切换后停留在对应语言的同一页。
- ≤640px：「菜单」能展开收起；三卡与两栏都折成单栏。
- Giscus 加载并跟随主题；搜索可用；`/feed.xml` 可访问；Umami 脚本仍在 `<head>`。
- Lighthouse（移动端）性能 ≥ 95。
