"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** 顶栏导航链接:当前栏目加 aria-current="page" 与 .is-active(底部 1.5px --fg 线) */
export function NavLink({ href, children }: { href: string; children: ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={active ? "nav-link is-active" : "nav-link"}
    >
      {children}
    </Link>
  );
}
