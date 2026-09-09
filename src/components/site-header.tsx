"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/lib/site";
import { NavLink } from "./nav-link";
import { LanguageToggle } from "./language-toggle";
import { ThemeToggle } from "./theme-toggle";
import { dict, getLangFromPath } from "@/lib/i18n";

/**
 * 顶栏:悬浮液态玻璃胶囊导航条(iOS 26 Liquid Glass 风)。
 * fixed 固定定位,不随滚动移动;距顶部留空,滚动后玻璃更实。
 * 左:圆点 + 站点字标;中:导航链接;右:语言切换 + GitHub 按钮。
 */
export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const lang = getLangFromPath(pathname);
  const nav = dict[lang].nav;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-40 px-3 sm:px-6">
      <div
        className={`liquid-glass mx-auto mt-3 flex h-14 w-full max-w-[72.5rem] items-center justify-between px-4 transition-all duration-300 sm:mt-4 sm:h-16 sm:px-5 ${
          scrolled ? "is-scrolled" : ""
        }`}
      >
        {/* 极光:液态玻璃内缓慢流动的光斑(纯装饰,不拦截事件) */}
        <div className="aurora" aria-hidden="true">
          <span className="aurora-blob aurora-1" />
          <span className="aurora-blob aurora-2" />
          <span className="aurora-blob aurora-3" />
        </div>

        {/* 品牌:无限符号 ∞(单线连续),无文字 */}
        <Link
          href="/"
          aria-label="返回首页"
          className="group flex items-center gap-2.5 text-foreground"
        >
          {/* 标准 ∞:一条连续线贯穿左右环,中心交叉 */}
          <svg
            viewBox="0 0 24 24"
            width="30"
            height="30"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            className="text-foreground transition-transform duration-700 group-hover:rotate-180"
            aria-hidden="true"
          >
            <path d="M12 12
                     C 12 7.5 14.5 5 17 5
                     C 19.5 5 21.5 7 21.5 9.5
                     C 21.5 12 19.5 14 17 14
                     C 14.5 14 13 12.5 12 12
                     C 11 10.5 9.5 9 7 9
                     C 4.5 9 2.5 11 2.5 13.5
                     C 2.5 16 4.5 18 7 18
                     C 9.5 18 11 16.5 12 12" />
          </svg>
        </Link>

        <div className="relative z-10 flex items-center gap-4 sm:gap-6">
          <nav className="site-nav hidden items-center gap-6 sm:flex">
            {nav.map((item) => (
              <NavLink key={item.href} href={item.href}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="hidden h-4 w-px bg-line sm:block" />
          <ThemeToggle />
          <LanguageToggle />
          {site.links.github && (
            <a
              href={site.links.github}
              target="_blank"
              rel="noreferrer"
              className="btn-pill btn-primary btn-pill-sm hidden text-xs sm:inline-flex dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              GitHub
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
