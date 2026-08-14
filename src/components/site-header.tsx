"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/lib/site";
import { NavLink } from "./nav-link";
import { SfxToggle } from "./sfx-toggle";
import { LanguageToggle } from "./language-toggle";
import { dict, getLangFromPath } from "@/lib/i18n";

/**
 * 顶栏(Antigravity 式细导航条)。
 * 左:0xff.zone 字符标;中:导航链接;右:语言/音效 + 胶囊主按钮(GitHub)。
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
      className={`sticky top-0 z-40 border-b border-line bg-background/80 backdrop-blur-sm transition-shadow duration-300 ${
        scrolled ? "shadow-[0_1px_0_rgba(255,255,255,0.04)]" : ""
      }`}
    >
      <div
        className={`flex w-full items-center justify-between px-5 transition-all duration-300 sm:px-12 md:px-16 lg:px-20 xl:px-24 ${
          scrolled ? "py-3" : "py-4"
        }`}
      >
        {/* 品牌:0xff.zone 字符标 */}
        <Link
          href="/"
          aria-label="0xff.zone 首页"
          className="group flex items-center gap-2.5 text-foreground"
        >
          <span
            className="inline-block h-2 w-2 rounded-full bg-accent transition-shadow duration-300 group-hover:shadow-[0_0_10px_rgba(0,255,156,0.8)]"
            aria-hidden="true"
          />
          <span className="font-mono text-[15px] font-medium tracking-tight">
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
          <SfxToggle />
          {site.links.github && (
            <a
              href={site.links.github}
              target="_blank"
              rel="noreferrer"
              className="btn-pill btn-primary btn-pill-sm hidden font-mono text-xs sm:inline-flex"
            >
              GitHub
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
