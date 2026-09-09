"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** 导航链接:当前栏目标题保持前景色,其余为弱化色,hover 时恢复 */
export function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);
  const label = typeof children === "string" ? children : "";
  const emphasize = label === "作品" || label === "Projects";

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`nav-underline transition-colors duration-200 ${
        emphasize ? "font-semibold" : "font-normal"
      } ${active ? "text-accent-strong" : "text-muted hover:text-foreground"}`}
    >
      {children}
    </Link>
  );
}
