/**
 * 全站双语基础设施(2026-08-12 重做,此前实现因未入库被构建同步误删)。
 * 路由策略:根路径 / = 中文(SEO 主),/en/ 前缀 = 英文。
 * 页面级文案在各自页面硬编码;这里只管顶栏导航等共享 UI 文案与路径工具。
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

/** 共享 UI 文案字典(顶栏导航等) */
export const dict = {
  zh: {
    switchLabel: "EN",
    nav: [
      { href: "/blog", label: "文章" },
      { href: "/tools", label: "工具" },
      { href: "/projects", label: "作品" },
      { href: "/about", label: "关于" },
    ],
  },
  en: {
    switchLabel: "中文",
    nav: [
      { href: "/en/blog", label: "Posts" },
      { href: "/en/tools", label: "Tools" },
      { href: "/en/projects", label: "Projects" },
      { href: "/en/about", label: "About" },
    ],
  },
} as const;

/** 按语言取字典 */
export function t(lang: Lang) {
  return dict[lang];
}
