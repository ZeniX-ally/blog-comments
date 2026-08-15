"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/lib/site";
import { NavLink } from "./nav-link";
import { LanguageToggle } from "./language-toggle";
import { dict, getLangFromPath } from "@/lib/i18n";

/**
 * 顶栏:悬浮液态玻璃胶囊导航条(iOS 26 Liquid Glass 风)。
 * 两端全圆角、高模糊高饱和、内高光光泽;距顶部留空,滚动后玻璃更实。
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
    <header className="sticky top-3 z-40 px-3 sm:top-4 sm:px-6">
      <div
        className={`liquid-glass mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-2.5 transition-all duration-300 sm:px-5 ${
          scrolled ? "is-scrolled" : ""
        }`}
      >
        {/* 品牌:圆点 + 字标 */}
        <Link
          href="/"
          aria-label="0xff.zone 首页"
          className="group flex items-center gap-2.5 text-foreground"
        >
          <span
            className="inline-block h-2 w-2 rounded-full bg-accent transition-transform duration-300 group-hover:scale-125"
            aria-hidden="true"
          />
          <span className="text-[15px] font-semibold tracking-tight">
            0xff.zone
          </span>
        </Link>

        <div className="flex items-center gap-4 sm:gap-6">
          <nav className="hidden items-center gap-6 text-sm sm:flex">
            {nav.map((item) => (
              <NavLink key={item.href} href={item.href}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="hidden h-4 w-px bg-line sm:block" />
          <LanguageToggle />
          {site.links.github && (
            <a
              href={site.links.github}
              target="_blank"
              rel="noreferrer"
              className="btn-pill btn-primary btn-pill-sm hidden text-xs sm:inline-flex"
            >
              GitHub
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
