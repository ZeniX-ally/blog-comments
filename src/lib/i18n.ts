/**
 * 全站双语基础设施。
 * 路由策略:根路径 / = 中文(SEO 主),/en/ 前缀 = 英文。
 * 页面级文案统一进 dict(zh / en 两份,key 必须一一对应,tests/i18n.test.mjs 校验)。
 * 本文件不得 import 任何 JSX / Next 模块,保证 node 可直接加载。
 */
export type Lang = "zh" | "en";

/** 从当前路径推断语言 */
export function getLangFromPath(pathname: string): Lang {
  return pathname.startsWith("/en") ? "en" : "zh";
}

/** 切换到目标语言后保持当前页面的路径 */
export function switchPath(pathname: string, to: Lang): string {
  if (to === "en") {
    return pathname.startsWith("/en") ? pathname : `/en${pathname}`;
  }
  return pathname.replace(/^\/en/, "") || "/";
}

/** 全站 UI 文案字典 */
export const dict = {
  zh: {
    /** 旧 language-toggle 仍在读;Task 2 改为 ZH / EN 双字样式后删除 */
    switchLabel: "EN",
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
  en: {
    switchLabel: "中文",
    nav: [
      { href: "/en/blog", label: "Posts" },
      { href: "/en/tools", label: "Tools" },
      { href: "/en/projects", label: "Projects" },
      { href: "/en/about", label: "About" },
    ],
    header: { github: "GitHub", menu: "Menu", close: "Close", home: "Back to home", themeToDark: "Switch to dark mode", themeToLight: "Switch to light mode", lang: "切换为中文" },
    footer: { rss: "RSS", github: "GitHub" },
    home: { work: "Work & Writing", all: "All", stats: (posts: number, projects: number, tags: number) => `${posts} posts · ${projects} featured · ${tags} tags`,
            entries: { posts: "Posts", projects: "Projects", tools: "Tools", about: "About", rss: "RSS" },
            counts: { posts: (n: number) => `${n} posts`, projects: (n: number) => `${n} projects`, tools: (n: number) => `${n} items` } },
    card: { date: "Date", category: "Category", details: "Details", year: "Year", stack: "Stack", reading: "Reading", tags: "Tags",
            view: "View project", read: "Read", open: "Open", post: "Post", project: "Project" },
    blog: { label: (n: number) => `Writing · ${n}`, title: "Posts", search: "Search titles, excerpts or tags…", noResult: (q: string) => `No posts matching “${q}”.`, empty: "No posts yet.", year: (y: string, n: number) => `${y} · ${n}`, back: "Posts", minutes: (n: number) => `${n} min read`, more: "Keep reading", comments: "Comments · Giscus" },
    projects: { label: (n: number) => `Selected Work · ${n}`, title: "Projects", empty: "No projects yet.", back: "Projects", visit: "Visit site", source: "View source", related: "Related work" },
    tags: { label: "Tags", title: "Tags", count: (n: number) => `${n}`, tagLabel: (n: number) => `${n} posts` },
    tools: { label: "Tools", title: "Tools", sub: "Self-hosted services and everyday tools.", total: (n: number) => `${n} items` },
    about: { who: "Who I am", works: "Selected work", allProjects: "All projects", now: "What I'm doing", site: "This site", contact: "Contact" },
    notFound: { title: "404", text: "This page isn't here, but you found the site.", home: "Back to home" },
  },
} as const;

/** 按语言取字典 */
export function t(lang: Lang) {
  return dict[lang];
}
