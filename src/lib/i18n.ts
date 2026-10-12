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

/** 英文单复数:1 post / 2 posts(只处理规则复数) */
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

/** 全站 UI 文案字典 */
export const dict = {
  zh: {
    nav: [
      { href: "/projects", label: "作品" },
      { href: "/about", label: "关于" },
      { href: "/blog", label: "文章" },
      { href: "/tools", label: "工具" },
      { href: "/gongyi", label: "公益接口" },
    ],
    header: { github: "GitHub", menu: "菜单", close: "关闭", home: "返回首页", nav: "主导航", top: "回到顶部", themeToDark: "切换为暗色模式", themeToLight: "切换为浅色模式", lang: "Switch to English", gitea: "代码仓库", dashboard: "控制台" },
    footer: { rss: "RSS", github: "GitHub" },
    home: { work: "作品与文章", all: "全部", stats: (posts: number, projects: number, tags: number) => `${posts} 文章 · ${projects} 精选 · ${tags} 标签`,
            entries: { posts: "文章", projects: "作品", tools: "工具", about: "关于", rss: "RSS" },
            counts: { posts: (n: number) => `${n} 篇`, projects: (n: number) => `${n} 个`, tools: (n: number) => `${n} 项` } },
    card: { date: "Date", category: "Category", details: "Details", year: "Year", stack: "Stack", reading: "Reading", tags: "Tags",
            view: "查看项目", read: "阅读", open: "打开", post: "文章", project: "作品" },
    blog: { label: (n: number) => `Writing · ${n} 篇`, title: "文章", search: "搜索标题、摘要或标签…", noResult: (q: string) => `没有找到与「${q}」相关的文章。`, empty: "还没有文章。", year: (y: string, n: number) => `${y} · ${n} 篇`, back: "文章", minutes: (n: number) => `约 ${n} 分钟`, toc: "目录", more: "继续阅读", comments: "Comments · Giscus" },
    projects: { label: (n: number) => `Selected Work · ${n}`, title: "作品", empty: "还没有作品。", back: "作品", visit: "访问站点", source: "查看源码", related: "相关作品" },
    tags: { label: "Tags", title: "标签", count: (n: number) => `${n} 篇`, tagLabel: (n: number) => `共 ${n} 篇文章`, empty: "还没有标签。" },
    tools: { label: "Tools", title: "工具清单", sub: "自建服务与常用工具。", total: (n: number) => `${n} 项` },
    about: { who: "我是谁", works: "代表作", allProjects: "全部项目", now: "我在做什么", site: "这个站", contact: "联系" },
    gongyi: {
      label: "Gongyi",
      cta: "申请邀请码",
      what: "这是什么",
      gain: "能拿到什么",
      how: "怎么用",
      rules: "规则书",
      form: {
        label: "申请邀请码",
        luserLabel: "L站用户 ID",
        luserPlaceholder: "linux.do 用户名，或数字 ID",
        emailLabel: "邮箱",
        placeholder: "you@example.com",
        reasonLabel: "申请原因（10–300 字）",
        reasonPlaceholder: "说说你打算拿它做什么，以及为什么需要它。",
        agreeLabel: "我已阅读并同意规则书",
        submit: "申请邀请码",
        submitting: "提交中…",
        success: "已收到，我会尽快把邀请码发到这个邮箱，注意查收垃圾邮件。",
        invalidEmail: "请填一个能收信的邮箱。",
        invalidLuser: "请填 linux.do 的用户名或数字 ID。",
        invalidReason: "申请原因请写 10–300 字。",
        rateLimited: "提交太频繁了，请稍后再试。",
        failed: "提交失败，请稍后重试。",
        privacy: "邮箱只用于发送邀请码，可随时要求我删除。",
      },
    },
    notFound: { title: "404", text: "这一页没找到，但你找到了这个站。", home: "回到首页" },
  },
  en: {
    nav: [
      { href: "/en/blog", label: "Posts" },
      { href: "/en/tools", label: "Tools" },
      { href: "/en/projects", label: "Projects" },
      { href: "/en/about", label: "About" },
      { href: "/en/gongyi", label: "Free API" },
    ],
    header: { github: "GitHub", menu: "Menu", close: "Close", home: "Back to home", nav: "Main navigation", top: "Back to top", themeToDark: "Switch to dark mode", themeToLight: "Switch to light mode", lang: "切换为中文", gitea: "Gitea", dashboard: "Dashboard" },
    footer: { rss: "RSS", github: "GitHub" },
    home: { work: "Work & Writing", all: "All", stats: (posts: number, projects: number, tags: number) => `${plural(posts, "post")} · ${projects} featured · ${plural(tags, "tag")}`,
            entries: { posts: "Posts", projects: "Projects", tools: "Tools", about: "About", rss: "RSS" },
            counts: { posts: (n: number) => plural(n, "post"), projects: (n: number) => plural(n, "project"), tools: (n: number) => plural(n, "tool") } },
    card: { date: "Date", category: "Category", details: "Details", year: "Year", stack: "Stack", reading: "Reading", tags: "Tags",
            view: "View project", read: "Read", open: "Open", post: "Post", project: "Project" },
    blog: { label: (n: number) => `Writing · ${n}`, title: "Posts", search: "Search titles, excerpts or tags…", noResult: (q: string) => `No posts matching “${q}”.`, empty: "No posts yet.", year: (y: string, n: number) => `${y} · ${n}`, back: "Posts", minutes: (n: number) => `${n} min read`, toc: "Contents", more: "Keep reading", comments: "Comments · Giscus" },
    projects: { label: (n: number) => `Selected Work · ${n}`, title: "Projects", empty: "No projects yet.", back: "Projects", visit: "Visit site", source: "View source", related: "Related work" },
    tags: { label: "Tags", title: "Tags", count: (n: number) => `${n}`, tagLabel: (n: number) => plural(n, "post"), empty: "No tags yet." },
    tools: { label: "Tools", title: "Tools", sub: "Self-hosted services and everyday tools.", total: (n: number) => plural(n, "item") },
    about: { who: "Who I am", works: "Selected work", allProjects: "All projects", now: "What I'm doing", site: "This site", contact: "Contact" },
    gongyi: {
      label: "Gongyi",
      cta: "Request an invite",
      what: "What this is",
      gain: "What you get",
      how: "How it works",
      rules: "Rulebook",
      form: {
        label: "Request an invite",
        luserLabel: "linux.do user ID",
        luserPlaceholder: "linux.do username or numeric ID",
        emailLabel: "Email",
        placeholder: "you@example.com",
        reasonLabel: "Why do you want access? (10–300 characters)",
        reasonPlaceholder: "What do you plan to use it for, and why do you need it?",
        agreeLabel: "I have read and agree to the rulebook",
        submit: "Request an invite",
        submitting: "Sending…",
        success: "Got it. I'll email the invite code to this address — check your spam folder too.",
        invalidEmail: "Please enter an address that can receive mail.",
        invalidLuser: "Please enter your linux.do username or numeric ID.",
        invalidReason: "Please write 10–300 characters for your reason.",
        rateLimited: "Too many requests. Please try again later.",
        failed: "Submission failed. Please try again later.",
        privacy: "The address is only used to send the invite code; I'll delete it on request.",
      },
    },
    notFound: { title: "404", text: "This page isn't here, but you found the site.", home: "Back to home" },
  },
} as const;

/** 按语言取字典 */
export function t(lang: Lang) {
  return dict[lang];
}
