"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/lib/site";
import { dict, getLangFromPath } from "@/lib/i18n";
import { NavLink } from "./nav-link";
import { LanguageToggle } from "./language-toggle";
import { ThemeToggle } from "./theme-toggle";
import { MobileMenu } from "./mobile-menu";

/** 文章页:/blog/<slug>/ 或 /en/blog/<slug>/ —— 只有这里渲染阅读进度线 */
const POST_PATH = /^\/(en\/)?blog\/[^/]+\/?$/;
/** 字标右半:站点域名(去协议) */
const HOST = site.url.replace(/^https?:\/\//, "").replace(/\/$/, "");

/**
 * 顶栏:sticky。左字标「阿九\404-found.uk」;右侧导航四项、竖线、ZH / EN、☾/☀、GitHub pill。
 * 滚动 24px 后的底色 / 底线 / 字标收缩全部由 motion.css 的 scroll-driven 动画负责,这里不监听 scroll。
 * viewTransitionName 固定为 site-header,切页时顶栏不参与动画(motion.css)。
 */
export function SiteHeader() {
  const pathname = usePathname();
  const lang = getLangFromPath(pathname);
  const d = dict[lang];
  const progress = POST_PATH.test(pathname);

  return (
    <header className="site-header" style={{ viewTransitionName: "site-header" }}>
      <div className="site-header-bar">
        {progress && <div className="site-header-progress" aria-hidden="true" />}
        <Link href={lang === "en" ? "/en/" : "/"} className="wordmark" aria-label={d.header.home}>
          {site.name}
          <b>{"\\"}</b>
          <span>{HOST}</span>
        </Link>
        <div className="site-header-right">
          <nav className="site-nav" aria-label={d.header.nav}>
            {d.nav.map((item) => (
              <NavLink key={item.href} href={item.href}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <span className="site-header-divider" aria-hidden="true" />
          <LanguageToggle />
          <ThemeToggle />
          {site.links.github && (
            <a className="pill" href={site.links.github} target="_blank" rel="noreferrer">
              {d.header.github} <span className="arrow">→</span>
            </a>
          )}
          <MobileMenu items={d.nav} lang={lang} />
        </div>
      </div>
    </header>
  );
}
