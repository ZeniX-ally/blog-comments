"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/lib/site";
import { NavLink } from "./nav-link";
import { ThemeToggle } from "./theme-toggle";
import { SfxToggle } from "./sfx-toggle";
import { LanguageToggle } from "./language-toggle";
import { dict, getLangFromPath } from "@/lib/i18n";

/**
 * 顶栏。滚动超过 8px 时收紧(py 5→3)+ 极淡底影,给阅读节奏一个克制的反馈。
 * 导航文案按当前语言切换(zh/en)。
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
    <header
      className={`sticky top-0 z-40 border-b border-line bg-background transition-shadow duration-300 ${
        scrolled ? "shadow-[0_1px_0_rgba(25,25,25,0.04)]" : ""
      }`}
    >
      <div
        className={`flex w-full items-baseline justify-between px-5 transition-all duration-300 sm:px-8 md:px-12 xl:px-16 ${
          scrolled ? "py-3" : "py-5"
        }`}
      >
        <div className="flex items-center gap-3">
          <Link
            href="/"
            aria-label="返回首页"
            className="flex items-center gap-3 text-foreground transition-opacity hover:opacity-70"
          >
            {/* 品牌标记:Tan 圆点,克制不张扬 */}
            <span className="inline-block h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
            <span className="font-display text-lg font-normal tracking-tight">
              {site.name}
              <span className="ml-[0.35em]">。</span>
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-5">
          <nav className="flex items-center gap-5 text-sm">
            {nav.map((item) => (
              <NavLink key={item.href} href={item.href}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <span className="hidden h-4 w-px bg-line sm:block" />
          <LanguageToggle />
          <SfxToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
