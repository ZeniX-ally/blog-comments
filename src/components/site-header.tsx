import Link from "next/link";
import { site } from "@/lib/site";
import { NavLink } from "./nav-link";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-background">
      <div className="flex w-full items-baseline justify-between px-5 py-5 sm:px-8 md:px-12 xl:px-16">
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
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-5">
          <nav className="flex items-baseline gap-6 text-sm">
            <NavLink href="/blog">文章</NavLink>
            <NavLink href="/projects">作品</NavLink>
            <NavLink href="/about">关于</NavLink>
          </nav>
          <span className="hidden h-4 w-px bg-line sm:block" />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
