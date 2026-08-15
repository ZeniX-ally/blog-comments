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
        className={`liquid-glass mx-auto mt-3 flex w-full max-w-6xl items-center justify-between px-4 py-2.5 transition-all duration-300 sm:mt-4 sm:px-5 ${
          scrolled ? "is-scrolled" : ""
        }`}
      >
        {/* 极光:液态玻璃内缓慢流动的光斑(纯装饰,不拦截事件) */}
        <div className="aurora" aria-hidden="true">
          <span className="aurora-blob aurora-1" />
          <span className="aurora-blob aurora-2" />
          <span className="aurora-blob aurora-3" />
        </div>

        {/* 品牌:0xFF 徽章 + 字标 */}
        <Link
          href="/"
          aria-label="0xff.zone 首页"
          className="group flex items-center gap-2.5 text-foreground"
        >
          {/* 0xFF 图形徽章:近黑圆角方块,绿字,悬停微亮 */}
          <span
            className="relative flex h-7 w-10 items-center justify-center overflow-hidden rounded-[0.6rem] bg-[var(--fg)] shadow-[0_2px_8px_rgba(29,29,31,0.25)] transition-all duration-300 group-hover:shadow-[0_2px_12px_rgba(0,255,156,0.35)]"
            aria-hidden="true"
          >
            <span className="font-mono text-[10px] font-bold tracking-tight text-[#00ff9c]">
              0xFF
            </span>
            {/* 底部极光微光 */}
            <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[rgba(0,255,156,0.35)] to-transparent" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight">
            0xff.zone
          </span>
        </Link>

        <div className="relative z-10 flex items-center gap-4 sm:gap-6">
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
