import Link from "next/link";
import { site } from "@/lib/site";
import { NavLink } from "./nav-link";
import { ThemeToggle } from "./theme-toggle";

function HomeIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

export function SiteHeader() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex w-full max-w-5xl items-baseline justify-between px-6 py-5 lg:px-10">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            aria-label="返回首页"
            className="text-muted transition-colors hover:text-foreground"
          >
            <HomeIcon />
          </Link>
          <Link
            href="/"
            className="font-serif text-lg font-semibold tracking-tight transition-colors hover:text-accent"
          >
            {site.name}
          </Link>
        </div>
        <div className="flex items-center gap-5">
          <nav className="flex items-baseline gap-6 text-sm">
            <NavLink href="/blog">文章</NavLink>
            <NavLink href="/projects">作品</NavLink>
            <NavLink href="/about">关于</NavLink>
          </nav>
          <span className="h-4 w-px bg-line" />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
