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

        {/* 品牌:莫比乌斯环(∞ 投影)+ 字标 */}
        <Link
          href="/"
          aria-label="0xff.zone 首页"
          className="group flex items-center gap-2.5 text-foreground"
        >
          {/* 空心莫比乌斯带:∞ 形(带子扭转一次的侧面投影),悬停微旋转 */}
          <svg
            viewBox="0 0 24 24"
            width="26"
            height="26"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            className="text-foreground transition-transform duration-700 group-hover:rotate-180"
            aria-hidden="true"
          >
            {/* 左环 + 右环,在中心 (12,12) 交叉,构成莫比乌斯带投影 */}
            <path d="M12 12
                     A 4 6 0 1 1 4 12
                     A 4 6 0 1 1 12 12
                     A 4 6 0 1 1 20 12
                     A 4 6 0 1 1 12 12" />
          </svg>
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
